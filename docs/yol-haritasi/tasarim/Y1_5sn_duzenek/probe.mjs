// Geliştirme yoklaması: bir senaryonun seed özetini ve Ana sayfanın durumunu yazar (çekim yapmaz).
import { createRequire } from 'module'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')
const D = new URL('.', import.meta.url).pathname
const BASE = `http://127.0.0.1:4292/@fs${D}`
const [s = 'g1', w = '390', h = '844', theme = 'light'] = process.argv.slice(2)
const TIME = { nefes: '2026-09-30T10:10:00+03:00' }[s] ?? '2026-09-30T10:00:00+03:00'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, colorScheme: theme, timezoneId: 'Europe/Istanbul', locale: 'tr-TR' })
const p = await ctx.newPage()
await p.clock.setFixedTime(new Date(TIME))
const errs = []
p.on('pageerror', (e) => errs.push('pageerror ' + e.message))
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errs.push(m.type() + ' ' + m.text().slice(0, 300)))
await p.goto(`${BASE}seed.html?s=${s}`)
await p.waitForFunction(() => window.__seed, null, { timeout: 60000 })
console.log(JSON.stringify(await p.evaluate(() => window.__seed), null, 1))
await p.goto(`${BASE}app.html`)
await p.waitForTimeout(2500)
console.log('scrollY', await p.evaluate(() => window.scrollY), 'h', await p.evaluate(() => document.documentElement.scrollHeight))
console.log((await p.evaluate(() => document.body.innerText)).slice(0, 1500))
console.log('ERR', errs.slice(0, 10))
await b.close()
