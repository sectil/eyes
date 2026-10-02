import { describe, it, expect } from 'vitest'
import { HABIT_KEY, HABIT_MAX, loadHabits, addHabit, habitsOn, dayKey, keyDay } from './habitLog.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}

describe('habit-log', () => {
  it('kayıt eklenir, kaydedilir, yerel güne göre süzülür', () => {
    const st = memStorage()
    const now = new Date(2026, 8, 27, 12, 40)
    const list = addHabit('mola', now, st)
    expect(list).toEqual([{ date: '2026-09-27', type: 'mola', at: now.toISOString() }])
    addHabit('water', new Date(2026, 8, 28, 10, 0), st)
    expect(JSON.parse(st.getItem(HABIT_KEY))).toHaveLength(2)
    expect(loadHabits(st)).toHaveLength(2)
    expect(habitsOn(loadHabits(st), '2026-09-27').map((h) => h.type)).toEqual(['mola'])
    expect(habitsOn(null, '2026-09-27')).toEqual([])
  })
  it('bilinmeyen tür eklenmez (nefes store.sessions yolunda kalır)', () => {
    const st = memStorage()
    expect(addHabit('breath', new Date(), st)).toEqual([])
    expect(st.getItem(HABIT_KEY)).toBeNull()
  })
  it(`en çok ${HABIT_MAX} kayıt; en yeniler kalır`, () => {
    const st = memStorage()
    const old = Array.from({ length: HABIT_MAX }, (_, i) => ({ date: '2026-01-01', type: 'water', at: new Date(2026, 0, 1, 9, 0, i).toISOString() }))
    st.setItem(HABIT_KEY, JSON.stringify(old))
    const list = addHabit('mola', new Date(2026, 8, 27, 12, 0), st)
    expect(list).toHaveLength(HABIT_MAX)
    expect(list.at(-1).type).toBe('mola')
    expect(list[0].at).toBe(old[1].at)
  })
  it('bozuk veri ya da depolama yok → boş liste, hata yok', () => {
    const st = memStorage()
    st.setItem(HABIT_KEY, '{bozuk')
    expect(loadHabits(st)).toEqual([])
    st.setItem(HABIT_KEY, JSON.stringify([{ date: 'dün', type: 'mola', at: 'x' }, { date: '2026-09-27', type: 'mola', at: '2026-09-27T10:00:00.000Z' }]))
    expect(loadHabits(st)).toHaveLength(1)
    const broken = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    expect(loadHabits(broken)).toEqual([])
    expect(() => addHabit('mola', new Date(), broken)).not.toThrow()
  })
})

describe('gün anahtarları', () => {
  it('dayKey yerel gün; keyDay ardışık günlerde 1 artar', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(keyDay('1970-01-01')).toBe(0)
    expect(keyDay('2026-03-01') - keyDay('2026-02-28')).toBe(1)
    expect(keyDay('2026-10-26') - keyDay('2026-10-25')).toBe(1)
    expect(keyDay('bozuk')).toBeNaN()
  })
})
