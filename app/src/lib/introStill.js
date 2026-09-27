// Giriş ekranı (components/IntroFilm.jsx; Artifact "Nefona Giriş Ekranı", onaylı 2026-09-27): HAREKETSİZ tek kare.
// Eski 15 sn'lik film kaldırıldı (sahibi: "amatör"). Filmin öğeleri tek karede: gece göğünde Pegasus; yıldızlardan
// yalnız biri (Enif) net ve altın odak köşelerinde ("fark et" anı); alttan iris ufuk gibi doğar, göz bebeğinin
// karanlığında "Başla". Yazılar DOM'da (çevrilebilir); "Başla" göz bebeği merkezinde (PUPIL_Y). Canvas 2D, prosedürel: ağ yok, görsel dosyası yok.
// Sağlık iddiası yok.

const TAU = Math.PI * 2
const hash = (i, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const TEAL = [25, 194, 209]
const BLUE = [62, 123, 250]
const GOLD = [255, 177, 59]
const INK = [234, 242, 246]
const PALE = [150, 232, 240]

// Göz bebeği merkezi ekran yüksekliğinin bu oranında: "Başla" düğmesi buraya ortalanır (styles/intro.css).
export const PUPIL_Y = 0.902

// Pegasus (RA saat, Dec derece; RA 0 ≈ 24): büyük kare + boyun + ön bacaklar. [ad, RA, Dec, parlaklık 0–1]
export const PEGASUS = [
  ['Alpheratz', 24.14, 29.1, 1], ['Scheat', 23.06, 28.1, 1], ['Markab', 23.08, 15.2, 1], ['Algenib', 24.22, 15.2, 0.9],
  ['Homam', 22.69, 10.8, 0.7], ['Biham', 22.17, 6.2, 0.6], ['Enif', 21.74, 9.9, 1],
  ['Matar', 22.72, 30.2, 0.8], ['π', 22.17, 33.2, 0.5], ['μ', 22.83, 24.6, 0.6], ['λ', 22.78, 23.6, 0.6], ['ι', 22.12, 25.3, 0.6], ['κ', 21.74, 25.6, 0.5],
]
const IDX = Object.fromEntries(PEGASUS.map((p, i) => [p[0], i]))
export const PEGASUS_LINES = [
  ['Alpheratz', 'Scheat'], ['Scheat', 'Markab'], ['Markab', 'Algenib'], ['Algenib', 'Alpheratz'], ['Markab', 'Homam'], ['Homam', 'Biham'],
  ['Biham', 'Enif'], ['Scheat', 'μ'], ['μ', 'λ'], ['λ', 'ι'], ['ι', 'κ'], ['Scheat', 'Matar'], ['Matar', 'π'],
].map(([a, b]) => [IDX[a], IDX[b]])

// Gökyüzü izdüşümü: doğu solda (RA artarken x azalır); en uzun kenar 1 birim, merkez 0
export function pegasusXY() {
  const pts = PEGASUS.map(([, ra, dec]) => [-(ra - 23.0) * 15 * Math.cos((dec * Math.PI) / 180), -dec])
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2
  const my = (Math.min(...ys) + Math.max(...ys)) / 2
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  return pts.map((p) => [(p[0] - mx) / span, (p[1] - my) / span])
}

const FIELD = Array.from({ length: 170 }, (_, i) => ({
  x: hash(i, 21) * 2 - 1, y: hash(i, 22) * 2 - 1, d: 0.3 + hash(i, 23) * 0.7, m: Math.pow(hash(i, 24), 3), tw: hash(i, 25) * TAU, warm: hash(i, 26) < 0.14,
}))

// İris dokusu (bir kez, ekran dışı). S: doku kenarı (px); 3x ekranda yumuşamasın diye 2048.
function irisTexture(doc, S = 2048) {
  const c = doc.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const k = S / 1024 // çizgi kalınlıkları 1024'e göre ayarlandı
  const R = S * 0.48
  g.translate(S / 2, S / 2)
  let gr = g.createRadialGradient(0, 0, R * 0.25, 0, 0, R)
  gr.addColorStop(0, '#05141a'); gr.addColorStop(0.3, '#0d3a3f'); gr.addColorStop(0.5, '#127b86'); gr.addColorStop(0.72, '#155fa0'); gr.addColorStop(0.9, '#0b2450'); gr.addColorStop(1, 'rgba(3,8,20,0)')
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
  // sıcak iç halka (yaka çevresi)
  gr = g.createRadialGradient(0, 0, R * 0.28, 0, 0, R * 0.56)
  gr.addColorStop(0, 'rgba(255,177,59,0.55)'); gr.addColorStop(0.55, 'rgba(210,140,40,0.22)'); gr.addColorStop(1, 'rgba(255,177,59,0)')
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R * 0.56, 0, TAU); g.fill()
  // lifler
  g.globalCompositeOperation = 'lighter'
  const cols = [TEAL, PALE, BLUE, [120, 170, 255], [255, 200, 120]]
  for (let i = 0; i < 3400; i++) {
    const a = hash(i, 1) * TAU
    const r0 = R * (0.29 + hash(i, 2) * 0.08)
    const r1 = R * (0.62 + hash(i, 3) * 0.36)
    const bend = (hash(i, 4) - 0.5) * 0.09
    const col = cols[Math.floor(hash(i, 5) * (hash(i, 6) < 0.12 ? 5 : 4))]
    const warm = r1 < R * 0.7 && hash(i, 7) < 0.35
    g.strokeStyle = rgba(warm ? GOLD : col, 0.05 + hash(i, 8) * 0.16)
    g.lineWidth = (0.6 + hash(i, 9) * 1.8) * k
    const am = a + bend
    const rm = (r0 + r1) / 2
    g.beginPath()
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0)
    g.quadraticCurveTo(Math.cos(am) * rm, Math.sin(am) * rm, Math.cos(a + bend * 0.4) * r1, Math.sin(a + bend * 0.4) * r1)
    g.stroke()
  }
  g.globalCompositeOperation = 'source-over'
  // yaka çizgisi: dalgalı, yumuşak altın halka
  g.strokeStyle = 'rgba(255,196,110,0.22)'; g.lineWidth = 5 * k; g.shadowColor = 'rgba(255,177,59,0.6)'; g.shadowBlur = 14 * k
  g.beginPath()
  for (let j = 0; j <= 240; j++) {
    const a = (j / 240) * TAU
    const r = R * (0.45 + 0.025 * Math.sin(a * 13) + 0.015 * Math.sin(a * 29 + 1.3))
    if (j) g.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    else g.moveTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  g.closePath(); g.stroke(); g.shadowBlur = 0
  // kriptler: bulanık, belli belirsiz
  g.filter = `blur(${3 * k}px)`
  for (let i = 0; i < 70; i++) {
    const a = hash(i, 11) * TAU
    const r = R * (0.5 + hash(i, 12) * 0.3)
    g.save(); g.translate(Math.cos(a) * r, Math.sin(a) * r); g.rotate(a)
    g.fillStyle = `rgba(0,10,20,${0.08 + hash(i, 13) * 0.14})`
    g.beginPath(); g.ellipse(0, 0, R * (0.02 + hash(i, 14) * 0.035), R * (0.01 + hash(i, 15) * 0.012), 0, 0, TAU); g.fill(); g.restore()
  }
  g.filter = 'none'
  // limbus: dış koyu halka
  gr = g.createRadialGradient(0, 0, R * 0.8, 0, 0, R)
  gr.addColorStop(0, 'rgba(2,6,16,0)'); gr.addColorStop(0.75, 'rgba(2,6,16,0.75)'); gr.addColorStop(1, 'rgba(2,6,16,0)')
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
  return { c, R: R / S }
}

function star(g, x, y, r, blur, a, col) {
  if (a <= 0.004) return
  const rr = r + blur * 16
  const gr = g.createRadialGradient(x, y, 0, x, y, rr)
  const core = a * (1 - blur * 0.55)
  gr.addColorStop(0, rgba(col, core)); gr.addColorStop(blur > 0.5 ? 0.55 : 0.18, rgba(col, core * (0.3 + blur * 0.4))); gr.addColorStop(1, rgba(col, 0))
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill()
  if (blur < 0.3) { g.fillStyle = rgba(INK, a * (1 - blur * 3)); g.beginPath(); g.arc(x, y, Math.max(0.6, r * 0.45), 0, TAU); g.fill() }
}

function brackets(g, x, y, size, a, u) {
  const L = size * 0.32
  g.strokeStyle = rgba(GOLD, a); g.lineWidth = 1.6 * u; g.lineCap = 'round'; g.shadowColor = rgba(GOLD, a * 0.8); g.shadowBlur = 8 * u
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cx = x + sx * size
    const cy = y + sy * size
    g.beginPath(); g.moveTo(cx - sx * L, cy); g.lineTo(cx, cy); g.lineTo(cx, cy - sy * L); g.stroke()
  }
  g.shadowBlur = 0
}

// Tek kare. W, H: cihaz pikseli. Tuvalde yazı YOK (çeviri): "Nefona", alt yazı ve "Başla" DOM'da (IntroFilm.jsx, intro.css).
export function createIntroStill(doc = document) {
  const IRIS = irisTexture(doc)
  const PEG = pegasusXY()
  function draw(g, W, H) {
    // u: 390 × 844 tasarımına göre ölçek; geniş ekranda (iPad) yüksekliğe göre sınırlanır
    const u = Math.min(W / 390, H / 844)
    const cx = W / 2
    g.setTransform(1, 0, 0, 1, 0, 0)
    let gr = g.createLinearGradient(0, 0, 0, H)
    gr.addColorStop(0, '#02050a'); gr.addColorStop(0.5, '#050c15'); gr.addColorStop(0.72, '#0a1a26'); gr.addColorStop(1, '#02050a')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    // iris ufku: ölçü ve hale
    const D = Math.min(W * 1.5, H * 0.7)
    const R = D * IRIS.R
    const iy = H * PUPIL_Y
    const hz = g.createRadialGradient(cx, iy, R * 0.9, cx, iy, R * 1.55)
    hz.addColorStop(0, rgba(TEAL, 0.32)); hz.addColorStop(0.35, rgba(GOLD, 0.07)); hz.addColorStop(1, rgba(TEAL, 0))
    g.fillStyle = hz; g.fillRect(0, 0, W, H)
    // yıldız alanı: çoğu net ve sönük, derindekiler yumuşak; irisin arkasında yıldız yok
    for (const s of FIELD) {
      const x = cx + s.x * W * 0.58
      const y = H * 0.3 + s.y * H * 0.32
      if (y > iy - R * 1.02 && Math.hypot(x - cx, y - iy) < R * 1.05) continue
      star(g, x, y, (0.5 + s.m * 1.5) * u, s.d > 0.8 ? 0.35 : 0.08, (0.1 + s.m * 0.55) * (0.5 + 0.5 * Math.sin(s.tw * 7) ** 2), s.warm ? [255, 214, 160] : [200, 225, 255])
    }
    // Pegasus
    const P = Math.min(W * 0.74, H * 0.34)
    const py = H * 0.215
    const pts = PEG.map(([x, y]) => [cx + x * P, py + y * P])
    g.lineCap = 'round'
    for (const [a, b] of PEGASUS_LINES) {
      g.strokeStyle = 'rgba(170,205,230,0.2)'; g.lineWidth = 0.9 * u
      g.beginPath(); g.moveTo(pts[a][0], pts[a][1]); g.lineTo(pts[b][0], pts[b][1]); g.stroke()
    }
    const F = IDX.Enif
    pts.forEach(([x, y], i) => { if (i !== F) star(g, x, y, (1.2 + PEGASUS[i][3] * 1.8) * u, 0.28, 0.75, [210, 230, 255]) })
    // fark edilen yıldız: net, sıcak, altın odak köşeleri
    const [fx, fy] = pts[F]
    const fg = g.createRadialGradient(fx, fy, 0, fx, fy, 40 * u)
    fg.addColorStop(0, rgba(GOLD, 0.3)); fg.addColorStop(1, rgba(GOLD, 0))
    g.fillStyle = fg; g.beginPath(); g.arc(fx, fy, 40 * u, 0, TAU); g.fill()
    star(g, fx, fy, 3.2 * u, 0, 1, [255, 236, 200])
    g.strokeStyle = 'rgba(255,240,210,0.55)'; g.lineWidth = 0.8 * u
    g.beginPath(); g.moveTo(fx - 11 * u, fy); g.lineTo(fx + 11 * u, fy); g.moveTo(fx, fy - 11 * u); g.lineTo(fx, fy + 11 * u); g.stroke()
    brackets(g, fx, fy, 19 * u, 0.95, u)
    // iris (göz bebeği geniş; yansıma hafif)
    g.save(); g.globalAlpha = 0.92; g.translate(cx, iy); g.rotate(-0.5)
    g.drawImage(IRIS.c, -D / 2, -D / 2, D, D); g.restore()
    const pr = R * 0.335 * 1.4
    const pg = g.createRadialGradient(cx, iy, pr * 0.75, cx, iy, pr * 1.12)
    pg.addColorStop(0, '#000'); pg.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = pg; g.beginPath(); g.arc(cx, iy, pr * 1.12, 0, TAU); g.fill()
    g.save(); g.translate(cx - R * 0.36, iy - R * 0.38); g.rotate(-0.3)
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.16)
    rg.addColorStop(0, 'rgba(255,255,255,0.16)'); rg.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = rg; g.beginPath(); g.ellipse(0, 0, R * 0.16, R * 0.1, 0, 0, TAU); g.fill(); g.restore()
    // iris gölgesi: kenarlar ve ekran altı sakinleşir
    const sh = g.createRadialGradient(cx, iy - R * 0.1, R * 0.35, cx, iy, R * 1.05)
    sh.addColorStop(0, 'rgba(2,5,10,0)'); sh.addColorStop(0.6, 'rgba(2,5,10,0.18)'); sh.addColorStop(1, 'rgba(2,5,10,0.55)')
    g.fillStyle = sh; g.beginPath(); g.arc(cx, iy, R, 0, TAU); g.fill()
    const lo = g.createLinearGradient(0, H * 0.9, 0, H)
    lo.addColorStop(0, 'rgba(2,5,10,0)'); lo.addColorStop(1, 'rgba(2,5,10,0.55)')
    g.fillStyle = lo; g.fillRect(0, H * 0.9, W, H * 0.1)
    // ufuk çizgisi
    g.save(); g.strokeStyle = rgba(PALE, 0.35); g.lineWidth = 1.2 * u; g.shadowColor = rgba(TEAL, 0.9); g.shadowBlur = 18 * u
    g.beginPath(); g.arc(cx, iy, R * 0.985, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.restore()
  }
  return { draw }
}
