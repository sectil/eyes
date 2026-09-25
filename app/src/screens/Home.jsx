import { pickSeries, EYE_LABEL } from '../lib/vaSeries.js'
import { ChevronRight, TriangleAlert, Timer, Trophy, Check, Play, Flame, Lock, Eye, UserRound } from 'lucide-react'
import { profileComplete } from '../lib/profile.js'
import { DAILY_GOAL_MIN, formatMin, todaySeconds } from '../lib/routines.js'
import { Sparkline, IrisMark } from '../components/ui.jsx'
import { trendMessage } from '../lib/trend.js'
import { activeDays, weekProgress } from '../lib/calendar.js'
import { snellen20 } from '../lib/optotype.js'
import { activitiesFrom, countedActivities, summary } from '../lib/stats.js'
import { todayPlan } from '../lib/today.js'
import '../styles/home.css'
import '../styles/restlock.css'
import { REASON_TEXT, fmtLeft } from '../lib/eyeBudget.js'
import CoachCard from '../components/CoachCard.jsx'
import TodayPath from '../components/TodayPath.jsx'
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
  const locked = Boolean(ctx.lockLeft && m.gates?.eyeBudget)
  if (v.entries) return v.entries(ctx).map((e) => ({ ...e, key: e.route, Icon: v.icon, locked }))
  return [{ key: m.id, route: (m.routes ?? [m.id])[0], title: m.title, sub: v.sub?.(ctx), badge: v.badge?.(ctx), Icon: v.icon, locked }]
}

// Mola sırasında kilitli modüllerde küçük etiket
function LockTag({ left }) {
  return <span className="eb-lock"><Lock size={11} aria-hidden="true" /> {left}</span>
}

function ModuleRows({ section, ctx, onStart }) {
  const rows = registry.inSection(section).flatMap((m) => moduleEntries(m, ctx))
  return (
    <div className="mod-rows">
      {rows.map(({ key, route, title, sub, badge, color, Icon, locked }) => (
        <button key={key} className="mod-row" style={color ? { '--row-color': color } : undefined} onClick={() => onStart(route)}>
          <span className={`mod-ic${color ? ' tinted' : ''}`}><Icon size={20} aria-hidden="true" /></span>
          <span className="grow">
            <span className="title">{title} {locked ? <LockTag left={ctx.lockLeft} /> : badge && <span className="badge">{badge}</span>}</span>
            {sub && <span className="sub">{sub}</span>}
          </span>
          <ChevronRight className="chev" size={18} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default function Home({ tests, sessions, settings, distanceTracked, trueDepth, eyeBudget = null, onStart }) {
  const now = new Date()
  // Oyun oturumları (type 'game') egzersiz süresine ve haftalık ölçüm/egzersiz gününe sayılmaz.
  const exercise = sessions.filter((s) => s.type !== 'game')
  const week = weekProgress(activeDays([...tests, ...exercise]), now, settings.reminder?.weeklyTarget)
  const streak = summary(countedActivities(activitiesFrom(tests, sessions)), now).streakDays
  // Öne çıkan göz serisi (lib/vaSeries.js): günlük test Build 24'ten beri yalnız sağ/sol göz
  const vaPick = pickSeries(tests, now.toISOString())
  const ou = vaPick.tests
  const r = vaPick.trend
  const shown = r.current7 ?? ou.at(-1)?.logMAR ?? null
  const tw = trendWords(r)
  const todaySec = todaySeconds(exercise)
  const plan = todayPlan(registry.modules, { tests, sessions, now, profile: settings.profile })
  // Oyunla aynı kural (SnakeGame loadSnakeOpts): TrueDepth varsa ve kayıtlı seçim 'touch'
  // değilse gözle açılır. VARSAYIM: trueDepth prop'u verilmemişse mesafe yöntemine göre tahmin edilir.
  const hasTrueDepth = trueDepth ?? settings.distance?.method === 'truedepth'
  const locked = Boolean(eyeBudget?.locked)
  const lockLeft = locked ? fmtLeft(eyeBudget.leftMs) : null
  const ctx = { native: { trueDepth: hasTrueDepth }, sessions, tests, settings, lockLeft }

  return (
    <>
      <header className="home-head">
        <div>
          <span className="eyebrow">{now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>{greeting()}{settings?.identity?.name ? `, ${settings.identity.name}` : ''}</h1>
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

      {locked && (
        <button type="button" className="eb-banner" onClick={() => onStart('eye-rest')}>
          <Eye size={22} aria-hidden="true" style={{ color: 'var(--accent)', flex: 'none' }} />
          <span className="grow">
            <strong>{(REASON_TEXT[eyeBudget.reason] ?? REASON_TEXT.budget).title}</strong>
            <span className="sub">Oyunlar, egzersizler ve testler mola bitince açılır. Nefes ve göz kırpma açık.</span>
          </span>
          <span className="eb-time">{lockLeft}</span>
        </button>
      )}

      {!profileComplete(settings.profile) && (
        <button type="button" className="eb-banner" onClick={() => onStart('profile')}>
          <UserRound size={22} aria-hidden="true" style={{ color: 'var(--accent)', flex: 'none' }} />
          <span className="grow">
            <strong>Profilini tamamla</strong>
            <span className="sub">Ekran, uyku ve stres; 2 dakika. Plan ve mola süreleri sana göre ayarlanır.</span>
          </span>
          <ChevronRight size={18} aria-hidden="true" style={{ color: 'var(--ink-3)' }} />
        </button>
      )}

      <div className="home-h" style={{ marginTop: 4 }}>
        <h2>{plan.allDone ? 'Bugünkü yol tamam' : plan.next ? 'Bugünün yolu' : 'Serbest gün'}</h2>
        <span className="muted small">{plan.total > 0 ? `${plan.doneCount}/${plan.total}` : ''}</span>
      </div>
      {plan.total > 0 ? (
        <TodayPath
          items={plan.items}
          next={plan.next}
          icons={Object.fromEntries(plan.items.map((it) => [it.id, viewFor(it.id)?.icon]))}
          lockedIds={new Set(locked ? plan.items.filter((it) => registry.get(it.id)?.gates?.eyeBudget).map((it) => it.id) : [])}
          lockLeft={lockLeft}
          onStart={onStart}
          week={week.met ? `Bu hafta ${week.done} gün · hedef tamam` : `Bu hafta ${week.done}/${week.target} gün`}
        />
      ) : (
        <p className="muted small">Aşağıdan istediğin çalışmayı seç.</p>
      )}

      <CoachCard tests={tests} sessions={sessions} weeklyTarget={week.target} onStart={onStart} />

      <div className="home-h">
        <h2>Ölçümlerin</h2>
        <button className="link-btn" onClick={() => onStart('progress')}>Gelişim <ChevronRight size={15} aria-hidden="true" /></button>
      </div>
      <div className="home-tiles">
        <button className="home-tile" onClick={() => onStart(shown == null ? 'daily' : 'progress')}>
          <span className="t">Yakın görme{vaPick.eye ? ` · ${EYE_LABEL[vaPick.eye].toLocaleLowerCase('tr-TR')}` : ''}</span>
          <span className="big">{shown == null ? '—' : snellen20(shown)}</span>
          <span className={`s ${shown == null ? '' : tw.tone}`}>{shown == null ? 'henüz ölçüm yok' : tw.text}</span>
          <Sparkline values={ou.slice(-14).map((t) => t.logMAR)} width={132} height={22} />
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
      <div className="home-h">
        <h2>Pratikler</h2>
        <button className="link-btn" onClick={() => onStart('awareness')}>Farkındalık <ChevronRight size={15} aria-hidden="true" /></button>
      </div>
      <div className="prax">
        {registry.inSection('practice').map((m) => {
          const v = viewFor(m.id)
          if (!v) return null
          const Icon = v.icon
          const badge = v.badge?.(ctx)
          const lockedHere = locked && m.gates?.eyeBudget
          return (
            <button key={m.id} className="prax-tile" onClick={() => onStart((m.routes ?? [m.id])[0])}>
              <Icon size={22} aria-hidden="true" />
              <span className="title">{m.title}</span>
              <em>{lockedHere ? <LockTag left={lockLeft} /> : badge ? <><Trophy size={11} aria-hidden="true" /> {badge}</> : 'Başla'}</em>
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
