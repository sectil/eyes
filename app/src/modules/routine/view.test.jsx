// Yoldan açılan göz egzersizi grubu (SONSUZ_YOL.PLAN.v1 §3.A.6, §3.A.8-4): ekran, Ana sayfadaki durağın basamağıyla
// aynı içeriği açar; ilerleme yokken ve setlerde bugünkü içerik.
import { describe, it, expect } from 'vitest'
import { routeSet } from './view.jsx'
import { pathCtx } from '../pathContext.js'
import { SETS, PATH_GROUPS } from '../../lib/routines.js'
import { dayKey } from '../../lib/calendar.js'

const NOW = new Date('2026-10-05T10:00:00')
const day = (n, h = 10) => new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - n, h).toISOString()
// n gün önceden bugüne kadar her gün Göz kırpma yapılmış yeni kullanıcı
const routineDays = (n) => Array.from({ length: n }, (_, i) => ({ type: 'routine', setId: 'kirpma', seconds: 30, stage: 'K1', date: day(n - i) }))
const prog = (D) => ({ pathDay: D, mod: { routine: { D, G: D ? 1 : null, Dstage: D } }, later: [], seedDay: dayKey(NOW) })

describe('routeSet', () => {
  it('setler (Hafif, Normal …) her zaman bugünkü gibi', () => {
    for (const s of SETS) expect(routeSet({ sessions: routineDays(30) }, `routine-${s.id}`, NOW)).toBe(s)
  })
  it('ilerleme kapalıysa (progression: null) bugünkü grup', () => {
    const g = PATH_GROUPS.find((x) => x.id === 'isinma')
    expect(routeSet({ sessions: routineDays(1), progression: null }, 'routine-isinma', NOW)).toBe(g)
  })
  it('App bağlamı verirse o kullanılır: 2. gün Isınma durağı "Sağ–sol" adımlarıyla', () => {
    expect(routeSet({ sessions: [], progression: prog(1) }, 'routine-isinma', NOW)).toMatchObject({ id: 'isinma', title: 'Sağ–sol', group: true, steps: ['lookRight', 'lookLeft', 'rest'], stage: 'K2', variant: null })
  })
  it('bağlam gelmezse kayıtlardan türetilir (bugün sayılmaz): 1 kayıtlı gün → K2', () => {
    const set = routeSet({ tests: [], sessions: routineDays(1) }, 'routine-isinma', NOW)
    expect(set).toMatchObject({ title: 'Sağ–sol', stage: 'K2' })
    // bugünün kaydı basamağı değiştirmez
    const withToday = routeSet({ tests: [], sessions: [...routineDays(1), { type: 'routine', setId: 'isinma', seconds: 20, date: NOW.toISOString() }] }, 'routine-isinma', NOW)
    expect(withToday).toEqual(set)
  })
  it('bugünün yolunda olmayan grup bugünkü içerikle açılır', () => {
    const g = PATH_GROUPS.find((x) => x.id === 'daire')
    expect(routeSet({ sessions: [], progression: prog(0) }, 'routine-daire', NOW)).toBe(g)
  })
  it('pathCtx: bağlam yoksa kayıt defteriyle kurulur; bozuk değilse seedDay bugündür', () => {
    const c = pathCtx({ tests: [], sessions: routineDays(3) }, NOW)
    expect(c.progression.seedDay).toBe(dayKey(NOW))
    expect(c.progression.mod.routine.D).toBe(3)
    expect(pathCtx({ progression: null }, NOW).progression).toBeNull()
  })
  it('pathCtx önbelleği: aynı kayıt dizileri ve aynı gün → bağlam yeniden hesaplanmaz; kayıt ya da gün değişince yenilenir', () => {
    // 2 yıllık, her gün göz egzersizi ve nefes yapılmış geçmiş (App saniyede bir yeniden çizer)
    const sessions = []
    for (let n = 730; n >= 1; n--) for (const g of ['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']) sessions.push({ type: 'routine', setId: g, seconds: 40, date: day(n) })
    for (let n = 730; n >= 1; n--) sessions.push({ type: 'breath', seconds: 300, date: day(n, 11) })
    const tests = []
    const a = pathCtx({ tests, sessions }, NOW)
    const t0 = performance.now()
    for (let i = 0; i < 200; i++) expect(pathCtx({ tests, sessions }, new Date(NOW.getTime() + i * 1000)).progression).toBe(a.progression)
    expect(performance.now() - t0).toBeLessThan(200) // 200 çizim: ≈ 0 ms/çizim (önbelleksiz her biri onlarca ms)
    expect(routeSet({ tests, sessions }, 'routine-isinma', NOW)).toMatchObject({ stage: 'K7' })
    const more = [...sessions, { type: 'routine', setId: 'kirpma', seconds: 30, date: NOW.toISOString() }]
    expect(pathCtx({ tests, sessions: more }, NOW).progression).not.toBe(a.progression)
    const tomorrow = new Date(NOW.getTime() + 86400000)
    const b = pathCtx({ tests, sessions: more }, tomorrow)
    expect(b.progression.seedDay).toBe(dayKey(tomorrow))
    expect(b.progression.mod.routine.D).toBe(731)
  })
})
