// Bugünün planı: Ana sayfadaki büyük kart. Plan adımlarını modüller verir (manifest.today);
// bu dosya yalnızca toplar ve sıralar. Kayıt defterini içe aktarmaz (döngü olmasın diye
// modül listesi parametre olarak gelir).
//
// manifest.today(ctx) → null | { title, minutes, done, route? }
//   ctx = { tests, sessions, now, profile? }  (profile: lib/profile.js; modül profileSignals ile okur)
//   null: modül bugün plana girmiyor (ör. haftalık test zamanı gelmedi)

export const WEEK_MS = 7 * 86400000

const time = (r) => {
  const t = new Date(r?.date).getTime()
  return Number.isFinite(t) ? t : null
}
export const isSameDay = (r, now = new Date()) => {
  const t = time(r)
  return t != null && new Date(t).toDateString() === new Date(now).toDateString()
}
export const lastOfType = (records = [], type) => records.filter((r) => r.type === type).at(-1) ?? null
// Son kayıt yoksa ya da 7 günden eskiyse zamanı gelmiştir (Home.jsx eski "due" kuralı).
export const isDue = (rec, now = new Date()) => !rec || time(rec) == null || new Date(now).getTime() - time(rec) > WEEK_MS
// Son N gün içindeki kayıtlar (now dahil geriye)
export const withinDays = (records = [], now = new Date(), days = 7) => {
  const since = new Date(now).getTime() - days * 86400000
  return records.filter((r) => {
    const t = time(r)
    return t != null && t >= since
  })
}
export const doneToday = (records = [], type, now = new Date()) => records.some((r) => r.type === type && isSameDay(r, now))

export function todayPlan(modules = [], ctx = {}) {
  const c = { tests: [], sessions: [], now: new Date(), ...ctx }
  const items = []
  for (const m of modules) {
    if (typeof m.today !== 'function') continue
    let it = null
    try {
      it = m.today(c)
    } catch {
      it = null // bozuk modül planı düşürmez
    }
    if (!it || typeof it.title !== 'string') continue
    items.push({
      id: m.id,
      route: it.route ?? (m.routes ?? [m.id])[0],
      title: it.title,
      minutes: Number.isFinite(it.minutes) ? it.minutes : null,
      done: Boolean(it.done),
      order: m.home?.order ?? 999,
      kind: m.kind,
    })
  }
  // Önce ölçüm, sonra egzersiz, sonra pratik; tür içinde home.order
  const kindRank = { measure: 0, exercise: 1, practice: 2 }
  items.sort((a, b) => (kindRank[a.kind] ?? 9) - (kindRank[b.kind] ?? 9) || a.order - b.order)
  const next = items.find((i) => !i.done) ?? null
  const doneCount = items.filter((i) => i.done).length
  return { items, next, doneCount, total: items.length, allDone: items.length > 0 && !next }
}
