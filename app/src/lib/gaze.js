// Egzersiz takibi (TrueDepth / ARKit göz değerleri, 0–1).
// Girdi: { blinkLeft, blinkRight, lookUpLeft, lookUpRight, lookDownLeft, lookDownRight,
//          lookInLeft, lookInRight, lookOutLeft, lookOutRight }
// In: burna doğru, Out: şakağa doğru. Left/Right: kişinin kendi sol/sağ gözü.
// VARSAYIM: ARKit'te "Left" kişinin sol gözüdür. Cihazda ters çıkarsa FLIP_X = -1 yapılır.
// VARSAYIM: eşikler (aşağıdaki sabitler) ilk sürüm içindir; gerçek cihazda ayarlanacak.

export const FLIP_X = 1
export const DIR_THRESHOLD = 0.3 // bir yöne "bakıyor" saymak için
export const CIRCLE_MIN = 0.2 // daire takibinde merkezden en az uzaklık
export const BLINK_CLOSE = 0.5 // göz kapandı
export const BLINK_OPEN = 0.25 // göz yeniden açıldı (histerezis)

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

// Göz kırpma sayacı: kapanıp yeniden açılan her göz bir kırpmadır.
export function createBlinkCounter({ closeAt = BLINK_CLOSE, openAt = BLINK_OPEN, minClosedMs = 80 } = {}) {
  let closed = false
  let closedAt = 0
  let count = 0
  return {
    push(closure, ts) {
      if (!closed && closure >= closeAt) {
        closed = true
        closedAt = ts
      } else if (closed && closure <= openAt) {
        closed = false
        if (ts - closedAt >= minClosedMs) count += 1
      }
      return count
    },
    get count() {
      return count
    },
    get closed() {
      return closed
    },
  }
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

export function createCircleTracker(dir) {
  const step = dir === 'cw' ? -1 : 1
  let lastQ = null
  let steps = 0
  let reverse = 0
  return {
    push(v) {
      const q = quadrantOf(v)
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
