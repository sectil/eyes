import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Crosshair, RotateCcw, ScanFace, Share2, X } from 'lucide-react'
import SoundToggle from '../components/SoundToggle.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { calibReport, fitModel, saveGazeModel, headRef, headTurned, TARGETS, DOWN_CLOSE_MAX, MIN_SCORE, HEAD_TURN_DEG } from '../lib/gazeCalib.js'
import { shareText } from '../lib/share.js'
import { createGazeReader, eyeClosure, BLINK_CLOSE, GAZE_FULL_DEG } from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { cue, unlockAudio } from '../lib/cue.js'
import '../styles/gazecal.css'

// 5 noktalı kişisel göz kalibrasyonu (lib/gazeCalib.js, model sürüm 2).
// Orta: ekrandaki noktaya bakılır. Sol/sağ/yukarı/aşağı: telefonun o yanından DIŞARI, bir karış
// öteye bakılır (başı çevirmeden). Ekran kenarı yetmiyordu: ~30 cm'de ekranın yan kenarları yalnızca
// ~±5° göz dönüşü veriyor, ARKit gürültüsüyle ayrılamadı (Build 7'de 3 denemede de "sağ–sol ayırt
// edilemedi"). Dışarı bakış ~20°. Kullanıcı o sırada ekranı göremez: yön sesle söylenir, her hedef
// bitince titreşim gelir.
// Her hedefte: MOVE_MS geçiş + SETTLE_MS yerleşme (kayıt yok) + COLLECT_MS kayıt.
// Yüz görünmez ya da gözler kapalıysa kayıt süresi durur (kareler atılır).
// VARSAYIM: süreler ilk sürüm içindir (toplam ~20 sn); yerleşme sesli yönergenin söylenme süresine göre.
const MOVE_MS = 450
const SETTLE_MS = 1200
const COLLECT_MS = 1300
// Aşağı bakışta göz kapağı iner; o hedefte "kapalı" eşiği yüksek (gerçek kırpma yine elenir).
const closeLimit = (t) => (t === 'down' ? DOWN_CLOSE_MAX : BLINK_CLOSE)
// Baş dönüşü uyarısı (ses + titreşim) en az bu aralıkla tekrarlanır
const HEAD_WARN_GAP_MS = 2500

// Hedef konumları (ekran yüzdesi). Kullanıcı ekrandaki noktayı gözüyle takip eder; ekran dışına
// bakması istenmez (Build 10 geri bildirimi: "kimse telefondan dışarı bakmaz, noktayı takip eder").
// Sağ–sol hedef arası ~10°, üst–alt ~18° (35 cm'de). Model bu kenarları ±GAZE_FULL_DEG sayar.
const POS = {
  center: { x: 50, y: 46 },
  left: { x: 8, y: 46 },
  right: { x: 92, y: 46 },
  up: { x: 50, y: 12 },
  down: { x: 50, y: 84 },
  center2: { x: 50, y: 46 },
}
const LABEL = {
  center: 'Noktaya bak',
  left: 'Soldaki noktaya bak',
  right: 'Sağdaki noktaya bak',
  up: 'Üstteki noktaya bak',
  down: 'Alttaki noktaya bak',
  center2: 'Tekrar ortadaki noktaya bak',
}
// Sesli yönlendirme kısa; nokta zaten ekranda. Ses düğmesiyle kapatılabilir (Profil'deki "Sesler" tercihi).
const SAY = {
  center: 'Ortadaki noktaya bak',
  left: 'Sol',
  right: 'Sağ',
  up: 'Yukarı',
  down: 'Aşağı',
  center2: 'Tekrar orta',
}

export default function GazeCalibration({ onDone, onSkip, onCancel }) {
  const [phase, setPhase] = useState('intro') // intro | run | result
  const [idx, setIdx] = useState(0)
  const [prog, setProg] = useState(0) // hedefteki kayıt ilerlemesi 0..1
  const [status, setStatus] = useState('ok') // ok | noface | closed | head
  // Orta hedefteki baş duruşu; sonraki hedeflerde baş bundan HEAD_TURN_DEG'den çok dönerse kare sayılmaz
  const head = useRef({ ref: null, rejected: {}, lastWarn: 0 })
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState({ x: 0, y: 0, dir: null })
  const [report, setReport] = useState(null)
  const [note, setNote] = useState('')
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
    const closed = face && eyeClosure(m) >= closeLimit(t)
    const turned = face && !closed && t !== 'center' && headTurned(head.current.ref, m)
    const nextStatus = !face ? 'noface' : closed ? 'closed' : turned ? 'head' : 'ok'
    setStatus((p) => (p === nextStatus ? p : nextStatus))
    if (turned && since >= MOVE_MS + SETTLE_MS) {
      head.current.rejected[t] = (head.current.rejected[t] ?? 0) + 1
      if (now - head.current.lastWarn >= HEAD_WARN_GAP_MS) {
        head.current.lastWarn = now
        cue('Başını değil, gözünü oynat', true)
      }
    }
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
      if (t === 'center') head.current.ref = headRef(win.current.center)
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
    head.current = { ref: null, rejected: {}, lastWarn: 0 }
    step.current = { idx: 0, start: performance.now(), collected: 0, lastTs: null }
    setIdx(0)
    setProg(0)
    setResult(null)
    setReport(null)
    setNote('')
    setPhase('run')
    cue(SAY.center, false)
  }

  async function share() {
    const payload = JSON.stringify({ app: 'EyeTrail', kind: 'gaze-calib', build: import.meta.env.VITE_APP_BUILD ?? 'web', ...report })
    const r = await shareText('EyeTrail kalibrasyon verisi', payload)
    setNote(r === 'shared' ? 'Paylaşıldı.' : r === 'copied' ? 'Panoya kopyalandı. Mesaja yapıştırıp gönderebilirsin.' : 'Kopyalanamadı.')
  }

  function finish() {
    const model = fitModel(win.current)
    setResult(model)
    setReport({ ...calibReport(win.current, model), headRejected: head.current.rejected })
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
          Herkesin gözü farklı hareket eder. Ekranda bir nokta gezinecek: orta, sol, sağ, üst, alt.
          <strong> Noktayı yalnızca gözünle takip et; başını çevirme.</strong> Yaklaşık 20 saniye sürer, bir kez yapılır.
        </p>
        <ul className="gazecal-tips">
          <li>Telefonu yüzünün karşısında, göz hizasında sabit tut; yüzün iyi aydınlansın.</li>
          <li>Her nokta bitince telefon kısa titrer; nokta yeni yerine geçer.</li>
          <li>Başın dönerse uyarırım; o anlar sayılmaz.</li>
          <li>Göz kırpmak sorun değil, o anlar da sayılmaz.</li>
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
            <p className="muted">Dene: ekranın bir kenarına bak, nokta o yöne gitmeli. Ortaya bakınca ortada kalır.</p>
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
              Başını sabit tut; noktayı yalnızca gözünle takip et ve titreşime kadar noktada kal.
            </p>
            {headTurnNote(report)}
            <div className="gazetest-grid gazecal-scores">
              <span>Sağ–sol ayrışma</span><span className={result?.x && !result.x.weak ? 'hl' : ''}>{scoreText(result?.x)}</span>
              <span>Yukarı–aşağı ayrışma</span><span className={result?.y && !result.y.weak ? 'hl' : ''}>{scoreText(result?.y)}</span>
            </div>
            <button className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Tekrar dene</button>
            {report && (
              <button className="btn btn-ghost" onClick={share}>
                {navigator.share ? <Share2 size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} Verileri paylaş
              </button>
            )}
            {note && <p className="muted small" role="status" style={{ textAlign: 'center' }}>{note}</p>}
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
      <SoundToggle className="gazecal-sound" />
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
        {!cam.ready ? 'Kamera açılıyor…' : cam.error ? 'Kamera açılamadı' : status === 'noface' ? 'Yüzünü kameraya göster' : status === 'closed' ? 'Gözlerini aç' : status === 'head' ? 'Başını çevirme, yalnızca gözünü kaydır' : LABEL[t] ?? 'Noktaya bak'}
      </p>
    </div>
  )
}

const DIR_LABEL = { left: '← Sol', right: 'Sağ →', up: '↑ Yukarı', down: '↓ Aşağı', center: 'Orta' }

// Baş dönüşü yüzünden sayılmayan kare varsa söyle (yalnızca sayı; yeni eklentide gelir)
function headTurnNote(report) {
  const rej = report?.headRejected ?? {}
  const n = Object.values(rej).reduce((a, b) => a + b, 0)
  if (n < 10) return null
  const where = TARGETS.filter((t) => rej[t] > 0).map((t) => DIR_LABEL[t] ?? t).join(', ')
  return (
    <p className="muted small">
      Başın {HEAD_TURN_DEG}°'den fazla döndüğü için {n} kareyi saymadım ({where}). Başını sabit tutup yalnızca gözünü kaydırmayı dene.
    </p>
  )
}

// Eksen skoru: ayrışma / gürültü (en az MIN_SCORE gerekir)
function scoreText(axis) {
  if (!axis) return 'veri yok'
  return `${axis.score.toFixed(1)} / ${MIN_SCORE}`
}
