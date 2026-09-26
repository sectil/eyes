// Çemberler sahnesi: gece göğünde mercek düğümleri, yıldız çokgeni kenarları ve diyafram halkası
// (onaylı taslak "EyeTrail Çemberler", Ç1–Ç10 ve sahne sözlüğü). SVG doğrudan çizilir (React değil):
// 60 fps'te halka, parıltı ve sözler DOM özniteliğiyle güncellenir, React yeniden çizmez.
// Renkler sabit koyu: bu sahne her temada gece (Nefes Sayma'daki NightScene ailesi).
//
// Motor turun saatini tutar (duraklatınca durur), hedefi hareket ettirir ve adım listesini yazar.
// Bakış kararı DIŞARIDAN gelir (TrackGame: Katman A yön dedektörü) → resolve(). Kamera yoksa ('none')
// her geçişte camgöbeği parıltı + söz; 'demo' (giriş önizlemesi) her adımda altın varış oynatır.
import { layoutGraph, edgeKey, nextNode, wordAt, glideMs, jumpWindowMs, glideWindowMs, GLIDE_STOP_MS, LEVELS } from './track.js'

const NS = 'http://www.w3.org/2000/svg'
const f = (n) => Math.round(n * 10) / 10
const f2 = (n) => Math.round(n * 100) / 100
const easeOut = (k) => {
  const x = Math.max(0, Math.min(1, k))
  return 1 - (1 - x) ** 3
}
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1])

export const CM = { cyan: '#19C2D1', cyan2: '#5EDCE6', blue: '#3E7BFA', gold: '#FFB13B', ink: '#EEF3F6' }

// Kimlik öneki: aynı sayfada birden çok SVG (önizleme, yönerge çizimi, sonuç) çakışmasın
export const safeId = (s) => `cm${String(s).replace(/[^a-zA-Z0-9_-]/g, '')}`

// Ortak tanımlar: iris/halka renkleri, mercek diski, parıltı filtreleri, iki mercek sembolü
export function defsSVG(u) {
  return `<defs>
<linearGradient id="${u}-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${CM.cyan}"/><stop offset="1" stop-color="${CM.blue}"/></linearGradient>
<linearGradient id="${u}-iris" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E6B76"/><stop offset=".5" stop-color="${CM.cyan}"/><stop offset="1" stop-color="${CM.blue}"/></linearGradient>
<linearGradient id="${u}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CM.cyan}" stop-opacity=".05"/><stop offset="1" stop-color="${CM.cyan}" stop-opacity=".17"/></linearGradient>
<radialGradient id="${u}-disk" cx=".35" cy=".3" r=".85" fx=".35" fy=".3"><stop offset="0" stop-color="#1C2834"/><stop offset=".6" stop-color="#0F171F"/><stop offset="1" stop-color="#05080C"/></radialGradient>
<filter id="${u}-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${u}-glowT" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${u}-wordG" x="-25%" y="-90%" width="150%" height="280%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/><feFlood flood-color="${CM.gold}" flood-opacity=".5" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${u}-wordC" x="-25%" y="-90%" width="150%" height="280%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/><feFlood flood-color="${CM.cyan}" flood-opacity=".5" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<g id="${u}-lensC"><circle r="20" fill="url(#${u}-disk)" stroke="${CM.cyan}" stroke-opacity=".55" stroke-width="1.5"/><circle r="12" fill="url(#${u}-iris)" opacity=".4"/><circle r="9.4" fill="none" stroke="${CM.cyan2}" stroke-width="4.6" stroke-dasharray="1 1.95" opacity=".3"/><circle r="6" fill="#05080C"/><circle cx="6" cy="-7" r="1.4" fill="#FFFFFF" opacity=".9"/></g>
<g id="${u}-lensO"><circle r="20" fill="url(#${u}-disk)" stroke="${CM.cyan}" stroke-opacity=".55" stroke-width="1.5"/><circle r="12" fill="url(#${u}-iris)" opacity=".45"/><circle r="10.4" fill="none" stroke="${CM.cyan2}" stroke-width="2.6" stroke-dasharray="1 1.95" opacity=".35"/><circle r="9.3" fill="#05080C"/><circle r="2" fill="${CM.gold}"/><circle cx="6" cy="-7" r="1.4" fill="#FFFFFF" opacity=".9"/></g>
</defs>`
}

// Sabit yıldızlar (yanıp sönmez). Sol üst (kapat) ve sağ üst (süre halkası) köşeleri boş kalır.
export function starsSVG(seed, box, count, maxY = 0.84) {
  let s = seed % 2147483647 || 1
  const r = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  let out = ''
  let placed = 0
  for (let tries = 0; placed < count && tries < count * 6; tries++) {
    const x = r() * box.w
    const y = box.h * 0.05 + r() * box.h * (maxY - 0.05)
    const rad = 0.5 + r() * 0.3
    const op = 0.35 + r() * 0.45
    if (box.corners && y < 64 && (x < 64 || x > box.w - 64)) continue
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${rad.toFixed(2)}" fill="#FFFFFF" opacity="${op.toFixed(2)}"/>`
    placed++
  }
  return `<g>${out}</g>`
}

// Su bandı (Nefes Sayma ailesi): kalibrasyon kutusunun (%84) altında, sabit
export function waterSVG(u, box) {
  const y = box.h * 0.875
  const h = box.h - y
  const w = box.w
  return (
    `<rect x="0" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${u}-water)"/>` +
    `<line x1="0" y1="${f(y + 0.5)}" x2="${f(w)}" y2="${f(y + 0.5)}" stroke="${CM.cyan}" stroke-opacity=".28" stroke-width="1"/>` +
    `<g fill="none" stroke="${CM.cyan}" stroke-opacity=".14" stroke-width="1"><ellipse cx="${f(w * 0.35)}" cy="${f(y + h * 0.3)}" rx="${f(w * 0.17)}" ry="2.6"/><ellipse cx="${f(w * 0.69)}" cy="${f(y + h * 0.55)}" rx="${f(w * 0.13)}" ry="2.2"/><ellipse cx="${f(w * 0.45)}" cy="${f(y + h * 0.8)}" rx="${f(w * 0.09)}" ry="1.8"/></g>`
  )
}

const EDGE = {
  ring: 'stroke="rgba(25,194,209,.12)" stroke-width="1" stroke-dasharray="3 9"',
  pend: 'stroke="rgba(25,194,209,.22)" stroke-width="1" stroke-dasharray="3 9"',
  mov: `stroke="${CM.cyan}" stroke-opacity=".6" stroke-width="1.5"`,
  faint: 'stroke="rgba(25,194,209,.3)" stroke-width="1"',
  arr: `stroke="${CM.gold}" stroke-width="1.5"`,
}
// st: { 'a-b': 'mov' | 'faint' | 'arr' }; show: görünür düğümler (geri sayım)
export function edgesSVG(u, G, P, st, show = null) {
  let out = ''
  for (const pass of ['base', 'faint', 'mov', 'arr']) {
    for (const [a, b, kind] of G.edges) {
      const s = st[edgeKey(a, b)] || ''
      if (show && !(show[a] && show[b])) continue
      let sty
      if (pass === 'base') {
        if (s) continue
        sty = kind === 'ring' ? EDGE.ring : EDGE.pend
      } else {
        if (s !== pass) continue
        sty = EDGE[pass] + (pass === 'arr' ? ` filter="url(#${u}-glow)"` : '')
      }
      out += `<line x1="${f(P[a][0])}" y1="${f(P[a][1])}" x2="${f(P[b][0])}" y2="${f(P[b][1])}" ${sty} stroke-linecap="round"/>`
    }
  }
  return out
}
export function nodesSVG(u, P, vis, sc, dim = null) {
  let out = ''
  P.forEach((p, i) => {
    const op = dim && dim[i] != null ? ` opacity="${dim[i]}"` : ''
    out += `<use href="#${u}-${vis[i] ? 'lensO' : 'lensC'}" transform="translate(${f(p[0])} ${f(p[1])}) scale(${sc})"${op}/>`
  })
  return out
}

// Diyafram: iç altıgen açıklık + altı bıçak (her bıçak altıgenin bir kenarının dış halkaya uzantısı)
export const circlePath = (r) => `M${f2(r)} 0A${f2(r)} ${f2(r)} 0 1 0 ${f2(-r)} 0A${f2(r)} ${f2(r)} 0 1 0 ${f2(r)} 0Z`
export function aperture(ri, ro) {
  const V = []
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 + 30) * Math.PI) / 180
    V.push([ri * Math.cos(a), ri * Math.sin(a)])
  }
  const hex = `M${V.map((p) => `${f2(p[0])} ${f2(p[1])}`).join('L')}Z`
  let bl = ''
  for (let k = 0; k < 6; k++) {
    const A = V[k]
    const B = V[(k + 1) % 6]
    let dx = B[0] - A[0]
    let dy = B[1] - A[1]
    const L = Math.hypot(dx, dy)
    dx /= L
    dy /= L
    const vd = A[0] * dx + A[1] * dy
    const vv = A[0] * A[0] + A[1] * A[1]
    const t = -vd + Math.sqrt(Math.max(0, vd * vd - vv + ro * ro))
    bl += `M${f2(A[0])} ${f2(A[1])}L${f2(A[0] + t * dx)} ${f2(A[1] + t * dy)}`
  }
  return { hex, blades: bl }
}
export function apertureSVG(u, ri, ro, gold) {
  const ap = aperture(ri, ro)
  const stroke = gold ? CM.gold : `url(#${u}-ring)`
  return (
    `<path d="${circlePath(ro)}${ap.hex}" fill-rule="evenodd" fill="${gold ? 'rgba(255,177,59,.12)' : 'rgba(25,194,209,.08)'}"/>` +
    `<path d="${ap.blades}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".9"/>` +
    `<circle r="${f2(ro)}" fill="none" stroke="${stroke}" stroke-width="1.8"/>`
  )
}
function wordSVG(u, p, text, sc, box, tone, op) {
  const fs = 14.4 * Math.max(sc, 0.72)
  const dy = 44 * Math.max(sc, 0.6)
  const above = p[1] >= box.h * 0.25
  const half = text.length * fs * 0.4 + 4
  const x = Math.max(half, Math.min(box.w - half, p[0]))
  const y = above ? p[1] - dy + fs * 0.35 : p[1] + dy + fs * 0.35
  const esc = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<text class="cm-word" x="${f(x)}" y="${f(y)}" text-anchor="middle" font-size="${f(fs)}" filter="url(#${u}-${tone === 'cyan' ? 'wordC' : 'wordG'})"${op != null ? ` opacity="${op}"` : ''}>${esc}</text>`
}

// Sonuç kartındaki takımyıldız (durağan): varılan kenarlar altın, gidilip varılmayanlar soluk.
// rhythm: kamera yok → gidilen kenarlar camgöbeği.
export function constellationSVG(u, { level, edges = {}, visited = {}, rhythm = false, box = { w: 200, h: 200 }, sc = 0.46 }) {
  const G = layoutGraph(level)
  // Sonuç dairesinde elips yerine daha yuvarlak yerleşim: merkez (50, 51), yarıçap %36
  const P = G.pts.map((p) => [box.w * (0.5 + ((p.x - 50) / 33) * 0.36), box.h * (0.51 + ((p.y - 46) / 26.5) * 0.36)])
  const st = {}
  for (const [k, v] of Object.entries(edges)) st[k] = rhythm ? 'mov' : v === 'arr' ? 'arr' : 'faint'
  return defsSVG(u) + starsSVG(level * 7 + 4, box, 6, 0.95) + edgesSVG(u, G, P, st) + nodesSVG(u, P, rhythm ? {} : visited, sc)
}

// --- Canlı motor --------------------------------------------------------------------------
// o: { uid, box: {w,h}, scale, reduced, level, mode, gaze: 'camera'|'none'|'demo', round (ms), interval?,
//      seed, starCount, water, hintEl, onTime(rem), onStep(info), onFx(type), onDone() }
export function createLensEngine(svg, o) {
  const u = o.uid
  const RM = Boolean(o.reduced)
  const ROUND = o.round ?? 60000
  let box = { ...o.box, corners: Boolean(o.water) }
  let sc = o.scale ?? 1
  let gaze = o.gaze ?? 'none'
  const level = LEVELS[o.level] ? o.level : 1
  const mode = o.mode === 'glide' ? 'glide' : 'jump'
  const interval = o.interval ?? LEVELS[level].ms
  let G = layoutGraph(level)
  let P = []
  let running = false
  let alive = true
  let clock = 0
  let last = 0
  let raf = 0
  let cur = 0
  let prev = null
  let stepEnd = 0
  let trial = null
  let glide = null
  let edgeSt = {}
  let vis = {}
  let fx = []
  let words = []
  let steps = []
  let arrivedN = 0
  let noneN = 0
  let missRun = 0
  let hintUntil = -1
  let done = false
  let show = null // geri sayımda görünen düğümler
  let hidden = true // hedef geri sayımda gizli
  const tg = { x: 0, y: 0, gold: false, riFrom: 12, riTo: 12, riT0: -1e9, pop: -1e9, key: '' }

  const toPx = () => {
    // stretchY (yalnızca önizleme): alçak kartta ağ dikeyde kartı doldursun; oyun alanında 1 (kalibrasyon yerleşimi)
    const sy = o.stretchY ?? 1
    P = G.pts.map((p) => [(p.x / 100) * box.w, ((sy === 1 ? p.y : 50 + (p.y - 46) * sy) / 100) * box.h])
  }
  function build() {
    toPx()
    svg.setAttribute('viewBox', `0 0 ${f(box.w)} ${f(box.h)}`)
    svg.innerHTML =
      defsSVG(u) +
      starsSVG(o.seed ?? 11, box, o.starCount ?? 12, o.water ? 0.84 : 0.95) +
      (o.water ? waterSVG(u, box) : '') +
      `<defs><linearGradient id="${u}-tail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${CM.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${CM.cyan2}" stop-opacity="1"/></linearGradient></defs>` +
      '<g data-l="e"></g><g data-l="n"></g><g data-l="f"></g>' +
      `<line data-l="t" x1="0" y1="0" x2="0" y2="0" stroke="url(#${u}-tail)" stroke-width="${f(5.5 * sc)}" stroke-linecap="round" opacity="0"/>` +
      `<g data-l="g"><g class="cm-spin"><path data-l="apf" fill-rule="evenodd"/><path data-l="apb" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".9"/><circle data-l="apr" fill="none" stroke-width="1.8" r="${f2(30 * sc)}"/></g></g>` +
      '<g data-l="w"></g>'
    tg.key = ''
    fx = []
    words = []
    drawGraph()
  }
  const L = (k) => svg.querySelector(`[data-l="${k}"]`)
  let Le
  let Ln
  let Lf
  let Lt
  let Lg
  let apf
  let apb
  let apr
  let Lw
  let tailGrad
  function bind() {
    Le = L('e')
    Ln = L('n')
    Lf = L('f')
    Lt = L('t')
    Lg = L('g')
    apf = L('apf')
    apb = L('apb')
    apr = L('apr')
    Lw = L('w')
    tailGrad = svg.querySelector(`#${u}-tail`)
  }
  function drawGraph() {
    if (!Le) bind()
    let dim = null
    if (show) {
      dim = {}
      P.forEach((_, i) => {
        if (!show[i]) dim[i] = 0.16
      })
    }
    Le.setAttribute('opacity', show ? '0.7' : '1')
    Le.innerHTML = edgesSVG(u, G, P, edgeSt, show)
    Ln.innerHTML = nodesSVG(u, P, vis, sc, dim)
  }
  function setTarget(gold, open) {
    tg.gold = gold
    tg.riFrom = 12
    tg.riTo = open ? 22 : 12
    tg.riT0 = RM ? -1e9 : clock
  }

  function reset() {
    G = layoutGraph(level)
    build()
    bind()
    clock = 0
    cur = 0
    prev = null
    trial = null
    glide = null
    edgeSt = {}
    vis = {}
    steps = []
    arrivedN = 0
    noneN = 0
    missRun = 0
    hintUntil = -1
    done = false
    tg.x = P[0][0]
    tg.y = P[0][1]
    tg.gold = false
    tg.riFrom = 12
    tg.riTo = 12
    tg.riT0 = -1e9
    tg.pop = -1e9
    stepEnd = mode === 'jump' ? interval : 900
    drawGraph()
    draw()
  }

  function openTrial(kind, t0, arriveAt, step, windowMs) {
    trial = { kind, t0, arriveAt, step, done: false, autoAt: null, autoMs: null, noneAt: null, pending: null }
    if (gaze === 'none') trial.noneAt = kind === 'jump' ? t0 + 120 : arriveAt
    else if (gaze === 'demo') {
      const lat = Math.round(260 + Math.random() * 200)
      trial.autoMs = kind === 'jump' ? lat : null
      trial.autoAt = kind === 'jump' ? t0 + lat + 150 : arriveAt + 150
    } else {
      o.onStep?.({ step, kind, fromPt: G.pts[prev], toPt: G.pts[cur], windowMs })
    }
  }
  function move() {
    const next = nextNode(G, cur, prev)
    prev = cur
    cur = next
    const key = edgeKey(prev, cur)
    if (edgeSt[key] !== 'arr') edgeSt[key] = 'mov'
    drawGraph()
    const t0 = clock
    const step = { i: steps.length, t: t0, kind: mode, res: null, ms: null, from: prev, to: cur }
    steps.push(step)
    setTarget(false, false)
    if (mode === 'jump') {
      glide = null
      tg.x = P[cur][0]
      tg.y = P[cur][1]
      tg.pop = RM ? -1e9 : clock
      stepEnd = t0 + interval
      openTrial('jump', t0, t0, step, jumpWindowMs(interval))
    } else {
      const a = P[prev]
      const b = P[cur]
      const len = dist(a, b)
      // Süre ekran noktasıyla (pt = CSS px); ptScale: çizim pikselinin pt karşılığı (tam ekranda 1)
      const dur = glideMs(len / (o.ptScale ?? 1))
      glide = { a, b, t0, dur, len }
      tg.x = b[0]
      tg.y = b[1]
      stepEnd = t0 + dur + GLIDE_STOP_MS
      openTrial('glide', t0, t0 + dur, step, glideWindowMs(dur))
    }
    o.onFx?.('move')
  }
  // Varış görseli: diyafram açılır, halka altın, parıltı, söz; kenar altın, mercek açık
  function showArrive() {
    arrivedN++
    missRun = 0
    edgeSt[edgeKey(prev, cur)] = 'arr'
    vis[cur] = 1
    drawGraph()
    setTarget(true, true)
    addFx('glint', P[cur], CM.gold)
    addWord(wordAt(arrivedN - 1), cur, 'gold')
    o.onFx?.('arrive')
  }
  function showMiss() {
    missRun++
    addFx('ping', P[cur], CM.cyan)
    if (missRun >= 3) {
      hintUntil = clock + 2000
      missRun = 0
    }
    o.onFx?.('miss')
  }
  function showNone() {
    setTarget(false, true)
    addFx('glint', P[cur], CM.cyan)
    addWord(wordAt(noneN++), cur, 'cyan')
    o.onFx?.('none')
  }
  // Dışarıdan karar (kamera): 'hit' (ms: tepki), 'miss', 'u' (ölçülmedi). Süzül'de görsel durağa varınca.
  function resolve(res, ms = null) {
    if (!trial || trial.done || done) return
    const st = trial.step
    trial.done = true
    st.res = res
    if (res === 'hit' && trial.kind === 'jump' && Number.isFinite(ms)) st.ms = ms
    if (res === 'u') return
    if (clock < trial.arriveAt) trial.pending = res
    else if (res === 'hit') showArrive()
    else showMiss()
  }
  // Geç kapanan adım (sonraki hareket geldi): yalnızca kayıt, görsel yok
  function settle(step, res) {
    if (step && step.res == null) step.res = res
    if (trial && trial.step === step) trial.done = true
  }
  function finish() {
    done = true
    running = false
    clock = ROUND
    if (trial && !trial.done && gaze !== 'camera') trial.done = true
    draw()
    o.onDone?.()
  }
  function tick() {
    if (clock >= ROUND) {
      finish()
      return
    }
    if (trial) {
      if (!trial.done) {
        if (trial.noneAt != null) {
          if (clock >= trial.noneAt) {
            trial.done = true
            trial.step.res = 'none'
            showNone()
          }
        } else if (trial.autoAt != null && clock >= trial.autoAt) {
          trial.done = true
          trial.step.res = 'hit'
          trial.step.ms = trial.autoMs
          showArrive()
        }
      } else if (trial.pending && clock >= trial.arriveAt) {
        const r = trial.pending
        trial.pending = null
        if (r === 'hit') showArrive()
        else showMiss()
      }
    }
    if (clock >= stepEnd) move()
  }

  function addFx(type, p, color) {
    const el = document.createElementNS(NS, 'circle')
    el.setAttribute('cx', f(p[0]))
    el.setAttribute('cy', f(p[1]))
    el.setAttribute('fill', 'none')
    el.setAttribute('stroke', color)
    el.setAttribute('stroke-width', type === 'ping' ? '1.5' : '1.8')
    Lf.appendChild(el)
    const x = { el, type, t0: clock }
    fx.push(x)
    updFx(x)
  }
  function updFx(x) {
    const t = clock - x.t0
    let r
    let op
    let dur
    if (RM) {
      dur = 400
      r = (x.type === 'ping' ? 40 : 36) * sc
      op = x.type === 'ping' ? 0.5 : 1
    } else if (x.type === 'glint') {
      dur = 900
      const k = t / dur
      r = (20.3 + 30.5 * easeOut(k)) * sc
      op = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8
    } else {
      dur = 600
      const k = t / dur
      r = (32 + 16 * easeOut(k)) * sc
      op = 0.55 * (1 - k)
    }
    if (t >= dur) {
      x.el.remove()
      return false
    }
    x.el.setAttribute('r', f(Math.max(0.5, r)))
    x.el.setAttribute('opacity', Math.max(0, Math.min(1, op)).toFixed(3))
    return true
  }
  function addWord(text, node, tone) {
    const holder = document.createElementNS(NS, 'g')
    holder.innerHTML = wordSVG(u, P[node], text, sc, box, tone, 0)
    const el = holder.firstChild
    Lw.appendChild(el)
    const w = { el, t0: RM ? clock - 200 : clock + 60, y: parseFloat(el.getAttribute('y')) }
    words.push(w)
    updWord(w)
  }
  function updWord(w) {
    const t = clock - w.t0
    let op
    let dy = 0
    if (t < 0) op = 0
    else if (t < 120) {
      op = t / 120
      dy = RM ? 0 : 4 * (1 - t / 120)
    } else if (t < 820) op = 1
    else if (t < 1020) op = 1 - (t - 820) / 200
    else {
      w.el.remove()
      return false
    }
    w.el.setAttribute('opacity', op.toFixed(3))
    w.el.setAttribute('y', f(w.y + dy))
    return true
  }

  function draw() {
    if (!Lg) return
    let x = tg.x
    let y = tg.y
    let showTail = false
    if (glide) {
      const k = Math.max(0, Math.min(1, (clock - glide.t0) / glide.dur))
      x = glide.a[0] + (glide.b[0] - glide.a[0]) * k
      y = glide.a[1] + (glide.b[1] - glide.a[1]) * k
      const back = Math.min(glide.len * k, 64 * sc)
      if (!RM && k < 1 && back > 32 * sc) {
        const ux = (glide.b[0] - glide.a[0]) / glide.len
        const uy = (glide.b[1] - glide.a[1]) / glide.len
        const nx = x - ux * 30 * sc
        const ny = y - uy * 30 * sc
        const fx0 = x - ux * back
        const fy0 = y - uy * back
        Lt.setAttribute('x1', f(fx0))
        Lt.setAttribute('y1', f(fy0))
        Lt.setAttribute('x2', f(nx))
        Lt.setAttribute('y2', f(ny))
        tailGrad?.setAttribute('x1', f(fx0))
        tailGrad?.setAttribute('y1', f(fy0))
        tailGrad?.setAttribute('x2', f(nx))
        tailGrad?.setAttribute('y2', f(ny))
        showTail = true
      }
    }
    Lt.setAttribute('opacity', showTail ? '1' : '0')
    const s = 0.7 + 0.3 * easeOut((clock - tg.pop) / 180)
    Lg.setAttribute('transform', `translate(${f(x)} ${f(y)}) scale(${s.toFixed(3)})`)
    Lg.setAttribute('opacity', hidden ? '0' : '1')
    const ri = tg.riFrom + (tg.riTo - tg.riFrom) * easeOut((clock - tg.riT0) / 180)
    const key = `${tg.gold ? 'g' : 'i'}${ri.toFixed(1)}`
    if (key !== tg.key) {
      tg.key = key
      const ap = aperture(ri * sc, 30 * sc)
      const stroke = tg.gold ? CM.gold : `url(#${u}-ring)`
      apf.setAttribute('d', circlePath(30 * sc) + ap.hex)
      apf.setAttribute('fill', tg.gold ? 'rgba(255,177,59,.12)' : 'rgba(25,194,209,.08)')
      apb.setAttribute('d', ap.blades)
      apb.setAttribute('stroke', stroke)
      apr.setAttribute('stroke', stroke)
      if (tg.gold) Lg.setAttribute('filter', `url(#${u}-glowT)`)
      else Lg.removeAttribute('filter')
    }
    fx = fx.filter(updFx)
    words = words.filter(updWord)
    if (o.hintEl) {
      const hv = clock < hintUntil
      if (o.hintEl.hidden === hv) o.hintEl.hidden = !hv
    }
    o.onTime?.(Math.max(0, ROUND - clock))
  }

  function frame(now) {
    if (!alive) return
    if (!last) last = now
    const dt = Math.min(80, now - last)
    last = now
    if (running && !done) {
      clock += dt
      tick()
    }
    draw()
    raf = requestAnimationFrame(frame)
  }

  reset()
  raf = requestAnimationFrame(frame)

  return {
    // Oyunu başlat / sürdür. resumeDelay: duraklamadan dönüşte sonraki hareket bu kadar sonra (eski oyunda 350 ms)
    play({ resumeDelay = null } = {}) {
      if (done) return
      show = null
      hidden = false
      drawGraph()
      if (resumeDelay != null) stepEnd = Math.max(stepEnd, clock + resumeDelay)
      running = true
      last = 0
    },
    // Duraklat: açık adım ölçüme girmez
    pause() {
      running = false
      if (trial && !trial.done) {
        trial.done = true
        if (trial.step.res == null) trial.step.res = gaze === 'none' ? 'none' : 'u'
        trial.pending = null
      }
    },
    // Geri sayım: ilk k düğüm görünür, diğerleri soluk; hedef gizli
    reveal(k) {
      show = {}
      for (let i = 0; i < Math.min(k, P.length); i++) show[i] = 1
      hidden = true
      drawGraph()
    },
    resolve,
    settle,
    setGaze(g) {
      gaze = g
    },
    resize(b) {
      box = { ...b, corners: Boolean(o.water) }
      if (o.scaleFor) sc = o.scaleFor(box)
      const keepEdges = edgeSt
      const keepVis = vis
      build()
      bind()
      edgeSt = keepEdges
      vis = keepVis
      const tp = P[cur]
      tg.x = tp[0]
      tg.y = tp[1]
      glide = null
      drawGraph()
      draw()
    },
    // Hareket azaltmada önizleme: tek bir varış karesi
    freeze() {
      hidden = false
      move()
      if (trial && !trial.done) {
        trial.done = true
        trial.step.res = 'hit'
        showArrive()
      }
      draw()
    },
    get running() {
      return running
    },
    get steps() {
      return steps
    },
    get edgeStates() {
      return { ...edgeSt }
    },
    get visited() {
      return { ...vis }
    },
    get words() {
      return Array.from({ length: gaze === 'none' ? noneN : arrivedN }, (_, i) => wordAt(i))
    },
    get clock() {
      return clock
    },
    destroy() {
      alive = false
      cancelAnimationFrame(raf)
    },
  }
}
