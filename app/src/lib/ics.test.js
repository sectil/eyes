import { describe, it, expect } from 'vitest'
import { buildReminderIcs, firstOccurrence, escapeText } from './ics.js'

// 24 Eylül 2026 Perşembe, 10:00
const now = new Date(2026, 8, 24, 10, 0)

describe('firstOccurrence', () => {
  it('bugün seçiliyse ve saat geçmediyse bugün', () => {
    expect(firstOccurrence(['TH'], '20:00', now).getDate()).toBe(24)
  })
  it('saat geçtiyse sonraki uygun gün', () => {
    expect(firstOccurrence(['TH'], '09:00', now).getDate()).toBe(1) // 1 Ekim Perşembe
  })
  it('sonraki seçili gün', () => {
    expect(firstOccurrence(['MO', 'SA'], '20:00', now).getDate()).toBe(26) // Cumartesi
  })
})

describe('escapeText', () => {
  it('RFC 5545 kaçışları', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  })
})

describe('buildReminderIcs', () => {
  const ics = buildReminderIcs({ days: ['FR', 'MO', 'WE'], time: '20:30' }, now)
  const lines = ics.split('\r\n')

  it('CRLF satır sonları ve zarf', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(lines[0]).toBe('BEGIN:VCALENDAR')
    expect(lines).toContain('END:VCALENDAR')
    expect(ics.includes('\n') && !/[^\r]\n/.test(ics)).toBe(true)
  })
  it('haftalık tekrar, günler Pazartesi sırasıyla', () => {
    expect(lines).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR')
  })
  it('ilk etkinlik 25 Eylül Cuma 20:30 (yerel, floating)', () => {
    expect(lines).toContain('DTSTART:20260925T203000')
  })
  it('alarm var', () => {
    expect(lines).toContain('BEGIN:VALARM')
    expect(lines).toContain('TRIGGER:PT0M')
  })
  it('satırlar 75 oktetten kısa (katlama gerekmez)', () => {
    const enc = new TextEncoder()
    expect(lines.every((l) => enc.encode(l).length <= 75)).toBe(true)
  })
  it('geçersiz programda hata', () => {
    expect(() => buildReminderIcs({ days: [], time: '20:00' })).toThrow()
    expect(() => buildReminderIcs({ days: ['MO'], time: '8pm' })).toThrow()
  })
})
