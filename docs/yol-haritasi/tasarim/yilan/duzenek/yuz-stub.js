// Sahte TrueDepth: window.__gaze ({ x, y } mm, ekran noktası) her 33 ms'de kare olarak verilir.
import { useEffect, useRef } from 'react'
export function useFaceTracking({ enabled = true, onFrame } = {}) {
  const videoRef = useRef(null)
  const cb = useRef(onFrame)
  cb.current = onFrame
  useEffect(() => {
    if (!enabled) return undefined
    const id = setInterval(() => {
      const g = window.__gaze ?? { x: 0, y: 0 }
      cb.current?.({ ts: performance.now(), face: true, blinkLeft: 0.05, blinkRight: 0.05, scrLX: g.x, scrRX: g.x, scrLY: g.y, scrRY: g.y })
    }, 33)
    return () => clearInterval(id)
  }, [enabled])
  return { videoRef, ready: true, error: null, face: true, irisPx: null, mm: null }
}
