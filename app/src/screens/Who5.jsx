import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { who5Text } from '../lib/who5.js'
import { makeWho5Record, who5Card, WHO5_ITEMS } from '../lib/progress.js'
import { Sparkline, metricStatus } from '../components/ProgressOverview.jsx'
import '../styles/who5.css'

// İyi oluş (WHO-5; Artifact "Nefona Gelişim Haritası" ekran 4–5, onaylı): tek tek 5 soru, 6 seçenek; seçince kısa bir
// işaretten sonra sonraki soruya geçer (geri dönülebilir; çift dokunuş iki soruyu cevaplamaz). Son soru "Kaydet" ile
// biter (yanlış dokunuş kaydedilmesin; kayıttan sonra 14 gün yeniden sorulmaz). Sonuç: puan (0–100), ilk ölçüme göre
// değişim, 14 günlük seri.
export const PICK_MS = 180

export default function Who5({ sessions = [], onSave, onClose, onProgress }) {
  const T = who5Text()
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [chosen, setChosen] = useState(null)
  const lock = useRef(null) // seçimden sonra kısa bekleme: çift dokunuş bir sonraki soruyu da cevaplamasın
  const qRef = useRef(null)
  const saved = useRef(false)
  const i = answers.length
  const last = i === WHO5_ITEMS - 1
  useEffect(() => () => clearTimeout(lock.current), [])
  // yeni soru: ekran okuyucu soruyu okusun (seçenek düğmeleri aynı kaldığı için odak orada kalıyordu)
  useEffect(() => { if (i > 0) qRef.current?.focus() }, [i])

  function pick(v) {
    if (lock.current) return
    setChosen(v)
    if (last) return // son soru: "Kaydet" ile biter; yanlış dokunuş düzeltilebilir
    lock.current = setTimeout(() => {
      lock.current = null
      setChosen(null)
      commit(v)
    }, PICK_MS)
  }

  function commit(v) {
    setChosen(null)
    const next = [...answers, v]
    if (next.length < WHO5_ITEMS) {
      setAnswers(next)
      return
    }
    const rec = makeWho5Record(next)
    if (!rec || saved.current) return
    saved.current = true
    onSave?.(rec)
    setResult(who5Card([...sessions, rec]))
  }

  if (result) {
    const st = metricStatus(result)
    return (
      <main className="screen fade-in w5">
        <div className="row"><button type="button" className="btn-icon" onClick={onClose} aria-label="Kapat"><X size={20} /></button></div>
        <header className="page-header"><span className="eyebrow">{T.title} · {result.n}. ölçüm</span><h1>Bugün</h1></header>
        <section className="card w5-score">
          <div className="w5-big"><b>{result.last}</b><span>/ 100</span></div>
          {st.text && <span className={`p2-pill ${st.tone}`}>{st.text}{result.delta != null ? ` · ${result.delta > 0 ? '+' : ''}${result.delta}` : ''}</span>}
          <p className="muted small">{result.n > 1 ? `İlk ölçümün: ${result.first}. ` : 'Bu ilk ölçümün; 14 gün sonra yeniden sorarız. '}{T.meaningful}</p>
        </section>
        {result.n > 1 && (
          <section className="card w5-score">
            <span className="eyebrow">14 günde bir</span>
            <Sparkline points={result.series.map((p) => ({ date: p.date, value: p.score }))} format={(v) => String(Math.round(v))} ariaLabel="İyi oluş puanları" />
          </section>
        )}
        {result.low && <section className="card w5-score"><p className="small">{T.low}</p></section>}
        <button type="button" className="btn" onClick={onProgress}>Gelişim'e dön</button>
      </main>
    )
  }

  return (
    <main className="screen fade-in w5">
      <div className="row between">
        {i > 0 ? (
          <button type="button" className="link-btn" onClick={() => { if (lock.current) return; setChosen(null); setAnswers(answers.slice(0, -1)) }}><ChevronLeft size={16} aria-hidden="true" /> Önceki</button>
        ) : <span />}
        <button type="button" className="btn-icon" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
      </div>
      <div className="w5-prog" role="progressbar" aria-valuemin={1} aria-valuemax={WHO5_ITEMS} aria-valuenow={i + 1} aria-label={`Soru ${i + 1} / ${WHO5_ITEMS}`}>
        {Array.from({ length: WHO5_ITEMS }, (_, k) => <i key={k} className={k <= i ? 'on' : ''} />)}
      </div>
      <span className="eyebrow">{T.period} · {i + 1} / {WHO5_ITEMS}</span>
      {i === 0 && <p className="muted">{T.intro}</p>}
      <h1 className="w5-q" ref={qRef} tabIndex={-1}>{T.items[i]}</h1>
      <div className="w5-opts">
        {T.options.map((o) => (
          <button key={o.value} type="button" className={`w5-opt${chosen === o.value ? ' on' : ''}`} aria-pressed={chosen === o.value} onClick={() => pick(o.value)}>
            <span>{o.text}</span><span className="k">{o.value}</span>
          </button>
        ))}
      </div>
      {last && <button type="button" className="btn" disabled={chosen == null} onClick={() => commit(chosen)}>Kaydet</button>}
      <p className="muted small">{T.source}</p>
    </main>
  )
}
