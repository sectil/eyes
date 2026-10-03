// Yakala Yaz: gerçek ekranların çekimi + ön denetim. node cek.mjs <çıktı>
import { createRequire } from 'node:module'
// Playwright uygulamada bağımlı değil; makinedeki kurulumdan alınır (PW_DIR ile değiştirilebilir)
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4389}/@fs${new URL('.', import.meta.url).pathname}yy.html`
const b = await launch()
let fails = 0
const DEV = { 390: { h: 844, top: 47, bot: 34, kb: 300 }, 320: { h: 568, top: 20, bot: 0, kb: 260 } }
const check = (page) => page.evaluate(() => {
  const out = []
  if (document.scrollingElement.scrollWidth > innerWidth) out.push('yatay taşma')
  for (const el of document.querySelectorAll('.yy-h1, .yy-lead, .yy-small, .yy-lg div, .yy-chip, .yy-rows .r span, .fb, .q, .yy-track .ends span')) {
    if (!el.getClientRects().length) continue
    const r = el.getBoundingClientRect()
    if (r.right > innerWidth + 0.5 || r.left < -0.5) out.push(`kenardan taşıyor: ${el.className}`)
    const words = []
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    while (walk.nextNode()) { const n = walk.currentNode, re = /\S+/g; let m; while ((m = re.exec(n.data))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rc = rg.getClientRects()[0]; if (rc) words.push(Math.round(rc.top)) } }
    const lines = [...new Set(words)]
    if (lines.length > 1 && words.filter((t) => t === lines.at(-1)).length === 1 && el.textContent.trim().split(/\s+/).at(-1).length <= 6) out.push(`yetim kelime: ${el.className} "${el.textContent.trim().slice(0, 30)}"`)
  }
  for (const e of document.querySelectorAll('.yy button')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 40 || r.width < 40)) out.push(`küçük dokunma alanı ${Math.round(r.width)}×${Math.round(r.height)}`) }
  const yy = document.querySelector('.yy'); if (yy && yy.scrollHeight > yy.clientHeight + 1 && !yy.classList.contains('res')) out.push(`kayıyor ${yy.scrollHeight - yy.clientHeight} px`)
  return out
})
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
  await page.clock.install({ time: new Date(2026, 9, 2, 10, 5) })
  const safe = (kb) => page.addStyleTag({ content: `.yy{padding-top:${d.top + 6}px!important}${kb ? '' : `.yy:not(.run){padding-bottom:${Math.max(20, d.bot)}px!important}`}` })
  const shot = async (name, full) => {
    await page.waitForTimeout(80)
    const r = await check(page)
    console.log(`${name}-${w}-${theme}: ${r.length ? r.join(' | ') : 'tamam'}`)
    if (r.length) fails++
    await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png`, caret: 'initial' })
    if (full) { await page.evaluate(() => window.scrollTo(0, 1e6)); await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}-alt.png` }); await page.evaluate(() => window.scrollTo(0, 0)) }
  }
  // Giriş: klavye kapalı
  await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}&kb=0`)
  await page.evaluate(() => document.fonts.ready); await safe(false)
  await shot('giris')
  // Tur: klavye açık
  await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}&kb=${d.kb}`)
  await page.evaluate(() => { document.getElementById('kb').hidden = false; return document.fonts.ready }); await safe(true)
  await page.getByRole('button', { name: 'Başla' }).click()
  const words = () => page.evaluate(() => [...document.querySelectorAll('.words:not(.ok) .w')].map((x) => x.textContent))
  let n = 0, shotYaz = false
  for (let k = 0; k < 40 && !(await page.$('.yy.res')); k++) {
    await page.clock.runFor(600)
    await page.clock.runFor(40)
    if (k === 0) await shot('goster')
    await page.clock.runFor(700)
    const [a, c] = await words()
    const field = page.locator('input.field')
    if (k === 6 && !shotYaz) { await field.fill(`${a} ${c.slice(0, 3)}`); await shot('yaz'); shotYaz = true }
    const wrong = k === 9 || k === 14 || k === 17
    await field.fill(wrong ? `${a} ${c.slice(0, -1)}${c.at(-1) === 'a' ? 'e' : 'a'}` : `${c} ${a}`)
    await field.press('Enter')
    await page.clock.runFor(260) // merdivendeki 200 ms geçiş bitsin
    if (k === 6) await shot('dogru')
    if (k === 9) await shot('yanlis')
    await page.clock.runFor(700)
    n++
  }
  await page.clock.runFor(100)
  await page.evaluate(() => { document.getElementById('kb').hidden = true; window.__setVV(innerHeight) })
  await shot('sonuc', true)
  await page.close()
}
await b.close()
process.exit(fails ? 1 : 0)
