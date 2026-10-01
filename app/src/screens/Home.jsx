import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { pickSeries, EYE_LABEL } from '../lib/vaSeries.js'
import { ChevronRight, TriangleAlert, Timer, Trophy, Check, Lock, Eye, Footprints, Bell, BellOff, GlassWater } from 'lucide-react'
import { pendingCard, snooze, skip } from '../lib/profileQuestions.js'
import { profileFromScreening } from '../lib/profile.js'
import { DAILY_GOAL_MIN, formatMin, todaySeconds } from '../lib/routines.js'
import { Sparkline } from '../components/ui.jsx'
import { trendMessage } from '../lib/trend.js'
import { activeDays, weekProgress, dayKey } from '../lib/calendar.js'
import { snellen20 } from '../lib/optotype.js'
import { activitiesFrom, countedActivities, summary, isExerciseSession } from '../lib/stats.js'
import { buildPath, calendarDaysBetween } from '../lib/today.js'
import { progressionCtx, restDecision, newStopKeys, pathRestMinutes, updateDay } from '../lib/progression.js'
import { dayNumber } from '../lib/notice.js'
import { eyeStatus, beginRest, restHistory } from '../lib/eyeBudgetStore.js'
import '../styles/home.css'
import '../styles/restlock.css'
import '../styles/longpath.css'
import { REASON_TEXT, fmtLeft } from '../lib/eyeBudget.js'
import CoachCard from '../components/CoachCard.jsx'
import DayIris from '../components/home/DayIris.jsx'
import HomeGo, { HomeLead } from '../components/home/HomeGo.jsx'
import { dayRays, pupilOf, lookDates, todayRayN } from '../components/home/dayRays.js'
import { leadCandidates, pickLead, pathDayOn, goFace, todayLead, firstStop, leadSub, heroLine, shownTitle, NEF, CHAPTER_PRIZE, nefTopLine, isMileLine, quietsNef, nefEndLine, pathMinutes, stopMinutes, OFF_FIRST_VIEW, IRIS_FROM_DAY } from '../components/home/dayLead.js'
import LongPath from '../components/home/LongPath.jsx'
import ChapterStrip from '../components/home/ChapterStrip.jsx'
import SkyChip from '../components/home/SkyChip.jsx'
import { projectDays, seenBefore, firstNews, chapterOf, chapterEnd } from '../lib/pathAhead.js'
import { loadAlarm } from '../lib/alarmLog.js'
import { nextRing } from '../lib/alarm.js'
import { dayOpenFor, saveDayOpen, leadLive, markDayTap } from '../components/home/dayOpen.js'
import { Avatar } from './ProfileHome.jsx'
import { homeSuggestion } from '../lib/homeSuggest.js'
import HomeMap from '../components/HomeMap.jsx'
import AlarmLine from '../components/AlarmLine.jsx'
import AlarmCard from '../components/AlarmCard.jsx'
import { walkNudge, fmtSteps } from '../lib/health.js'
import ConsentSheet from '../components/ConsentSheet.jsx'
import { registry } from '../modules/registry.js'
import { viewFor } from '../modules/views.js'
import { normalizeReminders } from '../lib/reminders.js'
import { coachAllowed } from '../lib/consent.js'
import { getPrefs } from '../lib/prefs.js'
import { greeting } from '../lib/greeting.js'
import { isIOSApp } from '../lib/native.js'
import { loadLater } from '../lib/pathLater.js'

// Yoga ilk yayında yalnız iPhone uygulamasında (PLAN.v3 §D.7): web'de Pratikler listelerinde yoga kutucuğu yok
export const onHome = (m, ios = isIOSApp()) => m?.id !== 'yoga' || ios
// Ana sayfadaki göz molası önerisinin açtığı 5 dk'lık nefes (modules/breath/manifest.js routes)
export const SUGGEST_BREATH = 'breath-5'
// İlk görünümde gözün boyu (pt): sığdırmanın alt ve üst sınırı (styles/home.css .hf --iris)
const IRIS_MIN = 132
const IRIS_MAX = 336
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
// D5+D6: sessiz gün deneyi kalktı; "bilerek göndermiyoruz" cümlesi de kalktı. Gün ve saat Hatırlatmalar'da seçilir.
function ReminderAsk({ time, onAnswer }) {
  const [busy, setBusy] = useState(false)
  return (
    <section className="card tone-accent hh-ask" aria-label="Hatırlatma">
      <span className="eyebrow">Hatırlatma · isteğe bağlı</span>
      <h3>Günde bir mola hatırlatması ister misin?</h3>
      <p className="small">{`Günde en çok bir kez (saat ${time}), bir dakikalık mola: kalk, uzağa bak. Saatini, günlerini ve diğer hatırlatmaları Bilgi → Hatırlatmalar'dan seçersin.`}</p>
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
// trialNote ({ daysLeft }) + onTrialNote: izni olmayana deneme 5. gün şeridi.
// alarmStatus ({ platform, auth }; App) + alarmTest (14.00 eşiği): "Bugünün yolu"nun altındaki alarm kartı (AlarmCard).
// İlk ekran kalabalıklaşmasın: kart yuvası tek (izin kartı → izin ayar yolu → deneme şeridi), rıza sayfası açıkken boş.
// healthSheetKind: 'health' ya da eski metne izin vermiş kişiye 'healthUpdate' (lib/consent.js; cevap yine onHealthConsent).
// onYogaMorning: yoga sabah kartı cevabı kayda yazılınca (App kayıtları yeniler).
export default function Home({ tests, sessions, settings, distanceTracked, trueDepth, eyeBudget = null, premium = true, member = false, askConsent = false, onConsent, health = null, askHealth = false, onHealthConsent, healthSheetKind = 'health', onCoach, onStart: onStartProp, onAsk, onSaveProfile, reminderAsk = false, onReminders, focus = null, focusBlock = null, onStopFocus, trialNote = null, onTrialNote, alarmStatus = null, alarmTest = false, onYogaMorning, sky = null }) {
  const [permNote, setPermNote] = useState(false) // "Evet" dendi ama izin kapalı: ayar yolu (bir kez, bu ekranda)
  const now = new Date()
  // Ana sayfadan açılan her şey günün ilk dokunuşudur (günün cümlesi o ana kadar görünür; components/home/dayOpen.js)
  const onStart = (route) => {
    markDayTap()
    onStartProp?.(route)
  }
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
  // Dün yolun bütün durakları bitti mi (günün cümlesi, öncelik 7): dünün yolu gerçek yol koduyla, kayıtlar ya da gün
  // değişince bir kez. Bugünün yolundan ÖNCE hesaplanır (components/home/dayLead.js pathDoneOn'daki not).
  const yday = useMemo(
    () => pathDayOn({ modules: registry.live, tests, sessions, now, profile: settings.profile, premium }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tests, sessions, today],
  )
  const yesterdayDone = Boolean(yday?.allDone && yday.total > 0)
  const pathCtx = { tests, sessions, now, profile: settings.profile, eye: eyeBudget, gate: { firstTestOnly: tests.length === 0 && !premium }, later, progression }
  const plan = buildPath(registry.live, pathCtx)
  // Yolda bugün ilk kez gelen durak ya da basamak: "Yeni" rozeti (§1; 1. günde yok). D9 v2 (sahibin kuralı): yalnız kişinin
  // gerçekten ilk kez gördüğü durakta; geçmiş kayıtlarında olan durak "Yeni" olmaz (lib/pathAhead.js seenBefore: 70 günlük
  // kullanıcıda Nefes, 2. günde 1. günün Nefes'i).
  const seen = useMemo(
    () => seenBefore({ modules: registry.live, tests, sessions, now }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tests, sessions, today],
  )
  const newKeys = newStopKeys(pathCtx, plan.stops).filter((k) => !plan.stops.some((s) => s.key === k && seen(s)))
  // Uzun yol (sahibin isteği D9): bugünden sonraki günler gerçek yol koduyla ve merdivenlerle (lib/pathAhead.js; kişi her
  // günün yolunu bitirir varsayımıyla), bugünden önceki yol günleri ve bugünün yolun kaçıncı günü olduğu. Kayıtlar ya da
  // gün değişince bir kez. projectDays bitince bugünün yolunu yeniden kurar (modules/routine'in bugünkü grup adları).
  const ahead = useMemo(
    () => projectDays({ modules: registry.live, tests, sessions, now, profile: settings.profile, progression, plan }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tests, sessions, today, laterKeys],
  )
  // Gelecek günlerde gerçekten ilk kez gelen duraklar (yarının "Yeni"si ve bölüm kartlarının "Yeni:" satırı)
  const firsts = useMemo(() => firstNews(ahead, plan.stops, seen), [ahead, seen]) // eslint-disable-line react-hooks/exhaustive-deps
  const dayN = (progression?.pathDay ?? 0) + 1
  const updDay = updateDay(progression)
  // Bölüm ödülleri (onaylı cümle 13): 1. bölüm iris haritasının ilk görünüme gelmesi; 4. bölüm iris haritasının yeniden
  // yapılması, yalnız başlangıç haritası varken ve yeniden yapılmamışken
  const iris = settings.profile?.iris
  const prizes = { 1: CHAPTER_PRIZE[1], ...(iris?.baseline?.date && !iris?.recheck?.date ? { 4: CHAPTER_PRIZE[4] } : {}) }
  // Yarın çalacak alarm (lib/alarm.js nextRing; alarm yalnız iPhone uygulamasında kurulur): yolda yarının başında durak
  const tomorrowKey = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12))
  const ring = nextRing(loadAlarm(), now)
  const alarmNext = ring && dayKey(ring) === tomorrowKey ? ring : null
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
  const slot = sheetOpen ? null : reminderAsk && onReminders ? 'remind' : permNote ? 'perm' : trialNote && onTrialNote ? 'trial' : null
  // Nef tanıtım kartı da bir rıza kartı: hatırlatma kartı açıkken gizlenir (ikisi aynı anda çıkmasın)
  const prefs = getPrefs()
  const coachIntro = !coachAllowed(prefs, settings.consents).on && !prefs.coachHidden
  const answerReminders = async (yes) => {
    const perm = await onReminders(yes)
    if (yes && perm === 'denied') setPermNote(true)
  }
  const waterOn = rem.optIn === 'yes' && rem.types.water.on
  const WaterIcon = viewFor('water')?.icon ?? GlassWater

  // ---- İlk görünüm (ana sayfa 5 saniye yeniden tasarımı: Yön B "Senin gözün" + değerlendiricilerin aşıları) ----
  // Ekran boyunda tek sahne: selam, kişinin gözü (her gün bir ışın), günün tek cümlesi, tek büyük düğme, "Bugünün yolu"
  // satırı. Sahnenin altındaki her şey (sakin seçenekler, yol, Gelişim, Nef, Pratikler) ekranın altından başlar; sekme
  // çubuğunun ardında yalnız zemin kalır. Yolun mantığı, düğmenin önceliği ve rotaları değişmez; yalnız sunuş.
  // İlk Bakış da gözün ışınına sayılır (components/home/dayRays.js lookDates): kurulum günü ilk ışın yanar. Göz bebeğinin
  // gün sayısına yalnız geçmişteki, kaydı olmayan İlk Bakış günleri eklenir (1. gün "İlk gün" kalır).
  const rays = dayRays({ tests, sessions, now, looks: lookDates(settings.profile) })
  const pupil = pupilOf({ totalDays: totalDays + rays.lookDays.length, streak })
  // Sahibin kararı (2026-10-01, tur 4 sorusu): yeni kullanıcının ilk 7 gününde iris ilk görünümde yok, yerine yolun
  // kendisi öne gelir (sahne ekran boyu değil; yol büyük düğmenin hemen altından başlar). Gün sayısı gözün kendi sayacı:
  // bugünden önce kaydı ya da İlk Bakış'ı olan günler (dayRays days). 7 gün dolunca eskisi gibi.
  const firstWeek = rays.days.length < IRIS_FROM_DAY
  const firstDay = rays.days.length === 0
  // İlk 7 gün (D9): sahnede bölümün yedi günü (ChapterStrip); "Dün yolunun bütün duraklarını tamamladın." (dayLead.js
  // öncelik 7) yolun içinde Nef'in yorumu. "Bu hafta N/3 gün" ilk 7 günde ilk görünümde yok.
  const todayRay = { n: todayRayN(rays), done: plan.total > 0 ? Boolean(plan.allDone) : rays.today > 0 }
  const rayWord = todayRay.done ? '; bugünün ışını da yandı' : pupil.word && todayRay.n > 0 ? '; ilk ışının yandı' : ''
  // Tek sayı (sahibin kararı 2026-10-01): ilk görünümde yalnız "Bu hafta N/3 gün" (sıfırsa hiç; karar 5d). "N gün seri" ve
  // "N gün seninle" ilk görünümde yok: göz bebeğinde sayı yok, seri yayı çizilmez (DayIris).
  const weekShown = week.done > 0 ? weekLine : null
  const eyeLabel = `Gözün. Her gün bir ışın${rayWord}. Gelişim'i aç.` // hafta satırı gözün altında yazılı
  // Göz ilk günden sahnenin boşluğunu doldurur (ana karar turu 1: gün sayısıyla büyüyen göz 1. ve 2. günde küçük ve
  // soluk kaldı, üstünde ~200 px boşluk; "tek ışınlı büyük boş disk" kaygısının yerini aldı)
  // Günün tek cümlesi (plan §3.F.4; components/home/dayLead.js). İlk dokunuşa kadar ya da en çok 1 saat; bugün bir durak
  // yapıldıysa ilk dokunuş olmuştur. Sonra Ana sayfa önerisinin satırı (düğmeyi tekrar ediyorsa hiçbiri). Kırmızı ya da
  // sarı görme uyarısında cümle yok, uyarı sahnenin başında. Göz molası ve yürüme önerisi canlıdır: cümlenin yerini alır.
  const { rec: openRec, fresh: openFresh } = dayOpenFor(now)
  // Büyük düğmenin durağı (yolun sıradaki durağı; düğme başka bir öneriyi gösteriyorsa yok). Cümle düğmeyi tekrar etmez:
  // düğmenin durağı yeniyse ya da haftalık E testiyse haberi düğme verir (dayLead.js; 5 saniye kapı turu 2).
  const nextGo = sug.primary.kind === 'path' && plan.next ? plan.next : null
  const cands = r.alert ? [] : leadCandidates({
      now,
      setupDate: prof.date,
      firstLook: settings.profile?.firstLook ?? null,
      baseline: settings.profile?.iris?.baseline?.date ?? null,
      recheck: settings.profile?.iris?.recheck?.date ?? null,
      plan: { stops: plan.stops, next: nextGo },
      newKeys,
      lastDay: rays.last,
      yesterdayDone,
      update: updDay,
    })
  const picked = r.alert ? null : pickLead(cands.filter((c) => !OFF_FIRST_VIEW.has(c.p)), openRec.prev)
  const leadOn = !r.alert && leadLive(openRec, now) && rays.today === 0
  const liveNudge = sug.primary.kind === 'breath' || Boolean(walk)
  // S0 Ç19'un "N gün bu hafta" satırı yok: haftanın sayısı gözün altında tek yerde (sahibin kararı 2026-10-01, tek sayı)
  const weekDone = null
  // Bugünün cümlesi önce (sahibin kararı 2026-10-01: "Bugünkü yolun N dakika, ilk durağın X."); o günün öteki cümlesi
  // (7. gün, aradan dönüş, bugün yeni, güncelleme günü …) altında küçük satır olur, çizimsiz. Bugünün cümlesi yalnız yol
  // başlamamışken; sonra bugünkü kural.
  // Tur 6: başlıktaki toplam duraklarda yazan sürelerin toplamı (dayLead.js stopMinutes; mola gerçek süresiyle)
  const todayLine = leadOn ? todayLead(plan, nextGo, pathMinutes(plan.stops, restMin)) : null
  // Cümlenin altındaki satır (D9 tur 2): kilometre taşı (7., 28., 30. gün) vurgulu; güncelleme gününde yenilenen yolun
  // yenileri adlarıyla ("Yolun yenilendi. Bugün yeni: nefes, yukarı–aşağı."; iki onaylı kalıbın birleşimi: tek başına "Yolun
  // yenilendi." boş kaldı); "Bugün yeni: daire" düğmenin durağından başka bir hareketi söylediği için ilk görünümde değil,
  // yolda (Nef'in yorumu ve durağın "Yeni" rozeti): cümle, düğme ve satır aynı durağı söyler.
  // Güncelleme günü (D9 v2, sahibin kararı): onaylı Nef cümlesi 4, vurgulu ("Yolun yenilendi: bugün N yeni durak var, ilki X.")
  const updNews = plan.stops.filter((s) => newKeys.includes(s.key) && !s.restSlot && !s.done)
  const updLine = updNews.length ? NEF.update(updNews.length, shownTitle(updNews[0])) : null
  const subOf = (pk) => {
    if (!pk || pk.p === 6) return null
    if (pk.list?.length) return updLine
    return leadSub(pk)
  }
  const lead = r.alert ? null : liveNudge ? { text: sug.primary.line } : todayLine ? { ...todayLine, sub: subOf(picked) ?? heroLine(nextGo), mile: Boolean(picked && (isMileLine(picked.text) || picked.list?.length)), mileIcon: picked?.list?.length ? 'new' : null } : leadOn && picked ? { ...picked, list: null } : nefRepeats ? null : { text: sug.primary.line, ...weekDone }
  // Nef'in yolun içindeki yorumu (sahibin isteği D9): ilk görünümde yazılmayan onaylı cümlelerden biri, yeni cümle yok.
  // Sıra: kurulum gününün kırpma sayısı, bugünün yeni durağı (ilk görünümde yazılmadıysa), iris haritasının yaklaşan günü,
  // dünün yolu. Dünün yolu yazılmaz: bugünkü yol bittiyse (akşam "dün" bayat), kilometre taşı ya da güncelleme günü
  // (o günün kendi haberi var; güncelleme gününde dünün yolu bu yol değildi).
  // D9 v2 (sahibin kararı 3): yolda Nef yalnız onaylı 13 cümleyle (dayLead.js NEF). Yolun başında 1–4 (güncelleme günü,
  // aradan dönüş, dün yol bitti, dün yarım kaldı; ilk görünümde yazılan cümle tekrar edilmez); bugünün sonunda 5–7.
  const lastGap = rays.last ? calendarDaysBetween(rays.last, today) : null
  const firstViewLine = lead?.sub ?? lead?.text ?? null
  // D9 v2 tur 3: 30. gün ve bölümün son günü sabah Nef o günü söyler (onaylı cümle 14, 15; 1–3'ün önünde)
  const dayPrize = prizes[chapterOf(dayN)] ?? null
  // Tur 3c: ilk görünümde o güne ait kilometre taşı satırı yazıldıysa Nef o sabah susar (yazılan satırın kendisinden okunur)
  // Tur 4: güncelleme gününün cümlesi (4) ilk görünümdeyse de susar
  const mileShown = quietsNef([lead?.text, lead?.sub], updLine)
  const nefTop = nefTopLine({ allDone: Boolean(plan.allDone), update: updDay && updNews.length ? { n: updNews.length, name: shownTitle(updNews[0]) } : null, gap: lastGap, yday, skip: firstViewLine, n: dayN, chapterEnd: chapterEnd(dayN), chapter: chapterOf(dayN), prize: dayPrize, mileShown })
  const nefEnd = nefEndLine({ n: dayN, allDone: Boolean(plan.allDone), chapterEnd: chapterEnd(dayN), prize: dayPrize, top: nefTop, mileShown })
  useEffect(() => {
    if (openFresh) saveDayOpen({ ...openRec, lead: leadOn && picked && !liveNudge ? picked.p : null })
  })
  // Büyük düğme: yolun sıradaki durağıysa adı, süresi (ölçümde yok: S0 kararı 22) ve ne olduğu yoldaki duraktan
  // ("Sağ–sol bakış": S0 kararı 4; haftalık E testi "E testi" + "haftada bir": dayLead.js goFace); öteki önerilerde
  // lib/homeSuggest.js'in başlığı. Rota ve öncelik aynı (startSuggest).
  // Bugünün cümlesi durağın adını söylüyorsa düğme adı tekrar etmez (OZET.md şikâyet 10: aynı işin adı üç yerde): büyük
  // yazı "Güne başla", altında durağın ne olduğu; süre cümlede.
  // Tek kaynak (tur 4 notu: cümle "ilk durağın Isınma" derken kart "Göz kırp, sağa bak, sola bak" gösteriyordu): kartın
  // büyük yazısı cümlenin söylediği durağın adıdır (dayLead.js firstStop; todayLead da aynı işlevi okur). Süre cümlede.
  // "haftada bir" etiketi ilk gün yok (tur 4 notu: 1. gün kartında anlamsız).
  const faced = nextGo ? { ...goFace(nextGo), title: firstStop(nextGo).name } : null
  if (faced && firstDay) faced.tag = null
  const go = nextGo
    ? todayLine
      ? { title: faced.title, stop: nextGo, Icon: stopIcons[nextGo.id], bare: true }
      : { eyebrow: sug.primary.eyebrow, ...faced, minutes: stopMinutes(nextGo, restMin) && !nextGo.hideMinutes ? `${stopMinutes(nextGo, restMin)} dk` : null, stop: nextGo, Icon: stopIcons[nextGo.id] }
    : { eyebrow: sug.primary.eyebrow, title: sug.primary.title, sub: sug.primary.sub, kind: sug.primary.kind }
  // Gözün boyu ilk görünüme sığar: sahne ekrandan uzunsa göz küçülür, boş yer kalırsa büyür (en az 132, en çok 336 pt ya
  // da ekran genişliği). Yoga sabah kartı, çalışma şeridi ya da görme uyarısı olan sabahlarda da düğme ilk görünümde kalır.
  // İlk 7 gün (D9): sahne ekran boyu değil; yol büyük düğmenin hemen altından başlar (ilk görünümde yolun başı görünür).
  const sceneRef = useRef(null)
  const heroRef = useRef(null)
  const heroInRef = useRef(null)
  const lpRef = useRef(null)
  useLayoutEffect(() => {
    // Sahne en az ekran boyu (CSS min-height); düğmenin altı ile sahnenin dibi arasında kalan pay gözü büyütür. Göz en
    // büyük boyuna varınca artan pay sahnenin dibinde kalır ve yol o kadar yukarı çıkar (D9: ilk görünümün altında boşluk
    // değil yolun başı). İlk 7 günde sahne ekran boyu değil (CSS), yalnız pay sıfırlanır.
    const fit = () => {
      const scene = sceneRef.current
      const hero = heroRef.current
      if (!scene?.getBoundingClientRect || typeof getComputedStyle !== 'function') return
      if (firstWeek) {
        scene.style.marginBottom = ''
        return
      }
      const disc = scene.querySelector?.('.hi-disc')
      if (!disc?.getBoundingClientRect || !hero) return
      const cs = getComputedStyle(scene)
      const min = parseFloat(cs.minHeight)
      const pad = parseFloat(cs.paddingBottom) || 0
      const cur = disc.getBoundingClientRect().width
      if (!Number.isFinite(min) || !(cur > 0)) return
      const top = scene.getBoundingClientRect().top
      const lastEl = scene.lastElementChild
      const bottom = lastEl?.getBoundingClientRect ? lastEl.getBoundingClientRect().bottom : scene.getBoundingClientRect().bottom
      const diff = bottom - top + pad - min // > 0: sahne taşıyor; < 0: pay var
      const max = Math.min(IRIS_MAX, scene.clientWidth - 48)
      const next = Math.round(Math.max(IRIS_MIN, Math.min(max, cur - diff)))
      if (Math.abs(next - cur) >= 1) scene.style.setProperty('--iris', `${next}px`)
      const spare = Math.max(0, -diff - (next - cur))
      scene.style.marginBottom = spare > 8 ? `${-Math.round(spare + pad - 4)}px` : ''
    }
    fit()
    window.addEventListener?.('resize', fit)
    const ro = typeof ResizeObserver === 'function' && sceneRef.current ? new ResizeObserver(() => fit()) : null
    ro?.observe(sceneRef.current)
    return () => {
      window.removeEventListener?.('resize', fit)
      ro?.disconnect()
    }
  })
  // Açılış: Ana sayfa selamdan başlar (D9 v2: geçmiş Ana sayfada yok). İlk görünümün altında yolun yazıları sekme çubuğunun
  // kenarında kesilmesin: kesilecek yazı varsa yol biraz aşağı iner (yazı tümüyle çubuğun ardına geçer). Açılışta ve yazı
  // tipleri yüklenince bir kez daha.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined
    let alive = true
    const settle = () => {
      const scene = sceneRef.current
      if (!alive || !scene?.getBoundingClientRect) return
      const box = lpRef.current
      const doc = globalThis.document
      if (!box?.querySelectorAll || !doc?.querySelector) return
      box.style.paddingTop = ''
      box.style.marginTop = ''
      for (const e of box.querySelectorAll('[data-pre]')) {
        e.style.removeProperty('--pre')
        e.removeAttribute('data-pre')
      }
      const tab = doc.querySelector('.tabbar')
      const edge = tab?.getBoundingClientRect ? tab.getBoundingClientRect().top : window.innerHeight
      if (!(edge > 0)) return
      // Tur 4: sahne sekme çubuğunun ardına uzanıyorsa (320 pt, ekran boyu sahne) yol çubuğun ardındaki boşluktan değil,
      // çubuğun kenarının hemen altından başlar (kaydırınca yolun üstünde ~90 pt boş şerit kalıyordu); ilk görünüm aynı
      // Yalnız yol ekranın tümüyle altında başlıyorsa (ilk görünümde yolun hiçbir yeri yok); ilk görünüm aynı kalır
      const top0 = box.getBoundingClientRect().top
      if (top0 > window.innerHeight && window.scrollY === 0) box.style.marginTop = `${-Math.round(top0 - edge - 12)}px`
      const nodes = [...box.querySelectorAll('.lp-lb, .lp-btx, .lp-nef, .lp-day-h, .lp-tc-h, .lp-tp, .lp-tc-more, .lp-cc-t, .lp-cc-new, .lp-cc-d, .lp-cc-pr, .lp-gm, .lp-al, .lp-rem, .lp-n')]
      const els = nodes.map((e) => e.getBoundingClientRect())
      // İlk 7 gün (tur 6): yol Başla kartının hemen altından başlar; boşluk yolun başına değil, kesilecek yazının bulunduğu
      // satırın önüne girer (çizgi o boşluktan da geçer: --pre). Öteki günlerde bugünkü kural (yolun başına boşluk).
      const wk1 = Boolean(scene.classList?.contains('wk1'))
      const first = els.findIndex((r) => r.top < edge - 1 && r.bottom > edge - 6)
      const from = wk1 && first >= 0 ? els[first].top : -Infinity
      let shift = 0
      for (let k = 0; k < 12; k++) {
        const hit = els.find((r) => r.top >= from && r.top + shift < edge - 1 && r.bottom + shift > edge - 6)
        if (!hit) break
        shift = edge - hit.top + 4
      }
      if (shift > 0 && shift < 240) {
        const row = wk1 && first >= 0 ? nodes[first].closest('.lp > *, .lp-side > .lp-r') : null
        if (row) {
          row.setAttribute('data-pre', '')
          row.style.setProperty('--pre', `${Math.round(shift)}px`)
        } else box.style.paddingTop = `${Math.round(shift)}px`
      }
    }
    settle()
    const later = () => requestAnimationFrame?.(() => requestAnimationFrame?.(settle))
    globalThis.document?.fonts?.ready?.then?.(later)
    // Sahnenin boyu yazı tipleri ya da kartlar yüklenince değişebilir: bir kez daha geç (yarış; 320 koyu tema çekiminde
    // 400 ms yetmedi)
    const ts = [setTimeout(settle, 400), setTimeout(settle, 1200)]
    return () => {
      alive = false
      ts.forEach(clearTimeout)
    }
  }, [])

  const showRemind = rem.optIn !== 'yes' && slot !== 'remind'
  // Sakin seçenekler yolun içinde (D9): Dalga günün sonunda bant; "Nefes · 5 dk mola" yalnız yolun Nefes durağı
  // beklemiyorken (aynı ekranda "Nefes · Mola · 1 dk" ile yan yana iki ayrı nefes okunmasın; ana sayfa 5 sn notu 2)
  const restPending = plan.stops.some((s) => s.restSlot && !s.done)
  const altB = sug.alts.find((a) => a.kind === 'breath' && !restPending)
  // Sakin seçenek yolda nefes bandı (tur 2: düz gri kart "atlanmış durak" gibi okundu); dokununca 5 dk nefes
  const calmAlt = altB ? { title: altB.title, sub: altB.sub, onTap: () => startSuggest(altB.route) } : null
  // Bugünün yolu: ilk 7 günde gün başında büyük düğmenin durağı yolda tekrar yazılmaz (yol ilk görünümde düğmenin hemen
  // altından başlar; ad ilk görünümde bir kez). 8. günden sonra yol ilk görünümün altında: sıradaki durak yolun başında,
  // dolu ve halkalı (tur 2: "şu an buradasın" işareti yoktu).
  const todayStops = firstWeek && plan.doneCount === 0 ? plan.stops.filter((s) => s.key !== nextGo?.key) : plan.stops

  return (
    <>
      {/* Hesabı olan ve profil eşitlemeye henüz cevap vermemiş kişiye bir kez (KVKK açık rıza) */}
      {askConsent && onConsent && <ConsentSheet kind="profileSync" onAnswer={onConsent} />}
      {!askConsent && askHealth && onHealthConsent && <ConsentSheet kind={healthSheetKind} onAnswer={onHealthConsent} />}
      <section className={firstWeek ? 'hf wk1' : 'hf'} ref={sceneRef} aria-label="Bugün">
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

        {/* Hap satırı (D9): hava (kayıtlı yer ve rıza varsa; dokununca hava sayfası), iPhone'da adım ve alarm */}
        {(sky || health || alarmStatus) && (
          <div className="hh-facts hh-chips">
            {sky && <SkyChip place={sky} now={now} onOpen={() => onStart('sky')} />}
            {health && (
              <div className="hh-fact">
                <Footprints size={14} aria-hidden="true" className="f4" />
                {health.hasData ? <><b>{fmtSteps(health.today?.steps)}</b>adım bugün</> : <><b>—</b>adım · veri yok</>}
              </div>
            )}
            {alarmStatus && <AlarmLine status={alarmStatus} onStart={onStart} now={now} />}
          </div>
        )}

        {focus && onStopFocus && <FocusStrip focus={focus} now={now} block={focusBlock} onStop={onStopFocus} />}

        {/* Yoga sabah sorusu: Ana sayfanın üstünde tek kart, yalnız iPhone uygulamasında; rıza sayfası açıkken yok (yeri
            sahibin kararını bekliyor: bugünkü yerinde, selamın altında) */}
        {YogaMorningCard && isIOSApp() && !sheetOpen && <YogaMorningCard sessions={sessions} now={now} alarmStatus={alarmStatus} onSaved={onYogaMorning} onStart={onStart} />}

        {/* Kırmızı ya da sarı görme uyarısı en üstte (plan §3.F.3, §3.F.4 öncelik 0); o gün günün cümlesi yazılmaz */}
        {r.alert && (
          <section className={`card hf-alert ${r.alert === 'red' ? 'tone-danger' : 'tone-warn'}`} role="alert">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
              <p className="small">{trendMessage(r)}</p>
            </div>
          </section>
        )}

        <div className="hf-hero" ref={heroRef}>
          <div className="hf-hero-in" ref={heroInRef}>
            {firstWeek
              ? <ChapterStrip n={Math.min(dayN, IRIS_FROM_DAY)} />
              : <DayIris days={rays.days} today={todayRay} week={weekShown} seed={pupil.word} label={eyeLabel} onOpen={() => onStart('progress')} />}
            <HomeLead lead={lead} icons={stopIcons} />
          </div>
        </div>

        <HomeGo {...go} isNew={goNew} calm={sug.primary.kind === 'dalga'} onClick={() => startSuggest(sug.primary.route, sug.primary.kind)} />
      </section>

      {/* Uzun yol (D9): bugünün kalan durakları, Nef'in yorumu, yarın ve sonraki günler; bölümler ve ödüller */}
      <div className="lp-box" ref={lpRef}>
        <LongPath
          plan={plan}
          today={todayStops}
          newKeys={newKeys}
          icons={stopIcons}
          eye={eyeBudget}
          onStart={startStop}
          dalga={sug.primary.kind !== 'dalga'}
          chapter={!firstWeek}
          restMin={restMin}
          n={dayN}
          ahead={ahead}
          firsts={firsts}
          nefTop={nefTop}
          nefEnd={nefEnd}
          prizes={prizes}
          alarm={alarmNext}
          remind={showRemind}
          onRemind={() => onStart('reminders')}
          alt={calmAlt}
        />
      </div>

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
