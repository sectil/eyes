import { useRef, useState } from 'react'
import { Camera, Ruler } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { StepHeader } from '../components/ui.jsx'

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
    <main className="screen fade-in">
      <StepHeader
        step={3}
        total={3}
        title="40 cm'yi öğretelim"
        subtitle="Testlerde telefon gözünden 40 cm uzakta durmalı. Ön kamera bunu irisinin boyutundan takip eder; bunun için bir kez ölçüyoruz."
      />
      <ol className="steps">
        <li>Bir cetvel, mezura veya 40 cm'lik bir ip hazırla.</li>
        <li>Telefonu yüzünün karşısında, gözlerinden tam <strong>40 cm</strong> uzakta, iyi ışıkta tut.</li>
        <li>Uzak gözlüğün varsa tak; ekrana düz bak.</li>
        <li>"Ölç"e bas ve 2–3 saniye sabit dur.</li>
      </ol>

      <video ref={videoRef} className="cam-preview" playsInline muted hidden={phase === 'intro'} />

      {error === 'permission' && (
        <div className="card tone-warn small">Kamera izni verilmedi. Mesafe takibi olmadan da test yapabilirsin; sonuçlar daha az güvenilir olur.</div>
      )}
      {error === 'load' && (
        <div className="card tone-warn small">Yüz takip modeli yüklenemedi (ilk kullanımda internet gerekir).</div>
      )}

      {phase === 'intro' && (
        <button className="btn" onClick={() => setPhase('preview')}>
          <Camera size={18} aria-hidden="true" /> Kamerayı aç
        </button>
      )}
      {phase === 'preview' && (
        <>
          <span className={`chip ${face ? 'chip-ok' : 'chip-unknown'}`} style={{ alignSelf: 'flex-start' }}>
            {!ready ? 'Kamera hazırlanıyor…' : face ? 'Yüzün görünüyor' : 'Yüzün görünmüyor — ışığı ve açıyı kontrol et'}
          </span>
          <button className="btn" disabled={!ready || !face} onClick={start}>
            <Ruler size={18} aria-hidden="true" /> Ölç (40 cm'deyim)
          </button>
        </>
      )}
      {phase === 'measuring' && (
        <div className="stack">
          <div className="stepper"><span className="on" style={{ flex: progress / SAMPLES }} /><span style={{ flex: 1 - progress / SAMPLES }} /></div>
          <p className="muted">Ölçülüyor… {Math.round((progress / SAMPLES) * 100)}%</p>
        </div>
      )}

      {(error || phase === 'intro') && onSkip && (
        <button className="btn btn-ghost" onClick={onSkip}>Kamerasız devam et</button>
      )}
    </main>
  )
}
