// Nefes merdiveni (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5, §3.A.10): ilerleme yokken yolda bugünkü 5 dk; varken 1 → 2 → 3 dk,
// katmanlar Dvar ile, "Zorlandım"dan sonra bir basamak kısa ve 7 gün tutmasız.
import { describe, it, expect } from 'vitest'
import breath, { breathPathStage, breathMixFor } from './manifest.js'
import { LADDERS } from '../../lib/ladders.js'
import { inEnvelope } from '../../lib/breathMix.js'
import { dayKey } from '../../lib/calendar.js'

const NOW = new Date('2026-10-05T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n, h = 10) => new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - n, h).toISOString()
const prog = ({ D = 0, G = D > 0 ? 1 : null, Dstage = D, seedDay = dayKey(NOW) } = {}) => ({ pathDay: D, mod: { breath: { D, G, Dstage } }, later: [], seedDay })
const ctxAt = (o = {}, sessions = [], now = NOW) => ({ tests: [], sessions, now, progression: prog({ seedDay: dayKey(now), ...o }) })
const LEGACY = { title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: 5, route: 'breath-rest', slot: 'rest', glyph: 'moon', done: false }
const seeds = (n = 60) => Array.from({ length: n }, (_, i) => new Date(2026, 9, 1 + i, 10))

describe('ilerleme yokken bugünkü durak (mevcut sistem bozulmaz)', () => {
  it('her gün 5 dk, stage yok', () => {
    expect(breath.today({ sessions: [], now: NOW })).toEqual(LEGACY)
    expect(breath.today({ sessions: [], now: NOW, progression: null })).toEqual(LEGACY)
  })
  it('en az 60 sn nefes kaydıyla tamam; "yapıldı" ölçütü aynı', () => {
    expect(breath.today({ sessions: [{ type: 'breath', seconds: 59, date: TODAY }], now: NOW }).done).toBe(false)
    expect(breath.today({ sessions: [{ type: 'breath', seconds: 60, date: TODAY }], now: NOW }).done).toBe(true)
    expect(breath.progression.match({ type: 'breath', seconds: 60 })).toBe(true)
    expect(breath.progression.match({ type: 'breath', seconds: 30 })).toBe(false)
    expect(breath.progression.match({ type: 'dalga', seconds: 300 })).toBe(false)
  })
})

describe('süre basamakları (yolda en çok 3 dk)', () => {
  it('1. gün 1, 2. gün 2, 3. günden 3 dk; aynı durak, aynı rota', () => {
    const m = (D) => breath.today(ctxAt({ D }))
    expect(m(0)).toMatchObject({ ...LEGACY, minutes: 1, stage: { id: 'N1', index: 0, minutes: 1, tier: 'A', soft: false, stepDown: false } })
    expect(m(1)).toMatchObject({ minutes: 2, stage: { id: 'N2' } })
    for (const D of [2, 6, 7, 21, 42, 200]) expect(m(D).minutes).toBe(3)
    for (const D of [0, 1, 2, 30, 500]) expect(m(D).minutes).toBeLessThanOrEqual(LADDERS.breath.pathCapMin)
  })
  it('katman Dvar ile: B 7, C 21, D 42 (yeni kullanıcıda 8., 22., 43. gün)', () => {
    const tier = (o) => breath.today(ctxAt(o)).stage.tier
    expect(tier({ D: 6 })).toBe('A')
    expect(tier({ D: 7 })).toBe('B')
    expect(tier({ D: 21 })).toBe('C')
    expect(tier({ D: 42 })).toBe('D')
  })
  it('eski kullanıcı (D = 200): güncelleme günü "Günün ritmi" (B), kısa tutma 7, bekleme 28 çalışma günü sonra', () => {
    const tier = (Dstage) => breath.today(ctxAt({ D: 200, Dstage })).stage.tier
    expect(tier(0)).toBe('B')
    expect(tier(6)).toBe('B')
    expect(tier(7)).toBe('C')
    expect(tier(27)).toBe('C')
    expect(tier(28)).toBe('D')
  })
  it('14+ gün aradan sonra o gün bir basamak aşağı', () => {
    expect(breath.today(ctxAt({ D: 2, G: 14 })).minutes).toBe(2)
    expect(breath.today(ctxAt({ D: 30, G: 20 })).stage).toMatchObject({ id: 'N2', soft: true, minutes: 2 })
    expect(breathPathStage(ctxAt({ D: 30, G: 20 })).more).toBe(false)
  })
  it('dün "Zorlandım": bugün bir basamak kısa ve "2 dk daha" yok; ertesi gün yine 3 dk', () => {
    const strained = [{ type: 'breath', seconds: 180, strained: true, date: daysAgo(1) }]
    const p = breathPathStage(ctxAt({ D: 10 }, strained))
    expect(p).toMatchObject({ minutes: 2, stepDown: true, more: false })
    expect(breath.today(ctxAt({ D: 10 }, strained)).minutes).toBe(2)
    expect(breathPathStage(ctxAt({ D: 0 }, strained)).minutes).toBe(1) // en az 1
    expect(breathPathStage(ctxAt({ D: 10 }, [{ ...strained[0], date: daysAgo(2) }]))).toMatchObject({ minutes: 3, more: true })
  })
  it('"2 dk daha" yalnız yoldaki 3 dk günlerinde', () => {
    expect(breathPathStage(ctxAt({ D: 0 })).more).toBe(false)
    expect(breathPathStage(ctxAt({ D: 1 })).more).toBe(false)
    expect(breathPathStage(ctxAt({ D: 2 })).more).toBe(true)
    expect(breathPathStage({ sessions: [], now: NOW })).toBeNull()
  })
})

describe('Bugünün ritmi (lib/breathMix.js) ve tutmanın ön koşulu (§3.A.5)', () => {
  const hasHold = (m) => m.hold > 0 || m.pause > 0
  it('ilk hafta (A) Sakin ritim kendi süreleriyle (kademe açık)', () => {
    const m = breathMixFor(ctxAt({ D: 3 }), undefined, { seen: true })
    expect(m).toMatchObject({ family: 'calm', inhale: 4, exhale: 6, hold: 0, pause: 0, edits: null })
  })
  it('B katmanında hiç tutma yok; kalıplar zarfın içinde', () => {
    for (const d of seeds()) {
      const m = breathMixFor(ctxAt({ D: 10, seedDay: dayKey(d) }, [], d), undefined, { seen: true })
      expect(hasHold(m)).toBe(false)
      expect(inEnvelope(m, 'B')).toBe(true)
      expect(['calm', 'equal', 'sigh', 'belly']).toContain(m.family)
    }
  })
  it('güvenlik kartı görülmemişse ya da son 7 günde "Zorlandım" varsa C ve D katmanında da tutma yok', () => {
    const strained = [{ type: 'breath', seconds: 180, strained: true, date: daysAgo(3) }]
    for (const D of [25, 50]) {
      for (const d of seeds()) {
        const now = d
        const c = ctxAt({ D, seedDay: dayKey(d) }, [], now)
        expect(hasHold(breathMixFor(c, undefined, { seen: false }))).toBe(false)
        const s = ctxAt({ D, seedDay: dayKey(d) }, [{ ...strained[0], date: new Date(d.getTime() - 3 * 86400000).toISOString() }], now)
        expect(hasHold(breathMixFor(s, undefined, { seen: true }))).toBe(false)
      }
    }
  })
  it('eski kullanıcının güncelleme gününde tutmalı ya da beklemeli kalıp gelmez', () => {
    for (const d of seeds(90)) expect(hasHold(breathMixFor(ctxAt({ D: 200, Dstage: 0, seedDay: dayKey(d) }, [], d), undefined, { seen: true }))).toBe(false)
  })
  it('C ve D katmanında ön koşul varken tutmalı gün gelebilir; bekleme yalnız D\'de; hepsi zarfta', () => {
    const c = seeds(90).map((d) => breathMixFor(ctxAt({ D: 30, seedDay: dayKey(d) }, [], d), undefined, { seen: true }))
    expect(c.some((m) => m.hold > 0)).toBe(true)
    expect(c.every((m) => m.pause === 0 && m.hold <= 2 && inEnvelope(m, 'C'))).toBe(true)
    const dd = seeds(90).map((d) => breathMixFor(ctxAt({ D: 60, seedDay: dayKey(d) }, [], d), undefined, { seen: true }))
    expect(dd.every((m) => m.pause <= 4 && inEnvelope(m, 'D'))).toBe(true)
  })
  it('belirlenimci: aynı gün, aynı kayıtlar → aynı kalıp', () => {
    const c = ctxAt({ D: 30 })
    expect(breathMixFor(c, undefined, { seen: true })).toEqual(breathMixFor(c, undefined, { seen: true }))
  })
  it('ilerleme yoksa kalıp yok', () => {
    expect(breathMixFor({ sessions: [], now: NOW }, undefined, { seen: true })).toBeNull()
  })
})
