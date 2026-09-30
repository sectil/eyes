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
  // Bildirim bilim kartı kaynakları (PLAN.v1.md §5.2, §5.3; kaynak-dogrulama.md): isteğe bağlı finding, duration, limit
  it('bilim kartı alanları: finding, duration, limit varsa dolu metin; bilim satırı ≤ 100 karakter', () => {
    for (const [id, s] of Object.entries(SOURCES)) {
      for (const f of ['finding', 'duration', 'limit']) {
        if (s[f] == null) continue
        expect(typeof s[f], `${id}.${f}`).toBe('string')
        expect(s[f].trim().length, `${id}.${f}`).toBeGreaterThan(3)
      }
      if (s.finding != null) expect(s.finding.length, id).toBeLessThanOrEqual(100)
    }
  })
  it('doğrulamada "girer" olanlar var, "tam metin gerekli" olanlar yok', () => {
    const girer = ['kim2020', 'wolffsohn2025', 'fincham2023', 'laborde2022', 'tucker2007', 'denissen2008', 'stout2022', 'desai2026', 'moszeik2025']
    const kosullu = ['radin2025', 'habarubio2015', 'chaput2016', 'smith2017']
    for (const id of [...girer, ...kosullu]) {
      expect(SOURCES[id], id).toBeTruthy()
      expect(SOURCES[id].pmid, id).toMatch(/^\d+$/)
      expect(SOURCES[id].doi, id).toMatch(/^10\.\d{4,}\//)
    }
    // Bilim satırı olan her "girer" kaynağında kartın üç alanından en az finding ve limit var
    for (const id of girer) expect(SOURCES[id], id).toMatchObject({ finding: expect.any(String), limit: expect.any(String) })
    for (const id of ['balban2023', 'klimek2022', 'cajochen2013', 'casiraghi2021']) expect(SOURCES[id], id).toBeUndefined()
    expect(SOURCES.kim2020).toMatchObject({ pmid: '32409236', doi: '10.1016/j.clae.2020.04.014', duration: '4 hafta' })
    expect(designText(SOURCES.fincham2023)).toBe('Meta-analiz · 12 randomize çalışma, 785 yetişkin')
  })
  it('koşullu kaynaklar only taşır, ötekiler taşımaz; süreler doğrulama tablosuyla aynı (kaynak-dogrulama.md §5)', () => {
    expect(SOURCES.radin2025.only).toBe('meditation')
    for (const id of ['habarubio2015', 'chaput2016', 'smith2017']) expect(SOURCES[id].only, id).toBe('moon')
    const only = Object.entries(SOURCES).filter(([, s]) => s.only != null).map(([id]) => id).sort()
    expect(only).toEqual(['chaput2016', 'habarubio2015', 'radin2025', 'smith2017'])
    const sure = Object.fromEntries(Object.entries(SOURCES).filter(([, s]) => s.duration != null).map(([id, s]) => [id, s.duration]))
    expect(Object.keys(sure).sort()).toEqual(['chaput2016', 'desai2026', 'kim2020', 'moszeik2025', 'radin2025', 'stout2022', 'wolffsohn2025'])
    expect(SOURCES.wolffsohn2025.design).toBe('rct') // özet: "Participants were randomised…"; PubMed türü RCT
  })
})
