import { useEffect, useRef, useState } from 'react'
import { Check, Crosshair, RotateCcw, ScanFace, X } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { fitModel, saveGazeModel, TARGETS } from '../lib/gazeCalib.js'
import { createGazeReader, eyeClosure, BLINK_CLOSE, GAZE_FULL_DEG } from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { cue, unlockAudio } from '../lib/cue.js'
import '../styles/gazecal.css'

// 5 noktalı kişisel göz kalibrasyonu (lib/gazeCalib.js). Nokta sırayla ortaya, sola, sağa, yukarı,
// aşağı ve yeniden ortaya gider; kullanıcı başını çevirmeden gözüyle bakar.
// Her hedefte: MOVE_MS geçiş + SETTLE_MS yerleşme (kayıt yok) + COLLECT_MS kayıt.
// Yüz görünmez ya da gözler kapalıysa kayıt süresi durur (kareler atılır).
// VARSAYIM: süreler ilk sürüm içindir (toplam ~14 sn).
const MOVE_MS = 450
const SETTLE_MS = 650
const COLLECT_MS = 1300

// Hedef konumları (ekran yüzdesi). Kenarlara yakın: göz hareketi büyük olsun.
const POS = {
  center: { x: 50, y: 46 },
  left: { x: 9, y: 46 },
  right: { x: 91, y: 46 },
  up: { x: 50, y: 10 },
  down: { x: 50, y: 86 },
  center2: { x: 50, y: 46 },
}
const SAY = { center: 'Ortadaki noktaya bak', left: 'Sola', right: 'Sağa', up: 'Yukarı', down: 'Aşağı', center2: 'Tekrar ortaya' }

export default function GazeCalibration({ onDone, onSkip, onCancel }) {
  const [phase, setPhase] = useState('intro') // intro | run | result
  const [idx, setIdx] = useState(0)
  const [prog, setProg] = useState(0) // hedefteki kayıt ilerlemesi 0..1
  const [status, setStatus] = useState('ok') // ok | noface | closed
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState({ x: 0, y: 0, dir: null })
  const win = useRef({})
  const step = useRef({ idx: 0, start: 0, collected: 0, lastTs: null })
  const running = phase === 'run'
  const previewReader = useRef(null)

  const onFrame = (m) => {
    if (phase === 'result' && previewReader.current) {
      const g = previewReader.current.push(m)
      setPreview({ x: g.v.x, y: g.v.y, dir: g.dir })
      return
    }
    if (!running) return
    const s = step.current
    const t = TARGETS[s.idx]
    if (!t) return
    const now = m.ts
    const since = now - s.start
    const face = m.face !== false && m.tracked !== false
    const closed = face && eyeClosure(m) >= BLINK_CLOSE
    const nextStatus = !face ? 'noface' : closed ? 'closed' : 'ok'
    setStatus((p) => (p === nextStatus ? p : nextStatus))
    if (since < MOVE_MS + SETTLE_MS) {
      s.lastTs = now
      return
    }
    if (nextStatus === 'ok') {
      const dt = s.lastTs == null ? 0 : Math.min(now - s.lastTs, 100)
      s.collected += dt
      ;(win.current[t] ??= []).push(m)
    }
    s.lastTs = now
    setProg(Math.min(1, s.collected / COLLECT_MS))
    if (s.collected >= COLLECT_MS) {
      haptic('tick')
      const ni = s.idx + 1
      if (ni >= TARGETS.length) {
        step.current = { ...s, idx: TARGETS.length } // sonraki kareler yeniden bitirmesin
        finish()
      }
      else {
        step.current = { idx: ni, start: now, collected: 0, lastTs: null }
        setIdx(ni)
        setProg(0)
        cue(SAY[TARGETS[ni]], false)
      }
    }
  }

  const cam = useFaceTracking({ enabled: phase !== 'intro', trueDepth: true, onFrame })

  function start() {
    unlockAudio()
    win.current = {}
    step.current = { idx: 0, start: performance.now(), collected: 0, lastTs: null }
    setIdx(0)
    setProg(0)
    setResult(null)
    setPhase('run')
    cue(SAY.center, false)
  }

  function finish() {
    const model = fitModel(win.current)
    setResult(model)
    setPhase('result')
    if (model.ok) {
      saveGazeModel(model)
      previewReader.current = createGazeReader({ model })
      haptic('success')
      cue('Tamam, göz takibi sana göre ayarlandı', false)
    } else {
      haptic('warning')
    }
  }

  // Kareler gelmeye başlayınca ilk hedefin zamanını kameranın saatine hizala
  useEffect(() => {
    if (running && cam.ready) step.current.start = performance.now()
  }, [running, cam.ready])

  if (phase === 'intro') {
    return (
      <main className="screen fade-in gazecal-intro">
        <div className="row between">
          <button className="btn-icon" onClick={onCancel} aria-label="Kapat"><X size={20} /></button>
        </div>
        <div className="gazecal-hero"><Crosshair size={44} strokeWidth={1.6} /></div>
        <h1>Göz takibini sana göre ayarlayalım</h1>
        <p className="muted">
          Herkesin gözü farklı hareket eder. Ekranda bir nokta sırayla ortaya, sola, sağa, yukarı ve aşağı gidecek.
          <strong> Başını çevirmeden, yalnızca gözünle</strong> noktaya bak. Yaklaşık 15 saniye sürer, bir kez yapılır.
        </p>
        <ul className="gazecal-tips">
          <li>Telefonu yüzünün karşısında, rahat bir mesafede sabit tut.</li>
          <li>Yüzün iyi aydınlansın; gözlük takıyorsan çıkarmana gerek yok.</li>
          <li>Göz kırpmak sorun değil, o anlar sayılmaz.</li>
        </ul>
        <button className="btn" onClick={start}><ScanFace size={18} aria-hidden="true" /> Başla</button>
        {onSkip && <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onSkip}>Şimdi değil</button>}
      </main>
    )
  }

  if (phase === 'result') {
    const ok = result?.ok
    const px = Math.max(-1, Math.min(1, preview.x / GAZE_FULL_DEG))
    const py = Math.max(-1, Math.min(1, preview.y / GAZE_FULL_DEG))
    return (
      <main className="screen fade-in gazecal-result">
        {ok ? (
          <>
            <div className="gazecal-badge ok"><Check size={30} /></div>
            <h1>Hazır</h1>
            <p className="muted">Şimdi gözünü gezdir: nokta seninle birlikte hareket etmeli.</p>
            <div className={`gazecal-pad ${preview.dir && preview.dir !== 'center' ? 'on' : ''}`} aria-hidden="true">
              <span className="gazecal-cross" />
              <span className="gazecal-live" style={{ left: `${50 + px * 42}%`, top: `${50 - py * 42}%` }} />
            </div>
            <p className="gazecal-dir">{DIR_LABEL[preview.dir] ?? 'Ekrana bak'}</p>
            <button className="btn" onClick={() => onDone(result)}>Devam</button>
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={start}><RotateCcw size={15} aria-hidden="true" /> Yeniden ayarla</button>
          </>
        ) : (
          <>
            <div className="gazecal-badge warn"><RotateCcw size={28} /></div>
            <h1>Bir kez daha deneyelim</h1>
            <p className="muted">
              {!result?.x || result.x.weak ? 'Sağa ve sola bakışı ayırt edemedim. ' : ''}
              {!result?.y || result.y.weak ? 'Yukarı ve aşağı bakışı ayırt edemedim. ' : ''}
              Başını sabit tutup yalnızca gözünü, noktanın gittiği kenara kadar kaydır.
            </p>
            <button className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Tekrar dene</button>
            {onSkip && <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onSkip}>Şimdi değil</button>}
          </>
        )}
      </main>
    )
  }

  const t = TARGETS[idx]
  const p = POS[t]
  return (
    <div className="gazecal-stage" role="application" aria-label="Göz kalibrasyonu">
      <button className="btn-icon gazecal-close" onClick={onCancel} aria-label="Kapat"><X size={20} /></button>
      <div className="gazecal-steps" aria-hidden="true">
        {TARGETS.map((x, i) => <i key={x} className={i < idx ? 'done' : i === idx ? 'now' : ''} />)}
      </div>
      <div className="gazecal-target" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
        <svg viewBox="0 0 64 64" className="gazecal-ring">
          <circle cx="32" cy="32" r="28" className="bg" />
          <circle cx="32" cy="32" r="28" className="fg" style={{ strokeDasharray: `${prog * 176} 176` }} />
        </svg>
        <span className="gazecal-dot" />
      </div>
      <p className="gazecal-msg" role="status" aria-live="polite">
        {!cam.ready ? 'Kamera açılıyor…' : cam.error ? 'Kamera açılamadı' : status === 'noface' ? 'Yüzünü kameraya göster' : status === 'closed' ? 'Gözlerini aç' : 'Başını çevirmeden noktaya bak'}
      </p>
    </div>
  )
}

const DIR_LABEL = { left: '← Sol', right: 'Sağ →', up: '↑ Yukarı', down: '↓ Aşağı', center: 'Orta' }
