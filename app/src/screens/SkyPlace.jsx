import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Lock, Search } from 'lucide-react'
import { ilList, searchIlce, accusative, fold } from '../lib/places.js'
import '../styles/sky.css'

// K · il ve ilçe seçimi (tasarım b2-tasarim/K-C, 5sn-b2.md: 4/5 geçti). Yaklaşık konum yalnız ili bulur ("yaklaşık"
// etiketi, parantezsiz); ilçe listeden, arama alanıyla. İlçe profile yazılmaz (lib/places.js savePlace).
// Değerlendirici notu: "Yalnız İzmir" (ilçesiz devam) listenin başında. En yakın ilçe önerisi yalnız kesin konumda (G);
// yaklaşık konumda ilçe önerilmez (PLAN.v1 §3.B.1).
// Aday metinler (5sn-b2.md; sahip onayı bekliyor): "Hangi ilçedesin?", "İlçe ara", "Yalnız İzmir", "Konum".
// Sahip kararı (2026-10-01): il ve ilçe konumdan kendiliğinden seçilir; bu liste yalnız konum izni yokken ya da hava
// sayfasındaki "Değiştir"den açılır (backLabel 'Hava': geri hava sayfasına).
//   il: string|null (önceki seçimden) · approx: boolean · onPick({ il, ilce|null, approx }) · onBack · backLabel
// TASLAK aday (5 sn kapısı): ilçesiz devam düğmesi
export const ONLY_IL = (il) => `Yalnız ${il} ile devam et`
export default function SkyPlace({ il: il0 = null, approx: approx0 = false, onPick, onBack, backLabel = 'Ana sayfa' }) {
  const [il, setIl] = useState(il0)
  const [approx, setApprox] = useState(Boolean(il0) && approx0)
  const [q, setQ] = useState('')
  const ilceler = useMemo(() => (il ? searchIlce(il, q) : []), [il, q])
  const iller = useMemo(() => (il ? [] : ilList().filter((n) => fold(n).includes(fold(q)))), [il, q])
  const pickIl = (name) => { setIl(name); setApprox(false); setQ('') }
  return (
    <main className="sky-page sky-k" aria-label="Konum">
      <button type="button" className="sky-back" onClick={onBack}><ChevronLeft size={20} aria-hidden="true" />{backLabel}</button>
      <div className="sky-says">
        <span className="sky-nef" aria-hidden="true" />
        <p className="sky-bubble">
          <span className="sky-who">Nef</span>
          {!il ? 'Hangi ildesin?' : approx ? `${accusative(il)} buldum. Hangi ilçedesin?` : 'Hangi ilçedesin?'}
        </p>
      </div>
      {il && (
        <div className="sky-place">
          <span className="sky-pi" aria-hidden="true"><MapPin size={18} /></span>
          <div>
            <span className="sky-lbl">İl</span>
            <span className="sky-val"><b>{il}</b>{approx && <span className="sky-chip">yaklaşık</span>}</span>
          </div>
          <button type="button" className="sky-link" onClick={() => { setIl(null); setApprox(false); setQ('') }}>Değiştir</button>
        </div>
      )}
      {/* D2 (sahip 2026-10-01: "il seçince onay düğmesi yok"): ilçesiz devam açık bir ana düğme; listedeki "Yalnız İzmir"
          satırı onay gibi okunmuyordu. İlçe seçmek de tek dokunuşla tamamlar. Yazı TASLAK (kapı + sahip onayı). */}
      {il && <button type="button" className="btn sky-ok" onClick={() => onPick({ il, ilce: null, approx })}>{ONLY_IL(il)}</button>}
      <p className="sky-keep"><Lock size={15} aria-hidden="true" /><span>Telefonda yalnız il ve ilçe adı kalır.</span></p>
      <label className="sky-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={il ? 'İlçe ara' : 'İl ara'} aria-label={il ? 'İlçe ara' : 'İl ara'} />
      </label>
      <div className="sky-list" role="list">
        {(il ? ilceler : iller).map((n) => (
          <button type="button" role="listitem" key={n} className="sky-li" onClick={() => (il ? onPick({ il, ilce: n, approx: false }) : pickIl(n))}>
            {n}<ChevronRight size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
    </main>
  )
}
