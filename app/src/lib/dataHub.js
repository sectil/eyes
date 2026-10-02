// Veri merkezi: kişinin bütün kayıtları tek kapıdan, 7 alan altında (Göz, Dikkat, Farkındalık, Sakinlik, Kendine
// yaklaşım, İyi oluş, Beden). Gelişim, iris haritası, Nef ve raporlar veriyi buradan okur; kendi başına ayrı hesap
// kurmaz (ANA_BELGE.md §1 ölçüm ilkesi, §4 envanter).
//
// Kaynaklar (depolama yeri değişmez, merkez hepsini okur):
//  - tests, sessions      : lib/storage.js (gozolcum:v1) — modüllerin kayıtları
//  - istatistik çekirdeği : lib/progress.js domainSummary — modül metrikleri (zaman serisi) ve önce→sonra etkileri
//  - profile              : İlk Bakış kırpma sayısı ve 4 soru; başlangıç (iris.baseline) ve 28. gün (iris.recheck)
//  - habits               : lib/habitLog.js (mola, su) — bilerek sessions'a yazılmaz (seri/hedef/Nef'e sayılmasın,
//                           BILDIRIM_PLANI.md §7); merkez yine de okur ve Beden alanına koyar. Alarm günleri
//                           (lib/alarmLog.js alarmHabits) aynı yoldan İyi oluş alanına; okuyan: loadHubHabits
//
// Yeni modül kuralı: kaydı sessions'a (ya da tests'e) yazar ve manifestinde progress.domain + sessions.match tanımlar;
// böylece merkez onu hangi alana koyacağını bilir. Kayıt başına alan isteyen modül (ör. yoga: her ders kendi alanında)
// isteğe bağlı sessions.domainOf(s) verir. dataHub.test.js canlı her modülün merkeze ulaştığını denetler.
import { domainSummary, DOMAIN_LABEL, FEEL_ONLY_MODULES, acuteEffects } from './progress.js'
import { registry, DOMAINS } from '../modules/registry.js'
import { normalizeProfile } from './profile.js'
import { dayKey } from './calendar.js'
import { keyDay } from './habitLog.js'
import { activitiesFrom } from './stats.js'
import { ANSWER_FIELDS } from './iris.js'

const DAY = 86400000

// Profil cevapları → alan: tek kaynak lib/iris.js (iris hücreleri de oradan; DENETIM Ö-10 (b)). Buradan da dışa verilir.
export { ANSWER_FIELDS }
// alarm: uyanma işareti ya da sabah cevabı olan gün (lib/alarmLog.js alarmHabits; Scott 2021, WHO-5 uyku maddesi).
// CSV'nin alışkanlık satırları da bu eşlemeyi okur (lib/exportData.js; Ö-7).
export const HABIT_DOMAIN = { mola: 'body', water: 'body', alarm: 'wellbeing' }
export const HABIT_LABEL = { mola: 'Mola', water: 'Su', alarm: 'Alarm' }

// Kaydın alanı (tek kaynak): alan özetleri, 28 günlük şerit ve kaynak sayımı, iris hücreleri (App) ve CSV'nin süre
// satırı (lib/exportData.js) buradan okur. Kaydı tanıyan modül (sessions.match) kayıt başına alan verebilir
// (sessions.domainOf; PLAN.v3 §D.5); vermezse, DOMAINS dışında bir şey dönerse ya da hata verirse modülün tek alanı
// (progress.domain). Kaydı tanıyan modül yoksa null. Görme/okuma testleri ayrıca Göz'e (TEST_DOMAIN).
export function domainOfSession(s) {
  const m = registry.forSession(s)
  if (!m) return null
  if (typeof m.sessions?.domainOf === 'function') {
    try {
      const d = m.sessions.domainOf(s)
      if (DOMAINS.includes(d)) return d
    } catch {
      // bozuk domainOf kaydı düşürmez: modülün alanı
    }
  }
  return m.progress?.domain ?? null
}
const TEST_DOMAIN = 'eye'

function answerSeries(profile) {
  const iris = normalizeProfile(profile ?? {}).iris ?? {}
  const snaps = [iris.baseline, iris.recheck].filter((x) => x && x.date)
  return ANSWER_FIELDS.map((f) => ({
    ...f,
    series: snaps.map((s) => ({ date: s.date, value: s[f.key] })).filter((p) => Number.isFinite(p.value)),
  })).filter((a) => a.series.length)
}

// bozuk kayıt (null, nesne değil) merkeze girmez
const ok = (x) => x != null && typeof x === 'object'

const within = (date, now, days) => {
  const t = new Date(date).getTime()
  return Number.isFinite(t) && t <= now && now - t < days * DAY
}

// Kayıt sayıları GÜN sayar (Ö-5, Kü-1; plan §3.5 madde 2): total kaydı olan takvim günü, days7/days28 bugün dâhil son
// 7/28 takvim günü (yerel). Bugünden sonraki tarih sayılmaz. Bir görme testinin gözleri aynı gündedir; kayıt sayısı
// (gözler tek kayıt) haritanın kaynak satırında (growthMap sources n).
function recordDays(records, now) {
  const today = keyDay(dayKey(new Date(now)))
  const days = new Set()
  for (const r of records) {
    const x = new Date(r?.date).getTime()
    if (Number.isFinite(x)) days.add(keyDay(dayKey(new Date(x))))
  }
  let total = 0
  let days7 = 0
  let days28 = 0
  for (const d of days) {
    if (d > today) continue
    total++
    if (d > today - 7) days7++
    if (d > today - 28) days28++
  }
  return { total, days7, days28 }
}

// Bütün veriyi 7 alan altında toplar. Saf fonksiyon: girdi aynıysa çıktı aynı.
export function hub({ tests = [], sessions = [], profile = null, habits = [], now = new Date() } = {}) {
  tests = tests.filter(ok)
  sessions = sessions.filter(ok)
  const t = new Date(now).getTime()
  const core = domainSummary({ tests, sessions, now })
  // "veri var" bütün geçmişten (etkiler hükümde son 28 gün, ama eski etkili oturum da alanın verisidir)
  const effectDomains = new Set(acuteEffects(sessions).map((e) => e.domain))
  const answers = answerSeries(profile)
  const out = {}
  for (const d of DOMAINS) {
    const own = sessions.filter((s) => domainOfSession(s) === d)
    const ownTests = d === TEST_DOMAIN ? tests : []
    const ownHabits = habits.filter((h) => HABIT_DOMAIN[h?.type] === d)
    const records = [...own, ...ownTests]
    const c = core[d] ?? { metrics: [], effects: [] }
    out[d] = {
      domain: d,
      label: DOMAIN_LABEL[d],
      metrics: c.metrics,
      effects: c.effects,
      ...(c.eye ? { eye: c.eye } : {}),
      ...(c.who5 ? { who5: c.who5 } : {}),
      answers: answers.filter((a) => a.domain === d),
      habits: { total: ownHabits.length, days7: new Set(ownHabits.filter((h) => within(h.at, t, 7)).map((h) => h.date)).size },
      records: recordDays(records, t),
    }
    const a = out[d]
    // "veri var" kaydın kendisinden (tarihsiz kayıt da sayılır; gün sayısından bağımsız, bugünkü kural)
    a.hasData = records.length > 0 || a.habits.total > 0 || a.answers.length > 0 || a.metrics.length > 0 || effectDomains.has(d) || (a.who5?.n ?? 0) > 0
  }
  return { domains: out, now: new Date(t).toISOString() }
}

// Merkezin özeti: hangi alanda veri var, hangisinde yok (Gelişim "henüz verisi olmayan" satırı, iris dolu/boş)
export const domainsWithData = (h) => DOMAINS.filter((d) => h?.domains?.[d]?.hasData)

// ---------- Gelişim haritası (Artifact "Nefona Gelişim Haritası", onaylı) ----------
// Dilimin doluluğu = düzen: pencere (28 gün) içinde o alanda kaydı olan gün sayısı. Ölçüm değil, yapılanın kendisi.
// Dış kenar yayı = doğrulanmış değişim: yalnız istatistik ya da yayımlanmış eşik değişimi ölçüm hatasından
// ayırabildiğinde 'up' (iyileşiyor) / 'down' (geriliyor); yoksa null (doğal oynama ya da henüz belirsiz).
// Karşılaştırma: 'recent' son 28 gün, 'first' ilk kaydın günüyle başlayan 28 gün. Yay yalnız 'recent'te anlamlı.
export const WINDOW_DAYS = 28
// İki pencere en az bir hafta ayrışınca karşılaştırma gösterilir
export const COMPARE_MIN_DAYS = WINDOW_DAYS + 7

const dayAt = (t) => dayKey(new Date(t))

// Apple Sağlık adımlı günü (Ö-9; plan §3.4 ve §13): adım kişinin kendi ortancasına ulaştıysa Hareket (body) günü
// sayılır. Ortanca, eldeki son 60 günün (health.stepRows; App.jsx summarizeHealth) adımı sıfırdan büyük günlerinin
// ortancasıdır; bu tür gün 7'den azsa adım günü sayılmaz (yalnız satırda görünür). Genel eşik yok (sağlık hedefi gibi
// okunur). Adım depoya yazılmaz; ilk gün (sinceStart) ve "veri var" adımdan etkilenmez.
export const STEP_MIN_DAYS = 7
export function stepDays(health) {
  const rows = (Array.isArray(health?.stepRows) ? health.stepRows : []).filter((r) => r && typeof r.date === 'string' && Number.isFinite(keyDay(r.date)) && Number.isFinite(r.steps) && r.steps > 0)
  if (rows.length < STEP_MIN_DAYS) return { median: null, days: new Set(), stepDaysN: rows.length }
  const s = rows.map((r) => r.steps).sort((a, b) => a - b)
  const m = s.length >> 1
  const median = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
  return { median, days: new Set(rows.filter((r) => r.steps >= median).map((r) => r.date)), stepDaysN: rows.length }
}

function domainDays({ tests, sessions, profile, habits }) {
  const days = Object.fromEntries(DOMAINS.map((d) => [d, new Set()]))
  const add = (d, date) => {
    const t = new Date(date).getTime()
    if (days[d] && Number.isFinite(t)) days[d].add(dayAt(t))
  }
  for (const s of sessions) {
    const d = ok(s) ? domainOfSession(s) : null
    if (d) add(d, s.date)
  }
  for (const t of tests) if (ok(t)) add(TEST_DOMAIN, t.date)
  for (const h of habits) if (HABIT_DOMAIN[h?.type]) add(HABIT_DOMAIN[h.type], h.at)
  const iris = normalizeProfile(profile ?? {}).iris ?? {}
  for (const snap of [iris.baseline, iris.recheck]) {
    if (!snap?.date) continue
    for (const f of ANSWER_FIELDS) if (Number.isFinite(snap[f.key])) add(f.domain, snap.date)
  }
  return days
}

// Kayıtların başladığı gün (karşılaştırma penceresinin başı)
export function firstDay({ tests = [], sessions = [], habits = [], profile = null } = {}) {
  const iris = normalizeProfile(profile ?? {}).iris ?? {}
  let min = Infinity
  for (const d of [...tests.map((t) => t?.date), ...sessions.map((s) => s?.date), ...habits.map((h) => h?.at), iris.baseline?.date]) {
    const x = new Date(d).getTime()
    if (Number.isFinite(x) && x < min) min = x
  }
  return Number.isFinite(min) ? min : null
}

// Takvim günü farkı (saat değil): dün 23.00'te başlayan için bugün 07.00 "2. gün"dür
export const calendarDays = (from, to) => keyDay(dayKey(new Date(to))) - keyDay(dayKey(new Date(from)))

// Alanın doğrulanmış değişimi (gelisim-merkezi PLAN.v1 §3.3; onaylı SONSUZ_YOL.PLAN.v1 §3.B.4). Tek hesap: harita yayı,
// Ana sayfa ve growthCenter bunu okur (K1).
//  - Göz uyarısı (sarı/kırmızı, kötüleşme) ve WHO-5 'down' her şeyin önündedir: 'down' (karışık kuralına girmez).
//  - Öteki durumlarda metrik ve etkiler: biri 'worse' öteki 'better' ise status null ve mixed true ("karışık");
//    yalnız 'worse' varsa 'down'; yalnız 'better' varsa (göz iyileşmesi, WHO-5 'up' dâhil) 'up'; yoksa null.
//  - Metrikte m.verdict ?? m.status okunur (ölçü kuralı v2; yalnız status taşıyan eski girdiler aynen geçer).
//  - Yalnız "nasıl hissettin" modüllerinin (FEEL_ONLY_MODULES: yoga) metrik ve etkileri hükme girmez (Ö-1).
//  - Etkiler alan özetinde zaten son 28 gün ve ≥ 3 oturumla gelir (progress.js domainSummary; Ö-3).
const feelOnly = (x) => FEEL_ONLY_MODULES.has(x?.module)
export function changeDetail(dom) {
  if (!dom) return { status: null, mixed: false, first: false }
  const eye = dom.eye
  const who5 = dom.who5
  const metrics = (dom.metrics ?? []).filter((m) => !feelOnly(m))
  const effects = (dom.effects ?? []).filter((e) => !feelOnly(e))
  const verdictOf = (m) => m.verdict ?? m.status
  // first: önde gelen (göz uyarısı / WHO-5 düşüşü)
  if (eye?.alert === 'red' || eye?.alert === 'yellow' || eye?.trend === 'worsening' || who5?.status === 'down') return { status: 'down', mixed: false, first: true }
  const worse = metrics.some((m) => verdictOf(m) === 'worse') || effects.some((e) => e.sig && e.gain < 0)
  const better = eye?.trend === 'improving' || who5?.status === 'up' || metrics.some((m) => verdictOf(m) === 'better') || effects.some((e) => e.sig && e.gain > 0)
  if (worse && better) return { status: null, mixed: true, first: false }
  return { status: worse ? 'down' : better ? 'up' : null, mixed: false, first: false }
}
export const verifiedChange = (dom) => (dom ? changeDetail(dom).status : null)

// 'va-daily': kısa test (eski adı günlük test; 2026-09-29'dan beri isteğe bağlı)
const TEST_LABEL = { 'va-daily': 'Kısa görme testi', 'va-weekly': 'Haftalık görme testi', reading: 'Okuma testi' }
const STEPS_LABEL = 'Apple Sağlık adımı'

// Harita: alan başına { days, frac, status, mixed, strip (28 gün, eskiden bugüne), sources } + pencere bilgisi.
// health (isteğe bağlı, App.jsx biçimi): Apple Sağlık'ta kendi ortancasına ulaşan adımlı gün Beden şeridine girer (Ö-9).
// sources: penceredeki kayıtlar kaynak başına { key, label, n (kayıt; görme testinin gözleri tek kayıt) }; sourceDays
// verilirse ayrıca days (gün; growthCenter okur, Ö-5). Bugünkü biçim (key, label, n) değişmez.
export function growthMap({ tests = [], sessions = [], profile = null, habits = [], health = null, now = new Date(), window = 'recent', sourceDays = false } = {}) {
  tests = tests.filter(ok)
  sessions = sessions.filter(ok)
  const t = new Date(now).getTime()
  const start = firstDay({ tests, sessions, habits, profile })
  const sinceStart = start == null ? 0 : calendarDays(start, t) + 1
  const from = window === 'first' && start != null ? new Date(new Date(start).setHours(0, 0, 0, 0)).getTime() : new Date(new Date(t).setHours(0, 0, 0, 0)).getTime() - (WINDOW_DAYS - 1) * DAY
  const keys = Array.from({ length: WINDOW_DAYS }, (_, i) => dayAt(from + i * DAY + DAY / 2))
  const all = domainDays({ tests, sessions, profile, habits })
  const steps = stepDays(health)
  for (const k of steps.days) all.body.add(k)
  const h = window === 'recent' ? hub({ tests, sessions, profile, habits, now }) : null
  // pencere gün anahtarlarıyla (yaz saati geçişinde saat kayması olmasın)
  const keySet = new Set(keys)
  const inWin = (date) => {
    const x = new Date(date).getTime()
    return Number.isFinite(x) && keySet.has(dayAt(x))
  }
  // oturum → (modül, kaydın alanı) eşlemesi bir kez (alan döngüsünde 7 kez değil). Alan domainOfSession'dan: şeridin
  // günleriyle (domainDays) aynı kaynak; kayıt başına alan veren modül (yoga) her kaydıyla kendi alanında sayılır.
  const winSessions = sessions
    .filter((s) => ok(s) && inWin(s.date))
    .map((s) => ({ m: registry.forSession(s), d: domainOfSession(s), day: dayAt(new Date(s.date).getTime()) }))
    .filter((x) => x.m && x.d)
  // Görme testleri lib/stats.js activitiesFrom kuralıyla: bir testin gözleri tek kayıt (Ö-5)
  const winTests = activitiesFrom(tests, []).filter((a) => inWin(a.date))
  const domains = {}
  for (const d of DOMAINS) {
    const strip = keys.map((k) => all[d].has(k))
    const days = strip.filter(Boolean).length
    // Kaynaklar: penceredeki kayıtlar modül (ya da test/alışkanlık/adım) başına; n kayıt, days gün
    const src = new Map()
    const bump = (key, label, day) => {
      const x = src.get(key) ?? { label, n: 0, set: new Set() }
      x.n++
      x.set.add(day)
      src.set(key, x)
    }
    for (const x of winSessions) if (x.d === d) bump(x.m.id, x.m.title, x.day)
    if (d === TEST_DOMAIN) for (const a of winTests) bump(`test:${a.type}`, TEST_LABEL[a.type] ?? 'Görme testi', dayAt(a.ts))
    for (const x of habits) if (HABIT_DOMAIN[x?.type] === d && inWin(x.at)) bump(`habit:${x.type}`, HABIT_LABEL[x.type], dayAt(new Date(x.at).getTime()))
    if (d === 'body') for (const k of keys) if (steps.days.has(k)) bump('health:steps', STEPS_LABEL, k)
    const ch = h ? changeDetail(h.domains[d]) : { status: null, mixed: false }
    domains[d] = {
      domain: d,
      label: DOMAIN_LABEL[d],
      days,
      frac: days / WINDOW_DAYS,
      strip,
      status: ch.status,
      mixed: ch.mixed,
      sources: [...src.entries()].map(([key, v]) => ({ key, label: v.label, n: v.n, ...(sourceDays ? { days: v.set.size } : {}) })).sort((a, b) => b.n - a.n),
      summary: h?.domains[d] ?? null,
    }
  }
  return { window, from: new Date(from).toISOString(), sinceStart, canCompare: sinceStart >= COMPARE_MIN_DAYS, domains, steps: { median: steps.median, countedDays: steps.days.size } }
}

// En az düzenli alan (öneri için): pencerede en az günü olan; eşitlikte haritadaki sıra (Göz tepede)
// İyi oluş varsayılan sırada yok: tek kaydı 14 günde bir WHO-5; pratikle dolmaz, vakti gelince ayrıca önerilir.
export function weakestDomain(map, order = ['eye', 'focus', 'awareness', 'calm', 'self', 'body']) {
  let best = null
  for (const d of order) {
    const x = map?.domains?.[d]
    if (x && (!best || x.days < best.days)) best = x
  }
  return best
}
