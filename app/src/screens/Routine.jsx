import { useEffect, useRef, useState } from 'react'
import { X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Mountain, EyeOff, Trophy, Info, ScanFace, Check, SkipForward } from 'lucide-react'
import { Ring } from '../components/ui.jsx'
import { EXERCISES, DAILY_GOAL_MIN, formatMin, setDurationSec } from '../lib/routines.js'
import { cue, speak, unlockAudio } from '../lib/cue.js'
import { PHASE as BREATH_PHASE, loadBreathOpts } from '../lib/breath.js'
import BreathVisual from '../components/BreathVisual.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import {
  eyeClosure,
  createGazeReader,
  createBlinkCounter,
  blinkThresholds,
  createHoldTimer,
  createCircleTracker,
  createNearFarCounter,
  focusZone,
  lookingAtPhone,
  BLINK_CLOSE,
  CIRCLE_MIN_DEG,
  GAZE_ENTER_DEG,
  GAZE_FULL_DEG,
} from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import '../styles/routine.css'
import '../styles/breath.css'
import SoundToggle from '../components/SoundToggle.jsx'

const ARROWS = { right: ArrowRight, left: ArrowLeft, up: ArrowUp, down: ArrowDown }
const DIR_WORD = { right: 'sağa', left: 'sola', up: 'yukarı', down: 'aşağı' }
const KIND_LABEL = {
  evidence: 'Kanıtlı egzersiz',
  comfort: 'Göz konforu molası',
  relax: 'Rahatlama hareketi',
  calm: 'Nefes',
}
// Nefes adımı ritmi: 4 sn al, 6 sn ver (Sakin ritim). tick = adım başından geçen saniye.
const BREATH_IN = 4
const BREATH_CYCLE = 10
const breathPhaseAt = (tick) => (tick % BREATH_CYCLE < BREATH_IN ? 'in' : 'out')
// TrueDepth varken her adım kamerayla takip edilir ve ASLA süreyle ilerlemez: yüz görünmüyorsa
// sayaç durur, kişi nazikçe beklenir. TrueDepth yoksa (web / eski iPhone) ya da kamera
// açılamazsa adımlar süreyle ilerler.
const SENSOR_BY_VISUAL = { blink: 'blinks', arrow: 'hold', circle: 'laps', rest: 'closed', far: 'far', nearfar: 'switches' }
const GAZE_SENSORS = new Set(['hold', 'laps'])
const FACE_LOST_MS = 1500
const STALL_SKIP_SEC = 15 // bu kadar saniye ilerleme olmazsa "Atla" öne çıkar
const DONE_BEAT_MS = 600 // adım bitince kısa başarı anı, sonra sonraki adım
// VARSAYIM: sesli hatırlatma süreleri ilk sürüm içindir; cihazda ayarlanacak.
const CUE_GAP_MS = 6000 // hatırlatmalar arası en az süre
const MAX_REMINDERS = 3 // adım başına en çok sesli hatırlatma (sonra ekrandaki "Atla" yeter)
const OPEN_NAG_MS = 3000 // "Gözlerini kapat" adımında gözler bu kadar açık kalırsa hatırlat
const BLINK_OPEN_CUE_MS = 2000 // kırpma adımında göz bu kadar kapalı kalınca "Aç" de
// Uyarı (titreşim + ses): yanlış yere bakınca. VARSAYIM: süreler ilk sürüm içindir.
const WARN_GAP_MS = 4000 // iki uyarı arası en az süre
const FAR_GRACE_MS = 3000 // "Uzağa bak" adımı başında yönergeyi okuma payı (uyarı yok)
const PHONE_WARN_MS = 1200 // uzağa bakması gerekirken bu kadar telefona bakarsa uyar
const WRONG_DIR_MS = 700 // bakış adımında bu kadar yanlış yöne bakarsa uyar
const PAD_R = 42 // bakış panelinde noktanın merkezden en uzak konumu (%)
// Kişiye göre kırpma eşiği: gözler açıkken (ekrana bakarken) ölçülen kapanma ortancası.
// Telefona aşağı bakınca açık gözde bile kapanma 0,25'in üstünde olabilir; sabit eşikle sayaç
// ilk kırpmadan sonra hiç "açıldı" demez. VARSAYIM: 30 açık göz karesi ≈ 1 sn (native ~30 Hz).
const BLINK_BASE_SAMPLES = 30
// Daire görseli: .orbit 150 px kutu, 6 px kenarlık → kenarlık ortası 72 px (tur ilerleme yayı).
const ORBIT_R = 72
const ORBIT_LEN = 2 * Math.PI * ORBIT_R
const EMPTY_LIVE = { value: 0, ok: false, wrongWay: false, phone: false, gaze: { x: 0, y: 0 }, calibrated: true }

const unit = (deg) => Math.max(-1, Math.min(1, deg / GAZE_FULL_DEG))

// Bakış paneli (bakış adımları): hedef dilim + yön eşiği halkası + canlı bakış noktası.
// Ölçek: ±GAZE_FULL_DEG tam kenar; kesikli halka GAZE_ENTER_DEG.
function GazePad({ dir, gaze, ok }) {
  const Icon = ARROWS[dir]
  const ring = (GAZE_ENTER_DEG / GAZE_FULL_DEG) * PAD_R * 2
  return (
    <div className={`rt-pad ${ok ? 'ok' : ''}`} aria-hidden="true">
      <span className={`rt-pad-target ${dir}`} />
      <span className="rt-pad-ring" style={{ width: `${ring}%`, height: `${ring}%` }} />
      <Icon size={26} strokeWidth={2.4} className={`rt-pad-arrow ${dir}`} />
      <span className="rt-pad-dot" style={{ left: `${50 + unit(gaze.x) * PAD_R}%`, top: `${50 - unit(gaze.y) * PAD_R}%` }} />
    </div>
  )
}

// gaze: { v, ok, value } kamera bakışı izlerken; yoksa null (yönerge görseli).
function Visual({ ex, tick, gaze }) {
  if (ex.visual === 'arrow') {
    if (gaze) return <GazePad dir={ex.dir} gaze={gaze.v} ok={gaze.ok} />
    const Icon = ARROWS[ex.dir]
    return <Icon size={96} strokeWidth={2.2} className="routine-arrow" />
  }
  if (ex.visual === 'circle') {
    const orbit = (
      <div className={`orbit ${ex.dir}`}>
        <span className="orbit-dot" />
      </div>
    )
    if (!gaze) return <div className="rt-orbit">{orbit}</div>
    // Kamera modu: dönen nokta yalnızca yön/tempo gösterir (soluk) — gözle izlenecek hedef değil;
    // ekrandaki halkayı izlemek gözü ~2–3° döndürür, çeyrek sayımı ise CIRCLE_MIN_DEG ister.
    // Kesikli halka o eşiği, halka üstündeki yay turun çeyrek ilerlemesini gösterir.
    // Ölçek: kutu kenarı ±GAZE_FULL_DEG. VARSAYIM: cihazda doğrulanacak.
    const lap = Math.floor(gaze.value)
    const part = Math.max(0, gaze.value - lap)
    const out = Math.hypot(gaze.v.x, gaze.v.y) >= CIRCLE_MIN_DEG
    const minRing = (CIRCLE_MIN_DEG / GAZE_FULL_DEG) * 100
    return (
      <div className={`rt-orbit tracked ${gaze.ok ? '' : 'warn'}`} aria-hidden="true">
        {orbit}
        <svg className={`rt-orbit-arc ${ex.dir}`} viewBox="0 0 150 150">
          <circle key={lap} cx="75" cy="75" r={ORBIT_R} style={{ strokeDasharray: ORBIT_LEN, strokeDashoffset: ORBIT_LEN * (1 - part) }} />
        </svg>
        <span className="rt-orbit-min" style={{ width: `${minRing}%`, height: `${minRing}%` }} />
        <span className={`rt-orbit-gaze ${out ? 'out' : ''}`} style={{ left: `${50 + unit(gaze.v.x) * 50}%`, top: `${50 - unit(gaze.v.y) * 50}%` }} />
      </div>
    )
  }
  if (ex.visual === 'far') return <Mountain size={96} strokeWidth={1.6} className="routine-arrow" />
  if (ex.visual === 'breath') {
    const k = breathPhaseAt(tick)
    const ph = BREATH_PHASE[k]
    const secLeft = k === 'in' ? BREATH_IN - (tick % BREATH_CYCLE) : BREATH_CYCLE - (tick % BREATH_CYCLE)
    return (
      <div className="stack" style={{ alignItems: 'center', gap: 18 }}>
        <BreathVisual visual={loadBreathOpts().visual} kind={k} phaseSec={k === 'in' ? BREATH_IN : BREATH_CYCLE - BREATH_IN} size={150} />
        <span className="routine-sub" aria-live="polite">{ph.label} · {secLeft}</span>
      </div>
    )
  }
  if (ex.visual === 'nearfar') {
    // Yakın hedef ekrandaki daire (başparmak değil: kamera daireye/uzağa bakışı ayırt eder). 3 sn ritim.
    const near = Math.floor(tick / 3) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center', gap: 16 }}>
        {near ? <span className="nearfar-ring" aria-hidden="true" /> : <Mountain size={88} strokeWidth={1.6} className="routine-arrow" />}
        <span className="routine-sub">{near ? 'Daireye bak' : 'Uzağa bak'}</span>
      </div>
    )
  }
  if (ex.visual === 'blink') {
    // 4 sn ritim: 2 sn kapat, 2 sn aç
    const closed = Math.floor(tick / 2) % 2 === 0
    return (
      <div className="stack" style={{ alignItems: 'center', gap: 14 }}>
        <div className={`blink-orb ${closed ? 'shut' : ''}`} />
        <span className="routine-sub">{closed ? 'Kapat · hafifçe sık' : 'Aç'}</span>
      </div>
    )
  }
  return <EyeOff size={88} strokeWidth={1.6} className="routine-arrow" />
}

// base: açık göz kapanma tabanı (henüz yoksa null → varsayılan eşikler; taban gelince retune).
function newTrackers(ex, base) {
  return {
    blink: createBlinkCounter(blinkThresholds(base)),
    blinkTuned: base != null,
    hold: createHoldTimer(),
    circle: createCircleTracker(ex?.dir, { min: CIRCLE_MIN_DEG }),
    nearFar: createNearFarCounter(),
    last: { value: 0, ok: false, wrongWay: false },
  }
}

const freshVoice = () => ({
  lastCue: 0,
  reminders: 0,
  openSince: null,
  closedSince: null,
  openCued: false,
  stepStart: null, // adımın ilk yüz karesi (ms)
  lastWarn: -Infinity,
  phoneSince: null, // "Uzağa bak"ta telefona bakış başlangıcı
  wrongSince: null, // bakış adımında yanlış yöne bakış başlangıcı
})

export default function Routine({ set, todaySec, onFinish, onBack, trueDepth = false }) {
  const steps = set.steps.map((id) => ({ id, ...EXERCISES[id] }))
  const [idx, setIdx] = useState(0)
  const [tick, setTick] = useState(0) // adım başından beri geçen saniye (görsel ritim için)
  const [timer, setTimer] = useState(0) // süreyle ilerleme (yalnızca TrueDepth yokken)
  const [stall, setStall] = useState(0) // TrueDepth: bu adımda ilerlemeden geçen saniye
  const [done, setDone] = useState(false)
  const [live, setLive] = useState(EMPTY_LIVE)
  const spent = useRef(0)
  const faceTs = useRef(-Infinity) // son yüz karesi; hiç görülmediyse "yok"
  const trackers = useRef(null)
  const reader = useRef(null)
  const lastUi = useRef(0)
  const pulseValue = useRef(0)
  const pulseLost = useRef(false)
  const voice = useRef(freshVoice())
  const idxRef = useRef(idx)
  idxRef.current = idx
  const doneRef = useRef(done)
  doneRef.current = done
  const ex = steps[idx]
  const exRef = useRef(ex)
  exRef.current = ex
  const sensorRef = useRef(null)
  const openSamples = useRef([]) // açık göz kapanma örnekleri (taban hazır olana dek)
  const blinkBase = useRef(null) // kişinin açık göz kapanma tabanı (ortanca) ya da null
  if (!trackers.current) trackers.current = newTrackers(ex, blinkBase.current)
  // Tek okuyucu: nötr bakış ilk adımda (ekrana bakarken) öğrenilir, adımlar arasında korunur.
  if (!reader.current) reader.current = createGazeReader()

  const faceLost = () => performance.now() - faceTs.current > FACE_LOST_MS

  const onFrame = (m) => {
    const kind = sensorRef.current
    if (!kind) return
    const g = reader.current.push(m) // her kare: kalibrasyon ve işaret doğrulama sürekli öğrenir
    if (!m.face) return
    faceTs.current = m.ts
    const t = trackers.current
    const cur = exRef.current
    const vr = voice.current
    if (vr.stepStart == null) vr.stepStart = m.ts
    const closure = eyeClosure(m)
    const open = closure < BLINK_CLOSE
    // Açık göz tabanı: yalnızca ekrana bakarken (kırpma adımı ya da bakış adımında merkez) toplanır;
    // aşağı/uzağa bakışta göz kapağı konumu değişir. Bir kez hesaplanır, set boyunca kullanılır.
    const atScreen = kind === 'blinks' || (GAZE_SENSORS.has(kind) && g.calibrated && g.dir === 'center')
    if (blinkBase.current == null && open && atScreen && Number.isFinite(closure)) {
      const s = openSamples.current
      s.push(closure)
      if (s.length >= BLINK_BASE_SAMPLES) {
        const a = [...s].sort((x, y) => x - y)
        blinkBase.current = a[a.length >> 1]
      }
    }
    let value = 0
    let ok = false
    let wrongWay = false
    let phone = false // "Uzağa bak"ta telefona bakıyor
    let warn = null // uyarı metni (titreşim + ses)
    if (kind === 'blinks') {
      // Taban bu adımda hazır olduysa eşikleri kişiye göre ayarla; sayım ve o anki kırpma korunur
      // (sabit eşikte "kapalı"da takılı kalmış kırpma, göz yeni eşiğe inince sayılır).
      if (blinkBase.current != null && !t.blinkTuned) {
        t.blink.retune(blinkThresholds(blinkBase.current))
        t.blinkTuned = true
      }
      value = t.blink.push(closure, m.ts)
      // Taban yokken sabit eşiğin "kapalı" durumu açık gözde takılı kalabilir → ham kapanmaya bak.
      ok = t.blinkTuned ? t.blink.closed : !open
      // Gözler kapalıyken ekran okunamaz: ritmi sesle ver
      if (!open) {
        if (vr.closedSince == null) vr.closedSince = m.ts
        if (!vr.openCued && m.ts - vr.closedSince >= BLINK_OPEN_CUE_MS) {
          vr.openCued = true
          cue('Aç', false)
        }
      } else {
        vr.closedSince = null
        vr.openCued = false
      }
    } else if (kind === 'hold') {
      ok = g.dir === cur.dir
      value = t.hold.push(ok, m.ts) / 1000
      // Belirgin biçimde başka yöne bakıyorsa (merkez ya da kırpma değil) uyar
      const wrong = g.dir != null && g.dir !== 'center' && g.dir !== cur.dir
      vr.wrongSince = wrong ? vr.wrongSince ?? m.ts : null
      if (wrong && m.ts - vr.wrongSince >= WRONG_DIR_MS) warn = `Başını çevirmeden ${DIR_WORD[cur.dir]} bak`
    } else if (kind === 'laps') {
      const st = g.dir != null ? t.circle.push(g.v) : t.circle.state
      value = st.laps + st.progress
      ok = !st.wrongWay
      wrongWay = st.wrongWay
    } else if (kind === 'closed') {
      // Yalnızca yüz görünür ve gözler kapalıyken işler
      ok = !open
      value = t.hold.push(ok, m.ts) / 1000
      if (ok) vr.openSince = null
      else if (vr.openSince == null) vr.openSince = m.ts
    } else if (kind === 'far') {
      // Odak mesafesi (göz doğrultuları) tek başına yetmiyor: cihazda telefona bakarken de "uzak"
      // okundu (Build 7). Bakış okuyucusu kalibreyse telefona (ekrana) bakış kesin elenir: süre
      // yalnızca gözler telefonun dışına (üstünden/yanından) bakarken işler.
      const atPhone = lookingAtPhone(g)
      ok = open && (g.calibrated ? atPhone === false : focusZone(m) === 'far')
      value = t.hold.push(ok, m.ts) / 1000
      phone = atPhone === true
      vr.phoneSince = phone ? vr.phoneSince ?? m.ts : null
      if (phone && m.ts - vr.stepStart >= FAR_GRACE_MS && m.ts - vr.phoneSince >= PHONE_WARN_MS) warn = 'Telefona değil, uzağa bak'
    } else if (kind === 'switches') {
      // Yakın = telefona (daireye) bakış, uzak = telefonun dışına bakış (kameraya göre bakış).
      // Okuyucu kalibre değilse odak mesafesine (göz doğrultuları) düşer.
      const atPhone = lookingAtPhone(g)
      const zone = !open ? null : atPhone != null ? (atPhone ? 'near' : 'far') : focusZone(m)
      const st = t.nearFar.push(zone, m.ts)
      value = st.switches
      ok = st.zone != null
    }
    // Titreşim: sayım artınca / doğru duruma girince / geri sayımda her saniye / uyarılar
    const L = t.last
    const timed = kind === 'hold' || kind === 'closed' || kind === 'far'
    if ((kind === 'blinks' || kind === 'switches') && value > L.value) haptic('tick')
    else if (kind === 'laps' && Math.floor(value) > Math.floor(L.value)) haptic('hit')
    else if (timed && ok && (!L.ok || Math.floor(value) > Math.floor(L.value))) haptic('tick')
    if (wrongWay && !L.wrongWay) haptic('warning')
    // "Gözlerini kapat"ta gözler açılınca hemen uyarı titreşimi (sesli hatırlatma remind() ile)
    if (kind === 'closed' && L.ok && !ok && open && m.ts - vr.lastWarn >= WARN_GAP_MS) {
      haptic('warning')
      vr.lastWarn = m.ts
    }
    if (warn && m.ts - vr.lastWarn >= WARN_GAP_MS) {
      cue(warn, true) // uyarı titreşimi + ses (ses kapalıysa yalnızca titreşim)
      vr.lastWarn = m.ts
      vr.lastCue = performance.now()
    }
    t.last = { value, ok, wrongWay }
    if (m.ts - lastUi.current > 90 || value >= goalOf(cur, kind)) {
      lastUi.current = m.ts
      setLive({ value, ok, wrongWay, phone, gaze: g.v, calibrated: g.calibrated })
    }
  }

  const cam = useFaceTracking({ enabled: trueDepth && !done, trueDepth: true, onFrame })
  // Kamera açılamazsa (izin / hata) süreye düşülür; aksi halde kullanıcı takılı kalırdı.
  const sensor = trueDepth && !cam.error && ex ? SENSOR_BY_VISUAL[ex.visual] ?? null : null
  sensorRef.current = sensor

  // "Gözlerini kapat" adımında sesli yönlendirme: kullanıcı ekranı göremez.
  function remind(kind) {
    if (kind !== 'closed') return
    const vr = voice.current
    const now = performance.now()
    if (now - vr.lastCue < CUE_GAP_MS || vr.reminders >= MAX_REMINDERS) return
    let text = null
    if (faceLost()) text = 'Kamera yüzünü göremiyor. Telefonu yüzüne doğru tut, gözlerin kapalı kalsın.'
    else if (vr.openSince != null && now - vr.openSince >= OPEN_NAG_MS) text = 'Gözlerini kapat'
    if (!text) return
    cue(text, true)
    vr.lastCue = now
    vr.reminders += 1
  }

  // Adım başında sesli yönlendirme (gözler kapalı adımlarda ekran okunamaz)
  useEffect(() => {
    if (done || !ex) return
    const prev = steps[idx - 1]
    const say = ex.say ?? ex.title
    cue(prev?.visual === 'rest' ? `Gözlerini aç. ${say}` : say, Boolean(ex.closed))
    voice.current.lastCue = performance.now()
  }, [idx, done])

  // Nefes adımı: aşama değişince kısa komut + aşamaya özgü titreşim (adım başı cue zaten konuşur)
  useEffect(() => {
    if (done || ex?.visual !== 'breath' || tick === 0) return
    if (tick % BREATH_CYCLE !== 0 && tick % BREATH_CYCLE !== BREATH_IN) return
    const ph = BREATH_PHASE[breathPhaseAt(tick)]
    haptic(ph.haptic)
    speak(ph.say)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Nabız: saniyede bir. TrueDepth'te süre ilerlemez; yalnızca bekleme (ilerlemesizlik) sayılır.
  useEffect(() => {
    if (done) return undefined
    const t = setInterval(() => {
      spent.current += 1
      setTick((v) => v + 1)
      const kind = sensorRef.current
      if (!kind) {
        setTimer((v) => v + 1)
        return
      }
      // Bekleme sayacı: ilerleme olunca ya da yüz geri gelince sıfırlanır.
      const value = trackers.current.last.value
      const lost = faceLost()
      const progressed = value > pulseValue.current
      const returned = pulseLost.current && !lost
      pulseValue.current = value
      pulseLost.current = lost
      setStall((s) => (progressed || returned ? 0 : s + 1))
      remind(kind)
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  function advance(from) {
    if (doneRef.current || from !== idxRef.current) return
    if (from + 1 < steps.length) {
      const nx = steps[from + 1]
      idxRef.current = from + 1
      trackers.current = newTrackers(nx, blinkBase.current)
      // Bakış adımı başında nötrü yenile (küçük kaymaları düzeltir; hedefe bakış nötr sayılmaz)
      if (GAZE_SENSORS.has(SENSOR_BY_VISUAL[nx.visual])) reader.current.recenter()
      pulseValue.current = 0
      voice.current = { ...freshVoice(), lastCue: voice.current.lastCue }
      setLive(EMPTY_LIVE)
      setIdx(from + 1)
      setTick(0)
      setTimer(0)
      setStall(0)
    } else {
      doneRef.current = true
      cue(steps[from].visual === 'rest' ? 'Tamamlandı. Gözlerini açabilirsin.' : 'Tamamlandı', false)
      setDone(true)
    }
  }

  const goal = ex ? goalOf(ex, sensor) : 0
  const sensorDone = Boolean(sensor) && live.value >= goal
  const timerDone = !sensor && Boolean(ex) && timer >= ex.seconds

  // Adım sonu: süreyle hemen; sensörle kısa bir başarı anından sonra
  useEffect(() => {
    if (done) return undefined
    if (timerDone) {
      advance(idx)
      return undefined
    }
    if (!sensorDone) return undefined
    haptic('success')
    const from = idx
    const t = setTimeout(() => advance(from), DONE_BEAT_MS)
    return () => clearTimeout(t)
  }, [sensorDone, timerDone, idx, done])

  useEffect(() => {
    unlockAudio()
  }, [])

  if (done) {
    const total = todaySec + spent.current
    const dailyGoal = DAILY_GOAL_MIN * 60
    return (
      <main className="screen fade-in routine-screen">
        <section className="card card-hero" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <Ring value={Math.min(total, dailyGoal)} max={dailyGoal} size={132} stroke={12}>
            {total >= dailyGoal ? <Trophy size={40} style={{ color: 'var(--accent)' }} /> : <span className="ring-label">{formatMin(total)}</span>}
          </Ring>
          <h1>{total >= dailyGoal ? 'Günlük hedef tamam!' : `${set.title} set tamamlandı`}</h1>
          <p className="muted">Bugünkü toplam: {formatMin(total)} · hedef {DAILY_GOAL_MIN} dk</p>
        </section>
        <p className="note">
          <Info size={16} />
          Bakış ve daire hareketleri rahatlama amaçlıdır; görmeyi iyileştirdiklerine dair bilimsel kanıt yoktur. Görmendeki değişimi "E hangi yönde" testiyle ölçüyoruz.
        </p>
        <button className="btn" onClick={() => onFinish({ type: 'routine', setId: set.id, seconds: spent.current, steps: steps.length })}>
          Kaydet
        </button>
      </main>
    )
  }

  // Takip durumu (TrueDepth adımları)
  const faceVisible = Boolean(sensor) && cam.ready && !faceLost()
  const paused = Boolean(sensor) && !faceVisible
  const stuck = Boolean(sensor) && stall >= STALL_SKIP_SEC
  const frac = sensor ? Math.min(1, live.value / goal) : Math.min(1, timer / ex.seconds)
  const sub = sensor ? ex.subTracked ?? ex.sub : ex.sub
  const gaze = faceVisible && GAZE_SENSORS.has(sensor) ? { v: live.gaze, ok: live.ok, value: live.value } : null

  const tally = sensor === 'blinks' || sensor === 'laps' || sensor === 'switches'
  const count = !sensor
    ? Math.max(0, ex.seconds - timer)
    : tally
      ? `${Math.min(Math.floor(live.value), goal)}/${goal}`
      : Math.max(0, Math.ceil(goal - live.value))
  const { hint, tone } = sensor ? feedback(sensor, live, ex) : { hint: null, tone: '' }
  const skip = () => advance(idx)

  return (
    <main className="screen routine-screen rt">
      <div className="rt-top">
        <button className="btn-icon" onClick={onBack} aria-label="Egzersizden çık">
          <X size={20} aria-hidden="true" />
        </button>
        <div className="seg-progress" role="progressbar" aria-label={`Adım ${idx + 1} / ${steps.length}`} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={idx + 1}>
          {steps.map((s, i) => (
            <span key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
              {i === idx && <i style={{ width: `${frac * 100}%` }} />}
            </span>
          ))}
        </div>
        <span className="rt-step" aria-hidden="true">{idx + 1}/{steps.length}</span>
        <SoundToggle />
      </div>

      <div className="routine-body" key={idx}>
        <span className={`kind-tag ${ex.kind}`}>{KIND_LABEL[ex.kind]}</span>
        <h1 className="routine-title">{ex.title}</h1>
        <p className="routine-sub">{sub}</p>
        <div className={`routine-count ${paused ? 'rt-paused' : ''}`} aria-live="polite">
          {sensorDone ? <Check size={76} strokeWidth={2.6} className="rt-count-done" aria-label="Tamam" /> : count}
        </div>
        <div className={`routine-visual ${paused ? 'rt-paused' : ''}`}>
          <Visual ex={ex} tick={tick} gaze={gaze} />
        </div>
        {sensor && paused && (
          <div className="rt-wait" role="status">
            <span className="rt-wait-icon"><ScanFace size={22} aria-hidden="true" /></span>
            <div>
              <strong>{cam.ready ? 'Yüzünü kameraya göster' : 'Kamera hazırlanıyor…'}</strong>
              <span>{cam.ready ? 'Sayaç, yüzün görününce kaldığı yerden devam eder.' : 'Bir an sürebilir.'}</span>
            </div>
          </div>
        )}
        {sensor && !paused && hint && (
          <p className={`rt-live ${tone}`}>
            {tone === 'ok' ? <Check size={16} aria-hidden="true" /> : <ScanFace size={16} aria-hidden="true" />}
            {hint}
          </p>
        )}
        {trueDepth && cam.error && (
          <p className="track-status">
            <ScanFace size={15} aria-hidden="true" />
            Kamera kullanılamıyor — süreyle devam ediyor
          </p>
        )}
      </div>

      <div className="rt-foot">
        {stuck ? (
          <>
            <button className="btn" onClick={skip}>
              <SkipForward size={18} aria-hidden="true" /> Bu adımı atla
            </button>
            <p className="muted small">{paused ? 'Yüzün görünmediği için sayaç duruyor.' : 'Hareket algılanmıyorsa bu adımı geçebilirsin.'}</p>
          </>
        ) : (
          <button className="link-btn" onClick={skip}>Atla</button>
        )}
        <p className="muted small">{set.title} · toplam {formatMin(setDurationSec(set))}</p>
      </div>
    </main>
  )
}

// Canlı geri bildirim metni ve tonu ('ok' | 'warn' | '')
function feedback(sensor, live, ex) {
  switch (sensor) {
    case 'blinks':
      return { hint: live.ok ? 'Kapalı… hafifçe sık, sonra aç' : 'Her tam kırpmayı sayıyorum', tone: '' }
    case 'hold':
      if (!live.calibrated) return { hint: 'Önce bir an ekrana bak', tone: '' }
      return live.ok ? { hint: 'Harika, böyle tut', tone: 'ok' } : { hint: `Başını çevirmeden ${DIR_WORD[ex.dir]} bak`, tone: '' }
    case 'laps':
      // Ekrandaki halkayı izlemek yetmez (bkz. Visual): bakış telefonun dışına taşmalı.
      if (!live.calibrated) return { hint: 'Önce bir an ekrana bak', tone: '' }
      if (live.wrongWay) return { hint: 'Ters yöne dönüyorsun', tone: 'warn' }
      return live.value > 0 ? { hint: 'Güzel, büyük ve yavaş devam et', tone: 'ok' } : { hint: 'Büyük ve yavaş çiz, ekranın dışına taşsın', tone: '' }
    case 'closed':
      return live.ok ? { hint: 'Gözlerin kapalı, bitince sesle haber vereceğim', tone: 'ok' } : { hint: 'Gözlerini kapat', tone: '' }
    case 'far':
      if (live.phone) return { hint: 'Telefona bakıyorsun · telefonun üstünden uzağa bak', tone: 'warn' }
      return live.ok ? { hint: 'Gözlerin uzakta, böyle kal', tone: 'ok' } : { hint: 'Telefonun üstünden uzaktaki bir noktaya bak', tone: '' }
    case 'switches':
      return { hint: live.value === 0 ? 'Önce daireye, sonra telefonun üstünden uzağa bak' : 'Geçişleri sayıyorum', tone: '' }
    default:
      return { hint: null, tone: '' }
  }
}

function goalOf(ex, sensor) {
  if (sensor === 'blinks') return ex.blinks ?? 5
  if (sensor === 'laps') return ex.laps ?? 2
  if (sensor === 'switches') return ex.switches ?? 6
  return ex.seconds
}
