// Yoga yol durağı (PLAN.v3 §B.2, §B.5; yol.md §5.1, §5.6): sayaçlar kayıtlardan (ctx.progression yok), yalnız
// yayımlanmış süreler aday, ilk bölüm (Ders 1, 2, 3, 5) kuralları. Ders verisi lib/yogaLessons.js'in taklidi:
// LESSONS (id → { title, domain, minutes, published: { [dk]: { file, timeline } } }) ve publishedMinutes(id).
import { describe, it, expect } from 'vitest'
import { PATH_SEQ, PATH_YOGA, yogaCounters, weeklyDayToday, pathYoga, yogaPathStop } from './yoga.js'
import { dayKey } from './calendar.js'
import * as REAL from './yogaLessons.js'

const TITLES = { 1: 'Nefesin Ritmi', 2: 'Derin Dinlenme', 3: 'Uykuya Geçiş', 4: 'Zor Anlar İçin', 5: 'Tek Nokta', 6: 'Sabah Niyeti', 7: 'Kendine Şefkat', 8: 'Sağlam Yer', 9: 'Kendini Tanımak', 10: 'Gelecekteki Sen' }
const DOMAIN = { 1: 'calm', 2: 'body', 3: 'wellbeing', 4: 'calm', 5: 'focus', 6: 'wellbeing', 7: 'self', 8: 'self', 9: 'awareness', 10: 'wellbeing' }
const MINUTES = (id) => ([2, 3, 7].includes(id) ? [5, 15] : [3, 5, 15])
// pub: { ders: [yayımlanmış dk, …] } → lib/yogaLessons.js biçiminde veri
function lessonData(pub) {
  const LESSONS = Object.fromEntries(Object.keys(TITLES).map((k) => {
    const id = Number(k)
    const published = Object.fromEntries((pub[id] ?? []).map((m) => [m, { file: `yoga/ders${id}-${m}dk.mp3`, timeline: `yoga/ders${id}-${m}dk.timeline.json` }]))
    return [id, { title: TITLES[id], domain: DOMAIN[id], minutes: MINUTES(id), published }]
  }))
  const publishedMinutes = (id) => Object.keys(LESSONS[id]?.published ?? {}).map(Number).sort((a, b) => a - b)
  return { LESSONS, publishedMinutes }
}
// On dersin hepsi yayımlanmış (PLAN.v3 §B.3 benzetimi) ve ilk bölüm (Ders 1, 2, 3, 5)
const ALL = lessonData(Object.fromEntries(Object.keys(TITLES).map((k) => [k, MINUTES(Number(k))])))
const FIRST = lessonData({ 1: [3, 5, 15], 2: [5, 15], 3: [5, 15], 5: [3, 5, 15] })
// Bugünkü veri: yalnız Ders 2'nin 15 dakikası hazır
const NOW_DATA = lessonData({ 2: [15] })

// Gün n: 2026 Ekim'in n. günü, yerel saat (saat dilimine bağlı değil)
const at = (n, h = 10, m = 0) => new Date(2026, 9, n, h, m)
const iso = (n, h = 10) => at(n, h).toISOString()
const routine = (n) => ({ type: 'routine', setId: 'isinma', seconds: 60, date: iso(n, 9) })
const weekly = (n) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: iso(n, 9), runDay: dayKey(at(n)) }))
const reading = (n) => ({ type: 'reading', date: iso(n, 9), runDay: dayKey(at(n)) })
const yoga = (n, lesson, min, extra = {}) => ({ type: 'yoga', lesson, planned: min * 60, seconds: min * 60, reachedClosing: true, completed: true, date: iso(n, 11), ...extra })
// Her gün açan kişi: 1. gün E testi, 2. gün okuma, sonra her gün bir egzersiz; E testi 8., 15., … günlerde, okuma 9., 16., …
function history(untilDay, { yogaDays = {} } = {}) {
  const tests = []
  const sessions = []
  for (let n = 1; n < untilDay; n++) {
    if ((n - 1) % 7 === 0) tests.push(...weekly(n))
    if ((n - 2) % 7 === 0) tests.push(reading(n))
    sessions.push(routine(n))
    if (yogaDays[n]) sessions.push(yoga(n, ...yogaDays[n]))
  }
  return { tests, sessions }
}
const ctxAt = (day, h = 10, opts) => ({ ...history(day, opts), now: at(day, h) })

describe('PATH_SEQ ve sabitler', () => {
  it('kütüphane sırası 1, 2, 5, 7, 4, 6, 8, 9, 10; Uykuya Geçiş (3) sırada yok', () => {
    expect(PATH_SEQ).toEqual([1, 2, 5, 7, 4, 6, 8, 9, 10])
    expect(PATH_SEQ).not.toContain(3)
    expect(PATH_YOGA).toMatchObject({ unlockTotalDays: 2, shortMin: 3, fullMin: 5, shortBeforeFull: 6, softAfterDays: 14, order: 105 })
    expect(PATH_YOGA.dropRank).toBeUndefined()
  })
})

describe('yogaCounters: yalnız bugünden önceki kayıtlar', () => {
  it('ayrı gün, son yoga gününe uzaklık, son tam dersten beri kısa gün, ders başına tamamlanma', () => {
    const sessions = [routine(1), routine(1), yoga(2, 1, 3), yoga(3, 5, 3), yoga(3, 1, 3), yoga(4, 2, 5), yoga(5, 5, 3), yoga(6, 1, 3, { completed: false }), yoga(7, 5, 3)]
    const c = yogaCounters(sessions, [reading(1)], at(7, 20))
    expect(c.totalDays).toBe(6) // 1–6. günler; bugün (7) sayılmaz
    expect(c.gapDays).toBe(2) // son tamamlanan yoga 5. gün
    expect(c.shortSinceFull).toBe(1) // 4. gün tam ders; sonra yalnız 5. gün (6. gün yarım)
    expect(c.byLesson).toEqual({ 1: { n: 2, full: 0 }, 2: { n: 1, full: 1 }, 5: { n: 2, full: 0 } })
  })
  it('hiç yoga yoksa gapDays null', () => {
    expect(yogaCounters([routine(1)], [], at(3)).gapDays).toBeNull()
  })
})

describe('pathYoga: giriş günü (ctx.progression yok)', () => {
  it('1. ve 2. kayıtlı günde yok, 3. günde Nefesin Ritmi 3 dk', () => {
    expect(pathYoga(ctxAt(1), ALL.publishedMinutes)).toBeNull()
    expect(pathYoga(ctxAt(2), ALL.publishedMinutes)).toBeNull()
    expect(pathYoga(ctxAt(3), ALL.publishedMinutes)).toEqual({ lesson: 1, minutes: 3, full: false, soft: false, night: false, done: false })
  })
  it('ctx.progression verilse de sonuç değişmez (bağımsız)', () => {
    const c = ctxAt(3)
    expect(pathYoga({ ...c, progression: { totalDays: 0 } }, ALL.publishedMinutes)).toEqual(pathYoga(c, ALL.publishedMinutes))
  })
  it('gün atlayan kişide kullandığı 3. günde gelir', () => {
    const c = { tests: [...weekly(1)], sessions: [routine(1), routine(5)], now: at(12) }
    expect(pathYoga(c, ALL.publishedMinutes)?.lesson).toBe(1)
  })
})

describe('pathYoga: ölçüm günleri', () => {
  it('E testinin zamanı bugün geldi → yok; bugün Ana sayfadan 15 dk ders yapılmış olsa da', () => {
    const c = ctxAt(8)
    expect(weeklyDayToday(c.tests, c.sessions, c.now)).toBe(true)
    expect(pathYoga(c, ALL.publishedMinutes)).toBeNull()
    expect(pathYoga({ ...c, sessions: [...c.sessions, yoga(8, 1, 15)] }, ALL.publishedMinutes)).toBeNull()
  })
  it('E testi dün geldi ama yapılmadı → bugün yoga 3 dk (en çok bir gün); tam ders o güne düşmez', () => {
    // 1–7. günler kısa yoga (sayaç dolu), 8. gün E testi yapılmadı
    const yogaDays = { 3: [1, 3], 4: [5, 3], 5: [1, 3], 6: [5, 3], 7: [1, 3], 2: [5, 3] }
    const c = ctxAt(9, 10, { yogaDays })
    c.tests = c.tests.filter((t) => t.type !== 'va-weekly' || t.runDay !== dayKey(at(8)))
    expect(weeklyDayToday(c.tests, c.sessions, c.now)).toBe(false)
    const p = pathYoga(c, ALL.publishedMinutes)
    expect(p).toMatchObject({ minutes: 3, full: false })
  })
  it('eski okuma günü artık ölçüm günü değil: sayaç dolmuşsa tam ders (5 dk)', () => {
    // 16. gün eski planda okuma günüydü (E testi dün yapıldı); altı kısa yoga günü birikmiş. Sahip kararı 2026-10-02:
    // okuma testi sonsuz yoldan çıktı, ölçüm günü yalnız haftalık E testi (lib/yoga.js measureDay)
    const short = { 3: [1, 3], 4: [5, 3], 5: [4, 3], 6: [6, 3], 7: [8, 3], 9: [9, 3] }
    const c = ctxAt(16, 10, { yogaDays: short })
    expect(yogaCounters(c.sessions, c.tests, c.now).shortSinceFull).toBe(6)
    expect(pathYoga(c, ALL.publishedMinutes)).toMatchObject({ minutes: 5, full: true })
  })
})

describe('pathYoga: süre ve ders seçimi', () => {
  // 3–7 ve 9. günler kısa yoga; 10. gün ölçüm yok → tam ders
  const SIX = { 3: [1, 3], 4: [5, 3], 5: [4, 3], 6: [6, 3], 7: [8, 3], 9: [9, 3] }
  it('altı kısa günden sonra ölçüm olmayan gün 5 dk; hiç dinlenmemişse Derin Dinlenme', () => {
    const p = pathYoga(ctxAt(10, 10, { yogaDays: SIX }), ALL.publishedMinutes)
    expect(p).toEqual({ lesson: 2, minutes: 5, full: true, soft: false, night: false, done: false })
  })
  it('tam ders günlerinde Derin Dinlenme ile Kendine Şefkat sırayla', () => {
    const p = pathYoga(ctxAt(10, 10, { yogaDays: { ...SIX, 1: [2, 5] } }), ALL.publishedMinutes)
    expect(p).toMatchObject({ lesson: 7, minutes: 5, full: true })
  })
  it('Derin Dinlenme 3 dk\'lık günde hiç gelmez; yayımlanmamış ders hiç gelmez', () => {
    for (let d = 3; d <= 40; d++) {
      const p = pathYoga(ctxAt(d), ALL.publishedMinutes)
      if (p && p.minutes === 3) expect([2, 3, 7]).not.toContain(p.lesson)
    }
    const only1 = lessonData({ 1: [3] })
    const seen = new Set()
    for (let d = 3; d <= 30; d++) seen.add(pathYoga(ctxAt(d), only1.publishedMinutes)?.lesson ?? null)
    expect([...seen].filter(Boolean)).toEqual([1])
  })
  it('Sabah Niyeti yalnız 05.00–12.00 arasında aday', () => {
    // 6 dışındaki kısa dersler birer kez yapılmış (Gelecekteki Sen 5 dk: sayaç sıfır, kısa gün) → en az yapılan Sabah Niyeti
    const done = { 3: [1, 3], 4: [5, 3], 5: [4, 3], 9: [8, 3], 10: [9, 3], 11: [10, 5] }
    const at12 = pathYoga(ctxAt(12, 10, { yogaDays: done }), ALL.publishedMinutes)
    expect(at12.lesson).toBe(6)
    expect(pathYoga(ctxAt(12, 12, { yogaDays: done }), ALL.publishedMinutes).lesson).not.toBe(6)
    expect(pathYoga(ctxAt(12, 4, { yogaDays: done }), ALL.publishedMinutes).lesson).not.toBe(6)
    expect(pathYoga(ctxAt(12, 5, { yogaDays: done }), ALL.publishedMinutes).lesson).toBe(6)
    expect(pathYoga(ctxAt(12, 11, { yogaDays: done }), ALL.publishedMinutes).lesson).toBe(6)
  })
  it('bugün tamamlanan ders gün içinde değişmez (Uykuya Geçiş dahil); 5 dk ve üstü tam ders payı', () => {
    const c = ctxAt(4)
    const sleep = { ...c, sessions: [...c.sessions, yoga(4, 3, 15, { date: iso(4, 1) })] }
    expect(pathYoga(sleep, ALL.publishedMinutes)).toMatchObject({ lesson: 3, minutes: 5, full: true, done: true })
    const short = { ...c, sessions: [...c.sessions, yoga(4, 5, 3)] }
    expect(pathYoga(short, ALL.publishedMinutes)).toMatchObject({ lesson: 5, minutes: 3, full: false, done: true })
    // yarım kalan ders durağı tamamlamaz
    const half = { ...c, sessions: [...c.sessions, yoga(4, 5, 3, { completed: false })] }
    expect(pathYoga(half, ALL.publishedMinutes)).toMatchObject({ done: false })
  })
  it('Ana sayfadan 15 dakikalık ders tam ders sayılır ve sayacı sıfırlar', () => {
    const p = pathYoga(ctxAt(11, 10, { yogaDays: { ...SIX, 10: [1, 15] } }), ALL.publishedMinutes)
    expect(p).toMatchObject({ minutes: 3, full: false })
    expect(yogaCounters(ctxAt(11, 10, { yogaDays: { ...SIX, 10: [1, 15] } }).sessions, [], at(11)).shortSinceFull).toBe(0)
  })
  it('sayaç yoga günlerini sayar, takvim günlerini değil: gün atlamak tam dersi öne çekmez', () => {
    const three = { 3: [1, 3], 4: [5, 3], 5: [4, 3] }
    expect(pathYoga(ctxAt(13, 10, { yogaDays: three }), ALL.publishedMinutes)).toMatchObject({ minutes: 3, full: false })
  })
  it('son yoga gününden 14 gün sonra 3 dk, tam ders yok', () => {
    const c = ctxAt(24, 10, { yogaDays: SIX })
    c.sessions = c.sessions.filter((s) => s.type === 'yoga' || new Date(s.date) < at(10))
    expect(yogaCounters(c.sessions, c.tests, c.now)).toMatchObject({ gapDays: 15, shortSinceFull: 6 })
    expect(pathYoga(c, ALL.publishedMinutes)).toMatchObject({ minutes: 3, full: false, soft: true })
  })
  it('aynı girdi aynı çıktıyı verir; girdiler değişmez', () => {
    const c = ctxAt(10, 10, { yogaDays: SIX })
    const before = JSON.stringify(c)
    const a = pathYoga(c, ALL.publishedMinutes)
    expect(pathYoga(c, ALL.publishedMinutes)).toEqual(a)
    expect(JSON.stringify(c)).toBe(before)
  })
})

describe('pathYoga: gece satırı', () => {
  it('20.00–05.00 ve Uykuya Geçiş yayımlanmışsa night', () => {
    expect(pathYoga(ctxAt(3, 20), FIRST.publishedMinutes).night).toBe(true)
    expect(pathYoga(ctxAt(3, 19), FIRST.publishedMinutes).night).toBe(false)
    expect(pathYoga({ ...ctxAt(3), now: at(3, 4, 59) }, FIRST.publishedMinutes).night).toBe(true)
    expect(pathYoga(ctxAt(3, 5), FIRST.publishedMinutes).night).toBe(false)
    expect(pathYoga(ctxAt(3, 21), lessonData({ 1: [3] }).publishedMinutes).night).toBe(false)
  })
})

describe('İlk bölüm (Ders 1, 2, 3, 5): yalnız hazır dersler', () => {
  it('bugünkü veri (yalnız Ders 2 · 15 dk): hiçbir gün durak yok', () => {
    for (let d = 1; d <= 40; d++) expect(pathYoga(ctxAt(d), NOW_DATA.publishedMinutes)).toBeNull()
  })
  it('yalnız Ders 2 yayımlıyken kısa günde durak yok; Ders 1 ve 5 yayımlanınca gelir', () => {
    expect(pathYoga(ctxAt(3), lessonData({ 2: [5, 15] }).publishedMinutes)).toBeNull()
    expect(pathYoga(ctxAt(3), lessonData({ 1: [3], 2: [5, 15], 5: [3] }).publishedMinutes)).toMatchObject({ lesson: 1, minutes: 3 })
  })
  it('kısa günlerde Ders 1 ve 5 sırayla; ≈ 8 günde bir Ders 2 · 5 dk; Ders 3 yolda yok', () => {
    const days = {}
    const c = { tests: [], sessions: [] }
    for (let n = 1; n <= 30; n++) {
      const now = at(n)
      if ((n - 1) % 7 === 0) c.tests.push(...weekly(n))
      if ((n - 2) % 7 === 0) c.tests.push(reading(n))
      const p = pathYoga({ ...c, now }, FIRST.publishedMinutes)
      if (p) {
        days[n] = `${p.lesson}·${p.minutes}`
        c.sessions.push(yoga(n, p.lesson, p.minutes))
      }
      c.sessions.push(routine(n))
    }
    expect(days).toEqual({
      3: '1·3', 4: '5·3', 5: '1·3', 6: '5·3', 7: '1·3', 9: '5·3', 10: '2·5', 11: '1·3', 12: '5·3', 13: '1·3', 14: '5·3', 16: '1·3',
      17: '5·3', 18: '2·5', 19: '1·3', 20: '5·3', 21: '1·3', 23: '5·3', 24: '1·3', 25: '5·3', 26: '2·5', 27: '1·3', 28: '5·3', 30: '1·3',
    })
  })
  it('tam ders günü 5 dk\'lık hazır ders yoksa o gün kısa ders gelir; sayaç dolu kalır', () => {
    const only3 = lessonData({ 1: [3], 5: [3] })
    const SIX = { 3: [1, 3], 4: [5, 3], 5: [1, 3], 6: [5, 3], 7: [1, 3], 9: [5, 3] }
    const c = ctxAt(10, 10, { yogaDays: SIX })
    expect(pathYoga(c, only3.publishedMinutes)).toMatchObject({ lesson: 1, minutes: 3, full: false })
    expect(pathYoga(c, FIRST.publishedMinutes)).toMatchObject({ lesson: 2, minutes: 5, full: true })
  })
  it('yayımlanmış süre haritası ({ ders: [dk] }) ve en kısa süre haritası (LESSON_MIN, { ders: dk }) da kabul edilir', () => {
    expect(pathYoga(ctxAt(3), { 1: [3], 5: [3] })).toMatchObject({ lesson: 1, minutes: 3 })
    expect(pathYoga(ctxAt(3), { 1: 3, 2: 5, 3: 5, 5: 3 })).toMatchObject({ lesson: 1, minutes: 3 })
    expect(pathYoga(ctxAt(3, 21), { 1: 3, 2: 5, 3: 5, 5: 3 }).night).toBe(true)
    const SIX = { 3: [1, 3], 4: [5, 3], 5: [1, 3], 6: [5, 3], 7: [1, 3], 9: [5, 3] }
    expect(pathYoga(ctxAt(10, 10, { yogaDays: SIX }), { 1: 3, 2: 5, 5: 3 })).toMatchObject({ lesson: 2, minutes: 5, full: true })
    expect(pathYoga(ctxAt(3), { 2: 15 })).toBeNull()
    expect(pathYoga(ctxAt(3), {})).toBeNull()
    expect(pathYoga(ctxAt(3))).toBeNull()
  })
  it('gerçek ders verisiyle (lib/yogaLessons.js): yolun seçtiği süre her zaman yayımlanmış', () => {
    const c = { tests: [], sessions: [] }
    for (let n = 1; n <= 60; n++) {
      if ((n - 1) % 7 === 0) c.tests.push(...weekly(n))
      if ((n - 2) % 7 === 0) c.tests.push(reading(n))
      for (const h of [4, 10, 21]) {
        const p = pathYoga({ ...c, now: at(n, h) }, REAL.publishedMinutes)
        if (p) expect(REAL.publishedMinutes(p.lesson)).toContain(p.minutes)
        if (p && h === 10) c.sessions.push(yoga(n, p.lesson, p.minutes))
        if (p?.night) expect(REAL.publishedMinutes(3).length).toBeGreaterThan(0)
      }
      c.sessions.push(routine(n))
    }
  })
})

describe('yogaPathStop: lib/today.js durak sözleşmesi (§B.5)', () => {
  it('kart yalnız ders adını ve süreyi taşır; dropRank yok, yields var', () => {
    const s = yogaPathStop(ctxAt(3), FIRST)
    expect(s).toEqual({
      title: 'Yoga', sub: 'Nefesin Ritmi', minutes: 3, route: 'yoga-1', slot: 'practice', order: 105, glyph: 'lotus', done: false,
      yields: true, later: false, stage: { lesson: 1, minutes: 3, full: false, soft: false, night: false },
    })
    expect('dropRank' in s).toBe(false)
  })
  it('"Sonra yaparım" yalnız bugünün kaydıyla', () => {
    const c = ctxAt(3)
    expect(yogaPathStop({ ...c, later: { day: dayKey(c.now), later: ['yoga'] } }, FIRST).later).toBe(true)
    expect(yogaPathStop({ ...c, later: { day: dayKey(at(2)), later: ['yoga'] } }, FIRST).later).toBe(false)
    expect(yogaPathStop({ ...c, later: { day: dayKey(c.now), later: ['snake'] } }, FIRST).later).toBe(false)
    expect(yogaPathStop({ ...c, later: null }, FIRST).later).toBe(false)
  })
  it('durak yoksa null; bugün yapılan ders done', () => {
    expect(yogaPathStop(ctxAt(2), FIRST)).toBeNull()
    expect(yogaPathStop(ctxAt(3), NOW_DATA)).toBeNull()
    const c = ctxAt(3)
    const s = yogaPathStop({ ...c, sessions: [...c.sessions, yoga(3, 2, 15)] }, FIRST)
    expect(s).toMatchObject({ sub: 'Derin Dinlenme', minutes: 5, route: 'yoga-2', done: true })
    // Ana sayfadan 15 dk yapıldı: yol payı 5 ama kart ve VoiceOver süre söylemez ("5 dakika" yanlış olurdu)
    expect(s.hideMinutes).toBe(true)
    expect('hideMinutes' in yogaPathStop(c, FIRST)).toBe(false)
  })
})
