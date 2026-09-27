// Çalışma oturumu (plan §5): kişi 1, 2 ya da 4 saatlik oturum başlatır; 60 dakikada bir mola bildirimi gelir
// (Morris 2020, 60 dakikalık kol). Oturum sürerken diğer hatırlatmalar gelmez (notifyPlan.js). Ekrandaki adı
// "Çalışma oturumu": Türkçe iOS'taki "Odak" özelliğiyle karışmasın.
//
//   gozolcum:focus → { startedAt: ISO, hours: 1 | 2 | 4 } | yok
export const FOCUS_KEY = 'gozolcum:focus'
export const FOCUS_HOURS = [1, 2, 4]
const HOUR = 3600000

const store = (s) => s ?? globalThis.localStorage

// Kayıttan durum: bitiş ve sıradaki mola anı (k. saat; son mola bitişte)
function stateOf(start, hours, nowMs) {
  const end = start + hours * HOUR
  if (nowMs >= end) return null
  const k = Math.min(hours, Math.max(0, Math.floor((nowMs - start) / HOUR)) + 1)
  return { startedAt: new Date(start).toISOString(), hours, endsAt: new Date(end), nextBreakAt: new Date(start + k * HOUR) }
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

// hours FOCUS_HOURS dışındaysa oturum başlamaz (null)
export function startFocus(hours, now = new Date(), storage) {
  if (!FOCUS_HOURS.includes(hours)) return null
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
