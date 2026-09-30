import { MapPin, LocateFixed, Lock } from 'lucide-react'
import { confirmQuestion, placeLabel } from '../lib/places.js'
import '../styles/sky.css'

// G · kesin konumda ilçe onayı (tasarım b2-tasarim/G-tur2, 5sn-b2.md tur 2: 4/5). Yalnız kesin konum izni verilmişse;
// en yakın ilçe merkezi telefonda bulundu (lib/places.js suggestFromLocation), ters coğrafi kodlama yok.
// "Başka ilçe" K'daki listeye döner. İlçe adı 11 harf ve üstüyse soru küçük boyla iki satıra iner.
//   place: { il, ilce } · onYes() · onOther()
export default function SkyConfirm({ place, onYes, onOther }) {
  const long = (place?.ilce ?? '').length >= 11
  return (
    <main className="sky-page sky-g">
      <div className="g-head">
        <span className="sky-nef lg" aria-hidden="true" />
        <span className="sky-who">Nef</span>
        <h1 className={`g-t${long ? ' uzun' : ''}`}>{confirmQuestion(place.ilce)}</h1>
      </div>
      <div className="g-card">
        <div className="g-row">
          <span className="g-pi" aria-hidden="true"><MapPin size={20} /></span>
          <div><span className="sky-lbl">İl ve ilçe</span><b className="g-place">{placeLabel(place)}</b></div>
        </div>
        {/* Aday metin (5sn-b2.md; sahip onayı bekliyor) */}
        <p className="g-why"><LocateFixed size={16} aria-hidden="true" /><span>Konumuna en yakın ilçe merkezi bu.</span></p>
      </div>
      <p className="g-note"><Lock size={14} aria-hidden="true" />Konumunun kendisi saklanmaz.</p>
      <div className="g-btns">
        <button type="button" className="btn" onClick={onYes}>Evet</button>
        <button type="button" className="btn btn-secondary" onClick={onOther}>Başka ilçe</button>
      </div>
    </main>
  )
}
