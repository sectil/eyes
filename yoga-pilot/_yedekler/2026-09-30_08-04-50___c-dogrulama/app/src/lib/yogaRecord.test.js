// Yoga ders kaydı (modul.md §6.1, §16-A1; PLAN.v3 §D.4): 30 sn kuralı, %60 + kapanış tamamlanma kuralı, puanlar ve
// kaydın önce yazılıp puanların sonra eklenmesi.
import { describe, it, expect, vi } from 'vitest'
import {
  makeYogaRecord, isCompleted, afterPatch, recordWriter, rating, isYoga, isYogaDone, minutesOf, dayCount,
  MIN_SAVE_SEC, COMPLETE_SHARE,
} from './yogaRecord.js'

const base = { lesson: 2, planned: 900, startedAt: '2026-10-01T09:00:00.000Z', endedAt: '2026-10-01T09:15:00.000Z' }

describe('kayıt kurma', () => {
  it('30 sn altı kaydedilmez; 30 sn kaydedilir', () => {
    expect(MIN_SAVE_SEC).toBe(30)
    expect(makeYogaRecord({ ...base, seconds: 29 })).toBeNull()
    expect(makeYogaRecord({ ...base, seconds: 29.4 })).toBeNull()
    expect(makeYogaRecord({ ...base, seconds: 30 })).toMatchObject({ type: 'yoga', lesson: 2, seconds: 30, planned: 900 })
    expect(makeYogaRecord({ ...base, lesson: 4, seconds: 300 })).toBeNull() // veride olmayan ders
  })
  it('tamamlandı = kapanışa ulaşıldı VE planlananın en az %60\'ı dinlendi', () => {
    expect(COMPLETE_SHARE).toBe(0.6)
    expect(isCompleted({ reachedClosing: true, seconds: 540, planned: 900 })).toBe(true)
    expect(isCompleted({ reachedClosing: true, seconds: 539, planned: 900 })).toBe(false)
    expect(isCompleted({ reachedClosing: false, seconds: 900, planned: 900 })).toBe(false)
    expect(makeYogaRecord({ ...base, seconds: 880, reachedClosing: true }).completed).toBe(true)
    expect(makeYogaRecord({ ...base, seconds: 880, reachedClosing: false }).completed).toBe(false)
  })
  it('"Kapanışa geç" 60. sn\'de: kapanışa ulaşıldı, tamamlanma süreye göre (3 dk\'lık ders)', () => {
    const r = makeYogaRecord({ ...base, planned: 180, seconds: 60 + 45, reachedClosing: true, quickClose: true })
    expect(r).toMatchObject({ reachedClosing: true, quickClose: true, completed: false })
    expect(makeYogaRecord({ ...base, planned: 180, seconds: 108, reachedClosing: true, quickClose: true }).completed).toBe(true)
  })
  it('puan 1–10 dışı null; delta = sonra − önce; tarih dersin bitiş anı', () => {
    for (const bad of [0, 11, 3.5, '5', null, undefined, NaN]) expect(rating(bad)).toBeNull()
    const r = makeYogaRecord({ ...base, seconds: 600, before: 6, after: 3 })
    expect(r).toMatchObject({ before: 6, after: 3, delta: -3, date: base.endedAt, startedAt: base.startedAt })
    expect(makeYogaRecord({ ...base, seconds: 600, before: 0, after: 3 })).toMatchObject({ before: null, after: 3, delta: null })
  })
  it('Uykuya Geçiş: önce/sonra hep null, müzik kuyruğu kayda girer ama dinlenen süreye sayılmaz', () => {
    const r = makeYogaRecord({ lesson: 3, planned: 900, seconds: 900, reachedClosing: true, before: 5, after: 8, musicTail: 10 })
    expect(r).toMatchObject({ before: null, after: null, delta: null, musicTail: 10, seconds: 900, completed: true })
    expect('scene' in r).toBe(false)
    expect('musicTail' in makeYogaRecord({ ...base, seconds: 100 })).toBe(false)
  })
  it('şema alanları (modul.md §6.1)', () => {
    const r = makeYogaRecord({ ...base, seconds: 874, reachedClosing: true, voice: 'hoc', bg: 'music', scene: 'orman', planVersion: 'p', contentHash: 'h', hard: 'much' })
    expect(Object.keys(r).sort()).toEqual(['after', 'before', 'bg', 'clarity', 'completed', 'contentHash', 'date', 'delta', 'hard', 'lesson', 'planVersion', 'planned', 'posture', 'quickClose', 'reachedClosing', 'resumed', 'scene', 'seconds', 'startedAt', 'type', 'voice'])
    expect(r).toMatchObject({ posture: 'lie', voice: 'hoc', bg: 'music', scene: 'orman', hard: 'much' })
    expect(makeYogaRecord({ ...base, seconds: 100, hard: 'maybe' }).hard).toBeNull()
  })
  it('isYoga / isYogaDone', () => {
    expect(isYoga({ type: 'yoga', lesson: 2 })).toBe(true)
    expect(isYoga({ type: 'yoga' })).toBe(false)
    expect(isYoga({ type: 'dalga', lesson: 2 })).toBe(false)
    expect(isYogaDone({ type: 'yoga', lesson: 2, completed: true })).toBe(true)
    expect(isYogaDone({ type: 'yoga', lesson: 2, completed: false })).toBe(false)
  })
})

describe('sonradan eklenenler', () => {
  it('afterPatch: sonra puanı ve delta; zorlanma cevabı; Uykuya Geçiş\'te puan eklenmez', () => {
    const rec = makeYogaRecord({ ...base, seconds: 600, before: 6 })
    expect(afterPatch(rec, { after: 3 })).toEqual({ after: 3, delta: -3 })
    expect(afterPatch(rec, { after: 12 })).toEqual({ after: null, delta: null })
    expect(afterPatch(rec, { hard: 'some' })).toEqual({ hard: 'some' })
    expect(afterPatch({ ...rec, before: null }, { after: 4 })).toEqual({ after: 4, delta: null })
    expect(afterPatch({ ...rec, lesson: 3 }, { after: 4 })).toEqual({})
  })
  it('yazıcı: kayıt bir kez eklenir, puanlar updateSession ile aynı kayda', () => {
    const store = { addSession: vi.fn((r) => ({ id: 'k1', ...r })), updateSession: vi.fn() }
    const w = recordWriter(store)
    const rec = makeYogaRecord({ ...base, seconds: 600, before: 6 })
    w.save(rec)
    w.save(rec)
    expect(store.addSession).toHaveBeenCalledTimes(1)
    w.patch(afterPatch(w.record, { after: 3 }))
    w.patch(afterPatch(w.record, { hard: 'no' }))
    expect(store.updateSession.mock.calls).toEqual([['k1', { after: 3, delta: -3 }], ['k1', { hard: 'no' }]])
    w.flush()
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(w.record).toMatchObject({ after: 3, delta: -3, hard: 'no' })
  })
  it('depoda updateSession yoksa: kayıt akışın sonunda tek sefer, puanlarla birlikte eklenir', () => {
    const store = { addSession: vi.fn((r) => r) }
    const w = recordWriter(store)
    w.save(makeYogaRecord({ ...base, seconds: 600, before: 6 }))
    w.patch({ after: 2, delta: -4 })
    expect(store.addSession).not.toHaveBeenCalled()
    w.flush()
    w.flush()
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(store.addSession.mock.calls[0][0]).toMatchObject({ before: 6, after: 2, delta: -4 })
  })
  it('30 sn altı (kayıt yok): yazıcı hiçbir şey eklemez', () => {
    const store = { addSession: vi.fn(), updateSession: vi.fn() }
    const w = recordWriter(store)
    w.save(makeYogaRecord({ ...base, seconds: 10 }))
    w.patch({ hard: 'much' })
    w.flush()
    expect(store.addSession).not.toHaveBeenCalled()
    expect(store.updateSession).not.toHaveBeenCalled()
  })
})

describe('sayılar', () => {
  it('dakika ve farklı pratik günü (yerel takvim günü; aynı gün iki ders bir gün)', () => {
    const list = [
      { date: new Date(2026, 9, 1, 8).toISOString(), seconds: 300 },
      { date: new Date(2026, 9, 1, 21).toISOString(), seconds: 900 },
      { date: new Date(2026, 9, 3, 7).toISOString(), seconds: 170 },
      { date: 'bozuk', seconds: 60 },
    ]
    expect(minutesOf(list)).toBe(24)
    expect(dayCount(list)).toBe(2)
    expect(dayCount([])).toBe(0)
  })
})
