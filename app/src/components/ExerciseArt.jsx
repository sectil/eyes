import { useMemo } from 'react'
import { drawCalIris } from '../lib/irisDraw.js'
import { useDarkTheme } from '../hooks/useDarkTheme.js'

// Egzersiz sahnesi (Artifact "Nefona Egzersiz Sahnesi", onaylı): her hareket 260 birimlik aynı dairede çizilir,
// dıştaki altın halka adımın ilerlemesidir. Çizimler SVG (viewBox 0 0 260 260, merkez 130,130); renkler
// styles/exercise.css'teki --ex-* değişkenlerinden gelir (iki tema). İris, kalibrasyondaki çizimin aynısı (lib/irisDraw.js).

const C = 130
const RING = 128
const RING_LEN = 2 * Math.PI * RING

// İris görüntüleri: bir kez çizilip data URL olarak saklanır (tema başına)
const irisCache = new Map()
function irisUrl(key, opts) {
  if (irisCache.has(key)) return irisCache.get(key)
  let url = ''
  try {
    const cv = document.createElement('canvas')
    drawCalIris(cv, opts)
    url = cv.width ? cv.toDataURL() : ''
  } catch {
    url = ''
  }
  irisCache.set(key, url)
  return url
}
// eye: göz çizimindeki doğal iris (artısız); tgt: bakış hedefi (artı + altın bakış noktası, kalibrasyondaki gibi)
export function useIrisArt() {
  const dark = useDarkTheme()
  return useMemo(
    () => ({
      eye: irisUrl(`eye-${dark}`, { size: 96, dark, pupil: 0.3, fix: false, cross: false, dpr: 3 }),
      tgt: irisUrl(`tgt-${dark}`, { size: 76, dark, pupil: 0.3, fix: true, cross: true, dpr: 3 }),
    }),
    [dark],
  )
}

// Sahne: taban daire + içerik + ilerleme halkası. overlay: SVG dışı içerik (nefes küresi gibi)
export function Arena({ progress = 0, tone = 'gold', off = false, base = true, overlay = null, children }) {
  const p = Math.max(0, Math.min(1, progress))
  return (
    <div className={`ex-arena${off ? ' off' : ''}${tone === 'warn' ? ' warn' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 260 260">
        {base && <circle className="ex-base" cx={C} cy={C} r="126" />}
        <g className="ex-art">{children}</g>
        <circle className="ex-track" cx={C} cy={C} r={RING} />
        {p > 0 && <circle className="ex-arc" cx={C} cy={C} r={RING} style={{ strokeDasharray: `${p * RING_LEN} ${RING_LEN}` }} transform={`rotate(-90 ${C} ${C})`} />}
      </svg>
      {overlay && <div className="ex-overlay">{overlay}</div>}
    </div>
  )
}

// ---- Göz: açık (iris görünür) · kapalı (kapak çizgisi ve kirpikler) · sık (köşelerde altın gerilim çizgileri) ----
const EYE_UP = 'M30 130 Q130 40 230 130'
const EYE_LO = 'Q130 214 30 130'
const LID = 'M30 130 Q130 176 230 130'
const LASHES = [0.2, 0.33, 0.5, 0.67, 0.8].map((t) => {
  const x = (1 - t) ** 2 * 30 + 2 * (1 - t) * t * 130 + t * t * 230
  const y = (1 - t) ** 2 * 130 + 2 * (1 - t) * t * 176 + t * t * 130
  const dx = 200
  const dy = 2 * (1 - t) * 46 - 2 * t * 46
  const L = Math.hypot(dx, dy)
  return `M${x.toFixed(1)} ${y.toFixed(1)} l${((-dy / L) * 16).toFixed(1)} ${((dx / L) * 16).toFixed(1)}`
})

export function EyeArt({ state = 'open', img, clipId = 'ex-eye-clip' }) {
  if (state === 'open') {
    return (
      <g className="ex-eye open">
        <defs>
          <clipPath id={clipId}>
            <path d={`${EYE_UP} ${EYE_LO}Z`} />
          </clipPath>
        </defs>
        <path className="ex-sclera" d={`${EYE_UP} ${EYE_LO}Z`} />
        {img && (
          <g clipPath={`url(#${clipId})`}>
            <image href={img} x="84" y="84" width="92" height="92" />
          </g>
        )}
        <path className="ex-lid-line" d={`${EYE_UP} ${EYE_LO}Z`} />
      </g>
    )
  }
  const squeeze = state === 'squeeze'
  return (
    <g className={`ex-eye closed${squeeze ? ' squeeze' : ''}`}>
      <g className="ex-lid">
        <path d={LID} />
        {LASHES.map((d) => <path key={d} d={d} />)}
      </g>
      {squeeze && (
        <g className="ex-tension">
          <path d="M48 118 l-9 -10" /><path d="M66 111 l-4 -13" /><path d="M86 106 l-1 -13" />
          <path d="M212 118 l9 -10" /><path d="M194 111 l4 -13" /><path d="M174 106 l1 -13" />
        </g>
      )}
    </g>
  )
}

// ---- Bakış: hedef dilim + yön okları + hedef iris + canlı bakış noktası ----
const DIRV = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }
const at = (a, r) => `${(C + Math.cos(a) * r).toFixed(1)} ${(C + Math.sin(a) * r).toFixed(1)}`

// gaze: { x, y } −1…1 (y yukarı artı) ya da null; ok: hedefte; warn: yanlış yöne bakıyor
export function LookArt({ dir, img, gaze = null, ok = false, warn = false, gradId = 'ex-look-grad' }) {
  const [vx, vy] = DIRV[dir] ?? DIRV.right
  const ang = Math.atan2(vy, vx)
  const deg = (ang * 180) / Math.PI
  const tx = C + vx * 90
  const ty = C + vy * 90
  const gx = gaze ? C + gaze.x * 110 : 0
  const gy = gaze ? C - gaze.y * 110 : 0
  return (
    <g className={`ex-look${ok ? ' ok' : ''}`}>
      <defs>
        <radialGradient id={gradId} cx={C} cy={C} r="128" gradientUnits="userSpaceOnUse">
          <stop offset="0.25" className="ex-look-stop0" />
          <stop offset="1" className="ex-look-stop1" />
        </radialGradient>
      </defs>
      <path d={`M${C} ${C} L${at(ang - Math.PI / 4, 126)} A126 126 0 0 1 ${at(ang + Math.PI / 4, 126)} Z`} fill={`url(#${gradId})`} />
      <circle className="ex-dash" cx={C} cy={C} r="34" />
      {!ok && [44, 54, 64].map((d, i) => (
        <path key={d} className="ex-chev" d="M-4 -7 L3 0 L-4 7" transform={`translate(${C + vx * d} ${C + vy * d}) rotate(${deg})`} style={{ opacity: 0.3 + i * 0.3 }} />
      ))}
      <circle className="ex-tint" cx={tx} cy={ty} r="28" />
      {img && <image href={img} x={tx - 22} y={ty - 22} width="44" height="44" />}
      {gaze && ok && <circle className="ex-lock" cx={tx} cy={ty} r="28" />}
      {gaze && !ok && <GazeDot x={gx} y={gy} tone={warn ? 'warn' : ''} />}
    </g>
  )
}

function GazeDot({ x, y, tone = '' }) {
  return (
    <g className={`ex-gaze${tone ? ` ${tone}` : ''}`}>
      <circle cx={x} cy={y} r="15" className="halo" />
      <circle cx={x} cy={y} r="8" className="dot" />
    </g>
  )
}

// ---- Daire: yörünge + yön okları + dönen tempo irisi; kamerada sayım eşiği ve bakış noktası ----
// minR: sayım eşiği yarıçapı (0–1, kutu kenarına oran); gaze: { x, y } −1…1; out: eşiğin dışında
export function OrbitArt({ dir = 'cw', img, tracked = false, minR = 0.4, gaze = null, out = false, warn = false }) {
  const sgn = dir === 'cw' ? 1 : -1
  return (
    <g className={`ex-orbit${tracked ? ' tracked' : ''}`}>
      <circle className="ex-orbit-path" cx={C} cy={C} r="96" />
      {[90, 210, 330].map((a) => {
        const r = (a * Math.PI) / 180
        return <path key={a} className="ex-chev" d="M-6 -8 L4 0 L-6 8" transform={`translate(${(C + Math.cos(r) * 96).toFixed(1)} ${(C + Math.sin(r) * 96).toFixed(1)}) rotate(${a + 90 * sgn})`} />
      })}
      {tracked && <circle className="ex-dash" cx={C} cy={C} r={(minR * 110).toFixed(1)} />}
      <g className={`ex-orbit-spin ${dir}`}>
        <circle className="ex-tint" cx={C + 96} cy={C} r="24" />
        {img && <image href={img} x={C + 96 - 17} y={C - 17} width="34" height="34" />}
      </g>
      {gaze && <GazeDot x={C + gaze.x * 110} y={C - gaze.y * 110} tone={warn ? 'warn' : out ? 'gold' : ''} />}
    </g>
  )
}

// ---- Uzak: ufuk; ufuk çizgisinde bakılacak uzaklığı anlatan altın nokta ----
export function HorizonArt({ faint = false, clipId = 'ex-hz-clip', gradId = 'ex-hz-sky' }) {
  return (
    <g className={`ex-horizon${faint ? ' faint' : ''}`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={C} cy={C} r="126" />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="ex-sky0" />
          <stop offset="1" className="ex-sky1" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`} className="scene">
        <rect width="260" height="260" fill={`url(#${gradId})`} />
        <path className="ex-h1" d="M0 150 Q40 132 78 144 T150 138 T214 142 T260 136 V260 H0z" />
        <path className="ex-h2" d="M0 176 Q60 150 118 170 T260 160 V260 H0z" />
        <path className="ex-h3" d="M0 208 Q70 184 140 204 T260 196 V260 H0z" />
        {!faint && (
          <g className="ex-sun">
            <circle cx="168" cy="139" r="16" className="halo" />
            <circle cx="168" cy="139" r="5" />
          </g>
        )}
      </g>
    </g>
  )
}

// ---- Yakın: ekrandaki iris (yakın hedef) ----
export function NearArt({ img }) {
  return (
    <g className="ex-near">
      <circle className="ex-near-ring" cx={C} cy={C} r="62" />
      <circle className="ex-tint" cx={C} cy={C} r="50" />
      {img && <image href={img} x="92" y="92" width="76" height="76" />}
    </g>
  )
}

// ---- Gözlerini kapat: kapalı göz ve yumuşak ışık ----
export function RestArt({ gradId = 'ex-rest-glow' }) {
  return (
    <g className="ex-rest">
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0" className="ex-glow0" />
          <stop offset="1" className="ex-glow1" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="110" fill={`url(#${gradId})`} />
      <g transform="translate(0 -10)">
        <EyeArt state="closed" />
      </g>
    </g>
  )
}

// ---- Adım tamam: altın onay ----
export function DoneArt() {
  return (
    <g className="ex-done">
      <circle cx={C} cy={C} r="58" className="halo" />
      <circle cx={C} cy={C} r="40" className="disc" />
      <path d="M112 131 l12 12 l25 -27" className="tick" />
    </g>
  )
}

// Ritim şeridi (göz kırpma egzersizi): bir tekrarın adımları, süreleriyle orantılı; cur: şimdiki adım (−1: yok)
export function RhythmStrip({ cycle, cur = -1, part = 0 }) {
  return (
    <div className="ex-rhythm" aria-hidden="true">
      <div className="bar">
        {cycle.map((s, i) => (
          <span key={s.id} className={i < cur ? 'd' : ''} style={{ flex: s.ms }}>
            {i === cur && <i style={{ width: `${Math.min(1, part) * 100}%` }} />}
          </span>
        ))}
      </div>
      <div className="lb">
        {cycle.map((s, i) => (
          <span key={s.id} className={i === cur ? 'on' : ''} style={{ flex: s.ms }}>{s.label}</span>
        ))}
      </div>
    </div>
  )
}

// Sayılan hareketler: altın boncuklar
export function Pips({ n, f, label }) {
  return (
    <span className="ex-pips" aria-label={`${f} / ${n} ${label}`}>
      {Array.from({ length: n }, (_, i) => <i key={i} className={i < f ? 'f' : ''} />)}
      <b>{f} / {n}</b> {label}
    </span>
  )
}

// Yakın–uzak simgesi (lucide çizgisinde; başlangıç listesinde)
export function NearFarIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="14" r="3.2" />
      <path d="M13 19l3.5-5.5 2 3 1.2-1.5L22 19z" />
    </svg>
  )
}
