// Kullanım: cd app && npx vite --port 4262 --strictPort &  node design/alarm-sesleri/render.mjs ios/App/App/Sounds
// Çıktı: nefona-dalga-{sakin,guc,motive}.caf (master_dalga.py; denetim: design/uyanma-sesleri/analyze.py)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
import { execFileSync } from 'child_process'
const out = process.argv[2]
const port = process.env.PORT ?? '4262'
const b = await chromium.launch()
const p = await b.newPage()
p.on('pageerror', (e) => console.log('HATA', e.message))
await p.goto(`http://localhost:${port}/design/alarm-sesleri/render.html`)
await p.waitForFunction(() => window.ready === true, null, { timeout: 30000 })
for (const mode of ['sakin', 'guc', 'motive']) {
  const r = await p.evaluate((m) => window.renderClip(m), mode)
  const raw = `${out}/_ham-${mode}.wav`
  fs.writeFileSync(raw, Buffer.from(r.b64, 'base64'))
  execFileSync('python3', [new URL('./master_dalga.py', import.meta.url).pathname, raw, `${out}/nefona-dalga-${mode}.caf`], { stdio: 'inherit' })
  fs.unlinkSync(raw)
}
await b.close()
