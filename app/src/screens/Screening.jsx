import { useState } from 'react'
import { ShieldCheck, TriangleAlert, ArrowRight } from 'lucide-react'
import { StepHeader } from '../components/ui.jsx'

// Genel klinik uyarı işaretleri. Yayın öncesi bir göz hekimi tarafından
// gözden geçirilmelidir (bkz. docs/arastirma/SENTEZ_RAPORU.md §5).
export const RED_FLAGS = [
  { id: 'sudden', text: 'Son günlerde bir veya iki gözde ani görme kaybı ya da ani bulanıklık' },
  { id: 'curtain', text: 'Görme alanına perde, gölge inmesi' },
  { id: 'flashes', text: 'Yeni başlayan ışık çakmaları veya uçuşan noktalarda ani artış' },
  { id: 'distortion', text: 'Düz çizgilerin eğri, dalgalı görünmesi' },
  { id: 'pain', text: 'Göz ağrısı, belirgin kızarıklık veya ışığa aşırı hassasiyet' },
  { id: 'diplopia', text: 'Yeni başlayan çift görme' },
]

const CORRECTION = [
  { id: 'none', text: 'Gözlük / lens kullanmıyorum' },
  { id: 'distance', text: 'Sadece uzak gözlüğü / lens' },
  { id: 'reading', text: 'Sadece okuma (yakın) gözlüğü' },
  { id: 'progressive', text: 'Progresif / çift odaklı gözlük' },
  { id: 'contacts-multi', text: 'Multifokal kontakt lens / göz içi lens' },
]

const EXAM = [
  ['lt1', '1 yıldan yakın'],
  ['1to2', '1–2 yıl önce'],
  ['gt2', '2 yıldan uzun / hatırlamıyorum'],
]

export default function Screening({ onDone, total = 3 }) {
  const [age, setAge] = useState('')
  const [flags, setFlags] = useState([])
  const [correction, setCorrection] = useState('')
  const [lastExam, setLastExam] = useState('')

  const toggle = (id) => setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const ageNum = Number(age)
  const valid = ageNum >= 18 && ageNum <= 110 && correction && lastExam
  const referred = flags.length > 0

  function submit() {
    onDone({ date: new Date().toISOString(), age: ageNum, flags, correction, lastExam, referred })
  }

  return (
    <main className="screen fade-in">
      <StepHeader step={1} total={total} title="Başlamadan önce" subtitle="Birkaç soru, sonuçlarını doğru yorumlamamız için." />

      <div className="note">
        <ShieldCheck size={18} />
        <span>Bu uygulama yakın görmeni ölçer ve takip eder. Teşhis koymaz, göz muayenesinin yerini tutmaz. Verilerin yalnızca bu cihazda saklanır.</span>
      </div>

      <label className="field">
        <span>Yaşın</span>
        <input className="input" type="number" inputMode="numeric" min="18" max="110" placeholder="Örn. 48" value={age} onChange={(e) => setAge(e.target.value)} />
      </label>

      <section className="stack">
        <h2>Şu anda bunlardan biri var mı?</h2>
        {RED_FLAGS.map((f) => (
          <label key={f.id} className="choice">
            <input type="checkbox" checked={flags.includes(f.id)} onChange={() => toggle(f.id)} />
            <span>{f.text}</span>
          </label>
        ))}
      </section>

      {referred && (
        <section className="card tone-danger" role="alert">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
            <div className="stack" style={{ gap: 6 }}>
              <h3>Lütfen önce bir göz doktoruna başvur</h3>
              <p className="small">
                İşaretlediğin belirtiler acil değerlendirme gerektirebilir; bu uygulama bunları
                değerlendiremez. Aniden başladıysa bugün bir göz doktoruna veya acil servise git.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="stack">
        <h2>Gözlük / lens durumun</h2>
        {CORRECTION.map((c) => (
          <label key={c.id} className="choice">
            <input type="radio" name="correction" checked={correction === c.id} onChange={() => setCorrection(c.id)} />
            <span>{c.text}</span>
          </label>
        ))}
        <p className="muted small">Testlerde uzak gözlüğün varsa tak, okuma gözlüğünü takma.</p>
      </section>

      <section className="stack">
        <h2>Son göz muayenen</h2>
        {EXAM.map(([id, text]) => (
          <label key={id} className="choice">
            <input type="radio" name="exam" checked={lastExam === id} onChange={() => setLastExam(id)} />
            <span>{text}</span>
          </label>
        ))}
        {lastExam === 'gt2' && ageNum >= 40 && (
          <div className="card tone-warn small">40 yaş üstünde düzenli göz muayenesi önerilir. Uygulamayı kullanırken bir muayene planlamanı öneririz.</div>
        )}
      </section>

      <button className="btn" disabled={!valid || referred} onClick={submit}>
        Devam et <ArrowRight size={18} aria-hidden="true" />
      </button>
      {referred && <p className="muted small">Belirtiler geçtikten ve doktorun onayladıktan sonra bu ekranı yeniden doldurabilirsin.</p>}
    </main>
  )
}
