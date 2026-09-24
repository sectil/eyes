import { useState } from 'react'
import { CreditCard, Minus, Plus, Check, TriangleAlert } from 'lucide-react'
import { StepHeader } from '../components/ui.jsx'

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

export default function CardCalibration({ onDone, initial, changed }) {
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
    <main className="screen fade-in">
      <StepHeader
        step={2}
        total={3}
        title="Ekranını ölçelim"
        subtitle="Harflerin gerçek boyutta görünmesi için. Bir banka veya kimlik kartını dikey olarak ekrana yasla, çerçeveyi kartla aynı boya getir."
      />
      {changed && (
        <div className="card tone-warn small">
          <div className="row"><TriangleAlert size={18} /> Ekran ayarı veya yakınlaştırma değişmiş; lütfen yeniden ölç.</div>
        </div>
      )}

      <div className="card-frame">
        <div className="card-rect" style={{ width: `${w}px`, height: `${h}px` }} aria-label="Kart şablonu" />
      </div>

      <div className="slider-row">
        <button className="btn-icon" onClick={() => nudge(-0.02)} aria-label="Küçült"><Minus size={20} /></button>
        <input type="range" min="2" max="12" step="0.005" value={pxPerMm} onChange={(e) => setPxPerMm(Number(e.target.value))} aria-label="Boyut" />
        <button className="btn-icon" onClick={() => nudge(0.02)} aria-label="Büyüt"><Plus size={20} /></button>
      </div>

      <p className="note"><CreditCard size={16} /> Tarayıcıda yakınlaştırma yapma; yaparsan bu ölçüm yenilenir.</p>

      <button className="btn" onClick={save}>
        <Check size={18} aria-hidden="true" /> Kartla aynı boyda
      </button>
    </main>
  )
}
