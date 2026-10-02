// Kullanım: node cek.mjs <çıktı klasörü> [ekran...]  → her ekran için açık/koyu × 390/320
// Gerekenler: bu klasörde node_modules (playwright, @fontsource-variable/onest, @fontsource-variable/unbounded); npm i ile ya da bağlantıyla.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const [,, out = 'cekim', ...list] = process.argv
const screens = list.length ? list : ['giris', 'metin', 'soru', 'sonuc', 'sayilmadi']
mkdirSync(out, { recursive: true })
const file = new URL('./maket.html', import.meta.url).href
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
for (const s of screens) for (const theme of ['light', 'dark']) for (const w of [390, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, deviceScaleFactor: 2, colorScheme: theme })
  await p.goto(`${file}?s=${s}&theme=${theme}`)
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(250)
  await p.screenshot({ path: `${out}/${s}-${theme}-${w}.png` })
  await p.close()
}
await b.close()
