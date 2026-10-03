// Giriş ekranı sığıyor mu: main kaydırma yüksekliği / görünür yükseklik (kamera düğmeli ve düğmesiz)
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--lang=tr-TR'] }).catch(() => chromium.launch())
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4392}/@fs${new URL('.', import.meta.url).pathname}dd.html`
for (const [w, h, top] of [[320, 568, 20], [320, 693, 50], [375, 667, 20], [375, 812, 50], [390, 844, 47]]) for (const extra of ['', '&td=1&cam=1']) {
  const p = await b.newPage({ viewport: { width: w, height: h }, locale: 'tr-TR' })
  await p.goto(`${BASE}?seen=1${extra}`)
  await p.evaluate(() => document.fonts.ready)
  await p.addStyleTag({ content: `.ex-stage{padding-top:${top + 8}px!important}` })
  await p.waitForTimeout(150)
  const m = await p.evaluate(() => { const e = document.querySelector('.ex-intro'); const hero = document.querySelector('.dd-hero'); if (hero && getComputedStyle(hero).display === 'none') return [e.scrollHeight, e.clientHeight, 'çizim', 'gizli']; return [e.scrollHeight, e.clientHeight, 'çizim', hero ? Math.round(hero.getBoundingClientRect().height) : '-'] })
  console.log(w, h, extra ? 'kamera' : 'düz', m.join(' / '), m[0] > m[1] ? 'TAŞIYOR' : 'sığıyor')
  await p.close()
}
await b.close()
