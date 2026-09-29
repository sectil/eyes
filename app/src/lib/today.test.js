import { describe, it, expect } from 'vitest'
import { buildPath, todayPlan, jevLine, isDue, isSameDay, PATH, canOpen, eyeDay, lastComplete, weeklyStatus, skipEyesToday, runDayOf, WEEKLY_SUB, WEEKLY_DONE } from './today.js'
import { registry } from '../modules/registry.js'

const MIN = 60000
const NOW = new Date('2026-09-25T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const path = (tests = [], sessions = [], extra = {}) => buildPath(registry.live, { tests, sessions: [...SPAN3, ...STREET3, ...sessions], now: NOW, ...extra })
const keys = (p) => p.stops.map((s) => s.key)
// Normal gün: haftalık test (üç göz) 2 gün, okuma 3 gün önce (yol planı §4, "Ali" kurgusal)
const wk = (eyes, date) => eyes.map((eye) => ({ type: 'va-weekly', eye, date }))
const NORMAL = [...wk(['R', 'L', 'OU'], daysAgo(2)), { type: 'reading', date: daysAgo(3) }]
// Günlük test bugün iki gözüyle bitti
const DAILY_DONE = ['R', 'L'].map((eye) => ({ type: 'va-daily', eye, date: TODAY }))
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
    const p = path([...NORMAL, ...DAILY_DONE], s)
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
    const toRest = path([...NORMAL, ...DAILY_DONE], [...s, { type: 'game', game: 'track', seconds: 40, date: TODAY }])
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

describe('canOpen: sıralı yol', () => {
  it('yalnız sıradaki ve biten duraklar açılır; ileridekiler kapalı', () => {
    const s = [{ type: 'routine', setId: 'isinma', seconds: 40, date: TODAY }]
    const p = path(NORMAL, s)
    const i = p.stops.indexOf(p.next)
    expect(canOpen(p, p.stops[0])).toBe(true) // bitti: tekrar yapılabilir
    expect(canOpen(p, p.next)).toBe(true)
    expect(p.stops.slice(i + 1).filter((st) => !st.done).every((st) => !canOpen(p, st))).toBe(true)
  })
  it('mola kilidinde sıradaki Nefes açık, kilitli duraklar kapalı', () => {
    const p = path(NORMAL, [], { eye: { locked: true, leftMs: 2 * MIN, reason: 'budget' } })
    expect(canOpen(p, p.next)).toBe(true)
    expect(p.stops.filter((st) => st.locked).some((st) => canOpen(p, st))).toBe(false)
  })
  it('boş plan ya da durak yoksa kapalı', () => {
    expect(canOpen(null, {})).toBe(false)
    expect(canOpen({ next: null }, null)).toBe(false)
  })
})

describe('haftalık E testi: "tamam" = aynı gün sağ, sol ve iki göz (karar S3)', () => {
  const stopOf = (p, key) => p.stops.find((s) => s.key === key) ?? null
  const at = (iso) => new Date(iso).toISOString()

  it('yalnız sağ göz bugün: haftalık tamam değil, kart kalanları söyler, günlük test yok', () => {
    const p = path([...NORMAL.slice(3), ...wk(['R'], TODAY)])
    const w = stopOf(p, 'weekly')
    expect(w).toMatchObject({ title: 'Haftalık E testi', done: false, sub: 'Kalan: Sol göz, İki göz', remaining: ['L', 'OU'], warn: true })
    expect(keys(p)).not.toContain('daily')
    expect(weeklyStatus([...wk(['R'], TODAY)], NOW)).toMatchObject({ state: 'half', done: ['R'], remaining: ['L', 'OU'] })
  })

  it('sağ + sol + iki göz bugün: tamam, "✓ Bu hafta tamam"; günlük test o gün yok', () => {
    const p = path([...NORMAL.slice(3), ...wk(['R', 'L', 'OU'], TODAY)])
    expect(stopOf(p, 'weekly')).toMatchObject({ done: true, sub: WEEKLY_DONE, warn: false, remaining: null })
    expect(keys(p)).not.toContain('daily')
  })

  it('gözler iki güne dağıldıysa bugün tamam sayılmaz (dün sağ + sol, bugün iki göz)', () => {
    const tests = [...wk(['R', 'L'], daysAgo(1)), ...wk(['OU'], TODAY)]
    expect(weeklyStatus(tests, NOW)).toMatchObject({ state: 'half', remaining: ['R', 'L'], sub: 'Kalan: Sağ göz, Sol göz' })
    expect(lastComplete(tests, 'va-weekly')).toBeNull()
    // gece yarısı: 23:58'de sağ göz, ertesi gün sol ve iki göz → iki gün de yarım
    const night = [...wk(['R'], at('2026-09-24T23:58:00')), ...wk(['L', 'OU'], at('2026-09-25T00:03:00'))]
    expect(eyeDay(night, 'va-weekly', NOW)).toMatchObject({ complete: false, remaining: ['R'] })
  })

  it('yarım gün ertesi gün baştan açılır: zamanı gelmiş, kalan yazısı yok, atlanacak göz yok', () => {
    const tests = [...NORMAL.slice(3), ...wk(['R'], daysAgo(1))]
    const w = stopOf(path(tests), 'weekly')
    expect(w).toMatchObject({ done: false, sub: WEEKLY_SUB, warn: false, remaining: null })
    expect(skipEyesToday(tests, 'va-weekly', NOW)).toEqual([])
  })

  it('eski yarım kayıt haftalığı 7 gün gizlemez: 3 gün önce yalnız sağ göz → bugün zamanı gelmiş, günlük değil', () => {
    const tests = [...NORMAL.slice(3), ...wk(['R'], daysAgo(3))]
    const p = path(tests)
    expect(keys(p)).toContain('weekly')
    expect(keys(p)).not.toContain('daily')
    expect(weeklyStatus(tests, NOW)).toMatchObject({ state: 'due', due: true })
  })

  it('bu hafta tamamlandıysa haftalık yolda yok, günlük test var; bugün yarım başlarsa "Kalan" kartı döner', () => {
    expect(weeklyStatus(NORMAL, NOW)).toMatchObject({ state: 'idle', due: false, sub: WEEKLY_DONE })
    expect(keys(path(NORMAL))).toEqual(DAY)
    // zamanı gelmemişken de başlanan haftalık Bugün'de bekler (S4: "Kalanlar Bugün'de bekler"); ölçüm adımı onun
    const p = path([...NORMAL, ...wk(['R', 'L'], TODAY)])
    expect(stopOf(p, 'weekly')).toMatchObject({ done: false, sub: 'Kalan: İki göz', remaining: ['OU'] })
    expect(keys(p)).not.toContain('daily')
  })

  it('zaman son TAM günden sayılır: tam gün 8 gün önce, yarım gün 2 gün önce → zamanı gelmiş', () => {
    const tests = [...wk(['R', 'L', 'OU'], daysAgo(8)), ...wk(['R'], daysAgo(2))]
    expect(lastComplete(tests, 'va-weekly').date).toBe(daysAgo(8))
    expect(weeklyStatus(tests, NOW).due).toBe(true)
    const recent = [...wk(['R', 'L', 'OU'], daysAgo(6)), ...wk(['R', 'L'], daysAgo(2))]
    expect(weeklyStatus(recent, NOW)).toMatchObject({ state: 'idle', due: false })
  })

  // İnceleme bulgusu R-N2: kayıtlar koşu gününe (runDay: koşunun başladığı yerel gün) göre gruplanır
  it('gece yarısını geçen koşu (runDay): 23:58 başlangıç → 00:03 bitiş tamam sayılır; yarıda kalırsa ertesi gün baştan', () => {
    const D = '2026-09-24'
    const run = (eye, iso) => ({ type: 'va-weekly', eye, date: at(iso), runDay: D })
    const full = [run('R', '2026-09-24T23:59:40'), run('L', '2026-09-25T00:01:10'), run('OU', '2026-09-25T00:03:00')]
    const after = new Date('2026-09-25T00:05:00')
    expect(weeklyStatus(full, after)).toMatchObject({ state: 'idle', due: false, warn: false })
    expect(lastComplete(full, 'va-weekly')).toBe(full[2])
    expect(eyeDay(full, 'va-weekly', new Date('2026-09-24T23:59:59'))).toMatchObject({ complete: true })
    // hafta tamam: 25'inin yolunda haftalık yok, günlük test var
    const p = buildPath(registry.live, { tests: [...NORMAL.slice(3), ...full], sessions: [...SPAN3, ...STREET3], now: after })
    expect(keys(p)).not.toContain('weekly')
    expect(keys(p)).toContain('daily')
    // aynı koşu 00:01'de yarıda kaldı (sağ 23:59, sol 00:01): 25'inde test baştan açılır, "Kalan" yok, göz atlanmaz
    const half = full.slice(0, 2)
    expect(weeklyStatus(half, after)).toMatchObject({ state: 'due', warn: false, sub: WEEKLY_SUB })
    expect(skipEyesToday(half, 'va-weekly', after)).toEqual([])
    // 24'ünde (gece yarısından önce) dönülseydi kalan gözden sürerdi
    expect(skipEyesToday(half.slice(0, 1), 'va-weekly', new Date('2026-09-24T23:59:50'))).toEqual(['R'])
    // runDay'siz (eski) kayıtta kaydın kendi günü: eski davranış
    const legacy = full.map(({ runDay, ...r }) => r)
    expect(weeklyStatus(legacy, after)).toMatchObject({ state: 'half', remaining: ['R'] })
    expect(runDayOf(legacy[1])).toBe('2026-09-25')
    expect(runDayOf(full[1])).toBe(D)
    expect(runDayOf({ date: 'bozuk' })).toBeNull()
  })

  it('atlanacak gözler: yarım günde bitenler; tam ya da boş günde yok', () => {
    expect(skipEyesToday(wk(['R'], TODAY), 'va-weekly', NOW)).toEqual(['R'])
    expect(skipEyesToday(wk(['R', 'L'], TODAY), 'va-weekly', NOW)).toEqual(['R', 'L'])
    expect(skipEyesToday(wk(['R', 'L', 'OU'], TODAY), 'va-weekly', NOW)).toEqual([])
    expect(skipEyesToday([], 'va-weekly', NOW)).toEqual([])
    expect(skipEyesToday([{ type: 'va-daily', eye: 'R', date: TODAY }], 'va-daily', NOW)).toEqual(['R'])
  })
})

describe('günlük E testi: her göz ayrı kayıt (karar S4)', () => {
  const daily = (p) => p.stops.find((s) => s.key === 'daily')
  it('yalnız sağ göz bugün: tamam değil, "Kalan: Sol göz"; sağ + sol: tamam', () => {
    const half = daily(path([...NORMAL, { type: 'va-daily', eye: 'R', date: TODAY }]))
    expect(half).toMatchObject({ done: false, sub: 'Kalan: Sol göz', remaining: ['L'], warn: true })
    const full = daily(path([...NORMAL, ...DAILY_DONE]))
    expect(full).toMatchObject({ done: true, sub: 'sağ + sol göz', warn: false })
  })
  it('dünkü yarım günlük bugün baştan', () => {
    const d = daily(path([...NORMAL, { type: 'va-daily', eye: 'R', date: daysAgo(1) }]))
    expect(d).toMatchObject({ done: false, sub: 'sağ + sol göz', remaining: null })
  })
})
