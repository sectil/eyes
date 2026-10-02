// Kullanım: node render_dalga.mjs jobs.json çıkış_klasörü  (sunucu yok: Playwright route ile work/ klasöründen verilir)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
const W = path.dirname(new URL(import.meta.url).pathname)
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const out = process.argv[3]
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage()
p.on('pageerror', (e) => console.log('HATA', e.message))
p.on('console', (m) => console.log('konsol', m.text()))
const types = { '.html': 'text/html', '.js': 'text/javascript' }
await p.route('http://dalga.local/**', (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '')
  const f = path.join(W, rel)
  if (!f.startsWith(W) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: 'yok' })
  route.fulfill({ status: 200, contentType: types[path.extname(f)] ?? 'application/octet-stream', body: fs.readFileSync(f) })
})
await p.goto('http://dalga.local/render.html')
await p.waitForFunction(() => window.ready === true, null, { timeout: 30000 })
for (const job of jobs) {
  const t0 = Date.now()
  const r = await p.evaluate((o) => window.renderSeg(o), job)
  const CH = 1 << 20
  for (const c of [0, 1]) {
    const fd = fs.openSync(path.join(out, `${job.name}.ch${c}.f32`), 'w')
    for (let a = 0; a < r.length; a += CH) {
      const s = await p.evaluate(([c, a, e]) => window.getChunk(c, a, e), [c, a, Math.min(r.length, a + CH)])
      fs.writeSync(fd, Buffer.from(s, 'base64'))
    }
    fs.closeSync(fd)
  }
  fs.writeFileSync(path.join(out, `${job.name}.meta.json`), JSON.stringify({ job, sampleRate: r.sampleRate, length: r.length, outStartSample: r.outStartSample, events: r.log }))
  console.log(job.name, 'örnek', r.length, 'olay', r.log.length, 'sn', ((Date.now() - t0) / 1000).toFixed(1))
}
await b.close()
