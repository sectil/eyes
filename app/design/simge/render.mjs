// SVG -> PNG (Chromium). Kullanım: node render.mjs <çıktı-klasörü> <boyut> a.svg b.svg ...
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
const [out, size, ...files] = process.argv.slice(2)
const n = Number(size)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: n, height: n } })
for (const f of files) {
  const svg = fs.readFileSync(f, 'utf8').replace(/width="1024" height="1024"/, `width="${n}" height="${n}"`)
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`)
  await p.locator('svg').screenshot({ path: path.join(out, path.basename(f).replace('.svg', '.png')) })
}
await b.close()
