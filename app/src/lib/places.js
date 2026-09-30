// İl ve ilçe (B2 hava; PLAN.v1 §3.B.1, §5.5 madde 8). Tablo lib/places.data.js (GeoNames ADM1/ADM2, CC BY 4.0).
//   - Yaklaşık konumdan yalnız il bulunur ("İzmir" + "yaklaşık" etiketi); ilçe listeden seçilir.
//   - Kesin konum izni varsa en yakın ilçe merkezi TELEFONDA bulunur ve sorulur ("Gaziemir'de misin?"); ters coğrafi
//     kodlama yok (koordinat ikinci kez Apple'a gitmez).
//   - Kişinin koordinatı saklanmaz. Saklanan yalnız il ve ilçe adı, ayrı anahtarda: gozolcum:sky-place. Profildeki
//     şehir alanına (settings.profile / identity) YAZILMAZ; profil eşitlemesiyle Supabase'e gitmesin.
//   - Hava isteği ve sabah bildirimi için kullanılan nokta tablodaki kamusal noktadır (ilçe merkezi ya da ilin merkezi).
import { ILLER, PLACES } from './places.data.js'

export const SKY_PLACE_KEY = 'gozolcum:sky-place' // { il, ilce: string|null, approx: boolean }

const R = 6371 // km
const rad = (d) => (d * Math.PI) / 180
export function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const okCoord = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180

// En yakın ilçe merkezi (telefonda; tablo içinde). Döner: { il, ilce, lat, lon, km } | null
export function nearestPlace(pos, places = PLACES) {
  if (!okCoord(pos) || !places?.length) return null
  let best = null, bestKm = Infinity
  for (const p of places) {
    const km = distanceKm(pos, p)
    if (km < bestKm) { best = p; bestKm = km }
  }
  return best ? { ...best, km: bestKm } : null
}

// Konumdan öneri. accuracy: 'full' (kesin) | 'reduced' (yaklaşık, varsayılan).
//   yaklaşık → { il, ilce: null, approx: true, confirm: false } (ekran K: il bulundu, ilçe listeden)
//   kesin    → { il, ilce, approx: false, confirm: true }       (ekran G: "…'de misin?" [Evet] [Başka ilçe])
// Dönen nesnede koordinat yoktur.
export function suggestFromLocation(pos, accuracy = 'reduced', places = PLACES) {
  const n = nearestPlace(pos, places)
  if (!n) return null
  if (accuracy === 'full') return { il: n.il, ilce: n.ilce, approx: false, confirm: true }
  return { il: n.il, ilce: null, approx: true, confirm: false }
}

const coll = new Intl.Collator('tr')
export function ilList(iller = ILLER) {
  return iller.map((i) => i.il).sort(coll.compare)
}

export function ilceList(il, places = PLACES) {
  return places.filter((p) => p.il === il).map((p) => p.ilce).sort(coll.compare)
}

// Arama: Türkçe küçük harf, aksan duyarsız ("cesme" → Çeşme, "izmir" → İzmir)
const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }
export function fold(s) {
  return String(s ?? '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => FOLD[c]).trim()
}
export function searchIlce(il, q, places = PLACES) {
  const f = fold(q)
  const all = ilceList(il, places)
  if (!f) return all
  const starts = all.filter((n) => fold(n).startsWith(f))
  return [...starts, ...all.filter((n) => !starts.includes(n) && fold(n).includes(f))]
}

// Kamusal nokta: seçilen ilçenin merkezi, ilçe yoksa ilin merkezi. Hava isteğine giden budur (kişinin koordinatı değil).
export function placePoint(place, places = PLACES, iller = ILLER) {
  if (!place?.il) return null
  if (place.ilce) {
    const p = places.find((x) => x.il === place.il && x.ilce === place.ilce)
    if (p) return { lat: p.lat, lon: p.lon }
  }
  const i = iller.find((x) => x.il === place.il)
  return i ? { lat: i.lat, lon: i.lon } : null
}

// Yer adı: sıra her yerde il, ilçe ("İzmir Gaziemir")
export function placeLabel(place) {
  if (!place?.il) return ''
  return place.ilce ? `${place.il} ${place.ilce}` : place.il
}

export function normalizePlace(v, places = PLACES, iller = ILLER) {
  if (!v || typeof v !== 'object' || typeof v.il !== 'string') return null
  if (!iller.some((i) => i.il === v.il)) return null
  const ilce = typeof v.ilce === 'string' && places.some((p) => p.il === v.il && p.ilce === v.ilce) ? v.ilce : null
  return { il: v.il, ilce, approx: Boolean(v.approx) && !ilce }
}

const ls = () => { try { return globalThis.localStorage ?? null } catch { return null } }

export function loadPlace(storage = ls()) {
  try { return normalizePlace(JSON.parse(storage?.getItem(SKY_PLACE_KEY) ?? 'null')) } catch { return null }
}

// Yalnız il ve ilçe adı yazılır; koordinat ve profil alanı yok.
export function savePlace(place, storage = ls()) {
  const p = normalizePlace(place)
  if (!p) return null
  try { storage?.setItem(SKY_PLACE_KEY, JSON.stringify(p)) } catch { /* yoksay */ }
  return p
}

export function clearPlace(storage = ls()) {
  try { storage?.removeItem(SKY_PLACE_KEY) } catch { /* yoksay */ }
}

// Türkçe ekler (yer adına): bulunma ("Gaziemir'de", "Konak'ta", "Buca'da") ve belirtme ("İzmir'i", "Bursa'yı").
const VOWELS = 'aıoueiöü'
function lastVowel(name) {
  const s = String(name).toLocaleLowerCase('tr')
  for (let i = s.length - 1; i >= 0; i--) if (VOWELS.includes(s[i])) return s[i]
  return 'e'
}
const back = (v) => 'aıou'.includes(v)
export function locative(name) {
  const s = String(name).toLocaleLowerCase('tr')
  const hard = 'fstkçşhp'.includes(s[s.length - 1])
  return `${name}'${hard ? 't' : 'd'}${back(lastVowel(name)) ? 'a' : 'e'}`
}
export function accusative(name) {
  const s = String(name).toLocaleLowerCase('tr')
  const v = lastVowel(name)
  const x = { a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' }[v]
  return `${name}'${VOWELS.includes(s[s.length - 1]) ? 'y' : ''}${x}`
}
// Onay sorusu (G): "Gaziemir'de misin?" · "Mustafakemalpaşa'da mısın?" (soru eki bulunma ekinin ünlüsüne uyar)
export function confirmQuestion(ilce) {
  const loc = locative(ilce)
  return `${loc} ${loc.endsWith('a') ? 'mısın' : 'misin'}?`
}
