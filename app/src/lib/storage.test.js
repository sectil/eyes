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

  it('updateSession: var olan kaydı birleştirir; id, date, type değişmez; bilinmeyen kimlik null; yazma kalıcı', () => {
    const b = fakeBackend()
    const s = createStore(b)
    const a = s.addSession({ type: 'yoga', lesson: 2, seconds: 874, before: 6, after: null })
    const other = s.addSession({ type: 'breath', seconds: 60 })
    const up = s.updateSession(a.id, { after: 3, delta: -3, hard: 'no', id: 'x', date: '2020-01-01T00:00:00.000Z', type: 'game' })
    expect(up).toEqual({ ...a, after: 3, delta: -3, hard: 'no' })
    expect(s.get().sessions).toEqual([up, other])
    // ikinci yama öncekini korur
    expect(s.updateSession(a.id, { sleepEase: 7 })).toMatchObject({ after: 3, hard: 'no', sleepEase: 7, id: a.id, date: a.date, type: 'yoga' })
    // aynı backend ile yeniden açılınca güncel kayıt
    const again = createStore(b).get().sessions
    expect(again).toHaveLength(2)
    expect(again[0]).toMatchObject({ id: a.id, after: 3, delta: -3, sleepEase: 7 })
    expect(again[1]).toEqual(other)
    // bilinmeyen kimlik, eksik kimlik, nesne olmayan yama → null; depo değişmez
    const before = s.get()
    expect(s.updateSession('yok', { after: 1 })).toBeNull()
    expect(s.updateSession(null, { after: 1 })).toBeNull()
    expect(s.updateSession(a.id, null)).toBeNull()
    expect(s.updateSession(a.id, [1])).toBeNull()
    expect(s.get()).toBe(before)
  })

  it('updateSession yazma hatasında çökertmez; bellekte günceller', () => {
    const b = fakeBackend()
    const s = createStore(b)
    const a = s.addSession({ type: 'yoga', lesson: 3, seconds: 600 })
    b.setItem = () => {
      throw new Error('QuotaExceeded')
    }
    expect(s.updateSession(a.id, { sleepEase: 8 })).toMatchObject({ sleepEase: 8 })
    expect(s.get().sessions[0].sleepEase).toBe(8)
  })

  it('clearAll her şeyi siler', () => {
    const b = fakeBackend()
    const s = createStore(b)
    s.addTest({ type: 'va-daily', eye: 'R', logMAR: 0.3 })
    s.clearAll()
    expect(createStore(b).get().tests).toEqual([])
  })
})
