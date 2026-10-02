// Haftalık / kısa (isteğe bağlı) yakın görme E testi (PLAN.md bölüm 4, E1–E10; kararlar S1–S13; onaylı tasarım
// nefona-e-testi.html). Akış: E1 nasıl yapılır → her göz için E2 hazırlık → E5 deneme (E6 duraklama) →
// E7 göz sonucu → E8 mola → … → E9 özet. E3 gözlük sayfası, E10 çıkış sayfası ve "Bu sayı ne anlatıyor?" alt sayfadır.
// İlkeler: deneme dışındaki her ekran 100dvh ve kaydırmasız; hiçbir düğme nedensiz kapalı değil (hazırlık tek
// kaynaktan: lib/acuityReadiness.js); ölçüm alanı her temada beyaz zemin, siyah E; biten göz hemen kaydedilir
// (onSaveEye) ve hiçbir çıkış onu silmez. Saf yardımcılar: lib/acuityFlow.js.
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Play, X, Hand, MoveHorizontal, ScanFace, CameraOff, Eye } from 'lucide-react'
import { haptic } from '../lib/native.js'
import { unlockAudio } from '../lib/cue.js'
import { unlockBreathSfx, releaseBreathSfx } from '../lib/breathSfx.js'
import { sayPhrase, preloadPhrases } from '../lib/voiceCue.js'
import { getPrefs } from '../lib/prefs.js'
import TumblingE from '../components/TumblingE.jsx'
import RestBreak from '../components/RestBreak.jsx'
import { FaceCoverArt, AcuityDistanceArt, AcuitySwipeArt, AcuityShrinkArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { REFERENCE_MM } from '../lib/distance.js'
import { renderSpec, smallestDrawableLogMAR, formatLogMAR, formatEquivalents } from '../lib/optotype.js'
import { randomDirection, PLANS, UNSEEN } from '../lib/zest.js'
import { createAcuityStaircase, finalizeEstimate, remainingDisplay } from '../lib/staircase.js'
import { createOcclusionMonitor, coverFor } from '../lib/occlusion.js'
import { acuityReadiness, occFromSnapshot, WEAR_OPTIONS } from '../lib/acuityReadiness.js'
import { createTrialGate, distanceHint } from '../lib/trialGate.js'
import { createBrightnessSession } from '../lib/brightnessSession.js'
import { watchInvertedColors } from '../lib/invertedColors.js'
import { EYE_TITLE } from '../lib/today.js'
import { dayKey } from '../lib/calendar.js'
import {
  eyesFor, startIndex, nextEyeIndex, COVER_PHRASE, setupSubtitle, wearLabel, glassesOutcome, exitSheet, pauseCard, remainingLabel,
  resultFacts, valueText, rangeNote, rulerPos, rulerLabel, RULER_TICKS, summaryTitle, restNext, progressSegments, atGateOf, rawLines,
  buildEyeRecord, setupPhraseId, createVoiceCoach, phraseMs, methodAfterCameraStop, NO_FACE_OFFER_MS, REST_PHRASE, REST_TITLE,
  waitCard, REJECT_HINT_MS, distancePill, SKIPPED_TEXT,
} from '../lib/acuityFlow.js'
import '../styles/acuity.css'

// Gözlük seçenekleri (E3; ReadingTest de kullanır)
export const WEAR = WEAR_OPTIONS

// Isınma harfleri büyük (1,0 logMAR ≈ 20/200) ve sayılmaz; iniş 0,8'den başlar (staircase.js).
const WARMUP_LOGMAR = 1.0
const SWIPE_MIN_PX = 30
const FEEDBACK_MS = 250
const PULSE_MS = 600
const TICK_MS = 100
const OPEN_MS = 300 // Başla: çizim alanı beyaz ölçüm alanına genişler
const HOWTO_AUTO_MS = 1200 // 1. kart: telefon 36–44 cm'de bu kadar tutulunca kendiliğinden geçer
// Gözler arası konfor molası (sn). Kanıt ve gerekçe: components/RestBreak.jsx.
const REST_SECONDS = 20

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

function swipeDirection(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return null
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

// Ham kapak/derinlik satırları yalnız geliştirici derlemesinde (VITE_APP_BUILD=dev; import.meta.env.DEV değil)
const appBuild = () => {
  try {
    return import.meta.env?.VITE_APP_BUILD ?? null
  } catch {
    return null
  }
}

// Sonuç sayısı büyük harften (1,0) gerçek değere doğru akar
function useCountUp(target, ms = 900) {
  const startOf = (t) => (prefersReducedMotion() ? t : Math.max(1.0, t + 0.3))
  const [v, setV] = useState(() => startOf(target))
  useEffect(() => {
    const from = startOf(target)
    if (from === target || typeof requestAnimationFrame !== 'function') {
      setV(target)
      return undefined
    }
    let raf = 0
    const t0 = now()
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms)
      const e = 1 - (1 - k) ** 3
      setV(from + (target - from) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

const CORRECTION_FROM = { acuity: 'last', reading: 'last', profile: 'profile' }
const isWear = (id) => WEAR_OPTIONS.some((w) => w.id === id)

// lastCorrection: son E testindeki seçim (eski 'glasses' olabilir). defaultCorrection / correctionSource / skipEyes /
// newBaseline / todayHolds / runDay: modules/*/view.jsx açılışta bir kez hesaplar (lib/acuityStart.js). onSaveEye(kayıt):
// göz bittiği an (S4). newBaseline: yarım günde biten göz "Evet, yenilendi" ile kaydedildi → kalan gözler de yeni seri.
// runDay: koşu günü ('YYYY-MM-DD'; yoksa açılışın yerel günü). Her göz kaydına yazılır (lib/today.js runDayOf): gece
// yarısını geçen koşunun gözleri başladığı güne sayılır. Gece yarısı geçtiyse çıkış sayfası "Kalanlar Bugün'de bekler."
// demez (test ertesi gün baştan açılır).
export default function AcuityTest({
  plan = 'daily',
  calibration,
  distanceCal,
  lastCorrection = null,
  defaultCorrection,
  correctionSource = null,
  skipEyes = [],
  newBaseline = false,
  todayHolds = true,
  runDay,
  onSaveEye,
  onFinish,
  onCancel,
}) {
  const planSpec = PLANS[plan] ?? PLANS.daily
  const { warmup } = planSpec
  const EYES = eyesFor(plan)
  const pxPerMm = calibration.pxPerMm
  const dpr = calibration.dpr
  const tracked = Boolean(distanceCal)
  const nativeTD = distanceCal?.method === 'truedepth'

  // Açılış değerleri: yalnız ilk çizimde okunur (göz kaydedilince tests değişir, ekran ortasında kaymasın)
  const [init] = useState(() => {
    const legacy = lastCorrection === 'glasses'
    const pre = defaultCorrection !== undefined ? defaultCorrection : legacy ? null : lastCorrection
    const value = isWear(pre) ? pre : null
    const from = value ? (defaultCorrection !== undefined ? CORRECTION_FROM[correctionSource] ?? null : 'last') : null
    const day = typeof runDay === 'string' ? runDay : dayKey(new Date())
    return { skip: [...(skipEyes ?? [])], first: startIndex(eyesFor(plan), skipEyes), correction: value, from, legacy: legacy && !value, runDay: day }
  })
  // Kalan gözler Bugün kartında bekler mi: açılıştaki durum ve koşu günü sürüyor (gece yarısı geçmedi)
  const holdsToday = () => todayHolds && dayKey(new Date()) === init.runDay

  const [correction, setCorrection] = useState(init.correction)
  const [corrFrom, setCorrFrom] = useState(init.from)
  const [changed, setChanged] = useState(() => newBaseline === true) // gözlük/lens numarası değişti → yeni baz çizgisi
  const [eyeIdx, setEyeIdx] = useState(init.first)
  const [phase, setPhase] = useState(() => (howtoSeen('acuity') ? 'setup' : 'howto')) // howto | setup | trial | eye-done | rest | summary
  const [howtoFrom, setHowtoFrom] = useState('first') // 'first' (ilk kez) | 'help' ("?" ile)
  const [sheet, setSheet] = useState(null) // null | 'glasses' | 'exit' | 'explain'
  const [selfConfirm, setSelfConfirm] = useState({ cover: false, distance: false })
  const [occ, setOcc] = useState(null)
  const [pulse, setPulse] = useState(null) // { key, n }
  const [announce, setAnnounce] = useState('')
  const [inverted, setInverted] = useState(false)
  const [cameraless, setCameraless] = useState(false) // "Kamerasız devam" (kamera test ortasında durdu)
  const [closed, setClosed] = useState(false) // çıkıldı: kamera kapanır
  const [trialNo, setTrialNo] = useState(0) // ısınma dahil cevaplanan deneme
  const [letter, setLetter] = useState(null) // { unit, dir, n } — ekrandaki harf (dondurulmuş boyut)
  const [feedback, setFeedback] = useState(null)
  const [gateView, setGateView] = useState({ paused: false, reason: null, offer: false }) // offer: "Kamerasız devam"
  const [hint, setHint] = useState(null) // test sürerken harf yuvasındaki neden kartı (acuityFlow waitCard)
  const [waiting, setWaiting] = useState(false) // Başla / düzelme sonrası ilk harf bekleniyor (açılış ya da cümle sürüyor)
  const [camStopped, setCamStopped] = useState(false)
  const [results, setResults] = useState([]) // bu koşuda biten (ve kaydedilen) gözler

  const occMon = useRef(null)
  if (occMon.current == null) occMon.current = createOcclusionMonitor(coverFor(EYES[init.first]))
  const gateRef = useRef(null)
  const stairRef = useRef(null)
  const runRef = useRef(null)
  const resultsRef = useRef([])
  const letterRef = useRef(null)
  const fbRef = useRef(false) // geri bildirim sürüyor (250 ms): yeni harf gösterilmez
  const trialNoRef = useRef(0)
  const seqRef = useRef(0)
  const progMax = useRef(0)
  const shownRem = useRef(Infinity) // "~N harf kaldı" sayısı hiç artmasın (staircase.js remainingDisplay)
  const presentAfter = useRef(0)
  const hintUntil = useRef(0) // neden kartı en az bu ana dek görünür; yeni harf beklemede
  const hintWhy = useRef(null) // kartın nedeni (trialGate answer().why / hold): 'too-far', 'wrong-eye', 'moved', …
  const voiceBusyUntil = useRef(0)
  const coachRef = useRef(null)
  if (coachRef.current == null) coachRef.current = createVoiceCoach()
  const brightnessRef = useRef(null)
  const pointer = useRef(null)
  const occUi = useRef(0)
  const timers = useRef(new Set())
  const unlocked = useRef(false)
  const waitingRef = useRef(false)
  const noFaceSince = useRef(null) // yüz görünmediği için duraklamanın başladığı an ("Kamerasız devam" önerisi)
  const pendingEye = useRef(null) // çıkış sayfası açıkken mola bitti: sayfa kapanınca bu göze geçilir
  const eyeStart = useRef(now()) // bu gözün başladığı an (kayıtta gerçek süre)
  const spokeOpen = useRef(false) // açılış cümlesi bir kez (StrictMode geliştirmede efekti iki kez çalıştırır)

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  // ——— Kamera: tek ve kalıcı <video> öğesi (web yolu), molada TrueDepth'i RestBreak kullanır ———
  const occDetect = nativeTD && !cameraless
  const camOn = tracked && !cameraless && !closed && phase !== 'summary' && !(phase === 'rest' && nativeTD)
  const showOcc = (snap, ts) => {
    if (ts - occUi.current > 90 || snap.state !== occ?.state || snap.gateReady !== occ?.gateReady) {
      occUi.current = ts
      setOcc(snap)
    }
  }
  const cam = useFaceTracking({
    enabled: camOn,
    distanceCal,
    onFrame: (f) => {
      if (!occDetect || !occMon.current) return
      const ts = f.ts ?? now()
      showOcc(occMon.current.push(f, ts), ts)
    },
    // Derinlik (FaceDistancePlugin "depth"): hangi göz örtülü + el yüzü örtünce açık gözden mesafe
    onDepth: occDetect
      ? (d) => {
        if (!occMon.current) return
        const ts = d.ts ?? now()
        showOcc(occMon.current.pushDepth(d, ts), ts)
      }
      : undefined,
    depthDistance: occDetect,
  })
  const camErr = cameraless ? null : cam.error ?? null
  const liveMm = camOn && Number.isFinite(cam.mm) ? cam.mm : null

  const eye = EYES[eyeIdx]
  const need = coverFor(eye)
  const doneEyes = [...init.skip, ...results.map((r) => r.eye)]
  // Sıradaki göz: bugün kaydedilmemiş ilk göz (atlananlar baştan ardışık olmayabilir); −1 = kalmadı
  const nextIdx = nextEyeIndex(EYES, eyeIdx, doneEyes)

  // ——— E2 hazırlık: üç satır ve düğme tek kaynaktan ———
  const readiness = acuityReadiness({
    eye,
    eyeIdx,
    correction: correction ?? (init.legacy ? 'glasses' : null),
    correctionFrom: correction ? corrFrom : init.legacy ? 'legacy' : null,
    inverted,
    cam: { error: camErr, face: Boolean(cam.face) },
    occ: occDetect && !camErr ? occFromSnapshot(occ) : null,
    distance: { mm: liveMm, tracked: tracked && !cameraless },
    selfConfirm,
  })

  const minX = Math.max(-0.3, smallestDrawableLogMAR(REFERENCE_MM, pxPerMm, dpr) + 0.02)
  const drawable = (x, mm) => Math.max(x, smallestDrawableLogMAR(mm, pxPerMm, dpr))

  // Her renderda güncel değerler (zamanlayıcılar eski kapanışa takılmasın)
  const L = useRef({})
  L.current = { phase, sheet, eye, need, readiness, liveMm, camErr, camStopped, gateView, nextIdx, onSaveEye, onFinish, onCancel }

  // ——— Ses (S13): yalnız hazırlıkta, duraklamada ve gözler arasında; harf ekrandayken asla ———
  // Cümle yarıda kesilmez: hazırlık koçu çalan cümle bitmeden yenisini vermez (coach.next); zorla söylenen cümle
  // (duraklama, göz başı, mola) çalanı yalnız o farklı ve daha düşük öncelikliyse keser (coach.force; acuityFlow).
  function speakCue(id, { force = false } = {}) {
    if (!id || letterRef.current) return
    const ts = now()
    if (force && !coachRef.current.force(id, ts)) return
    let sound = false
    try {
      sound = Boolean(getPrefs().sound)
    } catch {
      sound = false
    }
    if (!sound) return
    sayPhrase(id)
    // Kesilen cümlenin kalanı beklenmez: harf yeni cümlenin sonuna dek bekler
    voiceBusyUntil.current = ts + phraseMs(id)
  }
  const unlockOnce = () => {
    if (unlocked.current) return
    unlocked.current = true
    unlockBreathSfx()
  }

  const brightness = () => {
    if (!brightnessRef.current) brightnessRef.current = createBrightnessSession()
    return brightnessRef.current
  }

  // Açılış: sesler önceden çözülür, ters renk izlenir; çıkışta parlaklık ve ses oturumu bırakılır
  useEffect(() => {
    try {
      preloadPhrases?.()
    } catch {
      // ses yok
    }
    const stopInv = watchInvertedColors((v) => setInverted(Boolean(v)))
    const pending = timers.current
    return () => {
      stopInv?.()
      pending.forEach(clearTimeout)
      pending.clear()
      gateRef.current?.cancel()
      brightnessRef.current?.end()
      if (unlocked.current) releaseBreathSfx()
    }
  }, [])
  // İlk göz hazırlıkla açıldıysa örtme cümlesi (bir kez: StrictMode efekti iki kez çalıştırsa da)
  useEffect(() => {
    if (spokeOpen.current) return
    spokeOpen.current = true
    if (phase === 'setup') speakCue(COVER_PHRASE[EYES[init.first]], { force: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deneme sırasında sayfa kökü de beyaz (durum çubuğu altında koyu şerit kalmasın). VARSAYIM: iPhone'da durum
  // çubuğu yazısının rengini native belirler; burada yalnız zemin ve theme-color değişir (cihazda doğrulanmadı).
  useEffect(() => {
    if (phase !== 'trial' || typeof document === 'undefined') return undefined
    const root = document.documentElement
    const meta = document.querySelector?.('meta[name="theme-color"]')
    const prev = { bg: root?.style?.background ?? '', scheme: root?.style?.colorScheme ?? '', meta: meta?.getAttribute?.('content') ?? null }
    try {
      root.style.background = '#fff'
      root.style.colorScheme = 'light'
      meta?.setAttribute?.('content', '#ffffff')
    } catch {
      // yoksay
    }
    return () => {
      try {
        root.style.background = prev.bg
        root.style.colorScheme = prev.scheme
        if (prev.meta != null) meta?.setAttribute?.('content', prev.meta)
      } catch {
        // yoksay
      }
    }
  }, [phase])

  // ——— Zaman adımı (100 ms): örtme izleyicisi, hazırlık sesi, deneme kapısı ———
  useEffect(() => {
    if (phase !== 'setup' && phase !== 'trial') return undefined
    const id = setInterval(() => {
      const ts = now()
      let snap = null
      if (occDetect && occMon.current) {
        snap = occMon.current.tick(ts)
        showOcc(snap, ts)
      }
      const cur = L.current
      if (cur.phase === 'setup' && !cur.sheet) {
        const say = coachRef.current.next(setupPhraseId(cur.readiness?.button, cur.eye), ts)
        if (say) speakCue(say)
      } else if (cur.phase === 'trial') trialTick(ts, snap)
    }, TICK_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, occDetect])

  // ——— Göz geçişi: sıfırlama geçişin içinde (Build 27; useEffect'te değil) ———
  function enterEye(idx) {
    gateRef.current?.cancel()
    gateRef.current = null
    pendingEye.current = null
    eyeStart.current = now()
    occMon.current = createOcclusionMonitor(coverFor(EYES[idx]))
    setOcc(null)
    setSelfConfirm({ cover: false, distance: false })
    setPulse(null)
    setLetter(null)
    letterRef.current = null
    setFeedback(null)
    setGateView({ paused: false, reason: null, offer: false })
    clearHint()
    markWaiting(false)
    noFaceSince.current = null
    setCamStopped(false)
    // "Kamerasız devam" yalnız o göz içindi: sıradaki gözde kamera yeniden denenir; yine açılmazsa cam.error ile
    // kamerasız moda (E4) kendiliğinden düşülür
    setCameraless(false)
    setTrialNo(0)
    trialNoRef.current = 0
    fbRef.current = false
    coachRef.current.reset()
    setEyeIdx(idx)
    setPhase('setup')
    speakCue(COVER_PHRASE[EYES[idx]], { force: true })
  }

  // ——— E1 ———
  function openHelp() {
    setHowtoFrom('help')
    setPhase('howto')
  }
  function closeHowto(understood) {
    if (understood) markHowtoSeen('acuity') // "Anladım" kalıcı kapatır (S11)
    const first = howtoFrom === 'first'
    setPhase('setup')
    if (first) speakCue(COVER_PHRASE[eye], { force: true })
  }

  // ——— E2 eylemleri ———
  function doPulse(key) {
    setPulse({ key, n: (pulse?.n ?? 0) + 1 })
    later(() => setPulse((p) => (p?.key === key ? null : p)), PULSE_MS)
  }
  // type: 'toggle' (kendin-onay anahtarı: aç/kapa) | 'action' ("Seç ›", "Değiştir", "Örttüm": onaylar)
  function rowAction(action, type) {
    unlockOnce()
    haptic('tick')
    if (action === 'glasses') {
      setSheet('glasses')
      return
    }
    const flip = type === 'toggle'
    if (action === 'self-cover') setSelfConfirm((s) => ({ ...s, cover: flip ? !s.cover : true }))
    else if (action === 'self-distance') setSelfConfirm((s) => ({ ...s, distance: flip ? !s.distance : true }))
  }
  function onCta() {
    unlockOnce()
    const b = readiness.button
    if (b.ready) {
      haptic('tick')
      startEye()
      return
    }
    if (b.action === 'confirm-lid') {
      const ts = now()
      showOcc(occMon.current.confirmLid(ts), ts)
      haptic('tick')
      return
    }
    // Hazır değil: uyarı titreşimi, eksik satır 600 ms nabız, VoiceOver satırı okur
    haptic('warning')
    const key = b.targetRow ?? 'notice'
    doPulse(key)
    const row = readiness.rows.find((r) => r.key === b.targetRow)
    const say = row ? `${row.label}: ${row.value}` : readiness.notice ? `${readiness.notice.title} ${readiness.notice.body}` : b.text
    // Aynı metin yeniden okunsun diye (VoiceOver değişmeyen canlı bölgeyi okumaz) görünmez bir işaret eklenip çıkarılır
    setAnnounce((prev) => (prev === say ? `${say}\u200b` : say))
    if (b.action === 'glasses') setSheet('glasses')
  }

  // Gözlük sayfası (E3)
  function pickGlasses(id) {
    if (id !== correction) setChanged(false)
    setCorrection(id)
    setCorrFrom(null)
  }

  // ——— Başla ———
  function startEye() {
    const r = readiness
    if (!r.button.ready) return
    const ts = now()
    unlocked.current = true
    unlockBreathSfx() // ses oturumu Başla dokunuşunda açılır (iOS); çıkışta bırakılır
    unlockAudio()
    brightness().start() // parlaklık %100 (S7); eski değer kayda
    const trackedMode = r.mode === 'camera'
    const snap = occDetect ? occMon.current.snapshot(ts) : null
    occMon.current.resetStats()
    const quantize = (x) => {
      const mm = runRef.current?.tracked && Number.isFinite(L.current.liveMm) ? L.current.liveMm : REFERENCE_MM
      const sp = renderSpec(drawable(x, mm), mm, pxPerMm, dpr)
      return sp.drawable ? sp.realizedLogMAR : x
    }
    stairRef.current = createAcuityStaircase(planSpec, { minX, maxX: 1.3, quantize })
    gateRef.current = createTrialGate({
      pxPerMm,
      phase: warmup > 0 ? 'warmup' : 'counted',
      distanceTracked: trackedMode,
      occlusion: trackedMode && occDetect,
      selfConfirmed: r.method === 'camera-self',
    })
    runRef.current = { method: r.method, atGate: atGateOf(snap), tracked: trackedMode, samples: [], cantSee: 0, camFailedMidTest: false }
    progMax.current = 0
    shownRem.current = Infinity
    presentAfter.current = Math.max(ts + (prefersReducedMotion() ? 0 : OPEN_MS), voiceBusyUntil.current)
    setTrialNo(0)
    trialNoRef.current = 0
    fbRef.current = false
    setLetter(null)
    letterRef.current = null
    setFeedback(null)
    setGateView({ paused: false, reason: null, offer: false })
    clearHint()
    noFaceSince.current = null
    markWaiting(true) // ilk harf gelene dek oklar soluk; dokunuş hafif titreşimle karşılanır
    setCamStopped(false)
    setSheet(null)
    setPhase('trial')
  }

  // ——— Deneme (E5/E6) ———
  function markWaiting(v) {
    if (waitingRef.current === v) return
    waitingRef.current = v
    setWaiting(v)
  }

  // Test sürerken harf yuvasındaki neden kartı (duraklama kartının emri; "Test durdu" satırı ve ses yok). minMs: kart en
  // az bu kadar kalır (sayılmayan cevabın nedeni okunabilsin); o arada yeni harf gösterilmez, oklar soluk. Kartı zaman
  // adımı kaldırır (syncHint): aynı neden sürerse kart aralıksız kalır, yuvada boşluk olmaz.
  function showHint(why, ts, minMs) {
    const card = waitCard(why, L.current.need)
    if (!card) return
    hintWhy.current = why
    hintUntil.current = ts + minMs
    setHint(card)
    markWaiting(true)
  }
  function clearHint() {
    hintWhy.current = null
    hintUntil.current = 0
    setHint(null)
  }
  // Harf açılamıyor ama test durmadı (sayılan evrede 36–44 cm dışı, 35–45 içi; örtme engeli; lib/trialGate.js hold):
  // HOLD_HINT_MS sonra harf yuvasında ne yapılacağı yazar, neden sürdükçe kalır. Neden bitince (ve en kısa süre
  // dolunca) kalkar; harf aynı adımda gelir.
  function syncHint(res, ts) {
    const why = hintWhy.current
    if (res.hold && (res.holdHint || res.hold === why)) {
      if (res.hold !== why && ts >= hintUntil.current) showHint(res.hold, ts, 0)
    } else if (why && ts >= hintUntil.current) clearHint()
  }

  function trialTick(ts, snap) {
    const g = gateRef.current
    const run = runRef.current
    if (!g || !run) return
    const cur = L.current
    // Kamera hatası (cam.error) sürdükçe "Kamera durdu"; kamera geri gelirse kart kalkar, test kendiliğinden sürer
    const stopped = Boolean(run.tracked && cur.camErr)
    if (stopped !== cur.camStopped) setCamStopped(stopped)
    const res = g.push({
      ts,
      mm: run.tracked ? cur.liveMm ?? null : undefined,
      occ: run.tracked && snap ? snap.state : undefined,
    })
    if (res.pausedNow) pausedNow()
    // Yüz NO_FACE_OFFER_MS'dir görünmüyor: kamera hata vermeden durmuş olabilir (web yolu) → "Kamerasız devam" önerilir
    const noFace = run.tracked && res.paused && res.reason === 'no-face'
    if (!noFace) noFaceSince.current = null
    else if (noFaceSince.current == null) noFaceSince.current = ts
    const offer = noFace && ts - noFaceSince.current >= NO_FACE_OFFER_MS
    const v = cur.gateView
    if (res.paused !== v.paused || res.reason !== v.reason || offer !== v.offer) setGateView({ paused: res.paused, reason: res.reason, offer })
    if (res.paused) return
    syncHint(res, ts)
    present(ts)
  }

  // Test durdu: harf gizlenir; çıkış sayfası açıksa titreşim ve ses yok (sayfa kapanınca kart görünür). Duraklama
  // kartı nedeni kendisi söyler: önceki neden kartı (hint) kalkar, test sürünce eski haliyle geri gelmez.
  function pausedNow() {
    setLetter(null)
    letterRef.current = null
    clearHint()
    markWaiting(false)
    if (L.current.sheet) return
    haptic('warning')
    speakCue('acuPaused', { force: true })
  }

  // Harf göründüğü an boyutu dondurulur (H2). Aynı hedef duraklama ya da reddedilen cevaptan sonra yeni rastgele
  // yönle yeniden gösterilir (yön her gösterimde bağımsız çekilir).
  function present(ts) {
    const cur = L.current
    const g = gateRef.current
    const run = runRef.current
    if (cur.phase !== 'trial' || cur.sheet || fbRef.current || !g || !run || letterRef.current) return
    const st = g.status()
    if (st.paused || st.open) return
    // Açılış (300 ms), cümle ya da neden kartı sürüyor: harf bekler, oklar soluk (dokunuş sessizce kaybolmaz: answer)
    if (ts < presentAfter.current || ts < voiceBusyUntil.current || ts < hintUntil.current) {
      markWaiting(true)
      return
    }
    const mm = run.tracked ? cur.liveMm : REFERENCE_MM
    if (!Number.isFinite(mm)) return
    const warm = trialNoRef.current < warmup
    const x = warm ? WARMUP_LOGMAR : stairRef.current.next().logMAR
    const spec = renderSpec(drawable(x, mm), mm, pxPerMm, dpr)
    if (!spec.drawable) return
    if (!g.freeze(spec.unitCssPx, mm, ts)) {
      // Harf açılmadı: sayılan evrede 36–44 cm dışı (cm göstergesi bant dışını gösterir) ya da örtme engeli. Test
      // durmaz (duraklamayı yalnız 300 / 700 ms kuralları başlatır, lib/trialGate.js); oklar soluk, bekleyiş
      // sürerse nedeni harf yuvasında (syncHint).
      markWaiting(true)
      return
    }
    if (hintWhy.current) clearHint()
    markWaiting(false)
    seqRef.current += 1
    const l = { unit: spec.unitCssPx, dir: randomDirection(), n: seqRef.current }
    letterRef.current = l
    setLetter(l)
  }

  // choice: yön veya null ("Göremiyorum"). Göremiyorum yanlış sayılmaz: posteriora rastgele yön seçiminin
  // beklenen olabilirliğiyle girer (zest.js UNSEEN).
  function answer(choice) {
    const cur = L.current
    if (cur.phase !== 'trial' || cur.sheet) return
    const g = gateRef.current
    const l = letterRef.current
    if (!g) return
    if (!l || fbRef.current) {
      // Duraklamada dokunuş sessizce kaybolmaz: hafif titreşim ve kart nabzı. İlk harf beklenirken (oklar soluk)
      // hafif titreşim.
      if (g.status().paused) {
        haptic('tick')
        doPulse('pause')
      } else if (waitingRef.current) haptic('tick')
      return
    }
    const ts = now()
    const run = runRef.current
    const mm = run.tracked ? cur.liveMm ?? null : undefined
    const res = g.answer(mm, ts)
    if (res.reason === 'paused') return
    letterRef.current = null
    setLetter(null)
    if (!res.accepted) {
      // Sayılmadı (36–44 cm dışı / mesafe %5'ten çok değişti / mesafe yok / örtme engeli): aynı hedef yeni yönle
      // yeniden gösterilir; test durmaz. Nedeni REJECT_HINT_MS boyunca harf yuvasında yazar (ses yok).
      haptic('warning')
      showHint(res.why, ts, REJECT_HINT_MS)
      return
    }
    haptic('tick')
    const unseen = choice === null
    const correct = !unseen && choice === l.dir
    if (res.count) {
      stairRef.current.update(res.realizedLogMAR, unseen ? UNSEEN : correct)
      if (Number.isFinite(mm)) run.samples.push(mm)
      if (unseen) run.cantSee += 1
    }
    fbRef.current = true
    setFeedback(correct ? 'ok' : 'no')
    const n = trialNoRef.current + 1
    later(() => {
      fbRef.current = false
      setFeedback(null)
      if (res.count && stairRef.current.done()) {
        finishEye()
        return
      }
      if (n === warmup) gateRef.current?.setPhase('counted', now())
      trialNoRef.current = n
      setTrialNo(n)
    }, FEEDBACK_MS)
  }

  // "Kamerasız devam" (E6): gözün kalanı 40 cm varsayımıyla, örtmeyi kamera izlemeden. Kayıttaki yöntem kameranın
  // doğruladığını söylemez (S8; acuityFlow methodAfterCameraStop). Gizli eski harf yeniden görünmez: yeni harf gelir.
  function continueWithoutCamera() {
    const g = gateRef.current
    const run = runRef.current
    if (!g || !run) return
    g.continueWithoutCamera(now())
    run.tracked = false
    run.camFailedMidTest = true
    run.gateMethod = run.gateMethod ?? run.method
    run.method = methodAfterCameraStop(run.method)
    setLetter(null)
    letterRef.current = null
    clearHint()
    noFaceSince.current = null
    setCameraless(true)
    setCamStopped(false)
    setGateView({ paused: false, reason: null, offer: false })
  }

  function finishEye() {
    const ts = now()
    const cur = L.current
    const est = stairRef.current.estimate()
    const run = runRef.current
    const d = run.samples
    const meanMm = d.length ? d.reduce((a, b) => a + b, 0) / d.length : REFERENCE_MM
    // Harf canlı mesafede çizildiği için ekranın tabanı da ölçülen mesafeye göre (staircase.js finalizeEstimate)
    const floorLimit = Math.min(1.3, Math.max(minX, smallestDrawableLogMAR(meanMm, pxPerMm, dpr) + 0.02))
    const fin = finalizeEstimate(est, floorLimit)
    const b = brightnessRef.current?.state() ?? null
    const rec = buildEyeRecord({
      plan,
      eye: cur.eye,
      est,
      fin,
      correction,
      changed,
      run,
      gateStats: gateRef.current?.stats(ts) ?? null,
      brightness: b ? { from: b.from, forced: b.applied } : null,
      trialsMax: planSpec.trials,
      device: { pxPerMm, dpr, screenW: globalThis.screen?.width ?? null, screenH: globalThis.screen?.height ?? null },
      seconds: (ts - eyeStart.current) / 1000,
      runDay: init.runDay,
    })
    gateRef.current?.cancel()
    const all = [...resultsRef.current, rec]
    resultsRef.current = all
    setResults(all)
    haptic('success')
    try {
      cur.onSaveEye?.(rec) // S4: biten göz hemen kaydedilir
    } catch {
      // kayıt hatası testi durdurmasın; sonda onFinish yine yazar
    }
    // Sıradaki göz yoksa özet. Göz sonucunda ve özette konuşulmaz (ekranda karşılığı olan cümle yok; S13)
    const last = nextEyeIndex(EYES, eyeIdx, [...init.skip, ...all.map((r) => r.eye)]) < 0
    if (last) {
      brightnessRef.current?.end() // test bitti: parlaklık eski değere
      setPhase('summary')
    } else {
      setPhase('eye-done')
    }
  }

  // ——— Gözler arası ———
  // Mola başında "Uzağa bak." (mola ekranının başlığı; sayaç ancak mola açılınca işler)
  function nextEye() {
    unlockAudio() // molanın sonunda sesli haber verebilmek için (dokunuş içinde)
    unlockOnce()
    setPhase('rest')
    speakCue(REST_PHRASE, { force: true })
  }
  // Mola bitti / atlandı. Çıkış sayfası açıksa sıradaki göz sayfa kapanınca açılır (sayfanın altında ses çıkmasın).
  const afterRest = () => {
    const idx = L.current.nextIdx
    if (idx < 0) return
    if (L.current.sheet === 'exit') {
      pendingEye.current = idx
      return
    }
    enterEye(idx)
  }
  function closeSheet() {
    setSheet(null)
    const idx = pendingEye.current
    if (idx != null && L.current.phase === 'rest') enterEye(idx)
  }

  // ——— Çıkış (E10) ———
  function requestExit() {
    const plan10 = exitSheet({ saved: resultsRef.current.map((r) => r.eye), started: L.current.phase === 'trial', todayHolds: holdsToday() })
    if (plan10.direct) doExit()
    else setSheet('exit')
  }
  function doExit() {
    gateRef.current?.cancel()
    setSheet(null)
    setClosed(true) // kamera kapanır
    brightnessRef.current?.end() // parlaklık geri
    if (unlocked.current) releaseBreathSfx()
    const cur = L.current
    // Biten gözler onSaveEye ile zaten kaydedildi; eski çağıran (onSaveEye yok) için sonuçlar yine yazılır
    if (!cur.onSaveEye && resultsRef.current.length) cur.onFinish?.(resultsRef.current)
    else cur.onCancel?.()
  }
  function finishAll() {
    brightnessRef.current?.end()
    if (unlocked.current) releaseBreathSfx()
    setClosed(true)
    L.current.onFinish?.(resultsRef.current)
  }

  // Klavye (masaüstünde deneme için)
  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      if (map[e.key]) answer(map[e.key])
    }
    globalThis.addEventListener?.('keydown', onKey)
    return () => globalThis.removeEventListener?.('keydown', onKey)
  })

  // ——— Çizim ———
  const stop = (e) => e.stopPropagation()
  const video = tracked ? <video ref={cam.videoRef} className="cam-hidden" playsInline muted aria-hidden="true" /> : null
  const lastResult = results.at(-1)

  let screen = null
  if (phase === 'howto') {
    screen = (
      <Howto
        tracked={tracked && !cameraless && !camErr}
        mm={liveMm}
        warmup={warmup}
        onClose={() => (howtoFrom === 'help' ? closeHowto(false) : requestExit())}
        onDone={() => closeHowto(true)}
      />
    )
  } else if (phase === 'setup') {
    const b = readiness.button
    const coverRow = readiness.rows.find((r) => r.key === 'cover')
    const faceState = coverRow?.status === 'ok' ? 'ok' : coverRow?.status === 'bad' ? 'bad' : 'wait'
    const raw = occDetect ? rawLines(occ, appBuild()) : []
    const notice = readiness.notice
    screen = (
      <div className="acu-scr" key={`setup-${eyeIdx}`}>
        <div className="acu-body">
          <div className="acu-top">
            <button type="button" className="acu-ib" onClick={requestExit} aria-label="Testten çık"><X size={20} aria-hidden="true" /></button>
            <Progress segs={progressSegments(EYES, eyeIdx, doneEyes)} label={`${eyeIdx + 1}/${EYES.length}`} />
            <button type="button" className="acu-ib acu-q" onClick={openHelp} aria-label="Nasıl yapılır?">?</button>
          </div>
          <div className="acu-ttl">
            <h1>{EYE_TITLE[eye]}</h1>
            <p>{setupSubtitle(eye)}</p>
          </div>
          <div className="acu-art">
            {notice ? (
              <div className={`acu-notice${pulse?.key === 'notice' ? ' pulse' : ''}`} id="acu-row-notice" role="status">
                <b>{notice.title}</b>
                <span>{notice.body}</span>
              </div>
            ) : (
              <FaceCoverArt cover={need === 'none' ? null : need} state={faceState} />
            )}
            {raw.length > 0 && (
              <div className="acu-raw" aria-hidden="true">
                {raw.map((t) => <span key={t}>{t}</span>)}
              </div>
            )}
          </div>
          <div className="acu-rows">
            {readiness.rows.map((row) => (
              <ReadyRow key={row.key} row={row} pulse={pulse?.key === row.key} onAction={rowAction} />
            ))}
          </div>
          <p className="acu-note">Oda aydınlık olsun. Test alanı beyazdır.</p>
          <Cta button={b} onClick={onCta} />
        </div>
      </div>
    )
  } else if (phase === 'trial') {
    const isWarm = trialNo < warmup
    const run = runRef.current
    const prog = stairRef.current?.progress()
    let remText = ''
    if (isWarm) remText = `~${warmup - trialNo + planSpec.minTrials} harf kaldı`
    else if (prog) {
      const rd = remainingDisplay(prog, shownRem.current)
      shownRem.current = rd.shown
      remText = remainingLabel(rd)
    }
    const remaining = isWarm ? warmup - trialNo + planSpec.minTrials : prog?.remaining ?? 0
    progMax.current = Math.max(progMax.current, trialNo / Math.max(1, trialNo + remaining))
    const paused = gateView.paused || camStopped
    // Duraklama kartı; test sürerken sayılmayan cevabın ya da açılamayan harfin nedeni (hint)
    const card = paused ? pauseCard({ reason: gateView.reason, need, camStopped, offerNoCamera: gateView.offer }) : hint
    // Oklar soluk ve aria-disabled: duraklamada ve ilk harf beklenirken
    const inactive = paused || (waiting && !letter)
    const pill = run?.tracked ? distancePill(liveMm) : null
    screen = (
      <div
        className={`acu-clinic${feedback ? ` fb-${feedback}` : ''}`}
        onPointerDown={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          if (!pointer.current) return
          const d = swipeDirection(e.clientX - pointer.current.x, e.clientY - pointer.current.y)
          pointer.current = null
          if (d) answer(d)
        }}
      >
        <div className="acu-body">
          <div className="acu-tbar">
            <button type="button" className="acu-ib" onClick={requestExit} aria-label="Testten çık" onPointerDown={stop} onPointerUp={stop}><X size={20} aria-hidden="true" /></button>
            <div className="mid">
              <b>{EYE_TITLE[eye]}</b>
              <small>{remText}</small>
            </div>
            {pill ? (
              <span className={`acu-cm${pill.out ? ' out' : ''}`} role="img" aria-label={pill.label}>
                {pill.out && <MoveHorizontal size={13} aria-hidden="true" />}
                {pill.text}
              </span>
            ) : (
              <span className="acu-cm-sp" aria-hidden="true" />
            )}
          </div>
          <div className="acu-bar" role="progressbar" aria-label="Test ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progMax.current * 100)}>
            <i style={{ width: `${progMax.current * 100}%` }} />
          </div>
          <div className="acu-phase">{isWarm ? 'Alıştırma · sayılmaz' : ''}</div>
          <div className="acu-slot">
            {card ? (
              <PauseCard card={card} pulse={pulse?.key === 'pause'} onNoCamera={continueWithoutCamera} />
            ) : letter && !feedback ? (
              <div className="acu-letter" key={letter.n}>
                <TumblingE unit={letter.unit} direction={letter.dir} dpr={dpr} />
              </div>
            ) : null}
          </div>
          <div className="acu-guess">{card ? '' : 'Emin değilsen tahmin et'}</div>
          <button
            type="button"
            className={`acu-cant${isWarm ? ' hidden' : ''}${inactive ? ' dim' : ''}`}
            data-no-tap
            aria-hidden={isWarm ? 'true' : undefined}
            tabIndex={isWarm ? -1 : undefined}
            aria-disabled={inactive ? 'true' : undefined}
            onPointerDown={stop}
            onPointerUp={stop}
            onClick={() => !isWarm && answer(null)}
          >
            Göremiyorum
          </button>
          <div className={`acu-arrows${inactive ? ' dim' : ''}`} onPointerDown={stop} onPointerUp={stop}>
            {[['left', ArrowLeft, 'Sol'], ['up', ArrowUp, 'Yukarı'], ['down', ArrowDown, 'Aşağı'], ['right', ArrowRight, 'Sağ']].map(([d, Icon, label]) => (
              <button key={d} type="button" className="acu-arrow" data-no-tap aria-disabled={inactive ? 'true' : undefined} onClick={() => answer(d)} aria-label={label}>
                <Icon size={32} strokeWidth={2.6} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  } else if (phase === 'eye-done' && lastResult && nextIdx >= 0) {
    screen = (
      <EyeResult
        key={`res-${lastResult.eye}`}
        result={lastResult}
        segs={progressSegments(EYES, nextIdx, doneEyes)}
        label={`${nextIdx + 1}/${EYES.length}`}
        nextTitle={EYE_TITLE[EYES[nextIdx]]}
        onExit={requestExit}
        onNext={nextEye}
        onLeave={doExit}
        onExplain={() => setSheet('explain')}
      />
    )
  } else if (phase === 'rest') {
    screen = (
      <RestBreak
        seconds={REST_SECONDS}
        trueDepth={nativeTD && !cameraless}
        title={REST_TITLE}
        next={restNext(EYES[nextIdx])}
        endCue={false}
        onDone={afterRest}
        onSkip={afterRest}
        onClose={requestExit}
      />
    )
  } else if (phase === 'summary') {
    screen = (
      <Summary
        plan={plan}
        eyes={EYES}
        results={results}
        skipped={init.skip}
        correction={correction}
        onClose={() => (onSaveEye ? doExit() : finishAll())}
        onDone={finishAll}
      />
    )
  }

  const exitPlan = sheet === 'exit' ? exitSheet({ saved: results.map((r) => r.eye), started: phase === 'trial', todayHolds: holdsToday() }) : null
  return (
    <div className="acu-root" onPointerDownCapture={unlockOnce}>
      {video}
      {screen}
      {sheet === 'glasses' && (
        <GlassesSheet
          value={correction}
          last={lastCorrection}
          onPick={pickGlasses}
          onChanged={setChanged}
          onClose={() => setSheet(null)}
        />
      )}
      {exitPlan && (
        <Sheet label={exitPlan.title} onVeil={closeSheet}>
          <h2>{exitPlan.title}</h2>
          <p className="acu-sheet-sub">{exitPlan.body}</p>
          <button type="button" className="acu-cta go" onClick={closeSheet} autoFocus><Play size={16} aria-hidden="true" /> Teste dön</button>
          <button type="button" className="acu-cta ghost" onClick={doExit}>Çık</button>
        </Sheet>
      )}
      {sheet === 'explain' && (
        <Sheet label="Bu sayı ne anlatıyor?" onVeil={() => setSheet(null)}>
          <h2>Bu sayı ne anlatıyor?</h2>
          <p className="acu-sheet-sub">logMAR, seçebildiğin en küçük harfin boyutunu gösterir. 0,00 yaklaşık 20/20 (6/6) demektir; her 0,10 bir çizelge satırıdır. Değer küçüldükçe daha küçük harfi seçebiliyorsun.</p>
          <p className="acu-sheet-sub">Harf önce adım adım küçüldü, sonra seçmekte zorlandığın boyutun çevresinde denendi; sonuç bütün cevaplarından hesaplandı. Bu bir yakın mesafe ölçümüdür; göz muayenesinin yerini tutmaz.</p>
          <button type="button" className="acu-cta ghost" onClick={() => setSheet(null)}>Kapat</button>
        </Sheet>
      )}
      <p className="acu-sr" aria-live="assertive">{announce}</p>
    </div>
  )
}

// ——— Parçalar ———

function Progress({ segs, label }) {
  return (
    <div className="acu-prog" role="img" aria-label={`Bölüm ${label}`}>
      {segs.map((s, i) => <i key={i} className={s} aria-hidden="true" />)}
      <span>{label}</span>
    </div>
  )
}

function rowIcon(row) {
  if (row.status === 'ok') return '✓'
  if (row.status === 'bad') return '!'
  const t = row.trailing?.type
  if (t === 'ring' || t === 'toggle') return ''
  if (row.value?.endsWith('?') || row.trailing?.text === 'Örttüm') return '?'
  return '…'
}

function Trailing({ t }) {
  if (!t) return null
  if (t.type === 'action') return <span className="tr">{t.text}</span>
  if (t.type === 'value') return <span className="tr mono">{t.text}</span>
  if (t.type === 'toggle') return <span className={`tog${t.on ? ' on' : ''}`} aria-hidden="true" />
  if (t.type === 'ring') return <span className="ring" style={{ '--p': `${Math.round((t.progress ?? 0) * 100)}%` }} aria-hidden="true" />
  return null
}

function ReadyRow({ row, pulse, onAction }) {
  const t = row.trailing
  const cls = `acu-row${row.status === 'bad' ? ' flag' : ''}${pulse ? ' pulse' : ''}`
  const inner = (
    <>
      <span className={`acu-ic ${row.status}`} aria-hidden="true">{rowIcon(row)}</span>
      <span className="acu-rt">
        <span className="k">{row.label}</span>
        <span className={`v${row.status === 'bad' ? ' bad' : ''}`}>{row.value}</span>
      </span>
      <Trailing t={t} />
    </>
  )
  const id = `acu-row-${row.key}`
  if (t?.type === 'toggle') {
    return (
      <button type="button" id={id} className={cls} role="switch" aria-checked={Boolean(t.on)} data-no-tap onClick={() => onAction(t.action, 'toggle')}>
        {inner}
      </button>
    )
  }
  if (t?.type === 'action') {
    return (
      <button type="button" id={id} className={cls} data-no-tap onClick={() => onAction(t.action, 'action')}>
        {inner}
      </button>
    )
  }
  return (
    <div id={id} className={cls} role="group" aria-label={`${row.label}: ${row.value}`}>
      {inner}
    </div>
  )
}

// Ana düğme: native disabled yok. Hazır değilse nötr zeminde tam kontrastlı yazı, başında "!", aria-disabled ve
// eksik satıra aria-describedby. Dokununca eksik satır nabız atar (AcuityTest onCta).
function Cta({ button: b, onClick }) {
  const cls = b.kind === 'go' || b.kind === 'confirm' ? 'go' : b.kind === 'hold' ? 'hold' : 'need'
  const style = b.kind === 'hold' ? { '--p': `${Math.round((b.progress ?? 0) * 100)}%` } : undefined
  return (
    <button
      type="button"
      className={`acu-cta ${cls}`}
      style={style}
      data-no-tap
      aria-disabled={!b.ready && b.kind !== 'confirm' ? 'true' : undefined}
      aria-describedby={b.targetRow ? `acu-row-${b.targetRow}` : b.reason === 'inverted' ? 'acu-row-notice' : undefined}
      onClick={onClick}
    >
      {b.kind === 'need' && <b aria-hidden="true">!</b>}
      {b.kind === 'go' && <Play size={16} aria-hidden="true" />}
      {b.text}
    </button>
  )
}

const PAUSE_ICON = { face: ScanFace, cover: Hand, open: Eye, distance: MoveHorizontal, camera: CameraOff }
function PauseCard({ card, pulse, onNoCamera }) {
  const Icon = PAUSE_ICON[card.icon] ?? ScanFace
  return (
    <div className={`acu-pcard${pulse ? ' pulse' : ''}`} role="status" aria-live="assertive" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
      <span className="ic" aria-hidden="true"><Icon size={26} /></span>
      <b>{card.text}</b>
      {card.sub ? <span>{card.sub}</span> : null}
      {card.action === 'no-camera' && (
        <button type="button" className="acu-mini" onClick={onNoCamera}>Kamerasız devam</button>
      )}
    </div>
  )
}

// Açılınca odak sayfaya geçer (içinde autoFocus'lu düğme yoksa): VoiceOver sayfanın adını okur, arkada kalmaz
function Sheet({ label, onVeil, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const active = globalThis.document?.activeElement
    if (el && !(active && el.contains?.(active))) el.focus?.()
  }, [])
  return (
    <div className="acu-veil" onClick={onVeil}>
      <div ref={ref} tabIndex={-1} className="acu-sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <span className="acu-grab" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

// E3 · gözlük alt sayfası: satıra dokununca ✓, 250 ms sonra kendiliğinden kapanır ("Tamam" yok). Gözlük/lens geçen
// seferkiyle aynıysa numara sorusu; farklıysa kapanmadan önce "Geçen sefer: …" satırı. Kaydırıp/dışına dokunup
// kapatmak "Hayır" sayılır.
function GlassesSheet({ value, last, onPick, onChanged, onClose }) {
  const [stage, setStage] = useState({ kind: 'pick', note: null })
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const close = () => {
    clearTimeout(timer.current)
    onClose()
  }
  const pick = (id) => {
    clearTimeout(timer.current)
    onPick(id)
    const o = glassesOutcome({ choice: id, last })
    if (o.ask) {
      setStage({ kind: 'ask', note: null })
      return
    }
    setStage({ kind: o.note ? 'note' : 'pick', note: o.note })
    timer.current = setTimeout(onClose, o.closeMs)
  }
  const answerAsk = (yes) => {
    onChanged(yes)
    close()
  }
  return (
    <Sheet label="Gözlük" onVeil={() => (stage.kind === 'ask' ? answerAsk(false) : close())}>
      <h2>Yakına bakarken ne takıyorsun?</h2>
      <p className="acu-sheet-sub">Her zamanki gibi ölç; her hafta aynı.</p>
      <div role="radiogroup" aria-label="Gözlük">
        {WEAR_OPTIONS.map((w) => (
          <button key={w.id} type="button" role="radio" aria-checked={value === w.id} className="acu-opt" onClick={() => pick(w.id)}>
            <span>{w.text}</span>
            {value === w.id && <span className="ck" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
      {stage.kind === 'ask' && (
        <div className="acu-ask">
          <p>Numaran geçen testten beri değişti mi?</p>
          <div className="two">
            <button type="button" className="acu-mini" onClick={() => answerAsk(false)}>Hayır, aynı</button>
            <button type="button" className="acu-mini" onClick={() => answerAsk(true)}>Evet, yenilendi</button>
          </div>
        </div>
      )}
      {stage.kind === 'note' && stage.note && <p className="acu-sheet-note" role="status">{stage.note}</p>}
    </Sheet>
  )
}

// E1 · nasıl yapılır (3 kart). Kapı yok; 1. kart telefon 36–44 cm'de 1,2 sn tutulunca kendiliğinden geçer.
// cm hapı deneme ekranındakiyle aynı: adlandırılmış görsel, VoiceOver adı yönü de söyler ("45 santimetre, biraz
// yaklaştır"); canlı bölge değil, her değişimde okunmaz.
function Howto({ tracked, mm, warmup, onClose, onDone }) {
  const [i, setI] = useState(0)
  const ok = tracked && distanceHint(mm) === null
  const pill = tracked ? distancePill(mm) : null
  useEffect(() => {
    if (i !== 0 || !ok) return undefined
    const t = setTimeout(() => setI(1), HOWTO_AUTO_MS)
    return () => clearTimeout(t)
  }, [i, ok])
  const cards = [
    // "40 cm" bölünmez (dar ekranda başlık "40 / cm" diye kırılıyordu; ReadingTest ile aynı)
    { art: <AcuityDistanceArt ok={ok} />, title: 'Telefonu 40\u00a0cm uzakta tut', sub: tracked ? 'Doğru uzaklıkta kart kendiliğinden geçer.' : 'Kitap okur gibi tut.' },
    { art: <AcuitySwipeArt />, title: 'E\'nin açık tarafına kaydır', sub: 'Ya da alttaki oklara dokun.' },
    { art: <AcuityShrinkArt />, title: 'Harf küçülür; seçemeyince Göremiyorum', sub: `Emin değilsen tahmin et. İlk ${warmup} harf alıştırma.` },
  ]
  const c = cards[i]
  const last = i === cards.length - 1
  return (
    <div className="acu-scr acu-howto" key={`howto-${i}`}>
      <div className="acu-body">
        <div className="acu-top">
          <button type="button" className="acu-ib" onClick={onClose} aria-label="Kapat"><X size={20} aria-hidden="true" /></button>
          <Progress segs={cards.map((_, k) => (k < i ? 'done' : k === i ? 'on' : ''))} label={`${i + 1}/${cards.length}`} />
          <span className="acu-ib-sp" aria-hidden="true" />
        </div>
        <div className="acu-art acu-howto-art">{c.art}</div>
        <div className="acu-ttl center">
          <h1>{c.title}</h1>
          <p>{c.sub}</p>
        </div>
        <div className="acu-howto-extra">
          {i === 0 && pill && (
            <span className={`acu-cm${pill.out ? ' out' : ''}`} role="img" aria-label={pill.label}>{pill.text}</span>
          )}
        </div>
        <div className="acu-flex" />
        <button type="button" className="acu-cta go" onClick={() => (last ? onDone() : setI(i + 1))}>
          <Play size={16} aria-hidden="true" /> {last ? 'Anladım' : 'İleri'}
        </button>
      </div>
    </div>
  )
}

function Ruler({ value }) {
  return (
    <div className="acu-ruler" aria-hidden="true">
      <div className="track" />
      <div className="mk" style={{ left: `${rulerPos(value)}%` }} />
      {RULER_TICKS.map((t) => (
        <span key={t} className="lb" style={{ left: `${rulerPos(t)}%` }}>{rulerLabel(t)}</span>
      ))}
    </div>
  )
}

// E7 · göz sonucu (sağ ve sol göz sonrası)
function EyeResult({ result, segs, label, nextTitle, onExit, onNext, onLeave, onExplain }) {
  const v = useCountUp(result.logMAR)
  const eq = formatEquivalents(result.logMAR)
  const facts = resultFacts(result)
  const note = rangeNote(result)
  const pre = valueText(result).startsWith('≤') ? '≤' : valueText(result).startsWith('≥') ? '≥' : ''
  return (
    <div className="acu-scr acu-result">
      <div className="acu-body">
        <div className="acu-top">
          <button type="button" className="acu-ib" onClick={onExit} aria-label="Testten çık"><X size={20} aria-hidden="true" /></button>
          <Progress segs={segs} label={label} />
          <span className="acu-ib-sp" aria-hidden="true" />
        </div>
        <div className="acu-res">
          <p className="acu-res-title">{`${EYE_TITLE[result.eye]} · yakın, 40 cm`}</p>
          <div className="acu-big">
            <b aria-label={`${valueText(result)} logMAR`}>{pre}{formatLogMAR(v)}</b>
            <span>logMAR<br />düşük daha iyi</span>
          </div>
          {note && <p className="acu-range">{note}</p>}
          <div className="acu-eq">
            <div><b>{eq?.snellen20 ?? '—'}</b><small>20 ft</small></div>
            <div><b>{eq?.snellen6 ?? '—'}</b><small>6 m</small></div>
            <div><b>{eq?.decimal ?? '—'}</b><small>ondalık</small></div>
          </div>
          <Ruler value={v} />
          <div className="acu-facts">
            {facts.map((f) => <span key={f}>{f}</span>)}
            <span className="muted">Tek ölçüm ±0,2 oynayabilir. Değişimi seri gösterir.</span>
            <button type="button" className="acu-link" onClick={onExplain}>Bu sayı ne anlatıyor?</button>
          </div>
        </div>
        <button type="button" className="acu-cta go" onClick={onNext}><Play size={16} aria-hidden="true" /> Sıradaki: {nextTitle}</button>
        <button type="button" className="acu-cta ghost" onClick={onLeave}>Şimdilik bırak</button>
      </div>
    </div>
  )
}

// E9 · özet (son gözden sonra). Kayıtlar zaten yapıldı; uyarı ya da yorum burada üretilmez (Gelişim'de).
function Summary({ plan, eyes, results, skipped, correction, onClose, onDone }) {
  return (
    <div className="acu-scr">
      <div className="acu-body">
        <div className="acu-top">
          <button type="button" className="acu-ib" onClick={onClose} aria-label="Kapat"><X size={20} aria-hidden="true" /></button>
          <Progress segs={eyes.map(() => 'done')} label={`${eyes.length}/${eyes.length}`} />
          <span className="acu-ib-sp" aria-hidden="true" />
        </div>
        <div className="acu-ttl">
          <h1>{summaryTitle(plan)}</h1>
          <p>{`${wearLabel(correction) ?? 'Gözlük seçilmedi'} · yakın, 40 cm`}</p>
        </div>
        <div className="acu-rows acu-sum">
          {eyes.map((e) => {
            const r = results.find((x) => x.eye === e)
            const eq = r ? formatEquivalents(r.logMAR) : null
            return (
              <div key={e} className="acu-sumrow">
                <div>
                  <div className="n">{EYE_TITLE[e]}</div>
                  <small>{r ? eq?.text : skipped.includes(e) ? SKIPPED_TEXT : '—'}</small>
                </div>
                {r && <b>{valueText(r)}</b>}
              </div>
            )
          })}
        </div>
        <div className="acu-facts">
          <span>Bilgi amaçlıdır; göz muayenesinin yerini tutmaz.</span>
          <span className="muted">Ani görme kaybı, çarpık görme ya da ağrıda sonucu beklemeden göz doktoruna başvur.</span>
        </div>
        <div className="acu-flex" />
        <button type="button" className="acu-cta go" onClick={onDone}><Play size={16} aria-hidden="true" /> Bitti</button>
      </div>
    </div>
  )
}

export { swipeDirection }
