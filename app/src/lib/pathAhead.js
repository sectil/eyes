// Ana sayfanın uzun yolu (sahibin isteği 2026-10-01, D9: "Duolingo'daki gibi uzun yol; yüzlerce aşama; aralarda nefes,
// yoga, Dalga"). Saf ve belirlenimci; depoya ve ekrana dokunmaz.
//
//  projectDays: bugünden sonraki günlerin yolu, GERÇEK yol koduyla (lib/today.js buildPath, modüllerin today()'i,
//    lib/progression.js stageOf merdivenleri). Varsayım: kişi bugünün ve her gelecek günün yolunu bitirir. Gün k için
//    ilerleme bağlamı bugününkünden türetilir: o güne dek yolda olan her modülün D ve Dstage sayacı birer artar, G = 1,
//    pathDay bir artar, seedDay o günün anahtarıdır (haftalık seçimler o güne göre). Modüllerin kendi kayıtlarından
//    okuduğu durumlar için en az sahte kayıt eklenir: haftalık E testi (üç göz, koşu günüyle), okuma testi, yoga dersi
//    ve günün işareti (yoga toplam gün sayacı). Sahte kayıtlar yalnız bu hesapta yaşar.
//    DİKKAT: modules/routine/manifest.js bugünün grup adlarını modül içinde tutar; bu işlev bugünün yolundan ÖNCE
//    çağrılmalıdır (Home.jsx öyle çağırır; dayLead.js pathDoneOn'daki notun aynısı).
//  pastDays: bugünden önceki yol günleri (yola ait kaydı olan ayrı günler), her birinde yapılan modüller.
//  chapterOf: yolun N. günü hangi bölümde (7 günde bir bölüm).
import { buildPath, runDayOf } from './today.js'
import { newStopKeys, matcherOf, pathRestMinutes } from './progression.js'
import { dayKey } from './calendar.js'

export const AHEAD_DAYS = 70 // 10 bölüm ileri (D9 v2: yarından sonrası bölüm kartları; en az 8 bölüm görünür)
export const CHAPTER_DAYS = 7
export const chapterOf = (n) => Math.max(1, Math.ceil(n / CHAPTER_DAYS))
export const chapterEnd = (n) => n > 0 && n % CHAPTER_DAYS === 0

const at10 = (base, k) => {
  const d = new Date(base)
  d.setDate(d.getDate() + k)
  d.setHours(10, 0, 0, 0)
  return d
}
const cloneProg = (p) => ({
  ...p,
  later: [],
  mod: Object.fromEntries(Object.entries(p?.mod ?? {}).map(([k, v]) => [k, { ...v }])),
})

// Bir günün yolu bitti sayılınca bırakacağı en az kayıt (yalnız modüllerin kendi kayıt okumaları için)
function synth(stops, day) {
  const key = dayKey(day)
  const iso = day.toISOString()
  const tests = []
  const sessions = [{ type: 'path-ahead', date: iso }]
  for (const s of stops) {
    if (s.id === 'weekly') for (const eye of ['R', 'L', 'OU']) tests.push({ type: 'va-weekly', eye, date: iso, runDay: key })
    else if (s.id === 'reading') tests.push({ type: 'reading', eye: 'OU', date: iso, runDay: key })
    else if (s.id === 'yoga' && Number.isFinite(s.stage?.lesson)) sessions.push({ type: 'yoga', lesson: s.stage.lesson, planned: (s.minutes ?? 3) * 60, seconds: (s.minutes ?? 3) * 60, completed: true, date: iso })
  }
  return { tests, sessions }
}

// → [{ k, n, date, key, stops, newKeys, minutes }] (k: bugünden kaç gün sonra; n: yolun kaçıncı günü)
// plan: bugünün yolu (verilmezse burada kurulur). Bittiğinde bugünün yolu bir kez daha kurulur: modules/routine bugünün
// grup adlarını modül içinde tutar (kilit ekranının "Devam: …" satırı), son hesaplanan gün bugün olsun.
export function projectDays({ modules = [], tests = [], sessions = [], now = new Date(), profile = null, progression = null, plan: todayPlan = null, days = AHEAD_DAYS } = {}) {
  if (!progression || !(days > 0)) return []
  const out = []
  let t = [...(tests ?? [])]
  let s = [...(sessions ?? [])]
  const p = cloneProg(progression)
  const todayCtx = { tests: t, sessions: s, now, profile, eye: null, later: null, progression }
  let prev = todayPlan
  try {
    prev ??= buildPath(modules, todayCtx)
  } catch {
    return []
  }
  let prevDay = new Date(now)
  const n0 = (Number(progression.pathDay) || 0) + 1 // bugün yolun kaçıncı günü
  for (let k = 1; k <= days; k++) {
    const ids = new Set(prev.stops.map((x) => x.id))
    for (const id of Object.keys(p.mod)) {
      const m = p.mod[id]
      if (ids.has(id)) Object.assign(m, { D: (m.D ?? 0) + 1, Dstage: (m.Dstage ?? 0) + 1, G: 1 })
      else if (Number.isFinite(m.G)) m.G += 1
    }
    if (prev.stops.length) p.pathDay = (p.pathDay ?? 0) + 1
    const add = synth(prev.stops, prevDay)
    t = t.concat(add.tests)
    s = s.concat(add.sessions)
    const day = at10(now, k)
    p.seedDay = dayKey(day)
    const ctx = { tests: t, sessions: s, now: day, profile, eye: null, later: null, progression: { ...p, mod: p.mod } }
    let plan
    try {
      plan = buildPath(modules, ctx)
    } catch {
      break
    }
    // Basamak ve "Yeni" o günün bağlamıyla (sayaçlar sonraki günde değişeceği için kopya)
    const snap = { ...ctx, progression: cloneProg(ctx.progression) }
    // Molanın süresi o gün kişi Nefes durağına 1. bölümü bitirip geldiğinde ne olacaksa (pathRestMinutes, göz bütçesi boş)
    const restMin = pathRestMinutes(null, plan, snap.progression)
    out.push({ k, n: n0 + k, date: day, key: dayKey(day), stops: plan.stops, newKeys: newStopKeys(snap, plan.stops), restMin, minutes: plan.stops.reduce((a, x) => a + (x.minutes ?? 0), 0) })
    prev = plan
    prevDay = day
  }
  try {
    buildPath(modules, todayCtx)
  } catch {
    // bozuk modül yolu düşürmez
  }
  return out
}

// Bugünden önceki yol günleri: [{ key, n, ids: [modül kimliği, …] }] (eskiden yeniye). modules: registry.live.
export function pastDays({ modules = [], tests = [], sessions = [], now = new Date() } = {}) {
  const today = dayKey(now)
  const live = (modules ?? []).filter((m) => m && !m.retired && typeof m.today === 'function' && m.id !== 'daily')
  const ms = live.map((m) => [m.id, matcherOf(m)]).filter(([, f]) => f)
  const days = new Map()
  for (const r of [...(tests ?? []), ...(sessions ?? [])]) {
    const k = runDayOf(r)
    if (!k || k >= today) continue
    for (const [id, f] of ms) {
      let ok = false
      try {
        ok = Boolean(f(r))
      } catch {
        ok = false
      }
      if (!ok) continue
      if (!days.has(k)) days.set(k, new Set())
      days.get(k).add(id)
    }
  }
  return [...days.keys()].sort().map((key, i) => ({ key, n: i + 1, ids: [...days.get(key)] }))
}

// ---- "Yeni" yalnız gerçekten ilk kez (sahibin kuralı, D9 v2: "70 günlük kullanıcıda Nefes 'Yeni' olmaz") ----
// Durağın kimliği: göz egzersizinde grup ve adımları (K2 "Sağ–sol" ile K3 "Isınma" aynı anahtarda ama başka adımlar),
// ötekilerde anahtar. Süre ve tekrar sayısı (basamak, çeşitleme) durağı yeni yapmaz. Yoga tek durak: ders değişse de
// durak aynı (D9 v2 tur 2: her ders ayrı "Yeni" sayılınca bölüm kartlarında "Yoga" üç kez yeni çıktı).
const subOf = (s) => (typeof s?.key === 'string' && s.key.includes(':') ? s.key.slice(s.key.indexOf(':') + 1) : null)
export function stopIdentity(s) {
  if (!s?.key) return ''
  // adımların sırası kimliğe girmez (haftada bir Isınma'nın adımları yer değiştirir: 'mixDay')
  if (s.id === 'routine' && subOf(s)) return `routine:${subOf(s)}:${[...new Set(s.stage?.steps ?? [])].sort().join(',')}`
  return s.key
}
const safe = (f, r) => {
  try {
    return Boolean(f(r))
  } catch {
    return false
  }
}
// Bugünden önceki kayıtlarda bu durak var mı: (stop) → bool. modules: registry.live.
//  - göz egzersizi grubu: aynı grubun (setId) kaydı; kayıtta adımlar (stepIds) varsa durağın adımlarının hepsi içinde
//    (adımsız eski kayıt: grup yeterli)
//  - yoga: herhangi bir yoga kaydı (modülün eşleyicisi)
//  - öteki: modülün kayıt eşleyicisi (lib/progression.js matcherOf)
export function seenBefore({ modules = [], tests = [], sessions = [], now = new Date() } = {}) {
  const today = dayKey(now)
  const recs = [...(tests ?? []), ...(sessions ?? [])].filter((r) => {
    const k = runDayOf(r)
    return k && k < today
  })
  const byId = new Map((modules ?? []).filter(Boolean).map((m) => [m.id, m]))
  const memo = new Map()
  return (s) => {
    const id = stopIdentity(s)
    if (!id) return false
    if (memo.has(id)) return memo.get(id)
    const sub = subOf(s)
    let f = matcherOf(byId.get(s.id))
    if (s.id === 'routine' && sub) {
      const steps = s.stage?.steps ?? []
      f = (r) => r?.type === 'routine' && r.setId === sub && (!Array.isArray(r.stepIds) || !r.stepIds.length || steps.every((x) => r.stepIds.includes(x)))
    }
    const v = Boolean(f) && recs.some((r) => safe(f, r))
    memo.set(id, v)
    return v
  }
}

// Gelecek günlerde ilk kez gelen duraklar: Map(gün numarası → [durak]). Durak ne geçmişte (seen) ne bugünün yolunda ne de
// daha önceki bir gelecek günde bulunmalı (kimlik stopIdentity). D9 v2 tur 2: o günün newKeys'ine bakılmaz. Açılma eşiği
// tek gündür (lib/progression.js newStopKeys: pathDay === eşik); durak o gün yolda değilse (dönüşümlü modül, ör. Tek
// Bakışta) ilk geldiği gün "yeni" sayılmıyordu ve 2. günde 2. bölümün "Yeni: Tek Bakışta, Daire" sözü siliniyordu.
// Bantlar (nefes molası) hariç değil: yoga dersi de ilk kez gelebilir.
export function firstNews(ahead = [], today = [], seen = () => false) {
  const had = new Set((today ?? []).map(stopIdentity))
  const out = new Map()
  for (const d of ahead ?? []) {
    const list = []
    for (const s of d.stops ?? []) {
      const id = stopIdentity(s)
      if (id && !had.has(id) && !seen(s) && !list.some((x) => stopIdentity(x) === id)) list.push(s)
    }
    for (const s of d.stops ?? []) had.add(stopIdentity(s))
    if (list.length) out.set(d.n, list)
  }
  return out
}

