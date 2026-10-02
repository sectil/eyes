import { useEffect, useRef, useState } from 'react'
import { X, Play, Check, RotateCcw, ChevronLeft } from 'lucide-react'
import { IrisMark, Ring } from '../components/ui.jsx'
import NightScene from '../components/NightScene.jsx'
import StepCards from '../components/StepCards.jsx'
import { BreathTapArt, BreathHoldArt, LostCountArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { haptic } from '../lib/native.js'
import {
  createBreathCounter, nextProbeAt, durationFor, makeRecord, resultText, bcTrend,
  LONG_PRESS_MS, MW_SCALE, SET_SIZE, DURATIONS_SEC,
} from '../lib/breathCount.js'
import '../styles/breathcount.css'

// Son 20 sn içinde yeni sorgu açılmaz (VARSAYIM: bitişe sıkışan sorgu yanıtlanamaz)
const PROBE_TAIL_MS = 20000
const HINT_MS = 1600
const RIPPLE_MS = 3400
const MW_LABEL = { 1: 'Tamamen nefeste', 6: 'Tamamen başka yerde' }
const PHASE_TEXT = {
  familiarization: 'Alışma dönemi: ilk üç seans yalnızca tanışma; sayılar henüz karşılaştırılmaz.',
  baseline: 'Başlangıç noktan oluşuyor: birkaç seans daha, sonra değişimi izleyebiliriz.',
  tracking: null,
}
const JEV_INTRO = "Nefesini 1'den 9'a say. Her verişte suya dokun, 9'da basılı tut. Sayıyı ben görmem; sen bilirsin."

let rippleSeq = 0

// Sahne (gece göğü + su) sayıyı göstermez: Levinson 2014 protokolü korunur. Sahne yalnızca dokunuşa cevap verir.
// VARSAYIM: gökteki yıldız = uzun basışla kapanan set (doğruluk değil); doğruluk yalnızca sonuçta görünür.
export default function BreathCount({ sessions = [], onBack, onFinish }) {
  const [phase, setPhase] = useState('intro') // intro | run | result
  const [howto, setHowto] = useState(() => !howtoSeen('breath-count'))
  const [seconds, setSeconds] = useState(() => durationFor(sessions))
  const [probe, setProbe] = useState(null) // null | { step: 'mw' | 'count', mw }
  const [left, setLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [ripples, setRipples] = useState([])
  const [stars, setStars] = useState(0)
  const [hint, setHint] = useState({ text: '', tone: '' })
  const [demo, setDemo] = useState('') // giriş küresi: '' | 'tap' | 'hold'
  const trendBefore = bcTrend(sessions)

  const counter = useRef(null)
  const t0 = useRef(0)
  const probeAt = useRef(0)
  const press = useRef(null) // { at, timer, long, x, y }
  const hintTimer = useRef(null)
  const stage = useRef(null)

  useEffect(() => () => clearTimeout(hintTimer.current), [])

  function say(text, tone = '', ms = HINT_MS) {
    clearTimeout(hintTimer.current)
    setHint({ text, tone })
    if (ms) hintTimer.current = setTimeout(() => setHint({ text: '', tone: '' }), ms)
  }
  function ripple(x, y, extra = {}) {
    const id = ++rippleSeq
    setRipples((r) => [...r.slice(-8), { id, x, y, ...extra }])
    setTimeout(() => setRipples((r) => r.filter((k) => k.id !== id)), RIPPLE_MS)
  }

  function start() {
    counter.current = createBreathCounter()
    t0.current = performance.now()
    probeAt.current = nextProbeAt(t0.current)
    setProbe(null)
    setResult(null)
    setRipples([])
    setStars(0)
    setLeft(seconds)
    setPhase('run')
    say('Nefes ver, suya dokun', '', 0)
    haptic('success')
  }

  // Zamanlayıcı: kalan süre, sorgu zamanı, bitiş
  useEffect(() => {
    if (phase !== 'run') return undefined
    const id = setInterval(() => {
      const now = performance.now()
      const elapsed = now - t0.current
      const remain = Math.max(0, seconds - Math.floor(elapsed / 1000))
      setLeft((p) => (p === remain ? p : remain))
      if (elapsed >= seconds * 1000) {
        clearInterval(id)
        finish()
        return
      }
      if (!counter.current.state.probing && now >= probeAt.current && seconds * 1000 - elapsed > PROBE_TAIL_MS) {
        counter.current.openProbe()
        setProbe({ step: 'mw', mw: null })
        haptic('warning')
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seconds])

  function finish() {
    const sum = counter.current.summary(seconds)
    setResult(sum)
    setPhase('result')
    haptic('success')
  }

  // Dokunuş yüzeyi: kısa dokunuş = 1–8, basılı tutma (≥ LONG_PRESS_MS) = 9. Konum: halka oraya çizilir.
  function pos(e) {
    const r = stage.current?.getBoundingClientRect()
    if (!r) return { x: 50, y: 76 }
    // Su alanının altına (%54+) düşmeyen dokunuşlar da suda halka yapar: y su bandına bağlanır.
    const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.max(58, Math.min(94, ((e.clientY - r.top) / r.height) * 100))
    return { x, y }
  }
  function down(e) {
    if (probe) return
    if (e.target.closest('[data-no-tap]')) return
    e.preventDefault()
    const at = performance.now()
    const p = pos(e)
    const timer = setTimeout(() => {
      press.current = { ...press.current, timer: null, long: true }
      ripple(p.x, p.y, { gold: true })
      say('9 · basılı tut', 'gold')
      haptic('hit') // 9 kabul edildi
    }, LONG_PRESS_MS)
    press.current = { at, timer, long: false, ...p }
  }
  function up() {
    const p = press.current
    if (!p) return
    press.current = null
    if (p.timer) clearTimeout(p.timer)
    const ts = performance.now()
    if (p.long) {
      const st = counter.current.nine(ts)
      setStars(st.nines)
    } else {
      counter.current.tap(ts)
      ripple(p.x, p.y)
      if (hint.text === 'Nefes ver, suya dokun') say('', '', 0)
      haptic('tick')
    }
  }
  function lost() {
    if (probe) return
    counter.current.reset(performance.now())
    ripple(50, 76, { calm: true })
    say("1'den başla", 'warn')
    haptic('warning')
  }
  function answerMw(mw) {
    setProbe({ step: 'count', mw })
  }
  function answerCount(said) {
    counter.current.answerProbe(performance.now(), { mw: probe.mw, said })
    probeAt.current = nextProbeAt(performance.now())
    setProbe(null)
  }

  // Giriş küresi: dokun → dalga, basılı tut → altın (ölçüme sayılmaz)
  function demoDown() {
    const timer = setTimeout(() => { press.current = { timer: null, long: true }; setDemo('hold'); haptic('hit') }, LONG_PRESS_MS)
    press.current = { timer, long: false }
  }
  function demoUp() {
    const p = press.current
    if (!p) return
    press.current = null
    if (p.timer) clearTimeout(p.timer)
    if (!p.long) { setDemo('tap'); haptic('tick') }
    setTimeout(() => setDemo(''), 900)
  }

  if (phase === 'intro' && howto) {
    const cards = [
      { key: 'tap', art: <BreathTapArt />, title: 'Nefes ver, suya bir kez dokun', why: "1'den 9'a say. Ekran sayıyı göstermez; sen bilirsin." },
      { key: 'hold', art: <BreathHoldArt />, title: "9'da basılı tut, titreşimi hisset", why: "Altın halka ve gökte bir yıldız. Sonra 1'den başla." },
      { key: 'lost', art: <LostCountArt />, title: 'Sayıyı kaybettiysen "Kaybettim"', why: 'Hata değil, fark etmenin kendisi. Arada bir soru sorarım; doğru cevap yok.' },
    ]
    return (
      <main className="screen fade-in">
        <StepCards cards={cards} eyebrow="Nefes sayma · nasıl yapılır" finishLabel="Anladım" onFinish={() => setHowto(false)} onDismiss={() => { markHowtoSeen('breath-count'); setHowto(false) }} onClose={onBack} />
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="screen fade-in bc-intro">
        <div className="bc-bar">
          <button type="button" className="btn-icon" onClick={onBack} aria-label="Geri"><ChevronLeft size={22} /></button>
          <span className="muted small">Dikkat ölçümü · {seconds / 60} dk</span>
          <button type="button" className="link-btn" onClick={() => setHowto(true)}>Nasıl?</button>
        </div>
        <div className="bc-jev">
          <IrisMark size={40} />
          <p className="bc-bubble">{JEV_INTRO}</p>
        </div>
        <button
          type="button"
          className={`bc-orb${demo ? ` ${demo}` : ''}`}
          aria-label="Deneme küresi: nefes ver ve dokun, 9 için basılı tut"
          onPointerDown={demoDown}
          onPointerUp={demoUp}
          onPointerCancel={demoUp}
          onPointerLeave={demoUp}
          onContextMenu={(e) => e.preventDefault()}
        />
        <p className="muted small bc-center">{demo === 'hold' ? "9 · altın halka, gökte yıldız" : demo === 'tap' ? 'Suda bir halka. Sayı sende.' : 'Şimdi dene: nefes ver, küreye dokun. 9 için basılı tut.'}</p>
        <div className="bc-durs" role="radiogroup" aria-label="Süre">
          {[DURATIONS_SEC.short, DURATIONS_SEC.standard].map((s) => (
            <button key={s} type="button" role="radio" aria-checked={seconds === s} className={`bc-dur${seconds === s ? ' on' : ''}`} onClick={() => setSeconds(s)}>{s / 60} dk</button>
          ))}
          <span className="muted small">{trendBefore.n < 3 ? 'ilk seanslar kısa' : 'standart 5 dk'}</span>
        </div>
        <button className="btn" onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
        <p className="muted small bc-center">Nefes sayma, farkındalığın davranışla ölçülebilen bir göstergesi (Levinson 2014). Amaç yüksek puan değil, kendi çizgin.</p>
      </main>
    )
  }

  if (phase === 'result') {
    const t = bcTrend([...sessions, makeRecord(result)])
    const phaseText = PHASE_TEXT[t.phase]
    // Halka doğruluğu zaten gösterir; balonda cümle tekrar etmez
    const comment = [resultText(result).replace(/^Doğruluk %[\d.]+\.\s*/, ''), phaseText ?? (t.reference != null
      ? `Referansın %${t.reference}. Son üç seansın ortancası referansın ${t.delta > 0 ? `${t.delta} üstünde` : t.delta < 0 ? `${-t.delta} altında` : 'aynısı'}.`
      : '')].filter(Boolean).join(' ')
    const total = Math.max(result.sets, result.ok)
    return (
      <main className="screen fade-in bc-intro">
        <div className="bc-bar">
          <button type="button" className="btn-icon" onClick={onBack} aria-label="Kapat"><X size={20} /></button>
          <span className="muted small">Nefes sayma · sonuç</span>
          <span style={{ width: 40 }} aria-hidden="true" />
        </div>
        <div className="bc-stars" aria-label={`${result.ok} set tamam, ${total} set`}>
          {Array.from({ length: Math.max(total, 1) }, (_, i) => <i key={i} className={i < result.ok ? 'lit' : ''} />)}
        </div>
        <div className="bc-ring">
          <Ring value={result.accuracy ?? 0} max={100} size={150} stroke={12}>
            <strong>{result.accuracy == null ? '—' : `%${Math.round(result.accuracy)}`}</strong>
            <span className="muted small">doğruluk</span>
          </Ring>
        </div>
        <div className="bc-kpi">
          <div><b>{result.ok}/{result.sets}</b><span>set tamam</span></div>
          <div><b>{result.resets}</b><span>kaybettim</span></div>
          <div><b>{result.mw == null ? '—' : String(result.mw).replace('.', ',')}</b><span>dikkat ort.</span></div>
        </div>
        <div className="bc-jev">
          <IrisMark size={40} />
          <p className="bc-bubble">{comment}</p>
        </div>
        <button className="btn" onClick={() => onFinish(makeRecord(result))}><Check size={18} aria-hidden="true" /> Tamam</button>
        <button className="btn btn-ghost" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
        {trendBefore.phase === 'empty' && <p className="muted small bc-center">İlk ölçümün. Haftada bir tekrarlarsan çizgin oluşur.</p>}
      </main>
    )
  }

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  return (
    <div
      ref={stage}
      className={`bc-stage${probe ? ' probing' : ''}`}
      role="application"
      aria-label="Nefes sayma: her nefeste dokun, dokuzuncuda basılı tut"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <NightScene stars={stars} remaining={seconds ? left / seconds : 0} timeText={`${mm}:${ss}`} ripples={ripples} hint={hint.text} hintTone={hint.tone} />
      <div className="bc-top" data-no-tap>
        <button type="button" className="btn-icon" onClick={onBack} aria-label="Kapat"><X size={20} /></button>
      </div>
      <button type="button" className="bc-lost" data-no-tap onClick={lost} disabled={Boolean(probe)}>
        Kaybettim · 1'den başla
      </button>

      {probe && (
        <div className="bc-probe" role="dialog" aria-modal="true" aria-label="Kısa soru" data-no-tap>
          {probe.step === 'mw' ? (
            <>
              <h2>Bir saniye. Dikkatin neredeydi?</h2>
              <div className="bc-scale" role="group" aria-label="1 tamamen nefeste, 6 tamamen başka yerde">
                {MW_SCALE.map((v) => (
                  <button key={v} type="button" onClick={() => answerMw(v)} aria-label={`${v}${MW_LABEL[v] ? `, ${MW_LABEL[v]}` : ''}`}>{v}</button>
                ))}
              </div>
              <div className="bc-scale-ends"><span>1 tamamen nefeste</span><span>6 tamamen başka yerde</span></div>
            </>
          ) : (
            <>
              <h2>Kaçtaydın?</h2>
              <div className="bc-keys" role="group" aria-label="Sayı">
                {Array.from({ length: SET_SIZE }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => answerCount(n)}>{n}</button>
                ))}
                <button type="button" className="bc-dunno" onClick={() => answerCount(0)} aria-label="Bilmiyorum">?</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
