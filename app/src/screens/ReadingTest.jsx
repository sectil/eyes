import { useMemo, useRef, useState } from 'react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { distanceStatus, REFERENCE_MM } from '../lib/distance.js'
import { analyzeReading, fontSizeCssPx, measureXHeightRatio, pickSentences } from '../lib/reading.js'

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const CHAR_W = 0.55 // ortalama karakter genişliği / font-size (yaklaşık, satır tahmini için)
const MAX_LINES = 3

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
  const t0 = useRef(0)
  const trials = useRef([])
  const dists = useRef([])

  const tracked = Boolean(distanceCal)
  const cam = useFaceTracking({ enabled: tracked, distanceCal })
  const status = tracked ? distanceStatus(cam.mm) : 'ok'

  function show() {
    if (status !== 'ok') return
    t0.current = performance.now()
    setPhase('reading')
  }

  function record(seconds) {
    trials.current.push({ logMAR: sizes[idx], seconds, sentence: sentences[idx] })
    if (cam.mm) dists.current.push(cam.mm)
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
      trials: trials.current.map(({ logMAR, seconds }) => ({ logMAR, seconds })),
      sentencesUsed: trials.current.map((t) => t.sentence),
      distanceTracked: d.length > 0,
      meanDistanceMm: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : null,
      device: { pxPerMm, dpr, screenW: window.screen.width, screenH: window.screen.height, xRatio },
    })
  }

  const chip = tracked && (
    <div className={`chip chip-${status}`}>
      {cam.mm ? `${Math.round(cam.mm / 10)} cm` : 'yüz aranıyor'}
    </div>
  )

  if (phase === 'instructions') {
    return (
      <main className="screen">
        {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
        <h1>Okuma hızı</h1>
        <ul className="steps">
          <li>İki gözünüz açık, telefon <strong>40 cm</strong> uzakta. Okuma gözlüğü takmayın.</li>
          <li>Her ekranda bir cümle çıkacak, yazı giderek küçülecek.</li>
          <li>Cümleyi <strong>sesli ve olabildiğince hızlı</strong> okuyun, biter bitmez ekrana dokunun.</li>
          <li>Okuyamayacak kadar küçüldüğünde "Okuyamıyorum"a basın.</li>
        </ul>
        <p className="muted small">
          Bu test klinik olarak doğrulanmış bir test değildir. Sonuçlarınızı yalnızca bu
          cihazda yaptığınız önceki okuma testleriyle karşılaştırın.
        </p>
        {chip}
        <button className="btn" disabled={!sizes.length} onClick={() => setPhase('ready')}>Başla</button>
        <button className="btn btn-ghost" onClick={onCancel}>Vazgeç</button>
      </main>
    )
  }

  const fs = fontSizeCssPx(sizes[idx], REFERENCE_MM, pxPerMm, xRatio)

  return (
    <div className="stimulus-area reading-area">
      {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
      <div className="stimulus-top">
        <span>{idx + 1}/{sizes.length}</span>
        {chip}
      </div>
      {phase === 'ready' && (
        <button className="btn" onClick={show} disabled={status !== 'ok'}>
          {status === 'ok' ? 'Hazırım — cümleyi göster' : "Telefonu 40 cm'ye getirin"}
        </button>
      )}
      {phase === 'reading' && (
        <>
          <p
            className="reading-text"
            style={{ fontSize: `${fs}px`, fontFamily: FONT }}
            onClick={() => record((performance.now() - t0.current) / 1000)}
          >
            {sentences[idx]}
          </p>
          <button className="btn btn-ghost" onClick={() => record(null)}>Okuyamıyorum</button>
        </>
      )}
    </div>
  )
}
