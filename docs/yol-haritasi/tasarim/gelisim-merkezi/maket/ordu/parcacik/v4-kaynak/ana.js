(function(){
'use strict';
const KEY = { d30: '30', walk: 'walk', d1: '1' };
const qs = new URLSearchParams(location.search);
const DBG = qs.get('dbg') || '';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const YAW = parseFloat(qs.get('yaw')) || BAKED_OPT.yaw;
let stKey = 'd30', sel = null, own = false;

/* ---------- gömülü verileri çöz ---------- */
function b64(s){ const bin = atob(s), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; }
function unbake(){
  const H = BAKED_HDR, buf = b64(BAKED_BIN).buffer, out = {};
  for (const grp in H.sec){
    out[grp] = {};
    for (const nm in H.sec[grp]){
      const s = H.sec[grp][nm]; let a;
      if (s.t === 'i16'){ const v = new Int16Array(buf, s.o, s.n); a = new Float32Array(s.n); for (let i = 0; i < s.n; i++) a[i] = v[i] * s.k; }
      else if (s.t === 'i8'){ const v = new Int8Array(buf, s.o, s.n); a = new Float32Array(s.n); for (let i = 0; i < s.n; i++) a[i] = v[i] / 127; }
      else if (s.t === 'u8'){ const v = new Uint8Array(buf, s.o, s.n); a = new Float32Array(s.n); for (let i = 0; i < s.n; i++) a[i] = v[i] * s.k; }
      else if (s.t === 'idx'){ a = new Uint16Array(buf.slice(s.o, s.o + s.n * 2)); }
      out[grp][nm] = a;
    }
  }
  out.anchors = H.anchors; out.norm = H.norm; out.info = H.info;
  return out;
}
/* yüz ağı: 468 köşe (Int16) + üçgen dizini (fark, zikzak, değişken uzunluk) */
function unmesh(){
  const M = FACE_MESH, u8 = b64(FACE_BIN);
  const vq = new Int16Array(u8.buffer, 0, M.nv * 3), VC = new Float32Array(M.nv * 3);
  for (let i = 0; i < VC.length; i++) VC[i] = vq[i] * M.k;
  const FI = new Uint16Array(M.nf * 3); let p = M.vBytes, prev = 0;
  for (let i = 0; i < FI.length; i++){ let z = 0, sh = 0, b; do { b = u8[p++]; z |= (b & 127) << sh; sh += 7; } while (b & 128); const d = z & 1 ? -((z + 1) >> 1) : z >> 1; prev += d; FI[i] = prev; }
  return { VC, FI };
}

/* ================= arayüz ================= */
const $ = (id) => document.getElementById(id);
const chipsEl = $('chips'), labelsEl = $('labels'), txtEl = $('txt'), svg = $('leaders');
const SVGNS = 'http://www.w3.org/2000/svg';
const LB = [], LN = [], LD = [];
AREAS.forEach((k) => {
  const b = document.createElement('button');
  b.className = 'chip' + (k === 'hareket' ? ' wide' : '');
  b.dataset.k = k; b.style.setProperty('--c', `var(--r-${k})`);
  b.innerHTML = `<span class="nm"><i class="dt"></i>${NAME[k]}</span><span class="v"></span><span class="w"></span>`;
  b.addEventListener('click', () => select(sel === k ? null : k));
  chipsEl.appendChild(b);
  const l = document.createElement('span');
  l.className = 'lb'; l.dataset.k = k; l.style.setProperty('--c', `var(--l-${k})`); l.textContent = NAME[k];
  labelsEl.appendChild(l); LB.push(l);
  const ln = document.createElementNS(SVGNS, 'line'); ln.setAttribute('stroke', `var(--l-${k})`); svg.appendChild(ln); LN.push(ln);
  const dt = document.createElementNS(SVGNS, 'circle'); dt.setAttribute('r', '2.2'); dt.setAttribute('fill', `var(--l-${k})`); svg.appendChild(dt); LD.push(dt);
});
function writeHash(){
  const h = '#' + stKey + (own ? '&yuz=kendi' : '') + (sel ? '&sec=' + sel : '');
  if (location.hash !== h) history.replaceState(null, '', h);
}
document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => { setState(b.dataset.s); writeHash(); }));
document.querySelectorAll('.fseg button').forEach((b) => b.addEventListener('click', () => { setOwn(b.dataset.f === 'kendi'); writeHash(); }));
window.addEventListener('hashchange', () => { setState(readHash()); setOwn(readOwn(), true); select(readSel(), true); if (GL) GL.onState(); });
function readHash(){ const h = (location.hash || '').replace('#', '').split('&')[0]; return KEY[h] ? h : 'd30'; }
function readSel(){ const m = /[#&]sec=([a-z]+)/.exec(location.hash || ''); return m && AREAS.includes(m[1]) ? m[1] : null; }
function readOwn(){ return /[#&]yuz=kendi/.test(location.hash || '') || qs.get('yuz') === 'kendi'; }

function stageLabel(){
  const D = DAYS[KEY[stKey]];
  const lit = AREAS.filter((k2) => D.a[k2].st === 'up').map((k2) => NAME[k2]);
  const live = AREAS.filter((k2) => D.a[k2].st === 'live').map((k2) => NAME[k2]);
  $('stage').setAttribute('aria-label', 'Işıktan bir baş' + (own ? ', kendi yüzün (örnek)' : '') + '. ' + (lit.length ? 'Yanan alanlar: ' + lit.join(', ') + '.' : 'Bütün alanlar sakin; başlangıç ölçüldü.') +
    (live.length ? ' Şu an akan: ' + live.join(', ') + '.' : '') + ` Gözler 20 saniyede ${D.blinks} kez kırpıyor.`);
}
function setState(k){
  stKey = k; const D = DAYS[KEY[k]];
  document.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.s === k));
  const day = $('day'); day.querySelector('span').textContent = D.label; day.classList.toggle('live', k === 'walk');
  /* Nef cümlesi ve beş ayrıntı aynı hücrede üst üste durur: seçimde yerleri değişir, düzen kaymaz */
  txtEl.innerHTML = `<p class="nef" data-k="">${D.nef}</p>` + AREAS.map((a) => `<p class="det" data-k="${a}" style="--c:var(--r-${a})"><i></i>${D.a[a].d}</p>`).join('');
  chipsEl.querySelectorAll('.chip').forEach((c) => {
    const a = D.a[c.dataset.k];
    c.className = 'chip ' + a.st + (c.dataset.k === 'hareket' ? ' wide' : '');
    c.querySelector('.v').textContent = a.v; c.querySelector('.w').textContent = WORD[a.st];
    c.setAttribute('aria-label', `${NAME[c.dataset.k]}: ${a.v}, ${WORD[a.st]}`);
  });
  stageLabel();
  select(sel, true);
  if (GL) GL.onState();
}
function setOwn(v, silent){
  own = !!v;
  document.querySelectorAll('.fseg button').forEach((b) => b.setAttribute('aria-pressed', (b.dataset.f === 'kendi') === own));
  $('facebar').classList.toggle('own', own);
  stageLabel();
  if (GL) GL.onFace(silent);
}
function fitTxt(){ const p = txtEl.querySelector('p.on'); if (p) txtEl.style.height = p.offsetHeight + 'px'; }
new ResizeObserver(fitTxt).observe(txtEl.parentNode);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTxt);
function select(k, silent){
  sel = k;
  chipsEl.classList.toggle('focus', !!k);
  chipsEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.k === k));
  txtEl.querySelectorAll('p').forEach((p) => p.classList.toggle('on', p.dataset.k === (k || '')));
  fitTxt();
  if (k && !silent){ const r = txtEl.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) txtEl.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
  if (GL && !silent) GL.onState();
}

/* ================= GL ================= */
let GL = null;
function initGL(){
  if (!window.THREE) throw new Error('three yok');
  const T = THREE;
  const tInit = performance.now();
  const DATA = unbake();
  const MESH = unmesh();
  const FL = FACELIB(MESH.VC, MESH.FI);
  const { V, N, VO, NO, CURV, RIM, FI, NF, cutAt, CUT_F, CUT_B, eyes, R_EYE, R_IRIS, sm, L3, pn, nrmAt, attrAt, hitFront, aperture } = FL;
  const cv = $('cv'), stage = $('stage');
  const renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(1.75, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(16, 1, 1, 30);
  const head = new T.Group(); scene.add(head);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); const v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); };
  const seeds = (n) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = rnd(); return a; };
  const CAMD = 8, CAMY = 0.36;
  const camLocal = [-Math.sin(YAW) * CAMD, CAMY, Math.cos(YAW) * CAMD];
  const camDir = (() => { const d = [-Math.sin(YAW), 0.05, Math.cos(YAW)]; const l = L3(...d); return d.map((v) => v / l); })();

  /* ---------- yüz: kanonik ağın yüzeyi, alan ağırlıklı ışık tozu; kıvrım ve kenarlarda daha yoğun ---------- */
  const Fc = { pos: [], pos2: [], nor: [], nor2: [], cur: [], cov: [], line: [] };
  const pushF = (P, P2, n, n2, cur, cov, line) => { Fc.pos.push(P[0], P[1], P[2]); Fc.pos2.push(P2[0], P2[1], P2[2]); Fc.nor.push(n[0], n[1], n[2]); Fc.nor2.push(n2[0], n2[1], n2[2]); Fc.cur.push(cur); Fc.cov.push(cov); Fc.line.push(line); };
  const tF0 = performance.now();
  const KEYL = (() => { const k = [-0.3, 0.5, 0.82], c = Math.cos(YAW), si = Math.sin(YAW); const v = [k[0] * c - k[2] * si, k[1], k[0] * si + k[2] * c]; const l = L3(...v); return v.map((q) => q / l); })();
  (function faceDust(target){
    const W = new Float64Array(NF), AM = new Float32Array(NF); let tot = 0;
    const acc = (nx, ny, nz, cur) => (0.38 + 0.62 * sm(5, 24, Math.abs(cur))) * (0.3 + 0.7 * Math.pow(Math.max(0, nx * KEYL[0] + ny * KEYL[1] + nz * KEYL[2]), 1.1));
    for (let f = 0; f < NF; f++){
      W[f] = tot;
      if (aperture[f]) continue;
      const a = FI[f * 3], b = FI[f * 3 + 1], c = FI[f * 3 + 2];
      if (Math.max(V[a * 3 + 1] - cutAt(V[a * 3 + 2]), V[b * 3 + 1] - cutAt(V[b * 3 + 2]), V[c * 3 + 1] - cutAt(V[c * 3 + 2])) < -0.01) continue;
      const ux = V[b * 3] - V[a * 3], uy = V[b * 3 + 1] - V[a * 3 + 1], uz = V[b * 3 + 2] - V[a * 3 + 2];
      const vx = V[c * 3] - V[a * 3], vy = V[c * 3 + 1] - V[a * 3 + 1], vz = V[c * 3 + 2] - V[a * 3 + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const ar = 0.5 * L3(nx, ny, nz);
      const facing = (nx * camDir[0] + ny * camDir[1] + nz * camDir[2]) / (2 * ar || 1);
      const sil = 1 - Math.min(1, Math.abs(facing));
      // nokta başına kabul (kıvrım × ışık) üçgenin köşelerindeki en büyük değerle ağırlığa katılır: döngü az boşa döner
      let am = 0; for (const q of [a, b, c]) am = Math.max(am, acc(N[q * 3], N[q * 3 + 1], N[q * 3 + 2], CURV[q]));
      AM[f] = Math.min(1, am * 1.15);
      tot += ar * (facing < -0.2 ? 0.3 : 1) * (0.6 + 1.4 * sil * sil) * AM[f];
    }
    const W1 = new Float64Array(NF + 1); W1.set(W); W1[NF] = tot;
    // mavi gürültü: noktalar birbirine RMIN'den yakın düşmez (kümelenme yok, yüzey "kar" gibi değil, ince toz gibi okunur)
    const RMIN = 0.0047, R2 = RMIN * RMIN, CS = RMIN, hash = new Map();
    const hk = (i, j, k) => ((i + 256) * 512 + (j + 256)) * 512 + (k + 256);   // küçük tamsayı anahtar (hızlı)
    const near = (P) => { const cx = Math.floor(P[0] / CS), cy = Math.floor(P[1] / CS), cz = Math.floor(P[2] / CS);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++){ const L = hash.get(hk(cx + a, cy + b, cz + c)); if (!L) continue;
        for (let q = 0; q < L.length; q += 3){ const dx = L[q] - P[0], dy = L[q + 1] - P[1], dz = L[q + 2] - P[2]; if (dx * dx + dy * dy + dz * dz < R2) return true; } }
      return false; };
    let n = 0, guard = 0;
    const CF = FL.pnCoef(V, N), CO = FL.pnCoef(VO, NO), P = [0, 0, 0], Q = [0, 0, 0];
    const lin = (A, f, u, v, d) => A[FI[f * 3] * 3 + d] * u + A[FI[f * 3 + 1] * 3 + d] * v + A[FI[f * 3 + 2] * 3 + d] * (1 - u - v);
    while (n < target && guard++ < target * 14){
      const r = rnd() * tot; let lo = 0, hi = NF;
      while (hi - lo > 1){ const m = (lo + hi) >> 1; if (W1[m] <= r) lo = m; else hi = m; }
      const f = lo; if (aperture[f]) continue;
      const s1 = Math.sqrt(rnd()), r2 = rnd(); const u = 1 - s1, v = s1 * (1 - r2);
      // kıvrım ve kenar: sırtlar (burun, kaş kemeri, elmacık) ve oluklar (göz çevresi, burun kanadı) daha yoğun;
      // ışık alan düzlemler de (alın, burun sırtı, elmacık) daha sık: nokta yoğunluğu biçimi kendisi gölgeler
      const cur = attrAt(CURV, f, u, v);
      let nx = lin(N, f, u, v, 0), ny = lin(N, f, u, v, 1), nz = lin(N, f, u, v, 2); const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      if (rnd() * AM[f] > acc(nx, ny, nz, cur)) continue;
      FL.pnFast(CF, f, u, v, P, 0);
      if (P[1] < cutAt(P[2]) - 0.004) continue;
      if (near(P)) continue;
      { const k = hk(Math.floor(P[0] / CS), Math.floor(P[1] / CS), Math.floor(P[2] / CS)); let L = hash.get(k); if (!L){ L = []; hash.set(k, L); } L.push(P[0], P[1], P[2]); }
      FL.pnFast(CO, f, u, v, Q, 0);
      const rim = attrAt(RIM, f, u, v);
      pushF(P, Q, [nx, ny, nz], nrmAt(NO, f, u, v), cur, 1 - sm(0.02, 0.1, rim), 0);
      n++;
    }
  })(24000);
  const nFaceDust = Fc.cur.length; const tF1 = performance.now();
  /* kaşlar: kaş noktalarına oturan kısa kıl vuruşları (çizgi 3); iç uçta yukarı, dışa doğru yatık */
  (function brows(){
    const P2d = (i) => [V[i * 3], V[i * 3 + 1]];
    const cr = (pts, t) => { const n = pts.length - 1; const q = Math.max(0, Math.min(n - 1e-6, t * n)); const s = Math.floor(q), u = q - s;
      const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(n, s + 2)];
      return [0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u * u + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u * u * u)); };
    for (const B of FL.BROWS){
      const up = B.up.map(P2d), lo = B.lo.map(P2d);
      for (let k = 0; k < 230; k++){
        const t = Math.pow(rnd(), 1.1);
        const a = cr(lo, t), b = cr(up, t);
        const thick = 1 - 0.55 * t;
        const along = 0.12 + 0.62 * rnd() * thick;
        const bx = a[0] + (b[0] - a[0]) * along, by = a[1] + (b[1] - a[1]) * along;
        // yön: iç uçta dik (yukarı, hafif dışa), dışta kaş boyunca
        const tg = [cr(up, Math.min(1, t + 0.02))[0] - cr(up, Math.max(0, t - 0.02))[0], cr(up, Math.min(1, t + 0.02))[1] - cr(up, Math.max(0, t - 0.02))[1]];
        const tl = Math.hypot(tg[0], tg[1]) || 1; tg[0] /= tl; tg[1] /= tl;
        const upw = 1 - sm(0.0, 0.45, t);
        let dx = tg[0] * (1 - upw) + B.side * 0.25 * upw, dy = tg[1] * (1 - upw) + 1.0 * upw; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
        const len = (0.016 + 0.012 * rnd()) * (0.75 + 0.25 * thick);
        const segs = 5;
        for (let q = 0; q <= segs; q++){
          const s = q / segs; const x = bx + dx * len * s + gauss() * 0.0007, y = by + dy * len * s + gauss() * 0.0007;
          const hit = hitFront(x, y); if (!hit) continue;
          const P = pn(V, N, hit.f, hit.u, hit.v), n1 = nrmAt(N, hit.f, hit.u, hit.v);
          const Q = pn(VO, NO, hit.f, hit.u, hit.v), n2 = nrmAt(NO, hit.f, hit.u, hit.v);
          const lift = 0.004;
          pushF([P[0] + n1[0] * lift, P[1] + n1[1] * lift, P[2] + n1[2] * lift], [Q[0] + n2[0] * lift, Q[1] + n2[1] * lift, Q[2] + n2[2] * lift], n1, n2,
            (0.55 + 0.45 * thick) * Math.pow(Math.sin(Math.PI * (0.15 + 0.7 * s)), 0.6), 0, 3);
        }
      }
    }
  })();

  const tF2 = performance.now();
  /* ---------- gözler: göz küresi, iris ve kapaklar modelin göz çevresi noktalarına oturur ---------- */
  const E = { pos: [], pos2: [], lid: [], col: [], kind: [], size: [], nor: [], cen: [] };
  // kind: 0 iris, 1 üst kapak, 2 alt kapak, 3 sklera, 5 ışık yansıması, 6 kapak kıvrımı
  function addEye(e){
    const C = e.C;
    let g = [camLocal[0] - C[0], camLocal[1] - C[1] - 0.25, camLocal[2] - C[2]]; const gl = L3(...g); g = g.map((v) => v / gl);
    let u = [g[2], 0, -g[0]]; const ul = L3(...u); u = u.map((v) => v / ul);
    const v = [g[1] * u[2] - g[2] * u[1], g[2] * u[0] - g[0] * u[2], g[0] * u[1] - g[1] * u[0]];
    const rr = R_EYE + 0.002;
    const onBall = (ang, phi, rad) => { const s = Math.sin(ang), c = Math.cos(ang); const d = [0, 1, 2].map((i) => g[i] * c + (u[i] * Math.cos(phi) + v[i] * Math.sin(phi)) * s); return [0, 1, 2].map((i) => C[i] + d[i] * (rad || rr)); };
    const IR = Math.asin(R_IRIS / R_EYE);
    const push = (P, kind, col, size, P2) => { const L = e.toL(P); E.pos.push(...P); E.pos2.push(...(P2 || P)); E.lid.push(L[1], e.lidU(L[0]), e.lidL(L[0])); E.col.push(...col); E.kind.push(kind); E.size.push(size); const n = [P[0] - C[0], P[1] - C[1], P[2] - C[2]]; const nl = L3(...n); E.nor.push(n[0] / nl, n[1] / nl, n[2] / nl); E.cen.push(...C); };
    // iris: bebek kenarı ve iris kenarı halkaları, arası ince ışınsal lifler; bebek koyu ve dolu kalır
    for (const [rf, n, b] of [[0.42, 64, 0.8], [0.97, 140, 0.9]]) for (let i = 0; i < n; i++){ const phi = (i / n) * 6.2832 + rnd() * 0.04; const rf2 = rf + gauss() * 0.008; push(onBall(IR * rf2, phi), 0, [rf2, b, 0], 0.95, null); }
    for (let i = 0; i < 420; i++){ const phi = Math.floor(rnd() * 44) / 44 * 6.2832 + gauss() * 0.02; const rf2 = 0.47 + rnd() * 0.46; push(onBall(IR * rf2, phi), 0, [rf2, 0.4, 0], 0.8, null); }
    push(onBall(IR * 0.32, 2.3, rr + 0.002), 5, [1, 1, 0], 2.0, null);
    // bebek dolgusu: yalnız açık temada (ters çevrilen sahnede parlak nokta koyu görünür; bebek beyaz kalmasın)
    for (let i = 0; i < 150; i++){ const rf2 = Math.sqrt(rnd()) * 0.41; push(onBall(IR * rf2, rnd() * 6.2832), 7, [0, 1, 0], 1.6, null); }
    for (let i = 0; i < 170; i++){ const ang = IR * (1.1 + rnd() * 1.7); const phi = rnd() * 6.2832; push(onBall(ang, phi), 3, [0, 0.3, 0], 0.85, null); }
    const f = e.f, ey = e.ey, X0 = e.X0, X1 = e.X1;
    const add = (P, d, k) => [P[0] + d[0] * k, P[1] + d[1] * k, P[2] + d[2] * k];
    for (let i = 0; i < 230; i++){
      const t = rnd(), lx = X0 + (X1 - X0) * t; const jt = gauss() * 0.0012;
      const edge = 1 - Math.pow(Math.abs(2 * t - 1), 4);
      const up = add(add(e.upP(lx), f, 0.004), ey, jt), lo = add(add(e.loP(lx), f, 0.008 + 0.006 * edge), ey, jt + 0.003);
      push(up, 1, [0, 0.15 + 0.6 * edge, 0], 0.9, lo);
      if (i % 3 === 0) push(add(add(e.loP(lx), f, 0.003), ey, jt - 0.001), 2, [0, 0.5, 0], 0.85, null);
    }
    // üst kapak kıvrımı: modelin kapak üstü halkası boyunca ikinci, daha soluk yay
    const cc = e.crease;
    for (let i = 0; i < 120; i++){
      const t = 0.08 + rnd() * 0.84; const q = t * (cc.length - 1), a = Math.floor(q), w = q - a;
      const P = [0, 1, 2].map((d) => cc[a][d] + (cc[a + 1][d] - cc[a][d]) * w);
      const edge = Math.pow(Math.max(0, 1 - Math.pow(2 * t - 1, 2)), 0.8);
      const P1 = add(add(P, f, 0.004), ey, -0.012 + gauss() * 0.0012);
      push(P1, 6, [0, edge, 0], 0.85, add(P1, ey, -0.006));
    }
  }
  eyes.forEach(addEye);

  /* ---------- akışlar: yürüyüş (hareket şeridi boyunca dalga) ve görme yolu (gözlerden arkaya) ---------- */
  const Fl = { pos: [], s: [], side: [], seed: [], mode: [] };
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1, 2].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
  const zcs = (y) => -0.1 + 0.22 * Math.max(0, Math.min(1, (0.9 - y) / 0.62));
  const elp = (x, y, z, a, b, c) => { const k0 = L3(x / a, y / b, z / c), k1 = L3(x / (a * a), y / (b * b), z / (c * c)); return k1 < 1e-9 ? -Math.min(a, b, c) : k0 * (k0 - 1) / k1; };
  const sdBrainTop = (x, y, z) => elp(Math.abs(x) - 0.03, y - 0.47, z + 0.08, 0.53, 0.43, 0.72);
  function bandPt(a){
    let lo = 0.05, hi = 1.0;
    for (let it = 0; it < 26; it++){ const r = (lo + hi) / 2; const y = 0.36 + r * Math.cos(a); const x = r * Math.sin(a); if (sdBrainTop(x, y, zcs(y) + 0.07) < 0) lo = r; else hi = r; }
    const y = 0.36 + lo * Math.cos(a); return [lo * Math.sin(a) * 1.02, y + 0.012, zcs(y) + 0.07];
  }
  for (let i = 0; i < 1900; i++){
    const s = rnd(); const a = -1.15 + 1.5 * s; const p = bandPt(a);
    const j = 0.01 + 0.01 * Math.sin(3.1416 * s);
    Fl.pos.push(p[0] * 0.985 + gauss() * j, p[1] - 0.012 + gauss() * j, p[2] + gauss() * j * 2.2); Fl.s.push(s); Fl.side.push(0); Fl.seed.push(rnd()); Fl.mode.push(0);
  }
  eyes.forEach((e, k) => {
    const sx = e.side;
    const P0 = [e.C[0] * 0.92, e.C[1] + 0.005, e.C[2] - 0.09], P1 = [sx * 0.1, 0.02, 0.34], P2 = [sx * 0.24, 0.26, -0.26], P3 = [sx * 0.15, 0.38, -0.68];
    for (let i = 0; i < 300; i++){ const t = rnd(); const p = bez(P0, P1, P2, P3, t); const j = 0.004 + 0.006 * t; Fl.pos.push(p[0] + gauss() * j, p[1] + gauss() * j, p[2] + gauss() * j); Fl.s.push(t); Fl.side.push(k); Fl.seed.push(rnd()); Fl.mode.push(1); }
  });

  /* ---------- malzemeler ---------- */
  const common = `
    uniform float uTime, uPx, uRef, uGain, uBreath, uReveal, uMorph, uDens;
    float cutAt(float z){ return mix(${CUT_B.toFixed(4)}, ${CUT_F.toFixed(4)}, smoothstep(-0.3, 0.8, z)); }
    float cutFade(vec3 p){ return smoothstep(cutAt(p.z) - 0.004, cutAt(p.z) + 0.022, p.y); }
    float revealAt(float s, float d){ float r = clamp((uReveal - d - s * 0.5) / 0.5, 0.0, 1.0); return r * r * (3.0 - 2.0 * r); }
  `;
  const fragDot = `
    varying vec3 vCol; varying float vA; varying float vSoft;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float d = length(c) * 2.0;
      float a = mix(smoothstep(1.0, 0.15, d), exp(-d * d * 4.5) * (1.0 - smoothstep(0.85, 1.0, d)), vSoft) * vA;
      if (a < 0.002) discard;
      gl_FragColor = vec4(vCol, a);
    }`;
  const U = (o) => Object.assign({ uTime: { value: 0 }, uPx: { value: 1 }, uRef: { value: 8 }, uGain: { value: 1 }, uBreath: { value: 0 }, uReveal: { value: 0 }, uMorph: { value: 0 }, uDens: { value: 1 } }, o);
  const ADD = { transparent: true, depthWrite: false, blending: T.AdditiveBlending };
  const shellMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uKey: { value: new T.Vector3(-0.3, 0.5, 0.82).normalize() }, uColA: { value: new T.Color('#8fb4c8') }, uColR: { value: new T.Color('#d4f6fa') }, uWave: { value: 0 }, uWaveR: { value: 0 } }),
    vertexShader: common + `
      attribute float aCurv; attribute float aSeed; attribute float aHair; attribute float aLine; attribute float aCov; attribute float aFace;
      attribute vec3 aPos2; attribute vec3 aNor2;
      uniform vec3 uKey, uColA, uColR; uniform float uWave, uWaveR;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        float rv = revealAt(aSeed, 0.0);
        vec3 P0 = mix(position, aPos2, uMorph);
        vec3 N0 = normalize(mix(normal, aNor2, uMorph));
        vec3 p = P0 + N0 * (1.0 - rv) * 0.28;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec3 n = normalize(normalMatrix * N0);
        vec3 v = normalize(-mv.xyz);
        float fc = dot(n, v);
        float rim = pow(1.0 - clamp(abs(fc), 0.0, 1.0), 3.0);
        float lam = max(dot(n, uKey), 0.0);
        float front = smoothstep(-0.25, 0.2, fc);
        float fore = smoothstep(-0.95, 0.55, P0.z);
        // kendi yüzüne geçiş: burun kökünden yayılan tek, yumuşak ışık halkası (tarama çizgisi yok)
        float wave = aFace * uWave * exp(-pow((length((P0 - vec3(0.0, 0.03, 0.84)) * vec3(1.0, 1.15, 1.0)) - uWaveR) / 0.045, 2.0));
        if (aLine > 0.5) {
          // çizgiler: kesim konturu (2), kaş (3)
          float L = aLine < 2.5 ? 0.30 : 0.36;
          float vis = aLine > 1.5 && aLine < 2.5 ? mix(0.35, 1.0, smoothstep(-0.6, 0.3, fc + 0.4 * n.y)) * (1.0 - 0.75 * smoothstep(0.6, 0.95, P0.z)) : mix(0.15, 1.0, front);
          vA = L * aCurv * vis * mix(0.45, 1.0, fore) * uGain * rv * (0.94 + 0.06 * sin(uTime * 1.1 + aSeed * 30.0)) * (1.0 + 1.5 * wave);
          vCol = aLine < 2.5 ? mix(uColA, uColR, 0.7) : mix(uColA, uColR, 0.55);
          vSoft = 0.35;
          gl_PointSize = uPx * (aLine < 2.5 ? 1.05 : 1.15) * (uRef / -mv.z);
          gl_Position = projectionMatrix * mv;
          return;
        }
        float ridge = smoothstep(5.0, 18.0, aCurv);
        float crease = smoothstep(4.0, 16.0, -aCurv);
        float fill = max(dot(n, normalize(vec3(0.3, 0.1, 0.95))), 0.0);
        float rimSide = 0.55 + 0.45 * smoothstep(-0.6, 0.5, abs(n.x) + 0.4 * n.y);
        float key = pow(lam, 1.25);
        float top = smoothstep(0.2, 1.0, P0.y) * smoothstep(-0.6, 0.2, P0.z);
        float faceZ = smoothstep(0.35, 0.7, P0.z) * smoothstep(0.32, 0.0, P0.y);
        // kafatası cam gibi: içerideki ışık görünür. Cam, yüze olan uzaklıkla açılır (yatay dikiş yok)
        float glass = 1.0 - smoothstep(0.3, 0.62, P0.z) * smoothstep(0.42, 0.12, P0.y);
        key = pow(lam, 1.8);
        float baseT = 0.025 + 1.15 * key + 0.08 * fill;
        float rimT = (0.3 + 0.55 * fore + 0.45 * top) * rim * rimSide * 1.35 * (1.0 - 0.45 * faceZ);
        float ridgeT = (0.22 * ridge * (0.4 + key) + 0.1 * crease * (0.3 + key)) * (1.0 - 0.4 * faceZ);
        float I = baseT * mix(1.0, 0.22, glass) + rimT * mix(1.0, 0.85, glass) + ridgeT * mix(1.0, 0.5, glass);
        I *= mix(0.08, 1.0, front);
        I *= mix(0.3, 1.0, fore);
        I *= 0.96 + 0.04 * sin(uTime * 1.3 + aSeed * 40.0);
        I += wave * 0.7;
        float earF = 1.0;
        vA = I * cutFade(P0) * uGain * 0.6 * (1.0 - 0.6 * aHair) * rv * earF * (1.0 - aCov);
        vCol = mix(uColA, uColR, clamp(rim * 1.2 + wave, 0.0, 1.0));
        vSoft = 0.4;
        // yüz noktaları biraz daha iri ve yumuşak: yoğun yerde yüzey gibi parlar
        vSoft = mix(0.4, 0.75, aFace);
        vA *= mix(1.0, 0.95, aFace) * uDens;
        // yüzün ışık alan yanı çok hafif sıcak beyaz: soğuk hologram değil, ten gibi bir ışık
        vCol = mix(vCol, vec3(1.0, 0.95, 0.89), aFace * 0.45 * key * (1.0 - rim));
        gl_PointSize = uPx * mix(1.12, 1.5, aFace) * (0.95 + 0.4 * rim) * (uRef / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: true }, ADD));
  const hairMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uKey: shellMat.uniforms.uKey, uColA: { value: new T.Color('#9db3c6') }, uColR: { value: new T.Color('#e2f2f8') } }),
    vertexShader: common + `
      attribute float aCurv; attribute float aSeed; attribute vec3 aTan;
      uniform vec3 uKey, uColA, uColR;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        float rv = revealAt(aSeed, 0.15);
        vec3 pp = position + normal * (1.0 - rv) * 0.3;
        vec4 mv = modelViewMatrix * vec4(pp, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vec3 t = normalize(normalMatrix * aTan);
        vec3 v = normalize(-mv.xyz);
        float fc = dot(n, v);
        float rim = pow(1.0 - clamp(abs(fc), 0.0, 1.0), 2.2);
        float key = pow(max(dot(n, uKey), 0.0), 1.1);
        vec3 top = normalize(vec3(0.25, 0.95, 0.3));
        vec3 hv = normalize(uKey + v); vec3 hv2 = normalize(top + v);
        float th = dot(t, hv), th2 = dot(t, hv2);
        float sheen = pow(sqrt(max(0.0, 1.0 - th * th)), 18.0) + 0.7 * pow(sqrt(max(0.0, 1.0 - th2 * th2)), 12.0);
        key = max(key, 0.6 * pow(max(dot(n, top), 0.0), 1.5));
        float fore = smoothstep(-0.95, 0.5, position.z);
        float I = (0.12 + 0.4 * key + 0.75 * sheen * (0.4 + key) + 0.45 * rim) * mix(0.45, 1.0, fore) * smoothstep(-0.2, 0.2, fc);
        I *= aCurv * (0.97 + 0.03 * sin(uTime * 0.8 + aSeed * 30.0));
        vA = I * cutFade(position) * uGain * 0.5 * rv * uDens;
        vCol = mix(uColA, uColR, clamp(rim + sheen * 0.5, 0.0, 1.0));
        vSoft = 0.35;
        gl_PointSize = uPx * 1.1 * (uRef / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: true }, ADD));
  const brainMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uProj: { value: 1 }, uInt: { value: [0, 0, 0, 0, 0] }, uHalo: { value: [0, 0, 0, 0, 0] }, uLit: { value: [0, 0, 0, 0, 0] }, uNorm: { value: [1, 1, 1, 1, 1] },
      uCol: { value: [0, 1, 2, 3, 4].map(() => new T.Color()) }, uNeu: { value: new T.Color('#9fb3c4') }, uNeuI: { value: 1 }, uWalk: { value: 0 }, uCad: { value: 2 }, uWhite: { value: 0.2 } }),
    vertexShader: common + `
      attribute float aReg; attribute float aSeed; attribute float aW; attribute float aFold; attribute float aKind; attribute float aSize;
      uniform float uInt[5]; uniform float uHalo[5]; uniform float uLit[5]; uniform float uNorm[5]; uniform vec3 uCol[5]; uniform vec3 uNeu; uniform float uNeuI, uProj, uWalk, uCad, uWhite;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        int r = int(aReg + 0.5);
        float I = 0.0, H = 0.0, lit = 0.0, nrm = 1.0; vec3 rc = uNeu;
        for (int i = 0; i < 5; i++) if (i == r) { I = uInt[i]; H = uHalo[i]; lit = uLit[i]; rc = uCol[i]; nrm = uNorm[i]; }
        float w = r < 5 ? aW : 0.0;
        float rv = revealAt(aSeed, 0.35);
        vec3 p = position;
        float ph = aSeed * 6.2832;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dz = -mv.z;
        float beat = 1.0;
        if (r == 2) beat = 0.9 + 0.1 * uBreath;
        if (aKind < 0.5) {
          vec3 n = normalize(normalMatrix * normal);
          float fc = dot(n, normalize(-mv.xyz));
          float rim = pow(1.0 - clamp(abs(fc), 0.0, 1.0), 2.0);
          float back = smoothstep(0.15, -0.35, fc);
          float lw = lit * w;
          float farH = mix(mix(1.0, 0.42, smoothstep(0.02, 0.3, position.x)), 1.0, lw);
          rim *= (0.35 + 0.65 * smoothstep(-0.75, -0.15, normal.y)) * (1.0 - 0.75 * lw);
          float low = mix(mix(0.45, 1.0, smoothstep(0.08, 0.3, position.y)), 1.0, lw);
          float env = (0.07 + 0.5 * aFold + 0.22 * rim) * uNeuI * mix(1.0, 0.4, back) * farH * low;
          float tw = mix(1.0, 0.82 + 0.18 * sin(uTime * 2.1 + ph * 3.0), lit);
          float body = mix(0.35 + 0.65 * aFold, 1.0, lit * 0.7);
          float reg = w * I * mix(0.1, 1.05, lit) * body * mix(1.0, 0.55, back) * tw * beat * nrm * farH;
          vA = (env * (1.0 - 0.7 * w) + reg) * uGain * rv;
          vec3 regCol = mix(uNeu, rc, 0.12 + 0.88 * lit);
          vCol = mix(uNeu, regCol, clamp(w * 1.4, 0.0, 1.0));
          vCol = mix(vCol, vec3(1.0), lit * w * aFold * uWhite);
          vSoft = 0.25;
          gl_PointSize = uPx * (1.0 + 0.35 * aFold + 0.55 * lit * w) * (uRef / dz);
        } else {
          vA = H * beat * mix(0.0, 0.42, lit) * aW * uGain * rv;
          vCol = rc; vSoft = 1.0;
          gl_PointSize = aSize * uProj / dz;
        }
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: false }, ADD));
  const flowMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uWalk: { value: 0 }, uCad: { value: 2 }, uOpt: { value: 0.4 }, uPulse: { value: -1 }, uColW: { value: new T.Color('#ffb13b') }, uHotW: { value: new T.Color('#fff1d6') }, uColO: { value: new T.Color('#3fd3df') } }),
    vertexShader: common + `
      attribute float aS; attribute float aSide; attribute float aSeed; attribute float aMode;
      uniform float uWalk, uCad, uOpt, uPulse; uniform vec3 uColW, uHotW, uColO;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dz = -mv.z; float I; vec3 col; float sz;
        if (aMode < 0.5) {
          float spd = 0.8;
          float ph = fract((aS / spd - uTime) * uCad);
          float crest = pow(0.5 + 0.5 * cos(ph * 6.2832), 3.0);
          float ends = smoothstep(0.0, 0.1, aS) * smoothstep(1.0, 0.8, aS);
          I = uWalk * ends * (0.8 + 1.3 * crest);
          col = mix(uColW, uHotW, crest * 0.35); sz = 1.3 + 0.8 * crest;
        } else {
          float hd = uPulse * 1.2 - 0.1;
          float g = uPulse >= 0.0 ? exp(-pow((aS - hd) / 0.07, 2.0)) : 0.0;
          I = uOpt * (0.5 + g * 1.4) * (0.55 + 0.45 * smoothstep(0.0, 0.25, aS));
          col = mix(uColO, vec3(1.0), g * 0.3); sz = 0.85 + 0.9 * g;
        }
        I *= 0.92 + 0.08 * sin(uTime * 5.0 + aSeed * 40.0);
        vA = I * uGain * 0.5 * revealAt(aSeed, 0.4);
        vCol = col; vSoft = 0.3;
        gl_PointSize = uPx * sz * (uRef / dz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: false }, ADD));
  const eyeMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uBlink: { value: 0 }, uSac: { value: new T.Vector2() }, uI1: { value: new T.Color('#19c2d1') }, uI2: { value: new T.Color('#3e7bfa') }, uLid: { value: new T.Color('#d7f1f6') }, uHi: { value: new T.Color('#ffffff') }, uEyeI: { value: 1 }, uPupil: { value: 0 }, uProjE: { value: 1 } }),
    vertexShader: common + `
      attribute vec3 aPos2; attribute vec3 aLid; attribute vec3 aCol; attribute float aKind; attribute float aSize; attribute vec3 aNor; attribute vec3 aCen;
      uniform float uBlink, uEyeI, uPupil, uProjE; uniform vec2 uSac; uniform vec3 uI1, uI2, uLid, uHi;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        float k = aKind;
        vec3 p = mix(position, aPos2, (k > 0.5 && k < 1.5) || k > 5.5 ? uBlink : 0.0);
        if (k < 0.5 || k > 6.5) {
          // mikro sakkad: iris göz merkezinde birkaç derece döner
          vec3 q = p - aCen;
          float cy = cos(uSac.x), sy = sin(uSac.x), cx = cos(uSac.y), sx = sin(uSac.y);
          q = vec3(cy * q.x + sy * q.z, q.y, -sy * q.x + cy * q.z);
          q = vec3(q.x, cx * q.y - sx * q.z, sx * q.y + cx * q.z);
          p = aCen + q;
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dz = -mv.z;
        float up = mix(aLid.y, aLid.z + 0.002, uBlink);
        float vis = smoothstep(up + 0.003, up - 0.002, aLid.x) * smoothstep(aLid.z - 0.003, aLid.z + 0.002, aLid.x);
        float a = 0.0; vec3 col = uLid; float sz = aSize;
        vec3 nv = normalize(normalMatrix * aNor);
        float fc = smoothstep(-0.1, 0.35, dot(nv, normalize(-mv.xyz))) * (0.7 + 0.3 * smoothstep(-0.2, 0.2, -position.x));
        float glow = max(0.0, uEyeI - 1.0);
        if (k < 0.5) { col = mix(uI1, uI2, smoothstep(0.35, 1.0, aCol.x)); a = (0.42 + 0.7 * aCol.y) * vis * min(uEyeI, 1.0) * (1.0 + 1.6 * glow); sz *= 1.0 + 1.2 * glow; }
        else if (k < 1.5) { a = 0.95 * aCol.y * min(uEyeI, 1.0); }
        else if (k < 2.5) { a = 0.05 * (1.0 - uBlink * 0.6); }
        else if (k < 3.5) { a = 0.12 * vis; }
        else if (k < 5.5) { col = uHi; a = vis; }
        else if (k < 6.5) { a = 0.4 * aCol.y * min(uEyeI, 1.0); }
        else if (k < 7.5) { col = vec3(1.0); a = uPupil * vis * 0.9; }
        else { col = mix(uI1, uI2, 0.35); a = 0.16 * (1.0 - 0.6 * uPupil) * min(uEyeI, 1.3) * (1.0 - uBlink); sz = aSize * uProjE / dz / (uPx * 1.25 * uRef / dz); }
        vA = a * uGain * 0.8 * fc * revealAt(0.5, 0.3);
        vCol = col; vSoft = (k > 4.5 && k < 5.5) || k > 7.5 ? 1.0 : 0.0;
        gl_PointSize = uPx * sz * 1.25 * (uRef / dz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: true }, ADD));
  const maskMat = new T.ShaderMaterial({
    uniforms: { uMorph: shellMat.uniforms.uMorph },
    vertexShader: `attribute vec3 aPos2; uniform float uMorph; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(position, aPos2, uMorph), 1.0); }`,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.0); }`,
    colorWrite: false, depthWrite: true, depthTest: true, side: T.DoubleSide });
  const mats = [shellMat, hairMat, brainMat, flowMat, eyeMat];
  for (const m of mats) if (m !== shellMat) m.uniforms.uMorph = shellMat.uniforms.uMorph;

  function geo(attrs){ const g = new T.BufferGeometry(); for (const [k, [arr, n]] of Object.entries(attrs)) g.setAttribute(k, new T.BufferAttribute(arr instanceof Float32Array ? arr : new Float32Array(arr), n)); return g; }
  /* yüze bağlı noktaların "kendi yüzün" konumu: en yakın üçgendeki köşe kaymalarının barisentrik karışımı */
  function morphed(pos, mf, mb0, mb1, mw){
    const n = pos.length / 3, out = new Float32Array(pos);
    for (let i = 0; i < n; i++){
      const w = mw[i]; if (w < 0.004) continue;
      const f = mf[i], b0 = mb0[i], b1 = mb1[i], b2 = Math.max(0, 1 - b0 - b1);
      for (let d = 0; d < 3; d++){
        const a = FI[f * 3], b = FI[f * 3 + 1], c = FI[f * 3 + 2];
        out[i * 3 + d] += w * ((VO[a * 3 + d] - V[a * 3 + d]) * b0 + (VO[b * 3 + d] - V[b * 3 + d]) * b1 + (VO[c * 3 + d] - V[c * 3 + d]) * b2);
      }
    }
    return out;
  }
  const eyeGeo = geo({ position: [E.pos, 3], aPos2: [E.pos2, 3], aLid: [E.lid, 3], aCol: [E.col, 3], aKind: [E.kind, 1], aSize: [E.size, 1], aNor: [E.nor, 3], aCen: [E.cen, 3] });
  const flowGeo = geo({ position: [Fl.pos, 3], aS: [Fl.s, 1], aSide: [Fl.side, 1], aSeed: [Fl.seed, 1], aMode: [Fl.mode, 1] });
  // etiket çapaları: Göz etiketi gözün kendisine bağlanır; öbürleri bölgenin ağırlık merkezine
  const E0 = eyes[0];
  const EYE_A = [E0.A[0] + 0.005, E0.A[1] - 0.045, E0.A[2] + 0.0];
  let HALO_A = [EYE_A, [-0.2, 0.58, 0.46], [0, 0.0, -0.38], [-0.46, 0.26, 0.06], [-0.3, 0.84, 0.0]];
  let ANCHOR = HALO_A.slice();
  const BRAIN_C = [0, 0.42, -0.08];
  let ready = false, revealT0 = -1, info = {};
  function build(D){
    const objs = [];
    const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(D.mask.pos, 3));
    mg.setAttribute('aPos2', new T.BufferAttribute(morphed(D.mask.pos, D.mask.mf, D.mask.mb0, D.mask.mb1, D.mask.mw), 3));
    mg.setIndex(new T.BufferAttribute(D.mask.idx, 1));
    objs.push(new T.Mesh(mg, maskMat));
    // yüz maskesi: kanonik ağın kendisi, normal boyunca içeri alınmış (göz açıklığı hariç); göz küresi maskesi
    { const IN = 0.02, mp = new Float32Array(V.length), mp2 = new Float32Array(V.length);
      for (let i = 0; i < V.length; i++){ mp[i] = V[i] - N[i] * IN; mp2[i] = VO[i] - NO[i] * IN; }
      const ix = []; for (let f = 0; f < NF; f++) if (!aperture[f]) ix.push(FI[f * 3], FI[f * 3 + 1], FI[f * 3 + 2]);
      const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(mp, 3)); fg.setAttribute('aPos2', new T.BufferAttribute(mp2, 3)); fg.setIndex(ix);
      objs.push(new T.Mesh(fg, maskMat));
      for (const e of eyes){ const sg = new T.SphereGeometry(R_EYE - 0.014, 20, 14); sg.translate(e.C[0], e.C[1], e.C[2]); sg.setAttribute('aPos2', sg.getAttribute('position').clone()); objs.push(new T.Mesh(sg, maskMat)); }
    }
    const NMASK = objs.length;
    // kafatası ve ense (önceden üretilmiş) + yüz (çalışma anında ağdan)
    const ns = D.shell.line.length;
    const sp2 = morphed(D.shell.pos, D.shell.mf, D.shell.mb0, D.shell.mb1, D.shell.mw);
    objs.push(new T.Points(geo({ position: [D.shell.pos, 3], normal: [D.shell.nor, 3], aPos2: [sp2, 3], aNor2: [D.shell.nor, 3], aCurv: [D.shell.cur, 1], aSeed: [seeds(ns), 1], aHair: [D.shell.hair, 1], aLine: [D.shell.line, 1], aCov: [D.shell.cov, 1], aFace: [new Float32Array(ns), 1] }), shellMat));
    const nf = Fc.cur.length;
    objs.push(new T.Points(geo({ position: [Fc.pos, 3], normal: [Fc.nor, 3], aPos2: [Fc.pos2, 3], aNor2: [Fc.nor2, 3], aCurv: [Fc.cur, 1], aSeed: [seeds(nf), 1], aHair: [new Float32Array(nf), 1], aLine: [Fc.line, 1], aCov: [Fc.cov, 1], aFace: [new Float32Array(nf).fill(1), 1] }), shellMat));
    objs.push(new T.Points(geo({ position: [D.hair.pos, 3], normal: [D.hair.nor, 3], aTan: [D.hair.tan, 3], aCurv: [D.hair.cur, 1], aSeed: [D.hair.seed, 1] }), hairMat));
    const nb = D.brain.reg.length;
    HALO_A = D.anchors.map((a, i) => (a[0] || a[1] || a[2]) ? a : HALO_A[i]);
    ANCHOR = HALO_A.map((a, i) => i === 0 ? EYE_A : a);
    for (let i = 0; i < 5; i++) brainMat.uniforms.uNorm.value[i] = D.norm[i];
    const HALO = [];
    AREAS.forEach((k, i) => { const a = HALO_A[i]; const o = [a[0] - 0.04, a[1], a[2]]; HALO.push([i, o, 0.62, 0.55], [i, o, 0.3, 1]); });
    const tot = nb + HALO.length;
    const bp = new Float32Array(tot * 3), bn = new Float32Array(tot * 3), br = new Float32Array(tot), bw = new Float32Array(tot), bf = new Float32Array(tot), bs = seeds(tot), bk = new Float32Array(tot), bz = new Float32Array(tot);
    bp.set(D.brain.pos); bn.set(D.brain.nor); br.set(D.brain.reg); bw.set(D.brain.w); bf.set(D.brain.fold);
    HALO.forEach(([r, p, sz, a], j) => { const i = nb + j; bp.set(p, i * 3); bn.set([0, 0, 1], i * 3); br[i] = r; bw[i] = a; bf[i] = 1; bs[i] = 0.5; bk[i] = 1; bz[i] = sz; });
    objs.push(new T.Points(geo({ position: [bp, 3], normal: [bn, 3], aReg: [br, 1], aW: [bw, 1], aFold: [bf, 1], aSeed: [bs, 1], aKind: [bk, 1], aSize: [bz, 1] }), brainMat));
    objs.push(new T.Points(flowGeo, flowMat));
    objs.push(new T.Points(eyeGeo, eyeMat));
    objs.forEach((o, i) => { o.frustumCulled = false; o.renderOrder = i; head.add(o); });
    const HIDE = qs.get('hide') || ''; const o = (i) => objs[NMASK + i];
    if (HIDE.includes('brain')){ o(3).visible = false; o(4).visible = false; } if (HIDE.includes('hair')) o(2).visible = false;
    if (HIDE.includes('skull')) o(0).visible = false; if (HIDE.includes('face')) o(1).visible = false; if (HIDE.includes('mask')) for (let i = 0; i < NMASK; i++) objs[i].visible = false;
    info = Object.assign({}, D.info, { face: nFaceDust, brow: nf - nFaceDust, eye: E.kind.length, flow: Fl.s.length, total: ns + nf + D.hair.cur.length + nb + E.kind.length + Fl.s.length });
    info.initMs = Math.round(performance.now() - tInit); info.libMs = Math.round(tF0 - tInit); info.faceMs = Math.round(tF1 - tF0); info.browMs = Math.round(tF2 - tF1);
    GL.info = info;
    ready = true; revealT0 = time;
    stage.classList.add('ready');
    layoutMeasure();
    draw();
  }

  /* ---------- tema ---------- */
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function applyTheme(){
    const inv = css('--stage-inv') === '1';
    const bg = new T.Color(css('--stage-bg') || '#070c12');
    if (inv){
      // açık tema: tuval CSS ile ters çevrilir (invert, hue-rotate 180°, saturate 1.25). Silme rengi bu süzgecin tersidir.
      const Hm = [[-0.574, 1.43, 0.144], [0.426, 0.43, 0.144], [0.426, 1.43, -0.856]], sv = 1.25;
      const Sm = [[0.213 + 0.787 * sv, 0.715 - 0.715 * sv, 0.072 - 0.072 * sv], [0.213 - 0.213 * sv, 0.715 + 0.285 * sv, 0.072 - 0.072 * sv], [0.213 - 0.213 * sv, 0.715 - 0.715 * sv, 0.072 + 0.928 * sv]];
      const M = Sm.map((r) => [0, 1, 2].map((j) => r[0] * Hm[0][j] + r[1] * Hm[1][j] + r[2] * Hm[2][j]));
      const [a, b2, c] = M[0], [d, e, f] = M[1], [g, h, i] = M[2];
      const det = a * (e * i - f * h) - b2 * (d * i - f * g) + c * (d * h - e * g);
      const Mi = [[e * i - f * h, c * h - b2 * i, b2 * f - c * e], [f * g - d * i, a * i - c * g, c * d - a * f], [d * h - e * g, b2 * g - a * h, a * e - b2 * d]].map((r) => r.map((v) => v / det));
      const v = [bg.r, bg.g, bg.b], x = Mi.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
      bg.setRGB(...x.map((q) => Math.max(0, Math.min(1, 1 - q))));
    }
    renderer.setClearColor(bg, 1);
    cv.classList.toggle('inv', inv);
    for (const m of mats) m.uniforms.uGain.value = inv ? 0.85 : 1;
    eyeMat.uniforms.uGain.value = inv ? 1.5 : 1; eyeMat.uniforms.uPupil.value = inv ? 1 : 0;
    flowMat.uniforms.uHotW.value.set(inv ? '#ffc56a' : '#fff1d6'); brainMat.uniforms.uWhite.value = inv ? 0 : 0.2;
    AREAS.forEach((k, i) => brainMat.uniforms.uCol.value[i].set(css('--s-' + k) || '#ffffff'));
    draw();
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- boyut / kamera ---------- */
  let W = 1, H = 1;
  let baseYaw = YAW, basePitch = -0.02;
  const DBGA = { front: 0, side: Math.PI / 2, back: Math.PI, top: 0, face: 0, hair: YAW }[DBG];
  if (DBGA !== undefined) baseYaw = DBGA;
  if (qs.get('byaw')) baseYaw = parseFloat(qs.get('byaw'));
  const CY = 0.27;
  function resize(){
    const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    const asp = W / H; cam.aspect = asp;
    const halfH = (DBG === 'face' ? 0.5 : DBG ? 1.4 : 0.97) * Math.max(1, 0.84 / asp);
    cam.fov = 2 * Math.atan(halfH / CAMD) * 180 / Math.PI;
    if (DBG === 'face'){ cam.position.set(0, CAMY - 0.3, CAMD); cam.lookAt(0, 0.05, 0); }
    else if (DBG === 'hair'){ cam.position.set(0, 1.2, CAMD); cam.lookAt(0, 0.62, 0); cam.fov = 2 * Math.atan(0.62 / CAMD) * 180 / Math.PI; }
    else { cam.position.set(0, DBG === 'top' ? 6 : DBG ? CY : CAMY, CAMD); cam.lookAt(0, CY, 0); }
    cam.updateProjectionMatrix();
    const proj = H * dpr / (2 * Math.tan(cam.fov * Math.PI / 360));
    // küçük sahnede aynı nokta sayısı daha sık düşer: yüzey koyulaşmasın diye nokta ışığı alanla birlikte azalır
    const dens = Math.max(0.6, Math.min(1, Math.pow(H / 397, 1.3)));
    for (const m of mats){ m.uniforms.uPx.value = dpr * Math.min(1.25, Math.max(0.9, H / 380)); m.uniforms.uRef.value = CAMD; m.uniforms.uDens.value = dens; }
    brainMat.uniforms.uProj.value = proj; eyeMat.uniforms.uProjE.value = proj;
    layoutMeasure();
    draw();
  }
  new ResizeObserver(resize).observe(stage);

  /* ---------- durum ---------- */
  const cur = { int: [0, 0, 0, 0, 0], halo: [0, 0, 0, 0, 0], lit: [0, 0, 0, 0, 0], walk: 0, neu: 1, opt: 0.4, eye: 1 };
  let tgt = { int: [0, 0, 0, 0, 0], halo: [0, 0, 0, 0, 0], lit: [0, 0, 0, 0, 0], walk: 0, neu: 1, opt: 0.4, eye: 1 };
  let blinkT = 4, cadence = 2;
  const morph = { v: 0, from: 0, to: 0, t0: -9 };
  const LBL_STATE = [];
  function computeTargets(){
    const D = DAYS[KEY[stKey]];
    const t = { int: [], halo: [], lit: [], walk: stKey === 'walk' ? 1 : 0, neu: sel ? 0.5 : 1, opt: 0.4, eye: 1 };
    AREAS.forEach((k, i) => {
      const st = D.a[k].st;
      // yalnız 'up' tam yanar ve renklenir; 'live' sakin tabanda kalır, "şu an" hissini akan dalga verir
      let lit = st === 'up' ? 1 : st === 'live' ? 0.3 : 0;
      let I = st === 'up' ? 1 : 0.9, Hh = st === 'up' ? 1 : st === 'live' ? 1 : 0;
      // seçim: up olmayan bölge renklenmez; yalnız nötr ışıkla öne çıkar
      if (sel){ if (sel === k){ if (st !== 'up') I = 2.3; } else { I *= 0.16; Hh *= 0.08; lit *= 0.5; } }
      t.int[i] = I; t.halo[i] = Hh; t.lit[i] = lit;
      LBL_STATE[i] = { lit: st === 'up', live: st === 'live', on: !sel || sel === k };
    });
    const gst = D.a.goz.st;
    t.opt = (gst === 'up' ? 1 : 0.4) * (sel && sel !== 'goz' ? 0.3 : sel === 'goz' ? 1.4 : 1);
    t.eye = sel === 'goz' ? 1.3 : sel ? 0.6 : 1;
    tgt = t;
    blinkT = 20 / Math.max(1, D.blinks);
    const m = /([\d.]+)\s*adım\s*·\s*(\d+)\s*dk/.exec(DAYS.walk.a.hareket.v);
    if (m){ const steps = parseFloat(m[1].replace(/\./g, '')), mins = parseFloat(m[2]); cadence = steps / (mins * 60); }
    LB.forEach((l, i) => {
      const s = LBL_STATE[i];
      l.classList.add('on'); l.classList.toggle('lit', s.lit || s.live); l.classList.toggle('dim', !s.lit && !s.live); l.classList.toggle('fade', !s.on);
      LN[i].style.opacity = s.on ? (s.lit || s.live ? 0.7 : 0.32) : 0.08; LD[i].style.opacity = s.on ? (s.lit || s.live ? 1 : 0.5) : 0.1;
      LN[i].setAttribute('stroke', s.lit || s.live ? `var(--l-${AREAS[i]})` : 'var(--st-ink-2)'); LD[i].setAttribute('fill', s.lit || s.live ? `var(--l-${AREAS[i]})` : 'var(--st-ink-2)');
    });
  }

  /* ---------- etiketler ---------- */
  const vtmp = new T.Vector3();
  function proj(p){ vtmp.set(p[0], p[1], p[2]).applyMatrix4(head.matrixWorld).project(cam); return [(vtmp.x * 0.5 + 0.5) * W, (-vtmp.y * 0.5 + 0.5) * H]; }
  const LW = [60, 60, 60, 60, 60], LH = 24;
  function layoutMeasure(){ LB.forEach((l, i) => { LW[i] = l.offsetWidth || LW[i]; }); }
  const PREF = [[0.15, 1], [0.6, -1], [-0.6, 1], [-1, -0.45], [-0.75, -1]];
  const boxes = PREF.map(() => ({ x: 0, y: 0, ax: 0, ay: 0 }));
  const last = PREF.map(() => [NaN, NaN, NaN, NaN]);
  function layoutLabels(){
    const C = proj(BRAIN_C);
    for (let i = 0; i < 5; i++){
      const A = proj(ANCHOR[i]);
      let dx = A[0] - C[0], dy = A[1] - C[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      dx = dx * 0.25 + PREF[i][0] * 0.75; dy = dy * 0.25 + PREF[i][1] * 0.75; const d2 = Math.hypot(dx, dy) || 1; dx /= d2; dy /= d2;
      const reach = (i === 0 ? 22 : 34) + 0.5 * Math.abs(dx) * LW[i] + 0.5 * Math.abs(dy) * LH;
      const b = boxes[i]; b.ax = A[0]; b.ay = A[1]; b.x = A[0] + dx * reach; b.y = A[1] + dy * reach;
    }
    for (let it = 0; it < 8; it++){
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++){
        const a = boxes[i], b = boxes[j];
        const ox = (LW[i] + LW[j]) / 2 + 6 - Math.abs(a.x - b.x), oy = LH + 5 - Math.abs(a.y - b.y);
        if (ox > 0 && oy > 0){ const s = a.y < b.y ? -1 : 1; a.y += s * oy / 2; b.y -= s * oy / 2; }
      }
      for (let i = 0; i < 5; i++){ const b = boxes[i]; b.x = Math.max(LW[i] / 2 + 8, Math.min(W - LW[i] / 2 - 8, b.x)); b.y = Math.max(LH / 2 + 8, Math.min(H - LH / 2 - 8, b.y)); }
    }
    for (let i = 0; i < 5; i++){
      const b = boxes[i], L = last[i];
      if (Math.abs(b.x - L[0]) < 0.5 && Math.abs(b.y - L[1]) < 0.5 && Math.abs(b.ax - L[2]) < 0.5 && Math.abs(b.ay - L[3]) < 0.5) continue;
      L[0] = b.x; L[1] = b.y; L[2] = b.ax; L[3] = b.ay;
      LB[i].style.transform = `translate(${(b.x - LW[i] / 2).toFixed(1)}px,${(b.y - LH / 2).toFixed(1)}px)`;
      const hx = LW[i] / 2, hy = LH / 2; const vx = b.ax - b.x, vy = b.ay - b.y;
      const s = Math.min(hx / Math.max(1e-3, Math.abs(vx)), hy / Math.max(1e-3, Math.abs(vy)));
      const ex = b.x + vx * Math.min(1, s), ey = b.y + vy * Math.min(1, s);
      const ln = LN[i]; ln.setAttribute('x1', b.ax.toFixed(1)); ln.setAttribute('y1', b.ay.toFixed(1)); ln.setAttribute('x2', ex.toFixed(1)); ln.setAttribute('y2', ey.toFixed(1));
      LD[i].setAttribute('cx', b.ax.toFixed(1)); LD[i].setAttribute('cy', b.ay.toFixed(1));
    }
  }

  /* ---------- döngü ---------- */
  let tPrev = performance.now(), time = 0, blinkClock = -3.2, pulseT = -9, running = true, visible = true;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const sac = { x: 0, y: 0, tx: 0, ty: 0, next: 1.5 };
  stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2; });
  stage.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });
  stage.addEventListener('click', (e) => {
    const r = stage.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bd = 40;
    AREAS.forEach((k, i) => {
      const b = boxes[i];
      if (Math.abs(mx - b.x) < LW[i] / 2 + 6 && Math.abs(my - b.y) < LH / 2 + 6){ best = k; bd = 0; return; }
      const d = Math.hypot(b.ax - mx, b.ay - my); if (d < bd){ bd = d; best = k; }
    });
    select(best && best !== sel ? best : null);
  });
  function blinkAt(tb){ if (tb < 0 || tb > 0.22) return 0; if (tb < 0.07) return tb / 0.07; if (tb < 0.09) return 1; return 1 - (tb - 0.09) / 0.13; }
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const hDot = chipsEl.querySelector('[data-k="hareket"] .dt');
  function frame(now, still){
    const dt = Math.min(0.1, Math.max(0, (now - tPrev) / 1000)); tPrev = now;
    time += still ? 0 : dt;
    const k = still ? 1 : 1 - Math.exp(-dt * 4.5);
    for (let i = 0; i < 5; i++){ cur.int[i] += (tgt.int[i] - cur.int[i]) * k; cur.halo[i] += (tgt.halo[i] - cur.halo[i]) * k; cur.lit[i] += (tgt.lit[i] - cur.lit[i]) * k; }
    cur.walk += (tgt.walk - cur.walk) * k; cur.neu += (tgt.neu - cur.neu) * k; cur.opt += (tgt.opt - cur.opt) * k; cur.eye += (tgt.eye - cur.eye) * k;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3); pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    if (!still){
      const prev = blinkClock; blinkClock += dt; if (blinkClock > blinkT){ blinkClock -= blinkT; }
      if (prev < 0.03 && blinkClock >= 0.03){ pulseT = time; sac.next = 0; }
      sac.next -= dt;
      if (sac.next <= 0){ sac.tx = (rnd() - 0.5) * 0.034; sac.ty = (rnd() - 0.5) * 0.022; sac.next = 0.9 + rnd() * 1.8; }
      const ks = Math.min(1, dt * 28); sac.x += (sac.tx - sac.x) * ks; sac.y += (sac.ty - sac.y) * ks;
    }
    // yüz biçimi geçişi (morph) ve tek ışık halkası
    const MT = 1.6;
    const mp = still ? 1 : Math.min(1, (time - morph.t0) / MT);
    morph.v = morph.from + (morph.to - morph.from) * ease(mp);
    const wv = still || mp >= 1 ? 0 : Math.sin(Math.PI * mp);
    shellMat.uniforms.uMorph.value = morph.v; shellMat.uniforms.uWave.value = wv * (morph.to > morph.from ? 1 : 0.5); shellMat.uniforms.uWaveR.value = 0.02 + 0.62 * mp;
    const blink = still ? 0 : blinkAt(blinkClock);
    const breath = Math.sin(time * 6.2832 / 5.2);
    const sc = 1 + 0.01 * breath;
    head.scale.set(sc, sc, sc);
    head.rotation.set(basePitch + 0.016 * Math.sin(time * 0.21) + pointer.y * 0.05, baseYaw + 0.035 * Math.sin(time * 0.17) + pointer.x * 0.1, 0.012, 'YXZ');
    head.updateMatrixWorld();
    const reveal = !ready ? 0 : (still || reduce) ? 2 : Math.min(2, (time - revealT0) / 1.1);
    for (const m of mats){ m.uniforms.uTime.value = time; m.uniforms.uBreath.value = breath; m.uniforms.uReveal.value = reveal; }
    const bu = brainMat.uniforms;
    for (let i = 0; i < 5; i++){ bu.uInt.value[i] = cur.int[i]; bu.uHalo.value[i] = cur.halo[i]; bu.uLit.value[i] = cur.lit[i]; }
    bu.uNeuI.value = cur.neu; bu.uWalk.value = cur.walk; bu.uCad.value = cadence;
    flowMat.uniforms.uWalk.value = cur.walk; flowMat.uniforms.uCad.value = cadence; flowMat.uniforms.uOpt.value = cur.opt;
    flowMat.uniforms.uPulse.value = still ? 0.55 : Math.min(1.3, (time - pulseT) / 1.0);
    eyeMat.uniforms.uBlink.value = blink; eyeMat.uniforms.uEyeI.value = cur.eye; eyeMat.uniforms.uSac.value.set(sac.x, sac.y);
    if (ready) renderer.render(scene, cam);
    layoutLabels();
    if (hDot){ if (stKey === 'walk' && !still){ const ph = (time * cadence) % 1; hDot.style.transform = `scale(${(1 + 0.45 * Math.exp(-ph * 6)).toFixed(3)})`; } else hDot.style.transform = ''; }
  }
  function loop(now){ if (running && visible) frame(now, false); requestAnimationFrame(loop); }
  function draw(){ if (reduce){ tPrev = performance.now(); frame(tPrev, true); } }
  document.addEventListener('visibilitychange', () => { running = !document.hidden; tPrev = performance.now(); });
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; tPrev = performance.now(); }).observe(stage);

  GL = {
    onState(){ computeTargets(); if (reduce){ for (let i = 0; i < 5; i++){ cur.int[i] = tgt.int[i]; cur.halo[i] = tgt.halo[i]; cur.lit[i] = tgt.lit[i]; } cur.walk = tgt.walk; cur.neu = tgt.neu; cur.opt = tgt.opt; cur.eye = tgt.eye; time = 1.35; } draw(); },
    onFace(instant){
      const to = own ? 1 : 0; if (to === morph.to && !instant) return;
      morph.from = instant ? to : morph.v; morph.to = to; morph.t0 = instant ? -9 : time;
      if (instant) morph.v = to;
      if (reduce){ morph.from = morph.to = morph.v = to; }
      draw();
    },
    info,
  };
  window.__gl = GL;
  applyTheme(); resize(); computeTargets();
  for (let i = 0; i < 5; i++){ cur.int[i] = tgt.int[i]; cur.halo[i] = tgt.halo[i]; cur.lit[i] = tgt.lit[i]; } cur.walk = tgt.walk; cur.neu = tgt.neu; cur.opt = tgt.opt; cur.eye = tgt.eye;
  if (reduce){ time = 1.35; }
  build(DATA);
  if (reduce) draw(); else requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutMeasure(); draw(); });
}

setState(readHash());
setOwn(readOwn(), true);
select(readSel(), true);
/* three.js r128 bu sayfaya satır içinde gömülüdür (uygulama paketinde de yerel dosya olur): ağ kopsa da sahne açılır */
try { initGL(); GL.onFace(true); GL.onState(); } catch (e) { document.getElementById('app').classList.add('nogl'); GL = null; console.warn(e); }
})();
