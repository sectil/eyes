// 5×5 ızgaralı tumbling E, <canvas> üzerinde cihaz pikseli çözünürlüğünde (H1, 2026-09-28).
// unit: bir ızgara biriminin CSS piksel boyu (renderSpec().unitCssPx; yuvarlanmaz).
// direction: açık tarafın yönü ('right' | 'down' | 'left' | 'up'); yön geometriyle çizilir, CSS döndürmesi yok.
// dpr (isteğe bağlı): tuvalin cihaz pikseli oranı; verilmezse window.devicePixelRatio. Harfin CSS boyu
// (5 × unit) dpr'den bağımsızdır; dpr yalnız kenarın ince çizimini belirler.
// Pikseller lib/optotype.js rasterizeE ile hesaplanır: alan kaplaması, doğrusal ışıkta karışım, sRGB kodlama;
// siyah #000, beyaz #fff. Bu bileşen yalnız boyar. Tuvalde metin yok.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { rasterizeE } from '../lib/optotype.js'

export default function TumblingE({ unit, direction, dpr }) {
  const ratio = dpr > 0 ? dpr : globalThis.devicePixelRatio || 1
  const valid = unit > 0 && Number.isFinite(unit)
  const raster = useMemo(() => (valid ? rasterizeE(unit * ratio, direction) : null), [valid, unit, ratio, direction])
  const ref = useRef(null)
  const snap = useRef({ x: 0, y: 0 })

  // Pikselleri tuvale olduğu gibi yaz (putImageData dönüşüm ve karıştırma uygulamaz)
  useLayoutEffect(() => {
    const cv = ref.current
    if (!cv || !raster) return
    const ctx = typeof cv.getContext === 'function' ? cv.getContext('2d') : null
    if (!ctx || typeof ImageData === 'undefined') return
    ctx.putImageData(new ImageData(raster.rgba, raster.size, raster.size), 0, 0)
  }, [raster])

  // Tuvali cihaz pikseli ızgarasına oturt: ortalama tuvali yarım piksele düşürürse tarayıcı bitmap'i yeniden
  // örnekler ve gri kenar bulanıklaşır. Kayma < 0,5 cihaz pikseli; harfin yeri fiilen değişmez.
  // VARSAYIM: WebKit'te getBoundingClientRect konumu cihaz pikseline göre doğru verir. Cihazda doğrulanmadı.
  useLayoutEffect(() => {
    const cv = ref.current
    if (!cv || !raster || typeof cv.getBoundingClientRect !== 'function') return
    const r = cv.getBoundingClientRect()
    const baseX = r.left - snap.current.x
    const baseY = r.top - snap.current.y
    const sx = (Math.round(baseX * ratio) - baseX * ratio) / ratio
    const sy = (Math.round(baseY * ratio) - baseY * ratio) / ratio
    if (Math.abs(sx - snap.current.x) < 1e-4 && Math.abs(sy - snap.current.y) < 1e-4) return
    snap.current = { x: sx, y: sy }
    cv.style.transform = sx || sy ? `translate(${sx}px, ${sy}px)` : ''
  })

  if (!raster) return null
  const css = raster.size / ratio
  return (
    <canvas
      ref={ref}
      width={raster.size}
      height={raster.size}
      style={{ width: `${css}px`, height: `${css}px`, display: 'block', background: '#fff' }}
      aria-hidden="true"
    />
  )
}
