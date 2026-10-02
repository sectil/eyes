// Tek Bakışta: görsel menzil (visual span) — gözü kıpırdatmadan tanınan harf sayısı. Saf mantık.
// Tasarım: Artifact "Tek Bakışta" (onaylı). Yöntem: harf üçlüleri (trigram) sabitleme noktasının solunda ve sağında
// kısa süre gösterilir (Legge 2001, DOI 10.1016/s0042-6989(00)00295-9; Kwon 2007, 100 ms, DOI 10.1016/j.visres.2007.08.002).
// Süre, doğruluğu ~%80 civarında tutacak şekilde turdan tura ayarlanır (Yu 2017, DOI 10.1016/j.visres.2017.06.005).
// İddia sınırı: alıştırma kazanımı çalışmalarda çevresel görüşte gösterildi (Chung 2004, Yu 2010); normal okumaya
// aktarımı ve görmeyi iyileştirdiği gösterilmedi. Uygulama bunu açıkça yazar.
//
// VARSAYIM (onaylı taslak): laboratuvarda harfler tek tek söylenir; burada 4 seçenekli büyük düğmeler (az gören
// kullanıcı için). Bu yüzden sonuç "yaklaşık" etiketlidir; laboratuvardaki "bit" ölçüsü değildir.

export const SESSION_TYPE = 'span'
export const isSpan = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.span)

// Karışması zor büyük harfler (I/İ, O/Ö/Ç, Ş, Ğ, Ü dışarıda; VARSAYIM)
export const LETTERS = 'ABCDEFGHKLMNPRSTUVYZ'.split('')
export const MAX_POS = 6 // sabitleme noktasının solunda/sağında 1..6. yuva (üçlünün ortası)
export const PER_POS = 4 // her yuvada deneme sayısı (12 yuva × 4 = 48 deneme ≈ 2 dk)
export const PASS = 0.75 // yuva "tanındı" sayılır: 4 denemede ≥ 3 doğru (VARSAYIM; taslakta %80 çizgisi)
export const START_MS = 100 // Kwon 2007
export const MIN_MS = 50
export const MAX_MS = 200
export const LETTER_DEG = 0.5 // 40 cm'de harf yüksekliği (derece; VARSAYIM)
export const VIEW_MM = 400

// Deterministik rastgele (test ve tekrar için): mulberry32
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
const pick = (r, list) => list[Math.floor(r() * list.length)]
function shuffle(r, list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Üç farklı harf
export function trigram(r) {
  const out = []
  while (out.length < 3) {
    const c = pick(r, LETTERS)
    if (!out.includes(c)) out.push(c)
  }
  return out.join('')
}

// 4 seçenek: doğru + 3 çeldirici (iki harfin yer değiştirmesi, bir harfin değişmesi ×2). Hepsi farklı.
export function choicesFor(target, r) {
  const set = new Set([target])
  const t = target.split('')
  const swap = (i, j) => {
    const a = [...t]
    ;[a[i], a[j]] = [a[j], a[i]]
    return a.join('')
  }
  const replace = (i) => {
    const a = [...t]
    let c
    do c = pick(r, LETTERS)
    while (a.includes(c))
    a[i] = c
    return a.join('')
  }
  const cands = shuffle(r, [swap(0, 1), swap(1, 2), swap(0, 2)])
  set.add(cands[0])
  let guard = 0
  while (set.size < 4 && guard++ < 50) set.add(replace(Math.floor(r() * 3)))
  return shuffle(r, [...set])
}

// Bir turun denemeleri: her yuva (±1..±MAX_POS) PER_POS kez, karışık sırada
export function makeRound(seed = Date.now()) {
  const r = rng(seed)
  const slots = []
  for (let p = 1; p <= MAX_POS; p++) for (let k = 0; k < PER_POS; k++) slots.push(p, -p)
  return shuffle(r, slots).map((pos) => {
    const target = trigram(r)
    return { pos, target, choices: choicesFor(target, r) }
  })
}

// Yuva başına doğruluk: { [pos]: [doğru, toplam] }
export function profileOf(results = []) {
  const out = {}
  for (const x of results) {
    if (!Number.isInteger(x.pos) || x.pos === 0) continue
    const cur = out[x.pos] ?? [0, 0]
    out[x.pos] = [cur[0] + (x.correct ? 1 : 0), cur[1] + 1]
  }
  return out
}
// Bir tarafın menzili: merkezden dışa, PASS'i geçen ardışık en uzak yuva (geçmeyen ilk yuvada durur)
export function sideReach(profile, sign) {
  let reach = 0
  for (let p = 1; p <= MAX_POS; p++) {
    const v = profile[sign * p]
    if (!v || !v[1] || v[0] / v[1] < PASS) break
    reach = p
  }
  return reach
}
export function summarize(results = []) {
  const profile = profileOf(results)
  const left = sideReach(profile, -1)
  const right = sideReach(profile, 1)
  const n = results.length
  const correct = results.filter((x) => x.correct).length
  return { profile, left, right, span: left + right, accuracy: n ? correct / n : null }
}

// Sonraki turun gösterim süresi: doğruluk ~%80'de kalsın (Yu 2017). Yüksekse kısalır, düşükse uzar.
export function nextDuration(prevMs = START_MS, accuracy = null) {
  const ms = Number.isFinite(prevMs) ? prevMs : START_MS
  let next = ms
  if (accuracy != null && accuracy > 0.85) next = ms * 0.85
  else if (accuracy != null && accuracy < 0.7) next = ms * 1.2
  return Math.round(Math.min(MAX_MS, Math.max(MIN_MS, next)))
}
export const lastDuration = (sessions = []) => sessions.filter(isSpan).at(-1)?.durationMs ?? null
export function durationFor(sessions = []) {
  const last = sessions.filter(isSpan).at(-1)
  return last ? nextDuration(last.durationMs, last.accuracy) : START_MS
}

// Harf boyu (CSS px): 40 cm'de LETTER_DEG derece büyük harf yüksekliği; büyük harf ≈ yazı boyunun 0,7'si
export function letterPx(pxPerMm) {
  const capMm = 2 * VIEW_MM * Math.tan(((LETTER_DEG / 2) * Math.PI) / 180)
  const cap = capMm * (Number.isFinite(pxPerMm) && pxPerMm > 0 ? pxPerMm : 6)
  return { fontPx: cap / 0.7, slotPx: (cap / 0.7) * 0.82 }
}

export function makeRecord({ results, durationMs, seconds, factId = null }, date = new Date()) {
  const s = summarize(results)
  return {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    span: s.span,
    left: s.left,
    right: s.right,
    accuracy: s.accuracy == null ? null : +s.accuracy.toFixed(3),
    durationMs,
    trials: results.length,
    profile: s.profile,
    seconds: Math.round(seconds ?? 0),
    ...(factId ? { factId } : {}),
  }
}

// Bilim kartları ("Doğru mu, efsane mi?"): hepsi PubMed özetinden doğrulandı; sayı yalnız özette geçiyorsa yazıldı.
// answer: 'fact' | 'myth' | 'open' (kanıt yok)
export const FACTS = [
  {
    id: 'speed-myth',
    claim: 'Hızlı okuma kursları, anlamayı kaybetmeden okuma hızını 3 katına çıkarır.',
    answer: 'myth',
    body: 'Hız ile anlama arasında bir takas var. Anlamayı koruyarak hızı 2–3 katına çıkarmak olası görünmüyor. Hızı kalıcı artıran şey çok okumak ve kelime dağarcığı.',
    ref: 'Rayner ve ark. 2016 · Psychol Sci Public Interest',
    doi: '10.1177/1529100615623267',
  },
  {
    id: 'span-limits',
    claim: 'Gözünü kıpırdatmadan tanıdığın harf sayısı okuma hızını sınırlar.',
    answer: 'fact',
    body: 'Menzil ve okuma hızı kişi kişi güçlü ilişkiliydi. Menzil 1 harf genişleyince hız %39 arttı (hızlı dizi okuma yöntemiyle).',
    ref: 'Legge ve ark. 2007 · J Vis',
    doi: '10.1167/7.2.9',
  },
  {
    id: 'training-peripheral',
    claim: 'Harf tanıma alıştırması menzili genişletebilir.',
    answer: 'fact',
    body: '4 günlük alıştırma menzili genişletti; merkezin 10° dışındaki okuma hızı %41 arttı ve kazanım 3 ay büyük ölçüde sürdü. Çalışma çevresel görüşte yapıldı.',
    ref: 'Chung, Legge, Cheung 2004 · Vision Res',
    doi: '10.1016/j.visres.2003.09.028',
  },
  {
    id: 'older-adults',
    claim: 'Bu alıştırma yalnız gençlerde işe yarar.',
    answer: 'myth',
    body: '55–76 yaş arasında da menzil genişledi, çevresel okuma hızı %60 arttı. Kazanım gençlerdekinden biraz zayıftı.',
    ref: 'Yu ve ark. 2010 · Vision Res',
    doi: '10.1016/j.visres.2010.02.006',
  },
  {
    id: 'not-attention',
    claim: 'Alıştırmanın etkisi yalnızca daha dikkatli olmaktan gelir.',
    answer: 'myth',
    body: 'Dikkatin kenara yönelmesi biraz arttı ama bu artış okuma hızı ve menzildeki kazanımla ilişkili değildi. Kazanım görsel tanımadan geliyor.',
    ref: 'Lee ve ark. 2010 · J Vis',
    doi: '10.1167/10.6.18',
  },
  {
    id: 'children',
    claim: 'Çocuklar büyüdükçe tek bakışta daha çok harf tanır.',
    answer: 'fact',
    body: '3., 5. ve 7. sınıfta menzil düzenli büyüdü; okuma hızındaki farkların %34–52’sini menzil açıkladı. Harfler bu çalışmada da 100 ms gösterildi.',
    ref: 'Kwon, Legge, Dubbels 2007 · Vision Res',
    doi: '10.1016/j.visres.2007.08.002',
  },
  {
    id: 'vertical-reading',
    claim: '"Dikey okuma" ile birden çok satırı aynı anda okursun.',
    answer: 'open',
    body: 'Bunu gösteren bir çalışma bulamadık. Tek bakışta tanınan alan merkezden uzaklaştıkça hızla daralıyor: merkezde en az ~10 harf, 15° kenarda 1,7 harf.',
    ref: 'Legge, Mansfield, Chung 2001 · Vision Res',
    doi: '10.1016/s0042-6989(00)00295-9',
  },
  {
    id: 'speed-training',
    claim: 'Daha hızlı tanımayı çalıştırmak da aynı kazancı verir.',
    answer: 'fact',
    body: 'Gösterim süresini %80 doğrulukta tutacak şekilde kısaltan alıştırma: çevresel okuma hızı çalışılan alanda %41, çalışılmayanda %27 arttı. Bu modülün süre ayarı bu yöntemden.',
    ref: 'Yu ve ark. 2017 · Vision Res',
    doi: '10.1016/j.visres.2017.06.005',
  },
]
export const ANSWER_TEXT = { fact: 'Doğru', myth: 'Efsane', open: 'Kanıt yok' }
// Sıradaki kart: tur sayısına göre sırayla (her kart bir kez, sonra baştan)
export const factFor = (sessions = []) => FACTS[sessions.filter(isSpan).length % FACTS.length]
// Kullanıcının seçimi (Doğru / Efsane) karta göre doğru mu: 'open' kartında "Efsane" doğru kabul edilir (kanıt yok)
export const judged = (fact, choice) => (fact.answer === 'fact' ? choice === 'fact' : choice === 'myth')
