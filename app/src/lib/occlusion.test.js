import { describe, it, expect } from 'vitest'
import { classify, coveredSide, createOcclusionMonitor, coverFor, occlusionMessage, GATE_MS, BREAK_MS, RESUME_MS } from './occlusion.js'

const frame = (l, r) => ({ face: true, blinkLeft: l, blinkRight: r })
// 30 Hz kareler
function feed(m, l, r, fromMs, toMs) {
  let snap = null
  for (let t = fromMs; t <= toMs; t += 33) snap = m.push(l == null ? { face: false } : frame(l, r), t)
  return snap
}

describe('classify', () => {
  it('tek göz: iki göz birden açıksa uncovered; biri kapalıysa ok (Build 24 cihazı: 0,88 / 0,87 birlikte)', () => {
    expect(coverFor('R')).toBe('L')
    expect(classify(0.87, 0.88, 'L')).toBe('ok')
    expect(classify(0.9, 0.05, 'L')).toBe('ok')
    expect(classify(0.05, 0.9, 'R')).toBe('ok')
    expect(classify(0.05, 0.05, 'L')).toBe('uncovered')
    expect(classify(0.5, 0.3, 'L')).toBe('unclear')
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

describe('createOcclusionMonitor', () => {
  it('kapı: doğru durum 1 sn sürmeden açılmaz', () => {
    const m = createOcclusionMonitor('L')
    expect(feed(m, 0.9, 0.05, 0, GATE_MS - 200).gateReady).toBe(false)
    expect(feed(m, 0.9, 0.05, GATE_MS - 167, GATE_MS + 200).gateReady).toBe(true)
  })
  it('iki göz açıkken kapı açılmaz (şikâyet: iki göz açık sağ göz testi)', () => {
    const m = createOcclusionMonitor('L')
    const s = feed(m, 0.05, 0.05, 0, 3000)
    expect(s.gateReady).toBe(false)
    expect(s.state).toBe('uncovered')
  })
  it('kırpma testi durdurmaz; örtüyü açmak 0,7 sn sonra durdurur, düzelince devam eder', () => {
    const m = createOcclusionMonitor('L')
    feed(m, 0.9, 0.05, 0, 1500)
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
    feed(m, 0.9, 0.05, 1533, 3000)
    m.resetStats()
    expect(m.snapshot(3000)).toMatchObject({ pauses: 0, blockedMs: 0, blocked: false })
  })
  it('yüz kaybolursa durdurur', () => {
    const m = createOcclusionMonitor('R')
    feed(m, 0.05, 0.9, 0, 1200)
    expect(feed(m, null, null, 1233, 2200).blocked).toBe(true)
  })
})

describe('occlusionMessage', () => {
  it('Türkçe kısa yönerge', () => {
    expect(occlusionMessage('uncovered', 'L')).toBe('İki gözün açık · sol gözünü avucunla ört')
    expect(occlusionMessage('ok', 'L')).toBe('Sol göz örtülü · sağ gözünle bak')
    expect(occlusionMessage('wrong-eye', 'L')).toBe('Diğer gözünü örtmüşsün · sol gözünü ört')
    expect(occlusionMessage('ok', 'none')).toBe('İki gözün açık')
  })
})
