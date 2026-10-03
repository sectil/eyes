// Okurken göz (deneme): giriş ekranı; Face ID kamerası yoksa başlamaz (sahip 2026-10-03, yalnız test derlemesi)
import { describe, it, expect, vi } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('../hooks/useFaceTracking.js', () => ({ useFaceTracking: () => ({ ready: false, error: null, face: false }) }))
const { default: OkuGozDeneme } = await import('./OkuGozDeneme.jsx')
const storage = { getItem: () => 'abc', setItem: () => {} }

describe('Okurken göz (deneme) · giriş', () => {
  it('üç hız, 200 seçili; Başla açık', () => {
    const html = renderToStaticMarkup(h(OkuGozDeneme, { storage, trueDepth: true }))
    expect(html).toContain('Okurken göz')
    expect((html.match(/role="radio"/g) ?? []).length).toBe(3)
    expect(html).toMatch(/aria-checked="true" class="og-chip on"[^>]*>200</)
    expect(html).toMatch(/<button type="button" class="btn">Başla<\/button>/)
    expect(html).not.toContain('Face ID kameralı')
  })
  it('Face ID kamerası yoksa uyarı ve Başla kapalı', () => {
    const html = renderToStaticMarkup(h(OkuGozDeneme, { storage, trueDepth: false }))
    expect(html).toContain('Bu deneme Face ID kameralı iPhone&#x27;da çalışır.')
    expect(html).toMatch(/<button type="button" class="btn" disabled="">Başla<\/button>/)
  })
})
