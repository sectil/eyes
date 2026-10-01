// Ölçü kuralı v2 (gelisim-merkezi PLAN.v1 §3.3; onaylı SONSUZ_YOL.PLAN.v1 §3.B.3 ve §G.6 "progress.test.js v2 bloğu":
// alışma, aynı gün beş tur tek nokta, başlangıç donar, tek haftalık sapma "değişim yok", iki haftalık sapma "worse",
// SD tabanı). Eski kural (metricTrend, status) progress.test.js'te aynen sınanır; bu dosya yalnız yeni verdict'i sınar.
import { describe, it, expect } from 'vitest'
import { metricStatusV2, dailyMedians, metricCards, V2, v2Params } from './progress.js'

// 2026-06-01 Pazartesi (yerel). d(i): o günden i gün sonra, yerel saat h
const d = (i, h = 10, m = 0) => new Date(2026, 5, 1 + i, h, m).toISOString()
const at = (i, h = 20) => new Date(2026, 5, 1 + i, h)
const pts = (list) => list.map(([i, value, h]) => ({ date: d(i, h ?? 10), value }))
// alışma günü 0 (değerlendirilmez), başlangıç 1–6. günler: ortanca 100, SD ≈ 1,4
const BASE = [[0, 500], [1, 100], [2, 102], [3, 98], [4, 101], [5, 99], [6, 100]]
const week = (mon, v) => [[mon + 1, v], [mon + 2, v], [mon + 3, v]] // Salı, Çarşamba, Perşembe

describe('ölçü kuralı v2', () => {
  it('günlük toplama: aynı günün beş turu tek nokta (ortanca)', () => {
    const p = [60, 62, 64, 66, 68].map((v, i) => ({ date: d(0, 10, i * 5), value: v }))
    const days = dailyMedians([...p, { date: d(1), value: 70 }])
    expect(days.map((x) => x.value)).toEqual([64, 70])
    expect(days[0].n).toBe(5)
  })

  it('başlangıç oluşana dek "start"; alışma günü başlangıca girmez', () => {
    expect(metricStatusV2(pts(BASE.slice(0, 6)), { now: at(6) }).verdict).toBe('start')
    const v = metricStatusV2(pts(BASE), { now: at(7) })
    expect(v.verdict).toBe('start') // başlangıç hazır, ilk Pazartesi bakışı için 3 ölçüm günü yok
    expect(v.baseline).toBe(100) // 500 (alışma) girmedi
    expect(v.measureDays).toBe(7)
  })

  it('başlangıç bir kez oluşur, sonra değişmez', () => {
    const later = Array.from({ length: 30 }, (_, i) => [8 + i, 140])
    const v = metricStatusV2(pts([...BASE, ...later]), { now: at(40) })
    expect(v.baseline).toBe(100)
    expect(v.current).toBe(140)
  })

  it('tek haftalık sapma değişim sayılmaz; iki haftalık bakışta sürerse "worse"', () => {
    const steady = [...BASE, ...week(7, 100)] // 15 Haziran bakışı: aynı
    const dip = [...steady, ...week(14, 90)] // 22 Haziran bakışı: düşük (1. kez)
    // ilk bakışta görülen fark doğrulanmayı bekliyor: "değişim yok" değil, "henüz belli değil"
    expect(metricStatusV2(pts(dip), { now: at(22) }).verdict).toBe('unclear')
    expect(metricStatusV2(pts([...dip, ...week(21, 100)]), { now: at(29) }).verdict).toBe('same') // geri döndü
    const two = metricStatusV2(pts([...dip, ...week(21, 90)]), { now: at(29) })
    expect(two.verdict).toBe('worse')
    expect(two.looks).toBe(3)
  })

  it('bakış haftada bir (Pazartesi): bakıştan sonraki ölçüm bir sonraki bakışa dek hükmü değiştirmez', () => {
    const two = [...BASE, ...week(7, 100), ...week(14, 90), ...week(21, 90)]
    expect(metricStatusV2(pts(two), { now: at(27) }).verdict).toBe('unclear') // 28 Haziran Pazar: ikinci bakış henüz yok
    expect(metricStatusV2(pts(two), { now: at(27, 23) }).verdict).toBe('unclear')
    expect(metricStatusV2(pts(two), { now: new Date(2026, 5, 29, 0, 1) }).verdict).toBe('worse') // Pazartesi 00.01
  })

  it('yeni ölçüm yoksa bakış sayılmaz: tek bir 3 günlük dilim iki hafta sürmüş sayılmaz (K3)', () => {
    // başlangıç (100), sonra yalnız Salı–Perşembe 200, sonra hiç ölçüm yok
    const one = [...BASE, ...week(7, 200)]
    const v15 = metricStatusV2(pts(one), { now: at(15) }) // 15 Haziran: ilk bakış
    expect(v15).toMatchObject({ verdict: 'unclear', looks: 1 })
    // sonraki Pazartesiler aynı üç günü yeniden saymaz: hüküm doğrulanmadan kalır, sayaç artmaz
    for (const day of [22, 29, 36]) expect(metricStatusV2(pts(one), { now: at(day) })).toMatchObject({ verdict: 'unclear', looks: 1 })
    // üç gün 28 günlük pencereden çıkınca da "henüz belli değil" (eski veri bugünü anlatmaz)
    expect(metricStatusV2(pts(one), { now: at(50) }).verdict).toBe('unclear')
    // yeni ölçümle ikinci bakış gelince doğrulanır
    expect(metricStatusV2(pts([...one, ...week(21, 200)]), { now: at(29) })).toMatchObject({ verdict: 'better', looks: 2 })
  })

  it('ilk bakışta fark yoksa "değişim yok"; fark görülüp doğrulanmadıysa "henüz belli değil"', () => {
    expect(metricStatusV2(pts([...BASE, ...week(7, 100)]), { now: at(15) }).verdict).toBe('same')
    expect(metricStatusV2(pts([...BASE, ...week(7, 130)]), { now: at(15) }).verdict).toBe('unclear')
    // geri dönen fark: son bakış "aynı" → değişim yok
    expect(metricStatusV2(pts([...BASE, ...week(7, 130), ...week(14, 100)]), { now: at(22) }).verdict).toBe('same')
  })

  it('düşük daha iyi ölçü (ms): azalma "better"', () => {
    const b = BASE.map(([i, v]) => [i, v + 100]) // 200 civarı
    const v = metricStatusV2(pts([...b, ...week(7, 170), ...week(14, 170)]), { better: 'down', now: at(22), sdFloor: 10 })
    expect(v.verdict).toBe('better')
  })

  it('SD tabanı: sabit başlangıçta küçük oynama değişim değildir', () => {
    const flat = [[0, 100], ...[1, 2, 3, 4, 5, 6].map((i) => [i, 100])]
    expect(metricStatusV2(pts([...flat, ...week(7, 110), ...week(14, 110)]), { now: at(22), sdFloor: 10 }).verdict).toBe('same') // 10 < 1,5 × 10
    expect(metricStatusV2(pts([...flat, ...week(7, 120), ...week(14, 120)]), { now: at(22), sdFloor: 10 }).verdict).toBe('better')
    // tabansız (SD 0) her fark değişim olurdu
    expect(metricStatusV2(pts([...flat, ...week(7, 101), ...week(14, 101)]), { now: at(22), sdFloor: 0 }).verdict).toBe('better')
  })

  it('yayımlanmış eşik varsa c × SD yerine o', () => {
    const v = metricStatusV2(pts([...BASE, ...week(7, 109), ...week(14, 109)]), { now: at(22), meaningful: 10 })
    expect(v.verdict).toBe('same')
    expect(metricStatusV2(pts([...BASE, ...week(7, 110), ...week(14, 110)]), { now: at(22), meaningful: 10 }).verdict).toBe('better')
  })

  it('son 28 günde 3 ölçüm günü yoksa "henüz belli değil" (eski veri bugünü anlatmaz)', () => {
    const p = [...BASE, ...week(7, 120), ...week(14, 120)]
    expect(metricStatusV2(pts(p), { now: at(22) }).verdict).toBe('better')
    expect(metricStatusV2(pts(p), { now: at(60) }).verdict).toBe('unclear')
  })

  it('değişim kuralı olmayan metrik (Bugünün görevi) hiçbir zaman better/worse olmaz', () => {
    const p = [...BASE, ...week(7, 200), ...week(14, 200)]
    expect(metricStatusV2(pts(p), { now: at(22), ...v2Params({ key: 'notice-count', unit: 'kez' }) }).verdict).toBe('unclear')
  })

  it('parametreler: görev metriklerinde alışma 2 gün; harf 0,5 ve ms 10 SD tabanı (onaylı §3.B.6)', () => {
    expect(V2).toMatchObject({ familiar: 1, baseDays: 6, currentDays: 3, c: 1.5, persist: 2 })
    expect(v2Params({ key: 'quick-look-threshold', unit: 'ms' })).toMatchObject({ familiar: 2, sdFloor: 10 })
    expect(v2Params({ key: 'tek-bakis-span', unit: 'harf' })).toMatchObject({ familiar: 2, sdFloor: 0.5 })
  })

  it('metricCards: status (eski kural) yerinde, verdict (v2) eklenir', () => {
    const sessions = [...BASE, ...week(7, 100)].map(([i, v]) => ({ type: 'quick-look', date: d(i), threshold: v }))
    const c = metricCards({ sessions, now: at(15) }).find((x) => x.key === 'quick-look-threshold')
    expect(c.status).toBeDefined()
    expect(['start', 'same', 'better', 'worse', 'unclear']).toContain(c.verdict)
    expect(c.v2.baseline).toBeTypeOf('number')
  })
})
