import { useEffect, useRef, useState } from 'react'
import { X, Play, Check, RotateCcw, ShieldAlert, Timer, Wind } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import SoundToggle from '../components/SoundToggle.jsx'
import { haptic } from '../lib/native.js'
import { speak, unlockAudio } from '../lib/cue.js'
import {
  PATTERNS, PATTERN_ORDER, PHASE, LIMITS, DURATIONS_SEC, CALM_SCALE, SAFETY_TEXT,
  makePlan, phaseAt, makeRecord, programProgress, loadBreathOpts, saveBreathOpts, safetySeen, markSafetySeen, isBreath,
} from '../lib/breath.js'
import '../styles/breath.css'

const KIND_LABEL = { in: 'Nefes al', hold: 'Tut', out: 'Nefes ver', hold2: 'Bekle' }
const CALM_ENDS = ['Gergin', 'Sakin']

export default function Breath({ sessions = [], onBack, onFinish }) {
  const prior = sessions.filter(isBreath).length
  const [opts, setOpts] = useState(() => loadBreathOpts())
  const [phase, setPhase] = useState(() => (safetySeen() ? 'intro' : 'safety')) // safety | intro | run | result
  const [calmBefore, setCalmBefore] = useState(null)
  const [calmAfter, setCalmAfter] = useState(null)
  const [strained, setStrained] = useState(false)
  const [live, setLive] = useState(null) // phaseAt çıktısı
  const plan = makePlan({ pattern: opts.pattern, durationSec: opts.durationSec, priorSessions: prior, edits: opts.edits })
  const def = PATTERNS[opts.pattern]
  const program = programProgress(sessions)

  const t0 = useRef(0)
  const lastIdx = useRef(-1)
  const elapsedRef = useRef(0)

  const update = (patch) => {
    const next = { ...opts, ...patch }
    setOpts(next)
    saveBreathOpts(next)
  }
  const edit = (kind, delta) => {
    const cur = opts.edits?.[kind] ?? def.phases.find((p) => p.kind === kind)?.sec ?? 0
    update({ edits: { ...opts.edits, [kind]: cur + delta } })
  }

  function start() {
    unlockAudio()
    t0.current = performance.now()
    lastIdx.current = -1
    elapsedRef.current = 0
    setLive(phaseAt(plan, 0))
    setPhase('run')
  }

  // Zamanlayıcı: aşama değişince ses + titreşim; bitince sonuç
  useEffect(() => {
    if (phase !== 'run') return undefined
    const id = setInterval(() => {
      const el = (performance.now() - t0.current) / 1000
      elapsedRef.current = el
      const st = phaseAt(plan, el)
      setLive(st)
      const key = st.cycle * 100 + st.index
      if (!st.done && key !== lastIdx.current) {
        lastIdx.current = key
        const ph = PHASE[st.phase.kind]
        haptic(ph.haptic)
        speak(ph.say)
      }
      if (st.done) {
        clearInterval(id)
        haptic('success')
        speak('Tamamlandı')
        setPhase('result')
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function stopEarly() {
    setPhase('result')
  }
  function save() {
    onFinish(makeRecord({ plan, seconds: Math.min(elapsedRef.current, plan.totalSec), calmBefore, calmAfter, strained, completed: elapsedRef.current >= plan.totalSec - 1 }))
  }

  if (phase === 'safety') {
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onBack} eyebrow="Başlamadan önce" title="Nefes pratiği" />
        <div className="card tone-warn stack">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <ShieldAlert size={22} style={{ flex: 'none', marginTop: 2 }} aria-hidden="true" />
            <p className="small">{SAFETY_TEXT}</p>
          </div>
        </div>
        <p className="muted small">Bu metin Bilgi sekmesinde her zaman duracak. Bir daha sormayacağım.</p>
        <button className="btn" onClick={() => { markSafetySeen(); setPhase('intro') }}><Check size={18} aria-hidden="true" /> Anladım</button>
      </main>
    )
  }

  if (phase === 'intro') {
    const canStart = calmBefore != null
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onBack} eyebrow="Yaşam · nefes" title="Nefes pratiği" subtitle={program.days > 0 ? `Program: ${program.days}/${program.target} gün · bugün ${Math.round(program.todaySec / 60)} dk` : 'Nefesini yavaşlatma pratiği. Günde 5 dk, 28 gün.'} />

        <span className="eyebrow">Kalıp</span>
        <div className="br-patterns" role="group" aria-label="Nefes kalıbı">
          {PATTERN_ORDER.map((id) => (
            <button key={id} type="button" className="br-pattern" aria-pressed={opts.pattern === id} onClick={() => update({ pattern: id })}>
              <span className="title">{PATTERNS[id].title}{id === 'calm' && <span className="badge" style={{ marginLeft: 6 }}>Varsayılan</span>}</span>
              <span className="sub">{PATTERNS[id].sub}</span>
            </button>
          ))}
        </div>
        <p className="muted small">{def.evidence}</p>

        {def.editable && (
          <div className="card br-edit">
            {def.phases.map((p) => {
              const v = plan.phases.find((x) => x.kind === p.kind)?.sec ?? 0
              const [lo, hi] = LIMITS[p.kind]
              return (
                <div key={p.kind} className="br-edit-row">
                  <span>{KIND_LABEL[p.kind]}</span>
                  <span className="br-stepper">
                    <button type="button" onClick={() => edit(p.kind, -1)} disabled={v <= lo} aria-label={`${KIND_LABEL[p.kind]} azalt`}>−</button>
                    <span>{v} sn</span>
                    <button type="button" onClick={() => edit(p.kind, 1)} disabled={v >= hi} aria-label={`${KIND_LABEL[p.kind]} artır`}>+</button>
                  </span>
                </div>
              )
            })}
            <p className="muted small">Tutmalar isteğe bağlı (0 = yok), en fazla {LIMITS.hold[1]} sn. Zorlanırsan kısalt.</p>
          </div>
        )}

        <span className="eyebrow">Süre</span>
        <div className="segmented" role="group" aria-label="Süre">
          {DURATIONS_SEC.map((s) => (
            <button key={s} type="button" aria-pressed={opts.durationSec === s} onClick={() => update({ durationSec: s })}>{s / 60} dk</button>
          ))}
        </div>
        <p className="muted small">
          <Timer size={13} aria-hidden="true" /> Dakikada ~{plan.bpm} nefes · {plan.cycles} döngü{plan.ramped ? ' · ilk seanslar biraz daha hızlı, alışınca yavaşlar' : ''}
        </p>

        <span className="eyebrow">Şu an ne kadar sakinsin?</span>
        <CalmScale value={calmBefore} onChange={setCalmBefore} />

        <button className="btn" onClick={start} disabled={!canStart}><Play size={18} aria-hidden="true" /> Başla · {opts.durationSec / 60} dk</button>
        {!canStart && <p className="muted small" style={{ textAlign: 'center' }}>Önce sakinlik puanını seç; sonunda tekrar soracağım.</p>}
      </main>
    )
  }

  if (phase === 'result') {
    const secs = Math.round(Math.min(elapsedRef.current, plan.totalSec))
    return (
      <main className="screen fade-in">
        <PageHeader eyebrow="Nefes pratiği" title={secs >= plan.totalSec - 1 ? 'Tamamlandı' : 'Erken bitti'} subtitle={`${plan.title} · ${Math.round(secs / 60)} dk · ${Math.round(secs / plan.cycleSec)} döngü`} />
        <span className="eyebrow">Şimdi ne kadar sakinsin?</span>
        <CalmScale value={calmAfter} onChange={setCalmAfter} />
        {calmBefore != null && calmAfter != null && (
          <p className="muted small">Önce {calmBefore}, sonra {calmAfter}. Bu senin puanın; bir iddia değil, kendi çizgin.</p>
        )}
        <button type="button" className={`btn btn-ghost br-strain${strained ? ' on' : ''}`} aria-pressed={strained} onClick={() => setStrained((v) => !v)}>
          {strained ? <Check size={18} aria-hidden="true" /> : <Wind size={18} aria-hidden="true" />} Zorlandım {strained ? '· kaydedildi' : ''}
        </button>
        {strained && <p className="muted small">Bir sonraki seansta süreyi ya da tutmaları kısalt. Baş dönmesi olduysa bugün tekrar etme.</p>}
        <button className="btn" onClick={save} disabled={calmAfter == null}><Check size={18} aria-hidden="true" /> Kaydet</button>
        <button className="btn btn-ghost" onClick={() => { setCalmAfter(null); setStrained(false); setPhase('intro') }}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
      </main>
    )
  }

  // run
  const st = live ?? phaseAt(plan, 0)
  const kind = st.phase.kind
  const ph = PHASE[kind]
  const secLeft = Math.ceil(st.phase.sec - st.phaseElapsed)
  const mm = Math.floor(st.left / 60)
  const ss = String(Math.floor(st.left % 60)).padStart(2, '0')
  const holding = kind === 'hold' || kind === 'hold2'
  return (
    <div className="br-stage" role="application" aria-label="Nefes pratiği">
      <div className="br-top">
        <button type="button" className="btn-icon" onClick={stopEarly} aria-label="Bitir"><X size={20} /></button>
        <span className="br-time">{mm}:{ss}</span>
        <SoundToggle />
      </div>
      <div className="br-orb-wrap">
        <div className={`br-orb${holding ? ' hold' : ''}`} style={{ '--s': ph.scale, '--t': `${st.phase.sec}s` }} aria-hidden="true" />
        <div className="br-phase" aria-live="polite">{ph.label}</div>
        <div className="br-count" aria-hidden="true">{secLeft}</div>
        <div className="br-cycle">{st.cycle + 1} / {plan.cycles} · {plan.title}</div>
      </div>
      <button type="button" className="link-btn subtle" onClick={stopEarly}>Erken bitir</button>
    </div>
  )
}

function CalmScale({ value, onChange }) {
  return (
    <div>
      <div className="br-calm" role="group" aria-label="1 gergin, 5 sakin">
        {CALM_SCALE.map((v) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{v}</button>
        ))}
      </div>
      <div className="br-calm-ends"><span>{CALM_ENDS[0]}</span><span>{CALM_ENDS[1]}</span></div>
    </div>
  )
}
