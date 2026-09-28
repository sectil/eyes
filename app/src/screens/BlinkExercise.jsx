import { useEffect, useRef, useState } from 'react'
import { Camera, Play, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import SoundToggle from '../components/SoundToggle.jsx'
import { Arena, EyeArt, RhythmStrip, useIrisArt } from '../components/ExerciseArt.jsx'
import { indicesFromConnections } from '../lib/distance.js'
import { BLINK_CYCLE, BLINK_REPS, CLOSURES_PER_CYCLE, eyeOpenness } from '../lib/blink.js'
import { trueDepthCounter, cameraCounter } from '../lib/blinkCounters.js'
import { median } from '../lib/trend.js'
import { unlockAudio } from '../lib/cue.js'
import { cuePhrase, sayPhrase, preloadPhrases } from '../lib/voiceCue.js'
import { unlockBreathSfx, releaseBreathSfx } from '../lib/breathSfx.js'
import '../styles/exercise.css'

// Göz kırpma egzersizi (Artifact "Nefona Egzersiz Sahnesi", onaylı): giriş → hazırlık (2 sn açık göz ölçümü) → 15 tekrar → bitiş.
// Ritim lib/blink.js BLINK_CYCLE; her adımda ElevenLabs sesli komut (gözler kapalıyken ekran okunamaz).
const BASELINE_MS = 2000
const CYCLE_MS = BLINK_CYCLE.reduce((a, s) => a + s.ms, 0)
const UI_TICK_MS = 100 // ritim şeridi ve halka için görsel güncelleme

export default function BlinkExercise({ onFinish, onBack, trueDepth = false }) {
  const [useCam, setUseCam] = useState(false)
  const [phase, setPhase] = useState('intro') // intro | baseline | run | done
  const [rep, setRep] = useState(0)
  const [step, setStep] = useState(0)
  const [closures, setClosures] = useState(0)
  const [elapsed, setElapsed] = useState(0) // adım (ya da hazırlık) başından beri ms
  const idx = useRef(null)
  const baseSamples = useRef([])
  const counter = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const stepStart = useRef(0)
  const startedAt = useRef(0) // süre kaydı (veri merkezi: Gelişim tahmin değil gerçek süre görsün)
  const art = useIrisArt()

  const cam = useFaceTracking({
    enabled: useCam && phase !== 'intro' && phase !== 'done',
    trueDepth,
    onFrame: (m) => {
      if (m.native) {
        // TrueDepth: ARKit göz kırpma değeri 0 (açık) … 1 (kapalı) → açıklık = 1 − değer
        if (!m.face || m.blinkLeft == null) return
        const closure = (m.blinkLeft + m.blinkRight) / 2
        if (phaseRef.current === 'baseline') baseSamples.current.push(1 - closure)
        else if (phaseRef.current === 'run' && counter.current?.push(closure, m.ts)) setClosures((c) => c + 1)
        return
      }
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
      else if (phaseRef.current === 'run' && counter.current?.push(o, m.ts)) setClosures((c) => c + 1)
    },
  })

  // Seslendirmeyi baştan çöz; ekrandan çıkınca ses oturumu bırakılır
  useEffect(() => {
    preloadPhrases()
    return () => releaseBreathSfx(0)
  }, [])

  // Temel açıklık ölçümü → egzersiz
  useEffect(() => {
    if (phase !== 'baseline') return undefined
    stepStart.current = performance.now()
    setElapsed(0)
    sayPhrase('blLook')
    const t = setTimeout(() => {
      const b = median(baseSamples.current) // gözler açıkken açıklık ortancası
      counter.current = b ? (cam.native ? trueDepthCounter(1 - b) : cameraCounter(b)) : null
      setPhase('run')
    }, BASELINE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Her adımın başında sesli yönlendirme + titreşim (gözler kapalıyken ekran okunamaz)
  useEffect(() => {
    if (phase !== 'run') return
    stepStart.current = performance.now()
    setElapsed(0)
    cuePhrase(BLINK_CYCLE[step].voice, BLINK_CYCLE[step].closed)
  }, [phase, step, rep])

  // Adım zamanlayıcı
  useEffect(() => {
    if (phase !== 'run') return undefined
    const t = setTimeout(() => {
      if (step + 1 < BLINK_CYCLE.length) setStep(step + 1)
      else if (rep + 1 < BLINK_REPS) {
        setRep(rep + 1)
        setStep(0)
      } else {
        cuePhrase('done', false)
        releaseBreathSfx()
        setPhase('done')
      }
    }, BLINK_CYCLE[step].ms)
    return () => clearTimeout(t)
  }, [phase, step, rep])

  // Görsel ilerleme (ritim şeridi, halka)
  useEffect(() => {
    if (phase !== 'run' && phase !== 'baseline') return undefined
    const t = setInterval(() => setElapsed(performance.now() - stepStart.current), UI_TICK_MS)
    return () => clearInterval(t)
  }, [phase])

  function start(withCam) {
    unlockAudio()
    unlockBreathSfx() // ses oturumu 'playback': sessiz tuşunda da duyulur
    setUseCam(withCam)
    baseSamples.current = []
    setClosures(0)
    setRep(0)
    setStep(0)
    startedAt.current = performance.now()
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
      seconds: startedAt.current ? Math.round((performance.now() - startedAt.current) / 1000) : undefined,
    })
  }

  const video = useCam ? <video ref={cam.videoRef} className="cam-hidden" playsInline muted /> : null

  if (phase === 'intro') {
    return (
      <main className="ex-stage ex-start">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
          <span style={{ flex: 1 }} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-intro ex-blink-intro">
          <span className="ex-step">Göz konforu · <b>~2,5 dk</b></span>
          <h1 className="ex-title">Göz kırpma egzersizi</h1>
          <p className="ex-para">Ekrana uzun bakarken kırpmalar seyrekleşir ve yarım kalır. Bu egzersiz tam kırpmayı hatırlatır; günde 3 kez önerilir.</p>
          <svg className="ex-hero" viewBox="0 20 260 220" aria-hidden="true"><EyeArt state="open" img={art.eye} clipId="ex-hero-clip" /></svg>
          <span className="ex-step">Bir tekrar · {CYCLE_MS / 1000} sn · <b>{BLINK_REPS} tekrar</b></span>
          <RhythmStrip cycle={BLINK_CYCLE} />
          <p className="ex-para" style={{ fontSize: '0.88rem', color: 'var(--ex-ink3)' }}>Gözlerin kapalıyken seni sesle yönlendiririm.</p>
          <details className="ex-ev">
            <summary>Bu neye dayanıyor? <ChevronRight aria-hidden="true" /></summary>
            <p>
              Kuru göz yakınması olan kişilerde yapılan kontrollü çalışmalarda benzer göz kırpma egzersizleri yakınmaları ve
              yarım göz kırpmayı azalttı (Wolffsohn ve ark. 2025; Kim ve ark. 2020). Egzersiz bırakılınca etki yaklaşık 2 haftada
              kayboldu. Tedavi değildir; yakınmaların sürerse göz doktoruna başvur.
            </p>
          </details>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={() => start(true)}><Camera aria-hidden="true" /> Kamerayla başla</button>
          <button type="button" className="ex-btn ghost" onClick={() => start(false)}><Play aria-hidden="true" fill="currentColor" /> Kamerasız başla</button>
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    const tracked = useCam && counter.current != null
    return (
      <main className="ex-stage ex-end">
        <div className="ex-res">
          <svg className="ex-badge" viewBox="0 0 180 180" width="160" height="160" aria-hidden="true">
            <circle className="halo" cx="90" cy="90" r="70" />
            <circle className="disc" cx="90" cy="90" r="46" />
            <path className="tick" d="M70 91 l14 14 l28 -30" strokeWidth="8" />
          </svg>
          <span className="ex-step">Göz kırpma · <b>{BLINK_REPS} tekrar</b></span>
          <h1 className="ex-title">Tamamlandı</h1>
          {tracked && (
            <div className="ex-stats">
              <div><b>{BLINK_REPS}</b><span>tekrar</span></div>
              <div><b>{closures} / {BLINK_REPS * CLOSURES_PER_CYCLE}</b><span>algılanan kapanma</span></div>
            </div>
          )}
          <p className="ex-honest">
            {tracked ? 'Kamera sayımı ışığa ve açıya bağlıdır; yaklaşık bir göstergedir. ' : ''}Tedavi değildir; yakınman sürerse göz doktoruna başvur.
          </p>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={save}><Check aria-hidden="true" /> Kaydet</button>
        </div>
      </main>
    )
  }

  // Hazırlık ve tekrarlar
  const baseline = phase === 'baseline'
  const s = BLINK_CYCLE[step]
  const stepPart = Math.min(1, elapsed / (baseline ? BASELINE_MS : s.ms))
  const before = BLINK_CYCLE.slice(0, step).reduce((a, c) => a + c.ms, 0)
  const repPart = baseline ? stepPart : Math.min(1, (before + stepPart * s.ms) / CYCLE_MS)
  const eyeState = baseline || !s.closed ? 'open' : s.squeeze ? 'squeeze' : 'closed'
  let st
  if (baseline) st = cam.error ? { text: 'Kamera açılamadı · sayım olmadan devam', tone: 'n' } : cam.ready ? { text: 'Yüzün görünüyor · açık gözü ölçüyorum', tone: 'ok' } : { text: 'Kamera hazırlanıyor…', tone: 'n' }
  else if (useCam && counter.current) st = { text: `Algılanan kapanma: ${closures}`, tone: 'ok' }
  else if (useCam) st = { text: 'Kamera göz açıklığını ölçemedi; sayım kapalı', tone: 'n' }
  else st = { text: 'Kamerasız · sesle ritim', tone: 'n' }

  return (
    <main className="ex-stage">
      {video}
      <div className="ex-top">
        <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
        <div className="ex-segs" role="progressbar" aria-label={`Tekrar ${rep + 1} / ${BLINK_REPS}`} aria-valuemin={0} aria-valuemax={BLINK_REPS} aria-valuenow={rep + 1}>
          {Array.from({ length: BLINK_REPS }, (_, i) => (
            <span key={i} className={!baseline && i < rep ? 'd' : ''}>
              {!baseline && i === rep && <i style={{ width: `${repPart * 100}%` }} />}
            </span>
          ))}
        </div>
        <SoundToggle className="ex-sound" />
      </div>

      <div className="ex-copy" key={baseline ? 'b' : `${rep}-${step}`}>
        <span className="ex-step">Göz kırpma · <b>{baseline ? 'hazırlık' : `tekrar ${rep + 1} / ${BLINK_REPS}`}</b></span>
        <h1 className="ex-title" aria-live="assertive">{baseline ? 'Gözlerin açık, ekrana bak' : s.text}</h1>
      </div>

      <div className="ex-mid">
        <Arena progress={repPart}><EyeArt state={eyeState} img={art.eye} /></Arena>
      </div>

      <div className="ex-now">
        <RhythmStrip cycle={BLINK_CYCLE} cur={baseline ? -1 : step} part={stepPart} />
      </div>
      <div className="ex-st" role="status"><span className={st.tone}>{st.text}</span></div>
      <div className="ex-foot" />
    </main>
  )
}
