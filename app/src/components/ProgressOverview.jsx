import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtSteps } from '../lib/health.js'
import { ChevronRight, TriangleAlert, OctagonAlert, ArrowLeft } from 'lucide-react'
import { domainSummary, DOMAIN_LABEL, effectWeeks } from '../lib/progress.js'
import { growthMap, calendarDays, WINDOW_DAYS } from '../lib/dataHub.js'
import { dayKey } from '../lib/calendar.js'
import { loadHubHabits } from '../lib/alarmLog.js'
import { IRIS_ORDER } from '../lib/iris.js'
import { registry } from '../modules/registry.js'
import { STRESS_NOW, SELF_AGREE } from '../lib/profile.js'
import { who5Text } from '../lib/who5.js'
import IrisMap from './IrisMap.jsx'
import { decimalTr } from '../lib/stats.js'
import { EYE_LABEL } from '../lib/vaSeries.js'
import { SourceList } from './Sources.jsx'
import ExportCard from './ExportCard.jsx'
import WarningSigns from './WarningSigns.jsx'
import { setupText } from '../lib/setupText.js'
import '../styles/progress2.css'

const SAFETY = setupText().safety

// Gelişim 2.0 (Artifact "Gelişim Taslağı", onaylı): üstte göz uyarısı, altında alan kutucukları.
// Gelişim haritası (Artifact "Nefona Gelişim Haritası", onaylı): kutucukların yerine iris haritası + 7 satır; veriler
// veri merkezinden (lib/dataHub.js growthMap). Dilim doluluğu = son 28 günde kayıtlı gün; dış yay = doğrulanmış değişim.
// Kutucuğa dokununca alan ayrıntısı: metrik eğilimleri, oturum öncesi→sonrası etkileri, yöntem ve kaynak.
// Veriler modüllerin progress tanımından gelir (modules/registry.js): yeni modül kendiliğinden görünür.

const ORDER = ['eye', 'wellbeing', 'self', 'awareness', 'calm', 'focus', 'body']
const SOURCES_OF = { eye: ['faes2021', 'joseph2023', 'katibeh2022', 'han2019'], wellbeing: ['topp2015', 'eser2019', 'zhang2025'], body: ['paluch2022', 'paluch2022cvd', 'dunstan2012'] }

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

// Etkinin haftalara göre seyri (en az iki haftada oturum varsa)
function EffectWeeks({ e, sessions }) {
  const def = useMemo(() => registry.effects().find((x) => x.key === e.key && x.module === e.module), [e.key, e.module])
  const pts = useMemo(() => (def ? effectWeeks(sessions, def) : []), [def, sessions])
  if (pts.length < 2) return null
  return (
    <>
      <Sparkline points={pts.map((p) => ({ date: p.date, value: p.value }))} format={(v) => signed(v)} height={100} ariaLabel={`${e.label}: haftalara göre ortalama fark`} />
      <p className="muted small">Haftalara göre ortalama fark (son 6 haftada oturumu olan {pts.length} hafta).</p>
    </>
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

export default function ProgressOverview({ tests, sessions, profile = null, identity = null, health = null, onOpen, reportDay = null, onReport }) {
  const now = new Date()
  const dom = useMemo(() => domainSummary({ tests, sessions, now }), [tests, sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  const eye = dom.eye.eye
  // Beden: Apple Sağlık adımları (izin + veri varsa); yoksa boş sayılır
  const bodyTile = health?.hasData ? { value: fmtSteps(health.today?.steps), unit: ' adım', sub: health.avgSteps ? `7 gün ort. ${fmtSteps(health.avgSteps)}` : 'bugün', status: null } : null
  const tiles = ORDER.map((k) => ({ k, d: dom[k], t: k === 'body' ? bodyTile : tileOf(dom[k]) }))
  const empty = tiles.filter((x) => !x.t)
  return (
    <section className="p2" aria-label="Genel bakış">
      {eye?.alert && (
        <div className={`card p2-alert ${eye.alert}`} role="alert">
          <span className="p2-alert-h">{eye.alert === 'red' ? <OctagonAlert size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />} {eye.alert === 'red' ? 'Göz doktoruna git' : 'Dikkat'} · {EYE_LABEL[eye.eye]}</span>
          <p>{eye.message}</p>
          <details className="p2-signs">
            <summary>{SAFETY.alertMore}</summary>
            <p className="small">{SAFETY.infoSub}</p>
            <WarningSigns compact label={SAFETY.alertMore} />
          </details>
          <button type="button" className="btn btn-sm" onClick={() => onOpen('eye')}>Ayrıntı ve kural</button>
        </div>
      )}
      {reportDay >= 5 && reportDay <= 21 && onReport && (
        <button type="button" className="p2-report" onClick={onReport}>
          <span><b>İlk günlerinin raporu</b><small>Düzen, uygulamalardan sonraki değişim, ölçümler</small></span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
      <GrowthMap tests={tests} sessions={sessions} profile={profile} tiles={Object.fromEntries(tiles.map((x) => [x.k, x.t]))} onOpen={onOpen} />
      {empty.some((x) => x.k === 'body') && <p className="p2-empty">Adımların Beden alanına eklensin istersen: Profilim → İzinlerim → Apple Sağlık.</p>}
      <ExportCard tests={tests} sessions={sessions} identity={identity} />
    </section>
  )
}

// Kutunun genişliği (harita çizimi piksel ister; ekran genişliğine göre) ve kutunun iki yanındaki boşluk
// (etiketler ekran kenar boşluğuna taşabilir, ekran dışına taşamaz)
function useBoxWidth(max = 340) {
  const ref = useRef(null)
  const [w, setW] = useState({ box: max, side: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const on = () => {
      const box = Math.min(max, Math.round(el.clientWidth || max))
      const r = el.getBoundingClientRect?.()
      const vw = globalThis.innerWidth || 0
      // kutunun solundaki ve sağındaki boşluğun küçüğü (ekran kenarına 6 px kala)
      const side = r && vw ? Math.max(0, Math.min(r.left, vw - r.right) - 6) : 0
      setW((o) => (o.box === box && o.side === side ? o : { box, side }))
    }
    on()
    if (typeof ResizeObserver !== 'function') return undefined
    const ro = new ResizeObserver(on)
    ro.observe(el)
    return () => ro.disconnect()
  }, [max])
  return [ref, w.box, w.side]
}
// Etiketin yarı genişliği (en geniş: "Farkındalık"); dar ekranda iris küçülür, etiket ekranda kalır
const LBL_HALF = 38

const STATUS_WORD = { up: 'iyileşiyor', down: 'geriliyor' }
// Ölçüsü olmayan satır: son başlangıç/28. gün cevabı varsa o, yoksa kayıtlı gün sayısı
function rowLine(x, isRecent) {
  const a = isRecent ? x.summary?.answers?.[0] : null
  const p = a?.series?.at(-1)
  if (p) return a.key === 'blinks' ? `İlk Bakış: 20 sn'de ${p.value} kırpma` : `${a.label}: ${ANSWER_TEXT[a.key]?.(p.value) ?? p.value}`
  return x.days ? `${x.days} gün kayıt` : 'Henüz kayıt yok'
}
function Days28({ strip, label }) {
  return (
    <span className="gm-bar" role="img" aria-label={label}>
      {strip.map((on, i) => <i key={i} className={on ? 'on' : ''} />)}
    </span>
  )
}

export function GrowthMap({ tests, sessions, profile, tiles = {}, onOpen }) {
  const now = new Date()
  const habits = useMemo(() => loadHubHabits(), [sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  const today = dayKey(now) // gece yarısı geçince pencere kayar
  const recent = useMemo(() => growthMap({ tests, sessions, profile, habits, now }), [tests, sessions, profile, habits, today]) // eslint-disable-line react-hooks/exhaustive-deps
  const first = useMemo(() => (recent.canCompare ? growthMap({ tests, sessions, profile, habits, now, window: 'first' }) : null), [recent]) // eslint-disable-line react-hooks/exhaustive-deps
  const [win, setWin] = useState('recent')
  const map = win === 'first' && first ? first : recent
  const isRecent = map === recent
  const winLabel = isRecent ? `Son ${WINDOW_DAYS} günde` : `İlk ${WINDOW_DAYS} günde`
  const [ref, box, side] = useBoxWidth(340)
  const rx = Math.min(box * 0.43, box / 2 + side - LBL_HALF) // etiketlerin yatay yarıçapı
  const ry = box * 0.43
  const size = Math.round(Math.min(box * 0.64, 2 * (rx - LBL_HALF - 4)))
  const frac = IRIS_ORDER.map((d) => map.domains[d].frac)
  const marks = map === recent ? IRIS_ORDER.map((d) => recent.domains[d].status) : null
  const withData = IRIS_ORDER.filter((d) => recent.domains[d].days > 0).length
  return (
    <section className="gm" aria-label="Gelişim haritası">
      {first && (
        <div className="gm-seg" role="group" aria-label="Harita penceresi">
          <button type="button" aria-pressed={win === 'first'} onClick={() => setWin('first')}>İlk {WINDOW_DAYS} gün</button>
          <button type="button" aria-pressed={win === 'recent'} onClick={() => setWin('recent')}>Son {WINDOW_DAYS} gün</button>
        </div>
      )}
      <div className="gm-iris" ref={ref} style={{ height: box }}>
        <IrisMap size={size} frac={frac} marks={marks} label={`Gelişim haritası: ${withData} alanda kayıt var`} />
        {recent.sinceStart > 0 && <span className="gm-day" aria-hidden="true"><b>{recent.sinceStart}</b><small>GÜN</small></span>}
        {IRIS_ORDER.map((d, i) => {
          const a = (i * Math.PI * 2) / IRIS_ORDER.length
          const st = map === recent ? recent.domains[d].status : null
          return (
            <span key={d} className={`gm-lbl${st ? ` ${st}` : ''}`} style={{ left: box / 2 + Math.sin(a) * rx, top: box / 2 - Math.cos(a) * ry }}>
              <b>{d === 'self' ? <>Kendine<br />yaklaşım</> : DOMAIN_LABEL[d]}</b>
              <small>{map.domains[d].days}/{WINDOW_DAYS}</small>
            </span>
          )
        })}
      </div>
      <p className="gm-legend">
        <span><i className="fill" />düzen ({WINDOW_DAYS} gün)</span>
        <span><i className="up" />iyileşiyor</span>
        <span><i className="down" />geriliyor</span>
      </p>
      <div className="card gm-rows">
        {IRIS_ORDER.map((d) => {
          const x = map.domains[d]
          const t = isRecent ? tiles[d] : null
          const line = t ? `${t.value}${t.unit ? (t.unit.startsWith('/') ? t.unit : ` ${t.unit.trim()}`) : ''}${t.sub ? ` · ${t.sub}` : ''}` : rowLine(x, isRecent)
          return (
            <button key={d} type="button" className="gm-row" onClick={() => onOpen(d)}>
              <span className="n">{DOMAIN_LABEL[d]}{isRecent && x.status ? <span className={`gm-dot ${x.status}`} role="img" aria-label={STATUS_WORD[x.status]} /> : null}</span>
              <span className="m">{line}</span>
              <span className="r">
                {t?.status?.text ? <Pill s={t.status} /> : null}
                <Days28 strip={x.strip} label={`${winLabel} ${x.days} gün kayıt`} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// Alan ayrıntısı: düzen şeridi, soru cevapları (1. ve 28. gün), bu alanı besleyen kayıtlar
const ANSWER_TEXT = {
  blinks: (v) => `${v} kırpma`,
  stressNow: (v) => STRESS_NOW[v] ?? String(v),
  selfCompassion: (v) => SELF_AGREE[v] ?? String(v),
  sleep: (v) => `${v} / 10`,
  activityDays: (v) => `${v} gün`,
}
const dayOf = (iso, start) => (start ? calendarDays(start, iso) + 1 : null)
function DomainRegularity({ domain, tests, sessions, profile }) {
  const habits = useMemo(() => loadHubHabits(), [sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  const today = dayKey(new Date())
  const map = useMemo(() => growthMap({ tests, sessions, profile, habits, now: new Date() }), [tests, sessions, profile, habits, today])
  const x = map.domains[domain]
  const answers = x.summary?.answers ?? []
  const start = answers[0]?.series?.[0]?.date ?? null
  return (
    <>
      <section className="card p2-card gm-detail">
        <span className="eyebrow">Düzen · son {WINDOW_DAYS} gün</span>
        <p className="p2-msg"><b>{x.days} / {WINDOW_DAYS} gün</b>{x.status ? <> · <Pill s={{ text: STATUS_WORD[x.status], tone: x.status === 'up' ? 'ok' : 'warn' }} /></> : null}</p>
        <span className="gm-strip" role="img" aria-label={`Son ${WINDOW_DAYS} günde ${x.days} gün kayıt`}>
          {x.strip.map((on, i) => <i key={i} className={`${on ? 'on' : ''}${i === x.strip.length - 1 ? ' today' : ''}`} />)}
        </span>
        <p className="muted small">Her kare bir gün; soldan sağa, üst satırdan alta. Çerçeveli kare bugün. Dolu kare: o gün bu alanda bir kaydın var.</p>
        {x.sources.length > 0 && (
          <div className="gm-src" aria-label="Bu alanı besleyen kayıtlar">
            {x.sources.map((s) => <div key={s.key}><span>{s.label}</span><em>{s.n} kayıt</em></div>)}
          </div>
        )}
      </section>
      {answers.map((a) => (
        <section key={a.key} className="card p2-card">
          <span className="eyebrow">Soru · {a.label}</span>
          <div className="gm-ans">
            {a.series.map((p) => (
              <div key={p.date}><small>{dayOf(p.date, start) ? `${dayOf(p.date, start)}. gün` : ''}</small><span>{ANSWER_TEXT[a.key]?.(p.value) ?? p.value}</span></div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

const LOGMAR = (v) => decimalTr(v, 2)
export function DomainDetail({ domain, tests, sessions, profile = null, identity = null, health = null, onBack, onStart }) {
  const now = new Date()
  const d = useMemo(() => domainSummary({ tests, sessions, now })[domain], [tests, sessions, domain]) // eslint-disable-line react-hooks/exhaustive-deps
  const srcs = SOURCES_OF[domain] ?? []
  return (
    <main className="screen fade-in p2-detail">
      <div className="row">
        <button type="button" className="btn-icon" onClick={onBack} aria-label="Geri"><ArrowLeft size={20} /></button>
      </div>
      <header className="page-header"><span className="eyebrow">Gelişim</span><h1>{d.label}</h1></header>
      <DomainRegularity domain={domain} tests={tests} sessions={sessions} profile={profile} />

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
            <p className="p2-msg"><Pill s={metricStatus(d.who5)} /> Son puan {d.who5.last}{d.who5.delta != null ? ` (${signed(d.who5.delta, 0)})` : ''}. {who5Text().meaningful}{d.who5.low ? ` ${who5Text().low}` : ''}</p>
          ) : (
            <p className="p2-msg">5 soruluk iyi oluş ölçeği (WHO-5): son iki haftanı 1 dakikada değerlendir. 14 günde bir sorulur.</p>
          )}
          {onStart && (d.who5.due ? (
            <button type="button" className="btn btn-sm" onClick={() => onStart('who5')}>{d.who5.n ? 'Yeniden yanıtla' : 'Yanıtla'} · 5 soru</button>
          ) : (
            <p className="muted small">Sonraki ölçüm {d.who5.nextInDays} gün sonra.</p>
          ))}
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
              <EffectWeeks e={e} sessions={sessions} />
            </div>
          ))}
          <p className="muted small">Kontrol grubu yok: bir kısmı beklenti ya da yalnızca mola vermenin etkisi olabilir. "Belirgin" için en az 3 oturum ve güven aralığının sıfırı içermemesi gerekir.</p>
        </section>
      )}

      {domain === 'body' && (
        <section className="card p2-card">
          <span className="eyebrow">Apple Sağlık · son 7 gün</span>
          {health?.hasData ? (
            <>
              <p className="p2-msg">
                Bugün <b>{fmtSteps(health.today?.steps)}</b> adım{health.today?.exerciseMin ? `, ${health.today.exerciseMin} dk egzersiz` : ''}
                {health.avgSteps ? ` · önceki günlerin ortalaması ${fmtSteps(health.avgSteps)}` : ''}.
              </p>
              <Sparkline points={health.rows.map((r) => ({ date: r.date, value: r.steps }))} format={(v) => fmtSteps(v)} ariaLabel="Günlük adım, son 7 gün" />
              <p className="muted small">Araştırmalarda günlük adım arttıkça risk azalıyor ve 60 yaş üstünde ~6–8 bin, altında ~8–10 bin adımda düzleşiyor (gözlemsel; neden-sonuç göstermez). Uzun oturmayı kısa yürüyüşle bölmek küçük bir deneyde yemek sonrası şekeri düşürdü.</p>
            </>
          ) : (
            <p className="p2-msg">{health ? 'Apple Sağlık\'tan veri gelmedi. iPhone Ayarlar → Sağlık → Veri Erişimi → Nefona\'da okuma izinlerini aç.' : 'Adım, yürüme mesafesi ve egzersiz dakikası izninle Apple Sağlık\'tan okunur: Profilim → İzinlerim → Apple Sağlık.'}</p>
          )}
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
