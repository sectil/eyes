// Fark Ettin mi? maket sahne motoru (yalnız maket; uygulama kodu değil). Dikey ekrana göre: yükseklik 844 birim.
// Katmanlar: gök → uzak silüet → bina sırası → kaldırım (kişiler, ağaç, lamba, bisiklet) → yol (arabalar) → ön kaldırım.
/* eslint-disable */
(function () {
  const H = 844
  const Y = { side: 572, curb: 632, road: 640, lane: 712, roadEnd: 788 }
  function rng(seed) {
    let a = seed >>> 0
    return () => {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const PAL = {
    day: {
      sky: ['#BFE0EE', '#E6F1F2', '#F6EEDC'], far: '#B9CCD6', far2: '#A9BFCB', cloud: '#FFFFFF',
      facades: ['#E9D8BF', '#DDBFA9', '#C7D5DB', '#E6CF9F', '#D3CADF', '#D2DBC4', '#EBD3C6'],
      glass: ['#A9CBDB', '#7FA7BD'], frame: '#F7F3EA', sideA: '#C9C3B6', sideB: '#B3AC9E', tile: 'rgba(90,80,60,.10)',
      curb: '#9F9A90', road: '#4C525A', road2: '#454B53', dash: '#EDE6D2', near: '#BDB6A9', shadow: 'rgba(28,36,48,.16)',
      sign: '#24292F', signInk: '#F6F1E6', lampOn: '#FFE7A8', lampGlow: 0, winLit: 0, tree: ['#4C9A61', '#3F8653', '#6DB57B'],
    },
    dusk: {
      sky: ['#20345A', '#4A4F7C', '#E39C7A'], far: '#3B4A6B', far2: '#33405E', cloud: '#F3B7A2',
      facades: ['#8C7F7A', '#7E6E6E', '#6E7886', '#8D7E66', '#7A7390', '#738070', '#8E7470'],
      glass: ['#3A4C66', '#2C3A50'], frame: '#C9C2B8', sideA: '#77736E', sideB: '#66625D', tile: 'rgba(0,0,0,.14)',
      curb: '#6E6A65', road: '#30343B', road2: '#2B2F35', dash: '#CFC8B6', near: '#7D776E', shadow: 'rgba(0,0,0,.25)',
      sign: '#1A1D22', signInk: '#FFE6B0', lampOn: '#FFD27A', lampGlow: 1, winLit: 0.45, tree: ['#35624A', '#2C5440', '#467A5A'],
    },
  }
  const C = {
    kirmizi: '#E0474C', mavi: '#3A74F0', sari: '#F3BF3A', yesil: '#2E9E63', mor: '#8A66E6', turuncu: '#EE8735',
    siyah: '#2A2E33', beyaz: '#F4F2EE', gri: '#9BA1A8', lacivert: '#2C3E66', bordo: '#8E2F3A', krem: '#EADFC8',
  }
  const SKIN = ['#F3CDAA', '#E2AE86', '#C78B60', '#94603F', '#6E4430']
  const HAIR = { kahve: '#5E3F28', siyah: '#1F1E21', kizil: '#B4552C', gri: '#B9BCBF', sari: '#E3C36A' }
  const f = (n) => Math.round(n * 10) / 10

  // ---------- parçalar ----------
  function sky(L, p) {
    let o = `<defs><linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
      <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.glass[0]}"/><stop offset="1" stop-color="${p.glass[1]}"/></linearGradient>
      <linearGradient id="g-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.road}"/><stop offset="1" stop-color="${p.road2}"/></linearGradient>
      <radialGradient id="g-glow"><stop offset="0" stop-color="${p.lampOn}" stop-opacity=".55"/><stop offset="1" stop-color="${p.lampOn}" stop-opacity="0"/></radialGradient>
      <linearGradient id="g-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
      <linearGradient id="g-aw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    </defs>`
    o += `<rect width="${L}" height="${Y.side}" fill="url(#g-sky)"/>`
    return o
  }
  function clouds(L, r, p) {
    let o = ''
    for (let x = 60; x < L; x += 380 + r() * 260) {
      const y = 70 + r() * 90, s = 0.7 + r() * 0.6
      o += `<g opacity="${p === PAL.dusk ? 0.35 : 0.9}" fill="${p.cloud}"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(46 * s)}" ry="${f(16 * s)}"/><ellipse cx="${f(x + 30 * s)}" cy="${f(y - 10 * s)}" rx="${f(30 * s)}" ry="${f(18 * s)}"/><ellipse cx="${f(x - 26 * s)}" cy="${f(y - 4 * s)}" rx="${f(22 * s)}" ry="${f(12 * s)}"/></g>`
    }
    return o
  }
  function skyline(L, r, p) {
    let o = '', x = -20
    while (x < L) {
      const w = 60 + r() * 90, h = 120 + r() * 170
      o += `<rect x="${f(x)}" y="${f(Y.side - 150 - h)}" width="${f(w)}" height="${f(h + 150)}" fill="${r() < 0.5 ? p.far : p.far2}"/>`
      if (r() < 0.25) o += `<rect x="${f(x + w / 2 - 2)}" y="${f(Y.side - 150 - h - 26)}" width="4" height="26" fill="${p.far2}"/>`
      x += w + 6 + r() * 20
    }
    return o
  }
  function windowEl(x, y, w, h, p, lit) {
    let o = `<rect x="${f(x - 3)}" y="${f(y - 3)}" width="${f(w + 6)}" height="${f(h + 6)}" rx="2" fill="${p.frame}"/>`
    o += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${lit ? '#F6CF7E' : 'url(#g-glass)'}"/>`
    if (!lit) o += `<path d="M${f(x + w * 0.15)} ${f(y + h)}L${f(x + w * 0.65)} ${f(y)}L${f(x + w * 0.85)} ${f(y)}L${f(x + w * 0.35)} ${f(y + h)}Z" fill="#fff" opacity=".22"/>`
    o += `<rect x="${f(x + w / 2 - 1)}" y="${f(y)}" width="2" height="${f(h)}" fill="${p.frame}"/>`
    o += `<rect x="${f(x - 6)}" y="${f(y + h + 3)}" width="${f(w + 12)}" height="5" rx="1.5" fill="${p.frame}" opacity=".9"/>`
    return o
  }
  function building(b, p, r) {
    const top = Y.side - b.h, x = b.x, w = b.w
    let o = `<g>`
    o += `<rect x="${x}" y="${f(top)}" width="${w}" height="${f(b.h)}" fill="${b.body}"/>`
    o += `<rect x="${x}" y="${f(top)}" width="${w}" height="${f(b.h)}" fill="url(#g-shade)"/>`
    o += `<rect x="${x - 4}" y="${f(top - 10)}" width="${w + 8}" height="12" rx="2" fill="${p.frame}" opacity=".85"/>`
    // katlar
    const floors = Math.floor((b.h - 176) / 84)
    const cols = Math.max(2, Math.floor((w - 30) / 62))
    const gap = (w - cols * 36) / (cols + 1)
    for (let fl = 0; fl < floors; fl++) {
      const wy = top + 26 + fl * 84
      for (let c = 0; c < cols; c++) {
        const wx = x + gap + c * (36 + gap)
        o += windowEl(wx, wy, 36, 50, p, p.winLit && r() < p.winLit)
      }
      if (b.balcony && fl === floors - 1) o += `<rect x="${f(x + gap - 8)}" y="${f(wy + 52)}" width="${f(w - 2 * gap + 16)}" height="4" fill="${p.sign}" opacity=".7"/>` + Array.from({ length: Math.floor((w - 2 * gap) / 10) }, (_, i) => `<rect x="${f(x + gap - 6 + i * 10)}" y="${f(wy + 56)}" width="2" height="18" fill="${p.sign}" opacity=".55"/>`).join('') + `<rect x="${f(x + gap - 8)}" y="${f(wy + 74)}" width="${f(w - 2 * gap + 16)}" height="3" fill="${p.sign}" opacity=".7"/>`
      o += `<rect x="${x}" y="${f(wy + 74)}" width="${w}" height="2" fill="#000" opacity=".05"/>`
    }
    // dükkân katı
    const gy = Y.side - 150
    o += `<rect x="${x}" y="${gy}" width="${w}" height="150" fill="${b.body}"/><rect x="${x}" y="${gy}" width="${w}" height="150" fill="#000" opacity=".06"/>`
    // tabela
    o += `<rect x="${x + 12}" y="${gy + 2}" width="${w - 24}" height="26" rx="4" fill="${p.sign}"/>`
    o += `<text x="${x + w / 2}" y="${gy + 20}" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.6" fill="${p.signInk}">${b.shop}</text>`
    // tente (yamuk, çizgili)
    const aw = C[b.aw], ay = gy + 32
    o += `<path d="M${x + 6} ${ay}L${x + w - 6} ${ay}L${x + w + 2} ${ay + 24}L${x - 2} ${ay + 24}Z" fill="${aw}"/>`
    for (let sx = x + 6; sx < x + w - 14; sx += 22) o += `<path d="M${sx + 11} ${ay}L${sx + 22} ${ay}L${f(sx + 22 + ((sx + 16 - x) / w - 0.5) * 8)} ${ay + 24}L${f(sx + 11 + ((sx + 16 - x) / w - 0.5) * 8)} ${ay + 24}Z" fill="#fff" opacity=".42"/>`
    o += `<path d="M${x + 6} ${ay}L${x + w - 6} ${ay}L${x + w + 2} ${ay + 24}L${x - 2} ${ay + 24}Z" fill="url(#g-aw)"/>`
    for (let sx = x - 2; sx < x + w; sx += 12) o += `<circle cx="${sx + 6}" cy="${ay + 24}" r="6" fill="${aw}"/>`
    o += `<rect x="${x - 2}" y="${ay + 24}" width="${w + 4}" height="10" fill="#000" opacity=".08"/>`
    // vitrin ve kapı
    const vw = w - 74
    o += `<rect x="${x + 12}" y="${ay + 36}" width="${vw}" height="${Y.side - ay - 44}" rx="3" fill="${p.frame}"/>`
    o += `<rect x="${x + 16}" y="${ay + 40}" width="${vw - 8}" height="${Y.side - ay - 52}" fill="url(#g-glass)" opacity=".95"/>`
    o += `<path d="M${x + 22} ${Y.side - 12}L${x + 60} ${ay + 40}L${x + 74} ${ay + 40}L${x + 36} ${Y.side - 12}Z" fill="#fff" opacity=".2"/>`
    o += goods(b.shop, x + 16, Y.side - 12, vw - 8)
    o += `<rect x="${x + w - 52}" y="${ay + 34}" width="40" height="${Y.side - ay - 34}" rx="3" fill="${p.frame}"/><rect x="${x + w - 48}" y="${ay + 38}" width="32" height="${Y.side - ay - 38}" fill="#5B4636"/><rect x="${x + w - 44}" y="${ay + 44}" width="24" height="34" fill="url(#g-glass)" opacity=".6"/><circle cx="${x + w - 22}" cy="${Y.side - 40}" r="2.2" fill="#E7C46A"/>`
    o += `</g>`
    return o
  }
  function goods(shop, x, base, w) {
    let o = ''
    const n = Math.floor(w / 20)
    const col = { FIRIN: ['#C88A45', '#E2B06A'], PASTANE: ['#F1B9C8', '#F6E0B5'], 'ÇİÇEKÇİ': ['#E0474C', '#F3BF3A', '#8A66E6'], MANAV: ['#E0474C', '#F3BF3A', '#7FB24E'], KAFE: ['#7A5640', '#EADFC8'], 'KİTAPÇI': ['#3A74F0', '#E0474C', '#2E9E63', '#F3BF3A'], BERBER: ['#E0474C', '#3A74F0'], KUYUMCU: ['#E8C45C'], TERZİ: ['#2C3E66', '#8E2F3A', '#EADFC8'] }[shop] || ['#ccc']
    o += `<rect x="${x + 4}" y="${base - 14}" width="${w - 8}" height="6" fill="#000" opacity=".12"/>`
    for (let i = 0; i < n; i++) {
      const c = col[i % col.length], cx = x + 10 + i * 20
      if (shop === 'KİTAPÇI') o += `<rect x="${cx - 5}" y="${base - 40}" width="9" height="26" fill="${c}"/>`
      else if (shop === 'TERZİ') o += `<path d="M${cx - 6} ${base - 44}L${cx + 6} ${base - 44}L${cx + 8} ${base - 16}L${cx - 8} ${base - 16}Z" fill="${c}"/>`
      else if (shop === 'KUYUMCU') o += `<circle cx="${cx}" cy="${base - 24}" r="5" fill="none" stroke="${c}" stroke-width="2.5"/>`
      else o += `<circle cx="${cx}" cy="${base - 20}" r="6.5" fill="${c}"/>`
    }
    return o
  }
  function tree(x, p) {
    const t = p.tree, y = Y.side + 8
    return `<g><ellipse cx="${x}" cy="${y + 4}" rx="34" ry="7" fill="#000" opacity=".12"/><rect x="${x - 16}" y="${y - 2}" width="32" height="8" rx="2" fill="#6E6A62"/><path d="M${x - 5} ${y}L${x - 4} ${y - 200}L${x + 4} ${y - 200}L${x + 6} ${y}Z" fill="#6B4A31"/><g transform="translate(0 -96)"><circle cx="${x - 26}" cy="${y - 128}" r="34" fill="${t[1]}"/><circle cx="${x + 24}" cy="${y - 124}" r="36" fill="${t[1]}"/><circle cx="${x}" cy="${y - 156}" r="40" fill="${t[0]}"/><circle cx="${x - 30}" cy="${y - 110}" r="26" fill="${t[0]}"/><circle cx="${x + 30}" cy="${y - 108}" r="26" fill="${t[0]}"/><circle cx="${x - 12}" cy="${y - 170}" r="18" fill="${t[2]}" opacity=".7"/><circle cx="${x + 20}" cy="${y - 146}" r="12" fill="${t[2]}" opacity=".55"/></g></g>`
  }
  function lamp(x, p) {
    const y = Y.side + 40
    let o = `<g>`
    if (p.lampGlow) o += `<circle cx="${x + 26}" cy="${y - 214}" r="70" fill="url(#g-glow)"/><ellipse cx="${x + 26}" cy="${y - 4}" rx="60" ry="10" fill="${p.lampOn}" opacity=".18"/>`
    o += `<rect x="${x - 3}" y="${y - 220}" width="6" height="220" fill="#353B43"/><rect x="${x - 7}" y="${y - 8}" width="14" height="10" rx="2" fill="#353B43"/><path d="M${x} ${y - 220}Q${x} ${y - 236} ${x + 18} ${y - 230}L${x + 26} ${y - 226}" stroke="#353B43" stroke-width="5" fill="none"/><path d="M${x + 14} ${y - 226}L${x + 38} ${y - 226}L${x + 34} ${y - 214}L${x + 18} ${y - 214}Z" fill="#353B43"/><rect x="${x + 19}" y="${y - 215}" width="14" height="4" rx="2" fill="${p.lampOn}"/></g>`
    return o
  }
  // Yürüyen kişi: adım pozu (ph 0..1). s ölçek. Ayaklar y'de.
  function person(q, p, extra = '') {
    const s = q.s || 1, x = q.x, y = q.y || Y.side + 30, k = (v) => f(v * s)
    const top = C[q.top] || q.top, skin = q.skin, hair = HAIR[q.hair] || q.hair, pants = q.pants || '#3B4656'
    const dir = q.dir || 1
    let o = `<g class="walker"${extra} transform="translate(${f(x)} ${f(y)}) scale(${dir} 1)">`
    o += `<ellipse cx="0" cy="2" rx="${k(20)}" ry="${k(4)}" fill="#000" opacity=".14"/>`
    // bacaklar
    const leg = (a, col) => `<g transform="rotate(${a} 0 ${k(-60)})"><rect x="${k(-4.5)}" y="${k(-60)}" width="${k(9)}" height="${k(56)}" rx="${k(4)}" fill="${col}"/><rect x="${k(-5)}" y="${k(-7)}" width="${k(15)}" height="${k(7)}" rx="${k(3)}" fill="#2A2522"/></g>`
    o += `<g class="leg-b">${leg(-14, q.dress ? skin : pants)}</g>`
    o += `<g class="leg-f">${leg(16, q.dress ? skin : pants)}</g>`
    // gövde
    if (q.dress) o += `<path d="M${k(-12)} ${k(-104)}L${k(12)} ${k(-104)}L${k(21)} ${k(-50)}L${k(-21)} ${k(-50)}Z" fill="${top}"/><path d="M${k(4)} ${k(-104)}L${k(12)} ${k(-104)}L${k(21)} ${k(-50)}L${k(10)} ${k(-50)}Z" fill="#000" opacity=".1"/>`
    else o += `<rect x="${k(-13)}" y="${k(-106)}" width="${k(26)}" height="${k(50)}" rx="${k(8)}" fill="${top}"/><rect x="${k(4)}" y="${k(-106)}" width="${k(9)}" height="${k(50)}" rx="${k(5)}" fill="#000" opacity=".1"/>`
    // kollar
    o += `<g transform="rotate(18 0 ${k(-100)})"><rect x="${k(-4)}" y="${k(-102)}" width="${k(8)}" height="${k(44)}" rx="${k(4)}" fill="${q.dress ? skin : top}"/><circle cx="0" cy="${k(-58)}" r="${k(4.5)}" fill="${skin}"/></g>`
    if (q.bag) o += `<path d="M${k(-6)} ${k(-102)}L${k(-16)} ${k(-66)}" stroke="#2A2E33" stroke-width="${k(1.6)}"/><rect x="${k(-26)}" y="${k(-70)}" width="${k(18)}" height="${k(16)}" rx="${k(3)}" fill="${C[q.bag]}"/><rect x="${k(-26)}" y="${k(-70)}" width="${k(18)}" height="${k(4)}" rx="${k(2)}" fill="#000" opacity=".15"/>`
    o += `<g transform="rotate(-20 0 ${k(-100)})"><rect x="${k(-4)}" y="${k(-102)}" width="${k(8)}" height="${k(44)}" rx="${k(4)}" fill="${q.dress ? skin : top}"/><circle cx="0" cy="${k(-58)}" r="${k(4.5)}" fill="${skin}"/></g>`
    if (q.phone) o += `<rect x="${k(10)}" y="${k(-96)}" width="${k(6)}" height="${k(11)}" rx="${k(1.5)}" fill="#1d1d1f"/>`
    // baş
    o += `<rect x="${k(-4)}" y="${k(-114)}" width="${k(8)}" height="${k(10)}" fill="${skin}"/>`
    if (q.longHair) o += `<path d="M${k(-12)} ${k(-128)}Q${k(-15)} ${k(-100)} ${k(-8)} ${k(-96)}L${k(8)} ${k(-96)}Q${k(14)} ${k(-104)} ${k(12)} ${k(-128)}Z" fill="${hair}"/>`
    o += `<circle cx="0" cy="${k(-126)}" r="${k(13)}" fill="${skin}"/>`
    o += `<path d="M${k(-13.5)} ${k(-127)}Q${k(-12)} ${k(-144)} ${k(2)} ${k(-142)}Q${k(14)} ${k(-140)} ${k(13.5)} ${k(-126)}Q${k(6)} ${k(-134)} ${k(-4)} ${k(-131)}Q${k(-10)} ${k(-129)} ${k(-13.5)} ${k(-127)}Z" fill="${hair}"/>`
    o += q.laugh ? `<path d="M${k(3)} ${k(-126)}Q${k(6)} ${k(-129)} ${k(9)} ${k(-126)}" stroke="#1d1d1f" stroke-width="${k(1.4)}" fill="none" stroke-linecap="round"/>` : `<circle cx="${k(6)}" cy="${k(-125)}" r="${k(1.5)}" fill="#1d1d1f"/>`
    if (q.laugh) o += `<path d="M${k(2)} ${k(-119)}Q${k(8)} ${k(-110)} ${k(13)} ${k(-119)}Z" fill="#7A1F2B"/><path d="M${k(16)} ${k(-134)}l${k(5)} ${k(-4)}M${k(17)} ${k(-126)}l${k(6)} 0" stroke="${'#2A2E33'}" stroke-width="${k(1.6)}" stroke-linecap="round" opacity=".6"/>`
    else o += `<path d="M${k(5)} ${k(-117)}Q${k(8)} ${k(-115.5)} ${k(11)} ${k(-117.5)}" stroke="#6A3A30" stroke-width="${k(1.2)}" fill="none"/>`
    if (q.hat) o += `<rect x="${k(-17)}" y="${k(-140)}" width="${k(34)}" height="${k(5)}" rx="${k(2.5)}" fill="${C[q.hat]}"/><rect x="${k(-11)}" y="${k(-154)}" width="${k(22)}" height="${k(15)}" rx="${k(4)}" fill="${C[q.hat]}"/><rect x="${k(-11)}" y="${k(-144)}" width="${k(22)}" height="${k(3)}" fill="#000" opacity=".2"/>`
    if (q.glasses) o += `<circle cx="${k(6)}" cy="${k(-125)}" r="${k(4)}" fill="none" stroke="#1d1d1f" stroke-width="${k(1.4)}"/>`
    o += `</g>`
    return o
  }
  function car(k, p, lane) {
    const s = 1.05, x = k.x, y = lane === 'far' ? Y.road + 52 : Y.road + 118
    const col = C[k.color] || k.color
    let o = `<g class="car" transform="translate(${f(x)} ${y}) scale(${(k.dir || 1) * s} ${s})">`
    o += `<ellipse cx="0" cy="2" rx="86" ry="8" fill="#000" opacity=".22"/>`
    o += `<path d="M-84 -14Q-86 -34 -70 -38L-46 -42Q-30 -66 -6 -68L30 -68Q46 -66 58 -44L76 -40Q88 -36 86 -14Z" fill="${col}"/>`
    o += `<path d="M-84 -26L86 -26L86 -14L-84 -14Z" fill="#000" opacity=".12"/>`
    o += `<path d="M-38 -44Q-26 -62 -8 -62L-8 -44Z" fill="url(#g-glass)"/><path d="M-2 -62L28 -62Q40 -60 50 -44L-2 -44Z" fill="url(#g-glass)"/>`
    o += `<rect x="-6" y="-44" width="2" height="30" fill="#000" opacity=".18"/>`
    o += `<rect x="80" y="-34" width="7" height="6" rx="2" fill="${p.lampGlow ? '#FFF2C4' : '#F4E7BE'}"/><rect x="-86" y="-32" width="6" height="6" rx="2" fill="#C8333A"/>`
    if (k.taxi) o += `<rect x="-14" y="-80" width="30" height="12" rx="3" fill="#24292F"/><text x="1" y="-71" transform="scale(${k.dir || 1} 1)" text-anchor="middle" font-size="8" font-weight="800" fill="${C.sari}" font-family="Onest, system-ui">TAKSİ</text><rect x="-60" y="-24" width="120" height="5" fill="#24292F" opacity=".75"/>`
    for (const wx of [-52, 54]) o += `<circle cx="${wx}" cy="-12" r="17" fill="#1C1E21"/><circle cx="${wx}" cy="-12" r="8" fill="#A9AFB6"/><circle cx="${wx}" cy="-12" r="3" fill="#5D646C"/>`
    o += `</g>`
    return o
  }
  function bike(b) {
    const x = b.x, y = Y.side + 58, col = C[b.color]
    return `<g><ellipse cx="${x}" cy="${y + 2}" rx="34" ry="4" fill="#000" opacity=".12"/><circle cx="${x - 22}" cy="${y - 16}" r="16" fill="none" stroke="#24292F" stroke-width="3.5"/><circle cx="${x + 22}" cy="${y - 16}" r="16" fill="none" stroke="#24292F" stroke-width="3.5"/><path d="M${x - 22} ${y - 16}L${x - 4} ${y - 40}L${x + 16} ${y - 40}L${x + 22} ${y - 16}M${x - 4} ${y - 40}L${x} ${y - 16}L${x + 16} ${y - 40}M${x - 22} ${y - 16}L${x} ${y - 16}" stroke="${col}" stroke-width="4.5" fill="none" stroke-linejoin="round"/><path d="M${x + 16} ${y - 40}L${x + 18} ${y - 50}L${x + 26} ${y - 50}" stroke="#24292F" stroke-width="3" fill="none"/><rect x="${x - 12}" y="${y - 47}" width="16" height="5" rx="2.5" fill="#24292F"/></g>`
  }
  function cat(t) {
    const x = t.x, y = Y.side + 54, c = { siyah: '#2A2E33', turuncu: '#E08A3C', gri: '#9AA0A6', beyaz: '#F2F2F2' }[t.color]
    return `<g><ellipse cx="${x}" cy="${y + 1}" rx="18" ry="3.5" fill="#000" opacity=".14"/><path d="M${x - 12} ${y}Q${x - 16} ${y - 26} ${x} ${y - 28}Q${x + 12} ${y - 26} ${x + 10} ${y}Z" fill="${c}"/><circle cx="${x + 2}" cy="${y - 34}" r="10" fill="${c}"/><path d="M${x - 6} ${y - 40}L${x - 6} ${y - 50}L${x} ${y - 43}ZM${x + 4} ${y - 43}L${x + 10} ${y - 50}L${x + 11} ${y - 39}Z" fill="${c}"/><path d="M${x - 11} ${y - 2}Q${x - 30} ${y - 4} ${x - 26} ${y - 22}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x + 5}" cy="${y - 35}" r="1.5" fill="#1d1d1f"/></g>`
  }
  function vendor(v, p) {
    const x = v.x, y = Y.side + 52
    let goodsS = ''
    if (v.type === 'simit') for (let i = 0; i < 4; i++) goodsS += `<circle cx="${x - 24 + i * 16}" cy="${y - 62}" r="7" fill="none" stroke="#B9762F" stroke-width="5"/>`
    if (v.type === 'misir') for (let i = 0; i < 5; i++) goodsS += `<rect x="${x - 28 + i * 12}" y="${y - 74}" width="8" height="20" rx="4" fill="#F2C94C"/>`
    if (v.type === 'kestane') for (let i = 0; i < 8; i++) goodsS += `<circle cx="${x - 24 + (i % 4) * 16}" cy="${y - 62 + Math.floor(i / 4) * 7}" r="5.5" fill="#7A4A2A"/>`
    if (v.type === 'cicek') for (let i = 0; i < 5; i++) goodsS += `<circle cx="${x - 28 + i * 14}" cy="${y - 64}" r="7" fill="${['#E0474C', '#F3BF3A', '#8A66E6', '#EE8735', '#F1B9C8'][i]}"/>`
    return `<g><ellipse cx="${x}" cy="${y + 2}" rx="46" ry="5" fill="#000" opacity=".14"/><path d="M${x - 2} ${y - 56}L${x - 2} ${y - 150}" stroke="#8A8F95" stroke-width="3"/><path d="M${x - 60} ${y - 136}Q${x - 2} ${y - 176} ${x + 56} ${y - 136}Z" fill="#E0474C"/><path d="M${x - 30} ${y - 148}Q${x - 2} ${y - 176} ${x + 26} ${y - 148}L${x + 10} ${y - 136}L${x - 14} ${y - 136}Z" fill="#fff" opacity=".45"/><rect x="${x - 40}" y="${y - 56}" width="80" height="34" rx="4" fill="#B8332F"/><rect x="${x - 40}" y="${y - 56}" width="80" height="6" fill="#000" opacity=".18"/>${goodsS}<circle cx="${x - 24}" cy="${y - 10}" r="11" fill="#24292F"/><circle cx="${x + 24}" cy="${y - 10}" r="11" fill="#24292F"/><circle cx="${x - 24}" cy="${y - 10}" r="4" fill="#9AA0A6"/><circle cx="${x + 24}" cy="${y - 10}" r="4" fill="#9AA0A6"/></g>` +
      person({ x: x + 62, y: Y.side + 34, s: 0.98, top: 'beyaz', skin: '#C78B60', hair: 'gri', dir: -1 }, p)
  }
  function ground(L, p) {
    let o = `<rect y="${Y.side}" width="${L}" height="${Y.curb - Y.side}" fill="${p.sideA}"/>`
    for (let x = 0; x < L; x += 48) o += `<rect x="${x}" y="${Y.side}" width="1.5" height="${Y.curb - Y.side}" fill="${p.tile}"/>`
    o += `<rect y="${Y.side + 30}" width="${L}" height="1.5" fill="${p.tile}"/>`
    o += `<rect y="${Y.curb}" width="${L}" height="${Y.road - Y.curb}" fill="${p.curb}"/>`
    o += `<rect y="${Y.road}" width="${L}" height="${Y.roadEnd - Y.road}" fill="url(#g-road)"/>`
    for (let x = 20; x < L; x += 90) o += `<rect x="${x}" y="${Y.lane}" width="50" height="5" rx="2" fill="${p.dash}" opacity=".75"/>`
    o += `<rect y="${Y.roadEnd}" width="${L}" height="8" fill="${p.curb}"/><rect y="${Y.roadEnd + 8}" width="${L}" height="${H - Y.roadEnd - 8}" fill="${p.near}"/>`
    for (let x = 0; x < L; x += 64) o += `<rect x="${x}" y="${Y.roadEnd + 8}" width="1.5" height="${H - Y.roadEnd}" fill="${p.tile}"/>`
    return o
  }

  // ---------- cadde ----------
  const SHOPS = ['FIRIN', 'KAFE', 'ÇİÇEKÇİ', 'KİTAPÇI', 'MANAV', 'BERBER', 'KUYUMCU', 'TERZİ', 'PASTANE']
  const AW = ['kirmizi', 'mavi', 'sari', 'mor', 'turuncu']
  function genStreet(seed, L = 2400) {
    const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)]
    const s = { L, buildings: [], people: [], cars: [], bikes: [], cats: [], trees: [], lamps: [], vendors: [] }
    let x = 0, i = 0
    const shops = SHOPS.slice().sort(() => r() - 0.5)
    while (x < L) {
      const w = 220 + Math.floor(r() * 80)
      s.buildings.push({ x, w, h: 330 + Math.floor(r() * 120), body: '', shop: shops[i % shops.length], aw: AW[i % AW.length], balcony: r() < 0.5 })
      x += w + 14
      i++
    }
    s.buildings[2].aw = 'yesil'
    // ağaç ve lamba bina aralarında (tabelayı kesmesin)
    s.buildings.forEach((b, j) => { if (j % 2 === 1) s.lamps.push(b.x - 7); else if (j > 0) s.trees.push(b.x - 7) })
    return s
  }
  function renderStreet(s, mode = 'day', opts = {}) {
    const p = PAL[mode], r = rng(7)
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.vx || 0} 0 ${opts.vw || s.L} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">`
    o += sky(s.L, p) + clouds(s.L, r, p) + skyline(s.L, r, p)
    s.buildings.forEach((b, j) => { b.body = p.facades[j % p.facades.length]; o += building(b, p, r) })
    o += ground(s.L, p)
    s.trees.forEach((t) => (o += tree(t, p)))
    s.lamps.forEach((l) => (o += lamp(l, p)))
    ;(opts.bikes || []).forEach((b) => (o += bike(b)))
    ;(opts.cats || []).forEach((c) => (o += cat(c)))
    ;(opts.vendors || []).forEach((v) => (o += vendor(v, p)))
    ;(opts.people || []).forEach((q) => (o += person(q, p)))
    ;(opts.carsFar || []).forEach((k) => (o += car(k, p, 'far')))
    ;(opts.carsNear || []).forEach((k) => (o += car(k, p, 'near')))
    if (opts.mark) o += `<circle cx="${opts.mark.x}" cy="${opts.mark.y}" r="${opts.mark.r}" fill="none" stroke="#19C2D1" stroke-width="6"/><circle cx="${opts.mark.x}" cy="${opts.mark.y}" r="${opts.mark.r + 9}" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9"/>`
    return o + '</svg>'
  }

  // ---------- pazar yeri ----------
  function renderMarket(mode = 'day', opts = {}) {
    const p = PAL[mode], r = rng(11), L = opts.L || 1600
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.vx || 0} 0 ${opts.vw || L} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">`
    o += sky(L, p) + clouds(L, r, p) + skyline(L, r, p)
    // arka binalar (alçak)
    let x = 0, j = 0
    while (x < L) { const w = 200 + r() * 60; o += `<rect x="${f(x)}" y="${Y.side - 300}" width="${f(w)}" height="300" fill="${p.facades[j % 7]}"/><rect x="${f(x)}" y="${Y.side - 300}" width="${f(w)}" height="300" fill="url(#g-shade)"/>`; for (let wx = x + 24; wx < x + w - 40; wx += 56) o += windowEl(wx, Y.side - 270, 32, 46, p, p.winLit && r() < p.winLit); x += w + 10; j++ }
    o += `<rect y="${Y.side}" width="${L}" height="${H - Y.side}" fill="${p.sideA}"/>`
    for (let gx = 0; gx < L; gx += 56) o += `<rect x="${gx}" y="${Y.side}" width="1.5" height="${H - Y.side}" fill="${p.tile}"/>`
    for (let gy = Y.side + 40; gy < H; gy += 40) o += `<rect y="${gy}" width="${L}" height="1.5" fill="${p.tile}"/>`
    // ip ve flamalar
    o += `<path d="M0 ${Y.side - 250}Q${L / 4} ${Y.side - 200} ${L / 2} ${Y.side - 250}T${L} ${Y.side - 250}" stroke="#555" stroke-width="2" fill="none"/>`
    for (let fx = 20; fx < L; fx += 40) { const fy = Y.side - 250 + Math.sin((fx / L) * Math.PI * 2) * -25 + 25; o += `<path d="M${fx} ${f(fy - 4)}L${fx + 20} ${f(fy - 4)}L${fx + 10} ${f(fy + 16)}Z" fill="${C[['kirmizi', 'sari', 'mavi', 'yesil', 'turuncu'][Math.floor(fx / 40) % 5]]}"/>` }
    // tezgâhlar
    const fruits = [['#E0474C', '#C93A3F'], ['#F3BF3A', '#E0A92E'], ['#7FB24E', '#6A9C3F'], ['#EE8735', '#D6772E'], ['#8A3B6E', '#732E5B'], ['#2E7D4F', '#256A42']]
    const stalls = opts.stalls || 6
    for (let k = 0; k < stalls; k++) {
      const sx = 40 + k * 260, cw = 230, cy = Y.side - 40
      const ac = C[['kirmizi', 'yesil', 'mavi', 'turuncu', 'mor', 'sari'][k % 6]]
      o += `<g><rect x="${sx + 6}" y="${cy - 190}" width="6" height="250" fill="#5B5149"/><rect x="${sx + cw - 12}" y="${cy - 190}" width="6" height="250" fill="#5B5149"/>`
      o += `<path d="M${sx - 10} ${cy - 160}L${sx + cw + 10} ${cy - 160}L${sx + cw - 6} ${cy - 206}L${sx + 6} ${cy - 206}Z" fill="${ac}"/>`
      for (let st = 0; st < 5; st++) o += `<path d="M${sx + 6 + st * 44 + 22} ${cy - 206}L${sx + 6 + st * 44 + 44} ${cy - 206}L${sx - 10 + st * 48 + 48} ${cy - 160}L${sx - 10 + st * 48 + 24} ${cy - 160}Z" fill="#fff" opacity=".4"/>`
      for (let sc = sx - 10; sc < sx + cw + 10; sc += 16) o += `<circle cx="${sc + 8}" cy="${cy - 160}" r="8" fill="${ac}"/>`
      o += `<rect x="${sx}" y="${cy}" width="${cw}" height="70" rx="4" fill="#9C7650"/><rect x="${sx}" y="${cy}" width="${cw}" height="10" fill="#000" opacity=".15"/>`
      for (let cr = 0; cr < 3; cr++) {
        const fr = fruits[(k * 2 + cr) % fruits.length], bx = sx + 12 + cr * 72
        o += `<rect x="${bx}" y="${cy - 26}" width="64" height="28" rx="3" fill="#C9A26E"/>`
        for (let fi = 0; fi < 9; fi++) o += `<circle cx="${bx + 9 + (fi % 5) * 11.5}" cy="${cy - 28 - Math.floor(fi / 5) * 9}" r="7" fill="${fr[fi % 2]}"/>`
      }
      if (k === (opts.melonAt ?? 2)) o += `<ellipse cx="${sx + cw / 2}" cy="${cy + 50}" rx="22" ry="16" fill="#2E7D4F"/><path d="M${sx + cw / 2 - 18} ${cy + 44}Q${sx + cw / 2} ${cy + 36} ${sx + cw / 2 + 18} ${cy + 44}" stroke="#7FB24E" stroke-width="3" fill="none"/>`
      o += `<rect x="${sx + cw / 2 - 34}" y="${cy - 150}" width="68" height="22" rx="4" fill="#FFF8E8"/><text x="${sx + cw / 2}" y="${cy - 134}" text-anchor="middle" font-family="Onest, system-ui" font-weight="800" font-size="12" fill="#2A2E33">${['ELMA', 'LİMON', 'ARMUT', 'PORTAKAL', 'İNCİR', 'KAVUN'][k % 6]}</text></g>`
    }
    ;(opts.people || []).forEach((q) => (o += person(q, p)))
    if (opts.mark) o += `<circle cx="${opts.mark.x}" cy="${opts.mark.y}" r="${opts.mark.r}" fill="none" stroke="#19C2D1" stroke-width="6"/><circle cx="${opts.mark.x}" cy="${opts.mark.y}" r="${opts.mark.r + 9}" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9"/>`
    return o + '</svg>'
  }

  // ---------- park ----------
  function renderPark(mode = 'day', opts = {}) {
    const p = PAL[mode], r = rng(23), L = opts.L || 1400
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.vx || 0} 0 ${opts.vw || L} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">`
    o += sky(L, p) + clouds(L, r, p) + skyline(L, r, p)
    o += `<path d="M0 ${Y.side - 60}Q${L * 0.25} ${Y.side - 130} ${L * 0.5} ${Y.side - 70}T${L} ${Y.side - 80}L${L} ${H}L0 ${H}Z" fill="${mode === 'day' ? '#9CCB84' : '#3E5E44'}"/>`
    o += `<path d="M0 ${Y.side + 10}Q${L * 0.3} ${Y.side - 30} ${L * 0.6} ${Y.side + 10}T${L} ${Y.side}L${L} ${H}L0 ${H}Z" fill="${mode === 'day' ? '#86BE6E' : '#36553C'}"/>`
    o += `<path d="M-20 ${H}Q${L * 0.3} ${Y.side + 60} ${L * 0.55} ${Y.side + 110}T${L + 20} ${Y.side + 70}L${L + 20} ${Y.side + 150}Q${L * 0.6} ${Y.side + 200} ${L * 0.3} ${H}Z" fill="${mode === 'day' ? '#E7DCC2' : '#77705F'}"/>`
    for (let tx = 80; tx < L; tx += 260 + r() * 80) o += tree(tx, p).replace(/translate/g, 'translate')
    for (let bx = 200; bx < L; bx += 420) o += `<g><rect x="${bx}" y="${Y.side + 20}" width="90" height="8" rx="3" fill="#8A5A3A"/><rect x="${bx}" y="${Y.side - 6}" width="90" height="7" rx="3" fill="#8A5A3A"/><rect x="${bx + 8}" y="${Y.side + 28}" width="5" height="22" fill="#3A3F45"/><rect x="${bx + 77}" y="${Y.side + 28}" width="5" height="22" fill="#3A3F45"/></g>`
    ;(opts.people || []).forEach((q) => (o += person(q, p)))
    return o + '</svg>'
  }

  window.FEM = { genStreet, renderStreet, renderMarket, renderPark, person, car, PAL, C, SKIN, Y, H }
})()
