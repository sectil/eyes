import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Play, Zap, ShieldAlert, Check, RotateCcw, Eye, Trophy } from 'lucide-react'
import { PageHeader, Sparkline } from '../components/ui.jsx'
import StepCards from '../components/StepCards.jsx'
import { CarIcon, TruckIcon, StarIcon, TriangleIcon } from '../components/quickArt.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader } from '../lib/gaze.js'
import { loadGazeModel } from '../lib/gazeCalib.js'
import { haptic } from '../lib/native.js'
import { requestEyeRound } from '../lib/eyeBudgetStore.js'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { profileSignals } from '../lib/profile.js'
import {
  PARAMS, DIR_LABELS, PROGRAM_HOURS, createStaircase, makeTrial, distractorSlots, isEasyTrial, easyFrames, peripheralOffset, eccentricityDeg, makeRecord, framesToMs, msLabel,
  isQuickLook, programHours, nextLevel, firstAndBest, rng,
} from '../lib/quicklook.js'
import '../styles/quicklook.css'

// Hızlı Bakış (lib/quicklook.js). Uyaran React çizimine bırakılmaz: kare döngüsünde (requestAnimationFrame)
// doğrudan görünür/gizli yapılır; açılış ve kapanış zamanları ölçülür, kayda ölçülen süre yazılır.
// Işığa duyarlılık: profil nöbet cevabı "Evet"/"Emin değilim" → pratik kapalı. Deneme döngüsü ≥ 1 sn (< 3 Hz),
// uyaranlar küçük, doymuş kırmızı yok, maske çizgi deseni değil dağınık küçük şekiller (rapor 18 §7).
// Göz ortada: kalibrasyon modeli varsa gösterim anında bakış merkezde değilse deneme sayılmaz.

const deg2px = (deg, pxPerMm, mm) => Math.tan((deg * Math.PI) / 180) * mm * pxPerMm

export default function QuickLook({ sessions = [], settings, calibration, trueDepth = false, onExit, onFinish }) {
  const sig = profileSignals(settings?.profile)
  const [phase, setPhase] = useState(() => (sig.flashSafe === false ? 'blocked' : !howtoSeen('quick-look') ? 'howto' : 'intro'))
  const [stage, setStage] = useState('fix') // fix | show | ask-center | ask-pos | feedback
  const [trial, setTrial] = useState(null)
  const [answer, setAnswer] = useState({ center: null, pos: null })
  const [feedback, setFeedback] = useState(null) // { ok, invalid }
  const [count, setCount] = useState(0)
  const [result, setResult] = useState(null)
  const level = useMemo(() => nextLevel(sessions), [sessions])

  // Kamera: mesafe (açısal boyut) ve bakış merkezde mi
  const model = useMemo(() => (trueDepth ? loadGazeModel() : null), [trueDepth])
  const reader = useRef(null)
  const gazeDir = useRef(null)
  const cam = useFaceTracking({
    enabled: phase === 'run' && trueDepth,
    trueDepth,
    onFrame: (m) => {
      if (!model) return
      if (!reader.current) reader.current = createGazeReader({ model })
      gazeDir.current = reader.current.push(m).dir
    },
  })
  const distanceMm = trueDepth && cam.mm ? cam.mm : PARAMS.distanceMm
  const pxPerMm = calibration?.pxPerMm ?? 6.3 // VARSAYIM: kalibrasyon yoksa tipik iPhone (≈160 CSS px / inç)

  // Alan boyutu ve açısal ölçüler
  const [fieldPx, setFieldPx] = useState(320)
  const fieldRef = useRef(null)
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(() => setFieldPx(Math.min(el.clientWidth, el.clientHeight)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [phase])
  const centerPx = Math.max(36, deg2px(PARAMS.centerDeg, pxPerMm, distanceMm))
  const starPx = Math.max(22, deg2px(PARAMS.starDeg, pxPerMm, distanceMm))
  const maxR = fieldPx / 2 - starPx / 2 - 6
  const radiusPx = Math.max(60, Math.min(maxR, deg2px(PARAMS.eccTargetDeg, pxPerMm, distanceMm)))
  const eccDeg = eccentricityDeg(radiusPx, pxPerMm, distanceMm)

  // Oturum durumu (ref: kare döngüsü içinde okunur)
  const S = useRef(null)
  const stimRef = useRef(null)
  const maskRef = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const maskShapes = useMemo(() => {
    const r = rng(7)
    // Açık ve koyu noktalar yarı yarıya: ortalama parlaklık zemine yakın (rapor 20 #13); çizgi/ızgara yok
    return Array.from({ length: 140 }, (_, n) => ({ x: r() * 100, y: r() * 100, k: n % 2, s: 8 + r() * 10 }))
  }, [])

  function start() {
    if (!requestEyeRound()) return
    S.current = { stair: createStaircase(), rand: rng(Date.now()), n: 0, invalid: 0, t0: performance.now(), lastMs: null }
    setCount(0)
    setPhase('run')
    later(nextTrial, 500)
  }

  function nextTrial() {
    const s = S.current
    if (!s) return
    if (s.n >= PARAMS.trials) return finish()
    const t = { ...makeTrial(s.rand, { level }), easy: isEasyTrial(s.n) }
    setTrial(t)
    setAnswer({ center: null, pos: null })
    setFeedback(null)
    setStage('fix')
    later(present, PARAMS.fixationMs)
  }

  // Gösterim: N kare uyaran, sonra maske. Zamanlar rAF damgasından.
  function present() {
    const s = S.current
    const stim = stimRef.current
    const mask = maskRef.current
    if (!s || !stim || !mask) return
    const frames = trial?.easy ? easyFrames(s.stair.frames) : s.stair.frames
    let k = 0
    let onset = null
    s.offCenter = Boolean(model && gazeDir.current && gazeDir.current !== 'center')
    setStage('show')
    const step = (ts) => {
      if (onset == null) {
        stim.style.visibility = 'visible'
        onset = ts
        k = 0
        requestAnimationFrame(step)
        return
      }
      k += 1
      if (k < frames) {
        requestAnimationFrame(step)
        return
      }
      stim.style.visibility = 'hidden'
      mask.style.visibility = 'visible'
      s.lastMs = ts - onset
      let m = 0
      const maskStep = () => {
        m += 1
        if (m < PARAMS.maskFrames) {
          requestAnimationFrame(maskStep)
          return
        }
        mask.style.visibility = 'hidden'
        setStage('ask-center')
      }
      requestAnimationFrame(maskStep)
    }
    requestAnimationFrame(step)
  }

  function pickCenter(c) {
    setAnswer((a) => ({ ...a, center: c }))
    setStage('ask-pos')
  }
  function pickPos(p) {
    const s = S.current
    const ok = answer.center === trial.center && p === trial.pos
    setAnswer((a) => ({ ...a, pos: p }))
    if (s.offCenter && s.invalid < 10) {
      s.invalid += 1
      setFeedback({ ok: false, invalid: true })
      haptic('warning')
    } else {
      if (!trial.easy) s.stair.push(ok, s.lastMs ?? framesToMs(s.stair.frames)) // kolay deneme basamağa sayılmaz
      s.n += 1
      setCount(s.n)
      setFeedback({ ok, invalid: false })
      haptic(ok ? 'tick' : 'warning')
    }
    setStage('feedback')
    later(nextTrial, PARAMS.itiMs)
  }

  function finish() {
    const s = S.current
    S.current = null
    const rec = makeRecord({ history: s.stair.history, reversals: s.stair.reversals, seconds: (performance.now() - s.t0) / 1000, level, eccDeg, distanceMm })
    setResult(rec)
    setPhase('result')
    haptic('success')
    onFinish?.(rec)
  }

  // ---------- Ekranlar ----------
  if (phase === 'blocked') {
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onExit} eyebrow="Farkındalık" title="Hızlı Bakış" />
        <div className="card row" style={{ alignItems: 'flex-start', gap: 10 }}>
          <ShieldAlert size={22} aria-hidden="true" style={{ flex: 'none', color: 'var(--warn)' }} />
          <p className="small" style={{ margin: 0 }}>
            <strong>Bu pratik senin için kapalı.</strong> Profilinde epilepsi ya da ışıkla tetiklenen nöbet için "Evet" veya "Emin değilim"
            dedin; Hızlı Bakış kısa süre yanıp sönen görüntüler kullanır. Hekimine danış; cevabın değiştiyse Profilim'den güncelle.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onExit}>Geri</button>
      </main>
    )
  }

  if (phase === 'howto') {
    const cards = [
      { key: 'fix', art: <HowtoFix />, title: 'Gözün ortadaki noktada kalsın', why: 'Kenara bakma; kamera gözünün ortada kaldığını kontrol eder.' },
      { key: 'center', art: <HowtoCenter />, title: 'Ortada ne vardı: araba mı, kamyon mu?', why: 'Görüntü göz açıp kapayıncaya kadar kısa.' },
      { key: 'star', art: <HowtoStar />, title: 'Yıldız neredeydi? Yönünü seç', why: 'İkisi de doğruysa süre kısalır; yanlışta uzar.' },
    ]
    return (
      <main className="screen fade-in">
        <StepCards cards={cards} eyebrow="Hızlı Bakış · nasıl yapılır" finishLabel="Anladım" onFinish={() => setPhase('intro')} onDismiss={() => { markHowtoSeen('quick-look'); setPhase('intro') }} onClose={onExit} />
      </main>
    )
  }

  if (phase === 'intro') {
    const fb = firstAndBest(sessions)
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onExit} eyebrow="Farkındalık" title="Hızlı Bakış" subtitle="Ortayı ve kenarı aynı anda yakala." />
        {fb.n > 0 && (
          <section className="card ql-summary">
            <div><span className="muted small">Son eşik</span><strong>{msLabel(fb.last)}</strong></div>
            <div><span className="muted small">İlk ölçüm</span><strong>{msLabel(fb.first)}</strong></div>
            <div><span className="muted small">Seviye</span><strong>{level === 1 ? 'Temel' : `${level} · ${PARAMS.levels[level]} çeldirici`}</strong></div>
          </section>
        )}
        <div className="row between">
          <span className="muted small">{PARAMS.trials} deneme · 3–5 dk · gözün ortada</span>
          <button type="button" className="link-btn" onClick={() => setPhase('howto')}>Nasıl yapılır?</button>
        </div>
        <p className="note small">Telefonu yaklaşık 35 cm'de tut; yakın gözlüğün varsa tak. Gözün yorulur ya da başın ağrırsa bırak. Bu görevdeki hızını ölçer ve çalıştırır; bir hastalığı önlemez, sürüş güvenliğinin ölçüsü değildir.</p>
        <button type="button" className="btn" disabled={sig.flashSafe == null} onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
      </main>
    )
  }

  if (phase === 'result' && result) {
    const all = [...sessions.filter(isQuickLook), result]
    const hours = programHours(all)
    const first = all[0].threshold
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onExit} eyebrow="Hızlı Bakış" title="Sonuç" />
        <section className="card card-hero ql-result">
          <span className="muted small">Bugünkü eşik</span>
          <strong className="ql-big">{result.threshold == null ? '—' : msLabel(result.threshold)}</strong>
          <span className="muted small">İlk ölçüm {msLabel(first)} · doğruluk %{result.accuracy}</span>
          {all.length > 1 && <Sparkline values={all.map((s) => s.threshold)} width={260} height={44} higherIsBetter={false} />}
          <p className="small" style={{ margin: 0 }}>
            {all.length > 1 && result.threshold < first
              ? `Bu görevdeki hızın ${all.length} seansta ${msLabel(first)}'dan ${msLabel(result.threshold)}'a indi. Bu görevdeki gelişimdir; görmenin ya da sürüşün ölçüsü değildir.`
              : 'Eşik, hem ortayı hem kenarı doğru yakaladığın en kısa süre. Düşmesi görevde hızlandığın anlamına gelir.'}
          </p>
        </section>
        <section className="card stack" style={{ gap: 6 }}>
          <div className="row between"><span className="small"><strong>Program</strong></span><span className="muted small">{hours.toFixed(1)} / {PROGRAM_HOURS} saat</span></div>
          <div className="ql-bar"><i style={{ width: `${Math.min(100, (hours / PROGRAM_HOURS) * 100)}%` }} /></div>
          <span className="muted small">Araştırmalardaki doz: haftalara yayılmış yaklaşık 10 saat, haftada 3–4 seans. Günde birkaç dakikalık düşük dozun etkisi bilinmiyor.</span>
          {result.eccDeg != null && <span className="muted small">Kenar uzaklığı {result.eccDeg}° · {Math.round((result.distanceMm ?? PARAMS.distanceMm) / 10)} cm · yalnızca kendi önceki sonuçlarınla karşılaştır</span>}
        </section>
        <button type="button" className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Bir tur daha</button>
        <button type="button" className="btn btn-ghost" onClick={onExit}>Bitir</button>
      </main>
    )
  }

  // --- Koşu ---
  const off = trial ? peripheralOffset(trial.pos, radiusPx) : { x: 0, y: 0 }
  const distractors = distractorSlots(trial).map((d, n) => ({ key: n, ...peripheralOffset(d.pos, (radiusPx * d.ring) / d.of) }))
  const Center = trial?.center === 'truck' ? TruckIcon : CarIcon
  return (
    <main className="screen ql-run">
      <div className="ql-top">
        <button type="button" className="btn-icon" onClick={onExit} aria-label="Kapat"><X size={20} /></button>
        <span className="muted small ql-count">{count} / {PARAMS.trials}</span>
        {model ? <span className={`chip ${gazeDir.current && gazeDir.current !== 'center' ? 'chip-too-far' : 'chip-ok'}`}><Eye size={13} aria-hidden="true" /> göz ortada</span> : <span />}
      </div>
      <div className="ql-field" ref={fieldRef}>
        <div className="ql-fix" aria-hidden="true" style={{ visibility: stage === 'fix' || stage === 'show' ? 'visible' : 'hidden' }} />
        <div className="ql-stim" ref={stimRef} style={{ visibility: 'hidden' }} aria-hidden="true">
          <span className="ql-center"><Center size={centerPx} /></span>
          {distractors.map((d) => (
            <span key={d.key} className="ql-dis" style={{ transform: `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px))` }}><TriangleIcon size={starPx * 0.8} /></span>
          ))}
          <span className="ql-star" style={{ transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))` }}><StarIcon size={starPx} /></span>
        </div>
        <div className="ql-mask" ref={maskRef} style={{ visibility: 'hidden' }} aria-hidden="true">
          {maskShapes.map((m, n) => (
            <span key={n} className={`ql-m k${m.k}`} style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s }} />
          ))}
        </div>
        {stage === 'ask-pos' && (
          <div className="ql-pos" role="group" aria-label="Yıldız neredeydi?">
            {DIR_LABELS.map((lbl, p) => {
              const o = peripheralOffset(p, radiusPx)
              return (
                <button key={lbl} type="button" className="ql-pos-btn" aria-label={lbl} style={{ transform: `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px))` }} onClick={() => pickPos(p)}>
                  <StarIcon size={18} />
                </button>
              )
            })}
          </div>
        )}
        {stage === 'feedback' && feedback && (
          <div className={`ql-fb ${feedback.invalid ? 'warn' : feedback.ok ? 'ok' : 'no'}`} role="status">
            {feedback.invalid ? 'Gözün ortada kalsın; bu deneme sayılmadı' : feedback.ok ? <><Check size={18} aria-hidden="true" /> İkisi de doğru</> : `Ortada ${trial.center === 'truck' ? 'kamyon' : 'araba'}, yıldız ${DIR_LABELS[trial.pos].toLocaleLowerCase('tr')}`}
          </div>
        )}
      </div>
      <div className="ql-ask">
        {stage === 'ask-center' ? (
          <>
            <span className="ql-q">Ortada ne vardı?</span>
            <div className="ql-choices">
              <button type="button" className="ql-choice" onClick={() => pickCenter('car')}><CarIcon size={64} /><span>Araba</span></button>
              <button type="button" className="ql-choice" onClick={() => pickCenter('truck')}><TruckIcon size={64} /><span>Kamyon</span></button>
            </div>
          </>
        ) : stage === 'ask-pos' ? (
          <span className="ql-q">Yıldız neredeydi? Yerine dokun.</span>
        ) : (
          <span className="ql-q muted">Ortadaki noktaya bak</span>
        )}
      </div>
    </main>
  )
}

// --- Yönerge çizimleri ---
function HowtoFix() {
  return (
    <svg viewBox="0 0 170 170"><rect x="20" y="20" width="130" height="130" rx="18" fill="var(--surface-2)" stroke="var(--border)" /><circle cx="85" cy="85" r="5" fill="var(--ink)" /><circle cx="85" cy="85" r="16" fill="none" stroke="var(--accent-graphic)" strokeWidth="3"><animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" /></circle></svg>
  )
}
function HowtoCenter() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="20" y="20" width="130" height="130" rx="18" fill="var(--surface-2)" stroke="var(--border)" />
      <g transform="translate(55 70) scale(0.6)" fill="var(--ink)"><path d="M8 40 L14 26 Q18 18 28 18 L60 18 Q68 18 74 26 L82 32 L92 34 Q96 35 96 40 L96 44 L8 44 Z" /><circle cx="26" cy="46" r="8" /><circle cx="78" cy="46" r="8" /><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.2;0.25;1" dur="2.4s" repeatCount="indefinite" /></g>
    </svg>
  )
}
function HowtoStar() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="20" y="20" width="130" height="130" rx="18" fill="var(--surface-2)" stroke="var(--border)" />
      <circle cx="85" cy="85" r="4" fill="var(--ink-3)" />
      <g transform="translate(118 38)"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="var(--lens)" /></g>
      <circle cx="130" cy="50" r="17" fill="none" stroke="var(--accent-graphic)" strokeWidth="3"><animate attributeName="opacity" values="0;0;1;1;0" dur="2.4s" repeatCount="indefinite" /></circle>
    </svg>
  )
}
