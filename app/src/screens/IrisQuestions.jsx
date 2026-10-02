import { useEffect, useRef, useState } from 'react'
import { Repeat2 } from 'lucide-react'
import IrisMap from '../components/IrisMap.jsx'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { QUESTIONS, answer } from '../lib/profileQuestions.js'
import { normalizeProfile } from '../lib/profile.js'
import { IRIS_ORDER, snapshot, irisCells, filledIndexes } from '../lib/iris.js'
import { setupText } from '../lib/setupText.js'
import '../styles/setup.css'

// İris soruları (Artifact "Nefona Başlangıç Kartı", onaylı): kurulumda İlk Bakış'tan sonra ve 28. günde. Her soru bir
// alanı doldurur; üstteki iris her cevapta dolar, sıradaki dilim altın. Soru üstte, cevaplar başparmağın ulaştığı altta.
// Soru tipi değişir (seviye, kaydırıcı, gün, cümle) ki akış sıkmasın. Seçimden kısa süre sonra kendiliğinden geçer;
// kaydırıcı "Tamam" ister. ids: lib/profileQuestions.js IRIS_QUESTIONS; recheck: 28. gün (yazı değişir).
// onSave(profil): her cevapta; onDone(profil): son sorudan sonra.
const NEXT_MS = 380 // VARSAYIM: seçimin görülmesine yetecek kadar

const reduced = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

function Levels({ q, value, onPick }) {
  const n = q.options.length - 1
  return (
    <div className="iq-list" role="radiogroup" aria-label={q.text}>
      {q.options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`iq-opt${value === o.id ? ' on' : ''}`} onClick={() => onPick(o.id)}>
          <i className="rd" aria-hidden="true" />
          <span className="t">{o.text}</span>
          <span className="lvl" aria-hidden="true">{Array.from({ length: n }, (_, k) => <b key={k} className={k < o.id ? 'f' : ''} />)}</span>
        </button>
      ))}
    </div>
  )
}

function Agree({ q, value, onPick }) {
  return (
    <>
      <p className="iq-quote"><i className="k ts" /><i className="k te" /><i className="k bs" /><i className="k be" />“{q.quote}”</p>
      <div className="iq-list" role="radiogroup" aria-label={q.quote}>
        {q.options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`iq-opt${value === o.id ? ' on' : ''}`} onClick={() => onPick(o.id)}>
            <i className="rd" aria-hidden="true" />
            <span className="t">{o.text}</span>
          </button>
        ))}
      </div>
    </>
  )
}

function Days({ q, value, onPick }) {
  return (
    <div className="iq-days-wrap">
      <div className="iq-days" role="radiogroup" aria-label={q.text}>
        {q.options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onPick(o.id)}>{o.text}</button>
        ))}
      </div>
      <div className="iq-ends"><span>{q.ends[0]}</span><span>{q.ends[1]}</span></div>
    </div>
  )
}

function Slider({ q, value, onChange, onDone, T }) {
  const unset = value == null
  const v = value ?? Math.round((q.min + q.max) / 2)
  const pct = ((v - q.min) / (q.max - q.min)) * 100
  return (
    <div className="iq-slider" style={{ '--pct': `${pct}%` }}>
      <span className={`val${unset ? ' unset' : ''}`} aria-hidden="true">{unset ? '–' : v}</span>
      <input
        type="range"
        min={q.min}
        max={q.max}
        step={1}
        value={v}
        className={unset ? 'unset' : ''}
        aria-label={q.text}
        aria-valuetext={unset ? T.slide : String(v)}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={(e) => unset && onChange(Number(e.currentTarget.value))}
      />
      <div className="iq-ends"><span>{q.min} · {T.ends[0]}</span><span>{q.max} · {T.ends[1]}</span></div>
      <button type="button" className="btn" disabled={unset} onClick={onDone}>{T.done}</button>
    </div>
  )
}

export default function IrisQuestions({ ids, profile, bar = [0, 1], recheck = false, sessions = [], domainOf, onSave, onDone }) {
  const T = setupText().q
  const [i, setI] = useState(0)
  const [p, setP] = useState(() => normalizeProfile(profile))
  const [picked, setPicked] = useState(null)
  const [draft, setDraft] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const id = ids[i]
  const q = QUESTIONS[id]
  if (!q) return null
  // Kurulumda: şimdiye kadarki cevaplar; 28. günde: bu turda cevaplananlar (başlangıçtaki değil)
  const snap = snapshot(p)
  const seen = recheck ? new Set(ids.slice(0, i)) : null
  const cells = irisCells(snap, { sessions, domainOf }).map((c) => {
    if (!recheck || c.domain === 'eye') return c
    const qid = ids.find((x) => QUESTIONS[x].domain === c.domain)
    return qid ? { ...c, filled: seen.has(qid) } : c
  })
  const filled = filledIndexes(cells)
  const cur = IRIS_ORDER.indexOf(q.domain)
  const D = setupText().domains

  const next = (np) => {
    clearTimeout(timer.current)
    if (i + 1 < ids.length) {
      setPicked(null)
      setDraft(null)
      setI(i + 1)
    } else onDone?.(np)
  }
  const choose = (v) => {
    clearTimeout(timer.current)
    const np = answer(p, id, v)
    setP(np)
    setPicked(v)
    onSave?.(np)
    timer.current = setTimeout(() => next(np), reduced() ? 0 : NEXT_MS)
  }
  const value = picked ?? (recheck ? null : q.get(p))
  const frac = bar[0] + ((bar[1] - bar[0]) * i) / ids.length

  return (
    <main className="screen fade-in oq iq" key={id}>
      <div className="oq-top"><ProgressBar value={frac} /></div>
      <div className="iq-head">
        <IrisMap size={118} filled={filled} cur={cur} />
        <div className="t">
          <small>{T.map(filled.length)}</small>
          <b>{D[q.domain]}</b>
        </div>
      </div>
      <span className="iq-n">{T.count(i + 1, ids.length)}</span>
      <h1 className="iq-q">{q.text}</h1>
      {q.hint && <p className="oq-sub iq-hint">{q.hint}</p>}
      <div className="grow" />
      {q.ui === 'levels' && <Levels q={q} value={value} onPick={choose} />}
      {q.ui === 'agree' && <Agree q={q} value={value} onPick={choose} />}
      {q.ui === 'days' && <Days q={q} value={value} onPick={choose} />}
      {q.ui === 'slider' && <Slider q={q} value={draft ?? value} onChange={setDraft} onDone={() => choose(draft ?? value)} T={T} />}
      <p className="iq-again"><Repeat2 size={16} aria-hidden="true" />{recheck ? T.againRecheck : T.again}</p>
      {q.source && <p className="oq-src">{q.source}</p>}
    </main>
  )
}
