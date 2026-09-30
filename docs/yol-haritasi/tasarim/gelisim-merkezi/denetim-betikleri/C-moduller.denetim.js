import { test, vi } from 'vitest'
vi.mock('/home/user/eyes/app/src/lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => true }))
import { registry } from '/home/user/eyes/app/src/modules/registry.js'
import { hub, growthMap } from '/home/user/eyes/app/src/lib/dataHub.js'
import { moduleSignals } from '/home/user/eyes/app/src/lib/coach.js'
import { acuteEffects } from '/home/user/eyes/app/src/lib/progress.js'

const NOW = new Date('2026-09-30T20:00:00')
const ago = (d, h = 19) => { const x = new Date(NOW); x.setDate(x.getDate() - d); x.setHours(h, 0, 0, 0); return x.toISOString() }
let id = 0
const S = (o) => ({ id: `x${++id}`, ...o })
const sessions = [
  // yoga: 7 gün önce 21:00 (takvimde 8. gün, kayan 7×24 saatte içeride), 3 gün önce iki ders (biri yarıda), bugün
  S({ type: 'yoga', lesson: 1, date: ago(7, 21), seconds: 600, planned: 600, completed: true, reachedClosing: true, before: 4, after: 7 }),
  S({ type: 'yoga', lesson: 2, date: ago(3, 9), seconds: 45, planned: 900, completed: false, reachedClosing: false, before: 5, after: null }),
  S({ type: 'yoga', lesson: 1, date: ago(3, 19), seconds: 600, planned: 600, completed: true, reachedClosing: true, before: 3, after: 6 }),
  S({ type: 'yoga', lesson: 5, date: ago(0, 8), seconds: 300, planned: 600, completed: false, reachedClosing: true, quickClose: true, before: 4, after: 8 }),
  S({ type: 'breath', date: ago(7, 21), seconds: 300, calmBefore: 2, calmAfter: 4, completed: true }),
  S({ type: 'breath', date: ago(1), seconds: 240, calmBefore: 3, calmAfter: 4, completed: true }),
  S({ type: 'notice', date: ago(7, 21), prompt: 'x', count: 9, seconds: 0 }),
  S({ type: 'notice', date: ago(2), prompt: 'x', count: 1, seconds: 0 }),
  S({ type: 'span', span: 5.2, durationMs: 120, date: ago(10) }),
  S({ type: 'span', span: 6.0, durationMs: 100, date: ago(1) }),
  S({ type: 'quick-look', threshold: 260, level: 1, seconds: 300, date: ago(9) }),
  S({ type: 'quick-look', threshold: 200, level: 2, seconds: 300, date: ago(1) }),
  S({ type: 'game', game: 'snake', score: 40, best: 40, control: 'eyes', seconds: 120, date: ago(2) }),
  S({ type: 'street', noticed: 3, asked: 4, level: 2, task: 1, seconds: 200, date: ago(2) }),
]

test('modül stats/coach', () => {
  const live = registry.live.filter((m) => m.coach || m.stats)
  console.log('coach/stats olan canlı modüller:', live.map((m) => `${m.id}[${m.coach ? 'c' : ''}${m.stats ? 's' : ''}]`).join(' '))
  console.log('\n# BOŞ VERİ')
  for (const m of live) console.log(m.id, '| coach:', JSON.stringify(m.coach?.(([]), NOW)), '| stats:', JSON.stringify(m.stats?.([], NOW)))
  console.log('moduleSignals([]):', JSON.stringify(moduleSignals([], NOW)))
  console.log('\n# ÖRNEK VERİ')
  for (const m of live) {
    const c = m.coach?.(sessions, NOW); const s = m.stats?.(sessions, NOW)
    if ((c && Object.values(c).some((v) => v)) || (s && s.length)) console.log(m.id, '| coach:', JSON.stringify(c), '| stats:', JSON.stringify(s))
  }
  const h = hub({ sessions, now: NOW })
  console.log('\n# MERKEZ (hub) records')
  for (const d of Object.keys(h.domains)) console.log(d, JSON.stringify(h.domains[d].records), 'effects:', JSON.stringify(h.domains[d].effects.map((e) => ({ k: e.key, n: e.n, gain: e.gain })) ))
  const g = growthMap({ sessions, now: NOW })
  console.log('\n# growthMap gün', JSON.stringify(Object.fromEntries(Object.entries(g.domains ?? g).map(([k, v]) => [k, v?.days]))))
  const y = sessions.filter((s) => s.type === 'yoga')
  console.log('\n# yoga etkileri (acuteEffects, yalnız yoga)', JSON.stringify(acuteEffects(y).map((e) => ({ k: e.key, n: e.n, before: e.before, after: e.after }))))
})
