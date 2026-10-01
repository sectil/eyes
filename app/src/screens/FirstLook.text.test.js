import { describe, it, expect } from 'vitest'
import { LOOK_SEC } from './FirstLook.jsx'
import { firstLookContent } from '../lib/firstLookText.js'
import { tokenize } from '../lib/firstLook.js'

describe('İlk bakış okuma metni', () => {
  const c = firstLookContent('tr')
  const toks = tokenize(c.text, c.locale)

  it('sarı işaret 20 sn dolmadan metnin sonuna varmaz, ekrana da sığar', () => {
    const read = Math.ceil((c.wpm / 60) * LOOK_SEC) // 200 kelime/dk → 67
    expect(toks.length).toBeGreaterThanOrEqual(read + 5)
    expect(toks.length).toBeLessThanOrEqual(100)
  })

  it('başlangıç ekranındaki odak kelimesi ilk cümlede ("güneşli")', () => {
    const end = toks.findIndex((t) => /[.!?]/.test(t.tail))
    expect(c.focus).toBeLessThanOrEqual(end)
    expect(toks[c.focus].word).toBe('güneşli')
  })

  it('bölünen kelimeler birleşince metnin kendisi çıkar', () => {
    expect(toks.map((t) => t.word + t.tail).join('')).toBe(c.text)
  })

  it('bilinmeyen dil Türkçeye düşer; her arayüz yazısı dolu', () => {
    expect(firstLookContent('xx')).toBe(c)
    for (const [k, v] of Object.entries(c.ui)) {
      const out = typeof v === 'function' ? v('7,4', true) : v
      expect(typeof out, k).toBe('string')
      expect(out.length, k).toBeGreaterThan(0)
    }
  })
})
