// Bildirim metinleri (B1a, elle yazılmış cümleler): textKey → { title, body }. PLAN.v1 §3.A.6, §5.5 madde 6.
// Cümlelerin tek kaynağı docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/metin-B1a-onay.md (sahip onaylı, 2026-09-30).
// Harfi harfine aktarıldı; tek harf değiştirilmez, yeni cümle buraya yazılmaz (remindTexts.test.js dosyayla birebir sınar).
//
//   remind.<modül>  modül hatırlatması (7800–7859), remind.path yol hatırlatması
//   remind.merged   birleşik bildirim: BR1–BR2 iki modül ({A}, {B} = modül adı), BR3 üç ya da daha çok modül
//   nudge.<tür>     legacy türlerin ek saatleri (7860–7867; ilk saat 74xx bugünkü metniyle kalır, karar 1'de B)
//
// Seçim: günden güne döner (gün numarası + o günkü sıra); aynı gün aynı anahtarda aynı cümle tekrar etmez (en çok 3 saat,
// her anahtarda en az 3 cümle; birleşik iki modülde 2 cümle). Görünür bilim satırı (SCI_LINES) günde bir bildirimde.
// Saf; planı kurmaz. notifyAll.planAll({ texts: true }) çağırır.
import { dayKey, keyDay } from './habitLog.js'

// Uzunluk sınırları (PLAN.v1 §3.A.6): başlık ≤ 30; bilim satırı yoksa gövde ≤ 110; varsa Nef cümlesi ≤ 70, bilim
// satırı ≤ 100, gövde ≤ 160. Sayım karakter (kod noktası) başına, onay dosyasındaki Python len ile aynı.
export const LIMITS = Object.freeze({ title: 30, body: 110, nef: 70, sci: 100, bodyWithSci: 160 })
// VARSAYIM: bilim satırı gövdede Nef cümlesinin altında, yeni satırda (tasarımda biçim yok). Ayraç gövdeye sayılır.
export const SCI_SEP = '\n'
export const MERGED_KEY = 'remind.merged'

// Her cümlenin kaynağı onay dosyasındaki "Kaynak:" satırından. null: cümleye uyan kaynak yok (geçici bell2023 bağı
// kullanılmaz, sahip kararı 2); bildirim modülün kendi science havuzundaki kaynağı taşır. remind.path: singh2024
// (karar 3). Birleşik: ilk modülün evidence'ı (kendi anahtarı yok).
// Tek Bakışta chung2004, Hızlı Bakış ball2002, Dalga dewitte2019: kanıt kapısı 2 (bildirim-hava-yuruyus/kanit-2-onay.md,
// sahip onayı 2026-09-30); görünür bilim satırı yalnız kartta (SCI_LINES metin-B1a-onay.md §3 listesiyle sınırlı).
export const TEXTS = Object.freeze({
  'remind.path': [
    { id: 'YL1', title: 'Bugünün yolu hazır', body: 'Birkaç dakikan varsa yola başlayabilirsin. Duraklar sırayla açılır.', source: 'singh2024' },
    { id: 'YL2', title: 'Yola başlamak ister misin?', body: 'Bugünkü duraklar Ana sayfada. Seçim senin: şimdi ya da biraz sonra.', source: 'singh2024' },
    { id: 'YL3', title: 'Günün yolu', body: 'İlk durak kısa. Dokun, yola birlikte çıkalım.', source: 'singh2024' },
  ],
  'remind.routine': [
    { id: 'GE1', title: 'Göz egzersizi', body: 'Bugünkü göz egzersizi hazır. Dokun, Ana sayfadan başla.', source: null },
    { id: 'GE2', title: 'Kısa bir göz turu', body: 'Göz egzersizi birkaç dakika sürer. Hazır olduğunda dokun.', source: null },
    { id: 'GE3', title: 'Önce uzağa', body: 'Bir süre uzağa bak, sonra egzersize geç. Dokunman yeter.', source: 'talens2022' },
  ],
  'remind.blink': [
    { id: 'GK1', title: 'Göz kırpma egzersizi', body: 'Yaklaşık 2,5 dakika sürer. Dokun, rehberli kırpma başlasın.', source: 'kim2020' },
    { id: 'GK2', title: 'Kısa bir kırpma arası', body: 'Ekrandan başını kaldır, gözlerini yavaşça kırp. Egzersiz birkaç dakika sürer.', source: 'wolffsohn2025' },
    { id: 'GK3', title: 'Kırpma egzersizi', body: 'Rehberli kırpma birkaç dakika sürer. Şimdi ya da sonra, sen seç.', source: 'wolffsohn2025' },
  ],
  'remind.snake': [
    { id: 'YI1', title: 'Yılan oyunu hazır', body: 'Klasik oyun, kısa bir tur. Dokun, oyun başlasın.', source: null },
    { id: 'YI2', title: 'Bir tur Yılan?', body: 'Kısa bir oyun arası. Dokunman yeter.', source: null },
    { id: 'YI3', title: 'Yılan', body: 'Birkaç dakikalık bir oyun ister misin? Seçim senin.', source: null },
  ],
  'remind.track': [
    { id: 'CE1', title: 'Çemberler hazır', body: 'Parlayan merceği gözünle takip et. Kısa bir tur yeter.', source: null },
    { id: 'CE2', title: 'Kısa bir Çemberler turu', body: 'İstersen şimdi bir tur. Dokun, Çemberler başlasın.', source: null },
    { id: 'CE3', title: 'Çemberler', body: 'Gözle izleme pratiği hazır. Seçim senin: şimdi ya da sonra.', source: null },
  ],
  'remind.tek-bakis': [
    { id: 'TB1', title: 'Tek Bakışta', body: 'Harfler kısa süre görünür. Tek bakışta kaç tanesini tanırsın?', source: 'chung2004' },
    { id: 'TB2', title: 'Kısa bir bakış turu', body: 'Tek Bakışta hazır. Birkaç dakikan varsa dokun, başla.', source: 'chung2004' },
    { id: 'TB3', title: 'Tek Bakışta hazır', body: 'Bakışını ortada tut, harfleri tanı. İstersen şimdi bir tur.', source: 'chung2004' },
  ],
  'remind.quick-look': [
    { id: 'HB1', title: 'Hızlı Bakış', body: 'Kısa bir dikkat turu hazır. Dokun, tur başlasın.', source: 'ball2002' },
    { id: 'HB2', title: 'Bir dikkat turu', body: 'Hızlı Bakış hazır. Birkaç dakikan olduğunda dokunman yeter.', source: 'ball2002' },
    { id: 'HB3', title: 'Hızlı Bakış hazır', body: 'Ortada bir araç, kenarda bir yıldız belirir. İkisini de yakala.', source: 'ball2002' },
  ],
  'remind.fark-ettin': [
    { id: 'FE1', title: 'Cadde oyunu', body: 'Ekrandaki caddede bir görev, sonra birkaç soru. Hazırsan dokun.', source: null },
    { id: 'FE2', title: 'Cadde turu hazır', body: 'Birkaç dakikalık bir dikkat oyunu. Dokun, oyun başlasın.', source: null },
    { id: 'FE3', title: 'Bir dikkat oyunu', body: 'Ekrandaki caddede kısa bir görev hazır. Seçim senin.', source: null },
  ],
  'remind.notice': [
    { id: 'BG1', title: 'Bugünün görevi', body: 'Bugün etrafında arayacağın küçük bir şey var. Dokun, görevi aç.', source: null },
    { id: 'BG2', title: 'Küçük bir görev', body: 'Etrafına bir göz at. Bugünün görevi hazır.', source: null },
    { id: 'BG3', title: 'Etrafına bir bak', body: 'Bugünün görevi hazır. Bulduklarını istersen sonra kaydedebilirsin.', source: null },
  ],
  'remind.yoga': [
    { id: 'YG1', title: 'Yoga dersi hazır', body: 'Rahat bir yer bul. Gerisini sesli ders anlatır.', source: 'moszeik2025' },
    { id: 'YG2', title: 'Biraz yoga', body: 'İstersen kısa bir ders seç. Dersi istediğin an bitirebilirsin.', source: 'luu2024' },
    { id: 'YG3', title: 'Yoga', body: 'Sesli bir ders ister misin? Süresini sen seçersin.', source: 'moszeik2025' },
  ],
  'remind.dalga': [
    { id: 'DA1', title: 'Dalga', body: 'Birkaç dakikalık bir ses arası. Sakin, Güç ya da Motivasyon: seçim senin.', source: 'dewitte2019' },
    { id: 'DA2', title: 'Kısa bir ses arası', body: 'Kulaklığın yakındaysa tak. Dalga hazır, birkaç dakika yeter.', source: 'dewitte2019' },
    { id: 'DA3', title: 'Dalga hazır', body: 'Birkaç dakika dinlemek ister misin? Dokun, ses başlasın.', source: 'dewitte2019' },
  ],
  'remind.gokyuzu': [
    { id: 'GY1', title: 'Gökyüzü molası', body: 'Ekrandan başını kaldır, 2 dakika gökyüzüne bak.', source: 'yamashita2021' },
    { id: 'GY2', title: '2 dakika gökyüzü', body: 'Bir pencere ya da balkon yeter. Hazır olduğunda dokun.', source: 'talens2022' },
    { id: 'GY3', title: 'Uzağa, yukarıya', body: 'Ufka ve gökyüzüne 2 dakika bakmak ister misin? Dokun, başlayalım.', source: 'yamashita2021' },
  ],
  'remind.yon': [
    { id: 'YN1', title: 'Yön', body: 'Kendine birkaç dakika ayır. Kısa bir yazı egzersizi hazır.', source: null },
    { id: 'YN2', title: 'Kendine bir soru', body: 'Yön\'de kısa bir egzersiz var. Hazır hissettiğinde dokun.', source: null },
  ],
  'remind.okuma-anlama': [
    { id: 'OA1', title: 'Bugünün bulgusu hazır', body: 'Kısa bir bilim metni ve dört soru. İki dakika yeter.', source: 'rayner2016' },
    { id: 'OA2', title: 'Bir metin, dört soru', body: 'Bugün hangi hayvanın sırrını okuyacaksın? Kendi hızında.', source: 'rayner2016' },
    { id: 'OA3', title: 'Okuma molası', body: 'Kısa bir bulgu oku; hızın anladığınla birlikte sayılır.', source: 'rayner2016' },
  ],
  'remind.yakala-yaz': [
    { id: 'YY1', title: 'Yakala Yaz hazır', body: 'İki kelime, bir an. Kısa bir tur ister misin?', source: 'rubin1992' },
    { id: 'YY2', title: 'Bir tur Yakala Yaz?', body: 'Yaklaşık 2 dakika. Hazır olduğunda dokun.', source: 'rubin1992' },
    { id: 'YY3', title: 'Yakala Yaz', body: 'Bugünkü basamağın seni bekliyor. Seçim senin: şimdi ya da sonra.', source: 'rubin1992' },
  ],
  'remind.merged': [
    { id: 'BR1', title: '2 hatırlatma bir arada', body: '{A} ve {B} hazır. Hangisiyle başlarsın?', source: null },
    { id: 'BR2', title: 'Sırada 2 pratik', body: '{A} ile {B} hazır. Dokun, Ana sayfadan birini seç.', source: null },
    { id: 'BR3', title: 'Birkaç hatırlatma bir arada', body: 'Bugünkü pratiklerin Ana sayfada hazır. Dokun, birini seç.', source: null },
  ],
  'nudge.breath': [
    { id: 'NF1', title: 'Nefese 1 dakika', body: 'Yavaş bir nefes ritmi hazır. Dokun, ekrandaki ritmi izle.', source: 'laborde2022' },
    { id: 'NF2', title: 'Nefes turu', body: '1 dakikalık nefes hazır. Ritmi ekran gösterir.', source: 'fincham2023' },
    { id: 'NF3', title: 'Bir nefeslik ara', body: '1 dakika yeter. Dokun, yavaş nefes başlasın.', source: 'laborde2022' },
  ],
  'nudge.mola': [
    { id: 'ML1', title: 'Ekrandan kısa bir ara', body: 'Gözlerini ekrandan ayır. 1 dakika uzakta bir ağaca ya da binaya bak.', source: 'talens2022' },
    { id: 'ML2', title: 'Uzağa bir bak', body: 'Pencereden en uzak noktayı bul. 1 dakika ona bak.', source: 'talens2022' },
    { id: 'ML3', title: 'Ayağa kalkma arası', body: 'Kalk, 1 dakika ayakta kal. Hazırsan dokun, mola başlasın.', source: 'morris2020' },
  ],
  'nudge.water': [
    { id: 'SU1', title: 'Bir yudum su', body: 'Bardağın yakındaysa bir yudum al. Kayıt için dokunman yeter.', source: 'stout2022' },
    { id: 'SU2', title: 'Taze su', body: 'Bardağın boşsa şimdi doldurabilirsin.', source: 'stout2022' },
    { id: 'SU3', title: 'Su arası', body: 'Suyunu yanına al. Dokun, kaydı birlikte yapalım.', source: 'stout2022' },
  ],
  'nudge.walk': [
    { id: 'YR1', title: 'Biraz yürüyelim mi?', body: 'Koridorda ya da sokakta birkaç dakika yeter.', source: 'klasnja2019' },
    { id: 'YR2', title: 'Yürüme arası', body: 'Birkaç dakika yürü. Merdiven ya da koridor yeter.', source: 'klasnja2019' },
    { id: 'YR3', title: 'Yürüyüşe ne dersin?', body: 'İçeride de olur, dışarıda da. Kısa tutabilirsin.', source: 'klasnja2019' },
  ],
})

export const NAMES = Object.freeze({
  'path': 'Bugünün yolu',
  'routine': 'Göz egzersizi',
  'blink': 'Göz kırpma',
  'snake': 'Yılan',
  'track': 'Çemberler',
  'tek-bakis': 'Tek Bakışta',
  'quick-look': 'Hızlı Bakış',
  'fark-ettin': 'Cadde oyunu',
  'notice': 'Bugünün görevi',
  'yoga': 'Yoga',
  'dalga': 'Dalga',
  'gokyuzu': 'Gökyüzü molası',
  'yon': 'Yön',
  'okuma-anlama': 'Oku ve Anla',
  'yakala-yaz': 'Yakala Yaz',
})

export const SCI_LINES = Object.freeze({
  fincham2023: '12 denemede 785 kişiyle yapılan nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi.',
  kim2020: '41 kişilik, kontrol grubu olmayan bir çalışmada eksik kırpma oranı 4 haftada %54\'ten %34\'e indi.',
  laborde2022: '223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı.',
  stout2022: '85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı: %60.',
  wolffsohn2025: '98 kişilik bir denemede en iyi sonucu günde 3 kez 15 tekrar verdi.',
})

// Birleşik bildirimdeki bilim satırı yok (§A.4 (2)). Kapsam: yalnız onay dosyasının §3 listesi; moszeik2025 listede
// yok (karar 4), finding'i olmayan kaynaklar yalnız kart taşır. VARSAYIM: lib/sources.js'teki finding alanı değil bu
// liste kullanılır (ikisi bazı kaynaklarda farklı yazılmış; onaylı olan bu liste).
const len = (s) => [...String(s)].length
const idx = (n, len_) => ((n % len_) + len_) % len_
const nameOf = (id, names) => (names && typeof names[id] === 'string' ? names[id] : NAMES[id] ?? null)

// textKey'in cümle listesi (yoksa boş)
export const textsOf = (textKey) => TEXTS[textKey] ?? []

// Günün cümlesi: date 'YYYY-MM-DD', nth o gün o anahtarın kaçıncı bildirimi (0'dan). Gün numarası + sıra: yarın bir
// sonraki cümle, aynı gün her bildirim ayrı cümle (liste uzunluğunca). Anahtar bilinmiyorsa null.
export function pickText(textKey, date, nth = 0) {
  const list = textsOf(textKey)
  if (!list.length) return null
  const d = keyDay(date)
  return list[idx((Number.isFinite(d) ? d : 0) + (Number.isInteger(nth) ? nth : 0), list.length)]
}

// Birleşik bildirim: iki modülde BR1/BR2 (adlar {A}, {B}), üç ve daha çokta BR3. Modül adı bilinmiyorsa BR3 (VARSAYIM:
// adsız cümle kurulmaz). names: { [modül]: ad } (yoksa NAMES; fark-ettin birleşikte "Cadde oyunu").
export function mergedText(modules, date, nth = 0, names = null) {
  const [bothA, bothB, many] = textsOf(MERGED_KEY)
  const list = Array.isArray(modules) ? modules : []
  const [a, b] = list.map((m) => nameOf(m, names))
  if (list.length === 2 && a && b) {
    const d = keyDay(date)
    const pick = idx((Number.isFinite(d) ? d : 0) + (Number.isInteger(nth) ? nth : 0), 2) === 0 ? bothA : bothB
    return { ...pick, body: pick.body.replace('{A}', a).replace('{B}', b) }
  }
  return list.length >= 2 ? { ...many } : null
}

// Bilim satırı: kaynağın onaylı satırı yoksa null
export const sciLineOf = (evidence) => (typeof evidence === 'string' && Object.prototype.hasOwnProperty.call(SCI_LINES, evidence) ? SCI_LINES[evidence] : null)

// Gövdeye bilim satırı eklenebilir mi (§A.6 sınırları); eklenmiş gövde ya da null
export function withSciLine(body, evidence) {
  const line = sciLineOf(evidence)
  if (!line || len(body) > LIMITS.nef || len(line) > LIMITS.sci) return null
  const out = `${body}${SCI_SEP}${line}`
  return len(out) <= LIMITS.bodyWithSci ? out : null
}

// Plandaki textKey'li (başlığı ve gövdesi olmayan) bildirimlere metin bağlar. Yeni plan döner; öteki bildirimler
// (74xx, 75xx) aynen. Metni bulunamayan bildirim yalnız textKey'le kalır (notifyApply onu kurmaz).
// opts.names: birleşik bildirimde modül adları · opts.science: { [modül]: science havuzu } (cümlenin kaynağı havuzdaysa
// evidence o olur; değilse planın seçtiği kalır).
// Görünür bilim satırı: günde en çok bir bildirimde; öncelik modül hatırlatması (tek modül), sonra ek saatler; o gün
// en erken uygun olan. VARSAYIM: "aynı satır 7 gün tekrar etmez" ve "kart açıldıysa 30 gün dinlenir" geçmiş ister;
// bu turda yalnız planın ufkunda (≤ 3 gün) aynı satır tekrar etmez. "İlk 14 gün en güçlü kaynak" kuralı da sonraki iş.
export function resolvePlanTexts(plan, { names = null, science = null } = {}) {
  const list = Array.isArray(plan?.notifications) ? plan.notifications : []
  const seen = new Map()
  const resolved = list.map((n) => {
    if (n?.textKey == null || n.title != null || n.body != null) return n
    const date = n.extra?.date ?? dayKey(new Date(n.at))
    const k = `${n.textKey}|${date}`
    const nth = seen.get(k) ?? 0
    seen.set(k, nth + 1)
    if (n.textKey === MERGED_KEY) {
      const t = mergedText(n.modules ?? n.extra?.modules, date, nth, names)
      return t ? { ...n, title: t.title, body: t.body, extra: { ...n.extra, text: t.id } } : n
    }
    const t = pickText(n.textKey, date, nth)
    if (!t) return n
    const pool = n.extra?.kind === 'remind' ? science?.[n.module ?? n.extra?.module] : null
    let evidence = n.extra?.evidence ?? null
    if (n.extra?.kind === 'nudge') evidence = t.source // VARSAYIM: legacy türlerde kaynak onaylı cümle eşleşmesinden
    else if (t.source && Array.isArray(pool) && pool.includes(t.source)) evidence = t.source
    return { ...n, title: t.title, body: t.body, extra: { ...n.extra, evidence, text: t.id } }
  })

  // Bilim satırı: gün başına bir
  const usedDay = new Set()
  const usedLine = new Set()
  const rank = (n) => (n.extra?.kind === 'remind' ? 0 : n.extra?.kind === 'nudge' ? 1 : 2)
  const order = resolved
    .map((n, i) => ({ n, i }))
    .filter(({ n }) => n?.extra?.text && rank(n) < 2)
    .sort((a, b) => rank(a.n) - rank(b.n) || new Date(a.n.at) - new Date(b.n.at) || a.n.id - b.n.id)
  for (const { n, i } of order) {
    const day = n.extra.date ?? dayKey(new Date(n.at))
    const line = sciLineOf(n.extra.evidence)
    if (usedDay.has(day) || !line || usedLine.has(line)) continue
    const body = withSciLine(n.body, n.extra.evidence)
    if (!body) continue
    resolved[i] = { ...n, body, extra: { ...n.extra, sci: true } }
    usedDay.add(day)
    usedLine.add(line)
  }
  return { ...plan, notifications: resolved }
}
