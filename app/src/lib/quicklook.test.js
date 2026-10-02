import { describe, it, expect } from 'vitest'
import { createStaircase, isEasyTrial, easyFrames, distractorSlots, thresholdOf, makeTrial, rng, timingQuality, framesToMs, peripheralOffset, eccentricityDeg, makeRecord, programHours, nextLevel, firstAndBest, PARAMS, SESSION_TYPE } from './quicklook.js'

describe('quicklook motoru', () => {
  it('2-aşağı 1-yukarı: iki dönüşe kadar 4 kare, sonra 1 kare; sınırlar', () => {
    const s = createStaircase({ start: 30, min: 6, max: 30 })
    expect(s.frames).toBe(30)
    s.push(true); expect(s.frames).toBe(30)
    s.push(true); expect(s.frames).toBe(26)
    s.push(true); s.push(true); expect(s.frames).toBe(22)
    s.push(false); expect(s.frames).toBe(26) // dönüş 1
    s.push(true); s.push(true); expect(s.frames).toBe(22) // dönüş 2 → artık 1 kare
    s.push(true); s.push(true); expect(s.frames).toBe(21)
    expect(s.reversals).toHaveLength(2)
    const lo = createStaircase({ start: 6, min: 6 })
    lo.push(true); lo.push(true); expect(lo.frames).toBe(6)
    const hi = createStaircase({ start: 30, max: 30 })
    hi.push(false); expect(hi.frames).toBe(30)
  })
  it('kolay deneme her 8.de; çeldirici yuvaları', () => {
    expect([0, 6, 7, 8, 15].map(isEasyTrial)).toEqual([false, false, true, false, true])
    expect(easyFrames(8)).toBe(24)
    expect(easyFrames(20)).toBe(30)
    expect(distractorSlots({ pos: 2, distractors: 0 })).toEqual([])
    const s7 = distractorSlots({ pos: 2, distractors: 7 })
    expect(s7).toHaveLength(7)
    expect(s7.some((d) => d.pos === 2)).toBe(false)
    const s23 = distractorSlots({ pos: 2, distractors: 23 })
    expect(s23).toHaveLength(23)
    expect(s23.some((d) => d.pos === 2 && d.ring === 3)).toBe(false)
  })
  it('eşik: dönüş ortalaması; dönüş yoksa son denemeler', () => {
    expect(thresholdOf([], [{ ms: 100 }, { ms: 60 }, { ms: 80 }])).toBe(80)
    expect(thresholdOf([{ ms: 50 }, { ms: 70 }], [])).toBe(60)
    expect(thresholdOf([], [])).toBeNull()
  })
  it('simüle gözlemci: gerçek eşiğe yakınsar', () => {
    const r = rng(3)
    const s = createStaircase()
    const trueMs = 90
    for (let i = 0; i < 80; i++) {
      const ms = framesToMs(s.frames)
      const p = ms >= trueMs ? 0.95 : 0.2
      s.push(r() < p, ms)
    }
    const th = thresholdOf(s.history, s.reversals)
    expect(th).toBeGreaterThan(50)
    expect(th).toBeLessThan(140)
  })
  it('deneme üretimi ve konum', () => {
    const r = rng(1)
    const t = makeTrial(r, { level: 2 })
    expect(t.distractors).toBe(7)
    expect(['car', 'truck']).toContain(t.center)
    expect(t.pos).toBeGreaterThanOrEqual(0)
    expect(t.pos).toBeLessThan(8)
    const o = peripheralOffset(0, 100)
    expect(o.x).toBeCloseTo(100)
    expect(peripheralOffset(2, 100).y).toBeCloseTo(-100) // üst
    expect(eccentricityDeg(140, 3.5, 400)).toBeCloseTo(5.71, 1)
    expect(eccentricityDeg(0, 3, 400)).toBeNull()
  })
  it('zamanlama kalitesi: düşen kareler', () => {
    expect(timingQuality([{ frames: 2, ms: framesToMs(2) }, { frames: 2, ms: framesToMs(3) }]).dropped).toBe(1)
  })
  it('kayıt, program saati, seviye, ilk/en iyi', () => {
    const rec = makeRecord({ history: [{ frames: 6, ms: 100, correct: true }, { frames: 6, ms: 100, correct: false }], reversals: [{ ms: 100 }, { ms: 120 }], seconds: 300 })
    expect(rec).toMatchObject({ type: SESSION_TYPE, threshold: 110, accuracy: 50, trials: 2, level: 1 })
    expect(programHours([{ type: SESSION_TYPE, seconds: 1800 }, { type: 'x', seconds: 999 }])).toBe(0.5)
    const fast = { type: SESSION_TYPE, threshold: 110, level: 1, seconds: 300 }
    expect(nextLevel([fast])).toBe(1)
    expect(nextLevel([fast, fast])).toBe(2)
    expect(nextLevel([fast, fast, { ...fast, level: 2 }, { ...fast, level: 2 }])).toBe(3)
    expect(nextLevel([{ ...fast, threshold: 200 }, { ...fast, threshold: 200 }])).toBe(1)
    expect(firstAndBest([{ ...fast, threshold: 240 }, { ...fast, threshold: 180 }])).toEqual({ first: 240, last: 180, best: 180, n: 2 })
    expect(PARAMS.itiMs + PARAMS.fixationMs).toBeGreaterThanOrEqual(1000) // < 3 Hz
  })
})
