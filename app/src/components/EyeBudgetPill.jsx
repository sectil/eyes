import { fmtLeft } from '../lib/eyeBudget.js'
import '../styles/restlock.css'

// Göz ekranlarında üstte kısa bildirim: yalnızca son 1 dakikada ("Molaya 0:42") ve bütçe dolunca
// ("tur bitince mola" / "test bitince mola"). Diğer zamanlarda gizli: ekranın kendi düğmeleriyle
// çakışmasın. Dokunulmaz.
export default function EyeBudgetPill({ st, kind }) {
  if (!st || st.locked || (!st.warn && !st.due)) return null
  const R = 7
  const C = 2 * Math.PI * R
  const frac = st.budgetMs > 0 ? Math.min(1, st.used / st.budgetMs) : 0
  const due = Boolean(st.due)
  const cls = `eb-pill${due ? ' due' : st.warn ? ' warn' : ''}`
  const text = due ? (kind === 'test' ? 'Test bitince mola' : 'Bu tur bitince mola') : `Molaya ${fmtLeft(st.leftMs)}`
  return (
    <div className={cls} role="status" aria-live={st.warn || due ? 'polite' : 'off'}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="9" r={R} className="eb-ring-bg" strokeWidth="2.5" />
        <circle cx="9" cy="9" r={R} className="eb-ring-fg" strokeWidth="2.5" strokeDasharray={`${C * (due ? 1 : frac)} ${C}`} transform="rotate(-90 9 9)" />
      </svg>
      {text}
    </div>
  )
}
