// Metin ve soru bankası denetimi: node denetle.mjs taslak-01.json [...]
// Kurallar METINLER.md §2–§3'te. Hata varsa çıkış kodu 1.
import { readFileSync } from 'node:fs'
const files = process.argv.slice(2)
const ids = new Set(), keys = new Map()
let bad = 0
for (const f of files) {
  const b = JSON.parse(readFileSync(f, 'utf8'))
  for (const t of b.metinler) {
    const e = []
    const words = t.metin.trim().split(/\s+/).length, chars = t.metin.length
    if (ids.has(t.id)) e.push('kimlik tekrar'); ids.add(t.id)
    if (keys.has(t.kaynak)) e.push(`kaynak ${keys.get(t.kaynak)} ile ortak`); keys.set(t.kaynak, t.id)
    if (words < 95 || words > 115) e.push(`kelime ${words}`)
    if (chars < 730 || chars > 850) e.push(`harf ${chars}`)
    if (/[()]/.test(t.metin + t.baslik)) e.push('parantez')
    if (/beyin|hastal|ölüm|tehlike/i.test(t.metin)) e.push('yasak sözcük')
    if (t.sorular.length !== 6) e.push('6 soru değil')
    if (t.sorular.filter((q) => q.tur === 'ana').length !== 1) e.push('ana soru 1 değil')
    for (const q of t.sorular) {
      if (q.secenekler.length !== 4) e.push('4 seçenek değil')
      if (new Set(q.secenekler).size !== 4) e.push('seçenek tekrar')
      if (/yanlış|değildir|olmayan/i.test(q.soru)) e.push('olumsuz soru: ' + q.soru)
    }
    console.log(t.id, words, 'kelime', chars, 'harf', e.join('; ') || 'tamam')
    if (e.length) bad++
  }
}
process.exit(bad ? 1 : 0)
