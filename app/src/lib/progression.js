// İlerleme motoru (SONSUZ_YOL.PLAN.v1 §3.A.2, §3.A.8, §3.G.1; arastirma-v1/merdiven.md §4). Saf ve belirlenimci:
// sayaçlar saklanmaz, kayıtlardan türetilir; depoya ve ekrana dokunmaz.
//
//   ctx.progression = { pathDay, mod: { [id]: { D, G, Dstage } }, later: [durak anahtarı, …], seedDay: 'YYYY-MM-DD' }
//     pathDay   yola ait kaydın (ölçüm ya da yolda durağı olan bir modülün kaydı) bulunduğu ayrı yerel gün sayısı
//     D         modülün "yapıldı" sayılan kaydının bulunduğu ayrı gün sayısı
//     G         modülün son yapıldığı günden bugüne takvim günü (hiç yoksa null)
//     Dstage    modülün `stage` alanı taşıyan (Y1'den sonra yazılmış) kayıtlarının ayrı gün sayısı
//   Hepsi BUGÜNDEN ÖNCEKİ günlerle sayılır: basamak gün içinde değişmez, yeni kullanıcının 1. günü D = 0'dır.
//   Gün anahtarı lib/today.js runDayOf (ölçümde koşu günü, öteki kayıtlarda yerel gün); takvim farkı calendarDaysBetween.
//
// ctx.progression yalnız screens/Home.jsx'te bir kez hesaplanır. Verilmezse her manifest bugünkü çıktısını verir
// (stageOf → null, unlocked → true, restDecision → bugünkü kural): "mevcut sistem bozulmaz" kuralının güvencesi (§G.6).
import { dayKey } from './calendar.js'
import { runDayOf, calendarDaysBetween, PATH } from './today.js'
import { LADDERS, UNLOCK, VAR_LAG, SOFT_GAP, LIMITS, DAY_ONE, UPDATE_NEW, mergePatches } from './ladders.js'

const MIN = 60000
// Ölçüm modüllerinin kayıtları tests deposundadır ve sessions.match'leri yoktur: "yapıldı" = o türde kayıt
const TEST_TYPES = { weekly: 'va-weekly', reading: 'reading', daily: 'va-daily' }
// today() işlevi olduğu hâlde yolda durağı olmayan modül: kısa E testi (§A.7; modules/daily/manifest.js today() hep
// null). Kaydı pathDay'e sayılmaz; kendi D sayacı yine tutulur.
const OFF_PATH = new Set(['daily'])
// Yeni kullanıcının ilk haftasında ilk kez gelen (merdiveni ve açılma eşiği olmayan) durak da "Yeni" rozetini taşır
const NEW_WINDOW_DAYS = 7 // VARSAYIM

// Modülün "yapıldı" ölçütü: manifest.progression.match → ölçüm türü → sessions.match (yoksa null: sayılmaz)
export function matcherOf(m) {
  if (typeof m?.progression?.match === 'function') return m.progression.match
  if (TEST_TYPES[m?.id]) return (r) => r?.type === TEST_TYPES[m.id]
  if (typeof m?.sessions?.match === 'function') return m.sessions.match
  return null
}
const safeMatch = (f, r) => {
  try {
    return Boolean(f(r))
  } catch {
    return false // bozuk modül sayacı düşürmez
  }
}
const count = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)

// "Sonra yaparım" kaydı (lib/pathLater.js loadLater) ya da anahtar listesi → bugünün anahtarları
function laterList(later, today) {
  if (Array.isArray(later)) return later.filter((k) => typeof k === 'string' && k)
  if (later && typeof later === 'object' && later.day === today && Array.isArray(later.later)) return later.later.filter((k) => typeof k === 'string' && k)
  return []
}

// modules: kayıt defterinin canlı listesi (registry.live). Verilmezse bütün kayıtlar yola ait sayılır ve mod boştur.
export function progressionCtx({ tests = [], sessions = [], now = new Date(), modules = [], later = null } = {}) {
  const today = dayKey(now)
  const before = (r) => {
    const k = runDayOf(r)
    return k != null && k < today ? k : null
  }
  const records = [...(tests ?? []), ...(sessions ?? [])]
  const live = (modules ?? []).filter((m) => m && !m.retired)
  // Yola ait kayıt: yolda durağı olan (today() işlevi olan, kısa E testi dışındaki) bir modülün "yapıldı" kaydı. Ölçümde
  // de aynı: haftalık E testi ve okuma evet, yolda olmayan kısa E testi hayır.
  const pathMatchers = live.filter((m) => typeof m.today === 'function' && !OFF_PATH.has(m.id)).map(matcherOf).filter(Boolean)
  const pathDays = new Set()
  for (const r of records) {
    const k = before(r)
    if (k && (!live.length || pathMatchers.some((f) => safeMatch(f, r)))) pathDays.add(k)
  }
  const mod = {}
  for (const m of live) {
    const f = matcherOf(m)
    if (!f || typeof m.id !== 'string') continue
    const days = new Set()
    const staged = new Set()
    let last = null
    for (const r of records) {
      const k = before(r)
      if (!k || !safeMatch(f, r)) continue
      days.add(k)
      if (r.stage != null) staged.add(k)
      if (!last || k > last) last = k
    }
    mod[m.id] = { D: days.size, G: last ? calendarDaysBetween(last, today) : null, Dstage: staged.size, ...ownLadder(m) }
  }
  return { pathDay: pathDays.size, mod, later: laterList(later, today), seedDay: today }
}

// Modülün kendi merdiveni ve açılma eşiği (§3.G.1 manifest.progression.ladder, .unlock.pathDay; §3.G.2 madde 4). Yalnız
// manifest veriyorsa eklenir; vermeyen modülde lib/ladders.js LADDERS ve UNLOCK geçerlidir.
function ownLadder(m) {
  const out = {}
  const pr = m?.progression
  if (Array.isArray(pr?.ladder?.steps) && pr.ladder.steps.length) out.ladder = pr.ladder
  if (Number.isFinite(pr?.unlock?.pathDay)) out.unlock = pr.unlock.pathDay
  return out
}
const ladderOf = (p, id) => p?.mod?.[id]?.ladder ?? LADDERS[id] ?? null
const unlockOf = (p, id) => (Number.isFinite(p?.mod?.[id]?.unlock) ? p.mod[id].unlock : UNLOCK[id])

// Basit ve kararlı dize özeti (FNV-1a, 32 bit): günlük seçimler hash(gün + modül) ile belirlenir (§A.4, §A.8)
export function seedHash(str = '') {
  let h = 0x811c9dc5
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

// Haftanın (Pazartesi başlar) tohumla seçilen günü mü? Aynı hafta içinde her tuz için tek gün.
const dayNum = (key) => {
  const [y, m, d] = String(key).split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86400000
}
export function weeklyPick(seedDay, salt, avoid = null) {
  if (typeof seedDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(seedDay)) return false
  const n = dayNum(seedDay)
  const wd = (new Date(n * 86400000).getUTCDay() + 6) % 7 // Pazartesi 0
  const week = n - wd
  let pick = seedHash(`${week}:${salt}`) % 7
  if (avoid != null) {
    const other = seedHash(`${week}:${avoid}`) % 7
    if (pick === other) pick = (pick + 3) % 7
  }
  return pick === wd
}

function lastIndexWhere(list, ok) {
  for (let i = list.length - 1; i >= 0; i--) if (ok(list[i])) return i
  return -1
}
const sameGroup = (a, b) => a?.key === b?.key && a?.title === b?.title && JSON.stringify(a?.steps ?? null) === JSON.stringify(b?.steps ?? null)

// Bugünün basamağı. ladder: modülün manifestte verdiği merdiven (progressionCtx mod[id].ladder), yoksa LADDERS[id].
// ctx.progression yoksa null.
//   { index, soft, D, Dvar, G, ...basamak (from, id, minutes | groups …), variant, isNew, newKeys }
//   soft     son yapılan günden ≥ 14 gün sonra: o gün bir basamak (ve bir çeşitleme) aşağı, ertesi gün kaldığı yerden
//   variant  null | { index, id, from, ...son çeşitlemenin alanları (tier …), patch (birikmiş yama), mixDay, fullSetDay }
//   isNew    bugün yeni bir basamak ya da çeşitleme açıldı (yumuşak günde hiç)
//   newKeys  null (durağın tamamı yeni) | bu basamakta yeni ya da değişen grup anahtarları (göz egzersizleri)
export function stageOf(ctx, id, ladder = ladderOf(ctx?.progression, id)) {
  const p = ctx?.progression
  if (!p || !Array.isArray(ladder?.steps) || !ladder.steps.length) return null
  const m = p.mod?.[id] ?? { D: 0, G: null, Dstage: 0 }
  const D = count(m.D)
  const Dvar = Math.min(D, count(m.Dstage) + VAR_LAG)
  const G = Number.isFinite(m.G) ? m.G : null
  const soft = G != null && G >= SOFT_GAP
  const top = Math.max(0, lastIndexWhere(ladder.steps, (s) => s.from <= D))
  const index = soft ? Math.max(0, top - 1) : top
  const step = ladder.steps[index]
  const vars = Array.isArray(ladder.variants) ? ladder.variants : []
  const vTop = lastIndexWhere(vars, (v) => v.from <= Dvar)
  const vIndex = soft ? vTop - 1 : vTop
  let variant = null
  if (vIndex >= 0) {
    const weekly = new Set(vars.slice(0, vIndex + 1).map((v) => v.weekly).filter(Boolean))
    const last = { ...vars[vIndex] }
    delete last.patch
    delete last.weekly
    variant = {
      ...last,
      index: vIndex,
      patch: mergePatches(vars, vIndex),
      fullSetDay: weekly.has('fullSetDay') && weeklyPick(p.seedDay, `${id}:full`),
      mixDay: weekly.has('mixDay') && weeklyPick(p.seedDay, `${id}:mix`, weekly.has('fullSetDay') ? `${id}:full` : null),
    }
  }
  const newStep = !soft && D > 0 && step.from === D
  const newVariant = !soft && vTop >= 0 && Dvar > 0 && vars[vTop].from === Dvar
  let newKeys = null
  if (Array.isArray(step.groups) && (newStep || newVariant)) {
    const keys = new Set()
    if (newStep) {
      const prev = ladder.steps[index - 1]?.groups ?? []
      for (const g of step.groups) if (!prev.some((q) => sameGroup(q, g))) keys.add(g.key)
    }
    if (newVariant) for (const k of Object.keys(vars[vTop].patch ?? {})) if (step.groups.some((g) => g.key === k)) keys.add(k)
    newKeys = [...keys]
  }
  return { ...step, index, soft, D, Dvar, G, variant, isNew: newStep || newVariant, newKeys }
}

// Açılma: ctx.progression yoksa true (bugünkü davranış). threshold: manifestin progression.unlock.pathDay'i ya da UNLOCK[id].
export function unlocked(ctx, id, threshold = unlockOf(ctx?.progression, id)) {
  const p = ctx?.progression
  if (!p || !Number.isFinite(threshold)) return true
  return count(p.pathDay) >= threshold
}

// Yoldaki "Yeni" rozeti (§1, S0 b): bugün ilk kez gelen durak ya da yeni basamak. 1. günde (pathDay 0) hiç yok.
//  - merdivenli modül (nefes, göz egzersizleri): stageOf isNew; göz egzersizinde yalnız yeni ya da değişen grup
//  - açılma eşikli modül: eşiğin açıldığı gün, hiç yapılmadıysa (Yılan ve Bugünün görevi 2., Fark Ettin mi? 6. gün …)
//  - öteki: kişinin ilk haftasında (pathDay ≤ 7) bugünden önce hiç yapılmadıysa (okuma testi 2., yoga 3. gün); 1. günden
//    yolda olan duraklar (lib/ladders.js DAY_ONE: haftalık E testi, Çemberler) hiç "Yeni" olmaz: 1. gün atlanıp ertesi
//    gün yine gelince de yeni değildir
//  - eski kullanıcının güncelleme günü (§3.A.10: Dstage = 0, Dvar = 14; merdivenli bir modülde en az 14 günlük kayıt var,
//    hiçbiri Y1'in stage alanını taşımıyor): yalnız Y1 öncesi yolda olmayan durak ya da grup rozetlidir (lib/ladders.js
//    UPDATE_NEW: Yukarı–aşağı, nefesin "Günün ritmi", hiç yapılmamışsa Bugünün görevi)
// stops: buildPath sonucu plan.stops. Dönen: rozetli durak anahtarları.
// badge: false olan merdiven (Fark Ettin mi? sahneleri) rozete ve güncelleme gününe katılmaz (lib/ladders.js)
const badgeLadder = (p, id) => {
  const l = ladderOf(p, id)
  return l && l.badge !== false ? l : null
}
export function updateDay(p) {
  const ids = Object.keys(LADDERS).filter((id) => LADDERS[id].badge !== false)
  return ids.some((id) => count(p?.mod?.[id]?.D) >= VAR_LAG) && ids.every((id) => count(p?.mod?.[id]?.Dstage) === 0)
}
export function newStopKeys(ctx, stops = []) {
  const p = ctx?.progression
  if (!p || !(count(p.pathDay) > 0)) return []
  const upd = updateDay(p)
  const out = []
  for (const s of stops ?? []) {
    if (!s || typeof s.key !== 'string') continue
    const m = p.mod?.[s.id]
    if (badgeLadder(p, s.id)) {
      const st = stageOf(ctx, s.id)
      if (!st) continue
      const sub = s.key.includes(':') ? s.key.slice(s.key.indexOf(':') + 1) : null
      if (st.isNew) {
        if (st.newKeys == null || (sub != null && st.newKeys.includes(sub))) out.push(s.key)
      } else if (upd && !st.soft && s.id in UPDATE_NEW) {
        const keys = UPDATE_NEW[s.id]
        if (keys == null ? st.variant != null : sub != null && keys.includes(sub)) out.push(s.key)
      }
      continue
    }
    if (!m || count(m.D) > 0 || DAY_ONE.includes(s.id)) continue
    if (upd) {
      if (s.id in UPDATE_NEW) out.push(s.key)
      continue
    }
    const th = unlockOf(p, s.id)
    if (Number.isFinite(th) ? count(p.pathDay) === th : count(p.pathDay) <= NEW_WINDOW_DAYS) out.push(s.key)
  }
  return out
}

// Ara kilidi (§A.8-6). st: eyeStatus() (lib/eyeBudget.js check); plan: buildPath sonucu; progression: ctx.progression.
// Dönen: başlatılacak molanın nedeni ('path' | 'hourly' | 'daily' | …) ya da null (mola başlamaz).
//  - Bugünkü kural (screens/Home.jsx, Y1 öncesi; karşılaştırma birebir aynı): kilit yoksa ve (bir sınır dolduysa ya da
//    son moladan beri ≥ 1 dk göz çalışması varsa) mola başlar; neden sınırın kendisi, bütçe dolduysa 'path'.
//  - Y1 yalnız bir durumu değiştirir: ilerleme varken, hiçbir sınır dolmamışken, yoldaki nefes 3 dk'dan kısayken (yeni
//    kullanıcının 1. ve 2. günü; "Zorlandım"dan sonraki ya da yumuşak gün) ve 1. bölümün göz dakikası bölüm payının
//    altındayken yol molası ancak "kullanılan göz süresi + 2. bölümde kalan göz dakikası > göz bütçesi" ise başlar;
//    böylece 1–2 dk'lık nefesten sonra boş bekleme olmaz. 3 dk'lık nefeste bugünkü kural: mola 5 dk (3 dk nefes, kalanı
//    "2 dk daha" ya da dinlenme; S0 kararı 8). Karar böylece 3. günden eşiğe (kullanılan saniyelere) bağlı değildir.
//    Göz bütçesi kuralı aynen.
export function restDecision(st, plan, progression) {
  if (!st || st.locked) return null
  const reason = st.due && st.due !== 'budget' ? st.due : 'path'
  const today = Boolean(st.due || st.used >= PATH.restMinUsed * MIN)
  if (!progression || st.due) return today ? reason : null
  const rest = plan?.stops?.find((s) => s?.restSlot)
  if (!(Number.isFinite(rest?.minutes) && rest.minutes < LIMITS.breathPathMaxMin)) return today ? reason : null
  const b1 = plan?.blocks?.[0]
  if (!b1 || !Number.isFinite(b1.eyeMin) || !Number.isFinite(b1.capMin) || b1.eyeMin >= b1.capMin) return today ? reason : null
  const used = Number.isFinite(st.used) ? st.used : 0
  const b2 = plan?.blocks?.[1]
  const left2 = Math.max(0, (b2?.eyeMin ?? 0) - (b2?.eyeDone ?? 0))
  const budget = Number.isFinite(st.budgetMs) ? st.budgetMs : 5 * MIN
  return used + left2 * MIN > budget ? 'path' : null
}

// Yoldaki molanın süresi (dk). Mola bandı ve Nef baloncuğu bu sayıyı yazar (S0 kararı 8: "Mola · 1 dk", "Mola · 2 dk",
// 3. günden "Mola · 5 dk"). İlerleme yoksa null: ekran bugünkü gibi durağın süresini yazar (5 dk).
//  - yolun molası sürüyor (eye.locked, reason 'path') ya da bugün başladı (restStarted: lib/eyeBudgetStore.js
//    restHistory'de bugünkü 'path' molası): molanın tamamı, 5 dk (nefes + dinlenme; lib/eyeBudget.js LIMITS.restMs)
//  - Nefes durağı bitti ve yolun molası başlamadı (1.–2. gün): mola nefes kadardı
//  - başka bir mola sürüyor (bütçe, saat): 5 dk
//  - öteki: kişi Nefes durağına 1. bölümü bitirip geldiğinde restDecision ne diyecekse (kalan 1. bölüm dakikaları
//    kullanılana eklenir): mola başlayacaksa 5 dk, başlamayacaksa yalnız nefesin süresi
const REST_MIN = 5
export function pathRestMinutes(eye, plan, progression, { restStarted = false } = {}) {
  const rest = plan?.stops?.find((s) => s.restSlot) ?? null
  if (!progression || !rest) return null
  const breathMin = Number.isFinite(rest.minutes) ? rest.minutes : REST_MIN
  const full = Math.max(breathMin, REST_MIN)
  if ((eye?.locked && eye.reason === 'path') || restStarted) return full
  if (rest.done) return breathMin
  if (eye?.locked) return full
  const b1 = plan?.blocks?.[0]
  const left1 = Math.max(0, (b1?.eyeMin ?? 0) - (b1?.eyeDone ?? 0))
  const used = (Number.isFinite(eye?.used) ? eye.used : 0) + left1 * MIN
  const st = { locked: false, due: eye?.due ?? null, used, budgetMs: Number.isFinite(eye?.budgetMs) ? eye.budgetMs : REST_MIN * MIN }
  return restDecision(st, plan, progression) ? full : breathMin
}
