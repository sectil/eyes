import { describe, it, expect } from 'vitest'
import { readingBlinkCounter, trueDepthCounter } from './blinkCounters.js'

// Sentetik 30 Hz TrueDepth kapanma izi: taban + küçük titreşim; kırpmalar [saniye, [kare değerleri]]
function trace(base, blinks = [], { fps = 30, sec = 20, noise = 0.02 } = {}) {
  const dt = 1000 / fps
  const out = Array.from({ length: sec * fps }, (_, i) => [base + Math.sin(i * 1.7) * noise, i * dt])
  for (const [at, shape] of blinks) shape.forEach((v, j) => { out[Math.round(at * fps) + j][0] = v })
  return out
}
const run = (c, t) => t.reduce((n, [v, ts]) => n + (c.push(v, ts) ? 1 : 0), 0)
// Okurken (aşağı bakış, taban 0,38): 2 hızlı (2–3 kare), 2 orta, 1 yarım kırpma
const READING = [[2, [0.55, 0.82, 0.7, 0.45]], [5, [0.6, 0.8, 0.5]], [9, [0.5, 0.75, 0.85, 0.8, 0.5]], [13, [0.55, 0.9, 0.9, 0.85, 0.6, 0.45]], [17, [0.5, 0.66, 0.5]]]

describe('okurken kırpma sayacı (İlk Bakış)', () => {
  it('okurken aşağı bakışta hızlı ve yarım kırpmaların hepsini sayar (eski sayaç 5\'ten 2\'sini sayıyordu)', () => {
    const t = trace(0.38, READING)
    expect(run(readingBlinkCounter(0.38), t)).toBe(5)
    expect(run(trueDepthCounter(0.38), t)).toBeLessThan(5) // hatanın kaydı
  })
  it('düz bakışta (taban 0,08) tam kırpmaları sayar', () => {
    const t = trace(0.08, [[3, [0.4, 0.9, 0.95, 0.5, 0.1]], [8, [0.7, 0.95, 0.3]], [14, [0.5, 0.92, 0.9, 0.4]]])
    expect(run(readingBlinkCounter(0.08), t)).toBe(3)
  })
  it('titreşim ve yavaş kapak inişi (satır sonunda daha aşağı bakış) kırpma sayılmaz', () => {
    const t = trace(0.3, [], { noise: 0.05 })
    for (let i = 0; i < 90; i++) t[150 + i][0] = 0.3 + (0.25 * i) / 90 // 3 sn'de 0,30 → 0,55
    for (let i = 240; i < t.length; i++) t[i][0] = 0.55 + Math.sin(i) * 0.03
    expect(run(readingBlinkCounter(0.3), t)).toBe(0)
  })
  it('kırpma içinde titreyen değer tek sayılır', () => {
    const t = trace(0.1, [[4, [0.8, 0.35, 0.8, 0.85, 0.2]]])
    expect(run(readingBlinkCounter(0.1), t)).toBe(1)
  })
  it('uzun kapatma (2 sn) kırpma değil; sonrasında sayım sürer', () => {
    const t = trace(0.1, [[10, [0.5, 0.9, 0.3]]])
    for (let i = 60; i < 120; i++) t[i][0] = 0.95
    expect(run(readingBlinkCounter(0.1), t)).toBe(1)
  })
  it('60 Hz karede de aynı sonuç', () => {
    const t = trace(0.38, READING.map(([a, s]) => [a, s.flatMap((v) => [v, v])]), { fps: 60 })
    expect(run(readingBlinkCounter(0.38), t)).toBe(5)
  })
  it('tanı: kare hızı, taban, doruklar', () => {
    const c = readingBlinkCounter(0.38)
    run(c, trace(0.38, READING))
    const s = c.stats()
    expect(s.fps).toBe(30)
    expect(s.peaks).toHaveLength(5)
    expect(s.base).toBeGreaterThan(0.3)
  })
})
