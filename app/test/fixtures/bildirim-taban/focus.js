// Çalışma oturumu (plan §5): kişi 1, 2 ya da 4 saatlik oturum başlatır; 60 dakikada bir mola bildirimi gelir
// (Morris 2020, 60 dakikalık kol). Oturum sürerken diğer hatırlatmalar gelmez (notifyPlan.js). Ekrandaki adı
// "Çalışma oturumu": Türkçe iOS'taki "Odak" özelliğiyle karışmasın.
//
//   gozolcum:focus → { startedAt: ISO, hours: 1 | 2 | 4 } | yok
//
// Gece mola bildirimi yok (Bug 33): mola anları yalnız öteki hatırlatmaların gündüz penceresinde (reminders.WINDOW)
// kurulur. Oturum pencerenin dışına taşarsa o saatlerin bildirimi gelmez; hiç mola sığmıyorsa oturum başlatılmaz.
import { WINDOW, toMinutes } from '../../../src/lib/reminders.js'

export const FOCUS_KEY = 'gozolcum:focus'
export const FOCUS_HOURS = [1, 2, 4]
const HOUR = 3600000

const store = (s) => s ?? globalThis.localStorage

// An (ms) yerel saatle gündüz penceresinde mi (uçlar dahil; notifyPlan'daki öteki türlerle aynı kural)
export function inBreakWindow(ms) {
  const d = new Date(ms)
  const m = d.getHours() * 60 + d.getMinutes()
  return m >= toMinutes(WINDOW.from) && m <= toMinutes(WINDOW.to)
}

// Oturumun pencere içindeki mola anları (k. saat, k = 1..hours; son mola bitişte)
export function breakTimes(start, hours) {
  const out = []
  for (let k = 1; k <= hours; k++) {
    const t = start + k * HOUR
    if (inBreakWindow(t)) out.push(t)
  }
  return out
}

// Şimdi başlatılan oturuma en az bir mola bildirimi gelir mi (1 saatlik oturumun molası pencerede mi)
export function focusFits(now = new Date()) {
  return inBreakWindow(new Date(now).getTime() + HOUR)
}

// Kayıttan durum: bitiş ve pencere içindeki sıradaki mola anı (kalmadıysa null)
function stateOf(start, hours, nowMs) {
  const end = start + hours * HOUR
  if (nowMs >= end) return null
  const next = breakTimes(start, hours).find((t) => t > nowMs)
  return { startedAt: new Date(start).toISOString(), hours, endsAt: new Date(end), nextBreakAt: next == null ? null : new Date(next) }
}

// Süren oturum ya da null; bitmiş ya da bozuk kayıt silinir
export function loadFocus(now = new Date(), storage) {
  let raw = null
  try {
    raw = JSON.parse(store(storage)?.getItem(FOCUS_KEY) ?? 'null')
  } catch {
    raw = null
  }
  if (!raw) return null
  const start = Date.parse(raw.startedAt)
  const state = Number.isFinite(start) && FOCUS_HOURS.includes(raw.hours) ? stateOf(start, raw.hours, new Date(now).getTime()) : null
  if (!state) stopFocus(storage)
  return state
}

// hours FOCUS_HOURS dışındaysa ya da pencereye hiç mola sığmıyorsa (gece) oturum başlamaz (null)
export function startFocus(hours, now = new Date(), storage) {
  if (!FOCUS_HOURS.includes(hours) || !focusFits(now)) return null
  const t = new Date(now).getTime()
  try {
    store(storage)?.setItem(FOCUS_KEY, JSON.stringify({ startedAt: new Date(t).toISOString(), hours }))
  } catch {
    // depolama yok
  }
  return stateOf(t, hours, t)
}

export function stopFocus(storage) {
  try {
    store(storage)?.removeItem(FOCUS_KEY)
  } catch {
    // depolama yok
  }
}
