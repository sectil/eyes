import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Check, ChevronLeft, Play, ScanFace, X } from 'lucide-react'
import SoundToggle from '../components/SoundToggle.jsx'
import { Arena } from '../components/ExerciseArt.jsx'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { SAFETY_KEY, MOVES, MODES, stepsOf, totalSeconds, progressText, summaryText, weekCount, weekText, makeRecord } from '../lib/dikDur.js'
import { CAM_KEY, CALIB_KEY, FIX_AFTER_MS, MAX_FIXES, sampleOf, poseOf, calibrate, judge, resultText, loadJson, saveJson } from '../lib/postureSense.js'
import { unlockAudio } from '../lib/cue.js'
import { sayPhrase, preloadPhrases } from '../lib/voiceCue.js'
import { releaseBreathSfx } from '../lib/breathSfx.js'
import { haptic } from '../lib/native.js'
import '../styles/info.css' // .pref-toggle anahtarı (kamera düğmesi)
import '../styles/exercise.css'
import '../styles/dikdur.css'

// Dik Dur (plan docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md; metinler metin-D1-onay.md, harfi harfine).
// giriş → (ilk kez) güvenlik → (TrueDepth'li cihazda ilk kez) kamera sorusu → kameralıysa telefonu yasla → duruşunu
// gösterme (bir kez; sonra "aynı yerde mi") → adımlar → bitiş. Kamera yalnız TrueDepth'te (baş eğimi sinyali); ötekilerde
// her şey süreyle. Ses: Profilim'deki ElevenLabs sesi (voicePack dd*; dosya yoksa cihaz sesi). Geri/çarpı kaydetmeden çıkar.
// Görüntü cihazdan çıkmaz ve kaydedilmez: yalnız uzaklık ve baş eğimi sayıları (lib/postureSense.js).
const TICK_MS = 100
const CALIB_S = 5
const FACE_GONE_MS = 600

const seen = (storage) => {
  try {
    return storage?.getItem(SAFETY_KEY) === '1'
  } catch {
    return false
  }
}

// Yandan üst gövde silueti (sağa bakar): alın, burun, çene, boyun, göğüs, sırt; kulak ve kol çizgisi; hareketin yönü
// altın okla. Metin yok.
const SILHOUETTE = 'M140 56 C159 56 171 70 171 88 L178 101 L170 104 C170 113 164 119 156 121 L155 133 C167 141 173 161 173 191 L173 228 H115 L115 188 C115 162 121 146 128 133 L126 117 C114 111 109 99 109 88 C109 70 121 56 140 56 Z'
export function PostureArt({ move = null }) {
  return (
    <g className="dd-art" transform="translate(-14 2)">
      {move === 'uzat' && <path className="dd-string" d="M140 12 V50" />}
      <path className="dd-sil" d={SILHOUETTE} />
      <path className="dd-line" d="M128 88 q-6 6 0 12" />
      <path className="dd-line" d="M140 150 C142 170 145 188 148 208" />
      {move === 'uzat' && <path className="dd-arrow" d="M200 96 V54 m-10 11 l10 -11 l10 11" />}
      {move === 'cene' && <path className="dd-arrow" d="M222 108 H188 m11 -10 l-11 10 l11 10" />}
      {move === 'omuz' && <path className="dd-arrow" d="M160 142 C146 150 128 156 100 158 m11 -10 l-11 10 l11 10" />}
    </g>
  )
}

export default function DikDur({ onFinish, onBack, sessions = [], remindField = null, trueDepth = false, storage = globalThis.localStorage, now = () => new Date() }) {
  const [phase, setPhase] = useState('intro') // intro | safety | camAsk | place | samePlace | calib | calibDone | perm | run | done
  const [mode, setMode] = useState('kisa')
  const [idx, setIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [camOn, setCamOn] = useState(() => trueDepth && loadJson(storage, CAM_KEY)?.on === true)
  const [cal, setCal] = useState(() => loadJson(storage, CALIB_KEY))
  const [calStage, setCalStage] = useState('normal')
  const [status, setStatus] = useState(null) // { text, tone }
  const [result, setResult] = useState(null)
  const [skipCam, setSkipCam] = useState(false) // yasla ekranında "Kamerasız devam et": yalnız bu oturum
  const startedAt = useRef(0)
  const steps = useMemo(() => stepsOf(mode), [mode])
  const step = steps[idx]

  // Zaman tik ile ilerler (yüz kaybolunca sayaç durur); değerler ref'te, ekran setElapsed ile
  const live = useRef({ idx: 0, elapsed: 0, faceAt: 0, sample: null, samples: [], notIn: 0, fixed: {}, fixShown: false, poseMs: 0, totalMs: 0 })
  const useCam = trueDepth && camOn && !skipCam
  const camPhase = useCam && ['place', 'samePlace', 'calib', 'calibDone', 'run'].includes(phase)
  const cam = useFaceTracking({
    enabled: camPhase,
    trueDepth: true,
    onFrame: (f) => {
      const s = sampleOf(f)
      if (!s) return
      live.current.faceAt = Date.now()
      live.current.sample = s
      if (phase === 'calib') live.current.samples.push(s)
    },
  })
  useEffect(() => {
    if (camPhase && cam.error === 'permission') setPhase('perm')
  }, [camPhase, cam.error])
  // Seslendirmeyi baştan çöz (Profilim'deki ElevenLabs sesi); ekrandan çıkınca ses oturumu bırakılır
  useEffect(() => {
    preloadPhrases()
    return () => releaseBreathSfx(0)
  }, [])
  const faceSeen = () => Date.now() - live.current.faceAt < FACE_GONE_MS
  const camWorks = () => useCam && !cam.error

  function begin(m = mode) {
    unlockAudio()
    setMode(m)
    setIdx(0)
    setElapsed(0)
    setStatus(null)
    setResult(null)
    Object.assign(live.current, { idx: 0, elapsed: 0, notIn: 0, fixed: {}, fixShown: false, poseMs: 0, totalMs: 0 })
    startedAt.current = Date.now()
    const first = stepsOf(m)[0]
    if (first?.kind === 'hold') sayPhrase(MOVES[first.move].voice)
    setPhase('run')
  }
  function afterSafety(m = mode) {
    if (trueDepth && !loadJson(storage, CAM_KEY)?.asked) setPhase('camAsk')
    else if (trueDepth && camOn) setPhase('place')
    else begin(m)
  }
  function choose(m) {
    setMode(m)
    if (seen(storage)) afterSafety(m)
    else setPhase('safety')
  }
  function acceptSafety() {
    try {
      storage?.setItem(SAFETY_KEY, '1')
    } catch {
      // kalıcı olmasa da bugünkü oturum sürer
    }
    afterSafety()
  }
  function answerCam(on) {
    saveJson(storage, CAM_KEY, { asked: true, on })
    setCamOn(on)
    if (on) setPhase('place')
    else begin()
  }
  function flipCam() {
    const on = !camOn
    saveJson(storage, CAM_KEY, { asked: true, on })
    setCamOn(on)
  }
  function withoutCam() {
    setSkipCam(true)
    begin()
  }
  function placed() {
    if (cal?.ok) setPhase('samePlace')
    else startCalib()
  }
  function startCalib() {
    live.current.samples = []
    live.current.elapsed = 0
    live.current.normal = null
    setElapsed(0)
    setCalStage('normal')
    setPhase('calib')
    sayPhrase('ddCalNormal')
  }

  // Tik: duruşunu gösterme ve adımlar
  useEffect(() => {
    if (phase !== 'run' && phase !== 'calib') return undefined
    let last = Date.now()
    const t = setInterval(() => {
      const nowMs = Date.now()
      const dt = nowMs - last
      last = nowMs
      if (phase === 'calib') tickCalib(dt)
      else tickRun(dt)
    }, TICK_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, calStage, mode, cal])

  function tickCalib(dt) {
    const L = live.current
    if (camWorks() && !faceSeen()) {
      setStatus({ text: 'Yüzünü göremiyorum. Sayaç sen görünene kadar bekliyor.', tone: 'w' })
      return
    }
    setStatus(null)
    L.elapsed += dt
    setElapsed(L.elapsed)
    if (L.elapsed < CALIB_S * 1000) return
    haptic('success')
    if (calStage === 'normal') {
      L.normal = poseOf(L.samples)
      L.samples = []
      L.elapsed = 0
      setElapsed(0)
      setCalStage('tall')
      sayPhrase('ddCalTall')
      return
    }
    const c = calibrate(L.normal, poseOf(L.samples))
    saveJson(storage, CALIB_KEY, c)
    setCal(c)
    setPhase('calibDone')
    sayPhrase('ddCalDone')
  }

  function tickRun(dt) {
    const L = live.current
    const st = steps[L.idx]
    if (!st) return
    const judged = st.kind === 'hold' && MOVES[st.move].camera && camWorks() && cal?.ok
    // Yüz yoksa tutma sayacı bekler (kameralıyken)
    if (st.kind === 'hold' && camWorks() && !faceSeen()) {
      setStatus({ text: 'Yüzünü göremiyorum. Sayaç sen görünene kadar bekliyor.', tone: 'w' })
      return
    }
    const shownMove = st.kind === 'gap' ? steps[L.idx + 1]?.move : st.kind === 'hold' ? st.move : null // arada sıradaki hareket
    if (shownMove === 'omuz' && camWorks()) setStatus({ text: 'Omuzlarını kamera göremiyor; bu adımı kendin yap.', tone: 'n' })
    else if (!L.fixShown) setStatus(null)
    if (judged) {
      const j = judge(cal, L.sample, st.move)
      if (j.inPose != null) {
        L.totalMs += dt
        if (j.inPose) {
          L.poseMs += dt
          L.notIn = 0
          if (L.fixShown) { L.fixShown = false; setStatus(null) }
        } else {
          L.notIn += dt
          const n = L.fixed[st.move] ?? 0
          if (L.notIn >= FIX_AFTER_MS && !L.fixShown && n < MAX_FIXES) {
            L.fixed[st.move] = n + 1
            L.fixShown = true
            const fix = MOVES[st.move].fix
            setStatus({ text: fix, tone: 'g' })
            sayPhrase(MOVES[st.move].fixVoice)
          }
        }
      }
    }
    L.elapsed += dt
    setElapsed(L.elapsed)
    if (L.elapsed >= st.s * 1000) next()
  }

  function next() {
    const L = live.current
    if (steps[L.idx]?.kind === 'hold') haptic('success')
    L.elapsed = 0
    L.notIn = 0
    L.fixShown = false
    setElapsed(0)
    setStatus(null)
    if (L.idx + 1 < steps.length) {
      L.idx += 1
      setIdx(L.idx)
      const st = steps[L.idx]
      if (st.kind === 'hold') sayPhrase(MOVES[st.move].voice)
    } else {
      if (camWorks() && cal?.ok && L.totalMs >= 5000) setResult(L.poseMs / L.totalMs)
      setPhase('done')
    }
  }

  function finish() {
    const seconds = startedAt.current ? (Date.now() - startedAt.current) / 1000 : totalSeconds(mode)
    onFinish?.(makeRecord({ mode, holds: steps.filter((s) => s.kind === 'hold').length, seconds, cameraUsed: result != null, inPose: result }))
  }

  const top = (back = () => setPhase('intro')) => (
    <div className="ex-top">
      <button type="button" className="ex-ic" onClick={back} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
    </div>
  )
  const statusLine = status ? <div className="ex-st" role="status"><span className={status.tone}>{status.text}</span></div> : <div className="ex-st" />

  if (phase === 'intro') {
    return (
      <main className="ex-stage ex-start dd dd-home">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Geri"><ChevronLeft aria-hidden="true" /></button>
          <span style={{ flex: 1 }} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-intro">
          <h1 className="ex-title">Dik Dur</h1>
          <p className="dd-lead">Günde birkaç kez kısa bir dikleşme molası.</p>
          <div className="dd-hero-box"><svg className="dd-hero" viewBox="80 6 160 226" aria-hidden="true"><PostureArt move="uzat" /></svg></div>
          <p className="ex-para">Üç hareket, her birini 10 saniye tut: boyunu uzat, çeneni içeri çek, omuzlarını geri ve aşağı al.</p>
          <p className="ex-para">Saatlerce dik durman gerekmez. Önemli olan sık sık pozisyon değiştirmek ve gün içinde kısa molalar vermek.</p>
          <p className="dd-ev">Çökük oturmak ruh hâlini biraz düşürebilir; dikleşmek o an daha iyi hissettirebilir.</p>
          {trueDepth && loadJson(storage, CAM_KEY)?.asked && (
            <button type="button" className="pref-toggle dd-cam" role="switch" aria-checked={camOn} onClick={flipCam}>
              <Camera size={18} aria-hidden="true" />
              <span className="dd-cam-l"><b>Kamerayla takip</b><span>Başının duruşuna bakar</span></span>
              <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
            </button>
          )}
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={() => choose('kisa')}><Play aria-hidden="true" fill="currentColor" /> Kısa tur · 2 dakika</button>
          <button type="button" className="ex-btn ghost" onClick={() => choose('tam')}>Tam tur · 15 dakika</button>
          <p className="dd-note">Kısa turu gün içinde istediğin kadar yapabilirsin. Tam turu haftada 4 gün öneriyoruz.</p>
        </div>
      </main>
    )
  }

  if (phase === 'safety') {
    return (
      <main className="ex-stage ex-start dd">
        {top()}
        <div className="ex-intro dd-safety">
          <h1 className="ex-title">Başlamadan önce</h1>
          <p className="ex-para">Yakın zamanda boyun ya da omuz sakatlığın, ameliyatın ya da kola yayılan ağrın olduysa önce doktoruna danış.</p>
          <p className="ex-para">Hareketleri zorlamadan yap. Ağrı, baş dönmesi ya da kolunda uyuşma olursa dur.</p>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={acceptSafety}><Check aria-hidden="true" /> Anladım</button>
        </div>
      </main>
    )
  }

  if (phase === 'camAsk' || phase === 'perm') {
    return (
      <main className="ex-stage ex-start dd">
        {top()}
        <div className="ex-intro dd-safety">
          <h1 className="ex-title">Kamerayla takip edelim mi?</h1>
          <p className="ex-para">Önce normal duruşunu ve dik duruşunu birer kez gösterirsin. Egzersizde kamera, dik duruşunda ne kadar kaldığını söyler.</p>
          <p className="ex-para">Görüntü telefonundan çıkmaz ve hiçbir yere kaydedilmez.</p>
          <p className="dd-ev">Kamera omuzlarını önden göremez; omuz adımını kendin yaparsın.</p>
          {phase === 'perm' && <p className="dd-warn" role="status">Kamera izni kapalı. Açmak için Ayarlar'a git.</p>}
        </div>
        <div className="ex-foot">
          {phase === 'camAsk' && <button type="button" className="ex-btn" onClick={() => answerCam(true)}><Camera aria-hidden="true" /> Kamerayla</button>}
          <button type="button" className={`ex-btn${phase === 'camAsk' ? ' ghost' : ''}`} onClick={() => answerCam(false)}>Kamerasız</button>
        </div>
      </main>
    )
  }

  if (phase === 'place' || phase === 'samePlace') {
    const same = phase === 'samePlace'
    const seenNow = cam.face && !cam.error
    return (
      <main className="ex-stage ex-start dd">
        {top()}
        <div className="ex-intro dd-safety">
          <h1 className="ex-title">{same ? 'Telefon geçen seferki yerinde mi?' : 'Telefonu yasla'}</h1>
          {!same && <p className="ex-para">Telefonu göz hizana yakın, bir kol boyu uzağa yasla. Ön kamera yüzüne dönük olsun.</p>}
        </div>
        {!same && (
          <div className={`dd-face${seenNow ? ' on' : ''}`} role="status">
            <span className="dd-face-ic" aria-hidden="true"><ScanFace /></span>
            <span>{cam.error ? 'Kamera açılamadı.' : seenNow ? 'Yüzünü görüyorum.' : 'Yüzünü arıyorum…'}</span>
          </div>
        )}
        <div className="ex-foot">
          {same ? (
            <>
              <button type="button" className="ex-btn" onClick={() => begin()}><Check aria-hidden="true" /> Evet</button>
              <button type="button" className="ex-btn ghost" onClick={startCalib}>Hayır, yeniden göstereyim</button>
            </>
          ) : (
            <>
              {!cam.error && <button type="button" className="ex-btn" disabled={!seenNow} onClick={placed}><Check aria-hidden="true" /> Hazırım</button>}
              <button type="button" className="ex-btn ghost" onClick={withoutCam}>Kamerasız devam et</button>
            </>
          )}
        </div>
      </main>
    )
  }

  if (phase === 'calib' || phase === 'calibDone') {
    const done = phase === 'calibDone'
    const left = Math.max(0, Math.ceil(CALIB_S - elapsed / 1000))
    const title = done ? 'Tamam, iki duruşunu da öğrendim.' : calStage === 'normal' ? 'Her zamanki gibi otur.' : 'Şimdi dikleş: boyunu uzat, çeneni içeri çek.'
    return (
      <main className="ex-stage dd">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
          <span style={{ flex: 1 }} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-copy">
          <h1 className="ex-title" aria-live="assertive">{title}</h1>
        </div>
        <div className="ex-mid dd-mid">
          <Arena progress={done ? 1 : Math.min(1, elapsed / (CALIB_S * 1000))} off={!done && calStage === 'normal'}>
            <PostureArt move={done || calStage === 'normal' ? null : 'uzat'} />
          </Arena>
          <div className="dd-left" aria-hidden="true">{done ? '' : left}</div>
        </div>
        {statusLine}
        <div className="ex-foot">
          {done && <button type="button" className="ex-btn" onClick={() => begin()}><Play aria-hidden="true" fill="currentColor" /> {mode === 'tam' ? 'Tam tur · 15 dakika' : 'Kısa tur · 2 dakika'}</button>}
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main className="ex-stage ex-end dd">
        <div className="ex-res">
          <svg className="ex-badge" viewBox="0 0 180 180" width="160" height="160" aria-hidden="true">
            <circle className="halo" cx="90" cy="90" r="70" />
            <circle className="disc" cx="90" cy="90" r="46" />
            <path className="tick" d="M70 91 l14 14 l28 -30" strokeWidth="8" />
          </svg>
          <h1 className="ex-title">Bitti</h1>
          <p className="ex-para">{summaryText(mode)}</p>
          {result != null && <p className="ex-para">{resultText(result)}</p>}
          <p className="ex-para">{weekText(weekCount(sessions, now()) + 1)}</p>
        </div>
        {remindField}
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={finish}><Check aria-hidden="true" /> Bitir</button>
        </div>
      </main>
    )
  }

  // Adımlar: tutmada halka dolar ve kalan saniye görünür; aradaki 3 sn sıradaki hareketi gösterir; bölüm arası dinlenme
  const m = MODES[mode]
  const shown = step.kind === 'gap' ? steps[idx + 1] : step
  const left = Math.max(0, Math.ceil(step.s - elapsed / 1000))
  const part = step.kind === 'hold' ? Math.min(1, elapsed / (step.s * 1000)) : 0
  const blocks = m.order === 'cycle' ? m.reps : m.sets * m.moves.length
  const blockOf = (s) => (m.order === 'cycle' ? s.rep - 1 : (s.set - 1) * m.moves.length + m.moves.indexOf(s.move))
  const cur = shown?.kind === 'hold' ? blockOf(shown) : step.kind === 'rest' ? (step.set - 1) * m.moves.length : 0

  if (step.kind === 'rest') {
    return (
      <main className="ex-stage dd">
        <div className="ex-top">
          <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
          <Segs n={blocks} cur={cur} part={0} />
          <SoundToggle className="ex-sound" />
        </div>
        <div className="ex-copy">
          <h1 className="ex-title" aria-live="polite">Dinlen.</h1>
          <p className="ex-para dd-cue">Sonraki bölüm sayaç bitince başlar.</p>
        </div>
        <div className="ex-mid">
          <Arena progress={Math.min(1, elapsed / (step.s * 1000))} tone="gold"><text className="dd-count" x="130" y="152" textAnchor="middle">{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</text></Arena>
        </div>
        <div className="ex-foot">
          <button type="button" className="ex-btn" onClick={next}><Play aria-hidden="true" fill="currentColor" /> Şimdi başla</button>
        </div>
      </main>
    )
  }

  const mv = MOVES[shown.move]
  return (
    <main className="ex-stage dd">
      <div className="ex-top">
        <button type="button" className="ex-ic" onClick={onBack} aria-label="Egzersizden çık"><X aria-hidden="true" /></button>
        <Segs n={blocks} cur={cur} part={step.kind === 'hold' ? (m.order === 'cycle' ? (m.moves.indexOf(step.move) + part) / m.moves.length : (step.rep - 1 + part) / m.reps) : 0} />
        <SoundToggle className="ex-sound" />
      </div>
      <div className="ex-copy" key={`${shown.set}-${shown.rep}-${shown.move}`}>
        <span className="ex-step">{step.kind === 'gap' ? <>Hazırlan · <b>{progressText(mode, shown)}</b></> : <b>{progressText(mode, shown)}</b>}</span>
        <h1 className="ex-title" aria-live="assertive">{mv.name}</h1>
        <p className="ex-para dd-cue">{mv.cue}</p>
      </div>
      <div className="ex-mid dd-mid">
        <Arena progress={part} off={step.kind !== 'hold'}>
          <PostureArt move={shown.move} />
        </Arena>
        <div className={`dd-left${step.kind === 'gap' ? ' wait' : ''}`} aria-hidden="true">{left}</div>
      </div>
      {useCam ? statusLine : null}
      <div className="ex-foot" />
    </main>
  )
}

function Segs({ n, cur, part }) {
  return (
    <div className="ex-segs" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={cur + 1}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={i < cur ? 'd' : ''}>{i === cur && <i style={{ width: `${part * 100}%` }} />}</span>
      ))}
    </div>
  )
}
