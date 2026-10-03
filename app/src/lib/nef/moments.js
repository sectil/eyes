// Nef an motoru (Nef PLAN §4.1, §4.5, §4.8; ANA_OTURUM_ISTEMI N1 madde 1–2). Saf, dil bilmez: girdi bir bağlam
// nesnesi, çıktı an listesi. Cümle kurmaz; hangi hücreden konuşulacağını ve olguları söyler (speak.js seçer, bank yazar).
//
// An: { type, cell, facts, key, priority, channels }
//   type      an türü · cell bankadaki hücre ('F1.A', 'F2.C', 'MC' …; lowWho5'te null) · facts dil bilmeyen olgular
//   key       olgu anahtarı (hafıza kural 2: aynı olgu bir kez) · priority büyük olan önce · channels 'card' | 'notify'
//
// Bağlam (hepsi isteğe bağlı; olmayan veri o anı kurmaz):
//   now        Date
//   walk       { at: dakika, source: 'habit'|'remind', weekCount? } kişinin yürüyüş saati olgusu. habit: son 28 günün
//              yürüyüşünden çıkan alışkanlık; remind: kurduğu yürüyüş hatırlatması. weekCount: bu hafta o saatteki
//              yürüyüş sayısı. Çıkarımı bu aşamada yok (VARSAYIM: sonraki aşamada çağıran verir).
//   forecast   sky.js önbelleğindeki tahmin: { fetchedAt: ms, hours: [{ at: ms, precipChance: 0–1, apparentC }] }
//   sessions   kayıtlar · effects: registry.effects() biçimi [{ key, module, measure, better?, pick }]
//   acute      progress.acuteEffects çıktısı · metrics: [{ key, module, domain, better, verdict, start, current, weeks? }]
//              (verdict progress.metricStatusV2'den; start/current taban ve güncel değer)
//   firsts     [{ module, kind: 'day'|'metric'|'effect', metric?, domain?, value?, effect?, measure?, better?, before?, after? }]
//   gaps       [{ module, days, last?: { effect, measure, better, before, after } }] modüle uzun aradan dönüş
//   appGapDays uygulamanın son açılışından bu yana gün · who5Low: WHO-5 düşük mü (progress.who5Card .low)
//   path       { has, doneToday, doneDays (bu takvim haftası, bugün dahil), backLine? (yol alanı "Kaldığın yerden"
//              satırını bugün yazdı mı) }
//
// Sahip kararları (N1-CUMLELER-onay.md başı): Nef uyku hakkında konuşmaz (yoga-uyku-dalma hariç); Yön'ün "rahatsızlık"
// ölçüsünü anmaz; sıcak ve yağmur aynı saatteyse bildirim yalnız yağmuru söyler, sıcaklık notu kartta (hotWalk yalnız
// kart). drift (F8) bu aşamada YOK (plan §8, N3). metricBest ve ladderStep an değil (5 sn kapısı 3/5 ve 0/5).
// Ölçüm ve tehlike uyarısı an motoruna girmez: göz alanı metrikleri metricChange/firstTime.B'ye girmez (plan §4.1).
import { dayKey, startOfWeek } from '../calendar.js'
import { ACUTE_MIN } from '../progress.js'
import { RAIN_CHANCE } from '../weatherNotify.js'
import { STALE_H } from '../sky.js'

const H = 3600000
const DAY = 86400000

export const EXCLUDED_EFFECTS = new Set(['yon-uzak']) // Yön · Dışarıdan bak, "rahatsızlık" (sahip kararı)
export const EXCLUDED_METRICS = new Set(['yoga-uyku-dalma']) // uyku (sahip kararı; plan §4.8 "uyku hakkında yorum yok")
export const EXCLUDED_DOMAINS = new Set(['eye']) // göz ölçümü an motoruna girmez (plan §4.1)

// VARSAYIM sayılar (plan §3, §4.1, §4.5; taslak §1–§5)
export const RAIN_BEFORE_MIN = 90 // rain.from − 90 dk ≤ yürüyüş saati ≤ rain.to (§4.1)
export const EARLY_SHIFT_MIN = 60 // {earlyAt} = rainFrom − 60 dk, yarım saate aşağı (taslak F1)
export const EARLY_LEAD_MIN = 30 // {earlyAt} şimdiden en az 30 dk sonra
export const HOT_C = 30 // hissedilen ≥ 30 (§3 F3)
export const RECALL_MIN = 2 // tek seans: iyi yönde en az 2 puan (§4.1)
export const APP_GAP_DAYS = 5 // uygulamaya uzun aradan dönüş (§4.5)
export const MODULE_GAP_DAYS = 14 // modüle uzun aradan dönüş (taslak §5.3)
export const PATH_WEEK_MIN = 2 // pathDone kart cümlesi: bu hafta en az 2 tam gün (taslak §5.5)

// Bir modülden kendiliğinden çıkan genel an türleri (plan §4.8 tablosu; manifest `nef.moments` bunlardan seçer). drift N3'te;
// pathDone modülün değil yolun anı.
export const MODULE_MOMENTS = Object.freeze(['recallEffect', 'effectPattern', 'metricChange', 'firstTime', 'returnAfterGap'])

// Önem (plan §4.2 sırası: yol > hava ile kişisel saat > kişisel olgu > düzen > takvim; VARSAYIM sayılar)
export const PRIORITY = Object.freeze({
  lowWho5: 100,
  returnApp: 90,
  pathDone: 70,
  rainOnWalk: 60,
  hotWalk: 55,
  recallEffect: 50,
  effectPattern: 45,
  metricChange: 40,
  firstTime: 35,
  returnAfterGap: 30,
  silentDay: 0,
})

// Gün dilimi (dil bilmeyen anahtar; sözcüğü bank/tr.grammar.js DAY_PARTS). VARSAYIM sınırlar:
// sabah 05–11, öğlen 11–17, akşam 17–22, gece 22–05 (onaylı örnek: yağmur 17.00–22.00 "akşam boyu").
export const DAY_PART_RANGES = Object.freeze({ morning: [300, 660], noon: [660, 1020], evening: [1020, 1320], night: [1320, 1440] })
export function dayPartOf(min) {
  if (!Number.isFinite(min)) return null
  const m = ((Math.floor(min) % 1440) + 1440) % 1440
  if (m < 300) return 'night'
  return Object.entries(DAY_PART_RANGES).find(([, [a, b]]) => m >= a && m < b)?.[0] ?? 'night'
}
const minOf = (d) => d.getHours() * 60 + d.getMinutes()
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const round1 = (v) => Math.round(v * 10) / 10

// Bugün, şimdiden gün sonuna, ilk kesintisiz yağmur aralığı (saatlik olasılık ≥ RAIN_CHANCE; weatherNotify ile aynı eşik)
// → { from, to } gün içi dakika (to = son yağmurlu saatin bitişi; gün sonu 1440) ya da null
export function rainSpan(hours, now) {
  const nowMs = now.getTime()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayEnd = dayStart + DAY
  let span = null
  for (const r of [...(hours ?? [])].filter((x) => Number.isFinite(x?.at)).sort((a, b) => a.at - b.at)) {
    if (r.at + H <= nowMs || r.at >= dayEnd) continue
    if ((Number(r.precipChance) || 0) >= RAIN_CHANCE) {
      if (span) span.to = r.at + H
      else span = { from: r.at, to: r.at + H }
    } else if (span) break
  }
  if (!span) return null
  return { from: Math.round((span.from - dayStart) / 60000), to: Math.round((span.to - dayStart) / 60000) }
}

// Gün içi dakikanın saatlik satırındaki hissedilen (bugün) ya da null
function feelsAt(hours, now, min) {
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(min / 60), min % 60).getTime()
  const row = (hours ?? []).find((r) => Number.isFinite(r?.at) && r.at <= at && at < r.at + H)
  return isNum(row?.apparentC) ? row.apparentC : null
}

const freshForecast = (f, now) => {
  if (!f || !Array.isArray(f.hours) || !Number.isFinite(f.fetchedAt)) return false
  const age = (now.getTime() - f.fetchedAt) / H
  return age >= 0 && age <= STALE_H
}

// ---------- F1 · rainOnWalk ----------
function rainOnWalk(ctx, now, today) {
  const { walk, forecast, path } = ctx
  // Kişisel olgu yoksa an yok (§3 F1); tahmin 18 saatten eskiyse hava cümlesi yok (§4.3)
  if (!walk || !Number.isInteger(walk.at) || !['habit', 'remind'].includes(walk.source) || !freshForecast(forecast, now)) return null
  const nowMin = minOf(now)
  if (walk.at <= nowMin) return null // VARSAYIM: bugünkü yürüyüş saati geçtiyse söylenmez
  const rain = rainSpan(forecast.hours, now)
  if (!rain || walk.at < rain.from - RAIN_BEFORE_MIN || walk.at > rain.to) return null
  const part = dayPartOf(walk.at)
  const facts = { walkAt: walk.at, rainFrom: rain.from, rainTo: rain.to < 1440 ? rain.to : null, part, source: walk.source, covered: false }
  if (Number.isInteger(walk.weekCount)) facts.n = walk.weekCount
  let cell
  if (walk.at < rain.from) cell = 'F1.B'
  else {
    const [a, b] = DAY_PART_RANGES[part]
    facts.covered = part !== 'night' && rain.from <= a && rain.to >= b
    const early = Math.floor((rain.from - EARLY_SHIFT_MIN) / 30) * 30
    const earlyOk = early >= 0 && early >= nowMin + EARLY_LEAD_MIN && early < walk.at
    if (earlyOk && !facts.covered) {
      facts.earlyAt = early
      cell = walk.source === 'remind' ? 'F1.E' : 'F1.A'
    } else cell = 'F1.C'
  }
  // Kişi bugünkü yolunu bitirdiyse Nef'in kendi bildirimi yok (§4.5); kartta kalır
  const channels = path?.doneToday ? ['card'] : ['notify', 'card']
  return { type: 'rainOnWalk', cell, facts, key: `rainOnWalk:${today}`, priority: PRIORITY.rainOnWalk, channels }
}

// ---------- F3 · hotWalk (yalnız kart) ----------
function hotWalk(ctx, now, today, rain) {
  const { walk, forecast } = ctx
  if (!walk || !Number.isInteger(walk.at) || !freshForecast(forecast, now) || walk.at <= minOf(now)) return null
  // VARSAYIM (taslak F3.A): öneri saati varsa onun hissedileni, yoksa yürüyüş saatinin
  const at = rain?.facts.earlyAt ?? walk.at
  const feels = feelsAt(forecast.hours, now, at)
  if (!isNum(feels) || feels < HOT_C) return null
  const facts = { feels: Math.round(feels), walkAt: walk.at, part: dayPartOf(walk.at), source: walk.source }
  return { type: 'hotWalk', cell: rain ? 'F3.A' : 'F3.B', facts, key: `hotWalk:${today}`, priority: PRIORITY.hotWalk, channels: ['card'] }
}

// ---------- F2 · recallEffect (geçen haftanın aynı günü ve dilimi, tek seans) ----------
function recallEffects(ctx, now) {
  const out = []
  const d = new Date(now)
  const lastWeek = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, 12))
  const part = dayPartOf(minOf(now))
  for (const e of ctx.effects ?? []) {
    if (!e || EXCLUDED_EFFECTS.has(e.key) || typeof e.pick !== 'function') continue
    const down = e.better === 'down'
    let best = null
    for (const s of ctx.sessions ?? []) {
      const t = new Date(s?.date)
      if (Number.isNaN(t.getTime()) || dayKey(t) !== lastWeek || dayPartOf(minOf(t)) !== part) continue
      const p = e.pick(s)
      if (!p || !isNum(p[0]) || !isNum(p[1])) continue
      const gain = down ? p[0] - p[1] : p[1] - p[0]
      if (gain < RECALL_MIN) continue // kötü yönde ya da küçük: an yok
      if (!best || t > best.t) best = { t, s, before: p[0], after: p[1] }
    }
    if (!best) continue
    out.push({
      type: 'recallEffect',
      cell: down ? 'F2.B' : 'F2.A',
      facts: { module: e.module, effect: e.key, measure: e.measure, better: down ? 'down' : 'up', before: best.before, after: best.after, part },
      key: `recall:${e.key}:${new Date(best.s.date).toISOString()}`,
      priority: PRIORITY.recallEffect,
      channels: ['card'],
    })
  }
  return out
}

// ---------- F2 · effectPattern (acuteEffects anlamlı, en az 3 seans, iyi yönde) ----------
function effectPatterns(ctx) {
  const out = []
  for (const a of ctx.acute ?? []) {
    if (!a || EXCLUDED_EFFECTS.has(a.key) || !a.sig || !(a.n >= ACUTE_MIN) || !(a.lo > 0)) continue
    const gain = round1(a.gain)
    if (!(gain > 0)) continue
    const down = a.better === 'down'
    out.push({
      type: 'effectPattern',
      cell: down ? 'F2.D' : 'F2.C',
      facts: { module: a.module, effect: a.key, measure: a.measure, better: down ? 'down' : 'up', n: a.n, gain, beforeAvg: a.before, afterAvg: a.after },
      // VARSAYIM: yeni seans yeni olgudur (anahtar seans sayısıyla)
      key: `pattern:${a.key}:${a.n}`,
      priority: PRIORITY.effectPattern,
      channels: ['card'],
    })
  }
  return out
}

// ---------- metricChange (yalnız doğrulanmış, iyi yönde, better: 'up') ----------
function metricChanges(ctx) {
  const out = []
  for (const m of ctx.metrics ?? []) {
    if (!m || EXCLUDED_METRICS.has(m.key) || EXCLUDED_DOMAINS.has(m.domain)) continue
    // Aşağı-iyi metrik için onaylı cümle yok (onaylı MC cümleleri "çıktı"): susar
    if (m.better !== 'up' || m.verdict !== 'better' || !isNum(m.start) || !isNum(m.current) || !(m.current > m.start)) continue
    // Bağlı ölçü (manifest metric.nefWith): o ölçü 'değişim yok' ya da 'başlangıcından iyi' değilse susar. Oku ve Anla:
    // anlama düşerken hız artışı övülmez (okuma-anlama/PLAN.md §5.2; Miyata 2012, Rayner 2016).
    if (m.with) {
      const w = (ctx.metrics ?? []).find((x) => x?.key === m.with)
      if (w?.verdict !== 'same' && w?.verdict !== 'better') continue
    }
    const facts = { module: m.module, metric: m.key, start: m.start, current: m.current }
    if (Number.isInteger(m.weeks)) facts.weeks = m.weeks
    out.push({ type: 'metricChange', cell: 'MC', facts, key: `metric:${m.key}:${m.start}:${m.current}`, priority: PRIORITY.metricChange, channels: ['card'] })
  }
  return out
}

// ---------- firstTime (A: ilk gün, sayısız · B: ilk ölçüm ya da ilk önce–sonra, yalnız iyi yönde) ----------
function firstTimes(ctx) {
  const out = []
  const seen = new Set()
  for (const f of ctx.firsts ?? []) {
    if (!f?.module || seen.has(f.module)) continue
    seen.add(f.module)
    let cell = 'FT'
    let facts = { module: f.module }
    const metricOk = f.kind === 'metric' && f.metric && !EXCLUDED_METRICS.has(f.metric) && !EXCLUDED_DOMAINS.has(f.domain) && isNum(f.value)
    const effectOk = f.kind === 'effect' && f.effect && !EXCLUDED_EFFECTS.has(f.effect) && f.better !== 'down' && isNum(f.before) && isNum(f.after) && f.after > f.before
    if (metricOk) {
      cell = 'FTB'
      facts = { module: f.module, metric: f.metric, start: f.value }
    } else if (effectOk) {
      cell = 'FTB'
      facts = { module: f.module, effect: f.effect, measure: f.measure, better: 'up', before: f.before, after: f.after }
    }
    // Ölçüm göz alanındaysa, uykuysa ya da önce–sonra kötü yöndeyse sayı söylenmez; yalnız ilk gün (taslak §5.2)
    out.push({ type: 'firstTime', cell, facts, key: `first:${f.module}`, priority: PRIORITY.firstTime, channels: ['card'] })
  }
  return out
}

// ---------- returnAfterGap (modüle 14+ gün aradan dönüş) ----------
function returnsAfterGap(ctx, today) {
  const out = []
  for (const g of ctx.gaps ?? []) {
    if (!g?.module || !(g.days >= MODULE_GAP_DAYS)) continue
    const facts = { module: g.module }
    const l = g.last
    if (l && l.effect && !EXCLUDED_EFFECTS.has(l.effect) && l.better !== 'down' && isNum(l.before) && isNum(l.after) && l.after > l.before) {
      Object.assign(facts, { effect: l.effect, measure: l.measure, better: 'up', before: l.before, after: l.after })
    }
    out.push({ type: 'returnAfterGap', cell: 'RG', facts, key: `gap:${g.module}:${today}`, priority: PRIORITY.returnAfterGap, channels: ['card'] })
  }
  return out
}

// ---------- pathDone (bugünkü yol bitti, bu hafta en az 2 tam gün) ----------
function pathDone(ctx, now) {
  const p = ctx.path
  if (!p?.doneToday || !Number.isInteger(p.doneDays) || p.doneDays < PATH_WEEK_MIN) return null
  return { type: 'pathDone', cell: 'PD', facts: { n: p.doneDays }, key: `pathDone:${dayKey(startOfWeek(now))}:${p.doneDays}`, priority: PRIORITY.pathDone, channels: ['card'] }
}

// Bağlam → anlar (önem sırasıyla). Sessiz gün her zaman en sonda (speak.js başka an konuşamazsa onu dener).
export function buildMoments(ctx = {}) {
  const now = ctx.now instanceof Date ? ctx.now : new Date(ctx.now ?? Date.now())
  const today = dayKey(now)
  // Düşük WHO-5: Nef yalnız sabit satırı işaret eder (who5.js WHO5_TEXT.low); öneri ve neşe cümlesi yok (§4.5)
  if (ctx.who5Low === true) return [{ type: 'lowWho5', cell: null, facts: {}, key: `lowWho5:${today}`, priority: PRIORITY.lowWho5, channels: ['card'] }]
  // Uzun aradan dönüş: tek cümle, sonra Nef o gün susar (§4.5). Yol alanı "Kaldığın yerden" satırını yazdıysa aynı
  // haber iki kez olmaz: Nef hiç konuşmaz (taslak F4.C VARSAYIM).
  if (isNum(ctx.appGapDays) && ctx.appGapDays >= APP_GAP_DAYS) {
    if (ctx.path?.backLine) return []
    return [{ type: 'returnApp', cell: 'F4.C', facts: {}, key: `returnApp:${today}`, priority: PRIORITY.returnApp, channels: ['card'] }]
  }
  const rain = rainOnWalk(ctx, now, today)
  const list = [
    pathDone(ctx, now),
    rain,
    hotWalk(ctx, now, today, rain),
    ...recallEffects(ctx, now),
    ...effectPatterns(ctx),
    ...metricChanges(ctx),
    ...firstTimes(ctx),
    ...returnsAfterGap(ctx, today),
  ].filter(Boolean)
  const hasPath = Boolean(ctx.path?.has) && !ctx.path?.doneToday
  list.push({ type: 'silentDay', cell: hasPath ? 'F4.A' : 'F4.B', facts: {}, key: `silentDay:${today}`, priority: PRIORITY.silentDay, channels: ['card'] })
  return list.sort((a, b) => b.priority - a.priority)
}
