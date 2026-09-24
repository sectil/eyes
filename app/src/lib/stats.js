// Gelişim ekranı istatistikleri: görme testleri + egzersiz/oyun oturumları → tek aktivite listesi.
// Saf fonksiyonlar. Tarihler yerel saatle günlere bölünür (calendar.js dayKey).
import { dayKey, startOfWeek } from './calendar.js'
import { SETS, setDurationSec } from './routines.js'

// VARSAYIM: testler süre kaydetmez; ana ekrandaki tahmini sürelerle aynı değerler kullanılır
// (günlük ~3 dk, haftalık ~5 dk, okuma ~3 dk; Home.jsx). Kayıtta seconds varsa o kullanılır.
export const DEFAULT_TEST_SECONDS = { 'va-daily': 180, 'va-weekly': 300, reading: 180 }
// Göz kırpma oturumu süre kaydetmez; routines.todaySeconds ile aynı varsayılan (150 sn).
export const DEFAULT_BLINK_SECONDS = 150
// VARSAYIM: bir görme testi akışı her gözü (Sağ, Sol, İki göz) ayrı kayıt olarak aynı anda ekler
// (App.saveTests). Aynı türden, 5 dk içinde, farklı göze ait kayıtlar tek aktivite sayılır.
export const TEST_GROUP_WINDOW_MS = 5 * 60 * 1000

const VA_TYPES = new Set(['va-daily', 'va-weekly'])
const EYE_ORDER = ['R', 'L', 'OU']
const EYE_LABEL = { R: 'Sağ göz', L: 'Sol göz', OU: 'İki göz' }
// Bölünmez boşluk (\u00a0): dar ekranda "İki göz 0,20" satır sonunda bölünmez.
const EYE_SHORT = { R: 'Sağ', L: 'Sol', OU: 'İki\u00a0göz' }
const TEST_TITLE = { 'va-daily': 'Günlük görme testi', 'va-weekly': 'Haftalık görme testi', reading: 'Okuma hızı testi' }
const GAME_NAME = { snake: 'Yılan' }
const CONTROL_LABEL = { eyes: 'gözle', touch: 'dokunarak' }

const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const positiveSec = (v) => {
  const n = finite(v)
  return n != null && n > 0 ? Math.round(n) : null
}
const list = (v) => (Array.isArray(v) ? v : [])
const join = (parts) => parts.filter(Boolean).join(' · ')

function timeOf(rec) {
  if (!rec || rec.date == null || rec.date === '') return null
  const t = new Date(rec.date).getTime()
  return Number.isFinite(t) ? t : null
}

// Türkçe ondalık: 0.32 → "0,32", -0.1 → "−0,10" (gerçek eksi işareti, U+2212).
// Sıfıra yuvarlanan negatifler "−0,00" değil "0,00" yazılır (AcuityTest.jsx fmt ile aynı kural).
export function decimalTr(v, digits = 2) {
  const r = +v.toFixed(digits)
  return (r === 0 ? 0 : r).toFixed(digits).replace('.', ',').replace('-', '−')
}

// Sayı ile birimi arasında bölünmez boşluk: dar ekranda "35 / sn" diye bölünmez.
export const NBSP = '\u00a0'

// Saniye → "45 sn", "2 dk 10 sn", "12 dk" (sayı–birim arası NBSP)
export function formatDuration(sec) {
  const s = Math.max(0, Math.round(finite(sec) ?? 0))
  if (s < 60) return `${s}${NBSP}sn`
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 10 || r === 0) return `${Math.round(s / 60)}${NBSP}dk`
  return `${m}${NBSP}dk ${r}${NBSP}sn`
}

const durationPart = (seconds, estimated) => (seconds > 0 ? `${estimated ? '~' : ''}${formatDuration(seconds)}` : null)

function vaDetail(results) {
  const sorted = [...results].sort((a, b) => EYE_ORDER.indexOf(a.eye) - EYE_ORDER.indexOf(b.eye))
  if (sorted.length === 1) {
    const [r] = sorted
    return join([r.logMAR != null ? `logMAR ${decimalTr(r.logMAR)}` : null, EYE_LABEL[r.eye]])
  }
  const eyePart = (r) => [EYE_SHORT[r.eye] ?? r.eye, r.logMAR != null ? decimalTr(r.logMAR) : null].filter(Boolean).join('\u00a0')
  return join(['logMAR', ...sorted.map(eyePart)])
}

function testActivity(t, ts, idx) {
  const own = positiveSec(t.seconds)
  const seconds = own ?? DEFAULT_TEST_SECONDS[t.type] ?? 0
  const base = {
    id: `t:${t.id ?? idx}`,
    date: new Date(ts).toISOString(),
    ts,
    kind: 'test',
    type: t.type ?? 'test',
    title: TEST_TITLE[t.type] ?? 'Test',
    seconds,
    estimated: own == null && seconds > 0,
  }
  if (VA_TYPES.has(t.type)) {
    const results = [{ eye: t.eye ?? null, logMAR: finite(t.logMAR) }]
    return { ...base, results, lastTs: ts, detail: vaDetail(results) }
  }
  if (t.type === 'reading') {
    const speed = finite(t.maxReadingSpeed)
    const cps = finite(t.criticalPrintSize)
    return {
      ...base,
      detail: speed == null ? 'Sonuç hesaplanamadı' : join([`${speed}${NBSP}kelime/dk`, cps != null ? `kritik boyut ${decimalTr(cps)}` : null]),
    }
  }
  return { ...base, detail: '' }
}

function sessionActivity(s, ts, idx) {
  const own = positiveSec(s.seconds)
  const base = { id: `s:${s.id ?? idx}`, date: new Date(ts).toISOString(), ts, type: s.type ?? 'exercise' }
  if (s.type === 'routine') {
    const set = SETS.find((x) => x.id === s.setId)
    const est = own == null && set ? setDurationSec(set) : null
    const seconds = own ?? est ?? 0
    return {
      ...base,
      kind: 'exercise',
      setId: s.setId ?? null,
      title: 'Egzersiz seti',
      seconds,
      estimated: est != null,
      detail: join([set ? `${set.title} set` : null, durationPart(seconds, est != null)]),
    }
  }
  if (s.type === 'blink') {
    const seconds = own ?? DEFAULT_BLINK_SECONDS
    const detected = s.cameraUsed ? finite(s.detectedClosures) : null
    return {
      ...base,
      kind: 'exercise',
      title: 'Göz kırpma egzersizi',
      seconds,
      estimated: own == null,
      detail: join([
        finite(s.reps) ? `${s.reps}${NBSP}tekrar` : null,
        detected != null ? `${detected}${NBSP}kırpma algılandı` : null,
        durationPart(seconds, own == null),
      ]),
    }
  }
  if (s.type === 'game') {
    const name = GAME_NAME[s.game] ?? null
    const score = finite(s.score)
    const seconds = own ?? 0
    return {
      ...base,
      kind: 'game',
      game: s.game ?? null,
      score,
      best: finite(s.best),
      control: s.control ?? null,
      title: name ? `${name} oyunu` : 'Oyun',
      seconds,
      estimated: false,
      detail: join([score != null ? `${score}${NBSP}puan` : null, CONTROL_LABEL[s.control], durationPart(seconds, false)]),
    }
  }
  const seconds = own ?? 0
  return { ...base, kind: 'exercise', title: 'Egzersiz', seconds, estimated: false, detail: join([durationPart(seconds, false)]) }
}

// tests: store.tests, sessions: store.sessions → [{ id, date, ts, kind, type, title, seconds, estimated, detail, ... }]
// Tarihe göre artan sırada. Geçersiz tarihli kayıtlar atlanır.
export function activitiesFrom(tests = [], sessions = []) {
  const out = []
  const sortedTests = list(tests)
    .map((t, i) => ({ t, i, ts: timeOf(t) }))
    .filter((x) => x.ts != null)
    .sort((a, b) => a.ts - b.ts)

  let lastVa = null
  for (const { t, i, ts } of sortedTests) {
    if (
      VA_TYPES.has(t.type) &&
      lastVa &&
      lastVa.type === t.type &&
      ts - lastVa.lastTs <= TEST_GROUP_WINDOW_MS &&
      !lastVa.results.some((r) => r.eye === (t.eye ?? null))
    ) {
      lastVa.results.push({ eye: t.eye ?? null, logMAR: finite(t.logMAR) })
      lastVa.lastTs = ts
      lastVa.detail = vaDetail(lastVa.results)
      continue
    }
    const a = testActivity(t, ts, i)
    out.push(a)
    lastVa = VA_TYPES.has(t.type) ? a : lastVa
  }
  for (const a of out) delete a.lastTs

  list(sessions).forEach((s, i) => {
    const ts = timeOf(s)
    if (ts != null) out.push(sessionActivity(s, ts, i))
  })
  return out.sort((a, b) => a.ts - b.ts)
}

// Oyun oturumları egzersiz/ölçüm günü sayılmaz: Home.jsx (haftalık hedef, günlük süre) ve
// App.jsx'teki Takvim sekmesi de sessions.filter(s => s.type !== 'game') kullanır. Gelişim'de
// seri, haftalık gün, aktif gün, aktivite/dakika toplamları ve takvim işaretleri bu listeden
// hesaplanır; oyunlar yalnızca gün listesinde ve "Yılan rekoru"nda görünür.
export const countsTowardGoal = (a) => a?.kind !== 'game'
export const countedActivities = (activities = []) => list(activities).filter(countsTowardGoal)

// Aktivite sayısı → takvim yoğunluğu: 0 | 1 | 2 (2 ve üzeri)
export function dayLevel(count) {
  if (!count || count < 0) return 0
  return count === 1 ? 1 : 2
}

// dayKey ('YYYY-MM-DD', yerel) → o günün aktiviteleri (saat sırasıyla)
export function byDay(activities = []) {
  const map = new Map()
  for (const a of [...list(activities)].sort((x, y) => new Date(x.date) - new Date(y.date))) {
    const k = dayKey(a.date)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(a)
  }
  return map
}

function streakFrom(days, now) {
  const cur = new Date(now)
  cur.setHours(12, 0, 0, 0)
  // VARSAYIM: bugün henüz aktivite yoksa seri dünden sayılır (gün bitmeden seri bozulmuş sayılmaz).
  if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1)
  let n = 0
  while (days.has(dayKey(cur))) {
    n++
    cur.setDate(cur.getDate() - 1)
  }
  return n
}

export function summary(activities = [], now = new Date()) {
  const acts = list(activities)
  const days = new Set(acts.map((a) => dayKey(a.date)))
  const seconds = acts.reduce((s, a) => s + (finite(a.seconds) ?? 0), 0)

  const start = startOfWeek(now)
  let thisWeekDays = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (days.has(dayKey(d))) thisWeekDays++
  }

  const snake = acts
    .filter((a) => a.type === 'game' && a.game === 'snake')
    .flatMap((a) => [a.score, a.best])
    .filter((v) => finite(v) != null)

  return {
    total: acts.length,
    seconds,
    minutes: Math.round(seconds / 60),
    activeDays: days.size,
    streakDays: streakFrom(days, now),
    thisWeekDays,
    bestSnake: snake.length ? Math.max(...snake) : null,
  }
}

// Belirli ayın (month: 0–11, yerel) toplamları
export function monthTotals(activities = [], year, month) {
  const acts = list(activities).filter((a) => {
    const d = new Date(a.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
  const seconds = acts.reduce((s, a) => s + (finite(a.seconds) ?? 0), 0)
  return { count: acts.length, seconds, minutes: Math.round(seconds / 60), activeDays: new Set(acts.map((a) => dayKey(a.date))).size }
}
