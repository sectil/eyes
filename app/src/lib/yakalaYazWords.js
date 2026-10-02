// Yakala Yaz kelime seçimi (kelime-hafiza/KELIMELER.md kuralları; PLAN §3). Saf, tohumlu.
//  1. Turda aynı kelime iki kez gelmez.
//  2. Son 7 takvim gününde gelen kelime gelmez; havuz yetmezse en uzun süredir gelmeyen seçilir. Aynı gün tekrar yok.
//  3. Aynı çift (sırası farklı olsa da) hiç tekrar etmez.
//  4. Çiftin iki kelimesi farklı gruptan, toplam en çok 12 harf.
//  5. Turda bir grubun payı en çok %30 (turun 20 denemesinde; yedek çiftlerde de aynı oran).
//  6. Seçim tohumlu.
//  7. İki hayvan yan yana gelmez; renk, hayvanla ya da başka bir renkle yan yana gelmez.
// Geçmiş kayıtlardaki trials[].w'den okunur; ayrı depolama anahtarı yok.
import { GROUPS } from './yakalaYazList.js'
import { seedHash } from './progression.js'
import { dayKey } from './calendar.js'

export const ROUND_TRIALS = 20
export const SPARE_PAIRS = 10 // gösterimi sapan deneme yeni çiftle tekrarlanır
export const MAX_SHARE = 0.3
export const MAX_LETTERS = 12
export const NO_REPEAT_DAYS = 7
export const SESSION_TYPE = 'yakala-yaz'

const GROUP_OF = new Map(Object.entries(GROUPS).flatMap(([g, list]) => list.map((w) => [w, g])))
export const groupOf = (w) => GROUP_OF.get(w) ?? null

// Türkçe küçük harf, Türkçe harf ve şapka atılmış biçim ("Çınar" → "cinar", "rüzgâr" → "ruzgar")
export const WORDS = Object.freeze(Object.entries(GROUPS).flatMap(([g, list]) => list.map((w) => w)))
const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }
export const lowerTr = (s) => String(s ?? '').toLocaleLowerCase('tr-TR')
const foldRaw = (s) => lowerTr(s).normalize('NFC').replace(/[çğıöşüâîû]/g, (c) => FOLD[c])
const FOLDED = new Map(WORDS.map((w) => [w, foldRaw(w)])) // listedeki kelimeler önceden (benzetim hızı)
export const fold = (s) => FOLDED.get(s) ?? foldRaw(s)
export const pairKey = (a, b) => [fold(a), fold(b)].sort().join('+')

// Çift yasakları (kural 4 ve 7)
export function pairAllowed(a, b) {
  const ga = groupOf(a), gb = groupOf(b)
  if (!ga || !gb || ga === gb) return false
  if (a.length + b.length > MAX_LETTERS) return false
  if ((ga === 'renk' && gb === 'hayvan') || (ga === 'hayvan' && gb === 'renk')) return false
  return true
}

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
const shuffle = (list, rand) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Kayıtlardan geçmiş: { last: Map(kelime → son gün anahtarı), pairs: Set(çift anahtarı) }
export function historyOf(sessions = []) {
  const last = new Map()
  const pairs = new Set()
  for (const s of sessions) {
    if (s?.type !== SESSION_TYPE || !Array.isArray(s.trials)) continue
    const day = dayKey(new Date(s.date))
    for (const t of s.trials) {
      if (!Array.isArray(t?.w) || t.w.length !== 2) continue
      for (const w of t.w) if (!last.has(w) || last.get(w) < day) last.set(w, day)
      pairs.add(pairKey(t.w[0], t.w[1]))
    }
  }
  return { last, pairs }
}

const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000)

// Bir turun çiftleri: ROUND_TRIALS + SPARE_PAIRS çift, sırayla kullanılır. → [[k1, k2], …]
export function pickPairs({ seed = 'yy', sessions = [], now = new Date(), count = ROUND_TRIALS + SPARE_PAIRS } = {}) {
  const today = dayKey(now)
  const { last, pairs } = historyOf(sessions)
  const rand = rng(seedHash(`${seed}:${today}:${sessions.length}`))
  // Bugün gelen kelime hiç gelmez. Önce son 7 günde gelmeyenler (karışık), sonra en uzun süredir gelmeyenler.
  const fresh = [], stale = []
  for (const w of shuffle(WORDS, rand)) {
    const d = last.get(w)
    if (d === today) continue
    if (d == null || daysBetween(d, today) >= NO_REPEAT_DAYS) fresh.push(w)
    else stale.push(w)
  }
  stale.sort((a, b) => (last.get(a) < last.get(b) ? -1 : last.get(a) > last.get(b) ? 1 : 0))
  const pool = [...fresh, ...stale]
  const used = new Set()
  const groups = {}
  const out = []
  const capAt = (k) => Math.floor(MAX_SHARE * 2 * Math.max(ROUND_TRIALS, k + 1))
  const fits = (w, k) => !used.has(w) && (groups[groupOf(w)] ?? 0) < capAt(k)
  while (out.length < count) {
    const k = out.length
    let made = null
    for (const a of pool) {
      if (!fits(a, k)) continue
      groups[groupOf(a)] = (groups[groupOf(a)] ?? 0) + 1
      const b = pool.find((x) => x !== a && fits(x, k) && pairAllowed(a, x) && !pairs.has(pairKey(a, x)))
      groups[groupOf(a)] -= 1
      if (b) { made = [a, b]; break }
    }
    if (!made) break // havuz bitti (pratikte olmaz; testle)
    for (const w of made) {
      used.add(w)
      groups[groupOf(w)] = (groups[groupOf(w)] ?? 0) + 1
    }
    pairs.add(pairKey(made[0], made[1]))
    out.push(rand() < 0.5 ? made : [made[1], made[0]])
  }
  return out
}
