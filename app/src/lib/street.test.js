import { describe, it, expect } from 'vitest'
import { genStreet, makeQuestions, countOptions, taskScore, scoreRound, nextLevel, makeRecord, optionLabel, FACTS, factFor, isStreet, LEVELS, TASKS, CLOTH } from './street.js'
import { streetSVG } from './streetSvg.js'

const SEEDS = Array.from({ length: 200 }, (_, i) => i * 7919 + 13)

describe('cadde üretimi', () => {
  it('aynı tohum aynı cadde; farklı tohum farklı', () => {
    expect(genStreet(42, 1)).toEqual(genStreet(42, 1))
    expect(JSON.stringify(genStreet(42, 1))).not.toBe(JSON.stringify(genStreet(43, 1)))
  })
  it('soruların konusu caddede tek: tek gülen kadın, tek sarışın kadın, tek çocuklu, tek şapkalı, tek yeşil tente, tek satıcı', () => {
    for (const lv of [1, 2, 3]) {
      for (const seed of SEEDS) {
        const s = genStreet(seed, lv)
        expect(s.people.filter((p) => p.laugh)).toHaveLength(1)
        expect(s.people.filter((p) => p.g === 'k' && p.hair === 'sari')).toHaveLength(1)
        expect(s.people.filter((p) => p.child)).toHaveLength(1)
        expect(s.people.filter((p) => p.hat)).toHaveLength(1)
        expect(s.buildings.filter((b) => b.aw === 'yesil')).toHaveLength(1)
        expect(s.vendors).toHaveLength(1)
        expect(Object.values(s.special).every((p) => Number.isFinite(p.x))).toBe(true)
        expect(Number.isFinite(s.vendors[0].x)).toBe(true)
      }
    }
  })
  it('sayılacak şey en az 2; sayımlar cadde ile tutarlı', () => {
    for (const seed of SEEDS) {
      const s = genStreet(seed, 1)
      expect(s.counts.blueCar).toBeGreaterThanOrEqual(2)
      expect(s.counts.taxi).toBeGreaterThanOrEqual(2)
      expect(s.counts.cat).toBe(s.cats.length)
      expect(s.counts.bike).toBe(s.bikes.length)
      expect(TASKS.map((t) => t.id)).toContain(s.task.id)
    }
  })
  it('seviye kalabalığı artırır', () => {
    expect(genStreet(5, 3).people.length).toBeGreaterThan(genStreet(5, 1).people.length)
    expect(LEVELS[3].walkSec).toBeLessThan(LEVELS[1].walkSec)
  })
})

describe('sorular', () => {
  it('3 soru, her biri 4 farklı seçenek ve doğru cevap seçeneklerde', () => {
    for (const seed of SEEDS) {
      const s = genStreet(seed, 2)
      expect(s.questions).toHaveLength(3)
      expect(new Set(s.questions.map((q) => q.id)).size).toBe(3)
      for (const q of s.questions) {
        expect(q.opts).toHaveLength(4)
        expect(new Set(q.opts).size).toBe(4)
        expect(q.opts).toContain(q.a)
        for (const v of q.opts) expect(optionLabel(q, v).length).toBeGreaterThan(1)
      }
    }
  })
  it('cevaplar caddeyle tutarlı', () => {
    const s = genStreet(99, 1)
    const all = makeQuestions(s)
    for (const q of all) {
      if (q.id === 'laugh') expect(q.a).toBe(s.people.find((p) => p.laugh).top)
      if (q.id === 'child') expect(q.a).toBe(s.people.find((p) => p.child).child)
      if (q.id === 'shop') expect(q.a).toBe(s.buildings.find((b) => b.aw === 'yesil').shop)
      if (q.kind === 'color') expect([...CLOTH, 'kirmizi']).toContain(q.a)
    }
  })
  it('sayı seçenekleri: 4 ardışık, doğru içinde, negatif yok', () => {
    for (const n of [0, 1, 2, 5, 9]) {
      for (let k = 0; k < 20; k++) {
        const o = countOptions(n)
        expect(o).toHaveLength(4)
        expect(o).toContain(n)
        expect(Math.min(...o)).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe('puan ve seviye', () => {
  it('görev: tam 1, bir eksik/fazla ½, yoksa 0; tahmin ayrı', () => {
    expect(taskScore(4, 4)).toBe(1)
    expect(taskScore(5, 4)).toBe(0.5)
    expect(taskScore(1, 4)).toBe(0)
    const r = scoreRound({ countAnswer: 4, n: 4, answers: [{ ok: true, guess: false }, { ok: true, guess: true }, { ok: false, guess: false }] })
    expect(r).toEqual({ task: 1, noticed: 1, guessedRight: 1, asked: 3 })
  })
  it('seviye: iki tur görev tam → bir üst; son tur görev 0 → bir alt; 1–3 arası', () => {
    const rec = (task, level) => ({ type: 'street', noticed: 1, asked: 3, task, level })
    expect(nextLevel([])).toBe(1)
    expect(nextLevel([rec(1, 1), rec(1, 1)])).toBe(2)
    expect(nextLevel([rec(1, 3), rec(1, 3)])).toBe(3)
    expect(nextLevel([rec(1, 2), rec(0, 2)])).toBe(1)
    expect(nextLevel([rec(0.5, 2)])).toBe(2)
  })
  it('kayıt', () => {
    const s = genStreet(7, 1)
    const rec = makeRecord({ street: s, countAnswer: s.counts[s.task.id], answers: [{ id: 'a', ok: true, guess: false }], seconds: 61.2 })
    expect(rec).toMatchObject({ type: 'street', seed: 7, level: 1, task: 1, noticed: 1, asked: 1, seconds: 61 })
    expect(isStreet(rec)).toBe(true)
  })
})

describe('bilim kartları ve çizim', () => {
  it('her kartta kaynak ve DOI; sırayla gelir', () => {
    for (const f of FACTS) expect(f.doi).toMatch(/^10\.\d{4,}\//)
    expect(factFor([]).id).toBe(FACTS[0].id)
    expect(factFor([{ type: 'street', noticed: 1 }]).id).toBe(FACTS[1].id)
  })
  it('çizim: geçerli SVG, bütün dükkân adları ve özel kişiler içinde', () => {
    const s = genStreet(123, 1)
    const svg = streetSVG(s)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
    for (const b of s.buildings) expect(svg).toContain(`>${b.shop}<`)
    expect(svg).toContain('ha ha')
  })
})
