import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  gazeVector,
  gazeDirection,
  eyeClosure,
  eyeAngles,
  createBlinkCounter,
  blinkThresholds,
  createHoldTimer,
  createCircleTracker,
  createGazeReader,
  quadrantOf,
  focusZone,
  focusDistance,
  createNearFarCounter,
  NEAR_MM,
  FAR_MM,
  BLINK_CLOSE,
  CIRCLE_MIN_DEG,
  GAZE_FLIP_KEY,
} from './gaze.js'

// look(): KİŞİNİN bakış yönüyle yazılır (Apple adlandırması: sağa bakış = lookInLeft + lookOutRight) ve cihazın
// gerçekte verdiği ham değere çevrilir. Cihazda ölçüldü (Bug 10, Build 15/16/30): ham değerler aynalı → In ↔ Out.
const MIRROR = { lookInLeft: 'lookOutLeft', lookOutLeft: 'lookInLeft', lookInRight: 'lookOutRight', lookOutRight: 'lookInRight' }
const look = (o) => {
  const raw = { lookUpLeft: 0, lookUpRight: 0, lookDownLeft: 0, lookDownRight: 0, lookInLeft: 0, lookInRight: 0, lookOutLeft: 0, lookOutRight: 0 }
  for (const [k, v] of Object.entries(o)) raw[MIRROR[k] ?? k] = v
  return raw
}
const RIGHT = look({ lookInLeft: 0.7, lookOutRight: 0.7 })
const LEFT = look({ lookOutLeft: 0.7, lookInRight: 0.7 })
const UP = look({ lookUpLeft: 0.6, lookUpRight: 0.6 })
const DOWN = look({ lookDownLeft: 0.6, lookDownRight: 0.6 })

describe('gazeVector / gazeDirection', () => {
  it('cihaz verisi: ekranın soluna bakışta ham (lookInLeft + lookOutRight) büyük → sol (Build 30: blendX +0,026)', () => {
    const raw = { lookInLeft: 0.3, lookOutRight: 0.3, lookOutLeft: 0.05, lookInRight: 0.05 }
    expect(gazeVector(raw).x).toBeLessThan(0)
  })
  it('sağ gözün dışa, sol gözün içe bakması → sağ', () => {
    expect(gazeDirection(gazeVector(RIGHT))).toBe('right')
    expect(gazeDirection(gazeVector(LEFT))).toBe('left')
    expect(gazeDirection(gazeVector(UP))).toBe('up')
    expect(gazeDirection(gazeVector(DOWN))).toBe('down')
  })
  it('zayıf sinyal → merkez', () => {
    expect(gazeDirection(gazeVector(look({ lookInLeft: 0.2, lookOutRight: 0.2 })))).toBe('center')
  })
  it('baskın eksen kazanır', () => {
    expect(gazeDirection({ x: 0.5, y: 0.4 })).toBe('right')
    expect(gazeDirection({ x: 0.3, y: -0.6 })).toBe('down')
  })
})

describe('createBlinkCounter', () => {
  it('kapanıp açılan her göz bir kırpma', () => {
    const c = createBlinkCounter()
    const seq = [0, 0.9, 0.9, 0.1, 0, 0, 0, 0.8, 0.1]
    seq.forEach((v, i) => c.push(v, i * 100))
    expect(c.count).toBe(2)
  })
  it('histerezis: eşik çevresindeki titreme sayılmaz', () => {
    const c = createBlinkCounter()
    ;[0.55, 0.45, 0.55, 0.45, 0.55].forEach((v, i) => c.push(v, i * 100))
    expect(c.count).toBe(0)
  })
  it('çok kısa kapanma (gürültü) sayılmaz', () => {
    const c = createBlinkCounter({ minClosedMs: 80 })
    c.push(0.9, 0)
    c.push(0.1, 30)
    expect(c.count).toBe(0)
  })
  it('refrakter: açıldıktan hemen sonra yeniden kapanma aynı kırpmadır (çift sayım yok)', () => {
    const c = createBlinkCounter()
    c.push(0.9, 0)
    c.push(0.1, 150) // sayıldı
    c.push(0.9, 300) // 150 ms sonra yeniden kapandı → devam
    c.push(0.1, 450)
    expect(c.count).toBe(1)
  })
  it('refrakter süresi geçince yeni kırpma sayılır', () => {
    const c = createBlinkCounter()
    c.push(0.9, 0)
    c.push(0.1, 150)
    c.push(0.9, 600)
    c.push(0.1, 750)
    expect(c.count).toBe(2)
  })
  it('sıkarken dalgalanma (açılma eşiğine inmeden) tek kırpma', () => {
    const c = createBlinkCounter()
    ;[0.9, 0.4, 0.95, 0.35, 0.9, 0.1].forEach((v, i) => c.push(v, i * 200))
    expect(c.count).toBe(1)
  })
  it('yarım kapanma (doruk < 0,6) sayılmaz', () => {
    const c = createBlinkCounter()
    ;[0.55, 0.58, 0.55, 0.1].forEach((v, i) => c.push(v, i * 100))
    expect(c.count).toBe(0)
  })
  it('uzun kapanma bir kez sayılır', () => {
    const c = createBlinkCounter()
    for (let t = 0; t <= 2000; t += 66) c.push(0.9, t)
    c.push(0.05, 2100)
    expect(c.count).toBe(1)
  })
  it('geçersiz değerleri yok sayar', () => {
    const c = createBlinkCounter()
    c.push(0.9, 0)
    c.push(undefined, 100)
    c.push(NaN, 150)
    c.push(0.1, 200)
    expect(c.count).toBe(1)
  })
  it('eyeClosure iki gözün ortalaması', () => {
    expect(eyeClosure({ blinkLeft: 1, blinkRight: 0.5 })).toBe(0.75)
  })
})

describe('blinkThresholds', () => {
  it('temel değer yoksa varsayılan eşikler', () => {
    expect(blinkThresholds(null)).toEqual({ closeAt: 0.5, openAt: 0.25, minPeak: 0.6 })
    expect(blinkThresholds(NaN).closeAt).toBe(BLINK_CLOSE)
  })
  it('açık gözde değer yüksekse eşikler yukarı kayar', () => {
    const t = blinkThresholds(0.3)
    expect(t.closeAt).toBeCloseTo(0.6, 6)
    expect(t.openAt).toBeCloseTo(0.42, 6)
    expect(t.minPeak).toBeCloseTo(0.7, 6)
  })
  it('kişiye göre eşikle, açık gözü 0,3 olan kişinin kırpması sayılır', () => {
    const seq = [0.3, 0.3, 0.9, 0.9, 0.3, 0.3]
    const fixed = createBlinkCounter()
    const tuned = createBlinkCounter(blinkThresholds(0.3))
    seq.forEach((v, i) => {
      fixed.push(v, i * 100)
      tuned.push(v, i * 100)
    })
    expect(fixed.count).toBe(0) // sabit eşik 0,25'e hiç inmiyor
    expect(tuned.count).toBe(1)
  })
})

describe('createBlinkCounter.retune', () => {
  it('sabit eşikte "kapalı"da takılı kalan kırpma, taban öğrenilince sayılır; sonrakiler de sayılır', () => {
    const c = createBlinkCounter()
    ;[0.3, 0.3, 0.9, 0.9, 0.3, 0.3].forEach((v, i) => c.push(v, i * 100))
    expect(c.count).toBe(0)
    expect(c.closed).toBe(true) // açık göze rağmen: sabit açılma eşiği 0,25
    c.retune(blinkThresholds(0.3))
    c.push(0.3, 600)
    expect(c.closed).toBe(false)
    expect(c.count).toBe(1)
    ;[0.9, 0.9, 0.3, 0.3].forEach((v, i) => c.push(v, 1200 + i * 100))
    expect(c.count).toBe(2)
  })
  it('sayım ve refrakter korunur (yeniden kurulumda çift sayım yok)', () => {
    const c = createBlinkCounter()
    c.push(0.9, 0)
    c.push(0.1, 150) // sayıldı
    c.retune(blinkThresholds(0.1))
    expect(c.count).toBe(1)
    c.push(0.9, 300) // refrakter içinde → aynı kırpmanın devamı
    c.push(0.1, 450)
    expect(c.count).toBe(1)
  })
  it('geçersiz eşikler yok sayılır', () => {
    const c = createBlinkCounter()
    c.retune({ closeAt: NaN, openAt: undefined, minPeak: 'x' })
    ;[0, 0.9, 0.9, 0.1].forEach((v, i) => c.push(v, i * 100))
    expect(c.count).toBe(1)
    ;[0.55, 0.58, 0.1].forEach((v, i) => c.push(v, 1000 + i * 100)) // doruk hâlâ 0,6
    expect(c.count).toBe(1)
  })
})

describe('createHoldTimer', () => {
  it('yalnızca koşul doğruyken süre birikir', () => {
    const t = createHoldTimer()
    t.push(true, 0)
    t.push(true, 100)
    t.push(false, 200)
    t.push(true, 300)
    expect(t.heldMs).toBe(200)
  })
  it('takip kesintisi süreyi sıçratmaz', () => {
    const t = createHoldTimer({ maxGapMs: 250 })
    t.push(true, 0)
    t.push(true, 5000)
    expect(t.heldMs).toBe(250)
  })
})

describe('createCircleTracker', () => {
  const V = { right: { x: 0.5, y: 0 }, up: { x: 0, y: 0.5 }, left: { x: -0.5, y: 0 }, down: { x: 0, y: -0.5 } }
  it('bölge tespiti', () => {
    expect(quadrantOf(V.up)).toBe('up')
    expect(quadrantOf({ x: 0.05, y: 0.05 })).toBeNull()
  })
  it('saat yönü: yukarı → sağ → aşağı → sol → yukarı = 1 tur', () => {
    const c = createCircleTracker('cw')
    ;['up', 'right', 'down', 'left', 'up'].forEach((q) => c.push(V[q]))
    expect(c.state.laps).toBe(1)
    expect(c.state.wrongWay).toBe(false)
  })
  it('ters yönde dönmek tur saymaz ve uyarır', () => {
    const c = createCircleTracker('cw')
    ;['up', 'left', 'down', 'right', 'up'].forEach((q) => c.push(V[q]))
    expect(c.state.laps).toBe(0)
    expect(c.state.wrongWay).toBe(true)
  })
  it('saat yönünün tersi (ccw) doğru sayılır', () => {
    const c = createCircleTracker('ccw')
    ;['up', 'left', 'down', 'right', 'up', 'left', 'down', 'right', 'up'].forEach((q) => c.push(V[q]))
    expect(c.state.laps).toBe(2)
  })
  it('derece ölçeği: min seçeneği', () => {
    const D = { right: { x: 12, y: 0 }, up: { x: 0, y: 12 }, left: { x: -12, y: 0 }, down: { x: 0, y: -12 } }
    const c = createCircleTracker('cw', { min: CIRCLE_MIN_DEG })
    ;['up', { x: 2, y: 2 }, 'right', 'down', 'left', 'up'].forEach((q) => c.push(typeof q === 'string' ? D[q] : q))
    expect(c.state.laps).toBe(1)
    expect(quadrantOf({ x: 3, y: 3 }, CIRCLE_MIN_DEG)).toBeNull()
  })
})

// --- createGazeReader ---------------------------------------------------------------
// Sentetik kare: x/y = kişinin bakış açısı (derece; x > 0 kişinin sağı), blend = blendshape değerleri.
// Ham göz açısı cihazda aynalı (Bug 10: sol hedefte gazeLeftX +0,9, sağda −0,6) → ham x = −x.
const frame = ({ x = null, y = null, blend = {}, closed = false, tracked = true, ts }) => ({
  tracked,
  face: tracked,
  gazeLeftX: x == null ? null : -x,
  gazeRightX: x == null ? null : -x,
  gazeLeftY: y,
  gazeRightY: y,
  blinkLeft: closed ? 0.9 : 0.05,
  blinkRight: closed ? 0.9 : 0.05,
  ...look({}),
  ...blend,
  ts,
})

// ~15 Hz kare akışı
function feeder(reader, dt = 66) {
  let t = 0
  return (o, n = 3) => {
    let r
    for (let i = 0; i < n; i++) {
      r = reader.push(frame({ ...o, ts: t }))
      t += dt
    }
    return r
  }
}

const memStorage = () => {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}

describe('eyeAngles', () => {
  it('iki gözün ortalaması; tek göz varsa o; yoksa null', () => {
    expect(eyeAngles({ gazeLeftX: 10, gazeRightX: 6, gazeLeftY: -2, gazeRightY: 0 })).toEqual({ x: 8, y: -1 })
    expect(eyeAngles({ gazeLeftX: null, gazeRightX: 6, gazeLeftY: null, gazeRightY: 3 })).toEqual({ x: 6, y: 3 })
    expect(eyeAngles({ gazeLeftX: null, gazeRightX: null })).toBeNull()
    expect(eyeAngles({})).toBeNull()
  })
})

describe('createGazeReader', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('nötr: ilk ~0,8 sn açık gözün ortancası; bakış nötre göre ölçülür', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    expect(feed({ x: 3, y: -4 }, 1).calibrated).toBe(false)
    const cal = feed({ x: 3, y: -4 }, 15)
    expect(cal.calibrated).toBe(true)
    expect(cal.dir).toBe('center')
    expect(r.neutral).toMatchObject({ x: 3, y: -4, source: 'angle' })
    const res = feed({ x: 15, y: -4 })
    expect(res.dir).toBe('right')
    expect(res.v.x).toBeCloseTo(12, 6)
    expect(res.v.y).toBeCloseTo(0, 6)
  })

  it('kapalı gözlü kareler nötre katılmaz', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 20, y: 20, closed: true }, 10)
    feed({ x: 1, y: 1 }, 15)
    expect(r.neutral).toMatchObject({ x: 1, y: 1 })
  })

  it('4 yön ve merkez', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: 12, y: 0 }).dir).toBe('right')
    expect(feed({ x: 0, y: 0 }).dir).toBe('center')
    expect(feed({ x: -12, y: 0 }).dir).toBe('left')
    expect(feed({ x: 0, y: 12 }).dir).toBe('up')
    expect(feed({ x: 0, y: -12 }).dir).toBe('down')
    expect(feed({ x: 3, y: 2 }).dir).toBe('center')
  })

  it('histerezis: girmek 8°, çıkmak 5°', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: -7, y: 0 }).dir).toBe('center')
    expect(feed({ x: -9, y: 0 }).dir).toBe('left')
    expect(feed({ x: -6, y: 0 }).dir).toBe('left') // çıkış eşiğinin üstünde → yön korunur
    expect(feed({ x: -4, y: 0 }).dir).toBe('center')
    expect(feed({ x: -7, y: 0 }).dir).toBe('center') // yeniden girmek için 8° gerekir
  })

  it('baskın eksen kazanır; başka yöne güçlü geçiş histerezisi aşar', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: 9, y: 12 }).dir).toBe('up')
    expect(feed({ x: -12, y: 9 }).dir).toBe('left')
    expect(feed({ x: -6, y: 11 }).dir).toBe('up')
  })

  it('tek karelik sıçrama yönü değiştirmez', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: 25, y: 0 }, 1).dir).toBe('center')
    expect(feed({ x: 0, y: 0 }, 1).dir).toBe('center')
  })

  it('gözler kapalıyken yön yok, closed=true', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    feed({ x: -12, y: 0 })
    const res = feed({ x: -12, y: 0, closed: true }, 1)
    expect(res).toMatchObject({ dir: null, closed: true, tracked: true })
  })

  it('yüz görünmüyorsa yön yok, tracked=false', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    const res = feed({ tracked: false }, 1)
    expect(res).toMatchObject({ dir: null, tracked: false, closed: false })
    expect(r.push({ tracked: false, ts: 5000 }).dir).toBeNull() // native "tracked:false" olayı
  })

  it('recenter: küçük kayma düzeltilir, hedefe sabit bakış nötr sayılmaz', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    r.recenter()
    feed({ x: 2, y: 1 }, 15)
    expect(r.neutral).toMatchObject({ x: 2, y: 1 })
    r.recenter()
    const res = feed({ x: -15, y: 1 }, 15)
    expect(r.neutral).toMatchObject({ x: 2, y: 1 })
    expect(res.dir).toBe('left')
  })

  it('kararsız pencere (göz gezinirken) nötr olmaz', () => {
    const r = createGazeReader({ persistKey: null })
    let t = 0
    let res
    for (let i = 0; i < 30; i++) {
      res = r.push(frame({ x: -10 + (i % 15) * 1.5, y: 0, ts: t }))
      t += 66
    }
    expect(res.calibrated).toBe(false)
    for (let i = 0; i < 15; i++) {
      res = r.push(frame({ x: 1, y: 0, ts: t }))
      t += 66
    }
    expect(res.calibrated).toBe(true)
    expect(r.neutral).toMatchObject({ x: 1, y: 0 })
  })

  it('işaret doğrulama: açı blendshape ile sürekli ters → X çevrilir ve hatırlanır', () => {
    const store = memStorage()
    vi.stubGlobal('localStorage', store)
    const r = createGazeReader()
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(r.flipX).toBe(1)
    // Açı "sağ" diyor, blendshape'ler "sol" → 15 güçlü örnekten sonra çevrilir
    const res = feed({ x: 12, y: 0, blend: LEFT }, 20)
    expect(r.flipX).toBe(-1)
    expect(res.dir).toBe('left')
    expect(store.getItem(GAZE_FLIP_KEY)).toBe('1')
    // Yeni okuyucu kaydı hatırlar
    const r2 = createGazeReader()
    expect(r2.flipX).toBe(-1)
    const feed2 = feeder(r2)
    feed2({ x: 0, y: 0 }, 15)
    expect(feed2({ x: 12, y: 0 }).dir).toBe('left')
  })

  it('işaret doğrulama: tutarlı örnekler çevirmez; zayıf örnekler sayılmaz', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: 12, y: 0, blend: RIGHT }, 30).dir).toBe('right')
    // zayıf blendshape (|0,2| < 0,25) ters olsa da karar vermez
    feed({ x: 12, y: 0, blend: look({ lookOutLeft: 0.2, lookInRight: 0.2 }) }, 30)
    expect(r.flipX).toBe(1)
  })

  it('depolama erişilemezse varsayılan işaret, hata yok', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    })
    const r = createGazeReader()
    expect(r.flipX).toBe(1)
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(() => feed({ x: 12, y: 0, blend: LEFT }, 20)).not.toThrow()
    expect(r.flipX).toBe(-1)
  })

  it('Bug 10: kalibrasyonsuz yol cihaz işaretini doğru çevirir (ham açı + ve ham In-Left/Out-Right = kişinin solu)', () => {
    const r = createGazeReader({ persistKey: null })
    let t = 0
    const push = (ax, bl, n) => {
      let o
      for (let i = 0; i < n; i++) o = r.push({ tracked: true, face: true, gazeLeftX: ax, gazeRightX: ax, gazeLeftY: -8, gazeRightY: -8, blinkLeft: 0.05, blinkRight: 0.05, ...bl, ts: (t += 66) })
      return o
    }
    const raw = (inL, outL) => ({ lookInLeft: inL, lookOutRight: inL, lookOutLeft: outL, lookInRight: outL, lookUpLeft: 0, lookUpRight: 0, lookDownLeft: 0, lookDownRight: 0 })
    push(0, raw(0.05, 0.05), 15) // nötr
    const left = push(12, raw(0.6, 0.05), 20) // cihaz: sola bakış (Build 30 sol hedef: angX +0,9, blendX +0,026)
    expect(left.dir).toBe('left')
    expect(r.flipX).toBe(1) // açı ve blend tutarlı → çevirme yok
    push(0, raw(0.05, 0.05), 6)
    expect(push(-12, raw(0.05, 0.6), 20).dir).toBe('right')
  })

  it('flipX seçeneği kaydı ezer', () => {
    const r = createGazeReader({ flipX: -1, persistKey: null })
    const feed = feeder(r)
    feed({ x: 0, y: 0 }, 15)
    expect(feed({ x: 12, y: 0 }).dir).toBe('left')
  })

  it('açı yoksa blendshape yoluna düşer: 4 yön', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    const cal = feed({}, 15)
    expect(cal.calibrated).toBe(true)
    expect(r.neutral.source).toBe('blend')
    expect(feed({ blend: RIGHT }).dir).toBe('right')
    expect(feed({ blend: LEFT }).dir).toBe('left')
    expect(feed({ blend: UP }).dir).toBe('up')
    expect(feed({ blend: DOWN }).dir).toBe('down')
    expect(feed({}).dir).toBe('center')
  })

  it('blendshape yolu: her yön kendi ölçeğiyle (zayıf taraf da algılanır)', () => {
    const r = createGazeReader({ persistKey: null })
    const feed = feeder(r)
    feed({}, 15)
    feed({ blend: look({ lookInLeft: 0.9, lookOutRight: 0.9 }) }) // sağa güçlü → sağ ölçeği 0,9
    feed({})
    // Aynı büyüklükte (0,3) sapma: sağda ölçeğe göre küçük, solda (henüz taban 0,6) yeterli
    const weakRight = feed({ blend: look({ lookInLeft: 0.3, lookOutRight: 0.3 }) })
    expect(weakRight.dir).toBe('center')
    feed({})
    const weakLeft = feed({ blend: look({ lookOutLeft: 0.3, lookInRight: 0.3 }) })
    expect(weakLeft.dir).toBe('left')
    expect(weakLeft.v.x).toBeCloseTo(-10, 6)
  })
})

describe('focusZone / focusDistance', () => {
  it('konverjans yakın → near', () => {
    expect(focusZone({ vergenceMm: 200, focusMm: 250 })).toBe('near')
  })
  it('paralel bakış (vergence null) → far', () => {
    expect(focusZone({ vergenceMm: null, focusMm: 1500 })).toBe('far')
    expect(focusZone({ vergenceMm: null, focusMm: 0 })).toBe('far')
  })
  it('arada → mid; veri yok → null', () => {
    expect(focusZone({ vergenceMm: 450, focusMm: 500 })).toBe('mid')
    expect(focusZone({ vergenceMm: 0, focusMm: 0 })).toBeNull()
  })
  it('iki kaynaktan küçük olan', () => {
    expect(focusDistance({ vergenceMm: 900, focusMm: 250 })).toBe(250)
  })
  it('eşikler dışa açık', () => {
    expect(NEAR_MM).toBeLessThan(FAR_MM)
  })
})

describe('createNearFarCounter', () => {
  it('yakın ↔ uzak geçişleri sayar, kısa titremeleri saymaz', () => {
    const c = createNearFarCounter({ minHoldMs: 700 })
    const seq = [['near', 0], ['near', 800], ['far', 900], ['near', 1000], ['far', 1100], ['far', 1900], ['near', 2000], ['near', 2800]]
    let st
    for (const [z, t] of seq) st = c.push(z, t)
    expect(st.switches).toBe(2)
    expect(st.zone).toBe('near')
  })
  it('mid bölgesi yok sayılır', () => {
    const c = createNearFarCounter()
    c.push('near', 0)
    c.push('mid', 500)
    c.push('near', 800)
    expect(c.state.zone).toBe('near')
  })
})
