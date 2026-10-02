import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const [,, out, ...specs] = process.argv
const file = 'file://' + new URL('./maket.html', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
for (const s of specs) {
  const [scr, theme, w] = s.split(':')
  const h = w === '320' ? 568 : 844
  const p = await b.newPage({ viewport: { width: +w, height: h }, deviceScaleFactor: 2, colorScheme: theme })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(`${file}?s=${scr}&theme=${theme}`)
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${out}/${scr}-${theme}-${w}.png` })
  if (errs.length) console.log(scr, errs)
  await p.close()
}
await b.close()
