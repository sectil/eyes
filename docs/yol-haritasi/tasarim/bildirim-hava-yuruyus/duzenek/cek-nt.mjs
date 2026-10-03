// Bildirimler (D14) çekimi: bos, kurulu, saat × 390/320 × iki tema; yatay taşma ölçülür. node cek-nt.mjs <çıktı> (cek.sh ile)
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4391}/@fs${new URL('.', import.meta.url).pathname}nt.html`
const DEV = { 390: { h: 844, top: 47 }, 320: { h: 568, top: 20 } }
const b = await launch()
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) for (const s of ['bos', 'kurulu', 'saat']) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.goto(`${BASE}?s=${s}&theme=${theme === 'koyu' ? 'dark' : 'light'}`)
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: `.screen{padding-top:${d.top + 8}px!important}` })
  await page.waitForTimeout(250)
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }))
  await page.screenshot({ path: `${OUT}/${s}-${w}-${theme}.png`, fullPage: s !== 'saat' })
  console.log(s, w, theme, JSON.stringify(m))
  await page.close()
}
await b.close()
