import { useState } from 'react'

// Genel klinik uyarı işaretleri. Yayın öncesi bir göz hekimi tarafından
// gözden geçirilmelidir (bkz. eyes-arastirma/SENTEZ_RAPORU.md §5).
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

export default function Screening({ onDone }) {
  const [age, setAge] = useState('')
  const [flags, setFlags] = useState([])
  const [correction, setCorrection] = useState('')
  const [lastExam, setLastExam] = useState('')

  const toggle = (id) =>
    setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const ageNum = Number(age)
  const valid = ageNum >= 18 && ageNum <= 110 && correction && lastExam
  const referred = flags.length > 0

  function submit() {
    onDone({
      date: new Date().toISOString(),
      age: ageNum,
      flags,
      correction,
      lastExam,
      referred,
    })
  }

  return (
    <main className="screen">
      <h1>Başlamadan önce</h1>
      <p className="muted">
        Bu uygulama yakın görmenizi ölçer ve takip eder. <strong>Teşhis koymaz,
        göz muayenesinin yerini tutmaz.</strong> Tüm veriler yalnızca bu cihazda saklanır.
      </p>

      <section className="card">
        <label className="field">
          <span>Yaşınız</span>
          <input
            type="number"
            inputMode="numeric"
            min="18"
            max="110"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </label>
      </section>

      <section className="card">
        <h2>Şu anda aşağıdakilerden biri var mı?</h2>
        {RED_FLAGS.map((f) => (
          <label key={f.id} className="check">
            <input type="checkbox" checked={flags.includes(f.id)} onChange={() => toggle(f.id)} />
            <span>{f.text}</span>
          </label>
        ))}
      </section>

      {referred && (
        <section className="card alert-danger" role="alert">
          <h2>Lütfen önce bir göz doktoruna başvurun</h2>
          <p>
            İşaretlediğiniz belirtiler acil değerlendirme gerektirebilir. Bu uygulama bu
            durumları değerlendiremez. Belirtiler aniden başladıysa bugün bir göz
            doktoruna veya acil servise gidin.
          </p>
        </section>
      )}

      <section className="card">
        <h2>Gözlük / lens durumunuz</h2>
        {CORRECTION.map((c) => (
          <label key={c.id} className="check">
            <input
              type="radio"
              name="correction"
              checked={correction === c.id}
              onChange={() => setCorrection(c.id)}
            />
            <span>{c.text}</span>
          </label>
        ))}
        <p className="muted small">
          Testlerde uzak gözlüğünüz varsa takın, okuma gözlüğünüzü takmayın.
        </p>
      </section>

      <section className="card">
        <h2>Son göz muayeneniz</h2>
        {[
          ['lt1', '1 yıldan yakın'],
          ['1to2', '1–2 yıl önce'],
          ['gt2', '2 yıldan uzun / hatırlamıyorum'],
        ].map(([id, text]) => (
          <label key={id} className="check">
            <input
              type="radio"
              name="exam"
              checked={lastExam === id}
              onChange={() => setLastExam(id)}
            />
            <span>{text}</span>
          </label>
        ))}
        {lastExam === 'gt2' && ageNum >= 40 && (
          <p className="alert-warn small">
            40 yaş üstünde düzenli göz muayenesi önerilir. Uygulamayı kullanırken bir
            muayene planlamanızı öneririz.
          </p>
        )}
      </section>

      <button className="btn" disabled={!valid || referred} onClick={submit}>
        Devam et
      </button>
      {referred && (
        <p className="muted small">
          Belirtiler geçtikten ve doktorunuz onayladıktan sonra bu ekranı yeniden
          doldurabilirsiniz.
        </p>
      )}
    </main>
  )
}
