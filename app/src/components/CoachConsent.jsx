import { useState } from 'react'
import { Check } from 'lucide-react'
import { CONSENTS } from '../lib/consent.js'
import '../styles/consent.css'

// Nef göz koçu için açık rıza (KVKK: her amaç ayrı, kutular önceden işaretli DEĞİL). Metinler tek kaynaktan:
// lib/consent.js CONSENTS.coach ve CONSENTS.coachLife (İzinlerim'deki ConsentSheet de aynısını gösterir).
//  1) Son 7 günün özetleri → sunucumuz → yurt dışındaki yapay zekâ modeli (Nef'in çalışması için gerekli)
//  2) İsteğe bağlı: profil cevaplarının özeti (uyku, ekran süresi, gece telefonu, stres) — sağlığa ilişkin
// onAccept({ life }) · onCancel()
function Box({ id, checked, onChange, children }) {
  return (
    <label className={`cs-ok${checked ? ' on' : ''}`} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="cs-box" aria-hidden="true">{checked && <Check size={16} strokeWidth={3} />}</span>
      <span>{children}</span>
    </label>
  )
}

export default function CoachConsent({ onAccept, onCancel, idPrefix = 'cc' }) {
  const [base, setBase] = useState(false)
  const [life, setLife] = useState(false)
  const c = CONSENTS.coach
  return (
    <div className="stack" style={{ gap: 10 }}>
      <dl className="cs-facts">
        {c.facts.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <Box id={`${idPrefix}-base`} checked={base} onChange={setBase}>{c.check}</Box>
      <Box id={`${idPrefix}-life`} checked={life} onChange={setLife}>İsteğe bağlı. {CONSENTS.coachLife.check}</Box>
      <div className="row" style={{ gap: 10 }}>
        <button type="button" className="btn btn-sm" disabled={!base} onClick={() => onAccept({ life })}>Nef'i aç</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Vazgeç</button>
      </div>
      <p className="muted small" style={{ margin: 0 }}>İstediğin an Bilgi ya da Profilim → İzinlerim'den kapatabilirsin.</p>
    </div>
  )
}
