// Bildirim günlüğü (plan §6). Her gün ve her tür için tek kayıt: o gün kurallara göre gönderilebilir miydi
// (eligible), gönderildi mi (arm), gönderilmediyse neden (skipReason). Veri telefondan çıkmaz, coach() yok.
// D5+D6 (2026-10-01): sessiz gün deneyi ve "Gün aşırı" sorusu kalktı; planlayıcı artık 'silent', 'window', 'thin'
// yazmaz (eski kayıtlarda okunur), seçilmeyen gün 'day'. evaluate ve thinCandidate uygulamada kullanılmıyor (Gelişim
// karşılaştırma kartı ve Ana sayfa sorusu kalktı); testleriyle birlikte silinmesi sahibe soru.
//
//   gozolcum:notify-log  → [{ date, type, eligible, arm: 'send'|'silent'|null,
//                             skipReason: null|'day'|'focus'|'noData'|'doneBefore'|'window'|'thin', plannedAt: ISO|null, tapped }]
//   gozolcum:notify-seed → rastgele dize; eski zarın tohumu (artık kullanılmaz)
import { NUDGE_TYPES, TYPE_INDEX, normalizeReminders } from './reminders.js'
import { dayKey, keyDay } from './habitLog.js'
import { isBreath } from './breath.js'

export const NOTIFY_LOG_KEY = 'gozolcum:notify-log'
export const NOTIFY_SEED_KEY = 'gozolcum:notify-seed'
export const LOG_DAYS = 120
export const BREATH_DONE_SEC = 60 // VARSAYIM (plan §2): 1 dakikalık nefes "yapıldı" sayılır
export const READY_DAYS = 21 // VARSAYIM (plan §6): ilk kayıttan bu yana 21 gün …
export const READY_SILENT = 5 // … ve en az 5 sessiz gün birikmeden sonuç gösterilmez
export const THIN_AFTER = 3 // VARSAYIM (plan §3, Head 2013): üst üste 3 hatırlatma gününde ne dokunma ne kayıt

const ARMS = ['send', 'silent']
const REASONS = ['day', 'focus', 'window', 'noData', 'doneBefore', 'thin']
const store = (s) => s ?? globalThis.localStorage
const isIso = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v))
const keyOf = (e) => `${e.date}|${e.type}`

function randomSeed() {
  try {
    const a = new Uint32Array(4)
    globalThis.crypto.getRandomValues(a)
    return Array.from(a, (x) => x.toString(36)).join('')
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

// Depolama yoksa oturum boyunca aynı tohum (zar tutarlı kalsın)
let memSeed = null
export function getSeed(storage) {
  const s = store(storage)
  try {
    const v = s.getItem(NOTIFY_SEED_KEY)
    if (typeof v === 'string' && v) return v
    const seed = randomSeed()
    s.setItem(NOTIFY_SEED_KEY, seed)
    return seed
  } catch {
    memSeed ??= randomSeed()
    return memSeed
  }
}

// Tek kayıt → tam biçim; bozuksa null
function clean(e) {
  if (e == null || typeof e !== 'object' || !NUDGE_TYPES.includes(e.type) || !Number.isFinite(keyDay(e.date))) return null
  const eligible = e.eligible === true
  return {
    date: e.date,
    type: e.type,
    eligible,
    arm: eligible && ARMS.includes(e.arm) ? e.arm : null,
    skipReason: REASONS.includes(e.skipReason) ? e.skipReason : null,
    plannedAt: isIso(e.plannedAt) ? e.plannedAt : null,
    tapped: e.tapped === true,
  }
}
const byDateType = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : TYPE_INDEX[a.type] - TYPE_INDEX[b.type])

// Bozuk kayıtlar düşer; aynı (tarih, tür) için sonuncusu kalır; tarih ve tür sırasında
function sanitize(list) {
  const m = new Map()
  for (const e of Array.isArray(list) ? list : []) {
    const c = clean(e)
    if (c) m.set(keyOf(c), c)
  }
  return [...m.values()].sort(byDateType)
}

export function loadLog(storage) {
  try {
    return sanitize(JSON.parse(store(storage)?.getItem(NOTIFY_LOG_KEY) ?? 'null'))
  } catch {
    return []
  }
}
export function saveLog(list, storage) {
  const out = sanitize(list)
  try {
    store(storage)?.setItem(NOTIFY_LOG_KEY, JSON.stringify(out))
  } catch {
    // depolama yok/dolu
  }
  return out
}

// Yeni plan günlüğe işlenir. Geçmiş günler ve zamanı gelmiş (plannedAt ≤ now) bugünkü kayıt donar: bildirim gitti
// ya da sessiz kaldı, sonradan değişmez (saat değişse de o gün ikinci kayıt açılmaz). Bugün ve sonrasının zamanı
// gelmemiş kayıtları planla değişir; planda olmayanlar (tür kapandı, izin geri alındı) silinir. tapped korunur.
// En çok LOG_DAYS gün tutulur. now: App vermezse şimdiki an.
export function mergePlanned(log, planned, todayKey, now = new Date()) {
  const t = new Date(now).getTime()
  const today = keyDay(todayKey)
  const old = sanitize(log)
  const tapped = new Map(old.map((e) => [keyOf(e), e.tapped]))
  const out = new Map()
  for (const e of old) {
    const d = keyDay(e.date)
    if (today - d >= LOG_DAYS) continue
    if (d < today || (e.plannedAt != null && Date.parse(e.plannedAt) <= t)) out.set(keyOf(e), e)
  }
  for (const p of Array.isArray(planned) ? planned : []) {
    const e = clean({ ...p, tapped: false })
    // Bugünün zamanı gelmiş kaydı varken saat değiştiyse (gelecekteki yeni an), yeni an kaydı geçer (sahip kararı
    // 2026-10-01: "yeni saatte kurulsun"); yoksa planlayıcı LEAD_MS içinde bu anı tanımaz ve bekleyen bildirim düşer
    const prev = e ? out.get(keyOf(e)) : null
    const moved = prev && Date.parse(e.plannedAt) > t && e.plannedAt !== prev.plannedAt
    if (!e || keyDay(e.date) < today || (prev && !moved)) continue
    e.tapped = tapped.get(keyOf(e)) === true
    out.set(keyOf(e), e)
  }
  return [...out.values()].sort(byDateType)
}

// Günlüğe izinle birlikte işleme (App replan). Bildirimi kurulamayan gün "hatırlatma günü" sayılmasın: plan yalnız
// izin 'granted' iken yazılır. İzne hâlâ bakılıyorsa (null) hiçbir şey yazılmaz → null döner. 'denied', 'prompt',
// 'unsupported' (web) → boş planla birleşir: geçmiş ve zamanı gelmiş kayıtlar donar, zamanı gelmemişler düşer.
// Mikro-randomize denemelerde de ulaştırılamayan an "uygun değil" sayılır (Klasnja 2019).
export function mergeForPermission(log, planned, permission, todayKey, now = new Date()) {
  if (permission == null) return null
  return mergePlanned(log, permission === 'granted' ? planned : [], todayKey, now)
}

export function markTapped(log, date, type) {
  return sanitize(log).map((e) => (e.date === date && e.type === type ? { ...e, tapped: true } : e))
}

// O gün, bildirim anından SONRA yapıldı mı (uygulama içindeki kayıt; uygulama dışındakini göremiyoruz)
function doneOn(e, { habits, sessions, healthDays, avgSteps }) {
  const planned = e.plannedAt != null ? Date.parse(e.plannedAt) : null
  const after = (iso) => {
    const x = Date.parse(iso)
    return Number.isFinite(x) && (planned == null || x > planned)
  }
  if (e.type === 'mola' || e.type === 'water') {
    return habits.some((h) => h?.type === e.type && h.date === e.date && after(h.at))
  }
  if (e.type === 'breath') {
    return sessions.some((s) => isBreath(s) && s.seconds >= BREATH_DONE_SEC && after(s.date) && dayKey(s.date) === e.date)
  }
  if (e.type === 'walk') {
    const day = healthDays.find((d) => d?.date === e.date)
    return Number.isFinite(avgSteps) && avgSteps > 0 && Number.isFinite(day?.steps) && day.steps >= avgSteps
  }
  return false
}

const evalCtx = ({ habits = [], sessions = [], healthDays = [], avgSteps = null } = {}) => ({
  habits: Array.isArray(habits) ? habits : [],
  sessions: Array.isArray(sessions) ? sessions : [],
  healthDays: Array.isArray(healthDays) ? healthDays : [],
  avgSteps,
})

// Tür başına ölçüm özeti. Yalnız geçmiş (tarihi < bugün), uygun, zarı atılmış ve başka kuralla atlanmamış günler
// sayılır. days: ilk kayıttan bugüne geçen gün ("Ölçüm sürüyor: 9/21 gün"). walk: o günün adımı ≥ avgSteps
// (healthDays: [{ date, steps }]); mola/su: habit-log; nefes: ≥ 60 sn nefes oturumu (store.sessions).
export function evaluate(log, { habits = [], sessions = [], healthDays = [], avgSteps = null } = {}, now = new Date()) {
  const todayKey = dayKey(now)
  const today = keyDay(todayKey)
  const ctx = evalCtx({ habits, sessions, healthDays, avgSteps })
  const entries = sanitize(log)
  const out = {}
  for (const type of NUDGE_TYPES) {
    const mine = entries.filter((e) => e.type === type && keyDay(e.date) <= today)
    const firstDate = mine[0]?.date ?? null
    const days = firstDate ? today - keyDay(firstDate) : 0
    const counted = mine.filter((e) => keyDay(e.date) < today && e.eligible && e.arm != null && e.skipReason == null)
    const sent = counted.filter((e) => e.arm === 'send')
    const silent = counted.filter((e) => e.arm === 'silent')
    out[type] = {
      firstDate,
      days,
      sentDays: sent.length,
      silentDays: silent.length,
      sentDone: sent.filter((e) => doneOn(e, ctx)).length,
      silentDone: silent.filter((e) => doneOn(e, ctx)).length,
      ready: days >= READY_DAYS && silent.length >= READY_SILENT,
    }
  }
  return out
}

// Seyreltme sorusu (plan §3): açık bir türün son THIN_AFTER hatırlatma gününde (geçmiş, uygun, bildirim gitti)
// ne dokunma ne kayıt varsa o tür döner; kişiye bir kez [Böyle kalsın] [Gün aşırı] sorulur. Sessiz günler
// sayılmaz (bildirim yoktu, dokunulamazdı). Soru sorulmuş (thinAsked) ya da seyreltilmiş türde sorulmaz.
// Kayıt evaluate ile aynı: mola/su habit-log, nefes ≥ 60 sn, yürüyüşte günlük adım ≥ avgSteps. Yoksa null.
export function thinCandidate(log, reminders, data = {}, now = new Date()) {
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return null
  const today = keyDay(dayKey(now))
  const ctx = evalCtx(data)
  const entries = sanitize(log)
  for (const type of NUDGE_TYPES) {
    if (!r.types[type].on || r.thin[type] === 'alt' || r.thinAsked[type]) continue
    const sent = entries.filter((e) => e.type === type && keyDay(e.date) < today && e.eligible && e.arm === 'send' && e.skipReason == null)
    const last = sent.slice(-THIN_AFTER)
    if (last.length === THIN_AFTER && last.every((e) => !e.tapped && !doneOn(e, ctx))) return type
  }
  return null
}
