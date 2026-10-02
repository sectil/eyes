// Yoga modülü eklenince bugünkü duraklar değişiyor mu? A: bugünkü today.js + canlı manifestler. B: today_v3.js +
// canlı manifestler + yoga (sayaçları kayıtlardan). Karşılaştırılan: yoga DIŞINDAKİ durakların listesi (anahtar, bölüm,
// süre, tamam, kilit). Rastgele bağlam üreteci sim/esdeger.mjs ile aynı; oturumlara rastgele yoga kaydı da eklenir.
import { readdirSync, existsSync } from 'node:fs'
import * as A from '/home/user/eyes/app/src/lib/today.js'
import * as B from './today_v3.js'
import { yogaModule } from './yoga_stop.mjs'
const dir = '/home/user/eyes/app/src/modules'
const mods = []
for (const d of readdirSync(dir)) { const f = `${dir}/${d}/manifest.js`; if (!existsSync(f)) continue; try { mods.push((await import(f)).default) } catch {} }
const live = mods.filter((m) => !m.retired)
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const pick = (a) => a[Math.floor(rnd() * a.length)]
const DAY = 86400000
const sig = (p) => JSON.stringify(p.stops.filter((s) => s.id !== 'yoga').map((s) => [s.key, s.block, s.minutes, s.done, s.locked]))
let n = 0, diff = 0, withYoga = 0, capDrop = 0, other = 0, overDone = 0, dropAfterDone = 0
for (let i = 0; i < 20000; i++) {
  const now = new Date(Date.UTC(2026, 8, 1) + Math.floor(rnd() * 60) * DAY + Math.floor(rnd() * 24) * 3600000)
  const ago = (d) => new Date(now.getTime() - d * DAY - Math.floor(rnd() * 3) * 3600000).toISOString()
  const tests = [], sessions = []
  const nt = Math.floor(rnd() * 8)
  for (let j = 0; j < nt; j++) { const d = Math.floor(rnd() * 16); const t = pick(['va-weekly', 'va-weekly', 'reading', 'va-daily']); if (t === 'reading') tests.push({ type: t, date: ago(d) }); else for (const eye of (t === 'va-weekly' ? ['R', 'L', 'OU'] : ['R', 'L']).filter(() => rnd() < 0.85)) tests.push({ type: t, eye, date: ago(d) }) }
  const ns = Math.floor(rnd() * 25)
  for (let j = 0; j < ns; j++) { const d = Math.floor(rnd() * 9); const date = ago(d); const k = pick(['routine', 'game-snake', 'game-track', 'breath', 'span', 'street', 'quick-look', 'notice', 'yoga'])
    if (k === 'routine') sessions.push({ type: 'routine', setId: pick(['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']), date })
    else if (k.startsWith('game')) sessions.push({ type: 'game', game: k.slice(5), date })
    else if (k === 'breath') sessions.push({ type: 'breath', seconds: pick([30, 60, 300]), date })
    else if (k === 'span') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
    else if (k === 'street') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
    else if (k === 'yoga') { const m = pick([3, 5, 15]); sessions.push({ type: 'yoga', lesson: pick([1, 2, 4, 5, 6, 7, 8, 9, 10]), planned: m * 60, pathMin: m > 5 ? 5 : m, date, completed: true }) }
    else sessions.push({ type: k, date, seconds: 60, count: 2 }) }
  sessions.sort((a, b) => a.date.localeCompare(b.date)); tests.sort((a, b) => a.date.localeCompare(b.date))
  const eye = rnd() < 0.5 ? undefined : { locked: rnd() < 0.2, due: rnd() < 0.3 ? 'budget' : null, used: Math.floor(rnd() * 6) * 60000, budgetMs: pick([5, 3]) * 60000, leftMs: 120000 }
  const ctx = { tests, sessions, now, eye, profile: rnd() < 0.2 ? { seizure: 'yes' } : undefined, gate: { firstTestOnly: rnd() < 0.1 } }
  const pa = A.buildPath(live, ctx), pb = B.buildPath([...live, yogaModule], ctx)
  n++
  const hasY = pb.stops.some((s) => s.id === 'yoga'); if (hasY) withYoga++
  if (sig(pa) !== sig(pb)) {
    diff++
    const total = pb.stops.reduce((a, s) => a + (s.minutes ?? 0), 0)
    const aKeys = pa.stops.map((s) => s.key), bKeys = pb.stops.filter((s) => s.id !== 'yoga').map((s) => s.key)
    const lost = aKeys.filter((k) => !bKeys.includes(k))
    const sameRest = JSON.stringify(pa.stops.filter((s) => !lost.includes(s.key)).map((s) => [s.key, s.block, s.minutes, s.done, s.locked])) === sig(pb)
    const yDone = pb.stops.find((s) => s.id === 'yoga')?.done
    if (hasY && lost.length && sameRest) { capDrop++; if (total > 20) overDone++; if (yDone) dropAfterDone++ }
    else { other++; if (other < 3) console.log('BAŞKA FARK', sig(pa), '\n', sig(pb)) }
  }
}
console.log(`bağlam ${n} · yogalı yol ${withYoga} · yoga dışı duraklarda fark ${diff} (yalnız 20 dk sınırında durak düşmesi ${capDrop}; bunların ${dropAfterDone}'ünde yoga bugün zaten yapılmış, ${overDone}'ünde yol yine 20'yi aşıyor; başka fark ${other})`)
