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
  it('Türkçe Excel: ";" ayırıcı, virgüllü ondalık; kaçış, BOM, CRLF, formül koruması', () => {
    const rows = [{ date: day(0), module: 'A; "B"', domain: 'eye', measure: '=1+1', value: -0.1234, unit: 'logMAR', note: 'satır\nsonu' }]
    const csv = toCsv(rows)
    expect(csv.startsWith('\uFEFF' + CSV_HEADER.join(';'))).toBe(true)
    const line = csv.split('\r\n')[1]
    expect(line).toBe(`${localStamp(day(0))};"A; ""B""";Göz;'=1+1;-0,123;logMAR;"satır\nsonu"`)
    expect(csv.endsWith('\r\n')).toBe(true)
    // başka dil için: virgül ve nokta
    expect(toCsv(rows, { sep: ',', decimal: '.' }).split('\r\n')[1]).toBe(`${localStamp(day(0))},"A; ""B""",Göz,'=1+1,-0.123,logMAR,"satır\nsonu"`)
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
  it('uyarı kuralı metni trend kuralıyla aynı: seyrek seride son 3 test; seri anahtarı (yöntem, mesafe, gözlük)', () => {
    // Haftalık iki göz (OU): haftada 1 test, 10. testten itibaren kayıp → seyrek seride kırmızı (S9)
    const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
    const ou = Array.from({ length: 12 }, (_, k) => ({ type: 'va-weekly', eye: 'OU', date: D(7 * k), logMAR: k >= 9 ? 0.5 : 0.0, correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4' }))
    const m = reportModel({ tests: ou, sessions: [], now: new Date(D(77)) })
    expect(m.eyes[0].trend).toMatchObject({ alert: 'red', sparse: true })
    const html = reportHtml(m)
    const rule = html.slice(html.indexOf('<h2>Uyarı kuralı</h2>'), html.indexOf('</section>', html.indexOf('<h2>Uyarı kuralı</h2>')))
    expect(rule).toMatch(/Seyrek seride \(son 7 günde 3 test yoksa/)
    expect(rule).toMatch(/son 3 teste uygulanır; ilki sonuncudan en az 6 gün önce/)
    expect(rule).toMatch(/aynı ölçüm yöntemi sürümü, aynı mesafe ölçümü \(kamerayla \/ kamerasız/)
    expect(rule).toMatch(/aynı gözlük\/lens koşulu/)
    expect(rule).not.toMatch(/Yalnız aynı gözlük\/lens koşulundaki testler karşılaştırılır/)
    expect(html).toMatch(/haftalık testte 28/)
  })

  it('seriye girmeyen kayıtlar nedeniyle; yöntem değişikliğinde S6 notu ("farklı gözlük" denmez)', () => {
    const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
    const v3 = Array.from({ length: 5 }, (_, n) => ({ type: 'va-daily', eye: 'R', date: D(n), logMAR: 0.1, correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v3' }))
    const html = reportHtml(reportModel({ tests: [...v3, { ...v3[0], date: D(6), algorithm: 'descent-zest-v4' }], sessions: [], now: new Date(D(6)) }))
    expect(html).toContain('Ölçüm yöntemi güncellendi; yeni seri.')
    expect(html).not.toMatch(/Farklı gözlük\/lens koşulundaki 5/)
  })

  // İnceleme bulgusu R-N1: "Değişim" okuyanın gördüğü iki sayının farkı olmalı
  it('Değişim yazılan yuvarlanmış değerlerden: başlangıç 0,12 → son 7 gün 0,20 = "+0,08" (ham fark 0,089)', () => {
    const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
    const tests = [...Array.from({ length: 21 }, (_, n) => ({ type: 'va-daily', eye: 'R', date: D(n), logMAR: 0.115 })), { type: 'va-daily', eye: 'R', date: D(30), logMAR: 0.204 }]
    const m = reportModel({ tests, sessions: [], now: new Date(D(30)) })
    expect(m.eyes[0].trend).toMatchObject({ phase: 'tracking', baseline: 0.115, current7: 0.204, delta: 0.089, currentWindow: 'days7' })
    const kvOf = (html) => html.slice(html.indexOf('<div class="kv">'), html.indexOf('</div>', html.indexOf('<div class="kv">')))
    const kv = kvOf(reportHtml(m))
    expect(kv).toContain('<span>Başlangıç (ortanca)</span><b>0,12</b>')
    expect(kv).toContain('<span>Son 7 gün (ortanca)</span><b>0,20</b>')
    expect(kv).toContain('<span>Değişim</span><b>+0,08</b>')
    // iyileşme gerçek eksiyle; fark yuvarlanınca sıfırsa işaretsiz
    const eye = (trend) => ({ ...m.eyes[0], trend: { ...m.eyes[0].trend, ...trend } })
    const kvFor = (trend) => kvOf(reportHtml({ ...m, eyes: [eye(trend)] }))
    expect(kvFor({ baseline: 0.204, current7: 0.115, current: 0.115, delta: -0.089 })).toContain('<span>Değişim</span><b>−0,08</b>')
    expect(kvFor({ baseline: 0.104, current7: 0.096, current: 0.096, delta: -0.008 })).toContain('<span>Değişim</span><b>0,00</b>')
    // son 7 günde test yoksa karşılaştırılan değer son 3 testin ortancası: o yazılır, fark ondan
    const last3 = kvFor({ current7: null, current: 0.204, currentWindow: 'last3', delta: 0.089 })
    expect(last3).toContain('<span>Son 3 test (ortanca)</span><b>0,20</b>')
    expect(last3).toContain('<span>Değişim</span><b>+0,08</b>')
  })

  // İnceleme bulgusu R-N3: kural metni trend.js seri anahtarının eski mesafe ayrımını da söyler
  it('uyarı kuralı metni eski yöntemin yakın / uzak mesafe ayrımını söyler (trend.js seri anahtarı)', () => {
    const html = reportHtml(reportModel({ tests: [], sessions: [] }))
    const rule = html.slice(html.indexOf('<h2>Uyarı kuralı</h2>'), html.indexOf('</section>', html.indexOf('<h2>Uyarı kuralı</h2>')))
    expect(rule).toContain("Eski yöntemle (descent-zest-v4 öncesi) kamerayla yapılan ölçümlerde ortalama mesafe de seriyi ayırır: 36–44 cm'deki, 36 cm'den yakın ve 44 cm'den uzak ölçümler üç ayrı seridir.")
    // metin kuralla aynı: 35 cm, 40 cm ve 45 cm'deki eski kayıtlar üç ayrı seri; v4 kayıtları ayrılmaz
    const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
    const old = (n, mm) => ({ type: 'va-daily', eye: 'R', date: D(n), logMAR: 0.1, correction: 'none', distanceTracked: true, meanDistanceMm: mm, algorithm: 'descent-zest-v3' })
    const near = [old(0, 355), old(1, 400), old(2, 445), old(3, 359)]
    expect(reportModel({ tests: near, sessions: [], now: new Date(D(3)) }).eyes[0].trend.droppedBy).toMatchObject({ band: 2 })
    const v4 = near.map((t) => ({ ...t, algorithm: 'descent-zest-v4' }))
    expect(reportModel({ tests: v4, sessions: [], now: new Date(D(3)) }).eyes[0].trend.droppedBy).toMatchObject({ band: 0 })
  })

  it('logMAR ve ondalık aynı yuvarlanmış değerden (H8): 0,004 → "0,00" ve "1,00"; 0,105 → "0,11"', () => {
    const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
    const html = reportHtml(reportModel({ tests: [{ type: 'va-daily', eye: 'R', date: D(0), logMAR: 0.004 }, { type: 'va-daily', eye: 'R', date: D(1), logMAR: 0.105 }], sessions: [], now: new Date(D(1)) }))
    expect(html).toContain('<td class="n">0,00</td><td class="n">1,00</td>')
    expect(html).toContain('<td class="n">0,11</td><td class="n">0,78</td>')
    expect(html).toContain('0,11 logMAR (≈ 0,78)')
  })

  it('grafik: 2 noktadan az ise boş; dosya adları tarihli', () => {
    expect(eyeChartSvg([{ date: day(0), logMAR: 0.2 }])).toBe('')
    expect(reportFilename(new Date(2026, 8, 6))).toBe('nefona-rapor-2026-09-06.pdf')
    expect(csvFilename(new Date(2026, 8, 6))).toBe('nefona-veriler-2026-09-06.csv')
  })
})
