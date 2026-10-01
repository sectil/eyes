// Gelişim 2.0 (Artifact "Gelişim Taslağı", onaylı): alan kartları için saf hesaplar.
// Her kart dört şeyi söyler: şimdi, başlangıç, değişim ve bu değişim ölçüm hatasından büyük mü.
// "Anlamlı" yalnız yayımlanmış bir eşik ya da istatistik varsa denir; yoksa "eğilim" / "henüz belirsiz".
import { pickSeries } from './vaSeries.js'
import { trendMessage } from './trend.js'
import { activitiesFrom, countedActivities, summary } from './stats.js'
import { registry, DOMAINS } from '../modules/registry.js'
import { dayKey } from './calendar.js'
import { keyDay } from './habitLog.js'

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

const WHO5_VERDICT = { first: 'start', up: 'better', down: 'worse', noise: 'same' }
export function who5Card(sessions = [], now = new Date()) {
  const recs = sessions.filter((s) => s?.type === WHO5_TYPE && Number.isFinite(s.score)).sort(byDate)
  const last = recs.at(-1) ?? null
  const first = recs[0] ?? null
  const daysSince = last ? Math.floor((new Date(now) - new Date(last.date)) / DAY) : null
  const due = !last || daysSince >= WHO5_EVERY_DAYS
  const nextInDays = last ? Math.max(0, WHO5_EVERY_DAYS - daysSince) : 0
  if (!last) return { n: 0, due, nextInDays, status: 'none', verdict: null }
  const delta = recs.length > 1 ? last.score - first.score : null
  const status = delta == null ? 'first' : Math.abs(delta) >= WHO5_MEANINGFUL ? (delta > 0 ? 'up' : 'down') : 'noise'
  // verdict: ölçü kuralı v2'nin sözcükleriyle (yayımlanmış eşik 10 puan; Ö-6: n > 1 ise ilk değil son puan ve hüküm)
  return { n: recs.length, last: last.score, first: first.score, delta, status, verdict: WHO5_VERDICT[status], low: last.score < WHO5_LOW, due, nextInDays, daysSince, series: recs.map((r) => ({ date: r.date, score: r.score })) }
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

// Etkinin haftalara göre seyri (Gelişim alan ayrıntısı): son `weeks` haftanın her birinde ortalama iyileşme farkı ve
// %95 GA. Hafta, bugünden geriye 7'şer gün. Oturumu olmayan hafta atlanır. better 'down' ise iyileşme = önce − sonra.
export function effectWeeks(sessions = [], effect, { now = new Date(), weeks = 6 } = {}) {
  const t = new Date(now).getTime()
  const out = []
  for (let w = weeks - 1; w >= 0; w--) {
    const hi = t - w * 7 * DAY
    const lo = hi - 7 * DAY
    const pairs = sessions
      .filter((s) => {
        const x = new Date(s?.date).getTime()
        return x > lo && x <= hi
      })
      .map((s) => effect.pick(s))
      .filter((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]))
    if (!pairs.length) continue
    const ci = meanCI(pairs.map(([b, x]) => (effect.better === 'down' ? b - x : x - b)))
    out.push({ date: new Date(hi).toISOString(), value: ci.mean, n: ci.n, lo: ci.lo, hi: ci.hi })
  }
  return out
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

// Yoga (modul.md §7; PLAN.v3 §D.5): ölçüleri "nasıl hissettin" gidişatıdır, etki kanıtı değil. Metin iyileşme ya da
// kötüleşme demez, puanın yönünü söyler. Gelişim (ProgressOverview.metricStatus), 5. gün raporu ve PDF (exportData) aynı
// metni buradan alır. Dönüş: 'belirgin artış' | 'belirgin düşüş' | null (bu modüllerden değil ya da belirgin değil).
export const FEEL_ONLY_MODULES = new Set(['yoga'])
export function feelOnlyText(c) {
  if (!FEEL_ONLY_MODULES.has(c?.module) || (c.status !== 'better' && c.status !== 'worse')) return null
  const rose = (c.status === 'better') === (c.better !== 'down')
  return rose ? 'belirgin artış' : 'belirgin düşüş'
}

// ---------- Ölçü kuralı v2 (gelisim-merkezi PLAN.v1 §3.3; onaylı SONSUZ_YOL.PLAN.v1 §3.B.3, karar 2) ----------
// metricTrend (ilk yarı / son yarı) ve status yerinde kalır (eşdeğerlik, eski testler); ekranlar, raporlar ve alan
// hükmü verdict okur. Göz kuralı trend.js'te aynen kalır.
//  1. Günlük toplama: aynı takvim gününün (yerel) ölçümleri o günün ortancası olur (K4: aynı günün turları tek değer).
//  2. Alışma: ilk `familiar` ölçüm günü değerlendirmeye girmez (görev metriklerinde 2, öbürlerinde 1; VARSAYIM).
//  3. Başlangıç: alışmadan sonraki ilk `baseDays` ölçüm gününün ortancası ve SD'si; bir kez oluşur, değişmez.
//     SD, metriğin biriminde bir tabanın (`sdFloor`) altına inmez.
//  4. Bakış haftada bir, Pazartesi (yerel 00.00'da, o güne kadarki ölçüm günleriyle). Şimdi: başlangıçtan sonraki son 3
//     ölçüm gününün ortancası. Bu 3 gün bakıştan önceki 28 gün içinde değilse bakış 'unclear' olur (eski veri bugünü
//     anlatmaz; VARSAYIM: plan §3.B.3 "pencere 28").
//  5. Değişim: şimdi − başlangıç farkı (iyi yön +) c × SD'yi aşar (yayımlanmış eşik varsa `meaningful`'a ulaşır) ve bu
//     art arda `persist` bakışta sürerse 'better' ya da 'worse' (K3: sabit başlangıç, son haftalar). Bakış ancak bir
//     önceki bakıştan bu yana YENİ ölçüm günü geldiyse sayılır: yeni ölçüm yoksa önceki bakışın hükmü ve sayacı aynen
//     kalır (aynı 3 gün art arda Pazartesilerde yeniden sayılıp tek bir şanslı dilimi "iki hafta" yapmasın). Fark ilk
//     bakışta görülüp henüz doğrulanmadıysa (persist'e ulaşmadı) hüküm 'unclear'dır: "değişim yok" demek yanlış olurdu.
// verdict: 'start' (başlangıç oluşuyor ya da ilk bakış gelmedi) | 'same' (doğrulanmış değişim yok) | 'better' | 'worse'
//          | 'unclear' (son 28 günde yeterli ölçüm yok ya da görülen fark doğrulanmayı bekliyor). rule 'none' olan metrik
//          (değişim kuralı yok, ör. Bugünün görevi) 'start'tan sonra hep 'unclear'dır.
export const V2 = { familiar: 1, baseDays: 6, currentDays: 3, c: 1.5, persist: 2, windowDays: 28 }
// Metrik başına parametreler (manifestte progress.metrics[].v2 verilirse o önce gelir). Görev metrikleri: alışma 2 gün.
// SD tabanları: harf 0,5 ve ms 10 onaylı plandan (§3.B.3, §3.B.6); öbürleri VARSAYIM (birimin yarım/tek basamağı).
export const V2_PARAMS = {
  'quick-look-threshold': { familiar: 2, sdFloor: 10 },
  'tek-bakis-span': { familiar: 2, sdFloor: 0.5 },
  'street-noticed': { familiar: 2, sdFloor: 5 }, // VARSAYIM; plan "seviye içinde" der, kayıt serisi seviye taşımıyor
  'breath-count-accuracy': { familiar: 2, sdFloor: 5 },
  'notice-count': { rule: 'none' }, // §3.B.6: tavanlı ölçek, görev her gün değişiyor → değişim kuralı yok
}
const UNIT_SD_FLOOR = { '%': 5, '/5': 0.5, puan: 1, kez: 1, ms: 10, harf: 0.5 }

const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const sampleSd = (a) => {
  if (a.length < 2) return 0
  const m = a.reduce((x, y) => x + y, 0) / a.length
  return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1))
}
const epochDay = (date) => keyDay(dayKey(new Date(date)))
// 1970-01-01 Perşembe: dönem günü % 7 === 4 Pazartesi
const nextMonday = (d) => d + ((4 - (((d % 7) + 7) % 7) + 7) % 7)

// Günlük ortanca serisi: [{ day (dönem günü), date (o günün ilk ölçümü), value, n }] eskiden yeniye
export function dailyMedians(points = []) {
  const byDay = new Map()
  for (const p of points) {
    if (!p || !Number.isFinite(p.value)) continue
    const t = new Date(p.date).getTime()
    if (!Number.isFinite(t)) continue
    const d = epochDay(t)
    const x = byDay.get(d)
    if (x) x.values.push(p.value), (x.t = Math.min(x.t, t))
    else byDay.set(d, { values: [p.value], t })
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, x]) => ({ day, date: new Date(x.t).toISOString(), value: median(x.values), n: x.values.length }))
}

export function metricStatusV2(points = [], { better = 'up', meaningful = null, now = new Date(), ...opts } = {}) {
  const p = { ...V2, ...opts }
  const sign = better === 'down' ? -1 : 1
  const days = dailyMedians(points)
  const latest = days.length ? median(days.slice(-p.currentDays).map((x) => x.value)) : null
  const base = { verdict: 'start', measureDays: days.length, baseline: null, current: null, latest, sd: null, threshold: null, looks: 0 }
  if (!days.length) return { ...base, verdict: null }
  const need = p.familiar + p.baseDays
  if (days.length < need) return base
  const baseArr = days.slice(p.familiar, need)
  const baseline = median(baseArr.map((x) => x.value))
  const sd = Math.max(sampleSd(baseArr.map((x) => x.value)), p.sdFloor ?? 0)
  const threshold = meaningful ?? p.c * sd
  const formed = { ...base, baseline, sd, threshold }
  if (p.rule === 'none') return { ...formed, verdict: 'unclear' }
  const baseEnd = baseArr.at(-1).day
  const today = epochDay(now)
  const post = days.slice(need).filter((x) => x.day < today + 1)
  // Pazartesi bakışları: ilk bakış başlangıçtan sonra en az 3 ölçüm günü biriken ilk Pazartesi
  let i = 0
  let side = null
  let streak = 0
  let last = null
  let looks = 0
  let current = null
  let seen = -1 // son sayılan bakışta ölçüm günü sayısı (yeni ölçüm var mı)
  for (let M = nextMonday(baseEnd + 1); M <= today; M += 7) {
    while (i < post.length && post[i].day < M) i++
    if (i < p.currentDays) continue // henüz değerlendirilemez (bakış sayılmaz)
    const cur = post.slice(i - p.currentDays, i)
    const stale = cur[0].day < M - p.windowDays
    // yeni ölçüm günü yok ve veri hâlâ pencerede: önceki bakışın hükmü ve sayacı sürer (aynı günler iki kez sayılmaz)
    if (!stale && i === seen) continue
    seen = i
    looks++
    if (stale) {
      last = 'unclear'
      side = null
      streak = 0
      current = null
      continue
    }
    current = median(cur.map((x) => x.value))
    const diff = sign * (current - baseline)
    const st = meaningful != null ? (Math.abs(diff) >= meaningful ? (diff > 0 ? 'better' : 'worse') : 'same') : diff > threshold ? 'better' : diff < -threshold ? 'worse' : 'same'
    streak = st === side ? streak + 1 : 1
    side = st
    last = st
  }
  if (!looks) return { ...formed, verdict: 'start' }
  // görülen fark doğrulanmadıysa (persist bakış sürmedi) 'unclear': ne değişim ne "değişim yok" denir
  const verdict = last === 'better' || last === 'worse' ? (streak >= p.persist ? last : 'unclear') : last
  return { ...formed, verdict, current, looks }
}

// Metriğin v2 parametreleri: manifest (m.v2) > V2_PARAMS[key] > birimin SD tabanı
export function v2Params(m) {
  return { sdFloor: UNIT_SD_FLOOR[m?.unit] ?? 0, ...(V2_PARAMS[m?.key] ?? {}), ...(m?.v2 ?? {}) }
}

export function metricCards({ tests = [], sessions = [], metrics = registry.metrics(), now = new Date() } = {}) {
  return metrics
    .map((m) => {
      const series = m.series({ tests, sessions })
      const t = metricTrend(series, m)
      if (!t.n) return t
      const v = metricStatusV2(series, { better: m.better, meaningful: m.meaningful ?? null, now, ...v2Params(m) })
      return { key: m.key, module: m.module, domain: m.domain, label: m.label, unit: m.unit, better: m.better, source: m.source ?? null, ...t, verdict: v.verdict, v2: v }
    })
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
    // Başlangıçla karşılaştırılan değer ve penceresi (trend.js): son 7 günde test yoksa son 3 testin ortancası
    current: trend.current,
    currentWindow: trend.currentWindow,
    sparse: trend.sparse,
    baselineMode: trend.baselineMode ?? null,
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
// Önce → sonra etkileri yalnız son 28 günden (Ö-3; plan §3.B.4): pencerenin başı haritanınkiyle aynı (bugün dâhil 28
// takvim günü, yerel gece yarısı)
export const EFFECT_WINDOW_DAYS = 28
export function effectsSince(now = new Date()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (EFFECT_WINDOW_DAYS - 1))
  return d
}
export function domainSummary({ tests = [], sessions = [], now = new Date() } = {}) {
  const metrics = metricCards({ tests, sessions, now })
  const effects = acuteEffects(sessions, { since: effectsSince(now) })
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
  // bozuk kayıt (null, nesne değil) rapora girmez; eskiden 5. gün raporu ekranını düşürüyordu (G1 tek hesap testi)
  const inWindow = (x) => x != null && typeof x === 'object' && (!since || new Date(x.date) >= since)
  const t = tests.filter(inWindow)
  const s = sessions.filter(inWindow)
  return {
    day: reportDay(start, now),
    practice: practiceCard(t, s, now),
    acute: acuteEffects(s),
    metrics: metricCards({ tests: t, sessions: s, now }),
    eye: eyeCard(tests, now),
    who5: who5Card(sessions, now),
  }
}
