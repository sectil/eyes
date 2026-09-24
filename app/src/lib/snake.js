// Yılan (Snake) — saf oyun motoru. React/DOM yok; her fonksiyon YENİ durum döndürür
// (girdi değiştirilmez), bu yüzden test edilebilir ve ekrandan bağımsızdır.
//
// Durum: { cols, rows, wrap, snake:[{x,y}] (baş önde), dir, queue, food, score, eaten,
//          alive, ateThisStep, crash, won, seed, steps }
// Koordinat: x sağa, y AŞAĞI artar (ekran ızgarası). (0,0) sol üst hücre.
//
// Kurallar (Nokia klasik):
//  - Duvara ya da kendine çarpma oyunu bitirir. wrap:true ("duvarlardan geç") modunda
//    kenardan çıkan yılan karşı kenardan girer; yalnızca kendine çarpma bitirir.
//  - 180° geri dönüş yasak. Adım başına tek dönüş uygulanır; iki adım arasında hızlıca
//    ikinci bir dönüş girilirse o da kaybolmaz, bir sonraki adıma sıraya alınır (en çok 2).
//  - Yem her zaman boş hücreye, seed'li RNG ile konur (aynı seed → aynı oyun).
//  - Hız: başlangıç yavaş, her 5 yemde hızlanır; hızlandıkça yem daha çok puan verir.

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

export const DEFAULT_COLS = 15
export const DEFAULT_ROWS = 15
export const START_LENGTH = 3
export const MAX_QUEUE = 2 // uygulanacak dönüş + sıradaki tek dönüş

// VARSAYIM: göz kontrolünde bakış → dönüş gecikmesi (~220 ms bekleme + kamera) için
// başlangıç 420 ms/adım; her 5 yemde 30 ms hızlanır, taban 200 ms. Cihazda ayarlanacak.
export const START_MS = 420
export const MIN_MS = 200
export const SPEED_STEP_MS = 30
export const FOODS_PER_LEVEL = 5

// --- Seed'li RNG (mulberry32; saf: yeni seed döndürür) ---------------------------------
export function nextRandom(seed) {
  const s = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(s ^ (s >>> 15), s | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: s }
}

function randomSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0
}

// Yılanın üstünde olmayan rastgele bir hücre. Boş hücre yoksa food: null.
export function placeFood(snake, cols, rows, seed) {
  const taken = new Set(snake.map((p) => p.y * cols + p.x))
  const free = cols * rows - taken.size
  if (free <= 0) return { food: null, seed }
  const r = nextRandom(seed)
  let k = Math.floor(r.value * free)
  for (let i = 0; i < cols * rows; i++) {
    if (taken.has(i)) continue
    if (k === 0) return { food: { x: i % cols, y: Math.floor(i / cols) }, seed: r.seed }
    k -= 1
  }
  return { food: null, seed: r.seed } // erişilmez
}

// --- Hız ve puan -------------------------------------------------------------------------
export function levelOf(eaten) {
  return Math.floor(Math.max(0, eaten) / FOODS_PER_LEVEL) + 1
}

export function stepMs(eaten, { startMs = START_MS, minMs = MIN_MS, speedStepMs = SPEED_STEP_MS } = {}) {
  return Math.max(minMs, startMs - (levelOf(eaten) - 1) * speedStepMs)
}

// Sıradaki yemin puanı: o anki hız seviyesi (1, 2, 3 …)
export function pointsFor(eaten) {
  return levelOf(eaten)
}

// --- Oyun --------------------------------------------------------------------------------
export function createGame({ cols = DEFAULT_COLS, rows = DEFAULT_ROWS, seed, wrap = false, length = START_LENGTH } = {}) {
  const c = Math.max(5, Math.floor(cols))
  const r = Math.max(5, Math.floor(rows))
  const len = Math.max(1, Math.min(Math.floor(length), Math.floor(c / 2)))
  const hx = Math.floor(c / 2)
  const hy = Math.floor(r / 2)
  const snake = Array.from({ length: len }, (_, i) => ({ x: hx - i, y: hy }))
  const s0 = Number.isFinite(seed) ? seed >>> 0 : randomSeed()
  const placed = placeFood(snake, c, r, s0)
  return {
    cols: c,
    rows: r,
    wrap: Boolean(wrap),
    snake,
    dir: 'right',
    queue: [],
    food: placed.food,
    score: 0,
    eaten: 0,
    alive: true,
    ateThisStep: false,
    crash: null, // { x, y, kind: 'wall' | 'self' } — çarpılan hücre (duvarda tahta dışı olabilir)
    won: false,
    seed: placed.seed,
    steps: 0,
  }
}

// Dönüş isteği. Geçersiz (aynı yön, 180°, dolu sıra, bitmiş oyun) ise AYNI durum nesnesi
// döner — çağıran `yeni !== eski` ile kabul edilip edilmediğini anlayabilir.
export function turn(state, dir) {
  if (!state.alive || !DIRS[dir]) return state
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir
  if (dir === last || dir === OPPOSITE[last]) return state
  if (state.queue.length >= MAX_QUEUE) return state
  return { ...state, queue: [...state.queue, dir] }
}

// Bir adım ilerlet. dir verilirse önce dönüş isteği olarak eklenir.
export function step(state, dir) {
  const s = dir ? turn(state, dir) : state
  if (!s.alive) return s
  const [next, ...rest] = s.queue
  const d = next ?? s.dir
  const v = DIRS[d]
  const head = s.snake[0]
  let nx = head.x + v.x
  let ny = head.y + v.y
  if (s.wrap) {
    nx = (nx + s.cols) % s.cols
    ny = (ny + s.rows) % s.rows
  } else if (nx < 0 || ny < 0 || nx >= s.cols || ny >= s.rows) {
    return { ...s, dir: d, queue: rest, alive: false, ateThisStep: false, crash: { x: nx, y: ny, kind: 'wall' } }
  }
  const eats = Boolean(s.food) && s.food.x === nx && s.food.y === ny
  // Yemezse kuyruk bu adımda çekilir → kuyruğun eski hücresine girmek çarpma değildir.
  const body = eats ? s.snake : s.snake.slice(0, -1)
  if (body.some((p) => p.x === nx && p.y === ny)) {
    return { ...s, dir: d, queue: rest, alive: false, ateThisStep: false, crash: { x: nx, y: ny, kind: 'self' } }
  }
  const snake = [{ x: nx, y: ny }, ...body]
  if (!eats) return { ...s, snake, dir: d, queue: rest, ateThisStep: false, steps: s.steps + 1 }
  const placed = placeFood(snake, s.cols, s.rows, s.seed)
  const full = placed.food == null // tahta doldu → kazandın
  return {
    ...s,
    snake,
    dir: d,
    queue: rest,
    food: placed.food,
    seed: placed.seed,
    score: s.score + pointsFor(s.eaten),
    eaten: s.eaten + 1,
    ateThisStep: true,
    alive: !full,
    won: full,
    steps: s.steps + 1,
  }
}

// Son uygulanacak yön (sıradaki dönüş varsa o, yoksa mevcut yön)
export function headingOf(state) {
  return state.queue.length ? state.queue[state.queue.length - 1] : state.dir
}

// İki hücre arasındaki en kısa adım; wrap modunda kenar aşımını hesaba katar (çizim için).
export function wrapDelta(a, b, cols, rows) {
  let dx = b.x - a.x
  let dy = b.y - a.y
  if (dx > cols / 2) dx -= cols
  else if (dx < -cols / 2) dx += cols
  if (dy > rows / 2) dy -= rows
  else if (dy < -rows / 2) dy += rows
  return { x: dx, y: dy }
}

// --- Bakışla yön: bekleme (dwell) ---------------------------------------------------------
// Aynı yöne dwellMs boyunca bakılınca tek bir kez "fire" eder; yön değişmeden tekrar etmez.
// 'center' / null (yüz yok, göz kapalı) bekleyeni sıfırlar. Histerezis bakış okuyucudadır
// (createGazeReader enter/exit eşikleri).
// VARSAYIM: 220 ms, kısa göz kaymalarını (sakkad + dönüş) elerken gecikmeyi düşük tutar.
export const DWELL_MS = 220
const GAZE_DIRS = new Set(['up', 'down', 'left', 'right'])

export function createDwell({ dwellMs = DWELL_MS } = {}) {
  let cand = null
  let since = 0
  let fired = false
  return {
    push(dir, ts) {
      if (!GAZE_DIRS.has(dir)) {
        cand = null
        fired = false
        return { fire: null, candidate: null, progress: 0 }
      }
      if (dir !== cand) {
        cand = dir
        since = ts
        fired = false
      }
      const held = ts - since
      if (!fired && held >= dwellMs) {
        fired = true
        return { fire: dir, candidate: dir, progress: 1 }
      }
      return { fire: null, candidate: dir, progress: fired ? 1 : Math.max(0, Math.min(1, held / dwellMs)) }
    },
    reset() {
      cand = null
      fired = false
    },
  }
}

// --- Otomatik devam: sabit bakış ----------------------------------------------------------
// Bakış (derece, { x, y }) holdMs boyunca sabit kalınca progress 1 olur. Konumdan bağımsızdır:
// "ortada" olması istenmez, çünkü nötr eskimiş olabilir (telefon ya da baş duruşu değişti);
// geri sayım nötrü zaten yeniden toplar.
// Sabitlik: son holdMs'lik penceredeki örneklerin STEADY_QUANTILE kadarı, pencere ortancasına
// maxSpread dereceden yakın. Yüzdelik (ortanca sapma değil) seçildi: kayan pencerede ortanca
// sapma, yeni konuma geçen örnekler yarıyı aşınca yeniden küçülür ve kaymayı hiç görmeyebilir;
// yüzdelik ise kaymayı yakalar, tek karelik sıçramaya da dayanıklı kalır.
// null / geçersiz örnek (yüz yok, göz kapalı, okuyucu hazır değil) bekleyeni sıfırlar.
// Döner: 0..1 ilerleme.
// VARSAYIM: 5°, %80 ve 600 ms ilk sürüm içindir (30 cm'de tahta ≈ ±7°; ekrandaki yazıyı okumak
// sabit sayılır, başka bir yere bakmak sayılmaz). Cihazda ayarlanacak.
export const STEADY_SPREAD_DEG = 5
export const STEADY_QUANTILE = 0.8
export const STEADY_HOLD_MS = 600
const STEADY_MIN_SAMPLES = 5 // daha azıyla yüzdelik = en uzak örnek olur; tek sıçrama sıfırlamasın

function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

// Örneklerin q kadarının pencere ortancasına en çok ne kadar uzak olduğu (derece)
function spreadOf(pts, q = STEADY_QUANTILE) {
  const mx = median(pts.map((p) => p.x))
  const my = median(pts.map((p) => p.y))
  const d = pts.map((p) => Math.hypot(p.x - mx, p.y - my)).sort((a, b) => a - b)
  return d[Math.min(d.length - 1, Math.max(0, Math.ceil(q * d.length) - 1))]
}

export function createSteadyLook({ holdMs = STEADY_HOLD_MS, maxSpread = STEADY_SPREAD_DEG } = {}) {
  let buf = [] // { x, y, ts } — son holdMs
  let since = null // sabit bakışın başladığı an
  const clear = () => {
    buf = []
    since = null
  }
  return {
    push(v, ts) {
      if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(ts)) {
        clear()
        return 0
      }
      buf.push({ x: v.x, y: v.y, ts })
      while (ts - buf[0].ts > holdMs) buf.shift()
      if (since == null) since = ts
      if (buf.length >= STEADY_MIN_SAMPLES && spreadOf(buf) > maxSpread) {
        // Bakış kaydı: yeni konumda baştan say
        buf = [{ x: v.x, y: v.y, ts }]
        since = ts
        return 0
      }
      return Math.max(0, Math.min(1, (ts - since) / holdMs))
    },
    reset: clear,
  }
}

// --- Kayıtlı oyun seçenekleri (localStorage 'gozolcum:snake-opts') --------------------------
// Ana sayfa ve oyun aynı kaynağı okur: ana sayfadaki "gözünle / kaydırarak" metni, oyunun
// açılacağı kontrolle aynı olsun.
export const OPTS_KEY = 'gozolcum:snake-opts'

function localStore() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// trueDepth yoksa kontrol her zaman 'touch'. Varsa kayıtlı seçim 'touch' değilse 'eyes'.
export function loadSnakeOpts(trueDepth, storage) {
  const fallback = { control: trueDepth ? 'eyes' : 'touch', walls: 'classic' }
  try {
    const st = storage === undefined ? localStore() : storage
    const o = JSON.parse(st?.getItem(OPTS_KEY) || '{}') ?? {}
    return { control: trueDepth && o.control !== 'touch' ? 'eyes' : 'touch', walls: o.walls === 'wrap' ? 'wrap' : 'classic' }
  } catch {
    return fallback
  }
}

export function saveSnakeOpts(opts, storage) {
  try {
    const st = storage === undefined ? localStore() : storage
    if (!st) return false
    st.setItem(OPTS_KEY, JSON.stringify({ control: opts?.control === 'touch' ? 'touch' : 'eyes', walls: opts?.walls === 'wrap' ? 'wrap' : 'classic' }))
    return true
  } catch {
    return false
  }
}

// --- En yüksek skor (cihazda; localStorage 'gozolcum:snake-best') ------------------------
export const BEST_KEY = 'gozolcum:snake-best'

export function loadBest(storage) {
  try {
    const st = storage === undefined ? localStore() : storage
    const n = Number(st?.getItem(BEST_KEY))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function saveBest(score, storage) {
  try {
    const st = storage === undefined ? localStore() : storage
    if (!st) return false
    st.setItem(BEST_KEY, String(Math.max(0, Math.floor(score))))
    return true
  } catch {
    return false
  }
}

// Kayıtlı oturumlardan en iyi yılan skoru (localStorage silinse bile korunur)
export function bestFromSessions(sessions = []) {
  let best = 0
  for (const s of sessions) {
    if (s?.type === 'game' && s.game === 'snake' && Number.isFinite(s.score) && s.score > best) best = s.score
  }
  return best
}
