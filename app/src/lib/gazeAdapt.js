// Kendini iyileştiren göz modeli: egzersizdeki "Sağa / Sola / Yukarı / Aşağı bak" adımlarında kişi bilinen bir
// hedefe bakar. O anın ölçümü, hedefin EKRANDAKİ konumuyla birlikte gözlem olarak saklanır; kalibrasyon modeli
// bu gözlemlerle küçük bir doğrusal düzeltme alır. Kişi ikinci kez ayar yapmadan model kullandıkça oturur.
//
// Neden konumla: egzersiz hedefi kalibrasyon noktalarıyla aynı yerde değil (alanın içinde, kenardan içeride);
// ölçümü doğrudan "sağ" değerinin yerine koymak kazancı bozar. Model, ekran konumu → ham sinyal eşlemesidir:
// kalibrasyonun 3 noktası (neg, c, pos) sabit dayanaktır, gözlemler bunlara eklenir.
//
// Korumalar: tutarsız gözlem atılır (hareketli bakış, ters taraf, çapraz bakış, aşırı sapma); düzeltme sonrası iki
// yanın aralığı kalibrasyonun [0,5; 2] katı dışına çıkarsa uygulanmaz; son ADAPT_MAX gözlem tutulur, yeniler daha
// ağır basar; yeniden kalibrasyon hepsini sıfırlar (yeni model). Sayılar rapora girer (model.adapt).
// VARSAYIM: eşikler ilk sürüm içindir; cihaz verisiyle ayarlanacak.
import { FEATURES, median } from './gazeCalib.js'

// Kalibrasyon hedeflerinin ekran konumu (oran; GazeCalibration.jsx POS ile aynı): x soldan, y üstten
export const CAL_FRAC = {
  x: { neg: 0.08, c: 0.5, pos: 0.92 }, // sol, orta, sağ
  y: { neg: 0.84, c: 0.46, pos: 0.12 }, // aşağı, orta, yukarı (y pos = yukarı)
}
export const ADAPT_MAX = 24 // tutulan gözlem
export const ADAPT_OBS_WEIGHT = 0.5 // bir gözlemin ağırlığı (kalibrasyon noktası = 1)
export const ADAPT_DECAY = 0.92 // her eski gözlemde ağırlık çarpanı
export const ADAPT_MIN_FRAMES = 20 // bir adımda en az bu kadar uygun kare (~0,7 sn)
export const ADAPT_SETTLE_MS = 1000 // adım başında göz hedefe varsın
export const ADAPT_STABLE_FRAC = 0.25 // adım içi yayılım ≤ aralığın bu oranı
export const ADAPT_RESID_MAX = 1 // gözlemin kalibrasyondan sapması ≤ aralığın bu katı
export const ADAPT_GAIN_RANGE = [0.5, 2]
const DIR_AXIS = { left: ['x', -1], right: ['x', 1], up: ['y', 1], down: ['y', -1] }

const baseOf = (model) => model.base ?? { x: pick3(model.x), y: pick3(model.y) }
const pick3 = (a) => ({ c: a.c, neg: a.neg, pos: a.pos })
const rangeOf = (a) => Math.min(Math.abs(a.pos - a.c), Math.abs(a.neg - a.c))

// Kalibrasyon dayanaklarından parça doğrusal tahmin: ekran konumu p → ham değer
export function predict(axisBase, fr, p) {
  const pts = [[fr.neg, axisBase.neg], [fr.c, axisBase.c], [fr.pos, axisBase.pos]].sort((a, b) => a[0] - b[0])
  const seg = p <= pts[1][0] ? [pts[0], pts[1]] : [pts[1], pts[2]]
  const [[p0, v0], [p1, v1]] = seg
  return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0)
}

// Bir adımın karelerini toplar. dir: adımın hedef yönü; reader: createGazeReader (model okuyucusu).
export function createObsCollector(model, dir) {
  const ax = DIR_AXIS[dir]
  if (!model?.x || !model?.y || !ax) return null
  const [axis, sign] = ax
  const other = axis === 'x' ? 'y' : 'x'
  const fx = FEATURES[model.x.feature]
  const fy = FEATURES[model.y.feature]
  let t0 = null
  const xs = []
  const ys = []
  return {
    // g: okuyucu çıktısı; center: okuyucunun o anki merkezi (model c + yeniden ortalama kayması)
    push(f, g, center) {
      if (!g?.tracked || g.closed || !center || !Number.isFinite(f?.ts)) return
      if (t0 == null) t0 = f.ts
      if (f.ts - t0 < ADAPT_SETTLE_MS) return
      const along = g.v?.[axis] * sign
      const cross = Math.abs(g.v?.[other] ?? Infinity)
      // Hedef tarafında ve o eksende (ters taraf, çapraz ya da ortada kalan bakış sayılmaz)
      if (!(along >= 5) || !(along > cross)) return
      const x = fx(f)
      const y = fy(f)
      if (!Number.isFinite(x) || !Number.isFinite(y)) return
      // Kalibrasyon çerçevesine: yeniden ortalama kayması çıkarılır
      xs.push(x - (center.x - model.x.c))
      ys.push(y - (center.y - model.y.c))
    },
    // frac: hedefin ekrandaki konumu { x, y } (oran). Döner: gözlem ya da null
    finish(frac) {
      if (xs.length < ADAPT_MIN_FRAMES || !(frac?.x >= 0 && frac.x <= 1 && frac?.y >= 0 && frac.y <= 1)) return null
      const mx = median(xs)
      const my = median(ys)
      const sx = median(xs.map((v) => Math.abs(v - mx)))
      const sy = median(ys.map((v) => Math.abs(v - my)))
      if (sx > ADAPT_STABLE_FRAC * rangeOf(model.x) || sy > ADAPT_STABLE_FRAC * rangeOf(model.y)) return null
      return { dir, px: +frac.x.toFixed(4), py: +frac.y.toFixed(4), x: mx, y: my, n: xs.length }
    },
  }
}

// Bir eksen için düzeltme δ(p) = a + b·(p − c_p): kalibrasyon noktaları (kalıntı 0, ağırlık 1) + gözlemler.
function fitCorrection(axisBase, fr, pts) {
  const all = [[fr.neg, 0, 1], [fr.c, 0, 1], [fr.pos, 0, 1], ...pts]
  const W = all.reduce((s, [, , w]) => s + w, 0)
  const mp = all.reduce((s, [p, , w]) => s + w * p, 0) / W
  const mr = all.reduce((s, [, r, w]) => s + w * r, 0) / W
  let sxx = 0
  let sxy = 0
  for (const [p, r, w] of all) {
    sxx += w * (p - mp) ** 2
    sxy += w * (p - mp) * (r - mr)
  }
  const b = sxx > 0 ? sxy / sxx : 0
  return (p) => mr + b * (p - mp)
}

// Gözlemle modeli günceller. Koruma ihlalinde gözlem yine kaydedilmez, model aynen döner (changed: false).
export function adaptModel(model, obs, nowIso = new Date().toISOString()) {
  if (!model?.x || !model?.y || !obs) return { model, changed: false, reason: 'no-model' }
  const base = baseOf(model)
  const residOk = ['x', 'y'].every((axis) => {
    const r = obs[axis] - predict(base[axis], CAL_FRAC[axis], axis === 'x' ? obs.px : obs.py)
    return Math.abs(r) <= ADAPT_RESID_MAX * rangeOf(base[axis])
  })
  if (!residOk) return { model, changed: false, reason: 'outlier' }
  const list = [...(model.adapt?.obs ?? []), obs].slice(-ADAPT_MAX)
  const next = {}
  for (const axis of ['x', 'y']) {
    const b = base[axis]
    const fr = CAL_FRAC[axis]
    const pts = list.map((o, i) => {
      const p = axis === 'x' ? o.px : o.py
      const w = ADAPT_OBS_WEIGHT * ADAPT_DECAY ** (list.length - 1 - i)
      return [p, o[axis] - predict(b, fr, p), w]
    })
    const d = fitCorrection(b, fr, pts)
    const c = b.c + d(fr.c)
    const neg = b.neg + d(fr.neg)
    const pos = b.pos + d(fr.pos)
    // İki yan merkezin zıt taraflarında kalmalı ve aralık kalibrasyonun [0,5; 2] katında
    const [lo, hi] = ADAPT_GAIN_RANGE
    const ok = (v, bv) => Math.sign(v - c) === Math.sign(bv - b.c) && Math.abs(v - c) / Math.abs(bv - b.c) >= lo && Math.abs(v - c) / Math.abs(bv - b.c) <= hi
    if (!ok(neg, b.neg) || !ok(pos, b.pos)) return { model, changed: false, reason: `gain-${axis}` }
    next[axis] = { ...model[axis], c, neg, pos }
  }
  const n = (model.adapt?.n ?? 0) + 1
  return { model: { ...model, x: next.x, y: next.y, base, adapt: { obs: list, n, at: nowIso } }, changed: true }
}
