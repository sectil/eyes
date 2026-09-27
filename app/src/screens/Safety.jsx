import { Check, ShieldCheck } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import WarningSigns from '../components/WarningSigns.jsx'
import { setupText } from '../lib/setupText.js'
import '../styles/setup.css'

// Güvenlik bilgisi (kurulumun ilk ekranı; sahibinin kararı, 27 Eylül): soru değil, bilgi. Altı belirti ve "biri olursa göz
// doktoruna git"; işaret kutusu ve kilit yok, "Anladım, devam" ile uygulama kullanılır. Aynı liste Bilgi sekmesinde ve
// göz uyarısında da durur (components/WarningSigns.jsx). onDone(profil): okundu (flagsChecked).
export default function Safety({ profile, bar = 0.08, onDone }) {
  const T = setupText().safety
  return (
    <main className="screen fade-in oq su">
      <div className="oq-top"><ProgressBar value={bar} /></div>
      <div className="su-ey"><span className="su-shield"><ShieldCheck size={18} aria-hidden="true" /></span><span className="oq-ey">{T.eyebrow}</span></div>
      <h1 className="su-q">{T.title}</h1>
      <p className="oq-sub su-sub">{T.sub}</p>
      <div className="su-card">
        <WarningSigns label={T.title} />
      </div>
      <p className="su-note">{T.note}</p>
      <div className="grow" />
      <button type="button" className="btn" onClick={() => onDone({ ...profile, flags: [], flagsChecked: true }, true)}>
        <Check size={18} aria-hidden="true" /> {T.ok}
      </button>
    </main>
  )
}
