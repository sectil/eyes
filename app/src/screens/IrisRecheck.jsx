import { useState } from 'react'
import FirstLook from './FirstLook.jsx'
import IrisQuestions from './IrisQuestions.jsx'
import IrisPlan from './IrisPlan.jsx'
import { normalizeProfile } from '../lib/profile.js'
import { IRIS_QUESTIONS } from '../lib/profileQuestions.js'
import { withRecheck } from '../lib/iris.js'

// 28. gün (Artifact "Nefona Başlangıç Kartı", onaylı): iris haritası yeniden. İlk Bakış (Göz) ve aynı 4 soru, sonra
// başlangıçla yan yana harita. Ana sayfa kartından açılır (lib/profileQuestions.js pendingCard 'iris').
// onSave(profil): her adımda; onClose(): Ana sayfaya.
export default function IrisRecheck({ profile, trueDepth = false, name = '', sessions = [], domainOf, onSave, onClose }) {
  const [p, setP] = useState(() => normalizeProfile(profile))
  const [step, setStep] = useState(() => (normalizeProfile(profile).iris.recheck ? 'compare' : 'look'))
  const save = (np) => {
    setP(np)
    onSave(np)
  }
  if (step === 'look') {
    return <FirstLook trueDepth={trueDepth} bar={[0, 0.4]} onDone={(look) => { save({ ...p, firstLook: look }); setStep('questions') }} />
  }
  if (step === 'questions') {
    return (
      <IrisQuestions
        ids={IRIS_QUESTIONS}
        profile={p}
        recheck
        bar={[0.45, 1]}
        sessions={sessions}
        domainOf={domainOf}
        onSave={setP}
        onDone={(np) => { save(withRecheck(np)); setStep('compare') }}
      />
    )
  }
  return <IrisPlan profile={p} compare name={name} sessions={sessions} domainOf={domainOf} onDone={onClose} />
}
