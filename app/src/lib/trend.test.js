import { describe, it, expect } from 'vitest'
import { analyzeTrend, median, trendMessage, comparableTests, methodEra, seriesNotes, droppedNotes, METHOD_RESET_NOTE, BAND_MIN_MM, BAND_MAX_MM } from './trend.js'

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
  // İnceleme bulgusu V-N6: sahipsiz iyelik ("Başlangıcına göre") ve "tek testler bir testten diğerine" tekrarı
  it('"değişim yok" metni doğal Türkçe: "Başlangıç değerine göre", "tek bir ölçüm"; "test" sözcüğü bir kez', () => {
    expect(trendMessage({ phase: 'tracking', alert: null, trend: 'stable' })).toBe(
      'Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 7 günün ortancası ve son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.',
    )
    expect(trendMessage({ phase: 'tracking', alert: null, trend: 'stable', sparse: true })).toBe(
      // Haftalık plan (2026-09-29) olağan: "seyrek" denmez, kullanıcının kusuru gibi okunmasın
      'Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.',
    )
    for (const sparse of [false, true]) {
      const m = trendMessage({ phase: 'tracking', alert: null, trend: 'stable', sparse })
      expect(m).not.toMatch(/^Başlangıcına|bir testten diğerine|tek testler/)
      expect(m.match(/\btest/gi)).toHaveLength(1)
    }
  })
})

describe('başlangıç en az 7 test; yetmezse pencere uzar', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  // 8–21. günlerde yalnız 6 test (gün aşırı), sonra 25. günde 7. test
  const sparse = [0, 2, 4, 9, 11, 13, 15, 17, 19].map((d) => ({ date: D(d), logMAR: 0.2 }))
  it('21. günde 6 test: takip başlamaz (başlangıç sürüyor), geçici başlangıç görünür', () => {
    const r = analyzeTrend(sparse, D(22))
    expect(r.phase).toBe('baseline')
    expect(r.baseline).toBe(0.2) // geçici, 3+ testle
    expect(r.alert).toBeNull()
  })
  it('7. test 25. günde: 26. günden itibaren takip, başlangıç 7. testi içerir', () => {
    const t = [...sparse, { date: D(24), logMAR: 0.26 }]
    expect(analyzeTrend(t, D(24)).phase).toBe('baseline')
    const r = analyzeTrend(t, D(25))
    expect(r.phase).toBe('tracking')
    expect(r.baseline).toBe(0.2) // 7 testin ortancası
  })
  it('seyrek kullanıcı da sonunda takibe geçer (asla takılı kalmaz)', () => {
    const weekly = Array.from({ length: 10 }, (_, i) => ({ date: D(i * 7), logMAR: 0.2 }))
    expect(analyzeTrend(weekly, D(9 * 7 + 1)).phase).toBe('tracking')
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

// ---------- E testi yeniden tasarımı (plan H3–H5, kararlar S5, S6, S8, S9) ----------
describe('mesafe modu: kamerasız ölçümler ayrı seri (S5)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  // 30 gün kameralı ölçüm (gerçek 0,20, 40 cm). Sonra kamera kapalı, telefon 55 cm'de: harf 40 cm varsayımıyla
  // çizildiği için kayıt log10(550/400) = +0,138 kötü görünür (görme değişmedi).
  const tracked = Array.from({ length: 30 }, (_, n) => ({ date: D(n), logMAR: 0.2, correction: 'reading', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4' }))
  const at55 = +(0.2 + Math.log10(550 / 400)).toFixed(3)
  const untracked = Array.from({ length: 7 }, (_, i) => ({ date: D(30 + i), logMAR: at55, correction: 'reading', distanceTracked: false, meanDistanceMm: null, algorithm: 'descent-zest-v4' }))

  it('kamerasız kayıt kameralı seriye girmez; son test kamerasızsa seri yalnız kamerasız kayıtlardır', () => {
    const c = comparableTests([...tracked, ...untracked])
    expect(c.distanceTracked).toBe(false)
    expect(c.tests).toHaveLength(7)
    expect(c.tests.every((t) => t.distanceTracked === false)).toBe(true)
    expect(c.droppedBy.distance).toBe(30)
    expect(c.dropped).toBe(30)
    // Son test kameralıysa kamerasız kayıtlar atılır
    const back = comparableTests([...tracked, ...untracked, { ...tracked[0], date: D(37) }])
    expect(back.distanceTracked).toBe(true)
    expect(back.tests).toHaveLength(31)
    expect(back.droppedBy.distance).toBe(7)
  })

  it('55 cm senaryosu: görme değişmeden sahte sarı uyarı çıkmaz', () => {
    const r = analyzeTrend([...tracked, ...untracked], D(36))
    expect(r.alert).toBeNull()
    expect(r.trend).not.toBe('worsening')
    expect(r.phase).toBe('familiarization') // kamerasız seri yeni başladı
    expect(seriesNotes(r)).toContain('Mesafe ölçülmedi · 40 cm varsayıldı')
  })

  it('30 cm senaryosu: sahte "iyileşiyor" çıkmaz', () => {
    const at30 = +(0.2 + Math.log10(300 / 400)).toFixed(3)
    const u30 = untracked.map((t) => ({ ...t, logMAR: at30 }))
    const r = analyzeTrend([...tracked, ...u30], D(36))
    expect(r.trend).not.toBe('improving')
  })

  it('distanceTracked alanı olmayan eski/elle kayıt kameralı sayılır', () => {
    const c = comparableTests([{ date: D(0), logMAR: 0.2 }, { date: D(1), logMAR: 0.2, distanceTracked: true }])
    expect(c.tests).toHaveLength(2)
    expect(c.distanceTracked).toBe(true)
  })

  it('örtme yöntemi seri anahtarı değildir (S8)', () => {
    const methods = ['camera-depth', 'camera-lid+self', 'camera-self', 'self-report']
    const ts = methods.map((method, i) => ({ date: D(i), logMAR: 0.2, algorithm: 'descent-zest-v4', distanceTracked: true, meanDistanceMm: 400, occlusion: { method } }))
    expect(comparableTests(ts).tests).toHaveLength(4)
  })
})

describe('ölçüm yöntemi v4: yeni seri ve not (S6)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  const v3 = Array.from({ length: 30 }, (_, n) => ({ date: D(n), logMAR: 0.2, correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: n < 5 ? undefined : 'descent-zest-v3' }))
  const v4 = [30, 31, 32].map((n) => ({ date: D(n), logMAR: 0.35, correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4' }))

  it('methodEra: v3 ve alan yok → 0; v4 → 4', () => {
    expect(methodEra(undefined)).toBe(0)
    expect(methodEra('descent-zest-v3')).toBe(0)
    expect(methodEra('descent-zest-v4')).toBe(4)
  })

  it('v4 kaydı eski kayıtlarla karşılaştırılmaz; seri yeniden alışma döneminde; not görünür', () => {
    const c = comparableTests([...v3, ...v4])
    expect(c.tests.map((t) => t.algorithm)).toEqual(['descent-zest-v4', 'descent-zest-v4', 'descent-zest-v4'])
    expect(c.droppedBy.method).toBe(30)
    expect(c.methodReset).toBe(true)
    const r = analyzeTrend([...v3, ...v4], D(32))
    expect(r.phase).toBe('familiarization')
    expect(r.alert).toBeNull()
    expect(r.methodReset).toBe(true)
    expect(seriesNotes(r)).toEqual(['Ölçüm yöntemi güncellendi; yeni seri.'])
    expect(METHOD_RESET_NOTE).toBe('Ölçüm yöntemi güncellendi; yeni seri.')
  })

  it('yalnız eski kayıtlar: seri eskisi gibi (v3 ve alanı olmayanlar birlikte), not yok', () => {
    const r = analyzeTrend(v3, D(29))
    expect(r.methodReset).toBe(false)
    expect(r.dropped).toBe(0)
    expect(seriesNotes(r)).toEqual([])
    expect(r.phase).toBe('tracking')
  })

  it('yalnız v4 kayıtları: not yok', () => {
    expect(comparableTests(v4).methodReset).toBe(false)
  })
})

describe('eski yöntemde bant dışı kayıtlar ayrılır (H3)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  // Uyumu azalmış presbiyop, görme değişmedi: 40 cm'de ≈0,265, 60 cm'de ≈0,126 ölçülür (plan f6 simülasyonu)
  const at40 = Array.from({ length: 28 }, (_, n) => ({ date: D(n), logMAR: 0.265, correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v3' }))
  const at60 = Array.from({ length: 7 }, (_, i) => ({ date: D(28 + i), logMAR: 0.126, correction: 'none', distanceTracked: true, meanDistanceMm: 600, algorithm: 'descent-zest-v3' }))

  it('40 cm başlangıç, sonra 60 cm testleri: sahte "iyileşiyor" yok', () => {
    const r = analyzeTrend([...at40, ...at60], D(34))
    expect(r.trend).not.toBe('improving')
    expect(r.droppedBy.band).toBe(28)
  })

  it('tersi (60 cm başlangıç, sonra 40 cm): sahte sarı yok', () => {
    const a = Array.from({ length: 28 }, (_, n) => ({ ...at60[0], date: D(n) }))
    const b = Array.from({ length: 7 }, (_, i) => ({ ...at40[0], date: D(28 + i) }))
    // 60 cm'lik 28 kayıt ayrı; seri 40 cm'lik kayıtlarla başlar (eski kuralda +0,139 sarı)
    const r = analyzeTrend([...a, ...b], D(34))
    expect(r.alert).toBeNull()
    expect(r.trend).not.toBe('worsening')
    expect(r.droppedBy.band).toBe(28)
  })

  it('sınırlar dahil: 360 ve 440 mm bant içi; 359 ve 441 dışı', () => {
    const mk = (mm, n) => ({ date: D(n), logMAR: 0.2, distanceTracked: true, meanDistanceMm: mm, algorithm: 'descent-zest-v3' })
    expect(comparableTests([mk(360, 0), mk(440, 1), mk(400, 2)]).tests).toHaveLength(3)
    expect(comparableTests([mk(359, 0), mk(441, 1), mk(400, 2)]).tests).toHaveLength(1)
    expect(BAND_MIN_MM).toBe(360)
    expect(BAND_MAX_MM).toBe(440)
  })

  it('yakın (< 36 cm) ve uzak (> 44 cm) eski kayıtlar da ayrı seri: ters yönlü sapmalar karışmaz', () => {
    const mk = (mm, n) => ({ date: D(n), logMAR: mm < 400 ? -0.05 : 0.2, correction: 'none', distanceTracked: true, meanDistanceMm: mm, algorithm: 'descent-zest-v3' })
    const alt = Array.from({ length: 20 }, (_, n) => mk(n % 2 ? 300 : 560, n))
    const c = comparableTests(alt)
    // son kayıt 300 mm (yakın): seri yalnız yakın kayıtlar
    expect([...new Set(c.tests.map((t) => t.meanDistanceMm))]).toEqual([300])
    expect(c.tests).toHaveLength(10)
    expect(c.droppedBy.band).toBe(10)
    const far = comparableTests([...alt, mk(580, 20)])
    expect([...new Set(far.tests.map((t) => t.meanDistanceMm))].sort()).toEqual([560, 580])
  })

  it('v4 kayıtlarına bant ayrımı uygulanmaz (v4 zaten yalnız bantta sayar)', () => {
    const mk = (mm, n) => ({ date: D(n), logMAR: 0.2, distanceTracked: true, meanDistanceMm: mm, algorithm: 'descent-zest-v4' })
    expect(comparableTests([mk(445, 0), mk(400, 1)]).tests).toHaveLength(2)
  })
})

describe('newBaseline her mesafe modunda aynı gözlük koşulunu sıfırlar', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  it('kamerasız testte "numaram değişti" → kameralı seri de o testten sonra başlar', () => {
    const base = { correction: 'reading', algorithm: 'descent-zest-v4', meanDistanceMm: 400 }
    const ts = [
      { ...base, date: D(0), logMAR: 0.3, distanceTracked: true },
      { ...base, date: D(1), logMAR: 0.3, distanceTracked: true },
      { ...base, date: D(2), logMAR: 0.1, distanceTracked: false, newBaseline: true },
      { ...base, date: D(3), logMAR: 0.1, distanceTracked: true },
    ]
    const c = comparableTests(ts)
    expect(c.tests.map((t) => t.date)).toEqual([D(3)])
    expect(c.resetAt).toBe(D(2))
    expect(c.droppedBy).toMatchObject({ distance: 1, reset: 2 })
  })
  it('seriyi etkilemeyen eski sıfırlama resetAt vermez', () => {
    const ts = [
      { date: D(0), logMAR: 0.3, correction: 'reading', algorithm: 'descent-zest-v3', newBaseline: true },
      { date: D(1), logMAR: 0.3, correction: 'reading', algorithm: 'descent-zest-v4' },
    ]
    const c = comparableTests(ts)
    expect(c.resetAt).toBeNull()
    expect(c.tests).toHaveLength(1)
  })
})

describe('seyrek seri: kırmızı için son 3 test (S9), uyarı zamanla kaybolmaz (H5)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  // İki göz (OU) yalnız haftalık: 10. testten itibaren +0,35 kayıp
  const weekly = (bad) => Array.from({ length: 14 }, (_, i) => ({ date: D(i * 7), logMAR: bad(i + 1) }))
  const alertsAtEachTest = (ts) => ts.map((t, i) => analyzeTrend(ts.slice(0, i + 1), t.date).alert)

  it('haftalık kayıp: 12. testte kırmızı (öncesinde uyarı yok)', () => {
    const a = alertsAtEachTest(weekly((k) => (k >= 10 ? 0.35 : 0)))
    expect(a.slice(0, 11)).toEqual(Array(11).fill(null))
    expect(a[11]).toBe('red')
    expect(a[12]).toBe('red')
    const r = analyzeTrend(weekly((k) => (k >= 10 ? 0.35 : 0)).slice(0, 12), D(11 * 7))
    expect(r.sparse).toBe(true)
    expect(trendMessage(r)).toMatch(/Son 3 ölçümün de/)
    expect(trendMessage(r)).not.toMatch(/bir haftadır/)
  })

  it('haftalıkta tek ya da iki kötü test kırmızı vermez', () => {
    expect(alertsAtEachTest(weekly((k) => (k === 11 ? 0.25 : 0))).every((x) => x == null)).toBe(true)
    expect(alertsAtEachTest(weekly((k) => (k === 11 || k === 12 ? 0.25 : 0))).every((x) => x == null)).toBe(true)
  })

  it('günlük davranış değişmedi: 40. günden +0,35 → 43. gün sarı, 46. gün kırmızı', () => {
    const d = Array.from({ length: 48 }, (_, i) => ({ date: D(i), logMAR: i + 1 >= 40 ? 0.35 : 0 }))
    const at = (day) => analyzeTrend(d.slice(0, day), D(day - 1)).alert
    expect([40, 41, 42].map(at)).toEqual([null, null, null])
    expect([43, 44, 45].map(at)).toEqual(['yellow', 'yellow', 'yellow'])
    expect([46, 47, 48].map(at)).toEqual(['red', 'red', 'red'])
    expect(analyzeTrend(d.slice(0, 46), D(45)).sparse).toBe(false)
  })

  it('son testten 7 günden fazla geçince sarı kaybolmaz (son 3 testin ortancası)', () => {
    // 8 günde bir test; 11. testten itibaren +0,15
    const ts = Array.from({ length: 13 }, (_, i) => ({ date: D(i * 8), logMAR: i + 1 >= 11 ? 0.15 : 0 }))
    for (const wait of [0, 7, 8, 20]) {
      const r = analyzeTrend(ts, D(12 * 8 + wait))
      expect(r.alert).toBe('yellow')
      expect(r.trend).toBe('worsening')
    }
    const late = analyzeTrend(ts, D(12 * 8 + 10))
    expect(late.current7).toBeNull() // "Son 7 gün" etiketi yalan söylemez
    expect(late.current).toBe(0.15)
    expect(late.currentWindow).toBe('last3')
    expect(late.delta).toBe(0.15)
  })

  it('yalnız beklemek sarıyı kırmızıya çevirmez (3 günlük kötü seri, 5 gün sonra)', () => {
    const t = []
    for (let d = 7; d <= 21; d++) t.push({ date: D(d), logMAR: 0.2 })
    for (const d of [26, 27, 28]) t.push({ date: D(d), logMAR: 0.5 })
    expect(analyzeTrend(t, D(28)).alert).toBe('yellow')
    expect(analyzeTrend(t, D(33)).alert).toBe('yellow')
    expect(analyzeTrend(t, D(40)).alert).toBe('yellow')
  })

  it('günlük kırmızı, test bırakılınca sarıya düşmez', () => {
    const d = Array.from({ length: 46 }, (_, i) => ({ date: D(i), logMAR: i + 1 >= 40 ? 0.35 : 0 }))
    for (const day of [47, 51, 53, 80]) expect(analyzeTrend(d, D(day - 1)).alert).toBe('red')
  })

  it('seyrek seride sarı ve "değişim yok" metinleri son 3 teste dayanır', () => {
    expect(trendMessage({ phase: 'tracking', alert: 'yellow', sparse: true })).not.toMatch(/birkaç gün/)
    const m = trendMessage({ phase: 'tracking', alert: null, trend: 'stable', sparse: true })
    expect(m).toMatch(/son 3 testle/)
    expect(m).not.toMatch(/son 7 günün/)
    expect(m).toMatch(/±0,2/)
    // sık ölçülen (seyrek olmayan) seride kırmızı metni aynı; sarı iki yolda da "sonraki testlerde de sürerse"
    // (2026-09-29: E testi haftada bir; hiçbir metin her gün test istemez)
    expect(trendMessage({ phase: 'tracking', alert: 'red', sparse: false })).toMatch(/Son bir haftadır/)
    for (const sparse of [false, true]) {
      const y = trendMessage({ phase: 'tracking', alert: 'yellow', sparse })
      expect(y).toBe('Son ölçümlerin başlangıcından biraz kötü. Işığı ve mesafeyi kontrol et; sonraki testlerde de sürerse göz doktoruna danış.')
      expect(y).not.toMatch(/birkaç gün/)
    }
  })
})

describe('seriye girmeyen kayıtların notu: nedeniyle (Gelişim, rapor)', () => {
  const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
  const base = { correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4' }

  it('yöntem değişikliği: yalnız S6 notu; "farklı koşul" denmez', () => {
    const v3 = Array.from({ length: 30 }, (_, n) => ({ ...base, date: D(n), logMAR: 0.1, algorithm: 'descent-zest-v3' }))
    const r = analyzeTrend([...v3, { ...base, date: D(31), logMAR: 0.1 }], D(31))
    expect(seriesNotes(r)).toEqual(['Ölçüm yöntemi güncellendi; yeni seri.'])
    expect(droppedNotes(r)).toEqual([])
    expect([...seriesNotes(r), ...droppedNotes(r)].join(' ')).not.toMatch(/koşul/)
  })

  it('kamerasız / kameralı, eski bant, gözlük koşulu ve yeni gözlük ayrı cümleler', () => {
    const cam = Array.from({ length: 3 }, (_, n) => ({ ...base, date: D(n), logMAR: 0.1 }))
    const noCam = { ...base, date: D(5), logMAR: 0.1, distanceTracked: false, meanDistanceMm: null }
    const r1 = analyzeTrend([...cam, noCam], D(5))
    expect(seriesNotes(r1)).toEqual(['Mesafe ölçülmedi · 40 cm varsayıldı'])
    expect(droppedNotes(r1)).toEqual(['Kamerayla yapılan 3 ölçüm bu seriye girmiyor.'])
    const r2 = analyzeTrend([noCam, ...cam.map((t) => ({ ...t, date: D(6 + cam.indexOf(t)) }))], D(9))
    expect(droppedNotes(r2)).toEqual(['Kamerasız 1 ölçüm bu seriye girmiyor.'])
    const glasses = Array.from({ length: 2 }, (_, n) => ({ ...base, date: D(n), logMAR: 0.1, correction: 'reading' }))
    const r3 = analyzeTrend([...glasses, { ...base, date: D(4), logMAR: 0.1 }], D(4))
    expect(droppedNotes(r3)).toEqual(['Farklı gözlük/lens koşulundaki 2 ölçüm bu seriye girmiyor.'])
    const reset = [{ ...base, date: D(0), logMAR: 0.1, correction: 'reading' }, { ...base, date: D(1), logMAR: 0.1, correction: 'reading', newBaseline: true }]
    expect(droppedNotes(analyzeTrend(reset, D(1)))).toEqual(['Gözlük yenilenmeden önceki 1 ölçüm bu seriye girmiyor.'])
    const legacy = [{ ...base, date: D(0), logMAR: 0.1, algorithm: 'descent-zest-v3', meanDistanceMm: 560 }, { ...base, date: D(1), logMAR: 0.1, algorithm: 'descent-zest-v3' }]
    expect(droppedNotes(analyzeTrend(legacy, D(1)))).toEqual(['Farklı mesafede yapılan 1 eski ölçüm bu seriye girmiyor.'])
  })

  it('hiçbir şey düşmediyse boş', () => {
    expect(droppedNotes(analyzeTrend([{ ...base, date: D(0), logMAR: 0.1 }], D(0)))).toEqual([])
    expect(droppedNotes(null)).toEqual([])
  })
})
