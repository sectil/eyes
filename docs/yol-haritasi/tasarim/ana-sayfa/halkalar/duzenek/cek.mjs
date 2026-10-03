// Ana sayfa halkaları: gerçek Home ekranının çekimi ve ölçümü. node cek.mjs <çıktı klasörü>  (cek.sh başlatır)
// Ortam: TAG (dosya adı eki; ör. temel), ONLY (virgüllü senaryo adları), SIZES (virgüllü, ör. 390x844,320x568; senaryonun
// boyları arasından seçer), SCAN (virgüllü boylar; senaryonun boyları yerine: ara boy taraması), THEMES (acik,koyu), PORT,
// PW_DIR, CHROME, JOBS (aynı anda kaç sayfa; varsayılan 2).
// Her çekimde ölçülür (olcum.json, dosya adına göre birleştirilir):
//   Başla kartının (.hf .hg) altı ile sekme çubuğunun üstü arası (px, kaydırma 0) ve 12 px kuralı; yatay taşma; kesik ya da
//   iki satıra kırılan halka etiketi; her halka düğmesinin boyu (≥ 44); satırın durumu (normal / küçük / gizli / yok) ve yeri;
//   satırın sağ boşluğu (içerik kenarı − son dairenin sağı) ve ilk dairenin solunun selam ve haplarla farkı; dikey ritim
//   (hap → daire, etiket → "N. bölüm", kart → daire); disk ile zeminin rengi ve karşıtlığı; kartın modülüyle aynı halka var
//   mı (ikiz); 390'da dokunuşların açtığı rotalar ve klavye odağı (odak sekme çubuğunun üstünde mi); kart ilk çizildiği andan
//   3 sn boyunca satırın ve kartın kare kare durumu (zıplama: yazı tipi ve geç gelen haplar).
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
const { chromium } = createRequire(process.env.PW_DIR ?? '/opt/node-tools/node_modules/')('playwright')
const launch = () => chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
const OUT = process.argv[2]
const TAG = process.env.TAG ? `-${process.env.TAG}` : ''
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const ONLY_SIZES = (process.env.SIZES ?? '').split(',').filter(Boolean)
const ONLY_THEMES = (process.env.THEMES ?? '').split(',').filter(Boolean)
const JOBS = Math.max(1, Number(process.env.JOBS ?? 2))
const URL = `http://127.0.0.1:${process.env.PORT ?? 4390}/@fs${new globalThis.URL('.', import.meta.url).pathname}home.html`
const TIME = '2026-10-03T09:07:00+03:00' // Cumartesi

// Boylar ve güvenli alanlar (Chromium env() vermez). VARSAYIM: 390×844 iPhone 14 (üst 47, alt 34); 393×852 iPhone 15/16 ve
// 430×932 iPhone 15/16 Plus–Pro Max (üst 59, alt 34); 375×812 iPhone 13 mini (üst 50, alt 34); 375×667 iPhone SE 2./3. nesil
// ve 320 genişlik iPhone SE 1. nesil (üst 20, alt 0). 320×640, 320×620, 320×660, 320×602 gerçek iPhone boyu değil: kısa
// ekran sınırı (≤ 740) ve "küçük" adımın ara boyları için.
const SAFE = { '390x844': [47, 34], '393x852': [59, 34], '430x932': [59, 34], '375x812': [50, 34], '375x667': [20, 0] }
const safeOf = (w, h) => SAFE[`${w}x${h}`] ?? [20, 0]
const ALL = [[390, 844], [320, 640], [320, 568], [375, 667], [375, 812], [393, 852], [430, 932]]
const BOTH = [['light', 'acik'], ['dark', 'koyu']]
const LIGHT = [['light', 'acik']]

// [ad, sorgu, boylar, temalar, kaydırılmış hâl]
// VARSAYIM: iPhone senaryoları haplı (sahibin cihazı; en sıkışık dikey hâl)
const I = 'ios=1&chips=1'
const SCAN = (process.env.SCAN ?? '').split(',').filter(Boolean).map((x) => x.split('x').map(Number))
const SCENARIOS = [
  ['G1', `s=g1&${I}`, ALL, BOTH],
  ['G2', `s=g2&${I}`, ALL, BOTH],
  ['G2-iki', `s=g2&bugun=nefes,dalga&${I}`, [...ALL, [320, 620]], BOTH],
  ['G2-kilit', `s=g2&kilit=1&${I}`, ALL, BOTH],
  ['G2-yoga', `s=g2&bugun=yoga&${I}`, ALL, BOTH],
  ['G2-full', `s=g2&bugun=full&${I}`, ALL, BOTH],
  ['G2-full-kilit', `s=g2&bugun=full&kilit=1&${I}`, [...ALL, [320, 620]], BOTH],
  ['G2-dort', `s=g2&bugun=yoga,nefes,dalga,full&${I}`, ALL, BOTH],
  ['G2-nefes', `s=g2&yol=breath&${I}`, ALL, BOTH],
  ['G2-bitti', `s=g2&yol=hepsi&${I}`, ALL, BOTH],
  ['G3-yoga', `s=g3&yol=yoga&${I}`, ALL, BOTH],
  ['G7', `s=g7&${I}`, [...ALL, [320, 660]], BOTH],
  // "Küçük" adım rozetlerle (tik ve kilit): ara boy taramasında 320×601–602'de çıkıyor (SCAN ile bulundu)
  ['G7-kilit-rozet', `s=g7&bugun=full,dalga&kilit=1&${I}`, [[390, 844], [320, 602]], BOTH],
  ['G9', `s=g9&${I}`, ALL, BOTH, true],
  ['W2', 's=g2&ios=0&chips=0', ALL, BOTH],
  ['W2-bitti', 's=g2&yol=hepsi&ios=0&chips=0', ALL, BOTH],
  ['G2-gec', `s=g2&gec=1&${I}`, ALL, LIGHT],
  ['G7-gec', `s=g7&gec=1&${I}`, ALL, LIGHT],
  ['G2-ruzgar', `s=g2&ruzgar=1&${I}`, [[390, 844], [320, 640]], BOTH],
  ['G2-buyuk', `s=g2&yazi=130&${I}`, [[390, 844], [375, 667], [320, 640]], BOTH],
  ['W2-buyuk', 's=g2&yazi=130&ios=0&chips=0', [[390, 844], [320, 568]], BOTH],
].map(([n, q, sz, th, alt]) => [n, q, SCAN.length ? SCAN : sz, th, alt]).filter(([n]) => !ONLY.length || ONLY.includes(n))

const safeCss = (top, bottom) => [
  `.screen{padding-top:${20 + top}px!important}`,
  `.screen.has-tabbar{padding-bottom:${104 + bottom}px!important}`,
  `.tabbar{padding-bottom:${8 + bottom}px!important}`,
  `.hf:not(.wk1){min-height:calc(100svh - ${20 + top}px)!important;padding-bottom:calc(var(--tabbar-h) + ${12 + bottom}px)!important}`,
  `html:has(.hk){scroll-padding-bottom:${82 + bottom}px!important}`,
].join('')

// Sayfa içinde: ölçüm
const measure = (page) => page.evaluate(() => {
  const r0 = (r) => (r ? { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: +r.left.toFixed(1), right: +r.right.toFixed(1) } : null)
  // Yazının mürekkep sınırı (tek satır): satır kutusu + tuvalde aynı yazı tipiyle ölçü (taban çizgisine göre)
  const cv = document.createElement('canvas').getContext('2d')
  const ink = (el) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const m = cv.measureText(el.textContent.trim())
    const r = el.getBoundingClientRect()
    const lh = parseFloat(cs.lineHeight) || r.height
    const base = r.top + (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent
    // Büyük harf yüksekliği (H) ve x yüksekliği: "görsel üst" büyük harfin üstü
    const H = cv.measureText('H').actualBoundingBoxAscent
    return { top: base - m.actualBoundingBoxAscent, bottom: base + m.actualBoundingBoxDescent, base, capTop: base - H }
  }
  const rgb = (s) => {
    const m = String(s).match(/[\d.]+/g)?.map(Number) ?? []
    if (/^color\(srgb/.test(s)) return m.slice(0, 3).map((v) => Math.round(v * 255))
    return m.slice(0, 3)
  }
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2) }
  const tab = document.querySelector('.tabbar')?.getBoundingClientRect()
  const scene = document.querySelector('section.hf')
  const cardEl = scene?.querySelector('.hg')
  const card = cardEl?.getBoundingClientRect()
  const hk = document.querySelector('.hk')
  const fit = hk?.getAttribute('data-fit') ?? ''
  const shown = Boolean(hk) && getComputedStyle(hk).display !== 'none'
  const state = !hk ? 'yok' : !shown ? 'gizli' : fit === 'sm' ? 'küçük' : 'normal'
  const where = !hk ? null : hk.closest('section.hf') ? 'sahne (Başla kartının üstü)' : hk.closest('.lp-box') ? 'yolun başı' : '?'
  const lineCount = (el) => {
    const rg = document.createRange()
    rg.selectNodeContents(el)
    return new Set([...rg.getClientRects()].filter((r) => r.width > 0.5).map((r) => Math.round(r.top))).size
  }
  const bg = rgb(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().replace(/^#(..)(..)(..)$/, (_, a, b, c) => `rgb(${parseInt(a, 16)},${parseInt(b, 16)},${parseInt(c, 16)})`))
  const btns = shown ? [...hk.querySelectorAll('.hk-b')] : []
  const rings = btns.map((b, i) => {
    const r = b.getBoundingClientRect()
    const o = b.querySelector('.hk-o').getBoundingClientRect()
    const d = b.querySelector('.hk-d')
    const svg = d.querySelector('svg')?.getBoundingClientRect()
    const l = b.querySelector('.hk-l')
    const lr = l.getBoundingClientRect()
    const next = btns[i + 1]?.querySelector('.hk-l')?.getBoundingClientRect()
    const fs = parseFloat(getComputedStyle(l).fontSize)
    const disc = rgb(getComputedStyle(d).backgroundColor)
    const badge = b.querySelector('.hk-m')
    return {
      anahtar: b.classList[1],
      ad: b.getAttribute('aria-label'),
      etiket: l.textContent,
      dugme: `${Math.round(r.width)}×${Math.round(r.height)}`,
      dokunma44: r.width >= 44 && r.height >= 44,
      cap: Math.round(o.width),
      daireSol: +o.left.toFixed(1),
      daireSag: +o.right.toFixed(1),
      cizimPx: svg ? Math.round(svg.width) : null,
      etiketPx: +fs.toFixed(2),
      etiketAgirlik: getComputedStyle(l).fontWeight,
      kesik: l.scrollWidth > l.clientWidth + 0.5 || lr.right > innerWidth || lr.left < 0 || lr.right > r.right + 0.5 || lr.left < r.left - 0.5,
      satir: lineCount(l),
      ustuste: Boolean(next && lr.right > next.left - 2),
      durum: b.classList.contains('locked') ? (b.classList.contains('done') ? 'yapıldı+kilitli' : 'kilitli') : b.classList.contains('done') ? 'yapıldı' : 'yapılmadı',
      rozet: badge ? (badge.classList.contains('lk') ? 'kilit' : 'tik') : null,
      disk: `rgb(${disc.join(',')})`,
      diskZeminKarsitligi: ratio(disc, bg),
      cizimRengi: getComputedStyle(d).color,
    }
  })
  const tabTop = tab ? Math.round(tab.top) : innerHeight
  const cardBottom = card ? Math.round(card.bottom + scrollY) : null
  const hkR = shown ? hk.getBoundingClientRect() : null
  const firstO = rings[0]
  const lastO = rings.at(-1)
  const sceneR = scene?.getBoundingClientRect()
  const sceneCS = scene ? getComputedStyle(scene) : null
  const contentL = sceneR ? sceneR.left + parseFloat(sceneCS.paddingLeft) : null
  const contentR = sceneR ? sceneR.right - parseFloat(sceneCS.paddingRight) : null
  const h1 = document.querySelector('.home-head h1')?.getBoundingClientRect()
  const chip = document.querySelector('.hh-chips > *')?.getBoundingClientRect()
  const chipsRow = document.querySelector('.hh-chips')
  const chipsR = chipsRow && chipsRow.children.length ? chipsRow.getBoundingClientRect() : null
  const csH = document.querySelector('.cs-h')
  const pill = document.querySelector('.lp-day-h.now') ?? document.querySelector('.lp-day-h')
  const labels = shown ? [...hk.querySelectorAll('.hk-l')].map(ink) : []
  const lblBase = labels.length ? Math.max(...labels.map((x) => x.base)) : null
  const lblInk = labels.length ? Math.max(...labels.map((x) => x.bottom)) : null
  const oTop = shown && btns[0] ? btns[0].querySelector('.hk-o').getBoundingClientRect().top : null
  const csInk = csH && hkR ? ink(csH) : null
  const ritim = !hkR ? null : {
    hapDaire: chipsR ? +(oTop - chipsR.bottom).toFixed(1) : null,
    etiketTabaniBolum: csInk ? +(csInk.capTop - lblBase).toFixed(1) : pill ? +(pill.getBoundingClientRect().top - lblBase).toFixed(1) : null,
    etiketAltiBolum: csInk ? +(csInk.top - lblInk).toFixed(1) : pill ? +(pill.getBoundingClientRect().top - lblInk).toFixed(1) : null,
    kartDaire: where === 'yolun başı' && card ? +(oTop - card.bottom).toFixed(1) : null,
  }
  // 8. günden sonra: Başla kartının altı → "N. bölüm" hapının üstü (halkalı ve halkasız çekimde aynı ölçü)
  const pillTop = !scene?.classList.contains('wk1') && pill ? pill.getBoundingClientRect().top : null
  // Kartın modülü (büyük yazı) ile aynı ada sahip halka var mı
  const cardTitle = cardEl?.querySelector('.t b')?.textContent?.trim() ?? null
  const ikiz = rings.filter((x) => cardTitle && cardTitle.split(' · ')[0] === x.etiket).map((x) => x.etiket)
  const cardText = cardEl ? cardEl.textContent.replace(/\s+/g, ' ').trim() : null
  return {
    ilk7: Boolean(scene?.classList.contains('wk1')),
    kartAltiSekmeArasi: cardBottom == null ? null : tabTop - cardBottom,
    kartKaydirmadanGorunur: cardBottom == null ? null : cardBottom <= tabTop,
    kart12Kurali: cardBottom == null ? null : tabTop - cardBottom >= 12,
    sekmeUstu: tabTop,
    yatayTasma: Math.max(0, document.scrollingElement.scrollWidth - innerWidth),
    satir: state,
    yer: where,
    satirKutusu: r0(hkR),
    halkalar: rings.map((x) => x.anahtar),
    halkalarIlkGorunumde: hkR ? Math.round(hkR.bottom + scrollY) <= tabTop : null,
    sagBosluk: lastO && contentR != null ? +(contentR - lastO.daireSag).toFixed(1) : null,
    solFark: firstO && h1 ? { selam: +(firstO.daireSol - h1.left).toFixed(1), hap: chip ? +(firstO.daireSol - chip.left).toFixed(1) : null, icerik: +(firstO.daireSol - contentL).toFixed(1) } : null,
    ritim,
    kartHap: pillTop != null && card ? +(pillTop - card.bottom).toFixed(1) : null,
    halka: rings,
    zemin: `rgb(${bg.join(',')})`,
    kusur: [
      ...rings.filter((x) => x.kesik).map((x) => `kesik etiket: ${x.etiket}`),
      ...rings.filter((x) => x.satir > 1).map((x) => `iki satır: ${x.etiket}`),
      ...rings.filter((x) => !x.dokunma44).map((x) => `küçük dokunma alanı: ${x.etiket} ${x.dugme}`),
      ...rings.filter((x) => x.ustuste).map((x) => `etiketler bitişik: ${x.etiket}`),
      ...rings.filter((x) => x.etiketPx < 12).map((x) => `etiket < 0.75rem: ${x.etiket} ${x.etiketPx}px`),
      ...ikiz.map((x) => `kartla ikiz: ${x}`),
    ],
    ikiz,
    cumle: document.querySelector('.hl-t')?.textContent ?? null,
    kart: cardText,
    kartBaslik: cardTitle,
  }
})

const file = `${OUT}/olcum.json`
const all = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
mkdirSync(OUT, { recursive: true })
const jobs = []
for (const [name, query, sizes, themes, alt] of SCENARIOS) {
  for (const [w, h] of sizes) {
    if (ONLY_SIZES.length && !ONLY_SIZES.includes(`${w}x${h}`)) continue
    for (const [scheme, theme] of themes) {
      if (ONLY_THEMES.length && !ONLY_THEMES.includes(theme)) continue
      jobs.push({ name, query, w, h, scheme, theme, alt })
    }
  }
}

const b = await launch()
let fails = 0
async function shoot({ name, query, w, h, scheme, theme, alt }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, timezoneId: 'Europe/Istanbul', locale: 'tr-TR' })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errs.push(`console: ${m.text().slice(0, 200)}`))
  await page.clock.setFixedTime(new Date(TIME))
  const [top, bottom] = safeOf(w, h)
  await page.addInitScript((c) => {
    const put = () => { const st = document.createElement('style'); st.textContent = c; (document.head ?? document.documentElement).appendChild(st) }
    if (document.documentElement) put()
    else document.addEventListener('readystatechange', put, { once: true })
    // Kare kare iz: kart ilk çizildiği andan 3 sn boyunca satırın durumu, satırın boyu ve kartın yerleşimdeki yeri (offsetTop;
    // açılış animasyonunun dönüşümünden etkilenmez) ve yazı tiplerinin durumu; yalnız değişince yazılır
    window.__frames = []
    let t0 = null
    const yOf = (el) => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y }
    const tick = () => {
      const hk = document.querySelector('.hk')
      const hg = document.querySelector('section.hf .hg')
      if (hg && t0 == null) t0 = performance.now()
      if (hg) {
        const st = !hk ? 'yok' : getComputedStyle(hk).display === 'none' ? 'gizli' : hk.getAttribute('data-fit') === 'sm' ? 'küçük' : 'normal'
        const f = { ms: Math.round(performance.now() - t0), satir: st, satirBoy: hk ? hk.offsetHeight : null, kartY: yOf(hg), yazi: document.fonts.status, haplar: document.querySelector('.hh-chips')?.children.length ?? 0 }
        const last = window.__frames.at(-1)
        if (!last || last.satir !== f.satir || last.satirBoy !== f.satirBoy || last.kartY !== f.kartY || last.yazi !== f.yazi || last.haplar !== f.haplar) window.__frames.push(f)
      }
      if (t0 == null || performance.now() - t0 < 3000) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, safeCss(top, bottom))
  await page.goto(`${URL}?${query}&theme=${scheme}`)
  await page.waitForSelector('section.hf .hg', { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(3100) // Home settle(): 400 ve 1200 ms'de yeniden ölçer; gec=1'de haplar 700 ms'de; kare izi 3 sn
  const base = `${name}-${w}x${h}-${theme}${TAG}`
  const m = await measure(page)
  const seed = await page.evaluate(() => window.__seed)
  m.senaryo = { ad: name, sorgu: query, gun: seed.dayN, ios: seed.ios, haplar: seed.chips, bugun: seed.bugun, kilit: seed.kilit, yol: seed.yol, gec: seed.gec, ruzgar: seed.ruzgar, yazi: seed.yazi, kayit: seed.records, gunler: seed.checks.map((c) => `${c.day}: ${c.allDone ? 'yol bitti' : `bitmedi (${c.left.join(', ')})`}`) }
  m.kareler = await page.evaluate(() => window.__frames)
  // Zıplama: ilk kareden sonra satırın durumu ya da kartın yeri değişti mi (yazı tipi yüklenince ve haplar gelince)
  m.ziplama = m.kareler.slice(1).filter((f, i) => f.satir !== m.kareler[i].satir || Math.abs(f.kartY - m.kareler[i].kartY) >= 2).map((f) => `${f.ms} ms: satır ${f.satir}, kart ${f.kartY} (haplar ${f.haplar}, yazı ${f.yazi})`)
  m.hatalar = errs
  await page.screenshot({ path: `${OUT}/${base}.png` })
  all[`${base}.png`] = m
  const bad = [...m.kusur, ...(m.yatayTasma ? [`yatay taşma ${m.yatayTasma}px`] : []), ...(m.ilk7 && m.kart12Kurali === false ? ['Başla kartı sekme çubuğuna 12 px’ten yakın'] : []), ...errs]
  if (bad.length) fails++
  const lines = [`${base}: satır ${m.satir}${m.yer ? ` (${m.yer})` : ''}${m.halkalar.length ? ` [${m.halkalar.join(' ')}]` : ''} · kart-sekme ${m.kartAltiSekmeArasi}px${m.sagBosluk != null ? ` · sağ ${m.sagBosluk}` : ''}${m.ziplama.length ? ` · zıplama: ${m.ziplama.join('; ')}` : ''}${bad.length ? ` · ${bad.join(' | ')}` : ''}`]
  if (alt && m.satir !== 'yok') {
    // Kaydırılmış hâl: halka satırı ekranın üstünden ~120 px aşağıda
    await page.evaluate(() => { const r = document.querySelector('.hk')?.getBoundingClientRect(); if (r) window.scrollTo(0, Math.max(0, r.top + scrollY - 120)) })
    await page.waitForTimeout(300)
    const ma = await measure(page)
    ma.kaydirma = await page.evaluate(() => Math.round(scrollY))
    ma.hatalar = errs
    all[`${base}-alt.png`] = ma
    await page.screenshot({ path: `${OUT}/${base}-alt.png` })
    lines.push(`${base}-alt: kaydırma ${ma.kaydirma}px${ma.kusur.length ? ` · ${ma.kusur.join(' | ')}` : ''}`)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(100)
  }
  // Dokunuş (390 açık) ve klavye odağı (390, iki tema): her halka Home'un onStart'ına kendi rotasını verir; Tab ile gelen
  // odak görünür ve sekme çubuğunun üstünde
  if (w === 390 && m.satir !== 'yok' && m.satir !== 'gizli') {
    if (scheme === 'light') {
      for (const el of await page.$$('.hk-b')) await el.click()
      m.dokunus = await page.evaluate(() => window.__opened.slice())
      await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0) })
      await page.waitForTimeout(100)
    }
    await page.locator('.home-head h1').click() // sıralı odak buradan başlasın (selamın ardından haplar, sonra halkalar)
    let found = false
    for (let k = 0; k < 60; k++) {
      await page.keyboard.press('Tab')
      if (await page.evaluate(() => document.activeElement?.classList?.contains('hk-b'))) { found = true; break }
    }
    await page.waitForTimeout(250)
    m.odak = !found ? null : await page.evaluate(() => {
      const e = document.activeElement
      const cs = getComputedStyle(e)
      const r = e.getBoundingClientRect()
      const tabTop = document.querySelector('.tabbar').getBoundingClientRect().top
      return { ad: e.getAttribute('aria-label'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, focusVisible: e.matches(':focus-visible'), ust: Math.round(r.top), alt: Math.round(r.bottom), sekmeUstu: Math.round(tabTop), gorunur: r.top >= 0 && r.bottom + 4 <= tabTop, kaydirma: Math.round(scrollY) }
    })
    mkdirSync(`${OUT}/odak`, { recursive: true })
    await page.screenshot({ path: `${OUT}/odak/${base}.png` })
    lines.push(`  odak: ${m.odak ? `${m.odak.ad} · ${m.odak.outline} · ${m.odak.gorunur ? 'görünür' : 'GÖRÜNMÜYOR'} (alt ${m.odak.alt}, sekme ${m.odak.sekmeUstu}, kaydırma ${m.odak.kaydirma})` : 'bulunamadı'}`)
    if (m.odak && !m.odak.gorunur) fails++
  }
  console.log(lines.join('\n'))
  await ctx.close()
}
let next = 0
await Promise.all(Array.from({ length: JOBS }, async () => {
  while (next < jobs.length) {
    const j = jobs[next++]
    try {
      await shoot(j)
    } catch (e) {
      fails++
      console.log(`${j.name}-${j.w}x${j.h}-${j.theme}${TAG}: HATA ${e.message.split('\n')[0]}`)
    }
  }
}))
await b.close()
writeFileSync(file, JSON.stringify(all, null, 2))
console.log(`${jobs.length} çekim · olcum.json'da ${Object.keys(all).length} kayıt → ${file}${fails ? ` · ${fails} çekimde kusur` : ''}`)
process.exit(0)
