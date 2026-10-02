import { describe, it, expect } from 'vitest'
import { adaptModel, createObsCollector, predict, CAL_FRAC, ADAPT_MAX, ADAPT_MIN_FRAMES } from './gazeAdapt.js'

// Kalibrasyon modeli (scr, mm): x sol −16, orta 0, sağ +16; y aşağı −30, orta 0, yukarı +30 (y pos = yukarı)
const model = () => ({ version: 3, ok: true, x: { feature: 'scrX', c: 0, neg: -16, pos: 16, score: 20 }, y: { feature: 'scrY', c: 0, neg: -30, pos: 30, score: 20 } })
// Gerçek eşleme: kalibrasyon kazancı düşük kalmış (gerçekte sağ +20) → sağ hedefe (%80) bakınca x = 20·(0,8−0,5)/0,42
const trueX = (p) => (20 * (p - 0.5)) / 0.42
const obsAt = (px, py = 0.46, dir = 'right') => ({ dir, px, py, x: trueX(px), y: 0, n: 30 })

describe('kendini iyileştiren model (gazeAdapt)', () => {
  it('predict: kalibrasyon dayanaklarından parça doğrusal', () => {
    const b = { c: 0, neg: -16, pos: 16 }
    expect(predict(b, CAL_FRAC.x, 0.5)).toBeCloseTo(0, 6)
    expect(predict(b, CAL_FRAC.x, 0.92)).toBeCloseTo(16, 6)
    expect(predict(b, CAL_FRAC.x, 0.71)).toBeCloseTo(8, 6)
    // y ekseni: üstten oran; yukarı (0,12) = pos
    expect(predict({ c: 0, neg: -30, pos: 30 }, CAL_FRAC.y, 0.12)).toBeCloseTo(30, 6)
  })
  it('gözlemler modeli gerçeğe doğru çeker; kalibrasyon dayanak kalır (tek gözlemle az, çok gözlemle çok)', () => {
    let m = model()
    const r1 = adaptModel(m, obsAt(0.8), 'T')
    expect(r1.changed).toBe(true)
    expect(r1.model.x.pos).toBeGreaterThan(16)
    expect(r1.model.base.x.pos).toBe(16) // dayanak değişmez
    const one = r1.model.x.pos
    m = r1.model
    for (let i = 0; i < 10; i++) m = adaptModel(m, obsAt(i % 2 ? 0.8 : 0.2, 0.46, i % 2 ? 'right' : 'left'), 'T').model
    expect(m.x.pos).toBeGreaterThan(one)
    expect(m.x.pos).toBeLessThan(20.5) // gerçeği aşmaz
    expect(m.adapt.n).toBe(11)
    expect(m.adapt.at).toBe('T')
  })
  it('gözlem yoksa model birebir kalibrasyon; y gözlemi merkezdeyse y değişmez', () => {
    const r = adaptModel(model(), obsAt(0.8), 'T')
    expect(r.model.y.c).toBeCloseTo(0, 6)
    expect(r.model.y.pos).toBeCloseTo(30, 6)
  })
  it('aşırı sapan gözlem atılır (kişi başka yere bakıyordu)', () => {
    const r = adaptModel(model(), { dir: 'right', px: 0.8, py: 0.46, x: 60, y: 0, n: 30 })
    expect(r.changed).toBe(false)
    expect(r.reason).toBe('outlier')
  })
  it('kazanç sınırı: düzeltme aralığı yarıdan küçüğe düşüremez', () => {
    let m = model()
    let last
    // Sağ hedefte hep merkeze yakın değer (kazancı çökertmeye çalışır)
    for (let i = 0; i < 30; i++) {
      last = adaptModel(m, { dir: 'right', px: 0.9, py: 0.46, x: 1, y: 0, n: 30 })
      m = last.model
    }
    expect(Math.abs(m.x.pos - m.x.c)).toBeGreaterThanOrEqual(8 - 1e-9)
    expect(Math.sign(m.x.pos - m.x.c)).toBe(1)
  })
  it('en fazla ADAPT_MAX gözlem tutulur', () => {
    let m = model()
    for (let i = 0; i < ADAPT_MAX + 6; i++) m = adaptModel(m, obsAt(0.8)).model
    expect(m.adapt.obs.length).toBe(ADAPT_MAX)
  })
  it('toplayıcı: hedef tarafında, sabit ve yeterli kare → gözlem; kayma çıkarılır', () => {
    const m = model()
    const col = createObsCollector(m, 'right')
    const center = { x: 2, y: 1 } // okuyucu merkezi 2 mm kaymış
    for (let i = 0; i < 60; i++) {
      const ts = i * 33
      col.push({ ts, scrLX: 12 + 2, scrRX: 12 + 2, scrLY: 1, scrRY: 1 }, { tracked: true, closed: false, v: { x: 14, y: 1 } }, center)
    }
    const o = col.finish({ x: 0.8, y: 0.46 })
    expect(o.x).toBeCloseTo(12, 6)
    expect(o.y).toBeCloseTo(0, 6)
    expect(o.n).toBeGreaterThanOrEqual(ADAPT_MIN_FRAMES)
  })
  it('toplayıcı: ters tarafa ya da çapraza bakış, kapalı göz, yerleşme süresi sayılmaz', () => {
    const col = createObsCollector(model(), 'right')
    for (let i = 0; i < 60; i++) {
      const ts = i * 33
      const g = i % 3 === 0 ? { tracked: true, closed: false, v: { x: -14, y: 0 } } : i % 3 === 1 ? { tracked: true, closed: false, v: { x: 6, y: 12 } } : { tracked: true, closed: true, v: { x: 14, y: 0 } }
      col.push({ ts, scrLX: 12, scrRX: 12, scrLY: 0, scrRY: 0 }, g, { x: 0, y: 0 })
    }
    expect(col.finish({ x: 0.8, y: 0.46 })).toBeNull()
    expect(createObsCollector(model(), 'cw')).toBeNull()
    expect(createObsCollector(null, 'right')).toBeNull()
  })
})
