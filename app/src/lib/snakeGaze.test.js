import { describe, it, expect, beforeEach } from 'vitest'
import {
  SNAKE_GAZE_KEY,
  loadSnakeGaze,
  saveSnakeGaze,
  edgeFromRects,
  cellToUnit,
  fitSnakeGaze,
  createSnakeReader,
  createSteer,
  zoneOf,
  createCheck,
  DRIFT_MAX,
} from './snakeGaze.js'
import { GAZE_MODEL_KEY } from './gazeCalib.js'
import { GAZE_FLIP_KEY } from './gaze.js'

// Sentetik düzen (390 pt genişlik, oyun ekranı): tahta 260 pt, kapılar ekran kenarından 22 pt içeride;
// üst kapı tahtanın 30 pt üstünde, alt kapı 40 pt altında. Bakış: ekran noktası mm (FaceDistancePlugin scr*).
const PT = 6.1
const BOARD = { x: 65, y: 200, w: 260, h: 260 }
const GATES = { left: { x: 11, y: 318, w: 24, h: 24 }, right: { x: 355, y: 318, w: 24, h: 24 }, up: { x: 183, y: 158, w: 24, h: 24 }, down: { x: 183, y: 488, w: 24, h: 24 } }
const RECTS = { board: BOARD, ...GATES }
const EDGE = edgeFromRects(RECTS)
const CX = BOARD.x + BOARD.w / 2
const CY = BOARD.y + BOARD.h / 2
const mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })
const mmX = (pt) => (pt - CX) / PT
const mmY = (pt) => (CY - pt) / PT
const CAL = {
  version: 1,
  closeAt: 0.5,
  edge: EDGE,
  x: { feature: 'scrX', c: 0, neg: mmX(mid(GATES.left).x), pos: mmX(mid(GATES.right).x) },
  y: { feature: 'scrY', c: 0, neg: mmY(mid(GATES.down).y), pos: mmY(mid(GATES.up).y) },
}
const COLS = 15
const cellPt = (c, r) => ({ x: BOARD.x + ((c + 0.5) / COLS) * BOARD.w, y: BOARD.y + ((r + 0.5) / COLS) * BOARD.h })
const frame = (p, ts, n = { x: 0, y: 0 }, blink = 0.05) => {
  const x = mmX(p.x) + n.x
  const y = mmY(p.y) + n.y
  return { ts, face: true, blinkLeft: blink, blinkRight: blink, scrLX: x, scrRX: x, scrLY: y, scrRY: y }
}

let seed = 11
const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd())
// Göz titremesi ve kayması: yavaş kayan (AR(1), ~300 ms) + kare gürültüsü. VARSAYIM: cihaz ölçümü yok.
function noise(sigmaSlow, sigmaFast) {
  let sx = 0
  let sy = 0
  const a = Math.exp(-(1000 / 60) / 300)
  return () => {
    sx = a * sx + Math.sqrt(1 - a * a) * sigmaSlow * gauss()
    sy = a * sy + Math.sqrt(1 - a * a) * sigmaSlow * gauss()
    return { x: sx + sigmaFast * gauss(), y: sy + sigmaFast * gauss() }
  }
}

// points: [{ x, y, ms }] — sırayla her noktaya ms boyunca bakılır. Döner: [{ dir, at }]
function play(points, { n = () => ({ x: 0, y: 0 }) } = {}) {
  const reader = createSnakeReader(CAL)
  const steer = createSteer(EDGE)
  const fires = []
  let ts = 0
  for (const p of points)
    for (let t = 0; t < p.ms; t += 1000 / 60, ts += 1000 / 60) {
      const g = reader.push(frame(p, ts, n()))
      const o = steer.push(g.u, ts)
      if (o.fire) fires.push({ dir: o.fire, at: ts, label: p.label })
    }
  return fires
}

describe('snakeGaze: düzen', () => {
  it('kenar oranları tahtanın kapıya göre yerini verir', () => {
    expect(EDGE.right).toBeCloseTo(130 / 172, 3)
    expect(EDGE.up).toBeCloseTo(130 / 160, 3)
    expect(edgeFromRects({ board: BOARD })).toBeNull()
  })
  it('hücre konumu tahtanın içinde kalır (|u| < kenar)', () => {
    for (const [c, r] of [[0, 0], [14, 14], [7, 7], [0, 14]]) {
      const u = cellToUnit({ x: c, y: r }, COLS, COLS, EDGE)
      expect(Math.abs(u.x)).toBeLessThan(EDGE.right)
      expect(Math.abs(u.y)).toBeLessThan(Math.max(EDGE.up, EDGE.down))
    }
  })
})

describe('snakeGaze: kök neden 1 — tahtanın içine bakmak komut değil', () => {
  it('225 hücrenin hiçbirine sabit bakış komut üretmez (eski yöntem: 134)', () => {
    let cmd = 0
    for (let r = 0; r < COLS; r++) for (let c = 0; c < COLS; c++) cmd += play([{ ...cellPt(c, r), ms: 1200 }]).length
    expect(cmd).toBe(0)
  })
  it('titreşen bakışla kenardaki hücrelerde 60 sn: istenmeyen komut yok', () => {
    seed = 3
    const n = noise(1.0, 0.6)
    const edgeCells = [[0, 7], [14, 7], [7, 0], [7, 14], [1, 1], [13, 13]]
    let cmd = 0
    for (const [c, r] of edgeCells) cmd += play([{ ...cellPt(c, r), ms: 10000 }], { n }).length
    expect(cmd).toBe(0)
  })
  it('yem ile baş arasında gidip gelen bakış (sıçramalar) komut üretmez', () => {
    const pts = []
    for (let k = 0; k < 20; k++) pts.push({ ...cellPt(1, 2), ms: 400 }, { ...cellPt(13, 12), ms: 400 })
    expect(play(pts)).toEqual([])
  })
})

describe('snakeGaze: kök neden 2 — yukarı giderken baş izlemek yanal komut değil', () => {
  for (const col of [0, 2, 3, 7, 12, 14]) {
    it(`yukarı kapısı, sonra ${col}. sütunda yukarı giden başı izle → yalnız "up"`, () => {
      const pts = [{ ...mid(GATES.up), ms: 600, label: 'kapı' }]
      for (let r = 14; r >= 0; r--) pts.push({ ...cellPt(col, r), ms: 420 })
      expect(play(pts).map((f) => f.dir)).toEqual(['up'])
    })
  }
})

describe('snakeGaze: kapılar', () => {
  for (const d of ['left', 'right', 'up', 'down']) {
    it(`${d} kapısına bakış ${d} komutu verir (gecikme < 450 ms)`, () => {
      const f = play([{ x: CX, y: CY, ms: 500 }, { ...mid(GATES[d]), ms: 1200 }])
      expect(f.map((x) => x.dir)).toEqual([d])
      expect(f[0].at - 500).toBeLessThan(450)
    })
  }
  it('titreşen bakışla kapılar yine doğru okunur', () => {
    seed = 5
    const n = noise(1.0, 0.6)
    for (const d of ['left', 'right', 'up', 'down']) expect(play([{ x: CX, y: CY, ms: 600 }, { ...mid(GATES[d]), ms: 1500 }], { n }).map((x) => x.dir)).toEqual([d])
  })
  it('köşeye (çapraz) bakış komut değildir', () => {
    expect(play([{ x: mid(GATES.right).x, y: mid(GATES.up).y, ms: 1500 }])).toEqual([])
  })
  it('kapıda uzun kalmak tek komut verir; geri gelip yeniden gidince yeni komut', () => {
    const f = play([{ ...mid(GATES.right), ms: 2000 }, { x: CX, y: CY, ms: 500 }, { ...mid(GATES.right), ms: 800 }])
    expect(f.map((x) => x.dir)).toEqual(['right', 'right'])
  })
  it('komuttan hemen sonra öbür kapı: kilit süresi dolmadan komut yok, sonra gelir', () => {
    const f = play([{ ...mid(GATES.up), ms: 300 }, { ...mid(GATES.left), ms: 1000 }])
    expect(f.map((x) => x.dir)).toEqual(['up', 'left'])
    expect(f[1].at - f[0].at).toBeGreaterThanOrEqual(320)
  })
  it('kilit ortaya dönmeye bağlı değil (Bug 16): kayık merkezde de komutlar alınır', () => {
    // Bakış sürekli 0,3 birim sağa kaymış: hiç "orta" okunmasa da yönler çalışır
    const k = 0.3 * (mid(GATES.right).x - CX)
    const sh = (p) => ({ x: p.x + k, y: p.y })
    const f = play([{ ...sh({ x: CX, y: CY }), ms: 400 }, { ...sh(mid(GATES.up)), ms: 800 }, { ...sh({ x: CX, y: CY }), ms: 400 }, { ...mid(GATES.left), ms: 800 }])
    expect(f.map((x) => x.dir)).toEqual(['up', 'left'])
  })
  it('zoneOf: tahtanın içi null, kapının ötesi yön', () => {
    expect(zoneOf({ x: 0.5 * EDGE.right, y: 0 }, EDGE)).toBeNull()
    expect(zoneOf({ x: 1.1, y: 0 }, EDGE)).toBe('right')
    expect(zoneOf({ x: 0, y: -1 }, EDGE)).toBe('down')
    expect(zoneOf(null, EDGE)).toBeNull()
  })
  it('göz kapalıyken ya da yüz yokken bekleme sıfırlanır', () => {
    const reader = createSnakeReader(CAL)
    const steer = createSteer(EDGE)
    let ts = 0
    let fired = null
    for (let i = 0; i < 60; i++, ts += 1000 / 60) {
      const blink = i % 10 < 6 ? 0.05 : 0.9 // her 100 ms'de 67 ms kapalı: 260 ms hiç birikmez
      const o = steer.push(reader.push(frame(mid(GATES.right), ts, undefined, blink)).u, ts)
      if (o.fire) fired = o.fire
    }
    expect(fired).toBeNull()
  })
})

describe('snakeGaze: okuyucu kayma düzeltmesi', () => {
  it('sınırlı ve uzak gözlemi almaz', () => {
    const r = createSnakeReader(CAL)
    expect(r.nudge({ x: 2, y: 0 }, { x: 0, y: 0 })).toBe(false)
    for (let i = 0; i < 50; i++) r.nudge({ x: 0.5, y: 0 }, { x: 0, y: 0 })
    expect(r.drift.x).toBeLessThanOrEqual(DRIFT_MAX)
    expect(r.drift.x).toBeGreaterThan(0)
  })
})

describe('snakeGaze: ayar ve ayrı kayıt', () => {
  const mem = () => {
    const m = new Map()
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), keys: () => [...m.keys()], m }
  }
  const win = (p, k = 30) => Array.from({ length: k }, (_, i) => frame(p, i * 16, { x: (i % 3) * 0.05, y: (i % 2) * 0.05 }))
  const WINDOWS = { center: win({ x: CX, y: CY }), right: win(mid(GATES.right)), up: win(mid(GATES.up)), left: win(mid(GATES.left)), down: win(mid(GATES.down)), center2: win({ x: CX, y: CY }) }

  it('beş hedeften ayar kurulur ve okuyucu kapıları ±1 okur', () => {
    const r = fitSnakeGaze(WINDOWS, EDGE)
    expect(r.ok).toBe(true)
    expect(r.cal.x.feature).toBe('scrX')
    const reader = createSnakeReader(r.cal)
    let u = null
    for (let i = 0; i < 30; i++) u = reader.push(frame(mid(GATES.right), i * 16)).u
    expect(u.x).toBeCloseTo(1, 1)
  })
  it('ayrışmayan veride ayar kurulmaz', () => {
    const flat = Object.fromEntries(Object.keys(WINDOWS).map((k) => [k, win({ x: CX, y: CY })]))
    expect(fitSnakeGaze(flat, EDGE).ok).toBe(false)
  })
  it('kayıt yalnız Yılan anahtarına yazılır; sistem anahtarları bayt bayt aynı kalır', () => {
    const st = mem()
    const SYS = JSON.stringify({ version: 3, ok: true, x: { feature: 'camX' } })
    st.setItem(GAZE_MODEL_KEY, SYS)
    st.setItem(GAZE_FLIP_KEY, '1')
    const r = fitSnakeGaze(WINDOWS, EDGE)
    expect(saveSnakeGaze(r.cal, st)).toBe(true)
    expect(st.getItem(GAZE_MODEL_KEY)).toBe(SYS)
    expect(st.getItem(GAZE_FLIP_KEY)).toBe('1')
    expect(st.keys().sort()).toEqual([GAZE_FLIP_KEY, GAZE_MODEL_KEY, SNAKE_GAZE_KEY].sort())
    expect(loadSnakeGaze(st)?.x.feature).toBe('scrX')
  })
  it('bozuk ya da eski kayıt yüklenmez', () => {
    const st = mem()
    st.setItem(SNAKE_GAZE_KEY, '{"version":0}')
    expect(loadSnakeGaze(st)).toBeNull()
    st.setItem(SNAKE_GAZE_KEY, 'bozuk')
    expect(loadSnakeGaze(st)).toBeNull()
    expect(loadSnakeGaze(null)).toBeNull()
  })
})

describe('snakeGaze: kısa kontrol', () => {
  it('dört isabet geçer; süre ortancası ölçülür', () => {
    const c = createCheck()
    let ts = 0
    for (const d of ['right', 'up', 'left', 'down']) {
      c.push(null, ts)
      ts += 700
      expect(c.push(d, ts).event).toBe('hit')
    }
    expect(c.result).toMatchObject({ hits: 4, wrong: 0, pass: true, ms: 700 })
  })
  it('yanlış yön sayılır, iki yanlış geçmez; zaman aşımı ıska', () => {
    const c = createCheck({ timeoutMs: 1000 })
    c.push(null, 0)
    c.push('left', 100)
    c.push('down', 200)
    expect(c.push('right', 300).event).toBe('hit')
    expect(c.push(null, 1400).event).toBe('miss')
    expect(c.result).toMatchObject({ hits: 1, wrong: 2, misses: 1, pass: false })
  })
})

beforeEach(() => {
  seed = 11
})
