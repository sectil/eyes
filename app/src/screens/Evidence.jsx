import { EVIDENCE, NOT_CLAIMED, NOT_CLAIMED_SOURCES } from '../lib/evidence.js'

export default function Evidence({ onBack }) {
  return (
    <main className="screen">
      <h1>Bu neye dayanıyor?</h1>
      <p className="muted">
        Her özellik için ne söylediğimizi, dayandığı araştırmayı ve sınırlarını yazıyoruz.
      </p>

      {EVIDENCE.map((e) => (
        <details key={e.id} className="card">
          <summary>
            <strong>{e.title}</strong> <span className="badge">Kanıt: {e.level}</span>
          </summary>
          <p>{e.claim}</p>
          <p className="small"><strong>Dayanak:</strong> {e.basis}</p>
          <p className="small"><strong>Sınırlar:</strong> {e.limits}</p>
          <ul className="small muted">
            {e.sources.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </details>
      ))}

      <section className="card alert-warn">
        <h2>Söylemediklerimiz</h2>
        <ul>
          {NOT_CLAIMED.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <ul className="small muted">
          {NOT_CLAIMED_SOURCES.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <p className="muted small">
        Tıbbi bir karar vermeden önce göz doktorunuza danışın. Ani görme kaybı, perde inmesi,
        ışık çakmaları veya göz ağrısında vakit kaybetmeden başvurun.
      </p>
      <button className="btn btn-ghost" onClick={onBack}>Geri</button>
    </main>
  )
}
