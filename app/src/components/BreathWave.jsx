import { useId } from 'react'

// Nefes ritminin şekli (Artifact "Nefona Nefes", onaylı): alış yükselir, veriş iner, tutma düz; uzun verişteki ikinci
// alış biraz daha yükselir. Vızıltıda veriş titreşimli altın çizgi, burun değiştirmede aşama altında taraf noktası
// (sol turkuaz, sağ altın). phases: lib/breath.js makePlan().phases. labels: aşama adı ve saniyesi (ayrıntı ekranı).
// Yazılar SVG metni (çevrilebilir); konum fiziksel, zaman soldan sağa akar.
const NAME = { in: 'al', in2: '+', out: 'ver', hold: 'tut', hold2: 'bekle' }
const fmt = (v) => (Number.isInteger(v) ? String(v) : String(v).replace('.', ','))

export default function BreathWave({ phases = [], repeat = 1, width = 300, height = 60, labels = false, names = NAME, className = '' }) {
  const id = useId().replace(/:/g, '')
  const list = Array.from({ length: repeat }, () => phases).flat()
  const total = list.reduce((a, p) => a + p.sec, 0) || 1
  const w = width
  const h = height
  const top = labels ? 18 : 3
  const bot = h - (labels ? 18 : 3)
  const X = (s) => (s / total) * w
  let x = 0
  let y = bot
  let d = `M0 ${bot}`
  const extra = []
  const lbl = []
  list.forEach((p, i) => {
    const x2 = x + X(p.sec)
    const dx = x2 - x
    if (p.kind === 'in') {
      d += ` C${x + dx * 0.45} ${bot} ${x + dx * 0.55} ${top} ${x2} ${top}`
      y = top
    } else if (p.kind === 'in2') {
      const t2 = top - (labels ? 8 : 3)
      d += ` C${x + dx * 0.4} ${y} ${x + dx * 0.6} ${t2} ${x2} ${t2}`
      y = t2
    } else if (p.kind === 'out') {
      if (p.hum) {
        const n = 14
        let hp = ''
        for (let j = 0; j <= n; j++) {
          const t = j / n
          const xx = x + dx * t
          const yy = y + (bot - y) * (t * t * (3 - 2 * t)) + (j % 2 ? -3 : 3) * (1 - t * 0.6)
          hp += `${j ? 'L' : 'M'}${xx.toFixed(1)} ${yy.toFixed(1)} `
        }
        extra.push(<path key={`h${i}`} className="bw-hum" d={hp} />)
      }
      d += ` C${x + dx * 0.45} ${y} ${x + dx * 0.55} ${bot} ${x2} ${bot}`
      y = bot
    } else {
      d += ` L${x2} ${y}`
    }
    if (p.side) extra.push(<circle key={`s${i}`} className={p.side === 'L' ? 'bw-l' : 'bw-r'} cx={(x + x2) / 2} cy={bot + 0.5} r={3.2} />)
    if (labels) {
      lbl.push(
        <text key={`n${i}`} x={(x + x2) / 2} y={Math.max(9, top - 6)} textAnchor="middle">{names[p.kind]}</text>,
        <text key={`v${i}`} className="v" x={(x + x2) / 2} y={h - 3} textAnchor="middle">{fmt(p.sec)}</text>,
      )
    }
    x = x2
  })
  return (
    <svg className={`bw ${className}`} viewBox={`-4 0 ${w + 8} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`bwl${id}`} x1="0" x2="1">
          <stop offset="0" className="bw-s0" />
          <stop offset="1" className="bw-s1" />
        </linearGradient>
        <linearGradient id={`bwf${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="bw-f0" />
          <stop offset="1" className="bw-f1" />
        </linearGradient>
      </defs>
      <line className="bw-base" x1="0" y1={bot} x2={w} y2={bot} />
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={`url(#bwf${id})`} />
      <path className="bw-line" d={d} stroke={`url(#bwl${id})`} />
      {extra}
      {lbl}
    </svg>
  )
}
