// Fark Ettin mi? — tur mantığı (saf). Çizim lib/streetScenes.js (motor) ve lib/streetSvg.js; "Ne değişti?" üretimi ve
// sıkmama kuralları lib/streetChange.js; ekran metinleri lib/streetText.js (yalnız onaylı metin ekrana çıkar).
// Tasarım: docs/yol-haritasi/tasarim/fark-ettin-mi/PLAN.md §1 (tur), §2 (sahneler ve merdiven), §3.3 (kayıt).
// Yöntem: dikkat bir göreve yönlendirilir (ör. sarı taksileri say), sonra görevle ilgisi olmayan ama açıkça görünen
// ayrıntılar sorulur (dikkatsizlik körlüğü; Simons & Chabris 1999, DOI 10.1068/p281059; ameliyat videolarıyla aynı düzen:
// Pandit 2022, DOI 10.3389/fsurg.2022.916228). Görev zorlaştıkça fark etme azalır (Simons & Jensen 2009,
// DOI 10.3758/PBR.16.2.398). Önce beyan ("var mıydı?"), sonra seçenek: fark etmeyen kişi seçenekte şanstan iyi tahmin
// eder (Kreitz 2020, DOI 10.1177/1747021820911324); "Fark etmedim" deyip doğru tahmin ayrı sayılır.
// İddia sınırı: gerçek hayatta daha çok fark ettirdiği gösterilmedi; soru beklendiği için "Gözünden kaçan" ölçü değildir.
import {
  COLORS, SKIN, HAIR, ANIMAL, SCENES, SHOPS, ROWS, INSTRUMENTS, CHILD_ITEMS, BIKE_LANE, backdrop, rng, itemBox,
} from './streetScenes.js'
import { LADDERS } from './ladders.js'
import { stageOf } from './progression.js'
import { dayKey } from './calendar.js'
import { calendarDaysBetween } from './today.js'

export { COLORS, SKIN, HAIR, SHOPS, rng }
export const SESSION_TYPE = 'street'
export const isStreet = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.noticed)

const pickOf = (r) => (list) => list[Math.floor(r() * list.length)]
export function shuffleWith(r, list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const CLOTH = ['kirmizi', 'mavi', 'yesil', 'mor', 'turuncu', 'siyah', 'beyaz', 'sari']
export const ITEMS = { balon: 'balon', dondurma: 'dondurma', ayi: 'oyuncak ayı', bayrak: 'bayrak' }
export const VENDORS = { simit: 'simit', misir: 'mısır', kestane: 'kestane', cicek: 'çiçek' }
export const CAT_COLORS = { siyah: ANIMAL.siyah, turuncu: ANIMAL.turuncu, gri: ANIMAL.gri, beyaz: ANIMAL.beyaz }
export const SCENE_IDS = Object.keys(SCENES)

// Bugünkü onaylı görevler (metinleri bugünkü ekranda; StreetWalk bunları kullanır)
export const TASKS = [
  { id: 'blueCar', text: 'Mavi arabaları say', q: 'Kaç mavi araba geçti?' },
  { id: 'taxi', text: 'Sarı taksileri say', q: 'Kaç sarı taksi geçti?' },
  { id: 'cat', text: 'Kedileri say', q: 'Kaç kedi gördün?' },
  { id: 'bike', text: 'Bisikletleri say', q: 'Kaç bisiklet geçti?' },
]
// Sayma hedefleri (PLAN §1.1; §9c madde 2: sahne başına ≥ 8). color: hedefin rengi ("Gözünden kaçan" benzerliği için).
// Ekrandaki adı lib/streetText.js'ten (task.<id>, count.<id>); bugünkü dört görev dışındakiler onaysızdır.
export const TARGETS = {
  blueCar: { color: 'mavi' }, taxi: { color: 'sari' }, redCar: { color: 'kirmizi' }, bike: {}, cat: {}, dog: {}, hat: {},
  glasses: {}, litShop: { color: 'sari' }, redUmbrella: { color: 'kirmizi' }, yellowCoat: { color: 'sari' },
  watermelon: { color: 'yesil' }, hatVendor: {}, redCrate: { color: 'kirmizi' }, basket: {}, flowerBucket: {}, balloon: {},
  kite: {}, runner: {}, ball: {}, stroller: {}, pigeon: {},
}
export const SCENE_TARGETS = {
  cadde: ['blueCar', 'taxi', 'bike', 'cat', 'redCar', 'dog', 'hat', 'glasses'],
  aksam: ['litShop', 'taxi', 'blueCar', 'redCar', 'bike', 'cat', 'dog', 'hat'],
  yagmur: ['redUmbrella', 'yellowCoat', 'taxi', 'blueCar', 'redCar', 'bike', 'dog', 'cat'],
  pazar: ['watermelon', 'hatVendor', 'redCrate', 'basket', 'flowerBucket', 'dog', 'cat', 'balloon'],
  park: ['dog', 'kite', 'runner', 'ball', 'stroller', 'pigeon', 'bike', 'balloon'],
}

// Seviye = sahne basamağı (F1..F5 → 1..5; PLAN §3.3). Kalabalık ve yürüyüş süresi (35–40 sn; PLAN §1.1). VARSAYIM.
export const LEVELS = {
  1: { people: 14, walkSec: 40 },
  2: { people: 16, walkSec: 40 },
  3: { people: 18, walkSec: 38 },
  4: { people: 20, walkSec: 37 },
  5: { people: 22, walkSec: 36 },
}
// Eski ekranın yürüyüş bandı (StreetWalk: yükseklik VH × ölçek): dükkân tabelasından yolun sonuna, sahne birimi
export const WALK_VY = 420
export const VH = 368
export const GROUND = 236 // eski düz çizimin zemini (lib/streetSvg.js eski car/cat/bike simgeleri)
export const SLOT = 64

const STREET = (sc) => SCENES[sc]?.kind === 'street'
const ALL = SCENE_IDS
const STREETS = SCENE_IDS.filter(STREET)
// "Gözünden kaçan" şablonları (§9c madde 4: sahne başına ≥ 12). Konu sahnede tektir. detail: sorulan ayrıntının türü;
// pool: seçenek havuzu; conflicts: bu görevlerde şablon sorulmaz (konu sayılan şeyin kendisi olurdu).
export const TEMPLATES = {
  laugh: { scenes: ALL, detail: 'color', pool: CLOTH, person: (a) => ({ g: 'k', hair: 'kahve', dress: true, longHair: true, laugh: true, top: a }) },
  blonde: { scenes: ALL, detail: 'color', pool: ['kirmizi', 'yesil', 'mor', 'turuncu', 'sari', 'mavi'], person: (a, r) => ({ g: 'k', hair: 'sari', longHair: true, top: pickOf(r)(['siyah', 'beyaz', 'mavi']), bag: a }) },
  child: { scenes: ALL, detail: 'item', pool: CHILD_ITEMS, conflicts: ['balloon'], person: (a, r) => ({ g: 'k', hair: pickOf(r)(['siyah', 'kizil']), dress: true, longHair: true, top: pickOf(r)(CLOTH), child: a }) },
  hat: { scenes: ALL, detail: 'color', pool: CLOTH, conflicts: ['hat', 'hatVendor'], person: (a, r) => ({ g: 'e', hair: 'siyah', top: pickOf(r)(CLOTH), hat: a }) },
  vendor: { scenes: ALL, detail: 'item', pool: Object.keys(VENDORS) },
  shop: { scenes: STREETS, detail: 'shop' },
  stall: { scenes: ['pazar'], detail: 'stall' },
  beard: { scenes: ALL, detail: 'color', pool: CLOTH, person: (a) => ({ g: 'e', hair: 'kahve', beard: true, top: a }) },
  dogwalker: { scenes: ALL, detail: 'color', pool: ['siyah', 'beyaz', 'sari', 'turuncu'], conflicts: ['dog'], person: (a, r) => ({ g: pickOf(r)(['k', 'e']), hair: 'gri', top: pickOf(r)(['mavi', 'yesil', 'mor']), dog: a }) },
  scarf: { scenes: ALL, detail: 'color', pool: ['kirmizi', 'mavi', 'yesil', 'mor', 'turuncu', 'sari'], person: (a) => ({ g: 'k', hair: 'kizil', longHair: true, top: 'siyah', scarf: a }) },
  cyclist: { scenes: [...STREETS, 'park'], detail: 'color', pool: ['kirmizi', 'mavi', 'yesil', 'sari', 'turuncu', 'mor'], conflicts: ['bike'] },
  scooter: { scenes: ALL, detail: 'color', pool: ['kirmizi', 'mavi', 'yesil', 'sari', 'turuncu', 'mor'] },
  cane: { scenes: ALL, detail: 'color', pool: CLOTH, person: (a) => ({ g: 'e', hair: 'gri', cane: true, top: a }) },
  flowers: { scenes: ALL, detail: 'color', pool: ['kirmizi', 'sari', 'mor', 'turuncu', 'beyaz', 'mavi'], conflicts: ['flowerBucket'], person: (a) => ({ g: 'k', hair: 'siyah', longHair: true, top: 'beyaz', flowers: a }) },
  musician: { scenes: ALL, detail: 'item', pool: INSTRUMENTS, person: (a) => ({ g: 'e', hair: 'siyah', top: 'siyah', instrument: a }) },
  umbrella: { scenes: ['cadde', 'aksam', 'pazar', 'park'], detail: 'color', pool: CLOTH, conflicts: ['redUmbrella'], person: (a, r) => ({ g: pickOf(r)(['k', 'e']), hair: 'kahve', top: 'beyaz', umbrella: a }) },
  helmet: { scenes: STREETS, detail: 'color', pool: ['sari', 'turuncu', 'beyaz', 'kirmizi', 'mavi'], person: (a) => ({ g: 'e', hair: 'kahve', top: 'turuncu', helmet: a }) },
  kite: { scenes: ['park'], detail: 'color', pool: ['kirmizi', 'mavi', 'yesil', 'sari', 'mor', 'turuncu'], conflicts: ['kite'], person: (a) => ({ g: 'e', s: 0.7, hair: 'kahve', top: 'sari', kite: a }) },
}
export const LEGACY_SUBJECTS = ['laugh', 'blonde', 'child', 'hat', 'vendor', 'shop']
export const templatesFor = (scene, taskId) => Object.keys(TEMPLATES).filter((id) => TEMPLATES[id].scenes.includes(scene) && !(TEMPLATES[id].conflicts ?? []).includes(taskId))

// ---------- cadde (yürüyüş sahnesi) ----------
// opts: { scene, taskId, subjects: [şablon], answers: { şablon: cevap } }. Verilmezse eski tur: Cadde, eski 4 görev,
// eski 6 konu ve 3 soru (bugünkü ekran StreetWalk.jsx bunu kullanır).
export function genStreet(seed, level = 1, opts = {}) {
  const r = rng(seed)
  const pick = pickOf(r)
  const chance = (p) => r() < p
  const scene = SCENE_IDS.includes(opts.scene) ? opts.scene : 'cadde'
  const kind = SCENES[scene].kind
  const lv = LEVELS[level] ?? LEVELS[1]
  const L = 2600 + (lv.people - 14) * 80
  const T = lv.walkSec
  const legacy = !opts.subjects
  const subjects = legacy ? LEGACY_SUBJECTS : opts.subjects.filter((id) => TEMPLATES[id]?.scenes.includes(scene))
  const answers = opts.answers ?? {}
  const s = { scene, L, seed, level, walkSec: T, ...backdrop(scene, (seed * 2654435761) >>> 0, L), people: [], cats: [], cars: [], bikes: [], vendors: [], items: [] }
  const task = legacy ? pick(TASKS) : { id: TARGETS[opts.taskId] ? opts.taskId : SCENE_TARGETS[scene][0] }
  s.task = task
  const want = (id) => task.id === id

  // yuvalar: kaldırımda 64 birimde bir, sıra sıra (arka/orta/ön)
  const rowsOf = kind === 'park' ? [622, 636, 650] : ROWS
  const slots = []
  // son görünümde kenarda yarım öğe kalmasın
  for (let sx = 120, i = 0; sx < L - 140; sx += SLOT, i++) slots.push({ x: sx + Math.floor(r() * 18), y: rowsOf[i % 3] })
  const free = shuffleWith(r, slots)
  const take = () => free.pop() ?? null
  const V = (L - 300) / T // ekranın sahne birimi hızı (eski ekran: 390 pt ≈ 300 birim)
  // Sağa yürüyen kişi kamera ona yetişecek kadar geride başlar (yoksa görünmeden caddeden çıkar); kalanlar sola yürür
  const dirAt = (x) => (x < L - 8 * T - 360 && chance(0.5) ? 1 : -1)
  const ordinary = (g) => ({
    g,
    hair: pick(g === 'k' ? ['kahve', 'siyah', 'kizil', 'gri'] : ['kahve', 'siyah', 'gri', 'sari']),
    skin: pick(SKIN),
    top: pick(CLOTH),
    dress: g === 'k' && chance(0.4),
    longHair: g === 'k' && chance(0.7),
    bag: g === 'k' && chance(0.3) ? pick(['siyah', 'beyaz']) : null,
    phone: chance(0.25),
  })
  const place = (q) => {
    const at = take()
    if (!at) return null
    const p = { ...q, x: at.x, y: at.y, skin: q.skin ?? pick(SKIN), dir: q.dir ?? dirAt(at.x) }
    s.people.push(p)
    return p
  }

  // Konular (soruların konusu sahnede tek)
  s.special = {}
  const answerOf = (id) => answers[id] ?? (TEMPLATES[id].pool ? pick(TEMPLATES[id].pool) : null)
  for (const id of subjects) {
    const t = TEMPLATES[id]
    const a = answerOf(id)
    if (t.person) {
      const p = place({ id, ...t.person(a, r) })
      if (p) s.special[id === 'child' ? 'mother' : id] = p
    } else if (id === 'vendor') {
      const at = take()
      take() // satıcı iki yuva kaplar
      if (at) s.vendors.push({ x: at.x, y: ROWS[0] + 4, type: a })
    } else if (id === 'cyclist') {
      // bisikletini yanında yürüten kişi (durur)
      const p = place({ id, g: 'e', hair: 'kahve', top: 'beyaz', walk: false })
      if (p) {
        s.items.push({ type: 'bike', x: p.x + 34 * p.dir, y: p.y + 2, color: a, ridden: true, id })
        s.special.cyclist = { ...p, bike: a }
      }
    } else if (id === 'scooter') {
      const p = place({ id, g: 'e', s: 0.75, hair: 'kahve', top: 'sari' })
      if (p) {
        s.items.push({ type: 'scooter', x: p.x + 4, y: p.y + 2, color: a, id })
        p.walk = false
        s.special.scooter = { ...p, scooter: a }
      }
    }
  }
  // Yeşil tente (caddede tek; soru konusu "shop") ve pazarda yeşil tezgâh ("stall")
  if (kind === 'street') {
    const gi = Math.floor(r() * Math.min(s.buildings.length, SHOPS.length))
    s.buildings[gi].aw = 'yesil'
  }
  if (kind === 'market') s.stalls[Math.floor(r() * s.stalls.length)].aw = 'yesil'

  // Görev hedefi: 2–6 tane (sayılacak şey en az 2)
  const nTarget = 2 + Math.floor(r() * 5)
  const personTarget = { hat: (q) => ({ ...q, hat: pick(['kirmizi', 'mavi', 'yesil', 'siyah', 'beyaz']) }), glasses: (q) => ({ ...q, glasses: true }), redUmbrella: (q) => ({ ...q, umbrella: 'kirmizi' }), yellowCoat: (q) => ({ ...q, coat: 'sari' }), balloon: (q) => ({ ...q, balloon: pick(['kirmizi', 'mavi', 'sari', 'mor']) }), kite: (q) => ({ ...q, s: 0.7, kite: pick(['kirmizi', 'mavi', 'sari', 'mor', 'turuncu']) }), runner: (q) => ({ ...q, run: true, top: pick(['kirmizi', 'mavi', 'yesil', 'turuncu']), dress: false, bag: null, phone: false }), stroller: (q) => ({ ...q, stroller: pick(['mavi', 'yesil', 'mor']), bag: null }) }
  if (personTarget[task.id]) for (let n = 0; n < nTarget; n++) place(personTarget[task.id](ordinary(chance(0.5) ? 'k' : 'e')))
  const addItems = (type, n, extra = () => ({})) => {
    for (let i = 0; i < n; i++) {
      const at = take()
      if (at) s.items.push({ type, x: at.x, y: at.y, ...extra() })
    }
  }
  const addTo = (list, n, extra) => {
    for (let i = 0; i < n; i++) {
      const at = take()
      if (at) list.push({ x: at.x, y: at.y, ...extra() })
    }
  }
  const catColor = () => ({ color: pick(Object.keys(CAT_COLORS)) })
  const bikeColor = () => ({ color: pick(['kirmizi', 'mavi', 'yesil', 'siyah']) })
  const dogColor = () => ({ color: pick(['siyah', 'beyaz', 'kahve', 'sari']), dir: pick([1, -1]) })
  // Görev öğeleri sıradan kişilerden önce yerleşir (sayılacak şey yuvasız kalmaz)
  const itemTarget = {
    cat: () => addTo(s.cats, nTarget, catColor),
    // sayılan bisiklet "geçer": yolun ön kenarında (parkta yolda) sürülür, sola akar; park bisikleti çizilmez
    bike: () => {
      const y = kind === 'park' ? BIKE_LANE.park : BIKE_LANE.street
      const gap = (L - 500) / nTarget
      for (let i = 0; i < nTarget; i++) s.items.push({ type: 'rider', x: Math.round(300 + i * gap + r() * gap * 0.5), y, dir: -1, v: Math.round(0.25 * V), ...bikeColor(), top: pick(CLOTH), skin: pick(SKIN), hair: pick(['kahve', 'siyah', 'gri']) })
    },
    dog: () => addItems('dog', nTarget, dogColor),
    watermelon: () => addItems('watermelon', nTarget),
    redCrate: () => addItems('crate', nTarget, () => ({ color: 'kirmizi' })),
    basket: () => addItems('basket', nTarget),
    flowerBucket: () => addItems('bucket', nTarget, () => ({ color: pick(['kirmizi', 'sari', 'mor']) })),
    ball: () => addItems('ball', nTarget, () => ({ color: pick(['kirmizi', 'mavi', 'sari']) })),
    pigeon: () => addItems('pigeon', nTarget),
  }
  itemTarget[task.id]?.()

  // Sıradan kişiler: konu özelliği yok (gülmez, sarışın kadın yok, çocuk, şapka, sakal, atkı, baston… yok)
  const rain = SCENES[scene].weather === 'yagmur'
  const umbrellaPool = ['siyah', 'mavi', 'lacivert', 'yesil', 'mor', 'bordo', 'turuncu']
  for (let n = 0; n < lv.people; n++) {
    const q = ordinary(chance(0.5) ? 'k' : 'e')
    if (rain) q.umbrella = pick(umbrellaPool)
    if (rain && chance(0.15) && !want('yellowCoat')) q.coat = pick(['lacivert', 'yesil', 'turuncu'])
    if (!want('glasses') && chance(0.12)) q.glasses = true
    place(q)
  }
  // Süs: görev değilse kedi, bisiklet, köpek; pazarda sandık, parkta top, bebek arabası, güvercin
  if (!want('cat')) addTo(s.cats, 2 + Math.floor(r() * 4), catColor)
  if (!want('bike') && kind !== 'market') addTo(s.bikes, 2 + Math.floor(r() * 4), bikeColor)
  if (!want('dog')) addItems('dog', 1 + Math.floor(r() * 2), dogColor)
  if (kind === 'market') {
    addItems('crate', 3 + Math.floor(r() * 3), () => ({ color: pick(['kahve', 'mavi', 'yesil', 'bordo']) }))
    // Tezgâh satıcıları (tezgâhın arkasında; motor tezgâhla birlikte çizer): şapkalı satıcı sayılır
    const hats = want('hatVendor') ? Math.min(nTarget, s.stalls.length) : 0
    const who = shuffleWith(r, s.stalls.map((_, i) => i))
    s.stallVendors = s.stalls.map((st, i) => ({ id: `sv${i}`, x: st.x + st.w / 2 + 30, y: 566, g: 'e', hair: pick(['siyah', 'gri', 'kahve']), skin: pick(SKIN), top: pick(['beyaz', 'mavi', 'yesil']), dir: -1, walk: false, hat: who.indexOf(i) < hats ? pick(['beyaz', 'kirmizi', 'sari']) : null }))
  }
  if (kind === 'park') {
    if (!want('ball')) addItems('ball', 1, () => ({ color: pick(['kirmizi', 'mavi', 'sari']) }))
    // bebek arabası hep yürüyen biriyle gider (duran bebek arabası yok)
    if (!want('stroller')) place({ ...ordinary(chance(0.5) ? 'k' : 'e'), stroller: pick(['mavi', 'yesil', 'mor']), bag: null })
    if (!want('pigeon')) addItems('pigeon', 2)
  }
  // yuva kalmadıysa yerleşmeyenler düşer (sayımlar yerleşenlerden)
  s.people = s.people.filter((p) => Number.isFinite(p.x))

  // Arabalar (yalnız caddede): iki şerit, şerit başına sabit hız (kendi hızında akar, birbirine binmez)
  if (kind === 'street') {
    const colorsPool = ['kirmizi', 'beyaz', 'siyah', 'yesil', 'mavi', 'lacivert', 'gri', 'bordo', 'beyaz', 'turuncu']
    const lanes = { far: { v: 0.35 * V, from: 260, to: L - 120 }, near: { v: 0.3 * V, from: 260, to: L - 0.3 * V * T - 260 } } // her araba ekran ortasından geçer (başta ortanın önünde, sonda arkasında)
    for (const [lane, cfg] of Object.entries(lanes)) {
      for (let cx = cfg.from + Math.floor(r() * 80); cx < cfg.to; cx += 220 + Math.floor(r() * 140)) {
        const color = pick(colorsPool)
        s.cars.push({ x: cx, lane, v: Math.round(cfg.v * 10) / 10, color, taxi: false })
      }
    }
    // Mavi, taksi ve kırmızı en az 2 (görev hangisiyse 2–6)
    const fix = (pred, set, min, exact = false) => {
      const have = s.cars.filter(pred).length
      const pool = shuffleWith(r, s.cars.filter((k) => !k.taxi && !['mavi', 'kirmizi', 'sari'].includes(k.color)))
      pool.slice(0, Math.max(0, min - have)).forEach(set)
      // görev hedefiyse fazlası başka renge (hedef sayısı 2–6: R5 sayım satırı)
      if (exact) shuffleWith(r, s.cars.filter(pred)).slice(min).forEach((k) => { k.color = 'beyaz'; k.taxi = false })
    }
    fix((k) => k.color === 'mavi' && !k.taxi, (k) => { k.color = 'mavi' }, want('blueCar') ? nTarget : 2, want('blueCar'))
    fix((k) => k.taxi, (k) => { k.color = 'sari'; k.taxi = true }, want('taxi') ? nTarget : 2, want('taxi'))
    fix((k) => k.color === 'kirmizi' && !k.taxi, (k) => { k.color = 'kirmizi' }, want('redCar') ? nTarget : 2, want('redCar'))
    // Akşam: yanan vitrinler
    if (SCENES[scene].light === 'aksam') {
      const lit = want('litShop') ? nTarget : Math.floor(s.buildings.length * 0.4)
      shuffleWith(r, s.buildings).slice(0, lit).forEach((b) => { b.lit = true })
    }
  }
  if (legacy) s.task = task
  s.counts = countAll(s)
  if (legacy) s.questions = makeQuestions(s, r)
  return s
}

// Kapak kırpımının yan kenarlarına oturan bloklar: caddede bina, pazarda tezgâh (aralığın ortasına kadar), parkta arka bina
export function coverBlocks(s) {
  const kind = SCENES[s.scene]?.kind ?? 'street'
  if (kind === 'market') return (s.stalls ?? []).map((st) => ({ x: st.x - 18, w: st.w + 36 }))
  if (kind === 'park') return (s.back ?? []).map((b) => ({ x: b.x, w: b.w }))
  return (s.buildings ?? []).map((b) => ({ x: b.x, w: b.w }))
}
// Kenarda bölünebilecek her şeyin kutusu (kişi, satıcı, kedi, bisiklet, öğe; arabalar yolda akar, sayılmaz)
const COVER_LISTS = {
  people: (q) => ({ ...q, type: 'person' }), stallVendors: (q) => ({ ...q, type: 'person' }),
  cats: (c) => ({ type: 'cat', y: ROWS[1], ...c }), bikes: (b) => ({ type: 'bike', y: ROWS[0], ...b }),
  vendors: (v) => ({ y: ROWS[0] + 4, ...v, goods: v.type, type: 'vendor' }), items: (it) => it,
}
export function coverBoxes(s) {
  return Object.entries(COVER_LISTS).flatMap(([k, f]) => (s[k] ?? []).map((x) => itemBox(f(x))))
}
const straddles = (b, x) => b.x < x - 1 && b.x + b.w > x + 1
// Kapakta çizilecek model: kırpımın yan kenarında bölünecek kişi ve öğeler kapağa çizilmez (yürüyüşte yerinde durur)
export function coverModel(s, view) {
  const x1 = view.vx + view.vw
  const out = { ...s }
  for (const [k, f] of Object.entries(COVER_LISTS)) {
    if (s[k]) out[k] = s[k].filter((x) => { const b = itemBox(f(x)); return !straddles(b, view.vx) && !straddles(b, x1) })
  }
  return out
}
// Görev ekranı kapak kırpımı (01/02). ratio: kutunun genişlik/yükseklik oranı (390 ve 320 aynı mantık, yalnız oran farklı).
// Yan kenarlar blok sınırında (tabela ya tam ya hiç), en az bir hedef tam içeride; genişlik eski kırpımın (380 birim
// yükseklik) genişliğine en yakın, eşitlikte kenarda az kişi bölen. Kenarda kalan kişi ve öğeler coverModel ile kapağa
// çizilmez (kalabalıkta her bina sınırında biri durur). Dikeyde tabela sırasının üstünden başlar; uzun kutuda alt kenar
// yakın şeridin altına (792) oturur.
export const COVER = { vh: 380, top: 416, bottom: 792, edge: 40 }
export function coverView(s, taskId, ratio) {
  const want = COVER.vh * ratio
  const blocks = coverBlocks(s)
  const boxes = coverBoxes(s)
  const xs = targetXs(s, taskId)
  const cuts = (x) => boxes.filter((b) => straddles(b, x)).length
  let best = null
  for (let i = 0; i < blocks.length; i++) {
    const x0 = blocks[i].x
    if (x0 < 0) continue
    for (let j = i; j < blocks.length; j++) {
      const x1 = blocks[j].x + blocks[j].w
      const vw = x1 - x0
      if (x1 > s.L || vw > want * 1.8) break
      if (vw < want * 0.6) continue
      // hedef kenarda bölünüp kapaktan düşüyorsa sayılmaz
      const hits = targetXs(coverModel(s, { vx: x0, vw }), taskId).filter((x) => x > x0 + COVER.edge && x < x1 - COVER.edge).length
      // dar kırpım alçalır (tabela ile yakın şerit birlikte sığmaz): darlık genişlikten üç kat pahalı
      const off = Math.log(vw / want)
      const score = (hits ? 0 : 5000) + (off < 0 ? -off * 900 : off * 300) + (cuts(x0) + cuts(x1)) * 12 - Math.min(hits, 3) * 4
      if (!best || score < best.score) best = { score, x0, vw }
    }
  }
  const vw = best ? best.vw : want
  const vx = best ? best.x0 : (xs[Math.floor(xs.length / 2)] ?? s.L / 3) - want / 2
  const vh = vw / ratio
  const vy = vh >= COVER.bottom - COVER.top ? COVER.bottom - vh : COVER.top
  return { vx, vy, vw, vh }
}

// 04 sayı sorusunun donmuş karesi: yürüyüşün sonu, sayılan hedefler ve soru konuları (id taşıyan kişi/öğe, satıcı)
// çıkarılmış; öbür kişi ve arabalar yerinde. Hedef süzgeci countAll'ın kendisi: tek başına sayıma giren öğe çıkar.
export function countModel(s, taskId) {
  const none = { people: [], items: [], cars: [], cats: [], bikes: [], buildings: [], stallVendors: [] }
  const hits = (key, e) => (countAll({ ...none, [key]: [e] })[taskId] ?? 0) > 0
  const keep = (key, extra = () => true) => (s[key] ?? []).filter((e) => extra(e) && !hits(key, e))
  return {
    ...s,
    people: keep('people', (p) => !p.id),
    items: keep('items', (i) => !i.id),
    cars: keep('cars'),
    cats: keep('cats'),
    bikes: keep('bikes'),
    vendors: [],
    buildings: (s.buildings ?? []).map((b) => (hits('buildings', b) ? { ...b, lit: false } : b)),
    stallVendors: (s.stallVendors ?? []).map((v) => (hits('stallVendors', v) ? { ...v, hat: null } : v)),
  }
}
// Donmuş karenin kırpımı (ratio: panelin genişlik/yükseklik oranı): sokak seviyesi. Alt kenar yolun bittiği yer,
// tabela sırasından yolun sonuna (üst kat cephesi yok; genişlik en az 220 birim) ve tabela sırası hep içeride; yatayda caddenin sonu
// (yürüyüşün son karesi). Yarım tabela ve kenarda bölünen kişi renderScene wholeSigns ve coverModel ile çizilmez.
export const COUNT_VIEW = { bottom: 796, top: 418, minW: 220 }
// model verilirse (countModel): caddenin son üç ekranı içinde en çok kişinin tam göründüğü yer (eşitlikte sona en
// yakın); boş kaldırım ve yarım araba kalmasın diye kenarda bölünen araba countPanel'de çizilmez.
export function countView(s, ratio, model = null) {
  const vw = Math.max(COUNT_VIEW.minW, (COUNT_VIEW.bottom - COUNT_VIEW.top) * ratio)
  const vh = vw / ratio
  let vx = s.L - vw
  if (model) {
    const boxes = coverBoxes(model)
    const score = (x0) => {
      const x1 = x0 + vw
      const inside = (model.people ?? []).filter((p) => { const b = itemBox({ ...p, type: 'person' }); return b.x >= x0 && b.x + b.w <= x1 }).length
      const cut = boxes.filter((b) => straddles(b, x0) || straddles(b, x1)).length
      return inside * 10 - cut * 3
    }
    let best = -Infinity
    for (let x0 = s.L - vw; x0 >= Math.max(0, s.L - 3 * vw); x0 -= 16) {
      const sc = score(x0)
      if (sc > best) { best = sc; vx = x0 }
    }
  }
  return { vx, vy: COUNT_VIEW.bottom - vh, vw, vh }
}
// 04 panelinin modeli: hedefsiz (countModel), kenarda bölünen kişi/öğe (coverModel) ve araba çizilmez
export function countPanel(s, taskId, view) {
  const m = coverModel(countModel(s, taskId), view)
  const x1 = view.vx + view.vw
  return { ...m, cars: (m.cars ?? []).filter((k) => !straddles({ x: k.x - 92, w: 184 }, view.vx) && !straddles({ x: k.x - 92, w: 184 }, x1)) }
}

// Sayılan hedeflerin yatay konumları (görev ekranının kapak kırpımı en az birini içersin)
export function targetXs(s, id) {
  const ppl = s.people ?? []
  const items = (t, pred = () => true) => (s.items ?? []).filter((i) => i.type === t && pred(i)).map((i) => i.x)
  const cars = (pred) => (s.cars ?? []).filter(pred).map((c) => c.x)
  const who = (pred) => ppl.filter(pred).map((p) => p.x)
  const X = {
    blueCar: () => cars((c) => c.color === 'mavi' && !c.taxi), taxi: () => cars((c) => c.taxi), redCar: () => cars((c) => c.color === 'kirmizi' && !c.taxi),
    bike: () => [...(s.bikes ?? []).map((b) => b.x), ...items('bike'), ...items('rider')], cat: () => (s.cats ?? []).map((c) => c.x), dog: () => [...items('dog'), ...who((p) => p.dog)],
    hat: () => who((p) => p.hat), glasses: () => who((p) => p.glasses), redUmbrella: () => who((p) => p.umbrella === 'kirmizi'), yellowCoat: () => who((p) => p.coat === 'sari'),
    balloon: () => who((p) => p.balloon || p.child === 'balon'), kite: () => who((p) => p.kite), runner: () => who((p) => p.run),
    litShop: () => (s.buildings ?? []).filter((b) => b.lit).map((b) => b.x + b.w / 2), hatVendor: () => (s.stallVendors ?? []).filter((v) => v.hat).map((v) => v.x),
    watermelon: () => items('watermelon'), redCrate: () => items('crate', (i) => i.color === 'kirmizi'), basket: () => items('basket'), flowerBucket: () => items('bucket'),
    ball: () => items('ball'), stroller: () => [...items('stroller'), ...who((p) => p.stroller)], pigeon: () => items('pigeon'),
  }
  return (X[id]?.() ?? []).filter(Number.isFinite).sort((a, b) => a - b)
}

// Sahnedeki sayılar (görev sorusunun doğru cevabı; çizimle aynı modelden)
export function countAll(s) {
  const ppl = s.people ?? []
  const items = s.items ?? []
  const cars = s.cars ?? []
  const typed = (t, pred = () => true) => items.filter((i) => i.type === t && pred(i)).length
  return {
    blueCar: cars.filter((c) => c.color === 'mavi' && !c.taxi).length,
    taxi: cars.filter((c) => c.taxi).length,
    redCar: cars.filter((c) => c.color === 'kirmizi' && !c.taxi).length,
    cat: (s.cats ?? []).length,
    bike: (s.bikes ?? []).length + typed('bike') + typed('rider'),
    dog: typed('dog') + ppl.filter((p) => p.dog).length,
    hat: ppl.filter((p) => p.hat).length,
    glasses: ppl.filter((p) => p.glasses).length,
    litShop: (s.buildings ?? []).filter((b) => b.lit).length,
    redUmbrella: ppl.filter((p) => p.umbrella === 'kirmizi').length,
    yellowCoat: ppl.filter((p) => p.coat === 'sari').length,
    watermelon: typed('watermelon'),
    hatVendor: (s.stallVendors ?? []).filter((p) => p.hat).length,
    redCrate: typed('crate', (i) => i.color === 'kirmizi'),
    basket: typed('basket'),
    flowerBucket: typed('bucket'),
    balloon: ppl.filter((p) => p.balloon || p.child === 'balon').length,
    kite: ppl.filter((p) => p.kite).length,
    runner: ppl.filter((p) => p.run).length,
    ball: typed('ball'),
    stroller: typed('stroller') + ppl.filter((p) => p.stroller).length,
    pigeon: typed('pigeon'),
  }
}

function colorOpts(r, correct, pool) {
  const o = shuffleWith(r, pool.filter((c) => c !== correct)).slice(0, 3)
  return shuffleWith(r, [...o, correct])
}
// Eski tur: 3 fark etme sorusu (bugünkü ekran; metinler bugünkü onaylı metin)
export function makeQuestions(s, r = rng(s.seed + 1)) {
  const sp = s.special
  const all = [
    { id: 'laugh', q: 'Çok gülen bir kadın vardı. Elbisesi ne renkti?', kind: 'color', a: sp.laugh.top, opts: colorOpts(r, sp.laugh.top, CLOTH) },
    { id: 'blonde', q: 'Sarışın bir kadın vardı. Çantası ne renkti?', kind: 'color', a: sp.blonde.bag, opts: colorOpts(r, sp.blonde.bag, ['kirmizi', 'yesil', 'mor', 'turuncu', 'sari', 'mavi']) },
    { id: 'child', q: 'Çocuklu bir kadın vardı. Çocuğun elinde ne vardı?', kind: 'item', a: sp.mother.child, opts: shuffleWith(r, Object.keys(ITEMS)) },
    { id: 'hat', q: 'Şapkalı bir adam vardı. Şapkası ne renkti?', kind: 'color', a: sp.hat.hat, opts: colorOpts(r, sp.hat.hat, CLOTH) },
    { id: 'vendor', q: 'Bir sokak satıcısı vardı. Ne satıyordu?', kind: 'item', a: s.vendors[0].type, opts: shuffleWith(r, Object.keys(VENDORS)) },
  ]
  const green = s.buildings.find((b) => b.aw === 'yesil')
  if (green) {
    const others = [...new Set(s.buildings.filter((b) => b.aw !== 'yesil').map((b) => b.shop))].filter((v) => v !== green.shop)
    all.push({ id: 'shop', q: 'Yeşil tenteli dükkân neydi?', kind: 'shop', a: green.shop, opts: shuffleWith(r, [...shuffleWith(r, others).slice(0, 3), green.shop]) })
  }
  return shuffleWith(r, all).slice(0, 3)
}
// Seçenek etiketi (eski sorular; yeni şablonların etiketi lib/streetText.js optionText)
export function optionLabel(q, v) {
  if (q.kind === 'color') return COLORS[v]?.name ?? v
  if (q.id === 'child') return ITEMS[v] ?? v
  if (q.id === 'vendor') return VENDORS[v] ?? v
  return v.charAt(0) + v.slice(1).toLocaleLowerCase('tr')
}
// Görev sorusunun seçenekleri: doğru sayı ve çevresi (4 ardışık sayı, 0'ın altına inmez)
export function countOptions(n, r = Math.random) {
  const start = Math.max(0, n - 1 - Math.floor(r() * 3))
  return [0, 1, 2, 3].map((k) => start + k)
}

// "Gözünden kaçan" sorusu (yeni tur; sahip kararı 2026-10-02): konu her zaman sahnededir. Her soruda aynı akış: kişi
// bildirilir ve "Onu fark ettin mi?" (METINLER G2), "Gördüm · Görmedim" (G3), iki cevapta da ayrıntı sorusu ve "Görmediysen
// de tahmin et." (G4). similar: sorulan renk sayılan hedefin rengi (Most 2001).
export const SAW = ['gordum', 'gormedim']
export function missedQuestion(s, id, { similar = false } = {}, r = rng(s.seed + 2)) {
  const t = TEMPLATES[id]
  const q = { id, detail: t.detail, similar: Boolean(similar), a: null, opts: [] }
  const sp = s.special ?? {}
  if (t.detail === 'shop' || t.detail === 'stall') {
    const list = t.detail === 'shop' ? s.buildings : s.stalls
    const key = t.detail === 'shop' ? 'shop' : 'sign'
    const green = list.find((b) => b.aw === 'yesil')
    const others = [...new Set(list.filter((b) => b.aw !== 'yesil').map((b) => b[key]))].filter((v) => v !== green[key])
    return { ...q, a: green[key], opts: shuffleWith(r, [...shuffleWith(r, others).slice(0, 3), green[key]]) }
  }
  const subj = id === 'child' ? sp.mother : sp[id]
  const a = id === 'vendor' ? s.vendors[0]?.type : id === 'child' ? subj?.child : id === 'cyclist' ? subj?.bike : id === 'scooter' ? subj?.scooter
    : id === 'blonde' ? subj?.bag : id === 'hat' ? subj?.hat : id === 'dogwalker' ? subj?.dog : id === 'scarf' ? subj?.scarf
      : id === 'flowers' ? subj?.flowers : id === 'musician' ? subj?.instrument : id === 'umbrella' ? subj?.umbrella
        : id === 'helmet' ? subj?.helmet : id === 'kite' ? subj?.kite : subj?.top
  const opts = t.detail === 'color' ? colorOpts(r, a, t.pool.length >= 4 ? t.pool : CLOTH) : shuffleWith(r, t.pool)
  return { ...q, a, opts }
}

// Puan: görev tam 1, bir eksik/fazla ½, yoksa 0; fark ettiklerin = "Gördüm" + doğru; doğru tahmin ("Görmedim" + doğru,
// METINLER Ş1) ayrı, puana katılmaz. guess: saw === 'gormedim' (saw yoksa eski ekranın guess alanı).
export const guessOf = (a) => (SAW.includes(a?.saw) ? a.saw === 'gormedim' : Boolean(a?.guess))
export const taskScore = (answer, n) => (answer === n ? 1 : Math.abs(answer - n) === 1 ? 0.5 : 0)
export function scoreRound({ countAnswer, n, answers = [] }) {
  return {
    task: taskScore(countAnswer, n),
    noticed: answers.filter((a) => a.ok && !guessOf(a)).length,
    guessedRight: answers.filter((a) => a.ok && guessOf(a)).length,
    asked: answers.length,
  }
}

// ---------- sahne basamağı (LADDERS['fark-ettin'], PLAN §2) ----------
// D: bugünden önce turu olan ayrı gün sayısı; Dstage: stage alanı olan (merdivenden sonra yazılmış) kayıtların günleri,
// lib/progression.js progressionCtx ile aynı. Basamak ve çeşitleme stageOf ile (yumuşak dönüş ve VAR_LAG aynı kural).
const dayOf = (s) => (s?.date ? dayKey(new Date(s.date)) : null)
export function sceneStage(sessions = [], now = new Date()) {
  const today = dayKey(now)
  const days = new Set()
  const fresh = new Set()
  let last = null
  for (const s of sessions ?? []) {
    if (s?.type !== SESSION_TYPE) continue
    const k = dayOf(s)
    if (!k || k >= today) continue
    days.add(k)
    if (s.stage != null) fresh.add(k)
    if (!last || k > last) last = k
  }
  const G = last ? calendarDaysBetween(last, today) : null
  const ladder = LADDERS['fark-ettin']
  const st = stageOf({ progression: { pathDay: 0, mod: { 'fark-ettin': { D: days.size, G, Dstage: fresh.size } }, later: [], seedDay: today } }, 'fark-ettin', ladder)
  const vars = ladder.variants.slice(0, (st.variant?.index ?? -1) + 1)
  const scenes = [...st.scenes, ...vars.filter((v) => v.scene).map((v) => v.scene)]
  const kinds = ['renk', 'gelir', 'gider', 'yer', ...vars.filter((v) => v.kind).map((v) => v.kind)]
  return { ...st, level: st.index + 1, scenes, kinds, days: [...days].sort() }
}
// Sonraki tur seviyesi = sahne basamağı (1..5). Eski kayıtlarla da çalışır (yalnız tarih ve tür okunur).
export const nextLevel = (sessions = [], now = new Date()) => sceneStage(sessions, now).level

// ---------- kayıt ----------
// Eski alanlar aynen yazılır; eklenenler (PLAN §3.3): scene, changeN, changes [{ n, looks, found, kind, obj }],
// askedIds, answers[].saw ('gordum' | 'gormedim')/similar; ayrıca stage (basamak kimliği, öbür merdivenli modüllerdeki gibi), obj (§9c madde
// 3 "değişen nesne" hafızası), fact ve factOpen (§9c madde 6 bilim kartı hafızası).
export function changeNOf(changes = []) {
  const ok = (changes ?? []).filter((c) => c && c.found && c.looks >= 1 && c.looks <= 2 && Number.isFinite(c.n))
  return ok.length ? Math.max(...ok.map((c) => c.n)) : null
}
export function makeRecord({ street, countAnswer, answers = [], seconds, changes = [], fact = null, factOpen = false }, date = new Date()) {
  const sc = scoreRound({ countAnswer, n: street.counts[street.task.id], answers })
  return {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    seed: street.seed,
    level: street.level,
    stage: `F${street.level}`, // yol motorunun basamak alanı (lib/progression.js Dstage)
    scene: street.scene ?? 'cadde',
    taskId: street.task.id,
    count: street.counts[street.task.id],
    countAnswer,
    task: sc.task,
    noticed: sc.noticed,
    guessedRight: sc.guessedRight,
    asked: sc.asked,
    askedIds: answers.map((a) => a.id),
    answers: answers.map((a) => ({ id: a.id, ok: Boolean(a.ok), guess: guessOf(a), saw: SAW.includes(a.saw) ? a.saw : null, similar: Boolean(a.similar) })),
    changeN: changeNOf(changes),
    changes: (changes ?? []).map((c) => ({ n: c.n, looks: c.looks, found: Boolean(c.found), kind: c.kind, obj: c.obj ?? null })),
    fact,
    factOpen: Boolean(factOpen),
    seconds: Math.round(seconds ?? 0),
  }
}

// Bilim kartları: hepsi PubMed özetinden doğrulandı
export const FACTS = [
  { id: 'gorilla', claim: 'Dikkat bir göreve kilitliyken göz önündeki şeyler fark edilmeyebilir.', answer: 'fact', body: 'Fark etme, beklenmeyen şeyin görevdeki nesnelere benzerliğine ve görevin zorluğuna bağlı.', ref: 'Simons & Chabris 1999 · Perception', doi: '10.1068/p281059' },
  { id: 'radiologists', claim: 'Uzmanlar gözlerinin önündekini kaçırmaz.', answer: 'myth', body: 'Radyologların %83’ü akciğer görüntüsüne konan goril resmini görmedi; çoğu tam üstüne bakmıştı.', ref: 'Drew ve ark. 2013 · Psychol Sci', doi: '10.1177/0956797613479386' },
  { id: 'mindful', claim: 'Kısa bir farkındalık çalışması fark etmeyi artırabilir.', answer: 'fact', body: '794 kişilik çalışmada kısa bir farkındalık çalışması beklenmeyen nesneyi fark etmeyi artırdı. Bu yüzden bu durak yolda Nefes’ten sonra.', ref: 'Schofield ve ark. 2015 · Conscious Cogn', doi: '10.1016/j.concog.2015.08.007' },
  { id: 'guess', claim: 'Fark etmediğin şeyi bile tahmin edebilirsin.', answer: 'fact', body: 'Görmedim diyenler, beklenmeyen nesneyle ilgili çoktan seçmeli sorularda şanstan daha iyi tahmin etti.', ref: 'Kreitz ve ark. 2020 · Q J Exp Psychol', doi: '10.1177/1747021820911324' },
  { id: 'smart', claim: 'Zeki insanlar daha çok fark eder.', answer: 'myth', body: 'Meta-analizde bilişsel yetenek ya da kişilik, beklenmeyen nesneyi fark etmeyi güvenilir biçimde öngörmedi.', ref: 'Simons ve ark. 2024 · Psychon Bull Rev', doi: '10.3758/s13423-023-02431-x' },
  { id: 'practice', claim: 'Alıştırmayla bu tür görevde daha az kaçırılır.', answer: 'fact', body: 'Cerrahlarda iki grup da ikinci videoda daha az kaçırdı; 8 haftalık farkındalık programı yapanlar kontrol grubundan daha iyiydi. Küçük pilot çalışma.', ref: 'Pandit ve ark. 2022 · Front Surg', doi: '10.3389/fsurg.2022.916228' },
  { id: 'load', claim: 'Görev zorlaştıkça fark etme azalır.', answer: 'fact', body: 'Görevdeki başarı herkes için eşitlendiğinde bile görevin talebi fark etme oranını etkiledi. Bu yüzden seviye görevi zorlaştırır.', ref: 'Simons & Jensen 2009 · Psychon Bull Rev', doi: '10.3758/PBR.16.2.398' },
]
export const ANSWER_TEXT = { fact: 'Doğru', myth: 'Efsane' }
export const factFor = (sessions = []) => FACTS[sessions.filter(isStreet).length % FACTS.length]
