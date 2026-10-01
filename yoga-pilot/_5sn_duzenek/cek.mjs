// Yoga ekranlarının ilk görünüm çekimi (Playwright + Chromium, /opt/pw-browsers). cek.sh çağırır; sunucu hazır olmalı.
// Akış (her genişlik × tema için temiz tarayıcı bağlamı = ilk kez açan kişi):
//   Ana sayfa (Pratikler) → Yoga kutucuğu → kütüphane → Derin Dinlenme → ayrıntı → Başla → güvenlik kartı (ilk derste;
//   PLAN.v3 §D.2) → Anladım → önce puanı → 7 · Devam → oynatıcı (Altyazı açılır, konum 167 sn'ye konur) → ders biter → sonra puanı → 4 · Devam →
//   zorlanma "Hayır" → bitiş.
// Görüntü: yalnız görünüm alanı (fullPage yok). Tek istisna (1): Pratikler Ana sayfanın aşağısında; sayfa Pratikler
// başlığına kaydırılır (App'teki gibi pencere kayar). Ötekilerde ekran nasıl açıldıysa öyle çekilir (scrollY INDEX'te).
// Ortam değişkenleri: BASE (http://127.0.0.1:4291), SAAT (ISO; varsayılan 2026-09-30T10:30:00+03:00; "gercek" = saat
// sabitlenmez), SAFE=0 (güvenli alan taklidi kapalı), SADECE="390-light" gibi (tek birleşim), CIKTI=/bir/klasör
// (görüntüler, INDEX.md ve son-calisma.json oraya; varsayılan ../shots, son-calisma.json düzenekte).
//
// Tema denetimi (2026-09-30): her çekimde <html data-theme> ve prefers-color-scheme beklenen temayla karşılaştırılır
// (uymazsa DÜZENEK HATASI, sayfa açılışında çekim durur); görüntünün gerçek parlaklığı piksellerden ölçülür ve açık
// temada koyu çıkan her ekranın nedeni işaret sınıfından yazılır (.yg-play oynatıcı: plan gereği; .yg-night, .yg-stop:
// uygulamanın kendi kararı). Neden: 3. turda "açık dosya da koyu render edilmiş" notu düzeneğe yoruldu; oysa düzenek
// temayı doğru uyguluyordu, 7 numaralı ekranı uygulama (Yoga.jsx Night, .yg-night) temadan bağımsız karanlık çiziyordu.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SHOTS = process.env.CIKTI ? path.resolve(process.env.CIKTI) : path.resolve(HERE, '../shots')
const RUN_JSON = process.env.CIKTI ? path.join(SHOTS, 'son-calisma.json') : path.join(HERE, 'son-calisma.json')
// Ortalama parlaklık (0–255, 60 px genişliğe küçültülmüş görüntü): altı koyu, üstü açık. Bugünkü çekimlerde açık ekranlar
// 170–245, koyular 14–40 (ara bölge boş); eşik ikisinin ortasında.
const DARK_BELOW = 100
// Temadan bağımsız karanlık çizilen ekranların işaret sınıfları (ilk eşleşen yazılır). plan: true = plan gereği.
const DARK_MARKS = [
  ['.yg-play', true, 'oynatıcı: plan gereği temadan bağımsız karanlık (modul.md §2 "Oynatıcı bunun istisnasıdır", G3)'],
  ['.yg-sleep', true, 'uyku sonu: oynatıcının parçası (modul.md §2.6)'],
  ['.yg-night', false, 'uygulama kararı: Yoga.jsx Night (.yg-night; sonra puanı ve zorlanma sorusu temadan bağımsız karanlık)'],
  ['.yg-stop', false, 'uygulama kararı: durdurma ekranı .yg-dark .yg-stop (temadan bağımsız karanlık)'],
  ['.yg-dark', false, 'uygulama kararı: .yg-dark (temadan bağımsız karanlık)'],
]
const BASE = process.env.BASE ?? 'http://127.0.0.1:4291'
const PAGE = `${BASE}/@fs${HERE}/yoga.html`
const SAAT = process.env.SAAT ?? '2026-09-30T10:30:00+03:00'
const SAFE_ON = process.env.SAFE !== '0'
const SIZES = [[390, 844], [320, 640]]
const THEMES = ['light', 'dark']
// iPhone güvenli alanı (capacitor.config.json contentInset: never + viewport-fit=cover → env(safe-area-inset-*) cihazınki).
// 390×844: iPhone 12–14 (üst 47, alt 34). 320×640 gerçek bir iPhone boyu değil; küçük ekran için SE benzeri üst 20, alt 0.
const SAFE = { 390: { top: 47, bottom: 34 }, 320: { top: 20, bottom: 0 } }
const PLAYER_AT = 167 // sn: 3. dakika (2:00–3:00) içinde, konuşma sürerken (C1 · "Hissetmesen de her adı içinden tekrarlayabilirsin.")

// Kodun parmak izi (kapı turu 1, 2026-09-30): değerlendirici 10:01'deki ESKİ çekimlere bakmıştı (uygulayıcı yeni çekimi
// CIKTI ile başka klasöre yazmış, ../shots eski kalmıştı). INDEX.md ve son-calisma.json artık çekimin hangi kodla
// yapıldığını yazar: yoga modülünün (testler hariç) dosyalarının sha256'sı ve en yeni dosyanın saati. Görüntüye bakan,
// bu satırı koddakiyle karşılaştırabilir (aynı komut: yoga klasöründe cat <dosyalar> | sha256sum).
const YOGA_DIR = '/home/user/eyes/app/src/modules/yoga'
function codePrint() {
  const files = fs.readdirSync(YOGA_DIR).filter((f) => /\.(jsx?|css)$/.test(f) && !/\.test\./.test(f)).sort()
  const h = crypto.createHash('sha256')
  let newest = { f: null, t: 0 }
  for (const f of files) {
    const p = path.join(YOGA_DIR, f)
    h.update(fs.readFileSync(p))
    const t = fs.statSync(p).mtimeMs
    if (t > newest.t) newest = { f, t }
  }
  return { sha256: h.digest('hex'), files: files.length, newest: newest.f, newestAt: new Date(newest.t).toISOString() }
}
const CODE = codePrint()
// Kişinin gerçek akış sırası (değerlendiriciye bu sırayla gösterilmeli)
const FLOW = ['2', '3', '4', '5', '6b', '6', '7', '7b', '7c', '8']

const SCREENS = {
  1: { ad: 'ana-pratikler', ne: 'Ana sayfa, Pratikler bölümü: Yoga kutucuğu (sayfa Pratikler başlığına kaydırıldı; alttaki sekme çubuğu sabit)' },
  2: { ad: 'kutuphane', ne: '"Yoga ve Meditasyon": Yoga kutucuğuna ilk dokunuşta açılan ekran; yayımlı tek ders varken liste değil, dersin kapağı (Derin Dinlenme)' },
  3: { ad: 'ders2-ayrinti', ne: 'Ders 2 ayrıntısı: Derin Dinlenme (Yoga Nidra), 15 dk seçili (tek yayımlı süre)' },
  4: { ad: 'guvenlik', ne: 'Güvenlik kartı "Başlamadan önce": ilk derste ayrıntıda "Başla"ya dokununca, önce puanından önce (PLAN.v3 §D.2)' },
  5: { ad: 'once-puani', ne: 'Önce puanı: "Bedenin şu an ne kadar gergin?" 1–10, seçim yapılmamış (Devam pasif)' },
  6: { ad: 'oynatici-3dk', ne: `Oynatıcı, ${Math.floor(PLAYER_AT / 60)}:${String(PLAYER_AT % 60).padStart(2, '0')} (3. dakika): Altyazı açık, nefes formu (ufuk çizgisi), denetimler görünür` },
  7: { ad: 'sonra-puani', ne: 'Sonra puanı: ders sonuna kadar çaldıktan sonra aynı soru, seçim yapılmamış' },
  8: { ad: 'bitis', ne: 'Bitiş ekranı "Ders bitti": önce 7 → sonra 4, zorlanma "Hayır"' },
  // Ek anlar (2026-09-30, 5 saniye yeniden tasarımı): oynatıcının gerçek ilk 5 saniyesi ve sonra puanında seçimden sonrası
  '6b': { ad: 'oynatici-ilk-5sn', ne: 'Oynatıcı, 0:05 (dersin gerçek ilk 5 saniyesi): Altyazı varsayılan kapalı, denetimler görünür' },
  '7b': { ad: 'sonra-secildi', ne: 'Sonra puanı, 4 seçildikten sonra ("Dersten önce: 7" satırı, Devam görünür)' },
  '7c': { ad: 'zorlanma', ne: 'Zorlanma sorusu "Ders sırasında zorlandın mı?" (sonra puanından sonra; sonra puanıyla aynı dil: şafak, dersin yolu)' },
}
const fileOf = (no, w, t) => `${no}-${SCREENS[no].ad}-${w}-${t}.png`

// Sayfa içi ölçüm: yatay taşma, görünüm alanından taşan öğeler, kırpılmış (… ile kesilen) metin, üst üste binen öğeler,
// görünüm alanının alt kenarında kesilen öğeler
function measure() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const visible = (el) => {
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') return false
    if (el.closest('details:not([open])') && !el.closest('summary') && el.tagName !== 'DETAILS') return false // kapalı kaynak kartının içi
    let o = 1
    for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity)
    if (o < 0.05) return false
    const r = el.getBoundingClientRect()
    return r.width > 1 && r.height > 1 && !el.closest('.yg-sr')
  }
  const label = (el) => {
    const t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    const c = typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : ''
    return `${el.tagName.toLowerCase()}${c ? `.${c}` : ''}${t ? ` "${t}"` : ''}`
  }
  const all = [...document.querySelectorAll('#root *')].filter(visible)
  const out = { scrollY: Math.round(window.scrollY), docH: document.documentElement.scrollHeight, vw, vh }
  out.hOverflow = document.documentElement.scrollWidth > vw + 0.5 ? document.documentElement.scrollWidth : 0
  out.offRight = all
    .filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 0.5 || r.left < -0.5 })
    .filter((el) => !el.closest('.yg-form'))
    .map(label).slice(0, 12)
  out.clipped = all
    .filter((el) => {
      const cs = getComputedStyle(el)
      const hides = cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis'
      return hides && el.children.length === 0 && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && el.tagName !== 'INPUT'
    })
    .map(label).slice(0, 12)
  const TEXT = 'h1,h2,h3,p,button,a,input,label,summary,.yg-ey,.yg-card-t,.yg-card-s,.yg-card-m,.yg-t,.yg-cap,.yg-ends span,.title,em'
  const els = [...document.querySelectorAll(TEXT)].filter(visible).filter((el) => {
    const r = el.getBoundingClientRect()
    return r.bottom > 0 && r.top < vh
  })
  const over = []
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i]
      const b = els[j]
      if (a.contains(b) || b.contains(a)) continue
      if (a.closest('.tabbar') || b.closest('.tabbar')) continue // sabit sekme çubuğu içeriğin üstünden geçer (tasarım)
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
      if (w > 2 && h > 2) over.push(`${label(a)} × ${label(b)} (${Math.round(w)}×${Math.round(h)} px)`)
    }
  }
  out.overlaps = over.slice(0, 12)
  const fixed = [...document.querySelectorAll('.tabbar')].filter(visible).map((el) => el.getBoundingClientRect().top)
  const floor = fixed.length ? Math.min(vh, ...fixed) : vh
  out.cutBottom = els
    .filter((el) => { const r = el.getBoundingClientRect(); return r.top < floor - 1 && r.bottom > floor + 1 && !el.closest('.tabbar') })
    .map(label).slice(0, 6)
  const btns = [...document.querySelectorAll('main button, main input')].filter(visible)
  out.buttonsBelow = btns.filter((el) => el.getBoundingClientRect().top >= floor).map(label).slice(0, 6)
  // Oynatıcı: altyazı, denetimler, nefes formu ve üst şerit arası
  const cap = document.querySelector('.yg-cap')
  if (cap) {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect()
    const line = document.querySelector('.yg-form line')?.getBoundingClientRect()
    const hud = r('.yg-hud')
    const ctl = r('.yg-ctl')
    const c = cap.getBoundingClientRect()
    out.player = {
      caption: cap.textContent,
      captionLines: Math.round(c.height / parseFloat(getComputedStyle(cap).lineHeight)),
      captionTop: Math.round(c.top), captionBottom: Math.round(c.bottom),
      ctlTop: ctl ? Math.round(ctl.top) : null,
      formLineY: line ? Math.round(line.top) : null,
      hudBottom: hud ? Math.round(hud.bottom) : null,
      gapFormToCaption: line ? Math.round(c.top - line.bottom) : null,
      timer: document.querySelector('.yg-t')?.textContent,
      section: document.querySelector('.yg-sec-name')?.textContent ?? null,
    }
  }
  return out
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Sayfanın o anki teması: <html data-theme> (lib/theme.js applyTheme), tarayıcının prefers-color-scheme'i ve ekrandaki
// temadan bağımsız karanlık işaret sınıfları
function themeState(marks) {
  return {
    attr: document.documentElement.getAttribute('data-theme'),
    mqDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    marks: marks.filter((s) => document.querySelector(s)),
  }
}

// PNG'nin ortalama parlaklığı (0–255; Rec. 709 ağırlıkları, sRGB değerleri üstünden): görüntü sayfada bir tuvale küçültülür
async function brightness(b64) {
  const img = new Image()
  img.src = `data:image/png;base64,${b64}`
  await img.decode()
  const W = 60
  const H = Math.max(1, Math.round((W * img.naturalHeight) / img.naturalWidth))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.drawImage(img, 0, 0, W, H)
  const d = g.getImageData(0, 0, W, H).data
  let s = 0
  for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
  return Math.round(s / (d.length / 4))
}

// Beklenen tema ile görünen tema: { seen: 'açık'|'koyu', luma, attr, mqDark, ok, plan, why }
//   ok: görünen tema beklenen; ya da açık temada koyu ama plan gereği (oynatıcı)
//   harness: düzenek hatası (tema uygulanmamış)
function judgeTheme(theme, luma, st) {
  const seen = luma < DARK_BELOW ? 'koyu' : 'açık'
  const harness = st.attr !== theme || st.mqDark !== (theme === 'dark')
  const out = { seen, luma, attr: st.attr, mqDark: st.mqDark, harness, ok: true, plan: null, why: null }
  if (harness) {
    out.ok = false
    out.why = `DÜZENEK HATASI: data-theme=${st.attr ?? 'yok'}, prefers-color-scheme dark=${st.mqDark} (beklenen ${theme})`
    return out
  }
  const want = theme === 'dark' ? 'koyu' : 'açık'
  if (seen === want) return out
  const hit = DARK_MARKS.find(([s]) => st.marks.includes(s))
  if (seen === 'koyu' && hit) {
    out.plan = hit[1]
    out.ok = hit[1]
    out.why = hit[1] ? hit[2] : `${hit[2]} · plan dışı (modul.md §2: "Her ekran açık ve koyu temada … Oynatıcı bunun istisnasıdır")`
  } else {
    out.ok = false
    out.why = seen === 'koyu' ? 'açık temada koyu, işaret sınıfı yok: incele (uygulama mı düzenek mi?)' : 'koyu temada açık: incele'
  }
  return out
}

async function run(browser, w, h, theme, log) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: devices['iPhone 13'].userAgent, colorScheme: theme, locale: 'tr-TR', timezoneId: 'Europe/Istanbul',
  })
  const page = await ctx.newPage()
  if (SAAT !== 'gercek') await page.clock.setFixedTime(new Date(SAAT))
  if (SAFE_ON) {
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { ...SAFE[w], left: 0, right: 0 } })
  }
  const key = `${w}-${theme}`
  const res = { key, console: [], errors: [], shots: {} }
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) res.console.push(`${m.type()}: ${m.text()}`.slice(0, 300)) })
  page.on('pageerror', (e) => res.errors.push(String(e?.stack ?? e).slice(0, 400)))

  // prep: yazı tipleri yüklenip düzen oturduktan sonra, çekimden hemen önce (ör. kaydırma)
  const shot = async (no, prep = null) => {
    await page.evaluate(() => document.fonts.ready)
    await sleep(450) // .fade-in 0.28 sn
    if (prep) {
      await prep()
      await sleep(150)
    }
    const f = fileOf(no, w, theme)
    const buf = await page.screenshot({ path: path.join(SHOTS, f), animations: 'disabled', caret: 'hide' })
    const st = await page.evaluate(themeState, DARK_MARKS.map(([s]) => s))
    const luma = await page.evaluate(brightness, buf.toString('base64'))
    const tema = judgeTheme(theme, luma, st)
    const sha1 = crypto.createHash('sha1').update(buf).digest('hex')
    res.shots[no] = { file: f, sha1, tema, ...(await page.evaluate(measure)) }
    log(`  ${f} · görünen ${tema.seen} (${luma})${tema.why ? ` · ${tema.why}` : ''}`)
  }
  const heading = (text) => page.locator('h1', { hasText: text }).first().waitFor({ state: 'visible', timeout: 15000 })

  await page.goto(`${PAGE}?t=${theme}`, { waitUntil: 'networkidle' })
  const ios = await page.evaluate(() => window.__ios)
  if (ios !== true) throw new Error(`isIOSApp() doğru dönmedi (${ios})`)
  res.ios = ios
  // Tema düzenekte iki yoldan verilir: tarayıcı colorScheme (prefers-color-scheme) ve main.jsx applyTheme (data-theme).
  // Biri tutmazsa çekim burada durur (yanlış temada 32 görüntü çekilmesin).
  const st0 = await page.evaluate(themeState, [])
  if (st0.attr !== theme || st0.mqDark !== (theme === 'dark')) {
    throw new Error(`Tema uygulanmadı: data-theme=${st0.attr ?? 'yok'}, prefers-color-scheme dark=${st0.mqDark} (beklenen ${theme})`)
  }
  const tile = page.locator('.prax-tile', { has: page.locator('.title', { hasText: /^Yoga$/ }) })
  await tile.waitFor({ state: 'visible', timeout: 20000 })
  // (1) Pratikler başlığına kaydır: başlık güvenli alanın 12 px altında (yazı tipleri yüklendikten sonra; yüklenirken
  // yukarıdaki kartların boyu değişir)
  await shot(1, () => page.evaluate((top) => {
    const h2 = [...document.querySelectorAll('.home-h h2')].find((x) => x.textContent.trim() === 'Pratikler')
    window.scrollTo(0, h2.closest('.home-h').getBoundingClientRect().top + window.scrollY - top - 12)
  }, SAFE_ON ? SAFE[w].top : 0))

  await tile.click()
  await heading('Yoga ve Meditasyon')
  await shot(2)
  await page.locator('.yg-card', { hasText: 'Derin Dinlenme' }).click()
  await heading('Derin Dinlenme (Yoga Nidra)')
  await shot(3)
  await page.getByRole('button', { name: 'Başla', exact: true }).click()
  await heading('Başlamadan önce')
  await shot(4)
  await page.getByRole('button', { name: 'Anladım', exact: true }).click()
  await heading('Bedenin şu an ne kadar gergin?')
  await shot(5)

  await page.locator('.yg-hz-stop[data-v="7"]').click() // ölçek tek ayarlanabilir öğe (role=slider); durağa dokunulur
  await page.getByRole('button', { name: 'Devam', exact: true }).click()
  await page.locator('.yg-play .yg-strip').waitFor({ state: 'attached', timeout: 15000 }) // çizelge yüklendi
  // (6b) dersin gerçek ilk 5 saniyesi: 0:05, altyazı varsayılan kapalı; dokunuş denetimleri gösterir
  await page.evaluate(() => window.__lesson.freeze(5))
  await page.locator('.yg-t', { hasText: '14:55' }).waitFor({ timeout: 10000 })
  await page.locator('.yg-play').click({ position: { x: 5, y: Math.round(h / 2) } })
  await shot('6b')
  await page.locator('.yg-cc').click() // Altyazı (denetimleri de 5 sn görünür tutar)
  await page.evaluate((t) => window.__lesson.freeze(t), PLAYER_AT)
  const left = PLAYER_AT >= 0 ? (() => { const x = 900 - PLAYER_AT; return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}` })() : ''
  await page.locator('.yg-t', { hasText: left }).waitFor({ timeout: 10000 })
  await page.locator('.yg-cap').filter({ hasText: /\S/ }).waitFor({ timeout: 10000 })
  await page.locator('.yg-play').click({ position: { x: 5, y: Math.round(h / 2) } }) // dokunuş: denetimler 5 sn daha
  await shot(6)

  await page.evaluate(() => window.__lesson.finish())
  await page.locator('.yg-rating.is-after').waitFor({ timeout: 15000 })
  await heading('Bedenin şu an ne kadar gergin?')
  await shot(7)
  await page.locator('.yg-hz-stop[data-v="4"]').click()
  await page.getByRole('button', { name: 'Devam', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
  await shot('7b')
  await page.getByRole('button', { name: 'Devam', exact: true }).click()
  await heading('Ders sırasında zorlandın mı?')
  await shot('7c')
  await page.getByRole('radio', { name: 'Hayır', exact: true }).click()
  await heading('Ders bitti')
  await shot(8)

  res.nativeCalls = await page.evaluate(() => {
    const c = {}
    for (const x of window.__nativeCalls) c[`${x.plugin}.${x.method}`] = (c[`${x.plugin}.${x.method}`] ?? 0) + 1
    return c
  })
  res.sessions = await page.evaluate(() => JSON.parse(localStorage.getItem('gozolcum:v1') ?? '{}').sessions ?? [])
  await ctx.close()
  return res
}

function indexMd(results) {
  const prev = fs.existsSync(path.join(SHOTS, 'INDEX.md')) ? fs.readFileSync(path.join(SHOTS, 'INDEX.md'), 'utf8') : ''
  const MARK = '<!-- elle: bu satırın altı cek.sh yeniden çekince korunur -->'
  const manual = prev.includes(MARK) ? prev.slice(prev.indexOf(MARK) + MARK.length) : '\n'
  const L = []
  L.push('# Yoga ekranları · ilk görünüm çekimleri', '')
  L.push(`Çekim: ${new Date().toISOString()} · düzenek: \`${HERE}/cek.sh\` (tek komut) · sayfa \`/@fs${HERE}/yoga.html\``)
  L.push('')
  L.push(`**Kod:** \`app/src/modules/yoga\` (testler hariç ${CODE.files} dosya) sha256 \`${CODE.sha256.slice(0, 16)}\` · en yeni dosya \`${CODE.newest}\` ${CODE.newestAt}. Görüntüler bu kodla çekildi; kod bundan sonra değiştiyse görüntüler eskidir.`)
  L.push('')
  L.push(`**Gerçek akış sırası** (değerlendiriciye bu sırayla): ${FLOW.join(' → ')}. 1 (Ana sayfa) başka iş akışının ekranı.`)
  L.push('')
  L.push('- Tarayıcı: Playwright Chromium (/opt/pw-browsers), iPhone kullanıcı ajanı, dokunmatik, `deviceScaleFactor` 2 (PNG boyu 2×).')
  L.push(`- Uygulama saati: ${SAAT === 'gercek' ? 'sabitlenmedi' : `${SAAT} (Europe/Istanbul; \`page.clock.setFixedTime\`)`}.`)
  L.push(`- Güvenli alan: ${SAFE_ON ? '390 px: üst 47, alt 34 · 320 px: üst 20, alt 0 (CDP `Emulation.setSafeAreaInsetsOverride`; iOS durum çubuğu çizilmez, yalnız boşluğu)' : 'kapalı'}.`)
  L.push('- `isIOSApp()` doğru: `window.webkit.messageHandlers.bridge` + `window.Capacitor.PluginHeaders` (Alarm, Feedback); ders oynatıcısı sahte (duzenek/iosmock.js). Ses çalmaz.')
  L.push('- Tema: `lib/theme.js applyTheme(light|dark)` + tarayıcı `colorScheme`; her çekimde ikisi de denetlenir. Oynatıcı plan gereği temadan bağımsız hep karanlık.')
  L.push('- Görünen tema her görüntünün piksellerinden ölçülür (ortalama parlaklık 0–255, eşik ' + DARK_BELOW + '); tabloda beklenen temadan farklı çıkan hücre işaretli, nedeni aşağıda "Tema denetimi"nde.')
  L.push('- Her genişlik × tema temiz tarayıcı bağlamında (ilk kez açan kişi): güvenlik kartı bu yüzden ilk "Başla"da çıkar (PLAN.v3 §D.2).')
  L.push('')
  L.push('| No | Ekran | 390 açık | 390 koyu | 320 açık | 320 koyu |')
  L.push('|---|---|---|---|---|---|')
  const want = (t) => (t === 'dark' ? 'koyu' : 'açık')
  for (const no of Object.keys(SCREENS)) {
    const cell = (w, t) => {
      const s = results.find((r) => r.key === `${w}-${t}`)?.shots[no]
      if (!s) return '—'
      const x = s.tema
      const tag = x && x.seen !== want(t) ? ` **${x.seen}** (${x.harness ? 'DÜZENEK HATASI' : x.plan ? 'plan gereği' : 'uygulama kararı'})` : ''
      return `[png](${fileOf(no, w, t)})${tag}`
    }
    L.push(`| ${no} | ${SCREENS[no].ne} | ${cell(390, 'light')} | ${cell(390, 'dark')} | ${cell(320, 'light')} | ${cell(320, 'dark')} |`)
  }
  L.push('', '## Tema denetimi', '')
  const all = results.flatMap((r) => Object.entries(r.shots).map(([no, s]) => ({ no, key: r.key, theme: r.key.split('-')[1], ...s })))
  const harnessErr = all.filter((s) => s.tema?.harness)
  L.push(harnessErr.length
    ? `- **DÜZENEK HATASI:** ${harnessErr.length} görüntüde tema uygulanmamış: ${harnessErr.map((s) => `\`${s.file}\` (${s.tema.why})`).join('; ')}`
    : `- Düzenek temayı ${all.length} görüntünün hepsinde doğru uyguladı (\`data-theme\` ve \`prefers-color-scheme\` beklenen temada).`)
  const off = all.filter((s) => s.tema && !s.tema.harness && s.tema.seen !== want(s.theme))
  if (!off.length) L.push('- Bütün açık görüntüler açık, bütün koyu görüntüler koyu çıktı.')
  const byNo = {}
  for (const s of off) (byNo[s.no] ??= []).push(s)
  for (const [no, list] of Object.entries(byNo)) {
    const why = [...new Set(list.map((s) => s.tema.why))].join(' / ')
    L.push(`- Ekran ${no} (${SCREENS[no].ad}): ${list.map((s) => `\`${s.file}\` ${s.tema.seen} (parlaklık ${s.tema.luma})`).join(', ')} → ${list.every((s) => s.tema.plan) ? why : `**${why}**`}`)
  }
  const same = []
  for (const no of Object.keys(SCREENS)) {
    for (const [w] of SIZES) {
      const a = results.find((r) => r.key === `${w}-light`)?.shots[no]
      const b = results.find((r) => r.key === `${w}-dark`)?.shots[no]
      if (a && b && a.sha1 === b.sha1) same.push(`\`${a.file}\` = \`${b.file}\``)
    }
  }
  if (same.length) L.push(`- Açık ve koyu dosyası bayt bayt aynı olanlar (temadan bağımsız ekran): ${same.join('; ')}`)
  L.push('', '## Otomatik ölçüm (her görüntü)', '')
  L.push('Sütunlar: kaydırma (scrollY) / sayfa boyu; yatay taşma; görünüm dışına taşan öğe; kırpılmış metin (… ya da taşma gizli); üst üste binen metin/düğme; görünüm alanının (ya da sekme çubuğunun) alt kenarında kesilen öğe; kıvrımın altında kalan düğmeler.')
  L.push('')
  for (const r of results) {
    L.push(`### ${r.key}`, '')
    for (const [no, s] of Object.entries(r.shots)) {
      const bits = [`scrollY ${s.scrollY} / ${s.docH}`]
      if (s.tema) bits.push(`görünen ${s.tema.seen} (parlaklık ${s.tema.luma})${s.tema.why ? `: ${s.tema.why}` : ''}`)
      bits.push(s.hOverflow ? `**yatay taşma ${s.hOverflow} px**` : 'yatay taşma yok')
      if (s.offRight.length) bits.push(`**görünüm dışı:** ${s.offRight.join('; ')}`)
      if (s.clipped.length) bits.push(`**kırpılmış:** ${s.clipped.join('; ')}`)
      if (s.overlaps.length) bits.push(`**üst üste:** ${s.overlaps.join('; ')}`)
      if (s.cutBottom.length) bits.push(`alt kenarda kesilen: ${s.cutBottom.join('; ')}`)
      if (s.buttonsBelow.length) bits.push(`kıvrım altındaki düğmeler: ${s.buttonsBelow.join('; ')}`)
      if (s.player) bits.push(`oynatıcı: altyazı "${s.player.caption}" (${s.player.captionLines} satır, y ${s.player.captionTop}–${s.player.captionBottom}), denetimler y ${s.player.ctlTop}, ufuk çizgisi y ${s.player.formLineY}, çizgi→altyazı ${s.player.gapFormToCaption} px, kalan ${s.player.timer}, bölüm "${s.player.section}"`)
      L.push(`- \`${s.file}\`: ${bits.join(' · ')}`)
    }
    const errs = [...r.errors, ...r.console]
    L.push('', `Konsol (hata/uyarı): ${errs.length ? '' : 'yok'}`)
    for (const e of errs.slice(0, 12)) L.push(`- \`${e.replace(/`/g, "'")}\``)
    L.push('', `Yerel çağrılar: ${Object.entries(r.nativeCalls ?? {}).map(([k, v]) => `${k}×${v}`).join(', ') || 'yok'}`)
    const y = (r.sessions ?? []).filter((s) => s.type === 'yoga')
    L.push('', `Yazılan yoga kaydı: ${y.length ? y.map((s) => `ders ${s.lesson}, ${s.seconds} sn / ${s.planned}, tamamlandı ${s.completed}, önce ${s.before} → sonra ${s.after}, zorlanma ${s.hard}`).join('; ') : 'yok'}`, '')
  }
  L.push(MARK)
  return L.join('\n') + manual
}

const only = process.env.SADECE ?? null
fs.mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  for (const [w, h] of SIZES) {
    for (const t of THEMES) {
      if (only && only !== `${w}-${t}`) continue
      console.log(`${w}×${h} ${t}`)
      results.push(await run(browser, w, h, t, console.log))
    }
  }
} finally {
  await browser.close()
}
fs.writeFileSync(RUN_JSON, JSON.stringify(results.map((r) => ({ code: CODE, flow: FLOW, ...r })), null, 2)) // dizi biçimi aynı
if (!only) fs.writeFileSync(path.join(SHOTS, 'INDEX.md'), indexMd(results))
console.log(`${results.reduce((n, r) => n + Object.keys(r.shots).length, 0)} görüntü → ${SHOTS}`)
// Tema özeti: düzenek hatası çıkış kodunu 2 yapar; uygulamanın temadan bağımsız ekranları yalnız yazılır
const shots = results.flatMap((r) => Object.values(r.shots))
const bad = shots.filter((s) => s.tema?.harness)
const off = shots.filter((s) => s.tema && !s.tema.harness && s.tema.why)
if (off.length) console.log(`tema: beklenenden farklı görünen ${off.length} görüntü (nedeni INDEX.md "Tema denetimi"nde):\n${off.map((s) => `  ${s.file}: ${s.tema.why}`).join('\n')}`)
if (bad.length) {
  console.error(`DÜZENEK HATASI: ${bad.length} görüntüde tema uygulanmamış`)
  process.exitCode = 2
}
