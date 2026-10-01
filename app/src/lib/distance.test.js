import { describe, it, expect } from 'vitest'
import {
  indicesFromConnections,
  irisDiameterPx,
  distanceMm,
  createMedian,
  distanceStatus,
} from './distance.js'

describe('indicesFromConnections', () => {
  it('benzersiz indeksleri döndürür', () => {
    const c = [
      { start: 474, end: 475 },
      { start: 475, end: 476 },
      { start: 476, end: 477 },
      { start: 477, end: 474 },
    ]
    expect(indicesFromConnections(c).sort()).toEqual([474, 475, 476, 477])
  })
})

describe('irisDiameterPx', () => {
  it('normalize noktalardan yatay çapı hesaplar', () => {
    const lm = []
    lm[1] = { x: 0.4, y: 0.5 }
    lm[2] = { x: 0.45, y: 0.48 }
    lm[3] = { x: 0.425, y: 0.52 }
    expect(irisDiameterPx(lm, [1, 2, 3], 640, 480)).toBeCloseTo(32, 6)
  })
  it('eksik nokta varsa null', () => {
    expect(irisDiameterPx([], [1, 2], 640, 480)).toBeNull()
  })
})

describe('distanceMm', () => {
  it('kalibrasyondaki çapta 400 mm', () => {
    expect(distanceMm(30, 30)).toBe(400)
  })
  it('çap yarıya inince mesafe iki katı', () => {
    expect(distanceMm(15, 30)).toBe(800)
  })
  it('eksik veride null', () => {
    expect(distanceMm(null, 30)).toBeNull()
    expect(distanceMm(30, null)).toBeNull()
  })
})

describe('createMedian', () => {
  it('aykırı tek değeri bastırır', () => {
    const m = createMedian(5)
    ;[400, 402, 399, 900, 401].forEach((v) => m.push(v))
    expect(m.value()).toBe(401)
  })
  it('geçersiz değerleri yoksayar', () => {
    const m = createMedian(3)
    m.push(400)
    m.push(null)
    m.push(NaN)
    expect(m.value()).toBe(400)
  })
})

describe('distanceStatus', () => {
  it('±%10 içinde ok', () => {
    expect(distanceStatus(400)).toBe('ok')
    expect(distanceStatus(365)).toBe('ok')
    expect(distanceStatus(435)).toBe('ok')
  })
  it('yakın / uzak', () => {
    expect(distanceStatus(340)).toBe('too-close')
    expect(distanceStatus(460)).toBe('too-far')
    expect(distanceStatus(null)).toBe('unknown')
  })
})
