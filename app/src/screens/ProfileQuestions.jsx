import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import QuestionFlow from '../components/QuestionFlow.jsx'
import FirstLook from './FirstLook.jsx'
import { Flags } from './Onboarding.jsx'
import { questionRows, QUESTIONS } from '../lib/profileQuestions.js'
import { normalizeProfile } from '../lib/profile.js'
import '../styles/profile.css'

// Profilim → Sorularım (Artifact "Önce Fark Ettir" Y8): eski 4 sayfalık formun yerine. Her satır dokununca aynı
// tek soruluk ekranı açar; sorulmamış olanlar zamanı gelince sorulur ama buradan da cevaplanabilir.
// onSave(profil): her değişiklikte kaydeder.
export default function ProfileQuestions({ profile, trueDepth = false, onSave, onBack }) {
  const [p, setP] = useState(() => normalizeProfile(profile))
  const [open, setOpen] = useState(null)
  const save = (np) => {
    setP(np)
    onSave(np)
  }
  if (open === 'flags') return <Flags profile={p} bar={1} onDone={(np) => { save(np); setOpen(null) }} />
  if (open === 'firstLook') return <FirstLook trueDepth={trueDepth} bar={[0, 1]} onDone={(look) => { save({ ...p, firstLook: look }); setOpen(null) }} />
  if (open && QUESTIONS[open]) {
    return <QuestionFlow ids={[open]} profile={p} onSave={save} onDone={() => setOpen(null)} onClose={() => setOpen(null)} closeLabel="Sorularıma dön" />
  }
  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} eyebrow="Profilim" title="Sorularım" subtitle="Dokun, değiştir. Sorulmamış olanlar zamanı gelince sorulur." />
      <div className="pq-list">
        {questionRows(p).map((r) => (
          <button key={r.id} type="button" className="pq-row" onClick={() => setOpen(r.id)}>
            <span>{r.label}</span>
            <span className={`v${r.value == null ? ' later' : ''}`}>
              {r.value ?? r.later ?? 'cevap yok'} <ChevronRight size={15} aria-hidden="true" style={{ verticalAlign: '-2px' }} />
            </span>
          </button>
        ))}
      </div>
      <p className="muted small">Cevaplar yalnızca bu telefonda kalır. Puan ya da tanı üretmez.</p>
    </main>
  )
}
