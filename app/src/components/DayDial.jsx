import { bladePaths, A_DONE } from './TodayPath.jsx'

// Günün diyaframı (tasarım: Artifact "Nefona Bugün ve Profil"). Dış halka = bugünün durakları (biten renkli,
// sıradaki beyaz nokta, mola ay), içte diyafram: yaptıkça açılır, yol bitince iris tam görünür.
// Açıklık gün başında da 9 (irisin ışığı görünsün), 9/9'da A_DONE.
const OPEN_MIN = 9
const R = 90
const GAP = 7

function arc(a0, a1) {
  const p = (a) => [100 + R * Math.cos(a), 100 + R * Math.sin(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

export default function DayDial({ plan, size = 172 }) {
  const stops = plan?.stops ?? []
  const n = stops.length
  const done = stops.filter((s) => s.done).length
  const open = n ? OPEN_MIN + ((A_DONE - OPEN_MIN) * done) / n : OPEN_MIN
  const { blades, edges } = bladePaths(open)
  const seg = n ? (2 * Math.PI) / n : 0
  const g = n > 1 ? GAP / R : 0
  return (
    <svg className="dd" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="dd-ig" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19C2D1" />
          <stop offset="1" stopColor="#3E7BFA" />
        </linearGradient>
        <radialGradient id="dd-iris" cx=".5" cy=".5" r=".5">
          <stop offset=".22" stopColor="#070C12" />
          <stop offset=".25" stopColor="#0F6F8A" />
          <stop offset=".6" stopColor="#19C2D1" />
          <stop offset="1" stopColor="#3E7BFA" />
        </radialGradient>
        <radialGradient id="dd-glow" cx=".5" cy=".5" r=".5">
          <stop offset=".55" stopColor="#5EDCE6" stopOpacity="0" />
          <stop offset="1" stopColor="#5EDCE6" stopOpacity=".35" />
        </radialGradient>
        <linearGradient id="dd-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".09" />
          <stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {stops.map((s, i) => {
        const a0 = -Math.PI / 2 + i * seg + g / 2
        const a1 = a0 + seg - g
        const m = (a0 + a1) / 2
        const next = s === plan.next && !s.done
        const cls = s.done ? 'd' : next ? 'n' : s.restSlot ? 'r' : 'l'
        return (
          <g key={s.key}>
            <path className={`dd-tk ${cls}`} d={arc(a0, a1)} />
            {next && <circle className="dd-now" cx={100 + R * Math.cos(m)} cy={100 + R * Math.sin(m)} r="5.5" />}
            {s.restSlot && !s.done && (
              <path className="dd-moon" transform={`translate(${(100 + (R - 15) * Math.cos(m)).toFixed(1)} ${(100 + (R - 15) * Math.sin(m)).toFixed(1)})`} d="M1.5 -5a5 5 0 1 0 3.5 8.5a4 4 0 0 1-3.5-8.5z" />
            )}
          </g>
        )
      })}
      <g transform="translate(22 22) scale(1.56)">
        <circle className="dd-well" cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="34" fill="url(#dd-iris)" />
        <circle cx="50" cy="50" r="34" fill="url(#dd-glow)" />
        <circle cx="54.5" cy="45.5" r="2.6" fill="#FFFFFF" />
        {blades.map((b, i) => <path key={i} className={`dd-${b.cls}`} d={b.d} />)}
        {edges.map((d, i) => <path key={`e${i}`} className="dd-be" d={d} />)}
        <circle cx="50" cy="50" r="46" fill="url(#dd-sheen)" />
        <circle className="dd-rim" cx="50" cy="50" r="46" />
      </g>
    </svg>
  )
}
