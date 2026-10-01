import { PEGASUS, PEGASUS_LINES, pegasusXY } from '../lib/introStill.js'

// Pegasus yıldız haritası (hesap ekranı; Artifact "Nefona Hoş Geldin Ekranı", onaylı): giriş ekranındaki gökyüzünün
// sakin hâli. Yıldızlardan yalnız Enif net ve altın odak köşelerinde ("fark et"). SVG: ekran boyuna göre ölçeklenir;
// renkler tema belirteçlerinden (styles/account.css --hello-*). Yazı yok (çeviriye engel olmasın).
const VB = [360, 236]
const hash = (i, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const ENIF = PEGASUS.findIndex((p) => p[0] === 'Enif')
const PTS = (() => {
  const sc = 262
  return pegasusXY().map(([x, y]) => [VB[0] / 2 + x * sc, VB[1] / 2 + 4 + y * sc])
})()
const [EX, EY] = PTS[ENIF]
const FIELD = Array.from({ length: 40 }, (_, i) => [hash(i, 41) * VB[0], hash(i, 42) * VB[1], 0.45 + hash(i, 43) * 0.8, 0.2 + hash(i, 44) * 0.45])
  .filter(([x, y]) => Math.hypot(x - EX, y - EY) > 30)
const f = (n) => n.toFixed(1)

export default function SkyChart({ className = '' }) {
  const K = 20 // odak köşelerinin yarı genişliği
  const L = 11 // köşe kolu
  return (
    <svg className={`sky-chart ${className}`} viewBox={`0 0 ${VB[0]} ${VB[1]}`} aria-hidden="true">
      <defs>
        <radialGradient id="sky-focus-glow">
          <stop offset="0" className="sky-glow-in" />
          <stop offset="1" className="sky-glow-out" />
        </radialGradient>
      </defs>
      {FIELD.map(([x, y, r, o], i) => <circle key={`f${i}`} className="sky-star" cx={f(x)} cy={f(y)} r={r.toFixed(2)} opacity={o.toFixed(2)} />)}
      {PEGASUS_LINES.map(([a, b], i) => <line key={`l${i}`} className="sky-line" x1={f(PTS[a][0])} y1={f(PTS[a][1])} x2={f(PTS[b][0])} y2={f(PTS[b][1])} />)}
      {PTS.map(([x, y], i) => (i === ENIF ? null : <circle key={`p${i}`} className="sky-star" cx={f(x)} cy={f(y)} r={(1.2 + PEGASUS[i][3] * 1.4).toFixed(2)} />))}
      <circle cx={f(EX)} cy={f(EY)} r="46" fill="url(#sky-focus-glow)" />
      <g className="sky-cross">
        <line x1={f(EX - 11)} y1={f(EY)} x2={f(EX + 11)} y2={f(EY)} />
        <line x1={f(EX)} y1={f(EY - 11)} x2={f(EX)} y2={f(EY + 11)} />
      </g>
      <circle className="sky-star-hi" cx={f(EX)} cy={f(EY)} r="3.4" />
      <g className="sky-brackets">
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
          const cx = EX + sx * K
          const cy = EY + sy * K
          return <path key={`${sx}${sy}`} d={`M${f(cx - sx * L)} ${f(cy)} L${f(cx)} ${f(cy)} L${f(cx)} ${f(cy - sy * L)}`} />
        })}
      </g>
    </svg>
  )
}
