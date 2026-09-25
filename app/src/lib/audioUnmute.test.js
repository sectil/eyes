import { describe, it, expect } from 'vitest'
import { silentWav } from './audioUnmute.js'

describe('sessiz WAV', () => {
  it('geçerli başlık, tamamen sessiz', () => {
    const b = silentWav(0.5, 8000)
    const s = (o, n) => String.fromCharCode(...b.slice(o, o + n))
    expect(s(0, 4)).toBe('RIFF')
    expect(s(8, 4)).toBe('WAVE')
    expect(s(36, 4)).toBe('data')
    const dv = new DataView(b.buffer)
    expect(dv.getUint32(24, true)).toBe(8000)
    expect(dv.getUint32(40, true)).toBe(4000)
    expect(b.length).toBe(44 + 4000)
    expect(b.slice(44).every((v) => v === 128)).toBe(true)
  })
})
