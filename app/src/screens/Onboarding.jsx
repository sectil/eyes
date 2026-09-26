import { useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import FirstLook from './FirstLook.jsx'
import QuestionFlow, { ProgressBar, WhyLine, WHY_MS } from '../components/QuestionFlow.jsx'
import { RED_FLAGS, normalizeProfile } from '../lib/profile.js'
import '../styles/profile.css'

// İlk açılış (Artifact "Önce Fark Ettir"): 20 sn farkındalık anı → yaş aralığı → uyarı işaretleri. Diğer sorular
// yerinde sorulur (lib/profileQuestions.js). Uyarı işareti seçilirse eski sevk kuralı: devam edilmez.
// bar: bu ekranların kurulum ilerleme çubuğundaki payı [başlangıç, bitiş]; sonraki kurulum adımları (mesafe)
// StepHeader ile aynı çubuğu sürdürür.
export const ONBOARD_SHARE = 0.6

export function Flags({ profile, bar, onDone }) {
  const [flags, setFlags] = useState(profile.flags ?? [])
  const [cleared, setCleared] = useState(false)
  const referred = flags.length > 0
  const toggle = (id) => setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const none = () => {
    setFlags([])
    setCleared(true)
    onDone({ ...profile, flags: [], flagsChecked: true }, true)
  }
  return (
    <main className="screen fade-in oq">
      <div className="oq-top"><ProgressBar value={bar} /></div>
      <h1 className="oq-q">Şu an bunlardan biri var mı?</h1>
      <button type="button" className="oq-none" onClick={none}>
        <Check size={24} strokeWidth={2.6} aria-hidden="true" /> Hiçbiri yok
      </button>
      {cleared && <WhyLine text="Bunlardan biri ortaya çıkarsa beni değil, bir göz doktorunu ara." />}
      <span className="muted small">Varsa işaretle:</span>
      <div className="oq-flags">
        {RED_FLAGS.map((f) => (
          <label key={f.id} className={`oq-flag${flags.includes(f.id) ? ' on' : ''}`}>
            <input type="checkbox" checked={flags.includes(f.id)} onChange={() => toggle(f.id)} />
            <span>{f.text}</span>
          </label>
        ))}
      </div>
      {referred && (
        <>
          <section className="card tone-danger" role="alert">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
              <div className="stack" style={{ gap: 6 }}>
                <h3>Lütfen önce bir göz doktoruna başvur</h3>
                <p className="small">
                  İşaretlediğin belirtiler acil değerlendirme gerektirebilir; bu uygulama bunları değerlendiremez.
                  Aniden başladıysa bugün bir göz doktoruna veya acil servise git.
                </p>
              </div>
            </div>
          </section>
          <button type="button" className="btn" onClick={() => onDone({ ...profile, flags, flagsChecked: true }, false)}>Kaydet</button>
          <p className="muted small">Belirtiler geçtikten ve doktorun onayladıktan sonra bu ekranı yeniden doldurabilirsin.</p>
        </>
      )}
    </main>
  )
}

// onDone(profil): yaş ve işaretler cevaplandı (işaret varsa referred profil kaydedilir, kurulum kilitli kalır).
// skipLook: eski kullanıcı ya da işaret sonrası geri dönüş (20 sn anı yeniden gösterilmez).
export default function Onboarding({ initial = null, trueDepth = false, skipLook = false, onDone }) {
  const [p, setP] = useState(() => normalizeProfile(initial))
  const [step, setStep] = useState(() => (skipLook || p.firstLook ? (p.ageBand ? 'flags' : 'age') : 'look'))
  const share = (a, b) => [a * ONBOARD_SHARE, b * ONBOARD_SHARE]

  if (step === 'look') {
    return <FirstLook trueDepth={trueDepth} bar={share(0, 0.5)} onDone={(look) => { setP((q) => ({ ...q, firstLook: look })); setStep('age') }} />
  }
  if (step === 'age') {
    return <QuestionFlow ids={['age']} profile={p} bar={share(0.5, 0.75)} onSave={setP} onDone={(np) => { setP(np); setStep('flags') }} />
  }
  return (
    <Flags
      profile={p}
      bar={0.8 * ONBOARD_SHARE}
      onDone={(np, clear) => {
        const done = { ...np, date: np.date ?? new Date().toISOString() }
        // "Hiçbiri yok": cümle kısa bir an görünsün, sonra kurulum devam etsin
        if (clear) setTimeout(() => onDone(done), WHY_MS)
        else onDone(done)
      }}
    />
  )
}
