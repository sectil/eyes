import { useMemo, useState } from 'react'
import {
  Activity,
  BookText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Eye,
  Flame,
  Gamepad2,
  Leaf,
  Play,
  ScanEye,
  ThumbsUp,
  TriangleAlert,
  Trophy,
} from 'lucide-react'
import ProgressChart from '../components/ProgressChart.jsx'
import { PageHeader } from '../components/ui.jsx'
import { analyzeTrend, trendMessage } from '../lib/trend.js'
import { snellen20 } from '../lib/optotype.js'
import { WEEKDAYS, dayKey, monthGrid, startOfWeek, weekProgress } from '../lib/calendar.js'
import { SETS, setDurationSec } from '../lib/routines.js'
import {
  NBSP,
  activitiesFrom,
  byDay,
  countedActivities,
  countsTowardGoal,
  dayLevel,
  decimalTr,
  formatDuration,
  monthTotals,
  summary,
} from '../lib/stats.js'
import '../styles/progress.css'

const EYES = [
  ['R', 'Sağ'],
  ['L', 'Sol'],
  ['OU', 'İki göz'],
]
const SET_ICONS = { leaf: Leaf, thumbs: ThumbsUp, dumbbell: Dumbbell }
const LITE_SET = SETS.find((s) => s.id === 'lite')

const nf = (n) => n.toLocaleString('tr-TR')
const monthIndex = (y, m) => y * 12 + m
const keyToDate = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
const fmtLongDay = (d) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })

function minutesLabel(sec) {
  if (!sec) return `0${NBSP}dk`
  const m = Math.round(sec / 60)
  return m < 1 ? `<1${NBSP}dk` : `${nf(m)}${NBSP}dk`
}

function iconFor(a) {
  if (a.type === 'routine') return SET_ICONS[SETS.find((s) => s.id === a.setId)?.icon] ?? Dumbbell
  if (a.type === 'blink') return Eye
  if (a.type === 'game') return Gamepad2
  if (a.type === 'reading') return BookText
  if (a.kind === 'test') return ScanEye
  return Activity
}

function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="pg-empty">
      <span className="pg-empty-icon"><Icon size={24} aria-hidden="true" /></span>
      <strong>{title}</strong>
      {children}
    </div>
  )
}

// ---------- Üst özet: büyük rakamlar + seri ----------
// days: oyun dışı aktivitelerin günleri (Map). weeklyTarget: Ana sayfa/Takvim ile aynı haftalık hedef.
function SummaryCard({ s, days, now, weeklyTarget }) {
  const tiles = [
    { id: 'total', Icon: Activity, value: nf(s.total), label: 'Aktivite' },
    { id: 'min', Icon: Clock, value: s.seconds > 0 && s.minutes < 1 ? '<1' : nf(s.minutes), label: 'Dakika' },
    { id: 'days', Icon: CalendarDays, value: nf(s.activeDays), label: 'Aktif gün' },
  ]
  // 0 puan rekor sayılmaz (Home rozeti ve SnakeGame '> 0' ile aynı)
  if (s.bestSnake > 0) tiles.push({ id: 'snake', Icon: Trophy, value: nf(s.bestSnake), label: 'Yılan rekoru' })
  if (s.bestTrack > 0) tiles.push({ id: 'track', Icon: Trophy, value: nf(s.bestTrack), label: 'Çember rekoru' })

  const todayKey = dayKey(now)
  const todayActive = days.has(todayKey)
  let hint
  if (!s.total) hint = 'İlk egzersizin, ilk günün olur.'
  else if (s.streakDays && todayActive) hint = 'Bugün de buradaydın.'
  else if (s.streakDays) hint = `Bugün de yaparsan ${s.streakDays + 1} gün olur.`
  else hint = 'Kısa bir egzersiz yeni seri başlatır.'

  const weekStart = startOfWeek(now)
  const week = WEEKDAYS.map((w, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const k = dayKey(d)
    return { ...w, k, on: days.has(k), today: k === todayKey }
  })
  // Ana sayfa ve Takvim "X/hedef" gösterir; aynı sayı ve payda burada da kullanılır.
  const goal = weekProgress(days, now, weeklyTarget)
  const weekLabel = goal.met ? `Hedef tamam · ${goal.done}${NBSP}gün` : `Bu hafta · ${goal.done}/${goal.target}${NBSP}gün`

  return (
    <section className="card card-hero pg-summary" aria-label="Özet">
      <div className={`pg-stats${tiles.length === 4 ? ' n4' : tiles.length === 5 ? ' n5' : ''}`}>
        {tiles.map(({ id, Icon, value, label }) => (
          <div key={id} className="pg-stat">
            <span className="pg-stat-value">{value}</span>
            <span className="pg-stat-label"><Icon size={13} aria-hidden="true" /> {label}</span>
          </div>
        ))}
      </div>
      <div className="pg-streak">
        <span className={`pg-streak-icon${s.streakDays ? ' on' : ''}`}><Flame size={20} aria-hidden="true" /></span>
        <span className="pg-streak-text">
          <strong>{s.streakDays ? `${s.streakDays} gün üst üste` : 'Seri henüz yok'}</strong>
          <span>{hint}</span>
        </span>
        <span className="pg-week" role="img" aria-label={`Bu hafta ${goal.done} gün aktif, hedef haftada ${goal.target} gün`}>
          <span className="pg-week-label">{weekLabel}</span>
          <span className="pg-week-dots" aria-hidden="true">
            {week.map((w) => (
              <span key={w.k} className={`pg-week-day${w.on ? ' on' : ''}${w.today ? ' today' : ''}`}>
                <i />
                <small>{w.short[0]}</small>
              </span>
            ))}
          </span>
        </span>
      </div>
    </section>
  )
}

// ---------- Aktivite takvimi ----------
// activities/days: oyunlar dahil tüm kayıtlar (ay gezinme sınırı, oyun sayısı).
// counted/countedDays: oyun dışı → işaretler ve ay toplamı (Takvim sekmesiyle aynı).
function ActivityCalendar({ activities, days, counted, countedDays, now, ym, sel, onShift, onSelect }) {
  const todayKey = dayKey(now)
  const grid = monthGrid(ym.y, ym.m)
  const totals = monthTotals(counted, ym.y, ym.m)
  const games = monthTotals(activities, ym.y, ym.m).count - totals.count
  const monthLabel =
    [
      totals.count ? `${nf(totals.count)}${NBSP}aktivite · ${minutesLabel(totals.seconds)}` : null,
      games ? `${nf(games)}${NBSP}oyun` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Bu ay aktivite yok'
  const title = new Date(ym.y, ym.m, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  const first = activities[0] ? new Date(activities[0].date) : now
  const canPrev = monthIndex(ym.y, ym.m) > monthIndex(first.getFullYear(), first.getMonth())
  const canNext = monthIndex(ym.y, ym.m) < monthIndex(now.getFullYear(), now.getMonth())

  return (
    <section className="card pg-cal" aria-label="Aktivite takvimi">
      <div className="pg-cal-head">
        <button className="btn-icon" onClick={() => onShift(-1)} disabled={!canPrev} aria-label="Önceki ay">
          <ChevronLeft size={20} />
        </button>
        <div className="pg-cal-title">
          <h2 className="month-title">{title}</h2>
          <span>{monthLabel}</span>
        </div>
        <button className="btn-icon" onClick={() => onShift(1)} disabled={!canNext} aria-label="Sonraki ay">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="pg-grid fade-in" key={`${ym.y}-${ym.m}`}>
        {WEEKDAYS.map((w) => (
          <span key={w.id} className="pg-wd" aria-hidden="true">{w.short}</span>
        ))}
        {grid.flat().map((d, i) => {
          if (!d) return <span key={`x${i}`} aria-hidden="true" />
          const k = dayKey(d)
          const count = countedDays.get(k)?.length ?? 0
          const dayGames = (days.get(k)?.length ?? 0) - count
          const level = dayLevel(count)
          const isToday = k === todayKey
          const future = k > todayKey
          const cls = ['pg-day', level && `l${level}`, isToday && 'today'].filter(Boolean).join(' ')
          const label = `${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}${isToday ? ', bugün' : ''}, ${count ? `${count} aktivite` : 'aktivite yok'}${dayGames ? `, ${dayGames} oyun` : ''}`
          return (
            <button key={k} className={cls} aria-pressed={sel === k} aria-label={label} disabled={future} onClick={() => onSelect(k)}>
              <span className="pg-day-num">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      <div className="pg-legend" aria-hidden="true">
        <span><i className="l1" /> 1 aktivite</span>
        <span><i className="l2" /> 2 ve üzeri</span>
        <span><i className="today" /> Bugün</span>
      </div>
    </section>
  )
}

// ---------- Seçili günün aktiviteleri ----------
function DayPanel({ sel, list, now, last, onJump, onStart }) {
  const todayKey = dayKey(now)
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  const yesterdayKey = dayKey(y)

  if (!sel) {
    return (
      <section className="card pg-day-panel">
        <EmptyState icon={CalendarDays} title="Bir gün seç">
          <p>O günün egzersizlerini, oyunlarını ve ölçümlerini görmek için takvimde bir güne dokun.</p>
        </EmptyState>
      </section>
    )
  }

  const date = keyToDate(sel)
  const relative = sel === todayKey ? 'Bugün' : sel === yesterdayKey ? 'Dün' : null
  // Oyunlar listede görünür ama aktivite/dakika toplamına girmez (özet ve takvimle aynı kural).
  const counted = list.filter(countsTowardGoal)
  const games = list.length - counted.length
  const seconds = counted.reduce((a, x) => a + (x.seconds || 0), 0)
  const daySum = [
    counted.length ? `${counted.length}${NBSP}aktivite · ${minutesLabel(seconds)}` : null,
    games ? `${games}${NBSP}oyun` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const showJump = last && dayKey(last.date) !== sel

  return (
    <section className="card pg-day-panel fade-in" key={sel} aria-label="Seçili günün aktiviteleri">
      <div className="pg-dayhead">
        <div className="stack" style={{ gap: 2 }}>
          <span className="eyebrow">{relative ? fmtLongDay(date) : 'Günün aktiviteleri'}</span>
          <h2>{relative ?? fmtLongDay(date)}</h2>
        </div>
        {daySum && <span className="pg-daysum">{daySum}</span>}
      </div>

      {list.length ? (
        <ul className="pg-acts">
          {list.map((a, i) => {
            const Icon = iconFor(a)
            return (
              <li key={a.id} className="pg-act" style={{ '--i': i }}>
                <span className={`pg-act-icon ${a.kind}`}><Icon size={19} aria-hidden="true" /></span>
                <span className="pg-act-main">
                  <span className="pg-act-title">{a.title}</span>
                  {a.detail && <span className="pg-act-detail">{a.detail}</span>}
                </span>
                <time className="pg-act-time" dateTime={a.date}>{fmtTime(a.date)}</time>
              </li>
            )
          })}
        </ul>
      ) : sel === todayKey ? (
        <EmptyState icon={Activity} title={last ? 'Bugün henüz aktivite yok' : 'Henüz aktivite yok'}>
          <p>
            {last ? 'Kısa bir egzersizle günü işaretle.' : 'İlk egzersizini yap; yaptığın her şey burada gün gün görünür.'}
            {LITE_SET && ` Hafif set yalnızca ${formatDuration(setDurationSec(LITE_SET))} sürer.`}
          </p>
          {onStart && LITE_SET && (
            <button className="btn btn-sm" onClick={() => onStart(`routine-${LITE_SET.id}`)}>
              <Play size={16} aria-hidden="true" /> Hafif seti başlat
            </button>
          )}
        </EmptyState>
      ) : (
        <EmptyState icon={CalendarDays} title="Bu gün aktivite yok">
          <p>Bir günü kaçırmak sorun değil; düzen, tek günden önemlidir.</p>
        </EmptyState>
      )}

      {games > 0 && (
        <p className="pg-foot">
          <Gamepad2 size={14} aria-hidden="true" />
          Oyunlar aktivite sayısına, seriye ve haftalık hedefe eklenmez.
        </p>
      )}

      {showJump && !list.length && (
        <button className="link-btn pg-jump" onClick={() => onJump(dayKey(last.date))}>
          Son aktivite: {new Date(last.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </section>
  )
}

// ---------- Görme keskinliği (önceki Gelişim ekranının içeriği) ----------
function VisionSection({ tests, onStart }) {
  const [eye, setEye] = useState('OU')
  const va = useMemo(() => tests.filter((t) => t.type === 'va-daily' || t.type === 'va-weekly'), [tests])
  const r = useMemo(() => analyzeTrend(va.filter((t) => t.eye === eye)), [va, eye])
  const reading = tests.filter((t) => t.type === 'reading').slice(-6).reverse()
  const tone = r.alert === 'red' ? 'tone-danger' : r.alert === 'yellow' ? 'tone-warn' : ''

  return (
    <>
      <div className="pg-section-head">
        <h2>Görme keskinliği</h2>
        <p>Tek güne değil, haftalık eğilime bakıyoruz.</p>
      </div>

      {!va.length ? (
        <section className="card">
          <EmptyState icon={ScanEye} title="Henüz görme ölçümü yok">
            <p>Günlük test yaklaşık 3 dakika sürer. İlk ölçümün, sonraki sonuçları karşılaştıracağımız başlangıç noktası olur.</p>
            {onStart && (
              <button className="btn btn-sm" onClick={() => onStart('daily')}>
                <Play size={16} aria-hidden="true" /> Günlük testi başlat
              </button>
            )}
          </EmptyState>
        </section>
      ) : (
        <>
          <div className="segmented" role="tablist" aria-label="Göz">
            {EYES.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={eye === id} onClick={() => setEye(id)}>{label}</button>
            ))}
          </div>

          <section className={`card pg-trend ${tone}`}>
            <div className="pg-trend-msg">
              {r.alert && <TriangleAlert size={20} aria-hidden="true" />}
              <p>{trendMessage(r)}</p>
            </div>
            {r.baseline != null && (
              <div className="pg-metrics">
                <div className="metric">
                  <span className="eyebrow">Başlangıç</span>
                  <span className="pg-metric-value">{decimalTr(r.baseline)}</span>
                  <span className="muted small">{snellen20(r.baseline)}</span>
                </div>
                <div className="metric">
                  <span className="eyebrow">Son 7 gün</span>
                  <span className="pg-metric-value">{r.current7 != null ? decimalTr(r.current7) : '—'}</span>
                  <span className="muted small">{r.current7 != null ? snellen20(r.current7) : ''}</span>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            {r.series.length ? (
              <ProgressChart series={r.series} baseline={r.baseline} />
            ) : (
              <p className="muted small">Bu göz için henüz ölçüm yok. Günlük test sağ, sol ve iki gözü sırayla ölçer.</p>
            )}
          </section>
        </>
      )}

      <section className="card">
        <div className="pg-card-head">
          <span className="pg-card-icon"><BookText size={18} aria-hidden="true" /></span>
          <h2>Okuma hızı</h2>
        </div>
        {reading.length ? (
          <ul className="pg-read">
            {reading.map((t) => (
              <li key={t.id}>
                <span className="muted">{new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                <span><strong>{t.maxReadingSpeed ?? '—'}</strong> kelime/dk</span>
                <span className="muted">kritik boyut {Number.isFinite(t.criticalPrintSize) ? decimalTr(t.criticalPrintSize) : '—'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">Henüz okuma testi yok. Okuma hızı testi yaklaşık 3 dakika sürer.</p>
        )}
        <p className="muted small">Okuma hızını yalnızca bu cihazdaki önceki sonuçlarınla karşılaştır.</p>
      </section>
    </>
  )
}

// onStart (isteğe bağlı): boş durumlardaki "Hafif seti başlat" / "Günlük testi başlat" düğmeleri
// için App'in go fonksiyonu. weeklyTarget (isteğe bağlı): settings.reminder?.weeklyTarget;
// verilmezse calendar.js varsayılanı (Ana sayfa ve Takvim ile aynı).
export default function Progress({ tests = [], sessions = [], weeklyTarget, onStart }) {
  const now = new Date()
  const todayKey = dayKey(now)
  // Tüm kayıtlar: gün listesi (oyunlar da görünür), ay gezinme sınırı, yılan rekoru.
  const activities = useMemo(() => activitiesFrom(tests, sessions), [tests, sessions])
  const days = useMemo(() => byDay(activities), [activities])
  // Oyun dışı kayıtlar: özet, seri, haftalık gün ve takvim işaretleri (Ana sayfa/Takvim ile aynı kural).
  const counted = useMemo(() => countedActivities(activities), [activities])
  const countedDays = useMemo(() => byDay(counted), [counted])
  const all = summary(activities, now) // rekorlar oyunlardan (hedef/seri sayımı oyunsuz)
  const s = { ...summary(counted, now), bestSnake: all.bestSnake, bestTrack: all.bestTrack }

  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [sel, setSel] = useState(todayKey)

  function showMonth(y, m) {
    setYm({ y, m })
    if (y === now.getFullYear() && m === now.getMonth()) {
      setSel(todayKey)
      return
    }
    // Başka ay: o ayın son aktif günü seçilir; yoksa son oyun günü, o da yoksa seçim kalkar
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`
    const lastIn = (map) => [...map.keys()].filter((k) => k.startsWith(prefix)).sort().at(-1)
    setSel(lastIn(countedDays) ?? lastIn(days) ?? null)
  }
  function shift(delta) {
    const x = new Date(ym.y, ym.m + delta, 1)
    showMonth(x.getFullYear(), x.getMonth())
  }
  function jump(k) {
    const d = keyToDate(k)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
    setSel(k)
  }

  return (
    <>
      <PageHeader title="Gelişim" subtitle="Egzersizlerin, oyunların ve ölçümlerin gün gün burada." />
      <SummaryCard s={s} days={countedDays} now={now} weeklyTarget={weeklyTarget} />
      <ActivityCalendar
        activities={activities}
        days={days}
        counted={counted}
        countedDays={countedDays}
        now={now}
        ym={ym}
        sel={sel}
        onShift={shift}
        onSelect={setSel}
      />
      <DayPanel sel={sel} list={sel ? days.get(sel) ?? [] : []} now={now} last={activities.at(-1)} onJump={jump} onStart={onStart} />
      <VisionSection tests={tests} onStart={onStart} />
    </>
  )
}
