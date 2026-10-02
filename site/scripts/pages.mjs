// Sayfa üretimi: pages/*.html gövdeleri ortak başlık, üst çubuk ve alt bilgiyle sarılıp köke *.html olarak yazılır
// (üretilen dosyalar depoya girmez). Gövdenin ilk satırlarındaki yorumlar: <!-- title: … --> <!-- desc: … -->.
// {{iris}} yer tutucusu src/iris.svg.html ile değişir. Böylece üst çubuk ve alt bilgi tek yerde durur.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const NAV = [
  ['nasil-calisir', 'Nasıl çalışır'],
  ['moduller', 'Modüller'],
  ['bilim', 'Bilim'],
  ['gizlilik', 'Gizlilik'],
  ['destek', 'Destek'],
]
const FOOT = [
  ['nasil-calisir', 'Nasıl çalışır'],
  ['moduller', 'Modüller'],
  ['bilim', 'Bilim ve kaynaklar'],
  ['yenilikler', 'Yenilikler'],
  ['gizlilik', 'Gizlilik ve KVKK'],
  ['kosullar', 'Kullanım koşulları'],
  ['destek', 'Destek'],
]
const iris = readFileSync(resolve(root, 'src/iris.svg.html'), 'utf8')
const meta = (body, k, d = '') => body.match(new RegExp(`<!--\\s*${k}:\\s*(.*?)\\s*-->`))?.[1] ?? d

const shell = (slug, body) => {
  const title = meta(body, 'title', 'Nefona')
  const desc = meta(body, 'desc', 'Nefona gözünden başlar: gözünü, dikkatini, sakinliğini, bedenini ve kendine bakışını birlikte izler.')
  const link = (l, s) => `<a href="/${s === 'index' ? '' : s + '.html'}">${l}</a>`
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:image" content="https://nefona.com/og.png">
<meta property="og:url" content="https://nefona.com/${slug === 'index' ? '' : slug + '.html'}">
<link rel="canonical" href="https://nefona.com/${slug === 'index' ? '' : slug + '.html'}">
<meta name="theme-color" content="#f3f6f8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#070c12" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/mark.svg" type="image/svg+xml">
<script>try{var t=localStorage.getItem('nefona-site-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<script type="module" src="/src/main.js"></script>
</head>
<body>
<a class="skip" href="#icerik">İçeriğe geç</a>
<header class="nav">
  <div class="wrap">
    <a class="brand" href="/" aria-label="Nefona ana sayfa"><img src="/mark.svg" alt="" width="34" height="34">Nefona</a>
    <button type="button" class="theme-btn menu-btn" aria-label="Menü" aria-expanded="false" aria-controls="menu"></button>
    <button type="button" class="theme-btn" data-theme-toggle aria-label="Temayı değiştir"></button>
    <nav class="nav-links" id="menu" aria-label="Sayfalar">${NAV.map(([s, l]) => link(l, s)).join('')}</nav>
  </div>
</header>
<main id="icerik" tabindex="-1">
${body.replace(/<!--\s*(title|desc):.*?-->\s*/g, '').replace('{{iris}}', iris)}
</main>
<footer>
  <div class="wrap">
    <span>© 2026 Nefona · Tanı koymaz, tedavi etmez.</span>
    <nav aria-label="Alt bağlantılar">${FOOT.map(([s, l]) => link(l, s)).join('')}</nav>
  </div>
</footer>
</body>
</html>
`
}

const dir = resolve(root, 'pages')
let n = 0
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.html')) continue
  const slug = f.replace(/\.html$/, '')
  writeFileSync(resolve(root, f), shell(slug, readFileSync(resolve(dir, f), 'utf8')))
  n++
}
console.log(`${n} sayfa üretildi`)
