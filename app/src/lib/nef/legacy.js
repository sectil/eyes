// Mevcut Nef sesleri, an motorunun ilk üreticileri (Nef PLAN §4.1; ANA_OTURUM_ISTEMI N1 madde 2 son paragraf; taslak §7).
// Davranış değişmez: Ana sayfa, yol ve büyük düğme bugün de eski işlevleri çağırır (lib/homeSuggest.js homeSuggestion,
// lib/today.js jevLine, components/home/dayLead.js nefTopLine / nefEndLine / NEF). Bu dosya aynı girdiden aynı metni
// kimliğiyle verir: an motoru ve hafıza (memory.js) bu sesleri cümle kimliğiyle görebilir. Metinler yeniden yazılmadı;
// legacy.equiv.test.js tohumlu geniş bir girdi kümesinde eski çağrılarla 0 fark ister.
//
// Üretici çıktısı (moments.js an biçimi): { type: 'legacy', source, id, text, facts, key, cell: null, priority: 0,
// channels: [] } ya da null. channels boş: bu sesler kendi yerlerinde yazılır, seçici (speak.js) onları konuşmaz.
// VARSAYIM: Ana sayfa kartının an motoruna bağlanması (madde 6) bu kimlikleri kullanır; o güne dek çağıran yok.
//
// Kimlikler:
//   home.*  büyük düğmenin satırı (homeSuggestion primary.line): eye, walk, continue, start, done, free
//   jev.*   yol baloncuğu (jevLine line; kelime facts.word): done, rest, lock, eyeDue, first, restSlot, measure, game, last, next
//   nef.N   yolun onaylı cümleleri (dayLead.js NEF 1–16, onay dosyasındaki numara; nef.10s cümle 10'un alt satırı)
import { JEV_WORDS } from '../today.js'
import { NEF } from '../../components/home/dayLead.js'
import { SOFT_GAP } from '../ladders.js'
import { chapterOf } from '../pathAhead.js'

const NB = ' '
const dot = `${NB}·${NB}`

// Kimlik → metin. home ve jev metinleri eski işlevlerdeki kalıpların aynısı; nef doğrudan NEF'ten.
export const LEGACY_TEXT = Object.freeze({
  'home.eye': () => 'Gözlerin mola istiyor.',
  'home.walk': ({ title }) => `Önce kalk, 2 dakika yürü; sonra ${title}.`,
  'home.continue': ({ title }) => `Kaldığın yerden devam: ${title}.`,
  'home.start': ({ title }) => `Güne ${title} ile başla.`,
  'home.done': () => 'Bugünkü yol tamam.',
  'home.free': () => 'Bugün yol yok.',
  'jev.done': () => 'Bugünkü yol tamam.',
  'jev.rest': ({ left }) => `Nefes${dot}${left}`,
  'jev.lock': ({ left }) => `Mola${dot}${left}`,
  'jev.eyeDue': ({ title }) => `Önce 5${NB}dk mola, sonra ${title}`,
  'jev.first': ({ title, unit }) => `İlk durak: ${title}${unit ? dot + unit : ''}`,
  'jev.restSlot': ({ title, minutes }) => `Sırada ${title}${dot}${minutes}${NB}dk mola`,
  'jev.measure': ({ title, unit }) => `Sırada ${title}${unit ? dot + unit : ''}`,
  'jev.game': ({ title, unit }) => `Sırada ${title}${unit ? dot + unit : ''}`,
  'jev.last': ({ title }) => `Son durak: ${title}`,
  'jev.next': ({ title, unit }) => `Sırada ${title}${unit ? dot + unit : ''}`,
  'nef.1': () => NEF.yday,
  'nef.2': ({ n }) => NEF.ydayPart(n),
  'nef.3': () => NEF.back,
  'nef.4': ({ n, name }) => NEF.update(n, name),
  'nef.5': ({ next }) => NEF.done(next),
  'nef.6': ({ prize }) => NEF.chapterLast(prize),
  'nef.7': () => NEF.month,
  'nef.8': ({ n, d }) => NEF.tomorrow(n, d),
  'nef.9': ({ hhmm }) => NEF.alarm(hhmm),
  'nef.10': () => NEF.remind,
  'nef.10s': () => NEF.remindSub,
  'nef.11': ({ c, a, b }) => NEF.chapter(c, a, b),
  'nef.12': ({ names }) => NEF.news(names),
  'nef.13': ({ p }) => NEF.prize(p),
  'nef.14': () => NEF.month30,
  'nef.15': ({ c, prize }) => NEF.chapterDay(c, prize),
  'nef.16': ({ n }) => NEF.more(n),
})

const SOURCE = { home: 'homeSuggest', jev: 'jevLine', nef: 'dayLead' }

// Kimlik + olgular → an (metin kimliğin kalıbından)
export function legacyMoment(id, facts = {}) {
  const fn = LEGACY_TEXT[id]
  if (!fn) return null
  return { type: 'legacy', source: SOURCE[id.split('.')[0]], id, text: fn(facts), facts, key: `legacy:${id}`, cell: null, priority: 0, channels: [] }
}

// ---------- homeSuggestion: büyük düğmenin satırı ----------
export function homeMoment({ plan = null, eye = null, walk = false } = {}) {
  if (eye?.locked || eye?.due) return legacyMoment('home.eye')
  if (plan?.next && !plan.allDone) {
    const title = plan.next.title
    if (walk) return legacyMoment('home.walk', { title })
    return legacyMoment((plan.doneCount ?? 0) > 0 ? 'home.continue' : 'home.start', { title })
  }
  return legacyMoment(plan?.allDone ? 'home.done' : 'home.free')
}

// ---------- jevLine: yol baloncuğu ----------
const unitOf = (s) => (s.sub && (s.openEnded || s.warn) ? s.sub : s.minutes && !s.hideMinutes ? `${s.minutes}${NB}dk` : '')
const pick = (pool, day, n) => {
  const a = JEV_WORDS[pool]
  return a[(((day + n) % a.length) + a.length) % a.length]
}

export function jevMoment(plan, { day = 0, fmt = (ms) => `${Math.ceil(ms / 60000)}${NB}dk`, eye = null, restLeftMs = null, gold = false } = {}) {
  const n = plan.doneCount
  const nx = plan.next
  let id
  let word
  let facts = {}
  if (plan.allDone || !nx) [id, word] = ['jev.done', pick('praise', day, n)]
  else if (restLeftMs != null) [id, word, facts] = ['jev.rest', pick('rest', day, n), { left: fmt(restLeftMs) }]
  else if (eye?.locked) [id, word, facts] = ['jev.lock', pick('rest', day, n), { left: fmt(eye.leftMs) }]
  else if (eye?.due && nx.budget) [id, word, facts] = ['jev.eyeDue', pick('rest', day, n), { title: nx.title }]
  else if (n === 0) [id, word, facts] = ['jev.first', JEV_WORDS.start[0], { title: nx.title, unit: unitOf(nx) }]
  else if (nx.restSlot) [id, word, facts] = ['jev.restSlot', pick('rest', day, n), { title: nx.title, minutes: nx.minutes ?? 5 }]
  else if (nx.kind === 'measure') [id, word, facts] = ['jev.measure', pick('measure', day, n), { title: nx.title, unit: unitOf(nx) }]
  else if (nx.game) [id, word, facts] = ['jev.game', JEV_WORDS.game[0], { title: nx.title, unit: unitOf(nx) }]
  else if (plan.stops.filter((s) => !s.done).length === 1) [id, word, facts] = ['jev.last', JEV_WORDS.last[0], { title: nx.title }]
  else [id, word, facts] = ['jev.next', pick('praise', day, n), { title: nx.title, unit: unitOf(nx) }]
  if (gold && !plan.allDone) word = pick('praise', day, n)
  return legacyMoment(id, { ...facts, word })
}

// ---------- nefTopLine: yolun başı (1–4, 15) ----------
export function nefTopMoment({ allDone = false, update = null, gap = null, yday = null, skip = null, n = 0, chapterEnd = false, chapter = 0, prize = null, mileShown = false } = {}) {
  if (allDone || n === 30 || mileShown) return null
  const out = []
  if (update?.n > 0 && update.name) out.push(legacyMoment('nef.4', { n: update.n, name: update.name }))
  if (chapterEnd && chapter > 0) out.push(legacyMoment('nef.15', { c: chapter, prize }))
  if (gap != null && gap >= 3 && gap < SOFT_GAP) out.push(legacyMoment('nef.3'))
  if (yday?.allDone && yday.total > 0) out.push(legacyMoment('nef.1'))
  else if (yday?.done > 0) out.push(legacyMoment('nef.2', { n: yday.done }))
  return out.find((m) => m.text !== skip) ?? null
}

// ---------- nefEndLine: bugünün sonu (5–7) ----------
export function nefEndMoment({ n = 1, allDone = false, chapterEnd = false, prize = null, top = null, mileShown = false } = {}) {
  if (allDone) return n === 30 ? legacyMoment('nef.7') : legacyMoment('nef.5', { next: n + 1 })
  if (mileShown) return null
  if (chapterEnd && prize && !(top && top === LEGACY_TEXT['nef.15']({ c: chapterOf(n), prize }))) return legacyMoment('nef.6', { prize })
  return null
}
