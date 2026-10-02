/* ================= kafatası + yüz birleşimi (yalnız üretim betiğinde çalışır) =================
   Yüz: kanonik ağın kendisi (işaretli uzaklık, ağın arkasında ince bir kabuk).
   Kafatası, ense, kulak: stilize; yüz kenarında yumuşak birleşimle (smin) yüze kaynar. */
function HEADLIB(FL){
  const { V, N, FI, NF, isBEdge, bVert, L3, sm, eyes, R_EYE, cutAt } = FL;
  function el(x, y, z, a, b, c){ const k0 = L3(x / a, y / b, z / c), k1 = L3(x / (a * a), y / (b * b), z / (c * c)); return k1 < 1e-9 ? -Math.min(a, b, c) : k0 * (k0 - 1) / k1; }
  function smin(a, b, k){ const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
  function smax(a, b, k){ const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * 0.25; }

  /* ---------- ağa uzaklık: ızgara hızlandırmalı en yakın üçgen ---------- */
  const G0 = [-0.8, -1.12, 0.0], GC = 0.04, GR = 0.13;
  const GN = [Math.ceil(1.6 / GC), Math.ceil(1.7 / GC), Math.ceil(1.2 / GC)];
  const cells = new Map();
  for (let f = 0; f < NF; f++){
    const ids = [FI[f * 3], FI[f * 3 + 1], FI[f * 3 + 2]];
    const lo = [0, 1, 2].map((d) => Math.min(...ids.map((i) => V[i * 3 + d])) - GR), hi = [0, 1, 2].map((d) => Math.max(...ids.map((i) => V[i * 3 + d])) + GR);
    const a = lo.map((v, d) => Math.max(0, Math.floor((v - G0[d]) / GC))), b = hi.map((v, d) => Math.min(GN[d] - 1, Math.floor((v - G0[d]) / GC)));
    for (let i = a[0]; i <= b[0]; i++) for (let j = a[1]; j <= b[1]; j++) for (let k = a[2]; k <= b[2]; k++){ const key = (k * GN[1] + j) * GN[0] + i; let c = cells.get(key); if (!c){ c = []; cells.set(key, c); } c.push(f); }
  }
  function closestTri(px, py, pz, f){
    const ia = FI[f * 3], ib = FI[f * 3 + 1], ic = FI[f * 3 + 2];
    const ax = V[ia * 3], ay = V[ia * 3 + 1], az = V[ia * 3 + 2], bx = V[ib * 3], by = V[ib * 3 + 1], bz = V[ib * 3 + 2], cx = V[ic * 3], cy = V[ic * 3 + 1], cz = V[ic * 3 + 2];
    const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
    const apx = px - ax, apy = py - ay, apz = pz - az;
    const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
    if (d1 <= 0 && d2 <= 0) return [1, 0, 0];
    const bpx = px - bx, bpy = py - by, bpz = pz - bz;
    const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) return [0, 1, 0];
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0){ const v = d1 / (d1 - d3); return [1 - v, v, 0]; }
    const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
    const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
    if (d6 >= 0 && d5 <= d6) return [0, 0, 1];
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0){ const w = d2 / (d2 - d6); return [1 - w, 0, w]; }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0){ const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return [0, 1 - w, w]; }
    const den = 1 / (va + vb + vc); const v = vb * den, w = vc * den; return [1 - v - w, v, w];
  }
  /* sonuç: { d: işaretsiz uzaklık, f, b: barisentrik, rim: en yakın nokta açık kenarda mı, s: normal yönlü işaret } */
  function nearest(px, py, pz){
    const i = Math.floor((px - G0[0]) / GC), j = Math.floor((py - G0[1]) / GC), k = Math.floor((pz - G0[2]) / GC);
    if (i < 0 || j < 0 || k < 0 || i >= GN[0] || j >= GN[1] || k >= GN[2]) return null;
    const c = cells.get((k * GN[1] + j) * GN[0] + i); if (!c) return null;
    let best = 1e9, bf = -1, bb = null;
    for (const f of c){
      const b = closestTri(px, py, pz, f);
      let qx = 0, qy = 0, qz = 0; for (let t = 0; t < 3; t++){ const id = FI[f * 3 + t]; qx += V[id * 3] * b[t]; qy += V[id * 3 + 1] * b[t]; qz += V[id * 3 + 2] * b[t]; }
      const d = (px - qx) * (px - qx) + (py - qy) * (py - qy) + (pz - qz) * (pz - qz);
      if (d < best){ best = d; bf = f; bb = b; }
    }
    const ids = [FI[bf * 3], FI[bf * 3 + 1], FI[bf * 3 + 2]];
    let q = [0, 0, 0], n = [0, 0, 0];
    for (let t = 0; t < 3; t++) for (let dd = 0; dd < 3; dd++){ q[dd] += V[ids[t] * 3 + dd] * bb[t]; n[dd] += N[ids[t] * 3 + dd] * bb[t]; }
    const nz = bb.map((v) => v > 1e-5);
    let rim = false;
    const cnt = nz.filter(Boolean).length;
    if (cnt === 1){ rim = !!bVert[ids[nz.indexOf(true)]]; }
    else if (cnt === 2){ const e = [0, 1, 2].filter((t) => nz[t]).map((t) => ids[t]); rim = isBEdge(e[0], e[1]); }
    const s = (px - q[0]) * n[0] + (py - q[1]) * n[1] + (pz - q[2]) * n[2];
    return { d: Math.sqrt(best), f: bf, b: bb, rim, s, q };
  }
  const TH = 0.12;
  function sdFace(x, y, z){
    const r = nearest(x, y, z); if (!r) return 0.13;
    if (r.rim || r.s >= 0) return r.d;
    return Math.max(-r.d, r.d - TH);
  }

  /* ---------- kafatası: yüzün kenarına oturacak biçimde ---------- */
  function ear(ax, y, z){
    const px = ax - 0.705, py = y + 0.13, pz = z + 0.03;
    const c = 0.96, s = 0.28; const qy = c * py - s * pz, qz = s * py + c * pz;
    let d = el(px - 0.018, qy, qz, 0.04, 0.24, 0.135);
    d = smax(d, -el(px - 0.056, qy + 0.02, qz + 0.012, 0.044, 0.15, 0.078), 0.025);
    return d;
  }
  const SK = {
    cran: [0, 0.316, -0.092, 0.732, 0.696, 0.824],
    fore: [0, 0.436, 0.302, 0.551, 0.363, 0.446],
    temp: [0, 0.185, 0.167, 0.842, 0.28, 0.28],
    nape: [0, 0.14, -0.44, 0.58, 0.56, 0.5],
    side: [0, -0.308, 0.05, 0.698, 0.763, 0.417],
    neck: [0, -0.8, -0.1, 0.42, 0.46, 0.42],
  };
  const E = (p, x, y, z) => el(x - p[0], y - p[1], z - p[2], p[3], p[4], p[5]);
  function sdSkull(x, y, z){
    const ax = Math.abs(x);
    let d = E(SK.cran, x, y, z);
    d = smin(d, E(SK.fore, x, y, z), 0.2);
    d = smin(d, E(SK.nape, x, y, z), 0.25);
    d = smin(d, E(SK.temp, x, y, z), 0.16);
    d = smin(d, E(SK.side, x, y, z), 0.2);
    d = smin(d, E(SK.neck, x, y, z), 0.22);
    d = smax(d, -el(ax - 0.76, y - 0.22, z - 0.22, 0.1, 0.17, 0.2), 0.12);   // şakak çukuru (hafif)
    return d;
  }
  function sdEyes(x, y, z){ let d = 1; for (const e of eyes) d = Math.min(d, L3(x - e.C[0], y - e.C[1], z - e.C[2]) - R_EYE); return d; }
  const KF = 0.075;
  function sdHead(x, y, z){
    let d = smin(sdSkull(x, y, z), sdFace(x, y, z), KF);
    d = smin(d, ear(Math.abs(x), y, z), 0.045);
    d = Math.min(d, sdEyes(x, y, z));
    return d;
  }

  /* ---------- iç hacim (v3'ten aynen): iki yarıküre, şakak lobları, arka alt yumru ---------- */
  function brainParts(x, y, z){
    const ax = Math.abs(x);
    const h = el(ax - 0.03, y - 0.47, z + 0.08, 0.53, 0.43, 0.72);
    const t = el(ax - 0.32, y - 0.19, z - 0.05, 0.2, 0.16, 0.34);
    const c = el(ax - 0.2, y - 0.06, z + 0.58, 0.2, 0.14, 0.19);
    return [h, t, c];
  }
  function sdBrain(x, y, z){
    const [h, t, c] = brainParts(x, y, z);
    let d = smin(h, t, 0.1); d = smin(d, c, 0.06);
    const fis = Math.max(Math.abs(x) - 0.014, -h - 0.06, 0.42 - y);
    return smax(d, -fis, 0.012);
  }
  return { el, smin, smax, nearest, sdFace, sdSkull, sdHead, sdEyes, ear, brainParts, sdBrain, SK, KF };
}
