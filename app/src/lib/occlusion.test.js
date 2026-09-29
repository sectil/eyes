import { describe, it, expect } from 'vitest'
import { classify, coveredSide, createOcclusionMonitor, coverFor, occlusionMessage, GATE_MS, BREAK_MS, RESUME_MS, DEPTH_DELTA_MM } from './occlusion.js'

const frame = (l, r) => ({ face: true, blinkLeft: l, blinkRight: r })
// 30 Hz kareler
function feed(m, l, r, fromMs, toMs) {
  let snap = null
  for (let t = fromMs; t <= toMs; t += 33) snap = m.push(l == null ? { face: false } : frame(l, r), t)
  return snap
}

describe('classify', () => {
  it('tek göz: iki göz birden açıksa uncovered; biri kapalıysa taraf bilinmez → lid-ask (Build 24 cihazı: 0,88 / 0,87 birlikte)', () => {
    expect(coverFor('R')).toBe('L')
    expect(classify(0.87, 0.88, 'L')).toBe('lid-ask')
    expect(classify(0.9, 0.05, 'L')).toBe('lid-ask')
    expect(classify(0.05, 0.9, 'R')).toBe('lid-ask')
    expect(classify(0.05, 0.05, 'L')).toBe('uncovered')
    expect(classify(0.5, 0.3, 'L')).toBe('unclear')
  })
  it('kapak yolu yanlış gözü kendiliğinden kabul etmez (PLAN 1.8: classify(0.05, 0.92, "L") eskiden ok)', () => {
    // Sol örtülmeli; okunan: sağ kapalı. Kamera tarafı ayırt edemez → onay istenir, 'ok' değil.
    expect(classify(0.05, 0.92, 'L')).toBe('lid-ask')
    expect(classify(0.05, 0.92, 'L', null, true)).toBe('lid-ask')
    // Kişi onaylayınca kapak yolu kabul
    expect(classify(0.05, 0.92, 'L', null, false, true)).toBe('ok')
    expect(classify(0.9, 0.9, 'R', null, true, true)).toBe('ok')
    // Onay derinliğin gördüğü yanlış tarafı geçemez
    expect(classify(0.9, 0.9, 'L', 'R', true, true)).toBe('wrong-eye')
    // Onay açık iki gözü örtülü saymaz
    expect(classify(0.05, 0.05, 'L', null, false, true)).toBe('uncovered')
  })
  it('iki göz testi ikisi açık', () => {
    expect(classify(0.1, 0.1, 'none')).toBe('ok')
    expect(classify(0.9, 0.1, 'none')).toBe('closed')
    expect(classify(null, 0.1, 'none')).toBe('no-face')
  })
})

describe('derinlik: hangi göz örtülü', () => {
  it('coveredSide: 15 mm fark → yakın taraf örtülü; az fark → bilinmez', () => {
    expect(coveredSide(372, 401)).toBe('L')
    expect(coveredSide(400, 380)).toBe('R')
    expect(coveredSide(400, 392)).toBeNull()
    expect(coveredSide(null, 392)).toBeNull()
  })
  it('14 / 15 mm sınırı: 14 mm taraf söylemez, 15 mm söyler (iki yönde)', () => {
    expect(DEPTH_DELTA_MM).toBe(15)
    expect(coveredSide(386, 400)).toBeNull()
    expect(coveredSide(385, 400)).toBe('L')
    expect(coveredSide(400, 386)).toBeNull()
    expect(coveredSide(400, 385)).toBe('R')
    expect(coveredSide(385.01, 400)).toBeNull()
    // Cihazda iki göz açıkken ölçülen fark 4 mm (381 / 385): taraf yok
    expect(coveredSide(385, 381)).toBeNull()
  })
  it('classify: derinlik tarafı belirleyici; yanlış göz yakalanır; iki göz testinde el = kapalı', () => {
    expect(classify(null, null, 'L', 'L', true)).toBe('ok')
    expect(classify(null, null, 'L', 'R', true)).toBe('wrong-eye')
    expect(classify(0.05, 0.05, 'L', null, true)).toBe('uncovered')
    expect(classify(null, null, 'L', null, true)).toBe('unclear')
    expect(classify(0.1, 0.1, 'none', 'R', true)).toBe('closed')
  })
})

// 10 Hz derinlik kareleri (yüz kareleri yok: el yüzü örttü, ARKit yüzü kaybetti)
function feedDepth(m, dl, dr, fromMs, toMs) {
  let snap = null
  for (let t = fromMs; t <= toMs; t += 100) snap = m.pushDepth({ eyesKnown: true, leftMm: dl, rightMm: dr }, t)
  return snap
}

describe('createOcclusionMonitor + derinlik', () => {
  it('avuç sol gözde (yüz kareleri yok): sağ göz testi 1 sn sonra açılır, yöntem derinlik', () => {
    const m = createOcclusionMonitor('L')
    m.push({ face: false }, 0)
    const s = feedDepth(m, 370, 400, 100, 1400)
    expect(s.gateReady).toBe(true)
    expect(s.method).toBe('depth')
  })
  it('yanlış göz örtülürse açılmaz, testte durdurur', () => {
    const m = createOcclusionMonitor('L')
    expect(feedDepth(m, 400, 370, 0, 1500)).toMatchObject({ gateReady: false, state: 'wrong-eye', blocked: true })
  })
  it('kareler tamamen durursa tick zamanı ilerletir → bayat bilgi durdurur', () => {
    const m = createOcclusionMonitor('L')
    feedDepth(m, 370, 400, 0, 1500)
    // AcuityTest tick'i ~100 ms'de bir çağırır
    let snap = null
    for (let t = 1600; t <= 1500 + 600 + BREAK_MS + 200; t += 100) snap = m.tick(t)
    expect(snap).toMatchObject({ state: 'no-face', blocked: true })
  })
})

describe('createOcclusionMonitor · kapak yolu onayı', () => {
  it('kapak kapalı ama onay yok: kapı hiç açılmaz, durum lid-ask, yöntem yok', () => {
    const m = createOcclusionMonitor('L')
    const s = feed(m, 0.9, 0.05, 0, 3000)
    expect(s).toMatchObject({ state: 'lid-ask', gateReady: false, method: null, lidConfirmed: false })
    // lid-ask testi durdurmaz (belirsiz gibi): yalnız açıkça yanlış durumlar durdurur
    expect(s.blocked).toBe(false)
  })
  it('confirmLid: onaydan sonra 1 sn tutunca kapı açılır, yöntem lid', () => {
    const m = createOcclusionMonitor('L')
    feed(m, 0.9, 0.05, 0, 500)
    const c = m.confirmLid(520)
    expect(c).toMatchObject({ state: 'ok', method: 'lid', lidConfirmed: true, gateReady: false })
    expect(feed(m, 0.9, 0.05, 553, 520 + GATE_MS - 100).gateReady).toBe(false)
    const s = feed(m, 0.9, 0.05, 520 + GATE_MS - 67, 520 + GATE_MS + 100)
    expect(s).toMatchObject({ gateReady: true, method: 'lid' })
    expect(s.holdMs).toBeGreaterThanOrEqual(GATE_MS)
  })
  it('confirmLid yalnız lid-ask iken kabul edilir (dokunuş ile ekran arasında durum değiştiyse yok sayılır)', () => {
    const m = createOcclusionMonitor('L')
    feed(m, 0.05, 0.05, 0, 500) // iki göz açık
    expect(m.confirmLid(510)).toMatchObject({ state: 'uncovered', lidConfirmed: false })
    // sonra göz kapanınca yine onay sorulur
    expect(feed(m, 0.9, 0.05, 533, 900).state).toBe('lid-ask')
  })
  it('onaydan sonra derinlik yanlış tarafı görürse wrong-eye', () => {
    const m = createOcclusionMonitor('L')
    feed(m, 0.9, 0.05, 0, 300)
    m.confirmLid(310)
    let s = null
    for (let t = 333; t <= 900; t += 33) {
      m.push(frame(0.9, 0.05), t)
      s = m.pushDepth({ eyesKnown: true, leftMm: 400, rightMm: 370 }, t)
    }
    expect(s.state).toBe('wrong-eye')
  })
})

describe('createOcclusionMonitor · yöntem ve süreler', () => {
  it('iki göz testinde yöntem "open": "lid" yazılmaz (PLAN 1.8: "Tek göz kamerayla izlendi" hatası)', () => {
    const m = createOcclusionMonitor('none')
    expect(feed(m, 0.05, 0.05, 0, 1200)).toMatchObject({ state: 'ok', method: 'open', gateReady: true })
    // derinlikle (yüz karesi yok) açık iki göz: yine 'open'
    const d = createOcclusionMonitor('none')
    expect(feedDepth(d, 400, 396, 0, 1200)).toMatchObject({ state: 'ok', method: 'open' })
  })
  it('avuç (derinlik) yolu: yöntem depth', () => {
    const m = createOcclusionMonitor('R')
    expect(feedDepth(m, 400, 370, 0, 1200)).toMatchObject({ state: 'ok', method: 'depth', gateReady: true })
  })
  it('sinceFaceMs: yüz görünür ama ok değilken artar; ok ya da yüz yokken 0', () => {
    const m = createOcclusionMonitor('L')
    const u = feed(m, 0.05, 0.05, 0, 4000)
    expect(u.state).toBe('uncovered')
    expect(u.sinceFaceMs).toBeGreaterThanOrEqual(3950)
    expect(feed(m, null, null, 4033, 4100).sinceFaceMs).toBe(0)
    const d = createOcclusionMonitor('L')
    feed(d, 0.05, 0.05, 0, 2000)
    expect(feedDepth(d, 370, 400, 2033, 2400).sinceFaceMs).toBe(0)
  })
  it('holdMs: ok sürdükçe artar, bozulunca 0', () => {
    const m = createOcclusionMonitor('R')
    expect(feedDepth(m, 400, 370, 0, 500).holdMs).toBe(500)
    expect(feedDepth(m, 400, 398, 600, 900).holdMs).toBe(0)
  })
})

// Kapak yolunda onaylı başlangıç (kişi "Evet, sol gözüm kapalı" dedi)
function confirmed(need, l, r, until) {
  const m = createOcclusionMonitor(need)
  m.push(frame(l, r), 0)
  m.confirmLid(0)
  if (until) feed(m, l, r, 33, until)
  return m
}

describe('createOcclusionMonitor', () => {
  it('kapı: doğru durum 1 sn sürmeden açılmaz', () => {
    const m = confirmed('L', 0.9, 0.05)
    expect(feed(m, 0.9, 0.05, 33, GATE_MS - 200).gateReady).toBe(false)
    expect(feed(m, 0.9, 0.05, GATE_MS - 167, GATE_MS + 200).gateReady).toBe(true)
  })
  it('iki göz açıkken kapı açılmaz (şikâyet: iki göz açık sağ göz testi)', () => {
    const m = createOcclusionMonitor('L')
    const s = feed(m, 0.05, 0.05, 0, 3000)
    expect(s.gateReady).toBe(false)
    expect(s.state).toBe('uncovered')
  })
  it('kırpma testi durdurmaz; örtüyü açmak 0,7 sn sonra durdurur, düzelince devam eder', () => {
    const m = confirmed('L', 0.9, 0.05, 1500)
    // test edilen göz 300 ms kırpar
    expect(feed(m, 0.9, 0.95, 1533, 1833).blocked).toBe(false)
    feed(m, 0.9, 0.05, 1866, 2500)
    // örtü açıldı
    expect(feed(m, 0.05, 0.05, 2533, 2533 + BREAK_MS - 250).blocked).toBe(false)
    const b = feed(m, 0.05, 0.05, 2533 + BREAK_MS - 217, 2533 + BREAK_MS + 200)
    expect(b.blocked).toBe(true)
    expect(b.pauses).toBe(1)
    const back = feed(m, 0.9, 0.05, 3500, 3500 + RESUME_MS + 200)
    expect(back.blocked).toBe(false)
    expect(back.blockedMs).toBeGreaterThan(0)
  })
  it('resetStats: yönerge ekranındaki bekleme teste sayılmaz', () => {
    const m = createOcclusionMonitor('L')
    expect(feed(m, 0.05, 0.05, 0, 1500).pauses).toBe(1)
    feed(m, 0.9, 0.05, 1533, 1600)
    m.confirmLid(1600)
    feed(m, 0.9, 0.05, 1633, 3000)
    m.resetStats()
    expect(m.snapshot(3000)).toMatchObject({ pauses: 0, blockedMs: 0, blocked: false })
  })
  it('yüz kaybolursa durdurur', () => {
    const m = confirmed('R', 0.05, 0.9, 1200)
    expect(feed(m, null, null, 1233, 2200).blocked).toBe(true)
  })
})

describe('occlusionMessage', () => {
  const STATES = ['ok', 'no-face', 'closed', 'uncovered', 'wrong-eye', 'lid-ask', 'unclear', undefined]
  const NEEDS = ['L', 'R', 'none']
  const METHODS = ['depth', 'lid', 'open', null]
  const all = () => STATES.flatMap((st) => NEEDS.flatMap((nd) => METHODS.map((me) => ({ st, nd, me, msg: occlusionMessage(st, nd, me) }))))

  it('yalnız emir: kısa Türkçe emir cümleleri (E6 duraklama kartı)', () => {
    expect(occlusionMessage('uncovered', 'L')).toBe('Sol gözünü avucunla ört')
    expect(occlusionMessage('uncovered', 'R')).toBe('Sağ gözünü avucunla ört')
    expect(occlusionMessage('wrong-eye', 'L')).toBe('Yanlış göz · solu ört')
    expect(occlusionMessage('wrong-eye', 'R')).toBe('Yanlış göz · sağı ört')
    expect(occlusionMessage('no-face', 'L')).toBe('Yüzünü kameraya göster')
    expect(occlusionMessage('closed', 'none')).toBe('İki gözünü de aç')
    expect(occlusionMessage('no-face', 'none')).toBe('Yüzünü kameraya göster')
    expect(occlusionMessage('ok', 'none')).toBe('Böyle kal')
    // lid-ask testte onaylanamaz: avuç (derinlik) tarafı doğrular
    expect(occlusionMessage('lid-ask', 'L', 'lid')).toBe('Sol gözünü avucunla ört')
  })
  it('kapak yolunda taraf gerçek gibi söylenmez: ("ok", "L", "lid") ve hiçbir mesaj "sol göz örtülü" demez', () => {
    const lidOk = occlusionMessage('ok', 'L', 'lid')
    expect(lidOk).not.toMatch(/sol|sağ/i)
    expect(occlusionMessage('ok', 'R', 'lid')).not.toMatch(/sol|sağ/i)
    for (const { msg } of all()) {
      expect(msg).not.toMatch(/(sol|sağ) göz(ün)? (örtülü|kapalı)/i)
      expect(msg).not.toMatch(/örtmüşsün|gözün açık|görünmüyor/i) // durum cümlesi değil
    }
  })
  it('hiçbir mesaj "başlayabilirsin" demez; hepsi boş olmayan metin', () => {
    for (const { msg } of all()) {
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
      expect(msg).not.toMatch(/başlayabilirsin/i)
    }
  })
  it('belirsizde fiil yöntemi izler: kapakla "kapat", avuçla "ört"', () => {
    expect(occlusionMessage('unclear', 'L', 'lid')).toBe('Sol gözünü tam kapat, sağ gözünü kısma')
    expect(occlusionMessage('unclear', 'R', 'depth')).toBe('Sağ gözünü tam ört, sol gözünü kısma')
  })
})
