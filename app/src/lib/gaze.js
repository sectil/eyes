// Egzersiz takibi (TrueDepth / ARKit göz değerleri, 0–1).
// Girdi: { blinkLeft, blinkRight, lookUpLeft, lookUpRight, lookDownLeft, lookDownRight,
//          lookInLeft, lookInRight, lookOutLeft, lookOutRight }
// In: burna doğru, Out: şakağa doğru. Left/Right: kişinin kendi sol/sağ gözü.
// Apple: eyeLookInLeft = "movement of the left eyelids consistent with a rightward gaze"
// (developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation/eyelookinleft) →
// sağa bakış = lookInLeft + lookOutRight. createGazeReader açı işaretini buna göre doğrular.
// VARSAYIM: ARKit'te "Left" kişinin sol gözüdür. Cihazda ters çıkarsa FLIP_X = -1 yapılır.
// VARSAYIM: eşikler (aşağıdaki sabitler) ilk sürüm içindir; gerçek cihazda ayarlanacak.

import { loadGazeModel, applyModel, createOneEuro } from './gazeCalib.js'

export const FLIP_X = 1
export const DIR_THRESHOLD = 0.3 // bir yöne "bakıyor" saymak için
export const CIRCLE_MIN = 0.2 // daire takibinde merkezden en az uzaklık
export const BLINK_CLOSE = 0.5 // göz kapandı
export const BLINK_OPEN = 0.25 // göz yeniden açıldı (histerezis)
// Çift sayımı önleme. VARSAYIM: 350 ms refrakter ve 0,6 kapanma doruğu ilk sürüm içindir.
export const BLINK_REFRACTORY_MS = 350 // açıldıktan sonra bu süre içinde yeniden kapanma = aynı kırpma
export const BLINK_MIN_PEAK = 0.6 // sayılması için kapanmanın ulaşması gereken en yüksek değer

const avg = (a, b) => ((a ?? 0) + (b ?? 0)) / 2

export function eyeClosure(f) {
  return avg(f.blinkLeft, f.blinkRight)
}

// Bakış vektörü: x > 0 kişinin sağı, y > 0 yukarı.
export function gazeVector(f) {
  const right = avg(f.lookInLeft, f.lookOutRight)
  const left = avg(f.lookOutLeft, f.lookInRight)
  const up = avg(f.lookUpLeft, f.lookUpRight)
  const down = avg(f.lookDownLeft, f.lookDownRight)
  return { x: FLIP_X * (right - left), y: up - down }
}

// Baskın yön: 'right' | 'left' | 'up' | 'down' | 'center'
export function gazeDirection(v, threshold = DIR_THRESHOLD) {
  const ax = Math.abs(v.x)
  const ay = Math.abs(v.y)
  if (Math.max(ax, ay) < threshold) return 'center'
  if (ax >= ay) return v.x > 0 ? 'right' : 'left'
  return v.y > 0 ? 'up' : 'down'
}

// Göz kırpma sayacı: kapanıp yeniden açılan her göz bir kırpmadır. { push, retune, count, closed }
// Çift sayım koruması:
//  - histerezis: closeAt'te kapanır, openAt'e inince açılır (eşik çevresindeki titreme sayılmaz);
//  - doruk: kapanma en az minPeak'e ulaşmadıysa (yarım kapanma) sayılmaz;
//  - refrakter: açıldıktan sonra refractoryMs içinde yeniden kapanırsa aynı kırpmanın devamıdır
//    (göz sıkılırken değer bir an düşüp geri çıkınca ikinci kez sayılmaz).
export function createBlinkCounter({
  closeAt = BLINK_CLOSE,
  openAt = BLINK_OPEN,
  minClosedMs = 80,
  minPeak = BLINK_MIN_PEAK,
  refractoryMs = BLINK_REFRACTORY_MS,
} = {}) {
  let closed = false
  let closedAt = 0
  let peak = 0
  let counted = false
  let openedAt = -Infinity
  let count = 0
  return {
    push(closure, ts) {
      if (!Number.isFinite(closure)) return count
      if (!closed) {
        if (closure >= closeAt) {
          closed = true
          if (ts - openedAt >= refractoryMs) {
            // Yeni kırpma
            closedAt = ts
            peak = closure
            counted = false
          } else if (closure > peak) peak = closure // önceki kırpmanın devamı
        }
      } else {
        if (closure > peak) peak = closure
        if (closure <= openAt) {
          closed = false
          openedAt = ts
          if (!counted && ts - closedAt >= minClosedMs && peak >= minPeak) {
            count += 1
            counted = true
          }
        }
      }
      return count
    },
    // Eşikleri değiştirir; sayım ve o anki durum (kapalı/açık, doruk, refrakter) korunur.
    // Kişinin açık göz tabanı sonradan öğrenilince: retune(blinkThresholds(base)). Sabit eşikle
    // "kapalı"da takılı kalmış kırpma, göz yeni açılma eşiğine inince (doruk yeterliyse) sayılır.
    retune(th = {}) {
      if (Number.isFinite(th.closeAt)) closeAt = th.closeAt
      if (Number.isFinite(th.openAt)) openAt = th.openAt
      if (Number.isFinite(th.minPeak)) minPeak = th.minPeak
    },
    get count() {
      return count
    },
    get closed() {
      return closed
    },
  }
}

// Kişiye göre kırpma eşikleri. base: gözler açıkken ölçülen kapanma ortancası (0–1).
// Telefona aşağı bakınca göz kapağı iner ve açık gözde bile değer 0,2–0,4 olabilir; sabit
// eşiklerle göz hiç "açıldı" sayılmaz. VARSAYIM: kapanma payı +0,30, açılma payı +0,12, doruk +0,10.
export function blinkThresholds(base) {
  if (!Number.isFinite(base) || base < 0) return { closeAt: BLINK_CLOSE, openAt: BLINK_OPEN, minPeak: BLINK_MIN_PEAK }
  const b = Math.min(base, 0.45)
  const closeAt = Math.max(BLINK_CLOSE, b + 0.3)
  const openAt = Math.max(BLINK_OPEN, b + 0.12)
  const minPeak = Math.max(BLINK_MIN_PEAK, closeAt + 0.1)
  return { closeAt, openAt, minPeak }
}

// Koşul doğruyken geçen süreyi biriktirir. Kareler arası boşluk maxGapMs ile sınırlanır
// (takip kesilip geri geldiğinde süre sıçramasın).
export function createHoldTimer({ maxGapMs = 250 } = {}) {
  let last = null
  let heldMs = 0
  return {
    push(ok, ts) {
      if (last != null && ok) heldMs += Math.min(ts - last, maxGapMs)
      last = ts
      return heldMs
    },
    get heldMs() {
      return heldMs
    },
  }
}

// Daire takibi: bakış dört bölgeden (sağ, yukarı, sol, aşağı) sırayla geçtikçe ilerler.
// dir 'cw' = saat yönü (kişinin gördüğü gibi: yukarı → sağ → aşağı → sol).
// Döner: { laps, wrongWay }
const QUADS = ['right', 'up', 'left', 'down'] // saat yönünün tersi sıralı

export function quadrantOf(v, min = CIRCLE_MIN) {
  if (Math.hypot(v.x, v.y) < min) return null
  const a = Math.atan2(v.y, v.x) // -π..π, 0 = sağ
  const i = Math.round(a / (Math.PI / 2)) // -2..2
  return QUADS[(i + 4) % 4]
}

// min: merkezden en az uzaklık, v ile aynı birimde (blendshape için CIRCLE_MIN,
// createGazeReader derecesi için CIRCLE_MIN_DEG).
export function createCircleTracker(dir, { min = CIRCLE_MIN } = {}) {
  const step = dir === 'cw' ? -1 : 1
  let lastQ = null
  let steps = 0
  let reverse = 0
  return {
    push(v) {
      const q = quadrantOf(v, min)
      if (!q || q === lastQ) return this.state
      if (lastQ == null) {
        lastQ = q
        return this.state
      }
      const d = (QUADS.indexOf(q) - QUADS.indexOf(lastQ) + 4) % 4
      if (d === (step + 4) % 4) {
        steps += 1
        reverse = 0
      } else if (d === (-step + 4) % 4) {
        reverse += 1
        if (reverse >= 2) steps = 0
      }
      // d === 2: çapraz sıçrama → yok say
      lastQ = q
      return this.state
    },
    get state() {
      return { laps: Math.floor(steps / 4), progress: (steps % 4) / 4, wrongWay: reverse >= 2 }
    },
  }
}

// --- Bakış okuyucu (derece) ---------------------------------------------------------
// createGazeReader(opts) → { push(frame) → { dir, v, closed, calibrated, tracked }, recenter(), neutral }
//  dir: 'up' | 'down' | 'left' | 'right' | 'center' | null (yüz yok ya da gözler kapalı)
//  v:   nötr bakışa göre derece; x > 0 kişinin kendi sağı, y > 0 yukarı.
// Birincil kaynak native açılar (gazeLeftX/Y, gazeRightX/Y; derece). Yoksa blendshape
// (gazeVector) yönlere göre ayrı ölçeklenip dereceye yaklaştırılır.
// VARSAYIM: aşağıdaki eşik ve süreler ilk sürüm içindir; cihazda ayarlanacak.
export const GAZE_ENTER_DEG = 8 // yöne girmek için
export const GAZE_EXIT_DEG = 5 // yönden çıkmak için (histerezis)
export const GAZE_FULL_DEG = 20 // arayüzde tam kenar; blendshape yolunda o yöndeki en güçlü bakış
export const CIRCLE_MIN_DEG = 6 // daire takibinde merkezden en az uzaklık (derece)
export const GAZE_FLIP_KEY = 'gozolcum:gaze-flip'

const CAL_MS = 800 // nötr için açık gözle toplanan süre
const CAL_MIN_SAMPLES = 6
const CAL_MAX_ATTEMPTS = 4 // recenter'da kararsız pencereler; sonra eski nötr korunur
const STABLE_DEG = 3 // pencere içi sapma ortancası (MAD) bundan küçükse "sabit bakış"
const STABLE_BLEND = 0.08
// recenter yalnızca küçük kaymayı düzeltir. Adım başında kişi çoktan hedefe bakıyorsa
// (ör. "Sola bak" sesini duyup gözünü kaydırdıysa) o bakış nötr sanılmasın.
const RECENTER_MAX_DEG = 4
const RECENTER_MAX_BLEND = 0.12
// Blendshape yolu: yön başına en güçlü sapma (max-normalizasyon). Taban, henüz o yöne hiç
// bakılmamışken aşırı hassasiyeti önler. VARSAYIM: 0,6 ≈ tipik tam bakış.
const SPAN_FLOOR = 0.6
const SPAN_LEARN_MAX_CLOSURE = 0.35 // göz belirgin açıkken öğren (kırpma başlangıcı sızmasın)
// İşaret doğrulama (açı ↔ blendshape)
const SIGN_MIN_DEG = 6
const SIGN_MIN_BLEND = 0.25
const SIGN_WINDOW = 15
const SIGN_FLIP_RATIO = 0.7

function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  const n = s.length
  if (!n) return null
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

const pick = (a, b) => {
  const fa = Number.isFinite(a)
  const fb = Number.isFinite(b)
  if (fa && fb) return (a + b) / 2
  if (fa) return a
  if (fb) return b
  return null
}

// Native açı (derece) — iki gözün ortalaması; tek göz varsa o. Yoksa null.
export function eyeAngles(f) {
  const x = pick(f.gazeLeftX, f.gazeRightX)
  const y = pick(f.gazeLeftY, f.gazeRightY)
  return x == null || y == null ? null : { x, y }
}

function readFlip(key) {
  try {
    return globalThis.localStorage?.getItem(key) === '1' ? -1 : 1
  } catch {
    return 1
  }
}

function writeFlip(key, flip) {
  try {
    globalThis.localStorage?.setItem(key, flip === -1 ? '1' : '0')
  } catch {
    // depolama yok → yalnızca bu oturum
  }
}

// Sabit bakış penceresinden nötr adayı: ortanca + yayılım (MAD)
function fitNeutral(points) {
  const mx = median(points.map((p) => p.x))
  const my = median(points.map((p) => p.y))
  const spread = Math.max(median(points.map((p) => Math.abs(p.x - mx))), median(points.map((p) => Math.abs(p.y - my))))
  return { x: mx, y: my, spread }
}

// opts: { calibMs, enterDeg, exitDeg, flipX (1 | -1, kayıtlıyı ezer), persistKey (null → hatırlama) }
// Histerezis + baskın eksen (derece ya da kalibre birim ×GAZE_FULL_DEG)
function stepDir(cur, p, enterDeg, exitDeg) {
  const ax = Math.abs(p.x)
  const ay = Math.abs(p.y)
  const d = ax >= ay ? (p.x >= 0 ? 'right' : 'left') : p.y >= 0 ? 'up' : 'down'
  const mag = Math.max(ax, ay)
  if (cur && cur !== 'center') {
    const keep = cur === 'right' ? p.x : cur === 'left' ? -p.x : cur === 'up' ? p.y : -p.y
    if (keep >= exitDeg) return d !== cur && mag >= enterDeg && mag > keep ? d : cur
  }
  return mag >= enterDeg ? d : 'center'
}

// Kişisel kalibrasyon modeliyle okuyucu (lib/gazeCalib.js). Eksen, işaret ve kazanç kullanıcının
// kendi 5 nokta verisinden gelir; v birimi: kalibrasyondaki sağ/sol hedefi = ±GAZE_FULL_DEG.
// recenter(): baş/telefon konumu kayınca merkezi düzeltir (yalnızca küçük ve sabit kayma kabul).
const RECENTER_MAX_FRAC = 0.35 // aralığın bu oranından büyük kayma = kişi hedefe bakıyor, kabul etme
const RECENTER_STABLE_FRAC = 0.15
function createModelReader(model, opts) {
  const enterDeg = opts.enterDeg ?? GAZE_ENTER_DEG
  const exitDeg = opts.exitDeg ?? GAZE_EXIT_DEG
  const calibMs = opts.calibMs ?? CAL_MS
  const range = {
    x: Math.min(Math.abs(model.x.pos - model.x.c), Math.abs(model.x.neg - model.x.c)),
    y: Math.min(Math.abs(model.y.pos - model.y.c), Math.abs(model.y.neg - model.y.c)),
  }
  const fx = createOneEuro()
  const fy = createOneEuro()
  let shift = { x: 0, y: 0 }
  let cal = { samples: [], start: null, attempts: 0 }
  let dir = null
  let v = { x: 0, y: 0 }
  const out = (d, closed, tracked) => ({ dir: d, v: { x: v.x, y: v.y }, closed, calibrated: true, tracked, model: true })
  const reset = () => {
    dir = null
    fx.reset()
    fy.reset()
  }
  function collect(raw, ts) {
    if (cal.start == null) cal.start = ts
    cal.samples.push(raw)
    if (ts - cal.start < calibMs || cal.samples.length < CAL_MIN_SAMPLES) return
    const mx = median(cal.samples.map((p) => p.x))
    const my = median(cal.samples.map((p) => p.y))
    const sx = median(cal.samples.map((p) => Math.abs(p.x - mx)))
    const sy = median(cal.samples.map((p) => Math.abs(p.y - my)))
    const nx = mx - model.x.c
    const ny = my - model.y.c
    const stable = sx <= RECENTER_STABLE_FRAC * range.x && sy <= RECENTER_STABLE_FRAC * range.y
    const near = Math.abs(nx) <= RECENTER_MAX_FRAC * range.x && Math.abs(ny) <= RECENTER_MAX_FRAC * range.y
    if (stable && near) {
      shift = { x: nx, y: ny }
      cal = null
      return
    }
    cal = cal.attempts + 1 >= CAL_MAX_ATTEMPTS ? null : { samples: [], start: null, attempts: cal.attempts + 1 }
  }
  return {
    push(f = {}) {
      const ts = Number.isFinite(f.ts) ? f.ts : Date.now()
      if ((f.face ?? f.tracked) === false) {
        reset()
        return out(null, false, false)
      }
      if (eyeClosure(f) >= BLINK_CLOSE) {
        dir = null
        return out(null, true, true)
      }
      const r = applyModel(model, f, shift)
      if (!r || !Number.isFinite(r.x) || !Number.isFinite(r.y)) return out(null, false, false)
      if (cal) collect(r.raw, ts)
      v = { x: fx.push(r.x * GAZE_FULL_DEG, ts), y: fy.push(r.y * GAZE_FULL_DEG, ts) }
      dir = stepDir(dir, v, enterDeg, exitDeg)
      return out(dir, false, true)
    },
    recenter() {
      cal = { samples: [], start: null, attempts: 0 }
      reset()
    },
    get neutral() {
      return { x: 0, y: 0, source: 'model' }
    },
    get flipX() {
      return 1
    },
    get usesModel() {
      return true
    },
  }
}

// opts.model: kalibrasyon modeli; verilmezse kayıtlı model yüklenir (null → eski, kalibrasyonsuz yol)
export function createGazeReader(opts = {}) {
  const model = opts.model === undefined ? loadGazeModel() : opts.model
  if (model) return createModelReader(model, opts)
  const calibMs = opts.calibMs ?? CAL_MS
  const enterDeg = opts.enterDeg ?? GAZE_ENTER_DEG
  const exitDeg = opts.exitDeg ?? GAZE_EXIT_DEG
  const persistKey = opts.persistKey === undefined ? GAZE_FLIP_KEY : opts.persistKey
  let flip = opts.flipX === 1 || opts.flipX === -1 ? opts.flipX : persistKey ? readFlip(persistKey) : 1

  // Nötrler ham (işaret çevrilmemiş) koordinatlarda tutulur; çevirme sonradan uygulanır.
  const neutral = { angle: null, blend: null }
  const span = { right: 0, left: 0, up: 0, down: 0 }
  let cal = { samples: [], start: null, attempts: 0 }
  let collecting = true
  let hist = [] // son 3 örnek (tek karelik sıçramaları eleyen ortanca süzgeç)
  let histSource = null
  let dir = null
  let v = { x: 0, y: 0 }
  let source = null // son açık gözlü karenin kaynağı: 'angle' | 'blend'
  let signBuf = []

  const calibrated = () => Boolean(source ? neutral[source] : neutral.angle || neutral.blend)

  function resetMotion() {
    hist = []
    dir = null
  }

  function out(d, closed, tracked) {
    return { dir: d, v: { x: v.x, y: v.y }, closed, calibrated: calibrated(), tracked }
  }

  function collect(ang, blend, ts) {
    if (cal.start == null) cal.start = ts
    cal.samples.push({ ang, blend })
    if (ts - cal.start < calibMs || cal.samples.length < CAL_MIN_SAMPLES) return
    const angs = cal.samples.filter((p) => p.ang).map((p) => p.ang)
    const blends = cal.samples.map((p) => p.blend)
    const primary = angs.length >= cal.samples.length / 2 ? 'angle' : 'blend'
    const fit = (key, pts, stableTol, maxShift) => {
      if (pts.length < CAL_MIN_SAMPLES) return { status: 'none' }
      const c = fitNeutral(pts)
      if (c.spread > stableTol) return { status: 'unstable' }
      const prev = neutral[key]
      if (prev && Math.hypot(c.x - prev.x, c.y - prev.y) > maxShift) return { status: 'far' }
      return { status: 'ok', value: { x: c.x, y: c.y } }
    }
    const fits = { angle: fit('angle', angs, STABLE_DEG, RECENTER_MAX_DEG), blend: fit('blend', blends, STABLE_BLEND, RECENTER_MAX_BLEND) }
    const r = fits[primary].status
    if (r === 'ok' || r === 'far') {
      // 'far': sabit ama önceki nötrden uzak → kişi büyük olasılıkla hedefe bakıyor; eski nötr kalır.
      // İkincil kaynak (işaret doğrulamada kullanılır) yalnızca birincil kabul edildiğinde güncellenir.
      if (r === 'ok') for (const key of ['angle', 'blend']) if (fits[key].status === 'ok') neutral[key] = fits[key].value
      collecting = false
      return
    }
    cal = { samples: [], start: null, attempts: cal.attempts + 1 }
    if (neutral[primary] && cal.attempts >= CAL_MAX_ATTEMPTS) collecting = false
  }

  // Açı işareti blendshape ile güçlü örneklerde sürekli ters çıkıyorsa X'i çevir ve hatırla.
  function checkSign(ang, blend) {
    const na = neutral.angle ?? { x: 0, y: 0 }
    const nb = neutral.blend ?? { x: 0, y: 0 }
    const ax = flip * (ang.x - na.x)
    const bx = blend.x - nb.x
    if (Math.abs(ax) <= SIGN_MIN_DEG || Math.abs(bx) <= SIGN_MIN_BLEND) return
    signBuf.push(Math.sign(ax) === Math.sign(bx))
    if (signBuf.length > SIGN_WINDOW) signBuf.shift()
    if (signBuf.length < SIGN_WINDOW) return
    const wrong = signBuf.filter((ok) => !ok).length
    if (wrong / SIGN_WINDOW > SIGN_FLIP_RATIO) {
      flip = -flip
      signBuf = []
      resetMotion()
      if (persistKey) writeFlip(persistKey, flip)
    }
  }

  // Histerezis + baskın eksen
  function nextDir(cur, p) {
    const ax = Math.abs(p.x)
    const ay = Math.abs(p.y)
    const d = ax >= ay ? (p.x >= 0 ? 'right' : 'left') : p.y >= 0 ? 'up' : 'down'
    const mag = Math.max(ax, ay)
    if (cur && cur !== 'center') {
      const keep = cur === 'right' ? p.x : cur === 'left' ? -p.x : cur === 'up' ? p.y : -p.y
      if (keep >= exitDeg) return d !== cur && mag >= enterDeg && mag > keep ? d : cur
    }
    return mag >= enterDeg ? d : 'center'
  }

  return {
    push(f = {}) {
      const ts = Number.isFinite(f.ts) ? f.ts : Date.now()
      const tracked = (f.face ?? f.tracked) !== false
      if (!tracked) {
        resetMotion()
        return out(null, false, false)
      }
      const closure = eyeClosure(f)
      if (closure >= BLINK_CLOSE) {
        resetMotion()
        return out(null, true, true)
      }
      const ang = eyeAngles(f)
      const blend = gazeVector(f)
      if (collecting) collect(ang, blend, ts)
      if (ang) checkSign(ang, blend)

      const src = ang ? 'angle' : 'blend'
      if (src !== histSource) {
        hist = []
        histSource = src
      }
      source = src
      const n = neutral[src] ?? { x: 0, y: 0 }
      const rel = ang ? { x: flip * (ang.x - n.x), y: ang.y - n.y } : { x: blend.x - n.x, y: blend.y - n.y }
      hist.push(rel)
      if (hist.length > 3) hist.shift()
      const s = { x: median(hist.map((p) => p.x)), y: median(hist.map((p) => p.y)) }

      if (ang) v = s
      else {
        if (neutral.blend && closure < SPAN_LEARN_MAX_CLOSURE) {
          if (s.x > span.right) span.right = Math.min(1, s.x)
          if (-s.x > span.left) span.left = Math.min(1, -s.x)
          if (s.y > span.up) span.up = Math.min(1, s.y)
          if (-s.y > span.down) span.down = Math.min(1, -s.y)
        }
        const sx = Math.max(s.x >= 0 ? span.right : span.left, SPAN_FLOOR)
        const sy = Math.max(s.y >= 0 ? span.up : span.down, SPAN_FLOOR)
        v = { x: (s.x / sx) * GAZE_FULL_DEG, y: (s.y / sy) * GAZE_FULL_DEG }
      }
      dir = nextDir(dir, v)
      return out(dir, false, true)
    },
    // Nötrü yeniden topla (ör. adım başında). Öğrenilen ölçek ve işaret korunur; yeni nötr
    // yalnızca sabit ve eskisine yakınsa kabul edilir.
    recenter() {
      cal = { samples: [], start: null, attempts: 0 }
      collecting = true
      resetMotion()
    },
    // Aktif kaynağın nötrü (derece, kişinin sağı +x) ya da null. Blendshape için yaklaşık.
    get neutral() {
      const useBlend = source === 'blend' || (!source && !neutral.angle)
      if (useBlend) {
        const b = neutral.blend
        const k = GAZE_FULL_DEG / SPAN_FLOOR
        return b ? { x: b.x * k, y: b.y * k, source: 'blend' } : null
      }
      const a = neutral.angle
      return a ? { x: flip * a.x, y: a.y, source: 'angle' } : null
    },
    get flipX() {
      return flip
    },
  }
}

// --- Odak mesafesi (TrueDepth: focusMm = lookAtPoint, vergenceMm = konverjans) ---
// VARSAYIM: 1 m ötesinde tahmin kabalaşır; "uzak" eşiği 800 mm, "yakın" (başparmak) 300 mm.
// Eşikler ilk sürüm içindir, cihazda ayarlanacak.
export const NEAR_MM = 300
export const FAR_MM = 800

export function focusDistance(f) {
  const a = f.vergenceMm
  const b = f.focusMm
  if (a > 0 && b > 0) return Math.min(a, b) // ikisi de yakın diyorsa yakın; biri uzak diyorsa temkinli
  if (a > 0) return a
  if (b > 0) return b
  return null
}

// 'near' | 'far' | 'mid' | null (veri yok). vergenceMm null (paralel) → far.
export function focusZone(f) {
  if (f.vergenceMm === null && !(f.focusMm > 0)) return 'far'
  const d = focusDistance(f)
  if (d == null) return null
  if (d <= NEAR_MM) return 'near'
  if (d >= FAR_MM || f.vergenceMm === null) return 'far'
  return 'mid'
}

// Yakın–uzak geçiş sayacı: 'near' ve 'far' arasında her geçiş bir sayım; aynı bölgede kalmak saymaz.
// minHoldMs: bölge en az bu kadar tutulmalı (gürültü). Döner { switches, zone }
export function createNearFarCounter({ minHoldMs = 700 } = {}) {
  let zone = null
  let since = 0
  let stable = null
  let switches = 0
  return {
    push(z, ts) {
      if (z !== 'near' && z !== 'far') return this.state
      if (z !== zone) {
        zone = z
        since = ts
      } else if (ts - since >= minHoldMs && stable !== z) {
        if (stable != null) switches += 1
        stable = z
      }
      return this.state
    },
    get state() {
      return { switches, zone: stable }
    },
  }
}
