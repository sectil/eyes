import { describe, it, expect } from 'vitest'
import { howtoSeen, markHowtoSeen, resetHowto, resetAllHowto, HOWTO_PREFIX } from './howto.js'

function mem() {
  const m = new Map()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), get length() { return m.size }, key: (i) => [...m.keys()][i] ?? null }
}
describe('howto', () => {
  it('bir kez görüldü, sıfırlanır, hepsi silinir', () => {
    const s = mem()
    expect(howtoSeen('acuity', s)).toBe(false)
    markHowtoSeen('acuity', s)
    expect(howtoSeen('acuity', s)).toBe(true)
    resetHowto('acuity', s)
    expect(howtoSeen('acuity', s)).toBe(false)
    markHowtoSeen('a', s); markHowtoSeen('b', s); s.setItem('gozolcum:v1', '{}')
    resetAllHowto(s)
    expect(howtoSeen('a', s)).toBe(false)
    expect(s.getItem('gozolcum:v1')).toBe('{}')
    expect(HOWTO_PREFIX).toBe('gozolcum:howto:')
  })
  it('depolama yoksa patlamaz', () => {
    expect(howtoSeen('x', null)).toBe(false)
    expect(() => markHowtoSeen('x', null)).not.toThrow()
  })
})
