import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, RotateCw, RotateCcw, Mountain, EyeClosed, Eye, Wind, Clock, ScanFace, SkipForward, Check, Play, Volume2 } from 'lucide-react'
import { DAILY_GOAL_MIN, formatMin, setDurationSec, exerciseSteps } from '../lib/routines.js'
import { unlockAudio } from '../lib/cue.js'
import { cuePhrase, sayPhrase, preloadPhrases } from '../lib/voiceCue.js'
import { unlockBreathSfx, releaseBreathSfx } from '../lib/breathSfx.js'
import { VOICE_LABEL, VOICE_LANG } from '../lib/voicePack.js'
import { getPrefs } from '../lib/prefs.js'
import { PHASE as BREATH_PHASE, loadBreathOpts } from '../lib/breath.js'
import BreathVisual from '../components/BreathVisual.jsx'
import { Arena, EyeArt, LookArt, OrbitArt, HorizonArt, NearArt, RestArt, DoneArt, Pips, NearFarIcon, useIrisArt } from '../components/ExerciseArt.jsx'
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
  GAZE_FULL_DEG,
} from '../lib/gaze.js'
import { haptic } from '../lib/native.js'
import { createObsCollector, adaptModel } from '../lib/gazeAdapt.js'
import { loadGazeModel, saveGazeModel } from '../lib/gazeCalib.js'
import '../styles/exercise.css'
import '../styles/breath.css'
import SoundToggle from '../components/SoundToggle.jsx'

// Egzersiz sahnesi (Artifact "Nefona Egzersiz Sahnesi", onaylı): başlangıç → hareketler → bitiş.
// Görünüm components/ExerciseArt.jsx + styles/exercise.css; sesli komutlar ElevenLabs (lib/voiceCue.js).
const DIR_WORD = { right: 'sağa', left: 'sola', up: 'yukarı', down: 'aşağı' }
const DIR_VOICE = { right: 'exRight', left: 'exLeft', up: 'exUp', down: 'exDown' }
const KIND_LABEL = { evidence: 'kanıtlı', comfort: 'göz konforu', relax: 'rahatlama', calm: 'nefes' }
// Başlangıç listesindeki simge ve hedef
const ARROW_ICON = { right: ArrowRight, left: ArrowLeft, up: ArrowUp, down: ArrowDown }
const CIRCLE_ICON = { cw: RotateCw, ccw: RotateCcw }
const OTHER_ICON = { far: Mountain, nearfar: NearFarIcon, blink: Eye, breath: Wind, rest: EyeClosed }
const moveIcon = (ex) => (ex.visual === 'arrow' ? ARROW_ICON[ex.dir] : ex.visual === 'circle' ? CIRCLE_ICON[ex.dir] : OTHER_ICON[ex.visual])
const moveGoal = (ex, trueDepth) => {
  if (trueDepth && ex.visual === 'blink') return `${ex.blinks ?? 5} kırpma`
  if (trueDepth && ex.visual === 'circle') return `${ex.laps ?? 2} tur`
  if (trueDepth && ex.visual === 'nearfar') return `${ex.switches ?? 6} geçiş`
  return `${ex.seconds} sn`
}
// Nefes adımı ritmi: 4 sn al, 6 sn ver (Sakin ritim). tick = adım başından geçen saniye.
const BREATH_IN = 4
const BREATH_CYCLE = 10
const breathPhaseAt = (tick) => (tick % BREATH_CYCLE < BREATH_IN ? 'in' : 'out')
// Kırpma ritmi: 2 sn kapat · hafifçe sık, 2 sn aç. Yakın–uzak: 3 sn iris, 3 sn uzak.
const BLINK_HALF = 2
const NEARFAR_HALF = 3
// TrueDepth varken her adım kamerayla takip edilir ve ASLA süreyle ilerlemez: yüz görünmüyorsa
// sayaç durur, kişi nazikçe beklenir. TrueDepth yoksa (web / eski iPhone) ya da kamera
// açılamazsa adımlar süreyle ilerler.
const SENSOR_BY_VISUAL = { blink: 'blinks', arrow: 'hold', circle: 'laps', rest: 'closed', far: 'far', nearfar: 'switches' }
const GAZE_SENSORS = new Set(['hold', 'laps'])
const FACE_LOST_MS = 1500
const STALL_SKIP_SEC = 15 // bu kadar saniye ilerleme olmazsa "Atla" öne çıkar
const DONE_BEAT_MS = 600 // adım bitince kısa başarı anı, sonra sonraki adım
const REST_OPEN_GAP_MS = 900 // gözler kapalı adımdan sonra: "Aç." ile sonraki komut arası
// VARSAYIM: sesli hatırlatma süreleri ilk sürüm içindir; cihazda ayarlanacak.
const CUE_GAP_MS = 6000 // hatırlatmalar arası en az süre
const MAX_REMINDERS = 3 // adım başına en çok sesli hatırlatma (sonra ekrandaki "Atla" yeter)
const OPEN_NAG_MS = 3000 // "Gözlerini kapat" adımında gözler bu kadar açık kalırsa hatırlat
// Uyarı (titreşim + ses): yanlış yere bakınca. VARSAYIM: süreler ilk sürüm içindir.
const WARN_GAP_MS = 4000 // iki uyarı arası en az süre
const FAR_GRACE_MS = 3000 // "Uzağa bak" adımı başında yönergeyi okuma payı (uyarı yok)
const PHONE_WARN_MS = 1200 // uzağa bakması gerekirken bu kadar telefona bakarsa uyar
const WRONG_DIR_MS = 700 // bakış adımında bu kadar yanlış yöne bakarsa uyar
// Kişiye göre kırpma eşiği: gözler açıkken (ekrana bakarken) ölçülen kapanma ortancası.
// Telefona aşağı bakınca açık gözde bile kapanma 0,25'in üstünde olabilir; sabit eşikle sayaç
// ilk kırpmadan sonra hiç "açıldı" demez. VARSAYIM: 30 açık göz karesi ≈ 1 sn (native ~30 Hz).
const BLINK_BASE_SAMPLES = 30
const EMPTY_LIVE = { value: 0, ok: false, wrongWay: false, wrongDir: false, phone: false, gaze: { x: 0, y: 0 }, calibrated: true }

const unit = (deg) => Math.max(-1, Math.min(1, deg / GAZE_FULL_DEG))

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
  stepStart: null, // adımın ilk yüz karesi (ms)
  lastWarn: -Infinity,
  phoneSince: null, // "Uzağa bak"ta telefona bakış başlangıcı
  wrongSince: null, // bakış adımında yanlış yöne bakış başlangıcı
})

// Kayıt: { type: 'routine', setId, seconds, steps } (steps: hareket sayısı). Basamaklı yol grubunda ayrıca stage, variant
// ve stepIds (adım kimlikleri) olur (§3.A.8-4; §3.A.10 "veride yalnız yeni alanlar eklenir": steps sayı olarak kalır).
// İlerleme sayacı Dstage stage'i okur; eski kayıtlar bu alanlar olmadan okunur.
export function routineRecord(set, steps, seconds) {
  const rec = { type: 'routine', setId: set.id, seconds, steps: steps.length }
  if (set.stage == null) return rec
  return { ...rec, stage: set.stage, stepIds: steps.map((s) => s.id), variant: set.variant ?? null }
}

// set: SETS'ten bir set ya da yol grubu. Sonsuz yolda (SONSUZ_YOL.PLAN.v1 §3.A.6, §3.A.8-4) yol grubu basamağıyla gelir:
// set.steps bugünün adımları, set.patch çeşitleme yaması (EXERCISES'in üstüne), set.stage basamak kimliği, set.variant
// çeşitleme kimliği. stage varsa kayda stage, stepIds (adım kimlikleri) ve variant yazılır; yoksa kayıt bugünkü gibidir.
export default function Routine({ set, todaySec, onFinish, onBack, trueDepth = false, remindField = null }) {
  const steps = exerciseSteps(set)
  const [started, setStarted] = useState(false)
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
  const obsCol = useRef(null) // { idx, col }: bakış adımında kendini iyileştirme gözlemi (lib/gazeAdapt.js)
  const lastUi = useRef(0)
  const pulseValue = useRef(0)
  const pulseLost = useRef(false)
  const voice = useRef(freshVoice())
  const sayTimer = useRef(0)
  const startedRef = useRef(started)
  startedRef.current = started
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
  const artImgs = useIrisArt()

  const faceLost = () => performance.now() - faceTs.current > FACE_LOST_MS

  const onFrame = (m) => {
    const kind = sensorRef.current
    // Başlangıç ekranında kamera ısınır ama hiçbir şey sayılmaz
    if (!kind || !startedRef.current) return
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
    let wrongDir = false
    let phone = false // "Uzağa bak"ta telefona bakıyor
    let warn = null // uyarı cümlesi (titreşim + ses)
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
    } else if (kind === 'hold') {
      // Kendini iyileştirme: bu adımın gözlemi (yalnız kalibrasyon modeli varken)
      // Yön adım numarasından: adım değiştiği ilk karede exRef henüz eski adımı gösterir (render sonrası güncellenir)
      if (obsCol.current?.idx !== idxRef.current) {
        const rm = reader.current.model
        obsCol.current = { idx: idxRef.current, col: rm ? createObsCollector(rm, steps[idxRef.current]?.dir) : null }
      }
      obsCol.current.col?.push(m, g, reader.current.center)
      ok = g.dir === cur.dir
      value = t.hold.push(ok, m.ts) / 1000
      // Belirgin biçimde başka yöne bakıyorsa (merkez ya da kırpma değil) uyar
      const wrong = g.dir != null && g.dir !== 'center' && g.dir !== cur.dir
      vr.wrongSince = wrong ? vr.wrongSince ?? m.ts : null
      wrongDir = wrong && m.ts - vr.wrongSince >= WRONG_DIR_MS
      if (wrongDir) warn = DIR_VOICE[cur.dir]
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
      if (phone && m.ts - vr.stepStart >= FAR_GRACE_MS && m.ts - vr.phoneSince >= PHONE_WARN_MS) warn = 'exPhone'
    } else if (kind === 'switches') {
      // Yakın = telefona (irise) bakış, uzak = telefonun dışına bakış (kameraya göre bakış).
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
      cuePhrase(warn, true) // uyarı titreşimi + ses (ses kapalıysa yalnızca titreşim)
      vr.lastWarn = m.ts
      vr.lastCue = performance.now()
    }
    t.last = { value, ok, wrongWay }
    if (m.ts - lastUi.current > 90 || value >= goalOf(cur, kind)) {
      lastUi.current = m.ts
      setLive({ value, ok, wrongWay, wrongDir, phone, gaze: g.v, calibrated: g.calibrated })
    }
  }

  // Kamera başlangıç ekranında ısınır (Başla'ya basınca hazır olsun); sayım yalnız başladıktan sonra.
  const cam = useFaceTracking({ enabled: trueDepth && !done, trueDepth: true, onFrame })
  // Kamera açılamazsa (izin / hata) süreye düşülür; aksi halde kullanıcı takılı kalırdı.
  const sensor = trueDepth && !cam.error && ex ? SENSOR_BY_VISUAL[ex.visual] ?? null : null
  sensorRef.current = sensor

  // Seslendirmeyi baştan çöz; ekrandan çıkınca ses oturumu bırakılır
  useEffect(() => {
    preloadPhrases()
    return () => {
      clearTimeout(sayTimer.current)
      releaseBreathSfx(0)
    }
  }, [])

  function start() {
    unlockAudio()
    unlockBreathSfx() // ses oturumu 'playback': sessiz tuşunda da duyulur
    setStarted(true)
  }

  // "Gözlerini kapat" adımında sesli yönlendirme: kullanıcı ekranı göremez.
  function remind(kind) {
    if (kind !== 'closed') return
    const vr = voice.current
    const now = performance.now()
    if (now - vr.lastCue < CUE_GAP_MS || vr.reminders >= MAX_REMINDERS) return
    let id = null
    if (faceLost()) id = 'exNoFace'
    else if (vr.openSince != null && now - vr.openSince >= OPEN_NAG_MS) id = 'exCloseNag'
    if (!id) return
    cuePhrase(id, true)
    vr.lastCue = now
    vr.reminders += 1
  }

  // Adım başında sesli yönlendirme (gözler kapalı adımlarda ekran okunamaz)
  useEffect(() => {
    if (!started || done || !ex) return undefined
    const prev = steps[idx - 1]
    clearTimeout(sayTimer.current)
    if (prev?.visual === 'rest') {
      cuePhrase('open', false)
      sayTimer.current = setTimeout(() => sayPhrase(ex.voice), REST_OPEN_GAP_MS)
    } else cuePhrase(ex.voice, Boolean(ex.closed))
    voice.current.lastCue = performance.now()
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done, started])

  // Ritimli adımlar: nefes aşaması, kırpma (kapat/aç), yakın–uzak (iris/uzak). Adım başı komutu 0. saniyede çalar.
  useEffect(() => {
    if (!started || done || !ex || tick === 0) return
    if (ex.visual === 'breath') {
      if (tick % BREATH_CYCLE !== 0 && tick % BREATH_CYCLE !== BREATH_IN) return
      const k = breathPhaseAt(tick)
      haptic(BREATH_PHASE[k].haptic)
      sayPhrase(k)
    } else if (ex.visual === 'blink') {
      if (tick % BLINK_HALF !== 0) return
      const closed = Math.floor(tick / BLINK_HALF) % 2 === 0
      // Kamerasız: ritmi titreşim de taşır (gözler kapalı); kamerada sayım titreşimi zaten var
      if (sensor) sayPhrase(closed ? 'exBlink' : 'open')
      else cuePhrase(closed ? 'exBlink' : 'open', closed)
    } else if (ex.visual === 'nearfar') {
      if (tick % NEARFAR_HALF !== 0) return
      const near = Math.floor(tick / NEARFAR_HALF) % 2 === 0
      sayPhrase(near ? 'exNear' : 'exFarShort')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Nabız: saniyede bir. TrueDepth'te süre ilerlemez; yalnızca bekleme (ilerlemesizlik) sayılır.
  useEffect(() => {
    if (!started || done) return undefined
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, started])

  // Bakış adımı bitti: gözlemi hedefin ekrandaki konumuyla modele işle (sonraki oturumda kullanılır)
  function learnFromStep(from) {
    const o = obsCol.current
    obsCol.current = null
    if (!o?.col || o.idx !== from) return
    const el = document.querySelector('.ex-look .ex-tint')
    const r = el?.getBoundingClientRect?.()
    const W = globalThis.innerWidth
    const H = globalThis.innerHeight
    if (!r || !(W > 0) || !(H > 0)) return
    const obs = o.col.finish({ x: (r.left + r.width / 2) / W, y: (r.top + r.height / 2) / H })
    const saved = loadGazeModel()
    if (!obs || !saved) return
    const res = adaptModel(saved, obs)
    if (res.changed) saveGazeModel(res.model, { keepDate: true })
  }

  function advance(from) {
    if (doneRef.current || from !== idxRef.current) return
    learnFromStep(from)
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
      clearTimeout(sayTimer.current)
      cuePhrase(steps[from].visual === 'rest' ? 'exDoneOpen' : 'done', false)
      releaseBreathSfx() // son söz bitsin diye bekleyip bırakır
      setDone(true)
    }
  }

  const goal = ex ? goalOf(ex, sensor) : 0
  const sensorDone = Boolean(sensor) && live.value >= goal
  const timerDone = !sensor && Boolean(ex) && timer >= ex.seconds

  // Adım sonu: süreyle hemen; sensörle kısa bir başarı anından sonra
  useEffect(() => {
    if (!started || done) return undefined
    if (timerDone) {
      advance(idx)
      return undefined
    }
    if (!sensorDone) return undefined
    haptic('success')
    const from = idx
    const t = setTimeout(() => advance(from), DONE_BEAT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorDone, timerDone, idx, done, started])

  // Kayıt bir kez (yol grubunda kendiliğinden dönüş ile düğme yarışmasın)
  const saved = useRef(false)
  const save = () => {
    if (saved.current) return
    saved.current = true
    onFinish(routineRecord(set, steps, spent.current))
  }
  // Yol grubu (lib/routines.js PATH_GROUPS): kısa bitiş, kayıt ve yola dönüş. VARSAYIM: 1,2 sn sonra kendiliğinden.
  useEffect(() => {
    if (!done || !set.group) return undefined
    haptic('success')
    const id = setTimeout(save, 1200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  // ---------- Başlangıç ----------
  if (!started) {
    const voiceName = VOICE_LABEL[VOICE_LANG]?.[getPrefs().voice] ?? 'Kadın'
    return (
      <main className="ex-stage ex-start">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
          <span style={{ flex: 1 }} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-intro">
          <span className="ex-step">{set.group ? 'Bugünün yolu' : 'Egzersiz seti'} · {steps.length} hareket</span>
          <h1 className="ex-title">{set.group ? set.title : `${set.title} set`}</h1>
          <div className="ex-meta">
            <span className="ex-chip"><Clock aria-hidden="true" />≈ {formatMin(setDurationSec(set))}</span>
            <span className="ex-chip">{trueDepth ? <ScanFace aria-hidden="true" /> : <Clock aria-hidden="true" />}{trueDepth ? 'Kamera sayar' : 'Süreyle ilerler'}</span>
          </div>
        </div>
        <ol className="ex-moves" aria-label="Hareketler">
          {steps.map((s, i) => {
            const Icon = moveIcon(s)
            return (
              <li className="ex-mv" key={`${s.id}-${i}`}>
                <span className="g"><Icon aria-hidden="true" /></span>
                <span className="nm">{s.title}{s.kind === 'evidence' && <span className="ex-tag">kanıtlı</span>}</span>
                <span className="v">{moveGoal(s, trueDepth)}</span>
              </li>
            )
          })}
        </ol>
        <div className="ex-foot">
          {trueDepth && <p className="ex-fine">Kamera yalnız hareketi sayar; görüntü telefondan çıkmaz.</p>}
          <p className="ex-voice"><Volume2 aria-hidden="true" /><span>Sesli yönlendirme · <b>{voiceName}</b> · Profilim'den değişir</span></p>
          <button type="button" className="ex-btn" onClick={start}><Play aria-hidden="true" fill="currentColor" /> Başla</button>
        </div>
      </main>
    )
  }

  // ---------- Bitiş ----------
  if (done && set.group) {
    return (
      <main className="ex-stage ex-end">
        <div className="ex-res">
          <Badge />
          <span className="ex-step">Bugünün yolu · <b>durak tamam</b></span>
          <h1 className="ex-title">{set.title} tamam</h1>
          <p className="ex-honest">Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi.</p>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-skip" onClick={save}>Yola dön</button>
          <p className="ex-fine">Kendiliğinden yola dönülüyor…</p>
        </div>
      </main>
    )
  }

  if (done) {
    const total = todaySec + spent.current
    const dailyGoal = DAILY_GOAL_MIN * 60
    const reached = total >= dailyGoal
    const mins = formatMin(total).replace(' dk', '') // üst satırla aynı yuvarlama
    return (
      <main className="ex-stage ex-end">
        <div className="ex-res">
          <GoalRing frac={Math.min(1, total / dailyGoal)} reached={reached} mins={mins} />
          <span className="ex-step">{reached ? <b>Günlük hedef tamam</b> : <>Bugün · <b>{formatMin(total)} / {DAILY_GOAL_MIN} dk</b></>}</span>
          <h1 className="ex-title">{set.title} set tamam</h1>
          <div className="ex-stats">
            <div><b>{steps.length}</b><span>hareket</span></div>
            <div><b>{clock(spent.current)}</b><span>süre</span></div>
            <div><b>{formatMin(total)}</b><span>bugün</span></div>
          </div>
          <p className="ex-honest">Bakış ve daire hareketleri rahatlama içindir; görmeyi iyileştirdikleri gösterilmedi. Görmendeki değişimi "E hangi yönde" testiyle ölçüyoruz.</p>
        </div>
        {/* "Bana hatırlat" (bildirim PLAN.v1 §A.2): App ctx.remindField(route, { inPath }) verir; yol grubunda (view.jsx inPathRoute) null */}
        {remindField}
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={save}><Check aria-hidden="true" /> Kaydet</button>
        </div>
      </main>
    )
  }

  // ---------- Hareket ----------
  const faceVisible = Boolean(sensor) && cam.ready && !faceLost()
  const paused = Boolean(sensor) && !faceVisible
  const stuck = Boolean(sensor) && stall >= STALL_SKIP_SEC && !sensorDone
  const frac = sensor ? Math.min(1, live.value / goal) : Math.min(1, timer / ex.seconds)
  const sub = sensor ? ex.subTracked ?? ex.sub : ex.sub
  const gazeOn = faceVisible && GAZE_SENSORS.has(sensor)
  const gaze = gazeOn ? { x: unit(live.gaze.x), y: unit(live.gaze.y) } : null
  const secLeft = !sensor ? Math.max(0, ex.seconds - timer) : Math.max(0, Math.ceil(goal - live.value))
  const skip = () => advance(idx)

  // Sahne çizimi
  let art = null
  let overlay = null
  let now = null
  const closedPhase = Math.floor(tick / BLINK_HALF) % 2 === 0
  const nearPhase = Math.floor(tick / NEARFAR_HALF) % 2 === 0
  if (sensorDone) {
    art = <DoneArt />
    now = <span className="ex-big gold">Tamam</span>
  } else if (ex.visual === 'blink') {
    const eyeClosed = sensor ? live.ok : closedPhase
    art = <EyeArt state={eyeClosed ? 'closed' : 'open'} img={artImgs.eye} />
    now = (
      <>
        <span className="ex-word">{closedPhase ? 'Kapat · hafifçe sık' : 'Aç'}{!sensor && <small>{secLeft} sn</small>}</span>
        {sensor === 'blinks' && <Pips n={goal} f={Math.min(Math.floor(live.value), goal)} label="kırpma" />}
      </>
    )
  } else if (ex.visual === 'arrow') {
    art = <LookArt dir={ex.dir} img={artImgs.tgt} gaze={gaze} ok={gazeOn && live.ok} warn={live.wrongDir} />
    now = <span className="ex-big">{secLeft}<small>sn</small></span>
  } else if (ex.visual === 'circle') {
    const out = gaze ? Math.hypot(live.gaze.x, live.gaze.y) >= CIRCLE_MIN_DEG : false
    art = <OrbitArt dir={ex.dir} img={artImgs.eye} tracked={gazeOn} minR={CIRCLE_MIN_DEG / GAZE_FULL_DEG} gaze={gaze} out={out} warn={live.wrongWay} />
    now = sensor === 'laps'
      ? <><span className="ex-word">{Math.min(Math.floor(live.value) + 1, goal)}. tur</span><Pips n={goal} f={Math.min(Math.floor(live.value), goal)} label="tur" /></>
      : <span className="ex-big">{secLeft}<small>sn</small></span>
  } else if (ex.visual === 'far') {
    art = <HorizonArt />
    now = <span className="ex-big">{secLeft}<small>sn</small></span>
  } else if (ex.visual === 'nearfar') {
    art = nearPhase ? <><HorizonArt faint /><NearArt img={artImgs.tgt} /></> : <HorizonArt />
    now = (
      <>
        <span className="ex-word">{nearPhase ? 'İrise bak' : 'Uzağa bak'}{!sensor && <small>{secLeft} sn</small>}</span>
        {sensor === 'switches' && <Pips n={goal} f={Math.min(Math.floor(live.value), goal)} label="geçiş" />}
      </>
    )
  } else if (ex.visual === 'breath') {
    const k = breathPhaseAt(tick)
    const phLeft = k === 'in' ? BREATH_IN - (tick % BREATH_CYCLE) : BREATH_CYCLE - (tick % BREATH_CYCLE)
    overlay = <BreathVisual visual={loadBreathOpts().visual} kind={k} phaseSec={k === 'in' ? BREATH_IN : BREATH_CYCLE - BREATH_IN} size={170} />
    now = <span className="ex-word" aria-live="polite">{BREATH_PHASE[k].label}<small>{phLeft}</small></span>
  } else {
    art = <RestArt />
    now = <span className="ex-big">{secLeft}<small>sn</small></span>
  }
  const noBase = ex.visual === 'far' || ex.visual === 'nearfar'

  // Durum satırı
  let st = null
  if (sensorDone) {
    const nx = steps[idx + 1]
    st = { text: nx ? `Sıradaki: ${nx.title}` : 'Son hareket tamam', tone: 'g' }
  } else if (trueDepth && cam.error) st = { text: 'Kamera kullanılamıyor · süreyle ilerliyor', tone: 'n' }
  else if (!sensor) st = { text: 'Süreyle ilerler', tone: 'n' }
  else if (!cam.ready) st = { text: 'Kamera hazırlanıyor…', tone: 'n' }
  else if (paused) st = { text: 'Yüzün görünmüyor · sayaç durdu', tone: 'w' }
  else st = feedback(sensor, live, ex, stuck)

  const warnRing = live.wrongWay && sensor === 'laps'

  return (
    <main className={`ex-stage${ex.visual === 'rest' ? ' rest' : ''}${paused ? ' noface' : ''}`}>
      <div className="ex-top">
        <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
        <div className="ex-segs" role="progressbar" aria-label={`Adım ${idx + 1} / ${steps.length}`} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={idx + 1}>
          {steps.map((s, i) => (
            <span key={i} className={i < idx ? 'd' : ''}>
              {i === idx && <i style={{ width: `${frac * 100}%` }} />}
            </span>
          ))}
        </div>
        <SoundToggle className="ex-sound" />
      </div>

      <div className="ex-copy" key={idx}>
        <span className="ex-step">{set.title} · <b>{idx + 1} / {steps.length}</b> · <em>{KIND_LABEL[ex.kind]}</em></span>
        <h1 className="ex-title">{ex.title}</h1>
        {sub && <p className="ex-sub">{sub}</p>}
      </div>

      <div className="ex-mid">
        <Arena progress={frac} tone={warnRing ? 'warn' : 'gold'} off={paused} base={!noBase} overlay={overlay}>{art}</Arena>
      </div>

      <div className={`ex-now${paused ? ' paused' : ''}`} aria-live="polite">{now}</div>
      <div className="ex-st" role="status">{st && <span className={st.tone}>{st.text}</span>}</div>

      <div className="ex-foot">
        {sensorDone ? null : stuck ? (
          <>
            <button type="button" className="ex-btn ghost" onClick={skip}><SkipForward aria-hidden="true" /> Bu adımı atla</button>
            <p className="ex-fine">{paused ? 'Yüzün görünmediği için sayaç duruyor.' : 'Hareket algılanmıyorsa bu adımı geçebilirsin.'}</p>
          </>
        ) : (
          <button type="button" className="ex-skip" onClick={skip}>Atla <SkipForward aria-hidden="true" /></button>
        )}
      </div>
    </main>
  )
}

// Canlı geri bildirim: metin ve ton ('ok' yeşil nokta · 'g' altın · 'w' turuncu · 'n' gri)
function feedback(sensor, live, ex, stuck) {
  switch (sensor) {
    case 'blinks':
      if (stuck) return { text: 'Kırpma algılanmıyor', tone: 'w' }
      return live.ok ? { text: 'Kapalı… hafifçe sık, sonra aç', tone: 'ok' } : { text: 'Yüzün görünüyor · kırpmaları sayıyorum', tone: 'ok' }
    case 'hold':
      if (!live.calibrated) return { text: 'Önce bir an ekrana bak', tone: 'n' }
      if (live.wrongDir) return { text: `Başını çevirmeden ${DIR_WORD[ex.dir]} bak`, tone: 'w' }
      return live.ok ? { text: 'Böyle tut', tone: 'g' } : { text: 'Yüzün görünüyor', tone: 'ok' }
    case 'laps':
      // Ekrandaki halkayı izlemek yetmez (bkz. OrbitArt): bakış telefonun dışına taşmalı.
      if (!live.calibrated) return { text: 'Önce bir an ekrana bak', tone: 'n' }
      if (live.wrongWay) return { text: 'Ters yöne dönüyorsun', tone: 'w' }
      return live.value > 0 ? { text: 'Güzel, büyük ve yavaş devam et', tone: 'g' } : { text: 'Büyük ve yavaş çiz, ekranın dışına taşsın', tone: 'ok' }
    case 'closed':
      return live.ok ? { text: 'Gözlerin kapalı · bitince sesle haber vereceğim', tone: 'ok' } : { text: 'Gözlerini kapat', tone: 'w' }
    case 'far':
      if (live.phone) return { text: 'Telefona bakıyorsun · üstünden uzağa bak', tone: 'w' }
      return live.ok ? { text: 'Gözlerin uzakta, böyle kal', tone: 'g' } : { text: 'Telefonun üstünden uzaktaki bir noktaya bak', tone: 'ok' }
    case 'switches':
      return { text: live.value === 0 ? 'Önce irise, sonra telefonun üstünden uzağa bak' : 'Geçişleri sayıyorum', tone: 'ok' }
    default:
      return null
  }
}

function goalOf(ex, sensor) {
  if (sensor === 'blinks') return ex.blinks ?? 5
  if (sensor === 'laps') return ex.laps ?? 2
  if (sensor === 'switches') return ex.switches ?? 6
  return ex.seconds
}

const clock = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

// Günlük hedef halkası (dakika): dolunca altın onay
function GoalRing({ frac, reached, mins }) {
  const L = 2 * Math.PI * 80
  return (
    <svg className="ex-goal" viewBox="0 0 180 180" aria-hidden="true">
      <circle className="trk" cx="90" cy="90" r="80" />
      {frac > 0 && <circle className="arc" cx="90" cy="90" r="80" style={{ strokeDasharray: `${frac * L} ${L}` }} transform="rotate(-90 90 90)" />}
      {reached ? (
        <g className="ex-badge">
          <circle className="disc" cx="90" cy="90" r="34" />
          <path className="tick" d="M75 91 l10 10 l21 -22" strokeWidth="6" />
        </g>
      ) : (
        <>
          <text className="num" x="90" y="92" textAnchor="middle">{mins}</text>
          <text className="unit" x="90" y="118" textAnchor="middle">/ {DAILY_GOAL_MIN} DK</text>
        </>
      )}
    </svg>
  )
}

function Badge() {
  return (
    <svg className="ex-badge" viewBox="0 0 180 180" width="160" height="160" aria-hidden="true">
      <circle className="halo" cx="90" cy="90" r="70" />
      <circle className="disc" cx="90" cy="90" r="46" />
      <path className="tick" d="M70 91 l14 14 l28 -30" strokeWidth="8" />
    </svg>
  )
}
