// Nefes formu (modul.md §3; PLAN.v2 §E.2): her derste tek, yumuşak kenarlı ışık formu; derse özgü biçim.
// 1 genişleyen halka · 2 ince yatay ufuk çizgisi · 3 sönen kor · 5 tek ışık noktası.
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
  if (form === 'horizon') {
    return (
      <>
        <ellipse cx="100" cy="100" rx="84" ry={still ? 12 : v.image ? 16 : 9} fill={color} opacity={glow * 0.35} className="yg-soft yg-ry" />
        <line x1="22" y1="100" x2="178" y2="100" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </>
    )
  }
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
  return (
    <svg className="yg-form" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g
        className="yg-form-g"
        style={{ opacity: +(state.luminance * cap).toFixed(4), transform: `scale(${state.scale})`, transformOrigin: '100px 100px' }}
      >
        <Shape form={form} color={tint} v={state} still={still} />
      </g>
    </svg>
  )
}
