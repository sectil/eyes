// Oku ve Anla: gerçek ekranların çekimi + ön denetim (maket/onden.mjs kuralları, uygulama sınıflarıyla).
// node cek.mjs <çıktı klasörü>
import { createRequire } from 'node:module'
// Playwright uygulamada bağımlı değil; makinedeki kurulumdan alınır (PW_DIR ile değiştirilebilir)
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const URL = `http://127.0.0.1:${process.env.PORT ?? 4388}/@fs${new globalThis.URL('.', import.meta.url).pathname}oa.html`
const b = await launch()
let fails = 0
const check = (page, kind) => page.evaluate((kind) => {
  const out = []
  const H = innerHeight
  if (document.scrollingElement.scrollWidth > innerWidth) out.push('yatay taşma')
  const sel = '.oa h1.t, .oa .lead, .oa h2.tt, .oa h2.q, .oa-verd .tx, .oa-row .v, .oa-row .k, .oa-opt .ot, .oa-today strong, .oa-today em, .oa .fair, .oa-anl .chip, .oa-meta, .oa .hint'
  for (const el of document.querySelectorAll(sel)) {
    if (el.getClientRects().length === 0) continue
    const words = []
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    while (walk.nextNode()) {
      const n = walk.currentNode, re = /\S+/g; let m
      if (n.parentElement.closest('.oa-sr, .okline')) continue
      while ((m = re.exec(n.data))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rc = rg.getClientRects()[0]; if (rc) words.push(Math.round(rc.top)) }
    }
    const lines = [...new Set(words)]
    const txt = [...el.childNodes].filter((n) => !(n.nodeType === 1 && n.matches('.oa-sr, .okline'))).map((n) => n.textContent).join('').trim()
    const lastW = txt.split(/\s+/).at(-1)
    const probe = document.createElement('span'); probe.textContent = lastW; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; el.appendChild(probe)
    const short = probe.getBoundingClientRect().width < el.getBoundingClientRect().width * 0.25; probe.remove()
    if (lines.length > 1 && short && words.filter((t) => t === lines.at(-1)).length === 1) out.push(`yetim kelime: ${el.className || el.tagName} "${txt.slice(0, 30)}"`)
    const toks = txt.split(/\s+/)
    let k = 0; for (const t of toks) { if (k < words.length && /^[·•–—,;:]$/.test(t) && lines.indexOf(words[k]) > 0 && words[k] !== words[k - 1]) out.push(`satır ayraçla başlıyor: ${el.className}`); k++ }
    // Erken kırılma: kelime sayısıyla değil satır genişliğiyle (ilk kelime çok uzunsa sayı yanıltır; tur 3)
    if (/^H2$/.test(el.tagName) && lines.length === 2) {
      const rects = [...el.getClientRects()]
      const rg = document.createRange(); rg.selectNodeContents(el)
      const lr = [...rg.getClientRects()].filter((r) => r.width > 4)
      const w1 = Math.max(...lr.filter((r) => Math.round(r.top) <= lines[0] + 2).map((r) => r.right)) - Math.min(...lr.filter((r) => Math.round(r.top) <= lines[0] + 2).map((r) => r.left))
      const w2 = Math.max(...lr.filter((r) => Math.round(r.top) > lines[0] + 2).map((r) => r.right)) - Math.min(...lr.filter((r) => Math.round(r.top) > lines[0] + 2).map((r) => r.left))
      if (w2 > w1 * 1.25) out.push(`başlık erken kırılıyor: ${txt.slice(0, 30)} (${Math.round(w1)}/${Math.round(w2)})`)
    }
  }
  const dock = document.querySelector('.oa-dock')
  if (kind === 'sabit' && dock) {
    const dt = dock.getBoundingClientRect().top
    const items = [...document.querySelectorAll('.oa > *:not(.oa-dock):not(.oa-spacer) *')].filter((e) => e.children.length === 0 && e.getClientRects().length && !e.closest('.oa-sr'))
    const bottom = Math.max(...items.map((e) => e.getBoundingClientRect().bottom))
    if (bottom > dt + 1) out.push(`içerik düğmenin altına giriyor (${Math.round(bottom - dt)} px)`)
    if (dt - bottom > 96) out.push(`ölü boşluk ${Math.round(dt - bottom)} px`)
    if (document.scrollingElement.scrollHeight > H + 1) out.push(`sabit ekran kayıyor (${document.scrollingElement.scrollHeight - H} px)`)
  }
  const ring = document.querySelector('.oa-ring svg')
  if (ring) {
    const d = ring.getBoundingClientRect().width * (176 / 264)
    for (const e of document.querySelectorAll('.oa-ring .c > *')) { const wd = e.getBoundingClientRect().width; if (wd > d * 0.8) out.push(`iç dairede dar: ${e.className} ${Math.round(wd)}/${Math.round(d)}`) }
  }
  for (const t of document.querySelectorAll('svg text')) {
    if (!t.getClientRects().length || getComputedStyle(t).display === 'none') continue
    const svg = t.ownerSVGElement, vb = svg.viewBox.baseVal.width, px = Math.min(...[t, ...t.querySelectorAll('tspan')].map((x) => parseFloat(getComputedStyle(x).fontSize))) * svg.getBoundingClientRect().width / vb
    if (px < 9.5) { out.push(`SVG yazısı küçük: ${px.toFixed(1)} px`); break }
  }
  // Dokunma alanı ≥ 44
  for (const e of document.querySelectorAll('.oa button, .oa a')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 40 || r.width < 40)) out.push(`küçük dokunma alanı: ${e.className} ${Math.round(r.width)}×${Math.round(r.height)}`) }
  return out
}, kind)

for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  for (const variant of ['sayildi', 'sayilmadi']) {
    const page = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2 })
    await page.clock.install()
    await page.goto(`${URL}?theme=${theme === 'koyu' ? 'dark' : 'light'}`)
    await page.evaluate(() => document.fonts.ready)
    // iPhone güvenli alanları (Chromium env() vermez): 390 = iPhone 14 (üst 47, alt 34), 320 = iPhone SE (üst 20, alt 0)
    await page.addStyleTag({ content: w === 390
      ? '.oa{padding-top:51px!important;padding-bottom:34px!important}.oa-dock{padding-bottom:34px!important}.oa-more{bottom:28px!important}'
      : '.oa{padding-top:34px!important;padding-bottom:20px!important}.oa-dock{padding-bottom:18px!important}.oa-more{bottom:14px!important}' })
    const shot = async (name, kind, bottom = false) => {
      await page.waitForTimeout(150)
      const r = await check(page, kind)
      console.log(`${name}-${w}-${theme}: ${r.length ? r.join(' | ') : 'tamam'}`)
      if (r.length) fails++
      await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png` })
      if (bottom) {
        await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight))
        await page.waitForTimeout(100)
        await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}-alt.png` })
      }
    }
    const qs = await page.evaluate(() => window.__oa.qs)
    if (variant === 'sayildi') await shot('giris', 'sabit')
    await page.getByRole('button', { name: 'Okumaya başla' }).click()
    await page.clock.runFor(100)
    if (variant === 'sayildi') await shot('metin', 'kayan')
    await page.clock.runFor(variant === 'sayildi' ? 30000 : 19000)
    await page.getByRole('button', { name: 'Bitirdim' }).click()
    for (let i = 0; i < 4; i++) {
      const ok = variant === 'sayildi' || i % 2 === 0
      await page.getByRole('button', { name: ok ? qs[i].right : qs[i].wrong, exact: true }).click()
      if (variant === 'sayildi' && i === 1) await shot('soru', 'sabit')
      await page.getByRole('button', { name: i === 3 ? 'Sonucu gör' : 'Sonraki soru' }).click()
    }
    await shot(variant === 'sayildi' ? 'sonuc' : 'sayilmadi', 'kayan', true)
    await page.close()
  }
}
await b.close()
process.exit(fails ? 1 : 0)
