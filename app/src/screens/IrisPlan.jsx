import { ArrowRight } from 'lucide-react'
import IrisMap from '../components/IrisMap.jsx'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { normalizeProfile } from '../lib/profile.js'
import { IRIS_ORDER, irisCells, filledIndexes } from '../lib/iris.js'
import { setupText } from '../lib/setupText.js'
import '../styles/setup.css'

// İris haritan (Artifact "Nefona Başlangıç Kartı", onaylı): kurulumun sonunda, denemeden önce. Büyük iris, her alanın
// yanında kişinin kendi değeri; boş alanlarda ne zaman dolacağı. compare: 28. gün, başlangıç → şimdi yan yana.
// Etiket konumları fiziksel (left): iris çizimi aynalanmaz, sağdan sola dillerde de etiket kendi diliminin yanında kalır.
const SIZE = 186
const W = 316
const H = 282
const R = 116

function label(cell, T) {
  if (!cell.filled) return null
  const f = T.cell[cell.domain]
  return f && cell.value != null ? f(cell.value) : null
}

export default function IrisPlan({ profile, name = '', sessions = [], domainOf, compare = false, bar = 0.9, onDone }) {
  const T = setupText()
  const P = T.plan
  const p = normalizeProfile(profile)
  const base = irisCells(p.iris.baseline, { sessions, domainOf })
  const now = compare ? irisCells(p.iris.recheck, { sessions, domainOf }) : base
  const filled = filledIndexes(now)
  const labs = IRIS_ORDER.map((d, i) => {
    const a = ((360 / 7) * i * Math.PI) / 180
    const x = Math.sin(a) * R
    const y = H / 2 - Math.cos(a) * R * 0.98
    const side = Math.abs(x) < 20 ? 'c' : x > 0 ? 'r' : 'l'
    const b = label(base[i], T)
    const n = label(now[i], T)
    return (
      <div key={d} className={`ip-lab ${side}`} style={{ top: y, left: side === 'c' ? '50%' : `calc(50% + ${side === 'r' ? x - 12 : x - 76}px)` }}>
        <small>{T.domains[d]}</small>
        {(n ?? b) ? <b>{n ?? b}</b> : <b className="later">{T.later[d]}</b>}
        {compare && b && n && b !== n && <em>{P.beforeShort(b)}</em>}
      </div>
    )
  })
  return (
    <main className="screen fade-in oq ip">
      {!compare && <div className="oq-top"><ProgressBar value={bar} /></div>}
      <span className="oq-ey">{compare ? P.compareEyebrow : P.eyebrow}</span>
      <h1 className="ip-title">{compare ? P.compareTitle(name) : P.title(name)}</h1>
      <div className="ip-hero" style={{ '--w': `${W}px`, '--h': `${H}px` }}>
        <IrisMap size={SIZE} filled={filled} className="ip-iris" label={IRIS_ORDER.map((d, i) => `${T.domains[d]}: ${label(now[i], T) ?? T.later[d]}`).join(', ')} />
        {labs}
      </div>
      {compare ? (
        <p className="oq-sub ip-note">{P.compareNote}</p>
      ) : (
        <div className="ip-steps">
          {P.steps.map(([h, t], i) => <div key={h} className={i === P.steps.length - 1 ? 'g' : ''}><b>{h}</b><span>{t}</span></div>)}
        </div>
      )}
      <div className="grow" />
      {!compare && <p className="ip-honest">{P.honest}</p>}
      <button type="button" className="btn" onClick={onDone}>
        {compare ? P.close : P.cta} <ArrowRight size={18} aria-hidden="true" className="ip-arrow" />
      </button>
    </main>
  )
}
