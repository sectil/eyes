import { useEffect, useRef, useState } from 'react'
import { drawIris } from '../lib/irisDraw.js'
import { resolvedTheme } from '../lib/theme.js'

// İris haritası (Artifact "Nefona Başlangıç Kartı", onaylı): canvas çizimi lib/irisDraw.js, alan sırası lib/iris.js.
// filled: dolu dilim sıraları (0 = Göz); cur: sıradaki dilim (altın). Alan adları ve değerler çağıran ekranda (DOM).
// frac/marks: Gelişim haritası (lib/dataHub.js growthMap) — dilim başına düzen oranı ve doğrulanmış değişim yayı
export default function IrisMap({ size = 120, filled = [], cur = -1, frac = null, marks = null, className = '', label }) {
  const ref = useRef(null)
  const [dark, setDark] = useState(() => resolvedTheme() === 'dark')
  useEffect(() => {
    let mq
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return undefined
    }
    const on = () => setDark(resolvedTheme() === 'dark')
    mq.addEventListener?.('change', on)
    // Profil → Görünüm data-theme'i değiştirir
    const mo = typeof MutationObserver === 'function' ? new MutationObserver(on) : null
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq.removeEventListener?.('change', on)
      mo?.disconnect()
    }
  }, [])
  const key = `${filled.join(',')}|${frac ? frac.map((f) => f.toFixed(3)).join(',') : ''}|${marks ? marks.join(',') : ''}`
  useEffect(() => {
    if (ref.current) drawIris(ref.current, { size, filled, cur, dark, frac, marks })
  }, [size, key, cur, dark]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <canvas
      ref={ref}
      className={`iris-map ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
