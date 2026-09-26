import { useEffect, useRef, useState } from 'react'
import { loadLandmarker, startCamera, measureFrame, createMedian, distanceMm } from '../lib/distance.js'
import { startTrueDepth } from '../lib/native.js'

// Yüz takibi — iki kaynak:
//  1) TrueDepth (iPhone uygulaması, Face ID kamerası): mesafe doğrudan mm olarak gelir,
//     kalibrasyon gerekmez. distanceCal.method === 'truedepth' veya trueDepth: true.
//  2) Ön kamera + MediaPipe (web ve TrueDepth'siz cihazlar): iris boyutundan mesafe,
//     bir kez 40 cm'de kalibrasyon gerekir (distanceCal: { irisPxAt40, videoW }).
// onFrame: her ölçümde çağrılır. TrueDepth'te { native: true, face, mm, blinkLeft/Right, lookUp/Down/In/Out Left/Right }.
// onDepth (yalnızca TrueDepth): ~10 Hz iki göz bölgesi derinliği { eyesKnown, leftMm, rightMm, eyeAgeMs, ts }.
// depthDistance: yüz takibi düşünce (ör. el bir gözü örtünce) mesafe açık gözün derinliğinden sürer.
export function useFaceTracking({ enabled = true, distanceCal = null, onFrame, trueDepth = false, onDepth, depthDistance = false } = {}) {
  const videoRef = useRef(null)
  const [state, setState] = useState({ ready: false, error: null, face: false, irisPx: null, mm: null })
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame
  const onDepthRef = useRef(onDepth)
  onDepthRef.current = onDepth
  const wantDepth = Boolean(onDepth) || depthDistance
  const calRef = useRef(distanceCal)
  calRef.current = distanceCal
  const useNative = trueDepth || distanceCal?.method === 'truedepth'

  // --- 1) TrueDepth ---
  useEffect(() => {
    if (!enabled || !useNative) return undefined
    let stop = null
    let cancelled = false
    const median = createMedian(5)
    const depthMedian = createMedian(5)
    let lastUi = 0
    let lastTracked = -Infinity
    let lastDepthMm = -Infinity // derinlik yedeğinin son geçerli mesafe yazdığı an
    const onDepthFrame = (d) => {
      if (cancelled) return
      const ts = performance.now()
      onDepthRef.current?.({ ...d, ts })
      // Yüz 300 ms'dir izlenmiyorsa mesafe açık gözün (uzak olan bölge) derinliğinden
      if (!depthDistance || ts - lastTracked < 300 || !d?.eyesKnown) return
      const vals = [d.leftMm, d.rightMm].filter((v) => Number.isFinite(v) && v > 150 && v < 900)
      const mm = vals.length ? depthMedian.push(Math.max(...vals)) : null
      if (mm != null) lastDepthMm = ts
      if (ts - lastUi > 100) {
        lastUi = ts
        setState({ ready: true, error: null, face: false, irisPx: null, mm, depth: true })
      }
    }
    ;(async () => {
      try {
        stop = await startTrueDepth((f) => {
          if (cancelled) return
          // Oturum hatası (native: { tracked:false, error, errorCode }): ARKit oturumu durdurur, bir daha
          // kare gelmez. Kare onFrame'e iletilmez (yüz karesi sayılmasın; yedek yollar error'a bakar).
          if (f.error) {
            setState((s) => ({ ...s, ready: true, error: f.errorCode === 'camera-denied' ? 'permission' : 'load', face: false, mm: null }))
            return
          }
          const ts = performance.now()
          if (f.tracked) lastTracked = ts
          const mm = f.tracked && f.distanceMm ? median.push(f.distanceMm) : null
          onFrameRef.current?.({ ...f, native: true, face: Boolean(f.tracked), mm, ts })
          // Yüz yokken derinlik yedeği mesafeyi yazıyorsa izlenmeyen yüz karesi onu silmesin
          if (ts - lastUi > 100 && (f.tracked || !depthDistance || ts - lastDepthMm > 300)) {
            lastUi = ts
            setState({ ready: true, error: null, face: Boolean(f.tracked), irisPx: null, mm })
          }
        }, { onDepth: wantDepth ? onDepthFrame : undefined })
        if (cancelled) stop?.()
        else setState((s) => ({ ...s, ready: true }))
      } catch (e) {
        // native start izin yoksa reject(code: 'camera-denied') döner.
        if (!cancelled) setState((s) => ({ ...s, error: e?.code === 'camera-denied' ? 'permission' : 'load' }))
      }
    })()
    return () => {
      cancelled = true
      stop?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, useNative, wantDepth])

  // --- 2) Ön kamera + MediaPipe ---
  useEffect(() => {
    if (!enabled || useNative) return undefined
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
            const mm = cal?.irisPxAt40 ? distanceMm(irisPx, cal.irisPxAt40) : null
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
  }, [enabled, useNative])

  return { videoRef, native: useNative, ...state }
}
