import { useEffect, useRef, useState } from 'react'
import { validBirthDate } from '../lib/identity.js'

// Doğum tarihi: gün / ay / yıl ayrı kutucuklar (sayı klavyesi). Kutu dolunca sıradakine geçer.
// value: 'YYYY-MM-DD' | null. onChange(value | null) — üç kutu da geçerli bir tarih olunca değer, değilse null.
const split = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v ?? '')
  return m ? { d: m[3], m: m[2], y: m[1] } : { d: '', m: '', y: '' }
}

export default function BirthDateBoxes({ value, onChange, id = 'birth' }) {
  const [f, setF] = useState(() => split(value))
  const refs = { d: useRef(null), m: useRef(null), y: useRef(null) }
  const last = useRef(value ?? null)
  useEffect(() => {
    if ((value ?? null) !== last.current) {
      last.current = value ?? null
      setF(split(value))
    }
  }, [value])

  const complete = f.d.length > 0 && f.m.length > 0 && f.y.length === 4
  const iso = complete ? `${f.y}-${f.m.padStart(2, '0')}-${f.d.padStart(2, '0')}` : null
  const bad = complete && !validBirthDate(iso)

  function set(k, raw, max, next) {
    const v = raw.replace(/\D/g, '').slice(0, max)
    const nf = { ...f, [k]: v }
    setF(nf)
    const ok = nf.d && nf.m && nf.y.length === 4
    const out = ok ? `${nf.y}-${nf.m.padStart(2, '0')}-${nf.d.padStart(2, '0')}` : null
    const val = out && validBirthDate(out) ? out : null
    last.current = val
    onChange(val)
    if (v.length === max && next) refs[next].current?.focus()
  }

  return (
    <div className="bd-wrap">
      <div className={`bd-boxes${bad ? ' bad' : ''}`} role="group" aria-labelledby={`${id}-label`}>
        <input ref={refs.d} className="input bd-box" inputMode="numeric" autoComplete="bday-day" placeholder="Gün" aria-label="Gün" value={f.d} onChange={(e) => set('d', e.target.value, 2, 'm')} />
        <input ref={refs.m} className="input bd-box" inputMode="numeric" autoComplete="bday-month" placeholder="Ay" aria-label="Ay" value={f.m} onChange={(e) => set('m', e.target.value, 2, 'y')} />
        <input ref={refs.y} className="input bd-box bd-year" inputMode="numeric" autoComplete="bday-year" placeholder="Yıl" aria-label="Yıl" value={f.y} onChange={(e) => set('y', e.target.value, 4, null)} />
      </div>
      {bad && <span className="muted small" role="alert">Bu tarih olamaz.</span>}
    </div>
  )
}
