import { useState } from 'react'
import { GlassWater, Check, House } from 'lucide-react'
import { PageHeader } from '../../components/ui.jsx'
import { addHabit, loadHabits, habitsOn, dayKey } from '../../lib/habitLog.js'

const todayCount = () => habitsOn(loadHabits(), dayKey(new Date())).filter((h) => h.type === 'water').length

// Su ekranı (sözleşme §5): "Birkaç yudum su?" [İçtim] → addHabit('water') → "Kaydedildi" → Ana sayfa.
function Water({ onBack, onSaved, onHome }) {
  const [saved, setSaved] = useState(false)
  const n = todayCount()

  function drink() {
    if (saved) return
    addHabit('water')
    setSaved(true)
    onSaved?.()
  }

  return (
    <main className="screen fade-in">
      <PageHeader onBack={saved ? undefined : onBack} eyebrow="Yaşam · su" title={saved ? 'Kaydedildi' : 'Birkaç yudum su?'} />
      <section className="card card-hero stack" style={{ gap: 12, alignItems: 'center', textAlign: 'center' }} aria-live="polite">
        <span style={{ width: 72, height: 72, borderRadius: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: saved ? 'var(--ok-bg)' : 'var(--accent-soft)', color: saved ? 'var(--ok)' : 'var(--accent)' }}>
          {saved ? <Check size={36} strokeWidth={2.6} aria-hidden="true" /> : <GlassWater size={34} aria-hidden="true" />}
        </span>
        {saved ? (
          <span className="muted small">{n > 1 ? `Bugün ${n} kez kaydettin.` : 'Bugünün ilk kaydı.'}</span>
        ) : (
          <span className="muted small">İçtiysen ya da şimdi içeceksen dokun.</span>
        )}
      </section>
      {saved ? (
        <button type="button" className="btn" onClick={onHome}><House size={18} aria-hidden="true" /> Ana sayfa</button>
      ) : (
        <button type="button" className="btn" onClick={drink}><Check size={18} aria-hidden="true" /> İçtim</button>
      )}
      <p className="note small">Kayıt yalnızca bu telefonda kalır.</p>
    </main>
  )
}

export default {
  icon: GlassWater,
  // Ana sayfada satırı yok (manifest home yok): sub/badge gerekmez. onSaved: kayıt değişti; App yeniden çizer (bildirim planını App yeniler)
  render: (ctx) => <Water onBack={ctx.back} onSaved={ctx.refresh} onHome={() => ctx.go('home')} />,
}
