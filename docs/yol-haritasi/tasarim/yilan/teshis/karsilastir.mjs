// Eski (sistem modeli + createGazeReader 10/6 + createDwell 220) ile yeni (Yılan ayarı + createSteer) karşılaştırması.
// Aynı düzen ve aynı gürültü. Gürültü VARSAYIM: yavaş kayma (AR(1), 300 ms) σ ve kare gürültüsü 0,6 mm; cihaz ölçümü yok.
import { createGazeReader } from '../../../../../app/src/lib/gaze.js'
import { createDwell } from '../../../../../app/src/lib/snake.js'
import { createSnakeReader, createSteer, edgeFromRects } from '../../../../../app/src/lib/snakeGaze.js'
const PT = 6.1, W = 390, H = 844
const BOARD_OLD = { x: 16, y: 155, w: 358, h: 358 } // bugünkü düzen (ekran görüntüsü 390)
const BOARD = { x: 65, y: 200, w: 260, h: 260 } // yeni düzen (yan kapılar için dar)
const G = { left: { x: 11, y: 318, w: 24, h: 24 }, right: { x: 355, y: 318, w: 24, h: 24 }, up: { x: 183, y: 158, w: 24, h: 24 }, down: { x: 183, y: 488, w: 24, h: 24 } }
const mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })
const EDGE = edgeFromRects({ board: BOARD, ...G })
const mm = (pt) => pt / PT
// Ekran noktası mm, merkez ekranın ortası (x) ve %46 (y)
const SC = { x: W / 2, y: 0.46 * H }
const sys = { version: 3, ok: true, closeAt: 0.5, phone: null, x: { feature: 'scrX', c: 0, neg: mm(0.08 * W - SC.x), pos: mm(0.92 * W - SC.x) }, y: { feature: 'scrY', c: 0, neg: -mm(0.84 * H - SC.y), pos: mm(SC.y - 0.12 * H) } }
const cx = BOARD.x + BOARD.w / 2, cy = BOARD.y + BOARD.h / 2
const cal = { version: 1, closeAt: 0.5, edge: EDGE, x: { feature: 'scrX', c: mm(cx - SC.x), neg: mm(mid(G.left).x - SC.x), pos: mm(mid(G.right).x - SC.x) }, y: { feature: 'scrY', c: mm(SC.y - cy), neg: mm(SC.y - mid(G.down).y), pos: mm(SC.y - mid(G.up).y) } }
const fr = (p, ts, n) => { const x = mm(p.x - SC.x) + n.x, y = mm(SC.y - p.y) + n.y; return { ts, face: true, blinkLeft: 0.05, blinkRight: 0.05, scrLX: x, scrRX: x, scrLY: y, scrRY: y } }
let seed = 1
const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd())
function noise(s) { let a = Math.exp(-(1000 / 60) / 300), x = 0, y = 0; return () => { x = a * x + Math.sqrt(1 - a * a) * s * gauss(); y = a * y + Math.sqrt(1 - a * a) * s * gauss(); return { x: x + 0.6 * gauss(), y: y + 0.6 * gauss() } } }
function oldRun(points, n) { const r = createGazeReader({ model: sys, enterDeg: 10, exitDeg: 6, persistKey: null }); const d = createDwell(); let ts = 0, out = []
  for (; ts < 1000; ts += 16.7) r.push(fr(SC, ts, { x: 0, y: 0 }))
  for (const p of points) for (let t = 0; t < p.ms; t += 16.7, ts += 16.7) { const o = d.push(r.push(fr(p, ts, n())).dir, ts); if (o.fire) out.push({ dir: o.fire, ts, t }) } return out }
function newRun(points, n) { const r = createSnakeReader(cal); const s = createSteer(EDGE); let ts = 0, out = []
  for (const p of points) for (let t = 0; t < p.ms; t += 16.7, ts += 16.7) { const o = s.push(r.push(fr(p, ts, n())).u, ts); if (o.fire) out.push({ dir: o.fire, ts, t }) } return out }
const cells = (B) => { const a = []; for (let r = 0; r < 15; r += 2) for (let c = 0; c < 15; c += 2) a.push({ x: B.x + ((c + .5) / 15) * B.w, y: B.y + ((r + .5) / 15) * B.h, ms: 2000 }); return a }
console.log('| Gürültü σ (mm) | Eski: tahta içi istenmeyen komut / 64 hücre × 2 sn | Yeni | Yeni: kapı isabeti / 40 | Yeni: gecikme ortancası (ms) |')
console.log('|---|---|---|---|---|')
for (const s of [0, 1, 2, 3]) {
  seed = 7; const o = oldRun(cells(BOARD_OLD), noise(s)).length
  seed = 7; const nw = newRun(cells(BOARD), noise(s)).length
  seed = 9; let hit = 0; const lat = []
  for (let k = 0; k < 10; k++) for (const d of ['left', 'right', 'up', 'down']) { const f = newRun([{ x: cx, y: cy, ms: 600 }, { ...mid(G[d]), ms: 1500 }], noise(s)); if (f.length === 1 && f[0].dir === d) { hit++; lat.push(f[0].t) } }
  lat.sort((a, b) => a - b)
  console.log(`| ${s} | ${o} | ${nw} | ${hit} | ${lat.length ? Math.round(lat[lat.length >> 1]) : '—'} |`)
}
