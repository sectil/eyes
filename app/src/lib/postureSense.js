// Dik Dur kamera (PLAN docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md §3; kamera araştırması arastirma-kamera.md). Saf.
// Ölçü mutlak değil: kişinin kendi "normal" ve "dik" duruşu (bir kez gösterilir) arasındaki çizgide şimdi nerede?
// Sinyaller TrueDepth karesinden (FaceDistancePlugin.swift): distanceMm (yüz–kamera uzaklığı; baş geriye kayınca artar,
// yalnız telefon yaslıyken anlamlı) ve headY (yüzün baktığı yön ile kameraya giden çizgi arasındaki dikey açı, derece;
// KAMERAYA göre, yer çekimine göre değil; baş öne eğilince azalır). Omuzlar önden görünmez: ölçülmez (§3.1).
// Eşikler VARSAYIM: cihaz denemesinde (Bilgi → Dik Dur kamera denemesi) gürültüye göre ayarlanacak.

export const D_SCALE_MM = 10 // uzaklıkta 10 mm ≈ eğimde 1° (iki birimi aynı ölçeğe getirmek için; VARSAYIM)
export const P_SCALE_DEG = 1
export const MIN_SEPARATION = 2 // normal ile dik arası en az bu kadar (ölçekli); azsa kamera yargılamaz
export const IN_POSE = 0.6 // çizginin en az %60'ı: dik duruşunda sayılır
export const NOD_DEG = 4 // dik duruşa göre baş bundan çok öne eğikse "başını eğme"
export const FIX_AFTER_MS = 2000 // bu kadar süre dik duruşta değilse düzeltme
export const MAX_FIXES = 3 // her hareket için oturumda en çok (Egzersiz setleri MAX_REMINDERS ile aynı)
export const CALIB_KEY = 'eyes.dikDur.calib.v1'
export const CAM_KEY = 'eyes.dikDur.cam.v1'

const fin = (x) => typeof x === 'number' && Number.isFinite(x)
const median = (arr) => {
  const s = arr.filter(fin).sort((a, b) => a - b)
  if (!s.length) return null
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// TrueDepth karesi → { d, p } ya da null (yüz yok ya da değer eksik)
export function sampleOf(f) {
  if (!f || !f.face) return null
  const d = fin(f.mm) ? f.mm : fin(f.distanceMm) ? f.distanceMm : null
  const p = fin(f.headY) ? f.headY : null
  return d == null || p == null ? null : { d, p }
}

// Örnekler → ortanca duruş { d, p } ya da null
export function poseOf(samples) {
  const list = (Array.isArray(samples) ? samples : []).filter(Boolean)
  if (list.length < 5) return null
  const d = median(list.map((s) => s.d))
  const p = median(list.map((s) => s.p))
  return d == null || p == null ? null : { d, p }
}

const vec = (a, b) => [(b.d - a.d) / D_SCALE_MM, (b.p - a.p) / P_SCALE_DEG]

// Ayar: { normal, tall, ok }. ok: iki duruş birbirinden yeterince ayrı (yoksa kamera yargılamaz; süreyle devam)
export function calibrate(normal, tall) {
  if (!normal || !tall) return { normal: normal ?? null, tall: tall ?? null, ok: false }
  const [x, y] = vec(normal, tall)
  return { normal, tall, ok: Math.hypot(x, y) >= MIN_SEPARATION }
}

// Şimdiki örneğin normal→dik çizgisindeki yeri (0 normal, 1 dik; dışına taşabilir)
export function progressOf(cal, s) {
  if (!cal?.ok || !s) return null
  const [ax, ay] = vec(cal.normal, cal.tall)
  const [bx, by] = vec(cal.normal, s)
  const len2 = ax * ax + ay * ay
  return len2 > 0 ? (ax * bx + ay * by) / len2 : null
}

// Hareketin yargısı: { inPose, fix: null | 'fix' } (yalnız kamerayla doğrulanan hareketlerde; omuz değil)
export function judge(cal, s, move) {
  const t = progressOf(cal, s)
  if (t == null) return { inPose: null, nod: false }
  const nod = move === 'cene' && s.p - cal.tall.p < -NOD_DEG
  return { inPose: t >= IN_POSE && !nod, nod }
}

// Yüzde ve bulunma eki: %80'inde, %50'sinde, %40'ında, %100'ünde (okunuşun son sözcüğüne göre)
const ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']
const VOWELS = 'aeıioöuü'
export function percentLoc(n) {
  const k = Math.max(0, Math.min(100, Math.round(n)))
  const w = k === 100 ? 'yüz' : k % 10 ? ONES[k % 10] : k === 0 ? 'sıfır' : TENS[k / 10]
  const last = [...w].reverse().find((c) => VOWELS.includes(c))
  const high = { a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' }[last]
  const back = 'aıou'.includes(last)
  const endsVowel = VOWELS.includes(w[w.length - 1])
  return `%${k}'${endsVowel ? 's' : ''}${high}n${back ? 'da' : 'de'}`
}
// Bitiş satırı (metin-D1-onay.md §H): "Tuttuğun sürenin %80'inde dik duruşundaydın."
export const resultText = (frac) => `Tuttuğun sürenin ${percentLoc(frac * 100)} dik duruşundaydın.`

// Kayıtlı ayar ve kamera tercihi (yalnız sayılar; görüntü yok)
export function loadJson(storage, key) {
  try {
    const v = JSON.parse(storage?.getItem(key) ?? 'null')
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}
export function saveJson(storage, key, v) {
  try {
    storage?.setItem(key, JSON.stringify(v))
  } catch {
    // depolama yok
  }
}
