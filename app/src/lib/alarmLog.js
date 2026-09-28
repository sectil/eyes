// Alarm günlüğü ve ayarı (Artifact "Nefona Alarm" v3 "Toplanan veri"). Hepsi bu telefonda; sessions'a YAZILMAZ
// (seriye, haftalık hedefe, Nef'e sayılmasın). Veri merkezi (lib/dataHub.js) uyanma ve sabah cevabını "İyi oluş"
// alanına koyar (alarmHabits). Çalıp kapanan alarm iOS'ta silinir (Apple belgesi): kaydı biz tutarız.
// Öğrenilen her şey (uyanma saati önerisi, günler, uykuya dalma süresi, "Bu akşam değil" sayısı) günlükten türetilir;
// ayrı bir sayaç tutulmaz (analizde tek kaynak).
//
//   gozolcum:alarm     → ayar { on, hour, minute, days: [0..6] (0 = Pazar), at: ISO|null (tek sefer), sound,
//                              sleep: 'off'|'auto'|dakika, wake: 'none'|'breath'|'dalga', kind: 'alarmkit'|'notify', setAt }
//   gozolcum:alarm-log → [{ type, at: ISO, date: 'YYYY-MM-DD' (yerel), ...alanlar }] (en yeni sonda)
//     set       { hour, minute, days, sound, sleep, wake, kind, suggested: ['07:00',…], picked: 'suggest'|'other',
//                 daysChanged: bool }
//     cancel    {}
//     dismiss   {}                        "Bu akşam değil"
//     cardPref  { show: bool }            "Bu kart akşamları çıksın mı?" cevabı
//     sleep     { planned: dk, seconds, early: bool, auto: bool }   uykuya dalarken ses (başladığı an = at − seconds)
//     wake      { via: 'button'|'open', ring: ISO }  "Nefona'yı aç" ya da çalıştıktan sonraki ilk açılış
//     wakeSkip  { ring: ISO }             sabah kartında "Şimdi değil"
//     morning   { answer: 'yes'|'no'|'early', ring: ISO, before: dk, after: dk }  "Ses bittiğinde uyumuş muydun?"
import { dayKey, keyDay, loadHabits } from './habitLog.js'

export const ALARM_KEY = 'gozolcum:alarm'
export const ALARM_LOG_KEY = 'gozolcum:alarm-log'
export const ALARM_LOG_MAX = 800
export const EVENT_TYPES = ['set', 'cancel', 'dismiss', 'cardPref', 'sleep', 'wake', 'wakeSkip', 'morning']
export const WAKE_ACTIONS = ['none', 'breath', 'dalga']
export const MORNING_ANSWERS = ['yes', 'no', 'early']

const store = (s) => s ?? globalThis.localStorage
const isIso = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v))
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi

// Günler: 0..6, tekrarsız, sıralı
export const cleanDays = (days) => [...new Set((Array.isArray(days) ? days : []).filter((d) => int(d, 0, 6)))].sort((a, b) => a - b)
export const cleanSleep = (v) => (v === 'off' || v === 'auto' ? v : int(v, 1, 90) ? v : 'off')

export function normalizeAlarm(a) {
  if (a == null || typeof a !== 'object' || !int(a.hour, 0, 23) || !int(a.minute, 0, 59)) return null
  return {
    on: a.on === true,
    hour: a.hour,
    minute: a.minute,
    days: cleanDays(a.days),
    at: isIso(a.at) ? a.at : null,
    sound: typeof a.sound === 'string' ? a.sound : 'phone',
    sleep: cleanSleep(a.sleep),
    wake: WAKE_ACTIONS.includes(a.wake) ? a.wake : 'none',
    kind: a.kind === 'notify' ? 'notify' : 'alarmkit',
    setAt: isIso(a.setAt) ? a.setAt : null,
  }
}

export function loadAlarm(storage) {
  try {
    return normalizeAlarm(JSON.parse(store(storage)?.getItem(ALARM_KEY) ?? 'null'))
  } catch {
    return null
  }
}
export function saveAlarm(a, storage) {
  const n = normalizeAlarm(a)
  try {
    if (n) store(storage)?.setItem(ALARM_KEY, JSON.stringify(n))
    else store(storage)?.removeItem(ALARM_KEY)
  } catch {
    // depolama yok/dolu
  }
  return n
}

function cleanEvent(e) {
  if (e == null || typeof e !== 'object' || !EVENT_TYPES.includes(e.type) || !isIso(e.at) || !Number.isFinite(keyDay(e.date))) return null
  return e
}
export function loadAlarmLog(storage) {
  try {
    const raw = JSON.parse(store(storage)?.getItem(ALARM_LOG_KEY) ?? 'null')
    return Array.isArray(raw) ? raw.map(cleanEvent).filter(Boolean) : []
  } catch {
    return []
  }
}
// Olayı ekler (en yeni ALARM_LOG_MAX), yeni listeyi döndürür. Bilinmeyen tür eklenmez.
export function addAlarmEvent(type, fields = {}, now = new Date(), storage) {
  const list = loadAlarmLog(storage)
  if (!EVENT_TYPES.includes(type)) return list
  const t = new Date(now)
  const next = [...list, { ...fields, type, at: t.toISOString(), date: dayKey(t) }].slice(-ALARM_LOG_MAX)
  try {
    store(storage)?.setItem(ALARM_LOG_KEY, JSON.stringify(next))
  } catch {
    // depolama yok/dolu
  }
  return next
}

// Veri merkezi: uyanma işareti ve sabah cevabı olan günler "İyi oluş" kaydı (gün başına bir; lib/dataHub.js HABIT_DOMAIN).
// VARSAYIM: kurmak, "Bu akşam değil" ve uyku sesi (Dalga oturumu olarak zaten Sakinlik'e yazılır) sayılmaz.
export function alarmHabits(log) {
  const seen = new Set()
  const out = []
  for (const e of Array.isArray(log) ? log : []) {
    if ((e?.type !== 'wake' && e?.type !== 'morning') || seen.has(e.date)) continue
    seen.add(e.date)
    out.push({ date: e.date, type: 'alarm', at: e.at })
  }
  return out
}
// Veri merkezine giden alışkanlık listesi: mola/su (habit-log) + alarm günleri. hubHabitsKey: iki günlüğün ham
// uzunluğu (ayrıştırmadan; ekranlar yeni kayıtta yeniden okusun diye memo anahtarı)
export function hubHabitsKey(storage) {
  try {
    const s = store(storage)
    return `${s?.getItem(ALARM_LOG_KEY)?.length ?? 0}:${s?.getItem('gozolcum:habit-log')?.length ?? 0}`
  } catch {
    return ''
  }
}
export const loadHubHabits = (storage) => [...loadHabits(storage), ...alarmHabits(loadAlarmLog(storage))]
