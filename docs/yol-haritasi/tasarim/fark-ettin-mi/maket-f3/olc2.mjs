import { createRequire } from 'module'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')
const D = new URL('.', import.meta.url).pathname
const b = await chromium.launch()
const out = []
for (const [w, h] of [[390, 844], [320, 568]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  for (const an of ['04-once', '04-sonra', '05', '06', '09', '10', '11', '12', '12-kart']) {
    await p.goto(`file://${D}maket.html?an=${an}&tema=acik`)
    await p.evaluate(() => document.fonts.ready)
    await p.evaluate(() => { for (const a of document.getAnimations()) a.finish() })
    const r = await p.evaluate(() => {
      const f = (s) => { const e = document.querySelector(s); if (!e) return '-'; const r = e.getBoundingClientRect(); return `${r.left.toFixed(0)}–${r.right.toFixed(0)} y${r.top.toFixed(0)}–${r.bottom.toFixed(0)}` }
      const all = [...document.querySelectorAll('.top,.cnt-panel,.cnt-q,.frame,.slot,.ms-head,.ms-card,.ms-blk,.strip,.row,.fact,main > .btn,.pop .hd,.pop .art,.pop .src')].map((e) => e.getBoundingClientRect())
      const L = Math.min(...all.map((r) => r.left)), R = Math.max(...all.map((r) => r.right))
      return `kenar ${L.toFixed(1)}–${R.toFixed(1)} | h1 ${f('h1')} | sahne ${f('.cnt-panel,.frame,.ms-card,.strip')} | alt ${f('.cnt-q,.slot,.ms-blk')} | pop ${f('.pop')} | best ${f('.thumb.best')}`
    })
    out.push(`${an} ${w}: ${r}`)
  }
}
console.log(out.join('\n'))
await b.close()
