// Yoga ve Meditasyon: sesli dersler (ilk bölüm: Ders 1, 2, 3, 5; yalnız yayımlanmış süreler görünür). Yaşam halkası;
// pratik. Tedavi değildir; önce → sonra puanları kişi içi "nasıl hissettin" gidişatıdır, etki kanıtı değildir.
// Plan: yoga-pilot/v3/PLAN.v3.md §B.5 (yol durağı), §D.1–D.8 (modül); ayrıntı yoga-pilot/v3/modul.md §5–§9.
// İlk yayında yalnız iPhone uygulamasında (PLAN.v3 §D.7): web'de Pratikler kutucuğu, mola listesi ve yol durağı yok.
import { isIOSApp } from '../../lib/native.js'
import { yogaPathStop } from '../../lib/yoga.js'
import { LESSONS, publishedMinutes, isPublished, pickMinutes, visibleLessons } from '../../lib/yogaLessons.js'
import { isYoga, minutesOf, dayCount } from '../../lib/yogaRecord.js'
import { withinDays } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'
import { LATER_KEY } from '../../lib/pathLater.js'
import { YOGA_OPTS_KEY, loadYogaOpts } from './opts.js'

// "Sonra yaparım" (lib/pathLater.js); "Tüm verileri sil" temizler (§B.5). Anahtarın tek kaynağı pathLater.js.
export const PATH_LATER_KEY = LATER_KEY
const HOME = { section: 'practice', order: 33 } // Nefes (30) ile Dalga (35) arası (VARSAYIM; modul.md §2.1)

const lessonNos = Object.keys(LESSONS).map(Number)
const lessonPick = (n) => (s) => (isYoga(s) && s.lesson === n ? [s.before, s.after] : null)
// Her dersin önce → sonra etkisi kendi alanında (Sakinlik, Beden, Dikkat …); Uykuya Geçiş'te önce puanı yok, etkisi yok
const effects = lessonNos
  .filter((n) => LESSONS[n].effectKey && LESSONS[n].measure)
  .map((n) => ({
    key: LESSONS[n].effectKey,
    label: `Yoga · ${LESSONS[n].title}`,
    measure: LESSONS[n].measure,
    max: 10,
    domain: LESSONS[n].domain,
    ...(LESSONS[n].better === 'down' ? { better: 'down' } : {}),
    pick: lessonPick(n),
  }))
// Nef adı (sahip onaylı 2026-10-01): genel "yoga dersi"; dersin önce → sonra anında "{ders} yoga dersi" ("Nefesin Ritmi
// yoga dersinden"). Ders adı LESSONS'tan; çekim eki genel adınkiyle aynı.
const YOGA_NAME_TR = { '': 'yoga dersi', ABL: 'yoga dersinden', ACC: 'yoga dersini', LOC: 'yoga dersinde', DAT: 'yoga dersine', INS: 'yoga dersiyle', POSS: 'yoga dersin', 'POSS-ABL': 'yoga dersinden' }
const lessonName = (title) => Object.fromEntries(Object.entries(YOGA_NAME_TR).map(([k, v]) => [k, `${title} ${v}`]))
const effectNames = Object.fromEntries(lessonNos.filter((n) => LESSONS[n].effectKey && LESSONS[n].measure).map((n) => [LESSONS[n].effectKey, { tr: lessonName(LESSONS[n].title) }]))
const lessonOfEffect = (key) => lessonNos.find((n) => LESSONS[n].effectKey === key) ?? null

// Nef kartı düğmesi (puan kartı; onaylı kalıp "Bu akşam da Nefesin Ritmi · 12 dk"): dersin rotası, dersin adı ve ders
// ayrıntısı açılınca seçili gelen süre (Yoga.jsx: yolun süresi o dersse o, yoksa son seçilen, yoksa dersin varsayılanı;
// lib/yogaLessons.js pickMinutes). Yalnız iPhone uygulamasında ve görünen (yayımlanmış) derste; değilse düğme yok.
function todayStop(ctx = {}) {
  if (!isIOSApp()) return null // ilk yayında yoga yalnız iPhone uygulamasında (lib/native.js:10; §D.7)
  const stop = yogaPathStop(ctx, { LESSONS, publishedMinutes })
  if (!stop || !LESSONS[stop.stage?.lesson]) return null // < 2 kayıtlı gün, E testi günü ya da uygun yayımlanmış ders yok
  if (!stop.done && !isPublished(stop.stage.lesson, stop.minutes)) return null // çalınamayan durak gösterilmez
  return stop
}

function nefStart(ctx = {}) {
  const n = lessonOfEffect(ctx.facts?.effect)
  if (n == null || !isIOSApp() || !visibleLessons(ctx.now ?? new Date()).includes(n)) return null
  let path = null
  try {
    // view.jsx pathMinutesFor ile aynı: manifestin today() durağı bu dersse onun süresi
    const stop = todayStop({ tests: ctx.tests ?? [], sessions: ctx.sessions ?? [], now: ctx.now ?? new Date(), profile: ctx.profile ?? null })
    path = stop?.stage?.lesson === n ? stop.stage.minutes : null
  } catch {
    path = null
  }
  const minutes = pickMinutes(n, path ?? loadYogaOpts(ctx.storage).minutesByLesson[n])
  return minutes ? { route: `yoga-${n}`, minutes, name: { tr: LESSONS[n].title } } : null
}

export default {
  id: 'yoga',
  routes: ['yoga', ...lessonNos.map((n) => `yoga-${n}`)],
  title: 'Yoga',
  label: 'yoga dersi',
  ring: 'life',
  kind: 'practice',
  gates: {}, // gözler kapalı ders: göz bütçesine sayılmaz, molada açık
  storageKeys: [YOGA_OPTS_KEY, PATH_LATER_KEY],
  // "Bana hatırlat" (bildirim PLAN.v1 §A.1 modül tablosu; metin lib/remindTexts.js, sahip onaylı metin-B1a-onay.md).
  // Kendi rotası, sakin pencere. Kaynaklar moszeik2025 (YG1, YG3) ve luu2024 (YG2); radin2025 yalnız meditasyon içeriği
  // (sources.js only), burada yok. moszeik2025 görünür bilim satırı taşımaz (karar 4). VARSAYIM: defaultTime yok.
  remind: { route: 'yoga', window: 'calm', science: ['moszeik2025', 'luu2024'] },
  // Pratikler kutucuğu yalnız iPhone uygulamasında (web'de ders oynatıcısı yok). Getter: her okunuşta yeniden bakılır.
  get home() {
    return isIOSApp() ? HOME : undefined
  },
  progress: {
    domain: 'calm', // 28 günlük şeritte modülün tek alanı; kayıt başına alan sessions.domainOf ile (PLAN.v3 §D.5)
    effects,
    metrics: [{
      key: 'yoga-uyku-dalma',
      label: 'Uykuya dalma kolaylığı (ertesi sabah)',
      unit: 'puan',
      better: 'up',
      domain: 'wellbeing',
      series: ({ sessions = [] }) => sessions
        .filter((s) => isYoga(s) && s.lesson === 3 && Number.isFinite(s.sleepEase))
        .map((s) => ({ date: s.date, value: s.sleepEase })),
    }],
  },
  sessions: {
    match: isYoga, // s?.type === 'yoga'
    countsTowardGoal: true,
    // İsteğe bağlı: kaydın alanı dersin alanıdır (Ders 1 Sakinlik, 2 Beden, 3 İyi oluş, 5 Dikkat)
    domainOf: (s) => LESSONS[s?.lesson]?.domain ?? 'calm',
    describe(s, { seconds } = {}) {
      const L = LESSONS[s?.lesson]
      const rated = Number.isFinite(s?.before) && Number.isFinite(s?.after) ? `${L?.measure ?? 'puan'} ${s.before}→${s.after}` : null
      // "yarıda kaldı" yalnız kapanışa ulaşmamış derste: "Kapanışa geç" ile erken bitirilen ders ekranda "Ders bitti"
      // olarak kapanır; geçmişte, CSV'de ve PDF'te ona "yarıda kaldı" denmez (tamamlanma sayısına yine girmez)
      const halfway = !s?.completed && !s?.reachedClosing
      return {
        title: `Yoga · ${L?.title ?? ''}`.trim(),
        detail: join([rated, halfway ? 'yarıda kaldı' : null, durationPart(seconds, false)]),
      }
    },
    // Rekor kutusu "Yoga · pratik yapılan gün" (modul.md §7) bu bölümde yok: sessions.best tanımlamak lib/stats.js
    // summary().bests'e yeni bir anahtar ekler ve stats.test.js:224'teki birebir beklentiyi bozar (açık iş).
  },
  stats(sessions, now) { // en çok 3 satır; kayıt yoksa []
    const week = withinDays(sessions.filter(isYoga), now)
    if (!week.length) return []
    return [
      { label: 'Yoga · 7 gün', value: `${minutesOf(week)}${NBSP}dk`, sub: `${week.length}${NBSP}ders` },
      { label: 'Tamamlanan', value: `${week.filter((s) => s.completed).length}${NBSP}ders`, sub: `son 7${NBSP}gün` },
      { label: 'Pratik günü', value: `${dayCount(week)}${NBSP}gün`, sub: `son 7${NBSP}gün` },
    ]
  },
  // Nef'e yalnız dört sayı (modul.md §8): puan, ders adı, zorlanma ve uyku cevabı gitmez; son 7 günde yoga yoksa null
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isYoga), now)
    if (!week.length) return null
    return { sessions7: week.length, minutes7: minutesOf(week), completed7: week.filter((s) => s.completed).length, days7: dayCount(week) }
  },
  // Bugünün yolu (PLAN.v3 §B.5): ctx.progression'a bağlı değil; sayaçlar kayıtlardan (lib/yoga.js pathYoga). Yalnız
  // yayımlanmış süreler aday olur (publishedMinutes); yoga hiçbir durağı düşürmez (yields: yalnız sığarsa yolda).
  // Durak: { title: 'Yoga', sub: ders adı, minutes, route: 'yoga-<ders>', slot: 'practice', order: 105, glyph: 'lotus',
  //          done, yields: true, later, stage: { lesson, minutes, full, soft, night } } (lib/yoga.js yogaPathStop)
  today: todayStop,
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Sahip kararı: uyku metriği (yoga-uyku-dalma) Nef'te anılmaz (lib/nef/moments.js EXCLUDED_METRICS); metricWords yok.
  // Kanıt: remind.science ile aynı havuz (radin2025 yalnız meditasyon içeriği, burada yok).
  nef: {
    name: { tr: YOGA_NAME_TR, effects: effectNames },
    moments: ['recallEffect', 'effectPattern', 'firstTime', 'returnAfterGap'],
    start: nefStart,
    evidence: ['moszeik2025', 'luu2024'],
    note: 'Sesli yoga dersleri; derse göre öncesi ve sonrası gerginlik, beden gerginliği ya da odak puanı (0–10). Nef uyku hakkında yorum yapmaz.',
  },
}
