// Mola (E8): VoiceOver saniye sayısını her saniye okumaz (aria-live="off"), ama bakış yönlendirmesi ve bitiş kibar
// canlı bölgede okunur (aria-live="polite").
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import RestBreak from './RestBreak.jsx'

const live = (html) => /<span class="acu-sr" aria-live="polite">([^<]*)<\/span>/.exec(html)?.[1]

describe('RestBreak · erişilebilirlik', () => {
  it('TrueDepth takibinde yönlendirme kibar canlı bölgede; düz sayaçta saniye okunmaz', () => {
    expect(live(renderToStaticMarkup(h(RestBreak, { trueDepth: true, next: null })))).toBe('Yüzün aranıyor')
    const timer = renderToStaticMarkup(h(RestBreak, { trueDepth: false }))
    expect(live(timer)).toBe('')
    expect(timer).toContain('aria-live="off">20 saniye')
  })
})
