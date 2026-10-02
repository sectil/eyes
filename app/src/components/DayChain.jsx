import { GLYPH } from './TodayPath.jsx'
import { EGlyph } from './howtoArt.jsx'

// Günün zinciri (Y1 ilk görünüm, 5 saniye turu 2): bugünün duraklarının tek satırlık özeti. Her durak kendi çizimiyle
// (yoldaki çizimlerin aynısı: egzersiz, ölçüm merceği, mola ayı, günün görevi altın kenar); biten durak dolu ve onaylı,
// sıradaki durak halkalı ve biraz büyük. Ana sayfada "≈ N dk · M durak"ın altında; yoldan açılan nefesin bitişinde de
// aynı zincir ("bu durak da bitti"). Yazı taşımaz (erişilebilirlik: yanındaki sayı satırı ve aşağıdaki yol söyler).
// plan: lib/today.js buildPath sonucu. icons: modül simgeleri (Ana sayfa verir). doneKeys: bitti sayılacak ek duraklar
// (nefesin bitiş ekranı, kayıt yazılmadan önce).
const CHECK = <path d="M5 12.5l4.2 4.2L19 7" strokeWidth="3.2" />

function Glyph({ stop, Icon }) {
  if (stop.kind === 'measure') {
    if (stop.glyph === 'lines') return <path d="M6 8.5h12M6 12h12M6 15.5h8" />
    return <g stroke="none"><EGlyph x={7} y={7} size={10} dir="right" fill="currentColor" /></g>
  }
  if (GLYPH[stop.glyph]) return GLYPH[stop.glyph]
  if (Icon) return null
  return <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
}

export default function DayChain({ plan, icons = {}, doneKeys = [] }) {
  const stops = plan?.stops ?? []
  const n = stops.length
  if (!n) return null
  const isDone = (s) => Boolean(s.done) || doneKeys.includes(s.key)
  const next = !doneKeys.length && plan.next ? plan.next : stops.find((s) => !isDone(s) && !s.locked) ?? null
  let last = -1
  stops.forEach((s, i) => { if (isDone(s)) last = i })
  const p = n > 1 && last > 0 ? last / (n - 1) : 0
  return (
    <ol className="dc" style={{ '--n': n, '--p': p }} aria-hidden="true">
      {stops.map((s) => {
        const done = isDone(s)
        const st = done ? 'done' : s === next ? 'now' : s.locked ? 'locked' : 'later'
        const form = s.restSlot ? 'rest' : s.finale ? 'fi' : s.kind === 'measure' ? 'me' : 'ex'
        const Icon = !GLYPH[s.glyph] && s.kind !== 'measure' ? icons[s.id] : null
        return (
          <li key={s.key} className={`dc-s ${form} ${st}`}>
            <span className="dc-d">
              {!done && Icon ? (
                <Icon aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {done ? CHECK : <Glyph stop={s} Icon={Icon} />}
                </svg>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
