import { describe, it, expect } from 'vitest'
import { activeDays, weekProgress } from './calendar.js'
import {
  activitiesFrom,
  summary,
  byDay,
  dayLevel,
  monthTotals,
  formatDuration,
  decimalTr,
  countedActivities,
  countsTowardGoal,
  DEFAULT_BLINK_SECONDS,
  TEST_GROUP_WINDOW_MS,
} from './stats.js'

// NBSP → normal boşluk (metin karşılaştırması için)
const plain = (v) => (typeof v === 'string' ? v.replace(/\u00a0/g, ' ') : v)
const plainAct = (a) => ({ ...a, detail: plain(a.detail) })

// Yerel saatle tarih (ay 0–11)
const at = (y, m, d, h = 12, min = 0, s = 0, ms = 0) => new Date(y, m, d, h, min, s, ms).toISOString()

describe('biçimlendirme', () => {
  it('formatDuration', () => {
    const f = (v) => plain(formatDuration(v))
    expect(f(0)).toBe('0 sn')
    expect(f(45)).toBe('45 sn')
    expect(f(60)).toBe('1 dk')
    expect(f(130)).toBe('2 dk 10 sn')
    expect(f(599)).toBe('9 dk 59 sn')
    expect(f(600)).toBe('10 dk')
    expect(f(629)).toBe('10 dk')
    expect(f(undefined)).toBe('0 sn')
  })
  it('sayı ile birim bölünmez boşlukla ayrılır', () => {
    expect(formatDuration(95)).toBe('1\u00a0dk 35\u00a0sn')
  })
  it('decimalTr virgül ve gerçek eksi işareti kullanır', () => {
    expect(decimalTr(0.32)).toBe('0,32')
    expect(decimalTr(-0.1)).toBe('\u22120,10')
    expect(decimalTr(0.2, 1)).toBe('0,2')
    expect(decimalTr(-0.3, 1)).toBe('\u22120,3')
  })
  it('decimalTr sıfıra yuvarlanan negatifi "−0,00" yazmaz', () => {
    expect(decimalTr(-0.001)).toBe('0,00')
    expect(decimalTr(-0)).toBe('0,00')
    expect(decimalTr(0)).toBe('0,00')
    expect(decimalTr(-0.04, 1)).toBe('0,0')
  })
})

describe('activitiesFrom — testler', () => {
  it('aynı akıştaki Sağ/Sol/İki göz kayıtları tek aktivite olur', () => {
    const tests = [
      { id: 'a', type: 'va-daily', eye: 'R', logMAR: 0.32, date: at(2026, 8, 24, 9, 0, 0, 0) },
      { id: 'b', type: 'va-daily', eye: 'L', logMAR: 0.28, date: at(2026, 8, 24, 9, 0, 0, 2) },
      { id: 'c', type: 'va-daily', eye: 'OU', logMAR: 0.2, date: at(2026, 8, 24, 9, 0, 0, 4) },
    ]
    const acts = activitiesFrom(tests, [])
    expect(acts).toHaveLength(1)
    const [a] = acts
    expect(a).toMatchObject({ id: 't:a', kind: 'test', type: 'va-daily', title: 'Günlük görme testi', seconds: 180, estimated: true })
    expect(plain(a.detail)).toBe('logMAR · Sağ 0,32 · Sol 0,28 · İki göz 0,20')
    expect(a.detail).toContain('İki\u00a0göz\u00a00,20')
    expect(a.results).toHaveLength(3)
    expect(a).not.toHaveProperty('lastTs')
  })

  it('tek göz kaydı: "logMAR 0,32 · Sağ göz"', () => {
    const [a] = activitiesFrom([{ id: 'a', type: 'va-weekly', eye: 'R', logMAR: 0.32, date: at(2026, 8, 24) }])
    expect(a.detail).toBe('logMAR 0,32 · Sağ göz')
    expect(a.title).toBe('Haftalık görme testi')
    expect(a.seconds).toBe(300)
  })

  it('farklı saatlerdeki testler ve aynı gözün tekrarı ayrı aktivite', () => {
    const tests = [
      { id: 'a', type: 'va-daily', eye: 'OU', logMAR: 0.2, date: at(2026, 8, 24, 9) },
      { id: 'b', type: 'va-daily', eye: 'OU', logMAR: 0.22, date: at(2026, 8, 24, 9, 1) },
      { id: 'c', type: 'va-daily', eye: 'R', logMAR: 0.3, date: new Date(new Date(at(2026, 8, 24, 9, 1)).getTime() + TEST_GROUP_WINDOW_MS + 1000).toISOString() },
      { id: 'd', type: 'va-weekly', eye: 'L', logMAR: 0.3, date: at(2026, 8, 24, 21) },
    ]
    expect(activitiesFrom(tests).map((a) => a.id)).toEqual(['t:a', 't:b', 't:c', 't:d'])
  })

  it('farklı test türleri birleşmez', () => {
    const tests = [
      { id: 'a', type: 'va-daily', eye: 'R', logMAR: 0.2, date: at(2026, 8, 24, 9) },
      { id: 'b', type: 'va-weekly', eye: 'L', logMAR: 0.2, date: at(2026, 8, 24, 9) },
    ]
    expect(activitiesFrom(tests)).toHaveLength(2)
  })

  it('okuma testi', () => {
    const [a] = activitiesFrom([{ id: 'r', type: 'reading', eye: 'OU', maxReadingSpeed: 142, criticalPrintSize: 0.4, date: at(2026, 8, 24) }])
    expect(plainAct(a)).toMatchObject({ kind: 'test', title: 'Okuma hızı testi', seconds: 180, estimated: true, detail: '142 kelime/dk · kritik boyut 0,40' })
    const [b] = activitiesFrom([{ id: 'r2', type: 'reading', maxReadingSpeed: null, date: at(2026, 8, 24) }])
    expect(b.detail).toBe('Sonuç hesaplanamadı')
  })

  it('yeni okuma testi (protocol 2): rahat boy ve hız', () => {
    const [a] = activitiesFrom([{ id: 'r3', type: 'reading', protocol: 2, maxReadingSpeed: 168, criticalPrintSize: 0.3, date: at(2026, 8, 24) }])
    expect(plainAct(a)).toMatchObject({ kind: 'test', title: 'Okuma testi', detail: 'rahat 0,3 · 168 k/dk' })
    const [b] = activitiesFrom([{ id: 'r4', type: 'reading', protocol: 2, criticalPrintSize: null, cpsCensored: 'above', ladderTop: 0.5, date: at(2026, 8, 24) }])
    expect(b.detail).toBe('rahat > 0,5')
  })

  it('kayıtta seconds varsa varsayılan yerine o kullanılır', () => {
    const [a] = activitiesFrom([{ id: 'x', type: 'va-daily', eye: 'OU', logMAR: 0.1, seconds: 95, date: at(2026, 8, 24) }])
    expect(a.seconds).toBe(95)
    expect(a.estimated).toBe(false)
  })
})

describe('activitiesFrom — oturumlar', () => {
  it('egzersiz seti', () => {
    const [a] = activitiesFrom([], [{ id: 's1', type: 'routine', setId: 'normal', seconds: 130, steps: 9, date: at(2026, 8, 24) }])
    expect(plainAct(a)).toMatchObject({ id: 's:s1', kind: 'exercise', type: 'routine', setId: 'normal', title: 'Egzersiz seti', seconds: 130, detail: 'Normal set · 2 dk 10 sn' })
  })

  it('göz kırpma: süre yoksa 150 sn (tahmini)', () => {
    const [a] = activitiesFrom([], [{ id: 'b', type: 'blink', reps: 10, cameraUsed: true, detectedClosures: 18, date: at(2026, 8, 24) }])
    expect(a.seconds).toBe(DEFAULT_BLINK_SECONDS)
    expect(a.estimated).toBe(true)
    expect(a.kind).toBe('exercise')
    expect(a.title).toBe('Göz kırpma egzersizi')
    expect(plain(a.detail)).toBe('10 tekrar · 18 kırpma algılandı · ~2 dk 30 sn')
  })

  it('yılan oyunu', () => {
    const [a] = activitiesFrom([], [{ id: 'g', type: 'game', game: 'snake', score: 42, best: 50, seconds: 80, control: 'eyes', date: at(2026, 8, 24) }])
    expect(plainAct(a)).toMatchObject({ kind: 'game', game: 'snake', score: 42, best: 50, title: 'Yılan oyunu', seconds: 80, detail: '42 puan · gözle · 1 dk 20 sn' })
  })

  it('geçersiz tarih atlanır, dizi olmayan girdi hata vermez, sıralama artan', () => {
    const acts = activitiesFrom(
      [
        { id: 't2', type: 'reading', maxReadingSpeed: 100, date: at(2026, 8, 24, 18) },
        { id: 'bad', type: 'va-daily', eye: 'OU', logMAR: 0.1, date: 'olmaz' },
        { id: 'nil', type: 'va-daily', eye: 'OU', logMAR: 0.1, date: null },
      ],
      [
        { id: 's2', type: 'routine', setId: 'lite', seconds: 60, date: at(2026, 8, 24, 8) },
        { id: 's3', type: 'blink', date: at(2026, 8, 24, 20) },
      ],
    )
    expect(acts.map((a) => a.id)).toEqual(['s:s2', 't:t2', 's:s3'])
    expect(activitiesFrom(undefined, null)).toEqual([])
  })
})

describe('summary', () => {
  const now = new Date(2026, 8, 24, 15) // Perşembe
  const acts = activitiesFrom(
    [{ id: 't', type: 'va-daily', eye: 'OU', logMAR: 0.2, date: at(2026, 8, 24, 9) }],
    [
      { id: 'a', type: 'routine', setId: 'normal', seconds: 100, date: at(2026, 8, 24, 10) },
      { id: 'b', type: 'blink', date: at(2026, 8, 23, 20) },
      { id: 'c', type: 'game', game: 'snake', score: 30, best: 55, seconds: 60, date: at(2026, 8, 22, 20) },
      { id: 'd', type: 'game', game: 'snake', score: 61, best: 55, seconds: 60, date: at(2026, 8, 18, 20) },
    ],
  )

  it('toplamlar', () => {
    const s = summary(acts, now)
    expect(s.total).toBe(5)
    expect(s.seconds).toBe(180 + 100 + 150 + 60 + 60)
    expect(s.minutes).toBe(9)
    expect(s.activeDays).toBe(4)
    expect(s.thisWeekDays).toBe(3) // 22, 23, 24 Eylül (hafta 21 Eylül Pazartesi başlar)
    expect(s.bestSnake).toBe(61)
  })

  it('seri: bugün dahil art arda günler', () => {
    expect(summary(acts, now).streakDays).toBe(3) // 22-23-24; 21 boş
  })

  it('seri: bugün boşsa dünden sayılır', () => {
    expect(summary(acts, new Date(2026, 8, 25, 9)).streakDays).toBe(3)
    expect(summary(acts, new Date(2026, 8, 26, 9)).streakDays).toBe(0)
  })

  it('seri ay sınırını geçer', () => {
    const a = activitiesFrom([], [
      { id: '1', type: 'blink', date: at(2026, 8, 30, 23, 30) },
      { id: '2', type: 'blink', date: at(2026, 9, 1, 0, 15) },
    ])
    expect(summary(a, new Date(2026, 9, 1, 12)).streakDays).toBe(2)
  })

  it('seri yaz saati geçişinde bozulmaz', () => {
    // 2026: ABD 1 Kasım, AB 25 Ekim yaz saatinden çıkar
    const days = [[9, 24], [9, 25], [9, 26], [9, 31], [10, 1], [10, 2]]
    const a = activitiesFrom([], days.map(([m, d], i) => ({ id: `d${i}`, type: 'blink', date: at(2026, m, d, 0, 30) })))
    expect(summary(a, new Date(2026, 9, 26, 22)).streakDays).toBe(3)
    expect(summary(a, new Date(2026, 10, 2, 22)).streakDays).toBe(3)
    expect([...byDay(a).keys()]).toEqual(['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-31', '2026-11-01', '2026-11-02'])
  })

  it('boş liste ve yılan yoksa bestSnake null', () => {
    expect(summary([], now)).toEqual({ total: 0, seconds: 0, minutes: 0, activeDays: 0, streakDays: 0, thisWeekDays: 0, bests: { snake: null, track: null }, bestSnake: null, bestTrack: null })
    expect(summary(acts.filter((a) => a.type !== 'game'), now).bestSnake).toBeNull()
  })
})

describe('byDay / dayLevel / monthTotals', () => {
  const acts = activitiesFrom([], [
    { id: 'late', type: 'blink', date: at(2026, 8, 24, 23, 30) },
    { id: 'early', type: 'routine', setId: 'lite', seconds: 60, date: at(2026, 8, 24, 7) },
    { id: 'next', type: 'blink', date: at(2026, 8, 25, 0, 10) },
    { id: 'oct', type: 'routine', setId: 'full', seconds: 300, date: at(2026, 9, 2, 9) },
  ])

  it('yerel güne göre gruplar, gün içinde saat sırası', () => {
    const m = byDay(acts)
    expect([...m.keys()]).toEqual(['2026-09-24', '2026-09-25', '2026-10-02'])
    expect(m.get('2026-09-24').map((a) => a.id)).toEqual(['s:early', 's:late'])
    expect(m.get('2026-09-25')).toHaveLength(1)
  })

  it('yoğunluk seviyesi 0 / 1 / 2+', () => {
    expect([0, 1, 2, 5].map(dayLevel)).toEqual([0, 1, 2, 2])
    expect(dayLevel(undefined)).toBe(0)
  })

  it('ay toplamları', () => {
    expect(monthTotals(acts, 2026, 8)).toEqual({ count: 3, seconds: 60 + 150 + 150, minutes: 6, activeDays: 2 })
    expect(monthTotals(acts, 2026, 9)).toEqual({ count: 1, seconds: 300, minutes: 5, activeDays: 1 })
    expect(monthTotals(acts, 2026, 7).count).toBe(0)
  })
})

describe('countedActivities — oyunlar gün/seri/hafta sayımına girmez', () => {
  // Bulgu senaryosu: dün yalnızca Yılan, önceki gün test, bugün egzersiz seti.
  const now = new Date(2026, 8, 24, 15) // Perşembe
  const tests = [{ id: 't', type: 'va-daily', eye: 'OU', logMAR: 0.2, date: at(2026, 8, 22, 9) }]
  const sessions = [
    { id: 'g', type: 'game', game: 'snake', score: 12, best: 12, seconds: 90, control: 'touch', date: at(2026, 8, 23, 20) },
    { id: 'r', type: 'routine', setId: 'lite', seconds: 60, date: at(2026, 8, 24, 10) },
  ]
  const all = activitiesFrom(tests, sessions)
  const counted = countedActivities(all)

  it('oyun aktiviteleri ayıklanır, diğerleri korunur', () => {
    expect(counted.map((a) => a.id)).toEqual(['t:t', 's:r'])
    expect(countsTowardGoal({ kind: 'game' })).toBe(false)
    expect(countsTowardGoal({ kind: 'test' })).toBe(true)
    expect(countedActivities(undefined)).toEqual([])
  })

  it('haftalık gün sayısı Ana sayfa/Takvim hesabıyla aynı (calendar.weekProgress)', () => {
    // Home.jsx ve App.jsx (Takvim): activeDays([...tests, ...sessions.filter(s => s.type !== 'game')])
    const home = weekProgress(activeDays([...tests, ...sessions.filter((s) => s.type !== 'game')]), now)
    const s = summary(counted, now)
    expect(s.thisWeekDays).toBe(home.done)
    expect(s.thisWeekDays).toBe(2)
    expect(s.streakDays).toBe(1) // 23 Eylül yalnızca oyun → seri bugünden başlar
    expect(s.activeDays).toBe(2)
    expect(byDay(counted).has('2026-09-23')).toBe(false)
    expect(byDay(all).get('2026-09-23')).toHaveLength(1) // gün listesinde oyun görünmeye devam eder
  })

  it('aktivite ve dakika toplamı oyunu içermez; yılan rekoru tüm listeden okunur', () => {
    const s = summary(counted, now)
    expect(s.total).toBe(2)
    expect(s.seconds).toBe(180 + 60)
    expect(s.bestSnake).toBeNull()
    expect(summary(all, now).bestSnake).toBe(12)
    expect(monthTotals(counted, 2026, 8)).toMatchObject({ count: 2, seconds: 240 })
  })
})

describe('çember takibi oturumları', () => {
  it('oyun olarak listelenir, hedefe sayılmaz; rekor ayrı', async () => {
    const { activitiesFrom, summary, countsTowardGoal } = await import('./stats.js')
    const now = new Date('2026-09-25T12:00:00')
    const acts = activitiesFrom([], [{ type: 'game', game: 'track', score: 42, best: 42, seconds: 40, followPct: 80, control: 'eyes', date: now.toISOString() }])
    expect(acts[0].title).toBe('Çemberler')
    expect(acts[0].detail).toMatch(/42 puan/)
    expect(acts[0].detail).toMatch(/takip %80/)
    expect(countsTowardGoal(acts[0])).toBe(false)
    expect(summary(acts, now).bestTrack).toBe(42)
  })
})
