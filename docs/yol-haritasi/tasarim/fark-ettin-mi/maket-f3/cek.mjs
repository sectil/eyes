// Maket görüntüleri: her durum × 390/320 × açık/koyu; hareketli anlarda 3 kare. node cek.mjs [yalnız-an]
import { createRequire } from 'module'
import { mkdirSync } from 'node:fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')
const D = new URL('.', import.meta.url).pathname
const OUT = D + 'goruntu/'
mkdirSync(OUT, { recursive: true })
const ANS = ['04-once', '04-sonra', '05', '06', '09', '10', '11', '12', '12-kart']
const SEQ = { '05': [200, 1500, 2850], '11': [0, 420, 1800] }
const STILL = { '05': 1200 } // 05 durağan: süre göstergesinin ortası
const SIZES = [[390, 844], [320, 568]]
const THEMES = ['acik', 'koyu']
const only = process.argv[2]
const b = await chromium.launch()
const errs = []
for (const [w, h] of SIZES) for (const t of THEMES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: t === 'koyu' ? 'dark' : 'light', locale: 'tr-TR' })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(`${w}-${t}: ${e.message}`))
  p.on('console', (m) => m.type() === 'error' && errs.push(`${w}-${t}: ${m.text().slice(0, 200)}`))
  for (const an of ANS) {
    if (only && !only.split(',').includes(an)) continue
    await p.goto(`file://${D}maket.html?an=${an}&tema=${t}`)
    await p.evaluate(() => document.fonts.ready)
    await p.waitForTimeout(80)
    const at = (ms) => p.evaluate((ms) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms } }, ms)
    if (SEQ[an]) for (const [k, ms] of SEQ[an].entries()) { await at(ms); await p.waitForTimeout(40); await p.screenshot({ path: `${OUT}${an}-${w}-${t}-${k + 1}.png` }) }
    if (STILL[an] != null) await at(STILL[an])
    else await p.evaluate(() => { for (const a of document.getAnimations()) a.finish() })
    await p.waitForTimeout(40)
    // taşma denetimi: yatay kaydırma ve kutusundan taşan yazı
    const chk = await p.evaluate(() => {
      const out = []
      if (document.documentElement.scrollWidth > innerWidth + 0.5) out.push(`yatay taşma ${document.documentElement.scrollWidth}`)
      for (const el of document.querySelectorAll('h1,p,span,button,i,figcaption')) {
        const r = el.getBoundingClientRect()
        if (!r.width || getComputedStyle(el).opacity === '0') continue
        if (r.right > innerWidth + 0.5 || r.left < -0.5) out.push(`ekran dışı: ${el.className} "${el.textContent.trim().slice(0, 30)}" ${r.left.toFixed(0)}–${r.right.toFixed(0)}`)
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') out.push(`kesik: ${el.className} "${el.textContent.trim().slice(0, 30)}"`)
      }
      // tek yan boşluk: içerik öğeleri 20 px'ten başlar, W−20'de biter (alttan açılan sayfanın kendisi hariç; içi denetlenir)
      const G = 20
      for (const el of document.querySelectorAll('.top,.cnt-panel,.cnt-q,.frame,.slot,.chg-head,.ms-head,.ms-card,.ms-blk,.strip,.thumb,.thumb .badge,.thumb.best,.r2,.row,.fact,main > .btn,.pop .hd,.pop .art,.pop .claim,.pop .body,.pop .src')) {
        const r = el.getBoundingClientRect()
        if (!r.width) continue
        if (r.left < G - 0.6 || r.right > innerWidth - G + 0.6) out.push(`hiza: ${el.className} ${r.left.toFixed(1)}–${r.right.toFixed(1)}`)
      }
      const m = document.querySelector('main')
      if (m && m.scrollHeight > m.clientHeight + 1) out.push(`dikey taşma ${m.scrollHeight}>${m.clientHeight}`)
      return out
    })
    if (chk.length) errs.push(`${an}-${w}-${t}: ${chk.join(' | ')}`)
    await p.screenshot({ path: `${OUT}${an}-${w}-${t}.png` })
  }
  await ctx.close()
}
await b.close()
console.log(errs.length ? errs.join('\n') : 'hata yok')
