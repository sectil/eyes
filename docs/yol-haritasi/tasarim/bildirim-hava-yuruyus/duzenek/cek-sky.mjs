// Hava sayfası çekimi (saatlik şerit): 390 ve 320, iki tema; şeridin sağ kenarında yarım sütun var mı ölçülür. node cek-sky.mjs <çıktı>
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4391}/@fs${new URL('.', import.meta.url).pathname}sky.html`
const DEV = { 390: { h: 844, top: 47 }, 320: { h: 568, top: 20 } }
const b = await launch()
const V = process.env.V ?? ''
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}${V ? `&v=${V}` : ''}`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const m = await page.evaluate(() => {
    const box = document.querySelector('.wx-hours')
    if (!box) return { yok: true, txt: document.body.textContent.slice(0, 200) }
    const br = box.getBoundingClientRect()
    const cols = [...box.querySelectorAll('.wx-hr')].map((e) => e.getBoundingClientRect())
    const cut = cols.filter((r) => r.left < br.right && r.right > br.right).map((r) => Math.round(br.right - r.left))
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, kutu: [Math.round(br.left), Math.round(br.right)], sutun: cols.length, kesik: cut }
  })
  await page.screenshot({ path: `${OUT}/${V || 'hava'}${process.env.TAG ?? ''}-${w}-${theme}.png` })
  console.log(w, theme, JSON.stringify(m))
  await page.close()
}
await b.close()
