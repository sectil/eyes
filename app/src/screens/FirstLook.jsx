import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Camera, Hand } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { indicesFromConnections } from '../lib/distance.js'
import { eyeOpenness } from '../lib/blink.js'
import { readingBlinkCounter, cameraCounter } from '../lib/blinkCounters.js'
import { tokenize, msPerWord, wordAt, wordsRead, longestGap, gapQuote, pauseShare } from '../lib/firstLook.js'
import { firstLookContent } from '../lib/firstLookText.js'
import { median } from '../lib/trend.js'
import { haptic } from '../lib/native.js'
import '../styles/profile.css'

// İlk 20 sn (Artifact "Nefona İlk Bakış", onaylı): form yerine bir farkındalık anı. Kişi kısa bir yazı okur; okuduğu
// kelime sarıyla ilerler, üstte hız yazar. Kamera göz kapaklarını sayar; sayı okurken gizli (görürse kırpmaya dikkat
// eder). Sonuçta kişinin kendi kırpma çizgisi: her kırpma bir nokta, en uzun kırpmasız ara altın çizgi ve o arada
// okuduğu satırlar. Norm ya da "az/çok" yargısı yok. Kamera yoksa ya da izin verilmezse kişi her kırpışta ekrana dokunur.
// Görüntü kaydedilmez; yalnız sayı saklanır (lib/profile.js firstLook). Yazılar lib/firstLookText.js (dil başına).
// Dayanak: tablette okurken kırpma dakikada ~20'den ~15'e düştü (Abusharha 2017, DOI 10.2147/OPTO.S142718);
// okurken kırpmalar noktalamalarda sıklaşır (Cornelis 2025, DOI 10.1038/s41598-025-04839-y).
export const LOOK_SEC = 20
const TOTAL_MS = LOOK_SEC * 1000
const DEV = import.meta.env?.VITE_APP_BUILD === 'dev' // telefona doğrudan kurulum (scripts/device-run.sh)
const BASELINE_MS = 2000
const CAMERA_WAIT_MS = 8000 // kamera bu sürede hazır olmazsa dokunarak sayıma geçilir (VARSAYIM)

const C = firstLookContent()
const U = C.ui
const TOKENS = tokenize(C.text, C.locale)
const MS = msPerWord(C.wpm)
const FIRST_SENTENCE = (() => {
  const end = TOKENS.findIndex((t) => /[.!?。！？]/u.test(t.tail))
  return TOKENS.slice(0, end < 0 ? TOKENS.length : end + 1)
})()
const num1 = new Intl.NumberFormat(C.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const num0 = new Intl.NumberFormat(C.locale)

// Altın odak köşeleri (hoş geldin ekranındaki Enif köşeleriyle aynı dil)
const Corners = () => (
  <>
    <i className="fl-k k-ts" aria-hidden="true" />
    <i className="fl-k k-te" aria-hidden="true" />
    <i className="fl-k k-bs" aria-hidden="true" />
    <i className="fl-k k-be" aria-hidden="true" />
  </>
)

function Ring({ left }) {
  const r = 23
  const c = 2 * Math.PI * r
  return (
    <svg className="fl-ring" viewBox="0 0 56 56" aria-hidden="true">
      <circle className="t" cx="28" cy="28" r={r} />
      <circle className="f" cx="28" cy="28" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - left / LOOK_SEC)} transform="rotate(-90 28 28)" />
      <text x="28" y="33" textAnchor="middle">{left}</text>
    </svg>
  )
}

// 20 sn'lik kırpma çizgisi: noktalar kırpmalar, altın parça en uzun kırpmasız ara
function Timeline({ times, gap }) {
  const pct = (t) => `${(t / TOTAL_MS) * 100}%`
  const [a, b] = gap
  const mid = Math.min(80, Math.max(20, ((a + b) / 2 / TOTAL_MS) * 100))
  const label = times.length ? U.gap(num1.format((b - a) / 1000)) : U.noBlink(num0.format(LOOK_SEC))
  return (
    <div className="fl-tline" aria-hidden="true">
      <div className="track" />
      <div className="gap" style={{ insetInlineStart: pct(a), inlineSize: pct(b - a) }} />
      <b className="lbl" style={{ insetInlineStart: `${mid}%` }}>{label}</b>
      {times.slice(0, 80).map((t, i) => <i key={i} className="dot" style={{ insetInlineStart: pct(t) }} />)}
      {[0, 5, 10, 15, 20].map((s) => <span key={s} className="ax" style={{ insetInlineStart: pct(s * 1000) }}>{num0.format(s)}</span>)}
    </div>
  )
}

// bar: kurulum ilerleme payı [başlangıç, bitiş] ya da null (çubuk yok: ilk açılışta hesaptan önce, lib/setupFlow.js;
// üstteki boşluk kalır, yerleşim kaymaz); onDone({ blinks, seconds, method, date })
export default function FirstLook({ trueDepth = false, bar = [0, 0.2], onDone }) {
  const [phase, setPhase] = useState('intro') // intro | look | tap | result
  const [method, setMethod] = useState(null) // 'truedepth' | 'camera' | 'self'
  const [left, setLeft] = useState(LOOK_SEC)
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false) // sayım başladı (kamera: temel ölçümden sonra; dokunma: ilk dokunuşta)
  const [hi, setHi] = useState(-1) // sarı kelime
  const [note, setNote] = useState(null)
  const [diag, setDiag] = useState(null) // geliştirme derlemesi: sayaç tanısı (kare/sn, taban, doruklar)
  const [times, setTimes] = useState([]) // sonuç: kırpma anları (ms, sayım başından)
  const counter = useRef(null)
  const base = useRef([])
  const idx = useRef(null)
  const stage = useRef('off') // off | baseline | run
  const countRef = useRef(0)
  const timesRef = useRef([])
  const startAt = useRef(0)
  const nowRef = useRef(null)

  const counted = () => {
    countRef.current += 1
    timesRef.current.push(Date.now() - startAt.current)
  }

  const cam = useFaceTracking({
    enabled: phase === 'look',
    trueDepth,
    onFrame: (m) => {
      if (m.native) {
        if (!m.face || m.blinkLeft == null) return
        const closure = (m.blinkLeft + m.blinkRight) / 2
        if (stage.current === 'baseline') base.current.push(1 - closure)
        else if (stage.current === 'run' && counter.current?.push(closure, m.ts)) counted()
        return
      }
      if (!m.landmarks) return
      if (!idx.current) idx.current = { l: indicesFromConnections(m.ctx.leftEye), r: indicesFromConnections(m.ctx.rightEye) }
      const vals = [eyeOpenness(m.landmarks, idx.current.l), eyeOpenness(m.landmarks, idx.current.r)].filter((v) => v != null)
      if (!vals.length) return
      const o = vals.reduce((a, b) => a + b, 0) / vals.length
      if (stage.current === 'baseline') base.current.push(o)
      else if (stage.current === 'run' && counter.current?.push(o, m.ts)) counted()
    },
  })

  // Kamera hazır → 2 sn temel açıklık → 20 sn sayım. Hata ya da gecikmede dokunarak sayıma geç.
  useEffect(() => {
    if (phase !== 'look') return undefined
    if (cam.error) {
      setNote(U.camError)
      setPhase('tap')
      return undefined
    }
    if (!cam.ready) {
      const t = setTimeout(() => {
        setNote(U.camLate)
        setPhase('tap')
      }, CAMERA_WAIT_MS)
      return () => clearTimeout(t)
    }
    if (stage.current !== 'off') return undefined
    stage.current = 'baseline'
    base.current = []
    const t = setTimeout(() => {
      const b = median(base.current)
      if (!b) {
        setNote(U.noFace)
        stage.current = 'off'
        setPhase('tap')
        return
      }
      // TrueDepth: okumaya dayanıklı sayaç (aşağı bakışta kalkan taban, hızlı kırpma) — debug-firstlook, Bug 16
      counter.current = cam.native ? readingBlinkCounter(1 - b) : cameraCounter(b)
      countRef.current = 0
      timesRef.current = []
      startAt.current = Date.now()
      stage.current = 'run'
      setMethod(cam.native ? 'truedepth' : 'camera')
      setRunning(true)
    }, BASELINE_MS)
    return () => clearTimeout(t)
  }, [phase, cam.ready, cam.error, cam.native])

  // 20 sn geri sayım + sarı kelime (okuma: kamera sayımında)
  useEffect(() => {
    if (!running) return undefined
    setLeft(LOOK_SEC)
    const reading = phase === 'look'
    const id = setInterval(() => {
      const el = Date.now() - startAt.current
      if (reading) setHi(wordAt(Math.min(el, TOTAL_MS), MS, TOKENS.length))
      const l = Math.max(0, LOOK_SEC - Math.floor(el / 1000))
      setLeft(l)
      if (l === 0) {
        clearInterval(id)
        stage.current = 'off'
        setDiag(counter.current?.stats?.() ?? null)
        setCount(countRef.current)
        setTimes(timesRef.current.filter((t) => t <= TOTAL_MS))
        setRunning(false)
        haptic('success')
        setPhase('result')
      }
    }, 50)
    return () => clearInterval(id)
  }, [running])

  // Uzun metin küçük ekranda taşarsa sarı kelime görünür kalsın
  useEffect(() => {
    nowRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [hi])

  const tap = () => {
    if (phase !== 'tap') return
    if (!running) {
      countRef.current = 0
      timesRef.current = []
      startAt.current = Date.now()
      setMethod('self')
      setRunning(true)
    }
    counted()
    setCount(countRef.current)
    haptic('tick')
  }

  const frac = { intro: 0, look: 0.35, tap: 0.35, result: 1 }[phase]
  const barValue = bar ? bar[0] + (bar[1] - bar[0]) * frac : 0

  const res = useMemo(() => {
    if (phase !== 'result') return null
    const gap = longestGap(times, TOTAL_MS)
    const reading = method !== 'self'
    const quote = reading ? gapQuote(TOKENS, gap, MS, { readMs: TOTAL_MS }) : null
    const pause = reading && times.length ? pauseShare(times, TOKENS, MS, TOTAL_MS) : null
    return { gap, reading, quote: quote && quote.words >= 3 ? quote : null, pause: pause?.notable ? pause : null }
  }, [phase, times, method])

  if (phase === 'result') {
    const { gap, reading, quote, pause } = res
    return (
      <main className="screen fade-in oq fl" dir={C.dir} lang={C.locale}>
        <div className="oq-top">{bar && <ProgressBar value={barValue} />}</div>
        <span className="oq-ey">{U.resultEyebrow}</span>
        <div className="fl-big">
          <strong>{num0.format(count)}</strong>
          <span>{U.times}{method === 'self' && <small>{U.selfTag}</small>}</span>
        </div>
        <Timeline times={times} gap={gap} />
        {quote && (
          <figure className="fl-quote">
            <Corners />
            <figcaption>{U.quoteTitle}</figcaption>
            <blockquote>{quote.cutStart ? '…' : ''}{quote.text}{quote.cutEnd ? '…' : ''}</blockquote>
          </figure>
        )}
        {pause && <p className="fl-pause">{U.pauseLine(num0.format(pause.near))}</p>}
        {reading && (
          <dl className="fl-facts">
            <div><dt>{U.pace}</dt><dd>{num0.format(C.wpm)}</dd></div>
            <div><dt>{U.wordsRead}</dt><dd>{num0.format(wordsRead(TOTAL_MS, MS, TOKENS.length))}</dd></div>
            <div><dt>{U.longest}</dt><dd>{U.sec(num1.format((gap[1] - gap[0]) / 1000))}</dd></div>
          </dl>
        )}
        <div className="grow" />
        <p className="oq-src">{U.source(reading ? C.textSource : null, !!pause)}</p>
        {DEV && diag && <p className="oq-src" style={{ fontFamily: 'var(--font-mono)' }}>tanı · {diag.fps} kare/sn · taban {diag.base} · doruklar {diag.peaks.join(' ') || '—'}</p>}
        <button type="button" className="btn" onClick={() => onDone({ blinks: count, seconds: LOOK_SEC, method: method ?? 'self', date: new Date().toISOString() })}>
          {U.next} <ArrowRight size={18} aria-hidden="true" className="fl-arrow" />
        </button>
      </main>
    )
  }

  if (phase === 'tap') {
    return (
      <main className="screen fade-in oq fl" dir={C.dir} lang={C.locale}>
        <div className="oq-top">{bar && <ProgressBar value={barValue} />}</div>
        <span className="oq-ey">{U.tapEyebrow}</span>
        <h1 className="oq-q">{U.tapTitle}</h1>
        {note && <p className="oq-sub">{note}</p>}
        <button type="button" className="fl-tap" onPointerDown={(e) => { e.preventDefault(); tap() }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap() } }}>
          <span>
            <b>{num0.format(count)}</b>
            <span>{running ? U.tapLeft(num0.format(left)) : U.tapFirst}</span>
          </span>
        </button>
        <p className="oq-src">{U.tapNote}</p>
      </main>
    )
  }

  if (phase === 'look') {
    return (
      <main className="screen fade-in oq fl" dir={C.dir} lang={C.locale}>
        <div className="oq-top">{bar && <ProgressBar value={barValue} />}</div>
        {!cam.native && <video ref={cam.videoRef} className="fl-cam" playsInline muted />}
        <div className="fl-meta">
          <Ring left={running ? left : LOOK_SEC} />
          <p className="fl-hint">{running ? U.follow : cam.ready ? U.getReady : U.camPreparing}</p>
          <span className="fl-chip"><b>{num0.format(C.wpm)}</b>{U.pace}</span>
        </div>
        <p className={`fl-read${running ? ' on' : ''}`}>
          {TOKENS.map((t, i) => (
            <span key={i}>
              <span className={i < hi ? 'w done' : i === hi ? 'w now' : 'w'} ref={i === hi ? nowRef : undefined}>{t.word}</span>
              <span className={i < hi ? 'done' : undefined}>{t.tail}</span>
            </span>
          ))}
        </p>
        <div className="grow" />
        <p className="oq-src">{U.hiddenNote}</p>
      </main>
    )
  }

  return (
    <main className="screen fade-in oq fl" dir={C.dir} lang={C.locale}>
      <div className="oq-top">{bar && <ProgressBar value={barValue} />}</div>
      <span className="oq-ey">{U.introEyebrow}</span>
      <h1 className="oq-q">{U.introTitle}</h1>
      <p className="oq-sub">{U.introSub}</p>
      <div className="fl-teaser" aria-hidden="true">
        <p className="fl-read">
          {FIRST_SENTENCE.map((t, i) => (
            <span key={i}>
              {i === C.focus ? <span className="fl-focus"><span className="w now">{t.word}</span><Corners /></span> : t.word}
              {i === FIRST_SENTENCE.length - 1 ? t.tail.trimEnd() : t.tail}
            </span>
          ))}
        </p>
      </div>
      <p className="oq-src">{U.privacy}</p>
      <button type="button" className="btn" onClick={() => setPhase('look')}>
        <Camera size={18} aria-hidden="true" /> {U.start}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setPhase('tap')}>
        <Hand size={18} aria-hidden="true" /> {U.selfCount}
      </button>
    </main>
  )
}
