import { useId } from 'react'

// Ders kimliği (kütüphane kartı, ders ayrıntısı, puan ve bitiş ekranları): dersin nefes formu, oynatıcının karanlık
// zemininde (modul.md §3 biçimleri: 1 halka · 2 ufuk çizgisi · 3 kor · 5 tek ışık noktası). Oynatıcıya girmeden aynı
// imge görünür; ders bitince "şafak" (mood='dawn'): ışık ufuktan yükselmiş, daha geniş (oynatıcıdaki gündüz kapanışı gibi).
// Yalnız süs: aria-hidden, yazı yok. Oynatıcının parlaklık tavanı (BreathForm LUM_CAP) burada yok: bu ekranlar karanlık
// odada izlenmez. Hareket: yalnız ışığın çok yavaş kayması (24 sn; yoga.css .yg-art-glow), Hareketi Azalt'ta hiç yok.
// viewBox 360×200, ufuk y=104. Bant ve kart: kapsayıcıyı doldurur (slice); uzun kart (tall): genişliğe sığar, gökteki
// ışık daha yüksek. Işıklar viewBox'ın içinde kalır (ekranın dışına taşan geometri yok); çizgiler ölçeklenmez.

const hex = (c) => {
  const n = parseInt(String(c).replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
// Rengi beyaza doğru açar (0–1): ışık kaynağının ortası
export const lighten = (c, k) => `#${hex(c).map((x) => Math.round(x + (255 - x) * k).toString(16).padStart(2, '0')).join('')}`

const W = 360
const CX = 180
const H0 = 104 // ufuk

function Horizon({ id, color, core, dawn, tall }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={core} stopOpacity="0.85" />
          <stop offset="0.35" stopColor={color} stopOpacity="0.38" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2={W + 20} y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.3" stopColor={color} stopOpacity="0.9" />
          <stop offset="0.5" stopColor={core} stopOpacity="1" />
          <stop offset="0.7" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}r`}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}sky`}><rect x="-400" y="-400" width="1200" height={400 + H0} /></clipPath>
        <clipPath id={`${id}sea`}><rect x="-400" y={H0} width="1200" height="600" /></clipPath>
      </defs>
      <g className="yg-art-glow">
        <ellipse cx={CX} cy={H0} rx="180" ry={tall ? 130 : dawn ? 96 : 66} fill={`url(#${id}g)`} opacity={dawn ? 1 : 0.8} clipPath={`url(#${id}sky)`} />
        <ellipse cx={CX} cy={H0} rx={dawn ? 172 : 150} ry={tall ? 44 : dawn ? 34 : 24} fill={`url(#${id}g)`} opacity="0.4" clipPath={`url(#${id}sea)`} />
      </g>
      <line x1="-20" y1={H0} x2={W + 20} y2={H0} stroke={`url(#${id}l)`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <rect x="118" y={H0 + 12} width="124" height="1.2" rx="0.6" fill={`url(#${id}r)`} opacity="0.34" />
      <rect x="146" y={H0 + 24} width="68" height="1.1" rx="0.55" fill={`url(#${id}r)`} opacity="0.2" />
      <rect x="166" y={H0 + 37} width="28" height="1" rx="0.5" fill={`url(#${id}r)`} opacity="0.12" />
    </>
  )
}

function Glow({ id, color, core, cx = CX, cy = 100, r, strong = 0.8 }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={core} stopOpacity={strong} />
          <stop offset="0.4" stopColor={color} stopOpacity={strong * 0.4} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="yg-art-glow" cx={cx} cy={cy} r={r} fill={`url(#${id}g)`} />
    </>
  )
}

// Gece dersinde birkaç sönük yıldız (sabit; yanıp sönmez)
const STARS = [[58, 34, 0.9], [112, 62, 0.6], [248, 28, 0.8], [300, 70, 0.55], [196, 18, 0.5], [30, 84, 0.45], [334, 40, 0.7]]

export default function LessonArt({ form = 'ring', color = '#7EB2DD', mood = 'rest', tall = false, className = '' }) {
  const id = `yga${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const dawn = mood === 'dawn'
  const core = lighten(color, 0.55)
  let body
  if (form === 'horizon') {
    body = <Horizon id={id} color={color} core={core} dawn={dawn} tall={tall} />
  } else if (form === 'ember') {
    body = (
      <>
        {STARS.map(([x, y, o]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill={core} opacity={o * 0.6} />)}
        <Glow id={id} color={color} core={core} cy={128} r={dawn ? 92 : 74} />
        <circle cx={CX} cy={128} r="7" fill={core} />
      </>
    )
  } else if (form === 'point') {
    body = (
      <>
        <Glow id={id} color={color} core={core} r={dawn ? 86 : 66} strong={0.6} />
        <circle cx={CX} cy={100} r="30" fill="none" stroke={color} strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx={CX} cy={100} r="3.6" fill={core} />
      </>
    )
  } else {
    body = (
      <>
        <Glow id={id} color={color} core={core} r={dawn ? 96 : 78} strong={0.5} />
        {[26, 44, 64].map((r, i) => (
          <circle key={r} cx={CX} cy={100} r={r} fill="none" stroke={i ? color : core} strokeOpacity={[0.95, 0.45, 0.2][i]} strokeWidth={i ? 1 : 1.6} vectorEffect="non-scaling-stroke" />
        ))}
      </>
    )
  }
  return (
    <svg className={`yg-art ${className}`.trim()} viewBox={`0 0 ${W} 200`} preserveAspectRatio={tall ? 'xMidYMid meet' : 'xMidYMid slice'} aria-hidden="true" focusable="false">
      {body}
    </svg>
  )
}
