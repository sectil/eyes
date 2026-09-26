import { describe, it, expect } from 'vitest'
import { analyzeTrend, median, trendMessage } from './trend.js'

// Gün numarasından (1 = ilk gün) ISO tarih üretir, öğlen saatinde
const day = (n) => new Date(Date.UTC(2026, 0, n, 12)).toISOString().replace('Z', '')
const series = (pairs) => pairs.map(([d, logMAR]) => ({ date: day(d), logMAR }))

describe('median', () => {
  it('tek ve çift sayıda', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
    expect(median([])).toBeNull()
  })
})

describe('analyzeTrend', () => {
  it('boş', () => {
    expect(analyzeTrend([]).phase).toBe('empty')
  })

  it('ilk 7 gün alışma dönemi, uyarı yok', () => {
    const r = analyzeTrend(series([[1, 0.3], [3, 0.5], [5, 0.6]]), day(6))
    expect(r.phase).toBe('familiarization')
    expect(r.alert).toBeNull()
  })

  it('8–21. gün başlangıç oluşturuluyor', () => {
    const r = analyzeTrend(series([[1, 0.3], [8, 0.3], [10, 0.32], [12, 0.28]]), day(14))
    expect(r.phase).toBe('baseline')
    expect(r.alert).toBeNull()
  })

  // Başlangıç 0.30 olan, gürültülü ama sabit kullanıcı
  const stable = [[1, 0.35], [3, 0.3], [8, 0.3], [10, 0.28], [12, 0.32], [15, 0.3], [18, 0.31], [20, 0.29]]

  it('sabit kullanıcıda uyarı yok', () => {
    const r = analyzeTrend(series([...stable, [23, 0.33], [25, 0.27], [27, 0.36]]), day(28))
    expect(r.phase).toBe('tracking')
    expect(r.baseline).toBeCloseTo(0.3, 2)
    expect(r.alert).toBeNull()
    expect(r.trend).toBe('stable')
  })

  it('tek kötü gün uyarı üretmez', () => {
    const r = analyzeTrend(series([...stable, [23, 0.3], [25, 0.31], [27, 0.6]]), day(28))
    expect(r.alert).toBeNull()
  })

  it('3 ardışık kötü test + medyan kötüleşmesi → sarı', () => {
    const r = analyzeTrend(series([...stable, [24, 0.42], [26, 0.43], [28, 0.41]]), day(28))
    expect(r.alert).toBe('yellow')
    expect(r.trend).toBe('worsening')
  })

  it('bir hafta boyunca ≥0.2 kötü → kırmızı', () => {
    const r = analyzeTrend(series([...stable, [22, 0.55], [24, 0.52], [26, 0.56], [28, 0.54]]), day(28))
    expect(r.alert).toBe('red')
  })

  it('3 günde ≥0.2 kötü ama hafta dolmadı → kırmızı değil (sarı)', () => {
    const r = analyzeTrend(series([...stable, [26, 0.55], [27, 0.52], [28, 0.56]]), day(28))
    expect(r.alert).toBe('yellow')
  })

  it('tutarlı iyileşme → improving', () => {
    const r = analyzeTrend(series([...stable, [24, 0.18], [26, 0.17], [28, 0.19]]), day(28))
    expect(r.trend).toBe('improving')
    expect(r.alert).toBeNull()
  })

  it('seri her test için 7 günlük medyan içerir', () => {
    const r = analyzeTrend(series(stable), day(21))
    expect(r.series).toHaveLength(stable.length)
    expect(r.series.every((p) => p.rolling7 != null)).toBe(true)
  })
})

describe('trendMessage', () => {
  it('kırmızıda doktora yönlendirir', () => {
    expect(trendMessage({ phase: 'tracking', alert: 'red' })).toMatch(/göz doktoruna/)
  })
  it('iyileşmede alışma etkisini belirtir', () => {
    expect(trendMessage({ phase: 'tracking', alert: null, trend: 'improving' })).toMatch(/alışmak/)
  })
  it('uyarı yoksa "sabit" değil "doğrulanmış değişim yok"; ortanca ve ±0,2', () => {
    const m = trendMessage({ phase: 'tracking', alert: null, trend: 'stable' })
    expect(m).toMatch(/doğrulanmış bir değişim yok/)
    expect(m).toMatch(/ortanca/)
    expect(m).toMatch(/±0,2/)
    expect(m).not.toMatch(/sabit/)
  })
})

describe('eşik sınırı (kayan nokta)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  it('başlangıç 0,20, son testler tam 0,30 → sarı (0,30 − 0,20 = 0,0999… değil 0,10)', () => {
    const t = []
    for (let d = 7; d <= 21; d++) t.push({ date: D(d), logMAR: 0.2 })
    for (let d = 22; d <= 30; d++) t.push({ date: D(d), logMAR: 0.3 })
    const r = analyzeTrend(t, D(30))
    expect(r.delta).toBe(0.1)
    expect(r.alert).toBe('yellow')
  })
  it('iyileşme sınırı da simetrik: 0,30 → 0,20', () => {
    const t = []
    for (let d = 7; d <= 21; d++) t.push({ date: D(d), logMAR: 0.3 })
    for (let d = 22; d <= 30; d++) t.push({ date: D(d), logMAR: 0.2 })
    expect(analyzeTrend(t, D(30)).trend).toBe('improving')
  })
})

describe('karşılaştırılabilir seri: gözlük koşulu ve yeni baz çizgisi', async () => {
  const { comparableTests, analyzeTrend } = await import('./trend.js')
  const d = (n) => new Date(2026, 8, n).toISOString()
  it('yalnızca son testle aynı koşuldaki kayıtlar kalır', () => {
    const tests = [
      { date: d(1), logMAR: 0.3, correction: 'none' },
      { date: d(2), logMAR: 0.1, correction: 'reading' },
      { date: d(3), logMAR: 0.32, correction: 'none' },
      { date: d(4), logMAR: 0.12, correction: 'reading' },
    ]
    const c = comparableTests(tests)
    expect(c.condition).toBe('reading')
    expect(c.tests.map((t) => t.logMAR)).toEqual([0.1, 0.12])
    expect(c.dropped).toBe(2)
    expect(analyzeTrend(tests, d(5)).condition).toBe('reading')
  })
  it('newBaseline işaretinden öncesi atılır; eski kayıtlarda correction yoksa hepsi aynı koşul', () => {
    const tests = [
      { date: d(1), logMAR: 0.3, correction: 'reading' },
      { date: d(2), logMAR: 0.3, correction: 'reading' },
      { date: d(10), logMAR: 0.1, correction: 'reading', newBaseline: true },
      { date: d(11), logMAR: 0.12, correction: 'reading' },
    ]
    const c = comparableTests(tests)
    expect(c.tests.map((t) => t.logMAR)).toEqual([0.1, 0.12])
    expect(c.resetAt).toBe(d(10))
    const legacy = [{ date: d(1), logMAR: 0.3 }, { date: d(2), logMAR: 0.31 }]
    expect(comparableTests(legacy).tests).toHaveLength(2)
    expect(comparableTests([]).tests).toEqual([])
  })
})

describe('eski "glasses" kaydı yeni gözlük türleriyle aynı seri', async () => {
  const { comparableTests, sameCondition } = await import('./trend.js')
  const d = (n) => new Date(2026, 8, n).toISOString()
  it('sameCondition ve seri birleşimi', () => {
    expect(sameCondition('glasses', 'reading')).toBe(true)
    expect(sameCondition('glasses', 'contacts')).toBe(false)
    expect(sameCondition('none', 'reading')).toBe(false)
    expect(sameCondition(null, null)).toBe(true)
    const tests = [{ date: d(1), logMAR: 0.1, correction: 'glasses' }, { date: d(2), logMAR: 0.3, correction: 'none' }, { date: d(3), logMAR: 0.12, correction: 'reading' }]
    expect(comparableTests(tests).tests.map((t) => t.logMAR)).toEqual([0.1, 0.12])
  })
})
