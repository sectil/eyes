// Tek planlayıcı (PLAN.v1 §3.A.4, §5.5 madde 1–2): bütün bildirim kaynaklarını tek listede dizer; notifyApply.js
// bu tek listeyi uygular. Saf; kurmaz, ayar yazmaz.
//
//   planNotifications (lib/notifyPlan.js, dokunulmaz; 74xx deney + çalışma günleri, 75xx çalışma oturumu)
//   + planModuleReminders (lib/moduleRemind.js; 78xx modül hatırlatmaları, 7860–7867 legacy ek saatleri)
//   + sabah havası 7700–7701 (lib/weatherNotify.js; B2 1. katman) · yürüyüş sorusunun yasak dilimleri 7710–7719 (B3): YOK
//
// Kurallar:
//   - Yeni özellik kapalıyken (moduleReminders boş, sabah havası kapalı) çıktı planNotifications'ın çıktısıdır, bayt bayt (eşdeğerlik §5.4).
//   - 74xx ve 75xx hiçbir zaman birleşmez, kaymaz, metni/kimliği/saati değişmez, tavana sayılmaz, kırpılmaz.
//   - İki bildirim arasında en az 30 dk (planlayıcı güvencesi; kurulumda 60 dk ayar anında aranır). Alarm bu listede
//     değil (AlarmKit); alarma bağlı sabah havası istisnadır (30 dk'ya ve gece sessizliğine uymaz, 01.00–05.00'e uyar).
//     Alarmsız günün sabah havası gece sessizliğine ve 30 dk'ya uyar: sessizliğin sabah ucundaysa weatherNotify onu
//     sessizlik bitimine kaydırır (09.00'dan sonra biterse bitiş dakikası; sahip kararı 4), 30 dk'ya çakışırsa burada
//     15 dk adımla en çok 60 dk ileri kayar (VARSAYIM), yer yoksa o gün kurulmaz. Sabah havası modül
//     hatırlatmalarından önce yer alır.
//   - Yalnız elle seçilmiş iki modül hatırlatması 30 dk içine düşerse tek bildirimde birleşir; "Sen karar ver" saati
//     boş dilime kayar; öteki çakışan yeni bildirim düşer.
//   - Oturum sürerken modül hatırlatması ve ek saat yok. Günde en çok 6 modül bildirimi; fazlası birleşir.
//   - JS'in bekleyeni ≤ 58 (2 yuva Swift'in 771x'ine); deney planı kırpılmaz, modül hatırlatmalarının ufku 3 → 2 → 1
//     güne iner.
//   - Gece (yalnız yeni kaynaklar): 01.00–05.00 hiç; gece sessizliği (varsayılan 23.00–07.00); alarm kuruluysa yatmadan
//     önceki 60 dk. Hatırlatmalar'daki türlerin kişinin seçtiği saati (74xx) gece kuralına uymaz (D5+D6: açık seçim
//     kazanır); bu türlerin ek saatleri moduleRemind.js LEGACY_WINDOW'da (09.00–21.00, su ≤ 18.00).
import { planNotifications, LEAD_MS } from './notifyPlan.js'
import { planModuleReminders, normalizeModuleReminders, windowOf, LEGACY_ORDER, PATH_ID, PATH_REMIND, MR_HORIZON_DAYS, MIN_GAP_MIN } from './moduleRemind.js'
import { FOCUS_HOURS } from './focus.js'
import { NUDGE_TYPES, normalizeReminders, toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'
import { nextRing, SLEEP_TARGET_H } from './alarm.js'
import { resolvePlanTexts } from './remindTexts.js'
import { planMorningWeather, morningOn } from './weatherNotify.js'

export const MIN_APART_MIN = 30 // planlayıcıda iki bildirim arası en az (VARSAYIM, §A.4)
export const DAY_CAP = 6 // modül hatırlatmalarından günde en çok (VARSAYIM, §A.4)
export const MAX_PENDING = 58 // JS'in kurduğu bekleyen en çok (§A.4 "Sayı bütçesi")
export const BED_LEAD_MIN = 60 // yatmadan önceki bu sürede modül hatırlatması yok
export const HARD_NIGHT = Object.freeze({ from: '01:00', to: '05:00' }) // hiçbir ayarla açılmaz
export const DEFAULT_QUIET = Object.freeze({ from: '23:00', to: '07:00' })
// Gece sessizliği ayar sınırları: başlangıç 22.00–24.00, bitiş 06.00–10.00 (§A.4)
export const QUIET_FROM_RANGE = Object.freeze(['22:00', '24:00'])
export const QUIET_TO_RANGE = Object.freeze(['06:00', '10:00'])
export const THREAD_ID = 'nefona'
export const NOTIFY_SLOTS_KEY = 'gozolcum:notify-slots' // o günün ek saatleri: [{ date, type, times }]
export const MERGED_TEXT_KEY = 'remind.merged' // birleşik bildirimin metin anahtarı (lib/remindTexts.js BR1–BR3)

const MIN = 60000
const HOUR = 3600000
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const minOf = (ms) => {
  const d = new Date(ms)
  return d.getHours() * 60 + d.getMinutes()
}
const isFixedNudge = (id) => Number.isInteger(id) && id >= 7400 && id <= 7499

// Yeni özellik açık mı: açık bir modül hatırlatması ya da legacy türde ek saat. "Kapalı" = moduleReminders boş
// (§5.4). VARSAYIM: yalnız kapalı (on: false) ve saatsiz kayıtlar da kapalı sayılır.
export function newFeaturesOn({ moduleReminders } = {}) {
  return Object.entries(normalizeModuleReminders(moduleReminders)).some(([k, c]) => c.on || (k in LEGACY_ORDER && c.times.length > 0))
}

// Gece sessizliği ayarı → dakika. Başlangıç 22.00–24.00 ('00:00' = 24.00, VARSAYIM), bitiş 06.00–10.00; aralık
// dışındaki ya da bozuk değer varsayılana döner.
export function normalizeQuiet(raw) {
  const q = isObj(raw) ? raw : {}
  let from = toMinutes(q.from)
  if (from === 0) from = 1440
  const to = toMinutes(q.to)
  const fromOk = from != null && from >= toMinutes(QUIET_FROM_RANGE[0])
  const toOk = to != null && to >= toMinutes(QUIET_TO_RANGE[0]) && to <= toMinutes(QUIET_TO_RANGE[1])
  return { from: fromOk ? from : toMinutes(DEFAULT_QUIET.from), to: toOk ? to : toMinutes(DEFAULT_QUIET.to) }
}

// Yeni kaynak için gece: 01.00–05.00 ya da gece sessizliği (uçlar: başlangıç dahil, bitiş hariç)
export function inNight(ms, quiet) {
  const m = minOf(ms)
  const q = normalizeQuiet(quiet)
  if (m >= toMinutes(HARD_NIGHT.from) && m < toMinutes(HARD_NIGHT.to)) return true
  return m >= q.from || m < q.to
}

// Alarm kuruluysa uyku dilimleri: her gün için o günün 12.00'sinden sonraki ilk çalış; yatma = çalış − 7 sa;
// yasak [yatma − 60 dk, çalış). VARSAYIM: yatma saatinden çalışa kadar da modül hatırlatması yok.
function sleepBlocks(alarm, base, days) {
  const out = []
  if (!alarm?.on) return out
  for (let d = -1; d <= days; d++) {
    const noon = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d, 12, 0, 0, 0)
    const ring = nextRing(alarm, noon)
    if (!ring) continue
    const r = ring.getTime()
    out.push([r - SLEEP_TARGET_H * HOUR - BED_LEAD_MIN * MIN, r])
  }
  return out
}

function focusSpan(focus) {
  const start = Date.parse(focus?.startedAt)
  if (!Number.isFinite(start) || !FOCUS_HOURS.includes(focus.hours)) return null
  return { start, end: start + focus.hours * HOUR }
}

// "Bana hatırlat" ilk kez açılınca ana anahtar (§A.2): optIn 'yes' değilse 'yes' yazılır ve kişi Ana sayfa kartına
// "Evet" demediği için varsayılanı açık mola kapatılır; legacy türse yalnız o tür açılır. Yeni nesne döner.
export function remindOptIn(reminders, legacy = null) {
  const r = normalizeReminders(reminders)
  const types = Object.fromEntries(Object.entries(r.types).map(([t, c]) => [t, { ...c }]))
  if (r.optIn !== 'yes') types.mola.on = false
  if (NUDGE_TYPES.includes(legacy)) types[legacy].on = true
  return { ...r, optIn: 'yes', types }
}

// Ek saatlerin kaydı (gozolcum:notify-slots; "Tüm verileri sil"e girer). notify-log'a dokunulmaz.
export function saveSlots(slots, storage) {
  try {
    ;(storage ?? globalThis.localStorage)?.setItem(NOTIFY_SLOTS_KEY, JSON.stringify(Array.isArray(slots) ? slots : []))
  } catch {
    // depolama yok/dolu
  }
}
export function loadSlots(storage) {
  try {
    const raw = JSON.parse((storage ?? globalThis.localStorage)?.getItem(NOTIFY_SLOTS_KEY) ?? 'null')
    return Array.isArray(raw) ? raw.filter((s) => isObj(s) && typeof s.date === 'string' && typeof s.type === 'string' && Array.isArray(s.times)) : []
  } catch {
    return []
  }
}

// Girdiler: planNotifications'ınkiler (now, reminders, study, habits, sessions, health, focus, log; seed artık kullanılmaz) ve
//   modules: registry.reminders() + App'in süzdüğü kayıtlar ({ id, remind, doneToday, records? }; moduleRemind.js)
//   moduleReminders: settings.moduleReminders · alarm: loadAlarm() | null · quiet: { from, to } | null (gece sessizliği)
//   texts: true → textKey'li yeni bildirimlere onaylı metin bağlanır (lib/remindTexts.js; notifyApply yalnız textKey
//     taşıyanı kurmadığı için metinsiz plan hiçbir yeni bildirim kurmaz) · names: { [modül]: ad } (birleşik bildirim)
//   VARSAYIM: texts bu turda isteğe bağlı (varsayılan kapalı): notifyAll.test.js'teki "yalnız textKey: hiçbiri kurulmaz"
//   beklentisi sahip onayıyla değişene dek. Uygulama planı kurarken texts: true verir.
// Çıktı: kapalıyken planNotifications'ın çıktısı aynen. Açıkken ayrıca:
//   grouped: true (notifyApply: threadIdentifier, relevanceScore, açılışta teslim edilmişlerin kaldırılması)
//   slots: [{ date, type, times }] (ek saatler; notify-slots), updates, proposals (moduleRemind.js),
//   skipped: moduleRemind.js'inkiler + 'focus' | 'night' | 'bed' | 'gap' | 'pending'
//   horizon: modül hatırlatmalarının kurulduğu gün sayısı
export function planAll(input = {}) {
  const base = planNotifications(input)
  // Sabah havası: settings.morningWeather açık ve hava verisi (weather: { cache, place }) verilmişse
  const weatherOn = morningOn(input.morningWeather) && isObj(input.weather)
  if (!newFeaturesOn(input) && !weatherOn) return base

  const { now = new Date(), modules = [], moduleReminders, reminders, study = null, sessions = [], health = null, focus = null, alarm = null, quiet = null } = input
  const nowMs = new Date(now).getTime()
  const baseDay = new Date(nowMs)
  const span = focusSpan(focus)
  const inFocus = (ms) => span != null && ms >= span.start && ms <= span.end
  const blocks = sleepBlocks(alarm, baseDay, MR_HORIZON_DAYS)
  const inBed = (ms) => blocks.some(([a, b]) => ms >= a && ms < b)
  const fixedNudgeMs = base.notifications.filter((n) => isFixedNudge(n.id)).map((n) => n.at.getTime())
  const wx = weatherOn
    ? planMorningWeather({ now, morning: input.morningWeather, alarm, cache: input.weather.cache ?? null, place: input.weather.place ?? null, log: base.log, localRefresh: input.weather.localRefresh ?? null, quiet: normalizeQuiet(quiet), ...('templates' in input.weather ? { templates: input.weather.templates } : {}) })
    : { notifications: [], skipped: [] }
  const remindOf = (id) => (id === PATH_ID ? (modules.find((m) => m?.id === PATH_ID)?.remind ?? PATH_REMIND) : modules.find((m) => m?.id === id)?.remind)

  let result = null
  for (let h = MR_HORIZON_DAYS; h >= 1; h--) {
    result = arrange(h)
    if (result.count <= MAX_PENDING) break
  }
  // Ufuk bire indiği hâlde yer yoksa modül hatırlatmaları sondan kırpılır (deney planı ve ek saatler kırpılmaz)
  while (result.count > MAX_PENDING && result.modules.length) {
    const cut = result.modules.pop()
    result.skipped.push({ module: cut.modules.join('+'), date: cut.date, time: null, reason: 'pending' })
    result.count--
  }

  const notifications = [...base.notifications, ...result.extras.map((e) => e.n), ...result.weather, ...result.modules.map(toNotification)]
  notifications.sort((a, b) => a.at - b.at || a.id - b.id)
  const plan = {
    notifications,
    log: base.log,
    walkGuards: [...base.walkGuards, ...result.mr.walkGuards.filter((g) => result.extras.some((e) => e.n.id === g.id))],
    grouped: true,
    slots: slotsOf(result.extras),
    updates: result.mr.updates,
    proposals: result.mr.proposals,
    skipped: result.skipped,
    horizon: result.horizon,
  }
  if (input.texts !== true) return plan
  // Cümlenin kaynağı modülün havuzundaysa bildirim o kaynağı taşır (yol: PATH_REMIND.science)
  const science = Object.fromEntries(modules.filter((m) => m?.id && Array.isArray(m.remind?.science)).map((m) => [m.id, m.remind.science]))
  if (!science[PATH_ID]) science[PATH_ID] = PATH_REMIND.science
  return resolvePlanTexts(plan, { names: input.names ?? null, science })

  function arrange(horizon) {
    const mr = planModuleReminders({ now, modules, moduleReminders, reminders, study, sessions, fixed: base.notifications, log: base.log, health, horizon })
    const skipped = [...mr.skipped, ...wx.skipped.map((s) => ({ module: 'weather', date: s.date, time: null, reason: s.reason }))]
    const skip = (n, reason) => skipped.push({ module: n.module ?? n.type, date: n.extra?.date ?? null, time: null, reason })
    // Kabul edilenler: { ms, kind: 'base'|'extra'|'module', manual, ... }
    const taken = base.notifications.map((n) => ({ ms: n.at.getTime(), kind: 'base' }))
    const near = (ms) => taken.filter((t) => Math.abs(t.ms - ms) < MIN_APART_MIN * MIN)

    // 1) Ek saatler (deney bildirimi; öncelik modül hatırlatmalarından önce)
    const extras = []
    for (const n of [...mr.extras].sort((a, b) => a.at - b.at || a.id - b.id)) {
      const ms = n.at.getTime()
      if (inFocus(ms)) { skip(n, 'focus'); continue }
      if (near(ms).length) { skip(n, 'gap'); continue }
      const e = { ms, kind: 'extra', n }
      taken.push(e)
      extras.push(e)
    }

    // 1b) Sabah havası (günde tek). Alarma bağlı olan istisna: 30 dk'ya ve gece sessizliğine bakılmaz, başkalarını da
    // itmez (taken'a girmez). Alarmsız günün havası sessizliğe ve 30 dk'ya uyar: sessizlik kaydırması weatherNotify'da
    // (karar 4: 09.00'dan sonra biten sessizlikte bitiş dakikası, 60 dk sınırı yok); burada 30 dk çakışmasında
    // VARSAYIM 15 dk adım, en çok 60 dk.
    const weather = []
    for (const n of wx.notifications) {
      if (n.extra.alarm || n.keepPending) {
        weather.push(n)
        continue
      }
      const ms0 = n.at.getTime()
      let placed = null
      for (let s = 0; s <= 60 && placed == null; s += 15) {
        const t = ms0 + s * MIN
        if (!inNight(t, quiet) && !near(t).length) placed = t
      }
      if (placed == null) {
        skipped.push({ module: 'weather', date: n.extra.date, time: null, reason: inNight(ms0, quiet) ? 'night' : 'gap' })
        continue
      }
      taken.push({ ms: placed, kind: 'weather' })
      weather.push(placed === ms0 ? n : { ...n, at: new Date(placed), extra: { ...n.extra, shifted: true } })
      // VARSAYIM (sınır): weatherNotify'ın 'opened' (karar 5) denetimi bu 30 dk kaydırmasından önceki saate göredir
    }

    // 2) Modül hatırlatmaları: önce elle seçilenler, sonra "Sen karar ver" (kayabilen) saatleri
    const blocked = (ms) => (inFocus(ms) ? 'focus' : inNight(ms, quiet) ? 'night' : inBed(ms) ? 'bed' : null)
    const mods = []
    const byTime = (a, b) => a.at - b.at || a.id - b.id
    const cands = [...mr.notifications.filter((n) => !n.extra.auto).sort(byTime), ...mr.notifications.filter((n) => n.extra.auto).sort(byTime)]
    for (const n of cands) {
      const ms = n.at.getTime()
      const why = blocked(ms)
      if (why) { skip(n, why); continue }
      const hit = near(ms)
      const manual = !n.extra.auto
      if (!hit.length) {
        add(n, ms)
        continue
      }
      if (manual && hit.every((t) => t.kind === 'module' && t.manual)) {
        // Elle seçilmiş iki modül hatırlatması: tek bildirim, erken olanın saatinde (§A.4 (2))
        const g = hit.sort((a, b) => a.ms - b.ms)[0]
        if (!g.modules.includes(n.module)) g.modules.push(n.module)
        continue
      }
      if (!manual) {
        const t = shiftFree(n, ms)
        if (t != null) {
          add(n, t)
          continue
        }
      }
      skip(n, 'gap')
    }

    // 3) Günlük tavan: fazlası günün altıncı bildiriminde birleşir (VARSAYIM: altıncının saatinde)
    const byDay = new Map()
    for (const g of mods.sort((a, b) => a.ms - b.ms)) {
      const list = byDay.get(g.date) ?? []
      list.push(g)
      byDay.set(g.date, list)
    }
    const kept = []
    for (const list of byDay.values()) {
      list.slice(DAY_CAP).forEach((g) => g.modules.forEach((m) => !list[DAY_CAP - 1].modules.includes(m) && list[DAY_CAP - 1].modules.push(m)))
      kept.push(...list.slice(0, DAY_CAP))
    }
    kept.sort((a, b) => a.ms - b.ms || a.n.id - b.n.id)
    return { horizon, mr, extras, weather, modules: kept, skipped, count: base.notifications.length + extras.length + weather.length + kept.length }

    function add(n, ms) {
      const g = { ms, kind: 'module', manual: !n.extra.auto, n, modules: [n.module], date: dayKey(new Date(ms)) }
      taken.push(g)
      mods.push(g)
    }

    // "Sen karar ver" saati çakışırsa aynı gün, pencere içinde 15 dk adımla önce ileri, sonra geri boş dilim arar:
    // yeni kaynağın gece kurallarına, oturuma, deney saatine 60 dk'ya ve öteki bildirimlere 30 dk'ya uyan
    function shiftFree(n, ms) {
      const win = windowOf(remindOf(n.module))
      const d = new Date(ms)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const at = (m) => new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(m / 60), m % 60).getTime()
      const ok = (t) =>
        t > nowMs + LEAD_MS && !blocked(t) && !near(t).length && !fixedNudgeMs.some((f) => Math.abs(f - t) < MIN_GAP_MIN * MIN)
      const m0 = minOf(ms)
      for (let m = m0 + 15; m <= win.to; m += 15) if (ok(at(m))) return at(m)
      for (let m = m0 - 15; m >= win.from; m -= 15) if (ok(at(m))) return at(m)
      return null
    }
  }
}

// Kabul edilmiş modül girdisi → bildirim. Birleşik bildirim Ana sayfayı açar, görünür bilim satırı taşımaz, ilk
// modülün evidence anahtarını taşır (§A.4 (2)). Metin anahtarla (textKey); cümleyi resolvePlanTexts bağlar.
function toNotification(g) {
  const { n } = g
  const at = new Date(g.ms)
  if (g.modules.length === 1) {
    return at.getTime() === n.at.getTime() ? n : { ...n, at, extra: { ...n.extra, shifted: true } }
  }
  return {
    id: n.id,
    at,
    type: 'remind',
    modules: [...g.modules],
    textKey: MERGED_TEXT_KEY,
    extra: { kind: 'remindMerged', modules: [...g.modules], route: 'home', evidence: n.extra.evidence ?? null, date: n.extra.date },
    level: 'active',
  }
}

function slotsOf(extras) {
  const map = new Map()
  for (const { n } of extras) {
    const k = `${n.extra.date}|${n.type}`
    const hhmm = `${String(n.at.getHours()).padStart(2, '0')}:${String(n.at.getMinutes()).padStart(2, '0')}`
    if (!map.has(k)) map.set(k, { date: n.extra.date, type: n.type, times: [] })
    map.get(k).times.push(hhmm)
  }
  return [...map.values()].map((s) => ({ ...s, times: s.times.sort() }))
}
