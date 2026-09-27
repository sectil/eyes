import { describe, it, expect } from 'vitest'
import { shouldPlayIntro, INTRO_VERSION } from './intro.js'
import { PEGASUS, PEGASUS_LINES, pegasusXY, PUPIL_Y } from './introStill.js'

describe('giriş ekranı', () => {
  it('ilk açılışta bir kez; eski sürümü görene yeni ekran bir kez', () => {
    expect(shouldPlayIntro({})).toBe(true)
    expect(shouldPlayIntro({ intro: { seen: true, version: INTRO_VERSION } })).toBe(false)
    expect(shouldPlayIntro({ intro: { seen: true, version: 2 } })).toBe(true) // eski filmi izleyen
    expect(shouldPlayIntro({ intro: { seen: true } })).toBe(true) // version yok → 1
  })
  it('Pegasus: her çizgi iki geçerli yıldızı bağlar; izdüşüm merkezde ve en uzun kenar 1', () => {
    for (const [a, b] of PEGASUS_LINES) {
      expect(PEGASUS[a]).toBeTruthy()
      expect(PEGASUS[b]).toBeTruthy()
      expect(a).not.toBe(b)
    }
    const xy = pegasusXY()
    const xs = xy.map((p) => p[0])
    const ys = xy.map((p) => p[1])
    expect(Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))).toBeCloseTo(1, 6)
    expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(0, 6)
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(0, 6)
  })
  it('"Başla" göz bebeği merkezinde: CSS top ile aynı oran', () => {
    expect(PUPIL_Y).toBe(0.902)
  })
})
