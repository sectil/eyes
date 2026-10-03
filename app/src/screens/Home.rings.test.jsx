// Ana sayfa · kısayol halkalarının yeri ve kartla ikizlik kuralı (sahibin isteği ve kararları 2026-10-03; tasarım
// docs/yol-haritasi/tasarim/ana-sayfa/halkalar/PLAN.md §3, §7):
//   - ilk 7 günde halkalar ilk görünümde (section.hf), "N. bölüm" yazısının üstünde; 8. günden sonra yolun başında
//   - büyük kartın açtığı modül halkada tekrar etmez: kart Nefes ise Nefes halkası, kart Dalga ise Dalga halkası yok
//     (tek kaynak: bugünün işi ekranda bir kez); göz molasında Göz seti (Tam set) kilitli, iki ayrı Nefes girişi yok
//   - iPhone uygulamasında dört halka, web'de Yoga yok
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const ios = vi.hoisted(() => ({ on: false }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => ios.on }))
const { default: Home } = await import('./Home.jsx')

const NOW = new Date(2026, 9, 3, 12, 0, 0)
const MIN = 60000
const settings = { profile: null, reminders: null, consents: {} }
const render = (props = {}) => renderToStaticMarkup(h(Home, { tests: [], sessions: [], settings, onStart: () => {}, ...props }))
const scene = (html) => html.match(/<section class="hf[^"]*" aria-label="Bugün">[\s\S]*?<\/section>(?=<)/)?.[0] ?? ''
const text = (x) => x.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/⁠/g, '').replace(/ |&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const goBtn = (html) => text(html.match(/<button type="button" class="hg[^"]*"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '')
const rings = (html) => [...html.matchAll(/class="hk-b ([a-z]+)([^"]*)"/g)].map((m) => `${m[1]}${m[2]}`)
const ago = (min) => new Date(NOW.getTime() - min * MIN).toISOString()
const tests = ['R', 'L', 'OU'].map((e, i) => ({ type: 'va-weekly', eye: e, date: ago(30 - i) }))
const track = { type: 'game', game: 'track', date: ago(20) }
const breath = { type: 'breath', seconds: 120, pattern: 'calm', date: ago(15) }
const kirp = { type: 'routine', setId: 'kirpma', seconds: 60, date: ago(10) }
const free = { locked: false, due: null, used: MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN }
const lock = { locked: true, reason: 'budget', due: null, used: 5 * MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN }

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterAll(() => {
  vi.useRealTimers()
  ios.on = false
})

describe('Ana sayfa · kısayol halkaları', () => {
  it("1. gün başlangıç: ilk görünümde, büyük kartın üstünde; iPhone'da dört, web'de üç halka", () => {
    for (const [on, want] of [[true, ['yoga', 'dalga', 'breath', 'full']], [false, ['dalga', 'breath', 'full']]]) {
      ios.on = on
      const html = render({ eyeBudget: free })
      const s = scene(html)
      expect(rings(s)).toEqual(want)
      expect(s.indexOf('<nav class="hk"')).toBeLessThan(s.indexOf('class="hf-hero"'))
      expect(html).not.toContain('hk at-path')
    }
  })
  it('kart Nefes (yolun Nefes durağı): Nefes halkası yok', () => {
    for (const on of [true, false]) {
      ios.on = on
      const s = scene(render({ tests, sessions: [track], eyeBudget: free }))
      expect(goBtn(s)).toMatch(/^Yola devam et Nefes · 1 dk/)
      expect(rings(s)).toEqual([...(on ? ['yoga'] : []), 'dalga', 'full'])
    }
  })
  it('kart başka bir durak: bugün yapılan Nefes halkası tikli', () => {
    ios.on = false
    const s = scene(render({ tests, sessions: [track, breath], eyeBudget: free }))
    expect(goBtn(s)).toMatch(/^Yola devam et Göz kırpma/)
    expect(rings(s)).toEqual(['dalga', 'breath done', 'full'])
    expect(s).toContain('aria-label="Nefes, bugün yapıldı"')
  })
  it('yol bitti, kart Dalga: Dalga halkası yok', () => {
    ios.on = false
    const s = scene(render({ tests, sessions: [track, breath, kirp], eyeBudget: free }))
    expect(goBtn(s)).toMatch(/^Dalga /)
    expect(rings(s)).toEqual(['breath done', 'full'])
  })
  it('göz molası, kart "Nefes · 5 dk": Nefes halkası yok, Göz seti kilitli', () => {
    for (const on of [true, false]) {
      ios.on = on
      const s = scene(render({ eyeBudget: lock }))
      expect(goBtn(s)).toMatch(/^Göz molası Nefes · 5 dk/)
      expect(rings(s)).toEqual([...(on ? ['yoga'] : []), 'dalga', 'full locked'])
      expect(s).toContain('aria-label="Göz seti, mola bitene kadar kilitli"')
    }
  })
  it('8. günden sonra (7 geçmiş gün): ilk görünümde yok, yolun başında', () => {
    ios.on = true
    const days = Array.from({ length: 7 }, (_, i) => ({ type: 'breath', seconds: 120, pattern: 'calm', date: new Date(2026, 9, 2 - i, 9).toISOString() }))
    const html = render({ sessions: days, eyeBudget: free })
    expect(scene(html)).not.toContain('class="hk')
    const box = html.split('<div class="lp-box">')[1] ?? ''
    expect(box.startsWith('<nav class="hk at-path"')).toBe(true)
  })
})
