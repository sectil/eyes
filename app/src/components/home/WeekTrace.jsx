import { Check } from 'lucide-react'

// Ana sayfa · ilk 7 günde dünün izi (Yön B "Tek büyük kart"; 5 saniye turu 6, 2. gün: "Bu hafta 1/3 gün" neyi saydığı
// belli değildi, dünkü emeğin karşılığı görünmüyordu). Büyük kartın üstünde yedi küçük göz: kaydı olan her geçmiş gün
// yanmış bir göz (ışınlı, iris renginde), bugün halka, kalan günler soluk. Yedi göz dolunca ilk görünüme kişinin gözü gelir
// (Home.jsx IRIS_FROM_DAY). Dün yolun bütün durakları bittiyse altında günün cümlesinin onaylı satırı (dayLead.js
// LINES.yday). Sayı yok: gün sayısı tek yerde, göz yanınca.
// past: bugünden önce kaydı olan gün sayısı (dayRays days); yday: dünün göz yandı mı (son kayıt günü dün);
// line: altındaki satır ya da null.
const N = 7
const RAY = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 12
  return `M${(12 + Math.cos(a) * 6.2).toFixed(2)} ${(12 + Math.sin(a) * 6.2).toFixed(2)}L${(12 + Math.cos(a) * 10).toFixed(2)} ${(12 + Math.sin(a) * 10).toFixed(2)}`
}).join('')

function Mark({ state }) {
  return (
    <span className={`wt-m ${state}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {state === 'lit' ? (
          <>
            <circle className="wt-iris" cx="12" cy="12" r="10.5" />
            <path className="wt-ray" d={RAY} />
            <circle className="wt-pupil" cx="12" cy="12" r="4" />
          </>
        ) : (
          <circle className="wt-ring" cx="12" cy="12" r="9.5" />
        )}
      </svg>
    </span>
  )
}

export default function WeekTrace({ past = 0, yday = false, line = null }) {
  const lit = Math.max(0, Math.min(N - 1, past))
  const marks = Array.from({ length: N }, (_, i) => (i < lit ? 'lit' : i === lit ? 'now' : 'later'))
  return (
    <div className="wt">
      <div className="wt-row" aria-hidden="true">
        {marks.map((st, i) => (
          <span key={i} className="wt-c">
            <Mark state={st} />
            {i === lit - 1 && yday && <small className="wt-l ok">dün</small>}
            {i === lit && <small className="wt-l now">bugün</small>}
          </span>
        ))}
      </div>
      {line && (
        <p className="wt-s">
          <Check size={15} strokeWidth={3} aria-hidden="true" />
          {line}
        </p>
      )}
    </div>
  )
}
