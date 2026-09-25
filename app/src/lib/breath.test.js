import { describe, it, expect } from 'vitest'
import {
  makePlan, phaseAt, makeRecord, programProgress, calmChange, normalizePhases, loadBreathOpts, saveBreathOpts,
  PATTERNS, PATTERN_ORDER, RAMP_SESSIONS, HOLD_MAX, PROGRAM_DAY_SEC, SESSION_TYPE, PHASE,
} from './breath.js'

const mem = () => {
  const m = new Map()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }
}

describe('makePlan', () => {
  it('Sakin ritim: ilk 3 seans kademeli (3,5/4,5), sonra 4/6 = dakikada 6', () => {
    const early = makePlan({ pattern: 'calm', durationSec: 180, priorSessions: 0 })
    expect(early.ramped).toBe(true)
    expect(early.phases).toEqual([{ kind: 'in', sec: 3.5 }, { kind: 'out', sec: 4.5 }])
    expect(early.bpm).toBe(7.5)
    const later = makePlan({ pattern: 'calm', durationSec: 180, priorSessions: RAMP_SESSIONS })
    expect(later.ramped).toBe(false)
    expect(later.cycleSec).toBe(10)
    expect(later.bpm).toBe(6)
    expect(later.cycles).toBe(18)
    expect(later.totalSec).toBe(180)
  })
  it('Uzun veriş: iki alış + uzun veriş; Kutu 4 aşama', () => {
    expect(makePlan({ pattern: 'sigh' }).phases.map((p) => p.kind)).toEqual(['in', 'in2', 'out'])
    expect(makePlan({ pattern: 'box' }).phases.map((p) => p.kind)).toEqual(['in', 'hold', 'out', 'hold2'])
  })
  it('Özel: düzenleme sınırlar içinde, 0 sn aşamalar atılır, tutma en fazla HOLD_MAX', () => {
    const p = makePlan({ pattern: 'custom', edits: { in: 5, hold: 12, out: 7, hold2: 0 } })
    expect(p.phases).toEqual([{ kind: 'in', sec: 5 }, { kind: 'hold', sec: HOLD_MAX }, { kind: 'out', sec: 7 }])
    expect(normalizePhases({ in: 1, out: 30 })[0].sec).toBe(2)
    expect(normalizePhases({ in: 1, out: 30 })[2].sec).toBe(12)
  })
  it('bilinmeyen kalıp → varsayılan', () => {
    expect(makePlan({ pattern: 'wimhof' }).pattern).toBe('calm')
    expect(PATTERN_ORDER.every((id) => PATTERNS[id])).toBe(true)
    expect(Object.values(PATTERNS).every((p) => p.phases.every((ph) => PHASE[ph.kind]))).toBe(true)
  })
})

describe('phaseAt', () => {
  const plan = makePlan({ pattern: 'box', durationSec: 64 }) // 16 sn döngü × 4
  it('aşama, döngü, kalan süre', () => {
    expect(phaseAt(plan, 0)).toMatchObject({ done: false, cycle: 0, index: 0, phaseElapsed: 0, left: 64 })
    expect(phaseAt(plan, 5)).toMatchObject({ cycle: 0, index: 1, phaseElapsed: 1 })
    expect(phaseAt(plan, 15.9)).toMatchObject({ cycle: 0, index: 3 })
    expect(phaseAt(plan, 16)).toMatchObject({ cycle: 1, index: 0 })
    expect(phaseAt(plan, 64)).toMatchObject({ done: true, left: 0 })
    expect(phaseAt(plan, 2).phaseFrac).toBe(0.5)
  })
})

describe('kayıt, program, sakinlik', () => {
  const plan = makePlan({ pattern: 'calm', priorSessions: 5 })
  it('makeRecord alanları', () => {
    const r = makeRecord({ plan, seconds: 180, calmBefore: 2, calmAfter: 4, strained: false }, new Date('2026-09-25T10:00:00Z'))
    expect(r).toMatchObject({ type: SESSION_TYPE, pattern: 'calm', seconds: 180, cycles: 18, calmBefore: 2, calmAfter: 4, completed: true })
    expect(makeRecord({ plan, seconds: 30, calmBefore: 9 }).calmBefore).toBeNull()
  })
  it('programProgress: son 28 günde ≥5 dk olan günler', () => {
    const now = new Date('2026-09-25T12:00:00')
    const day = (n, sec) => makeRecord({ plan, seconds: sec }, new Date(now.getTime() - n * 86400000))
    const s = [day(0, 200), day(0, 120), day(1, PROGRAM_DAY_SEC), day(2, 100), day(30, 600), { type: 'blink', date: now.toISOString(), seconds: 900 }]
    expect(programProgress(s, now)).toEqual({ days: 2, target: 28, todaySec: 320, todayDone: true })
    expect(programProgress([], now).days).toBe(0)
  })
  it('calmChange: yalnızca ikisi de olan seanslar', () => {
    const s = [makeRecord({ plan, seconds: 60, calmBefore: 2, calmAfter: 4 }), makeRecord({ plan, seconds: 60, calmBefore: 3, calmAfter: 3 }), makeRecord({ plan, seconds: 60 })]
    expect(calmChange(s)).toEqual({ n: 2, delta: 1 })
    expect(calmChange([])).toBeNull()
  })
  it('tercihler: geçersiz değerler varsayılana döner', () => {
    const st = mem()
    expect(loadBreathOpts(st)).toEqual({ pattern: 'calm', durationSec: 180, edits: {} })
    saveBreathOpts({ pattern: 'box', durationSec: 300, edits: { in: 5 } }, st)
    expect(loadBreathOpts(st)).toEqual({ pattern: 'box', durationSec: 300, edits: { in: 5 } })
    saveBreathOpts({ pattern: 'x', durationSec: 7 }, st)
    expect(loadBreathOpts(st)).toEqual({ pattern: 'calm', durationSec: 180, edits: {} })
  })
})
