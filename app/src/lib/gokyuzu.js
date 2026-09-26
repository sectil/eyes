// Gökyüzü molası: ekrandan başını kaldır, 2 dk ufka ve gökyüzüne bak. Saf mantık. Tasarım: Artifact "Gökyüzü Molası".
// Dürüstlük sınırı: gündüz gerçek gökyüzüne bakmayı doğrudan test eden çalışma PubMed'de yok (tarama 2026-09).
// Dayanak yakın kanıtlar: doğa manzarası (Ulrich 1984, Yamashita 2021), hayranlık (Sturm 2020, Martens 2026),
// uzağa bakma molası (Talens-Estarelles 2022). Kaynaklar lib/sources.js. Sağlık iddiası yok.

export const SESSION_TYPE = 'gokyuzu'
export const isGokyuzu = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.seconds)
export const DURATION_SEC = 120 // VARSAYIM: doğa görüntüsü çalışması 3 dk, uzağa bakma molası 20 sn; arası
export const MIN_SAVE_SEC = 30

// Günün saatine göre bölüm ve renkler (yalnız görünüm; iddia değil)
export function partOfDay(hour) {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}
export const SKY = {
  dawn: { label: 'Sabah', top: '#3B4F7A', mid: '#C98B8B', low: '#F2C38F', hz: '#2A3550' },
  day: { label: 'Gündüz', top: '#2B5C8A', mid: '#5C93C4', low: '#A9CBE6', hz: '#23394C' },
  dusk: { label: 'Akşam', top: '#2E2A55', mid: '#8A4F6E', low: '#E89A5C', hz: '#231E38' },
  night: { label: 'Gece', top: '#050A18', mid: '#0E1A33', low: '#1C2A48', hz: '#070C16' },
}

// Her 20 sn'de bir soru (6 soru × 20 sn = 120 sn). Gece soruları yıldız ve aya yönelir.
export const PROMPTS = {
  day: [
    'Gökyüzünde görebildiğin en uzak noktayı bul.',
    'Bulutlar hangi yöne gidiyor?',
    'Ufuk çizgisini soldan sağa yavaşça izle.',
    'Gökyüzünde kaç farklı renk var?',
    'Bu gökyüzünün altında küçük bir noktasın. Bırak öyle olsun.',
    'Birkaç kez yavaşça göz kırp. Omuzlarını bırak.',
  ],
  night: [
    'Gökyüzünde en uzaktaki ışığı bul.',
    'Kaç yıldız sayabiliyorsun?',
    'Ay nerede? Görünmüyorsa en karanlık yeri bul.',
    'Ufuk çizgisini soldan sağa yavaşça izle.',
    'Bu gökyüzünün altında küçük bir noktasın. Bırak öyle olsun.',
    'Birkaç kez yavaşça göz kırp. Omuzlarını bırak.',
  ],
}
export const promptsFor = (part) => (part === 'night' ? PROMPTS.night : PROMPTS.day)
// Geçen süreye göre sıradaki soru (0..n-1)
export function promptIndex(elapsedSec, durationSec = DURATION_SEC, n = 6) {
  if (!(elapsedSec > 0)) return 0
  return Math.min(n - 1, Math.floor((elapsedSec / durationSec) * n))
}

export function makeRecord({ before, after, seconds, part }, date = new Date()) {
  return {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    before: Number.isFinite(before) ? before : null,
    after: Number.isFinite(after) ? after : null,
    delta: Number.isFinite(before) && Number.isFinite(after) ? after - before : null,
    seconds: Math.round(seconds ?? 0),
    part,
  }
}
// Kendi verin: en az 3 puanlı moladan sonra ortalama değişim
export const MIN_HISTORY = 3
export function history(sessions = []) {
  const xs = sessions.filter(isGokyuzu).map((s) => s.delta).filter(Number.isFinite)
  if (xs.length < MIN_HISTORY) return { n: xs.length, mean: null }
  return { n: xs.length, mean: xs.reduce((a, b) => a + b, 0) / xs.length }
}

// Bilim kartları: source → lib/sources.js. answer: 'fact' | 'myth' | 'mixed' | 'unstudied'
export const FACTS = [
  { id: 'nature3', source: 'yamashita2021', claim: '3 dakika doğa görmek rahatlatır.', answer: 'fact', body: '30 genç yetişkin 3 dk doğa görüntüsü izleyince, bina görüntüsüne göre kendini daha rahat ve gevşemiş hissetti (büyük etki). Canlılık değişmedi. Görüntüyle yapıldı; gerçek gökyüzüyle değil.' },
  { id: 'rule20', source: 'talens2022', claim: '20-20-20 kuralı ekran yorgunluğunu azaltır.', answer: 'fact', body: '29 ekran kullanıcısında 2 haftalık mola hatırlatıcısıyla göz yorgunluğu ve kuru göz yakınmaları azaldı; bırakınca 1 hafta sonra etki kalmadı. Küçük ve kontrol grubu olmayan bir çalışma.' },
  { id: 'window', source: 'ulrich1984', claim: 'Pencereden doğa görmek iyileşmeyle ilişkili olabilir.', answer: 'fact', body: 'Ameliyat sonrası penceresi ağaçlara bakan 23 hasta, tuğla duvara bakan 23 eşleştirilmiş hastaya göre hastanede daha kısa kaldı ve daha az güçlü ağrı kesici aldı. Gözlemsel bir karşılaştırma; neden-sonuç göstermez.' },
  { id: 'awe', source: 'sturm2020', claim: 'Hayranlık yürüyüşü depresyonu tedavi eder.', answer: 'myth', body: '60 yaşlı yetişkin 8 hafta boyunca haftada 15 dk yürüdü. Hayranlığa yönelenler daha çok neşe bildirdi ve günlük sıkıntıları daha çok azaldı; ama kaygı, depresyon ve yaşam doyumu iki grupta da değişmedi.' },
  { id: 'stars', source: 'martens2026', claim: 'Yıldız ve uzay fotoğrafları hayranlık uyandırır.', answer: 'fact', body: 'Şehir fotoğraflarına göre derin uzay ve yıldız fotoğrafları hayranlığı, özellikle "büyüklük" hissini artırdı; olumsuz duyguya etkisi olmadı. Olumlu duygu sonuçları karışıktı.' },
  { id: 'daylight', source: 'dunster2022', claim: 'Gündüz ışığı uyku düzenini öne çeker.', answer: 'fact', body: '500’den fazla üniversite öğrencisinde gündüz en az 50 lux ışıkta geçen her ek saat, iç saati yaklaşık 30 dk öne çekti. Gözlemsel bir çalışma.' },
  { id: 'nightlight', source: 'deprato2025', claim: 'Gece yatak odasındaki ışık ruh hâlini etkiler.', answer: 'mixed', body: '19 çalışmada gece ışığı depresyon sıklığıyla ilişkiliydi; başucu ışığında ilişki daha güçlüydü. Bunlar ilişki; ışığın depresyona neden olduğu gösterilmedi.' },
  { id: 'sun', source: 'gabriel2025', claim: 'Güneşe kısa süre bakmak zararsızdır.', answer: 'myth', body: 'Yaklaşık 1 saat istemeden güneşe maruz kalan bir kişide iki gözde merkez görme kaybı gelişti; aylar içinde büyük ölçüde düzeldi ama küçük bir kör nokta kaldı. Tek olgu; ama uyarı açık: güneşe bakma.' },
  { id: 'clouds', source: null, claim: 'Bulut izlemek stresi azaltır.', answer: 'unstudied', body: 'Bunu doğrudan test eden bir çalışma PubMed’de bulamadık (Eylül 2026). Bu yüzden iddia etmiyoruz; mola, yakın kanıtlara dayanıyor.' },
]
export const ANSWER_TEXT = { fact: 'Doğru', myth: 'Efsane', mixed: 'Belirsiz', unstudied: 'Araştırılmamış' }
// Sıradaki kart: mola sayısına göre sırayla
export const factFor = (sessions = []) => FACTS[sessions.filter(isGokyuzu).length % FACTS.length]
// Modülün bütün kaynakları (Kaynaklar listesi için; sırası kartlarla aynı)
export const SOURCE_IDS = [...new Set(FACTS.map((f) => f.source).filter(Boolean))]
