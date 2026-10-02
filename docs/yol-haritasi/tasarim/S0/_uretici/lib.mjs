// Ortak parçalar: simgeler, telefon çerçevesi, Ana sayfa başı, günün diyaframı, Bugünün yolu (TodayPath geometrisi aynen)

// ---- lucide-react çizgi simgeleri (uygulamanın simge kitaplığı)
export const I = {
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  circleDot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>',
  moonF: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  cloudRain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  cloudSun: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  flashlight: '<path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z"/><line x1="6" x2="18" y1="6" y2="6"/><line x1="12" x2="12" y1="12" y2="12"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  footprints: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
}
export const svg = (p, cls = '', sw = 2) => `<svg${cls ? ` class="${cls}"` : ''} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Nefona işareti (site/public/mark.svg); uygulama simgesi olarak da kullanılır
export const MARK = (cls = '') => `<svg class="${cls}" viewBox="0 0 1024 1024" aria-hidden="true"><rect width="1024" height="1024" fill="url(#mk-bg)"/><rect width="1024" height="1024" fill="url(#mk-glow)"/><path d="M 290 710 L 290 520 A 222 222 0 0 1 734 520 L 734 710" fill="none" stroke="#ffffff" stroke-width="96" stroke-linecap="round"/><circle cx="512" cy="520" r="124" fill="url(#mk-iris)"/><circle cx="512" cy="505.1" r="54.6" fill="#070c12"/><circle cx="492.4" cy="485.5" r="12" fill="#ffffff"/></svg>`

// ---- Durum çubuğu ve çerçeve
const sbIcons = `<span class="ic"><svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg><svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .6 10.2 10.2 0 0 0 .9 3.4L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7 7 0 0 0 8 3.9a7 7 0 0 0-4.8 1.8l1.1 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.3c.5 0 1 .2 1.4.5L8 11 6.6 9.3c.4-.3.9-.5 1.4-.5Z" fill="currentColor"/></svg><svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4Z" fill="currentColor" opacity=".5"/></svg></span>`
export const statusBar = (time = '10:00', cls = '') => `<div class="sb ${cls}"><span>${time}</span>${sbIcons}</div><div class="island"></div>`

export function tabbar(active = 'home') {
  const T = [['home', 'Bugün', I.house], ['progress', 'Gelişim', I.chart], ['calendar', 'Takvim', I.cal], ['info', 'Bilgi', I.book]]
  return `<nav class="tabbar" aria-hidden="true"><div class="tabbar-inner">${T.map(([id, l, p]) => `<span class="${id === active ? 'on' : ''}">${svg(p, '', id === active ? 2.4 : 1.8)}${l}</span>`).join('')}</div></nav>`
}

// shot: bir telefon çerçevesi. mode: 'fixed' (ilk ekran; 390 × 844 ya da 320 × 568) | 'auto' (içeriğin tamamı)
// fold: uzun (auto) ekranda ilk ekranın bittiği yere kesik çizgi; ref: altyazının sonundaki plan bölümü
export function shot({ label, cap = '', ref = '', body, mode = 'fixed', tabs = null, time = '10:00', sb = '', scrCls = '', noHome = false, fold = false, figCls = '' }) {
  const cls = ['scr', mode, tabs ? 'tabs' : '', scrCls].filter(Boolean).join(' ')
  const fl = fold && mode === 'auto' ? '<div class="fold" aria-hidden="true"></div>' : ''
  return `<figure class="shot${figCls ? ' ' + figCls : ''}"><div class="fitbox"><div class="fit"><div class="phone"><div class="${cls}">${sb === 'none' ? '' : statusBar(time, sb)}${body}${tabs ? tabbar(tabs) : ''}${noHome ? '' : '<div class="home-ind"></div>'}${fl}</div></div></div></div><figcaption><b>${label}</b>${cap}${ref ? ` <span class="ref">(${ref})</span>` : ''}</figcaption></figure>`
}

// ---- Ay simgesi: aydınlık kısım --moon-lit, gölge --moon-shadow, çevre çizgisi --moon-line (temaya göre ayrı tokenlar)
export function moonSvg(k, waxing, cls = 'moon') {
  const r = 10, c = 12
  const top = `${c} ${c - r}`, bot = `${c} ${c + r}`
  let lit = ''
  if (k >= 0.995) lit = `<circle class="lit" cx="${c}" cy="${c}" r="${r}"/>`
  else if (k > 0.005) {
    const rx = Math.abs(1 - 2 * k) * r
    const gib = k > 0.5
    // büyüyen: sağ yarı aydınlık; küçülen: sol yarı
    const limb = waxing ? 1 : 0
    const term = waxing ? (gib ? 1 : 0) : (gib ? 0 : 1)
    lit = `<path class="lit" d="M${top}A${r} ${r} 0 0 ${limb} ${bot}A${rx.toFixed(2)} ${r} 0 0 ${term} ${top}Z"/>`
  }
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle class="trk" cx="${c}" cy="${c}" r="${r}"/>${lit}<circle class="rim" cx="${c}" cy="${c}" r="${r}"/></svg>`
}

// ---- Ana sayfa başı (Home.jsx:216-234 + tarih satırında ay; §3.E.7)
export function homeHead({ date, phase, k, waxing, greet = 'Günaydın', name = 'Haydar', moon = true }) {
  const mo = moon ? `<span class="sep" aria-hidden="true">·</span><span class="mo">${moonSvg(k, waxing)}${phase}${svg(I.chevR, 'chev')}</span>` : ''
  return `<header class="home-head"><div><span class="eyebrow dl"><span>${date}</span>${mo}</span><h1>${greet},<br><em class="hh-name">${name}</em></h1></div><span class="hh-me"><span class="ph-avatar">${name[0]}</span></span></header>`
}

// ---- Diyafram kanatları (TodayPath.jsx bladePaths, aynen)
export const A_CLOSED = 1.5, A_NOW = 20, A_DONE = 38
const rotFor = (a) => (a <= A_NOW ? (15 * (a - A_CLOSED)) / (A_NOW - A_CLOSED) : 15 + (30 * (a - A_NOW)) / (A_DONE - A_NOW))
export function bladePaths(a) {
  const R = 46, C = 50
  const rot = (rotFor(a) * Math.PI) / 180
  const rv = a / Math.cos(Math.PI / 6)
  const V = [], E = []
  for (let k = 0; k < 6; k++) { const t = rot + ((30 + 60 * k) * Math.PI) / 180; V.push([C + rv * Math.cos(t), C + rv * Math.sin(t)]) }
  for (let k = 0; k < 6; k++) {
    const A = V[k], B = V[(k + 1) % 6]
    let dx = B[0] - A[0], dy = B[1] - A[1]
    const L = Math.hypot(dx, dy) || 1
    dx /= L; dy /= L
    const bx = B[0] - C, by = B[1] - C
    const b = bx * dx + by * dy
    const cc = bx * bx + by * by - R * R
    const t = -b + Math.sqrt(Math.max(0, b * b - cc))
    E.push([B[0] + t * dx, B[1] + t * dy])
  }
  const f = (v) => v.toFixed(2)
  const blades = [], edges = []
  for (let k = 0; k < 6; k++) {
    const P = V[k], Q = V[(k + 1) % 6], Ek = E[k], Em = E[(k + 5) % 6]
    blades.push({ cls: `b${k % 2}`, d: `M${f(P[0])} ${f(P[1])}L${f(Q[0])} ${f(Q[1])}L${f(Ek[0])} ${f(Ek[1])}A${R} ${R} 0 0 0 ${f(Em[0])} ${f(Em[1])}Z` })
    edges.push(`M${f(P[0])} ${f(P[1])}L${f(Ek[0])} ${f(Ek[1])}`)
  }
  return { blades, edges }
}

// ---- Günün diyaframı (DayDial.jsx, aynen). stops: [{done, next, rest}]
export function dayDial(stops) {
  const R = 90, GAP = 7, OPEN_MIN = 9
  const n = stops.length
  const done = stops.filter((s) => s.done).length
  const open = n ? OPEN_MIN + ((A_DONE - OPEN_MIN) * done) / n : OPEN_MIN
  const { blades, edges } = bladePaths(open)
  const seg = n ? (2 * Math.PI) / n : 0
  const g = n > 1 ? GAP / R : 0
  const arc = (a0, a1) => { const p = (a) => [100 + R * Math.cos(a), 100 + R * Math.sin(a)]; const [x0, y0] = p(a0); const [x1, y1] = p(a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` }
  const ring = stops.map((s, i) => {
    const a0 = -Math.PI / 2 + i * seg + g / 2, a1 = a0 + seg - g, m = (a0 + a1) / 2
    const cls = s.done ? 'd' : s.next ? 'n' : s.rest ? 'r' : 'l'
    let out = `<path class="dd-tk ${cls}" d="${arc(a0, a1)}"/>`
    if (s.next && !s.done) out += `<circle class="dd-halo" cx="${(100 + R * Math.cos(m)).toFixed(2)}" cy="${(100 + R * Math.sin(m)).toFixed(2)}" r="10"/><circle class="dd-now" cx="${(100 + R * Math.cos(m)).toFixed(2)}" cy="${(100 + R * Math.sin(m)).toFixed(2)}" r="5.5"/>`
    if (s.rest && !s.done) out += `<path class="dd-moon" transform="translate(${(100 + (R - 15) * Math.cos(m)).toFixed(1)} ${(100 + (R - 15) * Math.sin(m)).toFixed(1)})" d="M1.5 -5a5 5 0 1 0 3.5 8.5a4 4 0 0 1-3.5-8.5z"/>`
    return out
  }).join('')
  return `<svg class="dd" viewBox="0 0 200 200" width="172" height="172" aria-hidden="true">${ring}<g transform="translate(22 22) scale(1.56)"><circle class="dd-well" cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="34" fill="url(#dd-iris)"/><circle cx="50" cy="50" r="34" fill="url(#dd-glow)"/><circle cx="54.5" cy="45.5" r="2.6" fill="#FFFFFF"/>${blades.map((b) => `<path class="dd-${b.cls}" d="${b.d}"/>`).join('')}${edges.map((d) => `<path class="dd-be" d="${d}"/>`).join('')}<circle cx="50" cy="50" r="46" fill="url(#dd-sheen)"/><circle class="dd-rim" cx="50" cy="50" r="46"/></g></svg>`
}
// dialStops(n, restIdx, doneCount): diyafram halkası için durak listesi
export const dialStops = (n, restIdx, doneCount = 0) => Array.from({ length: n }, (_, i) => ({ done: i < doneCount, next: i === doneCount, rest: i === restIdx }))

// ---- Sayılar (Home.jsx:240-265; karar 5d: sıfır satırı yok, seri < 3 ise yok)
// 5 saniye turu 2 (Ç19, madde 24): hafta satırı "2/3 gün bu hafta" diye okunur ("4✓ hafta" dört hafta sanılıyordu);
// hedef tutunca "4 gün bu hafta" ve yeşil tik. "N gün seninle" seriyle aynı sayıysa yazılmaz (aynı sayı iki kez okunmasın).
export function dayBlock({ n, rest, done = 0, left, facts = [], pre = false }) {
  const streak = facts.find((f) => f.k === 'streak')?.v
  const fx = facts.map((f) => {
    if (f.k === 'streak') return `<div class="hh-fact st${f.v >= 21 ? ' long' : ''}">${svg(I.flame, 'f1')}<b>${f.v}</b>gün seri</div>`
    if (f.k === 'week') {
      const m = String(f.v).match(/^(\d+)/), got = m ? +m[1] : 0, met = /✓/.test(f.v), goal = f.goal ?? 3
      return `<div class="hh-fact wk${met ? ' met' : ''}">${svg(I.cal, 'f2')}<b>${met ? got : `${got}/${goal}`}</b>gün bu hafta${met ? `<span class="hh-met" aria-hidden="true">${svg(I.check, '', 3.4)}</span>` : ''}</div>`
    }
    if (f.k === 'days') return streak === f.v ? '' : `<div class="hh-fact dim">${svg(I.circleDot, 'f3')}<b>${f.v}</b>gün seninle</div>`
    return ''
  }).join('')
  return `<section class="hh-day" aria-label="Bugün">${dayDial(dialStops(n, rest, done))}<div class="hh-num">${pre ? `<div class="hh-big"><b>${n}</b><small>durak</small></div><span class="hh-lbl">bugün · ≈${left} dk</span>` : `<div class="hh-big"><b>${done}</b><small>/ ${n}</small></div><span class="hh-lbl">durak · ≈${left} dk kaldı</span>`}${fx ? `<div class="hh-facts">${fx}</div>` : ''}</div></section>`
}

// ---- Nef satırı, büyük düğme, sakin seçenekler (Home.jsx:267-286)
// tone: '' | 'first' (kurulumun ilk günü, İlk Bakış'ın sayısı) | 'ms' (kilometre taşı) | 'ok' (dün yol tamamdı)
// pips: kilometre taşının günleri ({ n: 7, done: 6 }: altı gün dolu, bugün parlar; öneri görünüş, metin aynı)
export function nowBlock({ line, sub = '', eyebrow = 'Güne başla', title, isNew = false, tone = '', hl = '', pips = null }) {
  title = title.replace(/ · (?=[^·]*$)/, ' · ')
  const top = isNew ? `<span class="r1"><small>${eyebrow}</small><i class="hh-new">Yeni</i></span>` : `<small>${eyebrow}</small>`
  const txt = hl && line.includes(hl) ? line.replace(hl, `<em class="hl">${hl}</em>`) : line
  const badge = tone === 'ok' ? `<span class="hh-nef-ok" aria-hidden="true">${svg(I.check, '', 3.2)}</span>` : ''
  const pp = pips ? `<span class="hh-pips" aria-hidden="true">${Array.from({ length: pips.n }, (_, i) => `<i class="${i < pips.done ? 'on' : i === pips.done ? 'now' : ''}">${i === pips.done ? i + 1 : ''}</i>`).join('')}</span>` : ''
  return `<section class="hh-now" aria-label="Şimdi"><div class="hh-nef${tone ? ' ' + tone : ''}"><span class="hh-nef-eye" aria-hidden="true">${badge}</span><div class="hh-nef-tx"><p>${txt}${sub ? `<span>${sub}</span>` : ''}</p>${pp}</div></div><span class="hh-go"><span class="t">${top}<b>${title}</b></span><span class="ar">${svg(I.play)}</span></span><div class="hh-alt"><span><span class="ic breath">${svg(I.moonF)}</span><span class="tx"><b>Nefes</b><small>5 dk mola</small></span></span><span><span class="ic dalga">${svg(I.waves)}</span><span class="tx"><b>Dalga</b><small>sakinleş</small></span></span></div></section>`
}

// size: 'sm' (ilk günler: tek satırlık kart) | '' | 'big' (bir ay dolunca renklenen harita büyük ve parlak; öneri görünüş)
export const homeMap = (frac, text, sub = 'Değişim, kayıtlar biriktikçe görünür.', size = '') => `<section class="card hm${size ? ' ' + size : ''}" aria-label="Gelişim haritan"><span class="hm-ring"><canvas class="hm-map" data-draw="iris" data-frac="${frac.join(',')}" width="152" height="152" aria-hidden="true"></canvas></span><div class="hm-tx"><b>${text}</b><span>${sub}</span></div></section>`

// ---- Bugünün yolu (TodayPath.jsx layout, crescent, Ribbon; aynı koordinatlar)
const W = 300, STEP = 116
export const GLYPH = {
  arrows: '<path d="M3 12h18"/><path d="M7 8l-4 4 4 4"/><path d="M17 8l4 4-4 4"/>',
  updown: '<path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M8 17l4 4 4-4"/>',
  far: '<path d="M2.5 19l6-8.5 3.8 5 2.7-3.2 6.5 6.7z"/><circle cx="17" cy="6" r="2"/>',
  nearfar: '<circle cx="7" cy="12" r="4"/><circle cx="19" cy="12" r="1.8"/><path d="M12.2 12h3.6" stroke-dasharray="1.2 2.2"/>',
  circle: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M18 3.2v4h-4"/>',
  lid: '<path d="M3 10.5c4.8 5.6 13.2 5.6 18 0"/><path d="M6.6 14.6l-1.5 2.4M12 16.3v2.8M17.4 14.6l1.5 2.4"/>',
  constel: '<circle cx="6" cy="16.5" r="2.3"/><circle cx="12" cy="6.5" r="2.3"/><circle cx="18.5" cy="14.5" r="2.3"/><path d="M7.3 14.4l3.4-5.8M13.5 8.3l3.6 4.4"/>',
  street: '<path d="M3 21V9l5-3v15M8 21V4l7 3v14M15 21V11l6 2v8"/><path d="M2 21h20"/>',
  span: '<rect x="2.5" y="9" width="4" height="6" rx="1"/><rect x="17.5" y="9" width="4" height="6" rx="1"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
  spark: '<path d="M12 3.5v4.5M12 16v4.5M3.5 12H8M16 12h4.5M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/>',
  moon: '<path d="M15 4a8 8 0 1 0 5 13.6A6.4 6.4 0 0 1 15 4z" fill="currentColor" stroke="none"/>',
  lotus: '<path d="M12 4.5C14.2 7 14.2 12.4 12 15.5C9.8 12.4 9.8 7 12 4.5Z"/><path d="M12 15.5C8.5 15.5 5 13.3 4 9.8C7.4 9.8 10.4 12 12 15.5"/><path d="M12 15.5C15.5 15.5 19 13.3 20 9.8C16.6 9.8 13.6 12 12 15.5"/><path d="M6 19.5h12"/>',
}
const SCENE = {
  constel: '<path class="sc-l" d="M34 60L50 38L67 57"/><circle class="sc-c" cx="34" cy="60" r="7"/><circle class="sc-c" cx="50" cy="38" r="7"/><circle class="sc-c" cx="67" cy="57" r="7"/><circle class="sc-d" cx="50" cy="38" r="3.3"/>',
  street: '<rect class="sc-c" x="26" y="36" width="16" height="30" rx="2"/><rect class="sc-c" x="46" y="28" width="14" height="38" rx="2"/><circle class="sc-d" cx="70" cy="52" r="5"/><path class="sc-l" d="M20 68H80"/>',
  span: '<rect class="sc-c" x="22" y="43" width="11" height="15" rx="2"/><rect class="sc-c" x="67" y="43" width="11" height="15" rx="2"/><circle class="sc-d" cx="50" cy="50" r="5"/>',
  lotus: '<path class="sc-c" d="M50 28C59 38 59 55 50 65C41 55 41 38 50 28Z"/><path class="sc-c" d="M50 65C37 65 26 57 24 44C37 44 46 53 50 65Z"/><path class="sc-c" d="M50 65C63 65 74 57 76 44C63 44 54 53 50 65Z"/><path class="sc-l" d="M28 73H72"/>',
}
const SV = (p, cls = '') => svg(p, cls, 2)
const CHECK = '<path d="M5 12.5l4.2 4.2L19 7" stroke-width="3"/>'
const LOCK = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>'
function radius(form, st) {
  if (form === 'me') return { later: [32, 24], now: [40, 30], done: [35, 26] }[st] ?? [32, 24]
  if (form === 'rest') return [32, 32]
  const r = { now: 38, done: 30 }[st] ?? 28
  return [r, r]
}
function crescent(y0, y1, mirror) {
  const yA = y0 - 30, yB = y1 + 30, mid = (yA + yB) / 2, k = (yB - yA) / 524
  const X = (x) => (mirror ? W - x : x)
  return `M${X(42)} ${yA}C${X(190)} ${yA - 14 * k} ${X(276)} ${mid - 136 * k} ${X(276)} ${mid}C${X(276)} ${mid + 136 * k} ${X(190)} ${yB + 14 * k} ${X(42)} ${yB}C${X(150)} ${yB - 28 * k} ${X(176)} ${mid + 114 * k} ${X(176)} ${mid}C${X(176)} ${mid - 114 * k} ${X(150)} ${yA + 28 * k} ${X(42)} ${yA}Z`
}
export function pathLayout(stops) {
  const restIdx = stops.findIndex((s) => s.form === 'rest')
  const s1 = restIdx >= 0 ? stops.slice(0, restIdx) : stops
  const s2 = restIdx >= 0 ? stops.slice(restIdx + 1) : []
  const bend = (n, i) => (n === 1 ? 1 : Math.pow(Math.sin((Math.PI * i) / (n - 1)), 0.6))
  const pos = []
  let y = 74
  s1.forEach((_, i) => { pos.push([74 + 154 * bend(s1.length, i), y]); y += STEP })
  let band = null, label2 = null
  const cres = []
  const lastY1 = s1.length ? y - STEP : 20
  if (s1.length > 1) cres.push(crescent(74, lastY1, false))
  if (restIdx >= 0) {
    const top = lastY1 + 62
    band = { top, height: 136, moon: [124, top + 60] }
    pos.push(band.moon)
    label2 = top + 148
    y = label2 + 64
    s2.forEach((_, i) => { pos.push([226 - 146 * bend(s2.length, i), y]); y += STEP })
    if (s2.length > 1) cres.push(crescent(label2 + 64, y - STEP, true))
  }
  const lastY = pos.length ? pos.at(-1)[1] : 0
  const segs = pos.slice(0, -1).map(([x0, y0], i) => { const [x1, y1] = pos[i + 1]; const dy = y1 - y0; return `M${x0} ${y0}C${x0} ${y0 + dy * 0.5} ${x1} ${y1 - dy * 0.5} ${x1} ${y1}` })
  return { pos, band, label2, cres, segs, foot: lastY + 76, height: lastY + 130 }
}
// Bugünkü kodda ilk yıldız [26, 16] bant etiketinin ("Mola · N dk") üstüne düşüyor; çizimde etiketin altına alındı (öneri, Ç17)
// 5 saniye turu 2: bant yuvarlak köşeli bir havuz; yıldızlar azaldı ve havuzun üst kenarında kalır (öneri görünüş)
const STARS = [[26, 44, 0.7], [196, 20, 0.7], [232, 34, 0.45], [262, 16, 0.6], [286, 40, 0.4]]
const px = (x) => `calc(50% + ${(x - W / 2).toFixed(1)}px)`
function bladesSvg(a) {
  const { blades, edges } = bladePaths(a)
  return `<svg class="ap" viewBox="0 0 100 100" aria-hidden="true">${blades.map((b) => `<path class="${b.cls}" d="${b.d}"/>`).join('')}${edges.map((d) => `<path class="be" d="${d}"/>`).join('')}<circle class="rim" cx="50" cy="50" r="47.5"/></svg>`
}
function stopInner(s, st) {
  const badges = `<span class="pulse"></span><span class="bdg ok">${SV(CHECK)}</span><span class="bdg lk">${SV(LOCK)}</span>`
  const glyph = GLYPH[s.glyph] ? SV(GLYPH[s.glyph]) : ''
  if (s.form === 'me') {
    const inner = s.glyph === 'lines' ? '<path class="ll" d="M27 22.5h26M27 30h26M27 37.5h17"/>' : '<path d="M31 21h18v3.6H34.6v3.6h10.8v3.6H34.6v3.6h14.4V39H31Z" fill="#041017"/>'
    return `<svg class="lens" viewBox="0 0 80 60" aria-hidden="true"><path class="lgl" d="M4 30A37.9 37.9 0 0 1 76 30A37.9 37.9 0 0 1 4 30Z"/><path class="lh" d="M16 20Q27 9 44 9"/>${inner}</svg>${badges}`
  }
  if (s.form === 'rest') return `<span class="moonring"></span><span class="moon-c">${SV(GLYPH.moon)}</span>${badges}`
  if (s.form === 'fi') return `<span class="housing fi"></span><span class="gl fi">${glyph}</span>${badges}`
  const a = st === 'done' ? A_DONE : st === 'now' ? A_NOW : A_CLOSED
  const core = s.form === 'ex' || !SCENE[s.glyph] ? '<span class="iris"><i></i></span>' : `<span class="scene"><svg viewBox="0 0 100 100" aria-hidden="true">${SCENE[s.glyph]}</svg></span>`
  return `<span class="housing"></span>${core}${bladesSvg(a)}<span class="gl">${glyph}</span>${badges}`
}
const irisMark = '<span class="iris-mark" aria-hidden="true"><span class="iris-mark-iris"></span><span class="iris-mark-lid"></span></span>'
// stops: [{title, form, glyph, st:'done'|'now'|'later', sub, tag, restMin}]
export function todayPath({ stops, blocks, bubble, foot = 'Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi.', week = '', bandMin = 5 }) {
  const L = pathLayout(stops)
  const nextIdx = stops.findIndex((s) => s.st === 'now')
  const jIdx = nextIdx < 0 ? stops.length - 1 : nextIdx
  const restI = stops.findIndex((s) => s.form === 'rest')
  const n = stops.length
  const X = (i) => (n === 1 ? 150 : 12 + (i * 276) / (n - 1))
  const rc = (st) => (st === 'done' ? 'd' : st === 'now' ? 'n' : 'l')
  const ribbon = `<svg class="tp-ribbon" viewBox="0 0 300 16" aria-hidden="true"><path class="rb-l" d="M12 8H288"/>${stops.slice(0, -1).map((s, i) => (s.st === 'done' ? `<path class="rb-d" d="M${X(i)} 8H${X(i + 1)}"/>` : '')).join('')}${stops.map((s, i) => { const x = X(i), c = rc(s.st); if (s.form === 'me') return `<path class="rb ${c}" d="M${x - 6} 8A6.6 6.6 0 0 1 ${x + 6} 8A6.6 6.6 0 0 1 ${x - 6} 8Z"/>`; if (s.form === 'rest') return `<circle class="rb rb-r ${c}" cx="${x}" cy="8" r="6"/>`; return `<circle class="rb ${c}" cx="${x}" cy="8" r="${s.form === 'pr' ? 4 : 4.5}"/>` }).join('')}</svg>`
  let band = ''
  if (L.band) {
    band = `<div class="tp-band" style="top:${L.band.top}px;height:${L.band.height}px" aria-hidden="true"><span class="tp-btag">Mola · ${bandMin} dk</span>${STARS.map(([x, y, o]) => `<span class="tp-star" style="left:${px(x)};top:${y}px;opacity:${o}"></span>`).join('')}${[1.4, 2.6, 3.8].map((k, i) => `<span class="tp-rp" style="left:${px(124)};top:106px;--k:${k};--o:${[0.5, 0.3, 0.14][i]}"></span>`).join('')}</div>`
  }
  const track = `<svg class="tp-track" viewBox="0 0 ${W} ${L.height}" style="left:${px(0)};width:${W}px;height:${L.height}px" aria-hidden="true">${L.cres.map((d) => `<path class="tp-cres" d="${d}"/>`).join('')}${L.segs.map((d, i) => `<path class="tp-ln todo" d="${d}"/>${stops[i].st === 'done' ? `<path class="tp-ln fill" d="${d}"/>` : ''}`).join('')}</svg>`
  const secs = [1, 2].map((b, i) => ({ b, y: i === 0 ? 0 : L.label2, ...(blocks[i] || {}) })).filter((x) => x.y != null && x.eyeMin != null)
  // 2. bölümün ilk durağı soldaysa (tek duraklı bölüm) yol etiketin üstünden geçer: etiket sağa geçer (öneri, Ç17)
  const s2x = restI >= 0 && L.pos[restI + 1] ? L.pos[restI + 1][0] : W
  const labels = secs.map((x) => `<div class="tp-sl${x.b === 2 && s2x < W / 2 ? ' r' : ''}" style="top:${x.y}px" aria-hidden="true"><span class="l1">${x.b}. bölüm<span class="m">${Array.from({ length: Math.max(x.capMin ?? 4, x.eyeMin) }, (_, j) => `<i class="${j < (x.eyeDone ?? 0) ? 'd' : j < x.eyeMin ? 'p' : ''}"></i>`).join('')}</span></span><span class="g2">≈ ${x.eyeMin} dk göz</span></div>`).join('')
  const st = stops.map((s, i) => {
    const [x, y] = L.pos[i]
    const r = radius(s.form, s.st)
    const side = s.form === 'rest' ? 'rest' : x > W / 2 ? 'left' : 'right'
    const labelX = side === 'left' ? x - r[0] - 8 : side === 'rest' ? x + r[0] + 12 : x + r[0] + 8
    const showLabel = i !== jIdx
    const tag = s.tag ? `<span class="tag${s.tagNew ? ' new' : ''}">${s.tag}</span>` : s.form === 'me' ? '<span class="tag">Ölçüm</span>' : s.form === 'rest' ? '<span class="tag">Mola</span>' : ''
    const title = s.form === 'rest' ? `${s.title} · ${s.restMin ?? 5} dk` : s.title
    const sub = s.st === 'done' ? (s.doneSub ?? 'tamam') : (s.sub ?? '')
    let out = `<span class="tp-st ${s.form} ${s.st}" style="left:${px(x)};top:${y}px${s.form === 'rest' && s.st === 'done' ? ';--p:1' : ''}">${stopInner(s, s.st)}</span>`
    const lbMax = side === 'rest' ? `;max-width:calc(50% + ${(W / 2 - labelX - 4).toFixed(1)}px)` : ''
    if (showLabel) out += `<span class="tp-lb ${side}" style="left:${px(labelX)};top:${y}px${lbMax}">${tag}<span class="t">${title}</span><small>${sub}</small></span>`
    if (s.st === 'now') out += `<span class="tp-go" style="left:${px(x)};top:${y + r[1] + 8}px">Başla</span>`
    return out
  }).join('')
  let jb = ''
  if (bubble && jIdx >= 0) {
    const s = stops[jIdx], [x, y] = L.pos[jIdx], r = radius(s.form, s.st)
    const side = x > W / 2 ? 'left' : 'right'
    let pos
    if (side === 'right') { const left = x + r[0] + 10, width = Math.min(172, W - left); pos = `left:${px(left)};width:${width}px;max-width:calc(50% + ${W / 2 - left - 4}px)` } else { const edge = x - r[0] - 10, width = Math.min(172, edge); pos = `right:calc(50% - ${edge - W / 2}px);width:${width}px;max-width:calc(50% + ${edge - W / 2 - 4}px)` }
    jb = `<div class="tp-jb" data-side="${side}" style="${pos};top:${y}px"><span class="tp-jev">${irisMark}</span><div class="tp-jb-b"><b class="w">${bubble.word}</b><span class="l2">${bubble.line}</span></div></div>`
  }
  const fn = foot ? `<p class="tp-fn" style="top:${L.foot}px">${foot}</p>` : ''
  const wk = week ? `<span class="tp-week" style="top:${L.foot + 34}px">${week}</span>` : ''
  return { html: `<section class="tp" aria-label="Bugünün yolu">${ribbon}<div class="tp-pv" style="height:${L.height}px">${band}${track}${labels}${st}${jb}${fn}${wk}</div></section>`, L }
}

// ---- Gelişim haritası (ProgressOverview.jsx GrowthMap: iris, ortada gün, çevrede yedi alan ve N/28), IRIS_ORDER sırası
export const IRIS_ORDER = ['Göz', 'Dikkat', 'Farkındalık', 'Sakinlik', 'Kendine<br>yaklaşım', 'İyi oluş', 'Beden']
export function growthMap({ day, counts, win = 28 }) {
  const frac = counts.map((c) => Math.min(1, c / win))
  const lbl = IRIS_ORDER.map((d, i) => {
    const a = (i * Math.PI * 2) / 7
    return `<span class="gm-lbl" style="left:calc(50% + var(--rx) * ${Math.sin(a).toFixed(3)});top:calc(50% - 43% * ${Math.cos(a).toFixed(3)})"><b>${d}</b><small>${counts[i]}/${win}</small></span>`
  }).join('')
  return `<section class="gm" aria-label="Gelişim haritası"><div class="gm-iris"><canvas class="gm-cv" data-draw="iris" data-frac="${frac.map((f) => f.toFixed(3)).join(',')}" aria-hidden="true"></canvas><span class="gm-day" aria-hidden="true"><b>${day}</b><small>GÜN</small></span>${lbl}</div></section>`
}

// ---- Nefes ritmi eğrisi (öneri): al → tut → ver süreleri orantılı; hareket yalnız Hareketi Azalt kapalıyken
export function breathCurve(pat = [4, 1, 6]) {
  const [a, h, v] = pat, T = a + h + v, x0 = 12, W = 316, u = W / T, yB = 96, yT = 20
  const x1 = x0 + a * u, x2 = x1 + h * u, x3 = x2 + v * u
  const rise = `M${x0} ${yB}C${(x0 + x1) / 2} ${yB} ${(x0 + x1) / 2} ${yT} ${x1} ${yT}`
  const hold = `M${x1} ${yT}H${x2}`
  const fall = `M${x2} ${yT}C${(x2 + x3) / 2} ${yT} ${(x2 + x3) / 2} ${yB} ${x3} ${yB}`
  const area = `M${x0} ${yB}C${(x0 + x1) / 2} ${yB} ${(x0 + x1) / 2} ${yT} ${x1} ${yT}H${x2}C${(x2 + x3) / 2} ${yT} ${(x2 + x3) / 2} ${yB} ${x3} ${yB}Z`
  const pct = (x) => ((x / 340) * 100).toFixed(2) + '%'
  const k1 = ((a / T) * 100).toFixed(2), k2 = (((a + h) / T) * 100).toFixed(2)
  return `<div class="bc" style="--T:${T}s;--k1:${k1}%;--k2:${k2}%;--xa:${pct(x0)};--xb:${pct(x3)}" aria-hidden="true"><svg viewBox="0 0 340 112" preserveAspectRatio="none"><path class="bc-base" d="M${x0} ${yB}H${x3}"/><path class="bc-area" d="${area}"/><path class="bc-in" d="${rise}"/><path class="bc-hold" d="${hold}"/><path class="bc-out" d="${fall}"/>${[x1, x2].map((x) => `<path class="bc-tick" d="M${x} ${yT - 8}V${yB}"/>`).join('')}</svg><i class="bc-dot"></i></div>`
}

// ---- Ay evresi izi (öneri): son evreden sonrakine; nokta bugünün yeri. Metin yanındaki satırdadır
export function moonTrack(pos, from = 'new', to = 'full') {
  const ico = (k) => `<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><circle class="trk" cx="12" cy="12" r="10"/>${k === 'full' ? '<circle class="lit" cx="12" cy="12" r="10"/>' : ''}<circle class="rim" cx="12" cy="12" r="10"/></svg>`
  return `<div class="mtk" aria-hidden="true">${ico(from)}<span class="mtk-l"><i style="width:${(pos * 100).toFixed(1)}%"></i><b style="left:${(pos * 100).toFixed(1)}%"></b></span>${ico(to)}</div>`
}
