import { describe, it, expect } from 'vitest'
import { partOfDay, promptsFor, promptIndex, makeRecord, history, factFor, FACTS, ANSWER_TEXT, SOURCE_IDS, SKY, DURATION_SEC, isGokyuzu } from './gokyuzu.js'
import { SOURCES } from './sources.js'

describe('Gökyüzü molası', () => {
  it('günün bölümü ve renkleri', () => {
    expect([5, 7, 8, 16, 17, 19, 20, 23, 0, 4].map(partOfDay)).toEqual(['dawn', 'dawn', 'day', 'day', 'dusk', 'dusk', 'night', 'night', 'night', 'night'])
    for (const k of ['dawn', 'day', 'dusk', 'night']) expect(SKY[k].label).toBeTruthy()
  })
  it('6 soru × 20 sn; gece soruları farklı; her soru güneşe bakmayı önermez', () => {
    expect(promptsFor('day')).toHaveLength(6)
    expect(promptsFor('night')).not.toEqual(promptsFor('day'))
    expect(promptsFor('dusk')).toEqual(promptsFor('day'))
    for (const p of [...promptsFor('day'), ...promptsFor('night')]) expect(p).not.toMatch(/güneş/i)
    expect([0, 19.9, 20, 60, 119, 200].map((e) => promptIndex(e, DURATION_SEC, 6))).toEqual([0, 0, 1, 3, 5, 5])
  })
  it('kayıt ve kendi verin (en az 3 puanlı mola)', () => {
    const r = makeRecord({ before: 4, after: 7, seconds: 120.4, part: 'day' }, new Date('2026-09-26T08:00:00Z'))
    expect(r).toEqual({ type: 'gokyuzu', date: '2026-09-26T08:00:00.000Z', before: 4, after: 7, delta: 3, seconds: 120, part: 'day' })
    expect(isGokyuzu(r)).toBe(true)
    expect(history([r, r]).mean).toBeNull()
    expect(history([r, r, { ...r, delta: 0 }]).mean).toBeCloseTo(2)
  })
  it('kartlar: kaynağı olanların kaynağı kayıtlı; kaynaksız kart yalnız "araştırılmamış"', () => {
    for (const f of FACTS) {
      expect(ANSWER_TEXT[f.answer]).toBeTruthy()
      if (f.source) expect(SOURCES[f.source]).toBeTruthy()
      else expect(f.answer).toBe('unstudied')
    }
    expect(SOURCE_IDS.length).toBe(FACTS.filter((f) => f.source).length)
    expect(factFor([]).id).toBe(FACTS[0].id)
  })
})
