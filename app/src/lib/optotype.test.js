import { describe, it, expect } from 'vitest'
import {
  letterHeightMm,
  logMARForHeight,
  renderSpec,
  smallestDrawableLogMAR,
  decimalAcuity,
  snellen20,
  snellen6,
} from './optotype.js'

describe('letterHeightMm', () => {
  it('logMAR 0 @ 40 cm ≈ 0.582 mm (5 yay dakikası)', () => {
    expect(letterHeightMm(0, 400)).toBeCloseTo(0.5818, 3)
  })
  it('logMAR 1.0 @ 40 cm ≈ 5.82 mm', () => {
    expect(letterHeightMm(1, 400)).toBeCloseTo(5.818, 2)
  })
  it('logMAR 0 @ 6 m ≈ 8.73 mm (klinik uzak chart)', () => {
    expect(letterHeightMm(0, 6000)).toBeCloseTo(8.727, 2)
  })
})

describe('logMARForHeight', () => {
  it('letterHeightMm ile tersinir', () => {
    for (const l of [-0.3, 0, 0.3, 0.7, 1.3]) {
      expect(logMARForHeight(letterHeightMm(l, 400), 400)).toBeCloseTo(l, 9)
    }
  })
  it('aynı harf daha uzaktan bakılınca daha küçük logMAR', () => {
    const h = letterHeightMm(0.5, 400)
    expect(logMARForHeight(h, 500)).toBeLessThan(0.5)
    expect(logMARForHeight(h, 500)).toBeCloseTo(0.5 - Math.log10(500 / 400), 3)
  })
})

describe('renderSpec', () => {
  const pxPerMm = 6.3 // tipik telefon ~160 CSS px/inç
  it('birim cihaz pikseline yuvarlanır', () => {
    const s = renderSpec(0.5, 400, pxPerMm, 3)
    expect(s.drawable).toBe(true)
    expect(Number.isInteger(s.unitCssPx * 3)).toBe(true)
    expect(s.heightCssPx).toBeCloseTo(s.unitCssPx * 5, 9)
  })
  it('gerçekleşen logMAR hedefe yakın (yuvarlama hatası < 0.05)', () => {
    const s = renderSpec(0.3, 400, pxPerMm, 3)
    expect(Math.abs(s.realizedLogMAR - 0.3)).toBeLessThan(0.05)
  })
  it('1 cihaz pikselinden küçük birim çizilemez', () => {
    const s = renderSpec(-0.3, 400, pxPerMm, 1)
    expect(s.drawable).toBe(false)
  })
})

describe('smallestDrawableLogMAR', () => {
  it('yüksek dpr ekran daha küçük harf gösterebilir', () => {
    expect(smallestDrawableLogMAR(400, 6.3, 3)).toBeLessThan(
      smallestDrawableLogMAR(400, 6.3, 1),
    )
  })
})

describe('gösterim karşılıkları', () => {
  it('logMAR 0 = 1.0 ondalık = 20/20 = 6/6', () => {
    expect(decimalAcuity(0)).toBeCloseTo(1, 9)
    expect(snellen20(0)).toBe('20/20')
    expect(snellen6(0)).toBe('6/6.0')
  })
  it('logMAR 0.3 ≈ 20/40', () => {
    expect(snellen20(0.3)).toBe('20/40')
  })
  it('logMAR 1.0 = 20/200 = 6/60', () => {
    expect(snellen20(1)).toBe('20/200')
    expect(snellen6(1)).toBe('6/60')
  })
})
