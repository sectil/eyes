import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, Eye, Home as HomeIcon, Play, Wind } from 'lucide-react'
import { REASON_TEXT, fmtLeft } from '../lib/eyeBudget.js'
import { eyeStatus } from '../lib/eyeBudgetStore.js'
import { registry } from '../modules/registry.js'
import { viewFor } from '../modules/views.js'
import { haptic } from '../lib/native.js'
import { cue } from '../lib/cue.js'
import { notifyAsked, notifyPermission, askNotifyPermission, declineNotify, scheduleRestEnd } from '../lib/restNotify.js'
import '../styles/restlock.css'

// Zorunlu mola ekranı ("Atla" yok — ürün kararı; bkz. MOLA_KILIDI_VE_YILAN_ANIMASYONU.md §3).
// Kalan süre gerçek saatle hesaplanır; uygulama kapanıp açılsa da doğru. Bu arada kilitsiz etkinlikler
// (göz bütçesine sayılmayanlar: nefes, göz kırpma, fark etme görevi) önerilir.
// target: mola bitince gidilecek ekran (varsa "Devam" düğmesi); onGo(route); onHome().
const SIZE = 220
const STROKE = 12

export default function RestLock({ target = null, targetLabel = '', onGo, onHome }) {
  const [st, setSt] = useState(() => eyeStatus())
  const total = useRef(st.locked ? st.leftMs : 0)
  const announced = useRef(false)
  useEffect(() => {
    const id = setInterval(() => setSt(eyeStatus()), 500)
    return () => clearInterval(id)
  }, [])
  const done = !st.locked
  // Bildirim izni: ilk molada kendi açıklama kartımız, sonra iOS izni (bir kez sorulur)
  const [ask, setAsk] = useState(false)
  useEffect(() => {
    if (!st.locked || notifyAsked()) return
    notifyPermission().then((p) => setAsk(p === 'prompt'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  async function allowNotify() {
    setAsk(false)
    if (await askNotifyPermission()) {
      const now = eyeStatus()
      if (now.locked) scheduleRestEnd(now.until)
    }
  }
  useEffect(() => {
    if (done && !announced.current) {
      announced.current = true
      haptic('success')
      cue('Mola bitti, devam edebilirsin', false)
    }
  }, [done])

  const reason = st.locked ? st.reason : 'budget'
  const txt = REASON_TEXT[reason] ?? REASON_TEXT.budget
  const r = (SIZE - STROKE) / 2
  const c = 2 * Math.PI * r
  const frac = done ? 1 : total.current > 0 ? 1 - st.leftMs / total.current : 0
  const free = registry.live.filter((m) => !m.gates?.eyeBudget && m.home && viewFor(m.id))

  return (
    <main className="screen rl fade-in" aria-live="polite">
      <div className="rl-ring" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={r} className="rl-track" style={{ strokeWidth: STROKE }} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={r}
            className="rl-fill"
            style={{ strokeWidth: STROKE, strokeDasharray: `${c * frac} ${c}` }}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <div className="rl-center">
          {done ? <Eye size={40} aria-hidden="true" /> : <span className="rl-time">{fmtLeft(st.leftMs)}</span>}
          <span className="rl-cap">{done ? 'Hazırsın' : 'kaldı'}</span>
        </div>
      </div>

      <h1 className="rl-title">{done ? 'Mola bitti' : txt.title}</h1>
      <p className="rl-sub">{done ? 'Gözlerin dinlendi. Devam edebilirsin.' : txt.sub}</p>
      {!done && reason !== 'symptom' && (
        <p className="rl-tip">Pencereden dışarı, uzak bir noktaya bak; gözlerini birkaç kez yavaşça kırp.</p>
      )}

      {ask && !done && (
        <div className="card rl-ask">
          <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
            <Bell size={20} aria-hidden="true" style={{ color: 'var(--accent)', flex: 'none', marginTop: 2 }} />
            <p className="small" style={{ textAlign: 'left' }}>Mola bitince haber vereyim mi? Telefonu bırakıp gidebilirsin; süre dolunca bildirim gelir.</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-sm" onClick={allowNotify}><Bell size={16} aria-hidden="true" /> Evet, haber ver</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { declineNotify(); setAsk(false) }}><BellOff size={16} aria-hidden="true" /> Gerek yok</button>
          </div>
        </div>
      )}

      {done && target && (
        <button type="button" className="btn" onClick={() => onGo(target)}>
          <Play size={18} aria-hidden="true" /> {targetLabel ? `Devam: ${targetLabel}` : 'Devam'}
        </button>
      )}

      {!done && free.length > 0 && (
        <section className="rl-free" aria-label="Mola sırasında yapabileceklerin">
          <span className="eyebrow">Bu arada yapabilirsin</span>
          <div className="rl-free-list">
            {free.map((m) => {
              const Icon = viewFor(m.id).icon ?? Wind
              return (
                <button key={m.id} type="button" className="rl-free-item" onClick={() => onGo((m.routes ?? [m.id])[0])}>
                  <span className="rl-free-ic"><Icon size={20} aria-hidden="true" /></span>
                  <span className="rl-free-title">{m.title}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <button type="button" className="btn btn-ghost" onClick={onHome}>
        <HomeIcon size={18} aria-hidden="true" /> Ana sayfa
      </button>
    </main>
  )
}
