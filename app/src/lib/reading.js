// Okuma testi (protocol 2). Kişi kaymayan, 3 satırlık kısa bir yazıyı sesli okur; her adımda
// farklı bir yazı gelir ve yazı 0,1 logMAR küçülür (MNREAD mantığı; MNREAD cümleleri telifli
// olduğu için yazılar bu uygulama için yazıldı). Ana sonuç "rahat okuduğun en küçük yazı"
// (kritik yazı boyu). KLİNİK OLARAK DOĞRULANMAMIŞTIR. Sonuçlar yalnızca aynı cihazda, kişinin
// kendi önceki sonuçlarıyla karşılaştırılmalıdır (tablet ≠ basılı: Altınbay 2022).
// Kaynaklar ve tasarım kararları: Okuma taslağı (onaylandı) ve araştırma notu "research:okuma".
import { MIN_LOGMAR } from './optotype.js'
import { sameCondition } from './trend.js'

// Standart kelime = 6 karakter (boşluk dahil) — MNREAD kuralı.
export const CHARS_PER_STANDARD_WORD = 6
// MNREAD maddesi: boşluk dahil 60 karakter, 3 satır (Radner 2017, Mansfield 2019).
export const TEXT_CHARS = 60
export const TEXT_LINES = 3
// VARSAYIM: yeni kayıt alanının adı protocol:2. Eski "Okuma hızı" kayıtlarında alan yok.
export const PROTOCOL = 2

// Boy merdiveni: 0,5 → −0,3 logMAR, 0,1 adım (MNREAD). Sığmayan boy atlanır, yazı kırılmaz.
// VARSAYIM: üst boy 0,5 (kodun yaklaşık değerleriyle, 21 karakterlik satır 45 cm'de 3 satıra sığsın diye).
export const LADDER_TOP = 0.5
export const LADDER_BOTTOM = MIN_LOGMAR
export const LADDER_STEP = 0.1
// VARSAYIM: okuma aralığı 35–45 cm (hedef 40 cm). Okumanın yarısından çoğu dışındaysa tekrar önerilir.
export const READ_MIN_MM = 350
export const READ_MAX_MM = 450
export const OUT_FRACTION = 0.5
// Radner durma kuralı: yazı başına 20 sn (~40 kelime/dk). Adımın ORTASINDA uygulanmaz.
export const STOP_SECONDS = 20
// VARSAYIM: kendiliğinden bitiş için 0,8 sn sessizlik; ipucu için 3 sn sessizlik.
export const END_SILENCE_S = 0.8
export const HINT_SILENCE_S = 3
// VARSAYIM: hız üst sınırı 350 kelime/dk → 60 karakterde en az 1,7 sn. Bundan hızlı bir adım boyu
// okundu sayar ama hıza katılmaz.
export const MAX_WPM = 350
export const MIN_SECONDS = 1.7
// VARSAYIM: "okundu" = en fazla 1 kelime eksik ya da yanlış (7–9 kelimede kapsam ≥ 0,85 ile aynı).
export const MAX_MISSES = 1
// VARSAYIM: 6 ve daha uzun harfli kelimede 1 harf farkı eşleşme sayılır (Türkçe ek hataları için).
export const FUZZY_MIN_LEN = 6

// ---------------------------------------------------------------------------------------------
// Yazı havuzu. Kurgusal, gündelik sahneler; kişi adı, marka, sağlık konusu yok. Her biri tam
// 60 karakter, 3 satır (satır 17–21 karakter), 7–9 kelime, 21–24 hece; noktalama ve rakam yok,
// yalnız ilk harf büyük. Satırlar veride hazır gelir; tarayıcı kırmaz. Kısıtlar reading.test.js'te
// bütün havuz için denetlenir. VARSAYIM: MNREAD'in 60 karakter kuralı Türkçeye olduğu gibi
// aktarılabilir; satır/hece kısıtları pilotsuz seçildi. Türkçe pilot yapılana kadar yazılar eşit
// sayılmaz (calibrated:false). İlk 10 yazı onaylı taslaktaki örneklerdir.
const RAW_TEXTS = [
  ['Küçük kayık hafif', 'rüzgarla sallanırken', 'dalgalar kıyıya vurdu'],
  ['Kış sabahı pencerenin', 'camı ince bir buz', 'tabakasıyla kaplandı'],
  ['Dağ yolunda yürüdükçe', 'derenin serin sesi', 'hep yanımızda kaldı'],
  ['Kasabanın eski saat', 'kulesi öğlen vakti', 'yüksek sesle çalmıştı'],
  ['Kırmızı bisikletli', 'çocuk yokuşu inerken', 'zilini neşeyle çaldı'],
  ['Patikadan yürürken', 'bir sincap önümüzden', 'koşup ağaca tırmandı'],
  ['Tarladaki ayçiçekleri', 'sabah güneşine doğru', 'başlarını çevirdi'],
  ['Vapurun arkasından', 'gelen martılar atılan', 'simidi havada kaptı'],
  ['Çatıdaki güvercinler', 'yağmur başlayınca', 'saçağın altına uçuştu'],
  ['Terzinin vitrininde', 'renkli düğmeler ufak', 'kutularda duruyordu'],
  ['Elden kaçan kırmızı', 'balon rüzgarla birden', 'damlara doğru uçtu'],
  ['Göl kıyısındaki bütün', 'ördekler kırıntılara', 'doğru hızla yüzdü'],
  ['Kasabanın meydanında', 'her akşamüstü küçük', 'bir pazar kurulurdu'],
  ['Kayıkçı küreklerini', 'yavaşça çekerken göl', 'pırıl pırıl parladı'],
  ['Fırından yeni çıkan', 'sıcak ekmeğin kokusu', 'tüm sokağı doldurdu'],
  ['Balıkçı teknesi tan', 'ağarırken usul usul', 'limandan açığa çıktı'],
  ['Bahçedeki yaşlı ceviz', 'ağacının gölgesinde', 'birlikte çay içtik'],
  ['Semt pazarında bütün', 'satıcılar meyveleri', 'tezgahlara dizmişti'],
  ['Kedi pencerenin önüne', 'kıvrılıp yağan karı', 'uzun uzun seyretti'],
  ['Sonbahar rüzgarı sarı', 'yaprakları toplayıp', 'yola doğru savurdu'],
  ['Küçük köpek sahilde', 'koşarken dalgalara', 'doğru neşeyle havladı'],
  ['Durakta oturan kadın', 'otobüs gelene kadar', 'bulmacasını bitirdi'],
  ['Akşam olunca parkın', 'lambaları birer birer', 'yanmaya başlamıştı'],
  ['Çocuklar teneffüste', 'ip atlayıp tekerleme', 'söyleyip eğlendiler'],
  ['Koyun sürüsü yayla', 'yolunda yavaş yavaş', 'yeşil tepeye tırmandı'],
  ['Eski kitapçının tozlu', 'raflarında sararmış', 'kitaplar duruyordu'],
  ['Yağmur durunca hemen', 'gökyüzünde renkli bir', 'gökkuşağı belirdi'],
  ['Tren tünelden çıkınca', 'aşağıdaki geniş ekin', 'tarlaları göründü'],
  ['Bakkalın kapısındaki', 'tahta kasalarda iri', 'armutlar dizilmişti'],
  ['Kar yağınca çocuklar', 'mahalledeki yokuşta', 'kızaklarla kaydılar'],
  ['Kumsalda oynayan kız', 'kumdan kocaman kale', 'yapıp bayrağı dikti'],
  ['Eski taş köprünün', 'altından geçen ırmak', 'taşlara vurup köpürdü'],
  ['Arılar sabahtan beri', 'çiçekten çiçeğe uçup', 'özenle bal topladı'],
  ['Fırtına dinince tüm', 'balıkçılar ağlarını', 'kıyıya serip kuruttu'],
  ['Tavan arasındaki eski', 'sandıkta çocukluk', 'oyuncakları saklıydı'],
  ['Marangoz bir tahtayı', 'rendeledikçe yere', 'ince talaşlar döküldü'],
  ['Çiftlikteki horoz', 'güneş doğmadan yüksek', 'sesle ötmeye başladı'],
  ['Limandaki gemiler', 'hava kararırken bütün', 'fenerlerini yaktılar'],
  ['Bostandaki domatesler', 'sıcak yaz güneşinde', 'birden kızarıverdi'],
  ['Açık pencereden esen', 'serin rüzgar masadaki', 'kağıtları dağıttı'],
  ['Bulutlar dağıldıkça', 'karlı dağın zirvesi', 'ışıl ışıl parlıyordu'],
  ['Oduncu kestiği bütün', 'odunları kış için', 'kulübenin önüne dizdi'],
  ['Postacı bisikletiyle', 'sokak sokak gezip', 'mektupları dağıtmıştı'],
  ['Çaydanlıktan yükselen', 'sıcak buhar mutfak', 'camını buğulandırdı'],
  ['Avludaki saksılarda', 'açmış küçük çiçekler', 'güneşe doğru uzandı'],
  ['Sıcak bir yaz gecesi', 'küçük ateş böcekleri', 'ışıldayarak uçuştu'],
  ['Deniz feneri bütün', 'gece boyunca kayalık', 'kıyıyı aydınlatmıştı'],
  ['Kuyudan yeni çekilen', 'soğuk su bakır tasın', 'içinde ışıldıyordu'],
  ['Tepedeki değirmen', 'kanatlarını rüzgarla', 'ağır ağır çeviriyordu'],
  ['Yolun iki yanındaki', 'kiraz ağaçları beyaz', 'çiçeklerle dolmuştu'],
  ['Bulaşıklar yıkanıp', 'kuruyunca mutfaktaki', 'tezgah tertemiz oldu'],
  ['Çobanın sadık köpeği', 'dağılmış kuzuları', 'ağılın önünde topladı'],
  ['İskelenin en ucunda', 'suya uzanmış oltalar', 'sessizce bekliyordu'],
  ['Nehrin üzerindeki sis', 'gün ışığı arttıkça', 'yavaş yavaş dağıldı'],
  ['Terasta kurusun diye', 'kırmızı acı biberler', 'ipe dizilip asıldı'],
  ['Köy çeşmesinden akan', 'serin su taş yalakta', 'birikip parlıyordu'],
  ['Ressam tuvale bakıp', 'denizin mavi rengini', 'fırçayla karıştırdı'],
  ['Sınıfın penceresinden', 'bakınca karla kaplı', 'dağlar görünüyordu'],
  ['Bahçedeki yapraklar', 'tırmıkla toplanarak', 'çitin dibine yığıldı'],
  ['Yük gemisi boğazdan', 'süzülürken arkasında', 'beyaz köpük bıraktı'],
  ['Bir tavşan çalıların', 'arasından fırlayıp', 'tarlanın içine kaçtı'],
  ['Kardan adamın burnuna', 'havuç yerleştirip', 'boynuna atkı doladık'],
  ['Kamp ateşinin önünde', 'oturanlar gece boyu', 'yıldızları seyretti'],
  ['Taş duvarın üstünde', 'güneşlenen kertenkele', 'sesimizle kayboldu'],
  ['Dükkan kapısındaki', 'küçük çan her müşteri', 'girdiğinde çınlardı'],
  ['İpe asılmış çarşaflar', 'öğleden sonra esen', 'rüzgarla dalgalandı'],
  ['Yuvadaki minik kuşlar', 'annelerini görünce', 'sevinçle cıvıldaştı'],
  ['Karıncalar sıra sıra', 'bahçeden mutfaktaki', 'şeker kabına uzandı'],
  ['İri yağmur damlaları', 'çatıdaki tenekelere', 'ritimle vurup durdu'],
  ['Denizdeki çocuklar', 'sarı bir topla akşama', 'kadar oynayıp durdu'],
  ['Seyyar satıcı közde', 'pişen sıcak mısırları', 'kağıda sarıp verdi'],
]
export const TEXTS = RAW_TEXTS.map((lines, i) => ({ id: `r${String(i + 1).padStart(2, '0')}`, lines, calibrated: false }))
const BY_ID = new Map(TEXTS.map((t) => [t.id, t]))
export const textById = (id) => BY_ID.get(id) ?? null
export const textString = (t) => t.lines.join(' ')

// Havuzu karıştırır; son testlerde kullanılanlar sona kalır (yeterince taze yazı varsa hiç gelmez).
// VARSAYIM: son 2 testin yazıları dışarıda kalır (çağıran seçer).
export function orderTexts(excludeIds = [], rng = Math.random) {
  const ex = new Set(excludeIds)
  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return [...shuffle(TEXTS.filter((t) => !ex.has(t.id))), ...shuffle(TEXTS.filter((t) => ex.has(t.id)))]
}

// Önceki kayıtlardan hariç tutulacak yazı kimlikleri (eski kayıtlarda sentencesUsed dizeleri vardır).
const BY_STRING = new Map(TEXTS.map((t) => [textString(t), t.id]))
export function usedTextIds(records = []) {
  const ids = []
  for (const r of records) {
    for (const id of r?.textsUsed ?? []) ids.push(id)
    for (const s of r?.sentencesUsed ?? []) if (BY_STRING.has(s)) ids.push(BY_STRING.get(s))
  }
  return [...new Set(ids)]
}

// ---------------------------------------------------------------------------------------------
// Yazı boyutu: MNREAD tanımında baskı boyutu x-yüksekliği ile tanımlanır.
// x-yüksekliği θ yay dakikası ise logMAR = log10(θ / 5).
// xHeightRatio: yazı tipinin x-yüksekliği / font-size (çalışma anında ölçülür).
export function fontSizeCssPx(logMAR, distanceMm, pxPerMm, xHeightRatio) {
  const arcmin = 5 * 10 ** logMAR
  const xHeightMm = 2 * distanceMm * Math.tan((arcmin * Math.PI) / (180 * 60) / 2)
  return (xHeightMm * pxPerMm) / xHeightRatio
}

// Tarayıcıda yazı tipinin x-yüksekliği oranını ölçer
export function measureXHeightRatio(fontFamily) {
  try {
    const c = document.createElement('canvas').getContext('2d')
    c.font = `100px ${fontFamily}`
    const m = c.measureText('x')
    const r = m.actualBoundingBoxAscent / 100
    return r > 0.3 && r < 0.8 ? r : 0.52
  } catch {
    return 0.52
  }
}

// Havuzdaki en geniş satırın genişliği / font-size (canvas measureText). Ölçülemezse yaklaşık değer.
const CHAR_W = 0.55 // ortalama karakter genişliği / font-size (yaklaşık)
export const longestLine = () => Math.max(...TEXTS.flatMap((t) => t.lines.map((l) => l.length)))
export function measureWidestLine(fontFamily) {
  try {
    const c = document.createElement('canvas').getContext('2d')
    c.font = `100px ${fontFamily}`
    const w = Math.max(...TEXTS.flatMap((t) => t.lines.map((l) => c.measureText(l).width))) / 100
    return w > 0.2 * longestLine() && w < 1.2 * longestLine() ? w : CHAR_W * longestLine()
  } catch {
    return CHAR_W * longestLine()
  }
}

const round1 = (v) => +v.toFixed(1)

// Boy merdiveni: üstten alta 0,1 adım. Bir boy ancak en geniş satır, izin verilen en uzak mesafede
// (45 cm; yazı adım başında o anki mesafeyle kilitlenir) ekran genişliğine sığıyorsa ve x-yüksekliği
// en az 3 cihaz pikseliyse girer (eski kural). widestPerPx: measureWidestLine() sonucu.
export function readingLadder({ pxPerMm, xRatio, dpr = 1, widthPx, widestPerPx = CHAR_W * longestLine(), farMm = READ_MAX_MM, top = LADDER_TOP, bottom = LADDER_BOTTOM }) {
  const sizes = []
  for (let l = top; l >= bottom - 1e-9; l = round1(l - LADDER_STEP)) {
    const fsFar = fontSizeCssPx(l, farMm, pxPerMm, xRatio)
    const fits = widestPerPx * fsFar <= widthPx
    const fsNear = fontSizeCssPx(l, READ_MIN_MM, pxPerMm, xRatio)
    const drawable = fsNear * xRatio * dpr >= 3
    if (fits && drawable) sizes.push(round1(l) === 0 ? 0 : round1(l))
  }
  return sizes
}

// ---------------------------------------------------------------------------------------------
// Konuşma tanıma: Türkçe normalleştirme ve SIRALI hizalama.
export function normalizeTr(text) {
  return (text || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşüâîû\s]/g, ' ')
    .replace(/[âîû]/g, (c) => ({ â: 'a', î: 'i', û: 'u' })[c])
    .split(/\s+/)
    .filter(Boolean)
}

// a ile b arasında en çok 1 düzenleme (ekleme/silme/değiştirme) var mı?
export function withinOneEdit(a, b) {
  if (a === b) return true
  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (la > lb) i++
    else if (lb > la) j++
    else {
      i++
      j++
    }
  }
  return edits + (la - i) + (lb - j) <= 1
}

// Hedef kelime ile duyulan kelime eşleşir mi? Aynı ya da (≥ 6 harfte) 1 harf farklı.
export const wordsMatch = (target, heard) => target === heard || (target.length >= FUZZY_MIN_LEN && heard.length >= FUZZY_MIN_LEN - 1 && withinOneEdit(target, heard))

// Hedef kelimeler (sırasıyla) ile duyulan kelimeler arasında en çok eşleşmeyi veren sıralı hizalama
// (LCS benzeri dinamik programlama). Duyulan fazlalık kelimeler (tekrar, "ııı") hata sayılmaz.
// Tanıma bir kelimeyi ikiye bölerse ("ay çiçekleri") ya da iki kelimeyi birleştirirse de eşleşir.
// Döner: { hit: bool[] (hedef başına), heardIdx: number[] (eşleşen duyulan kelimenin sırası ya da -1),
//          matched, misses, lastAligned (son eşleşen hedef kelimenin sırası, yoksa -1) }
export function alignWords(target, heard) {
  const T = target.length
  const H = heard.length
  // f[i][j]: target[i..] ve heard[j..] için en çok eşleşme
  const f = Array.from({ length: T + 1 }, () => new Array(H + 1).fill(0))
  const one = (i, j) => (j < H && wordsMatch(target[i], heard[j]) ? 1 + f[i + 1][j + 1] : -1)
  const split = (i, j) => (j + 1 < H && wordsMatch(target[i], heard[j] + heard[j + 1]) ? 1 + f[i + 1][j + 2] : -1)
  const join = (i, j) => (i + 1 < T && j < H && wordsMatch(target[i] + target[i + 1], heard[j]) ? 2 + f[i + 2][j + 1] : -1)
  for (let i = T - 1; i >= 0; i--) {
    for (let j = H; j >= 0; j--) {
      f[i][j] = Math.max(f[i + 1][j], j < H ? f[i][j + 1] : 0, one(i, j), split(i, j), join(i, j))
    }
  }
  const hit = new Array(T).fill(false)
  const heardIdx = new Array(T).fill(-1)
  let i = 0
  let j = 0
  while (i < T && j <= H) {
    const best = f[i][j]
    if (best === 0) break
    if (one(i, j) === best) {
      hit[i] = true
      heardIdx[i] = j
      i++
      j++
    } else if (split(i, j) === best) {
      hit[i] = true
      heardIdx[i] = j + 1
      i++
      j += 2
    } else if (join(i, j) === best) {
      hit[i] = hit[i + 1] = true
      heardIdx[i] = heardIdx[i + 1] = j
      i += 2
      j++
    } else if (j < H && f[i][j + 1] === best) j++
    else i++
  }
  const matched = hit.filter(Boolean).length
  return { hit, heardIdx, matched, misses: T - matched, lastAligned: hit.lastIndexOf(true) }
}

// Kendiliğinden bitiş (ORTADA GEÇMEZ). Dördü birden gerekir:
//  c1 son ya da sondan bir önceki kelime sırasıyla duyuldu, c2 en fazla 1 kelime eksik,
//  c3 0,8 sn yeni kelime gelmedi (ya da tanıma sonucu kesin), c4 süre en az 1,7 sn.
export function autoFinish({ words, matched, lastAligned, silenceS, isFinal = false, endSec }) {
  const c1 = words > 0 && lastAligned >= words - 2
  const c2 = matched > 0 && words - matched <= MAX_MISSES
  const c3 = isFinal || silenceS >= END_SILENCE_S
  const c4 = endSec >= MIN_SECONDS
  return { ok: c1 && c2 && c3 && c4, c1, c2, c3, c4 }
}

// "Okudum"a basınca (ses açıkken): ≤ 1 eksik → okundu; yarıya kadar eksik → takıldı;
// yarıdan çoğu duyulmadı → O7 sorusu ('low').
export function tapOutcome(words, matched) {
  const misses = words - matched
  if (misses <= MAX_MISSES) return 'read'
  if (misses <= words / 2) return 'struggled'
  return 'low'
}

// Adım hızı. VARSAYIM: MNREAD formülü gerçek kelimeye ölçeklenir: hız = 600 / süre × (eşleşen / kelime).
// matched null (dokunarak) → oran 1. 350 kelime/dk üstü hıza katılmaz (fast).
export function itemWpm(seconds, words, matched) {
  if (!(seconds > 0)) return { wpm: null, fast: false }
  const cov = matched == null || !words ? 1 : matched / words
  const wpm = ((TEXT_CHARS / CHARS_PER_STANDARD_WORD) * 60 * cov) / seconds
  if (wpm > MAX_WPM) return { wpm: null, fast: true }
  return { wpm: Math.round(wpm * 10) / 10, fast: false }
}

// Ses segmentlerinden son eşleşen kelimenin bitişi (sn, dinleme başından). Segment sayısı duyulan
// kelime sayısıyla uyuşmuyorsa ya da zaman 0 geldiyse null döner; çağıran duvar saatine düşer.
// VARSAYIM: Apple Speech kısmi sonuçlarda kelime zamanını 0 verebilir.
export function segmentEndSec(segments, heardCount, heardIdx) {
  if (!Array.isArray(segments) || heardIdx < 0 || segments.length !== heardCount) return null
  const s = segments[heardIdx]
  const end = (s?.t ?? 0) + (s?.d ?? 0)
  return end > 0 ? end : null
}

// ---------------------------------------------------------------------------------------------
// Analiz. items: [{ logMAR, status:'read'|'struggled'|'failed', seconds, wpm, errors, superseded?, practice? }]
// Rahat boy (kritik yazı boyu): en büyükten başlayarak koşan ortalamanın %80'inin altına düşülen
// ilk boydan bir önceki (Baskaran 2019 %80 tanımı; eski reading.js ile aynı kural).
// Okuyabildiğin en küçük yazı: durumu 'read' (≤ 1 eksik) olan en küçük boy.
// VARSAYIM: en yüksek hız yalnız düzlükte en az 2 adım varsa raporlanır.
// bottom: merdivenin en küçük boyu (floor = en küçük boy okundu).
export function analyzeReading(items, { threshold = 0.8, bottom = LADDER_BOTTOM } = {}) {
  const live = items.filter((x) => !x.superseded && !x.practice)
  const valid = live
    .filter((x) => x.status !== 'failed' && x.seconds > 0 && x.wpm != null)
    .sort((a, b) => b.logMAR - a.logMAR)
  const plateau = []
  let mean = 0
  for (const x of valid) {
    if (plateau.length && x.wpm < threshold * mean) break
    plateau.push(x)
    mean = plateau.reduce((s, p) => s + p.wpm, 0) / plateau.length
  }
  const reads = live.filter((x) => x.status === 'read')
  const anyRead = live.filter((x) => x.status !== 'failed')
  const readingAcuity = reads.length ? Math.min(...reads.map((x) => x.logMAR)) : null
  // MNREAD tarzı keskinlik (yalnız saklanır): okunan en küçük boy + hata başına 0,01 (Calabrèse 2016)
  const errors = anyRead.reduce((s, x) => s + (Number.isFinite(x.errors) ? x.errors : 0), 0)
  const smallestAny = anyRead.length ? Math.min(...anyRead.map((x) => x.logMAR)) : null
  let cpsCensored = null
  if (!valid.length) cpsCensored = anyRead.length ? 'nospeed' : 'above'
  else if (plateau.length === valid.length) cpsCensored = 'below'
  return {
    criticalPrintSize: plateau.length ? round1(plateau.at(-1).logMAR) : null,
    readingAcuity: readingAcuity == null ? null : round1(readingAcuity),
    maxReadingSpeed: plateau.length >= 2 ? Math.round(mean) : null,
    readingAcuityMnread: smallestAny == null ? null : +(smallestAny + 0.01 * errors).toFixed(2),
    cpsCensored,
    floor: live.some((x) => Math.abs(x.logMAR - bottom) < 1e-9 && x.status !== 'failed'),
    plateau: plateau.map((x) => x.logMAR),
  }
}

// ---------------------------------------------------------------------------------------------
// Gösterim: logMAR "0,3" / "−0,1"; M birimi. VARSAYIM: 40 cm'de logMAR = log10(M / 0,4), yani
// 0,4 ≈ 1 M ≈ 10 punto (Calabrèse 2018 rakamları + IReST'te 1 M = 10 punto; iki kaynaktan türetildi).
export const mUnits = (l) => 0.4 * 10 ** l
export function fmtLogMAR(l) {
  if (!Number.isFinite(l)) return '—'
  const v = Math.abs(l) < 0.05 ? 0 : l
  return `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`
}
export const fmtM = (l) => mUnits(l).toFixed(1).replace('.', ',')

// ---------------------------------------------------------------------------------------------
// Kayıtlar. Eski "Okuma hızı" kayıtları (protocol yok) ayrı ve soluk gösterilir; karşılaştırma
// yalnız protocol 2 içinde ve aynı gözlük koşulunda (lib/trend.js sameCondition) yapılır.
export const isReadingV2 = (t) => t?.type === 'reading' && t.protocol === PROTOCOL
export const isReadingV1 = (t) => t?.type === 'reading' && t.protocol !== PROTOCOL
const byDate = (a, b) => String(a.date ?? '').localeCompare(String(b.date ?? ''))
export const readingV2 = (tests = []) => tests.filter(isReadingV2).sort(byDate)
export const readingV1 = (tests = []) => tests.filter(isReadingV1).sort(byDate)
export const cpsOf = (t) => (Number.isFinite(t?.criticalPrintSize) ? t.criticalPrintSize : null)

// Bir önceki karşılaştırılabilir test (aynı koşul, rahat boyu olan)
export function previousComparable(tests, correction, beforeDate = null) {
  return readingV2(tests)
    .filter((t) => (beforeDate == null || String(t.date) < String(beforeDate)) && sameCondition(t.correction ?? null, correction ?? null) && cpsOf(t) != null)
    .at(-1) ?? null
}

const steps = (a, b) => Math.round((a - b) / LADDER_STEP)

// Sonuç ekranında Nef'in tek cümlesi. Sağlık iddiası yok.
export function jevResultLine(result, prev) {
  if (result.cpsCensored === 'nospeed') return 'Çok hızlı geçtin, rahat boyu hesaplayamadım; bir dahakine yazıları okuyarak dene.'
  if (result.cpsCensored === 'above') return 'En büyük yazıda bile zorlandın; gözlüğünle ya da daha iyi ışıkta tekrar dene.'
  if (result.cpsCensored === 'below' && result.floor) return 'En küçük yazıya kadar okudun; bu test daha küçüğünü ölçemiyor.'
  const cur = cpsOf(result)
  const p = cpsOf(prev)
  if (cur == null || p == null) return 'İlk ölçümün bu; karşılaştırma bir sonraki testte başlar.'
  const d = steps(cur, p)
  if (d === 0) return `Rahat boyun geçen testle aynı: ${fmtLogMAR(cur)}.`
  // Tek basamak fark tekrar payı içinde (kritik boy ±0,12 logMAR; Subramanian 2006)
  if (Math.abs(d) === 1) return 'Geçen testten bir basamak farklı; bu fark ölçümün oynaması içinde.'
  if (d < 0) return 'Bu sefer daha küçük yazıyı rahat okudun.'
  return 'Bu sefer rahat boyun büyük çıktı; ışığı ve mesafeyi kontrol edip haftaya tekrar dene.'
}

// Gelişim kartındaki Nef cümlesi: son iki karşılaştırılabilir test
export function jevProgressLine(tests) {
  const v2 = readingV2(tests).filter((t) => cpsOf(t) != null)
  const last = v2.at(-1)
  if (!last) return null
  const prev = previousComparable(tests, last.correction ?? null, last.date)
  if (!prev) return 'İlk ölçümün bu; karşılaştırma bir sonraki testte başlar.'
  const d = steps(cpsOf(last), cpsOf(prev))
  if (d === 0) return `Rahat boyun son iki testte aynı: ${fmtLogMAR(cpsOf(last))}.`
  if (Math.abs(d) === 1) return 'Son iki test arasında bir basamak fark var; bu ölçümün oynaması içinde.'
  if (d < 0) return 'Son testte daha küçük yazıyı rahat okudun.'
  return 'Son testte rahat boyun büyük çıktı; ışığı ve mesafeyi kontrol edip tekrar dene.'
}

// Rahat boy metni: sınırdaysa "> 0,5"
export function cpsText(t) {
  if (cpsOf(t) != null) return fmtLogMAR(cpsOf(t))
  if (t?.cpsCensored === 'above') return `> ${fmtLogMAR(t.ladderTop ?? LADDER_TOP)}`
  return '—'
}

// Diyafram merdiveni: merdivenin her boyu için o boydaki (geçerli) adımın durumu
// status: 'read' | 'struggled' | 'failed' | 'none' (sıra gelmedi)
export function ladderStatus(record) {
  const ladder = record?.ladder ?? []
  const items = (record?.items ?? []).filter((x) => !x.superseded && !x.practice)
  return ladder.map((l) => {
    const it = items.find((x) => Math.abs(x.logMAR - l) < 1e-9)
    if (!it) return { l, status: 'none' }
    return { l, status: it.status, seconds: it.seconds ?? null, words: it.words ?? null, matched: it.matched ?? null, distanceMm: it.distanceMm ?? null }
  })
}
