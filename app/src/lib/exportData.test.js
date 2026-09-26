import { describe, it, expect } from 'vitest'
import { csvRows, toCsv, CSV_HEADER, REPORT_TABLE_ROWS, reportModel, reportHtml, eyeChartSvg, localStamp, reportFilename, csvFilename } from './exportData.js'
import { makeWho5Record } from './progress.js'
import { registry } from '../modules/registry.js'

const day = (n, h = 9) => new Date(2026, 8, 1 + n, h, 5).toISOString()
const va = (n, eye, logMAR, extra = {}) => ({ type: 'va-daily', date: day(n), eye, logMAR, correction: 'reading', meanDistanceMm: 402, trials: 24, ...extra })

describe('CSV', () => {
  it('görme, metrik, önce→sonra, WHO-5 ve süre satırları; tarihe göre sıralı', () => {
    const tests = [va(2, 'R', 0.2), va(0, 'L', 0.1)]
    const sessions = [
      { type: 'gokyuzu', date: day(1), before: 3, after: 7, seconds: 120 },
      { type: 'street', date: day(1, 10), noticed: 3, asked: 4, seconds: 90 },
      makeWho5Record([3, 3, 3, 3, 3], day(3)),
    ]
    const rows = csvRows({ tests, sessions })
    const kinds = (m) => rows.filter((r) => r.measure === m)
    expect(kinds('logMAR · Sol göz')[0]).toMatchObject({ value: 0.1, unit: 'logMAR', domain: 'eye', note: 'koşul: okuma gözlüğüyle; mesafe: 40 cm; deneme: 24' })
    expect(kinds('dinlenmişlik · önce')[0]).toMatchObject({ value: 3, unit: '/10', domain: 'calm' })
    expect(kinds('dinlenmişlik · sonra')[0].value).toBe(7)
    expect(kinds('Fark etme isabeti')[0]).toMatchObject({ value: 75, domain: 'awareness' })
    expect(kinds('WHO-5')[0]).toMatchObject({ value: 60, unit: '/100', note: 'ham 15/25' })
    expect(kinds('süre').length).toBe(5) // 2 test + 3 oturum (WHO-5 dahil)
    const dates = rows.map((r) => new Date(r.date).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => a - b))
  })
  it('her modülün metrik ve etkisi CSV\'ye kendiliğinden girer (registry)', () => {
    const fake = { key: 'x', module: 'breath', domain: 'calm', label: 'Deneme metriği', unit: 'birim', series: () => [{ date: day(0), value: 4 }] }
    const rows = csvRows({ sessions: [], metrics: [fake], effects: [] })
    expect(rows).toEqual([expect.objectContaining({ measure: 'Deneme metriği', value: 4, module: registry.get('breath').title })])
  })
  it('RFC 4180 kaçış, BOM, CRLF, formül koruması, noktalı ondalık', () => {
    const csv = toCsv([
      { date: day(0), module: 'A, "B"', domain: 'eye', measure: '=1+1', value: -0.1234, unit: 'logMAR', note: 'satır\nsonu' },
    ])
    expect(csv.startsWith('﻿' + CSV_HEADER.join(','))).toBe(true)
    const line = csv.split('\r\n')[1]
    expect(line).toBe(`${localStamp(day(0))},"A, ""B""",Göz,'=1+1,-0.123,logMAR,"satır\nsonu"`)
    expect(csv.endsWith('\r\n')).toBe(true)
  })
  it('geçersiz tarih ve sayı atlanır', () => {
    const rows = csvRows({ tests: [va(0, 'R', NaN), { ...va(0, 'R', 0.2), date: 'yok' }], sessions: [] })
    expect(rows.filter((r) => r.unit === 'logMAR')).toEqual([])
  })
})

describe('Doktor raporu', () => {
  const tests = Array.from({ length: 24 }, (_, i) => va(i, 'R', 0.2 + (i % 3) * 0.02))
  it('model: gözler, aralık, yaş, son testler en yeniden eskiye', () => {
    const m = reportModel({ tests, sessions: [], identity: { name: ' Ayşe ', birthDate: '1980-10-01' }, now: new Date(2026, 8, 26) })
    expect(m.name).toBe('Ayşe')
    expect(m.age).toBe(45)
    expect(m.eyes.map((e) => e.eye)).toEqual(['R'])
    expect(m.eyes[0].n).toBe(24)
    expect(m.eyes[0].recent.length).toBe(REPORT_TABLE_ROWS)
    expect(new Date(m.eyes[0].recent[0].date) > new Date(m.eyes[0].recent[1].date)).toBe(true)
    expect(m.days).toBe(24)
  })
  it('HTML: uyarı, yöntem, kaynak; kaçış; ad yoksa satır yok', () => {
    const m = reportModel({ tests, sessions: [], identity: { name: '<b>x</b>' }, now: new Date(2026, 8, 26) })
    const html = reportHtml(m)
    expect(html).toContain('Tanı koymaz')
    expect(html).toContain('doi:10.1038/s41433-020-01356-2')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
    expect(html).not.toContain('<b>x</b>')
    expect(html).toContain('<svg class="chart"')
    expect(reportHtml(reportModel({ tests: [], sessions: [] }))).toContain('Henüz görme testi yok')
    expect(reportHtml(reportModel({ tests: [], sessions: [] }))).not.toContain('Ad:')
  })
  it('grafik: 2 noktadan az ise boş; dosya adları tarihli', () => {
    expect(eyeChartSvg([{ date: day(0), logMAR: 0.2 }])).toBe('')
    expect(reportFilename(new Date(2026, 8, 6))).toBe('eyetrail-rapor-2026-09-06.pdf')
    expect(csvFilename(new Date(2026, 8, 6))).toBe('eyetrail-veriler-2026-09-06.csv')
  })
})
