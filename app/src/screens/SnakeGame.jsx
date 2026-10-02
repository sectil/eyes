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
import { FEATURES } from '../lib/gazeCalib.js'
import {
  loadSnakeGaze,
  saveSnakeGaze,
  edgeFromRects,
  cellToUnit,
  fitSnakeGaze,
  createSnakeReader,
  createSteer,
  createCheck,
  CHECK_DIRS,
} from '../lib/snakeGaze.js'
import { shareText } from '../lib/share.js'
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
import { requestEyeRound } from '../lib/eyeBudgetStore.js'

// Yılan — gözle (TrueDepth bakış yönü) ya da dokunarak oynanan Nokia klasiği.
// Oyun motoru saf: src/lib/snake.js. Bu ekran yalnızca girdi, çizim, ses/titreşim ve akışı yönetir.
// Etiket: eğlence ve bakış kontrolü pratiği; görmeyi iyileştirdiği iddia edilmez.

const COLS = 15
const ROWS = 15
const GAME_PHASES = new Set(['setup', 'check', 'countdown', 'playing', 'paused', 'crashed', 'over'])
const CAMERA_PHASES = new Set(['setup', 'check', 'countdown', 'playing', 'paused'])
// Yılan ayarı (lib/snakeGaze.js): oyunun kendi düzeninde tahta ortası + dört yön kapısı. Sistem kalibrasyonuna dokunmaz.
// İlk girişte tam ayar; sonraki girişlerde dört yönlü kısa kontrol, tutmazsa ayar kendiliğinden yenilenir.
const SETUP_TARGETS = ['center', 'right', 'up', 'left', 'down', 'center2']
const SETUP_FIRST_SETTLE_MS = 1500 // ilk hedef: kişi telefonu yeni tutuyor
const SETUP_SETTLE_MS = 800 // göz hedefe varsın
const SETUP_COLLECT_MS = 1000
const SETUP_MIN_FRAMES = 18
const SETUP_MAX_MS = 6000 // hedef başına; bu sürede yeterli kare yoksa ayar tutmadı
const DIR_GATE = { right: 'sağdaki', left: 'soldaki', up: 'üstteki', down: 'alttaki' }
const AUTO_PAUSE = new Set(['face', 'eyes'])
// Teşhis: pratik ve oyun sırasında okuyucu çıktısı + ham açılar (yalnızca sayılar; görüntü yok). Son ~20 sn.
// Oyun sonu / duraklatma ekranındaki "Bakış verisini paylaş" ile geliştiriciye gönderilir (kalibrasyondaki gibi).
const DEBUG_FRAMES = 600
const r2 = (v) => (Number.isFinite(v) ? +v.toFixed(2) : null)

// VARSAYIM: aşağıdaki süreler ilk sürüm içindir; gerçek cihazda ayarlanacak.
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
const EMPTY_GAZE = { tracked: false, closed: false, cand: null, progress: 0, look: 0 }
// Otomatik devam için sabit bakış: kapı birimi (±1). 0,25 ≈ eski 5° (kapı ≈ 20°).
const STEADY_SPREAD_U = 0.25
const DEFAULT_PREFS = { sound: true, haptics: true }

function safePrefs() {
  try {
    return { ...DEFAULT_PREFS, ...getPrefs() }
  } catch {
    return DEFAULT_PREFS
  }
}

const rectOf = (el) => {
  const r = el?.getBoundingClientRect?.()
  return r && r.width > 0 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null
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
  const { g, prev, t, c, fx, crashAt, foodBorn, empty } = sc
  const cell = size / g.cols
  ctx.clearRect(0, 0, size, size)

  // LCD nokta ızgarası (Nokia ekranı esintisi)
  ctx.fillStyle = c.grid
  ctx.beginPath()
  const gr = Math.max(1, cell * 0.07)
  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      const cx = (x + 0.5) * cell
      const cy = (y + 0.5) * cell
      ctx.moveTo(cx + gr, cy)
      ctx.arc(cx, cy, gr, 0, TAU)
    }
  }
  ctx.fill()

  // Ayar ve kontrol sırasında tahta boş (yazının arkasından yılan/yem izi görünmesin)
  if (empty) return

  // Yem: doğuşta büyür, sonra hafifçe nabız atar
  if (g.food) {
    const born = Math.min(1, Math.max(0, (now - foodBorn) / 300))
    const k = easeOutBack(born) * (1 + 0.07 * Math.sin(now / 240))
    const cx = (g.food.x + 0.5) * cell
    const cy = (g.food.y + 0.5) * cell
    ctx.fillStyle = c.foodGlow
    dot(ctx, cx, cy, cell * 0.6 * k)
    ctx.fillStyle = c.food
    dot(ctx, cx, cy + cell * 0.03 * k, cell * 0.36 * k)
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
  // Yumuşak ışıma: yılan tahtanın üstünde parlasın
  ctx.save()
  ctx.shadowColor = c.body
  ctx.shadowBlur = cell * 0.6
  ctx.strokeStyle = c.body
  ctx.lineWidth = cell * 0.82
  strokeBody(ctx, pts, cell, g)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)' // boru parlaklığı
  ctx.lineWidth = cell * 0.2
  strokeBody(ctx, pts, cell, g)

  const h = pts[0]
  const hx = (h.x + 0.5) * cell
  const hy = (h.y + 0.5) * cell
  const crashed = crashAt != null
  ctx.fillStyle = crashed ? c.crash : c.head
  dot(ctx, hx, hy, cell * 0.48)
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

// Yön kapısı (göz modu): tahtanın dışında; bakış bu kapıda bekleyince yılan döner. Halka bekleme ilerledikçe dolar.
function Gate({ dir, p, target, fired, gateRef }) {
  const Icon = EDGE_ICONS[dir]
  return (
    <span ref={gateRef} className={`snake-gate ${dir} ${target ? 'is-target' : ''} ${fired ? 'is-fired' : ''}`} style={{ '--p': p }} aria-hidden="true">
      <Icon size={22} strokeWidth={2.8} />
    </span>
  )
}

// --- Ekran --------------------------------------------------------------------------------

export default function SnakeGame({ trueDepth = false, onFinish, onExit }) {
  const [initialOpts] = useState(() => loadSnakeOpts(trueDepth))
  const [phase, setPhase] = useState('intro') // intro | setup | check | countdown | playing | paused | crashed | over
  const [control, setControl] = useState(initialOpts.control) // 'eyes' | 'touch'
  const [walls, setWalls] = useState(initialOpts.walls) // 'classic' | 'wrap'
  const [best, setBest] = useState(() => loadBest())
  const [hud, setHud] = useState({ score: 0, level: 1, pop: 0, popKey: 0 })
  const [heading, setHeading] = useState('right')
  const [count, setCount] = useState({ n: 3, resume: false })
  const [pauseReason, setPauseReason] = useState(null) // manual | hidden | face | eyes
  const [result, setResult] = useState(null)
  const [gaze, setGaze] = useState(EMPTY_GAZE)
  const [prefs, setPrefsState] = useState(safePrefs)
  const [notice, setNotice] = useState(null)
  const [camFailed, setCamFailed] = useState(false)
  const [hasCal, setHasCal] = useState(() => Boolean(loadSnakeGaze()))
  const [setupUi, setSetupUi] = useState({ i: 0, progress: 0, failed: false })
  const [checkUi, setCheckUi] = useState({ i: 0, hits: 0, failed: false, wrongAt: 0 })

  const phaseRef = useRef('intro')
  const controlRef = useRef(initialOpts.control)
  const pauseReasonRef = useRef(null)
  const bestRef = useRef(best)
  const gameRef = useRef(null)
  const debugRef = useRef([])
  const [shareNote, setShareNote] = useState('')
  const calRef = useRef(null)
  if (calRef.current === null) calRef.current = loadSnakeGaze() ?? false
  async function shareGazeDebug() {
    const payload = JSON.stringify({ app: 'Nefona', kind: 'snake-gaze', v: 2, build: import.meta.env.VITE_APP_BUILD ?? 'web', cal: calRef.current || null, check: lastCheckRef.current, drift: readerRef.current?.drift ?? null, frames: debugRef.current })
    const r = await shareText('Nefona yılan bakış verisi', payload)
    setShareNote(r === 'shared' ? 'Paylaşıldı.' : r === 'copied' ? 'Panoya kopyalandı.' : 'Kopyalanamadı.')
  }
  const prevRef = useRef([])
  const accRef = useRef(0)
  const playMsRef = useRef(0)
  const fxRef = useRef([])
  const crashAtRef = useRef(null)
  const foodBornRef = useRef(0)
  const crashTimerRef = useRef(0)
  const resultIdRef = useRef(0)
  const celebratedRef = useRef(0)
  const faceRef = useRef({ lastFaceTs: -Infinity, closedSince: null, lastUi: 0, lastU: null })
  const readerRef = useRef(null)
  const steerRef = useRef(null)
  const steadyRef = useRef(null)
  const setupRef = useRef(null) // { i, phaseStart, windows, edge, redo }
  const checkRef = useRef(null) // { check, redone }
  const checkedRef = useRef(false) // bu girişte kontrol geçti mi (tekrar oyunlarda sorulmaz)
  const lastCheckRef = useRef(null) // kayda girecek kontrol sonucu (yalnız ilk oyuna)
  const gateRefs = { up: useRef(null), right: useRef(null), down: useRef(null), left: useRef(null) }
  const colorsRef = useRef(null)
  const sizeRef = useRef({ css: 0, dpr: 1 })
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const swipeRef = useRef(null)
  const angleRef = useRef(DIR_ANGLE.right)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish
  if (!steadyRef.current) steadyRef.current = createSteadyLook({ holdMs: RESUME_LOOK_MS, maxSpread: STEADY_SPREAD_U })
  if (!gameRef.current) gameRef.current = createGame({ cols: COLS, rows: ROWS, wrap: walls === 'wrap' })

  const go = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  function applyCal(cal) {
    calRef.current = cal
    readerRef.current = createSnakeReader(cal)
    steerRef.current = createSteer(cal.edge)
  }
  if (calRef.current && !readerRef.current) applyCal(calRef.current)

  // --- Akış ---
  function beginCountdown(resume) {
    if (controlRef.current === 'eyes') steerRef.current?.reset()
    steadyRef.current.reset()
    setCount({ n: 3, resume })
    go('countdown')
  }

  function ensureBoard() {
    if (gameRef.current) return
    const g = createGame({ cols: COLS, rows: ROWS, wrap: walls === 'wrap' })
    gameRef.current = g
    prevRef.current = g.snake
  }

  // Yılan ayarı: tahta ortası + dört kapı + yeniden orta. redo: kontrol tutmadığı için kendiliğinden açıldı
  function beginSetup(redo = false) {
    unlockSfx()
    ensureBoard()
    controlRef.current = control
    setupRef.current = { i: 0, phaseStart: null, windows: {}, edge: null, redo }
    setSetupUi({ i: 0, progress: 0, failed: false, redo })
    go('setup')
  }

  function beginCheck(redone = false) {
    unlockSfx()
    ensureBoard()
    controlRef.current = control
    steerRef.current?.reset()
    checkRef.current = { check: createCheck(), redone }
    setCheckUi({ i: 0, hits: 0, failed: false, wrongAt: 0 })
    go('check')
  }

  function finishSetup() {
    const st = setupRef.current
    const fit = fitSnakeGaze(st.windows, st.edge)
    if (!fit.ok) {
      setSetupUi((u) => ({ ...u, failed: true }))
      haptic('warning')
      return
    }
    saveSnakeGaze(fit.cal)
    applyCal(fit.cal)
    setHasCal(true)
    haptic('success')
    playSfx('level', { level: 2 })
    beginCheck(true)
  }

  function finishCheck(res) {
    if (res.pass) {
      checkedRef.current = true
      lastCheckRef.current = { hits: res.hits, n: res.n, wrong: res.wrong, ms: res.ms }
      haptic('success')
      setTimeout(() => startGame(), 650)
      return
    }
    // Kontrol tutmadı: ilk kez ise ayar kendiliğinden yenilenir; ayardan hemen sonra da tutmadıysa seçenek sunulur
    if (!checkRef.current?.redone) beginSetup(true)
    else {
      lastCheckRef.current = { hits: res.hits, n: res.n, wrong: res.wrong, ms: res.ms }
      setCheckUi((u) => ({ ...u, failed: true }))
      haptic('warning')
    }
  }

  function startGame() {
    // Gözle: bu girişte ilk oyundan önce Yılan ayarı/kontrolü (lib/snakeGaze.js)
    if (control === 'eyes' && !checkedRef.current) {
      if (calRef.current) beginCheck(false)
      else beginSetup(false)
      return
    }
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

  // Kontrol tutmasa da oyuncu isterse başlar (bu giriş için)
  function startAnyway() {
    checkedRef.current = true
    startGame()
  }

  function pause(reason) {
    const ph = phaseRef.current
    if (ph !== 'playing' && ph !== 'countdown') return
    steadyRef.current.reset()
    pauseReasonRef.current = reason
    setPauseReason(reason)
    go('paused')
    playSfx('pause')
    if (reason === 'face' || reason === 'eyes') haptic('warning')
  }

  function goLive(resume) {
    if (controlRef.current === 'eyes') {
      const f = faceRef.current
      if (performance.now() - f.lastFaceTs > FACE_LOST_MS) return pause('face')
    }
    steerRef.current?.reset()
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
    const ph = phaseRef.current
    if (ph === 'paused') beginCountdown(true)
    else if (ph === 'setup' || ph === 'check') {
      phaseRef.current = 'intro' // startGame dokunmayla doğrudan başlar
      setTimeout(() => startGame(), 0)
    }
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
    const eyes = controlRef.current === 'eyes'
    const check = eyes ? lastCheckRef.current : null
    lastCheckRef.current = null // kontrol yalnız o girişin ilk oyununa yazılır (Gelişim serisinde tekrar etmesin)
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
      check,
    })
    try {
      // gaze: yalnız sayılar (kontrol isabeti, süre ortancası); görüntü ya da ham bakış yok
      onFinishRef.current?.({ type: 'game', game: 'snake', score: final.score, seconds, best: newBest, control: controlRef.current, ...(check ? { gaze: check } : {}) })
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
      // Oyun içi kayma düzeltmesi: yem yendiği an bakış büyük olasılıkla başta (lib/snakeGaze.js nudge)
      const cal = calRef.current
      if (controlRef.current === 'eyes' && cal) readerRef.current?.nudge(faceRef.current.lastU, cellToUnit(n.snake[0], n.cols, n.rows, cal.edge))
    }
    if (n.dir !== s.dir) setHeading(headingOf(n))
  }

  // --- Yılan ayarı: hedef başına kare toplama ---
  function setupFrame(m, g, ts) {
    const st = setupRef.current
    if (!st || setupUi.failed) return
    if (!st.edge) {
      st.edge = edgeFromRects({ board: rectOf(boardRef.current), up: rectOf(gateRefs.up.current), right: rectOf(gateRefs.right.current), down: rectOf(gateRefs.down.current), left: rectOf(gateRefs.left.current) })
      if (!st.edge) return
    }
    if (st.i >= SETUP_TARGETS.length) return
    const t = SETUP_TARGETS[st.i]
    if (st.phaseStart == null) st.phaseStart = ts
    const settle = st.i === 0 ? SETUP_FIRST_SETTLE_MS : SETUP_SETTLE_MS
    const el = ts - st.phaseStart
    const win = (st.windows[t] ??= [])
    if (el >= settle && g.tracked && !g.closed) win.push(m)
    const progress = Math.min(1, Math.max(0, (el - settle) / SETUP_COLLECT_MS))
    if (el >= settle + SETUP_COLLECT_MS && win.length >= SETUP_MIN_FRAMES) {
      st.i += 1
      st.phaseStart = ts
      haptic('hit')
      playSfx('eat')
      setSetupUi((u) => ({ ...u, i: st.i, progress: 0 }))
      if (st.i >= SETUP_TARGETS.length) finishSetup()
      return
    }
    if (el >= SETUP_MAX_MS) {
      st.i = SETUP_TARGETS.length
      setSetupUi((u) => ({ ...u, failed: true }))
      haptic('warning')
      return
    }
    if (ts - faceRef.current.lastUi >= UI_MS) setSetupUi((u) => (u.i === st.i ? { ...u, progress } : u))
  }

  // --- Bakış (TrueDepth) ---
  const onFrame = (m) => {
    const f = faceRef.current
    const ts = Number.isFinite(m.ts) ? m.ts : performance.now()
    const ph = phaseRef.current
    const reader = readerRef.current
    const g = reader ? reader.push(m) : { tracked: (m.face ?? m.tracked) !== false, closed: (((m.blinkLeft ?? 0) + (m.blinkRight ?? 0)) / 2) >= 0.5, u: null }
    if (g.tracked) f.lastFaceTs = ts
    if (g.closed) {
      if (f.closedSince == null) f.closedSince = ts
    } else f.closedSince = null

    let st = { candidate: null, progress: 0 }
    let look = 0
    if (ph === 'setup') setupFrame(m, g, ts)
    else if ((ph === 'playing' || ph === 'check') && steerRef.current) {
      st = steerRef.current.push(g.u, ts)
      if (g.u && !st.saccade) f.lastU = g.u
      if (ph === 'playing') {
        if (st.fire) input(st.fire)
      } else {
        const c = checkRef.current
        if (c && !c.check.state.done && !checkUi.failed) {
          const r = c.check.push(st.fire, ts)
          if (r.event === 'hit') {
            haptic('hit')
            playSfx('eat')
          } else if (r.event === 'wrong') haptic('warning')
          if (r.event) setCheckUi((u) => ({ ...u, i: r.i, hits: r.hits, wrongAt: r.event === 'wrong' ? ts : u.wrongAt }))
          if (r.done) finishCheck(c.check.result)
        }
      }
    } else if (ph === 'paused' && AUTO_PAUSE.has(pauseReasonRef.current)) {
      // Otomatik devam: yüz görünür, göz açık ve bakış RESUME_LOOK_MS boyunca sabit → kısa geri sayım
      look = steadyRef.current.push(g.tracked && !g.closed ? g.u : null, ts)
      if (look >= 1) {
        steadyRef.current.reset()
        beginCountdown(true)
      }
    }
    if (ph === 'playing' || ph === 'check' || ph === 'setup') {
      const d = debugRef.current
      d.push({ t: Math.round(ts), ph: ph[0], cx: r2(FEATURES.camX(m)), cy: r2(FEATURES.camY(m)), sx: r2(FEATURES.scrX(m)), sy: r2(FEATURES.scrY(m)), hx: r2(FEATURES.headX(m)), hy: r2(FEATURES.headY(m)), ux: r2(g.u?.x), uy: r2(g.u?.y), z: st.candidate ?? null, f: st.fire ?? null, tr: g.tracked ? 1 : 0, cl: g.closed ? 1 : 0 })
      if (d.length > DEBUG_FRAMES) d.splice(0, d.length - DEBUG_FRAMES)
    }
    if (ts - f.lastUi >= UI_MS) {
      f.lastUi = ts
      setGaze({ tracked: g.tracked, closed: g.closed, cand: st.candidate, progress: st.progress, look })
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
      empty: phaseRef.current === 'setup' || phaseRef.current === 'check',
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
          [Eye, 'Dönmek istediğin yöndeki kapıya bak; yılan döner. Tahtanın içine bakmak yılanı döndürmez.'],
          [Crosshair, hasCal ? 'Her girişte dört kapıya birer kez bakarak kısa bir kontrol yaparsın.' : 'İlk girişte bakışın bu oyuna göre ayarlanır; yaklaşık 10 saniye sürer.'],
          [EyeOff, 'Gözünü kapatırsan durur, bakınca sürer.'],
        ]
      : [
          [Hand, 'Kaydır ya da yön tuşlarına dokun.'],
          [Zap, 'Her 5 yemde hızlanır, puan artar.'],
          [Pause, 'Sağ üstten duraklat.'],
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
          <div className="snake-hero-head">
            <div className="stack" style={{ gap: 4 }}>
              <h1>Yılan</h1>
              <p className="muted small">{eyes ? 'Gözünle yönlendir: dönmek istediğin yöndeki kapıya bak.' : 'Klasik yılan oyunu. Kaydırarak yönlendir.'}</p>
            </div>
            <span className="snake-best-chip" aria-label={`En yüksek skor ${best > 0 ? best : 'yok'}`}>
              <Trophy size={15} aria-hidden="true" />
              <strong>{best > 0 ? best : '—'}</strong>
            </span>
          </div>
          <div className={`snake-hero-art ${eyes ? 'is-eyes' : ''}`} aria-hidden="true">
            <SnakeArt />
            {eyes && ['up', 'right', 'down', 'left'].map((d) => {
              const Icon = EDGE_ICONS[d]
              return <span key={d} className={`snake-hero-gate ${d}`}><Icon size={16} strokeWidth={3} /></span>
            })}
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
          <button type="button" className="btn" onClick={startGame}>
            <Play size={20} aria-hidden="true" /> {eyes && !hasCal ? 'Ayarla ve başla' : 'Başla'}
          </button>
          {eyes && hasCal && (
            <button type="button" className="link-btn" onClick={() => beginSetup(false)}><ScanFace size={15} aria-hidden="true" /> Bakışı yeniden ayarla</button>
          )}
        </div>
      </main>
    )
  }

  // --- Oyun ekranı (ayar · kontrol · geri sayım · oyun · duraklatma · çarpma · sonuç) ---
  const eyes = control === 'eyes'
  const paused = phase === 'paused'
  const over = phase === 'over'
  const canPause = phase === 'playing' || phase === 'countdown' || paused
  const liveRecord = best > 0 && hud.score > best
  const gazePhase = eyes && (phase === 'setup' || phase === 'check' || phase === 'playing' || phase === 'countdown' || paused)
  const setupTarget = phase === 'setup' && !setupUi.failed ? SETUP_TARGETS[Math.min(setupUi.i, SETUP_TARGETS.length - 1)] : null
  const checkTarget = phase === 'check' && !checkUi.failed ? CHECK_DIRS[Math.min(checkUi.i, CHECK_DIRS.length - 1)] : null
  const gateTarget = setupTarget && DIR_GATE[setupTarget] ? setupTarget : checkTarget

  // Tahtanın üstündeki tek satırlık durum (göz modu)
  let status = null
  let tone = ''
  if (gazePhase) {
    if (!cam.ready) status = 'Kamera hazırlanıyor…'
    else if (!gaze.tracked) {
      status = 'Yüzün görünmüyor'
      tone = 'warn'
    } else if (gaze.closed && phase !== 'paused') {
      status = 'Gözlerin kapalı'
      tone = 'warn'
    } else if (phase === 'playing') status = gaze.cand ? `${DIR_WORD[gaze.cand]}…` : 'Dönmek için o yöndeki kapıya bak'
  }

  let overlay = null
  let guideHead = null // ayar ve kontrolde talimat: tahtanın üstünde (skor satırının yerinde)
  if (phase === 'setup') {
    const n = SETUP_TARGETS.length
    const t = setupTarget
    overlay = setupUi.failed ? (
      <div className="snake-overlay snake-guide" role="dialog" aria-modal="false" aria-label="Yılan ayarı">
        <span className="snake-overlay-icon"><Crosshair size={26} aria-hidden="true" /></span>
        <h2>Ayar tutmadı</h2>
        <p className="snake-overlay-sub">Telefonu yüzüne dönük tut, başını sabit tutup yalnız gözünü oynat.</p>
        <button type="button" className="btn snake-overlay-btn" onClick={() => beginSetup(setupRef.current?.redo)}>
          <RotateCcw size={18} aria-hidden="true" /> Yeniden dene
        </button>
        <button type="button" className="link-btn" onClick={toTouch}>Dokunarak oyna</button>
      </div>
    ) : (
      <div className="snake-overlay snake-guide is-clear" aria-hidden="true">
        {t === 'center' || t === 'center2' ? (
          <span className="snake-aim" style={{ '--p': setupUi.progress }} />
        ) : (
          <span className="snake-pointer" style={{ transform: `rotate(${DIR_ANGLE[t]}deg)` }}><ArrowUp size={44} strokeWidth={2.6} /></span>
        )}
      </div>
    )
    if (!setupUi.failed)
      guideHead = (
        <div className="snake-guide-head" role="status" aria-live="polite">
          <span className="eyebrow">{setupUi.redo ? 'Ayarı yeniliyorum' : 'Yılan ayarı'} · {Math.min(setupUi.i + 1, n)}/{n}</span>
          <h2>{t === 'center' || t === 'center2' ? 'Ortadaki noktaya bak' : `${DIR_GATE[t][0].toUpperCase()}${DIR_GATE[t].slice(1)} kapıya bak`}</h2>
          <div className="snake-steps" aria-hidden="true">
            {SETUP_TARGETS.map((d, i) => <i key={d} className={i < setupUi.i ? 'done' : i === setupUi.i ? 'now' : ''} />)}
          </div>
        </div>
      )
  } else if (phase === 'check') {
    const n = CHECK_DIRS.length
    const t = checkTarget
    overlay = checkUi.failed ? (
      <div className="snake-overlay snake-guide" role="dialog" aria-modal="false" aria-label="Bakış kontrolü">
        <span className="snake-overlay-icon"><Crosshair size={26} aria-hidden="true" /></span>
        <h2>Kapılar karışıyor</h2>
        <p className="snake-overlay-sub">Ayar bu duruşta tutmadı. Yeniden ayarlayabilir ya da dokunarak oynayabilirsin.</p>
        <button type="button" className="btn snake-overlay-btn" onClick={() => beginSetup(false)}>
          <RotateCcw size={18} aria-hidden="true" /> Yeniden ayarla
        </button>
        <div className="snake-over-links">
          <button type="button" className="btn btn-ghost btn-sm" onClick={toTouch}><Hand size={16} aria-hidden="true" /> Dokunarak</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={startAnyway}>Yine de başla</button>
        </div>
      </div>
    ) : (
      <div className="snake-overlay snake-guide is-clear" aria-hidden="true">
        <div className="snake-checks">
          {CHECK_DIRS.map((d, i) => {
            const Icon = EDGE_ICONS[d]
            return <span key={d} className={i < checkUi.i ? 'done' : i === checkUi.i ? 'now' : ''}><Icon size={22} strokeWidth={3} /></span>
          })}
        </div>
      </div>
    )
    if (!checkUi.failed)
      guideHead = (
        <div className="snake-guide-head" role="status" aria-live="polite">
          <span className="eyebrow">Kontrol · {Math.min(checkUi.i + 1, n)}/{n}</span>
          <h2>{t ? `${DIR_GATE[t][0].toUpperCase()}${DIR_GATE[t].slice(1)} kapıya bak` : 'Hazırsın'}</h2>
        </div>
      )
  } else if (phase === 'countdown') {
    overlay = (
      <div className="snake-overlay is-light" role="status">
        <span className="snake-count" key={`${count.resume}-${count.n}`}>{count.n}</span>
        <span className="snake-overlay-sub">{count.resume ? 'Devam ediyoruz' : 'Hazır ol'}</span>
      </div>
    )
  } else if (paused) {
    const auto = AUTO_PAUSE.has(pauseReason)
    const Icon = pauseReason === 'face' ? ScanFace : pauseReason === 'eyes' ? EyeOff : Pause
    const title = auto ? 'Devam etmek için ekrana bak' : 'Duraklatıldı'
    const sub = pauseReason === 'face' ? 'Yüzün görünmüyor. Telefonu yüzüne dönük tut.' : pauseReason === 'eyes' ? 'Gözlerin kapalı kaldı, oyunu durdurdum.' : null
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
            {eyes && debugRef.current.length > 0 && (
              <button type="button" className="link-btn" onClick={shareGazeDebug}>Bakış verisini paylaş{shareNote ? ` · ${shareNote}` : ''}</button>
            )}
          </>
        )}
      </div>
    )
  } else if (over && result) {
    const reason = result.won ? 'Bütün tahtayı doldurdun!' : result.crash === 'self' ? 'Kendi kuyruğuna çarptın.' : 'Duvara çarptın.'
    const gap = result.prevBest - result.score
    const isRecord = result.record && result.score > 0
    overlay = (
      <section className={`card snake-over-card ${isRecord ? 'is-record' : ''}`} role="dialog" aria-modal="false" aria-labelledby="snake-over-title">
        {isRecord && <span className="snake-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</span>}
        <span className="snake-emblem" aria-hidden="true">{isRecord ? <Crown size={30} strokeWidth={2.4} /> : <SnakeArt />}</span>
        <h2 id="snake-over-title">{result.won ? 'Kazandın!' : 'Oyun bitti'}</h2>
        <p className="snake-overlay-sub">{reason}</p>
        <div className={`snake-final ${isRecord ? 'is-record' : ''}`}>
          <strong>{result.score}</strong>
          <span>puan</span>
        </div>
        {isRecord ? (
          <span className="snake-record"><Crown size={16} aria-hidden="true" /> {result.prevBest > 0 ? 'Yeni rekor!' : 'İlk rekorun!'}</span>
        ) : gap > 0 ? (
          <span className="snake-gap"><Trophy size={15} aria-hidden="true" /> Rekora {gap} puan kaldı</span>
        ) : null}
        <div className="snake-stats">
          <div>
            <span>Yem</span>
            <strong>{result.eaten}</strong>
          </div>
          <div>
            <span>Süre</span>
            <strong>{formatDuration(result.seconds)}</strong>
          </div>
          {result.check ? (
            <div>
              <span>Kapılar</span>
              <strong>{result.check.hits}/{result.check.n}</strong>
            </div>
          ) : (
            <div>
              <span>En iyi</span>
              <strong>{result.best}</strong>
            </div>
          )}
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
        {eyes && debugRef.current.length > 0 && (
          <button type="button" className="link-btn" onClick={shareGazeDebug}>Bakış verisini paylaş{shareNote ? ` · ${shareNote}` : ''}</button>
        )}
      </section>
    )
  }

  const gateFor = (d) => (
    <Gate
      key={d}
      dir={d}
      gateRef={gateRefs[d]}
      p={gaze.cand === d && (phase === 'playing' || phase === 'check') ? gaze.progress : 0}
      fired={gaze.cand === d && gaze.progress >= 1 && (phase === 'playing' || phase === 'check')}
      target={gateTarget === d}
    />
  )

  return (
    <main className={`screen snake-root snake-game is-${phase} ${eyes ? 'is-eyes' : 'is-touch'}`}>
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

      <div className="snake-scorebar" hidden={(over && Boolean(result)) || phase === 'setup' || phase === 'check'}>
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

      {guideHead}
      {eyes && !guideHead && (
        <p className={`snake-status ${tone}`} aria-live="polite">{status ?? ' '}</p>
      )}

      {over && result && overlay}
      <div className={`snake-arena ${eyes ? 'has-gates' : ''}`} hidden={over && Boolean(result)}>
        {eyes && gateFor('up')}
        {eyes && gateFor('left')}
        <div
          ref={boardRef}
          className={`snake-board-wrap ${walls} ${phase === 'crashed' && !result?.won ? 'is-shaking' : ''}`}
          {...swipe}
        >
          <canvas ref={canvasRef} className="snake-canvas" aria-label={`Yılan tahtası, skor ${hud.score}`} role="img" />
          {!over && overlay}
        </div>
        {eyes && gateFor('right')}
        {eyes && gateFor('down')}
      </div>

      <div className="snake-controls">
        {notice && !over && <p className="snake-notice" role="status">{notice}</p>}
        {over ? (
          disclaimer
        ) : eyes ? null : (
          <>
            <DPad onDir={input} heading={heading} disabled={phase === 'crashed'} />
            <p className="snake-hint">Tahtada kaydır ya da tuşlara dokun</p>
          </>
        )}
      </div>
    </main>
  )
}
