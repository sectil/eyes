// Nef'in bildirim planlayıcısı (Nef PLAN §4.2, §4.3, §4.5; ANA_OTURUM_ISTEMI N1 madde 5). Saf: kurmaz, yazmaz.
// notifyAll.planAll bütün kaynakları dizdikten SONRA çağırır (en düşük öncelik): kimse Nef için yer açmaz, kaymaz,
// düşmez; Nef yalnız kalan boşluğa girer.
//
// Tek an: F1 rainOnWalk (Nef'in kendi bildirimi yalnız hava–saat çakışmasında; söz ve mektup N2/N3'te). Sıcaklık
// (F3 hotWalk) bildirime girmez, yalnız kartta (sahip kararı, N1-CUMLELER-onay.md başı): an motoru onu yalnız kart
// kanalına koyar.
//
// Sıra (plan §4.2 "var olan bildirimin metnini zenginleştirmek yeni bildirim eklemekten önce gelir"; §3 F1 "günde tek
// hava cümlesi kuralı bozulmaz"):
//   1. O gün planda sabah havası (7700–7701) varsa YALNIZ onun metni zenginleşir; olmazsa Nef o gün susar (ikinci bir
//      hava cümlesi gelmez).
//   2. Sabah havası yoksa yürüyüş modülünün hatırlatması (7800–7859, module 'walk'; VARSAYIM aşağıda).
//   3. İkisi de yoksa Nef'in kendi bildirimi (7900–7919; gün başına bir kimlik).
// Zenginleştirmede kimlik, saat, tür ve extra'nın öteki alanları değişmez; yalnız title, body ve extra.nef.
// 74xx (deney), 75xx (çalışma oturumu), 7860–7867 (legacy ek saatleri: deney bildirimi, PLAN.v1 §A.4 "Sayı bütçesi")
// ve 7710–7719 hiçbir zaman zenginleşmez.
//
// Bütçe tek kaynak: speak.js NOTIFY_DAY_MAX / NOTIFY_WEEK_MAX, sayaç hafızanın 'notify' satırları (memory.js
// notifyCounts). Zenginleşen bildirim de bütçeye sayılır (VARSAYIM, en tutucu: plan "kişinin kurduğu hatırlatmalar
// sayılmaz" diyor, zenginleşen metin ise Nef'in sözüdür).
//
// Kurallar (Nef'in kendi bildirimi; zenginleştirmede de, VARSAYIM tutucu): gece 01–05 (speak.js) ve gece sessizliği,
// alarm varsa yatmadan önceki 60 dk, çalışma oturumu (rules.blocked; planAll verir), kişi bugünkü yolunu bitirdiyse
// yok, yürüyüş deneyinin sessiz gününde yok (VARSAYIM: deneyin kontrol günü bozulmasın), tahmin 18 saatten eskiyse yok
// (moments.js). Yalnız kendi bildiriminde ayrıca: öteki her bildirime ≥ 30 dk, 74xx'e ≥ 60 dk (VARSAYIM: Nef'in modül
// saati kuralıyla aynı), JS bekleyeni ≤ 58 (rules.room).
//
// Hafıza: rows = memory.loadSaid çıktısı. Saati henüz gelmemiş satırlar (planlanmış, gönderilmemiş) yok sayılır; plan her
// açılışta yeniden kurulur, çağıran planın `said` listesini memory.syncPlannedNotify ile yazar.
import { buildMoments, rainSpan, RAIN_BEFORE_MIN } from './moments.js'
import { speak } from './speak.js'
import { prune } from './memory.js'
import trBank from './bank/tr.js'
import { dayKey } from '../calendar.js'
import { normalizeReminders, toMinutes } from '../reminders.js'
import { MORNING_TEMPLATES, WEATHER_IDS, BODY_MAX } from '../weatherNotify.js'

export const NEF_ID = 7900
export const NEF_ID_LAST = 7919
export const NEF_HORIZON_DAYS = 2 // bugün ve yarın (sabah havası 7700–7701 ile aynı ufuk; VARSAYIM)
export const OWN_LEAD_MIN = 120 // kendi bildirimi: yürüyüşten ya da yağmurdan (erken olan) 2 sa önce (VARSAYIM)
export const OWN_BACK_MIN = 120 // yer yoksa 15 dk adımla en çok 2 sa daha erken; sonra ileri, en geç 30 dk önceye
export const OWN_STEP_MIN = 15
export const APART_MIN = 30 // öteki bildirimlere (notifyAll MIN_APART_MIN ile aynı)
export const EXPERIMENT_GAP_MIN = 60 // 74xx'e (moduleRemind MIN_GAP_MIN ile aynı)
// Zenginleşebilen kimlikler: sabah havası ve modül hatırlatmaları (yalnız yürüyüş modülü)
export const ENRICH_RANGES = Object.freeze([[7700, 7701], [7800, 7859]])
// VARSAYIM: 78xx'te yalnız yürüyüş modülünün hatırlatması zenginleşir; başka modülün hatırlatmasında yağmur cümlesi
// dokunuşla açılan modülle çelişir. Bugün kayıtta yürüyüş modülü yok (B3); o gelene dek 78xx zenginleşmez.
export const WALK_MODULE = 'walk'
// Hava cümlesinin kaynak satırı (onaylı MW-S); gövdeye sayılır (PLAN.v1 §A.6). VARSAYIM: F1 her kanalda bu satırı taşır.
export const SOURCE_LINE = MORNING_TEMPLATES.find((t) => t.cell === 'source').text
export const SOURCE_SEP = '\n'
export const F1_BODY_MAX = BODY_MAX - [...`${SOURCE_SEP}${SOURCE_LINE}`].length
export const BANKS = Object.freeze({ tr: trBank })

const MIN = 60000
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const inRanges = (ranges, id) => Number.isInteger(id) && ranges.some(([a, b]) => id >= a && id <= b)
const isWeatherId = (id) => WEATHER_IDS.includes(id)
const dateOf = (n) => n?.extra?.date ?? dayKey(new Date(n.at))
const atMin = (dayStart, m) => new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(m / 60), m % 60).getTime()

// Zenginleşebilir mi: aralıkta, metni bağlanmış, Swift'in yerelde yenilediği hava değil; 78xx'te yalnız yürüyüş modülü
export function enrichable(n) {
  if (!n || !inRanges(ENRICH_RANGES, n.id) || n.keepPending === true) return false
  if (typeof n.title !== 'string' || typeof n.body !== 'string') return false
  if (isWeatherId(n.id)) return true
  return n.extra?.kind === 'remind' && (n.module ?? n.extra?.module) === WALK_MODULE
}

// Kişinin o günkü yürüyüş saati olgusu (VARSAYIM kaynak): kurduğu yürüyüş hatırlatması (settings.reminders.types.walk;
// ana anahtar açık, tür açık, o gün seçili). Alışkanlık saati için bugün kaynak yok: habit-log yalnız mola ve su,
// Apple Sağlık özeti saat taşımıyor, yürüyüş kaydı (walk-log) B3'te. Yeni veri toplanmaz.
export function walkFactOf(reminders, day) {
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return null
  const w = r.types.walk
  const at = toMinutes(w.time)
  if (!w.on || at == null || !w.days.includes(day.getDay())) return null
  return { at, source: 'remind' }
}

// sky.js önbelleği → an motorunun tahmin biçimi
export function forecastOf(cache) {
  const hours = cache?.data?.hours
  const fetchedAt = cache ? new Date(cache.at).getTime() : NaN
  return Array.isArray(hours) && Number.isFinite(fetchedAt) ? { fetchedAt, hours } : null
}

// Girdi:
//   now · notifications: planAll'ın dizdiği son liste (metinleri bağlanmış) · reminders: settings.reminders
//   weather: { cache } (sky.js loadCache) · log: planNotifications günlüğü (deney zarı)
//   nef: { rows (memory.loadSaid), lang (varsayılan 'tr'), pathDoneToday, who5Low, appGapDays }
//   rules: { blocked(ms) → neden | null, room: eklenebilecek bekleyen sayısı, leadMs }
// Döner: { notifications, said: [{ type, key, id, title, channel: 'notify', at: ISO, date, notifyId, mode }],
//   skipped: [{ module: 'nef', date, time: null, reason }], changed }
export function planNef({ now = new Date(), notifications = [], reminders = null, weather = null, log = [], nef = null, rules = {} } = {}) {
  const list = Array.isArray(notifications) ? notifications : []
  const out = { notifications: list, said: [], skipped: [], changed: false }
  if (!isObj(nef)) return out
  const lang = typeof nef.lang === 'string' ? nef.lang : 'tr'
  const bank = BANKS[lang] ?? null
  const forecast = forecastOf(weather?.cache)
  if (!bank || !forecast) return out
  const nowMs = new Date(now).getTime()
  const blocked = typeof rules.blocked === 'function' ? rules.blocked : () => null
  const leadMs = Number.isFinite(rules.leadMs) ? rules.leadMs : 0
  let room = Number.isFinite(rules.room) ? rules.room : Infinity
  // Saati gelmemiş satırlar (planlanmış) sayılmaz: plan yeniden kurulurken kendi eski kararına takılmasın
  const work = prune(nef.rows, now).filter((r) => Date.parse(r.at) <= nowMs)
  const next = [...list]
  const skip = (date, reason) => out.skipped.push({ module: 'nef', date, time: null, reason })
  const base = new Date(nowMs)

  for (let d = 0; d < NEF_HORIZON_DAYS; d++) {
    const dayStart = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d)
    const date = dayKey(dayStart)
    const pathDone = d === 0 && nef.pathDoneToday === true
    const walk = walkFactOf(reminders, dayStart)
    if (!walk) continue // kişisel olgu yok: an yok (§3 F1)
    if (pathDone) { skip(date, 'pathDone'); continue }
    if ((Array.isArray(log) ? log : []).some((e) => e?.date === date && e.type === 'walk' && e.arm === 'silent')) { skip(date, 'experiment'); continue }

    // t anında F1 bildirimi (speak; bütçe, hafıza, 01–05 ve sınırlar orada)
    const sayAt = (t) => {
      const ctx = { now: new Date(t), walk, forecast, path: { doneToday: pathDone }, who5Low: nef.who5Low === true, ...(d === 0 && Number.isFinite(nef.appGapDays) ? { appGapDays: nef.appGapDays } : {}) }
      const said = speak({ moments: buildMoments(ctx), rows: work, bank, lang, now: new Date(t), notifyAt: new Date(t), pathDone, channels: ['notify'], notifyBodyMax: F1_BODY_MAX })
      return said.find((x) => x.channel === 'notify' && x.type === 'rainOnWalk') ?? null
    }
    const textOf = (s) => ({ title: s.title, body: `${s.text}${SOURCE_SEP}${SOURCE_LINE}` })
    const remember = (s, n, mode) => {
      const row = { type: s.type, key: s.key, id: s.id, title: s.titleId, channel: 'notify', at: new Date(n.at).toISOString(), date, notifyId: n.id, mode }
      out.said.push(row)
      work.push({ at: row.at, date, type: row.type, key: row.key, id: row.id, channel: 'notify' })
      out.changed = true
    }

    // 1–2) Zenginleştirme
    const dayList = next.filter((n) => n && dateOf(n) === date)
    const hasWeather = dayList.some((n) => isWeatherId(n.id))
    const hosts = dayList.filter(enrichable).filter((n) => !hasWeather || isWeatherId(n.id)).sort((a, b) => new Date(a.at) - new Date(b.at) || a.id - b.id)
    let done = false
    for (const n of hosts) {
      const t = new Date(n.at).getTime()
      if (blocked(t)) continue
      const s = sayAt(t)
      if (!s) continue
      const i = next.indexOf(n)
      const { sci: _sci, ...extra } = n.extra ?? {}
      next[i] = { ...n, ...textOf(s), extra: { ...extra, nef: { type: s.type, key: s.key, text: s.id, title: s.titleId } } }
      remember(s, n, 'enrich')
      done = true
      break
    }
    if (done) continue
    if (hasWeather) { skip(date, 'weatherDay'); continue } // günde tek hava cümlesi

    // 3) Nef'in kendi bildirimi
    const rain = rainSpan(forecast.hours, new Date(Math.max(nowMs, dayStart.getTime())))
    if (!rain || walk.at < rain.from - RAIN_BEFORE_MIN || walk.at > rain.to || walk.at >= 1440) continue
    if (room < 1) { skip(date, 'pending'); continue }
    const anchor = Math.min(walk.at, rain.from) - OWN_LEAD_MIN
    const last = Math.min(walk.at, rain.from) - APART_MIN
    const tries = []
    for (let m = anchor; m >= anchor - OWN_BACK_MIN; m -= OWN_STEP_MIN) tries.push(m)
    for (let m = anchor + OWN_STEP_MIN; m <= last; m += OWN_STEP_MIN) tries.push(m)
    const taken = next.map((n) => ({ id: n.id, ms: new Date(n.at).getTime() }))
    let placed = null
    let why = 'noText'
    for (const m of tries) {
      if (m < 0) continue
      const t = atMin(dayStart, m)
      if (t <= nowMs + leadMs) { why = 'past'; continue }
      const b = blocked(t)
      if (b) { why = b; continue }
      if (taken.some((x) => Math.abs(x.ms - t) < APART_MIN * MIN)) { why = 'gap'; continue }
      if (taken.some((x) => x.id >= 7400 && x.id <= 7499 && Math.abs(x.ms - t) < EXPERIMENT_GAP_MIN * MIN)) { why = 'gap'; continue }
      const s = sayAt(t)
      if (!s) { why = 'noText'; continue }
      placed = { t, s }
      break
    }
    if (!placed) { skip(date, why); continue }
    const n = {
      id: NEF_ID + d,
      at: new Date(placed.t),
      type: 'nef',
      ...textOf(placed.s),
      extra: { kind: 'nef', type: placed.s.type, key: placed.s.key, text: placed.s.id, title: placed.s.titleId, date, route: 'home' },
      level: 'active',
    }
    next.push(n)
    room--
    remember(placed.s, n, 'own')
  }
  if (out.changed) out.notifications = next.sort((a, b) => a.at - b.at || a.id - b.id)
  return out
}
