import { describe, it, expect } from 'vitest'
import { FOCUS_KEY, FOCUS_HOURS, loadFocus, startFocus, stopFocus, focusFits, inBreakWindow, breakTimes } from './focus.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
const H = 3600000
const at = (base, ms) => new Date(base.getTime() + ms)

describe('çalışma oturumu', () => {
  const t0 = new Date(2026, 8, 27, 9, 0) // yerel saat (gece kuralı yerel saate bakar; Bug 33)
  it('başlatınca bitiş ve ilk mola (60. dk) hesaplanır, kaydedilir', () => {
    const st = memStorage()
    expect(FOCUS_HOURS).toEqual([1, 2, 4])
    const s = startFocus(2, t0, st)
    expect(s).toEqual({ startedAt: t0.toISOString(), hours: 2, endsAt: at(t0, 2 * H), nextBreakAt: at(t0, H) })
    expect(JSON.parse(st.getItem(FOCUS_KEY))).toEqual({ startedAt: t0.toISOString(), hours: 2 })
  })
  it('sıradaki mola saat saat ilerler; son mola bitişte', () => {
    const st = memStorage()
    startFocus(4, t0, st)
    expect(loadFocus(at(t0, 30 * 60000), st).nextBreakAt).toEqual(at(t0, H))
    expect(loadFocus(at(t0, 61 * 60000), st).nextBreakAt).toEqual(at(t0, 2 * H))
    expect(loadFocus(at(t0, 3.5 * H), st).nextBreakAt).toEqual(at(t0, 4 * H))
  })
  it('bitmiş oturum null döner ve silinir', () => {
    const st = memStorage()
    startFocus(1, t0, st)
    expect(loadFocus(at(t0, H - 1), st)).not.toBeNull()
    expect(loadFocus(at(t0, H), st)).toBeNull()
    expect(st.getItem(FOCUS_KEY)).toBeNull()
  })
  it('geçersiz süre başlamaz; bozuk kayıt silinir; Bitir siler', () => {
    const st = memStorage()
    expect(startFocus(3, t0, st)).toBeNull()
    expect(st.getItem(FOCUS_KEY)).toBeNull()
    st.setItem(FOCUS_KEY, JSON.stringify({ startedAt: 'dün', hours: 2 }))
    expect(loadFocus(t0, st)).toBeNull()
    expect(st.getItem(FOCUS_KEY)).toBeNull()
    st.setItem(FOCUS_KEY, '{bozuk')
    expect(loadFocus(t0, st)).toBeNull()
    startFocus(2, t0, st)
    stopFocus(st)
    expect(loadFocus(t0, st)).toBeNull()
  })
  it('depolama erişilemezse hata yok', () => {
    const broken = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
      removeItem() {
        throw new Error('blocked')
      },
    }
    expect(loadFocus(t0, broken)).toBeNull()
    expect(startFocus(1, t0, broken)).toMatchObject({ hours: 1 })
    expect(() => stopFocus(broken)).not.toThrow()
  })
})

describe('çalışma oturumu: gece mola yok (Bug 33)', () => {
  const H = 3600000
  const local = (h, m = 0) => new Date(2026, 8, 30, h, m)
  it('pencere 09:00–21:00, uçlar dahil', () => {
    expect(inBreakWindow(local(8, 59).getTime())).toBe(false)
    expect(inBreakWindow(local(9, 0).getTime())).toBe(true)
    expect(inBreakWindow(local(21, 0).getTime())).toBe(true)
    expect(inBreakWindow(local(21, 1).getTime())).toBe(false)
    expect(inBreakWindow(local(1, 0).getTime())).toBe(false)
  })
  it('mola anları yalnız pencerede; gece yarısı 4 saat → hiç', () => {
    expect(breakTimes(local(0, 0).getTime(), 4)).toEqual([])
    expect(breakTimes(local(20, 0).getTime(), 4)).toEqual([local(21, 0).getTime()])
    expect(breakTimes(local(10, 0).getTime(), 2)).toEqual([local(11, 0).getTime(), local(12, 0).getTime()])
  })
  it('ilk mola pencereye sığmıyorsa oturum başlamaz', () => {
    const st = memStorage()
    expect(focusFits(local(7, 59))).toBe(false)
    expect(focusFits(local(8, 0))).toBe(true)
    expect(focusFits(local(20, 0))).toBe(true)
    expect(focusFits(local(20, 1))).toBe(false)
    expect(startFocus(4, local(23, 30), st)).toBeNull()
    expect(st.getItem(FOCUS_KEY)).toBeNull()
  })
  it('süren oturumun pencerede molası kalmadıysa sıradaki mola null', () => {
    const st = memStorage()
    const s = startFocus(4, local(19, 30), st)
    expect(s.nextBreakAt).toEqual(local(20, 30))
    expect(loadFocus(local(20, 40), st).nextBreakAt).toBeNull() // 21.30, 22.30, 23.30 pencere dışı
    expect(loadFocus(local(20, 40), st).endsAt).toEqual(new Date(local(19, 30).getTime() + 4 * H))
  })
})
