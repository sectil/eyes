import { useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { canOpen } from '../../lib/today.js'
import { fmtLeft } from '../../lib/eyeBudget.js'
import { haptic } from '../../lib/native.js'
import { StopGlyph } from './HomeGo.jsx'
import { shownTitle } from './dayLead.js'

// Ana sayfa · ilk 7 günün yolu: sade liste (Yön B "Tek büyük kart"; 5 saniye turu 6). Büyük kartın gösterdiği durak
// listede yok (skip): aynı iş iki kez yazılmaz. Her satır durağın yoldaki çizimi ve adı; süre yazılmaz (yolun süresi
// günün cümlesinde), molada "Mola" etiketi. Sıra ve açılma kuralı yolun aynısı (lib/today.js canOpen): sıradaki ve biten
// durak açılır, ilerideki durağa dokununca "Önce: X" (TodayPath'teki gibi). Kilitli durakta kalan süre, süren molada
// geri sayım. Yolun dipnotu (sağlık iddiası yok) listenin altında. 8. günden yol eskisi gibi TodayPath.
export default function PathList({ plan, skip = null, icons = {}, newKeys = [], eye = null, onStart }) {
  const [nudge, setNudge] = useState(null)
  useEffect(() => {
    if (!nudge) return undefined
    const id = setTimeout(() => setNudge(null), 2400)
    return () => clearTimeout(id)
  }, [nudge])
  const pathRest = Boolean(eye?.locked && eye.reason === 'path')
  const rows = plan.stops.filter((s) => s.key !== skip)
  const tap = (s, running) => {
    if (running || canOpen(plan, s)) return onStart?.(s.route)
    haptic('warning')
    setNudge(s.key)
  }
  return (
    <section className="pl" aria-label="Bugünün yolu">
      <ol className="pl-list">
        {rows.map((s) => {
          const running = Boolean(s.restSlot && pathRest && !s.done)
          const st = s.done ? 'done' : running ? 'running' : s.locked ? 'locked' : s === plan.next ? 'now' : 'later'
          const isNew = newKeys.includes(s.key) && !s.done
          const note = st === 'locked' ? `mola ${fmtLeft(s.lockLeftMs ?? 0)}` : st === 'running' ? `Mola · ${fmtLeft(eye?.leftMs ?? 0)}` : null
          return (
            <li key={s.key} className={`pl-i ${st}${s.restSlot ? ' rest' : ''}`}>
              {plan.forcedRestBefore === s.key && (
                <span className="pl-chip"><Lock size={13} aria-hidden="true" />Burada 5 dk mola var</span>
              )}
              <button
                type="button"
                className="pl-row"
                data-key={s.key}
                onClick={() => tap(s, running)}
                aria-disabled={st === 'later' ? 'true' : undefined}
                aria-label={`${shownTitle(s)}${s.restSlot ? ', mola' : ''}${isNew ? ', yeni' : ''}${st === 'locked' ? `, kilitli (${note})` : note ? `, ${note}` : ''}${st === 'done' ? ', tamam' : st === 'now' ? ', sırada' : ''}${st === 'later' && plan.next ? `. Önce ${plan.next.title}` : ''}`}
              >
                <span className="pl-ic" aria-hidden="true">
                  {st === 'done' ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <StopGlyph stop={s} Icon={icons[s.id]} size={20} />}
                </span>
                <span className="pl-t" aria-hidden="true">
                  <b>{shownTitle(s)}</b>
                  {s.restSlot && <i className="pl-tag">Mola</i>}
                  {isNew && <i className="hh-new">Yeni</i>}
                  {note && <small>{note}</small>}
                </span>
              </button>
              {nudge === s.key && plan.next && (
                <span className="pl-nudge" role="status"><Lock size={13} aria-hidden="true" />Önce: {plan.next.title}</span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="pl-fn">Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi.</p>
    </section>
  )
}
