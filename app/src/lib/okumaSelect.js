// Oku ve Anla metin ve soru seçimi (okuma-anlama/PLAN.md §4). Saf; tohumlu, her koşuda aynı sonuç.
//  - Kişiye özgü tohumla karılmış "okuma sırası"; sıradaki metin bu sıranın bu turda bitirilmemiş ilk metni. Yarıda kalan
//    metin okunmuş sayılmaz, ertesi gün yine gelir; bitirilen metin aynı turda bir daha gelmez.
//  - Banka bitince yeni tur (cycle + 1), yeni sıra: önceki turun son 30 metni yeni turun ilk 30 sırasına girmez.
//  - Sırada art arda iki metin aynı etikette olmaz (tur geçişi dahil).
//  - Soru takımı: ana fikir sorusu + 5 ayrıntıdan 3'ü; yeni turda önceki turda sorulmayan ayrıntılar önce gelir.
//    Soru ve şık sırası seedHash ile; doğru seçenek dört konuma eşit dağılır.
import { seedHash } from './progression.js'
import { TEXTS, textById, qId } from './okumaBank.js'
import { isFinished } from './okumaMeasure.js'

export const TAIL = 30
export const DETAILS = 3

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
function shuffle(list, rand) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Karılmış sıradan kurallara uyan sıra: her adımda kalanlar arasında kurala uyan ilk metin. Takılırsa (kalanların hepsi
// aynı etikette) başka tuzla yeniden karılır.
function build(ids, tagOf, { seed, prevTail, prevTag }) {
  const tail = new Set(prevTail)
  for (let attempt = 0; attempt < 64; attempt++) {
    const pool = shuffle(ids, rng(seedHash(`${seed}:${attempt}`)))
    const out = []
    let last = prevTag
    while (pool.length) {
      const pos = out.length
      const k = pool.findIndex((id) => tagOf(id) !== last && !(pos < TAIL && tail.has(id)))
      if (k < 0) break
      const [id] = pool.splice(k, 1)
      out.push(id)
      last = tagOf(id)
    }
    if (!pool.length) return out
  }
  return shuffle(ids, rng(seedHash(String(seed)))) // olmaz: 8 etiket, 120 metin; test 1 000 tohumla sınar
}

const memo = new Map()
// Bir turun okuma sırası. prevTail: önceki turda bitirilen son 30 metin (eskiden yeniye).
export function readingOrder(seed, cycle = 0, prevTail = [], texts = TEXTS) {
  const key = `${seed}|${cycle}|${prevTail.join(',')}|${texts.length}`
  if (memo.has(key)) return memo.get(key)
  const tags = new Map(texts.map((t) => [t.id, t.etiket]))
  const order = build(texts.map((t) => t.id), (id) => tags.get(id), { seed: `${seed}:${cycle}`, prevTail, prevTag: tags.get(prevTail.at(-1)) ?? null })
  if (memo.size > 64) memo.clear()
  memo.set(key, order)
  return order
}

// Bitirilmiş okumalardan bugünkü durum → { textId, cycle }
export function nextText({ seed, sessions = [], texts = TEXTS }) {
  const done = sessions.filter(isFinished)
  const n = texts.length
  let cycle = done.length ? Math.max(...done.map((s) => (Number.isInteger(s.cycle) ? s.cycle : 0))) : 0
  let inCycle = new Set(done.filter((s) => (s.cycle ?? 0) === cycle).map((s) => s.textId))
  if (texts.every((t) => inCycle.has(t.id)) && n) {
    cycle += 1
    inCycle = new Set()
  }
  const prevTail = done.filter((s) => (s.cycle ?? 0) === cycle - 1).map((s) => s.textId).slice(-TAIL)
  const order = readingOrder(seed, cycle, prevTail, texts)
  return { textId: order.find((id) => !inCycle.has(id)) ?? order[0], cycle }
}

// Turun ayrıntı soruları (bankadaki sıra numaraları): tur 0 tohumla 3'ü; sonraki turda önce önceki turda sorulmayanlar.
export function detailSet(text, cycle = 0) {
  const details = text.sorular.map((q, i) => (q.tur === 'ana' ? -1 : i)).filter((i) => i >= 0)
  let set = shuffle(details, rng(seedHash(`${text.id}:0`))).slice(0, DETAILS)
  for (let c = 1; c <= cycle; c++) {
    const fresh = details.filter((i) => !set.includes(i))
    const keep = shuffle(set, rng(seedHash(`${text.id}:${c}`)))
    set = [...fresh, ...keep].slice(0, DETAILS)
  }
  return [...set].sort((a, b) => a - b)
}

// Gösterilecek soru takımı: [{ id, index, tur, soru, options: [{ text, correct }] }]
export function questionSet(text, cycle = 0) {
  const ana = text.sorular.findIndex((q) => q.tur === 'ana')
  const picked = shuffle([ana, ...detailSet(text, cycle)], rng(seedHash(`${text.id}:${cycle}:sorular`)))
  return picked.map((index) => {
    const q = text.sorular[index]
    const h = seedHash(`${text.id}:${cycle}:${index}`)
    const at = h % q.secenekler.length // doğru seçeneğin yeri, dört konuma eşit
    const wrong = shuffle(q.secenekler.slice(1), rng(h)).map((t) => ({ text: t, correct: false }))
    wrong.splice(at, 0, { text: q.secenekler[0], correct: true })
    return { id: qId(text.id, index), index, tur: q.tur, soru: q.soru, options: wrong }
  })
}

export const todayText = ({ seed, sessions }) => {
  const { textId, cycle } = nextText({ seed, sessions })
  return { text: textById(textId), cycle }
}
