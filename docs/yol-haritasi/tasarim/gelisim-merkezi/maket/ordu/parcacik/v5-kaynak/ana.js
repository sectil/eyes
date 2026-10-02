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
  const H = BAKED_HDR, PB = H.pb, buf = b64(BAKED_BIN).buffer, out = {};
  for (const grp in H.sec){
    out[grp] = {};
    for (const nm in H.sec[grp]){
      const s = H.sec[grp][nm]; let a;
      if (s.t === 'p32'){ const v = new Uint32Array(buf, s.o, s.n); a = new Float32Array(s.n * 3);
        const kx = (PB.x1 - PB.x0) / 2047, ky = (PB.y1 - PB.y0) / 2047, kz = (PB.z1 - PB.z0) / 1023;
        for (let i = 0; i < s.n; i++){ const w = v[i]; a[i * 3] = PB.x0 + (w & 2047) * kx; a[i * 3 + 1] = PB.y0 + ((w >>> 11) & 2047) * ky; a[i * 3 + 2] = PB.z0 + (w >>> 22) * kz; } }
      else if (s.t === 'oct'){ const v = new Int8Array(buf, s.o, s.n * 2); a = new Float32Array(s.n * 3);
        for (let i = 0; i < s.n; i++){ let x = v[i * 2] / 127, y = v[i * 2 + 1] / 127; let z = 1 - Math.abs(x) - Math.abs(y);
          if (z < 0){ const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1); }
          const l = Math.hypot(x, y, z) || 1; a[i * 3] = x / l; a[i * 3 + 1] = y / l; a[i * 3 + 2] = z / l; } }
      else if (s.t === 'i8k'){ const v = new Int8Array(buf, s.o, s.n); a = new Float32Array(s.n); for (let i = 0; i < s.n; i++) a[i] = v[i] * s.k; }
      else if (s.t === 'u8'){ const v = new Uint8Array(buf, s.o, s.n); a = new Float32Array(s.n); for (let i = 0; i < s.n; i++) a[i] = v[i] * s.k; }
      else if (s.t === 'raw8'){ a = new Uint8Array(buf, s.o, s.n); }
      else if (s.t === 'u16'){ a = new Uint16Array(buf.slice(s.o, s.o + s.n * 2)); }
      else if (s.t === 'vlq'){ const u8 = new Uint8Array(buf, s.o, s.b); a = new Uint16Array(s.n); let p = 0, prev = 0;
        for (let i = 0; i < s.n; i++){ let z = 0, sh = 0, b; do { b = u8[p++]; z |= (b & 127) << sh; sh += 7; } while (b & 128); prev += z & 1 ? -((z + 1) >> 1) : z >> 1; a[i] = prev; } }
      out[grp][nm] = a;
    }
  }
  out.info = H.info;
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
  $('stage').setAttribute('aria-label', 'Işıktan bir baş' + (own ? ', kendi yüzün (örnek biçim)' : '') + '. ' + (lit.length ? 'Yanan alanlar: ' + lit.join(', ') + '.' : 'Bütün alanlar sakin; başlangıç ölçüldü.') +
    (live.length ? ' Şu an akan: ' + live.join(', ') + '.' : '') + ` Gözler 20 saniyede ${D.blinks} kez kırpıyor.`);
}
function setState(k){
  stKey = k; const D = DAYS[KEY[k]];
  document.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.s === k));
  const day = $('day'); day.querySelector('span').textContent = D.label; day.classList.toggle('live', k === 'walk');
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
    const T = THREE;
  const tInit = performance.now();
  const DATA = unbake();
  const MESH = unmesh();
  const FL = FACELIB(MESH.VC, MESH.FI);
  const { V, N, VO, NO, CURV, RIM, FI, NF, CUT_F, CUT_B, CUT_SIDE, CUT_FADE, eyes, R_EYE, R_IRIS, sm, L3, nrmAt, attrAt } = FL;
  const tLib = performance.now();
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
  const RB = BAKED_OPT.band;

  /* ---------- yüz: ağın PN yüzeyinde önceden seçilmiş konumlar (üçgen + barisentrik); "kendi yüzün" aynı konumdan ---------- */
  const Fc = (() => {
    const n = DATA.face.f.length, nb = DATA.brow.f.length, tot = n + nb;
    const o = { pos: new Float32Array(tot * 3), pos2: new Float32Array(tot * 3), nor: new Float32Array(tot * 3), nor2: new Float32Array(tot * 3), cur: new Float32Array(tot), cov: new Float32Array(tot), line: new Float32Array(tot), dif: new Float32Array(tot) };
    const CF = FL.pnCoef(V, N), CO = FL.pnCoef(VO, NO), P = [0, 0, 0], Q = [0, 0, 0];
    let mxd = 1e-6;
    const put = (i, f, u, v, cur, cov, line, lift) => {
      FL.pnFast(CF, f, u, v, P, 0); FL.pnFast(CO, f, u, v, Q, 0);
      const n1 = nrmAt(N, f, u, v), n2 = nrmAt(NO, f, u, v);
      for (let d = 0; d < 3; d++){ o.pos[i * 3 + d] = P[d] + n1[d] * lift; o.pos2[i * 3 + d] = Q[d] + n2[d] * lift; o.nor[i * 3 + d] = n1[d]; o.nor2[i * 3 + d] = n2[d]; }
      o.cur[i] = cur; o.cov[i] = cov; o.line[i] = line;
      const df = Math.hypot(Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]); o.dif[i] = df; if (df > mxd) mxd = df;
    };
    for (let i = 0; i < n; i++){
      const f = DATA.face.f[i], u = DATA.face.u[i] / 255, v = DATA.face.v[i] / 255;
      // kenar bandı (≈1,9 cm): yüz tozu kafatası kabuğuna yavaşça devreder
      put(i, f, u, v, attrAt(CURV, f, u, v), 1 - sm(0.0, RB, attrAt(RIM, f, u, v)), 0, 0);
    }
    for (let j = 0; j < nb; j++) put(n + j, DATA.brow.f[j], DATA.brow.u[j] / 255, DATA.brow.v[j] / 255, DATA.brow.k[j], 0, 3, 0.004);
    for (let i = 0; i < tot; i++) o.dif[i] = Math.min(1, o.dif[i] / (mxd * 0.6));
    o.n = n; o.nb = nb; o.tot = tot;
    return o;
  })();
  const tF1 = performance.now();

  /* ---------- gözler: iris ve kapak gerçek kapak noktalarına göre; iki göz aynı hedefe bakar ---------- */
  const E = { pos: [], bl: [], lid: [], col: [], kind: [], size: [], nor: [], cen: [], off: [] };
  // kind: 0 iris, 1 üst kapak, 2 alt kapak, 3 göz akı, 5 ışık noktası, 6 kapak kıvrımı
  const TARGET = [camLocal[0], 0.1, camLocal[2]];
  // "kendi yüzün": her göz, kapak konturundaki köşe kaymalarının ortalaması kadar kayar
  const eyeOff = FL.EYES.map((e) => { const ids = [...e.up, ...e.lo]; const o = [0, 0, 0]; for (const i of ids) for (let d = 0; d < 3; d++) o[d] += (VO[i * 3 + d] - V[i * 3 + d]) / ids.length; return o; });
  const EYEC = [];
  function addEye(e, ei){
    const A = [e.A[0], e.A[1] - 0.003, e.A[2]];
    let g = [TARGET[0] - A[0], TARGET[1] - A[1], TARGET[2] - A[2]]; const gl = L3(...g); g = g.map((v) => v / gl);
    // göz küresi bakış yönünde açıklığın arkasında: iris, kameradan bakınca kapak açıklığının ortasına düşer
    const C = [0, 1, 2].map((d) => A[d] - g[d] * (R_EYE + 0.003)); EYEC.push(C);
    let u = [g[2], 0, -g[0]]; const ul = L3(...u); u = u.map((v) => v / ul);
    const v = [g[1] * u[2] - g[2] * u[1], g[2] * u[0] - g[0] * u[2], g[0] * u[1] - g[1] * u[0]];
    const rr = R_EYE + 0.002;
    const onBall = (ang, phi, rad) => { const s = Math.sin(ang), c = Math.cos(ang); const d = [0, 1, 2].map((i) => g[i] * c + (u[i] * Math.cos(phi) + v[i] * Math.sin(phi)) * s); return [0, 1, 2].map((i) => C[i] + d[i] * (rad || rr)); };
    const IR = Math.asin(R_IRIS / R_EYE);
    const off = eyeOff[ei];
    const push = (P, kind, col, size, P2) => { const L = e.toL(P); E.pos.push(...P); E.bl.push(...(P2 || P)); E.lid.push(L[1], e.lidU(L[0]), e.lidL(L[0])); E.col.push(...col); E.kind.push(kind); E.size.push(size); const n = [P[0] - C[0], P[1] - C[1], P[2] - C[2]]; const nl = L3(...n); E.nor.push(n[0] / nl, n[1] / nl, n[2] / nl); E.cen.push(...C); E.off.push(...off); };
    // iris: bebek kenarı yumuşak halka, lifler ortada en parlak; dış kenar (limbus) koyu kalır, parlayan halka yok
    for (let i = 0; i < 70; i++){ const phi = (i / 70) * 6.2832 + rnd() * 0.04; const rf2 = 0.43 + gauss() * 0.01; push(onBall(IR * rf2, phi), 0, [rf2, 0.5, 0], 0.9, null); }
    for (let i = 0; i < 560; i++){ const phi = Math.floor(rnd() * 52) / 52 * 6.2832 + gauss() * 0.025; const rf2 = 0.47 + rnd() * 0.45; const b = 0.3 + 0.45 * Math.sin(Math.PI * (rf2 - 0.47) / 0.45); push(onBall(IR * rf2, phi), 0, [rf2, b, 0], 0.8, null); }
    for (let i = 0; i < 110; i++){ const phi = (i / 110) * 6.2832 + rnd() * 0.05; const rf2 = 0.97 + gauss() * 0.01; push(onBall(IR * rf2, phi), 0, [1.2, 0.14, 0], 0.8, null); }
    // tek, küçük ışık noktası: ana ışığın geldiği yanda (sol üst)
    push(onBall(IR * 0.34, 2.3, rr + 0.003), 5, [1, 1, 0], 3.0, null);
    // göz akı: kapak içinde çok soluk, sıcak; iris kenarına yakın biraz daha belirgin
    for (let i = 0; i < 360; i++){ const t = rnd(); const ang = IR * (1.03 + t * 1.9); const phi = rnd() * 6.2832; push(onBall(ang, phi), 3, [0, 0.55 + 0.45 * Math.exp(-t * 4), 0], 0.95, null); }
    const f = e.f, ey = e.ey, X0 = e.X0, X1 = e.X1;
    const add = (P, d, k) => [P[0] + d[0] * k, P[1] + d[1] * k, P[2] + d[2] * k];
    for (let i = 0; i < 230; i++){
      const t = rnd(), lx = X0 + (X1 - X0) * t; const jt = gauss() * 0.0012;
      const edge = 1 - Math.pow(Math.abs(2 * t - 1), 4);
      const up = add(add(e.upP(lx), f, 0.004), ey, jt), lo = add(add(e.loP(lx), f, 0.008 + 0.006 * edge), ey, jt + 0.003);
      push(up, 1, [0, 0.15 + 0.6 * edge, 0], 0.9, lo);
      if (i % 3 === 0) push(add(add(e.loP(lx), f, 0.003), ey, jt - 0.001), 2, [0, 0.5, 0], 0.85, null);
    }
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

  /* ---------- iç: beş bölge yumuşak Gauss bulutu (merkez yoğun, kenar sıfıra söner) + içinde 2-3 ince, yavaş akan lif ---------- */
  const el = (x, y, z, a, b, c) => { const k0 = L3(x / a, y / b, z / c), k1 = L3(x / (a * a), y / (b * b), z / (c * c)); return k1 < 1e-9 ? -Math.min(a, b, c) : k0 * (k0 - 1) / k1; };
  const sdIn = (x, y, z) => { const ax = Math.abs(x); return Math.min(el(ax - 0.03, y - 0.47, z + 0.08, 0.53, 0.43, 0.72), el(ax - 0.32, y - 0.19, z - 0.05, 0.2, 0.16, 0.34)); };
  // Hareket: tepeden enseye uzanan şerit (sol yarıda, görünen yanda); yürürken adım dalgası bu yol boyunca akar
  const HPATH = (() => { const pts = []; for (let i = 0; i <= 40; i++){ const a = -0.2 + 1.55 * i / 40; // a: tepeden arkaya açı
    const dir = [0, Math.cos(a), -Math.sin(a)]; let lo = 0.05, hi = 1.2; const x = -0.13;
    for (let it = 0; it < 24; it++){ const r = (lo + hi) / 2; if (sdIn(x, 0.4 + dir[1] * r, -0.08 + dir[2] * r) < 0) lo = r; else hi = r; }
    const r = lo - 0.075; pts.push([x, 0.4 + dir[1] * r, -0.08 + dir[2] * r]); } return pts; })();
  const pathAt = (s) => { const q = Math.max(0, Math.min(HPATH.length - 1.0001, s * (HPATH.length - 1))); const a = Math.floor(q), t = q - a; return [0, 1, 2].map((d) => HPATH[a][d] + (HPATH[a + 1][d] - HPATH[a][d]) * t); };
  const REG = [
    { c: [-0.25, 0.1, 0.17], s: 0.08 },      // Göz: gözün arkası
    { c: [0.0, 0.7, 0.29], s: 0.112 },      // Dikkat: tepe-ön
    { c: [-0.37, 0.33, 0.03], s: 0.112 },   // Nefes: sol yan
    { c: [0.3, 0.52, 0.3], s: 0.112 },      // Ruh hâli: sağ ön-üst
    { c: pathAt(0.42), s: 0.07, path: true }, // Hareket: şerit
  ];
  const Bn = { pos: [], nor: [], reg: [], w: [], fold: [], kind: [], size: [], s: [] };
  // kind: 0 nötr kıvrım, 1 hale, 2 bulut, 3 lif
  const pushB = (p, n, reg, w, fold, kind, size, s) => { Bn.pos.push(p[0], p[1], p[2]); Bn.nor.push(n[0], n[1], n[2]); Bn.reg.push(reg); Bn.w.push(w); Bn.fold.push(fold); Bn.kind.push(kind); Bn.size.push(size); Bn.s.push(s); };
  { // nötr kıvrımlar (önceden üretilmiş); bölge bulutunun içinde kalanlar söner (lekenin içinde kanca çizgisi olmaz)
    const P = DATA.brain.pos, Nn = DATA.brain.nor, Fo = DATA.brain.fold, n = Fo.length;
    for (let i = 0; i < n; i++){
      const p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
      let reg = 5, w = 0;
      REG.forEach((R, r) => { let d2;
        if (R.path){ let m = 1e9; for (const q of HPATH){ const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < m) m = dd; } d2 = m; }
        else d2 = (p[0] - R.c[0]) ** 2 + (p[1] - R.c[1]) ** 2 + (p[2] - R.c[2]) ** 2;
        const ww = Math.exp(-d2 / (2 * (R.s * 1.5) ** 2)); if (ww > w){ w = ww; reg = r; } });
      pushB(p, [Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2]], reg, w, Fo[i], 0, 0, 0);
    }
  }
  REG.forEach((R, r) => {
    const NC = r === 0 ? 1100 : r === 4 ? 1500 : 1700;
    let k = 0, guard = 0;
    while (k < NC && guard++ < NC * 6){
      let p, rr;
      if (R.path){ const s = 0.04 + rnd() * 0.92; const c = pathAt(s); const g3 = [gauss(), gauss(), gauss()]; rr = Math.hypot(...g3) / 2.4; p = [c[0] + g3[0] * R.s * 1.1, c[1] + g3[1] * R.s, c[2] + g3[2] * R.s]; }
      else { const g3 = [gauss(), gauss(), gauss()]; rr = Math.hypot(...g3) / 2.4; p = [R.c[0] + g3[0] * R.s, R.c[1] + g3[1] * R.s, R.c[2] + g3[2] * R.s]; }
      if (rr > 1) continue;
      if (sdIn(p[0], p[1], p[2]) > 0.035) continue;
      // w: kenara doğru sıfıra sönen ağırlık (smoothstep 1 → 0,6)
      pushB(p, [0, 0, 1], r, 1 - sm(0.6, 1.0, rr), rr, 2, 0, rnd()); k++;
    }
    // lifler: bulutun içinden geçen ince, hafif kıvrık çizgiler
    const NF2 = R.path ? 2 : 3;
    for (let fI = 0; fI < NF2; fI++){
      let d1 = [gauss(), gauss() * 0.6, gauss()]; let l = L3(...d1); d1 = d1.map((q) => q / l);
      let d2 = [gauss(), gauss(), gauss()]; const dd = d2[0] * d1[0] + d2[1] * d1[1] + d2[2] * d1[2]; d2 = d2.map((q, i) => q - d1[i] * dd); l = L3(...d2); d2 = d2.map((q) => q / l);
      const o = [gauss() * 0.3, gauss() * 0.3, gauss() * 0.3], bend = 0.1 + rnd() * 0.18, ph = rnd();
      for (let i = 0; i < 150; i++){
        const t = i / 149, s = (t * 2 - 1);
        let p;
        if (R.path){ const c = pathAt(0.08 + 0.84 * t); p = [c[0] + d2[0] * 0.35 * R.s * Math.sin(t * 9 + fI * 2), c[1] + (fI ? 0.4 : -0.4) * R.s + d2[1] * 0.2 * R.s, c[2] + d2[2] * 0.35 * R.s * Math.sin(t * 9 + fI * 2)]; }
        else p = [0, 1, 2].map((q) => R.c[q] + R.s * (o[q] + d1[q] * s * 1.55 + d2[q] * (s * s - 0.35) * bend));
        pushB([p[0] + gauss() * 0.003, p[1] + gauss() * 0.003, p[2] + gauss() * 0.003], [0, 0, 1], r, Math.pow(Math.sin(Math.PI * t), 0.8), 0, 3, 0, t + ph);
      }
    }
    // hale: içeriden gelen ışığın yumuşak radyal parıltısı
    const hc = R.path ? pathAt(0.42) : R.c;
    pushB(hc, [0, 0, 1], r, 1, 0, 1, R.path ? 0.5 : R.s * 5.2, 0);
    pushB(hc, [0, 0, 1], r, 1, 0, 1, R.path ? 0.26 : R.s * 2.6, 0);
  });

  /* ---------- akışlar: yürüyüş (Hareket şeridi boyunca dalga) ve görme yolu (gözlerden arkaya) ---------- */
  const Fl = { pos: [], s: [], side: [], seed: [], mode: [] };
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1, 2].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
  for (let i = 0; i < 1700; i++){
    const s = rnd(); const p = pathAt(s); const j = 0.012 + 0.012 * Math.sin(3.1416 * s);
    Fl.pos.push(p[0] + gauss() * j * 1.4, p[1] + gauss() * j, p[2] + gauss() * j); Fl.s.push(s); Fl.side.push(0); Fl.seed.push(rnd()); Fl.mode.push(0);
  }
  EYEC.forEach((C, k) => {
    const sx = eyes[k].side;
    const P0 = [C[0] * 0.92, C[1] + 0.005, C[2] - 0.09], P1 = [sx * 0.1, 0.02, 0.34], P2 = [sx * 0.24, 0.26, -0.26], P3 = [sx * 0.15, 0.38, -0.68];
    for (let i = 0; i < 260; i++){ const t = rnd(); const p = bez(P0, P1, P2, P3, t); const j = 0.004 + 0.006 * t; Fl.pos.push(p[0] + gauss() * j, p[1] + gauss() * j, p[2] + gauss() * j); Fl.s.push(t); Fl.side.push(k); Fl.seed.push(rnd()); Fl.mode.push(1); }
  });

  /* ---------- malzemeler ---------- */
  const common = `
    uniform float uTime, uPx, uRef, uGain, uBreath, uReveal, uMorph, uDens;
    float cutAt(vec3 p){ return mix(${CUT_B.toFixed(4)}, ${CUT_F.toFixed(4)}, smoothstep(-0.3, 0.8, p.z)) + ${CUT_SIDE.toFixed(4)} * smoothstep(0.34, 0.7, abs(p.x)); }
    // yumuşak alt kesim: ışık kesimin ${CUT_FADE} üstünden başlayarak sıfıra söner (cetvel çizgisi yok, yan köşeler yuvarlak)
    float cutFade(vec3 p){ float c = cutAt(p); float t = smoothstep(c, c + ${CUT_FADE.toFixed(3)}, p.y); return t * t * (3.0 - 2.0 * t); }
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
  const V3 = () => new T.Vector3();
  // bölgeler kabuğun arkasında: önündeki kabuk noktaları yarı saydamlaşır ve bölgenin rengini hafifçe alır (ışık deriden süzülür)
  const regU = { uRV: { value: [0, 1, 2, 3, 4].map(V3) }, uRA: { value: [0, 0, 0, 0, 0] }, uRR: { value: [0.2, 0.2, 0.2, 0.2, 0.2] }, uRCol: { value: [0, 1, 2, 3, 4].map(() => new T.Color()) } };
  const shellMat = new T.ShaderMaterial(Object.assign({
    uniforms: U(Object.assign({ uKey: { value: new T.Vector3(-0.3, 0.5, 0.82).normalize() }, uColA: { value: new T.Color('#8fb4c8') }, uColR: { value: new T.Color('#d4f6fa') }, uWarm: { value: new T.Color('#ffc996') }, uWave: { value: 0 } }, regU)),
    vertexShader: common + `
      attribute float aCurv; attribute float aSeed; attribute float aHair; attribute float aLine; attribute float aCov; attribute float aFace; attribute float aDif;
      attribute vec3 aPos2; attribute vec3 aNor2;
      uniform vec3 uKey, uColA, uColR, uWarm; uniform float uWave;
      uniform vec3 uRV[5]; uniform float uRA[5]; uniform float uRR[5]; uniform vec3 uRCol[5];
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
        // kendi yüzüne geçiş: biçimi değişen noktalar geçiş boyunca kısa süre parlar (fark haritası)
        float wave = aFace * uWave * aDif;
        // bölge örtüsü
        float ra = 0.0; vec3 rc = vec3(0.0);
        for (int i = 0; i < 5; i++) {
          vec3 c = uRV[i];
          if (mv.z > c.z && uRA[i] > 0.001) {
            vec2 q = mv.xy * (c.z / mv.z) - c.xy;
            float a = exp(-dot(q, q) / (uRR[i] * uRR[i])) * uRA[i];
            ra += a; rc += uRCol[i] * a;
          }
        }
        float rcov = min(1.0, ra);
        if (aLine > 0.5) {
          // kaş vuruşları
          float vis = mix(0.15, 1.0, front);
          vA = 0.36 * aCurv * vis * mix(0.45, 1.0, fore) * uGain * rv * (0.94 + 0.06 * sin(uTime * 1.1 + aSeed * 30.0)) * (1.0 + 1.2 * wave) * cutFade(P0);
          vCol = mix(uColA, uColR, 0.55);
          vSoft = 0.35;
          gl_PointSize = uPx * 1.15 * (uRef / -mv.z);
          gl_Position = projectionMatrix * mv;
          return;
        }
        float ridge = smoothstep(5.0, 18.0, aCurv);
        float crease = smoothstep(4.0, 16.0, -aCurv);
        float fill = max(dot(n, normalize(vec3(0.3, 0.1, 0.95))), 0.0);
        float rimSide = 0.55 + 0.45 * smoothstep(-0.6, 0.5, abs(n.x) + 0.4 * n.y);
        float top = smoothstep(0.2, 1.0, P0.y) * smoothstep(-0.6, 0.2, P0.z);
        float faceZ = smoothstep(0.35, 0.7, P0.z) * smoothstep(0.32, 0.0, P0.y);
        float glass = 1.0 - smoothstep(0.3, 0.62, P0.z) * smoothstep(0.42, 0.12, P0.y);
        float key = pow(lam, 1.8);
        // sıcak yan ışık: sağdan ve biraz arkadan, yalnız sıyırarak gelen yüzeylerde
        float warm = pow(1.0 - clamp(abs(fc), 0.0, 1.0), 2.2) * smoothstep(-0.1, 0.7, n.x) * (0.6 + 0.4 * smoothstep(-0.5, 0.5, n.y));
        float baseT = 0.02 + 1.15 * key + 0.06 * fill;
        float rimT = (0.3 + 0.55 * fore + 0.45 * top) * rim * rimSide * 1.3 * (1.0 - 0.45 * faceZ);
        float ridgeT = (0.22 * ridge * (0.4 + key) + 0.1 * crease * (0.3 + key)) * (1.0 - 0.4 * faceZ);
        float I = baseT * mix(1.0, 0.22, glass) + rimT * mix(1.0, 0.85, glass) + ridgeT * mix(1.0, 0.5, glass);
        if (aFace > 0.5) {
          // yüz: gölgedeki yanak ve göz çukuru ~%25'e iner, ışık alan alın/burun sırtı/elmacık tam kalır; kameraya dik bakan düzlük soluk
          float sh = mix(0.25, 1.0, smoothstep(0.05, 0.6, lam));
          I = (0.06 + 1.6 * key + 0.06 * fill) * sh + rimT * 0.9 + ridgeT * 1.6;
          I *= mix(1.0, 0.8, smoothstep(0.8, 1.0, fc) * (1.0 - ridge));
          I *= mix(0.72, 1.0, max(ridge, crease));
        }
        I *= mix(0.08, 1.0, front);
        I *= mix(0.3, 1.0, fore);
        I *= 0.96 + 0.04 * sin(uTime * 1.3 + aSeed * 40.0);
        float wI = warm * (0.5 + 0.15 * aFace) * front;
        I += wave * 0.9;
        vA = (I + wI) * cutFade(P0) * uGain * 0.6 * (1.0 - 0.6 * aHair) * rv * (1.0 - aCov) * (1.0 - 0.5 * rcov);
        vCol = mix(uColA, uColR, clamp(rim * 1.2, 0.0, 1.0));
        vCol = mix(vCol, vec3(1.0, 0.95, 0.89), aFace * 0.45 * key * (1.0 - rim));
        vCol = mix(vCol, uWarm, wI / max(0.001, I + wI));
        vCol = mix(vCol, vec3(1.0, 0.93, 0.8), clamp(wave, 0.0, 1.0));
        if (ra > 0.001) vCol = mix(vCol, rc / ra, 0.35 * rcov);
        vSoft = mix(0.4, 0.7, aFace);
        vA *= uDens * mix(1.25, 1.0, aFace);
        float fsz = 1.08 + 0.5 * ridge + 0.3 * crease;
        gl_PointSize = uPx * mix(1.12, fsz, aFace) * (0.95 + 0.4 * rim) * (1.0 + 0.4 * wave) * (uRef / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: true }, ADD));
  const hairMat = new T.ShaderMaterial(Object.assign({
    uniforms: U(Object.assign({ uKey: shellMat.uniforms.uKey, uColA: { value: new T.Color('#9db3c6') }, uColR: { value: new T.Color('#e2f2f8') } }, regU)),
    vertexShader: common + `
      attribute float aCurv; attribute float aSeed; attribute vec3 aTan;
      uniform vec3 uKey, uColA, uColR;
      uniform vec3 uRV[5]; uniform float uRA[5]; uniform float uRR[5];
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
        vec3 hv = normalize(uKey + v);
        float th = dot(t, hv);
        float sheen = pow(sqrt(max(0.0, 1.0 - th * th)), 18.0);
        float fore = smoothstep(-0.95, 0.5, position.z);
        float I = (0.1 + 0.35 * key + 0.6 * sheen * (0.4 + key) + 0.4 * rim) * mix(0.35, 1.0, fore) * smoothstep(-0.2, 0.2, fc);
        I *= aCurv * (0.97 + 0.03 * sin(uTime * 0.8 + aSeed * 30.0));
        float ra = 0.0;
        for (int i = 0; i < 5; i++) { vec3 c = uRV[i]; if (mv.z > c.z) { vec2 q = mv.xy * (c.z / mv.z) - c.xy; ra += exp(-dot(q, q) / (uRR[i] * uRR[i])) * uRA[i]; } }
        vA = I * cutFade(position) * uGain * 0.3 * rv * uDens * (1.0 - 0.6 * min(1.0, ra));
        vCol = mix(uColA, uColR, clamp(rim + sheen * 0.5, 0.0, 1.0));
        vSoft = 0.35;
        gl_PointSize = uPx * 1.05 * (uRef / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: true }, ADD));
  const brainMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uProj: { value: 1 }, uInt: { value: [0, 0, 0, 0, 0] }, uHalo: { value: [0, 0, 0, 0, 0] }, uLit: { value: [0, 0, 0, 0, 0] },
      uCol: { value: [0, 1, 2, 3, 4].map(() => new T.Color()) }, uNeu: { value: new T.Color('#9fb3c4') }, uNeuI: { value: 1 }, uWalk: { value: 0 }, uCad: { value: 2 } }),
    vertexShader: common + `
      attribute float aReg; attribute float aSeed; attribute float aW; attribute float aFold; attribute float aKind; attribute float aSize; attribute float aS;
      uniform float uInt[5]; uniform float uHalo[5]; uniform float uLit[5]; uniform vec3 uCol[5]; uniform vec3 uNeu; uniform float uNeuI, uProj, uWalk, uCad;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        int r = int(aReg + 0.5);
        float I = 0.0, H = 0.0, lit = 0.0; vec3 rc = uNeu;
        for (int i = 0; i < 5; i++) if (i == r) { I = uInt[i]; H = uHalo[i]; lit = uLit[i]; rc = uCol[i]; }
        float rv = revealAt(aSeed, 0.35);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dz = -mv.z;
        float beat = r == 2 ? 0.9 + 0.1 * uBreath : 1.0;
        vec3 regCol = mix(uNeu, rc, 0.12 + 0.88 * lit);
        if (aKind < 0.5) {
          // nötr kıvrımlar: soluk; bir bölge bulutunun içinde kalanlar söner
          vec3 n = normalize(normalMatrix * normal);
          float fc = dot(n, normalize(-mv.xyz));
          float rim = pow(1.0 - clamp(abs(fc), 0.0, 1.0), 2.0) * (0.35 + 0.65 * smoothstep(-0.75, -0.15, normal.y));
          float back = smoothstep(0.15, -0.35, fc);
          float farH = mix(1.0, 0.45, smoothstep(0.02, 0.3, position.x));
          float low = mix(0.45, 1.0, smoothstep(0.08, 0.3, position.y));
          float w = r < 5 ? aW : 0.0;
          vA = (0.06 + 0.42 * aFold + 0.2 * rim) * uNeuI * mix(1.0, 0.4, back) * farH * low * (1.0 - 0.75 * w * lit) * uGain * rv;
          vCol = mix(uNeu, regCol, 0.5 * w * lit);
          vSoft = 0.25;
          gl_PointSize = uPx * (1.0 + 0.3 * aFold) * (uRef / dz);
        } else if (aKind < 1.5) {
          // hale: içeriden gelen ışık
          vA = H * beat * mix(0.035, 0.3, lit) * I * uGain * rv;
          vCol = regCol; vSoft = 1.0;
          gl_PointSize = aSize * uProj / dz;
        } else if (aKind < 2.5) {
          // bulut: merkez yoğun ve sıcak beyaza yakın, kenar sıfıra söner
          float tw = mix(1.0, 0.85 + 0.15 * sin(uTime * 1.7 + aSeed * 40.0), lit);
          vA = aW * I * mix(0.07, 0.55, lit) * tw * beat * uGain * rv;
          vCol = mix(regCol, vec3(1.0, 0.97, 0.93), lit * 0.2 * (1.0 - smoothstep(0.0, 0.45, aFold)));
          vSoft = 0.6;
          gl_PointSize = uPx * (1.05 + 0.5 * lit * (1.0 - aFold)) * (uRef / dz);
        } else {
          // lif: ince, yavaş akan ışık
          float ph = fract(aS * 1.3 - uTime * 0.11);
          float crest = pow(0.5 + 0.5 * cos(ph * 6.2832), 6.0);
          vA = aW * I * mix(0.05, 0.22 + 0.32 * crest, lit) * uGain * rv;
          vCol = mix(regCol, vec3(1.0), lit * 0.3 * crest);
          vSoft = 0.6;
          gl_PointSize = uPx * (0.95 + 0.5 * crest * lit) * (uRef / dz);
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
          float ph = fract((aS / 0.8 - uTime) * uCad);
          float crest = pow(0.5 + 0.5 * cos(ph * 6.2832), 3.0);
          float ends = smoothstep(0.0, 0.1, aS) * smoothstep(1.0, 0.85, aS);
          I = uWalk * ends * (0.7 + 1.3 * crest);
          col = mix(uColW, uHotW, crest * 0.35); sz = 1.25 + 0.8 * crest;
        } else {
          float hd = uPulse * 1.2 - 0.1;
          float g = uPulse >= 0.0 ? exp(-pow((aS - hd) / 0.07, 2.0)) : 0.0;
          I = uOpt * (0.45 + g * 1.2) * (0.55 + 0.45 * smoothstep(0.0, 0.25, aS));
          col = mix(uColO, vec3(1.0), g * 0.3); sz = 0.85 + 0.8 * g;
        }
        I *= 0.92 + 0.08 * sin(uTime * 5.0 + aSeed * 40.0);
        vA = I * uGain * 0.5 * revealAt(aSeed, 0.4);
        vCol = col; vSoft = 0.3;
        gl_PointSize = uPx * sz * (uRef / dz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: fragDot, depthTest: false }, ADD));
  const eyeMat = new T.ShaderMaterial(Object.assign({
    uniforms: U({ uBlink: { value: 0 }, uSac: { value: new T.Vector2() }, uI1: { value: new T.Color('#19c2d1') }, uI2: { value: new T.Color('#3e7bfa') }, uLid: { value: new T.Color('#d7f1f6') }, uScl: { value: new T.Color('#f4e4d4') }, uHi: { value: new T.Color('#fff8ee') }, uEyeI: { value: 1 } }),
    vertexShader: common + `
      attribute vec3 aBl; attribute vec3 aLid; attribute vec3 aCol; attribute float aKind; attribute float aSize; attribute vec3 aNor; attribute vec3 aCen; attribute vec3 aOff;
      uniform float uBlink, uEyeI; uniform vec2 uSac; uniform vec3 uI1, uI2, uLid, uScl, uHi;
      varying vec3 vCol; varying float vA; varying float vSoft;
      void main(){
        float k = aKind;
        vec3 p = mix(position, aBl, (k > 0.5 && k < 1.5) || k > 5.5 ? uBlink : 0.0);
        if (k < 0.5 || (k > 4.5 && k < 5.5)) {
          // mikro sakkad: iris göz merkezinde birkaç derece döner
          vec3 q = p - aCen;
          float cy = cos(uSac.x), sy = sin(uSac.x), cx = cos(uSac.y), sx = sin(uSac.y);
          q = vec3(cy * q.x + sy * q.z, q.y, -sy * q.x + cy * q.z);
          q = vec3(q.x, cx * q.y - sx * q.z, sx * q.y + cx * q.z);
          p = aCen + q;
        }
        p += aOff * uMorph;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dz = -mv.z;
        float up = mix(aLid.y, aLid.z + 0.002, uBlink);
        float vis = smoothstep(up + 0.003, up - 0.002, aLid.x) * smoothstep(aLid.z - 0.003, aLid.z + 0.002, aLid.x);
        // üst kapağın gölgesi: kapağın hemen altı (iris ve göz akı) yumuşakça kararır
        float lidSh = mix(0.42, 1.0, smoothstep(up - 0.002, up - 0.02, aLid.x));
        float a = 0.0; vec3 col = uLid; float sz = aSize;
        vec3 nv = normalize(normalMatrix * aNor);
        // iki göz eşit: uzaktaki göz en çok %15 sönük
        float fc = mix(0.85, 1.0, smoothstep(-0.1, 0.35, dot(nv, normalize(-mv.xyz))));
        float glow = max(0.0, uEyeI - 1.0);
        if (k < 0.5) {
          col = mix(uI1, uI2, smoothstep(0.35, 1.05, aCol.x));
          col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, 0.7);
          a = (0.24 + 0.62 * aCol.y) * vis * lidSh * min(uEyeI, 1.0) * (1.0 + 0.8 * glow); sz *= 1.0 + 0.6 * glow;
        }
        else if (k < 1.5) { a = 0.95 * aCol.y * min(uEyeI, 1.0); }
        else if (k < 2.5) { a = 0.05 * (1.0 - uBlink * 0.6); }
        else if (k < 3.5) { col = uScl; a = 0.2 * aCol.y * vis * lidSh; sz *= 1.15; }
        else if (k < 5.5) { col = uHi; a = vis * 0.9; }
        else { a = 0.4 * aCol.y * min(uEyeI, 1.0); }
        vA = a * uGain * 0.8 * fc * revealAt(0.5, 0.3);
        vCol = col; vSoft = k > 4.5 && k < 5.5 ? 0.55 : 0.0;
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
  const withDelta = (pos, dl) => { const o = new Float32Array(pos); for (let i = 0; i < dl.length; i++) o[i] += dl[i]; return o; };
  const eyeGeo = geo({ position: [E.pos, 3], aBl: [E.bl, 3], aLid: [E.lid, 3], aCol: [E.col, 3], aKind: [E.kind, 1], aSize: [E.size, 1], aNor: [E.nor, 3], aCen: [E.cen, 3], aOff: [E.off, 3] });
  const flowGeo = geo({ position: [Fl.pos, 3], aS: [Fl.s, 1], aSide: [Fl.side, 1], aSeed: [Fl.seed, 1], aMode: [Fl.mode, 1] });
  // etiket çapaları: Göz → sol irisin dış-alt kenarı; öbürleri bölge merkezi (Hareket: şeridin tepesi)
  const RA_C = REG.map((R) => R.path ? pathAt(0.2) : R.c);
  let ready = false, revealT0 = -1, info = {};
  function build(D){
    const objs = [];
    const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(D.mask.pos, 3));
    mg.setAttribute('aPos2', new T.BufferAttribute(withDelta(D.mask.pos, D.mask.dl), 3));
    mg.setIndex(new T.BufferAttribute(D.mask.idx, 1));
    objs.push(new T.Mesh(mg, maskMat));
    // yüz maskesi: kanonik ağın kendisi, normal boyunca içeri alınmış (göz açıklığı hariç); göz küresi maskesi
    { const IN = 0.02, mp = new Float32Array(V.length), mp2 = new Float32Array(V.length);
      for (let i = 0; i < V.length; i++){ mp[i] = V[i] - N[i] * IN; mp2[i] = VO[i] - NO[i] * IN; }
      const ix = []; for (let f = 0; f < NF; f++) if (!FL.aperture[f]) ix.push(FI[f * 3], FI[f * 3 + 1], FI[f * 3 + 2]);
      const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(mp, 3)); fg.setAttribute('aPos2', new T.BufferAttribute(mp2, 3)); fg.setIndex(ix);
      objs.push(new T.Mesh(fg, maskMat));
      EYEC.forEach((C, k) => { const sg = new T.SphereGeometry(R_EYE - 0.014, 20, 14); sg.translate(C[0], C[1], C[2]); const p2 = sg.getAttribute('position').clone(); const o = eyeOff[k];
        for (let i = 0; i < p2.count; i++) p2.setXYZ(i, p2.getX(i) + o[0], p2.getY(i) + o[1], p2.getZ(i) + o[2]); sg.setAttribute('aPos2', p2); objs.push(new T.Mesh(sg, maskMat)); });
    }
    const NMASK = objs.length;
    // kafatası ve ense: saç (4 bit) + yüz örtüsü (4 bit) tek baytta
    const ns = D.shell.cur.length, hm = new Float32Array(ns), cov = new Float32Array(ns);
    for (let i = 0; i < ns; i++){ hm[i] = (D.shell.hc[i] >> 4) / 15; cov[i] = (D.shell.hc[i] & 15) / 15; }
    objs.push(new T.Points(geo({ position: [D.shell.pos, 3], normal: [D.shell.nor, 3], aPos2: [withDelta(D.shell.pos, D.shell.dl), 3], aNor2: [D.shell.nor, 3], aCurv: [D.shell.cur, 1], aSeed: [seeds(ns), 1], aHair: [hm, 1], aLine: [new Float32Array(ns), 1], aCov: [cov, 1], aFace: [new Float32Array(ns), 1], aDif: [new Float32Array(ns), 1] }), shellMat));
    const nf = Fc.tot;
    objs.push(new T.Points(geo({ position: [Fc.pos, 3], normal: [Fc.nor, 3], aPos2: [Fc.pos2, 3], aNor2: [Fc.nor2, 3], aCurv: [Fc.cur, 1], aSeed: [seeds(nf), 1], aHair: [new Float32Array(nf), 1], aLine: [Fc.line, 1], aCov: [Fc.cov, 1], aFace: [new Float32Array(nf).fill(1), 1], aDif: [Fc.dif, 1] }), shellMat));
    objs.push(new T.Points(geo({ position: [D.hair.pos, 3], normal: [D.hair.nor, 3], aTan: [D.hair.tan, 3], aCurv: [D.hair.cur, 1], aSeed: [D.hair.seed, 1] }), hairMat));
    const nb = Bn.reg.length;
    objs.push(new T.Points(geo({ position: [Bn.pos, 3], normal: [Bn.nor, 3], aReg: [Bn.reg, 1], aW: [Bn.w, 1], aFold: [Bn.fold, 1], aSeed: [seeds(nb), 1], aKind: [Bn.kind, 1], aSize: [Bn.size, 1], aS: [Bn.s, 1] }), brainMat));
    objs.push(new T.Points(flowGeo, flowMat));
    objs.push(new T.Points(eyeGeo, eyeMat));
    objs.forEach((o, i) => { o.frustumCulled = false; o.renderOrder = i; head.add(o); });
    const HIDE = qs.get('hide') || ''; const o = (i) => objs[NMASK + i];
    if (HIDE.includes('brain')){ o(3).visible = false; o(4).visible = false; } if (HIDE.includes('hair')) o(2).visible = false;
    if (HIDE.includes('skull')) o(0).visible = false; if (HIDE.includes('face')) o(1).visible = false; if (HIDE.includes('mask')) for (let i = 0; i < NMASK; i++) objs[i].visible = false;
    info = Object.assign({}, D.info, { faceDust: Fc.n, brow: Fc.nb, inner: nb, eye: E.kind.length, flow: Fl.s.length, total: ns + nf + D.hair.cur.length + nb + E.kind.length + Fl.s.length });
    info.initMs = Math.round(performance.now() - tInit); info.libMs = Math.round(tLib - tInit); info.faceMs = Math.round(tF1 - tLib);
    GL.info = info;
    if (DBG === 'perf'){ const pe = document.createElement('div'); pe.className = 'perf'; pe.textContent = `açılış ${info.initMs} ms · ${Math.round(info.total / 1000)} bin nokta`; stage.appendChild(pe); GL.perfEl = pe; }
    ready = true; revealT0 = time;
    stage.classList.add('ready');
    layoutMeasure();
    draw();
  }

  /* ---------- tema: sahne iki temada da koyu (açık temada koyu kart); ters çevirme yok ---------- */
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function applyTheme(){
    renderer.setClearColor(new T.Color(css('--stage-bg') || '#070c12'), 1);
    AREAS.forEach((k, i) => { brainMat.uniforms.uCol.value[i].set(css('--s-' + k) || '#ffffff'); regU.uRCol.value[i].set(css('--s-' + k) || '#ffffff'); });
    draw();
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- boyut / kamera: baş, üstte etiket payı ve altta anahtar payı bırakarak sahneye oturur ---------- */
  let W = 1, H = 1;
  let baseYaw = YAW, basePitch = -0.02;
  const DBGA = { front: 0, side: Math.PI / 2, back: Math.PI, top: 0, face: 0 }[DBG];
  if (DBGA !== undefined) baseYaw = DBGA;
  if (qs.get('byaw')) baseYaw = parseFloat(qs.get('byaw'));
  const HEAD_TOP = 1.03, HEAD_BOT = CUT_F + 0.04, HEAD_W = 1.5;
  function resize(){
    const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    const top = H < 300 ? 26 : 34, bot = H < 300 ? 34 : 40;
    const s = Math.min((H - top - bot) / (HEAD_TOP - HEAD_BOT), W * 0.8 / HEAD_W);   // piksel / baş birimi
    let halfH = H / 2 / s;
    let CY = HEAD_TOP + top / s - halfH;
    if (DBG === 'face'){ halfH = 0.5; CY = 0.05; } else if (DBG && DBG !== 'perf'){ halfH = 1.4; CY = 0.27; }
    cam.fov = 2 * Math.atan(halfH / CAMD) * 180 / Math.PI;
    cam.position.set(0, DBG === 'top' ? 6 : CY + (CAMY - 0.27), CAMD); cam.lookAt(0, CY, 0);
    cam.updateProjectionMatrix();
    const proj = H * dpr / (2 * Math.tan(cam.fov * Math.PI / 360));
    // küçük sahnede aynı nokta sayısı daha sık düşer: yüzey koyulaşmasın diye nokta ışığı ölçekle birlikte azalır
    const dens = Math.max(0.62, Math.min(1, Math.pow(s / 205, 1.2)));
    for (const m of mats){ m.uniforms.uPx.value = dpr * Math.min(1.25, Math.max(0.85, s / 200)); m.uniforms.uRef.value = CAMD; m.uniforms.uDens.value = dens; }
    brainMat.uniforms.uProj.value = proj;
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
      let I = 1, Hh = st === 'up' ? 1 : st === 'live' ? 0.6 : 0.5;
      // seçim: up olmayan bölge renklenmez; yalnız nötr ışıkla öne çıkar
      if (sel){ if (sel === k){ if (st !== 'up'){ I = 3.2; Hh = 1.2; } } else { I *= 0.16; Hh *= 0.08; lit *= 0.5; } }
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
      l.classList.add('on'); l.classList.toggle('lit', s.lit); l.classList.toggle('live', s.live); l.classList.toggle('dim', !s.lit && !s.live); l.classList.toggle('fade', !s.on);
      LN[i].style.opacity = s.on ? (s.lit || s.live ? 0.7 : 0.32) : 0.08; LD[i].style.opacity = s.on ? (s.lit || s.live ? 1 : 0.5) : 0.1;
      LN[i].setAttribute('stroke', s.lit || s.live ? `var(--l-${AREAS[i]})` : 'var(--st-ink-2)'); LD[i].setAttribute('fill', s.lit || s.live ? `var(--l-${AREAS[i]})` : 'var(--st-ink-2)');
    });
  }

  /* ---------- etiketler: sabit yuvalar (sol: Hareket, Nefes, Göz; sağ: Dikkat, Ruh hâli); çizgiler kesişmez, yüzün içinde etiket yok ---------- */
  const vtmp = new T.Vector3();
  function proj(p){ vtmp.set(p[0], p[1], p[2]).applyMatrix4(head.matrixWorld).project(cam); return [(vtmp.x * 0.5 + 0.5) * W, (-vtmp.y * 0.5 + 0.5) * H]; }
  const LW = [60, 60, 60, 60, 60], LH = 24;
  function layoutMeasure(){ LB.forEach((l, i) => { LW[i] = l.offsetWidth || LW[i]; }); }
  // yuva: [etiket merkezinin x oranı (kenara sıkıştırılır), y oranı]
  const SLOT = [[0, 0.7], [0.78, 0.075], [0, 0.4], [1, 0.33], [0, 0.085]];
  const boxes = SLOT.map(() => ({ x: 0, y: 0, ax: 0, ay: 0 }));
  const last = SLOT.map(() => [NaN, NaN, NaN, NaN]);
  function eyeAnchor(){ const C = EYEC[0], e = eyes[0]; const m = morph.v; return [C[0] + eyeOff[0][0] * m - 0.042, C[1] - 0.03, C[2] + 0.1]; }
  function layoutLabels(){
    const pad = W < 340 ? 6 : 10;
    for (let i = 0; i < 5; i++){
      const A = proj(i === 0 ? eyeAnchor() : RA_C[i]);
      const b = boxes[i]; b.ax = A[0]; b.ay = A[1];
      b.x = Math.max(pad + LW[i] / 2, Math.min(W - pad - LW[i] / 2, SLOT[i][0] * W)); b.y = Math.max(LH / 2 + 6, Math.min(H - LH / 2 - 44, SLOT[i][1] * H + LH / 2));
    }
    for (let i = 0; i < 5; i++){
      const b = boxes[i], L = last[i];
      if (Math.abs(b.x - L[0]) < 0.5 && Math.abs(b.y - L[1]) < 0.5 && Math.abs(b.ax - L[2]) < 0.5 && Math.abs(b.ay - L[3]) < 0.5) continue;
      L[0] = b.x; L[1] = b.y; L[2] = b.ax; L[3] = b.ay;
      LB[i].style.transform = `translate(${(b.x - LW[i] / 2).toFixed(1)}px,${(b.y - LH / 2).toFixed(1)}px)`;
      // çizgi etiketin en yakın kenarından çıkar
      let ex = b.x + (b.ax > b.x ? 1 : -1) * LW[i] / 2, ey = b.y;
      if (Math.abs(b.ax - b.x) < LW[i] / 2 + 4){ ex = Math.max(b.x - LW[i] / 2 + 10, Math.min(b.x + LW[i] / 2 - 10, b.ax)); ey = b.y + (b.ay > b.y ? 1 : -1) * LH / 2; }
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
  const rvTmp = new T.Vector3();
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
      if (sac.next <= 0){ sac.tx = (rnd() - 0.5) * 0.03; sac.ty = (rnd() - 0.5) * 0.02; sac.next = 0.9 + rnd() * 1.8; }
      const ks = Math.min(1, dt * 28); sac.x += (sac.tx - sac.x) * ks; sac.y += (sac.ty - sac.y) * ks;
    }
    // yüz biçimi geçişi (morph, 1,2 sn): değişen noktalar geçiş boyunca hafifçe parlar
    const MT = 1.2;
    const mp = still ? 1 : Math.min(1, (time - morph.t0) / MT);
    morph.v = morph.from + (morph.to - morph.from) * ease(mp);
    const wv = still || mp >= 1 ? 0 : Math.pow(Math.sin(Math.PI * mp), 0.8);
    shellMat.uniforms.uMorph.value = morph.v; shellMat.uniforms.uWave.value = wv * (morph.to > morph.from ? 1 : 0.6);
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
    // bölge örtüsü: merkezler görüş uzayında; yalnız yanan (up) bölgeler kabuğu saydamlaştırır
    const mvm = new T.Matrix4().multiplyMatrices(cam.matrixWorldInverse, head.matrixWorld);
    for (let i = 0; i < 5; i++){ rvTmp.set(...RA_C[i]).applyMatrix4(mvm); regU.uRV.value[i].copy(rvTmp); regU.uRA.value[i] = cur.lit[i] * Math.min(1, cur.int[i]) * (i === 4 ? 0.5 : 1); regU.uRR.value[i] = REG[i].s * (i === 4 ? 1.6 : 1.3); }
    flowMat.uniforms.uWalk.value = cur.walk; flowMat.uniforms.uCad.value = cadence; flowMat.uniforms.uOpt.value = cur.opt;
    flowMat.uniforms.uPulse.value = still ? 0.55 : Math.min(1.3, (time - pulseT) / 1.0);
    eyeMat.uniforms.uBlink.value = blink; eyeMat.uniforms.uEyeI.value = cur.eye; eyeMat.uniforms.uSac.value.set(sac.x, sac.y);
    if (ready) renderer.render(scene, cam);
    layoutLabels();
    if (hDot){ if (stKey === 'walk' && !still){ const ph = (time * cadence) % 1; hDot.style.transform = `scale(${(1 + 0.45 * Math.exp(-ph * 6)).toFixed(3)})`; } else hDot.style.transform = ''; }
  }
  let fpsN = 0, fpsT = 0;
  function loop(now){ if (running && visible){ frame(now, false); if (GL.perfEl){ fpsN++; if (now - fpsT > 1000){ GL.perfEl.textContent = `açılış ${info.initMs} ms · ${Math.round(info.total / 1000)} bin nokta · ${Math.round(fpsN * 1000 / (now - fpsT))} fps`; fpsN = 0; fpsT = now; } } } requestAnimationFrame(loop); }
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
    // inceleme: her bölge bulutunun ekrandaki yayılımı (px, ağırlıklı RMS yarıçap) ve toplam ağırlık
    regStats(){ return REG.map((R, r) => { let sw = 0, sx = 0, sy = 0; const P = [];
      for (let i = 0; i < Bn.kind.length; i++) if (Bn.kind[i] === 2 && Bn.reg[i] === r){ const q = proj([Bn.pos[i * 3], Bn.pos[i * 3 + 1], Bn.pos[i * 3 + 2]]); P.push([q[0], q[1], Bn.w[i]]); sw += Bn.w[i]; sx += q[0] * Bn.w[i]; sy += q[1] * Bn.w[i]; }
      sx /= sw; sy /= sw; let v = 0; for (const q of P) v += q[2] * ((q[0] - sx) ** 2 + (q[1] - sy) ** 2); return { r: AREAS[r], px: +Math.sqrt(v / sw).toFixed(1), w: Math.round(sw) }; }); },
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
/* sahne kendi ince WebGL katmanıyla çizilir (dış betik yok). WebGL yoksa sahne yerine kısa bir not görünür,
   sayfanın geri kalanı (Nef, çipler, ayrıntı) çalışır. */
try { initGL(); GL.onFace(true); GL.onState(); } catch (e) { document.getElementById('app').classList.add('nogl'); GL = null; console.warn(e); }
})();
