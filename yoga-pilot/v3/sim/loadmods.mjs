import { readdirSync, existsSync } from 'node:fs'
const dir = '/home/user/eyes/app/src/modules'
const out = []
for (const d of readdirSync(dir)) {
  const f = `${dir}/${d}/manifest.js`
  if (!existsSync(f)) continue
  try { const m = await import(f); out.push(m.default) } catch (e) { console.log('YÜKLENEMEDİ', d, String(e).slice(0, 160)) }
}
console.log(out.length, out.map((m) => m.id).join(','))
