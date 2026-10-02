// Y1 ekran görüntüleri: her senaryo × 390×844 ve 320×640 × açık ve koyu, yalnız ilk görünüm (sayfanın kendi açılış
// kaydırmasından sonra görünen ekran; tam sayfa değil). Sunucu cek.sh'ta (4292). Çıktı: ../shots/*.png, ../shots/INDEX.md
//   node cek.mjs [önek]   ör. node cek.mjs 2: adı "2" ile başlayanlar (5 ya da 6: nefes akışının ikisi birden)
//   node cek.mjs index    görüntü çekmeden INDEX.md'yi yeniden yazar
import { createRequire } from 'module'
import { writeFileSync, mkdirSync, readFileSync, existsSync, statSync } from 'node:fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')

const D = new URL('.', import.meta.url).pathname
const OUT = new URL('../shots/', import.meta.url).pathname
const BASE = `http://127.0.0.1:4292/@fs${D}`
const only = process.argv[2] ?? ''
mkdirSync(OUT, { recursive: true })

const T10 = '2026-09-30T10:00:00+03:00' // Çarşamba; yeni kullanıcı her gün 10.00'da açar (§3.A.9)
const T1010 = '2026-09-30T10:10:00+03:00' // 1. bölüm 10.00–10.08 arası bitti
const SIZES = [[390, 844], [320, 640]]
const THEMES = [['light', 'acik'], ['dark', 'koyu']]
const HOME = [
  ['1', 'gun1', 'g1', 'Ana sayfa · yeni kullanıcı 1. gün (yol 8 dk)'],
  ['2', 'gun2', 'g2', 'Ana sayfa · yeni kullanıcı 2. gün ("Yeni" rozetleri)'],
  ['3', 'gun9', 'g9', 'Ana sayfa · yeni kullanıcı 9. gün (tam yol)'],
  ['4', 'eski-guncelleme', 'eski', 'Ana sayfa · eski kullanıcı, güncelleme günü'],
]

let rows = []
let seeds = {}
let shotAt = new Date().toISOString() // çekimin zamanı (gerçek saat; uygulama saati Playwright'la sabit)
// node cek.mjs index : görüntü çekmeden INDEX.md'yi ../shots/_rows.json'dan yeniden yazar (notlar.md değişince)
if (only === 'index') {
  const saved = JSON.parse(readFileSync(OUT + '_rows.json', 'utf8'))
  ;({ rows, seeds } = saved)
  shotAt = saved.at ?? statSync(OUT + '_rows.json').mtime.toISOString()
  writeFileSync(OUT + 'INDEX.md', indexMd())
  console.log('INDEX yazıldı', rows.length)
  process.exit(0)
}
const b = await chromium.launch()

async function open(w, h, scheme, time, scenario, { install = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, timezoneId: 'Europe/Istanbul', locale: 'tr-TR' })
  const p = await ctx.newPage()
  if (install) await p.clock.install({ time: new Date(time) })
  else await p.clock.setFixedTime(new Date(time))
  const errs = []
  p.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`))
  p.on('console', (m) => m.type() === 'error' && errs.push(`console: ${m.text().slice(0, 200)}`))
  await p.goto(`${BASE}seed.html?s=${scenario}`)
  await p.waitForFunction(() => window.__seed, null, { timeout: 60000 })
  seeds[scenario] ??= await p.evaluate(() => window.__seed)
  await p.goto(`${BASE}app.html`)
  await p.waitForSelector('.tp, .br', { timeout: 30000 })
  return { ctx, p, errs }
}

// Açılış kaydırması (TodayPath sıradaki durağı ortalar, smooth) bitene dek bekle
async function settle(p) {
  let last = -1
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(150)
    const y = await p.evaluate(() => window.scrollY)
    if (y === last && i > 4) break
    last = y
  }
  await p.waitForTimeout(700) // kanat açılma ve rozet geçişleri
}

// İlk görünümde ne var: kaydırma, taşma, görünen "Yeni" etiketleri, görünen durak adları, sayılar
async function facts(p) {
  return p.evaluate(() => {
    const vh = window.innerHeight
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh - 0 && r.width > 0 }
    const texts = (sel) => [...document.querySelectorAll(sel)].filter(inView).map((e) => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)
    const tabbar = document.querySelector('nav.tabbar')
    const tabTop = tabbar ? tabbar.getBoundingClientRect().top : vh
    const labelOf = (tag) => tag.closest('.tp-lb')?.querySelector('.t')?.innerText.replace(/\s+/g, ' ').trim()
    const tags = [...document.querySelectorAll('.tp-lb .new')]
    const clear = tags.filter((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= tabTop }).map(labelOf)
    const under = tags.filter((e) => { const r = e.getBoundingClientRect(); return r.top < vh && r.bottom > tabTop }).map(labelOf)
    const aria = [...document.querySelectorAll('.tp-st')].map((e) => e.getAttribute('aria-label') ?? '')
    const newAll = aria.filter((a) => a.includes(', yeni,')).map((a) => a.split(',')[0])
    const newNowNoTag = aria.filter((a) => a.includes(', yeni,') && /, sırada$/.test(a)).map((a) => a.split(',')[0])
    return {
      scrollY: Math.round(window.scrollY),
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      newAll, // "Yeni" olan bütün duraklar (erişilebilirlik etiketinden)
      newInView: clear, // ilk görünümde tamamen görünen "Yeni" etiketleri
      newUnderTabbar: under, // sekme çubuğunun altında kalan "Yeni" etiketleri
      newNowNoTag, // sıradaki durak yeniyse etiketi çizilmez (Nef baloncuğu onun yerinde)
      stopsInView: [...document.querySelectorAll('.tp-st')].filter(inView).map((e) => e.getAttribute('aria-label')),
      jev: texts('.tp-jb'),
      band: texts('.tp-btag'),
      head: texts('.hh-num, .home-h h2'),
    }
  })
}

const shotName = (no, name, w, t) => `${no}-${name}-${w}-${t}.png`

for (const [no, name, scenario, title] of HOME) {
  if (only && !no.startsWith(only)) continue
  for (const [w, h] of SIZES) for (const [scheme, t] of THEMES) {
    const { ctx, p, errs } = await open(w, h, scheme, T10, scenario)
    await settle(p)
    const f = await facts(p)
    const file = shotName(no, name, w, t)
    await p.screenshot({ path: OUT + file })
    rows.push({ no, name, title, scenario, w, h, t, file, f, errs })
    console.log(file, JSON.stringify({ y: f.scrollY, ox: f.overflowX, hepsi: f.newAll, gorunen: f.newInView, alt: f.newUnderTabbar, sirada: f.newNowNoTag }), errs.length ? errs.slice(0, 3) : '')
    await ctx.close()
  }
}

// 5 ve 6: yolun Nefes durağı (9. gün, 1. bölüm bitmiş). Ana sayfadan Nefes durağına dokunulur → Nefes ekranı ("Bugünün
// ritmi", 6) → Başla → sakinlik 3 → Başla → 3 dk (Playwright saati ileri sarılır) → sonuç ekranı "2 dk daha" (5)
if (!only || '56'.includes(only)) {
  for (const [w, h] of SIZES) for (const [scheme, t] of THEMES) {
    const { ctx, p, errs } = await open(w, h, scheme, T1010, 'nefes', { install: true })
    await settle(p)
    await p.locator('button.tp-st.rest').click()
    await p.waitForSelector('.br-hero', { timeout: 15000 })
    await p.waitForTimeout(600)
    const f6 = await p.evaluate(() => ({ scrollY: Math.round(window.scrollY), overflowX: document.documentElement.scrollWidth - window.innerWidth, hero: document.querySelector('.br-hero')?.innerText.replace(/\s+/g, ' ').trim(), prog: document.querySelector('.br-prog')?.innerText.replace(/\s+/g, ' ').trim() }))
    const file6 = shotName('6', 'nefes-bugunun-ritmi', w, t)
    await p.screenshot({ path: OUT + file6 })
    rows.push({ no: '6', name: 'nefes-bugunun-ritmi', title: 'Nefes ekranı · yoldan açılınca "Bugünün ritmi" (9. gün)', scenario: 'nefes', w, h, t, file: file6, f: f6, errs: [...errs] })
    console.log(file6, JSON.stringify(f6))

    await p.locator('.br-hero button.btn', { hasText: 'Başla' }).click()
    await p.locator('.br-sheet .br-calm5 button', { hasText: '3' }).click()
    await p.locator('.br-sheet button.btn', { hasText: 'Başla' }).click()
    // Saat saniye saniye ileri sarılır; her adımdan sonra React'in çizmesi için gerçek zamanda kısa bekleme (zamanlayıcılar
    // çizimden sonra yeniden kurulur: tek büyük runFor hazırlık sayımında takılır)
    const tick = async (sec) => { for (let i = 0; i < sec; i++) { await p.clock.runFor(1000); await p.waitForTimeout(15) } }
    await tick(4) // hazırlık sayımı (3 sn)
    await p.waitForSelector('.br-stage', { timeout: 5000 })
    const run = await p.evaluate(() => document.querySelector('.br-phase')?.innerText.replace(/\s+/g, ' ').trim())
    await tick(3 * 60 + 3) // yoldaki 3 dk
    await p.waitForSelector('text=Tamamlandı', { timeout: 15000 })
    await p.waitForTimeout(500)
    const f5 = await p.evaluate(() => ({ scrollY: Math.round(window.scrollY), overflowX: document.documentElement.scrollWidth - window.innerWidth, text: document.querySelector('main')?.innerText.replace(/\s+/g, ' ').trim() }))
    f5.run = run
    const file5 = shotName('5', 'nefes-2dk-daha', w, t)
    await p.screenshot({ path: OUT + file5 })
    rows.push({ no: '5', name: 'nefes-2dk-daha', title: 'Nefes · yolda 3 dk bitince "2 dk daha" (9. gün)', scenario: 'nefes', w, h, t, file: file5, f: f5, errs: [...errs] })
    console.log(file5, JSON.stringify(f5), errs.slice(0, 3))
    await ctx.close()
  }
}
await b.close()

writeFileSync(OUT + '_rows.json', JSON.stringify({ at: shotAt, rows, seeds }, null, 1))
if (!only) writeFileSync(OUT + 'INDEX.md', indexMd())
console.log('bitti', rows.length)

function indexMd() {
  const SCN = { g1: 'Yeni kullanıcı, 1. gün: kurulum bugün 09.50, kayıt yok.', g2: 'Yeni kullanıcı, 2. gün: 1. gün 10.00\'da yolun bütün durakları.', g9: 'Yeni kullanıcı, 9. gün: 1.–8. gün her gün 10.00\'da yolun bütün durakları.', eski: 'Y1 öncesinden 70 günlük kullanıcı (yol ilerlemesiz, bugünkü kurallarla; %7 atlanan gün, durak başına %6 atlama; yoga son 21 günde yolun adayı ama yayımlı kısa ders olmadığı için hiç gelmedi; Bugünün görevi hiç denenmemiş). Güncelleme günü: hiçbir kayıtta stage yok.', nefes: '9. gün geçmişi + bugün 1. bölüm 10.00–10.08 arasında bitti; saat 10.10.' }
  const groups = [...new Set(rows.map((r) => r.no))].sort()
  const L = []
  L.push('# Y1 · ilk görünüm ekran görüntüleri', '')
  L.push(`Çekim: ${shotAt.slice(0, 16).replace('T', ' ')} UTC · Chromium (Playwright) · DPR 2 · Europe/Istanbul · tr-TR. Uygulama saati 2026-09-30 Çarşamba 10.00 (5 ve 6: 10.10).`, '')
  L.push('**Ne çizildi.** Uygulamanın kendi girişi (`src/main.jsx`, `App`), `localStorage`\'daki `gozolcum:v1` kaydıyla (store sürümü 1, `lib/storage.js`). Kayıt geçmişi `duzenek/seed.js`\'te uygulamanın gerçek yol koduyla gün gün kuruldu (`buildPath`, `progressionCtx`, manifestler): kişi her gün yolu açıp sıradaki bütün durakları yapar, her durağın kaydı modülün yazdığı biçimde (stage, stepIds, variant, mix) depoya girer. Ekran görüntüsü **yalnız ilk görünüm**: sayfa açıldıktan ve kendi açılış kaydırması bittikten sonra ekranda görünen kısım (tam sayfa değil). Ana sayfa açılışta sıradaki durağı ortalamak için kendiliğinden kayar; kaydırma tabloda.', '')
  L.push('**Kip.** Uygulama web kipinde (abonelik, alarm, Sağlık, bildirim yok). Yalnız `modules/yoga/manifest.js`\'in `isIOSApp`\'i düzenekte `true` (`duzenek/vite.config.mjs`, `Y1_YOGA=0` ile kapanır): yoldaki yoga durağı iPhone\'daki gibi hesaplanır. Düzenek depoda hiçbir dosyayı değiştirmez; görüntüler deponun o anki kodunu çizer (5 saniye turu 2 değişiklikleri: notlar.md).', '')
  L.push('**Yeniden çekim.** `bash ' + D + 'cek.sh` (hepsi) · `bash ' + D + 'cek.sh 2` (adı "2" ile başlayanlar; INDEX yazılmaz). Sunucu /home/user/eyes/app içinden 4292\'de `--strictPort` ile açılır, iş bitince PID ile kapanır.', '')
  L.push('| No | Ekran | 390 açık | 390 koyu | 320 açık | 320 koyu | İlk görünüm (390 / 320) |', '|---|---|---|---|---|---|---|')
  for (const no of groups) {
    const rs = rows.filter((r) => r.no === no)
    const cell = (w, t) => { const r = rs.find((x) => x.w === w && x.t === t); return r ? `[${r.file}](${r.file})` : '—' }
    const view = (w) => {
      const r = rs.find((x) => x.w === w && x.t === 'acik')
      if (!r) return ''
      const f = r.f
      if (f.newAll) return `kaydırma ${f.scrollY} px; "Yeni" görünen: ${f.newInView.length ? f.newInView.join(', ') : 'yok'}${f.newUnderTabbar.length ? `; sekme çubuğu altında: ${f.newUnderTabbar.join(', ')}` : ''}${f.newNowNoTag.length ? `; sırada ve yeni, etiketsiz: ${f.newNowNoTag.join(', ')}` : ''}`
      return `kaydırma ${f.scrollY} px`
    }
    L.push(`| ${no} | ${rs[0].title} | ${cell(390, 'acik')} | ${cell(390, 'koyu')} | ${cell(320, 'acik')} | ${cell(320, 'koyu')} | 390: ${view(390)} · 320: ${view(320)} |`)
  }
  L.push('', '## Senaryolar (Ana sayfanın kurduğu yol, seed.js özeti)', '')
  for (const [k, v] of Object.entries(seeds)) {
    L.push(`**${k}** · ${SCN[k] ?? ''}`, '')
    L.push(`- Kayıt: ${v.records.tests} test, ${v.records.sessions} oturum, ${v.records.days} gün · pathDay ${v.pathDay} · güncelleme günü: ${v.updateDay ? 'evet' : 'hayır'} · D/Dstage: ${Object.entries(v.D).map(([m, x]) => `${m} ${x}`).join(', ')}`)
    L.push(`- Yol ${v.total} dk (kalan ${v.minutesLeft}): ${v.stops.join(' → ')}`)
    L.push(`- "Yeni": ${v.newKeys.length ? v.newKeys.join(', ') : 'yok'} · Nefes: ${v.breath ? `${v.breath.minutes} dk, katman ${v.breath.tier}${v.breath.mix ? `, Bugünün ritmi ${v.breath.mix}` : ''}${v.breath.more ? ', "2 dk daha" var' : ''}` : '—'}`, '')
  }
  const ns = rows.filter((r) => r.no === '5' || r.no === '6').find((r) => r.w === 390 && r.t === 'acik' && r.no === '5')
  if (ns?.f?.text) L.push('**5 · sonuç ekranı metni (390 açık):** ' + ns.f.text, '')
  const errs = rows.filter((r) => r.errs.length)
  L.push(`Taşma: ${rows.some((r) => r.f.overflowX > 0) ? rows.filter((r) => r.f.overflowX > 0).map((r) => r.file).join(', ') : 'yok'} · Sayfa/konsol hatası: ${errs.length ? errs.map((r) => `${r.file}: ${r.errs[0]}`).join('; ') : 'yok'}`, '')
  if (existsSync(D + 'notlar.md')) L.push(readFileSync(D + 'notlar.md', 'utf8'))
  return L.join('\n')
}
