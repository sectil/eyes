// F3 çekimi (kapı 3. tur yöntemi): her genişlik × tema için (1) 12 durağan görüntü, (2) tam akışın videosu
// (recordVideo), (3) her durum için 3 kareli dizi: geçiş öncesi, ortası, sonrası. Geçişler CSS animasyonu: kareler
// document.getAnimations() duraklatılıp currentTime ayarlanarak alınır; zamanlayıcılar Playwright saatiyle.
// node cek.mjs <ekran> <kayit>
import { createRequire } from 'module'
import { mkdirSync, renameSync, readdirSync, writeFileSync } from 'node:fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')
const D = new URL('.', import.meta.url).pathname
const PORT = Number(process.env.PORT ?? 4377)
const OUT = (process.argv[2] ?? D + '../ekran') + '/'
const KAY = (process.argv[3] ?? D + '../kayit') + '/'
const VID = KAY + 'tmp/'
mkdirSync(OUT, { recursive: true }); mkdirSync(VID, { recursive: true })
const T0 = new Date('2026-10-02T10:00:00+03:00').getTime()
const SIZES = [[390, 844], [320, 568]]
const THEMES = [['light', 'acik'], ['dark', 'koyu']]
const only = process.env.ONLY ?? ''
const b = await chromium.launch()
const errs = []
const kutular = {} // 4. tur: sahne kutusu (.sw-frame) boundingBox, durum durum
const olcum = {} // 5. tur: kenar (20 px), başlık–kart boşluğu, cam ölçüm kırpımları
const OLC = (process.env.OLC ?? D + '../olcum') + '/'
mkdirSync(OLC, { recursive: true })
for (const [w, h] of SIZES) for (const [scheme, t] of THEMES) {
  if (only && !`${w}-${t}`.includes(only)) continue
  for (const s of ['ilk', 'sonraki']) {
    const video = s === 'sonraki' ? { dir: VID, size: { width: w, height: h } } : undefined
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, timezoneId: 'Europe/Istanbul', locale: 'tr-TR', recordVideo: video })
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errs.push(`${w}-${t}-${s}: ${e.message}`))
    p.on('console', (m) => m.type() === 'error' && errs.push(`${w}-${t}-${s}: ${m.text().slice(0, 200)}`))
    await p.addInitScript(() => { Math.random = () => 0.5 })
    await p.clock.install({ time: T0 })
    await p.clock.pauseAt(T0 + 1000)
    await p.goto(`http://127.0.0.1:${PORT}/@fs${D}sw.html?s=${s}`)
    await p.waitForSelector('.sw', { timeout: 60000 })
    await p.evaluate(() => document.fonts.ready)
    const tick = async (ms) => { for (let k = 0; k < ms; k += 100) { await p.clock.runFor(Math.min(100, ms - k)); await p.waitForTimeout(8) } await p.waitForTimeout(60) }
    const shot = async (name) => { await tick(50); await p.screenshot({ path: `${OUT}${name}-${w}-${t}.png` }) }
    const kare = (name, i) => p.screenshot({ path: `${KAY}${name}-${w}-${t}-${i}.png` })
    // süreli geçişleri bitir (CSS animasyonları gerçek saatle akar; Playwright saati onları ilerletmez)
    const settle = () => p.evaluate(() => { for (const a of document.getAnimations()) { const e = a.effect?.getComputedTiming?.().endTime; if (Number.isFinite(e)) a.finish() } })
    // içerik kenarı: main içindeki görünür öğelerin (svg içi hariç) en sol ve en sağ kenarı
    const kenar = async (name) => {
      const r = await p.evaluate(() => {
        const m = document.querySelector('main')
        let x0 = 1e9, x1 = -1e9
        for (const el of m.querySelectorAll('*')) {
          if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue
          const b = el.getBoundingClientRect()
          const cs = getComputedStyle(el)
          if (b.width < 1 || b.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') continue
          if (el.closest('.sw-scn, .sw-mcard, .sw-frame, .sw-strip, .sw-tray, .sw-intro-scene') && !el.matches('.sw-scn, .sw-mcard, .sw-frame, .sw-strip, .sw-tray, .sw-intro-scene')) continue
          x0 = Math.min(x0, b.left); x1 = Math.max(x1, b.right)
        }
        return { sol: +x0.toFixed(1), sag: +(innerWidth - x1).toFixed(1) }
      })
      ;(olcum[`${w}-${t}`] ??= {})[name] = r
    }
    const kart = async (name) => { const r = await p.locator('.sw-mcard').boundingBox(); ((olcum[`${w}-${t}`] ??= {}).kart ??= {})[name] = r && [r.x, r.y, r.width, r.height].map((n) => +n.toFixed(2)).join(',') }
    const kutu = async (name) => { const r = await p.locator('.sw-frame').boundingBox(); (kutular[`${w}-${t}`] ??= {})[name] = r && { x: r.x, y: r.y, w: r.width, h: r.height } }
    // sel verilirse yalnız o öğenin geçişi (ör. göz kırpması, halka dalgası); öbürleri olduğu gibi kalır
    const pauseAt = (ms, sel = null) => p.evaluate(([ms, sel]) => { for (const a of document.getAnimations()) { if (sel && !a.effect?.target?.matches?.(sel)) continue; a.pause(); a.currentTime = ms } }, [ms, sel])
    // bitmiş geçiş baştan oynamasın: süresi dolan animasyon bitirilir, sonsuz olanlar (yürüyüş) sürer
    const playAll = () => p.evaluate(() => { for (const a of document.getAnimations()) { const end = a.effect?.getComputedTiming?.().endTime; if (Number.isFinite(end) && a.currentTime >= end) a.finish(); else a.play() } })
    // giriş geçişi (.sw-in 320 ms) üç kare: 0, 160, 320 ms
    const enter = async (name) => {
      await p.waitForTimeout(30)
      await pauseAt(0); await kare(name, 1)
      await pauseAt(160); await kare(name, 2)
      await pauseAt(320); await kare(name, 3)
      await playAll()
    }
    const tickUntil = async (sel, max = 60000) => { for (let k = 0; k < max; k += 100) { await p.clock.runFor(100); await p.waitForTimeout(8); if (await p.$(sel)) return } }
    if (s === 'ilk') {
      await enter('01-gorev-ilk')
      await shot('01-gorev-ilk')
      await ctx.close(); continue
    }
    await enter('02-gorev-sonraki')
    await shot('02-gorev-sonraki')
    // 03 yürüyüş: başı, ortası, sonu
    await p.click('.sw .btn')
    await tick(1000); await kare('03-yuruyus', 1)
    await tick(11000)
    await shot('03-yuruyus')
    await tick(8000); await kare('03-yuruyus', 2)
    await tick(17500); await kare('03-yuruyus', 3)
    await tickUntil('.sw-keys')
    await enter('04-sayi')
    await tick(200)
    await shot('04-once')
    await kenar('04-once')
    await p.click('.sw-key >> nth=1')
    await tick(1200)
    await settle()
    await shot('04-sayi')
    await kenar('04-sonra')
    await p.click('.sw-fbk.on .btn')
    await enter('05-degisti-1')
    await kutu('05-3')
    await kenar('05')
    await tick(500)
    await shot('05-degisti-1')
    // 05 → 06 göz kırpması: önce, kararmanın ortası, sonra
    await tick(2300); await kare('06-goz-kirpma', 1)
    for (let k = 0; k < 40 && !(await p.$('.sw-lid.on')); k++) { await p.clock.runFor(25); await p.waitForTimeout(5) }
    await pauseAt(100, '.sw-lid'); await kare('06-goz-kirpma', 2); await playAll()
    await tick(600); await kare('06-goz-kirpma', 3); await kutu('06-3')
    await shot('06-degisti-2')
    let n = await p.evaluate(() => window.__sw.plan.startN)
    const tapHit = async (i, n) => {
      const pt = await p.evaluate(([i, n]) => {
        const { plan, makeFrame } = window.__sw
        const f = makeFrame(plan.street, plan.frames[i], n)
        const hh = f.kind === 'yer' ? f.hit.at(-1) : f.hit[0]
        const svg = document.querySelector('.sw-after svg')
        const q = new DOMPoint(hh.x + hh.w / 2, hh.y + hh.h / 2).matrixTransform(svg.getScreenCTM())
        return { x: q.x, y: q.y }
      }, [i, n])
      await p.mouse.click(pt.x, pt.y)
    }
    // 07 bulundu: halka dalgası üç kare
    await tapHit(0, n)
    await p.waitForTimeout(40)
    await pauseAt(0, '.wave'); await kare('07-halka', 1)
    await pauseAt(450, '.wave'); await kare('07-halka', 2)
    await pauseAt(900, '.wave'); await kare('07-halka', 3); await kutu('07-3')
    await playAll()
    await tick(300)
    await shot('07-bulundu')
    n = await p.evaluate((n) => window.__sw.nextN(n, { looks: 1, found: true }), n)
    await p.click('.sw-blk .btn:not(.sw-again)')
    await enter('08-sahne-2')
    await kutu('08-sahne-2-3')
    for (let k = 0; k < 3; k++) {
      await tick(3600)
      if (k === 2) await kare('08-bulunamadi', 1)
      await p.click('.sw-again')
    }
    await p.waitForTimeout(40); await kare('08-bulunamadi', 2)
    await tick(300); await kare('08-bulunamadi', 3); await kutu('08-3')
    await shot('08-bulunamadi')
    n = await p.evaluate((n) => window.__sw.nextN(n, { looks: 3, found: false }), n)
    const frames = await p.evaluate(() => window.__sw.plan.frames.length)
    for (let i = 2; i < frames; i++) {
      await p.click('.sw-blk .btn:not(.sw-again)')
      await tick(4000)
      await tapHit(i, n)
      await tick(300)
      n = await p.evaluate((n) => window.__sw.nextN(n, { looks: 1, found: true }), n)
    }
    await p.click('.sw-blk .btn:not(.sw-again)')
    await enter('09-kacan-adim1')
    await tick(300)
    await kart('09')
    await shot('09-kacan-adim1')
    await p.click('.sw-yn button >> nth=1') // Görmedim
    await enter('10-kacan-adim2')
    await tick(300)
    await settle()
    await shot('10-kacan-adim2')
    await kenar('10')
    await kart('10')
    // başlık–kart boşluğu ve cam figür ölçümü (figür alanı: sonda katmanı; ortalama L* python ile)
    ;(olcum[`${w}-${t}`] ??= {})['10-bosluk'] = await p.evaluate(() => { const l = [...document.querySelectorAll('.sw-mh:not(.ghost) .sw-lead, .sw-mh:not(.ghost) .sw-h')].at(-1).getBoundingClientRect(); const c = document.querySelector('.sw-mcard').getBoundingClientRect(); return +(c.top - l.bottom).toFixed(1) })
    {
      const card = p.locator('.sw-mcard')
      await card.screenshot({ path: `${OLC}cam-${w}-${t}.png` })
      await p.evaluate(() => { for (const g of document.querySelectorAll('.sw-probe')) g.style.display = '' })
      await card.screenshot({ path: `${OLC}cam-${w}-${t}-maske.png` })
      await p.evaluate(() => { for (const g of document.querySelectorAll('.sw-probe')) g.style.display = 'none' })
    }
    const right = await p.evaluate(() => { const q0 = window.__sw.plan.questions[0]; return window.__sw.optionText(q0.detail, q0.id, q0.a) })
    await kare('11-s1-acilis', 1)
    await p.click(`.sw-mopt:has-text("${right}")`)
    await p.waitForTimeout(30)
    // dönüş: 0,35 sn (figür yarı yolda; başlık henüz gelmedi) ve 1,2 sn (başlık geldi)
    await pauseAt(350); await kare('11-s1-acilis', 2)
    await pauseAt(1200); await kare('11-s1-acilis', 3)
    await playAll()
    await tick(1500)
    await settle()
    await shot('11-s1')
    await kenar('11')
    await kart('11')
    await p.click('.sw-ans .btn')
    await tick(400)
    await p.click('.sw-yn button >> nth=0') // Gördüm
    await tick(600)
    await shot('10-kacan-gordum')
    await p.click('.sw-mopt >> nth=0')
    await tick(1500)
    await settle()
    await shot('11-ikinci')
    await p.click('.sw-ans .btn')
    await enter('12-sonuc')
    await tick(300)
    await settle()
    await shot('12-sonuc')
    await kenar('12')
    if (await p.$('.sw-fact')) {
      await kare('12-kart', 1)
      await p.click('.sw-fact')
      await p.waitForTimeout(30)
      await pauseAt(180, '.sw-pop'); await kare('12-kart', 2)
      await pauseAt(360, '.sw-pop'); await kare('12-kart', 3)
      await playAll()
      await tick(600)
      await settle()
      await shot('12-kart')
    }
    await tick(1500)
    const vpath = await p.video()?.path()
    await ctx.close()
    if (vpath) renameSync(vpath, `${KAY}akis-${w}-${t}.webm`)
  }
}
await b.close()
writeFileSync(KAY + 'kutu.json', JSON.stringify(kutular, null, 1))
writeFileSync(OLC + 'olcum.json', JSON.stringify(olcum, null, 1))
console.log('olcum', JSON.stringify(olcum))
for (const [k, v] of Object.entries(kutular)) {
  const vals = Object.values(v).map((r) => r && [r.x, r.y, r.w, r.h].map((n) => n.toFixed(2)).join(','))
  console.log(k, new Set(vals).size === 1 ? 'AYNI' : 'FARKLI', JSON.stringify(v))
}
console.log(errs.length ? errs.join('\n') : 'hata yok')
