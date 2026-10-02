// v5 üretim betiği. Sayfaya gömülecek ikili veriyi yazar (pisirilmis.js):
//  - kafatası/ense kabuğu (yüzle 1,5-2 cm'lik bantta harmanlanır), seyrek kısa saç, derinlik maskesi, iç form (nötr kıvrımlar)
//  - yüz ışık tozu ve kaşlar: MediaPipe ağının üçgen + barisentrik konumları (sayfa noktayı ağın PN yüzeyinden kurar;
//    "kendi yüzün" biçimi aynı konumdan çıkar)
// Konumlar 32 bite paketlenir (x 11, y 11, z 10 bit; ~0,25 mm), normaller oktahedral 2 bayt.
// Kullanım: node uret.mjs  → pisirilmis.js
import fs from 'node:fs'
import { loadObj, libs } from './yukle.mjs'
const D = new URL('.', import.meta.url).pathname
const { VC, FI } = loadObj(); const { FACELIB, HEADLIB } = libs()
const FL = FACELIB(VC, FI); const H = HEADLIB(FL)
const { cutAt, RIM, CURV, sm, L3, V, N, VO, NO, NF, aperture } = FL
const { sdHead, sdBrain, nearest } = H

const OPT = { yaw: 0.42, nShell: 24000, hairN: 520, hairGap: 0.028, neuQ: 6400, nFace: 13500, band: 0.24 }

let seed = 7
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
const gauss = () => { let u = 0; while (!u) u = rnd(); const v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v) }
const t0 = Date.now()
const YAW = OPT.yaw
const camDirLocal = [-Math.sin(YAW), 0.05, Math.cos(YAW)]
const KEYL = (() => { const k = [-0.3, 0.5, 0.82], c = Math.cos(YAW), si = Math.sin(YAW); const v = [k[0] * c - k[2] * si, k[1], k[0] * si + k[2] * c]; const l = L3(...v); return v.map((q) => q / l) })()
const h = 0.008, hc = 0.03, band = 0.035
function grad(f, x, y, z){ const gx = f(x + h, y, z) - f(x - h, y, z), gy = f(x, y + h, z) - f(x, y - h, z), gz = f(x, y, z + h) - f(x, y, z - h); const l = L3(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l] }
const RB = OPT.band   // yüz/kafatası harman bandı (baş birimi; 0,24 ≈ 2,7 cm)

/* yüz kenarı harmanı: ağın kenarından RB içeriye kadar kabuk noktası yavaşça söner, yüz tozu yavaşça belirir */
function coverAt(x, y, z){
  const r = nearest(x, y, z); if (!r) return 0
  const ids = [FI[r.f * 3], FI[r.f * 3 + 1], FI[r.f * 3 + 2]]
  const rim = RIM[ids[0]] * r.b[0] + RIM[ids[1]] * r.b[1] + RIM[ids[2]] * r.b[2]
  return sm(0.0, RB, rim) * sm(0.05, 0.02, r.d)
}

/* saç çizgisi (v3'ten, alın yeni yüze göre) */
function hairLine(x, z){
  const ax = Math.abs(x)
  const front = 0.645 - 0.27 * Math.pow(Math.min(1, ax / 0.6), 2)
  const side = 0.2
  const back = side + (-0.14 - side) * sm(-0.32, -0.8, z)
  return z < -0.32 ? back : side + (front - side) * sm(0.14, 0.44, z)
}
function hairAmt(x, y, z){
  const yl = hairLine(x, z)
  let m = sm(yl - 0.01, yl + 0.1, y)
  if (Math.abs(x) > 0.5 && z > -0.42 && z < 0.2) m *= sm(0.2, 0.32, y)
  return m
}

/* kaba ızgara */
const GX0 = -0.9, GY0 = -0.76, GZ0 = -1.12, GS = 0.04, NX = 46, NY = 48, NZ = 59
const grid = new Float32Array(NX * NY * NZ)
for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) grid[(k * NY + j) * NX + i] = sdHead(GX0 + i * GS, GY0 + j * GS, GZ0 + k * GS)
console.log('ızgara', Date.now() - t0, 'ms')
const idx = (i, j, k) => (k * NY + j) * NX + i
const cells = []
for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++){
  const x = GX0 + (i + 0.5) * GS, y = GY0 + (j + 0.5) * GS, z = GZ0 + (k + 0.5) * GS
  if (y < cutAt(z, x) - 0.04) continue
  let mn = 1e9, mx = -1e9
  for (let c = 0; c < 8; c++){ const v = grid[idx(i + (c & 1), j + ((c >> 1) & 1), k + (c >> 2))]; if (v < mn) mn = v; if (v > mx) mx = v }
  if (mn < band && mx > -band) cells.push(idx(i, j, k))
}

/* "kendi yüzün" kayması: yüze yakın kabuk/maske noktası en yakın üçgenin köşe kaymalarını alır (uzaklıkla söner) */
function ownDelta(x, y, z){
  const r = nearest(x, y, z); if (!r || r.d > 0.12) return [0, 0, 0]
  const w = sm(0.12, 0.04, r.d), o = [0, 0, 0]
  for (let t = 0; t < 3; t++){ const id = FI[r.f * 3 + t]; for (let d = 0; d < 3; d++) o[d] += w * r.b[t] * (VO[id * 3 + d] - V[id * 3 + d]) }
  return o
}

const S = { pos: [], nor: [], cur: [], hair: [], cov: [], dl: [] }
let ns = 0, tries = 0, skipped = 0
const RS = 0.0068, SH = new Map()
const sk = (i, j, k) => ((i + 512) * 1024 + (j + 512)) * 1024 + (k + 512)
function nearS(x, y, z){ const i = Math.floor(x / RS), j = Math.floor(y / RS), k = Math.floor(z / RS)
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++){ const L = SH.get(sk(i + a, j + b, k + c)); if (!L) continue
    for (let q = 0; q < L.length; q += 3){ const dx = L[q] - x, dy = L[q + 1] - y, dz = L[q + 2] - z; if (dx * dx + dy * dy + dz * dz < RS * RS) return true } }
  return false }
function addS(x, y, z){ const key = sk(Math.floor(x / RS), Math.floor(y / RS), Math.floor(z / RS)); let L = SH.get(key); if (!L){ L = []; SH.set(key, L) } L.push(x, y, z) }
while (ns < OPT.nShell && tries < 9e6){
  tries++
  const ci = cells[(rnd() * cells.length) | 0]
  const i0 = ci % NX, j0 = ((ci / NX) | 0) % NY, k0 = (ci / (NX * NY)) | 0
  let x = GX0 + (i0 + rnd()) * GS, y = GY0 + (j0 + rnd()) * GS, z = GZ0 + (k0 + rnd()) * GS
  let d = sdHead(x, y, z); if (Math.abs(d) > band) continue
  let g = grad(sdHead, x, y, z)
  if (y < cutAt(z, x)) continue
  const facing = g[0] * camDirLocal[0] + g[1] * camDirLocal[1] + g[2] * camDirLocal[2]
  const sil = 1 - Math.min(1, Math.abs(facing))
  const hm = hairAmt(x, y, z)
  const earz = Math.abs(x) > 0.66 && y > -0.42 && y < 0.14 && z > -0.2 && z < 0.16 ? 1 : 0
  const dens = (0.45 + 0.55 * sm(-0.5, 0.2, z)) * (1 + 0.6 * earz)
  const lam = Math.max(0, g[0] * KEYL[0] + g[1] * KEYL[1] + g[2] * KEYL[2])
  const w = dens * (1 - 0.3 * hm) * (facing < -0.2 ? 0.25 : 1) * (0.6 + 1.2 * sil * sil) / 1.9 * (0.3 + 0.7 * Math.pow(lam, 1.1))
  if (rnd() > w) continue
  x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdHead(x, y, z)
  if (Math.abs(d) > 0.003){ g = grad(sdHead, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdHead(x, y, z) }
  if (Math.abs(d) > 0.005 || y < cutAt(z, x)) continue
  if (nearS(x, y, z)) continue
  const cov = coverAt(x, y, z)
  if (cov > 0.97){ skipped++; continue }
  // harman bandında örnekleme yoğunluğu da ağınkiyle yarı yarıya paylaşılır: kenarda yoğun bir dikiş oluşmaz
  if (rnd() > 1 - 0.85 * cov) continue
  const lap = (sdHead(x + hc, y, z) + sdHead(x - hc, y, z) + sdHead(x, y + hc, z) + sdHead(x, y - hc, z) + sdHead(x, y, z + hc) + sdHead(x, y, z - hc) - 6 * d) / (hc * hc)
  // yüz kenarındaki yumuşak birleşim gerçek bir kıvrım değil: kıvrım payından muaf
  const nr = nearest(x, y, z), seam = nr && nr.d < 0.14 ? sm(0.14, 0.03, nr.d) : 0
  const wc = 0.4 + 0.6 * (sm(5, 24, Math.abs(lap)) * (1 - seam))
  if (rnd() > wc) continue
  g = grad(sdHead, x, y, z)
  addS(x, y, z)
  S.pos.push(x, y, z); S.nor.push(...g); S.cur.push(seam > 0.2 ? 0 : lap); S.hair.push(hm); S.cov.push(cov); S.dl.push(...ownDelta(x, y, z)); ns++
}
console.log('kabuk', ns, 'deneme', tries, 'yüzde kalan', skipped, Date.now() - t0, 'ms')

/* saç: seyrek, kısa teller; enseye doğru söner (kask ya da gravür gibi okunmaz) */
const Hs = { pos: [], nor: [], tan: [], cur: [], seed: [] }
const LIFT = 0.012
const sdHair = (x, y, z) => sdHead(x, y, z) - LIFT * hairAmt(x, y, z)
const PART = -0.17
function flow(x, y, z, n){
  const back = sm(-0.15, -0.75, z)
  const side = sm(0.3, 0.62, Math.abs(x))
  const s = Math.sign(x - PART) || 1
  let d = [s * (0.55 + 0.4 * side), -0.25 - 0.9 * side, -0.85]
  d = [d[0] * (1 - back), d[1] * (1 - back) - 1.0 * back, d[2] * (1 - back) - 0.35 * back]
  const dn = d[0] * n[0] + d[1] * n[1] + d[2] * n[2]; d = [d[0] - n[0] * dn, d[1] - n[1] * dn, d[2] - n[2] * dn]
  const dl = L3(...d) || 1; return d.map((v) => v / dl)
}
{ const seeds = []; const MIN = OPT.hairGap; let guard = 0
  const cand = []
  for (let i = 0; i < ns; i++) cand.push([S.pos[i * 3], S.pos[i * 3 + 1], S.pos[i * 3 + 2]])
  while (seeds.length < OPT.hairN && guard++ < 300000){
    const c = cand[Math.floor(rnd() * cand.length)]
    let [x, y, z] = c; x += (rnd() - 0.5) * 0.03; y += (rnd() - 0.5) * 0.03; z += (rnd() - 0.5) * 0.03
    const dd = sdHead(x, y, z), g = grad(sdHead, x, y, z); x -= g[0] * dd; y -= g[1] * dd; z -= g[2] * dd
    if (hairAmt(x, y, z) < 0.75) continue
    if (z < -0.55 && rnd() > 0.35) continue
    if (Math.abs(x - PART) < 0.02 && z > -0.2) continue
    let ok = true; for (const s of seeds){ const dx = s[0] - x, dy = s[1] - y, dz = s[2] - z; if (dx * dx + dy * dy + dz * dz < MIN * MIN){ ok = false; break } }
    if (ok) seeds.push([x, y, z])
  }
  const st = 0.0075
  for (const s0 of seeds){
    let [x, y, z] = s0; const L = 0.05 + rnd() * 0.035, sd = rnd()
    let n = grad(sdHair, x, y, z); let dd = sdHair(x, y, z); x -= n[0] * dd; y -= n[1] * dd; z -= n[2] * dd
    const path = []; let s2 = 0, okp = true
    while (s2 < L){
      n = grad(sdHair, x, y, z)
      const d = flow(x, y, z, n)
      path.push([x, y, z, n, d])
      x += d[0] * st; y += d[1] * st; z += d[2] * st
      dd = sdHair(x, y, z); x -= n[0] * dd; y -= n[1] * dd; z -= n[2] * dd
      s2 += st
      if (hairAmt(x, y, z) < 0.35) break
      if (Math.abs(sdHead(x, y, z)) > 0.03){ okp = false; break }
    }
    if (!okp || path.length < 4) continue
    for (let q = 0; q < path.length; q++){
      const [px, py, pz, nn, d2] = path[q]; const u = q / (path.length - 1)
      Hs.pos.push(px, py, pz); Hs.nor.push(nn[0], nn[1], nn[2]); Hs.tan.push(d2[0], d2[1], d2[2])
      // enseye doğru söner
      Hs.cur.push(Math.pow(Math.sin(u * 3.1416), 0.7) * sm(-0.8, -0.2, pz)); Hs.seed.push(sd)
    }
  }
}
console.log('saç', Hs.pos.length / 3, Date.now() - t0, 'ms')

/* derinlik maskesi: daha kaba ızgaradan yüzey ağı (surface nets), biraz içeri alınmış */
const MG = 0.056, MX0 = -0.9, MY0 = -0.78, MZ0 = -1.14, MNX = 33, MNY = 36, MNZ = 42
const mgrid = new Float32Array(MNX * MNY * MNZ)
const midx = (i, j, k) => (k * MNY + j) * MNX + i
for (let k = 0; k < MNZ; k++) for (let j = 0; j < MNY; j++) for (let i = 0; i < MNX; i++) mgrid[midx(i, j, k)] = sdHead(MX0 + i * MG, MY0 + j * MG, MZ0 + k * MG)
const vid = new Int32Array(MNX * MNY * MNZ).fill(-1); const MP = [], MD = []
const EDG = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7]
const cv = new Float32Array(8)
for (let k = 0; k < MNZ - 1; k++) for (let j = 0; j < MNY - 1; j++) for (let i = 0; i < MNX - 1; i++){
  let neg = 0
  for (let c = 0; c < 8; c++){ cv[c] = mgrid[midx(i + (c & 1), j + ((c >> 1) & 1), k + (c >> 2))]; if (cv[c] < 0) neg++ }
  if (neg === 0 || neg === 8) continue
  let sx = 0, sy = 0, sz = 0, n = 0
  for (let e = 0; e < 24; e += 2){
    const a = EDG[e], b = EDG[e + 1], va = cv[a], vb = cv[b]; if ((va < 0) === (vb < 0)) continue
    const t = va / (va - vb)
    sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t; sz += (a >> 2) + ((b >> 2) - (a >> 2)) * t; n++
  }
  let x = MX0 + (i + sx / n) * MG, y = MY0 + (j + sy / n) * MG, z = MZ0 + (k + sz / n) * MG
  if (y < cutAt(z, x) - 0.1) continue
  const d0 = sdHead(x, y, z); let g = grad(sdHead, x, y, z); x -= g[0] * d0; y -= g[1] * d0; z -= g[2] * d0
  g = grad(sdHead, x, y, z)
  vid[midx(i, j, k)] = MP.length / 3; MP.push(x - g[0] * 0.03, y - g[1] * 0.03, z - g[2] * 0.03)
  MD.push(...ownDelta(x, y, z))
}
const MI = []
const mcov = new Float32Array(MP.length / 3)
for (let i = 0; i < mcov.length; i++){ const x = MP[i * 3], y = MP[i * 3 + 1], z = MP[i * 3 + 2]; const r = nearest(x, y, z); if (!r) continue
  const ids = [FI[r.f * 3], FI[r.f * 3 + 1], FI[r.f * 3 + 2]]; const rim = RIM[ids[0]] * r.b[0] + RIM[ids[1]] * r.b[1] + RIM[ids[2]] * r.b[2]
  mcov[i] = r.d < 0.06 && !r.rim ? sm(0.08, 0.14, rim) : 0 }
const quad = (a, b, c, d) => { if (a >= 0 && b >= 0 && c >= 0 && d >= 0 && Math.min(mcov[a], mcov[b], mcov[c], mcov[d]) < 0.5) MI.push(a, b, c, a, c, d) }
for (let k = 1; k < MNZ - 1; k++) for (let j = 1; j < MNY - 1; j++) for (let i = 1; i < MNX - 1; i++){
  const v0 = mgrid[midx(i, j, k)] < 0
  if (v0 !== (mgrid[midx(i + 1, j, k)] < 0)) quad(vid[midx(i, j - 1, k - 1)], vid[midx(i, j, k - 1)], vid[midx(i, j, k)], vid[midx(i, j - 1, k)])
  if (v0 !== (mgrid[midx(i, j + 1, k)] < 0)) quad(vid[midx(i - 1, j, k - 1)], vid[midx(i, j, k - 1)], vid[midx(i, j, k)], vid[midx(i - 1, j, k)])
  if (v0 !== (mgrid[midx(i, j, k + 1)] < 0)) quad(vid[midx(i - 1, j - 1, k)], vid[midx(i, j - 1, k)], vid[midx(i, j, k)], vid[midx(i - 1, j, k)])
}
console.log('maske', MP.length / 3, MI.length / 3)

/* iç form: nötr kıvrımlar (v3 yöntemi). Bölgeler artık burada değil: sayfada yumuşak Gauss bulutları olarak kurulur. */
const PERM = new Uint8Array(512)
{ let s = 1337; const p = []; for (let i = 0; i < 256; i++) p.push(i); for (let i = 255; i > 0; i--){ s = (s * 16807) % 2147483647; const j = s % (i + 1); const tq = p[i]; p[i] = p[j]; p[j] = tq } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255] }
const G3 = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]
function perlin(x, y, z){
  const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z)
  x -= X; y -= Y; z -= Z; const xi = X & 255, yi = Y & 255, zi = Z & 255
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  const u = f(x), v = f(y), w = f(z)
  const gd = (hh, dx, dy, dz) => { const o = (hh % 12) * 3; return G3[o] * dx + G3[o + 1] * dy + G3[o + 2] * dz }
  const A = PERM[xi] + yi, AA = PERM[A] + zi, AB = PERM[A + 1] + zi, B = PERM[xi + 1] + yi, BA = PERM[B] + zi, BB = PERM[B + 1] + zi
  const lp = (a, b, t) => a + (b - a) * t
  return lp(lp(lp(gd(PERM[AA], x, y, z), gd(PERM[BA], x - 1, y, z), u), lp(gd(PERM[AB], x, y - 1, z), gd(PERM[BB], x - 1, y - 1, z), u), v),
    lp(lp(gd(PERM[AA + 1], x, y, z - 1), gd(PERM[BA + 1], x - 1, y, z - 1), u), lp(gd(PERM[AB + 1], x, y - 1, z - 1), gd(PERM[BB + 1], x - 1, y - 1, z - 1), u), v), w)
}
const B = { pos: [], nor: [], fold: [] }
let nb = 0, bt = 0
while (nb < OPT.neuQ && bt < 4e6){
  bt++
  let x = (rnd() * 2 - 1) * 0.6, y = -0.3 + rnd() * 1.2, z = -0.84 + rnd() * 1.52
  let d = sdBrain(x, y, z); if (Math.abs(d) > 0.03) continue
  let g = grad(sdBrain, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdBrain(x, y, z)
  if (Math.abs(d) > 0.004){ g = grad(sdBrain, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d }
  if (y < cutAt(z, x) + 0.06) continue
  const onFis = Math.abs(x) < 0.03 && y > 0.4
  const wx = perlin(x * 2.4 + 11.3, y * 2.4, z * 2.4), wy = perlin(x * 2.4, y * 2.4 + 7.1, z * 2.4)
  const nn = perlin(x * 6.4 + 0.9 * wx, y * 6.4 + 0.9 * wy, z * 6.4)
  const line = Math.exp(-(nn * nn) / (0.03 * 0.03))
  if (onFis){ if (rnd() > 0.25 * (0.1 + 0.9 * line)) continue }
  else if (rnd() > 0.08 + 0.92 * line) continue
  g = grad(sdBrain, x, y, z)
  B.pos.push(x, y, z); B.nor.push(...g); B.fold.push(line); nb++
}
console.log('iç', nb, Date.now() - t0, 'ms')

/* yüz ışık tozu: alan ağırlıklı, mavi gürültü; düz yüzeyde seyrek, sırt ve oluklarda (kaş kemeri, kapak, burun kanadı,
   elmacık) yoğun; ışık alan yanda biraz daha sık. Kenar bandında yoğunluk kabukla paylaşılır. */
const FD = { f: [], u: [], v: [] }
{
  const camDir = (() => { const l = L3(...camDirLocal); return camDirLocal.map((v) => v / l) })()
  const acc = (nx, ny, nz, cur) => (0.12 + 0.88 * sm(3.5, 18, Math.abs(cur))) * (0.36 + 0.64 * Math.pow(Math.max(0, nx * KEYL[0] + ny * KEYL[1] + nz * KEYL[2]), 1.2))
  const W = new Float64Array(NF + 1), AM = new Float32Array(NF); let tot = 0
  for (let f = 0; f < NF; f++){
    W[f] = tot
    if (aperture[f]) continue
    const a = FI[f * 3], b = FI[f * 3 + 1], c = FI[f * 3 + 2]
    if (Math.max(...[a, b, c].map((q) => V[q * 3 + 1] - cutAt(V[q * 3 + 2], V[q * 3]))) < -0.01) continue
    const ux = V[b * 3] - V[a * 3], uy = V[b * 3 + 1] - V[a * 3 + 1], uz = V[b * 3 + 2] - V[a * 3 + 2]
    const vx = V[c * 3] - V[a * 3], vy = V[c * 3 + 1] - V[a * 3 + 1], vz = V[c * 3 + 2] - V[a * 3 + 2]
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const ar = 0.5 * L3(nx, ny, nz)
    const facing = (nx * camDir[0] + ny * camDir[1] + nz * camDir[2]) / (2 * ar || 1)
    const sil = 1 - Math.min(1, Math.abs(facing))
    let am = 0; for (const q of [a, b, c]) am = Math.max(am, acc(N[q * 3], N[q * 3 + 1], N[q * 3 + 2], CURV[q]))
    AM[f] = Math.min(1, am * 1.15)
    const rimF = (RIM[a] + RIM[b] + RIM[c]) / 3
    tot += ar * (facing < -0.2 ? 0.3 : 1) * (0.8 + 0.7 * sil * sil) * AM[f] * (0.45 + 0.55 * sm(0.0, RB, rimF))
  }
  W[NF] = tot
  const RMIN = 0.0052, R2 = RMIN * RMIN, CS = RMIN, hash = new Map()
  const hk = (i, j, k) => ((i + 256) * 512 + (j + 256)) * 512 + (k + 256)
  const near = (P) => { const cx = Math.floor(P[0] / CS), cy = Math.floor(P[1] / CS), cz = Math.floor(P[2] / CS)
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++){ const L = hash.get(hk(cx + a, cy + b, cz + c)); if (!L) continue
      for (let q = 0; q < L.length; q += 3){ const dx = L[q] - P[0], dy = L[q + 1] - P[1], dz = L[q + 2] - P[2]; if (dx * dx + dy * dy + dz * dz < R2) return true } }
    return false }
  const CF = FL.pnCoef(V, N), P = [0, 0, 0]
  const lin = (A, f, u, v, d) => A[FI[f * 3] * 3 + d] * u + A[FI[f * 3 + 1] * 3 + d] * v + A[FI[f * 3 + 2] * 3 + d] * (1 - u - v)
  let n = 0, guard = 0
  while (n < OPT.nFace && guard++ < OPT.nFace * 20){
    const r = rnd() * tot; let lo = 0, hi = NF
    while (hi - lo > 1){ const m = (lo + hi) >> 1; if (W[m] <= r) lo = m; else hi = m }
    const f = lo; if (aperture[f]) continue
    // u, v 1/255 adımlarla: sayfadaki nicelenmiş konum burada da aynı olsun (mavi gürültü bozulmasın)
    const s1 = Math.sqrt(rnd()), r2 = rnd(); let u = Math.round((1 - s1) * 255) / 255, v = Math.round(s1 * (1 - r2) * 255) / 255
    if (u + v > 1) continue
    const cur = FL.attrAt(CURV, f, u, v)
    let nx = lin(N, f, u, v, 0), ny = lin(N, f, u, v, 1), nz = lin(N, f, u, v, 2); const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl
    if (rnd() * AM[f] > acc(nx, ny, nz, cur)) continue
    FL.pnFast(CF, f, u, v, P, 0)
    if (P[1] < cutAt(P[2], P[0]) - 0.004) continue
    if (near(P)) continue
    { const k = hk(Math.floor(P[0] / CS), Math.floor(P[1] / CS), Math.floor(P[2] / CS)); let L = hash.get(k); if (!L){ L = []; hash.set(k, L) } L.push(P[0], P[1], P[2]) }
    FD.f.push(f); FD.u.push(Math.round(u * 255)); FD.v.push(Math.round(v * 255)); n++
  }
  console.log('yüz tozu', n, Date.now() - t0, 'ms')
}
/* kaşlar: kaş noktalarına oturan kısa kıl vuruşları; önden izdüşümle ağ üçgenine bağlanır */
const BR = { f: [], u: [], v: [], k: [] }
{
  const P2d = (i) => [V[i * 3], V[i * 3 + 1]]
  const cr = (pts, t) => { const n = pts.length - 1; const q = Math.max(0, Math.min(n - 1e-6, t * n)); const s = Math.floor(q), u = q - s
    const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(n, s + 2)]
    return [0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u * u + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u * u * u)) }
  for (const Bw of FL.BROWS){
    const up = Bw.up.map(P2d), lo = Bw.lo.map(P2d)
    for (let k = 0; k < 230; k++){
      const t = Math.pow(rnd(), 1.1)
      const a = cr(lo, t), b = cr(up, t)
      const thick = 1 - 0.55 * t
      const along = 0.12 + 0.62 * rnd() * thick
      const bx = a[0] + (b[0] - a[0]) * along, by = a[1] + (b[1] - a[1]) * along
      const tg = [cr(up, Math.min(1, t + 0.02))[0] - cr(up, Math.max(0, t - 0.02))[0], cr(up, Math.min(1, t + 0.02))[1] - cr(up, Math.max(0, t - 0.02))[1]]
      const tl = Math.hypot(tg[0], tg[1]) || 1; tg[0] /= tl; tg[1] /= tl
      const upw = 1 - sm(0.0, 0.45, t)
      let dx = tg[0] * (1 - upw) + Bw.side * 0.25 * upw, dy = tg[1] * (1 - upw) + 1.0 * upw; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl
      const len = (0.016 + 0.012 * rnd()) * (0.75 + 0.25 * thick)
      for (let q = 0; q <= 5; q++){
        const s = q / 5; const x = bx + dx * len * s + gauss() * 0.0007, y = by + dy * len * s + gauss() * 0.0007
        const hit = FL.hitFront(x, y); if (!hit) continue
        BR.f.push(hit.f); BR.u.push(Math.round(hit.u * 255)); BR.v.push(Math.round(hit.v * 255))
        BR.k.push((0.55 + 0.45 * thick) * Math.pow(Math.sin(Math.PI * (0.15 + 0.7 * s)), 0.6))
      }
    }
  }
  console.log('kaş', BR.f.length, Date.now() - t0, 'ms')
}

/* ---------- nicele ve yaz ---------- */
const PB = { x0: -0.92, x1: 0.92, y0: -0.8, y1: 1.16, z0: -1.18, z1: 1.12 }
const parts = []; let off = 0; const sec = {}
function align(n){ while (off % n){ parts.push(Buffer.alloc(1)); off++ } }
function put(grp, nm, arr, t){
  let buf, info
  if (t === 'p32'){ // konum: x 11, y 11, z 10 bit
    const n = arr.length / 3, a = new Uint32Array(n)
    for (let i = 0; i < n; i++){
      const q = (v, lo, hi, m) => Math.max(0, Math.min(m, Math.round((v - lo) / (hi - lo) * m)))
      const xi = q(arr[i * 3], PB.x0, PB.x1, 2047), yi = q(arr[i * 3 + 1], PB.y0, PB.y1, 2047), zi = q(arr[i * 3 + 2], PB.z0, PB.z1, 1023)
      a[i] = (xi | (yi << 11) | (zi << 22)) >>> 0
    }
    buf = Buffer.from(a.buffer); info = { t, n }
  } else if (t === 'oct'){ // normal: oktahedral, 2 × Int8
    const n = arr.length / 3, a = new Int8Array(n * 2)
    for (let i = 0; i < n; i++){
      let x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2]; const s = Math.abs(x) + Math.abs(y) + Math.abs(z) || 1; x /= s; y /= s; z /= s
      if (z < 0){ const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1) }
      a[i * 2] = Math.round(x * 127); a[i * 2 + 1] = Math.round(y * 127)
    }
    buf = Buffer.from(a.buffer); info = { t, n }
  } else if (t === 'i8k'){ let m = 0; for (const v of arr) m = Math.max(m, Math.abs(v)); const k = (m || 1) / 127; const a = new Int8Array(arr.length); for (let i = 0; i < arr.length; i++) a[i] = Math.round(arr[i] / k); buf = Buffer.from(a.buffer); info = { t, k, n: arr.length } }
  else if (t === 'u8'){ let m = 0; for (const v of arr) m = Math.max(m, v); const k = (m || 1) / 255; const a = new Uint8Array(arr.length); for (let i = 0; i < arr.length; i++) a[i] = Math.max(0, Math.min(255, Math.round(arr[i] / k))); buf = Buffer.from(a.buffer); info = { t, k, n: arr.length } }
  else if (t === 'raw8'){ buf = Buffer.from(Uint8Array.from(arr).buffer); info = { t, n: arr.length } }
  else if (t === 'u16'){ buf = Buffer.from(Uint16Array.from(arr).buffer); info = { t, n: arr.length } }
  else if (t === 'vlq'){ // dizin: ardışık fark + zikzak + değişken uzunluk
    const ib = []; let prev = 0
    for (const v of arr){ const dlt = v - prev; prev = v; let z = dlt >= 0 ? dlt * 2 : -dlt * 2 - 1; while (z >= 128){ ib.push((z & 127) | 128); z >>= 7 } ib.push(z) }
    buf = Buffer.from(Uint8Array.from(ib).buffer); info = { t, n: arr.length, b: ib.length }
  }
  align(4)
  ;(sec[grp] = sec[grp] || {})[nm] = Object.assign(info, { o: off })
  parts.push(buf); off += buf.length
}
// kabuk: "kendi yüzün" kayması olan noktalar başa alınır; kayma yalnız onlar için saklanır
{
  const order = [...Array(ns).keys()].sort((a, b) => (Math.abs(S.dl[b * 3]) + Math.abs(S.dl[b * 3 + 1]) + Math.abs(S.dl[b * 3 + 2]) > 1e-5) - (Math.abs(S.dl[a * 3]) + Math.abs(S.dl[a * 3 + 1]) + Math.abs(S.dl[a * 3 + 2]) > 1e-5))
  const re = (A, k) => { const o = []; for (const i of order) for (let d = 0; d < k; d++) o.push(A[i * k + d]); return o }
  const pos = re(S.pos, 3), nor = re(S.nor, 3), cur = re(S.cur, 1), hm = re(S.hair, 1), cov = re(S.cov, 1), dl = re(S.dl, 3)
  let nm = 0; while (nm < ns && Math.abs(dl[nm * 3]) + Math.abs(dl[nm * 3 + 1]) + Math.abs(dl[nm * 3 + 2]) > 1e-5) nm++
  put('shell', 'pos', pos, 'p32'); put('shell', 'nor', nor, 'oct'); put('shell', 'cur', cur.map((v) => Math.max(-60, Math.min(60, v))), 'i8k')
  // saç (4 bit) + örtü (4 bit) tek baytta
  put('shell', 'hc', hm.map((h2, i) => (Math.round(h2 * 15) << 4) | Math.round(cov[i] * 15)), 'raw8')
  put('shell', 'dl', dl.slice(0, nm * 3), 'i8k')
  console.log('kabuk kayan', nm)
}
put('hair', 'pos', Hs.pos, 'p32'); put('hair', 'nor', Hs.nor, 'oct'); put('hair', 'tan', Hs.tan, 'oct'); put('hair', 'cur', Hs.cur, 'u8'); put('hair', 'seed', Hs.seed, 'u8')
if (MP.length / 3 > 65535) throw new Error('maske çok büyük')
put('mask', 'pos', MP, 'p32'); put('mask', 'idx', MI, 'vlq'); put('mask', 'dl', MD, 'i8k')
put('brain', 'pos', B.pos, 'p32'); put('brain', 'nor', B.nor, 'oct'); put('brain', 'fold', B.fold, 'u8')
put('face', 'f', FD.f, 'u16'); put('face', 'u', FD.u, 'raw8'); put('face', 'v', FD.v, 'raw8')
put('brow', 'f', BR.f, 'u16'); put('brow', 'u', BR.u, 'raw8'); put('brow', 'v', BR.v, 'raw8'); put('brow', 'k', BR.k, 'u8')
const bin = Buffer.concat(parts)
const HDR = { sec, pb: PB, info: { shell: ns, hair: Hs.pos.length / 3, maskTris: MI.length / 3, brain: nb, face: FD.f.length, brow: BR.f.length, ms: Date.now() - t0 } }

/* yüz ağı: kanonik köşeler (cm, Int16 nicelenmiş) ve üçgen dizini; sıkıştırılmış tek dizi */
let vm = 0; for (const v of VC) vm = Math.max(vm, Math.abs(v)); const vk = vm / 32767
const vq = new Int16Array(VC.length); for (let i = 0; i < VC.length; i++) vq[i] = Math.round(VC[i] / vk)
const ib = []; let prev = 0
for (const v of FI){ const dlt = v - prev; prev = v; let z = dlt >= 0 ? dlt * 2 : -dlt * 2 - 1; while (z >= 128){ ib.push((z & 127) | 128); z >>= 7 } ib.push(z) }
const meshBin = Buffer.concat([Buffer.from(vq.buffer), Buffer.from(Uint8Array.from(ib).buffer)])
const MESH = { nv: VC.length / 3, nf: FI.length / 3, k: vk, vBytes: vq.byteLength, iBytes: ib.length }

const out = `/* önceden üretilmiş kafatası, saç, maske, iç form ve yüz tozu konumları: v5-kaynak/uret.mjs çıktısı (konum 32 bit paket, normal oktahedral) */
const BAKED_OPT = ${JSON.stringify(OPT)};
const BAKED_HDR = ${JSON.stringify(HDR)};
const BAKED_BIN = "${bin.toString('base64')}";
/* MediaPipe kanonik yüz modeli (canonical_face_model.obj, 468 köşe, 898 üçgen; Apache 2.0: model/KAYNAK.md, model/LICENSE-mediapipe.txt).
   Köşeler cm cinsinden Int16'ya nicelenmiş; üçgen dizini fark + zikzak + değişken uzunlukla sıkıştırılmış. */
const FACE_MESH = ${JSON.stringify(MESH)};
const FACE_BIN = "${meshBin.toString('base64')}";
`
fs.writeFileSync(D + 'pisirilmis.js', out)
console.log('yazıldı', (out.length / 1024).toFixed(0), 'KB', 'ikili', bin.length, 'mesh', meshBin.length, 'B', Date.now() - t0, 'ms')
