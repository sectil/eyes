(function () {
  var root = document.documentElement
  var pg = document.querySelector('.pg')
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch (e) { return null } return null }

  // Tema: Açık / Koyu / Sistem (data-theme kök öğeye yazılır; Sistem'de hiç yazılmaz)
  function setTheme(t) {
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t)
    else root.removeAttribute('data-theme')
    document.querySelectorAll('[data-set-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-theme') === (t || 'system'))) })
    store('s0-theme', t || 'system')
    redraw()
  }
  // Telefon genişliği: 390 pt (390 × 844) ya da 320 pt (320 × 568)
  function setWidth(w) {
    w = w === '320' ? '320' : '390'
    pg.setAttribute('data-w', w)
    document.querySelectorAll('[data-set-w]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-w') === w)) })
    store('s0-w', w)
    fit()
    redraw()
  }
  document.querySelectorAll('[data-set-theme]').forEach(function (b) { b.addEventListener('click', function () { setTheme(b.getAttribute('data-set-theme')) }) })
  document.querySelectorAll('[data-set-w]').forEach(function (b) { b.addEventListener('click', function () { setWidth(b.getAttribute('data-set-w')) }) })

  // Çerçeveler sayfaya sığsın: dar ekranda küçültülür (zoom), yatay kaydırma olmaz
  function fit() {
    document.querySelectorAll('.fit').forEach(function (el) {
      el.style.zoom = ''
      var holder = el.closest('.shot') || pg
      var avail = holder.clientWidth
      var w = el.scrollWidth
      // Masaüstü çizimi %60'ın altına küçülmez; dar ekranda kendi kutusunda yana kaydırılır (sayfa kaymaz)
      var min = el.closest('.shot.wide') ? 0.6 : 0.2
      if (w > 0 && avail > 0 && w > avail) el.style.zoom = String(Math.max(min, avail / w))
    })
  }
  var rt = 0
  var lastW = window.innerWidth
  window.addEventListener('resize', function () {
    clearTimeout(rt)
    rt = setTimeout(function () {
      fit()
      // Sahne yalnız genişlik değişince yeniden çizilir (telefonda adres çubuğu yüksekliği oynatır)
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; document.querySelectorAll('canvas[data-draw="stage"]').forEach(function (c) { try { drawStage(c) } catch (e) {} }) }
    }, 80)
  })

  // ---- Tuval çizimleri: uygulamanın kendi prosedürel çizimleri (lib/introStill.js, lib/irisDraw.js), kısaltılmış
  var TAU = Math.PI * 2
  function hash(i, s) { var x = Math.sin(i * 127.1 + (s || 0) * 311.7) * 43758.5453; return x - Math.floor(x) }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')' }
  var TEAL = [25, 194, 209], BLUE = [62, 123, 250], GOLD = [255, 177, 59], INK = [234, 242, 246], PALE = [150, 232, 240]
  function isDark(el) {
    var v = getComputedStyle(el).getPropertyValue('--bg').trim().toLowerCase()
    return v === '#070c12'
  }

  // Giriş ekranı: gece göğü, Pegasus, altta iris ufku (lib/introStill.js ile aynı yerleşim)
  var PEG = [['Alpheratz', 24.14, 29.1, 1], ['Scheat', 23.06, 28.1, 1], ['Markab', 23.08, 15.2, 1], ['Algenib', 24.22, 15.2, 0.9], ['Homam', 22.69, 10.8, 0.7], ['Biham', 22.17, 6.2, 0.6], ['Enif', 21.74, 9.9, 1], ['Matar', 22.72, 30.2, 0.8], ['π', 22.17, 33.2, 0.5], ['μ', 22.83, 24.6, 0.6], ['λ', 22.78, 23.6, 0.6], ['ι', 22.12, 25.3, 0.6], ['κ', 21.74, 25.6, 0.5]]
  var IDX = {}; PEG.forEach(function (p, i) { IDX[p[0]] = i })
  var LINES = [['Alpheratz', 'Scheat'], ['Scheat', 'Markab'], ['Markab', 'Algenib'], ['Algenib', 'Alpheratz'], ['Markab', 'Homam'], ['Homam', 'Biham'], ['Biham', 'Enif'], ['Scheat', 'μ'], ['μ', 'λ'], ['λ', 'ι'], ['ι', 'κ'], ['Scheat', 'Matar'], ['Matar', 'π']].map(function (l) { return [IDX[l[0]], IDX[l[1]]] })
  function pegXY() {
    var pts = PEG.map(function (p) { return [-(p[1] - 23.0) * 15 * Math.cos((p[2] * Math.PI) / 180), -p[2]] })
    var xs = pts.map(function (p) { return p[0] }), ys = pts.map(function (p) { return p[1] })
    var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2
    var span = Math.max(Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, ys) - Math.min.apply(null, ys))
    return pts.map(function (p) { return [(p[0] - mx) / span, (p[1] - my) / span] })
  }
  var FIELD = []; for (var fi = 0; fi < 170; fi++) FIELD.push({ x: hash(fi, 21) * 2 - 1, y: hash(fi, 22) * 2 - 1, d: 0.3 + hash(fi, 23) * 0.7, m: Math.pow(hash(fi, 24), 3), tw: hash(fi, 25) * TAU, warm: hash(fi, 26) < 0.14 })
  var IRIS_TEX = null
  function irisTexture() {
    if (IRIS_TEX) return IRIS_TEX
    var S = 1024, c = document.createElement('canvas'); c.width = c.height = S
    var g = c.getContext('2d'); if (!g) return null
    var k = S / 1024, R = S * 0.48
    g.translate(S / 2, S / 2)
    var gr = g.createRadialGradient(0, 0, R * 0.25, 0, 0, R)
    gr.addColorStop(0, '#05141a'); gr.addColorStop(0.3, '#0d3a3f'); gr.addColorStop(0.5, '#127b86'); gr.addColorStop(0.72, '#155fa0'); gr.addColorStop(0.9, '#0b2450'); gr.addColorStop(1, 'rgba(3,8,20,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
    gr = g.createRadialGradient(0, 0, R * 0.28, 0, 0, R * 0.56)
    gr.addColorStop(0, 'rgba(255,177,59,0.55)'); gr.addColorStop(0.55, 'rgba(210,140,40,0.22)'); gr.addColorStop(1, 'rgba(255,177,59,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R * 0.56, 0, TAU); g.fill()
    g.globalCompositeOperation = 'lighter'
    var cols = [TEAL, PALE, BLUE, [120, 170, 255], [255, 200, 120]]
    for (var i = 0; i < 3400; i++) {
      var a = hash(i, 1) * TAU, r0 = R * (0.29 + hash(i, 2) * 0.08), r1 = R * (0.62 + hash(i, 3) * 0.36), bend = (hash(i, 4) - 0.5) * 0.09
      var col = cols[Math.floor(hash(i, 5) * (hash(i, 6) < 0.12 ? 5 : 4))], warm = r1 < R * 0.7 && hash(i, 7) < 0.35
      g.strokeStyle = rgba(warm ? GOLD : col, 0.05 + hash(i, 8) * 0.16); g.lineWidth = (0.6 + hash(i, 9) * 1.8) * k
      var am = a + bend, rm = (r0 + r1) / 2
      g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.quadraticCurveTo(Math.cos(am) * rm, Math.sin(am) * rm, Math.cos(a + bend * 0.4) * r1, Math.sin(a + bend * 0.4) * r1); g.stroke()
    }
    g.globalCompositeOperation = 'source-over'
    g.strokeStyle = 'rgba(255,196,110,0.22)'; g.lineWidth = 5 * k; g.shadowColor = 'rgba(255,177,59,0.6)'; g.shadowBlur = 14 * k
    g.beginPath()
    for (var j = 0; j <= 240; j++) { var aa = (j / 240) * TAU, rr = R * (0.45 + 0.025 * Math.sin(aa * 13) + 0.015 * Math.sin(aa * 29 + 1.3)); if (j) g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else g.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr) }
    g.closePath(); g.stroke(); g.shadowBlur = 0
    gr = g.createRadialGradient(0, 0, R * 0.8, 0, 0, R)
    gr.addColorStop(0, 'rgba(2,6,16,0)'); gr.addColorStop(0.75, 'rgba(2,6,16,0.75)'); gr.addColorStop(1, 'rgba(2,6,16,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
    IRIS_TEX = { c: c, R: R / S }
    return IRIS_TEX
  }
  function star(g, x, y, r, blur, a, col) {
    if (a <= 0.004) return
    var rr = r + blur * 16, gr = g.createRadialGradient(x, y, 0, x, y, rr), core = a * (1 - blur * 0.55)
    gr.addColorStop(0, rgba(col, core)); gr.addColorStop(blur > 0.5 ? 0.55 : 0.18, rgba(col, core * (0.3 + blur * 0.4))); gr.addColorStop(1, rgba(col, 0))
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill()
    if (blur < 0.3) { g.fillStyle = rgba(INK, a * (1 - blur * 3)); g.beginPath(); g.arc(x, y, Math.max(0.6, r * 0.45), 0, TAU); g.fill() }
  }
  function drawIntro(cv) {
    var W = cv.clientWidth, H = cv.clientHeight
    if (!W || !H) return
    var dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    var g = cv.getContext('2d'); if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    var IR = irisTexture(); if (!IR) return
    var u = Math.min(W / 390, H / 844), cx = W / 2
    var gr = g.createLinearGradient(0, 0, 0, H)
    gr.addColorStop(0, '#02050a'); gr.addColorStop(0.5, '#050c15'); gr.addColorStop(0.72, '#0a1a26'); gr.addColorStop(1, '#02050a')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    var D = Math.min(W * 1.5, H * 0.7), R = D * IR.R, iy = H * 0.902
    var hz = g.createRadialGradient(cx, iy, R * 0.9, cx, iy, R * 1.55)
    hz.addColorStop(0, rgba(TEAL, 0.32)); hz.addColorStop(0.35, rgba(GOLD, 0.07)); hz.addColorStop(1, rgba(TEAL, 0))
    g.fillStyle = hz; g.fillRect(0, 0, W, H)
    FIELD.forEach(function (s) {
      var x = cx + s.x * W * 0.58, y = H * 0.3 + s.y * H * 0.32
      if (y > iy - R * 1.02 && Math.hypot(x - cx, y - iy) < R * 1.05) return
      star(g, x, y, (0.5 + s.m * 1.5) * u, s.d > 0.8 ? 0.35 : 0.08, (0.1 + s.m * 0.55) * (0.5 + 0.5 * Math.pow(Math.sin(s.tw * 7), 2)), s.warm ? [255, 214, 160] : [200, 225, 255])
    })
    var P = Math.min(W * 0.74, H * 0.34), py = H * 0.215
    var pts = pegXY().map(function (p) { return [cx + p[0] * P, py + p[1] * P] })
    g.lineCap = 'round'
    LINES.forEach(function (l) { g.strokeStyle = 'rgba(170,205,230,0.2)'; g.lineWidth = 0.9 * u; g.beginPath(); g.moveTo(pts[l[0]][0], pts[l[0]][1]); g.lineTo(pts[l[1]][0], pts[l[1]][1]); g.stroke() })
    var F = IDX.Enif
    pts.forEach(function (p, i) { if (i !== F) star(g, p[0], p[1], (1.2 + PEG[i][3] * 1.8) * u, 0.28, 0.75, [210, 230, 255]) })
    var fx = pts[F][0], fy = pts[F][1]
    var fg = g.createRadialGradient(fx, fy, 0, fx, fy, 40 * u)
    fg.addColorStop(0, rgba(GOLD, 0.3)); fg.addColorStop(1, rgba(GOLD, 0))
    g.fillStyle = fg; g.beginPath(); g.arc(fx, fy, 40 * u, 0, TAU); g.fill()
    star(g, fx, fy, 3.2 * u, 0, 1, [255, 236, 200])
    g.strokeStyle = 'rgba(255,240,210,0.55)'; g.lineWidth = 0.8 * u
    g.beginPath(); g.moveTo(fx - 11 * u, fy); g.lineTo(fx + 11 * u, fy); g.moveTo(fx, fy - 11 * u); g.lineTo(fx, fy + 11 * u); g.stroke()
    var size = 19 * u, L = size * 0.32
    g.strokeStyle = rgba(GOLD, 0.95); g.lineWidth = 1.6 * u; g.shadowColor = rgba(GOLD, 0.76); g.shadowBlur = 8 * u
    ;[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { var bx = fx + s[0] * size, by = fy + s[1] * size; g.beginPath(); g.moveTo(bx - s[0] * L, by); g.lineTo(bx, by); g.lineTo(bx, by - s[1] * L); g.stroke() })
    g.shadowBlur = 0
    g.save(); g.globalAlpha = 0.92; g.translate(cx, iy); g.rotate(-0.5); g.drawImage(IR.c, -D / 2, -D / 2, D, D); g.restore()
    var pr = R * 0.335 * 1.4, pgr = g.createRadialGradient(cx, iy, pr * 0.75, cx, iy, pr * 1.12)
    pgr.addColorStop(0, '#000'); pgr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = pgr; g.beginPath(); g.arc(cx, iy, pr * 1.12, 0, TAU); g.fill()
    var sh = g.createRadialGradient(cx, iy - R * 0.1, R * 0.35, cx, iy, R * 1.05)
    sh.addColorStop(0, 'rgba(2,5,10,0)'); sh.addColorStop(0.6, 'rgba(2,5,10,0.18)'); sh.addColorStop(1, 'rgba(2,5,10,0.55)')
    g.fillStyle = sh; g.beginPath(); g.arc(cx, iy, R, 0, TAU); g.fill()
    var lo = g.createLinearGradient(0, H * 0.9, 0, H)
    lo.addColorStop(0, 'rgba(2,5,10,0)'); lo.addColorStop(1, 'rgba(2,5,10,0.55)')
    g.fillStyle = lo; g.fillRect(0, H * 0.9, W, H * 0.1)
    g.save(); g.strokeStyle = rgba(PALE, 0.35); g.lineWidth = 1.2 * u; g.shadowColor = rgba(TEAL, 0.9); g.shadowBlur = 18 * u
    g.beginPath(); g.arc(cx, iy, R * 0.985, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.restore()
  }

  // Sayfanın açılış sahnesi (5 saniye turu 2): giriş ekranının gecesi, yıldız alanı ve alttaki iris ufku; genişte Pegasus.
  // Aynı doku ve yıldızlar (lib/introStill.js kalıbı); hareket yok, Hareketi Azalt'tan etkilenmez.
  function drawStage(cv) {
    var W = cv.clientWidth, H = cv.clientHeight
    if (!W || !H) return
    var dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    var g = cv.getContext('2d'); if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    var IR = irisTexture(); if (!IR) return
    var cx = W / 2, wide = W >= 720
    var gr = g.createLinearGradient(0, 0, 0, H)
    gr.addColorStop(0, '#02050a'); gr.addColorStop(0.55, '#050c15'); gr.addColorStop(0.86, '#0a1a26'); gr.addColorStop(1, '#061019')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    var D = Math.min(W * (wide ? 0.9 : 1.35), H * 0.95, 1150), R = D * IR.R, iy = H + R * (wide ? 0.42 : 0.3)
    var hz = g.createRadialGradient(cx, iy, R * 0.85, cx, iy, R * 1.7)
    hz.addColorStop(0, rgba(TEAL, 0.34)); hz.addColorStop(0.35, rgba(GOLD, 0.07)); hz.addColorStop(1, rgba(TEAL, 0))
    g.fillStyle = hz; g.fillRect(0, 0, W, H)
    var u = Math.max(0.85, Math.min(1.3, W / 390))
    function field(sx, sy, ox, oy, k) {
      FIELD.forEach(function (s) {
        var x = W * (ox + s.x * sx), y = H * (oy + s.y * sy)
        if (Math.hypot(x - cx, y - iy) < R * 1.05) return
        star(g, x, y, (0.5 + s.m * 1.5) * u, s.d > 0.8 ? 0.35 : 0.08, k * (0.1 + s.m * 0.55) * (0.5 + 0.5 * Math.pow(Math.sin(s.tw * 7), 2)), s.warm ? [255, 214, 160] : [200, 225, 255])
      })
    }
    field(0.52, 0.46, 0.5, 0.44, 1)
    if (wide) field(0.5, 0.4, 0.5, 0.46, 0.55)
    if (wide) {
      var P = Math.min(W * 0.18, H * 0.26, 220), px0 = W * 0.17, py = H * 0.2
      var pts = pegXY().map(function (p) { return [px0 + p[0] * P, py + p[1] * P] })
      g.lineCap = 'round'
      LINES.forEach(function (l) { g.strokeStyle = 'rgba(170,205,230,0.16)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(pts[l[0]][0], pts[l[0]][1]); g.lineTo(pts[l[1]][0], pts[l[1]][1]); g.stroke() })
      pts.forEach(function (p, i) { star(g, p[0], p[1], 1.2 + PEG[i][3] * 1.6, 0.28, 0.6, i === IDX.Enif ? [255, 236, 200] : [210, 230, 255]) })
    }
    g.save(); g.globalAlpha = 0.92; g.translate(cx, iy); g.rotate(-0.5); g.drawImage(IR.c, -D / 2, -D / 2, D, D); g.restore()
    var pr = R * 0.335 * 1.4, pgr = g.createRadialGradient(cx, iy, pr * 0.75, cx, iy, pr * 1.12)
    pgr.addColorStop(0, '#000'); pgr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = pgr; g.beginPath(); g.arc(cx, iy, pr * 1.12, 0, TAU); g.fill()
    var sh = g.createRadialGradient(cx, iy - R * 0.1, R * 0.35, cx, iy, R * 1.05)
    sh.addColorStop(0, 'rgba(2,5,10,0)'); sh.addColorStop(0.6, 'rgba(2,5,10,0.18)'); sh.addColorStop(1, 'rgba(2,5,10,0.55)')
    g.fillStyle = sh; g.beginPath(); g.arc(cx, iy, R, 0, TAU); g.fill()
    g.save(); g.strokeStyle = rgba(PALE, 0.4); g.lineWidth = 1.3; g.shadowColor = rgba(TEAL, 0.9); g.shadowBlur = 20
    g.beginPath(); g.arc(cx, iy, R * 0.985, Math.PI * 1.06, Math.PI * 1.94); g.stroke(); g.restore()
  }

  // İris haritası (lib/irisDraw.js; lifler kısaltıldı). frac: 7 alanın düzen oranı, Göz tepede, saat yönünde
  function drawIris(cv) {
    var size = cv.clientWidth; if (!size) return
    var dark = isDark(cv), ground = dark ? '#070c12' : '#f3f6f8'
    var frac = (cv.getAttribute('data-frac') || '').split(',').map(Number)
    var N = 7, dpr = 2, S = Math.round(size * dpr)
    cv.width = cv.height = S
    var g = cv.getContext('2d'); if (!g) return
    var R = S * 0.44, k = S / 1024
    var rf = frac.map(function (f) { return f > 0 ? R * (0.36 + 0.64 * Math.min(1, f)) : 0 })
    function lit() { var gr = g.createRadialGradient(0, 0, R * 0.25, 0, 0, R); if (dark) { gr.addColorStop(0, '#05141a'); gr.addColorStop(0.3, '#0d3a3f'); gr.addColorStop(0.52, '#127b86'); gr.addColorStop(0.74, '#155fa0'); gr.addColorStop(0.92, '#0b2450'); gr.addColorStop(1, 'rgba(3,8,20,0)') } else { gr.addColorStop(0, '#0a2a30'); gr.addColorStop(0.3, '#12555c'); gr.addColorStop(0.52, '#1792a0'); gr.addColorStop(0.74, '#2c6fc0'); gr.addColorStop(0.92, '#1d3f7a'); gr.addColorStop(1, 'rgba(29,63,122,0)') } return gr }
    function neutral() { var gr = g.createRadialGradient(0, 0, R * 0.25, 0, 0, R); if (dark) { gr.addColorStop(0, '#0a1016'); gr.addColorStop(0.5, '#18222c'); gr.addColorStop(0.9, '#121a22'); gr.addColorStop(1, 'rgba(10,16,22,0)') } else { gr.addColorStop(0, '#c9d3db'); gr.addColorStop(0.5, '#dbe3e9'); gr.addColorStop(0.9, '#d2dbe2'); gr.addColorStop(1, 'rgba(210,219,226,0)') } return gr }
    g.translate(S / 2, S / 2)
    for (var i = 0; i < N; i++) {
      var a0 = -Math.PI / 2 + (i - 0.5) * (TAU / N), a1 = a0 + TAU / N
      g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); g.clip()
      if (rf[i] >= R) { g.fillStyle = lit(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill() }
      else if (rf[i] > 0) { g.fillStyle = neutral(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); g.beginPath(); g.arc(0, 0, rf[i], 0, TAU); g.clip(); g.fillStyle = lit(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill() }
      else { g.fillStyle = neutral(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill() }
      g.restore()
    }
    var cols = [TEAL, PALE, BLUE, [120, 170, 255]]
    for (var j = 0; j < 900; j++) {
      var a = hash(j, 1) * TAU, d = ((a / TAU) * 360 + 360 / N / 2 + 360) % 360, sec = Math.floor(d / (360 / N))
      var r0 = R * (0.3 + hash(j, 2) * 0.08), r1 = R * (0.62 + hash(j, 3) * 0.35), on = rf[sec] > 0 && r1 <= rf[sec] + R * 0.04, bend = (hash(j, 4) - 0.5) * 0.09
      var col, al
      if (on) { col = hash(j, 7) < 0.3 && r1 < R * 0.72 ? GOLD : cols[Math.floor(hash(j, 5) * 4)]; al = 0.06 + hash(j, 8) * 0.2 }
      else { col = dark ? [150, 170, 190] : [120, 138, 155]; al = dark ? 0.03 + hash(j, 8) * 0.07 : 0.05 + hash(j, 8) * 0.12 }
      g.globalCompositeOperation = dark || on ? 'lighter' : 'source-over'
      g.strokeStyle = rgba(col, al); g.lineWidth = (0.6 + hash(j, 9) * 1.8) * k * 1.6
      var p = function (ang, r) { return [Math.sin(ang) * r, -Math.cos(ang) * r] }
      var P0 = p(a, r0), PM = p(a + bend, (r0 + r1) / 2), P1 = p(a + bend * 0.4, r1)
      g.beginPath(); g.moveTo(P0[0], P0[1]); g.quadraticCurveTo(PM[0], PM[1], P1[0], P1[1]); g.stroke()
    }
    g.globalCompositeOperation = 'source-over'
    g.strokeStyle = ground; g.lineWidth = 2.2 * k * 1.6
    for (var q = 0; q < N; q++) { var aq = (q - 0.5) * (TAU / N); g.beginPath(); g.moveTo(Math.sin(aq) * R * 0.34, -Math.cos(aq) * R * 0.34); g.lineTo(Math.sin(aq) * R * 0.98, -Math.cos(aq) * R * 0.98); g.stroke() }
    var gr = g.createRadialGradient(0, 0, R * 0.8, 0, 0, R)
    gr.addColorStop(0, 'rgba(2,6,16,0)'); gr.addColorStop(0.78, dark ? 'rgba(2,6,16,0.7)' : 'rgba(20,40,60,0.28)'); gr.addColorStop(1, 'rgba(2,6,16,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill()
    var prr = R * 0.33
    gr = g.createRadialGradient(0, 0, prr * 0.8, 0, 0, prr * 1.1)
    gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, prr * 1.1, 0, TAU); g.fill()
    for (var z = 0; z < N; z++) {
      if (!(rf[z] > 0) || rf[z] >= R) continue
      var b0 = -Math.PI / 2 + (z - 0.5) * (TAU / N) + 0.02, b1 = b0 + TAU / N - 0.04
      g.strokeStyle = dark ? 'rgba(150,232,240,0.55)' : 'rgba(10,80,90,0.45)'; g.lineWidth = Math.max(2.4 * k * 1.6, S / size)
      g.beginPath(); g.arc(0, 0, rf[z] - k, b0, b1); g.stroke()
    }
  }

  function redraw() {
    requestAnimationFrame(function () {
      document.querySelectorAll('canvas[data-draw="intro"]').forEach(function (c) { try { drawIntro(c) } catch (e) {} })
      document.querySelectorAll('canvas[data-draw="stage"]').forEach(function (c) { try { drawStage(c) } catch (e) {} })
      document.querySelectorAll('canvas[data-draw="iris"]').forEach(function (c) { try { drawIris(c) } catch (e) {} })
    })
  }
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw) } catch (e) {}

  var t0 = store('s0-theme'), w0 = store('s0-w')
  setTheme(t0 === 'light' || t0 === 'dark' ? t0 : 'system')
  setWidth(w0 === '320' ? '320' : '390')
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); redraw() })
  window.addEventListener('load', function () { fit(); redraw() })
})()
