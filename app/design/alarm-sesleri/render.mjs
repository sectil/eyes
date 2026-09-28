import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
const out = process.argv[2]
const b = await chromium.launch()
const p = await b.newPage()
p.on('pageerror', (e) => console.log('HATA', e.message))
await p.goto('http://localhost:4262/design/alarm-sesleri/render.html')
await p.waitForFunction(() => window.ready === true, null, { timeout: 30000 })
for (const mode of ['sakin', 'guc', 'motive']) {
  const r = await p.evaluate((m) => window.renderClip(m), mode)
  fs.writeFileSync(`${out}/nefona-dalga-${mode}.wav`, Buffer.from(r.b64, 'base64'))
  console.log(mode, r.sec.toFixed(1), 'sn', r.rate, 'Hz', 'tepe', r.peak.toFixed(3))
}
await b.close()
