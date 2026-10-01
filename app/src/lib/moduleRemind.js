// Modül hatırlatmaları ("Bana hatırlat") — saf fonksiyonlar (PLAN.v1 §3.A.1–A.4, §5.1, §5.5 madde 1).
// Planı yalnız hesaplar; kurmaz, ayar yazmaz, kayıt defterine (modules/registry.js) bağlanmaz: modül listesi
// argüman olarak gelir (registry.reminders() biçimi). Bildirim metni yazılmaz; yer tutucu anahtar (textKey) döner,
// cümleler lib/remindTexts.js'te (sahip onaylı) ve planAll({ texts: true }) bağlar.
//
// settings.moduleReminders = {                        (asla settings.reminders içine değil: normalizeReminders
//   [modül | 'path']: {                                 bilmediği alanı atar)
//     on, mode: 'auto'|'manual', times: ['HH:MM'],    en çok 3 saat; legacy türlerde yalnız 2. ve 3. saat
//     autoAt: ISO|null, setAt: ISO|null,              autoAt: "Sen karar ver" son hesabı (14 günde bir yenilenir)
//   },
// }
// Kimlikler: 7800–7859 modül hatırlatmaları (7800 + gün × 20 + sıra; ufuk 3 gün); 7860–7867 legacy ek saatleri
// (7860 + tür sırası × 2 + yuva; ufuk 24 saat). Kapalıyken (moduleReminders boş) çıktı boştur.
import { normalizeReminders, toMinutes } from './reminders.js'
import { dayKey, keyDay } from './habitLog.js'
import { LEAD_MS, walkThreshold } from './notifyPlan.js'

export const MR_ID = 7800
export const MR_ID_LAST = 7859
export const MR_PER_DAY = 20 // gün başına kimlik yuvası (3 gün × 20 = 60)
export const MR_HORIZON_DAYS = 3 // PLAN §A.4 "Sayı bütçesi": önce 3 gün; bütçe daraltması planAll'da (horizon parametresi)
export const EXTRA_ID = 7860 // legacy ek saatleri 7860–7867
export const EXTRA_ID_LAST = 7867
export const LEGACY_ORDER = { mola: 0, walk: 1, breath: 2, water: 3 } // §5.5 madde 1 (TYPE_INDEX ile aynı sıra)
export const MAX_TIMES = 3 // her modülde günde en çok 3 saat (sahip kararı, DEVIR §1.4)
export const SLOT_MIN = 15 // "Sen karar ver": 15 dakikalık dilim
export const LEAD_MIN = 15 // hatırlatma dilimden 15 dk önce (VARSAYIM, PLAN §A.3)
export const LOOKBACK_DAYS = 28
export const MIN_DAYS = 5 // beş farklı günden az kayıt → remind.defaultTime
export const SECOND_GAP_MIN = 120 // ikinci saat: aynı günde ilkinden en az 2 saat uzak dilim
export const RECALC_DAYS = 14
export const EXTRA_DONE_MS = 2 * 3600000 // ek saat: o saatten önceki son 2 saatte yapıldıysa düşer (§5.5 madde 1)
export const PATH_ID = 'path'
// "Bana hatırlat" pencereleri ve 60 dk (PLAN.v1 §A.2, §A.4; eskiden lib/reminders.js'teydi): legacy türler 09.00–21.00,
// su ≤ 18.00; bildirimler arası en az 60 dk. Sahip kararı (2026-10-01, D5+D6'nın devamı: "kullanıcı istediği saate
// kurar, bunu kısıtlayamazsın"): bu kurallar yalnız Nef'in KENDİ seçtiği saatlere uygulanır ("Nef seçsin" önerisi ve
// yeniden hesabı, veri yokken öneri saati; mode 'auto'). Kişinin elle seçtiği saatlere (mode 'manual') pencere, su
// 18.00 ve 60 dk uygulanmaz; kurulumda yalnız geçersiz saat hatadır (remindTimeError).
export const LEGACY_WINDOW = Object.freeze({ from: '09:00', to: '21:00' })
export const WATER_LAST = '18:00'
export const MIN_GAP_MIN = 60
// Pencereler (PLAN §A.4 gece kuralı; yalnız Nef'in kendi saatleri): hareket 09–21, sakin 08–22; legacy türler
// LEGACY_WINDOW (su ≤ 18.00)
export const REMIND_WINDOWS = Object.freeze({
  move: Object.freeze({ from: '09:00', to: '21:00' }),
  calm: Object.freeze({ from: '08:00', to: '22:00' }),
})
// VARSAYIM: remind.defaultTime yazılmamışsa veri yokken saat (her iki pencerenin içinde; PLAN §A.2 örneği 16.30)
export const FALLBACK_TIME = '16:30'
// Yol hatırlatması: Ana sayfayı açar, hareket penceresi, günde tek bildirim (PLAN §A.2 "Birim yoldur"). Kaynak singh2024
// (metin-B1a-onay.md karar 3, sahip onaylı)
export const PATH_REMIND = Object.freeze({ route: 'home', window: 'move', maxTimes: 1, science: Object.freeze(['singh2024']) })

const DAY_MS = 86400000
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const isIso = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v))
const pad = (n) => String(n).padStart(2, '0')
export const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

// O günün yerel saatiyle an (takvim aritmetiği; notifyPlan.js ile aynı: yaz saati geçişinde 09:15 09:15 kalır)
const atOn = (day, time) => {
  const m = toMinutes(time)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60, 0, 0)
}

// Modülün penceresi (dakika; Nef'in kendi saatleri için). legacy: LEGACY_WINDOW (su WATER_LAST); yoksa window ('move' varsayılan)
export function windowOf(remind) {
  const w = remind?.legacy
    ? { from: LEGACY_WINDOW.from, to: remind.legacy === 'water' ? WATER_LAST : LEGACY_WINDOW.to }
    : (REMIND_WINDOWS[remind?.window] ?? REMIND_WINDOWS.move)
  return { from: toMinutes(w.from), to: toMinutes(w.to) }
}

// Günde en çok kaç saat: remind.maxTimes (1–3), yol her zaman 1
export function capOf(id, remind) {
  if (id === PATH_ID) return 1
  const n = remind?.maxTimes
  return Number.isInteger(n) && n >= 1 && n <= MAX_TIMES ? n : MAX_TIMES
}

// Ham ayar → tam biçim (her çağrı yeni nesne). Geçersiz saat atılır; saatler sıralı, tekrarsız, en çok 3.
export function normalizeModuleReminders(raw) {
  const out = {}
  if (!isObj(raw)) return out
  for (const [id, v] of Object.entries(raw)) {
    if (!isObj(v)) continue
    const times = [...new Set((Array.isArray(v.times) ? v.times : []).filter((t) => toMinutes(t) != null))]
      .sort((a, b) => toMinutes(a) - toMinutes(b))
      .slice(0, MAX_TIMES)
    out[id] = {
      on: v.on === true,
      mode: v.mode === 'manual' ? 'manual' : 'auto',
      times,
      autoAt: isIso(v.autoAt) ? v.autoAt : null,
      setAt: isIso(v.setAt) ? v.setAt : null,
    }
  }
  return out
}

// Kaydın başlangıcı ve KENDİ yerel saati ("dilimleme kaydın kendi yerel saatiyle", PLAN §A.3).
// Kayıt: sessions ({ date: bitiş ISO, seconds }) ya da habit-log ({ at: ISO }); başlangıç ≈ date − seconds.
// VARSAYIM: yerel saat şu sırayla okunur: (1) kayıtta tzOffset (getTimezoneOffset işaretiyle, dakika),
// (2) ISO dizesindeki açık fark (+03:00), (3) yoksa telefonun şimdiki saat dilimi. Bugünkü kayıtlar 'Z' ile
// yazıldığı için (3) geçerli: yolculuktan önceki kayıtlar yeni dilimin saatine göre okunur.
export function recordLocal(rec) {
  if (!isObj(rec)) return null
  const raw = rec.at ?? rec.date
  const ms = Date.parse(raw)
  if (!Number.isFinite(ms)) return null
  const startMs = rec.at == null && Number.isFinite(rec.seconds) && rec.seconds > 0 ? ms - rec.seconds * 1000 : ms
  let off = null
  if (Number.isFinite(rec.tzOffset)) off = -rec.tzOffset
  else if (typeof raw === 'string') {
    const m = /T[^Z]*([+-])(\d{2}):?(\d{2})$/.exec(raw)
    if (m) off = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
  }
  if (off == null) {
    const d = new Date(startMs)
    return { ms: startMs, day: dayKey(d), min: d.getHours() * 60 + d.getMinutes() }
  }
  const w = new Date(startMs + off * 60000)
  return { ms: startMs, day: `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}`, min: w.getUTCHours() * 60 + w.getUTCMinutes() }
}

const toMin = (v) => (typeof v === 'number' ? v : toMinutes(v))
const clash = (m, busy, gap = MIN_GAP_MIN) => busy.some((b) => Math.abs(b - m) < gap)

// Pencere içinde, meşgul saatlerden ≥ 60 dk uzak ilk uygun saat: önce ileri (15 dk adımla, "bir sonraki uygun
// dilim"), yoksa geri (VARSAYIM). Hiçbiri yoksa null.
function freeFrom(m, win, busy) {
  for (let t = m; t <= win.to; t += SLOT_MIN) if (!clash(t, busy)) return t
  for (let t = m - SLOT_MIN; t >= win.from; t -= SLOT_MIN) if (!clash(t, busy)) return t
  return null
}

// Kurulum denetimi (saat seçici, elle seçilen saat): yalnız geçersiz saat hatadır ('invalid'); pencere ve 60 dk yok
// (sahip kararı 2026-10-01). Yakındaki öteki bildirimler engel değil, bilgi satırıdır (components/NearNote.jsx).
export function remindTimeError(time) {
  return toMinutes(time) == null ? 'invalid' : null
}

// "Sen karar ver" (PLAN §A.3).
// Girdi: records (bu modülün — yolda yolun — kayıtları; { date, seconds } | { at }, isteğe bağlı night, path,
//   tzOffset), remind (manifest alanı), now, busy (başka bildirimlerin saatleri: 'HH:MM' ya da dakika),
//   maxTimes (öneri sayısı üst sınırı; varsayılan remind.maxTimes), forPath (true: yalnız yol kayıtları)
// Çıktı: { source: 'data'|'default', days (son 28 günde farklı gün), times: ['HH:MM'],
//   picks: [{ time, usual: 'HH:MM'|null, days, clamped: null|'early'|'late', shifted }] }
//   usual: kişinin genelde başladığı dilim; clamped: öneri pencere dışına düştü, pencerenin ucu önerildi (§A.2);
//   shifted: başka bildirime 60 dk'dan yakındı, sonraki uygun dilime kaydı. Uygun saat yoksa times boş.
export function pickAutoTime({ records = [], remind = {}, now = new Date(), busy = [], maxTimes, forPath = false } = {}) {
  const nowMs = new Date(now).getTime()
  const win = windowOf(remind)
  const cap = Math.min(maxTimes ?? capOf(forPath ? PATH_ID : null, remind), forPath ? 1 : MAX_TIMES)
  const taken = busy.map(toMin).filter(Number.isFinite)

  // Farklı gün sayımı: dilim → gün kümesi. Gece kayıtları (Dalga uyku kipi, alarm) ve yol işareti uymayanlar dışarıda.
  const bySlot = Array.from({ length: 1440 / SLOT_MIN }, () => new Set())
  const allDays = new Set()
  for (const rec of Array.isArray(records) ? records : []) {
    if (!isObj(rec) || rec.night === true || (rec.path === true) !== forPath) continue
    const loc = recordLocal(rec)
    if (!loc || loc.ms > nowMs || loc.ms < nowMs - LOOKBACK_DAYS * DAY_MS) continue
    bySlot[Math.floor(loc.min / SLOT_MIN)].add(loc.day)
    allDays.add(loc.day)
  }

  const picks = []
  const place = (want, usual, days) => {
    const clamped = want < win.from ? 'early' : want > win.to ? 'late' : null
    const inWin = Math.min(Math.max(want, win.from), win.to)
    const t = freeFrom(inWin, win, [...taken, ...picks.map((p) => toMinutes(p.time))])
    if (t == null) return false
    picks.push({ time: fromMinutes(t), usual, days, clamped, shifted: t !== inWin })
    return true
  }

  if (allDays.size < MIN_DAYS) {
    const def = toMinutes(remind?.defaultTime) ?? toMinutes(FALLBACK_TIME)
    place(def, null, 0)
    return { source: 'default', days: allDays.size, times: picks.map((p) => p.time), picks }
  }

  // Yumuşatma (VARSAYIM): dilimin puanı kendisi ve iki komşusundaki (±15 dk) farklı günlerin birleşimi;
  // eşitlikte dilimin kendi gün sayısı, sonra erken saat.
  const score = bySlot.map((_, s) => new Set([...(bySlot[s - 1] ?? []), ...bySlot[s], ...(bySlot[s + 1] ?? [])]).size)
  const better = (a, b) => score[a] - score[b] || bySlot[a].size - bySlot[b].size || b - a
  const order = score.map((_, s) => s).filter((s) => bySlot[s].size > 0).sort((a, b) => better(b, a))
  const first = order[0]
  place(first * SLOT_MIN - LEAD_MIN, fromMinutes(first * SLOT_MIN), score[first])
  // İkinci saat: aynı günde ilkinden ≥ 2 saat uzak ikinci bir dilimde en az 5 günlük kayıt (üçüncü saat önerilmez)
  if (cap >= 2 && picks.length === 1) {
    const second = order.find((s) => Math.abs(s - first) * SLOT_MIN >= SECOND_GAP_MIN && score[s] >= MIN_DAYS)
    if (second != null) place(second * SLOT_MIN - LEAD_MIN, fromMinutes(second * SLOT_MIN), score[second])
  }
  picks.sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
  return { source: 'data', days: allDays.size, times: picks.map((p) => p.time), picks }
}

// autoAt 14 günden eskiyse (ya da yoksa) yeniden hesap zamanı
export const recalcDue = (autoAt, now) => !isIso(autoAt) || new Date(now).getTime() - Date.parse(autoAt) >= RECALC_DAYS * DAY_MS

// Bilim kartı anahtarı: science havuzundan güne göre sırayla (VARSAYIM; havuz boşsa null)
const evidenceFor = (remind, key) => {
  const pool = Array.isArray(remind?.science) ? remind.science : []
  return pool.length ? pool[(((keyDay(key) % pool.length) + pool.length) % pool.length)] : null
}

// Planlayıcı.
// Girdi: now; modules: [{ id, remind: { route, legacy, window, defaultTime, maxTimes, science }, doneToday,
//   records? }] (registry.reminders() + App'in süzdüğü kayıtlar; doneToday: bool ya da (sessions, now) → bool;
//   yol için id 'path', yoksa PATH_REMIND kullanılır); moduleReminders: settings.moduleReminders;
//   reminders: settings.reminders (ana anahtar, legacy ilk saat); study: settings.reminder; sessions;
//   fixed: planNotifications'ın bildirimleri (74xx; 60 dk kuralı); log: planNotifications'ın günlüğü (legacy ek
//   saatlerin zarı); health: { avgSteps } (yürüyüş ek saatinin WalkGuard eşiği); horizon (gün, 1–3)
// Çıktı: {
//   notifications: [{ id 7800–7859, at, type: 'remind', module, textKey, extra: { kind: 'remind', module, route,
//     evidence, date, auto }, level: 'active' }],
//   extras: [{ id 7860–7867, at, type, textKey, extra: { kind: 'nudge', type, date, slot }, level: 'active' }],
//   walkGuards: [{ id, date, threshold }],
//   updates: [{ module, times, autoAt }]      deney dışı "Sen karar ver": yeni saat kendiliğinden (çağıran yazar)
//   proposals: [{ module, type, from, to }]   deney türü: saat yalnız kişi onaylarsa değişir (§A.3)
//   skipped: [{ module, date, time, reason }] 'doneBefore' | 'window' | 'gap' | 'past' | 'budget' | 'arm'
// }
// 'window' ve 'gap' yalnız Nef'in seçtiği saatlerde (mode 'auto'); elle seçilen saat (mode 'manual') pencereye, su
// 18.00'e, deney saatine 60 dk'ya ve ek saatte ilk saate 60 dk'ya bakılmadan kurulur (sahip kararı 2026-10-01).
export function planModuleReminders({
  now = new Date(), modules = [], moduleReminders, reminders, study = null, sessions = [],
  fixed = [], log = null, health = null, horizon = MR_HORIZON_DAYS,
} = {}) {
  const out = { notifications: [], extras: [], walkGuards: [], updates: [], proposals: [], skipped: [] }
  const r = normalizeReminders(reminders)
  const mr = normalizeModuleReminders(moduleReminders)
  if (r.optIn !== 'yes' || Object.keys(mr).length === 0) return out

  const nowMs = new Date(now).getTime()
  const base = new Date(nowMs)
  const days = Math.max(1, Math.min(MR_HORIZON_DAYS, Number.isInteger(horizon) ? horizon : MR_HORIZON_DAYS))
  const fixedMs = (Array.isArray(fixed) ? fixed : []).map((n) => new Date(n?.at).getTime()).filter(Number.isFinite)
  const nearFixed = (ms) => fixedMs.some((f) => Math.abs(f - ms) < MIN_GAP_MIN * 60000)
  const list = (Array.isArray(modules) ? modules : []).filter((m) => isObj(m) && typeof m.id === 'string' && isObj(m.remind))
  if (mr[PATH_ID]?.on && !list.some((m) => m.id === PATH_ID)) list.push({ id: PATH_ID, remind: PATH_REMIND, doneToday: false })
  const isDone = (m) => (typeof m.doneToday === 'function' ? m.doneToday(sessions, base) === true : m.doneToday === true)

  // Bütün kurulu saatler (dakika): "Sen karar ver" yeniden hesabında 60 dk kuralının meşgul listesi
  const busyOf = (selfKey) => {
    const b = []
    for (const [t, c] of Object.entries(r.types)) if (c.on && c.time && t !== selfKey) b.push(toMinutes(c.time))
    if (r.types.study.on && toMinutes(study?.time) != null) b.push(toMinutes(study.time))
    for (const [k, c] of Object.entries(mr)) if (c.on && k !== selfKey) b.push(...c.times.map(toMinutes))
    return b
  }

  // 1) Modül hatırlatmaları (legacy olmayanlar ve yol)
  const perDay = Array.from({ length: days }, () => [])
  for (const m of list) {
    if (m.remind.legacy) continue
    const cfg = mr[m.id]
    if (!cfg?.on) continue
    const cap = capOf(m.id, m.remind)
    let times = cfg.times.slice(0, cap)
    if (cfg.mode === 'auto' && recalcDue(cfg.autoAt, base) && Array.isArray(m.records)) {
      const pick = pickAutoTime({ records: m.records, remind: m.remind, now: base, busy: busyOf(m.id), forPath: m.id === PATH_ID })
      if (pick.source === 'data' && pick.times.length) {
        // Deney dışı modülde saat kendiliğinden değişir (Bildirimler'de tek satırla söylenir); saat sayısı korunur
        times = pick.times.slice(0, Math.max(1, Math.min(times.length || 1, cap)))
        out.updates.push({ module: m.id, times, autoAt: base.toISOString() })
      }
    }
    const win = windowOf(m.remind)
    const manual = cfg.mode === 'manual'
    for (let d = 0; d < days; d++) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d)
      const key = dayKey(day)
      for (const time of times) {
        const skip = (reason) => out.skipped.push({ module: m.id, date: key, time, reason })
        const min = toMinutes(time)
        const at = atOn(day, time)
        if (at.getTime() <= nowMs + LEAD_MS) { skip('past'); continue }
        if (d === 0 && isDone(m)) { skip('doneBefore'); continue }
        if (!manual && (min < win.from || min > win.to)) { skip('window'); continue }
        if (!manual && nearFixed(at.getTime())) { skip('gap'); continue } // Nef'in saati deney saatine 60 dk'dan yakın kurulmaz (§A.4 (1))
        perDay[d].push({ m, time, at, key, auto: cfg.mode === 'auto' })
      }
    }
  }
  perDay.forEach((items, d) => {
    items.sort((a, b) => a.at - b.at || (a.m.id < b.m.id ? -1 : a.m.id > b.m.id ? 1 : 0))
    items.forEach((it, i) => {
      if (i >= MR_PER_DAY) { out.skipped.push({ module: it.m.id, date: it.key, time: it.time, reason: 'budget' }); return }
      out.notifications.push({
        id: MR_ID + d * MR_PER_DAY + i,
        at: it.at,
        type: 'remind',
        module: it.m.id,
        textKey: `remind.${it.m.id}`, // yer tutucu: metin B1a'da (sahip onayı)
        extra: { kind: 'remind', module: it.m.id, route: it.m.remind.route ?? null, evidence: evidenceFor(it.m.remind, it.key), date: it.key, auto: it.auto },
        level: 'active',
      })
    })
  })

  // 2) Legacy türler: ilk saat planNotifications'ta (74xx); 2. ve 3. saat burada, aynı günün zarıyla (§5.5 madde 1)
  const logList = Array.isArray(log) ? log : []
  const avg = Number.isFinite(health?.avgSteps) && health.avgSteps > 0 ? health.avgSteps : null
  for (const m of list) {
    const type = m.remind.legacy
    if (!type || !(type in LEGACY_ORDER) || !r.types[type].on) continue
    const cfg = mr[type] ?? mr[m.id]
    if (!cfg) continue
    // Deney türünde saat yalnız kişi onaylarsa değişir: yalnız öneri döner (§A.3)
    if (cfg.mode === 'auto' && recalcDue(cfg.autoAt, base) && Array.isArray(m.records)) {
      const pick = pickAutoTime({ records: m.records, remind: m.remind, now: base, busy: busyOf(type), maxTimes: 1 })
      if (pick.source === 'data' && pick.times[0] && pick.times[0] !== r.types[type].time) {
        out.proposals.push({ module: m.id, type, from: r.types[type].time, to: pick.times[0] })
      }
    }
    const firstMin = toMinutes(r.types[type].time)
    const win = windowOf(m.remind)
    const manual = cfg.mode === 'manual'
    const doneMs = (Array.isArray(m.records) ? m.records : []).map(recordLocal).filter(Boolean).map((x) => x.ms)
    cfg.times.slice(0, capOf(m.id, m.remind) - 1).slice(0, 2).forEach((time, slot) => {
      const min = toMinutes(time)
      let at = atOn(base, time)
      if (at.getTime() <= nowMs + LEAD_MS) at = atOn(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1), time)
      const key = dayKey(at)
      const skip = (reason) => out.skipped.push({ module: m.id, date: key, time, reason })
      // Ufuk önümüzdeki 24 saat. VARSAYIM: bugünkü saat (now, now + LEAD_MS] içindeyse yarına kayan an 24 saati en çok
      // LEAD_MS aşar; o da ufukta sayılır (yoksa plan yeniden kurulana dek düşerdi; inceleme NIT 5)
      if (at.getTime() > nowMs + DAY_MS + LEAD_MS) return skip('past')
      if (!manual && (min < win.from || min > win.to)) return skip('window')
      if (!manual && (Math.abs(min - firstMin) < MIN_GAP_MIN || nearFixed(at.getTime()))) return skip('gap')
      // Zar gün başına bir kez atılır ve o türün bütün saatlerine uygulanır: günün kaydı 'send' değilse ek saat yok
      const entry = logList.find((e) => e?.date === key && e?.type === type)
      if (entry?.arm !== 'send') return skip('arm')
      if (doneMs.some((t) => t < at.getTime() && t >= at.getTime() - EXTRA_DONE_MS)) return skip('doneBefore')
      const id = EXTRA_ID + LEGACY_ORDER[type] * 2 + slot
      out.extras.push({ id, at, type, textKey: `nudge.${type}`, extra: { kind: 'nudge', type, date: key, slot }, level: 'active' })
      if (type === 'walk' && avg != null) out.walkGuards.push({ id, date: key, threshold: walkThreshold(avg, time) })
    })
  }
  return out
}
