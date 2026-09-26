import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Crosshair, RotateCcw, ScanFace, Share2, X } from 'lucide-react'
import SoundToggle from '../components/SoundToggle.jsx'
import StepCards from '../components/StepCards.jsx'
import { DotFollowArt, FaceLightArt } from '../components/howtoArt.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { calibReport, fitModel, fitWindowsAxis, roughModel, windowStable, saveGazeModel, headRef, headTurned, TARGETS, DOWN_CLOSE_MAX, MIN_SCORE, HEAD_TURN_DEG } from '../lib/gazeCalib.js'
import { shareText } from '../lib/share.js'
import { createGazeReader, eyeClosure, BLINK_CLOSE, GAZE_FULL_DEG } from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { cue, unlockAudio } from '../lib/cue.js'
import '../styles/gazecal.css'

// 5 noktalı kişisel göz kalibrasyonu (lib/gazeCalib.js, model sürüm 2).
// Kullanıcı ekrandaki noktayı gözüyle takip eder (orta, sol, sağ, üst, alt, tekrar orta).
// Her hedefte: MOVE_MS geçiş + SETTLE_MS yerleşme (kayıt yok) + en az COLLECT_MS kayıt; kayıt
// penceresi "sabit bakış" olunca (windowStable) nokta YEŞİLE döner, titreşim gelir, sıradakine geçilir.
// Sabitlenmezse MAX_COLLECT_MS'e kadar beklenir, sonra eldeki kareler kabul edilir.
// Yüz görünmez, gözler kapalı ya da baş dönükse kayıt durur (kareler atılır).
// Sağ hedefi bitince sağ–sol ekseni hemen sınanır: zayıfsa yalnızca sol+sağ bir kez daha istenir
// (en fazla MAX_RETRY). Alt hedefte üst–alt için aynı. Sonda tüm model zayıfsa yalnızca zayıf eksenin
// noktaları + orta tekrar edilir; baştan alma yok (Build 15 geri bildirimi: "sonda tekrar dene saçma").
// Her tekrar turu ORTAYI da yeniden toplar: Build 15/19/30'da zayıf eksenin sebebi bayat ilk ortaydı
// (baş duruşu sonradan değişti); yalnız yan noktaları tekrarlamak bir şey değiştirmiyordu.
// Tüm tekrarlardan sonra skor MIN_SCORE_ROUGH üstündeyse kaba model kaydedilir (lib/gazeCalib.js roughModel).
// VARSAYIM: süreler ve MAX_RETRY ilk sürüm içindir; toplam ~20 sn (tekrarsız).
const MOVE_MS = 450
const SETTLE_MS = 1200
// İlk hedef: kullanıcı telefonu yeni tutuyor, duruşu oturuyor (Build 30: ilk ortada baş 6,8°, sonra 4–5,6°).
// VARSAYIM: 2,5 sn.
const FIRST_SETTLE_MS = 2500
const COLLECT_MS = 1300
const MAX_COLLECT_MS = 8000 // yan hedefler: bu sürede sabitlenmezse eldeki kareler alınır
const CENTER_HINT_MS = 6000 // orta hedef: asla kararsız kabul edilmez; bu süreden sonra ipucu
const ACCEPT_HOLD_MS = 450 // yeşil nokta görünür kalır
const MAX_RETRY = 2 // eksen başına ek tur
const ROLL_FRAMES = 60 // kararlılık beklerken tutulan son kare sayısı (~2 sn)
// Aşağı bakışta göz kapağı iner; o hedefte "kapalı" eşiği yüksek (gerçek kırpma yine elenir).
const closeLimit = (t) => (t === 'down' ? DOWN_CLOSE_MAX : BLINK_CLOSE)
// Baş dönüşü uyarısı (ses + titreşim) en az bu aralıkla tekrarlanır
const HEAD_WARN_GAP_MS = 2500
const AXIS_TARGETS = { x: ['left', 'right'], y: ['up', 'down'] }

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
  const [view, setView] = useState({ queue: TARGETS, pos: 0, again: false }) // ekrandaki hedef sırası
  const [prog, setProg] = useState(0) // hedefteki kayıt ilerlemesi 0..1
  const [status, setStatus] = useState('ok') // ok | noface | closed | head | hold | done
  // Orta hedefteki baş duruşu; sonraki hedeflerde baş bundan HEAD_TURN_DEG'den çok dönerse kare sayılmaz
  const head = useRef({ ref: null, rejected: {}, lastWarn: 0 })
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState({ x: 0, y: 0, dir: null })
  const [report, setReport] = useState(null)
  const [note, setNote] = useState('')
  const win = useRef({})
  const step = useRef({ queue: [...TARGETS], pos: 0, start: 0, collected: 0, lastTs: null, accepted: false, retry: { x: 0, y: 0 }, again: new Set() })
  const running = phase === 'run'
  const previewReader = useRef(null)
  const holdTimer = useRef(null)

  const onFrame = (m) => {
    if (phase === 'result' && previewReader.current) {
      const g = previewReader.current.push(m)
      setPreview({ x: g.v.x, y: g.v.y, dir: g.dir })
      return
    }
    if (!running) return
    const s = step.current
    if (s.accepted) return // yeşil nokta gösteriliyor; sıradaki hedef zamanlayıcıyla gelir
    const t = s.queue[s.pos]
    if (!t) return
    const now = m.ts
    const since = now - s.start
    const settle = MOVE_MS + (s.pos === 0 ? FIRST_SETTLE_MS : SETTLE_MS)
    const face = m.face !== false && m.tracked !== false
    const closed = face && eyeClosure(m) >= closeLimit(t)
    const turned = face && !closed && t !== 'center' && headTurned(head.current.ref, m)
    let nextStatus = !face ? 'noface' : closed ? 'closed' : turned ? 'head' : 'ok'
    if (turned && since >= settle) {
      head.current.rejected[t] = (head.current.rejected[t] ?? 0) + 1
      if (now - head.current.lastWarn >= HEAD_WARN_GAP_MS) {
        head.current.lastWarn = now
        cue('Başını değil, gözünü oynat', true)
      }
    }
    if (since < settle) {
      s.lastTs = now
      setStatus((p) => (p === nextStatus ? p : nextStatus))
      return
    }
    if (nextStatus === 'ok') {
      const dt = s.lastTs == null ? 0 : Math.min(now - s.lastTs, 100)
      s.collected += dt
      const fr = (win.current[t] ??= [])
      fr.push(m)
      if (fr.length > ROLL_FRAMES) fr.shift()
    }
    s.lastTs = now
    setProg(Math.min(1, s.collected / COLLECT_MS))
    if (s.collected >= COLLECT_MS) {
      const stable = windowStable(win.current[t])
      const isCenter = t === 'center' || t === 'center2'
      // Orta pencereleri referanstır (baş duruşu, eksen merkezi): kararsızken KABUL EDİLMEZ (Build 19: n=60,
      // MAD 1,5° çöp orta tüm eksenleri öldürdü). Yan hedeflerde süre dolunca eldeki alınır, raporda görünür.
      if (isCenter && !stable && s.collected >= CENTER_HINT_MS && now - head.current.lastWarn >= HEAD_WARN_GAP_MS) {
        head.current.lastWarn = now
        cue('Sabit dur ve noktaya bak', true)
      }
      if (stable || (!isCenter && s.collected >= MAX_COLLECT_MS)) {
        s.accepted = true
        setStatus('done')
        haptic('tick')
        holdTimer.current = setTimeout(() => advance(t), ACCEPT_HOLD_MS)
        return
      }
      nextStatus = 'hold' // süre doldu ama bakış henüz sabit değil
    }
    setStatus((p) => (p === nextStatus ? p : nextStatus))
  }

  // Hedef kabul edildi: eksen kontrolü, gerekirse tekrar hedefi ekle, sıradakine geç ya da bitir
  function advance(t) {
    const s = step.current
    const W = win.current
    if (t === 'center') head.current.ref = headRef(W.center)
    const insert = (axis, targets) => {
      s.retry[axis] += 1
      const at = s.pos + 1
      s.queue.splice(at, 0, ...targets)
      for (let i = 0; i < targets.length; i++) s.again.add(at + i)
      cue('Bir kez daha. Noktaya doğru bak; başını çevirmen serbest', true)
    }
    // Son modelle aynı hesap (usableCenters + baş duruşu düzeltmesi)
    const axisWeak = (axis) => {
      const a = fitWindowsAxis(W, axis)
      return !a || a.weak
    }
    if (t === 'right' && s.retry.x < MAX_RETRY && axisWeak('x')) insert('x', ['center', ...AXIS_TARGETS.x])
    else if (t === 'down' && s.retry.y < MAX_RETRY && axisWeak('y')) insert('y', ['center', ...AXIS_TARGETS.y])
    else if (t === 'center2') {
      const extra = []
      for (const axis of ['x', 'y']) {
        if (s.retry[axis] < MAX_RETRY && axisWeak(axis)) {
          s.retry[axis] += 1
          extra.push(...AXIS_TARGETS[axis])
        }
      }
      if (extra.length) {
        extra.unshift('center')
        extra.push('center2')
        const at = s.pos + 1
        s.queue.splice(at, 0, ...extra)
        for (let i = 0; i < extra.length; i++) s.again.add(at + i)
        cue('Bir kez daha. Noktaya doğru bak; başını çevirmen serbest', true)
      }
    }
    const np = s.pos + 1
    if (np >= s.queue.length) {
      s.pos = np
      finish()
      return
    }
    const nt = s.queue[np]
    W[nt] = [] // tekrar hedefinde eski kareler atılır
    step.current = { ...s, pos: np, start: performance.now(), collected: 0, lastTs: null, accepted: false }
    setView({ queue: [...s.queue], pos: np, again: s.again.has(np) })
    setProg(0)
    setStatus('ok')
    cue(SAY[nt], false)
  }

  const cam = useFaceTracking({ enabled: phase !== 'intro', trueDepth: true, onFrame })

  function start() {
    unlockAudio()
    clearTimeout(holdTimer.current)
    win.current = {}
    head.current = { ref: null, rejected: {}, lastWarn: 0 }
    step.current = { queue: [...TARGETS], pos: 0, start: performance.now(), collected: 0, lastTs: null, accepted: false, retry: { x: 0, y: 0 }, again: new Set() }
    setView({ queue: [...TARGETS], pos: 0, again: false })
    setProg(0)
    setStatus('ok')
    setResult(null)
    setReport(null)
    setNote('')
    setPhase('run')
    cue(SAY.center, false)
  }
  useEffect(() => () => clearTimeout(holdTimer.current), [])

  async function share() {
    const payload = JSON.stringify({ app: 'Nefona', kind: 'gaze-calib', build: import.meta.env.VITE_APP_BUILD ?? 'web', ...report })
    const r = await shareText('Nefona kalibrasyon verisi', payload)
    setNote(r === 'shared' ? 'Paylaşıldı.' : r === 'copied' ? 'Panoya kopyalandı. Mesaja yapıştırıp gönderebilirsin.' : 'Kopyalanamadı.')
  }

  function finish() {
    const fit = fitModel(win.current)
    const model = fit.ok ? fit : (roughModel(fit) ?? fit)
    setResult(model)
    setReport({ ...calibReport(win.current, model), headRejected: head.current.rejected, retry: { ...step.current.retry } })
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
        <StepCards
          cards={[
            { key: 'face', art: <FaceLightArt />, title: 'Telefonu göz hizasında tut', why: 'Yüzün iyi aydınlansın. Yaklaşık 20 saniye, bir kez.' },
            { key: 'dot', art: <DotFollowArt />, title: 'Noktaya bak, yeşile dönene kadar kal', why: 'Nokta beş yere gider. Başını noktaya doğru çevirmen serbest; kırpmak sorun değil.' },
          ]}
          eyebrow="Göz takibi · sana göre ayar"
          finishLabel="Başla"
          onFinish={start}
        />
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
            {result.rough && (
              <p className="muted small">
                {result.x.weak && result.y.weak ? 'Sağ–sol ve yukarı–aşağı' : result.x.weak ? 'Sağ–sol' : 'Yukarı–aşağı'} ayrımı biraz zayıf çıktı. Nokta o yönde titrek giderse aydınlık bir yerde, telefon göz hizasındayken yeniden ayarla.
              </p>
            )}
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
            <h1>Ayırt edemedim</h1>
            <p className="muted">
              {!result?.x || result.x.weak ? 'Sağa ve sola bakış, tekrarlara rağmen birbirinden ayrılmadı. ' : ''}
              {!result?.y || result.y.weak ? 'Yukarı ve aşağı bakış, tekrarlara rağmen birbirinden ayrılmadı. ' : ''}
              Işık yüzüne düşsün, telefon göz hizasında dursun; nokta yeşile dönene kadar noktada kal. Gözlükle zorlanıyorsa bir kez gözlüksüz dene.
            </p>
            {headTurnNote(report)}
            <div className="gazetest-grid gazecal-scores">
              <span>Sağ–sol ayrışma</span><span className={result?.x && !result.x.weak ? 'hl' : ''}>{scoreText(result?.x)}</span>
              <span>Yukarı–aşağı ayrışma</span><span className={result?.y && !result.y.weak ? 'hl' : ''}>{scoreText(result?.y)}</span>
            </div>
            <button className="btn" onClick={start}><RotateCcw size={18} aria-hidden="true" /> Yeniden ayarla</button>
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

  const t = view.queue[view.pos] ?? 'center'
  const p = POS[t]
  const done = status === 'done'
  return (
    <div className="gazecal-stage" role="application" aria-label="Göz kalibrasyonu">
      <button className="btn-icon gazecal-close" onClick={onCancel} aria-label="Kapat"><X size={20} /></button>
      <SoundToggle className="gazecal-sound" />
      <div className="gazecal-steps" aria-hidden="true">
        {view.queue.map((x, i) => <i key={`${x}-${i}`} className={i < view.pos ? 'done' : i === view.pos ? 'now' : ''} />)}
      </div>
      <div className={`gazecal-target${done ? ' ok' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
        <svg viewBox="0 0 64 64" className="gazecal-ring">
          <circle cx="32" cy="32" r="28" className="bg" />
          <circle cx="32" cy="32" r="28" className="fg" style={{ strokeDasharray: `${prog * 176} 176` }} />
        </svg>
        <span className="gazecal-dot">{done && <Check size={12} strokeWidth={3} aria-hidden="true" />}</span>
      </div>
      <p className="gazecal-msg" role="status" aria-live="polite">
        {!cam.ready ? 'Kamera açılıyor…' : cam.error ? 'Kamera açılamadı' : done ? 'Tamam' : status === 'noface' ? 'Yüzünü kameraya göster' : status === 'closed' ? 'Gözlerini aç' : status === 'head' ? 'Başını çevirme, yalnızca gözünü kaydır' : status === 'hold' ? 'Noktada kal…' : `${view.again ? 'Bir kez daha: ' : ''}${LABEL[t] ?? 'Noktaya bak'}`}
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
      Başın {HEAD_TURN_DEG}°'den fazla döndüğü için {n} kareyi saymadım ({where}). Telefon yüzünün karşısında kalsın; noktaya bakarken ekrandan uzaklaşma.
    </p>
  )
}

// Eksen skoru: ayrışma / gürültü (en az MIN_SCORE gerekir)
function scoreText(axis) {
  if (!axis) return 'veri yok'
  return `${axis.score.toFixed(1)} / ${MIN_SCORE}`
}
