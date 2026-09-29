import { useEffect, useRef, useState } from 'react'
import { Check, Eye, Hand, X } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { createHoldTimer, focusZone } from '../lib/gaze.js'
import { cue } from '../lib/cue.js'
import { haptic } from '../lib/native.js'
import '../styles/acuity.css'

// Tam ekran "uzağa bak" konfor molası.
// Kanıt notu: 20-20-20 kuralının (20 dk'da bir, 20 sn, 6 m) semptomlara etkisi gösterilemedi
// (Johnson & Rosenfield 2022, Optom Vis Sci 100:52, DOI 10.1097/OPX.0000000000001971; ayrıca
// 09_uyum_goz_kirpma.md: Talens-Estarelles 2022). Bu yüzden mola ZORUNLU değildir, "Atla" vardır
// ve metin sağlık iddiası taşımaz ("konfor molası").
// Süre: 20 sn (varsayılan). Yakın işten sonra geçici odak kayması (NITM) 5 dk'lık yakın görevden
// sonra çocuklarda medyan 20–50 sn'de sönüyor (Lin 2012, Optom Vis Sci 89:1725,
// DOI 10.1097/OPX.0b013e3182775e05). Bizim test ~1 dk ve 40 cm (daha hafif yük).
// VARSAYIM: 20 sn, yetişkinde ~1 dk'lık 40 cm yükü için yeterli kabul edildi.
//
// trueDepth: sayaç yalnızca yüz görünür ve focusZone(kare) === 'far' iken ilerler.
// Odak verisi gelmezse (eski native sürüm) ya da takip başlamazsa düz geri sayıma düşer.
// Görünüm (yakın E testi E8, PLAN.md; styles/acuity.css): ✕ · "Uzağa bak" · halka (sayı sayfa metni) · sıradaki
// gözün önizlemesi ("Sonra: Sol göz · sağ gözünü ört") · "Atla". Tek ekran, kaydırmasız (320×568'de "Atla" görünür).
// endCue=false: bitişte yalnız titreşim (sıradaki ekran kendi sesli cümlesini söyler; iki ses üst üste binmesin).

const NO_FRAME_FALLBACK_MS = 4000 // bu sürede hiç kare gelmezse düz sayaç
const NO_FOCUS_FALLBACK_MS = 3000 // yüz görünüyor ama odak alanları yoksa düz sayaç
const END_TEXT = 'Mola bitti. Ekrana dönebilirsin.'
// Mola bitince ya da atlanınca window'a yayılır; App.jsx yakın süre sayacını sıfırlar (✕ ile kapatınca yayılmaz).
export const RESTED_EVENT = 'gozolcum:rested'

function announceRested() {
  try {
    window.dispatchEvent(new Event(RESTED_EVENT))
  } catch {
    // olay desteklenmiyor: yoksay
  }
}

export default function RestBreak({
  seconds = 20,
  trueDepth = false,
  title = 'Uzağa bak',
  subtitle = 'Pencereden ya da odanın ucuna bak.',
  doneText = 'Hazırsın', // bitişteki durum satırı (çağıran bağlama göre verir)
  next = null, // { eye: 'R' | 'L' | 'OU', text: 'Sol göz · sağ gözünü ört' } — sıradaki gözün önizlemesi
  endCue = true,
  onDone,
  onSkip,
  onClose, // verilirse sol üstte ✕ (çağıran çıkış sayfasını açar; olay/haptic yok)
}) {
  const totalMs = Math.max(1, seconds) * 1000
  const [mode, setMode] = useState(trueDepth ? 'track' : 'timer') // track | timer
  const [elapsedMs, setElapsedMs] = useState(0)
  const [gaze, setGaze] = useState(trueDepth ? 'searching' : null) // searching | far | near | noface
  const [finished, setFinished] = useState(false)

  const elapsedRef = useRef(0)
  elapsedRef.current = elapsedMs
  const settled = useRef(false)
  const doneTimer = useRef(0)
  const hold = useRef(createHoldTimer({ maxGapMs: 250 }))
  const firstFrameAt = useRef(null)
  const sawFocus = useRef(false)
  const lastUi = useRef(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  function finish() {
    if (settled.current) return
    settled.current = true
    announceRested()
    setElapsedMs(totalMs)
    setFinished(true)
    // cue(…, false) haptic('success') da verir (src/lib/cue.js); göz uzaktayken sesli haber verir.
    if (endCue) cue(END_TEXT, false)
    else haptic('success')
    doneTimer.current = setTimeout(() => onDoneRef.current?.(), 700)
  }

  function skip() {
    if (settled.current) return
    settled.current = true
    announceRested()
    onSkip?.()
  }

  useEffect(() => () => clearTimeout(doneTimer.current), [])

  const cam = useFaceTracking({
    enabled: trueDepth && mode === 'track',
    trueDepth: true,
    onFrame: (m) => {
      if (settled.current) return
      const ts = m.ts ?? performance.now()
      if (firstFrameAt.current == null) firstFrameAt.current = ts
      const face = Boolean(m.face)
      const zone = face ? focusZone(m) : null
      if (zone != null) sawFocus.current = true
      else if (face && !sawFocus.current && ts - firstFrameAt.current > NO_FOCUS_FALLBACK_MS) {
        setMode('timer')
        return
      }
      const ok = face && zone === 'far'
      const held = hold.current.push(ok, ts)
      if (held >= totalMs) {
        finish()
        return
      }
      if (ts - lastUi.current > 100) {
        lastUi.current = ts
        setElapsedMs(held)
        setGaze(!face ? 'noface' : ok ? 'far' : 'near')
      }
    },
  })

  // Takip hiç başlamazsa / hata verirse düz sayaca geç
  useEffect(() => {
    if (mode !== 'track') return undefined
    if (cam.error) {
      setMode('timer')
      return undefined
    }
    const id = setTimeout(() => {
      if (firstFrameAt.current == null) setMode('timer')
    }, NO_FRAME_FALLBACK_MS)
    return () => clearTimeout(id)
  }, [mode, cam.error])

  // Düz geri sayım (kaldığı yerden devam eder)
  useEffect(() => {
    if (mode !== 'timer' || settled.current) return undefined
    const startAt = performance.now() - elapsedRef.current
    const id = setInterval(() => {
      const e = performance.now() - startAt
      if (e >= totalMs) {
        clearInterval(id)
        finish()
      } else setElapsedMs(e)
    }, 100)
    return () => clearInterval(id)
    // finish yalnızca ref'lere ve durum ayarlayıcılarına dayanır; mod değişince sayaç yeniden kurulur.
  }, [mode, totalMs])

  const leftSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000))
  const frac = Math.min(1, elapsedMs / totalMs)
  const tracking = mode === 'track'
  const waiting = tracking && !finished && gaze !== 'far'
  const status = finished
    ? doneText
    : !tracking || gaze === 'far'
      ? `${leftSec} saniye`
      : gaze === 'noface'
        ? 'Telefonu yüzüne dönük tut'
        : gaze === 'near'
          ? 'Uzağa bakınca sayaç ilerler'
          : 'Yüzün aranıyor'

  const size = 120
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  return (
    <div className="acu-scr acu-rest" role="dialog" aria-modal="true" aria-labelledby="rest-title">
      <div className="acu-body">
        <div className="acu-top">
          {onClose ? (
            <button type="button" className="acu-ib" onClick={() => onClose()} aria-label="Testten çık">
              <X size={20} aria-hidden="true" />
            </button>
          ) : (
            <span className="acu-ib-sp" aria-hidden="true" />
          )}
          <span className="acu-prog">Mola</span>
          <span className="acu-ib-sp" aria-hidden="true" />
        </div>
        <div className="acu-ttl center">
          <h1 id="rest-title">{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="acu-ring">
          <div className={`acu-dial${finished ? ' done' : ''}${waiting ? ' waiting' : ''}`}>
            <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
              <circle className="acu-dial-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
              <circle
                className="acu-dial-value"
                cx={size / 2}
                cy={size / 2}
                r={r}
                strokeWidth={stroke}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - frac)}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </svg>
            <span className="acu-dial-num" aria-hidden="true">
              {finished ? <Check size={40} strokeWidth={2.6} /> : leftSec}
            </span>
          </div>
        </div>
        <p className={`acu-note acu-rest-status${waiting ? ' wait' : ''}`} aria-live="off">{status}</p>
        {/* VoiceOver: saniye sayısı her saniye okunmaz; yalnız bakış yönlendirmesi ("Uzağa bakınca sayaç ilerler",
            "Telefonu yüzüne dönük tut") ve bitiş kibarca okunur */}
        <span className="acu-sr" aria-live="polite">{finished || waiting ? status : ''}</span>
        {next && (
          <div className="acu-rows acu-rest-next">
            <div className="acu-row">
              <span className="acu-ic wait" aria-hidden="true">{next.eye === 'OU' ? <Eye size={15} /> : <Hand size={15} />}</span>
              <span className="acu-rt">
                <span className="k">Sonra</span>
                <span className="v">{next.text}</span>
              </span>
            </div>
          </div>
        )}
        <button type="button" className="acu-cta ghost" onClick={skip} disabled={finished}>Atla</button>
      </div>
    </div>
  )
}
