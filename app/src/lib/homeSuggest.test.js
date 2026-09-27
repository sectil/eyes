import { describe, it, expect } from 'vitest'
import { homeSuggestion } from './homeSuggest.js'

const stop = (over = {}) => ({ key: 'isinma', title: 'Isınma', minutes: 1, route: 'routine:isinma', ...over })

describe('homeSuggestion', () => {
  it('yol başlamadıysa "Güne başla" + sıradaki durak; sakin seçenekler Nefes ve Dalga', () => {
    const s = homeSuggestion({ plan: { next: stop(), doneCount: 0, allDone: false } })
    expect(s.primary).toMatchObject({ kind: 'path', eyebrow: 'Güne başla', title: 'Isınma · 1 dk', route: 'routine:isinma' })
    expect(s.alts.map((a) => a.kind)).toEqual(['breath', 'dalga'])
  })
  it('yol yarımsa "Yola devam et"', () => {
    const s = homeSuggestion({ plan: { next: stop({ title: 'Uzağa bakış' }), doneCount: 2, allDone: false } })
    expect(s.primary.eyebrow).toBe('Yola devam et')
    expect(s.primary.line).toBe('Kaldığın yerden devam: Uzağa bakış.')
  })
  it('göz molası kilidi ya da molası geldiyse Nefes önce gelir', () => {
    const plan = { next: stop(), doneCount: 1, allDone: false }
    expect(homeSuggestion({ plan, eye: { locked: true } }).primary.kind).toBe('breath')
    expect(homeSuggestion({ plan, eye: { due: 'budget' } }).primary.route).toBe('breath-rest')
    expect(homeSuggestion({ plan, eye: { locked: true } }).alts.map((a) => a.kind)).toEqual(['dalga'])
  })
  it('yol bittiyse ya da yol yoksa Dalga', () => {
    expect(homeSuggestion({ plan: { next: null, allDone: true } }).primary).toMatchObject({ kind: 'dalga', eyebrow: 'Bugün tamam' })
    expect(homeSuggestion({ plan: null }).primary).toMatchObject({ kind: 'dalga', eyebrow: 'Serbest gün' })
    expect(homeSuggestion({ plan: null }).alts.map((a) => a.kind)).toEqual(['breath'])
  })
})
