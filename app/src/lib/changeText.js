// Tek metin işlevi (gelisim-merkezi PLAN.v1 §3.5 madde 4; DENETIM Ö-8, Kü-4, Kü-6): değişimin yönü, işareti ve
// basamağı bütün yüzeylerde buradan. Gelişim çipi (growthCenter areas[k].value), ayrıntı, 5. gün raporu ve PDF/CSV aynı
// sayıyı aynı biçimde yazar.
//  - Sayı Türkçe ondalıkla, gerçek eksi işaretiyle (U+2212); sıfıra yuvarlanan değer işaretsiz ("−0,0" yok, Kü-4).
//  - Basamak birimden (DIGITS; Kü-6): aynı birim her yüzeyde aynı basamakla.
//  - Etki (önce → sonra) puanın KENDİ değişimiyle yazılır (sonra − önce): "düşük daha iyi" ölçüde de işaret puanın
//    yönüdür; iyi mi kötü mü ayrıca `good` alanında (Ö-8: "ortalama artış −2,3" karışıklığı yok).
//  - Değişim sözcükleri yalnız dört hüküm (DEVIR §1.8): "başlangıcından iyi", "değişim yok", "henüz belli değil",
//    "başlangıç". "Beyin", "tanıma" ve sağlık iddiası yok.
import { decimalTr } from './stats.js'

// Hüküm sözcükleri (DEVIR §1.8; maket v6 WORD). Ekran yalnız bunları yazar.
export const VERDICT_WORD = { better: 'başlangıcından iyi', same: 'değişim yok', unclear: 'henüz belli değil', start: 'başlangıç' }
export const VERDICTS = Object.keys(VERDICT_WORD)
export function verdictWord(v, { cap = false } = {}) {
  const w = VERDICT_WORD[v] ?? VERDICT_WORD.unclear
  return cap ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1) : w
}

// Birim → basamak (VARSAYIM: yüzeylerin bugünkü en sık kullanımı; logMAR 2, beş/on üzerinden puan 1, ms/%/adım 0)
export const DIGITS = { logMAR: 2, ms: 0, '%': 0, 'kelime/dk': 0, harf: 1, '/5': 1, '/10': 1, '/100': 0, kez: 0, puan: 1, adım: 0, kırpma: 0 }
// Tam sayıya düşen değerde ",0" yazılmayan birimler ("4 → 6 harf"; "5,2 harf")
const TRIM = new Set(['harf', 'puan', '/5', '/10'])
export const digitsOf = (unit, digits) => (Number.isInteger(digits) ? digits : DIGITS[unit] ?? 1)

const round = (v, d) => {
  const r = +(+v).toFixed(d)
  return r === 0 ? 0 : r
}

// Sayı metni: 0.2 → "0,20" (logMAR), 7080 → "7.080" (adım), −0,04 (1 basamak) → "0,0". trim false: TRIM biriminde de
// ",0" yazılır (iki sayılı ifadenin yanlarından biri ondalıklıysa; pairTrim)
export function numText(v, unit, digits, { trim = true } = {}) {
  if (!Number.isFinite(v)) return '–'
  const d = digitsOf(unit, digits)
  const r = round(v, d)
  if (unit === 'adım') return Math.round(r).toLocaleString('tr-TR')
  if (trim && TRIM.has(unit) && Number.isInteger(r)) return decimalTr(r, 0)
  return decimalTr(r, d)
}
// İki sayılı ifadede (önce → sonra) ",0" kırpması ifadenin tamamına göre (Kü-6: aynı satırda aynı basamak): iki yan da
// tam sayıya düşüyorsa ikisi de kırpılır ("4 → 6 harf"), değilse ikisi de basamakla yazılır ("6,0 → 5,4 harf")
const pairTrim = (a, b, d) => Number.isInteger(round(a, d)) && Number.isInteger(round(b, d))

// İşaretli sayı: işaret YUVARLANMIŞ değerden (Kü-4): −0,02 → "0,0"; 1,26 → "+1,3"
export function signedText(v, unit, digits) {
  if (!Number.isFinite(v)) return '–'
  const d = digitsOf(unit, digits)
  const r = round(v, d)
  const body = numText(Math.abs(r), unit, d)
  return r > 0 ? `+${body}` : r < 0 ? `−${body}` : body
}

// "/5" bitişik ("3,5/5"), öbür birimler boşlukla ("6 harf", "120 ms"); yüzde önde ("%75")
const unitSuffix = (unit) => (!unit || unit === '%' ? '' : unit.startsWith('/') ? unit : ` ${unit}`)

// Ölçümün başlangıcı → şimdisi. from yoksa yalnız şimdiki değer. Fark yazılan iki yuvarlanmış değerden (okuyan iki
// sayıyı çıkarınca tutsun; exportData lmChange ile aynı ilke). good: değişim iyi yönde mi (better 'down' ise azalma
// iyi); fark 0 ya da from yoksa null. prefix: ölçümün kısa adı ("E testi", "İyi oluş").
// showUnit false: birim yazılmaz, yalnız basamağı belirler ("E testi 0,20 → 0,20").
export function changeText({ from = null, to = null, unit = '', better = 'up', digits, prefix = '', showUnit = true } = {}) {
  const d = digitsOf(unit, digits)
  const has = (v) => Number.isFinite(v)
  const lead = prefix ? `${prefix} ` : ''
  const sfx = showUnit ? unitSuffix(unit) : ''
  const pct = showUnit && unit === '%' ? '%' : ''
  if (!has(to)) return { text: '', from: null, to: null, delta: null, deltaText: '', good: null }
  if (!has(from)) return { text: `${lead}${pct}${numText(to, unit, d)}${sfx}`, from: null, to, delta: null, deltaText: '', good: null }
  const delta = round(round(to, d) - round(from, d), d)
  const good = delta === 0 ? null : (delta > 0) === (better !== 'down')
  const trim = pairTrim(from, to, d)
  const text = `${lead}${pct}${numText(from, unit, d, { trim })} → ${pct}${numText(to, unit, d, { trim })}${sfx}`
  return { text, from, to, delta, deltaText: signedText(delta, unit, d), good }
}

// Önce → sonra etkisi (progress.js acuteEffects çıktısı). Belirgin etki (sig: ≥ 3 oturum ve güven aralığı sıfırı
// içermiyor) puanın ortalama değişimiyle, işaretli ("+1,3 sakinlik"). Belirgin olmayan etki (3 oturumdan az ya da aralık
// sıfırı içeriyor) işaretsiz, ortalama önce → sonra ("Sakinlik 2 → 4", "Dinlenmişlik 4,5 → 6,5"): işaretli fark,
// yanındaki "değişim yok" / "henüz belli değil" sözüyle çelişir gibi okunurdu. Değişim her zaman sonra − önce (puanın
// yönü); good iyi yön mü (yalnız belirgin etkide; yoksa null).
export function effectChangeText(e, { digits = 1 } = {}) {
  if (!e || !Number.isFinite(e.before) || !Number.isFinite(e.after)) return { text: '', delta: null, deltaText: '', good: null }
  const k = e.better === 'down' ? -1 : 1
  const raw = Number.isFinite(e.gain) ? k * e.gain : e.after - e.before
  const good = e.sig ? e.gain > 0 : null
  const measure = e.measure ?? ''
  if ((e.n ?? 0) < 3 || !e.sig) {
    const cap = measure ? measure.charAt(0).toLocaleUpperCase('tr-TR') + measure.slice(1) : ''
    const u = Number.isFinite(e.max) ? `/${e.max}` : ''
    const trim = pairTrim(e.before, e.after, digits)
    return { text: `${cap ? `${cap} ` : ''}${numText(e.before, u, digits, { trim })} → ${numText(e.after, u, digits, { trim })}`, delta: round(raw, digits), deltaText: signedText(raw, '', digits), good }
  }
  const deltaText = signedText(raw, '', digits)
  return { text: `${deltaText}${measure ? ` ${measure}` : ''}`, delta: round(raw, digits), deltaText, good }
}
