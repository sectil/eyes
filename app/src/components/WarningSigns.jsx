import { EyeOff, PanelTop, Zap, Waves, Sun, Blend, TriangleAlert } from 'lucide-react'
import { RED_FLAGS } from '../lib/profile.js'
import '../styles/setup.css'

// Göz doktoruna gitmeyi gerektiren belirtiler (lib/profile.js RED_FLAGS). Soru değil, bilgi (sahibinin kararı, 27 Eylül:
// "bilgi olarak çıkmalı, uygulama kullanılabilmeli"): kurulumda (screens/Safety.jsx), Bilgi sekmesinde ve göz uyarısında.
// compact: daha sıkı satırlar (kart içinde).
const ICONS = { sudden: EyeOff, curtain: PanelTop, flashes: Zap, distortion: Waves, pain: Sun, diplopia: Blend }

export default function WarningSigns({ compact = false, label }) {
  return (
    <ul className={`ws-list${compact ? ' compact' : ''}`} aria-label={label}>
      {RED_FLAGS.map((f) => {
        const Icon = ICONS[f.id] ?? TriangleAlert
        return (
          <li key={f.id}>
            <Icon size={compact ? 17 : 20} aria-hidden="true" />
            <span>{f.text}</span>
          </li>
        )
      })}
    </ul>
  )
}
