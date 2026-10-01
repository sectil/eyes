// Hava sayfasının saf görünüm hesapları (screens/Sky.jsx; PLAN.v1 §3.B.3, tasarım "07 Hava sayfası").
// Girdi SkyPlugin.forecast'ın önbellekteki verisi (lib/sky.js loadCache): { fetchedAt, now?, hours: [{ at, tempC,
// precipChance, symbol }], days: [{ date, highC, lowC, precipChance, symbol }], rain? }. Zaman ms, olasılık 0–1.
// Metin: yalnız onaylı ya da tasarımdaki cümleler; onaylı metni olmayan öğe gösterilmez (ekranda ham anahtar yok).
import { SkyPlugin } from './sky.js'
import { RAIN_CHANCE } from './weatherNotify.js'

const H = 3600000
const pad = (n) => String(n).padStart(2, '0')
const fin = (x) => Number.isFinite(Number(x)) && x !== null && x !== ''
export const deg = (c) => (fin(c) ? `${Math.round(Number(c))}°` : '—')
export const pct = (p) => Math.max(0, Math.min(100, Math.round((Number(p) || 0) * 100)))

// Gökyüzü sözcüğü: tasarımda yalnız "Parçalı bulutlu" var; ötekilerin onaylı metni yok → boş (satır gizlenir;
// eksik metin: sky.gok).
const WORD = { 'cloud.sun': 'Parçalı bulutlu', 'cloud.moon': 'Parçalı bulutlu' }
const base = (symbol) => String(symbol ?? '').replace(/\.fill$/, '')
export function skyWord(symbol) {
  const b = base(symbol)
  if (!b) return ''
  return WORD[b] ?? ''
}

// SF Symbols adı → simge anahtarı (screens/Sky.jsx lucide eşlemesi). Bilinmeyen: bulut.
export function iconKey(symbol) {
  const b = base(symbol)
  if (/bolt/.test(b)) return 'bolt'
  if (/snow|sleet|hail/.test(b)) return 'snow'
  if (/drizzle/.test(b)) return 'drizzle'
  if (/rain/.test(b)) return 'rain'
  if (/fog|haze|smoke|dust/.test(b)) return 'fog'
  if (/wind|tornado|hurricane/.test(b)) return 'wind'
  if (b === 'cloud.sun') return 'cloudSun'
  if (b === 'cloud.moon') return 'cloudMoon'
  if (/^sun/.test(b)) return 'sun'
  if (/^moon/.test(b)) return 'moon'
  return 'cloud'
}

const sorted = (hours) => (Array.isArray(hours) ? hours : []).filter((r) => fin(r?.at)).sort((a, b) => a.at - b.at)

// Saat saat şerit: şimdiki saatten başlayarak n saat (§3.B.3: 24). İlk sütun şimdiyi içeriyorsa "Şimdi" (tasarım).
//   → [{ at, label, temp, chance, chanceText, now }]
export function hourStrip(hours, now = new Date(), n = 24) {
  const t = now.getTime()
  return sorted(hours).filter((r) => r.at + H > t).slice(0, n).map((r) => {
    const isNow = r.at <= t && t < r.at + H
    const c = pct(r.precipChance)
    return { at: r.at, label: isNow ? 'Şimdi' : pad(new Date(r.at).getHours()), temp: deg(r.tempC), chance: c, chanceText: c ? `${c}%` : '—', now: isNow }
  })
}

// Şimdiden sonraki ilk kesintisiz yağmur aralığı (şerit içinde) → { from: 'HH.00', to: 'HH.00' } | null.
// Önbellekteki `rain` alanı alındığı ana göredir; bayat veride geçmişte kalabildiği için saatlerden yeniden bulunur.
export function rainSpan(hours, now = new Date(), n = 24) {
  const t = now.getTime()
  let span = null
  for (const r of sorted(hours).filter((x) => x.at + H > t).slice(0, n)) {
    if ((Number(r.precipChance) || 0) >= RAIN_CHANCE) {
      if (span) span.to = r.at + H
      else span = { from: r.at, to: r.at + H }
    } else if (span) break
  }
  if (!span) return null
  const hh = (ms) => `${pad(new Date(ms).getHours())}.00`
  return { from: hh(span.from), to: hh(span.to) }
}

// Nef'in yorumu. Yağmur varsa ilk cümle onaylı kalıp (PLAN.v1 §3.B.4, tasarım 07): "21.00–22.00 arası yağmur
// bekleniyor." Yürüyüşe bağlı ikinci cümle ve yağmursuz gün için onaylı metin yok → null (kart gizlenir;
// eksik metin: sky.nef.yagmurYok).
export function nefLine(hours, now = new Date()) {
  const r = rainSpan(hours, now)
  return r ? `${r.from}–${r.to} arası yağmur bekleniyor.` : null
}

// Günün en yükseği ve en düşüğü: bugünün satırı, yoksa ilk gün. → { high, low } | null
export function todayRange(days, now = new Date()) {
  const list = Array.isArray(days) ? days : []
  const key = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const d = list.find((x) => x?.date === key) ?? list[0]
  return d ? { high: deg(d.highC), low: deg(d.lowC) } : null
}

// Şimdiki hâl: forecast.now yalnız `at`ı şimdiki saatin içindeyse (canlı veri); değilse (1–12 sa önbellek) şimdiyi
// içeren saat satırı, o da yoksa şeridin ilk saati. Şeridin "Şimdi" sütunuyla aynı saat. → { temp, feels, word, icon } | null
const hourOf = (ms) => { const d = new Date(ms); d.setMinutes(0, 0, 0); return d.getTime() }
export function nowView(data, now = new Date()) {
  const t = now.getTime()
  const first = sorted(data?.hours).find((r) => r.at + H > t)
  const fresh = fin(data?.now?.at) && hourOf(Number(data.now.at)) === hourOf(t)
  const n = fresh ? data.now : first
  if (!n) return null
  return { temp: deg(n.tempC), feels: fin(n.apparentC) ? deg(n.apparentC) : null, word: skyWord(n.symbol), icon: iconKey(n.symbol) }
}

// Apple Weather atfı (Apple kuralı: işaret + yasal sayfa bağlantısı). Eklenti yanıt vermezse bilinen yasal sayfa
// ve metin işaretle ("Apple Weather") yine gösterilir; atıf hiçbir durumda düşmez.
export const ATTR_FALLBACK = Object.freeze({ serviceName: 'Apple Weather', legalPageURL: 'https://weatherkit.apple.com/legal-attribution.html', markLight: null, markDark: null })
export async function loadAttribution(plugin = SkyPlugin) {
  try {
    const a = await plugin.attribution()
    const url = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? u : null)
    return {
      serviceName: typeof a?.serviceName === 'string' && a.serviceName ? a.serviceName : ATTR_FALLBACK.serviceName,
      legalPageURL: url(a?.legalPageURL) ?? ATTR_FALLBACK.legalPageURL,
      markLight: url(a?.combinedMarkLightURL),
      markDark: url(a?.combinedMarkDarkURL),
    }
  } catch {
    return { ...ATTR_FALLBACK }
  }
}
