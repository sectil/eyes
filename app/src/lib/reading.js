// Okuma hızı testi (MNREAD mantığında; MNREAD cümleleri telifli olduğu için
// kendi Türkçe cümlelerimiz kullanılır). KLİNİK OLARAK DOĞRULANMAMIŞTIR.
// Sonuçlar yalnızca aynı cihazda, kişinin kendi önceki sonuçlarıyla karşılaştırılmalıdır
// (tablet ≠ basılı: Altınbay 2022, bkz. SENTEZ_RAPORU.md §9).

// Standart kelime = 6 karakter (boşluk dahil) — okuma araştırmalarında yaygın kural.
export const CHARS_PER_STANDARD_WORD = 6

// 55–65 karakter, noktalamasız, günlük dil. Uzunluk testlerde doğrulanır.
export const SENTENCES = [
  'annem her sabah bahçedeki çiçekleri sulamayı hiç unutmaz',
  'kardeşim okul çantasını kapının yanına bırakıp oyuna koştu',
  'akşam yemeğinden sonra hep birlikte sahilde yürüyüş yaptık',
  'komşumuzun kedisi güneşli pencerenin önünde uyumayı sever',
  'pazar günü dedemle birlikte göl kenarında balık tutmaya gittik',
  'yağmur başlayınca herkes şemsiyesini açıp eve doğru yürüdü',
  'babam gazetesini okurken sıcak çayını yavaşça yudumluyordu',
  'öğretmen tahtaya yazdığı soruları tek tek sesli okumaya başladı',
  'sabah erkenden kalkıp fırından taze ekmek almaya gittim',
  'küçük çocuk parktaki kaydıraktan kayarken çok mutlu görünüyordu',
  'yaz tatilinde köydeki evimizin bahçesinde domates yetiştirdik',
  'arkadaşım bana doğum günümde güzel bir kitap hediye etti',
  'kış gelince dağların tepesi bembeyaz karla kaplanmaya başladı',
  'teyzem mutfakta en sevdiğimiz elmalı keki pişirmeye başladı',
  'otobüs durağında beklerken yanımdaki kadınla sohbet ettik',
  'bahar geldiğinde ağaçlar yeşillenir ve kuşlar şarkı söyler',
  'hafta sonu ailece pikniğe gidip çimlerin üstünde oturduk',
  'kütüphanede sessizce ders çalışan öğrenciler vardı her masada',
  'dedem gençliğinde yaşadığı ilginç olayları anlatmayı çok sever',
  'akşamüstü denizin üzerinde batan güneşi uzun uzun seyrettik',
  'marketten süt yumurta ve biraz meyve alıp eve geri döndüm',
  'köpeğimiz her akşam kapının önünde bizim gelmemizi bekler',
  'annemle birlikte eski fotoğraflara bakıp eski günleri andık',
  'yeni aldığım bisikletle mahallenin sokaklarında dolaştım',
  'ablam üniversiteyi bitirince büyük bir şehirde işe başladı',
  'sonbaharda yerlere düşen sarı yapraklar rüzgarla savruldu',
  'çarşıdaki eski saatçi dükkânı yıllardır aynı yerde duruyor',
  'bayram sabahı erkenden kalkıp büyüklerimizin elini öptük',
  'sınıftaki bütün çocuklar resim dersini sabırsızlıkla bekler',
  'balkondaki saksılarda fesleğen ve nane yetiştirmeyi seviyorum',
  'tren istasyonunda bekleyen yolcular saatlerine bakıp duruyordu',
  'amcam tarladan topladığı kirazları bize bir sepetle getirdi',
  'gece yıldızlara bakarken kayan bir yıldız gördük ve dilek tuttuk',
  'babaannem örgü örerken bir yandan da radyo dinlemeyi sever',
  'okulun bahçesinde çocuklar top oynarken çok gürültü yapıyordu',
  'deniz kenarındaki küçük kafede oturup soğuk limonata içtik',
  'kuzenim yaz tatilinde yüzme öğrenmek için kursa yazıldı',
  'sabahları yürüyüşe çıkınca kendimi gün boyu daha iyi hissederim',
  'annem akşam yemeği için mercimek çorbası ve pilav hazırladı',
  'mahalledeki fırıncı her sabah bize güler yüzle selam verir',
]

// Bir oturum için tekrarsız cümle seçimi; son kullanılanlar mümkünse atlanır
export function pickSentences(count, recentlyUsed = [], rng = Math.random) {
  const recent = new Set(recentlyUsed)
  const fresh = SENTENCES.filter((s) => !recent.has(s))
  const pool = fresh.length >= count ? fresh : [...SENTENCES]
  const a = [...pool]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, count)
}

export function wordsPerMinute(sentence, seconds) {
  if (!(seconds > 0)) return null
  return (sentence.length / CHARS_PER_STANDARD_WORD) * (60 / seconds)
}

// Analiz. trials: [{ logMAR, seconds|null (okuyamadı) , sentence }], büyükten küçüğe
// Döner: { maxReadingSpeed, criticalPrintSize, readingAcuity }
// VARSAYIM: MRS = kritik boyuttan büyük boyutlardaki hızların ortalaması;
// kritik boyut = hızın MRS'nin %80'inin altına düştüğü ilk boyuttan bir önceki.
export function analyzeReading(trials, threshold = 0.8) {
  const read = trials
    .filter((t) => t.seconds > 0)
    .map((t) => ({ ...t, wpm: wordsPerMinute(t.sentence, t.seconds) }))
    .sort((a, b) => b.logMAR - a.logMAR)
  if (!read.length) return { maxReadingSpeed: null, criticalPrintSize: null, readingAcuity: null }

  const readingAcuity = read.at(-1).logMAR

  // En büyükten başlayarak koşan ortalamanın %80'inin altına düşülen ilk noktayı bul
  let cutoff = read.length
  for (let i = 1; i < read.length; i++) {
    const mean = read.slice(0, i).reduce((a, t) => a + t.wpm, 0) / i
    if (read[i].wpm < threshold * mean) {
      cutoff = i
      break
    }
  }
  const plateau = read.slice(0, cutoff)
  const maxReadingSpeed = plateau.reduce((a, t) => a + t.wpm, 0) / plateau.length
  const criticalPrintSize = plateau.at(-1).logMAR

  return {
    maxReadingSpeed: Math.round(maxReadingSpeed),
    criticalPrintSize: +criticalPrintSize.toFixed(2),
    readingAcuity: +readingAcuity.toFixed(2),
  }
}

// Yazı boyutu: MNREAD tanımında baskı boyutu x-yüksekliği ile tanımlanır.
// x-yüksekliği θ yay dakikası ise logMAR = log10(θ / 5).
// xHeightRatio: yazı tipinin x-yüksekliği / font-size (çalışma anında ölçülür).
export function fontSizeCssPx(logMAR, distanceMm, pxPerMm, xHeightRatio) {
  const arcmin = 5 * 10 ** logMAR
  const xHeightMm = 2 * distanceMm * Math.tan((arcmin * Math.PI) / (180 * 60) / 2)
  return (xHeightMm * pxPerMm) / xHeightRatio
}

// Tarayıcıda yazı tipinin x-yüksekliği oranını ölçer
export function measureXHeightRatio(fontFamily) {
  try {
    const c = document.createElement('canvas').getContext('2d')
    c.font = `100px ${fontFamily}`
    const m = c.measureText('x')
    const r = m.actualBoundingBoxAscent / 100
    return r > 0.3 && r < 0.8 ? r : 0.52
  } catch {
    return 0.52
  }
}
