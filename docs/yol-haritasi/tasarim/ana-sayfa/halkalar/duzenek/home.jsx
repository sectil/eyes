// Ana sayfa halkaları düzeneği: Home, App'teki gibi (.screen kabı, sekme çubuğu) ve App.jsx'in verdiği prop'larla çizilir.
// Sayfa: home.html?s=gN&theme=light|dark&ios=1&chips=1[&bugun=…][&kilit=1][&yol=…][&gec=1][&ruzgar=1][&yazi=130]
//   s=gN     N. gün: 1.–(N−1). günün yolunun tamamı yapıldı (her gün 10.00'da). g1: ilk açılış (kurulum bugün 08.55;
//            İlk Bakış yapıldı; kayıt yok). Eski adlar: g2iki = g2&bugun=nefes,dalga; g2kilit = g2&kilit=1.
//   bugun    bugün Pratikler'den yapılanlar (virgüllü): nefes (3 dk, 08.31), dalga (5 dk, 08.41), yoga (1. ders 5 dk,
//            08.20, tamamlandı), full (Tam set, 08.50)
//   kilit=1  göz molası sürüyor (bütçe doldu, 09.05'te başladı; Tam set kilitli)
//   yol=X    bugünün yolu 08.00'de açıldı ve sıradaki durağın modülü X olana dek yapıldı (ör. breath: kart "Nefes";
//            yoga: kart "Yoga"); yol=hepsi: bugünün yolu bitti (kart "Dalga")
//   gec=1    haplar geç gelir (App'teki gibi: adım ve alarm ilk çizimde yok; adım 300 ms, alarm 700 ms sonra)
//   ruzgar=1 hava "rüzgârlı" (hava hapında lucide Wind; Nefes halkasıyla aynı çizim)
//   yazi=P   kök yazı boyu %P (büyük yazı; VARSAYIM: uygulama iOS Dinamik Yazı'yı izlemiyor, web'de tarayıcının yazı boyu)
// ios=1: iPhone uygulaması taklidi (vite.config.mjs; yoga halkası ve yoldaki yoga durağı); chips=1: hava, adım, alarm hapları.
// Geçmiş, uygulamanın GERÇEK yol koduyla gün gün kurulur (Y1_5sn_duzenek/seed.js'in yöntemi): kişi her gün yolu 10.00'da açar
// ve bütün durakları yapar; her durağın kaydı modülün yazdığı biçimde. "Şimdi" Playwright saatidir (cek.mjs: 2026-10-03
// 09.07, Cumartesi, Europe/Istanbul).
import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '/src/styles.css'
import Home from '/src/screens/Home.jsx'
import { TabBar } from '/src/components/ui.jsx'
import { registry } from '/src/modules/registry.js'
import { buildPath } from '/src/lib/today.js'
import { progressionCtx } from '/src/lib/progression.js'
import { dayKey } from '/src/lib/calendar.js'
import { makePlan, makeRecord as breathRecord, isBreath } from '/src/lib/breath.js'
import { breathPathStage, breathMixFor } from '/src/modules/breath/manifest.js'
import { makeRecord as dalgaRecord } from '/src/lib/dalga.js'
import { normalizeProfile, screeningFromProfile } from '/src/lib/profile.js'
import { withBaseline } from '/src/lib/iris.js'
import { makeYogaRecord } from '/src/lib/yogaRecord.js'
import { eyeStatus, beginRest } from '/src/lib/eyeBudgetStore.js'
import { summarizeHealth } from '/src/lib/health.js'
import { loadPlace, SKY_PLACE_KEY } from '/src/lib/places.js'
import { SKY_CACHE_KEY } from '/src/lib/sky.js'
import { ALARM_KEY } from '/src/lib/alarmLog.js'
import { isIOSApp } from '/src/lib/native.js'

const q = new URLSearchParams(location.search)
const S0 = q.get('s') ?? 'g2'
// Eski senaryo adları (tur 1)
const OLD = { g2iki: { bugun: 'nefes,dalga' }, g2kilit: { kilit: '1' } }
const S = S0.replace(/(iki|kilit)$/, '')
const P = (k) => q.get(k) ?? OLD[S0]?.[k] ?? null
const BUGUN = (P('bugun') ?? '').split(',').filter(Boolean)
const KILIT = P('kilit') === '1'
const YOL = P('yol')
const GEC = P('gec') === '1'
const RUZGAR = P('ruzgar') === '1'
const YAZI = Number(P('yazi')) || null
const CHIPS = q.get('chips') === '1'
if (YAZI) document.documentElement.style.fontSize = `${YAZI}%`
document.documentElement.dataset.theme = q.get('theme') === 'dark' ? 'dark' : 'light'
const MIN = 60000
const NOW = new Date()

// Belirlenimci rastgele (senaryo başına aynı geçmiş)
let seedA = [...`halka-${S}`].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)
const rnd = () => {
  seedA = (seedA + 0x6d2b79f5) >>> 0
  let t = seedA
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = (list) => list[Math.floor(rnd() * list.length)]
const between = (lo, hi) => lo + rnd() * (hi - lo)
const iso = (t) => new Date(t).toISOString()
const at = (daysAgo, h, m = 0) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d
}

// --- Kişi (VARSAYIM: profil cevapları Y1 düzeneğindekiyle aynı; ad sahibin) ---
const identity = { name: 'Haydar', birthDate: '1983-04-12', city: 'İzmir', avatar: { kind: 'letter', hue: 188, dataUrl: null } }
function profileFor(setup) {
  const raw = {
    version: 2, date: iso(setup), ageBand: '40-49', correction: 'reading', lastExam: '1to2', flags: [], seizure: 'no', nearDifficulty: 1,
    screenHours: '6+', sleep: 6, nightPhone: 'most', stress: { control: null, overwhelmed: null }, flagsChecked: true, prompts: {},
    firstLook: { blinks: 3, seconds: 20, method: 'camera', date: iso(setup.getTime() - 4 * MIN) }, stressNow: 2, activityDays: 2, selfCompassion: 1,
  }
  return withBaseline(normalizeProfile(raw), iso(setup))
}

// --- Durak → kayıt (modüllerin yazdığı biçim; Y1_5sn_duzenek/seed.js recordFor ve yeni modüller) ---
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
        tests.push({ type: 'va-weekly', eye, logMAR, correction: 'reading', sd: 0.05, trials: 20, algorithm: 'qvs-2', outOfRange: false, distanceTracked: true, meanDistanceMm: 400, seconds: 90, date: iso(t + i * 80000), runDay })
      })
      return 4
    case 'reading':
      tests.push({ type: 'reading', eye: 'OU', correction: 'reading', criticalPrintSize: 0.3, readingAcuity: 0.1, maxReadingSpeed: 180, cpsCensored: false, distanceTracked: true, meanDistanceMm: 400, seconds: 200, date, runDay })
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
    case 'track':
      sessions.push({ type: 'game', game: 'track', v: 2, mode: 'jump', level: 1, speed: 1, steps: 24, measured: 20, arrived: 17, pct: 85, arriveMs: 480, streak: 6, score: 170, best: null, seconds: 60, control: 'eyes', followPct: 85, date })
      return 1
    case 'snake':
      sessions.push({ type: 'game', game: 'snake', score: 12, seconds: 70, best: false, control: 'touch', date })
      return 1
    case 'breath': {
      const p = ctx.progression ? breathPathStage(ctx) : null
      const mix = p && p.tier !== 'A' ? breathMixFor(ctx, p, { seen: true }) : null
      const minutes = p ? p.minutes : 5
      const plan = makePlan({ pattern: mix?.family ?? 'calm', durationSec: minutes * 60, priorSessions: sessions.filter(isBreath).length, edits: mix?.edits ?? null })
      const calmBefore = pick([2, 3, 3, 4])
      const rec = breathRecord({ plan, seconds: Math.max(plan.totalSec, minutes * 60), calmBefore, calmAfter: Math.min(5, calmBefore + 1), completed: true }, new Date(t))
      if (p) rec.stage = p.stage.id ?? p.stage.index
      if (mix) rec.mix = { family: mix.family, inhale: mix.inhale, hold: mix.hold, exhale: mix.exhale, pause: mix.pause }
      sessions.push(rec)
      return minutes
    }
    case 'notice':
      sessions.push({ type: 'notice', count: 2, seconds: 60, date })
      return 1
    case 'fark-ettin':
      sessions.push({ type: 'street', noticed: 2, asked: 3, seconds: 60, date })
      return 1
    case 'tek-bakis':
      sessions.push({ type: 'span', span: 8, seconds: 60, date })
      return 1
    case 'okuma-anlama':
      sessions.push({ type: 'okuma-anlama', date, textId: 'oa050', cycle: 0, wpm: 220, correct: 4, valid: true, reason: null, fontScale: 1, seconds: 120 })
      return 2
    case 'yoga': {
      const planned = (s.minutes ?? 3) * 60
      const rec = makeYogaRecord({ lesson: s.stage?.lesson, planned, seconds: planned, reachedClosing: true, startedAt: new Date(t - planned * 1000), endedAt: new Date(t), before: 5, after: 7 })
      if (rec) sessions.push(rec)
      return s.minutes ?? 3
    }
    default:
      sessions.push({ type: s.id, seconds: 60, date })
      return 1
  }
}

const ctxAt = (st, now) => {
  const base = { tests: [...st.tests], sessions: [...st.sessions], now, profile: st.profile }
  return { ...base, progression: progressionCtx({ tests: base.tests, sessions: base.sessions, now, modules: registry.live }) }
}
// Bir gün: yolu `now`da aç, bütün durakları sırayla yap; gün sonunda yolun bittiği yolun kendi koduyla denetlenir
const checks = []
function doDay(st, now) {
  const ctx = ctxAt(st, now)
  const plan = buildPath(registry.live, ctx)
  let t = now.getTime() + MIN
  for (const s of plan.stops) t += recordFor(s, t, st, ctx) * MIN + Math.round(between(10, 50)) * 1000
  const end = new Date(t + MIN)
  const after = buildPath(registry.live, ctxAt(st, end))
  checks.push({ day: dayKey(now), stops: plan.stops.map((s) => s.title), allDone: Boolean(after.allDone), left: after.stops.filter((s) => !s.done).map((s) => s.title) })
}

// gN: N. gün (yoklama için her gün açılabilir); g2iki ve g2kilit 2. gün
const DAY_N = Math.max(1, Number(S.match(/^g(\d+)/)?.[1] ?? 2))
const setup = DAY_N === 1 ? at(0, 8, 55) : at(DAY_N - 1, 9, 50)
const st = { tests: [], sessions: [], profile: profileFor(setup) }
for (let n = 1; n < DAY_N; n++) doDay(st, at(DAY_N - n, 10, Math.floor(rnd() * 6)))
// Bugünün yolu 08.00'de açıldı: sıradaki durağın modülü YOL olana dek (ya da hepsi) yapılır
let yolDurum = null
if (YOL) {
  const t0 = at(0, 8, 0)
  const ctx = ctxAt(st, t0)
  const plan = buildPath(registry.live, ctx)
  let t = t0.getTime() + MIN
  const did = []
  for (const s of plan.stops) {
    if (YOL !== 'hepsi' && s.id === YOL) break
    t += recordFor(s, t, st, ctx) * MIN + Math.round(between(10, 50)) * 1000
    did.push(s.title)
  }
  const found = YOL === 'hepsi' || plan.stops.some((s) => s.id === YOL)
  yolDurum = { istenen: YOL, yapilan: did, bulundu: found, bitis: new Date(t).toTimeString().slice(0, 5) }
}
// Bugün Pratikler'den: Nefes (3 dk), Dalga (5 dk), Yoga (1. ders 5 dk), Tam set
if (BUGUN.includes('yoga')) {
  const rec = makeYogaRecord({ lesson: 1, planned: 300, seconds: 300, reachedClosing: true, startedAt: at(0, 8, 15), endedAt: at(0, 8, 20), before: 6, after: 4 })
  if (rec) st.sessions.push(rec)
}
if (BUGUN.includes('nefes')) {
  const plan = makePlan({ pattern: 'calm', durationSec: 180, priorSessions: st.sessions.filter(isBreath).length })
  st.sessions.push(breathRecord({ plan, seconds: 180, calmBefore: 3, calmAfter: 4, completed: true }, at(0, 8, 31)))
}
if (BUGUN.includes('dalga')) st.sessions.push(dalgaRecord({ mode: 'sakin', minutes: 5, before: 5, after: 7, plan: { used: false }, seconds: 300 }, at(0, 8, 41)))
if (BUGUN.includes('full')) st.sessions.push({ type: 'routine', setId: 'full', seconds: 240, steps: 8, date: iso(at(0, 8, 50)) })
st.tests.sort((a, b) => a.date.localeCompare(b.date))
st.sessions.sort((a, b) => a.date.localeCompare(b.date))
const ids = (list, p) => list.map((r, i) => ({ id: `hk${S}${p}${i.toString(36)}`, ...r }))
const tests = ids(st.tests, 't')
const sessions = ids(st.sessions, 's')

// --- Cihazdaki depo: sayfa her açılışta temiz başlar ---
localStorage.clear()
if (st.sessions.some(isBreath)) localStorage.setItem('gozolcum:breath-safety', '1')
// Hava (VARSAYIM: sahibin ekranındaki "Bornova 16°" benzeri; önbellek 08.30'da alındı, yağmur yok). SkyChip yalnız
// önbellekten okur (lib/sky.js loadCache, lib/skyView.js nowView); App sky prop'u loadPlace() verir.
if (CHIPS) {
  localStorage.setItem(SKY_PLACE_KEY, JSON.stringify({ il: 'İzmir', ilce: 'Bornova', approx: false }))
  const h0 = at(0, 9, 0).getTime()
  const hours = Array.from({ length: 24 }, (_, i) => ({ at: h0 + i * 3600000, tempC: 16 + Math.min(i, 6) * 0.8, precipChance: 0.05, symbol: RUZGAR ? 'wind' : i < 9 ? 'sun.max' : 'cloud.sun' }))
  const data = { fetchedAt: at(0, 8, 30).getTime() / 1000, now: { at: at(0, 9, 0).getTime(), tempC: 16.2, apparentC: 15.4, symbol: RUZGAR ? 'wind' : 'sun.max' }, hours, days: [] }
  localStorage.setItem(SKY_CACHE_KEY, JSON.stringify({ at: iso(at(0, 8, 30)), data }))
  // Alarm (VARSAYIM: hafta her gün 07.00, AlarmKit; yarın 07.00'de çalar → hap "07:00 alarm · yarın")
  localStorage.setItem(ALARM_KEY, JSON.stringify({ on: true, hour: 7, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], at: null, sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: iso(setup) }))
}
// g2kilit: göz molası sürüyor (bütçe doldu: 5 dk mola; lib/eyeBudgetStore.js beginRest)
if (KILIT) beginRest('budget', at(0, 9, 5).getTime())
const eyeBudget = eyeStatus()

const settings = {
  screening: screeningFromProfile(st.profile),
  profile: st.profile,
  identity,
  distance: { focalPx: 1400, irisPxAt40: 40, method: 'face', date: iso(setup) },
  calibration: { pxPerMm: 6.3, method: 'ruler', date: iso(setup) },
  reminder: null,
  reminders: null,
  consents: {},
}
// Sağlık (App: { ...summarizeHealth(son 7 gün), recentSteps, at }). Bugün 506 adım. VARSAYIM: son 1 saatte 320 adım; 100'ün
// altı yürüme önerisini açar (lib/health.js walkNudge), sahibin ekranında büyük kart "Başla" olduğu için açık değil.
const health = CHIPS
  ? { ...summarizeHealth(Array.from({ length: 7 }, (_, i) => ({ date: dayKey(at(6 - i, 12)), steps: i === 6 ? 506 : 5200 + i * 310, distanceM: 0, exerciseMin: 0 }))), recentSteps: 320, at: iso(at(0, 9, 0)) }
  : null
const alarmStatus = CHIPS ? { platform: 'alarmkit', auth: 'authorized', missing: false } : null
const sky = CHIPS ? loadPlace() : null
const noop = () => {}
window.__opened = []
const go = (r) => window.__opened.push(r)

window.__seed = {
  scenario: S0, now: NOW.toString(), ios: isIOSApp(), chips: CHIPS, dayN: DAY_N, bugun: BUGUN, kilit: KILIT, yol: yolDurum, gec: GEC, ruzgar: RUZGAR, yazi: YAZI,
  records: { tests: tests.length, sessions: sessions.length },
  checks, eyeBudget,
}

// gec=1: App'teki gibi adım (readHealth) ve alarm durumu (alarmCheck) ilk çizimden sonra gelir; alarmSt'nin ilk değeri
// { platform: 'web', auth: null } (App.jsx)
function Page() {
  const [late, setLate] = useState({ health: !GEC, alarm: !GEC })
  useEffect(() => {
    if (!GEC) return undefined
    const a = setTimeout(() => setLate((x) => ({ ...x, health: true })), 300)
    const b = setTimeout(() => setLate((x) => ({ ...x, alarm: true })), 700)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  const healthNow = late.health ? health : null
  const alarmNow = late.alarm ? alarmStatus : CHIPS ? { platform: 'web', auth: null } : null
  return (
    <>
      <main className="screen has-tabbar fade-in">
        <Home
          tests={tests} sessions={sessions} settings={settings} distanceTracked trueDepth={false} eyeBudget={eyeBudget}
          premium member={false} askConsent={false} onConsent={noop} health={healthNow} askHealth={false} onHealthConsent={noop}
          healthSheetKind="health" onStart={go} nef={null} onAsk={noop} onSaveProfile={noop} reminderAsk={false} onReminders={async () => null}
          focus={null} focusBlock={null} onStopFocus={noop} trialNote={null} onTrialNote={noop} alarmStatus={alarmNow} alarmTest={false}
          onYogaMorning={noop} sky={sky}
        />
      </main>
      <TabBar active="home" onChange={go} />
    </>
  )
}
createRoot(document.getElementById('root')).render(<Page />)
