import { useMemo } from 'react'
import { ChevronRight, TriangleAlert, OctagonAlert, ArrowLeft } from 'lucide-react'
import { domainSummary, DOMAIN_LABEL } from '../lib/progress.js'
import { decimalTr } from '../lib/stats.js'
import { EYE_LABEL } from '../lib/vaSeries.js'
import { SourceList } from './Sources.jsx'
import ExportCard from './ExportCard.jsx'
import '../styles/progress2.css'

// Gelişim 2.0 (Artifact "Gelişim Taslağı", onaylı): üstte göz uyarısı, altında alan kutucukları.
// Kutucuğa dokununca alan ayrıntısı: metrik eğilimleri, oturum öncesi→sonrası etkileri, yöntem ve kaynak.
// Veriler modüllerin progress tanımından gelir (modules/registry.js): yeni modül kendiliğinden görünür.

const ORDER = ['eye', 'wellbeing', 'self', 'awareness', 'calm', 'focus', 'body']
const SOURCES_OF = { eye: ['faes2021', 'joseph2023', 'katibeh2022', 'han2019'], wellbeing: ['topp2015', 'eser2019', 'zhang2025'], body: ['paluch2022'] }

const num = (v, d = 1) => (Number.isFinite(v) ? decimalTr(v, d) : '–')
const signed = (v, d = 1) => (Number.isFinite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${decimalTr(Math.abs(v), d)}` : '–')

// Etiket: metin + ton. Metrik (better/worse/noise/unsure/first), etki (sig), göz (alert/phase)
export function metricStatus(c) {
  switch (c?.status) {
    case 'better': return { text: 'iyileşiyor', tone: 'ok' }
    case 'worse': return { text: 'geriliyor', tone: 'warn' }
    case 'noise': return { text: 'doğal oynama', tone: 'muted' }
    case 'unsure': return { text: 'henüz belirsiz', tone: 'muted' }
    case 'first': return { text: 'ilk ölçüm', tone: 'muted' }
    case 'up': return { text: 'anlamlı artış', tone: 'ok' }
    case 'down': return { text: 'anlamlı düşüş', tone: 'warn' }
    default: return { text: '', tone: 'muted' }
  }
}
export const effectStatus = (e) => (e.sig ? (e.gain > 0 ? { text: 'belirgin iyileşme', tone: 'ok' } : { text: 'belirgin kötüleşme', tone: 'warn' }) : { text: 'henüz belirsiz', tone: 'muted' })
const PHASE = { familiarization: 'alışma dönemi', baseline: 'başlangıç oluşuyor', empty: 'henüz ölçüm yok' }
export function eyeStatus(e) {
  if (e.alert === 'red') return { text: 'doktora git', tone: 'danger' }
  if (e.alert === 'yellow') return { text: 'dikkat', tone: 'warn' }
  if (PHASE[e.phase]) return { text: PHASE[e.phase], tone: 'muted' }
  if (e.trend === 'improving') return { text: 'iyileşiyor', tone: 'ok' }
  return { text: 'doğrulanmış değişim yok', tone: 'muted' } // kural "sabit" demez (lib/trend.js trendMessage)
}

function Pill({ s }) {
  return s?.text ? <span className={`p2-pill ${s.tone}`}>{s.text}</span> : null
}

// Tek seri eğilim çizgisi (dataviz: 2px çizgi, halkalı son nokta, tek seride lejant yok, değer yalnız sonda)
export function Sparkline({ points = [], better = 'up', format = (v) => num(v), band = null, height = 120, ariaLabel }) {
  const W = 300
  const H = height
  const L = 34
  const R = 12
  const T = 12
  const B = 18
  if (points.length < 2) return null
  const vals = points.map((p) => p.value)
  let lo = Math.min(...vals, ...(band ? [band[0]] : []))
  let hi = Math.max(...vals, ...(band ? [band[1]] : []))
  if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.12
  lo -= pad
  hi += pad
  const inv = better === 'down' // düşük daha iyi → ters eksen, "yukarı = daha iyi"
  const x = (i) => L + (i / (points.length - 1)) * (W - L - R)
  const y = (v) => (inv ? T + ((v - lo) / (hi - lo)) * (H - T - B) : T + (1 - (v - lo) / (hi - lo)) * (H - T - B))
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('')
  const last = points.at(-1)
  const ticks = [inv ? hi - pad : lo + pad, inv ? lo + pad : hi - pad]
  const fmtDay = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  return (
    <svg className="p2-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" />
          <text x={L - 5} y={y(v) + 3} textAnchor="end" className="tick">{format(v)}</text>
        </g>
      ))}
      {band && <rect x={L} width={W - L - R} y={Math.min(y(band[0]), y(band[1]))} height={Math.abs(y(band[1]) - y(band[0]))} className="band" />}
      <path d={d} className="line" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4.5 : 3} className={i === points.length - 1 ? 'end' : 'dot'}>
          <title>{`${fmtDay(p.date)} · ${format(p.value)}`}</title>
        </circle>
      ))}
      <text x={x(points.length - 1) - 8} y={y(last.value) - 9} textAnchor="end" className="endlbl">{format(last.value)}</text>
      <text x={L} y={H - 4} className="tick">{fmtDay(points[0].date)}</text>
      <text x={W - R} y={H - 4} textAnchor="end" className="tick">{fmtDay(last.date)}</text>
    </svg>
  )
}

// Önce → sonra (iki nokta ve bağlayan çizgi)
function Dumbbell({ e }) {
  const W = 300
  const L = 16
  const R = 16
  const yy = 26
  const lo = e.max === 5 ? 1 : 0
  const x = (v) => L + ((v - lo) / (e.max - lo)) * (W - L - R)
  return (
    <svg className="p2-dumb" viewBox={`0 0 ${W} 52`} role="img" aria-label={`${e.measure}: önce ${num(e.before)}, sonra ${num(e.after)}`}>
      <line x1={x(lo)} x2={x(e.max)} y1={yy} y2={yy} className="grid" />
      <line x1={x(e.before)} x2={x(e.after)} y1={yy} y2={yy} className="line" />
      <circle cx={x(e.before)} cy={yy} r={5} className="pre" />
      <circle cx={x(e.after)} cy={yy} r={5} className="end" />
      <text x={x(e.before)} y={yy - 10} textAnchor="middle" className="tick">önce {num(e.before)}</text>
      <text x={x(e.after)} y={yy + 20} textAnchor="middle" className="endlbl">sonra {num(e.after)}</text>
      <text x={x(lo)} y={48} className="tick">{lo}</text>
      <text x={x(e.max)} y={48} textAnchor="end" className="tick">{e.max}</text>
    </svg>
  )
}

// Kutucuğun ana değeri: göz → logMAR; iyi oluş → WHO-5; diğer → en çok ölçülen metrik ya da etki
function tileOf(d) {
  if (d.domain === 'eye') {
    const e = d.eye
    if (!e?.eye) return null
    const v = e.current7 ?? e.last
    return { value: num(v, 2), unit: 'logMAR', sub: EYE_LABEL[e.eye], status: eyeStatus(e) }
  }
  if (d.domain === 'wellbeing' && d.who5?.n) {
    const w = d.who5
    return { value: String(w.last), unit: '/100', sub: 'WHO-5', delta: w.delta, status: metricStatus(w) }
  }
  const m = [...d.metrics].sort((a, b) => b.n - a.n)[0]
  const e = [...d.effects].sort((a, b) => b.n - a.n)[0]
  if (m && (!e || m.n >= e.n)) return { value: num(m.last, m.unit === '/5' ? 1 : 0), unit: m.unit, sub: m.label, status: metricStatus(m) }
  if (e) return { value: signed(e.gain), unit: e.measure, sub: `${e.label} sonrası`, status: effectStatus(e) }
  return null
}

export default function ProgressOverview({ tests, sessions, identity = null, onOpen, reportDay = null, onReport }) {
  const now = new Date()
  const dom = useMemo(() => domainSummary({ tests, sessions, now }), [tests, sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  const eye = dom.eye.eye
  const tiles = ORDER.map((k) => ({ k, d: dom[k], t: tileOf(dom[k]) }))
  const withData = tiles.filter((x) => x.t)
  const empty = tiles.filter((x) => !x.t)
  return (
    <section className="p2" aria-label="Genel bakış">
      {eye?.alert && (
        <div className={`card p2-alert ${eye.alert}`} role="alert">
          <span className="p2-alert-h">{eye.alert === 'red' ? <OctagonAlert size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />} {eye.alert === 'red' ? 'Göz doktoruna git' : 'Dikkat'} · {EYE_LABEL[eye.eye]}</span>
          <p>{eye.message}</p>
          <button type="button" className="btn btn-sm" onClick={() => onOpen('eye')}>Ayrıntı ve kural</button>
        </div>
      )}
      {reportDay >= 5 && reportDay <= 21 && onReport && (
        <button type="button" className="p2-report" onClick={onReport}>
          <span><b>İlk günlerinin raporu</b><small>Düzen, uygulamalardan sonraki değişim, ölçümler</small></span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
      {withData.length > 0 && (
        <div className="p2-tiles">
          {withData.map(({ k, t }) => (
            <button key={k} type="button" className="p2-tile" onClick={() => onOpen(k)}>
              <span className="l">{DOMAIN_LABEL[k]}</span>
              <span className="v">{t.value}<small>{t.unit}</small></span>
              <span className="s">{t.sub}</span>
              <Pill s={t.status} />
            </button>
          ))}
        </div>
      )}
      {empty.length > 0 && (
        <p className="p2-empty">
          Henüz verisi olmayan: {empty.map((x) => DOMAIN_LABEL[x.k]).join(', ')}.
          {empty.some((x) => x.k === 'body') ? ' Beden verileri için Apple Sağlık bağlantısı yakında.' : ''}
        </p>
      )}
      <ExportCard tests={tests} sessions={sessions} identity={identity} />
    </section>
  )
}

const LOGMAR = (v) => decimalTr(v, 2)
export function DomainDetail({ domain, tests, sessions, identity = null, onBack }) {
  const now = new Date()
  const d = useMemo(() => domainSummary({ tests, sessions, now })[domain], [tests, sessions, domain]) // eslint-disable-line react-hooks/exhaustive-deps
  const srcs = SOURCES_OF[domain] ?? []
  return (
    <main className="screen fade-in p2-detail">
      <div className="row">
        <button type="button" className="btn-icon" onClick={onBack} aria-label="Geri"><ArrowLeft size={20} /></button>
      </div>
      <header className="page-header"><span className="eyebrow">Gelişim</span><h1>{d.label}</h1></header>

      {domain === 'eye' && d.eye && (
        <section className="card p2-card">
          <span className="eyebrow">{d.eye.eye ? `${EYE_LABEL[d.eye.eye]} · logMAR (yukarı = daha iyi)` : 'Görme keskinliği'}</span>
          {d.eye.series?.length > 1 && (
            <Sparkline
              points={d.eye.series.map((p) => ({ date: p.date, value: p.logMAR }))}
              better="down"
              format={LOGMAR}
              band={d.eye.baseline != null ? [d.eye.baseline - 0.1, d.eye.baseline + 0.1] : null}
              ariaLabel="Görme keskinliği eğilimi"
            />
          )}
          {d.eye.baseline != null && (
            <div className="p2-kv">
              <div><b>{LOGMAR(d.eye.baseline)}</b><span>başlangıç</span></div>
              <div><b>{d.eye.current7 != null ? LOGMAR(d.eye.current7) : '–'}</b><span>son 7 gün</span></div>
              <div><b>{d.eye.delta != null ? signed(d.eye.delta, 2) : '–'}</b><span>değişim</span></div>
            </div>
          )}
          <p className="p2-msg"><Pill s={eyeStatus(d.eye)} /> {d.eye.message}</p>
          <div className="p2-rule">
            <p><b className="warn">Sarı:</b> son 7 günün ortancası başlangıçtan en az 0,10 kötü ve art arda 3 test kötü → birkaç gün daha ölç.</p>
            <p><b className="danger">Kırmızı:</b> bir hafta boyunca her test en az 0,20 kötü → göz doktoruna git.</p>
            <p>Ani görme kaybı, perde inmesi, ışık çakması ya da ağrı: beklemeden başvur.</p>
            <p className="muted small">Gri bant: başlangıç değerin ±0,10 logMAR. Bu tek testin oynaması değil, değişim eşiği: son 7 günün ortancası başlangıçtan en az 0,10 uzaklaşır ve son 3 testin her biri de aynı yönde en az 0,10 farklıysa değişim olarak işaretliyoruz. Noktalar tek testlerdir; bir noktanın bandın dışına düşmesi tek başına değişim demek değil (bir testten diğerine yaklaşık ±0,2 oynama olağan). İlk 7 gün alışma; başlangıç 8. günden itibaren en az 7 test (en erken 21. güne kadar); değerlendirme sonra başlar.</p>
          </div>
        </section>
      )}

      {domain === 'wellbeing' && (
        <section className="card p2-card">
          <span className="eyebrow">WHO-5 iyi oluş · 0–100 · 14 günde bir</span>
          {d.who5.n > 1 && <Sparkline points={d.who5.series.map((p) => ({ date: p.date, value: p.score }))} format={(v) => String(Math.round(v))} ariaLabel="WHO-5 eğilimi" />}
          {d.who5.n > 0 ? (
            <p className="p2-msg"><Pill s={metricStatus(d.who5)} /> Son puan {d.who5.last}{d.who5.delta != null ? ` (${signed(d.who5.delta, 0)})` : ''}. 10 puan ve üstü değişim klinik olarak anlamlı sayılır.{d.who5.low ? ' 52 altı: düşük iyi oluş — tanı değil; sürerse bir uzmanla konuşmak iyi gelebilir.' : ''}</p>
          ) : (
            <p className="p2-msg">5 soruluk iyi oluş ölçeği yakında burada: son iki haftanı 1 dakikada değerlendir. (Resmî Türkçe çevirisi eklenince açılacak.)</p>
          )}
        </section>
      )}

      {d.metrics.map((m) => (
        <section key={m.key} className="card p2-card">
          <span className="eyebrow">{m.label} · {m.unit}{m.better === 'down' ? ' (düşük daha iyi)' : ''}</span>
          <Sparkline points={m.series} better={m.better} format={(v) => num(v, m.unit === '/5' ? 1 : 0)} ariaLabel={`${m.label} eğilimi`} />
          <p className="p2-msg">
            <Pill s={metricStatus(m)} /> {m.n} ölçüm.{' '}
            {m.method === 'halves' && `İlk yarı ${num(m.first)} → son yarı ${num(m.last)} (fark ${signed(m.delta)}, %95 GA ${num(m.lo)} – ${num(m.hi)}).`}
            {m.method === 'too-few' && `Değerlendirme için en az 6 ölçüm gerekir.`}
            {m.method === 'threshold' && `Değişim ${signed(m.delta)}; yayımlanmış eşikle karşılaştırıldı.`}
          </p>
        </section>
      ))}

      {d.effects.length > 0 && (
        <section className="card p2-card">
          <span className="eyebrow">Oturum öncesi → sonrası</span>
          {d.effects.map((e) => (
            <div key={e.key} className="p2-eff">
              <p className="p2-eff-h"><b>{e.label}</b> · {e.measure}{e.better === 'down' ? ' (düşük daha iyi)' : ''} <Pill s={effectStatus(e)} /></p>
              <Dumbbell e={e} />
              <p className="muted small">{e.n} oturum · ortalama {e.better === 'down' ? 'azalma' : 'artış'} {num(e.gain)}{e.n >= 3 && e.lo != null ? ` (%95 GA ${num(e.lo)} – ${num(e.hi)})` : ''}.</p>
            </div>
          ))}
          <p className="muted small">Kontrol grubu yok: bir kısmı beklenti ya da yalnızca mola vermenin etkisi olabilir. "Belirgin" için en az 3 oturum ve güven aralığının sıfırı içermemesi gerekir.</p>
        </section>
      )}

      {domain === 'body' && (
        <section className="card p2-card">
          <span className="eyebrow">Apple Sağlık</span>
          <p className="p2-msg">Adım, egzersiz dakikası ve uyku süresi izninle Apple Sağlık'tan okunacak (sonraki güncelleme).</p>
        </section>
      )}

      {!d.metrics.length && !d.effects.length && domain !== 'eye' && domain !== 'wellbeing' && domain !== 'body' && (
        <p className="p2-empty">Bu alanda henüz ölçüm yok.</p>
      )}

      {domain === 'eye' && <ExportCard tests={tests} sessions={sessions} identity={identity} />}

      <section className="card p2-card p2-method">
        <span className="eyebrow">Yöntem</span>
        <p className="small">Yayımlanmış bir "anlamlı değişim" eşiği varsa o kullanılır. Yoksa en az 6 ölçümde ilk yarı ile son yarı karşılaştırılır; farkın %95 güven aralığı sıfırı içermiyorsa "iyileşiyor" ya da "geriliyor" denir, içeriyorsa "doğal oynama". Tek güne değil, eğilime bakılır.</p>
      </section>
      <SourceList ids={srcs} />
    </main>
  )
}
