import { useEffect, useState } from 'react'
import { ChevronLeft, Bell, Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind } from 'lucide-react'
import { SkyPlugin, skyAvailable, loadCache, fetchWeather, skyState, ageText, ageHours, PH } from '../lib/sky.js'
import { placeLabel, placePoint } from '../lib/places.js'
import { hourStrip, nefLine, todayRange, nowView, loadAttribution, ATTR_FALLBACK } from '../lib/skyView.js'
import { isIOSApp } from '../lib/native.js'
import '../styles/info.css'
import WeatherAttr from '../components/WeatherAttr.jsx'
import '../styles/sky.css'

// Hava sayfası (B2; PLAN.v1 §3.B.3; tasarım bildirim-hava-yuruyus/tasarim.html "07 Hava sayfası", 5 sn tur 1 ve 2: 5/5).
// Yer ve yanında küçük "Değiştir" (sahip kararı 2026-10-01: il/ilçe konumdan kendiliğinden; liste yalnız buradan ya da
// izin yokken), büyük sıcaklık, hissedilen, gökyüzü, verinin yaşı; Nef'in yorumu; saat saat sıcaklık ve yağmur olasılığı
// (24 saat, sekiz sütun görünür, yana kayar); en yüksek, en düşük; Sabah havası anahtarı; Apple Weather atfı.
// 5 sn notları: "küçülen şişkin ay" kutusu gereksiz bulundu → ay evresi yok. Gün batımı verisi eklentide yok → sütun yok.
// Veri yalnız SkyPlugin.forecast'tan; istek ilçe/il merkezinin kamusal noktasıyla gider (kişinin koordinatı değil).
// Hiçbir veri sunucuya ya da Nef'e gitmez. Durumlar lib/sky.js skyState: live · cached · offline · error · loading · hidden.
//   place: { il, ilce } · onBack() · onChange() · morning: { on, delayMin } | null · onMorning(on) | null
//   onFetched() | null — yeni veri önbelleğe yazılınca (App: sabah havası planı yeniden kurulur)
//   deps (test): { plugin, native, online, now: () => Date, storage }
const ICONS = { sun: Sun, moon: Moon, cloud: Cloud, cloudSun: CloudSun, cloudMoon: CloudMoon, rain: CloudRain, drizzle: CloudDrizzle, bolt: CloudLightning, snow: CloudSnow, fog: CloudFog, wind: Wind }
const onlineNow = () => { try { return globalThis.navigator?.onLine !== false } catch { return true } }

export default function Sky({ place, onBack, onChange, morning = null, onMorning = null, onFetched = null, deps = {} }) {
  const plugin = deps.plugin ?? SkyPlugin
  const native = deps.native ?? isIOSApp()
  const clock = deps.now ?? (() => new Date())
  const storage = deps.storage
  const [s, setS] = useState(() => ({ supported: null, online: deps.online ?? onlineNow(), cache: loadCache(storage), error: false }))
  const [attr, setAttr] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const supported = await skyAvailable(plugin, native)
      if (!alive) return
      if (!supported) { setS((x) => ({ ...x, supported: false })); return }
      const online = deps.online ?? onlineNow()
      const cache = loadCache(storage)
      setS((x) => ({ ...x, supported: true, online, cache }))
      loadAttribution(plugin).then((a) => { if (alive) setAttr(a) })
      if (!online || (cache && ageHours(cache, clock()) >= 0 && ageHours(cache, clock()) < 1)) return
      const r = await fetchWeather(placePoint(place), { plugin, online, now: clock(), storage })
      if (!alive) return
      // reason 'place' (yerin noktası yok): iskelette kalmasın, hata durumu gösterilir
      setS((x) => ({ ...x, cache: r.ok ? r.cache : x.cache, error: !r.ok && (r.reason === 'error' || r.reason === 'place'), online: r.reason === 'offline' ? false : x.online }))
      if (r.ok) onFetched?.()
    })()
    return () => { alive = false }
  }, [place?.il, place?.ilce])

  const now = clock()
  const st = s.supported === null ? { kind: 'loading' } : skyState({ supported: s.supported, online: s.online, cache: s.cache, error: s.error, now })
  const data = st.cache?.data
  const cur = data ? nowView(data, now) : null
  const Icon = ICONS[cur?.icon] ?? Cloud
  const hours = data ? hourStrip(data.hours, now) : []
  const nef = data ? nefLine(data.hours, now) : null
  const range = data ? todayRange(data.days, now) : null
  const a = attr ?? ATTR_FALLBACK

  return (
    <main className="sky-page sky-wx" aria-label={placeLabel(place)} aria-busy={st.kind === 'loading'}>
      <button type="button" className="sky-back" onClick={onBack}><ChevronLeft size={20} aria-hidden="true" />Ana sayfa</button>

      <div className="wx-top">
        <div className="wx-main">
          <span className="wx-place">
            <span className="wx-eyebrow">{placeLabel(place)}</span>
            {onChange && <button type="button" className="sky-link wx-change" onClick={onChange}>Değiştir</button>}
          </span>
          {cur && <div className="wx-deg">{cur.temp}</div>}
        </div>
        {cur && (
          <div className="wx-sub">
            <Icon size={26} className="wx-ico" aria-hidden="true" />
            {cur.feels && <span>{`Hissedilen ${cur.feels}`}</span>}
            {cur.word && <span>{cur.word}</span>}
            <span className="wx-age">{ageText(st.cache.at, now)}</span>
          </div>
        )}
      </div>

      {st.kind === 'hidden' && <p className="wx-msg">{PH('sky.ios15')}</p>}
      {(st.kind === 'offline' || st.kind === 'error') && <p className="wx-msg">{st.text}</p>}
      {st.kind === 'loading' && <div className="wx-skel" aria-hidden="true"><i /><i /></div>}

      {data && (
        <>
          {nef && (
            <div className="wx-nef">
              <span className="sky-nef wx-dot" aria-hidden="true" />
              <div><small>Nef</small><p>{nef}</p></div>
            </div>
          )}

          {hours.length > 0 && (
            <div className="wx-hours" role="list">
              {hours.map((h) => (
                <div key={h.at} role="listitem" className={`wx-hr${h.now ? ' now' : ''}`}>
                  <span>{h.label}</span>
                  <b>{h.temp}</b>
                  <span className="wx-pb" aria-hidden="true"><i style={{ height: `${h.chance}%` }} /></span>
                  <span>{h.chanceText}</span>
                </div>
              ))}
            </div>
          )}

          {range && (
            <div className="wx-minmax">
              <div><b>{range.high}</b>en yüksek</div>
              <div><b>{range.low}</b>en düşük</div>
            </div>
          )}
        </>
      )}

      {onMorning && morning && st.kind !== 'hidden' && (
        <div className="wx-rows">
          <button type="button" className="pref-toggle wx-row" role="switch" aria-checked={Boolean(morning.on)} aria-label="Sabah havası" onClick={() => onMorning(!morning.on)}>
            <span className="wx-ri" aria-hidden="true"><Bell size={18} /></span>
            <span className="wx-rl"><b>Sabah havası</b><span>{`Alarmından ${morning.delayMin ?? 10} dk sonra, Nef'in yorumuyla`}</span></span>
            <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
          </button>
        </div>
      )}

      {st.kind !== 'hidden' && (
        <WeatherAttr attr={a} />
      )}
    </main>
  )
}
