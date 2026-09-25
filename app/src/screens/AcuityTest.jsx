import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Play, Check, Info, X, EyeOff, TrendingDown, Crosshair, Timer, Sparkles } from 'lucide-react'
import { haptic } from '../lib/native.js'
import { unlockAudio } from '../lib/cue.js'
import TumblingE from '../components/TumblingE.jsx'
import RestBreak from '../components/RestBreak.jsx'
import { PageHeader } from '../components/ui.jsx'
import StepCards from '../components/StepCards.jsx'
import { DistanceArt, SwipeEArt, ShrinkArt } from '../components/howtoArt.jsx'
import { howtoSeen, markHowtoSeen } from '../lib/howto.js'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { distanceStatus, REFERENCE_MM } from '../lib/distance.js'
import { logMARForHeight, renderSpec, smallestDrawableLogMAR, snellen20, snellen6, decimalAcuity } from '../lib/optotype.js'
import { randomDirection, PLANS, UNSEEN } from '../lib/zest.js'
import { createAcuityStaircase, finalizeEstimate, remainingDisplay } from '../lib/staircase.js'
import { createOcclusionMonitor, coverFor, occlusionMessage } from '../lib/occlusion.js'
import '../styles/acuity.css'
import '../styles/profile.css' // pf-chips

const ALL_EYES = [
  // Build 25: avuç (derinlik haritası hangi gözün örtüldüğünü görür, mesafe açık gözden sürer) ya da göz kapağı
  { id: 'R', title: 'Sağ göz', cover: 'Sol gözünü avucunla ört (bastırmadan) ya da kapat. Sağ gözünü kısma.' },
  { id: 'L', title: 'Sol göz', cover: 'Sağ gözünü avucunla ört (bastırmadan) ya da kapat. Sol gözünü kısma.' },
  { id: 'OU', title: 'İki göz', cover: 'İki gözün de açık.' },
]
// Günlük test yalnız iki tek göz (Build 24: toplam harf yarıya indi); haftalık testte iki göz de ölçülür.
const eyesFor = (plan) => (plan === 'daily' ? ALL_EYES.slice(0, 2) : ALL_EYES)
// Isınma harfleri büyük (1,0 logMAR ≈ 20/200) ve sayılmaz; iniş 0,8'den başlar (staircase.js).
const WARMUP_LOGMAR = 1.0
// Canlı ölçek: harf, ölçülen mesafeye göre her karede yeniden boyutlanır (gözde sabit açı).
// Bu aralığın dışında ekran çözünürlüğü/kamera güvenilirliği yetmez → duraklat.
const LIVE_MIN_MM = 250
const LIVE_MAX_MM = 600
const SWIPE_MIN_PX = 30
const FEEDBACK_MS = 250
// Gözler arası konfor molası (sn). Kanıt ve gerekçe: components/RestBreak.jsx.
const REST_SECONDS = 20
// Kayıt biçimi sürümü: algoritma değişti, eski sonuçlarla karşılaştırmada ayırt edilebilsin.
// v3: "Göremiyorum" yanlış sayılmıyor (zest.js UNSEEN); taban ölçüm mesafesine göre.
const ALGORITHM = 'descent-zest-v3'

function swipeDirection(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return null
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

// Ondalık keskinlik (Türkiye'de reçete dili: 1,0 = 20/20): 1 / MAR
const decimalTr = (logMAR) => decimalAcuity(logMAR).toFixed(2).replace('.', ',')

// Türkçe ondalık, gerçek eksi işareti; −0,00 gösterilmez
const fmt = (v) => {
  const r = Math.round(v * 100) / 100
  return (r === 0 ? 0 : r).toFixed(2).replace('.', ',').replace('-', '−')
}

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

// Sonuç sayısı büyük harften (1,0) gerçek değere doğru akar
function useCountUp(target, ms = 900) {
  const startOf = (t) => (prefersReducedMotion() ? t : Math.max(1.0, t + 0.3))
  const [v, setV] = useState(() => startOf(target))
  useEffect(() => {
    const from = startOf(target)
    if (from === target) {
      setV(target)
      return undefined
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms)
      const e = 1 - (1 - k) ** 3
      setV(from + (target - from) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

// logMAR cetveli: 1,0 (büyük harf) solda → −0,3 (küçük harf) sağda
const SCALE_MAX = 1.0
const SCALE_MIN = -0.3
const scalePos = (v) => Math.min(100, Math.max(0, ((SCALE_MAX - v) / (SCALE_MAX - SCALE_MIN)) * 100))
const TICKS = [1.0, 0.5, 0.0, -0.3]

function AcuityScale({ value }) {
  return (
    <div className="acuity-scale" aria-hidden="true">
      <div className="acuity-scale-track">
        <span className="acuity-scale-ref" style={{ left: `${scalePos(0)}%` }} />
        <span className="acuity-scale-marker" style={{ left: `${scalePos(value)}%` }} />
      </div>
      <div className="acuity-scale-ticks">
        {TICKS.map((t) => (
          <span key={t} style={{ left: `${scalePos(t)}%` }}>{snellen20(t)}</span>
        ))}
      </div>
      <div className="acuity-scale-ends"><span>Büyük harf</span><span>Küçük harf</span></div>
    </div>
  )
}

// Test sırasında gözlük/lens durumu: ALIŞKANLIK koşulu (yakını normalde nasıl görüyorsan öyle; DSÖ "presenting",
// Peek Acuity, V@home, HSVA; bkz. docs/arastirma/ajan-raporlari/19_gozluk_ve_yakin_test.md). Kural "çıkar" değil
// "her seferinde aynı koşul": farklı koşuldaki ölçümler birleştirilmez (lib/trend.js comparableTests).
// Gözlük numarası sorulmaz ve hesaba katılmaz (numaradan keskinlik tahmini için doğrulanmış model yok).
export const WEAR = [
  { id: 'none', text: 'Gözlüksüz' },
  { id: 'reading', text: 'Okuma gözlüğü' },
  { id: 'progressive', text: 'Progresif / bifokal' },
  { id: 'distance', text: 'Yalnız uzak gözlüğü' },
  { id: 'contacts', text: 'Lens' },
]
const LEGACY_WEAR = { glasses: 'gözlüklü' } // eski kayıtlar (Build ≤18)
const wearText = (id) => LEGACY_WEAR[id] ?? WEAR.find((w) => w.id === id)?.text.toLocaleLowerCase('tr') ?? null
const withCorrection = (id) => Boolean(id) && id !== 'none'
// lastCorrection: önceki görme testindeki seçim ('glasses' | 'contacts' | 'none' | null)
export default function AcuityTest({ plan = 'daily', calibration, distanceCal, lastCorrection = null, onFinish, onCancel }) {
  // Eski 'glasses' kaydı: hangi gözlük olduğu seçtirilir; seçilen tür eski seriyle birleşir (lib/trend.js sameCondition)
  const legacy = lastCorrection === 'glasses'
  const [correction, setCorrection] = useState(legacy ? null : lastCorrection)
  const [changed, setChanged] = useState(false) // gözlük/lens numarası değişti → yeni baz çizgisi
  // "Nasıl yapılır" kartları: ilk seferde, sonra "Nasıl yapılır?" bağlantısıyla (lib/howto.js)
  const [howto, setHowto] = useState(() => !howtoSeen('acuity'))
  const planSpec = PLANS[plan]
  const { warmup } = planSpec
  const EYES = eyesFor(plan)
  const pxPerMm = calibration.pxPerMm
  const dpr = calibration.dpr
  const tracked = Boolean(distanceCal)
  const nativeTD = distanceCal?.method === 'truedepth'

  const [eyeIdx, setEyeIdx] = useState(0)
  const [phase, setPhase] = useState('instructions') // instructions | trial | eye-done | rest
  const [trialNo, setTrialNo] = useState(0) // ısınma dahil
  const [dir, setDir] = useState(randomDirection())
  const [feedback, setFeedback] = useState(null)
  const results = useRef([])
  const stair = useRef(null)
  const distSamples = useRef([])
  const pointer = useRef(null)
  const progMax = useRef(0)
  const shownRem = useRef(Infinity) // "~N harf kaldı" sayısı hiç artmasın (staircase.js remainingDisplay)
  const fineStartAt = useRef(null)

  // Molada TrueDepth oturumunu RestBreak kullanır; iki dinleyici aynı native oturumu
  // başlatıp durdurmasın diye burada kapatılır.
  // Tek göz örtme kontrolü (lib/occlusion.js): yalnızca TrueDepth göz kapanma değeri verdiği için iPhone
  // uygulamasında kamerayla; diğer cihazlarda kişinin onayıyla (kayda yöntemi yazılır).
  const occDetect = nativeTD
  const occMon = useRef(null)
  const [occ, setOcc] = useState(null)
  const [selfCover, setSelfCover] = useState(false)
  const occStartMethod = useRef(null)
  const occUi = useRef(0)
  const showOcc = (snap, ts) => {
    if (ts - occUi.current > 90 || snap.blocked !== occ?.blocked || snap.gateReady !== occ?.gateReady) {
      occUi.current = ts
      setOcc(snap)
    }
  }
  const cam = useFaceTracking({
    enabled: tracked && !(phase === 'rest' && nativeTD),
    distanceCal,
    onFrame: (f) => {
      if (!occDetect || !occMon.current) return
      const ts = f.ts ?? performance.now()
      showOcc(occMon.current.push(f, ts), ts)
    },
    // Derinlik (FaceDistancePlugin "depth"): hangi göz örtülü + el yüzü örtünce açık gözden mesafe
    onDepth: occDetect
      ? (d) => {
        if (!occMon.current) return
        const ts = d.ts ?? performance.now()
        showOcc(occMon.current.pushDepth(d, ts), ts)
      }
      : undefined,
    depthDistance: occDetect,
  })
  // El yüzü örtünce kareler tamamen durabilir: izleyicinin zamanı yine ilerlesin
  useEffect(() => {
    if (!occDetect) return undefined
    const id = setInterval(() => {
      if (!occMon.current) return
      const ts = performance.now()
      showOcc(occMon.current.tick(ts), ts)
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occDetect])
  const liveMm = tracked ? cam.mm : null
  const status = tracked ? distanceStatus(liveMm) : 'ok'
  // Mesafe canlı ölçülüyorsa 40 cm'ye kilitlenmez: harf ölçülen mesafeye göre ölçeklenir.
  const liveOk = !tracked || (liveMm != null && liveMm >= LIVE_MIN_MM && liveMm <= LIVE_MAX_MM)
  const occBlocked = occDetect && phase === 'trial' && Boolean(occ?.blocked)
  const paused = (tracked && phase === 'trial' && !liveOk) || occBlocked
  const renderMm = tracked && liveOk ? liveMm : REFERENCE_MM

  // Çizilebilir en küçük boyut ve gerçekte çizilecek boyut (piksel yuvarlaması) — güncel mesafeyle
  const renderMmRef = useRef(renderMm)
  renderMmRef.current = renderMm
  const drawable = (x, mm) => Math.max(x, smallestDrawableLogMAR(mm, pxPerMm, dpr))
  const quantize = (x) => {
    const mm = renderMmRef.current
    const sp = renderSpec(drawable(x, mm), mm, pxPerMm, dpr)
    return sp.drawable ? sp.realizedLogMAR : x
  }

  const eye = EYES[eyeIdx]
  const coverNeed = coverFor(eye.id)
  // Her göz için yeni örtme izleyicisi (yönerge ekranında kapı, testte duraklatma)
  useEffect(() => {
    occMon.current = createOcclusionMonitor(coverNeed)
    setOcc(null)
    setSelfCover(false)
  }, [eyeIdx, coverNeed])
  const coverOk = occDetect ? Boolean(occ?.gateReady) : eye.id === 'OU' || selfCover
  const isWarmup = trialNo < warmup
  const minX = Math.max(-0.3, smallestDrawableLogMAR(REFERENCE_MM, pxPerMm, dpr) + 0.02)
  const step = !isWarmup && stair.current ? stair.current.next() : null
  const stage = isWarmup ? 'warmup' : step?.phase ?? 'descent' // warmup | descent | fine
  // Canlı mesafede hedef çizilemeyecek kadar küçükse ekranın en küçük harfi gösterilir
  // (gerçekte gösterilen boyut zaten ölçülüp algoritmaya verilir).
  const target = drawable(isWarmup ? WARMUP_LOGMAR : step?.logMAR ?? 0.5, renderMm)
  const spec = renderSpec(target, renderMm, pxPerMm, dpr)

  // İlerleme: yapılan / (yapılan + tahmini kalan); geri gitmesin diye en büyüğü tutulur
  const prog = stair.current?.progress()
  const remaining = isWarmup ? warmup - trialNo + planSpec.minTrials : prog?.remaining ?? 0
  const frac = trialNo / Math.max(1, trialNo + remaining)
  if (phase === 'trial') progMax.current = Math.max(progMax.current, frac)
  if (stage === 'fine' && fineStartAt.current == null) fineStartAt.current = trialNo
  // "son harfler" yalnızca gerçekten en fazla 2 harf kalınca; bitiş posterior belirsizliğine
  // bağlıysa sayı verilmez ("az kaldı"); "~N" sayısı hiç artmaz.
  let remText = ''
  if (!isWarmup && prog) {
    const rd = remainingDisplay(prog, shownRem.current)
    if (phase === 'trial') shownRem.current = rd.shown
    remText = rd.kind === 'last' ? (rd.count <= 1 ? 'son harf' : 'son harfler') : rd.kind === 'few' ? 'az kaldı' : `~${rd.count} harf kaldı`
  }

  function startEye() {
    occMon.current?.resetStats()
    occStartMethod.current = occ?.method ?? null
    stair.current = createAcuityStaircase(planSpec, { minX, maxX: 1.3, quantize })
    distSamples.current = []
    progMax.current = 0
    shownRem.current = Infinity
    fineStartAt.current = null
    setTrialNo(0)
    setDir(randomDirection())
    setPhase('trial')
  }

  // choice: yön veya null ("Göremiyorum"). Göremiyorum, rastgele tahmine zorlamaz ve yanlış da
  // sayılmaz: posteriora rastgele yön seçiminin beklenen olabilirliğiyle girer (zest.js UNSEEN).
  function answer(choice) {
    if (phase !== 'trial' || paused || feedback) return
    const unseen = choice === null
    const correct = !unseen && choice === dir
    haptic('tick')
    if (!isWarmup) {
      // Gerçekte gösterilen boyut ve gerçek mesafe ile logMAR
      const heightMm = spec.heightCssPx / pxPerMm
      const shown = spec.drawable ? logMARForHeight(heightMm, renderMm) : target
      stair.current.update(shown, unseen ? UNSEEN : correct)
      if (liveMm) distSamples.current.push(liveMm)
    }
    setFeedback(correct ? 'ok' : 'no')
    setTimeout(() => {
      setFeedback(null)
      if (!isWarmup && stair.current.done()) {
        finishEye()
      } else {
        setTrialNo((n) => n + 1)
        setDir(randomDirection())
      }
    }, FEEDBACK_MS)
  }

  function finishEye() {
    const est = stair.current.estimate()
    const d = distSamples.current
    const meanMm = d.length ? d.reduce((a, b) => a + b, 0) / d.length : REFERENCE_MM
    // Harf canlı mesafede çizildiği için ekranın tabanı da ölçülen mesafeye göre hesaplanır
    // (40 cm'den yakında taban daha büyük logMAR'a kayar; bkz. staircase.js finalizeEstimate).
    // VARSAYIM: deneme boyunca ölçülen ortalama mesafe, ekran tabanını temsil etmeye yeterli.
    const floorLimit = Math.min(1.3, Math.max(minX, smallestDrawableLogMAR(meanMm, pxPerMm, dpr) + 0.02))
    const fin = finalizeEstimate(est, floorLimit)
    results.current.push({
      type: plan === 'daily' ? 'va-daily' : 'va-weekly',
      eye: eye.id,
      logMAR: +fin.logMAR.toFixed(3),
      correction,
      ...(changed && withCorrection(correction) ? { newBaseline: true } : {}),
      sd: +est.sd.toFixed(3),
      trials: est.trials,
      descentTrials: est.descentTrials,
      fineTrials: est.fineTrials,
      algorithm: ALGORITHM,
      outOfRange: fin.outOfRange,
      distanceTracked: tracked && d.length > 0,
      // Örtme: 'camera-depth' = derinlik hangi gözün örtüldüğünü gördü; 'camera-lid' = kamera yalnızca "iki göz
      // birden açık değil" dedi (hangi göz ayırt edilemez). Kaynak: lib/occlusion.js
      occlusion: occDetect
        ? { method: occStartMethod.current ? `camera-${occStartMethod.current}` : 'camera', pauses: occMon.current?.snapshot(performance.now()).pauses ?? 0, blockedMs: occMon.current?.snapshot(performance.now()).blockedMs ?? 0 }
        : { method: eye.id === 'OU' ? 'none' : 'self-report' },
      trialsMax: planSpec.trials,
      meanDistanceMm: d.length ? Math.round(meanMm) : null,
      device: { pxPerMm, dpr, screenW: window.screen.width, screenH: window.screen.height },
    })
    haptic('success')
    setPhase('eye-done')
  }

  function nextEye() {
    if (eyeIdx + 1 < EYES.length) {
      unlockAudio() // molanın sonunda sesli haber verebilmek için (dokunuş içinde)
      setPhase('rest')
    } else {
      onFinish(results.current)
    }
  }

  function afterRest() {
    setEyeIdx((i) => i + 1)
    setPhase('instructions')
  }

  // Klavye desteği (masaüstünde deneme için)
  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      if (map[e.key]) answer(map[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const distanceChip = tracked && (
    <div className={`chip chip-${status}`}>
      {liveMm ? `${Math.round(liveMm / 10)} cm` : 'yüz aranıyor'}
      {status === 'too-close' && ' · biraz uzaklaştır'}
      {status === 'too-far' && ' · biraz yaklaştır'}
    </div>
  )

  const stageInfo = {
    warmup: { Icon: Sparkles, label: 'Alıştırma', sub: `${eye.title} · ${Math.min(trialNo + 1, warmup)}/${warmup} · sayılmaz` },
    descent: { Icon: TrendingDown, label: 'Boyut küçülüyor', sub: `${eye.title} · ${remText}` },
    fine: { Icon: Crosshair, label: 'İnce ayar', sub: `${eye.title} · ${remText}` },
  }[stage]
  const stageIdx = { warmup: 0, descent: 1, fine: 2 }[stage]

  // Evre değişince kısa açıklama (harf neden büyüyüp küçülüyor?)
  let hint = null
  if (stage === 'warmup') hint = "E'nin açık tarafına doğru kaydır ya da oka dokun"
  else if (stage === 'descent' && trialNo - warmup < 2) hint = 'Doğru bildikçe harf adım adım küçülecek'
  else if (stage === 'fine' && fineStartAt.current != null && trialNo - fineStartAt.current < 3) hint = 'Sınırına geldin: harf bu çevrede biraz büyüyüp küçülecek'

  const last = results.current.at(-1)
  const moreEyes = eyeIdx + 1 < EYES.length

  if (howto && eyeIdx === 0) {
      const cm = liveMm ? Math.round(liveMm / 10) : null
      const ok = tracked && status === 'ok'
      const cards = [
        {
          key: 'distance',
          art: <DistanceArt cm={cm} ok={ok} />,
          title: tracked ? 'Telefonu kol boyu uzakta tut' : 'Telefonu 40 cm uzakta tut',
          why: tracked ? 'Doğru uzaklıkta kart kendiliğinden geçer.' : 'Kol boyu kadar. Parlaklığı en yükseğe al.',
          live: tracked ? { ok, text: !liveMm ? 'yüz aranıyor' : ok ? `${cm} cm · tam yerinde` : status === 'too-close' ? `${cm} cm · biraz uzaklaştır` : `${cm} cm · biraz yaklaştır` } : null,
        },
        { key: 'swipe', art: <SwipeEArt />, title: "E'nin açık tarafına doğru kaydır", why: 'Aşağı bakıyorsa aşağı kaydır. Emin değilsen tahmin et.' },
        { key: 'shrink', art: <ShrinkArt />, title: 'Küçülür; seçemeyince "Göremiyorum"', why: `İlk ${warmup} harf alıştırma, sayılmaz. Yaklaşık bir dakika.` },
      ]
      return (
        <main className="screen fade-in">
          <StepCards
            cards={cards}
            eyebrow={plan === 'daily' ? 'Günlük test · nasıl yapılır' : 'Haftalık test · nasıl yapılır'}
            finishLabel="Anladım"
            onFinish={() => setHowto(false)}
            onDismiss={() => { markHowtoSeen('acuity'); setHowto(false) }}
            onClose={onCancel}
          />
        </main>
      )
    }
    return (
    <div className="test-root">
      {tracked && <video ref={cam.videoRef} className="cam-hidden" playsInline muted />}

      {phase === 'instructions' && (
        <main className="screen fade-in" key={`ins-${eyeIdx}`}>
          <PageHeader
            onBack={onCancel}
            eyebrow={`${plan === 'daily' ? 'Günlük test' : 'Haftalık tam test'} · ${eyeIdx + 1}/${EYES.length}`}
            title={eye.title}
            subtitle={eye.cover}
          />
          <div className="acuity-plan">
            <span className="acuity-pill"><Timer size={14} aria-hidden="true" /> ~{planSpec.minTrials}–{planSpec.trials} harf · ≈{plan === 'daily' ? '1' : '1,5'} dk</span>
            <span className="acuity-pill"><TrendingDown size={14} aria-hidden="true" /> Küçülme</span>
            <span className="acuity-pill"><Crosshair size={14} aria-hidden="true" /> İnce ayar</span>
          </div>
          <div className="row between">
            <span className="muted small">{tracked ? 'Kol boyu uzaklık · E\'nin açık tarafına kaydır · küçülünce "Göremiyorum"' : '40 cm · E\'nin açık tarafına kaydır · küçülünce "Göremiyorum"'}</span>
            <button type="button" className="link-btn" onClick={() => setHowto(true)}>Nasıl yapılır?</button>
          </div>
          {eyeIdx === 0 && (
            <div className="card stack" style={{ gap: 8 }}>
              <span className="eyebrow">Yakını normalde nasıl görüyorsun?</span>
              <p className="muted small">Telefonu ve kitabı günlük hayatta nasıl okuyorsan testi öyle yap: okuma ya da progresif gözlük kullanıyorsan tak, kullanmıyorsan takma.</p>
              <div className="pf-chips" role="radiogroup" aria-label="Gözlük veya lens">
                {WEAR.map((w) => (
                  <button key={w.id} type="button" role="radio" aria-checked={correction === w.id} className={`pf-chip${correction === w.id ? ' on' : ''}`} onClick={() => setCorrection(w.id)}>{w.text}</button>
                ))}
              </div>
              <p className="muted small">
                {legacy
                  ? 'Geçen sefer gözlüklü ölçtün; hangi gözlükle olduğunu seç. Gözlük seçersen serin devam eder.'
                  : lastCorrection && correction && correction !== lastCorrection
                  ? `Geçen sefer ${wearText(lastCorrection)} ölçtün. Bu ölçüm yeni bir seri başlatır; farklı koşuldaki sonuçlar birleştirilmez.`
                  : lastCorrection
                    ? `Geçen sefer de ${wearText(lastCorrection)} ölçtün; aynı koşul, aynı seri.`
                    : 'Her seferinde aynı koşulda ölç. Değişimi ancak böyle görürüz.'}
              </p>
              {withCorrection(correction) && (correction === lastCorrection || (legacy && correction !== 'contacts')) && (
                <label className="choice">
                  <input type="checkbox" checked={changed} onChange={(e) => setChanged(e.target.checked)} />
                  <span>Gözlük / lens numaram geçen ölçümden beri değişti</span>
                </label>
              )}
              {changed && withCorrection(correction) && (correction === lastCorrection || (legacy && correction !== 'contacts')) && (
                <p className="muted small">Yeni numarayla yeni bir seri başlar; eski ölçümlerle karşılaştırılmaz. Numaranın kendisi hesaba girmez.</p>
              )}
            </div>
          )}
          <CoverCheck detect={occDetect} need={coverNeed} occ={occ} selfCover={selfCover} onSelfCover={setSelfCover} />
          {distanceChip}
          <button className="btn" onClick={startEye} disabled={(eyeIdx === 0 && !correction) || !coverOk}><Play size={18} aria-hidden="true" /> Başla</button>
        </main>
      )}

      {phase === 'trial' && (
        <div
          className={`stimulus-area ${feedback ? `fb-${feedback}` : ''}`}
          onPointerDown={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            if (!pointer.current) return
            const d = swipeDirection(e.clientX - pointer.current.x, e.clientY - pointer.current.y)
            pointer.current = null
            if (d) answer(d)
          }}
        >
          <div className="progress-track" role="progressbar" aria-label="Test ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progMax.current * 100)}>
            <i style={{ width: `${progMax.current * 100}%` }} />
          </div>
          <div className="stimulus-top acuity-top">
            <button className="btn-icon" onClick={onCancel} aria-label="Testten çık" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}><X size={20} /></button>
            <div className="acuity-stage">
              <span className="acuity-stage-label" aria-live="polite"><stageInfo.Icon size={15} aria-hidden="true" /> {stageInfo.label}</span>
              <span className="acuity-stage-sub">{stageInfo.sub}</span>
              <span className="acuity-steps" aria-hidden="true">
                {[0, 1, 2].map((i) => <i key={i} className={i <= stageIdx ? 'on' : ''} />)}
              </span>
            </div>
            {distanceChip || <span style={{ width: 40 }} aria-hidden="true" />}
          </div>
          {paused ? (
            <p className="paused">{occBlocked ? occlusionMessage(occ?.state, coverNeed) : liveMm == null ? 'Yüzün görünmüyor' : `Telefonu ${LIVE_MIN_MM / 10}–${LIVE_MAX_MM / 10} cm arasında tut`}</p>
          ) : spec.drawable && !feedback ? (
            <div className="acuity-letter" key={trialNo}>
              <TumblingE unit={spec.unitCssPx} direction={dir} />
            </div>
          ) : null}
          {hint && !paused && <span className="acuity-hint" key={hint}>{hint}</span>}
          <div className="arrow-row" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
            {[['left', ArrowLeft, 'Sol'], ['up', ArrowUp, 'Yukarı'], ['down', ArrowDown, 'Aşağı'], ['right', ArrowRight, 'Sağ']].map(([d, Icon, label]) => (
              <button key={d} className="arrow" data-no-tap onClick={() => answer(d)} aria-label={label}><Icon size={36} strokeWidth={2.6} /></button>
            ))}
          </div>
          {!isWarmup && (
            <button className="cant-see" data-no-tap onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={() => answer(null)}>
              <EyeOff size={22} strokeWidth={2.4} aria-hidden="true" /> Göremiyorum
            </button>
          )}
        </div>
      )}

      {phase === 'eye-done' && last && (
        <EyeResult
          eyes={EYES}
          eyeIdx={eyeIdx}
          result={last}
          all={results.current}
          moreEyes={moreEyes}
          onNext={nextEye}
          onFinishEarly={() => onFinish(results.current)}
        />
      )}

      {phase === 'rest' && (
        <RestBreak
          seconds={REST_SECONDS}
          trueDepth={nativeTD}
          title="Gözlerini dinlendir"
          subtitle={`Sıradaki: ${EYES[eyeIdx + 1]?.title ?? ''}. Önce pencereden dışarı, 6 metreden uzak bir noktaya bak.`}
          doneText="Hazırsın, teste dönüyoruz"
          onDone={afterRest}
          onSkip={afterRest}
          onClose={() => onFinish(results.current)}
        />
      )}
    </div>
  )
}

// Örtme kontrol kartı: canlı iki göz göstergesi + ham kapanma değerleri (0 açık, 1 kapalı).
// Ham değerler cihazda eşik ve sol/sağ yönünü doğrulamak için (lib/occlusion.js VARSAYIM 1–2).
function CoverCheck({ detect, need, occ, selfCover, onSelfCover }) {
  if (!detect) {
    if (need === 'none') return null
    return (
      <label className="choice">
        <input type="checkbox" checked={selfCover} onChange={(e) => onSelfCover(e.target.checked)} />
        <span>{need === 'L' ? 'Sol' : 'Sağ'} gözüm kapalı</span>
      </label>
    )
  }
  // Kamera iki gözü ayrı ölçmüyor (Build 24 cihaz verisi): tek durum gösterilir, ham değerler küçük yazıyla
  const state = occ?.state ?? 'no-face'
  const good = state === 'ok'
  const raw = (v) => (Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '—')
  const mm = (v) => (Number.isFinite(v) ? `${Math.round(v)} mm` : '—')
  return (
    <div className={`card cover-check${occ?.gateReady ? ' ready' : ''}`} aria-live="polite">
      <div className={`cover-eye${good ? ' good' : state === 'no-face' ? '' : ' bad'}`}>
        <span className="cover-eye-name">{need === 'none' ? 'İki gözün açık olmalı' : `${need === 'L' ? 'Sol' : 'Sağ'} gözün örtülü olmalı`}</span>
        <strong>{good ? (need === 'none' ? 'İki göz açık' : occ?.method === 'depth' ? `${need === 'L' ? 'Sol' : 'Sağ'} göz örtülü` : 'Bir göz kapalı') : state === 'no-face' ? 'Yüz aranıyor' : state === 'wrong-eye' ? 'Diğer göz örtülü' : need === 'none' ? 'Bir göz kapalı' : state === 'uncovered' ? 'İki göz açık' : 'Belirsiz'}</strong>
        {good && need !== 'none' && <span className="cover-eye-need">{occ?.method === 'depth' ? 'kamera derinliği hangi gözün örtüldüğünü gördü' : 'kamera hangi gözün kapalı olduğunu ayırt edemiyor'}</span>}
      </div>
      <div className="cover-gate"><i style={{ width: `${Math.round((occ?.gateFrac ?? 0) * 100)}%` }} /></div>
      <p className="small cover-msg">{occ?.gateReady ? 'Tamam, başlayabilirsin' : occlusionMessage(state, need)}</p>
      <span className="cover-eye-raw">kapak · sağ {raw(occ?.r)} · sol {raw(occ?.l)} (0 açık, 1 kapalı)</span>
      <span className="cover-eye-raw">derinlik · sağ {mm(occ?.dr)} · sol {mm(occ?.dl)} (avuç tarafı yakın)</span>
    </div>
  )
}

function EyeResult({ eyes: EYES, eyeIdx, result, all, moreEyes, onNext, onFinishEarly }) {
  const eye = EYES[eyeIdx]
  const v = useCountUp(result.logMAR)
  return (
    <main className="screen fade-in">
      <PageHeader eyebrow={`${eyeIdx + 1}/${EYES.length} tamamlandı`} title={`${eye.title} sonucu`} />

      <section className="card card-hero acuity-result">
        <span className="eyebrow">Yakın görme keskinliği</span>
        <div className="acuity-value-row">
          <span className="acuity-value" aria-label={`${fmt(result.logMAR)} logMAR`}>{fmt(v)}</span>
          <span className="metric-unit">logMAR</span>
        </div>
        <span className="acuity-equiv">{snellen20(result.logMAR)} · {snellen6(result.logMAR)} · ondalık {decimalTr(result.logMAR)}</span>
        <AcuityScale value={v} />
        <div className="acuity-meta">
          <span className="acuity-pill">{result.trials} harf</span>
          {result.occlusion?.method?.startsWith('camera') && <span className="acuity-pill">{result.occlusion.method === 'camera-depth' ? 'Örtülen göz kamerayla doğrulandı' : 'Tek göz kamerayla izlendi'}{result.occlusion.pauses ? ` · ${result.occlusion.pauses} kez durdu` : ''}</span>}
          {result.meanDistanceMm && <span className="acuity-pill">ort. {Math.round(result.meanDistanceMm / 10)} cm</span>}
          <span className="acuity-pill">İniş {result.descentTrials} · İnce ayar {result.fineTrials}</span>
        </div>
      </section>

      {result.outOfRange === 'ceiling' && (
        <div className="card tone-warn small">
          Sonuç ölçüm aralığının dışında (ekranın gösterebildiği en büyük harf görülemedi).
          Test koşullarını kontrol et; görmen gerçekten bu düzeydeyse bir göz doktoruna başvur.
        </div>
      )}
      {result.outOfRange === 'floor' && (
        <p className="muted small">Bu mesafede ekranın gösterebildiği en küçük harfi de gördün; gerçek değerin daha iyi olabilir.</p>
      )}

      {all.length > 1 || moreEyes ? (
        <section className="card acuity-eyes" aria-label="Bu testteki gözler">
          {EYES.map((e, i) => {
            const r = all.find((x) => x.eye === e.id)
            const cls = r ? (i === eyeIdx ? 'current' : '') : 'pending'
            return (
              <div key={e.id} className={`acuity-eye-row ${cls}`}>
                <span className="name">{e.title}</span>
                <span className="val">
                  {r ? fmt(r.logMAR) : 'sırada'}
                  {r && <span className="sub">{snellen20(r.logMAR)}</span>}
                </span>
              </div>
            )
          })}
        </section>
      ) : null}

      <details className="card acuity-explain">
        <summary><Info size={16} aria-hidden="true" /> Bu sayı ne anlatıyor?</summary>
        <p>
          logMAR, seçebildiğin en küçük harfin boyutunu gösterir: 0,0 yaklaşık 20/20 (6/6) demektir,
          her 0,1 bir çizelge satırıdır. Değer küçüldükçe daha küçük harfi seçebiliyorsun.
        </p>
        <p>
          Harf önce adım adım küçüldü; seçmekte zorlandığın boyuta gelince test o çevrede ince ayar yaptı
          ve eşiğini bütün cevaplarından hesapladı. Bu bir yakın mesafe ölçümüdür; göz muayenesinin yerini tutmaz.
        </p>
      </details>

      <p className="note">
        <Info size={16} />
        Tek bir testin doğal oynaması yaklaşık ±0,2 logMAR. Değişimi grafikte, birkaç günün ortalamasıyla değerlendiriyoruz.
      </p>

      <div className="acuity-actions">
        <button className="btn" onClick={onNext}>
          {moreEyes ? <>Sıradaki: {EYES[eyeIdx + 1].title} <ArrowRight size={18} /></> : <><Check size={18} /> Sonuçları kaydet</>}
        </button>
        {moreEyes && (
          <button className="link-btn" onClick={onFinishEarly}>Burada bitir ve kaydet</button>
        )}
      </div>
    </main>
  )
}

export { swipeDirection }
