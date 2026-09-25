import { ChevronRight, TriangleAlert, Timer, Trophy, Check, Play, Flame } from 'lucide-react'
import { DAILY_GOAL_MIN, formatMin, todaySeconds } from '../lib/routines.js'
import { Sparkline, IrisMark } from '../components/ui.jsx'
import { analyzeTrend, trendMessage } from '../lib/trend.js'
import { activeDays, weekProgress } from '../lib/calendar.js'
import { snellen20 } from '../lib/optotype.js'
import { activitiesFrom, countedActivities, summary } from '../lib/stats.js'
import { todayPlan } from '../lib/today.js'
import '../styles/home.css'
import CoachCard from '../components/CoachCard.jsx'
import { registry } from '../modules/registry.js'
import { viewFor } from '../modules/views.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

// Görme trendi → kısa, insan dilinde durum (trend.js aşamaları)
function trendWords(r) {
  if (r.phase === 'familiarization') return { text: 'alışma dönemi', tone: '' }
  if (r.phase === 'baseline') return { text: 'başlangıç oluşuyor', tone: '' }
  if (r.alert === 'red') return { text: 'belirgin kötüleşme', tone: 'bad' }
  if (r.alert === 'yellow') return { text: 'hafif kötüleşme', tone: 'warn' }
  if (r.trend === 'improving') return { text: 'iyileşme eğilimi', tone: 'good' }
  return { text: 'değişim yok', tone: '' }
}

// Diyafram halkaları: iris dokusu gibi yavaş döner (hareket azaltma tercihinde durur)
function Aperture() {
  return (
    <svg className="aperture" viewBox="0 0 232 232" aria-hidden="true">
      <defs>
        <linearGradient id="home-iris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--iris-1)" />
          <stop offset="1" stopColor="var(--iris-2)" />
        </linearGradient>
      </defs>
      <circle className="r3" cx="116" cy="116" r="100" />
      <circle className="r1" cx="116" cy="116" r="74" />
      <circle className="r2" cx="116" cy="116" r="50" />
    </svg>
  )
}

// Bir modül satırı (Egzersiz ve Ölçüm bölümleri). Birden çok girişi olan modül entries() verir.
function moduleEntries(m, ctx) {
  const v = viewFor(m.id)
  if (!v) return []
  if (v.entries) return v.entries(ctx).map((e) => ({ ...e, key: e.route, Icon: v.icon }))
  return [{ key: m.id, route: (m.routes ?? [m.id])[0], title: m.title, sub: v.sub?.(ctx), badge: v.badge?.(ctx), Icon: v.icon }]
}

function ModuleRows({ section, ctx, onStart }) {
  const rows = registry.inSection(section).flatMap((m) => moduleEntries(m, ctx))
  return (
    <div className="mod-rows">
      {rows.map(({ key, route, title, sub, badge, color, Icon }) => (
        <button key={key} className="mod-row" style={color ? { '--row-color': color } : undefined} onClick={() => onStart(route)}>
          <span className={`mod-ic${color ? ' tinted' : ''}`}><Icon size={20} aria-hidden="true" /></span>
          <span className="grow">
            <span className="title">{title} {badge && <span className="badge">{badge}</span>}</span>
            {sub && <span className="sub">{sub}</span>}
          </span>
          <ChevronRight className="chev" size={18} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default function Home({ tests, sessions, settings, distanceTracked, trueDepth, onStart }) {
  const now = new Date()
  // Oyun oturumları (type 'game') egzersiz süresine ve haftalık ölçüm/egzersiz gününe sayılmaz.
  const exercise = sessions.filter((s) => s.type !== 'game')
  const week = weekProgress(activeDays([...tests, ...exercise]), now, settings.reminder?.weeklyTarget)
  const streak = summary(countedActivities(activitiesFrom(tests, sessions)), now).streakDays
  const ou = tests.filter((t) => (t.type === 'va-daily' || t.type === 'va-weekly') && t.eye === 'OU')
  const r = analyzeTrend(ou)
  const shown = r.current7 ?? ou.at(-1)?.logMAR ?? null
  const tw = trendWords(r)
  const reads = tests.filter((t) => t.type === 'reading' && Number.isFinite(t.maxReadingSpeed))
  const todaySec = todaySeconds(exercise)
  const plan = todayPlan(registry.modules, { tests, sessions, now })
  // Oyunla aynı kural (SnakeGame loadSnakeOpts): TrueDepth varsa ve kayıtlı seçim 'touch'
  // değilse gözle açılır. VARSAYIM: trueDepth prop'u verilmemişse mesafe yöntemine göre tahmin edilir.
  const hasTrueDepth = trueDepth ?? settings.distance?.method === 'truedepth'
  const ctx = { native: { trueDepth: hasTrueDepth }, sessions, tests, settings }

  return (
    <>
      <header className="home-head">
        <div>
          <span className="eyebrow">{now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>{greeting()}</h1>
        </div>
        <div className="home-head-side">
          {streak > 0 && (
            <span className="streak-chip" aria-label={`${streak} günlük seri`}>
              <Flame size={13} aria-hidden="true" /> {streak} gün
            </span>
          )}
          <IrisMark size={40} />
        </div>
      </header>

      <section className="plan-hero" aria-label="Bugünün planı">
        <Aperture />
        <span className="eyebrow">
          Bugünün planı{plan.total > 0 ? ` · ${plan.doneCount}/${plan.total}` : ''}
        </span>
        <h2 className="plan-title">{plan.allDone ? 'Bugünkü plan tamam' : plan.next ? plan.next.title : 'Serbest gün'}</h2>
        {plan.total > 0 && (
          <ol className="plan-steps">
            {plan.items.map((it) => (
              <li key={it.id} className={it.done ? 'done' : it === plan.next ? 'now' : ''}>
                <span>{it.done && <Check size={11} aria-hidden="true" />}{it.title}</span>
              </li>
            ))}
          </ol>
        )}
        {plan.next ? (
          <button className="btn" onClick={() => onStart(plan.next.route)}>
            <Play size={18} aria-hidden="true" />
            Başla{plan.next.minutes ? ` · ${plan.next.minutes} dk` : ''}
          </button>
        ) : (
          <p className="plan-done small">
            {plan.allDone ? 'İstersen aşağıdan bir pratik seç.' : 'Aşağıdan istediğin çalışmayı seç.'}
          </p>
        )}
        <span className="plan-week small">
          {week.met ? `Bu hafta ${week.done} gün · hedef tamam` : `Bu hafta ${week.done}/${week.target} gün`}
        </span>
      </section>

      <CoachCard tests={tests} sessions={sessions} weeklyTarget={week.target} onStart={onStart} />

      <div className="home-h">
        <h2>Ölçümlerin</h2>
        <button className="link-btn" onClick={() => onStart('progress')}>Gelişim <ChevronRight size={15} aria-hidden="true" /></button>
      </div>
      <div className="home-tiles">
        <button className="home-tile" onClick={() => onStart(shown == null ? 'daily' : 'progress')}>
          <span className="t">Yakın görme</span>
          <span className="big">{shown == null ? '—' : snellen20(shown)}</span>
          <span className={`s ${shown == null ? '' : tw.tone}`}>{shown == null ? 'henüz ölçüm yok' : tw.text}</span>
          <Sparkline values={ou.slice(-14).map((t) => t.logMAR)} width={132} height={22} />
        </button>
        <button className="home-tile" onClick={() => onStart(reads.length ? 'progress' : 'reading')}>
          <span className="t">Okuma hızı</span>
          <span className="big">
            {reads.length ? reads.at(-1).maxReadingSpeed : '—'}
            {reads.length > 0 && <small>k/dk</small>}
          </span>
          <span className="s">
            {!reads.length ? 'henüz ölçüm yok' : reads.length > 1 ? `önceki ${reads.at(-2).maxReadingSpeed}` : 'ilk ölçüm'}
          </span>
          <Sparkline values={reads.slice(-8).map((t) => t.maxReadingSpeed)} width={132} height={22} higherIsBetter color="var(--lens)" />
        </button>
        {/* Kutucuk tanımlayan ölçüm modülleri (view.tile) — takılınca burada görünür */}
        {registry.inSection('measure').map((m) => {
          const tile = viewFor(m.id)?.tile?.(ctx)
          if (!tile) return null
          return (
            <button key={m.id} className="home-tile" onClick={() => onStart(tile.route ?? (m.routes ?? [m.id])[0])}>
              <span className="t">{tile.label}</span>
              <span className="big">{tile.value}</span>
              <span className="s">{tile.sub}</span>
              <Sparkline values={tile.values ?? []} width={132} height={22} higherIsBetter={Boolean(tile.higherIsBetter)} color={tile.color ?? 'var(--chart-line)'} />
            </button>
          )
        })}
      </div>

      {r.alert && (
        <section className={`card ${r.alert === 'red' ? 'tone-danger' : 'tone-warn'}`} role="alert">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
            <p className="small">{trendMessage(r)}</p>
          </div>
        </section>
      )}

      {/* Pratikler: bakış kontrolü ve dikkat pratiği. "Ölçüm" değil — skorlar görme trendine girmez. */}
      <div className="home-h"><h2>Pratikler</h2></div>
      <div className="prax">
        {registry.inSection('practice').map((m) => {
          const v = viewFor(m.id)
          if (!v) return null
          const Icon = v.icon
          const badge = v.badge?.(ctx)
          return (
            <button key={m.id} className="prax-tile" onClick={() => onStart((m.routes ?? [m.id])[0])}>
              <Icon size={22} aria-hidden="true" />
              <span className="title">{m.title}</span>
              <em>{badge ? <><Trophy size={11} aria-hidden="true" /> {badge}</> : 'Başla'}</em>
            </button>
          )
        })}
      </div>

      <div className="home-h">
        <h2>Egzersiz</h2>
        <span className="muted small">Bugün {formatMin(todaySec)} / {DAILY_GOAL_MIN} dk</span>
      </div>
      <ModuleRows section="exercise" ctx={ctx} onStart={onStart} />

      <div className="home-h"><h2>Ölçüm</h2></div>
      <ModuleRows section="measure" ctx={ctx} onStart={onStart} />

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
