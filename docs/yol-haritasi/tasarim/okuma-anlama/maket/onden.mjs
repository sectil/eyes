// Ön denetim: kapıdan önce her ekranı 390/320 × açık/koyu ölçer. Kurallar kapi/5sn-tur1.md ve 5sn-tur2.md bulgularından.
// Kullanım: node onden.mjs  → hata varsa çıkış kodu 1.
import { chromium } from 'playwright'
const file = new URL('./maket.html', import.meta.url).href
const screens = { giris: 'sabit', metin: 'kayan', soru: 'sabit', sonuc: 'kayan', sayilmadi: 'kayan' }
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch())
let fails = 0
for (const [s, kind] of Object.entries(screens)) for (const theme of ['light', 'dark']) for (const w of [390, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, colorScheme: theme })
  await p.goto(`${file}?s=${s}&theme=${theme}`)
  await p.evaluate(() => document.fonts.ready)
  const r = await p.evaluate((kind) => {
    const out = []
    const H = innerHeight
    if (document.scrollingElement.scrollWidth > innerWidth) out.push('yatay taşma')
    // Tek kelimelik son satır (yetim)
    const sel = 'h1.t, .lead, h2.tt, h2.q, .verd p, .row .v, .row .k, .opt > span:nth-child(2), .today strong, .today em, .fair, .anl span, .meta'
    for (const el of document.querySelectorAll(sel)) {
      if (el.getClientRects().length === 0) continue
      const words = []
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      while (walk.nextNode()) {
        const n = walk.currentNode, re = /\S+/g; let m
        while ((m = re.exec(n.data))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rc = rg.getClientRects()[0]; if (rc) words.push(Math.round(rc.top)) }
      }
      const lines = [...new Set(words)]
      // Yetim: son satırda tek kelime ve o kelime kısa (satır genişliğinin %25'inden az)
      const lastW = el.textContent.trim().split(/\s+/).at(-1)
      const probe = document.createElement('span'); probe.textContent = lastW; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; el.appendChild(probe)
      const short = probe.getBoundingClientRect().width < el.getBoundingClientRect().width * 0.25; probe.remove()
      if (lines.length > 1 && short && words.filter((t) => t === lines.at(-1)).length === 1) out.push(`yetim kelime: ${el.className || el.tagName} "${el.textContent.trim().slice(0, 30)}"`)
      // Satır ayraçla başlıyor ("· 2013")
      const toks = el.textContent.trim().split(/\s+/)
      let k = 0; for (const t of toks) { if (k < words.length && /^[·•–—,;:]$/.test(t) && lines.indexOf(words[k]) > 0 && words[k] !== words[k - 1]) out.push(`satır ayraçla başlıyor: ${el.className}`); k++ }
      if (/^H2$/.test(el.tagName) && lines.length === 2) {
        const first = words.filter((t) => t === lines[0]).length, second = words.length - first
        if (second > first + 1) out.push('başlık erken kırılıyor')
      }
    }
    const dock = document.querySelector('.dock')
    if (kind === 'sabit' && dock) {
      const dt = dock.getBoundingClientRect().top
      const items = [...document.querySelectorAll('.screen > *:not(.dock):not(.spacer) *')].filter((e) => e.children.length === 0 && e.getClientRects().length)
      const bottom = Math.max(...items.map((e) => e.getBoundingClientRect().bottom))
      if (bottom > dt + 1) out.push(`içerik düğmenin altına giriyor (${Math.round(bottom - dt)} px)`)
      if (dt - bottom > 96) out.push(`ölü boşluk ${Math.round(dt - bottom)} px`)
      if (document.scrollingElement.scrollHeight > H + 1) out.push(`sabit ekran kayıyor (${document.scrollingElement.scrollHeight - H} px)`)
    }
    const ring = document.querySelector('.ring svg')
    if (ring) {
      const d = ring.getBoundingClientRect().width * (176 / 264) // iç daire çapı
      for (const e of document.querySelectorAll('.ring .c > *')) { const wd = e.getBoundingClientRect().width; if (wd > d * 0.8) out.push(`iç dairede dar: ${e.className} ${Math.round(wd)}/${Math.round(d)}`) }
    }
    // SVG yazısı görünür boyu: en az 9,5 px
    for (const t of document.querySelectorAll('svg text')) {
      if (!t.getClientRects().length || getComputedStyle(t).display === 'none') continue
      const svg = t.ownerSVGElement, vb = svg.viewBox.baseVal.width, px = parseFloat(t.getAttribute('font-size')) * svg.getBoundingClientRect().width / vb
      if (px < 9.5) { out.push(`SVG yazısı küçük: ${px.toFixed(1)} px`); break }
    }
    const more = document.querySelector('.more')
    if (more) { const cs = getComputedStyle(more); if (cs.borderTopWidth !== '0px' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)') out.push('kaydırma ipucu düğmeye benziyor') }
    return out
  }, kind)
  console.log(`${s}-${theme}-${w}: ${r.length ? r.join(' | ') : 'tamam'}`)
  if (r.length) fails++
  await p.close()
}
await b.close()
process.exit(fails ? 1 : 0)
