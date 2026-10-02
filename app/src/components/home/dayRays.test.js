// Ana sayfa · senin gözün: kayıtlardan ışınlar, göz bebeği ve kilometre taşlarının yeri (saf)
import { describe, it, expect } from 'vitest'
import { dayRays, pupilOf, stopIdOf, RAY_FULL, lookDates, todayRayN } from './dayRays.js'
import { slotsOf, lenOf } from './dayIrisDraw.js'

const NOW = new Date('2026-09-30T10:00:00')
const at = (d, h = 9) => { const t = new Date(NOW); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); return t.toISOString() }

describe('dayRays', () => {
  it('geçmiş her kayıtlı gün bir ışın (eskiden yeniye); ışın boyu ayrı durak sayısı; atlanan gün boşluk bırakmaz', () => {
    const tests = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: at(5) })) // üç göz tek durak
    const sessions = [
      { type: 'routine', setId: 'isinma', date: at(5) },
      { type: 'routine', setId: 'isinma', date: at(5, 11) }, // aynı durak iki kez: bir
      { type: 'game', game: 'track', date: at(5) },
      { type: 'breath', seconds: 60, date: at(2) }, // 3 ve 4 gün önce kayıt yok
      { type: 'routine', setId: 'kirpma', date: at(0) },
    ]
    expect(dayRays({ tests, sessions, now: NOW })).toEqual({ days: [3, 1], today: 1, look: false, last: '2026-09-28', lookDays: [] })
  })
  it('en çok 10 durak; kayıt yoksa boş, bugün 0', () => {
    const sessions = Array.from({ length: 14 }, (_, i) => ({ type: 'routine', setId: `g${i}`, date: at(1) }))
    expect(dayRays({ sessions, now: NOW }).days).toEqual([RAY_FULL])
    expect(dayRays({ now: NOW })).toEqual({ days: [], today: 0, look: false, last: null, lookDays: [] })
  })
  it('İlk Bakış da bir durak: kurulum günü bugünün ışınını yakar (kayıt sayısı, son kayıt günü değişmez); ertesi gün ışın yerinde', () => {
    // 1. gün: kayıt yok, İlk Bakış bugün → bugünün ışını 1 durak; geçmiş yok; günün cümlesinin "bugün durak yapıldı"sı değişmez
    const d1 = dayRays({ now: NOW, looks: [at(0, 9)] })
    expect(d1).toEqual({ days: [], today: 0, look: true, last: null, lookDays: [] })
    expect(todayRayN(d1)).toBe(1)
    // 2. gün, 1. gün yalnız İlk Bakış: ışın yerinde (hiçbir ışın sönmez); göz bebeği için kaydı olmayan gün ayrıca sayılır
    expect(dayRays({ now: NOW, looks: [at(1)] })).toEqual({ days: [1], today: 0, look: false, last: null, lookDays: ['2026-09-29'] })
    // Kaydı olan günde İlk Bakış bir durak daha (iki kaynak aynı gün: bir)
    const sessions = [{ type: 'breath', seconds: 60, date: at(1) }]
    expect(dayRays({ sessions, now: NOW, looks: [at(1), at(1, 8)] })).toEqual({ days: [2], today: 0, look: false, last: '2026-09-29', lookDays: [] })
    expect(todayRayN(dayRays({ sessions: [{ type: 'breath', seconds: 60, date: at(0) }], now: NOW, looks: [at(0)] }))).toBe(2)
  })
  it('lookDates: son İlk Bakış, iris haritasının başlangıcı ve yenilemesi (kırpma sayısı olanlar)', () => {
    expect(lookDates(null)).toEqual([])
    const p = { firstLook: { blinks: 3, seconds: 20, date: at(0) }, iris: { baseline: { date: at(0), blinks: 3 }, recheck: { date: at(1), blinks: null } } }
    expect(lookDates(p)).toEqual([at(0), at(0)])
    expect(lookDates({ firstLook: { blinks: 3, seconds: 20 } })).toEqual([]) // tarihsiz eski kayıt
  })
  it('stopIdOf: egzersiz grubu, oyun, tür', () => {
    expect(stopIdOf({ type: 'routine', setId: 'daire' })).toBe('routine:daire')
    expect(stopIdOf({ type: 'game', game: 'snake' })).toBe('game:snake')
    expect(stopIdOf({ type: 'va-weekly', eye: 'R' })).toBe('va-weekly')
    expect(stopIdOf(null)).toBeNull()
  })
})

describe('pupilOf (sıfır yok, aynı sayı iki kez yok)', () => {
  it('hiç gün yoksa "İlk gün"; seri < 3 → "N gün"; seri ≥ 3 ve aynı sayı → "N gün seri"; ayrışınca seri hapta', () => {
    expect(pupilOf({ totalDays: 0, streak: 0 })).toMatchObject({ n: 'İlk', label: 'gün', word: true })
    expect(pupilOf({ totalDays: 2, streak: 2 })).toMatchObject({ n: 2, label: 'gün seninle', streakPill: null })
    expect(pupilOf({ totalDays: 8, streak: 8 })).toMatchObject({ n: 8, label: 'gün seri', lens: true })
    expect(pupilOf({ totalDays: 68, streak: 1 })).toMatchObject({ n: 68, label: 'gün seninle', streakPill: null })
    expect(pupilOf({ totalDays: 40, streak: 5 })).toMatchObject({ n: 40, label: 'gün seninle', streakPill: 5 })
  })
})

describe('slotsOf (çizim yuvaları)', () => {
  it('dün tepenin solunda (yuva 27), bugün tepede (0); 28 günden sonra aynı yuvada katman', () => {
    const s = slotsOf([4, 10], 2)
    expect([...s.keys()].sort((a, b) => a - b)).toEqual([0, 26, 27])
    expect(s.get(27).len).toBeCloseTo(lenOf(10))
    const lap = slotsOf(Array.from({ length: 29 }, () => 10), 0)
    expect(lap.size).toBe(28)
    expect(lap.get(27).layers).toBe(2) // 1 ve 29 gün önce aynı yuvada
  })
})
