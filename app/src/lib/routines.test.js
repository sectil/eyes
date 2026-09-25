import { describe, it, expect } from 'vitest'
import { EXERCISES, SETS, setDurationSec, formatMin, todaySeconds } from './routines.js'

describe('SETS', () => {
  it('her adım tanımlı', () => {
    for (const s of SETS) for (const id of s.steps) expect(EXERCISES[id], `${s.id}:${id}`).toBeDefined()
  })
  it('Hafif ~1 dk, Normal ~2 dk, Tam ~3 dk', () => {
    const [lite, normal, full] = SETS.map(setDurationSec)
    expect(lite).toBeGreaterThanOrEqual(45)
    expect(lite).toBeLessThanOrEqual(90)
    expect(normal).toBeGreaterThanOrEqual(90)
    expect(normal).toBeLessThanOrEqual(150)
    expect(full).toBeGreaterThanOrEqual(150)
    expect(full).toBeLessThanOrEqual(210)
  })
  it('her set kanıtlı göz kırpmayı içerir', () => {
    for (const s of SETS) expect(s.steps.some((id) => EXERCISES[id].kind === 'evidence')).toBe(true)
  })
  it('kanıtsız hareketler iddia taşımaz (kind relax/comfort)', () => {
    const kinds = new Set(Object.values(EXERCISES).map((e) => e.kind))
    expect([...kinds].every((k) => ['evidence', 'comfort', 'relax', 'calm'].includes(k))).toBe(true)
  })
  it('Derin: başta ve sonda 1 dk sakin nefes, arada nefes molaları, ~4–5 dk', () => {
    const deep = SETS.find((s) => s.id === 'deep')
    expect(deep.steps[0]).toBe('breathCalm')
    expect(deep.steps.filter((id) => EXERCISES[id].visual === 'breath').length).toBeGreaterThanOrEqual(3)
    expect(setDurationSec(deep)).toBeGreaterThanOrEqual(240)
    expect(setDurationSec(deep)).toBeLessThanOrEqual(330)
    expect(deep.steps.some((id) => EXERCISES[id].kind === 'evidence')).toBe(true)
  })
})

describe('formatMin', () => {
  it('yuvarlar', () => {
    expect(formatMin(0)).toBe('0 dk')
    expect(formatMin(20)).toBe('<1 dk')
    expect(formatMin(70)).toBe('1 dk')
    expect(formatMin(125)).toBe('2 dk')
  })
})

describe('todaySeconds', () => {
  it('yalnızca bugünü toplar', () => {
    const now = new Date(2026, 8, 24, 20)
    const s = [
      { date: new Date(2026, 8, 24, 9).toISOString(), type: 'routine', seconds: 60 },
      { date: new Date(2026, 8, 24, 12).toISOString(), type: 'blink' },
      { date: new Date(2026, 8, 23, 12).toISOString(), type: 'routine', seconds: 999 },
    ]
    expect(todaySeconds(s, now)).toBe(60 + 150)
  })
})
