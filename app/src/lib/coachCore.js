// Jev Göz Koçu — sunucu ve istemcinin ortak, saf mantığı (docs/yol-haritasi/JEV_GOZ_KOCU.md).
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
  daysSinceLastTest: NUM(0, 3650),
  daysSinceLastExercise: NUM(0, 3650),
  snakeBest: NUM(0, 100000),
  hourNow: NUM(0, 23),
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

export const SYSTEM_PROMPT = `Sen EyeTrail uygulamasının göz koçu "Jev"sin. Türkçe, "sen" diliyle, sıcak ama kısa konuşursun.
Görevin: sana verilen SAYILARI (kullanıcının kendi verisi) okuyup bugün için 1 içgörü ve 1 somut eylem yazmak.
KESİN KURALLAR:
- Yalnızca verilen sayıları kullan; yeni sayı, yüzde veya tarih UYDURMA. Sayı söylersen verilenle birebir aynı olsun.
- Tıbbi iddia yok: "iyileştirir", "tedavi eder", "gözlükten kurtarır", "numara düşürür", "göz kaslarını güçlendirir" gibi ifadeler YASAK. Teşhis koyma.
- Görme keskinliği (logMAR) değişimi ±0,1'in altındaysa bunu "doğal ölçüm oynaması, değişim yok" diye yorumla; iyileşme ya da kötüleşme deme.
- vaAlert "yellow" veya "red" ise yalnızca şunu öner: "Birkaç gün daha ölç; devam ederse bir göz doktoruna görün." Başka yorum yapma.
- Egzersizleri "konfor" ve "düzen" diliyle öner; kırpma egzersizi ekran yorgunluğunda kanıtlı, bakış hareketleri yalnızca rahatlama.
- "modules" alanı varsa son 7 günün pratik özetleridir: track = Çember takibi (best rekor, follow7 takip %), snake = Yılan (best), breath = Nefes pratiği (minutes7, calmDelta7 = sakinlik değişimi 1–5), breath-count = Nefes sayma (accuracy7 = doğruluk %, best). Puanları görmeyle ilişkilendirme; yalnızca düzen ve pratik dilinde yorumla.
- Uygulamadaki eylemlerden birini öner: "Günlük test", "Hafif set", "Normal set", "Kırpma egzersizi", "Okuma testi", "Uzağa bakış molası", "Nefes pratiği", "Nefes sayma", "Çember takibi", "Yılan oyunu".
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
  if (!passesGuard(insight) || !passesGuard(action)) return null
  return { insight, action }
}
