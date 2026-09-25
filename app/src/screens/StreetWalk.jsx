import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ArrowRight, Footprints } from 'lucide-react'
import { IrisMark } from '../components/ui.jsx'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import {
  genStreet, nextLevel, countOptions, optionLabel, makeRecord, factFor, ANSWER_TEXT, COLORS, LEVELS, VH,
} from '../lib/street.js'
import { streetSVG, car, cat, bike } from '../lib/streetSvg.js'
import { haptic } from '../lib/native.js'
import '../styles/street.css'

// Fark Ettin mi? (Artifact "Fark Ettin mi?"): görev → cadde akar → görev sorusu → 3 fark etme sorusu → sonuç ve bilim
// kartı. Mantık lib/street.js, çizim lib/streetSvg.js. Sahne ölçeği 1,3: aynı anda ~3–4 kişi görünür (VARSAYIM).
const SCALE = 1.3

function TaskIcon({ id }) {
  const svg = id === 'cat' ? cat({ x: 0, color: 'turuncu' }) : id === 'bike' ? bike({ x: 0, color: 'mavi' }) : car({ x: 30, color: id === 'taxi' ? 'sari' : 'mavi', taxi: id === 'taxi' })
  const vb = id === 'cat' || id === 'bike' ? '-30 190 60 50' : '-16 245 92 55'
  return <svg className="sw-task-ico" viewBox={vb} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
}

// onSave(kayıt): tur sonunda; onExit(): çıkış
export default function StreetWalk({ sessions = [], onSave, onExit }) {
  const [level] = useState(() => nextLevel(sessions))
  const [seed, setSeed] = useState(() => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)
  const street = useMemo(() => genStreet(seed, level), [seed, level])
  const [fact] = useState(() => factFor(sessions))
  const [phase, setPhase] = useState('intro') // intro | walk | count | ask | result
  const [left, setLeft] = useState(LEVELS[level].walkSec)
  const [countAnswer, setCountAnswer] = useState(null)
  const [qi, setQi] = useState(0)
  const [guess, setGuess] = useState(false)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const [record, setRecord] = useState(null)
  const walkRef = useRef(null)
  const sceneRef = useRef(null)
  const t0 = useRef(0)
  const n = street.counts[street.task.id]
  const opts = useMemo(() => countOptions(n), [n])

  // Yürüyüş: cadde soldan sağa akar (requestAnimationFrame); süre bitince görev sorusu
  useEffect(() => {
    if (phase !== 'walk') return undefined
    const box = walkRef.current
    const svg = sceneRef.current?.querySelector('svg')
    if (!box || !svg) return undefined
    const sh = VH * SCALE
    svg.style.height = `${sh}px`
    svg.style.top = `${(box.clientHeight - sh) / 2 + 20}px`
    const w = street.L * SCALE
    const vw = box.clientWidth
    const dur = LEVELS[level].walkSec * 1000
    const start = performance.now()
    t0.current = Date.now()
    let raf = 0
    const step = (t) => {
      const u = Math.min(1, (t - start) / dur)
      svg.style.transform = `translateX(${(-(w - vw) * u).toFixed(1)}px)`
      setLeft(Math.ceil((1 - u) * LEVELS[level].walkSec))
      if (u < 1) raf = requestAnimationFrame(step)
      else setPhase('count')
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, street, level])

  const q = street.questions[qi]
  function chooseCount(v) {
    if (countAnswer != null) return
    setCountAnswer(v)
    haptic(v === n ? 'success' : 'tick')
  }
  function chooseAnswer(v) {
    if (picked != null) return
    const ok = v === q.a
    setPicked(v)
    setAnswers((a) => [...a, { id: q.id, ok, guess }])
    haptic(ok ? 'success' : 'tick')
  }
  function nextQuestion() {
    if (qi + 1 < street.questions.length) {
      setQi(qi + 1)
      setPicked(null)
      setGuess(false)
      return
    }
    const rec = makeRecord({ street, countAnswer, answers, seconds: (Date.now() - t0.current) / 1000 })
    setRecord(rec)
    onSave?.(rec)
    setPhase('result')
  }
  function again() {
    setSeed((s) => (s * 7919 + 1) >>> 0)
    setCountAnswer(null)
    setQi(0)
    setPicked(null)
    setGuess(false)
    setAnswers([])
    setRecord(null)
    setPhase('intro')
  }

  if (phase === 'walk') {
    return (
      <main className="sw-walk" ref={walkRef} aria-label="Cadde">
        <div className="sw-hud">
          <span className="sw-chip">{street.task.text}</span>
          <span className="sw-chip sw-t" aria-live="off">{left}</span>
        </div>
        <div ref={sceneRef} className="sw-scene" dangerouslySetInnerHTML={{ __html: streetSVG(street) }} />
      </main>
    )
  }

  if (phase === 'count') {
    const d = countAnswer == null ? null : Math.abs(countAnswer - n)
    return (
      <main className="screen fade-in sw">
        <div className="sw-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={0.4} /></div>
        <span className="sw-ey">Görev</span>
        <h1 className="sw-h">{street.task.q}</h1>
        <div className="sw-opts grid">
          {opts.map((v) => (
            <button key={v} type="button" className={`sw-opt center${countAnswer != null && v === n ? ' ok' : countAnswer === v ? ' no' : ''}`} onClick={() => chooseCount(v)}>{v}</button>
          ))}
        </div>
        <p className="sw-fb" aria-live="polite">
          {d == null ? '' : d === 0 ? <><b className="ok">Tam doğru.</b> {n} tane geçti.</> : d === 1 ? <><b className="near">Çok yakın.</b> {n} tane geçti.</> : <><b className="no">{n} tane geçti.</b></>}
        </p>
        <div className="grow" />
        {countAnswer != null && <button className="btn" onClick={() => setPhase('ask')}>Devam <ArrowRight size={18} aria-hidden="true" /></button>}
      </main>
    )
  }

  if (phase === 'ask' && q) {
    const ok = picked != null && picked === q.a
    return (
      <main className="screen fade-in sw">
        <div className="sw-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={0.55 + qi * 0.15} /></div>
        <span className="sw-ey">Fark ettin mi? · {qi + 1} / {street.questions.length}</span>
        <h1 className="sw-h">{q.q}</h1>
        <div className="sw-opts grid" role="radiogroup" aria-label={q.q}>
          {q.opts.map((v) => {
            const state = picked == null ? '' : v === q.a ? ' ok' : v === picked ? ' no' : ''
            return (
              <button key={v} type="button" role="radio" aria-checked={picked === v} className={`sw-opt${state}`} onClick={() => chooseAnswer(v)}>
                {q.kind === 'color' && <span className="sw-swatch" style={{ background: COLORS[v].hex }} aria-hidden="true" />}
                {optionLabel(q, v)}
              </button>
            )
          })}
          <button type="button" className={`sw-opt guess${guess ? ' on' : ''}`} onClick={() => picked == null && setGuess((g) => !g)} aria-pressed={guess}>
            {guess ? 'Tahmin: şimdi bir seçenek seç' : 'Fark etmedim, tahmin edeceğim'}
          </button>
        </div>
        <p className="sw-fb" aria-live="polite">
          {picked == null
            ? ''
            : ok && guess
              ? <><b className="near">Fark etmesen de doğru bildin.</b> Beynin görmüş olabilir (Kreitz 2020).</>
              : ok
                ? <b className="ok">Fark etmişsin.</b>
                : guess
                  ? 'Tahmin tutmadı; bu çok olağan.'
                  : <><b className="no">Kaçtı.</b> Görevine odaklanınca gözünün önündeki kaçabilir.</>}
        </p>
        <div className="grow" />
        {picked != null && <button className="btn" onClick={nextQuestion}>Devam <ArrowRight size={18} aria-hidden="true" /></button>}
      </main>
    )
  }

  if (phase === 'result' && record) {
    return (
      <main className="screen fade-in sw">
        <div className="sw-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={1} /></div>
        <span className="sw-ey">Tur bitti · seviye {record.level}</span>
        <div className="sw-stat">
          <div><b>{record.task === 1 ? '1' : record.task === 0.5 ? '½' : '0'}</b><span>görev</span></div>
          <div><b>{record.noticed}/{record.asked}</b><span>fark ettiklerin</span></div>
        </div>
        <div className="sw-list">
          {street.questions.map((qq, k) => {
            const a = answers[k]
            const tag = a?.ok ? (a.guess ? 'tahmin' : 'fark') : 'kaçtı'
            return (
              <div key={qq.id}>
                <i className={a?.ok ? (a.guess ? 'gs' : 'ok') : 'no'}>{tag}</i>
                <span>{qq.q.split('. ')[0]}: <b>{optionLabel(qq, qq.a)}</b></span>
              </div>
            )
          })}
          {record.guessedRight > 0 && <div><i className="gs">+{record.guessedRight}</i><span>doğru tahmin; puana katılmaz</span></div>}
        </div>
        <section className="sw-card">
          <span className="sw-ey">Doğru mu, efsane mi?</span>
          <p className="h">{fact.claim}</p>
          <p><b className={fact.answer === 'myth' ? 'no' : 'ok'}>{ANSWER_TEXT[fact.answer]}.</b> {fact.body}</p>
          <span className="sw-cite">{fact.ref} · doi {fact.doi}</span>
        </section>
        <p className="sw-src">Kendi gidişatın için; başkalarıyla kıyas yok. Gerçek hayatta daha çok fark ettirdiği gösterilmedi.</p>
        <div className="grow" />
        <button className="btn" onClick={onExit}>Bitti</button>
        <button className="btn btn-ghost" onClick={again}>Yeni caddede tekrar</button>
      </main>
    )
  }

  return (
    <main className="screen fade-in sw">
      <div className="sw-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={0} /></div>
      <span className="sw-ey">Fark Ettin mi? · ~1 dk · seviye {level}</span>
      <h1 className="sw-h">Caddede yürüyeceksin</h1>
      <div className="sw-task">
        <TaskIcon id={street.task.id} />
        <div><span className="muted small">Görevin</span><b>{street.task.text}</b></div>
      </div>
      <div className="sw-jev">
        <IrisMark size={34} />
        <p>Görevine odaklan. Cadde yaklaşık {LEVELS[level].walkSec} saniye sürer; sonra sana birkaç soru soracağım.</p>
      </div>
      <div className="grow" />
      <p className="sw-src">Bu bir fark etme alıştırması. Gerçek hayatta daha çok fark ettirdiği gösterilmedi.</p>
      <button className="btn" onClick={() => setPhase('walk')}><Footprints size={18} aria-hidden="true" /> Yürümeye başla</button>
    </main>
  )
}
