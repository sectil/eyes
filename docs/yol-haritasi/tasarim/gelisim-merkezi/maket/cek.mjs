import { chromium } from 'playwright'
const [,, out, ...specs] = process.argv
const file = 'file:///home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/maket.html'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
for (const s of specs) {
  const [dir, day, theme, w] = s.split(':')
  const h = w === '320' ? 568 : 844
  const p = await b.newPage({ viewport: { width: +w, height: h }, deviceScaleFactor: 2, colorScheme: theme })
  await p.goto(`${file}?dir=${dir}&day=${day}&theme=${theme}&still`)
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${out}/${dir}-${day}-${theme}-${w}.png` })
  await p.close()
}
await b.close()
