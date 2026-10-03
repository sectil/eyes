// Düzenek için kamera taklidi (vite.config.mjs takma adı): ?face=0 yüz yok, yoksa 100 ms'de bir yüz karesi.
// İlk 5,5 sn normal duruş, sonra dik duruş (duruşunu gösterme ekranları ilerlesin).
import { useEffect, useRef } from 'react'
const FACE = new URLSearchParams(location.search).get('face') !== '0'
export function useFaceTracking({ enabled = true, onFrame } = {}) {
  const cb = useRef(onFrame)
  cb.current = onFrame
  useEffect(() => {
    if (!enabled || !FACE) return undefined
    const t0 = Date.now()
    const t = setInterval(() => {
      const tall = Date.now() - t0 > 5500
      cb.current?.({ native: true, face: true, mm: tall ? 425 : 400, headY: tall ? 3 : 0 })
    }, 100)
    return () => clearInterval(t)
  }, [enabled])
  return { videoRef: { current: null }, native: true, ready: true, error: null, face: enabled && FACE, irisPx: null, mm: FACE ? 400 : null }
}
