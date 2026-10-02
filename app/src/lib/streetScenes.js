// Fark Ettin mi? sahne motoru (fark-ettin-mi/PLAN.md §5 görsel dil, §5b; maket/scene.js'ten taşındı). Saf: girdi sahne
// modeli, çıktı SVG metni. İçerik uygulama içinde üretilir (kullanıcı metni yok); ekranda innerHTML ile basılabilir.
//
// Dikey ekrana göre yükseklik 844 birim. Katmanlar: gök → uzak silüet + pus → bina sırası (dükkân katı 150 birim:
// tabela, tente, vitrin, kapı; üst katlarda pencere ve balkon) → kaldırım (ağaç, lamba, kişiler, kedi, bisiklet,
// satıcı…) → yol (iki şerit araba) → ön kaldırım. Pazar yerinde bina sırası yerine tezgâhlar, parkta çim ve yol.
// Kurallar (street.test.js denetler): binalar gök payını ≤ %20 tutar (çatı ≤ 0,2 × 844); ağaç ve lamba bina aralarına
// konur, taç ve lamba başı tabela sırasının üstünde, gövde aralıkta kalır; kişi (şapka, şemsiye, balon dahil) tabelanın
// altında durur. Görünüm kırpımı vx, vy, vw, vh ile (maketteki renderStreet gibi).
// Hareket (motion): kişiler adım atar (bacak ve kol salınımı) ve yavaşça yürür, arabalar kendi hızlarıyla akar, tekerlek
// döner; prefers-reduced-motion'da kişiler ve arabalar durur (sahne kayması ekranın işidir). Yanıp sönme yok.

export const H = 844
export const Y = { side: 572, curb: 632, road: 640, lane: 712, roadEnd: 788 }
export const SHOP_H = 150 // dükkân katı
export const SIGN = { top: Y.side - SHOP_H + 4, h: 26 } // tabela: 426..452
export const ROWS = [606, 618, 628] // kaldırımda ayak çizgileri (arka → ön); kişi tepesi ≥ 606 − 148 = 458 > tabela altı
export const PERSON_TOP = 148 // kişinin (şapka, şemsiye, balon dahil) ayaktan en yüksek noktası
export const LANES = { far: Y.road + 50, near: Y.road + 116 } // araba tabanları (uzak şerit sola, yakın şerit sağa akar)
export const SKY_MAX = 0.2 // gök payı üst sınırı

// Renkler: 8 basit ad (erişilebilirlik; seçeneklerde yuvarlak + ad). Soru seçeneklerindeki yuvarlakla aynı ton çizilir.
export const COLORS = {
  kirmizi: { name: 'kırmızı', hex: '#E5484D' },
  mavi: { name: 'mavi', hex: '#3E7BFA' },
  sari: { name: 'sarı', hex: '#F5C542' },
  yesil: { name: 'yeşil', hex: '#2FA56A' },
  mor: { name: 'mor', hex: '#8E6CEF' },
  turuncu: { name: 'turuncu', hex: '#F28C38' },
  siyah: { name: 'siyah', hex: '#2A2E33' },
  beyaz: { name: 'beyaz', hex: '#F2F2F2' },
}
// Yalnız çizimde (çeldirici tonlar ve hayvan renkleri; soru seçeneği olmaz)
const XCOL = { gri: '#9BA1A8', lacivert: '#2C3E66', bordo: '#8E2F3A', krem: '#EADFC8', kahve: '#7A5236', pembe: '#F1A7C0', acikmavi: '#8EC5EA' }
export const col = (k) => COLORS[k]?.hex ?? XCOL[k] ?? k
export const HAIR = { kahve: '#5E3F28', siyah: '#1F1E21', kizil: '#B4552C', gri: '#B9BCBF', sari: '#E3C36A' }
export const SKIN = ['#F2C9A5', '#E0AC82', '#C68A5E', '#8D5A3B', '#6E4430']
export const ANIMAL = { siyah: '#2A2E33', turuncu: '#E08A3C', gri: '#9AA0A6', beyaz: '#F2F2F2', kahve: '#8A5A3A', sari: '#E8C66A' }

export const PAL = {
  day: {
    sky: ['#BFE0EE', '#E6F1F2', '#F6EEDC'], far: '#B9CCD6', far2: '#A9BFCB', haze: 0.35, cloud: '#FFFFFF', cloudOp: 0.9,
    facades: ['#E9D8BF', '#DDBFA9', '#C7D5DB', '#E6CF9F', '#D3CADF', '#D2DBC4', '#EBD3C6'],
    glass: ['#A9CBDB', '#7FA7BD'], frame: '#F7F3EA', sideA: '#C9C3B6', curb: '#9F9A90', road: '#4C525A', road2: '#454B53',
    dash: '#EDE6D2', near: '#BDB6A9', tile: 'rgba(90,80,60,.10)', sign: '#24292F', signInk: '#F6F1E6', lampOn: '#FFE7A8',
    glow: 0, winLit: 0, tree: ['#4C9A61', '#3F8653', '#6DB57B'], grass: ['#9CCB84', '#86BE6E', '#78B060'], path: '#E7DCC2', sun: ['#FFF3D6', 0.22],
  },
  dusk: {
    sky: ['#20345A', '#4A4F7C', '#E39C7A'], far: '#3B4A6B', far2: '#33405E', haze: 0.25, cloud: '#F3B7A2', cloudOp: 0.35,
    facades: ['#8C7F7A', '#7E6E6E', '#6E7886', '#8D7E66', '#7A7390', '#738070', '#8E7470'],
    glass: ['#3A4C66', '#2C3A50'], frame: '#C9C2B8', sideA: '#77736E', curb: '#6E6A65', road: '#30343B', road2: '#2B2F35',
    dash: '#CFC8B6', near: '#7D776E', tile: 'rgba(0,0,0,.14)', sign: '#1A1D22', signInk: '#FFE6B0', lampOn: '#FFD27A',
    glow: 1, winLit: 0.45, tree: ['#35624A', '#2C5440', '#467A5A'], grass: ['#3E5E44', '#36553C', '#2F4C35'], path: '#77705F', sun: ['#FFB070', 0.12],
  },
  rain: {
    sky: ['#9FAEB8', '#B9C3C9', '#CBD1D3'], far: '#9AA8B1', far2: '#8E9DA7', haze: 0.45, cloud: '#E3E7EA', cloudOp: 0.8,
    facades: ['#CDBFAC', '#C2A998', '#B0BEC4', '#C9B790', '#BBB3C6', '#BAC3AE', '#CFBBB0'],
    glass: ['#94AEBB', '#6F8E9F'], frame: '#E4E0D8', sideA: '#A9A49A', curb: '#8A867E', road: '#3E444B', road2: '#363B41',
    dash: '#D6D0BF', near: '#A19B90', tile: 'rgba(40,40,40,.12)', sign: '#22262B', signInk: '#F2EEE4', lampOn: '#FFE7A8',
    glow: 0, winLit: 0.15, tree: ['#3F8556', '#357449', '#5A9E69'], grass: ['#86B472', '#77A862', '#6A9C57'], path: '#CFC6AF', sun: ['#FFFFFF', 0],
  },
}
// Sahne → palet ve hava (PLAN §2: Akşam caddesi akşam paleti, yağmurlu cadde yağmur)
export const SCENES = {
  cadde: { kind: 'street', mode: 'day', light: 'gunduz', weather: 'acik' },
  pazar: { kind: 'market', mode: 'day', light: 'gunduz', weather: 'acik' },
  park: { kind: 'park', mode: 'day', light: 'gunduz', weather: 'acik' },
  aksam: { kind: 'street', mode: 'dusk', light: 'aksam', weather: 'acik' },
  yagmur: { kind: 'street', mode: 'rain', light: 'gunduz', weather: 'yagmur' },
}

const f = (n) => Math.round(n * 10) / 10
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- arka plan düzeni (saf; sahne modeli üretir) ----------
export const SHOPS = ['FIRIN', 'KAFE', 'ÇİÇEKÇİ', 'KİTAPÇI', 'MANAV', 'BERBER', 'KUYUMCU', 'TERZİ', 'PASTANE']
export const STALLS = ['ELMA', 'LİMON', 'ARMUT', 'PORTAKAL', 'İNCİR', 'KAVUN', 'ERİK', 'KİRAZ', 'NAR']
const AWNINGS = ['kirmizi', 'mavi', 'sari', 'mor', 'turuncu'] // yeşil ayrı: sahnede tek (soru konusu)
const DOORS = ['kahve', 'lacivert', 'bordo', 'yesil', 'gri']
export const GAP = 14 // bina aralığı; ağaç ve lamba bu aralığın ortasında

// Bina sırası: genişlik 220–300, yükseklik 420–540 (çatı ≤ 152 < 0,2 × 844). Ağaç ve lamba aralıklara dönüşümlü.
export function streetBackdrop(r, L) {
  const pick = (a) => a[Math.floor(r() * a.length)]
  const shops = [...SHOPS].sort(() => r() - 0.5)
  const s = { buildings: [], trees: [], lamps: [] }
  let x = 0
  let i = 0
  while (x < L) {
    const w = 220 + Math.floor(r() * 80)
    s.buildings.push({ x, w, h: 420 + Math.floor(r() * 120), body: i % 7, shop: shops[i % shops.length], aw: AWNINGS[i % AWNINGS.length], door: pick(DOORS), balcony: r() < 0.5, lit: false })
    x += w + GAP
    i++
  }
  s.buildings.forEach((b, j) => {
    if (j === 0) return
    const gx = b.x - GAP / 2
    if (j % 2 === 1) s.lamps.push({ x: gx })
    else s.trees.push({ x: gx })
  })
  return s
}
// Pazar: arkada yüksek binalar, önde tezgâhlar (tente, ad levhası, sandıklar)
export function marketBackdrop(r, L) {
  const s = { back: [], stalls: [], lamps: [], trees: [] }
  let x = -10
  let i = 0
  while (x < L) {
    const w = 180 + Math.floor(r() * 90)
    s.back.push({ x, w, h: 430 + Math.floor(r() * 110), body: i % 7 })
    x += w + 8
    i++
  }
  const names = [...STALLS].sort(() => r() - 0.5)
  for (let k = 0, sx = 30; sx < L - 120; k++, sx += 270) s.stalls.push({ x: sx, w: 230, aw: ['kirmizi', 'mavi', 'turuncu', 'mor', 'sari'][k % 5], sign: names[k % names.length], fruit: k % 6 })
  return s
}
// Park: arkada binalar, ağaç sırası, çim, yürüyüş yolu, banklar ve lambalar
export function parkBackdrop(r, L) {
  const s = { back: [], trees: [], benches: [], lamps: [] }
  let x = -10
  let i = 0
  while (x < L) {
    const w = 160 + Math.floor(r() * 100)
    s.back.push({ x, w, h: 440 + Math.floor(r() * 100), body: i % 7 })
    x += w + 10
    i++
  }
  for (let tx = 60; tx < L; tx += 150 + Math.floor(r() * 60)) s.trees.push({ x: tx, s: 0.9 + r() * 0.3 })
  for (let bx = 220; bx < L; bx += 520) s.benches.push({ x: bx })
  for (let lx = 470; lx < L; lx += 520) s.lamps.push({ x: lx })
  return s
}
export function backdrop(scene, seed, L) {
  const r = rng(seed)
  const kind = SCENES[scene]?.kind ?? 'street'
  const base = kind === 'market' ? marketBackdrop(r, L) : kind === 'park' ? parkBackdrop(r, L) : streetBackdrop(r, L)
  return { scene: SCENES[scene] ? scene : 'cadde', L, ...base }
}

// ---------- kutular (dokunma, örtüşme ve kesişme testleri için; sahne birimi) ----------
// Öğe kutusu: genişlik w, yükseklik h; tabanın ortası (x, y)
export const SIZE = {
  person: [46, 136], child: [26, 80], cat: [46, 52], dog: [66, 50], bike: [76, 56], scooter: [50, 58], pot: [30, 42],
  bin: [30, 48], aboard: [40, 58], ball: [24, 24], suitcase: [32, 52], stroller: [52, 58], pigeon: [28, 22],
  crate: [46, 32], basket: [40, 30], bucket: [32, 44], cone: [24, 36], bench: [90, 40], hydrant: [22, 40], chair: [30, 50],
  watermelon: [38, 28], vendor: [150, 150],
}
export function itemBox(it) {
  if (it.type === 'person') {
    const s = it.s || 1
    const top = (it.umbrella || it.balloon ? PERSON_TOP : it.hat || it.helmet ? 134 : 126) * s
    const w = (it.umbrella ? 72 : it.child || it.dog ? 96 : 46) * s
    const left = it.child || it.dog ? (it.dir === -1 ? -w + 23 * s : -23 * s) : -w / 2
    return { x: it.x + left, y: it.y - top, w, h: top }
  }
  const [w, h] = SIZE[it.type] ?? [40, 40]
  return { x: it.x - w / 2, y: it.y - h, w, h }
}
export const signBox = (b) => ({ x: b.x + 12, y: SIGN.top, w: b.w - 24, h: SIGN.h })
// Ağaç: gövde aralıkta (±5), taç tabela sırasının üstünde (y ≤ 402)
export const treeBoxes = (t) => [{ x: t.x - 5, y: 380, w: 10, h: Y.side + 8 - 380 }, { x: t.x - 66, y: 286, w: 132, h: 116 }]
// Lamba: direk aralıkta (±3), kol ve baş tabelanın üstünde (y 380..400)
export const lampBoxes = (l) => [{ x: l.x - 3, y: 392, w: 6, h: Y.side + 40 - 392 }, { x: l.x, y: 380, w: 40, h: 20 }]
// Kişi başı (şapka, şemsiye, balon dahil üst parça)
export const headBox = (p) => {
  const b = itemBox(p)
  return { x: b.x, y: b.y, w: b.w, h: 40 * (p.s || 1) }
}
export const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad

// ---------- parçalar ----------
function defs(p, mode) {
  const id = (n) => `fe-${mode}-${n}`
  return `<defs><linearGradient id="${id('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>` +
    `<linearGradient id="${id('glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.glass[0]}"/><stop offset="1" stop-color="${p.glass[1]}"/></linearGradient>` +
    `<linearGradient id="${id('road')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.road}"/><stop offset="1" stop-color="${p.road2}"/></linearGradient>` +
    `<radialGradient id="${id('glow')}"><stop offset="0" stop-color="${p.lampOn}" stop-opacity=".55"/><stop offset="1" stop-color="${p.lampOn}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${id('shade')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>` +
    `<linearGradient id="${id('aw')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>` +
    `<linearGradient id="${id('sun')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.sun[0]}" stop-opacity="${p.sun[1]}"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`
}
const MOTION_CSS = '<style>' +
  '.fe-lb,.fe-lf,.fe-ab,.fe-af{transform-box:fill-box;transform-origin:50% 0}' +
  '.fe-go .fe-lf{animation:fe-step .45s ease-in-out infinite alternate}.fe-go .fe-lb{animation:fe-step .45s ease-in-out infinite alternate-reverse}' +
  '.fe-go .fe-af{animation:fe-arm .45s ease-in-out infinite alternate-reverse}.fe-go .fe-ab{animation:fe-arm .45s ease-in-out infinite alternate}' +
  '.fe-go .fe-lf,.fe-go .fe-lb,.fe-go .fe-af,.fe-go .fe-ab{animation-delay:var(--d,0s)}' +
  '.fe-run .fe-lf,.fe-run .fe-lb,.fe-run .fe-af,.fe-run .fe-ab{animation-duration:.26s}' +
  '.fe-go,.fe-drive{animation:fe-move var(--t,40s) linear both}' +
  '.fe-wheel{transform-box:fill-box;transform-origin:50% 50%;animation:fe-spin .5s linear infinite}' +
  '.fe-rain{animation:fe-rain .7s linear infinite}' +
  '@keyframes fe-step{from{transform:rotate(-15deg)}to{transform:rotate(15deg)}}' +
  '@keyframes fe-arm{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}' +
  '@keyframes fe-move{from{transform:translateX(0)}to{transform:translateX(var(--dx,0px))}}' +
  '@keyframes fe-spin{to{transform:rotate(360deg)}}' +
  '@keyframes fe-rain{from{transform:translateY(-40px)}to{transform:translateY(0)}}' +
  '@media (prefers-reduced-motion:reduce){.fe-go,.fe-drive,.fe-go .fe-lf,.fe-go .fe-lb,.fe-go .fe-af,.fe-go .fe-ab,.fe-wheel,.fe-rain{animation:none!important}}' +
  '</style>'

function clouds(L, r, p) {
  let o = ''
  for (let x = 60; x < L; x += 380 + r() * 260) {
    const y = 40 + r() * 70
    const s = 0.7 + r() * 0.6
    o += `<g opacity="${p.cloudOp}" fill="${p.cloud}"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(46 * s)}" ry="${f(16 * s)}"/><ellipse cx="${f(x + 30 * s)}" cy="${f(y - 10 * s)}" rx="${f(30 * s)}" ry="${f(18 * s)}"/><ellipse cx="${f(x - 26 * s)}" cy="${f(y - 4 * s)}" rx="${f(22 * s)}" ry="${f(12 * s)}"/></g>`
  }
  return o
}
function skyline(L, r, p) {
  let o = ''
  let x = -20
  while (x < L) {
    const w = 60 + r() * 90
    const h = 120 + r() * 170
    o += `<rect x="${f(x)}" y="${f(Y.side - 150 - h)}" width="${f(w)}" height="${f(h + 150)}" fill="${r() < 0.5 ? p.far : p.far2}"/>`
    if (r() < 0.25) o += `<rect x="${f(x + w / 2 - 2)}" y="${f(Y.side - 150 - h - 26)}" width="4" height="26" fill="${p.far2}"/>`
    x += w + 6 + r() * 20
  }
  return o
}
function windowEl(x, y, w, h, p, lit, m) {
  let o = `<rect x="${f(x - 3)}" y="${f(y - 3)}" width="${f(w + 6)}" height="${f(h + 6)}" rx="2" fill="${p.frame}"/>`
  o += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${lit ? '#F6CF7E' : `url(#fe-${m}-glass)`}"/>`
  if (!lit) o += `<path d="M${f(x + w * 0.15)} ${f(y + h)}L${f(x + w * 0.65)} ${f(y)}L${f(x + w * 0.85)} ${f(y)}L${f(x + w * 0.35)} ${f(y + h)}Z" fill="#fff" opacity=".22"/>`
  o += `<rect x="${f(x + w / 2 - 1)}" y="${f(y)}" width="2" height="${f(h)}" fill="${p.frame}"/><rect x="${f(x - 6)}" y="${f(y + h + 3)}" width="${f(w + 12)}" height="5" rx="1.5" fill="${p.frame}" opacity=".9"/>`
  return o
}
const GOODS = { FIRIN: ['#C88A45', '#E2B06A'], PASTANE: ['#F1B9C8', '#F6E0B5'], 'ÇİÇEKÇİ': ['#E0474C', '#F3BF3A', '#8A66E6'], MANAV: ['#E0474C', '#F3BF3A', '#7FB24E'], KAFE: ['#7A5640', '#EADFC8'], 'KİTAPÇI': ['#3A74F0', '#E0474C', '#2E9E63', '#F3BF3A'], BERBER: ['#E0474C', '#3A74F0'], KUYUMCU: ['#E8C45C'], 'TERZİ': ['#2C3E66', '#8E2F3A', '#EADFC8'] }
function goods(shop, x, base, w) {
  const c = GOODS[shop] ?? ['#ccc']
  let o = `<rect x="${x + 4}" y="${base - 14}" width="${w - 8}" height="6" fill="#000" opacity=".12"/>`
  for (let i = 0; i < Math.floor(w / 20); i++) {
    const k = c[i % c.length]
    const cx = x + 10 + i * 20
    if (shop === 'KİTAPÇI') o += `<rect x="${cx - 5}" y="${base - 40}" width="9" height="26" fill="${k}"/>`
    else if (shop === 'TERZİ') o += `<path d="M${cx - 6} ${base - 44}L${cx + 6} ${base - 44}L${cx + 8} ${base - 16}L${cx - 8} ${base - 16}Z" fill="${k}"/>`
    else if (shop === 'KUYUMCU') o += `<circle cx="${cx}" cy="${base - 24}" r="5" fill="none" stroke="${k}" stroke-width="2.5"/>`
    else o += `<circle cx="${cx}" cy="${base - 20}" r="6.5" fill="${k}"/>`
  }
  return o
}
export function building(b, p, r, m, minY = 0) {
  const top = Y.side - b.h
  const { x, w } = b
  const body = p.facades[b.body % p.facades.length]
  let o = `<g><rect x="${x}" y="${top}" width="${w}" height="${b.h}" fill="${body}"/><rect x="${x}" y="${top}" width="${w}" height="${b.h}" fill="url(#fe-${m}-shade)"/>`
  o += `<rect x="${x - 4}" y="${top - 10}" width="${w + 8}" height="12" rx="2" fill="${p.frame}" opacity=".85"/>`
  const floors = Math.floor((b.h - 176) / 84)
  const cols = Math.max(2, Math.floor((w - 30) / 62))
  const gap = (w - cols * 36) / (cols + 1)
  for (let fl = 0; fl < floors; fl++) {
    const wy = top + 26 + fl * 84
    const lit = Array.from({ length: cols }, () => p.winLit && r() < p.winLit) // r() her durumda aynı sırayla çekilir
    if (wy + 84 < minY) continue // görünüm dışındaki kat çizilmez
    for (let c = 0; c < cols; c++) o += windowEl(x + gap + c * (36 + gap), wy, 36, 50, p, lit[c], m)
    if (b.balcony && fl === floors - 1) {
      o += `<rect x="${f(x + gap - 8)}" y="${f(wy + 52)}" width="${f(w - 2 * gap + 16)}" height="4" fill="${p.sign}" opacity=".7"/>`
      for (let i = 0; i < Math.floor((w - 2 * gap) / 10); i++) o += `<rect x="${f(x + gap - 6 + i * 10)}" y="${f(wy + 56)}" width="2" height="18" fill="${p.sign}" opacity=".55"/>`
      o += `<rect x="${f(x + gap - 8)}" y="${f(wy + 74)}" width="${f(w - 2 * gap + 16)}" height="3" fill="${p.sign}" opacity=".7"/>`
    }
    if (b.flowerbox && fl === floors - 1 && !b.balcony) {
      const fx = x + gap - 4
      o += `<rect x="${f(fx)}" y="${f(wy + 58)}" width="44" height="9" rx="2" fill="#8A5A3A"/>` + [0, 1, 2, 3].map((i) => `<circle cx="${f(fx + 7 + i * 10)}" cy="${f(wy + 55)}" r="5" fill="${col(b.flowerbox)}"/>`).join('')
    }
  }
  const gy = Y.side - SHOP_H
  o += `<rect x="${x}" y="${gy}" width="${w}" height="${SHOP_H}" fill="${body}"/><rect x="${x}" y="${gy}" width="${w}" height="${SHOP_H}" fill="#000" opacity=".06"/>`
  o += `<rect x="${x + 12}" y="${SIGN.top}" width="${w - 24}" height="${SIGN.h}" rx="4" fill="${p.sign}"/>`
  o += `<text x="${x + w / 2}" y="${SIGN.top + 18}" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.6" fill="${p.signInk}">${b.shop}</text>`
  const aw = col(b.aw)
  const ay = SIGN.top + SIGN.h + 4
  o += `<path d="M${x + 6} ${ay}L${x + w - 6} ${ay}L${x + w + 2} ${ay + 24}L${x - 2} ${ay + 24}Z" fill="${aw}"/>`
  for (let sx = x + 6; sx < x + w - 14; sx += 22) o += `<path d="M${sx + 11} ${ay}L${sx + 22} ${ay}L${f(sx + 22 + ((sx + 16 - x) / w - 0.5) * 8)} ${ay + 24}L${f(sx + 11 + ((sx + 16 - x) / w - 0.5) * 8)} ${ay + 24}Z" fill="#fff" opacity=".42"/>`
  o += `<path d="M${x + 6} ${ay}L${x + w - 6} ${ay}L${x + w + 2} ${ay + 24}L${x - 2} ${ay + 24}Z" fill="url(#fe-${m}-aw)"/>`
  for (let sx = x - 2; sx < x + w; sx += 12) o += `<circle cx="${sx + 6}" cy="${ay + 24}" r="6" fill="${aw}"/>`
  o += `<rect x="${x - 2}" y="${ay + 24}" width="${w + 4}" height="10" fill="#000" opacity=".08"/>`
  const vw = w - 74
  const lit = b.lit
  o += `<rect x="${x + 12}" y="${ay + 36}" width="${vw}" height="${Y.side - ay - 44}" rx="3" fill="${p.frame}"/>`
  o += `<rect x="${x + 16}" y="${ay + 40}" width="${vw - 8}" height="${Y.side - ay - 52}" fill="${lit ? '#F7D58A' : `url(#fe-${m}-glass)`}" opacity=".95"/>`
  if (lit) o += `<rect x="${x + 16}" y="${ay + 40}" width="${vw - 8}" height="${Y.side - ay - 52}" fill="#FFF3C8" opacity=".35"/><path d="M${x + 12} ${Y.side}L${x + 12 + vw} ${Y.side}L${x + 30 + vw} ${Y.side + 50}L${x - 6} ${Y.side + 50}Z" fill="#FFD27A" opacity=".16"/>`
  else o += `<path d="M${x + 22} ${Y.side - 12}L${x + 60} ${ay + 40}L${x + 74} ${ay + 40}L${x + 36} ${Y.side - 12}Z" fill="#fff" opacity=".2"/>`
  o += goods(b.shop, x + 16, Y.side - 12, vw - 8)
  o += `<rect x="${x + w - 52}" y="${ay + 34}" width="40" height="${Y.side - ay - 34}" rx="3" fill="${p.frame}"/><rect x="${x + w - 48}" y="${ay + 38}" width="32" height="${Y.side - ay - 38}" fill="${col(b.door)}"/><rect x="${x + w - 44}" y="${ay + 44}" width="24" height="34" fill="url(#fe-${m}-glass)" opacity=".6"/><circle cx="${x + w - 22}" cy="${Y.side - 40}" r="2.2" fill="#E7C46A"/>`
  return o + '</g>'
}
function tree(t, p) {
  const c = p.tree
  const y = Y.side + 8
  const x = t.x
  return `<g><ellipse cx="${x}" cy="${y + 4}" rx="34" ry="7" fill="#000" opacity=".12"/><rect x="${x - 16}" y="${y - 2}" width="32" height="8" rx="2" fill="#6E6A62"/><path d="M${x - 5} ${y}L${x - 4} 380L${x + 4} 380L${x + 5} ${y}Z" fill="#6B4A31"/>` +
    `<circle cx="${x - 30}" cy="352" r="34" fill="${c[1]}"/><circle cx="${x + 28}" cy="356" r="36" fill="${c[1]}"/><circle cx="${x}" cy="328" r="40" fill="${c[0]}"/><circle cx="${x - 36}" cy="374" r="26" fill="${c[0]}"/><circle cx="${x + 36}" cy="376" r="26" fill="${c[0]}"/><circle cx="${x - 12}" cy="314" r="18" fill="${c[2]}" opacity=".7"/><circle cx="${x + 20}" cy="338" r="12" fill="${c[2]}" opacity=".55"/></g>`
}
function parkTree(t, p) {
  const c = p.tree
  const s = t.s
  const x = t.x
  const y = 520
  return `<g><ellipse cx="${x}" cy="${y + 3}" rx="${f(30 * s)}" ry="6" fill="#000" opacity=".12"/><path d="M${x - 6} ${y}L${x - 4} ${f(y - 120 * s)}L${x + 4} ${f(y - 120 * s)}L${x + 6} ${y}Z" fill="#6B4A31"/>` +
    `<circle cx="${f(x - 32 * s)}" cy="${f(y - 150 * s)}" r="${f(38 * s)}" fill="${c[1]}"/><circle cx="${f(x + 30 * s)}" cy="${f(y - 146 * s)}" r="${f(40 * s)}" fill="${c[1]}"/><circle cx="${x}" cy="${f(y - 186 * s)}" r="${f(46 * s)}" fill="${c[0]}"/><circle cx="${f(x - 14 * s)}" cy="${f(y - 204 * s)}" r="${f(20 * s)}" fill="${c[2]}" opacity=".7"/></g>`
}
function lamp(l, p, m, base = Y.side + 40) {
  const x = l.x
  const y = base
  let o = '<g>'
  if (p.glow) o += `<circle cx="${x + 26}" cy="${y - 214}" r="70" fill="url(#fe-${m}-glow)"/><ellipse cx="${x + 26}" cy="${y - 4}" rx="60" ry="10" fill="${p.lampOn}" opacity=".18"/>`
  o += `<rect x="${x - 3}" y="${y - 220}" width="6" height="220" fill="#353B43"/><rect x="${x - 7}" y="${y - 8}" width="14" height="10" rx="2" fill="#353B43"/><path d="M${x} ${y - 220}Q${x} ${y - 232} ${x + 18} ${y - 228}L${x + 26} ${y - 226}" stroke="#353B43" stroke-width="5" fill="none"/><path d="M${x + 14} ${y - 226}L${x + 38} ${y - 226}L${x + 34} ${y - 214}L${x + 18} ${y - 214}Z" fill="#353B43"/><rect x="${x + 19}" y="${y - 215}" width="14" height="4" rx="2" fill="${p.lampOn}"/>`
  return o + '</g>'
}
function ground(L, p, m, rain) {
  let o = `<rect y="${Y.side}" width="${L}" height="${Y.curb - Y.side}" fill="${p.sideA}"/>`
  for (let x = 0; x < L; x += 48) o += `<rect x="${x}" y="${Y.side}" width="1.5" height="${Y.curb - Y.side}" fill="${p.tile}"/>`
  o += `<rect y="${Y.side + 30}" width="${L}" height="1.5" fill="${p.tile}"/><rect y="${Y.curb}" width="${L}" height="${Y.road - Y.curb}" fill="${p.curb}"/>`
  o += `<rect y="${Y.road}" width="${L}" height="${Y.roadEnd - Y.road}" fill="url(#fe-${m}-road)"/>`
  for (let x = 20; x < L; x += 90) o += `<rect x="${x}" y="${Y.lane}" width="50" height="5" rx="2" fill="${p.dash}" opacity=".75"/>`
  if (rain) for (let x = 40; x < L; x += 130) o += `<rect x="${x}" y="${Y.road + 8}" width="${16 + (x % 3) * 8}" height="${Y.roadEnd - Y.road - 16}" fill="#fff" opacity=".07"/>`
  o += `<rect y="${Y.roadEnd}" width="${L}" height="8" fill="${p.curb}"/><rect y="${Y.roadEnd + 8}" width="${L}" height="${H - Y.roadEnd - 8}" fill="${p.near}"/>`
  for (let x = 0; x < L; x += 64) o += `<rect x="${x}" y="${Y.roadEnd + 8}" width="1.5" height="${H - Y.roadEnd}" fill="${p.tile}"/>`
  return o
}
function backRow(list, p, r, m, topRow) {
  let o = ''
  for (const b of list) {
    const top = Y.side - b.h
    o += `<rect x="${b.x}" y="${top}" width="${b.w}" height="${b.h}" fill="${p.facades[b.body % 7]}"/><rect x="${b.x}" y="${top}" width="${b.w}" height="${b.h}" fill="url(#fe-${m}-shade)"/>`
    for (let wy = top + 24; wy < topRow; wy += 78) for (let wx = b.x + 20; wx < b.x + b.w - 40; wx += 56) o += windowEl(wx, wy, 30, 44, p, p.winLit && r() < p.winLit, m)
  }
  return o
}
// Tezgâh iki parça: arka (direkler, tente, ad levhası) ve ön (tezgâh, kasalar); satıcı ikisinin arasında çizilir
function stallBack(st) {
  const { x, w } = st
  const ac = col(st.aw)
  let o = `<g><rect x="${x + 6}" y="372" width="6" height="${Y.side + 30 - 372}" fill="#5B5149"/><rect x="${x + w - 12}" y="372" width="6" height="${Y.side + 30 - 372}" fill="#5B5149"/>`
  o += `<path d="M${x - 10} 424L${x + w + 10} 424L${x + w - 6} 372L${x + 6} 372Z" fill="${ac}"/>`
  for (let s = 0; s < 5; s++) o += `<path d="M${x + 28 + s * 44} 372L${x + 50 + s * 44} 372L${x + 38 + s * 48} 424L${x + 14 + s * 48} 424Z" fill="#fff" opacity=".4"/>`
  for (let sc = x - 10; sc < x + w + 10; sc += 16) o += `<circle cx="${sc + 8}" cy="424" r="8" fill="${ac}"/>`
  return o + `<rect x="${x + w / 2 - 40}" y="380" width="80" height="22" rx="4" fill="#FFF8E8"/><text x="${x + w / 2}" y="396" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-weight="800" font-size="12" fill="#2A2E33">${st.sign}</text></g>`
}
function stallFront(st) {
  const { x, w } = st
  const cy = Y.side - 30
  const fruits = [['#E0474C', '#C93A3F'], ['#F3BF3A', '#E0A92E'], ['#7FB24E', '#6A9C3F'], ['#EE8735', '#D6772E'], ['#8A3B6E', '#732E5B'], ['#2E7D4F', '#256A42']]
  let o = `<g><rect x="${x}" y="${cy}" width="${w}" height="60" rx="4" fill="#9C7650"/><rect x="${x}" y="${cy}" width="${w}" height="10" fill="#000" opacity=".15"/>`
  for (let c = 0; c < 3; c++) {
    const fr = fruits[(st.fruit + c) % fruits.length]
    const bx = x + 12 + c * 72
    o += `<rect x="${bx}" y="${cy - 26}" width="64" height="28" rx="3" fill="#C9A26E"/>`
    for (let i = 0; i < 9; i++) o += `<circle cx="${bx + 9 + (i % 5) * 11.5}" cy="${cy - 28 - Math.floor(i / 5) * 9}" r="7" fill="${fr[i % 2]}"/>`
  }
  return o + '</g>'
}
function bench(x, y, c = '#8A5A3A') {
  return `<g><ellipse cx="${x}" cy="${y + 2}" rx="48" ry="5" fill="#000" opacity=".12"/><rect x="${x - 45}" y="${y - 40}" width="90" height="7" rx="3" fill="${c}"/><rect x="${x - 45}" y="${y - 24}" width="90" height="8" rx="3" fill="${c}"/><rect x="${x - 38}" y="${y - 16}" width="5" height="16" fill="#3A3F45"/><rect x="${x + 33}" y="${y - 16}" width="5" height="16" fill="#3A3F45"/><rect x="${x - 38}" y="${y - 40}" width="4" height="18" fill="#3A3F45"/><rect x="${x + 34}" y="${y - 40}" width="4" height="18" fill="#3A3F45"/></g>`
}

// ---------- kişiler ----------
const CHILD_ITEM = {
  balon: (x, y) => `<path d="M${x + 8} ${y - 40}L${x + 12} ${y - 66}" stroke="#555" stroke-width="1"/><ellipse cx="${x + 13}" cy="${y - 74}" rx="8" ry="10" fill="#E5484D"/>`,
  dondurma: (x, y) => `<path d="M${x + 6} ${y - 42}L${x + 14} ${y - 42}L${x + 10} ${y - 30}Z" fill="#D9A15B"/><circle cx="${x + 10}" cy="${y - 45}" r="5" fill="#F4B6C8"/>`,
  ayi: (x, y) => `<circle cx="${x + 11}" cy="${y - 36}" r="6" fill="#9B6B43"/><circle cx="${x + 11}" cy="${y - 45}" r="4.5" fill="#9B6B43"/><circle cx="${x + 8}" cy="${y - 49}" r="2" fill="#9B6B43"/><circle cx="${x + 14}" cy="${y - 49}" r="2" fill="#9B6B43"/>`,
  bayrak: (x, y) => `<path d="M${x + 9} ${y - 32}L${x + 9} ${y - 66}" stroke="#555" stroke-width="1.4"/><rect x="${x + 9}" y="${y - 66}" width="16" height="11" fill="#E5484D"/><circle cx="${x + 15}" cy="${y - 60.5}" r="3" fill="#fff"/>`,
}
const INSTR = {
  gitar: (k) => `<ellipse cx="${k(2)}" cy="${k(-66)}" rx="${k(11)}" ry="${k(13)}" fill="#B9762F"/><circle cx="${k(2)}" cy="${k(-68)}" r="${k(3.5)}" fill="#3A2A1E"/><rect x="${k(6)}" y="${k(-106)}" width="${k(4)}" height="${k(36)}" fill="#6B4A31" transform="rotate(28 ${k(8)} ${k(-88)})"/>`,
  keman: (k) => `<ellipse cx="${k(10)}" cy="${k(-100)}" rx="${k(6)}" ry="${k(9)}" fill="#8A4A22"/><path d="M${k(-12)} ${k(-92)}L${k(22)} ${k(-112)}" stroke="#ccc" stroke-width="${k(1.2)}"/>`,
  akordeon: (k) => `<rect x="${k(-14)}" y="${k(-86)}" width="${k(28)}" height="${k(22)}" rx="${k(3)}" fill="#E5484D"/><path d="M${k(-8)} ${k(-86)}V${k(-64)}M${k(-2)} ${k(-86)}V${k(-64)}M${k(4)} ${k(-86)}V${k(-64)}" stroke="#fff" stroke-width="${k(1.5)}"/>`,
  flut: (k) => `<rect x="${k(4)}" y="${k(-112)}" width="${k(30)}" height="${k(3.5)}" rx="${k(1.5)}" fill="#C9CDD2" transform="rotate(-12 ${k(4)} ${k(-110)})"/>`,
}
export const INSTRUMENTS = Object.keys(INSTR)
export const CHILD_ITEMS = Object.keys(CHILD_ITEM)
// q: { x, y, dir, s, top, skin, hair, dress, longHair, pants, bag, hat, helmet, glasses, phone, laugh, beard, scarf, cane,
//      flowers, instrument, umbrella, coat, balloon, child: item, dog: renk, kite: renk, run, walk }
export function person(q, p = PAL.day, o = {}) {
  const s = q.s || 1
  const k = (v) => f(v * s)
  const dir = q.dir || 1
  const top = col(q.top || 'mavi')
  const skin = q.skin || SKIN[1]
  const hair = HAIR[q.hair] || q.hair || HAIR.kahve
  const leg = q.dress ? skin : q.pants || '#3B4656'
  const sleeve = q.dress ? skin : top
  let g = `<ellipse cx="0" cy="2" rx="${k(20)}" ry="${k(4)}" fill="#000" opacity=".14"/>`
  const legEl = (cls, dx) => `<g class="${cls}"><rect x="${k(dx - 4)}" y="${k(-58)}" width="${k(8)}" height="${k(54)}" rx="${k(4)}" fill="${leg}" stroke="#000" stroke-opacity=".12" stroke-width="${k(1)}"/><rect x="${k(dx - 5)}" y="${k(-7)}" width="${k(14)}" height="${k(7)}" rx="${k(3)}" fill="#2A2522"/></g>`
  g += legEl('fe-lb', -5) + legEl('fe-lf', 5)
  const armEl = (cls, dx) => `<g class="${cls}"><rect x="${k(dx - 4)}" y="${k(-100)}" width="${k(8)}" height="${k(42)}" rx="${k(4)}" fill="${sleeve}"/><circle cx="${k(dx)}" cy="${k(-58)}" r="${k(4.5)}" fill="${skin}"/></g>`
  g += armEl('fe-ab', -6)
  if (q.coat) g += `<path d="M${k(-15)} ${k(-104)}L${k(15)} ${k(-104)}L${k(19)} ${k(-40)}L${k(-19)} ${k(-40)}Z" fill="${col(q.coat)}"/><rect x="${k(-1)}" y="${k(-104)}" width="${k(2)}" height="${k(64)}" fill="#000" opacity=".15"/>`
  else if (q.dress) g += `<path d="M${k(-12)} ${k(-104)}L${k(12)} ${k(-104)}L${k(21)} ${k(-50)}L${k(-21)} ${k(-50)}Z" fill="${top}"/><path d="M${k(4)} ${k(-104)}L${k(12)} ${k(-104)}L${k(21)} ${k(-50)}L${k(10)} ${k(-50)}Z" fill="#000" opacity=".1"/>`
  else g += `<rect x="${k(-13)}" y="${k(-106)}" width="${k(26)}" height="${k(50)}" rx="${k(8)}" fill="${top}"/><rect x="${k(4)}" y="${k(-106)}" width="${k(9)}" height="${k(50)}" rx="${k(5)}" fill="#000" opacity=".1"/>`
  if (q.bag) g += `<path d="M${k(-6)} ${k(-102)}L${k(-16)} ${k(-66)}" stroke="#2A2E33" stroke-width="${k(1.6)}"/><rect x="${k(-26)}" y="${k(-70)}" width="${k(18)}" height="${k(16)}" rx="${k(3)}" fill="${col(q.bag)}"/><rect x="${k(-26)}" y="${k(-70)}" width="${k(18)}" height="${k(4)}" rx="${k(2)}" fill="#000" opacity=".15"/>`
  if (q.instrument) g += INSTR[q.instrument]?.(k) ?? ''
  g += armEl('fe-af', 6)
  if (q.phone) g += `<rect x="${k(10)}" y="${k(-104)}" width="${k(6)}" height="${k(11)}" rx="${k(1.5)}" fill="#1d1d1f"/>`
  if (q.cane) g += `<path d="M${k(9)} ${k(-58)}L${k(16)} 0" stroke="#5B4636" stroke-width="${k(3)}" stroke-linecap="round"/><path d="M${k(9)} ${k(-58)}q${k(-6)} ${k(-6)} ${k(-10)} 0" stroke="#5B4636" stroke-width="${k(3)}" fill="none"/>`
  if (q.flowers) g += `<path d="M${k(9)} ${k(-58)}L${k(14)} ${k(-80)}" stroke="#2E7D4F" stroke-width="${k(2)}"/>` + [[10, -86], [17, -84], [13, -92]].map(([a, b]) => `<circle cx="${k(a)}" cy="${k(b)}" r="${k(4.5)}" fill="${col(q.flowers)}"/>`).join('')
  if (q.balloon) g += `<path d="M${k(9)} ${k(-58)}L${k(14)} ${k(-122)}" stroke="#555" stroke-width="${k(1)}"/><ellipse cx="${k(15)}" cy="${k(-134)}" rx="${k(9)}" ry="${k(11)}" fill="${col(q.balloon)}"/>`
  if (q.umbrella) g += `<path d="M${k(9)} ${k(-58)}L${k(9)} ${k(-140)}" stroke="#333" stroke-width="${k(2)}"/><path d="M${k(-26)} ${k(-126)}Q${k(9)} ${k(-166)} ${k(44)} ${k(-126)}Z" fill="${col(q.umbrella)}"/><path d="M${k(-26)} ${k(-126)}Q${k(9)} ${k(-140)} ${k(44)} ${k(-126)}" fill="#000" opacity=".12"/>`
  if (q.scarf) g += `<rect x="${k(-11)}" y="${k(-106)}" width="${k(22)}" height="${k(7)}" rx="${k(3)}" fill="${col(q.scarf)}"/><rect x="${k(-9)}" y="${k(-100)}" width="${k(6)}" height="${k(18)}" rx="${k(2)}" fill="${col(q.scarf)}"/>`
  g += `<rect x="${k(-4)}" y="${k(-114)}" width="${k(8)}" height="${k(10)}" fill="${skin}"/>`
  if (q.longHair) g += `<path d="M${k(-13)} ${k(-118)}Q${k(-18)} ${k(-96)} ${k(-10)} ${k(-88)}L${k(1)} ${k(-90)}Q${k(-5)} ${k(-100)} ${k(-1)} ${k(-114)}Z" fill="${hair}"/>`
  g += `<circle cx="0" cy="${k(-112)}" r="${k(12)}" fill="${skin}"/>`
  g += `<path d="M${k(-12.5)} ${k(-113)}Q${k(-11)} ${k(-128)} ${k(2)} ${k(-126)}Q${k(13)} ${k(-124)} ${k(12.5)} ${k(-112)}Q${k(6)} ${k(-120)} ${k(-4)} ${k(-117)}Q${k(-10)} ${k(-115)} ${k(-12.5)} ${k(-113)}Z" fill="${hair}"/>`
  if (q.beard) g += `<path d="M${k(-9)} ${k(-110)}Q${k(-6)} ${k(-96)} ${k(4)} ${k(-97)}Q${k(12)} ${k(-99)} ${k(12)} ${k(-108)}L${k(10)} ${k(-106)}Q${k(2)} ${k(-102)} ${k(-6)} ${k(-108)}Z" fill="${hair}"/>`
  g += q.laugh ? `<path d="M${k(3)} ${k(-112)}Q${k(6)} ${k(-115)} ${k(9)} ${k(-112)}" stroke="#1d1d1f" stroke-width="${k(1.4)}" fill="none" stroke-linecap="round"/><path d="M${k(2)} ${k(-106)}Q${k(8)} ${k(-97)} ${k(12)} ${k(-106)}Z" fill="#7A1F2B"/><path d="M${k(4)} ${k(-106)}L${k(11)} ${k(-106)}" stroke="#fff" stroke-width="${k(1.4)}"/>` : `<circle cx="${k(6)}" cy="${k(-111)}" r="${k(1.5)}" fill="#1d1d1f"/>`
  if (!q.laugh && !q.beard) g += `<path d="M${k(5)} ${k(-104)}Q${k(8)} ${k(-102.5)} ${k(11)} ${k(-104.5)}" stroke="#6A3A30" stroke-width="${k(1.2)}" fill="none"/>`
  if (q.glasses) g += `<circle cx="${k(6)}" cy="${k(-111)}" r="${k(4)}" fill="none" stroke="#1d1d1f" stroke-width="${k(1.4)}"/><path d="M${k(2)} ${k(-111)}L${k(-8)} ${k(-113)}" stroke="#1d1d1f" stroke-width="${k(1.2)}"/>`
  if (q.hat) g += `<rect x="${k(-17)}" y="${k(-124)}" width="${k(34)}" height="${k(5)}" rx="${k(2.5)}" fill="${col(q.hat)}"/><rect x="${k(-11)}" y="${k(-134)}" width="${k(22)}" height="${k(12)}" rx="${k(4)}" fill="${col(q.hat)}"/><rect x="${k(-11)}" y="${k(-126)}" width="${k(22)}" height="${k(2.5)}" fill="#000" opacity=".2"/>`
  if (q.helmet) g += `<path d="M${k(-14)} ${k(-118)}Q${k(-14)} ${k(-134)} ${k(0)} ${k(-134)}Q${k(14)} ${k(-134)} ${k(14)} ${k(-118)}Z" fill="${col(q.helmet)}"/><rect x="${k(-17)}" y="${k(-120)}" width="${k(34)}" height="${k(4)}" rx="${k(2)}" fill="${col(q.helmet)}"/>`
  let extra = ''
  if (q.child) extra += person({ x: 24 * s, y: 0, s: 0.58 * s, top: 'sari', skin, hair: 'kahve', dir: 1 }, p, { inner: true }) + (CHILD_ITEM[q.child]?.(24 * s, 0) ?? '')
  if (q.dog) extra += `<path d="M${k(9)} ${k(-58)}Q${k(30)} ${k(-30)} ${k(46)} ${k(-34)}" stroke="#2A2E33" stroke-width="${k(1.2)}" fill="none"/>` + dogShape(k(58), 0, ANIMAL[q.dog] ?? col(q.dog), s * 0.9)
  if (q.kite) extra += `<path d="M${k(9)} ${k(-90)}L${k(70)} ${k(-300)}" stroke="#555" stroke-width="1"/><path d="M${k(70)} ${k(-330)}L${k(88)} ${k(-300)}L${k(70)} ${k(-276)}L${k(52)} ${k(-300)}Z" fill="${col(q.kite)}"/><path d="M${k(70)} ${k(-276)}q${k(-8)} ${k(16)} ${k(4)} ${k(30)}" stroke="${col(q.kite)}" stroke-width="2" fill="none"/>`
  const body = `<g transform="translate(${f(q.x)} ${f(q.y)}) scale(${dir} 1)">${g}${extra}</g>`
  if (o.inner) return `<g transform="translate(${f(q.x)} ${f(q.y)}) scale(${dir} 1)">${g}</g>`
  const moving = o.motion && q.walk !== false
  if (!moving) return body
  const v = q.run ? 40 : 8 // birim/sn, yüzü dönük yöne (lib/street.js: sağa yürüyen kamera yetişecek yerde başlar)
  const t = o.walkSec || 40
  const delay = -(((Math.abs(q.x) * 7) % 450) / 1000)
  return `<g class="fe-go${q.run ? ' fe-run' : ''}" style="--t:${t}s;--dx:${f(dir * v * t)}px;--d:${delay.toFixed(2)}s">${body}</g>`
}

// ---------- öğeler ----------
function dogShape(x, y, c, s = 1) {
  const k = (v) => f(v * s)
  return `<g transform="translate(${f(x)} ${f(y)})"><ellipse cx="0" cy="1" rx="${k(26)}" ry="${k(4)}" fill="#000" opacity=".12"/><rect x="${k(-20)}" y="${k(-32)}" width="${k(36)}" height="${k(16)}" rx="${k(8)}" fill="${c}"/><rect x="${k(-18)}" y="${k(-20)}" width="${k(5)}" height="${k(20)}" rx="${k(2)}" fill="${c}"/><rect x="${k(-8)}" y="${k(-20)}" width="${k(5)}" height="${k(20)}" rx="${k(2)}" fill="${c}"/><rect x="${k(4)}" y="${k(-20)}" width="${k(5)}" height="${k(20)}" rx="${k(2)}" fill="${c}"/><rect x="${k(11)}" y="${k(-20)}" width="${k(5)}" height="${k(20)}" rx="${k(2)}" fill="${c}"/><circle cx="${k(20)}" cy="${k(-38)}" r="${k(10)}" fill="${c}"/><path d="M${k(24)} ${k(-46)}l${k(6)} ${k(10)}l${k(-8)} ${k(-2)}Z" fill="#000" opacity=".25"/><rect x="${k(26)}" y="${k(-38)}" width="${k(8)}" height="${k(6)}" rx="${k(3)}" fill="${c}"/><circle cx="${k(33)}" cy="${k(-37)}" r="${k(1.8)}" fill="#1d1d1f"/><circle cx="${k(22)}" cy="${k(-40)}" r="${k(1.4)}" fill="#1d1d1f"/><path d="M${k(-20)} ${k(-28)}q${k(-10)} ${k(-6)} ${k(-8)} ${k(-16)}" stroke="${c}" stroke-width="${k(4)}" fill="none" stroke-linecap="round"/></g>`
}
const P = {
  cat: (it) => {
    const c = ANIMAL[it.color] ?? col(it.color)
    return `<ellipse cx="0" cy="1" rx="18" ry="3.5" fill="#000" opacity=".14"/><path d="M-12 0Q-16 -26 0 -28Q12 -26 10 0Z" fill="${c}"/><circle cx="2" cy="-34" r="10" fill="${c}"/><path d="M-6 -40L-6 -50L0 -43ZM4 -43L10 -50L11 -39Z" fill="${c}"/><path d="M-11 -2Q-30 -4 -26 -22" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="5" cy="-35" r="1.5" fill="#1d1d1f"/>`
  },
  dog: (it) => dogShape(0, 0, ANIMAL[it.color] ?? col(it.color)),
  bike: (it) => {
    const c = col(it.color)
    return `<ellipse cx="0" cy="2" rx="34" ry="4" fill="#000" opacity=".12"/><circle cx="-22" cy="-16" r="16" fill="none" stroke="#24292F" stroke-width="3.5"/><circle cx="22" cy="-16" r="16" fill="none" stroke="#24292F" stroke-width="3.5"/><path d="M-22 -16L-4 -40L16 -40L22 -16M-4 -40L0 -16L16 -40M-22 -16L0 -16" stroke="${c}" stroke-width="4.5" fill="none" stroke-linejoin="round"/><path d="M16 -40L18 -50L26 -50" stroke="#24292F" stroke-width="3" fill="none"/><rect x="-12" y="-47" width="16" height="5" rx="2.5" fill="#24292F"/>`
  },
  scooter: (it) => `<ellipse cx="0" cy="2" rx="24" ry="3" fill="#000" opacity=".12"/><circle cx="-16" cy="-6" r="6" fill="#24292F"/><circle cx="16" cy="-6" r="6" fill="#24292F"/><rect x="-18" y="-12" width="30" height="5" rx="2" fill="${col(it.color)}"/><path d="M14 -10L18 -54" stroke="${col(it.color)}" stroke-width="4" stroke-linecap="round"/><path d="M10 -54L26 -54" stroke="#24292F" stroke-width="4" stroke-linecap="round"/>`,
  pot: (it) => `<path d="M-12 -18L12 -18L9 0L-9 0Z" fill="#B5603A"/><path d="M0 -18L-6 -30M0 -18L6 -32M0 -18L0 -34" stroke="#2E7D4F" stroke-width="2.5"/><circle cx="-7" cy="-33" r="5" fill="${col(it.color)}"/><circle cx="7" cy="-35" r="5" fill="${col(it.color)}"/><circle cx="0" cy="-38" r="5" fill="${col(it.color)}"/>`,
  bin: (it) => `<ellipse cx="0" cy="1" rx="16" ry="3" fill="#000" opacity=".12"/><path d="M-13 -40L13 -40L11 0L-11 0Z" fill="${col(it.color)}"/><rect x="-15" y="-46" width="30" height="7" rx="2" fill="${col(it.color)}"/><rect x="-15" y="-46" width="30" height="7" rx="2" fill="#000" opacity=".18"/><path d="M-5 -32V-8M5 -32V-8" stroke="#000" stroke-width="2" opacity=".15"/>`,
  aboard: (it) => `<path d="M-16 0L-8 -56L8 -56L16 0" stroke="#5B4636" stroke-width="3" fill="none"/><path d="M-13 -6L-7 -52L7 -52L13 -6Z" fill="${col(it.color)}"/><rect x="-7" y="-40" width="14" height="3" fill="#fff" opacity=".8"/><rect x="-8" y="-30" width="16" height="3" fill="#fff" opacity=".8"/><rect x="-6" y="-20" width="12" height="3" fill="#fff" opacity=".8"/>`,
  ball: (it) => `<ellipse cx="0" cy="1" rx="11" ry="2.5" fill="#000" opacity=".14"/><circle cx="0" cy="-11" r="11" fill="${col(it.color)}"/><path d="M-11 -11Q0 -4 11 -11" stroke="#fff" stroke-width="2" fill="none"/>`,
  suitcase: (it) => `<ellipse cx="0" cy="1" rx="16" ry="3" fill="#000" opacity=".12"/><rect x="-14" y="-40" width="28" height="38" rx="5" fill="${col(it.color)}"/><path d="M-6 -40V-50H6V-40" stroke="#2A2E33" stroke-width="2.5" fill="none"/><circle cx="-8" cy="0" r="3" fill="#2A2E33"/><circle cx="8" cy="0" r="3" fill="#2A2E33"/><rect x="-14" y="-24" width="28" height="3" fill="#000" opacity=".15"/>`,
  stroller: (it) => `<ellipse cx="0" cy="2" rx="26" ry="3.5" fill="#000" opacity=".12"/><circle cx="-14" cy="-7" r="7" fill="#24292F"/><circle cx="14" cy="-7" r="7" fill="#24292F"/><path d="M-22 -18Q-22 -46 4 -46L4 -18Z" fill="${col(it.color)}"/><rect x="-22" y="-20" width="38" height="8" rx="3" fill="${col(it.color)}"/><path d="M16 -18L24 -50L30 -50" stroke="#24292F" stroke-width="3" fill="none"/>`,
  pigeon: () => `<ellipse cx="0" cy="1" rx="10" ry="2" fill="#000" opacity=".12"/><ellipse cx="0" cy="-9" rx="11" ry="7" fill="#8E949C"/><circle cx="9" cy="-16" r="5" fill="#7D838B"/><path d="M13 -16l5 1l-5 2Z" fill="#E0A92E"/><path d="M-11 -9l-6 -3l1 6Z" fill="#6E747C"/><path d="M-2 -2V1M2 -2V1" stroke="#C9655A" stroke-width="1.5"/>`,
  crate: (it) => `<rect x="-22" y="-30" width="44" height="30" rx="2" fill="${col(it.color)}"/><path d="M-22 -20H22M-22 -10H22" stroke="#000" stroke-width="2" opacity=".18"/><rect x="-22" y="-30" width="44" height="4" fill="#000" opacity=".15"/>`,
  basket: () => `<path d="M-18 -22L18 -22L14 0L-14 0Z" fill="#C9A26E"/><path d="M-16 -14H16M-15 -7H15" stroke="#9C7650" stroke-width="2"/><path d="M-12 -22Q0 -40 12 -22" stroke="#9C7650" stroke-width="3" fill="none"/>`,
  bucket: (it) => `<path d="M-12 -22L12 -22L10 0L-10 0Z" fill="#9AA0A6"/><path d="M-4 -22L-8 -34M2 -22L4 -38M6 -22L10 -32" stroke="#2E7D4F" stroke-width="2"/><circle cx="-8" cy="-36" r="5" fill="${col(it.color)}"/><circle cx="4" cy="-40" r="5" fill="${col(it.color)}"/><circle cx="10" cy="-34" r="5" fill="${col(it.color)}"/>`,
  cone: () => `<rect x="-12" y="-4" width="24" height="4" rx="1" fill="#E06A2A"/><path d="M-8 -4L-2 -34L2 -34L8 -4Z" fill="#F28C38"/><path d="M-6 -14L6 -14L5 -20L-5 -20Z" fill="#fff"/>`,
  bench: (it) => bench(0, 0, col(it.color || 'kahve')),
  hydrant: (it) => `<rect x="-8" y="-32" width="16" height="30" rx="4" fill="${col(it.color)}"/><path d="M-9 -32Q0 -44 9 -32Z" fill="${col(it.color)}"/><rect x="-13" y="-24" width="26" height="6" rx="3" fill="${col(it.color)}"/><rect x="-10" y="-4" width="20" height="4" fill="#000" opacity=".25"/>`,
  chair: (it) => `<rect x="-12" y="-48" width="4" height="48" fill="${col(it.color)}"/><rect x="-12" y="-48" width="20" height="4" fill="${col(it.color)}"/><rect x="-12" y="-24" width="26" height="5" rx="2" fill="${col(it.color)}"/><rect x="10" y="-22" width="4" height="22" fill="${col(it.color)}"/>`,
  watermelon: () => `<ellipse cx="0" cy="1" rx="18" ry="3" fill="#000" opacity=".12"/><ellipse cx="0" cy="-12" rx="18" ry="13" fill="#2E7D4F"/><path d="M-12 -20Q-4 -24 4 -22M-14 -10Q0 -16 14 -8" stroke="#7FB24E" stroke-width="2.5" fill="none"/>`,
}
export const ITEM_TYPES = Object.keys(P)
const VENDOR_GOODS = {
  simit: (x, y) => [0, 1, 2, 3].map((i) => `<circle cx="${x - 24 + i * 16}" cy="${y - 62}" r="7" fill="none" stroke="#B9762F" stroke-width="5"/>`).join(''),
  misir: (x, y) => [0, 1, 2, 3, 4].map((i) => `<rect x="${x - 28 + i * 12}" y="${y - 74}" width="8" height="20" rx="4" fill="#F2C94C"/>`).join(''),
  kestane: (x, y) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${x - 24 + (i % 4) * 16}" cy="${y - 62 + Math.floor(i / 4) * 7}" r="5.5" fill="#7A4A2A"/>`).join(''),
  cicek: (x, y) => ['#E0474C', '#F3BF3A', '#8A66E6', '#EE8735', '#F1B9C8'].map((c, i) => `<circle cx="${x - 28 + i * 14}" cy="${y - 64}" r="7" fill="${c}"/>`).join(''),
}
// Satıcı arabası + satıcı (şemsiye tepesi ayaktan 148 birim: tabelanın altında)
function vendor(v, p, o) {
  const x = 0
  const y = 0
  const cart = `<ellipse cx="${x}" cy="${y + 2}" rx="46" ry="5" fill="#000" opacity=".14"/><path d="M${x - 2} ${y - 56}L${x - 2} ${y - 128}" stroke="#8A8F95" stroke-width="3"/><path d="M${x - 56} ${y - 120}Q${x - 2} ${y - 148} ${x + 52} ${y - 120}Z" fill="#E0474C"/><path d="M${x - 28} ${y - 128}Q${x - 2} ${y - 148} ${x + 24} ${y - 128}L${x + 10} ${y - 120}L${x - 14} ${y - 120}Z" fill="#fff" opacity=".45"/><rect x="${x - 40}" y="${y - 56}" width="80" height="34" rx="4" fill="#B8332F"/><rect x="${x - 40}" y="${y - 56}" width="80" height="6" fill="#000" opacity=".18"/>${VENDOR_GOODS[v.type]?.(x, y) ?? ''}<circle cx="${x - 24}" cy="${y - 10}" r="11" fill="#24292F"/><circle cx="${x + 24}" cy="${y - 10}" r="11" fill="#24292F"/><circle cx="${x - 24}" cy="${y - 10}" r="4" fill="#9AA0A6"/><circle cx="${x + 24}" cy="${y - 10}" r="4" fill="#9AA0A6"/>`
  return `<g transform="translate(${f(v.x)} ${f(v.y)})">${cart}</g>` + person({ x: v.x + 60, y: v.y - 4, s: 0.98, top: 'beyaz', skin: SKIN[2], hair: 'gri', dir: -1, hat: v.hat || null, walk: false }, p, o)
}
export function item(it, p = PAL.day, o = {}) {
  if (it.type === 'person') return person(it, p, o)
  if (it.type === 'vendor') return vendor(it, p, o)
  const draw = P[it.type]
  if (!draw) return ''
  return `<g transform="translate(${f(it.x)} ${f(it.y)}) scale(${it.dir || 1} 1)">${draw(it)}</g>`
}
// Araba: lane 'far' (sola akar) ya da 'near' (sağa akar). drive: { t: sn, dx: birim } verilirse kendi hızıyla akar.
export function car(k, p = PAL.day, o = {}) {
  const lane = k.lane === 'far' ? 'far' : 'near'
  const dir = lane === 'far' ? -1 : 1
  const y = LANES[lane]
  const c = k.taxi ? COLORS.sari.hex : col(k.color)
  const wheel = (wx) => `<g class="fe-wheel"><circle cx="${wx}" cy="-12" r="17" fill="#1C1E21"/><circle cx="${wx}" cy="-12" r="8" fill="#A9AFB6"/><rect x="${wx - 1.5}" y="-20" width="3" height="16" fill="#5D646C"/></g>`
  let g = `<ellipse cx="0" cy="2" rx="86" ry="8" fill="#000" opacity=".22"/><path d="M-84 -14Q-86 -34 -70 -38L-46 -42Q-30 -66 -6 -68L30 -68Q46 -66 58 -44L76 -40Q88 -36 86 -14Z" fill="${c}"/><path d="M-84 -26L86 -26L86 -14L-84 -14Z" fill="#000" opacity=".12"/>`
  g += `<path d="M-38 -44Q-26 -62 -8 -62L-8 -44Z" fill="url(#fe-${o.m || 'day'}-glass)"/><path d="M-2 -62L28 -62Q40 -60 50 -44L-2 -44Z" fill="url(#fe-${o.m || 'day'}-glass)"/><rect x="-6" y="-44" width="2" height="30" fill="#000" opacity=".18"/>`
  g += `<rect x="80" y="-34" width="7" height="6" rx="2" fill="${p.glow ? '#FFF2C4' : '#F4E7BE'}"/><rect x="-86" y="-32" width="6" height="6" rx="2" fill="#C8333A"/>`
  if (k.taxi) g += `<rect x="-14" y="-80" width="30" height="12" rx="3" fill="#24292F"/><text x="1" y="-71" transform="scale(${dir} 1)" text-anchor="middle" font-size="8" font-weight="800" fill="${COLORS.sari.hex}" font-family="Onest, system-ui">TAKSİ</text><rect x="-60" y="-24" width="120" height="5" fill="#24292F" opacity=".75"/>`
  g += wheel(-52) + wheel(54)
  const body = `<g transform="translate(${f(k.x)} ${y}) scale(${dir * 1.05} 1.05)">${g}</g>`
  if (!o.motion || !k.v) return body
  const t = o.walkSec || 40
  return `<g class="fe-drive" style="--t:${t}s;--dx:${f(dir * k.v * t)}px">${body}</g>`
}

// ---------- sahne ----------
const byDepth = (a, b) => a.y - b.y || a.x - b.x
// model: backdrop(...) + { people, cars, cats, bikes, vendors, items }
// opts: { vx, vy, vw, vh, mode, motion, walkSec, label, spot: { x, y, rx, ry } }
export function renderScene(model, opts = {}) {
  const sc = SCENES[model.scene] ?? SCENES.cadde
  const m = opts.mode ?? sc.mode
  const p = PAL[m] ?? PAL.day
  const L = model.L
  const r = rng(7)
  const vx = opts.vx ?? 0
  const vy = opts.vy ?? 0
  const vw = opts.vw ?? L
  const vh = opts.vh ?? H
  const o = { motion: Boolean(opts.motion), walkSec: opts.walkSec, m }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="${opts.label ?? 'Sahne'}">`
  if (o.motion) s += MOTION_CSS
  s += defs(p, m)
  // Görünüm dışı çizilmez (PLAN §8: uzun SVG): yatayda kırpımın 120 birim ötesi, dikeyde görünür katlar
  const seen = (x0, x1) => x1 >= vx - 120 && x0 <= vx + vw + 120
  const sky = clouds(L, r, p) + skyline(L, r, p)
  s += `<rect width="${L}" height="${H}" fill="url(#fe-${m}-sky)"/>` + (vy < Y.side - SHOP_H - 20 ? sky : '') + `<rect width="${L}" height="${Y.side}" fill="${p.sky[1]}" opacity="${p.haze}"/>`
  if (sc.kind === 'street') {
    for (const b of model.buildings) {
      const out = building(b, p, r, m, vy)
      if (seen(b.x, b.x + b.w)) s += out
    }
    s += `<rect width="${L}" height="${Y.side}" fill="url(#fe-${m}-sun)"/>` + ground(L, p, m, sc.weather === 'yagmur')
    s += `<rect y="${Y.side}" width="${L}" height="16" fill="#000" opacity=".07"/>`
    for (const t of model.trees) if (seen(t.x - 70, t.x + 70)) s += tree(t, p)
    for (const l of model.lamps) if (seen(l.x - 70, l.x + 100)) s += lamp(l, p, m)
  } else if (sc.kind === 'market') {
    s += backRow(model.back, p, r, m, Y.side - 220)
    s += `<rect y="${Y.side}" width="${L}" height="${H - Y.side}" fill="${p.sideA}"/>`
    for (let gx = 0; gx < L; gx += 56) s += `<rect x="${gx}" y="${Y.side}" width="1.5" height="${H - Y.side}" fill="${p.tile}"/>`
    for (let gy = Y.side + 40; gy < H; gy += 40) s += `<rect y="${gy}" width="${L}" height="1.5" fill="${p.tile}"/>`
    s += `<path d="M0 340Q${L / 4} 368 ${L / 2} 340T${L} 340" stroke="#555" stroke-width="2" fill="none"/>`
    for (let fx = 20; fx < L; fx += 40) s += `<path d="M${fx} ${f(338 + Math.sin((fx / L) * Math.PI * 4) * 6)}l20 0l-10 18Z" fill="${col(['kirmizi', 'sari', 'mavi', 'yesil', 'turuncu'][Math.floor(fx / 40) % 5])}"/>`
    for (const st of model.stalls) s += stallBack(st)
    for (const v of model.stallVendors ?? []) s += person({ ...v, walk: false }, p, o)
    for (const st of model.stalls) s += stallFront(st)
  } else {
    s += backRow(model.back, p, r, m, Y.side - 140)
    for (const t of model.trees) s += parkTree(t, p)
    s += `<path d="M0 470Q${L * 0.25} 440 ${L * 0.5} 470T${L} 466L${L} ${H}L0 ${H}Z" fill="${p.grass[0]}"/>`
    s += `<path d="M0 ${Y.side - 20}Q${L * 0.3} ${Y.side - 50} ${L * 0.6} ${Y.side - 20}T${L} ${Y.side - 26}L${L} ${H}L0 ${H}Z" fill="${p.grass[1]}"/>`
    s += `<rect y="${Y.side + 20}" width="${L}" height="${Y.road + 20 - Y.side - 20}" fill="${p.path}"/><rect y="${Y.side + 18}" width="${L}" height="4" fill="#000" opacity=".06"/>`
    s += `<rect y="${Y.road + 20}" width="${L}" height="${H - Y.road - 20}" fill="${p.grass[2]}"/>`
    for (const b of model.benches) s += bench(b.x, Y.side + 14)
    for (const l of model.lamps) s += lamp(l, p, m, Y.side + 14)
  }
  const crowd = []
  for (const q of model.people ?? []) crowd.push({ ...q, type: 'person' })
  for (const c of model.cats ?? []) crowd.push({ type: 'cat', y: ROWS[1], ...c })
  for (const b of model.bikes ?? []) crowd.push({ type: 'bike', y: ROWS[0], ...b })
  for (const v of model.vendors ?? []) crowd.push({ type: 'vendor', y: ROWS[0] + 4, ...v })
  for (const it of model.items ?? []) crowd.push(it)
  crowd.sort(byDepth)
  // yürüyen kişi ve akan araba kırpım dışından girebilir: hareketliyken yatay ayıklama yok
  for (const it of crowd) if (o.motion || seen(it.x - 160, it.x + 160)) s += item(it, p, o)
  for (const k of (model.cars ?? []).filter((c) => c.lane === 'far')) if (o.motion || seen(k.x - 100, k.x + 100)) s += car(k, p, o)
  for (const k of (model.cars ?? []).filter((c) => c.lane !== 'far')) if (o.motion || seen(k.x - 100, k.x + 100)) s += car(k, p, o)
  if (sc.weather === 'yagmur') {
    let rain = ''
    for (let x = vx - 40; x < vx + vw + 40; x += 23) for (let y = vy - 40; y < vy + vh; y += 70) rain += `<path d="M${x + ((y * 7) % 19)} ${y}l-6 22" stroke="#fff" stroke-width="1.6" opacity=".45"/>`
    s += `<g class="fe-rain">${rain}</g>`
  }
  if (opts.spot) {
    const t = opts.spot
    s += `<ellipse cx="${t.x}" cy="${t.y}" rx="${t.rx}" ry="${t.ry}" fill="none" stroke="#19C2D1" stroke-width="4"/>`
  }
  return s + '</svg>'
}
