// Nef girdisi → an motoru bağlamı (context.js): dil Intl ile, uygulamaya dönüş izi, ilk kayıt ve modüle dönüş,
// planlayıcı girdisi kartla aynı olgulardan.
import { describe, it, expect } from 'vitest'
import { nefLang, appGapOf, firstsOf, gapsOf, nefContext, nefNotifyInput, recordsOf, who5LowOf } from './context.js'
import { registry } from '../../modules/registry.js'
import trBank from './bank/tr.js'
import { moduleLexicon } from './lexicon.js'

const NOW = new Date(2026, 8, 30, 20, 30)
const at = (daysAgo, hh = 10) => new Date(2026, 8, 30 - daysAgo, hh).toISOString()
const snake = (d) => ({ type: 'game', game: 'snake', score: 5, seconds: 60, date: at(d) })
const span = (d, v) => ({ type: 'span', span: v, seconds: 60, date: at(d) })

describe('dil (Intl; bölge sabiti yok)', () => {
  it('arayüz dili önce, sonra telefonun dilleri; bölge atılır', () => {
    expect(nefLang({ ui: 'tr', locales: ['en-US'] })).toBe('tr')
    expect(nefLang({ ui: '', locales: ['de-DE', 'tr'] })).toBe('de') // bankası yok: Nef o dilde susar (kart testi)
    expect(nefLang({ ui: 'bozuk etiket!!', locales: ['tr'] })).toBe('tr')
  })
})

describe('uygulamaya uzun aradan dönüş izi', () => {
  it('bugünden önceki son kayıt ya da kart günü; iz yoksa null', () => {
    expect(appGapOf({ now: NOW, sessions: [snake(20), snake(0)] })).toBe(20)
    expect(appGapOf({ now: NOW, sessions: [snake(20)], rows: [{ channel: 'card', date: '2026-09-27' }] })).toBe(3)
    expect(appGapOf({ now: NOW, sessions: [snake(0)] })).toBeNull()
  })
})

describe('ilk kayıt ve modüle dönüş (manifestin nef.moments\'i)', () => {
  const live = registry.live
  it('ilk kayıt bugün ya da dün; sayılı hâl yalnız bu dilde kurulabiliyorsa', () => {
    expect(firstsOf({ now: NOW, tests: [], sessions: [snake(0)], habits: [], modules: live })).toEqual([{ module: 'snake', kind: 'day' }])
    expect(firstsOf({ now: NOW, tests: [], sessions: [snake(2)], habits: [], modules: live })).toEqual([])
    const tb = firstsOf({ now: NOW, tests: [], sessions: [span(1, 4)], habits: [], modules: live, bank: trBank, lexicon: moduleLexicon('tr') })
    expect(tb).toEqual([{ module: 'tek-bakis', kind: 'metric', metric: 'tek-bakis-span', domain: expect.any(String), value: 4 }])
  })
  it('modüle 14+ gün aradan bugün dönüş', () => {
    expect(gapsOf({ now: NOW, tests: [], sessions: [snake(20), snake(0)], habits: [], modules: live })).toEqual([{ module: 'snake', days: 20 }])
    expect(gapsOf({ now: NOW, tests: [], sessions: [snake(5), snake(0)], habits: [], modules: live })).toEqual([{ module: 'snake', days: 5 }])
  })
  it('kayıt tanıyıcı: sessions.match ya da nef.records (tests/habits)', () => {
    expect(recordsOf(registry.get('snake'), { sessions: [snake(1), span(1, 4)] })).toHaveLength(1)
    expect(recordsOf(registry.get('water'), { habits: [{ type: 'water', date: at(0) }, { type: 'mola', date: at(0) }] })).toHaveLength(1)
  })
})

describe('kart ve planlayıcı aynı girdiden', () => {
  it('nefNotifyInput: dil, yol, WHO-5 ve dönüş izi kart bağlamıyla aynı', () => {
    const input = { lang: 'tr', tests: [], sessions: [snake(9)], habits: [], path: { has: true, doneToday: true, doneDays: 2 }, who5Low: false }
    const ctx = nefContext(input, { now: NOW })
    const n = nefNotifyInput(input, { now: NOW, rows: [] })
    expect(n).toEqual({ rows: [], lang: 'tr', pathDoneToday: true, who5Low: false, appGapDays: 9 })
    expect(ctx.appGapDays).toBe(n.appGapDays)
    expect(ctx.path.doneToday).toBe(n.pathDoneToday)
  })
  it('WHO-5 düşük: son puan 52\'nin altı', () => {
    expect(who5LowOf([{ type: 'who5', score: 40, date: at(1) }], NOW)).toBe(true)
    expect(who5LowOf([{ type: 'who5', score: 60, date: at(1) }], NOW)).toBe(false)
  })
})
