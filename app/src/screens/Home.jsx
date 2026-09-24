import { ScanEye, BookText, Eye, ChevronRight, TrendingUp, TrendingDown, Minus, TriangleAlert, Sparkles, Timer, Leaf, ThumbsUp, Dumbbell, Play, Clock, Trophy } from 'lucide-react'
import { SETS, DAILY_GOAL_MIN, setDurationSec, formatMin, todaySeconds } from '../lib/routines.js'
import { Ring, Sparkline } from '../components/ui.jsx'
import { analyzeTrend, trendMessage } from '../lib/trend.js'
import { activeDays, weekProgress } from '../lib/calendar.js'
import { snellen20 } from '../lib/optotype.js'

const WEEK_MS = 7 * 86400000
const SET_ICONS = { leaf: Leaf, thumbs: ThumbsUp, dumbbell: Dumbbell }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

function TrendChip({ r }) {
  if (r.phase === 'empty') return null
  if (r.phase === 'familiarization') return <span className="trend-chip"><Sparkles size={14} /> Alışma dönemi</span>
  if (r.phase === 'baseline') return <span className="trend-chip"><Timer size={14} /> Başlangıç oluşuyor</span>
  if (r.alert === 'red') return <span className="trend-chip bad"><TrendingDown size={14} /> Belirgin kötüleşme</span>
  if (r.alert === 'yellow') return <span className="trend-chip warn"><TrendingDown size={14} /> Hafif kötüleşme</span>
  if (r.trend === 'improving') return <span className="trend-chip good"><TrendingUp size={14} /> İyileşme eğilimi</span>
  return <span className="trend-chip"><Minus size={14} /> Sabit</span>
}

export default function Home({ tests, sessions, settings, distanceTracked, onStart }) {
  const week = weekProgress(activeDays([...tests, ...sessions]), new Date(), settings.reminder?.weeklyTarget)
  const ou = tests.filter((t) => (t.type === 'va-daily' || t.type === 'va-weekly') && t.eye === 'OU')
  const r = analyzeTrend(ou)
  const shown = r.current7 ?? ou.at(-1)?.logMAR ?? null
  const last = (type) => tests.filter((t) => t.type === type).at(-1)
  const due = (t) => !t || Date.now() - new Date(t.date).getTime() > WEEK_MS
  const weeklyDue = due(last('va-weekly'))
  const readingDue = due(last('reading'))
  const todaySec = todaySeconds(sessions)
  const blinksToday = sessions.filter((s) => s.type === 'blink' && new Date(s.date).toDateString() === new Date().toDateString()).length

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <h1>{greeting()}</h1>
      </header>

      <section className="card card-hero">
        <div className="hero-row">
          <Ring value={week.done} max={week.target}>
            <span className="ring-label">{week.done}/{week.target}</span>
          </Ring>
          <div className="stack" style={{ gap: 4 }}>
            <h2>{week.met ? 'Haftalık hedef tamam' : 'Bu hafta'}</h2>
            <p className="muted small">
              {week.met
                ? 'Harika — düzenli ölçüm, gerçek değişimi görmenin tek yolu.'
                : `Haftada ${week.target} gün hedefi. Bir günü kaçırmak sorun değil.`}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row between">
          <span className="eyebrow">Yakın görme · iki göz</span>
          <TrendChip r={r} />
        </div>
        {shown == null ? (
          <p className="muted">Henüz ölçüm yok. İlk testinle başlangıç noktanı oluştur.</p>
        ) : (
          <div className="row between" style={{ alignItems: 'flex-end' }}>
            <div className="metric">
              <span className="metric-value">
                {shown.toFixed(2)}
                <span className="metric-unit">logMAR</span>
              </span>
              <span className="muted small">
                {snellen20(shown)} karşılığı{r.current7 != null ? ' · son 7 gün ortancası' : ''}
              </span>
            </div>
            <Sparkline values={ou.slice(-14).map((t) => t.logMAR)} />
          </div>
        )}
        {r.phase === 'tracking' && <p className="small" style={{ color: 'var(--ink-2)' }}>{trendMessage(r)}</p>}
      </section>

      {r.alert && (
        <section className={`card ${r.alert === 'red' ? 'tone-danger' : 'tone-warn'}`} role="alert">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
            <p className="small">{trendMessage(r)}</p>
          </div>
        </section>
      )}

      <section className="stack">
        <div className="row between">
          <h2>Egzersiz setleri</h2>
          <span className="muted small">Bugün {formatMin(todaySec)} / {DAILY_GOAL_MIN} dk</span>
        </div>
        {todaySec >= DAILY_GOAL_MIN * 60 && (
          <div className="card goal-card met">
            <Trophy size={22} />
            <div className="stack" style={{ gap: 2 }}>
              <strong>Günlük hedef tamam!</strong>
              <span className="small">Bugünkü egzersiz süresi: {formatMin(todaySec)}</span>
            </div>
          </div>
        )}
        {SETS.map((s) => {
          const Icon = SET_ICONS[s.icon]
          return (
            <button key={s.id} className="set-card" style={{ '--set-color': s.color }} onClick={() => onStart(`routine-${s.id}`)}>
              <span className="grow">
                <span className="title">{s.title} <Icon size={18} aria-hidden="true" /></span>
                <span className="set-meta">
                  <span><Play size={13} /> {s.steps.length} hareket</span>
                  <span><Clock size={13} /> {formatMin(setDurationSec(s))}</span>
                </span>
              </span>
              <ChevronRight className="chev" size={20} />
            </button>
          )
        })}
      </section>

      <h2 style={{ marginTop: 6 }}>Ölçüm</h2>
      <button className="btn" onClick={() => onStart(weeklyDue ? 'weekly' : 'daily')}>
        <ScanEye size={20} aria-hidden="true" />
        {weeklyDue ? 'Haftalık tam test · ~5 dk' : 'Günlük test · ~2 dk'}
      </button>

      <div className="action-list">
        {weeklyDue && (
          <button className="action" onClick={() => onStart('daily')}>
            <span className="icon-bubble"><ScanEye size={22} /></span>
            <span className="grow">
              <span className="title">Sadece kısa test</span>
              <span className="sub">"E hangi yönde" · ~2 dk</span>
            </span>
            <ChevronRight className="chev" size={20} />
          </button>
        )}
        <button className="action" onClick={() => onStart('reading')}>
          <span className="icon-bubble"><BookText size={22} /></span>
          <span className="grow">
            <span className="title">Okuma hızı {readingDue && <span className="badge">Bu hafta</span>}</span>
            <span className="sub">Yazı küçüldükçe ne kadar hızlı okuyorsun · ~3 dk</span>
          </span>
          <ChevronRight className="chev" size={20} />
        </button>
        <button className="action" onClick={() => onStart('blink')}>
          <span className="icon-bubble"><Eye size={22} /></span>
          <span className="grow">
            <span className="title">Göz kırpma egzersizi {blinksToday > 0 && <span className="badge">Bugün {blinksToday}/3</span>}</span>
            <span className="sub">Ekran başında göz konforu · ~2,5 dk</span>
          </span>
          <ChevronRight className="chev" size={20} />
        </button>
      </div>

      {!distanceTracked && (
        <p className="note">
          <Timer size={16} />
          Mesafe takibi kapalı; sonuçlar daha az güvenilir. Bilgi sekmesinden açabilirsin.
        </p>
      )}
      <p className="muted small">Bu uygulama teşhis koymaz ve göz muayenesinin yerini tutmaz. Verilerin yalnızca bu cihazda.</p>
    </>
  )
}
