import { useMemo } from 'react'
import '../styles/nightscene.css'

// Gece göğü ve su: nefes sayma sahnesi (Artifact "EyeTrail Nefes Sayma Tasarımı", onaylı).
// Sayı GÖSTERİLMEZ (Levinson 2014: sayım zihinde). Sahne yalnızca dokunuşa cevap verir:
// her dokunuş suda bir halka (ripples), uzun basış altın halka, kapanan her set gökte bir yıldız (stars),
// kalan süre ay (remaining 0..1). Renkler sabit koyu: bu sahne her temada gece (göz yormasın).
// Yıldız yuvaları: sol üst (kapat düğmesi) ve sağ üst (ay) boş bırakılır
const STAR_SLOTS = [
  [30, 12], [52, 8], [68, 16], [24, 26], [44, 22], [62, 28], [36, 38], [56, 42], [78, 36], [20, 48], [70, 50], [46, 54], [30, 60], [60, 62], [84, 56], [12, 40],
]
const DIM = [[22, 8], [40, 18], [60, 6], [76, 24], [10, 30], [90, 34], [34, 46], [68, 40], [50, 32], [16, 20], [86, 12], [6, 52], [94, 48], [42, 64], [72, 60], [26, 36]]

export default function NightScene({ stars = 0, remaining = 1, timeText = '', ripples = [], hint = '', hintTone = '', children }) {
  const lit = useMemo(() => STAR_SLOTS.slice(0, Math.min(stars, STAR_SLOTS.length)), [stars])
  const deg = Math.round(Math.max(0, Math.min(1, remaining)) * 360)
  return (
    <div className="ns" aria-hidden="true">
      <div className="ns-sky">
        {DIM.map(([x, y], i) => <i key={`d${i}`} className="ns-star" style={{ left: `${x}%`, top: `${y}%`, opacity: 0.25 + (i % 4) * 0.12 }} />)}
        {lit.map(([x, y], i) => <i key={`s${i}`} className={`ns-star lit${i === lit.length - 1 ? ' new' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} />)}
        <div className="ns-moon" style={{ background: `conic-gradient(#eef3f6 0 ${deg}deg, rgba(255,255,255,0.12) ${deg}deg)` }}>
          <b>{timeText}</b>
        </div>
        {hint && <span className={`ns-hint${hintTone ? ` ${hintTone}` : ''}`}>{hint}</span>}
      </div>
      <div className="ns-water">
        {ripples.map((r) => (
          <span key={r.id} className={`ns-ripple${r.gold ? ' gold' : ''}${r.calm ? ' calm' : ''}`} style={{ left: `${r.x}%`, top: `${r.y}%` }} />
        ))}
      </div>
      {children}
    </div>
  )
}
