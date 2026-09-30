// Yoga · Bugünün yolundaki durak ve sayaçları (PLAN.v3 §B.2, §B.5; yol.md §3, §5.1). Saf ve belirlenimci: yalnız
// ctx.tests, ctx.sessions, ctx.now ve ctx.later okunur, depoya bir şey yazılmaz. ctx.progression'a bağlı değildir;
// sayaçlar kayıtlardan türetilir (readingStatus'un hiç yapılmamış okuma testinde yaptığı gibi, lib/today.js:141-142).
// Ders verisi (adlar ve yayımlanmış süreler) parametre olarak gelir: lib/yogaLessons.js { LESSONS, publishedMinutes }.
// Yalnız yayımlanmış süreler aday olur ("her ders kendi denetimlerinden geçince görünür"; SAHIP_ISTEKLERI.md madde 10).
// Kayıt yardımcıları (ders kaydı, sabah sorusu, kaldığın yer) bu dosyada değil, lib/yogaRecord.js'tedir.
import { dayKey } from './calendar.js'
import { runDayOf, lastComplete, calendarDaysBetween, weeklyStatus, readingStatus } from './today.js'

// Kütüphane sırası (PLAN.v2 §A.3). Uykuya Geçiş (3) sırada yoktur; akşam ders ekranında öneri satırı olur (§B.2-6).
export const PATH_SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]
export const PATH_YOGA = {
  unlockTotalDays: 2, // kayıt bırakılan iki ayrı günden sonra; her gün açan kişide 3. gün, bugün sayılmaz (VARSAYIM)
  shortMin: 3, // kısa gün
  fullMin: 5, // tam ders günü; 15 dk yolda durak değil (§B.2-7)
  shortBeforeFull: 6, // altı kısa yoga gününden sonra ölçüm olmayan ilk gün tam ders (VARSAYIM)
  softAfterDays: 14, // son yoga gününden ≥ 14 gün sonra ders 3 dk, tam ders yok (VARSAYIM)
  morning: { 6: [5, 12] }, // Sabah Niyeti yalnız 05.00–12.00 arasında aday (VARSAYIM)
  nightFrom: 20, // 20.00–05.00: ders ekranında Uykuya Geçiş önerisi (VARSAYIM)
  nightTo: 5,
  sleepLesson: 3,
  order: 105, // 2. bölümde göz duraklarından sonra, Bugünün görevi'nden önce
}
const FULL_SEC = PATH_YOGA.fullMin * 60

// Tamamlanmış ders (modul.md §6.1: kapanışa ulaşıldı ve planlananın en az %60'ı dinlendi; kaydı yazan hesaplar)
export const isYogaDone = (s) => s?.type === 'yoga' && s.completed === true
// Planlanan süre 5 dk ya da daha uzunsa (5, 15, 20) tam ders sayılır (§B.2-3)
const isFull = (s) => Number(s?.planned) >= FULL_SEC

// Sayaçlar, yalnız bugünden önceki kayıtlarla (gün içinde değişmez):
//   totalDays       kaydı olan (test ya da pratik) ayrı gün sayısı
//   gapDays         son yoga gününden bugüne takvim günü (hiç yoksa null)
//   shortSinceFull  son tam dersten sonraki kısa yoga günü sayısı (yoga günlerini sayar, takvim günlerini değil)
//   byLesson        { [ders]: { n: tamamlanma, full: tam ders olarak tamamlanma } }
export function yogaCounters(sessions = [], tests = [], now = new Date()) {
  const today = dayKey(now)
  const before = (r) => {
    const k = runDayOf(r)
    return k != null && k < today ? k : null
  }
  const totalDays = new Set([...tests, ...sessions].map(before).filter(Boolean)).size
  const prior = sessions.filter((s) => isYogaDone(s) && before(s))
  const lastDay = prior.map(runDayOf).sort().at(-1) ?? null
  const lastFull = prior.filter(isFull).map(runDayOf).sort().at(-1) ?? ''
  const shortSinceFull = new Set(prior.filter((s) => !isFull(s) && runDayOf(s) > lastFull).map(runDayOf)).size
  const byLesson = {}
  for (const s of prior) {
    const b = (byLesson[s.lesson] ??= { n: 0, full: 0 })
    b.n += 1
    if (isFull(s)) b.full += 1
  }
  return { totalDays, gapDays: lastDay ? calendarDaysBetween(lastDay, today) : null, shortSinceFull, byLesson }
}

// Haftalık E testinin zamanı BUGÜN mü geldi? Bugünden önceki kayıtlarla hesaplanır, gün içinde değişmez. Zamanı dünden
// beri geldiyse false: yoga o gün yine yolda ("en çok bir gün"; okuma testinin kalıbı, lib/today.js:124-127).
export function weeklyDayToday(tests = [], sessions = [], now = new Date()) {
  const today = dayKey(now)
  const before = (r) => {
    const k = runDayOf(r)
    return k != null && k < today
  }
  const last = lastComplete(tests.filter(before), 'va-weekly')
  if (last) return calendarDaysBetween(runDayOf(last), today) === 7
  return ![...tests, ...sessions].some(before) // hiç kaydı yok: 1. gün
}

// Ölçüm günü: haftalık E testi bugün yolda (zamanı geldi, yarım ya da bugün bitti) ya da okuma testi bugün. Tam ders o
// güne düşmez.
const measureDay = (tests, sessions, now) => {
  const r = readingStatus(tests, now, sessions).state
  return weeklyStatus(tests, now).state !== 'idle' || r === 'due' || r === 'done'
}

// publishedMinutes: (ders) → yayımlanmış süreler (dk) ya da { [ders]: [dk, …] }
const minutesFn = (published) => (typeof published === 'function' ? published : (l) => published?.[l])
const has = (list, m) => Array.isArray(list) && list.includes(m)

// null | { lesson, minutes: 3|5, full, soft, night, done }
//  - kaydı olan gün < 2, E testi günü (bugün ders yapılmış olsa da) ya da o güne uygun yayımlanmış ders yok → null
//  - bugün tamamlanan ders gösterilir (Uykuya Geçiş dahil); yol payı 5 dk ve üstü planlanmışsa 5, değilse 3
//  - seçim: o süresi yayımlanmış, saati uygun dersler; en az tamamlanan, tam ders gününde eşitlikte en az tam
//    dinlenen, sonra kütüphane sırası
//  - tam ders günü uygun 5 dk'lık ders yoksa (henüz yayımlanmadı) o gün kısa gün olur; sayaç dolu kalır (VARSAYIM:
//    kısmi yayında yoga yoldan kaybolmasın)
//  - night: 20.00–05.00 ve Uykuya Geçiş yayımlanmış; ders ekranı öneri satırını ve geçiş düğmesini gösterir
export function pathYoga({ tests = [], sessions = [], now = new Date() } = {}, published = {}) {
  const pub = minutesFn(published)
  const c = yogaCounters(sessions, tests, now)
  if (c.totalDays < PATH_YOGA.unlockTotalDays) return null
  if (weeklyDayToday(tests, sessions, now)) return null
  const hour = new Date(now).getHours()
  const nightHour = hour >= PATH_YOGA.nightFrom || hour < PATH_YOGA.nightTo
  const sleepList = pub(PATH_YOGA.sleepLesson)
  const night = nightHour && Array.isArray(sleepList) && sleepList.length > 0
  const today = dayKey(now)
  const mine = sessions.filter((s) => isYogaDone(s) && Number.isInteger(s.lesson) && runDayOf(s) === today).at(-1)
  if (mine) {
    const full = isFull(mine)
    return { lesson: mine.lesson, minutes: full ? PATH_YOGA.fullMin : PATH_YOGA.shortMin, full, soft: false, night, done: true }
  }
  const soft = c.gapDays != null && c.gapDays >= PATH_YOGA.softAfterDays
  const wantFull = !soft && c.shortSinceFull >= PATH_YOGA.shortBeforeFull && !measureDay(tests, sessions, now)
  const n = (l) => c.byLesson[l]?.n ?? 0
  const nFull = (l) => c.byLesson[l]?.full ?? 0
  const timeOk = (l) => {
    const w = PATH_YOGA.morning[l]
    return !w || (hour >= w[0] && hour < w[1])
  }
  const pick = (minutes, full) =>
    PATH_SEQ.filter((l) => has(pub(l), minutes) && timeOk(l)).sort(
      (a, b) => n(a) - n(b) || (full ? nFull(a) - nFull(b) : 0) || PATH_SEQ.indexOf(a) - PATH_SEQ.indexOf(b),
    )[0]
  let full = wantFull
  let lesson = pick(full ? PATH_YOGA.fullMin : PATH_YOGA.shortMin, full)
  if (lesson == null && full) {
    full = false
    lesson = pick(PATH_YOGA.shortMin, false)
  }
  if (lesson == null) return null
  return { lesson, minutes: full ? PATH_YOGA.fullMin : PATH_YOGA.shortMin, full, soft, night, done: false }
}

// Yol durağı (lib/today.js manifest.today sözleşmesi). lessons: { LESSONS, publishedMinutes } (lib/yogaLessons.js).
// Yalnız iPhone uygulamasında çağrılır (isIOSApp denetimi manifestte; web'de yoga görünmez, §D.7).
//  yields: dropRank yok; yol yogayla 20 dk'yı aşacaksa o gün yolda olmaz, hiçbir durağı düşürmez (R7b)
//  later:  "Sonra yaparım" bugün denmiş (ctx.later = lib/pathLater.js loadLater(now); gün değişince geçersiz)
export function yogaPathStop(ctx = {}, { LESSONS = {}, publishedMinutes } = {}) {
  const p = pathYoga(ctx, publishedMinutes)
  if (!p) return null
  const now = ctx.now ?? new Date()
  const later = ctx.later?.day === dayKey(now) && Array.isArray(ctx.later.later) && ctx.later.later.includes('yoga')
  return {
    title: 'Yoga',
    sub: LESSONS[p.lesson]?.title ?? null,
    minutes: p.minutes,
    route: `yoga-${p.lesson}`,
    slot: 'practice',
    order: PATH_YOGA.order,
    glyph: 'lotus',
    done: p.done,
    yields: true,
    later,
    stage: { lesson: p.lesson, minutes: p.minutes, full: p.full, soft: p.soft, night: p.night },
  }
}
