import { describe, it, expect } from 'vitest'
import {
  makePlan, phaseAt, phaseStartSec, makeRecord, programProgress, calmChange, normalizeSecs, loadBreathOpts, saveBreathOpts, normalizeOpts,
  PATTERNS, PATTERN_ORDER, RAMP_SESSIONS, HOLD_MAX, PROGRAM_DAY_SEC, SESSION_TYPE, PHASE, DEFAULT_SOUNDS,
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
  it('düzenleme her kalıpta: sınırlar içinde, 0 sn aşamalar atılır, tutma en fazla HOLD_MAX, yarım sn adım', () => {
    const p = makePlan({ pattern: 'custom', edits: { in: 5, hold: 12, out: 7, hold2: 0 } })
    expect(p.phases).toEqual([{ kind: 'in', sec: 5 }, { kind: 'hold', sec: HOLD_MAX }, { kind: 'out', sec: 7 }])
    expect(normalizeSecs({ in: 1, out: 30 })).toMatchObject({ in: 2, out: 12, in2: 0 })
    expect(normalizeSecs({ in: 4.3 }).in).toBe(4.5)
    // Sakin ritim düzenlenince kademe uygulanmaz
    const edited = makePlan({ pattern: 'calm', priorSessions: 0, edits: { in: 5, out: 5 } })
    expect(edited.ramped).toBe(false)
    expect(edited.phases).toEqual([{ kind: 'in', sec: 5 }, { kind: 'out', sec: 5 }])
  })
  it('phaseStartSec ve adım sayacı', () => {
    const p = makePlan({ pattern: 'box', durationSec: 64 })
    expect(phaseStartSec(p, 1, 2)).toBe(16 + 8)
    expect(phaseAt(p, 0).steps).toBe(16)
    expect(phaseAt(p, 24).step).toBe(7)
  })
  it('bilinmeyen kalıp → varsayılan', () => {
    expect(makePlan({ pattern: 'wimhof' }).pattern).toBe('calm')
    expect(PATTERN_ORDER.every((id) => PATTERNS[id])).toBe(true)
    expect(Object.values(PATTERNS).every((p) => Object.keys(p.secs).every((k) => PHASE[k]))).toBe(true)
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
  it('tercihler: geçersiz değerler varsayılana döner; sesler/görsel/ses seviyesi doğrulanır', () => {
    const st = mem()
    expect(loadBreathOpts(st)).toMatchObject({ pattern: 'calm', durationSec: 180, edits: null, visual: 'orb', vibrate: true, sound: true, voice: true, volume: 7, sounds: DEFAULT_SOUNDS })
    saveBreathOpts({ pattern: 'box', durationSec: 300, edits: { in: 5 }, visual: 'scene', volume: 3, sounds: { in: 'tick', out: 'kaboom' }, voice: false }, st)
    const o = loadBreathOpts(st)
    expect(o).toMatchObject({ pattern: 'box', durationSec: 300, visual: 'scene', volume: 3, voice: false })
    expect(o.edits).toEqual({ in: 5, in2: 0, hold: 4, out: 4, hold2: 4 })
    expect(o.sounds.in).toBe('tick')
    expect(o.sounds.out).toBe(DEFAULT_SOUNDS.out) // geçersiz ses → varsayılan
    expect(normalizeOpts({ pattern: 'x', durationSec: 7, visual: 'gif', volume: 99 })).toMatchObject({ pattern: 'calm', durationSec: 180, visual: 'orb', volume: 10 })
  })
})
