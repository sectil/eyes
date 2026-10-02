import { useEffect, useState } from 'react'
import { ChevronRight, CloudRain, Cloud, CloudSun, Sun, Moon, CloudMoon, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind } from 'lucide-react'
import { loadCache, ageHours, PAGE_MAX_AGE_H } from '../../lib/sky.js'
import { rainSpan, nowView, loadAttribution, ATTR_FALLBACK } from '../../lib/skyView.js'
import { WxMark } from '../WeatherAttr.jsx'

// Ana sayfa · ilk görünümde hava (sahibin isteği 2026-10-01, D9): selamın altındaki hap satırında küçük ve okunur:
// "Gaziemir 23° · 21.00'de yağmur". Veri yalnız hava önbelleğinden (lib/sky.js loadCache; istek hava sayfasında); önbellek
// yoksa ya da 12 saatten eskiyse hap yok. Ad: ilçe (yoksa il). Dokununca hava sayfası ('sky'). Önceki hava satırı
// (SkyLine: saatlik şerit) ilk görünümde değerlendiricilerde kaldı ("yükleme çubuğu"); şerit hava sayfasında.
const ICONS = { sun: Sun, moon: Moon, cloud: Cloud, cloudSun: CloudSun, cloudMoon: CloudMoon, rain: CloudRain, drizzle: CloudDrizzle, bolt: CloudLightning, snow: CloudSnow, fog: CloudFog, wind: Wind }

// Saatin bulunma eki ("21.00'de", "16.00'da", "13.00'te"): saat okunduğu gibi (yirmi bir, on altı, on üç); tur 2'de
// "21.00 yağmur" "şu an mı yağıyor?" diye okundu
const HOUR_SUFFIX = ['da', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da']
export const atHour = (hh) => {
  const h = Number(String(hh).slice(0, 2))
  if (!Number.isFinite(h)) return hh
  const suf = h === 0 ? 'da' : h % 10 ? HOUR_SUFFIX[h % 10] : { 10: 'da', 20: 'de' }[h]
  return `${hh}'${suf}`
}

export function skyChipView(place, cache, now = new Date()) {
  if (!place?.il || !cache) return null
  const age = ageHours(cache, now)
  if (!(age >= 0 && age < PAGE_MAX_AGE_H)) return null
  const v = nowView(cache.data, now)
  if (!v) return null
  const rain = rainSpan(cache.data?.hours, now)
  return { name: place.ilce || place.il, temp: v.temp, rain: rain ? `${atHour(rain.from)} yağmur` : null, icon: rain ? 'rain' : v.icon }
}

// Apple Weather işareti (sahibin kararı 4, D9 v2): hapın içinde küçük; hava sayfasındaki atfın aynısı (screens/Sky.jsx
// .wx-mark: temanın işaret görseli, yoksa metin işaret "Apple Weather"; lib/skyView.js ATTR_FALLBACK). Yasal sayfa bağlantısı
// hava sayfasında (hap oraya açılır).
export function SkyMark({ attr = ATTR_FALLBACK }) {
  return <WxMark attr={attr} className="hh-sky-mark" />
}

export default function SkyChip({ place, now = new Date(), onOpen, storage, plugin }) {
  const v = skyChipView(place, loadCache(storage), now)
  const [attr, setAttr] = useState(ATTR_FALLBACK)
  useEffect(() => {
    let alive = true
    if (v) loadAttribution(plugin).then((a) => { if (alive) setAttr(a) })
    return () => { alive = false }
  }, [Boolean(v)]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return null
  const Icon = ICONS[v.icon] ?? Cloud
  const text = [`${v.name} ${v.temp}`, v.rain].filter(Boolean).join(' · ')
  return (
    <button type="button" className={`hh-fact sky${v.rain ? ' r' : ''}`} onClick={onOpen} aria-label={`Hava: ${text}. ${attr.serviceName}. Hava sayfasını aç`}>
      <Icon size={16} aria-hidden="true" />
      <span className="hh-sky-tx">
        <span>{text}</span>
        <SkyMark attr={attr} />
      </span>
      <ChevronRight size={16} aria-hidden="true" className="chev" />
    </button>
  )
}
