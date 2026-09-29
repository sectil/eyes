import { describe, it, expect } from 'vitest'
import { defaultCorrection, acuityStart, createEyeSaver, lastAcuityCorrection, PROFILE_PRESELECT, WEAR_IDS } from './acuityStart.js'
import { CORRECTION, WEAR_FROM_CORRECTION } from './profile.js'
import { PROTOCOL } from './reading.js'

const NOW = new Date('2026-09-25T10:00:00')
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const va = (correction, n = 3, type = 'va-daily', eye = 'R') => ({ type, eye, logMAR: 0.1, correction, date: daysAgo(n) })
const rd = (correction, n = 2) => ({ type: 'reading', protocol: PROTOCOL, correction, criticalPrintSize: 0.3, date: daysAgo(n) })

describe('defaultCorrection: gözlük ön seçimi (karar S10)', () => {
  it('öncelik: son E testi → son okuma testi → profil cevabı → boş', () => {
    const profile = { correction: 'progressive' }
    expect(defaultCorrection({ tests: [va('none'), rd('reading')], profile })).toEqual({ value: 'none', source: 'acuity', legacy: false })
    expect(defaultCorrection({ tests: [rd('reading')], profile })).toEqual({ value: 'reading', source: 'reading', legacy: false })
    expect(defaultCorrection({ tests: [], profile })).toEqual({ value: 'progressive', source: 'profile', legacy: false })
    expect(defaultCorrection({ tests: [], profile: null })).toEqual({ value: null, source: null, legacy: false })
    expect(defaultCorrection()).toEqual({ value: null, source: null, legacy: false })
  })

  it('son E testi haftalık ya da günlük olabilir; en son kayıt kazanır', () => {
    expect(defaultCorrection({ tests: [va('reading', 9, 'va-weekly'), va('contacts', 2)] }).value).toBe('contacts')
    expect(defaultCorrection({ tests: [va('none', 9), va('progressive', 1, 'va-weekly', 'OU')] }).value).toBe('progressive')
    expect(lastAcuityCorrection([va('none', 9), va('reading', 1)])).toBe('reading')
  })

  it('profilde "distance" ve "contacts-multi" belirsiz: ön seçilmez', () => {
    expect(defaultCorrection({ tests: [], profile: { correction: 'distance' } }).value).toBeNull()
    expect(defaultCorrection({ tests: [], profile: { correction: 'contacts-multi' } }).value).toBeNull()
    for (const id of ['none', 'reading', 'progressive']) expect(defaultCorrection({ profile: { correction: id } })).toEqual({ value: id, source: 'profile', legacy: false })
    // her profil cevabı ya ön seçilir ya da açıkça dışarıda; ön seçilen her değer bir test seçeneği
    const listed = CORRECTION.map((c) => c.id)
    expect(Object.keys(PROFILE_PRESELECT).every((k) => listed.includes(k))).toBe(true)
    expect(Object.values(PROFILE_PRESELECT).every((v) => WEAR_IDS.includes(v))).toBe(true)
    expect(listed.filter((k) => !(k in PROFILE_PRESELECT))).toEqual(['distance', 'contacts-multi'])
    expect(Object.keys(WEAR_FROM_CORRECTION)).toEqual(expect.arrayContaining(listed)) // okuma testi eşlemesi değişmedi
  })

  it('testte açıkça seçilen "Yalnız uzak gözlüğü" hatırlanır (belirsiz olan yalnız profil cevabı)', () => {
    expect(defaultCorrection({ tests: [va('distance')], profile: { correction: 'reading' } })).toEqual({ value: 'distance', source: 'acuity', legacy: false })
    expect(defaultCorrection({ tests: [rd('distance')] }).value).toBe('distance')
  })

  it('eski "glasses" kaydı ön seçilmez ve okuma/profile düşmez (ekran hangisi olduğunu sorar)', () => {
    expect(defaultCorrection({ tests: [va('glasses'), rd('reading')], profile: { correction: 'reading' } })).toEqual({ value: null, source: 'acuity', legacy: true })
  })

  it('son E testinde seçim yoksa (çok eski kayıt) okuma testine geçilir; eski okuma (protokol 1) ve bozuk değer sayılmaz', () => {
    expect(defaultCorrection({ tests: [va(undefined), rd('reading')] })).toMatchObject({ value: 'reading', source: 'reading' })
    expect(defaultCorrection({ tests: [{ type: 'reading', correction: 'reading', date: daysAgo(1) }], profile: { correction: 'none' } })).toMatchObject({ value: 'none', source: 'profile' })
    expect(defaultCorrection({ tests: [va('bozuk')], profile: { correction: 'toString' } })).toEqual({ value: null, source: null, legacy: false })
  })
})

describe('acuityStart: teste başlarken hazır gelenler', () => {
  const today = (eye, type = 'va-weekly', correction = 'reading') => ({ type, eye, correction, logMAR: 0.1, date: new Date(NOW.getTime() - 3600000).toISOString() })

  it('yarım haftalık: biten gözler atlanır, gözlük bugünkü seçim; koşu günü açılışın yerel günü', () => {
    const s = acuityStart({ plan: 'weekly', tests: [today('R')], settings: { profile: { correction: 'none' } }, now: NOW })
    expect(s).toEqual({ skipEyes: ['R'], lastCorrection: 'reading', defaultCorrection: 'reading', correctionSource: 'acuity', newBaseline: false, todayHolds: true, runDay: '2026-09-25' })
  })

  // İnceleme bulgusu R-N4b: kilitli gözlük satırı aynı haftalık koşunun kaydedilen gözünden gelir
  it('yarım günde gözlük: bu koşunun kaydedilen gözünün seçimi; arada yapılan günlük test (başka gözlük) değiştirmez', () => {
    const at = (h) => new Date(NOW.getTime() - h * 3600000).toISOString()
    const weeklyR = { type: 'va-weekly', eye: 'R', correction: 'reading', logMAR: 0.1, date: at(2), runDay: '2026-09-25' }
    const daily = ['R', 'L'].map((eye) => ({ type: 'va-daily', eye, correction: 'none', logMAR: 0.1, date: at(1), runDay: '2026-09-25' }))
    const s = acuityStart({ plan: 'weekly', tests: [weeklyR, ...daily], settings: { profile: { correction: 'progressive' } }, now: NOW })
    expect(s).toMatchObject({ skipEyes: ['R'], defaultCorrection: 'reading', correctionSource: 'acuity' })
    expect(s.lastCorrection).toBe('none') // en son E testi (gözlük sayfası notları için) yine günlük
    // tam ya da boş günde S10 önceliği sürer: en son E testi
    expect(acuityStart({ plan: 'weekly', tests: [{ ...weeklyR, date: daysAgo(9), runDay: '2026-09-16' }, ...daily], now: NOW }).defaultCorrection).toBe('none')
  })

  // İnceleme bulgusu R-N2: koşu günü (runDay) gece yarısını geçen koşuyu başladığı güne sayar
  it('gece yarısını geçen koşu: yarım kalan gün ertesi gün baştan açılır; aynı gün dönülürse kalan gözden sürer', () => {
    const D = '2026-09-24'
    const R = { type: 'va-weekly', eye: 'R', correction: 'reading', logMAR: 0.1, date: new Date('2026-09-24T23:59:00').toISOString(), runDay: D, newBaseline: true }
    const L = { ...R, eye: 'L', date: new Date('2026-09-25T00:01:00').toISOString(), newBaseline: undefined }
    const next = acuityStart({ plan: 'weekly', tests: [R, L], settings: { profile: { correction: 'none' } }, now: new Date('2026-09-25T00:05:00') })
    expect(next).toMatchObject({ skipEyes: [], newBaseline: false, runDay: '2026-09-25', defaultCorrection: 'reading' })
    const same = acuityStart({ plan: 'weekly', tests: [R], now: new Date('2026-09-24T23:59:30') })
    expect(same).toMatchObject({ skipEyes: ['R'], newBaseline: true, runDay: D, defaultCorrection: 'reading' })
  })

  it('yarım günde sağ göz "Evet, yenilendi" ile kaydedildiyse kalan gözler de yeni seriyle (newBaseline)', () => {
    const r = { ...today('R'), newBaseline: true }
    expect(acuityStart({ plan: 'weekly', tests: [r], now: NOW }).newBaseline).toBe(true)
    // dünkü yenileme bugünkü yarım testi etkilemez; tam günde de yok
    const y = { ...r, date: new Date(NOW.getTime() - 26 * 3600000).toISOString() }
    expect(acuityStart({ plan: 'weekly', tests: [y, today('R')], now: NOW }).newBaseline).toBe(false)
    expect(acuityStart({ plan: 'daily', tests: [{ ...r, type: 'va-daily' }, today('L', 'va-daily')], now: NOW })).toMatchObject({ skipEyes: [], newBaseline: false })
    // başka türün yenilemesi sayılmaz
    expect(acuityStart({ plan: 'weekly', tests: [{ ...r, type: 'va-daily' }, today('R')], now: NOW }).newBaseline).toBe(false)
  })

  it('kısa test (plan daily) Bugün\'ün yolunda yok: kalanlar Bugün\'de beklemez (todayHolds false); haftalıkta bekler', () => {
    // karar 2026-09-29: kısa E testi hiçbir gün yolda değil (haftalık zamanı gelmiş ya da bu hafta tamam)
    expect(acuityStart({ plan: 'daily', tests: [], now: NOW }).todayHolds).toBe(false)
    const yday = (eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: new Date(NOW.getTime() - 26 * 3600000).toISOString() })
    expect(acuityStart({ plan: 'daily', tests: ['R', 'L', 'OU'].map(yday), now: NOW }).todayHolds).toBe(false)
    expect(acuityStart({ plan: 'weekly', tests: [], now: NOW }).todayHolds).toBe(true)
    expect(acuityStart({ plan: 'weekly', tests: ['R', 'L', 'OU'].map(yday), now: NOW }).todayHolds).toBe(true)
  })

  it('günlük plan yalnız günlük kayıtlarına bakar; haftalık kaydı günlükte göz atlatmaz', () => {
    expect(acuityStart({ plan: 'daily', tests: [today('R')], now: NOW }).skipEyes).toEqual([])
    expect(acuityStart({ plan: 'daily', tests: [today('R', 'va-daily')], now: NOW }).skipEyes).toEqual(['R'])
    expect(acuityStart({ plan: 'weekly', tests: [today('R', 'va-daily')], now: NOW }).skipEyes).toEqual([])
  })

  it('profil ayarlardan okunur (eski kurulum kaydı dahil)', () => {
    expect(acuityStart({ plan: 'weekly', tests: [], settings: { profile: { correction: 'reading' } }, now: NOW })).toMatchObject({ defaultCorrection: 'reading', correctionSource: 'profile', lastCorrection: null })
    expect(acuityStart({ plan: 'weekly', tests: [], settings: { screening: { age: 52, correction: 'progressive' } }, now: NOW }).defaultCorrection).toBe('progressive')
    expect(acuityStart({ plan: 'weekly', tests: [], settings: { profile: { correction: 'distance' } }, now: NOW }).defaultCorrection).toBeNull()
    expect(acuityStart({ plan: 'weekly', tests: [], settings: undefined, now: NOW }).defaultCorrection).toBeNull()
  })
})

describe('createEyeSaver: biten göz hemen kaydedilir (karar S4)', () => {
  it('her göz bir kez yazılır; sondaki sonuçlardan yalnız kaydedilmemiş olanlar döner', () => {
    const written = []
    const saver = createEyeSaver((r) => written.push(r))
    const R = { type: 'va-weekly', eye: 'R' }
    const L = { type: 'va-weekly', eye: 'L' }
    const OU = { type: 'va-weekly', eye: 'OU' }
    expect(saver.save(R)).toBe(true)
    expect(saver.save({ ...R })).toBe(false) // aynı göz iki kez yazılmaz (kopya da olsa)
    expect(saver.save(L)).toBe(true)
    expect(written).toEqual([R, L])
    expect(saver.finish([R, L, OU])).toEqual([OU])
    expect(saver.finish([R, L, OU])).toEqual([])
    expect(saver.save(null)).toBe(false)
  })
  it('onSaveEye çağırmayan akış: bütün sonuçlar sonda döner (veri kaybolmaz); sonuç yoksa boş', () => {
    const saver = createEyeSaver(() => {
      throw new Error('çağrılmamalı')
    })
    const all = [{ eye: 'R' }, { eye: 'L' }]
    expect(saver.finish(all)).toEqual(all)
    expect(createEyeSaver(() => {}).finish(undefined)).toEqual([])
  })
})
