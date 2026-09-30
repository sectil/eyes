// Kullanım: node shot.mjs <html mutlak yol> <çıktı klasörü> [hizli]
// hizli: yalnız 390 genişlik (6 görüntü); ara turlar için. Son tur tam (12 görüntü) çekilir.
// Sayfa, durumu location.hash'ten okur: #d30 (30. gün), #walk (yürürken), #d1 (1. gün).
// Çıktı: <durum>-<tema>-<genişlik>.png ; ayrıca console hataları errors.txt'ye yazılır.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
const [,, html, out, mode] = process.argv
const SIZES = mode === 'hizli' ? [[390, 844]] : [[390, 844], [320, 568]]
mkdirSync(out, { recursive: true })
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] })
const errs = []
for (const st of ['d30', 'walk', 'd1']) for (const theme of ['dark', 'light']) for (const [w, h] of SIZES) {
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(`${st}-${theme}-${w} pageerror: ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error') errs.push(`${st}-${theme}-${w} console: ${m.text()}`) })
  await p.goto('file://' + html + '#' + st)
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `${out}/${st}-${theme}-${w}.png` })
  await ctx.close()
}
writeFileSync(`${out}/errors.txt`, errs.join('\n') || 'hata yok')
await b.close()
console.log('tamam:', out, errs.length ? `${errs.length} hata (errors.txt)` : 'hata yok')
