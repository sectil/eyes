// v4 üretim betiği: kafatası/ense kabuğu, saç, derinlik maskesi ve iç hacim noktalarını üretir; sayfaya gömülecek ikili veriyi yazar.
// Yüzün kendisi (MediaPipe kanonik ağı) sayfada çalışma anında noktaya çevrilir; burada yalnız kafatası birleşimi için kullanılır.
// Kullanım: node uret.mjs  → pisirilmis.js
import fs from 'node:fs'
import { loadObj, libs } from './yukle.mjs'
const D = new URL('.', import.meta.url).pathname
const { VC, FI } = loadObj(); const { FACELIB, HEADLIB } = libs()
const FL = FACELIB(VC, FI); const H = HEADLIB(FL)
const { cutAt, RIM, sm, L3 } = FL
const { sdHead, sdBrain, brainParts, nearest } = H

const OPT = { yaw: 0.28, nShell: 40000, hairN: 1500, hairGap: 0.024, regQ: 1300, neuQ: 6200,
  regC: [[-0.6, 0.45, 0.17], [0.03, 0.62, 0.17], [-0.5, 0.17, 0.15], [-0.14, 0.33, 0.15], [-0.26, 0.82, 0.16]] }

let seed = 7
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
const gauss = () => { let u = 0; while (!u) u = rnd(); const v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v) }
const t0 = Date.now()
const YAW = OPT.yaw
const camDirLocal = [-Math.sin(YAW), 0.05, Math.cos(YAW)]
const KEYL = (() => { const k = [-0.3, 0.5, 0.82], c = Math.cos(YAW), si = Math.sin(YAW); const v = [k[0] * c - k[2] * si, k[1], k[0] * si + k[2] * c]; const l = L3(...v); return v.map((q) => q / l) })()
const h = 0.008, hc = 0.03, band = 0.035
function grad(f, x, y, z){ const gx = f(x + h, y, z) - f(x - h, y, z), gy = f(x, y + h, z) - f(x, y - h, z), gz = f(x, y, z + h) - f(x, y, z - h); const l = L3(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l] }

/* yüz kenarı geçişi: en yakın ağ noktası kenardan içerideyse kabuk noktası söner (yüzü ağın kendi noktaları çizer) */
function coverAt(x, y, z){
  const r = nearest(x, y, z); if (!r) return 0
  const ids = [FI[r.f * 3], FI[r.f * 3 + 1], FI[r.f * 3 + 2]]
  const rim = RIM[ids[0]] * r.b[0] + RIM[ids[1]] * r.b[1] + RIM[ids[2]] * r.b[2]
  return sm(0.02, 0.1, rim) * sm(0.04, 0.015, r.d)
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
const GX0 = -0.9, GY0 = -0.72, GZ0 = -1.12, GS = 0.04, NX = 46, NY = 47, NZ = 59
const grid = new Float32Array(NX * NY * NZ)
for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) grid[(k * NY + j) * NX + i] = sdHead(GX0 + i * GS, GY0 + j * GS, GZ0 + k * GS)
console.log('ızgara', Date.now() - t0, 'ms')
const idx = (i, j, k) => (k * NY + j) * NX + i
const cells = []
for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++){
  const y = GY0 + (j + 0.5) * GS, z = GZ0 + (k + 0.5) * GS
  if (y < cutAt(z) - 0.03) continue
  let mn = 1e9, mx = -1e9
  for (let c = 0; c < 8; c++){ const v = grid[idx(i + (c & 1), j + ((c >> 1) & 1), k + (c >> 2))]; if (v < mn) mn = v; if (v > mx) mx = v }
  if (mn < band && mx > -band) cells.push(idx(i, j, k))
}
const S = { pos: [], nor: [], cur: [], hair: [], line: [], cov: [], mf: [], mb0: [], mb1: [], mw: [] }
/* yüze bağ: kendi yüzün biçimine geçerken yüze yakın kabuk ve maske noktaları da aynı yer değiştirmeyi alır */
function bind(x, y, z){
  const r = nearest(x, y, z); if (!r || r.d > 0.12) return [0, 0, 0, 0]
  const ids = [FI[r.f * 3], FI[r.f * 3 + 1], FI[r.f * 3 + 2]]
  return [r.f, r.b[0], r.b[1], sm(0.12, 0.04, r.d)]
}
const pushS = (x, y, z, g, cur, hm, line, cov) => { S.pos.push(x, y, z); S.nor.push(g[0], g[1], g[2]); S.cur.push(cur); S.hair.push(hm); S.line.push(line); S.cov.push(cov)
  const b = bind(x, y, z); S.mf.push(b[0]); S.mb0.push(b[1]); S.mb1.push(b[2]); S.mw.push(b[3]) }
let ns = 0, tries = 0, skipped = 0
// mavi gürültü: kabuk noktaları birbirine RS'den yakın düşmez
const RS = 0.0058, SH = new Map()
const sk = (i, j, k) => ((i + 512) * 1024 + (j + 512)) * 1024 + (k + 512)
function nearS(x, y, z){ const i = Math.floor(x / RS), j = Math.floor(y / RS), k = Math.floor(z / RS)
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++){ const L = SH.get(sk(i + a, j + b, k + c)); if (!L) continue
    for (let q = 0; q < L.length; q += 3){ const dx = L[q] - x, dy = L[q + 1] - y, dz = L[q + 2] - z; if (dx * dx + dy * dy + dz * dz < RS * RS) return true } }
  return false }
function addS(x, y, z){ const key = sk(Math.floor(x / RS), Math.floor(y / RS), Math.floor(z / RS)); let L = SH.get(key); if (!L){ L = []; SH.set(key, L) } L.push(x, y, z) }
while (ns < OPT.nShell && tries < 8e6){
  tries++
  const ci = cells[(rnd() * cells.length) | 0]
  const i0 = ci % NX, j0 = ((ci / NX) | 0) % NY, k0 = (ci / (NX * NY)) | 0
  let x = GX0 + (i0 + rnd()) * GS, y = GY0 + (j0 + rnd()) * GS, z = GZ0 + (k0 + rnd()) * GS
  let d = sdHead(x, y, z); if (Math.abs(d) > band) continue
  let g = grad(sdHead, x, y, z)
  if (y < cutAt(z)) continue
  const facing = g[0] * camDirLocal[0] + g[1] * camDirLocal[1] + g[2] * camDirLocal[2]
  const sil = 1 - Math.min(1, Math.abs(facing))
  const hm = hairAmt(x, y, z)
  // yüzle aynı ağırlıklar (siluet, ışık); yoğunluk yüzden arkaya doğru yavaşça azalır: maske sınırı oluşmaz
  // kulak: kafatası noktalarından biraz daha sık (kıvrımları okunsun)
  const earz = Math.abs(x) > 0.66 && y > -0.42 && y < 0.14 && z > -0.2 && z < 0.16 ? 1 : 0
  const dens = (0.42 + 0.58 * sm(-0.5, 0.2, z)) * (1 + 0.8 * earz)
  const lam = Math.max(0, g[0] * KEYL[0] + g[1] * KEYL[1] + g[2] * KEYL[2])
  const w = dens * (1 - 0.3 * hm) * (facing < -0.2 ? 0.25 : 1) * (0.6 + 1.4 * sil * sil) / 2.0 * (0.3 + 0.7 * Math.pow(lam, 1.1))
  if (rnd() > w) continue
  x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdHead(x, y, z)
  if (Math.abs(d) > 0.003){ g = grad(sdHead, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdHead(x, y, z) }
  if (Math.abs(d) > 0.005 || y < cutAt(z)) continue
  if (nearS(x, y, z)) continue
  const cov = coverAt(x, y, z)
  if (cov > 0.97){ skipped++; continue }
  const lap = (sdHead(x + hc, y, z) + sdHead(x - hc, y, z) + sdHead(x, y + hc, z) + sdHead(x, y - hc, z) + sdHead(x, y, z + hc) + sdHead(x, y, z - hc) - 6 * d) / (hc * hc)
  // kıvrım payı yüzdekiyle aynı; yüz kenarındaki yumuşak birleşim (gerçek bir kıvrım değil) bu paydan muaf
  const nr = nearest(x, y, z), seam = nr && nr.d < 0.1 ? sm(0.1, 0.03, nr.d) : 0
  const wc = 0.38 + 0.62 * (sm(5, 24, Math.abs(lap)) * (1 - seam) + 0.25 * seam)
  if (rnd() > wc) continue
  g = grad(sdHead, x, y, z)
  addS(x, y, z)
  pushS(x, y, z, g, lap, hm, 0, cov); ns++
}
console.log('kabuk', ns, 'deneme', tries, 'yüzde kalan', skipped, Date.now() - t0, 'ms')

/* kesim konturu: kesim düzlemi ile yüzeyin kesişimi (çizgi 2) */
{ const ZC = 0.12
  for (let i = 0; i < 640; i++){
    const th = (i / 640) * 6.2832 + rnd() * 0.004
    const sx = Math.sin(th), cz = Math.cos(th)
    let r = 0.02, inside = true
    const at = (rr) => { const z = ZC + rr * cz; const y = cutAt(z) + 0.002; return sdHead(rr * sx, y, z) }
    let last = 0.02
    for (r = 0.02; r < 1.3; r += 0.006){ if (at(r) > 0){ inside = false; break } last = r }
    if (inside) continue
    let lo = last, hi = r; for (let it = 0; it < 22; it++){ const m = (lo + hi) / 2; if (at(m) > 0) hi = m; else lo = m }
    const z = ZC + lo * cz, x = lo * sx, y = cutAt(z) + 0.004
    const g = grad(sdHead, x, y + 0.02, z)
    const gh = [g[0], 0, g[2]]; const gl = Math.hypot(gh[0], gh[2]) || 1
    pushS(x + gh[0] / gl * 0.002, y + gauss() * 0.0015, z + gh[2] / gl * 0.002, [gh[0] / gl, 0, gh[2] / gl], 1, 0, 2, 0)
  }
}

/* saç: tek ayrım çizgisinden akan kısa, paralel teller (v3 yöntemi) */
const Hs = { pos: [], nor: [], tan: [], cur: [], seed: [] }
const LIFT = 0.017
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
  // tohumlar yüzeyden bağımsız örneklenir (kabuk noktaları saçta seyreltilmiş)
  const cand = []
  for (let i = 0; i < ns; i++) cand.push([S.pos[i * 3], S.pos[i * 3 + 1], S.pos[i * 3 + 2]])
  while (seeds.length < OPT.hairN && guard++ < 300000){
    const c = cand[Math.floor(rnd() * cand.length)]
    let [x, y, z] = c; x += (rnd() - 0.5) * 0.03; y += (rnd() - 0.5) * 0.03; z += (rnd() - 0.5) * 0.03
    const dd = sdHead(x, y, z), g = grad(sdHead, x, y, z); x -= g[0] * dd; y -= g[1] * dd; z -= g[2] * dd
    if (hairAmt(x, y, z) < 0.75) continue
    if (Math.abs(x - PART) < 0.02 && z > -0.2) continue
    let ok = true; for (const s of seeds){ const dx = s[0] - x, dy = s[1] - y, dz = s[2] - z; if (dx * dx + dy * dy + dz * dz < MIN * MIN){ ok = false; break } }
    if (ok) seeds.push([x, y, z])
  }
  const st = 0.0085
  for (const s0 of seeds){
    let [x, y, z] = s0; const L = 0.1 + rnd() * 0.06, sd = rnd()
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
    if (!okp || path.length < 6) continue
    for (let q = 0; q < path.length; q++){
      const [px, py, pz, nn, d2] = path[q]; const u = q / (path.length - 1)
      Hs.pos.push(px, py, pz); Hs.nor.push(nn[0], nn[1], nn[2]); Hs.tan.push(d2[0], d2[1], d2[2])
      Hs.cur.push(Math.pow(Math.sin(u * 3.1416), 0.7)); Hs.seed.push(sd)
    }
  }
}
console.log('saç', Hs.pos.length / 3, Date.now() - t0, 'ms')

/* derinlik maskesi: ızgaradan yüzey ağı, biraz içeri alınmış */
const vid = new Int32Array(NX * NY * NZ).fill(-1); const MP = [], MB = { mf: [], mb0: [], mb1: [], mw: [] }
const EDG = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7]
const cv = new Float32Array(8)
for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++){
  let neg = 0
  for (let c = 0; c < 8; c++){ cv[c] = grid[idx(i + (c & 1), j + ((c >> 1) & 1), k + (c >> 2))]; if (cv[c] < 0) neg++ }
  if (neg === 0 || neg === 8) continue
  let sx = 0, sy = 0, sz = 0, n = 0
  for (let e = 0; e < 24; e += 2){
    const a = EDG[e], b = EDG[e + 1], va = cv[a], vb = cv[b]; if ((va < 0) === (vb < 0)) continue
    const t = va / (va - vb)
    sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t; sz += (a >> 2) + ((b >> 2) - (a >> 2)) * t; n++
  }
  let x = GX0 + (i + sx / n) * GS, y = GY0 + (j + sy / n) * GS, z = GZ0 + (k + sz / n) * GS
  if (y < cutAt(z) - 0.08) continue
  // bir kez tam yüzeye çek, sonra içeri al
  const d0 = sdHead(x, y, z); let g = grad(sdHead, x, y, z); x -= g[0] * d0; y -= g[1] * d0; z -= g[2] * d0
  g = grad(sdHead, x, y, z)
  vid[idx(i, j, k)] = MP.length / 3; MP.push(x - g[0] * 0.024, y - g[1] * 0.024, z - g[2] * 0.024)
  const bb = bind(x, y, z); MB.mf.push(bb[0]); MB.mb0.push(bb[1]); MB.mb1.push(bb[2]); MB.mw.push(bb[3])
}
const MI = []
// yüzün kendisi sayfada ağın içeri alınmış kopyasıyla maskelenir (ızgara göz çukurunda çok kaba); burada yalnız kafatası tarafı kalır
const mcov = new Float32Array(MP.length / 3)
for (let i = 0; i < mcov.length; i++){ const x = MP[i * 3], y = MP[i * 3 + 1], z = MP[i * 3 + 2]; const r = nearest(x, y, z); if (!r) continue
  const ids = [FI[r.f * 3], FI[r.f * 3 + 1], FI[r.f * 3 + 2]]; const rim = RIM[ids[0]] * r.b[0] + RIM[ids[1]] * r.b[1] + RIM[ids[2]] * r.b[2]
  mcov[i] = r.d < 0.05 && !r.rim ? sm(0.06, 0.12, rim) : 0 }
const quad = (a, b, c, d) => { if (a >= 0 && b >= 0 && c >= 0 && d >= 0 && Math.min(mcov[a], mcov[b], mcov[c], mcov[d]) < 0.5) MI.push(a, b, c, a, c, d) }
for (let k = 1; k < NZ - 1; k++) for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++){
  const v0 = grid[idx(i, j, k)] < 0
  if (v0 !== (grid[idx(i + 1, j, k)] < 0)) quad(vid[idx(i, j - 1, k - 1)], vid[idx(i, j, k - 1)], vid[idx(i, j, k)], vid[idx(i, j - 1, k)])
  if (v0 !== (grid[idx(i, j + 1, k)] < 0)) quad(vid[idx(i - 1, j, k - 1)], vid[idx(i, j, k - 1)], vid[idx(i, j, k)], vid[idx(i - 1, j, k)])
  if (v0 !== (grid[idx(i, j, k + 1)] < 0)) quad(vid[idx(i - 1, j - 1, k)], vid[idx(i, j - 1, k)], vid[idx(i, j, k)], vid[idx(i - 1, j, k)])
}
console.log('maske', MP.length / 3, MI.length / 3)

/* iç hacim (v3 ile aynı yöntem) */
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
const B = { pos: [], nor: [], reg: [], w: [], fold: [] }
const acc = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
const sumW = [0, 0, 0, 0, 0]
const quota = [OPT.regQ, OPT.regQ, OPT.regQ, OPT.regQ, OPT.regQ, OPT.neuQ], cnt = [0, 0, 0, 0, 0, 0]
const total = quota.reduce((a, b) => a + b, 0)
let nb = 0, bt = 0
const zcs = (y) => -0.1 + 0.22 * Math.max(0, Math.min(1, (0.9 - y) / 0.62))
const CYW = Math.cos(YAW), SYW = Math.sin(YAW), RC = OPT.regC
while (nb < total && bt < 4e6){
  bt++
  let x = (rnd() * 2 - 1) * 0.6, y = -0.3 + rnd() * 1.2, z = -0.84 + rnd() * 1.52
  let d = sdBrain(x, y, z); if (Math.abs(d) > 0.03) continue
  let g = grad(sdBrain, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; d = sdBrain(x, y, z)
  if (Math.abs(d) > 0.004){ g = grad(sdBrain, x, y, z); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d }
  if (y < cutAt(z) + 0.06) continue
  const onFis = Math.abs(x) < 0.03 && y > 0.4
  const qx = -Math.abs(x) * CYW + z * SYW, qy = y
  let reg = 5, w = 0
  if (!onFis && x < 0.03){
    const wM = Math.exp(-Math.pow((z - zcs(y) - 0.07) / 0.065, 2)) * sm(0.5, 0.64, y)
    const ws = RC.map((c) => sm(c[2], c[2] * 0.45, Math.hypot(qx - c[0], qy - c[1])))
    ws[4] = Math.max(ws[4], wM)
    for (let r = 0; r < 5; r++) if (ws[r] > w){ w = ws[r]; reg = r }
  }
  if (reg < 5 && w < 0.25){ reg = 5; w = 0 }
  if (cnt[reg] >= quota[reg]) continue
  const wx = perlin(x * 2.4 + 11.3, y * 2.4, z * 2.4), wy = perlin(x * 2.4, y * 2.4 + 7.1, z * 2.4)
  const nn = perlin(x * 6.4 + 0.9 * wx, y * 6.4 + 0.9 * wy, z * 6.4)
  const line = Math.exp(-(nn * nn) / (0.03 * 0.03))
  if (onFis){ if (rnd() > 0.25 * (0.1 + 0.9 * line)) continue }
  else if (reg < 5){ if (rnd() > 0.2 + 0.8 * line) continue }
  else if (rnd() > 0.08 + 0.92 * line) continue
  g = grad(sdBrain, x, y, z)
  cnt[reg]++
  if (reg < 5){ sumW[reg] += w; if (x < 0.02){ const A = acc[reg]; A[0] += x * w; A[1] += y * w; A[2] += z * w; A[3] += w } }
  B.pos.push(x, y, z); B.nor.push(g[0], g[1], g[2]); B.reg.push(reg); B.w.push(w); B.fold.push(line); nb++
}
const anchors = acc.map((A) => A[3] > 0 ? [A[0] / A[3], A[1] / A[3], A[2] / A[3]] : [0, 0, 0])
const meanW = sumW.reduce((a, b) => a + b, 0) / 5
const norm = sumW.map((s) => Math.max(0.6, Math.min(2.2, meanW / Math.max(1e-3, s))))
console.log('iç', nb, cnt, Date.now() - t0, 'ms')

/* ---------- nicele ve yaz ---------- */
const parts = []; let off = 0; const sec = {}
function put(grp, nm, arr, t){
  let buf, info
  if (t === 'i16'){ let m = 0; for (const v of arr) m = Math.max(m, Math.abs(v)); const k = (m || 1) / 32767; const a = new Int16Array(arr.length); for (let i = 0; i < arr.length; i++) a[i] = Math.round(arr[i] / k); buf = Buffer.from(a.buffer); info = { t, k } }
  else if (t === 'i8'){ const a = new Int8Array(arr.length); for (let i = 0; i < arr.length; i++) a[i] = Math.max(-127, Math.min(127, Math.round(arr[i] * 127))); buf = Buffer.from(a.buffer); info = { t } }
  else if (t === 'u8'){ let m = 0; for (const v of arr) m = Math.max(m, v); const k = (m || 1) / 255; const a = new Uint8Array(arr.length); for (let i = 0; i < arr.length; i++) a[i] = Math.max(0, Math.min(255, Math.round(arr[i] / k))); buf = Buffer.from(a.buffer); info = { t, k } }
  else if (t === 'idx'){ const a = new Uint16Array(arr); buf = Buffer.from(a.buffer); info = { t } }
  while (off % 4){ parts.push(Buffer.alloc(1)); off++ }
  (sec[grp] = sec[grp] || {})[nm] = Object.assign(info, { o: off, n: arr.length })
  parts.push(buf); off += buf.length
}
put('shell', 'pos', S.pos, 'i16'); put('shell', 'nor', S.nor, 'i8'); put('shell', 'cur', S.cur.map((v) => Math.max(-60, Math.min(60, v))), 'i16'); put('shell', 'hair', S.hair, 'u8'); put('shell', 'line', S.line, 'u8'); put('shell', 'cov', S.cov, 'u8'); put('shell', 'mf', S.mf, 'idx'); put('shell', 'mb0', S.mb0, 'u8'); put('shell', 'mb1', S.mb1, 'u8'); put('shell', 'mw', S.mw, 'u8')
put('hair', 'pos', Hs.pos, 'i16'); put('hair', 'nor', Hs.nor, 'i8'); put('hair', 'tan', Hs.tan, 'i8'); put('hair', 'cur', Hs.cur, 'u8'); put('hair', 'seed', Hs.seed, 'u8')
if (MP.length / 3 > 65535) throw new Error('maske çok büyük')
put('mask', 'pos', MP, 'i16'); put('mask', 'idx', MI, 'idx'); put('mask', 'mf', MB.mf, 'idx'); put('mask', 'mb0', MB.mb0, 'u8'); put('mask', 'mb1', MB.mb1, 'u8'); put('mask', 'mw', MB.mw, 'u8')
put('brain', 'pos', B.pos, 'i16'); put('brain', 'nor', B.nor, 'i8'); put('brain', 'reg', B.reg, 'u8'); put('brain', 'w', B.w, 'u8'); put('brain', 'fold', B.fold, 'u8')
const bin = Buffer.concat(parts)
const HDR = { sec, anchors, norm, info: { shell: S.line.length, hair: Hs.pos.length / 3, maskTris: MI.length / 3, brain: nb, ms: Date.now() - t0 } }

/* yüz ağı: kanonik köşeler (cm, Int16 nicelenmiş) ve üçgen dizini; sıkıştırılmış tek dizi */
let vm = 0; for (const v of VC) vm = Math.max(vm, Math.abs(v)); const vk = vm / 32767
const vq = new Int16Array(VC.length); for (let i = 0; i < VC.length; i++) vq[i] = Math.round(VC[i] / vk)
// dizin: ardışık fark + zikzak + değişken uzunluk (yaklaşık yarıya iner)
const ib = []; let prev = 0
for (const v of FI){ const dlt = v - prev; prev = v; let z = dlt >= 0 ? dlt * 2 : -dlt * 2 - 1; while (z >= 128){ ib.push((z & 127) | 128); z >>= 7 } ib.push(z) }
const meshBin = Buffer.concat([Buffer.from(vq.buffer), Buffer.from(Uint8Array.from(ib).buffer)])
const MESH = { nv: VC.length / 3, nf: FI.length / 3, k: vk, vBytes: vq.byteLength, iBytes: ib.length }

const out = `/* önceden üretilmiş kafatası, saç, maske ve iç hacim noktaları: v4-kaynak/uret.mjs çıktısı, nicelenmiş (konum Int16, normal Int8) */
const BAKED_OPT = ${JSON.stringify(OPT)};
const BAKED_HDR = ${JSON.stringify(HDR)};
const BAKED_BIN = "${bin.toString('base64')}";
/* MediaPipe kanonik yüz modeli (canonical_face_model.obj, 468 köşe, 898 üçgen; Apache 2.0, model/KAYNAK.md).
   Köşeler cm cinsinden Int16'ya nicelenmiş; üçgen dizini fark + zikzak + değişken uzunlukla sıkıştırılmış. */
const FACE_MESH = ${JSON.stringify(MESH)};
const FACE_BIN = "${meshBin.toString('base64')}";
`
fs.writeFileSync(D + 'pisirilmis.js', out)
console.log('yazıldı', (out.length / 1024).toFixed(0), 'KB', 'mesh', meshBin.length, 'B', Date.now() - t0, 'ms')
