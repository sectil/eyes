import { Sparkles, Wrench, RefreshCw } from 'lucide-react'
import '../styles/whatsnew.css'

// "Bu güncellemede neler var" (lib/releases.js). Güncellemeden sonra ilk açılışta bir kez; Bilgi → Yenilikler'de tümü.
const KIND = {
  new: { Icon: Sparkles, label: 'Yeni' },
  fix: { Icon: Wrench, label: 'Düzeldi' },
  change: { Icon: RefreshCw, label: 'Değişti' },
}

export function ReleaseList({ releases }) {
  return (
    <div className="wn-list">
      {releases.map((r) => (
        <section key={r.id} className="wn-rel">
          <h2>{r.title}</h2>
          <ul>
            {r.items.map((it, i) => {
              const k = KIND[it.kind] ?? KIND.new
              return (
                <li key={i} className={`wn-item ${it.kind}`}>
                  <span className="wn-kind"><k.Icon size={14} aria-hidden="true" /> {k.label}</span>
                  <span>{it.text}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default function WhatsNew({ releases, onClose, title = 'Bu güncellemede neler var', back = false }) {
  return (
    <main className="screen fade-in wn">
      <header className="page-header" style={{ paddingTop: 8 }}>
        <span className="eyebrow">Yenilikler</span>
        <h1>{title}</h1>
      </header>
      <ReleaseList releases={releases} />
      <button className="btn" onClick={onClose}>{back ? 'Geri' : 'Tamam'}</button>
    </main>
  )
}
