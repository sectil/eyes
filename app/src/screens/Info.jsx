import { useState } from 'react'
import { BookOpen, CreditCard, Camera, Bell, Download, Trash, ChevronRight, ShieldCheck } from 'lucide-react'
import { PageHeader, ThemeSwitch } from '../components/ui.jsx'

export default function Info({ onGo, onReset, exportJSON, distanceSkipped }) {
  const [confirm, setConfirm] = useState(false)

  function download() {
    const url = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'goz-olcum-veriler.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const Row = ({ Icon, label, sub, onClick, danger }) => (
    <button className={`list-row ${danger ? 'danger' : ''}`} onClick={onClick}>
      <Icon size={20} aria-hidden="true" />
      <span className="grow stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {sub && <span className="muted small">{sub}</span>}
      </span>
      {!danger && <ChevronRight size={18} className="muted" />}
    </button>
  )

  return (
    <>
      <PageHeader title="Bilgi" />

      <section className="stack">
        <span className="eyebrow">Görünüm</span>
        <ThemeSwitch />
      </section>

      <section className="stack">
        <span className="eyebrow">Bilim</span>
        <div className="list">
          <Row Icon={BookOpen} label="Bu neye dayanıyor?" sub="Her özelliğin kaynağı, kanıt düzeyi ve sınırları" onClick={() => onGo('evidence')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Ölçüm ayarları</span>
        <div className="list">
          <Row Icon={CreditCard} label="Ekran kalibrasyonu" sub="Kartla yeniden ölç" onClick={() => onGo('recalibrate')} />
          <Row Icon={Camera} label={distanceSkipped ? 'Mesafe takibini aç' : 'Mesafe kalibrasyonu'} sub="40 cm'yi yeniden öğret" onClick={() => onGo('recalibrate-distance')} />
          <Row Icon={Bell} label="Çalışma günleri ve hatırlatma" onClick={() => onGo('schedule')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Verilerim</span>
        <div className="list">
          <Row Icon={Download} label="Verilerimi indir" sub="JSON dosyası — göz doktorunla paylaşabilirsin" onClick={download} />
          <Row Icon={Trash} label="Tüm verileri sil" danger onClick={() => setConfirm(true)} />
        </div>
        {confirm && (
          <div className="card tone-danger">
            <p className="small">Tüm test sonuçların ve ayarların bu cihazdan silinecek. Geri alınamaz.</p>
            <div className="row">
              <button className="btn btn-danger btn-sm" onClick={onReset}>Evet, sil</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Vazgeç</button>
            </div>
          </div>
        )}
      </section>

      <p className="note">
        <ShieldCheck size={16} />
        Tıbbi bir karar vermeden önce göz doktoruna danış. Ani görme kaybı, perde inmesi, ışık çakmaları veya göz ağrısında vakit kaybetmeden başvur.
      </p>
    </>
  )
}
