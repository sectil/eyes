// Maket görüntüleri: node cek.mjs <klasör> → <ekran>-<tema>-<genişlik>.png (390×844 ve 320×568, 2x)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
const out = process.argv[2] || 'tur1'
mkdirSync(out, { recursive: true })
const SCREENS = ['giris', 'goster', 'yaz', 'dogru', 'yanlis', 'sonuc', 'sesizin']
const file = 'file://' + new URL('./maket.html', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
for (const s of SCREENS) for (const theme of ['light', 'dark']) for (const w of [390, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, deviceScaleFactor: 2, colorScheme: theme })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(`${file}?s=${s}&theme=${theme}`)
  await p.waitForTimeout(300)
  // taşma denetimi: sayfa yatay ya da dikey taşıyor mu
  const over = await p.evaluate(() => [...document.querySelectorAll('.page *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 || r.bottom > innerHeight + 1 }).map((el) => el.className).slice(0, 5))
  await p.screenshot({ path: `${out}/${s}-${theme}-${w}.png` })
  if (errs.length || over.length) console.log(s, theme, w, errs, 'taşan:', over)
  await p.close()
}
await b.close()
