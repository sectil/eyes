import { useRef, useState } from 'react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'

const SAMPLES = 30

export default function DistanceCalibration({ onDone, onSkip }) {
  const [phase, setPhase] = useState('intro') // intro | measuring | done
  const samples = useRef([])
  const finished = useRef(false)
  const [progress, setProgress] = useState(0)

  const { videoRef, ready, error, face } = useFaceTracking({
    enabled: phase !== 'intro',
    onFrame: (m) => {
      if (phase !== 'measuring' || finished.current || !m.irisPx) return
      samples.current.push({ irisPx: m.irisPx, videoW: m.videoW })
      setProgress(samples.current.length)
      if (samples.current.length >= SAMPLES) finish()
    },
  })

  function finish() {
    finished.current = true
    const vals = samples.current.map((s) => s.irisPx).sort((a, b) => a - b)
    const median = vals[vals.length >> 1]
    setPhase('done')
    onDone({
      irisPxAt40: median,
      videoW: samples.current[0].videoW,
      date: new Date().toISOString(),
    })
  }

  function start() {
    samples.current = []
    finished.current = false
    setProgress(0)
    setPhase('measuring')
  }

  return (
    <main className="screen">
      <h1>Mesafe kalibrasyonu</h1>
      <p className="muted">
        Testlerde telefonun gözünüzden <strong>40 cm</strong> uzakta durması gerekir. Ön
        kamera bunu gözünüzün (irisin) görüntüdeki boyutundan takip eder. Bunun için bir
        kez ölçmemiz gerekiyor.
      </p>
      <ol className="steps">
        <li>Bir cetvel, mezura veya 40 cm'lik bir ip hazırlayın.</li>
        <li>Telefonu yüzünüzün karşısında, gözlerinizden tam 40 cm uzakta tutun (iyi ışıkta).</li>
        <li>Uzak gözlüğünüz varsa takın; ekrana düz bakın.</li>
        <li>"Ölç" düğmesine basın ve 2–3 saniye sabit durun.</li>
      </ol>

      <video ref={videoRef} className="cam-preview" playsInline muted />

      {error === 'permission' && (
        <p className="alert-warn">
          Kamera izni verilmedi. Mesafe takibi olmadan da test yapabilirsiniz, ancak
          sonuçlar daha az güvenilir olur.
        </p>
      )}
      {error === 'load' && (
        <p className="alert-warn">
          Yüz takip modeli yüklenemedi (ilk kullanımda internet gerekir).
        </p>
      )}

      {phase === 'intro' && (
        <button className="btn" onClick={() => setPhase('preview')}>Kamerayı aç</button>
      )}
      {phase === 'preview' && (
        <>
          <p className="muted small">
            {!ready ? 'Kamera hazırlanıyor…' : face ? 'Yüzünüz görünüyor ✓' : 'Yüzünüz görünmüyor — ışığı ve açıyı kontrol edin'}
          </p>
          <button className="btn" disabled={!ready || !face} onClick={start}>Ölç (40 cm'deyim)</button>
        </>
      )}
      {phase === 'measuring' && (
        <p className="muted">Ölçülüyor… {Math.round((progress / SAMPLES) * 100)}%</p>
      )}

      {(error || phase === 'intro') && onSkip && (
        <button className="btn btn-ghost" onClick={onSkip}>Kamerasız devam et</button>
      )}
    </main>
  )
}
