import { describe, it, expect } from 'vitest'
import { TEXTS, TAGS, bankProblems, BANNED_PMIDS } from './okumaBank.js'

describe('okumaBank: denetle.mjs kuralları', () => {
  it('120 metin, onaylı banka temiz', () => {
    expect(TEXTS).toHaveLength(120)
    expect(bankProblems()).toEqual([])
  })

  it('her metin 6 soru, 1 ana fikir sorusu, her soruda 4 seçenek; etiketler bilinir', () => {
    for (const t of TEXTS) {
      expect(t.sorular).toHaveLength(6)
      expect(t.sorular.filter((q) => q.tur === 'ana')).toHaveLength(1)
      for (const q of t.sorular) expect(q.secenekler).toHaveLength(4)
      expect(TAGS[t.etiket]).toBeTruthy()
    }
  })

  it('kural ihlalini yakalar: kısa metin, tekrar PMID, yasak PMID, olumsuz soru', () => {
    const t = TEXTS[0]
    const bad = [
      { ...t, id: 'x1', metin: 'Kısa metin.' },
      { ...t, id: 'x2', kaynak: 'baska' },
      { ...TEXTS[1], id: 'x3', kaynak: 'yasak', pmid: BANNED_PMIDS[0] },
      { ...TEXTS[2], id: 'x4', kaynak: 'olumsuz', sorular: TEXTS[2].sorular.map((q, i) => (i ? q : { ...q, soru: 'Hangisi yanlış?' })) },
    ]
    const p = bankProblems(bad).map((x) => `${x.id} ${x.problem}`).join('\n')
    expect(p).toMatch(/x1 kelime/)
    expect(p).toMatch(/x2 PMID x1 ile ortak/)
    expect(p).toMatch(/x3 Metin Arama bulgusu/)
    expect(p).toMatch(/x4 olumsuz soru/)
  })
})
