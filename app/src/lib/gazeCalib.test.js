import { describe, it, expect } from 'vitest'
import { fitModel, fitAxis, summarize, normAxis, applyModel, createOneEuro, MIN_SCORE } from './gazeCalib.js'
import { createGazeReader, GAZE_FULL_DEG } from './gaze.js'

// Deterministik gürültü
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Kişinin gerçek bakışı (gx: sağ +, gy: yukarı +, derece) → cihazın verdiği ham sinyaller.
// signX/signY: ARKit'in (bilinmeyen) işaret kuralı; kalibrasyon bunu bilmeden çözmeli.
function makeFrame(gx, gy, { signX = 1, signY = 1, noise = 0.6, r = rng(1), angOffset = 3, lookGain = 0.004 } = {}) {
  const n = () => (r() - 0.5) * 2 * noise
  const ax = signX * gx + angOffset + n()
  const ay = signY * gy - 2 + n()
  return {
    tracked: true,
    face: true,
    gazeLeftX: ax,
    gazeRightX: ax,
    gazeLeftY: ay,
    gazeRightY: ay,
    lookAtX: -signX * gx * lookGain + n() * 0.001,
    lookAtY: signY * gy * lookGain + n() * 0.001,
    lookInLeft: 0,
    lookInRight: 0,
    lookOutLeft: 0,
    lookOutRight: 0,
    lookUpLeft: 0,
    lookUpRight: 0,
    lookDownLeft: 0,
    lookDownRight: 0,
    blinkLeft: 0.05,
    blinkRight: 0.05,
  }
}

const TARGET_DEG = { center: [0, 0], left: [-15, 0], right: [15, 0], up: [0, 12], down: [0, -12], center2: [0, 0] }

function windows(opts = {}) {
  const r = rng(opts.seed ?? 7)
  const w = {}
  for (const [t, [gx, gy]] of Object.entries(TARGET_DEG)) {
    w[t] = Array.from({ length: 30 }, () => makeFrame(gx, gy, { ...opts, r }))
  }
  return w
}

describe('fitModel', () => {
  for (const signX of [1, -1]) {
    for (const signY of [1, -1]) {
      it(`işaret kuralını tahmin etmeden çözer (signX ${signX}, signY ${signY})`, () => {
        const m = fitModel(windows({ signX, signY }))
        expect(m.ok).toBe(true)
        // Sol hedefe bakış → negatif, sağa → pozitif (ARKit işareti ne olursa olsun)
        const left = applyModel(m, makeFrame(-15, 0, { signX, signY, noise: 0 }))
        const right = applyModel(m, makeFrame(15, 0, { signX, signY, noise: 0 }))
        const up = applyModel(m, makeFrame(0, 12, { signX, signY, noise: 0 }))
        const down = applyModel(m, makeFrame(0, -12, { signX, signY, noise: 0 }))
        expect(left.x).toBeLessThan(-0.8)
        expect(right.x).toBeGreaterThan(0.8)
        expect(up.y).toBeGreaterThan(0.8)
        expect(down.y).toBeLessThan(-0.8)
      })
    }
  }

  it('asimetrik kazanç: sola hareket zayıf olsa da sol hedef −1 olur', () => {
    const r = rng(3)
    const w = windows()
    // Sol bakışta sinyal yarı büyüklükte (kullanıcının "sol çalışmıyor" durumu)
    w.left = Array.from({ length: 30 }, () => makeFrame(-7, 0, { r }))
    const m = fitModel(w)
    expect(m.ok).toBe(true)
    expect(applyModel(m, makeFrame(-7, 0, { noise: 0 })).x).toBeCloseTo(-1, 1)
    expect(applyModel(m, makeFrame(15, 0, { noise: 0 })).x).toBeCloseTo(1, 1)
  })

  it('en net sinyali seçer; açı gürültülüyse lookAt kullanılır', () => {
    const m = fitModel(windows({ noise: 20 }))
    expect(m.x.feature).toBe('lookX')
  })

  it('ayrışmayan eksen → ok false', () => {
    const w = windows()
    w.left = w.center
    const m = fitModel(w)
    expect(m.ok).toBe(false)
  })
})

describe('fitAxis / normAxis', () => {
  it('iki yan aynı taraftaysa sinyal elenir', () => {
    const c = { a: { med: 0, mad: 0.1 } }
    expect(fitAxis(c, { a: { med: 1, mad: 0.1 } }, { a: { med: 2, mad: 0.1 } }, ['a'])).toBeNull()
  })
  it('normAxis: merkez 0, pos +1, neg −1, ters işaretli sinyalde de', () => {
    const ax = { c: 10, pos: 4, neg: 18 } // pos (sağ) ham değeri azaltıyor
    expect(normAxis(ax, 10)).toBe(0)
    expect(normAxis(ax, 4)).toBeCloseTo(1)
    expect(normAxis(ax, 18)).toBeCloseTo(-1)
    expect(normAxis(ax, 7)).toBeCloseTo(0.5)
  })
  it('summarize az örnekte sinyali atlar', () => {
    expect(summarize([makeFrame(0, 0)]).angX).toBeUndefined()
  })
  it('MIN_SCORE makul', () => {
    expect(MIN_SCORE).toBeGreaterThan(1)
  })
})

describe('createOneEuro', () => {
  it('sabit girdide sabit, gürültüyü azaltır', () => {
    const f = createOneEuro()
    const r = rng(5)
    const outs = []
    for (let i = 0; i < 60; i++) outs.push(f.push(10 + (r() - 0.5) * 4, i * 33))
    const tail = outs.slice(30)
    const spread = Math.max(...tail) - Math.min(...tail)
    expect(spread).toBeLessThan(4)
    expect(tail.at(-1)).toBeGreaterThan(8)
  })
  it('büyük sıçramaya hızla yetişir', () => {
    const f = createOneEuro()
    for (let i = 0; i < 20; i++) f.push(0, i * 33)
    let v
    for (let i = 20; i < 32; i++) v = f.push(20, i * 33)
    expect(v).toBeGreaterThan(15)
  })
})

describe('createGazeReader (model modu)', () => {
  const m = fitModel(windows({ signX: -1 }))
  const feed = (reader, gx, gy, n = 20, t0 = 0) => {
    let r
    for (let i = 0; i < n; i++) r = reader.push({ ...makeFrame(gx, gy, { signX: -1, noise: 0.2, r: rng(i + t0) }), ts: t0 + i * 33 })
    return r
  }
  it('model ile hemen kalibre, sola bakış → left', () => {
    const reader = createGazeReader({ model: m })
    expect(feed(reader, 0, 0).dir).toBe('center')
    expect(feed(reader, -15, 0, 20, 1000).dir).toBe('left')
    expect(feed(reader, 15, 0, 20, 2000).dir).toBe('right')
    expect(feed(reader, 0, 12, 20, 3000).dir).toBe('up')
    expect(feed(reader, 0, -12, 20, 4000).dir).toBe('down')
  })
  it('v birimi: kalibrasyon hedefi ≈ GAZE_FULL_DEG', () => {
    const reader = createGazeReader({ model: m })
    const r = feed(reader, 15, 0, 30)
    expect(r.v.x).toBeGreaterThan(GAZE_FULL_DEG * 0.8)
  })
  it('recenter küçük kaymayı düzeltir, hedefe bakışı nötr sanmaz', () => {
    const reader = createGazeReader({ model: m })
    reader.recenter()
    // Kişi baştan sola bakıyor: kayma büyük → kabul edilmez, sol algılanır
    const r = feed(reader, -15, 0, 60)
    expect(r.dir).toBe('left')
  })
  it('gözler kapalı / yüz yok', () => {
    const reader = createGazeReader({ model: m })
    expect(reader.push({ ...makeFrame(0, 0), blinkLeft: 0.9, blinkRight: 0.9, ts: 0 }).closed).toBe(true)
    expect(reader.push({ tracked: false, face: false, ts: 10 }).tracked).toBe(false)
  })
})
