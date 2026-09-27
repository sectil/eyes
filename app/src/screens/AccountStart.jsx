import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { isIOSApp, haptic } from '../lib/native.js'
import { TERMS_URL, PRIVACY_URL } from './Paywall.jsx'
import { validEmail, normalizeEmail, cleanCode, validCode, sendEmailCode, verifyEmailCode, signInWithApple, googleSignInReady, friendlyError, errorDetail, RESEND_SEC, CODE_MAX } from '../lib/account.js'
import SkyChart from '../components/SkyChart.jsx'
import '../styles/account.css'

// Hesap (Build 23b; tasarım: Artifact "Nefona Hoş Geldin Ekranı" öneri 2, onaylı 2026-09-27): giriş ekranından sonra.
// Seçim adımı tam ekran sahne: üstte Pegasus gökyüzü (SkyChart), altta giriş ekranındaki iris ufku gibi kavisli zemin;
// başlık ve seçenekler kavisin altında tek blok. E-posta ve kod adımları aynı dilde (altın odak köşeli simge).
// Apple ile giriş yalnız iPhone uygulamasında. E-posta: 6 haneli kod (bağlantı yerine kod: uygulamadan çıkmadan,
// derin bağlantı gerektirmeden). "Şimdilik hesapsız dene" her zaman var (App Store 5.1.1(v)).
// Google: düğme hazır; Google Cloud istemci kimlikleri ve eklenti gelene dek görünmez (lib/account.js googleSignInReady).
// Google varsa Apple zorunlu (App Store 4.8); Apple zaten var.
// onDone({ mode, userId?, email?, date }, { givenName? })
export default function AccountStart({ onDone, onCancel = null }) {
  const [step, setStep] = useState('choose') // choose | email | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [detail, setDetail] = useState('') // Bug 11: ham hata metni (teşhis)
  const [wait, setWait] = useState(0)
  const codeRef = useRef(null)
  const native = isIOSApp()

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])
  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  const date = () => new Date().toISOString()

  async function apple() {
    setBusy(true)
    setMsg('')
    setDetail('')
    try {
      const r = await signInWithApple()
      haptic('success')
      onDone({ mode: 'apple', userId: r.user.id, email: r.user.email ?? null, date: date() }, { givenName: r.givenName })
    } catch (e) {
      const m = friendlyError(e)
      if (m) setMsg(m)
      if (m && m.startsWith('Bir sorun çıktı')) setDetail(errorDetail(e))
    }
    setBusy(false)
  }

  async function send() {
    if (!validEmail(email)) return setMsg('E-posta adresini kontrol et.')
    setBusy(true)
    setMsg('')
    try {
      await sendEmailCode(email)
      setStep('code')
      setWait(RESEND_SEC)
      setCode('')
    } catch (e) {
      setMsg(friendlyError(e) ?? '')
    }
    setBusy(false)
  }

  async function verify(c = code) {
    if (!validCode(c)) return
    setBusy(true)
    setMsg('')
    try {
      const user = await verifyEmailCode(email, c)
      haptic('success')
      onDone({ mode: 'email', userId: user.id, email: normalizeEmail(email), date: date() }, {})
    } catch (e) {
      setMsg(friendlyError(e) ?? '')
      setBusy(false)
    }
  }

  const back = step === 'code' ? () => { setStep('email'); setMsg('') } : step === 'email' ? () => { setStep('choose'); setMsg('') } : onCancel

  const G = googleSignInReady()
  if (step === 'choose') {
    return (
      <main className="acct-hello fade-in">
        <div className="hello-top">
          {back && <button type="button" className="btn-icon" onClick={back} aria-label="Geri"><ArrowLeft size={20} /></button>}
        </div>
        <div className="hello-sky"><SkyChart /></div>
        <div className="hello-base">
          <h1 className="hello-title">Hoş geldin</h1>
          <p className="hello-sub">Hesabınla ilerlemen yeni telefonda da seninle kalır.</p>
          <div className="hello-acts">
            {native && (
              <button type="button" className="acct-btn apple" onClick={apple} disabled={busy}>
                <svg width="16" height="19" viewBox="0 0 15 17" aria-hidden="true"><path fill="currentColor" d="M12.4 9c0-2 1.7-3 1.7-3-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.6-.8-2.7-.7C3.9 3.5 2.6 4.3 1.9 5.6.4 8.2 1.5 12 3 14.1c.7 1 1.5 2.2 2.6 2.1 1.1 0 1.5-.7 2.7-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-2.8ZM10.3 3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2Z" /></svg>
                <span>Apple ile devam et</span>
              </button>
            )}
            {G && (
              <button type="button" className="acct-btn google" disabled={busy}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                <span>Google ile devam et</span>
              </button>
            )}
            <button type="button" className="acct-btn mail" onClick={() => { setStep('email'); setMsg('') }} disabled={busy}><Mail size={19} aria-hidden="true" /><span>E-posta ile devam et</span></button>
            <button type="button" className="link-btn acct-guest" onClick={() => onDone({ mode: 'guest', date: date() }, {})} disabled={busy}>Şimdilik hesapsız dene</button>
            {msg && <p className="acct-msg" role="alert">{msg}</p>}
            {detail && <p className="acct-detail muted small">{detail}</p>}
            <p className="acct-fine">
              Devam edersen <a href={TERMS_URL} target="_blank" rel="noreferrer">Kullanım şartları</a>
              {PRIVACY_URL ? <> ve <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Gizlilik politikası</a></> : null}nı kabul etmiş olursun. Kamera görüntüsü telefondan çıkmaz.
            </p>
          </div>
        </div>
      </main>
    )
  }
  const mailHero = (
    <div className="acct-mailhero" aria-hidden="true">
      <div><Mail size={26} /></div>
      <i className="k tl" /><i className="k tr" /><i className="k bl" /><i className="k br" />
    </div>
  )
  return (
    <main className="screen fade-in acct">
      <div className="acct-top">
        <button type="button" className="btn-icon" onClick={back} aria-label="Geri"><ArrowLeft size={20} /></button>
      </div>
      {step === 'email' && (
        <>
          {mailHero}
          <h1 className="acct-title">E-postanı yaz</h1>
          <p className="acct-sub">Sana 6 haneli bir giriş kodu göndereceğiz. Şifre yok.</p>
          <label className="field">
            <span>E-posta</span>
            <input className="input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" placeholder="ornek@posta.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          </label>
          {msg && <p className="acct-msg" role="alert">{msg}</p>}
          <div className="grow" />
          <button type="button" className="btn" onClick={send} disabled={busy || !validEmail(email)}>{busy ? 'Gönderiliyor…' : 'Kod gönder'}</button>
        </>
      )}

      {step === 'code' && (
        <>
          {mailHero}
          <h1 className="acct-title">Postana bak</h1>
          <p className="acct-sub"><b>{normalizeEmail(email)}</b> adresine gelen kodu yaz.</p>
          <label className="field">
            <span>Giriş kodu</span>
            <input
              ref={codeRef}
              className="input acct-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              maxLength={CODE_MAX}
              value={code}
              onChange={(e) => {
                setCode(cleanCode(e.target.value))
              }}
            />
          </label>
          {msg && <p className="acct-msg" role="alert">{msg}</p>}
          <button type="button" className="link-btn" onClick={send} disabled={busy || wait > 0}>{wait > 0 ? `Gelmedi mi? ${wait} sn sonra yeniden gönder` : 'Kodu yeniden gönder'}</button>
          <div className="grow" />
          <button type="button" className="btn" onClick={() => verify()} disabled={busy || !validCode(code)}>{busy ? 'Kontrol ediliyor…' : 'Giriş yap'}</button>
          <p className="acct-fine">Posta birkaç dakika gecikebilir; gereksiz (spam) klasörüne de bak.</p>
        </>
      )}
    </main>
  )
}
