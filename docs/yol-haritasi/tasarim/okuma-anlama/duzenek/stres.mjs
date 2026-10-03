// Soru ekranı: bankadaki 720 sorunun her biri, cevaplanmış hâlde (Doğrusu bu + düğme), 320 ve 390'da sığıyor mu?
import { createRequire } from 'node:module'
// Playwright uygulamada bağımlı değil; makinedeki kurulumdan alınır (PW_DIR ile değiştirilebilir)
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
import { readFileSync } from 'node:fs'
const bank = JSON.parse(readFileSync(new globalThis.URL('../../../../../app/src/lib/okumaBank.json', import.meta.url), 'utf8')).metinler
const QS = bank.flatMap((t) => t.sorular.map((q, i) => ({ id: `${t.id}-${i}`, soru: q.soru, opts: q.secenekler })))
const URL = `http://127.0.0.1:${process.env.PORT ?? 4388}/@fs${new globalThis.URL('.', import.meta.url).pathname}oa.html`
const b = await launch()
for (const w of [320, 390]) {
  const page = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 } })
  await page.clock.install()
  await page.goto(URL)
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: w === 390 ? '.oa{padding-top:51px!important;padding-bottom:34px!important}.oa-dock{padding-bottom:34px!important}' : '.oa{padding-top:34px!important;padding-bottom:20px!important}.oa-dock{padding-bottom:18px!important}' })
  const qs = await page.evaluate(() => window.__oa.qs)
  await page.getByRole('button', { name: 'Okumaya başla' }).click()
  await page.clock.runFor(30000)
  await page.getByRole('button', { name: 'Bitirdim' }).click()
  await page.getByRole('button', { name: qs[0].wrong, exact: true }).click()
  const res = await page.evaluate((QS) => {
    const out = []
    const h = document.querySelector('.oa h2.q'), sr = h.querySelector('.oa-sr')
    const ots = [...document.querySelectorAll('.oa-opt .ot')]
    const rightIdx = ots.findIndex((o) => o.querySelector('.okline'))
    for (const q of QS) {
      h.textContent = ''; h.append(sr, q.soru)
      // doğru seçenek "Doğrusu bu." satırlı olandır; en uzun seçeneği oraya koy (en kötü durum)
      const order = [...q.opts].sort((a, b) => b.length - a.length)
      ots.forEach((o, i) => { const line = o.querySelector('.okline'); o.textContent = order[i === rightIdx ? 0 : (i < rightIdx ? i + 1 : i)]; if (line) o.append(line) })
      const over = document.scrollingElement.scrollHeight - innerHeight
      const lastOpt = document.querySelectorAll('.oa-opt')[3].getBoundingClientRect().bottom
      const dockTop = document.querySelector('.oa-dock .btn').getBoundingClientRect().top
      if (lastOpt > dockTop - 4) out.push({ id: q.id, over, gap: Math.round(dockTop - lastOpt), soru: q.soru.length })
    }
    return out
  }, QS)
  console.log(w, 'sığmayan:', res.length, JSON.stringify(res.slice(0, 12)))
  await page.close()
}
await b.close()
