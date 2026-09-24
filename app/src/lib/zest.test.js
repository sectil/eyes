import { describe, it, expect } from 'vitest'
import { createZest, pCorrect, randomDirection, DIRECTIONS, GUESS } from './zest.js'
import { shouldStop } from './zest.js'

// Tekrarlanabilir rastgele sayı üreteci (mulberry32)
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function simulate(trueTheta, trials, seed) {
  const r = rng(seed)
  const z = createZest()
  for (let i = 0; i < trials; i++) {
    const x = z.next()
    z.update(x, r() < pCorrect(x, trueTheta))
  }
  return z.estimate()
}

describe('pCorrect', () => {
  it('çok küçük harfte tahmin düzeyine (%25) iner', () => {
    expect(pCorrect(-1, 0.5)).toBeCloseTo(GUESS, 2)
  })
  it('çok büyük harfte ~%98', () => {
    expect(pCorrect(2, 0.5)).toBeCloseTo(0.98, 2)
  })
  it('eşikte ~%61.5', () => {
    expect(pCorrect(0.5, 0.5)).toBeCloseTo(0.615, 3)
  })
})

describe('createZest', () => {
  it('her doğru cevapta harf küçülür', () => {
    const z = createZest()
    const x0 = z.next()
    z.update(x0, true)
    expect(z.next()).toBeLessThan(x0)
  })

  it('her yanlış cevapta harf büyür', () => {
    const z = createZest()
    const x0 = z.next()
    z.update(x0, false)
    expect(z.next()).toBeGreaterThan(x0)
  })

  it('sınırların dışına çıkmaz', () => {
    const z = createZest({ minX: 0, maxX: 1 })
    for (let i = 0; i < 15; i++) z.update(z.next(), true)
    expect(z.next()).toBeGreaterThanOrEqual(0)
  })

  it('hep yanlış cevapta tahmin üst sınıra kısılır ve işaretlenir', () => {
    const z = createZest({ maxX: 1.3 })
    for (let i = 0; i < 20; i++) z.update(z.next(), false)
    const e = z.estimate()
    expect(e.logMAR).toBe(1.3)
    expect(e.atCeiling).toBe(true)
  })

  it('belirsizlik (sd) deneme arttıkça azalır', () => {
    const z = createZest()
    const sd0 = z.estimate().sd
    const r = rng(7)
    for (let i = 0; i < 20; i++) {
      const x = z.next()
      z.update(x, r() < pCorrect(x, 0.3))
    }
    expect(z.estimate().sd).toBeLessThan(sd0 / 2)
  })

  // Simülasyon: 200 sanal gözlemci; ortalama hata ve yayılım
  for (const [trials, maxBias, maxSpread] of [
    [20, 0.05, 0.25],
    [36, 0.04, 0.2],
  ]) {
    it(`${trials} denemede eşik doğru bulunur (sapma < ${maxBias}, %95 aralık < ±${maxSpread})`, () => {
      const errs = []
      for (let s = 0; s < 200; s++) {
        const theta = -0.1 + (s % 9) * 0.1 // -0.1 … 0.7
        errs.push(simulate(theta, trials, 1000 + s).logMAR - theta)
      }
      const bias = errs.reduce((a, b) => a + b, 0) / errs.length
      const sd = Math.sqrt(errs.reduce((a, b) => a + (b - bias) ** 2, 0) / errs.length)
      expect(Math.abs(bias)).toBeLessThan(maxBias)
      expect(1.96 * sd).toBeLessThan(maxSpread)
    })
  }
})

describe('randomDirection', () => {
  it('dört yönü de üretir', () => {
    const r = rng(1)
    const seen = new Set()
    for (let i = 0; i < 100; i++) seen.add(randomDirection(r))
    expect([...seen].sort()).toEqual([...DIRECTIONS].sort())
  })
})

describe('shouldStop', () => {
  const plan = { trials: 20, minTrials: 10, stopSd: 0.1 }
  it('minTrials altında durmaz', () => {
    expect(shouldStop({ trials: 9, sd: 0.05 }, plan)).toBe(false)
  })
  it('belirsizlik küçülünce durur', () => {
    expect(shouldStop({ trials: 10, sd: 0.1 }, plan)).toBe(true)
    expect(shouldStop({ trials: 12, sd: 0.2 }, plan)).toBe(false)
  })
  it('en geç trials\'ta durur', () => {
    expect(shouldStop({ trials: 20, sd: 0.5 }, plan)).toBe(true)
  })
  it('tutarlı cevaplarla ZEST 20 denemeden önce yakınsar', () => {
    const z = createZest()
    let n = 0
    while (!shouldStop({ trials: n, sd: z.estimate().sd }, plan)) {
      const x = z.next()
      z.update(x, x >= 0.3) // eşik 0,3: üstü hep doğru, altı hep yanlış
      n += 1
    }
    expect(n).toBeLessThan(20)
    expect(z.estimate().logMAR).toBeCloseTo(0.3, 0)
  })
})
