// Düzenek: useFaceTracking yerine. Saniyede 30 kare; göz yanan kelimenin ortasına (mm) LAG ms gecikmeyle bakar.
// ?face=0 → yüz yok (hazır ekranının "Telefonu yüzüne dönük tut" hâli)
import { useEffect, useRef } from 'react'
const LAG = 150
const PT_PER_MM = 6.1
export function useFaceTracking({ enabled, onFrame }) {
  const cb = useRef(onFrame)
  cb.current = onFrame
  useEffect(() => {
    if (!enabled) return undefined
    const face = new URLSearchParams(location.search).get('face') !== '0'
    const hist = []
    const id = setInterval(() => {
      const ts = performance.now()
      const el = document.querySelector('.og-w.on')
      const r = el?.getBoundingClientRect()
      hist.push({ ts, x: r ? (r.left + r.width / 2) / PT_PER_MM : null })
      const past = hist.filter((h) => h.ts <= ts - LAG).pop()
      const x = past?.x ?? 30
      cb.current?.({ native: true, tracked: face, ts, scrLX: x, scrRX: x, scrLY: 40, scrRY: 40, scrZ: 300 })
    }, 33)
    return () => clearInterval(id)
  }, [enabled])
  return { ready: true, error: null, face: true }
}
