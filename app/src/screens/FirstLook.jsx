import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Hand } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { indicesFromConnections } from '../lib/distance.js'
import { eyeOpenness } from '../lib/blink.js'
import { trueDepthCounter, cameraCounter } from '../lib/blinkCounters.js'
import { median } from '../lib/trend.js'
import { haptic } from '../lib/native.js'
import '../styles/profile.css'

// İlk 20 sn (Artifact "Önce Fark Ettir" F1–F3b): form yerine bir farkındalık anı. Kişi kısa bir yazı okurken kamera
// göz kapaklarını sayar; sayı okurken gizli (görürse kırpmaya dikkat eder), sonunda kişinin kendi sayısı gösterilir.
// Norm ya da "az/çok" yargısı yok. Kamera yoksa ya da izin verilmezse kişi her kırpışta ekrana dokunur ("kendi sayım").
// Görüntü kaydedilmez; yalnız sayı saklanır (lib/profile.js firstLook).
// Dayanak: tablette okurken kırpma dakikada ~20'den ~15'e düştü (Abusharha 2017, DOI 10.2147/OPTO.S142718).
export const LOOK_SEC = 20
const BASELINE_MS = 2000
const CAMERA_WAIT_MS = 8000 // kamera bu sürede hazır olmazsa dokunarak sayıma geçilir (VARSAYIM)

const TEXT =
  'Sabah vapuru iskeleye yaklaşırken martılar suyun üstünde alçaldı. Simitçi tezgâhını açtı, ilk çayın buğusu soğuk havaya karıştı. ' +
  'Karşı kıyıdaki pencereler güneşi tek tek yakaladı. Bir çocuk korkuluğa yaslanıp dalgaları saydı; her dalga bir öncekinden biraz daha büyük göründü.'

function Ring({ left }) {
  const r = 23
  const c = 2 * Math.PI * r
  return (
    <svg className="fl-ring" viewBox="0 0 56 56" aria-hidden="true">
      <circle className="t" cx="28" cy="28" r={r} />
      <circle className="f" cx="28" cy="28" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - left / LOOK_SEC)} transform="rotate(-90 28 28)" />
      <text x="28" y="33" textAnchor="middle">{left}</text>
    </svg>
  )
}

// bar: kurulum ilerleme payı [başlangıç, bitiş]; onDone({ blinks, seconds, method, date })
export default function FirstLook({ trueDepth = false, bar = [0, 0.2], onDone }) {
  const [phase, setPhase] = useState('intro') // intro | look | tap | result
  const [method, setMethod] = useState(null) // 'truedepth' | 'camera' | 'self'
  const [left, setLeft] = useState(LOOK_SEC)
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false) // sayım başladı (kamera: temel ölçümden sonra; dokunma: ilk dokunuşta)
  const [note, setNote] = useState(null)
  const counter = useRef(null)
  const base = useRef([])
  const idx = useRef(null)
  const stage = useRef('off') // off | baseline | run
  const countRef = useRef(0)

  const cam = useFaceTracking({
    enabled: phase === 'look',
    trueDepth,
    onFrame: (m) => {
      if (m.native) {
        if (!m.face || m.blinkLeft == null) return
        const closure = (m.blinkLeft + m.blinkRight) / 2
        if (stage.current === 'baseline') base.current.push(1 - closure)
        else if (stage.current === 'run' && counter.current?.push(closure, m.ts)) countRef.current += 1
        return
      }
      if (!m.landmarks) return
      if (!idx.current) idx.current = { l: indicesFromConnections(m.ctx.leftEye), r: indicesFromConnections(m.ctx.rightEye) }
      const vals = [eyeOpenness(m.landmarks, idx.current.l), eyeOpenness(m.landmarks, idx.current.r)].filter((v) => v != null)
      if (!vals.length) return
      const o = vals.reduce((a, b) => a + b, 0) / vals.length
      if (stage.current === 'baseline') base.current.push(o)
      else if (stage.current === 'run' && counter.current?.push(o, m.ts)) countRef.current += 1
    },
  })

  // Kamera hazır → 2 sn temel açıklık → 20 sn sayım. Hata ya da gecikmede dokunarak sayıma geç.
  useEffect(() => {
    if (phase !== 'look') return undefined
    if (cam.error) {
      setNote('Kameraya erişilemedi; kendin sayabilirsin.')
      setPhase('tap')
      return undefined
    }
    if (!cam.ready) {
      const t = setTimeout(() => {
        setNote('Kamera hazır olmadı; kendin sayabilirsin.')
        setPhase('tap')
      }, CAMERA_WAIT_MS)
      return () => clearTimeout(t)
    }
    if (stage.current !== 'off') return undefined
    stage.current = 'baseline'
    base.current = []
    const t = setTimeout(() => {
      const b = median(base.current)
      if (!b) {
        setNote('Yüzünü göremedim; kendin sayabilirsin.')
        stage.current = 'off'
        setPhase('tap')
        return
      }
      counter.current = cam.native ? trueDepthCounter(1 - b) : cameraCounter(b)
      countRef.current = 0
      stage.current = 'run'
      setMethod(cam.native ? 'truedepth' : 'camera')
      setRunning(true)
    }, BASELINE_MS)
    return () => clearTimeout(t)
  }, [phase, cam.ready, cam.error, cam.native])

  // 20 sn geri sayım
  useEffect(() => {
    if (!running) return undefined
    setLeft(LOOK_SEC)
    const t0 = Date.now()
    const id = setInterval(() => {
      const l = Math.max(0, LOOK_SEC - Math.floor((Date.now() - t0) / 1000))
      setLeft(l)
      if (l === 0) {
        clearInterval(id)
        stage.current = 'off'
        setCount(countRef.current)
        setRunning(false)
        haptic('success')
        setPhase('result')
      }
    }, 250)
    return () => clearInterval(id)
  }, [running])

  const tap = () => {
    if (phase !== 'tap') return
    if (!running) {
      countRef.current = 0
      setMethod('self')
      setRunning(true)
    }
    countRef.current += 1
    setCount(countRef.current)
    haptic('tick')
  }

  const frac = { intro: 0, look: 0.35, tap: 0.35, result: 1 }[phase]
  const barValue = bar[0] + (bar[1] - bar[0]) * frac

  if (phase === 'result') {
    return (
      <main className="screen fade-in oq">
        <div className="oq-top"><ProgressBar value={barValue} /></div>
        <span className="oq-ey">20 saniyede</span>
        <div className="fl-big"><strong>{count}</strong><span>kez kırptın{method === 'self' ? ' · kendi sayımın' : ''}</span></div>
        <div className="fl-lids" aria-hidden="true">{Array.from({ length: Math.min(count, 30) }, (_, i) => <i key={i} />)}</div>
        <h1 className="oq-q" style={{ fontSize: '1.15rem' }}>Okurken kırpma seyrekleşir. Çoğu kişi bunu hiç fark etmez.</h1>
        <p className="oq-sub">Bunu her gün yolda, Göz kırpma durağında birlikte çalışacağız.</p>
        <div className="grow" />
        <p className="oq-src">Abusharha 2017: tablette okurken kırpma dakikada ~20'den ~15'e düştü. Senin sayın bir değerlendirme değil, bir başlangıç.</p>
        <button type="button" className="btn" onClick={() => onDone({ blinks: count, seconds: LOOK_SEC, method: method ?? 'self', date: new Date().toISOString() })}>
          Devam <ArrowRight size={18} aria-hidden="true" />
        </button>
      </main>
    )
  }

  if (phase === 'tap') {
    return (
      <main className="screen fade-in oq">
        <div className="oq-top"><ProgressBar value={barValue} /></div>
        <span className="oq-ey">Kamera yok · 20 saniye</span>
        <h1 className="oq-q">Her kırptığında ekrana dokun</h1>
        {note && <p className="oq-sub">{note}</p>}
        <button type="button" className="fl-tap" onPointerDown={(e) => { e.preventDefault(); tap() }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap() } }}>
          <span>
            <b>{count}</b>
            <span>{running ? `${left} sn kaldı` : 'İlk kırpışında dokun; süre başlar'}</span>
          </span>
        </button>
        <p className="oq-src">Sonuç "kendi sayımın" diye kaydedilir; kameradaki sayımla karıştırılmaz.</p>
      </main>
    )
  }

  if (phase === 'look') {
    return (
      <main className="screen fade-in oq">
        <div className="oq-top"><ProgressBar value={barValue} /></div>
        {!cam.native && <video ref={cam.videoRef} className="fl-cam" playsInline muted />}
        <div className="fl-timer">
          <Ring left={running ? left : LOOK_SEC} />
          <span>{running ? 'Okumaya devam et. Sayı sonunda görünecek.' : cam.ready ? 'Yazıyı okumaya başla.' : 'Kamera hazırlanıyor…'}</span>
        </div>
        <p className="fl-read">{TEXT}</p>
        <div className="grow" />
        <p className="oq-src">Sayıyı okurken göstermiyorum; görürsen kırpmaya dikkat edersin.</p>
      </main>
    )
  }

  return (
    <main className="screen fade-in oq">
      <div className="oq-top"><ProgressBar value={barValue} /></div>
      <span className="oq-ey">20 saniye</span>
      <h1 className="oq-q">Önce bir şey fark edelim</h1>
      <p className="oq-sub">Kısa bir yazı okuyacaksın. Bu sırada kamera yalnız göz kapaklarını sayar. Bir şey yapmana gerek yok, rahat oku.</p>
      <div className="grow" />
      <p className="oq-src">Görüntü kaydedilmez, telefondan çıkmaz.</p>
      <button type="button" className="btn" onClick={() => setPhase('look')}>
        <Camera size={18} aria-hidden="true" /> Başla
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setPhase('tap')}>
        <Hand size={18} aria-hidden="true" /> Kamerasız, kendim sayayım
      </button>
    </main>
  )
}
