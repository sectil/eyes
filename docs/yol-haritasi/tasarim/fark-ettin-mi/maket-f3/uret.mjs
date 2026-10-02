// Maket verisi üretici: uygulamanın GERÇEK sahne üreticilerini (app/src/lib/streetScenes.js, streetSvg.js,
// streetChange.js, street.js) ve onaylı metin kaynağını (streetText.js) çalıştırır, SVG'leri ve metinleri sahne.js'e
// (window.SAHNE) yazar. Uygulama dosyalarına dokunmaz; yalnız okur. Çalıştırma: node calistir.mjs (Vite SSR).
// Kırpım kuralı (kapı tur 2; app/src/lib/street.js coverView/coverModel ile aynı mantık): yan kenarlar bina sınırında,
// tabela ya tam ya hiç; kenarda bölünecek kişi/öğe çizilmez. Kesin viewBox ekranda kutunun oranına göre seçilir
// (maket.html fitView); burada bina sınırlı aday aralıklar ve geniş çizimler üretilir.
import { writeFileSync } from 'node:fs'
import { renderScene, person, item, PAL, COLORS, SIGN, Y } from '/home/user/eyes/app/src/lib/streetScenes.js'
import { taskIconSVG } from '/home/user/eyes/app/src/lib/streetSvg.js'
import { genStreet, FACTS, coverModel, coverBlocks } from '/home/user/eyes/app/src/lib/street.js'
import { makeFrame, nextN } from '/home/user/eyes/app/src/lib/streetChange.js'
import { say, lines, taskLines, missedLines, changeSentence, countRow, factLines, sceneName, glue, splitFirst, resultHead, optionText } from '/home/user/eyes/app/src/lib/streetText.js'

const OUT = new URL('./sahne.js', import.meta.url).pathname
const SEED = 124
const TASK = 'blueCar'
const s = genStreet(SEED, 2, { scene: 'cadde', taskId: TASK, subjects: ['dogwalker', 'helmet', 'laugh', 'hat'], answers: { dogwalker: 'sari', helmet: 'turuncu' } })
const MODES = ['day', 'dusk'] // açık tema: gündüz; koyu tema: akşam paleti (StreetWalk modeFor)
const n0 = s.counts[TASK] // 5
const answer = n0 - 1 // "Çok yakın" durumu
const blocks = coverBlocks(s).filter((b) => b.x >= 0 && b.x + b.w <= s.L).sort((a, b) => a.x - b.x)
const strip = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
const svgOpen = (v, par = 'xMidYMid slice') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vx} ${v.vy} ${v.vw} ${v.vh}" preserveAspectRatio="${par}" width="100%" height="100%" aria-hidden="true">`

// ---------- 04 · yürüyüşün sonu: araba yok (soru "mavi araba", görünen beyaz araba şaşırtıyordu), konular yok ----------
// Aday aralıklar: caddenin sonundan geriye 1–4 bina; her aday kendi coverModel'iyle (kenarda bölünen kişi çizilmez)
const panelBase = { ...s, people: s.people.filter((p) => !p.id), cars: [], items: s.items.filter((i) => !i.id), vendors: [] }
const panelCands = []
for (let k = 1; k <= 4; k++) {
  const last = blocks.length - 1
  const x0 = blocks[last - k + 1].x
  const x1 = blocks[last].x + blocks[last].w
  panelCands.push({ vx: x0, vw: x1 - x0 })
}

// ---------- 05/06 ve 12 · Ne değişti? kareleri ----------
const SPECS = [
  { obj: 'hat', kind: 'renk', anchor: 3, seed: 4101 },
  { obj: 'door', kind: 'renk', anchor: 5, seed: 4202 },
  { obj: 'cat', kind: 'yer', anchor: 1, seed: 4303 },
  { obj: 'pot', kind: 'gelir', anchor: 7, seed: 4404 },
]
const RESULTS = [{ looks: 1, found: true }, { looks: 3, found: false }, { looks: 1, found: true }, { looks: 1, found: true }]
let n = 12
const frames = SPECS.map((spec, i) => {
  const f = makeFrame(s, spec, n)
  const res = RESULTS[i]
  const out = { n: f.n, view: f.view, box: f.box, hit: f.hit, kind: f.kind, found: res.found, looks: res.looks, change: changeSentence(f.change), f }
  n = nextN(n, res)
  return out
})
const foundN = frames.filter((f) => f.found).map((f) => f.n)
const changeN = Math.max(...foundN)

// ---------- 09–11 · konu: cam ve gerçek hâl AYNI çizimden ----------
// Sahip person() ile (köpeksiz); tasma elden (6,−58) köpeğin boynuna (72,−31); köpek item(dog) person()'daki yer ve
// ölçekte (58·s, 0.9·s). Motor bugün tasmayı köpeğin kuyruğuna bağlıyor (streetScenes.js person q.dog): koda aktarımda
// tasma ucu k(72) k(−31) olmalı (TASARIM.md).
const sp = s.special.dogwalker
const dir = sp.dir || 1
const k1 = sp.s || 1
const DOG_COLOR = s.special.dogwalker.dog
const subjBlock = blocks.findIndex((b) => sp.x >= b.x && sp.x < b.x + b.w)
const subjRange = { x0: blocks[Math.max(0, subjBlock - 1)].x, x1: blocks[Math.min(blocks.length - 1, subjBlock + 1)].x + blocks[Math.min(blocks.length - 1, subjBlock + 1)].w }
const bare = { ...s, people: [], cars: [], cats: [], bikes: [], vendors: [], stallVendors: [], items: [] }
const leash = (stroke) => `<path d="M${6 * k1} ${-57 * k1}Q${40 * k1} ${-38 * k1} ${72 * k1} ${-31 * k1}" stroke="${stroke}" stroke-width="${1.6 * k1}" fill="none" stroke-linecap="round"/>`
const collar = (fill) => `<rect x="12" y="-42" width="5" height="14" rx="2.2" fill="${fill}"/>`
function subject(p, pal, { mono = false } = {}) {
  const owner = person({ ...p, dog: null, walk: false }, pal)
  const dog = `<g transform="translate(${p.x} ${p.y}) scale(${dir} 1)"><g transform="translate(${58 * k1} 0) scale(${0.9 * k1})">${item({ type: 'dog', x: 0, y: 0, dir: 1, color: mono ? 'beyaz' : DOG_COLOR }, pal)}${collar(mono ? '#fff' : '#2A2E33')}</g>${leash(mono ? '#fff' : '#2A2E33')}</g>`
  return { owner, dog }
}
// Tek ton (maske): gölge ve ışık katmanları atılır, kalan her şey beyaz
const toMask = (svg) => svg
  .replace(/<(rect|path|circle|ellipse)\b[^>]*\sopacity="[^"]*"[^>]*\/>/g, '')
  .replace(/(fill|stroke)="(#[0-9A-Fa-f]{3,8}|url\([^)]*\))"/g, '$1="#fff"')
  .replace(/stroke-opacity="[^"]*"/g, '')
// Cam üstünde biçim: motorun kendi gölge katmanları (opacity'li siyah parçalar: yüz yanı, gövde yanı, kulak) aynen
const shading = (svg) => (svg.match(/<(rect|path|circle|ellipse)\b[^>]*\sopacity="[^"]*"[^>]*\/>|<g[^>]*>|<\/g>/g) ?? []).join('').replace(/<ellipse[^>]*opacity="\.1[24]"[^>]*\/>/g, '')
const subjView = { vx: subjRange.x0, vy: 260, vw: subjRange.x1 - subjRange.x0, vh: 520 }
function glassSVG(mode) {
  const sc = strip(renderScene(bare, { ...subjView, mode, motion: false }))
  const { owner, dog } = subject(sp, PAL.day, { mono: true })
  const { owner: ownerC, dog: dogC } = subject(sp, PAL.day)
  const m = toMask(owner + dog)
  const tint = mode === 'day' ? '#ffffff' : '#d8ecff'
  return `${svgOpen(subjView)}
<defs>
<filter id="g-frost-${mode}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="6"/><feColorMatrix type="saturate" values="0.35"/></filter>
<filter id="g-bevel-${mode}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="er"/><feComposite in="SourceAlpha" in2="er" operator="out" result="in"/><feGaussianBlur in="in" stdDeviation="1.1" result="b"/><feFlood flood-color="#0b1219" flood-opacity="${mode === 'day' ? 0.22 : 0.4}"/><feComposite in2="b" operator="in"/></filter>
<filter id="g-rim-${mode}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="0.9" result="d"/><feComposite in="d" in2="SourceAlpha" operator="out" result="e"/><feFlood flood-color="#fff" flood-opacity=".95"/><feComposite in2="e" operator="in"/></filter>
<linearGradient id="g-sheen-${mode}" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="${tint}" stop-opacity="${mode === 'day' ? 0.2 : 0.16}"/><stop offset=".5" stop-color="${tint}" stop-opacity="0.06"/><stop offset="1" stop-color="${tint}" stop-opacity="${mode === 'day' ? 0.1 : 0.08}"/></linearGradient>
<mask id="g-m-${mode}" maskUnits="userSpaceOnUse" x="${subjView.vx}" y="${subjView.vy}" width="${subjView.vw}" height="${subjView.vh}">${m}</mask>
</defs>
<g>${sc}</g>
<g mask="url(#g-m-${mode})"><g filter="url(#g-frost-${mode})">${sc}</g><rect x="${subjView.vx}" y="${subjView.vy}" width="${subjView.vw}" height="${subjView.vh}" fill="url(#g-sheen-${mode})"/><g opacity=".55">${shading(ownerC + dogC)}</g></g>
<g filter="url(#g-bevel-${mode})">${m}</g><g filter="url(#g-rim-${mode})">${m}</g>
</svg>`
}
const realSVG = (mode) => {
  const sc = strip(renderScene(bare, { ...subjView, mode, motion: false }))
  const { owner, dog } = subject(sp, PAL[mode] ?? PAL.day)
  return `${svgOpen(subjView)}<g>${sc}</g><g class="subj">${owner}${dog}</g></svg>`
}
// sorulan parçanın (köpek) halkası, sahne biriminde
const dogBox = { cx: sp.x + (58 + 6) * k1 * dir, cy: sp.y - 22 * k1, r: 36 * k1 }

// ---------- 12 · satır küçük resimleri: konu kendi binasının önünde (yarım kişi yok) ----------
function thumbOf(p, mode, extra = '') {
  const v = { vx: p.x - 46, vy: p.y - 150, vw: 92, vh: 115 }
  const sc = strip(renderScene(bare, { ...v, mode, motion: false }))
  return `${svgOpen(v)}<g>${sc}</g>${extra}</svg>`
}

// ---------- metinler (yalnız streetText.js onaylı kaynaktan) ----------
const tl = taskLines(TASK)
const q1 = { id: 'dogwalker', a: 'sari', opts: ['siyah', 'beyaz', 'sari', 'turuncu'] }
const ml = missedLines('dogwalker', 'cadde')
const [TAM, YAKIN, KACTI, GORDUN, TAHMIN] = say('R5.tags').split(' / ')
const fact = factLines(FACTS.find((f) => f.id === 'gorilla'))
const guessFact = FACTS.find((f) => f.id === 'guess')
const [s1a, s1b] = splitFirst(say('Ş1'))
const [d2a, d2b] = splitFirst(say('D2'))
const [, r2s] = lines('R2', { N: changeN })
const col = (c, id) => ({ c, name: optionText('color', id, c), hex: COLORS[c].hex })
const T = {
  progress: say('ui.progress'), exit: say('ui.exit'), next: say('ui.next'), done: say('R6'),
  chip: tl.task, count: tl.count,
  near: say('count.near'), exact: say('count.exact'),
  r5: glue(countRow(TASK, n0, answer)), r5same: glue(countRow(TASK, n0, n0)),
  d1: say('D1', { i: 1, n: 4 }), b1: say('B1'), d2a, d2b, d3: say('D3'), d4: say('D4', { N: frames[0].n }), d5: say('D5'),
  g1: say('G1', { i: 1 }), g2: ml.saw, g3: ml.yesNo, g4: ml.detail, g5: say('G5', { sahne: sceneName('cadde'), dk: 1 }),
  s1a, s1b, s1cite: guessFact.ref,
  opts: q1.opts.map((c) => col(c, 'dogwalker')),
  a1: col('sari', 'dogwalker'),
  r1: say('R1'), s0: resultHead(foundN.length, frames.length), r2s: glue(r2s),
  tags: { TAM, YAKIN, KACTI, GORDUN, TAHMIN },
  who1: say('who.dogwalker'), who2: say('who.helmet'),
  a2: col('turuncu', 'helmet'), a2pick: col('sari', 'helmet'),
  fact,
  scene: sceneName('cadde'),
}
T.who1u = T.who1.charAt(0).toLocaleUpperCase('tr') + T.who1.slice(1)
T.who2u = T.who2.charAt(0).toLocaleUpperCase('tr') + T.who2.slice(1)
for (const [k, v] of Object.entries(T)) if (v == null) throw new Error(`onaylı metin yok: ${k}`)

// ---------- SVG'ler (iki palet) ----------
const svg = {}
for (const mode of MODES) {
  svg[mode] = {
    panels: panelCands.map((c) => renderScene(coverModel(panelBase, c), { vx: c.vx, vy: 0, vw: c.vw, vh: 844, mode, motion: false, label: sceneName('cadde') })),
    icon: taskIconSVG(TASK, 'day'),
    f1before: renderScene(frames[0].f.before, { ...frames[0].view, mode, motion: false, label: say('D2') }),
    f1after: renderScene(frames[0].f.after, { ...frames[0].view, mode, motion: false, label: say('D2') }),
    thumbs: frames.map((fr) => renderScene(fr.f.after, { ...fr.view, mode, motion: false, label: sceneName('cadde') })),
    glass: glassSVG(mode),
    real: realSVG(mode),
    who1: thumbOf(sp, mode, `<g>${Object.values(subject(sp, PAL[mode] ?? PAL.day)).join('')}</g>`),
    who2: thumbOf(s.special.helmet, mode, `<g>${person({ ...s.special.helmet, walk: false }, PAL[mode] ?? PAL.day)}</g>`),
  }
}
const ringOf = (fr) => {
  const b = fr.box?.after ?? fr.box?.before ?? fr.hit[0]
  const g = { x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 }
  return { cx: g.x + g.w / 2, cy: g.y + g.h / 2, r: Math.max(20, Math.hypot(g.w, g.h) / 2) }
}
const meta = {
  n0, answer, changeN, dogBox, sign: SIGN, road: Y.road,
  panelCands, blocks, subj: { x: sp.x, y: sp.y, dir, block: blocks[subjBlock], range: subjRange, view: subjView },
  frames: frames.map((fr) => ({ n: fr.n, found: fr.found, looks: fr.looks, view: fr.view, ring: ringOf(fr), change: fr.change })),
}
writeFileSync(OUT, `// üretildi: uret.mjs (gerçek sahne üreticileri + streetText.js onaylı metin). Elle düzenleme.\nwindow.SAHNE = ${JSON.stringify({ T, svg, meta })};\n`)
console.log('yazıldı', (JSON.stringify(svg).length / 1024).toFixed(0) + ' KB', meta.frames.map((f) => `${f.n}${f.found ? '✓' : '✗'} ${f.change}`).join(' | '), 'changeN', changeN, 'n0', n0, 'konu bloğu', JSON.stringify(blocks[subjBlock]), 'sp', sp.x, sp.y, 'panel adayları', JSON.stringify(panelCands))
