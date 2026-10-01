import { describe, it, expect } from 'vitest'
import { SOURCES, DESIGNS, DESIGN_RANK, authorLine, designText, doiUrl } from './sources.js'

describe('kaynakça', () => {
  it('her kaynak eksiksiz: yazar, yıl, başlık, Türkçe başlık, dergi, DOI, PMID, tür', () => {
    for (const [id, s] of Object.entries(SOURCES)) {
      expect(s.authors.length, id).toBeGreaterThan(0)
      expect(s.year).toBeGreaterThan(1900)
      expect(s.title.length).toBeGreaterThan(10)
      expect(s.titleTr.length).toBeGreaterThan(10)
      expect(s.journal).toBeTruthy()
      expect(s.doi).toMatch(/^10\.\d{4,}\//)
      expect(s.pmid).toMatch(/^\d+$/)
      expect(DESIGNS[s.design], id).toBeTruthy()
      expect(DESIGN_RANK[s.design]).toBeGreaterThanOrEqual(0)
    }
  })
  it('yazar satırı: 3 yazara kadar hepsi, fazlasında "ve ark."', () => {
    expect(authorLine({ authors: ['A', 'B', 'C'] })).toBe('A, B, C')
    expect(authorLine({ authors: ['A', 'B', 'C', 'D'] })).toBe('A, B, C ve ark.')
    expect(designText(SOURCES.sturm2020)).toBe('Randomize kontrollü çalışma · 60 yaşlı yetişkin')
    expect(doiUrl('10.1/x')).toBe('https://doi.org/10.1/x')
  })
})
