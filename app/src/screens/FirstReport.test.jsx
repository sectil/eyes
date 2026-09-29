// 5. gün İlk rapor · Göz kartı (karar 2026-09-29: E testi ilk günden haftada bir). Göz henüz değerlendirilmez;
// ne zaman değerlendirileceği haftalık plana göre yazar ("8. gün", "7 test" denmez).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FirstReport, { eyeWhen } from './FirstReport.jsx'
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
