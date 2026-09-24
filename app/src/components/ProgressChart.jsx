import { useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { decimalTr } from '../lib/stats.js'

// Tek göz için görme keskinliği zaman serisi.
// Y ekseni ters: yukarı = daha iyi görme (düşük logMAR).
// Renkler tema değişkenlerinden: --chart-line (açık #0f9d8a / koyu #11a594, dataviz
// doğrulayıcıdan geçti), --chart-point ve --ink-3 ikincil mürekkep.
const W = 340
const H = 200
const PAD = { l: 34, r: 10, t: 10, b: 26 }

const fmtDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

export default function ProgressChart({ series, baseline }) {
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null)
  if (!series.length) return <p className="muted">Grafik için henüz ölçüm yok.</p>

  const t = series.map((p) => new Date(p.date).getTime())
  const tMin = Math.min(...t)
  const tMax = Math.max(...t, tMin + 86400000)
  const vals = series.flatMap((p) => [p.logMAR, p.rolling7]).concat(baseline ?? [])
  const yLo = Math.floor((Math.min(...vals) - 0.05) * 10) / 10
  const yHi = Math.ceil((Math.max(...vals) + 0.05) * 10) / 10

  const x = (ms) => PAD.l + ((ms - tMin) / (tMax - tMin)) * (W - PAD.l - PAD.r)
  const y = (v) => PAD.t + ((v - yLo) / (yHi - yLo)) * (H - PAD.t - PAD.b)

  const ticks = []
  for (let v = yLo; v <= yHi + 1e-9; v = +(v + 0.1).toFixed(1)) ticks.push(v)
  const linePath = series.map((p, i) => `${i ? 'L' : 'M'}${x(t[i]).toFixed(1)},${y(p.rolling7).toFixed(1)}`).join('')
  const areaPath = `${linePath}L${x(t.at(-1)).toFixed(1)},${H - PAD.b}L${x(t[0]).toFixed(1)},${H - PAD.b}Z`

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    for (let i = 1; i < series.length; i++) if (Math.abs(x(t[i]) - px) < Math.abs(x(t[best]) - px)) best = i
    setHover(best)
  }

  const h = hover != null ? series[hover] : null
  const text = { fill: 'var(--ink-3)', fontSize: 10, fontFamily: 'inherit' }

  return (
    <figure className="chart stack" style={{ margin: 0 }}>
      <div className="legend">
        <span><i className="dot" /> Günlük ölçüm</span>
        <span><i className="bar" /> 7 günlük ortanca</span>
        {baseline != null && <span><i className="dash" /> Başlangıç</span>}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Görme keskinliği zaman içinde"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ width: '100%', touchAction: 'pan-y', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.18 }} />
            <stop offset="100%" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
            <text x={PAD.l - 6} y={y(v) + 3.5} textAnchor="end" style={text}>{decimalTr(v, 1)}</text>
          </g>
        ))}
        <text x={PAD.l} y={H - 6} style={text}>{fmtDate(series[0].date)}</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" style={text}>{fmtDate(series.at(-1).date)}</text>
        <path d={areaPath} style={{ fill: 'url(#area)' }} />
        {baseline != null && (
          <line x1={PAD.l} x2={W - PAD.r} y1={y(baseline)} y2={y(baseline)} style={{ stroke: 'var(--ink-3)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
        )}
        {series.map((p, i) => (
          <circle key={p.date} cx={x(t[i])} cy={y(p.logMAR)} r={hover === i ? 5 : 3.5} style={{ fill: 'var(--chart-point)', stroke: 'var(--surface)', strokeWidth: 2 }} />
        ))}
        <path d={linePath} style={{ fill: 'none', stroke: 'var(--chart-line)', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
        {h && <line x1={x(t[hover])} x2={x(t[hover])} y1={PAD.t} y2={H - PAD.b} style={{ stroke: 'var(--ink-3)', strokeWidth: 1, opacity: 0.6 }} />}
      </svg>
      <span className="axis-note">logMAR · yukarı = daha iyi görme</span>
      {h && (
        <div className="tooltip" role="status">
          {fmtDate(h.date)} · ölçüm {decimalTr(h.logMAR)} · 7 gün {decimalTr(h.rolling7)}
        </div>
      )}
      <details>
        <summary><ChevronRight size={16} /> Tablo olarak göster</summary>
        <table className="data-table">
          <thead><tr><th>Tarih</th><th>Ölçüm</th><th>7 günlük ortanca</th></tr></thead>
          <tbody>
            {series.map((p) => (
              <tr key={p.date}><td>{fmtDate(p.date)}</td><td>{decimalTr(p.logMAR)}</td><td>{decimalTr(p.rolling7)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
