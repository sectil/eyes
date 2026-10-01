import { describe, it, expect } from 'vitest'
import {
  NUDGE_TYPES,
  TYPE_INDEX,
  TYPE_LABEL,
  DEFAULT_REMINDERS,
  WINDOW,
  WATER_LAST,
  MIN_GAP_MIN,
  normalizeReminders,
  timeError,
  enabledTypes,
  behaviorCount,
  toMinutes,
} from './reminders.js'

const WIN = 'Saat 09:00–21:00 arasında olmalı'
const WATER = 'Su hatırlatması en geç 18:00'
const GAP = 'Başka bir hatırlatmayla arasında en az 1 saat olmalı'
const withTypes = (types, extra = {}) => normalizeReminders({ types, ...extra })

describe('sabitler', () => {
  it('deney türleri, kimlik sırası, etiketler, sınırlar', () => {
    expect(NUDGE_TYPES).toEqual(['mola', 'walk', 'breath', 'water'])
    expect(TYPE_INDEX).toEqual({ mola: 0, walk: 1, breath: 2, water: 3, study: 4 })
    expect(TYPE_LABEL.study).toBe('Çalışma günleri')
    expect(WINDOW).toEqual({ from: '09:00', to: '21:00' })
    expect(WATER_LAST).toBe('18:00')
    expect(MIN_GAP_MIN).toBe(60)
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
        mola: { on: true, time: '12:30' },
        walk: { on: false, time: '15:00' },
        breath: { on: false, time: '16:30' },
        water: { on: false, time: '11:00' },
        study: { on: false },
      },
      thin: {},
      thinAsked: {},
    })
    expect(r).toEqual(normalizeReminders(DEFAULT_REMINDERS))
    r.types.mola.on = false
    expect(normalizeReminders(undefined).types.mola.on).toBe(true)
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
    expect(r.types.mola).toEqual({ on: true, time: '12:30' })
    expect(r.types.walk).toEqual({ on: true, time: '14:00' })
    expect(r.types.breath).toEqual({ on: false, time: '16:30' })
    expect(r.types.water).toEqual({ on: false, time: '11:00' })
    expect(r.types.study).toEqual({ on: true })
    expect(r.thin).toEqual({ mola: 'alt' })
    expect(r.thinAsked).toEqual({ mola: '2026-09-20T10:00:00.000Z' })
    expect(normalizeReminders({ optIn: 'yes', askedAt: '2026-09-27T09:00:00.000Z' })).toMatchObject({ optIn: 'yes', askedAt: '2026-09-27T09:00:00.000Z' })
    expect(normalizeReminders([]).optIn).toBeNull()
  })
})

describe('timeError', () => {
  it('pencere 09:00–21:00 (uçlar dahil); bozuk biçim de pencere hatası', () => {
    const r = normalizeReminders(null)
    expect(timeError('walk', '08:59', r)).toBe(WIN)
    expect(timeError('walk', '21:01', r)).toBe(WIN)
    expect(timeError('walk', '09:00', r)).toBeNull()
    expect(timeError('walk', '21:00', r)).toBeNull()
    expect(timeError('walk', '9:00', r)).toBe(WIN)
    expect(timeError('walk', undefined, r)).toBe(WIN)
  })
  it('su en geç 18:00', () => {
    const r = normalizeReminders(null)
    expect(timeError('water', '18:00', r)).toBeNull()
    expect(timeError('water', '18:01', r)).toBe(WATER)
    expect(timeError('water', '22:00', r)).toBe(WIN)
  })
  it('açık başka türle arası en az 60 dk; kapalı türler ve kendi eski saati sayılmaz', () => {
    const r = withTypes({ mola: { on: true, time: '12:30' }, breath: { on: false, time: '13:00' } })
    expect(timeError('walk', '13:00', r)).toBe(GAP)
    expect(timeError('walk', '12:00', r)).toBe(GAP)
    expect(timeError('walk', '13:30', r)).toBeNull()
    expect(timeError('walk', '11:30', r)).toBeNull()
    expect(timeError('water', '13:00', withTypes({ mola: { on: false } }))).toBeNull()
    expect(timeError('mola', '12:45', r)).toBeNull()
  })
  it('Çalışma günleri açıksa saati de aralığa girer; kendi saatine pencere uygulanmaz', () => {
    const r = withTypes({ mola: { on: false }, study: { on: true } })
    const study = { days: ['MO'], time: '20:00' }
    expect(timeError('walk', '19:30', r, study)).toBe(GAP)
    expect(timeError('walk', '19:30', withTypes({ mola: { on: false }, study: { on: false } }), study)).toBeNull()
    expect(timeError('study', '22:30', normalizeReminders(null))).toBeNull()
    expect(timeError('study', '13:00', normalizeReminders(null))).toBe(GAP)
    expect(timeError('study', 'x', normalizeReminders(null))).toBe(WIN)
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
