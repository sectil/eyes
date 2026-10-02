// Fark Ettin mi? caddesinin çizimi (SVG metni). Girdi lib/street.js genStreet çıktısı; çizimi lib/streetScenes.js sahne
// motoru yapar (katmanlar, ışık, adım atan kişiler, kendi hızında akan arabalar). İçerik tamamen uygulama içinde üretilir
// (kullanıcı metni yok), bu yüzden ekranda dangerouslySetInnerHTML ile güvenle basılır.
import { renderScene, H } from './streetScenes.js'
import { COLORS, CAT_COLORS, GROUND, VH, WALK_VY } from './street.js'

// Yürüyüş bandı: eski ekran (StreetWalk.jsx) svg yüksekliğini VH × ölçek, genişliğini L × ölçek alır; görünüm aynı
// oranda kırpılır (tabeladan yolun sonuna). F3'te ekran tam yüksekliğe (844) geçer: sceneSVG(s, { vy: 0, vh: H }).
export function streetSVG(s, opts = {}) {
  return renderScene(s, { vx: 0, vy: WALK_VY, vw: s.L, vh: VH, motion: true, walkSec: s.walkSec, label: 'Cadde', ...opts })
}
// Sahnenin herhangi bir kırpımı (vx, vy, vw, vh; varsayılan bütün yükseklik)
export const sceneSVG = (model, opts = {}) => renderScene(model, { vy: 0, vh: H, ...opts })

// Eski düz simgeler (bugünkü görev ekranının görev simgesi; viewBox eski zemine göre). F3'te kalkar.
const LEGACY_VH = 300
function c(k) { return COLORS[k]?.hex ?? k }
export function cat(t) { var f = CAT_COLORS[t.color], x = t.x, y = GROUND; return '<g><ellipse cx="' + x + '" cy="' + (y - 8) + '" rx="12" ry="8" fill="' + f + '" stroke="rgba(0,0,0,.25)"/><circle cx="' + (x + 11) + '" cy="' + (y - 16) + '" r="6.5" fill="' + f + '" stroke="rgba(0,0,0,.25)"/><path d="M' + (x + 6) + ' ' + (y - 21) + 'L' + (x + 8) + ' ' + (y - 28) + 'L' + (x + 11) + ' ' + (y - 22) + 'Z M' + (x + 12) + ' ' + (y - 22) + 'L' + (x + 15) + ' ' + (y - 28) + 'L' + (x + 17) + ' ' + (y - 20) + 'Z" fill="' + f + '"/><path d="M' + (x - 11) + ' ' + (y - 10) + 'Q' + (x - 22) + ' ' + (y - 20) + ' ' + (x - 16) + ' ' + (y - 28) + '" stroke="' + f + '" stroke-width="3" fill="none"/></g>' }
export function bike(b) { var x = b.x, y = GROUND, col = c(b.color); return '<g><circle cx="' + (x - 14) + '" cy="' + (y - 10) + '" r="10" fill="none" stroke="#2A2E33" stroke-width="2.5"/><circle cx="' + (x + 14) + '" cy="' + (y - 10) + '" r="10" fill="none" stroke="#2A2E33" stroke-width="2.5"/><path d="M' + (x - 14) + ' ' + (y - 10) + 'L' + (x - 2) + ' ' + (y - 26) + 'L' + (x + 10) + ' ' + (y - 26) + 'L' + (x + 14) + ' ' + (y - 10) + 'M' + (x - 2) + ' ' + (y - 26) + 'L' + x + ' ' + (y - 10) + 'L' + (x + 10) + ' ' + (y - 26) + '" stroke="' + col + '" stroke-width="3" fill="none"/><rect x="' + (x - 7) + '" y="' + (y - 30) + '" width="10" height="3" rx="1" fill="#2A2E33"/></g>' }
export function car(k) {
  var x = k.x, y = LEGACY_VH - 10, col = k.taxi ? '#F5C542' : c(k.color === 'gri' ? 'beyaz' : k.color)
  if (k.color === 'gri') col = '#9AA0A6'
  return '<g><path d="M' + (x - 44) + ' ' + (y - 12) + 'L' + (x - 40) + ' ' + (y - 26) + 'L' + (x - 24) + ' ' + (y - 28) + 'L' + (x - 14) + ' ' + (y - 42) + 'L' + (x + 18) + ' ' + (y - 42) + 'L' + (x + 30) + ' ' + (y - 28) + 'L' + (x + 44) + ' ' + (y - 24) + 'L' + (x + 46) + ' ' + (y - 12) + 'Z" fill="' + col + '" stroke="rgba(0,0,0,.35)"/>' +
    '<path d="M' + (x - 11) + ' ' + (y - 39) + 'L' + (x + 16) + ' ' + (y - 39) + 'L' + (x + 25) + ' ' + (y - 29) + 'L' + (x - 19) + ' ' + (y - 29) + 'Z" fill="#9CC3D8"/>' +
    (k.taxi ? '<rect x="' + (x - 7) + '" y="' + (y - 49) + '" width="16" height="7" rx="2" fill="#2A2E33"/><text x="' + (x + 1) + '" y="' + (y - 43.5) + '" text-anchor="middle" font-size="5" font-weight="800" fill="#F5C542" font-family="system-ui">TAKSİ</text>' : '') +
    '<circle cx="' + (x - 26) + '" cy="' + (y - 10) + '" r="9" fill="#1d1d1f"/><circle cx="' + (x + 28) + '" cy="' + (y - 10) + '" r="9" fill="#1d1d1f"/><circle cx="' + (x - 26) + '" cy="' + (y - 10) + '" r="3.5" fill="#9AA0A6"/><circle cx="' + (x + 28) + '" cy="' + (y - 10) + '" r="3.5" fill="#9AA0A6"/></g>'
}
