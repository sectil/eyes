// Gelişim 2.0 (Artifact "Gelişim Taslağı", onaylı): alan kartları için saf hesaplar.
// Her kart dört şeyi söyler: şimdi, başlangıç, değişim ve bu değişim ölçüm hatasından büyük mü.
// "Anlamlı" yalnız yayımlanmış bir eşik ya da istatistik varsa denir; yoksa "eğilim" / "henüz belirsiz".
import { pickSeries } from './vaSeries.js'
import { trendMessage } from './trend.js'
import { activitiesFrom, countedActivities, summary } from './stats.js'
import { registry, DOMAINS } from '../modules/registry.js'

const DAY = 86400000
const finite = (v) => (Number.isFinite(v) ? v : null)
const byDate = (a, b) => String(a.date).localeCompare(String(b.date))

// ---------- WHO-5 iyi oluş ----------
// Eser ve ark. 2019 (Türkçe geçerlilik, DOI 10.1017/S1463423619000343): son 14 gün, 5 madde, 0–5; ham 0–25 ×4 = 0–100.
// Ham puan 13'ün altı (100'lükte 52 altı) → resmî yönergeye göre ayrıca değerlendirme önerilir.
// %10 değişim (100'lükte 10 puan) klinik olarak anlamlı kabul edilir.
export const WHO5_TYPE = 'who5'
export const WHO5_ITEMS = 5
export const WHO5_EVERY_DAYS = 14
export const WHO5_MEANINGFUL = 10
export const WHO5_LOW = 52

export function who5Score(answers) {
  if (!Array.isArray(answers) || answers.length !== WHO5_ITEMS) return null
  if (!answers.every((v) => Number.isInteger(v) && v >= 0 && v <= 5)) return null
  const raw = answers.reduce((a, b) => a + b, 0)
  return { raw, score: raw * 4 }
}

export function makeWho5Record(answers, date = new Date()) {
  const s = who5Score(answers)
  if (!s) return null
  return { type: WHO5_TYPE, date: new Date(date).toISOString(), answers: [...answers], raw: s.raw, score: s.score, seconds: 0 }
}

export function who5Card(sessions = [], now = new Date()) {
  const recs = sessions.filter((s) => s?.type === WHO5_TYPE && Number.isFinite(s.score)).sort(byDate)
  const last = recs.at(-1) ?? null
  const first = recs[0] ?? null
  const daysSince = last ? Math.floor((new Date(now) - new Date(last.date)) / DAY) : null
  const due = !last || daysSince >= WHO5_EVERY_DAYS
  const nextInDays = last ? Math.max(0, WHO5_EVERY_DAYS - daysSince) : 0
  if (!last) return { n: 0, due, nextInDays, status: 'none' }
  const delta = recs.length > 1 ? last.score - first.score : null
  const status = delta == null ? 'first' : Math.abs(delta) >= WHO5_MEANINGFUL ? (delta > 0 ? 'up' : 'down') : 'noise'
  return { n: recs.length, last: last.score, first: first.score, delta, status, low: last.score < WHO5_LOW, due, nextInDays, series: recs.map((r) => ({ date: r.date, score: r.score })) }
}

// ---------- Ortalama ve %95 güven aralığı (t dağılımı) ----------
// İki yönlü %95 t kritik değerleri (df → t); arada kalan df için bir alttaki (daha geniş, temkinli) kullanılır.
const T95 = [[1, 12.706], [2, 4.303], [3, 3.182], [4, 2.776], [5, 2.571], [6, 2.447], [7, 2.365], [8, 2.306], [9, 2.262], [10, 2.228], [12, 2.179], [15, 2.131], [20, 2.086], [30, 2.042], [60, 2.0], [120, 1.98]]
export function t95(df) {
  if (!(df >= 1)) return null
  let t = T95[0][1]
  for (const [d, v] of T95) if (df >= d) t = v
  return df > 120 ? 1.96 : t
}

export function meanCI(values) {
  const v = values.filter(Number.isFinite)
  const n = v.length
  if (!n) return { n: 0, mean: null, lo: null, hi: null }
  const mean = v.reduce((a, b) => a + b, 0) / n
  if (n < 2) return { n, mean, lo: null, hi: null }
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1))
  const half = t95(n - 1) * (sd / Math.sqrt(n))
  return { n, mean, lo: mean - half, hi: mean + half, sd }
}

// ---------- Anlık etkiler: oturum öncesi → sonrası (modüllerin progress.effects tanımından) ----------
// Kontrol grubu yok: beklenti ve dinlenme etkisi ayrılamaz (kartta yazılır). "Anlamlı" = en az 3 oturum ve
// iyileşme farkının %95 GA'sı sıfırı içermiyor. better: 'down' (ör. rahatsızlık) ise iyileşme = önce − sonra.
export const ACUTE_MIN = 3
export function acuteEffects(sessions = [], { since = null, effects = registry.effects() } = {}) {
  const from = since ? new Date(since).getTime() : -Infinity
  const recent = sessions.filter((s) => new Date(s?.date).getTime() >= from)
  return effects
    .map((e) => {
      const pairs = recent.map((s) => e.pick(s)).filter((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]))
      if (!pairs.length) return null
      const down = e.better === 'down'
      const ci = meanCI(pairs.map(([b, x]) => (down ? b - x : x - b)))
      const before = pairs.reduce((t, p) => t + p[0], 0) / pairs.length
      const after = pairs.reduce((t, p) => t + p[1], 0) / pairs.length
      const sig = ci.n >= ACUTE_MIN && ci.lo != null && (ci.lo > 0 || ci.hi < 0)
      return { key: e.key, module: e.module, domain: e.domain, label: e.label, measure: e.measure, max: e.max, better: down ? 'down' : 'up', n: ci.n, before, after, gain: ci.mean, lo: ci.lo, hi: ci.hi, sig }
    })
    .filter(Boolean)
}

// ---------- Zaman içindeki ölçümler (modüllerin progress.metrics tanımından) ----------
// Yayımlanmış eşik (meaningful) varsa: son − ilk değişimi eşikle karşılaştırılır. Yoksa en az 6 ölçümde ilk yarı ile
// son yarı ortalamasının farkı ve farkın %95 GA'sı (Welch); GA sıfırı içermiyorsa değişim var. Azsa "henüz belirsiz".
export const METRIC_MIN = 6
function welchDiff(a, b) {
  const A = meanCI(a)
  const B = meanCI(b)
  const va = (A.sd ?? 0) ** 2 / A.n
  const vb = (B.sd ?? 0) ** 2 / B.n
  const se = Math.sqrt(va + vb)
  const diff = B.mean - A.mean
  if (!(se > 0)) return { diff, lo: diff, hi: diff }
  const df = (va + vb) ** 2 / (va ** 2 / (A.n - 1) + vb ** 2 / (B.n - 1))
  const half = t95(Math.max(1, Math.floor(df))) * se
  return { diff, lo: diff - half, hi: diff + half, first: A.mean, last: B.mean }
}

export function metricTrend(points = [], { better = 'up', meaningful = null } = {}) {
  const pts = points.filter((p) => p && Number.isFinite(p.value) && p.date).sort(byDate)
  const n = pts.length
  if (!n) return { n: 0, status: 'none', series: [] }
  const vals = pts.map((p) => p.value)
  const base = { n, first: vals[0], last: vals.at(-1), series: pts }
  if (n === 1) return { ...base, status: 'first' }
  const sign = better === 'down' ? -1 : 1
  if (meaningful != null) {
    const delta = vals.at(-1) - vals[0]
    const good = sign * delta
    return { ...base, delta, method: 'threshold', status: Math.abs(delta) >= meaningful ? (good > 0 ? 'better' : 'worse') : 'noise' }
  }
  if (n < METRIC_MIN) return { ...base, delta: vals.at(-1) - vals[0], method: 'too-few', status: 'unsure' }
  const h = Math.floor(n / 2)
  const w = welchDiff(vals.slice(0, h), vals.slice(n - h))
  const goodLo = sign > 0 ? w.lo : -w.hi
  const goodHi = sign > 0 ? w.hi : -w.lo
  const status = goodLo > 0 ? 'better' : goodHi < 0 ? 'worse' : 'noise'
  return { ...base, first: w.first, last: w.last, delta: w.diff, lo: w.lo, hi: w.hi, method: 'halves', status }
}

export function metricCards({ tests = [], sessions = [], metrics = registry.metrics() } = {}) {
  return metrics
    .map((m) => ({ key: m.key, module: m.module, domain: m.domain, label: m.label, unit: m.unit, better: m.better, source: m.source ?? null, ...metricTrend(m.series({ tests, sessions }), m) }))
    .filter((c) => c.n > 0)
}

// ---------- Göz ----------
export function eyeCard(tests = [], now = new Date()) {
  const { eye, tests: t, trend } = pickSeries(tests, new Date(now).toISOString())
  if (!eye) return { eye: null, phase: 'empty', alert: null, message: trendMessage(trend) }
  return {
    eye,
    n: t.length,
    phase: trend.phase,
    alert: trend.alert,
    trend: trend.trend,
    baseline: trend.baseline,
    current7: trend.current7,
    delta: trend.delta,
    last: finite(t.at(-1)?.logMAR),
    series: trend.series,
    message: trendMessage(trend),
  }
}

// ---------- Düzen ----------
export function practiceCard(tests = [], sessions = [], now = new Date()) {
  return summary(countedActivities(activitiesFrom(tests, sessions)), now)
}

// ---------- Alanlar: Gelişim kutucukları ----------
export const DOMAIN_LABEL = { eye: 'Göz', calm: 'Sakinlik', self: 'Kendine yaklaşım', awareness: 'Farkındalık', focus: 'Dikkat', wellbeing: 'İyi oluş', body: 'Beden' }
// Her alan: o alana sayılan metrik kartları ve anlık etkiler (modüllerden) + özel kaynaklar (göz, WHO-5)
export function domainSummary({ tests = [], sessions = [], now = new Date() } = {}) {
  const metrics = metricCards({ tests, sessions })
  const effects = acuteEffects(sessions)
  const out = Object.fromEntries(DOMAINS.map((d) => [d, { domain: d, label: DOMAIN_LABEL[d], metrics: [], effects: [] }]))
  for (const m of metrics) out[m.domain]?.metrics.push(m)
  for (const e of effects) out[e.domain]?.effects.push(e)
  out.eye.eye = eyeCard(tests, now)
  out.wellbeing.who5 = who5Card(sessions, now)
  return out
}

// ---------- 5. gün "İlk rapor" ----------
// Deneme 7 gün; kullanıcı ödeme kararından önce görebilsin diye 5. günden itibaren. start: deneme/kurulum başlangıcı.
export const REPORT_DAY = 5
export function reportDay(start, now = new Date()) {
  if (!start) return null
  return Math.floor((new Date(now) - new Date(start)) / DAY) + 1
}
export function firstReport({ tests = [], sessions = [], start, now = new Date() }) {
  const since = start ? new Date(start) : null
  const inWindow = (x) => !since || new Date(x.date) >= since
  const t = tests.filter(inWindow)
  const s = sessions.filter(inWindow)
  return {
    day: reportDay(start, now),
    practice: practiceCard(t, s, now),
    acute: acuteEffects(s),
    metrics: metricCards({ tests: t, sessions: s }),
    eye: eyeCard(tests, now),
    who5: who5Card(sessions, now),
  }
}
