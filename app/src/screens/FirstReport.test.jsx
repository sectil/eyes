// 5. gün İlk rapor · Göz kartı (karar 2026-09-29: E testi ilk günden haftada bir). Göz henüz değerlendirilmez;
// ne zaman değerlendirileceği haftalık plana göre yazar ("8. gün", "7 test" denmez).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FirstReport, { eyeWhen, changeOf } from './FirstReport.jsx'
import { makeYogaRecord } from '../lib/yogaRecord.js'
import { WEEKLY_PLAN_NOTE } from '../lib/trend.js'

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString()
const weekly = (d) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: ago(d), correction: 'none', algorithm: 'descent-zest-v4' }))

describe('İlk rapor · göz', () => {
  it('1. günde haftalık test yapıldı: alışma cümlesi + haftalık plan (22. gün); günlük kural yazmaz', () => {
    const t = text(renderToStaticMarkup(h(FirstReport, { tests: weekly(4), sessions: [], start: ago(4), onClose: () => {}, onProgress: () => {} })))
    expect(t).toContain('Alışma dönemi. İlk haftalık testin sonucu')
    expect(t).toContain(WEEKLY_PLAN_NOTE)
    expect(t).not.toMatch(/8\. günden|en az 7 test|21\. gün|Günlük test/)
  })
  it('henüz test yoksa da plan cümlesi; takipteyse yok', () => {
    const t = text(renderToStaticMarkup(h(FirstReport, { tests: [], sessions: [], start: ago(4), onClose: () => {}, onProgress: () => {} })))
    expect(t).toContain(WEEKLY_PLAN_NOTE)
    expect(eyeWhen({ phase: 'tracking', baselineMode: 'weekly' })).toBe(false)
    expect(eyeWhen({ phase: 'baseline', baselineMode: 'daily' })).toBe(false)
    expect(eyeWhen({ phase: 'baseline', baselineMode: 'weekly' })).toBe(true)
  })
})

describe('İlk rapor · uygulamalardan sonra', () => {
  it('fiil değişimin işaretinden, güven aralığı değerle aynı yönde (düşük daha iyi ölçüde de)', () => {
    expect(changeOf({ better: 'down', gain: 3, lo: 2.1, hi: 3.9 })).toEqual({ value: -3, lo: -3.9, hi: -2.1, verb: 'azaldı' })
    expect(changeOf({ better: 'down', gain: -2, lo: -3.1, hi: -0.9 })).toEqual({ value: 2, lo: 0.9, hi: 3.1, verb: 'arttı' })
    expect(changeOf({ better: 'up', gain: 2, lo: 1, hi: 3 })).toEqual({ value: 2, lo: 1, hi: 3, verb: 'arttı' })
    expect(changeOf({ better: 'up', gain: 0, lo: null, hi: null })).toMatchObject({ value: 0, lo: null, verb: 'değişmedi' })
  })
  it('yoga Ders 1: gerginlik arttıysa "arttı: +…" ve aralık artı yönde', () => {
    const recs = [[4, 6], [3, 6], [4, 7], [5, 7]].map(([b, a], i) => ({ id: `y${i}`, ...makeYogaRecord({ lesson: 1, planned: 300, seconds: 300, reachedClosing: true, before: b, after: a, endedAt: new Date(Date.now() - (i + 1) * 3600000) }) }))
    const t = text(renderToStaticMarkup(h(FirstReport, { tests: [], sessions: recs, start: ago(4), onClose: () => {}, onProgress: () => {} })))
    expect(t).toMatch(/Yoga · Nefesin Ritmi sonrası gerginlik ortalama arttı: \+2,5 \(4 oturum, %95 GA \d,\d – \d,\d\)/)
    expect(t).not.toContain('azaldı')
  })
})
