// Okurken göz (deneme; sahip 2026-10-03): kelimeler seçilen hızda sırayla yanar, TrueDepth göz verisi kaydedilir.
// Soru: telefonun göz verisinden satır dönüşleri (satır sonundan başına büyük sola sıçrama) yanan satırla aynı anda
// yakalanabiliyor mu? Kelime kelime takip ölçülmez: ekrandaki sağ–sol göz dönüşü küçük (gazeCalib.js sürüm 2 notu).
// Karar ölçütü (sahibe yazılan plan; VARSAYIM): satır dönüşlerinin en az %80'i yanan satırın değişiminden en çok
// 500 ms uzakta yakalanırsa takip ölçülebilir. Hesap yalnız sayılarla; kamera görüntüsü yok.
import { FEATURES, PT_PER_MM } from './gazeCalib.js'

export const SPEEDS = [150, 200, 250] // kelime/dakika
export const PASS_RATE = 0.8
export const MATCH_MS = 500
export const SWEEP_WINDOW_MS = 300 // sola sıçrama bu süre içinde tamamlanır
export const SWEEP_SHARE = 0.4 // sıçrama en az satır genişliğinin bu payı kadar
export const SWEEP_REFRACTORY_MS = 600

export const msPerWord = (wpm) => 60000 / wpm

// Kelime kutuları (px, ekran) → satırlar: üstü yarım satırdan yakın olanlar aynı satır
export function linesOf(rects) {
  const lines = []
  rects.forEach((r, i) => {
    const last = lines[lines.length - 1]
    if (last && Math.abs(r.y - last.y) < r.h / 2) {
      last.words.push(i)
      last.x0 = Math.min(last.x0, r.x)
      last.x1 = Math.max(last.x1, r.x + r.w)
    } else lines.push({ y: r.y, words: [i], x0: r.x, x1: r.x + r.w })
  })
  return lines
}

// Yanan kelimenin zaman çizelgesi: i. kelime t0 + i × süre anında yanar
export function litAt(t, t0, n, wpm) {
  if (t < t0) return -1
  const i = Math.floor((t - t0) / msPerWord(wpm))
  return i < n ? i : -1
}

const pearson = (a, b) => {
  const n = a.length
  if (n < 3) return null
  const ma = a.reduce((s, v) => s + v, 0) / n
  const mb = b.reduce((s, v) => s + v, 0) / n
  let num = 0, da = 0, db = 0
  for (let k = 0; k < n; k++) {
    num += (a[k] - ma) * (b[k] - mb)
    da += (a[k] - ma) ** 2
    db += (b[k] - mb) ** 2
  }
  return da && db ? num / Math.sqrt(da * db) : null
}

// Sola sıçramalar: SWEEP_WINDOW_MS içinde en az thr düşüş; ardından SWEEP_REFRACTORY_MS beklenir
export function detectSweeps(series, thr) {
  const out = []
  let j = 0
  for (let i = 0; i < series.length; i++) {
    const a = series[i]
    if (j < i) j = i
    while (j + 1 < series.length && series[j + 1].t - a.t <= SWEEP_WINDOW_MS) j++
    let min = a.v
    for (let k = i + 1; k <= j; k++) min = Math.min(min, series[k].v)
    if (a.v - min < thr || (out.length && a.t - out[out.length - 1] < SWEEP_REFRACTORY_MS)) continue
    // Yeri: değerin düşüşün yarısını geçtiği ilk kare (pencerenin başı sıçramadan önce olabilir)
    const half = a.v - (a.v - min) / 2
    let k = i + 1
    while (k < j && series[k].v > half) k++
    out.push(series[k].t)
  }
  return out
}

// Beklenen dönüşlerle yakalananları birer birer eşleştir (en yakın, MATCH_MS içinde)
export function matchSweeps(expected, found, win = MATCH_MS) {
  const used = new Set()
  const pairs = []
  for (const e of expected) {
    let best = -1
    found.forEach((f, k) => {
      if (used.has(k) || Math.abs(f - e) > win) return
      if (best < 0 || Math.abs(f - e) < Math.abs(found[best] - e)) best = k
    })
    if (best >= 0) { used.add(best); pairs.push({ e, f: found[best] }) }
  }
  return pairs
}

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b)
  return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null
}

// frames: [{ ts, ...native yüz karesi }]; rects: kelime kutuları (px); t0: ilk kelimenin yandığı an; wpm
export function analyze({ frames, rects, t0, wpm }) {
  const n = rects.length
  const lines = linesOf(rects)
  const lineOf = new Array(n)
  lines.forEach((l, li) => l.words.forEach((w) => { lineOf[w] = li }))
  const tEnd = t0 + n * msPerWord(wpm)
  // Beklenen dönüşler: yanan kelimenin yeni satıra geçtiği anlar
  const expected = lines.slice(1).map((l) => t0 + l.words[0] * msPerWord(wpm))
  const during = frames.filter((f) => f.ts >= t0 && f.ts <= tEnd)
  const tracked = during.filter((f) => f.tracked)
  const widthMm = median(lines.map((l) => (l.x1 - l.x0) / PT_PER_MM)) ?? 0
  const distMm = median(tracked.map((f) => FEATURES.scrZ(f)).filter(Number.isFinite)) ?? 300
  // Sinyal: ekrandaki bakış noktası (mm) önce; yoksa kameraya göre açı (derece; satır genişliği açıya çevrilir)
  const signals = [
    { key: 'scrX', unit: 'mm', lineW: widthMm },
    { key: 'camX', unit: '°', lineW: (Math.atan(widthMm / distMm) * 180) / Math.PI },
  ]
  let used = null
  for (const s of signals) {
    const pts = tracked.map((f) => ({ t: f.ts, v: FEATURES[s.key](f) })).filter((p) => Number.isFinite(p.v))
    if (pts.length >= Math.max(10, tracked.length * 0.5)) { used = { ...s, pts }; break }
  }
  const base = { lines: lines.length, expected: expected.length, frames: during.length, trackedShare: during.length ? tracked.length / during.length : 0, widthMm, distMm, wpm }
  if (!used) return { ...base, ok: false, reason: 'sinyal-yok', matched: 0, rate: 0, r: null, signal: null, sweeps: [], pairs: [], expectedTimes: expected, series: [], target: [] }
  // Yön: sinyal yanan kelimenin x'iyle aynı yönde mi (işaret cihazdan bilinmiyor; veriden bulunur)
  const target = used.pts.map((p) => {
    const i = litAt(p.t, t0, n, wpm)
    return i < 0 ? null : (rects[i].x + rects[i].w / 2) / PT_PER_MM
  })
  const both = used.pts.map((p, k) => [p.v, target[k]]).filter(([, b]) => b != null)
  const r0 = pearson(both.map((x) => x[0]), both.map((x) => x[1]))
  const sign = r0 != null && r0 < 0 ? -1 : 1
  const series = used.pts.map((p) => ({ t: p.t, v: sign * p.v }))
  const thr = SWEEP_SHARE * used.lineW
  const sweeps = thr > 0 ? detectSweeps(series, thr) : []
  const pairs = matchSweeps(expected, sweeps)
  const rate = expected.length ? pairs.length / expected.length : 0
  const lagMs = median(pairs.map((p) => p.f - p.e))
  // Uyum: göz yanan kelimenin gerisinden gelir; ölçülen gecikme kadar kaydırılmış hedefle (yoksa kaydırmasız)
  const shift = Number.isFinite(lagMs) && lagMs > 0 ? lagMs : 0
  const lagged = used.pts.map((p) => {
    const i = litAt(p.t - shift, t0, n, wpm)
    return i < 0 ? null : (rects[i].x + rects[i].w / 2) / PT_PER_MM
  })
  const both2 = series.map((p, k) => [p.v, lagged[k]]).filter(([, b]) => b != null)
  const r1 = pearson(both2.map((x) => x[0]), both2.map((x) => x[1]))
  return {
    ...base,
    ok: true,
    signal: used.key,
    unit: used.unit,
    flipped: sign < 0,
    r: r1 == null ? (r0 == null ? null : Math.abs(r0)) : Math.max(0, r1),
    thr,
    sweeps,
    pairs,
    matched: pairs.length,
    rate,
    pass: rate >= PASS_RATE,
    lagMs,
    expectedTimes: expected,
    series,
    target: used.pts.map((p, k) => ({ t: p.t, v: target[k] })),
  }
}

// Paylaşılacak ham veri (kalibrasyon raporu gibi; yalnız sayılar)
export function payloadOf({ result, frames, rects, t0, wpm, title, build, correct = null }) {
  const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null)
  return JSON.stringify({
    kind: 'okurken-goz-deneme', v: 1, build: build ?? null, wpm, title, correct,
    result: { lines: result.lines, expected: result.expected, matched: result.matched, rate: r2(result.rate), r: r2(result.r), signal: result.signal, flipped: result.flipped ?? null, lagMs: r2(result.lagMs), trackedShare: r2(result.trackedShare), widthMm: r2(result.widthMm), distMm: r2(result.distMm) },
    words: rects.map((r) => [Math.round(r.x), Math.round(r.y), Math.round(r.w)]),
    frames: frames.map((f) => [Math.round(f.ts - t0), f.tracked ? 1 : 0, r2(FEATURES.scrX(f)), r2(FEATURES.scrY(f)), r2(FEATURES.camX(f)), r2(FEATURES.camY(f)), r2(FEATURES.headX(f)), r2(FEATURES.scrZ(f))]),
    cols: ['ms', 'izlendi', 'scrX', 'scrY', 'camX', 'camY', 'headX', 'scrZ'],
  })
}
