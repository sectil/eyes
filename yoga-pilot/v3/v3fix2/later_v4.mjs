import { buildPath, canOpen } from './today_v4.js'
const now = new Date(2026, 9, 5, 10)
const mods = [
  { id: 'breath', kind: 'practice', today: () => ({ title: 'Nefes', minutes: 3, slot: 'rest', done: true }) },
  { id: 'routine', kind: 'exercise', gates: { eyeBudget: 'eye' }, today: () => ({ title: 'Göz kırpma', minutes: 1, slot: 'body', order: 90, done: true }) },
  { id: 'yoga', kind: 'practice', gates: {}, today: () => ({ title: 'Yoga', minutes: 3, slot: 'practice', order: 105, yields: true, done: false, later: true }) },
  { id: 'notice', kind: 'practice', gates: {}, today: () => ({ title: 'Bugünün görevi', minutes: 1, slot: 'finale', dropRank: 2, done: false }) },
]
const p = buildPath(mods, { now })
const fin = p.stops.find((s) => s.id === 'notice')
console.log('allDone', p.allDone, '| next', p.next?.title, '| Bugünün görevi açılır mı', canOpen(p, fin))
