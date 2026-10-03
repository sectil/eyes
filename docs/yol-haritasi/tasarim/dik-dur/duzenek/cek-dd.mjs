// Dik Dur çekimi: giriş, güvenlik, tutma, ara, dinlenme (tam tur), bitiş × 390/320 × iki tema; yatay taşma ölçülür.
// node cek-dd.mjs <çıktı> (cek.sh ile). Saat playwright clock ile ileri sarılır.
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--lang=tr-TR'] }).catch(() => chromium.launch())
const OUT = process.argv[2]
const BASE = `http://127.0.0.1:${process.env.PORT ?? 4392}/@fs${new URL('.', import.meta.url).pathname}dd.html`
const DEV = { 390: { h: 844, top: 47 }, 320: { h: 568, top: 20 }, '320z': { w: 320, h: 693, top: 50 }, 375: { h: 667, top: 20 }, '375x': { w: 375, h: 812, top: 50 } } // 320z: mini, büyütülmüş ekran · 375: SE · 375x: mini
const b = await launch()
async function open(w, theme, seen, extra = '') {
  const d = DEV[w]
  const page = await b.newPage({ viewport: { width: d.w ?? w, height: d.h }, colorScheme: theme === 'koyu' ? 'dark' : 'light', deviceScaleFactor: 2, locale: 'tr-TR' })
  await page.emulateMedia({ reducedMotion: 'reduce' }) // bu Chromium H.264 oynatmaz: videonun son karesi (tutmadaki duruş) görünsün
  await page.clock.install({ time: new Date(2026, 9, 3, 12) })
  await page.goto(`${BASE}?theme=${theme === 'koyu' ? 'dark' : 'light'}${seen ? '&seen=1' : ''}${extra}`)
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: `.ex-stage{padding-top:${d.top + 8}px!important} *{transition:none!important}` }) // saat donuk: geçişler kapalı
  await page.waitForTimeout(200)
  return page
}
const shot = async (page, name, w, theme) => {
  await page.waitForTimeout(150)
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }))
  await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png` })
  console.log(name, w, theme, JSON.stringify(m))
}
const tap = (page, label) => page.getByRole('button', { name: label, exact: true }).click()
const ONLY = process.env.ONLY ?? 'temel,kamera'
if (ONLY.includes('giris')) for (const theme of ['acik', 'koyu']) {
  // giriş düzeni farklı boylarda (kameralı giriş yalnız Face ID'li boylarda: 320z, 375x, 390)
  for (const w of [390, 375, 320]) { const p = await open(w, theme, true); await shot(p, 'giris', w, theme); await p.close() }
  for (const w of ['320z', '375x']) { const p = await open(w, theme, true, '&td=1&cam=1&cal=1'); await shot(p, 'giris-kamera', w, theme); await p.close() }
}
for (const theme of ['acik', 'koyu']) for (const w of [390, 320]) {
  if (ONLY.includes('kamera')) {
    let k = await open(w, theme, true, '&td=1')
    await tap(k, 'Kısa tur · 2 dakika')
    await shot(k, 'kamera-soru', w, theme)
    await tap(k, 'Kamerayla')
    await shot(k, 'yasla', w, theme)
    const y = await open(w, theme, true, '&td=1&cam=1&face=0')
    await tap(y, 'Kısa tur · 2 dakika')
    await shot(y, 'yasla-arama', w, theme)
    await y.close()
    await tap(k, 'Hazırım')
    await k.clock.runFor(2500)
    await shot(k, 'gosterme-normal', w, theme)
    await k.clock.runFor(4000)
    await shot(k, 'gosterme-dik', w, theme)
    await k.clock.runFor(4000)
    await shot(k, 'gosterme-tamam', w, theme)
    await k.close()
    k = await open(w, theme, true, '&td=1&cam=1&cal=1')
    await shot(k, 'giris-kamera', w, theme)
    await tap(k, 'Kısa tur · 2 dakika')
    await tap(k, 'Hazırım')
    await shot(k, 'ayni-yer', w, theme)
    await k.close()
  }
  if (!ONLY.includes('temel')) continue
  let p = await open(w, theme, false)
  await shot(p, 'giris', w, theme)
  await tap(p, 'Kısa tur · 2 dakika')
  await shot(p, 'guvenlik', w, theme)
  await tap(p, 'Anladım')
  await p.clock.runFor(4000)
  await shot(p, 'tutma', w, theme)
  await p.clock.runFor(6500)
  await shot(p, 'ara', w, theme)
  await p.clock.runFor(4000)
  await shot(p, 'tutma-cene', w, theme)
  for (let i = 0; i < 70 && !(await p.getByText('Bitti').count()); i++) await p.clock.runFor(2000)
  await shot(p, 'bitis', w, theme)
  await p.close()
  p = await open(w, theme, true)
  await tap(p, 'Tam tur · 15 dakika')
  for (let i = 0; i < 260; i++) { await p.clock.runFor(1000); if (await p.getByText('Dinlen.').count()) break }
  await p.clock.runFor(20000)
  await shot(p, 'dinlenme', w, theme)
  await p.close()
}
await b.close()
