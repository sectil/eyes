import { useEffect, useState } from 'react'
import FirstLook from './FirstLook.jsx'
import Safety from './Safety.jsx'
import IrisQuestions from './IrisQuestions.jsx'
import { normalizeProfile } from '../lib/profile.js'
import { IRIS_QUESTIONS, missing } from '../lib/profileQuestions.js'
import { withBaseline } from '../lib/iris.js'

// İlk açılış (Artifact "Nefona Başlangıç Kartı", onaylı; sahibinin 27 Eylül kararı): güvenlik bilgisi → İlk Bakış (Göz) →
// iris haritasının 4 sorusu. Yaş sorulmaz: doğum tarihi sonraki "Seni tanıyalım" ekranında (App.jsx). Güvenlik soru
// değil bilgi; kilit yok. Son soruda iris başlangıcı yazılır (lib/iris.js).
// bar: bu ekranların kurulum ilerleme çubuğundaki payı; sonraki adımlar kalan payı böler.
export const ONBOARD_SHARE = 0.6

// Profilim → Sorularım da aynı güvenlik bilgisini açar
export const Flags = Safety

// onDone(profil): güvenlik bilgisi okundu ve sorular bitti.
export default function Onboarding({ initial = null, trueDepth = false, sessions = [], domainOf, onDone }) {
  const [p, setP] = useState(() => normalizeProfile(initial))
  const firstStep = (q) => (!q.flagsChecked ? 'safety' : !q.firstLook ? 'look' : 'questions')
  const [step, setStep] = useState(() => firstStep(p))
  const share = (a, b) => [a * ONBOARD_SHARE, b * ONBOARD_SHARE]
  const date = () => p.date ?? new Date().toISOString()

  if (step === 'safety') {
    return (
      <Safety
        profile={p}
        bar={0.06 * ONBOARD_SHARE}
        onDone={(np) => {
          setP(np)
          setStep(np.firstLook ? 'questions' : 'look')
        }}
      />
    )
  }
  if (step === 'look') {
    return <FirstLook trueDepth={trueDepth} bar={share(0.1, 0.45)} onDone={(look) => { setP((q) => ({ ...q, firstLook: look })); setStep('questions') }} />
  }
  return <Questions profile={p} bar={share(0.5, 1)} sessions={sessions} domainOf={domainOf} onSave={setP} onDone={(np) => onDone(withBaseline({ ...np, date: np.date ?? date() }))} />
}

// Soru listesi girişte bir kez sabitlenir: cevaplanan soru listeden düşüp sırayı kaydırmasın (tarayıcıda görüldü:
// 1. sorudan sonra uyku atlanıyordu)
function Questions({ profile, onDone, ...rest }) {
  const [ids] = useState(() => missing(profile, IRIS_QUESTIONS))
  const empty = ids.length === 0
  useEffect(() => {
    if (empty) onDone(profile)
  }, [empty]) // eslint-disable-line react-hooks/exhaustive-deps
  if (empty) return null
  return <IrisQuestions ids={ids} profile={profile} onDone={onDone} {...rest} />
}
