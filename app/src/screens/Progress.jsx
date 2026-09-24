import { useMemo, useState } from 'react'
import { BookText, TriangleAlert } from 'lucide-react'
import ProgressChart from '../components/ProgressChart.jsx'
import { PageHeader } from '../components/ui.jsx'
import { analyzeTrend, trendMessage } from '../lib/trend.js'
import { snellen20 } from '../lib/optotype.js'

const EYES = [
  ['R', 'Sağ'],
  ['L', 'Sol'],
  ['OU', 'İki göz'],
]

export default function Progress({ tests }) {
  const [eye, setEye] = useState('OU')
  const r = useMemo(
    () => analyzeTrend(tests.filter((t) => (t.type === 'va-daily' || t.type === 'va-weekly') && t.eye === eye)),
    [tests, eye],
  )
  const reading = tests.filter((t) => t.type === 'reading').slice(-6).reverse()
  const tone = r.alert === 'red' ? 'tone-danger' : r.alert === 'yellow' ? 'tone-warn' : ''

  return (
    <>
      <PageHeader title="Gelişim" subtitle="Tek güne değil, haftalık eğilime bakıyoruz." />

      <div className="segmented" role="tablist">
        {EYES.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={eye === id} onClick={() => setEye(id)}>{label}</button>
        ))}
      </div>

      <section className={`card ${tone}`}>
        {r.alert && <TriangleAlert size={20} />}
        <p>{trendMessage(r)}</p>
        {r.baseline != null && (
          <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
            <div className="metric">
              <span className="eyebrow">Başlangıç</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{r.baseline.toFixed(2)}</span>
              <span className="muted small">{snellen20(r.baseline)}</span>
            </div>
            <div className="metric">
              <span className="eyebrow">Son 7 gün</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{r.current7?.toFixed(2) ?? '—'}</span>
              <span className="muted small">{r.current7 != null ? snellen20(r.current7) : ''}</span>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <ProgressChart series={r.series} baseline={r.baseline} />
      </section>

      <section className="card">
        <div className="row"><BookText size={18} /><h2>Okuma testleri</h2></div>
        {!reading.length && <p className="muted small">Henüz okuma testi yok.</p>}
        {reading.map((t) => (
          <div key={t.id} className="row between small" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <span className="muted">{new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
            <span><strong>{t.maxReadingSpeed ?? '—'}</strong> kelime/dk</span>
            <span className="muted">kritik {t.criticalPrintSize ?? '—'}</span>
          </div>
        ))}
        <p className="muted small">Okuma hızını yalnızca bu cihazdaki önceki sonuçlarınla karşılaştır.</p>
      </section>
    </>
  )
}
