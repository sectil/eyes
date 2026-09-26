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
  LEVELS,
  CAL_BOX,
  ROUND_MS,
  layoutGraph,
  neighbours,
  nextNode,
  toGaze,
  jumpWindowMs,
  glideMs,
  summarizeSteps,
  levelScore,
  makeTrackRecord,
  levelAdvice,
  weekArriveMs,
  glideUnlocked,
  loadTrackOpts,
  saveTrackOpts,
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
    expect(offScreen(g(19, 0))).toBe(false) // ekran kenarı (kalibrasyon hedefi) içeride
    expect(offScreen(g(28, 0))).toBe(true)
    expect(offScreen(g(0, 28))).toBe(true)
    expect(offScreen(g(0, -28))).toBe(false) // aşağıda pay daha geniş
    expect(offScreen(g(0, -32))).toBe(true)
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

// --- Çemberler (v2) ---------------------------------------------------------------------
describe('Çemberler: mercek ağı', () => {
  it('seviyeler: düğüm sayısı, kenarlar ve kalibrasyon kutusunun içi', () => {
    const deg = (G, i) => neighbours(G, i).length
    const G1 = layoutGraph(1)
    expect(G1.pts).toHaveLength(5)
    expect(G1.edges).toHaveLength(10) // beşgen halka + {5/2} yıldız
    G1.pts.forEach((_, i) => expect(deg(G1, i)).toBe(4))
    const G2 = layoutGraph(2)
    expect(G2.pts).toHaveLength(7)
    G2.pts.forEach((_, i) => expect(deg(G2, i)).toBe(4)) // yedigen halka + {7/3}
    const G3 = layoutGraph(3)
    expect(G3.pts).toHaveLength(8)
    expect(G3.edges.some((e) => e[2] === 'ring')).toBe(false) // Seviye 3'te halka yok
    for (let i = 0; i < 7; i++) expect(deg(G3, i)).toBe(3) // {7/3} + iris lifi
    expect(deg(G3, 7)).toBe(7) // merkez (göz bebeği)
    for (const L of [1, 2, 3]) {
      for (const p of layoutGraph(L).pts) {
        expect(p.x).toBeGreaterThanOrEqual(CAL_BOX.left)
        expect(p.x).toBeLessThanOrEqual(CAL_BOX.right)
        expect(p.y).toBeGreaterThanOrEqual(CAL_BOX.top)
        expect(p.y).toBeLessThanOrEqual(CAL_BOX.bottom)
      }
    }
    expect(layoutGraph(1).pts[0].x).toBeCloseTo(50)
    expect(layoutGraph(1).pts[0].y).toBeCloseTo(19.5) // ilk mercek tepede
  })
  it('sonraki hedef: komşulardan biri, bir önceki hariç', () => {
    for (const L of [1, 2, 3]) {
      const G = layoutGraph(L)
      let prev = null
      let cur = 0
      for (let i = 0; i < 300; i++) {
        const n = nextNode(G, cur, prev)
        expect(neighbours(G, cur)).toContain(n)
        expect(n).not.toBe(prev)
        prev = cur
        cur = n
      }
    }
    expect(nextNode(layoutGraph(1), 0, 1, () => 0)).not.toBe(1)
  })
  it('ekran noktası → beklenen bakış (kalibrasyon kenarı ±20)', () => {
    expect(toGaze({ x: 50, y: 46 })).toEqual({ x: 0, y: 0 })
    expect(toGaze({ x: 92, y: 46 })).toEqual({ x: 20, y: 0 })
    expect(toGaze({ x: 8, y: 46 }).x).toBeCloseTo(-20)
    expect(toGaze({ x: 50, y: 12 }).y).toBeCloseTo(20)
    expect(toGaze({ x: 50, y: 84 }).y).toBeCloseTo(-20)
  })
  it('seviye aralıkları ve pencereler', () => {
    expect([1, 2, 3].map((l) => LEVELS[l].ms)).toEqual([1600, 1200, 900])
    expect(jumpWindowMs(1600)).toBe(1200)
    expect(jumpWindowMs(900)).toBe(800)
    expect(glideMs(300)).toBe(1000) // 300 pt/sn
    expect(ROUND_MS).toBe(60000)
  })
})

describe('createFollowDetector.jumpTo (ekran noktaları)', () => {
  const still = (det) => run(det, Array.from({ length: 10 }, (_, i) => [i * 33, 0, 0]))
  it('aşağıdaki merceğe geçiş: ekranda y aşağı, bakışta y aşağı (−)', () => {
    const det = createFollowDetector()
    still(det)
    det.jumpTo({ x: 50, y: 19.5 }, { x: 50, y: 70 }, 330)
    run(det, [[400, 0, -1], [466, 0.2, -2.4]])
    expect(det.finish()).toMatchObject({ measured: 1, followed: 1, reactMs: 136 })
  })
  it('ters yöne bakış kaçış sayılır', () => {
    const det = createFollowDetector()
    still(det)
    det.jumpTo({ x: 50, y: 19.5 }, { x: 50, y: 70 }, 330, { windowMs: 300 })
    run(det, [[400, 0, 3], [700, 0, 3]])
    expect(det.finish()).toMatchObject({ measured: 1, followed: 0 })
  })
  it('deneme başına pencere (Süzül: kenar süresi)', () => {
    const det = createFollowDetector({ windowMs: 200 })
    still(det)
    det.jumpTo({ x: 30, y: 67 }, { x: 82, y: 52 }, 330, { windowMs: 1500 })
    run(det, [[900, 1, 0], [1500, 2.5, 0.5]]) // yavaş takip: 1170 ms'de yeterli yol
    expect(det.finish().followed).toBe(1)
  })
  it('cancel: duraklatmada açık deneme ölçülmez', () => {
    const det = createFollowDetector()
    still(det)
    const rec = det.jumpTo({ x: 50, y: 19.5 }, { x: 50, y: 70 }, 330)
    det.cancel()
    expect(rec).toMatchObject({ followed: null, paused: true })
    expect(det.open).toBe(false)
    expect(det.finish()).toMatchObject({ total: 1, measured: 0 })
  })
})

describe('Çemberler: tur özeti, puan ve kayıt v2', () => {
  const steps = [
    { kind: 'jump', res: 'hit', ms: 300 },
    { kind: 'jump', res: 'hit', ms: 400 },
    { kind: 'jump', res: 'u' }, // ölçülmedi: seriyi bozmaz
    { kind: 'jump', res: 'hit', ms: 500 },
    { kind: 'jump', res: 'miss' },
    { kind: 'glide', res: 'hit', ms: 999 }, // Süzül süresi ortancaya girmez
  ]
  it('isabet %, ortanca varış (yalnızca Sıçra), en uzun seri', () => {
    expect(summarizeSteps(steps)).toEqual({ steps: 6, measured: 5, arrived: 4, pct: 80, arriveMs: 400, streak: 3 })
    expect(summarizeSteps([{ kind: 'jump', res: 'none' }])).toMatchObject({ measured: 0, pct: null, arriveMs: null, streak: 0 })
  })
  it('puan = varış × seviyenin hız çarpanı', () => {
    const s = summarizeSteps(steps)
    expect(levelScore(s, 1)).toBe(4)
    expect(levelScore(s, 2)).toBe(6)
    expect(levelScore(s, 3)).toBe(8)
    expect(levelScore({ measured: 0, arrived: 0 }, 2)).toBeNull()
  })
  it('kayıt v2 eski alanları da yazar; ritimde ölçüm alanları boş', () => {
    const sum = summarizeSteps(steps)
    const r = makeTrackRecord({ level: 2, mode: 'jump', sum, measured: true, seconds: 60, score: 6, best: 54 })
    expect(r).toMatchObject({ type: 'game', game: 'track', v: 2, mode: 'jump', level: 2, steps: 6, measured: 5, arrived: 4, pct: 80, arriveMs: 400, streak: 3, score: 6, best: 54, seconds: 60, control: 'eyes', followPct: 80, reactMs: 400, speed: 'mid' })
    const n = makeTrackRecord({ level: 1, mode: 'jump', sum: summarizeSteps([{ kind: 'jump', res: 'none' }]), measured: false, seconds: 60, score: null, best: 0 })
    expect(n).toMatchObject({ v: 2, control: null, score: null, pct: null, followPct: null, reactMs: null, arrived: null, best: null })
    expect(trackBestFromSessions([r, n])).toBe(54)
  })
  it('seviye önerisi, 7 gün ortancası, Süzül kilidi', () => {
    const rec = (pct, extra = {}) => ({ type: 'game', game: 'track', v: 2, level: 2, mode: 'jump', pct, ...extra })
    expect(levelAdvice([rec(85), rec(90)], 2)).toEqual({ to: 3, up: true })
    expect(levelAdvice([rec(85), rec(70)], 2)).toBeNull()
    expect(levelAdvice([rec(40)], 2)).toEqual({ to: 1, up: false })
    expect(levelAdvice([rec(40, { level: 1 })], 1)).toBeNull()
    const now = new Date('2026-09-25T12:00:00')
    const d = (days) => new Date(now.getTime() - days * 86400000).toISOString()
    const a = (ms, days) => rec(80, { arriveMs: ms, date: d(days) })
    expect(weekArriveMs([a(300, 1), a(320, 2)], now)).toBeNull() // < 3 tur
    expect(weekArriveMs([a(300, 1), a(320, 2), a(360, 3), a(100, 10)], now)).toBe(320)
    expect(glideUnlocked([])).toBe(false)
    expect(glideUnlocked([{ type: 'game', game: 'track', score: 3 }])).toBe(true) // eski tur
    expect(glideUnlocked([rec(80, { mode: 'glide' })])).toBe(false)
    expect(glideUnlocked([{ type: 'game', game: 'snake' }])).toBe(false)
  })
  it('seçenekler: seviye ve mod; hız tercihi korunur', () => {
    const s = mem()
    expect(loadTrackOpts(s)).toEqual({ speed: 'mid', level: 1, mode: 'jump' })
    saveTrackSpeed('fast', s)
    saveTrackOpts({ level: 3, mode: 'glide' }, s)
    expect(loadTrackOpts(s)).toEqual({ speed: 'fast', level: 3, mode: 'glide' })
    saveTrackOpts({ level: 9, mode: 'x' }, s)
    expect(loadTrackOpts(s)).toMatchObject({ level: 1, mode: 'jump' })
  })
})

describe('Çemberler manifesti: v1 ve v2 kayıtları', () => {
  const now = new Date('2026-09-25T12:00:00')
  const v1 = { type: 'game', game: 'track', score: 40, best: 40, followPct: 70, reactMs: 280, control: 'eyes', seconds: 40, date: new Date(now.getTime() - 86400000).toISOString() }
  const v2 = { type: 'game', game: 'track', v: 2, mode: 'jump', level: 2, score: 54, best: 54, pct: 90, followPct: 90, arriveMs: 318, reactMs: 318, control: 'eyes', seconds: 60, date: new Date(now.getTime() - 3600000).toISOString() }
  it('describe iki sürümü de okur', async () => {
    const m = (await import('../modules/track/manifest.js')).default
    expect(m.title).toBe('Çemberler')
    const d1 = m.sessions.describe(v1, { seconds: 40 })
    expect(d1).toMatchObject({ title: 'Çemberler', score: 40 })
    expect(d1.detail).toMatch(/takip\s%70/)
    const d2 = m.sessions.describe(v2, { seconds: 60 })
    expect(d2.detail).toMatch(/Seviye\s2\sSıçra/)
    expect(d2.detail).toMatch(/isabet\s%90/)
    const rhythm = m.sessions.describe({ type: 'game', game: 'track', v: 2, mode: 'jump', level: 1, score: null, pct: null, control: null }, { seconds: 60 })
    expect(rhythm.detail).not.toMatch(/isabet|puan/)
  })
  it('stats ve coach: isabet iki sürümden, varış yalnızca v2', async () => {
    const m = (await import('../modules/track/manifest.js')).default
    const rows = m.stats([v1, v2], now)
    expect(rows[0]).toEqual({ label: 'Rekor', value: '54\u00a0puan' })
    expect(rows[1]).toMatchObject({ label: 'İsabet · 7 gün', value: '%80' })
    expect(rows[2]).toMatchObject({ label: 'Varış ort. · 7 gün', value: '318\u00a0ms' })
    expect(m.stats([v1], now)).toHaveLength(2)
    expect(m.coach([v1, v2], now)).toEqual({ best: 54, sessions7: 2, follow7: 80, arrive7: 318 })
    expect(m.coach([v1], now)).toEqual({ best: 40, sessions7: 1, follow7: 70 })
  })
})
