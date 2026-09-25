import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, Play, X, Mic, MicOff, Check } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { PageHeader } from '../components/ui.jsx'
import StepCards from '../components/StepCards.jsx'
import { DistanceArt, ReadAloudArt, ShrinkTextArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { REFERENCE_MM } from '../lib/distance.js'
import { analyzeReading, fontSizeCssPx, measureXHeightRatio, pickSentences, matchRatio, MATCH_THRESHOLD } from '../lib/reading.js'
import { haptic, isIOSApp, speechAvailable, requestSpeechPermission, startSpeech } from '../lib/native.js'

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const CHAR_W = 0.55 // ortalama karakter genişliği / font-size (yaklaşık, satır tahmini için)
const MAX_LINES = 3
// Canlı ölçek aralığı (bkz. AcuityTest)
const LIVE_MIN_MM = 250
const LIVE_MAX_MM = 600

// Ekrana 3 satırda sığan en büyük boyuttan, çizilebilir en küçük boyuta kadar 0.1 adım
function sizeLadder(pxPerMm, dpr, xRatio, widthPx) {
  const sizes = []
  for (let l = 1.0; l >= -0.2; l = +(l - 0.1).toFixed(1)) {
    const fs = fontSizeCssPx(l, REFERENCE_MM, pxPerMm, xRatio)
    const lineChars = widthPx / (CHAR_W * fs)
    const fits = Math.ceil(62 / lineChars) <= MAX_LINES
    const drawable = fs * xRatio * dpr >= 3 // x-yüksekliği en az 3 cihaz pikseli
    if (fits && drawable) sizes.push(l)
  }
  return sizes
}

// Okuma süresi: ses segmentlerinden (ilk kelimenin başı → son kelimenin sonu). Segment yoksa
// ekrana gelişten "Okudum"a kadar geçen süre.
function speechSeconds(segments) {
  if (!segments?.length) return null
  const first = segments[0].t
  const last = segments.at(-1)
  return Math.max(0.3, last.t + last.d - first)
}

export default function ReadingTest({ calibration, distanceCal, recentSentences = [], onFinish, onCancel }) {
  const { pxPerMm, dpr } = calibration
  const xRatio = useMemo(() => measureXHeightRatio(FONT), [])
  const sizes = useMemo(
    () => sizeLadder(pxPerMm, dpr, xRatio, Math.min(window.innerWidth, 560) - 32),
    [pxPerMm, dpr, xRatio],
  )
  const sentences = useMemo(() => pickSentences(sizes.length, recentSentences), [sizes.length, recentSentences])

  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('instructions') // instructions | ready | reading | done
  const [howto, setHowto] = useState(() => !howtoSeen('reading'))
  const [speech, setSpeech] = useState({ checked: !isIOSApp(), enabled: false })
  const [heard, setHeard] = useState({ text: '', ratio: 0 })
  const [listening, setListening] = useState(false)
  const recordedIdx = useRef(-1)
  const t0 = useRef(0)
  const trials = useRef([])
  const dists = useRef([])
  const stopSpeech = useRef(null)
  const idxRef = useRef(0)
  idxRef.current = idx

  const tracked = Boolean(distanceCal)
  const cam = useFaceTracking({ enabled: tracked, distanceCal })
  const liveMm = tracked ? cam.mm : null
  const liveOk = !tracked || (liveMm != null && liveMm >= LIVE_MIN_MM && liveMm <= LIVE_MAX_MM)
  const renderMm = tracked && liveOk ? liveMm : REFERENCE_MM

  // Konuşma tanıma var mı? (iPhone) — izin ilk "Başla"da istenir
  useEffect(() => {
    if (!isIOSApp()) return
    speechAvailable('tr-TR').then((a) => setSpeech({ checked: true, enabled: false, available: a.available, onDevice: a.onDevice }))
  }, [])

  useEffect(() => () => { stopSpeech.current?.() }, [])

  async function begin() {
    if (speech.available && !speech.enabled) {
      const ok = await requestSpeechPermission()
      setSpeech((s) => ({ ...s, enabled: ok }))
    }
    setPhase('ready')
  }

  async function show() {
    if (!liveOk) return
    t0.current = performance.now()
    setHeard({ text: '', ratio: 0 })
    setPhase('reading')
    if (speech.enabled) {
      const myIdx = idx
      let lastSegments = null
      try {
        stopSpeech.current = await startSpeech((r) => {
          if (idxRef.current !== myIdx || r.error) return
          const ratio = matchRatio(sentences[myIdx], r.text)
          lastSegments = r.segments
          setHeard({ text: r.text, ratio })
          if (ratio >= MATCH_THRESHOLD) {
            // Okudu: süre ses segmentlerinden
            record(speechSeconds(lastSegments) ?? (performance.now() - t0.current) / 1000, 'speech')
          }
        }, { locale: 'tr-TR', onDevice: speech.onDevice })
        setListening(true)
      } catch {
        stopSpeech.current = null
        setListening(false)
      }
    }
  }

  async function record(seconds, how = 'tap') {
    if (recordedIdx.current === idx) return // aynı cümle iki kez kaydedilmesin (art arda ses sonuçları)
    recordedIdx.current = idx
    const stop = stopSpeech.current
    stopSpeech.current = null
    setListening(false)
    await stop?.()
    haptic(seconds == null ? 'warning' : 'success')
    trials.current.push({ logMAR: sizes[idx], seconds, sentence: sentences[idx], how, distanceMm: liveMm })
    if (liveMm) dists.current.push(liveMm)
    const next = idx + 1
    if (seconds == null || next >= sizes.length) finish()
    else {
      setIdx(next)
      setPhase('ready')
    }
  }

  function finish() {
    const r = analyzeReading(trials.current)
    const d = dists.current
    setPhase('done')
    onFinish({
      type: 'reading',
      eye: 'OU',
      ...r,
      trials: trials.current.map(({ logMAR, seconds, how }) => ({ logMAR, seconds, how })),
      sentencesUsed: trials.current.map((t) => t.sentence),
      speechVerified: trials.current.some((t) => t.how === 'speech'),
      distanceTracked: d.length > 0,
      meanDistanceMm: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : null,
      device: { pxPerMm, dpr, screenW: window.screen.width, screenH: window.screen.height, xRatio },
    })
  }

  async function cancel() {
    const stop = stopSpeech.current
    stopSpeech.current = null
    await stop?.()
    onCancel()
  }

  const chip = tracked && (
    <div className={`chip chip-${liveMm == null ? 'unknown' : liveOk ? 'ok' : 'too-far'}`}>
      {liveMm ? `${Math.round(liveMm / 10)} cm` : 'yüz aranıyor'}
    </div>
  )

  if (phase === 'instructions' && howto) {
    const cm = liveMm ? Math.round(liveMm / 10) : null
    const cards = [
      {
        key: 'distance',
        art: <DistanceArt cm={cm} ok={Boolean(tracked && liveOk)} />,
        title: tracked ? 'Telefonu kol boyu uzakta tut' : 'Telefonu 40 cm uzakta tut',
        why: 'İki gözün açık. Yakını normalde nasıl görüyorsan öyle.',
        live: tracked ? { ok: Boolean(liveOk), text: !liveMm ? 'yüz aranıyor' : liveOk ? `${cm} cm · tam yerinde` : `${cm} cm · ayarla` } : null,
      },
      { key: 'read', art: <ReadAloudArt />, title: 'Cümleyi sesli ve hızlı oku', why: speech.available ? 'Telefon duyar, kendiliğinden sıradakine geçer.' : 'Biter bitmez "Okudum"a bas.' },
      { key: 'shrink', art: <ShrinkTextArt />, title: 'Küçülür; okuyamayınca "Okuyamıyorum"', why: 'Klinik bir test değil; yalnızca kendi önceki sonuçlarınla karşılaştır.' },
    ]
    return (
      <main className="screen fade-in">
        {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
        <StepCards cards={cards} eyebrow="Okuma hızı · nasıl yapılır" finishLabel="Anladım" onFinish={() => setHowto(false)} onDismiss={() => { markHowtoSeen('reading'); setHowto(false) }} onClose={onCancel} />
      </main>
    )
  }

  if (phase === 'instructions') {
    return (
      <main className="screen fade-in">
        {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
        <PageHeader onBack={onCancel} eyebrow="Haftalık" title="Okuma hızı" subtitle="Yazı küçüldükçe ne kadar hızlı ve rahat okuduğunu ölçer." />
        <div className="row between">
          <span className="muted small">Kol boyu uzaklık · sesli ve hızlı oku · küçülünce "Okuyamıyorum"</span>
          <button type="button" className="link-btn" onClick={() => setHowto(true)}>Nasıl yapılır?</button>
        </div>
        {speech.available && (
          <p className="note">
            <Mic size={16} />
            Ses kaydedilmez, saklanmaz; {speech.onDevice ? 'tanıma telefonun içinde yapılır.' : 'tanıma için Apple sunucusu kullanılır.'}
          </p>
        )}
        <p className="note">
          <Info size={16} />
          Klinik olarak doğrulanmış bir test değil. Sonuçlarını yalnızca bu cihazdaki önceki okuma testlerinle karşılaştır.
        </p>
        {chip}
        <button className="btn" disabled={!sizes.length || !speech.checked} onClick={begin}><Play size={18} aria-hidden="true" /> Başla</button>
      </main>
    )
  }

  const fs = fontSizeCssPx(sizes[idx], renderMm, pxPerMm, xRatio)

  return (
    <div className="stimulus-area reading-area">
      {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
      <div className="stimulus-top">
        <button className="btn-icon" onClick={cancel} aria-label="Testten çık"><X size={20} /></button>
        <span>{idx + 1}/{sizes.length}</span>
        {chip}
      </div>
      {phase === 'ready' && (
        <button className="btn" onClick={show} disabled={!liveOk}>
          {liveOk ? (idx === 0 ? 'Hazırım — cümleyi göster' : 'Sıradaki cümle') : liveMm == null ? 'Yüzün görünmüyor' : `Telefonu ${LIVE_MIN_MM / 10}–${LIVE_MAX_MM / 10} cm arasında tut`}
        </button>
      )}
      {phase === 'reading' && (
        <>
          <p className="reading-text" style={{ fontSize: `${fs}px`, fontFamily: FONT }}>
            {sentences[idx]}
          </p>
          {speech.enabled ? (
            <>
              <span className={`reading-mic ${listening ? 'on' : ''}`}>
                {listening ? <><span className="pulse" /> Dinliyorum — sesli oku</> : <><MicOff size={16} /> Mikrofon açılamadı</>}
              </span>
              <p className="reading-heard" aria-live="polite">
                {heard.text && <span className={heard.ratio >= MATCH_THRESHOLD ? 'hit' : ''}>{heard.text}</span>}
              </p>
            </>
          ) : null}
          <div className="row" style={{ gap: 10 }}>
            <button className="btn" onClick={() => record((performance.now() - t0.current) / 1000)}>
              <Check size={18} aria-hidden="true" /> Okudum
            </button>
            <button className="btn btn-ghost" onClick={() => record(null)}>Okuyamıyorum</button>
          </div>
        </>
      )}
    </div>
  )
}
