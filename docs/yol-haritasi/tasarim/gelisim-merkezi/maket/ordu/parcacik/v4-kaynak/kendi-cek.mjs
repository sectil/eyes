// "Kendi yüzün (örnek)" hâlinin görüntüsü: #d30, koyu tema, 390 genişlik; anahtara basılır, geçiş bitince çekilir.
// Kullanım: node kendi-cek.mjs <v4.html mutlak yol> <çıktı png>
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright')
const [,, html, out] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] })
const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
await p.goto('file://' + html + '#d30')
await p.waitForTimeout(600)
await p.click('.fseg button[data-f="kendi"]')
await p.waitForTimeout(2200)   // geçiş 1,6 sn; ilk kırpmadan önce çekilir
const st = await p.evaluate(() => ({ hash: location.hash, pressed: document.querySelector('.fseg button[data-f="kendi"]').getAttribute('aria-pressed'), note: getComputedStyle(document.getElementById('priv')).opacity }))
await p.screenshot({ path: out })
await b.close()
console.log('tamam:', out, JSON.stringify(st), errs.length ? errs.join('\n') : 'hata yok')
if (errs.length) process.exit(1)
