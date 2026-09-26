// Gökyüzü molası sahnesi (tuval): gökyüzü, güneş/ay, yumuşak bulutlar, kuşlar, deniz / şehir / tepeler / çatılar ve
// soruyu gösteren vurgular (ufuk boyunca ilerleyen ışık, uzak nokta halesi, bulut yön oku). Tasarım: Artifact
// "Gökyüzü Molası 2" (onaylı). Güvenlik: yanıp sönme yok; her hareket yavaş; yıldızlar 0,05 Hz'de hafifçe değişir.
// Yalnız görünüm; iddia değil.
export const PAL = {
  dawn: {
    sky: ['#2E3E6B', '#8E6E95', '#E7A987', '#F6D2A8'],
    sea: ['#6F7FA0', '#2D3B5C'],
    far: '#6D6A8C',
    mid: '#4B4868',
    near: '#2B2A44',
    sun: '#FFD7A0',
    cloud: [255, 232, 222],
  },
  day: {
    sky: ['#2F6EA8', '#4F92CF', '#8FC0E8', '#CFE6F5'],
    sea: ['#5A9AC4', '#1E4E78'],
    far: '#9DB6CB',
    mid: '#6F8FA6',
    near: '#34546A',
    sun: '#FFFBEA',
    cloud: [255, 255, 255],
  },
  dusk: {
    sky: ['#1E2350', '#5B3A6E', '#C0607A', '#F29A5E'],
    sea: ['#7A4E6A', '#231B3A'],
    far: '#6A4A6E',
    mid: '#43304F',
    near: '#221A30',
    sun: '#FFB36B',
    cloud: [255, 200, 190],
  },
  night: {
    sky: ['#02040C', '#07102A', '#0E1C3C', '#1B2B4E'],
    sea: ['#15223C', '#050A16'],
    far: '#1A2744',
    mid: '#121C33',
    near: '#080E1C',
    sun: '#E8EEF8',
    cloud: [150, 165, 200],
  },
}
export const HZ = 0.66 // ufuk yüksekliği (oran)
const rnd = (s) => {
  let a = s >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Yumuşak bulut: çok sayıda yarı saydam dairenin kümesi (önceden hazırlanır)
function makeCloud(r, w, h, rgb, alpha) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  const puffs = 16 + Math.floor(r() * 10)
  for (let i = 0; i < puffs; i++) {
    const x = w * (0.15 + 0.7 * r()),
      y = h * (0.45 + 0.25 * (r() - 0.5)) - (Math.abs(x - w / 2) < w * 0.25 ? h * 0.12 * r() : 0)
    // Yarıçap tuvalin kenarını aşmasın (aşarsa bulut düz bir çizgiyle kesilir)
    const rad = Math.max(2, Math.min(h * (0.22 + 0.28 * r()), x, w - x, y, h - y))
    const gr = g.createRadialGradient(x, y, 0, x, y, rad)
    gr.addColorStop(0, `rgba(${rgb},${alpha})`)
    gr.addColorStop(0.6, `rgba(${rgb},${alpha * 0.55})`)
    gr.addColorStop(1, `rgba(${rgb},0)`)
    g.fillStyle = gr
    g.beginPath()
    g.arc(x, y, rad, 0, 7)
    g.fill()
  }
  // alt kenar biraz gölgeli
  const sh = g.createLinearGradient(0, h * 0.45, 0, h)
  sh.addColorStop(0, 'rgba(0,0,0,0)')
  sh.addColorStop(1, 'rgba(40,60,90,.18)')
  g.globalCompositeOperation = 'source-atop'
  g.fillStyle = sh
  g.fillRect(0, 0, w, h)
  return c
}

export function createScene(canvas, { mini = false } = {}) {
  const g = canvas.getContext('2d')
  const S = { env: 'sea', part: 'day', W: 0, H: 0, clouds: [], stars: [], birds: [], hl: null, seed: 7 }
  function build() {
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1)
    const r0 = canvas.getBoundingClientRect()
    S.W = r0.width
    S.H = r0.height
    canvas.width = Math.round(S.W * dpr)
    canvas.height = Math.round(S.H * dpr)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const r = rnd(S.seed)
    const p = PAL[S.part]
    const n = mini ? 3 : 7
    S.clouds = Array.from({ length: n }, (_, i) => {
      const depth = 0.35 + 0.65 * (i / n) // uzak → yakın
      const w = S.W * (0.35 + 0.45 * depth),
        h = w * 0.34
      return {
        img: makeCloud(r, Math.round(w), Math.round(h), p.cloud.join(','), S.part === 'night' ? 0.22 : 0.5 + 0.35 * depth),
        x: r() * S.W * 1.4 - S.W * 0.2,
        y: S.H * (0.08 + 0.42 * (1 - depth)) + r() * S.H * 0.06,
        v: mini ? 3 : 4 + 9 * depth,
        w,
        h,
      }
    })
    S.stars = Array.from({ length: mini ? 30 : 140 }, () => ({ x: r(), y: r() * HZ * 0.95, s: 0.3 + r() * 1.1, a: 0.35 + r() * 0.6, ph: r() * 6.28 }))
    S.birds = Array.from({ length: 4 }, (_, i) => ({ x: r(), y: 0.2 + r() * 0.25, v: 0.006 + r() * 0.006, s: 4 + r() * 4, ph: r() * 6 }))
    S.hills = [0, 1, 2].map((k) => {
      const pts = []
      const rr = rnd(S.seed + k * 13)
      for (let i = 0; i <= 12; i++) pts.push(rr())
      return pts
    })
    S.city = (() => {
      const rr = rnd(S.seed + 99),
        b = []
      let x = -5
      while (x < S.W + 10) {
        const w = 12 + rr() * 30
        b.push({ x, w, h: mini ? 18 + rr() * 30 : S.H * (0.025 + rr() * 0.075), far: rr() < 0.45, win: rr() })
        x += w + (rr() < 0.3 ? 2 : 0)
      }
      return b
    })()
  }
  const hzY = () => S.H * HZ
  // Tepe katmanları: [katman, renk anahtarı, ufuktan yükseklik, genlik]. Uzak katman daha alçak ve soluk (hava perspektifi).
  const HILL_LAYERS = [
    [2, 'far', 10, 0.09],
    [1, 'mid', 2, 0.07],
    [0, 'near', -14, 0.05],
  ]
  function hillY(k, x, off, amp) {
    const pts = S.hills[k],
      u = Math.max(0, Math.min(12, (x / S.W) * 12)),
      i = Math.min(11, Math.floor(u)),
      f = u - i
    const v = pts[i] + (pts[i + 1] - pts[i]) * (0.5 - 0.5 * Math.cos(Math.PI * f))
    return hzY() - off - v * S.H * amp
  }
  // ufuk çizgisinin yüksekliği x noktasında (deniz: düz; şehir: çatılar; dağ: tepeler; gökyüzü: alçak çatılar)
  function horizonAt(x) {
    const H = hzY()
    if (S.env === 'sea') return H
    if (S.env === 'hills') return Math.min(...HILL_LAYERS.map(([k, , off, amp]) => hillY(k, x, off, amp))) // gökyüzüyle birleşen en üst kenar
    if (S.env === 'city') {
      for (const b of S.city) if (!b.far && x >= b.x && x <= b.x + b.w) return H + 8 - b.h * 0.9
      return H + 8
    }
    return H + 26
  }
  function draw(t) {
    const { W, H: Hh } = S
    const p = PAL[S.part]
    const H = hzY()
    // gökyüzü
    const sk = g.createLinearGradient(0, 0, 0, H + 10)
    sk.addColorStop(0, p.sky[0])
    sk.addColorStop(0.45, p.sky[1])
    sk.addColorStop(0.8, p.sky[2])
    sk.addColorStop(1, p.sky[3])
    g.fillStyle = sk
    g.fillRect(0, 0, W, Hh)
    // yıldızlar (gece): çok yavaş, hafif parlaklık değişimi (0,05 Hz; yanıp sönme değil)
    if (S.part === 'night')
      for (const s of S.stars) {
        g.globalAlpha = s.a * (0.85 + 0.15 * Math.sin(t * 0.3 + s.ph))
        g.fillStyle = '#fff'
        g.beginPath()
        g.arc(s.x * W, s.y * Hh, s.s, 0, 7)
        g.fill()
      }
    g.globalAlpha = 1
    // güneş / ay (güneş gündüz bulut arkasında ve kenarda; akşam/sabah ufukta)
    const sunX = S.part === 'dusk' ? W * 0.78 : S.part === 'dawn' ? W * 0.2 : S.part === 'night' ? W * 0.76 : W * 0.86
    const sunY = S.part === 'dusk' || S.part === 'dawn' ? H - Hh * 0.03 : Hh * 0.12
    const sr = S.part === 'night' ? Hh * 0.022 : Hh * 0.03
    const glow = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, sr * (S.part === 'night' ? 6 : 9))
    glow.addColorStop(0, p.sun + (S.part === 'night' ? '55' : 'aa'))
    glow.addColorStop(1, p.sun + '00')
    g.fillStyle = glow
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = p.sun
    g.beginPath()
    g.arc(sunX, sunY, sr, 0, 7)
    g.fill()
    if (S.part === 'night') {
      g.fillStyle = p.sky[1]
      g.beginPath()
      g.arc(sunX + sr * 0.45, sunY - sr * 0.2, sr * 0.9, 0, 7)
      g.fill()
    }
    // bulutlar (parallaks)
    for (const c of S.clouds) {
      const x = ((c.x + t * c.v) % (W + c.w * 1.2)) - c.w * 0.6
      g.drawImage(c.img, x, c.y, c.w, c.h)
    }
    // kuşlar (gündüz/sabah): uzakta süzülür, kanat yavaş çırpar
    if (!mini && (S.part === 'day' || S.part === 'dawn')) {
      g.strokeStyle = 'rgba(30,40,55,.55)'
      g.lineWidth = 1.2
      g.lineCap = 'round'
      for (const b of S.birds) {
        const x = (((b.x + t * b.v) % 1.2) - 0.1) * W,
          y = b.y * Hh + Math.sin(t * 0.4 + b.ph) * 4,
          f = Math.sin(t * 2.2 + b.ph) * 0.5 + 0.5
        g.beginPath()
        g.moveTo(x - b.s, y - f * b.s * 0.5)
        g.quadraticCurveTo(x - b.s * 0.4, y - b.s * 0.2, x, y)
        g.quadraticCurveTo(x + b.s * 0.4, y - b.s * 0.2, x + b.s, y - f * b.s * 0.5)
        g.stroke()
      }
    }
    // ön plan
    if (S.env === 'sea') drawSea(t, p, H)
    else if (S.env === 'hills') drawHills(p, H)
    else if (S.env === 'city') drawCity(p, H)
    else drawRoofs(p, H)
    // ön planın altı karanlığa gömülür: göz, gökyüzüyle birleşen kenarda kalsın
    if (S.env !== 'sea') {
      const fade = g.createLinearGradient(0, H + 10, 0, Hh)
      fade.addColorStop(0, 'rgba(4,8,14,0)')
      fade.addColorStop(1, 'rgba(4,8,14,0.85)')
      g.fillStyle = fade
      g.fillRect(0, H + 10, W, Hh - H - 10)
    }
    // vurgu: ufuk çizgisi boyunca ilerleyen yumuşak ışık
    if (S.hl && S.hl.kind === 'line') {
      const u = Math.max(0, Math.min(1, (t - S.hl.t0) / S.hl.dur)),
        xh = u * W // rAF zamanı vurgudan az önce olabilir
      g.lineWidth = 2.2
      g.lineCap = 'round'
      const grd = g.createLinearGradient(xh - W * 0.45, 0, xh, 0)
      grd.addColorStop(0, 'rgba(255,248,220,0)')
      grd.addColorStop(1, 'rgba(255,248,220,.95)')
      g.strokeStyle = grd
      g.beginPath()
      for (let x = Math.max(0, xh - W * 0.45); x <= xh; x += 3) {
        const y = horizonAt(x) - 1
        x === Math.max(0, xh - W * 0.45) ? g.moveTo(x, y) : g.lineTo(x, y)
      }
      g.stroke()
      const y = horizonAt(xh) - 1
      const dot = g.createRadialGradient(xh, y, 0, xh, y, 14)
      dot.addColorStop(0, 'rgba(255,250,230,.9)')
      dot.addColorStop(1, 'rgba(255,250,230,0)')
      g.fillStyle = dot
      g.fillRect(xh - 14, y - 14, 28, 28)
    }
    if (S.hl && S.hl.kind === 'far') {
      const age = Math.max(0, t - S.hl.t0) % 5,
        x = W * 0.3,
        y = horizonAt(W * 0.3) - 4
      g.strokeStyle = `rgba(255,248,220,${0.55 * (1 - age / 5)})`
      g.lineWidth = 1.5
      g.beginPath()
      g.arc(x, y, 6 + age * 10, 0, 7)
      g.stroke()
    }
    if (S.hl && S.hl.kind === 'cloud' && S.clouds.length) {
      const c = S.clouds[S.clouds.length - 1],
        x = ((c.x + t * c.v) % (W + c.w * 1.2)) - c.w * 0.6 + c.w * 0.5,
        y = c.y + c.h * 0.95
      const a = Math.min(1, (t - S.hl.t0) / 2) * 0.8
      g.strokeStyle = `rgba(255,255,255,${a})`
      g.lineWidth = 1.6
      g.beginPath()
      g.moveTo(x - 30, y)
      g.lineTo(x + 30, y)
      g.moveTo(x + 22, y - 6)
      g.lineTo(x + 30, y)
      g.lineTo(x + 22, y + 6)
      g.stroke()
    }
  }
  function drawSea(t, p, H) {
    const { W, H: Hh } = S
    const sea = g.createLinearGradient(0, H, 0, Hh)
    sea.addColorStop(0, p.sea[0])
    sea.addColorStop(1, p.sea[1])
    g.fillStyle = sea
    g.fillRect(0, H, W, Hh - H)
    // ince ufuk parıltısı
    g.fillStyle = 'rgba(255,255,255,.18)'
    g.fillRect(0, H - 0.5, W, 1)
    // dalga çizgileri: ufka yakın ince ve yavaş, kıyıya yakın kalın
    for (let k = 0; k < 26; k++) {
      const d = k / 26,
        y = H + (Hh - H) * (d * d) + 4,
        amp = 0.6 + d * 3.2,
        len = 10 + d * 50
      g.strokeStyle = `rgba(255,255,255,${0.05 + d * 0.1})`
      g.lineWidth = 0.6 + d * 1.2
      const rr = rnd(k * 31 + 3)
      for (let i = 0; i < 5 + d * 3; i++) {
        const x0 = ((rr() * W + t * (4 + d * 10) * (k % 2 ? 1 : -0.6)) % (W + len)) - len / 2,
          yy = y + Math.sin(t * 0.5 + k + i) * amp
        g.beginPath()
        g.moveTo(x0, yy)
        g.quadraticCurveTo(x0 + len / 2, yy - amp, x0 + len, yy)
        g.stroke()
      }
    }
    // güneş/ay yansıması (yavaş, düşük karşıtlık)
    const rx = S.part === 'dusk' ? W * 0.78 : S.part === 'dawn' ? W * 0.2 : S.part === 'night' ? W * 0.76 : W * 0.86
    for (let k = 0; k < 18; k++) {
      const d = k / 18,
        y = H + 3 + (Hh - H) * d * d,
        w = 6 + d * 40,
        a = (S.part === 'day' ? 0.12 : 0.22) * (1 - d) * (0.75 + 0.25 * Math.sin(t * 0.35 + k))
      g.fillStyle =
        PAL[S.part].sun +
        Math.round(a * 255)
          .toString(16)
          .padStart(2, '0')
      g.fillRect(rx - w / 2 + Math.sin(t * 0.3 + k) * 3, y, w, 1.4 + d * 2)
    }
  }
  function drawHills(p, H) {
    const { W, H: Hh } = S
    HILL_LAYERS.forEach(([k, col, off, amp]) => {
      g.fillStyle = p[col]
      g.beginPath()
      g.moveTo(0, Hh)
      for (let x = 0; x <= W; x += 4) g.lineTo(x, hillY(k, x, off, amp))
      g.lineTo(W, Hh)
      g.fill()
    })
    // ön planda ağaç siluetleri
    const rr = rnd(5)
    g.fillStyle = p.near
    for (let i = 0; i < 16; i++) {
      const x = rr() * W,
        h = 20 + rr() * 34,
        y = Hh * 0.93
      g.beginPath()
      g.moveTo(x, y - h)
      g.lineTo(x - h * 0.28, y)
      g.lineTo(x + h * 0.28, y)
      g.fill()
    }
    g.fillRect(0, Hh * 0.93, W, Hh * 0.07)
  }
  function drawCity(p, H) {
    const { W, H: Hh } = S
    for (const pass of [true, false]) {
      g.fillStyle = pass ? p.far : p.near
      for (const b of S.city) {
        if (b.far !== pass) continue
        const top = H + 8 - b.h * (pass ? 1.25 : 0.9)
        g.fillRect(b.x, top, b.w, Hh - top)
      }
    }
    if (S.part !== 'day') {
      const rr = rnd(12)
      g.fillStyle = 'rgba(255,214,150,.75)'
      for (const b of S.city) {
        if (b.far) continue
        const top = H + 8 - b.h * 0.9
        // pencereler yalnız binanın üst kısmında (alt kısım karanlığa gömülür)
        for (let y = top + 6; y < Math.min(Hh - 6, top + 70); y += 9)
          for (let x = b.x + 3; x < b.x + b.w - 4; x += 7) if (rr() < (S.part === 'night' ? 0.28 : 0.12)) g.fillRect(x, y, 3, 4)
      }
    }
  }
  function drawRoofs(p, H) {
    const { W, H: Hh } = S
    g.fillStyle = p.near
    g.beginPath()
    g.moveTo(0, Hh)
    g.lineTo(0, H + 30)
    g.lineTo(W * 0.3, H + 30)
    g.lineTo(W * 0.36, H + 18)
    g.lineTo(W * 0.42, H + 30)
    g.lineTo(W, H + 26)
    g.lineTo(W, Hh)
    g.fill()
  }
  let raf = 0,
    t0 = performance.now(),
    live = true
  const loop = (now) => {
    if (!live) return
    draw((now - t0) / 1000)
    raf = requestAnimationFrame(loop)
  }
  return {
    set(opts) {
      Object.assign(S, opts)
      build()
    },
    highlight(kind) {
      S.hl = kind ? { kind, t0: (performance.now() - t0) / 1000, dur: 14 } : null
    },
    start() {
      live = true
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    },
    stop() {
      live = false
      cancelAnimationFrame(raf)
    },
    resize: build,
  }
}
