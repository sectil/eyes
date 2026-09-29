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
// böylece merkez onu hangi alana koyacağını bilir. dataHub.test.js canlı her modülün merkeze ulaştığını denetler.
import { domainSummary, DOMAIN_LABEL } from './progress.js'
import { registry, DOMAINS } from '../modules/registry.js'
import { normalizeProfile } from './profile.js'
import { dayKey } from './calendar.js'
import { keyDay } from './habitLog.js'

const DAY = 86400000

// Profil cevapları → alan. value: ham cevap (ölçek sorudan soruya farklı; yalnız kişinin kendisiyle karşılaştırılır).
export const ANSWER_FIELDS = [
  { key: 'blinks', domain: 'eye', label: 'İlk Bakış: 20 sn kırpma' },
  { key: 'stressNow', domain: 'calm', label: 'Stres' },
  { key: 'selfCompassion', domain: 'self', label: 'Kendine şefkat' },
  { key: 'sleep', domain: 'wellbeing', label: 'Uyku' },
  { key: 'activityDays', domain: 'body', label: 'Hareketli gün' },
]
// alarm: uyanma işareti ya da sabah cevabı olan gün (lib/alarmLog.js alarmHabits; Scott 2021, WHO-5 uyku maddesi)
const HABIT_DOMAIN = { mola: 'body', water: 'body', alarm: 'wellbeing' }
const HABIT_LABEL = { mola: 'Mola', water: 'Su', alarm: 'Alarm' }

// Kaydın alanı: modülün bildirdiği (sessions.match) ya da görme/okuma testi → Göz
export function domainOfSession(s) {
  return registry.forSession(s)?.progress?.domain ?? null
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

// Bütün veriyi 7 alan altında toplar. Saf fonksiyon: girdi aynıysa çıktı aynı.
export function hub({ tests = [], sessions = [], profile = null, habits = [], now = new Date() } = {}) {
  tests = tests.filter(ok)
  sessions = sessions.filter(ok)
  const t = new Date(now).getTime()
  const core = domainSummary({ tests, sessions, now })
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
      records: { total: records.length, days7: records.filter((r) => within(r.date, t, 7)).length, days28: records.filter((r) => within(r.date, t, 28)).length },
    }
    const a = out[d]
    a.hasData = a.records.total > 0 || a.habits.total > 0 || a.answers.length > 0 || a.metrics.length > 0 || a.effects.length > 0 || (a.who5?.n ?? 0) > 0
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

// Alanın doğrulanmış değişimi: göz uyarısı ya da gerileyen ölçü/etki önce (temkin), sonra iyileşme
export function verifiedChange(dom) {
  if (!dom) return null
  const eye = dom.eye
  const who5 = dom.who5
  const downs = [
    eye?.alert === 'red' || eye?.alert === 'yellow' || eye?.trend === 'worsening',
    who5?.status === 'down',
    dom.metrics?.some((m) => m.status === 'worse'),
    dom.effects?.some((e) => e.sig && e.gain < 0),
  ]
  if (downs.some(Boolean)) return 'down'
  const ups = [eye?.trend === 'improving', who5?.status === 'up', dom.metrics?.some((m) => m.status === 'better'), dom.effects?.some((e) => e.sig && e.gain > 0)]
  return ups.some(Boolean) ? 'up' : null
}

// 'va-daily': kısa test (eski adı günlük test; 2026-09-29'dan beri isteğe bağlı)
const TEST_LABEL = { 'va-daily': 'Kısa görme testi', 'va-weekly': 'Haftalık görme testi', reading: 'Okuma testi' }

// Harita: alan başına { days, frac, status, strip (28 gün, eskiden bugüne), sources } + pencere bilgisi
export function growthMap({ tests = [], sessions = [], profile = null, habits = [], now = new Date(), window = 'recent' } = {}) {
  tests = tests.filter(ok)
  sessions = sessions.filter(ok)
  const t = new Date(now).getTime()
  const start = firstDay({ tests, sessions, habits, profile })
  const sinceStart = start == null ? 0 : calendarDays(start, t) + 1
  const from = window === 'first' && start != null ? new Date(new Date(start).setHours(0, 0, 0, 0)).getTime() : new Date(new Date(t).setHours(0, 0, 0, 0)).getTime() - (WINDOW_DAYS - 1) * DAY
  const keys = Array.from({ length: WINDOW_DAYS }, (_, i) => dayAt(from + i * DAY + DAY / 2))
  const all = domainDays({ tests, sessions, profile, habits })
  const h = window === 'recent' ? hub({ tests, sessions, profile, habits, now }) : null
  // pencere gün anahtarlarıyla (yaz saati geçişinde saat kayması olmasın)
  const keySet = new Set(keys)
  const inWin = (date) => {
    const x = new Date(date).getTime()
    return Number.isFinite(x) && keySet.has(dayAt(x))
  }
  // oturum → modül eşlemesi bir kez (alan döngüsünde 7 kez değil)
  const winSessions = sessions.filter((s) => ok(s) && inWin(s.date)).map((s) => registry.forSession(s)).filter(Boolean)
  const domains = {}
  for (const d of DOMAINS) {
    const strip = keys.map((k) => all[d].has(k))
    const days = strip.filter(Boolean).length
    // Kaynaklar: penceredeki kayıtlar modül (ya da test/alışkanlık) başına
    const src = new Map()
    const bump = (key, label) => src.set(key, { label, n: (src.get(key)?.n ?? 0) + 1 })
    for (const m of winSessions) if (m.progress?.domain === d) bump(m.id, m.title)
    if (d === TEST_DOMAIN) for (const x of tests) if (ok(x) && inWin(x.date)) bump(`test:${x.type}`, TEST_LABEL[x.type] ?? 'Görme testi')
    for (const x of habits) if (HABIT_DOMAIN[x?.type] === d && inWin(x.at)) bump(`habit:${x.type}`, HABIT_LABEL[x.type])
    domains[d] = {
      domain: d,
      label: DOMAIN_LABEL[d],
      days,
      frac: days / WINDOW_DAYS,
      strip,
      status: h ? verifiedChange(h.domains[d]) : null,
      sources: [...src.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.n - a.n),
      summary: h?.domains[d] ?? null,
    }
  }
  return { window, from: new Date(from).toISOString(), sinceStart, canCompare: sinceStart >= COMPARE_MIN_DAYS, domains }
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
