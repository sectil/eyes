import { describe, it, expect } from 'vitest'
import { TEXT, LOOK_SEC } from './FirstLook.jsx'

describe('İlk bakış okuma metni', () => {
  it('20 sn boyunca okunacak kadar uzun (dakikada 250 kelimeyle süre dolmadan bitmez)', () => {
    const words = TEXT.trim().split(/\s+/).length
    expect(words).toBeGreaterThanOrEqual(Math.ceil((250 / 60) * LOOK_SEC)) // 84
    expect(words).toBeLessThanOrEqual(100) // ekrana sığsın
  })
})
