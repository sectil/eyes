import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Headphones, FlaskConical, Moon } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import DalgaVisual from '../components/DalgaVisual.jsx'
import { haptic } from '../lib/native.js'
import { createDalgaEngine } from '../lib/dalgaAudio.js'
import { createSleepPlayer } from '../lib/dalgaSleep.js'
import { testUnlock } from '../lib/subscription.js'
import {
  MODES, MODE_ORDER, QUICK_MINUTES, MIN_MINUTES, MAX_MINUTES, VALUES, WHY_MIN, RATE_MAX, EXP_N, ANSWER_TEXT,
  loadDalgaOpts, saveDalgaOpts, binauralPlan, makeRecord, factFor, experimentOf, experimentText,
} from '../lib/dalga.js'
import '../styles/dalga.css'

// Dalga (Artifact "Dalga", onaylı): mod → önce puan → (Güç: değer) → dinle → sonra puan → sonuç + bilim kartı.
const MIN_SAVE_SEC = 30 // bundan kısa dinleme kaydedilmez (VARSAYIM)
const HINT_SEC = 16

function ModeGlyph({ id }) {
  if (id === 'sakin') {
    return (
      <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25" fill="#0B2530" />
        <path d="M6 30c5-8 9-8 14 0s9 8 14 0 9-8 12-3" fill="none" stroke="#19C2D1" strokeWidth="3" strokeLinecap="round" />
        <path d="M6 22c5-5 9-5 14 0s9 5 14 0 9-5 12-2" fill="none" stroke="#3E7BFA" strokeWidth="2" strokeLinecap="round" opacity=".7" /></svg>
    )
  }
  if (id === 'guc') {
    return (
      <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25" fill="#2A1A08" />
        <path d="M12 36l8-8 6 5 13-15" fill="none" stroke="#FFB13B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="39" cy="18" r="3.4" fill="#C08BFF" /></svg>
    )
  }
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25" fill="#2B120C" />
      <rect x="11" y="24" width="5" height="12" rx="2.5" fill="#FF7A59" /><rect x="19" y="16" width="5" height="20" rx="2.5" fill="#FFD166" />
      <rect x="27" y="20" width="5" height="16" rx="2.5" fill="#FF7A59" /><rect x="35" y="12" width="5" height="24" rx="2.5" fill="#FFD166" /></svg>
  )
}

function Rate({ value, onChange, label }) {
  return (
    <div className="dg-rate" role="radiogroup" aria-label={label}>
      {Array.from({ length: RATE_MAX }, (_, k) => k + 1).map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => { onChange(v); haptic('tick') }}>{v}</button>
      ))}
    </div>
  )
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// onSave(kayıt): sonra-puanı verilince; onExit(): çıkış
export default function Dalga({ sessions = [], onSave, onExit }) {
  const [opts, setOpts] = useState(() => loadDalgaOpts())
  const [phase, setPhase] = useState('pick') // pick | before | value | play | after | result
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [value, setValue] = useState(null)
  const [why, setWhy] = useState('')
  const [plan, setPlan] = useState(null)
  const [fact, setFact] = useState(null)
  const [left, setLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [volume, setVolume] = useState(0.55)
  const [hintI, setHintI] = useState(0)
  const [silent, setSilent] = useState(false)
  const [record, setRecord] = useState(null)
  const [error, setError] = useState(null)
  const [diag, setDiag] = useState({ state: 'none', rate: 0, level: 0 })
  const [sleepState, setSleepState] = useState('idle') // idle | preparing | playing
  const [showCtl, setShowCtl] = useState(false)
  const sleepRef = useRef(null)
  const sleepMode = opts.mode === 'sakin' && opts.sleep
  const engineRef = useRef(null)
  const wakeRef = useRef(null)
  const playSec = useRef(0)
  if (!engineRef.current) engineRef.current = createDalgaEngine()
  const engine = engineRef.current
  const m = MODES[opts.mode]

  useEffect(() => () => { engine.close(); sleepRef.current?.stop(); wakeRef.current?.release?.().catch?.(() => {}) }, [engine])

  const update = (patch) => setOpts((o) => {
    const n = { ...o, ...patch }
    saveDalgaOpts(n)
    return n
  })

  // Dinleme: süre sayacı ve ipucu değişimi
  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => {
      const l = engine.left()
      setLeft(l)
      setDiag({ state: engine.state(), rate: engine.sampleRate(), level: engine.level() })
      if (l <= 0) finish(false)
    }, 250)
    const hint = setInterval(() => setHintI((i) => i + 1), HINT_SEC * 1000)
    return () => { clearInterval(id); clearInterval(hint) }
    // finish yalnız motor durumunu okur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, engine])

  async function keepAwake(on) {
    try {
      if (on) wakeRef.current = await globalThis.navigator?.wakeLock?.request?.('screen')
      else {
        await wakeRef.current?.release?.()
        wakeRef.current = null
      }
    } catch {
      wakeRef.current = null // desteklenmiyorsa ekran kendi süresinde kararabilir (VARSAYIM: cihazda doğrulanacak)
    }
  }

  function startPlay() {
    const p = binauralPlan(opts, sessions)
    const ok = engine.start({ mode: opts.mode, seconds: opts.minutes * 60, binaural: p.on, volume })
    if (!ok) {
      setError('Ses açılamadı. Telefonun sesini ve sessiz modunu kontrol edip yeniden dene.')
      setPhase('pick')
      return
    }
    setPlan(p)
    setFact(factFor(sessions, opts.mode))
    setPaused(false)
    setSilent(false)
    setHintI(0)
    setLeft(opts.minutes * 60)
    keepAwake(true)
    setPhase('play')
  }
  function finish(early) {
    playSec.current = engine.elapsed()
    engine.stop(early)
    keepAwake(false)
    if (playSec.current < MIN_SAVE_SEC) {
      setPhase('pick')
      return
    }
    setAfter(null)
    setPhase('after')
  }
  // Uyku modu: puan sorulmaz; müzik hazırlanır, soluk saat, sonda yavaşça kısılır
  async function startSleep() {
    const p = createSleepPlayer()
    sleepRef.current = p
    setShowCtl(false)
    setSleepState('preparing')
    setLeft(opts.minutes * 60)
    setPhase('sleep')
    keepAwake(true)
    try {
      const ok = await p.start({
        mode: 'sakin',
        totalSec: opts.minutes * 60,
        onTick: ({ left: l }) => setLeft(l),
        onEnd: () => endSleep(false),
      })
      if (ok) setSleepState('playing')
    } catch {
      p.stop()
      keepAwake(false)
      setError('Müzik hazırlanamadı. Yeniden dene.')
      setPhase('pick')
    }
  }
  function endSleep(early) {
    const p = sleepRef.current
    if (!p) return
    const sec = p.elapsed()
    p.stop()
    sleepRef.current = null
    keepAwake(false)
    setSleepState('idle')
    if (sec < MIN_SAVE_SEC) {
      setPhase('pick')
      return
    }
    const rec = makeRecord({ mode: 'sakin', minutes: opts.minutes, plan: { used: false }, seconds: sec, sleep: true })
    setFact(factFor(sessions, 'sakin', { sleep: true }))
    setRecord(rec)
    onSave?.(rec)
    setPhase('result')
  }
  // Uyku ekranında dokununca denetimler 5 sn görünür
  useEffect(() => {
    if (!showCtl) return undefined
    const id = setTimeout(() => setShowCtl(false), 5000)
    return () => clearTimeout(id)
  }, [showCtl])

  function togglePause() {
    if (paused) engine.resume()
    else engine.pause()
    setPaused(!paused)
  }
  function save() {
    const rec = makeRecord({ mode: opts.mode, minutes: opts.minutes, before, after, value: opts.mode === 'guc' ? value : null, plan, seconds: playSec.current })
    setRecord(rec)
    onSave?.(rec)
    haptic('success')
    setPhase('result')
  }
  function again() {
    setBefore(null)
    setAfter(null)
    setRecord(null)
    setPhase('pick')
  }

  const top = (v, back = true) => (
    <div className="dg-top">
      {back && <button className="btn-icon" onClick={back === 'exit' ? onExit : () => setPhase('pick')} aria-label={back === 'exit' ? 'Çık' : 'Geri'}><X size={20} /></button>}
      <ProgressBar value={v} />
    </div>
  )
  const modeStyle = { '--dg1': m.c1, '--dg2': m.c2 }

  if (phase === 'sleep') {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0')
    return (
      <main className="dg-sleep" onClick={() => setShowCtl(true)} aria-label="Dalga · uyku">
        <div className="dg-clock">{hh}:{mm}</div>
        <p className="dg-sleep-sub" aria-live="polite">
          {sleepState === 'preparing' ? 'Müzik hazırlanıyor…' : `${Math.max(1, Math.ceil(left / 60))} dk sonra yavaşça susacak`}
        </p>
        {showCtl && (
          <button className="dg-sleep-end" onClick={(e) => { e.stopPropagation(); endSleep(true) }}>Bitir</button>
        )}
      </main>
    )
  }

  if (phase === 'play') {
    const word = opts.mode === 'guc' ? value : silent ? 'sessizlik' : ''
    return (
      <main className="dg-play" style={modeStyle} aria-label={`Dalga · ${m.name}`}>
        <DalgaVisual engine={engine} mode={opts.mode} binOn={Boolean(plan?.on)} onSilence={setSilent} />
        <div className="dg-hud">
          <button className="dg-x" onClick={() => finish(true)} aria-label="Bitir"><X size={20} /></button>
          <span className="dg-ey">{m.name}</span>
          <span className="dg-t" aria-live="off">{fmt(left)}</span>
        </div>
        <div className="dg-mid">
          <span className={`dg-word${word ? ' on' : ''}`}>{word}</span>
          {opts.mode === 'guc' && <span className="dg-say">{why}</span>}
        </div>
        <div className="dg-bot">
          {!paused && diag.state !== 'running' && diag.state !== 'none' && (
            <button className="dg-kick" onClick={() => engine.kick()}>Ses başlamadı · dokun ve başlat</button>
          )}
          <p className="dg-hint">{m.hints[hintI % m.hints.length]}</p>
          {testUnlock() && <p className="dg-diag">ses: {diag.state} · {diag.rate} Hz · düzey {diag.level.toFixed(3)}</p>}
          <div className="dg-ctrl">
            <button className="dg-pp" onClick={togglePause} aria-label={paused ? 'Devam et' : 'Duraklat'}>{paused ? <Play size={24} /> : <Pause size={24} />}</button>
            <label className="dg-vol">Ses
              <input type="range" min="0" max="100" value={Math.round(volume * 100)} aria-label="Ses düzeyi"
                onChange={(e) => { const v = +e.target.value / 100; setVolume(v); engine.setVolume(v) }} />
            </label>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'before' || phase === 'after') {
    const isBefore = phase === 'before'
    const cur = isBefore ? before : after
    return (
      <main className="screen fade-in dg" style={modeStyle}>
        {top(isBefore ? 0.2 : 0.85, isBefore)}
        <span className="dg-ey">{isBefore ? 'Önce · tek dokunuş' : 'Sonra'}</span>
        <h1 className="dg-h">{isBefore ? 'Şu an' : 'Şimdi'} {m.ask}</h1>
        <Rate value={cur} onChange={isBefore ? setBefore : setAfter} label={m.word} />
        <div className="dg-ends"><span>{m.lo}</span><span>{m.hi}</span></div>
        {isBefore && <p className="muted small">Sonra bir kez daha soracağım. Karşılaştırma yalnız seninle; kimseyle kıyas yok.</p>}
        <div className="grow" />
        {isBefore
          ? <button className="btn" disabled={cur == null} onClick={() => (opts.mode === 'guc' ? setPhase('value') : startPlay())}>Devam</button>
          : <button className="btn" disabled={cur == null} onClick={save}>Sonucu gör</button>}
      </main>
    )
  }

  if (phase === 'value') {
    const ready = value && why.trim().length >= WHY_MIN
    return (
      <main className="screen fade-in dg" style={modeStyle}>
        {top(0.4)}
        <span className="dg-ey">Kendi değerin</span>
        <h1 className="dg-h">Senin için en önemli olan hangisi?</h1>
        <div className="dg-chips" role="radiogroup" aria-label="Değer">
          {VALUES.map((v) => <button key={v} type="button" role="radio" className="dg-chip" aria-checked={value === v} onClick={() => setValue(v)}>{v}</button>)}
        </div>
        <label className="dg-lbl" htmlFor="dg-why">Neden önemli? Bir cümle yeter.</label>
        <textarea id="dg-why" className="dg-why" maxLength={120} placeholder="Çünkü…" value={why} onChange={(e) => setWhy(e.target.value)} />
        <p className="dg-src">Cümlen kaydedilmez; yalnız dinlerken ekranda sana geri gelir.</p>
        <div className="grow" />
        <button className="btn" disabled={!ready} onClick={startPlay}>Dinlemeye başla</button>
      </main>
    )
  }

  if (phase === 'result' && record?.sleep) {
    return (
      <main className="screen fade-in dg" style={modeStyle}>
        {top(1, false)}
        <span className="dg-ey">Uyku · {Math.max(1, Math.round(record.seconds / 60))} dk</span>
        <h1 className="dg-h">Günaydın.</h1>
        {fact && (
          <section className="dg-card">
            <span className="dg-ey">Doğru mu, efsane mi?</span>
            <p className="h">{fact.claim}</p>
            <p><b className="ok">{ANSWER_TEXT[fact.answer]}.</b> {fact.body}</p>
            <span className="dg-src">{fact.ref} · doi {fact.doi}</span>
          </section>
        )}
        <p className="dg-src">Tedavi değildir. Uykusuzluk uzun sürüyorsa bir hekime danış.</p>
        <div className="grow" />
        <button className="btn" onClick={onExit}>Bitti</button>
      </main>
    )
  }

  if (phase === 'result' && record) {
    const d = record.delta
    // Kaydedilen oturum, onSave → refresh sonrası sessions'ta zaten olabilir; iki kez sayılmasın
    const saved = sessions.some((s) => s.type === record.type && s.date === record.date)
    const all = saved ? sessions : [...sessions, record]
    const exp = experimentOf(all)
    const expText = experimentText(exp)
    return (
      <main className="screen fade-in dg" style={modeStyle}>
        {top(1, false)}
        <span className="dg-ey">{m.name} · {Math.max(1, Math.round(record.seconds / 60))} dk · bitti</span>
        <div className="dg-delta">
          <b>{record.before}</b><span>→</span><b>{record.after}</b>
          <em>{d > 0 ? '+' : ''}{d}</em>
        </div>
        <p className="muted small">{m.word}, kendi puanın</p>
        {record.exp && (expText
          ? <section className="dg-card"><span className="dg-ey">Kişisel deney · {exp.n} oturum</span><p>{expText}</p></section>
          : (
            <div className="dg-exp">
              <div className="dg-dots" aria-hidden="true">{Array.from({ length: EXP_N }, (_, k) => <i key={k} className={k < exp.n ? 'on' : ''} />)}</div>
              <span>Deney {Math.min(exp.n, EXP_N)}/{EXP_N}. Katman açık mıydı? {EXP_N} oturumda söyleyeceğim.</span>
            </div>
          ))}
        {fact && (
          <section className="dg-card">
            <span className="dg-ey">Doğru mu, efsane mi?</span>
            <p className="h">{fact.claim}</p>
            <p><b className={fact.answer === 'fact' ? 'ok' : fact.answer === 'none' ? 'no' : 'op'}>{ANSWER_TEXT[fact.answer]}.</b> {fact.body}</p>
            <span className="dg-src">{fact.ref} · doi {fact.doi}</span>
          </section>
        )}
        <p className="dg-src">Kendi gidişatın için. Tedavi değildir; bir sağlık sorununu iyileştirdiği iddiası yok.</p>
        <div className="grow" />
        <button className="btn" onClick={onExit}>Bitti</button>
        <button className="btn btn-ghost" onClick={again}>Yeniden dinle</button>
      </main>
    )
  }

  // pick
  return (
    <main className="screen fade-in dg" style={modeStyle}>
      {top(0, 'exit')}
      <span className="dg-ey">Dalga · birkaç dakika sadece dinle</span>
      <h1 className="dg-h">Şu an neye ihtiyacın var?</h1>
      <div className="dg-modes" role="radiogroup" aria-label="Mod">
        {MODE_ORDER.map((id) => (
          <button key={id} type="button" role="radio" className="dg-mode" aria-checked={opts.mode === id} style={{ '--c1': MODES[id].c1 }}
            onClick={() => { update({ mode: id }); setError(null) }}>
            <ModeGlyph id={id} />
            <div><b>{MODES[id].name}</b><span>{MODES[id].sub}</span></div>
          </button>
        ))}
      </div>
      <div className="dg-dur">
        <label htmlFor="dg-min">Süre <b>{opts.minutes} dk</b></label>
        <input id="dg-min" type="range" min={MIN_MINUTES} max={MAX_MINUTES} step="1" value={opts.minutes} onChange={(e) => update({ minutes: +e.target.value })} />
        <div className="dg-chips" role="radiogroup" aria-label="Hızlı süre">
          {QUICK_MINUTES.map((min) => <button key={min} type="button" role="radio" className="dg-chip" aria-checked={opts.minutes === min} onClick={() => update({ minutes: min })}>{min}</button>)}
        </div>
      </div>
      {opts.mode === 'sakin' && (
        <>
          <label className="dg-tog">
            <Moon size={20} aria-hidden="true" />
            <div><b>Uyku modu</b><span>Soluk saat; süre bitince yavaşça susar. Telefon kilitlenince de çalar.</span></div>
            <input type="checkbox" checked={opts.sleep} onChange={(e) => update({ sleep: e.target.checked })} />
          </label>
          {!opts.sleep && <label className="dg-tog">
            <Headphones size={20} aria-hidden="true" />
            <div><b>Kulaklık takılı</b><span>Binaural katman için gerekli; hoparlörde çalmaz.</span></div>
            <input type="checkbox" checked={opts.headphones} onChange={(e) => update({ headphones: e.target.checked })} />
          </label>}
          {!opts.sleep && opts.headphones && (
            <label className="dg-tog">
              <FlaskConical size={20} aria-hidden="true" />
              <div><b>Kişisel deney</b><span>Katman bazen gizlice kapalı; {EXP_N} oturumda sonuç.</span></div>
              <input type="checkbox" checked={opts.experiment} onChange={(e) => update({ experiment: e.target.checked })} />
            </label>
          )}
        </>
      )}
      {error && <p className="dg-err" role="alert">{error}</p>}
      <div className="grow" />
      <button className="btn" onClick={() => { engine.unlock(); setError(null); if (sleepMode) { startSleep(); return } setBefore(null); setPhase('before') }}>{sleepMode ? 'Uykuya başla' : 'Başla'}</button>
    </main>
  )
}
