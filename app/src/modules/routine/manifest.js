// Egzersiz setleri (Hafif / Normal / Tam / Derin) ve Bugünün yolu egzersiz grupları. Tek modül, tek ekran.
// Kayıtları stats.js işler.
import { SETS, PATH_GROUPS } from '../../lib/routines.js'
import { isSameDay, runDayOf } from '../../lib/today.js'
import { stageOf, seedHash } from '../../lib/progression.js'
import { dayKey } from '../../lib/calendar.js'

// Yoldaki yerleri (lib/today.js ORDER): Isınma başta, Uzağa bakış ve Yakın–uzak 1. bölümde, Daire ve
// Göz kırpma 2. bölümde (molanın ardından). Daire yol uzarsa düşen son duraktır (R7). Yukarı–aşağı (`dikey`, yalnız
// ilerleme merdiveniyle) Daire'nin yerindedir ve onunla gün aşırı gelir (rotate 'donus'); düşme sırası da Daire'ninki.
const PATH_PLACE = {
  isinma: { slot: 'warmup', order: 10 },
  uzak: { slot: 'body', order: 30 },
  yakinuzak: { slot: 'body', order: 50 },
  daire: { slot: 'body', order: 70, dropRank: 3 },
  dikey: { slot: 'body', order: 70, dropRank: 3 },
  kirpma: { slot: 'body', order: 90 },
}
// ctx.progression yokken yol bugünkü beş grubu verir (dikey yok)
const DAILY_GROUPS = PATH_GROUPS.filter((g) => !g.ladderOnly)
const GLYPH = Object.fromEntries(PATH_GROUPS.map((g) => [g.id, g.glyph]))
// Tam set günü (V4, §3.A.6; YOL.ilerleme §5.2): haftada bir gün 2. bölümün göz grupları (Daire ya da Yukarı–aşağı ve
// Göz kırpma, 2 dk) yerine tek durak olarak Normal set (≈ 2 dk). Yol payı değişmez. VARSAYIM.
// EDİTÖR: durağın adı "Normal set" (Ana sayfadaki set satırıyla aynı ad; planda yalnız "tam set günü" geçiyor, "Tam set"
// adı Ana sayfadaki başka bir setin adı olduğu için kullanılmadı).
const FULL_SET = SETS.find((s) => s.id === 'normal')
const FULL_SET_MIN = 2
const FULL_SET_REPLACES = (g) => g.rotate === 'donus' || g.key === 'kirpma'

const isRoutine = (s) => s?.type === 'routine'

// Daire ile Yukarı–aşağı gün aşırı (§3.A.6 K7, §3.A.9 9. gün). lib/today.js rotate grubun en küçük weekDays'ini seçer;
// burada her gruba sırası verilir: bugünden önce en son yapılan 1, öteki 0. Böylece dün Daire yapıldıysa bugün
// Yukarı–aşağı gelir (ara verilse de son yapılanın ötekisi). İkisi de hiç yapılmadıysa ya da aynı gün yapıldıysa yerel
// günün tekliği karar verir: eşitlik lib/today.js'teki UTC gün numarasına kalmaz, aynı yerel gün hep aynı grup.
const dayNo = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}
export function rotationRanks(sessions = [], keys = [], now = new Date()) {
  const today = dayKey(now)
  const last = Object.fromEntries(keys.map((k) => [k, '']))
  for (const s of sessions ?? []) {
    if (!isRoutine(s) || !(s.setId in last)) continue
    const d = runDayOf(s)
    if (d && d < today && d > last[s.setId]) last[s.setId] = d
  }
  const order = [...keys].sort()
  const [a, b] = order
  if (order.length === 2 && last[a] !== last[b]) return { [a]: last[a] > last[b] ? 1 : 0, [b]: last[b] > last[a] ? 1 : 0 }
  const pick = dayNo(today) % Math.max(1, order.length)
  return Object.fromEntries(order.map((k, i) => [k, i === pick ? 0 : 1]))
}

// Kilit ekranının "Devam: …" satırı (App activityLabel → label(route)) yoldaki durağın adıyla aynı olsun: ilerlemeyle
// kurulan yolun grup adları (2. gün isinma "Sağ–sol") bugünün gününe yazılır. İlerleme yoksa hiç yazılmaz.
let stagedTitles = { day: null, titles: {} }

// Karışık gün (V2, §3.A.6; merdiven.md §4.5): Isınma adımlarının sırası tohumla değişir, içerik aynı kalır. Belirlenimci:
// aynı gün her açılışta aynı sıra. Sıra bugünküyle aynı çıkarsa bir adım kaydırılır (karışık gün gerçekten farklı olsun).
export function mixedOrder(steps = [], seed = 0) {
  const out = [...steps]
  let x = (seed >>> 0) || 1
  const rnd = () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0
    return x / 4294967296
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  if (out.length > 1 && out.every((id, i) => id === steps[i])) out.push(out.shift())
  return out
}

// Bugünün basamağına göre yoldaki gruplar (ctx.progression yoksa null). Her grup: { key, title, glyph, steps, rotate?,
// patch (yalnız bu grubun çeşitleme yaması) }; tam set gününde 2. bölümün grupları yerine { key: 'normal', full: true }.
export function stagedGroups(ctx = {}) {
  const st = stageOf(ctx, 'routine')
  if (!st || !Array.isArray(st.groups) || !st.groups.length) return null
  const v = st.variant ?? null
  const patch = v?.patch ?? {}
  let groups = st.groups.map((g) => ({
    key: g.key,
    title: g.title,
    glyph: g.glyph ?? GLYPH[g.key] ?? null,
    steps: [...(g.steps ?? [])],
    rotate: g.rotate ?? null,
    patch: patch[g.key] ?? null,
    day: null,
  }))
  if (v?.mixDay) {
    const seed = seedHash(`${ctx.progression?.seedDay ?? ''}:routine:mix`)
    groups = groups.map((g) => (g.key === 'isinma' ? { ...g, steps: mixedOrder(g.steps, seed), day: 'mix' } : g))
  }
  if (v?.fullSetDay && FULL_SET && groups.some((g) => g.key === 'kirpma')) {
    groups = groups.filter((g) => !FULL_SET_REPLACES(g))
    groups.push({ key: FULL_SET.id, title: `${FULL_SET.title} set`, glyph: GLYPH.kirpma, steps: [...FULL_SET.steps], rotate: null, patch: null, day: 'full', full: true })
  }
  return { stage: st, groups }
}

// Yol grubu ekranının seti (modules/routine/view.jsx): basamaklı içerik ve kayda yazılacak alanlar. Grup bugünün yolunda
// yoksa ya da ilerleme yoksa null (ekran bugünkü PATH_GROUPS setini açar).
export function stagedSet(ctx = {}, key) {
  const got = stagedGroups(ctx)
  const g = got?.groups.find((x) => x.key === key)
  if (!g) return null
  return {
    id: g.key,
    title: g.title,
    glyph: g.glyph,
    group: !g.full,
    steps: g.steps,
    patch: g.patch,
    stage: got.stage.id ?? got.stage.index,
    variant: got.stage.variant?.id ?? null,
  }
}

function dailyStops({ sessions = [], now = new Date() } = {}) {
  const doneIds = new Set(sessions.filter((s) => isRoutine(s) && isSameDay(s, now)).map((s) => s.setId))
  return DAILY_GROUPS.map((g) => ({
    key: g.id,
    title: g.title,
    minutes: 1,
    glyph: g.glyph,
    route: `routine-${g.id}`,
    done: doneIds.has(g.id),
    ...PATH_PLACE[g.id],
  }))
}

export default {
  id: 'routine',
  routes: [...SETS, ...PATH_GROUPS].map((s) => `routine-${s.id}`),
  title: 'Egzersiz setleri',
  label(route) {
    const set = [...SETS, ...PATH_GROUPS].find((s) => `routine-${s.id}` === route)
    if (!set) return 'egzersiz seti'
    const title = (set.group && stagedTitles.day === dayKey(new Date()) && stagedTitles.titles[set.id]) || set.title
    return set.group ? `${title.toLocaleLowerCase('tr')} egzersizi` : `${title.toLocaleLowerCase('tr')} egzersiz seti`
  },
  ring: 'eye',
  kind: 'exercise',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  // Veri merkezi (lib/dataHub.js) kaydı Göz alanına koyar. Gün listesi ve süre stats.js'te ayrıca işlenir.
  sessions: {
    match: isRoutine,
    countsTowardGoal: true,
    describe: () => ({ title: 'Egzersiz seti', detail: '' }),
  },
  // İlerleme (SONSUZ_YOL.PLAN.v1 §3.G.1): herhangi bir set ya da yol grubu kaydı o günü "yapıldı" sayar. Merdiven
  // lib/ladders.js LADDERS.routine.
  progression: { match: isRoutine },
  gates: { gaze: true, eyeBudget: 'eye' },
  home: { section: 'exercise', order: 10 },
  // "Bana hatırlat" (bildirim PLAN.v1 §A.1 modül tablosu; metin lib/remindTexts.js, sahip onaylı metin-B1a-onay.md).
  // Dokununca yol açılır (routine-… değil, Ana sayfa); Çalışma günleri (study) ayrı kalır, 60 dk kuralı planlayıcıda.
  // Kaynak yalnız talens2022 (sahip kararı 2; geçici bell2023 bağı kullanılmaz). VARSAYIM: plan tablosunda defaultTime yok;
  // veri yokken lib/moduleRemind.js FALLBACK_TIME (16.30).
  remind: { route: 'home', window: 'move', defaultTime: '11:30', science: ['talens2022'] },
  // Yolun gövdesi: kısa gruplar, her biri ayrı durak; bugün o grubun kaydı varsa tamam.
  //  - ctx.progression yok: bugünkü beş grup, her gün (değişmez).
  //  - ctx.progression var: bugünün basamağındaki gruplar (§3.A.6: 1. gün Göz kırpma, 2. gün Sağ–sol, 3. gün Isınma,
  //    4. gün Yukarı–aşağı …; 9. günden Daire ile Yukarı–aşağı gün aşırı: rotationRanks), çeşitleme yamasıyla. Durağın `stage` alanı
  //    ekranın içeriğini taşır: { id, index, soft, steps, patch, variant, day }.
  today(ctx = {}) {
    const got = ctx.progression ? stagedGroups(ctx) : null
    if (!got) return dailyStops(ctx)
    const { sessions = [], now = new Date() } = ctx
    const doneIds = new Set(sessions.filter((s) => isRoutine(s) && isSameDay(s, now)).map((s) => s.setId))
    const st = got.stage
    const ranks = rotationRanks(sessions, got.groups.filter((g) => g.rotate).map((g) => g.key), now)
    stagedTitles = { day: dayKey(now), titles: Object.fromEntries(got.groups.map((g) => [g.key, g.title])) }
    return got.groups.map((g) => ({
      key: g.key,
      title: g.title,
      minutes: g.full ? FULL_SET_MIN : 1,
      glyph: g.glyph,
      route: `routine-${g.key}`,
      done: doneIds.has(g.key),
      ...(g.full ? { slot: 'body', order: PATH_PLACE.kirpma.order } : PATH_PLACE[g.key] ?? { slot: 'body' }),
      ...(g.rotate ? { rotate: g.rotate, weekDays: ranks[g.key] ?? 0 } : {}),
      stage: { id: st.id ?? null, index: st.index, soft: Boolean(st.soft), steps: g.steps, patch: g.patch, variant: st.variant?.id ?? null, day: g.day },
    }))
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Kanıt: remind.science ile aynı havuz
  nef: {
    name: { tr: { '': 'göz egzersizi', ABL: 'göz egzersizinden', ACC: 'göz egzersizini', LOC: 'göz egzersizinde', DAT: 'göz egzersizine', INS: 'göz egzersiziyle', POSS: 'göz egzersizin', 'POSS-ABL': 'göz egzersizinden' } },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['talens2022'],
    note: 'Göz egzersizi setleri ve yolun egzersiz grupları; kayıt yalnız gün olarak okunur.',
  },
}
