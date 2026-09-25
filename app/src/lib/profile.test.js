import { describe, it, expect } from 'vitest'
import { emptyProfile, normalizeProfile, profileFromScreening, profileSignals, setupDone, screeningFromProfile, RED_FLAGS, PROFILE_VERSION } from './profile.js'

const full = () => ({
  ...emptyProfile(),
  date: '2026-09-25T10:00:00.000Z',
  ageBand: '50-59',
  correction: 'reading',
  lastExam: 'gt2',
  flags: [],
  seizure: 'no',
  nearDifficulty: 3,
  screenHours: '6+',
  sleep: 4,
  nightPhone: 'most',
  stress: { control: 3, overwhelmed: 2 },
})

describe('profile', () => {
  it('normalize: bilinmeyen değerler düşer, geçerli olanlar kalır', () => {
    const p = normalizeProfile({ ageBand: 'x', correction: 'reading', flags: ['sudden', 'nope'], sleep: 11, nearDifficulty: 2.5, stress: { control: 4, overwhelmed: 9 } })
    expect(p.ageBand).toBeNull()
    expect(p.correction).toBe('reading')
    expect(p.flags).toEqual(['sudden'])
    expect(p.sleep).toBeNull()
    expect(p.nearDifficulty).toBeNull()
    expect(p.stress).toEqual({ control: 4, overwhelmed: null })
    expect(normalizeProfile(null)).toEqual(emptyProfile())
  })
  it('kurulum kapısı: yaş ve uyarı işaretleri (Hiçbiri yok) yeter; işaret varsa kapalı', () => {
    expect(setupDone(emptyProfile())).toBe(false)
    expect(setupDone({ ...emptyProfile(), ageBand: '40-49' })).toBe(false) // işaretler cevaplanmadı
    expect(setupDone({ ...emptyProfile(), version: 2, ageBand: '40-49', flagsChecked: true })).toBe(true)
    expect(setupDone({ ...emptyProfile(), version: 2, ageBand: '40-49', flagsChecked: true, flags: ['curtain'] })).toBe(false)
  })
  it('v1 → v2 taşıma: cevaplar aynen, tarihi olan eski profilde işaretler cevaplanmış sayılır', () => {
    const v1 = { ...full(), version: 1 }
    delete v1.flagsChecked
    delete v1.prompts
    delete v1.firstLook
    const p = normalizeProfile(v1)
    expect(PROFILE_VERSION).toBe(2)
    expect(p.version).toBe(2)
    expect(p.flagsChecked).toBe(true)
    expect(p.sleep).toBe(4)
    expect(p.stress).toEqual({ control: 3, overwhelmed: 2 })
    expect(p.prompts).toEqual({})
    expect(p.firstLook).toBeNull()
    expect(normalizeProfile({ version: 1 }).flagsChecked).toBe(false) // tarihsiz: işaret sayfası geçilmemiş
    expect(normalizeProfile({ version: 2, date: '2026-09-25T10:00:00.000Z' }).flagsChecked).toBe(false) // v2 kendi alanını taşır
  })
  it('v2 alanları süzülür: firstLook ve prompts', () => {
    const p = normalizeProfile({
      version: 2,
      firstLook: { blinks: 4, seconds: 20, method: 'camera', date: '2026-09-25T10:00:00.000Z' },
      prompts: { evening: { snoozedUntil: '2026-09-26T15:00:00.000Z', junk: 1 }, 'bad id': { skipped: 'x' }, stress: { skipped: 'bozuk' } },
    })
    expect(p.firstLook).toEqual({ blinks: 4, seconds: 20, method: 'camera', date: '2026-09-25T10:00:00.000Z' })
    expect(p.prompts).toEqual({ evening: { snoozedUntil: '2026-09-26T15:00:00.000Z' } })
    expect(normalizeProfile({ firstLook: { blinks: -1, seconds: 20, method: 'camera' } }).firstLook).toBeNull()
    expect(normalizeProfile({ firstLook: { blinks: 3, seconds: 20, method: 'göz' } }).firstLook).toBeNull()
  })
  it('sinyaller: ekran 6+ → kısa bütçe; uyku ≤4; nöbet evet/emin değilim → flaş kapalı', () => {
    const s = profileSignals(full())
    expect(s).toMatchObject({ referred: false, flashSafe: true, heavyScreen: true, poorSleep: true, nightPhone: true, nearDifficulty: true, stress: 5, highStress: true, examOverdue: true })
    expect(profileSignals({ ...full(), seizure: 'unsure' }).flashSafe).toBe(false)
    expect(profileSignals({ ...full(), seizure: 'yes' }).flashSafe).toBe(false)
    expect(profileSignals(emptyProfile())).toMatchObject({ flashSafe: null, heavyScreen: false, poorSleep: false, stress: null, highStress: false })
    expect(profileSignals({ ...full(), flags: ['curtain'] }).referred).toBe(true)
  })
  it('eski kurulum kaydından yaş bandı ve göz alanları taşınır', () => {
    const p = profileFromScreening({ age: 52, flags: ['flashes'], correction: 'distance', lastExam: 'lt1' })
    expect(p.ageBand).toBe('50-59')
    expect(p.flags).toEqual(['flashes'])
    expect(p.correction).toBe('distance')
    expect(profileFromScreening({ age: 39 }).ageBand).toBe('18-39')
    expect(profileFromScreening({ age: 71 }).ageBand).toBe('70+')
    expect(profileFromScreening(null)).toEqual(emptyProfile())
  })
  it('geriye dönük screening kaydı: referred bayraklardan', () => {
    const s = screeningFromProfile({ ...full(), flags: ['sudden'] })
    expect(s.referred).toBe(true)
    expect(s.ageBand).toBe('50-59')
    expect(RED_FLAGS.map((f) => f.id)).toContain('sudden')
  })
})
