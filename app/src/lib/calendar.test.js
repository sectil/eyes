import { describe, it, expect } from 'vitest'
import { dayKey, mondayIndex, startOfWeek, activeDays, weekProgress, monthGrid, isPlanned } from './calendar.js'

describe('temel', () => {
  it('dayKey yerel tarih', () => {
    expect(dayKey(new Date(2026, 8, 24, 23, 30))).toBe('2026-09-24')
  })
  it('Pazartesi = 0, Pazar = 6', () => {
    expect(mondayIndex(new Date(2026, 8, 21))).toBe(0) // 21 Eylül 2026 Pazartesi
    expect(mondayIndex(new Date(2026, 8, 27))).toBe(6)
  })
  it('haftanın başı Pazartesi', () => {
    expect(dayKey(startOfWeek(new Date(2026, 8, 24)))).toBe('2026-09-21')
    expect(dayKey(startOfWeek(new Date(2026, 8, 27)))).toBe('2026-09-21')
  })
})

describe('weekProgress', () => {
  it('aynı gün birden fazla kayıt tek gün sayılır', () => {
    const act = activeDays([
      { date: new Date(2026, 8, 21, 9).toISOString() },
      { date: new Date(2026, 8, 21, 20).toISOString() },
      { date: new Date(2026, 8, 23, 20).toISOString() },
    ])
    expect(weekProgress(act, new Date(2026, 8, 24))).toEqual({ done: 2, target: 3, met: false })
  })
  it('geçen haftanın kayıtları sayılmaz', () => {
    const act = activeDays([{ date: new Date(2026, 8, 20, 12).toISOString() }])
    expect(weekProgress(act, new Date(2026, 8, 24)).done).toBe(0)
  })
  it('hedef tutunca met', () => {
    const act = activeDays([21, 23, 25].map((d) => ({ date: new Date(2026, 8, d, 12).toISOString() })))
    expect(weekProgress(act, new Date(2026, 8, 26)).met).toBe(true)
  })
})

describe('monthGrid', () => {
  it('Eylül 2026: 1 Eylül Salı, 30 gün, tam haftalar', () => {
    const g = monthGrid(2026, 8)
    expect(g[0][0]).toBeNull()
    expect(g[0][1].getDate()).toBe(1)
    expect(g.every((w) => w.length === 7)).toBe(true)
    expect(g.flat().filter(Boolean)).toHaveLength(30)
  })
})

describe('isPlanned', () => {
  it('seçili günleri tanır', () => {
    expect(isPlanned(new Date(2026, 8, 21), ['MO', 'WE'])).toBe(true)
    expect(isPlanned(new Date(2026, 8, 22), ['MO', 'WE'])).toBe(false)
  })
})
