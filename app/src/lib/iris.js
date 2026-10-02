// İris haritası (Artifact "Nefona Başlangıç Kartı", onaylı): göz bebeğinin çevresinde Gelişim'in 7 alanı. Kurulumda
// başlangıç haritası dolar (İlk Bakış + 4 soru), Dikkat ve Farkındalık ilk görevlerle dolar; 28. günde aynı sorular
// yeniden sorulur ve iki harita yan yana görülür. Değerler tanı ya da puan değil; yalnız kişinin kendisiyle karşılaştırması.
import { normalizeProfile } from './profile.js'

// Saat yönünde, Göz tepede (çizim sırası: lib/irisDraw.js)
export const IRIS_ORDER = ['eye', 'focus', 'awareness', 'calm', 'self', 'wellbeing', 'body']
export const RECHECK_DAYS = 28
const DAY = 86400000

// Profil cevapları → alan (tek kaynak; DENETIM Ö-10 (b): eşleme önceden burada ve lib/dataHub.js'te ayrı ayrı yazılıydı).
// value: ham cevap (ölçek sorudan soruya farklı; yalnız kişinin kendisiyle karşılaştırılır). lib/dataHub.js bunu okur
// ve aynı adla dışa verir. Bu dosya merkeze (dataHub) bağlanmaz: dataHub → registry → profileQuestions → iris döngüsü
// olmasın diye merkezin çıktısı irisCells'e parametreyle (hub) verilir.
export const ANSWER_FIELDS = [
  { key: 'blinks', domain: 'eye', label: 'İlk Bakış: 20 sn kırpma' },
  { key: 'stressNow', domain: 'calm', label: 'Stres' },
  { key: 'selfCompassion', domain: 'self', label: 'Kendine şefkat' },
  { key: 'sleep', domain: 'wellbeing', label: 'Uyku' },
  { key: 'activityDays', domain: 'body', label: 'Hareketli gün' },
]

// Profildeki son cevaplardan bir anlık görüntü (başlangıç ya da 28. gün). blinkMethod: kırpma sayısının ölçüldüğü yöntem
// (İlk Bakış: 'truedepth' | 'camera' | 'self'; DENETIM Kü-9). Başlangıçta kendi sayımı, 28. günde TrueDepth olabilir;
// farklı yöntemle ölçülen iki sayı yan yana karşılaştırılmaz (lib/growthCenter.js blinkOf). Kırpma ölçülmediyse ya da eski
// kayıtta alan yoktur (lib/profile.js normalizeSnap yalnız tanınan yöntemi tutar).
export function snapshot(profile, date = new Date().toISOString()) {
  const p = normalizeProfile(profile)
  return { date, blinks: p.firstLook?.blinks ?? null, ...(p.firstLook?.method ? { blinkMethod: p.firstLook.method } : {}), stressNow: p.stressNow, sleep: p.sleep, activityDays: p.activityDays, selfCompassion: p.selfCompassion }
}

// Alan başına hücre: { domain, filled, value }. Soruyla dolan alanlarda value sayı (ANSWER_FIELDS).
//  - hub verilirse (lib/dataHub.js hub çıktısı; DENETIM Ö-10 (b), plan §4.3): hücre, cevabı varsa ya da merkez o alanda
//    veri görüyorsa (hasData: oturum, test, WHO-5, mola/su, alarm, etki) dolu. Merkezle iris aynı şeyi söyler.
//  - hub verilmezse bugünkü kural: Dikkat ve Farkındalık o alandan bir oturum varsa dolu (domainOf: oturum → alan;
//    modules/registry.js üzerinden verilir, burada saf kalsın diye parametre), öbürleri yalnız cevapla.
export function irisCells(snap, { sessions = [], domainOf = () => null, hub = null } = {}) {
  const s = snap ?? {}
  const did = (d) => sessions.some((x) => domainOf(x) === d)
  const val = Object.fromEntries(ANSWER_FIELDS.map((f) => [f.domain, s[f.key]]))
  return IRIS_ORDER.map((domain) => {
    const v = val[domain] ?? null
    if (hub) return { domain, filled: v != null || hub.domains?.[domain]?.hasData === true, value: v }
    if (!(domain in val)) return { domain, filled: did(domain), value: null }
    return { domain, filled: v != null, value: v }
  })
}
export const filledIndexes = (cells) => cells.map((c, i) => (c.filled ? i : -1)).filter((i) => i >= 0)

// Kurulumdaki başlangıç: yoksa kaydedilir, varsa dokunulmaz (sonradan Profilim'den cevap değişse de başlangıç sabit)
export function withBaseline(profile, date = new Date().toISOString()) {
  const p = normalizeProfile(profile)
  if (p.iris.baseline) return p
  return { ...p, iris: { ...p.iris, baseline: snapshot(p, date) } }
}
export function withRecheck(profile, date = new Date().toISOString()) {
  const p = normalizeProfile(profile)
  return { ...p, iris: { ...p.iris, recheck: snapshot(p, date) } }
}

// 28. gün geldi mi (başlangıç var, yeniden sorulmadı)
export function recheckDue(profile, now = new Date()) {
  const b = normalizeProfile(profile).iris
  if (!b.baseline || b.recheck) return false
  return new Date(now).getTime() - new Date(b.baseline.date).getTime() >= RECHECK_DAYS * DAY
}
