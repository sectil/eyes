import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { FactCard, SourceList } from '../components/Sources.jsx'
import { haptic } from '../lib/native.js'
import { getPrefs } from '../lib/prefs.js'
import { createScene } from '../lib/skyScene.js'
import { createAmbience } from '../lib/skyAmbience.js'
import {
  DURATION_SEC, MIN_SAVE_SEC, SKY, ENVS, ENV_LABEL, AMBIENCE_LABEL, ANSWER_TEXT, SOURCE_IDS,
  partOfDay, promptsFor, promptIndex, makeRecord, history, factFor, loadOpts, saveOpts,
} from '../lib/gokyuzu.js'
import '../styles/sources.css'
import '../styles/gokyuzu.css'

// Gökyüzü molası (Artifact "Gökyüzü Molası 2", onaylı): manzara seç → önce puan → 2 dk mola (sahne soruyu gösterir,
// isteğe bağlı doğa sesi ve sesli okuma) → sonra puan → kart ve kaynaklar. Yanıp sönme yok; kamera kullanılmaz.
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const fmt1 = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`

function Scale({ value, onChange, label, glass = false }) {
  return (
    <>
      <div className={`gk-r10${glass ? ' glass' : ''}`} role="radiogroup" aria-label={label}>
        {Array.from({ length: 11 }, (_, v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => { onChange(v); haptic('tick') }}>{v}</button>
        ))}
      </div>
      <div className={`gk-ends${glass ? ' glass' : ''}`}><span>hiç</span><span>çok</span></div>
    </>
  )
}

// Tuval sahnesi: canvas'a bağlı, manzara ve günün saati değişince yeniden kurulur
function SceneCanvas({ env, part, mini = false, sceneRef, className }) {
  const ref = useRef(null)
  useEffect(() => {
    const sc = createScene(ref.current, { mini })
    sc.set({ env, part })
    sc.start()
    if (sceneRef) sceneRef.current = sc
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => sc.resize()) : null
    ro?.observe(ref.current)
    return () => { sc.stop(); ro?.disconnect(); if (sceneRef) sceneRef.current = null }
  }, [env, part, mini, sceneRef])
  return <canvas ref={ref} className={className} aria-hidden="true" />
}

// Sesli okuma: telefondaki en iyi Türkçe sesi seç (Gelişmiş/Premium varsa onu)
function bestTurkishVoice() {
  try {
    const score = (v) => (/premium|enhanced|gelişmiş|neural/i.test(v.name) ? 10 : 0) + (v.localService ? 1 : 0)
    return globalThis.speechSynthesis.getVoices().filter((v) => /^tr/i.test(v.lang)).sort((a, b) => score(b) - score(a))[0] ?? null
  } catch {
    return null
  }
}
function say(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'tr-TR'
    u.rate = 0.88
    const v = bestTurkishVoice()
    if (v) u.voice = v
    globalThis.speechSynthesis.cancel()
    globalThis.speechSynthesis.speak(u)
  } catch {
    // ses yok: soru ekranda
  }
}

// onSave(kayıt), onExit()
export default function Gokyuzu({ sessions = [], onSave, onExit }) {
  const [part] = useState(() => partOfDay(new Date().getHours()))
  const [opts, setOpts] = useState(() => loadOpts())
  const [phase, setPhase] = useState('intro') // intro | run | after | result
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [record, setRecord] = useState(null)
  const [fact] = useState(() => factFor(sessions))
  const t0 = useRef(0)
  const lastPrompt = useRef(-1)
  const wake = useRef(null)
  const sceneRef = useRef(null)
  const ambRef = useRef(null)
  if (!ambRef.current) ambRef.current = createAmbience()
  const prompts = promptsFor(opts.env, part)
  const pi = promptIndex(elapsed, DURATION_SEC, prompts.length)

  const update = (patch) => setOpts((o) => { const n = { ...o, ...patch }; saveOpts(n); return n })
  async function keepAwake(on) {
    try {
      if (on) wake.current = await globalThis.navigator?.wakeLock?.request?.('screen')
      else { await wake.current?.release?.(); wake.current = null }
    } catch {
      wake.current = null
    }
  }
  useEffect(() => () => {
    ambRef.current?.close()
    wake.current?.release?.().catch?.(() => {})
    try { globalThis.speechSynthesis?.cancel() } catch { /* yok */ }
  }, [])

  // Mola sayacı: her yeni soruda sahne vurgusu ve (isteğe bağlı) sesli okuma
  useEffect(() => {
    if (phase !== 'run') return undefined
    const id = setInterval(() => {
      const e = (Date.now() - t0.current) / 1000
      setElapsed(e)
      const i = promptIndex(e, DURATION_SEC, prompts.length)
      if (i !== lastPrompt.current) {
        lastPrompt.current = i
        sceneRef.current?.highlight(prompts[i].hl)
        if (opts.voice && getPrefs().sound) say(prompts[i].text)
      }
      if (e >= DURATION_SEC) {
        clearInterval(id)
        sceneRef.current?.highlight(null)
        ambRef.current.stop()
        ambRef.current.chime()
        haptic('success')
        keepAwake(false)
        setPhase('after')
      }
    }, 250)
    return () => clearInterval(id)
  }, [phase, prompts, opts.voice])

  function start() {
    const amb = ambRef.current
    amb.unlock()
    if (opts.sound) amb.start(opts.env)
    try { globalThis.speechSynthesis?.getVoices() } catch { /* yok */ }
    t0.current = Date.now()
    lastPrompt.current = -1
    setElapsed(0)
    setAfter(null)
    keepAwake(true)
    setPhase('run')
  }
  function stop() {
    keepAwake(false)
    ambRef.current.stop()
    sceneRef.current?.highlight(null)
    try { globalThis.speechSynthesis?.cancel() } catch { /* yok */ }
    const e = (Date.now() - t0.current) / 1000
    if (e < MIN_SAVE_SEC) { setPhase('intro'); return }
    setElapsed(e)
    setPhase('after')
  }
  function save() {
    const rec = makeRecord({ before, after, seconds: Math.min(elapsed, DURATION_SEC), part, env: opts.env })
    setRecord(rec)
    onSave?.(rec)
    haptic('success')
    setPhase('result')
  }

  if (phase === 'intro' || phase === 'run') {
    const run = phase === 'run'
    const left = Math.max(0, DURATION_SEC - elapsed)
    return (
      <main className={`gk-stage${run ? ' run' : ''}`} aria-label="Gökyüzü molası">
        <SceneCanvas env={opts.env} part={part} sceneRef={sceneRef} className="gk-canvas" />
        <div className="gk-veil" />
        {run ? (
          <div className="gk-in">
            <div className="gk-hud">
              <div className="gk-bar"><i style={{ width: `${Math.min(100, (elapsed / DURATION_SEC) * 100)}%` }} /></div>
              <span className="t">{fmt(Math.ceil(left))}</span>
            </div>
            <div className="grow" style={{ flex: 0.55 }} />
            <p className="gk-stepn">{pi + 1} / {prompts.length}</p>
            <p className="gk-prompt" key={`${pi}-${opts.env}`} aria-live="polite">{prompts[pi].text}</p>
            <div className="grow" />
            <button className="gk-ghost" onClick={stop}>Bitir</button>
          </div>
        ) : (
          <div className="gk-in scroll">
            <div className="gk-top"><button className="gk-x" onClick={onExit} aria-label="Çık"><X size={20} /></button><span className="gk-ey">Gökyüzü molası · 2 dk · {SKY[part].label}</span></div>
            <h1 className="gk-h light">Şu an nereye bakabiliyorsun?</h1>
            <div className="gk-envs" role="radiogroup" aria-label="Manzara">
              {ENVS.map((e) => (
                <button key={e} type="button" role="radio" className="gk-env" aria-checked={opts.env === e} onClick={() => update({ env: e })}>
                  <SceneCanvas env={e} part={part} mini />
                  <span>{ENV_LABEL[e]}</span>
                </button>
              ))}
            </div>
            <div className="gk-glass gk-opts">
              <div className="gk-opt"><span>Arka plan sesi</span>
                <div className="gk-seg"><button type="button" aria-pressed={opts.sound} onClick={() => update({ sound: true })}>{AMBIENCE_LABEL[opts.env]}</button><button type="button" aria-pressed={!opts.sound} onClick={() => update({ sound: false })}>Kapalı</button></div>
              </div>
              <div className="gk-opt"><span>Soruları sesli oku</span>
                <div className="gk-seg"><button type="button" aria-pressed={opts.voice} onClick={() => update({ voice: true })}>Açık</button><button type="button" aria-pressed={!opts.voice} onClick={() => update({ voice: false })}>Kapalı</button></div>
              </div>
            </div>
            <div className="gk-sun"><span aria-hidden="true">☀️</span><p><b>Güneşe asla doğrudan bakma.</b> Güneşin olmadığı yöne bak.</p></div>
            <span className="gk-lbl light">Şu an ne kadar dinlenmiş hissediyorsun?</span>
            <Scale value={before} onChange={setBefore} label="Dinlenmişlik, önce" glass />
            <details className="gk-why gk-glass">
              <summary>Bu işe yarıyor mu?</summary>
              <p>Doğrudan "gökyüzüne bakmak" üzerine bir çalışma bulamadık. Mola yakın kanıtlara dayanıyor: 3 dk doğa görmek rahatlattı (randomize, 30 kişi); hayranlık yürüyüşü günlük sıkıntıyı azalttı ama depresyonu değiştirmedi (randomize, 60 kişi); uzağa bakma molası ekran yorgunluğunu azalttı (29 kişi, kontrol grubu yok); doğa sesleri 18 çalışmada stresi azalttı (gerçek kayıtlarla; buradaki ses uygulamada üretiliyor). Kendi puanın, sana işe yarayıp yaramadığını gösterecek.</p>
              <SourceList ids={SOURCE_IDS} />
            </details>
            <div className="grow" />
            <button className="gk-go" disabled={before == null} onClick={start}>Başla</button>
          </div>
        )}
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

  // result
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
