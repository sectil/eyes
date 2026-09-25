import { useEffect, useRef, useState } from 'react'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Crown,
  Eye,
  EyeOff,
  Hand,
  Info,
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScanFace,
  Crosshair,
  Zap,
  BrickWall,
  Infinity as InfinityIcon,
  SlidersHorizontal,
} from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader, GAZE_FULL_DEG } from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { formatDuration } from '../lib/stats.js'
import {
  createGame,
  step,
  turn,
  headingOf,
  stepMs,
  levelOf,
  wrapDelta,
  createDwell,
  createSteadyLook,
  loadBest,
  saveBest,
  loadSnakeOpts,
  saveSnakeOpts,
  DIRS,
  STEADY_HOLD_MS,
} from '../lib/snake.js'
import { playSfx, unlockSfx } from '../lib/sfx.js'
import '../styles/snake.css'
import GazeTutorial from '../components/GazeTutorial.jsx'
import { requestEyeRound } from '../lib/eyeBudgetStore.js'

// Yılan — gözle (TrueDepth bakış yönü) ya da dokunarak oynanan Nokia klasiği.
// Oyun motoru saf: src/lib/snake.js. Bu ekran yalnızca girdi, çizim, ses/titreşim ve akışı yönetir.
// Etiket: eğlence ve bakış kontrolü pratiği; görmeyi iyileştirdiği iddia edilmez.

const COLS = 15
const ROWS = 15
const GAME_PHASES = new Set(['countdown', 'playing', 'paused', 'crashed', 'over'])
const CAMERA_PHASES = new Set(['practice', 'countdown', 'playing', 'paused'])
// "Şimdi sen dene": ilk gözle oyundan önce dört yöne birer kez bakma pratiği (atlanabilir)
const PRACTICE_DIRS = ['right', 'up', 'left', 'down']
const PRACTICE_TEXT = { right: 'Sağa bak', up: 'Yukarı bak', left: 'Sola bak', down: 'Aşağı bak' }
const PRACTICE_HINT = { right: 'tahtanın sağ kenarının dışına', up: 'tahtanın üstünden dışarı', left: 'tahtanın sol kenarının dışına', down: 'tahtanın altından dışarı' }
const AUTO_PAUSE = new Set(['face', 'eyes', 'calib'])

// VARSAYIM: aşağıdaki eşik ve süreler ilk sürüm içindir; gerçek cihazda ayarlanacak.
// Bakış eşikleri oyunda Routine'dekinden (8°/5°) yüksek: tahtanın içinde gezinen bakış
// (telefon ~30 cm'de tahta kenarı ≈ ±6–7°) dönüş sayılmasın; dönüş için tahtanın dışına bakılır.
const ENTER_DEG = 10
const EXIT_DEG = 6
const FACE_LOST_MS = 600 // yüz bu kadar görünmezse duraklat
const EYES_CLOSED_MS = 1200 // gözler bu kadar kapalıysa duraklat (normal kırpma ~0,1–0,4 sn)
const RESUME_LOOK_MS = STEADY_HOLD_MS // otomatik devam için ekrana bu kadar sabit bakmak
const START_BEAT_MS = 900
const RESUME_BEAT_MS = 550
const CRASH_MS = 1000 // çarpma animasyonu, sonra sonuç
const SWIPE_PX = 18
const UI_MS = 80 // bakış göstergesi güncelleme aralığı
const TAU = Math.PI * 2

const DIR_WORD = { up: 'Yukarı', down: 'Aşağı', left: 'Sola', right: 'Sağa' }
const DIR_ANGLE = { up: 0, right: 90, down: 180, left: 270 }
const KEY_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
}
const EDGE_ICONS = { up: ChevronUp, down: ChevronDown, left: ChevronLeft, right: ChevronRight }
const EMPTY_GAZE = { x: 0, y: 0, tracked: false, closed: false, calibrated: false, cand: null, progress: 0, look: 0 }
const DEFAULT_PREFS = { sound: true, haptics: true }

function safePrefs() {
  try {
    return { ...DEFAULT_PREFS, ...getPrefs() }
  } catch {
    return DEFAULT_PREFS
  }
}

// Bakış okuyucu. Her geri sayımda yenisi kurulur (bkz. beginCountdown); öğrenilen X işareti
// (flipX) taşınır. flipX tanımsızsa okuyucu kayıtlı değeri kendisi okur. Ödünleşim: yalnızca
// blendshape yolunda (native açı yoksa) öğrenilen yön ölçeği sıfırlanır; ilk oyundaki gibi
// gaze.js taban ölçeğiyle başlar ve oyun içinde yeniden öğrenilir.
function newGazeReader(prev) {
  return createGazeReader({ enterDeg: ENTER_DEG, exitDeg: EXIT_DEG, flipX: prev?.flipX })
}

function readColors() {
  const fb = { head: '#0f766e', body: '#0f9d8a', food: '#991b1b', foodGlow: '#fee2e2', leaf: '#047857', grid: '#e3eae9', eye: '#ffffff', pupil: '#0f1a1a', crash: '#991b1b' }
  try {
    const cs = getComputedStyle(document.documentElement)
    const v = (name, f) => cs.getPropertyValue(name).trim() || f
    return {
      head: v('--accent', fb.head),
      body: v('--accent-graphic', fb.body),
      food: v('--danger', fb.food),
      foodGlow: v('--danger-bg', fb.foodGlow),
      leaf: v('--ok', fb.leaf),
      grid: v('--surface-3', fb.grid),
      eye: v('--surface', fb.eye),
      pupil: v('--ink', fb.pupil),
      crash: v('--danger', fb.crash),
    }
  } catch {
    return fb
  }
}

// --- Çizim (canvas) --------------------------------------------------------------------

function dot(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, Math.max(0, r), 0, TAU)
  ctx.fill()
}

const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

// Adımlar arası akıcı kayma: baş önceki hücreden yenisine, kuyruk ucu eski hücreden
// sonrakine t (0..1) oranında ilerler; aradaki gövde hücre merkezlerinden geçer (köşeler keskin kalır).
function bodyPoints(prev, cur, t, g) {
  const lerp = (from, to) => {
    const d = wrapDelta(from, to, g.cols, g.rows)
    return { x: to.x - d.x * (1 - t), y: to.y - d.y * (1 - t) }
  }
  const n = cur.length
  const pts = [lerp(prev[0] ?? cur[0], cur[0])]
  for (let i = 1; i < n; i++) pts.push(cur[i])
  pts.push(lerp(prev[Math.min(n - 1, prev.length - 1)] ?? cur[n - 1], cur[n - 1]))
  return pts
}

// Duvarlardan geç modunda kenarı aşan parçayı iki yandan çizer.
function strokeBody(ctx, pts, cell, g) {
  const X = (p) => (p.x + 0.5) * cell
  const Y = (p) => (p.y + 0.5) * cell
  ctx.beginPath()
  ctx.moveTo(X(pts[0]), Y(pts[0]))
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    if (Math.abs(b.x - a.x) > 1.5 || Math.abs(b.y - a.y) > 1.5) {
      const d = wrapDelta(a, b, g.cols, g.rows)
      ctx.lineTo(X({ x: a.x + d.x }), Y({ y: a.y + d.y }))
      ctx.moveTo(X({ x: b.x - d.x }), Y({ y: b.y - d.y }))
    }
    ctx.lineTo(X(b), Y(b))
  }
  ctx.stroke()
}

function renderScene(ctx, size, now, sc) {
  const { g, prev, t, c, fx, crashAt, foodBorn } = sc
  const cell = size / g.cols
  ctx.clearRect(0, 0, size, size)

  // LCD nokta ızgarası (Nokia ekranı esintisi)
  ctx.fillStyle = c.grid
  ctx.beginPath()
  const gr = Math.max(0.9, cell * 0.06)
  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      const cx = (x + 0.5) * cell
      const cy = (y + 0.5) * cell
      ctx.moveTo(cx + gr, cy)
      ctx.arc(cx, cy, gr, 0, TAU)
    }
  }
  ctx.fill()

  // Yem: doğuşta büyür, sonra hafifçe nabız atar
  if (g.food) {
    const born = Math.min(1, Math.max(0, (now - foodBorn) / 300))
    const k = easeOutBack(born) * (1 + 0.07 * Math.sin(now / 240))
    const cx = (g.food.x + 0.5) * cell
    const cy = (g.food.y + 0.5) * cell
    ctx.fillStyle = c.foodGlow
    dot(ctx, cx, cy, cell * 0.52 * k)
    ctx.fillStyle = c.food
    dot(ctx, cx, cy + cell * 0.03 * k, cell * 0.3 * k)
    ctx.fillStyle = c.leaf
    ctx.beginPath()
    ctx.ellipse(cx + cell * 0.1 * k, cy - cell * 0.27 * k, Math.max(0, cell * 0.12 * k), Math.max(0, cell * 0.055 * k), -0.6, 0, TAU)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    dot(ctx, cx - cell * 0.09 * k, cy - cell * 0.05 * k, cell * 0.065 * k)
  }

  // Yılan
  const pts = bodyPoints(prev, g.snake, t, g)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = c.body
  ctx.lineWidth = cell * 0.72
  strokeBody(ctx, pts, cell, g)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)' // boru parlaklığı
  ctx.lineWidth = cell * 0.2
  strokeBody(ctx, pts, cell, g)

  const h = pts[0]
  const hx = (h.x + 0.5) * cell
  const hy = (h.y + 0.5) * cell
  const crashed = crashAt != null
  ctx.fillStyle = crashed ? c.crash : c.head
  dot(ctx, hx, hy, cell * 0.44)
  const d = DIRS[g.dir]
  const p = { x: -d.y, y: d.x }
  for (const side of [-1, 1]) {
    const ex = hx + (d.x * 0.14 + p.x * 0.2 * side) * cell
    const ey = hy + (d.y * 0.14 + p.y * 0.2 * side) * cell
    ctx.fillStyle = c.eye
    dot(ctx, ex, ey, cell * 0.11)
    if (crashed) {
      // çarpınca "x" gözler
      const r = cell * 0.06
      ctx.strokeStyle = c.pupil
      ctx.lineWidth = Math.max(1, cell * 0.035)
      ctx.beginPath()
      ctx.moveTo(ex - r, ey - r)
      ctx.lineTo(ex + r, ey + r)
      ctx.moveTo(ex + r, ey - r)
      ctx.lineTo(ex - r, ey + r)
      ctx.stroke()
    } else {
      ctx.fillStyle = c.pupil
      dot(ctx, ex + d.x * cell * 0.035, ey + d.y * cell * 0.035, cell * 0.055)
    }
  }

  // Yem parlaması + "+puan"
  for (const e of fx) {
    const k = (now - e.t0) / 700
    if (k < 0 || k >= 1) continue
    const cx = (e.x + 0.5) * cell
    const cy = (e.y + 0.5) * cell
    const ring = Math.min(1, k / 0.6)
    ctx.globalAlpha = 1 - ring
    ctx.strokeStyle = c.body
    ctx.lineWidth = Math.max(1.5, cell * 0.08)
    ctx.beginPath()
    ctx.arc(cx, cy, cell * (0.45 + 0.95 * ring), 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1 - k
    ctx.fillStyle = c.head
    ctx.font = `800 ${Math.round(cell * 0.66)}px 'Onest Variable', system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`+${e.pts}`, cx, cy - cell * (0.7 + 0.8 * k))
  }
  ctx.globalAlpha = 1

  // Çarpma flaşı
  if (crashed) {
    const k = (now - crashAt) / 450
    if (k < 1) {
      ctx.globalAlpha = 0.28 * (1 - k)
      ctx.fillStyle = c.crash
      ctx.fillRect(0, 0, size, size)
      ctx.globalAlpha = 1
    }
  }
}

// --- Küçük bileşenler --------------------------------------------------------------------

function SnakeArt() {
  // 10x6 hücrelik mini tahta (hücre 12 birim). Oyundaki renklerle aynı değişkenler.
  return (
    <svg className="snake-art" viewBox="0 0 120 72" aria-hidden="true">
      <defs>
        <pattern id="snake-art-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.1" className="snake-art-dot" />
        </pattern>
      </defs>
      <rect width="120" height="72" rx="14" className="snake-art-bg" />
      <rect width="120" height="72" rx="14" fill="url(#snake-art-dots)" />
      <path d="M18 54 H42 V30 H78 V18 H90" className="snake-art-body" />
      <circle cx="90" cy="18" r="5.6" className="snake-art-head" />
      <circle cx="91.6" cy="16.4" r="1.2" className="snake-art-eye" />
      <circle cx="91.6" cy="19.6" r="1.2" className="snake-art-eye" />
      <g className="snake-art-food">
        <circle cx="102" cy="42" r="4.2" />
      </g>
    </svg>
  )
}

function PrefToggles({ prefs, onToggle }) {
  return (
    <div className="snake-toggles" role="group" aria-label="Ses ve titreşim">
      <button type="button" className="snake-toggle" aria-pressed={prefs.sound} onClick={() => onToggle('sound')}>
        {prefs.sound ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        Ses {prefs.sound ? 'açık' : 'kapalı'}
      </button>
      <button type="button" className="snake-toggle" aria-pressed={prefs.haptics} onClick={() => onToggle('haptics')}>
        {prefs.haptics ? <Vibrate size={16} aria-hidden="true" /> : <VibrateOff size={16} aria-hidden="true" />}
        Titreşim {prefs.haptics ? 'açık' : 'kapalı'}
      </button>
    </div>
  )
}

function DPad({ onDir, heading, disabled }) {
  const keys = [
    ['up', ArrowUp, 'Yukarı'],
    ['left', ArrowLeft, 'Sol'],
    ['down', ArrowDown, 'Aşağı'],
    ['right', ArrowRight, 'Sağ'],
  ]
  return (
    <div className="snake-dpad" role="group" aria-label="Yön tuşları">
      {keys.map(([d, Icon, label]) => (
        <button
          key={d}
          type="button"
          className={`snake-key ${d} ${heading === d ? 'is-dir' : ''}`}
          aria-label={label}
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault()
            onDir(d)
          }}
          onClick={(e) => {
            if (e.detail === 0) onDir(d) // klavye ile basıldı (dokunuş zaten pointerdown'da işlendi)
          }}
        >
          <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

function GazePanel({ ui, angle, camReady }) {
  const unit = (deg) => Math.max(-1, Math.min(1, deg / GAZE_FULL_DEG))
  const ring = (ENTER_DEG / GAZE_FULL_DEG) * 80 // % (nokta en fazla merkezden %40)
  let text = 'Dönmek için o yöne, tahtanın dışına bak'
  let tone = ''
  if (!camReady) text = 'Kamera hazırlanıyor…'
  else if (!ui.tracked) {
    text = 'Yüzün görünmüyor'
    tone = 'warn'
  } else if (ui.closed) {
    text = 'Gözlerin kapalı'
    tone = 'warn'
  } else if (!ui.calibrated) text = 'Ekranın ortasına bak'
  else if (ui.cand && ui.progress < 1) text = `${DIR_WORD[ui.cand]}…`
  else if (ui.cand) {
    text = `${DIR_WORD[ui.cand]} bakıyorsun`
    tone = 'ok'
  }
  // Nokta nötr bakış toplanınca görünür (öncesinde ham açı kenara sıçrayabilir)
  const live = ui.tracked && !ui.closed && ui.calibrated
  return (
    <div className="snake-gaze">
      <div className="snake-pad" aria-hidden="true">
        {['up', 'right', 'down', 'left'].map((d) => (
          <span key={d} className={`snake-pad-edge ${d} ${ui.cand === d ? 'on' : ''}`} style={{ '--p': ui.cand === d ? ui.progress : 0 }} />
        ))}
        <span className="snake-pad-ring" style={{ width: `${ring}%`, height: `${ring}%` }} />
        <span className="snake-pad-arrow" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>
          <ArrowUp size={20} strokeWidth={2.6} />
        </span>
        {live && <span className="snake-pad-dot" style={{ left: `${50 + unit(ui.x) * 40}%`, top: `${50 - unit(ui.y) * 40}%` }} />}
      </div>
      <div className="snake-gaze-text">
        <strong><ScanFace size={15} aria-hidden="true" /> Bakışla kontrol</strong>
        <span className={`snake-gaze-status ${tone}`} aria-live="polite">{text}</span>
      </div>
    </div>
  )
}

// --- Ekran --------------------------------------------------------------------------------

export default function SnakeGame({ trueDepth = false, onFinish, onExit }) {
  const [initialOpts] = useState(() => loadSnakeOpts(trueDepth))
  const [practiced, setPracticed] = useState(initialOpts.practiced)
  const [phase, setPhase] = useState('intro') // intro | practice | countdown | playing | paused | crashed | over
  const [control, setControl] = useState(initialOpts.control) // 'eyes' | 'touch'
  const [walls, setWalls] = useState(initialOpts.walls) // 'classic' | 'wrap'
  const [best, setBest] = useState(() => loadBest())
  const [hud, setHud] = useState({ score: 0, level: 1, pop: 0, popKey: 0 })
  const [heading, setHeading] = useState('right')
  const [count, setCount] = useState({ n: 3, resume: false })
  const [pauseReason, setPauseReason] = useState(null) // manual | hidden | face | eyes | calib
  const [result, setResult] = useState(null)
  const [gaze, setGaze] = useState(EMPTY_GAZE)
  const [prefs, setPrefsState] = useState(safePrefs)
  const [notice, setNotice] = useState(null)
  const [camFailed, setCamFailed] = useState(false)

  const phaseRef = useRef('intro')
  const controlRef = useRef(initialOpts.control)
  const pauseReasonRef = useRef(null)
  const bestRef = useRef(best)
  const gameRef = useRef(null)
  const prevRef = useRef([])
  const accRef = useRef(0)
  const playMsRef = useRef(0)
  const fxRef = useRef([])
  const crashAtRef = useRef(null)
  const foodBornRef = useRef(0)
  const crashTimerRef = useRef(0)
  const resultIdRef = useRef(0)
  const celebratedRef = useRef(0)
  const faceRef = useRef({ lastFaceTs: -Infinity, closedSince: null, calibrated: false, lastUi: 0 })
  const readerRef = useRef(null)
  const steadyRef = useRef(null)
  const dwellRef = useRef(null)
  const colorsRef = useRef(null)
  const sizeRef = useRef({ css: 0, dpr: 1 })
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const swipeRef = useRef(null)
  const angleRef = useRef(DIR_ANGLE.right)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish
  if (!readerRef.current) readerRef.current = newGazeReader(null)
  if (!steadyRef.current) steadyRef.current = createSteadyLook({ holdMs: RESUME_LOOK_MS })
  if (!dwellRef.current) dwellRef.current = createDwell()
  if (!gameRef.current) gameRef.current = createGame({ cols: COLS, rows: ROWS, wrap: walls === 'wrap' })

  const go = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  // --- Akış ---
  function beginCountdown(resume) {
    if (controlRef.current === 'eyes') {
      // Geri sayımda ekran "Ekranın ortasına bak" der; nötr bakış bu sırada YENİDEN toplanır.
      // recenter() yeterli değil: gaze.js onu yalnızca eski nötre 4°'den yakın kaymalarda kabul
      // eder (Routine'de hedefe bakışı nötr sanmamak için). Oyunlar arasında ya da duraklatmadan
      // sonra telefon/baş duruşu değişince açı gerçekten kayar; eski nötr kalırsa ekranın ortası
      // "aşağı" okunur, yılan istemeden döner ve otomatik devam hiç gelmez. Bu yüzden her geri
      // sayımda taze okuyucu kurulur (öğrenilen X işareti taşınır).
      // 'calib' duraklamasından dönüşte okuyucu zaten taze (henüz ya da az önce kalibre oldu).
      const fromCalib = resume && phaseRef.current === 'paused' && pauseReasonRef.current === 'calib'
      if (!fromCalib) {
        readerRef.current = newGazeReader(readerRef.current)
        faceRef.current.calibrated = false
      }
      dwellRef.current.reset()
    }
    steadyRef.current.reset()
    setCount({ n: 3, resume })
    go('countdown')
  }

  // --- Bakış pratiği (ilk gözle oyundan önce; "Nasıl oynanır?" ile her zaman) ---
  const practiceRef = useRef({ i: 0, done: false })
  const [practice, setPractice] = useState({ i: 0 })
  function startPractice() {
    unlockSfx()
    readerRef.current = newGazeReader(readerRef.current)
    faceRef.current.calibrated = false
    dwellRef.current.reset()
    practiceRef.current = { i: 0, done: false }
    setPractice({ i: 0 })
    if (!gameRef.current) {
      const g = createGame({ cols: COLS, rows: ROWS, wrap: walls === 'wrap' })
      gameRef.current = g
      prevRef.current = g.snake
    }
    controlRef.current = control
    go('practice')
  }
  function finishPractice(skipped) {
    practiceRef.current.done = true
    saveSnakeOpts({ control, walls, practiced: true })
    setPracticed(true)
    if (!skipped) haptic('success')
    startGame()
  }

  function startGame() {
    // Göz bütçesi dolduysa yeni tur başlamaz; App mola ekranını açar (lib/eyeBudgetStore.js)
    if (!requestEyeRound()) return
    unlockSfx()
    clearTimeout(crashTimerRef.current)
    const g = createGame({ cols: COLS, rows: ROWS, wrap: walls === 'wrap' })
    gameRef.current = g
    prevRef.current = g.snake
    accRef.current = 0
    playMsRef.current = 0
    fxRef.current = []
    crashAtRef.current = null
    foodBornRef.current = performance.now()
    controlRef.current = control
    setHud({ score: 0, level: 1, pop: 0, popKey: 0 })
    setHeading(g.dir)
    setResult(null)
    setNotice(null)
    saveSnakeOpts({ control, walls })
    beginCountdown(false)
  }

  function pause(reason) {
    const ph = phaseRef.current
    if (ph !== 'playing' && ph !== 'countdown') return
    steadyRef.current.reset()
    pauseReasonRef.current = reason
    setPauseReason(reason)
    go('paused')
    if (reason === 'calib') return
    playSfx('pause')
    if (reason === 'face' || reason === 'eyes') haptic('warning')
  }

  function goLive(resume) {
    if (controlRef.current === 'eyes') {
      const f = faceRef.current
      if (performance.now() - f.lastFaceTs > FACE_LOST_MS) return pause('face')
      if (!f.calibrated) return pause('calib')
    }
    dwellRef.current.reset()
    playSfx(resume ? 'resume' : 'start')
    go('playing')
    return undefined
  }

  function togglePause() {
    unlockSfx()
    const ph = phaseRef.current
    if (ph === 'playing' || ph === 'countdown') pause('manual')
    else if (ph === 'paused') beginCountdown(true)
  }

  function toTouch() {
    controlRef.current = 'touch'
    setControl('touch')
    saveSnakeOpts({ control: 'touch', walls })
    if (phaseRef.current === 'paused') beginCountdown(true)
  }

  function toIntro() {
    clearTimeout(crashTimerRef.current)
    go('intro')
  }

  function input(d) {
    const ph = phaseRef.current
    if (ph !== 'playing' && ph !== 'countdown') return
    const s = gameRef.current
    const n = turn(s, d)
    if (n === s) return
    gameRef.current = n
    setHeading(headingOf(n))
    playSfx('turn')
  }

  function endGame(final, now) {
    go('crashed')
    crashAtRef.current = final.won ? null : now
    if (final.won) {
      playSfx('record')
      haptic('success')
    } else {
      playSfx('crash')
      haptic('error')
    }
    const seconds = Math.max(1, Math.round(playMsRef.current / 1000))
    const prevBest = bestRef.current
    const record = final.score > prevBest
    const newBest = Math.max(prevBest, final.score)
    if (record) {
      saveBest(newBest)
      bestRef.current = newBest
      setBest(newBest)
    }
    resultIdRef.current += 1
    setResult({
      id: resultIdRef.current,
      score: final.score,
      best: newBest,
      prevBest,
      record,
      seconds,
      eaten: final.eaten,
      won: final.won,
      crash: final.crash?.kind ?? null,
    })
    try {
      onFinishRef.current?.({ type: 'game', game: 'snake', score: final.score, seconds, best: newBest, control: controlRef.current })
    } catch {
      // kayıt hatası oyunu durdurmasın
    }
    clearTimeout(crashTimerRef.current)
    // Mola kararı merkezi göz bütçesinde (App + lib/eyeBudget.js); oyun kendi molasını açmaz
    crashTimerRef.current = setTimeout(() => go('over'), CRASH_MS)
  }

  function advance(now) {
    const s = gameRef.current
    const n = step(s)
    prevRef.current = s.snake
    gameRef.current = n
    if (!n.alive) {
      endGame(n, now)
      return
    }
    if (n.food !== s.food) foodBornRef.current = now
    if (n.ateThisStep) {
      const pts = n.score - s.score
      fxRef.current = [...fxRef.current.filter((e) => now - e.t0 < 700), { x: n.snake[0].x, y: n.snake[0].y, t0: now, pts }]
      const lvl = levelOf(n.eaten)
      playSfx(lvl > levelOf(s.eaten) ? 'level' : 'eat', { level: lvl })
      haptic('tick')
      setHud({ score: n.score, level: lvl, pop: pts, popKey: n.eaten })
    }
    if (n.dir !== s.dir) setHeading(headingOf(n))
  }

  // --- Bakış (TrueDepth) ---
  const onFrame = (m) => {
    const g = readerRef.current.push(m)
    const f = faceRef.current
    const ts = Number.isFinite(m.ts) ? m.ts : performance.now()
    if (g.tracked) f.lastFaceTs = ts
    f.calibrated = g.calibrated
    if (g.closed) {
      if (f.closedSince == null) f.closedSince = ts
    } else f.closedSince = null

    const ph = phaseRef.current
    let dw = { candidate: null, progress: 0 }
    let look = 0
    if (ph === 'playing') {
      dw = dwellRef.current.push(g.dir, ts)
      if (dw.fire) input(dw.fire)
    } else if (ph === 'practice') {
      dw = dwellRef.current.push(g.dir, ts)
      const pr = practiceRef.current
      if (dw.fire && !pr.done) {
        if (dw.fire === PRACTICE_DIRS[pr.i]) {
          pr.i += 1
          haptic('hit')
          playSfx('eat')
          setPractice({ i: pr.i })
          if (pr.i >= PRACTICE_DIRS.length) {
            pr.done = true
            setTimeout(() => finishPractice(false), 700)
          }
        } else haptic('warning')
      }
    } else if (ph === 'paused' && AUTO_PAUSE.has(pauseReasonRef.current)) {
      // Otomatik devam: yüz görünür, göz açık ve bakış RESUME_LOOK_MS boyunca sabit → kısa geri
      // sayım. "Ortada" olması aranmaz: nötr eskimiş olabilir (duruş değişti) ve o zaman ekranın
      // ortası hiç 'center' okunmaz. Nötrü geri sayım (beginCountdown) yeniden topluyor.
      const ready = g.tracked && !g.closed && g.calibrated
      look = steadyRef.current.push(ready ? g.v : null, ts)
      if (look >= 1) {
        steadyRef.current.reset()
        beginCountdown(true)
      }
    }
    if (ts - f.lastUi >= UI_MS) {
      f.lastUi = ts
      setGaze({ x: g.v.x, y: g.v.y, tracked: g.tracked, closed: g.closed, calibrated: g.calibrated, cand: dw.candidate, progress: dw.progress, look })
    }
  }

  const cam = useFaceTracking({ enabled: control === 'eyes' && CAMERA_PHASES.has(phase), trueDepth: true, onFrame })

  // Kamera açılamazsa dokunmaya geç (oyuncu takılı kalmasın)
  useEffect(() => {
    if (!cam.error) return
    setCamFailed(true)
    if (controlRef.current !== 'eyes' || phaseRef.current === 'intro') return
    setNotice('Kamera açılamadı; dokunarak devam ediyorsun.')
    toTouch()
    // toTouch yalnızca ref'lere ve durum ayarlayıcılarına dayanır
  }, [cam.error])

  // --- Döngü: requestAnimationFrame + sabit adım ---
  useEffect(() => {
    if (!GAME_PHASES.has(phase)) return undefined
    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(Math.max(0, now - last), 250) // arka plandan dönüşte sıçrama olmasın
      last = now
      if (phaseRef.current === 'playing' && controlRef.current === 'eyes') {
        const f = faceRef.current
        if (now - f.lastFaceTs > FACE_LOST_MS) pause('face')
        else if (f.closedSince != null && now - f.closedSince >= EYES_CLOSED_MS) pause('eyes')
      }
      if (phaseRef.current === 'playing') {
        playMsRef.current += dt
        accRef.current += dt
        for (let guard = 0; guard < 4 && phaseRef.current === 'playing'; guard++) {
          const interval = stepMs(gameRef.current.eaten)
          if (accRef.current < interval) break
          accRef.current -= interval
          advance(now)
        }
      }
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // Döngü yalnızca ref'leri okur; faz değişince yeniden kurulur.
  }, [phase])

  function draw(now) {
    const cv = canvasRef.current
    const sz = sizeRef.current
    if (!cv || !sz.css) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    if (!colorsRef.current) colorsRef.current = readColors()
    const g = gameRef.current
    const moving = phaseRef.current === 'playing' || phaseRef.current === 'paused' || phaseRef.current === 'countdown'
    const t = moving ? Math.min(1, accRef.current / stepMs(g.eaten)) : 1
    ctx.setTransform(sz.dpr, 0, 0, sz.dpr, 0, 0)
    renderScene(ctx, sz.css, now, {
      g,
      prev: prevRef.current,
      t,
      c: colorsRef.current,
      fx: fxRef.current,
      crashAt: crashAtRef.current,
      foodBorn: foodBornRef.current,
    })
  }

  // Retina keskinliği: tuval piksel boyutu = CSS boyutu × devicePixelRatio
  const inGame = GAME_PHASES.has(phase)
  useEffect(() => {
    if (!inGame) return undefined
    const el = boardRef.current
    const cv = canvasRef.current
    if (!el || !cv) return undefined
    const apply = () => {
      const css = el.clientWidth
      const dpr = Math.min(3, window.devicePixelRatio || 1)
      if (!css || (css === sizeRef.current.css && dpr === sizeRef.current.dpr)) return
      sizeRef.current = { css, dpr }
      cv.width = Math.round(css * dpr)
      cv.height = Math.round(css * dpr)
      draw(performance.now())
    }
    apply()
    let ro = null
    try {
      ro = new ResizeObserver(apply)
      ro.observe(el)
    } catch {
      window.addEventListener('resize', apply)
    }
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', apply)
      sizeRef.current = { css: 0, dpr: 1 }
    }
  }, [inGame])

  // Tema değişince renkleri yeniden oku (açık/koyu/sistem)
  useEffect(() => {
    const refresh = () => {
      colorsRef.current = readColors()
    }
    refresh()
    let mo = null
    let mq = null
    try {
      mo = new MutationObserver(refresh)
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    } catch {
      mo = null
    }
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', refresh)
    } catch {
      mq = null
    }
    return () => {
      mo?.disconnect()
      try {
        mq?.removeEventListener('change', refresh)
      } catch {
        // yoksay
      }
    }
  }, [])

  // Ses/titreşim tercihleri (Bilgi ekranından da değişebilir)
  useEffect(() => {
    try {
      const off = subscribePrefs(() => setPrefsState(safePrefs()))
      return typeof off === 'function' ? off : undefined
    } catch {
      return undefined
    }
  }, [])

  function togglePref(key) {
    const next = !prefs[key]
    try {
      setPrefs({ [key]: next })
    } catch {
      // yoksay
    }
    setPrefsState(safePrefs())
    if (key === 'sound' && next) {
      unlockSfx()
      playSfx('eat')
    }
    if (key === 'haptics' && next) haptic('tick')
  }

  // Rekor kutlaması (sonuç ekranı açılınca, bir kez)
  useEffect(() => {
    if (phase !== 'over' || !result?.record || celebratedRef.current === result.id) return
    celebratedRef.current = result.id
    playSfx('record')
    haptic('success')
  }, [phase, result])

  // Uygulama arka plana giderse duraklat
  const visRef = useRef(null)
  visRef.current = () => {
    if (document.visibilityState === 'hidden') pause('hidden')
  }
  useEffect(() => {
    const on = () => visRef.current?.()
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  // Klavye: ok tuşları / WASD, boşluk-P-Esc duraklat, Enter tekrar oyna
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    const ph = phaseRef.current
    if (ph === 'intro') return
    // Odaktaki düğme boşluk/Enter'ı kendisi işler (aksi halde iki kez tetiklenirdi)
    if ((e.key === ' ' || e.key === 'Enter') && e.target?.closest?.('button')) return
    const d = KEY_DIR[e.key]
    if (d) {
      e.preventDefault()
      input(d)
      return
    }
    if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault()
      togglePause()
    } else if (e.key === 'Enter' && ph === 'over') {
      e.preventDefault()
      startGame()
    }
  }
  useEffect(() => {
    const on = (e) => keyRef.current?.(e)
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  // Geri sayım 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return undefined
    playSfx('count')
    const id = setTimeout(
      () => {
        if (count.n > 1) setCount((c) => ({ ...c, n: c.n - 1 }))
        else goLive(count.resume)
      },
      count.resume ? RESUME_BEAT_MS : START_BEAT_MS,
    )
    return () => clearTimeout(id)
  }, [phase, count])

  useEffect(() => () => clearTimeout(crashTimerRef.current), [])

  // Kaydırma (yalnızca dokunma modunda; göz modunda yanlışlıkla dokunuş yılanı döndürmesin)
  const swipe = {
    onPointerDown: (e) => {
      unlockSfx()
      if (controlRef.current !== 'touch') return
      // Katmandaki düğmeler (Çık, Seçenekler, Devam…): yakalama yapılırsa click düğmeye değil tahtaya gider.
      if (e.target?.closest?.('button')) return
      swipeRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        // yoksay
      }
    },
    onPointerMove: (e) => {
      const s = swipeRef.current
      if (!s || s.id !== e.pointerId) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return
      input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
      swipeRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId } // aynı sürüklemede yeni dönüş
    },
    onPointerUp: () => {
      swipeRef.current = null
    },
    onPointerCancel: () => {
      swipeRef.current = null
    },
  }

  // Yön oku en kısa yoldan dönsün (sol → yukarı 270° değil 90°)
  {
    const target = DIR_ANGLE[heading] ?? 0
    const cur = angleRef.current
    angleRef.current = cur + ((((target - cur) % 360) + 540) % 360) - 180
  }

  const disclaimer = (
    <p className="note snake-disclaimer">
      <Info size={16} aria-hidden="true" />
      Eğlence ve bakış kontrolü pratiği. Görmeyi iyileştirdiği iddia edilmez.
    </p>
  )

  // --- Başlangıç ekranı ---
  if (phase === 'intro') {
    const eyes = control === 'eyes'
    const howto = eyes
      ? [
          [ScanFace, 'Telefonu yüz hizasında tut, başını sabit tut.'],
          [Eye, 'Yılanı döndürmek için gözünle o yöne, tahtanın dışına doğru kısaca bak.'],
          [Crosshair, 'Başlarken ekranın ortasına bak; bakışın buna göre ayarlanır.'],
          [EyeOff, 'Gözlerini 1 saniyeden uzun kapatırsan oyun durur; ekrana bakınca devam eder.'],
        ]
      : [
          [Hand, 'Tahtada parmağını kaydır ya da alttaki yön tuşlarına dokun.'],
          [Zap, 'Her 5 yemde hızlanır; hızlandıkça yem daha çok puan verir.'],
          [Pause, 'Sağ üstteki düğmeyle istediğin an duraklat. Klavyede ok tuşları da çalışır.'],
        ]
    return (
      <main className="screen snake-root snake-intro fade-in">
        <div className="snake-topbar">
          <button type="button" className="btn-icon" onClick={onExit} aria-label="Oyundan çık">
            <X size={20} aria-hidden="true" />
          </button>
          <span className="eyebrow">Göz pratiği</span>
          <span className="snake-topbar-spacer" aria-hidden="true" />
        </div>

        <section className="card card-hero snake-hero">
          {eyes ? (
            <>
              <div className="stack" style={{ gap: 4 }}>
                <h1>Yılan</h1>
                <p className="muted small">Klasik yılan oyunu. Bu kez gözünle yönlendir: dönmek istediğin yöne, tahtanın dışına kısaca bak.</p>
              </div>
              <GazeTutorial className="snake-tutorial" />
            </>
          ) : (
            <div className="snake-hero-row">
              <SnakeArt />
              <div className="stack" style={{ gap: 4 }}>
                <h1>Yılan</h1>
                <p className="muted small">Klasik yılan oyunu. Kaydırarak yönlendir.</p>
              </div>
            </div>
          )}
          <div className="snake-best-row">
            <span className="snake-best-icon"><Trophy size={18} aria-hidden="true" /></span>
            <span className="grow">En yüksek skor</span>
            <strong>{best > 0 ? best : '—'}</strong>
          </div>
        </section>

        <section className="card snake-options">
          {trueDepth && (
            <div className="stack" style={{ gap: 8 }}>
              <span className="eyebrow">Kontrol</span>
              <div className="segmented" role="group" aria-label="Kontrol">
                <button type="button" aria-pressed={eyes} disabled={camFailed} onClick={() => setControl('eyes')}>
                  <Eye size={16} aria-hidden="true" /> Gözlerinle
                </button>
                <button type="button" aria-pressed={!eyes} onClick={() => setControl('touch')}>
                  <Hand size={16} aria-hidden="true" /> Dokunarak
                </button>
              </div>
              {camFailed && <p className="muted small">Kamera şu an açılamıyor; dokunarak oynayabilirsin.</p>}
            </div>
          )}
          <div className="stack" style={{ gap: 8 }}>
            <span className="eyebrow">Duvarlar</span>
            <div className="segmented" role="group" aria-label="Duvarlar">
              <button type="button" aria-pressed={walls === 'classic'} onClick={() => setWalls('classic')}>
                <BrickWall size={16} aria-hidden="true" /> Klasik
              </button>
              <button type="button" aria-pressed={walls === 'wrap'} onClick={() => setWalls('wrap')}>
                <InfinityIcon size={16} aria-hidden="true" /> Geçilebilir
              </button>
            </div>
            <p className="muted small">
              {walls === 'classic' ? 'Duvara ya da kendine çarpınca oyun biter.' : 'Kenardan çıkınca karşı kenardan girersin; yalnızca kendine çarpınca biter.'}
            </p>
          </div>
        </section>

        <section className="card">
          <h3>Nasıl oynanır</h3>
          <ul className="snake-howto">
            {howto.map(([Icon, text]) => (
              <li key={text}>
                <span className="snake-howto-icon"><Icon size={18} aria-hidden="true" /></span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <PrefToggles prefs={prefs} onToggle={togglePref} />
        {disclaimer}

        <div className="snake-cta">
          <button type="button" className="btn" onClick={eyes && !practiced ? startPractice : startGame}>
            <Play size={20} aria-hidden="true" /> {eyes && !practiced ? 'Önce dene, sonra başla' : 'Başla'}
          </button>
          {eyes && practiced && (
            <button type="button" className="link-btn" onClick={startPractice}><ScanFace size={15} aria-hidden="true" /> Nasıl oynanır? Bir daha dene</button>
          )}
        </div>
      </main>
    )
  }

  // --- Oyun ekranı (geri sayım · oyun · duraklatma · çarpma · sonuç) ---
  const eyes = control === 'eyes'
  const paused = phase === 'paused'
  const over = phase === 'over'
  const canPause = phase === 'playing' || phase === 'countdown' || paused
  const liveRecord = best > 0 && hud.score > best
  const showEdges = eyes && (phase === 'playing' || phase === 'countdown' || phase === 'practice')
  const practiceTarget = phase === 'practice' ? PRACTICE_DIRS[Math.min(practice.i, PRACTICE_DIRS.length - 1)] : null

  let overlay = null
  if (phase === 'practice') {
    const done = practice.i >= PRACTICE_DIRS.length
    const t = practiceTarget
    const status = !cam.ready ? 'Kamera hazırlanıyor…' : !gaze.tracked ? 'Yüzün görünmüyor' : gaze.closed ? 'Gözlerin kapalı' : !gaze.calibrated ? 'Önce ekranın ortasına bak' : gaze.cand === t ? `${PRACTICE_TEXT[t]}… tut` : gaze.cand ? `${DIR_WORD[gaze.cand]} bakıyorsun — ${PRACTICE_HINT[t]} bak` : null
    overlay = (
      <div className="snake-overlay snake-practice" role="dialog" aria-modal="false" aria-label="Bakış pratiği">
        <span className="eyebrow">Şimdi sen dene · {Math.min(practice.i + 1, PRACTICE_DIRS.length)}/{PRACTICE_DIRS.length}</span>
        <GazeTutorial frame={PRACTICE_DIRS.indexOf(t)} label={false} className="snake-practice-art" />
        <h2>{done ? 'Harika, hazırsın' : PRACTICE_TEXT[t]}</h2>
        {!done && <p className="snake-overlay-sub">Başını çevirmeden, gözünle {PRACTICE_HINT[t]} bak ve kısa bir an tut.</p>}
        <div className="snake-practice-dots" aria-hidden="true">
          {PRACTICE_DIRS.map((d, i) => <i key={d} className={i < practice.i ? 'done' : i === practice.i ? 'now' : ''} />)}
        </div>
        {status && !done && <span className="snake-gaze-status" aria-live="polite">{status}</span>}
        {!done && <button type="button" className="link-btn" onClick={() => finishPractice(true)}>Atla, hemen başla</button>}
      </div>
    )
  } else if (phase === 'countdown') {
    overlay = (
      <div className="snake-overlay is-light" role="status">
        <span className="snake-count" key={`${count.resume}-${count.n}`}>{count.n}</span>
        <span className="snake-overlay-sub">{eyes ? 'Ekranın ortasına bak' : count.resume ? 'Devam ediyoruz' : 'Hazır ol'}</span>
      </div>
    )
  } else if (paused) {
    const auto = AUTO_PAUSE.has(pauseReason)
    const Icon = pauseReason === 'face' ? ScanFace : pauseReason === 'eyes' ? EyeOff : pauseReason === 'calib' ? Crosshair : Pause
    const title = pauseReason === 'calib' ? 'Ekranın ortasına bak' : auto ? 'Devam etmek için ekrana bak' : 'Duraklatıldı'
    const sub =
      pauseReason === 'face'
        ? 'Yüzün görünmüyor. Telefonu yüzüne dönük tut.'
        : pauseReason === 'eyes'
          ? 'Gözlerin kapalı kaldı, oyunu durdurdum.'
          : pauseReason === 'calib'
            ? 'Bakışın ayarlanıyor; bir an sabit bak.'
            : null
    overlay = (
      <div className="snake-overlay" role="dialog" aria-modal="false" aria-label={title}>
        <span className={`snake-overlay-icon ${auto ? 'is-waiting' : ''}`}><Icon size={26} aria-hidden="true" /></span>
        <h2>{title}</h2>
        {sub && <p className="snake-overlay-sub">{sub}</p>}
        {auto ? (
          <>
            <span className="snake-look" aria-hidden="true"><i style={{ width: `${Math.round(gaze.look * 100)}%` }} /></span>
            <button type="button" className="link-btn" onClick={toTouch}>Dokunarak devam et</button>
          </>
        ) : (
          <>
            <button type="button" className="btn snake-overlay-btn" onClick={togglePause}>
              <Play size={18} aria-hidden="true" /> Devam et
            </button>
            <button type="button" className="link-btn" onClick={startGame}>Baştan başla</button>
          </>
        )}
      </div>
    )
  } else if (over && result) {
    const reason = result.won ? 'Bütün tahtayı doldurdun!' : result.crash === 'self' ? 'Kendi kuyruğuna çarptın.' : 'Duvara çarptın.'
    overlay = (
      <div className="snake-overlay is-over" role="dialog" aria-modal="false" aria-labelledby="snake-over-title">
        {result.record && result.score > 0 && (
          <span className="snake-record"><Crown size={16} aria-hidden="true" /> {result.prevBest > 0 ? 'Yeni rekor!' : 'İlk rekorun!'}</span>
        )}
        <h2 id="snake-over-title">{result.won ? 'Kazandın!' : 'Oyun bitti'}</h2>
        <p className="snake-overlay-sub">{reason}</p>
        <div className="snake-stats">
          <div>
            <span>Skor</span>
            <strong>{result.score}</strong>
          </div>
          <div>
            <span>En iyi</span>
            <strong>{result.best}</strong>
          </div>
          <div>
            <span>Süre</span>
            <strong>{formatDuration(result.seconds)}</strong>
          </div>
        </div>
        <button type="button" className="btn snake-overlay-btn" onClick={startGame} autoFocus>
          <RotateCcw size={18} aria-hidden="true" /> Tekrar oyna
        </button>
        <div className="snake-over-links">
          <button type="button" className="btn btn-ghost btn-sm" onClick={toIntro}>
            <SlidersHorizontal size={16} aria-hidden="true" /> Seçenekler
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
            Çık
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className={`screen snake-root snake-game is-${phase}`}>
      <div className="snake-topbar">
        <button type="button" className="btn-icon" onClick={onExit} aria-label="Oyundan çık">
          <X size={20} aria-hidden="true" />
        </button>
        <span className="snake-modechip">
          {eyes ? <Eye size={14} aria-hidden="true" /> : <Hand size={14} aria-hidden="true" />}
          {eyes ? 'Gözle' : 'Dokunarak'} · {walls === 'wrap' ? 'Geçilebilir' : 'Klasik'}
        </span>
        <div className="snake-topbar-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => togglePref('sound')}
            aria-label={prefs.sound ? 'Sesi kapat' : 'Sesi aç'}
            aria-pressed={prefs.sound}
          >
            {prefs.sound ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
          </button>
          <button type="button" className="btn-icon" onClick={togglePause} disabled={!canPause} aria-label={paused ? 'Devam et' : 'Duraklat'}>
            {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="snake-scorebar">
        <div className="snake-score">
          <span className="snake-score-label">Skor</span>
          <span className="snake-score-value">{hud.score}</span>
          {hud.popKey > 0 && (
            <span className="snake-pop" key={hud.popKey} aria-hidden="true">+{hud.pop}</span>
          )}
        </div>
        <div className="snake-meta">
          <span className={`snake-chip ${liveRecord ? 'is-record' : ''}`}>
            {liveRecord ? <Crown size={13} aria-hidden="true" /> : <Trophy size={13} aria-hidden="true" />}
            {liveRecord ? 'Rekor' : 'En iyi'} {Math.max(best, hud.score)}
          </span>
          <span className="snake-chip snake-level" key={hud.level}>
            <Zap size={13} aria-hidden="true" /> Hız {hud.level}
          </span>
        </div>
      </div>

      <div
        ref={boardRef}
        className={`snake-board-wrap ${walls} ${phase === 'crashed' && !result?.won ? 'is-shaking' : ''}`}
        {...swipe}
      >
        <canvas ref={canvasRef} className="snake-canvas" aria-label={`Yılan tahtası, skor ${hud.score}`} role="img" />
        {showEdges &&
          ['up', 'right', 'down', 'left'].map((d) => {
            const Icon = EDGE_ICONS[d]
            const p = gaze.cand === d ? gaze.progress : 0
            return (
              <span key={d} className={`snake-edge ${d} ${p >= 1 ? 'is-fired' : ''} ${practiceTarget === d ? 'is-target' : ''}`} style={{ '--p': p }} aria-hidden="true">
                <Icon size={22} strokeWidth={2.6} />
              </span>
            )
          })}
        {overlay}
      </div>

      <div className="snake-controls">
        {notice && !over && <p className="snake-notice" role="status">{notice}</p>}
        {over ? (
          disclaimer
        ) : eyes ? (
          <GazePanel ui={gaze} angle={angleRef.current} camReady={cam.ready} />
        ) : (
          <>
            <DPad onDir={input} heading={heading} disabled={phase === 'crashed'} />
            <p className="snake-hint">Tahtada kaydır ya da tuşlara dokun</p>
          </>
        )}
      </div>
    </main>
  )
}
