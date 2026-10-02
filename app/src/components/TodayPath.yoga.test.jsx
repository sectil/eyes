// Yol kartında Yoga (PLAN.v3 §B.2-12, §B.5; yol.md §5.4): lotus çizimi; alt satır ders adı ve süre ("Nefesin Ritmi ·
// 3 dk"); erişilebilirlik etiketi aynı alt satırı okur. Sağlık iddiası yok. Öteki durakların yazısı değişmez.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TodayPath, { stopSub } from './TodayPath.jsx'
import { buildPath } from '../lib/today.js'

const NOW = new Date(2026, 9, 5, 10)
const NB = '\u00a0' // süre birimi bölünmez boşlukla (TodayPath stopSub)
const mods = (yoga = {}) => [
  { id: 'routine', kind: 'exercise', gates: { eyeBudget: 'eye' }, today: () => ({ title: 'Göz kırpma', minutes: 1, slot: 'body', order: 90, done: true }) },
  { id: 'breath', kind: 'practice', gates: {}, today: () => ({ title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: 5, slot: 'rest', glyph: 'moon', done: true }) },
  { id: 'snake', kind: 'practice', gates: { eyeBudget: 'eye' }, today: () => ({ title: 'Yılan', sub: '1 tur', minutes: 2, slot: 'open', glyph: 'snake', openEnded: true, game: true, dropRank: 1, done: true }) },
  { id: 'yoga', kind: 'practice', gates: {}, today: () => ({ title: 'Yoga', sub: 'Nefesin Ritmi', minutes: 3, route: 'yoga-1', slot: 'practice', order: 105, glyph: 'lotus', yields: true, done: false, ...yoga }) },
  { id: 'notice', kind: 'practice', gates: {}, today: () => ({ title: 'Bugünün görevi', minutes: 1, slot: 'finale', dropRank: 2, done: false }) },
]
const render = (plan) => renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {} }))
const yogaOf = (p) => p.stops.find((s) => s.id === 'yoga')

describe('TodayPath · Yoga durağı', () => {
  it('alt satır "Nefesin Ritmi · 3 dk"; bitince "tamam"', () => {
    const y = yogaOf(buildPath(mods(), { now: NOW }))
    expect(stopSub(y, 'now')).toEqual({ text: `Nefesin Ritmi · 3${NB}dk`, warn: false })
    expect(stopSub(y, 'later')).toEqual({ text: `Nefesin Ritmi · 3${NB}dk`, warn: false })
    expect(stopSub({ ...y, minutes: 5, sub: 'Derin Dinlenme' }, 'later').text).toBe(`Derin Dinlenme · 5${NB}dk`)
    expect(stopSub({ ...y, done: true }, 'done')).toEqual({ text: 'tamam', warn: false })
  })
  it('öteki durakların alt satırı değişmez (açık uçlu oyun, mola, süresi olan egzersiz)', () => {
    const p = buildPath(mods(), { now: NOW })
    const at = (id) => p.stops.find((s) => s.id === id)
    expect(stopSub(at('snake'), 'later').text).toBe('1 tur')
    expect(stopSub(at('breath'), 'later').text).toBe('Gözlerin dinlenirken nefes al.')
    expect(stopSub(at('routine'), 'later').text).toBe(`1${NB}dk`)
    expect(stopSub(at('notice'), 'later').text).toBe(`1${NB}dk`)
  })
  it('çizim: lotus simgesi ve sahnesi, etiket, erişilebilirlik etiketi "Yoga, pratik, Nefesin Ritmi, 3 dakika, sırada"', () => {
    const p = buildPath(mods(), { now: NOW })
    expect(p.next.id).toBe('yoga')
    const html = render(p)
    expect(html).toContain('M12 4.5C14.2 7 14.2 12.4 12 15.5') // GLYPH.lotus
    expect(html).toContain('M50 28C59 38 59 55 50 65') // SCENE.lotus
    expect(html).toContain('aria-label="Yoga, pratik, Nefesin Ritmi, 3 dakika, sırada"')
    // Kart yalnız ders adını ve süreyi yazar; sağlık iddiası yok (§B.2-12)
    const y = yogaOf(p)
    expect(`${y.title} ${y.sub} ${stopSub(y, 'now').text}`).not.toMatch(/iyileştir|stres|kanıtlan|tedavi/i)
  })
  it('sıradaki değilken etiket alt satırı ve "Önce …" uyarısı', () => {
    const p = buildPath(mods({ later: true }), { now: NOW })
    expect(p.next.id).toBe('notice')
    const html = render(p)
    expect(html).toContain('aria-label="Yoga, pratik, Nefesin Ritmi, 3 dakika, sonra. Önce Bugünün görevi"')
    expect(html).toContain(`Nefesin Ritmi · 3${NB}dk`)
  })
  it('bilinmeyen çizim adı boş kalır (bugünkü davranış)', () => {
    const p = buildPath(mods({ glyph: 'yok-boyle-bir-sey' }), { now: NOW })
    expect(() => render(p)).not.toThrow()
  })
})
