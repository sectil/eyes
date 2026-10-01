// Görme takibinde (haftalık E testi; isteğe bağlı kısa test) gerçek değişimi gürültüden ayırma.
// Kurallar: SENTEZ_RAPORU.md §10 (ajan 13: Alleye ardışık-3 kuralı, ForeseeHome yanlış alarm). §10 günlük test için
// yazılmıştı; 2026-09-29 kararıyla (E testi ilk günden haftada bir) haftalık seriye ayrı başlangıç yolu eklendi
// (aşağıda WEEKLY_MIN_BASELINE_TESTS). Değişim kuralı (sarı/kırmızı/S9) iki yolda da aynıdır.
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

// Haftalık seri (karar 2026-09-29: E testi ilk günden haftada bir; göz başına 28 sayılan harf, zest.js PLANS.weekly).
// Günlük kuralla (8. günden sonra 7 test) haftalık seride başlangıç ≈ 8 hafta sürerdi. Haftalık yol:
//  - Alışma değişmedi (ilk 7 gün = ilk haftalık test). Tekrarlı ölçümde ilk ölçüm biraz farklı çıkabiliyor:
//    Lim 2010 (PMID 19557025, doi:10.1038/eye.2009.147) üç çizelgenin üçünde de küçük alışma (practice) etkisi.
//  - Başlangıç 8. günden sonraki ilk testlerin (en az 3; isteğe bağlı kısa testler de girer) ortancası;
//    WEEKLY_MIN_BASELINE_TESTS (3) haftalık test tamamlanınca, en erken 22. günde hazır (21. güne kadar bekleme günlük
//    kuraldan). Haftalık testlerle yalnız: sonraki 3 haftalık test. Sonra büyür: değerlendirilen son 3 test dışında kalan ilk testler,
//    en çok MIN_BASELINE_TESTS (7). Son 3 testin her biri başlangıçtan en az 0,10 KÖTÜ olduğu ilk anda büyüme durur
//    (uyarı başlangıca karışıp kendiliğinden kaybolmasın, plan H5). İyileşmede büyüme sürer: haftalık planda yalnız
//    ilk test alışma olduğundan öğrenme etkisi 2.–4. teste taşabilir; başlangıç onu içine alır (inceleme 2026-09-29:
//    iyileşmede de durunca başlangıç öğrenme öncesi kötü düzeyde kalıyor, sonraki gerçek +0,20 kötüleşme kırmızıya
//    çıkamıyordu). 7 teste varınca başlangıç günlük kuralın başlangıcıyla aynıdır (eski yalnız-haftalık seriler 10+
//    testte değişmez).
//  - Değişim kuralı değişmedi: seyrek seride S9 (son 3 testin her biri ≥ 0,10 sarı, ≥ 0,20 kırmızı). Eşikler:
//    Rosser 2003 (PMID 12882770, doi:10.1167/iovs.02-1100: ETDRS çizelgesiyle, sağlıklı gönüllülerde, mesafeyle taklit edilen değişimde ≥ 0,2
//    güvenle ayrılır, 0,1 ayrılmaz; eşik aranan değişimden küçük seçilirse duyarlılık artar; telefon testinin
//    oynaması daha büyük, bu yüzden art arda 3 test), Arditi 1993 (PMID 8425819: anlamlı değişim ≈ ±0,14), Faes 2021
//    (PMID 33414531, doi:10.1038/s41433-020-01356-2: art arda 3 "kırmızı" → yanlış alarm %6,1).
// VARSAYIM: 3 testlik başlangıç, 7'ye büyüme ve kötüleşmede durma kendi simülasyonumuzla seçildi (10 000 kişi × 26
// hafta; test başına SD 0,05–0,10: Arditi 1993, Joseph 2023 PMID 38015309, Katibeh 2022, Han 2019 PMID 31440424;
// yanlış uyarı bir gözde 26 haftada %0,7–19,4, sağ + sol + iki gözden herhangi birinde %2,5–48,1; yanlış kırmızı kişi
// başına en çok %4,9); klinik doğrulaması yok. Kanıt kartında da yazar (lib/evidence.js 'trend' limits). Günlük seri
// (8–21. günlerde 7 test) eskisi gibi kalır: hangi yol önce hazırsa o kullanılır.
export const WEEKLY_MIN_BASELINE_TESTS = 3
export const WEEKLY_TYPE = 'va-weekly'
const isWeekly = (t) => t?.type === WEEKLY_TYPE

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

// Gelişim'de serinin yanında gösterilecek tek satırlık notlar (S5, S6; haftalık yolda büyüyen başlangıç). "N testle":
// büyüyen başlangıç tanışma sonrası bütün testlerden (isteğe bağlı kısa testler dahil) kurulur, yalnız haftalıktan değil.
export const baselineGrowingNote = (n) => `Başlangıç değerin ${n} testle hesaplandı; yeni testlerle 7 teste kadar güçlenecek.`
// Haftalık planın göz takvimi (İlk rapor ve başlangıç dönemi için tek cümle)
export const WEEKLY_PLAN_NOTE = 'E testi haftada bir yapılır. İlk test alışmadır; sonraki 3 haftalık test başlangıç değerini oluşturur, değerlendirme en erken 22. günde başlar.'
export function seriesNotes(r) {
  const notes = []
  if (r?.phase === 'tracking' && r.baselineMode === 'weekly' && r.baselineTests < MIN_BASELINE_TESTS && !r.baselineFrozen) {
    notes.push(baselineGrowingNote(r.baselineTests))
  }
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

// Haftalık yolun büyüyen başlangıcı. afterFam: tanışma sonrası testler (sıralı), from: haftalık yolun hazır olduğu gün.
// c testlik önek için başlangıç ilk clamp(c − 3, 3, 7) testtir: büyürken değerlendirilen son 3 test başlangıca girmez
// (c = 3–5'te, haftada bir testte 22.–36. günlerde, son 3 test başlangıç testlerini de içerir). Hazır olduktan sonra
// son 3 testin hepsi başlangıçtan en az 0,10 kötü olduğu ilk önekte büyüme durur (uyarı başlangıca karışmasın);
// iyileşmede durmaz (yukarıda). Döner: { tests, grown (7'ye ulaştı), frozen (kötüleşmede durdu) }. VARSAYIM (yukarıda).
// Farklar 3 basamağa yuvarlanarak karşılaştırılır (kayıtlar 3 basamaklı): 0,30 − 0,20 kayan noktada 0,0999… çıkar
// ve "en az 0,10" kuralı sınırda tetiklenmezdi (ekranda +0,10 yazarken).
const r3 = (v) => Math.round(v * 1000) / 1000
function growingBaseline(afterFam, from) {
  const size = (c) => Math.min(MIN_BASELINE_TESTS, Math.max(WEEKLY_MIN_BASELINE_TESTS, c - 3))
  let m = Math.min(afterFam.length, WEEKLY_MIN_BASELINE_TESTS)
  let frozen = false
  for (let c = WEEKLY_MIN_BASELINE_TESTS + 1; c <= afterFam.length; c++) {
    m = size(c)
    if (m >= MIN_BASELINE_TESTS) break
    if (afterFam[c - 1].day < from) continue // haftalık yol henüz hazır değildi: sinyal aranmaz
    const b = median(afterFam.slice(0, m).map((t) => t.logMAR))
    const last3 = afterFam.slice(c - 3, c)
    if (last3.every((t) => r3(t.logMAR - b) >= YELLOW_DELTA)) {
      frozen = true
      break
    }
  }
  return { tests: afterFam.slice(0, m), grown: m >= MIN_BASELINE_TESTS, frozen }
}

// Başlangıç henüz hazır değilken hangi yolun metni gösterilir (yalnız metin; kural etkilenmez). Haftalık plan olağan
// yoldur: haftalık testi olan kişi, günlük yolu (8. günden sonra 7 test) haftalık yoldan (3 haftalık test) daha önce
// bitirecek sıklıkta test etmiyorsa haftalık metni görür. İnceleme 2026-09-29: yol son testin türüne göre seçiliyordu,
// haftalık planda tek bir isteğe bağlı kısa test "8. günden itibaren en az 7 test" metnini getiriyordu.
// Tahmin (VARSAYIM, yalnız metin seçimi): günlük yol 8. günden beri görülen test sıklığıyla sürer, haftalık yol haftada
// bir testle (son haftalık testten 7 gün sonra, gecikmişse bugün). Eşitlikte haftalık.
function pendingMode({ withDay, afterFam, weeklyDone, baseEnd, today }) {
  // Günlük yolu zaten 7 teste varmış seri (21. günü bekliyor)
  if (baseEnd != null) return 'daily'
  const weeklyAll = withDay.filter(isWeekly)
  const need = Math.max(1, WEEKLY_MIN_BASELINE_TESTS - weeklyDone.length)
  // Sonraki haftalık test: son haftalıktan 7 gün sonra; hiç haftalık yoksa bugün. Alışma günlerindeki test başlangıca
  // girmez, en erken 8. gün. Haftalık testi hiç olmayan seri de (yalnız kısa test eden) bu tahmine girer: sık kısa
  // test eden günlük metni, seyrek test eden haftalık planın metnini görür (inceleme 2026-09-29, 2. tur).
  const next = Math.max(today, BASELINE_FROM_DAY, weeklyAll.length ? weeklyAll.at(-1).day + 7 : 0)
  const weeklyEta = Math.max(BASELINE_TO_DAY + 1, next + 7 * (need - 1))
  const seen = today - BASELINE_FROM_DAY + 1 // 8. günden bu yana geçen gün (bugün dahil)
  const rate = seen > 0 ? afterFam.length / seen : 0
  if (!(rate > 0)) return 'weekly'
  const dailyEta = Math.max(BASELINE_TO_DAY + 1, today + Math.ceil((MIN_BASELINE_TESTS - afterFam.length) / rate) + 1)
  return dailyEta < weeklyEta ? 'daily' : 'weekly'
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

  // Başlangıç, günlük yol: 8. günden itibaren en az MIN_BASELINE_TESTS test, en erken 21. güne kadar. 21. günde
  // yetmediyse pencere o sayıdaki teste kadar uzar (seyrek test eden kullanıcı hiç takibe geçmeden kalmasın).
  const afterFam = withDay.filter((t) => t.day >= BASELINE_FROM_DAY)
  const lastBase = afterFam[MIN_BASELINE_TESTS - 1]
  const baseEnd = lastBase ? Math.max(BASELINE_TO_DAY, lastBase.day) : null
  // Haftalık yol: tanışmadan sonra 3 haftalık test (en erken 22. gün); günlük yoldan önce hazırsa seçilir. Günlük yol
  // baseEnd'in ertesi günü hazır olur, haftalık yol weeklyFrom günü. Her gün test eden (8–21. günlerde 7 test)
  // kullanıcı günlük yolda kalır, başlangıcı değişmez. Yol kayıtlardan türetilir, saklanmaz.
  const weeklyDone = afterFam.filter(isWeekly)
  const lastWeekly = weeklyDone[WEEKLY_MIN_BASELINE_TESTS - 1]
  const weeklyFrom = lastWeekly ? Math.max(BASELINE_TO_DAY + 1, lastWeekly.day) : null
  const weeklyPath = weeklyFrom != null && (baseEnd == null || weeklyFrom <= baseEnd)
  const weeklyBase = weeklyPath ? growingBaseline(afterFam, weeklyFrom) : null
  const baseTests = weeklyPath ? weeklyBase.tests : baseEnd == null ? [] : afterFam.filter((t) => t.day <= baseEnd)
  const baselineReady = weeklyPath ? today >= weeklyFrom : baseEnd != null && today > baseEnd
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
  // Seyrek seri (karar S9): son 7 günde 3 test yok. Haftalık testte (2026-09-29'dan beri olağan plan) seri hep
  // seyrektir; iki göz (OU) zaten yalnız haftalık ölçülür (eski kuralla kırmızı hiç çıkamıyordu).
  const sparse = last7.length < 3
  // Başlangıçla karşılaştırılan değer: sık seride son 7 günün ortancası; seyrek seride son 3 testin ortancası (son 7
  // günde test olsa da). Böylece uyarı yalnız zaman geçti diye kaybolmaz (plan H5) ve haftalık seride değer bir test
  // sonrası tek teste, bir hafta sonra kendiliğinden 3 testin ortancasına atlamaz (inceleme 2026-09-29). Seyrek seride
  // uyarı zaten son 3 testin her birine bakar (worse3 / better3), değer yalnız gösterimi değiştirir. current7 yalnız
  // son 7 günün ortancası olarak kalır ("Son 7 gün" etiketi doğru kalsın).
  const currentWindow = sparse ? 'last3' : 'days7'
  const current = sparse ? median(last3.map((t) => t.logMAR)) : current7
  // Farklar 3 basamağa yuvarlanarak karşılaştırılır (r3, yukarıda)
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
      // Sık ölçüm kuralı (değişmedi): son 7 gündeki en az 3 testin hepsi ≥ 0,2 kötü ve pencere bir haftaya yayılıyor
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
    // current: başlangıçla karşılaştırılan değer; currentWindow 'days7' = son 7 günün ortancası (sık seri), 'last3' =
    // son 3 testin ortancası (seyrek seri: son 7 günde 3 test yok)
    current: current != null ? +current.toFixed(3) : null,
    currentWindow,
    delta: delta != null ? +delta.toFixed(3) : null,
    // Başlangıcın yolu: 'weekly' | 'daily'. Hazır değilken hangi yolun önce biteceğine göre (pendingMode; yalnız metin).
    // baselineTests: başlangıca giren test sayısı (haftalık yolda 3–7); baselineFrozen: haftalık yolda büyüme 7'ye
    // varmadan kötüleşmede durdu; weeklyDone: tanışma sonrası haftalık test sayısı.
    baselineMode: weeklyPath ? 'weekly' : baselineReady ? 'daily' : pendingMode({ withDay, afterFam, weeklyDone, baseEnd, today }),
    baselineTests: baselineReady ? baseTests.length : null,
    baselineFrozen: weeklyBase?.frozen ?? false,
    weeklyDone: weeklyDone.length,
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
      return r.baselineMode === 'weekly'
        ? 'Alışma dönemi. İlk haftalık testin sonucu, testi yeni öğrendiğin için biraz farklı çıkabilir; değerlendirmeye katılmaz.'
        : 'Alışma dönemi (ilk 7 gün). Bu günlerde sonuçlar testi öğrenmenle değişebilir; değerlendirmeye katılmaz.'
    case 'baseline':
      if (r.baselineMode === 'weekly') {
        // Haftalık yol: tanışmadan sonra 3 haftalık test; en erken 22. gün
        const n = r.weeklyDone ?? 0
        if (n >= WEEKLY_MIN_BASELINE_TESTS) return 'Başlangıç için 3 haftalık test tamam; değerlendirme 22. günde başlar.'
        return n > 0
          ? `Başlangıç değerin 3 haftalık testle oluşuyor; ${n} test tamam. Şimdilik değişim yorumlanmıyor.`
          : 'Başlangıç değerin sonraki 3 haftalık testle oluşacak. Şimdilik değişim yorumlanmıyor.'
      }
      // Günlük yol (son test kısa test ya da eski günlük seri)
      return 'Başlangıç değerin oluşturuluyor (8. günden itibaren en az 7 test, en erken 21. güne kadar). Şimdilik değişim yorumlanmıyor.'
    default:
      break
  }
  // Seyrek seride (r.sparse: son 7 günde 3 test yok; haftalık testte hep böyle) "son bir hafta" ve "son 7 günün
  // ortancası" doğru olmaz; metin son 3 teste dayanır. Sarıda "birkaç gün daha test et" denmez (2026-09-29: E testi
  // haftada bir; hiçbir metin her gün test istemez): iki yolda da "sonraki testlerde de sürerse".
  if (r.alert === 'red') {
    return r.sparse
      ? 'Son 3 ölçümün de başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.'
      : 'Son bir haftadır görme ölçümlerin başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur.'
  }
  if (r.alert === 'yellow') {
    return 'Son ölçümlerin başlangıcından biraz kötü. Işığı ve mesafeyi kontrol et; sonraki testlerde de sürerse göz doktoruna danış.'
  }
  if (r.trend === 'improving') {
    return 'Son ölçümlerin başlangıcından daha iyi. Not: Bir kısmı teste alışmaktan kaynaklanabilir.'
  }
  // "Sabit" denmez: kural yalnız "doğrulanmış değişim yok" der (ortanca farkı eşik altında ya da son 3 test doğrulamıyor).
  // ±0,2: iki tek test arasındaki %95 fark, klinikte gözetimli tablet/telefon yakın testleri (Joseph 2023,
  // Katibeh 2022, Han 2019; lib/sources.js); evde daha geniş olabilir.
  // Seyrek seri (haftalık plan): "seyrek" denmez, olağan plan kullanıcının kusuru gibi okunmasın
  if (r.sparse) {
    return 'Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.'
  }
  return 'Başlangıç değerine göre doğrulanmış bir değişim yok. Değerlendirme son 7 günün ortancası ve son 3 testle yapılır; tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir.'
}
