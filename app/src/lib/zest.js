// ZEST (QUEST'in posterior ortalama kuralı) ile adaptif görme keskinliği eşiği.
// Kaynak gerekçesi: bkz. eyes-arastirma/ajan-raporlari/13_gunluk_takip.md (FrACT, ZEST).
//
// Psikometrik fonksiyon (4 seçenekli zorunlu seçim, tumbling E):
//   p(doğru | x, θ) = γ + (1 − γ − λ) · 1 / (1 + exp(−(x − θ) / s))
//   x: gösterilen logMAR, θ: eşik logMAR (bu noktada F = 0.5 → p ≈ %62)
// VARSAYIM: eğim s = 0.05 logMAR ve dikkat hatası λ = 0.02 literatürden birebir
// alınmadı; makul varsayımlardır. Simülasyon testleri doğrulama sağlar.

export const GUESS = 0.25
export const LAPSE = 0.02
export const SLOPE = 0.05

const GRID_MIN = -0.4
const GRID_MAX = 1.5
const GRID_STEP = 0.01

export function pCorrect(x, theta, slope = SLOPE) {
  const f = 1 / (1 + Math.exp(-(x - theta) / slope))
  return GUESS + (1 - GUESS - LAPSE) * f
}

// options: { priorMean, priorSd, minX, maxX }
export function createZest({ priorMean = 0.4, priorSd = 0.4, minX = -0.3, maxX = 1.3 } = {}) {
  const grid = []
  for (let t = GRID_MIN; t <= GRID_MAX + 1e-9; t += GRID_STEP) grid.push(+t.toFixed(4))
  // Normal öncül (log-olasılık olarak tutulur, sayısal kararlılık için)
  let logPost = grid.map((t) => -0.5 * ((t - priorMean) / priorSd) ** 2)
  const history = []

  function normalized() {
    const m = Math.max(...logPost)
    const w = logPost.map((l) => Math.exp(l - m))
    const sum = w.reduce((a, b) => a + b, 0)
    return w.map((v) => v / sum)
  }

  function mean() {
    const w = normalized()
    return grid.reduce((acc, t, i) => acc + t * w[i], 0)
  }

  function sd() {
    const w = normalized()
    const mu = mean()
    return Math.sqrt(grid.reduce((acc, t, i) => acc + w[i] * (t - mu) ** 2, 0))
  }

  const clamp = (x) => Math.min(maxX, Math.max(minX, x))

  return {
    // Bir sonraki gösterilecek logMAR
    next: () => clamp(mean()),
    // Cevabı işle. x: gerçekte gösterilen logMAR (piksel yuvarlaması sonrası)
    update(x, correct) {
      logPost = logPost.map((l, i) => {
        const p = pCorrect(x, grid[i])
        return l + Math.log(correct ? p : 1 - p)
      })
      history.push({ x, correct })
    },
    // Tahmin gösterilebilen aralığın dışına taşarsa sınıra kısılır ve işaretlenir
    estimate: () => {
      const m = mean()
      return {
        logMAR: clamp(m),
        sd: sd(),
        trials: history.length,
        atCeiling: m > maxX,
        atFloor: m < minX,
      }
    },
    history: () => [...history],
  }
}

// Tumbling E yönleri
export const DIRECTIONS = ['up', 'right', 'down', 'left']

export function randomDirection(rng = Math.random) {
  return DIRECTIONS[Math.floor(rng() * 4) % 4]
}

// Test planları (bkz. SENTEZ_RAPORU.md §10)
export const PLANS = {
  daily: { warmup: 3, trials: 20 },
  weekly: { warmup: 3, trials: 36 },
}
