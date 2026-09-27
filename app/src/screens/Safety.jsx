import { useState } from 'react'
import { Check, ShieldCheck, TriangleAlert, EyeOff, PanelTop, Zap, Waves, Sun, Blend } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { RED_FLAGS } from '../lib/profile.js'
import { setupText } from '../lib/setupText.js'
import '../styles/setup.css'

// Güvenlik kontrolü (Artifact "Nefona Başlangıç Kartı", onaylı): testten önce. Altı belirti tek listede; "Hiçbiri yok"
// en altta, liste okunmadan geçilmesin. Bir belirti işaretlenince alttan uyarı sayfası açılır ("Anladım" kaydeder,
// "Yanlış seçtim" geri alır). Kayıtlı işaret varken kurulum ilerlemez (sevk kuralı).
// onDone(profil, temiz): temiz = hiçbiri yok.
const ICONS = { sudden: EyeOff, curtain: PanelTop, flashes: Zap, distortion: Waves, pain: Sun, diplopia: Blend }

export default function Safety({ profile, bar = 0.08, onDone }) {
  const T = setupText().safety
  const [flags, setFlags] = useState(profile.flags ?? [])
  const [pending, setPending] = useState(null) // yeni işaretlenen, henüz onaylanmamış
  const saved = (profile.flags ?? []).length > 0
  const toggle = (id) => {
    if (flags.includes(id)) {
      setFlags(flags.filter((x) => x !== id))
      return
    }
    setFlags([...flags, id])
    setPending(id)
  }
  const wrong = () => {
    setFlags(flags.filter((x) => x !== pending))
    setPending(null)
  }
  const confirm = () => {
    setPending(null)
    onDone({ ...profile, flags, flagsChecked: true }, false)
  }
  return (
    <main className="screen fade-in oq su">
      <div className="oq-top"><ProgressBar value={bar} /></div>
      <div className="su-ey"><span className="su-shield"><ShieldCheck size={18} aria-hidden="true" /></span><span className="oq-ey">{T.eyebrow}</span></div>
      <h1 className="su-q">{T.title}</h1>
      <p className="oq-sub su-sub">{T.sub}</p>
      <div className="su-list" role="group" aria-label={T.title}>
        {RED_FLAGS.map((f) => {
          const on = flags.includes(f.id)
          const Icon = ICONS[f.id] ?? TriangleAlert
          return (
            <button key={f.id} type="button" role="checkbox" aria-checked={on} className={`su-item${on ? ' on' : ''}`} onClick={() => toggle(f.id)}>
              <Icon size={20} aria-hidden="true" className="g" />
              <span>{f.text}</span>
              <i className="cb" aria-hidden="true">{on && <Check size={15} strokeWidth={3} />}</i>
            </button>
          )
        })}
      </div>
      <div className="grow" />
      {flags.length === 0 ? (
        <button type="button" className="btn" onClick={() => onDone({ ...profile, flags: [], flagsChecked: true }, true)}>
          <Check size={18} aria-hidden="true" /> {T.none}
        </button>
      ) : !pending ? (
        <div className="su-alert" role="alert">
          <TriangleAlert size={20} aria-hidden="true" />
          <p>{saved ? T.locked : T.sheetBody[0]}</p>
          {!saved && <button type="button" className="btn btn-warn" onClick={confirm}>{T.ok}</button>}
        </div>
      ) : null}
      {pending && (
        <>
          <div className="su-scrim" onClick={wrong} aria-hidden="true" />
          <div className="su-sheet" role="alertdialog" aria-modal="true" aria-labelledby="su-sheet-t">
            <i className="grab" aria-hidden="true" />
            <div className="su-sheet-h"><TriangleAlert size={20} aria-hidden="true" /><h2 id="su-sheet-t">{T.sheetTitle}</h2></div>
            {T.sheetBody.map((t) => <p key={t}>{t}</p>)}
            <button type="button" className="btn btn-warn" onClick={confirm}>{T.ok}</button>
            <button type="button" className="btn btn-ghost" onClick={wrong}>{T.wrong}</button>
          </div>
        </>
      )}
    </main>
  )
}
