// Ana sayfa · kısayol halkaları (sahibin isteği 2026-10-03; tasarım docs/yol-haritasi/tasarim/ana-sayfa/halkalar/PLAN.md):
// dört halka sırayla (web'de Yoga yok), dokununca modülün rotası, "bugün yapıldı" yalnız bugünkü kayıttan ve modülün kendi
// kuralıyla, mola kilidi yalnız göz bütçesine sayılan Tam set'te, kartın modülü halkada tekrar etmez (hide).
import { describe, it, expect } from 'vitest'
import { createElement as h, isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import HomeRings, { ringItems, ringAria } from './HomeRings.jsx'

const NOW = new Date(2026, 9, 3, 10, 0, 0)
const at = (hour, daysAgo = 0) => new Date(2026, 9, 3 - daysAgo, hour, 0, 0).toISOString()
const keys = (o) => ringItems({ now: NOW, ...o }).map((r) => r.key)
const doneOf = (sessions) => Object.fromEntries(ringItems({ sessions, now: NOW, ios: true }).map((r) => [r.key, r.done]))
// Bileşen kanca kullanmıyor: çağırıp ağacın düğmelerini topla (dokunuşu props.onClick ile dene)
const buttons = (el, out = []) => {
  if (Array.isArray(el)) el.forEach((c) => buttons(c, out))
  else if (isValidElement(el)) {
    if (el.type === 'button') out.push(el)
    buttons(el.props.children, out)
  }
  return out
}

describe('ringItems', () => {
  it("iPhone uygulamasında dört halka sırayla; web'de Yoga yok", () => {
    expect(ringItems({ now: NOW, ios: true }).map((r) => [r.key, r.route])).toEqual([
      ['yoga', 'yoga'],
      ['dalga', 'dalga'],
      ['breath', 'breath'],
      ['full', 'routine-full'],
    ])
    expect(keys({ ios: false })).toEqual(['dalga', 'breath', 'full'])
  })
  it('adlar sahip onaylı (ad kapısı tur 2; 2026-10-03)', () => {
    expect(ringItems({ now: NOW, ios: true }).map((r) => r.label)).toEqual(['Sesli yoga', 'Müzik', 'Nefes', 'Göz seti'])
  })
  it('hide: büyük kartın modülü halkada yok', () => {
    expect(keys({ ios: true, hide: ['breath'] })).toEqual(['yoga', 'dalga', 'full'])
    expect(keys({ ios: true, hide: ['dalga', 'yoga'] })).toEqual(['breath', 'full'])
    expect(keys({ ios: false, hide: ['dalga', 'breath'] })).toEqual(['full'])
  })
  it('yapıldı yalnız bugünkü kayıttan ve modülün kendi kuralıyla', () => {
    expect(doneOf([])).toEqual({ yoga: false, dalga: false, breath: false, full: false })
    expect(doneOf([
      { type: 'yoga', lesson: 1, completed: true, date: at(8) },
      { type: 'dalga', mode: 'sakin', date: at(9) },
      { type: 'breath', seconds: 60, date: at(9) },
      { type: 'routine', setId: 'full', seconds: 176, date: at(9) },
    ])).toEqual({ yoga: true, dalga: true, breath: true, full: true })
    // Dünkü kayıtlar bugün sayılmaz
    expect(doneOf([
      { type: 'yoga', lesson: 1, completed: true, date: at(8, 1) },
      { type: 'dalga', mode: 'guc', date: at(9, 1) },
      { type: 'breath', seconds: 120, date: at(9, 1) },
      { type: 'routine', setId: 'full', seconds: 176, date: at(9, 1) },
    ])).toEqual({ yoga: false, dalga: false, breath: false, full: false })
    // Yarım ders, 60 sn'den kısa nefes ve başka set sayılmaz
    expect(doneOf([
      { type: 'yoga', lesson: 2, completed: false, date: at(8) },
      { type: 'breath', seconds: 59, date: at(9) },
      { type: 'routine', setId: 'normal', seconds: 120, date: at(9) },
    ])).toEqual({ yoga: false, dalga: false, breath: false, full: false })
  })
  it('mola kilidi yalnız Tam set\'te (göz bütçesine sayılan iş)', () => {
    const locked = ringItems({ now: NOW, ios: true, locked: true }).filter((r) => r.locked).map((r) => r.key)
    expect(locked).toEqual(['full'])
    expect(ringItems({ now: NOW, ios: true }).some((r) => r.locked)).toBe(false)
  })
})

describe('ringAria', () => {
  it('ad ve durum eki; kilit eki yapıldıdan sonra', () => {
    expect(ringAria({ label: 'X', done: false, locked: false })).toBe('X')
    expect(ringAria({ label: 'X', done: true, locked: false })).toBe('X, bugün yapıldı')
    expect(ringAria({ label: 'X', done: true, locked: true })).toBe('X, bugün yapıldı, mola bitene kadar kilitli')
  })
})

describe('HomeRings', () => {
  it('dokununca modülün rotası onStart\'a gider', () => {
    const calls = []
    const btns = buttons(HomeRings({ now: NOW, ios: true, onStart: (r) => calls.push(r) }))
    btns.forEach((b) => b.props.onClick())
    expect(calls).toEqual(['yoga', 'dalga', 'breath', 'routine-full'])
  })
  it('çizim: satırın adı, halka sayısı, yapıldı tiki ve kilit rozeti (kilit tikten önce)', () => {
    const sessions = [{ type: 'dalga', mode: 'sakin', date: at(9) }, { type: 'routine', setId: 'full', seconds: 176, date: at(9) }]
    const html = renderToStaticMarkup(h(HomeRings, { sessions, now: NOW, ios: true, locked: true }))
    expect(html).toContain('<nav class="hk" aria-label="Kısayollar">')
    expect(html).toContain('class="hk-row n4"')
    expect(html).toContain('class="hk-b dalga done"')
    expect(html).toMatch(/class="hk-b dalga done"[^>]*>[\s\S]*?class="hk-m ok"/)
    expect(html).toContain('class="hk-b full done locked"')
    expect(html).toMatch(/class="hk-b full done locked"[^>]*>[\s\S]*?class="hk-m lk"/)
    expect((html.match(/class="hk-m /g) ?? []).length).toBe(2)
  })
  it('8. günden sonra yolun başındaki sınıf; hiç halka kalmazsa çizim yok', () => {
    expect(renderToStaticMarkup(h(HomeRings, { now: NOW, ios: false, className: 'at-path' }))).toContain('<nav class="hk at-path"')
    expect(renderToStaticMarkup(h(HomeRings, { now: NOW, ios: false, hide: ['dalga', 'breath', 'full'] }))).toBe('')
  })
})
