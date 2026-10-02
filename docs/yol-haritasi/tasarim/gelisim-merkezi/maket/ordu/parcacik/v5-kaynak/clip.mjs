// Yakın inceleme: node clip.mjs <çıktı.png> <hash> <tema> x y w h [sorgu] [bekle]
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright')
const D = new URL('.', import.meta.url).pathname
const [,, out, hash = '#d30', theme = 'dark', x = 0, y = 0, w = 390, h = 400, q = '', wait = '2600'] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 4, colorScheme: theme })
const p = await ctx.newPage(); const errs = []
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
await p.goto('file://' + D + '../v5.html' + q + hash); await p.waitForTimeout(+wait)
await p.screenshot({ path: out, clip: { x: +x, y: +y, width: +w, height: +h } })
await b.close(); console.log(errs.join('\n') || 'hata yok')
