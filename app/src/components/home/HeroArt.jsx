import { useId } from 'react'
import { GLYPH } from '../TodayPath.jsx'
import { EGlyph } from '../howtoArt.jsx'
import { useIrisArt } from '../ExerciseArt.jsx'

// Ana sayfa · ilk 7 günün büyük kartının çizimi (Yön B "Tek büyük kart"; 5 saniye turu 6). Kartın kahramanı bugünün ilk
// işinin kendi çizimi, büyük: ölçümde test alanındaki beyaz karoda E (her temada beyaz zemin, siyah harf; AcuityTest ile
// aynı) ve dört yön oku, egzersizde göz (egzersiz sahnesinin gözü ve irisi, components/ExerciseArt.jsx) hareketin
// yönünde bakar, molada ay ve su halkaları, öteki duraklarda durağın yoldaki çizimi. Hepsi bir iris halkasının (günlük
// ışınlar; 8. günden ilk görünümde duran gözün ışınları, components/home/dayIrisDraw.js) içinde: imza görsel.
// Yazı yok (aria-hidden); kartın yazıları HomeGo'da. Hareketi Azalt: çizim durgundur (styles/home.css).

const C = 80 // 160 birimlik kutunun merkezi
// Halkanın ışınları: belirlenimci (her açılışta aynı halka), 84 ışın, boyları ve parlaklıkları değişken
const RAYS = (() => {
  let a = 0x9e3779b9
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = { dim: '', mid: '', hi: '' }
  const n = 84
  for (let i = 0; i < n; i++) {
    const ang = (2 * Math.PI * (i + rnd() * 0.6)) / n
    const r0 = 58 + rnd() * 2.5
    const r1 = 66 + rnd() * 11
    const p = `M${(C + Math.cos(ang) * r0).toFixed(1)} ${(C + Math.sin(ang) * r0).toFixed(1)}L${(C + Math.cos(ang) * r1).toFixed(1)} ${(C + Math.sin(ang) * r1).toFixed(1)}`
    const k = rnd()
    if (k < 0.5) out.dim += p
    else if (k < 0.84) out.mid += p
    else out.hi += p
  }
  return out
})()

function Ring() {
  return (
    <g className="ha-ring">
      <circle className="ha-glow" cx={C} cy={C} r="76" />
      <circle className="ha-limbus" cx={C} cy={C} r="57" />
      <path className="ha-ray dim" d={RAYS.dim} />
      <path className="ha-ray mid" d={RAYS.mid} />
      <path className="ha-ray hi" d={RAYS.hi} />
    </g>
  )
}

// Yön oku (açık ok başı): (x, y) ucun yeri, rot derece (0 = sağa)
const Chev = ({ x, y, rot, cls = '' }) => <path className={`ha-chev ${cls}`} d="M-4 -7.5L3.5 0L-4 7.5" transform={`translate(${x} ${y}) rotate(${rot})`} />

// Ölçüm: beyaz karoda sağa bakan E ve dört yön oku ("E hangi yöne bakıyor?"); E'nin baktığı yönün oku parlak ve o yöne
// hafifçe kayar (testteki hareket: E'nin açık tarafına kaydır; howtoArt.jsx AcuitySwipeArt). E'nin yönü değişmez: durgun
// bir karede sola bakan E "3", aşağı bakan "m" gibi okunuyor.
const ARROWS = [['right', 0, [C + 41, C]], ['left', 180, [C - 41, C]], ['down', 90, [C, C + 41]], ['up', 270, [C, C - 41]]]
function MeasureArt({ lines = false }) {
  return (
    <>
      <rect className="ha-tile" x={C - 26} y={C - 26} width="52" height="52" rx="13" />
      {lines ? (
        <path className="ha-lines" d={`M${C - 14} ${C - 9}h28M${C - 14} ${C}h28M${C - 14} ${C + 9}h18`} />
      ) : (
        <>
          <EGlyph x={C - 15} y={C - 15} size={30} dir="right" fill="#0b1219" />
          {ARROWS.map(([d, rot, [x, y]]) => (d === 'right' ? <g key={d} className="ha-swipe"><Chev x={x} y={y} rot={rot} cls="on" /></g> : <Chev key={d} x={x} y={y} rot={rot} />))}
        </>
      )}
    </>
  )
}

// Egzersiz: göz (badem), içinde iris; iris hareketin yönünde gider gelir. Yön okları gözün iki yanında.
const MOVES = { arrows: 'mv-x', updown: 'mv-y', circle: 'mv-o', lid: 'mv-lid' }
function EyeArt({ glyph }) {
  const id = useId().replace(/:/g, '')
  const { eye } = useIrisArt()
  const almond = `M${C - 46} ${C}Q${C} ${C - 50} ${C + 46} ${C}Q${C} ${C + 50} ${C - 46} ${C}Z`
  const mv = MOVES[glyph] ?? ''
  return (
    <>
      <defs>
        <clipPath id={`ha-clip-${id}`}>
          <path d={almond} />
        </clipPath>
        <radialGradient id={`ha-iris-${id}`} cx="0.4" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#5edce6" />
          <stop offset="0.5" stopColor="#19c2d1" />
          <stop offset="1" stopColor="#1f5fd6" />
        </radialGradient>
      </defs>
      <path className="ha-sclera" d={almond} />
      <g clipPath={`url(#ha-clip-${id})`}>
        <g className={`ha-iris ${mv}`}>
          <circle cx={C} cy={C} r="21" fill={`url(#ha-iris-${id})`} />
          {eye && <image href={eye} x={C - 23} y={C - 23} width="46" height="46" />}
          <circle className="ha-pupil" cx={C} cy={C} r="7.5" />
          <circle className="ha-glint" cx={C - 6} cy={C - 7} r="3" />
        </g>
        {glyph === 'lid' && <path className="ha-lid" d={`M${C - 46} ${C}Q${C} ${C - 50} ${C + 46} ${C}L${C + 46} ${C - 40}L${C - 46} ${C - 40}Z`} />}
      </g>
      <path className="ha-lidline" d={almond} />
      {glyph === 'arrows' && (
        <>
          <Chev x={C + 53} y={C} rot={0} cls="ha-dir on" />
          <Chev x={C - 53} y={C} rot={180} cls="ha-dir on" />
        </>
      )}
      {glyph === 'updown' && (
        <>
          <Chev x={C} y={C - 32} rot={270} cls="ha-dir on" />
          <Chev x={C} y={C + 32} rot={90} cls="ha-dir on" />
        </>
      )}
    </>
  )
}

// Mola: ay ve yavaşça açılan su halkaları
function RestArt() {
  return (
    <>
      {[0, 1, 2].map((i) => <circle key={i} className={`ha-ripple r${i}`} cx={C} cy={C} r="30" />)}
      <circle className="ha-moonbg" cx={C} cy={C} r="30" />
      <g transform={`translate(${C - 17} ${C - 17}) scale(1.42)`}>
        <path className="ha-moon" d="M15 4a8 8 0 1 0 5 13.6A6.4 6.4 0 0 1 15 4z" />
      </g>
    </>
  )
}

// Öteki duraklar: göz bebeğinde durağın yoldaki çizimi (GLYPH) ya da modülün simgesi
function GlyphArt({ glyph, Icon }) {
  return (
    <>
      <circle className="ha-moonbg" cx={C} cy={C} r="32" />
      {GLYPH[glyph] ? (
        <svg className="ha-gl" x={C - 20} y={C - 20} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {GLYPH[glyph]}
        </svg>
      ) : Icon ? (
        <foreignObject x={C - 20} y={C - 20} width="40" height="40">
          <Icon size={40} className="ha-gl" aria-hidden="true" />
        </foreignObject>
      ) : (
        <circle className="ha-dot" cx={C} cy={C} r="9" />
      )}
    </>
  )
}

export default function HeroArt({ stop = null, kind = null, Icon = null }) {
  let art
  if (kind === 'breath' || stop?.restSlot) art = <RestArt />
  else if (stop?.kind === 'measure') art = <MeasureArt lines={stop.glyph === 'lines'} />
  else if (stop?.kind === 'exercise' || stop?.id === 'routine') art = <EyeArt glyph={stop.glyph} />
  else art = <GlyphArt glyph={stop?.glyph} Icon={Icon} />
  return (
    <svg className="ha" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <Ring />
      {art}
    </svg>
  )
}
