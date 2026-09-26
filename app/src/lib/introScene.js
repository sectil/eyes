// Giriş filmi sahnesi (components/IntroFilm.jsx; Artifact "Giriş Filmi Taslağı", onaylı). Canvas 2D, prosedürel:
// ağ yok, ses yok, görsel dosya yok. draw(t) zamanın saf fonksiyonu: ileri/geri sarılabilir, "Atla" son kareye gider;
// t > 15 sn son kare canlı kalır (kanat, halka). Akış: iris yakın çekim → göz bebeğinden dalış (bulanık → net) →
// gözlüğü çıkarır (anamorfik parlama) → yatay kaydırma → şafak koşusu; kedi, patlak lastik, çiçekte zaman yavaşlar,
// altın odak köşeleri kapanır → ışık sızıntısı → çocukluk: bulut ata dönüşür → gece: takımyıldızı Pegasus, çocuğun
// ışığı ata biner, kanatlanır, uçar → iris kapanır; halkanın içinde Pegasus. Sağlık iddiası yok; gözlük "kötü" değil.

export const FILM_SEC = 15
const TAU = Math.PI * 2

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, k) => a + (b - a) * k
const sm = (a, b, t) => {
  const k = clamp((t - a) / (b - a))
  return k * k * (3 - 2 * k)
}
const inOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
const outC = (k) => 1 - Math.pow(1 - k, 3)
const inC = (k) => k * k * k
const bump = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t))
const hash = (i, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

const INK = [5, 8, 14]
const BG = [6, 10, 18]
const TEAL = [25, 194, 209]
const BLUE = [62, 123, 250]
const GOLD = [255, 177, 59]
const SUN = [255, 214, 140]

// --- Zaman eğrisi: fark etme anlarında dünya yavaşlar ---
export const NOTICE = { cat: 4.6, tire: 6.9, flower: 9.15 }
const slowAt = (t) => {
  let s = 1
  for (const tn of Object.values(NOTICE)) s = Math.min(s, 1 - 0.82 * bump(t, tn - 0.5, tn - 0.12, tn + 0.35, tn + 0.8))
  return s
}
const DT = 1 / 240
const TABLE = (() => {
  const out = [0]
  let acc = 0
  for (let i = 1; i <= 17 * 240; i++) {
    acc += slowAt((i - 0.5) * DT) * DT
    out.push(acc)
  }
  return out
})()
const X = (t) => {
  const f = clamp(t, 0, 16.9) / DT
  const i = Math.floor(f)
  return lerp(TABLE[i], TABLE[i + 1], f - i)
}
const RUN0 = 3.0
const Xb = (t) => X(t) - X(RUN0)

// --- Figür (profil siluet): açılar aşağıdan ölçülür, + = ileri (sağ) ---
// Parçalar TEK renkte, opak çizilir (birleşik siluet); renk ve kenar ışığı sonradan maske üzerinden verilir.
const dir = (a) => [Math.sin(a), Math.cos(a)]
const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k]
function limb(ctx, a, b, w1, w2) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  ctx.beginPath()
  ctx.moveTo(a[0] + nx * w1, a[1] + ny * w1)
  ctx.lineTo(b[0] + nx * w2, b[1] + ny * w2)
  ctx.lineTo(b[0] - nx * w2, b[1] - ny * w2)
  ctx.lineTo(a[0] - nx * w1, a[1] - ny * w1)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(a[0], a[1], w1, 0, TAU)
  ctx.arc(b[0], b[1], w2, 0, TAU)
  ctx.fill()
}
function oval(ctx, c, rx, ry, rot) {
  ctx.beginPath()
  ctx.ellipse(c[0], c[1], rx, ry, rot, 0, TAU)
  ctx.fill()
}
// p: { h, head (boy/baş), lean, tilt, toe, legs:[[uyluk, diz]×2 (uzak, yakın)], arms:[[kol, dirsek]×2] }
function skeleton(p) {
  const L = p.h / (p.head ?? 7.5)
  const up = [Math.sin(p.lean), -Math.cos(p.lean)]
  const hip = [0, 0]
  const sh = add(hip, up, 2.7 * L)
  const nk = add(sh, up, 0.38 * L)
  const ha = p.lean + (p.tilt ?? 0)
  const hd = add(nk, [Math.sin(ha), -Math.cos(ha)], 0.5 * L)
  const legs = p.legs.map(([th, kn]) => {
    const k = add(hip, dir(th), 2.0 * L)
    const sa = th - kn
    const an = add(k, dir(sa), 1.95 * L)
    const fa = sa + Math.PI / 2 - (p.toe ?? 0)
    const toe = add(an, dir(fa), 0.6 * L)
    const heel = add(an, dir(fa), -0.12 * L)
    return { k, an, toe, heel }
  })
  const arms = p.arms.map(([ar, el]) => {
    const e = add(sh, dir(ar), 1.35 * L)
    const w = add(e, dir(ar + el), 1.18 * L)
    const hand = add(w, dir(ar + el), 0.2 * L)
    return { e, w, hand }
  })
  return { L, hip, sh, nk, hd, ha, up, legs, arms, lean: p.lean }
}
function drawLeg(ctx, s, g) {
  const { L, hip } = s
  limb(ctx, hip, g.k, 0.5 * L, 0.33 * L)
  const calf = [lerp(g.k[0], g.an[0], 0.35), lerp(g.k[1], g.an[1], 0.35)]
  limb(ctx, g.k, calf, 0.33 * L, 0.3 * L)
  limb(ctx, calf, g.an, 0.3 * L, 0.16 * L)
  limb(ctx, g.heel, g.toe, 0.17 * L, 0.09 * L)
}
function drawArm(ctx, s, a) {
  const { L, sh } = s
  limb(ctx, sh, a.e, 0.24 * L, 0.18 * L)
  limb(ctx, a.e, a.w, 0.18 * L, 0.12 * L)
  oval(ctx, a.hand, 0.16 * L, 0.13 * L, 0)
}
function drawFigure(ctx, s) {
  const { L, hip, sh, nk, hd, ha, up, legs, arms } = s
  drawArm(ctx, s, arms[0])
  drawLeg(ctx, s, legs[0])
  // gövde: leğen + bel + göğüs kafesi
  const rot = Math.atan2(up[1], up[0]) + Math.PI / 2
  oval(ctx, add(hip, up, 0.15 * L), 0.55 * L, 0.62 * L, rot)
  limb(ctx, hip, sh, 0.46 * L, 0.5 * L)
  const chest = add(add(hip, up, 1.95 * L), [up[1] * -1, -up[0] * -1], 0.1 * L)
  oval(ctx, chest, 0.6 * L, 0.95 * L, rot)
  limb(ctx, sh, nk, 0.2 * L, 0.19 * L)
  // baş: kafatası + çene + burun + ense
  ctx.save()
  ctx.translate(hd[0], hd[1])
  ctx.rotate(ha)
  oval(ctx, [0, -0.04 * L], 0.46 * L, 0.5 * L, 0)
  oval(ctx, [0.12 * L, 0.2 * L], 0.33 * L, 0.3 * L, 0.3)
  ctx.beginPath()
  ctx.moveTo(0.38 * L, -0.06 * L)
  ctx.quadraticCurveTo(0.58 * L, 0.06 * L, 0.42 * L, 0.12 * L)
  ctx.fill()
  ctx.restore()
  drawLeg(ctx, s, legs[1])
  drawArm(ctx, s, arms[1])
}
function runPose(phi, h, tilt = -0.1) {
  const th = (ph) => 0.66 * Math.sin(ph) + 0.05
  const kn = (ph) => 0.2 + 1.45 * Math.pow(Math.max(0, Math.cos(ph - 0.3)), 1.4)
  return {
    h,
    lean: 0.19,
    tilt,
    toe: 0.3,
    legs: [
      [th(phi + Math.PI), kn(phi + Math.PI)],
      [th(phi), kn(phi)],
    ],
    arms: [
      [0.8 * Math.sin(phi) + 0.15, 1.55],
      [0.8 * Math.sin(phi + Math.PI) + 0.15, 1.55],
    ],
  }
}

// --- Yardımcı katmanlar ---
function ridge(x, seed, amp, f = 1) {
  return amp * (0.55 * Math.sin(x * 0.0021 * f + seed) + 0.3 * Math.sin(x * 0.0057 * f + seed * 2.3) + 0.15 * Math.sin(x * 0.013 * f + seed * 4.1))
}
function fillRidge(ctx, W, H, base, off, seed, amp, color, f = 1) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, H)
  for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, base + ridge(x + off, seed, amp, f))
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()
}
function skyGrad(ctx, W, H, top, mid, hor, horY) {
  const g = ctx.createLinearGradient(0, 0, 0, horY)
  g.addColorStop(0, rgba(top))
  g.addColorStop(0.62, rgba(mid))
  g.addColorStop(1, rgba(hor))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}
function glow(ctx, x, y, r, c, a) {
  if (a <= 0 || r <= 0) return
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(c, a))
  g.addColorStop(0.35, rgba(c, a * 0.35))
  g.addColorStop(1, rgba(c, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}
function stars(ctx, W, H, n, a, t, dy = 0, seed = 1) {
  if (a <= 0) return
  for (let i = 0; i < n; i++) {
    const x = hash(i, seed) * W
    const y = ((((hash(i, seed + 1) * H * 0.9 + dy) % (H * 1.2)) + H * 1.2) % (H * 1.2)) - H * 0.1
    const tw = 0.55 + 0.45 * Math.sin(t * (1.3 + hash(i, seed + 2) * 2.4) + i)
    const r = 0.5 + hash(i, seed + 3) * 1.3
    ctx.fillStyle = `rgba(235,242,255,${a * tw * (0.35 + hash(i, seed + 4) * 0.65)})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fill()
  }
}
// Odak köşeleri: dört altın köşe dışarıdan nesneye kapanır, halka parlar
function focus(ctx, x, y, t, tn, size, u) {
  const k = (t - (tn - 0.25)) / 1.25
  if (k <= 0 || k >= 1) return
  const a = Math.sin(Math.PI * clamp(k * 1.15))
  const close = outC(clamp(k * 1.8))
  const s = lerp(size * 2.2, size, close)
  const arm = s * 0.34
  ctx.save()
  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = 'lighter'
  for (const [w, al] of [
    [7 * u, 0.12],
    [2 * u, 0.9],
  ]) {
    ctx.strokeStyle = rgba(GOLD, a * al)
    ctx.lineWidth = w
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      ctx.beginPath()
      ctx.moveTo(x + sx * s, y + sy * (s - arm))
      ctx.lineTo(x + sx * s, y + sy * s)
      ctx.lineTo(x + sx * (s - arm), y + sy * s)
      ctx.stroke()
    }
  }
  const rk = clamp((k - 0.25) / 0.75)
  if (rk > 0) {
    ctx.strokeStyle = rgba(GOLD, Math.sin(Math.PI * rk) * 0.5)
    ctx.lineWidth = 1.5 * u
    ctx.beginPath()
    ctx.arc(x, y, lerp(size * 0.4, size * 1.5, outC(rk)), 0, TAU)
    ctx.stroke()
  }
  glow(ctx, x, y, size * 1.3, GOLD, 0.22 * a)
  ctx.restore()
}
function spotlight(ctx, W, H, x, y, r, a) {
  if (a <= 0) return
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, Math.max(W, H))
  g.addColorStop(0, 'rgba(2,4,9,0)')
  g.addColorStop(0.35, `rgba(2,4,9,${a * 0.5})`)
  g.addColorStop(1, `rgba(2,4,9,${a * 0.75})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// --- At: sağa bakan, uçan (Pegasus) duruşu; at biriminde eklemler ---
const HJ = {
  muzzle: [104, -38],
  poll: [74, -58],
  ear: [71, -73],
  throat: [78, -32],
  wither: [30, -24],
  chestF: [56, 2],
  hip: [-44, -12],
  tailB: [-60, -16],
  tail1: [-88, -30],
  tail2: [-110, -18],
  e1: [42, 14],
  k1: [62, 28],
  f1: [52, 44],
  h1: [58, 50],
  e2: [48, 12],
  k2: [76, 16],
  f2: [90, 30],
  h2: [99, 28],
  s1: [-36, 12],
  hk1: [-62, 26],
  p1: [-86, 32],
  hf1: [-97, 38],
  s2: [-28, 14],
  hk2: [-46, 34],
  p2: [-56, 50],
  hf2: [-52, 57],
}
function drawHorse(ctx) {
  const J = HJ
  oval(ctx, [-4, -2], 52, 19, -0.06)
  oval(ctx, [38, -2], 21, 19, 0)
  oval(ctx, [-40, -6], 23, 19, 0)
  limb(ctx, [38, -8], [70, -50], 16, 9)
  limb(ctx, [72, -52], [101, -38], 10, 6)
  oval(ctx, [80, -42], 11, 8, 0.5)
  ctx.beginPath()
  ctx.moveTo(67, -57)
  ctx.lineTo(J.ear[0], J.ear[1])
  ctx.lineTo(77, -57)
  ctx.fill()
  // yele
  limb(ctx, [34, -20], [66, -60], 7, 5)
  for (const [a, b, c, d] of [
    [J.e1, J.k1, J.f1, J.h1],
    [J.e2, J.k2, J.f2, J.h2],
    [J.s1, J.hk1, J.p1, J.hf1],
    [J.s2, J.hk2, J.p2, J.hf2],
  ]) {
    const hind = a[0] < 0
    limb(ctx, a, b, hind ? 11 : 8, hind ? 5.5 : 5.2)
    limb(ctx, b, c, hind ? 4.6 : 4.8, 3.8)
    limb(ctx, c, d, 3.8, 3.4)
    oval(ctx, d, 4.4, 3.6, 0)
  }
  limb(ctx, J.tailB, J.tail1, 7, 6)
  limb(ctx, J.tail1, J.tail2, 6, 2.5)
}
// Takımyıldızı: yıldızlar (parlak) ve çizgiler (eklem adlarıyla)
const MAJOR = ['muzzle', 'poll', 'ear', 'wither', 'chestF', 'hip', 'tail1', 'tail2', 'k1', 'h1', 'k2', 'h2', 'hk1', 'hf1', 'hk2', 'hf2']
const LINES = [
  ['muzzle', 'poll'],
  ['poll', 'ear'],
  ['poll', 'wither'],
  ['muzzle', 'throat'],
  ['throat', 'chestF'],
  ['wither', 'hip'],
  ['hip', 'tail1'],
  ['tail1', 'tail2'],
  ['wither', 'chestF'],
  ['chestF', 'hip'],
  ['chestF', 'k1'],
  ['k1', 'h1'],
  ['chestF', 'k2'],
  ['k2', 'h2'],
  ['hip', 'hk1'],
  ['hk1', 'hf1'],
  ['hip', 'hk2'],
  ['hk2', 'hf2'],
]
// Kanat (omuz = HJ.wither'e göre): hücum kenarı ve tüy uçları
const WING_LE = [
  [0, 0],
  [-6, -34],
  [-24, -68],
  [-54, -94],
  [-94, -108],
]
const WING_TT = [
  [-104, -92],
  [-102, -70],
  [-94, -50],
  [-80, -32],
  [-60, -17],
  [-36, -6],
]

function puff(ctx, x, y, r, light, shade, a) {
  if (a <= 0.004 || r <= 0.5) return
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r)
  g.addColorStop(0, rgba(light, a))
  g.addColorStop(0.6, rgba(mixc(light, shade, 0.55), a * 0.85))
  g.addColorStop(1, rgba(shade, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

// --- İris dokusu (bir kez çizilir) ---
function makeIris(R) {
  const c = document.createElement('canvas')
  const S = Math.ceil(R * 2)
  c.width = c.height = S
  const g = c.getContext('2d')
  g.translate(S / 2, S / 2)
  const base = g.createRadialGradient(0, 0, 0, 0, 0, R)
  base.addColorStop(0, '#1b120a')
  base.addColorStop(0.26, '#6a4a1c')
  base.addColorStop(0.36, '#c89a4a')
  base.addColorStop(0.5, '#2a9aa4')
  base.addColorStop(0.72, '#15607e')
  base.addColorStop(0.9, '#0b2c45')
  base.addColorStop(1, '#03080e')
  g.fillStyle = base
  g.beginPath()
  g.arc(0, 0, R, 0, TAU)
  g.fill()
  g.lineCap = 'round'
  for (let i = 0; i < 900; i++) {
    const a = hash(i, 1) * TAU
    const r0 = R * (0.27 + hash(i, 2) * 0.08)
    const r1 = R * (0.55 + hash(i, 3) * 0.42)
    const w = (hash(i, 4) - 0.5) * 0.12
    const light = hash(i, 5) > 0.42
    g.strokeStyle = light
      ? hash(i, 6) > 0.6
        ? `rgba(255,214,140,${0.05 + hash(i, 7) * 0.12})`
        : `rgba(150,235,240,${0.04 + hash(i, 7) * 0.1})`
      : `rgba(2,10,16,${0.08 + hash(i, 7) * 0.18})`
    g.lineWidth = 0.5 + hash(i, 8) * 1.4
    g.beginPath()
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0)
    g.quadraticCurveTo(Math.cos(a + w) * (r0 + r1) * 0.5, Math.sin(a + w) * (r0 + r1) * 0.5, Math.cos(a + w * 0.4) * r1, Math.sin(a + w * 0.4) * r1)
    g.stroke()
  }
  for (let i = 0; i < 34; i++) {
    const a = hash(i, 21) * TAU
    const rr = R * (0.46 + hash(i, 22) * 0.3)
    g.save()
    g.translate(Math.cos(a) * rr, Math.sin(a) * rr)
    g.rotate(a)
    g.fillStyle = `rgba(2,12,20,${0.18 + hash(i, 23) * 0.2})`
    g.beginPath()
    g.ellipse(0, 0, R * (0.03 + hash(i, 24) * 0.05), R * (0.012 + hash(i, 25) * 0.02), 0, 0, TAU)
    g.fill()
    g.restore()
  }
  g.strokeStyle = 'rgba(255,205,120,0.35)'
  g.lineWidth = R * 0.012
  g.beginPath()
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * TAU
    const rr = R * (0.43 + 0.025 * Math.sin(a * 11) + 0.012 * Math.sin(a * 23))
    i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  g.stroke()
  const limbal = g.createRadialGradient(0, 0, R * 0.8, 0, 0, R)
  limbal.addColorStop(0, 'rgba(2,6,10,0)')
  limbal.addColorStop(1, 'rgba(2,6,10,0.85)')
  g.fillStyle = limbal
  g.beginPath()
  g.arc(0, 0, R, 0, TAU)
  g.fill()
  return c
}
function makeGrain() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const d = g.createImageData(128, 128)
  for (let i = 0; i < d.data.length; i += 4) {
    const v = (hash(i, 77) * 255) | 0
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v
    d.data[i + 3] = 255
  }
  g.putImageData(d, 0, 0)
  return c
}

export function finalCircle(W, H) {
  const u = Math.min(W / 390, H / 844)
  return { x: W / 2, y: H * 0.36, r: Math.min(W * 0.37, 150 * u) }
}

export function createIntroScene(canvas) {
  const ctx = canvas.getContext('2d')
  const buf = document.createElement('canvas')
  const bctx = buf.getContext('2d')
  let W = 0
  let H = 0
  let dpr = 1
  let iris = null
  let irisR = 0
  const grain = makeGrain()

  function resize() {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(2, globalThis.devicePixelRatio || 1)
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    irisR = Math.min(W, H) * 0.5
    iris = makeIris(irisR * dpr)
  }
  resize()

  // Siluet: parçalar maskeye opak çizilir, sonra kenar ışığı (kaydırılmış) + gövde rengiyle basılır
  const figC = document.createElement('canvas')
  const fctx = figC.getContext('2d')
  const tintC = document.createElement('canvas')
  const tctx = tintC.getContext('2d')
  function stamp(c, color, x, y, half) {
    tctx.globalCompositeOperation = 'copy'
    tctx.drawImage(figC, 0, 0)
    tctx.globalCompositeOperation = 'source-in'
    tctx.fillStyle = color
    tctx.fillRect(0, 0, tintC.width, tintC.height)
    c.drawImage(tintC, x - half, y - half, half * 2, half * 2)
  }
  function mask(half, draw) {
    const S = Math.ceil(half * 2 * dpr)
    if (figC.width !== S) {
      figC.width = figC.height = S
      tintC.width = tintC.height = S
    }
    fctx.setTransform(1, 0, 0, 1, 0, 0)
    fctx.clearRect(0, 0, S, S)
    fctx.setTransform(dpr, 0, 0, dpr, half * dpr, half * dpr)
    fctx.fillStyle = '#fff'
    draw(fctx)
  }
  // o: { rot, rim: [dx, dy], rimC, rimA, body, alpha }
  function figure(c, s, x, y, o = {}) {
    const half = s.L * 8.5
    mask(half, (f) => {
      f.rotate(o.rot ?? 0)
      drawFigure(f, s)
    })
    c.save()
    c.globalAlpha = o.alpha ?? 1
    if (o.rimA > 0) stamp(c, rgba(o.rimC, o.rimA), x + o.rim[0], y + o.rim[1], half)
    stamp(c, rgba(o.body ?? INK), x, y, half)
    c.restore()
  }

  // Bulut atı: at silüetinin içinden kalınlığa göre bulut topakları örneklenir (bir kez)
  const PUFFS = (() => {
    const mc = document.createElement('canvas')
    mc.width = 260
    mc.height = 190
    const m = mc.getContext('2d')
    m.translate(130, 95)
    m.fillStyle = '#fff'
    drawHorse(m)
    const d = m.getImageData(0, 0, 260, 190).data
    const inside = (x, y) => {
      const ix = Math.round(x + 130)
      const iy = Math.round(y + 95)
      return ix >= 0 && iy >= 0 && ix < 260 && iy < 190 && d[(iy * 260 + ix) * 4 + 3] > 128
    }
    const cand = []
    for (let y = -90; y < 90; y += 3) {
      for (let x = -125; x < 125; x += 3) {
        if (!inside(x, y)) continue
        let r = 0
        for (const rr of [18, 14, 11, 8, 6, 4.5, 3.2]) {
          let ok = true
          for (let k = 0; k < 8 && ok; k++) ok = inside(x + Math.cos((k / 8) * TAU) * rr * 0.85, y + Math.sin((k / 8) * TAU) * rr * 0.85)
          if (ok) {
            r = rr
            break
          }
        }
        if (r) cand.push([x, y, r])
      }
    }
    cand.sort((a, b) => b[2] - a[2])
    const out = []
    for (const p of cand) if (out.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > Math.max(p[2], q[2]) * 0.8)) out.push(p)
    return out.map(([x, y, r], i) => {
      const a = hash(i, 9) * TAU
      const rr = Math.sqrt(hash(i, 10))
      return { hx: x, hy: y, hr: r < 7 ? r * 1.7 : r * 1.2, bx: Math.cos(a) * rr * 84 - 6, by: Math.sin(a) * rr * 24 - 8, br: 14 + hash(i, 11) * 12 }
    })
  })()

  // Bulanıklık: katmanı küçük tampona çiz, büyüterek geri koy (Safari'de ctx.filter yok).
  // fx/fy: yatay/dikey küçültme; yalnız fx > 1 → yatay hareket bulanıklığı.
  function blurred(fx, fy, draw) {
    if (fx <= 1.05 && fy <= 1.05) return draw(ctx)
    const bw = Math.max(2, Math.round((W * dpr) / fx))
    const bh = Math.max(2, Math.round((H * dpr) / fy))
    buf.width = bw
    buf.height = bh
    bctx.setTransform(bw / W, 0, 0, bh / H, 0, 0)
    const out = draw(bctx)
    ctx.save()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(buf, 0, 0, W, H)
    ctx.restore()
    return out
  }

  // ---------- Sahne A: alacakaranlık tepesi, gözlük ----------
  function sceneA(c, t, u, blur) {
    const horY = H * 0.62
    skyGrad(c, W, H, [5, 10, 24], [14, 30, 56], [44, 74, 104], horY)
    glow(c, W * 0.5, horY, W * 0.9, [70, 150, 170], 0.25)
    stars(c, W, horY, 60, 0.8 * (1 - blur * 0.6), t, 0, 3)
    fillRidge(c, W, H, horY, 0, 1.3, 16 * u, rgba([16, 30, 48]), 1.4)
    // vadideki ışıklar: bulanıkken bokeh
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 46; i++) {
      const x = hash(i, 31) * W * 1.1 - W * 0.05
      const y = horY + 6 * u + hash(i, 32) * H * 0.07
      const warm = hash(i, 33) > 0.35
      const col = warm ? [255, 190, 120] : [120, 220, 235]
      const r = (0.9 + hash(i, 34)) * u + blur * (10 + hash(i, 35) * 12) * u
      const a = (0.75 / (1 + blur * 5)) * (0.5 + hash(i, 36) * 0.5)
      c.fillStyle = rgba(col, a)
      c.beginPath()
      c.arc(x, y, r, 0, TAU)
      c.fill()
      if (blur > 0.2) {
        c.strokeStyle = rgba(col, a * 0.8)
        c.lineWidth = 0.8 * u
        c.stroke()
      }
    }
    c.restore()
  }
  function sceneAfg(c, t, u) {
    const horY = H * 0.62
    const px = W * 0.54
    const groundY = H * 0.74
    // tepe
    c.fillStyle = rgba([7, 12, 20])
    c.beginPath()
    c.moveTo(0, H)
    c.lineTo(0, groundY + 70 * u)
    c.bezierCurveTo(W * 0.25, groundY + 20 * u, W * 0.4, groundY - 2 * u, px, groundY)
    c.bezierCurveTo(W * 0.7, groundY + 2 * u, W * 0.85, groundY + 30 * u, W, groundY + 56 * u)
    c.lineTo(W, H)
    c.fill()
    c.strokeStyle = rgba([90, 180, 200], 0.35)
    c.lineWidth = 1.2 * u
    c.beginPath()
    c.moveTo(W * 0.18, groundY + 36 * u)
    c.bezierCurveTo(W * 0.3, groundY + 12 * u, W * 0.4, groundY - 2 * u, px, groundY)
    c.bezierCurveTo(W * 0.7, groundY + 2 * u, W * 0.8, groundY + 20 * u, W * 0.9, groundY + 40 * u)
    c.stroke()
    // figür: elini yüzüne götürür, gözlüğü çıkarır, önünde tutar, koşuya eğilir
    const u1 = inOut(sm(1.75, 2.15, t))
    const u2 = inOut(sm(2.32, 2.85, t))
    const ar = lerp(lerp(0.12, 2.08, u1), 0.55, u2)
    const el = lerp(lerp(0.15, 1.98, u1), 0.95, u2)
    const go = inOut(sm(2.8, 3.1, t))
    const h = H * 0.3
    const s = skeleton({
      h,
      lean: lerp(0.03, 0.22, go),
      tilt: lerp(0.02, -0.08, u1) + 0.1 * u2 * (1 - go),
      toe: 0.1,
      legs: [
        [lerp(-0.12, -0.35, go), lerp(0.1, 0.4, go)],
        [lerp(0.1, 0.3, go), lerp(0.08, 0.5, go)],
      ],
      arms: [
        [lerp(-0.08, 0.5, go), lerp(0.2, 1.3, go)],
        [ar, el],
      ],
    })
    const hipY = groundY - (Math.max(s.legs[0].an[1], s.legs[1].an[1]) + 0.17 * s.L)
    figure(c, s, px, hipY, { rim: [1.3 * u, -0.7 * u], rimC: [120, 210, 230], rimA: 0.7 })
    // gözlük: yüzde → elde; parlama
    const onFace = t < 2.16
    const hx = px + s.hd[0]
    const hy = hipY + s.hd[1]
    const wx = px + s.arms[1].w[0]
    const wy = hipY + s.arms[1].w[1]
    const gx = onFace ? hx + 0.34 * s.L : wx + 0.1 * s.L
    const gy = onFace ? hy - 0.04 * s.L : wy - 0.3 * s.L
    c.save()
    c.strokeStyle = 'rgba(200,236,245,0.9)'
    c.lineWidth = 1.3 * u
    if (onFace) {
      c.beginPath()
      c.ellipse(gx, gy, 0.1 * s.L, 0.2 * s.L, 0, 0, TAU)
      c.moveTo(gx, gy - 0.05 * s.L)
      c.lineTo(hx - 0.28 * s.L, hy - 0.02 * s.L)
      c.stroke()
    } else {
      c.translate(gx, gy)
      c.rotate(-0.4 + 0.3 * u2)
      c.beginPath()
      c.ellipse(-0.24 * s.L, 0, 0.19 * s.L, 0.15 * s.L, 0, 0, TAU)
      c.moveTo(0.43 * s.L, 0)
      c.ellipse(0.24 * s.L, 0, 0.19 * s.L, 0.15 * s.L, 0, 0, TAU)
      c.moveTo(-0.05 * s.L, -0.02 * s.L)
      c.lineTo(0.05 * s.L, -0.02 * s.L)
      c.stroke()
    }
    c.restore()
    return { gx, gy }
  }
  function flare(c, x, y, a, u) {
    if (a <= 0) return
    c.save()
    c.globalCompositeOperation = 'lighter'
    glow(c, x, y, 60 * u, [200, 240, 255], 0.9 * a)
    const g = c.createLinearGradient(0, 0, W, 0)
    g.addColorStop(0, 'rgba(62,123,250,0)')
    g.addColorStop(clamp(x / W), `rgba(170,225,255,${0.75 * a})`)
    g.addColorStop(1, 'rgba(62,123,250,0)')
    c.fillStyle = g
    c.fillRect(0, y - 1.2 * u, W, 2.4 * u)
    c.globalAlpha = 0.35 * a
    c.fillRect(0, y - 6 * u, W, 12 * u)
    c.globalAlpha = 1
    for (const [k, r] of [
      [0.6, 9],
      [1.4, 16],
      [1.9, 6],
    ]) {
      const fx = W / 2 + (W / 2 - x) * k
      const fy = H / 2 + (H / 2 - y) * k
      c.strokeStyle = `rgba(120,200,255,${0.1 * a})`
      c.lineWidth = 1.2 * u
      c.beginPath()
      c.arc(fx, fy, r * u, 0, TAU)
      c.stroke()
    }
    c.restore()
  }

  // ---------- Sahne B: koşu ----------
  function sceneB(c, t, u) {
    const V = 330 * u
    const xb = Xb(t)
    const groundY = H * 0.74
    const horY = H * 0.64
    const dawn = sm(7.2, 9.4, t)
    const top = mixc([6, 12, 28], [36, 62, 118], dawn)
    const mid = mixc([16, 34, 60], [196, 132, 116], dawn)
    const hor = mixc([44, 64, 96], [255, 196, 128], dawn)
    skyGrad(c, W, H, top, mid, hor, horY)
    stars(c, W, horY, 50, 0.7 * (1 - dawn), t, 0, 5)
    // güneş
    const sunX = W * 0.76
    const sunY = lerp(horY + 30 * u, horY - 110 * u, inOut(sm(7.4, 9.6, t)))
    c.save()
    c.globalCompositeOperation = 'lighter'
    glow(c, sunX, sunY, W * 1.1, [255, 150, 90], 0.35 * dawn)
    glow(c, sunX, sunY, 90 * u, SUN, 0.9 * dawn)
    if (dawn > 0) {
      c.translate(sunX, sunY)
      c.rotate(t * 0.04)
      for (let i = 0; i < 11; i++) {
        c.rotate(TAU / 11)
        const g = c.createLinearGradient(0, 0, W, 0)
        g.addColorStop(0, `rgba(255,220,160,${0.07 * dawn})`)
        g.addColorStop(1, 'rgba(255,220,160,0)')
        c.fillStyle = g
        c.beginPath()
        c.moveTo(0, 0)
        c.lineTo(W * 1.2, -W * (0.04 + hash(i, 41) * 0.05))
        c.lineTo(W * 1.2, W * (0.04 + hash(i, 42) * 0.05))
        c.fill()
      }
    }
    c.restore()
    c.save()
    c.globalCompositeOperation = 'lighter'
    c.fillStyle = rgba([255, 244, 214], dawn)
    c.beginPath()
    c.arc(sunX, sunY, 17 * u, 0, TAU)
    c.fill()
    c.restore()
    // uzak dağlar (hava perspektifi) ve tepeler + ağaçlar
    const far = mixc(mixc([20, 34, 56], hor, 0.35), [120, 90, 110], dawn * 0.4)
    fillRidge(c, W, H, horY + 4 * u, xb * V * 0.06, 2.1, 24 * u, rgba(far))
    const midC = mixc([10, 20, 34], [70, 52, 70], dawn * 0.6)
    const off = xb * V * 0.3
    fillRidge(c, W, H, horY + 34 * u, off, 0.4, 20 * u, rgba(midC), 1.6)
    c.fillStyle = rgba(midC)
    const sp = 34 * u
    for (let i = Math.floor(off / sp) - 1; i < Math.ceil((off + W) / sp) + 1; i++) {
      if (hash(i, 51) < 0.35) continue
      const xw = i * sp + hash(i, 52) * sp
      const x = xw - off
      const y = horY + 34 * u + ridge(xw, 0.4, 20 * u, 1.6) + 2 * u
      const th = (16 + hash(i, 53) * 26) * u
      if (hash(i, 54) > 0.5) {
        c.beginPath()
        c.moveTo(x, y - th)
        c.lineTo(x + th * 0.32, y)
        c.lineTo(x - th * 0.32, y)
        c.fill()
      } else {
        c.beginPath()
        c.arc(x, y - th * 0.55, th * 0.38, 0, TAU)
        c.arc(x + th * 0.22, y - th * 0.35, th * 0.3, 0, TAU)
        c.fill()
        c.fillRect(x - 1 * u, y - th * 0.3, 2 * u, th * 0.3)
      }
    }
    // zemin
    const gr = c.createLinearGradient(0, groundY, 0, H)
    gr.addColorStop(0, rgba(mixc([10, 16, 26], [46, 36, 44], dawn)))
    gr.addColorStop(1, rgba([3, 5, 9]))
    c.fillStyle = gr
    c.fillRect(0, groundY, W, H - groundY)
    c.fillStyle = rgba(mixc([80, 150, 180], [255, 190, 130], dawn), 0.5)
    c.fillRect(0, groundY - 0.5 * u, W, 1.2 * u)
    // sokak lambaları
    const runX = W * 0.32
    const sx = (wx) => wx - xb * V
    for (let k = -1; k < 12; k++) {
      const x = sx(runX + 140 * u + k * 560 * u)
      if (x < -60 * u || x > W + 60 * u) continue
      c.fillStyle = rgba(INK)
      c.fillRect(x - 1.6 * u, groundY - 120 * u, 3.2 * u, 120 * u)
      c.fillRect(x - 1.6 * u, groundY - 120 * u, 16 * u, 2.6 * u)
      c.save()
      c.globalCompositeOperation = 'lighter'
      glow(c, x + 14 * u, groundY - 116 * u, 70 * u, [255, 190, 120], 0.55 * (1 - dawn))
      c.restore()
    }
    // bank + kedi
    const place = (tn, d) => runX + d + Xb(tn) * V
    const bx = sx(place(NOTICE.cat, 64 * u))
    if (bx > -120 * u && bx < W + 120 * u) {
      c.fillStyle = rgba(INK)
      c.fillRect(bx - 34 * u, groundY - 26 * u, 68 * u, 4.5 * u)
      c.fillRect(bx - 34 * u, groundY - 44 * u, 68 * u, 4 * u)
      c.fillRect(bx - 34 * u, groundY - 36 * u, 68 * u, 3 * u)
      c.fillRect(bx - 30 * u, groundY - 26 * u, 3.5 * u, 26 * u)
      c.fillRect(bx + 26 * u, groundY - 26 * u, 3.5 * u, 26 * u)
      // kedi (oturan, profil)
      const cx = bx + 4 * u
      const cy = groundY
      c.beginPath()
      c.ellipse(cx, cy - 7 * u, 9 * u, 7.5 * u, 0, 0, TAU)
      c.ellipse(cx + 8 * u, cy - 15 * u, 5.2 * u, 4.8 * u, 0, 0, TAU)
      c.fill()
      c.beginPath()
      c.moveTo(cx + 4.5 * u, cy - 18 * u)
      c.lineTo(cx + 5.2 * u, cy - 24 * u)
      c.lineTo(cx + 8 * u, cy - 19.5 * u)
      c.moveTo(cx + 9 * u, cy - 19.5 * u)
      c.lineTo(cx + 11.6 * u, cy - 24 * u)
      c.lineTo(cx + 12.4 * u, cy - 17.5 * u)
      c.fill()
      c.lineWidth = 2.6 * u
      c.lineCap = 'round'
      c.strokeStyle = rgba(INK)
      c.beginPath()
      c.moveTo(cx - 8 * u, cy - 3 * u)
      c.quadraticCurveTo(cx - 18 * u, cy - 2 * u, cx - 16 * u, cy - 12 * u + 2 * u * Math.sin(t * 3))
      c.stroke()
      const eye = 0.35 + 0.65 * bump(t, NOTICE.cat - 0.3, NOTICE.cat, NOTICE.cat + 0.5, NOTICE.cat + 0.9)
      c.save()
      c.globalCompositeOperation = 'lighter'
      glow(c, cx + 10 * u, cy - 15.5 * u, 6 * u, [200, 255, 150], eye)
      c.restore()
      c.fillStyle = rgba([220, 255, 170], eye)
      c.beginPath()
      c.ellipse(cx + 10.2 * u, cy - 15.6 * u, 1.1 * u, 1.5 * u, 0, 0, TAU)
      c.fill()
    }
    // araba, arka lastik patlak
    const ax = sx(place(NOTICE.tire, 70 * u))
    if (ax > -160 * u && ax < W + 160 * u) {
      c.fillStyle = rgba(INK)
      c.beginPath()
      c.moveTo(ax - 64 * u, groundY - 10 * u)
      c.lineTo(ax - 62 * u, groundY - 26 * u)
      c.quadraticCurveTo(ax - 58 * u, groundY - 30 * u, ax - 40 * u, groundY - 31 * u)
      c.lineTo(ax - 24 * u, groundY - 48 * u)
      c.quadraticCurveTo(ax - 18 * u, groundY - 52 * u, ax + 14 * u, groundY - 51 * u)
      c.lineTo(ax + 34 * u, groundY - 33 * u)
      c.quadraticCurveTo(ax + 60 * u, groundY - 30 * u, ax + 64 * u, groundY - 20 * u)
      c.lineTo(ax + 64 * u, groundY - 8 * u)
      c.closePath()
      c.fill()
      c.fillStyle = rgba(mixc([30, 50, 70], hor, 0.4), 0.9)
      c.beginPath()
      c.moveTo(ax - 20 * u, groundY - 45 * u)
      c.lineTo(ax - 4 * u, groundY - 45 * u)
      c.lineTo(ax - 4 * u, groundY - 34 * u)
      c.lineTo(ax - 32 * u, groundY - 34 * u)
      c.closePath()
      c.moveTo(ax + 2 * u, groundY - 45 * u)
      c.lineTo(ax + 13 * u, groundY - 45 * u)
      c.lineTo(ax + 26 * u, groundY - 34 * u)
      c.lineTo(ax + 2 * u, groundY - 34 * u)
      c.closePath()
      c.fill()
      c.fillStyle = rgba(INK)
      c.beginPath()
      c.arc(ax + 38 * u, groundY - 11 * u, 11 * u, 0, TAU)
      c.fill()
      // patlak: yere basık
      c.beginPath()
      c.moveTo(ax - 54 * u, groundY)
      c.bezierCurveTo(ax - 58 * u, groundY - 18 * u, ax - 26 * u, groundY - 18 * u, ax - 28 * u, groundY)
      c.closePath()
      c.fill()
      c.strokeStyle = rgba(mixc([90, 130, 160], hor, 0.5), 0.6)
      c.lineWidth = 1.2 * u
      c.beginPath()
      c.arc(ax + 38 * u, groundY - 11 * u, 5 * u, 0, TAU)
      c.stroke()
    }
    // çiçek: sap uzar, taç açar
    const fx = sx(place(NOTICE.flower, 58 * u))
    if (fx > -80 * u && fx < W + 80 * u) {
      const grow = outC(sm(7.9, 8.7, t))
      const open = outC(sm(8.6, 9.4, t))
      const top = groundY - 46 * u * grow
      c.strokeStyle = rgba([12, 30, 26])
      c.lineWidth = 2.4 * u
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(fx, groundY)
      c.quadraticCurveTo(fx - 6 * u, groundY - 22 * u * grow, fx, top)
      c.stroke()
      c.fillStyle = rgba([12, 30, 26])
      c.beginPath()
      c.ellipse(fx - 7 * u, groundY - 16 * u * grow, 7 * u * grow, 2.6 * u * grow, -0.5, 0, TAU)
      c.fill()
      if (open > 0) {
        c.save()
        c.translate(fx, top)
        c.globalCompositeOperation = 'lighter'
        glow(c, 0, 0, 34 * u, GOLD, 0.35 * open)
        c.restore()
        c.save()
        c.translate(fx, top)
        for (let i = 0; i < 9; i++) {
          c.save()
          c.rotate((i / 9) * TAU + t * 0.1)
          const len = 12 * u * open
          const pg = c.createLinearGradient(0, 0, 0, -len)
          pg.addColorStop(0, 'rgba(255,140,70,1)')
          pg.addColorStop(1, 'rgba(255,214,120,1)')
          c.fillStyle = pg
          c.beginPath()
          c.ellipse(0, -len * 0.55, 3.6 * u * open, len * 0.55, 0, 0, TAU)
          c.fill()
          c.restore()
        }
        c.fillStyle = '#3a1c08'
        c.beginPath()
        c.arc(0, 0, 3.4 * u * open, 0, TAU)
        c.fill()
        c.restore()
      }
    }
    // koşucu
    const phi = xb * 2.6 * TAU
    const look = Math.max(
      bump(t, NOTICE.cat - 0.4, NOTICE.cat - 0.1, NOTICE.cat + 0.4, NOTICE.cat + 0.8),
      bump(t, NOTICE.tire - 0.4, NOTICE.tire - 0.1, NOTICE.tire + 0.4, NOTICE.tire + 0.8),
      bump(t, NOTICE.flower - 0.4, NOTICE.flower - 0.1, NOTICE.flower + 0.4, NOTICE.flower + 0.8),
    )
    const s = skeleton(runPose(phi, H * 0.175, -0.1 + 0.34 * look))
    const bob = -0.12 * s.L * Math.cos(2 * phi)
    const lowest = Math.max(s.legs[0].an[1], s.legs[1].an[1], s.legs[0].toe[1], s.legs[1].toe[1]) + 0.12 * s.L
    const hipY = groundY - lowest + bob * 0.4 - 0.3 * s.L * Math.abs(Math.sin(phi)) * 0.3
    const rimC = mixc([110, 200, 230], [255, 200, 140], dawn)
    figure(c, s, runX, hipY, { rim: [1.3 * u, -0.6 * u], rimC, rimA: 0.8 })
    // gölge
    c.fillStyle = 'rgba(0,0,0,0.35)'
    c.beginPath()
    c.ellipse(runX + 2 * u, groundY + 1.5 * u, 16 * u, 2.2 * u, 0, 0, TAU)
    c.fill()
    // havadaki toz (ışıkta)
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 44; i++) {
      const x = ((((hash(i, 61) * W * 1.4 - xb * V * 0.55) % (W + 40 * u)) + W + 40 * u) % (W + 40 * u)) - 20 * u
      const y = H * (0.22 + hash(i, 62) * 0.5) + Math.sin(t * 0.6 + i) * 8 * u
      c.fillStyle = rgba([255, 226, 180], (0.15 + 0.4 * dawn) * hash(i, 63))
      c.beginPath()
      c.arc(x, y, (0.6 + hash(i, 64) * 1.6) * u, 0, TAU)
      c.fill()
    }
    c.restore()
    return { runX, groundY, sx, place, V, dawn, xb }
  }
  function sceneBfg(c, t, u, g) {
    const off = g.xb * g.V * 1.8
    const sp = 70 * u
    c.fillStyle = rgba([2, 4, 8])
    for (let i = Math.floor(off / sp) - 1; i < Math.ceil((off + W) / sp) + 1; i++) {
      if (hash(i, 71) < 0.45) continue
      const x = i * sp + hash(i, 72) * sp - off
      const h = (24 + hash(i, 73) * 50) * u
      const base = H + 4 * u
      for (let b = 0; b < 7; b++) {
        const bx = x + (b - 3) * 4 * u
        const lean = (hash(i * 7 + b, 74) - 0.5) * 18 * u
        c.beginPath()
        c.moveTo(bx - 3 * u, base)
        c.quadraticCurveTo(bx + lean * 0.4, base - h * 0.6, bx + lean, base - h * (0.6 + hash(i * 7 + b, 75) * 0.4))
        c.quadraticCurveTo(bx + lean * 0.4 + 2 * u, base - h * 0.5, bx + 3 * u, base)
        c.fill()
      }
    }
  }

  // ---------- Sahne C/D: çayır, bulut → at → takımyıldızı ----------
  function horseState(t, W0, H0, u) {
    const p = inOut(sm(13.4, 14.9, t))
    const fc = finalCircle(W0, H0)
    const a = [W0 * 0.54, H0 * 0.33]
    const ctrl = [W0 * 0.95, H0 * 0.06]
    const b = [fc.x + 4 * u, fc.y + 6 * u]
    const x = (1 - p) * (1 - p) * a[0] + 2 * (1 - p) * p * ctrl[0] + p * p * b[0]
    const y = (1 - p) * (1 - p) * a[1] + 2 * (1 - p) * p * ctrl[1] + p * p * b[1]
    const sc = lerp(1.12, 0.6, p) * u
    const bob = Math.sin(t * 2.2) * 3 * u * sm(12.8, 13.4, t)
    return { x, y: y + bob, sc }
  }
  function wingPts(t, grow) {
    const on = sm(13.3, 13.6, t)
    const flap = Math.sin(t * 7.5) * 0.45 * on
    const fold = 1 - 0.3 * Math.max(0, Math.sin(t * 7.5)) * on
    const tf = ([x, y]) => {
      const rx = x * Math.cos(flap) - y * Math.sin(flap) * 0.5
      const ry = (x * Math.sin(flap) + y * Math.cos(flap)) * fold
      return [HJ.wither[0] + rx * grow, HJ.wither[1] + ry * grow]
    }
    return { le: WING_LE.map(tf), tt: WING_TT.map(tf) }
  }
  function sceneCD(c, t, u) {
    const tilt = inOut(sm(13.2, 14.6, t)) * H * 0.42
    const horY = H * 0.8 + tilt
    const kD = sm(10.9, 12.2, t)
    const kN = sm(11.9, 12.9, t)
    const pal = (g, d, n) => mixc(mixc(g, d, kD), n, kN)
    const top = pal([62, 96, 160], [40, 44, 96], [5, 9, 22])
    const mid = pal([236, 170, 130], [150, 96, 136], [12, 24, 50])
    const hor = pal([255, 210, 150], [245, 150, 104], [26, 44, 74])
    skyGrad(c, W, H, top, mid, hor, horY)
    stars(c, W, H, 140, kN, t, tilt * 0.35, 8)
    // bulut renkleri
    const light = pal([255, 238, 214], [250, 196, 196], [80, 92, 136])
    const shade = pal([216, 150, 140], [122, 92, 146], [26, 36, 66])
    const cloudA = 1 - sm(12.2, 12.9, t) * 0.75 - 0.25 * sm(13.2, 13.9, t)
    for (let k = 0; k < 3; k++) {
      const cx = W * [0.08, 0.92, 0.78][k] + t * 5 * u - 50 * u
      const cy = H * [0.12, 0.17, 0.62][k] + tilt * 0.6
      for (let i = 0; i < 11; i++) {
        const px = cx + (hash(i + k * 20, 81) - 0.5) * 120 * u
        const py = cy + (hash(i + k * 20, 82) - 0.5) * 22 * u
        puff(c, px, py, (14 + hash(i + k * 20, 83) * 16) * u, light, shade, 0.55 * cloudA)
      }
    }
    // çayır
    const gy = horY
    const grass = pal([40, 34, 36], [30, 22, 40], [4, 7, 12])
    c.fillStyle = rgba(grass)
    c.beginPath()
    c.moveTo(0, H + tilt)
    for (let x = 0; x <= W + 8; x += 8) c.lineTo(x, gy + ridge(x, 3.3, 8 * u, 2))
    c.lineTo(W, H + tilt + 40)
    c.lineTo(0, H + tilt + 40)
    c.fill()
    c.fillStyle = rgba(grass)
    c.fillRect(0, gy + 8 * u, W, H)
    c.strokeStyle = rgba(hor, 0.45 * (1 - kN * 0.6))
    c.lineWidth = 1 * u
    c.beginPath()
    for (let x = 0; x <= W + 8; x += 8) x ? c.lineTo(x, gy + ridge(x, 3.3, 8 * u, 2)) : c.moveTo(x, gy + ridge(x, 3.3, 8 * u, 2))
    c.stroke()
    // oturan çocuk: başı yukarıda, buluta işaret eder
    const kidFade = 1 - sm(12.55, 13.15, t)
    const kidX = W * 0.2
    const kidY = gy + 2 * u
    let kidS = null
    if (kidFade > 0) {
      const raise = inOut(sm(10.3, 10.9, t))
      kidS = skeleton({
        h: H * 0.12,
        head: 5.4,
        lean: -0.12,
        tilt: lerp(-0.2, -0.55, raise),
        toe: 0,
        legs: [
          [2.3, 2.2],
          [2.45, 2.35],
        ],
        arms: [
          [-0.55, 0.1],
          [lerp(1.2, 2.55, raise), lerp(1.2, 0.08, raise)],
        ],
      })
      const kidHip = kidY - 0.55 * kidS.L
      figure(c, kidS, kidX, kidHip, { rim: [0.9 * u, -0.9 * u], rimC: hor, rimA: 0.75, body: [4, 6, 12], alpha: kidFade })
    }
    // ana bulut → at (silüetin içinden örneklenmiş topaklar)
    const hs = horseState(t, W, H, u)
    const m = inOut(sm(10.9, 12.0, t))
    const cond = sm(12.3, 13.0, t)
    PUFFS.forEach((q, i) => {
      const drift = Math.sin(t * 0.8 + i) * 2 * (1 - m)
      const x = hs.x + lerp(q.bx + drift, q.hx, m) * hs.sc
      const y = hs.y + lerp(q.by, q.hy, m) * hs.sc
      const r = lerp(q.br, q.hr, m) * hs.sc
      puff(c, x, y, r * (1 - cond * 0.4), light, shade, 0.8 * (1 - cond))
    })
    if (m > 0.2 && t < 12.6) focus(c, hs.x, hs.y - 8 * u, t, 11.55, 96 * u, u)
    // gece: bulut yıldızlara yoğunlaşır, takımyıldızı çizgileri, kanatlar, binici
    if (cond > 0) {
      const P = (k) => [hs.x + HJ[k][0] * hs.sc, hs.y + HJ[k][1] * hs.sc]
      c.save()
      c.globalCompositeOperation = 'lighter'
      // bulutsu gövde (atın hayali)
      PUFFS.forEach((q) => glow(c, hs.x + q.hx * hs.sc, hs.y + q.hy * hs.sc, q.hr * hs.sc * 1.5, [70, 140, 255], 0.07 * cond))
      const lineK = sm(12.5, 13.3, t)
      c.lineWidth = 1.1 * u
      c.lineCap = 'round'
      LINES.forEach(([a, b], idx) => {
        const k = clamp(lineK * LINES.length - idx)
        if (k <= 0) return
        const [x1, y1] = P(a)
        const [x2, y2] = P(b)
        c.strokeStyle = `rgba(170,215,255,${0.5 * cond})`
        c.beginPath()
        c.moveTo(x1, y1)
        c.lineTo(lerp(x1, x2, k), lerp(y1, y2, k))
        c.stroke()
      })
      const grow = outC(sm(12.95, 13.6, t))
      if (grow > 0) {
        for (const [dt, al] of [
          [0.07, 0.4],
          [0, 1],
        ]) {
          const w = wingPts(t + dt, grow)
          const T = (p) => [hs.x + p[0] * hs.sc + (al < 1 ? -6 * hs.sc : 0), hs.y + p[1] * hs.sc - (al < 1 ? 4 * hs.sc : 0)]
          const le = w.le.map(T)
          const tt = w.tt.map(T)
          const tip = le[le.length - 1]
          const g = c.createLinearGradient(le[0][0], le[0][1], tip[0], tip[1])
          g.addColorStop(0, `rgba(25,194,209,${0.22 * al * grow})`)
          g.addColorStop(1, `rgba(120,170,255,${0.05 * al * grow})`)
          c.fillStyle = g
          c.beginPath()
          c.moveTo(le[0][0], le[0][1])
          for (let i = 1; i < le.length; i++) c.lineTo(le[i][0], le[i][1])
          let prev = tip
          for (const p of tt) {
            const mx = (prev[0] + p[0]) / 2
            const my = (prev[1] + p[1]) / 2
            c.quadraticCurveTo(mx + (p[1] - prev[1]) * 0.35, my - (p[0] - prev[0]) * 0.35, p[0], p[1])
            prev = p
          }
          c.lineTo(le[0][0], le[0][1])
          c.fill()
          c.strokeStyle = `rgba(160,235,245,${0.65 * al * grow})`
          c.beginPath()
          le.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
          c.stroke()
          c.strokeStyle = `rgba(160,235,245,${0.28 * al * grow})`
          tt.forEach((p, i) => {
            const k = 1 - (i + 0.5) / tt.length
            const idx = k * (le.length - 1)
            const j = Math.floor(idx)
            const f = idx - j
            const a = le[Math.min(j, le.length - 1)]
            const b = le[Math.min(j + 1, le.length - 1)]
            c.beginPath()
            c.moveTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f))
            c.lineTo(p[0], p[1])
            c.stroke()
          })
          le.forEach(([x, y], i) => i && glow(c, x, y, (i === le.length - 1 ? 10 : 6) * u, [200, 245, 255], 0.85 * al * grow))
        }
      }
      for (const k of Object.keys(HJ)) {
        const [x, y] = P(k)
        const major = MAJOR.includes(k)
        const tw = 0.75 + 0.25 * Math.sin(t * 3 + x * 0.05)
        glow(c, x, y, (major ? 11 : 6) * u, [210, 235, 255], (major ? 0.95 : 0.4) * cond * tw)
        c.fillStyle = `rgba(255,255,255,${(major ? 1 : 0.6) * cond})`
        c.beginPath()
        c.arc(x, y, (major ? 1.6 : 1) * u, 0, TAU)
        c.fill()
      }
      // binici: çocuğun ışığı, üç yıldız
      const rk = sm(13.05, 13.35, t)
      if (rk > 0) {
        const R = [
          [22, -32],
          [26, -48],
          [30, -60],
        ].map(([x, y]) => [hs.x + x * hs.sc, hs.y + y * hs.sc])
        c.strokeStyle = `rgba(255,220,160,${0.7 * rk})`
        c.beginPath()
        c.moveTo(R[0][0], R[0][1])
        c.lineTo(R[1][0], R[1][1])
        c.lineTo(R[2][0], R[2][1])
        c.stroke()
        R.forEach(([x, y], i) => glow(c, x, y, (i === 2 ? 12 : 8) * u, [255, 214, 150], rk))
      }
      c.restore()
    }
    // çocuğun ışığı ata doğru
    if (t > 12.45 && t < 13.5) {
      c.save()
      c.globalCompositeOperation = 'lighter'
      const end = [hs.x + 26 * hs.sc, hs.y - 48 * hs.sc]
      for (let i = 0; i < 46; i++) {
        const d = hash(i, 91) * 0.35
        const k = inOut(clamp((t - 12.5 - d) / 0.6))
        if (k <= 0 || k >= 1) continue
        const sx = kidX + (hash(i, 92) - 0.5) * 24 * u
        const sy = kidY - hash(i, 93) * 40 * u
        const cx = lerp(sx, end[0], 0.3) - 40 * u * hash(i, 94)
        const cy = Math.min(sy, end[1]) - 90 * u
        const x = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * cx + k * k * end[0]
        const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * cy + k * k * end[1]
        glow(c, x, y, 7 * u, [255, 214, 150], Math.sin(Math.PI * k) * 0.9)
      }
      c.restore()
    }
    // uçuş izi
    if (t > 13.45) {
      c.save()
      c.globalCompositeOperation = 'lighter'
      for (let k = 1; k <= 26; k++) {
        const tk = t - k * 0.03
        if (tk < 13.4) break
        const p = horseState(tk, W, H, u)
        const j = (hash(k + Math.floor(t * 30), 95) - 0.5) * 10 * u
        glow(c, p.x - 60 * p.sc + j, p.y + 10 * p.sc - j, 5 * u, [170, 225, 255], (1 - k / 26) * 0.5 * (1 - sm(14.6, 15.2, t)))
      }
      c.restore()
    }
  }

  // ---------- İris (sahne 0) ----------
  function sceneIris(c, t, u) {
    const cx = W / 2
    const cy = H * 0.44
    const z = 1 + 22 * inC(sm(0.95, 1.8, t))
    const R = irisR * z
    const p = irisR * (0.3 - 0.05 * bump(t, 0.15, 0.45, 0.55, 0.9) + 0.12 * sm(0.85, 1.35, t)) * z
    const sway = [Math.sin(t * 1.7) * 3 * u * (1 - sm(0.9, 1.3, t)), Math.cos(t * 1.3) * 2 * u]
    // göz beyazı + kapaklar (koyu, stilize)
    const sc = c.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.9)
    sc.addColorStop(0, 'rgba(150,165,182,1)')
    sc.addColorStop(0.45, 'rgba(60,72,90,1)')
    sc.addColorStop(1, 'rgba(6,10,18,1)')
    c.fillStyle = sc
    c.fillRect(0, 0, W, H)
    c.save()
    c.translate(cx + sway[0] * z, cy + sway[1] * z)
    c.rotate(t * 0.02)
    c.drawImage(iris, -R, -R, R * 2, R * 2)
    c.restore()
    // göz bebeği ve içindeki dünya
    const px = cx + sway[0] * z
    const py = cy + sway[1] * z
    const pg = c.createRadialGradient(px, py, p * 0.9, px, py, p * 1.12)
    pg.addColorStop(0, 'rgba(1,2,4,1)')
    pg.addColorStop(1, 'rgba(1,2,4,0)')
    c.fillStyle = pg
    c.beginPath()
    c.arc(px, py, p * 1.12, 0, TAU)
    c.fill()
    // yansımalar
    c.save()
    c.globalCompositeOperation = 'lighter'
    glow(c, px - R * 0.36, py - R * 0.4, R * 0.16, [230, 245, 255], 0.55)
    c.fillStyle = 'rgba(230,245,255,0.35)'
    c.beginPath()
    c.ellipse(px - R * 0.36, py - R * 0.42, R * 0.07, R * 0.045, -0.5, 0, TAU)
    c.fill()
    c.restore()
    // kapak gölgesi
    const lid = c.createLinearGradient(0, cy - R * 1.2, 0, cy + R * 1.2)
    lid.addColorStop(0, 'rgba(3,5,10,0.95)')
    lid.addColorStop(0.22, 'rgba(3,5,10,0.35)')
    lid.addColorStop(0.5, 'rgba(3,5,10,0)')
    lid.addColorStop(0.85, 'rgba(3,5,10,0.3)')
    lid.addColorStop(1, 'rgba(3,5,10,0.9)')
    c.fillStyle = lid
    c.fillRect(0, 0, W, H)
    return { px, py, p }
  }

  function post(t, u) {
    // vinyet + gren
    const v = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.45, Math.max(W, H) * 0.8)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.globalCompositeOperation = 'overlay'
    const ox = hash(Math.floor(t * 24), 1) * 128
    const oy = hash(Math.floor(t * 24), 2) * 128
    const pat = ctx.createPattern(grain, 'repeat')
    ctx.translate(-ox, -oy)
    ctx.fillStyle = pat
    ctx.fillRect(0, 0, W + 128, H + 128)
    ctx.restore()
  }

  function draw(t) {
    const u = Math.min(W / 390, H / 844)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle = rgba(BG)
    ctx.fillRect(0, 0, W, H)
    const diag = Math.hypot(W, H)

    // 0–3,4: iris → dalış → tepe (A); 3,0–3,4 yatay hızlı kaydırma A → B
    const pan = inOut(sm(3.0, 3.4, t))
    const mb = 1 + 34 * Math.sin(Math.PI * pan)
    if (t < 3.4) {
      const blur = 1 - inOut(sm(1.25, 2.1, t))
      const irisOn = t < 1.85
      const pup = irisOn ? sceneIris(ctx, t, u) : null
      let gl = null
      if (!irisOn || pup.p > 2 * u) {
        ctx.save()
        if (irisOn) {
          ctx.beginPath()
          ctx.arc(pup.px, pup.py, Math.min(pup.p, diag), 0, TAU)
          ctx.clip()
        }
        if (pan > 0.001) {
          blurred(mb, 1, (c) => {
            c.save()
            c.translate(-pan * W, 0)
            sceneA(c, t, u, 0)
            sceneAfg(c, t, u)
            c.restore()
          })
        } else if (blur > 0.02) {
          blurred(1 + blur * 5, 1 + blur * 5, (c) => sceneA(c, t, u, blur))
          blurred(1 + blur * 16, 1 + blur * 16, (c) => sceneAfg(c, t, u))
        } else {
          sceneA(ctx, t, u, 0)
          gl = sceneAfg(ctx, t, u)
        }
        if (irisOn) {
          // göz bebeği önce karanlık; dünya içinden belirir
          ctx.fillStyle = `rgba(1,2,4,${1 - sm(0.85, 1.45, t)})`
          ctx.fillRect(0, 0, W, H)
        }
        ctx.restore()
      }
      if (gl) flare(ctx, gl.gx, gl.gy, bump(t, 2.2, 2.32, 2.4, 2.75), u)
      if (t < 0.5) {
        ctx.fillStyle = `rgba(6,10,18,${1 - sm(0, 0.5, t)})`
        ctx.fillRect(0, 0, W, H)
      }
    }
    // 3,0–10,1: koşu (B)
    if (t >= 3.0 && t < 10.1) {
      let g = null
      if (pan < 0.999) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(W * (1 - pan), 0, W * 2, H)
        ctx.clip()
        blurred(mb, 1, (c) => {
          c.save()
          c.translate(W * (1 - pan), 0)
          sceneB(c, t, u)
          c.restore()
        })
        ctx.restore()
      } else {
        g = sceneB(ctx, t, u)
        blurred(5, 5, (c) => sceneBfg(c, t, u, g))
        // fark etme anları: ışık odağı + köşeler
        const at = (tn, d, dy) => [g.sx(g.place(tn, d)), g.groundY - dy]
        const spots = [
          [NOTICE.cat, ...at(NOTICE.cat, 70 * u, 12 * u), 30 * u],
          [NOTICE.tire, ...at(NOTICE.tire, 29 * u, 9 * u), 30 * u],
          [NOTICE.flower, ...at(NOTICE.flower, 58 * u, 44 * u), 26 * u],
        ]
        for (const [tn, x, y, size] of spots) {
          spotlight(ctx, W, H, x, y, size * 2, bump(t, tn - 0.45, tn - 0.1, tn + 0.35, tn + 0.75))
          focus(ctx, x, y, t, tn, size, u)
        }
      }
    }
    // 9,8–15+: çocukluk ve gece (C/D)
    if (t >= 9.75) {
      const a = sm(9.75, 10.15, t)
      ctx.save()
      ctx.globalAlpha = a
      sceneCD(ctx, t, u)
      ctx.restore()
    }
    // ışık sızıntısı geçişi (B → C)
    const leak = bump(t, 9.45, 9.9, 9.95, 10.5)
    if (leak > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      glow(ctx, W * lerp(0.9, 0.3, sm(9.4, 10.4, t)), H * 0.45, diag * 0.8, [255, 200, 140], 0.85 * leak)
      glow(ctx, W * 0.2, H * 0.3, diag * 0.5, [255, 140, 90], 0.4 * leak)
      ctx.restore()
    }
    post(t, u)
    // iris kapanışı → son kare
    const fc = finalCircle(W, H)
    const k = inOut(sm(14.05, 14.95, t))
    if (k > 0) {
      const r = lerp(diag, fc.r, k)
      ctx.save()
      ctx.fillStyle = rgba(BG)
      ctx.beginPath()
      ctx.rect(0, 0, W, H)
      ctx.arc(fc.x, fc.y, r, 0, TAU, true)
      ctx.fill('evenodd')
      const edge = ctx.createRadialGradient(fc.x, fc.y, r * 0.8, fc.x, fc.y, r)
      edge.addColorStop(0, 'rgba(6,10,18,0)')
      edge.addColorStop(1, 'rgba(6,10,18,0.9)')
      ctx.fillStyle = edge
      ctx.beginPath()
      ctx.arc(fc.x, fc.y, r, 0, TAU)
      ctx.fill()
      const ra = sm(14.5, 15.1, t)
      ctx.lineCap = 'round'
      ctx.save()
      ctx.translate(fc.x, fc.y)
      ctx.rotate(t * 0.157)
      ctx.setLineDash([26 * u, 12 * u])
      ctx.strokeStyle = rgba(TEAL, 0.6 * ra)
      ctx.lineWidth = 3 * u
      ctx.beginPath()
      ctx.arc(0, 0, fc.r * 1.1, 0, TAU)
      ctx.stroke()
      ctx.rotate(-t * 0.4)
      ctx.setLineDash([3 * u, 9 * u])
      ctx.strokeStyle = rgba(BLUE, 0.55 * ra)
      ctx.lineWidth = 1.5 * u
      ctx.beginPath()
      ctx.arc(0, 0, fc.r * 1.03, 0, TAU)
      ctx.stroke()
      ctx.restore()
      ctx.restore()
    }
  }

  return { draw, resize, size: () => ({ W, H }) }
}
