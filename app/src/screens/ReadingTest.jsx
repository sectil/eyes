import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Info, Play, X, Mic, MicOff, ChevronLeft } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { IrisMark } from '../components/ui.jsx'
import StepCards from '../components/StepCards.jsx'
import { DistanceArt, ReadAloudArt, ShrinkTextArt } from '../components/howtoArt.jsx'
import { StepDial, DistanceIris, PaperJev, LensIntro, LadderChart } from '../components/readingArt.jsx'
import { WEAR } from './AcuityTest.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { REFERENCE_MM } from '../lib/distance.js'
import {
  PROTOCOL, TEXTS, textString, orderTexts, readingLadder, measureWidestLine, fontSizeCssPx, measureXHeightRatio,
  normalizeTr, alignWords, autoFinish, tapOutcome, itemWpm, segmentEndSec, analyzeReading, ladderStatus,
  fmtLogMAR, fmtM, cpsText, jevResultLine, previousComparable, isReadingV2,
  READ_MIN_MM, READ_MAX_MM, OUT_FRACTION, STOP_SECONDS, HINT_SILENCE_S,
} from '../lib/reading.js'
import { haptic, isIOSApp, speechAvailable, requestSpeechPermission, startSpeech } from '../lib/native.js'
import '../styles/reading.css'
import '../styles/profile.css' // pf-chips

// Okuma (protocol 2). Onaylı taslak O1–O10: yazı yerinde durur, sen sonuna kadar okursun.
// Akış: giriş (O1) → [yönerge kartları] → her adımda Hazır (O3) → mikrofon açılır → yazı çizilir
// (O4) → yazı sonuna kadar okununca / "Okudum" / "Okuyamıyorum" → Tamam anı (O5) → [O7/O8] → …
// → sonuç (O9). Adım ASLA okumanın ortasında ilerlemez.

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const MOMENT_MS = 700
const LOCK_WINDOW_MS = 500 // yazı boyu, gösterimden önceki 0,5 sn'nin ortanca mesafesiyle kilitlenir

const median = (arr) => {
  if (!arr.length) return null
  const a = [...arr].sort((x, y) => x - y)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}
const inRange = (mm) => mm != null && mm >= READ_MIN_MM && mm <= READ_MAX_MM
const wearText = (id) => WEAR.find((w) => w.id === id)?.text ?? null

export default function ReadingTest({ calibration, distanceCal, tests = [], recentTextIds = [], lastCorrection = null, defaultCorrection = null, nearHint = false, onSave, onDone, onCancel }) {
  const { pxPerMm, dpr } = calibration
  const xRatio = useMemo(() => measureXHeightRatio(FONT), [])
  const [ladder] = useState(() =>
    readingLadder({ pxPerMm, xRatio, dpr, widthPx: Math.min(window.innerWidth, 560) - 32, widestPerPx: measureWidestLine(FONT) }),
  )
  const [queue] = useState(() => orderTexts(recentTextIds))
  // VARSAYIM: yalnız ilk testte (bu yöntemle) sayılmayan 1 deneme yazısı gösterilir.
  const [firstTime] = useState(() => !tests.some(isReadingV2))

  const [phase, setPhase] = useState('intro') // intro | howto | ready | opening | reading | moment | low | distance | result
  const [howtoFirst] = useState(() => !howtoSeen('reading'))
  const howtoThenStart = useRef(false)
  const valid = (id) => WEAR.some((w) => w.id === id)
  const [correction, setCorrection] = useState(() => (valid(lastCorrection) ? lastCorrection : valid(defaultCorrection) ? defaultCorrection : null))
  const [speech, setSpeech] = useState({ checked: !isIOSApp(), available: false, onDevice: false, enabled: false })
  const [step, setStep] = useState({ idx: 0, practice: firstTime, retry: false })
  const [text, setText] = useState(() => queue[0])
  const [fontPx, setFontPx] = useState(null)
  const [mic, setMic] = useState('off') // off | on | failed
  const [ripples, setRipples] = useState([])
  const [hint, setHint] = useState(false)
  const [moment, setMoment] = useState(null) // 'read' | 'struggled'
  const [items, setItems] = useState([])
  const [pending, setPending] = useState(null) // O8: { dir: 'far' | 'near' }
  const [result, setResult] = useState(null)

  const queueIdx = useRef(1)
  const itemsRef = useRef([])
  const retryUsed = useRef(new Set())
  const stopSpeech = useRef(null)
  const token = useRef(0)
  const t0 = useRef(0)
  const speechStart = useRef(0)
  const live = useRef(null) // { words, n, matched, lastAligned, lastChange, lastMatch, endSec, isFinal }
  const finished = useRef(false)
  const samples = useRef([]) // { ts, mm } mesafe örnekleri
  const stepSamples = useRef([])
  const lockMm = useRef(REFERENCE_MM)
  const timers = useRef([])

  const tracked = Boolean(distanceCal)
  const cam = useFaceTracking({
    enabled: tracked && phase !== 'result',
    distanceCal,
    onFrame: (f) => {
      if (!Number.isFinite(f?.mm)) return
      const ts = performance.now()
      samples.current.push({ ts, mm: f.mm })
      if (samples.current.length > 120) samples.current.splice(0, samples.current.length - 120)
      if (phase === 'reading') stepSamples.current.push(f.mm)
    },
  })
  const liveMm = tracked ? cam.mm : null
  const liveOk = !tracked || inRange(liveMm)
  const cm = liveMm ? Math.round(liveMm / 10) : null

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }
  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    stopSpeech.current?.()
  }, [])

  // Konuşma tanıma var mı? (iPhone) — izin ilk "Başla"da istenir
  useEffect(() => {
    if (!isIOSApp()) return
    speechAvailable('tr-TR').then((a) => setSpeech((s) => ({ ...s, checked: true, available: a.available, onDevice: a.onDevice })))
  }, [])

  const nextText = () => {
    const t = queue[queueIdx.current % queue.length]
    queueIdx.current += 1
    return t
  }

  async function stopListening() {
    token.current += 1
    const stop = stopSpeech.current
    stopSpeech.current = null
    setMic((m) => (m === 'on' ? 'off' : m))
    try {
      await stop?.()
    } catch {
      // durdurma hatası yoksayılır
    }
  }

  async function begin() {
    if (speech.available && !speech.enabled) {
      const ok = await requestSpeechPermission()
      setSpeech((s) => ({ ...s, enabled: ok }))
    }
    setPhase('ready')
  }

  // --- O3 → O4: "Hazırım". Mikrofon önce açılır, yazı ancak dinleme başlayınca çizilir. ---
  async function onReady() {
    if (!liveOk || phase !== 'ready') return
    const now = performance.now()
    const recent = samples.current.filter((s) => now - s.ts <= LOCK_WINDOW_MS).map((s) => s.mm)
    lockMm.current = tracked ? median(recent) ?? liveMm ?? REFERENCE_MM : REFERENCE_MM
    setFontPx(fontSizeCssPx(ladder[step.idx], lockMm.current, pxPerMm, xRatio))
    const words = normalizeTr(textString(text))
    live.current = { words, n: words.length, matched: 0, lastAligned: -1, lastChange: null, lastMatch: null, firstMatch: null, endSec: null, isFinal: false, started: false }
    finished.current = false
    stepSamples.current = []
    setRipples([])
    setHint(false)
    setMoment(null)
    const my = ++token.current
    if (speech.enabled) {
      setPhase('opening')
      // VARSAYIM: ses zaman damgaları dinlemenin başlatıldığı andan sayılır.
      speechStart.current = performance.now()
      try {
        const stop = await startSpeech((r) => onSpeech(my, r), { locale: 'tr-TR', onDevice: speech.onDevice })
        if (my !== token.current) {
          stop?.()
          return
        }
        stopSpeech.current = stop
        setMic('on')
      } catch {
        stopSpeech.current = null
        setMic('failed')
      }
    } else setMic('off')
    setPhase('reading')
  }

  // Süre yazının ilk çizildiği karede başlar (MNREAD iPad uygulaması: yazı anında görünür).
  useEffect(() => {
    if (phase !== 'reading') return undefined
    t0.current = performance.now()
    if (live.current) live.current.started = true
    const raf = requestAnimationFrame(() => {
      t0.current = performance.now()
    })
    return () => cancelAnimationFrame(raf)
  }, [phase])

  function onSpeech(my, r) {
    const L = live.current
    // Yazı çizilmeden gelen sonuçlar beklenir (sonuçlar birikimli; sonraki sonuç hepsini içerir)
    if (my !== token.current || !L || !L.started || r?.error || finished.current) return
    const heard = normalizeTr(r.text)
    const a = alignWords(L.words, heard)
    const now = performance.now()
    if (heard.length !== L.heardCount || r.text !== L.text) L.lastChange = now
    L.heardCount = heard.length
    L.text = r.text
    L.isFinal = Boolean(r.isFinal)
    if (a.matched > L.matched) {
      L.lastMatch = now
      if (L.firstMatch == null) L.firstMatch = now
      const add = a.matched - L.matched
      setRipples((rs) => [...rs.slice(-3), ...Array.from({ length: Math.min(add, 2) }, (_, k) => now + k)])
    }
    if (a.matched !== L.matched || a.lastAligned !== L.lastAligned) {
      // Bitiş: son eşleşen kelimenin ses segmenti; yoksa kelimenin ilk göründüğü an (duvar saati)
      const seg = segmentEndSec(r.segments, heard.length, a.heardIdx[a.lastAligned] ?? -1)
      const segSec = seg == null ? null : (speechStart.current + seg * 1000 - t0.current) / 1000
      L.endSec = segSec != null && segSec > 0 ? segSec : ((L.lastMatch ?? now) - t0.current) / 1000
    }
    L.matched = a.matched
    L.lastAligned = a.lastAligned
  }

  // Okurken 100 ms'de bir: kendiliğinden bitiş (dört koşul), ipucu şeridi. Adım ORTADA geçmez.
  useEffect(() => {
    if (phase !== 'reading') return undefined
    const id = setInterval(() => {
      const L = live.current
      if (!L || finished.current) return
      const now = performance.now()
      const elapsed = (now - t0.current) / 1000
      const silence = L.lastChange == null ? 0 : (now - L.lastChange) / 1000
      if (mic === 'on' && L.matched > 0) {
        const af = autoFinish({ words: L.n, matched: L.matched, lastAligned: L.lastAligned, silenceS: silence, isFinal: L.isFinal, endSec: L.endSec ?? 0 })
        if (af.ok) {
          finishStep('read', 'speech')
          return
        }
      }
      // VARSAYIM: ipucu en az bir kelimeden sonra 3 sn sessizlikte ya da 20 sn'de
      if ((L.matched >= 1 && silence >= HINT_SILENCE_S) || elapsed >= STOP_SECONDS) setHint(true)
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mic])

  const distStats = () => {
    const d = stepSamples.current
    if (!tracked || !d.length) return { distanceMm: tracked ? Math.round(lockMm.current) : null, distanceOutFrac: null }
    const out = d.filter((mm) => !inRange(mm)).length / d.length
    return { distanceMm: Math.round(median(d)), distanceOutFrac: Math.round(out * 100) / 100, far: d.filter((mm) => mm > READ_MAX_MM).length >= d.filter((mm) => mm < READ_MIN_MM).length }
  }

  function makeItem(status, how) {
    const L = live.current
    const speechOn = mic === 'on'
    const tapSec = (performance.now() - t0.current) / 1000
    let seconds = null
    if (how !== 'cant') seconds = speechOn && L?.matched > 0 && L.endSec != null ? L.endSec : tapSec
    if (seconds != null) seconds = Math.round(seconds * 100) / 100
    const matched = speechOn ? L.matched : null
    const { wpm, fast } = itemWpm(status === 'failed' ? null : seconds, L.n, matched)
    const { far, ...dist } = distStats()
    return {
      item: {
        logMAR: ladder[step.idx],
        textId: text.id,
        words: L.n,
        matched,
        errors: speechOn ? L.n - L.matched : null,
        coverage: speechOn ? Math.round((L.matched / L.n) * 100) / 100 : null,
        seconds,
        voiceOnsetSec: speechOn && L.firstMatch != null ? Math.round(((L.firstMatch - t0.current) / 1000) * 100) / 100 : null,
        wpm,
        ...(fast ? { fast: true } : {}),
        status,
        how,
        ...dist,
        ...(step.practice ? { practice: true } : {}),
      },
      far,
    }
  }

  const pushItem = (it) => {
    itemsRef.current = [...itemsRef.current, it]
    setItems(itemsRef.current)
  }

  async function finishStep(status, how) {
    if (finished.current) return
    finished.current = true
    await stopListening()
    const { item, far } = makeItem(status, how)
    pushItem(item)
    haptic(status === 'failed' ? 'warning' : 'success')
    if (step.practice) {
      // Deneme sayılmaz: aynı boyda, sayılan ilk yazıya geç
      setMoment(status === 'failed' ? null : status)
      setPhase(status === 'failed' ? 'ready' : 'moment')
      later(() => toStep({ idx: 0, practice: false, retry: false }), status === 'failed' ? 0 : MOMENT_MS)
      return
    }
    if (status === 'failed') {
      finish(itemsRef.current)
      return
    }
    setMoment(status)
    setPhase('moment')
    later(() => {
      if (tracked && item.distanceOutFrac != null && item.distanceOutFrac > OUT_FRACTION) {
        setPending({ dir: far ? 'far' : 'near', item })
        setPhase('distance')
      } else advance(item)
    }, MOMENT_MS)
  }

  function toStep(s) {
    setStep(s)
    setText(nextText())
    setMoment(null)
    setPhase('ready')
  }

  // Adım bitti: merdiven biter mi? (Okuma > 20 sn — Radner; ya da en küçük boy)
  function advance(item) {
    const end = (item.seconds ?? 0) > STOP_SECONDS || step.idx >= ladder.length - 1
    if (end) finish(itemsRef.current)
    else toStep({ idx: step.idx + 1, practice: false, retry: false })
  }

  // "Okudum": ses açıksa kapsamına göre okundu / takıldı / O7; ses yoksa okundu.
  function onOkudum() {
    if (phase !== 'reading' || finished.current) return
    const L = live.current
    if (mic !== 'on') {
      finishStep('read', 'tap')
      return
    }
    const out = tapOutcome(L.n, L.matched)
    if (out === 'low' && !step.practice) {
      finished.current = true
      stopListening()
      setPhase('low')
      return
    }
    finishStep(out === 'low' ? 'struggled' : out, 'speech')
  }

  function onCant() {
    if (phase !== 'reading' || finished.current) return
    finishStep('failed', 'cant')
  }

  // O7: yarıdan çoğu duyulmadı. Aynı boyda en çok 1 kez yeni yazı.
  function lowRetry() {
    const { item } = makeItem('failed', 'speech')
    pushItem({ ...item, seconds: null, wpm: null, superseded: true })
    retryUsed.current.add(step.idx)
    toStep({ ...step, retry: true })
  }
  function lowStop() {
    const { item } = makeItem('failed', 'speech')
    pushItem({ ...item, seconds: null, wpm: null })
    finish(itemsRef.current)
  }

  // O8: okumanın yarısından çoğu 35–45 cm dışında geçti
  function distRetry() {
    const last = itemsRef.current.at(-1)
    itemsRef.current = [...itemsRef.current.slice(0, -1), { ...last, superseded: true }]
    setItems(itemsRef.current)
    retryUsed.current.add(step.idx)
    setPending(null)
    toStep({ ...step, retry: true })
  }
  function distContinue() {
    const it = pending?.item
    setPending(null)
    advance(it ?? {})
  }

  function finish(all) {
    const a = analyzeReading(all, { bottom: ladder.at(-1) })
    const counted = all.filter((x) => !x.superseded && !x.practice)
    const d = all.map((x) => x.distanceMm).filter(Number.isFinite)
    const used = [...new Set(all.map((x) => x.textId))]
    const rec = {
      type: 'reading',
      eye: 'OU',
      protocol: PROTOCOL,
      correction: correction ?? null,
      criticalPrintSize: a.criticalPrintSize,
      readingAcuity: a.readingAcuity,
      maxReadingSpeed: a.maxReadingSpeed,
      readingAcuityMnread: a.readingAcuityMnread,
      cpsCensored: a.cpsCensored,
      floor: a.floor,
      ladderTop: ladder[0],
      ladder,
      items: all,
      // eski biçim (geriye uyum): geçerli adımlar
      trials: counted.map(({ logMAR, seconds, how, status }) => ({ logMAR, seconds: status === 'failed' ? null : seconds, how })),
      textsUsed: used,
      sentencesUsed: used.map((id) => TEXTS.find((t) => t.id === id)).filter(Boolean).map(textString),
      speechVerified: all.some((x) => x.how === 'speech'),
      distanceTracked: tracked && d.length > 0,
      meanDistanceMm: tracked && d.length ? Math.round(d.reduce((s, v) => s + v, 0) / d.length) : null,
      device: { pxPerMm, dpr, screenW: window.screen.width, screenH: window.screen.height, xRatio, font: 'system-ui' },
    }
    const prev = previousComparable(tests, rec.correction)
    setResult({ rec, prev, jev: jevResultLine(rec, prev) })
    setPhase('result')
    onSave?.(rec)
  }

  async function cancel() {
    timers.current.forEach(clearTimeout)
    await stopListening()
    onCancel()
  }

  // Adım diyaframı kodu
  const dialCode = useCallback(
    (extra) => ladder
      .map((l, k) => {
        if (extra && extra.k === k) return extra.c
        const it = items.find((x) => !x.superseded && !x.practice && Math.abs(x.logMAR - l) < 1e-9)
        if (it) return it.status === 'read' ? 'd' : it.status === 'struggled' ? 'h' : 'f'
        return k === step.idx ? 'c' : 't'
      })
      .join(''),
    [ladder, items, step.idx],
  )

  const videoEl = tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />

  // ---------------- Yönerge kartları ----------------
  if (phase === 'howto') {
    const cards = [
      {
        key: 'distance',
        art: <DistanceArt cm={cm} ok={Boolean(tracked && liveOk && liveMm)} />,
        title: 'Telefonu 40\u00a0cm uzakta tut',
        why: 'İki gözün açık. Yakını her zamanki gibi oku.',
        live: tracked ? { ok: Boolean(liveMm && liveOk), text: !liveMm ? 'yüz aranıyor' : liveOk ? `${cm} cm · tam yerinde` : liveMm > READ_MAX_MM ? `${cm} cm · biraz yaklaş` : `${cm} cm · biraz uzaklaş` } : null,
      },
      { key: 'read', art: <ReadAloudArt />, title: 'Yazının tamamını sesli oku', why: speech.available ? 'Bitirince kendiliğinden geçer. Ortada geçmez.' : 'Bitirince “Okudum”a bas.' },
      { key: 'cant', art: <ShrinkTextArt />, title: 'Okuyamazsan “Okuyamıyorum”a dokun', why: 'Her adımda yazı biraz küçülür.' },
    ]
    return (
      <main className="screen fade-in">
        {videoEl}
        <StepCards
          cards={cards}
          eyebrow="Okuma · nasıl yapılır"
          finishLabel={howtoThenStart.current ? 'Başla' : 'Anladım'}
          onFinish={() => {
            markHowtoSeen('reading')
            if (howtoThenStart.current) begin()
            else setPhase('intro')
          }}
          onDismiss={() => {
            markHowtoSeen('reading')
            if (howtoThenStart.current) begin()
            else setPhase('intro')
          }}
          onClose={() => { howtoThenStart.current = false; setPhase('intro') }}
        />
      </main>
    )
  }

  // ---------------- O1 giriş ----------------
  if (phase === 'intro') {
    return (
      <main className="screen fade-in rd-intro">
        {videoEl}
        <div className="rd-head">
          <button className="btn-icon" onClick={onCancel} aria-label="Geri"><ChevronLeft size={22} /></button>
          <button type="button" className="rd-howto-pill" onClick={() => { howtoThenStart.current = false; setPhase('howto') }}>Nasıl yapılır?</button>
        </div>
        <div className="rd-title">
          <span className="eyebrow">Haftalık</span>
          <h1>Okuma</h1>
          <p>Kısa yazıları sesli oku. Yazı her adımda biraz küçülür.</p>
        </div>
        <LensIntro lines={TEXTS[0].lines} />
        <p className="rd-lens-cap">yazı yerinde durur · yalnız boyu küçülür</p>
        <div className="rd-jevline">
          <IrisMark size={40} />
          <p className="rd-bubble">{speech.available ? 'Yazının sonuna kadar sesli oku, bitirince ben anlarım.' : 'Yazının sonuna kadar sesli oku, bitirince “Okudum”a bas.'}</p>
        </div>
        <div className="rd-cond">
          <h2>Bugün nasıl okuyorsun?</h2>
          <div className="pf-chips" role="radiogroup" aria-label="Gözlük veya lens">
            {WEAR.map((w) => (
              <button key={w.id} type="button" role="radio" aria-checked={correction === w.id} className={`pf-chip${correction === w.id ? ' on' : ''}`} onClick={() => setCorrection(w.id)}>{w.text}</button>
            ))}
          </div>
          <p className="muted small">
            {lastCorrection && correction && correction !== lastCorrection
              ? `Geçen sefer “${wearText(lastCorrection)}” seçtin. Farklı koşuldaki sonuçlar karşılaştırılmaz.`
              : 'Her seferinde aynı koşulda oku.'}
          </p>
          {nearHint && <p className="muted small">Yakın gözlüğün varsa tak.</p>}
        </div>
        {speech.available && (
          <p className="note">
            <Mic size={16} />
            Ses kaydedilmez, saklanmaz; {speech.onDevice ? 'tanıma telefonun içinde yapılır.' : 'tanıma için Apple sunucusu kullanılır.'}
          </p>
        )}
        <p className="note">
          <Info size={16} />
          Klinik test değil. Sonuçlarını yalnızca bu telefondaki önceki okumalarınla karşılaştır.
        </p>
        <button className="btn" disabled={!ladder.length || !speech.checked || !correction} onClick={() => {
            // İlk seferde yönerge kartları (O2) araya girer, "Başla" ile teste geçilir
            if (howtoFirst && !howtoSeen('reading')) {
              howtoThenStart.current = true
              setPhase('howto')
            } else begin()
          }}>
          <Play size={18} aria-hidden="true" /> Başla
        </button>
      </main>
    )
  }

  // ---------------- O9 sonuç ----------------
  if (phase === 'result' && result) {
    const { rec, jev } = result
    const cps = rec.criticalPrintSize
    const rows = ladderStatus(rec)
    const sampleL = cps ?? rec.ladderTop
    const samplePx = fontSizeCssPx(sampleL, REFERENCE_MM, pxPerMm, xRatio)
    const detailFor = (r) => {
      if (r.status === 'none') return `${fmtLogMAR(r.l)} · bu boya gelinmedi`
      if (r.status === 'failed') return `${fmtLogMAR(r.l)} · okuyamadın`
      const sec = r.seconds != null ? `${r.seconds.toFixed(1).replace('.', ',')} sn` : '—'
      const w = r.matched == null ? 'dokunarak' : `${r.matched}/${r.words} kelime`
      return `${fmtLogMAR(r.l)} · ${sec} · ${w}${r.distanceMm ? ` · ${Math.round(r.distanceMm / 10)} cm` : ''}`
    }
    return (
      <main className="screen fade-in rd-res">
        <div className="rd-res-head">
          <div className="rd-title">
            <span className="eyebrow">Okuma · bugün</span>
            <h1>Bitti</h1>
          </div>
          <button className="btn-icon" onClick={onDone} aria-label="Kapat"><X size={20} /></button>
        </div>
        <section className="rd-paperc">
          <div className="rd-paperc-top">
            <span className="lab">Rahat okuduğun en küçük yazı</span>
            <span>
              <span className="big">{cpsText(rec)}</span>
              <span className="eq">{cps != null ? `≈ ${fmtM(cps)} M` : rec.cpsCensored === 'above' ? `${fmtLogMAR(rec.ladderTop)}'ten büyük` : 'hesaplanamadı'}</span>
            </span>
          </div>
          <span className="sample" style={{ fontSize: `${samplePx}px` }}>{cps != null ? 'Bu boyu rahat okudun.' : 'En büyük yazı buydu.'}</span>
          <span className="foot">0,4 ≈ 10 punto yazı, 40 cm'de</span>
        </section>
        <div className="rd-boxes">
          <div className="rd-box">
            <span className="l">Okuyabildiğin en küçük yazı</span>
            <span className="v">{rec.readingAcuity != null ? <>{fmtLogMAR(rec.readingAcuity)} <small>≈ {fmtM(rec.readingAcuity)} M</small></> : '—'}</span>
          </div>
          <div className="rd-box">
            <span className="l">Sesli okuma hızın</span>
            <span className="v">{rec.maxReadingSpeed ?? '—'} <small>kelime/dk</small></span>
            <span className="s">Telefonda kâğıttan biraz yavaş çıkar.</span>
          </div>
        </div>
        <section className="card rd-ladcard">
          <div className="row"><h2>Boy boy okuma süren</h2><span className="unit">logMAR</span></div>
          <LadderChart rows={rows} cps={cps} ra={rec.readingAcuity} detailFor={detailFor} />
          <p className="rd-legend">Her daire bir yazı. Dolu: tam okudun. Yarım: takıldın. Çarpı: okuyamadın. Kesik: sıra gelmedi.</p>
        </section>
        <div className="rd-jevline">
          <IrisMark size={40} />
          <p className="rd-bubble">{jev}</p>
        </div>
        <p className="muted small" style={{ textAlign: 'center' }}>Klinik test değil. Yalnızca bu telefondaki önceki sonuçlarınla karşılaştır.</p>
        <button className="btn" onClick={onDone}>Bitti</button>
      </main>
    )
  }

  // ---------------- Kâğıt sahnesi: O3 hazır, O4 okuma, O5 tamam, O7, O8 ----------------
  const counter = step.practice ? 'Deneme' : `${step.idx + 1} / ${ladder.length}`
  const code = moment && !step.practice ? dialCode({ k: step.idx, c: moment === 'read' ? 'g' : 'h' }) : dialCode()
  const chip = tracked ? (
    <span className={`rd-chip ${liveMm == null ? 'none' : liveOk ? '' : 'out'}`}>{liveMm ? `${cm} cm` : 'yüz aranıyor'}</span>
  ) : <span className="rd-chip-spacer" />
  const readyNote = step.practice
    ? 'Önce bir deneme yazısı. Sayılmaz.'
    : step.retry
      ? 'Aynı boyda başka bir yazı.'
      : step.idx === 0
        ? 'İlk yazı en büyüğü.'
        : 'Sıradaki yazı bir basamak küçük.'
  const outDir = liveMm != null && liveMm > READ_MAX_MM ? 'far' : 'near'
  const listenText = phase === 'opening'
    ? 'Mikrofon açılıyor'
    : mic === 'on'
      ? 'Dinliyorum'
      : mic === 'failed'
        ? 'Mikrofon açılamadı. Bitince “Okudum”a bas.'
        : 'Bitince “Okudum”a bas.'

  return (
    <div className="rd-paper">
      {videoEl}
      <div className="rd-top">
        <button className="btn-icon" onClick={cancel} aria-label="Testten çık"><X size={20} /></button>
        <span className="rd-count"><StepDial code={code} />{counter}</span>
        {chip}
      </div>

      {phase === 'ready' && (
        <div className="rd-ready">
          <DistanceIris open={liveOk ? 1 : 0.55} tone={liveOk ? 'ok' : 'out'} cm={tracked ? cm : 40} />
          <p className="rd-ready-note">{readyNote}</p>
          <button className="rd-ready-btn" onClick={onReady} disabled={!liveOk}>
            {liveOk ? 'Hazırım' : liveMm == null ? 'Yüzün görünmüyor' : `Telefonu ${READ_MIN_MM / 10}–${READ_MAX_MM / 10} cm arasında tut`}
          </button>
          {!tracked && <p className="rd-ready-note" style={{ fontSize: '0.85rem' }}>Telefonu 40 cm uzakta tut.</p>}
          {tracked && !liveOk && liveMm != null && <p className="rd-ready-note" style={{ fontSize: '0.85rem' }}>{outDir === 'far' ? 'Biraz yaklaş.' : 'Biraz uzaklaş.'}</p>}
        </div>
      )}

      {phase === 'reading' && fontPx && (
        <p className="rd-stim" style={{ fontSize: `${fontPx}px` }} aria-label={textString(text)}>
          <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
          {text.lines.map((l) => <span key={l} className="ln">{l}</span>)}
        </p>
      )}

      {phase === 'moment' && (
        <div className="rd-echo" aria-hidden="true"><StepDial code={code} size={104} /></div>
      )}

      {(phase === 'low' || phase === 'distance') && (
        <div className="rd-ghost-lines" aria-hidden="true"><i style={{ width: 150 }} /><i style={{ width: 140 }} /><i style={{ width: 125 }} /></div>
      )}

      {(phase === 'ready' || phase === 'opening' || phase === 'reading' || phase === 'moment') && (
        <div className="rd-bottom">
          <PaperJev ripples={phase === 'reading' ? ripples : []} ring={phase === 'moment' ? (moment === 'read' ? 'gold' : 'cyan') : null} size={40} />
          {phase === 'moment' ? (
            <span className="rd-listen done">Tamam.</span>
          ) : phase === 'ready' ? (
            <span className="rd-listen" />
          ) : (
            <span className="rd-listen">{mic === 'on' ? <Mic size={14} aria-hidden="true" /> : mic === 'failed' ? <MicOff size={14} aria-hidden="true" /> : null}{listenText}</span>
          )}
          <span className={`rd-hint${phase === 'reading' && hint ? '' : ' hidden'}`}>Acele yok. Zorsa “Okuyamıyorum”a dokun.</span>
          <div className="rd-btns" style={{ visibility: phase === 'reading' ? 'visible' : 'hidden' }}>
            <button className="rd-ok" onClick={onOkudum}>Okudum</button>
            <button className="rd-cant" onClick={onCant}>Okuyamıyorum</button>
          </div>
        </div>
      )}

      {phase === 'low' && (
        <div className="rd-sheet" role="dialog" aria-label="Çoğunu duyamadım">
          <div className="rd-sheet-h"><PaperJev size={34} />Çoğunu duyamadım.</div>
          <p>{retryUsed.current.has(step.idx) ? 'Bu boyda yeni yazı hakkını kullandın.' : 'Aynı boyda başka bir yazı gelir. İstersen testi burada bitir.'}</p>
          <button className="rd-ok" onClick={lowRetry} disabled={retryUsed.current.has(step.idx)}>Başka yazıyla dene</button>
          <button className="rd-cant" onClick={lowStop}>Burada bitir</button>
        </div>
      )}

      {phase === 'distance' && pending && (
        <div className="rd-sheet" role="dialog" aria-label="Mesafe">
          <div className="rd-sheet-h">{pending.dir === 'far' ? 'Biraz uzaklaştın.' : 'Biraz yaklaştın.'}</div>
          <p>{pending.dir === 'far' ? `Bu yazının yarısından çoğunu ${READ_MAX_MM / 10} cm'den uzakta okudun.` : `Bu yazının yarısından çoğunu ${READ_MIN_MM / 10} cm'den yakında okudun.`}</p>
          {!retryUsed.current.has(step.idx) && <button className="rd-ok" onClick={distRetry}>Bu boyu tekrar oku</button>}
          <button className="rd-cant" onClick={distContinue}>Devam et</button>
        </div>
      )}
    </div>
  )
}
