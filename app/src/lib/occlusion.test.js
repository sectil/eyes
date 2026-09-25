import { describe, it, expect } from 'vitest'
import { classify, createOcclusionMonitor, coverFor, occlusionMessage, GATE_MS, BREAK_MS, RESUME_MS } from './occlusion.js'

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
    expect(occlusionMessage('uncovered', 'L')).toBe('İki gözün açık · sol gözünü kapat')
    expect(occlusionMessage('ok', 'L')).toBe('Bir gözün kapalı · sağ gözünle bak')
    expect(occlusionMessage('ok', 'none')).toBe('İki gözün açık')
  })
})
