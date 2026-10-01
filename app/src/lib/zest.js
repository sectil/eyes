// ZEST (QUEST'in posterior ortalama kuralı) ile adaptif görme keskinliği eşiği.
// Kaynak gerekçesi: bkz. docs/arastirma/ajan-raporlari/13_gunluk_takip.md §4.2 ve
// src/lib/staircase.js başındaki "neden iniş + ince ayar" notu.
//
// Psikometrik fonksiyon (4 seçenekli zorunlu seçim, tumbling E):
//   p(doğru | x, θ) = γ + (1 − γ − λ) · 1 / (1 + exp(−(x − θ) / s))
//   x: gösterilen logMAR, θ: eşik logMAR (bu noktada F = 0.5 → p ≈ %62)
//   γ = 0,25: 4 yönde rastgele tahminle doğru bilme olasılığı (Carkeet 2001,
//   Optom Vis Sci 78:529, DOI 10.1097/00006324-200107000-00017, PMID 11503943).
// Eğim s = 0,05 logMAR (lojistik). Dayanak, harf tablosunda ölçülen psikometrik "probit size"
// (kümülatif normalin genişliği):
//   - Carkeet 2001, Optom Vis Sci 78:113, PMID 11265926, DOI 10.1097/00006324-200102000-00012:
//     iyi düzeltilmiş gözde ≈0,07 logMAR, +1/+2 D bulanıklıkla 0,12'ye kadar.
//   - Carkeet & Bailey 2017, Ophthalmic Physiol Opt 37:118, PMID 28211180, DOI 10.1111/opo.12357:
//     yüksek kontrastlı harfte 0,064–0,071 logMAR (Monte Carlo'ya göre gerçek değer 0,016–0,019 daha geniş).
//   Orta noktada eğim eşlenirse lojistik s = σ·√(2π)/4 ≈ 0,63·σ: σ 0,07 → s 0,044; σ 0,12 → s 0,075.
//   s = 0,05 bu aralıkta. VARSAYIM: "probit size" normalin σ'sı olarak okundu (özetlerden; tam metin okunmadı).
//   Bu ölçümler Sloan / Bailey-Lovie harfleriyle yapıldı, tumbling E ile değil.
// Dikkat hatası λ = 0,02: yukarıdaki iki çalışmanın özetleri bir dikkat hatası oranı vermez. VARSAYIM olarak
// kalır. Simülasyon testleri (staircase.test.js) eğim/λ uyumsuz gözlemcide de sapmanın küçük kaldığını doğrular.

export const GUESS = 0.25
export const LAPSE = 0.02
export const SLOPE = 0.05

// "Göremiyorum" cevabı (update'e doğru/yanlış yerine verilir).
// Sorun: model, görülmeyen harfte kişinin %25 şansla doğru tahmin ettiğini varsayar (γ). Tahmin
// yerine düğmeye basan kişi bu şans doğrularını hiç vermez; düğme "yanlış" sayılırsa sonuç
// sistematik olarak daha kötü çıkar (simülasyonda +0,03 logMAR, yayvan gözlemcide +0,06).
// Çözüm: düğme, "rastgele bir yön seçseydi" cevabının BEKLENEN log-olabilirliği ile işlenir:
//   log L = γ · log p(doğru) + (1 − γ) · log(1 − p(doğru))
// Bu, "Göremiyorum"u rastgele yön olarak puanlamanın gürültüsüz (zar atmadan) karşılığıdır:
// modelin beklediği cevap dağılımıyla ortalamada aynıdır, tahmin gürültüsü eklemez.
// Not: yalnızca 1 − F(x) ("algılamadım") olabilirliği yetmez: 1 − p(doğru) = (1 − γ)(1 − F) + λF
// olduğundan biçimi "yanlış"la neredeyse aynıdır ve aynı sapmayı verir (simülasyonda +0,031).
// Asıl kaymayı yaratan, doğru cevaplardaki γ tabanının karşılıksız kalmasıdır.
// VARSAYIM: kişi bu düğmeye yalnızca harfi gerçekten seçemediğinde (yoksa tahmin edeceği
// durumda) basar; düğmeyi hiç, bazen ya da her zaman kullanması sonucu kaydırmaz.
export const UNSEEN = 'unseen'

const GRID_MIN = -0.4
const GRID_MAX = 1.5
const GRID_STEP = 0.01

export function pCorrect(x, theta, slope = SLOPE) {
  const f = 1 / (1 + Math.exp(-(x - theta) / slope))
  return GUESS + (1 - GUESS - LAPSE) * f
}

// options: { priorMean, priorSd, minX, maxX, maxJump }
// maxJump (logMAR, isteğe bağlı): next() bir önceki gösterilen boyuttan en fazla bu kadar
// uzaklaşır. Kullanıcıya "harf rastgele sıçrıyor" hissi vermemek için (staircase.js).
export function createZest({ priorMean = 0.4, priorSd = 0.4, minX = -0.3, maxX = 1.3, maxJump = null } = {}) {
  const grid = []
  for (let t = GRID_MIN; t <= GRID_MAX + 1e-9; t += GRID_STEP) grid.push(+t.toFixed(4))
  // Normal öncül (log-olasılık olarak tutulur, sayısal kararlılık için)
  let logPost = grid.map((t) => -0.5 * ((t - priorMean) / priorSd) ** 2)
  const history = []
  let cache = null // { mean, sd } — her güncellemede sıfırlanır

  function moments() {
    if (cache) return cache
    const m = Math.max(...logPost)
    let sum = 0
    let s1 = 0
    const w = logPost.map((l) => Math.exp(l - m))
    for (let i = 0; i < grid.length; i++) {
      sum += w[i]
      s1 += w[i] * grid[i]
    }
    const mean = s1 / sum
    let s2 = 0
    for (let i = 0; i < grid.length; i++) s2 += w[i] * (grid[i] - mean) ** 2
    cache = { mean, sd: Math.sqrt(s2 / sum) }
    return cache
  }

  const clamp = (x) => Math.min(maxX, Math.max(minX, x))

  return {
    // Bir sonraki gösterilecek logMAR (posterior ortalaması; sınır ve sıçrama sınırı uygulanır)
    next() {
      let x = moments().mean
      const last = history.at(-1)?.x
      if (maxJump != null && last != null) x = Math.min(last + maxJump, Math.max(last - maxJump, x))
      return clamp(x)
    },
    // Cevabı işle. x: gerçekte gösterilen logMAR (piksel yuvarlaması sonrası).
    // response: true (doğru) | false (yanlış) | UNSEEN ("Göremiyorum").
    update(x, response) {
      const unseen = response === UNSEEN
      logPost = logPost.map((l, i) => {
        const p = pCorrect(x, grid[i])
        if (unseen) return l + GUESS * Math.log(p) + (1 - GUESS) * Math.log(1 - p)
        return l + Math.log(response ? p : 1 - p)
      })
      history.push(unseen ? { x, correct: false, unseen: true } : { x, correct: Boolean(response) })
      cache = null
    },
    // Tahmin gösterilebilen aralığın dışına taşarsa sınıra kısılır ve işaretlenir
    estimate: () => {
      const { mean, sd } = moments()
      return {
        logMAR: clamp(mean),
        sd,
        trials: history.length,
        atCeiling: mean > maxX,
        atFloor: mean < minX,
      }
    },
    history: () => [...history],
  }
}

// Tumbling E yönleri
export const DIRECTIONS = ['up', 'right', 'down', 'left']

export function randomDirection(rng = Math.random) {
  return DIRECTIONS[Math.floor(rng() * 4) % 4]
}

// Test planları (bkz. SENTEZ_RAPORU.md §10, 13_gunluk_takip.md §4.2 ve §7).
// trials: sayılan deneme üst sınırı (ısınma hariç). minTrials: en az deneme. minFine: ince ayar
// (ZEST) evresinde en az deneme. stopSd: posterior SD bu değerin altına inince durulabilir.
//
// Neden bu sayılar:
//  - FrACT (8 seçenekli Landolt C): test–tekrar test uyumu 6→18 denemede ±0,46→±0,17 logMAR
//    düzelir, 18'de "kırılma" var; 4 seçenekli tumbling E için "daha fazla deneme gerekir"
//    (Bach 2024, Graefes Arch, DOI 10.1007/s00417-024-06638-z, PMID 39294391).
//  - Eşikte deneme başına Fisher bilgisi 4AFC'de 8AFC'nin ≈0,76 katı (aynı eğim ve λ ile
//    hesap) → 18 × 1/0,76 ≈ 24 deneme. VARSAYIM: bu oran eğim ve λ varsayımına dayanır.
//  - Dağılıma (SD) bakarak erken durmak şans eseri çok erken bitirebilir (Bach 2024) →
//    minTrials yüksek tutuldu; stopSd yalnızca üst sınırdan önce bitirmeye yarar.
//  - Günlük ≈20, haftalık 30–40 deneme önerisi: 13_gunluk_takip.md §7.
//  - Build 24 (kullanıcı geri bildirimi: üç göz × 24 harf fazla, test bırakılıyor): günlük 20 (en az 14),
//    haftalık 28 (en az 20). Bedeli simülasyonla ölçüldü (550 sanal kişi, iki gözlemci modeli):
//    günlük hata SD 0,046→0,057 (uyumsuz gözlemci 0,075→0,088), haftalık 0,031→0,042 (0,054→0,069).
//    Günlük SD 0,057, iki test arasındaki fark olarak ≈ ±0,16 (%95) eder: klinikte gözetimli tablet/telefon yakın
//    testlerinin test-tekrar aralığı ±0,13–0,24'ün içinde (Joseph 2023 PMID 38015309, Katibeh 2022 PMID 36583912,
//    Han 2019 PMID 31440424; lib/sources.js). Eski not "ETDRS ±0,1 (Beck 2003)" doğrulanmadı: Beck özeti tekrarların
//    %89'unun 0,1, %98'inin 0,2 içinde kaldığını söyler; "±0,1" diye özetlemek yanlıştı (2026-09-26 kanıt kontrolü).
//    Bach 2024'ün 8 seçenekli testte gördüğü "18 denemede kırılma" 4 seçenekte daha geç gelir; günlükte
//    bilerek bunun altına inildi, haftalık test daha kesin ölçüm olarak kalır. Günlük test yalnız iki tek göz.
//  - Haftalık sabit 28 (karar S2, 2026-09-28): en az 20 iken simülasyonda koşuların %69–78'i tam 20'de
//    duruyordu (SD ≤ 0,06). Tekrar ölçüm uyum sınırı ±0,128 → ±0,104 (model gözlemci), ±0,197 → ±0,168
//    (uyumsuz gözlemci); |hata| > 0,15 oranı %3,7 → %1,8 (plan H6, kendi simülasyonumuz). Bach 2024 (yukarıda):
//    SD'ye bakıp durmak erken bitirebilir. Haftalıkta minTrials = trials olduğu için stopSd kullanılmaz.
// VARSAYIM: minFine ve stopSd değerleri simülasyonla seçildi (staircase.test.js).
export const PLANS = {
  daily: { warmup: 2, trials: 20, minTrials: 14, minFine: 8, stopSd: 0.07 },
  weekly: { warmup: 2, trials: 28, minTrials: 28, minFine: 10, stopSd: 0.06 },
}

// estimate: { trials, sd, fineTrials? } — fineTrials verilmişse plan.minFine de aranır.
export function shouldStop(estimate, plan) {
  if (estimate.trials >= plan.trials) return true
  if (plan.minFine != null && estimate.fineTrials != null && estimate.fineTrials < plan.minFine) return false
  return estimate.trials >= plan.minTrials && estimate.sd <= plan.stopSd
}
