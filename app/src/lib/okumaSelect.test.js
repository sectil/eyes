import { describe, it, expect } from 'vitest'
import { TEXTS, textById } from './okumaBank.js'
import { nextText, questionSet, detailSet, readingOrder, TAIL } from './okumaSelect.js'

// PLAN §4.3: 1 000 sabit tohum, her biri 365 gün, gün başına bir okuma, %10 yarıda bırakma
const SEEDS = Array.from({ length: 1000 }, (_, i) => `kurulum-${i}`)
const DAY = 86400000
const T0 = Date.UTC(2026, 0, 1)
const tag = (id) => textById(id).etiket

function lcg(seed) {
  let s = seed >>> 0
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296)
}

function simulate(seed, k) {
  const rand = lcg(k + 1)
  const sessions = []
  const finished = []
  for (let d = 0; d < 365; d++) {
    const { textId, cycle } = nextText({ seed, sessions })
    const date = new Date(T0 + d * DAY).toISOString()
    if (rand() < 0.1) { sessions.push({ type: 'okuma-anlama', date, textId, cycle, correct: null }); continue }
    const s = { type: 'okuma-anlama', date, textId, cycle, correct: 3 }
    sessions.push(s)
    finished.push(s)
  }
  return finished
}

describe('okumaSelect: 365 günlük tohumlu benzetim (PLAN §4.3)', () => {
  const runs = SEEDS.map((seed, k) => simulate(seed, k))

  it('1–2: bir turda hiçbir metin iki kez bitirilmez; 120 bitirilen okumadan önce tekrar yok', () => {
    for (const fin of runs) {
      const byCycle = new Map()
      for (const s of fin) {
        const set = byCycle.get(s.cycle) ?? new Set()
        expect(set.has(s.textId)).toBe(false)
        set.add(s.textId)
        byCycle.set(s.cycle, set)
      }
      expect(new Set(fin.slice(0, TEXTS.length).map((s) => s.textId)).size).toBe(Math.min(fin.length, TEXTS.length))
    }
  })

  it('3: tur geçişinde önceki turun son 30 metni yeni turun ilk 30 metninde yok', () => {
    let crossings = 0
    for (const fin of runs) {
      const c0 = fin.filter((s) => s.cycle === 0).map((s) => s.textId)
      const c1 = fin.filter((s) => s.cycle === 1).map((s) => s.textId)
      if (!c1.length) continue
      crossings++
      const tail = new Set(c0.slice(-TAIL))
      for (const id of c1.slice(0, TAIL)) expect(tail.has(id)).toBe(false)
    }
    expect(crossings).toBe(SEEDS.length)
  })

  it('4: bitirilen ardışık iki metin aynı etikette değil', () => {
    for (const fin of runs) for (let i = 1; i < fin.length; i++) expect(tag(fin[i].textId)).not.toBe(tag(fin[i - 1].textId))
  })

  it('5: doğru seçeneğin yeri dört konuma %25 ± 2 dağılır', () => {
    const at = [0, 0, 0, 0]
    for (const fin of runs.slice(0, 200)) for (const s of fin) for (const q of questionSet(textById(s.textId), s.cycle)) at[q.options.findIndex((o) => o.correct)]++
    const total = at.reduce((a, b) => a + b, 0)
    for (const n of at) expect(Math.abs(n / total - 0.25)).toBeLessThanOrEqual(0.02)
  })

  it('6: aynı metin art arda iki turda aynı soru takımıyla gelmez', () => {
    for (const t of TEXTS) for (let c = 1; c < 6; c++) expect(detailSet(t, c)).not.toEqual(detailSet(t, c - 1))
  })
})

describe('okumaSelect: soru takımı', () => {
  it('ana fikir sorusu her turda var, 3 ayrıntı, 4 soru, her soruda tek doğru', () => {
    for (const t of TEXTS) for (const c of [0, 1, 2]) {
      const qs = questionSet(t, c)
      expect(qs).toHaveLength(4)
      expect(qs.filter((q) => q.tur === 'ana')).toHaveLength(1)
      expect(new Set(qs.map((q) => q.id)).size).toBe(4)
      for (const q of qs) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1)
        expect(q.options.find((o) => o.correct).text).toBe(t.sorular[q.index].secenekler[0])
        expect(new Set(q.options.map((o) => o.text))).toEqual(new Set(t.sorular[q.index].secenekler))
      }
    }
  })

  it('aynı girdiyle aynı sonuç; farklı tohum farklı sıra', () => {
    expect(readingOrder('a', 0)).toEqual(readingOrder('a', 0))
    expect(readingOrder('a', 0)).not.toEqual(readingOrder('b', 0))
    expect(questionSet(TEXTS[0], 1)).toEqual(questionSet(TEXTS[0], 1))
  })

  it('yarıda bırakılan metin ertesi gün yine gelir', () => {
    const first = nextText({ seed: 'x', sessions: [] })
    const again = nextText({ seed: 'x', sessions: [{ type: 'okuma-anlama', date: '2026-01-01T10:00:00Z', textId: first.textId, cycle: 0, correct: null, reason: 'ara' }] })
    expect(again.textId).toBe(first.textId)
  })
})
