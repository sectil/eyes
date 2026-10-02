// Kelime Avı metin denetimi: kelime sayısı, hedef kuralları, yasak sözcükler. Çıktı: sorunlar ya da "temiz".
import { TEXTS } from './metinler.js'
const low = (w) => w.toLocaleLowerCase('tr')
const toks = (t) => t.split(/\s+/).map((w) => w.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '')).filter(Boolean)
const root = (w) => low(w).replace(/'.*$/, '').slice(0, Math.min(4, low(w).length))
const BAN = ['beyin', 'beyni', 'tanıma', 'tedavi', 'hastalık', 'kanser', 'ölüm']
let bad = 0
const all = []
const say = (m) => { bad++; console.log(m) }
const srcs = new Set()
for (const x of TEXTS) {
  const T = toks(x.text), L = T.map(low), n = T.length
  if (n < 50 || n > 75) say(`${x.id}: ${n} kelime (50–75 olmalı)`)
  if (srcs.has(x.src)) say(`${x.id}: kaynak tekrar ${x.src}`); srcs.add(x.src)
  for (const b of BAN) if (L.some((w) => w.startsWith(b))) say(`${x.id}: yasak sözcük ${b}`)
  const want = x.type === 'A' ? 'ESY' : 'ESZ'
  if (x.targets.map((t) => t.t).join('') !== want) say(`${x.id}: hedef türleri ${want} olmalı`)
  const pos = []
  for (const t of x.targets) {
    const w = low(t.w), hits = L.filter((v) => v === w).length
    const rt = t.r ? low(t.r) : root(t.w)
    const sim = new Set(L.filter((v) => v !== w && v.startsWith(rt))).size
    const pre = [...new Set(L.filter((v) => v !== w && v.startsWith(w)))]
    if (pre.length) say(`${x.id}: "${t.w}" başka kelimenin başında geçiyor: ${pre}`)
    if (t.t === 'Y') { if (hits) say(`${x.id}: Y "${t.w}" metinde var`); if (sim < 1) say(`${x.id}: Y "${t.w}" benzer biçim yok`); continue }
    if (hits !== 1) say(`${x.id}: "${t.w}" ${hits} kez geçiyor (1 olmalı)`)
    if (t.t === 'E' && sim > 0) say(`${x.id}: E "${t.w}" benzer biçim var: ${[...new Set(L.filter((v) => v !== w && v.startsWith(root(t.w))))]}`)
    if (t.t === 'S' && sim < 1) say(`${x.id}: S "${t.w}" benzer biçim yok`)
    if (t.t === 'Z' && sim < 2) say(`${x.id}: Z "${t.w}" en az 2 benzer biçim olmalı (${sim})`)
    pos.push(L.indexOf(w) / n)
  }
  for (const p of pos) all.push(p)
  if (process.argv[2] === '-v') console.log(x.id, n, pos.map((p) => p.toFixed(2)).join(' '))
}
const third = [0, 1, 2].map((k) => all.filter((p) => Math.min(2, Math.floor(p * 3)) === k).length)
console.log(`hedef konumu üçte birler: ${third.join(' / ')}`)
if (Math.min(...third) < all.length / 3 * 0.7) say('hedef konumları dengesiz')
console.log(bad ? `${bad} sorun` : `temiz · ${TEXTS.length} metin`)
// Maket için tarayıcı kopyası (file:// altında modül yüklenemez)
import { writeFileSync } from 'node:fs'
writeFileSync(new URL('./metinler.global.js', import.meta.url), `// denetle.mjs üretir; elle düzenleme\nwindow.TEXTS = ${JSON.stringify(TEXTS, null, 1)}\n`)
// METINLER.md bölüm B
import { readFileSync } from 'node:fs'
const KIND = { E: 'kolay', S: 'benzer', Z: 'iki benzer', Y: 'yok' }
const md = new URL('../METINLER.md', import.meta.url)
const B = TEXTS.map((x, i) => `### B${i + 1} · ${x.title} (\`${x.src}\`, ${x.type} tipi, ${toks(x.text).length} kelime)\n\n${x.text}\n\nHedefler: ${x.targets.map((t) => `**${t.w}** ${KIND[t.t]}`).join(' · ')}\n`).join('\n')
const cur = readFileSync(md, 'utf8')
writeFileSync(md, cur.replace(/<!-- B:basla -->[\s\S]*<!-- B:bitir -->/, `<!-- B:basla -->\n${B}\n<!-- B:bitir -->`))
