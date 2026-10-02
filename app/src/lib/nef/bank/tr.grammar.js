// Nef cümle bankası · Türkçe dil kuralları (Nef PLAN §4.6, §4.7; N1-CUMLELER-taslak §0 yer tutucu tablosu).
// Saf: sayıyı, saati ve eki burada kod yazar; cümleler bank/tr.js'te, an motoru (moments.js) dil bilmez.
//
//   - Ek okunuşa göre gelir: "19.30" → "otuz" → "19.30'da", "19.30'a"; "22.00" → "iki" → "22.00'ye"; "4" → "dört" →
//     "4'ten", "4'tü". Ondalıkta son okunan sözcük: "1,5" → "beş" → "1,5'e"; yüzde: "%55" → "beş" → "%55'ten".
//   - Rakamlar ve ondalık işareti Intl ile (dil parametre olarak gelir; bu dosyada bölge sabiti yok).
//   - Saat Intl.DateTimeFormat parçalarından (saat ve dakika, iki hane) kurulur, araya nokta konur.
//     VARSAYIM: CLDR'nin Türkçe saat ayırıcısı ":" ("19:30"); onaylı cümleler, TDK yazımı ve mevcut kod (sky.js
//     clockWithSuffix, weatherNotify.js hourTable) "19.30" yazar. Ayırıcı bu yüzden dile özgü kural olarak burada.
//   - Mevcut tablolarla tutarlılık: weatherNotify.js hourTable yalnız tam saatleri, sky.js clockWithSuffix yalnız
//     bulunma ekini, alarm.js withSuffix "07:00" biçimini veriyor; Nef'e yarım saat ve ayrılma/yönelme gerekiyor. Kural
//     bu yüzden burada genel (okunuşun son sözcüğü), tablo kopyalanmadı; tr.grammar.test.js iki mevcut tabloyla
//     bire bir aynı sonucu verdiğini sınar.

const VOWELS = 'aeıioöuü'
const BACK = 'aıou'
const HARD = 'çfhkpsşt' // sert ünsüzler: bulunma/ayrılma eki "t" ile başlar

const ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']
const BIG = [[1e9, 'milyar'], [1e6, 'milyon'], [1e3, 'bin']]

const isVowel = (ch) => VOWELS.includes(ch)
const lastVowel = (w) => [...String(w)].reverse().find(isVowel) ?? 'e'
// İki yönlü uyum (a/e) ve dört yönlü uyum (ı/i/u/ü) son ünlüye göre
const h2 = (w) => (BACK.includes(lastVowel(w)) ? 'a' : 'e')
const h4 = (w) => ({ a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' })[lastVowel(w)]
const endsVowel = (w) => isVowel(String(w).at(-1))
const endsHard = (w) => HARD.includes(String(w).at(-1))

// ---------- Sayıyı sözle ----------
// 0–999: "sıfır", "üç", "on dört", "yüz", "iki yüz otuz"
function under1000(n) {
  const out = []
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  if (h) out.push(...(h > 1 ? [ONES[h], 'yüz'] : ['yüz']))
  if (t) out.push(TENS[t])
  if (o) out.push(ONES[o])
  return out
}

// Negatif olmayan tam sayı → sözcükler ("dört", "bin iki yüz"); tam sayı değilse null
export function numberWords(n) {
  if (!Number.isInteger(n) || n < 0) return null
  if (n === 0) return ONES[0]
  const out = []
  let r = n
  for (const [v, w] of BIG) {
    const k = Math.floor(r / v)
    if (!k) continue
    // "bin" tek başına söylenir ("bir bin" denmez); milyon ve milyarda "bir" söylenir
    out.push(...(k === 1 && v === 1e3 ? [w] : [...under1000(k), w]))
    r %= v
  }
  if (r) out.push(...under1000(r))
  return out.join(' ')
}

// Sıra sayısı: "birinci", "ikinci", "dördüncü", "onuncu"; "dört" → "dörd" (ünsüz yumuşaması yalnız bu sözcükte)
export function ordinalWords(n) {
  const w = numberWords(n)
  if (!w || n === 0) return null
  const parts = w.split(' ')
  let last = parts.pop()
  if (last === 'dört') last = 'dörd'
  const tail = endsVowel(last) ? `nc${h4(last)}` : `${h4(last)}nc${h4(last)}`
  return [...parts, last + tail].join(' ')
}

// Bir sayının okunuşunun son sözcüğü (ekin seçimi buna bakar). Ondalıkta virgülden sonraki kısım ayrı sayı gibi
// okunur: 1,5 → "beş", 3,25 → "yirmi beş". digits: ekranda yazılan kısım ("1,5"); verilmezse sayıdan.
export function lastSpokenWord(value, fractionDigits = null) {
  const v = Math.abs(Number(value))
  if (!Number.isFinite(v)) return null
  const fixed = fractionDigits == null ? String(v) : v.toFixed(fractionDigits)
  const [int, frac] = fixed.split('.')
  const f = frac?.replace(/0+$/, '')
  const n = f ? Number(f) : Number(int)
  return numberWords(n)?.split(' ').at(-1) ?? null
}

// ---------- Ekler ----------
// Sözcüğe göre ek (kesme işaretsiz). kind: LOC bulunma, ABL ayrılma, DAT yönelme, ACC belirtme, INS vasıta,
// GEÇMİŞ ek-fiilin geçmiş zamanı ("dörttü" → "4'tü", "altıydı" → "6'ydı").
export function suffixFor(word, kind) {
  const w = String(word)
  const d = endsHard(w) ? 't' : 'd'
  switch (kind) {
    case 'LOC': return `${d}${h2(w)}`
    case 'ABL': return `${d}${h2(w)}n`
    case 'DAT': return endsVowel(w) ? `y${h2(w)}` : h2(w)
    case 'ACC': return endsVowel(w) ? `y${h4(w)}` : h4(w)
    case 'INS': return endsVowel(w) ? `yl${h2(w)}` : `l${h2(w)}`
    case 'GEÇMİŞ': return endsVowel(w) ? `yd${h4(w)}` : `${d}${h4(w)}`
    default: return null
  }
}

// ---------- Biçim (Intl) ----------
const nf = (lang, opts) => new Intl.NumberFormat(lang, opts)

// Sayı: tam sayıysa tam, değilse en çok bir ondalık ("2", "1,5"). percent: 55 → "%55" (Intl yüzde biçimi)
export function formatNumber(value, lang, { percent = false, maxFraction = 1 } = {}) {
  const v = Number(value)
  if (!Number.isFinite(v)) return null
  if (percent) return nf(lang, { style: 'percent', maximumFractionDigits: maxFraction }).format(v / 100)
  return nf(lang, { maximumFractionDigits: maxFraction }).format(v)
}

// Sayı + ek: (4, 'ABL') → "4'ten"; (1.5, 'DAT') → "1,5'e"; (55, 'ABL', { percent }) → "%55'ten". kind yoksa yalın.
// Ek, ekranda görünen sayının okunuşundan (yuvarlanmış hâli) seçilir.
export function numberWith(value, kind, lang, opts = {}) {
  const txt = formatNumber(value, lang, opts)
  if (txt == null) return null
  if (!kind) return txt
  const maxFraction = opts.maxFraction ?? 1
  const rounded = Number(Number(value).toFixed(maxFraction))
  const word = lastSpokenWord(rounded, Number.isInteger(rounded) ? 0 : maxFraction)
  const suf = word ? suffixFor(word, kind) : null
  return suf ? `${txt}'${suf}` : null
}

// Gün içi dakika (0–1439) → "19.30" (Intl parçaları; ayırıcı Türkçe yazımla nokta, yukarıdaki VARSAYIM)
export function formatClock(min, lang) {
  if (!Number.isInteger(min) || min < 0 || min >= 1440) return null
  const parts = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(2000, 0, 1, Math.floor(min / 60), min % 60)))
  const hh = parts.find((p) => p.type === 'hour')?.value
  const mm = parts.find((p) => p.type === 'minute')?.value
  return hh && mm ? `${hh}.${mm}` : null
}

// Saat + ek: okunuş dakika varsa dakikanın, yoksa saatin son sözcüğü ("on dokuz otuz" → "otuz"; "yirmi iki" → "iki").
// (1170, 'LOC') → "19.30'da"; (1320, 'DAT') → "22.00'ye"; (1020, 'ABL') → "17.00'den". kind yoksa "19.30".
export function clockWith(min, kind, lang) {
  const txt = formatClock(min, lang)
  if (txt == null) return null
  if (!kind) return txt
  const h = Math.floor(min / 60)
  const m = min % 60
  const word = numberWords(m || h).split(' ').at(-1)
  return `${txt}'${suffixFor(word, kind)}`
}

// ---------- Sözcük ----------
// 2. tekil iyelik ("senin …"): "sakinlik" → "sakinliğin", "odak" → "odağın", "enerji" → "enerjin",
// "kendine güven" → "kendine güvenin", "beden gerginliği" → "beden gerginliğin". Yumuşama yalnız çok heceli sözcük
// sonundaki k (→ ğ; "nk" → "ng"); ihtiyaç duyulan ölçü sözcükleri bunlar (taslak §8). Başka yumuşama (p, ç, t) yok:
// VARSAYIM, bugünkü ölçü sözcüklerinde gerekmiyor.
export function possessive2(phrase) {
  const s = String(phrase ?? '').trim()
  if (!s) return null
  const words = s.split(' ')
  let w = words.pop()
  if (endsVowel(w)) return [...words, `${w}n`].join(' ')
  const syllables = [...w].filter(isVowel).length
  if (syllables > 1 && w.endsWith('k')) w = w.endsWith('nk') ? `${w.slice(0, -1)}g` : `${w.slice(0, -1)}ğ`
  return [...words, `${w}${h4(w)}n`].join(' ')
}

// ---------- Modül adı (manifest nef.name.tr; modules/nef.contract.test.js manifestteki biçimleri bununla sınar) ----------
// Adın biçimleri gövdeden: { '': yalın, ABL, ACC, LOC, DAT, INS, POSS, 'POSS-ABL' }.
//   compound: ad tamlaması, son sözcük 3. tekil iyelik ekli ("Dalga ses" → "Dalga sesi", "Gökyüzü mola" → "Gökyüzü
//     molası", "su kayd" → "su kaydı"). Hâl ekinden önce n gelir ("Dalga sesinden", "Yılan oyununa"), vasıta ekinde y
//     ("Yılan oyunuyla"). POSS 3. tekil iyeliğin yerine 2. tekili koyar ("Gökyüzü molan", "yoga dersin").
//   compound değilse ek doğrudan ada gelir ("alarmdan", "1 dakikalık molaya", "1 dakikalık molan").
//   POSS-ABL: 2. tekil iyelik + ayrılma ("Gökyüzü molandan").
// Gövdedeki ünsüz değişimi (pratik → pratiğ, kayıt → kayd) gövdeyle birlikte verilir; burada kural yok.
export function nounForms(stem, { compound = false } = {}) {
  const s = String(stem ?? '').trim()
  if (!s) return null
  const base = compound ? `${s}${endsVowel(s) ? 's' : ''}${h4(s)}` : s
  const kase = (kind) => {
    if (!compound) return `${base}${suffixFor(base, kind)}`
    if (kind === 'ACC') return `${base}n${h4(base)}`
    if (kind === 'INS') return `${base}yl${h2(base)}`
    return `${base}${{ ABL: `nd${h2(base)}n`, LOC: `nd${h2(base)}`, DAT: `n${h2(base)}` }[kind]}`
  }
  const poss = compound ? `${s}${endsVowel(s) ? '' : h4(s)}n` : possessive2(s)
  return { '': base, ABL: kase('ABL'), ACC: kase('ACC'), LOC: kase('LOC'), DAT: kase('DAT'), INS: kase('INS'), POSS: poss, 'POSS-ABL': `${poss}d${h2(poss)}n` }
}

// "de/da" bağlacı (ayrı yazılır; ünsüz benzeşmesi yok, yalnız iki yönlü ünlü uyumu): "akşam" → "da", "gece" → "de",
// "öğlen" → "de", "sabah" → "da" (Nef kartı düğmesi: "Bu akşam da …")
export const conjDe = (word) => `d${h2(word)}`

// Cümle başı büyük harf (dile göre: "i" → "İ")
export const upperFirst = (s, lang) => (s ? s[0].toLocaleUpperCase(lang) + s.slice(1) : s)

// Gün dilimi (an motorunun dil bilmeyen anahtarı) → Türkçe biçimler.
//   (yalın) "akşam" · SAYILI: sayıyla birlikte ("üç akşam"; öğlen yerine "gün", taslak §0) · ÇOĞUL: "akşamları"
// VARSAYIM: "öğlenleri" ve "öğlen boyu" biçimleri onaylı cümlelerde örneklenmedi (onaylı örnekler hep akşam).
export const DAY_PARTS = Object.freeze({
  morning: { '': 'sabah', SAYILI: 'sabah', ÇOĞUL: 'sabahları' },
  noon: { '': 'öğlen', SAYILI: 'gün', ÇOĞUL: 'öğlenleri' },
  evening: { '': 'akşam', SAYILI: 'akşam', ÇOĞUL: 'akşamları' },
  night: { '': 'gece', SAYILI: 'gece', ÇOĞUL: 'geceleri' },
})
