// Fark Ettin mi? — kalabalık cadde, görev ve fark etme soruları. Saf mantık (çizim: lib/streetSvg.js).
// Tasarım: Artifact "Fark Ettin mi?" (onaylı). Yöntem: dikkat bir göreve yönlendirilir (ör. sarı taksileri say), sonra
// görevle ilgisi olmayan ama açıkça görünen ayrıntılar sorulur (dikkatsizlik körlüğü; Simons & Chabris 1999,
// DOI 10.1068/p281059; ameliyat videolarıyla aynı düzen: Pandit 2022, DOI 10.3389/fsurg.2022.916228).
// Görev zorlaştıkça fark etme azalır (Simons & Jensen 2009, DOI 10.3758/PBR.16.2.398) → seviye görevle ayarlanır.
// "Fark etmedim" deyip doğru tahmin ayrı sayılır (Kreitz 2020, DOI 10.1177/1747021820911324).
// İddia sınırı: gerçek hayatta daha çok fark ettirdiği gösterilmedi; ilk turdan sonra kişi soruları bekler, bu yüzden
// bu bir gözlem alıştırmasıdır. Puan kişi-içi gidişat içindir (Simons 2024, DOI 10.3758/s13423-023-02431-x).

export const SESSION_TYPE = 'street'
export const isStreet = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.noticed)

export function rng(seed = Date.now()) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pickOf = (r) => (list) => list[Math.floor(r() * list.length)]
function shuffleWith(r, list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Renkler: 8 basit ad (erişilebilirlik; seçeneklerde yuvarlak + ad)
export const COLORS = {
  kirmizi: { name: 'kırmızı', hex: '#E5484D' },
  mavi: { name: 'mavi', hex: '#3E7BFA' },
  sari: { name: 'sarı', hex: '#F5C542' },
  yesil: { name: 'yeşil', hex: '#2FA56A' },
  mor: { name: 'mor', hex: '#8E6CEF' },
  turuncu: { name: 'turuncu', hex: '#F28C38' },
  siyah: { name: 'siyah', hex: '#2A2E33' },
  beyaz: { name: 'beyaz', hex: '#F2F2F2' },
}
export const CLOTH = ['kirmizi', 'mavi', 'yesil', 'mor', 'turuncu', 'siyah', 'beyaz', 'sari']
export const HAIR = { kahve: '#6B4A2F', siyah: '#1d1d1f', kizil: '#B5532A', gri: '#B8BBBE', sari: '#E8C66A' }
export const SKIN = ['#F2C9A5', '#E0AC82', '#C68A5E', '#8D5A3B']
export const ITEMS = { balon: 'balon', dondurma: 'dondurma', ayi: 'oyuncak ayı', bayrak: 'bayrak' }
export const VENDORS = { simit: 'simit', misir: 'mısır', kestane: 'kestane', cicek: 'çiçek' }
export const SHOPS = ['FIRIN', 'KAFE', 'ÇİÇEKÇİ', 'KİTAPÇI', 'MANAV', 'BERBER', 'KUYUMCU', 'TERZİ', 'PASTANE']
export const CAT_COLORS = { siyah: '#2A2E33', turuncu: '#E08A3C', gri: '#9AA0A6', beyaz: '#F2F2F2' }
const AWNINGS = ['kirmizi', 'mavi', 'sari', 'mor', 'turuncu'] // yeşil ayrı: caddede tek (soru)

export const TASKS = [
  { id: 'blueCar', text: 'Mavi arabaları say', q: 'Kaç mavi araba geçti?' },
  { id: 'taxi', text: 'Sarı taksileri say', q: 'Kaç sarı taksi geçti?' },
  { id: 'cat', text: 'Kedileri say', q: 'Kaç kedi gördün?' },
  { id: 'bike', text: 'Bisikletleri say', q: 'Kaç bisiklet geçti?' },
]

// Seviye: kalabalık ve yürüyüş süresi (VARSAYIM; taslakta 30 sn, uygulamada ~40 sn)
export const LEVELS = {
  1: { people: 14, walkSec: 40 },
  2: { people: 18, walkSec: 36 },
  3: { people: 22, walkSec: 32 },
}
export const GROUND = 236
export const VH = 300
export const SLOT = 72

// Cadde: seed ve seviyeden deterministik
export function genStreet(seed, level = 1) {
  const r = rng(seed)
  const pick = pickOf(r)
  const chance = (p) => r() < p
  const lv = LEVELS[level] ?? LEVELS[1]
  const L = 2600 + (lv.people - 14) * 60
  const s = { L, seed, level, buildings: [], people: [], cats: [], cars: [], bikes: [], vendors: [], trees: [], lamps: [] }
  const shops = shuffleWith(r, SHOPS)
  let x = 0
  let i = 0
  while (x < L) {
    const w = 150 + Math.floor(r() * 70)
    const h = 150 + Math.floor(r() * 70)
    s.buildings.push({ x, w, h, body: pick(['#D9C9B6', '#C8D3DA', '#E5D8C3', '#BFC7B8', '#D8C0BD', '#C9C1D6']), shop: shops[i % shops.length], aw: AWNINGS[i % AWNINGS.length] })
    x += w + 4
    i++
  }
  // Yeşil tente caddede tek: ilk 9 dükkândan (isimler tekil) birine
  const gi = Math.floor(r() * Math.min(s.buildings.length, shops.length))
  s.buildings[gi].aw = 'yesil'
  for (let tx = 120; tx < L; tx += 420 + Math.floor(r() * 80)) s.trees.push({ x: tx })
  for (let lx = 300; lx < L; lx += 460) s.lamps.push({ x: lx })
  const slots = []
  for (let sx = 120; sx < L - 80; sx += SLOT) slots.push(sx + Math.floor(r() * 18))
  const free = shuffleWith(r, slots)
  const take = () => free.pop()
  const cl = shuffleWith(r, CLOTH)
  // Özel kişiler: soruların konusu, caddede tek
  s.special = {
    laugh: { id: 'laugh', x: take(), g: 'k', hair: 'kahve', skin: pick(SKIN), top: cl[0], dress: true, laugh: true },
    blonde: { id: 'blonde', x: take(), g: 'k', hair: 'sari', skin: SKIN[0], top: pick(['siyah', 'beyaz', 'mavi']), dress: false, bag: pick(['kirmizi', 'yesil', 'mor', 'turuncu', 'sari']) },
    mother: { id: 'mother', x: take(), g: 'k', hair: pick(['siyah', 'kizil']), skin: pick(SKIN), top: cl[1], dress: true, child: pick(Object.keys(ITEMS)) },
    hat: { id: 'hat', x: take(), g: 'e', hair: 'siyah', skin: pick(SKIN), top: cl[2], dress: false, hat: cl[3] },
  }
  for (const k of Object.keys(s.special)) s.people.push(s.special[k])
  s.vendors.push({ x: take(), type: pick(Object.keys(VENDORS)) }) // soru konusu: yuvası garanti
  // Sıradan kişiler: özel özellik yok (gülmez, sarışın kadın yok, çocuk yok, şapka yok)
  for (let n = 0; n < lv.people; n++) {
    const g = chance(0.5) ? 'k' : 'e'
    s.people.push({
      x: take(),
      g,
      hair: pick(g === 'k' ? ['kahve', 'siyah', 'kizil', 'gri'] : ['kahve', 'siyah', 'gri', 'sari']),
      skin: pick(SKIN),
      top: pick(CLOTH),
      dress: g === 'k' && chance(0.4),
      bag: g === 'k' && chance(0.3) ? pick(['siyah', 'beyaz']) : null,
      phone: chance(0.25),
    })
  }
  const nCats = 2 + Math.floor(r() * 4)
  for (let c = 0; c < nCats; c++) s.cats.push({ x: take(), color: pick(Object.keys(CAT_COLORS)) })
  const nB = 2 + Math.floor(r() * 4)
  for (let b = 0; b < nB; b++) s.bikes.push({ x: take(), color: pick(['kirmizi', 'mavi', 'yesil', 'siyah']) })
  // yuva kalmadıysa yerleşmeyenler düşer (sayımlar yerleşenlerden)
  s.people = s.people.filter((p) => Number.isFinite(p.x))
  s.cats = s.cats.filter((c) => Number.isFinite(c.x))
  s.bikes = s.bikes.filter((b) => Number.isFinite(b.x))
  let cx = 60
  while (cx < L - 120) {
    const color = pick(['kirmizi', 'beyaz', 'siyah', 'yesil', 'mavi', 'mavi', 'sari', 'beyaz'])
    s.cars.push({ x: cx, color, taxi: color === 'sari' })
    cx += 150 + Math.floor(r() * 120)
  }
  // Sayılacak şey en az 2 olsun
  const fix = (color, taxi) => {
    const have = s.cars.filter((k) => k.color === color).length
    shuffleWith(r, s.cars.filter((k) => k.color !== 'mavi' && k.color !== 'sari')).slice(0, Math.max(0, 2 - have)).forEach((k) => {
      k.color = color
      k.taxi = taxi
    })
  }
  fix('mavi', false)
  fix('sari', true)
  s.task = pick(TASKS)
  s.counts = {
    blueCar: s.cars.filter((c) => c.color === 'mavi').length,
    taxi: s.cars.filter((c) => c.taxi).length,
    cat: s.cats.length,
    bike: s.bikes.length,
  }
  s.questions = makeQuestions(s, r)
  return s
}

function colorOpts(r, correct, pool) {
  const o = shuffleWith(r, pool.filter((c) => c !== correct)).slice(0, 3)
  return shuffleWith(r, [...o, correct])
}
// 3 fark etme sorusu: yalnız caddede tek olan kişi/nesne hakkında; 4 seçenek, biri doğru
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
// Seçenek etiketi
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

// Puan (taslaktaki tablo): görev tam 1, bir eksik/fazla ½, yoksa 0; fark ettiklerin = "fark ettim" + doğru;
// doğru tahmin ayrı, puana katılmaz.
export const taskScore = (answer, n) => (answer === n ? 1 : Math.abs(answer - n) === 1 ? 0.5 : 0)
export function scoreRound({ countAnswer, n, answers = [] }) {
  return {
    task: taskScore(countAnswer, n),
    noticed: answers.filter((a) => a.ok && !a.guess).length,
    guessedRight: answers.filter((a) => a.ok && a.guess).length,
    asked: answers.length,
  }
}
// Sonraki seviye: son 2 turda görev tam doğruysa bir üst; son tur görev 0 ise bir alt
export function nextLevel(sessions = []) {
  const past = sessions.filter(isStreet)
  const last = past.at(-1)
  const lv = last?.level ?? 1
  if (!last) return 1
  const two = past.slice(-2)
  if (two.length === 2 && two.every((s) => s.task === 1)) return Math.min(3, lv + 1)
  if (last.task === 0) return Math.max(1, lv - 1)
  return lv
}

export function makeRecord({ street, countAnswer, answers, seconds }, date = new Date()) {
  const sc = scoreRound({ countAnswer, n: street.counts[street.task.id], answers })
  return {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    seed: street.seed,
    level: street.level,
    taskId: street.task.id,
    count: street.counts[street.task.id],
    countAnswer,
    task: sc.task,
    noticed: sc.noticed,
    guessedRight: sc.guessedRight,
    asked: sc.asked,
    answers: answers.map((a) => ({ id: a.id, ok: Boolean(a.ok), guess: Boolean(a.guess) })),
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
