// Hava (B2; PLAN.v1 §3.B, §5.5 madde 7). Köprü: ios/App/App/SkyPlugin.swift (WeatherKit Swift çerçevesi; anahtar yok,
// entitlement ile çalışır; iOS 16+). Web'de ve iOS 15'te hava yoktur (bölüm görünmez).
//   - Koordinat 2 ondalığa yuvarlanır (41.0082 → 41.01), yalnız WeatherKit'e gider, saklanmaz. Önbellekte koordinat yok.
//   - Konum yalnız "Kullanırken", varsayılan yaklaşık (Swift: requestWhenInUseAuthorization; kesinlik iOS'un seçimi).
//   - Önbellek gozolcum:sky-cache { at, data }; son 90 günün günlük özeti gozolcum:sky-days [{ date, … }].
//   - weather rızası kapanınca ilk açılışta il ve ilçe adı, önbellek ve hava özeti silinir (enforceWeatherConsent).
import { registerPlugin } from '@capacitor/core'
import { isIOSApp } from './native.js'
import { hasConsent } from './consent.js'
import { SKY_PLACE_KEY } from './places.js'

// DİKKAT (Bug 15, native.js): eklenti nesnesi async fonksiyondan döndürülmez; yalnız sonuç nesneleri döner.
export const SkyPlugin = registerPlugin('Sky')

export const SKY_CACHE_KEY = 'gozolcum:sky-cache'
export const SKY_DAYS_KEY = 'gozolcum:sky-days'
export const SKY_KEYS = [SKY_PLACE_KEY, SKY_CACHE_KEY, SKY_DAYS_KEY] // "Tüm verileri sil" ve rıza geri çekme
export const PAGE_MAX_AGE_H = 12 // çevrimdışıyken son veri 12 saatten gençse gösterilir (§3.B.3)
export const STALE_H = 18 // bildirim anında tahmin 18 saatten eski olacaksa sabah havası kurulmaz (§3.B.4)
export const DAYS_KEEP = 90
const H = 3600000

// Onaylı metinler (PLAN.v1 §3.B.3)
export const SKY_TEXT = {
  offline: 'Hava için internet gerekiyor.',
  error: 'Hava bilgisi şu an alınamadı.',
}

// Onaylı metni olmayan etiketler için yer tutucu (yeni kullanıcı cümlesi yazılmaz; sahip onayı bekler)
export const PH = (key) => `[[${key}]]`

export const roundCoord = (x) => Math.round(Number(x) * 100) / 100
export function roundPoint(p) {
  if (!p || !Number.isFinite(Number(p.lat)) || !Number.isFinite(Number(p.lon))) return null
  return { lat: roundCoord(p.lat), lon: roundCoord(p.lon) }
}

// iOS 16+ yerel uygulama. iosMajor bilinmiyorsa (eski derleme) yok sayılır.
export function skySupported({ native, iosMajor }) {
  if (!native) return false
  return iosMajor == null ? true : Number(iosMajor) >= 16
}

// Swift isAvailable → { available, iosMajor } (SkyPlugin.swift). available iOS 16+ demektir; iosMajor yalnız ek denetim.
export async function skyAvailable(plugin = SkyPlugin, native = isIOSApp()) {
  if (!native) return false
  try {
    const r = await plugin.isAvailable()
    return Boolean(r?.available) && skySupported({ native, iosMajor: r?.iosMajor })
  } catch {
    return false // eklentisi olmayan eski derleme ya da iOS 15
  }
}

// iOS konum izni ("Kullanırken"; yaklaşık varsayılan). Rıza sayfasından SONRA çağrılır.
// precise: true yalnız "kişi kesin konumu kendisi açtıysa kullan" demektir (Swift kesinlik istemez; Info.plist
// NSLocationDefaultAccuracyReduced). Yaklaşık ya da kesin, il ve en yakın ilçe kendiliğinden seçilir (places.js
// placeFromLocation; sahip kararı 2026-10-01); G yolu ("…'de misin?") akıştan çıktı.
// Döner: { status: 'granted'|'denied'|'unavailable', accuracy: 'full'|'reduced'|null, pos: { lat, lon } yuvarlanmış|null }
const GRANTED = new Set(['whenInUse', 'always'])
export async function requestLocation(plugin = SkyPlugin, native = isIOSApp()) {
  if (!native) return { status: 'unavailable', accuracy: null, pos: null }
  try {
    const r = await plugin.requestLocation({ precise: true })
    // SkyPlugin.swift izin verilmişse 'whenInUse' ya da 'always' döner ('granted' diye bir değer yok; Build 70'te
    // konum hep listeye düşüyordu, sahip 2026-10-01). Konum gelmediyse (lat/lon yok) yine liste.
    if (!GRANTED.has(r?.status) || roundPoint(r) == null) return { status: r?.status === 'denied' || r?.status === 'restricted' ? 'denied' : 'unavailable', accuracy: null, pos: null }
    return { status: 'granted', accuracy: r.accuracy === 'full' ? 'full' : 'reduced', pos: roundPoint(r) }
  } catch {
    return { status: 'unavailable', accuracy: null, pos: null }
  }
}

const ls = () => { try { return globalThis.localStorage ?? null } catch { return null } }
const readJSON = (s, k, d) => { try { const v = JSON.parse(s?.getItem(k) ?? 'null'); return v ?? d } catch { return d } }
const writeJSON = (s, k, v) => { try { s?.setItem(k, JSON.stringify(v)) } catch { /* yoksay */ } }

export function loadCache(storage = ls()) {
  const c = readJSON(storage, SKY_CACHE_KEY, null)
  return c && typeof c.at === 'string' && c.data && typeof c.data === 'object' ? c : null
}

// Swift forecast yanıtının asgari şeması: { fetchedAt, now?, hours: [], days: [], rain? }
export function validForecast(d) {
  return Boolean(d) && typeof d === 'object' && Number.isFinite(d.fetchedAt) && Array.isArray(d.hours) && Array.isArray(d.days)
}

// Hava isteği: nokta (ilçe/il merkezi ya da kişinin konumu) yuvarlanarak gider; önbelleğe yalnız zaman ve veri yazılır.
// Çevrimdışıysa istek yapılmaz. Hata olursa önbellek değişmez.
export async function fetchWeather(point, { plugin = SkyPlugin, online = true, now = new Date(), storage = ls() } = {}) {
  const p = roundPoint(point)
  if (!p) return { ok: false, reason: 'place' }
  if (!online) return { ok: false, reason: 'offline' }
  try {
    const data = await plugin.forecast({ lat: p.lat, lon: p.lon }) // SkyPlugin.swift: forecast
    if (!validForecast(data)) return { ok: false, reason: 'error' }
    const { lat: _a, lon: _b, ...clean } = data // yanıtta koordinat dönse de saklanmaz
    const cache = { at: now.toISOString(), data: clean }
    writeJSON(storage, SKY_CACHE_KEY, cache)
    return { ok: true, cache }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

// Yer değişince eski yerin tahmini kullanılmaz (önbellekte yer yok): App "Değiştir" sonrası siler.
export function clearCache(storage = ls()) {
  try { storage?.removeItem(SKY_CACHE_KEY) } catch { /* yoksay */ }
}

export const ageHours = (cache, now = new Date()) => (cache ? (now - new Date(cache.at)) / H : Infinity)

// Bildirim anında (at) tahmin 18 saatten eskiyse kurulmaz
export function notifyUsable(cache, at) {
  const a = ageHours(cache, at)
  return a >= 0 && a <= STALE_H
}

// Hava sayfası ve satır durumu (§3.B.3):
//   hidden  — web ya da iOS 15 (hava yok)
//   live    — çevrimiçi, veri alındı
//   cached  — çevrimdışı ya da hata; önbellek < 12 sa (son veri ve yaşı)
//   offline — çevrimdışı, önbellek yok ya da eski: "Hava için internet gerekiyor."
//   error   — WeatherKit hatası, önbellek yok ya da eski: "Hava bilgisi şu an alınamadı."
export function skyState({ supported, online, cache, error = false, now = new Date() }) {
  if (!supported) return { kind: 'hidden' }
  const age = ageHours(cache, now)
  const usable = cache && age >= 0 && age < PAGE_MAX_AGE_H
  if (online && !error && cache && age >= 0 && age < 1) return { kind: 'live', cache }
  if (usable && (!online || error)) return { kind: 'cached', cache, age }
  if (!online) return { kind: 'offline', text: SKY_TEXT.offline }
  if (error) return { kind: 'error', text: SKY_TEXT.error }
  return usable ? { kind: 'cached', cache, age } : { kind: 'loading' }
}

// Saat ve eki: "12.40'ta", "12.00'de", "13.30'da" (sayı okunuşunun son sözcüğüne göre)
const ONES = ['da', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da'] // sıfır bir iki üç dört beş altı yedi sekiz dokuz
const TENS = [null, 'da', 'de', 'da', 'ta', 'de'] // on yirmi otuz kırk elli
function numSuffix(n) {
  if (n === 0) return 'da'
  return n % 10 ? ONES[n % 10] : TENS[n / 10]
}
export function clockWithSuffix(d) {
  const h = d.getHours(), m = d.getMinutes()
  const txt = `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`
  return `${txt}'${m ? numSuffix(m) : numSuffix(h)}`
}

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

// Verinin yaşı (§3.B.3: "İzmir Gaziemir · 12.40'ta alındı"). Bugün alınmadıysa onaylı metin yok → yer tutucu.
export function ageText(at, now = new Date()) {
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return ''
  if (dayKey(d) === dayKey(now)) return `${clockWithSuffix(d)} alındı`
  return PH('sky.yas.oncekiGun')
}

export function placeAgeLine(label, at, now = new Date()) {
  const a = ageText(at, now)
  return a ? `${label} · ${a}` : label
}

// Son 90 günün günlük hava özeti: günde tek kayıt (aynı gün üzerine yazılır), 90 günden eskisi atılır
export function recordDay(summary, { storage = ls(), now = new Date() } = {}) {
  if (!summary?.date) return loadDays(storage)
  const cut = new Date(now.getTime() - DAYS_KEEP * 86400000).toISOString().slice(0, 10)
  const days = loadDays(storage).filter((d) => d.date !== summary.date && d.date > cut)
  const next = [...days, summary].sort((a, b) => (a.date < b.date ? -1 : 1))
  writeJSON(storage, SKY_DAYS_KEY, next)
  return next
}
export function loadDays(storage = ls()) {
  const v = readJSON(storage, SKY_DAYS_KEY, [])
  return Array.isArray(v) ? v.filter((d) => d && typeof d.date === 'string') : []
}

// İl ve ilçe adı, önbellek ve hava özeti
export function clearSkyData(storage = ls()) {
  for (const k of SKY_KEYS) { try { storage?.removeItem(k) } catch { /* yoksay */ } }
}

// Açılışta: weather rızası yoksa (hiç verilmedi, geri çekildi) hava verisi silinir. Döner: silindi mi
export function enforceWeatherConsent(consents, storage = ls()) {
  if (hasConsent(consents, 'weather')) return false
  const had = SKY_KEYS.some((k) => { try { return storage?.getItem(k) != null } catch { return false } })
  if (had) clearSkyData(storage)
  return had
}
