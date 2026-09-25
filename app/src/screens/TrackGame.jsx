import { useEffect, useRef, useState } from 'react'
import { X, Trophy, ScanFace, Pause, Play, RotateCcw, Share2, Copy, Info as InfoIcon } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader } from '../lib/gaze.js'
import { loadGazeModel } from '../lib/gazeCalib.js'
import { haptic } from '../lib/native.js'
import { cue, unlockAudio } from '../lib/cue.js'
import { playSfx, unlockSfx } from '../lib/sfx.js'
import { shareText } from '../lib/share.js'
import {
  LEVELS,
  MODE_LABEL,
  ROUND_MS,
  createFollowDetector,
  offScreen,
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
const WARN_GAP_MS = 4000 // uyarılar arası en az süre
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
    if (p === 'play' && a.since != null && m.ts - a.since >= AWAY_MS) pause(m.ts)
    else if (p === 'paused') {
      if (a.since != null && m.ts - a.lastWarn >= WARN_GAP_MS) warn(m.ts)
      if (off === false && a.back != null && m.ts - a.back >= RESUME_MS) resume()
    }
  }

  const cam = useFaceTracking({ enabled: trueDepth && (phase === 'countdown' || phase === 'play' || phase === 'paused'), trueDepth: true, onFrame })
  const measuring = trueDepth && !cam.error

  // Kamera açılamadıysa tur ritim moduna döner (ölçüm yok)
  useEffect(() => {
    if (cam.error && !round.current.rhythm) {
      round.current.rhythm = true
      eng.current?.setGaze('none')
    }
  }, [cam.error])

  function warn(ts) {
    away.current.lastWarn = ts
    cue('Ekrana bak', true) // uyarı titreşimi + ses (ses kapalıysa yalnızca titreşim)
  }

  function start() {
    // Göz bütçesi dolduysa yeni tur başlamaz; App mola ekranını açar (lib/eyeBudgetStore.js)
    if (!requestEyeRound()) return
    unlockAudio()
    unlockSfx()
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

  function pause(ts) {
    if (phaseRef.current !== 'play') return
    runClock(false)
    eng.current?.pause()
    det.current?.cancel()
    go('paused')
    away.current.back = null
    if (!round.current.rhythm) warn(ts)
    else playSfx('pause')
  }

  function resume() {
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
      if (document.visibilityState !== 'visible' && phaseRef.current === 'play') pause(clock())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function share() {
    const r = result
    const payload = JSON.stringify({
      app: 'EyeTrail',
      kind: 'track-debug',
      v: 2,
      build: import.meta.env.VITE_APP_BUILD ?? 'web',
      level: r?.level,
      mode: r?.mode,
      summary: r?.sum,
      steps: r?.steps,
      trials: r?.trials,
    })
    const s = await shareText('EyeTrail Çemberler verisi', payload)
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
      {phase === 'paused' && (
        <div className="cm-veil" role="alert">
          <div className="cm-pcard">
            <span className={`cm-warnic${rhythm ? ' calm' : ''}`}>{rhythm ? <Pause size={26} aria-hidden="true" /> : <ScanFace size={26} aria-hidden="true" />}</span>
            <h2>{rhythm ? 'Durdu' : 'Ekrana bak'}</h2>
            <p>{rhythm ? 'Hazır olunca devam et.' : cam.face ? 'Bakışın ekranın dışında. Ekrana dönünce devam edeceğim.' : 'Yüzün görünmüyor. Telefonu yüzüne dönük tut.'}</p>
            {rhythm && <button type="button" className="btn" onClick={resume}><Play size={18} aria-hidden="true" /> Devam</button>}
            <button type="button" className="cm-pbtn-line" onClick={symptom}>Başım dönüyor, bırak</button>
          </div>
        </div>
      )}
      {!rhythm && phase === 'play' && !cam.ready && <p className="cm-camnote">Kamera açılıyor…</p>}
    </div>
  )
}
