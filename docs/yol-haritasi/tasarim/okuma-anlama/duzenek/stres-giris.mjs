import { createRequire } from 'node:module'
// Playwright uygulamada bağımlı değil; makinedeki kurulumdan alınır (PW_DIR ile değiştirilebilir)
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
import { readFileSync } from 'node:fs'
const bank = JSON.parse(readFileSync(new globalThis.URL('../../../../../app/src/lib/okumaBank.json', import.meta.url), 'utf8')).metinler
const URL = `http://127.0.0.1:${process.env.PORT ?? 4388}/@fs${new globalThis.URL('.', import.meta.url).pathname}oa.html`
const b = await launch()
for (const w of [320, 390]) {
  const page = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 } })
  await page.goto(URL)
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: w === 390 ? '.oa{padding-top:51px!important;padding-bottom:34px!important}.oa-dock{padding-bottom:34px!important}' : '.oa{padding-top:34px!important;padding-bottom:20px!important}.oa-dock{padding-bottom:18px!important}' })
  const res = await page.evaluate((T) => {
    const out = []
    const st = document.querySelector('.oa-today strong'), em = document.querySelector('.oa-today em')
    for (const t of T) {
      st.textContent = t.baslik; em.textContent = `${t.metin.trim().split(/\s+/).length} kelime`
      const cardB = document.querySelector('.oa-today').getBoundingClientRect().bottom
      const fairT = document.querySelector('.oa .fair').getBoundingClientRect().top
      const over = document.scrollingElement.scrollHeight - innerHeight
      if (over > 0 || cardB > fairT - 4) out.push({ id: t.id, over, gap: Math.round(fairT - cardB), b: t.baslik })
    }
    return out
  }, bank.map((t) => ({ id: t.id, baslik: t.baslik, metin: t.metin })))
  console.log(w, 'sığmayan:', res.length, JSON.stringify(res.slice(0, 8)))
  await page.close()
}
await b.close()
