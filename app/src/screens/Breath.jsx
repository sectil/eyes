import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Check, RotateCcw, ShieldAlert, HeartPulse, Car, Info, ChevronRight, ChevronLeft, ChevronDown, SkipBack, SkipForward, Settings2, Volume2, VolumeX, SlidersHorizontal, Zap, Plus } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import BreathWave from '../components/BreathWave.jsx'
import BreathVisual from '../components/BreathVisual.jsx'
import DayChain from '../components/DayChain.jsx'
import { haptic } from '../lib/native.js'
import { speak, unlockAudio } from '../lib/cue.js'
import { playBreathSound, unlockBreathSfx, releaseBreathSfx, breathContext } from '../lib/breathSfx.js'
import { VOICE_LABEL, VOICE_LANG, phraseId, PHRASES, preloadVoice, playPhrase, loadIndex, availableFrom, voiceStatus } from '../lib/voicePack.js'
import { getPrefs, subscribePrefs } from '../lib/prefs.js'
import {
  PATTERNS, PATTERN_ORDER, PHASE, KIND_ORDER, LIMITS, STEP_SEC, DURATIONS_SEC, CALM_SCALE, SAFETY_ROWS, PREP_SEC,
  VISUALS, SOUNDS, SOUND_SLOTS, LEVELS, QUICK, phaseText,
  makePlan, resolveSecs, phaseAt, phaseStartSec, makeRecord, programProgress, loadBreathOpts, saveBreathOpts, safetySeen, markSafetySeen, isBreath,
  DEFAULT_PATTERN, PROGRAM_DAY_SEC,
} from '../lib/breath.js'
import { breathSafety } from '../lib/breathMix.js'
import '../styles/breath.css'

const KIND_ROW = { in: 'Al', in2: 'Ek alış', hold: 'Tut', out: 'Ver', hold2: 'Bekle' }
const fmtSec = (v) => (Number.isInteger(v) ? `${v}` : v.toFixed(1).replace('.', ','))
const fmtNum = (v) => fmtSec(+v) // Türkçe ondalık virgül (7,5)
const LEVEL_SHORT = { strong: 'güçlü', moderate: 'orta', limited: 'sınırlı' }
// "Bugünün ritmi"nin süreleri kalıpların alt satırıyla aynı biçimde ("5 sn al · 5 sn ver · dakikada 6 nefes"; lib/breath.js
// PATTERNS[*].sub): "5 · 5"teki sayıların saniye olduğu kartta yazsın (5 saniye turu 2)
const KIND_WORD = { in: 'al', in2: 'ek alış', hold: 'tut', out: 'ver', hold2: 'bekle' }
export function rhythmLine(secs, bpm) {
  const parts = KIND_ORDER.filter((k) => secs[k] > 0).map((k) => `${fmtSec(secs[k])} sn ${KIND_WORD[k]}`)
  return [...parts, `dakikada ${fmtNum(bpm)} nefes`].join(' · ')
}

// Kanıt düzeyi rozeti (Artifact "Nefona Nefes"): güçlü · orta · sınırlı; renk tek başına anlam taşımaz, yazı hep yanında
function Level({ level, short = false }) {
  if (!level) return null
  return <span className={`br-ev ${level}${short ? ' sm' : ''}`}><i aria-hidden="true" />{short ? LEVEL_SHORT[level] : LEVELS[level]}</span>
}

// Bitiş işareti (yoldan açılan seans, 5 saniye turu): nefes küresi ve seansın halkası. Tamamlanınca halka kapanır ve
// kürede onay çizilir; erken bitince halka yapılan kadar dolar, onay yok. Hareketi Azalt açıkken çizim durağandır.
function DoneMark({ frac = 1, complete = true }) {
  const f = Math.max(0, Math.min(1, frac))
  return (
    <svg className={`br-done-mk${complete ? ' ok' : ''}`} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="br-done-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--iris-1)" />
          <stop offset="1" stopColor="var(--iris-2)" />
        </linearGradient>
        <radialGradient id="br-done-orb" cx=".38" cy=".34" r=".75">
          <stop offset="0" stopColor="#8fe9f0" />
          <stop offset=".45" stopColor="var(--iris-1)" />
          <stop offset="1" stopColor="var(--iris-2)" />
        </radialGradient>
      </defs>
      <circle className="rp r1" cx="60" cy="60" r="44" />
      <circle className="rp r2" cx="60" cy="60" r="44" />
      <circle className="tk" cx="60" cy="60" r="54" />
      <circle className="rg" cx="60" cy="60" r="54" pathLength="1" style={{ strokeDashoffset: 1 - f }} />
      <circle className="orb" cx="60" cy="60" r="40" />
      {complete && <path className="ck" d="M43 61.5l11.5 11.5L78 49" pathLength="1" />}
    </svg>
  )
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

// Ayrıntıdaki "nasıl yapılır" satırları. Günün kalıbında süreler kalıbın kendi sürelerinden farklıdır: süre söyleyen
// satırlar (ve kutunun "hepsi aynı süre" satırı) yazılmaz; süreleri adım kutuları gösterir. Boş kalırsa (Sakin ritim)
// ekran listeyi hiç çizmez.
export function howLines(def, mix = null) {
  if (!mix) return def.how
  return def.how.filter((t) => !/\d|aynı süre/.test(t))
}

// Seans planı, en az minSec sürecek biçimde. makePlan döngü sayısını yuvarlar: düzenlenmiş kalıpta 1 dk 56–57 sn
// kalabiliyor (ör. 4-4-6 → 4×14 = 56) ve hatırlatmadan açılan nefes "yapıldı" eşiğine (lib/notifyLog.js
// BREATH_DONE_SEC) hiç ulaşmıyordu. Kısa kalırsa döngü sayısı yukarı yuvarlanır.
export function planAtLeast(args, minSec = null) {
  const plan = makePlan(args)
  if (!(minSec > 0) || plan.totalSec >= minSec) return plan
  return makePlan({ ...args, durationSec: plan.cycleSec * Math.ceil(minSec / plan.cycleSec) })
}

// Yoldaki "Bugünün ritmi" (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5; lib/breathMix.js breathOfDay) bu seansta kullanılır mı:
// kişinin kendi kalıbı (kaydedilmiş kalıp Sakin ritim değil ya da süreleri düzenlenmiş) her zaman önce gelir; tutmalı ya
// da beklemeli kalıbın ön koşulu güvenlik kartının görülmesi ve son 7 günde "Zorlandım" olmamasıdır. Uymazsa null.
export function autoMix(pathMix, saved, { sessions = [], now = new Date(), seen = false } = {}) {
  if (!pathMix || !PATTERNS[pathMix.family] || pathMix.family === 'custom') return null
  if (saved && (saved.pattern !== DEFAULT_PATTERN || saved.edits != null)) return null
  if ((pathMix.hold > 0 || pathMix.pause > 0) && !breathSafety(sessions, now, { seen }).holdOk) return null
  return pathMix
}

// presetSec: Bugünün yolundaki Nefes durağı durağın süresiyle açar (ilerleme yokken 5 dk, varken 1, 2 ya da 3 dk;
// kayıtlı süre tercihi değişmez; kullanıcı süreyi kendisi değiştirirse o kaydedilir).
// pathMix: yoldaki "Bugünün ritmi" (autoMix'ten geçerse seansın kalıbı olur; kişi kalıbı ya da süreleri değiştirirse
// kalkar ve kişinin seçimi kaydedilir; yalnız süre, görsel ya da ses değişirse kayıtlı kalıp tercihi değişmez).
// moreSec: yoldaki 3 dk tamamlanınca "2 dk daha": aynı kalıpla sürer ve seansı program gününün 5 dk'sına tamamlar;
// tek kayıt yazılır (saniyeler toplanır). "Zorlandım" işaretlendiyse düğme yok.
// extra: yoldan açılan seansın kaydına eklenecek alanlar ({ stage }); üretilen kalıp kullanıldıysa kayda mix de yazılır.
// day: yoldan açılan seansta bugünün yolu (lib/today.js buildPath; modules/breath/view.jsx). Bitişte günün zinciri
// bu durakla birlikte çizilir ("Bugünün yolu · 4/10 durak"). Yoksa zincir yok.
// askCalm false: başta ve sonda sakinlik puanı sorulmaz (hatırlatmadan açılan 1 dk nefes; kayıt calmBefore/After null).
// minSec: seans en az bu kadar sürer (hatırlatmadan açılan 1 dk nefes; planAtLeast).
// Tasarım: Artifact "Nefona Nefes" (onaylı) — seçim (ritmi çizili kalıplar, kanıt düzeyi), ayrıntı, başlarken sakinlik
// (alttan sayfa, puansız başlanabilir), seans (burun değiştirmede taraf, vızıltıda "mmm"), güvenlik bir kez.
// Geliştirici derlemesinde seslendirme tanısı (cihazda neden çalmadığını görmek için)
const DEV_BUILD = import.meta.env.VITE_APP_BUILD === 'dev'
const diagText = (st) => `tanı: liste ${st.index} · çözülen ${st.decoded} · hata ${st.failed}${st.path ? ` · yol ${st.path}` : ''}${st.error ? ` · ${st.error}` : ''}`

export default function Breath({ sessions = [], presetSec = null, askCalm = true, minSec = null, pathMix = null, moreSec = null, extra = null, day = null, onBack, onFinish }) {
  const prior = sessions.filter(isBreath).length
  // Yoldaki "Bugünün ritmi": ilk çizimde bir kez karar verilir (kişi kalıbı değiştirince kalkar)
  const [mix, setMix] = useState(() => autoMix(pathMix, loadBreathOpts(), { sessions, seen: safetySeen() }))
  const [opts, setOpts] = useState(() => {
    const base = presetSec ? { ...loadBreathOpts(), durationSec: presetSec } : loadBreathOpts()
    return mix ? { ...base, pattern: mix.family, edits: mix.edits ?? null } : base
  })
  const [screen, setScreen] = useState(() => (safetySeen() ? 'pick' : 'safety')) // safety | pick | detail | sound | info | run | result
  const [back, setBack] = useState('pick') // bilgi/ses ekranından dönülecek yer
  const [sheet, setSheet] = useState(false) // başlarken sakinlik sayfası
  const [quick, setQuick] = useState(false) // 1 dakikada sakinleş (kayıtlı tercih değişmez)
  const [calmBefore, setCalmBefore] = useState(null)
  const [calmAfter, setCalmAfter] = useState(null)
  const [strained, setStrained] = useState(false)
  // "2 dk daha": ikinci bölümün en kısa süresi (sn; program günü 5 dk olsun) ya da null. carried: önceki bölümün saniyesi.
  const [more, setMore] = useState(null)
  const carried = useRef(0)
  const ask = askCalm && !quick
  // Seslendirme: hangi seste dosya var (public/voice/index.json); seçilen sesi önceden çöz
  const [voiceAvail, setVoiceAvail] = useState(null)
  const [, setDiagTick] = useState(0) // tanı satırı tazelensin (yalnız geliştirici derlemesi)
  // Seslendirme sesi Profilim'deki tercihten (prefs.voice); burada seçilmez
  const [voiceId, setVoiceId] = useState(() => getPrefs().voice)
  useEffect(() => subscribePrefs((p) => setVoiceId(p.voice)), [])
  useEffect(() => {
    loadIndex().then((ix) => setVoiceAvail(availableFrom(ix)))
  }, [])
  useEffect(() => {
    preloadVoice(breathContext(), voiceId).then(() => setDiagTick((t) => t + 1))
  }, [voiceId])
  // Sessiz tuşunda da duyulsun diye açılan ses oturumu: seans bitince ve ekrandan çıkınca bırakılır
  useEffect(() => {
    if (screen === 'result') releaseBreathSfx()
  }, [screen])
  useEffect(() => () => releaseBreathSfx(0), [])
  const planArgs = quick
    ? { pattern: QUICK.pattern, durationSec: QUICK.durationSec, priorSessions: prior, edits: null }
    : { pattern: opts.pattern, durationSec: more != null ? moreSec : opts.durationSec, priorSessions: prior, edits: opts.edits }
  const plan = planAtLeast(planArgs, more != null ? more : minSec)
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
    const ownPattern = 'pattern' in patch || 'edits' in patch
    setOpts(next)
    if (mix && ownPattern) setMix(null) // kişi kalıbı seçti: artık onun seçimi
    let toSave = presetSec && !('durationSec' in patch) ? { ...next, durationSec: loadBreathOpts().durationSec } : next
    if (mix && !ownPattern) toSave = { ...toSave, pattern: loadBreathOpts().pattern, edits: loadBreathOpts().edits } // günün kalıbı tercih olmaz
    saveBreathOpts(toSave)
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
    if (!playPhrase(breathContext(), voiceId, id, opts.volume)) speak(text)
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
  // "2 dk daha": aynı kalıpla, hazırlık sayımı olmadan sürer; iki bölüm tek kayıttır
  function continueMore() {
    const done = carried.current + Math.min(elapsedRef.current, plan.totalSec)
    carried.current = done
    unlockAudio()
    unlockBreathSfx()
    setMore(Math.max(0, PROGRAM_DAY_SEC - done))
    setPaused(false)
    lastKey.current = -1
    elapsedRef.current = 0
    t0.current = performance.now()
    setLive(null)
    setPrep(0)
    setScreen('run')
  }
  function save() {
    const rec = makeRecord({ plan, seconds: carried.current + Math.min(elapsedRef.current, plan.totalSec), calmBefore, calmAfter, strained, completed: elapsedRef.current >= plan.totalSec - 1 })
    // Yoldan açılan seans: basamak (stage) ve üretilen kalıp (mix; önceki günlerin kalıbı yinelenmesin, lib/breathMix.js)
    const path = extra && !quick ? { ...extra, ...(mix ? { mix: { family: mix.family, inhale: mix.inhale, hold: mix.hold, exhale: mix.exhale, pause: mix.pause } } : {}) } : null
    onFinish(path ? { ...rec, ...path } : rec)
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
        <PageHeader onBack={() => setScreen('pick')} eyebrow={opts.edits && !mix ? 'Kalıp · düzenlendi' : 'Kalıp'} title={def.title} />
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
        {/* Günün kalıbında süre söyleyen satırlar düşer; hiç satır kalmazsa (Sakin ritim) liste çizilmez, süreleri adım kutuları gösterir */}
        {howLines(def, mix).length > 0 && <ol className="br-how">{howLines(def, mix).map((t) => <li key={t}>{t}</li>)}</ol>}
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
            <SwitchRow
              label="Sesli komut"
              sub={<>{voiceAvail && !voiceAvail[voiceId]?.size ? 'Seslendirme dosyası yok; telefonun sesi kullanılır' : `Ses: ${VOICE_LABEL[VOICE_LANG][voiceId]} · Profilim'den değişir`}{DEV_BUILD && <span className="br-diag">{diagText(voiceStatus())}</span>}</>}
              checked={opts.voice}
              onChange={(on) => update({ voice: on })}
              trailing={
                <button type="button" className="br-listen" disabled={!opts.voice || !opts.sound} onClick={() => { unlockAudio(); unlockBreathSfx(); preloadVoice(breathContext(), voiceId).then(() => { say('in', PHRASES[VOICE_LANG].in); setTimeout(() => setDiagTick((t) => t + 1), 800) }) }}>
                  <Volume2 size={16} aria-hidden="true" /> Dinle
                </button>
              }
            />
          </div>
        </div>
        <button className="btn" onClick={begin}><Play size={18} aria-hidden="true" /> Başla · {opts.durationSec / 60} dk</button>
        {calmSheet}
      </main>
    )
  }

  if (screen === 'pick') {
    const others = PATTERN_ORDER.filter((id) => id !== 'custom' && id !== opts.pattern)
    // "1 dakikada sakinleş": yoldan açılınca kalıpların altında (ilk görünümde ikinci bir "Başla" olmasın; 5 saniye turu 2)
    const quickCard = askCalm && (
      <button type="button" className="br-quick" onClick={beginQuick}>
        <Zap size={20} aria-hidden="true" />
        <span><b>1 dakikada sakinleş</b><small>{PATTERNS[QUICK.pattern].title}, tek dakika</small></span>
        <em>Başla →</em>
      </button>
    )
    return (
      <main className={`screen fade-in br${extra ? ' br-path' : ''}`}>
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
          {/* Günün kalıbı (yoldan, 5 saniye turu 2): ritim ve süreleri, dalga, Başla. Kanıt cümlesi kanıt rozetinin
              arkasında: rozete (ya da başlığa) dokununca açılır; ilk görünümde makale cümlesi yok. */}
          {mix ? (
            <details className="br-why">
              <summary className="h1"><b>{def.title}</b><span className="br-why-lv"><Level level={def.level} /><ChevronDown size={16} aria-hidden="true" /></span></summary>
              <p>{def.evidence}</p>
            </details>
          ) : (
            <div className="h1"><b>{def.title}</b><Level level={def.level} /></div>
          )}
          {mix ? <p className="br-today"><b>Bugünün ritmi: {mix.label}</b><span>{rhythmLine(secs, plan.bpm)}</span></p> : <p>{def.blurb}</p>}
          <BreathWave phases={plan.phases} repeat={plan.phases.length > 3 ? 1 : 2} width={300} height={58} />
          <div className="meta">{!mix && <span><b>{fmtNum(plan.bpm)}</b>/dk nefes</span>}<span><b>{opts.durationSec / 60}</b> dk</span><span><b>{plan.cycles}</b> döngü</span></div>
          <div className="row2">
            <button type="button" className="btn" onClick={begin}><Play size={18} aria-hidden="true" /> Başla</button>
            <button type="button" className="btn btn-ghost br-adj" onClick={() => open('detail')} aria-label={`${def.title} ayarları`}><SlidersHorizontal size={20} /></button>
          </div>
        </section>
        {!extra && quickCard}
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
        {extra && quickCard}
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
    const partSec = Math.round(Math.min(elapsedRef.current, plan.totalSec))
    const complete = partSec >= plan.totalSec - 1
    const secsDone = Math.round(carried.current) + partSec
    const canMore = Boolean(moreSec) && more == null && !quick && complete && !strained && opts.durationSec === presetSec
    const subtitle = `${plan.title} · ${Math.round(secsDone / 60)} dk · ${Math.round(secsDone / plan.cycleSec)} döngü`
    const restart = () => { setCalmAfter(null); setCalmBefore(null); setStrained(false); setQuick(false); setMore(null); carried.current = 0; setScreen('pick') }
    // Yoldan açılan seans (ilerleme bağlamı, extra): bitiş anı (5 saniye turu 1–2). Metinler ve düğmeler aynı; sıra ve
    // vurgu: bitiş işareti, altında günün zinciri (bu durak da bitti: "Bugünün yolu · 4/10 durak"), sakinlik puanı, asıl
    // eylem Kaydet ile yanında "2 dk daha", en altta Zorlandım ve Yeniden. İçerik ekranın ortasında toplu (boşluk yok).
    // Kaydet puan seçilene dek vurgu renginde soluk (gri "bozuk" gibi okunuyordu). Yoksa bugünkü gibi.
    if (extra) {
      const restKeys = complete && day ? day.stops.filter((s) => s.restSlot && !s.done).map((s) => s.key) : []
      const dayDone = day ? day.stops.filter((s) => s.done || restKeys.includes(s.key)).length : 0
      return (
        <main className="screen fade-in br br-res">
          <header className="br-done">
            <DoneMark frac={complete ? 1 : secsDone / Math.max(1, carried.current + plan.totalSec)} complete={complete} />
            <span className="eyebrow">Nefes</span>
            <h1>{complete ? 'Tamamlandı' : 'Erken bitti'}</h1>
            <p>{subtitle}</p>
          </header>
          {restKeys.length > 0 && (
            <div className="br-dc">
              <DayChain plan={day} doneKeys={restKeys} />
              <span>Bugünün yolu · <b>{dayDone}/{day.total}</b> durak</span>
            </div>
          )}
          {ask && calmBefore != null && (
            <div className={`br-calmcard${calmAfter == null ? ' need' : ''}`}>
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
          <div className="br-res-act">
            <button className="btn" onClick={save} disabled={ask && calmBefore != null && calmAfter == null}><Check size={18} aria-hidden="true" /> Kaydet</button>
            {canMore && <button type="button" className="btn btn-ghost" onClick={continueMore}><Plus size={18} aria-hidden="true" /> 2 dk daha</button>}
          </div>
          <div className="br-res-row">
            <button type="button" className="br-chip" aria-pressed={strained} onClick={() => setStrained((v) => !v)}>
              {strained ? <Check size={16} aria-hidden="true" /> : null} Zorlandım{strained ? ' · kaydedildi' : ''}
            </button>
            <button type="button" className="br-chip ghost" onClick={restart}><RotateCcw size={16} aria-hidden="true" /> Yeniden</button>
          </div>
          {strained && <p className="muted small">Bir sonraki seansta süreyi ya da tutmaları kısalt. Baş dönmesi olduysa bugün tekrar etme.</p>}
        </main>
      )
    }
    return (
      <main className="screen fade-in br">
        <PageHeader eyebrow="Nefes" title={complete ? 'Tamamlandı' : 'Erken bitti'} subtitle={subtitle} />
        {canMore && <button type="button" className="btn btn-ghost" onClick={continueMore}><Plus size={18} aria-hidden="true" /> 2 dk daha</button>}
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
        <button className="btn btn-ghost" onClick={restart}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
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
