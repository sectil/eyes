import { describe, it, expect, afterEach, vi } from 'vitest'
import { windowStable, usableCenters, fitModel, fitAxis, axisFrom, fitWindowsAxis, postureFit, roughModel, MIN_SCORE_ROUGH, summarize, normAxis, applyModel, createOneEuro, MIN_SCORE, calibReport, closeThreshold, loadGazeModel, saveGazeModel, clearGazeModel, GAZE_MODEL_KEY, GAZE_MODEL_VERSION, DOWN_CLOSE_MAX, headRef, headTurned, HEAD_TURN_DEG, twoPointAxis, axisCenterKey, geomCheck, PT_PER_MM, FEATURES } from './gazeCalib.js'
import { createGazeReader, lookingAtPhone, GAZE_FULL_DEG } from './gaze.js'
import { offScreen } from './track.js'

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
  // Çemberler "Ekrana bak"ta takılma (sahibi, 2026-09-28 22:46): tur içinde baş dönünce göz ters yöne döner; ortaya bakış
  // göz açısında kenarın 1,4 katı okunur (kameraya göre bakış aynı kalır) → duraklama; eski sınırla (0,35) yeniden
  // ortalama reddedilir, kişi ekrana baksa da çıkamaz. Kamerasız model (model.phone yok) → telefon penceresi denetimi yok.
  const mEye = fitModel(windows({ signX: -1, cam: false }))
  const feedEye = (reader, gx, gy, n, t0 = 0, extra = {}) => {
    let r
    for (let i = 0; i < n; i++) r = reader.push({ ...makeFrame(gx, gy, { signX: -1, noise: 0.2, r: rng(i + t0), cam: false }), ...extra, ts: t0 + i * 33 })
    return r
  }
  const drift = -21 // kalibrasyon kenarı ±15 → 1,4 kat (duraklatan eşik 1,3)
  it('duraklamada ortadaki hedef: recenter({maxFrac:2}) kaymayı kabul eder, ortaya bakış "içeride" olur', () => {
    const stuck = createGazeReader({ model: mEye })
    stuck.recenter()
    expect(offScreen(feedEye(stuck, drift, 0, 150))).toBe(true) // 4 deneme × 0,8 sn biter, hâlâ dışarı
    expect(stuck.recentering).toMatchObject({ active: false, result: 'failed' })
    const reader = createGazeReader({ model: mEye })
    reader.recenter({ maxFrac: 2 })
    const mid = feedEye(reader, drift, 0, 10)
    expect(reader.recentering.active).toBe(true)
    expect(reader.recentering.progress).toBeGreaterThan(0)
    expect(reader.recentering.progress).toBeLessThan(1)
    expect(offScreen(mid)).toBe(true) // kabul edilene dek hâlâ dışarı
    const after = feedEye(reader, drift, 0, 40, 330)
    expect(reader.recentering).toMatchObject({ active: false, result: 'ok' })
    expect(offScreen(after)).toBe(false)
    expect(Math.abs(after.v.x)).toBeLessThan(5)
  })
  it('kurtarma: odak uzaksa (telefonun üstünden odaya bakıyor) ortalanmaz', () => {
    const reader = createGazeReader({ model: mEye })
    reader.recenter({ maxFrac: 2 })
    feedEye(reader, drift, 0, 80, 0, { vergenceMm: null })
    expect(reader.shift.x).toBe(0)
    expect(reader.recentering.progress).toBe(0)
  })
  it('kurtarma: kameraya göre bakış telefon penceresinin dışındaysa (yukarı bakış) ortalanmaz', () => {
    const reader = createGazeReader({ model: m }) // kameralı model: model.phone var
    expect(m.phone).toBeTruthy()
    reader.recenter({ maxFrac: 2 })
    const r = feed(reader, 0, 20, 80) // yukarı 20° (aralığın 1,67 katı): dışarı, ama sınırın (2) içinde
    expect(reader.shift.y).toBe(0)
    expect(offScreen(r)).toBe(true)
  })
  it('stopRecenter: oyun sürerken bir hedefe sabit bakış merkez sanılmaz', () => {
    const reader = createGazeReader({ model: mEye })
    reader.recenter({ maxFrac: 2 })
    feedEye(reader, 0, 0, 5)
    reader.stopRecenter()
    expect(reader.recentering.active).toBe(false)
    feedEye(reader, -11, 0, 40, 200) // bir çember düğümüne 1,3 sn sabit bakış
    expect(reader.shift.x).toBe(0)
  })
  // Cihazdaki olası durum: göz açısı ekseni + kalibrasyondaki telefon penceresi. Baş dönünce göz açısı kayar, kameraya
  // göre bakış (telefon) yerinde kalır. Aralıklı kötü kareler (odak "uzak" okuması, tek karelik kamera sıçraması)
  // kurtarmayı engellememeli (inceleme: tek kötü kare pencereyi baştan başlatıyordu).
  it('kurtarma: göz açısı + telefon penceresi, aralıklı kötü karelerle de 3 sn içinde tamamlanır', () => {
    const mEP = { ...mEye, phone: { x: 2, y: -6 } }
    const reader = createGazeReader({ model: mEP })
    reader.recenter({ maxFrac: 2 })
    let res
    for (let i = 0; i < 90 && reader.recentering.result !== 'ok'; i++) {
      const r = rng(i + 500)
      const camX = i % 10 === 3 ? 40 : 2 + (r() - 0.5) * 0.4 // her 10 karede bir kamera sıçraması
      const f = { ...makeFrame(drift, 0, { signX: -1, noise: 0.2, r, cam: false }), camLeftX: camX, camRightX: camX, camLeftY: -6, camRightY: -6 }
      if (i % 10 === 7) f.vergenceMm = null // her 10 karede bir "odak uzak" okuması (pencere varken dikkate alınmaz)
      res = reader.push({ ...f, ts: i * 33 })
    }
    expect(reader.recentering.result).toBe('ok')
    // kabul karesi eski merkezle hesaplanır; sonraki kare yeni merkeze göre (süzgeç sıfırlandı)
    for (let i = 0; i < 2; i++) res = reader.push({ ...makeFrame(drift, 0, { signX: -1, noise: 0.2, r: rng(900 + i), cam: false }), camLeftX: 2, camRightX: 2, camLeftY: -6, camRightY: -6, ts: 4000 + i * 33 })
    expect(offScreen(res)).toBe(false)
  })
  it('kurtarma: kameraya göre bakış sürekli telefon dışında → ortalanmaz, neden "window"', () => {
    const mEP = { ...mEye, phone: { x: 2, y: -6 } }
    const reader = createGazeReader({ model: mEP })
    reader.recenter({ maxFrac: 2 })
    for (let i = 0; i < 60; i++) reader.push({ ...makeFrame(drift, 0, { signX: -1, noise: 0.2, r: rng(i), cam: false }), camLeftX: 30, camRightX: 30, camLeftY: -6, camRightY: -6, ts: i * 33 })
    expect(reader.shift.x).toBe(0)
    expect(reader.recentering.why).toBe('window')
  })
  it('kararsız bakış (gezinme) kurtarmada ortalanmaz', () => {
    const reader = createGazeReader({ model: mEye })
    reader.recenter({ maxFrac: 2 })
    let r
    for (let i = 0; i < 60; i++) r = reader.push({ ...makeFrame(-21 + (i % 10) * 4, 0, { signX: -1, noise: 0.2, r: rng(i), cam: false }), ts: i * 33 })
    expect(r.tracked).toBe(true)
    expect(reader.shift.x).toBe(0)
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
    expect(Object.keys(rep.scores.x)).toEqual(['scrX', 'camX', 'headX', 'angX', 'lookX', 'blendX'])
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
    expect(cam.score).toBeCloseTo(1.17 / 0.13, 0) // gürültü = drift/2 = 0,13
  })
  it('Build 16: sol–sağ ayrım 0,38° ama hedef-içi MAD 0,03 → camX ok (taban 0,1)', () => {
    const cam = fitAxis({ camX: S(-2.6272, 0.0279) }, { camX: S(-2.1656, 0.0228) }, { camX: S(-2.9808, 0.0247) }, ['camX'], { camX: S(-2.5788, 0.0438) })
    expect(cam.weak).toBeUndefined()
    expect(cam.score).toBeCloseTo(0.378 / 0.1, 0)
    // aynı veride angX: sol = orta → ayrışmaz (weak)
    const ang = fitAxis({ angX: S(2.1297, 0.0371) }, { angX: S(2.1137, 0.0189) }, { angX: S(1.7261, 0.054) }, ['angX'], { angX: S(1.8719, 0.0257) })
    expect(ang.weak).toBe(true)
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

describe('Build 19: kararsız orta penceresi ve baş duruşu adayı', () => {
  const S = (med, mad = 0.05) => ({ med, mad, n: 39 })
  it('usableCenters: kararsız orta atılır, temiz orta2 referans olur; y ekseni geçer', () => {
    const w = windows()
    // ilk orta: baş hareketli ve kırpmalı (Build 19'daki gibi)
    w.center = Array.from({ length: 60 }, (_, i) => makeFrame((i % 4) * 3 - 4, (i % 3) * 3, { r: rng(500 + i), head: { x: (i % 5) * 1.5, y: (i % 3) * 2 } }))
    const [c1, c2] = usableCenters(w)
    expect(c2).toBeNull()
    expect(c1.camX.mad).toBeLessThan(0.3) // orta2'nin özeti
    const m = fitModel(w)
    expect(m.y.weak).toBeUndefined()
    expect(calibReport(w, m).centerStable).toEqual({ center: false, center2: true })
  })
  it('Build 19 sayıları: temiz orta2 ile y camY geçer (1,1 yerine ~9); x aynı tarafta → null (gerçekten ayrışmadı)', () => {
    const y = fitAxis({ camY: S(-0.0157, 0.1006) }, { camY: S(-2.0449, 0.1084) }, { camY: S(1.8078, 0.0452) }, ['camY'], null)
    expect(y.weak).toBeUndefined()
    expect(y.score).toBeGreaterThan(5)
    const x = fitAxis({ camX: S(-3.3375, 0.0381) }, { camX: S(-3.4214, 0.1162) }, { camX: S(-4.2967, 0.0295) }, ['camX'], null)
    expect(x).toBeNull()
  })
  it('baş duruşu aday: göz sinyali sıfırken baş noktaya döndüyse headX seçilir', () => {
    const w = windows({ cam: true })
    const still = (gx, hx) => Array.from({ length: 30 }, (_, i) => ({ ...makeFrame(0, 0, { r: rng(i + 7), head: { x: hx, y: 0 } }), gazeLeftX: 3 + (rng(i)() - 0.5) * 0.1, gazeRightX: 3 + (rng(i + 1)() - 0.5) * 0.1 }))
    w.left = still(0, -6)
    w.right = still(0, 6)
    w.center = still(0, 0)
    w.center2 = still(0, 0)
    const m = fitModel(w)
    expect(['camX', 'headX']).toContain(m.x.feature)
    expect(m.x.weak).toBeUndefined()
    expect(HEAD_TURN_DEG).toBe(15)
  })
})

describe('Build 30: ilk orta başka baş duruşunda (baş duruşu düzeltmesi)', () => {
  const S = (med, mad) => ({ med, mad, n: 39 })
  // Build 30 raporundan (ortanca, MAD): camY ~ headY; ilk orta headY 6,78, diğerleri 3,66–5,64
  const T = {
    center: { camX: S(-0.1194, 0.07), camY: S(2.7433, 0.1615), headX: S(-0.6238, 0.142), headY: S(6.7823, 0.2826) },
    left: { camX: S(0.6155, 0.0675), camY: S(1.6594, 0.0659), headX: S(-0.4969, 0.0355), headY: S(5.636, 0.0479) },
    right: { camX: S(-1.0892, 0.0334), camY: S(2.0538, 0.0416), headX: S(-0.4709, 0.0239), headY: S(5.4023, 0.0602) },
    up: { camX: S(-0.8236, 0.0732), camY: S(3.3022, 0.1095), headX: S(-0.5298, 0.0867), headY: S(3.6589, 0.0529) },
    down: { camX: S(-0.5517, 0.0447), camY: S(-0.5538, 0.1164), headX: S(-0.4362, 0.0506), headY: S(4.0071, 0.0468) },
    center2: { camX: S(-0.5295, 0.058), camY: S(1.4236, 0.0605), headX: S(-0.1504, 0.0201), headY: S(4.0698, 0.0269) },
  }
  it('eski hesap: iki orta arasındaki duruş farkı gürültü sayılır → y zayıf (1,85; rapordaki değer)', () => {
    const y = fitAxis(T.center, T.down, T.up, ['camY'], T.center2)
    expect(y.weak).toBe(true)
    expect(y.score).toBeCloseTo(1.847, 2)
  })
  it('duruş düzeltmesiyle y camY geçer; β ≈ 0,46; x camX aynı kalır', () => {
    const y = axisFrom(T, T.center, T.center2, 'y')
    expect(y.feature).toBe('camY')
    expect(y.weak).toBeUndefined()
    expect(y.score).toBeGreaterThan(8)
    expect(y.posture.beta).toBeCloseTo(0.464, 2)
    expect(y.drift).toBeLessThan(0.1) // duruşla açıklanamayan orta farkı
    // model en son ortanın duruşunda: yukarı > orta > aşağı
    expect(y.pos).toBeGreaterThan(y.c)
    expect(y.neg).toBeLessThan(y.c)
    const x = axisFrom(T, T.center, T.center2, 'x')
    expect(x.feature).toBe('camX')
    expect(x.weak).toBeUndefined()
    expect(x.posture).toBeUndefined() // baş yatayda 0,47° oynadı (< 0,8) → düzeltme yok
    expect(x.score).toBeCloseTo(3.73, 1)
  })
  it('ara kontrolde (orta2 yok) y de geçer → gereksiz tekrar turu açılmaz', () => {
    const { center2, ...mid } = T
    const y = axisFrom(mid, mid.center, null, 'y')
    expect(y.weak).toBeUndefined()
    expect(center2).toBeTruthy()
  })
  it('düzeltme ayrım uydurmaz: yukarı/aşağı duruşun öngördüğü yerdeyse eksen geçmez', () => {
    const at = (h) => 1 + 0.5 * (h - 5) // gerçek eğim 0,5
    const n = (h, mad = 0.05) => ({ camY: S(at(h), mad), headY: S(h, mad) })
    const U = { center: n(6.8), left: n(5.6), right: n(5.4), center2: n(4.1), up: n(3.7), down: n(4.0) }
    const y = axisFrom(U, U.center, U.center2, 'y', ['camY'])
    expect(y === null || y.weak === true).toBe(true)
  })
  it('baş sinyalinin kendisi düzeltilmez; eğim [0, 1] aralığına sıkışır', () => {
    const y = axisFrom(T, T.center, T.center2, 'y', ['headY'])
    expect(y?.posture).toBeUndefined()
    const neg = postureFit('camY', 'headY', [{ camY: S(3), headY: S(1) }, { camY: S(1), headY: S(3) }, { camY: S(2), headY: S(2) }])
    expect(neg.beta).toBe(0)
    const steep = postureFit('camY', 'headY', [{ camY: S(0), headY: S(0) }, { camY: S(5), headY: S(1) }, { camY: S(10), headY: S(2) }])
    expect(steep.beta).toBe(1)
    expect(postureFit('camY', 'headY', [{ camY: S(0), headY: S(0) }, { camY: S(1), headY: S(0.3) }, { camY: S(2), headY: S(0.5) }])).toBeNull() // aralık < 0,8
  })
  it('ekranın ara kontrolü ile son model aynı hesabı kullanır', () => {
    const w = windows()
    w.center = Array.from({ length: 30 }, (_, i) => makeFrame(0, 0, { r: rng(700 + i), head: { x: 0, y: 3 } }))
    const m = fitModel(w)
    expect(fitWindowsAxis(w, 'y')).toEqual(m.y)
    expect(fitWindowsAxis(w, 'x')).toEqual(m.x)
    expect(m.ok).toBe(true)
  })
})

describe('kaba model (tüm tekrarlardan sonra)', () => {
  it('iki eksen de ≥ MIN_SCORE_ROUGH ise kaydedilebilir (ok + rough); biri altındaysa null', () => {
    const m = { version: 2, ok: false, x: { feature: 'camX', score: 3.7 }, y: { feature: 'camY', score: 1.8, weak: true } }
    expect(roughModel(m)).toMatchObject({ ok: true, rough: true })
    expect(roughModel({ ...m, y: { ...m.y, score: MIN_SCORE_ROUGH - 0.01 } })).toBeNull()
    expect(roughModel({ ...m, y: null })).toBeNull()
    expect(MIN_SCORE_ROUGH).toBeLessThan(MIN_SCORE)
  })
})

describe('Build 38: yan hedefler başka duruşta (iki nokta yedeği, duruşsuz aday, eksene özel orta)', () => {
  const S = (med, mad) => ({ med, mad, n: 60 })
  const n = (camX, headX, camY, headY, lookY) => ({ camX: S(...camX), headX: S(...headX), camY: S(...camY), headY: S(...headY), lookY: S(...lookY) })
  // Build 38 raporundan (ortanca, MAD). Sağ/sol, orta/üst/alt/orta2'den ~4° farklı baş duruşunda.
  const T = {
    center: n([-1.832, 0.202], [1.119, 0.11], [-0.453, 0.135], [8.092, 0.084], [-0.181, 0.002]),
    left: n([-2.901, 0.116], [-2.868, 0.175], [-3.04, 0.247], [3.945, 0.078], [-0.151, 0.004]),
    right: n([-4.035, 0.089], [-2.834, 0.072], [-1.222, 0.099], [3.296, 0.088], [-0.113, 0.002]),
    up: n([-1.453, 0.163], [1.124, 0.059], [0.354, 0.151], [7.609, 0.054], [-0.161, 0.002]),
    down: n([-2.557, 0.107], [1.287, 0.062], [-1.859, 0.126], [8.087, 0.088], [-0.207, 0.004]),
    center2: n([-2.362, 0.115], [0.983, 0.049], [-1.087, 0.231], [7.593, 0.093], [-0.187, 0.003]),
  }
  it('x: orta yanların arasında değil ama yanlar aynı duruşta → iki nokta, camX ≈ 4,9 geçer', () => {
    const x = axisFrom(T, T.center, T.center2, 'x')
    expect(x.twoPoint).toBe(true)
    expect(x.feature).toBe('camX')
    expect(x.weak).toBeUndefined()
    expect(x.score).toBeCloseTo(4.88, 1)
    expect(x.c).toBeCloseTo((-2.901 + -4.035) / 2, 3)
    expect(normAxis(x, -2.901)).toBeCloseTo(-1, 5)
    expect(normAxis(x, -4.035)).toBeCloseTo(1, 5)
  })
  it('y: duruş düzeltmesi zayıf (camY 1,8) ama düzeltmesiz lookY 5,9 → en iyisi alınır', () => {
    const y = axisFrom(T, T.center, T.center2, 'y')
    expect(y.feature).toBe('lookY')
    expect(y.weak).toBeUndefined()
    expect(y.score).toBeGreaterThan(5.5) // raporda 5,92 (burada 3 haneye yuvarlanmış değerler)
    // camY: duruş düzeltmeli 1,76 (rapordaki), düzeltmesiz 3,4 → düzeltmesiz olan seçilir
    const onlyCam = axisFrom(T, T.center, T.center2, 'y', ['camY'])
    expect(onlyCam.posture).toBeUndefined()
    expect(onlyCam.score).toBeCloseTo(3.43, 1)
  })
  it('iki nokta, aynı duruşta ölçülmüş bir orta varsa devreye girmez (Build 19: sol = orta, ayrım yok)', () => {
    // Build 19: temiz orta2 yanlarla yatayda 1,0° farklı (dikeyde 2,2°) → kayma yok sayılır
    const B = {
      center2: { camX: S(-3.3375, 0.0381), headX: S(-5.3, 0.05), headY: S(3.0, 0.05) },
      left: { camX: S(-3.4214, 0.1162), headX: S(-6.4, 0.05), headY: S(5.6, 0.05) },
      right: { camX: S(-4.2967, 0.0295), headX: S(-6.2, 0.05), headY: S(4.7, 0.05) },
    }
    expect(twoPointAxis(B.center2, B.left, B.right, ['camX'], null, { head: 'headX' })).toBeNull()
    expect(axisFrom(B, B.center2, null, 'x', ['camX'])).toBeNull()
  })
  it('iki nokta: yanlar farklı duruştaysa ya da baş verisi yoksa kullanılmaz; baş sinyali aday değildir', () => {
    const turned = { ...T.right, headX: S(1.5, 0.07) }
    expect(twoPointAxis(T.center, T.left, turned, ['camX'], T.center2, { head: 'headX' })).toBeNull()
    expect(twoPointAxis(T.center, T.left, T.right, ['camX'], T.center2, null)).toBeNull()
    expect(twoPointAxis(T.center, T.left, T.right, ['headX'], T.center2, { head: 'headX' })).toBeNull()
  })
  it('eksene özel orta (center@x): tekrar turunda yanlar arasında toplanan orta kullanılır, üç noktalı hesap geçer', () => {
    // Genel ortalar duruş A'da; sağ/sol ve eksenin ortası duruş B'de (baş 4° kaymış)
    const A = { x: 1, y: 8 }
    const Bp = { x: -3, y: 4 }
    const mk = (gx, gy, head, seed) => Array.from({ length: 30 }, (_, i) => makeFrame(gx, gy, { r: rng(seed + i), head, noise: 0.2 }))
    const w = { center: mk(0, 0, A, 10), up: mk(0, 12, A, 20), down: mk(0, -12, A, 30), center2: mk(0, 0, A, 40), left: mk(-15, 0, Bp, 50), right: mk(15, 0, Bp, 60) }
    w[axisCenterKey('x')] = mk(0, 0, Bp, 70)
    const m = fitModel(w)
    expect(m.ok).toBe(true)
    expect(m.x.twoPoint).toBeUndefined()
    expect(m.x.weak).toBeUndefined()
    expect(fitWindowsAxis(w, 'x')).toEqual(m.x)
    const rep = calibReport(w, m)
    expect(rep.targets['center@x'].n).toBe(30)
    expect(rep.targets['center@y']).toBeUndefined()
  })
})

describe('Ekrandaki bakış noktası (scrX/scrY, mm): duruş kaymasından bağımsız', () => {
  // Hedeflerin ekrandaki konumu (mm, kamera orijinli; X kısa kenar, Y uzun kenar). ARKit kazancı 0,6 (VARSAYIM).
  const MM = { center: [0, 70], left: [-27, 70], right: [27, 70], up: [0, 20], down: [0, 125], center2: [0, 70] }
  const frames = (t, head, seed, gain = 0.6) =>
    Array.from({ length: 30 }, (_, i) => {
      const r = rng(seed + i)
      const n = () => (r() - 0.5) * 0.6
      const [x, y] = MM[t]
      // cam*: duruşla kayar (Build 38 gibi); scr*: kaymaz
      const f = makeFrame(0, 0, { r, head, noise: 0.1 })
      return { ...f, scrLX: x * gain + n(), scrRX: x * gain + n(), scrLY: y * gain + n(), scrRY: y * gain + n(), scrZ: 330 + n() }
    })
  const A = { x: 1, y: 8 }
  const B = { x: -3, y: 4 }
  const build38 = () => ({
    center: frames('center', A, 1),
    left: frames('left', B, 100),
    right: frames('right', B, 200),
    up: frames('up', A, 300),
    down: frames('down', A, 400),
    center2: frames('center2', A, 500),
  })
  it('Build 38 deseni (sağ/sol başka duruşta): model scrX/scrY ile ok, iki nokta yedeğine gerek yok', () => {
    const m = fitModel(build38())
    expect(m.ok).toBe(true)
    expect(m.x.feature).toBe('scrX')
    expect(m.y.feature).toBe('scrY')
    expect(m.x.twoPoint).toBeUndefined()
    expect(m.x.score).toBeGreaterThan(20)
  })
  it('ekran-noktası adayı eşiği geçiyorsa daha yüksek skorlu başka sinyale tercih edilir', () => {
    const S = (med, mad) => ({ med, mad })
    const c = { scrX: S(0, 0.5), camX: S(0, 0.05) }
    const a = fitAxis(c, { scrX: S(-3, 0.5), camX: S(-2, 0.05) }, { scrX: S(3, 0.5), camX: S(2, 0.05) }, ['scrX', 'camX'])
    expect(a.feature).toBe('scrX')
    expect(a.score).toBeCloseTo(6, 5)
    // ekran-noktası zayıfsa en iyi aday
    const b = fitAxis(c, { scrX: S(-0.8, 0.5), camX: S(-2, 0.05) }, { scrX: S(0.8, 0.5), camX: S(2, 0.05) }, ['scrX', 'camX'])
    expect(b.feature).toBe('camX')
  })
  it('çift göz ortalaması; tek göz varsa o kullanılır', () => {
    expect(FEATURES.scrX({ scrLX: 2, scrRX: 4 })).toBe(3)
    expect(FEATURES.scrY({ scrLY: null, scrRY: 5 })).toBe(5)
    expect(FEATURES.scrX({})).toBeNull()
  })
  it('fiziksel sağlama: ölçülen / ekrandaki mesafe oranı raporlanır', () => {
    const w = build38()
    const g = geomCheck(w, { w: 390, h: 844 })
    expect(g.x.screenMm).toBeCloseTo((0.84 * 390) / PT_PER_MM, 1)
    expect(g.x.measuredMm).toBeCloseTo(54 * 0.6, 0)
    expect(g.x.ratio).toBeGreaterThan(0.5)
    expect(g.y.measuredMm).toBeCloseTo(105 * 0.6, 0)
    expect(g.eyeZmm).toBeCloseTo(330, 0)
    expect(calibReport(w, fitModel(w), { w: 390, h: 844 }).geom.x.ratio).toBe(g.x.ratio)
    expect(geomCheck({}, null)).toEqual({ x: null, y: null, eyeZmm: null })
  })
})
