// Günlük görme takibinde gerçek değişimi gürültüden ayırma.
// Kurallar: SENTEZ_RAPORU.md §10 (ajan 13: Alleye ardışık-3 kuralı, ForeseeHome yanlış alarm).
// logMAR: büyük değer = daha kötü görme.

export const FAMILIARIZATION_DAYS = 7
export const BASELINE_FROM_DAY = 8
export const BASELINE_TO_DAY = 21
// 7 (önceden 3): kendi simülasyonumuzda 3 testlik başlangıçla 90 günde en az bir yanlış sarı olasılığı %7–34,
// 14 testlikle %1–24 (test başına SD 0,057–0,10; 2026-09-26 kanıt kontrolü, kullanıcı onayı).
export const MIN_BASELINE_TESTS = 7
export const PROVISIONAL_MIN_TESTS = 3
export const YELLOW_DELTA = 0.1
export const RED_DELTA = 0.2
// VARSAYIM: iyileşme için kötüleşme kuralının simetriği kullanılır.
export const IMPROVE_DELTA = 0.1

const DAY_MS = 86400000

function dayIndex(dateIso, originIso) {
  const d = new Date(dateIso)
  const o = new Date(originIso)
  const dl = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const ol = Date.UTC(o.getFullYear(), o.getMonth(), o.getDate())
  return Math.round((dl - ol) / DAY_MS) + 1 // ilk gün = 1
}

export function median(values) {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// tests: [{ date, logMAR }] (tek göz). now: değerlendirme anı (ISO)
// Karşılaştırılabilir seri: yalnızca SON testle aynı gözlük/lens koşulundaki (correction) kayıtlar ve
// son "gözlüğüm değişti" (newBaseline) işaretinden sonrası. Farklı koşullar birleştirilmez
// (docs/arastirma/ajan-raporlari/19_gozluk_ve_yakin_test.md: alışkanlık koşulu, koşul değişince yeni baz).
// Eski kayıtlarda correction yoksa (null) hepsi aynı koşul sayılır.
// Eski kayıtlar (Build ≤18) yalnızca 'glasses' der; yeni ayrıntılı gözlük türleriyle aynı seri sayılır
// (aynı gözlük olduğu varsayılır — VARSAYIM; seri kopmasın diye).
const GLASSES_FAMILY = new Set(['glasses', 'reading', 'progressive', 'distance'])
export const sameCondition = (a, b) => (a ?? null) === (b ?? null) || ((a === 'glasses' || b === 'glasses') && GLASSES_FAMILY.has(a) && GLASSES_FAMILY.has(b))
export function comparableTests(tests) {
  const sorted = [...tests].filter((t) => Number.isFinite(t.logMAR)).sort((a, b) => a.date.localeCompare(b.date))
  if (!sorted.length) return { tests: [], condition: null, resetAt: null }
  const condition = sorted.at(-1).correction ?? null
  const same = sorted.filter((t) => sameCondition(t.correction, condition))
  const lastReset = same.map((t, i) => (t.newBaseline === true ? i : -1)).filter((i) => i >= 0).at(-1)
  const cut = lastReset == null ? same : same.slice(lastReset)
  return { tests: cut, condition, resetAt: lastReset == null ? null : cut[0].date, dropped: sorted.length - cut.length }
}

export function analyzeTrend(tests, now = new Date().toISOString()) {
  const comp = comparableTests(tests)
  const sorted = comp.tests
  if (!sorted.length) {
    return { phase: 'empty', baseline: null, current7: null, delta: null, alert: null, trend: null, series: [], condition: null, resetAt: null, dropped: 0 }
  }
  const origin = sorted[0].date
  const withDay = sorted.map((t) => ({ ...t, day: dayIndex(t.date, origin) }))
  const today = dayIndex(now, origin)

  // Her test için o güne kadarki son 7 günün ortancası
  const series = withDay.map((t) => ({
    date: t.date,
    day: t.day,
    logMAR: t.logMAR,
    rolling7: median(withDay.filter((u) => u.day > t.day - 7 && u.day <= t.day).map((u) => u.logMAR)),
  }))

  // Başlangıç: 8. günden itibaren en az MIN_BASELINE_TESTS test, en erken 21. güne kadar. 21. günde yetmediyse
  // pencere o sayıdaki teste kadar uzar (seyrek test eden kullanıcı hiç takibe geçmeden kalmasın).
  const afterFam = withDay.filter((t) => t.day >= BASELINE_FROM_DAY)
  const lastBase = afterFam[MIN_BASELINE_TESTS - 1]
  const baseEnd = lastBase ? Math.max(BASELINE_TO_DAY, lastBase.day) : null
  const baseTests = baseEnd == null ? [] : afterFam.filter((t) => t.day <= baseEnd)
  const baselineReady = baseEnd != null && today > baseEnd
  // Başlangıç henüz hazır değilse geçici başlangıç (yalnız görünüm; uyarı üretmez): tanışma sonrası mevcut testler
  const baseline = baselineReady
    ? median(baseTests.map((t) => t.logMAR))
    : afterFam.length >= PROVISIONAL_MIN_TESTS
      ? median(afterFam.map((t) => t.logMAR))
      : null

  const phase =
    today <= FAMILIARIZATION_DAYS ? 'familiarization' : baselineReady ? 'tracking' : 'baseline'

  const last7 = withDay.filter((t) => t.day > today - 7 && t.day <= today)
  const current7 = median(last7.map((t) => t.logMAR))
  // Farklar 3 basamağa yuvarlanarak karşılaştırılır (kayıtlar 3 basamaklı): 0,30 − 0,20 kayan noktada
  // 0,0999… çıkar ve "en az 0,10" kuralı sınırda tetiklenmezdi (ekranda +0,10 yazarken).
  const r3 = (v) => Math.round(v * 1000) / 1000
  const delta = baseline != null && current7 != null ? r3(current7 - baseline) : null

  let alert = null
  let trend = null
  if (phase === 'tracking' && delta != null) {
    const last3 = withDay.slice(-3)
    const worse3 = last3.length === 3 && last3.every((t) => r3(t.logMAR - baseline) >= YELLOW_DELTA)
    const better3 = last3.length === 3 && last3.every((t) => r3(baseline - t.logMAR) >= IMPROVE_DELTA)
    const allRed = last7.length >= 3 && last7.every((t) => r3(t.logMAR - baseline) >= RED_DELTA)
    const spansWeek = last7.length >= 3 && today - last7[0].day >= 6

    if (allRed && spansWeek) alert = 'red'
    else if (delta >= YELLOW_DELTA && worse3) alert = 'yellow'

    if (alert) trend = 'worsening'
    else if (-delta >= IMPROVE_DELTA && better3) trend = 'improving'
    else trend = 'stable'
  }

  return {
    phase,
    condition: comp.condition,
    resetAt: comp.resetAt,
    dropped: comp.dropped,
    baseline: baseline != null ? +baseline.toFixed(3) : null,
    current7: current7 != null ? +current7.toFixed(3) : null,
    delta: delta != null ? +delta.toFixed(3) : null,
    alert,
    trend,
    series,
  }
}

// Kullanıcıya gösterilecek dürüst mesaj
export function trendMessage(r) {
  switch (r.phase) {
    case 'empty':
      return 'Henüz test yok.'
    case 'familiarization':
      return 'Alışma dönemi (ilk 7 gün). Bu günlerde sonuçlar testi öğrenmenle değişebilir; değerlendirmeye katılmaz.'
    case 'baseline':
      return 'Başlangıç değerin oluşturuluyor (8. günden itibaren en az 7 test, en erken 21. güne kadar). Şimdilik değişim yorumlanmıyor.'
    default:
      break
  }
  if (r.alert === 'red') {
    return 'Son bir haftadır görme ölçümlerin başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.'
  }
  if (r.alert === 'yellow') {
    return 'Son ölçümlerin başlangıcından biraz kötü. Işık, yorgunluk ve mesafeyi kontrol edip birkaç gün daha test et; devam ederse göz doktoruna danış.'
  }
  if (r.trend === 'improving') {
    return 'Son ölçümlerin başlangıcından daha iyi. Not: Bir kısmı teste alışmaktan kaynaklanabilir.'
  }
  // "Sabit" denmez: kural yalnız "doğrulanmış değişim yok" der (ortanca farkı eşik altında ya da son 3 test doğrulamıyor).
  // ±0,2: iki tek test arasındaki %95 fark, klinikte gözetimli tablet/telefon yakın testleri (Joseph 2023,
  // Katibeh 2022, Han 2019; lib/sources.js); evde daha geniş olabilir.
  return 'Başlangıcına göre doğrulanmış bir değişim yok. Değerlendirme son 7 günün ortancası ve son 3 testle yapılır; tek testler bir testten diğerine yaklaşık ±0,2 logMAR oynayabilir.'
}
