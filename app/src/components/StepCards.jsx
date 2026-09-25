import { useEffect, useRef, useState } from 'react'
import { X, ArrowRight, ChevronRight } from 'lucide-react'
import '../styles/stepcards.css'

// Yönerge kartları: bir kartta bir iş (tek fiil, ≤ 8 kelime), altında kısa "neden", üstünde hareketli çizim.
// Kaydırarak geçilir; son kartta ana düğme ve "Bir daha gösterme". live: { ok, text } canlı doğrulama
// rozeti; ok AUTO_MS boyunca sürerse kart kendiliğinden geçer. Tasarım: Artifact "EyeTrail Yönerge Kartları".
// cards: [{ key, art, title, why?, live?, autoAdvance? }]
const AUTO_MS = 1200

export default function StepCards({ cards, eyebrow, finishLabel = 'Başla', onFinish, onDismiss, onClose }) {
  const track = useRef(null)
  const [i, setI] = useState(0)
  const last = i >= cards.length - 1
  const goTo = (n) => {
    const el = track.current
    if (!el) return
    const w = el.clientWidth
    el.scrollTo({ left: Math.max(0, Math.min(cards.length - 1, n)) * w, behavior: 'smooth' })
  }
  useEffect(() => {
    const el = track.current
    if (!el) return undefined
    const onScroll = () => {
      const n = Math.round(el.scrollLeft / Math.max(1, el.clientWidth))
      setI((p) => (p === n ? p : n))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  // Canlı doğrulama: ok sürünce sıradaki karta geç
  const cur = cards[i]
  const okSince = useRef(null)
  useEffect(() => {
    if (!cur?.live?.ok || cur.autoAdvance === false || last) {
      okSince.current = null
      return undefined
    }
    okSince.current = Date.now()
    const t = setTimeout(() => goTo(i + 1), AUTO_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.live?.ok, i])

  return (
    <div className="sc">
      <div className="sc-top">
        {onClose ? <button type="button" className="btn-icon" onClick={onClose} aria-label="Kapat"><X size={20} /></button> : <span />}
        <div className="sc-dots" aria-hidden="true">
          {cards.map((c, n) => <i key={c.key} className={n < i ? 'done' : n === i ? 'on' : ''} />)}
        </div>
        <span className="muted small sc-count">{i + 1} / {cards.length}</span>
      </div>
      {eyebrow && <span className="eyebrow sc-eyebrow">{eyebrow}</span>}
      <div className="sc-track" ref={track} role="group" aria-roledescription="kaydırmalı kartlar" aria-label="Nasıl yapılır">
        {cards.map((c) => (
          <section key={c.key} className="sc-card">
            <div className="sc-art" aria-hidden="true">{c.art}</div>
            <h2 className="sc-one">{c.title}</h2>
            {c.live && (
              <span className={`sc-live${c.live.ok ? ' ok' : ''}`} role="status">{c.live.text}</span>
            )}
            {c.why && <p className="sc-why">{c.why}</p>}
          </section>
        ))}
      </div>
      {last ? (
        <div className="sc-foot">
          <button type="button" className="btn" onClick={onFinish}><ArrowRight size={18} aria-hidden="true" /> {finishLabel}</button>
          {onDismiss && <button type="button" className="link-btn" onClick={onDismiss}>Bir daha gösterme</button>}
        </div>
      ) : (
        <button type="button" className="sc-next link-btn" onClick={() => goTo(i + 1)}>Kaydır <ChevronRight size={15} aria-hidden="true" /></button>
      )}
    </div>
  )
}
