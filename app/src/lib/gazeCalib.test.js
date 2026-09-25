import { describe, it, expect, afterEach, vi } from 'vitest'
import { windowStable, fitModel, fitAxis, summarize, normAxis, applyModel, createOneEuro, MIN_SCORE, calibReport, closeThreshold, loadGazeModel, saveGazeModel, clearGazeModel, GAZE_MODEL_KEY, GAZE_MODEL_VERSION, DOWN_CLOSE_MAX, headRef, headTurned, HEAD_TURN_DEG } from './gazeCalib.js'
import { createGazeReader, lookingAtPhone, GAZE_FULL_DEG } from './gaze.js'

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
// head: baş duruşu (kameraya göre, derece); cam = göz + baş (kameraya göre) + ARKit sabit sapması.
// cam: false → eski eklenti (alanlar yok).
function makeFrame(gx, gy, { signX = 1, signY = 1, noise = 0.6, r = rng(1), angOffset = 3, lookGain = 0.004, head = { x: 0, y: 0 }, cam = true } = {}) {
  const n = () => (r() - 0.5) * 2 * noise
  const camF = cam ? { camLeftX: gx + head.x + 2 + n(), camRightX: gx + head.x + 2 + n(), camLeftY: gy + head.y - 6 + n(), camRightY: gy + head.y - 6 + n(), headX: head.x + n() * 0.5, headY: head.y + n() * 0.5 } : {}
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
    ...camF,
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

describe('kalibrasyon v2: aşağı bakışta göz kapağı, rapor, sürüm', () => {
  afterEach(() => vi.unstubAllGlobals())
  const withClosure = (frames, c) => frames.map((f) => ({ ...f, blinkLeft: c, blinkRight: c }))

  it('closeThreshold: aşağı bakış kapanma ortancası + 0,2; 0,5–0,85 aralığında', () => {
    expect(closeThreshold([])).toBe(0.5)
    expect(closeThreshold(withClosure(windows().down, 0.1))).toBe(0.5)
    expect(closeThreshold(withClosure(windows().down, 0.45))).toBeCloseTo(0.65, 6)
    expect(closeThreshold(withClosure(windows().down, 0.8))).toBe(DOWN_CLOSE_MAX)
  })

  it('model aşağı bakıştaki kapanmayı öğrenir; okuyucu aşağı bakışı "kapalı" saymaz, gerçek kırpmayı sayar', () => {
    const w = windows()
    w.down = withClosure(w.down, 0.55) // aşağı bakınca göz kapağı iner
    const m = fitModel(w)
    expect(m.ok).toBe(true)
    expect(m.version).toBe(GAZE_MODEL_VERSION)
    expect(m.closeAt).toBeCloseTo(0.75, 6)
    const reader = createGazeReader({ model: m })
    let r
    for (let i = 0; i < 20; i++) r = reader.push({ ...makeFrame(0, -12, { noise: 0.2, r: rng(i) }), blinkLeft: 0.55, blinkRight: 0.55, ts: i * 33 })
    expect(r.closed).toBe(false)
    expect(r.dir).toBe('down')
    expect(reader.push({ ...makeFrame(0, 0), blinkLeft: 0.95, blinkRight: 0.95, ts: 1000 }).closed).toBe(true)
  })

  it('calibReport: yalnızca sayılar, eksen başına tüm aday skorları', () => {
    const w = windows()
    const m = fitModel(w)
    const rep = calibReport(w, m)
    expect(rep.targets.left.n).toBe(30)
    expect(rep.targets.left.angX.med).toBeTypeOf('number')
    expect(Object.keys(rep.scores.x)).toEqual(['camX', 'angX', 'lookX', 'blendX'])
    expect(rep.scores.x.angX).toBeGreaterThan(MIN_SCORE)
    expect(rep.model).toBe(m)
    expect(JSON.stringify(rep)).not.toMatch(/image|jpeg|png/i)
  })

  it('eski sürüm (v1, ekran kenarı) model yüklenmez → yeniden kalibrasyon', () => {
    const mem = new Map()
    vi.stubGlobal('localStorage', { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) })
    const m = fitModel(windows())
    saveGazeModel(m)
    expect(loadGazeModel()?.version).toBe(GAZE_MODEL_VERSION)
    mem.set(GAZE_MODEL_KEY, JSON.stringify({ ...m, version: 1 }))
    expect(loadGazeModel()).toBeNull()
    clearGazeModel()
    expect(loadGazeModel()).toBeNull()
  })
})

describe('lookingAtPhone', () => {
  const m = fitModel(windows())
  const feed = (reader, gx, gy, n = 20, t0 = 0) => {
    let r
    for (let i = 0; i < n; i++) r = reader.push({ ...makeFrame(gx, gy, { noise: 0.2, r: rng(i + t0) }), ts: t0 + i * 33 })
    return r
  }
  it('ekranda gezinen bakış (±5°) telefona; üstünden/yanından dışarı bakış telefona değil', () => {
    const reader = createGazeReader({ model: m })
    expect(lookingAtPhone(feed(reader, 0, 0))).toBe(true)
    expect(lookingAtPhone(feed(reader, 4, -3, 20, 1000))).toBe(true) // ekranın sağ alt köşesi
    expect(lookingAtPhone(feed(reader, 0, 12, 20, 2000))).toBe(false) // telefonun üstünden uzağa
    expect(lookingAtPhone(feed(reader, -15, 0, 20, 3000))).toBe(false) // yanından uzağa
    expect(lookingAtPhone(feed(reader, 0, -12, 20, 4000))).toBe(true) // aşağı = telefon tarafı
  })
  it('bilinmiyorsa null: gözler kapalı, yüz yok, okuyucu kalibre değil', () => {
    expect(lookingAtPhone(null)).toBeNull()
    expect(lookingAtPhone({ dir: 'center', calibrated: false, tracked: true, closed: false })).toBeNull()
    expect(lookingAtPhone({ dir: null, calibrated: true, tracked: true, closed: true })).toBeNull()
    expect(lookingAtPhone({ dir: null, calibrated: true, tracked: false, closed: false })).toBeNull()
  })
})

describe('kameraya göre bakış (cam*) ve baş duruşu (head*)', () => {
  const m = fitModel(windows())
  const feed = (reader, gx, gy, opts = {}, n = 20, t0 = 0) => {
    let r
    for (let i = 0; i < n; i++) r = reader.push({ ...makeFrame(gx, gy, { noise: 0.2, r: rng(i + t0), ...opts }), ts: t0 + i * 33 })
    return r
  }
  it('model ortaya bakıştaki kameraya-göre açıyı (phone) öğrenir', () => {
    expect(m.phone).toBeTruthy()
    expect(m.phone.x).toBeCloseTo(2, 0)
    expect(m.phone.y).toBeCloseTo(-6, 0)
  })
  it('baş çevrilip uzağa bakılınca (gözler yüze göre ortada) telefona bakmıyor sayılır', () => {
    const reader = createGazeReader({ model: m })
    expect(lookingAtPhone(feed(reader, 0, 0))).toBe(true)
    expect(lookingAtPhone(feed(reader, 0, 0, { head: { x: 25, y: 0 } }, 20, 1000))).toBe(false)
    expect(lookingAtPhone(feed(reader, 0, 0, { head: { x: 0, y: 20 } }, 20, 2000))).toBe(false)
    // Baş hafif dönük ama gözler ekranda: telefon
    expect(lookingAtPhone(feed(reader, -4, 0, { head: { x: 4, y: 0 } }, 20, 3000))).toBe(true)
    // Gözle ekranın dışına: telefon değil (aşağı pencere 16° → −20 dışarıda)
    expect(lookingAtPhone(feed(reader, 0, -20, {}, 20, 4000))).toBe(false)
    expect(lookingAtPhone(feed(reader, 14, 0, {}, 20, 5000))).toBe(false)
  })
  it('cam alanı yoksa (eski eklenti) yön modeline düşer', () => {
    const reader = createGazeReader({ model: fitModel(windows({ cam: false })) }) // eski eklentiyle kalibre edilmiş
    expect(fitModel(windows({ cam: false })).x.feature).not.toMatch(/^cam/)
    expect(lookingAtPhone(feed(reader, 0, 0, { cam: false }))).toBe(true)
    expect(lookingAtPhone(feed(reader, 0, 12, { cam: false }, 20, 1000))).toBe(false)
  })
  it('modelde phone yoksa (eski model) yön modeline düşer', () => {
    const reader = createGazeReader({ model: { ...fitModel(windows({ cam: false })), phone: null } })
    expect(lookingAtPhone(feed(reader, 0, 0, { head: { x: 25, y: 0 } }))).toBe(true) // yüze göre ortada → eski davranış
  })
  it('cam varsa eksen adayı camX/camY seçilir; baş dönüşü bakışı kameraya göre okur', () => {
    expect(m.x.feature).toBe('camX')
    expect(m.y.feature).toBe('camY')
  })
  it('headRef / headTurned: orta hedef referansından HEAD_TURN_DEG üstü sapma', () => {
    const ref = headRef(Array.from({ length: 10 }, (_, i) => makeFrame(0, 0, { r: rng(i), head: { x: 3, y: -2 } })))
    expect(ref.x).toBeCloseTo(3, 0)
    expect(headTurned(ref, makeFrame(-18, 0, { noise: 0, head: { x: 3, y: -2 } }))).toBe(false)
    expect(headTurned(ref, makeFrame(0, 0, { noise: 0, head: { x: 3 - HEAD_TURN_DEG - 1, y: -2 } }))).toBe(true)
    expect(headTurned(ref, makeFrame(0, 0, { noise: 0, head: { x: 3, y: -2 + HEAD_TURN_DEG + 1 } }))).toBe(true)
    expect(headTurned(ref, makeFrame(0, 0, { noise: 0, head: { x: 3 + HEAD_TURN_DEG - 1, y: -2 } }))).toBe(false)
    expect(headTurned(null, makeFrame(0, 0))).toBe(false)
    expect(headTurned(ref, makeFrame(0, 0, { cam: false }))).toBe(false)
    expect(headRef([makeFrame(0, 0, { cam: false })])).toBeNull()
  })
  it('calibReport baş sapmasını hedef başına verir', () => {
    const w = windows()
    w.left = Array.from({ length: 30 }, (_, i) => makeFrame(-18, 0, { r: rng(i), head: { x: -7, y: 0 } }))
    const rep = calibReport(w, fitModel(w))
    expect(rep.head.left.dx).toBeCloseTo(-7, 0)
    expect(rep.head.right.dx).toBeCloseTo(0, 0)
    expect(rep.headTurnDeg).toBe(HEAD_TURN_DEG)
    expect(rep.targets.left.camX).toBeTruthy()
  })
})

describe('kalibrasyon v2.1: drift, hedef-içi gürültü, kararlı pencere (Build 15 raporu)', () => {
  // Build 15: angX orta 1,13 → orta2 0,19 (kayma 0,94°), sol 1,75, sağ −0,30; camX orta −1,04, orta2 −0,78, sol 0,34, sağ −2,08
  const S = (med, mad = 0.05) => ({ med, mad, n: 39 })
  it('orta→orta2 kayması birleşik MAD gibi sayılmaz; drift raporlanır', () => {
    const a = fitAxis({ angX: S(1.1348, 0.0386) }, { angX: S(1.7545, 0.0395) }, { angX: S(-0.2987, 0.0597) }, ['angX'], { angX: S(0.1917, 0.0198) })
    expect(a.drift).toBeCloseTo(0.943, 2)
    expect(a.c).toBeCloseTo(0.663, 2)
    expect(a.score).toBeCloseTo(0.962 / 0.4715, 1) // sep / (drift/2)
    const cam = fitAxis({ camX: S(-1.0427, 0.0892) }, { camX: S(0.3431, 0.0623) }, { camX: S(-2.0846, 0.1217) }, ['camX'], { camX: S(-0.7824, 0.0321) })
    expect(cam.weak).toBeUndefined()
    expect(cam.score).toBeGreaterThan(MIN_SCORE)
    expect(cam.score).toBeCloseTo(1.17 / 0.25, 0)
  })
  it('gerçek pencerelerde model camX/camY ile ok; baş 1° kayınca da', () => {
    const w = windows()
    w.center2 = Array.from({ length: 30 }, (_, i) => makeFrame(0, 0, { r: rng(90 + i), head: { x: 1.1, y: 2.3 } }))
    const m = fitModel(w)
    expect(m.ok).toBe(true)
    expect(m.x.drift).toBeLessThan(0.5)
  })
  it('windowStable: sabit bakış kararlı, gezinen bakış değil, az kare değil', () => {
    const r = rng(3)
    const still = Array.from({ length: 20 }, () => makeFrame(0, 0, { noise: 0.2, r }))
    expect(windowStable(still)).toBe(true)
    const roam = Array.from({ length: 20 }, (_, i) => makeFrame(i % 2 ? -3 : 3, 0, { noise: 0.2, r }))
    expect(windowStable(roam)).toBe(false)
    expect(windowStable(still.slice(0, 3))).toBe(false)
    expect(windowStable([])).toBe(false)
  })
})
