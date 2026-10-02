// Nef girdisi → an motorunun bağlamı (Nef PLAN §4.1, §4.5, §4.8; ANA_OTURUM_ISTEMI N1 madde 6–7). Saf: depoya yazmaz,
// sunucuya bir şey göndermez. App.jsx girdiyi bir kez kurar (nefInput); Ana sayfa kartı (CoachCard.jsx, nefCard) ve
// bildirim planlayıcısı (notifyAll.planAll, nefNotifyInput) aynı girdiden okur.
//
// Girdi (nefInput): { lang, tests, sessions, habits, reminders, weather: { cache } | null, path, who5Low }
//   path: { has, doneToday, doneDays } (pathState) · backLine (isteğe bağlı): yolun başı bugün onaylı cümle 3'ü ("Kaldığın
//   yerden …") yazdıysa uzun aradan dönüş anı kurulmaz (moments.js). Ana sayfa kartı o anı zaten söylemez (card.js
//   CARD_TYPES; sahip kararı 2026-10-02), backLine vermez.
// Kamera, Sağlık, konum ve hava verisi burada yalnız telefonda okunur; hiçbiri ağa gitmez.
import { registry } from '../../modules/registry.js'
import { acuteEffects, effectsSince, metricCards, who5Card } from '../progress.js'
import { buildPath, calendarDaysBetween } from '../today.js'
import { progressionCtx } from '../progression.js'
import { pathDayOn } from '../../components/home/dayLead.js'
import { dayKey, startOfWeek } from '../calendar.js'
import { NEEDS } from './speak.js'
import { walkFactOf, forecastOf, BANKS } from './notify.js'
import { moduleLexicon } from './lexicon.js'

const DAY = 86400000
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const time = (r) => {
  const t = new Date(r?.date).getTime()
  return Number.isFinite(t) ? t : null
}
const declares = (m, type) => Array.isArray(m?.nef?.moments) && m.nef.moments.includes(type)

// ---------- Dil (Intl; bölge sabiti yok) ----------
// Nef'in dili arayüzün dilidir (<html lang>; arayüz bugün yalnız Türkçe): telefon başka dildeyse Türkçe arayüzde Nef
// susmasın. Arayüz dili okunamazsa telefonun dilleri sırayla. Bankası olmayan dil döner: o dilde Nef susar (plan §4.7;
// başka dile düşmez). VARSAYIM: N5'te arayüz dili değişince Nef de onunla değişir.
export function nefLang({ ui = globalThis.document?.documentElement?.lang, locales = globalThis.navigator?.languages } = {}) {
  const tags = [ui, ...(Array.isArray(locales) ? locales : [])].filter((x) => typeof x === 'string' && x)
  for (const tag of tags) {
    try {
      const lang = new Intl.Locale(tag).language
      if (lang) return lang
    } catch {
      // geçersiz etiket: sıradaki
    }
  }
  try {
    return new Intl.Locale(Intl.DateTimeFormat().resolvedOptions().locale).language
  } catch {
    return null
  }
}

// ---------- Kayıtlar ----------
// Modülün kendi kayıtları (registry.js `nef.records` sözleşmesi): sessions'ta progression.match ?? sessions.match; kaydı
// başka depoda olan modülde nef.records ({ store: 'tests' | 'habits', match }). Tarihe göre eskiden yeniye.
export function recordsOf(m, { tests = [], sessions = [], habits = [] } = {}) {
  const own = m?.nef?.records
  const safe = (fn) => (r) => {
    try {
      return Boolean(fn(r))
    } catch {
      return false
    }
  }
  let list = []
  if (own && typeof own.match === 'function' && (own.store === 'tests' || own.store === 'habits')) {
    list = (own.store === 'tests' ? tests : habits).filter(safe(own.match))
  } else {
    const match = m?.progression?.match ?? m?.sessions?.match
    if (typeof match === 'function') list = sessions.filter(safe(match))
  }
  return list.filter((r) => time(r) != null).sort((a, b) => time(a) - time(b))
}

// Bir kaydın önce–sonra puanı (modülün progress.effects tanımından): { effect, measure, better, before, after } | null
function effectOf(rec, effects) {
  for (const e of effects) {
    let p = null
    try {
      p = e.pick(rec)
    } catch {
      p = null
    }
    if (p && isNum(p[0]) && isNum(p[1])) return { effect: e.key, measure: e.measure, better: e.better === 'down' ? 'down' : 'up', before: p[0], after: p[1] }
  }
  return null
}

// Bu dilde kurulabilir mi (sayılı ilk kayıt cümlesi, FTB): kurulamıyorsa ilk kayıt sayısız söylenir (FT; moments.js'in
// "sayı söylenmez, yalnız ilk gün" kuralının aynısı, taslak §5.2). Bank ve sözlük verilmezse sayılı hâl kalır.
function sayable(cell, facts, bank, lexicon) {
  if (!bank) return true
  return (bank.cells?.[cell] ?? []).some((t) => (t.needs ?? []).every((n) => NEEDS[n]?.(facts) === true) && (!t.only?.metric || t.only.metric === facts.metric) && bank.render(t.text, facts, lexicon) != null)
}

// ---------- İlk kayıt (firstTime) ----------
// Modülün ilk kaydı bugün ya da dün (taslak §5.2 VARSAYIM). Sayılı hâl: ilk günün ilk ölçümü (metrik) ya da ilk önce–sonra
// puanı (etki); an motoru göz alanını, uykuyu ve kötü yönü zaten sayısız yapar.
export function firstsOf({ now, tests, sessions, habits, modules, bank = null, lexicon = null }) {
  const today = dayKey(now)
  const d = new Date(now)
  const yesterday = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12))
  const out = []
  for (const m of modules) {
    if (!declares(m, 'firstTime')) continue
    const recs = recordsOf(m, { tests, sessions, habits })
    if (!recs.length) continue
    const first = recs[0]
    const day = dayKey(time(first))
    if (day !== today && day !== yesterday) continue
    let entry = { module: m.id, kind: 'day' }
    const metric = registry.metrics().filter((x) => x.module === m.id).map((x) => {
      let series = []
      try {
        series = x.series({ tests, sessions }) ?? []
      } catch {
        series = []
      }
      const p = series.filter((s) => s && isNum(s.value) && time(s) != null).sort((a, b) => time(a) - time(b))[0]
      return p && dayKey(time(p)) === day ? { metric: x.key, domain: x.domain, value: p.value } : null
    }).find(Boolean)
    const effect = effectOf(first, registry.effects().filter((e) => e.module === m.id))
    if (metric && sayable('FTB', { module: m.id, metric: metric.metric, start: metric.value }, bank, lexicon)) entry = { module: m.id, kind: 'metric', ...metric }
    else if (effect && sayable('FTB', { module: m.id, ...effect }, bank, lexicon)) entry = { module: m.id, kind: 'effect', ...effect }
    out.push(entry)
  }
  return out
}

// ---------- Modüle uzun aradan dönüş (returnAfterGap) ----------
// Bugün modülün kaydı var ve bir önceki kaydı 14+ gün önce (moments.js MODULE_GAP_DAYS). last: önceki kaydın önce–sonra
// puanı (RG-5 "En son … çıkmıştı").
export function gapsOf({ now, tests, sessions, habits, modules }) {
  const today = dayKey(now)
  const out = []
  for (const m of modules) {
    if (!declares(m, 'returnAfterGap')) continue
    const recs = recordsOf(m, { tests, sessions, habits })
    if (!recs.some((r) => dayKey(time(r)) === today)) continue
    const prev = recs.filter((r) => dayKey(time(r)) < today).at(-1)
    if (!prev) continue
    const days = calendarDaysBetween(dayKey(time(prev)), today)
    const last = effectOf(prev, registry.effects().filter((e) => e.module === m.id))
    out.push({ module: m.id, days, ...(last ? { last } : {}) })
  }
  return out
}

// ---------- Uygulamaya uzun aradan dönüş ----------
// Son açılışın izi: bugünden önceki son kayıt günü (test, oturum, alışkanlık) ya da Nef kartının en son görüldüğü gün
// (söz hafızası). VARSAYIM: açılış günlüğü yok; kaydı ya da kartı olmayan açılış görülmez. İz yoksa null (yeni kullanıcı).
export function appGapOf({ now = new Date(), tests = [], sessions = [], habits = [], rows = [] } = {}) {
  const today = dayKey(now)
  let last = null
  for (const r of [...tests, ...sessions, ...habits]) {
    const t = time(r)
    if (t == null) continue
    const k = dayKey(t)
    if (k < today && (!last || k > last)) last = k
  }
  for (const r of rows ?? []) if (r?.channel === 'card' && typeof r.date === 'string' && r.date < today && (!last || r.date > last)) last = r.date
  return last ? calendarDaysBetween(last, today) : null
}

// ---------- Yol durumu ----------
// Bugünkü yol (Ana sayfanın kurduğu yolla aynı girdi: registry.live, ilerleme bağlamı, göz bütçesi, "Sonra yaparım"):
// { has, doneToday, doneDays }. doneDays: bu takvim haftasında yolun bütün duraklarının bittiği gün sayısı, bugün dâhil;
// yalnız bugün bittiyse sayılır (pathDone kartı yalnız o gün; geçmiş günler dayLead.js pathDayOn ile).
export function pathState({ tests = [], sessions = [], now = new Date(), profile = null, premium = true, eye = null, later = null, modules = registry.live } = {}) {
  try {
    const progression = progressionCtx({ tests, sessions, now, modules, later })
    const plan = buildPath(modules, { tests, sessions, now, profile, eye, gate: { firstTestOnly: tests.length === 0 && !premium }, later, progression })
    const total = plan.total ?? plan.stops?.length ?? 0
    const doneToday = total > 0 && Boolean(plan.allDone)
    let doneDays = doneToday ? 1 : 0
    if (doneToday) {
      const start = startOfWeek(now)
      const today = dayKey(now)
      for (let i = 1; i < 7; i++) {
        const next = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12) // pathDayOn bir önceki günü okur
        if (dayKey(new Date(next.getTime() - DAY)) >= today) break
        const y = pathDayOn({ modules, tests, sessions, now: next, profile, premium })
        if (y?.allDone && y.total > 0) doneDays++
      }
    }
    return { has: total > 0, doneToday, doneDays }
  } catch {
    return { has: false, doneToday: false, doneDays: 0 }
  }
}

// WHO-5 düşük mü (progress.who5Card: son puan < 52)
export const who5LowOf = (sessions = [], now = new Date()) => who5Card(sessions, now).low === true

// ---------- Bağlam ----------
// nefInput (+ backLine, now) → buildMoments bağlamı. Modül anları yalnız manifestin `nef.moments`'inde bildirdiği türlerden.
// rows: söz hafızası (uygulamaya dönüş izi için). bank: o dilin bankası (sayılı ilk kayıt kurulabilir mi).
export function nefContext(input = {}, { now = new Date(), rows = [], backLine = false, modules = registry.live } = {}) {
  const { tests = [], sessions = [], habits = [], reminders = null, weather = null, path = null, who5Low = false, lang = null } = input ?? {}
  const bank = BANKS[lang] ?? null
  const lexicon = bank ? moduleLexicon(lang) : null
  const ids = (type) => new Set(modules.filter((m) => declares(m, type)).map((m) => m.id))
  const recallIds = ids('recallEffect')
  const patternIds = ids('effectPattern')
  const metricIds = ids('metricChange')
  const effects = registry.effects()
  const ctx = {
    now,
    sessions,
    effects: effects.filter((e) => recallIds.has(e.module)),
    acute: acuteEffects(sessions, { since: effectsSince(now), effects: effects.filter((e) => patternIds.has(e.module)) }),
    metrics: metricCards({ tests, sessions, metrics: registry.metrics().filter((x) => metricIds.has(x.module)), now })
      .filter((c) => c.v2 && isNum(c.v2.baseline) && isNum(c.v2.current))
      .map((c) => ({ key: c.key, module: c.module, domain: c.domain, better: c.better, verdict: c.verdict, start: c.v2.baseline, current: c.v2.current })),
    firsts: firstsOf({ now, tests, sessions, habits, modules, bank, lexicon }),
    gaps: gapsOf({ now, tests, sessions, habits, modules }),
    who5Low: who5Low === true,
    path: { has: Boolean(path?.has), doneToday: Boolean(path?.doneToday), doneDays: Number.isInteger(path?.doneDays) ? path.doneDays : 0, backLine: Boolean(backLine) },
  }
  const gap = appGapOf({ now, tests, sessions, habits, rows })
  if (gap != null) ctx.appGapDays = gap
  const walk = walkFactOf(reminders, now)
  if (walk) ctx.walk = walk
  const forecast = forecastOf(weather?.cache)
  if (forecast) ctx.forecast = forecast
  return ctx
}

// Planlayıcının Nef girdisi (notifyAll.planAll `nef`): hafıza, dil ve gün olguları
export function nefNotifyInput(input = {}, { now = new Date(), rows = [] } = {}) {
  const { tests = [], sessions = [], habits = [], path = null, who5Low = false, lang = null } = input ?? {}
  const out = { rows, lang, pathDoneToday: Boolean(path?.doneToday), who5Low: who5Low === true }
  const gap = appGapOf({ now, tests, sessions, habits, rows })
  if (gap != null) out.appGapDays = gap
  return out
}
