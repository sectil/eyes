import { useRef, useState } from 'react'
import { Copy, Crosshair, Share2 } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader, GAZE_FULL_DEG } from '../lib/gaze.js'
import { FEATURES, loadGazeModel } from '../lib/gazeCalib.js'
import '../styles/gazecal.css'

// Göz takibi testi (Bilgi): canlı bakış noktası + ham sinyaller. "Verileri paylaş" son ~5 sn'lik
// ham kareyi ve kalibrasyon modelini metin olarak paylaşır/kopyalar — sorun olursa geliştiriciye
// tahmin yerine gerçek veri gönderilir. Kamera görüntüsü içermez, yalnızca sayılar.
const KEEP_FRAMES = 150
const FIELDS = ['tracked', 'gazeLeftX', 'gazeLeftY', 'gazeRightX', 'gazeRightY', 'lookAtX', 'lookAtY', 'lookAtZ', 'lookInLeft', 'lookInRight', 'lookOutLeft', 'lookOutRight', 'lookUpLeft', 'lookUpRight', 'lookDownLeft', 'lookDownRight', 'blinkLeft', 'blinkRight', 'mm']
const DIR_LABEL = { left: '← Sol', right: 'Sağ →', up: '↑ Yukarı', down: '↓ Aşağı', center: 'Orta' }

const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—')

export default function GazeTest({ onBack, onCalibrate }) {
  const model = useRef(loadGazeModel()).current
  const reader = useRef(createGazeReader())
  const frames = useRef([])
  const [live, setLive] = useState({ g: null, f: null })
  const [note, setNote] = useState('')
  const lastUi = useRef(0)

  const onFrame = (m) => {
    const g = reader.current.push(m)
    const rec = { t: Math.round(m.ts) }
    for (const k of FIELDS) if (m[k] !== undefined) rec[k] = typeof m[k] === 'number' ? +m[k].toFixed(4) : m[k]
    frames.current.push(rec)
    if (frames.current.length > KEEP_FRAMES) frames.current.shift()
    if (m.ts - lastUi.current > 80) {
      lastUi.current = m.ts
      setLive({ g, f: m })
    }
  }
  const cam = useFaceTracking({ enabled: true, trueDepth: true, onFrame })

  async function share() {
    const payload = JSON.stringify({ app: 'EyeTrail', kind: 'gaze-debug', build: import.meta.env.VITE_APP_BUILD ?? 'web', model, frames: frames.current }, null, 0)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'EyeTrail göz verisi', text: payload })
        setNote('Paylaşıldı.')
        return
      }
    } catch {
      // paylaşım iptal/desteklenmiyor → kopyala
    }
    try {
      await navigator.clipboard.writeText(payload)
      setNote('Panoya kopyalandı. Mesaja yapıştırıp gönderebilirsin.')
    } catch {
      setNote('Kopyalanamadı.')
    }
  }

  const g = live.g
  const f = live.f ?? {}
  const px = g ? Math.max(-1, Math.min(1, g.v.x / GAZE_FULL_DEG)) : 0
  const py = g ? Math.max(-1, Math.min(1, g.v.y / GAZE_FULL_DEG)) : 0
  const used = model ? [model.x.feature, model.y.feature] : []

  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} eyebrow="Bilgi" title="Göz takibi testi" subtitle="Gözünü gezdir; nokta seninle hareket etmeli." />
      <div className={`gazecal-pad ${g?.dir && g.dir !== 'center' ? 'on' : ''}`} aria-hidden="true">
        <span className="gazecal-cross" />
        {g?.tracked && !g.closed && <span className="gazecal-live" style={{ left: `${50 + px * 42}%`, top: `${50 - py * 42}%` }} />}
      </div>
      <p className="gazecal-dir">
        {!cam.ready ? 'Kamera açılıyor…' : cam.error ? 'Kamera açılamadı' : !g?.tracked ? 'Yüzünü kameraya göster' : g.closed ? 'Gözler kapalı' : DIR_LABEL[g.dir] ?? '…'}
      </p>

      <section className="card">
        <div className="row between">
          <strong>Kalibrasyon</strong>
          <span className="muted small">{model ? `sağ/sol: ${model.x.feature} · yukarı/aşağı: ${model.y.feature}` : 'yapılmadı'}</span>
        </div>
        <button className="btn btn-ghost" onClick={onCalibrate}><Crosshair size={18} aria-hidden="true" /> {model ? 'Yeniden kalibre et' : 'Kalibre et'}</button>
      </section>

      <section className="card">
        <strong>Ham sinyaller</strong>
        <div className="gazetest-grid">
          {Object.entries(FEATURES).map(([k, fn]) => (
            <FragmentRow key={k} label={k} value={fmt(fn(f), k.startsWith('look') ? 3 : 2)} hl={used.includes(k)} />
          ))}
          <FragmentRow label="v (x, y)" value={g ? `${fmt(g.v.x, 1)}, ${fmt(g.v.y, 1)}` : '—'} />
          <FragmentRow label="mesafe" value={f.mm ? `${Math.round(f.mm / 10)} cm` : '—'} />
        </div>
      </section>

      <button className="btn btn-ghost" onClick={share}>
        {navigator.share ? <Share2 size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} Verileri paylaş
      </button>
      {note && <p className="muted small" style={{ textAlign: 'center' }}>{note}</p>}
      <p className="muted small">Paylaşılan veri yalnızca sayılardır (son ~5 sn); kamera görüntüsü içermez.</p>
    </main>
  )
}

function FragmentRow({ label, value, hl }) {
  return (
    <>
      <span>{label}</span>
      <span className={hl ? 'hl' : ''}>{value}</span>
    </>
  )
}
