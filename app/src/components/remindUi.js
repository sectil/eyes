// "Bana hatırlat" ekranlarının saf yardımcıları (PLAN.v1 §3.A.2, §A.5; components/RemindField.jsx,
// components/RemindSheet.jsx, screens/Notifications.jsx, screens/QuietHours.jsx). Ayar yazmaz: yeni nesne döner, App
// store.setSetting('moduleReminders' | 'reminders', …) ile yazar. Cümle yazmaz (onaylı olanlar bileşenlerde, aynen).
import { normalizeModuleReminders, remindTimeError, capOf, windowOf, fromMinutes, LEGACY_ORDER } from '../lib/moduleRemind.js'
import { remindOptIn } from '../lib/notifyAll.js'
import { normalizeReminders, toMinutes, TYPE_LABEL } from '../lib/reminders.js'

// 'HH:MM' → '09.15' (ekranda saat noktayla yazılır; tasarım)
export const dot = (t) => (typeof t === 'string' ? t.replace(':', '.') : '')

// Saatin bulunma eki: "12.30'da", "09.15'te". Ek, saatin okunuşundaki son sözcükten (dakika 00 ise saatten):
// "otuz" → 'da, "on beş" → 'te. Ünlü uyumu ve sertleşme tablodan (0–9 birler, 10–50 onlar).
const LOC_UNIT = ['da', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da'] // sıfır bir iki üç dört beş altı yedi sekiz dokuz
const LOC_TEN = { 1: 'da', 2: 'de', 3: 'da', 4: 'ta', 5: 'de' } // on yirmi otuz kırk elli
export function locTime(t) {
  const m = toMinutes(t)
  if (m == null) return ''
  const h = Math.floor(m / 60)
  const mm = m % 60
  const n = mm > 0 ? mm : h
  const suf = n % 10 !== 0 || n === 0 ? LOC_UNIT[n % 10] : LOC_TEN[n / 10] ?? 'da'
  return `${dot(fromMinutes(m))}'${suf}`
}

// Başka bildirimlerin saatleri: [{ time: 'HH:MM', label }] ya da 'HH:MM'. remindTimeError dakika/dize ister.
const busyTimes = (busy) => (Array.isArray(busy) ? busy.map((b) => (typeof b === 'string' ? b : b?.time)).filter((t) => toMinutes(t) != null) : [])

// Elle seçilen saatlerin denetimi: her saat pencerede, başka bildirimlerden ve birbirinden ≥ 60 dk (kurulum kuralı,
// §A.2). [{ time, error: null|'window'|'gap', clash: { time, label }|null, suggest: 'HH:MM'|null }]
export function checkTimes(times, remind, busy = []) {
  const others = busyTimes(busy)
  const win = windowOf(remind)
  return times.map((time, i) => {
    const mine = times.filter((_, j) => j !== i)
    const error = remindTimeError(time, remind, [...others, ...mine])
    let clash = null
    let suggest = null
    if (error === 'gap') {
      const m = toMinutes(time)
      const hit = [...(Array.isArray(busy) ? busy : []).map((b) => (typeof b === 'string' ? { time: b, label: null } : b)), ...mine.map((t) => ({ time: t, label: null }))]
        .find((b) => toMinutes(b?.time) != null && Math.abs(toMinutes(b.time) - m) < 60)
      clash = hit ?? null
      // Öneri: çakışandan bir saat sonra, 15 dk'ya yuvarlı; o da uymazsa bir saat önce (VARSAYIM). Hiçbiri yoksa null.
      if (hit) {
        const base = toMinutes(hit.time)
        for (const c of [base + 60, base - 60]) {
          const r = Math.round(c / 15) * 15
          if (r >= win.from && r <= win.to && !remindTimeError(fromMinutes(r), remind, [...others, ...mine])) { suggest = fromMinutes(r); break }
        }
      }
    }
    return { time, error, clash, suggest }
  })
}

// Kaydet: modülün yeni kaydı ve (gerekirse) yeni settings.reminders.
// - İlk kez açılınca optIn 'yes' değilse remindOptIn (mola kapanır, yalnız seçilen tür açılır; §A.2).
// - Legacy türde ilk saat settings.reminders.types[legacy].time'da kalır; moduleReminders[tür].times yalnız 2. ve 3.
// - Kapatınca legacy tür de kapanır (settings.reminders.types[legacy].on = false; saat kalır).
// Dönüş: { moduleReminders (tam, yeni), reminders: yeni nesne | null (değişmediyse) }
export function applyRemind({ moduleId, remind = {}, moduleReminders, reminders, mode = 'auto', times = [], on = true, now = new Date() }) {
  const all = normalizeModuleReminders(moduleReminders)
  const prev = all[moduleId] ?? { on: false, mode: 'auto', times: [], autoAt: null, setAt: null }
  const cap = capOf(moduleId, remind)
  const picked = [...new Set(times.filter((t) => toMinutes(t) != null))].sort((a, b) => toMinutes(a) - toMinutes(b)).slice(0, cap)
  const iso = new Date(now).toISOString()
  const r = normalizeReminders(reminders)
  let nextRem = null
  let own = picked
  if (on && remind.legacy) {
    nextRem = r.optIn === 'yes' ? { ...r, types: { ...r.types, [remind.legacy]: { ...r.types[remind.legacy], on: true } } } : remindOptIn(reminders, remind.legacy)
    if (picked[0]) nextRem.types[remind.legacy] = { ...nextRem.types[remind.legacy], time: picked[0] }
    own = picked.slice(1)
  } else if (on && r.optIn !== 'yes') {
    nextRem = remindOptIn(reminders, null)
  } else if (!on && remind.legacy && r.types[remind.legacy]?.on) {
    // Kapatınca legacy tür (74xx) de kapanır; saati korunur (yeniden açınca aynı saat). Kapalıysa değişiklik yok (null).
    nextRem = { ...r, types: { ...r.types, [remind.legacy]: { ...r.types[remind.legacy], on: false } } }
  }
  const entry = on
    ? { on: true, mode: mode === 'manual' ? 'manual' : 'auto', times: own, autoAt: mode === 'manual' ? prev.autoAt : iso, setAt: iso }
    : { ...prev, on: false, setAt: iso }
  return { moduleReminders: { ...all, [moduleId]: entry }, reminders: nextRem }
}

// Satırda gösterilen saatler (legacy türde ilk saat settings.reminders'tan)
export function shownTimes(moduleId, remind, moduleReminders, reminders) {
  const c = normalizeModuleReminders(moduleReminders)[moduleId]
  const own = c?.times ?? []
  if (!remind?.legacy) return own
  const first = normalizeReminders(reminders).types[remind.legacy]?.time
  return first ? [first, ...own] : own
}

// "10.00, 13.30 ve 18.00" (§A.5 satır biçimi)
export function listTimes(times) {
  const d = times.map(dot)
  return d.length <= 1 ? (d[0] ?? '') : `${d.slice(0, -1).join(', ')} ve ${d.at(-1)}`
}

// ---------- Aynı saatteki bildirimler (D5+D6 bilgi satırı; engel değil) ----------
// Kişi saati istediği gibi seçer; seçtiği saatin NEAR_MIN dakika içinde başka bildirim varsa Hatırlatmalar ve Çalışma
// günleri sayfası yalnız bilgi verir ("Yarım saat içinde N bildirimin daha var · Bildirimleri göster"). Kaydet hiç kapanmaz.
export const NEAR_MIN = 30
const STUDY_DAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 } // settings.reminder.days ('MO') → getDay()

// Kurulu bildirimlerin listesi: [{ key, time: 'HH:MM', label, days: [0–6] | null }] (days null: her gün).
// Açık türler (Hatırlatmalar), açık Çalışma günleri ve açık "Bana hatırlat" saatleri (legacy ek saatleri dâhil).
// Hatırlatmalar kapalıysa (optIn 'yes' değil) hiçbiri gelmez: boş. names: modül adları (remindTexts NAMES).
export function notifyTimes({ reminders, study = null, moduleReminders, names = {} } = {}) {
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return []
  const out = []
  for (const t of Object.keys(LEGACY_ORDER)) {
    const c = r.types[t]
    if (c?.on && toMinutes(c.time) != null) out.push({ key: t, time: c.time, label: TYPE_LABEL[t], days: c.days })
  }
  const sDays = (Array.isArray(study?.days) ? study.days : []).map((d) => STUDY_DAY[d]).filter((d) => d != null)
  if (r.types.study.on && sDays.length && toMinutes(study?.time) != null) out.push({ key: 'study', time: study.time, label: TYPE_LABEL.study, days: sDays })
  for (const [k, c] of Object.entries(normalizeModuleReminders(moduleReminders))) {
    // Legacy türün ek saatleri yalnız tür açıkken kurulur (moduleRemind.planModuleReminders); kapalıysa sayılmaz
    if (!c.on || (k in LEGACY_ORDER && !r.types[k].on)) continue
    const label = names?.[k] ?? TYPE_LABEL[k] ?? k
    for (const time of c.times) out.push({ key: k, time, label, days: k in LEGACY_ORDER ? r.types[k].days : null })
  }
  return out
}

// time'ın NEAR_MIN dakika içindeki öteki bildirimler (self anahtarı hariç; günleri hiç kesişmeyenler hariç), saat
// sırasıyla. Gece yarısını aşan fark da sayılır (23.50 ile 00.10 arası 20 dk). days: seçilen günler (null: her gün).
export function nearTimes(time, list, self = null, days = null) {
  const m = toMinutes(time)
  if (m == null || !Array.isArray(list)) return []
  const meets = (d) => !Array.isArray(days) || !Array.isArray(d) || d.some((x) => days.includes(x))
  return list
    .filter((b) => b && b.key !== self && toMinutes(b.time) != null && meets(b.days))
    .filter((b) => {
      const diff = Math.abs(toMinutes(b.time) - m)
      return Math.min(diff, 1440 - diff) <= NEAR_MIN
    })
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
}
