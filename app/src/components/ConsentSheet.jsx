import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ShieldCheck } from 'lucide-react'
import { CONSENTS } from '../lib/consent.js'
import { PRIVACY_URL } from '../screens/Paywall.jsx'
import '../styles/consent.css'

// Açık rıza sayfası (KVKK; tasarım: Artifact "Nefona Bugün ve Profil"). Kutu önceden işaretli DEĞİL;
// işaretlenmeden "İzin ver" çalışmaz. "Şimdi değil" hiçbir özelliği kapatmaz. onAnswer(true | false).
export default function ConsentSheet({ kind = 'profileSync', onAnswer }) {
  const c = CONSENTS[kind]
  const [ok, setOk] = useState(false)
  if (!c) return null
  // Gövdeye taşınır: ekran kabı (fade-in dönüşümü) ayrı katman oluşturup sekme çubuğunun altında bırakıyordu
  return createPortal(
    <div className="cs-back" role="presentation">
      <div className="cs-sheet" role="dialog" aria-modal="true" aria-labelledby="cs-title">
        <span className="cs-grab" aria-hidden="true" />
        <span className="cs-shield" aria-hidden="true"><ShieldCheck size={26} /></span>
        <h2 id="cs-title">{c.title}</h2>
        <p className="cs-lead">{c.lead}</p>
        <dl className="cs-facts">
          {c.facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <label className={`cs-ok${ok ? ' on' : ''}`}>
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span className="cs-box" aria-hidden="true">{ok && <Check size={16} strokeWidth={3} />}</span>
          <span>{c.check}</span>
        </label>
        <div className="cs-btns">
          <button type="button" className="btn" disabled={!ok} onClick={() => onAnswer(true)}>İzin ver</button>
          <button type="button" className="btn btn-ghost" onClick={() => onAnswer(false)}>Şimdi değil</button>
        </div>
        <p className="cs-foot">
          {PRIVACY_URL ? <><a href={PRIVACY_URL} target="_blank" rel="noreferrer">Aydınlatma metninin tamamı</a> · </> : null}
          İznini Profilim → İzinlerim'den her an geri çekebilirsin.
        </p>
      </div>
    </div>,
    document.body,
  )
}
