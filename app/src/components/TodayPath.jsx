import { useEffect, useRef, useState } from 'react'
import { IrisMark } from './ui.jsx'
import { jevLine, canOpen } from '../lib/today.js'
import { fmtLeft, LIMITS } from '../lib/eyeBudget.js'
import { haptic } from '../lib/native.js'
import { EGlyph } from './howtoArt.jsx'
import '../styles/todaypath.css'

// Bugünün yolu (Build 26). Tasarım: Artifact "Bugünün Yolu" (yol planı §13). Duolingo'dan yalnızca niyet
// alındı (sıralı duraklar, görünür ilerleme); biçim markanın kendi dünyası:
//   egzersiz = diyafram (kanatlar kapalı → yarı açık → açık iris), ölçüm = mercek, pratik = kanatların
//   ardında sahne, mola = su ve ay (Nefes), final = altın kenar (fark etme). Nef tek kelimeyle yol gösterir.
// Her bölüm bir kanat yayı: 1. bölüm sağa ")", 2. bölüm sola "(" bükülür; arada su bandı.
// plan: lib/today.js buildPath sonucu; eye: App eyeStatus(); day: lib/notice.js dayNumber(now).
// newKeys: bugün ilk kez gelen durak ya da basamak (lib/progression.js newStopKeys): etikette "Yeni" (S0 taslağı b).
// restMin: molanın süresi (lib/progression.js pathRestMinutes; yoksa Nefes durağının süresi): bant ve baloncuk bunu yazar.
// staged: yol ilerleme bağlamıyla kuruldu (Ana sayfa). Yalnız o zaman S0 düzeltmeleri çizilir (Ç17 yıldızı, 320 pt'de
// baloncuk ve bölüm etiketi kabın içinde) ve 5 saniye turunun düzeltmeleri (Y1 ilk görünüm): açılışta kendiliğinden
// kaydırma yalnız az önce biten durak varken (ilk görünüm Ana sayfanın üstü: selam, günün sayıları, "Güne başla"),
// "Yeni" dolu hap ve sıradaki durakta baloncukta, "Başla" dolu düğme, baloncuk ve "Başla" dokunulur, günün şeridi
// ve bölümün göz payı kapsülleri yok (günün diyaframı aynı bilgiyi verir), sıradaki durağı beklerken kilit rozeti yok,
// etiketler gövde yazısıyla. Verilmezse çizim Y1 öncesiyle birebir aynıdır.

const W = 300 // yol koordinatı (px); ortalanır
const STEP = 116
export const A_CLOSED = 1.5
const A_NOW = 20
export const A_DONE = 38

const GLYPH = {
  arrows: <><path d="M3 12h18" /><path d="M7 8l-4 4 4 4" /><path d="M17 8l4 4-4 4" /></>,
  // Yukarı–aşağı (göz merdiveninin `dikey` grubu, SONSUZ_YOL.PLAN.v1 §3.A.6): Sağ–sol oklarının dikeyi
  updown: <><path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 17l4 4 4-4" /></>,
  far: <><path d="M2.5 19l6-8.5 3.8 5 2.7-3.2 6.5 6.7z" /><circle cx="17" cy="6" r="2" /></>,
  nearfar: <><circle cx="7" cy="12" r="4" /><circle cx="19" cy="12" r="1.8" /><path d="M12.2 12h3.6" strokeDasharray="1.2 2.2" /></>,
  circle: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M18 3.2v4h-4" /></>,
  lid: <><path d="M3 10.5c4.8 5.6 13.2 5.6 18 0" /><path d="M6.6 14.6l-1.5 2.4M12 16.3v2.8M17.4 14.6l1.5 2.4" /></>,
  constel: <><circle cx="6" cy="16.5" r="2.3" /><circle cx="12" cy="6.5" r="2.3" /><circle cx="18.5" cy="14.5" r="2.3" /><path d="M7.3 14.4l3.4-5.8M13.5 8.3l3.6 4.4" /></>,
  snake: <><path d="M17 5.5L8 9l8 5-9 4.5" strokeWidth="1.4" opacity=".6" /><circle cx="17" cy="5.5" r="2.2" fill="currentColor" /><circle cx="8" cy="9" r="1.8" fill="currentColor" /><circle cx="16" cy="14" r="1.8" fill="currentColor" /><circle cx="7" cy="18.5" r="1.8" fill="currentColor" /></>,
  flash: <path d="M13.5 2.5L5 13.5h6.5l-1.5 8 8.5-11H12z" />,
  street: <><path d="M3 21V9l5-3v15M8 21V4l7 3v14M15 21V11l6 2v8" /><path d="M2 21h20" /></>,
  span: <><rect x="2.5" y="9" width="4" height="6" rx="1" /><rect x="17.5" y="9" width="4" height="6" rx="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></>,
  spark: <path d="M12 3.5v4.5M12 16v4.5M3.5 12H8M16 12h4.5M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />,
  moon: <path d="M15 4a8 8 0 1 0 5 13.6A6.4 6.4 0 0 1 15 4z" fill="currentColor" stroke="none" />,
  // Yoga (PLAN.v3 §B.5, yol.md §5.4): üç yapraklı nilüfer ve su çizgisi
  lotus: <><path d="M12 4.5C14.2 7 14.2 12.4 12 15.5C9.8 12.4 9.8 7 12 4.5Z" /><path d="M12 15.5C8.5 15.5 5 13.3 4 9.8C7.4 9.8 10.4 12 12 15.5" /><path d="M12 15.5C15.5 15.5 19 13.3 20 9.8C16.6 9.8 13.6 12 12 15.5" /><path d="M6 19.5h12" /></>,
}
const Svg = ({ children, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const CHECK = <path d="M5 12.5l4.2 4.2L19 7" strokeWidth="3" />
const LOCK = <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></>
// Pratik durağının kanatları açılınca görünen sahne
const SCENE = {
  constel: <><path className="sc-l" d="M34 60L50 38L67 57" /><circle className="sc-c" cx="34" cy="60" r="7" /><circle className="sc-c" cx="50" cy="38" r="7" /><circle className="sc-c" cx="67" cy="57" r="7" /><circle className="sc-d" cx="50" cy="38" r="3.3" /></>,
  snake: <><path className="sc-s" d="M64 34L40 43L60 58L37 68" /><circle className="sc-d" cx="64" cy="34" r="6.5" /><circle className="sc-e" cx="40" cy="43" r="5" /><circle className="sc-e" cx="60" cy="58" r="5" /><circle className="sc-e" cx="37" cy="68" r="5" /></>,
  flash: <path className="sc-f" d="M55 26L37 54H50L45 76L64 46H51Z" />,
  street: <><rect className="sc-c" x="26" y="36" width="16" height="30" rx="2" /><rect className="sc-c" x="46" y="28" width="14" height="38" rx="2" /><circle className="sc-d" cx="70" cy="52" r="5" /><path className="sc-l" d="M20 68H80" /></>,
  span: <><rect className="sc-c" x="22" y="43" width="11" height="15" rx="2" /><rect className="sc-c" x="67" y="43" width="11" height="15" rx="2" /><circle className="sc-d" cx="50" cy="50" r="5" /></>,
  lotus: <><path className="sc-c" d="M50 28C59 38 59 55 50 65C41 55 41 38 50 28Z" /><path className="sc-c" d="M50 65C37 65 26 57 24 44C37 44 46 53 50 65Z" /><path className="sc-c" d="M50 65C63 65 74 57 76 44C63 44 54 53 50 65Z" /><path className="sc-l" d="M28 73H72" /></>,
}

// Diyafram: 6 kanat. a = altıgen açıklığın iç yarıçapı (0..46; 100 birimlik kutu)
const rotFor = (a) => (a <= A_NOW ? (15 * (a - A_CLOSED)) / (A_NOW - A_CLOSED) : 15 + (30 * (a - A_NOW)) / (A_DONE - A_NOW))
export function bladePaths(a) {
  const R = 46
  const C = 50
  const rot = (rotFor(a) * Math.PI) / 180
  const rv = a / Math.cos(Math.PI / 6)
  const V = []
  const E = []
  for (let k = 0; k < 6; k++) {
    const t = rot + ((30 + 60 * k) * Math.PI) / 180
    V.push([C + rv * Math.cos(t), C + rv * Math.sin(t)])
  }
  for (let k = 0; k < 6; k++) {
    const A = V[k]
    const B = V[(k + 1) % 6]
    let dx = B[0] - A[0]
    let dy = B[1] - A[1]
    const L = Math.hypot(dx, dy) || 1
    dx /= L
    dy /= L
    const bx = B[0] - C
    const by = B[1] - C
    const b = bx * dx + by * dy
    const cc = bx * bx + by * by - R * R
    const t = -b + Math.sqrt(Math.max(0, b * b - cc))
    E.push([B[0] + t * dx, B[1] + t * dy])
  }
  const f = (v) => v.toFixed(2)
  const blades = []
  const edges = []
  for (let k = 0; k < 6; k++) {
    const P = V[k]
    const Q = V[(k + 1) % 6]
    const Ek = E[k]
    const Em = E[(k + 5) % 6]
    blades.push({ cls: `b${k % 2}`, d: `M${f(P[0])} ${f(P[1])}L${f(Q[0])} ${f(Q[1])}L${f(Ek[0])} ${f(Ek[1])}A${R} ${R} 0 0 0 ${f(Em[0])} ${f(Em[1])}Z` })
    edges.push(`M${f(P[0])} ${f(P[1])}L${f(Ek[0])} ${f(Ek[1])}`)
  }
  return { blades, edges }
}

const reducedMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

// Kanatlar: hedef açıklığa yumuşak geçiş (az önce biten durak için from → to)
function Blades({ to, from = null }) {
  const [a, setA] = useState(from ?? to)
  const cur = useRef(from ?? to)
  useEffect(() => {
    const start = cur.current
    if (reducedMotion() || Math.abs(start - to) < 0.01) {
      cur.current = to
      setA(to)
      return undefined
    }
    const t0 = performance.now()
    const ms = to > start ? 600 : 420
    let id = 0
    const step = (t) => {
      const u = Math.min(1, Math.max(0, (t - t0) / ms))
      const v = start + (to - start) * (1 - Math.pow(1 - u, 3))
      cur.current = v
      setA(v)
      if (u < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [to])
  const { blades, edges } = bladePaths(a)
  return (
    <svg className="ap" viewBox="0 0 100 100" aria-hidden="true">
      {blades.map((b, i) => <path key={i} className={b.cls} d={b.d} />)}
      {edges.map((d, i) => <path key={`e${i}`} className="be" d={d} />)}
      <circle className="rim" cx="50" cy="50" r="47.5" />
    </svg>
  )
}

// Durak biçimi
const formOf = (s) => (s.restSlot ? 'rest' : s.finale ? 'fi' : s.kind === 'measure' ? 'me' : s.kind === 'exercise' ? 'ex' : 'pr')
const KIND_TR = { ex: 'egzersiz', me: 'ölçüm', pr: 'pratik', rest: 'mola', fi: 'günün görevi' }
const STATE_TR = { later: 'sonra', now: 'sırada', done: 'tamam', locked: 'kilitli', running: 'sürüyor' }
// Durak yarıçapı (etiket ve baloncuk yerleşimi için): [yatay, dikey]
function radius(form, st) {
  if (form === 'me') return { later: [32, 24], locked: [32, 24], now: [40, 30], done: [35, 26] }[st] ?? [32, 24]
  if (form === 'rest') return [32, 32]
  const r = { now: 38, done: 30 }[st] ?? 28
  return [r, r]
}

function StopInner({ stop, form, state, icon: Icon, fromA }) {
  const badges = (
    <>
      <span className="pulse" />
      <span className="badge ok"><Svg>{CHECK}</Svg></span>
      <span className="badge lk"><Svg>{LOCK}</Svg></span>
    </>
  )
  const glyph = GLYPH[stop.glyph] ? <Svg>{GLYPH[stop.glyph]}</Svg> : Icon ? <Icon size={22} aria-hidden="true" /> : null
  if (form === 'me') {
    return (
      <>
        <svg className="lens" viewBox="0 0 80 60" aria-hidden="true">
          <path className="lgl" d="M4 30A37.9 37.9 0 0 1 76 30A37.9 37.9 0 0 1 4 30Z" />
          <path className="lh" d="M16 20Q27 9 44 9" />
          {stop.glyph === 'lines' ? <path className="ll" d="M27 22.5h26M27 30h26M27 37.5h17" /> : <EGlyph x={31} y={21} size={18} dir="right" fill="#041017" />}
        </svg>
        {badges}
      </>
    )
  }
  if (form === 'rest') {
    return (
      <>
        <span className="moonring" />
        <span className="moon-c">{state === 'running' ? <b className="moon-t">{stop.runLeft}</b> : <Svg className="mg">{GLYPH.moon}</Svg>}</span>
        {badges}
      </>
    )
  }
  if (form === 'fi') {
    return (
      <>
        <span className="housing fi" />
        <span className="gl fi">{glyph}</span>
        {badges}
      </>
    )
  }
  const a = state === 'done' ? A_DONE : state === 'now' ? A_NOW : A_CLOSED
  return (
    <>
      <span className="housing" />
      {form === 'ex' || !SCENE[stop.glyph] ? <span className="iris"><i /></span> : <span className="scene"><svg viewBox="0 0 100 100" aria-hidden="true">{SCENE[stop.glyph]}</svg></span>}
      <Blades to={a} from={fromA} />
      <span className="gl">{glyph}</span>
      {badges}
    </>
  )
}

// Durağın alt satırı: { text, warn }. Yarım kalan ölçüm (warn) uyarı renginde ve "!" ile (E0 "Kalan: Sol göz, İki
// göz"). Süresi ölçülmemiş durakta (hideMinutes) süre yazılmaz. Bitince doneSub ("✓ Bu hafta tamam") ya da "tamam".
// Alt satırı olan, açık uçlu olmayan durak "alt satır · dk" yazar (yol.md §5.4): Haftalık E testi ve Yoga
// ("Nefesin Ritmi · 3 dk").
export function stopSub(s, st, { leftMs = 0 } = {}) {
  if (st === 'done') return { text: s.doneSub ?? 'tamam', warn: false }
  if (st === 'locked') return { text: `mola ${fmtLeft(s.lockLeftMs ?? 0)}`, warn: false }
  if (s.restSlot) return { text: st === 'running' ? `Mola · ${fmtLeft(leftMs)}` : s.sub ?? '', warn: false }
  const min = s.minutes && !s.hideMinutes ? `${s.minutes} dk` : ''
  const warn = Boolean(s.warn)
  if (s.openEnded && s.sub) return { text: s.sub, warn }
  if (s.sub) return { text: min ? `${s.sub} · ${min}` : s.sub, warn }
  return { text: min, warn }
}
// Erişilebilirlik etiketinde alt satır: ölçüm, mola, final ve açık uçlu olmayan, alt satırı olan durak (bugün yalnız
// Yoga): "Yoga, pratik, Nefesin Ritmi, 3 dakika, sırada". Ölçümün etiketi değişmez (yarım kalınca kalan gözler).
const ariaSub = (s) => (s.sub && !s.openEnded && !s.restSlot && !s.finale && s.kind !== 'measure' ? `, ${s.sub}` : '')

// Yerleşim: bölüm 1 sağa bükülen yay, mola bandı, bölüm 2 sola bükülen yay
function layout(stops) {
  const restIdx = stops.findIndex((s) => s.restSlot)
  const s1 = restIdx >= 0 ? stops.slice(0, restIdx) : stops
  const s2 = restIdx >= 0 ? stops.slice(restIdx + 1) : []
  const bend = (n, i) => (n === 1 ? 1 : Math.pow(Math.sin((Math.PI * i) / (n - 1)), 0.6))
  const pos = []
  let y = 74
  s1.forEach((_, i) => {
    pos.push([74 + 154 * bend(s1.length, i), y])
    y += STEP
  })
  let band = null
  let label2 = null
  let cres = []
  const lastY1 = s1.length ? y - STEP : 20
  if (s1.length > 1) cres.push(crescent(74, lastY1, false))
  if (restIdx >= 0) {
    const top = lastY1 + 62
    band = { top, height: 136, moon: [124, top + 60] }
    pos.push(band.moon)
    label2 = top + 148
    y = label2 + 64
    s2.forEach((_, i) => {
      pos.push([226 - 146 * bend(s2.length, i), y])
      y += STEP
    })
    if (s2.length > 1) cres.push(crescent(label2 + 64, y - STEP, true))
  }
  const lastY = pos.length ? pos.at(-1)[1] : 0
  const segs = pos.slice(0, -1).map(([x0, y0], i) => {
    const [x1, y1] = pos[i + 1]
    const dy = y1 - y0
    return `M${x0} ${y0}C${x0} ${y0 + dy * 0.5} ${x1} ${y1 - dy * 0.5} ${x1} ${y1}`
  })
  return { pos, band, label2, cres, segs, foot: lastY + 76, height: lastY + 130 }
}
// Bölümün arkasındaki soluk kanat (hilal); y0..y1 ilk ve son durak
function crescent(y0, y1, mirror) {
  const yA = y0 - 30
  const yB = y1 + 30
  const mid = (yA + yB) / 2
  const k = (yB - yA) / 524
  const X = (x) => (mirror ? W - x : x)
  return `M${X(42)} ${yA}C${X(190)} ${yA - 14 * k} ${X(276)} ${mid - 136 * k} ${X(276)} ${mid}C${X(276)} ${mid + 136 * k} ${X(190)} ${yB + 14 * k} ${X(42)} ${yB}C${X(150)} ${yB - 28 * k} ${X(176)} ${mid + 114 * k} ${X(176)} ${mid}C${X(176)} ${mid - 114 * k} ${X(150)} ${yA + 28 * k} ${X(42)} ${yA}Z`
}
const STARS = [[26, 16, 0.8], [64, 6, 0.5], [104, 24, 0.7], [168, 10, 0.6], [206, 22, 0.8], [244, 6, 0.5], [282, 20, 0.7], [146, 2, 0.4]]
// İlk yıldız "Mola · N dk" etiketinin altında (S0 kararı Ç17: etiketin üstüne düşüyordu); ilerlemeyle kurulan yolda
const STARS_Y1 = [[26, 44, 0.8], ...STARS.slice(1)]
const NB = '\u00a0'
// Baloncukta tireden bölünmesin (320 pt'de "Sağ–" / "sol"): tirenin ardına görünmez sözcük birleştirici
const WJ = '\u2060'
const px = (x) => `calc(50% + ${x - W / 2}px)`

// Uygulama açıkken son görülen tamamlanmış duraklar (Ana sayfaya dönüşte "az önce bitti" anı için)
let seenDone = null

export default function TodayPath({ plan, eye = null, day = 0, icons = {}, onStart, week = '', newKeys = [], restMin = null, staged = false }) {
  const { stops } = plan
  const isNew = (s) => Array.isArray(newKeys) && newKeys.includes(s.key)
  const doneKeys = stops.filter((s) => s.done).map((s) => `${day}:${s.key}`)
  const [fresh] = useState(() => (seenDone ? doneKeys.filter((k) => !seenDone.has(k)).map((k) => k.slice(String(day).length + 1)) : []))
  const [gold, setGold] = useState(fresh.length > 0)
  useEffect(() => {
    seenDone = new Set(doneKeys)
  })
  useEffect(() => {
    if (!fresh.length) return undefined
    haptic('success')
    const id = setTimeout(() => setGold(false), 2000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sıralı yol: ilerideki durağa dokununca "önce sıradaki" uyarısı (2,4 sn), durak açılmaz
  const [nudge, setNudge] = useState(null)
  useEffect(() => {
    if (!nudge) return undefined
    const id = setTimeout(() => setNudge(null), 2400)
    return () => clearTimeout(id)
  }, [nudge])
  const tap = (s, st) => {
    if (st === 'running' || canOpen(plan, s)) return onStart(s.route)
    haptic('warning')
    setNudge({ key: s.key, t: Date.now() })
  }

  const L = layout(stops)
  // Yoldaki Nefes molası sürüyor mu (Nefes durağından başlatılan 5 dk)
  const pathRest = Boolean(eye?.locked && eye.reason === 'path')
  const nextIdx = plan.next ? stops.indexOf(plan.next) : -1
  const jIdx = plan.allDone || nextIdx < 0 ? stops.length - 1 : nextIdx
  const states = stops.map((s, i) => {
    if (s.done) return 'done'
    if (s.restSlot && pathRest) return 'running'
    if (s.locked) return 'locked'
    return i === nextIdx ? 'now' : 'later'
  })
  const restI = stops.findIndex((s) => s.restSlot)
  const restP = restI < 0 ? 0 : states[restI] === 'done' ? 1 : states[restI] === 'running' ? 1 - eye.leftMs / LIMITS.restMs : 0
  let jev = jevLine(plan, { day, fmt: fmtLeft, eye, restLeftMs: pathRest && restI >= 0 && !stops[restI].done ? eye.leftMs : null, gold })
  // Sıradaki mola ise (lib/today.js jevLine "Sırada Nefes · N dk mola" satırı) baloncuk molanın süresini yazar (S0 kararı
  // 8): mola nefes kadarsa (1. gün 1, 2. gün 2 dk) "Sırada Nefes · 1 dk mola"; mola nefesten uzunsa (3. günden 5 dk)
  // "Sırada mola: 3 dk nefes, 2 dk dinlenme". Öteki satırlar ("İlk durak: Nefes · 3 dk" …) durağın kendi süresini yazar.
  if (restMin != null && plan.next?.restSlot && plan.doneCount > 0) {
    const nx = plan.next
    const restLine = (m) => `Sırada ${nx.title}${NB}·${NB}${m}${NB}dk mola`
    if (jev.line === restLine(nx.minutes ?? 5)) {
      const b = Number.isFinite(nx.minutes) ? nx.minutes : restMin
      jev = { ...jev, line: restMin > b ? `Sırada mola: ${b}${NB}dk nefes, ${restMin - b}${NB}dk dinlenme` : restLine(restMin) }
    }
  }

  // Açılışta sıradaki durak ekranda değilse ona kaydır (ekranın ortasına). İlerlemeyle kurulan yolda yalnız az önce bir
  // durak bittiyse (Ana sayfaya dönüş, altın halka anı); öteki açılışlarda ilk görünüm Ana sayfanın üstüdür.
  const nowRef = useRef(null)
  useEffect(() => {
    const el = nowRef.current
    if (!el || typeof window === 'undefined') return
    if (staged && !fresh.length) return
    const r = el.getBoundingClientRect()
    const bottomSafe = window.innerHeight - 110 // sekme çubuğu
    if (r.top >= 80 && r.bottom <= bottomSafe) return
    window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 2 + r.height / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subOf = (s, st) => stopSub(s, st, { leftMs: eye?.leftMs ?? 0 })
  // Ölçüm ve mola etiketindeki "Yeni": ilerlemeyle kurulan yolda ayrı dolu hap, yoksa bugünkü gibi " · Yeni"
  const newTag = staged ? <span className="new nw">Yeni</span> : <span className="new"> · Yeni</span>
  // Sıradaki durağa dokunuş (baloncuk ve "Başla"; yalnız ilerlemeyle kurulan yolda, erişilebilir düğme durağın kendisi)
  const goNext = staged && plan.next && nextIdx >= 0 ? () => tap(stops[nextIdx], states[nextIdx]) : undefined
  const sections = [1, 2].map((b, i) => ({ b, y: i === 0 ? 0 : L.label2, ...plan.blocks[i] })).filter((x) => x.y != null && stops.some((s) => s.block === x.b && !s.finale))
  const chipAt = plan.forcedRestBefore ? stops.findIndex((s) => s.key === plan.forcedRestBefore) : -1

  return (
    <section className={staged ? 'tp tp-y1' : 'tp'} aria-label="Bugünün yolu">
      <Ribbon stops={stops} states={states} />
      <div className="tp-pv" style={{ height: L.height }}>
        {L.band && (
          <div className="tp-band" style={{ top: L.band.top, height: L.band.height }} aria-hidden="true">
            <span className="tp-btag">Mola · {restMin ?? stops[restI].minutes ?? 5} dk</span>
            {(staged ? STARS_Y1 : STARS).map(([x, y, o], i) => <span key={i} className="tp-star" style={{ left: px(x), top: y, opacity: o }} />)}
            {[1.4, 2.6, 3.8].map((k, i) => (
              <span key={i} className={`tp-rp r${i + 1}${(states[restI] === 'now' || states[restI] === 'running') && !reducedMotion() ? ' live' : ''}`} style={{ left: px(124), top: 106, '--k': k, '--o': [0.5, 0.3, 0.14][i] }} />
            ))}
          </div>
        )}
        <svg className="tp-track" viewBox={`0 0 ${W} ${L.height}`} style={{ left: px(0), width: W, height: L.height }} aria-hidden="true">
          <defs>
            <linearGradient id="tp-iris" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
              <stop offset="0" stopColor="#19C2D1" />
              <stop offset="1" stopColor="#3E7BFA" />
            </linearGradient>
            <radialGradient id="tp-lens" cx=".36" cy=".3" r=".8">
              <stop offset="0" stopColor="#5EDCE6" />
              <stop offset=".45" stopColor="#19C2D1" />
              <stop offset="1" stopColor="#1F5FD6" />
            </radialGradient>
          </defs>
          {L.cres.map((d, i) => <path key={i} className="tp-cres" d={d} />)}
          {L.segs.map((d, i) => (
            <g key={i}>
              <path className="tp-ln todo" d={d} />
              <path className="tp-ln fill" pathLength="1" d={d} style={{ strokeDashoffset: stops[i].done ? 0 : 1 }} />
            </g>
          ))}
        </svg>
        {sections.map((x) => (
          <div key={x.b} className="tp-sl" style={{ top: x.y }} aria-hidden="true">
            <span className="l1">
              {x.b}. bölüm
              <span className="m">
                {Array.from({ length: Math.max(x.capMin, x.eyeMin) }, (_, j) => <i key={j} className={j < x.eyeDone ? 'd' : j < x.eyeMin ? 'p' : ''} />)}
              </span>
            </span>
            <span className="g2">≈ {x.eyeMin} dk göz</span>
          </div>
        ))}
        {stops.map((s, i) => {
          const [x, y] = L.pos[i]
          const form = formOf(s)
          const st = states[i]
          const isFresh = fresh.includes(s.key)
          const r = radius(form, st)
          const side = s.restSlot ? 'rest' : x > W / 2 ? 'left' : 'right'
          const labelX = side === 'left' ? x - r[0] - 8 : side === 'rest' ? x + r[0] + 12 : x + r[0] + 8
          const subLine = subOf(s, st)
          const sub = subLine.text
          const showLabel = i !== jIdx
          return (
            <div key={s.key}>
              <button
                ref={i === jIdx ? nowRef : undefined}
                type="button"
                className={`tp-st ${form} ${st}`}
                style={{ left: px(x), top: y, ...(s.restSlot ? { '--p': restP } : {}) }}
                onClick={() => tap(s, st)}
                aria-disabled={st === 'later' ? 'true' : undefined}
                aria-label={`${s.title}${isNew(s) ? ', yeni' : ''}, ${KIND_TR[form]}${ariaSub(s)}${s.minutes && !s.hideMinutes ? `, ${s.minutes} dakika` : ''}${subLine.warn ? `, ${sub}` : ''}, ${STATE_TR[st]}${st === 'locked' ? ` (${sub})` : ''}${st === 'later' && plan.next ? `. Önce ${plan.next.title}` : ''}`}
              >
                <StopInner stop={{ ...s, runLeft: st === 'running' ? fmtLeft(eye.leftMs) : '' }} form={form} state={st} icon={icons[s.id]} fromA={isFresh ? A_NOW : null} />
              </button>
              {isFresh && !reducedMotion() && <span className="tp-gring" style={{ left: px(x), top: y }} aria-hidden="true"><i /><i /><i /><i /></span>}
              {showLabel && (
                <span className={`tp-lb ${side}`} style={{ left: px(labelX), top: y }} aria-hidden="true">
                  {form === 'me' && <span className="tag">Ölçüm{isNew(s) && newTag}</span>}
                  {form === 'rest' && <span className="tag">Mola{isNew(s) && newTag}</span>}
                  {form !== 'me' && form !== 'rest' && isNew(s) && <span className="tag new">Yeni</span>}
                  <span className="t">{form === 'rest' ? `${s.title} · ${s.minutes ?? 5} dk` : s.title}</span>
                  <small className={st === 'locked' ? 'lk' : subLine.warn ? 'warn' : ''}>
                    {subLine.warn && <b className="wi">!</b>}
                    {sub}
                  </small>
                </span>
              )}
              {st === 'now' && (
                <span key={nudge?.t ?? 0} className={`tp-go${nudge ? ' nudge' : ''}`} style={{ left: px(x), top: y + r[1] + 8 }} aria-hidden="true" onClick={goNext}>Başla</span>
              )}
              {nudge?.key === s.key && plan.next && (
                <span className="tp-nudge" style={{ left: px(x), top: y + r[1] + 8 }} role="status">
                  <Svg>{LOCK}</Svg>Önce: {plan.next.title}
                </span>
              )}
            </div>
          )
        })}
        {chipAt >= 0 && (() => {
          // Önceki durağın yanında, "Başla" düğmesinin dışında (sol durakta sağa, sağ durakta sola açılır)
          const b = L.pos[chipAt]
          const a = L.pos[Math.max(0, chipAt - 1)]
          const right = a[0] > W / 2
          const y = chipAt === 0 ? b[1] - 58 : (a[1] + b[1]) / 2 + 6
          return (
            <span className={`tp-chip${right ? ' to-left' : ''}`} style={{ left: px(right ? a[0] - 40 : a[0] + 34), top: y }}>
              <Svg>{LOCK}</Svg>Burada 5 dk mola var
            </span>
          )
        })()}
        {jIdx >= 0 && (() => {
          const s = stops[jIdx]
          const [x, y] = L.pos[jIdx]
          const r = radius(formOf(s), states[jIdx])
          const side = x > W / 2 ? 'left' : 'right'
          let left
          let width
          let edge = 0
          if (side === 'right') {
            left = x + r[0] + 10
            width = Math.min(172, W - left)
          } else {
            edge = x - r[0] - 10
            width = Math.min(172, edge)
            left = edge - width
          }
          // 300 px'lik koordinattan dar kapta (320 pt ekran) baloncuk kabın içinde kalır (S0 taslağı b); ≥ 300 px'te aynı
          const fit = !staged ? { left: px(left) } : side === 'right' ? { left: px(left), maxWidth: `calc(50% + ${W / 2 - left}px)` } : { left: `max(0px, ${px(left)})`, maxWidth: `calc(50% + ${edge - W / 2}px)` }
          return (
            <div className="tp-jb" data-side={side} style={{ ...fit, width, top: y }} aria-live="polite" onClick={s === plan.next ? goNext : undefined}>
              <span className="tp-jev"><IrisMark size={32} /></span>
              <div className="tp-jb-b">
                <b className={`w${gold ? ' gold' : ''}`}>{jev.word}{staged && s === plan.next && isNew(s) && <span className="new nw" aria-hidden="true">Yeni</span>}</b>
                {/* Sıradaki durak yarım kalan ölçümse ("Kalan: …") satır uyarı renginde ve "!" ile (E0) */}
                <span className={`l2${s.warn && !s.done ? ' warn' : ''}`}>
                  {s.warn && !s.done && <b className="wi" aria-hidden="true">!</b>}
                  {staged ? jev.line.replace(/–/g, `–${WJ}`) : jev.line}
                </span>
              </div>
            </div>
          )
        })()}
        <p className="tp-fn" style={{ top: L.foot }}>Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi.</p>
        {week && <span className="tp-week small" style={{ top: L.foot + 34 }}>{week}</span>}
      </div>
    </section>
  )
}

// Günün şeridi: bütün duraklar tek satırda (ölçüm mercek, mola halka)
function Ribbon({ stops, states }) {
  const n = stops.length
  const X = (i) => (n === 1 ? 150 : 12 + (i * 276) / (n - 1))
  const cls = (st) => (st === 'done' ? 'd' : st === 'now' || st === 'running' ? 'n' : st === 'locked' ? 'k' : 'l')
  return (
    <svg className="tp-ribbon" viewBox="0 0 300 16" aria-hidden="true">
      <path className="rb-l" d="M12 8H288" />
      {stops.slice(0, -1).map((s, i) => (states[i] === 'done' ? <path key={`d${i}`} className="rb-d" d={`M${X(i)} 8H${X(i + 1)}`} /> : null))}
      {stops.map((s, i) => {
        const x = X(i)
        const c = cls(states[i])
        if (formOf(s) === 'me') return <path key={s.key} className={`rb ${c}`} d={`M${x - 6} 8A6.6 6.6 0 0 1 ${x + 6} 8A6.6 6.6 0 0 1 ${x - 6} 8Z`} />
        if (s.restSlot) return <circle key={s.key} className={`rb rb-r ${c}`} cx={x} cy="8" r="6" />
        return <circle key={s.key} className={`rb ${c}`} cx={x} cy="8" r={formOf(s) === 'pr' ? 4 : 4.5} />
      })}
    </svg>
  )
}
