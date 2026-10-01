import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Headphones, FlaskConical, Moon } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import DalgaVisual from '../components/DalgaVisual.jsx'
import { haptic } from '../lib/native.js'
import { createDalgaEngine } from '../lib/dalgaAudio.js'
import { createSleepPlayer } from '../lib/dalgaSleep.js'
import { LATE_GAP_MIN } from '../lib/alarm.js'
import { nextDrift } from '../lib/nightClock.js'
import NightClock from '../components/NightClock.jsx'
import { greeting } from '../lib/greeting.js'
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
// Uyku sesi başladı mı; başlamadıysa neden: 'blocked' (dokun, başlat) ya da 'lesson' (yoga dersi çalıyor; lib/dalgaSleep.js)
const sleepStateOf = (ok, p) => (ok ? 'playing' : p.phase === 'blocked' || p.phase === 'lesson' ? p.phase : 'idle')

// onSave(kayıt): sonra-puanı verilince; onExit(): çıkış
// sleepPreset (alarm kartındaki "Uyku sesi"; lib/alarm.js sleepMinutes): { minutes, auto, alarmLabel, alarmAt } → doğrudan
// uyku hazırlığı; minutes 0 ise alarma 1 saatten az kalmıştır, çalmaz. onSleepEnd({ planned, seconds, early, auto }):
// uyku sesi bitince (alarm günlüğüne; kısa da olsa). sleepPreset.session: alarm kurulumundaki "Kur" dokunuşunda
// başlamış müzik (lib/sleepSession.js); ekran doğrudan uyku ekranı olarak açılır ve ona bağlanır.
export default function Dalga({ sessions = [], onSave, onExit, sleepPreset = null, onSleepEnd, remindField = null }) {
  const [opts, setOpts] = useState(() => loadDalgaOpts())
  const session = sleepPreset?.session ?? null
  const [phase, setPhase] = useState(session ? 'sleep' : sleepPreset ? 'sleep-ready' : 'pick') // pick | before | value | play | after | result | sleep-ready | sleep
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [value, setValue] = useState(null)
  const [why, setWhy] = useState('')
  const [plan, setPlan] = useState(null)
  const [fact, setFact] = useState(null)
  const [left, setLeft] = useState(() => (session ? session.minutes * 60 : 0))
  const [paused, setPaused] = useState(false)
  const [volume, setVolume] = useState(0.55)
  const [hintI, setHintI] = useState(0)
  const [silent, setSilent] = useState(false)
  const [record, setRecord] = useState(null)
  const [error, setError] = useState(null)
  const [diag, setDiag] = useState({ state: 'none', rate: 0, level: 0 })
  const [sleepState, setSleepState] = useState(session ? 'preparing' : 'idle') // idle | preparing | playing | blocked | lesson | done
  const [sleepReady, setSleepReady] = useState(false) // alarm kartından: müzik önceden hazır mı
  const [lateGo, setLateGo] = useState(false) // alarma 1 saatten az: "Yine de çal" dendi
  const [showCtl, setShowCtl] = useState(false)
  const [ctlHold, setCtlHold] = useState(false) // "Bitir" odakta (VoiceOver): 5 sn süresi durur
  const [, setClockTick] = useState(0) // gece saati: dakika başında yeniden çiz
  const [drift, setDrift] = useState([0, 0])
  const sleepRef = useRef(session?.player ?? null)
  const sleepMode = opts.mode === 'sakin' && opts.sleep
  const engineRef = useRef(null)
  const wakeRef = useRef(null)
  const wakeSeq = useRef(0) // ekran kilidi istekleri: geride kalan (üst üste) istek bırakılır
  const playSec = useRef(0)
  if (!engineRef.current) engineRef.current = createDalgaEngine()
  const engine = engineRef.current
  const m = MODES[opts.mode]

  // Ekrandan çıkınca ses durur. Geliştirmede StrictMode sahte söküp yeniden takar: gerçek sökümü bir tik sonra anla
  // (yoksa "Kur"la başlamış müzik açılır açılmaz susuyordu)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      setTimeout(() => {
        if (mounted.current) return
        engine.close()
        sleepRef.current?.stop()
        wakeRef.current?.release?.().catch?.(() => {})
      }, 0)
    }
  }, [engine])

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

  // Ekran açık kalsın (çalarken). Üst üste çağrı (StrictMode'un çift etkisi, hızlı başlat/bitir) kilit sızdırmasın: yalnız
  // son isteğin sonucu tutulur, geride kalan kilit hemen bırakılır.
  async function keepAwake(on) {
    const seq = ++wakeSeq.current
    try {
      if (on) {
        if (wakeRef.current) return
        const lock = await globalThis.navigator?.wakeLock?.request?.('screen')
        if (seq !== wakeSeq.current || wakeRef.current) lock?.release?.().catch?.(() => {})
        else wakeRef.current = lock ?? null
      } else {
        const lock = wakeRef.current
        wakeRef.current = null
        await lock?.release?.()
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
  const sleepMin = sleepPreset ? (lateGo ? sleepPreset.lateMinutes : sleepPreset.minutes) : opts.minutes
  const player = () => (sleepRef.current ??= createSleepPlayer())
  // Alarm kartından gelince müzik ekran açılır açılmaz hazırlanır: "Başlat" dokunuşunda beklemeden çalsın
  // (iOS sesi yalnız dokunuşun içinde başlatır; Bug 22)
  useEffect(() => {
    if (phase !== 'sleep-ready' || !(sleepMin > 0)) return undefined
    let alive = true
    setSleepReady(false)
    player().prepare({ mode: 'sakin', totalSec: sleepMin * 60 })
      .then((ok) => alive && setSleepReady(ok))
      .catch(() => alive && setError('Müzik hazırlanamadı. Yeniden dene.'))
    return () => {
      alive = false
    }
    // player() aynı nesneyi döndürür
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sleepMin])
  // "Kur"la başlamış müziğe bağlan: süre sayacı, bitiş, çaldı mı
  useEffect(() => {
    if (!session) return undefined
    const p = session.player
    p.listen({ onTick: ({ left: l }) => setLeft(l), onEnd: () => endSleep(false) })
    keepAwake(true)
    let alive = true
    session.run.then((ok) => alive && setSleepState(sleepStateOf(ok, p)))
    return () => {
      alive = false
    }
    // yalnız açılışta; endSleep güncel ref'leri okur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])
  async function startSleep() {
    const p = player()
    setShowCtl(false)
    setDrift([0, 0])
    setSleepState('preparing')
    setLeft(sleepMin * 60)
    keepAwake(true)
    try {
      // Hazırsa start() çalmayı bu dokunuşun içinde başlatır; ekran geçişi sonra
      const run = p.start({
        mode: 'sakin',
        totalSec: sleepMin * 60,
        onTick: ({ left: l }) => setLeft(l),
        onEnd: () => endSleep(false),
      })
      setPhase('sleep')
      const ok = await run
      setSleepState(sleepStateOf(ok, p))
    } catch {
      p.stop()
      keepAwake(false)
      setError('Müzik hazırlanamadı. Yeniden dene.')
      setPhase(sleepPreset ? 'sleep-ready' : 'pick')
    }
  }
  function endSleep(early) {
    const p = sleepRef.current
    if (!p) return
    const sec = p.elapsed()
    p.stop()
    sleepRef.current = null
    keepAwake(false)
    if (sleepPreset) onSleepEnd?.({ planned: sleepMin, seconds: Math.round(sec), early, auto: Boolean(sleepPreset.auto) })
    const rec = sec < MIN_SAVE_SEC ? null : makeRecord({ mode: 'sakin', minutes: sleepMin, plan: { used: false }, seconds: sec, sleep: true })
    if (rec) {
      setFact(factFor(sessions, 'sakin', { sleep: true }))
      setRecord(rec)
      onSave?.(rec)
    }
    // Müzik kendiliğinden bitti: saat ve alarm ekranda kalır (gece saati); ekran açık tutulmaz, telefon kendi kilidiyle
    // kapanır. Sonuç ekranına "Bitir"le geçilir.
    if (!early) {
      setShowCtl(false)
      setSleepState('done')
      return
    }
    leaveSleep(rec)
  }
  function leaveSleep(rec) {
    setSleepState('idle')
    setShowCtl(false)
    setCtlHold(false)
    setDrift([0, 0])
    if (rec) setPhase('result')
    else if (sleepPreset) onExit?.()
    else setPhase('pick')
  }
  // Uyku ekranında dokununca denetimler 5 sn görünür
  useEffect(() => {
    if (!showCtl || ctlHold) return undefined
    const id = setTimeout(() => setShowCtl(false), 5000)
    return () => clearTimeout(id)
  }, [showCtl, ctlHold])
  // Gece saati: her dakika başında yeniden çiz ve (Hareketi Azalt kapalıysa) birkaç nokta kaydır; OLED'de iz kalmasın
  // "Hareketi Azalt" her dakika yeniden okunur (gece içinde açılırsa hemen durur). Kilit açılınca saat beklemeden yenilenir.
  useEffect(() => {
    if (phase !== 'sleep') return undefined
    let id
    const still = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
    const tick = () => {
      setClockTick((n) => n + 1)
      setDrift((d) => (still() ? [0, 0] : nextDrift(d)))
      id = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    }
    id = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    const onVis = () => document.visibilityState === 'visible' && setClockTick((n) => n + 1)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearTimeout(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [phase])

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
    return (
      <NightClock
        now={new Date()}
        left={left}
        total={sleepMin * 60}
        state={sleepState}
        alarmLabel={sleepPreset?.alarmLabel}
        alarmAt={sleepPreset?.alarmAt}
        drift={drift}
        showEnd={showCtl}
        onTap={() => setShowCtl(true)}
        onEndFocus={() => setCtlHold(true)}
        onEndBlur={() => setCtlHold(false)}
        onEnd={() => (sleepState === 'done' ? leaveSleep(record) : endSleep(true))}
        onKick={() => {
          // iOS çalmayı reddetti: yeni bir dokunuşla yeniden dene (dokunuşun içinde)
          engine.unlock()
          sleepRef.current?.resume().then((ok) => setSleepState(ok ? 'playing' : 'blocked'))
        }}
      />
    )
  }

  // Alarm kartından: tek dokunuşla uyku sesi (ses ancak dokunuşla açılır: iOS). Süre alarm kuralından gelir.
  if (phase === 'sleep-ready') {
    const late = !(sleepMin > 0)
    const canLate = late && sleepPreset.lateMinutes > 0
    return (
      <main className="dg-sleep dg-sleep-ready" aria-label="Uyku sesi">
        <span className="dg-ey">Uyku sesi · Dalga · Sakin</span>
        <h1 className="dg-h">{late ? 'Alarmına 1 saatten az kaldı' : `${sleepMin} dk, sonra yavaşça susar`}</h1>
        <p className="dg-sleep-sub">
          {late
            ? canLate
              ? `Uyku sesi normalde alarmdan 1 saat önce biter. İstersen ${sleepPreset.lateMinutes} dk çalar, alarmdan ${LATE_GAP_MIN} dk önce susar.`
              : 'Alarm çok yakın; uyku sesi çalmıyor.'
            : sleepPreset.auto ? 'Sana göre: süre sabah cevaplarınla ayarlanır.' : 'Telefon kilitlenince de çalar.'}
        </p>
        {sleepPreset.alarmLabel && <p className="dg-sleep-alarm">Alarm {sleepPreset.alarmLabel}</p>}
        {error && <p className="dg-err" role="alert">{error}</p>}
        <div className="dg-sleep-go">
          {!late && (
            <button className="btn" disabled={!sleepReady} onClick={() => { engine.unlock(); setError(null); startSleep() }}>
              <Moon size={18} aria-hidden="true" /> {sleepReady ? 'Başlat' : 'Müzik hazırlanıyor…'}
            </button>
          )}
          {canLate && <button className="btn" onClick={() => setLateGo(true)}><Moon size={18} aria-hidden="true" /> {`Yine de çal · ${sleepPreset.lateMinutes} dk`}</button>}
          <button className="btn btn-ghost" onClick={onExit}>{late && !canLate ? 'Tamam' : 'Vazgeç'}</button>
        </div>
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
        <h1 className="dg-h">{greeting()}.</h1>
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
        {/* "Bana hatırlat" (bildirim PLAN.v1 §A.2): App ctx.remindField(route, { inPath }) verir; Dalga'nın Bugünün yolunda durağı yok; uyku kipinin sabah ekranında yok (plan: uyku kipi hatırlatılmaz) */}
        {remindField}
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
