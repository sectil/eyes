import { useRef, useState } from 'react'
import { Camera, Check, ChevronRight, Film, ListChecks } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { emptyIdentity, normalizeIdentity, validBirthDate, ageFromBirthDate, initialFor, AVATAR_HUES, AVATAR_PX, NAME_MAX } from '../lib/identity.js'
import { CORRECTION } from '../lib/profile.js'
import { haptic } from '../lib/native.js'
import '../styles/profilehome.css'

// Profilim: avatar (harf + iris rengi veya fotoğraf), ad, doğum tarihi, gözlük; profil sorularına ve giriş filmine geçiş.
// Fotoğraf cihazda küçültülür (AVATAR_PX) ve yalnızca cihazda saklanır; hiçbir yere gönderilmez.
const SHORT = { none: 'Yok', distance: 'Uzak', reading: 'Okuma', progressive: 'Progresif', 'contacts-multi': 'Multifokal lens' }

export function Avatar({ identity, size = 96 }) {
  const id = normalizeIdentity(identity)
  const style = { width: size, height: size, fontSize: size * 0.42, '--hue': id.avatar.hue }
  if (id.avatar.kind === 'photo') return <span className="ph-avatar" style={style}><img src={id.avatar.dataUrl} alt="" /></span>
  return <span className="ph-avatar letter" style={style}>{initialFor(id.name) || '•'}</span>
}

async function shrinkImage(file, px = AVATAR_PX) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
    const s = Math.min(img.width, img.height)
    const c = document.createElement('canvas')
    c.width = px
    c.height = px
    c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, px, px)
    return c.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function ProfileHome({ identity, profile, onSave, onQuestions, onIntro, onBack }) {
  const [id, setId] = useState(() => normalizeIdentity(identity ?? emptyIdentity()))
  const [correction, setCorrection] = useState(profile?.correction ?? null)
  const [err, setErr] = useState('')
  const file = useRef(null)
  const dateOk = !id.birthDate || validBirthDate(id.birthDate)
  const age = id.birthDate && dateOk ? ageFromBirthDate(id.birthDate) : null
  const dirty = JSON.stringify(normalizeIdentity(identity)) !== JSON.stringify(id) || correction !== (profile?.correction ?? null)

  async function pick(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const dataUrl = await shrinkImage(f)
      setId((q) => ({ ...q, avatar: { ...q.avatar, kind: 'photo', dataUrl } }))
      setErr('')
      haptic('tick')
    } catch {
      setErr('Fotoğraf okunamadı.')
    }
  }
  function save() {
    if (!dateOk) return
    onSave(normalizeIdentity(id), correction)
    haptic('success')
  }

  return (
    <main className="screen fade-in ph">
      <PageHeader onBack={onBack} eyebrow="Profilim" title={id.name ? id.name : 'Sen'} subtitle="Bunlar yalnızca bu cihazda kalır." />
      <div className="ph-top">
        <button type="button" className="ph-avatar-btn" onClick={() => file.current?.click()} aria-label="Fotoğraf seç">
          <Avatar identity={id} size={104} />
          <span className="ph-cam"><Camera size={15} aria-hidden="true" /></span>
        </button>
        <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
        <div className="ph-hues" role="radiogroup" aria-label="Avatar rengi">
          {AVATAR_HUES.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={id.avatar.kind === 'letter' && id.avatar.hue === h}
              className={`ph-hue${id.avatar.kind === 'letter' && id.avatar.hue === h ? ' on' : ''}`}
              style={{ '--hue': h }}
              onClick={() => setId((q) => ({ ...q, avatar: { kind: 'letter', hue: h, dataUrl: null } }))}
              aria-label={`Renk ${h}`}
            />
          ))}
        </div>
        {err && <p className="muted small" role="alert">{err}</p>}
      </div>

      <label className="field">
        <span>Ad</span>
        <input className="input" type="text" value={id.name} maxLength={NAME_MAX} autoComplete="given-name" placeholder="Sana nasıl seslenelim?" onChange={(e) => setId((q) => ({ ...q, name: e.target.value }))} />
      </label>
      <label className="field">
        <span>Doğum tarihi {age != null && <span className="muted">· {age} yaş</span>}</span>
        <input className={`input${dateOk ? '' : ' bad'}`} type="date" value={id.birthDate ?? ''} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setId((q) => ({ ...q, birthDate: e.target.value || null }))} />
        {!dateOk && <span className="muted small">Bu tarih olamaz.</span>}
      </label>
      <div className="field">
        <span>Gözlük / lens</span>
        <div className="pf-chips" role="radiogroup" aria-label="Gözlük veya lens">
          {CORRECTION.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={correction === o.id} className={`pf-chip${correction === o.id ? ' on' : ''}`} onClick={() => setCorrection(o.id)}>{SHORT[o.id]}</button>
          ))}
        </div>
      </div>

      <button className="btn" onClick={save} disabled={!dirty || !dateOk}><Check size={18} aria-hidden="true" /> Kaydet</button>

      <div className="list">
        <button className="list-row" onClick={onQuestions}>
          <ListChecks size={20} aria-hidden="true" />
          <span className="grow stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>Profil soruları</span><span className="muted small">Yaş, gözlük, ekran, uyku, stres · yeniden cevapla</span></span>
          <ChevronRight size={18} className="muted" />
        </button>
        <button className="list-row" onClick={onIntro}>
          <Film size={20} aria-hidden="true" />
          <span className="grow stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>Giriş filmini izle</span><span className="muted small">15 saniye</span></span>
          <ChevronRight size={18} className="muted" />
        </button>
      </div>
    </main>
  )
}
