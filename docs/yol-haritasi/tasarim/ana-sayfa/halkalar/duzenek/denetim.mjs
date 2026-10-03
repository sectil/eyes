// Ana sayfa halkaları: davranış denetimi (çekim değil). SCRIPT=denetim.mjs bash cek.sh <çıktı>  → <çıktı>/denetim.json
//  1. Kaydırırken boy değişimi (mobil tarayıcının araç çubuğu): ilk 7 günde satır gizliyken (G7, 320×640) sayfa kaydırılır
//     ve görünüm uzar (640 → 720; ikisi de ≤ 740 kısa ekran kuralında); karar değişmemeli, içerik zıplamamalı. Sayfa en
//     üstteyken görünüm yine uzarsa karar yenilenir.
//  2. Basma izi: "hareketi azalt" açıkken halkaya basılınca disk koyulaşır (dönüşüm yok); açık değilken halka %96'ya iner.
import { createRequire } from 'node:module'
import { writeFileSync, mkdirSync } from 'node:fs'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const URL = `http://127.0.0.1:${process.env.PORT ?? 4390}/@fs${new globalThis.URL('.', import.meta.url).pathname}home.html`
const TIME = '2026-10-03T09:07:00+03:00'
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const out = {}
const open = async (q, opts) => {
  const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, timezoneId: 'Europe/Istanbul', locale: 'tr-TR', ...opts })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date(TIME))
  await page.addInitScript(() => { const put = () => { const st = document.createElement('style'); st.textContent = '.screen{padding-top:40px!important}'; document.head.appendChild(st) }; document.addEventListener('DOMContentLoaded', put, { once: true }) })
  await page.goto(`${URL}?${q}`)
  await page.waitForSelector('section.hf .hg', { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1600)
  return { ctx, page }
}
const state = (page) => page.evaluate(() => {
  const hk = document.querySelector('.hk')
  const hg = document.querySelector('section.hf .hg')
  let y = 0
  for (let e = hg; e; e = e.offsetParent) y += e.offsetTop
  return { dataFit: hk?.getAttribute('data-fit') ?? null, gorunur: hk ? getComputedStyle(hk).display !== 'none' : false, kartY: y, kaydirma: Math.round(scrollY) }
})

// 1. Kaydırırken boy değişimi
{
  const { ctx, page } = await open('s=g7&ios=1&chips=1&theme=light')
  const r = { once: await state(page) }
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(150)
  r.kaydirinca = await state(page)
  await page.setViewportSize({ width: 320, height: 720 })
  await page.waitForTimeout(300)
  r.kaydirilmisUzayinca = await state(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(150)
  await page.setViewportSize({ width: 320, height: 721 })
  await page.waitForTimeout(300)
  r.enUsttenUzayinca = await state(page)
  r.sonuc = {
    kaydirilmisKenKararAyni: r.kaydirilmisUzayinca.dataFit === r.kaydirinca.dataFit,
    kaydirilmisKenKartYeriAyni: r.kaydirilmisUzayinca.kartY === r.kaydirinca.kartY,
    enUsttenKararYenilendi: r.enUsttenUzayinca.dataFit !== r.kaydirilmisUzayinca.dataFit,
  }
  out.kaydirmaBoy = r
  await ctx.close()
}

// 2. Basma izi
for (const [ad, reducedMotion] of [['hareketiAzalt', 'reduce'], ['hareketli', 'no-preference']]) {
  const { ctx, page } = await open('s=g2&ios=1&chips=0&theme=light', { viewport: { width: 390, height: 844 }, reducedMotion })
  const read = () => page.evaluate(() => {
    const d = document.querySelector('.hk-b .hk-d')
    const o = document.querySelector('.hk-b .hk-o')
    return { disk: getComputedStyle(d).backgroundColor, donusum: getComputedStyle(o).transform }
  })
  const before = await read()
  const box = await page.locator('.hk-b').first().boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + 20)
  await page.mouse.down()
  await page.waitForTimeout(200)
  const pressed = await read()
  await page.mouse.up()
  out[`basma_${ad}`] = { once: before, basili: pressed, diskDegisti: before.disk !== pressed.disk, donusumVar: pressed.donusum !== 'none' }
  await ctx.close()
}
await b.close()
writeFileSync(`${OUT}/denetim.json`, JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
process.exit(0)
