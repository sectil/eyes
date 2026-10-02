import { useEffect, useRef } from 'react'
import { MODES } from '../lib/dalga.js'

// Dalga görseli: iki kulağın dalgası (sol c1, sağ c2) ortada buluşur; nota halkaları yavaş açılıp söner.
// Güvenlik: yanıp sönme yok (Fisher 2005, DOI 10.1111/j.1528-1167.2005.31405.x). Parlaklık yalnız 10 sn'lik
// nefes hızında çok az değişir; ses düzeyi ~1 sn yumuşatılır; binaural fark 10 kat yavaş çizilir (6 Hz → 0,6 Hz).
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

export default function DalgaVisual({ engine, mode, binOn = false, onSilence }) {
  const ref = useRef(null)
  const silenceRef = useRef(onSilence)
  silenceRef.current = onSilence

  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const g = cv.getContext('2d')
    if (!g) return undefined
    const m = MODES[mode]
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let W = 0, H = 0, raf = 0, level = 0, silent = false
    const parts = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.2 + Math.random() * 0.8 }))
    const size = () => {
      const dpr = Math.min(2, globalThis.devicePixelRatio || 1)
      const r = cv.getBoundingClientRect()
      W = r.width
      H = r.height
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    globalThis.addEventListener('resize', size)
    const speed = reduce ? 0.3 : 1
    const drift = mode === 'motive' ? 26 : mode === 'guc' ? 12 : 6
    const k1 = (2 * Math.PI) / 118, k2 = (2 * Math.PI) / 104
    const beat = binOn ? 0.6 : mode === 'motive' ? 0.9 : 0.25

    const frame = () => {
      const t = engine.now()
      level += (Math.min(0.35, engine.level()) - level) * 0.02
      const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 10)
      const cy = H * 0.56

      const bg = g.createRadialGradient(W / 2, H * 0.52, 10, W / 2, H * 0.52, H * 0.75)
      bg.addColorStop(0, m.bg[0])
      bg.addColorStop(1, m.bg[1])
      g.fillStyle = bg
      g.fillRect(0, 0, W, H)
      const halo = g.createRadialGradient(W / 2, cy, 0, W / 2, cy, W * (0.42 + 0.06 * breath))
      halo.addColorStop(0, hexA(m.c1, 0.16 + 0.04 * breath))
      halo.addColorStop(1, hexA(m.c1, 0))
      g.fillStyle = halo
      g.fillRect(0, 0, W, H)

      for (const p of parts) {
        const y = (((p.y - (t * drift * p.s * speed) / H) % 1) + 1) % 1
        g.fillStyle = hexA(p.r > 1.6 ? m.c2 : m.c1, 0.35)
        g.beginPath()
        g.arc(p.x * W, y * H, p.r, 0, 7)
        g.fill()
      }

      let silentNow = false
      for (const e of engine.events()) {
        const age = t - e.t
        if (age < 0) continue
        if (e.cue) {
          if (e.kind === 'silence' && age < 4) silentNow = true
          continue
        }
        if (age > 2.6) continue
        const pr = age / 2.6
        const a = 0.2 * Math.min(1, age / 0.35) * (1 - pr)
        g.strokeStyle = hexA(e.kind === 'g' ? m.c2 : m.c1, a)
        g.lineWidth = 1.5
        g.beginPath()
        g.arc(e.x * W, e.y * H, 8 + pr * 60, 0, 7)
        g.stroke()
      }
      if (silentNow !== silent) {
        silent = silentNow
        silenceRef.current?.(silent)
      }

      const A = 16 + level * 150
      const ph = 2 * Math.PI * 0.12 * t * speed
      const bph = 2 * Math.PI * beat * t * speed
      const wave = (x, k, extra) => Math.sin(k * x - ph + extra)
      const line = (fn, stroke, w) => {
        g.strokeStyle = stroke
        g.lineWidth = w
        g.lineCap = 'round'
        g.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const y = cy + fn(x)
          if (x) g.lineTo(x, y)
          else g.moveTo(x, y)
        }
        g.stroke()
      }
      const gl = g.createLinearGradient(0, 0, W, 0)
      gl.addColorStop(0, hexA(m.c1, 0.9))
      gl.addColorStop(0.55, hexA(m.c1, 0.05))
      gl.addColorStop(1, hexA(m.c1, 0))
      const gr = g.createLinearGradient(0, 0, W, 0)
      gr.addColorStop(0, hexA(m.c2, 0))
      gr.addColorStop(0.45, hexA(m.c2, 0.05))
      gr.addColorStop(1, hexA(m.c2, 0.9))
      const gs = g.createLinearGradient(0, 0, W, 0)
      gs.addColorStop(0, 'rgba(255,255,255,0)')
      gs.addColorStop(0.5, 'rgba(255,255,255,0.75)')
      gs.addColorStop(1, 'rgba(255,255,255,0)')
      line((x) => A * wave(x, k1, 0), gl, 2.2)
      line((x) => A * wave(W - x, k2, bph), gr, 2.2)
      line((x) => 0.5 * A * (wave(x, k1, 0) + wave(W - x, k2, bph)), gs, 1.4)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      globalThis.removeEventListener('resize', size)
    }
  }, [engine, mode, binOn])

  return <canvas ref={ref} className="dg-canvas" aria-hidden="true" />
}
