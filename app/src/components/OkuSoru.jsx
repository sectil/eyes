// Oku ve Anla soru ekranı (okuma-anlama/maket; 5 sn kapısı soru 5/5). Oku ve Anla ve Okurken göz denemesi aynı ekranı
// kullanır (sahip 2026-10-03: "okurun anladığını da tabii test edeceğiz"). Dört soru; seçince doğrusu gösterilir.
import { Check } from 'lucide-react'
import '../styles/okuma.css'

export function QRing({ done, cur }) {
  const r = 46, c = 2 * Math.PI * r, gap = 16, seg = c / 4 - gap
  const segOf = (i) => ({ on: i <= cur, dim: i === cur && i >= done })
  return (
  <>
  {/* Kısa ekranda (320×568) halka yerine tek satır: uzun soru ve seçenekler düğmenin arkasına kalmasın (kapı 2026-10-02) */}
  <span className="qmini" aria-hidden="true">
    <b>Soru {cur + 1}/4</b>
    <span className="segs">{[0, 1, 2, 3].map((i) => <i key={i} className={`${segOf(i).on ? 'on' : ''}${segOf(i).dim ? ' dim' : ''}`} />)}</span>
  </span>
  <svg className="qr" viewBox="0 0 120 120" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={i <= cur ? 'var(--accent)' : 'var(--oa-track)'} strokeOpacity={i === cur && i >= done ? 0.42 : 1} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${seg.toFixed(1)} ${(c - seg).toFixed(1)}`} strokeDashoffset={(-(i * c / 4) - gap / 2).toFixed(1)} transform="rotate(-90 60 60)" />
    ))}
    {/* "Soru" yazısı: "2/4" puan sanılmasın (kapı 2026-10-02); iki parça aynı taban çizgisinde */}
    <text className="lbl" x="60" y="47" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="13" fill="var(--ink-3)">Soru</text>
    <text x="60" y="78" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="650" fill="var(--ink)">
      <tspan fontSize="30">{cur + 1}</tspan><tspan fontSize="20" fill="var(--ink-3)" dx="1">/4</tspan>
    </text>
  </svg>
  </>
)
}

// q: { soru, options: [{ text, correct }] }; answers: [{ id, chosen, correct }]; close: üst çubuğun kapatma düğmesi
export default function OkuSoru({ q, qi, total = 4, answers, onChoose, onNext, close }) {
const a = answers[qi]
const last = qi === total - 1
  return (
    <main className="oa">
      <div className="oa-bar">{close}<span className="mid" /><span className="oa-gap" /></div>
      <div className="oa-qwrap">
        <div className="oa-qtop">
          <div className="oa-qhead"><QRing done={answers.filter(Boolean).length} cur={qi} /></div>
          <h2 className="q"><span className="oa-sr">{qi + 1}. soru. </span>{q.soru}</h2>
        </div>
        <ul className="oa-opts">
          {q.options.map((o) => {
            const right = a && o.correct
            const miss = a && !o.correct && a.chosen === o.text
            return (
              <li key={o.text}>
                <button type="button" className={`oa-opt${right ? ' right' : ''}${miss ? ' miss' : ''}`} onClick={() => onChoose(o)} disabled={Boolean(a)} aria-pressed={a ? a.chosen === o.text : undefined}>
                  <span className="r">{right ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}</span>
                  <span className="ot">{o.text}{right ? <small className="okline" role="status">{a.correct ? 'Doğru.' : 'Doğrusu bu.'}</small> : null}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="oa-spacer" style={{ height: 112 }} />
      {a ? <div className="oa-dock"><button type="button" className="btn" onClick={onNext}>{last ? 'Sonucu gör' : 'Sonraki soru'}</button></div> : null}
    </main>
  )
}
