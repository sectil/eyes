/* ================= ince WebGL katmanı =================
   Bu sahne three.js'in yalnız küçük bir parçasını kullanır (nokta ve maske ağları, ShaderMaterial, perspektif kamera).
   Aynı arayüzü taşıyan bu ~200 satırlık katman sayesinde sayfa dış betik indirmez: ağ kopsa da sahne açılır, iPhone'da
   600 KB'lık kitaplık ayrıştırılmaz. Yalnız burada kullanılan özellikler vardır. */
const THREE = (function(){
  class Vector2 { constructor(x = 0, y = 0){ this.x = x; this.y = y; } set(x, y){ this.x = x; this.y = y; return this; } }
  class Vector3 {
    constructor(x = 0, y = 0, z = 0){ this.x = x; this.y = y; this.z = z; }
    set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }
    copy(v){ this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    normalize(){ const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
    applyMatrix4(m){ const e = m.elements, x = this.x, y = this.y, z = this.z; const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w; this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w; this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w; return this; }
    project(cam){ return this.applyMatrix4(cam.matrixWorldInverse).applyMatrix4(cam.projectionMatrix); }
  }
  class Color {
    constructor(c){ this.r = 1; this.g = 1; this.b = 1; if (c !== undefined) this.set(c); }
    set(c){ const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c).trim()); if (!m) return this;
      let h = m[1]; if (h.length === 3) h = h.split('').map((q) => q + q).join(''); const n = parseInt(h, 16);
      this.r = (n >> 16 & 255) / 255; this.g = (n >> 8 & 255) / 255; this.b = (n & 255) / 255; return this; }
  }
  class Matrix4 {
    constructor(){ this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    multiplyMatrices(a, b){ const A = a.elements, B = b.elements, o = new Float32Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = A[r] * B[c * 4] + A[4 + r] * B[c * 4 + 1] + A[8 + r] * B[c * 4 + 2] + A[12 + r] * B[c * 4 + 3];
      this.elements = o; return this; }
  }
  class Object3D {
    constructor(){ this.children = []; this.visible = true; this.renderOrder = 0; this.frustumCulled = true; this.matrixWorld = new Matrix4();
      const self = this; this.rotation = { x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; } }; this.scale = { x: 1, y: 1, z: 1, set(x, y, z){ this.x = x; this.y = y; this.z = z; } }; }
    add(o){ this.children.push(o); o.parent = this; }
    // dönüş sırası YXZ (three.js ile aynı), ölçek, öteleme yok
    updateMatrixWorld(){ const r = this.rotation, s = this.scale, e = this.matrixWorld.elements;
      const a = Math.cos(r.x), b = Math.sin(r.x), c = Math.cos(r.y), d = Math.sin(r.y), ee = Math.cos(r.z), f = Math.sin(r.z);
      const ce = c * ee, cf = c * f, de = d * ee, df = d * f;
      e[0] = (ce + df * b) * s.x; e[4] = (de * b - cf) * s.y; e[8] = a * d * s.z;
      e[1] = a * f * s.x; e[5] = a * ee * s.y; e[9] = -b * s.z;
      e[2] = (cf * b - de) * s.x; e[6] = (df + ce * b) * s.y; e[10] = a * c * s.z;
      e[3] = e[7] = e[11] = e[12] = e[13] = e[14] = 0; e[15] = 1; }
  }
  class Group extends Object3D {}
  class Scene extends Object3D {}
  class PerspectiveCamera {
    constructor(fov, aspect, near, far){ this.fov = fov; this.aspect = aspect; this.near = near; this.far = far; this.position = new Vector3(); this.projectionMatrix = new Matrix4(); this.matrixWorldInverse = new Matrix4(); this._t = [0, 0, -1]; }
    lookAt(x, y, z){ this._t = [x, y, z]; this._view(); }
    _view(){ const p = this.position, t = this._t; let zx = p.x - t[0], zy = p.y - t[1], zz = p.z - t[2]; let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
      let xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xz /= l;   // x = yukarı × z
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      const e = this.matrixWorldInverse.elements;
      e[0] = xx; e[4] = xy; e[8] = xz; e[12] = -(xx * p.x + xy * p.y + xz * p.z);
      e[1] = yx; e[5] = yy; e[9] = yz; e[13] = -(yx * p.x + yy * p.y + yz * p.z);
      e[2] = zx; e[6] = zy; e[10] = zz; e[14] = -(zx * p.x + zy * p.y + zz * p.z);
      e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1; }
    updateProjectionMatrix(){ const f = 1 / Math.tan(this.fov * Math.PI / 360), n = this.near, fa = this.far, e = this.projectionMatrix.elements;
      e.fill(0); e[0] = f / this.aspect; e[5] = f; e[10] = (fa + n) / (n - fa); e[11] = -1; e[14] = 2 * fa * n / (n - fa); this._view(); }
  }
  class BufferAttribute {
    constructor(array, itemSize){ this.array = array; this.itemSize = itemSize; this.count = array.length / itemSize; this.v = 0; }
    clone(){ return new BufferAttribute(this.array.slice(), this.itemSize); }
    getX(i){ return this.array[i * this.itemSize]; } getY(i){ return this.array[i * this.itemSize + 1]; } getZ(i){ return this.array[i * this.itemSize + 2]; }
    setXYZ(i, x, y, z){ const o = i * this.itemSize; this.array[o] = x; this.array[o + 1] = y; this.array[o + 2] = z; this.v++; }
  }
  class BufferGeometry {
    constructor(){ this.attributes = {}; this.index = null; }
    setAttribute(n, a){ this.attributes[n] = a; return this; }
    getAttribute(n){ return this.attributes[n]; }
    setIndex(ix){ this.index = ix instanceof BufferAttribute ? ix : new BufferAttribute(Uint16Array.from(ix), 1); return this; }
  }
  class SphereGeometry extends BufferGeometry {
    constructor(r, ws, hs){ super(); const p = [], ix = [];
      for (let j = 0; j <= hs; j++){ const v = j / hs; for (let i = 0; i <= ws; i++){ const u = i / ws; p.push(-r * Math.cos(u * 2 * Math.PI) * Math.sin(v * Math.PI), r * Math.cos(v * Math.PI), r * Math.sin(u * 2 * Math.PI) * Math.sin(v * Math.PI)); } }
      for (let j = 0; j < hs; j++) for (let i = 0; i < ws; i++){ const a = j * (ws + 1) + i, b = a + ws + 1; ix.push(a, b, a + 1, b, b + 1, a + 1); }
      this.setAttribute('position', new BufferAttribute(new Float32Array(p), 3)); this.setIndex(ix); }
    translate(x, y, z){ const a = this.attributes.position; for (let i = 0; i < a.count; i++) a.setXYZ(i, a.getX(i) + x, a.getY(i) + y, a.getZ(i) + z); return this; }
  }
  class ShaderMaterial { constructor(o){ Object.assign(this, { depthTest: true, depthWrite: true, colorWrite: true, blending: 0 }, o); } }
  class Points extends Object3D { constructor(g, m){ super(); this.geometry = g; this.material = m; this.isPoints = true; } }
  class Mesh extends Object3D { constructor(g, m){ super(); this.geometry = g; this.material = m; } }

  class WebGLRenderer {
    constructor(o){
      const gl = o.canvas.getContext('webgl', { antialias: false, alpha: false, depth: true, premultipliedAlpha: false, powerPreference: o.powerPreference || 'default' });
      if (!gl) throw new Error('webgl yok');
      this.gl = gl; this.canvas = o.canvas; this.pr = 1; this.clear = [0, 0, 0];
      this.info = {};
    }
    setPixelRatio(p){ this.pr = p; }
    setSize(w, h){ this.canvas.width = Math.round(w * this.pr); this.canvas.height = Math.round(h * this.pr); }
    setClearColor(c){ this.clear = [c.r, c.g, c.b]; }
    _prog(m){
      if (m._p) return m._p;
      const gl = this.gl;
      const head = 'precision highp float;\nprecision highp int;\n';
      const vs = head + 'uniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat3 normalMatrix;\nattribute vec3 position;\n' + (/\bnormal\b/.test(m.vertexShader) ? 'attribute vec3 normal;\n' : '') + m.vertexShader;
      const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, head + m.fragmentShader));
      gl.bindAttribLocation(p, 0, 'position'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = [], n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++){ const a = gl.getActiveUniform(p, i); U.push({ name: a.name.replace(/\[0\]$/, ''), type: a.type, size: a.size, loc: gl.getUniformLocation(p, a.name) }); }
      const A = {}, na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
      for (let i = 0; i < na; i++){ const a = gl.getActiveAttrib(p, i); A[a.name] = gl.getAttribLocation(p, a.name); }
      return (m._p = { p, U, A });
    }
    render(scene, cam){
      const gl = this.gl; gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(this.clear[0], this.clear[1], this.clear[2], 1); gl.depthMask(true); gl.colorMask(true, true, true, true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.depthFunc(gl.LEQUAL);
      const list = []; const walk = (o) => { for (const c of o.children){ if (c.geometry) list.push(c); walk(c); } }; walk(scene);
      list.sort((a, b) => a.renderOrder - b.renderOrder);
      const mv = new Matrix4(), nm = new Float32Array(9);
      let enabled = new Set();
      for (const o of list){
        if (!o.visible) continue;
        const m = o.material, P = this._prog(m); gl.useProgram(P.p);
        mv.multiplyMatrices(cam.matrixWorldInverse, o.parent.matrixWorld);
        const e = mv.elements;
        // normal matrisi: üst 3×3'ün ters devriği
        const a00 = e[0], a01 = e[1], a02 = e[2], a10 = e[4], a11 = e[5], a12 = e[6], a20 = e[8], a21 = e[9], a22 = e[10];
        const b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20; const id = 1 / (a00 * b01 + a01 * b11 + a02 * b21);
        const inv = [b01 * id, (-a22 * a01 + a02 * a21) * id, (a12 * a01 - a02 * a11) * id, b11 * id, (a22 * a00 - a02 * a20) * id, (-a12 * a00 + a02 * a10) * id, b21 * id, (-a21 * a00 + a01 * a20) * id, (a11 * a00 - a01 * a10) * id];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) nm[c * 3 + r] = inv[r * 3 + c];
        for (const u of P.U){
          if (u.name === 'modelViewMatrix'){ gl.uniformMatrix4fv(u.loc, false, e); continue; }
          if (u.name === 'projectionMatrix'){ gl.uniformMatrix4fv(u.loc, false, cam.projectionMatrix.elements); continue; }
          if (u.name === 'normalMatrix'){ gl.uniformMatrix3fv(u.loc, false, nm); continue; }
          const src = m.uniforms[u.name]; if (!src) continue; const v = src.value;
          if (u.type === gl.FLOAT){ if (u.size > 1) gl.uniform1fv(u.loc, v); else gl.uniform1f(u.loc, v); }
          else if (u.type === gl.FLOAT_VEC2) gl.uniform2f(u.loc, v.x, v.y);
          else if (u.type === gl.FLOAT_VEC3){
            if (u.size > 1){ const f = new Float32Array(u.size * 3); v.forEach((q, i) => { if ('r' in q){ f[i * 3] = q.r; f[i * 3 + 1] = q.g; f[i * 3 + 2] = q.b; } else { f[i * 3] = q.x; f[i * 3 + 1] = q.y; f[i * 3 + 2] = q.z; } }); gl.uniform3fv(u.loc, f); }
            else if ('r' in v) gl.uniform3f(u.loc, v.r, v.g, v.b); else gl.uniform3f(u.loc, v.x, v.y, v.z);
          }
        }
        const g = o.geometry, now = new Set();
        for (const name in P.A){
          const loc = P.A[name], at = g.attributes[name]; if (loc < 0 || !at) continue;
          if (!at._b || at._v !== at.v){ if (!at._b) at._b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, at._b); gl.bufferData(gl.ARRAY_BUFFER, at.array instanceof Float32Array ? at.array : new Float32Array(at.array), gl.STATIC_DRAW); at._v = at.v; }
          gl.bindBuffer(gl.ARRAY_BUFFER, at._b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, at.itemSize, gl.FLOAT, false, 0, 0); now.add(loc);
        }
        for (const l of enabled) if (!now.has(l)) gl.disableVertexAttribArray(l);
        enabled = now;
        if (m.depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
        gl.depthMask(!!m.depthWrite);
        const cw = m.colorWrite !== false; gl.colorMask(cw, cw, cw, cw);
        if (m.blending === 2){ gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); } else gl.disable(gl.BLEND);
        if (o.isPoints) gl.drawArrays(gl.POINTS, 0, g.attributes.position.count);
        else { const ix = g.index; if (!ix._b){ ix._b = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix._b); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ix.array instanceof Uint16Array ? ix.array : Uint16Array.from(ix.array), gl.STATIC_DRAW); }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix._b); gl.drawElements(gl.TRIANGLES, ix.count, gl.UNSIGNED_SHORT, 0); }
      }
    }
  }
  return { Vector2, Vector3, Color, Matrix4, Group, Scene, PerspectiveCamera, BufferAttribute, BufferGeometry, SphereGeometry, ShaderMaterial, Points, Mesh, WebGLRenderer, AdditiveBlending: 2, DoubleSide: 2 };
})();
