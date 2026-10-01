// Kafatası elipsoidlerini yüz kenarına oturtmak için basit rastgele arama
import { loadObj, libs } from './yukle.mjs'
const { VC, FI } = loadObj(); const { FACELIB, HEADLIB } = libs()
const FL = FACELIB(VC, FI); const H = HEADLIB(FL)
const { V, N, RIM, bVert, cutAt } = FL
const SK = H.SK
const rimV = [], inV = []
for (let i = 0; i < FL.NV; i++){ const y = V[i*3+1], z = V[i*3+2]; if (y < cutAt(z) - 0.03) continue; if (bVert[i]) rimV.push(i); else if (RIM[i] > 0.05) inV.push(i) }
const g = (f, x, y, z) => { const h = 0.004; const a = [f(x+h,y,z)-f(x-h,y,z), f(x,y+h,z)-f(x,y-h,z), f(x,y,z+h)-f(x,y,z-h)]; const l = Math.hypot(...a); return a.map((v) => v / l) }
function cost(){
  let c = 0
  for (const i of rimV){ const p = [V[i*3], V[i*3+1], V[i*3+2]]; const d = H.sdSkull(...p); c += 300 * (d + 0.004) ** 2
    const gs = g(H.sdSkull, ...p); const dot = gs[0]*N[i*3] + gs[1]*N[i*3+1] + gs[2]*N[i*3+2]; c += 0.03 * (1 - dot) }
  for (const i of inV){ const d = H.sdSkull(V[i*3], V[i*3+1], V[i*3+2]); const m = 0.012 + 0.03 * Math.min(1, RIM[i] / 0.2); if (d < m) c += 200 * (m - d) ** 2 }
  // makul baş: tepe ~1.0, arka ~ -0.93, genişlik ~0.72
  for (let y = -0.4; y <= 0.75; y += 0.1) for (let z = -0.7; z <= 0.3; z += 0.1){ const d = H.sdSkull(0.765, y, z); if (d < 0) c += 50 * d * d }
  for (let y = 0.55; y <= 0.95; y += 0.1){ const d = H.sdSkull(0.0, y, 0.86 - 0.9 * (y - 0.5)); if (d < 0) c += 50 * d * d }
  c += 20 * (H.sdSkull(0, 1.01, -0.12)) ** 2 + 20 * (H.sdSkull(0, 0.3, -0.95)) ** 2 + 20 * (H.sdSkull(0.72, 0.35, -0.2)) ** 2
  return c
}
const keys = ['cran', 'fore', 'temp', 'side']
let best = cost(); console.log('başlangıç', best.toFixed(4))
let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
for (let it = 0; it < 2500; it++){
  const k = keys[(rnd() * keys.length) | 0], j = 1 + ((rnd() * 5) | 0)
  const old = SK[k][j]; const step = (it < 1200 ? 0.03 : 0.012) * (rnd() * 2 - 1)
  SK[k][j] = Math.max(j >= 3 ? 0.28 : -2, old + step)
  const c = cost(); if (c < best){ best = c } else SK[k][j] = old
}
console.log('son', best.toFixed(4))
for (const k of keys) console.log(k, JSON.stringify(SK[k].map((v) => +v.toFixed(3))))
for (const i of rimV) console.log('rim', i, V[i*3+1].toFixed(3), H.sdSkull(V[i*3], V[i*3+1], V[i*3+2]).toFixed(3))
inV.sort((a, b) => H.sdSkull(V[a*3], V[a*3+1], V[a*3+2]) - H.sdSkull(V[b*3], V[b*3+1], V[b*3+2]))
for (const i of inV.slice(0, 6)) console.log('iç', i, V[i*3].toFixed(3), V[i*3+1].toFixed(3), V[i*3+2].toFixed(3), H.sdSkull(V[i*3], V[i*3+1], V[i*3+2]).toFixed(3), RIM[i].toFixed(2))
