import { describe, it, expect } from 'vitest'
import { eyeOpenness, createClosureCounter, BLINK_CYCLE } from './blink.js'

describe('eyeOpenness', () => {
  it('yükseklik / genişlik', () => {
    const lm = [{ x: 0.1, y: 0.5 }, { x: 0.2, y: 0.47 }, { x: 0.3, y: 0.5 }, { x: 0.2, y: 0.53 }]
    expect(eyeOpenness(lm, [0, 1, 2, 3])).toBeCloseTo(0.3, 6)
  })
  it('eksik nokta → null', () => {
    expect(eyeOpenness([], [0, 1])).toBeNull()
  })
})

describe('createClosureCounter', () => {
  it('kısa gürültüyü (tek kare) saymaz, gerçek kapanmayı sayar', () => {
    const c = createClosureCounter(0.3)
    const frames = [0.3, 0.29, 0.1, 0.3, 0.31, 0.1, 0.08, 0.05, 0.3, 0.3]
    const events = frames.map((f) => c.update(f))
    expect(c.count()).toBe(1)
    expect(events.filter(Boolean)).toHaveLength(1)
  })
  it('uzun kapanma tek sayılır, iki ayrı kapanma iki', () => {
    const c = createClosureCounter(0.3)
    ;[0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.3, 0.1, 0.1, 0.3].forEach((f) => c.update(f))
    expect(c.count()).toBe(2)
  })
  it('null kareleri yoksayar', () => {
    const c = createClosureCounter(0.3)
    ;[0.1, null, 0.1, 0.3].forEach((f) => c.update(f))
    expect(c.count()).toBe(1)
  })
})

describe('BLINK_CYCLE', () => {
  it('bir döngü ~10 saniye (Kim 2020)', () => {
    const total = BLINK_CYCLE.reduce((a, s) => a + s.ms, 0)
    expect(total).toBe(10000)
  })
})
