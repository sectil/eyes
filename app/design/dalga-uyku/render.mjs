// Kullanım: cd app && npx vite --port 4262 --strictPort &  node design/dalga-uyku/render.mjs public/sleep
// Çıktı: sakin-loop.wav (96 sn boşluksuz döngü) ve sakin-fade.mp3 (180 sn, yavaşça susar; to_mp3.py, lameenc)
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
const fadeWav = `${out}/sakin-fade.wav`
fs.writeFileSync(fadeWav, Buffer.from(r.fade, 'base64'))
execFileSync('python3', [new URL('./to_mp3.py', import.meta.url).pathname, fadeWav, `${out}/sakin-fade.mp3`], { stdio: 'inherit' })
fs.unlinkSync(fadeWav)
console.log('döngü', r.sec, 'sn', r.rate, 'Hz')
await b.close()
