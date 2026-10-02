import { describe, it, expect } from 'vitest'
import { toBase64 } from './wav.js'

describe('toBase64', () => {
  it('büyük diziyi parça parça kodlar (70 000 bayt, geri çözülünce aynı)', () => {
    const bytes = new Uint8Array(70000).map((_, i) => i % 256)
    const back = Uint8Array.from(atob(toBase64(bytes)), (ch) => ch.charCodeAt(0))
    expect(back.length).toBe(70000)
    expect(back[69999]).toBe(69999 % 256)
  })
})
