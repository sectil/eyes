import { describe, it, expect } from 'vitest'
import { emptyProfile, normalizeProfile, profileFromScreening, profileSignals, profileComplete, pageComplete, screeningFromProfile, RED_FLAGS } from './profile.js'

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
  it('tamamlık sayfa bazında; kırmızı bayrak sayfası her zaman tamam', () => {
    const p = full()
    expect(profileComplete(p)).toBe(true)
    expect(pageComplete({ ...p, seizure: null }, 'safety')).toBe(false)
    expect(pageComplete({ ...p, sleep: null }, 'life')).toBe(false)
    expect(pageComplete(emptyProfile(), 'flags')).toBe(true)
    expect(profileComplete(emptyProfile())).toBe(false)
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
