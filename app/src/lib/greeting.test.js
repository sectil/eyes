import { describe, it, expect } from 'vitest'
import { greeting } from './greeting.js'

describe('saate göre selam', () => {
  it('gece · sabah · gün · akşam · gece', () => {
    const at = (h, m = 0) => new Date(2026, 8, 28, h, m)
    expect(greeting(at(2))).toBe('İyi geceler')
    expect(greeting(at(7))).toBe('Günaydın')
    expect(greeting(at(11, 59))).toBe('Günaydın')
    expect(greeting(at(14))).toBe('İyi günler')
    expect(greeting(at(19, 57))).toBe('İyi akşamlar')
    expect(greeting(at(23))).toBe('İyi geceler')
  })
})
