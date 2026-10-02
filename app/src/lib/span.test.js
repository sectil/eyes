import { describe, it, expect } from 'vitest'
import {
  LETTERS, MAX_POS, PER_POS, PASS, START_MS, MIN_MS, MAX_MS, rng, trigram, choicesFor, makeRound, profileOf, sideReach, summarize,
  nextDuration, durationFor, letterPx, makeRecord, FACTS, factFor, judged, isSpan,
} from './span.js'

describe('Tek Bakışta: denemeler', () => {
  it('üçlü: 3 farklı harf, yalnız izinli harflerden', () => {
    const r = rng(7)
    for (let k = 0; k < 200; k++) {
      const t = trigram(r)
      expect(new Set(t).size).toBe(3)
      expect([...t].every((c) => LETTERS.includes(c))).toBe(true)
    }
  })
  it('seçenekler: 4 farklı, biri doğru, çeldiriciler aynı uzunlukta', () => {
    const r = rng(11)
    for (let k = 0; k < 200; k++) {
      const t = trigram(r)
      const c = choicesFor(t, r)
      expect(c).toHaveLength(4)
      expect(new Set(c).size).toBe(4)
      expect(c).toContain(t)
      expect(c.every((x) => x.length === 3)).toBe(true)
    }
  })
  it('tur: her yuva ±1..±6 eşit sayıda; aynı tohum aynı tur', () => {
    const round = makeRound(42)
    expect(round).toHaveLength(MAX_POS * 2 * PER_POS)
    for (let p = 1; p <= MAX_POS; p++) {
      expect(round.filter((t) => t.pos === p)).toHaveLength(PER_POS)
      expect(round.filter((t) => t.pos === -p)).toHaveLength(PER_POS)
    }
    expect(makeRound(42)).toEqual(round)
  })
})

describe('menzil', () => {
  const res = (pos, ok, n = PER_POS) => Array.from({ length: n }, (_, k) => ({ pos, correct: k < ok }))
  it('taraf menzili: merkezden dışa geçen ardışık en uzak yuva; ilk geçmeyende durur', () => {
    const r = [...res(1, 4), ...res(2, 3), ...res(3, 2), ...res(4, 4), ...res(-1, 4), ...res(-2, 4)]
    const p = profileOf(r)
    expect(p[2]).toEqual([3, 4])
    expect(sideReach(p, 1)).toBe(2) // 3. yuva %50 < %75 → 4. yuva sayılmaz
    expect(sideReach(p, -1)).toBe(2)
    expect(summarize(r)).toMatchObject({ left: 2, right: 2, span: 4 })
    expect(PASS).toBe(0.75)
  })
  it('boş tur: menzil 0, doğruluk yok', () => {
    expect(summarize([])).toMatchObject({ span: 0, accuracy: null })
  })
  it('süre ~%80 doğrulukta kalacak şekilde ayarlanır ve sınırlarda kalır', () => {
    expect(nextDuration(100, 0.95)).toBe(85)
    expect(nextDuration(100, 0.5)).toBe(120)
    expect(nextDuration(100, 0.8)).toBe(100)
    expect(nextDuration(MIN_MS, 1)).toBe(MIN_MS)
    expect(nextDuration(MAX_MS, 0)).toBe(MAX_MS)
    expect(durationFor([])).toBe(START_MS)
    expect(durationFor([{ type: 'span', span: 8, durationMs: 100, accuracy: 0.9 }])).toBe(85)
  })
  it('harf boyu: 40 cm\'de 0,5° ≈ 3,5 mm büyük harf', () => {
    const { fontPx } = letterPx(6)
    expect(fontPx * 0.7).toBeCloseTo(3.49 * 6, 0)
  })
  it('kayıt: menzil, süre, kart; isSpan tanır', () => {
    const r = [...res(1, 4), ...res(-1, 3)]
    const rec = makeRecord({ results: r, durationMs: 100, seconds: 95.4, factId: 'speed-myth' }, new Date('2026-09-25T10:00:00'))
    expect(rec).toMatchObject({ type: 'span', span: 2, left: 1, right: 1, durationMs: 100, trials: 8, seconds: 95, factId: 'speed-myth' })
    expect(isSpan(rec)).toBe(true)
  })
})

describe('bilim kartları', () => {
  it('her kartta iddia, cevap, kaynak ve DOI var; kimlikler tekil', () => {
    expect(new Set(FACTS.map((f) => f.id)).size).toBe(FACTS.length)
    for (const f of FACTS) {
      expect(['fact', 'myth', 'open']).toContain(f.answer)
      expect(f.doi).toMatch(/^10\.\d{4,}\//)
      expect(f.claim.length).toBeGreaterThan(15)
      expect(f.body.length).toBeGreaterThan(40)
    }
  })
  it('kartlar sırayla gelir; "kanıt yok" kartında "Efsane" doğru sayılır', () => {
    expect(factFor([]).id).toBe(FACTS[0].id)
    expect(factFor([{ type: 'span', span: 5 }]).id).toBe(FACTS[1].id)
    expect(judged(FACTS[0], 'myth')).toBe(true)
    expect(judged(FACTS.find((f) => f.answer === 'fact'), 'fact')).toBe(true)
    expect(judged(FACTS.find((f) => f.answer === 'open'), 'myth')).toBe(true)
  })
})
