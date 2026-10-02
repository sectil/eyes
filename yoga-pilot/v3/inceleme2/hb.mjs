// Hızlı Bakış kullanan kişi: okuma gününde yoga (3 dk) yolu 21 dk'ya çıkarıp Hızlı Bakış'ı düşürüyor mu?
import { readdirSync, existsSync } from 'node:fs'
import { buildPath } from '../v3fix/today_v3.js'
import { dayKey } from '/home/user/eyes/app/src/lib/calendar.js'
const dir = '/home/user/eyes/app/src/modules'
const live = []
for (const d of readdirSync(dir)) { const f = `${dir}/${d}/manifest.js`; if (!existsSync(f)) continue; try { const m = (await import(f)).default; if (!m.retired) live.push(m) } catch {} }
const now = new Date(2026, 9, 9, 10) // 9. gün (okuma günü), E testi 1. günde yapıldı
const d = (n, h = 10) => new Date(2026, 9, n, h).toISOString()
const tests = [ ...['R','L','OU'].map((eye) => ({ type: 'va-weekly', eye, date: d(8), runDay: dayKey(new Date(2026,9,8)) })), { type: 'reading', date: d(2), runDay: dayKey(new Date(2026,9,2)) } ]
const sessions = [ { type: 'quick-look', date: d(7), seconds: 300 }, { type: 'notice', date: d(1,11), count: 1, seconds: 60 } ]
for (let n = 2; n <= 8; n++) sessions.push({ type: 'routine', setId: 'isinma', date: d(n) })
const yoga = { id: 'yoga', kind: 'practice', ring: 'life', gates: {}, today: () => ({ title: 'Yoga', sub: 'Tek Nokta', minutes: 3, slot: 'practice', order: 105, dropRank: 1.8, done: false }) }
for (const [name, mods] of [['yogasız', live], ['yogalı', [...live, yoga]]]) {
  const p = buildPath(mods, { tests, sessions, now })
  console.log(name, '|', p.stops.map((s) => `${s.title} ${s.minutes}`).join(' · '), '|', p.stops.reduce((a, s) => a + (s.minutes ?? 0), 0), 'dk')
}
