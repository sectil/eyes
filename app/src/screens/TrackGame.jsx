import { useEffect, useRef, useState } from 'react'
import { X, Trophy, Pause, Play, RotateCcw, Share2, Copy, Info as InfoIcon } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader } from '../lib/gaze.js'
import { loadGazeModel } from '../lib/gazeCalib.js'
import { haptic } from '../lib/native.js'
import { unlockAudio } from '../lib/cue.js'
import { sayPhrase, preloadPhrases } from '../lib/voiceCue.js'
import { unlockBreathSfx, releaseBreathSfx } from '../lib/breathSfx.js'
import { testUnlock } from '../lib/subscription.js'
import CalIris from '../components/CalIris.jsx'
import { playSfx, unlockSfx } from '../lib/sfx.js'
import { shareText } from '../lib/share.js'
import {
  LEVELS,
  MODE_LABEL,
  ROUND_MS,
  createFollowDetector,
  offScreen,
  pausedAction,
  loadTrackBest,
  saveTrackBest,
  trackBestFromSessions,
  loadTrackOpts,
  saveTrackOpts,
  summarizeSteps,
  levelScore,
  makeTrackRecord,
  levelAdvice,
  weekArriveMs,
  glideUnlocked,
  trackPct,
  layoutGraph,
} from '../lib/track.js'
import { createLensEngine, safeId } from '../lib/cemberDraw.js'
import { LensPreview, LensJumpArt, ResultIris, StepStrip } from '../components/CemberArt.jsx'
import { IrisMark } from '../components/ui.jsx'
import '../styles/gazecal.css'
import '../styles/track.css'
import SoundToggle from '../components/SoundToggle.jsx'
import StepCards from '../components/StepCards.jsx'
import { FaceLightArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { requestEyeRound, beginRest, eyeStatus } from '../lib/eyeBudgetStore.js'

// Çemberler — göz pratiği (lib/track.js, sahne lib/cemberDraw.js; onaylı taslak "EyeTrail Çemberler").
// Gece göğünde mercek düğümleri; diyafram halkası kenarlar boyunca sıçrar (Sıçra) ya da süzülür (Süzül).
// TrueDepth varsa: her hareketten sonra gözün hedef yönüne geçip geçmediği ölçülür (Katman A, yön
// dedektörü). Doğru yöne geçişte halka altına döner ve bir söz çıkar; kaçışta sakin camgöbeği halka,
// söz ve olumsuz yazı yok. Ekrana bakmıyorsa (yüz yok ya da bakış ekranın dışında) oyun durur.
// Kamera yoksa ritim modu: her geçişte camgöbeği parıltı ve söz; ölçüm ve skor yok.
// Görmeyi ölçmez; skoru görme trendine katılmaz.
//
// VARSAYIM: süreler ilk sürüm içindir.
const AWAY_MS = 1500 // bu kadar ekran dışı/yüz yok → duraklat ve uyar (kırpma ve kısa kayma sayılmaz)
const RESUME_MS = 400 // ekrana bu kadar dönünce devam
const WARN_GAP_MS = 7000 // sesli uyarılar arası en az süre (cümle ~3 sn; üst üste binmesin)
// Duraklamada ortada göz bebeği hedefi: kişi ona bakarken okuyucu yeniden ortalanır. Hedef gösterildiği için
// büyük kayma da gerçektir (baş/telefon kaymış). Sınır, duraklatan eşikten (OFF_SIDE/OFF_UP = aralığın 1,3 katı,
// OFF_DOWN 1,5 katı) BÜYÜK olmalı: yoksa yanlış duraklamaya yol açan kayma hiç kabul edilmez; 2 ile 1,5–2 kat arası
// gerçek bakıp kaçmalar ayrıca telefon penceresi ve odak uzaklığıyla elenir (gaze.js recoverySampleOk).
// Kabul: 0,8 sn'lik pencerede ortanca yayılım ≤ aralığın 0,15'i (gaze.js RECENTER_STABLE_FRAC).
const RECOVER_MAX_FRAC = 2
const DIAG_MS = 100 // tanı satırı en çok 10 Hz çizilir
const STUCK_MS = 8000 // duraklama bu kadar sürerse "Ölçmeden devam et" çıkar: kişi asla takılı kalmaz
const COUNT_MS = 800 // geri sayım adımı
const RESUME_STEP_MS = 350 // duraklamadan dönüşte sonraki hareket
const FOOT = 'Kamera gözünün doğru yöne geçip geçmediğine bakar. Yaklaşık bir değerdir, görme ölçüsü değildir.'
const ACC = { 1: "1'i", 2: "2'yi", 3: "3'ü" }
const DAT = { 1: "1'e", 2: "2'ye", 3: "3'e" }
const isTrack = (s) => s?.type === 'game' && s?.game === 'track'
// Mockup ölçüleri 330 birim genişlikte bir telefona göre (390 pt ekranda 1 birim ≈ 1,18 pt)
const scaleFor = (b) => Math.max(0.6, Math.min(b.w / 330, b.h / 700))
const median = (a) => {
  const s = a.filter(Number.isFinite).sort((x, y) => x - y)
  const n = s.length
  return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null
}

export default function TrackGame({ trueDepth = false, sessions = [], onExit, onFinish, onRest }) {
  const [phase, setPhase] = useState('intro') // intro | countdown | play | paused | result
  const [howto, setHowto] = useState(() => !howtoSeen('track'))
  const [opts, setOptsState] = useState(() => loadTrackOpts())
  const [best, setBest] = useState(() => Math.max(loadTrackBest(), trackBestFromSessions(sessions)))
  const [count, setCount] = useState(3)
  const [roundId, setRoundId] = useState(0)
  const [result, setResult] = useState(null)
  const [note, setNote] = useState('')
  const [rec, setRec] = useState({ progress: 0, stuck: false, diag: '' }) // duraklamada ortalama ilerlemesi
  const recRef = useRef(rec)
  const [camOff, setCamOff] = useState(false) // "Ölçmeden devam et": bu turda kamera kapalı (yeni turda açılır)
  const showDiag = testUnlock()
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const det = useRef(null)
  const reader = useRef(null)
  const eng = useRef(null)
  const lastStep = useRef(null) // { step, rec } — motorun açık adımı ve dedektör denemesi
  const round = useRef({ level: 1, mode: 'jump', rhythm: true })
  const away = useRef({ since: null, back: null, lastWarn: -Infinity })
  const playMs = useRef({ total: 0, since: null })
  const camOk = useRef(false) // bu turda kameradan en az bir yüz karesi geldi
  const bestRef = useRef(best)
  bestRef.current = best
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  const svgRef = useRef(null)
  const hintRef = useRef(null)
  const ringRef = useRef(null)
  const timeRef = useRef(null)
  const uid = useRef(safeId(`st${Math.random().toString(36).slice(2, 8)}`)).current

  // Model x eksenini baş açısından alıyorsa (gazeCalib.js AXIS_FEATURES) "başını sabit tut" denmez
  const headX = trueDepth && loadGazeModel()?.x?.feature === 'headX'
  const glideOpen = glideUnlocked(sessions)
  const level = LEVELS[opts.level] ? opts.level : 1
  const mode = opts.mode === 'glide' && glideOpen && LEVELS[level].modes.includes('glide') ? 'glide' : 'jump'

  const setOpts = (patch) => {
    const next = { ...opts, ...patch }
    setOptsState(next)
    saveTrackOpts(patch)
  }

  const go = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  const clock = () => performance.now()
  function runClock(on) {
    const c = playMs.current
    if (on && c.since == null) c.since = clock()
    if (!on && c.since != null) {
      c.total += clock() - c.since
      c.since = null
    }
  }

  function onFrame(m) {
    const p = phaseRef.current
    if (p !== 'countdown' && p !== 'play' && p !== 'paused') return
    // "Ölçmeden devam et"ten sonra kamera açık kalsa da tur ölçümsüz: kare ne sayılır ne duraklatır
    if (round.current.rhythm) return
    const g = reader.current.push(m)
    if (m.face) camOk.current = true
    if (p === 'play' && det.current) {
      const v = g.tracked && !g.closed && g.dir != null ? g.v : null
      const r = det.current.push(v, m.ts)
      const ls = lastStep.current
      if (ls && r === 'followed') eng.current?.resolve('hit', ls.rec.rt)
      else if (ls && r === 'done') eng.current?.resolve(ls.rec.followed === false ? 'miss' : 'u')
    }
    // Ekrana bakmıyor mu? (yüz yok = bakmıyor; bilinmiyorsa — kırpma — durum değişmez)
    const off = !m.face ? true : offScreen(g)
    const a = away.current
    if (off === true) {
      a.since ??= m.ts
      a.back = null
    } else if (off === false) {
      a.since = null
      a.back ??= m.ts
    }
    if (p === 'play' && a.since != null && m.ts - a.since >= AWAY_MS) pause(m.ts, m.face)
    else if (p === 'paused' && !round.current.rhythm) {
      // Ortadaki hedefe bakarken yeniden ortalanır (kabul = halka doldu → devam); reddedilince yeniden başlar
      const rc = reader.current.recentering
      const act = pausedAction({ rc, face: m.face, off, backMs: a.back == null ? null : m.ts - a.back, resumeMs: RESUME_MS })
      if (act === 'resume') return resume()
      if (act === 'restart') reader.current.recenter({ maxFrac: RECOVER_MAX_FRAC })
      if (a.since != null && m.ts - a.lastWarn >= WARN_GAP_MS) warn(m.ts, m.face)
      showRec(rc, g, off, m.ts)
    }
  }

  // Duraklama ekranındaki halka ve (test derlemesinde) tanı satırı; kare başına değil, değişince çizilir
  function showRec(rc, g, off, ts) {
    const progress = rc?.active ? Math.round(rc.progress * 20) / 20 : 0
    const cur = recRef.current
    let diag = cur.diag
    if (showDiag && !(ts - (cur.diagTs ?? -Infinity) < DIAG_MS)) {
      const sh = reader.current?.shift
      const f = (n) => (Number.isFinite(n) ? n.toFixed(1) : '–')
      diag = `bakış ${f(g?.v?.x)} / ${f(g?.v?.y)} · dışarı: ${off == null ? '?' : off ? 'evet' : 'hayır'} · kapalı: ${g?.closed ? 'evet' : 'hayır'}\nortalama ${rc?.active ? `%${Math.round(rc.progress * 100)}` : rc?.result ?? '–'}${rc?.why ? ` (red: ${rc.why === 'far' ? 'odak uzak' : 'telefon dışı'})` : ''} · kayma ${sh ? `${f(sh.x)} / ${f(sh.y)}` : '–'}`
    }
    if (cur.progress === progress && cur.diag === diag) return
    recRef.current = { ...cur, progress, diag, diagTs: diag !== cur.diag ? ts : cur.diagTs }
    setRec(recRef.current)
  }

  // "Ölçmeden devam et"ten sonra bu turda kamera kapanır. Ayrı bayrak: kamera hatasıyla ritme dönen tur kamerayı
  // kapatmaz (hata ancak kare gelince temizlenir; kapatsaydık sonraki turlar hep ölçümsüz kalırdı).
  const cam = useFaceTracking({ enabled: trueDepth && !camOff && (phase === 'countdown' || phase === 'play' || phase === 'paused'), trueDepth: true, onFrame })
  const measuring = trueDepth && !cam.error

  // Kamera açılamadıysa tur ritim moduna döner (ölçüm yok)
  useEffect(() => {
    if (cam.error && !round.current.rhythm) {
      round.current.rhythm = true
      eng.current?.setGaze('none')
    }
  }, [cam.error])

  // Uyarı: titreşim + (yüz görünüyorsa) ElevenLabs "Ortadaki göz bebeğinin içindeki noktaya bak." (ses kapalıysa
  // yalnız titreşim). Yüz görünmüyorsa yalnız titreşim; ekranda "Telefonu yüzüne dönük tut" yazar.
  function warn(ts, face = true) {
    away.current.lastWarn = ts
    haptic('warning')
    if (face) sayPhrase('calCenter')
  }

  function start() {
    // Göz bütçesi dolduysa yeni tur başlamaz; App mola ekranını açar (lib/eyeBudgetStore.js)
    if (!requestEyeRound()) return
    unlockAudio()
    unlockSfx()
    unlockBreathSfx() // sesli yönlendirme (ElevenLabs) sessiz tuşunda da duyulsun: ses oturumu 'playback'
    setCamOff(false)
    reader.current = createGazeReader()
    det.current = createFollowDetector()
    lastStep.current = null
    round.current = { level, mode, rhythm: !measuring }
    away.current = { since: null, back: null, lastWarn: -Infinity }
    playMs.current = { total: 0, since: null }
    camOk.current = false
    setResult(null)
    setNote('')
    setCount(3)
    setRoundId((n) => n + 1)
    go('countdown')
    playSfx('count')
  }

  // Seslendirmeyi ekran açılınca çöz (tur başında kamera açılırken değil); ekrandan çıkınca ses oturumu bırakılır
  useEffect(() => {
    preloadPhrases()
    return () => releaseBreathSfx(0)
  }, [])

  // Duraklama STUCK_MS sürerse ölçümsüz devam seçeneği (bakış okunamıyor: kaymış model, kapalı sayılan göz…)
  useEffect(() => {
    if (phase !== 'paused' || round.current.rhythm) return undefined
    const t = setTimeout(() => {
      recRef.current = { ...recRef.current, stuck: true }
      setRec(recRef.current)
    }, STUCK_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Sahne motoru: her tur için yeni (sahne countdown/play/paused boyunca aynı SVG'de kalır)
  useEffect(() => {
    const svg = svgRef.current
    if (!roundId || !svg) return undefined
    const measure = () => {
      const r = svg.getBoundingClientRect()
      return { w: Math.max(240, Math.round(r.width) || window.innerWidth), h: Math.max(400, Math.round(r.height) || window.innerHeight) }
    }
    const box = measure()
    let lastLabel = ''
    let lastDeg = ''
    const R = round.current
    const reduced = (() => {
      try {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      } catch {
        return false
      }
    })()
    const e = createLensEngine(svg, {
      uid,
      box,
      scale: scaleFor(box),
      scaleFor,
      reduced,
      level: R.level,
      mode: R.mode,
      gaze: R.rhythm ? 'none' : 'camera',
      round: ROUND_MS,
      water: true,
      seed: 17,
      starCount: 12,
      hintEl: hintRef.current,
      onTime(rem) {
        const sec = Math.ceil(rem / 1000)
        const lab = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
        const deg = `${Math.round((rem / ROUND_MS) * 360)}deg`
        if (lab !== lastLabel && timeRef.current) {
          lastLabel = lab
          timeRef.current.textContent = lab
        }
        if (deg !== lastDeg && ringRef.current) {
          lastDeg = deg
          ringRef.current.style.setProperty('--p', deg)
        }
      },
      onStep(info) {
        const d = det.current
        if (!d) return
        const prev = lastStep.current
        const rec = d.jumpTo(info.fromPt, info.toPt, clock(), { windowMs: info.windowMs })
        // Önceki adım pencere dolmadan yeni hareket geldiyse dedektörün kararı kayda geçer
        if (prev && prev.step.res == null) eng.current?.settle(prev.step, prev.rec.followed === false ? 'miss' : 'u')
        lastStep.current = { step: info.step, rec }
      },
      onFx(type) {
        const rhythm = round.current.rhythm
        // VARSAYIM: kamera varken hareket anında titreşim/ses yok (zamanlama ipucu verip ölçümü karıştırır);
        // yalnızca varışta hafif tık. Kamera yoksa her harekette tık + ses (eski ritim).
        if (type === 'move' && rhythm) {
          haptic('tick')
          playSfx('turn')
        } else if (type === 'arrive') {
          haptic('tick')
          playSfx('eat') // VARSAYIM: varış sesi mevcut 'eat' (sfx.js); yeni ses yok
        }
      },
      onDone: () => finish(),
    })
    eng.current = e
    const onResize = () => e.resize(measure())
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      e.destroy()
      if (eng.current === e) eng.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId])

  // Geri sayım: mercekler sırayla belirir, rakam elipsin merkezinde
  useEffect(() => {
    if (phase !== 'countdown') return undefined
    const n = layoutGraph(round.current.level).pts.length
    eng.current?.reveal(Math.ceil((n * (4 - count)) / 3))
    const t = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1)
        playSfx('count')
      } else {
        playSfx('start')
        go('play')
        runClock(true)
        eng.current?.play()
      }
    }, COUNT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, count, roundId])

  // quiet: uygulama arka plana geçerken duraklama (ses ve titreşim yok; dönünce ekranda hedef)
  function pause(ts, face = true, quiet = false) {
    if (phaseRef.current !== 'play') return
    runClock(false)
    eng.current?.pause()
    det.current?.cancel()
    go('paused')
    away.current.back = null
    recRef.current = { progress: 0, stuck: false, diag: '' }
    setRec(recRef.current)
    if (!round.current.rhythm) {
      reader.current?.recenter({ maxFrac: RECOVER_MAX_FRAC })
      if (quiet) away.current.lastWarn = ts
      else warn(ts, face)
    } else if (!quiet) playSfx('pause')
  }

  // Takılı kalmasın: bakış hâlâ okunamıyorsa tur ölçümsüz (ritim) sürer; puan çıkmaz, hareketler devam eder
  function continueUnmeasured() {
    round.current.rhythm = true
    setCamOff(true)
    eng.current?.setGaze('none')
    resume()
  }

  function resume() {
    reader.current?.stopRecenter?.() // kurtarma oyuna taşmasın (bir düğüme sabit bakış merkez sanılır)
    away.current = { since: null, back: null, lastWarn: away.current.lastWarn }
    playSfx('resume')
    go('play')
    runClock(true)
    // Duraklamadan dönüşte önceki deneme sayılmaz: yeni hareket, taban yeni bakıştan
    eng.current?.play({ resumeDelay: RESUME_STEP_MS })
  }

  function finish() {
    const e = eng.current
    if (!e) return
    runClock(false)
    releaseBreathSfx()
    det.current?.finish()
    const ls = lastStep.current
    if (ls && ls.step.res == null) e.settle(ls.step, ls.rec.followed === false ? 'miss' : 'u')
    const R = round.current
    const steps = e.steps.map((s) => ({ t: s.t, kind: s.kind, res: s.res ?? (R.rhythm ? 'none' : 'u'), ms: s.ms }))
    const sum = summarizeSteps(steps)
    const measured = !R.rhythm && camOk.current && sum.measured > 0
    const score = measured ? levelScore(sum, R.level) : null
    const prevBest = bestRef.current
    const newBest = score != null ? Math.max(prevBest, saveTrackBest(score)) : prevBest
    setBest(newBest)
    const seconds = Math.round(playMs.current.total / 1000)
    const record = makeTrackRecord({ level: R.level, mode: R.mode, sum, measured, seconds, score, best: newBest })
    const before = sessionsRef.current
    const all = [...before, { ...record, date: new Date().toISOString() }]
    const prior = before.filter((s) => isTrack(s) && s.v === 2 && Number.isFinite(s.pct)).slice(-5).map(trackPct)
    const res = {
      sum,
      measured,
      score,
      steps,
      level: R.level,
      mode: R.mode,
      cameraRound: !R.rhythm || trueDepth,
      edges: e.edgeStates,
      visited: e.visited,
      words: e.words,
      record: score != null && score > prevBest && score > 0,
      advice: measured ? levelAdvice(all, R.level) : null,
      week: measured && R.mode === 'jump' ? weekArriveMs(all) : null,
      priorPct: median(prior),
      trials: det.current?.trials ?? [],
    }
    setResult(res)
    go('result')
    e.destroy()
    eng.current = null
    if (res.record) playSfx('record')
    haptic('success')
    try {
      onFinish?.(record)
    } catch {
      // kayıt hatası oyunu durdurmasın
    }
  }

  function exit() {
    eng.current?.destroy()
    eng.current = null
    onExit?.()
  }

  // "Başım dönüyor": dinlenme molası (eyeBudget 'symptom', 15 dk) ve çıkış; App mola ekranını açar
  function symptom() {
    eng.current?.destroy()
    eng.current = null
    runClock(false)
    beginRest('symptom')
    if (onRest) onRest()
    else onExit?.()
  }

  // Uygulama arka plana giderse duraklat
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible' && phaseRef.current === 'play') pause(clock(), true, true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function share() {
    const r = result
    const payload = JSON.stringify({
      app: 'Nefona',
      kind: 'track-debug',
      v: 2,
      build: import.meta.env.VITE_APP_BUILD ?? 'web',
      level: r?.level,
      mode: r?.mode,
      summary: r?.sum,
      steps: r?.steps,
      trials: r?.trials,
    })
    const s = await shareText('Nefona Çemberler verisi', payload)
    setNote(s === 'shared' ? 'Paylaşıldı.' : s === 'copied' ? 'Panoya kopyalandı.' : 'Kopyalanamadı.')
  }

  const hintText = headX ? 'Merceğe bak' : 'Sadece gözünü oynat'

  // --- Yönerge kartları (Ç2) ---
  if (phase === 'intro' && howto) {
    const cards = [
      { key: 'face', art: <FaceLightArt />, title: 'Telefonu yüzünün karşısında tut', why: trueDepth ? 'Yüzün iyi aydınlansın; kamera gözünü izler.' : 'Bu cihazda kamera takibi yok; ritimle izle.' },
      { key: 'lens', art: <LensJumpArt />, title: 'Parlayan merceğe gözünle geç', why: trueDepth ? 'Varınca altın parlar, bir söz çıkar.' : 'Her geçişte bir söz çıkar.' },
    ]
    return (
      <main className="screen fade-in">
        <StepCards
          cards={cards}
          eyebrow="Çemberler · nasıl yapılır"
          finishLabel="Başla"
          onFinish={() => {
            setHowto(false)
            start()
          }}
          onDismiss={() => {
            markHowtoSeen('track')
            setHowto(false)
          }}
          onClose={onExit}
        />
      </main>
    )
  }

  // --- Giriş (Ç1) ---
  if (phase === 'intro') {
    const jev = !trueDepth
      ? 'Merceği ritimle izle; bu cihazda ölçüm yok, sadece pratik.'
      : headX
        ? 'Merceği gözünle izle; başın biraz dönebilir, sorun değil.'
        : 'Başını sabit tut, sadece gözünü oynat; merceğe varınca bir söz yazarım.'
    const glideNote = !glideOpen ? 'bir turdan sonra' : level === 1 ? "Seviye 2'de" : null
    return (
      <main className="screen cm-intro fade-in">
        <div className="row between">
          <button type="button" className="btn-icon" onClick={exit} aria-label="Kapat"><X size={20} /></button>
          <span className="eyebrow">Göz pratiği · 1 dk</span>
          <SoundToggle />
        </div>
        <LensPreview />
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="cm-title">Çemberler</h1>
          <p className="muted">Parlayan merceği gözünle izle.</p>
        </div>
        <div className="cm-jev">
          <IrisMark size={40} />
          <p className="cm-bubble">{jev}</p>
        </div>
        <div className="cm-opts">
          <div className="segmented cm-seg" role="group" aria-label="Mod">
            <button type="button" aria-pressed={mode === 'jump'} onClick={() => setOpts({ mode: 'jump' })}>Sıçra</button>
            <button type="button" aria-pressed={mode === 'glide'} disabled={Boolean(glideNote)} onClick={() => setOpts({ mode: 'glide' })}>
              {glideNote ? <>Süzül <small>· {glideNote}</small></> : 'Süzül'}
            </button>
          </div>
          <div className="segmented cm-seg" role="group" aria-label="Seviye">
            {Object.values(LEVELS).map((L) => (
              <button key={L.id} type="button" aria-pressed={level === L.id} onClick={() => setOpts({ level: L.id, ...(L.modes.includes(mode) ? {} : { mode: 'jump' }) })}>
                <b>{L.id}</b> <small>· {L.label}</small>
              </button>
            ))}
          </div>
        </div>
        <span className={`cm-live${trueDepth ? ' on' : ''}`}>
          {trueDepth ? 'Kamera, gözünün merceğe doğru geçip geçmediğine bakar.' : 'Bu cihazda kamera takibi yok; ritimle izle.'}
        </span>
        <p className="note"><InfoIcon size={16} aria-hidden="true" /> Oyun ve pratik. Görmeyi ölçmez, iyileştirdiği iddia edilmez.</p>
        <button type="button" className="btn" onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
        <button type="button" className="link-btn cm-center" onClick={() => setHowto(true)}>Nasıl yapılır?</button>
      </main>
    )
  }

  // --- Sonuç (Ç9 kamera var, Ç10 ritim) ---
  if (phase === 'result' && result) {
    const r = result
    const s = r.sum
    const st = eyeStatus()
    const budgetLine = st.locked || st.due
      ? 'Göz bütçen doldu; sırada kısa bir mola var.'
      : st.leftMs >= 60000
        ? `Göz bütçende yaklaşık ${Math.floor(st.leftMs / 60000)} dk var.`
        : 'Göz bütçende bir dakikadan az kaldı.'
    let jev
    if (!r.measured) {
      jev = r.cameraRound && trueDepth ? 'Kamera gözünü göremedi; bu tur ölçülmedi. Ritmi yine de izledin.' : 'Ritmi izledin. Bu cihazda ölçüm yok; skor tutmuyorum.'
    } else if (!s.arrived) {
      jev = `Bu turda varış sayılmadı. ${headX ? 'Merceği gözünle izle.' : 'Başını sabit tut, sadece gözünü oynat.'}`
    } else {
      const cmp = r.priorPct == null
        ? 'İlk ölçülen turun; çizgin buradan başlar.'
        : s.pct - r.priorPct > 10
          ? 'Son turlarından yüksek.'
          : r.priorPct - s.pct > 10
            ? 'Bugün biraz zorlandın; olur.'
            : 'Son turlarına yakın.'
      jev = `${s.arrived} varış, en uzun serin ${s.streak}. ${cmp}`
    }
    const words = [...new Set(r.words)]
    const shown = words.slice(0, 6)
    return (
      <main className="screen cm-result fade-in">
        <div className="row between">
          <button type="button" className="btn-icon" onClick={exit} aria-label="Kapat"><X size={20} /></button>
          <span className="muted small">Çemberler · Seviye {r.level} · {MODE_LABEL[r.mode]}</span>
          <span style={{ width: 40 }} aria-hidden="true" />
        </div>
        {r.record && <span className="badge cm-record"><Trophy size={12} aria-hidden="true" /> Yeni rekor</span>}
        <ResultIris pct={r.measured ? s.pct : null} level={r.level} edges={r.edges} visited={r.visited} rhythm={!r.measured} />
        {r.measured ? (
          <div className="cm-pct"><strong>%{s.pct}</strong><span>isabet · {r.score} puan</span></div>
        ) : (
          <div className="cm-pct"><strong>1 dk</strong><span>{s.steps} geçiş izledin</span></div>
        )}
        {r.measured && (
          <div className="cm-kpi">
            {r.mode === 'glide' ? (
              <div><b>Süzülme</b><span>süre yok</span></div>
            ) : (
              <div><b>{s.arriveMs != null ? `${s.arriveMs} ms` : '—'}</b><span>ortanca varış</span></div>
            )}
            <div><b>{s.streak}</b><span>en uzun seri</span></div>
            <div><b>{s.measured}/{s.steps}</b><span>ölçülen geçiş</span></div>
          </div>
        )}
        <StepStrip steps={r.steps} median={r.measured && r.mode === 'jump' ? s.arriveMs : null} rhythm={!r.measured} />
        {r.week != null && <p className="muted small cm-center">Son 7 gün ortancan {r.week} ms.</p>}
        <div className="cm-jev">
          <IrisMark size={32} />
          <p className="cm-bubble">{jev}</p>
        </div>
        {r.advice && (
          <div className="cm-advice">
            <span>{r.advice.up ? `İki turdur %80'in üstündesin. Seviye ${ACC[r.advice.to]} dene?` : `Seviye ${DAT[r.advice.to]} dönmek ister misin?`}</span>
            <button type="button" className="btn btn-sm btn-secondary" aria-pressed={level === r.advice.to} onClick={() => setOpts({ level: r.advice.to, ...(LEVELS[r.advice.to].modes.includes(mode) ? {} : { mode: 'jump' }) })}>
              {level === r.advice.to ? 'Seçildi' : `Seviye ${r.advice.to}`}
            </button>
          </div>
        )}
        {!r.measured && words.length > 0 && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="cm-wlbl">Bu turda geçen sözler</span>
            <div className="cm-wchips">
              {shown.map((w) => <span key={w}>{w}</span>)}
              {words.length > shown.length && <span className="more">+{words.length - shown.length} söz</span>}
            </div>
          </div>
        )}
        <div className="cm-again">
          <button type="button" className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Bir tur daha</button>
          <span className="muted small">{budgetLine}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={exit}>Bitir</button>
        <div className="cm-links">
          {r.measured && (
            <button type="button" className="link-btn subtle" onClick={share}>
              {navigator.share ? <Share2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} Verileri paylaş
            </button>
          )}
          <button type="button" className="link-btn subtle" onClick={symptom}>Başım döndü</button>
        </div>
        {note && <p className="muted small cm-center" role="status">{note}</p>}
        {r.measured && <p className="cm-foot">{FOOT}</p>}
      </main>
    )
  }

  // --- Oyun alanı (Ç3–Ç8): her temada gece ---
  const rhythm = round.current.rhythm
  return (
    <div className="cm-stage" role="application" aria-label="Çemberler">
      <svg ref={svgRef} className="cm-scene" aria-hidden="true" />
      <div className="cm-top">
        <button type="button" className="btn-icon cm-x" onClick={exit} aria-label="Çık"><X size={20} /></button>
        <span className="cm-timer" aria-hidden="true"><i ref={ringRef} className="cm-tring" /><b ref={timeRef}>1:00</b></span>
      </div>
      {phase === 'countdown' && (
        <div className="cm-count" role="status">
          <span className="cm-count-num" key={count}>{count}</span>
          <span className="cm-count-sub">{headX ? 'Ortaya bak' : 'Ortaya bak, başını sabit tut'}</span>
        </div>
      )}
      <div ref={hintRef} className="cm-hint" hidden>
        <IrisMark size={22} />
        {hintText}
      </div>
      {phase === 'paused' && rhythm && (
        <div className="cm-veil" role="alert">
          <div className="cm-pcard">
            <span className="cm-warnic calm"><Pause size={26} aria-hidden="true" /></span>
            <h2>Durdu</h2>
            <p>Hazır olunca devam et.</p>
            <button type="button" className="btn" onClick={resume}><Play size={18} aria-hidden="true" /> Devam</button>
            <button type="button" className="cm-pbtn-line" onClick={symptom}>Başım dönüyor, bırak</button>
          </div>
        </div>
      )}
      {phase === 'paused' && !rhythm && (
        // Ortada göz bebeği (kalibrasyonun orta noktasıyla aynı yer: %50, %46): bakınca halka dolar, okuyucu
        // yeniden ortalanır ve tur kaldığı yerden sürer. Yüz görünmüyorsa soluk iris ve yönlendirme.
        <div className="cm-veil cm-rec" role="alert">
          <div className="cm-rec-target"><CalIris dark progress={cam.face ? rec.progress : 0} state={cam.face ? '' : 'off'} /></div>
          <div className="cm-rec-text">
            <h2>{cam.face ? 'Ortadaki göz bebeğine bak' : 'Yüzün görünmüyor'}</h2>
            <p>{cam.face ? 'Bakınca kaldığın yerden devam ederiz.' : 'Telefonu yüzüne dönük tut.'}</p>
            {rec.stuck && <button type="button" className="btn" onClick={continueUnmeasured}><Play size={18} aria-hidden="true" /> Ölçmeden devam et</button>}
            <button type="button" className="cm-pbtn-line" onClick={symptom}>Başım dönüyor, bırak</button>
          </div>
          {rec.diag && <pre className="cm-diag" aria-hidden="true">{rec.diag}</pre>}
        </div>
      )}
      {!rhythm && phase === 'play' && !cam.ready && <p className="cm-camnote">Kamera açılıyor…</p>}
    </div>
  )
}
