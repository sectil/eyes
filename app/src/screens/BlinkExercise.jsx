import { useEffect, useRef, useState } from 'react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { indicesFromConnections } from '../lib/distance.js'
import { BLINK_CYCLE, BLINK_REPS, CLOSURES_PER_CYCLE, createClosureCounter, eyeOpenness } from '../lib/blink.js'
import { median } from '../lib/trend.js'
import { cue, unlockAudio } from '../lib/cue.js'

const BASELINE_MS = 2000

export default function BlinkExercise({ onFinish, onBack }) {
  const [useCam, setUseCam] = useState(false)
  const [phase, setPhase] = useState('intro') // intro | baseline | run | done
  const [rep, setRep] = useState(0)
  const [step, setStep] = useState(0)
  const [closures, setClosures] = useState(0)
  const idx = useRef(null)
  const baseSamples = useRef([])
  const counter = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const cam = useFaceTracking({
    enabled: useCam && phase !== 'intro' && phase !== 'done',
    onFrame: (m) => {
      if (!m.landmarks) return
      if (!idx.current) {
        idx.current = {
          l: indicesFromConnections(m.ctx.leftEye),
          r: indicesFromConnections(m.ctx.rightEye),
        }
      }
      const vals = [eyeOpenness(m.landmarks, idx.current.l), eyeOpenness(m.landmarks, idx.current.r)].filter((v) => v != null)
      if (!vals.length) return
      const o = vals.reduce((a, b) => a + b, 0) / vals.length
      if (phaseRef.current === 'baseline') baseSamples.current.push(o)
      else if (phaseRef.current === 'run' && counter.current?.update(o)) setClosures((c) => c + 1)
    },
  })

  // Temel açıklık ölçümü → egzersiz
  useEffect(() => {
    if (phase !== 'baseline') return undefined
    const t = setTimeout(() => {
      const b = median(baseSamples.current)
      counter.current = b ? createClosureCounter(b) : null
      setPhase('run')
    }, BASELINE_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Her adımın başında sesli/tonlu yönlendirme (gözler kapalıyken ekran okunamaz)
  useEffect(() => {
    if (phase === 'run') cue(BLINK_CYCLE[step].text, BLINK_CYCLE[step].closed)
  }, [phase, step, rep])

  // Adım zamanlayıcı
  useEffect(() => {
    if (phase !== 'run') return undefined
    const t = setTimeout(() => {
      if (step + 1 < BLINK_CYCLE.length) setStep(step + 1)
      else if (rep + 1 < BLINK_REPS) {
        setRep(rep + 1)
        setStep(0)
      } else setPhase('done')
    }, BLINK_CYCLE[step].ms)
    return () => clearTimeout(t)
  }, [phase, step, rep])

  function start(withCam) {
    unlockAudio()
    setUseCam(withCam)
    baseSamples.current = []
    setClosures(0)
    setRep(0)
    setStep(0)
    setPhase(withCam ? 'baseline' : 'run')
  }

  function save() {
    const tracked = useCam && counter.current != null
    onFinish({
      type: 'blink',
      reps: BLINK_REPS,
      cameraUsed: tracked,
      detectedClosures: tracked ? closures : null,
      expectedClosures: BLINK_REPS * CLOSURES_PER_CYCLE,
    })
  }

  const s = BLINK_CYCLE[step]

  return (
    <main className="screen">
      {useCam && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}
      <h1>Göz kırpma egzersizi</h1>

      {phase === 'intro' && (
        <>
          <p>
            Ekranda uzun süre bakarken göz kırpmalarımız seyrekleşir ve yarım kalır. Bu egzersiz
            tam göz kırpmayı hatırlatır. Yaklaşık 2,5 dakika sürer; günde 3 kez önerilir.
          </p>
          <p className="muted small">
            Gözleriniz kapalıyken sizi sesle yönlendiririz; sesi açın. Türkçe sesli okuma yoksa:
            kalın ses = kapatın, ince ses = açın.
          </p>
          <details className="card">
            <summary>Bu neye dayanıyor?</summary>
            <p className="small">
              Kuru göz yakınması olan kişilerde yapılan kontrollü çalışmalarda benzer göz kırpma
              egzersizleri yakınmaları ve yarım göz kırpmayı azalttı (Wolffsohn ve ark. 2025;
              Kim ve ark. 2020). Egzersiz bırakılınca etki yaklaşık 2 haftada kayboldu.
              Egzersiz bir tedavi değildir; yakınmalarınız sürerse göz doktorunuza başvurun.
            </p>
          </details>
          <button className="btn" onClick={() => start(true)}>Kamerayla başla (kapanmaları sayar)</button>
          <button className="btn btn-ghost" onClick={() => start(false)}>Kamerasız başla</button>
          <button className="btn btn-ghost" onClick={onBack}>Geri</button>
        </>
      )}

      {phase === 'baseline' && (
        <p className="big">{cam.ready ? 'Gözleriniz açık, ekrana bakın…' : 'Kamera hazırlanıyor…'}</p>
      )}

      {phase === 'run' && (
        <section className={`blink-stage ${s.closed ? 'closed' : 'open'}`} aria-live="assertive">
          <p className="muted">Tekrar {rep + 1} / {BLINK_REPS}</p>
          <p className="blink-cue">{s.text}</p>
          <div className="blink-bar" key={`${rep}-${step}`} style={{ animationDuration: `${s.ms}ms` }} />
          {useCam && counter.current && <p className="muted small">Algılanan kapanma: {closures}</p>}
          {useCam && !counter.current && <p className="muted small">Kamera göz açıklığını ölçemedi; sayım kapalı.</p>}
        </section>
      )}

      {phase === 'done' && (
        <>
          <p className="big">Tamamlandı</p>
          {useCam && counter.current && (
            <p className="muted">
              Algılanan kapanma: {closures} / beklenen {BLINK_REPS * CLOSURES_PER_CYCLE}.
              Kamera sayımı ışık ve açıya bağlıdır; yaklaşık bir göstergedir.
            </p>
          )}
          <button className="btn" onClick={save}>Kaydet</button>
        </>
      )}
    </main>
  )
}
