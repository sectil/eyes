import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, Play, X } from 'lucide-react'
import SoundToggle from '../components/SoundToggle.jsx'
import { Arena } from '../components/ExerciseArt.jsx'
import { SAFETY_KEY, MOVES, MODES, stepsOf, totalSeconds, progressText, summaryText, weekCount, weekText, makeRecord } from '../lib/dikDur.js'
import { speak, unlockAudio } from '../lib/cue.js'
import { haptic } from '../lib/native.js'
import '../styles/exercise.css'
import '../styles/dikdur.css'

// Dik Dur (plan docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md; metinler metin-D1-onay.md, harfi harfine).
// giriş → (ilk kez) güvenlik → adımlar → bitiş. Kamera D1-4'te eklenir. Ses: cihazın kendi sesi (sahip kararı; ElevenLabs
// sonra, ayrı onayla). Geri/çarpı kaydetmeden çıkar; yalnız tamamlanan oturum kaydedilir.
const TICK_MS = 100

const seen = (storage) => {
  try {
    return storage?.getItem(SAFETY_KEY) === '1'
  } catch {
    return false
  }
}

// Yandan insan çizgisi (sağa bakar); hareketin yönü altın okla. Metin yok.
export function PostureArt({ move = null }) {
  return (
    <g className="dd-art">
      {move === 'uzat' && <path className="dd-string" d="M138 18 V64" />}
      <path className="dd-body" d="M126 132 C122 150 120 170 122 214" />
      <path className="dd-body" d="M124 150 C112 152 104 160 102 172" />
      <circle className="dd-head" cx="138" cy="98" r="30" />
      <path className="dd-body" d="M167 96 l7 6 l-7 3" />
      {move === 'uzat' && <path className="dd-arrow" d="M196 96 V58 m-9 10 l9 -10 l9 10" />}
      {move === 'cene' && <path className="dd-arrow" d="M214 124 H178 m10 -9 l-10 9 l10 9" />}
      {move === 'omuz' && <path className="dd-arrow" d="M150 150 C140 160 128 164 114 164 m10 -9 l-10 9 l10 9" />}
    </g>
  )
}

export default function DikDur({ onFinish, onBack, sessions = [], remindField = null, storage = globalThis.localStorage, now = () => new Date() }) {
  const [phase, setPhase] = useState('intro') // intro | safety | run | done
  const [mode, setMode] = useState('kisa')
  const [idx, setIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const stepStart = useRef(0)
  const startedAt = useRef(0)
  const steps = useMemo(() => stepsOf(mode), [mode])
  const step = steps[idx]

  function begin(m) {
    unlockAudio()
    setMode(m)
    setIdx(0)
    startedAt.current = performance.now()
    setPhase('run')
  }
  function choose(m) {
    setMode(m)
    if (seen(storage)) begin(m)
    else setPhase('safety')
  }
  function acceptSafety() {
    try {
      storage?.setItem(SAFETY_KEY, '1')
    } catch {
      // kalıcı olmasa da bugünkü oturum sürer
    }
    begin(mode)
  }

  // Adım başı: tutmada yönerge sesle; zamanlayıcı
  useEffect(() => {
    if (phase !== 'run' || !step) return undefined
    stepStart.current = performance.now()
    setElapsed(0)
    if (step.kind === 'hold') speak(MOVES[step.move].cue)
    const t = setTimeout(() => next(), step.s * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx])

  useEffect(() => {
    if (phase !== 'run') return undefined
    const t = setInterval(() => setElapsed(performance.now() - stepStart.current), TICK_MS)
    return () => clearInterval(t)
  }, [phase])

  function next() {
    if (steps[idx]?.kind === 'hold') haptic('success')
    if (idx + 1 < steps.length) setIdx(idx + 1)
    else setPhase('done')
  }

  function finish() {
    const seconds = startedAt.current ? (performance.now() - startedAt.current) / 1000 : totalSeconds(mode)
    onFinish?.(makeRecord({ mode, holds: steps.filter((s) => s.kind === 'hold').length, seconds }))
  }

  if (phase === 'intro') {
    return (
      <main className="ex-stage ex-start dd">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
          <span style={{ flex: 1 }} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-intro">
          <h1 className="ex-title">Dik Dur</h1>
          <p className="dd-lead">Günde birkaç kez kısa bir dikleşme molası.</p>
          <svg className="dd-hero" viewBox="60 0 180 230" aria-hidden="true"><PostureArt move="uzat" /></svg>
          <p className="ex-para">Üç hareket, her birini 10 saniye tut: boyunu uzat, çeneni içeri çek, omuzlarını geri ve aşağı al.</p>
          <p className="ex-para">Saatlerce dik durman gerekmez. Önemli olan sık sık pozisyon değiştirmek ve gün içinde kısa molalar vermek.</p>
          <p className="dd-ev">Çökük oturmak ruh hâlini biraz düşürebilir; dikleşmek o an daha iyi hissettirebilir.</p>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={() => choose('kisa')}><Play aria-hidden="true" fill="currentColor" /> Kısa tur · 2 dakika</button>
          <button type="button" className="ex-btn ghost" onClick={() => choose('tam')}>Tam tur · 15 dakika</button>
          <p className="dd-note">Kısa turu gün içinde istediğin kadar yapabilirsin. Tam turu haftada 4 gün öneriyoruz.</p>
        </div>
      </main>
    )
  }

  if (phase === 'safety') {
    return (
      <main className="ex-stage ex-start dd">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={() => setPhase('intro')} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
        </div>
        <div className="ex-intro dd-safety">
          <h1 className="ex-title">Başlamadan önce</h1>
          <p className="ex-para">Yakın zamanda boyun ya da omuz sakatlığın, ameliyatın ya da kola yayılan ağrın olduysa önce doktoruna danış.</p>
          <p className="ex-para">Hareketleri zorlamadan yap. Ağrı, baş dönmesi ya da kolunda uyuşma olursa dur.</p>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={acceptSafety}><Check aria-hidden="true" /> Anladım</button>
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main className="ex-stage ex-end dd">
        <div className="ex-res">
          <svg className="ex-badge" viewBox="0 0 180 180" width="160" height="160" aria-hidden="true">
            <circle className="halo" cx="90" cy="90" r="70" />
            <circle className="disc" cx="90" cy="90" r="46" />
            <path className="tick" d="M70 91 l14 14 l28 -30" strokeWidth="8" />
          </svg>
          <h1 className="ex-title">Bitti</h1>
          <p className="ex-para">{summaryText(mode)}</p>
          <p className="ex-para">{weekText(weekCount(sessions, now()) + 1)}</p>
        </div>
        {remindField}
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={finish}><Check aria-hidden="true" /> Bitir</button>
        </div>
      </main>
    )
  }

  // Adımlar: tutmada halka dolar ve kalan saniye görünür; aradaki 3 sn sıradaki hareketi gösterir; bölüm arası dinlenme
  const m = MODES[mode]
  const shown = step.kind === 'gap' ? steps[idx + 1] : step
  const left = Math.max(0, Math.ceil(step.s - elapsed / 1000))
  const part = step.kind === 'hold' ? Math.min(1, elapsed / (step.s * 1000)) : 0
  const blocks = m.order === 'cycle' ? m.reps : m.sets * m.moves.length
  const blockOf = (s) => (m.order === 'cycle' ? s.rep - 1 : (s.set - 1) * m.moves.length + m.moves.indexOf(s.move))
  const cur = shown?.kind === 'hold' ? blockOf(shown) : step.kind === 'rest' ? (step.set - 1) * m.moves.length : 0

  if (step.kind === 'rest') {
    return (
      <main className="ex-stage dd">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
          <Segs n={blocks} cur={cur} part={0} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-copy">
          <h1 className="ex-title" aria-live="polite">Dinlen. Sonraki bölüm 1 dakika sonra başlar.</h1>
        </div>
        <div className="ex-mid">
          <Arena progress={Math.min(1, elapsed / (step.s * 1000))} tone="gold"><text className="dd-count" x="130" y="146" textAnchor="middle">{left}</text></Arena>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={next}><Play aria-hidden="true" fill="currentColor" /> Şimdi başla</button>
        </div>
      </main>
    )
  }

  const mv = MOVES[shown.move]
  return (
    <main className="ex-stage dd">
      <div className="ex-top">
        <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
        <Segs n={blocks} cur={cur} part={step.kind === 'hold' ? (m.order === 'cycle' ? (m.moves.indexOf(step.move) + part) / m.moves.length : (step.rep - 1 + part) / m.reps) : 0} />
        <SoundToggle className="ex-sound" />
      </div>
      <div className="ex-copy" key={`${shown.set}-${shown.rep}-${shown.move}`}>
        <span className="ex-step"><b>{progressText(mode, shown)}</b></span>
        <h1 className="ex-title" aria-live="assertive">{mv.name}</h1>
        <p className="ex-para dd-cue">{mv.cue}</p>
      </div>
      <div className="ex-mid">
        <Arena progress={part} off={step.kind !== 'hold'}>
          <PostureArt move={shown.move} />
        </Arena>
      </div>
      <div className="dd-left" aria-hidden="true">{step.kind === 'hold' ? left : ''}</div>
      <div className="ex-foot" />
    </main>
  )
}

function Segs({ n, cur, part }) {
  return (
    <div className="ex-segs" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={cur + 1}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={i < cur ? 'd' : ''}>{i === cur && <i style={{ width: `${part * 100}%` }} />}</span>
      ))}
    </div>
  )
}
