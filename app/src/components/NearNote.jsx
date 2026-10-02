import { Info } from 'lucide-react'
import { dot } from './remindUi.js'
import '../styles/reminders.css'

// Aynı saatteki öteki bildirimler (D5+D6 plan madde 5–6): engel değil, bilgi satırı. near: remindUi.nearTimes çıktısı
// ([{ key, time, label }]); boşsa hiçbir şey çizilmez. Dokununca o saatteki bildirimler listelenir. Bilgi satırı cümlesi sahip onaylı.
export default function NearNote({ near }) {
  if (!Array.isArray(near) || !near.length) return null
  return (
    <div className="rem-inline rem-near">
      <Info size={16} aria-hidden="true" />
      <div className="rem-inline-body">
        <p role="status">{`Yarım saat içinde ${near.length} bildirimin daha var`}</p>
        <details className="rem-near-more">
          <summary>Bildirimleri göster</summary>
          <ul>
            {near.map((b, i) => (
              <li key={`${b.key}-${b.time}-${i}`}><b>{dot(b.time)}</b> {b.label}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  )
}
