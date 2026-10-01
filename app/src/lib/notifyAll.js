// Tek planlayıcı (PLAN.v1 §3.A.4, §5.5 madde 1–2): bütün bildirim kaynaklarını tek listede dizer; notifyApply.js
// bu tek listeyi uygular. Saf; kurmaz, ayar yazmaz.
//
//   planNotifications (lib/notifyPlan.js, yalnız sahip izniyle değişir; 74xx deney + çalışma günleri, 75xx çalışma oturumu)
//   + planModuleReminders (lib/moduleRemind.js; 78xx modül hatırlatmaları, 7860–7867 legacy ek saatleri)
//   + sabah havası 7700–7701 (lib/weatherNotify.js; B2 1. katman) · yürüyüş sorusunun yasak dilimleri 7710–7719 (B3): YOK
//   + Nef 7900–7919 (lib/nef/notify.js planNef; EN DÜŞÜK öncelik, öteki kaynaklar dizildikten sonra kalan boşluğa;
//     F1 metin zenginleştirmesi 7700–7701 ve yürüyüş modülünün 78xx'inde, kimlik ve saat değişmeden; 74xx ve
//     7860–7867'ye dokunmaz). Yalnız input.nef verilmişse; Nef bir şey eklemezse ve öteki yeni özellikler kapalıysa
//     çıktı yine planNotifications'ın kendisi (eşdeğerlik).
//
// Kurallar:
//   - Yeni özellik kapalıyken (moduleReminders boş, sabah havası kapalı) çıktı planNotifications'ın çıktısıdır, bayt bayt (eşdeğerlik §5.4).
//   - 74xx ve 75xx hiçbir zaman birleşmez, kaymaz, metni/kimliği/saati değişmez, tavana sayılmaz, kırpılmaz. Tek
//     istisna: elle seçilmiş modül saati ya da ek saatle ±60 sn içinde çakışan oturum molası (75xx) kurulmaz.
//   - İki bildirim arasında en az 30 dk (planlayıcı güvencesi; kurulumda 60 dk ayar anında aranır). Alarm bu listede
//     değil (AlarmKit); alarma bağlı sabah havası istisnadır (30 dk'ya ve gece sessizliğine uymaz, 01.00–05.00'e uyar).
//     Alarmsız günün sabah havası gece sessizliğine ve 30 dk'ya uyar: sessizliğin sabah ucundaysa weatherNotify onu
//     sessizlik bitimine kaydırır (09.00'dan sonra biterse bitiş dakikası; sahip kararı 4), 30 dk'ya çakışırsa burada
//     15 dk adımla en çok 60 dk ileri kayar (VARSAYIM), yer yoksa o gün kurulmaz. Sabah havası modül
//     hatırlatmalarından önce yer alır.
//   - Kişinin ELLE seçtiği saat (modül hatırlatması ya da legacy ek saati, mode 'manual') 30 dk kuralıyla düşmez ve gece
//     kurallarına uymaz (sahip kararı 2026-10-01: "kullanıcı istediği saate kurar"; 74xx'te olduğu gibi açık seçim
//     kazanır). Elle seçilmiş iki farklı modülün hatırlatması 30 dk içine düşerse tek bildirimde birleşir; aynı modülün
//     iki elle saati birleşmez, ikisi de kurulur. Nef'in seçtiği saat ("Sen karar ver") boş dilime kayar; Nef'in çakışan
//     öteki yeni bildirimi (ek saat) düşer.
//   - Oturum sürerken Nef'in seçtiği modül saati ve ek saat yok; kişinin elle seçtiği modül saati ve ek saati oturumda
//     da kurulur (sahip kararı 2026-10-01: "Çalışma oturumu sürerken, senin kurduğun hatırlatmalar gelsin"). Bir
//     hatırlatma oturum molasıyla (75xx) ±60 sn içinde çakışırsa tek bildirim kalır: hatırlatma kurulur, o mola kurulmaz
//     (notifyPlan.js FOCUS_CLASH_MS; 74xx için aynı kural orada). Günde en çok 6 modül bildirimi; fazlası birleşir.
//   - JS'in bekleyeni ≤ 58 (2 yuva Swift'in 771x'ine); deney planı kırpılmaz, modül hatırlatmalarının ufku 3 → 2 → 1
//     güne iner.
//   - Gece (yalnız Nef'in kendi saatleri: "Sen karar ver" modül saati, sabah havası): 01.00–05.00 hiç; gece sessizliği
//     (varsayılan 23.00–07.00); alarm kuruluysa yatmadan önceki 60 dk. Kişinin seçtiği saat gece kuralına uymaz: 74xx
//     (D5+D6) ve elle seçilmiş modül saati ile ek saat (2026-10-01). Nef'in seçtiği ek saatler moduleRemind.js
//     LEGACY_WINDOW'da (09.00–21.00, su ≤ 18.00). Çalışma oturumu (focus) yalnız Nef'in saatlerine uygulanır; 74xx,
//     elle seçilmiş modül saati ve ek saat oturumda da gelir (2026-10-01).
import { planNotifications, LEAD_MS, FOCUS_CLASH_MS } from './notifyPlan.js'
import { planModuleReminders, normalizeModuleReminders, windowOf, LEGACY_ORDER, PATH_ID, PATH_REMIND, MR_HORIZON_DAYS, MIN_GAP_MIN } from './moduleRemind.js'
import { FOCUS_HOURS } from './focus.js'
import { NUDGE_TYPES, normalizeReminders, toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'
import { nextRing, SLEEP_TARGET_H } from './alarm.js'
import { resolvePlanTexts } from './remindTexts.js'
import { planMorningWeather, morningOn } from './weatherNotify.js'
import { planNef } from './nef/notify.js'

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
const isFocusBreak = (n) => n?.extra?.kind === 'focus'

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
//   nef: { rows: memory.loadSaid(), lang?, pathDoneToday, who5Low?, appGapDays? } (lib/nef/notify.js; hava weather.cache'ten,
//     yürüyüş saati reminders.types.walk'tan okunur; yoksa Nef yok)
// Çıktı: kapalıyken planNotifications'ın çıktısı aynen. Açıkken ayrıca:
//   grouped: true (notifyApply: threadIdentifier, relevanceScore, açılışta teslim edilmişlerin kaldırılması)
//   slots: [{ date, type, times }] (ek saatler; notify-slots), updates, proposals (moduleRemind.js),
//   skipped: moduleRemind.js'inkiler + 'focus' | 'night' | 'bed' | 'gap' | 'pending' ('focus', 'night', 'bed', 'gap'
//     yalnız Nef'in seçtiği saatlerde)
//   horizon: modül hatırlatmalarının kurulduğu gün sayısı
//   nef (yalnız nef girdisiyle): Nef'in bu plandaki bildirim kararları; çağıran memory.syncPlannedNotify ile yazar.
//     skipped'e { module: 'nef', reason } eklenir.
export function planAll(input = {}) {
  const base = planNotifications(input)
  // Sabah havası: settings.morningWeather açık ve hava verisi (weather: { cache, place }) verilmişse
  const weatherOn = morningOn(input.morningWeather) && isObj(input.weather)
  // Nef (lib/nef/notify.js): nef girdisi (söz hafızası ve gün olguları) ve hava verisi varsa
  const nefOn = isObj(input.nef) && isObj(input.weather)
  const othersOn = newFeaturesOn(input) || weatherOn
  if (!othersOn && !nefOn) return base

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
  // Ek saati kişi mi seçti: türün kaydı elle (moduleRemind.js ile aynı arama: önce tür, sonra o türün modülü)
  const mrAll = normalizeModuleReminders(moduleReminders)
  const extraManual = (type) => (mrAll[type] ?? mrAll[(Array.isArray(modules) ? modules : []).find((m) => m?.remind?.legacy === type)?.id])?.mode === 'manual'

  let result = null
  for (let h = MR_HORIZON_DAYS; h >= 1; h--) {
    result = arrange(h)
    if (result.count <= MAX_PENDING) break
  }
  // Ufuk bire indiği hâlde yer yoksa modül hatırlatmaları sondan kırpılır (deney planı ve ek saatler kırpılmaz)
  while (result.count > MAX_PENDING && result.modules.length) {
    const cut = result.modules.pop()
    result.skipped.push({ module: cut.modules.join('+'), date: cut.date, time: null, reason: 'pending' })
    result.clash = clashOf(result.extras, result.modules)
    result.count = countOf(result)
  }

  const baseKept = base.notifications.filter((n) => !result.clash.has(n.id))
  const notifications = [...baseKept, ...result.extras.map((e) => e.n), ...result.weather, ...result.modules.map(toNotification)]
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
  let out = plan
  if (input.texts === true) {
    // Cümlenin kaynağı modülün havuzundaysa bildirim o kaynağı taşır (yol: PATH_REMIND.science)
    const science = Object.fromEntries(modules.filter((m) => m?.id && Array.isArray(m.remind?.science)).map((m) => [m.id, m.remind.science]))
    if (!science[PATH_ID]) science[PATH_ID] = PATH_REMIND.science
    out = resolvePlanTexts(plan, { names: input.names ?? null, science })
  }
  if (!nefOn) return out
  // Nef en sonda: öteki kaynaklar yerleşmiş, metinleri bağlanmış. Kurallar planlayıcınınkiyle aynı (gece, sessizlik,
  // yatma öncesi, oturum); bekleyen payı 58'den kalan.
  const nef = planNef({
    now,
    notifications: out.notifications,
    reminders,
    weather: input.weather,
    log: base.log,
    nef: input.nef,
    rules: { blocked: (ms) => (inFocus(ms) ? 'focus' : inNight(ms, quiet) ? 'night' : inBed(ms) ? 'bed' : null), room: MAX_PENDING - out.notifications.length, leadMs: LEAD_MS },
  })
  if (!nef.changed && !othersOn) return base
  return { ...out, notifications: nef.notifications, skipped: [...out.skipped, ...nef.skipped], nef: nef.said }

  // Kurulan bir hatırlatmayla (ek saat, modül) ±60 sn içinde çakışan oturum molalarının (75xx) kimlikleri: tek
  // bildirim kalsın, hatırlatma kazanır. Nef'in saatleri oturuma hiç düşmediği için pratikte yalnız elle seçilenler.
  function clashOf(extras, mods) {
    const ms = [...extras.map((e) => e.ms), ...mods.map((g) => g.ms)]
    return new Set(base.notifications.filter((n) => isFocusBreak(n) && ms.some((m) => Math.abs(m - n.at.getTime()) <= FOCUS_CLASH_MS)).map((n) => n.id))
  }
  function countOf(r) {
    return base.notifications.length - r.clash.size + r.extras.length + r.weather.length + r.modules.length
  }

  function arrange(horizon) {
    const mr = planModuleReminders({ now, modules, moduleReminders, reminders, study, sessions, fixed: base.notifications, log: base.log, health, horizon })
    const skipped = [...mr.skipped, ...wx.skipped.map((s) => ({ module: 'weather', date: s.date, time: null, reason: s.reason }))]
    const skip = (n, reason) => skipped.push({ module: n.module ?? n.type, date: n.extra?.date ?? null, time: null, reason })
    // Kabul edilenler: { ms, kind: 'base'|'extra'|'module', manual, ... }
    const taken = base.notifications.map((n) => ({ ms: n.at.getTime(), kind: 'base' }))
    const near = (ms) => taken.filter((t) => Math.abs(t.ms - ms) < MIN_APART_MIN * MIN)

    // 1) Ek saatler (deney bildirimi; öncelik modül hatırlatmalarından önce). Önce kişinin elle seçtikleri (30 dk'ya ve
    // oturuma bakılmaz), sonra Nef'in seçtikleri (30 dk'ya ve oturuma uyar, çakışırsa düşer)
    const extras = []
    const byAt = (a, b) => a.at - b.at || a.id - b.id
    const exManual = mr.extras.filter((n) => extraManual(n.type)).sort(byAt)
    for (const n of [...exManual, ...mr.extras.filter((n) => !exManual.includes(n)).sort(byAt)]) {
      const ms = n.at.getTime()
      if (!exManual.includes(n) && inFocus(ms)) { skip(n, 'focus'); continue }
      if (!exManual.includes(n) && near(ms).length) { skip(n, 'gap'); continue }
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

    // 2) Modül hatırlatmaları: önce elle seçilenler (oturuma, gece kurallarına ve 30 dk'ya bakılmaz), sonra "Sen karar
    // ver" (kayabilen) saatleri
    const blocked = (ms) => (inFocus(ms) ? 'focus' : inNight(ms, quiet) ? 'night' : inBed(ms) ? 'bed' : null)
    const mods = []
    const byTime = (a, b) => a.at - b.at || a.id - b.id
    const cands = [...mr.notifications.filter((n) => !n.extra.auto).sort(byTime), ...mr.notifications.filter((n) => n.extra.auto).sort(byTime)]
    for (const n of cands) {
      const ms = n.at.getTime()
      const manual = !n.extra.auto
      const why = manual ? null : blocked(ms)
      if (why) { skip(n, why); continue }
      const hit = near(ms)
      if (!hit.length) {
        add(n, ms)
        continue
      }
      if (manual) {
        // Elle seçilmiş iki farklı modülün hatırlatması: tek bildirim, erken olanın saatinde (§A.4 (2)). Aynı modülün
        // yakın iki elle saati birleşmez (birleşse biri kaybolurdu); başka bildirime yakınsa da kurulur, düşmez.
        const mods = hit.filter((t) => t.kind === 'module' && t.manual).sort((a, b) => a.ms - b.ms)
        if (mods.length && !mods.some((g) => g.modules.includes(n.module))) mods[0].modules.push(n.module)
        else add(n, ms)
        continue
      }
      const t = shiftFree(n, ms)
      if (t != null) {
        add(n, t)
        continue
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
    const r = { horizon, mr, extras, weather, modules: kept, skipped, clash: clashOf(extras, kept) }
    r.count = countOf(r)
    return r

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
