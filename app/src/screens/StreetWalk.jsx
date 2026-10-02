import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { X, Check, ChevronDown, Eye, EyeOff, FlaskConical, BookOpen } from 'lucide-react'
import { IrisMark } from '../components/ui.jsx'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { countOptions, makeRecord, COLORS, SAW, SESSION_TYPE, FACTS, coverView, coverModel, countModel, countView, countPanel } from '../lib/street.js'
import { planRound, makeFrame, nextN, hitTest } from '../lib/streetChange.js'
import { sceneSVG, taskIconSVG, missedCard, subjectThumb } from '../lib/streetSvg.js'
import { H, SCENES, SIGN, itemBox, signBox } from '../lib/streetScenes.js'
import { say, lines, optionText, taskLines, missedLines, changeSentence, countRow, factLines, sceneName, glue, splitFirst, resultHead } from '../lib/streetText.js'
import { upperFirst } from '../lib/nef/bank/tr.grammar.js'
import { haptic } from '../lib/native.js'
import '../styles/street.css'

// Fark Ettin mi? (fark-ettin-mi/PLAN.md §1, §5, §5b; maket/son.html A yönü): Görev → Caddeden geç → sayı sorusu →
// Ne değişti? (3–4 kare) → Gözünden kaçan (2 soru) → Sonuç. Mantık lib/street.js ve lib/streetChange.js, çizim
// lib/streetScenes.js, metin yalnız lib/streetText.js (onaylı metin; JSX'te düz cümle yok).
// Hareket: tek ve yumuşak geçişler (≥ 300 ms), yanıp sönme yok, ses yok; prefers-reduced-motion'da geçişler anlık,
// sahnedeki kişi ve arabalar durur (sahne yine kayar).
const LOOK_MS = 3000 // ilk kare 3 sn (PLAN §1.2)
const BLINK_MS = 400 // göz kırpması: 200 ms kararır, 200 ms açılır
const NB = ' '

function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia?.(query).matches
  const [on, setOn] = useState(get)
  useEffect(() => {
    const m = window.matchMedia?.(query)
    if (!m) return undefined
    const f = () => setOn(m.matches)
    m.addEventListener?.('change', f)
    return () => m.removeEventListener?.('change', f)
  }, [query])
  return Boolean(on)
}
// Koyu tema: <html data-theme> ya da sistem (lib/theme.js); koyu temada gündüz sahneleri akşam paletiyle (kapı tur 1)
function useDark() {
  const sys = useMedia('(prefers-color-scheme: dark)')
  const attr = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null
  return attr ? attr === 'dark' : sys
}
// Öğenin ölçüsü (görev sahnesinin kırpımı kutunun oranına göre seçilir)
function useBox(ref, dep) {
  const [box, setBox] = useState(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const f = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    f()
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(f)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, dep])
  return box
}
const modeFor = (scene, dark) => {
  const m = SCENES[scene]?.mode ?? 'day'
  return dark && m === 'day' ? 'dusk' : m
}

// Üst çubuk: çarpı + (varsa) üst etiket ilerleme çizgisinin hemen üstünde (tasarım: "Ortak karar"); dim: ezberleme
// anında adım çizgisi sönük ve ince (süre çizgisiyle karışmaz)
function Top({ value, onExit, ey, dim }) {
  const bar = <ProgressBar value={value} label={say('ui.progress')} />
  return (
    <div className={`sw-top${dim ? ' dim' : ''}`}>
      <button className="btn-icon" onClick={onExit} aria-label={say('ui.exit')}><X size={20} aria-hidden="true" /></button>
      {ey ? <div className="sw-tb"><span className="sw-ey">{ey}</span>{bar}</div> : bar}
    </div>
  )
}
// M1 üst başlığı: geniş ekranda tek satır; 320'de iki satır (son " · " ayırıcısında; harfler aynı)
function M1Line({ text }) {
  const i = text?.lastIndexOf(' · ') ?? -1
  if (i < 0) return <span className="sw-ey">{text}</span>
  return <span className="sw-ey sw-m1">{text.slice(0, i)}<span className="sep"> · </span><span className="l2">{text.slice(i + 3)}</span></span>
}
// Kutuyu birkaç birim genişletir (vurgu halkası, önceki hâlin kırpımı)
const grow = (b, m) => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m })
const Swatch = ({ c, dot }) => <span className={dot ? 'sw-dot' : 'sw-swatch'} style={{ background: COLORS[c]?.hex }} aria-hidden="true" />
// "Önceki hâl" kırpımının köşesi: değişen yeri, tabelayı, tenteyi ve öğeleri en az örten köşe
const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
function insetCorner(frame, view, r0) {
  const s = view.vw * 0.32
  const m = view.vw * 0.03
  const ring = { x: r0.cx - r0.r, y: r0.cy - r0.r, w: 2 * r0.r, h: 2 * r0.r }
  const blocks = [...(frame.after.items ?? []).map(itemBox), ...(frame.after.buildings ?? []).flatMap((b) => [signBox(b), { x: b.x, y: SIGN.top + SIGN.h + 4, w: b.w, h: 34 }])]
  const opts = [['tl', view.vx + m, view.vy + m], ['tr', view.vx + view.vw - m - s, view.vy + m], ['bl', view.vx + m, view.vy + view.vh - m - s], ['br', view.vx + view.vw - m - s, view.vy + view.vh - m - s]]
  let best = null
  for (const [id, x, y] of opts) {
    const r = { x, y, w: s, h: s }
    const score = area(r, ring) * 50 + blocks.reduce((a, b) => a + area(r, b), 0)
    if (!best || score < best.score) best = { id, score }
  }
  return best.id
}
const Mark = ({ ok }) => (ok ? <Check className="sw-mk" size={18} strokeWidth={3} aria-hidden="true" /> : <X className="sw-mk" size={18} strokeWidth={3} aria-hidden="true" />)
// Kalan süre halkası (yazısız): halka süre bittikçe azalır; değeri rAF doğrudan yazar
const RING_C = 2 * Math.PI * 16
const TimeRing = ({ ringRef }) => (
  <span className="sw-ring" aria-hidden="true">
    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" className="bg" /><circle ref={ringRef} cx="20" cy="20" r="16" className="fg" strokeDasharray={RING_C} strokeDashoffset="0" transform="rotate(-90 20 20)" /><circle cx="20" cy="20" r="7.5" className="clk" /><path d="M20 15.5V20l3 2" className="clk" /></svg>
  </span>
)

// onSave(kayıt): tur sonunda; onExit(): çıkış
export default function StreetWalk({ sessions = [], onSave, onExit }) {
  const dark = useDark()
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [seed] = useState(() => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)
  const [plan] = useState(() => planRound({ sessions, now: new Date(), seed }))
  const [firstRound] = useState(() => !sessions.some((s) => s?.type === SESSION_TYPE))
  const { street, scene, taskId } = plan
  const mode = modeFor(scene, dark)
  const sName = sceneName(scene)
  const task = taskLines(taskId)
  const n0 = street.counts[taskId]
  const [phase, setPhase] = useState('intro') // intro | walk | count | change | missed | result
  const [countAnswer, setCountAnswer] = useState(null)
  const opts = useMemo(() => countOptions(n0), [n0])
  // Ne değişti?
  const [fi, setFi] = useState(0)
  const [nNow, setNNow] = useState(plan.startN)
  const [look, setLook] = useState(1)
  const [stage, setStage] = useState('first') // first | blink | second | found | shown
  const [after, setAfter] = useState(false)
  const [dim, setDim] = useState(false)
  const [changes, setChanges] = useState([])
  const frame = useMemo(() => (phase === 'change' ? makeFrame(street, plan.frames[fi], nNow) : null), [phase, street, plan, fi, nNow])
  const frameRef = useRef(null)
  // Gözünden kaçan
  const [qi, setQi] = useState(0)
  const [saw, setSaw] = useState(null)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const [picks, setPicks] = useState([]) // seçilen seçenekler (sonuçta yanlışın üstü çizili gösterilir; kayda girmez)
  const [record, setRecord] = useState(null)
  const walkRef = useRef(null)
  const ringRef = useRef(null)
  const introRef = useRef(null)
  const [factOpen, setFactOpen] = useState(false) // kart bir kez açıldı mı (kayıt)
  const [sheet, setSheet] = useState(false) // kart şu an açık mı
  // Kayıt bir kez yazılır. Bilim kartı varsa sonuçtan çıkarken (Bitti, çarpı, sayfa gizlenmesi ya da ekranın
  // kapanması): factOpen yalnız kart açıldıysa true (PLAN §9c madde 6: açılan kart 30 gün dinlenir)
  const recRef = useRef(null)
  const openRef = useRef(false)
  const savedRef = useRef(false)
  openRef.current = factOpen
  const commit = () => {
    if (savedRef.current || !recRef.current) return
    savedRef.current = true
    onSave?.({ ...recRef.current, factOpen: openRef.current })
  }
  const commitRef = useRef(commit)
  commitRef.current = commit
  useEffect(() => {
    const hide = () => document.visibilityState === 'hidden' && commitRef.current()
    const gone = () => commitRef.current()
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', gone)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', gone)
      commitRef.current()
    }
  }, [])
  const introBox = useBox(introRef)
  const t0 = useRef(0)
  const walkEnd = useRef(0)

  // ---- ekran başına türetilen çizimler (hook'lar koşulsuz) ----
  const narrow = useMedia('(max-width: 340px)')
  const icon = taskIconSVG(taskId, 'day')
  // 04: donmuş kare panelin oranından (sokak seviyesi, hedefsiz, yarım tabela ve kenarda bölünen kişi yok)
  const panelRef = useRef(null)
  const panelBox = useBox(panelRef, phase)
  const panelSvg = useMemo(() => {
    if (phase !== 'count' || !panelBox?.w || !panelBox?.h) return null
    const cv = countView(street, panelBox.w / panelBox.h, countModel(street, taskId))
    return sceneSVG(countPanel(street, taskId, cv), { ...cv, motion: false, mode, label: sName, wholeSigns: true, edgeDecor: false })
  }, [phase, panelBox, street, taskId, mode, sName])
  // 09–11: cam figür kartı (kartın oranından; üç adımda aynı)
  const q = plan.questions[qi]
  const cardRef = useRef(null)
  const cardBox = useBox(cardRef, `${phase}${qi}`)
  const card = useMemo(() => (phase === 'missed' && q && cardBox?.w && cardBox?.h
    ? missedCard(street, q.id, { ratio: cardBox.w / cardBox.h, wPx: cardBox.w, footPx: narrow ? 36 : 40, mode, uid: `q${qi}`, label: sName })
    : null), [phase, q, qi, cardBox, narrow, street, mode, sName])
  // 12: sahne özeti (değişen yerin yakın planı; halka karenin kısa kenarının ~%58'i) ve satır küçük resimleri
  const thumbs = useMemo(() => {
    if (phase !== 'result') return []
    const ar = narrow ? 4 / 5 : 170 / 112
    let n = plan.startN
    return plan.frames.map((spec, i) => {
      const c = changes[i]
      const f = makeFrame(street, spec, n)
      if (c) n = nextN(n, c)
      const g = grow(f.box?.after ?? f.box?.before ?? f.hit[0], 6)
      const ring = { cx: g.x + g.w / 2, cy: g.y + g.h / 2, r: Math.max(20, Math.hypot(g.w, g.h) / 2) }
      const V = f.view
      let vh = Math.max((2 * ring.r) / 0.58 / Math.min(1, ar), 120)
      let vw = vh * ar
      if (vw > V.vw) { vw = V.vw; vh = vw / ar }
      if (vh > V.vh) { vh = V.vh; vw = vh * ar }
      const vx = Math.max(V.vx, Math.min(V.vx + V.vw - vw, ring.cx - vw / 2))
      const vy = Math.max(V.vy, Math.min(V.vy + V.vh - vh, ring.cy - vh / 2))
      const v = { vx, vy, vw, vh }
      return { found: Boolean(c?.found), n: f.n, ring, vb: `${vx} ${vy} ${vw} ${vh}`, svg: sceneSVG(f.after, { ...v, motion: false, mode, label: sName, wholeSigns: true, edgeDecor: false }) }
    })
  }, [phase, narrow, plan, changes, street, mode, sName])
  const rowThumbs = useMemo(() => (phase === 'result' ? plan.questions.map((qq) => subjectThumb(street, qq.id, { mode, label: sName })) : []), [phase, plan, street, mode, sName])
  // 12-kart: konunun cam figürü kendi caddesinde (tabelanın üstünden ayakların altına; konu solda üçte birde)
  const artRef = useRef(null)
  const artBox = useBox(artRef, sheet)
  const artCard = useMemo(() => {
    const id = plan.questions[0]?.id
    if (!sheet || !id || !artBox?.w || !artBox?.h) return null
    const ar = artBox.w / artBox.h
    return missedCard(street, id, {
      mode, uid: 'art', label: sName,
      view: (subj) => { const vy = SIGN.top - 8; const vh = subj.feet + 22 - vy; const vw = vh * ar; return { vx: subj.x - vw * 0.3, vy, vw, vh } },
    })
  }, [sheet, artBox, plan, street, mode, sName])

  // Caddeden geç: sahne ekranı doldurur (yükseklik 844 birim = ekran), soldan sağa akar (requestAnimationFrame)
  useEffect(() => {
    if (phase !== 'walk') return undefined
    const box = walkRef.current
    const svg = box?.querySelector('.sw-scene svg')
    if (!box || !svg) return undefined
    const h = box.clientHeight
    const w = (street.L * h) / H
    svg.style.height = `${h}px`
    svg.style.width = `${w}px`
    const dur = street.walkSec * 1000
    const start = performance.now()
    t0.current = Date.now()
    let raf = 0
    const step = (t) => {
      const u = Math.max(0, Math.min(1, (t - start) / dur)) // HATA_GUNLUGU Build 29: oran 0..1
      svg.style.transform = `translateX(${(-(w - box.clientWidth) * u).toFixed(1)}px)`
      ringRef.current?.setAttribute('stroke-dashoffset', (RING_C * u).toFixed(2))
      if (u < 1) raf = requestAnimationFrame(step)
      else {
        walkEnd.current = Date.now()
        setPhase('count')
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, street])

  // Ne değişti?: ilk kare 3 sn → göz kırpması (tek, yumuşak) → ikinci kare
  useEffect(() => {
    if (phase !== 'change') return undefined
    const timers = []
    if (stage === 'first') timers.push(setTimeout(() => setStage('blink'), LOOK_MS))
    if (stage === 'blink') {
      if (reduced) {
        setAfter(true)
        setStage('second')
      } else {
        setDim(true)
        timers.push(setTimeout(() => { setAfter(true); setDim(false) }, BLINK_MS / 2))
        timers.push(setTimeout(() => setStage('second'), BLINK_MS))
      }
    }
    return () => timers.forEach(clearTimeout)
  }, [phase, stage, look, fi, reduced])

  function startFrame(i, n) {
    setFi(i)
    setNNow(n)
    setLook(1)
    setAfter(false)
    setStage('first')
  }
  function settle(found) {
    const c = { n: frame.n, looks: look, found, kind: frame.kind, obj: frame.obj }
    setChanges((a) => [...a, c])
    setStage(found ? 'found' : 'shown')
    haptic(found ? 'success' : 'tick')
  }
  function tapFrame(e) {
    if (stage !== 'second' || !frame) return
    const svg = frameRef.current?.querySelector('.sw-after svg')
    const m = svg?.getScreenCTM?.()
    if (!m) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(m.inverse())
    if (hitTest(frame, p.x, p.y)) settle(true) // yanlış dokunuş bakış sayılmaz (PLAN §10)
  }
  function lookAgain() {
    if (stage !== 'second') return
    if (look >= 3) return settle(false)
    setLook(look + 1)
    setAfter(false)
    setStage('first')
  }
  function nextFrame() {
    const n = nextN(nNow, changes.at(-1))
    if (fi + 1 < plan.frames.length) startFrame(fi + 1, n)
    else {
      setQi(0)
      setPhase('missed')
    }
  }
  // Gözünden kaçan
  function chooseOption(v) {
    if (picked != null) return
    const ok = v === q.a
    setPicked(v)
    setPicks((a) => [...a, v])
    setAnswers((a) => [...a, { id: q.id, ok, saw, similar: q.similar }])
    haptic(ok ? 'success' : 'tick')
  }
  function nextQuestion() {
    if (qi + 1 < plan.questions.length) {
      setQi(qi + 1)
      setSaw(null)
      setPicked(null)
      return
    }
    const rec = makeRecord({ street, countAnswer, answers, changes, fact: plan.fact?.id ?? null, factOpen: false, seconds: (Date.now() - t0.current) / 1000 })
    setRecord(rec)
    recRef.current = rec
    if (!plan.fact) commit()
    setPhase('result')
  }

  // ---------- Caddeden geç ----------
  if (phase === 'walk') {
    const walkSvg = sceneSVG(street, { motion: true, walkSec: street.walkSec, mode, label: sName })
    return (
      <main className="sw-walk" ref={walkRef} aria-label={sName}>
        <div className="sw-scene" dangerouslySetInnerHTML={{ __html: walkSvg }} />
        <div className="sw-scrim" aria-hidden="true" />
        <div className="sw-hud">
          <span className="sw-chip">{task.task}</span>
          <TimeRing ringRef={ringRef} />
        </div>
      </main>
    )
  }

  // ---------- sayı sorusu (tasarım tur 2: donmuş kare + başparmak tuşları; cevaptan sonra tepsi) ----------
  if (phase === 'count') {
    const answered = countAnswer != null
    const d = answered ? Math.abs(countAnswer - n0) : null
    const slots = answered ? Math.max(n0, countAnswer) : 0
    const cols = slots <= 6 ? slots : Math.ceil(slots / 2)
    // Geri bildirim: tam doğru ve yakın başlık + R5; uzak düz R5 (tek sonuç rengi)
    const fbOf = (dd, a) => (dd === 0
      ? <><h1 className="sw-h ok">{say('count.exact')}</h1><p className="sw-lead strong">{glue(countRow(taskId, n0, a))}</p></>
      : dd === 1
        ? <><h1 className="sw-h near">{say('count.near')}</h1><p className="sw-lead strong">{glue(countRow(taskId, n0, a))}</p></>
        : <h1 className="sw-h">{glue(countRow(taskId, n0, a))}</h1>)
    const far = opts.find((v) => Math.abs(v - n0) >= 2) ?? n0 + 2
    return (
      <main className="screen sw sw-in sw-fill sw-cnt">
        <Top value={0.3} onExit={onExit} />
        <section className="sw-panel" ref={panelRef} aria-label={sName}>
          <div className="sw-scn" dangerouslySetInnerHTML={{ __html: panelSvg ?? '' }} />
          {/* Gerçek sayı kadar aynı karo; kişinin cevabı karo sırasında ince dikey işaret (sonrası sayılmadı), fazla
              saydıysa sonda boş kesik karolar. Hangi hedefin kaçtığını bilemeyiz: tek tek ✓ yok. Anlamı R5 taşır. */}
          {answered && (
            <div className="sw-tray" aria-hidden="true" style={{ '--n': cols }}>
              {Array.from({ length: slots }, (_, i) => (
                <span key={i} className={`sw-tile${i >= n0 ? ' extra' : ''}${countAnswer < n0 && i === countAnswer - 1 ? ' cut' : ''}${countAnswer === 0 && i === 0 ? ' cut0' : ''}`} style={{ '--i': i }} dangerouslySetInnerHTML={{ __html: i < n0 ? icon : '' }} />
              ))}
            </div>
          )}
        </section>
        <div className="sw-cq">
          <div className={`sw-ask${answered ? ' gone' : ''}`} aria-hidden={answered}>
            <h1 className="sw-h">{task.count}</h1>
            <div className="sw-keys" role="radiogroup" aria-label={task.count}>
              {opts.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={countAnswer === v} className="sw-key" disabled={answered} onClick={() => !answered && (setCountAnswer(v), haptic(v === n0 ? 'success' : 'tick'))}>{v}</button>
              ))}
            </div>
          </div>
          {/* alt blok iki hâlin büyüğü kadar (görünmez örnekler): panel cevaptan sonra kıpırdamaz */}
          {[n0 - 1, far].map((a) => <div key={`g${a}`} className="sw-fbk ghost" aria-hidden="true">{fbOf(Math.abs(a - n0), a)}<span className="btn">{say('ui.next')}</span></div>)}
          {answered && (
            <div className="sw-fbk on" aria-live="polite">
              {fbOf(d, countAnswer)}
              <button className="btn" onClick={() => { startFrame(0, plan.startN); setPhase('change') }}>{say('ui.next')}</button>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ---------- Ne değişti? (05–08: başlık, kare ve alt blok her hâlde aynı yerde) ----------
  if (phase === 'change' && frame) {
    const total = plan.frames.length
    const view = frame.view
    const vb = `${view.vx} ${view.vy} ${view.vw} ${view.vh}`
    const label = say('D2')
    const done = stage === 'found' || stage === 'shown'
    const memorize = stage === 'first' || stage === 'blink'
    const next = done ? nextN(nNow, changes.at(-1)) : null
    const what = done ? changeSentence(frame.change) : null
    const [here, rest] = stage === 'shown' ? splitFirst(say('D9', { N: next })) : []
    const [d2a, d2b] = splitFirst(say('D2'))
    const d2 = <>{d2a}<br />{d2b}</> // D2 ilk ". " noktasından iki satır (harfler aynı)
    const title = stage === 'found' ? say('D6') : stage === 'shown' ? here : stage === 'second' ? d2 : say('B1') // ezberleme anında B1
    const lead = done ? what : stage === 'second' ? say('D3') : say('D4', { N: frame.n })
    const ey = say('D1', { i: fi + 1, n: total })
    // Vurgu halkası değişen şeyin kendisini sarar (kişide değişen parça); öğrenme anı: yer değiştirdiyse eski yerde
    // hayalet çerçeve, öbür türlerde köşede önceki hâlin küçük kırpımı (görsel, metin yok)
    const tb = frame.box?.after ?? frame.box?.before ?? frame.hit[0]
    const ring = grow(tb, 6)
    // halka ve dalga sahne kutusunun içinde kalır: yarıçap merkezden en yakın kenara olan uzaklıkla sınırlı
    const c0 = { cx: ring.x + ring.w / 2, cy: ring.y + ring.h / 2 }
    const room = Math.min(c0.cx - view.vx, view.vx + view.vw - c0.cx, c0.cy - view.vy, view.vy + view.vh - c0.cy) - 4
    const r0 = { r: Math.max(20, Math.min(Math.hypot(ring.w, ring.h) / 2, room)), ...c0 }
    const ws = Math.max(1, Math.min(1.75, room / (r0.r + 3))) // dalganın en büyük ölçeği (çizgi kalınlığı dahil)
    const ghost = frame.kind === 'yer' && frame.box?.before ? grow(frame.box.before, 6) : null
    const ib = frame.kind !== 'yer' ? frame.box?.before ?? frame.box?.after ?? null : null
    const side = ib ? Math.min(view.vw * 0.6, Math.max(70, Math.max(ib.w, ib.h) + 40)) : 0
    const inset = ib ? { vx: ib.x + ib.w / 2 - side / 2, vy: ib.y + ib.h / 2 - side / 2, vw: side, vh: side } : null
    const corner = inset ? insetCorner(frame, view, r0) : null
    return (
      <main className="screen sw sw-in sw-fill sw-chg" key={`f${fi}`}>
        <Top value={0.35 + (0.35 * (fi + (done ? 1 : 0))) / total} onExit={onExit} ey={ey} dim={memorize} />
        <div className="sw-cg">
          <div className="sw-sp" />
          <header className="sw-chead">
            <h1 className="sw-h">{title}</h1>
            <p className={`sw-lead${stage === 'second' ? ' cue' : ''}`} aria-live="polite">{lead}</p>
          </header>
          <div className={`sw-frame${stage === 'second' ? ' live' : ''}`} ref={frameRef} onClick={tapFrame} role="img" aria-label={label}>
            <div className={`sw-img${after ? ' off' : ''}`} dangerouslySetInnerHTML={{ __html: sceneSVG(frame.before, { ...view, motion: false, mode, label }) }} />
            <div className={`sw-img sw-after${after ? '' : ' off'}`} dangerouslySetInnerHTML={{ __html: sceneSVG(frame.after, { ...view, motion: false, mode, label }) }} />
            {done && (
              <svg className="sw-mark" viewBox={vb} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                {ghost && <rect className="ghost-under" x={ghost.x} y={ghost.y} width={ghost.w} height={ghost.h} rx="10" />}
                {ghost && <rect className="ghost" x={ghost.x} y={ghost.y} width={ghost.w} height={ghost.h} rx="10" />}
                <circle className="ring" {...r0} />
                {stage === 'found' && !reduced && <><circle className="wave" {...r0} style={{ '--ws': ws }} /><circle className="wave w2" {...r0} style={{ '--ws': ws }} /></>}
              </svg>
            )}
            {done && inset && (
              <div className={`sw-inset ${corner}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: sceneSVG(frame.before, { ...inset, motion: false, mode, label }) }} />
            )}
            <div className={`sw-lid top${dim ? ' on' : ''}`} aria-hidden="true" />
            <div className={`sw-lid bot${dim ? ' on' : ''}`} aria-hidden="true" />
          </div>
          {/* alt blok sabit yükseklik (07'nin çip + Devam'ı kadar): ezberlemede süre çizgisi karenin hemen altında,
              ikinci karede Bulamadım, bulununca çip + Devam */}
          <div className="sw-blk">
            {memorize && <div className="sw-tbar" role="img" aria-label={say('Ö3')}><i key={`${fi}-${look}`} /></div>}
            {stage === 'second' && <button className="btn sw-again" onClick={lookAgain}>{say('D5')}</button>}
            {done && <span className={stage === 'found' ? 'sw-chip-ok' : 'sw-chip-n'}>{glue(stage === 'found' ? say(look === 1 ? 'D8.1' : 'D8.2', { N: next }) : rest)}</span>}
            {done && <button className="btn" onClick={nextFrame}>{say('ui.next')}</button>}
          </div>
          <div className="sw-sp" />
        </div>
      </main>
    )
  }

  // ---------- Gözünden kaçan (09/10/11: cam figür; başlık yeri, kart ve alt blok üç adımda aynı) ----------
  if (phase === 'missed' && q) {
    const ml = missedLines(q.id, scene)
    const step = saw == null ? 9 : picked == null ? 10 : 11
    const ok = picked != null && picked === q.a
    const [yes, no] = ml.yesNo ?? []
    const dk = Math.max(1, Math.round((Date.now() - (walkEnd.current || Date.now())) / 60000))
    const [s1a, s1b] = splitFirst(say('Ş1'))
    // 11 başlığı: Görmedim + doğru Ş1 (iki cümle), Gördüm + doğru Ö1, yanlış Ö2
    const endHead = (k) => (k === 'Ş1' ? [s1a, s1b] : [say(k)])
    const endKey = !ok ? 'Ö2' : saw === 'gormedim' ? 'Ş1' : 'Ö1'
    const heads = { 9: ml.saw ?? [], 10: ml.detail ?? [], 11: endHead(endKey) }
    const head = (t, cls, key, hidden) => (
      <div key={key} className={`sw-mh ${cls}`} aria-hidden={hidden || undefined}><h1 className="sw-h">{t[0]}</h1>{t[1] && <p className="sw-lead">{t[1]}</p>}</div>
    )
    const vb = card ? `${card.view.vx} ${card.view.vy} ${card.view.vw} ${card.view.vh}` : '0 0 1 1'
    // halka kart içinde kalır (kenara 4 birim)
    const rg = card ? (() => {
      const v = card.view
      const room = Math.min(card.ring.cx - v.vx, v.vx + v.vw - card.ring.cx, card.ring.cy - v.vy, v.vy + v.vh - card.ring.cy) - 4
      return { cx: card.ring.cx, cy: card.ring.cy, r: Math.max(16, Math.min(card.ring.r, room)) }
    })() : null
    const gc = factLines(FACTS.find((f) => f.id === 'guess'))?.cite ?? ''
    const guessRef = gc.slice(0, gc.indexOf(' · doi ') > 0 ? gc.indexOf(' · doi ') : undefined)
    const sw = (c) => q.detail === 'color' && <Swatch c={c} />
    return (
      <main className={`screen sw sw-in sw-fill sw-ms st-${step}`} key={`q${qi}`}>
        <Top value={0.75 + 0.1 * qi + (step > 9 ? 0.05 : 0)} onExit={onExit} ey={say('G1', { i: qi + 1 })} />
        {/* başlık kutusu bütün adımların en uzununa göre (görünmez örnekler aynı hücrede); başlık alta yaslı */}
        <div className="sw-mhead" aria-live="polite">
          {[ml.saw ?? [], ml.detail ?? [], endHead('Ş1'), endHead('Ö1'), endHead('Ö2')].map((t, i) => head(t, i > 1 ? 'ghost end' : 'ghost', `g${i}`, true))}
          {step === 11 && head(heads[10], 'out', 'out', true)}
          {head(heads[step], step === 11 ? 'in end' : '', `h${step}`)}
        </div>
        <figure className={`sw-mcard${picked != null ? ' turned' : ''}`} ref={cardRef}>
          <div className="sw-ml" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card?.base ?? '' }} />
          {card?.glass && <div className="sw-ml glass" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.glass }} />}
          <div className="sw-ml real" role={picked != null ? 'img' : undefined} aria-label={picked != null ? say(`who.${q.id}`) ?? sName : undefined} aria-hidden={picked == null} dangerouslySetInnerHTML={{ __html: card?.real ?? '' }} />
          {rg && step > 9 && (
            <svg className="sw-mmark" viewBox={vb} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <circle className="rg halo" {...rg} /><circle className="rg fg" {...rg} />
              {step === 11 && !reduced && <><circle className="wv" {...rg} /><circle className="wv w2" {...rg} /></>}
            </svg>
          )}
          <figcaption className="sw-pill">{say('G5', { sahne: sName, dk })}</figcaption>
        </figure>
        <div className="sw-mblk">
          {step === 9 && (
            <div className="sw-yn" role="radiogroup" aria-label={ml.saw?.join(' ')}>
              <button type="button" role="radio" aria-checked="false" onClick={() => setSaw(SAW[0])}><Eye aria-hidden="true" />{yes}</button>
              <button type="button" role="radio" aria-checked="false" onClick={() => setSaw(SAW[1])}><EyeOff aria-hidden="true" />{no}</button>
            </div>
          )}
          {step === 10 && (
            <div className="sw-mopts" role="radiogroup" aria-label={ml.detail?.[0]}>
              {q.opts.map((v) => (
                <button key={v} type="button" role="radio" aria-checked="false" className="sw-mopt" onClick={() => chooseOption(v)}>{sw(v)}{optionText(q.detail, q.id, v)}</button>
              ))}
            </div>
          )}
          {step === 11 && (
            <div className="sw-ans">
              <div className="sw-picks">
                {!ok && <span className="sw-pick no"><X className="sw-mk" size={18} strokeWidth={3} aria-hidden="true" />{sw(picked)}<s>{optionText(q.detail, q.id, picked)}</s></span>}
                <span className="sw-pick"><Check className="sw-mk" size={18} strokeWidth={3} aria-hidden="true" />{sw(q.a)}{optionText(q.detail, q.id, q.a)}</span>
              </div>
              <p className={`sw-cite${endKey === 'Ş1' ? '' : ' sw-gone'}`} aria-hidden={endKey !== 'Ş1'}><BookOpen size={16} aria-hidden="true" /><span>{guessRef.split(' · ').map((x, i, a) => <span className="sw-nw" key={x}>{x}{i < a.length - 1 ? ' ·' : ''}{i < a.length - 1 ? ' ' : ''}</span>)}</span></p>
              <button className="btn" onClick={nextQuestion}>{say('ui.next')}</button>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ---------- Sonuç (12) ve bilim kartı (12-kart: alttan açılan sayfa) ----------
  if (phase === 'result' && record) {
    const [, nSentence] = record.changeN != null ? lines('R2', { N: record.changeN }) ?? [] : []
    const [TAM, YAKIN, KACTI, GORDUN, TAHMIN] = say('R5.tags')?.split(' / ') ?? []
    const fact = factLines(plan.fact)
    const leave = () => { commit(); onExit?.() }
    const found = changes.filter((c) => c.found)
    const best = changes.reduce((b, c, i) => (c.found && (b < 0 || c.n >= changes[b].n) ? i : b), -1)
    // kaynak iki satır: "Simons & Chabris 1999 · Perception" / "doi 10.1068/p281059" (harfler aynı, bölünmez boşluk)
    const cut = fact?.cite?.indexOf(' · doi ') ?? -1
    const ref = cut > 0 ? fact.cite.slice(0, cut) : fact?.cite
    const doi = cut > 0 ? fact.cite.slice(cut + 3).replace(' ', NB) : null
    const who = (id) => upperFirst(say(`who.${id}`) ?? '', 'tr')
    const nm = (qq, v) => optionText(qq.detail, qq.id, v)
    return (
      <>
        <main className="screen sw sw-in sw-fill sw-res">
          <Top value={1} onExit={leave} ey={say('R1')} />
          <h1 className="sw-h sw-rh">{resultHead(found.length, plan.frames.length)}</h1>
          {/* turun sahneleri: bulunan turkuaz halka ve ✓, kaçan kesik halka; en kalabalık bulunan sarı çerçeve (R2 açıklar) */}
          <div className="sw-strip">
            {thumbs.map((t, i) => (
              <div key={i} className={`sw-th${i === best ? ' best' : ''}`} style={{ '--i': i }} role="img" aria-label={say(t.found ? 'Ö5.found' : 'Ö5.miss', { i: i + 1, N: t.n })}>
                <div className="sw-thi" dangerouslySetInnerHTML={{ __html: t.svg }} />
                <svg className="sw-thm" viewBox={t.vb} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <circle className="rg halo" {...t.ring} /><circle className={`rg${t.found ? '' : ' miss'}`} {...t.ring} />
                </svg>
                {t.found && <span className="sw-thb" aria-hidden="true"><Check size={13} strokeWidth={3.4} /></span>}
              </div>
            ))}
          </div>
          {nSentence && <p className="sw-r2">{glue(nSentence)}</p>}
          {/* Gelişim hükmü (R3, R4: metricStatusV2 + changeText): F4'te bağlanır; o güne dek boş */}
          <div className="sw-verdict" data-slot="gelisim" />
          <div className="sw-rows">
            <div className="sw-row2">
              <span className="sw-rth ic" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
              <div className="sw-rtx">{glue(countRow(taskId, n0, countAnswer))}</div>
              <i className={`sw-tag ${record.task === 1 ? 'ok' : record.task === 0.5 ? 'near' : 'no'}`}>{record.task === 1 ? TAM : record.task === 0.5 ? YAKIN : KACTI}</i>
            </div>
            {plan.questions.map((qq, k) => {
              const a = answers[k]
              const cls = !a?.ok ? 'no' : a.saw === 'gordum' ? 'ok' : 'guess'
              return (
                <div className="sw-row2" key={qq.id}>
                  <span className="sw-rth" aria-hidden="true" dangerouslySetInnerHTML={{ __html: rowThumbs[k] ?? '' }} />
                  <div className="sw-rtx">
                    {who(qq.id)}
                    <span className="a">
                      {!a?.ok && picks[k] != null && <span className="not"><X className="sw-mk" size={15} strokeWidth={3} aria-hidden="true" />{qq.detail === 'color' && <Swatch c={picks[k]} dot />}<s>{nm(qq, picks[k])}</s></span>}
                      <span className="yes"><Check className="sw-mk" size={15} strokeWidth={3} aria-hidden="true" />{qq.detail === 'color' && <Swatch c={qq.a} dot />}{nm(qq, qq.a)}</span>
                    </span>
                  </div>
                  <i className={`sw-tag ${cls}`}>{!a?.ok ? KACTI : a.saw === 'gordum' ? GORDUN : TAHMIN}</i>
                </div>
              )
            })}
          </div>
          {fact && (
            <button type="button" className="sw-fact" aria-expanded={sheet} onClick={() => { setFactOpen(true); setSheet(true) }}>
              <span className="l"><FlaskConical size={20} aria-hidden="true" />{fact.head}</span><ChevronDown size={20} aria-hidden="true" />
            </button>
          )}
          <button className="btn" onClick={leave}>{say('R6')}</button>
        </main>
        {fact && sheet && (
          <>
            <div className="sw-scrim2" aria-hidden="true" onClick={() => setSheet(false)} />
            <section className="sw-pop" role="dialog" aria-modal="true" aria-label={fact.head}>
              <span className="sw-grab" aria-hidden="true" />
              <div className="sw-pop-hd">
                <span className="l"><FlaskConical size={20} aria-hidden="true" />{fact.head}</span>
                <button type="button" className="x" aria-label={say('Ö6')} onClick={() => setSheet(false)}><X size={20} aria-hidden="true" /></button>
              </div>
              <div className="sw-art" ref={artRef}>
                {artCard && <div className="sw-ml" aria-hidden="true" dangerouslySetInnerHTML={{ __html: artCard.base }} />}
                {artCard?.glass && <div className="sw-ml" aria-hidden="true" dangerouslySetInnerHTML={{ __html: artCard.glass }} />}
                <span className="sw-chip">{task.task}</span>
              </div>
              <p className="sw-claim">{fact.claim}</p>
              <p className="sw-body"><b className={plan.fact.answer === 'myth' ? 'no' : 'ok'}>{fact.answer}.</b> {fact.body}</p>
              <p className="sw-src"><BookOpen size={18} aria-hidden="true" /><span><span className="ln">{ref}</span>{doi && <span className="ln">{doi}</span>}</span></p>
            </section>
          </>
        )}
      </>
    )
  }

  // ---------- Görev ----------
  // Kapak kırpımı kutunun oranından (lib/street.js coverView): yan kenarlar bina sınırında, tabela ya tam ya hiç,
  // kenarda bölünen kişi yok, en az bir hedef içeride; 390 ve 320 aynı mantık
  const introView = coverView(street, taskId, introBox?.w && introBox?.h ? introBox.w / introBox.h : 340 / 380)
  const [label, title] = lines('M2', { görev: task.task }) ?? []
  const parts = lines('M4', { k: plan.frames.length }) ?? []
  return (
    <main className="screen sw sw-in sw-fill">
      <Top value={0} onExit={onExit} />
      <div className="sw-intro-scene" ref={introRef} role="img" aria-label={sName} dangerouslySetInnerHTML={{ __html: sceneSVG(coverModel(street, introView), { ...introView, motion: false, mode, label: sName }) }} />
      <M1Line text={say('M1', { sahne: sName?.replace(/ /g, NB) })} />
      <div className="sw-task">
        <span className="sw-task-ico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: taskIconSVG(taskId, 'day') }} />
        <div><span className="sw-task-l">{label}</span><h1 className="sw-h">{title}</h1></div>
      </div>
      <ol className="sw-parts">{parts.map((p) => <li key={p}>{p}</li>)}</ol>
      <div className="sw-nef">
        <IrisMark size={30} />
        <p>{task.focus}</p>
      </div>
      {firstRound && <p className="sw-src">{say('M5')}</p>}
      <button className="btn" onClick={() => setPhase('walk')}>{say('M6')}</button>
    </main>
  )
}
