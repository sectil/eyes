import { useRef, useState } from 'react'
import { Camera, Check, ChevronRight, Film, ListChecks, LogOut, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { emptyIdentity, normalizeIdentity, validBirthDate, ageFromBirthDate, initialFor, AVATAR_HUES, AVATAR_PX, NAME_MAX } from '../lib/identity.js'
import { CORRECTION } from '../lib/profile.js'
import { accountLabel, signedIn } from '../lib/account.js'
import BirthDateBoxes from '../components/BirthDateBoxes.jsx'
import CityField from '../components/CityField.jsx'
import '../styles/account.css'
import { haptic } from '../lib/native.js'
import '../styles/profilehome.css'

// Profilim: avatar (harf + iris rengi veya fotoğraf), ad, doğum tarihi, şehir, gözlük; profil sorularına ve giriş filmine geçiş.
// Fotoğraf cihazda küçültülür (AVATAR_PX) ve yalnızca cihazda saklanır; hiçbir yere gönderilmez.
// Hesap bölümü (Build 23b): hesapsızsa "Hesap aç"; hesap varsa çıkış ve uygulama içinden hesap silme (App Store 5.1.1(v)).
const SHORT = { none: 'Yok', distance: 'Uzak', reading: 'Okuma', progressive: 'Progresif', 'contacts-multi': 'Multifokal lens' }

export function Avatar({ identity, size = 96 }) {
  const id = normalizeIdentity(identity)
  const style = { width: size, height: size, fontSize: size * 0.42, '--hue': id.avatar.hue }
  if (id.avatar.kind === 'photo') return <span className="ph-avatar" style={style}><img src={id.avatar.dataUrl} alt="" /></span>
  return <span className="ph-avatar letter" style={style}>{initialFor(id.name) || '•'}</span>
}

export async function shrinkImage(file, px = AVATAR_PX) {
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

export default function ProfileHome({ identity, profile, account = null, onSave, onQuestions, onIntro, onBack, onAccount, onSignOut, onDeleteAccount }) {
  const [id, setId] = useState(() => normalizeIdentity(identity ?? emptyIdentity()))
  const [correction, setCorrection] = useState(profile?.correction ?? null)
  const [err, setErr] = useState('')
  const [sheet, setSheet] = useState(false)
  const [acctBusy, setAcctBusy] = useState(false)
  const [acctMsg, setAcctMsg] = useState('')
  const inAcct = signedIn(account)
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
      <PageHeader onBack={onBack} eyebrow="Profilim" title={id.name ? id.name : 'Sen'} subtitle={inAcct ? 'Ad, doğum tarihi, şehir ve gözlük hesabınla eşitlenir; fotoğraf telefonda kalır.' : 'Bunlar yalnızca bu cihazda kalır.'} />
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
      <div className="field">
        <span id="ph-birth-label">Doğum tarihi {age != null && <span className="muted">· {age} yaş</span>}</span>
        <BirthDateBoxes id="ph-birth" value={id.birthDate} onChange={(v) => setId((q) => ({ ...q, birthDate: v }))} />
      </div>
      <div className="field">
        <span>Şehir</span>
        <CityField id="ph-city" value={id.city} onChange={(v) => setId((q) => ({ ...q, city: v }))} />
      </div>
      <div className="field">
        <span>Gözlük / lens</span>
        <div className="pf-chips" role="radiogroup" aria-label="Gözlük veya lens">
          {CORRECTION.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={correction === o.id} className={`pf-chip${correction === o.id ? ' on' : ''}`} onClick={() => setCorrection(o.id)}>{SHORT[o.id]}</button>
          ))}
        </div>
      </div>

      <button className="btn" onClick={save} disabled={!dirty || !dateOk}><Check size={18} aria-hidden="true" /> Kaydet</button>

      <div className="list ph-acct">
        {inAcct ? (
          <>
            <div className="list-row">
              <UserRound size={20} aria-hidden="true" />
              <span className="grow stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>Hesap</span><span className="muted small">{account.mode === 'apple' ? 'Apple' : accountLabel(account)} · eşitleniyor</span></span>
            </div>
            <button className="list-row" onClick={async () => { setAcctBusy(true); await onSignOut?.(); setAcctBusy(false) }} disabled={acctBusy}>
              <LogOut size={20} aria-hidden="true" />
              <span className="grow stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>Çıkış yap</span><span className="muted small">Veriler bu telefonda kalır</span></span>
            </button>
            <button className="list-row danger" onClick={() => { setAcctMsg(''); setSheet(true) }}>
              <Trash2 size={20} aria-hidden="true" />
              <span className="grow" style={{ fontWeight: 600 }}>Hesabımı sil</span>
            </button>
          </>
        ) : (
          <button className="list-row" onClick={onAccount}>
            <UserRound size={20} aria-hidden="true" />
            <span className="grow stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>Hesap aç ya da giriş yap</span><span className="muted small">Yeni telefonda da ilerlemen seninle kalsın</span></span>
            <ChevronRight size={18} className="muted" />
          </button>
        )}
      </div>

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

      {sheet && (
        <div className="acct-sheet-back" role="presentation" onClick={() => !acctBusy && setSheet(false)}>
          <div className="acct-sheet" role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="del-title">Hesabın silinsin mi?</h2>
            <p>Sunucudaki profilin kalıcı olarak silinir. Telefondaki veriler kalır. Aboneliğin varsa Apple'da ayrıca iptal etmelisin: Ayarlar → Apple Kimliği → Abonelikler.</p>
            {acctMsg && <p role="alert" style={{ color: 'var(--warn)' }}>{acctMsg}</p>}
            <button
              className="btn btn-danger"
              disabled={acctBusy}
              onClick={async () => {
                setAcctBusy(true)
                const m = await onDeleteAccount?.()
                setAcctBusy(false)
                if (m) setAcctMsg(m)
                else setSheet(false)
              }}
            >
              {acctBusy ? 'Siliniyor…' : 'Hesabımı kalıcı olarak sil'}
            </button>
            <button className="link-btn" style={{ alignSelf: 'center' }} disabled={acctBusy} onClick={() => setSheet(false)}>Vazgeç</button>
          </div>
        </div>
      )}
    </main>
  )
}
