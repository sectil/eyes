import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  createTrialGate,
  inCountBand,
  distanceHint,
  bandCm,
  COUNT_MIN_MM,
  COUNT_MAX_MM,
  HOLD_MIN_MM,
  HOLD_MAX_MM,
  DIST_PAUSE_MS,
  OCC_PAUSE_MS,
  OCC_BLOCK_MS,
  OCC_BLOCK_WIN_MS,
  HOLD_HINT_MS,
  REASON_SWITCH_MS,
  RESUME_MS,
  MOVE_MAX_FRAC,
} from './trialGate.js'
import { logMARForHeight, letterHeightMm } from './optotype.js'

// iPhone 14 Plus: 458 ppi, ölçek 3 → CSS px / mm
const PX_PER_MM = 458 / 3 / 25.4
const gate = (o = {}) => createTrialGate({ pxPerMm: PX_PER_MM, ...o })
// Hedef logMAR'ın verilen mesafedeki birimi (CSS px, yuvarlanmamış — H1)
const unitFor = (logMAR, mm) => (letterHeightMm(logMAR, mm) / 5) * PX_PER_MM

// 10 Hz mesafe kareleri [from, to] aralığında; son sonucu döndürür
function hold(g, mm, from, to, occ) {
  let r = null
  for (let t = from; t <= to; t += 100) r = g.push(occ === undefined ? { ts: t, mm } : { ts: t, mm, occ })
  return r
}

describe('bantlar', () => {
  it('sayılan bant 360–440 mm (sınırlar dahil), histerezis 350–450', () => {
    expect([COUNT_MIN_MM, COUNT_MAX_MM, HOLD_MIN_MM, HOLD_MAX_MM]).toEqual([360, 440, 350, 450])
    expect([DIST_PAUSE_MS, OCC_PAUSE_MS, RESUME_MS, MOVE_MAX_FRAC]).toEqual([300, 700, 300, 0.05])
    expect([OCC_BLOCK_MS, OCC_BLOCK_WIN_MS, HOLD_HINT_MS, REASON_SWITCH_MS]).toEqual([250, 400, 1200, 300])
    expect(inCountBand(360)).toBe(true)
    expect(inCountBand(440)).toBe(true)
    expect(inCountBand(359.9)).toBe(false)
    expect(inCountBand(440.1)).toBe(false)
    expect(inCountBand(null)).toBe(false)
    expect(distanceHint(355)).toBe('too-close')
    expect(distanceHint(445)).toBe('too-far')
    expect(distanceHint(400)).toBe(null)
    expect(distanceHint(null)).toBe('no-face')
  })

  // Üçüncü inceleme (R-S1-followup; 2. doğrulayıcı: cm yuvarlaması): düz yuvarlama 441–444 mm'yi "44 cm", 355–359 mm'yi "36 cm" yazıyordu
  it('cm göstergesi: bant dışındayken bandın dışındaki en yakın tam cm; bant içinde en yakın tam cm', () => {
    const cases = [
      [400, 40], [360, 36], [440, 44], [435, 44], [364.9, 36], [440.1, 45], [441, 45], [444.9, 45], [449.9, 45],
      [452, 45], [455, 46], [359.9, 35], [357, 35], [355, 35], [350, 35], [345, 35], [344.9, 34], [300, 30],
    ]
    for (const [mm, cm] of cases) expect(bandCm(mm), `${mm} mm`).toBe(cm)
    expect(bandCm(null)).toBeNull()
    expect(bandCm(Number.NaN)).toBeNull()
    // sayı 36–44 ise bant içi, değilse bant dışı: renk ile sayı hiç çelişmez; kayma en çok 1 cm
    for (let mm = 300; mm <= 500; mm += 0.1) {
      const c = bandCm(mm)
      expect(c >= 36 && c <= 44, `${mm} mm → ${c}`).toBe(inCountBand(mm))
      expect(Math.abs(c * 10 - mm), `${mm} mm → ${c}`).toBeLessThan(10)
    }
  })
})

describe('mesafe duraklaması (sayılan denemeler)', () => {
  it('45 cm dışında 300 ms kalınca durur, önce durmaz', () => {
    const g = gate()
    hold(g, 400, 0, 1000)
    expect(g.push({ ts: 1100, mm: 460 }).paused).toBe(false)
    expect(g.push({ ts: 1399, mm: 460 }).paused).toBe(false)
    const r = g.push({ ts: 1400, mm: 460 })
    expect(r).toMatchObject({ paused: true, pausedNow: true, reason: 'too-far' })
    expect(g.push({ ts: 1500 }).pausedNow).toBe(false)
  })

  it('35 cm altında durur: "too-close"', () => {
    const g = gate()
    hold(g, 400, 0, 500)
    const r = hold(g, 345, 600, 900)
    expect(r).toMatchObject({ paused: true, reason: 'too-close' })
  })

  it('histerezis: 44,5 cm\'de durmaz (harf titremez) ama 44,5 cm\'de verilen cevap sayılmaz; test yine durmaz (S1)', () => {
    const g = gate()
    hold(g, 430, 0, 300)
    // Harf bantta (43 cm) açıldı, kişi 44,5 cm'ye kaydı (%3,5): ekrandaki harf titremez, test durmaz
    expect(g.freeze(unitFor(0.1, 430), 430, 300)).toBe(true)
    expect(hold(g, 445, 400, 3000).paused).toBe(false)
    const a = g.answer(445, 3500)
    expect(a).toMatchObject({ accepted: false, count: false, reshowNewDir: true, reason: 'out-of-band', paused: false })
    // Test durmaz (35–45 cm içinde); yeni harf de açılmaz: ekranda oklar soluk, cm göstergesi bant dışı
    expect(g.status()).toMatchObject({ paused: false, reason: null, open: false })
    expect(g.freeze(unitFor(0.1, 445), 445, 3600)).toBe(false)
    expect(hold(g, 445, 3600, 9000).paused).toBe(false)
    expect(g.stats(9000)).toMatchObject({ pauses: 0, reshows: { band: 1 } })
    // 36–44'e dönünce harf beklemeden açılır (duraklama olmadığı için 300 ms düzelme yok)
    g.push({ ts: 9100, mm: 439 })
    expect(g.freeze(unitFor(0.1, 439), 439, 9100)).toBe(true)
  })

  it('46 cm sayılan denemeyi durdurur (eski 250–600 bandında durmazdı)', () => {
    const g = gate()
    expect(hold(g, 460, 0, 1000).paused).toBe(true)
  })

  it('35–36 ve 44–45 cm arasında sürmez; 36–44 içinde 300 ms kalınca yeni yönle sürer', () => {
    const g = gate()
    hold(g, 470, 0, 500)
    expect(g.status().paused).toBe(true)
    expect(hold(g, 445, 600, 2000)).toMatchObject({ paused: true, reason: 'too-far' })
    expect(hold(g, 355, 2100, 3000)).toMatchObject({ paused: true, reason: 'too-close' })
    expect(g.push({ ts: 3100, mm: 430 }).paused).toBe(true)
    expect(g.push({ ts: 3399, mm: 430 }).paused).toBe(true)
    const r = g.push({ ts: 3400, mm: 431 })
    expect(r).toMatchObject({ paused: false, resumed: true, reshowNewDir: true, reason: null })
  })

  it('süre kesintisiz sayılır: bant içine kısa dönüş zamanlayıcıyı sıfırlar', () => {
    const g = gate()
    g.push({ ts: 0, mm: 460 })
    g.push({ ts: 200, mm: 440 })
    g.push({ ts: 250, mm: 460 })
    expect(g.push({ ts: 540 }).paused).toBe(false)
    expect(g.push({ ts: 550 }).paused).toBe(true)
  })

  it('mesafe yok (yüz kayboldu) → 300 ms sonra "no-face"', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    g.push({ ts: 400, mm: null })
    expect(g.tick(699).paused).toBe(false)
    expect(g.tick(700)).toMatchObject({ paused: true, reason: 'no-face' })
  })
})

describe('sayılan evrede yeni harf yalnız 36–44 cm\'de açılır (S1)', () => {
  it('histerezis bandında (44,5 cm) sabit tutulunca harf açılmaz ama test durmaz (duraklamayı yalnız 300 ms kuralı başlatır)', () => {
    const g = gate()
    expect(hold(g, 445, 0, 3000).paused).toBe(false)
    expect(g.freeze(unitFor(0.1, 445), 445, 3000)).toBe(false)
    expect(g.status()).toMatchObject({ paused: false, reason: null, open: false })
    expect(g.stats(3000).pauses).toBe(0)
    // 36–44'e dönünce harf hemen açılır
    g.push({ ts: 3100, mm: 439 })
    expect(g.freeze(unitFor(0.1, 439), 439, 3100)).toBe(true)
  })

  it('35,5 cm\'de de açılmaz; test durmaz, 35 cm altına inince 300 ms sonra durur ("too-close")', () => {
    const g = gate()
    hold(g, 355, 0, 1000)
    expect(g.freeze(unitFor(0.1, 355), 355, 1000)).toBe(false)
    expect(g.status()).toMatchObject({ paused: false, open: false })
    expect(g.push({ ts: 1100, mm: 345 }).paused).toBe(false)
    expect(g.push({ ts: 1399, mm: 345 }).paused).toBe(false)
    expect(g.push({ ts: 1400, mm: 345 })).toMatchObject({ paused: true, pausedNow: true, reason: 'too-close' })
  })

  it('alıştırmadan sayılana geçişte 30 cm: harf açılmaz; test 300 ms kuralıyla durur', () => {
    const g = gate({ phase: 'warmup' })
    hold(g, 300, 0, 1000)
    expect(g.freeze(unitFor(1.0, 300), 300, 1000)).toBe(true) // alıştırma 25–60 cm'de sürer
    g.answer(300, 1200)
    expect(g.setPhase('counted', 1300).paused).toBe(false)
    expect(g.freeze(unitFor(0.5, 300), 300, 1310)).toBe(false)
    expect(g.status()).toMatchObject({ paused: false, open: false })
    expect(g.push({ ts: 1599, mm: 300 }).paused).toBe(false)
    expect(g.push({ ts: 1600, mm: 300 })).toMatchObject({ paused: true, pausedNow: true, reason: 'too-close' })
    expect(g.freeze(unitFor(0.5, 300), 300, 1600)).toBe(false)
  })

  // İnceleme bulgusu R-S1: bant kenarında titreyen mesafe. AcuityTest döngüsünün benzeri: 100 ms'de bir kare,
  // duraklama yoksa ve harf açık değilse harf açılmaya çalışılır, harf açıldıktan 1,5 sn sonra cevap verilir;
  // her duraklamada "Test durdu" cümlesi (~3 sn) bitene dek harf gösterilmez. Mesafe 43,8 cm ± 0,4 cm (düzgün).
  function jitterRun(centerMm, jitterMm, { seconds = 60, seed = 1 } = {}) {
    let s = seed
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    const g = gate()
    let shownAt = null
    let voiceUntil = 0
    let pauses = 0
    let counted = 0
    let answers = 0
    for (let ts = 0; ts < seconds * 1000; ts += 100) {
      const mm = centerMm + (rnd() * 2 - 1) * jitterMm
      const r = g.push({ ts, mm })
      if (r.pausedNow) {
        pauses += 1
        voiceUntil = ts + 3000
        shownAt = null
      }
      if (r.paused) continue
      if (!g.status().open) {
        if (ts >= voiceUntil && g.freeze(unitFor(0.1, mm), mm, ts)) shownAt = ts
        if (g.status().paused) {
          pauses += 1 // freeze testi durdurduysa (eski davranış) o da sayılır
          voiceUntil = ts + 3000
        }
      } else if (ts - shownAt >= 1500) {
        const a = g.answer(mm, ts)
        answers += 1
        if (a.count) counted += 1
        if (a.paused) {
          pauses += 1
          voiceUntil = ts + 3000
        }
        shownAt = null
      }
    }
    return { pausesPerMin: (pauses * 60) / seconds, countedPerMin: (counted * 60) / seconds, answersPerMin: (answers * 60) / seconds }
  }

  it('bant kenarında titreyen mesafe (43,8 ± 0,4 cm) testi durdurmaz; harf gelmeye devam eder', () => {
    // Eski davranışta (freeze ve bant dışı cevap testi hemen durduruyordu) bu dört koşuda dakikada 10–12 duraklama,
    // 17–19 cevap, 10–16 sayılan harf. Bant içinde (40 ± 0,4 cm) dakikada 37 harf.
    for (const seed of [1, 7, 42, 1234]) {
      const edge = jitterRun(438, 4, { seed })
      expect(edge.pausesPerMin, `seed ${seed}`).toBe(0)
      expect(edge.answersPerMin, `seed ${seed}`).toBeGreaterThanOrEqual(30)
      // 44 cm'nin üstünde verilen cevaplar (~%25) sayılmaz: S1
      expect(edge.countedPerMin, `seed ${seed}`).toBeGreaterThanOrEqual(20)
      expect(jitterRun(400, 4, { seed })).toEqual({ pausesPerMin: 0, countedPerMin: 37, answersPerMin: 37 })
    }
    // 45 cm'nin dışına gerçekten çıkınca durur (300 ms kuralı değişmedi)
    expect(jitterRun(470, 4).pausesPerMin).toBeGreaterThanOrEqual(1)
  })

  it('kamerasızda bant yok: 40 cm\'ye göre açılır', () => {
    const g = gate({ distanceTracked: false, occlusion: false })
    expect(g.freeze(unitFor(0.1, 400), 600, 0)).toBe(true)
  })
})

// Üçüncü inceleme R-S1-followup: 35–36 ve 44–45 cm'de test durmuyor, harf de açılmıyordu; ekranda ne yazı ne ses vardı
// (yalnız sarı cm hapı). Kapı artık harfin neden açılamadığını söyler; ekran HOLD_HINT_MS sonra harf yuvasında yazar.
describe('harf açılamıyor ama test durmadı: neden (hold) ve HOLD_HINT_MS sonra holdHint', () => {
  it('44,3 cm\'de sabit: hold "too-far", HOLD_HINT_MS dolunca holdHint; test durmaz', () => {
    const g = gate()
    expect(g.push({ ts: 0, mm: 443 })).toMatchObject({ paused: false, hold: 'too-far', holdMs: 0, holdHint: null })
    expect(g.freeze(unitFor(0.1, 443), 443, 0)).toBe(false)
    expect(g.push({ ts: HOLD_HINT_MS - 100, mm: 443 })).toMatchObject({ hold: 'too-far', holdMs: HOLD_HINT_MS - 100, holdHint: null })
    expect(g.push({ ts: HOLD_HINT_MS, mm: 443 })).toMatchObject({ paused: false, hold: 'too-far', holdMs: HOLD_HINT_MS, holdHint: 'too-far' })
    expect(hold(g, 443, HOLD_HINT_MS + 100, 30000)).toMatchObject({ paused: false, hold: 'too-far', holdHint: 'too-far' })
    expect(g.status()).toMatchObject({ paused: false, open: false, hold: 'too-far' })
    expect(g.stats(30000).pauses).toBe(0)
    // bant içine dönünce hold biter, harf hemen açılır
    expect(g.push({ ts: 30100, mm: 438 })).toMatchObject({ hold: null, holdMs: 0, holdHint: null })
    expect(g.freeze(unitFor(0.1, 438), 438, 30100)).toBe(true)
  })

  it('35,5 cm\'de "too-close"; neden değişince bekleyiş sürer, yeni neden hemen söylenir (kart arada kaybolmaz)', () => {
    const g = gate()
    expect(g.push({ ts: 0, mm: 355 })).toMatchObject({ paused: false, hold: 'too-close', holdMs: 0, holdHint: null })
    hold(g, 443, 100, 2000)
    expect(g.push({ ts: 2100, mm: 355 })).toMatchObject({ paused: false, hold: 'too-close', holdMs: 2100, holdHint: 'too-close' })
    // örtme engeli de aynı bekleyişi sürdürür (neden önceliği: örtme)
    hold(g, 355, 2200, 2400, 'wrong-eye')
    expect(g.push({ ts: 2500, mm: 355, occ: 'wrong-eye' })).toMatchObject({ paused: false, hold: 'wrong-eye', holdMs: 2500, holdHint: 'wrong-eye' })
  })

  it('mesafe bir an ölçülemezse (44,3 cm ile "yüz yok" gidip gelir) bekleyiş sürer; kayıp 300 ms sürerse duraklar', () => {
    const g = gate()
    let r = null
    for (let t = 0; t <= 2000; t += 100) r = g.push({ ts: t, mm: t % 200 ? null : 443 })
    expect(r).toMatchObject({ paused: false, hold: 'too-far', holdMs: 2000, holdHint: 'too-far' })
    expect(g.stats(2000).pauses).toBe(0)
    g.push({ ts: 2100, mm: null })
    expect(g.tick(2300)).toMatchObject({ paused: false, hold: 'too-far' })
    expect(g.tick(2400)).toMatchObject({ paused: true, reason: 'no-face', hold: null, holdHint: null })
    // yüz yokken başlayan bekleyiş yok (kısa kayıpta harf zaten bekler; uzun kayıpta duraklama kartı)
    expect(gate().push({ ts: 0, mm: null })).toMatchObject({ hold: null })
  })

  it('örtme "yanlış göz" ile "örtme kalktı" arasında gidip gelirse neden "wrong-eye" kalır ve bekleyiş sürer', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    let r = null
    const seq = ['wrong-eye', 'uncovered', 'wrong-eye', 'uncovered', 'ok']
    for (let i = 0; i < 30; i++) r = g.push({ ts: 400 + i * 100, mm: 400, occ: seq[i % 5] })
    expect(r).toMatchObject({ paused: false, hold: 'wrong-eye', holdHint: 'wrong-eye' })
    expect(r.holdMs).toBeGreaterThanOrEqual(2000)
    expect(g.stats(3300).pauses).toBe(0)
  })

  it('alıştırmadan sayılana 44,5 cm\'de geçiş: bekleyiş geçiş anından sayılır', () => {
    const g = gate({ phase: 'warmup' })
    expect(hold(g, 445, 0, 3000)).toMatchObject({ paused: false, hold: null }) // alıştırmada bant 25–60 cm
    expect(g.setPhase('counted', 3050)).toMatchObject({ paused: false, hold: 'too-far', holdMs: 0 })
    expect(g.push({ ts: 3050 + HOLD_HINT_MS, mm: 445 })).toMatchObject({ paused: false, holdHint: 'too-far' })
  })

  it('harf açıkken, duraklamada, kamerasızda ve mesafe yokken hold yok', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    expect(g.freeze(unitFor(0.1, 400), 400, 300)).toBe(true)
    // harf ekrandayken 44,5 cm: hold yok (cevap sayılmazsa nedeni cevapta: why)
    expect(hold(g, 445, 400, 3000)).toMatchObject({ hold: null, holdHint: null })
    // 45 cm dışında 300 ms: duraklama kartı; hold yok
    expect(hold(g, 470, 3100, 3500)).toMatchObject({ paused: true, hold: null, holdHint: null })
    expect(hold(gate({ distanceTracked: false, occlusion: false }), 445, 0, 3000)).toMatchObject({ hold: null, holdHint: null })
    // yüz yok: hold değil, 300 ms kuralıyla "Yüzünü kameraya göster" duraklaması
    const f = gate()
    expect(f.push({ ts: 0, mm: null })).toMatchObject({ hold: null })
    expect(f.tick(300)).toMatchObject({ paused: true, reason: 'no-face', hold: null })
  })

  it('"Kamerasız devam" bekleyişi ve örtme geçmişini siler: harf hemen açılır', () => {
    const g = gate()
    hold(g, 445, 0, 3000)
    expect(g.continueWithoutCamera(3100)).toMatchObject({ hold: null, holdHint: null })
    expect(g.tick(3200)).toMatchObject({ hold: null })
    // örtme engelliyordu (yanlış göz 400 ms): kamera artık izlemiyor, eski okuma harfi bekletmez
    const f = gate()
    hold(f, 400, 0, 300, 'ok')
    hold(f, 400, 400, 800, 'wrong-eye')
    expect(f.freeze(unitFor(0.1, 400), 400, 850)).toBe(false)
    f.continueWithoutCamera(900)
    expect(f.freeze(unitFor(0.1, 400), null, 900)).toBe(true)
  })
})

// Üçüncü inceleme R-S1-reject-silent: mesafe yüzünden sayılmayan cevap yalnız titreşimle karşılanıyordu. Kapı nedeni
// söyler; ekran harf yuvasında duraklama kartının emrini gösterir.
describe('sayılmayan cevabın ekrandaki nedeni (why)', () => {
  const opened = (mm = 400, occ) => {
    const g = gate()
    hold(g, mm, 0, 300, occ)
    expect(g.freeze(unitFor(0.1, mm), mm, 300)).toBe(true)
    return g
  }
  it('bant dışı → yön; mesafe yok → yüz; %5 kayma → sabit tut; örtme → örtme durumu; sayılan ve alıştırma → null', () => {
    expect(opened(430).answer(445, 400)).toMatchObject({ accepted: false, reason: 'out-of-band', why: 'too-far' })
    expect(opened(370).answer(356, 400)).toMatchObject({ accepted: false, reason: 'out-of-band', why: 'too-close' })
    expect(opened().answer(null, 400)).toMatchObject({ accepted: false, reason: 'no-distance', why: 'no-face' })
    expect(opened().answer(424, 400)).toMatchObject({ accepted: false, reason: 'moved', why: 'moved' })
    for (const occ of ['wrong-eye', 'uncovered']) {
      const g = opened(400, 'ok')
      hold(g, 400, 400, 700, occ)
      expect(g.answer(400, 700), occ).toMatchObject({ accepted: false, reason: 'occlusion', why: occ, occ })
    }
    expect(opened().answer(400, 400)).toMatchObject({ accepted: true, count: true, why: null })
    const w = gate({ phase: 'warmup' })
    hold(w, 300, 0, 300)
    w.freeze(unitFor(1.0, 300), 300, 300)
    expect(w.answer(300, 400)).toMatchObject({ accepted: true, count: false, why: null })
  })
  it('bant dışı cevaptan sonra bekleyiş hemen başlar ve aynı nedeni söyler (ekranda kart aralıksız kalır)', () => {
    const g = opened(430)
    g.push({ ts: 400, mm: 445 })
    expect(g.answer(445, 450)).toMatchObject({ why: 'too-far' })
    expect(g.push({ ts: 500, mm: 445 })).toMatchObject({ paused: false, hold: 'too-far', holdMs: 0 })
  })
})

describe('alıştırma 25–60 cm', () => {
  it('58 cm\'de sürer, cevap alınır ama sayılmaz', () => {
    const g = gate({ phase: 'warmup' })
    expect(hold(g, 580, 0, 2000).paused).toBe(false)
    expect(g.freeze(unitFor(0.7, 580), 580, 2000)).toBe(true)
    expect(g.answer(580, 2500)).toMatchObject({ accepted: true, count: false, reshowNewDir: false })
  })

  it('60 cm dışında 300 ms kalınca durur, içine dönünce 300 ms sonra sürer', () => {
    const g = gate({ phase: 'warmup' })
    hold(g, 500, 0, 300)
    expect(hold(g, 620, 400, 700)).toMatchObject({ paused: true, reason: 'too-far' })
    expect(g.push({ ts: 800, mm: 590 }).paused).toBe(true)
    expect(g.push({ ts: 1100, mm: 590 })).toMatchObject({ paused: false, resumed: true })
  })

  it('sayılana geçişte 47 cm → 300 ms sonra durur', () => {
    const g = gate({ phase: 'warmup' })
    hold(g, 470, 0, 1000)
    expect(g.setPhase('counted', 1050).paused).toBe(false)
    expect(g.push({ ts: 1300, mm: 470 }).paused).toBe(false)
    expect(g.push({ ts: 1350, mm: 470 })).toMatchObject({ paused: true, reason: 'too-far' })
  })
})

describe('boyut dondurma (H2)', () => {
  it('deneme açıkken mesafe değişse de birim değişmez', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    const u = unitFor(0.1, 400)
    expect(g.freeze(u, 400, 300)).toBe(true)
    for (const [t, mm] of [[400, 379], [500, 378], [600, 362], [700, 438], [800, 445]]) {
      g.push({ ts: t, mm })
      expect(g.unitPx()).toBe(u)
    }
    expect(g.frozen()).toMatchObject({ unitPx: u, mm: 400 })
  })

  it('açık denemede ikinci freeze yok sayılır; duraklamada freeze reddedilir', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    const u = unitFor(0.2, 400)
    g.freeze(u, 400, 300)
    expect(g.freeze(u * 1.1, 420, 400)).toBe(false)
    expect(g.unitPx()).toBe(u)
    const g2 = gate()
    hold(g2, 470, 0, 500)
    expect(g2.freeze(u, 470, 500)).toBe(false)
    expect(g2.unitPx()).toBe(null)
  })

  it('cevap anındaki mesafede dondurulmuş yüksekliğin açısı yazılır', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    const u = unitFor(0.1, 400)
    g.freeze(u, 400, 300)
    g.push({ ts: 400, mm: 412 })
    const a = g.answer(412, 500)
    expect(a).toMatchObject({ accepted: true, count: true, reshowNewDir: false, reason: null })
    const heightMm = (u * 5) / PX_PER_MM
    expect(a.realizedLogMAR).toBeCloseTo(logMARForHeight(heightMm, 412), 9)
    // 3 % uzaklaşma → harf açısı küçüldü: 0,1 − log10(412/400) ≈ 0,0872
    expect(a.realizedLogMAR).toBeCloseTo(0.1 - Math.log10(412 / 400), 3)
    expect(a.change).toBeCloseTo(0.03, 9)
    expect(g.unitPx()).toBe(null) // deneme kapandı
  })

  it('duraklama açık denemeyi kapatır; sürünce yeniden dondurulur', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    g.freeze(unitFor(0.1, 400), 400, 300)
    hold(g, 470, 400, 800)
    expect(g.status()).toMatchObject({ paused: true, open: false })
    expect(g.answer(470, 850)).toMatchObject({ accepted: false, reason: 'paused', reshowNewDir: false })
    const r = hold(g, 420, 900, 1200)
    expect(r).toMatchObject({ resumed: true, reshowNewDir: true })
    expect(g.freeze(unitFor(0.1, 420), 420, 1200)).toBe(true)
    expect(g.stats(1200).reshows.paused).toBe(1)
  })
})

describe('%5 kuralı (H2)', () => {
  const run = (mmAnswer) => {
    const g = gate()
    hold(g, 400, 0, 300)
    g.freeze(unitFor(0.1, 400), 400, 300)
    return { g, a: g.answer(mmAnswer, 600) }
  }

  it('mesafe %6 değişince deneme sayılmaz, aynı hedef yeni yönle', () => {
    const { g, a } = run(424)
    expect(a).toMatchObject({ accepted: false, count: false, reshowNewDir: true, reason: 'moved', paused: false })
    expect(a.change).toBeCloseTo(0.06, 9)
    expect(g.stats(600).reshows.moved).toBe(1)
    // yeniden gösterim için yeni donma
    expect(g.freeze(unitFor(0.1, 424), 424, 650)).toBe(true)
  })

  it('yaklaşınca da: 400 → 376 mm (%6) sayılmaz', () => {
    expect(run(376).a).toMatchObject({ count: false, reason: 'moved' })
  })

  it('%5 ve altı sayılır', () => {
    expect(run(420).a).toMatchObject({ count: true, accepted: true })
    expect(run(419.6).a).toMatchObject({ count: true })
    expect(run(381).a).toMatchObject({ count: true })
  })
})

describe('cevap reddi', () => {
  it('mesafesiz cevap sayılmaz; test durmaz, yüz 300 ms görünmezse durur ("no-face")', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    g.freeze(unitFor(0.1, 400), 400, 300)
    const a = g.answer(null, 400)
    expect(a).toMatchObject({ accepted: false, count: false, reshowNewDir: true, reason: 'no-distance', paused: false, realizedLogMAR: null })
    expect(g.status().paused).toBe(false)
    // tek karelik kayıp: yüz yeniden görünür, harf açılır
    g.push({ ts: 500, mm: 401 })
    expect(g.freeze(unitFor(0.1, 401), 401, 500)).toBe(true)
    // yüz gerçekten kayboldu: 300 ms kuralı
    g.cancel()
    g.push({ ts: 600, mm: null })
    expect(g.tick(899).paused).toBe(false)
    expect(g.tick(900)).toMatchObject({ paused: true, reason: 'no-face' })
  })

  it('bant dışı cevaptan sonra test durmaz; 36–44\'e dönünce harf hemen açılır', () => {
    const g = gate()
    hold(g, 370, 0, 300)
    // harf bantta (37 cm) açıldı; cevap 35,6 cm'de (%3,8 kayma)
    expect(g.freeze(unitFor(0.1, 370), 370, 300)).toBe(true)
    expect(g.answer(356, 400)).toMatchObject({ reason: 'out-of-band', paused: false, reshowNewDir: true })
    expect(g.status()).toMatchObject({ paused: false, reason: null })
    expect(g.push({ ts: 500, mm: 356 }).paused).toBe(false)
    expect(g.freeze(unitFor(0.1, 356), 356, 500)).toBe(false)
    expect(g.push({ ts: 600, mm: 370 }).paused).toBe(false)
    expect(g.freeze(unitFor(0.1, 370), 370, 600)).toBe(true)
    expect(g.stats(600)).toMatchObject({ pauses: 0, pausedMs: 0, reshows: { band: 1 } })
  })

  it('deneme açılmadan cevap alınmaz', () => {
    expect(gate().answer(400, 0)).toMatchObject({ accepted: false, reason: 'no-trial', reshowNewDir: false })
  })
})

describe('örtme duraklaması (E6)', () => {
  it('bozuk durum 700 ms sürünce durur; göz kırpma (400 ms) durdurmaz', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    hold(g, 400, 400, 800, 'uncovered')
    expect(hold(g, 400, 900, 1500, 'ok').paused).toBe(false)
    expect(hold(g, 400, 1600, 2200, 'uncovered').paused).toBe(false)
    expect(g.push({ ts: 2300, occ: 'uncovered' })).toMatchObject({ paused: true, pausedNow: true, reason: 'uncovered' })
  })

  it('belirsiz durum zamanlayıcıyı sıfırlar (durdurmaz, sürdürmez)', () => {
    const g = gate()
    hold(g, 400, 0, 500, 'uncovered')
    g.push({ ts: 600, occ: 'unclear' })
    expect(hold(g, 400, 700, 1300, 'uncovered').paused).toBe(false)
  })

  it('300 ms düzelince yeni yönle sürer', () => {
    const g = gate()
    hold(g, 400, 0, 700, 'wrong-eye')
    expect(g.status()).toMatchObject({ paused: true, reason: 'wrong-eye' })
    expect(g.push({ ts: 800, occ: 'ok' }).paused).toBe(true)
    expect(g.push({ ts: 1100, occ: 'ok' })).toMatchObject({ resumed: true, reshowNewDir: true })
  })

  it('kendin-onayla başlanmışsa "uncovered" durdurmaz, "wrong-eye" durdurur', () => {
    const g = gate({ selfConfirmed: true })
    expect(hold(g, 400, 0, 5000, 'uncovered').paused).toBe(false)
    expect(hold(g, 400, 5100, 5800, 'wrong-eye')).toMatchObject({ paused: true, reason: 'wrong-eye' })
    // düzelme: kamera yine "uncovered" okur (avuç kapağı kapatmaz) → sürer
    expect(hold(g, 400, 5900, 6200, 'uncovered')).toMatchObject({ paused: false, resumed: true })
  })

  it('yanlış göz 250 ms sürünce (700 ms dolmadan): yeni harf açılmaz, açık harfe verilen cevap sayılmaz (yeni yönle yeniden)', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    // Örtme kaydı: t=400'den beri yanlış göz; 250 ms dolunca harf açılmaz
    hold(g, 400, 400, 600, 'wrong-eye')
    expect(g.freeze(unitFor(0.1, 400), 400, 650)).toBe(false)
    expect(g.status()).toMatchObject({ open: false, paused: false })
    // Düzelince açılır; sonra yine kayar ve 700 ms dolmadan cevap gelir
    hold(g, 400, 700, 900, 'ok')
    expect(g.freeze(unitFor(0.1, 400), 400, 900)).toBe(true)
    hold(g, 400, 1000, 1500, 'wrong-eye')
    const a = g.answer(400, 1550)
    expect(a).toMatchObject({ accepted: false, count: false, reshowNewDir: true, reason: 'occlusion', paused: false, occ: 'wrong-eye' })
    expect(g.stats(1550).reshows.occlusion).toBe(1)
    // 700 ms dolunca duraklama kartı (E6)
    expect(g.push({ ts: 1700, occ: 'wrong-eye' })).toMatchObject({ paused: true, reason: 'wrong-eye' })
  })

  it('örtme kalktıysa ("uncovered") cevap sayılmaz; kendin-onayla başlanmışsa sayılır, yanlış gözde sayılmaz', () => {
    let g = gate()
    hold(g, 400, 0, 300, 'ok')
    expect(g.freeze(unitFor(0.1, 400), 400, 300)).toBe(true)
    hold(g, 400, 400, 600, 'uncovered')
    expect(g.answer(400, 650)).toMatchObject({ accepted: false, reason: 'occlusion', occ: 'uncovered' })
    g = gate({ selfConfirmed: true })
    hold(g, 400, 0, 300, 'uncovered')
    expect(g.freeze(unitFor(0.1, 400), 400, 300)).toBe(true)
    expect(hold(g, 400, 400, 900, 'uncovered').paused).toBe(false)
    expect(g.answer(400, 950)).toMatchObject({ accepted: true, count: true })
    expect(g.freeze(unitFor(0.1, 400), 400, 1000)).toBe(true)
    hold(g, 400, 1100, 1300, 'wrong-eye')
    expect(g.answer(400, 1350)).toMatchObject({ accepted: false, reason: 'occlusion', occ: 'wrong-eye' })
  })

  // İnceleme bulgusu R-S2: tek karelik okuma cevabı sessizce reddetmesin
  it('bozuk durum 250 ms kesintisiz sürmeden ne harf ne cevap engellenir (sınır: 249 / 250 ms)', () => {
    const open = () => {
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      expect(g.freeze(unitFor(0.1, 400), 400, 300)).toBe(true)
      return g
    }
    let g = open()
    hold(g, 400, 400, 600, 'uncovered')
    expect(g.answer(400, 649)).toMatchObject({ accepted: true, count: true })
    g = open()
    hold(g, 400, 400, 600, 'uncovered')
    expect(g.answer(400, 650)).toMatchObject({ accepted: false, reason: 'occlusion', occ: 'uncovered', paused: false })
    // yanlış göz ↔ örtme kalktı arasında gidip gelmek de kesintisiz bozuk sayılır
    g = open()
    for (const [ts, occ] of [[400, 'wrong-eye'], [500, 'uncovered'], [600, 'wrong-eye']]) g.push({ ts, occ })
    expect(g.answer(400, 650)).toMatchObject({ reason: 'occlusion', occ: 'wrong-eye' })
    // harf açılışı da aynı kuralla
    for (const [ts, opens] of [[649, true], [650, false]]) {
      const f = gate()
      hold(f, 400, 0, 300, 'ok')
      hold(f, 400, 400, 600, 'wrong-eye')
      expect(f.freeze(unitFor(0.1, 400), 400, ts), `${ts} ms`).toBe(opens)
    }
  })

  it('titreyen örtme okuması ("yanlış göz"/"örtme kalktı" ile "belirsiz"/"tamam" gidip gelir) cevabı reddetmez, testi durdurmaz', () => {
    for (const calm of ['unclear', 'ok']) {
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      let t = 400
      for (let i = 0; i < 20; i++) {
        expect(g.freeze(unitFor(0.1, 400), 400, t), `${calm} ${i}`).toBe(true)
        // her 100 ms'lik kare: bozuk, sakin, bozuk, sakin, bozuk (her bozuk okuma tek kare); cevap son bozuk kareden 100 ms sonra
        for (let k = 0; k < 5; k++, t += 100) g.push({ ts: t, mm: 400, occ: k % 2 ? calm : i % 2 ? 'uncovered' : 'wrong-eye' })
        expect(g.answer(400, t), `${calm} ${i}`).toMatchObject({ accepted: true, count: true })
      }
      expect(g.stats(t)).toMatchObject({ pauses: 0, reshows: { occlusion: 0 } })
    }
  })

  // Üçüncü inceleme R-S2-continuity: kesintisiz 250 ms kuralı tek bir sakin karede sıfırlanıyordu; çoğu "yanlış göz"
  // okuyan dedektör hiç engellemiyordu. Kural: son 400 ms'nin en az 250 ms'i bozuksa (10 Hz'de son dört karenin üçü).
  it('çoğu bozuk okumanın arasına giren tek sakin kare ("tamam", "belirsiz", "yüz yok", "lid-ask") engeli kaldırmaz', () => {
    for (const calm of ['ok', 'unclear', 'no-face', 'lid-ask']) {
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      expect(g.freeze(unitFor(0.1, 400), 400, 300)).toBe(true)
      // yanlış göz 200 ms, tek sakin kare, yanlış göz 100 ms: kesintisiz 250 ms hiç olmadı; son 400 ms'nin 300'ü bozuk
      for (const [ts, occ] of [[400, 'wrong-eye'], [500, 'wrong-eye'], [600, calm], [700, 'wrong-eye']]) g.push({ ts, mm: 400, occ })
      expect(g.answer(400, 800), calm).toMatchObject({ accepted: false, reason: 'occlusion', why: 'wrong-eye' })
      // harf açılışı da: sakin karenin ortasında engel sürer
      const f = gate()
      hold(f, 400, 0, 300, 'ok')
      for (const [ts, occ] of [[400, 'wrong-eye'], [500, 'wrong-eye'], [600, 'wrong-eye'], [700, calm]]) f.push({ ts, mm: 400, occ })
      expect(f.freeze(unitFor(0.1, 400), 400, 750), calm).toBe(false)
      // düzelince: son 400 ms'de bozuk süre 250 ms'nin altına inince açılır (son bozuk kareden 200 ms sonra)
      f.push({ ts: 800, mm: 400, occ: 'ok' })
      expect(f.freeze(unitFor(0.1, 400), 400, 850), calm).toBe(false)
      expect(f.freeze(unitFor(0.1, 400), 400, 900), calm).toBe(true)
    }
  })

  // Ekran döngüsünün benzeri: 100 ms'de bir kare; harf açılabildiğinde açılır, 0,8–1,5 sn sonra cevaplanır; sayılmayan
  // cevaptan sonra 1,2 sn neden kartı (yeni harf yok); bekleyiş holdHint verince kart. pattern: 100 ms'lik örtme kareleri.
  function occRun(pattern, { seconds = 60, seed = 3 } = {}) {
    let s = seed
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    const g = gate()
    let answerAt = null
    let busyUntil = 0
    const out = { counted: 0, answers: 0, rejected: 0, hintMs: 0, silentMs: 0 }
    for (let ts = 0; ts < seconds * 1000; ts += 100) {
      const r = g.push({ ts, mm: 400, occ: pattern[(ts / 100) % pattern.length] })
      if (r.holdHint) out.hintMs += 100
      if (r.paused) {
        answerAt = null
        continue
      }
      if (!g.status().open) {
        if (ts < busyUntil) continue
        if (g.freeze(unitFor(0.1, 400), 400, ts)) answerAt = ts + 800 + Math.floor(rnd() * 700)
        else if (!r.holdHint) out.silentMs += 100 // harf yok, kart yok: sessiz bekleyiş
      } else if (ts >= answerAt) {
        const a = g.answer(400, ts)
        out.answers += 1
        if (a.count) out.counted += 1
        else {
          out.rejected += 1
          busyUntil = ts + 1200
        }
      }
    }
    out.pauses = g.stats(seconds * 1000).pauses
    return out
  }

  it('inceleme desenleri: yarı yarıya gidip gelen okuma harfi saydırır; çoğu yanlış göz okuyan dedektör saydırmaz', () => {
    const W = 'wrong-eye'
    // tek kare bozuk / tek kare sakin (R-S2): hepsi sayılır
    for (const calm of ['ok', 'unclear']) expect(occRun([W, calm]), calm).toMatchObject({ rejected: 0, pauses: 0, silentMs: 0 })
    // 200 ms yanlış göz / 100 ms tamam: eskiden her cevap sayılıyordu (dakikada 39); artık çoğu sayılmaz, nedeni yazar
    const wwo = occRun([W, W, 'ok'])
    expect(wwo.rejected).toBeGreaterThan(wwo.counted)
    expect(wwo.pauses).toBe(0)
    // 300 ms yanlış göz / 100 ms tamam ya da belirsiz (ve yanlış göz ile örtme kalktı arasında gidip gelen okuma): hiç
    // harf sayılmaz; duraklama kartına varmayan bekleyiş sessiz de kalmaz (HOLD_HINT_MS sonra neden kartı)
    for (const pattern of [[W, W, W, 'ok'], [W, W, W, 'unclear'], [W, 'uncovered', W, 'uncovered', 'ok']]) {
      const r = occRun(pattern)
      expect(r.counted, pattern.join()).toBe(0)
      expect(r.pauses, pattern.join()).toBe(0)
      expect(r.silentMs, pattern.join()).toBeLessThanOrEqual(HOLD_HINT_MS)
      expect(r.hintMs, pattern.join()).toBeGreaterThan(50000)
    }
  })

  it('belirsiz durum ("unclear") ve iki göz testinde "closed" (göz kırpma) cevabı engellemez', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    g.freeze(unitFor(0.1, 400), 400, 300)
    g.push({ ts: 400, occ: 'unclear' })
    expect(g.answer(400, 500)).toMatchObject({ accepted: true, count: true })
    g.freeze(unitFor(0.1, 400), 400, 600)
    g.push({ ts: 650, occ: 'closed' })
    expect(g.answer(400, 700)).toMatchObject({ accepted: true, count: true })
  })

  it('"lid-ask" (bir göz kapalı, taraf bilinmiyor) durdurmaz ama süresi kayda yazılır', () => {
    const g = gate()
    hold(g, 400, 0, 1000, 'ok')
    expect(hold(g, 400, 1100, 3100, 'lid-ask').paused).toBe(false)
    hold(g, 400, 3200, 3500, 'ok')
    expect(g.stats(3500).lidAskMs).toBe(2100)
    // örtme izlenmiyorsa (kamerasız) sayılmaz
    const n = gate({ occlusion: false })
    hold(n, 400, 0, 2000, 'lid-ask')
    expect(n.stats(2000).lidAskMs).toBe(0)
  })

  it('örtme izleyicisinin anlık görüntüsü de kabul edilir', () => {
    const g = gate()
    g.push({ ts: 0, mm: 400, occ: { state: 'closed', blocked: false } })
    expect(g.push({ ts: 699, mm: 400, occ: { state: 'closed' } }).paused).toBe(false)
    expect(g.push({ ts: 700, mm: 400, occ: { state: 'closed' } })).toMatchObject({ paused: true, reason: 'closed' })
  })

  it('occlusion:false → örtme durumu durdurmaz', () => {
    const g = gate({ occlusion: false })
    expect(hold(g, 400, 0, 3000, 'wrong-eye').paused).toBe(false)
  })

  it('neden önceliği: yüz > yanlış göz > mesafe', () => {
    const g = gate()
    hold(g, 470, 0, 800, 'wrong-eye')
    expect(g.status().reason).toBe('wrong-eye')
    hold(g, null, 900, 1200, 'no-face')
    expect(g.status().reason).toBe('no-face')
  })

  it('mesafe duraklaması örtme "unclear" iken de sürer (koşullar ayrı)', () => {
    const g = gate()
    hold(g, 470, 0, 500, 'unclear')
    expect(g.status().paused).toBe(true)
    expect(hold(g, 400, 600, 900, 'unclear')).toMatchObject({ paused: false, resumed: true })
  })

  it('mesafe düzelse de örtme bozuksa sürmez', () => {
    const g = gate()
    hold(g, 470, 0, 800, 'wrong-eye')
    expect(hold(g, 400, 900, 2000, 'wrong-eye')).toMatchObject({ paused: true, reason: 'wrong-eye' })
    expect(hold(g, 400, 2100, 2400, 'ok')).toMatchObject({ paused: false, resumed: true })
  })
})

// Üçüncü doğrulama V3-N1: duraklama nedeni yalnız o karenin okumasından seçiliyordu. Örtme "yanlış göz" ile "örtme
// kalktı" arasında gidip gelince (ya da 47 cm'de tek kareler mesafesiz gelince) kartın emri 100 ms'de bir değişiyor,
// kart (role=status, aria-live) her değişimde yeniden okunuyordu. Doğrulayıcının koşusu: P:wrong-eye P:uncovered …
describe('duraklama nedeni kare kare değişmez (V3-N1)', () => {
  // 100 ms'lik kareler (from'dan başlar); duraklamadaki nedenlerin sırası, art arda aynı olanlar bir kez
  function pauseReasons(g, frames, from) {
    const out = []
    frames.forEach((f, i) => {
      const r = g.push({ ts: from + i * 100, ...f })
      if (r.paused && out.at(-1) !== r.reason) out.push(r.reason)
    })
    return out
  }
  const seq = (n, fn) => Array.from({ length: n }, (_, i) => fn(i))

  it('örtme "yanlış göz" ile "örtme kalktı" arasında kare kare gidip gelince neden hep "wrong-eye"; harf yuvasındaki kart da aynı nedeni yazmıştı', () => {
    for (const first of ['wrong-eye', 'uncovered']) {
      const other = first === 'wrong-eye' ? 'uncovered' : 'wrong-eye'
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      const holds = new Set()
      let pausedAt = null
      for (let i = 0; i < 60; i++) {
        const ts = 400 + i * 100
        const r = g.push({ ts, mm: 400, occ: i % 2 ? other : first })
        if (r.hold) holds.add(r.hold)
        if (!r.paused) continue
        pausedAt ??= ts
        expect(r.reason, `${first} ${ts}`).toBe('wrong-eye')
      }
      expect(pausedAt, first).toBe(400 + OCC_PAUSE_MS) // 700 ms kesintisiz bozuk: duraklama kuralı değişmedi
      expect([...holds], first).toEqual(['wrong-eye'])
      expect(g.status().reason).toBe('wrong-eye')
    }
    // iki karede bir "yanlış göz" (yanlış göz, örtme kalktı, örtme kalktı) de aynı
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    expect(pauseReasons(g, seq(60, (i) => ({ mm: 400, occ: i % 3 ? 'uncovered' : 'wrong-eye' })), 400)).toEqual(['wrong-eye'])
  })

  it('47 cm\'de tek karelik mesafe kaybı (her 2., 3. ya da 4. kare) ya da örtmede tek kare "yüz yok" kartı "Yüzünü kameraya göster"e çevirmez', () => {
    for (const every of [2, 3, 4]) {
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      const frames = seq(100, (i) => ({ mm: i % every === every - 1 ? null : 470 }))
      expect(pauseReasons(g, frames, 400), `mesafe, her ${every}. kare`).toEqual(['too-far'])
      const o = gate()
      hold(o, 400, 0, 300, 'ok')
      expect(pauseReasons(o, seq(100, (i) => ({ mm: 470, occ: i % every === every - 1 ? 'no-face' : 'ok' })), 400), `örtme, her ${every}. kare`).toEqual(['too-far'])
    }
    // yanlış göz duraklamasında örtmenin tek karelik "yüz yok"u da kartı değiştirmez
    const w = gate()
    hold(w, 400, 0, 300, 'ok')
    expect(pauseReasons(w, seq(60, (i) => ({ mm: 400, occ: i % 3 === 2 ? 'no-face' : 'wrong-eye' })), 400)).toEqual(['wrong-eye'])
  })

  it('duraklama tek karelik okumanın geldiği karede başlasa da kart o okumayı yazmaz', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    hold(g, 470, 400, 600)
    // 47 cm'de 300 ms doldu; tam o karede mesafe bir an yok
    expect(g.push({ ts: 700, mm: null })).toMatchObject({ paused: true, pausedNow: true, reason: 'too-far' })
    expect(g.push({ ts: 800, mm: 470 })).toMatchObject({ paused: true, reason: 'too-far' })
  })

  it('neden gerçekten değişince kart REASON_SWITCH_MS sonra değişir, önce değişmez', () => {
    const cases = [
      // [ad, ilk kareler (0–1000), sonraki kare, ilk neden, yeni neden]
      ['yüz gerçekten kayboldu', { mm: 470 }, { mm: null }, 'too-far', 'no-face'],
      ['47 cm → 30 cm', { mm: 470 }, { mm: 300 }, 'too-far', 'too-close'],
      ['örtme düzeldi, mesafe bozuk', { mm: 470, occ: 'wrong-eye' }, { occ: 'ok' }, 'wrong-eye', 'too-far'],
      ['örtme kalktı, sonra yanlış göz (sürekli)', { mm: 400, occ: 'uncovered' }, { occ: 'wrong-eye' }, 'uncovered', 'wrong-eye'],
    ]
    for (const [name, a, b, r0, r1] of cases) {
      const g = gate()
      for (let t = 0; t <= 1000; t += 100) g.push({ ts: t, ...a })
      expect(g.status(), name).toMatchObject({ paused: true, reason: r0 })
      g.push({ ts: 1100, ...b })
      expect(g.tick(1100 + REASON_SWITCH_MS - 1), name).toMatchObject({ paused: true, reason: r0 })
      expect(g.tick(1100 + REASON_SWITCH_MS), name).toMatchObject({ paused: true, reason: r1 })
    }
  })

  it('eski neden sonraki duraklamaya taşınmaz', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    expect(hold(g, 400, 400, 1100, 'wrong-eye')).toMatchObject({ paused: true, reason: 'wrong-eye' })
    expect(hold(g, 400, 1200, 5000, 'ok')).toMatchObject({ paused: false, reason: null })
    // yeni duraklama: yüz bir an yok, sonra 47 cm. Kart mesafeyi söyler; ne eski "yanlış göz"ü ne tek karelik yüz kaybını
    g.push({ ts: 5100, mm: null, occ: 'ok' })
    expect(hold(g, 470, 5200, 5400, 'ok')).toMatchObject({ paused: true, pausedNow: true, reason: 'too-far' })
    expect(hold(g, 470, 5500, 6000, 'ok')).toMatchObject({ paused: true, reason: 'too-far' })
  })

  // Kalıntı (fix5 sondası ve mutasyon denetimi): ilk bozuk okuma tek kareyken (47 cm'e giderken bir kare yüz yok) neden
  // hemen o kareden doğuyor, kart "Yüzünü kameraya göster" ile açılıp 100 ms sonra "Biraz yaklaştır · 40 cm"a dönüyordu.
  it('kart tek kareden doğan nedenle açılmaz: en uzun süredir süren koşulla açılır ve değişmez', () => {
    // 47 cm'e giderken ilk kare mesafesiz, sonra her 2. kare mesafesiz (iki evre)
    for (const parity of [0, 1]) {
      const g = gate()
      hold(g, 400, 0, 300, 'ok')
      expect(pauseReasons(g, seq(20, (i) => ({ mm: i % 2 === parity ? null : 470, occ: 'ok' })), 400), `evre ${parity}`).toEqual(['too-far'])
    }
    // 47 cm 300 ms'dir sürüyor; kartın açıldığı karede örtme tek kare "yüz yok" okur
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    hold(g, 470, 400, 600, 'ok')
    expect(g.push({ ts: 700, mm: 470, occ: 'no-face' })).toMatchObject({ paused: true, pausedNow: true, reason: 'too-far' })
    expect(hold(g, 470, 800, 1200, 'ok')).toMatchObject({ paused: true, reason: 'too-far' })
  })

  it('mesafe her 2. karede kaybolurken örtme yanlış göze dönerse kart REASON_SWITCH_MS sonra "wrong-eye" der, düzelince "too-far" (tek karelik kayıp nedeni silmez)', () => {
    const changesOf = (occAt) => {
      const out = []
      for (const parity of [0, 1]) {
        const g = gate()
        const ch = []
        for (let i = 0; i < 40; i++) {
          const ts = 400 + i * 100
          const r = g.push({ ts, mm: i % 2 === parity ? null : 470, occ: occAt(ts) })
          if (r.paused && ch.at(-1)?.reason !== r.reason) ch.push({ ts, reason: r.reason })
        }
        out.push(ch)
      }
      return out
    }
    const at = 1500
    for (const ch of changesOf((ts) => (ts >= at ? 'wrong-eye' : 'ok'))) expect(ch).toEqual([{ ts: 700, reason: 'too-far' }, { ts: at + REASON_SWITCH_MS, reason: 'wrong-eye' }])
    for (const ch of changesOf((ts) => (ts < at ? 'wrong-eye' : 'ok'))) expect(ch).toEqual([{ ts: 700, reason: 'wrong-eye' }, { ts: at + REASON_SWITCH_MS, reason: 'too-far' }])
  })

  // Özellik denemesi (fix5, prop.mjs 400 koşu) yakaladı: unutulan nedenin yerine en uzun süren koşul hemen alınınca, en
  // öndeki başka bir koşul bir kare sonra olgunlaşıyor ve kart 100 ms arayla iki kez değişiyordu.
  it('unutulan nedenin yerine geçecek koşul, en öndeki başka bir koşul olgunlaşmak üzereyken alınmaz (kart art arda iki kez değişmez)', () => {
    const g = gate()
    hold(g, 400, 0, 1100, 'wrong-eye') // 700 ms yanlış göz: duraklama, neden "wrong-eye"
    expect(g.status()).toMatchObject({ paused: true, reason: 'wrong-eye' })
    g.push({ ts: 1200, mm: 470, occ: 'ok' }) // örtme düzeldi, 47 cm: "too-far" aday
    const seen = []
    for (let t = 1300; t <= 2000; t += 100) { // örtme "yüz yok" okur (mesafe 47 cm ölçülmeye devam): "no-face" en önde
      const r = g.push({ ts: t, occ: 'no-face' })
      expect(r.paused, String(t)).toBe(true)
      if (seen.at(-1)?.reason !== r.reason) seen.push({ ts: t, reason: r.reason })
    }
    // 1500: "wrong-eye" 300 ms'dir yok, unutulur; "too-far" 300 ms'dir sürüyor ama en önde "no-face" var (200 ms'dir):
    // kart "too-far"a geçip 100 ms sonra "no-face" demez, 1600'de doğrudan "no-face" der
    expect(seen).toEqual([{ ts: 1300, reason: 'wrong-eye' }, { ts: 1300 + REASON_SWITCH_MS, reason: 'no-face' }])
  })

  it('yanlış göz duraklaması örtmenin tek karelik "yüz yok"unun geldiği karede başlasa da kart "wrong-eye" der (son bozuk okuma sürer)', () => {
    const g = gate()
    hold(g, 400, 0, 300, 'ok')
    // 400'den itibaren W N W W N W W N …: duraklamanın açıldığı kare (1100) "yüz yok" karesi
    expect(pauseReasons(g, seq(40, (i) => ({ mm: 400, occ: i % 3 === 1 ? 'no-face' : 'wrong-eye' })), 400)).toEqual(['wrong-eye'])
  })
})

describe('kamerasız', () => {
  it('mesafe durdurmaz; harf 40 cm\'ye göre, cevap sayılır', () => {
    const g = gate({ distanceTracked: false, occlusion: false })
    expect(hold(g, null, 0, 3000).paused).toBe(false)
    const u = unitFor(0.0, 400)
    expect(g.freeze(u, 600, 3000)).toBe(true)
    const a = g.answer(600, 3500)
    expect(a).toMatchObject({ accepted: true, count: true, change: 0 })
    expect(a.realizedLogMAR).toBeCloseTo(0, 9)
  })

  it('"Kamerasız devam": duraklama biter, yeni yönle 40 cm\'ye göre sürer', () => {
    const g = gate()
    hold(g, 400, 0, 300)
    hold(g, null, 400, 800, 'no-face')
    expect(g.status().paused).toBe(true)
    const r = g.continueWithoutCamera(1000)
    expect(r).toMatchObject({ paused: false, resumed: true, reshowNewDir: true })
    expect(hold(g, null, 1100, 3000, 'no-face').paused).toBe(false)
    expect(g.freeze(unitFor(0.1, 400), null, 3000)).toBe(true)
    expect(g.answer(null, 3100)).toMatchObject({ count: true })
    expect(g.stats(3100)).toMatchObject({ pauses: 1, pausedMs: 300 })
  })
})

describe('sözleşme', () => {
  it('pxPerMm, evre ve zaman zorunlu', () => {
    expect(() => createTrialGate({})).toThrow()
    expect(() => createTrialGate({ pxPerMm: PX_PER_MM, phase: 'fine' })).toThrow()
    expect(() => gate().push({ mm: 400 })).toThrow()
  })

  it('saf: içeride saat okunmaz', () => {
    const src = readFileSync(new URL('./trialGate.js', import.meta.url), 'utf8')
    expect(src).not.toMatch(/Date\.now|performance\.now|new Date\(/)
  })
})
