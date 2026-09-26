// Fark Ettin mi? caddesinin çizimi (SVG metni). Girdi lib/street.js genStreet çıktısı; içerik tamamen uygulama
// içinde üretilir (kullanıcı metni yok), bu yüzden ekranda dangerouslySetInnerHTML ile güvenle basılır.
// Taslaktaki (Artifact "Fark Ettin mi?") çizimin aynısı.
import { COLORS, HAIR, CAT_COLORS, GROUND, VH } from './street.js'

function c(k) { return COLORS[k]?.hex ?? k }
function building(b) {
  var top = GROUND - b.h, sw = ''
  for (var wy = top + 16; wy < GROUND - 90; wy += 34) for (var wx = b.x + 16; wx < b.x + b.w - 28; wx += 34) sw += '<rect x="' + wx + '" y="' + wy + '" width="20" height="22" rx="2" fill="#8FB7CC" opacity=".85"/>'
  var aw = c(b.aw), stripes = ''
  for (var ax = b.x + 6; ax < b.x + b.w - 6; ax += 16) stripes += '<rect x="' + ax + '" y="' + (GROUND - 78) + '" width="8" height="16" fill="#fff" opacity=".45"/>'
  return '<g><rect x="' + b.x + '" y="' + top + '" width="' + b.w + '" height="' + b.h + '" fill="' + b.body + '"/>' + sw +
    '<rect x="' + (b.x + 10) + '" y="' + (GROUND - 100) + '" width="' + (b.w - 20) + '" height="20" rx="3" fill="#2A2E33"/>' +
    '<text x="' + (b.x + b.w / 2) + '" y="' + (GROUND - 85) + '" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-weight="800" font-size="13" fill="#F4F4F4" letter-spacing="1">' + b.shop + '</text>' +
    '<rect x="' + (b.x + 4) + '" y="' + (GROUND - 78) + '" width="' + (b.w - 8) + '" height="16" fill="' + aw + '"/>' + stripes +
    '<rect x="' + (b.x + 14) + '" y="' + (GROUND - 60) + '" width="' + (b.w - 70) + '" height="44" fill="#A8C9DA" opacity=".9"/>' +
    '<rect x="' + (b.x + b.w - 46) + '" y="' + (GROUND - 60) + '" width="28" height="60" fill="#5A4636"/></g>'
}
function tree(t) { return '<g><rect x="' + (t.x - 4) + '" y="' + (GROUND - 60) + '" width="8" height="60" fill="#6B4A2F"/><circle cx="' + t.x + '" cy="' + (GROUND - 78) + '" r="30" fill="#3E9A5B"/><circle cx="' + (t.x - 18) + '" cy="' + (GROUND - 66) + '" r="18" fill="#358A50"/></g>' }
function lamp(l) { return '<g><rect x="' + (l.x - 2) + '" y="' + (GROUND - 120) + '" width="4" height="120" fill="#3A4048"/><rect x="' + (l.x - 10) + '" y="' + (GROUND - 128) + '" width="20" height="10" rx="3" fill="#3A4048"/><circle cx="' + l.x + '" cy="' + (GROUND - 116) + '" r="4" fill="#FFE39A"/></g>' }
function person(p, scale, extra) {
  var s = scale || 1, x = p.x, y = GROUND
  var k = function (v) { return (v * s).toFixed(1) }
  var top = c(p.top), skin = p.skin, hair = HAIR[p.hair], legs = p.dress ? skin : '#3A4452', out = ''
  out += '<g class="bob"' + (extra || '') + '>'
  out += '<rect x="' + (x - 7 * s) + '" y="' + (y - 30 * s) + '" width="' + k(5) + '" height="' + k(30) + '" rx="2" fill="' + legs + '"/><rect x="' + (x + 2 * s) + '" y="' + (y - 30 * s) + '" width="' + k(5) + '" height="' + k(30) + '" rx="2" fill="' + legs + '"/>'
  if (p.dress) out += '<path d="M' + (x - 11 * s) + ' ' + (y - 58 * s) + 'L' + (x + 11 * s) + ' ' + (y - 58 * s) + 'L' + (x + 17 * s) + ' ' + (y - 24 * s) + 'L' + (x - 17 * s) + ' ' + (y - 24 * s) + 'Z" fill="' + top + '" stroke="rgba(0,0,0,.18)"/>'
  else out += '<rect x="' + (x - 11 * s) + '" y="' + (y - 58 * s) + '" width="' + k(22) + '" height="' + k(30) + '" rx="' + k(5) + '" fill="' + top + '" stroke="rgba(0,0,0,.18)"/>'
  out += '<rect x="' + (x - 15 * s) + '" y="' + (y - 56 * s) + '" width="' + k(4) + '" height="' + k(24) + '" rx="2" fill="' + skin + '"/><rect x="' + (x + 11 * s) + '" y="' + (y - 56 * s) + '" width="' + k(4) + '" height="' + k(24) + '" rx="2" fill="' + skin + '"/>'
  var hy = y - 70 * s
  if (p.g === 'k') out += '<path d="M' + (x - 11 * s) + ' ' + (hy + 12 * s) + 'Q' + x + ' ' + (hy - 18 * s) + ' ' + (x + 11 * s) + ' ' + (hy + 12 * s) + 'L' + (x + 12 * s) + ' ' + (hy + 20 * s) + 'L' + (x - 12 * s) + ' ' + (hy + 20 * s) + 'Z" fill="' + hair + '"/>'
  out += '<circle cx="' + x + '" cy="' + hy + '" r="' + k(10) + '" fill="' + skin + '"/>'
  out += '<path d="M' + (x - 10 * s) + ' ' + (hy - 2 * s) + 'Q' + x + ' ' + (hy - 16 * s) + ' ' + (x + 10 * s) + ' ' + (hy - 2 * s) + 'Z" fill="' + hair + '"/>'
  out += '<circle cx="' + (x - 3.5 * s) + '" cy="' + (hy + 1 * s) + '" r="' + k(1.3) + '" fill="#1d1d1f"/><circle cx="' + (x + 3.5 * s) + '" cy="' + (hy + 1 * s) + '" r="' + k(1.3) + '" fill="#1d1d1f"/>'
  if (p.laugh) out += '<ellipse cx="' + x + '" cy="' + (hy + 5.5 * s) + '" rx="' + k(4) + '" ry="' + k(3) + '" fill="#7A1F2B"/><text x="' + (x + 13 * s) + '" y="' + (hy - 10 * s) + '" font-family="Onest, system-ui" font-weight="800" font-size="' + k(10) + '" fill="#2A2E33">ha ha</text>'
  else out += '<path d="M' + (x - 3 * s) + ' ' + (hy + 5 * s) + 'Q' + x + ' ' + (hy + 7 * s) + ' ' + (x + 3 * s) + ' ' + (hy + 5 * s) + '" stroke="#5A2A2A" stroke-width="' + k(1.2) + '" fill="none"/>'
  if (p.hat) out += '<rect x="' + (x - 13 * s) + '" y="' + (hy - 10 * s) + '" width="' + k(26) + '" height="' + k(4) + '" rx="2" fill="' + c(p.hat) + '"/><rect x="' + (x - 8 * s) + '" y="' + (hy - 20 * s) + '" width="' + k(16) + '" height="' + k(11) + '" rx="3" fill="' + c(p.hat) + '"/>'
  if (p.bag) out += '<path d="M' + (x + 12 * s) + ' ' + (y - 56 * s) + 'L' + (x + 18 * s) + ' ' + (y - 40 * s) + '" stroke="#2A2E33" stroke-width="' + k(1.4) + '"/><rect x="' + (x + 13 * s) + '" y="' + (y - 42 * s) + '" width="' + k(12) + '" height="' + k(11) + '" rx="2" fill="' + c(p.bag) + '" stroke="rgba(0,0,0,.25)"/>'
  if (p.phone) out += '<rect x="' + (x + 8 * s) + '" y="' + (hy - 3 * s) + '" width="' + k(4) + '" height="' + k(8) + '" rx="1" fill="#1d1d1f"/>'
  out += '</g>'
  if (p.child) {
    var cx = x + 24, kid = { x: cx, g: 'e', hair: 'kahve', skin: skin, top: 'sari', dress: false }
    out += person(kid, 0.58)
    var iy = GROUND - 44, it = p.child
    if (it === 'balon') out += '<path d="M' + (cx + 8) + ' ' + (iy + 6) + 'L' + (cx + 12) + ' ' + (iy - 34) + '" stroke="#555" stroke-width="1"/><ellipse cx="' + (cx + 13) + '" cy="' + (iy - 44) + '" rx="9" ry="11" fill="#E5484D"/>'
    if (it === 'dondurma') out += '<path d="M' + (cx + 7) + ' ' + (iy + 2) + 'L' + (cx + 13) + ' ' + (iy + 2) + 'L' + (cx + 10) + ' ' + (iy + 14) + 'Z" fill="#D9A15B"/><circle cx="' + (cx + 10) + '" cy="' + (iy - 1) + '" r="5" fill="#F4B6C8"/>'
    if (it === 'ayi') out += '<circle cx="' + (cx + 11) + '" cy="' + (iy + 4) + '" r="6" fill="#9B6B43"/><circle cx="' + (cx + 11) + '" cy="' + (iy - 5) + '" r="4.5" fill="#9B6B43"/><circle cx="' + (cx + 8) + '" cy="' + (iy - 9) + '" r="2" fill="#9B6B43"/><circle cx="' + (cx + 14) + '" cy="' + (iy - 9) + '" r="2" fill="#9B6B43"/>'
    if (it === 'bayrak') out += '<path d="M' + (cx + 9) + ' ' + (iy + 8) + 'L' + (cx + 9) + ' ' + (iy - 22) + '" stroke="#555" stroke-width="1.4"/><rect x="' + (cx + 9) + '" y="' + (iy - 22) + '" width="16" height="11" fill="#E5484D"/><circle cx="' + (cx + 15) + '" cy="' + (iy - 16.5) + '" r="3" fill="#fff"/>'
  }
  return out
}
export function cat(t) { var f = CAT_COLORS[t.color], x = t.x, y = GROUND; return '<g><ellipse cx="' + x + '" cy="' + (y - 8) + '" rx="12" ry="8" fill="' + f + '" stroke="rgba(0,0,0,.25)"/><circle cx="' + (x + 11) + '" cy="' + (y - 16) + '" r="6.5" fill="' + f + '" stroke="rgba(0,0,0,.25)"/><path d="M' + (x + 6) + ' ' + (y - 21) + 'L' + (x + 8) + ' ' + (y - 28) + 'L' + (x + 11) + ' ' + (y - 22) + 'Z M' + (x + 12) + ' ' + (y - 22) + 'L' + (x + 15) + ' ' + (y - 28) + 'L' + (x + 17) + ' ' + (y - 20) + 'Z" fill="' + f + '"/><path d="M' + (x - 11) + ' ' + (y - 10) + 'Q' + (x - 22) + ' ' + (y - 20) + ' ' + (x - 16) + ' ' + (y - 28) + '" stroke="' + f + '" stroke-width="3" fill="none"/></g>' }
export function bike(b) { var x = b.x, y = GROUND, col = c(b.color); return '<g><circle cx="' + (x - 14) + '" cy="' + (y - 10) + '" r="10" fill="none" stroke="#2A2E33" stroke-width="2.5"/><circle cx="' + (x + 14) + '" cy="' + (y - 10) + '" r="10" fill="none" stroke="#2A2E33" stroke-width="2.5"/><path d="M' + (x - 14) + ' ' + (y - 10) + 'L' + (x - 2) + ' ' + (y - 26) + 'L' + (x + 10) + ' ' + (y - 26) + 'L' + (x + 14) + ' ' + (y - 10) + 'M' + (x - 2) + ' ' + (y - 26) + 'L' + x + ' ' + (y - 10) + 'L' + (x + 10) + ' ' + (y - 26) + '" stroke="' + col + '" stroke-width="3" fill="none"/><rect x="' + (x - 7) + '" y="' + (y - 30) + '" width="10" height="3" rx="1" fill="#2A2E33"/></g>' }
function vendor(v) {
  var x = v.x, y = GROUND, goods = ''
  if (v.type === 'simit') for (var i = 0; i < 4; i++) goods += '<circle cx="' + (x - 18 + i * 12) + '" cy="' + (y - 42) + '" r="5" fill="none" stroke="#B9762F" stroke-width="3.5"/>'
  if (v.type === 'misir') for (var j = 0; j < 4; j++) goods += '<rect x="' + (x - 20 + j * 11) + '" y="' + (y - 50) + '" width="6" height="14" rx="3" fill="#F2C94C"/>'
  if (v.type === 'kestane') for (var k = 0; k < 6; k++) goods += '<circle cx="' + (x - 18 + (k % 3) * 12) + '" cy="' + (y - 44 + Math.floor(k / 3) * 6) + '" r="4" fill="#7A4A2A"/>'
  if (v.type === 'cicek') for (var m = 0; m < 4; m++) goods += '<circle cx="' + (x - 18 + m * 12) + '" cy="' + (y - 46) + '" r="5" fill="' + ['#E5484D', '#F5C542', '#8E6CEF', '#F28C38'][m] + '"/>'
  return '<g><rect x="' + (x - 26) + '" y="' + (y - 36) + '" width="52" height="22" rx="3" fill="#C23B3B"/><rect x="' + (x - 26) + '" y="' + (y - 40) + '" width="52" height="5" fill="#8E2A2A"/>' + goods +
    '<circle cx="' + (x - 16) + '" cy="' + (y - 7) + '" r="7" fill="#2A2E33"/><circle cx="' + (x + 16) + '" cy="' + (y - 7) + '" r="7" fill="#2A2E33"/><rect x="' + (x - 30) + '" y="' + (y - 78) + '" width="60" height="6" rx="3" fill="#F2F2F2"/><rect x="' + (x - 1.5) + '" y="' + (y - 74) + '" width="3" height="36" fill="#9AA0A6"/></g>' +
    person({ x: x + 36, g: 'e', hair: 'gri', skin: '#C68A5E', top: 'beyaz', dress: false })
}
export function car(k) {
  var x = k.x, y = VH - 10, col = k.taxi ? '#F5C542' : c(k.color === 'gri' ? 'beyaz' : k.color)
  if (k.color === 'gri') col = '#9AA0A6'
  return '<g><path d="M' + (x - 44) + ' ' + (y - 12) + 'L' + (x - 40) + ' ' + (y - 26) + 'L' + (x - 24) + ' ' + (y - 28) + 'L' + (x - 14) + ' ' + (y - 42) + 'L' + (x + 18) + ' ' + (y - 42) + 'L' + (x + 30) + ' ' + (y - 28) + 'L' + (x + 44) + ' ' + (y - 24) + 'L' + (x + 46) + ' ' + (y - 12) + 'Z" fill="' + col + '" stroke="rgba(0,0,0,.35)"/>' +
    '<path d="M' + (x - 11) + ' ' + (y - 39) + 'L' + (x + 16) + ' ' + (y - 39) + 'L' + (x + 25) + ' ' + (y - 29) + 'L' + (x - 19) + ' ' + (y - 29) + 'Z" fill="#9CC3D8"/>' +
    (k.taxi ? '<rect x="' + (x - 7) + '" y="' + (y - 49) + '" width="16" height="7" rx="2" fill="#2A2E33"/><text x="' + (x + 1) + '" y="' + (y - 43.5) + '" text-anchor="middle" font-size="5" font-weight="800" fill="#F5C542" font-family="system-ui">TAKSİ</text>' : '') +
    '<circle cx="' + (x - 26) + '" cy="' + (y - 10) + '" r="9" fill="#1d1d1f"/><circle cx="' + (x + 28) + '" cy="' + (y - 10) + '" r="9" fill="#1d1d1f"/><circle cx="' + (x - 26) + '" cy="' + (y - 10) + '" r="3.5" fill="#9AA0A6"/><circle cx="' + (x + 28) + '" cy="' + (y - 10) + '" r="3.5" fill="#9AA0A6"/></g>'
}
export function streetSVG(s) {
  var o = '<svg viewBox="0 0 ' + s.L + ' ' + VH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cadde">'
  o += '<rect width="' + s.L + '" height="' + VH + '" fill="#CFE7F2"/>'
  s.buildings.forEach(function (b) { o += building(b) })
  o += '<rect y="' + GROUND + '" width="' + s.L + '" height="10" fill="#B7B1A6"/><rect y="' + (GROUND + 10) + '" width="' + s.L + '" height="' + (VH - GROUND - 10) + '" fill="#4A4F57"/>'
  for (var d = 20; d < s.L; d += 60) o += '<rect x="' + d + '" y="' + (GROUND + 30) + '" width="30" height="3" fill="#E9E4D6" opacity=".6"/>'
  s.trees.forEach(function (t) { o += tree(t) }); s.lamps.forEach(function (l) { o += lamp(l) })
  s.bikes.forEach(function (b) { o += bike(b) }); s.cats.forEach(function (t) { o += cat(t) }); s.vendors.forEach(function (v) { o += vendor(v) })
  s.people.slice().sort(function (a, b) { return a.x - b.x }).forEach(function (p, i) { o += person(p, 1, ' style="animation-delay:-' + (i * 0.13).toFixed(2) + 's"') })
  s.cars.forEach(function (k) { o += car(k) })
  return o + '</svg>'
}

