// Haftalık E testi (karar 2026-09-29: ilk günden haftada bir) için başlangıç ve değişim kuralı (lib/trend.js
// WEEKLY_MIN_BASELINE_TESTS). Kural, kanıt ve simülasyon: haftalık kural notu (çalışma belgesi rule.md). Günlük
// geçmişi olan kullanıcının başlangıcı ve uyarıları değişmez.
// Tür alanı olmayan kayıtlar (eski test verisi) haftalık yola girmez: onlarla değişiklikten önceki kural sınanır.
import { describe, it, expect } from 'vitest'
import { analyzeTrend, trendMessage, seriesNotes, WEEKLY_MIN_BASELINE_TESTS, WEEKLY_PLAN_NOTE, MIN_BASELINE_TESTS } from './trend.js'
import { pickSeries } from './vaSeries.js'

const D = (n) => new Date(Date.UTC(2026, 0, n, 9)).toISOString() // n = gün (1 = ilk gün)
// Haftalık test k (1..): gün 1 + 7(k−1)
const wk = (vals, type = 'va-weekly') => vals.map((v, i) => ({ date: D(1 + 7 * i), logMAR: v, type }))
const at = (ts, k) => analyzeTrend(ts.slice(0, k), ts[k - 1].date)
const untyped = (ts) => ts.map(({ type, ...t }) => t) // değişiklikten önceki kural (günlük yol)
const alerts = (ts) => ts.map((_, i) => at(ts, i + 1).alert)

describe('haftalık yol: başlangıcın zamanı', () => {
  const flat = wk(Array(20).fill(0.1))
  it('sabitler: 3 haftalık testle başlar, 7 teste büyür', () => {
    expect(WEEKLY_MIN_BASELINE_TESTS).toBe(3)
    expect(MIN_BASELINE_TESTS).toBe(7)
  })
  it('1. test alışma, 2.–3. test başlangıç oluşuyor, 4. testte (22. gün) takip', () => {
    expect(at(flat, 1)).toMatchObject({ phase: 'familiarization', baselineMode: 'weekly' })
    expect(at(flat, 2).phase).toBe('baseline')
    expect(at(flat, 3).phase).toBe('baseline')
    const r = at(flat, 4)
    expect(flat[3].date).toBe(D(22))
    expect(r).toMatchObject({ phase: 'tracking', baselineMode: 'weekly', baselineTests: 3, baseline: 0.1 })
    // 21. günde (3. testten 6 gün sonra, 4. test yapılmadan) henüz takip yok
    expect(analyzeTrend(flat.slice(0, 3), D(21)).phase).toBe('baseline')
  })
  it('değişiklikten önceki kuralla aynı seri ancak 8. testten sonra (51. gün) takibe geçerdi', () => {
    expect(at(untyped(flat), 4).phase).toBe('baseline')
    expect(analyzeTrend(untyped(flat).slice(0, 8), D(50)).phase).toBe('baseline')
    expect(analyzeTrend(untyped(flat).slice(0, 8), D(51)).phase).toBe('tracking')
  })
  it('başlangıç 7 teste büyür; değerlendirilen son 3 test başlangıca girmez', () => {
    expect([5, 6, 7, 8, 9, 10, 11, 12].map((k) => at(flat, k).baselineTests)).toEqual([3, 3, 3, 4, 5, 6, 7, 7])
  })
  it('7 teste büyüyünce başlangıç önceki kuralın başlangıcıyla aynı (eski yalnız-haftalık seriler değişmez)', () => {
    const noisy = wk([0.2, 0.1, 0.15, 0.05, 0.12, 0.08, 0.2, 0.1, 0.11, 0.09, 0.1, 0.13, 0.07, 0.1])
    for (const k of [11, 12, 13, 14]) expect(at(noisy, k).baseline).toBe(at(untyped(noisy), k).baseline)
  })
  it('hızlı tempo: 3 haftalık test 18. günde bitse de değerlendirme 22. günde', () => {
    const fast = [1, 8, 13, 18].map((d) => ({ date: D(d), logMAR: 0.1, type: 'va-weekly' }))
    expect(analyzeTrend(fast, D(18)).phase).toBe('baseline')
    expect(trendMessage(analyzeTrend(fast, D(18)))).toBe('Başlangıç için 3 haftalık test tamam; değerlendirme 22. günde başlar.')
    expect(analyzeTrend(fast, D(21)).phase).toBe('baseline')
    expect(analyzeTrend(fast, D(22)).phase).toBe('tracking')
  })
  it('atlanan hafta: başlangıç 3. haftalık testi bekler (gün sayısıyla değil)', () => {
    const skip = [1, 8, 22, 29].map((d) => ({ date: D(d), logMAR: 0.1, type: 'va-weekly' }))
    expect(analyzeTrend(skip.slice(0, 3), D(28)).phase).toBe('baseline')
    expect(analyzeTrend(skip, D(29))).toMatchObject({ phase: 'tracking', baselineTests: 3 })
  })
})

describe('haftalık yol: metinler (doğal Türkçe, sayaç)', () => {
  const flat = wk(Array(20).fill(0.1))
  it('alışma ve başlangıç dönemi', () => {
    expect(trendMessage(at(flat, 1))).toBe('Alışma dönemi. İlk haftalık testin sonucu, testi yeni öğrendiğin için biraz farklı çıkabilir; değerlendirmeye katılmaz.')
    // 8. gün, 2. test yapılmadan: 0 test
    expect(trendMessage(analyzeTrend(flat.slice(0, 1), D(8)))).toBe('Başlangıç değerin sonraki 3 haftalık testle oluşacak. Şimdilik değişim yorumlanmıyor.')
    expect(trendMessage(at(flat, 2))).toBe('Başlangıç değerin 3 haftalık testle oluşuyor; 1 test tamam. Şimdilik değişim yorumlanmıyor.')
    expect(trendMessage(at(flat, 3))).toBe('Başlangıç değerin 3 haftalık testle oluşuyor; 2 test tamam. Şimdilik değişim yorumlanmıyor.')
    for (const k of [1, 2, 3]) expect(trendMessage(at(flat, k))).not.toMatch(/8\. gün|7 test|21\. gün/)
  })
  it('büyüyen başlangıç notu 7 teste kadar görünür, sonra kalkar', () => {
    // "N testle" (N haftalık testle değil): büyüyen başlangıç isteğe bağlı kısa testleri de içerir
    expect(seriesNotes(at(flat, 4))).toEqual(['Başlangıç değerin 3 testle hesaplandı; yeni testlerle 7 teste kadar güçlenecek.'])
    expect(seriesNotes(at(flat, 9))).toEqual(['Başlangıç değerin 5 testle hesaplandı; yeni testlerle 7 teste kadar güçlenecek.'])
    expect(seriesNotes(at(flat, 11))).toEqual([])
    expect(seriesNotes(at(flat, 2))).toEqual([]) // takipte değil
  })
  it('takipte "değişim yok" metni "seyrek" demez; ±0,2 cümlesi korunur', () => {
    const m = trendMessage(at(flat, 6))
    expect(m).toBe('Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.')
    expect(m).not.toMatch(/seyrek/)
  })
  it('haftalık plan notu: 22. gün ve 3 test', () => {
    expect(WEEKLY_PLAN_NOTE).toBe('E testi haftada bir. İlk test alışmadır; sonraki 3 haftalık test başlangıç değerini oluşturur, değerlendirme en erken 22. günde başlar.')
  })
})

describe('haftalık yol: değişim kuralı S9 (art arda 3 test)', () => {
  it('tek kötü hafta uyarı vermez (sarı da kırmızı da)', () => {
    for (const k of [6, 9, 12]) {
      const one = wk(Array.from({ length: 14 }, (_, i) => (i + 1 === k ? 0.4 : 0)))
      expect(alerts(one).every((x) => x == null)).toBe(true)
    }
  })
  it('iki kötü hafta da uyarı vermez', () => {
    const two = wk(Array.from({ length: 14 }, (_, i) => (i + 1 === 9 || i + 1 === 10 ? 0.3 : 0)))
    expect(alerts(two).every((x) => x == null)).toBe(true)
  })
  it('art arda 3 kötü hafta (+0,15): 3. kötü testte sarı, öncesinde uyarı yok', () => {
    const ts = wk(Array.from({ length: 14 }, (_, i) => (i + 1 >= 9 ? 0.15 : 0)))
    const a = alerts(ts)
    expect(a.slice(0, 10)).toEqual(Array(10).fill(null)) // 9. ve 10. test: 1. ve 2. kötü hafta
    expect(a.slice(10)).toEqual(['yellow', 'yellow', 'yellow', 'yellow'])
    expect(trendMessage(at(ts, 11))).toBe('Son ölçümlerin başlangıcından biraz kötü. Işığı ve mesafeyi kontrol et; sonraki testlerde de sürerse göz doktoruna danış.')
  })
  it('art arda 3 kötü hafta (+0,25): 3. kötü testte kırmızı; metin "son 3 ölçüm"', () => {
    const ts = wk(Array.from({ length: 14 }, (_, i) => (i + 1 >= 9 ? 0.25 : 0)))
    const a = alerts(ts)
    expect(a.slice(0, 10)).toEqual(Array(10).fill(null))
    expect(a[10]).toBe('red')
    expect(trendMessage(at(ts, 11))).toBe('Son 3 ölçümün de başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.')
  })
  it('5. haftadan +0,35: 7. testte kırmızı; önceki kuralda kayıp başlangıca karışır, hiç uyarı çıkmazdı', () => {
    const ts = wk(Array.from({ length: 14 }, (_, i) => (i + 1 >= 5 ? 0.35 : 0)))
    const a = alerts(ts)
    expect(a.slice(0, 6)).toEqual(Array(6).fill(null))
    expect(a.slice(6).every((x) => x === 'red')).toBe(true)
    expect(alerts(untyped(ts)).every((x) => x == null)).toBe(true)
  })
  it('uyarı başlangıca karışıp kaybolmaz (büyüme durur)', () => {
    const ts = wk(Array.from({ length: 16 }, (_, i) => (i + 1 >= 5 ? 0.15 : 0)))
    const a = alerts(ts)
    const first = a.findIndex((x) => x)
    expect(first).toBe(6) // 7. test = 3. kötü hafta
    expect(a.slice(first).every((x) => x === 'yellow')).toBe(true)
    expect(at(ts, 16)).toMatchObject({ baselineFrozen: true, baselineTests: 3, baseline: 0 })
    expect(seriesNotes(at(ts, 16))).toEqual([]) // durmuş başlangıç "güçlenecek" demez
  })
  it('kötü seri bitince uyarı kalkar, yeni kötü seride yeniden gelir', () => {
    const v = Array.from({ length: 16 }, (_, i) => (i + 1 >= 12 && i + 1 <= 14 ? 0.15 : 0))
    const a = alerts(wk(v))
    expect(a.slice(0, 13).every((x) => x == null)).toBe(true)
    expect(a[13]).toBe('yellow') // 14. test: 3. kötü hafta
    expect(a[14]).toBeNull() // 15. test iyi: son 3 testin hepsi kötü değil
  })
})

describe('günlük geçmişi olan kullanıcı değişmez', () => {
  const daily = (n, v = 0.1) => Array.from({ length: n }, (_, i) => ({ date: D(i + 1), logMAR: v, type: 'va-daily' }))
  it('her gün test (va-daily): başlangıç 8–21. gün, takip 22. gün; sonuç tür alanı olmayan eski kayıtlarla aynı', () => {
    const d = daily(30)
    expect(analyzeTrend(d.slice(0, 21), D(21)).phase).toBe('baseline')
    expect(trendMessage(analyzeTrend(d.slice(0, 21), D(21)))).toBe('Başlangıç değerin oluşturuluyor (8. günden itibaren en az 7 test, en erken 21. güne kadar). Şimdilik değişim yorumlanmıyor.')
    const r = analyzeTrend(d.slice(0, 22), D(22))
    expect(r).toMatchObject({ phase: 'tracking', baselineMode: 'daily', baselineTests: 14 })
    const old = analyzeTrend(untyped(d.slice(0, 22)), D(22))
    for (const k of ['phase', 'baseline', 'current', 'delta', 'alert', 'trend', 'sparse']) expect(r[k]).toEqual(old[k])
  })
  it('günlük (sağ/sol) + haftalık karışık eski kullanıcı: günlük yol önce hazır → günlük; uyarılar önceki kuralla aynı', () => {
    const mixed = Array.from({ length: 60 }, (_, i) => ({ date: D(i + 1), logMAR: i + 1 >= 40 ? 0.35 : 0, type: i % 7 === 0 ? 'va-weekly' : 'va-daily' }))
    for (const day of [25, 39, 42, 43, 46, 50, 60]) {
      const r = analyzeTrend(mixed.slice(0, day), D(day))
      const old = analyzeTrend(untyped(mixed.slice(0, day)), D(day))
      expect(r.baselineMode).toBe('daily')
      expect([r.baseline, r.alert, r.trend]).toEqual([old.baseline, old.alert, old.trend])
    }
    expect(analyzeTrend(mixed.slice(0, 46), D(46)).alert).toBe('red')
  })
  it('günlükten haftalığa geçen kullanıcı: günlük başlangıç korunur, değişim son 3 haftalık testle (S9)', () => {
    const d = daily(21, 0)
    const w = [28, 35, 42, 49].map((n) => ({ date: D(n), logMAR: 0.35, type: 'va-weekly' }))
    const r = analyzeTrend([...d, ...w], D(49))
    expect(r).toMatchObject({ baselineMode: 'daily', baseline: 0, sparse: true, alert: 'red' })
    expect(analyzeTrend([...d, ...w.slice(0, 2)], D(35)).alert).toBeNull() // iki kötü hafta yetmez
  })
  it('öne çıkan seri (vaSeries): günlük geçmişli sağ göz seçilir, trendi günlük yolda ve önceki kuralla aynı', () => {
    const now = D(40)
    const r = daily(35).map((t) => ({ ...t, eye: 'R' }))
    const l = daily(35).map((t) => ({ ...t, eye: 'L' }))
    const ou = [1, 8, 15, 22, 29].map((n) => ({ date: D(n), logMAR: 0.1, type: 'va-weekly', eye: 'OU' }))
    const pick = pickSeries([...r, ...l, ...ou], now)
    expect(pick.eye).toBe('R')
    expect(pick.trend).toMatchObject({ phase: 'tracking', baselineMode: 'daily' })
    expect(pick.trend.baseline).toBe(analyzeTrend(untyped(r), now).baseline)
  })
})

// İnceleme 2026-09-29 (davranış + metin): başlangıç dönemindeki metin son testin türüne göre seçiliyordu; tek bir
// isteğe bağlı kısa test haftalık plandaki kişiye günlük kuralın "8. günden itibaren en az 7 test" metnini getiriyordu.
describe('başlangıç dönemi metni: hangi yol önce biterse', () => {
  const W = (d, v = 0.1) => ({ date: D(d), logMAR: v, type: 'va-weekly' })
  const S = (d, v = 0.1) => ({ date: new Date(Date.UTC(2026, 0, d, 18)).toISOString(), logMAR: v, type: 'va-daily' })
  const DAILY_TEXT = /8\. günden itibaren en az 7 test/
  it('haftalık 1. ve 8. gün + 10. günde bir kısa test: 10., 11. ve 14. günde haftalık metin', () => {
    const ts = [W(1), W(8), S(10)]
    for (const day of [10, 11, 14]) {
      const r = analyzeTrend(ts, new Date(Date.UTC(2026, 0, day, 20)).toISOString())
      expect(r).toMatchObject({ phase: 'baseline', baselineMode: 'weekly' })
      expect(trendMessage(r)).toBe('Başlangıç değerin 3 haftalık testle oluşuyor; 1 test tamam. Şimdilik değişim yorumlanmıyor.')
    }
    // sonraki haftalık testten sonra da aynı yol (metin gidip gelmez)
    expect(trendMessage(analyzeTrend([...ts, W(15)], D(15)))).toBe('Başlangıç değerin 3 haftalık testle oluşuyor; 2 test tamam. Şimdilik değişim yorumlanmıyor.')
  })
  it('alışma haftasında kısa test son test olsa da haftalık alışma metni', () => {
    const r = analyzeTrend([W(1), S(3)], D(4))
    expect(r).toMatchObject({ phase: 'familiarization', baselineMode: 'weekly' })
  })
  it('8. günden sonra her gün kısa test eden: günlük yol önce biter, günlük metin (sabah test öncesi de)', () => {
    const ts = [W(1), S(8), S(9), S(10)]
    expect(analyzeTrend(ts, D(10)).baselineMode).toBe('daily')
    expect(analyzeTrend(ts.slice(0, 3), D(10)).baselineMode).toBe('daily') // 10. gün sabahı, test yapılmadan
    expect(trendMessage(analyzeTrend(ts, D(10)))).toMatch(DAILY_TEXT)
  })
  // 2. tur: haftalık testi hiç olmayan seri önceden hep günlük metni alıyordu ("8. günden itibaren en az 7 test",
  // yani gün aşırı test). Artık o seri de hangi yolun önce biteceğine göre metin alır.
  it('haftalık testi hiç olmayan, her gün kısa test eden seri: günlük metin', () => {
    const ts = [S(1), S(8), S(9), S(10)]
    expect(analyzeTrend(ts, D(10)).baselineMode).toBe('daily')
    expect(trendMessage(analyzeTrend(ts, D(10)))).toMatch(DAILY_TEXT)
  })
  it('haftalık testi hiç olmayan, seyrek kısa test eden seri: haftalık planın metni', () => {
    const ts = [S(1), S(8), S(10)]
    const r = analyzeTrend(ts, D(12))
    expect(r).toMatchObject({ phase: 'baseline', baselineMode: 'weekly' })
    expect(trendMessage(r)).toBe('Başlangıç değerin sonraki 3 haftalık testle oluşacak. Şimdilik değişim yorumlanmıyor.')
  })
  it('haftalık testi hiç olmayan, 7 testi tamamlamış seri: günlük yolda kalır (21. günü bekler)', () => {
    const ts = [S(1), ...[8, 9, 10, 11, 12, 13, 14].map((d) => S(d))]
    expect(analyzeTrend(ts, D(16)).baselineMode).toBe('daily')
  })
  it('haftalık testi aksatan (1. günden sonra test yok): haftalık metin', () => {
    const r = analyzeTrend([W(1)], D(30))
    expect(r).toMatchObject({ phase: 'baseline', baselineMode: 'weekly' })
    expect(trendMessage(r)).not.toMatch(DAILY_TEXT)
  })
})

// İnceleme 2026-09-29 (davranış): büyüme iyileşmede de duruyordu. Haftalık planda yalnız 1. test alışma olduğundan
// öğrenme 2.–4. teste taşarsa başlangıç öğrenme öncesi kötü düzeyde donuyor, sonraki gerçek +0,20 kötüleşme yalnız
// sarı kalıyordu (kırmızı hiç çıkmıyordu). Büyüme artık yalnız kötüleşmede durur.
describe('büyüme yalnız kötüleşmede durur', () => {
  // 1. test 0,25; 2.–4. test 0,2; 5.–9. test 0,1 (öğrenme); 10. testten gerçek +0,2 (0,3)
  const vals = Array.from({ length: 16 }, (_, i) => (i === 0 ? 0.25 : i <= 3 ? 0.2 : i < 9 ? 0.1 : 0.3))
  const ts = wk(vals)
  it('öğrenme sonrası başlangıç 0,1 düzeyine iner, donmaz', () => {
    expect(at(ts, 9)).toMatchObject({ baselineFrozen: false, baselineTests: 5 })
    expect(at(ts, 11)).toMatchObject({ baselineFrozen: false, baselineTests: 7, baseline: 0.1 })
  })
  it('gerçek +0,20 kötüleşme 12. testte (3. kötü hafta) kırmızı', () => {
    const a = alerts(ts)
    expect(a.slice(0, 11).every((x) => x == null)).toBe(true)
    expect(a[11]).toBe('red')
    expect(a.slice(11).every((x) => x === 'red')).toBe(true)
  })
  it('kötüleşmede büyüme yine durur (uyarı başlangıca karışmaz)', () => {
    const worse = wk(Array.from({ length: 16 }, (_, i) => (i + 1 >= 5 ? 0.15 : 0)))
    expect(at(worse, 16)).toMatchObject({ baselineFrozen: true, baselineTests: 3, alert: 'yellow' })
  })
})

// İnceleme 2026-09-29 (davranış, küçük): seyrek seride karşılaştırılan değer bir test sonrası tek teste, bir hafta
// sonra 3 testin ortancasına atlıyordu. Artık seyrek seride hep son 3 testin ortancası; uyarı değişmez.
describe('seyrek seride karşılaştırılan değer son 3 testin ortancası', () => {
  const ts = wk([...Array(7).fill(0.1), 0.35])
  it('tek kötü testten sonra "Son 3 test" 0,10, fark 0; bir hafta sonra da aynı', () => {
    for (const day of [50, 56, 57]) {
      const r = analyzeTrend(ts, D(day))
      expect(r).toMatchObject({ currentWindow: 'last3', current: 0.1, delta: 0, alert: null })
    }
  })
})
