import { describe, it, expect } from 'vitest'
import { pickSeries } from './vaSeries.js'

const NOW = '2026-09-25T12:00:00.000Z'
const day = (n) => new Date(new Date(NOW).getTime() - n * 86400000).toISOString()
const va = (eye, n, logMAR = 0.1, type = 'va-daily') => ({ type, eye, date: day(n), logMAR, correction: 'none' })

describe('pickSeries', () => {
  it('ölçüm yoksa boş', () => {
    expect(pickSeries([], NOW).eye).toBeNull()
  })
  it('eski kullanıcı (yalnız iki göz serisi) aynı seriyi görür', () => {
    expect(pickSeries([va('OU', 3), va('OU', 2)], NOW).eye).toBe('OU')
  })
  it('günlük test yalnız R/L: son 14 günde çok ölçülen öne çıkar, eşitse sağ', () => {
    const tests = [va('OU', 30, 0.1, 'va-weekly'), va('R', 3), va('L', 3), va('R', 2), va('L', 2)]
    expect(pickSeries(tests, NOW).eye).toBe('R')
  })
})
