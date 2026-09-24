import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Mountain, Hand, EyeOff, Trophy, Info, ScanFace } from 'lucide-react'
import { Ring } from '../components/ui.jsx'
import { EXERCISES, DAILY_GOAL_MIN, formatMin, setDurationSec } from '../lib/routines.js'
import { cue, unlockAudio } from '../lib/cue.js'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { eyeClosure, gazeVector, gazeDirection, createBlinkCounter, createHoldTimer, createCircleTracker, BLINK_CLOSE } from '../lib/gaze.js'

const ARROWS = { right: ArrowRight, left: ArrowLeft, up: ArrowUp, down: ArrowDown }
const DIR_WORD = { right: 'sağa', left: 'sola', up: 'yukarı', down: 'aşağı' }
const KIND_LABEL = {
  evidence: 'Kanıtlı egzersiz',
  comfort: 'Göz konforu molası',
  relax: 'Rahatlama hareketi',
}
// Kamerayla takip edilen adımlar (görsel türüne göre). Diğerleri (uzak/yakın bakış) süreyle ilerler:
// kamera gözün nereye odaklandığını ölçemez.
const SENSOR_BY_VISUAL = { blink: 'blinks', arrow: 'hold', circle: 'laps', rest: 'closed' }
const FACE_LOST_MS = 1500

function Visual({ ex, tick }) {
  if (ex.visual === 'arrow') {
    const Icon = ARROWS[ex.dir]
    return <Icon size={96} strokeWidth={2.2} className="routine-arrow" />
  }
  if (ex.visual === 'circle') {
    return (
      <div className={`orbit ${ex.dir}`}>
        <span className="orbit-dot" />
      </div>
    )
  }
  if (ex.visual === 'far') return <Mountain size={96} strokeWidth={1.6} className="routine-arrow" />
  if (ex.visual === 'nearfar') {
    const near = Math.floor(tick / 3) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center' }}>
        {near ? <Hand size={88} strokeWidth={1.6} className="routine-arrow" /> : <Mountain size={88} strokeWidth={1.6} className="routine-arrow" />}
        <span className="routine-sub">{near ? 'Başparmağına bak' : 'Uzağa bak'}</span>
      </div>
    )
  }
  if (ex.visual === 'blink') {
    // 4 sn ritim: 2 sn kapat, 2 sn aç
    const closed = Math.floor(tick / 2) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center', gap: 14 }}>
        <div className={`blink-orb ${closed ? 'shut' : ''}`} />
        <span className="routine-sub">{closed ? 'Kapat · hafifçe sık' : 'Aç'}</span>
      </div>
    )
  }
  return <EyeOff size={88} strokeWidth={1.6} className="routine-arrow" />
}

// Canlı bakış noktası: kameranın gözünü nereye baktığını sandığını gösterir.
function GazeDot({ gaze, ok }) {
  const x = Math.max(-1, Math.min(1, gaze.x / 0.6))
  const y = Math.max(-1, Math.min(1, gaze.y / 0.6))
  return (
    <div className={`gaze-pad ${ok ? 'ok' : ''}`} aria-hidden="true">
      <span className="gaze-cross" />
      <span className="gaze-dot" style={{ left: `${50 + x * 40}%`, top: `${50 - y * 40}%` }} />
    </div>
  )
}

function newTrackers(ex) {
  return { blink: createBlinkCounter(), hold: createHoldTimer(), circle: createCircleTracker(ex?.dir) }
}

export default function Routine({ set, todaySec, onFinish, onBack, trueDepth = false }) {
  const steps = set.steps.map((id) => ({ id, ...EXERCISES[id] }))
  const [idx, setIdx] = useState(0)
  const [tick, setTick] = useState(0) // adım başından beri geçen saniye (görsel ritim için)
  const [timer, setTimer] = useState(0) // süreyle ilerleme (takip yokken)
  const [done, setDone] = useState(false)
  const [live, setLive] = useState({ value: 0, ok: false, wrongWay: false, gaze: { x: 0, y: 0 } })
  const spent = useRef(0)
  const faceTs = useRef(0)
  const trackers = useRef(null)
  const lastUi = useRef(0)
  const ex = steps[idx]
  const sensor = trueDepth && ex ? SENSOR_BY_VISUAL[ex.visual] ?? null : null
  const exRef = useRef(ex)
  exRef.current = ex
  const sensorRef = useRef(sensor)
  sensorRef.current = sensor
  if (!trackers.current) trackers.current = newTrackers(ex)

  const faceLost = () => performance.now() - faceTs.current > FACE_LOST_MS

  const onFrame = (m) => {
    const kind = sensorRef.current
    if (!kind || !m.face) return
    faceTs.current = m.ts
    const t = trackers.current
    const cur = exRef.current
    const closure = eyeClosure(m)
    const open = closure < BLINK_CLOSE
    const gaze = gazeVector(m)
    let value = 0
    let ok = false
    let wrongWay = false
    if (kind === 'blinks') {
      value = t.blink.push(closure, m.ts)
      ok = t.blink.closed
    } else if (kind === 'hold') {
      ok = open && gazeDirection(gaze) === cur.dir
      value = t.hold.push(ok, m.ts) / 1000
    } else if (kind === 'laps') {
      const st = open ? t.circle.push(gaze) : t.circle.state
      value = st.laps + st.progress
      ok = !st.wrongWay
      wrongWay = st.wrongWay
    } else if (kind === 'closed') {
      ok = !open
      value = t.hold.push(ok, m.ts) / 1000
    }
    if (m.ts - lastUi.current > 90 || value >= goalOf(cur, kind)) {
      lastUi.current = m.ts
      setLive({ value, ok, wrongWay, gaze })
    }
  }

  const { ready: trackReady } = useFaceTracking({ enabled: trueDepth && !done, trueDepth: true, onFrame })

  // Adım başında sesli yönlendirme (gözler kapalı adımlarda ekran okunamaz)
  useEffect(() => {
    if (!done && ex) cue(ex.title, Boolean(ex.closed))
  }, [idx, done])

  // Nabız: saniyede bir. Takip edilen adımlarda süre yalnızca yüz görünmüyorken işler.
  useEffect(() => {
    if (done) return undefined
    const t = setInterval(() => {
      spent.current += 1
      setTick((v) => v + 1)
      if (!sensorRef.current || faceLost()) setTimer((v) => v + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  const goal = ex ? goalOf(ex, sensor) : 0
  const sensorDone = sensor && live.value >= goal
  const timerDone = ex && timer >= ex.seconds

  useEffect(() => {
    if (!done && ex && (sensorDone || timerDone)) next()
  }, [sensorDone, timerDone])

  function next() {
    if (idx + 1 < steps.length) {
      trackers.current = newTrackers(steps[idx + 1])
      setLive({ value: 0, ok: false, wrongWay: false, gaze: { x: 0, y: 0 } })
      setIdx(idx + 1)
      setTick(0)
      setTimer(0)
    } else {
      cue('Tamamlandı', false)
      setDone(true)
    }
  }

  useEffect(() => {
    unlockAudio()
  }, [])

  if (done) {
    const total = todaySec + spent.current
    const dailyGoal = DAILY_GOAL_MIN * 60
    return (
      <main className="screen fade-in routine-screen">
        <section className="card card-hero" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <Ring value={Math.min(total, dailyGoal)} max={dailyGoal} size={132} stroke={12}>
            {total >= dailyGoal ? <Trophy size={40} style={{ color: 'var(--accent)' }} /> : <span className="ring-label">{formatMin(total)}</span>}
          </Ring>
          <h1>{total >= dailyGoal ? 'Günlük hedef tamam!' : `${set.title} set tamamlandı`}</h1>
          <p className="muted">Bugünkü toplam: {formatMin(total)} · hedef {DAILY_GOAL_MIN} dk</p>
        </section>
        <p className="note">
          <Info size={16} />
          Bakış ve daire hareketleri rahatlama amaçlıdır; görmeyi iyileştirdiklerine dair bilimsel kanıt yoktur. Görmendeki değişimi "E hangi yönde" testiyle ölçüyoruz.
        </p>
        <button className="btn" onClick={() => onFinish({ type: 'routine', setId: set.id, seconds: spent.current, steps: steps.length })}>
          Kaydet
        </button>
      </main>
    )
  }

  // Takip durumu: yüz görünüyor mu? (sensör adımlarında)
  const tracking = sensor && trackReady && !faceLost()
  const frac = tracking || (sensor && live.value > 0) ? Math.min(1, live.value / goal) : Math.min(1, timer / ex.seconds)

  let count = ex.seconds - timer
  let hint = ex.sub
  if (tracking) {
    if (sensor === 'blinks') {
      count = `${Math.min(live.value, goal)}/${goal}`
      hint = 'Her tam kırpmayı sayıyorum'
    } else if (sensor === 'hold') {
      count = Math.max(0, Math.ceil(goal - live.value))
      hint = live.ok ? 'Harika, böyle tut' : `Başını çevirmeden ${DIR_WORD[ex.dir]} bak`
    } else if (sensor === 'laps') {
      count = `${Math.min(Math.floor(live.value), goal)}/${goal}`
      hint = live.wrongWay ? 'Ters yöne dönüyorsun' : 'Gözünle yavaşça daire çiz'
    } else if (sensor === 'closed') {
      count = Math.max(0, Math.ceil(goal - live.value))
      hint = live.ok ? 'Gözlerin kapalı, bitince sesle haber vereceğim' : 'Gözlerini kapat'
    }
  }

  return (
    <main className="screen routine-screen">
      <div className="row" style={{ gap: 12 }}>
        <button className="btn-icon" onClick={onBack} aria-label="Çık"><ChevronLeft size={22} /></button>
        <div className="seg-progress" aria-label={`Adım ${idx + 1} / ${steps.length}`}>
          {steps.map((s, i) => (
            <span key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
              {i === idx && <i style={{ width: `${frac * 100}%` }} />}
            </span>
          ))}
        </div>
      </div>

      <div className="routine-body" key={idx}>
        <span className={`kind-tag ${ex.kind}`}>{KIND_LABEL[ex.kind]}</span>
        <h1 className="routine-title">{ex.title}</h1>
        <p className={`routine-sub ${tracking && live.ok && sensor !== 'blinks' ? 'routine-ok' : ''} ${live.wrongWay && tracking ? 'routine-warn' : ''}`}>{hint}</p>
        <div className="routine-count" aria-live="polite">{count}</div>
        <div className="routine-visual"><Visual ex={ex} tick={tick} /></div>
        {tracking && (sensor === 'hold' || sensor === 'laps') && <GazeDot gaze={live.gaze} ok={live.ok} />}
        {sensor && (
          <p className={`track-status ${tracking ? 'on' : ''}`}>
            <ScanFace size={15} aria-hidden="true" />
            {tracking ? 'Kamera takip ediyor' : 'Yüzün görünmüyor — süreyle devam ediyor'}
          </p>
        )}
      </div>

      <button className="link-btn" style={{ alignSelf: 'center' }} onClick={next}>Atla</button>
      <p className="muted small" style={{ textAlign: 'center' }}>{set.title} · toplam {formatMin(setDurationSec(set))}</p>
    </main>
  )
}

function goalOf(ex, sensor) {
  if (sensor === 'blinks') return ex.blinks ?? 5
  if (sensor === 'laps') return ex.laps ?? 2
  return ex.seconds
}
