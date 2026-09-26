import { useRef, useState } from 'react'
import { Camera, Check } from 'lucide-react'
import { Avatar, shrinkImage } from './ProfileHome.jsx'
import BirthDateBoxes from '../components/BirthDateBoxes.jsx'
import CityField from '../components/CityField.jsx'
import { emptyIdentity, normalizeIdentity, validBirthDate, ageFromBirthDate, NAME_MAX } from '../lib/identity.js'
import { CORRECTION } from '../lib/profile.js'
import { accountLabel } from '../lib/account.js'
import { haptic } from '../lib/native.js'
import '../styles/profilehome.css'
import '../styles/account.css'

// "Seni tanıyalım" (Build 23b; Artifact "Hesap ve Profil Taslağı"): hesap ekranından sonra, denemeden önce.
// Her bilgi ayrı kutucuk. Zorunlu: ad + doğum tarihi (yaşa göre ölçüm aralıkları). Şehir ve gözlük/lens isteğe bağlı.
// Fotoğraf yalnız telefonda; hesap varsa ad, doğum tarihi, şehir, gözlük eşitlenir (App.jsx → lib/account.js).
const SHORT = { none: 'Yok', distance: 'Uzak', reading: 'Okuma', progressive: 'Progresif', 'contacts-multi': 'Multifokal lens' }

export default function ProfileSetup({ identity, correction: initialCorrection = null, account = null, onSave }) {
  const [id, setId] = useState(() => normalizeIdentity(identity ?? emptyIdentity()))
  const [correction, setCorrection] = useState(initialCorrection)
  const [err, setErr] = useState('')
  const file = useRef(null)
  const age = id.birthDate && validBirthDate(id.birthDate) ? ageFromBirthDate(id.birthDate) : null
  const ready = id.name.trim().length > 0 && age != null
  const who = accountLabel(account)

  async function pick(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const dataUrl = await shrinkImage(f)
      setId((q) => ({ ...q, avatar: { ...q.avatar, kind: 'photo', dataUrl } }))
      setErr('')
    } catch {
      setErr('Fotoğraf okunamadı.')
    }
  }

  function save() {
    if (!ready) return
    haptic('success')
    onSave(normalizeIdentity(id), correction)
  }

  return (
    <main className="screen fade-in setup">
      {who && <span className="acct-badge">{account.mode === 'apple' ? 'Apple ile giriş yapıldı' : `${who} ile giriş yapıldı`}</span>}
      <header className="page-header" style={{ paddingTop: 4 }}>
        <h1>Seni tanıyalım</h1>
        <p>{who ? 'Bilgilerin hesabınla eşitlenir; fotoğraf telefonda kalır.' : 'Bilgilerin yalnızca bu telefonda kalır.'}</p>
      </header>

      <div className="setup-avatar">
        <button type="button" className="ph-avatar-btn" onClick={() => file.current?.click()} aria-label="Fotoğraf seç">
          <Avatar identity={id} size={72} />
          <span className="ph-cam"><Camera size={14} aria-hidden="true" /></span>
        </button>
        <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
        <span className="muted small">Fotoğraf isteğe bağlı; yalnız telefonda saklanır.</span>
      </div>
      {err && <p className="muted small" role="alert">{err}</p>}

      <label className="field">
        <span>Adın</span>
        <input className="input" type="text" value={id.name} maxLength={NAME_MAX} autoComplete="given-name" placeholder="Sana nasıl seslenelim?" onChange={(e) => setId((q) => ({ ...q, name: e.target.value }))} />
      </label>

      <div className="field">
        <span id="setup-birth-label">Doğum tarihi {age != null && <span className="muted">· {age} yaş</span>}</span>
        <BirthDateBoxes id="setup-birth" value={id.birthDate} onChange={(v) => setId((q) => ({ ...q, birthDate: v }))} />
      </div>

      <div className="field">
        <span>Şehir <span className="setup-req">· isteğe bağlı</span></span>
        <CityField id="setup-city" value={id.city} onChange={(v) => setId((q) => ({ ...q, city: v }))} />
      </div>

      <div className="field">
        <span>Gözlük / lens <span className="setup-req">· isteğe bağlı</span></span>
        <div className="pf-chips" role="radiogroup" aria-label="Gözlük veya lens">
          {CORRECTION.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={correction === o.id} className={`pf-chip${correction === o.id ? ' on' : ''}`} onClick={() => setCorrection(correction === o.id ? null : o.id)}>{SHORT[o.id]}</button>
          ))}
        </div>
      </div>

      <button className="btn" onClick={save} disabled={!ready}><Check size={18} aria-hidden="true" /> Kaydet ve devam et</button>
      {!ready && <p className="muted small" style={{ textAlign: 'center', margin: 0 }}>Ad ve doğum tarihi gerekli.</p>}
    </main>
  )
}
