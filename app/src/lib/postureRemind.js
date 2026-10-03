// Dik Dur aralıklı hatırlatma (PLAN docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md §4.2; sahip kararları 2026-10-03:
// 3 saat sınırına istisna, B · kayan ufuk, varsayılan iki saatte bir 09.00–19.00). Saf: planı yalnız hesaplar.
//
// Ayar: settings.moduleReminders['dik-dur'].interval = { on, every: 60|120, from: 'HH:MM', to: 'HH:MM', days: [0..6] }
// (days getDay sırası, 0 = pazar). Aralıklı kip açıkken saat kipinin saatleri kurulmaz (moduleRemind.js).
// Kimlikler 7868–7899 (32): ufuk iki saatte birde 5, saatte birde 2 gün; 32'ye ve planın kalan payına sığdığı kadar.
// Kişinin seçtiği saatler sayılır: gece sessizliği ve pencere kuralı yok; yalnız 01.00–05.00 seçilemez (giriş sınırı).
// Başka bir bildirime 30 dk'dan yakın dilim o gün atlanır; Dik Dur bu dilimden önceki 30 dk içinde yapıldıysa atlanır.
// Son kurulan bildirim "Hatırlatmalar burada bitiyor…" cümlesini taşır (remind.dik-dur-son).
import { toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'

export const POSTURE_ID = 'dik-dur'
export const POSTURE_ID_FIRST = 7868
export const POSTURE_ID_LAST = 7899
export const POSTURE_IDS = Object.freeze([POSTURE_ID_FIRST, POSTURE_ID_LAST])
export const EVERY = Object.freeze([60, 120])
export const HORIZON_DAYS = Object.freeze({ 60: 2, 120: 5 })
export const MAX_SPAN_MIN = Object.freeze({ 60: 12 * 60, 120: 24 * 60 }) // saatte birde en çok 12 saatlik aralık
export const NIGHT = Object.freeze([60, 300]) // 01.00–05.00 seçilemez
export const APART_MIN = 30
export const DONE_MIN = 30
export const TEXT_KEY = 'remind.dik-dur'
export const LAST_TEXT_KEY = 'remind.dik-dur-son'
export const DEFAULT_INTERVAL = Object.freeze({ on: false, every: 120, from: '09:00', to: '19:00', days: Object.freeze([0, 1, 2, 3, 4, 5, 6]) })

const LEAD_MS = 15000 // notifyPlan.js LEAD_MS ile aynı (hatırlatmaların payı 15 sn, sahip 2026-10-01)
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const pad = (n) => String(n).padStart(2, '0')
const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

// Ham ayar → tam biçim. Geçersiz alan varsayılana döner; days boşsa her gün.
export function normalizeInterval(raw) {
  const r = isObj(raw) ? raw : {}
  const every = EVERY.includes(r.every) ? r.every : DEFAULT_INTERVAL.every
  const from = toMinutes(r.from) != null ? r.from : DEFAULT_INTERVAL.from
  const to = toMinutes(r.to) != null ? r.to : DEFAULT_INTERVAL.to
  const days = [...new Set((Array.isArray(r.days) ? r.days : []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort()
  return { on: r.on === true, every, from, to, days: days.length ? days : [...DEFAULT_INTERVAL.days] }
}

// Kurulum hatası (kaydet kapalı) ya da null: bitiş başlangıçtan sonra olmalı; saatte birde en çok 12 saat; 01–05 yok.
export function intervalError(raw) {
  const c = normalizeInterval(raw)
  const a = toMinutes(c.from)
  const b = toMinutes(c.to)
  if (!(b > a)) return 'order'
  if (b - a > MAX_SPAN_MIN[c.every]) return 'span'
  if (slotsOf(c).length === 0) return 'empty'
  return null
}

// Günün dilimleri (dakika): başlangıçtan bitişe (dahil) adım adım; 01.00–05.00 düşer
export function slotsOf(raw) {
  const c = normalizeInterval(raw)
  const a = toMinutes(c.from)
  const b = toMinutes(c.to)
  const out = []
  if (!(b > a)) return out
  for (let m = a; m <= b; m += c.every) if (!(m >= NIGHT[0] && m < NIGHT[1])) out.push(m)
  return out
}

// Planlayıcı. Girdi: now; interval (ayar); taken: başka bildirimlerin anları (ms); sessions (Dik Dur kayıtları dahil);
// room: planın kalan bekleyen payı; science: kanıt havuzu. Çıktı: { notifications, skipped, horizon }.
export function planPosture({ now = new Date(), interval, taken = [], sessions = [], room = POSTURE_ID_LAST - POSTURE_ID_FIRST + 1, science = [] } = {}) {
  const out = { notifications: [], skipped: [], horizon: 0 }
  const c = normalizeInterval(interval)
  if (!c.on || intervalError(c)) return out
  const nowMs = new Date(now).getTime()
  const base = new Date(nowMs)
  const days = HORIZON_DAYS[c.every]
  const cap = Math.max(0, Math.min(POSTURE_ID_LAST - POSTURE_ID_FIRST + 1, Number.isInteger(room) ? room : 0))
  const takenMs = (Array.isArray(taken) ? taken : []).map((t) => new Date(t).getTime()).filter(Number.isFinite)
  const doneMs = (Array.isArray(sessions) ? sessions : []).filter((s) => s?.type === POSTURE_ID).map((s) => Date.parse(s.date)).filter(Number.isFinite)
  const pool = Array.isArray(science) ? science : []
  const items = []
  for (let d = 0; d < days; d++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d)
    const key = dayKey(day)
    if (!c.days.includes(day.getDay())) continue
    for (const m of slotsOf(c)) {
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60, 0, 0)
      const ms = at.getTime()
      const skip = (reason) => out.skipped.push({ module: POSTURE_ID, date: key, time: hhmm(m), reason })
      if (ms <= nowMs + LEAD_MS) continue // geçmiş: kayda değmez
      if (takenMs.some((t) => Math.abs(t - ms) < APART_MIN * 60000)) { skip('gap'); continue }
      if (doneMs.some((t) => t < ms && t >= ms - DONE_MIN * 60000)) { skip('doneBefore'); continue }
      items.push({ at, key, d })
    }
  }
  items.slice(cap).forEach((it) => out.skipped.push({ module: POSTURE_ID, date: it.key, time: hhmm(it.at.getHours() * 60 + it.at.getMinutes()), reason: 'pending' }))
  const kept = items.slice(0, cap)
  kept.forEach((it, i) => {
    const last = i === kept.length - 1
    out.notifications.push({
      id: POSTURE_ID_FIRST + i,
      at: it.at,
      type: 'remind',
      module: POSTURE_ID,
      textKey: last ? LAST_TEXT_KEY : TEXT_KEY,
      extra: { kind: 'remind', module: POSTURE_ID, route: POSTURE_ID, evidence: pool.length ? pool[i % pool.length] : null, date: it.key, interval: true },
      level: 'active',
    })
  })
  out.horizon = kept.length ? kept[kept.length - 1].d + 1 : 0
  return out
}
