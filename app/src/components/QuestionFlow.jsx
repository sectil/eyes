import { useEffect, useRef, useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { IrisMark } from './ui.jsx'
import { QUESTIONS, answer } from '../lib/profileQuestions.js'
import { normalizeProfile } from '../lib/profile.js'
import '../styles/profile.css'

// Tek soruluk ekranlar (Artifact "Önce Fark Ettir"): her ekranda tek soru ve tek ilerleme çubuğu. Cevaptan sonra
// Nef neden sorduğunu tek cümleyle söyler; cümle 2 sn görünür, sonra kendiliğinden geçer ("Devam" hemen geçirir).
// VARSAYIM (onaylı taslak): 2 sn. Hareket azaltma tercihinde kendiliğinden geçmez, "Devam" beklenir.
// ids: soru kimlikleri (lib/profileQuestions.js); onSave(profil): her cevapta; onDone(profil): son sorudan sonra;
// onClose(profil): X (o ana kadarki cevaplar kaydedilmiş olur). bar: [başlangıç, bitiş] genel ilerleme payı.
export const WHY_MS = 2000

const reducedMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

export function ProgressBar({ value = 0, label }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="oq-bar" role="progressbar" aria-label={label ?? 'İlerleme'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <i style={{ width: `${v * 100}%` }} />
    </div>
  )
}

export function WhyLine({ text }) {
  return (
    <div className="oq-why" aria-live="polite">
      <IrisMark size={28} />
      <div>
        <b>Neden sordum</b>
        <span>{text}</span>
      </div>
    </div>
  )
}

function Slider({ q, value, onChange }) {
  const unset = value == null
  return (
    <div className="oq-slider" style={{ '--pct': unset ? '0%' : `${((value - q.min) / (q.max - q.min)) * 100}%` }}>
      <input
        type="range"
        className={unset ? 'unset' : ''}
        min={q.min}
        max={q.max}
        step={1}
        value={value ?? Math.round((q.min + q.max) / 2)}
        aria-label={q.text}
        aria-valuetext={unset ? 'seçilmedi' : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={(e) => unset && onChange(Number(e.currentTarget.value))}
      />
      <div className="oq-ends"><span>{q.min} · {q.ends[0]}</span><span>{q.max} · {q.ends[1]}</span></div>
      {unset ? <p className="oq-hint">Kaydırarak seç</p> : <div className="oq-val">{value}</div>}
    </div>
  )
}

export default function QuestionFlow({ ids = [], profile, onSave, onDone, onClose, bar = [0, 1], closeLabel = 'Kapat' }) {
  const [i, setI] = useState(0)
  const [p, setP] = useState(() => normalizeProfile(profile))
  const [picked, setPicked] = useState(null) // bu ekranda verilen cevap (why gösterilir)
  const draftOf = (k, prof) => (QUESTIONS[ids[k]]?.kind === 'slider' ? QUESTIONS[ids[k]].get(prof) : null)
  const [draft, setDraft] = useState(() => draftOf(0, normalizeProfile(profile))) // kaydırıcı: onaydan önceki değer
  const timer = useRef(null)
  const id = ids[i]
  const q = QUESTIONS[id]

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!q) return null
  // Geçişte ekran durumu aynı anda sıfırlanır (eski cevabın cümlesi yeni soruda bir kare bile görünmesin)
  const next = (np) => {
    clearTimeout(timer.current)
    if (i + 1 < ids.length) {
      setPicked(null)
      setDraft(draftOf(i + 1, np))
      setI(i + 1)
    } else onDone?.(np)
  }
  const choose = (v) => {
    clearTimeout(timer.current)
    const np = answer(p, id, v)
    setP(np)
    setPicked(v)
    onSave?.(np)
    if (!reducedMotion()) timer.current = setTimeout(() => next(np), WHY_MS)
  }
  const frac = bar[0] + ((bar[1] - bar[0]) * (i + (picked != null ? 1 : 0))) / ids.length
  const current = picked ?? q.get(p)

  return (
    <main className="screen fade-in oq">
      <div className="oq-top">
        {onClose && (
          <button type="button" className="btn-icon oq-x" onClick={() => { clearTimeout(timer.current); onClose(p) }} aria-label={closeLabel}>
            <X size={18} aria-hidden="true" />
          </button>
        )}
        <ProgressBar value={frac} />
      </div>
      {q.eyebrow && <span className="oq-ey">{q.eyebrow}</span>}
      <h1 className="oq-q">{q.text}</h1>
      {q.kind === 'slider' ? (
        <>
          <Slider q={q} value={draft} onChange={(v) => { setDraft(v); if (picked != null) setPicked(null) }} />
          {picked == null && (
            <button type="button" className="btn" disabled={draft == null} onClick={() => choose(draft)}>Tamam</button>
          )}
        </>
      ) : (
        <div className={`oq-opts${q.row ? ' row' : ''}`} role="radiogroup" aria-label={q.text}>
          {q.options.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={current === o.id} className={`oq-opt${current === o.id ? ' on' : ''}`} onClick={() => choose(o.id)}>
              {o.text}
            </button>
          ))}
        </div>
      )}
      {picked != null && <WhyLine text={q.why(picked, p)} />}
      {q.source && <p className="oq-src">{q.source}</p>}
      <div className="grow" />
      {picked != null && (
        <button type="button" className="btn" onClick={() => next(p)}>
          Devam <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </main>
  )
}
