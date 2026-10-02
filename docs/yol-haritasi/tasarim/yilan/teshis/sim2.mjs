import { createGazeReader } from '../../../../../app/src/lib/gaze.js'
import { createDwell } from '../../../../../app/src/lib/snake.js'
const PT = 6.1, W = 375, H = 812, mm = (pt) => pt / PT
const model = { version: 3, ok: true, closeAt: 0.5, phone: null,
  x: { feature: 'scrX', c: 0, neg: mm(0.08*W - 0.5*W), pos: mm(0.92*W - 0.5*W) },
  y: { feature: 'scrY', c: 0, neg: -mm(0.84*H - 0.46*H), pos: mm(0.46*H - 0.12*H) } }
const B = { x0: 20, y0: 201, size: 335 }, cell = B.size / 15
const cellPt = (c, r) => ({ x: B.x0 + (c + 0.5) * cell, y: B.y0 + (r + 0.5) * cell })
const frameAt = (p, ts, n = { x: 0, y: 0 }) => { const x = mm(p.x - 0.5*W) + n.x, y = mm(0.46*H - p.y) + n.y
  return { ts, face: true, blinkLeft: 0.05, blinkRight: 0.05, scrLX: x, scrRX: x, scrLY: y, scrRY: y } }
// Bölge sayımı: tahtadaki 225 hücrenin kaçında sabit bakış komut üretir
let cmd = 0; const by = {}
for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
  const rd = createGazeReader({ model, enterDeg: 10, exitDeg: 6 }); const d = createDwell(); let ts = 0
  for (; ts < 1000; ts += 16.7) rd.push(frameAt({ x: W/2, y: 0.46*H }, ts))
  let f = null; for (let t = 0; t < 1000; t += 16.7, ts += 16.7) { const o = d.push(rd.push(frameAt(cellPt(c, r), ts)).dir, ts); if (o.fire) f = o.fire }
  if (f) { cmd++; by[f] = (by[f] ?? 0) + 1 } }
console.log('Tahta hücrelerinden sabit bakışta komut üreten:', cmd, '/ 225', by)
// B2: yukarı giden yılan, baş sol tarafta (sütun 2), kişi başı izliyor
function run(points, secs) { const rd = createGazeReader({ model, enterDeg: 10, exitDeg: 6 }); const d = createDwell(); let ts = 0; const out = []
  for (; ts < 1000; ts += 16.7) rd.push(frameAt({ x: W/2, y: 0.46*H }, ts))
  for (const p of points) for (let t = 0; t < secs*1000; t += 16.7, ts += 16.7) { const g = rd.push(frameAt(p, ts)); const o = d.push(g.dir, ts); if (o.fire) out.push(`${o.fire}@${p.lbl}`) }
  return out }
const up = (c) => [{ x: W/2, y: 120, lbl: 'tahta üstü' }, ...[7,6,5,4,3,2,1,0].map((r) => ({ ...cellPt(c, r), lbl: `s${c}r${r}` }))]
for (const c of [2, 3, 4, 10, 12]) console.log(`Yukarı komutu, sonra sütun ${c}'de yukarı giden başı izle →`, JSON.stringify(run(up(c), 0.42)))
