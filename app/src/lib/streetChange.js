// Fark Ettin mi? — "Ne değişti?" üretimi, nesne merdiveni ve sıkmama kuralları (fark-ettin-mi/PLAN.md §1.2, §1.3,
// §9c madde 1–6). Saf ve tohumlu: aynı (geçmiş, gün, tohum) aynı turu verir; depoya ve ekrana dokunmaz.
//
// "Ne değişti?": sahnenin 4:5 bir karesi (376 × 470 birim) iki kez gösterilir; ikincisinde tek bir değişiklik vardır.
// Türler: renk, nesne gelir ya da gider, yer değiştirir, tabela harfi (V2'den). Değişen nesne tek başına durur: dokunma
// kutusu (en az 60 × 60 birim; kare ≥ 280 pt genişlikte gösterilince ≥ 44 pt, VARSAYIM) başka hiçbir nesneye değmez.
// Merdiven: kare nesne sayısı 8'den başlar; ilk bakışta bulunursa +2, ikinci bakışta aynı, bulunamazsa −2 (üçüncü
// bakışta bulunan da bulunamamış sayılır, VARSAYIM); sınır 6–30; son değer sonraki turun başlangıcı (Luck & Vogel 1997,
// PMID 9384378; Simons & Jensen 2009, PMID 19293113; adım büyüklüğü VARSAYIM). Ölçü changeN: lib/street.js changeNOf.
// Nesne sayısı karedeki öğelerdir (kişi, hayvan, bisiklet, saksı…); bina, ağaç ve lamba sayılmaz (VARSAYIM).
import { SCENES, SIGN, Y, COLORS, itemBox, signBox, overlaps, rng } from './streetScenes.js'
import { LADDERS } from './ladders.js'
import {
  SESSION_TYPE, SCENE_TARGETS, TARGETS, TEMPLATES, CLOTH, FACTS, genStreet, missedQuestion, templatesFor, sceneStage,
  shuffleWith,
} from './street.js'
import { dayKey } from './calendar.js'
import { calendarDaysBetween } from './today.js'
import { seedHash } from './progression.js'

// ---------- merdiven ----------
export const CHANGE_LADDER = { start: 8, min: 6, max: 30, up: 2, down: 2, looks: 3 }
const clampN = (n) => Math.max(CHANGE_LADDER.min, Math.min(CHANGE_LADDER.max, n))
export function nextN(n, { looks, found }) {
  if (found && looks === 1) return clampN(n + CHANGE_LADDER.up)
  if (found && looks === 2) return clampN(n)
  return clampN(n - CHANGE_LADDER.down)
}
// Turun başlangıcı: son kaydın son karesinden (eski kayıtta ya da hiç yoksa 8)
export function startN(sessions = []) {
  const last = [...(sessions ?? [])].filter((s) => s?.type === SESSION_TYPE && Array.isArray(s.changes) && s.changes.length).sort(byDate).at(-1)
  const c = last?.changes.at(-1)
  return c && Number.isFinite(c.n) ? nextN(c.n, c) : CHANGE_LADDER.start
}

// ---------- değişebilen nesneler ----------
// on: 'person' (kişinin bir parçası), 'building' (bina parçası), yoksa kendi başına öğe. kinds: izinli türler.
const ALL4 = ['renk', 'gelir', 'gider', 'yer']
const MOVE = ['gelir', 'gider', 'yer']
const STREETS = Object.keys(SCENES).filter((k) => SCENES[k].kind === 'street')
const C8 = Object.keys(COLORS)
export const OBJECTS = {
  hat: { on: 'person', attr: 'hat', kinds: ['renk', 'gelir', 'gider'], palette: CLOTH },
  bag: { on: 'person', attr: 'bag', kinds: ['renk', 'gelir', 'gider'], palette: CLOTH },
  top: { on: 'person', attr: 'top', kinds: ['renk'], palette: CLOTH },
  glasses: { on: 'person', attr: 'glasses', kinds: ['gelir', 'gider'] },
  scarf: { on: 'person', attr: 'scarf', kinds: ['renk', 'gelir', 'gider'], palette: CLOTH },
  umbrella: { on: 'person', attr: 'umbrella', kinds: ['renk', 'gelir', 'gider'], palette: CLOTH },
  balloon: { on: 'person', attr: 'balloon', kinds: ['renk', 'gelir', 'gider'], palette: ['kirmizi', 'mavi', 'sari', 'yesil', 'mor', 'turuncu'] },
  phone: { on: 'person', attr: 'phone', kinds: ['gelir', 'gider'] },
  cat: { kinds: ALL4, palette: ['siyah', 'turuncu', 'gri', 'beyaz'] },
  dog: { kinds: ALL4, palette: ['siyah', 'beyaz', 'kahve', 'sari'] },
  bike: { kinds: ALL4, palette: C8 },
  scooter: { kinds: ALL4, palette: C8 },
  pot: { kinds: ALL4, palette: ['kirmizi', 'sari', 'mor', 'beyaz', 'turuncu', 'mavi'] },
  bin: { kinds: ALL4, palette: ['yesil', 'mavi', 'siyah', 'gri', 'turuncu'] },
  aboard: { kinds: ALL4, palette: ['siyah', 'yesil', 'mavi', 'kirmizi', 'mor'] },
  ball: { kinds: ALL4, palette: C8 },
  suitcase: { kinds: ALL4, palette: C8 },
  stroller: { kinds: ALL4, palette: C8 },
  crate: { kinds: ALL4, palette: ['kirmizi', 'mavi', 'yesil', 'kahve', 'sari'] },
  bucket: { kinds: ALL4, palette: ['kirmizi', 'sari', 'mor', 'beyaz', 'turuncu'] },
  chair: { kinds: ALL4, palette: C8 },
  pigeon: { kinds: MOVE },
  basket: { kinds: MOVE },
  cone: { kinds: MOVE },
  watermelon: { kinds: MOVE },
  bench: { kinds: ['renk'], palette: ['kahve', 'yesil', 'mavi', 'kirmizi'] },
  hydrant: { kinds: ['renk', 'gelir', 'gider'], palette: ['kirmizi', 'sari', 'yesil', 'mavi'], scenes: STREETS },
  awning: { on: 'building', kinds: ['renk'], palette: ['kirmizi', 'mavi', 'sari', 'mor', 'turuncu'], scenes: STREETS },
  door: { on: 'building', kinds: ['renk'], palette: ['kahve', 'lacivert', 'bordo', 'yesil', 'gri', 'mavi'], scenes: STREETS },
  sign: { on: 'building', kinds: ['tabela'], scenes: STREETS },
}
export const objectsFor = (scene) => Object.keys(OBJECTS).filter((o) => !OBJECTS[o].scenes || OBJECTS[o].scenes.includes(scene))
export const family = (kind) => (kind === 'gelir' || kind === 'gider' ? 'nesne' : kind)

// Kare: 4:5, her genişlikte aynı (PLAN §5b madde 1)
export const FRAME = { vw: 376, vh: 470, vy: 330 }
const MIN_HIT = 60
const BAND = { street: { person: 604, small: 578 }, market: { person: 608, small: 608 }, park: { person: 600, small: 600 } }
const BOTTOM = 786
const FILL = {
  street: ['person', 'person', 'person', 'person', 'cat', 'dog', 'bike', 'scooter', 'pot', 'bin', 'aboard', 'ball', 'suitcase', 'stroller', 'pigeon', 'crate', 'basket', 'bucket', 'cone', 'hydrant', 'chair'],
  market: ['person', 'person', 'person', 'person', 'crate', 'crate', 'basket', 'bucket', 'watermelon', 'cat', 'dog', 'pigeon', 'suitcase', 'stroller', 'scooter', 'ball', 'pot', 'chair', 'bin', 'aboard'],
  park: ['person', 'person', 'person', 'person', 'dog', 'ball', 'stroller', 'pigeon', 'bike', 'scooter', 'bench', 'bin', 'basket', 'pot', 'suitcase', 'cat', 'bucket', 'chair', 'watermelon'],
}
const SIGN_LETTERS = ['A', 'E', 'I', 'O', 'U', 'B', 'D', 'K', 'L', 'M', 'N', 'R', 'S', 'T']

const padHit = (b) => {
  const w = Math.max(MIN_HIT, b.w)
  const h = Math.max(MIN_HIT, b.h)
  return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h }
}
const inside = (b, v) => b.x >= v.vx + 4 && b.x + b.w <= v.vx + v.vw - 4 && b.y >= v.vy + 4 && b.y + b.h <= v.vy + v.vh - 4
function partBox(b, obj) {
  if (obj === 'sign') return signBox(b)
  const ay = SIGN.top + SIGN.h + 4
  if (obj === 'awning') return { x: b.x - 2, y: ay, w: b.w + 4, h: 34 }
  return { x: b.x + b.w - 52, y: ay + 34, w: 40, h: Y.side - ay - 34 } // kapı
}
function randomPerson(r) {
  const pick = (a) => a[Math.floor(r() * a.length)]
  const g = r() < 0.5 ? 'k' : 'e'
  return { type: 'person', walk: false, g, hair: pick(g === 'k' ? ['kahve', 'siyah', 'kizil', 'gri'] : ['kahve', 'siyah', 'gri', 'sari']), skin: pick(['#F2C9A5', '#E0AC82', '#C68A5E', '#8D5A3B', '#6E4430']), top: pick(CLOTH), dress: g === 'k' && r() < 0.4, longHair: g === 'k' && r() < 0.6, dir: r() < 0.5 ? 1 : -1, bag: r() < 0.2 ? pick(CLOTH) : null, hat: r() < 0.15 ? pick(CLOTH) : null, glasses: r() < 0.15 }
}
function randomItem(type, r) {
  if (type === 'person') return randomPerson(r)
  const o = OBJECTS[type]
  const pal = o?.palette ?? C8
  return { type, color: pal[Math.floor(r() * pal.length)], dir: r() < 0.5 ? 1 : -1 }
}

// Karenin bakış noktası: caddede bir bina (bina, tabelası ve kapısı karede tam), pazarda bir tezgâh, parkta bir yer
export function frameView(model, anchor) {
  const kind = SCENES[model.scene]?.kind ?? 'street'
  let vx
  if (kind === 'street') vx = model.buildings[anchor % model.buildings.length].x - 40
  else if (kind === 'market') vx = model.stalls[anchor % model.stalls.length].x - 70
  else vx = 100 + (anchor * 397) % Math.max(1, model.L - 600)
  return { vx: Math.max(0, Math.min(model.L - FRAME.vw, vx)), vy: FRAME.vy, vw: FRAME.vw, vh: FRAME.vh }
}

// Tek kare: spec { obj, kind, anchor, seed }, n: karedeki nesne sayısı (değişen nesne dahil, görünür olduğu hâlde)
// Dönen: { n, obj, kind, view, before, after, hit: [kutu], change: { obj, kind, from, to } }
export function makeFrame(model, spec, n) {
  const r = rng(seedHash(`${spec.seed}:${n}`))
  const pick = (a) => a[Math.floor(r() * a.length)]
  const kind = SCENES[model.scene]?.kind ?? 'street'
  const view = frameView(model, spec.anchor)
  const band = BAND[kind]
  const o = OBJECTS[spec.obj]
  const minX = view.vx + 30
  const maxX = view.vx + view.vw - 30
  const at = (it) => {
    const y0 = it.type === 'person' ? band.person : band.small
    return { ...it, x: minX + r() * (maxX - minX), y: y0 + r() * (BOTTOM - y0) }
  }
  const tryPlace = (it, ok) => {
    for (let k = 0; k < 400; k++) {
      const c = at(it)
      if (ok(c)) return c
    }
    return null
  }
  const before = { ...model, people: [], cars: [], cats: [], bikes: [], vendors: [], stallVendors: [], items: [] }
  if (kind === 'street') before.buildings = model.buildings.map((b) => ({ ...b }))
  const after = { ...before }
  const change = { obj: spec.obj, kind: spec.kind, from: null, to: null }
  let target = null
  let target2 = null
  let hit = []
  const others = []
  // 1) değişen nesne
  if (o.on === 'building') {
    const bi = spec.anchor % before.buildings.length
    const b = before.buildings[bi]
    const nb = { ...b }
    if (spec.obj === 'sign') {
      const i = 1 + Math.floor(r() * (b.shop.length - 1))
      const L = shuffleWith(r, SIGN_LETTERS).find((c) => c !== b.shop[i])
      nb.shop = b.shop.slice(0, i) + L + b.shop.slice(i + 1)
      change.from = b.shop
      change.to = nb.shop
    } else {
      const key = spec.obj === 'awning' ? 'aw' : 'door'
      nb[key] = shuffleWith(r, o.palette).find((c) => c !== b[key])
      change.from = b[key]
      change.to = nb[key]
    }
    after.buildings = before.buildings.map((x, j) => (j === bi ? nb : x))
    hit = [padHit(partBox(b, spec.obj))]
  } else {
    const base = o.on === 'person' ? randomPerson(r) : randomItem(spec.obj, r)
    if (o.on === 'person') {
      for (const a of ['hat', 'bag', 'glasses', 'scarf', 'umbrella', 'balloon', 'phone']) if (a !== o.attr) base[a] = null
      if (spec.kind === 'renk' || spec.kind === 'gider') base[o.attr] = o.palette ? pick(o.palette) : true
      if (spec.kind === 'gelir') base[o.attr] = null
    }
    const shown = (it) => (o.on === 'person' ? { ...it, [o.attr]: it[o.attr] ?? (o.palette ? pick(o.palette) : true) } : it)
    target = tryPlace(base, (c) => inside(itemBox(shown(c)), view))
    if (!target) target = { ...base, x: view.vx + view.vw / 2, y: BOTTOM }
    if (o.on === 'person') {
      const full = shown(target)
      change.dress = Boolean(target.dress) // üstün adı: elbise ya da tişört
      target2 = { ...target }
      if (spec.kind === 'renk') {
        target2[o.attr] = shuffleWith(r, o.palette).find((c) => c !== target[o.attr])
        change.from = target[o.attr]
        change.to = target2[o.attr]
      } else if (spec.kind === 'gelir') {
        target2[o.attr] = full[o.attr]
        change.to = full[o.attr]
      } else {
        target2[o.attr] = null
        change.from = target[o.attr]
      }
      hit = [padHit(itemBox(full))]
    } else if (spec.kind === 'yer') {
      const h1 = padHit(itemBox(target))
      target2 = tryPlace(target, (c) => inside(itemBox(c), view) && !overlaps(padHit(itemBox(c)), h1, 20))
      if (!target2) target2 = { ...target, x: target.x > view.vx + view.vw / 2 ? view.vx + 40 : view.vx + view.vw - 40 }
      hit = [h1, padHit(itemBox(target2))]
      change.from = { x: Math.round(target.x), y: Math.round(target.y) }
      change.to = { x: Math.round(target2.x), y: Math.round(target2.y) }
    } else if (spec.kind === 'renk') {
      target2 = { ...target, color: shuffleWith(r, o.palette).find((c) => c !== target.color) }
      change.from = target.color
      change.to = target2.color
      hit = [padHit(itemBox(target))]
    } else {
      target2 = { ...target }
      hit = [padHit(itemBox(target))]
      change.from = spec.kind === 'gider' ? target.color ?? true : null
      change.to = spec.kind === 'gelir' ? target.color ?? true : null
    }
  }
  // 2) öbür nesneler: dokunma kutusuna asla değmez; olabildiğince birbirine de değmez
  const fillers = o.on === 'building' ? n : n - 1
  const free = (c) => {
    const b = itemBox(c)
    return inside(b, view) && !hit.some((h) => overlaps(b, h, 2))
  }
  for (let i = 0; i < fillers; i++) {
    const base = randomItem(pick(FILL[kind]), r)
    let c = null
    for (let k = 0; k < 120 && !c; k++) {
      const t = at(base)
      if (free(t) && !others.some((x) => overlaps(itemBox(x), itemBox(t), -6))) c = t
    }
    if (!c) c = tryPlace(base, free)
    if (c) others.push(c)
  }
  // 3) iki görüntü
  if (target) {
    const goneBefore = spec.kind === 'gelir' && o.on !== 'person'
    const goneAfter = spec.kind === 'gider' && o.on !== 'person'
    before.items = [...others, ...(goneBefore ? [] : [target])]
    after.items = [...others, ...(goneAfter ? [] : [target2])]
  } else {
    before.items = [...others]
    after.items = [...others]
  }
  const count = Math.max(before.items.length, after.items.length)
  return { n: count, obj: spec.obj, kind: spec.kind, view, before, after, hit, change }
}
export const hitTest = (frame, x, y) => frame.hit.some((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h)

// ---------- sıkmama kuralları (PLAN §9c madde 1–6) ----------
const byDate = (a, b) => String(a?.date).localeCompare(String(b?.date))
const dayOf = (s) => (s?.date ? dayKey(new Date(s.date)) : null)
const sceneOf = (s) => (typeof s?.scene === 'string' ? s.scene : 'cadde') // eski kayıtlar Cadde'ydi
// Şu andan önceki tur kayıtları (aynı gün önceki tur dahil), eskiden yeniye
export function history(sessions = [], now = new Date()) {
  const t = new Date(now).getTime()
  return (sessions ?? []).filter((s) => s?.type === SESSION_TYPE && dayOf(s) && new Date(s.date).getTime() < t).sort(byDate)
}
const daysAgo = (s, today) => calendarDaysBetween(dayOf(s), today)

// Madde 5: her 7. tur "haftanın sahnesi": son 7 günde açılmış en yeni sahne ya da çeşitleme (yoksa null). Sahne,
// eşiği kadar ayrı gün oynandıktan sonraki gün açılır (yeni kullanıcıda Dvar = D; eşikler LADDERS['fark-ettin']).
export const SCENE_FROM = (() => {
  const l = LADDERS['fark-ettin']
  const out = {}
  for (const st of l.steps) for (const sc of st.scenes) out[sc] ??= st.from
  for (const v of l.variants) if (v.scene) out[v.scene] ??= v.from
  return out
})()
export function weekScene(hist, stage, now = new Date()) {
  if ((hist.length + 1) % 7 !== 0) return null
  const today = dayKey(now)
  const days = stage.days ?? []
  let best = null
  for (const sc of stage.scenes) {
    const from = SCENE_FROM[sc]
    const day = from === 0 ? days[0] : days[from - 1]
    if (!day || calendarDaysBetween(day, today) > 7) continue
    if (!best || from > SCENE_FROM[best]) best = sc
  }
  return best
}

// Madde 1 (sahip kararı 2026-10-02): yalnız bir sahne açıkken o sahne her gün gelir (içerik madde 2–4 ile yenidir).
// ≥ 2 sahne açıkken dünkü sahne, aynı günün önceki turu ve bir önceki turun sahnesi gelmez; bir sahne son 7 günde en çok 2 kez gelir (seçenek
// kalmazsa bu koşul gevşer, art arda yasağı kalır); izinliler arasından tohumla rastgele seçilir (sabit döngü yok).
// Madde 5: her 7. tur haftanın sahnesi, aynı izinler içinde.
export const SCENE_WEEK_MAX = 2
export function sceneOptions(hist, stage, now) {
  const today = dayKey(now)
  if (stage.scenes.length < 2) return { allowed: [...stage.scenes], open: [...stage.scenes] }
  const banned = new Set(hist.filter((s) => daysAgo(s, today) <= 1).map(sceneOf))
  if (hist.length) banned.add(sceneOf(hist.at(-1))) // art arda iki tur da aynı sahne olmaz (aradaki gün sayısından bağımsız)
  let open = stage.scenes.filter((s) => !banned.has(s))
  if (!open.length) open = stage.scenes.filter((s) => s !== sceneOf(hist.at(-1)))
  const week = (sc) => hist.filter((s) => daysAgo(s, today) < 7 && sceneOf(s) === sc).length
  const limited = open.filter((s) => week(s) < SCENE_WEEK_MAX)
  return { allowed: limited.length ? limited : open, open }
}
export function chooseScene(hist, stage, now, r) {
  const { allowed } = sceneOptions(hist, stage, now)
  const week = weekScene(hist, stage, now)
  if (week && allowed.includes(week)) return week
  return allowed[Math.floor(r() * allowed.length)]
}
// Madde 2: sayma hedefi son 7 turda tekrar etmez
export function chooseTargets(hist, scene, r) {
  const recent = new Set(hist.slice(-7).map((s) => s.taskId))
  return shuffleWith(r, SCENE_TARGETS[scene].filter((t) => !recent.has(t)))
}
// Madde 3: 4 karede tür ailesi (renk, nesne, yer, tabela) en çok iki kez; değişen nesne son 5 turda değişmiş olmaz
export function chooseChanges(hist, scene, stage, r) {
  const forbid = new Set(hist.slice(-5).flatMap((s) => (s.changes ?? []).map((c) => c.obj)).filter(Boolean))
  const used = new Set()
  const fam = {}
  const out = []
  const kind = SCENES[scene]?.kind ?? 'street'
  const anchors = shuffleWith(r, Array.from({ length: 6 }, (_, i) => i + 1))
  for (let i = 0; i < stage.frames; i++) {
    const kindsOf = (o) => OBJECTS[o].kinds.filter((k) => stage.kinds.includes(k) && (fam[family(k)] ?? 0) < 2)
    let cands = objectsFor(scene).filter((o) => !forbid.has(o) && !used.has(o) && kindsOf(o).length)
    if (!cands.length) cands = objectsFor(scene).filter((o) => !used.has(o) && kindsOf(o).length) // olmaz; test denetler
    const obj = cands[Math.floor(r() * cands.length)]
    const ks = kindsOf(obj)
    const k = ks[Math.floor(r() * ks.length)]
    used.add(obj)
    fam[family(k)] = (fam[family(k)] ?? 0) + 1
    out.push({ i, obj, kind: k, anchor: kind === 'park' ? anchors[i] * 3 : anchors[i], seed: Math.floor(r() * 2 ** 31) })
  }
  return out
}
// Madde 4: şablon son 3 turda sorulmaz (yakalama sorusu yok: sahip kararı 2026-10-02)
export const pairKey = (ids) => [...ids].sort().join('+')
export const roundTriple = (scene, taskId, ids) => `${scene}|${taskId}|${pairKey(ids)}`
export function chooseQuestions(hist, scene, taskId, r, seen = new Set(hist.map((s) => roundTriple(sceneOf(s), s.taskId, s.askedIds ?? (s.answers ?? []).map((a) => a.id))))) {
  const recent = new Set(hist.slice(-3).flatMap((s) => s.askedIds ?? (s.answers ?? []).map((a) => a.id)))
  const pool = shuffleWith(r, templatesFor(scene, taskId).filter((id) => !recent.has(id)))
  for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) if (!seen.has(roundTriple(scene, taskId, [pool[i], pool[j]]))) return [pool[i], pool[j]]
  return null
}
// Madde 6: bilim kartı 7 gün içinde tekrar etmez; açılan kart 30 gün dinlenir. Uygun kart yoksa kart yok (susar).
export function pickFact(hist, now = new Date()) {
  const today = dayKey(now)
  const shown = {}
  const opened = {}
  for (const s of hist) {
    if (!s.fact) continue
    const d = daysAgo(s, today)
    shown[s.fact] = Math.min(d, shown[s.fact] ?? Infinity)
    if (s.factOpen) opened[s.fact] = Math.min(d, opened[s.fact] ?? Infinity)
  }
  const ok = FACTS.filter((f) => (shown[f.id] ?? Infinity) >= 7 && (opened[f.id] ?? Infinity) >= 30)
  if (!ok.length) return null
  // en uzun süredir gösterilmeyen (hiç gösterilmemiş önce, FACTS sırasıyla)
  return [...ok].sort((a, b) => (shown[b.id] ?? Infinity) - (shown[a.id] ?? Infinity))[0]
}

// ---------- tur ----------
// Ekran metinlerinin kimlikleri (METINLER.md; metin lib/streetText.js say/textOr'dan, yalnız onaylıysa). D8 ve R5'in
// parçaları alt kimlikle: D8.1 ilk bakış, D8.2 ikinci bakış; R5.tags rozetler, R5 satır. D7: streetText.changeSentence.
export const TEXT_IDS = {
  intro: { title: 'M1', task: 'M2', lead: 'M3', parts: 'M4', limit: 'M5', start: 'M6' },
  change: { head: 'D1', ask: 'D2', hint: 'D3', count: 'D4', again: 'D5', found: 'D6', what: 'D7', nextFirst: 'D8.1', nextSecond: 'D8.2', shown: 'D9' },
  missed: { head: 'G1', yesNo: 'G3', ago: 'G5', guessRight: 'Ş1' },
  result: { head: 'R1', number: 'R2', verdict: 'R3', base: 'R4', tags: 'R5.tags', row: 'R5', done: 'R6' },
  path: { sub: 'Y1', newScene: 'Y2' },
}
// "Gözünden kaçan" sorusunun kimlikleri: G2 "{Yer} {kim} vardı. / Onu fark ettin mi?", G3, G4 "{soru} / Görmediysen de
// tahmin et."; yer sahneye göre (place.<sahne>), kim ve soru şablona göre (who.<id>, ask.<id>). streetText.missedLines.
export function missedTextIds(id, scene) {
  return { ...TEXT_IDS.missed, saw: 'G2', detail: 'G4', place: `place.${scene}`, who: `who.${id}`, ask: `ask.${id}` }
}

export function planRound({ sessions = [], now = new Date(), seed = 1 } = {}) {
  const r = rng(seed)
  const hist = history(sessions, now)
  const stage = sceneStage(sessions, now)
  const scene = chooseScene(hist, stage, now, r)
  const seen = new Set(hist.map((s) => roundTriple(sceneOf(s), s.taskId, s.askedIds ?? (s.answers ?? []).map((a) => a.id))))
  let taskId = null
  let asked = null
  for (const t of chooseTargets(hist, scene, r)) {
    asked = chooseQuestions(hist, scene, t, r, seen)
    if (asked) {
      taskId = t
      break
    }
  }
  if (!taskId) {
    taskId = SCENE_TARGETS[scene][0]
    asked = templatesFor(scene, taskId).slice(0, 2)
  }
  const tColor = TARGETS[taskId]?.color
  const answers = {}
  const meta = asked.map((id) => {
    const t = TEMPLATES[id]
    let similar = false
    if (t.detail === 'color' && tColor && t.pool.includes(tColor) && r() < 0.5) {
      similar = true
      answers[id] = tColor
    } else if (t.pool) {
      const pool = t.detail === 'color' && tColor ? t.pool.filter((c) => c !== tColor) : t.pool
      answers[id] = pool[Math.floor(r() * pool.length)]
    }
    return { id, similar }
  })
  const decoys = shuffleWith(r, templatesFor(scene, taskId).filter((id) => !asked.includes(id))).slice(0, 2)
  const street = genStreet(seed, stage.level, { scene, taskId, subjects: [...asked, ...decoys], answers })
  const qr = rng(seed + 2)
  const questions = meta.map((m) => ({ ...missedQuestion(street, m.id, m, qr), text: missedTextIds(m.id, scene) }))
  return {
    seed,
    day: dayKey(now),
    roundNo: hist.length + 1,
    stage,
    level: stage.level,
    scene,
    taskId,
    street,
    questions,
    frames: chooseChanges(hist, scene, stage, r),
    startN: startN(hist),
    fact: pickFact(hist, now),
    text: { ...TEXT_IDS, task: `task.${taskId}`, count: `count.${taskId}`, focus: `focus.${taskId}`, scene: `scene.${scene}` },
  }
}
