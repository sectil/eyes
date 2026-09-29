// Kanıt kartları: görme kuralı kartı (karar 2026-09-29: E testi haftada bir) kaynağını aşmaz, sınırlarını açık yazar.
import { describe, it, expect } from 'vitest'
import { EVIDENCE } from './evidence.js'
import { SOURCES } from './sources.js'

const card = (id) => EVIDENCE.find((c) => c.id === id)

describe('kanıt kartı: Gelişim grafiği ve uyarılar', () => {
  const c = card('trend')
  // İnceleme 2026-09-29 (metin): Rosser 2003 ETDRS çizelgesi içindir; telefon testi için "0,20 ölçüm oynamasıyla
  // açıklanmaz" denemez (acuity kartı telefon testinin ±0,2 oynadığını söyler)
  it('Rosser bulgusu kaynağıyla sınırlı: ETDRS çizelgesi, klinik; telefon testinde art arda 3 test', () => {
    expect(c.basis).not.toMatch(/0,20 ve üstü ölçüm oynamasıyla açıklanmaz/)
    expect(c.basis).toContain("Sağlıklı gönüllülerle ETDRS çizelgesinde yapılan bir deneyde 0,20'lik değişim ölçüm oynamasından güvenle ayrılabildi, 0,10'luk ayrılamadı")
    expect(card('acuity').limits).toMatch(/±0,2 logMAR/)
  })
  it('yanlış alarm cümlesi doğrulanmış kaynağa dayanır (Yu 2021, PMID 32810682); Faes 2021\'e yüklenmez', () => {
    expect(c.basis).not.toMatch(/Tek teste dayalı ev takip/)
    expect(c.basis).toContain("52 uyarının 47'si yanlış çıktı")
    expect(c.sources.some((s) => s.includes('PMID 32810682'))).toBe(true)
    expect(SOURCES.yu2021).toMatchObject({ pmid: '32810682', doi: '10.1016/j.oret.2020.08.003' })
  })
  it('sınırlar: varsayım, bir gözde ve bir kişide yanlış uyarı, yanlış kırmızı, en erken uyarı günü', () => {
    expect(c.limits).toMatch(/bir varsayımdır/)
    expect(c.limits).toContain('bir gözde %0,7 ile %19,4 arasında')
    expect(c.limits).toContain('sağ, sol ve iki göz ayrı değerlendirildiği için bir kişide %2,5 ile %48,1 arasında')
    expect(c.limits).toContain('Yanlış kırmızı uyarı olasılığı bir kişide en çok %4,9')
    expect(c.limits).toContain('ilk uyarı en erken 36. günde')
  })
  it('başlangıç yalnız haftalık testlerin ortancası diye anlatılmaz (kısa testler de girer)', () => {
    expect(c.basis).not.toMatch(/3 haftalık testin ortancası/)
    expect(c.basis).toContain('ilk haftadan sonraki ilk testlerin ortancasıdır: 3 haftalık test tamamlanınca (en erken 22. gün) hazır olur')
  })
})
