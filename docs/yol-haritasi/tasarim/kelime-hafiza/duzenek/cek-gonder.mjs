// Cihaz düzeltmesi 2026-10-03: sesle iki kelime oturunca alan ve Gönder düğmesi; klavyeli ve klavyesiz, 430/390/320. node cek-gonder.mjs <çıktı> (cek.sh ile)
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4389}/@fs${new URL('.', import.meta.url).pathname}yy.html`
const DEV = { 430: { h: 932, top: 59, kb: 336 }, 390: { h: 844, top: 47, kb: 300 }, 320: { h: 568, top: 20, kb: 260 } }
const out = []
for (const theme of ['acik', 'koyu']) for (const w of [430, 390, 320]) for (const kb of [0, 1]) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.clock.install({ time: new Date(2026, 9, 2, 10, 5) })
  await page.goto(BASE + '?theme=' + (theme === 'koyu' ? 'dark' : 'light') + '&kb=' + (kb ? d.kb : 0) + '&mic=on')
  await page.evaluate((kb) => { const k = document.getElementById('kb'); if (k) k.hidden = !kb; return document.fonts.ready }, kb)
  await page.addStyleTag({ content: '.yy{padding-top:' + (d.top + 6) + 'px!important}' })
  await page.getByRole('button', { name: 'Başla' }).click()
  for (let k = 0; k < 60 && !(await page.$('.q')); k++) await page.clock.runFor(100)
  await page.getByRole('button', { name: 'Sesle söyle' }).click()
  await page.clock.runFor(50)
  await page.evaluate(() => window.__cb({ text: 'Zarf üz' }))
  await page.clock.runFor(300)
  await page.evaluate(() => window.__cb({ text: 'Zarf üzüm' }))
  await page.clock.runFor(1100)
  const name = 'duydu-' + w + '-' + theme + (kb ? '-klavye' : '')
  await page.waitForTimeout(80)
  await page.screenshot({ path: OUT + '/' + name + '.png' })
  const m = await page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect()
    const send = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Gönder'))?.getBoundingClientRect()
    const field = document.querySelector('.yy-input .field')
    const main = r('main.yy')
    return { value: field?.value, send: send && { l: Math.round(send.left), r: Math.round(send.right), t: Math.round(send.top), b: Math.round(send.bottom) }, mainB: Math.round(main.bottom), vv: visualViewport.height, sw: document.documentElement.scrollWidth, iw: innerWidth, fieldW: Math.round(field.getBoundingClientRect().width), stageH: Math.round(r('.yy-stage').height) }
  })
  out.push(name + ' ' + JSON.stringify(m))
  await page.close()
}
console.log(out.join('\n'))
await b.close()
