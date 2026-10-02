import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { drawDayIris } from './dayIrisDraw.js'
import { resolvedTheme } from '../../lib/theme.js'

// Ana sayfa · "Senin gözün" (ana sayfa 5 saniye yeniden tasarımı, Yön B): ilk görünümün kahramanı kişinin kendi gözüdür;
// geldiği her gün göze bir ışın eklenir. Tuval components/home/dayIrisDraw.js; yazılar DOM'da (çeviri, ekran okuyucu).
// days: geçmiş günlerin durak sayısı (dayRays); today: { n, done }; week: "Bu hafta N/3 gün" ya da null; seed: hiç geçmiş
// gün yok. Tek sayı (sahibin kararı 2026-10-01): göz bebeğinde sayı yok, seri yayı ve tur halkaları çizilmez; ilk
// görünümün tek sayısı gözün altındaki hafta satırı.
// Göze dokununca Gelişim açılır (onOpen). Hareketi Azalt: çizim durgundur; yalnız ilk çizimde yumuşak beliriş (CSS).
export default function DayIris({ days = [], today = { n: 0, done: false }, week = null, seed = false, label, onOpen }) {
  const disc = useRef(null)
  const cv = useRef(null)
  const [dark, setDark] = useState(() => resolvedTheme() === 'dark')
  const [size, setSize] = useState(0)
  // Tema (sistem ya da Profil → Görünüm; components/IrisMap.jsx ile aynı)
  useEffect(() => {
    let mq = null
    try {
      mq = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null
    } catch {
      mq = null
    }
    const on = () => setDark(resolvedTheme() === 'dark')
    mq?.addEventListener?.('change', on)
    const mo = typeof MutationObserver === 'function' ? new MutationObserver(on) : null
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq?.removeEventListener?.('change', on)
      mo?.disconnect()
    }
  }, [])
  // Gözün boyu Ana sayfanın ilk görünümüne göre değişir (Home.jsx sığdırma): boy değişince yeniden çizilir
  useEffect(() => {
    const el = disc.current
    if (!el?.getBoundingClientRect) return undefined
    const read = () => setSize(Math.round(el.getBoundingClientRect().width))
    read()
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(read)
      ro.observe(el)
      return () => ro.disconnect()
    }
    window.addEventListener?.('resize', read)
    return () => window.removeEventListener?.('resize', read)
  }, [])
  const key = `${days.join(',')}|${today.n}|${today.done ? 1 : 0}`
  useEffect(() => {
    if (!cv.current || !(size > 0)) return
    const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 2))
    drawDayIris(cv.current, { size, dark, days, today, streak: 0, laps: false, dpr })
  }, [size, dark, key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hi">
      <span className={`hi-today${today.done ? ' done' : ''}`} aria-hidden="true">
        {today.done && <Check size={13} strokeWidth={3} aria-hidden="true" />}bugün
      </span>
      <button type="button" className="hi-eye" onClick={onOpen} aria-label={label}>
        <span ref={disc} className={`hi-disc${days.length || today.n ? '' : ' seed'}${seed ? ' first' : ''}`}>
          <canvas ref={cv} aria-hidden="true" />
        </span>
      </button>
      <p className="hi-legend">{week ?? 'Her gün bir ışın'}</p>
    </div>
  )
}
