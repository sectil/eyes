import { useEffect, useRef, useState } from 'react'
import TumblingE from '../components/TumblingE.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { distanceStatus, REFERENCE_MM } from '../lib/distance.js'
import { logMARForHeight, renderSpec, smallestDrawableLogMAR, snellen20 } from '../lib/optotype.js'
import { createZest, randomDirection, PLANS } from '../lib/zest.js'

const EYES = [
  { id: 'R', title: 'Sağ göz', cover: 'Sol gözünüzü avucunuzla hafifçe kapatın (bastırmadan).' },
  { id: 'L', title: 'Sol göz', cover: 'Sağ gözünüzü avucunuzla hafifçe kapatın (bastırmadan).' },
  { id: 'OU', title: 'İki göz', cover: 'İki gözünüz de açık.' },
]
const WARMUP_LOGMAR = 0.9
const SWIPE_MIN_PX = 30

function swipeDirection(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return null
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

export default function AcuityTest({ plan = 'daily', calibration, distanceCal, onFinish, onCancel }) {
  const { warmup, trials } = PLANS[plan]
  const pxPerMm = calibration.pxPerMm
  const dpr = calibration.dpr
  const tracked = Boolean(distanceCal)

  const [eyeIdx, setEyeIdx] = useState(0)
  const [phase, setPhase] = useState('instructions') // instructions | trial | eye-done
  const [trialNo, setTrialNo] = useState(0) // ısınma dahil
  const [dir, setDir] = useState(randomDirection())
  const [feedback, setFeedback] = useState(null)
  const results = useRef([])
  const zest = useRef(null)
  const distSamples = useRef([])
  const pointer = useRef(null)

  const cam = useFaceTracking({ enabled: tracked, distanceCal })
  const liveMm = tracked ? cam.mm : null
  const status = tracked ? distanceStatus(liveMm) : 'ok'
  const paused = tracked && phase === 'trial' && status !== 'ok'

  const eye = EYES[eyeIdx]
  const isWarmup = trialNo < warmup
  const minX = Math.max(-0.3, smallestDrawableLogMAR(REFERENCE_MM, pxPerMm, dpr) + 0.02)
  const target = isWarmup ? WARMUP_LOGMAR : zest.current?.next() ?? 0.5
  const spec = renderSpec(target, REFERENCE_MM, pxPerMm, dpr)

  function startEye() {
    zest.current = createZest({ minX, maxX: 1.3 })
    distSamples.current = []
    setTrialNo(0)
    setDir(randomDirection())
    setPhase('trial')
  }

  function answer(choice) {
    if (phase !== 'trial' || paused || feedback) return
    const correct = choice === dir
    const mm = liveMm ?? REFERENCE_MM
    if (!isWarmup) {
      // Gerçekte gösterilen boyut ve gerçek mesafe ile logMAR
      const heightMm = spec.heightCssPx / pxPerMm
      const shown = logMARForHeight(heightMm, mm)
      zest.current.update(shown, correct)
      if (liveMm) distSamples.current.push(liveMm)
    }
    setFeedback(correct ? 'ok' : 'no')
    setTimeout(() => {
      setFeedback(null)
      const next = trialNo + 1
      if (next >= warmup + trials) {
        finishEye()
      } else {
        setTrialNo(next)
        setDir(randomDirection())
      }
    }, 250)
  }

  function finishEye() {
    const est = zest.current.estimate()
    const d = distSamples.current
    results.current.push({
      type: plan === 'daily' ? 'va-daily' : 'va-weekly',
      eye: eye.id,
      logMAR: +est.logMAR.toFixed(3),
      sd: +est.sd.toFixed(3),
      trials: est.trials,
      outOfRange: est.atCeiling ? 'ceiling' : est.atFloor ? 'floor' : null,
      distanceTracked: tracked && d.length > 0,
      meanDistanceMm: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : null,
      device: { pxPerMm, dpr, screenW: window.screen.width, screenH: window.screen.height },
    })
    setPhase('eye-done')
  }

  function nextEye() {
    if (eyeIdx + 1 < EYES.length) {
      setEyeIdx(eyeIdx + 1)
      setPhase('instructions')
    } else {
      onFinish(results.current)
    }
  }

  // Klavye desteği (masaüstünde deneme için)
  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      if (map[e.key]) answer(map[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const distanceChip = tracked && (
    <div className={`chip chip-${status}`}>
      {liveMm ? `${Math.round(liveMm / 10)} cm` : 'yüz aranıyor'}
      {status === 'too-close' && ' · biraz uzaklaştırın'}
      {status === 'too-far' && ' · biraz yaklaştırın'}
    </div>
  )

  return (
    <div className="test-root">
      {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}

      {phase === 'instructions' && (
        <main className="screen">
          <h1>{eye.title}</h1>
          <p>{eye.cover}</p>
          <ul className="steps">
            <li>Telefonu gözlerinizden <strong>40 cm</strong> uzakta tutun.</li>
            <li>Ekran parlaklığını en yükseğe alın; iyi aydınlatılmış bir yerde olun.</li>
            <li>E harfinin açık tarafı hangi yöne bakıyorsa ekranda <strong>o yöne kaydırın</strong>.</li>
            <li>Emin değilseniz de tahmin edin — test bunu hesaba katar.</li>
            <li>İlk {warmup} harf alıştırmadır, sayılmaz.</li>
          </ul>
          {distanceChip}
          <button className="btn" onClick={startEye}>Başla</button>
          <button className="btn btn-ghost" onClick={onCancel}>Vazgeç</button>
        </main>
      )}

      {phase === 'trial' && (
        <div
          className={`stimulus-area ${feedback ? `fb-${feedback}` : ''}`}
          onPointerDown={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            if (!pointer.current) return
            const d = swipeDirection(e.clientX - pointer.current.x, e.clientY - pointer.current.y)
            pointer.current = null
            if (d) answer(d)
          }}
        >
          <div className="stimulus-top">
            <span>{eye.title} · {isWarmup ? 'alıştırma' : `${trialNo - warmup + 1}/${trials}`}</span>
            {distanceChip}
          </div>
          {paused ? (
            <p className="paused">Telefonu 40 cm'ye getirin</p>
          ) : spec.drawable && !feedback ? (
            <TumblingE unit={spec.unitCssPx} direction={dir} />
          ) : null}
          <div className="arrow-row" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
            {[['left', '←'], ['up', '↑'], ['down', '↓'], ['right', '→']].map(([d, s]) => (
              <button key={d} className="arrow" onClick={() => answer(d)} aria-label={d}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {phase === 'eye-done' && (
        <main className="screen">
          <h1>{eye.title} tamamlandı</h1>
          <p className="big">
            {results.current.at(-1).logMAR.toFixed(2)} logMAR
            <span className="muted"> ({snellen20(results.current.at(-1).logMAR)} karşılığı)</span>
          </p>
          {results.current.at(-1).outOfRange === 'ceiling' && (
            <p className="alert-warn small">
              Sonuç ölçüm aralığının dışında (ekranın gösterebildiği en büyük harf görülemedi).
              Test koşullarını kontrol edin; görmeniz gerçekten bu düzeydeyse bir göz doktoruna başvurun.
            </p>
          )}
          {results.current.at(-1).outOfRange === 'floor' && (
            <p className="muted small">Ekranın gösterebildiği en küçük harfi de gördünüz; gerçek değeriniz daha iyi olabilir.</p>
          )}
          <p className="muted small">
            Tek bir testin doğal oynaması yaklaşık ±0,2 logMAR'dır. Değişimi grafikte,
            birkaç günün ortalamasıyla değerlendiriyoruz.
          </p>
          <button className="btn" onClick={nextEye}>
            {eyeIdx + 1 < EYES.length ? `Sıradaki: ${EYES[eyeIdx + 1].title}` : 'Sonuçları kaydet'}
          </button>
        </main>
      )}
    </div>
  )
}

export { swipeDirection }
