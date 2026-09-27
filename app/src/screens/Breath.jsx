import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Check, RotateCcw, ShieldAlert, HeartPulse, Car, Info, ChevronRight, ChevronLeft, SkipBack, SkipForward, Settings2, Volume2, VolumeX, SlidersHorizontal, Zap } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import BreathWave from '../components/BreathWave.jsx'
import BreathVisual from '../components/BreathVisual.jsx'
import { haptic } from '../lib/native.js'
import { speak, unlockAudio } from '../lib/cue.js'
import { playBreathSound, unlockBreathSfx, releaseBreathSfx, breathContext } from '../lib/breathSfx.js'
import { VOICES, VOICE_LABEL, VOICE_LANG, phraseId, PHRASES, preloadVoice, playPhrase, loadIndex, availableFrom, voiceStatus } from '../lib/voicePack.js'
import {
  PATTERNS, PATTERN_ORDER, PHASE, KIND_ORDER, LIMITS, STEP_SEC, DURATIONS_SEC, CALM_SCALE, SAFETY_ROWS, PREP_SEC,
  VISUALS, SOUNDS, SOUND_SLOTS, LEVELS, QUICK, phaseText,
  makePlan, resolveSecs, phaseAt, phaseStartSec, makeRecord, programProgress, loadBreathOpts, saveBreathOpts, safetySeen, markSafetySeen, isBreath,
} from '../lib/breath.js'
import '../styles/breath.css'

const KIND_ROW = { in: 'Al', in2: 'Ek alış', hold: 'Tut', out: 'Ver', hold2: 'Bekle' }
const fmtSec = (v) => (Number.isInteger(v) ? `${v}` : v.toFixed(1).replace('.', ','))
const fmtNum = (v) => fmtSec(+v) // Türkçe ondalık virgül (7,5)
const LEVEL_SHORT = { strong: 'güçlü', moderate: 'orta', limited: 'sınırlı' }

// Kanıt düzeyi rozeti (Artifact "Nefona Nefes"): güçlü · orta · sınırlı; renk tek başına anlam taşımaz, yazı hep yanında
function Level({ level, short = false }) {
  if (!level) return null
  return <span className={`br-ev ${level}${short ? ' sm' : ''}`}><i aria-hidden="true" />{short ? LEVEL_SHORT[level] : LEVELS[level]}</span>
}

// Basit anahtar satırı (ayrıntı ekranı): etiket + anahtar; trailing: anahtarın solunda ek düğme
function SwitchRow({ label, sub, checked, onChange, trailing = null }) {
  return (
    <div className="br-sw">
      <span className="lbl">{label}{sub && <small>{sub}</small>}</span>
      {trailing}
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className="br-switch" onClick={() => onChange(!checked)}><i /></button>
    </div>
  )
}

// Güvenlik metni: üç kalın başlıklı satır (lib/breath.js SAFETY_ROWS)
const SAFETY_ICON = { dizzy: ShieldAlert, heart: HeartPulse, car: Car }
function SafetyRows() {
  return (
    <div className="br-safe">
      {SAFETY_ROWS.map((r) => {
        const Icon = SAFETY_ICON[r.icon] ?? ShieldAlert
        return (
          <div key={r.icon}>
            <Icon size={20} aria-hidden="true" />
            <p><b>{r.lead}</b>{r.text}</p>
          </div>
        )
      })}
    </div>
  )
}

// Seans planı, en az minSec sürecek biçimde. makePlan döngü sayısını yuvarlar: düzenlenmiş kalıpta 1 dk 56–57 sn
// kalabiliyor (ör. 4-4-6 → 4×14 = 56) ve hatırlatmadan açılan nefes "yapıldı" eşiğine (lib/notifyLog.js
// BREATH_DONE_SEC) hiç ulaşmıyordu. Kısa kalırsa döngü sayısı yukarı yuvarlanır.
export function planAtLeast(args, minSec = null) {
  const plan = makePlan(args)
  if (!(minSec > 0) || plan.totalSec >= minSec) return plan
  return makePlan({ ...args, durationSec: plan.cycleSec * Math.ceil(minSec / plan.cycleSec) })
}

// presetSec: Bugünün yolundaki Nefes durağı 5 dk ile açar (kayıtlı süre tercihi değişmez; kullanıcı süreyi
// kendisi değiştirirse o kaydedilir).
// askCalm false: başta ve sonda sakinlik puanı sorulmaz (hatırlatmadan açılan 1 dk nefes; kayıt calmBefore/After null).
// minSec: seans en az bu kadar sürer (hatırlatmadan açılan 1 dk nefes; planAtLeast).
// Tasarım: Artifact "Nefona Nefes" (onaylı) — seçim (ritmi çizili kalıplar, kanıt düzeyi), ayrıntı, başlarken sakinlik
// (alttan sayfa, puansız başlanabilir), seans (burun değiştirmede taraf, vızıltıda "mmm"), güvenlik bir kez.
// Geliştirici derlemesinde seslendirme tanısı (cihazda neden çalmadığını görmek için)
const DEV_BUILD = import.meta.env.VITE_APP_BUILD === 'dev'
const diagText = (st) => `tanı: liste ${st.index} · çözülen ${st.decoded} · hata ${st.failed}${st.path ? ` · yol ${st.path}` : ''}${st.error ? ` · ${st.error}` : ''}`

export default function Breath({ sessions = [], presetSec = null, askCalm = true, minSec = null, onBack, onFinish }) {
  const prior = sessions.filter(isBreath).length
  const [opts, setOpts] = useState(() => (presetSec ? { ...loadBreathOpts(), durationSec: presetSec } : loadBreathOpts()))
  const [screen, setScreen] = useState(() => (safetySeen() ? 'pick' : 'safety')) // safety | pick | detail | sound | info | run | result
  const [back, setBack] = useState('pick') // bilgi/ses ekranından dönülecek yer
  const [sheet, setSheet] = useState(false) // başlarken sakinlik sayfası
  const [quick, setQuick] = useState(false) // 1 dakikada sakinleş (kayıtlı tercih değişmez)
  const [calmBefore, setCalmBefore] = useState(null)
  const [calmAfter, setCalmAfter] = useState(null)
  const [strained, setStrained] = useState(false)
  const ask = askCalm && !quick
  // Seslendirme: hangi seste dosya var (public/voice/index.json); seçilen sesi önceden çöz
  const [voiceAvail, setVoiceAvail] = useState(null)
  const [, setDiagTick] = useState(0) // tanı satırı tazelensin (yalnız geliştirici derlemesi)
  useEffect(() => {
    loadIndex().then((ix) => setVoiceAvail(availableFrom(ix)))
  }, [])
  useEffect(() => {
    preloadVoice(breathContext(), opts.voiceId).then(() => setDiagTick((t) => t + 1))
  }, [opts.voiceId])
  // Sessiz tuşunda da duyulsun diye açılan ses oturumu: seans bitince ve ekrandan çıkınca bırakılır
  useEffect(() => {
    if (screen === 'result') releaseBreathSfx()
  }, [screen])
  useEffect(() => () => releaseBreathSfx(0), [])
  const planArgs = quick
    ? { pattern: QUICK.pattern, durationSec: QUICK.durationSec, priorSessions: prior, edits: null }
    : { pattern: opts.pattern, durationSec: opts.durationSec, priorSessions: prior, edits: opts.edits }
  const plan = planAtLeast(planArgs, minSec)
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
    saveBreathOpts(presetSec && !('durationSec' in patch) ? { ...next, durationSec: loadBreathOpts().durationSec } : next)
  }
  const stepSec = (kind, dir) => {
    const cur = secs[kind]
    const [lo, hi] = LIMITS[kind]
    const v = Math.min(hi, Math.max(lo, cur + dir * STEP_SEC))
    update({ edits: { ...secs, [kind]: v } })
  }
  const pick = (id) => update({ pattern: id, edits: null })
  const open = (to) => { setBack(screen); setScreen(to); window.scrollTo?.(0, 0) }

  function start() {
    unlockAudio()
    unlockBreathSfx()
    setSheet(false)
    setPrep(PREP_SEC)
    setPaused(false)
    lastKey.current = -1
    elapsedRef.current = 0
    setLive(phaseAt(plan, 0))
    setScreen('run')
    say('prep', 'Hazırlan')
  }
  // Başla: sakinlik sorulacaksa önce alttan sayfa; kısayol ve hatırlatmadan açılan nefes doğrudan başlar
  const begin = () => (ask ? setSheet(true) : start())
  const beginQuick = () => {
    setQuick(true)
    setCalmBefore(null)
  }
  // Kısayol seçilince plan yeniden hesaplanır; seans bir sonraki çizimde başlar (plan güncel olsun)
  useEffect(() => {
    if (quick && screen !== 'run' && screen !== 'result') start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quick])

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
        cuePhase(st.phase)
      }
      if (st.done) {
        clearInterval(id)
        if (opts.vibrate) haptic('success')
        if (opts.sound) playBreathSound(opts.sounds.end, opts.volume)
        say('done', 'Tamamlandı')
        setScreen('result')
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, prep, paused])

  // Sesli komut: seçilen seslendirme (ElevenLabs dosyası), yoksa telefonun sesi
  const say = (id, text) => {
    if (!opts.sound || !opts.voice) return
    if (!playPhrase(breathContext(), opts.voiceId, id, opts.volume)) speak(text)
  }
  function cuePhase(phase) {
    const ph = PHASE[phase.kind]
    if (opts.vibrate) haptic(ph.haptic)
    if (opts.sound) playBreathSound(opts.sounds[phase.kind] ?? 'none', opts.volume)
    say(phraseId(phase), phaseText(phase).say)
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
      <main className="screen fade-in br">
        <PageHeader onBack={onBack} eyebrow="Nefesten önce · bir kez" title="Üç şey bil, sonra başla" />
        <SafetyRows />
        <p className="muted small">Bu üç madde Nefes'in bilgi sayfasında hep durur.</p>
        <div className="grow" />
        <button className="btn" onClick={() => { markSafetySeen(); setScreen('pick') }}><Check size={18} aria-hidden="true" /> Anladım</button>
      </main>
    )
  }

  if (screen === 'info') {
    return (
      <main className="screen fade-in br">
        <PageHeader onBack={() => setScreen(back === 'info' ? 'pick' : back)} eyebrow="Nefes" title="Kalıplar ve kanıt" subtitle="Kanıt düzeyi PubMed'deki çalışmalara göre: güçlü, orta, sınırlı." />
        <div className="br-evlist">
          {PATTERN_ORDER.map((id) => (
            <div key={id}>
              <div className="h"><b>{PATTERNS[id].title}</b><Level level={PATTERNS[id].level} short /></div>
              <span className="r">{PATTERNS[id].sub}</span>
              <p>{PATTERNS[id].evidence}</p>
            </div>
          ))}
        </div>
        <p className="muted small">Program: günde 5 dk, 28 gün (Balban 2023). İlk üç seansta Sakin ritim biraz daha hızlı başlar; alışınca dakikada 6'ya iner. 4-7-8 ve hızlı nefes teknikleri bilerek yok: kanıtı zayıf ya da riskli.</p>
        <SafetyRows />
      </main>
    )
  }

  if (screen === 'sound') {
    return (
      <main className="screen fade-in br">
        <PageHeader onBack={() => setScreen('detail')} eyebrow="Nefes" title="Ses" />
        <div className="list">
          {SOUND_SLOTS.map((slot) => (
            <div key={slot.id} className="br-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <span className="lbl">{slot.title}</span>
              <div className="br-sound-grid" role="group" aria-label={`${slot.title} sesi`}>
                {SOUNDS.map((so) => (
                  <button
                    key={so.id}
                    type="button"
                    aria-pressed={opts.sounds[slot.id] === so.id}
                    onClick={() => { unlockBreathSfx(); update({ sounds: { ...opts.sounds, [slot.id]: so.id } }); playBreathSound(so.id, opts.volume) }}
                  >
                    {so.title}
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
        <p className="muted small">Sesli komut açıksa ton ile birlikte "Nefes al… tut… ver…" de söylenir. Burun değiştirmede "Soldan al, sağdan ver", vızıltıda "Mmm" denir.</p>
      </main>
    )
  }

  const calmSheet = sheet && (
    <>
      <div className="br-scrim" onClick={() => setSheet(false)} aria-hidden="true" />
      <div className="br-sheet" role="dialog" aria-modal="true" aria-labelledby="br-calm-t">
        <i className="grab" aria-hidden="true" />
        <h2 id="br-calm-t">Şu an ne kadar sakinsin?</h2>
        <p>Bittiğinde aynı soruyu sorarım; önce ve sonrası Gelişim'e yazılır.</p>
        <div className="br-calm5" role="group" aria-label="1 gergin, 5 çok sakin">
          {CALM_SCALE.map((v) => (
            <button key={v} type="button" aria-pressed={calmBefore === v} onClick={() => setCalmBefore(v)}>{v}</button>
          ))}
        </div>
        <div className="br-ends"><span>1 · gergin</span><span>5 · çok sakin</span></div>
        <button type="button" className="btn" onClick={start} disabled={calmBefore == null}><Play size={18} aria-hidden="true" /> Başla</button>
        <button type="button" className="br-link" onClick={() => { setCalmBefore(null); start() }}>Puansız başla</button>
      </div>
    </>
  )

  if (screen === 'detail') {
    const kinds = KIND_ORDER.filter((k) => k !== 'in2' || opts.pattern === 'sigh' || secs.in2 > 0)
    const sideLegend = plan.phases.some((p) => p.side)
    return (
      <main className="screen fade-in br">
        <PageHeader onBack={() => setScreen('pick')} eyebrow={opts.edits ? 'Kalıp · düzenlendi' : 'Kalıp'} title={def.title} />
        <div className="br-detwave">
          <BreathWave phases={plan.phases} width={300} height={86} labels className="big" />
          {sideLegend && <div className="br-ends"><span className="l">● sol burun</span><span className="r">● sağ burun</span></div>}
        </div>
        <p className="muted small br-meta">dakikada {fmtNum(plan.bpm)} nefes · {plan.cycles} döngü{plan.ramped ? ' · ilk seanslarda biraz hızlı' : ''}</p>
        <div className="br-steps" style={{ '--n': kinds.length }}>
          {kinds.map((k) => {
            const [lo, hi] = LIMITS[k]
            const v = secs[k]
            return (
              <div key={k} className={`st${v === 0 ? ' off' : ''}`}>
                <small>{KIND_ROW[k]}</small>
                <b aria-label={`${KIND_ROW[k]} ${fmtSec(v)} saniye`}>{fmtSec(v)}<em>sn</em></b>
                <span className="pm">
                  <button type="button" onClick={() => stepSec(k, -1)} disabled={v <= lo} aria-label={`${KIND_ROW[k]} azalt`}>−</button>
                  <button type="button" onClick={() => stepSec(k, 1)} disabled={v >= hi} aria-label={`${KIND_ROW[k]} artır`}>+</button>
                </span>
              </div>
            )
          })}
        </div>
        <ol className="br-how">{def.how.map((t) => <li key={t}>{t}</li>)}</ol>
        {def.level && (
          <div className="br-evid">
            <Level level={def.level} />
            <p>{def.evidence}</p>
          </div>
        )}
        <div className="br-set">
          <span className="h">Seans</span>
          <div className="br-seg" role="group" aria-label="Süre">
            {DURATIONS_SEC.map((d) => <button key={d} type="button" aria-pressed={opts.durationSec === d} onClick={() => update({ durationSec: d })}>{d / 60} dk</button>)}
          </div>
          <div className="br-seg" role="group" aria-label="Görsel">
            {VISUALS.map((v) => <button key={v.id} type="button" aria-pressed={opts.visual === v.id} onClick={() => update({ visual: v.id })}>{v.title}</button>)}
          </div>
          <div className="br-sws">
            <SwitchRow label="Titreşim" checked={opts.vibrate} onChange={(on) => update({ vibrate: on })} />
            <SwitchRow label="Ses" checked={opts.sound} onChange={(on) => update({ sound: on })} trailing={<button type="button" className="br-gear" onClick={() => open('sound')} aria-label="Ses ayarları"><Settings2 size={18} /></button>} />
            <div className="br-voice">
              <span className="lbl">Sesli komut<small>{voiceAvail && !voiceAvail[opts.voiceId]?.size ? 'Seslendirme dosyası yok; telefonun sesi kullanılır' : 'Nefes al · tut · ver söylenir'}</small>{DEV_BUILD && <small className="br-diag">{diagText(voiceStatus())}</small>}</span>
              <div className="br-seg" role="group" aria-label="Sesli komut">
                <button type="button" aria-pressed={!opts.voice} onClick={() => update({ voice: false })}>Kapalı</button>
                {VOICES.map((v) => (
                  <button key={v} type="button" aria-pressed={opts.voice && opts.voiceId === v} onClick={() => { unlockBreathSfx(); update({ voice: true, voiceId: v }) }}>{VOICE_LABEL[VOICE_LANG][v]}</button>
                ))}
              </div>
              <button type="button" className="br-listen" disabled={!opts.voice || !opts.sound} onClick={() => { unlockAudio(); unlockBreathSfx(); preloadVoice(breathContext(), opts.voiceId).then(() => { say('in', PHRASES[VOICE_LANG].in); setTimeout(() => setDiagTick((t) => t + 1), 800) }) }}>
                <Volume2 size={16} aria-hidden="true" /> Dinle
              </button>
            </div>
          </div>
        </div>
        <button className="btn" onClick={begin}><Play size={18} aria-hidden="true" /> Başla · {opts.durationSec / 60} dk</button>
        {calmSheet}
      </main>
    )
  }

  if (screen === 'pick') {
    const others = PATTERN_ORDER.filter((id) => id !== 'custom' && id !== opts.pattern)
    return (
      <main className="screen fade-in br">
        <div className="br-top">
          <button type="button" className="btn-icon" onClick={onBack} aria-label="Geri"><ChevronLeft size={20} /></button>
          <button type="button" className="btn-icon" onClick={() => open('info')} aria-label="Kalıplar ve kanıt"><Info size={20} /></button>
        </div>
        <span className="eyebrow br-ey">Sakinlik · nefes</span>
        <h1 className="br-title">Nefes</h1>
        <div className="br-prog" aria-label={`28 günlük program, ${program.days}. gün`}>
          <span className="d" aria-hidden="true">{Array.from({ length: program.target }, (_, i) => <i key={i} className={i < program.days ? 'f' : ''} />)}</span>
          <span><b>{program.target} günlük program</b> · {program.days > 0 ? `${program.days}. gün` : 'başla'}{program.todaySec > 0 ? ` · bugün ${Math.round(program.todaySec / 60)} dk` : ''}</span>
        </div>
        <section className="br-hero" aria-label={def.title}>
          <div className="h1"><b>{def.title}</b><Level level={def.level} /></div>
          <p>{def.blurb}</p>
          <BreathWave phases={plan.phases} repeat={plan.phases.length > 3 ? 1 : 2} width={300} height={58} />
          <div className="meta"><span><b>{fmtNum(plan.bpm)}</b>/dk nefes</span><span><b>{opts.durationSec / 60}</b> dk</span><span><b>{plan.cycles}</b> döngü</span></div>
          <div className="row2">
            <button type="button" className="btn" onClick={begin}><Play size={18} aria-hidden="true" /> Başla</button>
            <button type="button" className="btn btn-ghost br-adj" onClick={() => open('detail')} aria-label={`${def.title} ayarları`}><SlidersHorizontal size={20} /></button>
          </div>
        </section>
        {askCalm && (
          <button type="button" className="br-quick" onClick={beginQuick}>
            <Zap size={20} aria-hidden="true" />
            <span><b>1 dakikada sakinleş</b><small>{PATTERNS[QUICK.pattern].title}, tek dakika</small></span>
            <em>Başla →</em>
          </button>
        )}
        <div className="br-sec"><span>Diğer kalıplar</span><button type="button" onClick={() => open('info')}>Hepsinin kanıtı →</button></div>
        <div className="br-grid">
          {others.map((id) => {
            const p = PATTERNS[id]
            const ph = makePlan({ pattern: id, priorSessions: 99 }).phases
            return (
              <button key={id} type="button" className="br-tile" onClick={() => { pick(id); window.scrollTo?.(0, 0) }} aria-label={`${p.title}, ${p.rhythm}`}>
                <b>{p.title}</b>
                <BreathWave phases={ph} width={140} height={26} />
                <span className="r"><span>{p.rhythm}</span><Level level={p.level} short /></span>
              </button>
            )
          })}
        </div>
        <button type="button" className="br-cust" onClick={() => { pick('custom'); open('detail') }}>
          <SlidersHorizontal size={20} aria-hidden="true" />
          <span><b>Özel kalıp</b><small>Al, tut, ver, bekle sürelerini kendin kur</small></span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        {calmSheet}
      </main>
    )
  }

  if (screen === 'result') {
    const secsDone = Math.round(Math.min(elapsedRef.current, plan.totalSec))
    return (
      <main className="screen fade-in br">
        <PageHeader eyebrow="Nefes" title={secsDone >= plan.totalSec - 1 ? 'Tamamlandı' : 'Erken bitti'} subtitle={`${plan.title} · ${Math.round(secsDone / 60)} dk · ${Math.round(secsDone / plan.cycleSec)} döngü`} />
        {ask && calmBefore != null && (
          <div className="br-calmcard">
            <b>Şimdi ne kadar sakinsin?</b>
            <div className="br-calm5" role="group" aria-label="1 gergin, 5 çok sakin">
              {CALM_SCALE.map((v) => (
                <button key={v} type="button" aria-pressed={calmAfter === v} onClick={() => setCalmAfter(v)}>{v}</button>
              ))}
            </div>
            <div className="br-ends"><span>1 · gergin</span><span>5 · çok sakin</span></div>
          </div>
        )}
        {calmBefore != null && calmAfter != null && <p className="muted small">Önce {calmBefore}, sonra {calmAfter}. Bu senin puanın; bir iddia değil, kendi çizgin.</p>}
        <button type="button" className="btn btn-ghost" aria-pressed={strained} onClick={() => setStrained((v) => !v)}>
          {strained ? <Check size={18} aria-hidden="true" /> : null} Zorlandım{strained ? ' · kaydedildi' : ''}
        </button>
        {strained && <p className="muted small">Bir sonraki seansta süreyi ya da tutmaları kısalt. Baş dönmesi olduysa bugün tekrar etme.</p>}
        <button className="btn" onClick={save} disabled={ask && calmBefore != null && calmAfter == null}><Check size={18} aria-hidden="true" /> Kaydet</button>
        <button className="btn btn-ghost" onClick={() => { setCalmAfter(null); setCalmBefore(null); setStrained(false); setQuick(false); setScreen('pick') }}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
      </main>
    )
  }

  // run
  const st = live ?? phaseAt(plan, 0)
  const kind = st.phase.kind
  const txt = phaseText(st.phase)
  const inPrep = prep > 0
  const secLeft = inPrep ? prep : Math.max(1, Math.ceil(st.phase.sec - st.phaseElapsed))
  const mm = Math.floor(st.left / 60)
  const ss = String(Math.floor(st.left % 60)).padStart(2, '0')
  const nextPh = plan.phases[(st.index + 1) % plan.phases.length]
  const side = inPrep ? null : st.phase.side
  return (
    <div className="br-stage" role="application" aria-label="Nefes pratiği">
      <div className="br-top">
        <button type="button" className="btn-icon" onClick={stopEarly} aria-label="Bitir"><X size={20} /></button>
        <span className="br-time">{mm}:{ss}</span>
        <button type="button" className="btn-icon" onClick={() => update({ sound: !opts.sound })} aria-label={opts.sound ? 'Sesi kapat' : 'Sesi aç'}>{opts.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
      </div>
      <div className="br-phase">
        <small>{plan.title}{inPrep ? '' : ` · ${st.step} / ${st.steps}`}</small>
        <b aria-live="polite">{inPrep ? 'Hazırlan' : txt.label}</b>
        <span>{inPrep ? `${plan.cycles} döngü · ${Math.round(plan.totalSec / 60)} dk` : txt.sub ?? ' '}</span>
      </div>
      <div className="br-mid">
        <BreathVisual visual={opts.visual} kind={inPrep ? 'hold2' : kind} phaseSec={st.phase.sec} paused={paused || inPrep} />
        <span className="br-count" aria-hidden="true">{secLeft}</span>
        {plan.phases.some((p) => p.side) && (
          <div className="br-nose" aria-hidden="true">
            <span className={side === 'L' ? 'on' : side ? 'shut' : ''}><i />Sol</span>
            <span className={side === 'R' ? 'on' : side ? 'shut' : ''}><i />Sağ</span>
          </div>
        )}
      </div>
      <div className="br-controls">
        <button type="button" onClick={prevPhase} disabled={inPrep} aria-label="Önceki aşama"><SkipBack size={22} /></button>
        <button type="button" className="main" onClick={togglePause} disabled={inPrep} aria-label={paused ? 'Devam' : 'Duraklat'}>{paused ? <Play size={28} /> : <Pause size={28} />}</button>
        <button type="button" onClick={nextPhase} disabled={inPrep} aria-label="Sonraki aşama"><SkipForward size={22} /></button>
      </div>
      <div className="br-total" aria-hidden="true"><i style={{ transform: `scaleX(${inPrep ? 0 : 1 - st.left / plan.totalSec})` }} /></div>
      <p className="br-next" aria-hidden="true">{inPrep ? ' ' : `sonraki: ${phaseText(nextPh).label.toLocaleLowerCase('tr-TR')} · ${fmtSec(nextPh.sec)} sn`}</p>
    </div>
  )
}
