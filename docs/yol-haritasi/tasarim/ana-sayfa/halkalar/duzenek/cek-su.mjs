// Su çipi (sahip 2026-10-03): Ana sayfa G2, dokunmadan ve bir dokunuştan sonra ("Geri al" görünür); 390 ve 320, iki tema.
// node cek-su.mjs <çıktı> (cek.sh ile: SCRIPT=cek-su.mjs bash cek.sh <çıktı>)
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const URL = `http://127.0.0.1:${process.env.PORT ?? 4390}/@fs${new globalThis.URL('.', import.meta.url).pathname}home.html`
const DEV = { 390: { h: 844, top: 47 }, 320: { h: 640, top: 20 } }
const b = await launch()
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.goto(`${URL}?s=g2&ios=1&chips=1&theme=${theme === 'koyu' ? 'dark' : 'light'}`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const m = async () => page.evaluate(() => {
    const chips = [...document.querySelectorAll('.hh-chips > *')].map((e) => { const r = e.getBoundingClientRect(); return [e.className.split(' ').slice(-1)[0], Math.round(r.left), Math.round(r.top), Math.round(r.right)] })
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, chips }
  })
  await page.screenshot({ path: `${OUT}/su-${w}-${theme}.png` })
  console.log('su', w, theme, JSON.stringify(await m()))
  await page.locator('.hh-fact.water').click()
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${OUT}/su-eklendi-${w}-${theme}.png` })
  console.log('su-eklendi', w, theme, JSON.stringify(await m()))
  await page.close()
}
await b.close()
