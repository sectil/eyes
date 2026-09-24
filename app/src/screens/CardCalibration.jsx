import { useState } from 'react'
import { Minus, Plus, Check, TriangleAlert, Ruler, IdCard, ShieldCheck } from 'lucide-react'
import { StepHeader } from '../components/ui.jsx'

// ISO/IEC 7810 ID-1 standart kart ölçüsü (kimlik kartı, ehliyet, çoğu plastik kart)
export const CARD_W_MM = 53.98 // dikey tutulduğunda en
export const CARD_H_MM = 85.6 // dikey tutulduğunda boy
export const RULER_MM = 50 // ekranda çizilen cetvel uzunluğu

// Kalibrasyonun hâlâ geçerli olup olmadığı: yakınlaştırma/ekran değişince bozulur
export function calibrationStillValid(cal) {
  if (!cal) return false
  return (
    cal.dpr === window.devicePixelRatio &&
    cal.screenW === window.screen.width &&
    cal.screenH === window.screen.height
  )
}

function ScreenRuler({ pxPerMm }) {
  const w = RULER_MM * pxPerMm
  const ticks = []
  for (let mm = 0; mm <= RULER_MM; mm++) {
    const h = mm % 10 === 0 ? 26 : mm % 5 === 0 ? 18 : 10
    ticks.push(<line key={mm} x1={mm * pxPerMm} x2={mm * pxPerMm} y1={0} y2={h} style={{ stroke: 'var(--ink)', strokeWidth: 1 }} />)
    if (mm % 10 === 0) {
      ticks.push(
        <text key={`t${mm}`} x={mm * pxPerMm} y={42} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 600 }}>
          {mm / 10}
        </text>,
      )
    }
  }
  return (
    <div className="ruler-wrap">
      <svg width={w + 24} height={48} viewBox={`-12 0 ${w + 24} 48`} aria-label="Ekrandaki cetvel, 0 ile 5 santimetre arası">
        <line x1={0} x2={w} y1={0.5} y2={0.5} style={{ stroke: 'var(--ink)', strokeWidth: 1 }} />
        {ticks}
      </svg>
      <span className="muted small">cm</span>
    </div>
  )
}

export default function CardCalibration({ onDone, initial, changed }) {
  // Başlangıç tahmini (kullanıcı ayarlar): dokunmatik cihazda ~6.1 px/mm
  // (390 CSS px ≈ 64 mm genişlikteki bir telefondan kaba hesap), masaüstünde CSS standardı 96 px/inç.
  const [pxPerMm, setPxPerMm] = useState(
    initial?.pxPerMm ?? (navigator.maxTouchPoints > 0 ? 6.1 : 96 / 25.4),
  )
  const [method, setMethod] = useState(initial?.method ?? 'ruler')

  const nudge = (d) => setPxPerMm((p) => Math.max(2, Math.min(12, +(p + d).toFixed(4))))

  function save() {
    onDone({
      pxPerMm,
      method,
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
        title="Ekran boyutunu ayarlayalım"
        subtitle="Telefon ekranları farklı büyüklükte. Testteki harflerin her telefonda aynı gerçek boyutta görünmesi için bir kez ayar yapıyoruz."
      />
      <p className="note"><ShieldCheck size={16} /> Bu adımda kamera açılmaz ve hiçbir bilgi istenmez. Sayfayı iki parmakla büyütüp küçültme.</p>

      {changed && (
        <div className="card tone-warn small">
          <div className="row"><TriangleAlert size={18} /> Ekran ayarı veya yakınlaştırma değişmiş; lütfen yeniden ayarla.</div>
        </div>
      )}

      <div className="segmented" role="group" aria-label="Ayar yöntemi">
        <button aria-pressed={method === 'ruler'} onClick={() => setMethod('ruler')}><Ruler size={16} /> Cetvelle</button>
        <button aria-pressed={method === 'card'} onClick={() => setMethod('card')}><IdCard size={16} /> Kartla</button>
      </div>

      {method === 'ruler' ? (
        <>
          <ol className="steps">
            <li>Bir cetvel veya mezura al.</li>
            <li>Cetvelin <strong>0</strong> çizgisini ekrandaki <strong>0</strong> ile hizala.</li>
            <li>Aşağıdaki <strong>+ / –</strong> düğmeleriyle ekrandaki <strong>5</strong>'i cetveldeki <strong>5 cm</strong> ile aynı yere getir.</li>
          </ol>
          <ScreenRuler pxPerMm={pxPerMm} />
        </>
      ) : (
        <>
          <ol className="steps">
            <li>Kimlik kartı, ehliyet veya market kartı gibi <strong>standart boyutlu</strong> herhangi bir plastik kart al. İstersen arka yüzünü çevir — sadece boyutunu kullanıyoruz.</li>
            <li>Kartı <strong>dik</strong> olarak aşağıdaki çerçevenin üstüne koy.</li>
            <li><strong>+ / –</strong> ile çerçeveyi kartla aynı boya getir.</li>
          </ol>
          <div className="card-frame">
            <div className="card-rect" style={{ width: `${CARD_W_MM * pxPerMm}px`, height: `${CARD_H_MM * pxPerMm}px` }} aria-label="Kart çerçevesi" />
          </div>
        </>
      )}

      <div className="calib-controls">
      <div className="slider-row">
        <button className="btn-icon" onClick={() => nudge(-0.02)} aria-label="Küçült"><Minus size={20} /></button>
        <input type="range" min="2" max="12" step="0.005" value={pxPerMm} onChange={(e) => setPxPerMm(Number(e.target.value))} aria-label="Boyut" />
        <button className="btn-icon" onClick={() => nudge(0.02)} aria-label="Büyüt"><Plus size={20} /></button>
      </div>

      <button className="btn" onClick={save}>
        <Check size={18} aria-hidden="true" /> {method === 'ruler' ? '5 cm tam denk geliyor' : 'Kartla aynı boyda'}
      </button>
      </div>
    </main>
  )
}
