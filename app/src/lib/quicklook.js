// Hızlı Bakış (UFOV tarzı bölünmüş dikkat pratiği) — saf motor; ekran: screens/QuickLook.jsx.
// Deneme: odak noktası → ortada araba/kamyon + kenarda 8 yönden birinde yıldız (N kare) → maske → iki cevap.
// İkisi de doğruysa deneme doğru. Süre uyarlanır basamakla (N-aşağı 1-yukarı) kısalır/uzar; eşik = son
// dönüşlerin ölçülen süre ortalaması. Süreler KARE cinsinden tanımlanır, ekranda ölçülen gerçek süre kaydedilir
// (docs/arastirma/ajan-raporlari/08_olcum_ek.md §4 ve öneri 18: "34 ms değil 2 kare @60 Hz; düşen kare loglansın").
// Görev sabitleri: docs/arastirma/ajan-raporlari/20_hizli_bakis_parametre.md (bkz. PARAMS açıklamaları).
// İddia sınırı (SENTEZ_RAPORU §13): "görevdeki hızın artar" ✅; beyin sağlığı / sürüş güvenliği ❌.

export const SESSION_TYPE = 'quick-look'
export const FRAME_MS = 1000 / 60

// Görev sabitleri: docs/arastirma/ajan-raporlari/20_hizli_bakis_parametre.md §6 (satır numaraları #).
export const PARAMS = {
  startFrames: 30, // #4 500 ms (UFOV üst sınırı; Aust 2016)
  minFrames: 6, // #5 100 ms taban: WKWebView'de 100 ms altı güvenilir değil (rapor 08; Pronk 2020) — VARSAYIM
  maxFrames: 30,
  bigStep: 4, // #6 ilk 2 dönüşe kadar 4 kare, sonra 1 kare (Hutchinson 2013; Seiple 2001) — sayılar VARSAYIM
  smallStep: 1,
  switchAfterReversals: 2,
  down: 2, // #6 2-aşağı 1-yukarı
  up: 1,
  trials: 50, // #16 ≈50 deneme, 3–5 dk (VIPS)
  easyEvery: 8, // #16 her 8. deneme kolay (eşiğin 3 katı); basamağa sayılmaz
  reversalsForThreshold: 6, // #6 eşik = son 6 dönüş
  maskFrames: 30, // #13 maske 500 ms (VIPS), ortalama parlaklık zeminle eşit, çizgisiz
  fixationMs: 600, // VARSAYIM
  itiMs: 900, // #15 deneme arası ≥ 500 ms; yanıt kişinin hızında → flaş < 0,4 Hz (Harding 2005 < 3 Hz)
  positions: 8, // #9
  centerDeg: 1.9, // #11 merkez hedef 1,9 × 1,4° (Aust 2016)
  starDeg: 1.4, // VARSAYIM (kenar hedef merkezle benzer boyut)
  eccTargetDeg: 5.5, // #10 telefonda 8 yön için en fazla ≈5,5° (tablette 10°); ekrana sığmazsa sığan en büyük
  distanceMm: 350, // #12 "yaklaşık 35 cm" yönergesi (kamera yoksa açı hesabı bununla)
  levels: { 1: 0, 2: 7, 3: 23 }, // #8 çeldirici: 0 → 7 (yakın halka) → 23 (3 halka; telefonda en fazla, VARSAYIM)
  levelUpSessions: 2, // VARSAYIM: 2 oturum üst üste eşik tabana yakınsa (≤ 7 kare) bir sonraki seviye
}
export const CENTER_KINDS = ['car', 'truck']
export const DIR_LABELS = ['Sağ', 'Sağ üst', 'Üst', 'Sol üst', 'Sol', 'Sol alt', 'Alt', 'Sağ alt'] // 0 = sağ, saat yönü tersine 45° (#9: 8 eşit aralıklı yön)
export const PROGRAM_HOURS = 10 // ACTIVE / IHAMS toplam dozu ≈ 10 saat (rapor 14 §2, rapor 20 #17). Düşük günlük dozun etkisi bilinmiyor.

export const framesToMs = (n) => n * FRAME_MS
export const msLabel = (ms) => `${Math.round(ms)} ms`

// Tohumlu rastgele (testler ve tekrar üretilebilir oturum)
export function rng(seed = Date.now()) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeTrial(rand = Math.random, { level = 1 } = {}) {
  return {
    center: CENTER_KINDS[Math.floor(rand() * CENTER_KINDS.length)],
    pos: Math.floor(rand() * PARAMS.positions),
    distractors: PARAMS.levels[level] ?? 0,
  }
}

// Çeldirici konumları: seviye 2 → yakın halkada 7 (hedefin yönü boş), seviye 3 → 3 halkada 23 (hedef yeri boş)
export function distractorSlots(trial) {
  const n = trial?.distractors ?? 0
  if (!n) return []
  const rings = n <= PARAMS.positions ? [1] : [1, 2, 3]
  const out = []
  for (const ring of rings) {
    for (let pos = 0; pos < PARAMS.positions; pos++) {
      if (pos === trial.pos && (rings.length === 1 || ring === 3)) continue
      out.push({ pos, ring, of: rings.length === 1 ? 2 : 3 })
    }
  }
  return out.slice(0, n)
}

// Uyarlanır basamak (kare sayısı üzerinde): N-aşağı 1-yukarı; ilk dönüşlere kadar büyük adım, sonra küçük.
// push(correct, measuredMs) → sıradaki kare sayısı.
export function createStaircase({
  start = PARAMS.startFrames, min = PARAMS.minFrames, max = PARAMS.maxFrames,
  down = PARAMS.down, up = PARAMS.up, bigStep = PARAMS.bigStep, smallStep = PARAMS.smallStep, switchAfter = PARAMS.switchAfterReversals,
} = {}) {
  let f = Math.max(min, Math.min(max, start))
  let streak = 0
  let lastDir = 0 // -1 kısaldı, +1 uzadı
  const reversals = [] // { ms }
  const history = []
  const stepNow = () => (reversals.length < switchAfter ? bigStep : smallStep)
  return {
    get frames() {
      return f
    },
    push(correct, measuredMs = framesToMs(f)) {
      history.push({ frames: f, ms: measuredMs, correct })
      let dir = 0
      if (correct) {
        streak += 1
        if (streak >= down) {
          streak = 0
          if (f > min) {
            f = Math.max(min, f - stepNow())
            dir = -1
          }
        }
      } else {
        streak = 0
        if (f < max) {
          f = Math.min(max, f + stepNow() * up)
          dir = 1
        }
      }
      if (dir !== 0) {
        if (lastDir !== 0 && dir !== lastDir) reversals.push({ ms: measuredMs })
        lastDir = dir
      }
      return f
    },
    get reversals() {
      return reversals.slice()
    },
    get history() {
      return history.slice()
    },
  }
}
// Kolay deneme (her easyEvery.'si): eşiğin 3 katı kare, en fazla maxFrames (rapor 20 #16)
export const isEasyTrial = (n) => PARAMS.easyEvery > 0 && n > 0 && (n + 1) % PARAMS.easyEvery === 0
export const easyFrames = (frames) => Math.min(PARAMS.maxFrames, frames * 3)

// Eşik: son K dönüşün ortalaması; dönüş azsa son 6 denemenin ortalaması (VARSAYIM).
export function thresholdOf(history = [], reversals = [], k = PARAMS.reversalsForThreshold) {
  if (reversals.length >= 2) {
    const last = reversals.slice(-k)
    return last.reduce((s, r) => s + r.ms, 0) / last.length
  }
  const tail = history.slice(-6)
  return tail.length ? tail.reduce((s, h) => s + h.ms, 0) / tail.length : null
}

// Ekranda ölçülen süreler: istenen kare sayısına göre sapma ve düşen kare sayısı
export function timingQuality(history = []) {
  let dropped = 0
  for (const h of history) {
    const expected = framesToMs(h.frames)
    if (h.ms > expected + FRAME_MS * 0.5) dropped += Math.round((h.ms - expected) / FRAME_MS)
  }
  return { dropped, trials: history.length }
}

// Kenar hedefin ekrandaki konumu (merkezden px) ve ulaşılan açısal uzaklık (derece).
// radiusPx: ekrana sığan en büyük yarıçap; mm/px ve göz–ekran mesafesi biliniyorsa derece hesaplanır.
export function peripheralOffset(pos, radiusPx) {
  const a = (pos * Math.PI * 2) / PARAMS.positions
  return { x: Math.cos(a) * radiusPx, y: -Math.sin(a) * radiusPx }
}
export function eccentricityDeg(radiusPx, pxPerMm, distanceMm) {
  if (!(radiusPx > 0 && pxPerMm > 0 && distanceMm > 0)) return null
  return (Math.atan(radiusPx / pxPerMm / distanceMm) * 180) / Math.PI
}

export function makeRecord({ history, reversals, seconds, level = 1, eccDeg = null, distanceMm = null }) {
  const threshold = thresholdOf(history, reversals)
  const correct = history.filter((h) => h.correct).length
  const q = timingQuality(history)
  return {
    type: SESSION_TYPE,
    threshold: threshold == null ? null : Math.round(threshold),
    accuracy: history.length ? Math.round((correct / history.length) * 100) : null,
    trials: history.length,
    level,
    dropped: q.dropped,
    eccDeg: eccDeg == null ? null : +eccDeg.toFixed(1),
    distanceMm: distanceMm == null ? null : Math.round(distanceMm),
    seconds: Math.round(seconds),
  }
}

export const isQuickLook = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.threshold)

// Program ilerlemesi (saat) ve seviye önerisi
export function programHours(sessions = []) {
  const sec = sessions.filter((s) => s?.type === SESSION_TYPE).reduce((m, s) => m + (Number.isFinite(s.seconds) ? s.seconds : 0), 0)
  return sec / 3600
}
export function nextLevel(sessions = []) {
  const qs = sessions.filter(isQuickLook)
  const cur = qs.at(-1)?.level ?? 1
  const near = framesToMs(PARAMS.minFrames + 1) + FRAME_MS / 2 // tabana yakın: ≤ 7 kare
  const last = qs.filter((s) => (s.level ?? 1) === cur).slice(-PARAMS.levelUpSessions)
  if (cur < 3 && last.length === PARAMS.levelUpSessions && last.every((s) => s.threshold <= near)) return cur + 1
  return cur
}
export function firstAndBest(sessions = []) {
  const qs = sessions.filter(isQuickLook)
  if (!qs.length) return { first: null, last: null, best: null, n: 0 }
  return { first: qs[0].threshold, last: qs.at(-1).threshold, best: Math.min(...qs.map((s) => s.threshold)), n: qs.length }
}
