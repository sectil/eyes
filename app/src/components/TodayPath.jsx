import { Check, Lock, Play } from 'lucide-react'
import '../styles/todaypath.css'

// Bugün: menü değil yol. Günün durakları (lib/today.js todayPlan items) yukarıdan aşağı dizilir; biten yeşil,
// sıradaki büyük ve parlak, sonrakiler soluk. Sıradakinin üstünde tek baloncuk. Tasarım: Artifact
// "EyeTrail Yönerge Kartları" Y1. items: [{ id, title, minutes, done, route }]; next: sıradaki öğe.
const STEP = 128 // durak arası yükseklik (px)
const TOP = 44
const LABEL_H = 50 // durak altındaki etiket; çizgi etiketin altından başlar

export default function TodayPath({ items = [], next = null, icons = {}, lockLeft = null, lockedIds = new Set(), onStart, week = '' }) {
  const n = items.length
  const h = TOP + Math.max(0, n - 1) * STEP + 64
  const w = 320
  const xs = items.map((_, i) => (i % 2 === 0 ? w * 0.36 : w * 0.64))
  const ys = items.map((_, i) => TOP + i * STEP)
  const seg = (i) => {
    const x0 = xs[i]
    const y0 = ys[i]
    const x1 = xs[i + 1]
    const y1 = ys[i + 1]
    const a = y0 + LABEL_H // etiketin altı
    const b = y1 - 44 // sıradaki durağın üstü
    const my = (a + b) / 2
    return `M${x0} ${a} C ${x0} ${my}, ${x1} ${my}, ${x1} ${b}`
  }
  const doneUpTo = items.findIndex((it) => !it.done) // -1: hepsi bitti
  const nextIdx = next ? items.indexOf(next) : -1

  return (
    <section className="tp" aria-label="Bugünün yolu" style={{ height: h }}>
      <svg className="tp-track" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
        {items.slice(0, -1).map((it, i) => (
          <path key={it.id} d={seg(i)} className={`tp-seg${doneUpTo === -1 || i < doneUpTo ? ' done' : ''}`} />
        ))}
      </svg>
      {items.map((it, i) => {
        const isNext = i === nextIdx
        const Icon = icons[it.id]
        const locked = lockedIds.has(it.id)
        const cls = `tp-stop${it.done ? ' done' : isNext ? ' now' : ' later'}`
        const left = `${(xs[i] / w) * 100}%`
        return (
          <div key={it.id} className={`tp-stop-wrap${i % 2 === 0 ? ' on-left' : ' on-right'}`} style={{ left, top: ys[i] }}>
            {isNext && (
              <span className="tp-bubble" aria-hidden="true">
                {locked ? `Mola · ${lockLeft}` : `Sırada ${it.title}${it.minutes ? ` · ${it.minutes} dk` : ''}`}
              </span>
            )}
            <button type="button" className={cls} onClick={() => onStart(it.route)} aria-label={`${it.title}${it.done ? ' · tamam' : isNext ? ' · sırada' : ''}`}>
              {it.done ? <Check size={26} strokeWidth={2.6} aria-hidden="true" /> : locked && isNext ? <Lock size={26} aria-hidden="true" /> : Icon ? <Icon size={isNext ? 30 : 24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
            </button>
            <span className="tp-lbl">
              {it.title}
              <small>{it.done ? 'tamam' : isNext ? 'Başla' : it.minutes ? `${it.minutes} dk` : 'sonra'}</small>
            </span>
          </div>
        )
      })}
      {week && <span className="tp-week small">{week}</span>}
    </section>
  )
}
