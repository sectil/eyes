import { describe, it, expect } from 'vitest'
import { buildPath, todayPlan, jevLine, isDue, isSameDay, PATH } from './today.js'
import { registry } from '../modules/registry.js'

const MIN = 60000
const NOW = new Date('2026-09-25T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const path = (tests = [], sessions = [], extra = {}) => buildPath(registry.live, { tests, sessions: [...SPAN3, ...STREET3, ...sessions], now: NOW, ...extra })
const keys = (p) => p.stops.map((s) => s.key)
// Normal gün: haftalık test 2 gün, okuma 3 gün önce (yol planı §4, "Ali" kurgusal)
const NORMAL = [{ type: 'va-weekly', eye: 'OU', date: daysAgo(2) }, { type: 'reading', date: daysAgo(3) }]
// Tek Bakışta son 7 günde 3 gün yapıldı → bugün yolda yok (eski senaryolar değişmesin)
const SPAN3 = [2, 3, 4].map((d) => ({ type: 'span', span: 8, left: 4, right: 4, durationMs: 100, accuracy: 0.8, seconds: 120, date: daysAgo(d) }))
// Fark Ettin mi? de bu hafta 3 gün yapıldı → yolda yok
const STREET3 = [2, 3, 4].map((d) => ({ type: 'street', noticed: 2, asked: 3, task: 1, level: 1, seconds: 60, date: daysAgo(d) }))
const DAY = ['routine:isinma', 'daily', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'routine:kirpma', 'snake']

describe('buildPath: şablon', () => {
  it('normal gün: egzersizler gövde, E testi 2. durak, Nefes iki bölüm arasında, Yılan sonda (16 dk)', () => {
    const p = path(NORMAL)
    expect(keys(p)).toEqual(DAY)
    expect(p.stops.map((s) => s.block)).toEqual([1, 1, 1, 1, 1, 0, 2, 2, 2])
    expect(p.minutesLeft).toBe(16)
    expect(p.blocks.map((b) => b.eyeMin)).toEqual([4, 4]) // bölüm payı ≤ bütçe − 1 dk (R2)
    expect(p.next.key).toBe('routine:isinma')
    expect(p.stops.find((s) => s.key === 'daily').title).toBe('E testi')
  })

  it('haftalık gün: Haftalık E testi + Okuma; 20 dk sınırı için Yılan düşer (R7); ölçümler yan yana değil (R1)', () => {
    const p = path()
    expect(keys(p)).toEqual(['routine:isinma', 'weekly', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'reading', 'routine:kirpma'])
    expect(p.minutesLeft).toBe(19)
    expect(p.minutesLeft).toBeLessThanOrEqual(PATH.capMin)
  })

  it('abonelik yokken ilk test ilk durak (R6)', () => {
    const p = path([], [], { gate: { firstTestOnly: true } })
    expect(p.stops[0].key).toBe('weekly')
    expect(p.next.key).toBe('weekly')
  })

  it('Hızlı Bakış günü 2. bölüm yalnız o (R5); Yılan, Daire ve Göz kırpma o gün yok', () => {
    const ql = { type: 'quick-look', threshold: 200, accuracy: 70, seconds: 240, date: daysAgo(2) }
    const p = path(NORMAL, [ql])
    expect(keys(p)).toEqual(['routine:isinma', 'daily', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'quick-look'])
    const flashOff = path(NORMAL, [ql], { profile: { seizure: 'yes' } })
    expect(keys(flashOff)).not.toContain('quick-look')
  })

  it('Nefes her gün yolda; en az 60 sn nefes kaydıyla tamam', () => {
    expect(keys(path(NORMAL))).toContain('breath')
    const short = path(NORMAL, [{ type: 'breath', seconds: 30, date: TODAY }])
    expect(short.stops.find((s) => s.key === 'breath').done).toBe(false)
    const ok = path(NORMAL, [{ type: 'breath', seconds: 300, date: TODAY }])
    expect(ok.stops.find((s) => s.key === 'breath').done).toBe(true)
    expect(ok.stops.find((s) => s.key === 'breath').route).toBe('breath-rest')
  })

  it('Tek Bakışta haftada 3 gün: 2. bölümde 2 dk; o gün 2. bölüm payı için Yılan düşer', () => {
    const p = buildPath(registry.live, { tests: NORMAL, sessions: STREET3, now: NOW })
    expect(keys(p)).toEqual(['routine:isinma', 'daily', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'routine:kirpma', 'tek-bakis'])
    expect(p.blocks[1].eyeMin).toBe(4)
    expect(keys(path(NORMAL))).not.toContain('tek-bakis') // bu hafta 3 gün yapılmış
    const flashOff = buildPath(registry.live, { tests: NORMAL, sessions: STREET3, now: NOW, profile: { seizure: 'unsure' } })
    expect(keys(flashOff)).not.toContain('tek-bakis')
  })

  it('Fark Ettin mi? haftada 3 gün: Nefes\'in hemen ardından; 2. bölüm payı için Yılan düşer', () => {
    const p = buildPath(registry.live, { tests: NORMAL, sessions: SPAN3, now: NOW })
    expect(keys(p)).toEqual(['routine:isinma', 'daily', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'fark-ettin', 'routine:daire', 'routine:kirpma'])
    expect(p.blocks[1].eyeMin).toBe(4)
  })

  it('Tek Bakışta ile Fark Ettin mi? dönüşümlü: aynı gün ikisinden biri; bu hafta az yapılan önce; bugün yapılan kalır', () => {
    const at = (d) => buildPath(registry.live, { tests: NORMAL, sessions: [], now: new Date(NOW.getTime() + d * 86400000) })
    const pickOf = (p) => keys(p).filter((k) => k === 'fark-ettin' || k === 'tek-bakis')
    expect(pickOf(at(0))).toHaveLength(1)
    expect(new Set([pickOf(at(0))[0], pickOf(at(1))[0]]).size).toBe(2) // eşitken günlere göre sırayla
    const oneSpan = [{ type: 'span', span: 8, durationMs: 100, accuracy: 0.8, seconds: 90, date: daysAgo(1) }]
    expect(pickOf(buildPath(registry.live, { tests: NORMAL, sessions: oneSpan, now: NOW }))).toEqual(['fark-ettin'])
    const spanToday = [{ type: 'span', span: 8, durationMs: 100, accuracy: 0.8, seconds: 90, date: TODAY }]
    expect(pickOf(buildPath(registry.live, { tests: NORMAL, sessions: spanToday, now: NOW }))).toEqual(['tek-bakis'])
  })

  it('Nefes sayma emekli: yolda yok', () => {
    const p = path([], [{ type: 'breath-count', accuracy: 80, date: daysAgo(9) }])
    expect(keys(p).some((k) => k.startsWith('breath-count'))).toBe(false)
  })
})

describe('buildPath: tamamlama, sıradaki, kilit', () => {
  it('egzersiz grubu setId ile tamam; sıradaki ilk tamamlanmamış durak (R8)', () => {
    const s = [{ type: 'routine', setId: 'isinma', seconds: 40, date: TODAY }, { type: 'routine', setId: 'uzak', seconds: 40, date: TODAY }]
    const p = path(NORMAL, s)
    expect(keys(p)).toEqual(DAY) // sıra değişmez
    expect(p.doneCount).toBe(2)
    expect(p.next.key).toBe('daily') // sırayla değil dokunulan yapıldı; sıradaki E testi
    const eskiSet = path(NORMAL, [{ type: 'routine', setId: 'full', seconds: 176, date: TODAY }])
    expect(eskiSet.doneCount).toBe(0) // eski setler grup duraklarını tamamlamaz
  })

  it('Bugünün görevi açık kalsa da yol tamam (akşam raporu)', () => {
    const s = [
      ...['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma'].map((id) => ({ type: 'routine', setId: id, seconds: 40, date: TODAY })),
      { type: 'game', game: 'track', score: 10, seconds: 40, date: TODAY },
      { type: 'game', game: 'snake', score: 10, seconds: 90, date: TODAY },
      { type: 'breath', seconds: 300, date: TODAY },
      { type: 'notice', count: 2, date: daysAgo(1) },
    ]
    const p = path([...NORMAL, { type: 'va-daily', eye: 'R', date: TODAY }], s)
    expect(keys(p).at(-1)).toBe('notice')
    expect(p.stops.at(-1).finale).toBe(true)
    expect(p.allDone).toBe(true)
    expect(p.next.key).toBe('notice')
  })

  it('mola sürerken bütçeli duraklar kilitli; sıradaki Nefes', () => {
    const eye = { locked: true, leftMs: 2 * MIN, reason: 'budget' }
    const p = path(NORMAL, [], { eye })
    expect(p.stops.filter((s) => s.locked).map((s) => s.key)).toEqual(DAY.filter((k) => k !== 'breath'))
    expect(p.next.key).toBe('breath')
    expect(p.stops[0].lockLeftMs).toBe(2 * MIN)
  })

  it('dünden 4 dk kaldıysa E testinden önce "Burada 5 dk mola var"', () => {
    const p = path(NORMAL, [], { eye: { locked: false, due: null, used: 4 * MIN, budgetMs: 5 * MIN, leftMs: MIN } })
    expect(p.forcedRestBefore).toBe('daily')
    expect(path(NORMAL, [], { eye: { locked: false, due: null, used: 0, budgetMs: 5 * MIN, leftMs: 5 * MIN } }).forcedRestBefore).toBeNull()
  })
})

describe('buildPath: takılı modüller', () => {
  it('takılan modül durak ekler, bozuk modül yolu düşürmez, emekli modül girmez', () => {
    const mods = [
      { id: 'a', kind: 'practice', today: () => ({ title: 'A', minutes: 2, done: false }) },
      { id: 'b', kind: 'measure', today: () => { throw new Error('bozuk') } },
      { id: 'c', kind: 'measure' },
      { id: 'd', kind: 'practice', retired: true, today: () => ({ title: 'D', minutes: 1, done: false }) },
    ]
    const p = todayPlan(mods, { now: NOW })
    expect(p.items.map((i) => i.key)).toEqual(['a'])
    expect(p.next.route).toBe('a')
  })

  it('bir modül birden çok durak verebilir; iki ölçüm yan yana gelmez (R1)', () => {
    const mods = [
      { id: 'm', kind: 'measure', today: () => [{ key: 'x', title: 'X', minutes: 3, slot: 'test' }, { key: 'y', title: 'Y', minutes: 3, slot: 'test' }] },
      { id: 'e', kind: 'exercise', gates: { eyeBudget: 'eye' }, today: () => ({ title: 'E', minutes: 1, slot: 'body' }) },
    ]
    const p = buildPath(mods, { now: NOW })
    expect(keys(p)).toEqual(['m:x', 'e', 'm:y'])
  })
})

describe('jevLine', () => {
  const day = 20356
  it('önceliğe göre tek kelime + tek satır', () => {
    const fresh = path(NORMAL)
    expect(jevLine(fresh, { day })).toEqual({ word: 'Hadi', line: 'İlk durak: Isınma · 1 dk' })
    const eye = { locked: true, leftMs: 2 * MIN, reason: 'budget' }
    const locked = jevLine(path(NORMAL, [], { eye }), { day, eye, fmt: () => '2:00' })
    expect(['Nefes al', 'Rahatla', 'Sakin ol']).toContain(locked.word)
    expect(locked.line).toBe('Mola · 2:00')
    const s = ['isinma', 'uzak', 'yakinuzak'].map((id) => ({ type: 'routine', setId: id, seconds: 40, date: TODAY }))
    const toRest = path([...NORMAL, { type: 'va-daily', eye: 'R', date: TODAY }], [...s, { type: 'game', game: 'track', seconds: 40, date: TODAY }])
    expect(jevLine(toRest, { day }).line).toBe('Sırada Nefes · 5 dk mola')
    const toTest = path(NORMAL, s.slice(0, 1))
    expect(['Odaklan', 'Odak sende']).toContain(jevLine(toTest, { day }).word)
    expect(jevLine(path(NORMAL, s.slice(0, 1)), { day, gold: true }).word).not.toBe('Odaklan')
  })
  it('"Tam isabet" yolda hiç çıkmaz', () => {
    const p = path(NORMAL)
    for (let d = 0; d < 30; d++) expect(jevLine(p, { day: d }).word).not.toBe('Tam isabet')
  })
})

describe('yardımcılar', () => {
  it('isDue: kayıt yoksa ya da 7 günden eskiyse', () => {
    expect(isDue(null, NOW)).toBe(true)
    expect(isDue({ date: daysAgo(6) }, NOW)).toBe(false)
    expect(isDue({ date: daysAgo(8) }, NOW)).toBe(true)
  })
  it('isSameDay', () => {
    expect(isSameDay({ date: NOW.toISOString() }, NOW)).toBe(true)
    expect(isSameDay({ date: daysAgo(1) }, NOW)).toBe(false)
    expect(isSameDay({ date: 'bozuk' }, NOW)).toBe(false)
  })
})
