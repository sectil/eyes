import { useState } from 'react'

// ISO/IEC 7810 ID-1 (kredi kartı, kimlik kartı) ölçüleri
export const CARD_W_MM = 53.98 // dikey tutulduğunda en
export const CARD_H_MM = 85.6 // dikey tutulduğunda boy

// Kalibrasyonun hâlâ geçerli olup olmadığı: yakınlaştırma/ekran değişince bozulur
export function calibrationStillValid(cal) {
  if (!cal) return false
  return (
    cal.dpr === window.devicePixelRatio &&
    cal.screenW === window.screen.width &&
    cal.screenH === window.screen.height
  )
}

export default function CardCalibration({ onDone, initial }) {
  // Başlangıç tahmini: CSS standardı 96 px/inç
  const [pxPerMm, setPxPerMm] = useState(initial?.pxPerMm ?? 96 / 25.4)

  const w = CARD_W_MM * pxPerMm
  const h = CARD_H_MM * pxPerMm
  const nudge = (d) => setPxPerMm((p) => Math.max(2, Math.min(12, +(p + d).toFixed(4))))

  function save() {
    onDone({
      pxPerMm,
      dpr: window.devicePixelRatio,
      screenW: window.screen.width,
      screenH: window.screen.height,
      date: new Date().toISOString(),
    })
  }

  return (
    <main className="screen">
      <h1>Ekran kalibrasyonu</h1>
      <p className="muted">
        Harflerin gerçek boyutta görünmesi için ekranınızın ölçüsünü öğrenmemiz
        gerekiyor. Bir banka kartını (veya kimlik kartını) <strong>dikey</strong> olarak
        ekrana yaslayın ve mavi dikdörtgen kartla tam aynı boyda olana kadar ayarlayın.
      </p>
      <p className="muted small">Tarayıcıda yakınlaştırma yapmayın; yaparsanız kalibrasyon yenilenir.</p>

      <div className="card-frame">
        <div className="card-rect" style={{ width: `${w}px`, height: `${h}px` }} aria-label="Kart şablonu" />
      </div>

      <div className="row">
        <button className="btn btn-ghost" onClick={() => nudge(-0.1)} aria-label="Büyük küçült">−−</button>
        <button className="btn btn-ghost" onClick={() => nudge(-0.01)} aria-label="Küçült">−</button>
        <input
          type="range"
          min="2"
          max="12"
          step="0.005"
          value={pxPerMm}
          onChange={(e) => setPxPerMm(Number(e.target.value))}
          aria-label="Boyut"
        />
        <button className="btn btn-ghost" onClick={() => nudge(0.01)} aria-label="Büyüt">+</button>
        <button className="btn btn-ghost" onClick={() => nudge(0.1)} aria-label="Büyük büyüt">++</button>
      </div>

      <button className="btn" onClick={save}>Kart ile aynı boyda — kaydet</button>
    </main>
  )
}
