import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import '../styles/consent.css'

// Nef göz koçu için açık rıza (KVKK: her amaç ayrı, kutular önceden işaretli DEĞİL).
//  1) Özet sayılar → sunucumuz → yurt dışındaki yapay zekâ sağlayıcısı (Nef'in çalışması için gerekli)
//  2) İsteğe bağlı: profil cevaplarının özeti (uyku, ekran süresi, gece telefonu, stres) — sağlığa ilişkin
// Önceden tek "Kabul et ve aç" düğmesi ikisini birden açıyordu (CoachCard); Bilgi ekranındaki anahtar hiç sormuyordu.
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
  return (
    <div className="stack" style={{ gap: 10 }}>
      <p className="note small">
        <ShieldCheck size={16} aria-hidden="true" />
        Nef'i açarsan özet sayıların şifreli bağlantıyla sunucumuza, oradan yurt dışındaki yapay zekâ sağlayıcısına (OpenRouter) gider.
        Kamera görüntüsü, adın ya da cihaz kimliğin gitmez. Öneriler tıbbi tavsiye değildir. İstediğin an Bilgi ya da Profilim → İzinlerim'den kapatabilirsin.
      </p>
      <Box id={`${idPrefix}-base`} checked={base} onChange={setBase}>
        Özet sayılarımın (bu hafta kaç gün çalıştığım, son 7 günün ölçüm ortancası) günlük öneri için yurt dışındaki sunucuya gönderilmesine açık rıza veriyorum.
      </Box>
      <Box id={`${idPrefix}-life`} checked={life} onChange={setLife}>
        İsteğe bağlı: profil cevaplarımın özeti (uyku, ekran süresi, gece telefonu, stres) de gitsin.
      </Box>
      <div className="row" style={{ gap: 10 }}>
        <button type="button" className="btn btn-sm" disabled={!base} onClick={() => onAccept({ life })}>Nef'i aç</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Vazgeç</button>
      </div>
    </div>
  )
}
