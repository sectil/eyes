import { describe, it, expect } from 'vitest'
import {
  emptyBudget, addTime, usage, check, startRest, settle, setMotion, restLengthMs, nextMidnight, fmtLeft,
  loadBudget, saveBudget, LIMITS, EYE_BUDGET_KEY,
} from './eyeBudget.js'

const MIN = 60000
const T0 = new Date('2026-09-25T10:00:00').getTime()
const mem = () => {
  const m = new Map()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }
}
// dakika cinsinden parça ekle
const add = (s, kind, fromMin, toMin) => addTime(s, kind, T0 + fromMin * MIN, T0 + toMin * MIN)

describe('addTime / usage', () => {
  it('ardışık aynı tür parçalar birleşir, farklı tür ayrı kalır', () => {
    let s = emptyBudget()
    s = add(s, 'eye', 0, 1)
    s = addTime(s, 'eye', T0 + MIN + 1000, T0 + 2 * MIN)
    s = add(s, 'test', 2, 3)
    expect(s.segs.length).toBe(2)
    // 2 sn'den kısa boşluk birleşmede sayılır (ekran geçişi titreşimi)
    expect(usage(s, T0 + 3 * MIN)).toEqual({ sinceRest: 3 * MIN, hour: 3 * MIN, dayEye: 2 * MIN })
  })
  it('geçersiz tür ve ters aralık yok sayılır', () => {
    const s = emptyBudget()
    expect(add(s, 'breath', 0, 1)).toBe(s)
    expect(add(s, 'eye', 2, 1)).toBe(s)
  })
})

describe('check: bütçe, saatlik, günlük', () => {
  it('5 dk göz çalışması → budget; 1 dk kala uyarı', () => {
    let s = add(emptyBudget(), 'eye', 0, 4.5)
    let c = check(s, T0 + 4.5 * MIN)
    expect(c).toMatchObject({ locked: false, due: null, warn: true })
    expect(c.leftMs).toBe(0.5 * MIN)
    s = add(s, 'eye', 4.5, 5)
    expect(check(s, T0 + 5 * MIN).due).toBe('budget')
  })
  it('testler bütçeye sayılır, günlük sınıra sayılmaz', () => {
    const s = add(emptyBudget(), 'test', 0, 5)
    expect(check(s, T0 + 5 * MIN).due).toBe('budget')
    expect(usage(s, T0 + 5 * MIN).dayEye).toBe(0)
  })
  it('hareket tutması: bütçe 3 dk', () => {
    const s = setMotion(add(emptyBudget(), 'eye', 0, 3), true)
    expect(check(s, T0 + 3 * MIN).due).toBe('budget')
    expect(check(setMotion(s, false), T0 + 3 * MIN).due).toBeNull()
  })
  it('mola bitince bütçe sıfırdan sayılır; molanın süresi sayılmaz', () => {
    let s = add(emptyBudget(), 'eye', 0, 5)
    s = startRest(s, 'budget', T0 + 5 * MIN)
    expect(check(s, T0 + 7 * MIN)).toMatchObject({ locked: true, reason: 'budget', leftMs: 3 * MIN })
    expect(check(s, T0 + 10 * MIN)).toMatchObject({ locked: false, due: null, used: 0 })
    s = add(s, 'eye', 10, 12)
    expect(check(s, T0 + 12 * MIN).used).toBe(2 * MIN)
  })
  it('son 60 dk\'da 20 dk → hourly (15 dk mola); mola öncesi süre saatlik hesaba girmez', () => {
    let s = emptyBudget()
    // 4 blok × 5 dk, aralarda 5 dk mola → 20 dk göz çalışması 40 dk'da
    for (let i = 0; i < 4; i++) {
      s = add(s, 'eye', i * 10, i * 10 + 5)
      if (i < 3) s = startRest(s, 'budget', T0 + (i * 10 + 5) * MIN)
    }
    // saatlik pencere son moladan sonrası: yalnızca son blok (5 dk) → budget
    expect(check(s, T0 + 35 * MIN).due).toBe('budget')
    expect(restLengthMs('hourly', T0)).toBe(15 * MIN)
  })
  it('hourly: moladan sonra da 60 dk içinde 20 dk birikirse', () => {
    // Mola yok, testler (budget kilidi testleri kesmez; kullanıcı arka arkaya test yaparsa birikir)
    let s = add(emptyBudget(), 'test', 0, 20)
    expect(check(s, T0 + 20 * MIN).due).toBe('hourly')
  })
  it('günlük 30 dk göz oyunu/egzersizi → daily, gece yarısına kadar', () => {
    let s = emptyBudget()
    for (let i = 0; i < 6; i++) {
      s = add(s, 'eye', i * 20, i * 20 + 5)
      s = startRest(s, 'budget', T0 + (i * 20 + 5) * MIN)
    }
    const now = T0 + 121 * MIN
    expect(usage(s, now).dayEye).toBe(30 * MIN)
    expect(check(s, now).due).toBe('daily')
    const r = startRest(s, 'daily', now)
    expect(r.rest.until).toBe(nextMidnight(now))
  })
})

describe('startRest / settle / rahatsızlık', () => {
  it('rahatsızlık → 15 dk; bitmiş mola geçmişe taşınır', () => {
    let s = startRest(emptyBudget(), 'symptom', T0)
    expect(s.rest.until - T0).toBe(LIMITS.symptomRestMs)
    s = settle(s, T0 + 16 * MIN)
    expect(s.rest).toBeNull()
    expect(s.rests).toHaveLength(1)
    expect(settle(s, T0 + 17 * MIN)).toBe(s)
  })
  it('geçersiz neden → budget', () => {
    expect(startRest(emptyBudget(), 'x', T0).rest.reason).toBe('budget')
  })
})

describe('fmtLeft ve kalıcılık', () => {
  it('fmtLeft', () => {
    expect(fmtLeft(3 * MIN + 5000)).toBe('3:05')
    expect(fmtLeft(0)).toBe('0:00')
    expect(fmtLeft(2 * 3600000 + 5 * MIN)).toBe('2 sa 05 dk')
  })
  it('kaydet/yükle; bozuk kayıt boş duruma düşer', () => {
    const st = mem()
    const s = startRest(add(emptyBudget(), 'eye', 0, 5), 'budget', T0 + 5 * MIN)
    expect(saveBudget(s, st)).toBe(true)
    expect(loadBudget(st)).toEqual(s)
    st.setItem(EYE_BUDGET_KEY, '{bozuk')
    expect(loadBudget(st)).toEqual(emptyBudget())
    st.setItem(EYE_BUDGET_KEY, JSON.stringify({ v: 1, segs: [{ kind: 'x', start: 1, end: 2 }, { kind: 'eye', start: 5, end: 3 }], rest: { reason: 'nope', start: 1, until: 2 } }))
    expect(loadBudget(st)).toEqual(emptyBudget())
    expect(loadBudget(null)).toEqual(emptyBudget())
  })
})
