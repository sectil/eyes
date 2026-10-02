// Yılan'a özel bakış: kendi ayarı, kendi okuyucusu, kendi yön kararı. React/DOM yok; saf ve testli.
//
// Neden ayrı (docs/yol-haritasi/tasarim/yilan/TESHIS_VE_PLAN.md):
//  - Sistem kalibrasyonu ekran kenarındaki noktalarla kurulur; Yılan'ın eşiği o birimde tahtanın İÇİNE düşüyordu
//    (225 hücrenin 134'üne bakmak komuttu). Yılan ayarı oyunun kendi düzeninde ölçülür: ±1 = tahtanın dışındaki
//    yön kapıları, tahtanın içi asla komut değildir.
//  - Ayrı kayıt (SNAKE_GAZE_KEY). Sistem anahtarlarına (gozolcum:gaze-model-v1, gozolcum:gaze-flip) yazılmaz;
//    gazeCalib.js'ten yalnız saf hesap fonksiyonları okunur.
//
// Zincir: kare → okuyucu (applyModel + One Euro, oyun içi kayma düzeltmesi) → yön kararı (göz sıçraması ayıklama,
// kısa ortanca, kapı bölgesi + histerezis, köşe ölü bölgesi, bekleme, komut sonrası kısa kilit).
// VARSAYIM: aşağıdaki sabitler sentetik testle seçildi (snakeGaze.test.js); cihazda doğrulanacak.

import { applyModel, createOneEuro, fitModel, roughModel, median } from './gazeCalib.js'

export const SNAKE_GAZE_KEY = 'gozolcum:snake-gaze-v1'
export const SNAKE_GAZE_VERSION = 1
export const SNAKE_TARGETS = ['center', 'right', 'up', 'left', 'down', 'center2']

// --- Kayıt ---------------------------------------------------------------------------------
function store(storage) {
  try {
    return storage === undefined ? globalThis.localStorage ?? null : storage
  } catch {
    return null
  }
}

const finite = (v) => Number.isFinite(v)
const validAxis = (a) => a && typeof a.feature === 'string' && finite(a.c) && finite(a.neg) && finite(a.pos) && (a.neg - a.c) * (a.pos - a.c) < 0
const validEdge = (e) => e && ['left', 'right', 'up', 'down'].every((k) => finite(e[k]) && e[k] > 0 && e[k] < 1)

export function loadSnakeGaze(storage) {
  try {
    const m = JSON.parse(store(storage)?.getItem(SNAKE_GAZE_KEY) ?? 'null')
    if (!m || m.version !== SNAKE_GAZE_VERSION || !validAxis(m.x) || !validAxis(m.y) || !validEdge(m.edge)) return null
    return m
  } catch {
    return null
  }
}

export function saveSnakeGaze(cal, storage) {
  try {
    const st = store(storage)
    if (!st) return false
    st.setItem(SNAKE_GAZE_KEY, JSON.stringify({ ...cal, version: SNAKE_GAZE_VERSION }))
    return true
  } catch {
    return false
  }
}

// --- Düzen ---------------------------------------------------------------------------------
// Tahta kenarının kapıya oranı (her yön için): 0.75 = tahta kenarı, merkezden kapıya olan yolun %75'inde.
// rects: { board, left, right, up, down } — her biri { x, y, w, h } (ekran pikseli; kapılar kapı kutuları).
export function edgeFromRects(rects) {
  const b = rects?.board
  if (!b) return null
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  const mid = (r) => (r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null)
  const g = { left: mid(rects.left), right: mid(rects.right), up: mid(rects.up), down: mid(rects.down) }
  if (!g.left || !g.right || !g.up || !g.down) return null
  const e = {
    right: b.w / 2 / (g.right.x - cx),
    left: b.w / 2 / (cx - g.left.x),
    up: b.h / 2 / (cy - g.up.y),
    down: b.h / 2 / (g.down.y - cy),
  }
  return validEdge(e) ? e : null
}

// Tahtadaki bir hücrenin normalleştirilmiş konumu (±1 = kapı). y yukarı pozitif.
export function cellToUnit(cell, cols, rows, edge) {
  const fx = ((cell.x + 0.5) / cols) * 2 - 1 // -1 sol kenar, +1 sağ kenar
  const fy = 1 - ((cell.y + 0.5) / rows) * 2 // +1 üst kenar
  return { x: fx * (fx >= 0 ? edge.right : edge.left), y: fy * (fy >= 0 ? edge.up : edge.down) }
}

// --- Ayar ----------------------------------------------------------------------------------
// windows: { center, right, up, left, down, center2 } kare dizileri (gazeCalib.fitModel ile aynı biçim).
// Döner: { ok, cal?, rough?, report } — cal kaydedilecek ayar.
export function fitSnakeGaze(windows, edge) {
  const m = fitModel(windows)
  const use = m.ok ? m : roughModel(m)
  const report = { x: m.x ? { feature: m.x.feature, score: +m.x.score.toFixed(2) } : null, y: m.y ? { feature: m.y.feature, score: +m.y.score.toFixed(2) } : null }
  if (!use || !validEdge(edge)) return { ok: false, report }
  const cal = { version: SNAKE_GAZE_VERSION, x: use.x, y: use.y, closeAt: use.closeAt, edge, rough: Boolean(use.rough), date: new Date().toISOString() }
  return { ok: true, cal, rough: cal.rough, report }
}

// --- Okuyucu -------------------------------------------------------------------------------
// Oyun içi kayma düzeltmesi: yem yenince bakışın o an yeme (başa) yakın olduğu varsayılır.
// VARSAYIM: adım payı %25, toplam en çok 0,3 birim; yalnız sabit ve tahtanın içindeki bakışla.
export const DRIFT_GAIN = 0.25
export const DRIFT_MAX = 0.3

export function createSnakeReader(cal) {
  const fx = createOneEuro()
  const fy = createOneEuro()
  let drift = { x: 0, y: 0 }
  const closeAt = finite(cal?.closeAt) ? cal.closeAt : 0.5
  return {
    // Döner: { tracked, closed, u: {x,y} | null } — u: ±1 = kapı, y yukarı pozitif
    push(f = {}) {
      const ts = finite(f.ts) ? f.ts : Date.now()
      if ((f.face ?? f.tracked) === false) {
        fx.reset()
        fy.reset()
        return { tracked: false, closed: false, u: null, ts }
      }
      const closure = ((f.blinkLeft ?? 0) + (f.blinkRight ?? 0)) / 2
      if (closure >= closeAt) return { tracked: true, closed: true, u: null, ts }
      const r = applyModel(cal, f)
      if (!r || !finite(r.x) || !finite(r.y)) return { tracked: true, closed: false, u: null, ts }
      const u = { x: fx.push(r.x, ts) - drift.x, y: fy.push(r.y, ts) - drift.y }
      return { tracked: true, closed: false, u, ts }
    },
    // observed: o anki bakış (u), expected: yemin konumu (cellToUnit). Döner: uygulandı mı
    nudge(observed, expected) {
      if (!observed || !expected) return false
      const dx = observed.x - expected.x
      const dy = observed.y - expected.y
      if (Math.hypot(dx, dy) > 0.6) return false // çok uzak: kişi başka yere bakıyordu
      const clamp = (v) => Math.max(-DRIFT_MAX, Math.min(DRIFT_MAX, v))
      drift = { x: clamp(drift.x + DRIFT_GAIN * dx), y: clamp(drift.y + DRIFT_GAIN * dy) }
      return true
    },
    get drift() {
      return { ...drift }
    },
    reset() {
      fx.reset()
      fy.reset()
    },
  }
}

// --- Yön kararı ----------------------------------------------------------------------------
// VARSAYIM (sentetik testle seçildi, cihazda doğrulanacak):
export const STEER_DWELL_MS = 200 // kapı bölgesinde bu kadar kalınca komut
export const STEER_LOCK_MS = 320 // komuttan sonra yeni komut yok (süreyle açılır; ortaya dönmeye bağlı DEĞİL: Bug 16)
export const STEER_WINDOW_MS = 100 // karar, son bu kadarlık ortancadan
export const STEER_SACCADE_UPS = 6 // birim/sn üstü hız = göz sıçraması, o karede karar ilerlemez
export const STEER_ENTER = 0.4 // kapı bölgesine giriş: tahta kenarından kapıya yolun bu oranı
export const STEER_EXIT = 0.1 // bölgeden çıkış (histerezis)
export const STEER_CORNER_RATIO = 1.6 // iki eksen birden dışarıdaysa baskın eksen bu kadar baskın olmalı

const DIR_AXIS = { right: ['x', 1], left: ['x', -1], up: ['y', 1], down: ['y', -1] }

// Bir eksende kenarın ötesine ne kadar çıkıldı (0 = kenarda, 1 = kapıda); içerideyse negatif
function beyond(u, edge, d) {
  const [ax, s] = DIR_AXIS[d]
  const v = u[ax] * s
  return (v - edge[d]) / (1 - edge[d])
}

export function zoneOf(u, edge, cur = null, { enter = STEER_ENTER, exit = STEER_EXIT, cornerRatio = STEER_CORNER_RATIO } = {}) {
  if (!u) return null
  const hx = u.x >= 0 ? 'right' : 'left'
  const vy = u.y >= 0 ? 'up' : 'down'
  const bx = beyond(u, edge, hx)
  const by = beyond(u, edge, vy)
  if (cur && DIR_AXIS[cur]) {
    const keep = beyond(u, edge, cur)
    const other = cur === hx || cur === vy ? (cur === hx ? by : bx) : -Infinity
    if (keep >= exit && !(other >= enter && other > keep * cornerRatio)) return cur
  }
  const xin = bx >= enter
  const yin = by >= enter
  if (xin && yin) {
    if (bx >= by * cornerRatio) return hx
    if (by >= bx * cornerRatio) return vy
    return null // köşe: belirsiz, komut yok
  }
  if (xin) return hx
  if (yin) return vy
  return null
}

export function createSteer(edge, { dwellMs = STEER_DWELL_MS, lockMs = STEER_LOCK_MS, windowMs = STEER_WINDOW_MS, saccadeUps = STEER_SACCADE_UPS, enter = STEER_ENTER, exit = STEER_EXIT } = {}) {
  let buf = [] // { x, y, ts }
  let zone = null
  let since = 0
  let fired = false
  let lockUntil = -Infinity
  let last = null
  const clear = () => {
    buf = []
    zone = null
    fired = false
    last = null
  }
  return {
    // u: okuyucu çıktısı (null = yüz yok / göz kapalı). Döner: { fire, candidate, progress, saccade }
    push(u, ts) {
      if (!u || !finite(u.x) || !finite(u.y) || !finite(ts)) {
        clear()
        return { fire: null, candidate: null, progress: 0, saccade: false }
      }
      let saccade = false
      if (last && ts > last.ts) {
        const ups = Math.hypot(u.x - last.x, u.y - last.y) / ((ts - last.ts) / 1000)
        saccade = ups > saccadeUps
      }
      last = { x: u.x, y: u.y, ts }
      buf.push({ x: u.x, y: u.y, ts })
      while (buf.length && ts - buf[0].ts > windowMs) buf.shift()
      if (saccade) {
        // Sıçrama sürerken bekleme ilerlemez ve aday değişmez
        return { fire: null, candidate: zone, progress: zone && !fired ? Math.min(1, (ts - since) / dwellMs) : 0, saccade }
      }
      const m = { x: median(buf.map((p) => p.x)), y: median(buf.map((p) => p.y)) }
      const z = zoneOf(m, edge, zone, { enter, exit })
      if (z !== zone) {
        zone = z
        since = ts
        fired = false
      }
      if (!zone) return { fire: null, candidate: null, progress: 0, saccade }
      const held = ts - since
      if (!fired && held >= dwellMs && ts >= lockUntil) {
        fired = true
        lockUntil = ts + lockMs
        return { fire: zone, candidate: zone, progress: 1, saccade }
      }
      return { fire: null, candidate: zone, progress: fired ? 1 : Math.max(0, Math.min(1, held / dwellMs)), saccade }
    },
    reset() {
      clear()
      lockUntil = -Infinity
    },
  }
}

// --- Kısa kontrol (oyuna girişte) ------------------------------------------------------------
// Dört yön sırayla istenir; doğru komut = isabet (süresiyle), yanlış komut sayılır, CHECK_TIMEOUT_MS içinde
// gelmezse ıska. Geçme: CHECK_PASS_HITS isabet ve en çok CHECK_MAX_WRONG yanlış.
export const CHECK_DIRS = ['right', 'up', 'left', 'down']
export const CHECK_TIMEOUT_MS = 6000
export const CHECK_PASS_HITS = 4
export const CHECK_MAX_WRONG = 1

export function createCheck({ dirs = CHECK_DIRS, timeoutMs = CHECK_TIMEOUT_MS } = {}) {
  let i = 0
  let t0 = null
  const hits = []
  let wrong = 0
  let misses = 0
  const state = () => ({ i, target: dirs[i] ?? null, done: i >= dirs.length, hits: hits.length, wrong, misses, n: dirs.length })
  return {
    // fire: createSteer'in fire'ı. Döner: { event: 'hit'|'wrong'|'miss'|null, ...state }
    push(fire, ts) {
      if (i >= dirs.length) return { event: null, ...state() }
      if (t0 == null) t0 = ts
      if (fire === dirs[i]) {
        hits.push(ts - t0)
        i += 1
        t0 = ts
        return { event: 'hit', ...state() }
      }
      if (fire) {
        wrong += 1
        return { event: 'wrong', ...state() }
      }
      if (ts - t0 >= timeoutMs) {
        misses += 1
        i += 1
        t0 = ts
        return { event: 'miss', ...state() }
      }
      return { event: null, ...state() }
    },
    get result() {
      const ms = hits.length ? Math.round(median(hits)) : null
      return { hits: hits.length, n: dirs.length, wrong, misses, ms, pass: hits.length >= CHECK_PASS_HITS && wrong <= CHECK_MAX_WRONG }
    },
    get state() {
      return state()
    },
  }
}
