/* ================= yüz kitaplığı =================
   MediaPipe kanonik yüz modeli (468 köşe, 898 üçgen; Apache 2.0) baş çerçevesine taşınır.
   Aynı işlev hem sayfada (yüz noktaları, gözler, kaşlar) hem üretim betiğinde (kafatası birleşimi) çalışır.
   Birim: baş çerçevesi. Göz hizası y = 0; ölçek 0,088 (1 cm = 0,088). */
function FACELIB(VC, FI){
  const S = 0.088, OY = 2.62, OZ = -4.29;
  const NV = VC.length / 3, NF = FI.length / 3;
  const L3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  /* kesim: burun ucunun altından (burun ucu y = -0,33; üst dudak y = -0,53), arkaya doğru az eğik; yanlarda yukarı kıvrılır
     (köşe kalmaz). Geometri kesimde biter; ışık kesimin CUT_FADE üstünden başlayarak yumuşakça söner. */
  const CUT_F = -0.5, CUT_B = -0.55, CUT_SIDE = 0.075, CUT_FADE = 0.2;
  const cutAt = (z, x) => CUT_B + (CUT_F - CUT_B) * sm(-0.3, 0.8, z) + CUT_SIDE * sm(0.34, 0.7, Math.abs(x || 0));
  const toHead = (src) => { const o = new Float32Array(NV * 3); for (let i = 0; i < NV; i++){ o[i * 3] = S * src[i * 3]; o[i * 3 + 1] = S * (src[i * 3 + 1] - OY); o[i * 3 + 2] = S * (src[i * 3 + 2] - OZ); } return o; };

  /* komşuluk, sınır */
  const edgeCount = new Map();
  const ek = (a, b) => a < b ? a * 1024 + b : b * 1024 + a;
  for (let f = 0; f < NF; f++) for (let k = 0; k < 3; k++){ const a = FI[f * 3 + k], b = FI[f * 3 + (k + 1) % 3]; const key = ek(a, b); edgeCount.set(key, (edgeCount.get(key) || 0) + 1); }
  const isBEdge = (a, b) => edgeCount.get(ek(a, b)) === 1;
  const bVert = new Uint8Array(NV);
  for (const [key, c] of edgeCount) if (c === 1){ bVert[(key / 1024) | 0] = 1; bVert[key % 1024] = 1; }
  const nbr = Array.from({ length: NV }, () => new Set());
  for (let f = 0; f < NF; f++) for (let k = 0; k < 3; k++){ const a = FI[f * 3 + k], b = FI[f * 3 + (k + 1) % 3]; nbr[a].add(b); nbr[b].add(a); }

  /* göz konturları (MediaPipe sırası): iç köşeden dış köşeye */
  const EYES = [
    { side: -1, up: [133, 173, 157, 158, 159, 160, 161, 246, 33], lo: [133, 155, 154, 153, 145, 144, 163, 7, 33], crease: [244, 189, 221, 222, 223, 224, 225, 113, 226] },
    { side: 1, up: [362, 398, 384, 385, 386, 387, 388, 466, 263], lo: [362, 382, 381, 380, 374, 373, 390, 249, 263], crease: [464, 413, 441, 442, 443, 444, 445, 342, 446] },
  ];
  const BROWS = [
    { side: -1, up: [107, 66, 105, 63, 70], lo: [55, 65, 52, 53, 46] },
    { side: 1, up: [336, 296, 334, 293, 300], lo: [285, 295, 282, 283, 276] },
  ];
  const eyeSet = EYES.map((e) => new Set([...e.up, ...e.lo]));
  const aperture = new Uint8Array(NF);
  for (let f = 0; f < NF; f++) for (const s of eyeSet) if (s.has(FI[f * 3]) && s.has(FI[f * 3 + 1]) && s.has(FI[f * 3 + 2])) aperture[f] = 1;

  function normals(V){
    const N = new Float32Array(NV * 3);
    for (let f = 0; f < NF; f++){
      const a = FI[f * 3], b = FI[f * 3 + 1], c = FI[f * 3 + 2];
      const ux = V[b * 3] - V[a * 3], uy = V[b * 3 + 1] - V[a * 3 + 1], uz = V[b * 3 + 2] - V[a * 3 + 2];
      const vx = V[c * 3] - V[a * 3], vy = V[c * 3 + 1] - V[a * 3 + 1], vz = V[c * 3 + 2] - V[a * 3 + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; // alan ağırlıklı
      for (const i of [a, b, c]){ N[i * 3] += nx; N[i * 3 + 1] += ny; N[i * 3 + 2] += nz; }
    }
    for (let i = 0; i < NV; i++){ const l = L3(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
    return N;
  }
  /* ortalama eğrilik (kotanjant Laplace): dışbükey sırt > 0, kıvrım < 0; birimi SDF Laplace'ıyla aynı (2H) */
  function curvature(V, N){
    const K = new Float32Array(NV * 3), A = new Float32Array(NV);
    const cot = (ax, ay, az, bx, by, bz) => { const d = ax * bx + ay * by + az * bz; const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx; return d / (L3(cx, cy, cz) || 1e-9); };
    for (let f = 0; f < NF; f++){
      const id = [FI[f * 3], FI[f * 3 + 1], FI[f * 3 + 2]];
      for (let k = 0; k < 3; k++){
        const i = id[k], j = id[(k + 1) % 3], o = id[(k + 2) % 3];
        const c = cot(V[i * 3] - V[o * 3], V[i * 3 + 1] - V[o * 3 + 1], V[i * 3 + 2] - V[o * 3 + 2], V[j * 3] - V[o * 3], V[j * 3 + 1] - V[o * 3 + 1], V[j * 3 + 2] - V[o * 3 + 2]);
        for (const [p, q] of [[i, j], [j, i]]) for (let d = 0; d < 3; d++) K[p * 3 + d] += 0.5 * c * (V[q * 3 + d] - V[p * 3 + d]);
      }
      const a = id[0], b = id[1], c2 = id[2];
      const ux = V[b * 3] - V[a * 3], uy = V[b * 3 + 1] - V[a * 3 + 1], uz = V[b * 3 + 2] - V[a * 3 + 2];
      const vx = V[c2 * 3] - V[a * 3], vy = V[c2 * 3 + 1] - V[a * 3 + 1], vz = V[c2 * 3 + 2] - V[a * 3 + 2];
      const ar = 0.5 * L3(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 3;
      A[a] += ar; A[b] += ar; A[c2] += ar;
    }
    const C = new Float32Array(NV);
    for (let i = 0; i < NV; i++){ C[i] = bVert[i] ? 0 : -(K[i * 3] * N[i * 3] + K[i * 3 + 1] * N[i * 3 + 1] + K[i * 3 + 2] * N[i * 3 + 2]) / Math.max(1e-6, A[i]); }
    // komşularla bir kez yumuşat (gürültülü üçgenlerde benek olmasın)
    const C2 = new Float32Array(NV);
    for (let i = 0; i < NV; i++){ let s = C[i] * 2, n = 2; for (const j of nbr[i]){ s += C[j]; n++; } C2[i] = s / n; }
    for (let i = 0; i < NV; i++) if (bVert[i]){ let s = 0, n = 0; for (const j of nbr[i]) if (!bVert[j]){ s += C2[j]; n++; } C2[i] = n ? s / n : 0; }
    return C2;
  }
  /* kenardan uzaklık (ağ üstünde Dijkstra): yüz noktaları kenarda kafatasına yumuşakça devreder */
  function rimDist(V){
    const D = new Float32Array(NV).fill(1e9); const done = new Uint8Array(NV);
    for (let i = 0; i < NV; i++) if (bVert[i]) D[i] = 0;
    for (let it = 0; it < NV; it++){
      let m = -1, mv = 1e9; for (let i = 0; i < NV; i++) if (!done[i] && D[i] < mv){ mv = D[i]; m = i; }
      if (m < 0) break; done[m] = 1;
      for (const j of nbr[m]){ const d = mv + L3(V[j * 3] - V[m * 3], V[j * 3 + 1] - V[m * 3 + 1], V[j * 3 + 2] - V[m * 3 + 2]); if (d < D[j]) D[j] = d; }
    }
    return D;
  }

  const V = toHead(VC);
  /* uyanık bakış: kanonik model gözleri yarı kısık tutar (açıklık 6,7 mm). Üst kapak halkaları ortada en çok 1,3 mm,
     alt kapak 0,3 mm açılır; kapaklar yine modelin kendi noktalarında kalır (yalnız ifade). */
  const LIDS = [
    { r: [173, 157, 158, 159, 160, 161, 246], dy: 0.0125, dz: 0.002 }, { r: [190, 56, 28, 27, 29, 30, 247], dy: 0.008, dz: 0.001 }, { r: [189, 221, 222, 223, 224, 225, 113], dy: 0.003, dz: 0 },
    { r: [155, 154, 153, 145, 144, 163, 7], dy: -0.003, dz: 0 },
    { r: [398, 384, 385, 386, 387, 388, 466], dy: 0.0125, dz: 0.002 }, { r: [414, 286, 258, 257, 259, 260, 467], dy: 0.008, dz: 0.001 }, { r: [413, 441, 442, 443, 444, 445, 342], dy: 0.003, dz: 0 },
    { r: [382, 381, 380, 374, 373, 390, 249], dy: -0.003, dz: 0 },
  ];
  for (const L of LIDS) L.r.forEach((i, k) => { const t = (k + 1) / (L.r.length + 1); const w = Math.pow(Math.sin(Math.PI * t), 0.8); V[i * 3 + 1] += L.dy * w; V[i * 3 + 2] += L.dz * w; });
  const N = normals(V);
  const CURV = curvature(V, N);
  const RIM = rimDist(V);
  const P = (Vs, i) => [Vs[i * 3], Vs[i * 3 + 1], Vs[i * 3 + 2]];

  /* ---------- "kendi yüzün" örneği: kanonik yüzden yumuşak, kişisel görünen ama kimseye ait olmayan bir biçim farkı.
     Uygulamada bunun yerine kişinin izinle ölçülen 468 noktası (aynı topoloji) gelir. ---------- */
  function ownFrom(Vh){
    const O = new Float32Array(Vh);
    const g = (d2, r) => Math.exp(-d2 / (r * r));
    for (let i = 0; i < NV; i++){
      const x = VC[i * 3], y = VC[i * 3 + 1], z = VC[i * 3 + 2];   // cm, kanonik
      const ax = Math.abs(x), sx = Math.sign(x) || 1;
      const rimW = 0.35 + 0.65 * sm(0.02, 0.16, RIM[i]);              // kenar daha az kayar; yüze bağlı kafatası noktaları da aynı kaymayı alır
      const eyeD = Math.min(L3(x + 3.15, (y - 2.62) * 1.5, 0), L3(x - 3.15, (y - 2.62) * 1.5, 0));
      const eyeW = sm(1.55, 2.6, eyeD);                              // göz çevresi sabit: kapaklar gerçek noktalarda kalır
      let dx = 0, dy = 0, dz = 0;
      // daha geniş ve yüksek elmacık
      const ck = g((ax - 5.3) ** 2 + (y - 0.75) ** 2 * 1.2 + (z - 2.6) ** 2 * 0.6, 1.85);
      dx += sx * 1.2 * ck; dy += 0.22 * ck; dz += 0.4 * ck;
      // burun sırtı: daha yüksek, hafif kemerli
      const nb = g(x * x, 0.95) * g((y - 1.55) ** 2, 1.05);
      dz += 0.95 * nb;
      // burun ucu: biraz daha aşağı ve ince
      const nt = g(x * x * 0.8 + (y + 0.6) ** 2, 0.95);
      dy -= 0.22 * nt; dz += 0.08 * nt; dx -= 0.14 * x * nt;
      // alın: kaş kemeri bir tık önde, üst alın daha geriye yatık
      const br = g((y - 4.75) ** 2, 0.6) * g((ax - 2.4) ** 2, 2.0);
      dz += 0.45 * br;
      const fh = sm(5.0, 7.6, y) * g(x * x, 4.5);
      dz -= 1.05 * fh; dy += 0.14 * fh;
      // yanak altı: hafif daha dolgun
      const lc = g((ax - 4.2) ** 2 + (y + 1.6) ** 2, 1.6); dx += sx * 0.4 * lc; dz += 0.16 * lc;
      const w = rimW * eyeW;
      // göz arası 0,25 cm daha geniş: göz çevresi bütünüyle (kapaklar dahil) yana kayar
      const es = 0.125 * g(eyeD * eyeD, 2.4) * sm(0.2, 1.2, ax);
      O[i * 3] += S * (dx * w + sx * es * rimW); O[i * 3 + 1] += S * dy * w; O[i * 3 + 2] += S * dz * w;
    }
    return O;
  }
  const VO = ownFrom(V);
  const NO = normals(VO);

  /* ---------- PN üçgen: düz üçgenleri yumuşak yüzeye çevirir (köşeler aynen kalır) ---------- */
  function pn(Vs, Ns, f, u, v){
    const w = 1 - u - v;
    const i = FI[f * 3], j = FI[f * 3 + 1], k = FI[f * 3 + 2];
    const out = [0, 0, 0];
    const p1 = P(Vs, i), p2 = P(Vs, j), p3 = P(Vs, k), n1 = P(Ns, i), n2 = P(Ns, j), n3 = P(Ns, k);
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const w12 = dot(sub(p2, p1), n1), w21 = dot(sub(p1, p2), n2), w23 = dot(sub(p3, p2), n2), w32 = dot(sub(p2, p3), n3), w31 = dot(sub(p1, p3), n3), w13 = dot(sub(p3, p1), n1);
    for (let d = 0; d < 3; d++){
      const b210 = (2 * p1[d] + p2[d] - w12 * n1[d]) / 3, b120 = (2 * p2[d] + p1[d] - w21 * n2[d]) / 3;
      const b021 = (2 * p2[d] + p3[d] - w23 * n2[d]) / 3, b012 = (2 * p3[d] + p2[d] - w32 * n3[d]) / 3;
      const b102 = (2 * p3[d] + p1[d] - w31 * n3[d]) / 3, b201 = (2 * p1[d] + p3[d] - w13 * n1[d]) / 3;
      const E = (b210 + b120 + b021 + b012 + b102 + b201) / 6, Vc = (p1[d] + p2[d] + p3[d]) / 3;
      const b111 = E + (E - Vc) / 2;
      out[d] = p1[d] * u * u * u + p2[d] * v * v * v + p3[d] * w * w * w + 3 * b210 * u * u * v + 3 * b120 * u * v * v + 3 * b201 * u * u * w
        + 3 * b021 * v * v * w + 3 * b102 * u * w * w + 3 * b012 * v * w * w + 6 * b111 * u * v * w;
    }
    return out;
  }
  /* aynı PN yüzeyi, üçgen başına bir kez hesaplanan 10 denetim noktasıyla (çok nokta örneklerken hızlı) */
  function pnCoef(Vs, Ns){
    const C = new Float32Array(NF * 30);
    for (let f = 0; f < NF; f++){
      const i = FI[f * 3], j = FI[f * 3 + 1], k = FI[f * 3 + 2];
      const p1 = P(Vs, i), p2 = P(Vs, j), p3 = P(Vs, k), n1 = P(Ns, i), n2 = P(Ns, j), n3 = P(Ns, k);
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const w12 = dot(sub(p2, p1), n1), w21 = dot(sub(p1, p2), n2), w23 = dot(sub(p3, p2), n2), w32 = dot(sub(p2, p3), n3), w31 = dot(sub(p1, p3), n3), w13 = dot(sub(p3, p1), n1);
      for (let d = 0; d < 3; d++){
        const b210 = (2 * p1[d] + p2[d] - w12 * n1[d]) / 3, b120 = (2 * p2[d] + p1[d] - w21 * n2[d]) / 3;
        const b021 = (2 * p2[d] + p3[d] - w23 * n2[d]) / 3, b012 = (2 * p3[d] + p2[d] - w32 * n3[d]) / 3;
        const b102 = (2 * p3[d] + p1[d] - w31 * n3[d]) / 3, b201 = (2 * p1[d] + p3[d] - w13 * n1[d]) / 3;
        const E = (b210 + b120 + b021 + b012 + b102 + b201) / 6, Vc = (p1[d] + p2[d] + p3[d]) / 3;
        const o = f * 30 + d * 10;
        C[o] = p1[d]; C[o + 1] = p2[d]; C[o + 2] = p3[d]; C[o + 3] = b210; C[o + 4] = b120; C[o + 5] = b201; C[o + 6] = b021; C[o + 7] = b102; C[o + 8] = b012; C[o + 9] = E + (E - Vc) / 2;
      }
    }
    return C;
  }
  function pnFast(C, f, u, v, out, oo){
    const w = 1 - u - v, uu = u * u, vv = v * v, ww = w * w;
    const k0 = uu * u, k1 = vv * v, k2 = ww * w, k3 = 3 * uu * v, k4 = 3 * u * vv, k5 = 3 * uu * w, k6 = 3 * vv * w, k7 = 3 * u * ww, k8 = 3 * v * ww, k9 = 6 * u * v * w;
    for (let d = 0; d < 3; d++){ const o = f * 30 + d * 10; out[oo + d] = C[o] * k0 + C[o + 1] * k1 + C[o + 2] * k2 + C[o + 3] * k3 + C[o + 4] * k4 + C[o + 5] * k5 + C[o + 6] * k6 + C[o + 7] * k7 + C[o + 8] * k8 + C[o + 9] * k9; }
  }
  function nrmAt(Ns, f, u, v){
    const w = 1 - u - v, i = FI[f * 3], j = FI[f * 3 + 1], k = FI[f * 3 + 2];
    const n = [0, 1, 2].map((d) => Ns[i * 3 + d] * u + Ns[j * 3 + d] * v + Ns[k * 3 + d] * w); const l = L3(...n) || 1; return n.map((q) => q / l);
  }
  const attrAt = (A, f, u, v) => A[FI[f * 3]] * u + A[FI[f * 3 + 1]] * v + A[FI[f * 3 + 2]] * (1 - u - v);

  /* önden izdüşümle üçgen bul (kaş gibi yüzeye oturan çizgiler için) */
  function hitFront(x, y){
    let best = -1, bz = -1e9, bu = 0, bv = 0;
    for (let f = 0; f < NF; f++){
      const i = FI[f * 3], j = FI[f * 3 + 1], k = FI[f * 3 + 2];
      const x1 = V[i * 3], y1 = V[i * 3 + 1], x2 = V[j * 3], y2 = V[j * 3 + 1], x3 = V[k * 3], y3 = V[k * 3 + 1];
      const den = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3); if (Math.abs(den) < 1e-12) continue;
      const u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / den, v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / den;
      if (u < -1e-6 || v < -1e-6 || u + v > 1 + 1e-6) continue;
      const z = V[i * 3 + 2] * u + V[j * 3 + 2] * v + V[k * 3 + 2] * (1 - u - v);
      if (z > bz){ bz = z; best = f; bu = u; bv = v; }
    }
    return best < 0 ? null : { f: best, u: bu, v: bv };
  }

  /* ---------- gözler: kapak konturu gerçek noktalardan; göz küresi açıklığın arkasında ---------- */
  const R_EYE = 1.2 * S, R_IRIS = 0.56 * S;
  const eyes = EYES.map((e) => {
    const all = [...e.up, ...e.lo.slice(1, -1)];
    const A = [0, 0, 0], f = [0, 0, 0];
    for (const i of all) for (let d = 0; d < 3; d++){ A[d] += V[i * 3 + d] / all.length; f[d] += N[i * 3 + d]; }
    // ileri yön: konturun ortalama normali (yüz düzleminden hafif dışa bakar)
    let fl = L3(...f); for (let d = 0; d < 3; d++) f[d] /= fl;
    const inner = P(V, e.up[0]), outer = P(V, e.up[e.up.length - 1]);
    let ex = [outer[0] - inner[0], outer[1] - inner[1], outer[2] - inner[2]];
    const fd = ex[0] * f[0] + ex[1] * f[1] + ex[2] * f[2]; ex = ex.map((q, d) => q - f[d] * fd); const exl = L3(...ex); ex = ex.map((q) => q / exl * e.side); // dünya +x yönü
    const ey = [f[1] * ex[2] - f[2] * ex[1], f[2] * ex[0] - f[0] * ex[2], f[0] * ex[1] - f[1] * ex[0]];
    const toL = (p) => { const d = [p[0] - A[0], p[1] - A[1], p[2] - A[2]]; return [d[0] * ex[0] + d[1] * ex[1] + d[2] * ex[2], d[0] * ey[0] + d[1] * ey[1] + d[2] * ey[2], d[0] * f[0] + d[1] * f[1] + d[2] * f[2]]; };
    // kapak eğrisi: Catmull-Rom ile yumuşatılmış kontur, lx'e göre örneklenmiş tablo
    const curve = (ids) => {
      const pts = ids.map((i) => P(V, i)); const out = [];
      for (let s = 0; s < pts.length - 1; s++){
        const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(pts.length - 1, s + 2)];
        for (let q = 0; q < 8; q++){ const t = q / 8, t2 = t * t, t3 = t2 * t;
          out.push([0, 1, 2].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
      }
      out.push(pts[pts.length - 1]); return out;
    };
    const cu = curve(e.up), cl = curve(e.lo), cc = curve(e.crease);
    const lu = cu.map(toL), ll = cl.map(toL);
    const xs = lu.map((q) => q[0]); const X0 = Math.min(...xs), X1 = Math.max(...xs);
    const NT = 48;
    const tab = (L, C) => { const T = new Float32Array(NT + 1), P3 = []; const srt = L.map((q, i) => [q[0], q[1], C[i]]).sort((a, b) => a[0] - b[0]);
      for (let k = 0; k <= NT; k++){ const x = X0 + (X1 - X0) * k / NT; let a = 0; while (a < srt.length - 2 && srt[a + 1][0] < x) a++; const b = a + 1; const t = Math.max(0, Math.min(1, (x - srt[a][0]) / ((srt[b][0] - srt[a][0]) || 1e-9))); T[k] = srt[a][1] + (srt[b][1] - srt[a][1]) * t; P3.push([0, 1, 2].map((d) => srt[a][2][d] + (srt[b][2][d] - srt[a][2][d]) * t)); }
      return { T, P3 }; };
    const U = tab(lu, cu), Lo = tab(ll, cl);
    const look = (T, lx) => { const q = Math.max(0, Math.min(NT, (lx - X0) / (X1 - X0) * NT)); const a = Math.min(NT - 1, Math.floor(q)); const t = q - a; return T[a] + (T[a + 1] - T[a]) * t; };
    const lookP = (P3, lx) => { const q = Math.max(0, Math.min(NT, (lx - X0) / (X1 - X0) * NT)); const a = Math.min(NT - 1, Math.floor(q)); const t = q - a; return [0, 1, 2].map((d) => P3[a][d] + (P3[a + 1][d] - P3[a][d]) * t); };
    // göz küresi: ön yüzü açıklık merkezinin biraz arkasında
    // küre ekseni neredeyse düz ileri (açıklık düzlemi dışa ve aşağı bakar; göz küresi bakmaz)
    let fb = [0.25 * f[0] + 0.75 * e.side * 0.07, 0.25 * f[1] - 0.75 * 0.02, 0.25 * f[2] + 0.75]; const fbl = L3(...fb); fb = fb.map((q) => q / fbl);
    const C = [0, 1, 2].map((d) => A[d] - fb[d] * (R_EYE + 0.003));
    return { side: e.side, A, C, f, ex, ey, X0, X1, toL, lidU: (lx) => look(U.T, lx), lidL: (lx) => look(Lo.T, lx), upP: (lx) => lookP(U.P3, lx), loP: (lx) => lookP(Lo.P3, lx), crease: cc };
  });

  return { S, OY, OZ, NV, NF, FI, V, N, VO, NO, CURV, RIM, bVert, isBEdge, aperture, cutAt, CUT_F, CUT_B, CUT_SIDE, CUT_FADE, pn, pnCoef, pnFast, nrmAt, attrAt, hitFront, eyes, R_EYE, R_IRIS, BROWS, EYES, sm, L3 };
}
