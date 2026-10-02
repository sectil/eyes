// "Birim yoldur" (bildirim PLAN.v1 §A.2): yoldan açılan modül ekranı ctx.remindField'a inPath: true verir, bölümlerden
// açılan false. Gözden geçirme bulgusu (SHOULD): görünümler inPath geçirmiyordu.
import { describe, it, expect } from 'vitest'
import routineView, { inPathRoute as routineInPath } from './routine/view.jsx'
import yogaView, { inPathRoute as yogaInPath } from './yoga/view.jsx'
import { SETS, PATH_GROUPS } from '../lib/routines.js'

describe('inPath: yoldan açılan rota', () => {
  it('routine: yol grupları yolda, setler değil', () => {
    for (const g of PATH_GROUPS) expect(routineInPath(`routine-${g.id}`)).toBe(true)
    for (const s of SETS) expect(routineInPath(`routine-${s.id}`)).toBe(false)
  })
  it('yoga: yoga-<ders> yolda, kütüphane (yoga) değil', () => {
    expect(yogaInPath('yoga-3')).toBe(true)
    expect(yogaInPath('yoga')).toBe(false)
    expect(yogaInPath(undefined)).toBe(false)
  })
  it('görünüm ctx.remindField\'a inPath geçirir', () => {
    const calls = []
    const ctx = { remindField: (route, opts) => { calls.push([route, opts]); return null }, sessions: [], tests: [], exercise: [], native: {}, settings: {}, store: {}, back() {}, go() {}, refresh() {} }
    const g = PATH_GROUPS[0]
    routineView.render(ctx, `routine-${g.id}`)
    routineView.render(ctx, `routine-${SETS[0].id}`)
    yogaView.render(ctx, 'yoga')
    expect(calls).toEqual([[`routine-${g.id}`, { inPath: true }], [`routine-${SETS[0].id}`, { inPath: false }], ['yoga', { inPath: false }]])
  })
})
