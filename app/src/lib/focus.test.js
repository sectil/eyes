import { describe, it, expect } from 'vitest'
import { FOCUS_KEY, FOCUS_HOURS, loadFocus, startFocus, stopFocus } from './focus.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
const H = 3600000
const at = (base, ms) => new Date(base.getTime() + ms)

describe('çalışma oturumu', () => {
  const t0 = new Date('2026-09-27T09:00:00.000Z')
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
