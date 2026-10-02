import { useEffect, useId, useRef } from 'react'
import { createLensEngine, constellationSVG, defsSVG, apertureSVG, safeId, CM } from '../lib/cemberDraw.js'
import { ROUND_MS } from '../lib/track.js'

// Çemberler çizimleri (onaylı taslak "EyeTrail Çemberler"): giriş önizlemesi (Ç1), yönerge kartı
// çizimi (Ç2), sonuç takımyıldızı ve adım şeridi (Ç9/Ç10). Hepsi gece göğü: her temada koyu.

const reducedMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

// Ç1: küçük canlı ağ. Hedef 1,6 sn'de bir atlar; her demo varışında altın parlar ve söz çıkar.
// Hareket azaltmada tek bir varış karesi.
export function LensPreview() {
  const uid = safeId(useId())
  const svgRef = useRef(null)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined
    const r = svg.getBoundingClientRect()
    const box = { w: Math.max(200, Math.round(r.width) || 300), h: Math.max(120, Math.round(r.height) || 170) }
    const reduced = reducedMotion()
    const eng = createLensEngine(svg, {
      uid,
      box,
      scale: box.w / 600,
      reduced,
      level: 1,
      mode: 'jump',
      gaze: 'demo',
      round: Infinity,
      interval: 1600,
      stretchY: 1.4,
      seed: 5,
      starCount: 9,
    })
    if (reduced) eng.freeze()
    else eng.play()
    return () => eng.destroy()
  }, [uid])
  return (
    <div className="cm-nightcard" aria-hidden="true">
      <svg ref={svgRef} />
    </div>
  )
}

// Ç2: üç mercek, kayan diyafram, varışta altın ve söz (CSS animasyonu; hareket azaltmada durağan)
export function LensJumpArt() {
  const u = safeId(useId())
  const lens = (id, x, y) => `<use href="#${u}-${id}" transform="translate(${x} ${y}) scale(.75)"/>`
  const html =
    defsSVG(u) +
    `<g stroke="rgba(25,194,209,.35)" stroke-width="1" stroke-dasharray="3 6" fill="none"><line x1="34" y1="122" x2="136" y2="112"/><line x1="136" y1="112" x2="80" y2="40"/><line x1="80" y1="40" x2="34" y2="122"/></g>` +
    lens('lensC', 34, 122) +
    lens('lensO', 136, 112) +
    lens('lensC', 80, 40) +
    `<g class="cm-lj-ring" transform="translate(136 112)">` +
    `<g class="cm-lj-iris" opacity="0"><g class="cm-spin">${apertureSVG(u, 9, 23, false)}</g></g>` +
    `<g class="cm-lj-gold" opacity="1" filter="url(#${u}-glowT)"><g class="cm-spin">${apertureSVG(u, 17, 23, true)}</g></g>` +
    `<circle class="cm-lj-glint" r="26" fill="none" stroke="${CM.gold}" stroke-width="1.5" opacity="0"/>` +
    `<text class="cm-word cm-lj-gold" y="-31" text-anchor="middle" font-size="11" opacity="1" filter="url(#${u}-wordG)">Harika</text>` +
    `</g>`
  return <svg viewBox="0 0 170 170" className="cm-art" dangerouslySetInnerHTML={{ __html: html }} />
}

// Sonuç: iris halkası (isabet %) içinde turun takımyıldızı
export function ResultIris({ pct = null, level, edges, visited, rhythm }) {
  const u = safeId(useId())
  const deg = pct == null ? 0 : Math.round((Math.max(0, Math.min(100, pct)) / 100) * 360)
  const html = constellationSVG(u, { level, edges, visited, rhythm, box: { w: 200, h: 200 }, sc: level === 1 ? 0.5 : 0.46 })
  return (
    <div className="cm-irishero" style={{ '--p': `${deg}deg` }} aria-hidden="true">
      <div className="cm-irishero-in">
        <svg viewBox="0 0 200 200" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

// Adım adım şerit: altın çubuk = varış (boy = süre), camgöbeği nokta = kaçış, halka = ölçülmedi,
// kesik çizgi = ortanca. Ritim modunda her geçiş eşit bir nokta.
export function StepStrip({ steps = [], median = null, rhythm = false, total = ROUND_MS }) {
  const w = 280
  const h = rhythm ? 40 : 46
  const base = rhythm ? 24 : 35
  const ph = rhythm ? 20 : 28
  const bw = rhythm ? 3 : 2.6
  const x0 = 6
  const x1 = w - 6
  const maxMs = 700
  const X = (t) => x0 + Math.min(1, t / total) * (x1 - x0)
  const counts = { hit: 0, miss: 0, u: 0, none: 0 }
  steps.forEach((s) => {
    if (counts[s.res] != null) counts[s.res]++
  })
  const label = rhythm
    ? `Ritim şeridi: ${steps.length} geçiş, ölçüm yok`
    : `Adım adım: ${steps.length} geçiş, ${counts.hit} varış, ${counts.miss} kaçış, ${counts.u} ölçülmedi`
  const ym = median != null ? base - (median / maxMs) * ph : null
  return (
    <div className="cm-strip">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
        <line className="cm-tl-axis" x1={x0} y1={base} x2={x1} y2={base} />
        {ym != null && <line className="cm-tl-med" x1={x0} y1={ym} x2={x1} y2={ym} />}
        {steps.map((s, i) => {
          const x = X(s.t)
          if (s.res === 'hit' && Number.isFinite(s.ms)) {
            const bh = Math.max(2, Math.min(ph, (s.ms / maxMs) * ph))
            return <rect key={i} className="cm-tl-hit" x={x - bw / 2} y={base - bh} width={bw} height={bh} rx={bw / 2.5} />
          }
          if (s.res === 'hit') return <circle key={i} className="cm-tl-hit" cx={x} cy={base - 6} r={bw * 0.7} />
          if (s.res === 'miss') return <circle key={i} className="cm-tl-miss" cx={x} cy={base} r={bw * 0.6} />
          if (s.res === 'none') return <circle key={i} className="cm-tl-none" cx={x} cy={base} r={bw * 0.6} />
          return <circle key={i} className="cm-tl-u" cx={x} cy={base} r={bw * 0.55} />
        })}
        <text className="cm-tl-t" x={x0} y={h - 2}>0</text>
        <text className="cm-tl-t" x={(x0 + x1) / 2} y={h - 2} textAnchor="middle">30</text>
        <text className="cm-tl-t" x={x1} y={h - 2} textAnchor="end">60 sn</text>
      </svg>
    </div>
  )
}
