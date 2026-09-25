import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Check, RotateCcw, ShieldAlert, Info, ChevronRight, ChevronLeft, SkipBack, SkipForward, Settings2, Vibrate, VibrateOff, Volume2, VolumeX, MessageSquareText, MessageSquareOff } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import PrefToggle from '../components/PrefToggle.jsx'
import BreathVisual from '../components/BreathVisual.jsx'
import { haptic } from '../lib/native.js'
import { speak, unlockAudio } from '../lib/cue.js'
import { playBreathSound, unlockBreathSfx } from '../lib/breathSfx.js'
import {
  PATTERNS, PATTERN_ORDER, PHASE, KIND_ORDER, LIMITS, STEP_SEC, DURATIONS_SEC, CALM_SCALE, SAFETY_TEXT, PREP_SEC,
  VISUALS, SOUNDS, SOUND_SLOTS,
  makePlan, resolveSecs, phaseAt, phaseStartSec, makeRecord, programProgress, loadBreathOpts, saveBreathOpts, safetySeen, markSafetySeen, isBreath,
} from '../lib/breath.js'
import '../styles/breath.css'

const KIND_ROW = { in: 'Nefes al', in2: 'İkinci alış', hold: 'Nefes tut', out: 'Nefes ver', hold2: 'Bekle' }
const fmtSec = (v) => (Number.isInteger(v) ? `${v}` : v.toFixed(1).replace('.', ','))
const visualTitle = (id) => VISUALS.find((v) => v.id === id)?.title ?? ''

export default function Breath({ sessions = [], onBack, onFinish }) {
  const prior = sessions.filter(isBreath).length
  const [opts, setOpts] = useState(() => loadBreathOpts())
  const [screen, setScreen] = useState(() => (safetySeen() ? 'setup' : 'safety')) // safety | setup | sound | info | run | result
  const [calmBefore, setCalmBefore] = useState(null)
  const [calmAfter, setCalmAfter] = useState(null)
  const [strained, setStrained] = useState(false)
  const plan = makePlan({ pattern: opts.pattern, durationSec: opts.durationSec, priorSessions: prior, edits: opts.edits })
  const { secs } = resolveSecs({ pattern: opts.pattern, edits: opts.edits, priorSessions: prior })
  const def = PATTERNS[opts.pattern]
  const program = programProgress(sessions)

  // Oynatma durumu
  const [prep, setPrep] = useState(0) // hazırlık geri sayımı (PREP_SEC → 0)
  const [paused, setPaused] = useState(false)
  const [live, setLive] = useState(null)
  const t0 = useRef(0) // seans başlangıcı (performance.now)
  const pausedAt = useRef(null)
  const lastKey = useRef(-1)
  const elapsedRef = useRef(0)

  const update = (patch) => {
    const next = { ...opts, ...patch }
    setOpts(next)
    saveBreathOpts(next)
  }
  const stepSec = (kind, dir) => {
    const cur = secs[kind]
    const [lo, hi] = LIMITS[kind]
    const v = Math.min(hi, Math.max(lo, cur + dir * STEP_SEC))
    update({ edits: { ...secs, [kind]: v } })
  }

  function start() {
    unlockAudio()
    unlockBreathSfx()
    setPrep(PREP_SEC)
    setPaused(false)
    lastKey.current = -1
    elapsedRef.current = 0
    setLive(phaseAt(plan, 0))
    setScreen('run')
  }

  // Hazırlık geri sayımı, sonra seans
  useEffect(() => {
    if (screen !== 'run' || prep <= 0) return undefined
    if (opts.vibrate) haptic('tick')
    const id = setTimeout(() => {
      if (prep === 1) t0.current = performance.now()
      setPrep((p) => p - 1)
    }, 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, prep])

  // Seans zamanlayıcısı: aşama değişince ses + kelime + titreşim; bitince sonuç
  useEffect(() => {
    if (screen !== 'run' || prep > 0 || paused) return undefined
    const id = setInterval(() => {
      const el = (performance.now() - t0.current) / 1000
      elapsedRef.current = el
      const st = phaseAt(plan, el)
      setLive(st)
      const key = st.cycle * 100 + st.index
      if (!st.done && key !== lastKey.current) {
        lastKey.current = key
        cuePhase(st.phase.kind)
      }
      if (st.done) {
        clearInterval(id)
        if (opts.vibrate) haptic('success')
        if (opts.sound) playBreathSound(opts.sounds.end, opts.volume)
        if (opts.sound && opts.voice) speak('Tamamlandı')
        setScreen('result')
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, prep, paused])

  function cuePhase(kind) {
    const ph = PHASE[kind]
    if (opts.vibrate) haptic(ph.haptic)
    if (opts.sound) playBreathSound(opts.sounds[kind] ?? 'none', opts.volume)
    if (opts.sound && opts.voice) speak(ph.say)
  }
  function seekTo(sec) {
    t0.current = performance.now() - sec * 1000
    lastKey.current = -1
    setLive(phaseAt(plan, sec))
  }
  function prevPhase() {
    const st = live ?? phaseAt(plan, 0)
    // Aşama başından 1 sn geçtiyse aşamayı yeniden başlat; yoksa öncekine git
    if (st.phaseElapsed > 1 || (st.cycle === 0 && st.index === 0)) return seekTo(phaseStartSec(plan, st.cycle, st.index))
    const idx = st.index - 1
    return idx >= 0 ? seekTo(phaseStartSec(plan, st.cycle, idx)) : seekTo(phaseStartSec(plan, st.cycle - 1, plan.phases.length - 1))
  }
  function nextPhase() {
    const st = live ?? phaseAt(plan, 0)
    const idx = st.index + 1
    const sec = idx < plan.phases.length ? phaseStartSec(plan, st.cycle, idx) : phaseStartSec(plan, st.cycle + 1, 0)
    if (sec >= plan.totalSec) return seekTo(plan.totalSec)
    return seekTo(sec)
  }
  function togglePause() {
    if (paused) {
      t0.current += performance.now() - pausedAt.current
      pausedAt.current = null
      setPaused(false)
    } else {
      pausedAt.current = performance.now()
      setPaused(true)
    }
  }
  function stopEarly() {
    setScreen('result')
  }
  function save() {
    onFinish(makeRecord({ plan, seconds: Math.min(elapsedRef.current, plan.totalSec), calmBefore, calmAfter, strained, completed: elapsedRef.current >= plan.totalSec - 1 }))
  }

  if (screen === 'safety') {
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
        <button className="btn" onClick={() => { markSafetySeen(); setScreen('setup') }}><Check size={18} aria-hidden="true" /> Anladım</button>
      </main>
    )
  }

  if (screen === 'info') {
    return (
      <main className="screen fade-in">
        <PageHeader onBack={() => setScreen('setup')} eyebrow="Nefes pratiği" title="Kalıplar ve kanıt" />
        {PATTERN_ORDER.map((id) => (
          <div key={id} className="card stack" style={{ gap: 4 }}>
            <strong>{PATTERNS[id].title}</strong>
            <span className="muted small">{PATTERNS[id].sub}</span>
            <p className="small">{PATTERNS[id].evidence}</p>
          </div>
        ))}
        <p className="muted small">Program: günde 5 dk, 28 gün (Balban 2023). İlk üç seansta Sakin ritim biraz daha hızlı başlar; alışınca dakikada 6'ya iner.</p>
        <div className="card tone-warn"><p className="small">{SAFETY_TEXT}</p></div>
      </main>
    )
  }

  if (screen === 'sound') {
    return (
      <main className="screen fade-in">
        <PageHeader onBack={() => setScreen('setup')} eyebrow="Nefes pratiği" title="Ses" />
        <div className="list">
          {SOUND_SLOTS.map((slot) => (
            <div key={slot.id} className="br-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <span className="lbl">{slot.title}</span>
              <div className="br-sound-grid" role="group" aria-label={`${slot.title} sesi`}>
                {SOUNDS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={opts.sounds[slot.id] === s.id}
                    onClick={() => { unlockBreathSfx(); update({ sounds: { ...opts.sounds, [slot.id]: s.id } }); playBreathSound(s.id, opts.volume) }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="br-row">
            <span className="lbl">Ses seviyesi</span>
            <span className="br-stepper">
              <button type="button" onClick={() => update({ volume: opts.volume - 1 })} disabled={opts.volume <= 0} aria-label="Ses seviyesini azalt">−</button>
              <output>{opts.volume}</output>
              <button type="button" onClick={() => { update({ volume: opts.volume + 1 }); playBreathSound('tick', opts.volume + 1) }} disabled={opts.volume >= 10} aria-label="Ses seviyesini artır">+</button>
            </span>
          </div>
        </div>
        <p className="muted small">Sesli komut açıksa ton ile birlikte "Nefes al… tut… ver…" de söylenir. Sağ üstteki ses düğmesi hepsini susturur.</p>
      </main>
    )
  }

  if (screen === 'setup') {
    const canStart = calmBefore != null
    return (
      <main className="screen fade-in">
        <div className="row between">
          <PageHeader onBack={onBack} eyebrow="Yaşam · nefes" title="Nefes pratiği" subtitle={program.days > 0 ? `Program ${program.days}/${program.target} gün · bugün ${Math.round(program.todaySec / 60)} dk` : undefined} />
          <button type="button" className="btn-icon" onClick={() => setScreen('info')} aria-label="Bilgi"><Info size={20} /></button>
        </div>

        <div className="br-chips" role="group" aria-label="Kalıp">
          {PATTERN_ORDER.map((id) => (
            <button key={id} type="button" className="br-chip" aria-pressed={opts.pattern === id} onClick={() => update({ pattern: id, edits: null })}>{PATTERNS[id].title}</button>
          ))}
        </div>

        <div className="list">
          {KIND_ORDER.filter((k) => k !== 'in2' || opts.pattern === 'sigh' || secs.in2 > 0).map((k) => {
            const [lo, hi] = LIMITS[k]
            const v = secs[k]
            return (
              <div key={k} className="br-row">
                <span className="lbl">{KIND_ROW[k]}{(k === 'hold' || k === 'hold2') && <small>isteğe bağlı · 0 = yok</small>}</span>
                <span className="br-stepper">
                  <button type="button" onClick={() => stepSec(k, -1)} disabled={v <= lo} aria-label={`${KIND_ROW[k]} azalt`}>−</button>
                  <output aria-label={`${KIND_ROW[k]} ${fmtSec(v)} saniye`}>{fmtSec(v)}</output>
                  <button type="button" onClick={() => stepSec(k, 1)} disabled={v >= hi} aria-label={`${KIND_ROW[k]} artır`}>+</button>
                </span>
              </div>
            )
          })}
        </div>
        <p className="muted small" style={{ marginTop: -6 }}>
          {def.title}{opts.edits ? ' · düzenlendi' : ''} · dakikada ~{plan.bpm} nefes · {plan.cycles} döngü{plan.ramped ? ' · ilk seanslar biraz hızlı, alışınca yavaşlar' : ''}
        </p>

        <div className="list">
          <button type="button" className="br-nav" onClick={() => update({ durationSec: DURATIONS_SEC[(DURATIONS_SEC.indexOf(opts.durationSec) + 1) % DURATIONS_SEC.length] })}>
            <span className="lbl">Süre</span>
            <span className="val">{opts.durationSec / 60} dakika <ChevronRight size={18} className="chev" aria-hidden="true" /></span>
          </button>
          <button type="button" className="br-nav" onClick={() => update({ visual: VISUALS[(VISUALS.findIndex((v) => v.id === opts.visual) + 1) % VISUALS.length].id })}>
            <span className="lbl">Görsel</span>
            <span className="val">{visualTitle(opts.visual)} <ChevronRight size={18} className="chev" aria-hidden="true" /></span>
          </button>
          <PrefToggle Icon={Vibrate} IconOff={VibrateOff} label="Titreşim" checked={opts.vibrate} onChange={(on) => update({ vibrate: on })} />
          <PrefToggle
            Icon={Volume2}
            IconOff={VolumeX}
            label="Ses"
            checked={opts.sound}
            onChange={(on) => update({ sound: on })}
            trailing={<button type="button" className="br-gear" onClick={() => setScreen('sound')} aria-label="Ses ayarları" data-no-tap><Settings2 size={18} /></button>}
          />
          <PrefToggle Icon={MessageSquareText} IconOff={MessageSquareOff} label="Sesli komut" sub="Nefes al · tut · ver söylensin" checked={opts.voice} onChange={(on) => update({ voice: on })} />
        </div>

        <div className="br-calm-row">
          <span className="lbl" style={{ fontWeight: 600 }}>Şu an ne kadar sakinsin?</span>
          <div className="br-calm" role="group" aria-label="1 gergin, 5 sakin">
            {CALM_SCALE.map((v) => (
              <button key={v} type="button" aria-pressed={calmBefore === v} onClick={() => setCalmBefore(v)}>{v}</button>
            ))}
          </div>
        </div>

        <button className="btn" onClick={start} disabled={!canStart}><Play size={18} aria-hidden="true" /> Başla</button>
        {!canStart && <p className="muted small" style={{ textAlign: 'center' }}>Başlamak için sakinlik puanını seç (1 gergin · 5 sakin).</p>}
      </main>
    )
  }

  if (screen === 'result') {
    const secsDone = Math.round(Math.min(elapsedRef.current, plan.totalSec))
    return (
      <main className="screen fade-in">
        <PageHeader eyebrow="Nefes pratiği" title={secsDone >= plan.totalSec - 1 ? 'Tamamlandı' : 'Erken bitti'} subtitle={`${plan.title} · ${Math.round(secsDone / 60)} dk · ${Math.round(secsDone / plan.cycleSec)} döngü`} />
        <div className="br-calm-row">
          <span className="lbl" style={{ fontWeight: 600 }}>Şimdi ne kadar sakinsin?</span>
          <div className="br-calm" role="group" aria-label="1 gergin, 5 sakin">
            {CALM_SCALE.map((v) => (
              <button key={v} type="button" aria-pressed={calmAfter === v} onClick={() => setCalmAfter(v)}>{v}</button>
            ))}
          </div>
        </div>
        {calmBefore != null && calmAfter != null && <p className="muted small">Önce {calmBefore}, sonra {calmAfter}. Bu senin puanın; bir iddia değil, kendi çizgin.</p>}
        <button type="button" className="btn btn-ghost" aria-pressed={strained} onClick={() => setStrained((v) => !v)}>
          {strained ? <Check size={18} aria-hidden="true" /> : null} Zorlandım{strained ? ' · kaydedildi' : ''}
        </button>
        {strained && <p className="muted small">Bir sonraki seansta süreyi ya da tutmaları kısalt. Baş dönmesi olduysa bugün tekrar etme.</p>}
        <button className="btn" onClick={save} disabled={calmAfter == null}><Check size={18} aria-hidden="true" /> Kaydet</button>
        <button className="btn btn-ghost" onClick={() => { setCalmAfter(null); setStrained(false); setScreen('setup') }}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
      </main>
    )
  }

  // run
  const st = live ?? phaseAt(plan, 0)
  const kind = st.phase.kind
  const ph = PHASE[kind]
  const inPrep = prep > 0
  const secLeft = inPrep ? prep : Math.max(1, Math.ceil(st.phase.sec - st.phaseElapsed))
  const mm = Math.floor(st.left / 60)
  const ss = String(Math.floor(st.left % 60)).padStart(2, '0')
  return (
    <div className="br-stage" role="application" aria-label="Nefes pratiği">
      <div className="br-top">
        <button type="button" className="btn-icon" onClick={stopEarly} aria-label="Bitir"><X size={20} /></button>
        <span className="br-time">{mm}:{ss}</span>
        <button type="button" className="btn-icon" onClick={() => setScreen('info')} aria-label="Bilgi"><Info size={20} /></button>
      </div>
      <div className={`br-phase-name${inPrep ? ' prep' : ''}`} aria-live="polite">{inPrep ? 'Hazırlan' : ph.label}</div>
      <div className="br-phase-sec" aria-hidden="true">{secLeft}</div>
      <div className="br-phase-bar" aria-hidden="true"><i style={{ transform: `scaleX(${inPrep ? (PREP_SEC - prep + 1) / PREP_SEC : st.phaseFrac})` }} /></div>
      <div className="br-mid">
        <BreathVisual visual={opts.visual} kind={inPrep ? 'hold2' : kind} phaseSec={st.phase.sec} paused={paused || inPrep} />
        <span className="br-cycle">{inPrep ? `${plan.title} · ${plan.cycles} döngü` : `${st.step} / ${st.steps} · ${plan.title}`}</span>
      </div>
      <div className="br-controls">
        <button type="button" onClick={prevPhase} disabled={inPrep} aria-label="Önceki aşama"><SkipBack size={22} /></button>
        <button type="button" className="main" onClick={togglePause} disabled={inPrep} aria-label={paused ? 'Devam' : 'Duraklat'}>{paused ? <Play size={28} /> : <Pause size={28} />}</button>
        <button type="button" onClick={nextPhase} disabled={inPrep} aria-label="Sonraki aşama"><SkipForward size={22} /></button>
      </div>
      <div className="br-total" aria-hidden="true"><i style={{ transform: `scaleX(${inPrep ? 0 : 1 - st.left / plan.totalSec})` }} /></div>
    </div>
  )
}
