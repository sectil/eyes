import { GROUPS } from './kelimeler.mjs'
import { EK, EK2 } from './ek.mjs'
const DROP = new Set('uğur böcek burun kanun kete divit hokka arasta ılgın hünnap kumkuat muşmula papirüs lagün koyak çökelek ardıç gürgen mersin pelin köfte kebap pastırma sucuk dürüm kafes kuru sulu saka obua'.split(' '))
const strip = (w) => w.replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
const seen = new Map(), st = new Map(), out = {}
for (const src of [GROUPS, EK, EK2]) for (const [g, s] of Object.entries(src)) for (const w of s.split(/\s+/).filter(Boolean)) {
  const n = [...w].length
  if (DROP.has(w) || n < 4 || n > 6 || seen.has(w)) continue
  const k = strip(w); if (st.has(k)) { console.log('ÇAKIŞMA', w, st.get(k)); continue }
  seen.set(w, g); st.set(k, w); (out[g] ??= []).push(w)
}
let t = 0; for (const [g, a] of Object.entries(out)) { t += a.length; console.log(g, a.length) }
console.log('toplam', t)
const fs = await import('node:fs'); fs.writeFileSync('liste.json', JSON.stringify(out, null, 0))
