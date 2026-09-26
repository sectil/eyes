import { useEffect, useRef, useState } from 'react'
import { X, Sun } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { FactCard, SourceList } from '../components/Sources.jsx'
import { haptic } from '../lib/native.js'
import { speak, unlockAudio } from '../lib/cue.js'
import { playBreathSound, unlockBreathSfx } from '../lib/breathSfx.js'
import {
  DURATION_SEC, MIN_SAVE_SEC, SKY, ANSWER_TEXT, SOURCE_IDS,
  partOfDay, promptsFor, promptIndex, makeRecord, history, factFor,
} from '../lib/gokyuzu.js'
import '../styles/sources.css'
import '../styles/gokyuzu.css'

// Gökyüzü molası (Artifact "Gökyüzü Molası", onaylı): önce puan → 2 dk mola (sesli sorular) → sonra puan → kart.
// Ekran yanıp sönmez; bulutlar çok yavaş süzülür, gece yıldızlar sabittir. Kamera kullanılmaz.
const R = 46
const CIRC = 2 * Math.PI * R
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const fmt1 = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`

function Scale({ value, onChange, label }) {
  return (
    <>
      <div className="gk-r10" role="radiogroup" aria-label={label}>
        {Array.from({ length: 11 }, (_, v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => { onChange(v); haptic('tick') }}>{v}</button>
        ))}
      </div>
      <div className="gk-ends"><span>hiç</span><span>çok</span></div>
    </>
  )
}

function SkyBg({ part }) {
  const c = SKY[part]
  return (
    <div className="gk-sky" style={{ '--t': c.top, '--m': c.mid, '--l': c.low }} aria-hidden="true">
      {part === 'night' ? (
        <svg className="gk-stars" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 60 }, (_, i) => {
            const x = (i * 37.3) % 100, y = (i * 61.7) % 62
            return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 0.45 : 0.25} fill="#fff" opacity={0.35 + (i % 5) * 0.12} />
          })}
        </svg>
      ) : (
        <>
          <svg className="gk-cloud" style={{ top: '14%', width: 180, animationDuration: '140s' }} viewBox="0 0 180 60"><ellipse cx="60" cy="38" rx="50" ry="18" fill="#fff" /><ellipse cx="95" cy="28" rx="40" ry="22" fill="#fff" /><ellipse cx="130" cy="40" rx="38" ry="16" fill="#fff" /></svg>
          <svg className="gk-cloud" style={{ top: '32%', width: 130, animationDuration: '190s', animationDelay: '-70s', opacity: 0.55 }} viewBox="0 0 180 60"><ellipse cx="60" cy="38" rx="50" ry="18" fill="#fff" /><ellipse cx="100" cy="30" rx="36" ry="20" fill="#fff" /></svg>
          <svg className="gk-cloud" style={{ top: '50%', width: 220, animationDuration: '230s', animationDelay: '-150s', opacity: 0.4 }} viewBox="0 0 180 60"><ellipse cx="70" cy="36" rx="60" ry="16" fill="#fff" /><ellipse cx="120" cy="32" rx="44" ry="18" fill="#fff" /></svg>
        </>
      )}
      <svg className="gk-hz" viewBox="0 0 340 90" preserveAspectRatio="none"><path d="M0 60 Q40 44 80 54 T160 50 T240 56 T340 46 V90 H0Z" fill={c.hz} opacity="0.85" /><path d="M0 72 Q60 62 120 70 T240 66 T340 70 V90 H0Z" fill={c.hz} /></svg>
    </div>
  )
}

// onSave(kayıt), onExit()
export default function Gokyuzu({ sessions = [], onSave, onExit }) {
  const [part] = useState(() => partOfDay(new Date().getHours()))
  const [phase, setPhase] = useState('intro') // intro | run | after | result
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [record, setRecord] = useState(null)
  const [fact] = useState(() => factFor(sessions))
  const t0 = useRef(0)
  const lastPrompt = useRef(-1)
  const wake = useRef(null)
  const prompts = promptsFor(part)
  const pi = promptIndex(elapsed, DURATION_SEC, prompts.length)

  async function keepAwake(on) {
    try {
      if (on) wake.current = await globalThis.navigator?.wakeLock?.request?.('screen')
      else { await wake.current?.release?.(); wake.current = null }
    } catch {
      wake.current = null
    }
  }
  useEffect(() => () => { wake.current?.release?.().catch?.(() => {}) }, [])

  // Mola sayacı; her yeni soru sesli okunur (Ses açıksa)
  useEffect(() => {
    if (phase !== 'run') return undefined
    const id = setInterval(() => {
      const e = (Date.now() - t0.current) / 1000
      setElapsed(e)
      const i = promptIndex(e, DURATION_SEC, prompts.length)
      if (i !== lastPrompt.current) {
        lastPrompt.current = i
        speak(prompts[i], { rate: 0.9 })
      }
      if (e >= DURATION_SEC) {
        clearInterval(id)
        playBreathSound('chime')
        haptic('success')
        keepAwake(false)
        setPhase('after')
      }
    }, 250)
    return () => clearInterval(id)
  }, [phase, prompts])

  function start() {
    unlockAudio()
    unlockBreathSfx()
    t0.current = Date.now()
    lastPrompt.current = -1
    setElapsed(0)
    setAfter(null)
    keepAwake(true)
    setPhase('run')
  }
  function stop() {
    keepAwake(false)
    try { globalThis.speechSynthesis?.cancel() } catch { /* yok */ }
    const e = (Date.now() - t0.current) / 1000
    if (e < MIN_SAVE_SEC) { setPhase('intro'); return }
    setElapsed(e)
    setPhase('after')
  }
  function save() {
    const rec = makeRecord({ before, after, seconds: Math.min(elapsed, DURATION_SEC), part })
    setRecord(rec)
    onSave?.(rec)
    haptic('success')
    setPhase('result')
  }

  if (phase === 'run') {
    const left = Math.max(0, DURATION_SEC - elapsed)
    return (
      <main className="gk-run" aria-label="Gökyüzü molası">
        <SkyBg part={part} />
        <div className="gk-run-in">
          <div className="gk-ring">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
              <circle cx="50" cy="50" r={R} fill="none" stroke="#8fd3ff" strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * Math.min(1, elapsed / DURATION_SEC)} />
            </svg>
            <span className="t">{fmt(Math.ceil(left))}</span>
          </div>
          <p className="gk-prompt" key={pi} aria-live="polite">{prompts[pi]}</p>
          <div className="grow" />
          <p className="gk-note">Telefonu indirebilirsin; bitince ses ve titreşimle haber veririm.</p>
          <button className="gk-stop" onClick={stop}>Bitir</button>
        </div>
      </main>
    )
  }

  if (phase === 'after') {
    return (
      <main className="screen fade-in gk">
        <div className="gk-top"><ProgressBar value={0.85} /></div>
        <span className="gk-ey">Sonra</span>
        <h1 className="gk-h">Şimdi ne kadar dinlenmiş hissediyorsun?</h1>
        <Scale value={after} onChange={setAfter} label="Dinlenmişlik, sonra" />
        <div className="grow" />
        <button className="btn" disabled={after == null} onClick={save}>Sonucu gör</button>
      </main>
    )
  }

  if (phase === 'result' && record) {
    const d = record.delta
    const saved = sessions.some((s) => s.type === record.type && s.date === record.date)
    const h = history(saved ? sessions : [...sessions, record])
    return (
      <main className="screen fade-in gk">
        <div className="gk-top"><ProgressBar value={1} /></div>
        <span className="gk-ey">Gökyüzü molası · bitti</span>
        <div className="gk-delta"><b>{record.before}</b><span>→</span><b>{record.after}</b><em className={d >= 0 ? 'ok' : 'down'}>{d > 0 ? '+' : d < 0 ? '−' : ''}{Math.abs(d)}</em></div>
        <p className="muted small">dinlenmişlik, kendi puanın (0–10)</p>
        {h.mean != null && <p className="gk-hist">Son {h.n} molanda ortalama değişimin <b>{fmt1(h.mean)}</b>. Bu senin verin; başkalarıyla kıyas yok.</p>}
        <FactCard f={fact} answerText={ANSWER_TEXT} />
        <SourceList ids={SOURCE_IDS} />
        <div className="grow" />
        <button className="btn" onClick={onExit}>Bitti</button>
      </main>
    )
  }

  // intro
  return (
    <main className="screen fade-in gk">
      <div className="gk-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={0} /></div>
      <span className="gk-ey">Gökyüzü molası · 2 dk · {SKY[part].label}</span>
      <h1 className="gk-h">Başını kaldır, uzağa bak.</h1>
      <p className="muted">Pencereye git ya da dışarı çık. Telefonu indirebilirsin; soruları sesli okuyacağım, bitince haber vereceğim.</p>
      <div className="gk-sun"><Sun size={20} aria-hidden="true" /><p><b>Güneşe asla doğrudan bakma.</b> Güneşin olmadığı yönde ufka ve bulutlara bak.</p></div>
      <span className="gk-lbl">Şu an ne kadar dinlenmiş hissediyorsun?</span>
      <Scale value={before} onChange={setBefore} label="Dinlenmişlik, önce" />
      <details className="gk-why">
        <summary>Bu işe yarıyor mu?</summary>
        <p>Doğrudan "gökyüzüne bakmak" üzerine bir çalışma bulamadık. Mola şu yakın kanıtlara dayanıyor: 3 dk doğa görmek rahatlattı (randomize, 30 kişi); hayranlık yürüyüşü günlük sıkıntıyı azalttı ama depresyonu değiştirmedi (randomize, 60 kişi); uzağa bakma molası ekran yorgunluğunu azalttı (29 kişi, kontrol grubu yok). Kendi puanın, sana işe yarayıp yaramadığını gösterecek.</p>
        <SourceList ids={SOURCE_IDS} />
      </details>
      <div className="grow" />
      <button className="btn" disabled={before == null} onClick={start}>Molaya başla</button>
    </main>
  )
}
