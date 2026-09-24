import { describe, it, expect } from 'vitest'
import {
  createGame,
  step,
  turn,
  headingOf,
  placeFood,
  nextRandom,
  stepMs,
  levelOf,
  pointsFor,
  wrapDelta,
  createDwell,
  createSteadyLook,
  loadBest,
  saveBest,
  loadSnakeOpts,
  saveSnakeOpts,
  bestFromSessions,
  BEST_KEY,
  OPTS_KEY,
  START_MS,
  MIN_MS,
  DWELL_MS,
  STEADY_HOLD_MS,
} from './snake.js'

// Yemi yolun dışına koyan yardımcı (hareket testleri yeme takılmasın)
const noFood = (s) => ({ ...s, food: { x: s.cols - 1, y: 0 } })
const at = (s, snake, dir = s.dir) => ({ ...s, snake, dir, queue: [] })

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}

describe('createGame', () => {
  it('ortada, sağa giden 3 hücrelik yılan; yem boş hücrede', () => {
    const g = createGame({ cols: 15, rows: 15, seed: 1 })
    expect(g.snake).toEqual([{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }])
    expect(g.dir).toBe('right')
    expect(g.alive).toBe(true)
    expect(g.score).toBe(0)
    expect(g.snake.some((p) => p.x === g.food.x && p.y === g.food.y)).toBe(false)
  })
  it('aynı seed → aynı yem (tekrarlanabilir)', () => {
    expect(createGame({ seed: 42 }).food).toEqual(createGame({ seed: 42 }).food)
  })
})

describe('hareket', () => {
  it('her adım baş bir hücre ilerler, boy aynı kalır', () => {
    const g = noFood(createGame({ seed: 3 }))
    const n = step(g)
    expect(n.snake).toEqual([{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }])
    expect(n.snake).toHaveLength(3)
    expect(n.ateThisStep).toBe(false)
    expect(n.steps).toBe(1)
  })
  it('girdi durumu değiştirilmez (saf)', () => {
    const g = noFood(createGame({ seed: 3 }))
    const copy = JSON.parse(JSON.stringify(g))
    step(turn(g, 'up'))
    expect(g).toEqual(copy)
  })
  it('dönüş: yukarı ekranda y azalır', () => {
    const g = noFood(createGame({ seed: 3 }))
    const n = step(g, 'up')
    expect(n.dir).toBe('up')
    expect(n.snake[0]).toEqual({ x: 7, y: 6 })
  })
})

describe('dönüş kuralları', () => {
  it('180° geri dönüş yok sayılır', () => {
    const g = noFood(createGame({ seed: 3 }))
    expect(turn(g, 'left')).toBe(g) // aynı nesne → reddedildi
    const n = step(g, 'left')
    expect(n.dir).toBe('right')
    expect(n.alive).toBe(true)
    expect(n.snake[0]).toEqual({ x: 8, y: 7 })
  })
  it('aynı yön isteği sıraya girmez', () => {
    const g = createGame({ seed: 3 })
    expect(turn(g, 'right')).toBe(g)
  })
  it('iki hızlı dönüş: ikincisi sonraki adıma sıraya alınır (yukarı → sol)', () => {
    let g = noFood(createGame({ seed: 3 }))
    g = turn(turn(g, 'up'), 'left')
    expect(g.queue).toEqual(['up', 'left'])
    expect(headingOf(g)).toBe('left')
    g = step(g)
    expect(g.dir).toBe('up')
    expect(g.snake[0]).toEqual({ x: 7, y: 6 })
    g = step(g)
    expect(g.dir).toBe('left')
    expect(g.snake[0]).toEqual({ x: 6, y: 6 })
    expect(g.alive).toBe(true)
  })
  it('sıradaki dönüşe göre 180° denetlenir (yukarı sonrası aşağı reddedilir)', () => {
    const g = turn(createGame({ seed: 3 }), 'up')
    expect(turn(g, 'down')).toBe(g)
  })
  it('sıra en çok 2 dönüş tutar', () => {
    const g = turn(turn(createGame({ seed: 3 }), 'up'), 'left')
    expect(turn(g, 'down')).toBe(g)
  })
  it('bitmiş oyunda dönüş yok', () => {
    const g = { ...createGame({ seed: 3 }), alive: false }
    expect(turn(g, 'up')).toBe(g)
    expect(step(g)).toBe(g)
  })
})

describe('büyüme ve puan', () => {
  it('yem yiyince bir hücre uzar, puan artar, yeni yem boş hücrede', () => {
    const g0 = createGame({ seed: 5 })
    const g = { ...g0, food: { x: 8, y: 7 } }
    const n = step(g)
    expect(n.ateThisStep).toBe(true)
    expect(n.snake).toEqual([{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }])
    expect(n.eaten).toBe(1)
    expect(n.score).toBe(1)
    expect(n.food).not.toBeNull()
    expect(n.snake.some((p) => p.x === n.food.x && p.y === n.food.y)).toBe(false)
    expect(n.seed).not.toBe(g.seed)
  })
  it('hızlandıkça yem daha çok puan verir', () => {
    expect(pointsFor(0)).toBe(1)
    expect(pointsFor(4)).toBe(1)
    expect(pointsFor(5)).toBe(2)
    const g = { ...createGame({ seed: 5 }), eaten: 5, score: 5, food: { x: 8, y: 7 } }
    expect(step(g).score).toBe(7)
  })
})

describe('çarpışma', () => {
  it('duvara çarpınca oyun biter (klasik)', () => {
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1 }), [{ x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }]))
    const n = step(g)
    expect(n.alive).toBe(false)
    expect(n.crash).toEqual({ x: 10, y: 5, kind: 'wall' })
    expect(n.snake).toEqual(g.snake) // son kare çizilebilsin
  })
  it('üst duvar', () => {
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1 }), [{ x: 3, y: 0 }, { x: 3, y: 1 }], 'up'))
    expect(step(g).crash.kind).toBe('wall')
  })
  it('kendine çarpınca oyun biter', () => {
    // Baş (5,5) sağa gidiyor; aşağı dönünce (5,6) gövde → çarpma
    const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }]
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1 }), body, 'right'))
    const n = step(g, 'down')
    expect(n.alive).toBe(false)
    expect(n.crash).toEqual({ x: 5, y: 6, kind: 'self' })
  })
  it('kuyruğun çekildiği hücreye girmek çarpma değildir', () => {
    // 2x2 halka: baş (5,5) yukarı dönünce kuyruğun (5,4) hücresine girer; kuyruk aynı adımda çekilir
    const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 4 }]
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1 }), body, 'right'))
    const n = step(g, 'up')
    expect(n.alive).toBe(true)
    expect(n.snake[0]).toEqual({ x: 5, y: 4 })
  })
  it('duvarlardan geç modu: karşı kenardan girer', () => {
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1, wrap: true }), [{ x: 9, y: 5 }, { x: 8, y: 5 }]))
    const n = step(g)
    expect(n.alive).toBe(true)
    expect(n.snake[0]).toEqual({ x: 0, y: 5 })
    const up = step(noFood(at(n, [{ x: 3, y: 0 }, { x: 3, y: 1 }], 'up')))
    expect(up.snake[0]).toEqual({ x: 3, y: 9 })
  })
  it('duvarlardan geç modunda da kendine çarpma biter', () => {
    const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }]
    const g = noFood(at(createGame({ cols: 10, rows: 10, seed: 1, wrap: true }), body))
    expect(step(g, 'down').alive).toBe(false)
  })
})

describe('yem yerleştirme', () => {
  it('çok sayıda seed için yem hiçbir zaman yılanın üstünde değil', () => {
    const snake = Array.from({ length: 20 }, (_, i) => ({ x: i % 5, y: Math.floor(i / 5) }))
    for (let seed = 0; seed < 300; seed++) {
      const { food } = placeFood(snake, 5, 5, seed)
      expect(snake.some((p) => p.x === food.x && p.y === food.y)).toBe(false)
    }
  })
  it('tek boş hücre kaldıysa oraya konur', () => {
    const snake = []
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (!(x === 3 && y === 2)) snake.push({ x, y })
    for (let seed = 0; seed < 20; seed++) expect(placeFood(snake, 5, 5, seed).food).toEqual({ x: 3, y: 2 })
  })
  it('boş hücre yoksa null', () => {
    const snake = []
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) snake.push({ x, y })
    expect(placeFood(snake, 5, 5, 1).food).toBeNull()
  })
  it('son boş hücredeki yemi yiyince tahta doldu → kazandın', () => {
    // 5x5 tahtada yılankavi yol: (4,0)…(0,0),(0,1)…(4,1),(4,2)…(0,2),(0,3)…(4,3),(4,4)…(0,4)
    const path = []
    for (let y = 0; y < 5; y++) {
      for (let i = 0; i < 5; i++) path.push({ x: y % 2 === 0 ? 4 - i : i, y })
    }
    const empty = path.pop() // (0,4) boş kalır; yem orada
    const snake = path.reverse() // baş (1,4), sola gidiyor
    const g = { ...createGame({ cols: 5, rows: 5, seed: 1 }), snake, dir: 'left', queue: [], food: empty }
    expect(g.snake[0]).toEqual({ x: 1, y: 4 })
    expect(g.snake).toHaveLength(24)
    const n = step(g)
    expect(n.won).toBe(true)
    expect(n.alive).toBe(false)
    expect(n.food).toBeNull()
  })
  it('RNG deterministik ve [0,1) aralığında', () => {
    let s = 7
    const seen = []
    for (let i = 0; i < 1000; i++) {
      const r = nextRandom(s)
      expect(r.value).toBeGreaterThanOrEqual(0)
      expect(r.value).toBeLessThan(1)
      seen.push(r.value)
      s = r.seed
    }
    expect(nextRandom(7)).toEqual(nextRandom(7))
    expect(new Set(seen).size).toBeGreaterThan(990)
  })
})

describe('hız', () => {
  it('yavaş başlar, her 5 yemde hızlanır, tabanın altına inmez', () => {
    expect(stepMs(0)).toBe(START_MS)
    expect(stepMs(4)).toBe(START_MS)
    expect(stepMs(5)).toBeLessThan(START_MS)
    expect(stepMs(10)).toBeLessThan(stepMs(5))
    expect(stepMs(500)).toBe(MIN_MS)
    expect(levelOf(0)).toBe(1)
    expect(levelOf(5)).toBe(2)
  })
})

describe('wrapDelta', () => {
  it('komşu hücre ve kenar aşımı', () => {
    expect(wrapDelta({ x: 3, y: 3 }, { x: 4, y: 3 }, 15, 15)).toEqual({ x: 1, y: 0 })
    expect(wrapDelta({ x: 14, y: 3 }, { x: 0, y: 3 }, 15, 15)).toEqual({ x: 1, y: 0 })
    expect(wrapDelta({ x: 2, y: 0 }, { x: 2, y: 14 }, 15, 15)).toEqual({ x: 0, y: -1 })
  })
})

describe('createDwell (bakışla yön)', () => {
  it('yön DWELL_MS tutulunca bir kez tetiklenir', () => {
    const d = createDwell()
    expect(d.push('right', 0).fire).toBeNull()
    expect(d.push('right', DWELL_MS - 1).fire).toBeNull()
    expect(d.push('right', DWELL_MS).fire).toBe('right')
    expect(d.push('right', DWELL_MS + 500).fire).toBeNull() // bakmaya devam: tekrar etmez
  })
  it('kısa kayma tetiklemez; yön değişince sayaç baştan', () => {
    const d = createDwell()
    d.push('up', 0)
    d.push('left', 100)
    expect(d.push('left', 100 + DWELL_MS - 10).fire).toBeNull()
    expect(d.push('left', 100 + DWELL_MS).fire).toBe('left')
  })
  it('merkez / kapalı göz (null) sıfırlar; aynı yöne yeniden bakınca tekrar tetikler', () => {
    const d = createDwell()
    d.push('down', 0)
    expect(d.push('down', DWELL_MS).fire).toBe('down')
    expect(d.push('center', 400).candidate).toBeNull()
    d.push('down', 500)
    expect(d.push('down', 500 + DWELL_MS).fire).toBe('down')
    d.push('up', 1000)
    expect(d.push(null, 1100).progress).toBe(0)
    expect(d.push('up', 1150).fire).toBeNull()
  })
  it('ilerleme 0..1', () => {
    const d = createDwell({ dwellMs: 200 })
    d.push('left', 0)
    expect(d.push('left', 100).progress).toBeCloseTo(0.5)
  })
})

describe('createSteadyLook (otomatik devam)', () => {
  // 30 Hz kareler; küçük titreme (±1°)
  const feed = (s, from, to, at, t0 = 0) => {
    let p = 0
    for (let ts = t0; ts <= t0 + to - from; ts += 33) p = s.push({ x: at.x + ((ts / 33) % 2 ? 1 : -1), y: at.y }, ts)
    return p
  }
  it('sabit bakış STEADY_HOLD_MS sonunda 1; konum ortada olmak zorunda değil', () => {
    const s = createSteadyLook()
    // Eskimiş nötre göre 12° aşağı (ör. telefon indirildi) ama sabit bakış
    expect(feed(s, 0, STEADY_HOLD_MS - 100, { x: 0, y: -12 })).toBeLessThan(1)
    expect(feed(s, 0, 120, { x: 0, y: -12 }, STEADY_HOLD_MS - 67)).toBe(1)
  })
  it('bakış kayınca sayaç baştan başlar', () => {
    const s = createSteadyLook({ holdMs: 600 })
    feed(s, 0, 500, { x: 0, y: 0 })
    // 15° sağa kayar ve orada kalır: pencerenin yarısı dolunca kayma algılanır, sayaç sıfırlanır
    let p = 1
    let reset = false
    for (let ts = 533; ts <= 1100; ts += 33) {
      p = s.push({ x: 15, y: 0 }, ts)
      if (p === 0) reset = true
    }
    expect(reset).toBe(true)
    expect(p).toBeLessThan(1)
    expect(feed(s, 0, 700, { x: 15, y: 0 }, 1133)).toBe(1)
  })
  it('tek karelik sıçrama sabitliği bozmaz', () => {
    const s = createSteadyLook({ holdMs: 300 })
    s.push({ x: 0, y: 0 }, 0)
    s.push({ x: 0, y: 0 }, 50)
    s.push({ x: 20, y: 0 }, 100)
    s.push({ x: 0, y: 0 }, 150)
    s.push({ x: 0, y: 0 }, 200)
    expect(s.push({ x: 0, y: 0 }, 300)).toBe(1)
  })
  it('null / geçersiz örnek (yüz yok, göz kapalı) sıfırlar; reset de sıfırlar', () => {
    const s = createSteadyLook({ holdMs: 200 })
    s.push({ x: 1, y: 1 }, 0)
    expect(s.push({ x: 1, y: 1 }, 100)).toBeCloseTo(0.5)
    expect(s.push(null, 150)).toBe(0)
    expect(s.push({ x: 1, y: 1 }, 160)).toBe(0)
    expect(s.push({ x: 1, y: 1 }, 260)).toBeCloseTo(0.5)
    expect(s.push({ x: NaN, y: 1 }, 270)).toBe(0)
    s.push({ x: 1, y: 1 }, 300)
    s.reset()
    expect(s.push({ x: 1, y: 1 }, 400)).toBe(0)
  })
})

describe('oyun seçenekleri', () => {
  it('TrueDepth yoksa her zaman dokunma; varsa kayıtlı seçim touch değilse göz', () => {
    const st = memStorage()
    expect(loadSnakeOpts(false, st)).toEqual({ control: 'touch', walls: 'classic' })
    expect(loadSnakeOpts(true, st)).toEqual({ control: 'eyes', walls: 'classic' })
    expect(saveSnakeOpts({ control: 'touch', walls: 'wrap' }, st)).toBe(true)
    expect(JSON.parse(st.getItem(OPTS_KEY))).toEqual({ control: 'touch', walls: 'wrap' })
    expect(loadSnakeOpts(true, st)).toEqual({ control: 'touch', walls: 'wrap' })
    saveSnakeOpts({ control: 'eyes', walls: 'classic' }, st)
    expect(loadSnakeOpts(true, st)).toEqual({ control: 'eyes', walls: 'classic' })
    expect(loadSnakeOpts(false, st)).toEqual({ control: 'touch', walls: 'classic' })
  })
  it('bozuk kayıt ve erişim hatası varsayılana düşer', () => {
    const st = memStorage()
    st.setItem(OPTS_KEY, '{bozuk')
    expect(loadSnakeOpts(true, st)).toEqual({ control: 'eyes', walls: 'classic' })
    st.setItem(OPTS_KEY, 'null')
    expect(loadSnakeOpts(false, st)).toEqual({ control: 'touch', walls: 'classic' })
    const boom = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') } }
    expect(loadSnakeOpts(true, boom)).toEqual({ control: 'eyes', walls: 'classic' })
    expect(saveSnakeOpts({ control: 'eyes', walls: 'wrap' }, boom)).toBe(false)
    expect(saveSnakeOpts({ control: 'eyes', walls: 'wrap' }, null)).toBe(false)
    expect(loadSnakeOpts(true, null)).toEqual({ control: 'eyes', walls: 'classic' })
  })
})

describe('en yüksek skor', () => {
  it('kaydeder ve okur', () => {
    const st = memStorage()
    expect(loadBest(st)).toBe(0)
    expect(saveBest(37, st)).toBe(true)
    expect(st.getItem(BEST_KEY)).toBe('37')
    expect(loadBest(st)).toBe(37)
  })
  it('bozuk değer ve erişim hatası 0 döner', () => {
    const st = memStorage()
    st.setItem(BEST_KEY, 'abc')
    expect(loadBest(st)).toBe(0)
    const boom = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') } }
    expect(loadBest(boom)).toBe(0)
    expect(saveBest(5, boom)).toBe(false)
    expect(loadBest(null)).toBe(0)
  })
  it('oturumlardan en iyi yılan skoru', () => {
    expect(bestFromSessions([])).toBe(0)
    expect(
      bestFromSessions([
        { type: 'game', game: 'snake', score: 12 },
        { type: 'routine', seconds: 60 },
        { type: 'game', game: 'snake', score: 31 },
        { type: 'game', game: 'other', score: 99 },
      ]),
    ).toBe(31)
  })
})
