import { describe, it, expect } from 'vitest'
import { trialRemindAt, TRIAL_REMIND_DAYS } from './restNotify.js'

// Saatler yerel (testler hangi saat diliminde koşarsa koşsun)
const D = 86400000
const local = (d, h, m = 0) => new Date(2026, 8, d, h, m).getTime()

describe('deneme hatırlatması (7302) gündüze alınır', () => {
  it('gündüz başlayan denemede anı değişmez', () => {
    expect(TRIAL_REMIND_DAYS).toBe(5)
    expect(trialRemindAt(local(1, 14, 30))).toBe(local(1, 14, 30) + 5 * D)
    expect(trialRemindAt(local(1, 9, 0))).toBe(local(1, 9, 0) + 5 * D)
    expect(trialRemindAt(local(1, 21, 0))).toBe(local(1, 21, 0) + 5 * D)
  })
  it('gece geç başlayan deneme aynı gün 20.00, sabah erken başlayan aynı gün 10.00', () => {
    expect(new Date(trialRemindAt(local(1, 23, 40))).getHours()).toBe(20)
    expect(new Date(trialRemindAt(local(1, 23, 40))).getDate()).toBe(new Date(local(1, 23, 40) + 5 * D).getDate())
    expect(new Date(trialRemindAt(local(1, 2, 15))).getHours()).toBe(10)
    expect(new Date(trialRemindAt(local(1, 2, 15))).getDate()).toBe(new Date(local(1, 2, 15) + 5 * D).getDate())
  })
  it('geçersiz başlangıç NaN', () => {
    expect(trialRemindAt(NaN)).toBeNaN()
  })
})
