// Aynı ekranın açık ve koyu hâli yan yana, tek PNG
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
const [,, out, dir, day, w = '390', extra = ''] = process.argv
const h = w === '320' ? 568 : 844
const file = 'file:///home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/maket.html'
const frame = '/tmp/claude-0/-home-user-eyes/4f4ab0c6-2099-5a58-ab01-ec36e8981c2f/scratchpad/_yan.html'
writeFileSync(frame, `<body style="margin:0;background:#888;display:flex;gap:24px">${['light', 'dark'].map((t) => `<iframe src="${file}?dir=${dir}&day=${day}&theme=${t}&still${extra}" style="width:${w}px;height:${h}px;border:0;flex:none"></iframe>`).join('')}</body>`)
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] })
const p = await b.newPage({ viewport: { width: +w * 2 + 24, height: h }, deviceScaleFactor: 2 })
await p.goto('file://' + frame)
await p.waitForTimeout(1500)
await p.screenshot({ path: out })
await b.close()
