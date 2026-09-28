// Kullanım: cd app && npx vite --port 4262 --strictPort &  node design/dalga-uyku/render.mjs public/sleep
// Çıktı: sakin-loop.wav (96 sn boşluksuz döngü) ve sakin-fade-{30,60,…,180}.mp3 (master.py: yüksek geçiren, −16 LUFS)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
import { execFileSync } from 'child_process'
const out = process.argv[2]
const port = process.env.PORT ?? '4262'
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage()
p.on('pageerror', (e) => console.log('HATA', e.message))
await p.goto(`http://localhost:${port}/design/dalga-uyku/render.html`)
await p.waitForFunction(() => window.ready === true, null, { timeout: 30000 })
const r = await p.evaluate(() => window.renderSleep())
const raw = `${out}/_ham.wav`
fs.writeFileSync(raw, Buffer.from(r.loop, 'base64'))
execFileSync('python3', [new URL('./master.py', import.meta.url).pathname, raw, out], { stdio: 'inherit' })
fs.unlinkSync(raw)
console.log('döngü', r.sec, 'sn', r.rate, 'Hz')
await b.close()
