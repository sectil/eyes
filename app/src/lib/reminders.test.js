import { describe, it, expect } from 'vitest'
import {
  NUDGE_TYPES,
  TYPE_INDEX,
  TYPE_LABEL,
  DEFAULT_REMINDERS,
  ALL_DAYS,
  TIME_ERROR,
  normalizeDays,
  normalizeReminders,
  timeError,
  enabledTypes,
  behaviorCount,
  toMinutes,
} from './reminders.js'

const withTypes = (types, extra = {}) => normalizeReminders({ types, ...extra })

describe('sabitler', () => {
  it('türler, kimlik sırası, etiketler, günler (saat sınırı yok: D5+D6)', () => {
    expect(NUDGE_TYPES).toEqual(['mola', 'walk', 'breath', 'water'])
    expect(TYPE_INDEX).toEqual({ mola: 0, walk: 1, breath: 2, water: 3, study: 4 })
    expect(TYPE_LABEL.study).toBe('Çalışma günleri')
    expect(ALL_DAYS).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
  it('toMinutes: geçersiz biçim null', () => {
    expect(toMinutes('12:30')).toBe(750)
    expect(toMinutes('9:00')).toBeNull()
    expect(toMinutes('24:00')).toBeNull()
    expect(toMinutes('12:60')).toBeNull()
    expect(toMinutes(null)).toBeNull()
  })
})

describe('normalizeReminders', () => {
  it('boş girdi → varsayılan; yalnız mola açık; her çağrı yeni nesne', () => {
    const r = normalizeReminders(null)
    expect(r).toEqual({
      optIn: null,
      askedAt: null,
      types: {
        mola: { on: true, time: '12:30', days: [0, 1, 2, 3, 4, 5, 6] },
        walk: { on: false, time: '15:00', days: [0, 1, 2, 3, 4, 5, 6] },
        breath: { on: false, time: '16:30', days: [0, 1, 2, 3, 4, 5, 6] },
        water: { on: false, time: '11:00', days: [0, 1, 2, 3, 4, 5, 6] },
        study: { on: false },
      },
      thin: {},
      thinAsked: {},
    })
    expect(r).toEqual(normalizeReminders(DEFAULT_REMINDERS))
    r.types.mola.on = false
    r.types.mola.days.pop()
    expect(normalizeReminders(undefined).types.mola.on).toBe(true)
    expect(normalizeReminders(undefined).types.mola.days).toEqual(ALL_DAYS)
    expect(DEFAULT_REMINDERS.types.mola.on).toBe(true)
  })
  it('bozuk alanlar varsayılana döner, geçerliler kalır', () => {
    const r = normalizeReminders({
      optIn: 'belki',
      askedAt: 'dün',
      types: { mola: { on: 'evet', time: '25:00' }, walk: { on: true, time: '14:00' }, breath: null, water: 'x', study: { on: true } },
      thin: { mola: 'alt', walk: 'x', foo: 'alt' },
      thinAsked: { mola: '2026-09-20T10:00:00.000Z', walk: 'dün' },
    })
    expect(r.optIn).toBeNull()
    expect(r.askedAt).toBeNull()
    expect(r.types.mola).toEqual({ on: true, time: '12:30', days: ALL_DAYS })
    expect(r.types.walk).toEqual({ on: true, time: '14:00', days: ALL_DAYS })
    expect(r.types.breath).toEqual({ on: false, time: '16:30', days: ALL_DAYS })
    expect(r.types.water).toEqual({ on: false, time: '11:00', days: ALL_DAYS })
    expect(r.types.study).toEqual({ on: true })
    expect(r.thin).toEqual({ mola: 'alt' })
    expect(r.thinAsked).toEqual({ mola: '2026-09-20T10:00:00.000Z' })
    expect(normalizeReminders({ optIn: 'yes', askedAt: '2026-09-27T09:00:00.000Z' })).toMatchObject({ optIn: 'yes', askedAt: '2026-09-27T09:00:00.000Z' })
    expect(normalizeReminders([]).optIn).toBeNull()
  })
})

describe('günler', () => {
  it('eski kayıtta gün yoksa her gün; seçilen günler sıralı ve tekrarsız kalır', () => {
    expect(withTypes({ mola: { on: true, time: '12:30' } }).types.mola.days).toEqual(ALL_DAYS)
    expect(withTypes({ mola: { on: true, time: '12:30', days: [5, 1, 3, 1] } }).types.mola).toEqual({ on: true, time: '12:30', days: [1, 3, 5] })
    expect(withTypes({ walk: { on: true, days: [0] } }).types.walk.days).toEqual([0])
  })
  it('bozuk ya da boş gün listesi her gün sayılır; geçersiz değerler atılır', () => {
    for (const days of [undefined, null, 'Pt', [], [7, -1, 1.5, '2'], {}]) expect(normalizeDays(days)).toEqual(ALL_DAYS)
    expect(normalizeDays([6, 9, 2, '3'])).toEqual([2, 6])
    const d = normalizeDays(null)
    d.pop()
    expect(ALL_DAYS).toHaveLength(7)
  })
  it('eski "Gün aşırı" kaydı okunur ama günleri değiştirmez', () => {
    const r = withTypes({ mola: { on: true, time: '12:30' } }, { thin: { mola: 'alt' } })
    expect(r.thin).toEqual({ mola: 'alt' })
    expect(r.types.mola.days).toEqual(ALL_DAYS)
  })
})

describe('timeError', () => {
  it('yalnız geçersiz saat: pencere, "su en geç" ve türler arası aralık yok (D5+D6)', () => {
    const r = withTypes({ mola: { on: true, time: '12:30' }, study: { on: true } })
    const study = { days: ['MO'], time: '20:00' }
    for (const t of ['00:00', '06:35', '08:59', '12:30', '12:45', '20:00', '21:01', '23:59']) {
      for (const type of ['mola', 'walk', 'breath', 'water', 'study']) expect(timeError(type, t, r, study)).toBeNull()
    }
    for (const bad of ['9:00', '24:00', '12:60', '', undefined, null]) expect(timeError('walk', bad, r)).toBe(TIME_ERROR)
    expect(TIME_ERROR).toBe('Bir saat seç')
  })
})

describe('enabledTypes / behaviorCount', () => {
  it('sabit sırayla açık deney türleri; Çalışma günleri hariç', () => {
    expect(enabledTypes(null)).toEqual(['mola'])
    const r = withTypes({ water: { on: true }, walk: { on: true }, study: { on: true } })
    expect(enabledTypes(r)).toEqual(['mola', 'walk', 'water'])
  })
  it('mola 2, diğerleri 1 sayılır (Wilson notu üçüncü davranışta)', () => {
    expect(behaviorCount(null)).toBe(2)
    expect(behaviorCount(withTypes({ walk: { on: true } }))).toBe(3)
    expect(behaviorCount(withTypes({ mola: { on: false }, walk: { on: true }, water: { on: true } }))).toBe(2)
    expect(behaviorCount(withTypes({ walk: { on: true }, breath: { on: true }, water: { on: true }, study: { on: true } }))).toBe(5)
  })
})
