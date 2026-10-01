// Bildirim planlayıcı (saf; plan §3, §6, §7). Önümüzdeki 7 günün yerel bildirimlerini hesaplar; uygulayıcı
// (notifyApply.js) bunları tek seferlik kurar. Uygulama kapalıyken kod çalışmaz: saat ve metin kurulduğu anda
// sabitlenir, bu yüzden plan her açılışta, kayıtta, sağlık okumasında ve ayar değişince yeniden kurulur.
//
// Kurallar: her türden günde en çok 1 bildirim; yalnız kişinin seçtiği günlerde (seçilmeyen gün 'day'); geçmiş an
// kurulmaz; o gün yapılan tür gönderilmez. Kişinin seçtiği saat kaydırılmaz ve saat penceresi yok (D5+D6, sahip
// kararı 2026-10-01). Çalışma oturumu sürerken de kişinin kurduğu hatırlatmalar (74xx, Çalışma günleri dahil) seçtiği
// saatte gelir (sahip kararı 2026-10-01: "Çalışma oturumu sürerken, senin kurduğun hatırlatmalar gelsin"); bir
// hatırlatma oturum molasıyla (75xx) ±60 sn içinde çakışırsa tek bildirim kalır: hatırlatma kurulur, o mola kurulmaz
// (FOCUS_CLASH_MS). Sessiz gün deneyi kalktı: uygun her gün gönderilir (günlükte arm 'send'). VARSAYIM (D5+D6 plan
// madde 2): gece sessizliği kişinin kendi seçtiği bu saatleri engellemez (açık seçim kazanır; notifyAll gece
// kuralını yalnız yeni kaynaklara uygular).
import { NUDGE_TYPES, TYPE_INDEX, normalizeReminders, toMinutes } from '../../../src/lib/reminders.js'
import { dayKey, keyDay } from '../../../src/lib/habitLog.js'
import { FOCUS_HOURS, breakTimes } from './focus.js'
import { WEEKDAYS, mondayIndex } from '../../../src/lib/calendar.js'

export const HORIZON_DAYS = 7 // gün 0 (bugün) … 6
export const NUDGE_ID = 7400 // + gün×10 + TYPE_INDEX
export const FOCUS_ID = 7500 // + k − 1 (k. saat)
export const NOW_SHIFT_MS = 5000 // şu anki dakikaya kurulan saat bu kadar sonra gelir
const MINUTE_MS = 60000
export const FOCUS_CLASH_MS = MINUTE_MS // hatırlatmayla bu kadar (uç dahil) yakın oturum molası kurulmaz
export const LEAD_MS = 15000 // bu kadar yakın an kurulmaz (geçmiş an hemen çalar); 1 dk sonrası kurulabilsin (sahip, 2026-10-01)
const HOUR = 3600000

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
//   focus: loadFocus() · seed: artık kullanılmaz (sessiz gün zarı kalktı; eski çağrılar için kabul edilir) · log (isteğe bağlı): loadLog() — bugünün zamanı gelmiş kaydı varsa
//   ve kişi saati sonradan değiştirdiyse yeni saat bugün yine kurulur (sahip kararı 2026-10-01: "yeni saatte kurulsun");
//   o gün yapılmış olsa da gönderilir (sahip: "yine de gelsin"; yürüyüş adım koşulu türün tanımıdır, kalır). Zamanı
//   gelmemiş kaydın anı LEAD_MS içine girdiyse
//   o an planda kalır (bekleyen bildirim iptal edilmez, günün kaydı silinmez)
// Çıktı: notifications (uygulayıcıya), log (yalnız NUDGE_TYPES, gün 0–6; notifyLog.mergePlanned'e; uygun günde
//   arm 'send', atlanan günde arm null + skipReason 'day' | 'noData' | 'doneBefore'; 'focus' artık oluşmaz, yalnız eski
//   günlük kayıtlarında kalır),
//   walkGuards (native iptal: adım eşiğe ulaşınca bekleyen yürüyüş bildirimi silinir)
export function planNotifications({ now = new Date(), reminders, study = null, habits = [], sessions = [], health = null, focus = null, log = null } = {}) {
  const notifications = []
  const plannedLog = []
  const walkGuards = []
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return { notifications, log: plannedLog, walkGuards }

  const nowMs = new Date(now).getTime()
  const base = new Date(nowMs)
  const todayKey = dayKey(base)
  const span = focusSpan(focus)

  const logList = Array.isArray(log) ? log : []
  // Zamanı gelmemiş kayıtların anı (tarih|tür → ms): LEAD_MS içine girmiş an yeni kurulmaz, ama aynı anla önceden
  // planlanmışsa planda kalır. Yoksa uygulamayı hatırlatmadan hemen önce açmak bekleyen bildirimi iptal eder ve günün
  // kaydını siler (mergePlanned zamanı gelmemiş kaydı planla değiştirir).
  // Bu gün ve tür için anı `atMs` ya da sonrası olan kayıt var mı (şu anki dakikanın kaydırması bir kez yapılır)
  const loggedSince = (key, type, atMs) => logList.some((e) => e?.date === key && e?.type === type && Date.parse(e.plannedAt) >= atMs)
  const plannedAhead = new Map(
    logList.filter((e) => Date.parse(e?.plannedAt) > nowMs).map((e) => [`${e.date}|${e.type}`, Date.parse(e.plannedAt)]),
  )
  // Yapılmış olsa da gönderilir (sahip, 2026-10-01). Yalnız yürüyüş: "Adımın az olduğu günlerde" türün tanımıdır;
  // bugünün adımı eşiğe ulaştıysa kurulmaz (VARSAYIM, sahibe soruldu; native WalkGuard da aynı kuralla iptal eder)
  const avg = Number.isFinite(health?.avgSteps) && health.avgSteps > 0 ? health.avgSteps : null
  const freshToday = Number.isFinite(Date.parse(health?.readAt)) && dayKey(health.readAt) === todayKey
  const todaySteps = freshToday && Number.isFinite(health.todaySteps) ? health.todaySteps : null
  const walkDone = todaySteps != null && avg != null && todaySteps >= walkThreshold(avg, r.types.walk.time)

  const studyDays = Array.isArray(study?.days) ? study.days : []
  const studyOn = r.types.study.on && studyDays.length > 0 && toMinutes(study?.time) != null

  for (let d = 0; d < HORIZON_DAYS; d++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d)
    const key = dayKey(day)
    for (const type of NUDGE_TYPES) {
      const cfg = r.types[type]
      if (!cfg.on) continue
      const atMs = atOn(day, cfg.time).getTime()
      const ahead = plannedAhead.get(`${key}|${type}`)
      let fireMs = atMs
      if (atMs <= nowMs) {
        // Şu anki dakikaya kurulan saat (sahip kararı 2026-10-01: "birkaç saniye sonra gelsin"): dakika bitmediyse ve
        // bu an için günlükte kayıt yoksa NOW_SHIFT_MS sonra; önceden kaydırılmış an bekliyorsa aynı anla planda kalır
        if (ahead != null && ahead > nowMs && ahead >= atMs && ahead - atMs < MINUTE_MS + NOW_SHIFT_MS) fireMs = ahead
        else if (d === 0 && nowMs - atMs < MINUTE_MS && !loggedSince(key, type, atMs)) fireMs = nowMs + NOW_SHIFT_MS
        else continue // geçmiş an: kurulmaz, günlüğe de yazılmaz
      } else if (atMs <= nowMs + LEAD_MS && ahead !== atMs) continue // çok yakın yeni an kurulmaz
      const at = new Date(fireMs)
      let skipReason = null
      if (!cfg.days.includes(day.getDay())) skipReason = 'day'
      else if (type === 'walk' && avg == null) skipReason = 'noData'
      else if (d === 0 && type === 'walk' && walkDone) skipReason = 'doneBefore'
      const eligible = skipReason == null
      const arm = eligible ? 'send' : null
      plannedLog.push({ date: key, type, eligible, arm, skipReason, plannedAt: at.toISOString() })
      if (arm !== 'send') continue
      const id = NUDGE_ID + d * 10 + TYPE_INDEX[type]
      notifications.push({ id, at, type, ...textFor(type, key), extra: { kind: 'nudge', date: key, type, arm }, level: 'active' })
      if (type === 'walk') walkGuards.push({ id, date: key, threshold: walkThreshold(avg, cfg.time) })
    }
    // Çalışma günleri: günlük yok; seçili günlerde settings.reminder saatinde
    if (studyOn && studyDays.includes(WEEKDAYS[mondayIndex(day)].id)) {
      const at = atOn(day, study.time)
      if (at.getTime() > nowMs + LEAD_MS) {
        const id = NUDGE_ID + d * 10 + TYPE_INDEX.study
        notifications.push({ id, at, type: 'study', ...textFor('study', key), extra: { kind: 'nudge', date: key, type: 'study', arm: null }, level: 'active' })
      }
    }
  }

  // Çalışma oturumu: k. saatte (k = 1..hours) mola; İş/Rahatsız Etme modunda da gelsin diye timeSensitive. Yalnız
  // gündüz penceresindeki saatler kurulur (Bug 33: gece 01.00–04.00 "kalk" bildirimi; focus.breakTimes, BREAK_WINDOW).
  // Bu, kişinin seçtiği saat değil, Nefona'nın kendiliğinden kurduğu bildirim; gece koruması sürer. Kişinin kurduğu
  // bir hatırlatmayla (74xx) ±60 sn içinde çakışan mola kurulmaz: aynı dakikada iki bildirim olmasın, hatırlatma kalır.
  if (span) {
    const nudgeMs = notifications.map((n) => n.at.getTime())
    for (const t of breakTimes(span.start, span.hours)) {
      const k = Math.round((t - span.start) / HOUR)
      if (t <= nowMs) continue
      if (nudgeMs.some((m) => Math.abs(m - t) <= FOCUS_CLASH_MS)) continue
      notifications.push({ id: FOCUS_ID + k - 1, at: new Date(t), type: 'focus', ...textFor('focus', dayKey(t), k - 1), extra: { kind: 'focus', k }, level: 'timeSensitive' })
    }
  }

  notifications.sort((a, b) => a.at - b.at || a.id - b.id)
  return { notifications, log: plannedLog, walkGuards }
}
