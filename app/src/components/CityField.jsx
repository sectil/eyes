import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { suggestCities, CITY_MAX } from '../lib/cities.js'

// Şehir kutucuğu: yazdıkça 81 ilden öneri; serbest metin de kabul (yurt dışı).
export default function CityField({ value, onChange, id = 'city' }) {
  const [open, setOpen] = useState(false)
  const list = open ? suggestCities(value).filter((c) => c !== value) : []
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
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
        />
      </div>
      {list.length > 0 && (
        <div className="city-list" role="listbox" aria-label="Şehir önerileri">
          {list.map((c) => (
            <button key={c} type="button" role="option" aria-selected="false" className="city-opt" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(c); setOpen(false) }}>{c}</button>
          ))}
        </div>
      )}
    </div>
  )
}
