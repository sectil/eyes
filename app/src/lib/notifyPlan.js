// Bildirim planlayıcı (saf; plan §3, §6, §7). Önümüzdeki 7 günün yerel bildirimlerini hesaplar; uygulayıcı
// (notifyApply.js) bunları tek seferlik kurar. Uygulama kapalıyken kod çalışmaz: saat ve metin kurulduğu anda
// sabitlenir, bu yüzden plan her açılışta, kayıtta, sağlık okumasında ve ayar değişince yeniden kurulur.
//
// Kurallar: her deney türünden günde en çok 1 bildirim; geçmiş an kurulmaz; o gün yapılan tür gönderilmez;
// çalışma oturumu sürerken diğer türler gelmez; uygun günlerin bir kısmında zar gereği bilerek gönderilmez
// (sessiz gün; bildirim yok, günlükte var). Aynı saat çakışması ayar anında engellenir (reminders.timeError);
// burada saat kaydırılmaz.
import { NUDGE_TYPES, TYPE_INDEX, WINDOW, WATER_LAST, normalizeReminders, toMinutes } from './reminders.js'
import { dayKey, keyDay, habitsOn } from './habitLog.js'
import { FOCUS_HOURS } from './focus.js'
import { BREATH_DONE_SEC } from './notifyLog.js'
import { isBreath } from './breath.js'
import { WEEKDAYS, mondayIndex } from './calendar.js'

export const SILENT_RATE = 0.25 // VARSAYIM (plan §6): uygun günlerin %25'inde bilerek gönderilmez
export const HORIZON_DAYS = 7 // gün 0 (bugün) … 6
export const NUDGE_ID = 7400 // + gün×10 + TYPE_INDEX
export const FOCUS_ID = 7500 // + k − 1 (k. saat)
export const LEAD_MS = 60000 // bu kadar yakın an kurulmaz (geçmiş an hemen çalar)
const HOUR = 3600000

// [0,1) deterministik zar: tohum + tarih + tür → FNV-1a karması → mulberry32'nin bir adımı
export function dice(seed, date, type) {
  const s = `${seed}|${date}|${type}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let t = (h + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Bildirim saatine kadar "beklenen" adım: ortalama × (saat / 24). VARSAYIM (plan §3): gün boyu eşit dağılım.
// Native WalkGuard bugünün adımı bu eşiğe ulaşınca bekleyen yürüyüş bildirimini iptal eder.
export function walkThreshold(avgSteps, time) {
  const m = toMinutes(time)
  if (!Number.isFinite(avgSteps) || m == null) return null
  return Math.round((avgSteps * m) / 1440)
}

// Kısa, suçlamasız, sağlık iddiasız; her türde en az biri öz-yeterlik ifadesi (Tannenbaum 2015). Yürüyüş
// metinlerinde rakam yok (kilit ekranında adım bilgisi görünmesin). 5–6 metin sırayla (VARSAYIM; Bell 2023).
export const TEXTS = {
  mola: [
    { title: 'Bir dakikalık mola', body: 'Bir dakika yeter: kalk, uzağa bak.' },
    { title: 'Mola zamanı', body: 'İstersen şimdi kalk, pencereden uzağa bak.' },
    { title: 'Kısa bir ara', body: 'Kalk, biraz gerin, sonra uzağa bak. Bir dakikada yapabilirsin.' },
    { title: 'Mola', body: 'Başını ekrandan kaldır, uzaktaki bir noktaya bak. Sonra devam edersin.' },
    { title: 'Bir dakika senin', body: 'Kalk, pencereye kadar yürü, uzağa bak.' },
    { title: 'Ara ver', body: 'Dokun, bir dakikalık molayı birlikte yapalım.' },
  ],
  walk: [
    { title: 'Kısa yürüyüş', body: 'Birkaç dakikalık yürüyüş? Şimdi yapabilirsin.' },
    { title: 'Biraz hareket', body: 'Kalkıp biraz yürümek ister misin?' },
    { title: 'Yürüyüş molası', body: 'Koridorda ya da dışarıda kısa bir tur atabilirsin.' },
    { title: 'Kalk, biraz yürü', body: 'İstersen şimdi birkaç dakika yürü, sonra devam et.' },
    { title: 'Kısa bir tur', body: 'Su almaya ya da pencereye kadar yürüyebilirsin.' },
  ],
  breath: [
    { title: 'Nefes', body: '1 dakika nefes? Dokun, birlikte yapalım.' },
    { title: 'Bir dakika nefes', body: 'İstersen şimdi yavaşça nefes al, uzun ver.' },
    { title: 'Nefes arası', body: 'Bir dakikan varsa birlikte yavaş nefes alabiliriz.' },
    { title: 'Yavaş nefes', body: 'Omuzlarını bırak; bir dakika nefesine odaklanabilirsin.' },
    { title: 'Kısa nefes', body: 'Dokun, bir dakikalık rehberli nefes başlasın.' },
  ],
  water: [
    { title: 'Su', body: 'Birkaç yudum su?' },
    { title: 'Bir bardak su', body: 'İstersen şimdi birkaç yudum iç.' },
    { title: 'Su molası', body: 'Suyun yanında mı? Birkaç yudum alabilirsin.' },
    { title: 'Su', body: 'Kalkıp suyunu tazelemek ister misin?' },
    { title: 'Birkaç yudum', body: 'Birkaç yudum iç, sonra dokunup kaydedebilirsin.' },
  ],
  study: [
    { title: 'Göz çalışması', body: 'Bugün çalışma günün. Hazırsan başlayabilirsin.' },
    { title: 'Çalışma zamanı', body: 'Bugünün yolu seni bekliyor. İstersen şimdi başla.' },
    { title: 'Çalışma günü', body: 'Planladığın saat geldi. Dokun, birlikte başlayalım.' },
    { title: 'Göz çalışması', body: 'Birkaç dakikan varsa kaldığın yerden devam edebilirsin.' },
    { title: 'Çalışma günü', body: 'Kısa bir göz çalışması için uygun bir an olabilir.' },
  ],
  focus: [
    { title: 'Çalışma oturumu', body: 'Bir saat oldu. Kalk, uzağa bak; sonra devam edebilirsin.' },
    { title: 'Mola zamanı', body: 'Bir saat oldu. İstersen bir dakika kalk, uzağa bak.' },
    { title: 'Kısa mola', body: 'Bir saat doldu. Kalk, biraz gerin, sonra devam et.' },
    { title: 'Çalışma oturumu', body: 'Dokun, bir dakikalık molayı yap; sonra kaldığın yerden sürdürürsün.' },
    { title: 'Ara ver', body: 'Bir saat geçti. Uzağa bakıp biraz yürüyebilirsin.' },
  ],
}

// TEXTS[type][(dönem günü + kaydırma) % n]; kaydırma deney türlerinde TYPE_INDEX (aynı gün türler farklı sırada)
export function textFor(type, key, offset = TYPE_INDEX[type] ?? 0) {
  const list = TEXTS[type]
  const t = list[(((keyDay(key) + offset) % list.length) + list.length) % list.length]
  return { title: t.title, body: t.body }
}

// O günün yerel saatiyle an (takvim aritmetiği: yaz saati geçişinde de 12:30 12:30 kalır)
const atOn = (day, time) => {
  const m = toMinutes(time)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60, 0, 0)
}

// focus: loadFocus sonucu ({ startedAt, hours, … }) ya da null
function focusSpan(focus) {
  const start = Date.parse(focus?.startedAt)
  if (!Number.isFinite(start) || !FOCUS_HOURS.includes(focus.hours)) return null
  return { start, end: start + focus.hours * HOUR, hours: focus.hours }
}

// Girdiler:
//   reminders: settings.reminders (ham; burada normalize edilir) · study: settings.reminder ({ days, time })
//   habits: loadHabits() · sessions: store.sessions · health: { todaySteps, avgSteps, readAt } | null
//   focus: loadFocus() · seed: getSeed() · log (isteğe bağlı): loadLog() — bugünün zamanı gelmiş kaydı varsa
//   (saat sonradan değişti) o tür bugün ikinci kez kurulmaz; zamanı gelmemiş kaydın anı LEAD_MS içine girdiyse
//   o an planda kalır (bekleyen bildirim iptal edilmez, günün kaydı silinmez)
// Çıktı: notifications (uygulayıcıya), log (yalnız deney türleri, gün 0–6; notifyLog.mergePlanned'e),
//   walkGuards (native iptal: adım eşiğe ulaşınca bekleyen yürüyüş bildirimi silinir)
export function planNotifications({ now = new Date(), reminders, study = null, habits = [], sessions = [], health = null, focus = null, seed = '', log = null } = {}) {
  const notifications = []
  const plannedLog = []
  const walkGuards = []
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return { notifications, log: plannedLog, walkGuards }

  const nowMs = new Date(now).getTime()
  const base = new Date(nowMs)
  const todayKey = dayKey(base)
  const span = focusSpan(focus)
  const inFocus = (t) => span != null && t >= span.start && t < span.end
  const from = toMinutes(WINDOW.from)
  const to = toMinutes(WINDOW.to)
  const waterLast = toMinutes(WATER_LAST)

  const logList = Array.isArray(log) ? log : []
  // Bugünün zamanı gelmiş kaydı olan türler (bildirim gitti ya da sessiz kaldı)
  const firedToday = new Set(logList.filter((e) => e?.date === todayKey && Date.parse(e.plannedAt) <= nowMs).map((e) => e.type))
  // Zamanı gelmemiş kayıtların anı (tarih|tür → ms): LEAD_MS içine girmiş an yeni kurulmaz, ama aynı anla önceden
  // planlanmışsa planda kalır. Yoksa uygulamayı hatırlatmadan hemen önce açmak bekleyen bildirimi iptal eder ve günün
  // kaydını siler (mergePlanned zamanı gelmemiş kaydı planla değiştirir).
  const plannedAhead = new Map(
    logList.filter((e) => Date.parse(e?.plannedAt) > nowMs).map((e) => [`${e.date}|${e.type}`, Date.parse(e.plannedAt)]),
  )
  // Bugün yapıldı mı (yalnız gün 0)
  const todayHabits = habitsOn(habits, todayKey)
  const list = Array.isArray(sessions) ? sessions : []
  const avg = Number.isFinite(health?.avgSteps) && health.avgSteps > 0 ? health.avgSteps : null
  const freshToday = Number.isFinite(Date.parse(health?.readAt)) && dayKey(health.readAt) === todayKey
  const todaySteps = freshToday && Number.isFinite(health.todaySteps) ? health.todaySteps : null
  const doneToday = {
    mola: todayHabits.some((h) => h.type === 'mola'),
    water: todayHabits.some((h) => h.type === 'water'),
    breath: list.some((s) => isBreath(s) && s.seconds >= BREATH_DONE_SEC && dayKey(s.date) === todayKey),
    walk: todaySteps != null && avg != null && todaySteps >= walkThreshold(avg, r.types.walk.time),
  }

  const studyDays = Array.isArray(study?.days) ? study.days : []
  const studyOn = r.types.study.on && studyDays.length > 0 && toMinutes(study?.time) != null

  for (let d = 0; d < HORIZON_DAYS; d++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d)
    const key = dayKey(day)
    for (const type of NUDGE_TYPES) {
      const cfg = r.types[type]
      if (!cfg.on) continue
      const at = atOn(day, cfg.time)
      const atMs = at.getTime()
      if (atMs <= nowMs) continue // geçmiş an: kurulmaz, günlüğe de yazılmaz
      if (atMs <= nowMs + LEAD_MS && plannedAhead.get(`${key}|${type}`) !== atMs) continue // çok yakın yeni an kurulmaz
      if (d === 0 && firedToday.has(type)) continue
      const m = toMinutes(cfg.time)
      let skipReason = null
      if (m < from || m > to || (type === 'water' && m > waterLast)) skipReason = 'window'
      else if (r.thin[type] === 'alt' && keyDay(key) % 2 !== 0) skipReason = 'thin'
      else if (type === 'walk' && avg == null) skipReason = 'noData'
      else if (inFocus(at.getTime())) skipReason = 'focus'
      else if (d === 0 && doneToday[type]) skipReason = 'doneBefore'
      const eligible = skipReason == null
      // Zar yalnız uygun günde atılır
      const arm = eligible ? (dice(seed, key, type) < SILENT_RATE ? 'silent' : 'send') : null
      plannedLog.push({ date: key, type, eligible, arm, skipReason, plannedAt: at.toISOString() })
      if (arm !== 'send') continue
      const id = NUDGE_ID + d * 10 + TYPE_INDEX[type]
      notifications.push({ id, at, type, ...textFor(type, key), extra: { kind: 'nudge', date: key, type, arm }, level: 'active' })
      if (type === 'walk') walkGuards.push({ id, date: key, threshold: walkThreshold(avg, cfg.time) })
    }
    // Çalışma günleri: deneyde değil (günlük yok, zar yok); seçili günlerde settings.reminder saatinde
    if (studyOn && studyDays.includes(WEEKDAYS[mondayIndex(day)].id)) {
      const at = atOn(day, study.time)
      if (at.getTime() > nowMs + LEAD_MS && !inFocus(at.getTime())) {
        const id = NUDGE_ID + d * 10 + TYPE_INDEX.study
        notifications.push({ id, at, type: 'study', ...textFor('study', key), extra: { kind: 'nudge', date: key, type: 'study', arm: null }, level: 'active' })
      }
    }
  }

  // Çalışma oturumu: k. saatte (k = 1..hours) mola; İş/Rahatsız Etme modunda da gelsin diye timeSensitive
  if (span) {
    for (let k = 1; k <= span.hours; k++) {
      const t = span.start + k * HOUR
      if (t <= nowMs) continue
      notifications.push({ id: FOCUS_ID + k - 1, at: new Date(t), type: 'focus', ...textFor('focus', dayKey(t), k - 1), extra: { kind: 'focus', k }, level: 'timeSensitive' })
    }
  }

  notifications.sort((a, b) => a.at - b.at || a.id - b.id)
  return { notifications, log: plannedLog, walkGuards }
}
