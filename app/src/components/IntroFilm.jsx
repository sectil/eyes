import { useEffect, useRef } from 'react'
import { createIntroStill } from '../lib/introStill.js'
import { haptic } from '../lib/native.js'
import '../styles/intro.css'

// Giriş ekranı (Artifact "Nefona Giriş Ekranı", onaylı): hareketsiz tek kare, tam ekran. Çizim lib/introStill.js'te;
// yazılar tuvalde (ekran okuyucu için ayrıca gizli başlık), "Başla" göz bebeğinin karanlığında gerçek düğme.
// Eski 15 sn'lik film kaldırıldı. Ad geriye uyum için IntroFilm kaldı (App.jsx).
export default function IntroFilm({ onDone, replay = false }) {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    let still = null
    try {
      still = createIntroStill(document)
    } catch {
      return undefined // tuval yoksa yalnız düz zemin, başlık ve düğme
    }
    const paint = () => {
      const r = el.getBoundingClientRect()
      const d = Math.min(3, window.devicePixelRatio || 1)
      el.width = Math.max(1, Math.round(r.width * d))
      el.height = Math.max(1, Math.round(r.height * d))
      still.draw(el.getContext('2d'), el.width, el.height)
    }
    paint()
    // Yazı tipleri yüklenince yeniden çiz (ilk karede yedek yazı tipi görünmesin)
    let alive = true
    document.fonts?.ready.then(() => alive && paint())
    const ro = new ResizeObserver(paint)
    ro.observe(el)
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  function finish() {
    haptic('success')
    onDone()
  }

  return (
    <div className="intro" role="dialog" aria-labelledby="intro-title">
      <canvas ref={canvas} className="intro-canvas" aria-hidden="true" />
      <h1 id="intro-title" className="sr-only">Nefona. Fark etmeyi yeniden öğren.</h1>
      <button type="button" className="btn intro-start" onClick={finish}>{replay ? 'Kapat' : 'Başla'}</button>
    </div>
  )
}
