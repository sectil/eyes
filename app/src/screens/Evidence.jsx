import { ChevronRight, CircleX } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { EVIDENCE, NOT_CLAIMED, NOT_CLAIMED_SOURCES } from '../lib/evidence.js'

export default function Evidence({ onBack }) {
  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} title="Bu neye dayanıyor?" subtitle="Her özellik için ne söylediğimizi, dayandığı araştırmayı ve sınırlarını yazıyoruz." />

      {EVIDENCE.map((e) => (
        <details key={e.id} className="card evidence">
          <summary>
            <ChevronRight size={16} />
            <span style={{ flex: 1, color: 'var(--ink)' }}>{e.title}</span>
            <span className="badge">{e.level}</span>
          </summary>
          <p style={{ fontWeight: 600 }}>{e.claim}</p>
          <p className="small"><strong>Dayanak.</strong> {e.basis}</p>
          <p className="small"><strong>Sınırlar.</strong> {e.limits}</p>
          <ul className="src">{e.sources.map((s) => <li key={s}>{s}</li>)}</ul>
        </details>
      ))}

      <section className="card tone-accent">
        <h2 style={{ color: 'var(--ink)' }}>Söylemediklerimiz</h2>
        <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {NOT_CLAIMED.map((s) => (
            <li key={s} className="row small" style={{ alignItems: 'flex-start', color: 'var(--ink-2)' }}>
              <CircleX size={16} style={{ flex: 'none', marginTop: 3, color: 'var(--danger)' }} /> {s}
            </li>
          ))}
        </ul>
        <ul className="src">{NOT_CLAIMED_SOURCES.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
    </main>
  )
}
