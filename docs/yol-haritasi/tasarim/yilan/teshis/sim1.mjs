// Teşhis: gerçek createGazeReader (model yolu) + gerçek createDwell, Yılan'ın eşikleriyle.
import { createGazeReader } from '../../../../../app/src/lib/gaze.js'
import { createDwell } from '../../../../../app/src/lib/snake.js'
// Ekran 375x812 pt (sahibin cihazı: 1125x2436 görüntü / 3). 1 mm ≈ 6.1 pt (gazeCalib PT_PER_MM).
const PT = 6.1, W = 375, H = 812
// Sistem kalibrasyon hedefleri (GazeCalibration POS / gazeAdapt CAL_FRAC): x %8/%50/%92, y %12/%46/%84
const mm = (pt) => pt / PT
const model = { version: 3, ok: true, closeAt: 0.5, phone: null,
  x: { feature: 'scrX', c: 0, neg: mm(0.08*W - 0.5*W), pos: mm(0.92*W - 0.5*W) },
  y: { feature: 'scrY', c: 0, neg: -mm(0.84*H - 0.46*H), pos: mm(0.46*H - 0.12*H) } }
// Tahta: ekran görüntüsündeki kart ~ x 20..355 pt, y 201..534 pt; 15x15 hücre
const B = { x0: 20, y0: 201, size: 335 }, cell = B.size / 15
const cellPt = (c, r) => ({ x: B.x0 + (c + 0.5) * cell, y: B.y0 + (r + 0.5) * cell })
const frameAt = (p, ts, n = { x: 0, y: 0 }) => { const x = mm(p.x - 0.5*W) + n.x, y = mm(0.46*H - p.y) + n.y
  return { ts, face: true, blinkLeft: 0.05, blinkRight: 0.05, scrLX: x, scrRX: x, scrLY: y, scrRY: y } }
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32)
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd())
function run(points, { sigmaMm = 0, secs = 3 } = {}) {
  const r = createGazeReader({ model, enterDeg: 10, exitDeg: 6 }); const d = createDwell()
  let ts = 0; const center = { x: W / 2, y: 0.46 * H }
  for (; ts < 1000; ts += 1000 / 60) r.push(frameAt(center, ts)) // nötr toplanır
  const fires = []
  for (const p of points) for (let t = 0; t < secs * 1000; t += 1000 / 60, ts += 1000 / 60) {
    const g = r.push(frameAt(p, ts, { x: gauss() * sigmaMm, y: gauss() * sigmaMm })); const o = d.push(g.dir, ts)
    if (o.fire) fires.push(o.fire) }
  return fires
}
console.log('Eşik (birim 10) ekranda:', { x_pt: (10/20)*(0.42*W), up_pt: (10/20)*0.34*H, down_pt: (10/20)*0.38*H })
console.log('Tahta yarı genişliği pt:', B.size/2, ' tahta merkezi y:', B.y0 + B.size/2, ' kalibrasyon merkezi y:', 0.46*H)
console.log('\nA) Gürültüsüz, tahtanın İÇİNDEKİ yeme sabit bakış (3 sn), yem sütunu → yön komutları:')
for (const c of [7, 9, 10, 11, 12, 13, 2, 1]) console.log('  sütun', c, 'satır 7 →', JSON.stringify(run([cellPt(c, 7)])))
console.log('\nB) Yukarı giden yılanın başını izlemek (sütun 4, satırlar 6→1, her satır 0,42 sn):')
const path = [6,5,4,3,2,1].map((r) => cellPt(4, r)); console.log('  ', JSON.stringify(run(path, { secs: 0.42 })))
const pathC = [6,5,4,3,2,1].map((r) => cellPt(7, r)); console.log('  orta sütun 7:', JSON.stringify(run(pathC, { secs: 0.42 })))
console.log('\nC) Gürültülü sabit bakış (tahta ortasına yakın sütun 9, satır 7), 20 sn, ARKit gürültüsü σ mm:')
for (const s of [1, 2, 3, 4]) { const f = run([cellPt(9, 7)], { sigmaMm: s, secs: 20 }); console.log('  σ', s, 'mm →', f.length, 'komut', JSON.stringify(f.slice(0, 12))) }
console.log('\nD) Gürültülü bakış TAM tahta ortası (sütun 7, satır 7), 20 sn:')
for (const s of [2, 3, 4]) { const f = run([cellPt(7, 7)], { sigmaMm: s, secs: 20 }); console.log('  σ', s, 'mm →', f.length, 'komut') }
