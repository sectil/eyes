import { describe, it, expect } from 'vitest'
import { gazeVector, gazeDirection, eyeClosure, createBlinkCounter, createHoldTimer, createCircleTracker, quadrantOf, focusZone, focusDistance, createNearFarCounter } from './gaze.js'

const look = (o) => ({ lookUpLeft: 0, lookUpRight: 0, lookDownLeft: 0, lookDownRight: 0, lookInLeft: 0, lookInRight: 0, lookOutLeft: 0, lookOutRight: 0, ...o })
const RIGHT = look({ lookInLeft: 0.7, lookOutRight: 0.7 })
const LEFT = look({ lookOutLeft: 0.7, lookInRight: 0.7 })
const UP = look({ lookUpLeft: 0.6, lookUpRight: 0.6 })
const DOWN = look({ lookDownLeft: 0.6, lookDownRight: 0.6 })

describe('gazeVector / gazeDirection', () => {
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
    const seq = [0, 0.9, 0.9, 0.1, 0, 0.8, 0.1]
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
  it('eyeClosure iki gözün ortalaması', () => {
    expect(eyeClosure({ blinkLeft: 1, blinkRight: 0.5 })).toBe(0.75)
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
