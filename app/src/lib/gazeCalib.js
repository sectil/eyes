// Kişisel göz kalibrasyonu (5 nokta). ARKit'in göz verisindeki eksen/işaret kurallarını
// TAHMİN ETMEZ: kullanıcı ortaya, sola, sağa, yukarı ve aşağı bakarken tüm aday sinyaller
// kaydedilir; her eksen için sol↔sağ (aşağı↔yukarı) farkını gürültüye göre en net ayıran
// sinyal seçilir. Merkez, yön (işaret) ve iki yanın ayrı kazancı bu veriden hesaplanır.
//
// Aday sinyaller (native yüz olayı, src/hooks/useFaceTracking.js):
//  ang*   : gazeLeft/RightX/Y — göz dönüş açısı (derece)
//  look*  : lookAtX/Y — ARKit lookAtPoint (yüz koordinatı, metre)
//  blend* : eyeLook* blendshape'lerinden türetilen vektör (0–1)


export const GAZE_MODEL_KEY = 'gozolcum:gaze-model-v1'
export const TARGETS = ['center', 'left', 'right', 'up', 'down', 'center2']
// VARSAYIM: en az bu kadar "ayrışma / gürültü" oranı yoksa eksen güvenilmez sayılır.
export const MIN_SCORE = 2.5

const num = (v) => (Number.isFinite(v) ? v : null)
const pick = (a, b) => {
  const fa = Number.isFinite(a)
  const fb = Number.isFinite(b)
  if (fa && fb) return (a + b) / 2
  return fa ? a : fb ? b : null
}

export const FEATURES = {
  angX: (f) => pick(f.gazeLeftX, f.gazeRightX),
  angY: (f) => pick(f.gazeLeftY, f.gazeRightY),
  lookX: (f) => num(f.lookAtX),
  lookY: (f) => num(f.lookAtY),
  blendX: (f) => (hasBlend(f) ? blendVector(f).x : null),
  blendY: (f) => (hasBlend(f) ? blendVector(f).y : null),
}
export const AXIS_FEATURES = { x: ['angX', 'lookX', 'blendX'], y: ['angY', 'lookY', 'blendY'] }
// Sayısal taban gürültü (birim başına) — sıfıra bölmeyi ve aşırı iyimser skoru önler
const NOISE_FLOOR = { angX: 0.4, angY: 0.4, lookX: 0.002, lookY: 0.002, blendX: 0.02, blendY: 0.02 }

// Blendshape bakış vektörü (gaze.js gazeVector ile aynı formül; döngüsel içe aktarımı önlemek için burada)
const avg2 = (a, b) => ((a ?? 0) + (b ?? 0)) / 2
function blendVector(f) {
  return {
    x: avg2(f.lookInLeft, f.lookOutRight) - avg2(f.lookOutLeft, f.lookInRight),
    y: avg2(f.lookUpLeft, f.lookUpRight) - avg2(f.lookDownLeft, f.lookDownRight),
  }
}

function hasBlend(f) {
  return ['lookInLeft', 'lookInRight', 'lookOutLeft', 'lookOutRight', 'lookUpLeft', 'lookUpRight', 'lookDownLeft', 'lookDownRight'].some((k) => Number.isFinite(f[k]))
}

export function median(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b)
  const n = s.length
  if (!n) return null
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

function mad(arr, m) {
  return median(arr.filter(Number.isFinite).map((v) => Math.abs(v - m)))
}

// Bir hedefteki karelerden her aday sinyalin ortancası ve yayılımı
export function summarize(frames) {
  const out = {}
  for (const [k, fn] of Object.entries(FEATURES)) {
    const vals = frames.map(fn).filter(Number.isFinite)
    if (vals.length < 5) continue
    const m = median(vals)
    out[k] = { med: m, mad: mad(vals, m), n: vals.length }
  }
  return out
}

// Bir eksen için en iyi sinyal. neg: sol/aşağı, pos: sağ/yukarı hedefinin özeti.
export function fitAxis(center, neg, pos, features) {
  let best = null
  for (const k of features) {
    const c = center[k]
    const a = neg[k]
    const b = pos[k]
    if (!c || !a || !b) continue
    const dNeg = a.med - c.med
    const dPos = b.med - c.med
    // İki yan merkezin zıt taraflarında olmalı (işaret ne olursa olsun)
    if (!(dNeg * dPos < 0)) continue
    const sep = Math.min(Math.abs(dNeg), Math.abs(dPos))
    const noise = Math.max(c.mad, a.mad, b.mad, NOISE_FLOOR[k] ?? 1e-6)
    const score = sep / noise
    if (!best || score > best.score) best = { feature: k, c: c.med, neg: a.med, pos: b.med, score }
  }
  return best && best.score >= MIN_SCORE ? best : best ? { ...best, weak: true } : null
}

// windows: { center: frames[], left, right, up, down, center2? }
export function fitModel(windows) {
  const S = {}
  for (const t of TARGETS) if (windows[t]?.length) S[t] = summarize(windows[t])
  const centerFrames = [...(windows.center ?? []), ...(windows.center2 ?? [])]
  const C = summarize(centerFrames)
  const x = S.left && S.right ? fitAxis(C, S.left, S.right, AXIS_FEATURES.x) : null
  const y = S.down && S.up ? fitAxis(C, S.down, S.up, AXIS_FEATURES.y) : null
  const ok = Boolean(x && !x.weak && y && !y.weak)
  return { version: 1, ok, x, y }
}

// Eksen normalizasyonu: merkez 0, pos hedefi +1, neg hedefi −1 (iki yanın kazancı ayrı).
export function normAxis(axis, value, center = axis.c) {
  if (!Number.isFinite(value)) return null
  const d = value - center
  if (d === 0) return 0
  const toPos = axis.pos - axis.c // toPos ve toNeg zıt işaretli (fitAxis garanti eder)
  const toNeg = axis.neg - axis.c
  if (Math.sign(d) === Math.sign(toPos)) return d / toPos // pozitif
  return -(d / toNeg) // negatif
}

// Kareden normalleştirilmiş bakış {x,y}: ±1 = kalibrasyondaki sağ/sol, yukarı/aşağı hedefi.
// shift: recenter ile öğrenilen merkez kayması (ham birimde).
export function applyModel(model, f, shift = { x: 0, y: 0 }) {
  if (!model?.x || !model?.y) return null
  const vx = FEATURES[model.x.feature](f)
  const vy = FEATURES[model.y.feature](f)
  if (!Number.isFinite(vx) || !Number.isFinite(vy)) return null
  return { x: normAxis(model.x, vx, model.x.c + shift.x), y: normAxis(model.y, vy, model.y.c + shift.y), raw: { x: vx, y: vy } }
}

export function loadGazeModel() {
  try {
    const m = JSON.parse(globalThis.localStorage?.getItem(GAZE_MODEL_KEY) ?? 'null')
    return m && m.version === 1 && m.ok && m.x && m.y ? m : null
  } catch {
    return null
  }
}

export function saveGazeModel(model) {
  try {
    globalThis.localStorage?.setItem(GAZE_MODEL_KEY, JSON.stringify({ ...model, date: new Date().toISOString() }))
  } catch {
    // depolama yok → yalnızca bu oturum
  }
}

export function clearGazeModel() {
  try {
    globalThis.localStorage?.removeItem(GAZE_MODEL_KEY)
  } catch {
    // yoksay
  }
}

export const hasGazeModel = () => Boolean(loadGazeModel())

// One Euro filtresi (Casiez 2012): yavaş harekette titremeyi süzer, hızlı harekette gecikmez.
// VARSAYIM: minCutoff 1,2 Hz, beta 0,05 (normalleştirilmiş birim ×20 için) — cihazda ayarlanacak.
export function createOneEuro({ minCutoff = 1.2, beta = 0.05, dCutoff = 1.0 } = {}) {
  let x = null
  let dx = 0
  let t = null
  const alpha = (cutoff, dt) => {
    const tau = 1 / (2 * Math.PI * cutoff)
    return 1 / (1 + tau / dt)
  }
  return {
    push(value, ts) {
      if (!Number.isFinite(value)) return x
      if (x == null || t == null || !(ts > t)) {
        x = value
        t = ts
        return x
      }
      const dt = Math.min((ts - t) / 1000, 0.5)
      t = ts
      const rawDx = (value - x) / dt
      dx = dx + alpha(dCutoff, dt) * (rawDx - dx)
      const cutoff = minCutoff + beta * Math.abs(dx)
      x = x + alpha(cutoff, dt) * (value - x)
      return x
    },
    reset() {
      x = null
      t = null
      dx = 0
    },
  }
}
