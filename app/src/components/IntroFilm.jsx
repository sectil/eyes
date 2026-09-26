import { useEffect, useRef, useState } from 'react'
import { captionAt, INTRO_END_MS } from '../lib/intro.js'
import { createIntroScene } from '../lib/introScene.js'
import { haptic } from '../lib/native.js'
import '../styles/intro.css'

// Giriş filmi (Artifact "Giriş Filmi Taslağı", onaylı): 15 sn, sessiz, tam ekran; sahne lib/introScene.js'te.
// Saat kareler arası süreyle ilerler (kare başına en fazla 0,1 sn): uygulama arka plana geçince film durur,
// dönünce kaldığı yerden sürer. "Atla" son kareye gider; son karede Pegasus ve halka canlı kalır.
const SKIP_TO = 15.0

export default function IntroFilm({ onDone, replay = false }) {
  const canvas = useRef(null)
  const clock = useRef(0)
  const [cap, setCap] = useState('')
  const [capOff, setCapOff] = useState(true)
  const [ended, setEnded] = useState(false)
  const lastCap = useRef('')

  useEffect(() => {
    const el = canvas.current
    let scene = null
    try {
      scene = createIntroScene(el)
    } catch {
      // Canvas yoksa: yalnızca son ekran
      clock.current = SKIP_TO
      setEnded(true)
      return undefined
    }
    const ro = new ResizeObserver(() => {
      scene.resize()
      scene.draw(clock.current)
    })
    ro.observe(el)
    let raf = 0
    let last = null
    let capTimer = 0
    const frame = (now) => {
      if (last != null) clock.current += Math.min(0.1, (now - last) / 1000)
      last = now
      const t = clock.current
      scene.draw(t)
      const c = captionAt(t * 1000)
      if (c !== lastCap.current) {
        lastCap.current = c
        setCapOff(true)
        clearTimeout(capTimer)
        if (c) capTimer = setTimeout(() => { setCap(c); setCapOff(false) }, 220)
      }
      if (t * 1000 >= INTRO_END_MS) setEnded(true)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(capTimer)
      ro.disconnect()
    }
  }, [])

  function skip() {
    clock.current = Math.max(clock.current, SKIP_TO)
    setEnded(true)
  }
  function finish() {
    haptic('success')
    onDone()
  }

  return (
    <div className="intro" role="dialog" aria-label="Giriş filmi">
      <canvas ref={canvas} className="intro-canvas" aria-hidden="true" />
      {!ended && <button type="button" className="intro-skip" onClick={skip}>Atla</button>}
      <p className={`intro-cap${capOff || ended ? ' off' : ''}`} aria-live="polite">{cap}</p>
      <div className={`intro-final${ended ? ' on' : ''}`} aria-hidden={!ended}>
        <div className="intro-logo">Nefona</div>
        <p className="intro-tag">Fark etmeyi yeniden öğren.</p>
        <button type="button" className="btn intro-start" onClick={finish} disabled={!ended}>{replay ? 'Kapat' : 'Başla'}</button>
      </div>
    </div>
  )
}
