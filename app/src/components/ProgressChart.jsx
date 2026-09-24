import { useRef, useState } from 'react'

// Tek göz için görme keskinliği zaman serisi.
// Y ekseni ters: yukarı = daha iyi görme (düşük logMAR).
// Renkler: dataviz referans paleti koyu mod mavi (#3987e5, doğrulayıcıdan geçti);
// günlük noktalar ve eksenler metin/ikincil mürekkep tonlarında.
const W = 340
const H = 200
const PAD = { l: 40, r: 12, t: 12, b: 28 }
const LINE = '#3987e5'
const POINT = '#94a3b8'
const INK = '#cbd5e1'
const GRID = '#334155'

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
  // Ters eksen: düşük logMAR yukarıda
  const y = (v) => PAD.t + ((v - yLo) / (yHi - yLo)) * (H - PAD.t - PAD.b)

  const ticks = []
  for (let v = yLo; v <= yHi + 1e-9; v = +(v + 0.1).toFixed(1)) ticks.push(v)
  const linePath = series.map((p, i) => `${i ? 'L' : 'M'}${x(t[i]).toFixed(1)},${y(p.rolling7).toFixed(1)}`).join('')

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    for (let i = 1; i < series.length; i++) if (Math.abs(x(t[i]) - px) < Math.abs(x(t[best]) - px)) best = i
    setHover(best)
  }

  const h = hover != null ? series[hover] : null

  return (
    <figure className="chart">
      <div className="legend">
        <span><i className="dot" style={{ background: POINT }} /> Günlük ölçüm</span>
        <span><i className="bar" style={{ background: LINE }} /> 7 günlük ortanca</span>
        {baseline != null && <span><i className="dash" /> Başlangıç</span>}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Görme keskinliği zaman içinde"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ width: '100%', touchAction: 'pan-y' }}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth="1" />
            <text x={PAD.l - 6} y={y(v) + 4} fill={INK} fontSize="10" textAnchor="end">{v.toFixed(1)}</text>
          </g>
        ))}
        <text x={PAD.l} y={H - 8} fill={INK} fontSize="10">{fmtDate(series[0].date)}</text>
        <text x={W - PAD.r} y={H - 8} fill={INK} fontSize="10" textAnchor="end">{fmtDate(series.at(-1).date)}</text>
        {baseline != null && (
          <line x1={PAD.l} x2={W - PAD.r} y1={y(baseline)} y2={y(baseline)} stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {series.map((p, i) => (
          <circle key={p.date} cx={x(t[i])} cy={y(p.logMAR)} r="4" fill={POINT} stroke="#1e293b" strokeWidth="2" />
        ))}
        <path d={linePath} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        {h && (
          <line x1={x(t[hover])} x2={x(t[hover])} y1={PAD.t} y2={H - PAD.b} stroke={INK} strokeWidth="1" opacity="0.6" />
        )}
      </svg>
      <p className="axis-note">logMAR — yukarı = daha iyi görme</p>
      {h && (
        <div className="tooltip" role="status">
          {fmtDate(h.date)} · ölçüm {h.logMAR.toFixed(2)} · 7 gün {h.rolling7.toFixed(2)}
        </div>
      )}
      <details>
        <summary>Tablo olarak göster</summary>
        <table>
          <thead><tr><th>Tarih</th><th>Ölçüm</th><th>7 günlük ortanca</th></tr></thead>
          <tbody>
            {series.map((p) => (
              <tr key={p.date}><td>{fmtDate(p.date)}</td><td>{p.logMAR.toFixed(2)}</td><td>{p.rolling7.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
