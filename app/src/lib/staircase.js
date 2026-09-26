// "E hangi yönde" testinin boyut mantığı: İNİŞ (merdiven) + İNCE AYAR (sınırlı ZEST).
//
// Neden saf ZEST değil?
//   Saf Bayesçi yöntem her denemede "en bilgilendirici" boyutu seçer; ilk denemelerde harf
//   büyüyüp küçülerek sıçrar ve kullanıcı bunu rastgele sanır. Klinik ve bilgisayarlı testler
//   bu yüzden iki evre kullanır:
//   - ETDRS çizelgesi: büyükten küçüğe 0,1 logMAR'lık satırlar, harf-harf puanlama; sonlandırma
//     kuralı sonucu ve tekrarlanabilirliği etkiler (Carkeet 2001, Optom Vis Sci 78:529,
//     DOI 10.1097/00006324-200107000-00017, PMID 11503943: kural, seçenek sayısına göre seçilmeli;
//     Cohen 2021, Acta Ophthalmol 99:e1281, DOI 10.1111/aos.14807: bilgisayarlı Bayesçi test
//     11 harfte ETDRS'nin tekrarlanabilirliğine ulaştı, 20 harfte geçti).
//   - E-ETDRS: önce "tarama" (yaklaşık düzey), sonra eşik evresi (Beck 2003, Am J Ophthalmol
//     135:194, DOI 10.1016/s0002-9394(02)01825-1, PMID 12566024).
//   - FrACT: kolay büyük boyuttan başlar, İLK YANLIŞA kadar büyük adımlarla küçülür
//     (1,0 → 0,7 → 0,4 … logMAR), sonra Bayesçi "Best PEST" devralır; ilk kolay denemeler
//     eşik hakkında az bilgi verir, kullanıcıyı alıştırır (Bach 2024, Graefes Arch,
//     DOI 10.1007/s00417-024-06638-z, PMID 39294391).
//   - Peek Acuity (tumbling E, akıllı telefon) da merdiven ("stair-casing") kullanır
//     (Bastawrous 2015, JAMA Ophthalmol 133:930, DOI 10.1001/jamaophthalmol.2015.1468,
//     PMID 26022921). Ayrıntılı kural yayının ek dosyasında; doğrulanamadı, birebir kopyalanmadı.
//
// Algoritma
//   Evre A — İNİŞ (kullanıcı "harf adım adım küçülüyor" görür, boyut hiç büyümez):
//     1) Hızlı iniş: başlangıç 0,8 logMAR (ısınma 1,0'da yapılır). Her doğru cevapta bir satır
//        küçül (FAST_STEP = 0,2). Bu boyutlar eşiğin çok üstünde; doğru olasılığı ≈%98.
//     2) İlk yanlışta satır kuralına geç: aynı satırda en fazla 3 harf; 2 doğru → satırı geç ve
//        0,1 logMAR küçül; 2 yanlış → iniş biter. Tek doğru yetmez: 4 yönde rastgele tahminle
//        doğru olasılığı %25; "3 harfte 2 doğru" şansla geçme olasılığını %15,6'ya indirir
//        (3·0,25²·0,75 + 0,25³). VARSAYIM: 0,2 / 0,1 adım ve 3'te 2 kuralı ETDRS satır aralığı
//        ile FrACT hızlı inişinin birleşimidir; simülasyonla sınandı.
//   Evre B — İNCE AYAR: ZEST (posterior ortalaması). Posterior, inişteki TÜM cevapları da
//     içerir; yani ince ayar kendiliğinden iniş sonucunun çevresinde başlar (öncülü iniş
//     sonucuna ortalamanın Bayes'çe tam karşılığı). Gösterilen boyut, bir öncekinden en fazla
//     MAX_JUMP = 0,2 logMAR farklı olabilir (sıçrama sınırı).
//   Durma: zest.js shouldStop (en az deneme + en az ince ayar denemesi + posterior SD) ya da
//     üst sınır.
//   "Göremiyorum": posteriora zest.js UNSEEN kuralıyla (rastgele yön tahmininin beklenen
//     olabilirliği) girer, yanlış sayılıp sonucu kötüye kaydırmaz. İnişin satır kuralında ise
//     yanlış sayılır: iniş yalnızca ince ayarın nereden başlayacağını belirler; erken durması güvenli.

import { createZest, shouldStop, UNSEEN } from './zest.js'

export const START_LOGMAR = 0.8
export const FAST_STEP = 0.2
export const FINE_STEP = 0.1
export const LEVEL_MAX = 3 // bir satırda en fazla harf
export const LEVEL_PASS = 2 // satırı geçmek için doğru
export const LEVEL_FAIL = 2 // inişi bitiren yanlış
export const MAX_JUMP = 0.2
// VARSAYIM: geniş öncül (ort. 0,4, SD 0,5) — kişinin önceki sonucuna göre başlatılmaz,
// yanlılığı azaltmak için (13_gunluk_takip.md §2.2).
export const PRIOR = { mean: 0.4, sd: 0.5 }

const round3 = (v) => Math.round(v * 1000) / 1000

// Saf iniş merdiveni (Evre A). Yalnızca doğru/yanlış bilgisiyle çalışır.
// quantize (isteğe bağlı): hedef logMAR → ekranda gerçekten çizilecek logMAR. Harf birimi cihaz
// pikseline yuvarlandığı için (optotype.js renderSpec) küçük boyutlarda iki komşu satır aynı
// büyüklükte çizilebilir; kullanıcı "harf küçülmedi" görmesin diye bir sonraki satır, gerçekten
// daha küçük çizilen ilk boyuta atlar.
// Döner: { level, mode: 'fast'|'row', done, reason, lastPassed, update(correct), trials }
export function createDescent({ start = START_LOGMAR, fastStep = FAST_STEP, fineStep = FINE_STEP, minX = -0.3, maxX = 1.3, quantize = null } = {}) {
  const s = {
    level: round3(Math.min(maxX, Math.max(minX, start))),
    mode: fastStep > fineStep ? 'fast' : 'row',
    done: false,
    reason: null, // 'fail' | 'floor'
    lastPassed: null,
    trials: 0,
  }
  let correct = 0
  let wrong = 0

  const shows = (x) => (quantize ? quantize(x) : x)

  function stepDown(step) {
    s.lastPassed = s.level
    correct = 0
    wrong = 0
    const current = shows(s.level)
    let nextLevel = round3(s.level - step)
    // Aynı büyüklükte çizilecekse bir sonraki satıra geç (en fazla 10 satır)
    for (let k = 0; k < 10 && nextLevel >= minX - 1e-9 && shows(nextLevel) >= current - 0.005; k++) {
      nextLevel = round3(nextLevel - fineStep)
    }
    if (nextLevel >= minX - 1e-9) s.level = nextLevel
    else if (s.level > minX + 0.005 && shows(minX) < current - 0.005) s.level = round3(minX) // ekranın en küçüğü
    else {
      s.done = true
      s.reason = 'floor'
    }
  }

  s.update = (isCorrect) => {
    if (s.done) return s
    s.trials += 1
    if (s.mode === 'fast') {
      if (isCorrect) stepDown(fastStep)
      else {
        // İlk yanlış: aynı satırda satır kuralına geç (bu yanlış sayılır)
        s.mode = 'row'
        wrong = 1
      }
      return s
    }
    if (isCorrect) correct += 1
    else wrong += 1
    if (correct >= LEVEL_PASS) stepDown(fineStep)
    else if (wrong >= LEVEL_FAIL || correct + wrong >= LEVEL_MAX) {
      s.done = true
      s.reason = 'fail'
    }
    return s
  }
  s.rowCounts = () => ({ correct, wrong })
  return s
}

// Tam test: iniş + ince ayar. plan: zest.js PLANS öğesi.
// shown (update'e verilen): gerçekte çizilen boyutun logMAR'ı (piksel yuvarlaması, canlı mesafe).
// quantize: bkz. createDescent (canlı mesafede her çağrıda güncel mesafeyle hesaplanabilir).
export function createAcuityStaircase(plan, { minX = -0.3, maxX = 1.3, start = START_LOGMAR, quantize = null } = {}) {
  const descent = createDescent({ start, minX, maxX, quantize })
  const zest = createZest({ priorMean: PRIOR.mean, priorSd: PRIOR.sd, minX, maxX, maxJump: MAX_JUMP })
  let phase = 'descent'
  let trials = 0
  let fineTrials = 0
  // İnce ayara en az minFine deneme kalsın diye inişe üst sınır
  const descentCap = Math.max(1, plan.trials - (plan.minFine ?? 0))

  function estimate() {
    const e = zest.estimate()
    return { ...e, trials, fineTrials, descentTrials: descent.trials, descentLevel: descent.lastPassed }
  }

  function remaining() {
    const left = plan.trials - trials
    if (left <= 0) return 0
    const minLeft = Math.max(plan.minTrials - trials, (plan.minFine ?? 0) - fineTrials, 0)
    if (phase === 'descent') {
      // Tahmini: bugünkü posterior ortalamasına kaç satır var + ince ayar
      const m = zest.estimate().logMAR
      const rows = Math.max(0, Math.ceil((descent.level - m) / (descent.mode === 'fast' ? FAST_STEP : FINE_STEP)))
      const perRow = descent.mode === 'fast' ? 1 : 2
      const guess = rows * perRow + 2 + (plan.minFine ?? 0)
      return Math.min(left, Math.max(minLeft, guess, 1))
    }
    const e = zest.estimate()
    return Math.min(left, Math.max(minLeft, e.sd > plan.stopSd ? 2 : 0))
  }

  return {
    // Sıradaki hedef boyut ve evre
    next() {
      if (phase === 'descent') return { logMAR: descent.level, phase }
      return { logMAR: zest.next(), phase }
    },
    // response: true | false | UNSEEN ("Göremiyorum", bkz. zest.js)
    update(shown, response) {
      if (this.done()) return
      trials += 1
      zest.update(shown, response)
      if (phase === 'descent') {
        descent.update(response !== UNSEEN && Boolean(response))
        if (descent.done || trials >= descentCap) phase = 'fine'
      } else fineTrials += 1
    },
    done() {
      return shouldStop({ ...zest.estimate(), trials, fineTrials }, plan) && (phase === 'fine' || trials >= plan.trials)
    },
    estimate,
    // remaining: tahmini kalan (ilerleme çubuğu için); remainingMax: kesin üst sınır
    progress() {
      return { phase, trials, fineTrials, maxTrials: plan.trials, remaining: remaining(), remainingMax: Math.max(0, plan.trials - trials) }
    },
    history: () => zest.history(),
  }
}

// Ekrandaki "kalan harf" yazısı. p: progress() çıktısı; shown: bu gözde şimdiye dek gösterilen
// en küçük sayı (ilk çağrıda Infinity; dönen shown bir sonraki çağrıya verilir).
//   'last'  : kesin üst sınır ≤ 2 → "son harfler" (yalnızca gerçekten bitmek üzereyken)
//   'few'   : tahmin ≤ 2 ama bitiş posterior belirsizliğine bağlı (üst sınır > 2) → sayı verilmez
//             ("az kaldı"; en çok plan.trials − minTrials harf sürer: günlükte 6, haftalıkta 10)
//   'approx': ~count harf; tahmin büyürse sayı bir öncekinde kalır, hiç artmaz
// Neden: ince ayarda posterior SD durma eşiğine inmezse remaining() 2'de kalır; "son harfler"
// yazısı günlükte 8, haftalıkta 12 harf sürebiliyordu. İnişte satır başına harf 1'den 2'ye
// çıkınca da tahmin büyüyebiliyordu.
export function remainingDisplay({ remaining, remainingMax }, shown = Infinity) {
  const next = Math.min(shown, remaining)
  if (remainingMax <= 2) return { kind: 'last', count: remainingMax, shown: next }
  if (next <= 2) return { kind: 'few', count: null, shown: next }
  return { kind: 'approx', count: next, shown: next }
}

// Sonucu ekran tabanına göre sonlandırır. est: estimate(); floorLimit: ÖLÇÜM MESAFESİNDE ekranın
// çizebildiği en küçük harfin logMAR'ı (+ küçük pay).
// Neden: minX 40 cm'ye göre hesaplanır; canlı mesafede (ör. 30 cm) aynı piksel daha büyük açıya
// denk gelir, ekranın gerçek tabanı yukarı kayar. Merdiven tabanın altını istese de ekran harfi
// tabanda çizer; posterior ortalaması tabanın altına inebilir ve 'floor' işareti konmaz, konunca
// da hiç çizilmemiş bir boyut (minX) yazılır. Burada tahmin tabanın altındaysa tabana kısılır
// ve işaretlenir. Döner: { logMAR, outOfRange: 'ceiling' | 'floor' | null }
export function finalizeEstimate(est, floorLimit = -Infinity) {
  const atFloor = !est.atCeiling && (est.atFloor || est.logMAR < floorLimit)
  return {
    logMAR: atFloor ? Math.max(est.logMAR, floorLimit) : est.logMAR,
    outOfRange: est.atCeiling ? 'ceiling' : atFloor ? 'floor' : null,
  }
}
