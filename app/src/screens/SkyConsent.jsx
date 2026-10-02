import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CloudSun, ChevronDown } from 'lucide-react'
import { CONSENTS } from '../lib/consent.js'
import { PRIVACY_URL } from './Paywall.jsx'
import '../styles/sky.css'

// weather rızası, katmanlı (R; tasarım b2-tasarim/R-katmanli, 5sn-b2.md tur 4: 5/5 anladı). Sağlık rızasının
// ConsentSheet'i DEĞİŞMEZ; bu ayrı bileşendir. Metin lib/consent.js CONSENTS.weather, harfi harfine: her bölümün ilk
// cümlesi hep görünür, kalanı dokununca aynı paragrafta açılır. Kutu işaretsiz; "Şimdi değil" hiçbir şeyi kapatmaz.
// Rıza sayfası iOS konum penceresinden ÖNCE gelir (App akışı). onAnswer(true | false)
// Tur 4'ün üç kod notu:
//   (1) 320'de "Nerede durur?" solma efektinin altında kalıyordu → yurt dışı bilgisi ilk ekranda: satır en üstte.
//   (2) "Önce kutuyu işaretle" daha büyük ve koyu (.sc-hint).
//   (3) "Ne işe yarar?" satırında da açılır ok (tek cümle; açılınca değişen yalnız ok).
const ORDER = ['Nerede durur?', 'Ne kaydedilir?', 'Ne işe yarar?', 'Ne kadar kalır?']

export function splitFirst(text) {
  const i = text.indexOf('. ')
  return i < 0 ? [text, ''] : [text.slice(0, i + 1), text.slice(i + 1)]
}

export default function SkyConsent({ onAnswer, portal = true }) {
  const c = CONSENTS.weather
  const [ok, setOk] = useState(false)
  const [open, setOpen] = useState(null)
  const facts = ORDER.map((k) => c.facts.find((f) => f[0] === k)).filter(Boolean)
  const sheet = (
    <div className="cs-back sc-back" role="presentation">
      <div className="cs-sheet sc-sheet" role="dialog" aria-modal="true" aria-labelledby="sc-title">
        <div className="sc-body">
          <span className="cs-grab" aria-hidden="true" />
          <div className="sc-top">
            <span className="cs-shield" aria-hidden="true"><CloudSun size={26} /></span>
            <h2 id="sc-title">{c.title}</h2>
          </div>
          <p className="cs-lead">{c.lead}</p>
          <div className="sc-facts">
            {facts.map(([k, v]) => {
              const [first, rest] = splitFirst(v)
              const on = open === k
              return (
                <div key={k} className={`sc-row${on ? ' open' : ''}`}>
                  <button type="button" className="sc-q" aria-expanded={on} onClick={() => setOpen(on ? null : k)}>
                    <span>{k}</span><ChevronDown size={18} aria-hidden="true" />
                  </button>
                  <p className="sc-a"><span>{first}</span>{rest && on ? <span>{rest}</span> : null}</p>
                </div>
              )
            })}
          </div>
        </div>
        <div className="sc-act">
          <label className={`cs-ok${ok ? ' on' : ''}`}>
            <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
            <span className="cs-box" aria-hidden="true">{ok && <Check size={16} strokeWidth={3} />}</span>
            <span>{c.check}</span>
          </label>
          <div className="sc-btns">
            <button type="button" className="btn sc-later" onClick={() => onAnswer(false)}>Şimdi değil</button>
            <span className="sc-col">
              <button type="button" className={`btn${ok ? '' : ' is-off'}`} aria-disabled={!ok} aria-describedby={ok ? undefined : 'sc-hint'}
                onClick={() => { if (ok) onAnswer(true) }}>İzin ver</button>
              {!ok && <span className="sc-hint" id="sc-hint">Önce kutuyu işaretle</span>}
            </span>
          </div>
          <p className="cs-foot">
            {PRIVACY_URL ? <><a href={PRIVACY_URL} target="_blank" rel="noreferrer">Aydınlatma metninin tamamı</a> · </> : null}
            İznini Profilim → İzinlerim'den her an geri çekebilirsin.
          </p>
        </div>
      </div>
    </div>
  )
  return portal ? createPortal(sheet, document.body) : sheet
}
