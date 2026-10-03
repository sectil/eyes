// Okurken göz (deneme) çekimi: giriş, hazır (yüz yok / geri sayım), okuma, soru, sonuç; 390 ve 320, iki tema. node cek-og.mjs <çıktı>
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4388}/@fs${new URL('.', import.meta.url).pathname}og.html`
const DEV = { 390: { h: 844, top: 47, bot: 34 }, 320: { h: 568, top: 20, bot: 0 } }
const b = await launch()
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  const d = DEV[w]
  const shot = async (page, name) => {
    await page.waitForTimeout(60)
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight, txt: (() => { const t = document.querySelector('.og-text'); return t ? { sh: t.scrollHeight, ch: t.clientHeight, fs: t.style.fontSize } : null })(), kartAlt: Math.round(document.querySelector('.og-chart')?.getBoundingClientRect().bottom ?? 0), ayakUst: Math.round(document.querySelector('.og-foot')?.getBoundingClientRect().top ?? 0) }))
    await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png` })
    console.log(name, w, theme, JSON.stringify(m))
  }
  const open = async (extra = '') => {
    const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
    await page.clock.install({ time: new Date(2026, 9, 3, 15, 0) })
    await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}${extra}`)
    await page.evaluate(() => document.fonts.ready)
    await page.addStyleTag({ content: `.og{padding-top:${d.top + 4}px!important;padding-bottom:${Math.max(20, d.bot)}px!important}` })
    return page
  }
  let p = await open()
  await shot(p, 'giris')
  await p.getByRole('radio', { name: '250' }).click()
  await p.getByRole('button', { name: 'Başla' }).click()
  await p.clock.runFor(1300)
  await shot(p, 'hazir')
  await p.clock.runFor(2000)
  await p.clock.runFor(4200)
  await shot(p, 'okuma')
  await p.clock.runFor(30000)
  // Dört soru (sahip 2026-10-03): ilk soruyu çek; ilk seçenekle cevapla
  for (let k = 0; k < 4; k++) {
    await p.locator('.oa-opt').first().click()
    if (k === 0) await shot(p, 'soru')
    await p.getByRole('button', { name: k === 3 ? 'Sonucu gör' : 'Sonraki soru' }).click()
  }
  await shot(p, 'sonuc')
  await p.close()
  p = await open('&face=0')
  await p.getByRole('button', { name: 'Başla' }).click()
  await p.clock.runFor(1500)
  await shot(p, 'yuzyok')
  await p.close()
  p = await open('&td=0')
  await shot(p, 'desteksiz')
  await p.close()
}
await b.close()
