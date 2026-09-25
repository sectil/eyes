import { describe, it, expect } from 'vitest'
import { todayPlan, isDue, isSameDay } from './today.js'
import { registry } from '../modules/registry.js'

const NOW = new Date('2026-09-25T10:00:00')
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const plan = (tests = [], sessions = []) => todayPlan(registry.modules, { tests, sessions, now: NOW })

describe('todayPlan', () => {
  it('yeni kullanıcı: haftalık test, okuma, egzersiz — ölçüm önce', () => {
    const p = plan()
    expect(p.items.map((i) => i.id)).toEqual(['weekly', 'reading', 'breath-count', 'routine'])
    expect(p.next.id).toBe('weekly')
    expect(p.next.route).toBe('weekly')
    expect(p.allDone).toBe(false)
  })

  it('haftalık zamanı gelmediyse günlük test girer; okuma haftası dolmadıysa okuma girmez', () => {
    const tests = [{ type: 'va-weekly', eye: 'OU', date: daysAgo(2) }, { type: 'reading', date: daysAgo(3) }]
    const p = plan(tests, [{ type: 'breath-count', accuracy: 80, date: daysAgo(2) }])
    expect(p.items.map((i) => i.id)).toEqual(['daily', 'routine'])
    expect(p.next.title).toBe('Günlük test')
  })

  it('bugün yapılanlar tamam görünür; egzersiz hedefi dolunca plan biter', () => {
    const today = NOW.toISOString()
    const tests = [{ type: 'va-weekly', eye: 'OU', date: today }, { type: 'reading', date: today }]
    const sessions = [{ type: 'routine', setId: 'full', seconds: 200, date: today }, { type: 'breath-count', accuracy: 80, date: today }]
    const p = plan(tests, sessions)
    expect(p.items.every((i) => i.done)).toBe(true)
    expect(p.allDone).toBe(true)
    expect(p.next).toBeNull()
  })

  it('oyun süresi egzersiz hedefine sayılmaz; kalan süreyi kapatan en kısa set önerilir', () => {
    const tests = [{ type: 'va-weekly', eye: 'OU', date: daysAgo(1) }, { type: 'reading', date: daysAgo(1) }]
    const sessions = [{ type: 'game', game: 'snake', seconds: 600, date: NOW.toISOString() }, { type: 'breath-count', accuracy: 80, date: daysAgo(1) }]
    const r = plan(tests, sessions).items.find((i) => i.id === 'routine')
    expect(r.done).toBe(false)
    expect(r.route).toMatch(/^routine-/)
  })

  it('Derin set yalnızca kullanıcı onu seçmişse planda; yoksa Tam set', () => {
    const tests = [{ type: 'va-weekly', eye: 'OU', date: daysAgo(1) }, { type: 'reading', date: daysAgo(1) }]
    const bc = { type: 'breath-count', accuracy: 80, date: daysAgo(1) }
    expect(plan(tests, [bc]).items.find((i) => i.id === 'routine').title).toBe('Tam set')
    const deep = { type: 'routine', setId: 'deep', seconds: 250, date: daysAgo(1) }
    expect(plan(tests, [bc, deep]).items.find((i) => i.id === 'routine').route).toBe('routine-deep')
  })

  it('takılan modül plana adım ekler, bozuk modül planı düşürmez', () => {
    const mods = [
      { id: 'a', kind: 'practice', today: () => ({ title: 'A', minutes: 2, done: false }) },
      { id: 'b', kind: 'measure', today: () => { throw new Error('bozuk') } },
      { id: 'c', kind: 'measure' },
    ]
    const p = todayPlan(mods, { now: NOW })
    expect(p.items.map((i) => i.id)).toEqual(['a'])
    expect(p.next.route).toBe('a')
  })
})

describe('yardımcılar', () => {
  it('isDue: kayıt yoksa ya da 7 günden eskiyse', () => {
    expect(isDue(null, NOW)).toBe(true)
    expect(isDue({ date: daysAgo(6) }, NOW)).toBe(false)
    expect(isDue({ date: daysAgo(8) }, NOW)).toBe(true)
  })
  it('isSameDay', () => {
    expect(isSameDay({ date: NOW.toISOString() }, NOW)).toBe(true)
    expect(isSameDay({ date: daysAgo(1) }, NOW)).toBe(false)
    expect(isSameDay({ date: 'bozuk' }, NOW)).toBe(false)
  })
})

describe('profil → plan', () => {
  it('uyku ≤4 ya da stres yüksekse nefes hiç yapılmamış olsa da plana girer', () => {
    const base = { tests: [], sessions: [], now: NOW }
    expect(todayPlan(registry.modules, base).items.map((i) => i.id)).not.toContain('breath')
    const poor = { ...base, profile: { sleep: 3, stress: { control: 0, overwhelmed: 0 } } }
    expect(todayPlan(registry.modules, poor).items.map((i) => i.id)).toContain('breath')
    const fine = { ...base, profile: { sleep: 8, stress: { control: 1, overwhelmed: 1 } } }
    expect(todayPlan(registry.modules, fine).items.map((i) => i.id)).not.toContain('breath')
  })
})
