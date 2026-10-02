import { describe, it, expect } from 'vitest'
import { planAtLeast } from './Breath.jsx'
import { makePlan } from '../lib/breath.js'
import { BREATH_DONE_SEC } from '../lib/notifyLog.js'

// Hatırlatmadan açılan 1 dk nefes (modules/breath/view.jsx 'breath-1'): düzenlenmiş kalıpta da ≥ 60 sn sürmeli
describe('planAtLeast (1 dk nefes "yapıldı" eşiğine ulaşır)', () => {
  it('düzenlenmiş kalıplar: 4-4-6 (14 sn) ve 4-7-8 (19 sn) yuvarlanınca 56/57 sn kalıyordu', () => {
    const d = { pattern: 'custom', durationSec: 60 }
    expect(makePlan({ ...d, edits: { in: 4, hold: 4, out: 6 } }).totalSec).toBe(56)
    expect(planAtLeast({ ...d, edits: { in: 4, hold: 4, out: 6 } }, BREATH_DONE_SEC).totalSec).toBe(70)
    expect(makePlan({ ...d, edits: { in: 4, hold: 7, out: 8 } }).totalSec).toBe(57)
    expect(planAtLeast({ ...d, edits: { in: 4, hold: 7, out: 8 } }, BREATH_DONE_SEC).totalSec).toBe(76)
  })
  it('her al/ver süresi (0,5 sn adım): en az 60 sn, gerekenden bir döngü fazla değil', () => {
    for (let i = 2; i <= 10; i += 0.5) {
      for (let o = 2; o <= 12; o += 0.5) {
        const plan = planAtLeast({ pattern: 'custom', durationSec: 60, edits: { in: i, out: o } }, BREATH_DONE_SEC)
        expect(plan.cycleSec).toBe(i + o)
        expect(plan.totalSec).toBeGreaterThanOrEqual(BREATH_DONE_SEC)
        expect(plan.totalSec).toBeLessThan(Math.max(BREATH_DONE_SEC + plan.cycleSec, makePlan({ pattern: 'custom', durationSec: 60, edits: { in: i, out: o } }).totalSec + 1))
      }
    }
  })
  it('hazır kalıplar ve minSec yokken plan değişmez', () => {
    for (const pattern of ['calm', 'sigh', 'box', 'custom']) {
      const a = { pattern, durationSec: 60, priorSessions: 10 }
      expect(planAtLeast(a, BREATH_DONE_SEC)).toEqual(makePlan(a))
    }
    const edited = { pattern: 'custom', durationSec: 60, edits: { in: 4, hold: 4, out: 6 } }
    expect(planAtLeast(edited)).toEqual(makePlan(edited))
    expect(planAtLeast({ ...edited, durationSec: 180 }, BREATH_DONE_SEC)).toEqual(makePlan({ ...edited, durationSec: 180 }))
  })
})
