import { useEffect, useRef, useState } from 'react'
import { X, Trophy, Eye, Timer, ScanFace, Play, RotateCcw, Share2, Copy, Info as InfoIcon } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createGazeReader } from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { cue, unlockAudio } from '../lib/cue.js'
import { playSfx, unlockSfx } from '../lib/sfx.js'
import { shareText } from '../lib/share.js'
import {
  SPOTS,
  SPEEDS,
  JUMPS,
  nextSpot,
  wordAt,
  createFollowDetector,
  scoreOf,
  offScreen,
  loadTrackBest,
  saveTrackBest,
  trackBestFromSessions,
  loadTrackSpeed,
  saveTrackSpeed,
} from '../lib/track.js'
import '../styles/track.css'
import SoundToggle from '../components/SoundToggle.jsx'
import { requestEyeRound } from '../lib/eyeBudgetStore.js'

// Çember takibi — göz pratiği (lib/track.js). Çember kenar ve köşe noktaları arasında atlar; içinde
// kısa bir söz yazar. Kişi gözüyle izler ve sözü okur. Her atlamada çok hafif tık (titreşim + ses).
// TrueDepth varsa: atlamadan sonra gözün o yöne hareket edip etmediği ve tepki süresi ölçülür;
// ekrana bakmıyorsa (yüz yok ya da bakış ekranın dışında) oyun durur ve "Ekrana bak" uyarısı verilir.
// Görmeyi ölçmez; skoru görme trendine katılmaz.
//
// VARSAYIM: süreler ilk sürüm içindir.
const AWAY_MS = 1500 // bu kadar ekran dışı/yüz yok → duraklat ve uyar (kırpma ve kısa kayma sayılmaz)
const RESUME_MS = 400 // ekrana bu kadar dönünce devam
const WARN_GAP_MS = 4000 // uyarılar arası en az süre
const COUNT_MS = 800 // geri sayım adımı
const PAD = 38 // noktaların merkezden en uzak konumu (%); 96 px çember kenara taşmasın

const pos = (s) => ({ left: `${50 + s.x * PAD}%`, top: `${50 - s.y * PAD}%` })

export default function TrackGame({ trueDepth = false, sessions = [], onExit, onFinish }) {
  const [phase, setPhase] = useState('intro') // intro | countdown | play | paused | result
  const [speed, setSpeedState] = useState(() => loadTrackSpeed())
  const [best, setBest] = useState(() => Math.max(loadTrackBest(), trackBestFromSessions(sessions)))
  const [count, setCount] = useState(3)
  const [spot, setSpot] = useState(null)
  const [n, setN] = useState(0)
  const [hitN, setHitN] = useState(0) // takip edilen atlamanın sırası → çemberde kısa yeşil halka
  const [result, setResult] = useState(null)
  const [note, setNote] = useState('')
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const spotRef = useRef(null)
  const nRef = useRef(0)
  const timer = useRef(0)
  const det = useRef(null)
  const reader = useRef(null)
  const away = useRef({ since: null, back: null, lastWarn: -Infinity })
  const playMs = useRef({ total: 0, since: null })
  const camOk = useRef(false) // bu turda kameradan en az bir yüz karesi geldi

  const setSpeed = (s) => {
    setSpeedState(s)
    saveTrackSpeed(s)
  }

  const go = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  const clock = () => performance.now()
  function runClock(on) {
    const c = playMs.current
    if (on && c.since == null) c.since = clock()
    if (!on && c.since != null) {
      c.total += clock() - c.since
      c.since = null
    }
  }

  function onFrame(m) {
    const p = phaseRef.current
    if (p !== 'countdown' && p !== 'play' && p !== 'paused') return
    const g = reader.current.push(m)
    if (m.face) camOk.current = true
    if (p === 'play') {
      const v = g.tracked && !g.closed && g.dir != null ? g.v : null
      if (det.current.push(v, m.ts) === 'followed') setHitN(nRef.current)
    }
    // Ekrana bakmıyor mu? (yüz yok = bakmıyor; bilinmiyorsa — kırpma — durum değişmez)
    const off = !m.face ? true : offScreen(g)
    const a = away.current
    if (off === true) {
      a.since ??= m.ts
      a.back = null
    } else if (off === false) {
      a.since = null
      a.back ??= m.ts
    }
    if (p === 'play' && a.since != null && m.ts - a.since >= AWAY_MS) pause(m.ts)
    else if (p === 'paused') {
      if (a.since != null && m.ts - a.lastWarn >= WARN_GAP_MS) warn(m.ts)
      if (off === false && a.back != null && m.ts - a.back >= RESUME_MS) resume()
    }
  }

  const cam = useFaceTracking({ enabled: trueDepth && (phase === 'countdown' || phase === 'play' || phase === 'paused'), trueDepth: true, onFrame })
  const measuring = trueDepth && !cam.error

  function warn(ts) {
    away.current.lastWarn = ts
    cue('Ekrana bak', true) // uyarı titreşimi + ses (ses kapalıysa yalnızca titreşim)
  }

  function start() {
    // Göz bütçesi dolduysa yeni tur başlamaz; App mola ekranını açar (lib/eyeBudgetStore.js)
    if (!requestEyeRound()) return
    unlockAudio()
    unlockSfx()
    clearTimeout(timer.current)
    reader.current = createGazeReader()
    det.current = createFollowDetector({ windowMs: Math.min(900, SPEEDS[speed].ms - 100) })
    away.current = { since: null, back: null, lastWarn: -Infinity }
    playMs.current = { total: 0, since: null }
    camOk.current = false
    spotRef.current = null
    nRef.current = 0
    setN(0)
    setHitN(0)
    setSpot(null)
    setResult(null)
    setNote('')
    setCount(3)
    go('countdown')
    playSfx('count')
  }

  // Geri sayım
  useEffect(() => {
    if (phase !== 'countdown') return undefined
    const t = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1)
        playSfx('count')
      } else {
        playSfx('start')
        go('play')
        runClock(true)
        jump()
      }
    }, COUNT_MS)
    return () => clearTimeout(t)
  }, [phase, count])

  function jump() {
    if (phaseRef.current !== 'play') return
    if (nRef.current >= JUMPS) {
      finish()
      return
    }
    const from = spotRef.current
    const to = nextSpot(from)
    if (from != null) det.current.jump(from, to, clock())
    spotRef.current = to
    nRef.current += 1
    setSpot(to)
    setN(nRef.current)
    haptic('tick')
    playSfx('turn')
    timer.current = setTimeout(jump, SPEEDS[speed].ms)
  }

  function pause(ts) {
    clearTimeout(timer.current)
    runClock(false)
    go('paused')
    away.current.back = null
    warn(ts)
  }

  function resume() {
    away.current = { since: null, back: null, lastWarn: away.current.lastWarn }
    playSfx('resume')
    go('play')
    runClock(true)
    // Duraklamadan dönüşte önceki deneme sayılmaz: yeni atlama, taban yeni bakıştan
    timer.current = setTimeout(jump, 350)
  }

  function finish() {
    clearTimeout(timer.current)
    runClock(false)
    const summary = det.current.finish()
    const measured = measuring && camOk.current && summary.measured > 0
    const score = measured ? scoreOf(summary, speed) : null
    const prev = best
    const newBest = score != null ? Math.max(prev, saveTrackBest(score)) : prev
    setBest(newBest)
    const seconds = Math.round(playMs.current.total / 1000)
    const res = { summary, score, record: score != null && score > prev && score > 0, measured, seconds, trials: det.current.trials }
    setResult(res)
    go('result')
    if (res.record) playSfx('record')
    haptic('success')
    try {
      onFinish?.({
        type: 'game',
        game: 'track',
        score,
        best: newBest || null,
        seconds,
        speed,
        followPct: measured ? summary.pct : null,
        reactMs: measured ? summary.reactMs : null,
        control: measured ? 'eyes' : null,
      })
    } catch {
      // kayıt hatası oyunu durdurmasın
    }
  }

  function exit() {
    clearTimeout(timer.current)
    onExit?.()
  }

  // Uygulama arka plana giderse duraklat
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible' && phaseRef.current === 'play') pause(clock())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      clearTimeout(timer.current)
    }
  }, [])

  async function share() {
    const r = result
    const payload = JSON.stringify({
      app: 'EyeTrail',
      kind: 'track-debug',
      build: import.meta.env.VITE_APP_BUILD ?? 'web',
      speed,
      summary: r?.summary,
      trials: r?.trials,
    })
    const s = await shareText('EyeTrail çember takibi verisi', payload)
    setNote(s === 'shared' ? 'Paylaşıldı.' : s === 'copied' ? 'Panoya kopyalandı.' : 'Kopyalanamadı.')
  }

  // --- Giriş ---
  if (phase === 'intro') {
    return (
      <main className="screen track-intro fade-in">
        <div className="row between">
          <button type="button" className="btn-icon" onClick={exit} aria-label="Kapat"><X size={20} /></button>
          <span className="eyebrow">Göz pratiği</span>
          <SoundToggle />
        </div>
        <section className="card card-hero track-hero">
          <div className="track-hero-art" aria-hidden="true">
            {SPOTS.map((s, i) => <i key={i} style={pos(s)} className={i === 2 ? 'on' : ''} />)}
          </div>
          <div className="stack" style={{ gap: 4 }}>
            <h1>Çember takibi</h1>
            <p className="muted small">Çember atladıkça gözünle izle, içindeki sözü oku.</p>
          </div>
          <div className="track-best-row">
            <Trophy size={18} aria-hidden="true" />
            <span className="grow">En yüksek skor</span>
            <strong>{best > 0 ? best : '—'}</strong>
          </div>
        </section>

        <section className="card stack" style={{ gap: 8 }}>
          <span className="eyebrow">Hız</span>
          <div className="segmented" role="group" aria-label="Hız">
            {Object.values(SPEEDS).map((s) => (
              <button key={s.id} type="button" aria-pressed={speed === s.id} onClick={() => setSpeed(s.id)}>{s.label}</button>
            ))}
          </div>
          <p className="muted small">Hızlandıkça her takip daha çok puan verir. Bir tur {JUMPS} atlama.</p>
        </section>

        <section className="card">
          <h3>Nasıl yapılır</h3>
          <ul className="track-howto">
            <li><ScanFace size={18} aria-hidden="true" /> Telefonu yüzünün karşısında tut, başını sabit tut.</li>
            <li><Eye size={18} aria-hidden="true" /> Başını çevirmeden, yalnızca gözünle çembere atla.</li>
            {measuring ? (
              <li><Timer size={18} aria-hidden="true" /> Kamera, gözünün çembere ne kadar hızlı geçtiğini ölçer. Ekrandan başka yere bakarsan oyun durur.</li>
            ) : (
              <li><Timer size={18} aria-hidden="true" /> Bu cihazda kamera takibi yok; ritimle izle, puan tutulmaz.</li>
            )}
          </ul>
        </section>

        <p className="note"><InfoIcon size={16} aria-hidden="true" /> Eğlence ve bakış kontrolü pratiği. Görmeyi ölçmez, iyileştirdiği iddia edilmez.</p>
        <button type="button" className="btn" onClick={start}><Play size={18} aria-hidden="true" /> Başla</button>
      </main>
    )
  }

  // --- Sonuç ---
  if (phase === 'result' && result) {
    const s = result.summary
    return (
      <main className="screen track-result fade-in">
        <div className="row between">
          <button type="button" className="btn-icon" onClick={exit} aria-label="Kapat"><X size={20} /></button>
          <span className="eyebrow">Çember takibi · {SPEEDS[speed].label}</span>
          <span style={{ width: 40 }} aria-hidden="true" />
        </div>
        {result.measured ? (
          <section className="card card-hero track-score">
            {result.record && <span className="badge track-record"><Trophy size={12} aria-hidden="true" /> Yeni rekor</span>}
            <span className="track-score-big">{result.score}</span>
            <span className="muted">puan · en iyi {best > 0 ? best : '—'}</span>
            <div className="track-stats">
              <div><strong>{s.pct != null ? `%${s.pct}` : '—'}</strong><span>takip edilen atlama</span></div>
              <div><strong>{s.reactMs != null ? `${s.reactMs} ms` : '—'}</strong><span>ortanca tepki</span></div>
              <div><strong>{s.followed}/{s.measured}</strong><span>ölçülen atlama</span></div>
            </div>
          </section>
        ) : (
          <section className="card card-hero track-score">
            <span className="track-score-big">{JUMPS}</span>
            <span className="muted">atlama izlendi · kamera ölçümü yok</span>
          </section>
        )}
        <p className="muted small">Tepki süresi kameranın yumuşatmasını da içerir; yaklaşık bir değerdir ve görme ölçüsü değildir.</p>
        <button type="button" className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Tekrar</button>
        <button type="button" className="btn btn-ghost" onClick={exit}>Bitir</button>
        {result.measured && (
          <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={share}>
            {navigator.share ? <Share2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} Verileri paylaş
          </button>
        )}
        {note && <p className="muted small" role="status" style={{ textAlign: 'center' }}>{note}</p>}
      </main>
    )
  }

  // --- Oyun alanı ---
  const cur = spot != null ? SPOTS[spot] : null
  return (
    <div className="track-stage" role="application" aria-label="Çember takibi">
      <div className="track-top">
        <button type="button" className="btn-icon" onClick={exit} aria-label="Çık"><X size={20} /></button>
        <div className="track-progress" aria-hidden="true"><i style={{ width: `${(n / JUMPS) * 100}%` }} /></div>
        <span className="track-count">{n}/{JUMPS}</span>
      </div>
      <div className="track-board">
        {SPOTS.map((s, i) => <i key={i} className="track-spot" style={pos(s)} />)}
        {cur && (
          <div key={n} className={`track-ball ${hitN === n ? 'hit' : ''}`} style={pos(cur)}>
            <span>{wordAt(n)}</span>
          </div>
        )}
        {phase === 'countdown' && (
          <div className="track-overlay is-light" role="status">
            <span className="track-count-big" key={count}>{count}</span>
            <span className="muted">Ekrana bak, başını sabit tut</span>
          </div>
        )}
        {phase === 'paused' && (
          <div className="track-overlay" role="alert">
            <span className="track-warn-icon"><ScanFace size={26} aria-hidden="true" /></span>
            <h2>Ekrana bak</h2>
            <p className="muted small">{cam.face ? 'Bakışın ekranın dışında. Ekrana dönünce devam edeceğim.' : 'Yüzün görünmüyor. Telefonu yüzüne dönük tut.'}</p>
          </div>
        )}
      </div>
      {measuring && phase === 'play' && !cam.ready && <p className="track-hint">Kamera açılıyor…</p>}
    </div>
  )
}
