import { describe, it, expect } from 'vitest'
import {
  who5Score, makeWho5Record, who5Card, WHO5_LOW, t95, meanCI, acuteEffects, metricTrend, metricCards,
  domainSummary, firstReport, reportDay, eyeCard,
} from './progress.js'

const day = (n) => new Date(Date.UTC(2026, 8, 1 + n, 9)).toISOString()

describe('WHO-5 (Eser 2019: 0–5 × 5, ham ×4, 14 gün, 10 puan anlamlı, ham <13 düşük)', () => {
  it('puanlama', () => {
    expect(who5Score([5, 5, 5, 5, 5])).toEqual({ raw: 25, score: 100 })
    expect(who5Score([2, 3, 2, 2, 3])).toEqual({ raw: 12, score: 48 })
    expect(who5Score([2, 3, 2, 2])).toBeNull()
    expect(who5Score([6, 0, 0, 0, 0])).toBeNull()
    expect(WHO5_LOW).toBe(13 * 4)
  })
  it('kart: anlamlı artış, düşük eşik, 14 günde bir', () => {
    const s = [makeWho5Record([2, 3, 2, 2, 3], day(0)), makeWho5Record([3, 3, 3, 3, 3], day(14))]
    const c = who5Card(s, day(15))
    expect(c).toMatchObject({ n: 2, first: 48, last: 60, delta: 12, label: 'up', low: false, due: false, nextInDays: 13 })
    expect(who5Card([s[0]], day(3))).toMatchObject({ label: 'first', low: true, nextInDays: 11 })
    const small = [makeWho5Record([3, 3, 3, 3, 3], day(0)), makeWho5Record([3, 3, 3, 3, 4], day(14))]
    expect(who5Card(small, day(14)).label).toBe('noise') // +4 < 10
    expect(who5Card([], day(0))).toMatchObject({ n: 0, due: true })
  })
})

describe('istatistik', () => {
  it('t değerleri ve %95 GA', () => {
    expect(t95(1)).toBe(12.706)
    expect(t95(11)).toBe(2.228) // arada: bir alttaki (temkinli)
    expect(t95(500)).toBe(1.96)
    const ci = meanCI([1, 2, 3, 4, 5])
    expect(ci.mean).toBe(3)
    expect(ci.lo).toBeCloseTo(3 - 2.776 * (Math.sqrt(2.5) / Math.sqrt(5)), 6)
    expect(meanCI([4]).lo).toBeNull()
  })
})

describe('anlık etkiler (modül tanımlarından)', () => {
  it('Gökyüzü: 3 oturum, hep iyileşme → anlamlı; 2 oturum → değil', () => {
    const s = [3, 4, 2].map((b, i) => ({ type: 'gokyuzu', date: day(i), before: b, after: b + 2 + (i % 2) }))
    const g = acuteEffects(s).find((e) => e.key === 'gokyuzu-rest')
    expect(g).toMatchObject({ n: 3, domain: 'calm', measure: 'dinlenmişlik', sig: true })
    expect(g.gain).toBeCloseTo(7 / 3, 6)
    expect(acuteEffects(s.slice(0, 2)).find((e) => e.key === 'gokyuzu-rest').sig).toBe(false)
  })
  it('düşük daha iyi (Yön rahatsızlık): azalma iyileşme sayılır', () => {
    const s = [8, 7, 9].map((b, i) => ({ type: 'yon', tool: 'uzak', date: day(i), before: b, after: b - 3 }))
    const u = acuteEffects(s).find((e) => e.key === 'yon-uzak')
    expect(u).toMatchObject({ better: 'down', gain: 3, sig: true, domain: 'self' })
  })
  it('Dalga Güç modu "kendine yaklaşım" alanına sayılır; tarih filtresi', () => {
    const s = [{ type: 'dalga', mode: 'guc', date: day(1), before: 4, after: 6 }, { type: 'dalga', mode: 'guc', date: day(9), before: 5, after: 8 }]
    expect(acuteEffects(s).find((e) => e.key === 'dalga-guc').domain).toBe('self')
    expect(acuteEffects(s, { since: day(5) }).find((e) => e.key === 'dalga-guc').n).toBe(1)
  })
})

describe('metrikler', () => {
  const pts = (vals) => vals.map((v, i) => ({ date: day(i), value: v }))
  it('eşik varsa eşikle, yoksa ilk yarı/son yarı; azsa belirsiz', () => {
    expect(metricTrend(pts([40, 52]), { meaningful: 10 }).label).toBe('better')
    expect(metricTrend(pts([40, 45]), { meaningful: 10 }).label).toBe('noise')
    expect(metricTrend(pts([50, 60, 55]), {}).label).toBe('unsure')
    expect(metricTrend(pts([50, 52, 51, 70, 72, 71]), {}).label).toBe('better')
    expect(metricTrend(pts([50, 60, 45, 55, 48, 58]), {}).label).toBe('noise')
  })
  it('düşük daha iyi (Hızlı Bakış eşiği ms)', () => {
    expect(metricTrend(pts([200, 205, 198, 150, 148, 152]), { better: 'down' }).label).toBe('better')
    expect(metricTrend(pts([150, 148, 152, 200, 205, 198]), { better: 'down' }).label).toBe('worse')
  })
  it('modül metrikleri kayıtlardan kendiliğinden kurulur', () => {
    const sessions = [
      ...[2, 2, 3, 3, 4, 4].map((n, i) => ({ type: 'street', date: day(i), noticed: n, asked: 4 })),
      { type: 'span', date: day(1), span: 5 },
    ]
    const cards = metricCards({ sessions })
    expect(cards.find((c) => c.key === 'street-noticed')).toMatchObject({ domain: 'awareness', n: 6, label: 'better' })
    expect(cards.find((c) => c.key === 'tek-bakis-span')).toMatchObject({ domain: 'focus', n: 1, label: 'first' })
    expect(cards.find((c) => c.key === 'quick-look-threshold')).toBeUndefined() // kayıt yoksa kart yok
  })
})

describe('alanlar ve 5. gün raporu', () => {
  it('her alan kendi metrik ve etkilerini toplar; göz ve WHO-5 özel kaynaktan', () => {
    const sessions = [{ type: 'breath', date: day(1), calmBefore: 2, calmAfter: 4 }, { type: 'yon', tool: 'ayna', date: day(1), score: 3.2 }]
    const d = domainSummary({ sessions, now: new Date(day(2)) })
    expect(d.calm.effects.map((e) => e.key)).toContain('breath-calm')
    expect(d.self.metrics.map((m) => m.key)).toContain('yon-ayna')
    expect(d.eye.eye.phase).toBe('empty')
    expect(d.wellbeing.who5.n).toBe(0)
    expect(d.body.metrics).toEqual([])
  })
  it('5. gün: yalnız başlangıçtan sonraki kayıtlar; gün sayısı', () => {
    expect(reportDay(day(0), new Date(day(4)))).toBe(5)
    const sessions = [{ type: 'gokyuzu', date: day(-3), before: 1, after: 9 }, { type: 'gokyuzu', date: day(2), before: 4, after: 6 }]
    const r = firstReport({ sessions, start: day(0), now: new Date(day(4)) })
    expect(r.day).toBe(5)
    expect(r.acute.find((e) => e.key === 'gokyuzu-rest')).toMatchObject({ n: 1, gain: 2 })
    expect(r.practice.total).toBeGreaterThanOrEqual(1)
  })
  it('göz kartı: test yoksa boş, mesaj var', () => {
    const e = eyeCard([], new Date(day(0)))
    expect(e.phase).toBe('empty')
    expect(typeof e.message).toBe('string')
  })
})
