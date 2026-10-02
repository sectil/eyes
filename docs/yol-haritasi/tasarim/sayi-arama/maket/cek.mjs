// Kullanım: node cek.mjs <klasör> [ekran ...]  → <klasör>/<ekran>-<light|dark>-<390|320>.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const [,, out, ...want] = process.argv
const screens = want.length ? want : ['intro', 'play', 'found', 'result1', 'result2']
const file = 'file://' + new URL('./maket.html', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const fs = await import('node:fs'); fs.mkdirSync(out, { recursive: true })
for (const s of screens) for (const theme of ['light', 'dark']) for (const w of [390, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, deviceScaleFactor: 2, colorScheme: theme })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(`${file}?s=${s}&theme=${theme}`); await p.waitForTimeout(400)
  await p.screenshot({ path: `${out}/${s}-${theme}-${w}.png` })
  if (errs.length) console.log(s, errs)
  await p.close()
}
await b.close()
