import { ATTR_FALLBACK } from '../lib/skyView.js'

// Apple Weather atfı (Apple kuralı: işaret + yasal sayfa bağlantısı; lib/skyView.js). Hava sayfası (screens/Sky.jsx) ve
// Ana sayfa hava hapı (components/home/SkyChip.jsx SkyMark) aynı işareti buradan çizer. Temalar sky.css .wx-mark kuralıyla.

// İşaret: temanın işaret görseli, yoksa metin işaret ("Apple Weather"; ATTR_FALLBACK). Temanın işareti yoksa o temada
// metin işaret (yalnız biri geçerli https ise öteki temada atıf düşmesin).
export function WxMark({ attr = ATTR_FALLBACK, className = '' }) {
  const a = attr ?? ATTR_FALLBACK
  return (
    <span className={className ? `wx-mark ${className}` : 'wx-mark'}>
      {a.markLight ? <img className="wx-mark-l" src={a.markLight} alt={a.serviceName} /> : a.markDark && <span className="wx-mark-l">{a.serviceName}</span>}
      {a.markDark ? <img className="wx-mark-d" src={a.markDark} alt={a.serviceName} /> : a.markLight && <span className="wx-mark-d">{a.serviceName}</span>}
      {!a.markLight && !a.markDark && <span>{a.serviceName}</span>}
    </span>
  )
}

// İşaret ve yasal sayfa bağlantısı ("Veri kaynakları"), hava sayfasının alt satırı
export default function WeatherAttr({ attr = ATTR_FALLBACK, className = '' }) {
  const a = attr ?? ATTR_FALLBACK
  return (
    <div className={className ? `wx-attr ${className}` : 'wx-attr'}>
      <WxMark attr={a} />
      <a href={a.legalPageURL} target="_blank" rel="noreferrer">Veri kaynakları</a>
    </div>
  )
}
