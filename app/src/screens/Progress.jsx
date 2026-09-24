import { useMemo, useState } from 'react'
import ProgressChart from '../components/ProgressChart.jsx'
import { analyzeTrend, trendMessage } from '../lib/trend.js'
import { snellen20 } from '../lib/optotype.js'

const EYES = [
  ['R', 'Sağ'],
  ['L', 'Sol'],
  ['OU', 'İki göz'],
]

export default function Progress({ tests, onBack }) {
  const [eye, setEye] = useState('OU')
  const va = tests.filter((t) => (t.type === 'va-daily' || t.type === 'va-weekly') && t.eye === eye)
  const r = useMemo(() => analyzeTrend(va), [va])
  const reading = tests.filter((t) => t.type === 'reading').slice(-8).reverse()

  return (
    <main className="screen">
      <h1>Gelişim</h1>
      <div className="tabs" role="tablist">
        {EYES.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={eye === id} className={eye === id ? 'tab on' : 'tab'} onClick={() => setEye(id)}>
            {label}
          </button>
        ))}
      </div>

      <section className={`card ${r.alert === 'red' ? 'alert-danger' : r.alert === 'yellow' ? 'alert-warn' : ''}`}>
        <p>{trendMessage(r)}</p>
        {r.baseline != null && (
          <p className="muted small">
            Başlangıç: {r.baseline.toFixed(2)} logMAR ({snellen20(r.baseline)}) · Son 7 gün:{' '}
            {r.current7?.toFixed(2) ?? '—'} logMAR
          </p>
        )}
      </section>

      <ProgressChart series={r.series} baseline={r.baseline} />

      <section className="card">
        <h2>Okuma testleri</h2>
        {!reading.length && <p className="muted">Henüz okuma testi yok.</p>}
        {reading.map((t) => (
          <p key={t.id} className="small">
            {new Date(t.date).toLocaleDateString('tr-TR')} · en yüksek hız {t.maxReadingSpeed ?? '—'} kelime/dk ·
            kritik boyut {t.criticalPrintSize ?? '—'} · en küçük okunan {t.readingAcuity ?? '—'} logMAR
          </p>
        ))}
        <p className="muted small">Okuma hızını yalnızca bu cihazdaki önceki sonuçlarınızla karşılaştırın.</p>
      </section>

      <button className="btn btn-ghost" onClick={onBack}>Geri</button>
    </main>
  )
}
