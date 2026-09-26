import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { suggestCities, CITY_MAX, TR_CITIES } from '../lib/cities.js'

// Şehir kutucuğu: dokununca açılır liste (boşken 81 il, yazdıkça süzülür); serbest metin de kabul (yurt dışı).
// Bug 13: boş alanda liste hiç açılmıyordu; iPhone'da klavye kapanırken sayfa kayıp dokunuş kaçabiliyordu.
// Parmak değince (pointerdown) varsayılan engellenir: alan odağı kaybetmez, klavye kapanmaz, sayfa kaymaz.
// Seçim dokunuş bitince (click) yapılır; böylece uzun listede kaydırmak seçim sanılmaz.
export default function CityField({ value, onChange, id = 'city' }) {
  const [open, setOpen] = useState(false)
  const q = (value ?? '').trim()
  const list = !open ? [] : q ? suggestCities(q, TR_CITIES, 8).filter((c) => c !== value) : TR_CITIES
  const pick = (c) => {
    onChange(c)
    setOpen(false)
  }
  return (
    <div className="city">
      <div className="city-input">
        <MapPin size={16} aria-hidden="true" className="muted" />
        <input
          id={id}
          className="input"
          type="text"
          value={value}
          maxLength={CITY_MAX}
          autoComplete="address-level2"
          placeholder="Yaşadığın şehir"
          aria-label="Şehir"
          aria-expanded={list.length > 0}
          aria-controls={`${id}-list`}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
        />
      </div>
      {list.length > 0 && (
        <div id={`${id}-list`} className={`city-list${q ? '' : ' all'}`} role="listbox" aria-label="Şehirler">
          {list.map((c) => (
            <button
              key={c}
              type="button"
              role="option"
              aria-selected={c === value}
              className="city-opt"
              onPointerDown={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
