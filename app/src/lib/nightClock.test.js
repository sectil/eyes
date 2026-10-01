import { describe, expect, it } from 'vitest'
import { nextDrift, untilShort, alarmLabel, spoken, STEP_MAX, BOUND } from './nightClock.js'

// Tekrarlanabilir rastgele sayı (mulberry32)
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('nextDrift', () => {
  it('her dakika en çok 8 nokta kayar ve merkezden 16 noktadan uzaklaşmaz (1 gece = 600 adım)', () => {
    const rnd = seeded(7)
    let p = [0, 0]
    let moved = 0
    for (let i = 0; i < 600; i++) {
      const n = nextDrift(p, rnd)
      const step = Math.hypot(n[0] - p[0], n[1] - p[1])
      expect(step).toBeLessThanOrEqual(STEP_MAX + 0.15) // 0,1 yuvarlama payı
      expect(Math.abs(n[0])).toBeLessThanOrEqual(BOUND)
      expect(Math.abs(n[1])).toBeLessThanOrEqual(BOUND)
      if (step > 0.5) moved++
      p = n
    }
    expect(moved).toBeGreaterThan(500) // gerçekten kayıyor (sınırda takılı kalmıyor)
  })
  it('sınırın dışına çıkacak adım sınırda durur', () => {
    const n = nextDrift([BOUND, 0], () => 0) // açı 0 → sağa, uzunluk 4
    expect(n).toEqual([BOUND, 0])
  })
})

describe('untilShort', () => {
  const now = new Date(2026, 8, 28, 23, 52)
  const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime()
  it('alarma kalan süre "sonra" olmadan', () => {
    expect(untilShort(at(29, 6, 29), now)).toBe('6 sa 37 dk')
    expect(untilShort(at(29, 0, 52), now)).toBe('1 sa')
    expect(untilShort(at(29, 0, 7), now)).toBe('15 dk')
  })
  it('dakikanın içinde değişmez: ekrandaki saatle aynı dakikadan hesaplanır', () => {
    for (const s of [0, 29, 31, 45, 59]) expect(untilShort(at(29, 6, 29), new Date(2026, 8, 28, 23, 52, s))).toBe('6 sa 37 dk')
  })
  it('alarm geçtiyse, yoksa ya da 24 saatten uzaksa gösterilmez', () => {
    expect(untilShort(now.getTime(), now)).toBeNull()
    expect(untilShort(now.getTime() - 60000, now)).toBeNull()
    expect(untilShort(new Date(2026, 8, 28, 23, 52, 30).getTime(), new Date(2026, 8, 28, 23, 52, 40))).toBeNull()
    expect(untilShort(null, now)).toBeNull()
    expect(untilShort(undefined, now)).toBeNull()
    expect(untilShort(at(29, 23, 51), now)).toBe('23 sa 59 dk')
    expect(untilShort(at(29, 23, 52), now)).toBeNull()
  })
})

describe('alarmLabel', () => {
  const now = new Date(2026, 8, 28, 23, 52) // Pazartesi
  it('24 saat içinde yalnız saat, daha uzaksa gün adıyla', () => {
    expect(alarmLabel(new Date(2026, 8, 29, 6, 29), now)).toBe('06:29')
    expect(alarmLabel(new Date(2026, 8, 29, 23, 51), now)).toBe('23:51')
    expect(alarmLabel(new Date(2026, 8, 29, 23, 52), now)).toBe('Salı 23:52')
    expect(alarmLabel(new Date(2026, 9, 2, 6, 29), now)).toBe('Cuma 06:29')
    expect(alarmLabel(null, now)).toBeNull()
  })
})

describe('spoken', () => {
  it('kısaltmaları açar', () => {
    expect(spoken('6 sa 37 dk')).toBe('6 saat 37 dakika')
    expect(spoken('1 sa')).toBe('1 saat')
    expect(spoken('Müzik · 22 dk sonra susar')).toBe('Müzik · 22 dakika sonra susar')
  })
})
