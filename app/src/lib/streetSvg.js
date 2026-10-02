// Fark Ettin mi? caddesinin çizimi (SVG metni). Girdi lib/street.js genStreet çıktısı; çizimi lib/streetScenes.js sahne
// motoru yapar (katmanlar, ışık, adım atan kişiler, kendi hızında akan arabalar). İçerik tamamen uygulama içinde üretilir
// (kullanıcı metni yok), bu yüzden ekranda dangerouslySetInnerHTML ile güvenle basılır.
import { renderScene, H, item, car as sceneCar, itemBox, sceneDefs, LANES, PAL, COLORS as C } from './streetScenes.js'
import { COLORS, CAT_COLORS, GROUND, VH, WALK_VY, TEMPLATES, coverBlocks } from './street.js'
import { person, SIGN, ROWS, Y, partBox, signBox, stallSignBox } from './streetScenes.js'

// Yürüyüş bandı: eski ekran (StreetWalk.jsx) svg yüksekliğini VH × ölçek, genişliğini L × ölçek alır; görünüm aynı
// oranda kırpılır (tabeladan yolun sonuna). F3'te ekran tam yüksekliğe (844) geçer: sceneSVG(s, { vy: 0, vh: H }).
export function streetSVG(s, opts = {}) {
  return renderScene(s, { vx: 0, vy: WALK_VY, vw: s.L, vh: VH, motion: true, walkSec: s.walkSec, label: 'Cadde', ...opts })
}
// Sahnenin herhangi bir kırpımı (vx, vy, vw, vh; varsayılan bütün yükseklik)
export const sceneSVG = (model, opts = {}) => renderScene(model, { vy: 0, vh: H, ...opts })

// Görev simgesi (görev ekranı): sayılan hedefin motordaki çizimi, kendi kutusuna kırpılmış. SVG metni.
const ICON = {
  blueCar: { car: { color: 'mavi' } }, taxi: { car: { color: 'sari', taxi: true } }, redCar: { car: { color: 'kirmizi' } },
  cat: { type: 'cat', color: 'turuncu' }, dog: { type: 'dog', color: 'kahve' }, bike: { type: 'bike', color: 'mavi' },
  ball: { type: 'ball', color: 'kirmizi' }, stroller: { type: 'stroller', color: 'mavi' }, pigeon: { type: 'pigeon' },
  watermelon: { type: 'watermelon' }, redCrate: { type: 'crate', color: 'kirmizi' }, basket: { type: 'basket' },
  flowerBucket: { type: 'bucket', color: 'kirmizi' },
  hat: { type: 'person', hat: 'kirmizi', top: 'mavi' }, glasses: { type: 'person', glasses: true, top: 'yesil' },
  redUmbrella: { type: 'person', umbrella: 'kirmizi', top: 'beyaz' }, yellowCoat: { type: 'person', coat: 'sari', top: 'sari' },
  balloon: { type: 'person', balloon: 'kirmizi', top: 'mor', s: 0.8 }, runner: { type: 'person', run: true, top: 'turuncu' },
  hatVendor: { type: 'person', hat: 'beyaz', top: 'beyaz', g: 'e' },
}
export function taskIconSVG(taskId, mode = 'day') {
  const p = PAL[mode] ?? PAL.day
  const wrap = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true">${sceneDefs(mode)}${body}</svg>`
  const spec = ICON[taskId]
  if (taskId === 'kite') return wrap('-30 -40 60 80', `<path d="M0 -36L22 -6L0 22L-22 -6Z" fill="${C.mavi.hex}"/><path d="M0 -36L0 22M-22 -6L22 -6" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M0 22q-8 8 2 16" stroke="${C.kirmizi.hex}" stroke-width="2.5" fill="none"/>`)
  if (taskId === 'litShop') return wrap('-34 -40 68 80', `<rect x="-32" y="-38" width="64" height="76" rx="4" fill="${p.frame}"/><rect x="-27" y="-33" width="54" height="66" fill="#F7D58A"/><rect x="-27" y="-33" width="54" height="66" fill="#FFF3C8" opacity=".35"/><circle cx="-12" cy="14" r="6" fill="${C.kirmizi.hex}"/><circle cx="4" cy="14" r="6" fill="${C.sari.hex}"/><circle cx="18" cy="14" r="5" fill="${C.mavi.hex}"/>`)
  if (!spec) return wrap('0 0 10 10', '')
  if (spec.car) return wrap(`-96 ${LANES.near - 88} 192 98`, sceneCar({ x: 0, lane: 'near', ...spec.car }, p, { m: mode }))
  const it = { x: 0, y: 0, dir: 1, skin: '#E0AC82', hair: 'kahve', walk: false, ...spec }
  const b = itemBox(it)
  const pad = 4
  // kişi: baş ve gövde (simge kutusunda okunur büyüklükte)
  if (it.type === 'person') return wrap(`${b.x - pad} ${b.y - pad} ${b.w + 2 * pad} ${Math.min(b.h, 96) + pad}`, item(it, p))
  return wrap(`${b.x - pad} ${b.y - pad} ${b.w + 2 * pad} ${b.h + 2 * pad + 4}`, item(it, p))
}

// "Gözünden kaçan" silüeti (PLAN §5b madde 4): konunun tek renkli simgesi (renk currentColor); cevabı vermez: renk
// yok, çalgı, çocuğun elindeki, satıcının malı ve tabela yazısı çizilmez; bacaklar ve gölge görünmez (alttan solar).
// Kutu baştan kalçaya (bacaklar kutunun dışında); yanındaki köpek, çocuk, bisiklet kutunun alt kenarına oturur
const SIL_BOX = { dogwalker: [-36, -150, 126, 112], child: [-36, -150, 100, 112], cyclist: [-36, -150, 120, 112], scooter: [-34, -122, 92, 96], kite: [-36, -340, 150, 290], vendor: [-75, -160, 180, 150], shop: [-90, -150, 180, 150], stall: [-125, -210, 250, 210] }
// Tek ton: gölge, ışık ve gölgelendirme katmanları (opacity'li parçalar) atılır; yüz çizgileri ve göz aynı tona karışır
const mono = (svg) => svg
  .replace(/<(rect|path|circle|ellipse)\b[^>]*\sopacity="[^"]*"[^>]*\/>/g, '')
  .replace(/(fill|stroke)="(#[0-9A-Fa-f]{3,8}|url\([^)]*\))"/g, '$1="currentColor"')
  .replace(/<text[^>]*>[^<]*<\/text>/g, '')
export function silhouetteSVG(id) {
  const t = TEMPLATES[id]
  const P0 = { x: 0, y: 0, dir: 1, walk: false, skin: '#999', hair: 'siyah', top: 'siyah' }
  let body = ''
  if (t?.person) {
    const q = { ...P0, ...t.person(t.pool?.[0] ?? null, () => 0) }
    delete q.instrument
    if (q.child) {
      delete q.child
      body += person({ x: 30, y: -38, s: 0.58, dir: 1, walk: false, skin: '#999', hair: 'kahve', top: 'sari' })
    }
    const dog = q.dog
    delete q.dog
    if (dog) body += `<path d="M9 -58Q30 -50 44 -64" stroke="#333" stroke-width="1.6" fill="none"/>` + item({ type: 'dog', x: 52, y: -38, color: 'siyah' })
    body += person(q)
  } else if (id === 'cyclist' || id === 'scooter') {
    const kid = id === 'scooter'
    body += item({ type: kid ? 'scooter' : 'bike', x: kid ? 10 : 44, y: kid ? -26 : -38, color: 'siyah' }) + person({ ...P0, s: kid ? 0.75 : 1 })
  } else if (id === 'vendor') {
    body += item({ type: 'vendor', x: 0, y: 0 })
  } else if (id === 'shop') {
    body += `<rect x="-80" y="-150" width="160" height="150" opacity=".35"/><rect x="-70" y="-146" width="140" height="22"/><path d="M-76 -118L76 -118L82 -96L-82 -96Z"/><rect x="-66" y="-86" width="90" height="70" opacity=".55"/><rect x="34" y="-88" width="30" height="88" opacity=".8"/>`
  } else if (id === 'stall') {
    body += `<rect x="-110" y="-190" width="6" height="190"/><rect x="104" y="-190" width="6" height="190"/><path d="M-122 -140L122 -140L106 -192L-106 -192Z"/><rect x="-40" y="-184" width="80" height="22" opacity=".45"/><rect x="-115" y="-60" width="230" height="60" opacity=".8"/>`
  }
  const [x, y, w, h] = SIL_BOX[id] ?? [-40, -150, 90, 150]
  // kutu kalçada temiz biter (karo kenarı keser; solma yok)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g fill="currentColor">${mono(body)}</g></svg>`
}
// Cevaptan sonra konunun kendisi, sahneden gerçek renkleriyle kırpılmış (4:5). Kırpımda yalnız konu (ve yanındaki
// köpek, çocuk, bisiklet, satıcı arabası) çizilir: kenarda yarım kişi ya da araba kalmaz; arka plan aynı cadde.
export function subjectSVG(street, id, opts = {}) {
  const sp = street.special ?? {}
  const bare = { ...street, people: [], cars: [], cats: [], bikes: [], vendors: [], stallVendors: [], items: [] }
  let v = null
  let model = bare
  if (id === 'shop' || id === 'stall') {
    const b = (id === 'shop' ? street.buildings : street.stalls)?.find((x) => x.aw === 'yesil')
    if (b) v = { vx: b.x - 12, vy: id === 'shop' ? SIGN.top - 14 : 360, vw: b.w + 24, vh: (b.w + 24) * 1.25 }
    if (id === 'stall') model = { ...bare, stallVendors: street.stallVendors ?? [] }
  } else if (id === 'vendor') {
    const vd = street.vendors?.[0]
    if (vd) {
      model = { ...bare, vendors: [vd] }
      v = { vx: vd.x - 70, vy: ROWS[0] + 4 - 196, vw: 170, vh: 212 }
    }
  } else {
    const p = sp[id === 'child' ? 'mother' : id]
    if (p) {
      model = { ...bare, people: [p], items: (street.items ?? []).filter((i) => i.id === id) }
      const wide = ['dogwalker', 'child', 'cyclist'].includes(id)
      const vw = wide ? 170 : 124
      const cx = p.x + (wide ? 26 * (p.dir || 1) : 0)
      v = { vx: cx - vw / 2, vy: Math.max(p.y + 6 - vw * 1.25, SIGN.top + SIGN.h + 2), vw, vh: vw * 1.25 } // tabela kırpıma yarım girmez
      if (id === 'kite') v = { vx: p.x - 90, vy: p.y + 6 - 350, vw: 280, vh: 350 }
    }
  }
  return v ? renderScene(model, { ...v, motion: false, ...opts }) : null
}

// ---------- "Gözünden kaçan" kartı (tasarım tur 2: cam figür) ----------
// Kart üç adımda aynı kırpım ve aynı katmanlar: base (konusuz sahne, hep opak), glass (konunun cam figürü: arkadaki
// sahnenin bulanık, renksiz, orta tona çekilmiş kopyası konunun biçiminde), real (konunun gerçek renkli çizimi).
// 11'de yalnız glass → real geçer; sahne solmaz. Cam renk ve nesne taşımaz: renk yok, çalgı, çocuğun elindeki, satıcının
// malı çizilmez; shop/stall'da konu yerin kendisi (levha boş, vitrin malı yok). Tonu her temada orta: seçeneklerin hiçbir
// rengine (beyaz, siyah) yakın değil (ölçüt: figür ortalama açıklığı L* 40–65).
const stripSvg = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
const union = (bs) => {
  const x0 = Math.min(...bs.map((b) => b.x)), y0 = Math.min(...bs.map((b) => b.y))
  return { x: x0, y: y0, w: Math.max(...bs.map((b) => b.x + b.w)) - x0, h: Math.max(...bs.map((b) => b.y + b.h)) - y0 }
}
const circleOf = (b, pad = 6) => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2, r: Math.max(20, Math.hypot(b.w, b.h) / 2 + pad) })
// Konunun çizimi ve sorulan parçası (sahne biriminde)
export function missedSubject(street, id) {
  const sp = street.special ?? {}
  if (id === 'shop' || id === 'stall') {
    const st = id === 'stall'
    const b = (st ? street.stalls : street.buildings)?.find((x) => x.aw === 'yesil')
    if (!b) return null
    const ask = st ? stallSignBox(b) : signBox(b)
    return { place: true, blank: b.x, x: b.x + b.w / 2, feet: st ? Y.side + 30 : Y.side, box: { x: b.x, y: ask.y, w: b.w, h: Y.side - ask.y }, ring: circleOf(ask, 4), draw: () => '' }
  }
  if (id === 'vendor') {
    const v = street.vendors?.[0]
    if (!v) return null
    const it = { y: ROWS[0] + 4, ...v, goods: v.type, type: 'vendor' }
    const b = itemBox(it)
    const cart = { x: v.x - 46, y: it.y - 74, w: 92, h: 74 } // sorulan: arabadaki mal
    return { x: v.x, feet: it.y, box: b, ring: circleOf(cart, 0), draw: (pal, bare) => item(bare ? { ...it, goods: null } : it, pal) }
  }
  const p = sp[id === 'child' ? 'mother' : id]
  if (!p) return null
  const q = { ...p, walk: false }
  const extras = (street.items ?? []).filter((i) => i.id === id)
  const s = q.s || 1
  const dir = q.dir || 1
  const local = (x, y, w, h) => ({ x: q.x + (dir === -1 ? -(x + w) : x) * s, y: q.y + y * s, w: w * s, h: h * s })
  const box = union([itemBox({ ...q, type: 'person' }), ...extras.map(itemBox), ...(q.kite ? [local(48, -334, 44, 62)] : [])])
  const part = {
    dogwalker: () => ({ cx: q.x + dir * 64.3 * s, cy: q.y - 22 * s, r: 36 * s }),
    hat: () => circleOf(partBox(q, 'hat')), helmet: () => circleOf(partBox(q, 'hat')), blonde: () => circleOf(partBox(q, 'bag')),
    scarf: () => circleOf(partBox(q, 'scarf')), umbrella: () => circleOf(partBox(q, 'umbrella'), 2),
    laugh: () => circleOf(partBox(q, 'top')), beard: () => circleOf(partBox(q, 'top')), cane: () => circleOf(partBox(q, 'top')),
    flowers: () => circleOf(local(4, -98, 20, 42)), musician: () => circleOf(local(-20, -100, 44, 56)),
    child: () => circleOf(local(10, -84, 40, 84)), kite: () => circleOf(local(48, -334, 44, 62)),
    cyclist: () => circleOf(itemBox(extras[0] ?? q)), scooter: () => circleOf(itemBox(extras[0] ?? q)),
  }
  // cam: cevabı taşıyan parça çizilmez (çalgı, çocuğun elindeki)
  const bareQ = { ...q }
  delete bareQ.instrument
  const childItem = q.child
  return {
    x: q.x, feet: q.y, box, ring: (part[id] ?? (() => circleOf(box)))(),
    draw: (pal, bare) => person(bare ? { ...bareQ, child: childItem ? 'none' : undefined } : q, pal) + extras.map((i) => item(i, pal)).join(''),
  }
}
// Kart kırpımı: konunun bloğu (bina/tezgâh/arka bina) tam; alt kenar ayakların altında (yazı hapına yer: footPx piksel,
// kart genişliği wPx), kutu oranı ratio = genişlik/yükseklik. Konu (uçurtma dahil) sığmazsa kırpım genişler.
export function missedView(street, subj, ratio, footPx = 40, wPx = 350) {
  const blocks = coverBlocks(street)
  // konunun bloğu tam (tabela tam); konu (köpek, bisiklet dahil) bloğa sığmıyorsa kırpım konunun ortasına kayar (yarım
  // tabela wholeSigns ile çizilmez; konu kenarda bölünmez)
  const pad = 14
  const need = { x0: subj.box.x - pad, x1: subj.box.x + subj.box.w + pad }
  const bl = blocks.find((b) => subj.x >= b.x && subj.x < b.x + b.w)
  const fits = bl && bl.x <= need.x0 && bl.x + bl.w >= need.x1
  let vw = Math.max(bl?.w ?? 0, need.x1 - need.x0, 220)
  let vh = vw / ratio
  const bottom = subj.feet + 8 + (footPx * vw) / wPx
  if (bottom - vh > subj.box.y - 12) { vh = bottom - subj.box.y + 12; vw = vh * ratio }
  const cx = fits && vw === bl.w ? bl.x + bl.w / 2 : (need.x0 + need.x1) / 2
  return { vx: cx - vw / 2, vy: bottom - vh, vw, vh }
}
const toMask = (svg) => svg
  .replace(/<(rect|path|circle|ellipse)\b[^>]*\sopacity="[^"]*"[^>]*\/>/g, '')
  .replace(/(fill|stroke)="(#[0-9A-Fa-f]{3,8}|url\([^)]*\))"/g, '$1="#fff"')
  .replace(/stroke-opacity="[^"]*"/g, '')
const shading = (svg) => (svg.match(/<(rect|path|circle|ellipse)\b[^>]*\sopacity="[^"]*"[^>]*\/>|<g[^>]*>|<\/g>/g) ?? []).join('').replace(/<ellipse[^>]*opacity="\.1[24]"[^>]*\/>/g, '')
// Cam tonu: bulanık sahne → renksiz → orta tona sıkıştırılmış (ölçüm: figür ortalaması L* 40–65 bandının ortasında); temaya göre küçük kaydırma
const GLASS_TONE = { day: { slope: 0.26, icpt: 0.15 }, dusk: { slope: 0.3, icpt: 0.2 }, rain: { slope: 0.26, icpt: 0.16 } }
export function missedCard(street, id, { ratio = 0.75, mode = 'day', label, uid = 'g', footPx = 40, wPx = 350, view } = {}) {
  const subj = missedSubject(street, id)
  if (!subj) return null
  const v = view?.(subj) ?? missedView(street, subj, ratio, footPx, wPx)
  const bare = { ...street, people: [], cars: [], cats: [], bikes: [], vendors: [], stallVendors: id === 'stall' ? street.stallVendors ?? [] : [], items: [] }
  const ro = { ...v, mode, motion: false, wholeSigns: true, edgeDecor: false, label }
  const base = renderScene(bare, subj.place ? { ...ro, blank: subj.blank } : ro)
  const real = subj.place ? renderScene(bare, ro) : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vx} ${v.vy} ${v.vw} ${v.vh}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">${subj.draw(PAL[mode] ?? PAL.day)}</svg>`
  let glass = ''
  if (!subj.place) {
    const sc = stripSvg(base)
    const fig = subj.draw(PAL.day, true)
    const m = toMask(fig)
    const t = GLASS_TONE[mode] ?? GLASS_TONE.day
    const id2 = (n) => `sw-${uid}-${n}`
    const tf = `<feFuncR type="linear" slope="${t.slope}" intercept="${t.icpt}"/><feFuncG type="linear" slope="${t.slope}" intercept="${t.icpt}"/><feFuncB type="linear" slope="${t.slope}" intercept="${t.icpt}"/>`
    glass = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vx} ${v.vy} ${v.vw} ${v.vh}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true"><defs>` +
      `<filter id="${id2('frost')}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="6"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${tf}</feComponentTransfer></filter>` +
      `<filter id="${id2('bevel')}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="er"/><feComposite in="SourceAlpha" in2="er" operator="out" result="in"/><feGaussianBlur in="in" stdDeviation="1.1" result="b"/><feFlood flood-color="#0b1219" flood-opacity=".35"/><feComposite in2="b" operator="in"/></filter>` +
      `<filter id="${id2('rim')}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="0.9" result="d"/><feComposite in="d" in2="SourceAlpha" operator="out" result="e"/><feFlood flood-color="#fff" flood-opacity=".9"/><feComposite in2="e" operator="in"/></filter>` +
      `<mask id="${id2('m')}" maskUnits="userSpaceOnUse" x="${v.vx}" y="${v.vy}" width="${v.vw}" height="${v.vh}">${m}</mask></defs>` +
      `<g mask="url(#${id2('m')})"><g filter="url(#${id2('frost')})">${sc}</g><g opacity=".45">${shading(subj.draw(PAL.day))}</g></g>` +
      `<g filter="url(#${id2('bevel')})">${m}</g><g filter="url(#${id2('rim')})">${m}</g>` +
      // ölçüm sondası (düzenek: figür alanı; görünmez)
      `<g class="sw-probe" style="display:none">${m.replace(/#fff/g, '#ff00ff')}</g></svg>`
  }
  return { view: v, base, glass, real, ring: subj.ring, place: Boolean(subj.place), subj }
}
// Sonuç satırının küçük resmi: konu kendi binasının önünde, kutunun içinde tam (köpek, bisiklet, uçurtma dahil)
export function subjectThumb(street, id, { mode = 'day', ratio = 40 / 44, label } = {}) {
  const subj = missedSubject(street, id)
  if (!subj) return null
  const b = subj.place ? { ...subj.box, y: subj.box.y - 4, h: subj.box.h + 8 } : subj.box
  let vh = Math.max(b.h + 14, (b.w + 12) / ratio)
  const vw = vh * ratio
  const v = { vx: b.x + b.w / 2 - vw / 2, vy: b.y + b.h + 6 - vh, vw, vh }
  const bare = { ...street, people: [], cars: [], cats: [], bikes: [], vendors: [], stallVendors: id === 'stall' ? street.stallVendors ?? [] : [], items: [] }
  const sc = renderScene(bare, { ...v, mode, motion: false, wholeSigns: true, edgeDecor: false, label })
  return sc.replace(/<\/svg>$/, `${subj.draw(PAL[mode] ?? PAL.day)}</svg>`)
}

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
