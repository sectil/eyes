// Birkaç ekran görüntüsünü tek panoda yan yana koyar (yalnız benim bakmam için).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
import { readFileSync } from "node:fs"
const [,, out, ...imgs] = process.argv
const html = `<body style="margin:0;display:flex;gap:8px;background:#888;align-items:flex-start">${imgs.map((f) => `<img src="data:image/png;base64,${readFileSync(f).toString("base64")}" style="width:300px">`).join('')}</body>`
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const p = await b.newPage({ viewport: { width: imgs.length * 308, height: 700 } })
await p.setContent(html); await p.waitForTimeout(300)
await p.screenshot({ path: out, fullPage: true }); await b.close()
