// Hızlı inceleme görüntüsü: node bak.mjs <çıktı klasörü> "ad|?sorgu|#hash|tema|gen|yük|bekle|tık" ...
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright')
import { mkdirSync, writeFileSync } from 'node:fs'
const D = new URL('.', import.meta.url).pathname
const html = D + '../v5.html'
const [,, out, ...specs] = process.argv
mkdirSync(out, { recursive: true })
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] })
const errs = []
for (const sp of specs){
  const [name, q = '', hash = '#d30', theme = 'dark', w = '390', h = '844', wait = '2500', click = ''] = sp.split('|')
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: +w, height: +h }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: name.includes('rm') ? 'reduce' : 'no-preference' })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(`${name} pageerror: ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`${name} ${m.type()}: ${m.text()}`) })
  await p.goto('file://' + html + q + hash)
  if (click){ await p.waitForTimeout(1200); await p.click(click); }
  await p.waitForTimeout(+wait)
  const info = await p.evaluate(() => window.__gl && window.__gl.info)
  if (name.startsWith('stage')) await (await p.$('#stage')).screenshot({ path: `${out}/${name}.png` })
  else await p.screenshot({ path: `${out}/${name}.png` })
  console.log(name, JSON.stringify(info))
  await ctx.close()
}
writeFileSync(`${out}/errors.txt`, errs.join('\n') || 'hata yok')
console.log(errs.join('\n') || 'hata yok')
await b.close()
