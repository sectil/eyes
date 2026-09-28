// Kullanım: cd app && npx vite --port 4262 --strictPort &  node design/dalga-uyku/render.mjs public/sleep
// Çıktı: sakin-loop.wav (96 sn boşluksuz döngü) ve sakin-fade-{30,60,…,180}.mp3 (her kısılma süresi için, 64 kbit/sn; to_mp3.py, lameenc)
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
// Döngü WAV kalır: MP3 başa/sona ~50 ms boşluk ekler, her 96 sn'de tık olurdu. Kısılan parça tek sefer çalar: MP3.
fs.writeFileSync(`${out}/sakin-loop.wav`, Buffer.from(r.loop, 'base64'))
for (const [F, b64] of Object.entries(r.fades)) {
  const fadeWav = `${out}/sakin-fade-${F}.wav`
  fs.writeFileSync(fadeWav, Buffer.from(b64, 'base64'))
  execFileSync('python3', [new URL('./to_mp3.py', import.meta.url).pathname, fadeWav, `${out}/sakin-fade-${F}.mp3`, '64'], { stdio: 'inherit' })
  fs.unlinkSync(fadeWav)
}
console.log('döngü', r.sec, 'sn', r.rate, 'Hz')
await b.close()
