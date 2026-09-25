import { useEffect, useRef, useState } from 'react'
import { X, Play, Wind, Check, RotateCcw, Hand, CircleHelp, Timer } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import StepCards from '../components/StepCards.jsx'
import { BreathTapArt, BreathHoldArt, LostCountArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { haptic } from '../lib/native.js'
import {
  createBreathCounter, nextProbeAt, durationFor, makeRecord, resultText, bcTrend,
  LONG_PRESS_MS, MW_SCALE, SET_SIZE, DURATIONS_SEC,
} from '../lib/breathCount.js'
import '../styles/breathcount.css'

// Son 20 sn içinde yeni sorgu açılmaz (VARSAYIM: bitişe sıkışan sorgu yanıtlanamaz)
const PROBE_TAIL_MS = 20000
const MW_LABEL = { 1: 'Tamamen nefeste', 6: 'Tamamen başka yerde' }
const PHASE_TEXT = {
  familiarization: 'Alışma dönemi: ilk üç seans yalnızca tanışma; sayılar henüz karşılaştırılmaz.',
  baseline: 'Başlangıç noktan oluşuyor: birkaç seans daha, sonra değişimi izleyebiliriz.',
  tracking: null,
}

export default function BreathCount({ sessions = [], onBack, onFinish }) {
  const [phase, setPhase] = useState('intro') // intro | run | result
  const [howto, setHowto] = useState(() => !howtoSeen('breath-count'))
  const [probe, setProbe] = useState(null) // null | { step: 'mw' | 'count', mw }
  const [left, setLeft] = useState(0)
  const [result, setResult] = useState(null)
  const seconds = durationFor(sessions)
  const trendBefore = bcTrend(sessions)

  const counter = useRef(null)
  const t0 = useRef(0)
  const probeAt = useRef(0)
  const press = useRef(null) // { at, timer, long }

  function start() {
    counter.current = createBreathCounter()
    t0.current = performance.now()
    probeAt.current = nextProbeAt(t0.current)
    setProbe(null)
    setResult(null)
    setLeft(seconds)
    setPhase('run')
    haptic('success')
  }

  // Zamanlayıcı: kalan süre, sorgu zamanı, bitiş
  useEffect(() => {
    if (phase !== 'run') return undefined
    const id = setInterval(() => {
      const now = performance.now()
      const elapsed = now - t0.current
      const remain = Math.max(0, seconds - Math.floor(elapsed / 1000))
      setLeft((p) => (p === remain ? p : remain))
      if (elapsed >= seconds * 1000) {
        clearInterval(id)
        finish()
        return
      }
      if (!counter.current.state.probing && now >= probeAt.current && seconds * 1000 - elapsed > PROBE_TAIL_MS) {
        counter.current.openProbe()
        setProbe({ step: 'mw', mw: null })
        haptic('warning')
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seconds])

  function finish() {
    const sum = counter.current.summary(seconds)
    setResult(sum)
    setPhase('result')
    haptic('success')
  }

  // Dokunma yüzeyi: kısa dokunuş = 1–8, basılı tutma (≥ LONG_PRESS_MS) = 9
  function down(e) {
    if (probe) return
    e.preventDefault()
    const at = performance.now()
    const timer = setTimeout(() => {
      press.current = { at, timer: null, long: true }
      haptic('hit') // 9 kabul edildi
    }, LONG_PRESS_MS)
    press.current = { at, timer, long: false }
  }
  function up() {
    const p = press.current
    if (!p) return
    press.current = null
    if (p.timer) clearTimeout(p.timer)
    const ts = performance.now()
    if (p.long) counter.current.nine(ts)
    else {
      counter.current.tap(ts)
      haptic('tick')
    }
  }
  function lost() {
    if (probe) return
    counter.current.reset(performance.now())
    haptic('warning')
  }
  function answerMw(mw) {
    setProbe({ step: 'count', mw })
  }
  function answerCount(said) {
    counter.current.answerProbe(performance.now(), { mw: probe.mw, said })
    probeAt.current = nextProbeAt(performance.now())
    setProbe(null)
  }

  if (phase === 'intro' && howto) {
    const cards = [
      { key: 'tap', art: <BreathTapArt />, title: 'Nefes ver, ekrana bir kez dokun', why: "1'den 9'a say. Rahat otur; ekran karanlık kalır." },
      { key: 'hold', art: <BreathHoldArt />, title: "9'da basılı tut, titreşimi hisset", why: "Sonra 1'den başla." },
      { key: 'lost', art: <LostCountArt />, title: 'Sayıyı kaybettiysen "Kaybettim"', why: 'Hata değil, fark etmenin kendisi. Arada bir soru sorarım; doğru cevap yok.' },
    ]
    return (
      <main className="screen fade-in">
        <StepCards cards={cards} eyebrow="Nefes sayma · nasıl yapılır" finishLabel="Anladım" onFinish={() => setHowto(false)} onDismiss={() => { markHowtoSeen('breath-count'); setHowto(false) }} onClose={onBack} />
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="screen fade-in">
        <PageHeader onBack={onBack} eyebrow="Dikkat ölçümü" title="Nefes sayma" subtitle="Nefeslerini say; dikkatin nereye kaçtığını ölçelim." />
        <div className="row between">
          <span className="muted small">Nefes verişte dokun · 9'da basılı tut · kaybedince "Kaybettim"</span>
          <button type="button" className="link-btn" onClick={() => setHowto(true)}>Nasıl yapılır?</button>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="acuity-pill"><Timer size={14} aria-hidden="true" /> {seconds / 60} dk</span>
          <span className="acuity-pill"><Hand size={14} aria-hidden="true" /> Dokun · 9'da basılı tut</span>
          <span className="acuity-pill"><CircleHelp size={14} aria-hidden="true" /> 1–2 soru</span>
        </div>
        <p className="muted small">
          Nefes sayma, farkındalığın davranışla ölçülebilen bir göstergesi (Levinson 2014). İnsanların çoğu ilk seansta her beş setten birini
          kaçırır; amaç yüksek puan değil, kendi çizgini görmek. {seconds === DURATIONS_SEC.short ? 'İlk seanslar 3 dakika.' : 'Standart seans 5 dakika.'}
        </p>
        <button className="btn" onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
      </main>
    )
  }

  if (phase === 'result') {
    const t = bcTrend([...sessions, makeRecord(result)])
    const phaseText = PHASE_TEXT[t.phase]
    return (
      <main className="screen fade-in">
        <PageHeader eyebrow="Nefes sayma" title={result.accuracy == null ? 'Veri yetersiz' : `%${result.accuracy}`} subtitle={resultText(result)} />
        <div className="card stack" style={{ gap: 6 }}>
          <Row k="Tamamlanan set" v={`${result.sets}`} />
          <Row k="Doğru 9'lar" v={`${result.ok}`} />
          <Row k="Fark etmeden kaçırılan" v={`${result.miss9 + result.early9}`} sub="dikkat kopması" />
          <Row k="Kendi fark ettiğin" v={`${result.resets}`} sub="zihin gezinmesi" />
          <Row k="Sorular" v={`${result.probes - result.probeWrong}/${result.probes} doğru sayı`} />
          {result.mw != null && <Row k="Dikkat nerede (1–6)" v={`${result.mw}`} sub="1 nefeste · 6 başka yerde" />}
          {result.bpm != null && <Row k="Nefes hızı" v={`~${result.bpm} / dk`} sub="dokunuşlardan" />}
        </div>
        {phaseText ? (
          <p className="muted small">{phaseText}</p>
        ) : (
          t.reference != null && (
            <p className="muted small">
              Referansın %{t.reference}. Son üç seansın ortancası referansın {t.delta > 0 ? `${t.delta} üstünde` : t.delta < 0 ? `${-t.delta} altında` : 'aynısı'}.
            </p>
          )
        )}
        <button className="btn" onClick={() => onFinish(makeRecord(result))}><Check size={18} aria-hidden="true" /> Kaydet</button>
        <button className="btn btn-ghost" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Yeniden</button>
        {trendBefore.phase === 'empty' && <p className="muted small" style={{ textAlign: 'center' }}>İlk ölçümün. Haftada bir tekrarlarsan çizgin oluşur.</p>}
      </main>
    )
  }

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  return (
    <div className="bc-stage" role="application" aria-label="Nefes sayma">
      <div className="bc-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label="Kapat"><X size={20} /></button>
        <span className="bc-time" aria-live="off">{mm}:{ss}</span>
        <span style={{ width: 40 }} aria-hidden="true" />
      </div>
      <button
        type="button"
        className={`bc-pad${probe ? ' muted-pad' : ''}`}
        data-no-tap
        aria-label="Her nefeste dokun, dokuzuncuda basılı tut"
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Wind size={26} strokeWidth={1.6} aria-hidden="true" />
        <span className="bc-hint">Her nefeste dokun · {SET_SIZE}'da basılı tut</span>
      </button>
      <button type="button" className="btn btn-ghost bc-lost" onClick={lost} disabled={Boolean(probe)}>
        Kaybettim · 1'den başla
      </button>

      {probe && (
        <div className="bc-probe" role="dialog" aria-modal="true" aria-label="Kısa soru">
          {probe.step === 'mw' ? (
            <>
              <h2>Az önce dikkatin neredeydi?</h2>
              <div className="bc-scale" role="group" aria-label="1 tamamen nefeste, 6 tamamen başka yerde">
                {MW_SCALE.map((v) => (
                  <button key={v} type="button" onClick={() => answerMw(v)} aria-label={`${v}${MW_LABEL[v] ? `, ${MW_LABEL[v]}` : ''}`}>{v}</button>
                ))}
              </div>
              <div className="bc-scale-ends"><span>{MW_LABEL[1]}</span><span>{MW_LABEL[6]}</span></div>
            </>
          ) : (
            <>
              <h2>Kaçtaydın?</h2>
              <div className="bc-keys" role="group" aria-label="Sayı">
                {Array.from({ length: SET_SIZE }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => answerCount(n)}>{n}</button>
                ))}
              </div>
              <button type="button" className="link-btn" onClick={() => answerCount(0)}>Bilmiyorum</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ k, v, sub }) {
  return (
    <div className="row between bc-row">
      <span className="bc-k">{k}{sub && <span className="muted small"> · {sub}</span>}</span>
      <strong className="bc-v">{v}</strong>
    </div>
  )
}
