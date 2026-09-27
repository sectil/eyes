// İris haritası (Artifact "Nefona Başlangıç Kartı", onaylı): göz bebeğinin çevresinde Gelişim'in 7 alanı. Kurulumda
// başlangıç haritası dolar (İlk Bakış + 4 soru), Dikkat ve Farkındalık ilk görevlerle dolar; 28. günde aynı sorular
// yeniden sorulur ve iki harita yan yana görülür. Değerler tanı ya da puan değil; yalnız kişinin kendisiyle karşılaştırması.
import { normalizeProfile } from './profile.js'

// Saat yönünde, Göz tepede (çizim sırası: lib/irisDraw.js)
export const IRIS_ORDER = ['eye', 'focus', 'awareness', 'calm', 'self', 'wellbeing', 'body']
export const RECHECK_DAYS = 28
const DAY = 86400000

// Profildeki son cevaplardan bir anlık görüntü (başlangıç ya da 28. gün)
export function snapshot(profile, date = new Date().toISOString()) {
  const p = normalizeProfile(profile)
  return { date, blinks: p.firstLook?.blinks ?? null, stressNow: p.stressNow, sleep: p.sleep, activityDays: p.activityDays, selfCompassion: p.selfCompassion }
}

// Alan başına hücre: { domain, filled, value }. Soruyla dolan alanlarda value sayı; Dikkat ve Farkındalık o alandan
// bir oturum varsa dolu (domainOf: oturum → alan; modules/registry.js üzerinden verilir, burada saf kalsın diye parametre).
export function irisCells(snap, { sessions = [], domainOf = () => null } = {}) {
  const s = snap ?? {}
  const did = (d) => sessions.some((x) => domainOf(x) === d)
  const val = { eye: s.blinks, calm: s.stressNow, self: s.selfCompassion, wellbeing: s.sleep, body: s.activityDays }
  return IRIS_ORDER.map((domain) => {
    if (domain === 'focus' || domain === 'awareness') return { domain, filled: did(domain), value: null }
    const v = val[domain]
    return { domain, filled: v != null, value: v ?? null }
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
