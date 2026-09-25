import { ChevronRight, Lock } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { registry } from '../modules/registry.js'
import { viewFor } from '../modules/views.js'
import { profileSignals } from '../lib/profile.js'
import { firstAndBest, msLabel } from '../lib/quicklook.js'
import '../styles/awareness.css'

// Farkındalık merkezi (atlas 49): dikkat halkasındaki modüller, üstte Hızlı Bakış eşiği.
// Liste kayıt defterinden gelir (ring 'attention'); modül takılınca/çıkarılınca kendiliğinden değişir.
export default function Awareness({ sessions = [], settings, native = {}, onGo, onBack }) {
  const now = new Date()
  const sig = profileSignals(settings?.profile)
  const fb = firstAndBest(sessions)
  const mods = registry.live.filter((m) => m.ring === 'attention' && m.id !== 'awareness' && viewFor(m.id))
  const order = { 'quick-look': 0, notice: 1 }
  mods.sort((a, b) => (order[a.id] ?? 9) - (order[b.id] ?? 9))
  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} eyebrow="Dikkat halkası" title="Farkındalık" subtitle="Görürüz ama fark etmeyiz. Burada fark etmeyi ölçer ve çalıştırırız." />
      {fb.n > 0 && (
        <button type="button" className="card card-hero aw-hero" onClick={() => onGo('quick-look')}>
          <span className="muted small">Hızlı Bakış eşiğin</span>
          <strong>{msLabel(fb.last)}</strong>
          <span className="muted small">{fb.last < fb.first ? `ilk ölçüm ${msLabel(fb.first)} · daha hızlı` : `ilk ölçüm ${msLabel(fb.first)}`}</span>
          <span className="muted small">Hem ortayı hem kenarı doğru yakaladığın en kısa süre.</span>
        </button>
      )}
      <div className="aw-list">
        {mods.map((m) => {
          const v = viewFor(m.id)
          const Icon = v.icon
          const blocked = m.id === 'quick-look' && sig.flashSafe === false
          let rows = []
          try {
            rows = m.stats?.(sessions, now) ?? []
          } catch {
            rows = []
          }
          return (
            <button key={m.id} type="button" className="card aw-row" onClick={() => onGo((m.routes ?? [m.id])[0])}>
              <span className="rl-free-ic"><Icon size={20} aria-hidden="true" /></span>
              <span className="grow">
                <span className="aw-title">{m.title}</span>
                <span className="muted small">{blocked ? 'Profil cevabına göre kapalı' : rows[0] ? `${rows[0].label}: ${rows[0].value}` : v.sub?.({ sessions, settings, native }) ?? 'Başla'}</span>
              </span>
              {blocked ? <Lock size={16} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      <p className="note small">Bu bölümdeki pratikler görevdeki gelişimi gösterir; hastalık önleme ya da sürüş güvenliği iddiası yoktur.</p>
    </main>
  )
}
