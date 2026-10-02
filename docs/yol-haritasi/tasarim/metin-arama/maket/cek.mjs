// Maket ekran görüntüleri: node cek.mjs <klasör>  → <ekran>-<tema>-<genişlik>.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
const out = process.argv[2] || 'tur1'
mkdirSync(new URL(`./${out}/`, import.meta.url), { recursive: true })
const file = 'file://' + new URL('./maket.html', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const LIST = process.argv[3] ? process.argv[3].split(',') : ['intro', 'search', 'found', 'absent', 'result']
for (const s of LIST) for (const theme of ['light', 'dark']) for (const w of [390, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, deviceScaleFactor: 2, colorScheme: theme })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  const [sc, v] = s.split('-'); await p.goto(`${file}?s=${sc}&theme=${theme}${v === 'rekor' ? '&r=rekor' : v ? '&v=' + v : ''}`); await p.waitForTimeout(400)
  const over = await p.evaluate(() => [...document.querySelectorAll('.body > *')].some((e) => e.getBoundingClientRect().bottom > innerHeight + 1 || e.scrollHeight > e.clientHeight + 3 || e.scrollWidth > e.clientWidth + 1) || [...document.querySelectorAll('.paper p, .fact b')].some((e) => e.getBoundingClientRect().bottom > e.closest('.paper, .fact').getBoundingClientRect().bottom + 1))
  await p.screenshot({ path: new URL(`./${out}/${s}-${theme}-${w}.png`, import.meta.url).pathname })
  if (errs.length || over) console.log(s, theme, w, errs, over ? 'TAŞMA' : '')
  await p.close()
}
await b.close()
