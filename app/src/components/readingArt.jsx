import { useState } from 'react'
import { fmtLogMAR } from '../lib/reading.js'
import '../styles/reading.css'

// Okuma testi çizimleri (onaylı taslak O1, O3, O9, O10). Saf SVG; renkler reading.css'te.

function arc(c, r, a0, a1) {
  const p = (a) => {
    const t = ((a - 90) * Math.PI) / 180
    return [(c + r * Math.cos(t)).toFixed(2), (c + r * Math.sin(t)).toFixed(2)]
  }
  const [sx, sy] = p(a0)
  const [ex, ey] = p(a1)
  return `M${sx} ${sy} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${ex} ${ey}`
}

// Adım diyaframı: basamak sayısı kadar yay. code: d=okundu h=takıldı f=okuyamadı c=şimdi t=sıradaki g=altın
const STEP_CLASS = { d: 'done', h: 'half', f: 'fail', c: 'cur', t: 'todo', g: 'gold' }
export function StepDial({ code, size = 28 }) {
  const n = Math.max(1, code.length)
  const seg = 360 / n
  return (
    <svg className="rd-dial" width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      {[...code].map((c, i) => (
        <path key={i} d={arc(14, 11, i * seg + 1.5, (i + 1) * seg - 1.5)} className={`rd-dial-${STEP_CLASS[c] ?? 'todo'}`} />
      ))}
    </svg>
  )
}

// 6 kanatlı mesafe diyaframı. open: 0–1 (1 = tam açık), tone: 'ok' | 'out'
export function DistanceIris({ open = 1, tone = 'ok', cm = null, size = 112 }) {
  const c = 50
  const R = 44
  const A = R * Math.max(0.35, Math.min(1, open))
  const th = ((18 + (1 - open) * 48) * Math.PI) / 180
  const V = Array.from({ length: 6 }, (_, k) => {
    const a = th + (k * Math.PI) / 3
    return [c + A * Math.cos(a), c + A * Math.sin(a)]
  })
  const edges = V.map((P, k) => {
    const Q = V[(k + 1) % 6]
    let dx = Q[0] - P[0]
    let dy = Q[1] - P[1]
    const L = Math.hypot(dx, dy)
    dx /= L
    dy /= L
    const qx = Q[0] - c
    const qy = Q[1] - c
    const b = qx * dx + qy * dy
    const t = -b + Math.sqrt(Math.max(0, b * b - (qx * qx + qy * qy - R * R)))
    return [P, [Q[0] + t * dx, Q[1] + t * dy]]
  })
  return (
    <div className="rd-iris" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle cx={c} cy={c} r={R} className="rd-iris-blade" />
        <polygon points={V.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ')} className="rd-iris-open" />
        {edges.map(([P, Q], k) => (
          <line key={k} x1={P[0].toFixed(2)} y1={P[1].toFixed(2)} x2={Q[0].toFixed(2)} y2={Q[1].toFixed(2)} className="rd-iris-edge" />
        ))}
        <circle cx={c} cy={c} r={R + 2.5} className={`rd-iris-ring ${tone === 'out' ? 'out' : 'ok'}`} />
      </svg>
      <span className="rd-iris-num">
        <b>{cm ?? '—'}</b>
        <small>cm</small>
      </span>
    </div>
  )
}

// Jev (paper sahnesinde): iris + göz bebeği; halkalar dışarıdan verilir
export function PaperJev({ ring = null, ripples = [], size = 40 }) {
  return (
    <span className="rd-jev" style={{ width: size, height: size }} aria-hidden="true">
      {ripples.map((k) => <span key={k} className="rd-rip" />)}
      <span className="rd-jev-iris" />
      {ring && <span className={`rd-jev-ring ${ring}`} />}
    </span>
  )
}

// O1: mercek altında sayfa. Üç satır yerinde durur (sol üst köşe sabit), yalnız boy küçülür;
// çevredeki diyafram her basamakta bir diş kapanır.
export function LensIntro({ lines }) {
  const n = 9
  const seg = 360 / n
  return (
    <div className="rd-lens" aria-hidden="true">
      <svg className="rd-lens-teeth" viewBox="0 0 186 186">
        {Array.from({ length: n }, (_, i) => (
          <path key={i} d={arc(93, 87, i * seg + 2.5, (i + 1) * seg - 2.5)} className={`rd-tooth${i < 3 ? ` on t${i + 1}` : ''}`} />
        ))}
      </svg>
      <div className="rd-lens-disk">
        <div className="rd-lens-text">
          <i className="rd-lens-dot" />
          {lines.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  )
}

// Diyafram merdiveni + okuma süresi eğrisi (O9). rows: ladderStatus(record)
export function LadderChart({ rows, cps, ra, detailFor }) {
  const [sel, setSel] = useState(null)
  const n = rows.length
  if (!n) return null
  const x0 = 26
  const dx = n > 1 ? (292 - x0 - 14) / (n - 1) : 0
  const cy = 104
  const secs = rows.filter((r) => r.seconds && r.status !== 'failed').map((r) => r.seconds)
  const tmax = Math.max(12, Math.ceil(Math.max(0, ...secs) / 4) * 4)
  const y = (t) => 76 - (t / tmax) * 56
  const col = (i) => x0 + i * dx
  const rad = (i) => 12 - i * (4 / Math.max(1, n - 1))
  const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-9
  const ci = rows.findIndex((r) => near(r.l, cps))
  const ri = rows.findIndex((r) => near(r.l, ra))
  const i04 = rows.findIndex((r) => near(r.l, 0.4))
  const pts = rows.map((r, i) => (r.seconds && (r.status === 'read' || r.status === 'struggled') ? [col(i), y(Math.min(r.seconds, tmax)), r.status] : null)).filter(Boolean)
  const stack = ci >= 0 && ri >= 0 && Math.abs(ci - ri) <= 1
  const pick = (i) => setSel(i)
  return (
    <div className="rd-ladder">
      <svg viewBox="0 0 300 156" role="group" aria-label="Boy boy okuma süren">
        {[0, tmax / 2, tmax].map((t) => (
          <g key={t}>
            <line x1="16" x2="292" y1={y(t)} y2={y(t)} className="rd-lad-grid" />
            <text x="13" y={y(t) + 3} textAnchor="end" className="rd-lad-axis">{t}</text>
          </g>
        ))}
        <text x="1" y="8" className="rd-lad-axis">sn</text>
        {ci >= 0 && <line x1={col(ci)} x2={col(ci)} y1="12" y2={cy - rad(ci) - 5} className="rd-lad-cps" />}
        {pts.length > 1 && <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} className="rd-lad-curve" />}
        {pts.map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r="2.8" className={`rd-lad-pt${p[2] === 'struggled' ? ' hol' : ''}`} />)}
        {i04 >= 0 && (
          <g>
            <line x1={col(i04)} x2={col(i04)} y1="87" y2="91" className="rd-lad-notch" />
            <text x={col(i04)} y="85" textAnchor="middle" className="rd-lad-notch-t">10 punto</text>
          </g>
        )}
        {rows.map((r, i) => {
          const x = col(i)
          const rr = rad(i)
          const q = rr * 0.42
          return (
            <g key={r.l} tabIndex={0} role="button" aria-label={detailFor(r)} className={sel === i ? 'sel' : ''} onClick={() => pick(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i) } }}>
              <rect x={x - dx / 2 + 1} y={cy - 16} width={Math.max(10, dx - 2)} height="32" rx="6" className="rd-lad-hit" />
              {r.status === 'read' && (<><circle cx={x} cy={cy} r={rr} className="rd-lad-read" /><circle cx={x} cy={cy} r={rr * 0.38} className="rd-lad-pupil" /></>)}
              {r.status === 'struggled' && (<><circle cx={x} cy={cy} r={rr} className="rd-lad-ring" /><path d={`M${x - rr} ${cy} A${rr} ${rr} 0 0 0 ${x + rr} ${cy} Z`} className="rd-lad-half" /></>)}
              {r.status === 'failed' && (<><circle cx={x} cy={cy} r={rr} className="rd-lad-fail" /><path d={`M${x - q} ${cy - q} L${x + q} ${cy + q} M${x + q} ${cy - q} L${x - q} ${cy + q}`} className="rd-lad-x" /></>)}
              {r.status === 'none' && <circle cx={x} cy={cy} r={rr} className="rd-lad-none" />}
              {i === ci && <circle cx={x} cy={cy} r={rr + 3.5} className="rd-lad-cpsring" />}
              {i === ri && <circle cx={x} cy={cy - rr - (i === ci ? 7.5 : 4.5)} r="2.4" className="rd-lad-ra" />}
            </g>
          )
        })}
        {rows.map((r, i) => <text key={`l${r.l}`} x={col(i)} y="131" textAnchor="middle" className="rd-lad-lab">{fmtLogMAR(r.l)}</text>)}
        {ci >= 0 && <text x={col(ci)} y={stack ? 143 : 148} textAnchor="middle" className="rd-lad-tag-c">rahat</text>}
        {ri >= 0 && <text x={col(ri)} y={stack ? 154 : 148} textAnchor="middle" className="rd-lad-tag-r">en küçük</text>}
      </svg>
      <p className="rd-lad-detail" aria-live="polite">{sel == null ? 'Bir daireye dokun, o yazının ayrıntısı çıksın.' : detailFor(rows[sel])}</p>
    </div>
  )
}

// Gelişim satırının altındaki küçük merdiven (O10)
export function LadderStrip({ rows, cps, ra }) {
  const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-9
  const w = 7 + rows.length * 14
  return (
    <svg className="rd-strip" width={w} height="17" viewBox={`0 0 ${w} 17`} aria-hidden="true">
      {rows.map((r, i) => {
        const x = 7 + i * 14
        const y = 10
        const rr = 4.2
        const q = rr * 0.45
        return (
          <g key={r.l}>
            {r.status === 'read' && (<><circle cx={x} cy={y} r={rr} className="rd-lad-read" /><circle cx={x} cy={y} r={rr * 0.38} className="rd-lad-pupil" /></>)}
            {r.status === 'struggled' && (<><circle cx={x} cy={y} r={rr} className="rd-lad-ring" /><path d={`M${x - rr} ${y} A${rr} ${rr} 0 0 0 ${x + rr} ${y} Z`} className="rd-lad-half" /></>)}
            {r.status === 'failed' && (<><circle cx={x} cy={y} r={rr} className="rd-lad-fail" /><path d={`M${x - q} ${y - q} L${x + q} ${y + q} M${x + q} ${y - q} L${x - q} ${y + q}`} className="rd-lad-x" /></>)}
            {r.status === 'none' && <circle cx={x} cy={y} r={rr} className="rd-lad-none" />}
            {near(r.l, cps) && <circle cx={x} cy={y} r={rr + 2.2} className="rd-lad-cpsring" />}
            {near(r.l, ra) && <circle cx={x} cy={y - rr - 2.6} r="1.3" className="rd-lad-ra" />}
          </g>
        )
      })}
    </svg>
  )
}
