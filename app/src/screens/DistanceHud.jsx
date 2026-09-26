import { useEffect, useRef, useState } from 'react'
import { ScanFace, ArrowRight } from 'lucide-react'
import { StepHeader } from '../components/ui.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { distanceStatus, REFERENCE_MM } from '../lib/distance.js'

// TrueDepth (Face ID kamerası) ile canlı mesafe. Kalibrasyon yok: sensör gerçek
// uzaklığı ölçer. Bu ekran yalnızca kullanıcıya 40 cm'nin nasıl bir mesafe olduğunu
// gösterir; doğru mesafe 1,5 sn tutulunca devam edilir.
const HOLD_MS = 1500
const MIN_MM = 200
const MAX_MM = 700

export default function DistanceHud({ step, total, onDone }) {
  const { mm, face, ready, error } = useFaceTracking({ enabled: true, trueDepth: true })
  const status = face ? distanceStatus(mm) : 'unknown'
  const [held, setHeld] = useState(0)
  const since = useRef(null)

  useEffect(() => {
    if (status === 'ok') {
      if (since.current == null) since.current = performance.now()
      const t = setInterval(() => setHeld(Math.min(1, (performance.now() - since.current) / HOLD_MS)), 50)
      return () => clearInterval(t)
    }
    since.current = null
    setHeld(0)
    return undefined
  }, [status])

  const done = held >= 1
  const cm = mm ? Math.round(mm / 10) : null
  // Gösterge: 20–70 cm aralığı 270° yaya eşlenir
  const frac = mm ? Math.max(0, Math.min(1, (mm - MIN_MM) / (MAX_MM - MIN_MM))) : 0
  const targetFrac = (REFERENCE_MM - MIN_MM) / (MAX_MM - MIN_MM)
  const R = 110
  const C = 2 * Math.PI * R
  const arc = 0.75 * C
  const message = !ready
    ? 'Sensör başlatılıyor…'
    : error
      ? 'TrueDepth sensörü başlatılamadı'
      : !face
        ? 'Yüzünü kameraya göster'
        : status === 'too-close'
          ? 'Biraz uzaklaştır'
          : status === 'too-far'
            ? 'Biraz yaklaştır'
            : done
              ? 'Mükemmel — 40 cm bu'
              : 'Böyle tut…'

  return (
    <main className="screen fade-in hud-screen">
      <StepHeader step={step} total={total} title="40 cm'yi bul" subtitle="Face ID kameran yüzünün uzaklığını gerçek zamanlı ölçer. Kalibrasyon gerekmez." />

      <div className={`hud ${status} ${done ? 'locked' : ''}`}>
        <svg viewBox="0 0 260 260" className="hud-ring" aria-hidden="true">
          <g transform="rotate(135 130 130)">
            <circle cx="130" cy="130" r={R} style={{ fill: 'none', stroke: 'var(--surface-3)', strokeWidth: 10, strokeDasharray: `${arc} ${C}`, strokeLinecap: 'round' }} />
            <circle
              cx="130"
              cy="130"
              r={R}
              className="hud-value"
              style={{ fill: 'none', strokeWidth: 10, strokeDasharray: `${Math.max(0.001, frac * arc)} ${C}`, strokeLinecap: 'round' }}
            />
            {/* Hedef işareti (40 cm) */}
            <line
              x1={130 + (R - 14) * Math.cos(targetFrac * 1.5 * Math.PI)}
              y1={130 + (R - 14) * Math.sin(targetFrac * 1.5 * Math.PI)}
              x2={130 + (R + 14) * Math.cos(targetFrac * 1.5 * Math.PI)}
              y2={130 + (R + 14) * Math.sin(targetFrac * 1.5 * Math.PI)}
              style={{ stroke: 'var(--ink)', strokeWidth: 3, strokeLinecap: 'round' }}
            />
          </g>
          {held > 0 && (
            <circle
              cx="130"
              cy="130"
              r="92"
              transform="rotate(-90 130 130)"
              style={{ fill: 'none', stroke: 'var(--ok)', strokeWidth: 4, strokeDasharray: `${held * 2 * Math.PI * 92} ${2 * Math.PI * 92}`, strokeLinecap: 'round' }}
            />
          )}
        </svg>
        <div className="hud-center">
          <div className="hud-face">
            <ScanFace size={40} strokeWidth={1.5} />
            {face && !done && <span className="hud-scan" />}
          </div>
          <div className="hud-cm">{cm ?? '––'}<span>cm</span></div>
          <div className="hud-target">hedef 40 cm</div>
        </div>
      </div>

      <p className="hud-msg" role="status" aria-live="polite">{message}</p>

      <button className="btn" disabled={!done} onClick={() => onDone({ method: 'truedepth', date: new Date().toISOString() })}>
        Devam <ArrowRight size={18} aria-hidden="true" />
      </button>
      <p className="muted small" style={{ textAlign: 'center' }}>
        Testlerde bu mesafe sürekli ölçülür; uzaklaşırsan harf boyutu otomatik düzeltilir.
      </p>
    </main>
  )
}
