// Y1 ekran görüntüleri · kayıt geçmişi üretici. Sayfa: /@fs/<duzenek>/seed.html?s=<senaryo>
// Geçmiş, uygulamanın GERÇEK yol koduyla gün gün kurulur (lib/today.js buildPath, lib/progression.js progressionCtx,
// modules/*/manifest.js): kişi her gün yolu açar ve sıradaki bütün durakları yapar; her durağın kaydı, modülün yazdığı
// biçimde (stage, stepIds, variant, mix alanlarıyla) depoya girer. Sonra localStorage'a gozolcum:v1 (store sürümü 1,
// lib/storage.js) yazılır; app.html uygulamayı bu kayıtla açar. "Şimdi" Playwright saatidir (cek.mjs).
//   g1     yeni kullanıcı, 1. gün (kurulum bugün 09.50; kayıt yok)
//   g2     yeni kullanıcı, 2. gün (1. gün 10.00'da yolun tamamı)
//   g9     yeni kullanıcı, 9. gün (1.–8. gün 10.00'da yolun tamamı)
//   eski   Y1 öncesinden 70 günlük kullanıcı, güncelleme günü (hiçbir kayıtta stage yok)
//   nefes  g9 + bugün 1. bölüm bitmiş (10.00–10.08); sıradaki durak Nefes (3 dk, "Bugünün ritmi")
import { registry } from '/src/modules/registry.js'
import { buildPath } from '/src/lib/today.js'
import { progressionCtx, newStopKeys, updateDay } from '/src/lib/progression.js'
import { dayKey } from '/src/lib/calendar.js'
import { makePlan, makeRecord, isBreath } from '/src/lib/breath.js'
import { breathPathStage, breathMixFor } from '/src/modules/breath/manifest.js'
import { latestRelease } from '/src/lib/releases.js'
import { INTRO_VERSION } from '/src/lib/intro.js'
import { normalizeProfile, screeningFromProfile } from '/src/lib/profile.js'
import { withBaseline, withRecheck } from '/src/lib/iris.js'
import { makeYogaRecord } from '/src/lib/yogaRecord.js'

const MIN = 60000
const DAY = 86400000
const q = new URLSearchParams(location.search)
const S = q.get('s') ?? 'g1'
const NOW = new Date() // Playwright saati (cek.mjs): 2026-09-30 10.00 (nefes: 10.09), Europe/Istanbul

// Belirlenimci rastgele (senaryo başına aynı geçmiş)
function rng(seed) {
  let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = rng(`y1-${S === 'nefes' ? 'g9' : S}`) // nefes, g9 ile aynı geçmiş
const pick = (list) => list[Math.floor(rnd() * list.length)]
const between = (lo, hi) => lo + rnd() * (hi - lo)
const iso = (t) => new Date(t).toISOString()
// n gün önce, saat h:m (yerel)
const at = (daysAgo, h, m = 0) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d
}

// --- Kişi ---
const identity = { name: 'Deniz', birthDate: '1983-04-12', city: 'İstanbul', avatar: { kind: 'letter', hue: 188, dataUrl: null } }
function profileFor(setup, { stress = false, recheck = null } = {}) {
  const raw = {
    version: 2,
    date: iso(setup),
    ageBand: '40-49',
    correction: 'reading',
    lastExam: '1to2',
    flags: [],
    seizure: 'no',
    nearDifficulty: 1,
    screenHours: '6+',
    sleep: 6,
    nightPhone: 'most',
    stress: stress ? { control: 2, overwhelmed: 1 } : { control: null, overwhelmed: null },
    flagsChecked: true,
    prompts: {},
    firstLook: { blinks: 3, seconds: 20, method: 'camera', date: iso(setup.getTime() - 4 * MIN) },
    stressNow: 2,
    activityDays: 2,
    selfCompassion: 1,
  }
  let p = withBaseline(normalizeProfile(raw), iso(setup))
  if (recheck) p = withRecheck({ ...p, stressNow: 1, sleep: 7, activityDays: 3, selfCompassion: 2 }, iso(recheck))
  return p
}

// --- Durak → kayıt (modüllerin yazdığı biçim; lib/today.test.js y1Record'un zenginleştirilmişi) ---
const EYES = { R: 0.1, L: 0.14, OU: 0.04 }
function recordFor(s, t, st, ctx) {
  const { tests, sessions } = st
  const date = iso(t)
  const runDay = dayKey(new Date(t))
  const stage = s.stage ?? null
  switch (s.id) {
    case 'weekly':
      ;['R', 'L', 'OU'].forEach((eye, i) => {
        const logMAR = +(EYES[eye] + between(-0.04, 0.04)).toFixed(3)
        tests.push({ type: 'va-weekly', eye, logMAR, correction: 'reading', sd: +between(0.04, 0.07).toFixed(3), trials: 18 + Math.floor(rnd() * 8), algorithm: 'qvs-2', outOfRange: false, distanceTracked: true, meanDistanceMm: 395 + Math.floor(rnd() * 20), seconds: 70 + Math.floor(rnd() * 40), date: iso(t + i * 80000), runDay })
      })
      return 4
    case 'reading':
      tests.push({ type: 'reading', eye: 'OU', correction: 'reading', criticalPrintSize: 0.3, readingAcuity: +between(0.05, 0.15).toFixed(2), maxReadingSpeed: Math.round(between(165, 195)), cpsCensored: false, distanceTracked: true, meanDistanceMm: 400, seconds: 180 + Math.floor(rnd() * 60), date, runDay })
      return 3
    case 'routine': {
      const setId = s.key.split(':')[1]
      const steps = Array.isArray(stage?.steps) ? stage.steps : null
      const rec = { type: 'routine', setId, seconds: Math.round(between(38, 62)), steps: steps?.length ?? 3, date }
      if (stage) {
        const v = stage.variant
        Object.assign(rec, { stage: stage.id ?? stage.index, stepIds: steps ?? [], variant: v && typeof v === 'object' ? v.id ?? null : v ?? null })
      }
      sessions.push(rec)
      return 1
    }
    case 'track': {
      const measured = 20
      const arrived = 15 + Math.floor(rnd() * 5)
      sessions.push({ type: 'game', game: 'track', v: 2, mode: 'jump', level: 1, speed: 1, steps: 24, measured, arrived, pct: Math.round((100 * arrived) / measured), arriveMs: Math.round(between(420, 560)), streak: 6, score: arrived * 10, best: null, seconds: 60, control: 'eyes', followPct: Math.round((100 * arrived) / measured), date })
      return 1
    }
    case 'snake':
      sessions.push({ type: 'game', game: 'snake', score: 8 + Math.floor(rnd() * 20), seconds: 60 + Math.floor(rnd() * 30), best: false, control: 'touch', date })
      return 1
    case 'breath': {
      // Yoldan açılan nefes (modules/breath/view.jsx breathPath): basamak süresi ve "Bugünün ritmi"; ilerleme yokken 5 dk
      const p = ctx.progression ? breathPathStage(ctx) : null
      const mix = p && p.tier !== 'A' ? breathMixFor(ctx, p, { seen: true }) : null
      const prior = sessions.filter(isBreath).length
      const minutes = p ? p.minutes : 5
      const plan = makePlan({ pattern: mix?.family ?? 'calm', durationSec: minutes * 60, priorSessions: prior, edits: mix?.edits ?? null })
      let seconds = Math.max(plan.totalSec, minutes * 60)
      if (p?.more && rnd() < 0.5) seconds = 300 // "2 dk daha" ile 5 dk'ya tamamladığı günler
      const calmBefore = pick([2, 3, 3, 4])
      const rec = makeRecord({ plan, seconds, calmBefore, calmAfter: Math.min(5, calmBefore + pick([0, 1, 1, 2])), completed: true }, new Date(t))
      if (p) rec.stage = p.stage.id ?? p.stage.index
      if (mix) rec.mix = { family: mix.family, inhale: mix.inhale, hold: mix.hold, exhale: mix.exhale, pause: mix.pause }
      sessions.push(rec)
      return seconds > 200 ? 5 : minutes
    }
    case 'notice':
      sessions.push({ type: 'notice', count: 1 + Math.floor(rnd() * 3), seconds: 60, date })
      return 1
    case 'fark-ettin':
      sessions.push({ type: 'street', noticed: 1 + Math.floor(rnd() * 3), asked: 3, seconds: 60, date })
      return 1
    case 'tek-bakis':
      sessions.push({ type: 'span', span: 7 + Math.floor(rnd() * 3), seconds: 60, date })
      return 1
    case 'yoga': {
      const planned = (s.minutes ?? 3) * 60
      const rec = makeYogaRecord({ lesson: s.stage?.lesson, planned, seconds: planned, reachedClosing: true, startedAt: new Date(t - planned * 1000), endedAt: new Date(t), before: pick([4, 5, 6]), after: pick([6, 7, 8]) })
      if (rec) sessions.push(rec)
      return s.minutes ?? 3
    }
    default:
      sessions.push({ type: s.id, seconds: 60, date })
      return 1
  }
}

// Bir gün: yolu `now`da aç, durakları sırayla yap (skip: atlama olasılığı; stopWhen: o durakta dur)
function doDay(st, now, { progression = true, modules = registry.live, skip = 0, until = null } = {}) {
  const base = { tests: [...st.tests], sessions: [...st.sessions], now, profile: st.profile }
  const ctx = progression ? { ...base, progression: progressionCtx({ tests: base.tests, sessions: base.sessions, now, modules }) } : base
  const plan = buildPath(modules, ctx)
  let t = now.getTime() + MIN
  for (const s of plan.stops) {
    if (until && until(s)) break
    if (skip && !s.restSlot && rnd() < skip) continue
    t += recordFor(s, t, st, ctx) * MIN + Math.round(between(10, 50)) * 1000
  }
  return plan
}

// --- Senaryolar ---
function newUser(dayN) {
  const setup = at(dayN - 1, 9, 50)
  const st = { tests: [], sessions: [], profile: profileFor(setup, { stress: dayN >= 8 }) }
  for (let n = 1; n < dayN; n++) doDay(st, at(dayN - n, 10, Math.floor(rnd() * 6)))
  return { setup, st, report: dayN >= 5 ? at(dayN - 5, 10, 25) : null }
}
function oldUser() {
  const H = 70
  const YOGA_FROM = 21 // yoga bu kadar gün önce yayına girdi (VARSAYIM; onaylı sıraya göre Y1'den önce)
  const setup = at(H + 1, 21, 5)
  const st = { tests: [], sessions: [], profile: profileFor(setup, { stress: true, recheck: at(H - 27, 10, 40) }) }
  const noYoga = registry.live.filter((m) => m.id !== 'yoga')
  for (let k = H; k >= 1; k--) {
    if (rnd() < 0.07) continue // arada açılmayan günler
    doDay(st, at(k, 9 + Math.floor(rnd() * 3), Math.floor(rnd() * 60)), { progression: false, modules: k > YOGA_FROM ? noYoga : registry.live, skip: 0.06 })
  }
  return { setup, st, report: at(H - 4, 10, 25) }
}

let made
if (S === 'eski') made = oldUser()
else if (S === 'g1') made = newUser(1)
else if (S === 'g2') made = newUser(2)
else made = newUser(9) // g9, nefes
const { setup, st, report } = made
// nefes: bugün 1. bölüm (Nefes'ten önceki duraklar) bitti; yol 10.00'da açıldı
if (S === 'nefes') doDay(st, at(0, 10, 0), { until: (s) => s.restSlot })

st.tests.sort((a, b) => a.date.localeCompare(b.date))
st.sessions.sort((a, b) => a.date.localeCompare(b.date))
const ids = (list) => list.map((r, i) => ({ id: `y1${S}${i.toString(36)}`, ...r }))

// Kalibrasyon bu bağlamın ekranıyla (screens/CardCalibration.jsx calibrationStillValid)
const settings = {
  screening: screeningFromProfile(st.profile),
  profile: st.profile,
  calibration: { pxPerMm: 6.3, dpr: window.devicePixelRatio, screenW: window.screen.width, screenH: window.screen.height, method: 'ruler', date: iso(setup) },
  distance: { focalPx: 1400, irisPxAt40: 40, method: 'face', date: iso(setup) },
  reminder: null,
  identity,
  intro: { seen: true, version: INTRO_VERSION, date: iso(setup.getTime() - 6 * MIN) },
  releaseSeen: latestRelease()?.id ?? null,
  account: { mode: 'guest', date: iso(setup.getTime() - 3 * MIN) },
  firstLookPending: null,
  setupCorrection: 'reading',
  identitySetup: { date: iso(setup.getTime() + MIN) },
  irisPlanSeen: { date: iso(setup.getTime() + 2 * MIN) },
  consents: {},
  reminders: null,
  ...(report ? { firstReportSeen: { date: iso(report) } } : {}),
}
const state = { version: 1, settings, tests: ids(st.tests), sessions: ids(st.sessions) }

localStorage.clear()
localStorage.setItem('gozolcum:v1', JSON.stringify(state))
// Nefes güvenlik kartı: nefesi daha önce yapan kişi görmüştür (lib/breath.js safetySeen)
if (st.sessions.some(isBreath)) localStorage.setItem('gozolcum:breath-safety', '1')

// Özet: Ana sayfanın kuracağı yolun aynısı (screens/Home.jsx: registry.live, ctx.progression, profil)
const ctx = { tests: st.tests, sessions: st.sessions, now: NOW, profile: st.profile }
ctx.progression = progressionCtx({ tests: ctx.tests, sessions: ctx.sessions, now: NOW, modules: registry.live })
const plan = buildPath(registry.live, ctx)
const out = {
  scenario: S,
  now: NOW.toString(),
  yogaIos: import.meta.env.VITE_Y1_YOGA === '1',
  records: { tests: st.tests.length, sessions: st.sessions.length, days: new Set([...st.tests, ...st.sessions].map((r) => dayKey(new Date(r.date)))).size },
  pathDay: ctx.progression.pathDay,
  updateDay: updateDay(ctx.progression),
  D: Object.fromEntries(['routine', 'breath', 'yoga', 'notice'].map((k) => [k, ctx.progression.mod[k] ? `${ctx.progression.mod[k].D}/${ctx.progression.mod[k].Dstage}` : null])),
  total: plan.stops.reduce((a, s) => a + (s.minutes ?? 0), 0),
  minutesLeft: plan.minutesLeft,
  stops: plan.stops.map((s) => `${s.done ? '✓' : ''}${s.title}${s.restSlot ? ' (mola)' : ''} ${s.minutes ?? '?'} dk · b${s.block}${s.stage?.tier ? ` · ${s.stage.tier}` : ''}${s.sub && s.id === 'yoga' ? ` · ${s.sub}` : ''}`),
  newKeys: newStopKeys(ctx, plan.stops),
  breath: (() => {
    const p = breathPathStage(ctx)
    if (!p) return null
    const mix = p.tier !== 'A' ? breathMixFor(ctx, p, { seen: true }) : null
    return { minutes: p.minutes, tier: p.tier, more: p.more, mix: mix ? `${mix.title} ${mix.label}` : null }
  })(),
}
window.__seed = out
document.getElementById('out').textContent = JSON.stringify(out, null, 2)
