import { describe, it, expect } from 'vitest'
import { summarizeHealth, walkNudge, fmtSteps, WALK_NUDGE_STEPS } from './health.js'
import { CONSENTS } from './consent.js'

const day = (date, steps, distanceM = 0, exerciseMin = 0) => ({ date, steps, distanceM, exerciseMin })

describe('summarizeHealth', () => {
  it('bugün son gün; ortalama bugünü ve adımsız günleri saymaz', () => {
    const s = summarizeHealth([day('2026-09-21', 6000), day('2026-09-22', 0), day('2026-09-23', 8000), day('2026-09-27', 1200, 900, 5)])
    expect(s.today).toEqual({ date: '2026-09-27', steps: 1200, distanceM: 900, exerciseMin: 5 })
    expect(s.avgSteps).toBe(7000)
    expect(s.activeDays).toBe(3)
    expect(s.hasData).toBe(true)
  })
  it('hepsi 0 → veri yok (izin verilmemiş olabilir); bozuk değerler 0', () => {
    expect(summarizeHealth([day('2026-09-27', 0), day('2026-09-26', 0)]).hasData).toBe(false)
    expect(summarizeHealth([{ date: '2026-09-27', steps: -5, distanceM: NaN }]).today.steps).toBe(0)
    expect(summarizeHealth(null)).toMatchObject({ hasData: false, today: null, avgSteps: null })
  })
})

describe('walkNudge (Dunstan 2012: oturmayı kısa yürüyüşle bölmek)', () => {
  it('gündüz, veri var, son 1 saatte az adım → öner', () => {
    expect(walkNudge({ recentSteps: 20, hasData: true, hour: 14 })).toBe(true)
    expect(walkNudge({ recentSteps: WALK_NUDGE_STEPS, hasData: true, hour: 14 })).toBe(false)
  })
  it('gece, veri yok ya da bilinmiyorsa önerme', () => {
    expect(walkNudge({ recentSteps: 0, hasData: true, hour: 22 })).toBe(false)
    expect(walkNudge({ recentSteps: 0, hasData: true, hour: 7 })).toBe(false)
    expect(walkNudge({ recentSteps: 0, hasData: false, hour: 14 })).toBe(false)
    expect(walkNudge({ recentSteps: null, hasData: true, hour: 14 })).toBe(false)
  })
})

describe('biçim ve izin metni', () => {
  it('Türkçe binlik ayırıcı', () => {
    expect(fmtSteps(4215)).toBe('4.215')
    expect(fmtSteps(null)).toBe('—')
  })
  it('sağlık izni: veri telefonda kalır, Nef\'e gitmez, sağlık verisi olduğu yazılı', () => {
    const h = CONSENTS.health
    expect(h.facts.map((f) => f[0])).toEqual(['Ne', 'Neden', 'Nerede', 'Ne kadar'])
    expect(h.facts[2][1]).toMatch(/Yalnızca bu telefonda/)
    expect(h.check).toMatch(/sağlık verisi/)
  })
})
