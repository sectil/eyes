import { useEffect, useRef, useState } from 'react'
import { loadLandmarker, startCamera, measureFrame, createMedian, distanceMm } from '../lib/distance.js'

// Ön kamerayı açar, her karede yüz noktalarını ölçer.
// distanceCal: { irisPxAt40, videoW } — varsa mesafe (mm) hesaplanır.
// onFrame: her kare için ham ölçümle çağrılır (göz kırpma modülü kullanır).
export function useFaceTracking({ enabled = true, distanceCal = null, onFrame } = {}) {
  const videoRef = useRef(null)
  const [state, setState] = useState({ ready: false, error: null, face: false, irisPx: null, mm: null })
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame
  const calRef = useRef(distanceCal)
  calRef.current = distanceCal

  useEffect(() => {
    if (!enabled) return undefined
    let stopCamera = null
    let raf = 0
    let cancelled = false
    const median = createMedian(9)
    let lastUi = 0

    ;(async () => {
      try {
        const video = videoRef.current
        const [ctx, stop] = await Promise.all([loadLandmarker(), startCamera(video)])
        stopCamera = stop
        if (cancelled) {
          stop()
          return
        }
        setState((s) => ({ ...s, ready: true }))
        let lastTs = -1
        const loop = () => {
          if (cancelled) return
          const ts = performance.now()
          if (video.readyState >= 2 && ts > lastTs) {
            lastTs = ts
            const m = measureFrame(ctx, video, ts)
            const cal = calRef.current
            // Kalibrasyon farklı video çözünürlüğünde yapıldıysa ölçekle
            const scale = cal?.videoW && m.videoW ? cal.videoW / m.videoW : 1
            const irisPx = median.push(m.irisPx ? m.irisPx * scale : null)
            const mm = cal ? distanceMm(irisPx, cal.irisPxAt40) : null
            onFrameRef.current?.({ ...m, irisPxSmoothed: irisPx, mm, ts, ctx })
            // Arayüzü saniyede ~10 kez güncelle
            if (ts - lastUi > 100) {
              lastUi = ts
              setState({ ready: true, error: null, face: m.face, irisPx, mm })
            }
          }
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, error: e?.name === 'NotAllowedError' ? 'permission' : 'load' }))
      }
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stopCamera?.()
    }
  }, [enabled])

  return { videoRef, ...state }
}
