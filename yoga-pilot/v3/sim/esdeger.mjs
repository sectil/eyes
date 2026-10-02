// Eşdeğerlik: bugünkü today.js ile yamalı kopyası (R5 + allDone 'later' + collect 'later'/'stage') gerçek 20 manifestle
// rastgele binlerce bağlamda AYNI yolu veriyor mu? (ctx.progression yok: bugünkü davranış)
import { readdirSync, existsSync } from 'node:fs'
import * as A from '/home/user/eyes/app/src/lib/today.js'
import * as B from './today_patched.js'
const dir = '/home/user/eyes/app/src/modules'
const mods = []
for (const d of readdirSync(dir)) { const f = `${dir}/${d}/manifest.js`; if (!existsSync(f)) continue; try { mods.push((await import(f)).default) } catch {} }
const live = mods.filter((m) => !m.retired)
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const pick = (a) => a[Math.floor(rnd() * a.length)]
const DAY = 86400000
const sig = (p) => JSON.stringify({ k: p.stops.map((s) => [s.key, s.block, s.minutes, s.done, s.locked]), n: p.next?.key ?? null, a: p.allDone, m: p.minutesLeft, b: p.blocks, r: p.restIndex, f: p.forcedRestBefore })
let n = 0, diff = 0, withSnake = 0
for (let i = 0; i < 20000; i++) {
  const now = new Date(Date.UTC(2026, 8, 1) + Math.floor(rnd() * 60) * DAY + Math.floor(rnd() * 24) * 3600000)
  const ago = (d) => new Date(now.getTime() - d * DAY - Math.floor(rnd() * 3) * 3600000).toISOString()
  const tests = [], sessions = []
  const nt = Math.floor(rnd() * 8)
  for (let j = 0; j < nt; j++) { const d = Math.floor(rnd() * 16); const t = pick(['va-weekly', 'va-weekly', 'reading', 'va-daily']); if (t === 'reading') tests.push({ type: t, date: ago(d) }); else for (const eye of (t === 'va-weekly' ? ['R', 'L', 'OU'] : ['R', 'L']).filter(() => rnd() < 0.85)) tests.push({ type: t, eye, date: ago(d) }) }
  const ns = Math.floor(rnd() * 25)
  for (let j = 0; j < ns; j++) { const d = Math.floor(rnd() * 9); const date = ago(d); const k = pick(['routine', 'game-snake', 'game-track', 'breath', 'span', 'street', 'quick-look', 'notice'])
    if (k === 'routine') sessions.push({ type: 'routine', setId: pick(['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']), date })
    else if (k.startsWith('game')) sessions.push({ type: 'game', game: k.slice(5), date })
    else if (k === 'breath') sessions.push({ type: 'breath', seconds: pick([30, 60, 300]), date })
    else if (k === 'span') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
    else if (k === 'street') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
    else sessions.push({ type: k, date, seconds: 60, count: 2 }) }
  sessions.sort((a, b) => a.date.localeCompare(b.date)); tests.sort((a, b) => a.date.localeCompare(b.date))
  const eye = rnd() < 0.5 ? undefined : { locked: rnd() < 0.2, due: rnd() < 0.3 ? 'budget' : null, used: Math.floor(rnd() * 6) * 60000, budgetMs: pick([5, 3]) * 60000, leftMs: 120000 }
  const ctx = { tests, sessions, now, eye, profile: rnd() < 0.2 ? { seizure: 'yes' } : undefined, gate: { firstTestOnly: rnd() < 0.1 } }
  const pa = A.buildPath(live, ctx), pb = B.buildPath(live, ctx)
  n++; if (pa.stops.some((s) => s.id === 'snake')) withSnake++
  if (sig(pa) !== sig(pb)) { diff++; if (diff < 3) console.log('FARK', sig(pa), '\n', sig(pb)) }
}
console.log(`modül ${live.length} · bağlam ${n} · Yılan'lı yol ${withSnake} · fark ${diff}`)
