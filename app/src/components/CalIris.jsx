import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { drawCalIris } from '../lib/irisDraw.js'
import { useDarkTheme } from '../hooks/useDarkTheme.js'

// Göz kalibrasyonu hedefi (Artifact "Nefona Göz Kalibrasyonu", onaylı): 52 pt iris, 58 pt altın ilerleme halkası.
// state: '' kayıt | 'ok' kabul (göz bebeği küçülür, onay) | 'warn' baş dönük (halka turuncu) | 'off' yüz yok (soluk).
// progress: 0..1 hedefteki kayıt. Boyut sabit: sol/sağ hedef (ekranın %8 / %92'si) ekrandan taşmasın.
const R = 27.5
const C = 2 * Math.PI * R

export default function CalIris({ state = '', progress = 0 }) {
  const ref = useRef(null)
  const dark = useDarkTheme()
  const ok = state === 'ok'
  useEffect(() => {
    if (ref.current) drawCalIris(ref.current, { size: 52, dark, pupil: ok ? 0.22 : 0.3, fix: !ok, dpr: Math.min(3, globalThis.devicePixelRatio || 2) })
  }, [dark, ok])
  const p = ok ? 1 : Math.max(0, Math.min(1, progress))
  return (
    <span className={`cal-iris${state ? ` ${state}` : ''}`} aria-hidden="true">
      <span className="cal-glow" />
      <canvas ref={ref} />
      <svg className="cal-ring" viewBox="0 0 58 58">
        <circle className="trk" cx="29" cy="29" r={R} />
        <circle className="arc" cx="29" cy="29" r={R} style={{ strokeDasharray: `${p * C} ${C}` }} />
      </svg>
      {ok && <span className="cal-ok"><Check size={12} strokeWidth={3.2} /></span>}
    </span>
  )
}
