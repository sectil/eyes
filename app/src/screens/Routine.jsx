import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Mountain, Hand, EyeOff, Trophy, Info } from 'lucide-react'
import { Ring } from '../components/ui.jsx'
import { EXERCISES, DAILY_GOAL_MIN, formatMin, setDurationSec } from '../lib/routines.js'
import { cue, unlockAudio } from '../lib/cue.js'

const ARROWS = { right: ArrowRight, left: ArrowLeft, up: ArrowUp, down: ArrowDown }
const KIND_LABEL = {
  evidence: 'Kanıtlı egzersiz',
  comfort: 'Göz konforu molası',
  relax: 'Rahatlama hareketi',
}

function Visual({ ex, elapsed }) {
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
    const near = Math.floor(elapsed / 3) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center' }}>
        {near ? <Hand size={88} strokeWidth={1.6} className="routine-arrow" /> : <Mountain size={88} strokeWidth={1.6} className="routine-arrow" />}
        <span className="routine-sub">{near ? 'Başparmağına bak' : 'Uzağa bak'}</span>
      </div>
    )
  }
  if (ex.visual === 'blink') {
    // 4 sn ritim: 2 sn kapat, 2 sn aç
    const closed = Math.floor(elapsed / 2) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center', gap: 14 }}>
        <div className={`blink-orb ${closed ? 'shut' : ''}`} />
        <span className="routine-sub">{closed ? 'Kapat · hafifçe sık' : 'Aç'}</span>
      </div>
    )
  }
  return <EyeOff size={88} strokeWidth={1.6} className="routine-arrow" />
}

export default function Routine({ set, todaySec, onFinish, onBack }) {
  const steps = set.steps.map((id) => ({ id, ...EXERCISES[id] }))
  const [idx, setIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const spent = useRef(0)
  const ex = steps[idx]
  const left = ex ? ex.seconds - elapsed : 0

  // Adım başında sesli yönlendirme (gözler kapalı adımlarda ekran okunamaz)
  useEffect(() => {
    if (!done && ex) cue(ex.title, Boolean(ex.closed))
  }, [idx, done])

  // Nabız: saniyede bir
  useEffect(() => {
    if (done) return undefined
    const t = setInterval(() => {
      spent.current += 1
      setElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  useEffect(() => {
    if (!done && ex && elapsed >= ex.seconds) next()
  }, [elapsed])

  function next() {
    if (idx + 1 < steps.length) {
      setIdx(idx + 1)
      setElapsed(0)
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
    const goal = DAILY_GOAL_MIN * 60
    return (
      <main className="screen fade-in routine-screen">
        <section className="card card-hero" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <Ring value={Math.min(total, goal)} max={goal} size={132} stroke={12}>
            {total >= goal ? <Trophy size={40} style={{ color: 'var(--accent)' }} /> : <span className="ring-label">{formatMin(total)}</span>}
          </Ring>
          <h1>{total >= goal ? 'Günlük hedef tamam!' : `${set.title} set tamamlandı`}</h1>
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

  return (
    <main className="screen routine-screen">
      <div className="row" style={{ gap: 12 }}>
        <button className="btn-icon" onClick={onBack} aria-label="Çık"><ChevronLeft size={22} /></button>
        <div className="seg-progress" aria-label={`Adım ${idx + 1} / ${steps.length}`}>
          {steps.map((s, i) => (
            <span key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
              {i === idx && <i style={{ width: `${(elapsed / s.seconds) * 100}%` }} />}
            </span>
          ))}
        </div>
      </div>

      <div className="routine-body" key={idx}>
        <span className={`kind-tag ${ex.kind}`}>{KIND_LABEL[ex.kind]}</span>
        <h1 className="routine-title">{ex.title}</h1>
        <p className="routine-sub">{ex.sub}</p>
        <div className="routine-count" aria-live="polite">{left}</div>
        <div className="routine-visual"><Visual ex={ex} elapsed={elapsed} /></div>
      </div>

      <button className="link-btn" style={{ alignSelf: 'center' }} onClick={next}>Atla</button>
      <p className="muted small" style={{ textAlign: 'center' }}>{set.title} · toplam {formatMin(setDurationSec(set))}</p>
    </main>
  )
}
