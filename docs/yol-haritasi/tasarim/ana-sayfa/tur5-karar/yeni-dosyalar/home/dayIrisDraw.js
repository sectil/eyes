// Ana sayfa · "Senin gözün" çizimi (Yön B maketinin çizimi, değerlendiricilerin aşılarıyla). Uygulamanın iris dili
// (lib/irisDraw.js drawIris: lifler, sıcak yaka, limbus, göz bebeği) ve aynı iris renkleri; tuval CSS değişkeni
// okuyamadığı için renkler temaya göre buradadır (components/IrisMap.jsx de böyle çizer). Tuvalde yazı yok: göz
// bebeğindeki sayı, "bugün" ve kilometre taşları DOM'da (components/home/DayIris.jsx).
//   Her ışın bir gün (kaydı olan gün; atlanan gün boşluk bırakmaz). Bugünün yeri hep tepede; geçmiş saat yönünün tersine
//   dizilir (dün bugünün hemen solunda). Bir tur 28 ışın: 28. günde göz dolar; sonraki turlar aynı yerlere yeni lif
//   katmanı ekler ve her biten tur gözün dışına ince bir halka bırakır (30. gün ile 68. gün ayrışsın; değerlendirici 2).
//   Işının boyu o günün yapılan durak sayısıdır. Seri ≥ 3 günse son günlerin kenarında mercek renginde yay.
//   Bugün: yol bitmediyse vurgu renginde yer ve yay; bugün yapılan durak varsa ışını yanmaya başlar; yol bitince ışın
//   parlar ve mercek renginde kısa ışıltı çizgileri (Yön C'nin "tamamlandı" anından aşı).
import { LAP, RAY_FULL } from './dayRays.js'

const TAU = Math.PI * 2
const hash = (i, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const TEAL = [25, 194, 209]
const BLUE = [62, 123, 250]
const GOLD = [255, 177, 59]
const PALE = [150, 232, 240]
const LBLUE = [120, 170, 255]
export const LAP_RINGS_MAX = 3 // gözün dışında en çok 3 tur halkası sığar (VARSAYIM: 84 günden sonra halka sayısı artmaz)

// Işının boyu (0..1): 1 durak kısa, 10 durak tam
export const lenOf = (n) => 0.58 + 0.42 * Math.min(1, Math.max(0, n) / RAY_FULL)

// Günler → ışın yuvaları. days: geçmiş günlerin durak sayısı (eskiden yeniye); todayN: bugün yapılan durak sayısı.
// Yuva 0 tepe (bugün); d gün önceki ışın (d = 1 en yeni geçmiş gün) yuva (−d mod 28).
export function slotsOf(days = [], todayN = 0) {
  const T = days.length
  const entries = days.map((n, i) => ({ d: T - i, n }))
  if (todayN > 0) entries.push({ d: 0, n: todayN })
  const slots = new Map()
  for (const e of entries) {
    const idx = (((-e.d) % LAP) + LAP) % LAP
    const s = slots.get(idx) ?? { idx, len: 0, layers: 0 }
    s.len = Math.max(s.len, lenOf(e.n))
    s.layers++
    slots.set(idx, s)
  }
  return slots
}

// today: { n: bugün yapılan durak sayısı, done: bugünün yolu bitti }
export function drawDayIris(cv, { size, dark = false, days = [], today = { n: 0, done: false }, streak = 0, laps: lapRings = true, dpr = 2 } = {}) {
  const S = Math.round(size * dpr)
  if (!(S > 0)) return
  cv.width = cv.height = S
  const g = cv.getContext?.('2d')
  if (!g) return
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.clearRect(0, 0, S, S)
  g.translate(S / 2, S / 2)
  const R = S * 0.42
  const pr = R * 0.38
  const step = TAU / LAP
  const k = S / 1024
  const px = dpr
  const P = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r] // a: tepeden saat yönünde
  const A = (a) => a - Math.PI / 2 // tuval açısı
  const rOf = (len) => pr + (R - pr) * len
  const fiber = (a, r0, r1, bend) => {
    const [x0, y0] = P(a, r0)
    const [xm, ym] = P(a + bend, (r0 + r1) / 2)
    const [x1, y1] = P(a + bend * 0.4, r1)
    g.beginPath()
    g.moveTo(x0, y0)
    g.quadraticCurveTo(xm, ym, x1, y1)
    g.stroke()
  }
  const wedge = (idx, r, pad = 0) => {
    const c = idx * step
    g.beginPath()
    g.moveTo(0, 0)
    g.arc(0, 0, r, A(c - step / 2 - pad), A(c + step / 2 + pad))
    g.closePath()
  }
  const todayN = Math.max(0, Number(today?.n) || 0)
  const todayDone = Boolean(today?.done)
  const slots = slotsOf(days, todayN)
  const acc = dark ? [25, 194, 209] : [11, 116, 128]

  // 0) zemin: gözün yeri çok hafif vurgu renginde (açık temada "boş, gri" görünmesin; değerlendirici 1 ve 5)
  //    Açık temada zemin irisin iki renginde yumuşak bir degrade (turkuaz → mavi): uyuyan göz de renkli okunsun, gri değil
  //    (5 saniye kapı turu 1: "açık temada yıkanmış").
  let bg = g.createRadialGradient(0, 0, pr, 0, 0, R * 1.02)
  bg.addColorStop(0, rgba(acc, dark ? 0.11 : 0.15))
  bg.addColorStop(0.55, rgba(dark ? [40, 120, 190] : [36, 120, 170], dark ? 0.06 : 0.09))
  bg.addColorStop(1, rgba(dark ? [62, 123, 250] : [47, 107, 234], dark ? 0.05 : 0.07))
  g.fillStyle = bg
  g.beginPath()
  g.arc(0, 0, R, 0, TAU)
  g.fill()

  // 1) taslak: henüz gelmemiş günlerin yeri seyrek, soluk ve renkli liflerle (göz uyur, yanan ışınlar öne çıkar). 5 saniye
  //    kapı turu 1: sık, gri-turkuaz taslak ilk günün gözünü "zaten dolu, gri bir tel yumağı" gösterdi ve bugünün
  //    ışını seçilmedi; taslak artık irisin kendi renklerinde (turkuaz, mavi) ve yarı yoğunlukta.
  const sk = dark ? [[96, 170, 186], [98, 132, 214]] : [[22, 128, 142], [48, 98, 196]]
  for (let j = 0; j < 640; j++) {
    const a = hash(j, 11) * TAU
    const idx = Math.round(a / step) % LAP
    if (slots.has(idx) || (idx === 0 && !todayDone)) continue
    const r0 = pr * (1.1 + hash(j, 12) * 0.14)
    const r1 = R * (0.7 + hash(j, 13) * 0.28)
    g.strokeStyle = rgba(sk[hash(j, 17) < 0.62 ? 0 : 1], (dark ? 0.08 : 0.09) + hash(j, 15) * (dark ? 0.12 : 0.14))
    g.lineWidth = Math.max(0.7, (0.5 + hash(j, 16) * 0.9) * k * 1.6)
    fiber(a, r0, r1, (hash(j, 14) - 0.5) * 0.08)
  }
  g.strokeStyle = rgba(sk[0], dark ? 0.3 : 0.38)
  g.lineWidth = 1.1 * px
  g.beginPath()
  g.arc(0, 0, R, 0, TAU)
  g.stroke()

  // 2) yaşanmış günler: ışığın hafif taşması (ilk ışın küçük kalmasın; değerlendirici 1), renkli iris zemini, sıcak yaka
  //    ve limbus (drawIris'in "dolu dilim"i)
  g.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  for (const s of slots.values()) {
    const rE = rOf(s.len)
    const halo = g.createRadialGradient(0, 0, pr, 0, 0, rE * 1.08)
    halo.addColorStop(0, rgba(TEAL, 0))
    halo.addColorStop(0.6, rgba(TEAL, dark ? 0.16 : 0.12))
    halo.addColorStop(1, rgba(BLUE, 0))
    g.fillStyle = halo
    wedge(s.idx, rE * 1.08, step * 0.45)
    g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  // Bugünün ışını yanmaya başladıysa (ilk günde İlk Bakış'la) çevresine yumuşak bir ışıma: ilk günün gözünde parlayan
  // yer bugünün ışınıdır (5 saniye kapı turu 1: "hiçbir yeri parlamıyor", "bugünün ışını seçilmiyor")
  if (!todayDone && slots.has(0)) {
    const rE = rOf(slots.get(0).len)
    g.save()
    g.globalCompositeOperation = dark ? 'lighter' : 'source-over'
    const gl = g.createRadialGradient(0, 0, pr, 0, 0, rE * 1.16)
    gl.addColorStop(0, rgba(TEAL, 0))
    gl.addColorStop(0.62, rgba(TEAL, dark ? 0.28 : 0.26))
    gl.addColorStop(0.9, rgba(BLUE, dark ? 0.15 : 0.13))
    gl.addColorStop(1, rgba(BLUE, 0))
    g.fillStyle = gl
    wedge(0, rE * 1.16, step * 0.7)
    g.fill()
    g.restore()
  }
  const litGrad = (rE) => {
    const gr = g.createRadialGradient(0, 0, rE * 0.25, 0, 0, rE)
    if (dark) {
      gr.addColorStop(0, '#05141a'); gr.addColorStop(0.3, '#0d3a3f'); gr.addColorStop(0.52, '#127b86'); gr.addColorStop(0.74, '#155fa0'); gr.addColorStop(0.9, 'rgba(11,36,80,0.85)'); gr.addColorStop(1, 'rgba(3,8,20,0)')
    } else {
      gr.addColorStop(0, '#0a2a30'); gr.addColorStop(0.3, '#12555c'); gr.addColorStop(0.52, '#1792a0'); gr.addColorStop(0.74, '#2c6fc0'); gr.addColorStop(0.9, 'rgba(29,63,122,0.8)'); gr.addColorStop(1, 'rgba(29,63,122,0)')
    }
    return gr
  }
  for (const s of slots.values()) {
    const rE = rOf(s.len)
    g.save()
    wedge(s.idx, rE, 0.004)
    g.clip()
    g.fillStyle = litGrad(rE)
    g.beginPath()
    g.arc(0, 0, R, 0, TAU)
    g.fill()
    const col = g.createRadialGradient(0, 0, pr * 0.95, 0, 0, pr * (1.7 + 0.12 * (s.layers - 1)))
    col.addColorStop(0, rgba(GOLD, Math.min(0.75, (dark ? 0.46 : 0.42) + 0.1 * (s.layers - 1))))
    col.addColorStop(0.55, rgba([210, 140, 40], 0.2))
    col.addColorStop(1, rgba(GOLD, 0))
    g.fillStyle = col
    g.beginPath()
    g.arc(0, 0, R, 0, TAU)
    g.fill()
    const lb = g.createRadialGradient(0, 0, rE * 0.8, 0, 0, rE)
    lb.addColorStop(0, 'rgba(2,6,16,0)')
    lb.addColorStop(0.84, dark ? 'rgba(2,6,16,0.5)' : 'rgba(20,40,60,0.22)')
    lb.addColorStop(1, 'rgba(2,6,16,0)')
    g.fillStyle = lb
    g.beginPath()
    g.arc(0, 0, rE, 0, TAU)
    g.fill()
    g.restore()
  }

  // 3) lifler: her gün kendi lif demeti; sonraki turlar aynı yere yeni lifler (daha çok altın ve açık lif)
  const cols = [TEAL, PALE, BLUE, LBLUE]
  g.globalCompositeOperation = 'lighter'
  for (const s of slots.values()) {
    const rE = rOf(s.len)
    const n = 96 + 48 * (s.layers - 1)
    for (let j = 0; j < n; j++) {
      const q = s.idx * 997 + j * 7 + 3
      const a = s.idx * step + (hash(q, 1) - 0.5) * step * 0.98
      const r0 = pr * (1.02 + hash(q, 2) * 0.16)
      const r1 = rE * (0.66 + hash(q, 3) * 0.33)
      const later = s.layers > 1 && hash(q, 9) < 0.16 * (s.layers - 1)
      const c = later ? (hash(q, 10) < 0.6 ? GOLD : PALE) : hash(q, 7) < 0.28 && r1 < R * 0.74 ? GOLD : cols[Math.floor(hash(q, 5) * 4)]
      g.strokeStyle = rgba(c, (0.07 + hash(q, 8) * 0.24) / (1 + (dark ? 0.25 : 0.45) * (s.layers - 1)))
      g.lineWidth = Math.max(0.8, (0.6 + hash(q, 6) * 1.8) * k * 1.6)
      fiber(a, r0, r1, (hash(q, 4) - 0.5) * 0.09)
    }
  }
  // Bugünün yanmaya başlayan ışını (yol bitmedi): açık renkli, daha parlak lifler; ışın bir ışık demeti gibi okunsun
  // (ilk günde tek yanan yer; 5 saniye kapı turu 1)
  if (!todayDone && slots.has(0)) {
    const rE = rOf(slots.get(0).len)
    for (let j = 0; j < 64; j++) {
      const q = 7919 + j * 13
      const a = (hash(q, 1) - 0.5) * step * 0.8
      const r0 = pr * (1.04 + hash(q, 2) * 0.12)
      const r1 = rE * (0.8 + hash(q, 3) * 0.22)
      g.strokeStyle = rgba(hash(q, 5) < 0.55 ? PALE : TEAL, (dark ? 0.16 : 0.2) + hash(q, 8) * 0.3)
      g.lineWidth = Math.max(0.8, (0.6 + hash(q, 6) * 1.4) * k * 1.6)
      fiber(a, r0, r1, (hash(q, 4) - 0.5) * 0.06)
    }
  }
  g.globalCompositeOperation = 'source-over'

  // 4) günlerin arası: iki yaşanmış gün yan yanaysa ince bir ayraç (günler sayılabilsin)
  g.strokeStyle = dark ? 'rgba(7,12,18,0.7)' : 'rgba(243,246,248,0.62)'
  g.lineWidth = 1.15 * px
  for (const s of slots.values()) {
    const prev = slots.get((s.idx + LAP - 1) % LAP)
    if (!prev) continue
    const a = s.idx * step - step / 2
    const [x0, y0] = P(a, pr * 1.14)
    const [x1, y1] = P(a, Math.min(rOf(s.len), rOf(prev.len)) * 0.985)
    g.beginPath()
    g.moveTo(x0, y0)
    g.lineTo(x1, y1)
    g.stroke()
  }

  // 5) bugünün yeri (yol bitmediyse): vurgu renginde hafif dilim ve birkaç lif (bugün ışını yanmaya başladıysa lifler
  //    ışının dışında kalır)
  //    Dilimin kenarı ince bir vurgu çizgisiyle çizilir: bugünün ışınının dolacağı yer bir bakışta seçilsin (5 saniye kapı
  //    turu 1: "neyin dolacağını anlamıyorum"); yanan kısım dilimin içinde kalır, renk yanan ışının üstüne binmez.
  if (!todayDone) {
    const from = slots.has(0) ? rOf(slots.get(0).len) : pr * 1.08
    g.save()
    wedge(0, R)
    g.clip()
    const tg = g.createRadialGradient(0, 0, pr, 0, 0, R)
    tg.addColorStop(0, rgba(acc, dark ? 0.2 : 0.16))
    tg.addColorStop(1, rgba(acc, dark ? 0.06 : 0.06))
    g.fillStyle = tg
    g.beginPath()
    g.arc(0, 0, R, 0, TAU)
    g.arc(0, 0, from, 0, TAU, true)
    g.fill('evenodd')
    g.restore()
    for (let j = 0; j < 46; j++) {
      const a = (hash(j, 21) - 0.5) * step * 0.92
      const r0 = Math.max(from, pr * (1.08 + hash(j, 24) * 0.12))
      const r1 = R * (0.74 + hash(j, 25) * 0.24)
      if (r1 <= r0) continue
      g.strokeStyle = rgba(acc, (dark ? 0.22 : 0.3) + hash(j, 22) * 0.3)
      g.lineWidth = Math.max(0.8, (0.6 + hash(j, 23) * 1.2) * k * 1.6)
      fiber(a, r0, r1, (hash(j, 26) - 0.5) * 0.06)
    }
    const e0 = -step / 2
    const e1 = step / 2
    const [ax, ay] = P(e0, pr * 1.1)
    const [bx, by] = P(e1, pr * 1.1)
    g.save()
    g.strokeStyle = rgba(acc, dark ? 0.62 : 0.6)
    g.lineWidth = 1.1 * px
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(ax, ay)
    g.arc(0, 0, R, A(e0), A(e1))
    g.lineTo(bx, by)
    g.stroke()
    g.restore()
  }

  // 6) yaylar: seri (mercek rengi; tasarım sisteminde yalnız ödül ve seri), bugünün yayı (vurgu rengi), tur halkaları
  const lens = dark ? [255, 177, 59] : [245, 166, 35]
  const RR = R * 1.07
  const ring = (a0, a1, col, w, glow, r = RR) => {
    g.save()
    g.strokeStyle = rgba(col, 1)
    g.lineWidth = w
    g.lineCap = 'round'
    if (glow) {
      g.shadowColor = rgba(col, 0.75)
      g.shadowBlur = 9 * k * 1.6
    }
    g.beginPath()
    g.arc(0, 0, r, A(a0), A(a1))
    g.stroke()
    g.restore()
  }
  const todayLit = todayN > 0
  if (streak >= 3) {
    const dStart = todayLit ? 0 : 1
    const cover = Math.min(streak, todayLit ? LAP : LAP - 1)
    const aEnd = -dStart * step + step / 2 - 0.035
    const aStart = -(dStart + cover - 1) * step - step / 2 + 0.035
    ring(aStart, aEnd, lens, 3.4 * px, true)
  }
  if (!todayDone) ring(-step / 2 + 0.03, step / 2 - 0.03, acc, 4 * px, true)
  // Biten turlar: gözün dışında ince halkalar (en yenisi en dışta ve biraz daha parlak)
  const laps = Math.floor((days.length + (todayLit ? 1 : 0)) / LAP)
  for (let i = 0; i < (lapRings ? Math.min(LAP_RINGS_MAX, laps) : 0); i++) {
    const r = S * (0.468 + 0.0125 * i)
    g.save()
    g.strokeStyle = rgba(i === Math.min(LAP_RINGS_MAX, laps) - 1 ? TEAL : BLUE, dark ? 0.55 : 0.5)
    g.lineWidth = 1.3 * px
    g.beginPath()
    g.arc(0, 0, r, 0, TAU)
    g.stroke()
    g.restore()
  }

  // 7) yol bitti: bugünün ışını parlar ve kenarında mercek renginde kısa ışıltı çizgileri
  if (todayDone && slots.has(0)) {
    const rE = rOf(slots.get(0).len)
    g.save()
    g.globalCompositeOperation = 'lighter'
    const gl = g.createRadialGradient(0, 0, pr, 0, 0, rE * 1.1)
    gl.addColorStop(0, rgba(PALE, 0))
    gl.addColorStop(0.7, rgba(PALE, dark ? 0.3 : 0.22))
    gl.addColorStop(1, rgba(TEAL, 0))
    g.fillStyle = gl
    wedge(0, rE * 1.1, step * 0.3)
    g.fill()
    g.restore()
    ring(-step / 2 + 0.03, step / 2 - 0.03, lens, 4 * px, true)
    g.save()
    g.strokeStyle = rgba(lens, 1)
    g.lineCap = 'round'
    g.lineWidth = 2.6 * px
    for (const f of [-1, -0.5, 0, 0.5, 1]) {
      const a = f * step * 1.15
      const long = f === 0 ? 1 : Math.abs(f) === 0.5 ? 0.8 : 0.62
      const [x0, y0] = P(a, RR + S * 0.016)
      const [x1, y1] = P(a, RR + S * (0.016 + 0.03 * long))
      g.beginPath()
      g.moveTo(x0, y0)
      g.lineTo(x1, y1)
      g.stroke()
    }
    g.restore()
  }

  // 8) göz bebeği ve yansıma
  let gr = g.createRadialGradient(0, 0, pr * 0.86, 0, 0, pr * 1.14)
  gr.addColorStop(0, '#02060a')
  gr.addColorStop(1, 'rgba(2,6,10,0)')
  g.fillStyle = gr
  g.beginPath()
  g.arc(0, 0, pr * 1.14, 0, TAU)
  g.fill()
  g.fillStyle = '#02060a'
  g.beginPath()
  g.arc(0, 0, pr, 0, TAU)
  g.fill()
  g.save()
  g.translate(-pr * 0.6, -pr * 0.62)
  g.rotate(-0.75)
  gr = g.createRadialGradient(0, 0, 0, 0, 0, pr * 0.18)
  gr.addColorStop(0, 'rgba(255,255,255,0.22)')
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr
  g.beginPath()
  g.ellipse(0, 0, pr * 0.18, pr * 0.1, 0, 0, TAU)
  g.fill()
  g.restore()
}
