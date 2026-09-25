// Çember takibi — göz pratiği (Göz pratikleri bölümü, Yılan'ın yanında).
// Çember ekranın kenar/köşe noktaları arasında atlar; kişi gözüyle izler. TrueDepth varsa kamera
// her atlamadan sonra gözün hedef yönüne hareket edip etmediğini ve ne kadar sürede ettiğini ölçer.
// Etiket: eğlence ve bakış kontrolü pratiği; görmeyi ölçmez, iyileştirdiği iddia edilmez.
//
// Neden yalnızca "hareket etti mi + yönü doğru mu": telefon ekranında bakış konumunun çözünürlüğü
// düşük (Build 7: ekranın sağ ve sol kenarı ARKit'le ayrılamadı). Hangi çembere bakıldığını
// tek tek söylemek güvenilir değil; atlamadan sonraki göz sıçraması (yön + zaman) ölçülebilir.
// Bu yüzden noktalar birbirinden uzak (köşeler ve kenar ortaları) ve her atlama büyük.

// Ekran noktaları: x sağ +, y yukarı + (−1..1, oyun alanına göre)
export const SPOTS = [
  { x: -0.8, y: 0.8 },
  { x: 0, y: 0.85 },
  { x: 0.8, y: 0.8 },
  { x: -0.85, y: 0 },
  { x: 0.85, y: 0 },
  { x: -0.8, y: -0.8 },
  { x: 0, y: -0.85 },
  { x: 0.8, y: -0.8 },
]
// Bir atlamada en az bu kadar yol (aynı kenarda komşu noktaya atlamasın)
export const MIN_JUMP = 1.1

// VARSAYIM: hızlar ilk sürüm içindir (tipik göz sıçraması gecikmesi ~200 ms; en hızlıda bile
// gözün hedefe varıp kelimeyi okuması için pay bırakılır).
export const SPEEDS = {
  slow: { id: 'slow', label: 'Yavaş', ms: 1600, mult: 1 },
  mid: { id: 'mid', label: 'Orta', ms: 1200, mult: 1.5 },
  fast: { id: 'fast', label: 'Hızlı', ms: 900, mult: 2 },
}
export const JUMPS = 30 // bir turdaki atlama sayısı (~27–48 sn)

// Çemberin içindeki kısa sözler: 1–3 kelime (tam cümle 1 sn'de okunmaz). Sağlık iddiası yok.
export const WORDS = [
  'Harika',
  'Devam',
  'Odaklan',
  'Çok iyi',
  'Böyle devam',
  'Nefes al',
  'Rahatla',
  'Süper',
  'Ritmi yakala',
  'Güzel gidiyor',
  'Tam isabet',
  'Odak sende',
  'Bir tane daha',
  'Sakin ol',
  'Aferin',
  'Hadi',
]

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// Sıradaki nokta: şimdikinden en az MIN_JUMP uzakta olanlardan rastgele biri
export function nextSpot(cur, rand = Math.random) {
  const pool = SPOTS.map((_, i) => i).filter((i) => cur == null || (i !== cur && dist(SPOTS[i], SPOTS[cur]) >= MIN_JUMP))
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))]
}

export function wordAt(n) {
  return WORDS[((n % WORDS.length) + WORDS.length) % WORDS.length]
}

// --- Takip algılayıcı ---------------------------------------------------------------
// Bakış örnekleri (okuyucu v: x sağ +, y yukarı +; kalibrasyonlu modelde ±20 = ekran dışı bakış).
// jump(from, to, ts): yeni deneme. Taban = atlamadan hemen önceki bakış (ortanca).
// Deneme, pencere içinde bakış tabandan en az minMove uzaklaşır ve hareketin yönü atlama yönüyle
// uyuşursa (kosinüs ≥ minCos) "takip edildi"; tepki süresi o ana kadar geçen süre.
// Pencere dolarsa "kaçtı". Atlama anında yüz/göz verisi yoksa deneme sayılmaz ("bilinmiyor").
// VARSAYIM: minMove 2 birim (ekran içi bakışın genliği cihazda doğrulanmadı), minCos 0,5 (±60°).
export const MIN_MOVE = 2
export const MIN_COS = 0.5
const BASE_MS = 250
const KEEP_MS = 2000

export function createFollowDetector({ minMove = MIN_MOVE, minCos = MIN_COS, windowMs = 800 } = {}) {
  let samples = [] // { t, x, y }
  let trial = null // { t0, d: {x,y} birim, base: {x,y} | null, rec }
  const trials = [] // { followed: bool|null, rt, mag, cos }

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b)
    const n = s.length
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
  }

  function close(followed, rt = null) {
    if (!trial) return
    trial.rec.followed = followed
    trial.rec.rt = rt
    trial = null
  }

  return {
    // v: {x,y} ya da null (yüz yok / gözler kapalı)
    push(v, ts) {
      if (v && Number.isFinite(v.x) && Number.isFinite(v.y)) {
        samples.push({ t: ts, x: v.x, y: v.y })
        const from = ts - KEEP_MS
        if (samples[0].t < from) samples = samples.filter((s) => s.t >= from)
      }
      if (!trial) return null
      const el = ts - trial.t0
      if (trial.base && v && Number.isFinite(v.x) && Number.isFinite(v.y) && el >= 0) {
        const dx = v.x - trial.base.x
        const dy = v.y - trial.base.y
        const mag = Math.hypot(dx, dy)
        const cos = mag > 0 ? (dx * trial.d.x + dy * trial.d.y) / mag : 0
        if (mag > trial.rec.mag) {
          trial.rec.mag = +mag.toFixed(2)
          trial.rec.cos = +cos.toFixed(2)
        }
        if (mag >= minMove && cos >= minCos) {
          close(true, Math.round(el))
          return 'followed'
        }
      }
      if (el > windowMs) {
        close(trial.base ? false : null)
        return trial === null ? 'done' : null
      }
      return null
    },
    // Yeni atlama. Önceki deneme hâlâ açıksa kapanır (kaçtı / bilinmiyor).
    jump(from, to, ts) {
      if (trial) close(trial.base ? false : null)
      const a = SPOTS[from]
      const b = SPOTS[to]
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const recent = samples.filter((s) => s.t >= ts - BASE_MS && s.t <= ts)
      const base = recent.length >= 2 ? { x: median(recent.map((s) => s.x)), y: median(recent.map((s) => s.y)) } : null
      const rec = { followed: null, rt: null, mag: 0, cos: 0 }
      trials.push(rec)
      trial = { t0: ts, d: { x: (b.x - a.x) / len, y: (b.y - a.y) / len }, base, rec }
    },
    finish() {
      if (trial) close(trial.base ? false : null)
      return summarizeTrials(trials)
    },
    get trials() {
      return trials
    },
  }
}

// Özet: takip edilen / ölçülebilen deneme, oran (%), ortanca tepki (ms)
export function summarizeTrials(trials) {
  const known = trials.filter((t) => t.followed !== null)
  const hit = known.filter((t) => t.followed)
  const rts = hit.map((t) => t.rt).filter(Number.isFinite).sort((a, b) => a - b)
  const n = rts.length
  return {
    total: trials.length,
    measured: known.length,
    followed: hit.length,
    pct: known.length ? Math.round((hit.length / known.length) * 100) : null,
    reactMs: n ? Math.round(n % 2 ? rts[(n - 1) / 2] : (rts[n / 2 - 1] + rts[n / 2]) / 2) : null,
  }
}

// Puan: takip edilen atlama × hız çarpanı. Ölçülemeyen tur (kamera yok) → null.
export function scoreOf(summary, speedId) {
  if (!summary || !summary.measured) return null
  const mult = SPEEDS[speedId]?.mult ?? 1
  return Math.round(summary.followed * mult)
}

// Ekrana bakmıyor mu? Okuyucu çıktısından (createGazeReader().push). Kalibrasyon v2'de ekran dışı
// bakış ≈ ±20; ekran içinde gezinen bakış (köşeler dahil) bunun çok altında kalmalı.
// VARSAYIM: yan/üst 12, alt 15 (aşağıda göz kapağı iner, değer oynak). null = bilinmiyor.
export const OFF_SIDE = 12
export const OFF_UP = 12
export const OFF_DOWN = 15
export function offScreen(g) {
  if (!g || !g.calibrated || !g.tracked || g.closed || !g.v) return null
  const { x, y } = g.v
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return Math.abs(x) > OFF_SIDE || y > OFF_UP || y < -OFF_DOWN
}

// Rekor (cihazda) ve seçenekler
export const TRACK_BEST_KEY = 'gozolcum:track-best'
export const TRACK_OPTS_KEY = 'gozolcum:track-opts'
const store = (s) => s ?? globalThis.localStorage

export function loadTrackBest(storage) {
  try {
    const v = Number(store(storage)?.getItem(TRACK_BEST_KEY))
    return Number.isFinite(v) && v > 0 ? v : 0
  } catch {
    return 0
  }
}
export function saveTrackBest(score, storage) {
  const prev = loadTrackBest(storage)
  if (!Number.isFinite(score) || score <= prev) return prev
  try {
    store(storage)?.setItem(TRACK_BEST_KEY, String(score))
  } catch {
    // yoksay
  }
  return score
}
export function trackBestFromSessions(sessions = []) {
  const v = sessions.filter((s) => s.type === 'game' && s.game === 'track').flatMap((s) => [s.score, s.best]).filter((x) => Number.isFinite(x))
  return v.length ? Math.max(...v) : 0
}
export function loadTrackSpeed(storage) {
  try {
    const v = JSON.parse(store(storage)?.getItem(TRACK_OPTS_KEY) ?? 'null')?.speed
    return SPEEDS[v] ? v : 'mid'
  } catch {
    return 'mid'
  }
}
export function saveTrackSpeed(speed, storage) {
  try {
    store(storage)?.setItem(TRACK_OPTS_KEY, JSON.stringify({ speed }))
  } catch {
    // yoksay
  }
}
