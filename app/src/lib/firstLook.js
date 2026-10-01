// İlk Bakış (screens/FirstLook.jsx) hesapları: okuma metnini kelimelere böler, sarı işaretin hangi kelimede olduğunu
// bulur, kırpma zamanlarından en uzun kırpmasız arayı ve o arada okunan satırları çıkarır.
// Dil bağımsız: kelimeler Intl.Segmenter ile bölünür (boşluksuz yazılan diller de çalışsın); yoksa boşluktan bölünür.
// VARSAYIM: kişinin gözü sarı işareti izliyor; kırpmanın hangi kelimede olduğu bu kabulle tahmin edilir (±1 kelime).

// Kelime + ardından gelen boşluk/noktalama ("tail"). Birleştirince metnin kendisi çıkar.
export function tokenize(text, locale = 'tr') {
  const src = String(text ?? '')
  const out = []
  let lead = ''
  const push = (seg, wordLike) => {
    if (wordLike) out.push({ word: seg, tail: '' })
    else if (out.length) out[out.length - 1].tail += seg
    else lead += seg
  }
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    for (const s of new Intl.Segmenter(locale, { granularity: 'word' }).segment(src)) push(s.segment, s.isWordLike)
  } else {
    for (const [chunk] of src.matchAll(/\S+\s*/gu)) {
      const [, word, tail] = chunk.match(/^(.*?)(\p{P}*\s*)$/u)
      if (word) push(word, true)
      push(tail, false)
    }
  }
  if (lead && out.length) out[0].word = lead + out[0].word
  return out
}

const PAUSE = /\p{P}/u
export const isPause = (tok) => !!tok && PAUSE.test(tok.tail)

export const msPerWord = (wpm) => 60000 / wpm

// t (ms, okuma başından) anında sarı olan kelime
export function wordAt(t, ms, n) {
  if (n <= 0) return -1
  return Math.max(0, Math.min(n - 1, Math.floor(t / ms)))
}

// Süre boyunca kaç kelime okundu (son sarı kelime dahil)
export function wordsRead(totalMs, ms, n) {
  return Math.min(n, Math.floor(totalMs / ms) + 1)
}

// En uzun kırpmasız ara: [a, b] (ms). Başlangıç ve bitiş de sınır sayılır (hiç kırpmadıysa tüm süre).
export function longestGap(times, totalMs) {
  const pts = [0, ...times.filter((t) => t >= 0 && t <= totalMs).sort((x, y) => x - y), totalMs]
  let best = [0, totalMs]
  let len = -1
  for (let i = 1; i < pts.length; i += 1) {
    if (pts[i] - pts[i - 1] > len) {
      len = pts[i] - pts[i - 1]
      best = [pts[i - 1], pts[i]]
    }
  }
  return best
}

// [a, b] arasında okunan kelimeler: kırpmanın olduğu kelimeler hariç, arası. { from, to, text, cut }
export function gapQuote(tokens, [a, b], ms, { max = 28, readMs = b } = {}) {
  const n = tokens.length
  if (!n) return null
  const from = a <= 0 ? 0 : wordAt(a, ms, n) + 1
  const last = b >= readMs ? wordsRead(readMs, ms, n) - 1 : wordAt(b, ms, n) - 1
  if (last < from) return null
  const to = Math.min(last, from + max - 1)
  const text = tokens.slice(from, to + 1).map((t, i, arr) => t.word + (i === arr.length - 1 ? t.tail.replace(/\s+$/u, '') : t.tail)).join('')
  return { from, to, words: to - from + 1, text, cutStart: from > 0, cutEnd: to < n - 1 }
}

// Kırpmaların noktalama yakınında olma payı (Cornelis 2025: okurken kırpma noktalamalarda sıklaşır).
// Yakın = sarı kelime noktalamayla bitiyor ya da bir önceki kelime noktalamayla bitti.
// chance: okunan kelimelerde bu koşulun rastgele sağlanma payı; kişinin payı bunu geçmezse söylenmez.
export function pauseShare(times, tokens, ms, totalMs) {
  const n = tokens.length
  const near = (i) => isPause(tokens[i]) || (i > 0 && isPause(tokens[i - 1]))
  const read = wordsRead(totalMs, ms, n)
  let hits = 0
  for (let i = 0; i < read; i += 1) if (near(i)) hits += 1
  const chance = read ? hits / read : 0
  const k = times.filter((t) => near(wordAt(t, ms, n))).length
  return { near: k, total: times.length, chance, notable: k >= 2 && k / Math.max(1, times.length) > chance }
}
