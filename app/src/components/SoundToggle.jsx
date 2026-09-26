import { useEffect, useState } from 'react'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { unlockAudio } from '../lib/cue.js'

// Sesli yönlendirme aç/kapat. Tek tercih (prefs.sound; Profil → Ses ve titreşim ile aynı), her sesli
// ekranda aynı düğme. Yaylanan yuvarlak anahtar: açıkken hoparlörden dalgalar yayılır, kapatınca
// çizgi iner ve anahtar hafif sallanır. Titreşim tercihine dokunmaz.
export default function SoundToggle({ className = '' }) {
  const [on, setOn] = useState(() => getPrefs().sound)
  const [bump, setBump] = useState(0) // her dokunuşta animasyonu yeniden başlatır
  useEffect(() => subscribePrefs((p) => setOn(p.sound)), [])
  const toggle = () => {
    const next = !on
    setPrefs({ sound: next })
    if (next) unlockAudio()
    setBump((b) => b + 1)
  }
  return (
    <button
      type="button"
      className={`sound-toggle ${on ? 'on' : 'off'} ${className}`}
      role="switch"
      aria-checked={on}
      aria-label={on ? 'Ses açık, kapatmak için dokun' : 'Ses kapalı, açmak için dokun'}
      onClick={toggle}
    >
      <span className="sound-knob" key={bump}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className="sound-body" d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5z" />
          <path className="sound-wave w1" d="M15 9.6a3.4 3.4 0 0 1 0 4.8" />
          <path className="sound-wave w2" d="M17.6 7a7 7 0 0 1 0 10" />
          <path className="sound-slash" d="M4.5 4.5l15 15" />
        </svg>
      </span>
      <span className="sound-text">{on ? 'Ses' : 'Sessiz'}</span>
    </button>
  )
}
