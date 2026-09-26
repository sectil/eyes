import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { isIOSApp, haptic } from '../lib/native.js'
import { TERMS_URL, PRIVACY_URL } from './Paywall.jsx'
import { validEmail, normalizeEmail, cleanCode, validCode, sendEmailCode, verifyEmailCode, signInWithApple, friendlyError, RESEND_SEC, CODE_MAX } from '../lib/account.js'
import '../styles/account.css'

// Hesap (Build 23b; Artifact "Hesap ve Profil Taslağı", onaylı): giriş filminden sonra.
// Apple ile giriş yalnız iPhone uygulamasında. E-posta: 6 haneli kod (bağlantı yerine kod: uygulamadan çıkmadan,
// derin bağlantı gerektirmeden). "Şimdilik hesapsız dene" her zaman var (App Store 5.1.1(v)).
// Google girişi Supabase'de Google ayarı yapılınca eklenecek (Google varsa Apple zorunlu; Apple zaten var).
// onDone({ mode, userId?, email?, date }, { givenName? })
export default function AccountStart({ onDone, onCancel = null }) {
  const [step, setStep] = useState('choose') // choose | email | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
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
    try {
      const r = await signInWithApple()
      haptic('success')
      onDone({ mode: 'apple', userId: r.user.id, email: r.user.email ?? null, date: date() }, { givenName: r.givenName })
    } catch (e) {
      const m = friendlyError(e)
      if (m) setMsg(m)
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

  return (
    <main className="screen fade-in acct">
      <div className="acct-top">
        {back ? <button type="button" className="btn-icon" onClick={back} aria-label="Geri"><ArrowLeft size={20} /></button> : <span />}
      </div>

      {step === 'choose' && (
        <>
          <svg className="acct-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="none" stroke="#19c2d1" strokeWidth="2.5" strokeDasharray="17 8" opacity=".6" />
            <circle cx="60" cy="60" r="50" fill="#0b1422" stroke="#3e7bfa" strokeWidth="1" strokeDasharray="2 6" opacity=".9" />
            <g stroke="#a9d8ff" strokeWidth="1" opacity=".8" fill="none">
              <path d="M34 62 L48 58 L72 57 L82 50 L88 44 M88 44 L92 48 M72 57 L78 70 L76 78 M48 58 L44 72 L50 80 M48 58 L40 68" />
              <path d="M60 57 L54 38 L42 30 L32 28" stroke="#7fe3ee" />
            </g>
            <g fill="#fff"><circle cx="34" cy="62" r="1.6" /><circle cx="48" cy="58" r="1.8" /><circle cx="72" cy="57" r="1.8" /><circle cx="88" cy="44" r="1.6" /><circle cx="76" cy="78" r="1.4" /><circle cx="50" cy="80" r="1.4" /><circle cx="32" cy="28" r="1.6" /></g>
          </svg>
          <h1 className="acct-title">Hoş geldin</h1>
          <p className="acct-sub">Hesabınla ilerlemen yeni telefonda da seninle kalır.</p>
          <div className="grow" />
          <div className="acct-actions">
            {native && (
              <button type="button" className="acct-btn apple" onClick={apple} disabled={busy}>
                <svg width="15" height="17" viewBox="0 0 15 17" aria-hidden="true"><path fill="currentColor" d="M12.4 9c0-2 1.7-3 1.7-3-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.6-.8-2.7-.7C3.9 3.5 2.6 4.3 1.9 5.6.4 8.2 1.5 12 3 14.1c.7 1 1.5 2.2 2.6 2.1 1.1 0 1.5-.7 2.7-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-2.8ZM10.3 3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2Z" /></svg>
                Apple ile devam et
              </button>
            )}
            <button type="button" className="acct-btn mail" onClick={() => { setStep('email'); setMsg('') }} disabled={busy}><Mail size={17} aria-hidden="true" /> E-posta ile devam et</button>
            <button type="button" className="link-btn acct-guest" onClick={() => onDone({ mode: 'guest', date: date() }, {})} disabled={busy}>Şimdilik hesapsız dene</button>
            {msg && <p className="acct-msg" role="alert">{msg}</p>}
            <p className="acct-fine">
              Devam edersen <a href={TERMS_URL} target="_blank" rel="noreferrer">Kullanım şartları</a>
              {PRIVACY_URL ? <> ve <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Gizlilik politikası</a></> : null}nı kabul etmiş olursun. Kamera görüntüsü telefondan çıkmaz.
            </p>
          </div>
        </>
      )}

      {step === 'email' && (
        <>
          <div className="acct-icon"><Mail size={32} aria-hidden="true" /></div>
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
          <div className="acct-icon"><Mail size={32} aria-hidden="true" /></div>
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
