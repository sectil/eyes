// Yön: kendini tanıma ve yazı egzersizleri. Saf mantık. Tasarım: Artifact "Yön" (onaylı).
// Üç araç: Ayna (Öz-Şefkat Ölçeği Kısa Formu, Türkçe), Dışarıdan bak (öz-uzaklaşma), Şefkatle ele al.
// Sınır: tedavi değildir; puanlar kişi-içi gidişat içindir, norm yoktur. Yazılar varsayılan olarak saklanmaz;
// isim hiç saklanmaz. Kurgusal örnekler kullanıcının anlattığı olaylara benzemez (kural).

export const SESSION_TYPE = 'yon'
export const TOOLS = ['ayna', 'uzak', 'sefkat']
export const isYon = (s) => s?.type === SESSION_TYPE && TOOLS.includes(s.tool)
export const YON_NOTES_KEY = 'gozolcum:yon-notes'
export const AYNA_VERSION = 'scs-sf-tr-6'
export const AYNA_EVERY_DAYS = 30 // Ayna ayda bir önerilir (VARSAYIM)
export const MIN_TEXT = 20

// ---- Ayna: Öz-Şefkat Ölçeği Kısa Formu (Raes 2011, DOI 10.1002/cpp.702), Türkçe uyarlama (Büyüköksüz ve ark. 2025,
// DOI 10.1186/s40359-025-03070-8, Tablo 2). Makalede 12 maddenin yalnız 6'sı (her yandan bir) yayımlandı; tam liste
// ek dosyada ve ölçek sahibinin izni gerekli. Bu yüzden şimdilik bu 6 madde. rev: sertlik yanı (ters puanlanır).
// VARSAYIM: 1–5 puan, sertlik maddeleri 6 − puan, ortalama (makale puanlamayı açıkça yazmıyor).
// 3. maddede makaledeki yazım hatası ("bakış acısı") düzeltildi.
export const AYNA_ITEMS = [
  { id: 'overid', side: 'Aşırı özdeşleşme', rev: true, t: 'Benim için önemli olan bir şeyde başarısız olduğumda, kendimi yetersizlik duygusuyla tüketirim.' },
  { id: 'kind', side: 'Kendine nezaket', rev: false, t: 'Kişiliğimin hoşlanmadığım yönlerine karşı anlayışlı ve hoşgörülü olmaya çalışırım.' },
  { id: 'mindful', side: 'Farkındalık', rev: false, t: 'Acı verici bir şey olduğu zaman, durumu dengeleyen bir bakış açısı almaya çalışırım.' },
  { id: 'isol', side: 'Yalnızlık', rev: true, t: 'Kendimi üzgün hissettiğim zaman, çoğu insanın muhtemelen benden daha mutlu olduğunu hissetmeye meyilli olurum.' },
  { id: 'human', side: 'Ortak insanlık', rev: false, t: 'Başarısızlıklarımı insan doğasının bir parçası olarak görmeye çalışırım.' },
  { id: 'judge', side: 'Öz-yargı', rev: true, t: 'Sahip olduğum kusurlarımı, yetersizliklerimi onaylamıyorum ve yargılıyorum.' },
]
export const LIKERT = ['Neredeyse hiç', 'Nadiren', 'Bazen', 'Sık sık', 'Neredeyse her zaman']
// Ayna sonucunda karşılıklı yanlar: [sertlik, şefkat]
export const AYNA_PAIRS = [['judge', 'kind'], ['isol', 'human'], ['overid', 'mindful']]

// answers: { [id]: 1..5 } → { score (1..5, yüksek = daha çok öz-şefkat), items }
export function scoreAyna(answers = {}) {
  const vals = AYNA_ITEMS.map((it) => answers[it.id])
  if (!vals.every((v) => Number.isInteger(v) && v >= 1 && v <= 5)) return null
  const sum = AYNA_ITEMS.reduce((s, it) => s + (it.rev ? 6 - answers[it.id] : answers[it.id]), 0)
  return { score: +(sum / AYNA_ITEMS.length).toFixed(2), items: Object.fromEntries(AYNA_ITEMS.map((it) => [it.id, answers[it.id]])) }
}

// ---- Dışarıdan bak: birinci tekil sözcükleri say (kişinin kendi adını ve "sen"i kullanması uzaklığı artırıyor:
// Kross 2014, DOI 10.1037/a0035173). Türkçede ek halindeki birinci kişi (-dım, -ım) sayılmaz; yalnız ayrı sözcükler.
const WORD = 'a-zçğıöşüâîû'
const wordRe = (words) => new RegExp(`(^|[^${WORD}])(${words.join('|')})(?=$|[^${WORD}])`, 'g')
const FIRST_RE = wordRe(['ben', 'benim', 'bana', 'beni', 'bende', 'benden', 'bence', 'kendim', 'kendimi', 'kendime', 'kendimden'])
const YOU_RE = wordRe(['sen', 'senin', 'sana', 'seni', 'sende', 'senden'])
const lower = (s) => String(s ?? '').toLocaleLowerCase('tr')
export const firstPersonCount = (text) => (lower(text).match(FIRST_RE) ?? []).length
export function distanceState(text, name = '') {
  const t = lower(text)
  const n = lower(name).trim()
  const first = firstPersonCount(text)
  const usedName = Boolean(n) && t.includes(n)
  const usedYou = YOU_RE.test(t)
  YOU_RE.lastIndex = 0
  if (!t.trim()) return { kind: 'empty', first }
  if (first > 0) return { kind: 'first', first }
  if (usedName || usedYou) return { kind: 'far', first }
  return { kind: 'neutral', first }
}

// ---- Şefkatle ele al: hazır cümle parçaları (övgü yok; Wood 2009, DOI 10.1111/j.1467-9280.2009.02370.x)
export const KIND_CHIPS = [
  { label: 'Tek sen değilsin', text: 'Bunu yaşayan tek kişi sen değilsin. ' },
  { label: 'Hissettiğin anlaşılır', text: 'Böyle hissetmen çok anlaşılır. ' },
  { label: 'O günkü sen', text: 'O günkü sen, elindekiyle en iyisini yapmaya çalıştı. ' },
  { label: 'Küçük bir adım', text: 'Bundan sonra atabileceğin küçük bir adım var: ' },
]
export const appendChip = (text, chip) => `${String(text ?? '').trimEnd()}${text && text.trim() ? ' ' : ''}${chip}`

// ---- Kayıtlar (yalnız sayılar; yazı yok) ----
const base = (tool, seconds, date) => ({ type: SESSION_TYPE, tool, date: new Date(date).toISOString(), seconds: Math.round(seconds ?? 0) })
export function makeAynaRecord(result, seconds, date = new Date()) {
  return { ...base('ayna', seconds, date), version: AYNA_VERSION, score: result.score, items: result.items }
}
export function makeUzakRecord({ before, after, firstPerson = 0, seconds }, date = new Date()) {
  return { ...base('uzak', seconds, date), before, after, delta: Number.isFinite(before) && Number.isFinite(after) ? after - before : null, firstPerson }
}
export function makeSefkatRecord({ step = false, seconds }, date = new Date()) {
  return { ...base('sefkat', seconds, date), step: Boolean(step) }
}

// ---- İsteğe bağlı notlar (kullanıcı "sakla" derse; yalnız bu cihazda) ----
const store = (s) => s ?? globalThis.localStorage
export function loadNotes(storage) {
  try {
    const v = JSON.parse(store(storage)?.getItem(YON_NOTES_KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
export function saveNote(note, storage) {
  try {
    const list = [...loadNotes(storage), { ...note, date: new Date(note.date ?? Date.now()).toISOString() }].slice(-200)
    store(storage)?.setItem(YON_NOTES_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

// ---- Ayna gidişatı ----
export const aynaRecords = (sessions = []) => sessions.filter((s) => isYon(s) && s.tool === 'ayna' && Number.isFinite(s.score))
export function aynaDue(sessions = [], now = new Date()) {
  const last = aynaRecords(sessions).at(-1)
  if (!last) return true
  return (new Date(now) - new Date(last.date)) / 86400000 >= AYNA_EVERY_DAYS
}

// ---- Bilim kartları: hepsi PubMed özetinden doğrulandı ----
export const FACTS = {
  uzak: { claim: 'Bir anıya dışarıdan bakmak, bıraktığı duyguyu azaltabilir.', answer: 'fact', body: '48 çalışmada olaya gözlemci gibi bakmak duygusal tepkiyi küçük ama anlamlı ölçüde azalttı. En güçlü etki, sahneyi uzaktan görüp düşünceleri yazarak ya da konuşarak dışa vurunca görüldü. Yaş ve kültür etkiyi değiştirmedi.', ref: 'Guo 2022 · Cogn Emot', doi: '10.1080/02699931.2022.2134094' },
  sefkat: { claim: 'Kendime yumuşak davranırsam tembelleşirim.', answer: 'myth', body: 'Başarısızlıktan sonra kendine şefkat gösterenler zor bir sınava daha uzun çalıştı, zayıf yanını değiştirmeye daha istekli oldu (4 deney).', ref: 'Breines & Chen 2012 · Pers Soc Psychol Bull', doi: '10.1177/0146167212445599' },
  olumlama: { claim: 'Neden "Ben harikayım" demiyoruz?', answer: 'note', body: 'Kendini düşük gören kişiler "Sevilecek biriyim" cümlesini tekrarlayınca daha kötü hissetti. Şefkat, kendini övmek değil; olanı yumuşakça kabul etmek.', ref: 'Wood ve ark. 2009 · Psychol Sci', doi: '10.1111/j.1467-9280.2009.02370.x' },
  kiyas: { claim: 'Kendini daha iyi durumdakilerle kıyaslamak insanı yukarı çeker.', answer: 'myth', body: '60 yılı aşan çalışmaların meta-analizinde yukarıya kıyasın en sık sonucu karşıtlıktı: kişi kendi yeteneğini daha düşük gördü. İnsanlar yine de çoğunlukla yukarıya kıyaslamayı seçiyor.', ref: 'Gerber, Wheeler, Suls 2017 · Psychol Bull', doi: '10.1037/bul0000127' },
}
export const ANSWER_TEXT = { fact: 'Doğru', myth: 'Efsane', note: 'Bilgi' }
