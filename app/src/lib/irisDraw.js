// İris haritası çizimi (components/IrisMap.jsx; Artifact "Nefona Başlangıç Kartı", onaylı). Giriş ekranındaki irisin
// (lib/introStill.js) dili: lifler, sıcak yaka, limbus, göz bebeği. 7 dilim (lib/iris.js IRIS_ORDER, Göz tepede, saat yönü):
// dolu dilimin lifleri renkli yanar, boş dilim gri kalır; sıradaki dilim (cur) altın lif ve dış kenarında altın yayla.
// Tuvalde yazı yok (çeviri): alan adları DOM'da. Prosedürel: ağ yok, görsel dosyası yok.
const TAU = Math.PI * 2
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x) }
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const TEAL = [25, 194, 209], BLUE = [62, 123, 250], GOLD = [255, 177, 59], PALE = [150, 232, 240]
const N = 7
const secOf = (a) => { // a: tepeden saat yönünde radyan
  const d = ((a / TAU) * 360 + 360 / N / 2 + 360) % 360
  return Math.floor(d / (360 / N))
}
export function drawIris(cv, { size, filled = [], cur = -1, dark = true, fibers = size > 150 ? 2600 : 1500, ground = dark ? '#070c12' : '#f3f6f8', dpr = 2 } = {}) {
  const S = Math.round(size * dpr)
  cv.width = cv.height = S
  const g = cv.getContext('2d')
  if (!g) return
  const R = S * 0.44
  const on = new Set(filled)
  g.translate(S / 2, S / 2)
  // taban disk: dolu dilimler renkli iris gradyanı, boşlar nötr
  for (let i = 0; i < N; i++) {
    const a0 = -Math.PI / 2 + (i - 0.5) * (TAU / N), a1 = a0 + TAU / N
    g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); g.clip()
    const gr = g.createRadialGradient(0, 0, R * 0.25, 0, 0, R)
    if (on.has(i) || i === cur) {
      if (dark) { gr.addColorStop(0, '#05141a'); gr.addColorStop(0.3, '#0d3a3f'); gr.addColorStop(0.52, '#127b86'); gr.addColorStop(0.74, '#155fa0'); gr.addColorStop(0.92, '#0b2450'); gr.addColorStop(1, 'rgba(3,8,20,0)') }
      else { gr.addColorStop(0, '#0a2a30'); gr.addColorStop(0.3, '#12555c'); gr.addColorStop(0.52, '#1792a0'); gr.addColorStop(0.74, '#2c6fc0'); gr.addColorStop(0.92, '#1d3f7a'); gr.addColorStop(1, 'rgba(29,63,122,0)') }
      if (i === cur && !on.has(i)) g.globalAlpha = 0.55
    } else if (dark) { gr.addColorStop(0, '#0a1016'); gr.addColorStop(0.5, '#18222c'); gr.addColorStop(0.9, '#121a22'); gr.addColorStop(1, 'rgba(10,16,22,0)') }
    else { gr.addColorStop(0, '#c9d3db'); gr.addColorStop(0.5, '#dbe3e9'); gr.addColorStop(0.9, '#d2dbe2'); gr.addColorStop(1, 'rgba(210,219,226,0)') }
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); g.restore()
  }
  // sıcak yaka (yalnız dolu dilimlerde belirgin)
  for (let i = 0; i < N; i++) {
    if (!on.has(i)) continue
    const a0 = -Math.PI / 2 + (i - 0.5) * (TAU / N), a1 = a0 + TAU / N
    g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); g.clip()
    const gr = g.createRadialGradient(0, 0, R * 0.28, 0, 0, R * 0.56)
    gr.addColorStop(0, rgba(GOLD, dark ? 0.5 : 0.45)); gr.addColorStop(0.55, rgba([210, 140, 40], 0.2)); gr.addColorStop(1, rgba(GOLD, 0))
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R * 0.56, 0, TAU); g.fill(); g.restore()
  }
  // lifler
  const cols = [TEAL, PALE, BLUE, [120, 170, 255]]
  const k = S / 1024
  for (let j = 0; j < fibers; j++) {
    const a = hash(j, 1) * TAU // tepeden saat yönü
    const sec = secOf(a)
    const lit = on.has(sec), focus = sec === cur
    const r0 = R * (0.3 + hash(j, 2) * 0.08)
    const r1 = R * (0.62 + hash(j, 3) * 0.35)
    const bend = (hash(j, 4) - 0.5) * 0.09
    let col, al
    if (focus) { col = hash(j, 5) < 0.7 ? GOLD : [255, 214, 160]; al = 0.1 + hash(j, 8) * 0.28 }
    else if (lit) { col = hash(j, 7) < 0.3 && r1 < R * 0.72 ? GOLD : cols[Math.floor(hash(j, 5) * 4)]; al = 0.06 + hash(j, 8) * 0.2 }
    else { col = dark ? [150, 170, 190] : [120, 138, 155]; al = dark ? 0.03 + hash(j, 8) * 0.07 : 0.05 + hash(j, 8) * 0.12 }
    g.globalCompositeOperation = dark || lit || focus ? 'lighter' : 'source-over'
    g.strokeStyle = rgba(col, al)
    g.lineWidth = (0.6 + hash(j, 9) * 1.8) * k * 1.6
    const p = (ang, r) => [Math.sin(ang) * r, -Math.cos(ang) * r]
    const [x0, y0] = p(a, r0), [xm, ym] = p(a + bend, (r0 + r1) / 2), [x1, y1] = p(a + bend * 0.4, r1)
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, ym, x1, y1); g.stroke()
  }
  g.globalCompositeOperation = 'source-over'
  // yaka çizgisi (yalnız dolu dilimlerde)
  g.save(); g.beginPath()
  for (let i = 0; i < N; i++) { if (!on.has(i)) continue; const a0 = -Math.PI / 2 + (i - 0.5) * (TAU / N); g.moveTo(0, 0); g.arc(0, 0, R, a0, a0 + TAU / N); g.closePath() }
  g.clip()
  g.strokeStyle = dark ? 'rgba(255,196,110,0.2)' : 'rgba(180,120,30,0.22)'; g.lineWidth = 4 * k * 1.4
  g.beginPath()
  for (let j = 0; j <= 240; j++) { const a = (j / 240) * TAU; const r = R * (0.45 + 0.025 * Math.sin(a * 13) + 0.015 * Math.sin(a * 29 + 1.3)); j ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r) }
  g.closePath(); g.stroke(); g.restore()
  // dilim aralıkları: ince, iris dokusunu bölmeden
  g.strokeStyle = ground; g.lineWidth = 2.2 * k * 1.6
  for (let i = 0; i < N; i++) { const a = (i - 0.5) * (TAU / N); g.beginPath(); g.moveTo(Math.sin(a) * R * 0.34, -Math.cos(a) * R * 0.34); g.lineTo(Math.sin(a) * R * 1.01, -Math.cos(a) * R * 1.01); g.stroke() }
  // limbus
  let gr = g.createRadialGradient(0, 0, R * 0.8, 0, 0, R)
  gr.addColorStop(0, 'rgba(2,6,16,0)'); gr.addColorStop(0.78, dark ? 'rgba(2,6,16,0.7)' : 'rgba(20,40,60,0.28)'); gr.addColorStop(1, 'rgba(2,6,16,0)')
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
  // göz bebeği + yansıma
  const pr = R * 0.33
  gr = g.createRadialGradient(0, 0, pr * 0.8, 0, 0, pr * 1.1)
  gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, pr * 1.1, 0, TAU); g.fill()
  g.save(); g.translate(-R * 0.3, -R * 0.34); g.rotate(-0.4)
  gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.14)
  gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, R * 0.14, R * 0.09, 0, 0, TAU); g.fill(); g.restore()
  // odak: sıradaki dilimin dış kenarında altın yay + uç çizgileri
  if (cur >= 0) {
    const a0 = -Math.PI / 2 + (cur - 0.5) * (TAU / N) + 0.06, a1 = a0 + TAU / N - 0.12
    g.save(); g.strokeStyle = rgba(GOLD, 0.95); g.lineWidth = 3 * k * 1.6; g.lineCap = 'round'; g.shadowColor = rgba(GOLD, 0.8); g.shadowBlur = 10 * k
    g.beginPath(); g.arc(0, 0, R * 1.07, a0, a1); g.stroke()
    for (const a of [a0, a1]) { g.beginPath(); g.moveTo(Math.cos(a) * R * 1.07, Math.sin(a) * R * 1.07); g.lineTo(Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98); g.stroke() }
    g.restore()
  }
}

// Göz kalibrasyonu hedefi (Artifact "Nefona Göz Kalibrasyonu", onaylı): tek parça küçük iris. Bakış noktası göz bebeğinin
// ortasında altın nokta; iris ince bir artıyla bölünür (Thaler ve ark. 2013, Vision Res, doi:10.1016/j.visres.2012.10.012:
// halka + artı + merkez nokta en sabit bakışı verdi). Artı "delik" çizilir (destination-out): arkadaki zemin görünür,
// tema renginden bağımsız. pupil: göz bebeği yarıçap oranı (kabulde küçülür); fix: altın nokta çizilsin mi.
export function drawCalIris(cv, { size = 52, dark = true, pupil = 0.3, fix = true, dpr = 2 } = {}) {
  const S = Math.round(size * dpr)
  cv.width = cv.height = S
  const g = cv.getContext('2d')
  if (!g) return
  const R = S / 2
  g.translate(R, R)
  const gr = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R)
  if (dark) { gr.addColorStop(0, '#05141a'); gr.addColorStop(0.32, '#0e4148'); gr.addColorStop(0.55, '#138692'); gr.addColorStop(0.78, '#1a63a8'); gr.addColorStop(0.95, '#0a2248'); gr.addColorStop(1, '#040a16') }
  else { gr.addColorStop(0, '#0a2a30'); gr.addColorStop(0.32, '#135c63'); gr.addColorStop(0.55, '#1896a4'); gr.addColorStop(0.78, '#2c70c2'); gr.addColorStop(0.95, '#1d3f7a'); gr.addColorStop(1, '#12305f') }
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
  // lifler: göz bebeğinden limbusa; birkaçı altın (sıcak yaka)
  for (let i = 0; i < 900; i++) {
    const a = hash(i) * TAU, r0 = R * (pupil + 0.04 + hash(i, 1) * 0.12), r1 = R * (0.62 + hash(i, 2) * 0.34)
    const w = a + (hash(i, 3) - 0.5) * 0.18
    g.strokeStyle = hash(i, 4) < 0.18 ? rgba(GOLD, 0.18 + hash(i, 5) * 0.3) : rgba(PALE, 0.05 + hash(i, 5) * 0.18)
    g.lineWidth = (0.6 + hash(i, 6) * 1.1) * (S / 240)
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0)
    g.quadraticCurveTo(Math.cos(w) * (r0 + r1) / 2, Math.sin(w) * (r0 + r1) / 2, Math.cos(a) * r1, Math.sin(a) * r1); g.stroke()
  }
  const col = g.createRadialGradient(0, 0, R * pupil, 0, 0, R * (pupil + 0.22))
  col.addColorStop(0, rgba(GOLD, 0.42)); col.addColorStop(1, rgba(GOLD, 0))
  g.fillStyle = col; g.beginPath(); g.arc(0, 0, R * (pupil + 0.22), 0, TAU); g.fill()
  const lim = g.createRadialGradient(0, 0, R * 0.84, 0, 0, R)
  lim.addColorStop(0, 'rgba(3,8,20,0)'); lim.addColorStop(1, 'rgba(3,8,20,0.9)')
  g.fillStyle = lim; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
  g.fillStyle = '#02060a'; g.beginPath(); g.arc(0, 0, R * pupil, 0, TAU); g.fill()
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(-R * 0.34, -R * 0.36, R * 0.07, 0, TAU); g.fill()
  // artı: göz bebeği kenarından limbusa, zemin görünsün diye delik
  g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = S * 0.045; g.lineCap = 'butt'
  const r0 = R * (pupil + 0.02)
  g.beginPath()
  for (const [cx, cy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(cx * r0, cy * r0); g.lineTo(cx * R, cy * R) }
  g.stroke(); g.restore()
  if (fix) {
    const fg = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.2)
    fg.addColorStop(0, rgba(GOLD, 0.55)); fg.addColorStop(1, rgba(GOLD, 0))
    g.fillStyle = fg; g.beginPath(); g.arc(0, 0, R * 0.2, 0, TAU); g.fill()
    g.fillStyle = rgba(GOLD, 1); g.beginPath(); g.arc(0, 0, R * 0.085, 0, TAU); g.fill()
  }
}
