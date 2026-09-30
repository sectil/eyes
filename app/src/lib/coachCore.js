// Nef Göz Koçu — sunucu ve istemcinin ortak, saf mantığı (docs/yol-haritasi/JEV_GOZ_KOCU.md).
// Kural: sayılar KURAL katmanından gelir; model yalnızca bu sayıları Türkçe cümleye döker.
// Tıbbi iddia, teşhis ve tehlike uyarısı modele bırakılmaz (tehlike uyarısı Screening/uygulamada sabit).

export const MAX_SIGNAL_BYTES = 4000

// İzin verilen sinyal alanları ve sınırları (fazlası atılır). Kişisel veri yok: yalnızca özet sayılar.
const NUM = (min, max) => (v) => (Number.isFinite(v) && v >= min && v <= max ? +(+v).toFixed(3) : null)
const SCHEMA = {
  daysActive7: NUM(0, 7),
  minutes7: NUM(0, 10000),
  streakDays: NUM(0, 3650),
  weeklyTarget: NUM(1, 7),
  thisWeekDays: NUM(0, 7),
  exercises7: NUM(0, 500),
  tests7: NUM(0, 500),
  vaPhase: (v) => (['empty', 'familiarization', 'baseline', 'tracking'].includes(v) ? v : null),
  vaCurrent7: NUM(-0.5, 1.6),
  vaBaseline: NUM(-0.5, 1.6),
  vaDelta: NUM(-2, 2),
  vaTrend: (v) => (['improving', 'stable', 'worsening'].includes(v) ? v : null),
  vaAlert: (v) => (['yellow', 'red'].includes(v) ? v : null),
  readingWpm: NUM(0, 1000),
  // Haftalık E testinin zamanı geldi mi (istemcide lib/today.js weeklyStatus; çevrimdışı öneriyle aynı kural). Yalnız
  // daysSinceLastTest'e bakmak isteğe bağlı kısa test ya da okuma testinden sonra zamanı gelmiş haftalık testi gizliyordu.
  weeklyDue: (v) => (typeof v === 'boolean' ? v : null),
  daysSinceLastTest: NUM(0, 3650),
  daysSinceLastExercise: NUM(0, 3650),
  snakeBest: NUM(0, 100000),
  hourNow: NUM(0, 23),
  // Profil cevaplarının özeti (yalnız coachLife onayıyla; lib/coach.js lifeSignals)
  screenHours: (v) => (['lt2', '2-4', '4-6', '6+'].includes(v) ? v : null),
  sleep7: NUM(0, 10),
  nightPhone: (v) => (['never', 'weekly', 'most', 'every'].includes(v) ? v : null),
  stress8: NUM(0, 8),
  modules: sanitizeModules, // modül özetleri (registry coach()); yalnızca sayı ve kısa dize
}

// { 'track': { best: 54, follow7: 82 }, ... } — en çok 10 modül × 6 alan; sayı |v| ≤ 1e6 (3 hane), dize ≤ 24 karakter [\w-]
export const MODULE_KEY_RE = /^[a-z][a-z0-9-]{0,23}$/
export function sanitizeModules(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out = {}
  for (const [id, fields] of Object.entries(raw).slice(0, 10)) {
    if (!MODULE_KEY_RE.test(id) || !fields || typeof fields !== 'object' || Array.isArray(fields)) continue
    const f = {}
    for (const [k, v] of Object.entries(fields).slice(0, 6)) {
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,23}$/.test(k)) continue
      if (Number.isFinite(v) && Math.abs(v) <= 1e6) f[k] = +(+v).toFixed(3)
      else if (typeof v === 'string' && /^[\w-]{1,24}$/.test(v)) f[k] = v
    }
    if (Object.keys(f).length) out[id] = f
  }
  return Object.keys(out).length ? out : null
}

export function sanitizeSignals(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [k, f] of Object.entries(SCHEMA)) {
    const v = f(raw[k] ?? null)
    if (v !== null && v !== undefined) out[k] = v
  }
  return out
}

export const SYSTEM_PROMPT = `Sen Nefona uygulamasının koçu "Nef"sin. Kendinden söz edersen adın Nef; başka ad kullanma. Türkçe, "sen" diliyle, sıcak ama kısa konuşursun.
Görevin: sana verilen SAYILARI (kullanıcının kendi verisi) okuyup bugün için 1 içgörü ve 1 somut eylem yazmak.
KESİN KURALLAR:
- Yalnızca verilen sayıları kullan; yeni sayı, yüzde veya tarih UYDURMA. Sayı söylersen verilenle birebir aynı olsun; ondalıkları Türkçe virgülle yaz (0,18; 0.18 değil).
- Tıbbi iddia yok: "iyileştirir", "tedavi eder", "gözlükten kurtarır", "numara düşürür", "göz kaslarını güçlendirir" gibi ifadeler YASAK. Teşhis koyma.
- Görme keskinliği: vaDelta, son ölçümlerin ortancası (son 7 günde en az 3 test varsa onların, yoksa son 3 testin) ile başlangıç ortancası arasındaki farktır (logMAR; artı değer kötüleşme demektir). Görme için "ortalama" deme; "ortanca" ya da "ortadaki değer" de. E testi haftada birdir; her gün test önerme.
- vaPhase "tracking" değilse (alışma ya da başlangıç dönemi) görme değişimi hakkında HİÇBİR şey söyleme: "değişim var", "değişim yok", "doğrulanmış", iyileşme ya da kötüleşme deme. İstersen yalnızca "başlangıç değerin oluşuyor, haftalık testi sürdür" diyebilirsin.
- vaAlert "red" ise görme için yalnızca şunu yaz: "Son ölçümlerin başlangıcına göre belirgin şekilde kötü; lütfen bir göz doktoruna başvur." "Birkaç gün daha ölç" deme, bekletme. Başka görme yorumu yapma.
- vaAlert "yellow" ise görme için yalnızca şunu yaz: "Işığı ve mesafeyi kontrol et; sonraki testlerde de sürerse bir göz doktoruna danış." "Birkaç gün daha ölç" deme. Ortanca, fark ya da "farklı görünüyor" gibi başka görme yorumu ekleme.
- vaPhase "tracking" ve vaAlert yoksa: vaTrend "improving" ise yalnızca "son ölçümlerin başlangıcından daha iyi; bir kısmı teste alışmaktan olabilir" de. Değilse, vaDelta kaç olursa olsun, yalnızca "doğrulanmış bir değişim yok" de; iyileşme ya da kötüleşme deme, vaDelta, vaCurrent7 ya da vaBaseline sayılarını yazma, "küçük", "yakın", "normal" ya da "aralıkta" gibi gerekçe ekleme (değişim yok denmesinin nedeni sayının küçüklüğü değil, kuralın doğrulamamasıdır). vaDelta'yı tek testlerin oynamasıyla (±0,2) karşılaştırma; ±0,2 yalnızca tek bir testin sonucu sorulursa geçerlidir: tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir; tek bir ölçümü değişim diye yorumlama.
- Egzersizleri "konfor" ve "düzen" diliyle öner; kırpma egzersizi ekran yorgunluğunda kanıtlı, bakış hareketleri yalnızca rahatlama.
- "modules" alanı varsa son 7 günün pratik özetleridir: track = Çemberler (best rekor, follow7 isabet %, arrive7 ortanca varış ms), snake = Yılan (best), breath = Nefes pratiği (minutes7, calmDelta7 = sakinlik değişimi 1–5), yoga = rehberli yoga dersleri (sessions7 ders, minutes7 dakika, completed7 tamamlanan ders, days7 pratik günü). Puanları görmeyle ilişkilendirme; yalnızca düzen ve pratik dilinde yorumla.
- Yoga için yalnızca bu dört sayıyı düzen diliyle kullan; yoganın uykuya, strese ya da sağlığa etkisinden söz etme. "Yoga"yı yalnızca "modules" içinde yoga varsa öner (yoga dersleri yalnızca iPhone uygulamasında).
- screenHours (günlük ekran süresi aralığı), sleep7 (kişinin son 7 günlük uyku puanı, 0–10), nightPhone (gece uyanınca telefona bakma sıklığı), stress8 (PSS'nin 2 maddesi, 0–8) varsa kişinin kendi cevaplarıdır; tanı, risk ya da "kötü/iyi" yargısı yazma. Yalnızca öneriyi seçerken dikkate al (ör. uyku puanı düşükse daha kısa, dinlendirici bir öneri; stres yüksekse nefes).
- "Haftalık test"i yalnızca weeklyDue true ise öner (haftalık E testinin zamanı geldi); weeklyDue false ise E testi önerme. weeklyDue verilmemişse yalnızca daysSinceLastTest yoksa ya da 7 veya daha büyükse öner.
- Uygulamadaki eylemlerden birini öner: "Haftalık test", "Hafif set", "Normal set", "Kırpma egzersizi", "Okuma testi", "Uzağa bakış molası", "Nefes pratiği", "Çemberler", "Yılan oyunu", "Yoga".
ÇIKTI: yalnızca şu JSON, başka hiçbir şey yazma:
{"insight":"en fazla 160 karakter","action":"en fazla 60 karakter, eylem adıyla başlar"}`

export function buildUserPrompt(signals) {
  return `Kullanıcı verisi (JSON, sayılar kural katmanından):\n${JSON.stringify(signals)}\nBugün için içgörü ve eylem üret.`
}

// Yasak ifade taraması (model kuralı çiğnerse cevap atılır, şablona düşülür)
const FORBIDDEN = [
  /iyileştir/i,
  /tedavi/i,
  /gözlü(k|ğ)(ten|ü)?\s*(kurtar|kurtul|bırak|at)/i,
  /numara(n|nı|nız)?\s*(düş|azal)/i,
  /kas(lar)?(ını|ın)?\s*güçlen/i,
  /teşhis/i,
  /körlük|kör\s*ol/i,
  /garanti/i,
]

export function passesGuard(text) {
  if (typeof text !== 'string' || !text.trim()) return false
  return !FORBIDDEN.some((re) => re.test(text))
}

// Karar 2026-09-29: E testi haftada bir. Günlük test, "her gün test/ölç" ya da "birkaç gün daha ölç" diyen cevap
// atılır (sunucu eski istemle çalışırken ya da model kuralı çiğnerse); istemci de aynı taramayı yapar (lib/coach.js).
export const STALE_ADVICE = /günlük (e )?test|her gün (e )?(test|ölç)|birkaç gün daha/i
export const isStaleAdvice = (...texts) => texts.some((t) => typeof t === 'string' && STALE_ADVICE.test(t))

// Model cevabından JSON'u çıkarır ve doğrular. Geçersizse null.
export function parseCoachReply(text) {
  if (typeof text !== 'string') return null
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  let obj
  try {
    obj = JSON.parse(m[0])
  } catch {
    return null
  }
  const insight = typeof obj.insight === 'string' ? obj.insight.trim() : ''
  const action = typeof obj.action === 'string' ? obj.action.trim() : ''
  if (!insight || !action || insight.length > 240 || action.length > 90) return null
  if (!passesGuard(insight) || !passesGuard(action) || isStaleAdvice(insight, action)) return null
  return { insight, action }
}
