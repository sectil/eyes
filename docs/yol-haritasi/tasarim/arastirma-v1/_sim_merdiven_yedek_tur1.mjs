// Yoga'nın yola entegrasyonu: 1–30. gün benzetimi. Yol kuralları GERÇEK koddan (app/src/lib/today.js buildPath,
// weeklyStatus, readingStatus; modules/weekly ve modules/reading manifestleri). İlerleme merdivenleri (henüz kodda yok)
// YOL.ilerleme.md §5'teki tablolardan sahte manifestlerle kurulur. Depoya hiçbir şey yazılmaz.
import { weeklyStatus, readingStatus, runDayOf, lastComplete, calendarDaysBetween, isSameDay } from '/home/user/eyes/app/src/lib/today.js'
import { buildPath } from './today_v4.js'
import { dayKey } from '/home/user/eyes/app/src/lib/calendar.js'
import weekly from '/home/user/eyes/app/src/modules/weekly/manifest.js'
import reading from '/home/user/eyes/app/src/modules/reading/manifest.js'

const POLICY = process.argv[2] ?? 'karar'
const HOUR = Number(process.argv[3] ?? 10)
const DAYS = Number(process.argv[4] ?? 30)
const SKIP = new Set((process.argv[5] ?? '').split(',').filter(Boolean).map(Number)) // hiç açılmayan günler
const START = new Date(2026, 9, 1, HOUR, 0, 0) // 1 Ekim 2026
const dayDate = (n) => new Date(START.getTime() + (n - 1) * 86400000)

// ---- ilerleme bağlamı (YOL.ilerleme §3: D = ayrı gün sayısı; YAPILACAKLAR kararı: bugün sayılmaz)
function progression(sessions, tests, now) {
  const today = dayKey(now)
  const before = (r) => runDayOf(r) && runDayOf(r) < today
  const days = (list) => new Set(list.filter(before).map(runDayOf)).size
  const all = [...sessions, ...tests]
  const by = (t) => sessions.filter((s) => s.mod === t)
  const lastDay = (list) => list.filter(before).map(runDayOf).sort().at(-1) ?? null
  const D = (t) => days(by(t))
  const G = (t) => { const l = lastDay(by(t)); return l ? calendarDaysBetween(l, today) : null }
  return { totalDays: days(all), D, G }
}
const weekDaysOf = (sessions, mod, now) => new Set(sessions.filter((s) => s.mod === mod && (new Date(now) - new Date(s.date)) <= 7 * 86400000 && (new Date(now) - new Date(s.date)) >= 0).map(runDayOf)).size
const doneToday = (sessions, mod, now, key) => sessions.some((s) => s.mod === mod && (key == null || s.key === key) && isSameDay(s, now))

// ---- sahte manifestler (ilerleme merdivenleri)
const K = (D) => D <= 0 ? ['kirpma'] : D <= 2 ? ['isinma', 'kirpma'] : D === 3 ? ['isinma', 'dikey', 'kirpma'] : D <= 5 ? ['isinma', 'uzak', 'dikey', 'kirpma'] : D <= 7 ? ['isinma', 'uzak', 'yakinuzak', 'dikey', 'kirpma'] : ['isinma', 'uzak', 'yakinuzak', 'donus', 'kirpma']
const PLACE = { isinma: { slot: 'warmup', order: 10, t: 'Isınma' }, sagsol: { slot: 'body', order: 30, t: 'Sağ–sol' }, uzak: { slot: 'body', order: 30, t: 'Uzağa bakış' }, yakinuzak: { slot: 'body', order: 50, t: 'Yakın–uzak' }, daire: { slot: 'body', order: 70, dropRank: 3, t: 'Daire' }, dikey: { slot: 'body', order: 70, t: 'Yukarı–aşağı' }, kirpma: { slot: 'body', order: 90, t: 'Göz kırpma' } }
const routine = {
  id: 'routine', kind: 'exercise', ring: 'eye', gates: { eyeBudget: 'eye' }, home: { order: 10 },
  today(ctx) {
    const p = ctx.progression; const groups = K(p.D('routine')).flatMap((g) => g === 'donus' ? ['daire', 'dikey'] : [g])
    return groups.map((g) => ({ key: g, title: PLACE[g].t, minutes: 1, ...PLACE[g], done: doneToday(ctx.sessions, 'routine', ctx.now, g),
      ...(g === 'daire' || g === 'dikey' ? (p.D('routine') >= 8 ? { rotate: 'donus', weekDays: weekDaysOf(ctx.sessions.filter((s) => s.key === g), 'routine', ctx.now) } : {}) : {}),
      ...(g === 'uzak' && false ? { rotate: 'uzak', weekDays: weekDaysOf(ctx.sessions.filter((s) => s.key === g), 'routine', ctx.now) } : {}) }))
  },
}
const gokyuzu = { id: 'gokyuzu', kind: 'practice', ring: 'life', gates: {}, home: { order: 36 },
  today(ctx) { if (ctx.progression.totalDays < 4) return null; return { title: 'Gökyüzü molası', minutes: 2, slot: 'body', order: 30, rotate: 'uzak', weekDays: weekDaysOf(ctx.sessions, 'gokyuzu', ctx.now), done: doneToday(ctx.sessions, 'gokyuzu', ctx.now) } } }
const track = { id: 'track', kind: 'practice', ring: 'attention', gates: { eyeBudget: 'eye' }, home: { order: 10 },
  today(ctx) { return { title: 'Çemberler', minutes: 1, slot: 'practice', game: true, done: doneToday(ctx.sessions, 'track', ctx.now) } } }
const N = process.env.NEFES === '112' ? [1, 1, 2, 2, 3] : [1, 2, 3]
const breath = { id: 'breath', kind: 'practice', ring: 'life', gates: {}, home: { order: 30 },
  today(ctx) {
    const p = ctx.progression; let m = N[Math.min(p.D('breath'), N.length - 1)]
    if (POLICY === 'karar' || POLICY === 'karar5') m = Math.min(m, 3) // sakinlik payı: yoga yolda (≥ 3. gün)
    if (POLICY === 'ilerleme' && p.totalDays >= 14) m = Math.min(m, 3) // ilerleme §5.1 N6: meditasyon açıldıysa 3
    return { title: `Nefes`, minutes: m, slot: 'rest', done: doneToday(ctx.sessions, 'breath', ctx.now) }
  } }
const walk = { id: 'yuruyus', kind: 'practice', ring: 'life', gates: {}, home: { order: 38 },
  today(ctx) { const p = ctx.progression; if (p.totalDays < 3) return null
    const r = POLICY === 'ilerleme' && p.totalDays >= 3 && yogaOpen(ctx) ? { rotate: 'beden', weekDays: weekDaysOf(ctx.sessions, 'yuruyus', ctx.now) } : {}
    return { title: 'Yürüyüş', minutes: 2, slot: 'body', order: 61, done: doneToday(ctx.sessions, 'yuruyus', ctx.now), ...r } } }
const snake = { id: 'snake', kind: 'practice', ring: 'attention', gates: { eyeBudget: 'eye' }, home: { order: 20 },
  today(ctx) { if (ctx.progression.totalDays < 1) return null; return { title: 'Yılan', minutes: 2, slot: 'open', openEnded: true, game: true, dropRank: 1, done: doneToday(ctx.sessions, 'snake', ctx.now) } } }
const notice = { id: 'notice', kind: 'practice', ring: 'attention', gates: {}, home: { order: 40 },
  today(ctx) { if (ctx.progression.totalDays < 1) return null; return { title: 'Bugünün görevi', minutes: 1, slot: 'finale', dropRank: 2, done: doneToday(ctx.sessions, 'notice', ctx.now) } } }
const week3 = (id, title, unlock, order, dropRank) => ({ id, kind: 'practice', ring: 'attention', gates: { eyeBudget: 'eye' }, home: { order: 15 },
  today(ctx) { if (ctx.progression.totalDays < unlock) return null; const done = doneToday(ctx.sessions, id, ctx.now); const days = weekDaysOf(ctx.sessions, id, ctx.now)
    if (!done && days >= 3) return null; return { title, minutes: 2, slot: 'body', order, dropRank, rotate: 'week3', weekDays: days, done } } })
const farkEttin = week3('fark-ettin', 'Fark Ettin mi?', 5, 65, 1.6)
const tekBakis = week3('tek-bakis', 'Tek Bakışta', 7, 95, 1.5)

// ---- YOGA (karar) --------------------------------------------------------------------------------------------
// Kütüphane sırası (PLAN.v2 §A.3); 3 yolda yok (gece). minMin: dersin en kısa sürümü (VARSAYIM: oturarak yapılan
// derslerde 3 dk sürüm üretilir; Ders 2 uzanarak + güvenli kalkış, en kısa 5 dk: timing.out.txt 5 dk kapak payları).
const LESSONS = { 1: ['Nefesin Ritmi', 3], 2: ['Derin Dinlenme', 5], 3: ['Uykuya Geçiş', 5], 4: ['Zor Anlar İçin', 3], 5: ['Tek Nokta', 3], 6: ['Sabah Niyeti', 3], 7: ['Kendine Şefkat', 5], 8: ['Sağlam Yer', 3], 9: ['Kendini Tanımak', 3], 10: ['Gelecekteki Sen', 3] }
const SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]
const UNLOCK_YOGA = 2, SHORT_BEFORE_FULL = 6
const night = (h) => h >= 20 || h < 5
const timeOk = (l, h) => (l === 6 ? h >= 5 && h < 12 : true) // Sabah Niyeti yalnız öğleden önce (VARSAYIM)
function yogaOpen(ctx) { return ctx.progression.totalDays >= UNLOCK_YOGA }
function eDayToday(tests, sessions, now) { // E testinin zamanı BUGÜN geldiyse (gün başındaki kayıtlarla; gün içinde değişmez)
  const today = dayKey(now)
  const pre = tests.filter((t) => runDayOf(t) && runDayOf(t) < today)
  const last = lastComplete(pre, 'va-weekly')
  if (last) return calendarDaysBetween(runDayOf(last), today) === 7
  const keys = [...pre, ...sessions.filter((x) => runDayOf(x) && runDayOf(x) < today)].map(runDayOf)
  return keys.length === 0 // hiç kayıt yok: 1. gün
}
function measureToday(tests, sessions, now) {
  const w = weeklyStatus(tests, now).state; const r = readingStatus(tests, now, sessions).state
  return w === 'due' || w === 'half' || w === 'done' || r === 'due' || r === 'done'
}
function yogaStop(ctx) {
  const { sessions, tests, now } = ctx; const p = ctx.progression; const h = new Date(now).getHours()
  if (!yogaOpen(ctx)) return null
  const yogaS = sessions.filter((s) => s.mod === 'yoga')
  const todayDone = yogaS.filter((s) => isSameDay(s, now)).at(-1)
  const nightNow = night(h)
  if (eDayToday(tests, sessions, now)) return null
  const prior = yogaS.filter((s) => !isSameDay(s, now))
  let minutes, lesson, full = false
  if (todayDone) { lesson = todayDone.lesson; minutes = todayDone.pathMin }
  else {
    const lastFull = prior.filter((s) => s.planned >= 300).map(runDayOf).sort().at(-1) ?? null
    const shortSince = new Set(prior.filter((s) => s.planned < 300 && (!lastFull || runDayOf(s) > lastFull)).map(runDayOf)).size
    const soft = p.G('yoga') != null && p.G('yoga') >= 14
    full = POLICY === 'karar5' ? true : !soft && !measureToday(tests, sessions, now) && shortSince >= SHORT_BEFORE_FULL
    minutes = full ? 5 : 3
    const count = (l) => prior.filter((s) => s.lesson === l).length
    const fullCount = (l) => prior.filter((s) => s.lesson === l && s.planned >= 300).length
    const cands = SEQ.filter((l) => LESSONS[l][1] <= minutes && timeOk(l, h))
    cands.sort((a, b) => count(a) - count(b) || (minutes >= 5 ? fullCount(a) - fullCount(b) : 0) || SEQ.indexOf(a) - SEQ.indexOf(b))
    lesson = cands[0]
  }
  return { title: 'Yoga', sub: LESSONS[lesson][0], lesson, minutes, slot: 'practice', order: 105, yields: true, done: Boolean(todayDone) }
}
const yoga = { id: 'yoga', kind: 'practice', ring: 'life', gates: {}, home: { order: 33 },
  today(ctx) {
    if (POLICY === 'yok') return null
    if (POLICY === 'karar' || POLICY === 'karar5') return yogaStop(ctx)
    if (POLICY === 'ilerleme') { // §5.13: 3 dk, günde tek bölüm, Yürüyüş ile beden döndürmesi
      if (!yogaOpen(ctx)) return null
      return { title: 'Yoga', sub: 'bölüm', minutes: 3, slot: 'body', order: 62, rotate: 'beden', weekDays: weekDaysOf(ctx.sessions, 'yoga', ctx.now), done: doneToday(ctx.sessions, 'yoga', ctx.now) }
    }
    if (POLICY === 'moduller') { // §4.5 meditasyon her gün 3 dk (≥ 2. gün), order 75; §4.6 yoga 5 dk order 97 'sessiz' (Keşfet'ten 1. gün dinlendi varsayımı)
      const d = ctx.progression.totalDays + 1
      if (d < 2) return null
      return [{ key: 'med', title: 'Meditasyon', minutes: 3, slot: 'practice', order: 75, dropRank: 2.5, rotate: 'sessiz', weekDays: weekDaysOf(ctx.sessions.filter((s) => s.key === 'med'), 'yoga', ctx.now), done: doneToday(ctx.sessions, 'yoga', ctx.now, 'med') },
              { key: 'yoga', title: 'Yoga', minutes: 5, slot: 'practice', order: 97, dropRank: 1.2, rotate: 'sessiz', weekDays: weekDaysOf(ctx.sessions.filter((s) => s.key === 'yoga'), 'yoga', ctx.now), done: doneToday(ctx.sessions, 'yoga', ctx.now, 'yoga') }]
    }
    return null
  } }

const MODULES = [weekly, reading, routine, track, breath, snake, notice, farkEttin, tekBakis, yoga].filter((m) => !(process.env.NOYOGA && m.id === 'yoga'))
const tests = []; const sessions = []
const rows = []
for (let n = 1; n <= DAYS; n++) {
  const now = dayDate(n)
  if (SKIP.has(n)) { rows.push({ n, skip: true }); continue }
  const ctx = { tests, sessions, now, progression: progression(sessions, tests, now), ...(process.env.EYEB ? { eye: { budgetMs: Number(process.env.EYEB) * 60000, used: 0, locked: false, due: null, leftMs: Number(process.env.EYEB) * 60000 } } : {}) }
  // tüm adaylar (düşme görmek için): buildPath'in kendisi; aday listesi collect öncesi
  const cand = []
  for (const m of MODULES) { const got = [].concat(m.today(ctx) ?? []); for (const it of got) if (it) cand.push((it.key ? `${m.id}:${it.key}` : m.id)) }
  const plan = buildPath(MODULES, ctx)
  const keys = plan.stops.map((s) => s.key)
  const noYoga = buildPath(MODULES.filter((m) => m.id !== 'yoga'), ctx).stops.map((s) => s.key)
  const displaced = noYoga.filter((k) => !keys.includes(k))
  // rotate ile elenenler ile R2/R7 ile düşenler ayrılır
  const rotated = []
  const groups = {}
  for (const m of MODULES) for (const it of [].concat(m.today(ctx) ?? [])) if (it?.rotate) (groups[it.rotate] ??= []).push(it.key ? `${m.id}:${it.key}` : m.id)
  const dropped = cand.filter((k) => !keys.includes(k))
  for (const k of dropped) if (Object.values(groups).some((g) => g.length > 1 && g.includes(k))) rotated.push(k)
  const R = dropped.filter((k) => !rotated.includes(k))
  rows.push({ n, date: dayKey(now), D_total: ctx.progression.totalDays, stops: plan.stops.map((s) => ({ key: s.key, t: s.title, sub: s.sub, m: s.minutes, b: s.block, f: Boolean(s.finale) })), total: plan.stops.reduce((a, s) => a + (s.minutes ?? 0), 0), rotated, dropped: R, displaced })
  // kullanıcı her durağı yapar (sırayla)
  for (const s of plan.stops) {
    const date = new Date(now.getTime() + 60000).toISOString()
    if (s.id === 'weekly') for (const eye of ['R', 'L', 'OU']) tests.push({ type: 'va-weekly', eye, date, runDay: dayKey(now) })
    else if (s.id === 'reading') tests.push({ type: 'reading', date, runDay: dayKey(now) })
    else if (s.id === 'yoga') { const st = plan.stops.find((x) => x.key === s.key); const it = [].concat(yoga.today(ctx)).find((x) => (x.key ? `yoga:${x.key}` : 'yoga') === s.key)
      sessions.push({ mod: 'yoga', key: it?.key, lesson: it?.lesson, planned: (it?.minutes ?? 3) * 60, pathMin: it?.minutes, date, runDay: dayKey(now), completed: true }) }
    else sessions.push({ mod: s.id, key: s.key.includes(':') ? s.key.split(':')[1] : undefined, date, runDay: dayKey(now) })
  }
}
if (process.argv.includes('--md')) {
  const fmt = (list) => list.map((x) => `${x.t}${x.key === 'yoga' ? ' · ' + x.sub : ''} ${x.m}`).join(' · ') || '—'
  console.log('| Gün | D (bugün sayılmaz) | Ölçüm | 1. bölüm | Mola | 2. bölüm (yoga son durak) | Final | Toplam dk | Yoga yüzünden düşen | Başka nedenle düşen · dönüşümde bugün olmayan |')
  console.log('|---|---|---|---|---|---|---|---|---|---|')
  for (const r of rows) {
    if (r.skip) { console.log(`| ${r.n} | — | — | açılmadı | | | | | | |`); continue }
    const meas = r.stops.filter((x) => x.key === 'weekly' || x.key === 'reading').map((x) => x.key === 'weekly' ? 'E testi' : 'Okuma').join(', ') || '—'
    console.log(`| ${r.n} | ${r.D_total} | ${meas} | ${fmt(r.stops.filter((x) => x.b === 1))} | ${fmt(r.stops.filter((x) => x.b === 0))} | ${fmt(r.stops.filter((x) => x.b === 2 && !x.f))} | ${fmt(r.stops.filter((x) => x.f))} | ${r.total} | ${r.displaced.join(', ') || '—'} | ${[...r.dropped.filter((k) => !r.displaced.includes(k)).map((k) => k + ' (düştü)'), ...r.rotated].join(', ') || '—'} |`)
  }
  process.exit(0)
}
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0) }
for (const r of rows) {
  if (r.skip) { console.log(`${String(r.n).padStart(2)} | (açılmadı)`); continue }
  const b1 = r.stops.filter((s) => s.b === 1).map((s) => `${s.t}${s.sub && s.key === 'yoga' ? ' ' + s.sub : ''} ${s.m}`).join(' · ')
  const rest = r.stops.filter((s) => s.b === 0).map((s) => `${s.t} ${s.m}`).join('')
  const b2 = r.stops.filter((s) => s.b === 2 && !s.f).map((s) => `${s.t}${s.key === 'yoga' ? ' (' + s.sub + ')' : ''} ${s.m}`).join(' · ')
  const fin = r.stops.filter((s) => s.f).map((s) => `${s.t}${s.key === 'yoga' ? ' (' + s.sub + ')' : ''} ${s.m}`).join(' · ')
  console.log(`${String(r.n).padStart(2)} | D=${r.D_total} | ${b1} | ${rest} | ${b2} | ${fin} | ${r.total} dk${r.dropped.length ? ' | düştü: ' + r.dropped.join(',') : ''}${r.rotated.length ? ' | dönüşümde bugün yok: ' + r.rotated.join(',') : ''}${r.displaced.length ? ' | YOGA YÜZÜNDEN DÜŞEN: ' + r.displaced.join(',') : ''}`)
}
const totals = rows.filter((r) => !r.skip).map((r) => r.total)
console.log(`\nPOLİTİKA=${POLICY} SAAT=${HOUR}  en kısa ${Math.min(...totals)}  en uzun ${Math.max(...totals)}  ortalama ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)}  >20: ${totals.filter((t) => t > 20).length}  düşme olan gün: ${rows.filter((r) => r.dropped?.length).length}  yoga yüzünden düşen durak olan gün: ${rows.filter((r) => r.displaced?.length).length}  yoga günleri: ${rows.filter((r) => r.stops?.some((x) => x.key === 'yoga')).length}  5 dk: ${rows.filter((r) => r.stops?.some((x) => x.key === 'yoga' && x.m === 5)).length}`)
