import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { haptic } from '../../lib/native.js'
import { RATE_MAX } from '../../lib/yogaRecord.js'
import { cachedTimeline, loadTimelineCached, sectionSpans } from './timeline.js'

// Yoga ekranlarının ortak parçaları (5 saniye yeniden tasarımı; C_5SN_RAPORU.md). Hepsi uygulamanın jetonlarıyla ve
// dersin rengiyle (--yg-c / --yg-cl) çizilir; iki temada (yoga.css). Oynatıcı bu parçaları kullanmaz (hep karanlık).

// ---- Yer: aynı kıyı, günün başka bir anı (yön B "ders bir yer") ----
// mood: far (kütüphane: uzaktan, güneş ufukta) · shore (ayrıntı: kıyıya varış, güneş yarı doğmuş) · before (önce
// puanı: güneş henüz doğmamış, yalnız ufuktaki ışık) · dawn (sonra puanı: güneş doğmuş, sıcak) · done (bitiş: sıcak
// şafak, ışık yükselmiş). Yalnız süs (aria-hidden); renkler ve boylar CSS'te (yoga.css .yg-scene). Işık yanıp sönmez;
// tek hareket ışığın çok yavaş opaklık kayması, Hareketi Azalt'ta yok.
export function Scene({ mood = 'far', className = '' }) {
  return (
    <span className={`yg-scene is-${mood} ${className}`.trim()} aria-hidden="true">
      <span className="yg-scene-sky">
        <span className="yg-scene-cloud c1" />
        <span className="yg-scene-cloud c2" />
        <span className="yg-scene-cloud c3" />
        <span className="yg-scene-glow" />
        <span className="yg-scene-sun" />
      </span>
      <span className="yg-scene-sea" />
      <span className="yg-scene-line" />
    </span>
  )
}

// ---- Zaman çizelgesi (bölüm süreleri) ----
// Ders dosyasının çizelgesi paketten bir kez okunur; okunana kadar (ya da okunamazsa) null: çizenler eşit böler.
export function useTimeline(path) {
  const [tl, setTl] = useState(() => (path ? cachedTimeline(path) : null))
  useEffect(() => {
    if (!path) return undefined
    let alive = true
    const hit = cachedTimeline(path)
    if (hit) setTl(hit)
    else loadTimelineCached(path).then((x) => { if (alive && x) setTl(x) }).catch(() => {})
    return () => { alive = false }
  }, [path])
  return tl
}

// ---- Bölüm şeridi (yön C): bölümler süreleriyle orantılı parçalar. Yalnız görsel (aria-hidden); adlar yanında yazılı.
// sections: [{ id, label }] · tl: çizelge (yoksa eşit) · full: bitişte dinlenen ders (hepsi dolu)
export function SectionStrip({ sections = [], tl = null, full = false, className = '' }) {
  const spans = tl ? sectionSpans(tl) : null
  return (
    <span className={`yg-bar${full ? ' full' : ''} ${className}`.trim()} aria-hidden="true">
      {sections.map((s) => <i key={s.id} style={{ flexGrow: spans?.[s.id] ?? 1 }} />)}
    </span>
  )
}

// ---- Derine inip geri çıkan bölüm yolu (yön B; kütüphane kartı) ----
// Noktalar derse dalışı çizer: ilk ve son bölüm yüzeyde (dolu nokta), ortadakiler derinde. Derinlik bölümün sırasından
// (yarım sinüs): her derste aynı biçim, zaman çizelgesi beklenmez. Adlar noktaya yaslanır (4. değerlendirici: "adlar
// eğriden kopmuş"); nokta ile harf arasında boşluk kalır (5. değerlendirici). Eğri SVG'de; noktalar CSS'te.
const DIVE_X0 = 6 // px: yüzeydeki noktanın merkezi
const DIVE_DX = 40 // px: en derindeki noktanın kayması
export const diveDepth = (i, n) => (n < 3 || i === 0 || i === n - 1 ? 0 : Math.sin((Math.PI * i) / (n - 1)))
function divePath(n) {
  const pts = Array.from({ length: n }, (_, i) => [DIVE_X0 + diveDepth(i, n) * DIVE_DX, i + 0.5])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(3)} ${c2[0].toFixed(2)},${c2[1].toFixed(3)} ${p2[0].toFixed(2)},${p2[1].toFixed(3)}`
  }
  return d
}
export function DiveList({ sections = [] }) {
  const n = sections.length
  if (!n) return null
  const W = DIVE_X0 * 2 + DIVE_DX
  return (
    <span className="yg-dive">
      {n > 1 && (
        <svg className="yg-dive-arc" viewBox={`0 0 ${W} ${n}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d={divePath(n)} fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {sections.map((x, i) => {
        const d = diveDepth(i, n)
        const edge = i === 0 || i === n - 1
        return (
          <span key={x.id} className={`yg-dive-i${edge ? ' edge' : ''}${d > 0.85 ? ' deep' : ''}`} style={{ '--x': `${(DIVE_X0 + d * DIVE_DX).toFixed(1)}px` }}>
            {x.label}
          </span>
        )
      })}
    </span>
  )
}

// ---- Dersin yolu: Önce → ders → Sonra (yön A; önce ve sonra puanı). after: önce ve ders tamam (✓), sonra şu an ----
export function LessonPath({ title, after = false, labels }) {
  const steps = [
    { id: 'before', label: labels.before, done: after, now: !after },
    { id: 'lesson', label: title, done: after, now: false, mid: true },
    { id: 'after', label: labels.after, done: false, now: after },
  ]
  return (
    <ol className={`yg-path${after ? ' is-after' : ''}`}>
      {steps.map((s) => (
        <li key={s.id} className={`${s.mid ? 'mid' : 'end'}${s.done ? ' done' : ''}${s.now ? ' now' : ''}`} aria-current={s.now ? 'step' : undefined}>
          {s.mid
            ? (s.done ? <Check className="yg-path-ck" size={15} aria-hidden="true" /> : null)
            : <span className="yg-path-dot" aria-hidden="true">{s.done ? <Check size={12} strokeWidth={3} /> : null}</span>}
          <span className="yg-path-t">{s.label}</span>
        </li>
      ))}
    </ol>
  )
}

// ---- Ufuk ölçeği (yön A): 1–10 tek bir çizgide, dersin ufku. Tek ayarlanabilir denetim (role="slider"; VoiceOver'da
// yukarı/aşağı kaydır, klavyede oklar): 10 ayrı 44 px düğme 320 px'te tek sıraya sığmaz (OZET.md §5 seçenek b).
// Dokunma alanı çizginin tamamı (tam genişlik, 64 px yükseklik); seçimden sonra 48 px başparmak, içinde seçilen sayı.
// Seçim yapılana kadar başparmak ve değer yok (ölçek hiçbir sayıyı öne çıkarmaz). Duraklar 1'den 10'a hafifçe büyür
// ve koyulaşır ("daha çok" yazısız okunur; değerlendiriciler 2, 4, 5). was: sonra puanında önceki puan, yalnız seçimden
// sonra içi boş halka olarak (çıpalama yok, OZET.md §10). sky: önce puanında ölçeğin üstündeki gök (güneş doğmamış).
// Çizgi ve dokunma alanı kenardan kenara (ekranın 20 px'lik kenar boşluğuna taşar: GX, yoga.css .yg-hz --gx); duraklar
// içeride: ilk ve son durağın merkezi kenar boşluğunun 22 px içinde.
const GX = 20
const at = (v) => (v - 1) / (RATE_MAX - 1)
const posOf = (v) => `calc(${GX + 22}px + (100% - ${2 * GX + 44}px) * ${at(v)})`
const clampV = (v) => Math.min(RATE_MAX, Math.max(1, v))
export function HorizonScale({ value = null, onChange, label, ends = [], was = null, sky = false }) {
  const trackRef = useRef(null)
  const drag = useRef(null)
  const last = useRef(value)
  last.current = value
  const set = (v) => {
    const x = clampV(v)
    if (x === last.current) return
    last.current = x
    onChange?.(x)
    haptic('tick')
  }
  const fromX = (clientX) => {
    const r = trackRef.current?.getBoundingClientRect?.()
    if (!r || !r.width || !Number.isFinite(clientX)) return null
    return clampV(Math.round(1 + ((clientX - r.left - GX - 22) / Math.max(1, r.width - 2 * GX - 44)) * (RATE_MAX - 1)))
  }
  // Dokunulan durak (data-v) varsa o; yoksa dokunulan yerin en yakın durağı
  const fromTarget = (t, stop) => {
    for (let n = t; n && n !== stop; n = n.parentNode) {
      const v = n.getAttribute?.('data-v')
      if (v) return Number(v)
    }
    return null
  }
  // Seçim parmak kalkınca (ya da yatay sürüklerken) olur: dikey kaydırmaya başlayan dokunuş (pointercancel) seçim yapmaz
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, moved: false }
    try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch { /* yakalama yoksa sürükleme yalnız çizgide */ }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || (!d.moved && Math.abs(e.clientX - d.x) < 4)) return
    d.moved = true
    const v = fromX(e.clientX)
    if (v != null) set(v)
  }
  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const v = fromX(e.clientX)
    if (v != null) set(v)
  }
  const onPointerCancel = () => { drag.current = null }
  const onClick = (e) => {
    const v = fromTarget(e.target, e.currentTarget) ?? fromX(e.clientX)
    if (v != null) set(v)
  }
  // Seçim yokken artır 1'den, azalt 10'dan başlar (ölçeğin ortasından değil: ortadaki sayı öne çıkmasın)
  const onKeyDown = (e) => {
    const k = e.key
    const cur = last.current
    let v = null
    if (k === 'ArrowRight' || k === 'ArrowUp') v = cur == null ? 1 : cur + 1
    else if (k === 'ArrowLeft' || k === 'ArrowDown') v = cur == null ? RATE_MAX : cur - 1
    else if (k === 'Home') v = 1
    else if (k === 'End') v = RATE_MAX
    else if (k === 'PageUp') v = cur == null ? 1 : cur + 3
    else if (k === 'PageDown') v = cur == null ? RATE_MAX : cur - 3
    if (v == null) return
    e.preventDefault?.()
    set(v)
  }
  const has = value != null
  const endText = (v) => (v === 1 ? ends[0] : v === RATE_MAX ? ends[1] : null)
  return (
    <div className={`yg-hz${has ? ' has' : ''}`}>
      <div className="yg-hz-ends" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></div>
      <div
        ref={trackRef}
        className="yg-hz-track"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={RATE_MAX}
        aria-valuenow={has ? value : undefined}
        aria-valuetext={has ? [value, endText(value)].filter(Boolean).join(', ') : undefined}
        style={{ '--at': has ? posOf(value) : '50%' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {sky && <Scene mood="before" className="yg-hz-sky" />}
        {sky && <span className="yg-hz-sea" aria-hidden="true" />}
        <span className="yg-hz-glow" />
        <span className="yg-hz-line" />
        {Array.from({ length: RATE_MAX }, (_, k) => k + 1).map((v) => (
          <span key={v} className="yg-hz-stop" data-v={v} style={{ left: posOf(v), '--k': `${Math.round(30 + at(v) * 70)}%`, '--s': `${(14 + at(v) * 8).toFixed(1)}px` }} />
        ))}
        {has && was != null && <span className={`yg-hz-was${was === value ? ' same' : ''}`} style={{ left: posOf(was) }} />}
        {has && <span className="yg-hz-thumb" style={{ left: posOf(value) }}>{value}</span>}
      </div>
      <div className="yg-hz-nums" aria-hidden="true">
        {Array.from({ length: RATE_MAX }, (_, k) => k + 1).map((v) => (
          <span key={v} className={v === value ? 'on' : undefined} style={{ left: posOf(v) }}>{v}</span>
        ))}
      </div>
    </div>
  )
}

// ---- Hazırlık simgeleri (lucide çizgisinde: 24 ızgara, 2 px, yuvarlak uç): örtü, yastık, yüzey ----
const PREP_PATHS = {
  blanket: (
    <>
      <path d="M3 7.5c3-1.6 6 1.6 9 0s6-1.6 9 0v9c-3-1.6-6 1.6-9 0s-6-1.6-9 0z" />
      <path d="M3 12c3-1.6 6 1.6 9 0s6-1.6 9 0" opacity=".45" />
    </>
  ),
  pillow: (
    <>
      <path d="M3.5 9.5C3.5 7 5.6 5.6 8 6.3c2.6.7 5.4.7 8 0 2.4-.7 4.5.7 4.5 3.2 0 1-.3 1.7-.3 2.5s.3 1.5.3 2.5c0 2.5-2.1 3.9-4.5 3.2-2.6-.7-5.4-.7-8 0-2.4.7-4.5-.7-4.5-3.2 0-1 .3-1.7.3-2.5s-.3-1.5-.3-2.5z" />
      <path d="M8 12c2.7.6 5.3.6 8 0" opacity=".45" />
    </>
  ),
  mat: (
    <>
      <path d="M2.5 16 6.5 9h15l-4 7z" />
      <path d="M2.5 16v1.8h15l4-7V9" />
    </>
  ),
}
export function PrepIcon({ kind, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PREP_PATHS[kind] ?? PREP_PATHS.mat}
    </svg>
  )
}
// Hazırlık maddesinin simgesi: sözcükten (örtü, yastık, yüzey); bilinmeyen madde düz yüzey simgesi alır
export const prepKind = (t = '') => (/örtü|battaniye/i.test(t) ? 'blanket' : /yastık/i.test(t) ? 'pillow' : 'mat')
// Son iki sözcük birlikte kırılır ("İnce / bir örtü", "İnce bir / örtü" değil; 1. değerlendirici). Metin aynı: yalnız
// boşluk bölünmez boşluk olur.
export const glueLast = (s = '') => s.replace(/ (\S+)$/, ' $1')
