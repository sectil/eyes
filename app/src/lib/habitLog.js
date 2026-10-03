// Mola ve su kayıtları ("Bitti" / "İçtim"). store.sessions'a YAZILMAZ: oraya giden her kayıt Nef'e, seriye ve
// haftalık hedefe girer (BILDIRIM_PLANI.md §7 "Kayıt yeri"). Yalnız bu telefonda, kendi anahtarında durur;
// "Tüm verileri sil" mola modülünün storageKeys listesinden siler. Depolama yoksa liste boş döner, hata atılmaz.
//
//   gozolcum:habit-log → [{ date: 'YYYY-MM-DD' (yerel gün), type: 'mola' | 'water', at: ISO }] (en yeni sonda)
import { dayKey as calendarDayKey } from './calendar.js'

export const HABIT_KEY = 'gozolcum:habit-log'
export const HABIT_TYPES = ['mola', 'water']
export const HABIT_MAX = 400

// Date → 'YYYY-MM-DD' yerel gün (lib/calendar.js ile aynı)
export const dayKey = (d) => calendarDayKey(d)
// 'YYYY-MM-DD' → dönem günü (1970-01-01 = 0). Yerel takvim gününden hesaplanır; yaz saati geçişinde
// 23/25 saatlik gün sayıyı kaydırmaz. Geçersizse NaN.
export function keyDay(key) {
  const m = typeof key === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(key) : null
  return m ? Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000) : NaN
}

const store = (s) => s ?? globalThis.localStorage
const valid = (h) =>
  h != null && typeof h === 'object' && HABIT_TYPES.includes(h.type) && Number.isFinite(keyDay(h.date)) && Number.isFinite(Date.parse(h.at))

export function loadHabits(storage) {
  try {
    const raw = JSON.parse(store(storage)?.getItem(HABIT_KEY) ?? 'null')
    return Array.isArray(raw) ? raw.filter(valid) : []
  } catch {
    return []
  }
}

// Kaydı ekler, en yeni HABIT_MAX kaydı saklar; yeni listeyi döndürür (bilinmeyen tür eklenmez)
export function addHabit(type, now = new Date(), storage) {
  const list = loadHabits(storage)
  if (!HABIT_TYPES.includes(type)) return list
  const t = new Date(now)
  const next = [...list, { date: dayKey(t), type, at: t.toISOString() }].slice(-HABIT_MAX)
  try {
    store(storage)?.setItem(HABIT_KEY, JSON.stringify(next))
  } catch {
    // depolama yok/dolu
  }
  return next
}

export const habitsOn = (list, key) => (Array.isArray(list) ? list : []).filter((h) => h?.date === key)

// Geri al (Ana sayfa su çipi, sahip 2026-10-03): az önce eklenen kaydı zamanından bulup siler; yeni listeyi döndürür
export function removeHabit(type, at, storage) {
  const list = loadHabits(storage)
  const i = list.map((h) => h.type === type && h.at === at).lastIndexOf(true)
  if (i < 0) return list
  const next = [...list.slice(0, i), ...list.slice(i + 1)]
  try {
    store(storage)?.setItem(HABIT_KEY, JSON.stringify(next))
  } catch {
    // depolama yok/dolu
  }
  return next
}
