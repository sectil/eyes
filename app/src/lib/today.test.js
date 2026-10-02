import { describe, it, expect } from 'vitest'
import { buildPath, todayPlan, jevLine, isDue, isDueWeekly, isSameDay, PATH, canOpen, eyeDay, lastComplete, weeklyStatus, skipEyesToday, runDayOf, readingStatus, WEEKLY_SUB, WEEKLY_DONE } from './today.js'
import { registry } from '../modules/registry.js'
import { dayKey } from './calendar.js'
import { progressionCtx, newStopKeys, restDecision, pathRestMinutes } from './progression.js'
import { yogaPathStop } from './yoga.js'
import { isBreath } from './breath.js'
import { isStreet } from './street.js'
import { isSpan } from './span.js'
import { isNotice } from './notice.js'
import { profileSignals } from './profile.js'
import { withinDays } from './today.js'

const MIN = 60000
const NOW = new Date('2026-09-25T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const path = (tests = [], sessions = [], extra = {}) => buildPath(registry.live, { tests, sessions: [...SPAN3, ...STREET3, ...sessions], now: NOW, ...extra })
const keys = (p) => p.stops.map((s) => s.key)
// Normal gün: haftalık test (üç göz) 2 gün, okuma 3 gün önce (yol planı §4, "Ali" kurgusal)
const wk = (eyes, date) => eyes.map((eye) => ({ type: 'va-weekly', eye, date }))
const NORMAL = [...wk(['R', 'L', 'OU'], daysAgo(2)), { type: 'reading', date: daysAgo(3) }]
// İsteğe bağlı kısa E testi (eski adı günlük test) bugün iki gözüyle yapıldı: yola durak eklemez
const DAILY_DONE = ['R', 'L'].map((eye) => ({ type: 'va-daily', eye, date: TODAY }))
// Tek Bakışta son 7 günde 3 gün yapıldı → bugün yolda yok (eski senaryolar değişmesin)
const SPAN3 = [2, 3, 4].map((d) => ({ type: 'span', span: 8, left: 4, right: 4, durationMs: 100, accuracy: 0.8, seconds: 120, date: daysAgo(d) }))
// Fark Ettin mi? de bu hafta 3 gün yapıldı → yolda yok
const STREET3 = [2, 3, 4].map((d) => ({ type: 'street', noticed: 2, asked: 3, task: 1, level: 1, seconds: 60, date: daysAgo(d) }))
// Karar 2026-09-29: E testi haftada bir; haftalık testin olmadığı günlerde yolda E testi yok.
// Sahip kararı 2026-10-02: Oku ve Anla (bu hafta yapılmadı) okuma testinin eski yerinde, 2. bölümde (yol göz payı 0)
const DAY = ['routine:isinma', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'okuma-anlama', 'routine:kirpma', 'snake']

describe('buildPath: şablon', () => {
  it('normal gün (haftalık test bu hafta yapıldı): E testi yok; egzersizler gövde, Nefes iki bölüm arasında, Oku ve Anla 2. bölümde, Yılan sonda (15 dk)', () => {
    const p = path(NORMAL)
    expect(keys(p)).toEqual(DAY)
    expect(p.stops.map((s) => s.block)).toEqual([1, 1, 1, 1, 0, 2, 2, 2, 2])
    expect(p.minutesLeft).toBe(15)
    expect(p.blocks.map((b) => b.eyeMin)).toEqual([4, 4]) // bölüm payı ≤ bütçe − 1 dk (R2)
    expect(p.next.key).toBe('routine:isinma')
    expect(p.stops.some((s) => s.slot === 'test' || s.glyph === 'E')).toBe(false)
  })

  // Hiç test yok: Haftalık E testi gecikmiş. Sahip kararı 2026-10-02: okuma testi (eskiden 3 dk, ikinci ölçüm) yolda değil;
  // yerinde 2 dk'lık Oku ve Anla. Yol tam 20 dk'da kalır, Yılan bu kez düşmez (R7 gerekmez); yan yana iki ölçüm yok (R1)
  it('E testi gecikmiş gün: Haftalık E testi 1. bölümde, Oku ve Anla 2. bölümde; yol 20 dk, sınırı aşmaz; ölçümler yan yana değil (R1)', () => {
    const p = path()
    expect(keys(p)).toEqual(['routine:isinma', 'weekly', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'okuma-anlama', 'routine:kirpma', 'snake'])
    expect(p.minutesLeft).toBe(20)
    expect(p.minutesLeft).toBeLessThanOrEqual(PATH.capMin)
    expect(p.stops.every((s, i) => i === 0 || !(s.kind === 'measure' && p.stops[i - 1].kind === 'measure'))).toBe(true)
  })

  it('abonelik yokken ilk test ilk durak (R6)', () => {
    const p = path([], [], { gate: { firstTestOnly: true } })
    expect(p.stops[0].key).toBe('weekly')
    expect(p.next.key).toBe('weekly')
  })

  it('Hızlı Bakış günü 2. bölüm yalnız o (R5); Yılan, Daire ve Göz kırpma o gün yok', () => {
    const ql = { type: 'quick-look', threshold: 200, accuracy: 70, seconds: 240, date: daysAgo(2) }
    const p = path(NORMAL, [ql])
    expect(keys(p)).toEqual(['routine:isinma', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'quick-look'])
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
    expect(keys(p)).toEqual(['routine:isinma', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'okuma-anlama', 'routine:kirpma', 'tek-bakis'])
    expect(p.blocks[1].eyeMin).toBe(4)
    expect(keys(path(NORMAL))).not.toContain('tek-bakis') // bu hafta 3 gün yapılmış
    const flashOff = buildPath(registry.live, { tests: NORMAL, sessions: STREET3, now: NOW, profile: { seizure: 'unsure' } })
    expect(keys(flashOff)).not.toContain('tek-bakis')
  })

  it('Fark Ettin mi? haftada 3 gün: Nefes\'in hemen ardından; 2. bölüm payı için Yılan düşer', () => {
    const p = buildPath(registry.live, { tests: NORMAL, sessions: SPAN3, now: NOW })
    expect(keys(p)).toEqual(['routine:isinma', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'fark-ettin', 'routine:daire', 'okuma-anlama', 'routine:kirpma'])
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
    expect(p.next.key).toBe('track') // sırayla değil dokunulan yapıldı; sıradaki ilk tamamlanmamış durak
    const eskiSet = path(NORMAL, [{ type: 'routine', setId: 'full', seconds: 176, date: TODAY }])
    expect(eskiSet.doneCount).toBe(0) // eski setler grup duraklarını tamamlamaz
  })

  it('Bugünün görevi açık kalsa da yol tamam (akşam raporu)', () => {
    const s = [
      ...['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma'].map((id) => ({ type: 'routine', setId: id, seconds: 40, date: TODAY })),
      { type: 'game', game: 'track', score: 10, seconds: 40, date: TODAY },
      { type: 'game', game: 'snake', score: 10, seconds: 90, date: TODAY },
      { type: 'breath', seconds: 300, date: TODAY },
      // Sahip kararı 2026-10-02: Oku ve Anla yolda; bugün bitirildi (yarıda kalan okuma tamam sayılmaz)
      { type: 'okuma-anlama', wpm: 220, correct: 3, valid: true, seconds: 120, date: TODAY },
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

  it('dünden 4 dk kaldıysa Isınma\'dan sonraki bütçeli duraktan önce "Burada 5 dk mola var"', () => {
    const p = path(NORMAL, [], { eye: { locked: false, due: null, used: 4 * MIN, budgetMs: 5 * MIN, leftMs: MIN } })
    expect(p.forcedRestBefore).toBe('routine:uzak')
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
    // Haftalık testin günü: Isınma'dan sonra sıradaki ölçüm (Haftalık E testi)
    const toTest = path([], s.slice(0, 1))
    expect(toTest.next.key).toBe('weekly')
    expect(['Odaklan', 'Odak sende']).toContain(jevLine(toTest, { day }).word)
    expect(jevLine(path([], s.slice(0, 1)), { day, gold: true }).word).not.toBe('Odaklan')
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

  it('bu hafta tamamlandıysa haftalık yolda yok, E testi de yok; bugün yarım başlarsa "Kalan" kartı döner', () => {
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
    // hafta tamam: 25'inin yolunda haftalık yok, kısa E testi de yok (karar 2026-09-29)
    const p = buildPath(registry.live, { tests: [...NORMAL.slice(3), ...full], sessions: [...SPAN3, ...STREET3], now: after })
    expect(keys(p)).not.toContain('weekly')
    expect(keys(p)).not.toContain('daily')
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

  // Bug 24: zaman saatle (> 7×24 sa) değil takvim günüyle. Aynı saatte açıp birkaç dakika sonra test eden kişiye test
  // 8 günde bir geliyor, 8. günün akşamı "tamam" olmuş yola yeni durak ekleniyordu.
  it('Bug 24: 1. gün 09.05\'te biten testten sonra 8. gün 09.00\'da zamanı gelmiş; 7. gün 23.30\'da gelmemiş', () => {
    const at = (d, h, m = 0) => new Date(2026, 9, 1 + d, h, m)
    const run = (d) => ['R', 'L', 'OU'].map((eye, i) => ({ type: 'va-weekly', eye, date: at(d, 9, 3 + i).toISOString(), runDay: dayKey(at(d, 9)) }))
    const tests = run(0)
    expect(weeklyStatus(tests, at(6, 23, 30))).toMatchObject({ state: 'idle', due: false })
    expect(weeklyStatus(tests, at(7, 0, 1))).toMatchObject({ state: 'due', due: true })
    expect(weeklyStatus(tests, at(7, 9, 0))).toMatchObject({ state: 'due', due: true })
    expect(isDueWeekly(tests[2], at(7, 9, 0))).toBe(true)
    // yol: 8. gün sabahı E durağı var; 8. gün testten sonra "tamam" kalır, akşam yeni durak gelmez
    const pathOn = (tsts, now) => buildPath(registry.live, { tests: tsts, sessions: [], now })
    expect(keys(pathOn(tests, at(7, 9, 0)))).toContain('weekly')
    const both = [...tests, ...run(7)]
    expect(pathOn(both, at(7, 23, 30)).stops.find((s) => s.key === 'weekly')).toMatchObject({ done: true })
    expect(weeklyStatus(both, at(14, 8, 0)).due).toBe(true) // 15. gün sabahı: bir hafta sonra yeniden
    expect(weeklyStatus(both, at(13, 22, 0)).due).toBe(false)
  })
  it('Bug 24: 12 hafta, her gün 09.00\'da açıp 09.05\'te test eden kişi haftalık testi 7 günde bir yapar', () => {
    const at = (d, h, m = 0) => new Date(2026, 9, 1 + d, h, m)
    const tests = []
    const days = []
    for (let d = 0; d < 84; d++) {
      if (!weeklyStatus(tests, at(d, 9, 0)).due) continue
      days.push(d + 1)
      for (const [i, eye] of ['R', 'L', 'OU'].entries()) tests.push({ type: 'va-weekly', eye, date: at(d, 9, 5 + i).toISOString(), runDay: dayKey(at(d, 9, 5)) })
    }
    expect(days).toEqual([1, 8, 15, 22, 29, 36, 43, 50, 57, 64, 71, 78])
  })

  it('atlanacak gözler: yarım günde bitenler; tam ya da boş günde yok', () => {
    expect(skipEyesToday(wk(['R'], TODAY), 'va-weekly', NOW)).toEqual(['R'])
    expect(skipEyesToday(wk(['R', 'L'], TODAY), 'va-weekly', NOW)).toEqual(['R', 'L'])
    expect(skipEyesToday(wk(['R', 'L', 'OU'], TODAY), 'va-weekly', NOW)).toEqual([])
    expect(skipEyesToday([], 'va-weekly', NOW)).toEqual([])
    expect(skipEyesToday([{ type: 'va-daily', eye: 'R', date: TODAY }], 'va-daily', NOW)).toEqual(['R'])
  })
})

describe('kısa E testi (isteğe bağlı): Bugün\'ün yolunda yok (karar 2026-09-29)', () => {
  const noDaily = (p) => expect(keys(p)).not.toContain('daily')
  it('hiçbir durumda yolda değil: ilk gün, normal gün, yarım ya da tam kısa test, yarım ya da tam haftalık', () => {
    for (const tests of [
      [],
      NORMAL,
      [...NORMAL, { type: 'va-daily', eye: 'R', date: TODAY }],
      [...NORMAL, ...DAILY_DONE],
      [...NORMAL, { type: 'va-daily', eye: 'R', date: daysAgo(1) }],
      [...NORMAL.slice(3), ...wk(['R'], TODAY)],
      [...NORMAL.slice(3), ...wk(['R', 'L', 'OU'], TODAY)],
      [...wk(['R', 'L', 'OU'], daysAgo(9))],
    ]) {
      noDaily(path(tests))
      noDaily(path(tests, [], { gate: { firstTestOnly: true } }))
    }
    expect(registry.get('daily').today({ tests: [], now: NOW })).toBeNull()
    // modül Ana sayfa → Ölçüm listesinde isteğe bağlı kalır (haftalık testin ardından)
    expect(registry.inSection('measure').map((m) => m.id).slice(0, 2)).toEqual(['weekly', 'daily'])
    expect(registry.get('daily')).toMatchObject({ title: 'Kısa E testi', label: 'kısa E testi' })
  })
  it('ilk günden haftada bir: 1. gün haftalık E testi yolda, 2.–7. günler E testi yok, 8. gün yeniden (haftalık akış aynı)', () => {
    const at = (d, h = 12) => new Date(2026, 8, 1 + d, h, 0)
    const done = (d) => wk(['R', 'L', 'OU'], at(d, 9).toISOString())
    const pathOn = (d, tests) => buildPath(registry.live, { tests, sessions: [], now: at(d) })
    // 1. gün, test öncesi: tek E durağı, haftalık, "3 bölüm · sağ, sol, iki göz"
    const first = pathOn(0, [])
    expect(first.stops.filter((s) => s.glyph === 'E').map((s) => [s.key, s.title, s.sub])).toEqual([['weekly', 'Haftalık E testi', WEEKLY_SUB]])
    // 1. gün, test sonrası: "✓ Bu hafta tamam"
    expect(pathOn(0, done(0)).stops.find((s) => s.key === 'weekly')).toMatchObject({ done: true, sub: WEEKLY_DONE })
    for (const d of [1, 2, 3, 4, 5, 6]) {
      const p = pathOn(d, done(0))
      expect(p.stops.some((s) => s.glyph === 'E'), `${d + 1}. gün`).toBe(false)
    }
    expect(keys(pathOn(7, done(0)))).toContain('weekly') // 8. gün öğlen (son test 9.00'da)
    noDaily(pathOn(7, done(0)))
  })
  it('yarım kısa test: kalan göz yalnız kayıtta (Ana sayfa satırı), yolda durak yok; ertesi gün baştan', () => {
    const half = [...NORMAL, { type: 'va-daily', eye: 'R', date: TODAY }]
    expect(eyeDay(half, 'va-daily', NOW)).toMatchObject({ started: true, complete: false, remaining: ['L'] })
    expect(skipEyesToday(half, 'va-daily', NOW)).toEqual(['R'])
    expect(skipEyesToday([...NORMAL, { type: 'va-daily', eye: 'R', date: daysAgo(1) }], 'va-daily', NOW)).toEqual([])
    noDaily(path(half))
  })
})

// Karar 2026-09-29 (sahibi): okuma testi haftalık E testinden ayrılır ve takvim günüyle gelir (readingStatus).
// Sahip kararı 2026-10-02: okuma testi sonsuz yoldan çıktı (modules/reading today() yok; Pratikler'de isteğe bağlı).
// readingStatus saf işlev olarak lib/today.js'te kalır; aşağıda eski senaryoların her birinde okuma testi yolda yoktur.
describe('okuma testi artık yolda yok; readingStatus saf işlev olarak takvim günüyle', () => {
  const bare = (tests = [], sessions = [], now = NOW) => keys(buildPath(registry.live, { tests, sessions, now }))
  const E = (date) => wk(['R', 'L', 'OU'], date)
  const R = (date) => ({ type: 'reading', date })
  it('1. gün hiç kayıt yok: E testi yolda, okuma testi yolda değil; readingStatus "yarına"', () => {
    expect(bare()).toContain('weekly')
    expect(bare()).not.toContain('reading')
    expect(readingStatus([], NOW)).toEqual({ state: 'later', due: true })
  })
  it('1. gün E testi bitti: okuma testi yolda değil', () => {
    expect(bare(E(TODAY))).not.toContain('reading')
  })
  it('2. gün: E testi dün bitti; ne okuma testi ne E testi yolda', () => {
    const k = bare(E(daysAgo(1)))
    expect(k).not.toContain('reading')
    expect(k).not.toContain('weekly')
  })
  it('aynı güne düşünce (ikisi de 7 gün önce): E testi yolda, okuma testi değil; readingStatus "yarına"', () => {
    const k = bare([...E(daysAgo(7)), R(daysAgo(7))])
    expect(k).toContain('weekly')
    expect(k).not.toContain('reading')
    expect(readingStatus([...E(daysAgo(7)), R(daysAgo(7))], NOW).state).toBe('later')
  })
  it('ertesi gün E testi bitmiş, okuma 8 gün önce: okuma testi yolda değil', () => {
    const k = bare([...E(daysAgo(1)), R(daysAgo(8))])
    expect(k).not.toContain('reading')
    expect(k).not.toContain('weekly')
  })
  it('E testi ve okuma 8 gün önce: E testi yolda, okuma testi değil', () => {
    const k = bare([...E(daysAgo(8)), R(daysAgo(8))])
    expect(k).toContain('weekly')
    expect(k).not.toContain('reading')
  })
  it('takvim günü: 7 gün önce 18.00\'de yapılan okuma için readingStatus bugün 10.00\'da "zamanı geldi"; yolda yine yok', () => {
    const r = R(new Date('2026-09-18T18:00:00').toISOString())
    expect(isDue(r, NOW)).toBe(false) // eski saat kuralı
    expect(readingStatus([...E(daysAgo(3)), r], NOW)).toEqual({ state: 'due', due: true })
    expect(bare([...E(daysAgo(3)), r])).not.toContain('reading')
  })
  it('6 gün önce yapıldıysa zamanı gelmedi; bugün yapıldıysa tamam; bugün yapılmış okuma testi yola durak eklemez', () => {
    expect(readingStatus([R(daysAgo(6))], NOW)).toEqual({ state: 'idle', due: false })
    expect(readingStatus([...E(TODAY), R(TODAY)], NOW)).toEqual({ state: 'done', due: false })
    const stop = buildPath(registry.live, { tests: [...E(TODAY), R(TODAY)], sessions: [], now: NOW }).stops.find((x) => x.key === 'reading')
    expect(stop).toBeUndefined()
  })
  it('hiç okuma yok, pratik kayıtları dün başladı: E testi yolda, okuma testi değil', () => {
    const k = bare([], [{ type: 'breath', seconds: 300, date: daysAgo(1) }])
    expect(k).toContain('weekly')
    expect(k).not.toContain('reading')
  })
})

// Sahip kararı 2026-10-02: yolda okuma testinin yerini Oku ve Anla aldı (modules/okuma-anlama). Son 7 günde 3 günden az
// bitirildiyse 2 dk'lık pratik durağı (göz bütçesinden); ilerleme açıkken 3. günden (lib/ladders.js UNLOCK pathDay 2).
// Bitirilmiş okuma = type 'okuma-anlama' ve sayısal correct; yarıda kalan (correct yok) yapılmış sayılmaz.
describe('Oku ve Anla: sonsuz yolda haftada 3 gün (okuma testinin yerine)', () => {
  const OA = registry.get('okuma-anlama')
  const read = (date, correct = 3) => ({ type: 'okuma-anlama', wpm: 220, correct, valid: true, seconds: 120, date })
  const has = (p) => keys(p).includes('okuma-anlama')
  it('ilerleme kapalıyken 3 günden az bitirildiyse durak: 2 dk, okuma testinin eski yerinde (slot measure), yol göz payı 0, düşmez', () => {
    expect(OA.gates.eyeBudget).toBe('eye') // modül kapısı: gerçek kullanım göz bütçesine sayılır
    expect(OA.today({ tests: [], sessions: [], now: NOW })).toEqual({ title: 'Oku ve Anla', minutes: 2, eyeMin: 0, slot: 'measure', weekDays: 0, done: false })
    expect(OA.today({ tests: [], sessions: [read(daysAgo(2)), read(daysAgo(1))], now: NOW })).toMatchObject({ weekDays: 2, done: false })
  })
  it('ilerleme kapalıyken yolda: okuma testinin eski senaryolarında Oku ve Anla 2. bölümde gelir; ölçüm sayılmaz, E testiyle yan yana değil', () => {
    const E = (date) => wk(['R', 'L', 'OU'], date)
    for (const [name, tests, sessions] of [
      ['1. gün', [], []],
      ['2. gün', E(daysAgo(1)), []],
      ['E testi zamanı', [...E(daysAgo(8)), { type: 'reading', date: daysAgo(8) }], []],
      ['normal gün', NORMAL, [...SPAN3, ...STREET3]],
    ]) {
      const p = buildPath(registry.live, { tests, sessions, now: NOW })
      const i = p.stops.findIndex((s) => s.key === 'okuma-anlama')
      expect(i, name).toBeGreaterThan(-1)
      expect(p.stops[i], name).toMatchObject({ block: 2, eyeMin: 0, kind: 'practice' })
      expect([p.stops[i - 1]?.key, p.stops[i + 1]?.key], name).not.toContain('weekly')
      expect(p.minutesLeft, name).toBeLessThanOrEqual(PATH.capMin)
    }
  })
  it('ilerleme açıkken 1. ve 2. gün yolda yok, 3. gün gelir (yeni); 3 gün bitirilince o hafta yolda yok', () => {
    const rows = y1Simulate(10)
    const day = (n) => rows.find((r) => r.n === n)
    expect(has(day(1).withY)).toBe(false)
    expect(has(day(2).withY)).toBe(false)
    expect(OA.today(day(2).ctx)).toBeNull() // pathDay 1 < UNLOCK 2
    expect(day(3).withY.stops.find((s) => s.key === 'okuma-anlama')).toMatchObject({ minutes: 2, eyeMin: 0, block: 2, done: false })
    expect(day(3).fresh).toContain('okuma-anlama')
    expect([3, 4, 5].map((n) => has(day(n).withY))).toEqual([true, true, true])
    // 3., 4. ve 5. gün bitirildi: son 7 günde 3 gün → 6.–10. gün yolda yok
    for (const n of [6, 7, 8, 9, 10]) {
      expect(has(day(n).withY), `gün ${n}`).toBe(false)
      expect(OA.today(day(n).ctx), `gün ${n}`).toBeNull()
    }
  })
  it('bugün bitirildiyse haftanın 3. günü olsa da durak kalır ve tamam görünür; bitirilmeden 3 gün dolduysa yok', () => {
    const three = [read(daysAgo(2)), read(daysAgo(1)), read(TODAY)]
    expect(OA.today({ tests: [], sessions: three, now: NOW })).toMatchObject({ weekDays: 3, done: true })
    const stop = buildPath(registry.live, { tests: NORMAL, sessions: [...SPAN3, ...STREET3, ...three], now: NOW }).stops.find((s) => s.key === 'okuma-anlama')
    expect(stop?.done).toBe(true)
    const before = [read(daysAgo(3)), read(daysAgo(2)), read(daysAgo(1))]
    expect(OA.today({ tests: [], sessions: before, now: NOW })).toBeNull()
    expect(keys(buildPath(registry.live, { tests: NORMAL, sessions: [...SPAN3, ...STREET3, ...before], now: NOW }))).not.toContain('okuma-anlama')
  })
  it('yarıda kalan okuma (correct: null) yapılmış sayılmaz: hafta dolmaz, bugün de tamam değil', () => {
    const abandoned = [read(daysAgo(3), null), read(daysAgo(2), null), read(daysAgo(1), null), read(TODAY, null)]
    expect(OA.today({ tests: [], sessions: abandoned, now: NOW })).toMatchObject({ weekDays: 0, done: false })
    // bir tanesi bitirilmişse yalnız o sayılır
    expect(OA.today({ tests: [], sessions: [...abandoned, read(daysAgo(2))], now: NOW })).toMatchObject({ weekDays: 1, done: false })
  })
})

// =============================================================================================================
// Sonsuz yol Y1 (SONSUZ_YOL.PLAN.v1 §3.A.9, §3.G.6). ctx.progression Ana sayfadaki gibi lib/progression.js
// progressionCtx ile, kayıtlardan kurulur. Yoga iPhone'daki gibi (lib/yoga.js yogaPathStop; bütün dersler yayımlı).
const Y1_TITLES = { 1: 'Nefesin Ritmi', 2: 'Derin Dinlenme', 3: 'Uykuya Geçiş', 4: 'Zor Anlar İçin', 5: 'Tek Nokta', 6: 'Sabah Niyeti', 7: 'Kendine Şefkat', 8: 'Sağlam Yer', 9: 'Kendini Tanımak', 10: 'Gelecekteki Sen' }
const Y1_PUB = { 1: [3, 5, 15], 2: [5, 15], 3: [5, 15], 4: [3, 5, 15], 5: [3, 5, 15], 6: [3, 5, 15], 7: [5, 15], 8: [3, 5, 15], 9: [3, 5, 15], 10: [3, 5, 15] }
const Y1_DATA = { LESSONS: Object.fromEntries(Object.entries(Y1_TITLES).map(([k, title]) => [k, { title }])), publishedMinutes: (id) => Y1_PUB[id] ?? [] }
const Y1_YOGA = { id: 'yoga', title: 'Yoga', label: 'yoga', kind: 'practice', ring: 'life', gates: {}, routes: ['yoga'], home: { section: 'practice', order: 33 }, sessions: { match: (s) => s?.type === 'yoga' }, today: (ctx) => yogaPathStop(ctx, Y1_DATA) }
const Y1_LIVE = registry.live.filter((m) => m.id !== 'yoga')
const Y1_ALL = [...Y1_LIVE, Y1_YOGA]
const y1Total = (p) => p.stops.reduce((a, s) => a + (s.minutes ?? 0), 0)
const y1NoYoga = (p) => JSON.stringify(p.stops.filter((s) => s.id !== 'yoga').map((s) => [s.key, s.block, s.minutes, s.done, s.locked, s.title]))

// Yolu kuran kişinin bıraktığı kayıt; basamaklı duraklarda Y1'in yazdığı stage alanıyla (Dstage)
function y1Record(s, now, tests, sessions) {
  const date = new Date(now.getTime() + MIN).toISOString()
  const runDay = dayKey(now)
  const stage = s.stage?.id ?? undefined
  if (s.id === 'weekly') for (const eye of ['R', 'L', 'OU']) tests.push({ type: 'va-weekly', eye, date, runDay })
  else if (s.id === 'reading') tests.push({ type: 'reading', date, runDay })
  else if (s.id === 'routine') sessions.push({ type: 'routine', setId: s.key.split(':')[1], seconds: 60, date, ...(stage ? { stage } : {}) })
  else if (s.id === 'snake' || s.id === 'track') sessions.push({ type: 'game', game: s.id, date })
  else if (s.id === 'breath') sessions.push({ type: 'breath', seconds: (s.minutes ?? 5) * 60, date, ...(stage ? { stage } : {}) })
  else if (s.id === 'fark-ettin') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
  else if (s.id === 'tek-bakis') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
  else if (s.id === 'notice') sessions.push({ type: 'notice', count: 2, date, seconds: 60 })
  // Oku ve Anla bitirilmiş okuma: 4 sorudan 3'ü doğru (yarıda kalan okuma, correct yok, yapılmış sayılmaz)
  else if (s.id === 'okuma-anlama') sessions.push({ type: 'okuma-anlama', wpm: 220, correct: 3, valid: true, date, seconds: 120 })
  else if (s.id === 'yoga') sessions.push({ type: 'yoga', lesson: s.stage.lesson, planned: s.minutes * 60, seconds: s.minutes * 60, reachedClosing: true, completed: true, date })
  else sessions.push({ type: s.id, date, seconds: 60 })
}
// Her gün (hour) açıp yolu sırayla bitiren yeni kullanıcı; skip: açılmayan günler
function y1Simulate(days, { hour = 10, skip = [] } = {}) {
  const tests = []
  const sessions = []
  const out = []
  for (let n = 1; n <= days; n++) {
    if (skip.includes(n)) continue
    const now = new Date(2026, 9, n, hour)
    const base = { tests: [...tests], sessions: [...sessions], now }
    const progression = progressionCtx({ ...base, modules: Y1_ALL })
    const ctx = { ...base, progression }
    const withY = buildPath(Y1_ALL, ctx)
    const noY = buildPath(Y1_LIVE, ctx)
    out.push({ n, ctx, withY, noY, yoga: withY.stops.find((s) => s.id === 'yoga') ?? null, fresh: newStopKeys(ctx, withY.stops) })
    for (const s of withY.stops) y1Record(s, now, tests, sessions)
  }
  return out
}

describe('Sonsuz yol · ilerleme açık, yeni kullanıcı (§3.A.9: her gün 10.00, her durak, 5 dk göz bütçesi)', () => {
  const rows = y1Simulate(45)
  const day = (n, list = rows) => list.find((r) => r.n === n)
  const stopOf = (p, key) => p.stops.find((s) => s.key === key)
  it('1. gün (8 dk): Haftalık E testi, Çemberler, Nefes 1 dk, Göz kırpma; "Yeni" rozeti yok', () => {
    const r = day(1)
    expect(keys(r.withY)).toEqual(['weekly', 'track', 'breath', 'routine:kirpma'])
    expect(r.withY.stops.map((s) => s.block)).toEqual([1, 1, 0, 2])
    expect(stopOf(r.withY, 'breath').minutes).toBe(1)
    expect(y1Total(r.withY)).toBe(8)
    expect(r.yoga).toBeNull()
    expect(r.fresh).toEqual([])
  })
  // Sahip kararı 2026-10-02: okuma testi yolda değil (eskiden 2. gün 3 dk); Oku ve Anla 3. günden
  it('2. gün (8 dk): Sağ–sol, Nefes 2 dk, Yılan ve Bugünün görevi gelir; yenileri rozetli', () => {
    const r = day(2)
    expect(keys(r.withY)).toEqual(['routine:isinma', 'track', 'breath', 'routine:kirpma', 'snake', 'notice'])
    expect(stopOf(r.withY, 'routine:isinma').title).toBe('Sağ–sol')
    expect(stopOf(r.withY, 'breath').minutes).toBe(2)
    expect(y1Total(r.withY)).toBe(8)
    expect(r.fresh).toEqual(['routine:isinma', 'breath', 'snake', 'notice'])
  })
  it('3. gün (14 dk): "üçü birlikte" (Isınma), Nefes 3 dk, Oku ve Anla (açıldığı gün, 2. bölümde), yoga', () => {
    const r = day(3)
    expect(stopOf(r.withY, 'routine:isinma').title).toBe('Isınma')
    expect(stopOf(r.withY, 'breath').minutes).toBe(3)
    expect(stopOf(r.withY, 'okuma-anlama')).toMatchObject({ minutes: 2, block: 2 })
    expect(r.yoga).toMatchObject({ minutes: 3 })
    expect(y1Total(r.withY)).toBe(14)
    expect(r.fresh).toEqual(['routine:isinma', 'breath', 'okuma-anlama', 'yoga'])
  })
  it('4. gün (15 dk): Yukarı–aşağı ve Oku ve Anla 2. bölümde; yoga son durak, Bugünün görevi\'nden önce', () => {
    const r = day(4)
    expect(keys(r.withY)).toEqual(['routine:isinma', 'track', 'breath', 'routine:dikey', 'okuma-anlama', 'routine:kirpma', 'snake', 'yoga', 'notice'])
    expect(stopOf(r.withY, 'routine:dikey')).toMatchObject({ title: 'Yukarı–aşağı', block: 2, minutes: 1 })
    expect(y1Total(r.withY)).toBe(15)
    expect(r.fresh).toEqual(['routine:dikey'])
  })
  it('5.–7. gün: Uzağa bakış (5.), Fark Ettin mi? (6., Yılan düşer), Yakın–uzak (7.)', () => {
    expect(day(5).fresh).toEqual(['routine:uzak'])
    expect(keys(day(6).withY)).toContain('fark-ettin')
    expect(keys(day(6).withY)).not.toContain('snake')
    expect(day(6).fresh).toEqual(['fark-ettin'])
    expect(day(7).fresh).toEqual(['routine:yakinuzak'])
    // 5. gün Oku ve Anla'nın bu haftaki 3. günü (+2 dk; Yılan yerinde)
    expect([5, 6, 7].map((n) => y1Total(day(n).withY))).toEqual([16, 14, 15])
  })
  it('8. gün (17 dk): Haftalık E testi ve Tek Bakışta; nefeste "günün ritmi"; Yılan düşer, yoga yok (E testi günü)', () => {
    const r = day(8)
    expect(keys(r.withY)).toEqual(['routine:isinma', 'weekly', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:dikey', 'routine:kirpma', 'tek-bakis', 'notice'])
    expect(y1Total(r.withY)).toBe(17)
    expect(r.yoga).toBeNull()
    expect(stopOf(r.withY, 'breath').stage).toMatchObject({ tier: 'B', minutes: 3 })
    expect(r.fresh).toEqual(['breath', 'tek-bakis'])
  })
  // Sahip kararı 2026-10-02: okuma testi yolda değil (eskiden 9. gün 3 dk); Oku ve Anla bu hafta 3 gün yapıldı (3.–5.)
  it('9. gün (15 dk): Daire (Yukarı–aşağı ile gün aşırı), yoga; bugünkü beş gruplu yapıya ulaşıldı', () => {
    const r = day(9)
    expect(keys(r.noY)).toEqual(['routine:isinma', 'routine:uzak', 'track', 'routine:yakinuzak', 'breath', 'routine:daire', 'routine:kirpma', 'tek-bakis', 'notice'])
    expect(r.yoga).toMatchObject({ minutes: 3, block: 2 })
    expect(y1Total(r.withY)).toBe(15)
    expect(r.fresh).toEqual(['routine:daire'])
    // 10.–45. gün: Daire ve Yukarı–aşağı gün aşırı (günde biri, art arda aynısı yok)
    const donus = rows.filter((x) => x.n >= 9).map((x) => keys(x.withY).filter((k) => k === 'routine:daire' || k === 'routine:dikey'))
    for (const d of donus) expect(d).toHaveLength(1)
    for (let i = 1; i < donus.length; i++) expect(donus[i][0], `gün ${i + 9}`).not.toBe(donus[i - 1][0])
  })
  // Sahip kararı 2026-10-02: okuma testi (haftada bir 3 dk) yerine Oku ve Anla (haftada 3 gün 2 dk); en uzun gün E testi
  // ile Oku ve Anla'nın birlikte geldiği gün (29.: 19 dk)
  it('ilk 30 gün: ortalama 15,6, en kısa 8, en uzun 19; 20 dk\'yı aşan gün yok; yoga 24 günde; 45 günün hiçbiri 20 dk\'yı aşmaz', () => {
    const t30 = rows.slice(0, 30).map((r) => y1Total(r.withY))
    expect(Math.min(...t30)).toBe(8)
    expect(Math.max(...t30)).toBe(19)
    expect((t30.reduce((a, b) => a + b, 0) / 30).toFixed(1)).toBe('15.6')
    expect(rows.slice(0, 30).filter((r) => r.yoga).length).toBe(24)
    for (const r of rows) expect(y1Total(r.withY), `gün ${r.n}`).toBeLessThanOrEqual(PATH.capMin)
  })
  it('yoga dışındaki duraklar yogalı ve yogasız yolda birebir aynı (45 gün; 19.00; uzun dönüş)', () => {
    for (const list of [rows, y1Simulate(45, { hour: 19 }), y1Simulate(40, { skip: Array.from({ length: 16 }, (_, i) => 13 + i) })]) {
      for (const r of list) expect(y1NoYoga(r.withY), `gün ${r.n}`).toBe(y1NoYoga(r.noY))
    }
  })
  // Sahip kararı 2026-10-02: okuma testinin yerine Oku ve Anla (son 7 günde yapılmadı → yolda)
  it('29. gün uzun dönüş (13.–28. gün açılmadı): yumuşak gün, E testi ve Oku ve Anla birlikte; Yılan ve yoga düşer; ertesi gün 17 dk', () => {
    const gap = y1Simulate(40, { skip: Array.from({ length: 16 }, (_, i) => 13 + i) })
    const r = day(29, gap)
    expect(keys(r.withY)).toEqual(expect.arrayContaining(['weekly', 'okuma-anlama', 'notice']))
    expect(keys(r.withY)).not.toContain('reading')
    expect(keys(r.withY)).not.toContain('snake')
    expect(r.yoga).toBeNull()
    expect(stopOf(r.withY, 'breath')).toMatchObject({ minutes: 2, stage: { soft: true } }) // bir basamak aşağı
    expect(keys(r.withY)).toContain('routine:dikey') // göz: K6 (yumuşak), Daire yok
    expect(keys(r.withY)).not.toContain('routine:daire')
    expect(y1Total(r.withY)).toBeLessThanOrEqual(PATH.capMin)
    expect(r.fresh).toEqual([]) // yumuşak günde yeni basamak yok
    const next = day(30, gap)
    expect(stopOf(next.withY, 'breath')).toMatchObject({ minutes: 3, stage: { soft: false } })
    expect(y1Total(next.withY)).toBe(17) // Oku ve Anla bu haftanın 2. günü
    // sayı sıfırlanmaz: basamak kaldığı yerden
    expect(next.ctx.progression.mod.routine.D).toBe(13)
  })
  it('ara kilidi: 1. ve 2. gün 1–2 dk nefesten sonra mola başlamaz; 7. günden (1. bölüm 4 dk göz) bugünkü kural', () => {
    const st = (used) => ({ locked: false, due: null, used, budgetMs: 5 * MIN, leftMs: 5 * MIN - used })
    expect(restDecision(st(MIN), day(1).withY, day(1).ctx.progression)).toBeNull()
    expect(restDecision(st(2 * MIN), day(2).withY, day(2).ctx.progression)).toBeNull()
    expect(restDecision(st(4 * MIN), day(7).withY, day(7).ctx.progression)).toBe('path')
    expect(restDecision(st(4 * MIN), day(9).withY, day(9).ctx.progression)).toBe('path')
  })
  it('ara kilidi gerçekçi kullanılan sürelerde (1. bölüm 1,6–2,6 dk): 3. günden her zaman 5 dk mola, bant ve baloncuk 5 dk; 2. gün §3.A.8-6', () => {
    const st = (u) => ({ locked: false, due: null, used: u * MIN, budgetMs: 5 * MIN, leftMs: (5 - u) * MIN })
    const done1 = (r) => {
      const stops = r.withY.stops.map((s) => (s.block === 1 ? { ...s, done: true } : s))
      const blocks = r.withY.blocks.map((b, i) => (i === 0 ? { ...b, eyeDone: b.eyeMin } : b))
      return { ...r.withY, stops, blocks }
    }
    for (const u of [1.6, 1.8, 2.0, 2.2, 2.4, 2.6]) {
      for (const n of [3, 4, 5]) {
        expect(restDecision(st(u), day(n).withY, day(n).ctx.progression), `gün ${n}, ${u} dk`).toBe('path')
        expect(pathRestMinutes(st(u), done1(day(n)), day(n).ctx.progression), `gün ${n}, ${u} dk`).toBe(5)
      }
      // 2. gün (2 dk nefes, 2. bölümde 3 dk göz): kullanılan + 3 > 5 ise mola
      expect(restDecision(st(u), day(2).withY, day(2).ctx.progression), `gün 2, ${u} dk`).toBe(u > 2 ? 'path' : null)
      expect(pathRestMinutes(st(u), done1(day(2)), day(2).ctx.progression), `gün 2, ${u} dk`).toBe(u > 2 ? 5 : 2)
    }
    // 3. gün sabah (hiç göz çalışması yok) bant 5 dk: 1. bölümün 2 dk'sı eklenir
    expect(pathRestMinutes(st(0), day(3).withY, day(3).ctx.progression)).toBe(5)
    expect(pathRestMinutes(st(0), day(1).withY, day(1).ctx.progression)).toBe(1)
  })
})

// ---------------------------------------------------------------------------------------------------------------
// Kalıcı eşdeğerlik (§3.G.6). HEAD'deki (Y1 öncesi, e19d81f) manifestlerin today() gövdeleri, değiştirilmeden:
// ilerleme kapalıyken yol bunlarla birebir aynıdır; ilerleme açıkken eski kullanıcıda fark yalnız izinli listededir.
const Y0_GROUPS = [['isinma', 'Isınma', 'arrows', { slot: 'warmup', order: 10 }], ['uzak', 'Uzağa bakış', 'far', { slot: 'body', order: 30 }], ['yakinuzak', 'Yakın–uzak', 'nearfar', { slot: 'body', order: 50 }], ['daire', 'Daire', 'circle', { slot: 'body', order: 70, dropRank: 3 }], ['kirpma', 'Göz kırpma', 'lid', { slot: 'body', order: 90 }]]
const y0Days = (list, now) => new Set(withinDays(list, now).map((s) => new Date(s.date).toDateString())).size
const Y0 = {
  breath: ({ sessions, now }) => ({ title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: 5, route: 'breath-rest', slot: 'rest', glyph: 'moon', done: sessions.some((s) => isBreath(s) && s.seconds >= 60 && isSameDay(s, now)) }),
  routine: ({ sessions, now }) => {
    const ids = new Set(sessions.filter((s) => s.type === 'routine' && isSameDay(s, now)).map((s) => s.setId))
    return Y0_GROUPS.map(([id, title, glyph, place]) => ({ key: id, title, minutes: 1, glyph, route: `routine-${id}`, done: ids.has(id), ...place }))
  },
  snake: ({ sessions, now }) => ({ title: 'Yılan', sub: '1 tur', minutes: 2, slot: 'open', glyph: 'snake', openEnded: true, game: true, dropRank: 1, done: sessions.some((s) => s.type === 'game' && s.game === 'snake' && isSameDay(s, now)) }),
  notice: ({ sessions, now }) => (sessions.some(isNotice) ? { title: 'Bugünün görevi', minutes: 1, slot: 'finale', glyph: 'spark', dropRank: 2, done: sessions.some((s) => s.type === 'notice' && isSameDay(s, now)) } : null),
  'fark-ettin': ({ sessions, now }) => {
    const done = sessions.some((s) => isStreet(s) && isSameDay(s, now))
    const days = y0Days(sessions.filter(isStreet), now)
    return !done && days >= 3 ? null : { title: 'Fark Ettin mi?', minutes: 2, slot: 'body', order: 65, glyph: 'street', dropRank: 1.6, rotate: 'week3', weekDays: days, done }
  },
  'tek-bakis': ({ sessions, now, profile }) => {
    if (profile && profileSignals(profile).flashSafe === false) return null
    const done = sessions.some((s) => isSpan(s) && isSameDay(s, now))
    const days = y0Days(sessions.filter(isSpan), now)
    return !done && days >= 3 ? null : { title: 'Tek Bakışta', minutes: 2, slot: 'body', order: 95, glyph: 'span', dropRank: 1.5, rotate: 'week3', weekDays: days, done }
  },
}
const Y0_MODS = Y1_ALL.map((m) => (Y0[m.id] ? { ...m, today: Y0[m.id] } : m))
// HEAD screens/Home.jsx: yoldaki Nefes durağı molayı ne zaman başlatır
const y0Rest = (st) => (!st.locked && (st.due || st.used >= PATH.restMinUsed * MIN) ? (st.due && st.due !== 'budget' ? st.due : 'path') : null)
const y1Whole = (p) => JSON.stringify({ s: p.stops, n: p.next?.key ?? null, a: p.allDone, m: p.minutesLeft, b: p.blocks, r: p.restIndex, f: p.forcedRestBefore })

function y1Rng(seed) {
  let x = seed
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648)
  return { rnd, pick: (a) => a[Math.floor(rnd() * a.length)] }
}

describe('Kalıcı eşdeğerlik: ilerleme kapalı (ctx.progression yok) → Y1 öncesi yolla 0 fark', () => {
  it('rastgele 3000 bağlam: durakların bütün alanları, bölümler, sıradaki, allDone, minutesLeft, mola ve kilit; ara kilidi; Bugünün görevi', () => {
    const { rnd, pick } = y1Rng(4242)
    const DAYMS = 86400000
    for (let i = 0; i < 3000; i++) {
      const now = new Date(2026, 8, 1 + Math.floor(rnd() * 60), Math.floor(rnd() * 24))
      const ago = (d) => new Date(now.getTime() - d * DAYMS - Math.floor(rnd() * 3) * 3600000).toISOString()
      const tests = []
      const sessions = []
      for (let j = Math.floor(rnd() * 8); j > 0; j--) {
        const d = Math.floor(rnd() * 16)
        const t = pick(['va-weekly', 'va-weekly', 'reading', 'va-daily'])
        if (t === 'reading') tests.push({ type: t, date: ago(d) })
        else for (const eye of (t === 'va-weekly' ? ['R', 'L', 'OU'] : ['R', 'L']).filter(() => rnd() < 0.85)) tests.push({ type: t, eye, date: ago(d) })
      }
      for (let j = Math.floor(rnd() * 25); j > 0; j--) {
        const date = ago(Math.floor(rnd() * 9))
        const k = pick(['routine', 'game-snake', 'game-track', 'breath', 'span', 'street', 'quick-look', 'notice', 'yoga'])
        if (k === 'routine') sessions.push({ type: 'routine', setId: pick(['isinma', 'uzak', 'yakinuzak', 'daire', 'dikey', 'kirpma', 'normal']), date })
        else if (k.startsWith('game')) sessions.push({ type: 'game', game: k.slice(5), date })
        else if (k === 'breath') sessions.push({ type: 'breath', seconds: pick([30, 60, 180, 300]), date, ...(rnd() < 0.1 ? { strained: true } : {}) })
        else if (k === 'span') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
        else if (k === 'street') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
        else if (k === 'yoga') sessions.push({ type: 'yoga', lesson: pick([1, 2, 5, 6, 8, 9]), planned: pick([3, 5, 15]) * 60, date, completed: rnd() < 0.8, reachedClosing: true })
        else sessions.push({ type: k, date, seconds: 60, count: 2 })
      }
      sessions.sort((a, b) => a.date.localeCompare(b.date))
      tests.sort((a, b) => a.date.localeCompare(b.date))
      const eye = rnd() < 0.5 ? undefined : { locked: rnd() < 0.2, due: rnd() < 0.3 ? pick(['budget', 'hourly', 'daily']) : null, used: Math.floor(rnd() * 7) * MIN, budgetMs: pick([5, 3]) * MIN, leftMs: 2 * MIN }
      const ctx = { tests, sessions, now, eye, profile: rnd() < 0.2 ? { seizure: pick(['yes', 'no', 'unsure']) } : undefined, gate: { firstTestOnly: rnd() < 0.1 }, later: rnd() < 0.2 ? { day: dayKey(now), later: ['yoga'] } : null }
      const a = buildPath(Y0_MODS, ctx)
      const b = buildPath(Y1_ALL, ctx)
      expect(y1Whole(b), `bağlam ${i}`).toBe(y1Whole(a))
      const st = eye ?? { locked: false, due: null, used: Math.floor(rnd() * 7) * MIN, budgetMs: 5 * MIN }
      expect(restDecision(st, b, undefined)).toBe(y0Rest(st))
      expect(JSON.stringify(registry.get('notice').today(ctx))).toBe(JSON.stringify(Y0.notice(ctx)))
    }
  }, 60000)
})

describe('Kalıcı eşdeğerlik: ilerleme açık, eski kullanıcı → fark yalnız izinli listede', () => {
  // İzinli liste (§3.G.6): nefesin yol payı (5 → 3 dk; dün "Zorlandım" ise 2) ve kalıbı (stage), Daire ile Yukarı–aşağı'nın
  // gün aşırı dönüşümü, göz çeşitlemeleri (stage; tam set günü), Bugünün görevi'nin yola girmesi, "Yeni" rozeti.
  // Öteki modüllerin today() çıktısı birebir aynı; yol motoru (lib/today.js) değişmediği için bölüm, sıra ve düşme kuralı
  // aynıdır. HEAD'deki hiçbir durak kaybolmaz; nefesin kısalması 20 dk sınırında yer açtığı için HEAD'de sınırdan
  // düşen bir durak ya da yoga artık yolda olabilir.
  const DONUS = ['routine:daire', 'routine:dikey']
  const canon = (k) => (DONUS.includes(k) ? 'routine:DONUS' : k)
  function oldUser(rnd, pick) {
    const now = new Date(2026, 8, 1 + Math.floor(rnd() * 60), Math.floor(rnd() * 24), Math.floor(rnd() * 60))
    const H = 85 + Math.floor(rnd() * 40)
    const S = Math.floor(rnd() * 61)
    const last = 1 + Math.floor(rnd() * 13)
    const days = []
    for (let k = H; k >= last; k--) if (k === last || rnd() < 0.95) days.push(k)
    const off = Math.floor(rnd() * 7)
    const tried = rnd() < 0.7
    const tests = []
    const sessions = []
    days.forEach((k, idx) => {
      const date = new Date(now.getTime() - k * 86400000 + (Math.floor(rnd() * 10) - 5) * 3600000)
      const iso = (m) => new Date(date.getTime() + m * MIN).toISOString()
      const staged = days.length - idx <= S
      const st = (v) => (staged ? { stage: v } : {})
      for (const g of ['isinma', 'uzak', 'yakinuzak', staged && rnd() < 0.5 ? 'dikey' : 'daire', 'kirpma']) if (rnd() < 0.92) sessions.push({ type: 'routine', setId: g, seconds: 40, date: iso(1), ...st('K7') })
      if (rnd() < 0.92) sessions.push({ type: 'breath', seconds: pick([300, 300, 180, 60]), date: iso(2), ...st('N3'), ...(rnd() < 0.02 ? { strained: true } : {}) })
      if (rnd() < 0.85) sessions.push({ type: 'game', game: 'track', date: iso(3) })
      if (rnd() < 0.6) sessions.push({ type: 'game', game: 'snake', date: iso(4) })
      if (tried && rnd() < 0.6) sessions.push({ type: 'notice', count: 2, date: iso(5), seconds: 60 })
      if (rnd() < 0.4) sessions.push({ type: 'span', span: 8, date: iso(6), seconds: 60 })
      if (rnd() < 0.4) sessions.push({ type: 'street', noticed: 2, asked: 3, date: iso(7), seconds: 60 })
      if (rnd() < 0.5) sessions.push({ type: 'yoga', lesson: pick([1, 2, 5, 6, 8, 9]), planned: pick([3, 3, 5]) * 60, date: iso(8), completed: true, reachedClosing: true })
      if ((k + off) % 7 === 0) for (const [j, eye] of ['R', 'L', 'OU'].entries()) tests.push({ type: 'va-weekly', eye, date: iso(9 + j), runDay: dayKey(date) })
      if ((k + off) % 7 === 6) tests.push({ type: 'reading', date: iso(12), runDay: dayKey(date) })
    })
    for (const g of ['isinma', 'uzak', 'daire', 'dikey', 'kirpma']) if (rnd() < 0.2) sessions.push({ type: 'routine', setId: g, seconds: 40, date: new Date(now.getTime() - 60000).toISOString(), stage: 'K7' })
    if (rnd() < 0.2) sessions.push({ type: 'breath', seconds: 180, date: new Date(now.getTime() - 60000).toISOString(), stage: 'N3' })
    sessions.sort((a, b) => a.date.localeCompare(b.date))
    tests.sort((a, b) => a.date.localeCompare(b.date))
    const eye = rnd() < 0.5 ? undefined : { locked: rnd() < 0.2, due: rnd() < 0.3 ? pick(['budget', 'hourly', 'daily']) : null, used: Math.floor(rnd() * 7) * MIN, budgetMs: pick([5, 3]) * MIN, leftMs: 2 * MIN }
    return { tests, sessions, now, eye, profile: rnd() < 0.2 ? { seizure: pick(['yes', 'no', 'unsure']) } : undefined, later: rnd() < 0.2 ? { day: dayKey(now), later: ['yoga'] } : null }
  }
  it('rastgele 120 uzun geçmişli kullanıcı (routine ve breath D ≥ 60, Dstage 0–60, son 13 günde yapılmış)', () => {
    const { rnd, pick } = y1Rng(777)
    let dikey = 0
    let notice = 0
    for (let i = 0; i < 120; i++) {
      const ctx = oldUser(rnd, pick)
      const progression = progressionCtx({ tests: ctx.tests, sessions: ctx.sessions, now: ctx.now, modules: Y1_ALL, later: ctx.later })
      expect(progression.mod.routine.D).toBeGreaterThanOrEqual(60)
      expect(progression.mod.breath.D).toBeGreaterThanOrEqual(60)
      const cb = { ...ctx, progression }
      // (a) manifest katmanı
      for (const m of Y1_ALL) {
        const a = Y0[m.id] ? Y0[m.id](ctx) : m.today?.(ctx) ?? null
        const b = m.today?.(cb) ?? null
        if (m.id === 'breath') {
          expect(b.minutes).toBeLessThanOrEqual(3)
          const { minutes, stage, sub, ...rb } = b
          const { minutes: _m, sub: _s, ...ra } = a
          expect(rb, `bağlam ${i} breath`).toEqual(ra)
        } else if (m.id === 'routine') {
          const strip = (list) => list.filter((g) => !['daire', 'dikey', 'kirpma', 'normal'].includes(g.key) || !b.some((x) => x.key === 'normal')).map(({ stage, weekDays, rotate, ...g }) => (['daire', 'dikey'].includes(g.key) ? { key: 'DONUS' } : g))
          const sb = strip(b)
          expect(sb.filter((g) => g.key !== 'DONUS'), `bağlam ${i} routine`).toEqual(strip(a).filter((g) => g.key !== 'DONUS'))
          if (b.some((g) => g.key === 'dikey')) dikey++
        } else if (m.id === 'notice') {
          if (a) expect(b, `bağlam ${i} notice`).toEqual(a)
          else if (b) notice++
        } else expect(JSON.stringify(b), `bağlam ${i} ${m.id}`).toBe(JSON.stringify(a))
      }
      // (b) yol katmanı: HEAD'deki durak kaybolmaz, ortak durakların sırası ve bölümü aynı
      const pa = buildPath(Y0_MODS, ctx)
      const pb = buildPath(Y1_ALL, cb)
      const full = pb.stops.some((s) => s.key === 'routine:normal')
      const ka = pa.stops.map((s) => canon(s.key)).filter((k) => !(full && (k === 'routine:DONUS' || k === 'routine:kirpma')))
      const kb = pb.stops.map((s) => canon(s.key)).filter((k) => k !== 'routine:normal')
      const back = kb.filter((k) => !ka.includes(k) && k !== 'notice')
      const lost = ka.filter((k) => !kb.includes(k) && !(k === 'yoga' && back.length))
      expect(lost, `bağlam ${i}`).toEqual([])
      const common = (list, other) => list.filter((s) => other.includes(canon(s.key))).map((s) => [canon(s.key), s.block])
      expect(common(pb.stops, ka), `bağlam ${i}`).toEqual(common(pa.stops.filter((s) => !(full && ['routine:daire', 'routine:kirpma'].includes(s.key))), kb))
      expect(restDecision(ctx.eye ?? { locked: false, due: null, used: 2 * MIN, budgetMs: 5 * MIN }, pb, progression)).toBe(y0Rest(ctx.eye ?? { locked: false, due: null, used: 2 * MIN, budgetMs: 5 * MIN }))
    }
    expect(dikey).toBeGreaterThan(0)
    expect(notice).toBeGreaterThan(0)
  }, 60000)
  // §3.G.6 izinli listesine eklenen iki fark (Y1 kod raporu; sahibe tek cümle): (1) nefes 5 → 3 dk kısaldığı için yol
  // 20 dk sınırında yer açar: HEAD'in sınırdan düşürdüğü durak (çoğu Daire ya da Yukarı–aşağı, Fark Ettin mi?, yoga) yolda
  // kalır; yoga (R7b) ancak geri gelen durak ya da yola giren Bugünün görevi yüzünden sığmadığında yer verir.
  // (2) 14+ gün sonra dönen eski kullanıcı o gün yumuşak gün görür (§3.A.8-1: bir basamak aşağı, nefes 2 dk).
  const total = (p) => p.stops.reduce((a, x) => a + (x.minutes ?? 0), 0)
  it('fark (1): geri gelen durak HEAD\'de 20 dk sınırından düşmüştü; yoga yalnız sığmadığında yer verir; yol 20 dk\'yı aşmaz', () => {
    const { rnd, pick } = y1Rng(9191)
    let back = 0
    let yogaGave = 0
    for (let i = 0; i < 150; i++) {
      const ctx = oldUser(rnd, pick)
      const progression = progressionCtx({ tests: ctx.tests, sessions: ctx.sessions, now: ctx.now, modules: Y1_ALL, later: ctx.later })
      const pa = buildPath(Y0_MODS, ctx)
      const pb = buildPath(Y1_ALL, { ...ctx, progression })
      const full = pb.stops.some((x) => x.key === 'routine:normal')
      const ka = pa.stops.map((x) => canon(x.key)).filter((k) => !(full && (k === 'routine:DONUS' || k === 'routine:kirpma')))
      // bugün yapılmış durak hiç düşmez (lib/today.js dropOne); HEAD'de olmayan Yukarı–aşağı bugün yapıldıysa dönüşümün işidir
      const returned = pb.stops.filter((x) => !ka.includes(canon(x.key)) && x.id !== 'notice' && x.key !== 'routine:normal' && !x.done)
      for (const x of returned) {
        expect(total(pa) + x.minutes, `bağlam ${i} ${x.key}`).toBeGreaterThan(PATH.capMin) // HEAD'de yer yoktu
        back++
      }
      const yA = pa.stops.find((x) => x.id === 'yoga')
      if (yA && !pb.stops.some((x) => x.id === 'yoga')) {
        const noticeIn = pb.stops.some((x) => x.id === 'notice') && !pa.stops.some((x) => x.id === 'notice')
        expect(returned.length > 0 || noticeIn, `bağlam ${i}`).toBe(true)
        expect(total(pb) + yA.minutes, `bağlam ${i}`).toBeGreaterThan(PATH.capMin) // R7b: sığmadı
        yogaGave++
      }
      expect(total(pb)).toBeLessThanOrEqual(PATH.capMin)
    }
    expect(back).toBeGreaterThan(0)
    // yoganın yer verdiği bağlam seyrektir (20.000 bağlamlık düzenekte ≈ %0,3); burada sayılır, kural yukarıda sınanır
    expect(yogaGave).toBeLessThan(150)
  }, 60000)
  it('fark (2): 14–40 gün sonra dönen eski kullanıcı: yumuşak gün (nefes 2 dk, göz K6, çeşitleme bir aşağı, rozet yok); HEAD\'deki durak kaybolmaz', () => {
    const { rnd, pick } = y1Rng(4545)
    for (let i = 0; i < 80; i++) {
      const base = oldUser(rnd, pick)
      const gap = 14 + Math.floor(rnd() * 27)
      const ctx = { ...base, now: new Date(base.now.getTime() + gap * 86400000), later: null }
      ctx.sessions = ctx.sessions.filter((x) => new Date(x.date) < base.now)
      const progression = progressionCtx({ tests: ctx.tests, sessions: ctx.sessions, now: ctx.now, modules: Y1_ALL })
      expect(progression.mod.breath.G).toBeGreaterThanOrEqual(14)
      const pb = buildPath(Y1_ALL, { ...ctx, progression })
      const br = pb.stops.find((x) => x.id === 'breath')
      expect(br, `bağlam ${i}`).toMatchObject({ minutes: 2, stage: { soft: true, id: 'N2' } })
      for (const x of pb.stops.filter((y) => y.id === 'routine')) expect(x.stage, `bağlam ${i}`).toMatchObject({ soft: true, id: 'K6' })
      expect(pb.stops.some((x) => x.key === 'routine:daire')).toBe(false) // K6: Daire yok, Yukarı–aşağı var
      expect(newStopKeys({ progression }, pb.stops)).toEqual(expect.not.arrayContaining(['breath', 'routine:dikey']))
      const pa = buildPath(Y0_MODS, ctx)
      const kb = pb.stops.map((x) => canon(x.key))
      const lost = pa.stops.map((x) => canon(x.key)).filter((k) => !kb.includes(k) && k !== 'yoga')
      expect(lost, `bağlam ${i}`).toEqual([])
      expect(total(pb)).toBeLessThanOrEqual(PATH.capMin)
    }
  }, 60000)
})
