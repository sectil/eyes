import { describe, it, expect } from 'vitest'
import { spikeClip, toBase64 } from './AlarmSpikePanel.jsx'

describe('alarm denemesi: Dalga parçası', () => {
  it('tek kanala indirir, süreyi keser, sonu kısılır, tepe 0,9', () => {
    const rate = 100
    const a = new Float32Array(5000).fill(0.5)
    const b = new Float32Array(5000).fill(-0.1)
    const c = spikeClip([a, b], rate, 25)
    expect(c.length).toBe(2500)
    expect(c[0]).toBeCloseTo(0.9)
    expect(c[c.length - 1]).toBeLessThan(0.01)
  })
  it('base64 büyük diziyi parça parça kodlar', () => {
    const bytes = new Uint8Array(70000).map((_, i) => i % 256)
    const back = Uint8Array.from(atob(toBase64(bytes)), (ch) => ch.charCodeAt(0))
    expect(back.length).toBe(70000)
    expect(back[69999]).toBe(69999 % 256)
  })
})
