// Yılan ekranları: 390×844 ve 320×640, açık ve koyu. Çıktı: ../ekran/<ad>-<genişlik>-<tema>.png
//   node cek.mjs [önek]   (sunucu cek.sh'ta, 4293)
import { createRequire } from 'module'
import { mkdirSync } from 'node:fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')
const D = new URL('.', import.meta.url).pathname
const OUT = new URL('../ekran/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const URL0 = `http://127.0.0.1:4293/@fs${D}yilan.html`
const only = process.argv[2] ?? ''
const PT = 6.1
// Sistem modeli (sentetik, teshis/sim1.mjs ile aynı): ekran noktası mm, hedefler %8/%92, %12/%84
const W = 375, H = 812, mm = (pt) => pt / PT
const MODEL = { version: 3, ok: true, closeAt: 0.5, phone: null, date: '2026-09-28T10:00:00Z',
  x: { feature: 'scrX', c: 0, neg: mm(0.08 * W - 0.5 * W), pos: mm(0.92 * W - 0.5 * W), score: 9 },
  y: { feature: 'scrY', c: 0, neg: -mm(0.84 * H - 0.46 * H), pos: mm(0.46 * H - 0.12 * H), score: 9 } }
const SCENES = [
  ['1-giris', { practiced: false }, async () => {}],
  ['2-dene', { practiced: false }, async (p) => { await p.click('.snake-cta .btn'); await p.waitForTimeout(1500) }],
  ['3-oyun', { practiced: true }, async (p) => { await p.click('.snake-cta .btn'); await p.waitForTimeout(4400) }],
  ['4-sonuc', { practiced: true }, async (p) => { await p.click('.snake-cta .btn'); await p.waitForSelector('#snake-over-title', { timeout: 20000 }); await p.waitForTimeout(900) }],
]
const b = await chromium.launch()
const errs = []
for (const [name, opts, act] of SCENES) {
  if (only && !name.startsWith(only)) continue
  for (const [w, h] of [[390, 844], [320, 640]]) for (const scheme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, locale: 'tr-TR' })
    await ctx.addInitScript(([m, o]) => {
      localStorage.setItem('gozolcum:gaze-model-v1', JSON.stringify(m))
      localStorage.setItem('gozolcum:snake-opts', JSON.stringify({ control: 'eyes', walls: 'classic', practiced: o.practiced }))
      localStorage.setItem('gozolcum:snake-best', '14')
      window.__gaze = { x: 0, y: 0 }
    }, [MODEL, opts])
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errs.push(`${name}: ${e.message}`))
    await p.goto(URL0)
    await p.waitForSelector('.snake-cta .btn', { timeout: 60000 })
    await p.waitForTimeout(500)
    await act(p)
    const f = `${OUT}${name}-${w}-${scheme === 'light' ? 'acik' : 'koyu'}.png`
    await p.screenshot({ path: f })
    console.log(f.split('/').pop())
    await ctx.close()
  }
}
await b.close()
if (errs.length) console.log('HATA', errs)
