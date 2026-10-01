import { describe, it, expect } from 'vitest'
import { promptFor, makeRecord, weekDays, PROMPTS, NOTE_MAX } from './notice.js'

describe('günlük fark etme görevi', () => {
  it('görev her gün değişir, aynı gün aynı', () => {
    const a = promptFor(new Date(2026, 8, 25, 9))
    expect(promptFor(new Date(2026, 8, 25, 21))).toBe(a)
    expect(promptFor(new Date(2026, 8, 26, 9))).not.toBe(a)
    const seen = new Set(Array.from({ length: PROMPTS.length }, (_, i) => promptFor(new Date(2026, 8, 1 + i)).id))
    expect(seen.size).toBe(PROMPTS.length)
  })
  it('kayıt: sayı indeksi, not kırpılır, boş not yazılmaz', () => {
    expect(makeRecord({ prompt: PROMPTS[0], count: '3+' })).toEqual({ type: 'notice', prompt: 'red', count: 3, seconds: 0 })
    expect(makeRecord({ prompt: PROMPTS[0], count: '1', note: 'x'.repeat(200) }).note).toHaveLength(NOTE_MAX)
  })
  it('bu hafta kaç gün', () => {
    const now = new Date(2026, 8, 25, 20)
    const d = (n) => new Date(2026, 8, n, 20).toISOString()
    expect(weekDays([{ type: 'notice', date: d(25) }, { type: 'notice', date: d(25) }, { type: 'notice', date: d(20) }, { type: 'notice', date: d(10) }], now)).toBe(2)
  })
})
