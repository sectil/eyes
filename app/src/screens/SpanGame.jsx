import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Play, EyeOff, ArrowRight, Check, Ban } from 'lucide-react'
import { IrisMark } from '../components/ui.jsx'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import {
  makeRound, durationFor, letterPx, makeRecord, factFor, judged, ANSWER_TEXT, MAX_POS, PASS,
} from '../lib/span.js'
import { profileSignals } from '../lib/profile.js'
import { haptic } from '../lib/native.js'
import '../styles/span.css'

// Tek Bakışta (Artifact "Tek Bakışta" T1–T6): ortadaki noktaya bakılır; noktanın solunda ya da sağında harf üçlüsü
// kısa süre (başta 100 ms) görünür; 4 büyük seçenekten biri seçilir ya da "Göremedim". Tur sonunda menzil eğrisi ve
// bir "Doğru mu, efsane mi?" kartı. Mantık: lib/span.js. Test ekranı E testi gibi beyaz ve yüksek kontrastlı.
const FIX_MIN_MS = 600
const FIX_JITTER_MS = 400 // sabitleme süresi değişken: harfin ne zaman geleceği tahmin edilmesin (VARSAYIM)
const FEEDBACK_MS = 450
const SLOTS = MAX_POS * 2 + 3 // üçlünün kenar harfleri ±(MAX_POS+1)'e kadar uzanır

function Profile({ profile }) {
  const W = 256
  const H = 124
  const x = (p) => 20 + ((p + MAX_POS) / (2 * MAX_POS)) * (W - 30)
  const y = (v) => 98 - v * 84
  // Orta (0) ölçülmez: sol ve sağ ayrı çizgi; ortada yalnız sabitleme işareti
  const side = (sign) =>
    Array.from({ length: MAX_POS }, (_, k) => sign * (k + 1)).map((p) => {
      const v = profile[p]
      return [x(p), y(v && v[1] ? v[0] / v[1] : 0)]
    })
  const path = (pts) => pts.map(([a, b], k) => `${k ? 'L' : 'M'}${a.toFixed(1)} ${b.toFixed(1)}`).join('')
  const fill = (pts) => `${path(pts)}L${pts.at(-1)[0].toFixed(1)} 98L${pts[0][0].toFixed(1)} 98Z`
  const L = side(-1)
  const R = side(1)
  return (
    <svg className="sp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Harf yerlerine göre doğruluk eğrisi">
      <defs>
        <linearGradient id="sp-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--iris-1)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--iris-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[1, 0.5, 0].map((v) => <line key={v} className="grid" x1="20" x2={W - 6} y1={y(v)} y2={y(v)} />)}
      <line className="th" x1="20" x2={W - 6} y1={y(PASS)} y2={y(PASS)} />
      <text className="thl" x={W - 6} y={y(PASS) - 4} textAnchor="end">%{Math.round(PASS * 100)}</text>
      <path className="area" d={fill(L)} />
      <path className="area" d={fill(R)} />
      <path className="ln" d={path(L)} />
      <path className="ln" d={path(R)} />
      <line className="fixm" x1={x(0)} x2={x(0)} y1={y(1)} y2="98" />
      {[-6, -3, 0, 3, 6].map((p) => <text key={p} className="ax" x={x(p)} y="114" textAnchor="middle">{p > 0 ? `+${p}` : p === 0 ? '0' : `−${-p}`}</text>)}
      <text className="ax" x="16" y={y(1) + 3} textAnchor="end">100</text>
      <text className="ax" x="16" y={y(0) + 3} textAnchor="end">0</text>
    </svg>
  )
}

// onSave(kayıt): tur bitince (kart görülmeden de kayıt düşer); onExit(): çıkış
export default function SpanGame({ sessions = [], settings, calibration, onSave, onExit }) {
  const blocked = profileSignals(settings?.profile).flashSafe === false
  const [phase, setPhase] = useState(blocked ? 'blocked' : 'intro') // blocked | intro | run | result | fact
  const [round, setRound] = useState(null)
  const [i, setI] = useState(0)
  const [step, setStep] = useState('fix') // fix | flash | answer | feedback
  const [picked, setPicked] = useState(undefined)
  const [results, setResults] = useState([])
  const [record, setRecord] = useState(null)
  const [factChoice, setFactChoice] = useState(null)
  // Tur başında sabit: kayıt düşünce oturum listesi değişir, süre ve kart atlamasın
  const [durationMs] = useState(() => durationFor(sessions))
  const [fact] = useState(() => factFor(sessions))
  const t0 = useRef(0)
  const timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Harf ölçüsü: 40 cm'de 0,5° (lib/span.js letterPx); dar ekranda yuvalar sığacak kadar küçülür
  const { fontPx, slotPx } = useMemo(() => {
    const m = letterPx(calibration?.pxPerMm)
    const room = (typeof window !== 'undefined' ? window.innerWidth : 390) - 24
    const k = Math.min(1, room / (SLOTS * m.slotPx))
    return { fontPx: m.fontPx * k, slotPx: m.slotPx * k }
  }, [calibration?.pxPerMm])

  const trial = round?.[i]
  // Deneme akışı: nokta (değişken süre) → harfler durationMs → seçenekler
  useEffect(() => {
    if (phase !== 'run' || step !== 'fix' || !trial) return
    later(() => {
      setStep('flash')
      later(() => setStep('answer'), durationMs)
    }, FIX_MIN_MS + Math.random() * FIX_JITTER_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step, i])

  function start() {
    setRound(makeRound())
    setI(0)
    setResults([])
    setPicked(undefined)
    setStep('fix')
    t0.current = Date.now()
    setPhase('run')
  }
  function answer(choice) {
    if (step !== 'answer') return
    const correct = choice === trial.target
    setPicked(choice)
    setStep('feedback')
    haptic(correct ? 'tick' : 'warning')
    const next = [...results, { pos: trial.pos, correct, unseen: choice == null }]
    setResults(next)
    later(() => {
      setPicked(undefined)
      if (i + 1 < round.length) {
        setI(i + 1)
        setStep('fix')
      } else {
        const rec = makeRecord({ results: next, durationMs, seconds: (Date.now() - t0.current) / 1000, factId: fact.id })
        setRecord(rec)
        onSave?.(rec)
        haptic('success')
        setPhase('result')
      }
    }, FEEDBACK_MS)
  }

  if (phase === 'blocked') {
    return (
      <main className="screen fade-in sp">
        <div className="sp-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button></div>
        <Ban size={40} aria-hidden="true" style={{ color: 'var(--warn)' }} />
        <h1 className="sp-h">Tek Bakışta senin için kapalı</h1>
        <p className="muted">Harfler çok kısa süre görünüyor. Epilepsi sorusuna verdiğin cevaba göre bu görevi açmıyoruz. Cevabını Profilim → Sorularım'dan değiştirebilirsin.</p>
      </main>
    )
  }

  if (phase === 'intro') {
    const last = sessions.filter((x) => x.type === 'span').at(-1)
    return (
      <main className="screen fade-in sp">
        <div className="sp-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={0} /></div>
        <span className="sp-ey">Tek Bakışta · 2 dk</span>
        <h1 className="sp-h">Gözünü kıpırdatmadan kaç harf tanırsın?</h1>
        <div className="sp-scene" aria-hidden="true">
          <div className="sp-slots">
            {Array.from({ length: MAX_POS * 2 + 1 }, (_, k) => k - MAX_POS).map((p) => <i key={p} className={p === 0 ? 'c' : ''} />)}
          </div>
          {last && <span className="sp-scene-cap">son turun ~{last.span} harf</span>}
        </div>
        <div className="sp-jev">
          <IrisMark size={34} />
          <p>Ortadaki noktaya bak. Yanında bir anlığına 3 harf belirecek; gözünü oynatma, sadece fark et. Sonra 4 seçenekten birini seç.</p>
        </div>
        <div className="grow" />
        <p className="sp-src">Merkezde tek bakışta en az ~10 harf tanınır; 15° kenarda 1,7 harfe iner (Legge 2001). Alıştırma kazanımı çalışmalarda çevresel görüşte gösterildi; normal okumaya aktarımı ve görmeyi iyileştirdiği gösterilmedi.</p>
        <button className="btn" onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
      </main>
    )
  }

  if (phase === 'run' && trial) {
    const letters = trial.target.split('')
    const showChoices = step === 'answer' || step === 'feedback'
    return (
      <main className="sp-test" aria-live="polite">
        <div className="sp-test-top">
          <button className="sp-x" onClick={onExit} aria-label="Turdan çık"><X size={20} /></button>
          <ProgressBar value={i / round.length} label="Tur" />
        </div>
        <span className="sp-test-ey">Deneme {i + 1} / {round.length}</span>
        <div className="sp-stage">
          {/* Sabitleme: harf satırının üstünde ve altında iki kısa çizgi (harf ortadaki yuvaya da gelebilir);
              nokta yalnız harfler görünmezken */}
          <span className="sp-tick" style={{ height: fontPx * 0.8, top: `calc(50% - ${fontPx * 1.55}px)` }} aria-hidden="true" />
          <span className="sp-tick" style={{ height: fontPx * 0.8, top: `calc(50% + ${fontPx * 0.75}px)` }} aria-hidden="true" />
          {step !== 'flash' && <span className="sp-fix" aria-hidden="true" />}
          {step === 'flash' &&
            letters.map((c, k) => (
              <span key={k} className="sp-letter" style={{ fontSize: fontPx, width: slotPx, left: `calc(50% + ${(trial.pos + k - 1) * slotPx - slotPx / 2}px)` }}>
                {c}
              </span>
            ))}
        </div>
        <p className="sp-test-hint">{showChoices ? 'Hangisiydi?' : 'Ortaya bak.'}</p>
        <div className="sp-choices" style={{ visibility: showChoices ? 'visible' : 'hidden' }}>
          {trial.choices.map((c) => {
            const state = step === 'feedback' ? (c === trial.target ? ' ok' : c === picked ? ' no' : '') : ''
            return (
              <button key={c} type="button" className={`sp-ch${state}`} onClick={() => answer(c)} disabled={step !== 'answer'}>
                {c}
              </button>
            )
          })}
        </div>
        <button type="button" className="sp-cant" style={{ visibility: showChoices ? 'visible' : 'hidden' }} onClick={() => answer(null)} disabled={step !== 'answer'}>
          <EyeOff size={22} strokeWidth={2.4} aria-hidden="true" /> Göremedim
        </button>
      </main>
    )
  }

  if (phase === 'result' && record) {
    return (
      <main className="screen fade-in sp">
        <div className="sp-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={1} /></div>
        <span className="sp-ey">Tur bitti</span>
        <div className="sp-res"><strong>~{record.span}</strong><span>harf, tek bakışta</span></div>
        <Profile profile={record.profile} />
        <div className="sp-lr">
          <div><b>{record.left}</b><span>solda</span></div>
          <div><b>{record.right}</b><span>sağda</span></div>
        </div>
        <p className="muted small">Harfler {record.durationMs} ms göründü; doğruluk %{Math.round((record.accuracy ?? 0) * 100)}. Bir sonraki turda süre buna göre ayarlanır. Yalnız kendi sayıların; norm ya da yorum yok.</p>
        <div className="grow" />
        <button className="btn" onClick={() => setPhase('fact')}>Bilim kartı <ArrowRight size={18} aria-hidden="true" /></button>
      </main>
    )
  }

  if (phase === 'fact') {
    const ok = factChoice ? judged(fact, factChoice) : null
    return (
      <main className="screen fade-in sp">
        <div className="sp-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button><ProgressBar value={1} /></div>
        <span className="sp-ey">Doğru mu, efsane mi?</span>
        <section className="sp-claim">
          <p className="st">{fact.claim}</p>
          <div className="sp-tf">
            {['fact', 'myth'].map((a) => (
              <button key={a} type="button" className={`sp-tfb${factChoice === a ? (ok ? ' good' : ' bad') : ''}`} onClick={() => setFactChoice(a)} aria-pressed={factChoice === a}>
                {a === 'fact' ? 'Doğru' : 'Efsane'}
              </button>
            ))}
          </div>
          {factChoice && (
            <div className="sp-reveal" aria-live="polite">
              <div className={`sp-verdict ${fact.answer}`}>{ok ? <Check size={20} aria-hidden="true" /> : null}{ANSWER_TEXT[fact.answer]}</div>
              <p>{fact.body}</p>
              <span className="sp-cite">{fact.ref} · doi {fact.doi}</span>
            </div>
          )}
        </section>
        <div className="grow" />
        <button className={`btn${factChoice ? '' : ' btn-ghost'}`} onClick={onExit}>Bitti</button>
      </main>
    )
  }
  return null
}
