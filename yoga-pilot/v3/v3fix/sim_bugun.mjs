// PLAN.v3 düzeltmesi (seçenek b): yoga durağı (c)'ye bağlı değil; sayaçlarını ctx.sessions ve ctx.tests'ten kendisi
// türetir. Yol BUGÜNKÜ canlı manifestlerle (merdivensiz, Nefes 5 dk) kurulur; ctx.progression YOK.
// today_v3.js = bugünkü today.js + beş ek (collect later/stage, R7a yalnız göz bütçeli düşer, R5, next !later,
// allDone !later). Depoya hiçbir şey yazılmaz.
// Kullanım: node sim_bugun.mjs <saat> <gün> <gözBütçesiDk|-> [--md] [--yok]
import { readdirSync, existsSync } from 'node:fs'
import { weeklyStatus, readingStatus, runDayOf, lastComplete, calendarDaysBetween, isSameDay } from '/home/user/eyes/app/src/lib/today.js'
import { buildPath } from './today_v3.js'
import { dayKey } from '/home/user/eyes/app/src/lib/calendar.js'

const HOUR = Number(process.argv[2] ?? 10)
const DAYS = Number(process.argv[3] ?? 30)
const EYEB = process.argv[4] && process.argv[4] !== '-' ? Number(process.argv[4]) : null
const NO_YOGA = process.argv.includes('--yok')
const SKIP = new Set((process.argv.find((x) => x.startsWith('--atla=')) ?? '--atla=').slice(7).split(',').filter(Boolean).flatMap((r) => { const [a, b] = r.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a] }))
const START = new Date(2026, 9, 1, HOUR, 0, 0)
const dayDate = (n) => new Date(START.getTime() + (n - 1) * 86400000)

const dir = '/home/user/eyes/app/src/modules'
const live = []
for (const d of readdirSync(dir)) {
  const f = `${dir}/${d}/manifest.js`
  if (!existsSync(f)) continue
  try { const m = (await import(f)).default; if (!m.retired) live.push(m) } catch {}
}

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
function yogaStop({ sessions, tests, now }) {
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
const yoga = { id: 'yoga', kind: 'practice', ring: 'life', gates: {}, home: { order: 33 }, today: (ctx) => (NO_YOGA ? null : yogaStop(ctx)) }
// --nefes3: yoga yoldaysa Nefes durağı 3 dk (mola yine 5 dk; YOL.ilerleme.md:139 "5 (meditasyon açıldıysa 3)")
const N3 = process.argv.includes('--nefes3')
const liveN = live.map((m) => (N3 && m.id === 'breath' ? { ...m, today: (ctx) => { const it = m.today(ctx); return it && yogaStop(ctx) && !NO_YOGA ? { ...it, minutes: 3 } : it } } : m))
const MODULES = [...liveN, yoga]

const tests = [], sessions = [], rows = []
for (let n = 1; n <= DAYS; n++) {
  const now = dayDate(n)
  if (SKIP.has(n)) { rows.push({ n, skip: true, stops: [], total: 0, displaced: [] }); continue }
  const eye = EYEB ? { budgetMs: EYEB * 60000, used: 0, locked: false, due: null, leftMs: EYEB * 60000 } : undefined
  const ctx = { tests, sessions, now, ...(eye ? { eye } : {}) }
  const plan = buildPath(MODULES, ctx)
  const noYoga = buildPath(liveN.map((m) => (m.id === 'breath' ? live.find((x) => x.id === 'breath') : m)), ctx).stops.map((s) => s.key)
  const keys = plan.stops.map((s) => s.key)
  rows.push({ n, stops: plan.stops.map((s) => ({ key: s.key, t: s.title, sub: s.sub, m: s.minutes, b: s.block, f: Boolean(s.finale) })), total: plan.stops.reduce((a, s) => a + (s.minutes ?? 0), 0), displaced: noYoga.filter((k) => !keys.includes(k)) })
  for (const s of plan.stops) {
    const date = new Date(now.getTime() + 60000).toISOString(); const runDay = dayKey(now)
    if (s.id === 'weekly') for (const e of ['R', 'L', 'OU']) tests.push({ type: 'va-weekly', eye: e, date, runDay })
    else if (s.id === 'reading') tests.push({ type: 'reading', date, runDay })
    else if (s.id === 'routine') sessions.push({ type: 'routine', setId: s.key.split(':')[1], date })
    else if (s.id === 'snake' || s.id === 'track') sessions.push({ type: 'game', game: s.id, date })
    else if (s.id === 'breath') sessions.push({ type: 'breath', seconds: s.m * 60 || 300, date })
    else if (s.id === 'fark-ettin') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
    else if (s.id === 'tek-bakis') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
    else if (s.id === 'notice') sessions.push({ type: 'notice', count: 2, date, seconds: 60 })
    else if (s.id === 'yoga') { const it = yogaStop(ctx); sessions.push({ type: 'yoga', lesson: it.lesson, planned: it.minutes * 60, pathMin: it.minutes, date, completed: true }) }
    else sessions.push({ type: s.id, date, seconds: 60 })
  }
  // --gorev: kişi 1. gün Bugünün görevi'ni yol dışında bir kez dener (bugünkü kodda durak ancak bundan sonra yola girer)
  if (n === 1 && process.argv.includes('--gorev')) sessions.push({ type: 'notice', count: 1, date: new Date(now.getTime() + 3600000).toISOString(), seconds: 60 })
}
if (process.argv.includes('--json')) { (await import('node:fs')).writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify(rows)); }
if (process.argv.includes('--md')) {
  for (const r of rows.filter((x) => !x.skip)) console.log(`${String(r.n).padStart(2)} | ${r.stops.map((s) => `${s.t}${s.key === 'yoga' ? ' (' + s.sub + ')' : ''} ${s.m}`).join(' · ')} | ${r.total} dk${r.displaced.length ? ' | yoga yüzünden düşen: ' + r.displaced.join(',') : ''}`)
}
const t = rows.filter((r) => !r.skip).map((r) => r.total)
const y = rows.filter((r) => r.stops.some((s) => s.key === 'yoga'))
console.log(`SAAT=${HOUR} GÜN=${DAYS} GÖZ=${EYEB ?? 'yok(5)'} ${NO_YOGA ? 'YOGASIZ ' : ''}${process.argv.includes('--gorev') ? 'GÖREVLİ ' : ''}${N3 ? 'NEFES3 ' : ''}| en kısa ${Math.min(...t)} en uzun ${Math.max(...t)} ortalama ${(t.reduce((a, b) => a + b, 0) / t.length).toFixed(1)} | >15: ${t.filter((x) => x > 15).length} >20: ${t.filter((x) => x > 20).length} | yoga günü ${y.length} (5 dk: ${y.filter((r) => r.stops.find((s) => s.key === 'yoga').m === 5).length}) | yoga yüzünden düşen durak olan gün ${rows.filter((r) => r.displaced.length).length} | tam ders günleri ${rows.filter((r) => r.stops.some((s) => s.key === 'yoga' && s.m === 5)).map((r) => r.n + ':' + r.stops.find((s) => s.key === 'yoga').sub).join(' ')}`)
