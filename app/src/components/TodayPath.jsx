import { useEffect, useRef, useState } from 'react'
import { IrisMark } from './ui.jsx'
import { jevLine } from '../lib/today.js'
import { fmtLeft, LIMITS } from '../lib/eyeBudget.js'
import { haptic } from '../lib/native.js'
import '../styles/todaypath.css'

// Bugünün yolu (Build 26). Tasarım: Artifact "Bugünün Yolu" (yol planı §13). Duolingo'dan yalnızca niyet
// alındı (sıralı duraklar, görünür ilerleme); biçim markanın kendi dünyası:
//   egzersiz = diyafram (kanatlar kapalı → yarı açık → açık iris), ölçüm = mercek, pratik = kanatların
//   ardında sahne, mola = su ve ay (Nefes), final = altın kenar (fark etme). Jev tek kelimeyle yol gösterir.
// Her bölüm bir kanat yayı: 1. bölüm sağa ")", 2. bölüm sola "(" bükülür; arada su bandı.
// plan: lib/today.js buildPath sonucu; eye: App eyeStatus(); day: lib/notice.js dayNumber(now).

const W = 300 // yol koordinatı (px); ortalanır
const STEP = 116
const A_CLOSED = 1.5
const A_NOW = 20
const A_DONE = 38

const GLYPH = {
  arrows: <><path d="M3 12h18" /><path d="M7 8l-4 4 4 4" /><path d="M17 8l4 4-4 4" /></>,
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
}

// Diyafram: 6 kanat. a = altıgen açıklığın iç yarıçapı (0..46; 100 birimlik kutu)
const rotFor = (a) => (a <= A_NOW ? (15 * (a - A_CLOSED)) / (A_NOW - A_CLOSED) : 15 + (30 * (a - A_NOW)) / (A_DONE - A_NOW))
function bladePaths(a) {
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
          {stop.glyph === 'lines' ? <path className="ll" d="M27 22.5h26M27 30h26M27 37.5h17" /> : <text className="le" x="40" y="38.5" textAnchor="middle">E</text>}
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
const px = (x) => `calc(50% + ${x - W / 2}px)`

// Uygulama açıkken son görülen tamamlanmış duraklar (Ana sayfaya dönüşte "az önce bitti" anı için)
let seenDone = null

export default function TodayPath({ plan, eye = null, day = 0, icons = {}, onStart, week = '' }) {
  const { stops } = plan
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
  const jev = jevLine(plan, { day, fmt: fmtLeft, eye, restLeftMs: pathRest && restI >= 0 && !stops[restI].done ? eye.leftMs : null, gold })

  // Açılışta sıradaki durak ekranda değilse ona kaydır (ekranın ortasına)
  const nowRef = useRef(null)
  useEffect(() => {
    const el = nowRef.current
    if (!el || typeof window === 'undefined') return
    const r = el.getBoundingClientRect()
    const bottomSafe = window.innerHeight - 110 // sekme çubuğu
    if (r.top >= 80 && r.bottom <= bottomSafe) return
    window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 2 + r.height / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subOf = (s, st) => {
    if (st === 'done') return 'tamam'
    if (st === 'locked') return `mola ${fmtLeft(s.lockLeftMs ?? 0)}`
    if (s.restSlot) return st === 'running' ? `Mola · ${fmtLeft(eye.leftMs)}` : s.sub ?? ''
    const min = s.minutes ? `${s.minutes} dk` : ''
    if (s.openEnded && s.sub) return s.sub
    if (s.kind === 'measure' && s.sub) return `${s.sub} · ${min}`
    return min
  }
  const sections = [1, 2].map((b, i) => ({ b, y: i === 0 ? 0 : L.label2, ...plan.blocks[i] })).filter((x) => x.y != null && stops.some((s) => s.block === x.b && !s.finale))
  const chipAt = plan.forcedRestBefore ? stops.findIndex((s) => s.key === plan.forcedRestBefore) : -1

  return (
    <section className="tp" aria-label="Bugünün yolu">
      <Ribbon stops={stops} states={states} />
      <div className="tp-pv" style={{ height: L.height }}>
        {L.band && (
          <div className="tp-band" style={{ top: L.band.top, height: L.band.height }} aria-hidden="true">
            <span className="tp-btag">Mola · {stops[restI].minutes ?? 5} dk</span>
            {STARS.map(([x, y, o], i) => <span key={i} className="tp-star" style={{ left: px(x), top: y, opacity: o }} />)}
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
          const sub = subOf(s, st)
          const showLabel = i !== jIdx
          return (
            <div key={s.key}>
              <button
                ref={i === jIdx ? nowRef : undefined}
                type="button"
                className={`tp-st ${form} ${st}`}
                style={{ left: px(x), top: y, ...(s.restSlot ? { '--p': restP } : {}) }}
                onClick={() => onStart(s.route)}
                aria-label={`${s.title}, ${KIND_TR[form]}${s.minutes ? `, ${s.minutes} dakika` : ''}, ${STATE_TR[st]}${st === 'locked' ? ` (${sub})` : ''}`}
              >
                <StopInner stop={{ ...s, runLeft: st === 'running' ? fmtLeft(eye.leftMs) : '' }} form={form} state={st} icon={icons[s.id]} fromA={isFresh ? A_NOW : null} />
              </button>
              {isFresh && !reducedMotion() && <span className="tp-gring" style={{ left: px(x), top: y }} aria-hidden="true"><i /><i /><i /><i /></span>}
              {showLabel && (
                <span className={`tp-lb ${side}`} style={{ left: px(labelX), top: y }} aria-hidden="true">
                  {form === 'me' && <span className="tag">Ölçüm</span>}
                  {form === 'rest' && <span className="tag">Mola</span>}
                  <span className="t">{form === 'rest' ? `${s.title} · ${s.minutes ?? 5} dk` : s.title}</span>
                  <small className={st === 'locked' ? 'lk' : ''}>{sub}</small>
                </span>
              )}
              {st === 'now' && (
                <span className="tp-go" style={{ left: px(x), top: y + r[1] + 8 }} aria-hidden="true">Başla</span>
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
          if (side === 'right') {
            left = x + r[0] + 10
            width = Math.min(172, W - left)
          } else {
            const edge = x - r[0] - 10
            width = Math.min(172, edge)
            left = edge - width
          }
          return (
            <div className="tp-jb" data-side={side} style={{ left: px(left), width, top: y }} aria-live="polite">
              <span className="tp-jev"><IrisMark size={32} /></span>
              <div className="tp-jb-b">
                <b className={`w${gold ? ' gold' : ''}`}>{jev.word}</b>
                <span className="l2">{jev.line}</span>
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
