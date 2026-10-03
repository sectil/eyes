// Oku ve Anla metin bankası (docs/yol-haritasi/tasarim/okuma-anlama/; METINLER.md §1–§4, sahip onaylı 2026-10-02).
// okumaBank.json banka/taslak-01..12.json'ın birleşimidir; metin ve sorulara tek harf eklenmez. Her soruda doğru seçenek
// ilk sıradadır; gösterimde lib/okumaSelect.js karar. Kurallar banka/denetle.mjs'in JS karşılığı (okumaBank.test.js).
import BANK from './okumaBank.json'

export const TEXTS = Object.freeze(BANK.metinler)
export const TAGS = Object.freeze(BANK.etiketler)
const BY_ID = new Map(TEXTS.map((t) => [t.id, t]))
export const textById = (id) => BY_ID.get(id) ?? null

export const wordCount = (metin) => String(metin).trim().split(/\s+/).length
export const qId = (textId, i) => `${textId}-q${i}`
export const pubmedUrl = (pmid) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`

// Metin Arama oturumunun doğruladığı bulgular: ortak banka kararına kadar bu modülde kullanılmaz (METINLER.md §1)
export const BANNED_PMIDS = Object.freeze(['29880690', '28706072', '38858512', '27846607', '31515395', '37001499', '32241948', '33997665', '27576923', '32679029'])
export const TEAM_SIZE = 10 // banka 10 metinlik takımlar hâlinde yazıldı ve onaylandı

// denetle.mjs kuralları: [{ id, problem }]. Boş dizi = banka temiz.
export function bankProblems(texts = TEXTS, tags = TAGS) {
  const out = []
  const add = (id, problem) => out.push({ id, problem })
  const seen = new Map()
  const once = (kind, key, id) => {
    const k = `${kind}:${key}`
    if (seen.has(k)) add(id, `${kind} ${seen.get(k)} ile ortak`)
    else seen.set(k, id)
  }
  for (let i = 0; i < texts.length; i += TEAM_SIZE) {
    const team = texts.slice(i, i + TEAM_SIZE)
    let qn = 0, longest = 0
    for (const t of team) for (const q of t.sorular) {
      qn++
      const L = q.secenekler.map((x) => x.length)
      if (L[0] > Math.max(...L.slice(1))) longest++
    }
    const oran = qn ? longest / qn : 0
    if (oran < 0.15 || oran > 0.35) add(team[0]?.id, `takım uzunluk oranı %${Math.round(oran * 100)}`)
  }
  for (const t of texts) {
    const words = wordCount(t.metin), chars = t.metin.length
    once('kimlik', t.id, t.id)
    once('kaynak', t.kaynak, t.id)
    once('PMID', t.pmid, t.id)
    for (const k of ['baslik', 'etiket', 'kaynak', 'pmid', 'doi', 'yazar', 'dergi', 'yil']) if (!t[k]) add(t.id, `alan yok: ${k}`)
    if (!(t.etiket in tags)) add(t.id, `bilinmeyen etiket ${t.etiket}`)
    if (BANNED_PMIDS.includes(t.pmid)) add(t.id, 'Metin Arama bulgusu')
    if (!/^\d{6,9}$/.test(t.pmid || '')) add(t.id, 'PMID biçimi')
    if (!/^10\.\d{4,9}\//.test(t.doi || '')) add(t.id, 'DOI biçimi')
    if (words < 95 || words > 115) add(t.id, `kelime ${words}`)
    if (chars < 730 || chars > 850) add(t.id, `harf ${chars}`)
    if (/[()]/.test(t.metin + t.baslik)) add(t.id, 'parantez')
    if (/(^|[^a-zçğıöşüâîû])(beyin|hastal|ölüm|tehlike)/i.test(t.metin)) add(t.id, 'yasak sözcük')
    if (t.sorular.length !== 6) add(t.id, '6 soru değil')
    if (t.sorular.filter((q) => q.tur === 'ana').length !== 1) add(t.id, 'ana soru 1 değil')
    for (const q of t.sorular) {
      if (q.secenekler.length !== 4) add(t.id, '4 seçenek değil')
      if (new Set(q.secenekler).size !== q.secenekler.length) add(t.id, 'seçenek tekrar')
      if (/yanlış|değildir|olmayan|m[ae]d[ıiuü]ğ[ıiuü]|m[ae]z\b/i.test(q.soru)) add(t.id, `olumsuz soru: ${q.soru}`)
    }
  }
  return out
}
