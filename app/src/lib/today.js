// Bugünün yolu (Build 26). Duraklar modüllerden gelir (manifest.today); bu dosya onları sabit bir şablona
// dizer, göz bütçesine göre iki bölüme ayırır ve aradaki molayı (Nefes) yerleştirir. Kayıt defterini içe
// aktarmaz (döngü olmasın diye modül listesi parametre olarak gelir). Tasarım ve kurallar: yol planı
// (docs/yol-haritasi/ENVANTER_VE_PLAN.md §13, Artifact "Bugünün Yolu").
//
// manifest.today(ctx) → null | durak | [durak, …]
//   ctx = { tests, sessions, now, profile? }
//   durak = { title, minutes, done, route?, key?, sub?, glyph?,
//             slot?:  'warmup' | 'test' | 'body' | 'practice' | 'rest' | 'measure' | 'open' | 'finale',
//             order?: şablondaki yer (ORDER), eyeMin?: göz bütçesinden düşen dk (varsayılan: 'eye' kapısında minutes),
//             openEnded?: süresi kullanıcıya bağlı oyun (bölümün son göz durağı olur),
//             exclusive?: o gün 2. bölümün tek göz durağı (Hızlı Bakış), dropRank?: yol uzarsa düşme sırası (1 ilk) }
//   null: modül bugün yolda yok (ör. haftalık test zamanı gelmedi)
export const WEEK_MS = 7 * 86400000

const time = (r) => {
  const t = new Date(r?.date).getTime()
  return Number.isFinite(t) ? t : null
}
export const isSameDay = (r, now = new Date()) => {
  const t = time(r)
  return t != null && new Date(t).toDateString() === new Date(now).toDateString()
}
export const lastOfType = (records = [], type) => records.filter((r) => r.type === type).at(-1) ?? null
// Son kayıt yoksa ya da 7 günden eskiyse zamanı gelmiştir (Home.jsx eski "due" kuralı).
export const isDue = (rec, now = new Date()) => !rec || time(rec) == null || new Date(now).getTime() - time(rec) > WEEK_MS
// Son N gün içindeki kayıtlar (now dahil geriye)
export const withinDays = (records = [], now = new Date(), days = 7) => {
  const since = new Date(now).getTime() - days * 86400000
  return records.filter((r) => {
    const t = time(r)
    return t != null && t >= since
  })
}
export const doneToday = (records = [], type, now = new Date()) => records.some((r) => r.type === type && isSameDay(r, now))

// Şablon (yol planı §3.2): 1. bölüm | mola | 2. bölüm | final. Ritim: egzersiz, ölçüm, egzersiz, pratik…
export const ORDER = { warmup: 10, test: 20, body: 30, practice: 40, rest: 60, measure: 80, open: 100, finale: 110 }
const DEFAULT_ORDER = 95 // şablonda yeri olmayan takılı modül: 2. bölümün sonuna
// VARSAYIM (yol planı §7): hedef 15 dk, üst sınır 20 dk; bölüm payı = bütçe − 1 dk (TrueDepth adımı takılabilir);
// Nefes molayı ancak son moladan beri ≥ 1 dk göz çalışması varsa başlatır.
export const PATH = { targetMin: 15, capMin: 20, marginMin: 1, restMinUsed: 1 }
const MIN = 60000

function collect(modules, c) {
  const out = []
  for (const m of modules) {
    if (m.retired || typeof m.today !== 'function') continue
    let got = null
    try {
      got = m.today(c)
    } catch {
      got = null // bozuk modül yolu düşürmez
    }
    for (const it of [].concat(got ?? [])) {
      if (!it || typeof it.title !== 'string') continue
      const budget = m.gates?.eyeBudget ?? null
      const minutes = Number.isFinite(it.minutes) ? it.minutes : null
      const slot = it.slot ?? (m.kind === 'measure' ? 'measure' : 'body')
      out.push({
        key: it.key ? `${m.id}:${it.key}` : m.id,
        id: m.id,
        route: it.route ?? (m.routes ?? [m.id])[0],
        title: it.title,
        sub: it.sub ?? null,
        glyph: it.glyph ?? null,
        minutes,
        done: Boolean(it.done),
        kind: m.kind,
        ring: m.ring,
        slot,
        order: Number.isFinite(it.order) ? it.order : ORDER[it.slot] ?? DEFAULT_ORDER,
        budget,
        eyeMin: Number.isFinite(it.eyeMin) ? it.eyeMin : budget === 'eye' ? minutes ?? 1 : 0,
        openEnded: Boolean(it.openEnded),
        exclusive: Boolean(it.exclusive),
        dropRank: Number.isFinite(it.dropRank) ? it.dropRank : null,
        homeOrder: m.home?.order ?? 999,
      })
    }
  }
  return out.sort((a, b) => a.order - b.order || a.homeOrder - b.homeOrder)
}

const eyeSum = (list) => list.reduce((a, s) => a + s.eyeMin, 0)
const minSum = (list) => list.reduce((a, s) => a + (s.minutes ?? 0), 0)
const isMeasure = (s) => s.kind === 'measure'

// Düşürülebilir en düşük öncelikli (tamamlanmamış) durağı çıkar; çıkardıysa true
function dropOne(lists) {
  let best = null
  for (const list of lists) {
    for (const s of list) {
      if (s.done || s.dropRank == null) continue
      if (!best || s.dropRank < best.s.dropRank || (s.dropRank === best.s.dropRank && s.order > best.s.order)) best = { s, list }
    }
  }
  if (!best) return false
  best.list.splice(best.list.indexOf(best.s), 1)
  return true
}

// R1: iki ölçüm art arda gelmez; ikinciyi arkasındaki ilk ölçüm olmayan durakla yer değiştir
function separateMeasures(list) {
  for (let i = 1; i < list.length; i++) {
    if (!isMeasure(list[i]) || !isMeasure(list[i - 1])) continue
    const j = list.findIndex((s, k) => k > i && !isMeasure(s) && !s.openEnded)
    if (j < 0) continue
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

// ctx.eye: App'in eyeStatus() sonucu { locked, due, used, budgetMs, leftMs, reason } (yoksa bütçe boş sayılır)
// ctx.gate.firstTestOnly: abonelik yok ve hiç test yok → yalnızca ilk test açık; E testi 1. durak olur (R6)
export function buildPath(modules = [], ctx = {}) {
  const c = { tests: [], sessions: [], now: new Date(), ...ctx }
  const eye = c.eye ?? null
  const budgetMin = (eye?.budgetMs ?? 5 * MIN) / MIN
  const cap = Math.max(1, budgetMin - PATH.marginMin)
  let items = collect(modules, c)

  // R5: Hızlı Bakış günü 2. bölüm yalnız onun (50 deneme bütçe kilidine takılmasın); diğer açık uçlular ve
  // 2. bölüm egzersizleri o gün düşer. Ölçümler kalır (bütçe tüketmez).
  const exclusive = items.find((s) => s.exclusive)
  if (exclusive) {
    items = items.filter((s) => s === exclusive || !(s.openEnded || (s.order > ORDER.rest && s.budget === 'eye' && s.order < ORDER.finale)))
  }
  // Günde en çok bir açık uçlu durak
  const opens = items.filter((s) => s.openEnded)
  if (opens.length > 1) items = items.filter((s) => !s.openEnded || s === opens[0])

  const rest = items.find((s) => s.slot === 'rest') ?? null
  const finale = items.filter((s) => s.slot === 'finale')
  const middle = items.filter((s) => s !== rest && s.slot !== 'finale')
  const sec1 = rest ? middle.filter((s) => s.order < rest.order) : middle
  const sec2 = rest ? middle.filter((s) => s.order > rest.order) : []

  // R2: bölüm göz payı ≤ cap. Taşarsa 1. bölümün son egzersiz/pratik durağı 2. bölüme geçer (mola varsa)
  if (rest) {
    while (eyeSum(sec1) > cap) {
      const k = sec1.findLastIndex((s) => s.budget === 'eye' && s.slot !== 'warmup')
      if (k < 0) break
      sec2.unshift(...sec1.splice(k, 1))
    }
  }
  // 2. bölüm taşarsa düşme sırası (R7). Hızlı Bakış günü bölüm onun: molanın ardından tam bütçeyle başlar.
  while (!sec2.some((s) => s.exclusive) && eyeSum(sec2) > cap && dropOne([sec2])) {
    // düşürmeye devam
  }
  // R7: yol üst sınırı aşarsa Yılan / Hızlı Bakış → Bugünün görevi → Daire düşer
  const all = () => [...sec1, ...(rest ? [rest] : []), ...sec2, ...finale]
  while (minSum(all()) > PATH.capMin && dropOne([sec2, finale, sec1])) {
    // düşürmeye devam
  }
  // R5: açık uçlu durak bölümünün son göz durağı
  for (const sec of [sec1, sec2]) {
    const k = sec.findIndex((s) => s.openEnded)
    if (k >= 0 && k < sec.length - 1) sec.push(...sec.splice(k, 1))
  }
  separateMeasures(sec1)
  separateMeasures(sec2)
  // R6: abonelik yokken yalnızca ilk test açık → E testi ilk durak
  if (c.gate?.firstTestOnly) {
    const k = sec1.findIndex((s) => s.slot === 'test')
    if (k > 0) sec1.unshift(...sec1.splice(k, 1))
  }

  const stops = [
    ...sec1.map((s) => ({ ...s, block: 1 })),
    ...(rest ? [{ ...rest, block: 0, restSlot: true }] : []),
    ...sec2.map((s) => ({ ...s, block: 2 })),
    ...finale.map((s) => ({ ...s, block: 2, finale: true })),
  ]

  // Canlı bütçe: kilitliyse ya da bütçe dolduysa bütçeli duraklar kilitli görünür (dokununca mola ekranı)
  const blocked = Boolean(eye && (eye.locked || eye.due))
  const lockLeftMs = eye?.locked ? eye.leftMs : eye?.due ? 5 * MIN : null
  for (const s of stops) {
    s.locked = blocked && Boolean(s.budget) && !s.done
    s.lockLeftMs = s.locked ? lockLeftMs : null
  }
  // Sıradaki: yol sırasındaki ilk tamamlanmamış durak; o kilitliyse ilk tamamlanmamış molaya uygun durak (R8)
  let next = stops.find((s) => !s.done && !s.finale) ?? stops.find((s) => !s.done) ?? null
  if (next?.locked) next = stops.find((s) => !s.done && !s.budget) ?? next
  const doneCount = stops.filter((s) => s.done).length
  // VARSAYIM (yol planı §5.2): Bugünün görevi akşam raporu; açık kalsa da yol tamam sayılır
  const core = stops.filter((s) => !s.finale)
  const allDone = stops.length > 0 && core.every((s) => s.done) && (core.length > 0 || stops.every((s) => s.done))

  // Önceden görülen kilit: kullanılan bütçeden başlayıp Nefes'e kadar göz dakikaları toplanır; bütçeyi
  // aşacak ilk durağın önüne "Burada 5 dk mola var" işareti
  let forcedRestBefore = null
  if (!blocked && !allDone) {
    let used = (eye?.used ?? 0) / MIN
    for (const s of stops) {
      if (s.done) continue
      if (s.restSlot) {
        if (used >= PATH.restMinUsed) used = 0
        continue
      }
      if (s.budget && used >= budgetMin) {
        forcedRestBefore = s.key
        break
      }
      if (s.budget === 'eye') used += s.eyeMin
    }
  }
  const blocks = [1, 2].map((b) => {
    const list = stops.filter((s) => s.block === b && !s.finale)
    return { eyeMin: eyeSum(list), eyeDone: eyeSum(list.filter((s) => s.done)), capMin: cap }
  })
  return {
    stops,
    next,
    doneCount,
    total: stops.length,
    allDone,
    minutesLeft: minSum(stops.filter((s) => !s.done)),
    blocks,
    restIndex: stops.findIndex((s) => s.restSlot),
    forcedRestBefore,
  }
}

// Eski arayüz (items/next/doneCount/total/allDone); items = duraklar
export function todayPlan(modules = [], ctx = {}) {
  const p = buildPath(modules, ctx)
  return { ...p, items: p.stops }
}

// Jev baloncuğu (yol planı §5.3): tek kelime + tek satır. Kelimeler Çemberler'in motivasyon kelimeleri;
// "Tam isabet" yolda kullanılmaz (test puanı gibi okunmasın). Seçim yerel, koça bir şey gitmez.
export const JEV_WORDS = {
  praise: ['Harika', 'Çok iyi', 'Böyle devam', 'Süper', 'Güzel gidiyor', 'Aferin'],
  measure: ['Odaklan', 'Odak sende'],
  rest: ['Nefes al', 'Rahatla', 'Sakin ol'],
  game: ['Ritmi yakala'],
  last: ['Bir tane daha'],
  start: ['Hadi'],
}
const NB = ' '
const dot = `${NB}·${NB}`
const unitOf = (s) => (s.sub && s.openEnded ? s.sub : s.minutes ? `${s.minutes}${NB}dk` : '')
const pick = (pool, day, n) => {
  const a = JEV_WORDS[pool]
  return a[(((day + n) % a.length) + a.length) % a.length]
}

// plan: buildPath sonucu; day: gün numarası (lib/notice.js dayNumber); fmt: ms → "m:ss"; restLeftMs: yoldaki
// Nefes molası sürüyorsa kalan; gold: az önce bir durak bitti (övgü kelimesi)
export function jevLine(plan, { day = 0, fmt = (ms) => `${Math.ceil(ms / 60000)}${NB}dk`, eye = null, restLeftMs = null, gold = false } = {}) {
  const n = plan.doneCount
  const nx = plan.next
  let word
  let line
  if (plan.allDone || !nx) {
    word = pick('praise', day, n)
    line = 'Bugünkü yol tamam.'
  } else if (restLeftMs != null) {
    word = pick('rest', day, n)
    line = `Nefes${dot}${fmt(restLeftMs)}`
  } else if (eye?.locked) {
    word = pick('rest', day, n)
    line = `Mola${dot}${fmt(eye.leftMs)}`
  } else if (eye?.due && nx.budget) {
    word = pick('rest', day, n)
    line = `Önce 5${NB}dk mola, sonra ${nx.title}`
  } else if (n === 0) {
    word = JEV_WORDS.start[0]
    line = `İlk durak: ${nx.title}${unitOf(nx) ? dot + unitOf(nx) : ''}`
  } else if (nx.restSlot) {
    word = pick('rest', day, n)
    line = `Sırada ${nx.title}${dot}${nx.minutes ?? 5}${NB}dk mola`
  } else if (nx.kind === 'measure') {
    word = pick('measure', day, n)
    line = `Sırada ${nx.title}${unitOf(nx) ? dot + unitOf(nx) : ''}`
  } else if (nx.kind === 'practice' && nx.budget === 'eye' && !nx.exclusive) {
    word = JEV_WORDS.game[0]
    line = `Sırada ${nx.title}${unitOf(nx) ? dot + unitOf(nx) : ''}`
  } else if (plan.stops.filter((s) => !s.done).length === 1) {
    word = JEV_WORDS.last[0]
    line = `Son durak: ${nx.title}`
  } else {
    word = pick('praise', day, n)
    line = `Sırada ${nx.title}${unitOf(nx) ? dot + unitOf(nx) : ''}`
  }
  if (gold && !plan.allDone) word = pick('praise', day, n)
  return { word, line }
}
