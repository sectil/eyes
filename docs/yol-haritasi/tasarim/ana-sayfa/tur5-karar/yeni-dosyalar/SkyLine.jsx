import { useEffect, useState } from 'react'
import { Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind } from 'lucide-react'
import { loadCache, ageHours, PAGE_MAX_AGE_H } from '../lib/sky.js'
import { hourStrip, rainSpan, nowView, loadAttribution, ATTR_FALLBACK } from '../lib/skyView.js'
import { RAIN_CHANCE } from '../lib/weatherNotify.js'

// Ana sayfa · hava satırı (B2 tasarımı bildirim-hava-yuruyus/tasarim.html tpl-home: "Adımların üstünde tek kart: il,
// ilçe, sıcaklık, yağmur saati; sağda Apple Weather ve Veri kaynakları bağlantısı; 320'de il adı düşer, ilçe kısalmaz").
// Veri yalnız hava önbelleğinden (lib/sky.js loadCache; istek hava sayfasında yapılır). Önbellek yoksa ya da 12 saatten
// eskiyse (PAGE_MAX_AGE_H) satır hiç çizilmez, yer kaplamaz. Metinler tasarımdaki gibi; yeni cümle yok.
//   place: { il, ilce } (App: SKY_UI + weather rızası + kayıtlı yer) · now · onOpen(): hava sayfası ('sky')
//   deps (test): { storage, plugin }
const ICONS = { sun: Sun, moon: Moon, cloud: Cloud, cloudSun: CloudSun, cloudMoon: CloudMoon, rain: CloudRain, drizzle: CloudDrizzle, bolt: CloudLightning, snow: CloudSnow, fog: CloudFog, wind: Wind }
const BARS = 12
const AXIS = [0, 3, 6, 9, 11]

export function skyLineView(place, cache, now = new Date()) {
  if (!place?.il || !cache) return null
  const age = ageHours(cache, now)
  if (!(age >= 0 && age < PAGE_MAX_AGE_H)) return null
  const v = nowView(cache.data, now)
  if (!v) return null
  const strip = hourStrip(cache.data?.hours, now, BARS)
  const rain = rainSpan(cache.data?.hours, now)
  return {
    temp: v.temp,
    icon: rain ? 'rain' : v.icon,
    il: place.ilce ? place.il : null,
    name: place.ilce || place.il,
    rain: rain ? `${rain.from}–${rain.to} yağmur bekleniyor` : null,
    bars: strip.map((h) => ({ at: h.at, h: Math.max(5, h.chance), r: h.chance >= RAIN_CHANCE * 100 })),
    axis: strip.length >= BARS ? AXIS.map((i) => (i === 0 ? 'şimdi' : strip[i].label)) : [],
  }
}

export default function SkyLine({ place, now = new Date(), onOpen, deps = {} }) {
  const [attr, setAttr] = useState(ATTR_FALLBACK)
  const v = skyLineView(place, loadCache(deps.storage), now)
  useEffect(() => {
    let alive = true
    if (v) loadAttribution(deps.plugin).then((a) => { if (alive) setAttr(a) })
    return () => { alive = false }
  }, [Boolean(v)]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return null
  const Icon = ICONS[v.icon] ?? Cloud
  const label = [v.il, v.name].filter(Boolean).join(' ')
  return (
    <section className="wxc" aria-label="Hava">
      <button type="button" className="wxc-main" onClick={onOpen} aria-label={`${label}, ${v.temp}${v.rain ? `, ${v.rain}` : ''}. Hava sayfasını aç`}>
        <span className="wxc-top">
          <span className="wxc-deg">{v.temp}</span>
          <span className="wxc-tx">
            <b>{v.il && <span className="il">{`${v.il} `}</span>}{v.name}</b>
            {v.rain && <span className="rain">{v.rain}</span>}
          </span>
          <Icon className={`wxc-ic${v.rain ? ' r' : ''}`} size={28} aria-hidden="true" />
        </span>
        {v.bars.length > 0 && (
          <span className="wxc-bars" aria-hidden="true">
            {v.bars.map((b) => <i key={b.at} className={b.r ? 'r' : ''} style={{ height: `${b.h}%` }} />)}
          </span>
        )}
        {v.axis.length > 0 && <span className="wxc-ax" aria-hidden="true">{v.axis.map((t, i) => <span key={i}>{t}</span>)}</span>}
      </button>
      <div className="wxc-attr">
        <span>{attr.serviceName}</span>
        <a href={attr.legalPageURL} target="_blank" rel="noreferrer">Veri kaynakları</a>
      </div>
    </section>
  )
}
