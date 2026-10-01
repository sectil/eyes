// Ana sayfa · bugün kartı (Y1 ilk görünüm, 5 saniye turu 2): büyük "0 / N" ve günün diyaframı yok; süre, durak sayısı,
// günün zinciri ve büyük düğme. Nef satırı düğmenin tekrarıysa çizilmez; yol sıradaki durakta baloncuk ve "Başla"
// çizmez (büyük düğme söylüyor). Sayı hapları: seri 3 gün ve üstündeyse, değilse "N gün seninle"; aynı sayı iki kez yok.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { default: Home } = await import('./Home.jsx')
const { default: TodayPath } = await import('../components/TodayPath.jsx')
const { buildPath } = await import('../lib/today.js')
const { registry } = await import('../modules/registry.js')
const settings = { profile: null, reminders: null, consents: {} }
const MIN = 60000
const render = (props = {}) => renderToStaticMarkup(h(Home, { tests: [], sessions: [], settings, onStart: () => {}, ...props }))
const at = (d, hour = 9) => { const t = new Date(); t.setDate(t.getDate() - d); t.setHours(hour, 0, 0, 0); return t.toISOString() }
const card = (html) => html.match(/<section class="hh-today"[\s\S]*?<\/section>/)?.[0] ?? ''

describe('Ana sayfa · bugün kartı', () => {
  it('yeni kullanıcı 1. gün: süre ve durak sayısı, zincir, büyük düğme; sıfır, diyafram ve tekrar eden Nef satırı yok', () => {
    const html = render()
    const c = card(html)
    expect(c).toMatch(/<b class="hh-min">≈\d+<small> dk<\/small><\/b>/)
    expect(c).toMatch(/<span class="hh-cnt">\d+ durak<\/span>/)
    expect(c.match(/<div class="hh-sum">.*?<\/div>/)[0]).not.toMatch(/\d\/\d/) // gün başında "0/4" yok
    expect(html).not.toContain('class="hh-big"')
    expect(html).not.toContain('class="dd"')
    const n = Number(c.match(/(\d+) durak/)[1])
    expect((c.match(/class="dc-s /g) ?? []).length).toBe(n)
    expect(c).toContain('Güne başla')
    expect(c).not.toContain('class="hh-nef"') // "Güne X ile başla." düğmenin tekrarı
  })
  it('yol sıradaki durakta Nef baloncuğu ve "Başla" çizmez; durak kendi etiketiyle', () => {
    const html = render()
    expect(html).toContain('<section class="tp tp-y1" aria-label="Bugünün yolu">')
    expect(html).not.toContain('class="tp-jb"')
    expect(html).not.toContain('class="tp-go')
    expect(html).toMatch(/aria-label="Haftalık E testi, ölçüm[^"]*, sırada"/)
  })
  it('göz molası önerisinde Nef satırı görünür, yolun baloncuğu da', () => {
    const eyeBudget = { locked: false, due: 'budget', used: 5 * MIN, budgetMs: 5 * MIN, leftMs: 0 }
    const html = render({ eyeBudget })
    expect(card(html)).toContain('class="hh-nef"')
    expect(card(html)).toContain('Gözlerin mola istiyor.')
    expect(html).toContain('class="tp-jb"')
  })
  it('hap satırı: seri 3 günden kısaysa yok, yerine "N gün seninle"; seri 3+ ve aynı sayıysa yalnız seri', () => {
    const days = (n) => Array.from({ length: n }, (_, i) => ({ type: 'breath', seconds: 120, pattern: 'calm', date: at(i + 1) }))
    const two = render({ sessions: days(2) })
    expect(two).not.toContain('gün seri')
    expect(two).toContain('<b>2</b>gün seninle')
    const three = render({ sessions: days(3) })
    expect(three).toMatch(/class="hh-fact lens"[^>]*>.*?<b>3<\/b>gün seri/)
    expect(three).not.toContain('gün seninle')
    expect(render()).not.toContain('hh-chips') // hiç sayı yoksa satır yok
  })
  it('TodayPath lead: ilerlemeyle kurulmayan yolda (staged yok) çizim aynı', () => {
    const plan = buildPath(registry.live, { tests: [], sessions: [], now: new Date() })
    const draw = (p) => renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {}, ...p }))
    expect(draw({ lead: true })).toBe(draw({}))
    expect(draw({ lead: true })).toContain('class="tp-jb"')
  })
})
