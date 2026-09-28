// Veri merkezi: kişinin bütün kayıtları tek kapıdan, 7 alan altında (Göz, Dikkat, Farkındalık, Sakinlik, Kendine
// yaklaşım, İyi oluş, Beden). Gelişim, iris haritası, Nef ve raporlar veriyi buradan okur; kendi başına ayrı hesap
// kurmaz (ANA_BELGE.md §1 ölçüm ilkesi, §4 envanter).
//
// Kaynaklar (depolama yeri değişmez, merkez hepsini okur):
//  - tests, sessions      : lib/storage.js (gozolcum:v1) — modüllerin kayıtları
//  - istatistik çekirdeği : lib/progress.js domainSummary — modül metrikleri (zaman serisi) ve önce→sonra etkileri
//  - profile              : İlk Bakış kırpma sayısı ve 4 soru; başlangıç (iris.baseline) ve 28. gün (iris.recheck)
//  - habits               : lib/habitLog.js (mola, su) — bilerek sessions'a yazılmaz (seri/hedef/Nef'e sayılmasın,
//                           BILDIRIM_PLANI.md §7); merkez yine de okur ve Beden alanına koyar
//
// Yeni modül kuralı: kaydı sessions'a (ya da tests'e) yazar ve manifestinde progress.domain + sessions.match tanımlar;
// böylece merkez onu hangi alana koyacağını bilir. dataHub.test.js canlı her modülün merkeze ulaştığını denetler.
import { domainSummary, DOMAIN_LABEL } from './progress.js'
import { registry, DOMAINS } from '../modules/registry.js'
import { normalizeProfile } from './profile.js'

const DAY = 86400000

// Profil cevapları → alan. value: ham cevap (ölçek sorudan soruya farklı; yalnız kişinin kendisiyle karşılaştırılır).
export const ANSWER_FIELDS = [
  { key: 'blinks', domain: 'eye', label: 'İlk Bakış: 20 sn kırpma' },
  { key: 'stressNow', domain: 'calm', label: 'Stres' },
  { key: 'selfCompassion', domain: 'self', label: 'Kendine şefkat' },
  { key: 'sleep', domain: 'wellbeing', label: 'Uyku' },
  { key: 'activityDays', domain: 'body', label: 'Hareketli gün' },
]
const HABIT_DOMAIN = { mola: 'body', water: 'body' }

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

const within = (date, now, days) => {
  const t = new Date(date).getTime()
  return Number.isFinite(t) && t <= now && now - t < days * DAY
}

// Bütün veriyi 7 alan altında toplar. Saf fonksiyon: girdi aynıysa çıktı aynı.
export function hub({ tests = [], sessions = [], profile = null, habits = [], now = new Date() } = {}) {
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
