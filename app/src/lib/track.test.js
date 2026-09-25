import { describe, it, expect } from 'vitest'
import {
  SPOTS,
  MIN_JUMP,
  SPEEDS,
  nextSpot,
  wordAt,
  WORDS,
  createFollowDetector,
  summarizeTrials,
  scoreOf,
  offScreen,
  loadTrackBest,
  saveTrackBest,
  trackBestFromSessions,
  loadTrackSpeed,
  saveTrackSpeed,
} from './track.js'

const mem = () => {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}

describe('nextSpot', () => {
  it('her atlama en az MIN_JUMP uzağa, aynı noktada kalmaz', () => {
    let cur = 0
    for (let i = 0; i < 200; i++) {
      const n = nextSpot(cur)
      expect(n).not.toBe(cur)
      expect(Math.hypot(SPOTS[n].x - SPOTS[cur].x, SPOTS[n].y - SPOTS[cur].y)).toBeGreaterThanOrEqual(MIN_JUMP)
      cur = n
    }
  })
  it('ilk nokta: herhangi biri', () => {
    expect(nextSpot(null, () => 0)).toBe(0)
    expect(nextSpot(null, () => 0.999)).toBe(SPOTS.length - 1)
  })
})

describe('sözler', () => {
  it('kısa (en fazla 3 kelime) ve sağlık iddiası yok', () => {
    for (const w of WORDS) {
      expect(w.split(/\s+/).length).toBeLessThanOrEqual(3)
      expect(w).not.toMatch(/iyileş|tedavi|görme|keskin|güçlen/i)
    }
    expect(wordAt(WORDS.length + 1)).toBe(WORDS[1])
  })
})

// Bakış akışı üreticisi: 30 Hz
function run(det, path) {
  let r = null
  for (const [t, x, y] of path) r = det.push(x == null ? null : { x, y }, t) ?? r
  return r
}

describe('createFollowDetector', () => {
  it('atlama yönünde yeterli sıçrama → takip, tepki süresi', () => {
    const det = createFollowDetector({ windowMs: 800 })
    run(det, Array.from({ length: 10 }, (_, i) => [i * 33, 0, 0]))
    det.jump(3, 4, 330) // soldan sağa: d = (+1, 0)
    run(det, [[363, 0.2, 0], [396, 0.5, 0], [429, 1.2, 0], [462, 2.6, 0.2], [495, 3, 0.1]])
    const s = det.finish()
    expect(s).toMatchObject({ total: 1, measured: 1, followed: 1, pct: 100 })
    expect(s.reactMs).toBe(132)
  })
  it('ters yöne hareket takip sayılmaz; pencere dolunca kaçtı', () => {
    const det = createFollowDetector({ windowMs: 300 })
    run(det, Array.from({ length: 10 }, (_, i) => [i * 33, 0, 0]))
    det.jump(3, 4, 330)
    run(det, [[400, -3, 0], [500, -3, 0], [700, -3, 0]])
    expect(det.finish()).toMatchObject({ measured: 1, followed: 0, pct: 0 })
  })
  it('atlamada bakış verisi yoksa deneme ölçülmez', () => {
    const det = createFollowDetector()
    det.jump(0, 7, 1000)
    run(det, [[1100, 3, -3], [1200, 3, -3]])
    expect(det.finish()).toMatchObject({ total: 1, measured: 0, pct: null })
  })
  it('çapraz atlama: kosinüs yön uyuşmasıyla', () => {
    const det = createFollowDetector()
    run(det, Array.from({ length: 10 }, (_, i) => [i * 33, 0, 0]))
    det.jump(0, 7, 330) // sol üstten sağ alta: d ≈ (+0.7, −0.7)
    run(det, [[400, 1.8, -1.8]])
    expect(det.finish().followed).toBe(1)
  })
  it('açık deneme yeni atlamada kapanır', () => {
    const det = createFollowDetector({ windowMs: 5000 })
    run(det, Array.from({ length: 10 }, (_, i) => [i * 33, 0, 0]))
    det.jump(3, 4, 330)
    run(det, [[400, 0, 0], [500, 0, 0]])
    det.jump(4, 3, 600)
    run(det, [[650, -3, 0]])
    const s = det.finish()
    expect(s.total).toBe(2)
    expect(s.followed).toBe(1)
    expect(det.trials[0].followed).toBe(false)
  })
})

describe('summarizeTrials / scoreOf', () => {
  it('ortanca tepki ve puan (hız çarpanı)', () => {
    const s = summarizeTrials([
      { followed: true, rt: 200 },
      { followed: true, rt: 300 },
      { followed: false, rt: null },
      { followed: null, rt: null },
    ])
    expect(s).toEqual({ total: 4, measured: 3, followed: 2, pct: 67, reactMs: 250 })
    expect(scoreOf(s, 'fast')).toBe(2 * SPEEDS.fast.mult)
    expect(scoreOf({ measured: 0 }, 'mid')).toBeNull()
  })
})

describe('offScreen', () => {
  const g = (x, y, extra = {}) => ({ calibrated: true, tracked: true, closed: false, v: { x, y }, ...extra })
  it('ekran içi bakış hayır, dışarı bakış evet, bilinmiyorsa null', () => {
    expect(offScreen(g(4, -5))).toBe(false)
    expect(offScreen(g(15, 0))).toBe(true)
    expect(offScreen(g(0, 14))).toBe(true)
    expect(offScreen(g(0, -13))).toBe(false) // aşağıda pay daha geniş
    expect(offScreen(g(0, -17))).toBe(true)
    expect(offScreen(g(0, 0, { closed: true }))).toBeNull()
    expect(offScreen(g(0, 0, { calibrated: false }))).toBeNull()
    expect(offScreen(null)).toBeNull()
  })
})

describe('rekor ve seçenekler', () => {
  it('rekor yalnızca artar; oturumlardan da okunur', () => {
    const s = mem()
    expect(loadTrackBest(s)).toBe(0)
    expect(saveTrackBest(12, s)).toBe(12)
    expect(saveTrackBest(8, s)).toBe(12)
    expect(trackBestFromSessions([{ type: 'game', game: 'track', score: 20 }, { type: 'game', game: 'snake', score: 99 }])).toBe(20)
  })
  it('hız tercihi', () => {
    const s = mem()
    expect(loadTrackSpeed(s)).toBe('mid')
    saveTrackSpeed('fast', s)
    expect(loadTrackSpeed(s)).toBe('fast')
    saveTrackSpeed('xx', s)
    expect(loadTrackSpeed(s)).toBe('mid')
  })
})
