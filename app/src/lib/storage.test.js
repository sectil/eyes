import { describe, it, expect } from 'vitest'
import { createStore } from './storage.js'

function fakeBackend() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

describe('storage', () => {
  it('boş başlar', () => {
    const s = createStore(fakeBackend())
    expect(s.get().tests).toEqual([])
    expect(s.get().settings.calibration).toBeNull()
  })

  it('kayıtlar kalıcıdır (aynı backend ile yeniden açılınca)', () => {
    const b = fakeBackend()
    const s1 = createStore(b)
    s1.setSetting('calibration', { pxPerMm: 6.3, dpr: 3 })
    s1.addTest({ type: 'va-daily', eye: 'R', logMAR: 0.3 })
    const s2 = createStore(b)
    expect(s2.get().settings.calibration.pxPerMm).toBe(6.3)
    expect(s2.tests({ eye: 'R' })).toHaveLength(1)
    expect(s2.tests({ eye: 'R' })[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('filtreler çalışır', () => {
    const s = createStore(fakeBackend())
    s.addTest({ type: 'va-daily', eye: 'R', logMAR: 0.3 })
    s.addTest({ type: 'va-daily', eye: 'L', logMAR: 0.4 })
    s.addTest({ type: 'reading', eye: 'OU', mrs: 150 })
    expect(s.tests({ type: 'va-daily' })).toHaveLength(2)
    expect(s.tests({ type: 'va-daily', eye: 'L' })[0].logMAR).toBe(0.4)
  })

  it('bozuk veri çökertmez', () => {
    const b = fakeBackend()
    b.setItem('gozolcum:v1', '{bozuk json')
    const s = createStore(b)
    expect(s.get().tests).toEqual([])
  })

  it('yazma hatası çökertmez', () => {
    const b = fakeBackend()
    b.setItem = () => {
      throw new Error('QuotaExceeded')
    }
    const s = createStore(b)
    expect(s.setSetting('reminder', { time: '20:00' })).toBe(false)
    expect(s.get().settings.reminder.time).toBe('20:00')
  })

  it('clearAll her şeyi siler', () => {
    const b = fakeBackend()
    const s = createStore(b)
    s.addTest({ type: 'va-daily', eye: 'R', logMAR: 0.3 })
    s.clearAll()
    expect(createStore(b).get().tests).toEqual([])
  })
})
