// "Sonra yaparım" kaydı (PLAN.v3 §B.5): bugüne ait, gün değişince geçersiz; sessions'a girmez.
import { describe, it, expect } from 'vitest'
import { LATER_KEY, loadLater, markLater } from './pathLater.js'

function memory(init = {}) {
  const m = new Map(Object.entries(init))
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }
}
const at = (d, h = 10) => new Date(2026, 9, d, h)

describe('pathLater', () => {
  it('anahtar gozolcum:path-later; boş depoda null', () => {
    expect(LATER_KEY).toBe('gozolcum:path-later')
    expect(loadLater(at(3), memory())).toBeNull()
  })
  it('markLater bugünün listesine ekler, tekrar eklemez, biçim { day, later }', () => {
    const s = memory()
    expect(markLater('yoga', at(3, 9), s)).toEqual({ day: '2026-10-03', later: ['yoga'] })
    markLater('yoga', at(3, 15), s)
    markLater('snake', at(3, 16), s)
    expect(loadLater(at(3, 23), s)).toEqual({ day: '2026-10-03', later: ['yoga', 'snake'] })
    expect(JSON.parse(s.getItem(LATER_KEY))).toEqual({ day: '2026-10-03', later: ['yoga', 'snake'] })
  })
  it('gün değişince geçersiz: yarına taşınmaz; yeni gün eski kaydın yerine yazılır', () => {
    const s = memory()
    markLater('yoga', at(3, 22), s)
    expect(loadLater(at(4, 0), s)).toBeNull()
    expect(markLater('snake', at(4, 8), s)).toEqual({ day: '2026-10-04', later: ['snake'] })
  })
  it('aynı günün öteki alanlarını korur (YOL.ilerleme light)', () => {
    const s = memory({ [LATER_KEY]: JSON.stringify({ day: '2026-10-03', later: ['snake'], light: true }) })
    expect(markLater('yoga', at(3), s)).toEqual({ day: '2026-10-03', later: ['snake', 'yoga'], light: true })
  })
  it('bozuk kayıt, geçersiz anahtar ve depolama hatası sessizce geçer', () => {
    expect(loadLater(at(3), memory({ [LATER_KEY]: '{bozuk' }))).toBeNull()
    expect(loadLater(at(3), memory({ [LATER_KEY]: JSON.stringify({ day: '2026-10-03', later: 'yoga' }) }))).toBeNull()
    expect(loadLater(at(3), memory({ [LATER_KEY]: JSON.stringify({ day: '2026-10-03', later: ['yoga', 3, ''] }) }))).toEqual({ day: '2026-10-03', later: ['yoga'] })
    const s = memory()
    expect(markLater('', at(3), s)).toBeNull()
    expect(s.m.size).toBe(0)
    const broken = { getItem: () => { throw new Error('yok') }, setItem: () => { throw new Error('dolu') } }
    expect(loadLater(at(3), broken)).toBeNull()
    expect(markLater('yoga', at(3), broken)).toEqual({ day: '2026-10-03', later: ['yoga'] })
  })
})
