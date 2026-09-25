// Çemberler (eski adı Çember takibi) — göz pratiği (Göz pratikleri bölümü, Yılan'ın yanında).
// v2 (Build 26, onaylı taslak "EyeTrail Çemberler"): gece göğünde elips üstünde mercek düğümleri,
// aralarında yıldız çokgeni kenarları. Diyafram halkası kenarlar boyunca sıçrar (Sıçra) ya da süzülür
// (Süzül); kişi gözüyle izler. TrueDepth varsa kamera, gözün hedef yönüne geçip geçmediğine bakar.
// Etiket: oyun ve pratik; görmeyi ölçmez, iyileştirdiği iddia edilmez.
//
// Neden yalnızca "hareket etti mi + yönü doğru mu" (Katman A): telefon ekranında bakış konumunun
// çözünürlüğü düşük (Build 7: ekranın sağ ve sol kenarı ARKit'le ayrılamadı; Build 16: sol–sağ ayrımı
// camX'te 0,38°). Hangi merceğe bakıldığını tek tek söylemek güvenilir değil; hareketten sonraki göz
// sıçraması (yön + zaman) ölçülebilir. Bu yüzden kenarlar uzun ve çoğu dikey bileşenli.
// TODO(Katman B, §11 bakış motoru — Build 25 onaylanırsa): bakış → ekran noktası (toGaze'in tersi) +
// varış bölgesi R içinde 200 ms bekleme. Kanca: createFollowDetector.jumpTo ile aynı imzada bir
// createArrivalDetector yazılıp TrackGame'de detektör yerine takılır. Şimdilik yapılmadı.

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

// --- Takip algılayıcı (Katman A) ------------------------------------------------------
// Bakış örnekleri (okuyucu v: x sağ +, y yukarı +; kalibrasyonlu modelde ±20 = kalibrasyon kenar noktası).
// jump(from, to, ts): SPOTS indeksleriyle yeni deneme (eski oyun). jumpTo(fromPt, toPt, ts, { windowMs }):
// ekran noktalarıyla (yüzde; x sağa, y AŞAĞI) yeni deneme; yön bakış birimine çevrilerek hesaplanır
// (toGaze). Taban = hareketten hemen önceki bakış (ortanca).
// Deneme, pencere içinde bakış tabandan en az minMove uzaklaşır ve hareketin yönü hedef yönüyle
// uyuşursa (kosinüs ≥ minCos) "takip edildi"; tepki süresi o ana kadar geçen süre.
// Pencere dolarsa "kaçtı". Hareket anında yüz/göz verisi yoksa deneme sayılmaz ("bilinmiyor").
// cancel(): açık deneme sayılmaz (duraklatma). Katman A "vardın" demez; yalnızca doğru yöne geçişi bilir.
// VARSAYIM: minMove 2 birim (ekran içi bakışın genliği cihazda doğrulanmadı), minCos 0,5 (±60°).
export const MIN_MOVE = 2
export const MIN_COS = 0.5
const BASE_MS = 250
const KEEP_MS = 2000

export function createFollowDetector({ minMove = MIN_MOVE, minCos = MIN_COS, windowMs = 800 } = {}) {
  let samples = [] // { t, x, y }
  let trial = null // { t0, d: {x,y} birim, base: {x,y} | null, rec, windowMs }
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

  // Yeni deneme: d = beklenen bakış yönü (bakış biriminde, y yukarı +)
  function open(dx, dy, ts, win) {
    if (trial) close(trial.base ? false : null)
    const len = Math.hypot(dx, dy) || 1
    const recent = samples.filter((s) => s.t >= ts - BASE_MS && s.t <= ts)
    const base = recent.length >= 2 ? { x: median(recent.map((s) => s.x)), y: median(recent.map((s) => s.y)) } : null
    const rec = { followed: null, rt: null, mag: 0, cos: 0 }
    trials.push(rec)
    trial = { t0: ts, d: { x: dx / len, y: dy / len }, base, rec, windowMs: Number.isFinite(win) && win > 0 ? win : windowMs }
    return rec
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
      if (el > trial.windowMs) {
        close(trial.base ? false : null)
        return trial === null ? 'done' : null
      }
      return null
    },
    // Yeni atlama (SPOTS indeksleri, y yukarı +). Önceki deneme hâlâ açıksa kapanır (kaçtı / bilinmiyor).
    jump(from, to, ts) {
      const a = SPOTS[from]
      const b = SPOTS[to]
      return open(b.x - a.x, b.y - a.y, ts)
    },
    // Yeni hareket (ekran noktaları, yüzde; y aşağı +). opts.windowMs bu deneme için pencere (Süzül'de kenar süresi).
    jumpTo(fromPt, toPt, ts, opts = {}) {
      const a = toGaze(fromPt)
      const b = toGaze(toPt)
      return open(b.x - a.x, b.y - a.y, ts, opts.windowMs)
    },
    // Açık deneme sayılmaz (duraklatma: dönüşteki adım ölçüme girmez)
    cancel() {
      if (!trial) return
      trial.rec.paused = true
      close(null)
    },
    get open() {
      return trial != null
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
// v birimi: kalibrasyon hedefi = ekran kenarı = ±GAZE_FULL_DEG (20). Kenarın 1,3 katı ötesi "dışarı";
// aşağıda pay daha geniş (göz kapağı iner, sinyal aşağıda kayar). VARSAYIM: cihazda ayarlanacak.
export const OFF_SIDE = 26
export const OFF_UP = 26
export const OFF_DOWN = 30
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
  saveTrackOpts({ speed }, storage)
}
// Çemberler seçenekleri: { speed, level, mode } (aynı anahtar; eski { speed } kaydı okunur)
export function loadTrackOpts(storage) {
  let o = null
  try {
    o = JSON.parse(store(storage)?.getItem(TRACK_OPTS_KEY) ?? 'null')
  } catch {
    o = null
  }
  const level = LEVELS[o?.level] ? Number(o.level) : 1
  const mode = MODES.includes(o?.mode) ? o.mode : 'jump'
  return { speed: SPEEDS[o?.speed] ? o.speed : 'mid', level, mode }
}
export function saveTrackOpts(patch, storage) {
  try {
    let cur = {}
    try {
      cur = JSON.parse(store(storage)?.getItem(TRACK_OPTS_KEY) ?? 'null') ?? {}
    } catch {
      cur = {}
    }
    store(storage)?.setItem(TRACK_OPTS_KEY, JSON.stringify({ ...cur, ...patch }))
  } catch {
    // yoksay
  }
}

// --- Çemberler: mercek ağı ------------------------------------------------------------
// Ekran noktaları yüzde (0–100; x sağa, y AŞAĞI), oyun alanının tamamına (tam ekran) göre.
// Elips merkezi (50, 46) = kalibrasyonun orta noktası (GazeCalibration.jsx POS.center). Bütün mercekler
// kalibrasyon kutusunun içinde (sol 8, sağ 92, üst 12, alt 84): bakıştan ekrana eşleme dışa taşmaz.
export const ROUND_MS = 60000 // VARSAYIM: 60 sn oyun (+ 3 × 800 ms geri sayım); 5 dk bütçeye ~3 tur
export const ELLIPSE = { cx: 50, cy: 46, rx: 33, ry: 26.5 } // rx: genişliğin %33'ü, ry: yüksekliğin %26,5'i
export const CAL_BOX = { left: 8, right: 92, top: 12, bottom: 84, cx: 50, cy: 46 }
export const MODES = ['jump', 'glide']
export const MODE_LABEL = { jump: 'Sıçra', glide: 'Süzül' }
// Seviyeler: n mercek elipste, k yıldız adımı ({5/2}, {7/3}); Seviye 3'te merkez + iris lifleri, halka yok.
// ms = Sıçra adım aralığı (SPEEDS: 1600 / 1200 / 900), speed = puan çarpanı için hız kimliği.
export const LEVELS = {
  1: { id: 1, n: 5, k: 2, ring: true, centre: false, ms: SPEEDS.slow.ms, speed: 'slow', label: '5 mercek', modes: ['jump'] },
  2: { id: 2, n: 7, k: 3, ring: true, centre: false, ms: SPEEDS.mid.ms, speed: 'mid', label: '7 mercek', modes: ['jump', 'glide'] },
  3: { id: 3, n: 7, k: 3, ring: false, centre: true, ms: SPEEDS.fast.ms, speed: 'fast', label: 'göz bebeği', modes: ['jump', 'glide'] },
}
// VARSAYIM: Süzül sabit 300 pt/sn (35 cm'de ~9°/sn), her mercekte 600 ms durak.
export const GLIDE_PT_S = 300
export const GLIDE_STOP_MS = 600
// VARSAYIM: Sıçra penceresi min(aralık − 100, 1200) ms (eski oyun min(900, ms − 100)).
export const jumpWindowMs = (ms) => Math.max(300, Math.min(ms - 100, 1200))
// VARSAYIM: Süzül penceresi = kenar süresi + durağın ilk 500 ms'si (yalnızca yön sayılır, süre yok).
export const glideWindowMs = (edgeMs) => Math.round(edgeMs + 500)
export const glideMs = (lenPt) => Math.max(300, Math.round((lenPt / GLIDE_PT_S) * 1000))

export function layoutGraph(level) {
  const L = LEVELS[level] ?? LEVELS[1]
  const pts = []
  for (let i = 0; i < L.n; i++) {
    const a = ((-90 + (i * 360) / L.n) * Math.PI) / 180
    pts.push({ x: ELLIPSE.cx + ELLIPSE.rx * Math.cos(a), y: ELLIPSE.cy + ELLIPSE.ry * Math.sin(a) })
  }
  if (L.centre) pts.push({ x: ELLIPSE.cx, y: ELLIPSE.cy })
  const edges = []
  for (let i = 0; i < L.n; i++) {
    if (L.ring) edges.push([i, (i + 1) % L.n, 'ring'])
    edges.push([i, (i + L.k) % L.n, 'star'])
    if (L.centre) edges.push([i, L.n, 'spoke'])
  }
  return { level: L.id, pts, edges }
}
export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)
export function neighbours(G, i) {
  const out = []
  for (const [a, b] of G.edges) {
    if (a === i) out.push(b)
    else if (b === i) out.push(a)
  }
  return out
}
// VARSAYIM: sonraki hedef şu anki merceğin komşularından rastgele biri, bir önceki hariç (sıra tahmin edilemez)
export function nextNode(G, cur, prev = null, rand = Math.random) {
  let pool = neighbours(G, cur).filter((n) => n !== prev)
  if (!pool.length) pool = neighbours(G, cur)
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))]
}

// Ekran noktası (yüzde) → beklenen bakış (v birimi, x sağ +, y yukarı +; kalibrasyon kenarı = ±20).
// VARSAYIM: kalibrasyon hedeflerinden parçalı doğrusal (sol/sağ %8/%92, üst/alt %12/%84); cihazda doğrulanmadı.
export function toGaze(pt) {
  const x = ((pt.x - CAL_BOX.cx) / (CAL_BOX.right - CAL_BOX.cx)) * 20
  const dy = CAL_BOX.cy - pt.y
  const y = (dy / (dy >= 0 ? CAL_BOX.cy - CAL_BOX.top : CAL_BOX.bottom - CAL_BOX.cy)) * 20
  return { x, y }
}

const medianOf = (arr) => {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b)
  const n = s.length
  return n ? Math.round(n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null
}

// Tur özeti. steps: [{ kind: 'jump'|'glide', res: 'hit'|'miss'|'u'|'none', ms }]
//   hit = doğru yöne geçiş (varış), miss = pencere doldu, u = ölçülmedi (veri yok / duraklatma), none = ritim (kamera yok)
// İsabet % = varış ÷ ölçülen; ortanca varış yalnızca Sıçra adımlarından; en uzun seri = art arda varış.
// VARSAYIM: ölçülmeyen adım seriyi bozmaz, yalnızca kaçış bozar.
export function summarizeSteps(steps = []) {
  let measured = 0
  let arrived = 0
  let run = 0
  let streak = 0
  const ms = []
  for (const s of steps) {
    if (s.res === 'hit') {
      measured++
      arrived++
      run++
      streak = Math.max(streak, run)
      if (s.kind === 'jump' && Number.isFinite(s.ms)) ms.push(s.ms)
    } else if (s.res === 'miss') {
      measured++
      run = 0
    }
  }
  return { steps: steps.length, measured, arrived, pct: measured ? Math.round((arrived / measured) * 100) : null, arriveMs: medianOf(ms), streak }
}

// Puan (geriye uyum): varış × seviyenin hız çarpanı. Ölçülmeyen tur → null.
export const levelScore = (sum, level) => scoreOf({ measured: sum.measured, followed: sum.arrived }, (LEVELS[level] ?? LEVELS[1]).speed)

// Kayıt v2. Eski alanlar (speed, followPct, reactMs) geriye uyum için tekrar yazılır.
export function makeTrackRecord({ level, mode, sum, measured, seconds, score = null, best = null }) {
  const L = LEVELS[level] ?? LEVELS[1]
  const m = Boolean(measured)
  return {
    type: 'game',
    game: 'track',
    v: 2,
    mode: MODES.includes(mode) ? mode : 'jump',
    level: L.id,
    speed: L.speed,
    steps: sum.steps,
    measured: m ? sum.measured : 0,
    arrived: m ? sum.arrived : null,
    pct: m ? sum.pct : null,
    arriveMs: m ? sum.arriveMs : null,
    streak: m ? sum.streak : null,
    score: m ? score : null,
    best: best || null,
    seconds,
    control: m ? 'eyes' : null,
    followPct: m ? sum.pct : null,
    reactMs: m ? sum.arriveMs : null,
  }
}

const isTrackRec = (s) => s?.type === 'game' && s?.game === 'track'
// İsabet/takip yüzdesi: v2 pct, v1 followPct
export const trackPct = (s) => (Number.isFinite(s?.pct) ? s.pct : Number.isFinite(s?.followPct) ? s.followPct : null)

// Süzül ilk Sıçra turundan sonra açılır (eski v1 turları da Sıçra sayılır)
export const glideUnlocked = (sessions = []) => sessions.some((s) => isTrackRec(s) && (s.v !== 2 || s.mode === 'jump'))

// Seviye önerisi (zorlanmaz). VARSAYIM: aynı seviyede son iki ölçülen tur ≥ %80 → sonraki; son tur < %50 → önceki.
export function levelAdvice(records = [], level) {
  const own = records.filter((s) => isTrackRec(s) && s.v === 2 && s.level === level && Number.isFinite(s.pct))
  const last = own.at(-1)
  if (!last) return null
  const prev = own.at(-2)
  if (level < 3 && prev && last.pct >= 80 && prev.pct >= 80) return { to: level + 1, up: true }
  if (level > 1 && last.pct < 50) return { to: level - 1, up: false }
  return null
}

// Kişisel çizgi: son 7 günün ortanca varışı. VARSAYIM: yalnızca ≥ 3 ölçülen Sıçra turu varsa.
export function weekArriveMs(records = [], now = new Date(), days = 7) {
  const since = new Date(now).getTime() - days * 86400000
  const v = records
    .filter((s) => isTrackRec(s) && s.v === 2 && Number.isFinite(s.arriveMs) && new Date(s.date ?? now).getTime() >= since)
    .map((s) => s.arriveMs)
  return v.length >= 3 ? medianOf(v) : null
}
