import { weeklyStatus, readingStatus, runDayOf, lastComplete, calendarDaysBetween, isSameDay } from '/home/user/eyes/app/src/lib/today.js'
import { dayKey } from '/home/user/eyes/app/src/lib/calendar.js'
// ---- Yoga durağı: sayaçlar kayıtlardan (readingStatus'un today.js:141-142'de yaptığı gibi) ----
const LESSONS = { 1: ['Nefesin Ritmi', 3], 2: ['Derin Dinlenme', 5], 3: ['Uykuya Geçiş', 5], 4: ['Zor Anlar İçin', 3], 5: ['Tek Nokta', 3], 6: ['Sabah Niyeti', 3], 7: ['Kendine Şefkat', 5], 8: ['Sağlam Yer', 3], 9: ['Kendini Tanımak', 3], 10: ['Gelecekteki Sen', 3] }
const SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]
const UNLOCK_DAYS = 2, SHORT_BEFORE_FULL = 6, SOFT_GAP = 14
const isYoga = (s) => s?.type === 'yoga'
const timeOk = (l, h) => (l === 6 ? h >= 5 && h < 12 : true)
function counters(sessions, tests, now) {
  const today = dayKey(now)
  const before = (r) => { const k = runDayOf(r); return k && k < today ? k : null }
  const totalDays = new Set([...sessions, ...tests].map(before).filter(Boolean)).size // bugün sayılmaz
  const yogaDays = sessions.filter(isYoga).map(before).filter(Boolean).sort()
  const gap = yogaDays.length ? calendarDaysBetween(yogaDays.at(-1), today) : null
  return { totalDays, gap }
}
function eDayToday(tests, sessions, now) {
  const today = dayKey(now)
  const pre = tests.filter((t) => runDayOf(t) && runDayOf(t) < today)
  const last = lastComplete(pre, 'va-weekly')
  if (last) return calendarDaysBetween(runDayOf(last), today) === 7 // "en çok bir gün"
  const keys = [...pre, ...sessions.filter((x) => runDayOf(x) && runDayOf(x) < today)].map(runDayOf)
  return keys.length === 0
}
function measureToday(tests, sessions, now) {
  const w = weeklyStatus(tests, now).state; const r = readingStatus(tests, now, sessions).state
  return w === 'due' || w === 'half' || w === 'done' || r === 'due' || r === 'done'
}
export function yogaStop({ sessions, tests, now }) {
  const h = new Date(now).getHours()
  const c = counters(sessions, tests, now)
  if (c.totalDays < UNLOCK_DAYS) return null
  const yogaS = sessions.filter(isYoga)
  const todayDone = yogaS.filter((s) => isSameDay(s, now)).at(-1)
  if (!todayDone && eDayToday(tests, sessions, now)) return null
  const prior = yogaS.filter((s) => !isSameDay(s, now))
  let minutes, lesson, full = false
  if (todayDone) { lesson = todayDone.lesson; minutes = todayDone.pathMin }
  else {
    const lastFull = prior.filter((s) => s.planned >= 300).map(runDayOf).sort().at(-1) ?? null
    const shortSince = new Set(prior.filter((s) => s.planned < 300 && (!lastFull || runDayOf(s) > lastFull)).map(runDayOf)).size
    const soft = c.gap != null && c.gap >= SOFT_GAP
    full = !soft && !measureToday(tests, sessions, now) && shortSince >= SHORT_BEFORE_FULL
    minutes = full ? 5 : 3
    const count = (l) => prior.filter((s) => s.lesson === l).length
    const fullCount = (l) => prior.filter((s) => s.lesson === l && s.planned >= 300).length
    const cands = SEQ.filter((l) => LESSONS[l][1] <= minutes && timeOk(l, h))
    cands.sort((a, b) => count(a) - count(b) || (minutes >= 5 ? fullCount(a) - fullCount(b) : 0) || SEQ.indexOf(a) - SEQ.indexOf(b))
    lesson = cands[0]
  }
  return { title: 'Yoga', sub: LESSONS[lesson][0], lesson, minutes, slot: 'practice', order: 105, dropRank: 1.8, done: Boolean(todayDone) }
}
export const yogaModule = { id: 'yoga', kind: 'practice', ring: 'life', gates: {}, home: { order: 33 }, today: (ctx) => yogaStop(ctx) }
