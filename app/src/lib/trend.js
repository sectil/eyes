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
// Gözlük koşuluna ek olarak seriyi SON testle aynı olması gereken üç şey daha belirler (seri anahtarı):
//  1. Ölçüm yöntemi kuşağı (karar S6): bkz. methodEra.
//  2. Mesafe modu (karar S5): kamerasız ölçümde harf 40 cm varsayımıyla çizilir; kaydedilen değer gerçek
//     mesafeyle log10(d / 40 cm) kadar kayar (55 cm'de +0,138, 30 cm'de −0,125). Kamerasız (distanceTracked:
//     false) ve kameralı kayıtlar ayrı seridir. Alanı olmayan kayıt (uygulama bu alanı ilk sürümden beri yazar;
//     yalnız elle/eski test verisi) kameralı sayılır.
//  3. Eski yöntemde mesafe bandı: v4 öncesi harfler 25–60 cm'de sayılıyordu. Ortalama mesafesi 360–440 mm dışında
//     kalan eski kameralı kayıtlar bant içindeki eski kayıtlarla aynı seride değildir (plan H3). Yakın (< 360 mm) ve
//     uzak (> 440 mm) da ayrı seridir: sapmaları ters yönde (plan H4: 30 cm −0,125, 55 cm +0,138), karışırlarsa
//     kendileri sahte eğilim üretir. v4 kayıtları zaten yalnız bantta sayılır (lib/trialGate.js), onlara bu ayrım
//     uygulanmaz.
// Örtme yöntemi (camera-depth / camera-lid+self / camera-self / self-report) seri anahtarına girmez (karar S8).
const GLASSES_FAMILY = new Set(['glasses', 'reading', 'progressive', 'distance'])
export const sameCondition = (a, b) => (a ?? null) === (b ?? null) || ((a === 'glasses' || b === 'glasses') && GLASSES_FAMILY.has(a) && GLASSES_FAMILY.has(b))

// Sayılan harflerin mesafe bandı (karar S1; lib/trialGate.js COUNT_MIN_MM / COUNT_MAX_MM ile aynı, sınırlar dahil)
export const BAND_MIN_MM = 360
export const BAND_MAX_MM = 440
// Yeni seri başlatan yöntem sürümleri (artan). 'descent-zest-v4' (S6): sürekli harf boyutu, deneme içinde boyut
// dondurma, 36–44 cm sayım bandı. Daha eski kayıtlar ('descent-zest-v3' ve algorithm alanı olmayan ilk kayıtlar)
// 0. kuşaktır ve v4 serisiyle karşılaştırılmaz.
const METHOD_SERIES_FROM = [4]
export const METHOD_RESET_NOTE = 'Ölçüm yöntemi güncellendi; yeni seri.'
export const DISTANCE_ASSUMED_NOTE = 'Mesafe ölçülmedi · 40 cm varsayıldı'

export function methodEra(algorithm) {
  const m = /-v(\d+)$/.exec(typeof algorithm === 'string' ? algorithm : '')
  const v = m ? Number(m[1]) : 0
  return METHOD_SERIES_FROM.filter((from) => v >= from).at(-1) ?? 0
}
const isTracked = (t) => t.distanceTracked !== false
// Eski kameralı kaydın bandı: 'near' | 'far' | null (bant içinde, v4 ya da mesafe yok)
function legacyBand(t) {
  if (methodEra(t.algorithm) !== 0 || !isTracked(t) || !Number.isFinite(t.meanDistanceMm)) return null
  return t.meanDistanceMm < BAND_MIN_MM ? 'near' : t.meanDistanceMm > BAND_MAX_MM ? 'far' : null
}
const seriesKey = (t) => ({ era: methodEra(t.algorithm), tracked: isTracked(t), outOfBand: legacyBand(t) })

// droppedBy: seriye girmeyen kayıtların nedeni (ilk tutan neden sayılır): method → distance → band → condition → reset
export function comparableTests(tests) {
  const sorted = [...tests].filter((t) => Number.isFinite(t.logMAR)).sort((a, b) => a.date.localeCompare(b.date))
  const droppedBy = { method: 0, distance: 0, band: 0, condition: 0, reset: 0 }
  if (!sorted.length) return { tests: [], condition: null, resetAt: null, dropped: 0, droppedBy, distanceTracked: null, methodReset: false }
  const last = sorted.at(-1)
  const condition = last.correction ?? null
  const key = seriesKey(last)
  // "Gözlüğüm/numaram değişti" (newBaseline) aynı gözlük koşulundaki her seriyi sıfırlar (mesafe modu ve yöntemden
  // bağımsız: numara kişinin gözlüğüne ait, ölçüm biçimine değil)
  let resetIdx = -1
  sorted.forEach((t, i) => {
    if (t.newBaseline === true && sameCondition(t.correction, condition)) resetIdx = i
  })
  const kept = []
  sorted.forEach((t, i) => {
    const k = seriesKey(t)
    const why =
      k.era !== key.era ? 'method'
        : k.tracked !== key.tracked ? 'distance'
          : k.outOfBand !== key.outOfBand ? 'band'
            : !sameCondition(t.correction, condition) ? 'condition'
              : i < resetIdx ? 'reset'
                : null
    if (why) droppedBy[why] += 1
    else kept.push(t)
  })
  // resetAt yalnız sıfırlama bu seriyi etkiliyorsa (kayıt seride ya da öncesi atıldı)
  const resetApplies = resetIdx >= 0 && (kept.includes(sorted[resetIdx]) || droppedBy.reset > 0)
  return {
    tests: kept,
    condition,
    resetAt: resetApplies ? sorted[resetIdx].date : null,
    dropped: sorted.length - kept.length,
    droppedBy,
    // false: seri kamerasız (Gelişim notu: DISTANCE_ASSUMED_NOTE)
    distanceTracked: key.tracked,
    // true: bu gözün daha eski yöntemle ölçülmüş kayıtları var, seri yeni yöntemle yeniden başladı (METHOD_RESET_NOTE)
    methodReset: sorted.some((t) => methodEra(t.algorithm) < key.era),
  }
}

// Gelişim'de serinin yanında gösterilecek tek satırlık notlar (S5, S6)
export function seriesNotes(r) {
  const notes = []
  if (r?.methodReset) notes.push(METHOD_RESET_NOTE)
  if (r?.distanceTracked === false) notes.push(DISTANCE_ASSUMED_NOTE)
  return notes
}

// Seriye girmeyen kayıtlar, nedeniyle (Gelişim ve doktor raporu). "Farklı koşul" yalnız gözlük/lens koşulu için
// söylenir; yöntem değişikliği S6 notuyla (seriesNotes) bir kez, sayısız söylenir.
export function droppedNotes(r) {
  const by = r?.droppedBy ?? {}
  const n = (k) => (Number.isFinite(by[k]) ? by[k] : 0)
  const out = []
  if (n('method') > 0 && !r?.methodReset) out.push(`Başka ölçüm yöntemiyle yapılan ${n('method')} ölçüm bu seriye girmiyor.`)
  if (n('distance') > 0) {
    out.push(r?.distanceTracked === false ? `Kamerayla yapılan ${n('distance')} ölçüm bu seriye girmiyor.` : `Kamerasız ${n('distance')} ölçüm bu seriye girmiyor.`)
  }
  if (n('band') > 0) out.push(`Farklı mesafede yapılan ${n('band')} eski ölçüm bu seriye girmiyor.`)
  if (n('condition') > 0) out.push(`Farklı gözlük/lens koşulundaki ${n('condition')} ölçüm bu seriye girmiyor.`)
  if (n('reset') > 0) out.push(`Gözlük yenilenmeden önceki ${n('reset')} ölçüm bu seriye girmiyor.`)
  return out
}

export function analyzeTrend(tests, now = new Date().toISOString()) {
  const comp = comparableTests(tests)
  const sorted = comp.tests
  const info = { condition: comp.condition, resetAt: comp.resetAt, dropped: comp.dropped, droppedBy: comp.droppedBy, distanceTracked: comp.distanceTracked, methodReset: comp.methodReset }
  if (!sorted.length) {
    return { phase: 'empty', baseline: null, current7: null, current: null, currentWindow: null, delta: null, alert: null, trend: null, sparse: false, series: [], ...info }
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
  const last3 = withDay.slice(-3)
  // Son 7 günde test yoksa karşılaştırma son 3 testin ortancasıyla sürer: uyarı yalnız zaman geçti diye
  // kaybolmaz (plan H5). current7 yalnız son 7 günün ortancası olarak kalır ("Son 7 gün" etiketi doğru kalsın).
  const currentWindow = last7.length ? 'days7' : 'last3'
  const current = last7.length ? current7 : median(last3.map((t) => t.logMAR))
  // Seyrek seri (karar S9): son 7 günde 3 test yok. İki göz (OU) yalnız haftalık testte ölçülür; eski kuralla
  // kırmızı hiç çıkamıyordu.
  const sparse = last7.length < 3
  // Farklar 3 basamağa yuvarlanarak karşılaştırılır (kayıtlar 3 basamaklı): 0,30 − 0,20 kayan noktada
  // 0,0999… çıkar ve "en az 0,10" kuralı sınırda tetiklenmezdi (ekranda +0,10 yazarken).
  const r3 = (v) => Math.round(v * 1000) / 1000
  const delta = baseline != null && current != null ? r3(current - baseline) : null

  let alert = null
  let trend = null
  if (phase === 'tracking' && delta != null) {
    const worse3 = last3.length === 3 && last3.every((t) => r3(t.logMAR - baseline) >= YELLOW_DELTA)
    const better3 = last3.length === 3 && last3.every((t) => r3(baseline - t.logMAR) >= IMPROVE_DELTA)
    const isRed = (t) => r3(t.logMAR - baseline) >= RED_DELTA
    let allRed
    let spansWeek
    if (!sparse) {
      // Günlük kural (değişmedi): son 7 gündeki en az 3 testin hepsi ≥ 0,2 kötü ve pencere bir haftaya yayılıyor
      allRed = last7.every(isRed)
      spansWeek = today - last7[0].day >= 6
    } else {
      // Seyrek seri: kural son testin günündeki haliyle değerlendirilir (yalnız beklemek sarıyı kırmızıya
      // çevirmez, kırmızıyı da sarıya düşürmez). Pencere son testle biten 7 gün; orada 3 test yoksa son 3 test.
      // Yayılma testler arasında ölçülür. VARSAYIM: klinik uygunluğu kaynakla doğrulanmadı (S9).
      const lastDay = withDay.at(-1).day
      const week = withDay.filter((t) => t.day > lastDay - 7 && t.day <= lastDay)
      const win = week.length >= 3 ? week : last3
      allRed = win.length >= 3 && win.every(isRed)
      spansWeek = win.length >= 3 && lastDay - win[0].day >= 6
    }

    if (allRed && spansWeek) alert = 'red'
    else if (delta >= YELLOW_DELTA && worse3) alert = 'yellow'

    if (alert) trend = 'worsening'
    else if (-delta >= IMPROVE_DELTA && better3) trend = 'improving'
    else trend = 'stable'
  }

  return {
    phase,
    ...info,
    baseline: baseline != null ? +baseline.toFixed(3) : null,
    current7: current7 != null ? +current7.toFixed(3) : null,
    // current: başlangıçla karşılaştırılan değer; currentWindow 'days7' = son 7 günün ortancası, 'last3' = son 7
    // günde test olmadığı için son 3 testin ortancası
    current: current != null ? +current.toFixed(3) : null,
    currentWindow,
    delta: delta != null ? +delta.toFixed(3) : null,
    alert,
    trend,
    sparse,
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
  // Seyrek seride (r.sparse: son 7 günde 3 test yok; ör. yalnız haftalık ölçülen iki göz) "son bir hafta",
  // "birkaç gün daha test et" ve "son 7 günün ortancası" doğru olmaz; metin son 3 teste dayanır.
  if (r.alert === 'red') {
    return r.sparse
      ? 'Son 3 ölçümün de başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.'
      : 'Son bir haftadır görme ölçümlerin başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.'
  }
  if (r.alert === 'yellow') {
    return r.sparse
      ? 'Son ölçümlerin başlangıcından biraz kötü. Işık, yorgunluk ve mesafeyi kontrol et; sonraki testlerde de sürerse göz doktoruna danış.'
      : 'Son ölçümlerin başlangıcından biraz kötü. Işık, yorgunluk ve mesafeyi kontrol edip birkaç gün daha test et; devam ederse göz doktoruna danış.'
  }
  if (r.trend === 'improving') {
    return 'Son ölçümlerin başlangıcından daha iyi. Not: Bir kısmı teste alışmaktan kaynaklanabilir.'
  }
  // "Sabit" denmez: kural yalnız "doğrulanmış değişim yok" der (ortanca farkı eşik altında ya da son 3 test doğrulamıyor).
  // ±0,2: iki tek test arasındaki %95 fark, klinikte gözetimli tablet/telefon yakın testleri (Joseph 2023,
  // Katibeh 2022, Han 2019; lib/sources.js); evde daha geniş olabilir.
  if (r.sparse) {
    return 'Başlangıç değerine göre doğrulanmış bir değişim yok. Ölçümler seyrek olduğu için değerlendirme son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.'
  }
  return 'Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 7 günün ortancası ve son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.'
}
