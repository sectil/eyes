// Mikrofonlu ekranlar: yaz-mic (soru + mikrofon), sesizin (izin sayfası), dinle (dinlerken, bir kelime geldi). node cek-mic.mjs <çıktı>
import { createRequire } from 'node:module'
// Playwright uygulamada bağımlı değil; makinedeki kurulumdan alınır (PW_DIR ile değiştirilebilir)
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4389}/@fs${new URL('.', import.meta.url).pathname}yy.html`
const b = await launch()
const DEV = { 390: { h: 844, top: 47, bot: 34, kb: 300 }, 320: { h: 568, top: 20, bot: 0, kb: 260 } }
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.clock.install({ time: new Date(2026, 9, 2, 10, 5) })
  const shot = async (name) => { await page.waitForTimeout(80); await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png`, caret: 'initial' }); console.log(name, w, theme) }
  const toAsk = async (mic) => {
    await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}&kb=${d.kb}&mic=${mic}`)
    await page.evaluate(() => { document.getElementById('kb').hidden = false; return document.fonts.ready })
    await page.addStyleTag({ content: `.yy{padding-top:${d.top + 6}px!important}${d.bot ? `.yy-sheet{padding-bottom:${d.bot + 16}px!important}` : ''}` }) // iPhone ev çubuğu payı (env safe-area düzenekte 0)
    await page.getByRole('button', { name: 'Başla' }).click()
    for (let k = 0; k < 60 && !(await page.$('.q')); k++) await page.clock.runFor(100)
  }
  await toAsk('ask')
  await shot('yaz-mic')
  await page.getByRole('button', { name: 'Sesle söyle' }).click()
  await page.clock.runFor(300)
  await shot('sesizin')
  await toAsk('on')
  await page.getByRole('button', { name: 'Sesle söyle' }).click()
  await page.clock.runFor(50)
  await page.evaluate(() => window.__lv?.(0.7))
  await page.clock.runFor(120)
  await shot('dinle0')
  await page.evaluate(() => { window.__cb({ text: 'deniz' }); window.__lv?.(0.45) })
  await page.clock.runFor(120)
  await shot('dinle1')
  await page.evaluate(() => window.__cb({ text: 'deniz dalış' }))
  await page.clock.runFor(50)
  await shot('dinle2')
  await page.close()
}
await b.close()
