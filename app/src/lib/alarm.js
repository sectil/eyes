// Nefona alarmı: saf kurallar (Artifact "Nefona Alarm" v3, onaylı 28 Eylül 2026). Depolama lib/alarmLog.js,
// telefon (AlarmKit / bildirim) lib/alarmNative.js. Burada saat ve günlükten karar veren fonksiyonlar var; hepsi test edilir.
// Sağlık iddiası yok: "Sana göre" uykuyu algılamaz, sabah cevabına göre ayarlanan bir zamanlayıcıdır.
import { dayKey, keyDay } from './habitLog.js'
import { isBreath } from './breath.js'
import { isDalga } from './dalga.js'
import { BREATH_DONE_SEC } from './notifyLog.js'

export const EVENING_HOUR = 19
export const EVENING_HOUR_TEST = 14 // test derlemesinde (VITE_TEST_UNLOCK) kart 14.00'ten sonra
export const DEFAULT_TIMES = [7 * 60, 8 * 60, 9 * 60] // ilk kez: 07:00 · 08:00 · 09:00
export const DEFAULT_TIME = 7 * 60
export const DEFAULT_DAYS = [1, 2, 3, 4, 5] // VARSAYIM: ilk kez Pazartesi–Cuma
export const SUGGEST_DAYS = 14
export const ROUND_MIN = 15
// "Sana göre": ilk gece 30 dk (sahibinin kararı, 2026-09-28: uyku müziği çalışmalarında 25–60 dk/gece, Cochrane
// Jespersen 2022, doi:10.1002/14651858.CD010459.pub3); sabah cevabıyla ±5, sınır 5–60 (uyku sesi en çok 60 dk)
export const LATENCY_START = 30
export const LATENCY_STEP = 5
export const LATENCY_MIN = 5
export const LATENCY_MAX = 60
export const SLEEP_CHOICES = ['auto', 5, 10, 15] // + "Başka"
export const SLEEP_OTHER = [20, 25, 30, 40, 45, 60]
export const SLEEP_MAX_MIN = 60 // uyku sesi en çok 60 dk …
export const SLEEP_GAP_MIN = 60 // … ve alarmdan en az 1 saat önce biter
export const DISMISS_ASK = 3 // üst üste 3 "Bu akşam değil" → bir kez "Bu kart akşamları çıksın mı?"
export const OPEN_WAKE_MIN = 120 // VARSAYIM: çaldıktan sonra 2 saat içindeki ilk açılış uyanma işareti
export const WAKE_CARD_H = 4 // VARSAYIM: "Uyanınca" kartı çaldıktan sonra 4 saat
export const QUESTION_H = 8 // VARSAYIM: sabah sorusu çaldıktan sonra 8 saat
export const MORNING_FIRST = 5 // ilk 5 sabah her gün …
export const MORNING_WEEKLY = 2 // … sonra haftada en çok 2
export const MORNING_GAP_DAYS = 3 // VARSAYIM: iki soru arası en az 3 gün (haftada 2'yi yaymak için)
const MIN = 60000
const HOUR = 60 * MIN

export const WEEKDAY_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'] // getDay() sırası (0 = Pazar)
export const WEEKDAY_LONG = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // ekranda Pazartesi başta

export const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
export const minOfDay = (d) => d.getHours() * 60 + d.getMinutes()
export const roundTo = (min, step = ROUND_MIN) => (((Math.round(min / step) * step) % 1440) + 1440) % 1440
// Saate Türkçe ek: saat okunduğu gibi ("07:00" → yedi → 07:00'de / 07:00'ye; "07:30" → otuz → 07:30'da / 07:30'a)
const ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli']
const lastWord = (n) => (n === 0 ? 'sıfır' : n % 10 ? ONES[n % 10] : TENS[n / 10])
export function withSuffix(min, kind = 'loc') {
  const h = Math.floor(min / 60), m = min % 60
  const w = lastWord(m ? m : h)
  const back = /[aıou]/.test([...w].reverse().find((ch) => /[aeıioöuü]/.test(ch)) ?? 'e')
  const a = back ? 'a' : 'e'
  const end = w.at(-1)
  const suf = kind === 'dat' ? (/[aeıioöuü]/.test(end) ? `y${a}` : a) : `${/[çfhkpsşt]/.test(end) ? 't' : 'd'}${a}`
  return `${hhmm(min)}'${suf}`
}
export function parseHhmm(s) {
  const m = typeof s === 'string' ? /^(\d{1,2}):(\d{2})$/.exec(s) : null
  if (!m) return null
  const h = Number(m[1]), mi = Number(m[2])
  return h <= 23 && mi <= 59 ? h * 60 + mi : null
}

// "Pazartesi–Cumartesi", "Hafta içi", "Her gün", "Pt, Ça, Cu"; boşsa "Yalnız yarın"
export function daysLabel(days) {
  const d = [...new Set(days ?? [])]
  if (!d.length) return 'Yalnız yarın'
  if (d.length === 7) return 'Her gün'
  const ord = WEEK_ORDER.filter((x) => d.includes(x))
  const idx = ord.map((x) => WEEK_ORDER.indexOf(x))
  const run = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1)
  if (run && ord.length >= 3) return `${WEEKDAY_LONG[ord[0]]}–${WEEKDAY_LONG[ord.at(-1)]}`
  return ord.map((x) => WEEKDAY_SHORT[x]).join(', ')
}

// "Yarın" hangi gün: gece 04.00'ten önce kurulan alarm bu sabah içindir (VARSAYIM)
export function targetDay(now) {
  const t = new Date(now)
  return t.getHours() < 4 ? t.getDay() : (t.getDay() + 1) % 7
}

// hour:minute'ın now'dan SONRAKİ ilk geçişi; days boşsa her gün geçerli
export function nextOccurrence({ hour, minute, days = [] }, now) {
  const t = new Date(now)
  for (let i = 0; i <= 7; i++) {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i, hour, minute, 0, 0)
    if (d.getTime() <= t.getTime()) continue
    if (!days.length || days.includes(d.getDay())) return d
  }
  return null
}

// Sıradaki çalış (açık alarm); tek seferlik alarm çaldıysa null
export function nextRing(alarm, now) {
  if (!alarm?.on) return null
  if (alarm.days.length) return nextOccurrence(alarm, now)
  const at = Date.parse(alarm.at)
  return Number.isFinite(at) && at > new Date(now).getTime() ? new Date(at) : null
}

// En son çalış (≤ now, kurulduktan sonra; açık alarm). Uyanma işareti ve sabah kartı buna bağlanır.
export function lastRing(alarm, now) {
  if (!alarm?.on) return null
  const t = new Date(now)
  let r = null
  if (alarm.days.length) {
    for (let i = 0; i <= 7 && !r; i++) {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - i, alarm.hour, alarm.minute, 0, 0)
      if (d.getTime() <= t.getTime() && alarm.days.includes(d.getDay())) r = d
    }
  } else if (alarm.at) {
    const a = Date.parse(alarm.at)
    if (Number.isFinite(a) && a <= t.getTime()) r = new Date(a)
  }
  const since = Date.parse(alarm.setAt)
  return r && !(Number.isFinite(since) && r.getTime() < since) ? r : null
}

// "9 sa 16 dk sonra"; 24 saatten uzaksa takvim günüyle ("4 gün sonra")
export function untilText(next, now) {
  const m = Math.max(1, Math.round((next.getTime() - new Date(now).getTime()) / MIN))
  if (m >= 24 * 60) return `${keyDay(dayKey(next)) - keyDay(dayKey(new Date(now)))} gün sonra`
  const h = Math.floor(m / 60), mm = m % 60
  return `${h ? `${h} sa ` : ''}${h && !mm ? '' : `${mm} dk `}sonra`
}
// Kartta alarmın zamanı: yarınsa yalnız saat, değilse gün adıyla
export function ringLabel(next, now) {
  const t = new Date(now)
  const diff = keyDay(dayKey(next)) - keyDay(dayKey(t))
  const time = hhmm(minOfDay(next))
  return diff <= 1 ? time : `${WEEKDAY_LONG[next.getDay()]} ${time}`
}

const inWindow = (log, now) => {
  const to = keyDay(dayKey(new Date(now)))
  return (Array.isArray(log) ? log : []).filter((e) => {
    const k = keyDay(e?.date)
    return Number.isFinite(k) && to - k < SUGGEST_DAYS && k <= to
  })
}

// Uyanma örnekleri (son 14 gün): { min (15 dk'ya yuvarlı), days: [haftanın günü] }.
//  - "Nefona'yı aç" (wake via button): dokunulan an
//  - alarm sonrası ilk açılış (via open) ve kurulan alarmlar: alarmın saati (açılış saati kalkış saatini söylemez)
export function wakeSamples(log, now) {
  const out = []
  for (const e of inWindow(log, now)) {
    if (e.type === 'wake') {
      const d = new Date(e.via === 'button' ? e.at : e.ring ?? e.at)
      if (Number.isFinite(d.getTime())) out.push({ min: roundTo(minOfDay(d)), days: [d.getDay()] })
    } else if (e.type === 'set' && Number.isInteger(e.hour) && Number.isInteger(e.minute)) {
      const at = new Date(e.at)
      const days = Array.isArray(e.days) && e.days.length ? e.days : [targetDay(at)]
      out.push({ min: roundTo(e.hour * 60 + e.minute), days })
    }
  }
  return out
}

const byCount = (samples, filter = () => true) => {
  const m = new Map()
  for (const s of samples) if (filter(s)) m.set(s.min, (m.get(s.min) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([min]) => min)
}

// Üç öneri (artan sırada) ve seçili gelen. İlk kez 07:00 · 08:00 · 09:00; sonra en sık üçü; eksikse en sıkın
// ±30 dk komşuları. Seçili: hedef günde (yarın) en sık, yoksa genel en sık, yoksa 07:00.
export function suggestTimes(log, now) {
  const samples = wakeSamples(log, now)
  const ranked = byCount(samples)
  if (!ranked.length) return { times: DEFAULT_TIMES, pick: DEFAULT_TIME, learned: false }
  const times = ranked.slice(0, 3)
  for (const step of [30, -30, 60, -60, 90]) {
    if (times.length >= 3) break
    const c = roundTo(ranked[0] + step)
    if (!times.includes(c)) times.push(c)
  }
  const wd = targetDay(now)
  const pick = byCount(samples, (s) => s.days.includes(wd))[0] ?? ranked[0]
  return { times: times.sort((a, b) => a - b), pick, learned: true }
}

// Günler: en son günlü kurulum; hiç yoksa Pazartesi–Cuma
export function suggestDays(log) {
  for (let i = (log?.length ?? 0) - 1; i >= 0; i--) {
    const e = log[i]
    if (e?.type === 'set' && Array.isArray(e.days) && e.days.length) return [...e.days]
  }
  return [...DEFAULT_DAYS]
}

// "Sana göre" süresi: sabah cevaplarından (Hayır +5, Çok önce −5, Evet 0), 5–45
export function latency(log) {
  let v = LATENCY_START
  for (const e of Array.isArray(log) ? log : []) {
    if (e?.type !== 'morning') continue
    if (e.answer === 'no') v += LATENCY_STEP
    else if (e.answer === 'early') v -= LATENCY_STEP
    v = Math.min(LATENCY_MAX, Math.max(LATENCY_MIN, v))
  }
  return v
}
export const nextLatency = (cur, answer) => Math.min(LATENCY_MAX, Math.max(LATENCY_MIN, cur + (answer === 'no' ? LATENCY_STEP : answer === 'early' ? -LATENCY_STEP : 0)))

// Bu gece uyku sesinin süresi (dk). null: ses kapalı; 0: alarma 1 saatten az kaldı (çalmaz)
export function sleepMinutes(alarm, log, now) {
  if (!alarm || alarm.sleep === 'off') return null
  const base = alarm.sleep === 'auto' ? latency(log) : alarm.sleep
  let cap = SLEEP_MAX_MIN
  const ring = nextRing(alarm, now)
  if (ring) cap = Math.min(cap, Math.floor((ring.getTime() - new Date(now).getTime()) / MIN) - SLEEP_GAP_MIN)
  return cap >= 1 ? Math.min(base, cap) : 0
}

// Yatma saati: yetişkine gecede en az 7 saat (AASM/SRS uzlaşısı, Watson 2015, doi:10.5665/sleep.4716).
// Sıradaki çalıştan 7 saat önce; o an geçtiyse ya da çalış 24 saatten uzaksa null (geç kalana baskı yok;
// "00:00'da yatakta ol" bu geceyi anlatsın).
export const SLEEP_TARGET_H = 7
export function bedtimeFor(next, now) {
  if (!next || next.getTime() - new Date(now).getTime() > 24 * HOUR) return null
  const b = new Date(next.getTime() - SLEEP_TARGET_H * HOUR)
  return b.getTime() > new Date(now).getTime() ? b : null
}

// Alarma 1 saatten az kaldıysa "Yine de çal" süresi: alarmdan 5 dk önce susar (kişinin seçimi; kural dışı). 0: çalmaz
export const LATE_GAP_MIN = 5
export function lateSleepMinutes(alarm, log, now) {
  if (!alarm || alarm.sleep === 'off') return 0
  const ring = nextRing(alarm, now)
  if (!ring) return 0
  const base = alarm.sleep === 'auto' ? latency(log) : alarm.sleep
  const m = Math.min(base, SLEEP_MAX_MIN, Math.floor((ring.getTime() - new Date(now).getTime()) / MIN) - LATE_GAP_MIN)
  return m >= 1 ? m : 0
}

// Son kurulumdan / kart cevabından beri üst üste "Bu akşam değil" sayısı (izin kartındaki Tamam sayılmaz)
export function dismissStreak(log) {
  let n = 0
  for (let i = (log?.length ?? 0) - 1; i >= 0; i--) {
    const e = log[i]
    if (e?.type === 'set' || e?.type === 'cardPref') break
    if (e?.type === 'dismiss' && !e.reason) n++
  }
  return n
}

// Akşam kartı (Ana sayfa, başlığın altında). platform: 'alarmkit' | 'notify' | 'web'; auth: AlarmKit izni
// ('authorized'|'denied'|'notDetermined') ya da bildirim izni ('granted'|'denied'|'prompt').
// Döner: null | { kind: 'set', next } | { kind: 'ask' } | { kind: 'askNotify' } | { kind: 'denied', via } | { kind: 'pref' }
export function eveningCard({ now = new Date(), alarm = null, log = [], platform = 'web', auth = null, test = false } = {}) {
  if (platform !== 'alarmkit' && platform !== 'notify') return null
  const t = new Date(now)
  if (t.getHours() < (test ? EVENING_HOUR_TEST : EVENING_HOUR)) return null
  const next = nextRing(alarm, t)
  if (next) return { kind: 'set', next }
  const today = dayKey(t)
  const prefs = log.filter((e) => e?.type === 'cardPref')
  if (log.some((e) => e?.type === 'dismiss' && e.date === today)) {
    return dismissStreak(log) >= DISMISS_ASK && !prefs.length ? { kind: 'pref' } : null
  }
  if (prefs.at(-1)?.show === false) return null
  if (auth === 'denied') return { kind: 'denied', via: platform }
  return { kind: platform === 'notify' ? 'askNotify' : 'ask' }
}

// Sabah sorusu zamanı mı? Dün gece "Sana göre" ses kendiliğinden bittiyse (elle durdurulmadıysa): ilk 5 sabah her gün,
// sonra haftada en çok 2 (iki soru arası ≥ 3 gün). Aynı çalış için bir kez.
export function questionDue(log, ring, now) {
  const r = ring.getTime()
  const t = new Date(now).getTime()
  if (t < r || t - r > QUESTION_H * HOUR) return false
  const iso = ring.toISOString()
  const night = log.some((e) => e?.type === 'sleep' && e.auto === true && !e.early && Date.parse(e.at) <= r && r - Date.parse(e.at) < 16 * HOUR)
  if (!night) return false
  const answers = log.filter((e) => e?.type === 'morning')
  if (answers.some((e) => e.ring === iso)) return false
  if (answers.length < MORNING_FIRST) return true
  const today = keyDay(dayKey(new Date(now)))
  const recent = answers.filter((e) => today - keyDay(e.date) < 7)
  const last = answers.at(-1)
  return recent.length < MORNING_WEEKLY && today - keyDay(last.date) >= MORNING_GAP_DAYS
}

// Sabah kartı: "Uyanınca" seçildiyse önce o (yapılmadıysa, atlanmadıysa), sonra soru.
// Döner: null | { kind: 'wake', action: 'breath'|'dalga'|'light', ring } | { kind: 'question', ring }
export function morningCard({ now = new Date(), alarm = null, log = [], sessions = [] } = {}) {
  const ring = lastRing(alarm, now)
  if (!ring) return null
  const r = ring.getTime()
  const t = new Date(now).getTime()
  const iso = ring.toISOString()
  const after = (d) => {
    const x = Date.parse(d)
    return Number.isFinite(x) && x >= r
  }
  if (alarm.wake !== 'none' && t - r <= WAKE_CARD_H * HOUR && !log.some((e) => e?.type === 'wakeSkip' && e.ring === iso)) {
    const done = alarm.wake === 'breath'
      ? sessions.some((s) => isBreath(s) && s.seconds >= BREATH_DONE_SEC && after(s.date))
      : alarm.wake === 'dalga'
        ? sessions.some((s) => isDalga(s) && after(s.date))
        : log.some((e) => e?.type === 'wakeDone' && e.ring === iso)
    if (!done) return { kind: 'wake', action: alarm.wake, ring }
  }
  return questionDue(log, ring, now) ? { kind: 'question', ring } : null
}

// Uyanma işareti yazılacak mı? openedAt: "Nefona'yı aç"a dokunulan an (ms) ya da null.
// Döner: null | { via: 'button'|'open', ring: ISO, at: Date }
export function wakeSignal({ alarm, log = [], now = new Date(), openedAt = null }) {
  const ring = lastRing(alarm, now)
  if (!ring) return null
  const iso = ring.toISOString()
  if (log.some((e) => e?.type === 'wake' && e.ring === iso)) return null
  const r = ring.getTime()
  if (Number.isFinite(openedAt) && openedAt >= r - 5 * MIN) return { via: 'button', ring: iso, at: new Date(Math.min(openedAt, new Date(now).getTime())) }
  if (new Date(now).getTime() - r <= OPEN_WAKE_MIN * MIN) return { via: 'open', ring: iso, at: new Date(now) }
  return null
}

// Kurulum sayfasının önceden cevaplı hali. Var olan alarm (Değiştir) kendi ayarıyla gelir.
export function setupDefaults({ log = [], alarm = null, now = new Date(), defaultSound = 'phone' } = {}) {
  const s = suggestTimes(log, now)
  return {
    times: s.times,
    learned: s.learned,
    time: alarm ? alarm.hour * 60 + alarm.minute : s.pick,
    days: alarm ? [...alarm.days] : suggestDays(log),
    sleep: alarm?.sleep ?? 'auto',
    sound: alarm?.sound ?? defaultSound,
    wake: alarm?.wake ?? 'none',
  }
}

// Kaydedilecek alarm ayarı. Günler boşsa tek sefer: bir sonraki hh:mm (at).
export function buildAlarm({ time, days, sleep, sound, wake, kind }, now = new Date()) {
  const hour = Math.floor(time / 60), minute = time % 60
  const at = days.length ? null : nextOccurrence({ hour, minute, days: [] }, now)?.toISOString() ?? null
  return { on: true, hour, minute, days: [...days].sort((a, b) => a - b), at, sound, sleep, wake, kind, setAt: new Date(now).toISOString() }
}
