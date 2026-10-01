import { useId } from 'react'

// Nefes formu (modul.md §3; PLAN.v2 §E.2): her derste tek, yumuşak kenarlı ışık formu; derse özgü biçim.
// 1 genişleyen halka · 2 ince yatay ufuk çizgisi · 3 sönen kor · 5 tek ışık noktası.
// Ufuk (Ders 2) ekranı boydan boya geçer, uçları söner (kesik bir "düz hat" gibi okunmasın); ışık ufkun üstünde
// yükselir, altında sönük yansır. Kütüphane ve ayrıntıdaki ders imgesiyle aynı sahne (LessonArt.jsx).
// Durum visualAt'ten gelir (motorun konumu). Yanıp sönme yok: değişimler CSS geçişiyle birkaç saniyeye yayılır.
// Hareketi Azalt ya da nöbet cevabı "Hayır" değilse (still) form ölçeklenmez (scale 1) ve biçimi de değişmez (ufkun
// halesi, noktanın halesi sabit): imge ve evre yalnız opaklıkla, çok yavaş (3 sn) gösterilir; ani geçiş yok.
// Parlaklık tavanı: formun en parlak noktası zeminde bağıl ≈ %15 (gece %4) ışıklılığı geçmez (VARSAYIM; PLAN.v2 §E.2).

export const PLAYER_BG = '#050a12'
export const LUM_CAP = { day: 0.15, night: 0.04 }

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const rgb = (hex) => {
  const n = parseInt(String(hex).replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const relLum = (c) => {
  const [r, g, b] = c.map((x) => lin(x / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// Formun renginin zemin üstünde tavanı aşmayacağı en büyük opaklık (sRGB karışımı; ikili arama)
export function maxAlpha(color, cap, bg = PLAYER_BG) {
  const c = rgb(color)
  const z = rgb(bg)
  const mix = (a) => c.map((x, i) => x * a + z[i] * (1 - a))
  if (relLum(mix(1)) <= cap) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2
    if (relLum(mix(m)) <= cap) lo = m
    else hi = m
  }
  return lo
}

// Ufuk (viewBox 400×200, ufuk y=100). Hepsi dersin renginde: en parlak yer ufuk çizgisinin kendisi (tavan grubun
// opaklığıyla korunur; beyaza açılan bir ışık yok). ry: gökteki ışığın yüksekliği (imgede artar; still iken sabit).
// sky / sea: gökteki ışığın ve yansımanın opaklığı (≤ 1: en parlak nokta yine çizgi, tavan aşılmaz). 5 saniye turu 2
// ("ortadaki ışık o kadar soluk ki bir şey yüklenmemiş sanıyorum"): ışık, tavanın altında kalarak daha geniş ve görünür.
function HorizonShape({ color, sky, sea, ry }) {
  const id = `ygf${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.42" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.28" stopColor={color} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="0.72" stopColor={color} stopOpacity="0.85" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}r`}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}s`}><rect x="-200" y="-200" width="800" height="300" /></clipPath>
        <clipPath id={`${id}w`}><rect x="-200" y="100" width="800" height="300" /></clipPath>
      </defs>
      <ellipse cx="200" cy="100" rx="200" ry={ry} fill={`url(#${id}g)`} opacity={sky} clipPath={`url(#${id}s)`} className="yg-fade yg-ry" />
      <ellipse cx="200" cy="100" rx="170" ry="30" fill={`url(#${id}g)`} opacity={sea} clipPath={`url(#${id}w)`} className="yg-fade" />
      <line x1="0" y1="100" x2="400" y2="100" stroke={`url(#${id}l)`} strokeWidth="2" />
      <rect x="132" y="111" width="136" height="1.4" rx="0.7" fill={`url(#${id}r)`} opacity="0.3" />
      <rect x="164" y="122" width="72" height="1.2" rx="0.6" fill={`url(#${id}r)`} opacity="0.18" />
      <rect x="186" y="133" width="28" height="1" rx="0.5" fill={`url(#${id}r)`} opacity="0.1" />
    </>
  )
}

function Shape({ form, color, v, still = false }) {
  const glow = v.image ? 0.5 : 0.28
  if (form === 'ring') {
    return (
      <>
        <circle cx="100" cy="100" r="46" fill="none" stroke={color} strokeWidth="12" opacity={glow * 0.5} className="yg-soft" />
        <circle cx="100" cy="100" r="46" fill="none" stroke={color} strokeWidth="2.5" />
      </>
    )
  }
  if (form === 'horizon') return <HorizonShape color={color} sky={v.image ? 1 : 0.82} sea={v.image ? 0.55 : 0.42} ry={still ? 80 : v.image ? 92 : 70} />
  if (form === 'ember') {
    return (
      <>
        <circle cx="100" cy="112" r="34" fill={color} opacity={glow * 0.3} className="yg-soft" />
        <circle cx="100" cy="112" r="12" fill={color} />
      </>
    )
  }
  // point: tek ışık noktası; hale evreyle daralır (Varış geniş, Derin en küçük)
  const halo = still ? 22 : v.phase === 'varis' ? 30 : v.phase === 'derinlesme' ? 22 : v.phase === 'derin' ? 14 : 24
  return (
    <>
      <circle cx="100" cy="100" r={halo} fill={color} opacity={0.22} className="yg-soft yg-r" />
      <circle cx="100" cy="100" r="4.5" fill={color} />
    </>
  )
}

export default function BreathForm({ form = 'ring', color = '#7EB2DD', v, night = false, still = false }) {
  const state = v ?? { luminance: 0.8, scale: 1, image: false, phase: 'varis' }
  const cap = maxAlpha(night ? '#E3A857' : color, night ? LUM_CAP.night : LUM_CAP.day)
  const tint = night && state.ember ? '#E3A857' : color
  const wide = form === 'horizon' // ufuk ekranı boydan boya geçer
  return (
    <svg className={wide ? 'yg-form yg-form-wide' : 'yg-form'} viewBox={wide ? '0 0 400 200' : '0 0 200 200'} aria-hidden="true" focusable="false">
      <g
        className="yg-form-g"
        style={{ opacity: +(state.luminance * cap).toFixed(4), transform: `scale(${state.scale})`, transformOrigin: wide ? '200px 100px' : '100px 100px' }}
      >
        <Shape form={form} color={tint} v={state} still={still} />
      </g>
    </svg>
  )
}
