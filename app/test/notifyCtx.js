// Bildirim planı için tohumlu bağlam üreteci (PLAN.v1 §5.5 madde 5 (b)). Yalnız testler kullanır.
// mulberry32(1) → 20.000 bağlam: now (7 gün × 24 saat ve yaz saati günleri), reminders (4 tür × açık/kapalı × saat ×
// thin), study, habits, sessions, health (yok/eski/taze), focus (1–4 sa, gece dâhil), seed, log.
// Saat dilimi çağıranda (Europe/Berlin: yaz saati günü gerçekten geçiş olsun).

export function mulberry32(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n) => String(n).padStart(2, '0')
const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const TYPES = ['mola', 'walk', 'breath', 'water']
const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
// Bir hafta (Pzt 28 Eylül 2026) + yaz saati günleri (Berlin: 25 Ekim 2026 geri, 29 Mart 2026 ileri) ve arifeleri
const DAY_STARTS = [
  [2026, 8, 28], [2026, 8, 29], [2026, 8, 30], [2026, 9, 1], [2026, 9, 2], [2026, 9, 3], [2026, 9, 4],
  [2026, 9, 24], [2026, 9, 25], [2026, 2, 28], [2026, 2, 29],
]

export function makeContext(rnd) {
  const pick = (list) => list[Math.floor(rnd() * list.length)]
  const chance = (p) => rnd() < p
  const [y, mo, d] = pick(DAY_STARTS)
  const now = new Date(y, mo, d, Math.floor(rnd() * 24), Math.floor(rnd() * 60), Math.floor(rnd() * 60))
  const dayAt = (off, m) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + off, Math.floor(m / 60), m % 60)
  // Saat: çoğunlukla 15 dk ızgarası (pencere dışı da), bazen şimdiye çok yakın (LEAD_MS sınırı)
  const time = () => (chance(0.1) ? hhmm((now.getHours() * 60 + now.getMinutes() + 1) % 1440) : hhmm(Math.floor(rnd() * 96) * 15))

  const types = {}
  for (const t of TYPES) types[t] = { on: chance(0.5), time: time() }
  types.study = { on: chance(0.3) }
  const thin = {}
  for (const t of TYPES) if (chance(0.15)) thin[t] = 'alt'
  const reminders = chance(0.05) ? null : { optIn: pick(['yes', 'yes', 'yes', 'yes', null, 'no']), askedAt: null, types, thin, thinAsked: {} }
  const study = chance(0.3) ? null : { days: DAYS.filter(() => chance(0.4)), time: time() }

  const habits = []
  for (let i = 0, n = Math.floor(rnd() * 4); i < n; i++) {
    const at = dayAt(-Math.floor(rnd() * 2), Math.floor(rnd() * 1440))
    habits.push({ date: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`, type: pick(['mola', 'water']), at: at.toISOString() })
  }
  const sessions = []
  for (let i = 0, n = Math.floor(rnd() * 3); i < n; i++) {
    sessions.push({ type: pick(['breath', 'breath', 'blink']), seconds: pick([30, 60, 90, 240]), date: dayAt(-Math.floor(rnd() * 2), Math.floor(rnd() * 1440)).toISOString() })
  }
  const hk = rnd()
  const health =
    hk < 0.3 ? null : { todaySteps: Math.floor(rnd() * 12000), avgSteps: chance(0.1) ? 0 : Math.floor(rnd() * 10000), readAt: (hk < 0.55 ? dayAt(-2, 600) : dayAt(0, Math.floor(rnd() * 1440))).toISOString() }
  const focus = chance(0.25)
    ? { startedAt: new Date(now.getTime() - Math.floor(rnd() * 5 * 3600000) + (chance(0.1) ? 3600000 : 0)).toISOString(), hours: pick([1, 2, 4, 3]) }
    : null
  const seed = chance(0.1) ? '' : `s${Math.floor(rnd() * 1e6)}`
  let log = null
  if (chance(0.4)) {
    log = []
    for (let i = 0, n = Math.floor(rnd() * 5); i < n; i++) {
      const off = pick([0, 0, 1])
      const date = dayAt(off, 0)
      const plannedAt = chance(0.3) ? new Date(now.getTime() + Math.floor(rnd() * 60000)) : dayAt(off, Math.floor(rnd() * 1440))
      log.push({ date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, type: pick(TYPES), eligible: true, arm: 'send', skipReason: null, plannedAt: plannedAt.toISOString() })
    }
  }
  return { now, reminders, study, habits, sessions, health, focus, seed, log }
}

// Modül listesi (registry.reminders() biçimi; moduleRemind.js)
export const MODULES = [
  { id: 'blink', remind: { route: 'blink', window: 'move', defaultTime: '10:00', maxTimes: 3, science: ['s1'] }, doneToday: false },
  { id: 'snake', remind: { route: 'snake', window: 'move', defaultTime: '14:00', maxTimes: 3, science: ['s2'] }, doneToday: false },
  { id: 'yoga', remind: { route: 'yoga', window: 'calm', defaultTime: '20:00', maxTimes: 3, science: ['s3', 's4'] }, doneToday: false },
  { id: 'gokyuzu', remind: { route: 'gokyuzu', window: 'calm', defaultTime: '21:30', maxTimes: 2, science: ['s5'] }, doneToday: false },
  { id: 'dalga', remind: { route: 'dalga', window: 'calm', defaultTime: '08:15', maxTimes: 3, science: ['s6'] }, doneToday: false },
  { id: 'breath', remind: { route: 'breath-1', legacy: 'breath', maxTimes: 3, science: ['s7'] }, doneToday: false },
  { id: 'mola', remind: { legacy: 'mola', maxTimes: 3, science: ['s8'] }, doneToday: false },
  { id: 'water', remind: { legacy: 'water', maxTimes: 3, science: ['s9'] }, doneToday: false },
  { id: 'walk', remind: { legacy: 'walk', maxTimes: 3, science: ['s10'] }, doneToday: false },
]

// Sabah havası girdisi (weatherNotify.planMorningWeather): önbellek now'dan 0–20 saat önce çekilmiş (18 saat sınırının
// iki yanı), bugün + yarın saatlik satırlar (hissedilen apparentC dâhil), rastgele yağmur saatleri; ayar alarm/alarmsız/"alarmsız günde gönderme".
export function makeWeatherInput(rnd, now) {
  const pick = (list) => list[Math.floor(rnd() * list.length)]
  const H = 3600000
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const fetched = new Date(now.getTime() - Math.floor(rnd() * 20 * 60) * 60000)
  const rainAt = rnd() < 0.4 ? Math.floor(rnd() * 48) : -1
  const hours = Array.from({ length: 48 }, (_, h) => {
    const at = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + Math.floor(h / 24), h % 24).getTime()
    const tempC = Math.round(-5 + rnd() * 40)
    // apparentC rnd çağırmaz (dizi ve öteki bağlamlar değişmesin). Swift hours[] satırı da apparentC taşır
    // (SkyPlugin.swift hourRows; karar 2: bildirim saatindeki hissedilen)
    return { at, tempC, apparentC: tempC - 2, precipChance: rainAt >= 0 && h >= rainAt && h < rainAt + 3 ? 0.8 : 0.1 }
  })
  const days = [0, 1].map((off) => {
    const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + off)
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, highC: Math.round(-5 + rnd() * 45) }
  })
  const morningWeather = { on: true, delayMin: pick([10, 20, 30]), time: pick(['07:00', '08:00', '08:30', '09:00', '10:00']), noAlarm: rnd() < 0.2 ? 'skip' : 'send' }
  return { morningWeather, weather: { cache: { at: fetched.toISOString(), data: { fetchedAt: fetched.getTime(), hours, days } }, place: { il: 'İzmir', ilce: 'Gaziemir' }, localRefresh: null } }
}

// Yeni özellik AÇIK rastgele ayar: modül hatırlatmaları, legacy ek saatleri, gece sessizliği, alarm. wrnd verilirse
// (ayrı üreteç: rnd dizisi ve öteki bağlamlar değişmesin) bağlamların ≈ %60'ında sabah havası da açık.
export function makeFeatureInput(rnd, ctx, wrnd = null) {
  const pick = (list) => list[Math.floor(rnd() * list.length)]
  const chance = (p) => rnd() < p
  const time = () => hhmm(Math.floor(rnd() * 96) * 15)
  const moduleReminders = {}
  for (const m of MODULES) {
    if (!chance(0.5)) continue
    const n = 1 + Math.floor(rnd() * 3)
    moduleReminders[m.id] = { on: chance(0.85), mode: chance(0.5) ? 'manual' : 'auto', times: Array.from({ length: n }, time), autoAt: null, setAt: null }
  }
  if (chance(0.2)) moduleReminders.path = { on: true, mode: 'manual', times: [time()], autoAt: null, setAt: null }
  if (!Object.values(moduleReminders).some((c) => c.on)) moduleReminders.blink = { on: true, mode: 'manual', times: [time()], autoAt: null, setAt: null }
  const modules = MODULES.map((m) => ({ ...m, doneToday: chance(0.1) }))
  const alarm = chance(0.4) ? { on: true, hour: 4 + Math.floor(rnd() * 6), minute: pick([0, 15, 30, 45]), days: chance(0.7) ? [1, 2, 3, 4, 5] : [], at: new Date(ctx.now.getTime() + 8 * 3600000).toISOString() } : null
  const quiet = chance(0.5) ? null : { from: pick(['22:00', '22:30', '23:00', '23:30', '00:00']), to: pick(['06:00', '07:00', '08:30', '10:00']) }
  const wx = wrnd && wrnd() < 0.6 ? makeWeatherInput(wrnd, ctx.now) : {}
  return { ...ctx, modules, moduleReminders, alarm, quiet, ...wx }
}
