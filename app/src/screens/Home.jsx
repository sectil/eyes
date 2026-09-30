import { useMemo, useState } from 'react'
import { pickSeries, EYE_LABEL } from '../lib/vaSeries.js'
import { ChevronRight, TriangleAlert, Timer, Trophy, Check, Play, Flame, Lock, Eye, CalendarDays, CircleDot, Moon, Waves, Footprints, Bell, BellOff, GlassWater } from 'lucide-react'
import { pendingCard, snooze, skip } from '../lib/profileQuestions.js'
import { profileFromScreening } from '../lib/profile.js'
import { DAILY_GOAL_MIN, formatMin, todaySeconds } from '../lib/routines.js'
import { Sparkline } from '../components/ui.jsx'
import { trendMessage } from '../lib/trend.js'
import { activeDays, weekProgress, dayKey } from '../lib/calendar.js'
import { snellen20 } from '../lib/optotype.js'
import { activitiesFrom, countedActivities, summary, isExerciseSession } from '../lib/stats.js'
import { buildPath } from '../lib/today.js'
import { progressionCtx, restDecision, newStopKeys, pathRestMinutes } from '../lib/progression.js'
import { dayNumber } from '../lib/notice.js'
import { eyeStatus, beginRest, restHistory } from '../lib/eyeBudgetStore.js'
import '../styles/home.css'
import '../styles/restlock.css'
import { REASON_TEXT, fmtLeft } from '../lib/eyeBudget.js'
import CoachCard from '../components/CoachCard.jsx'
import TodayPath from '../components/TodayPath.jsx'
import DayChain from '../components/DayChain.jsx'
import { Avatar } from './ProfileHome.jsx'
import { homeSuggestion } from '../lib/homeSuggest.js'
import HomeMap from '../components/HomeMap.jsx'
import AlarmLine from '../components/AlarmLine.jsx'
import AlarmCard from '../components/AlarmCard.jsx'
import { walkNudge, fmtSteps } from '../lib/health.js'
import ConsentSheet from '../components/ConsentSheet.jsx'
import { registry } from '../modules/registry.js'
import { viewFor } from '../modules/views.js'
import { normalizeReminders, TYPE_LABEL } from '../lib/reminders.js'
import { coachAllowed } from '../lib/consent.js'
import { getPrefs } from '../lib/prefs.js'
import { greeting } from '../lib/greeting.js'
import { isIOSApp } from '../lib/native.js'
import { loadLater } from '../lib/pathLater.js'

// Yoga ilk yayında yalnız iPhone uygulamasında (PLAN.v3 §D.7): web'de Pratikler listelerinde yoga kutucuğu yok
export const onHome = (m, ios = isIOSApp()) => m?.id !== 'yoga' || ios
// Ana sayfadaki göz molası önerisinin açtığı 5 dk'lık nefes (modules/breath/manifest.js routes)
export const SUGGEST_BREATH = 'breath-5'
const homeSection = (section) => registry.inSection(section).filter((m) => onHome(m))
// Yoga sabah kartı (modul.md §9; veri merkezi işinin bileşeni). Dosya yoksa kart yok: import.meta.glob boş döner, derleme
// kırılmaz. Kart ne zaman soracağına kendisi karar verir (gece başlanmış Uykuya Geçiş, 04.00–11.59, alarm sorusu önce).
const YogaMorningCard = Object.values(import.meta.glob('../components/YogaMorningCard.jsx', { eager: true }))[0]?.default ?? null


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
  const rows = homeSection(section).flatMap((m) => moduleEntries(m, ctx))
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

// Hatırlatma izni kartı (bildirim planı v2 §6): optIn henüz yoksa bir kez. "Evet" → iOS izni istenir; izin
// reddedilse de cevap 'yes' kalır ve kart ayar yolunu gösterir. onAnswer(yes) → Promise<izin | null>.
// "Her gün" denmez: uygun günlerin bir kısmında bilerek gönderilmez (notifyPlan SILENT_RATE); bu, açılış anında
// tek cümleyle söylenir (plan §4 "her tür açılırken tek cümle").
function ReminderAsk({ time, onAnswer }) {
  const [busy, setBusy] = useState(false)
  return (
    <section className="card tone-accent hh-ask" aria-label="Hatırlatma">
      <span className="eyebrow">Hatırlatma · isteğe bağlı</span>
      <h3>Günde bir mola hatırlatması ister misin?</h3>
      <p className="small">{`Günde en çok bir kez (saat ${time}), bir dakikalık mola: kalk, uzağa bak. Bazı günler bilerek göndermiyoruz; işine yarayıp yaramadığını Gelişim'de görmen için. Saatini ve diğer hatırlatmaları Bilgi → Hatırlatmalar'dan seçersin.`}</p>
      <div className="row">
        <button type="button" className="btn btn-sm" disabled={busy} onClick={() => { setBusy(true); onAnswer(true) }}>
          <Bell size={16} aria-hidden="true" /> Evet
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onAnswer(false)}>Şimdi değil</button>
      </div>
    </section>
  )
}

// Çalışma oturumu şeridi (açıkken): sıradaki mola ve Bitir. focus: loadFocus() (App her çizimde okur).
// Canlı bölge değil: geri sayım her dakika değişir, ekran okuyucu her seferinde okumasın (EyeBudgetPill gibi).
// block (App focusBlock): bildirim gelemiyorsa nedeni şeridin altında yazar.
const FOCUS_BLOCK_TEXT = {
  off: 'Hatırlatmalar kapalı; mola bildirimi gelmez.',
  perm: 'Bildirimler kapalı; mola bildirimi gelmez (Ayarlar > Nefona > Bildirimler).',
  web: 'Mola bildirimi yalnız iPhone uygulamasında gelir.',
}
function FocusStrip({ focus, now, block = null, onStop }) {
  const next = focus?.nextBreakAt instanceof Date ? focus.nextBreakAt.getTime() : NaN
  if (!Number.isFinite(next)) return null
  const min = Math.max(1, Math.ceil((next - now.getTime()) / 60000))
  const note = FOCUS_BLOCK_TEXT[block] ?? null
  return (
    <div className="hh-focus">
      <Timer size={18} aria-hidden="true" />
      <span className="grow">
        <b>Çalışma oturumu</b> · {min >= 60 ? '1 saat' : `${min} dk`} sonra mola
        {note && <small className="hh-focus-note">{note}</small>}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onStop} aria-label="Çalışma oturumunu bitir">Bitir</button>
    </div>
  )
}

// Bildirim planı v2 (App verir): reminderAsk + onReminders(yes) izin kartı; focus + focusBlock + onStopFocus oturum şeridi;
// trialNote ({ daysLeft }) + onTrialNote: izni olmayana deneme 5. gün şeridi; thinAsk (tür) + onThin(tür, 'keep'|'alt').
// alarmStatus ({ platform, auth }; App) + alarmTest (14.00 eşiği): "Bugünün yolu"nun altındaki alarm kartı (AlarmCard).
// İlk ekran kalabalıklaşmasın: kart yuvası tek (izin kartı → deneme şeridi → seyreltme sorusu), rıza sayfası açıkken boş.
// healthSheetKind: 'health' ya da eski metne izin vermiş kişiye 'healthUpdate' (lib/consent.js; cevap yine onHealthConsent).
// onYogaMorning: yoga sabah kartı cevabı kayda yazılınca (App kayıtları yeniler).
export default function Home({ tests, sessions, settings, distanceTracked, trueDepth, eyeBudget = null, premium = true, member = false, askConsent = false, onConsent, health = null, askHealth = false, onHealthConsent, healthSheetKind = 'health', onCoach, onStart, onAsk, onSaveProfile, reminderAsk = false, onReminders, focus = null, focusBlock = null, onStopFocus, trialNote = null, onTrialNote, thinAsk = null, onThin, alarmStatus = null, alarmTest = false, onYogaMorning }) {
  const [permNote, setPermNote] = useState(false) // "Evet" dendi ama izin kapalı: ayar yolu (bir kez, bu ekranda)
  const now = new Date()
  // Oyun oturumları (type 'game') ve WHO-5 egzersiz süresine ve haftalık ölçüm/egzersiz gününe sayılmaz.
  const exercise = sessions.filter(isExerciseSession)
  const week = weekProgress(activeDays([...tests, ...exercise]), now, settings.reminder?.weeklyTarget)
  const streak = summary(countedActivities(activitiesFrom(tests, sessions)), now).streakDays
  // Öne çıkan göz serisi (lib/vaSeries.js): uyarısı en ciddi göz → son 14 günde en çok ölçülen → sağ, sol, iki göz.
  // Haftalık testte (2026-09-29'dan beri olağan plan) üç göz eşit ölçülür: eşitlikte sağ göz.
  const vaPick = pickSeries(tests, now.toISOString())
  const ou = vaPick.tests
  const r = vaPick.trend
  const shown = r.current7 ?? ou.at(-1)?.logMAR ?? null
  const tw = trendWords(r)
  const todaySec = todaySeconds(exercise)
  // Bugünün yolu (lib/today.js): göz bütçesi ve abonelik durumu yolu biçimlendirir (bölümler, kilit, ilk test).
  // later: bugün "Sonra yaparım" denen duraklar (lib/pathLater.js; gün değişince geçersiz)
  const later = loadLater(now)
  // İlerleme bağlamı (lib/progression.js; SONSUZ_YOL.PLAN.v1 §3.A.2): sayaçlar kayıtlardan, bugünden önceki günlerle;
  // yalnız burada, kayıtlar ya da gün değişince bir kez hesaplanır. Merdivenler ve açılma eşikleri bunu okur.
  const today = dayKey(now)
  const laterKeys = later?.later?.join(',') ?? ''
  const progression = useMemo(
    () => progressionCtx({ tests, sessions, now, modules: registry.live, later }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tests, sessions, today, laterKeys],
  )
  const pathCtx = { tests, sessions, now, profile: settings.profile, eye: eyeBudget, gate: { firstTestOnly: tests.length === 0 && !premium }, later, progression }
  const plan = buildPath(registry.live, pathCtx)
  // Yolda bugün ilk kez gelen durak ya da basamak: "Yeni" rozeti (§1; 1. günde yok)
  const newKeys = newStopKeys(pathCtx, plan.stops)
  // Mola bandı ve baloncuğun süresi (lib/progression.js pathRestMinutes): yolun molası bugün başladıysa (sürerken ve
  // bittikten sonra) 5 dk
  const restStarted = restHistory().some((r) => r?.reason === 'path' && Number.isFinite(r.start) && dayKey(new Date(r.start)) === today)
  const restMin = pathRestMinutes(eyeBudget, plan, progression, { restStarted })
  // Yoldaki Nefes durağı 5 dk göz molasını başlatır (yol planı A): kilit yoksa ve son moladan beri ≥ 1 dk göz
  // çalışması varsa. Saatlik/günlük sınır dolmuşsa o mola başlar (5 dk yetmez). Karar lib/progression.js
  // restDecision'da: yeni kullanıcının ilk günlerinde (1. bölümün göz payı dolmamışken) mola ancak kalan göz
  // çalışması bütçeyi aşacaksa başlar (§3.A.8-6); öteki her durumda bugünkü kural.
  // fromPath: yolun durağı açılıyor (App ctx.fromPath; yol içinde "Bana hatırlat" kartı çıkmaz, bildirim PLAN.v1 §A.2)
  const startStop = (route, fromPath = true) => {
    if (route === 'breath-rest') {
      const why = restDecision(eyeStatus(), plan, progression)
      if (why) beginRest(why)
    }
    onStart(route, { fromPath })
  }
  // Göz molası önerisi ("Nefes · 5 dk", sakin seçenek "5 dk mola"; lib/homeSuggest.js 'breath-rest' verir): yolun
  // durağı değildir. Her zaman 5 dk'lık nefes açılır ('breath-5', modules/breath/view.jsx) ve mola bugünkü kuralla
  // başlar (ilerleme bağlamı olmadan: yeni kullanıcının yol istisnası bu öneriye uygulanmaz). Onaylı yoga planı §B.2
  // kural 10: "5 dakikalık nefes Ana sayfada kalır".
  // Büyük düğme yolun sıradaki durağıysa (kind 'path'; sıradaki Nefes durağı da 'breath-rest' taşır) durak kendi
  // basamağıyla açılır: düğmenin yazdığı süre ("Nefes · 3 dk") açılan seansın süresidir.
  const startSuggest = (route, kind = null) => {
    if (route !== 'breath-rest' || kind === 'path') return startStop(route, kind === 'path')
    const why = restDecision(eyeStatus(), plan, null)
    if (why) beginRest(why)
    onStart(SUGGEST_BREATH)
  }
  // Ana sayfa başı: toplam gün (oyunlar dahil her kayıt), bu haftanın çalışma günü, Nef önerisi
  const totalDays = activeDays([...tests, ...sessions]).size
  const weekLine = week.met ? `Bu hafta ${week.done} gün · hedef tamam` : `Bu hafta ${week.done}/${week.target} gün`
  const showStreak = streak >= 3
  const showWith = totalDays > 0 && !(showStreak && totalDays === streak)
  const walk = walkNudge({ recentSteps: health?.recentSteps, hasData: health?.hasData, hour: now.getHours() })
  const sug = homeSuggestion({ plan, eye: eyeBudget, walk })
  // Nef satırı büyük düğmenin tekrarı mı ("Güne X ile başla." / "Kaldığın yerden devam: X."): öyleyse çizilmez
  const nefRepeats = sug.primary.kind === 'path' && !walk
  const stopIcons = Object.fromEntries(plan.stops.map((s) => [s.id, viewFor(s.id)?.icon]))
  // Büyük düğme yolun sıradaki durağını açıyorsa ve durak bugün yeniyse "Yeni" (yoldaki rozetle aynı kural)
  const goNew = sug.primary.kind === 'path' && Boolean(plan.next) && newKeys.includes(plan.next.key)
  // Oyunla aynı kural (SnakeGame loadSnakeOpts): TrueDepth varsa ve kayıtlı seçim 'touch'
  // değilse gözle açılır. VARSAYIM: trueDepth prop'u verilmemişse mesafe yöntemine göre tahmin edilir.
  const hasTrueDepth = trueDepth ?? settings.distance?.method === 'truedepth'
  const locked = Boolean(eyeBudget?.locked)
  const lockLeft = locked ? fmtLeft(eyeBudget.leftMs) : null
  const ctx = { native: { trueDepth: hasTrueDepth }, sessions, tests, settings, lockLeft }
  // Profil öncesi (yalnız screening) kayıtlarda kurulum tarihi screening'den
  const prof = { ...(settings.profile ?? profileFromScreening(settings.screening)), date: settings.profile?.date ?? settings.screening?.date ?? null }
  const ask = onAsk ? pendingCard(prof, now) : null
  const rem = normalizeReminders(settings.reminders)
  // Kart yuvası: rıza sayfası açıkken hiçbiri; yoksa sırayla tek kart
  const sheetOpen = Boolean((askConsent && onConsent) || (askHealth && onHealthConsent))
  const slot = sheetOpen ? null : reminderAsk && onReminders ? 'remind' : permNote ? 'perm' : trialNote && onTrialNote ? 'trial' : thinAsk && onThin ? 'thin' : null
  // Nef tanıtım kartı da bir rıza kartı: hatırlatma kartı açıkken gizlenir (ikisi aynı anda çıkmasın)
  const prefs = getPrefs()
  const coachIntro = !coachAllowed(prefs, settings.consents).on && !prefs.coachHidden
  const answerReminders = async (yes) => {
    const perm = await onReminders(yes)
    if (yes && perm === 'denied') setPermNote(true)
  }
  const waterOn = rem.optIn === 'yes' && rem.types.water.on
  const WaterIcon = viewFor('water')?.icon ?? GlassWater

  return (
    <>
      {/* Hesabı olan ve profil eşitlemeye henüz cevap vermemiş kişiye bir kez (KVKK açık rıza) */}
      {askConsent && onConsent && <ConsentSheet kind="profileSync" onAnswer={onConsent} />}
      {!askConsent && askHealth && onHealthConsent && <ConsentSheet kind={healthSheetKind} onAnswer={onHealthConsent} />}
      <header className="home-head">
        <div>
          <span className="eyebrow">{now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>
            {greeting()}
            {settings?.identity?.name ? <>,<br /><em className="hh-name">{settings.identity.name}</em></> : ''}
          </h1>
        </div>
        <button type="button" className="hh-me" onClick={() => onStart('profile')} aria-label={member ? 'Profilim, Premium' : 'Profilim'}>
          <Avatar identity={settings.identity} size={44} />
          {member && (
            <i className="hh-star" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.5l7.1-.6z" /></svg>
            </i>
          )}
        </button>
      </header>

      {focus && onStopFocus && <FocusStrip focus={focus} now={now} block={focusBlock} onStop={onStopFocus} />}

      {/* Yoga sabah sorusu: Ana sayfanın üstünde tek kart, yalnız iPhone uygulamasında; rıza sayfası açıkken yok */}
      {YogaMorningCard && isIOSApp() && !sheetOpen && <YogaMorningCard sessions={sessions} now={now} alarmStatus={alarmStatus} onSaved={onYogaMorning} onStart={onStart} />}

      {/* Kişinin sayıları (5 saniye turu 2): selamın altında tek satır hap; seri mercek renginde (ödül). Sıfır ve kırık seri
          yok, aynı sayı iki kez yok (karar 5d'nin kuralı): seri 3 gün ve üstündeyse görünür, değilse "N gün seninle";
          "gün seninle" seriyle aynı sayıysa yazılmaz. Hafta, yolun altındaki satırla aynı cümle ("Bu hafta 2/3 gün"). */}
      {(showStreak || week.done > 0 || showWith || health || alarmStatus) && (
        <div className="hh-facts hh-chips">
          {showStreak && <div className="hh-fact lens"><Flame size={14} aria-hidden="true" className="f1" /><b>{streak}</b>gün seri</div>}
          {week.done > 0 && <div className="hh-fact"><CalendarDays size={14} aria-hidden="true" className="f2" />{weekLine}</div>}
          {showWith && <div className="hh-fact"><CircleDot size={14} aria-hidden="true" className="f3" /><b>{totalDays}</b>gün seninle</div>}
          {health && (
            <div className="hh-fact">
              <Footprints size={14} aria-hidden="true" className="f4" />
              {health.hasData ? <><b>{fmtSteps(health.today?.steps)}</b>adım bugün</> : <><b>—</b>adım · veri yok</>}
            </div>
          )}
          {alarmStatus && <AlarmLine status={alarmStatus} onStart={onStart} now={now} />}
        </div>
      )}

      {/* Bugün kartı (5 saniye turu 2): ilk 4 saniyede ne kadar sürer ("≈ 8 dk · 4 durak"), ne yapacağım (günün zinciri:
          her durak kendi çiziminde) ve ilk adım (büyük düğme). Sıfır yok: gün başında "4 durak", sonra "1/4 durak".
          Nef satırı yalnız düğmeden başka bir şey söylüyorsa (göz molası, yürüme, gün tamam); sıradaki durağı söyleyen satır
          düğmenin tekrarıdır, onun yerine durağın alt satırı düğmede ("3 bölüm · sağ, sol, iki göz"). */}
      <section className="hh-today" aria-label="Bugün">
        {plan.total > 0 && (
          <>
            {/* Yol bitince büyük yazı "10/10 durak"; "Bugünkü yol tamam." Nef satırında (tekrar olmasın) */}
            <div className="hh-sum">
              {plan.allDone ? (
                <b className="hh-min">{plan.total}/{plan.total}<small> durak</small></b>
              ) : (
                <>
                  <b className="hh-min">≈{plan.minutesLeft}<small> dk{plan.doneCount > 0 && ' kaldı'}</small></b>
                  <span className="hh-cnt">{plan.doneCount > 0 ? `${plan.doneCount}/${plan.total}` : plan.total} durak</span>
                </>
              )}
            </div>
            <DayChain plan={plan} icons={stopIcons} />
          </>
        )}
        {!nefRepeats && (
          <div className="hh-nef">
            <span className="hh-nef-eye" aria-hidden="true" />
            <p>{sug.primary.line}{sug.primary.sub && <span>Nef · {sug.primary.sub}</span>}</p>
          </div>
        )}
        <button type="button" className="hh-go" onClick={() => startSuggest(sug.primary.route, sug.primary.kind)}>
          <span className="t">
            <small>{sug.primary.eyebrow}{goNew && <i className="hh-new">Yeni</i>}</small>
            <b>{sug.primary.title}</b>
            {nefRepeats && plan.next?.sub && <span className="s">{plan.next.sub}</span>}
          </span>
          <span className="ar"><Play size={20} aria-hidden="true" fill="currentColor" /></span>
        </button>
      </section>
      {sug.alts.length > 0 && (
        <div className={`hh-alt n${sug.alts.length}`}>
          {sug.alts.map((a) => (
            <button type="button" key={a.kind} onClick={() => startSuggest(a.route)}>
              <span className={`ic ${a.kind}`}>{a.kind === 'breath' ? <Moon size={18} aria-hidden="true" fill="currentColor" /> : <Waves size={18} aria-hidden="true" />}</span>
              <span className="tx"><b>{a.title}</b><small>{a.sub}</small></span>
            </button>
          ))}
        </div>
      )}

      {slot === 'remind' && <ReminderAsk time={rem.types.mola.time} onAnswer={answerReminders} />}
      {slot === 'perm' && (
        <section className="card hh-ask" role="status">
          <p className="small row" style={{ alignItems: 'flex-start' }}>
            <BellOff size={18} aria-hidden="true" style={{ flex: 'none', marginTop: 1 }} />
            <span>{'Bildirimler kapalı: Ayarlar > Nefona > Bildirimler. Açınca hatırlatman kendiliğinden kurulur.'}</span>
          </p>
          <div className="row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPermNote(false)}>Tamam</button>
          </div>
        </section>
      )}
      {slot === 'trial' && (
        <section className="card tone-accent hh-ask" aria-label="Deneme süresi">
          <span className="eyebrow">Deneme süresi</span>
          <p className="small">
            {`Deneme süren ${trialNote.daysLeft >= 1 ? `${trialNote.daysLeft} gün sonra bitiyor` : 'bugün bitiyor'}. İptal etmezsen seçtiğin plan başlar (Ayarlar → Apple Kimliği → Abonelikler).`}
          </p>
          <div className="row">
            <button type="button" className="btn btn-sm" onClick={() => { onTrialNote(); onStart('first-report') }}>İlk raporun</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onTrialNote}>Tamam</button>
          </div>
        </section>
      )}
      {slot === 'thin' && (
        <section className="card hh-ask" aria-label="Hatırlatma sıklığı">
          <span className="eyebrow">Hatırlatma · bir kez soruyoruz</span>
          <p className="small">{`${TYPE_LABEL[thinAsk]} hatırlatması son günlerde pek işine yaramıyor olabilir. Böyle mi kalsın, gün aşırı mı gelsin?`}</p>
          <div className="row">
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => onThin(thinAsk, 'keep')}>Böyle kalsın</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => onThin(thinAsk, 'alt')}>Gün aşırı</button>
          </div>
        </section>
      )}

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

      {/* Yerinde sorular (lib/profileQuestions.js): akşam kontrolü ve ilk hafta sonu, Artifact "Önce Fark Ettir" Y4/Y6 */}
      {ask === 'iris' && (
        <section className="card ask-card evening">
          <span className="eyebrow">28. gün · ~2 dk</span>
          <h3>İris haritan yeniden</h3>
          <p className="muted small">İlk Bakış ve aynı dört soru; sonra başlangıçtaki haritanla yan yana.</p>
          <div className="row">
            <button type="button" className="btn btn-sm" onClick={() => onAsk?.('iris')}>Başla</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSaveProfile?.(snooze(prof, 'iris', now))}>Sonra</button>
          </div>
        </section>
      )}
      {ask === 'evening' && (
        <section className="card ask-card evening">
          <span className="eyebrow">Akşam kontrolü · 3 soru · 30 sn</span>
          <h3>Günün nasıl geçti?</h3>
          <p className="muted small">Ekran, uyku ve gece telefonu. Her ekranda tek soru.</p>
          <div className="row">
            <button type="button" className="btn btn-sm" onClick={() => onAsk?.('evening')}>Başla</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSaveProfile?.(snooze(prof, 'evening', now))}>Sonra</button>
          </div>
        </section>
      )}
      {ask === 'stress' && (
        <section className="card ask-card">
          <span className="eyebrow">İlk haftan bitti · isteğe bağlı</span>
          <h3>İki kısa soru daha</h3>
          <p className="muted small">Son bir ayda nasıl hissettiğine dair. Cevaplamasan da her şey açık kalır.</p>
          <div className="row">
            <button type="button" className="btn btn-sm" onClick={() => onAsk?.('stress')}>Cevapla</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSaveProfile?.(skip(prof, 'stress', now))}>Geç</button>
          </div>
        </section>
      )}

      <div className="home-h" style={{ marginTop: 4 }}>
        <h2>{plan.allDone ? 'Bugünkü yol tamam' : plan.next ? 'Bugünün yolu' : 'Serbest gün'}</h2>
      </div>
      {plan.total > 0 ? (
        <TodayPath
          plan={plan}
          eye={eyeBudget}
          day={dayNumber(now)}
          icons={stopIcons}
          onStart={startStop}
          newKeys={newKeys}
          restMin={restMin}
          staged={Boolean(progression)}
          lead={sug.primary.kind === 'path'}
          week={weekLine}
        />
      ) : (
        <p className="muted small">Aşağıdan istediğin çalışmayı seç.</p>
      )}

      {/* Alarm kartı yolun altında (Artifact v4); Profil → Alarm'dan ya da ⋯ menüsünden kaldırılır */}
      {alarmStatus && !sheetOpen && <AlarmCard status={alarmStatus} sessions={sessions} test={alarmTest} onStart={onStart} now={now} />}

      {/* Gelişim haritası yolun altında (5 saniye turu): ilk görünüm bugünün işini söyler, alan dengesi sonra gelir */}
      <HomeMap tests={tests} sessions={sessions} profile={settings?.profile ?? null} onStart={onStart} />

      {!(slot === 'remind' && coachIntro) && <CoachCard tests={tests} sessions={sessions} profile={settings.profile} weeklyTarget={week.target} consents={settings.consents} onCoach={onCoach} onStart={onStart} />}

      <div className="home-h">
        <h2>Ölçümlerin</h2>
        <button className="link-btn" onClick={() => onStart('progress')}>Gelişim <ChevronRight size={15} aria-hidden="true" /></button>
      </div>
      <div className="home-tiles">
        {/* Henüz ölçüm yoksa ilk test Haftalık E testi (Bugün'ün 1. günü ile aynı; karar 2026-09-29) */}
        <button className="home-tile" onClick={() => onStart(shown == null ? 'weekly' : 'progress')}>
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
        {homeSection('practice').map((m) => {
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
        {/* Su hatırlatması açıksa kayıt yolu her gün açık (bildirim gelmeyen günlerde de; ölçüm karşılaştırması için) */}
        {waterOn && (
          <button className="prax-tile" onClick={() => onStart('water')}>
            <WaterIcon size={22} aria-hidden="true" />
            <span className="title">Su</span>
            <em>Kaydet</em>
          </button>
        )}
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
      <p className="muted small">Bu uygulama teşhis koymaz ve göz muayenesinin yerini tutmaz. Ölçümlerin bu telefonda saklanır. Hesap açarsan giriş bilgin, abonelik için App Store satın alma kaydın (RevenueCat) sunucuya gider; profil eşitleme ve Nef yalnızca izin verirsen (Profilim → İzinlerim).</p>
    </>
  )
}
