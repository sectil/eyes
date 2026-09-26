import { useId } from 'react'
import '../styles/info.css'

// iOS Ayarlar tarzı anahtar satırı. Satırın tamamı dokunulabilir; ekran okuyucu "anahtar, açık/kapalı" okur.
// trailing: anahtarın solunda ek düğme (ör. ⚙ ayrıntı) — data-no-tap ile satır dokunuşundan ayrı.
export default function PrefToggle({ Icon, IconOff, label, sub, checked, onChange, trailing = null }) {
  const id = useId()
  const Off = IconOff ?? Icon
  return (
    <div className="list-row pref-row pref-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={sub ? `${id}-s` : undefined}
        className="pref-toggle pref-toggle-main"
        onClick={() => onChange(!checked)}
      >
        {Icon && (
          <span className={`pref-icon${checked ? ' on' : ''}`} aria-hidden="true">
            {checked ? <Icon size={18} /> : <Off size={18} />}
          </span>
        )}
        <span className="pref-text">
          <span id={`${id}-l`} className="pref-label">{label}</span>
          {sub && <span id={`${id}-s`} className="pref-sub">{sub}</span>}
        </span>
      </button>
      {trailing}
      <button type="button" className="pref-toggle" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} tabIndex={-1}>
        <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
      </button>
    </div>
  )
}
