// Nef Göz Koçu — istemci (Bugün kartı). Sinyaller kural katmanında hesaplanır; sunucuya yalnızca
// bu özet sayılar gider. Sunucu/model cevap vermezse kural tabanlı şablon metin gösterilir.
import { pickSeries } from './vaSeries.js'
import { activitiesFrom, countedActivities, summary, isExerciseSession } from './stats.js'
import { sanitizeSignals, isStaleAdvice } from './coachCore.js'
import { registry } from '../modules/registry.js'
import { normalizeProfile } from './profile.js'
import { weeklyStatus } from './today.js'

export const COACH_URL = import.meta.env?.VITE_COACH_URL || 'https://eyetrail.vercel.app/api/coach'
const CACHE_KEY = 'gozolcum:coach-today'
const DAY = 86400000
const TIMEOUT_MS = 10000

const dayKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`
}

// Profil cevaplarının özeti: yalnız kişinin kendi cevapları, tanı değil (lib/profileQuestions.js "neden sordum")
export function lifeSignals(profile) {
  const p = normalizeProfile(profile)
  const st = p.stress.control != null && p.stress.overwhelmed != null ? p.stress.control + p.stress.overwhelmed : null
  return { screenHours: p.screenHours, sleep7: p.sleep, nightPhone: p.nightPhone, stress8: st }
}

export function buildSignals(tests = [], sessions = [], now = new Date(), weeklyTarget = 3, profile = null) {
  const all = activitiesFrom(tests, sessions)
  const acts = countedActivities(all) // oyunlar hedefe/seriye sayılmaz
  const since7 = now.getTime() - 7 * DAY
  const recent = acts.filter((a) => new Date(a.date).getTime() >= since7)
  const s = summary(acts, now)
  // Öne çıkan göz serisi (lib/vaSeries.js): uyarısı en ciddi göz → son 14 günde en çok ölçülen → sağ, sol, iki göz
  const tr = pickSeries(tests, now.toISOString()).trend
  const lastOf = (arr) => (arr.length ? Math.max(...arr.map((x) => new Date(x.date).getTime())) : null)
  const lastTest = lastOf(tests)
  const ex = sessions.filter(isExerciseSession)
  const lastEx = lastOf(ex)
  const reading = tests.filter((t) => t.type === 'reading' && Number.isFinite(t.maxReadingSpeed)).at(-1)
  return sanitizeSignals({
    daysActive7: new Set(recent.map((a) => dayKey(a.date))).size,
    minutes7: Math.round(recent.reduce((m, a) => m + (a.seconds || 0), 0) / 60),
    streakDays: s.streakDays,
    weeklyTarget,
    thisWeekDays: s.thisWeekDays,
    exercises7: recent.filter((a) => a.kind === 'exercise').length,
    tests7: recent.filter((a) => a.kind === 'test').length,
    vaPhase: tr.phase,
    vaCurrent7: tr.current7,
    vaBaseline: tr.baseline,
    vaDelta: tr.delta,
    vaTrend: tr.trend ?? null,
    vaAlert: tr.alert ?? null,
    readingWpm: reading?.maxReadingSpeed ?? null,
    // Haftalık E testinin zamanı (lib/today.js weeklyStatus): sistem istemi "Haftalık test"i buna göre önerir
    weeklyDue: weeklyStatus(tests, now).due,
    daysSinceLastTest: lastTest == null ? null : Math.floor((now.getTime() - lastTest) / DAY),
    daysSinceLastExercise: lastEx == null ? null : Math.floor((now.getTime() - lastEx) / DAY),
    snakeBest: summary(all, now).bestSnake,
    hourNow: now.getHours(),
    modules: moduleSignals(sessions, now),
    ...(profile ? lifeSignals(profile) : {}),
  })
}

// Modül özetleri (registry coach()); bozuk modül diğerlerini düşürmez
export function moduleSignals(sessions = [], now = new Date()) {
  const out = {}
  for (const m of registry.live) {
    if (typeof m.coach !== 'function') continue
    try {
      const v = m.coach(sessions, now)
      if (v && typeof v === 'object') out[m.id] = v
    } catch {
      // atla
    }
  }
  return out
}

// Kural tabanlı yedek (internet/sunucu yoksa ya da koç kapalıysa). Model kurallarıyla (coachCore.js SYSTEM_PROMPT) ve
// Gelişim metinleriyle (trend.js trendMessage) aynı çizgide. Karar 2026-09-29: E testi haftada bir; Nef günlük test
// önermez. Kırmızıda yalnız göz doktoru (bekletme yok); sarıda "sonraki testlerde de sürerse".
// opts.weeklyDue: haftalık E testinin zamanı geldi mi (lib/today.js weeklyStatus). Verilmezse sig.weeklyDue (buildSignals
// yazar; sistem istemi de buna bakar), o da yoksa: hiç ölçüm yok ya da son 7 günde ölçüm yok ve son ölçüm 7+ gün önce.
export function fallbackInsight(sig, opts = {}) {
  if (sig.vaAlert === 'red') {
    return { insight: 'Son ölçümlerin başlangıcına göre belirgin şekilde kötü.', action: 'Lütfen bir göz doktoruna başvur' }
  }
  if (sig.vaAlert === 'yellow') {
    return { insight: 'Son ölçümlerin başlangıcından biraz kötü.', action: 'Işığı ve mesafeyi kontrol et; sürerse göz doktoruna danış' }
  }
  const weeklyDue = typeof opts.weeklyDue === 'boolean'
    ? opts.weeklyDue
    : typeof sig.weeklyDue === 'boolean'
      ? sig.weeklyDue
      : sig.daysSinceLastTest == null || (!sig.tests7 && sig.daysSinceLastTest >= 7)
  if (weeklyDue) {
    // İlk test alışmadır (lib/trend.js WEEKLY_PLAN_NOTE); "ilk ölçüm başlangıç noktan olacak" demez
    return { insight: sig.daysSinceLastTest == null ? 'Henüz ölçüm yok. İlk haftalık test alışma sayılır; başlangıç değerin sonraki 3 haftalık testle oluşur.' : 'Haftalık E testinin zamanı geldi.', action: 'Haftalık test' }
  }
  if ((sig.thisWeekDays ?? 0) < (sig.weeklyTarget ?? 3)) {
    return { insight: `Bu hafta ${sig.thisWeekDays ?? 0}/${sig.weeklyTarget ?? 3} gün çalıştın.`, action: 'Hafif set (1 dk)' }
  }
  return { insight: 'Haftalık hedefin tamam, düzenin iyi gidiyor.', action: 'Kırpma egzersizi — ekran yorgunluğuna iyi gelir' }
}

function readCache() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(CACHE_KEY) ?? 'null')
  } catch {
    return null
  }
}
function writeCache(v) {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(v))
  } catch {
    // yoksay
  }
}

// Günde bir kez sunucudan (sinyaller değişince yeniden). Döner { insight, action, source: 'jev'|'rules' }
// profile: yalnız coachLife onayı varsa verilir (CoachCard)
// Sunucu cevabı (ve önbellekteki cevap) günlük test ya da "birkaç gün daha ölç" diyorsa kullanılmaz, kural tabanlı
// öneri gösterilir (coachCore.js STALE_ADVICE): sunucu yeni istemle yeniden yayımlanana dek ve model kuralı
// çiğnediğinde de Nef günlük test önermez (karar 2026-09-29).
export async function getTodayInsight({ tests, sessions, weeklyTarget, profile = null, now = new Date(), fetchImpl = globalThis.fetch } = {}) {
  const signals = buildSignals(tests, sessions, now, weeklyTarget, profile)
  const sig = JSON.stringify(signals)
  const today = dayKey(now)
  const cached = readCache()
  if (cached?.day === today && cached.sig === sig && cached.source === 'jev' && !isStaleAdvice(cached.insight, cached.action)) return cached
  const fallback = { ...fallbackInsight(signals, { weeklyDue: weeklyStatus(tests, now).due }), source: 'rules' }
  if (typeof fetchImpl !== 'function') return fallback
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null
  const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null
  try {
    const r = await fetchImpl(COACH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'today', signals }),
      signal: ctrl?.signal,
    })
    const data = await r.json()
    if (!data?.ok || !data.insight || !data.action || isStaleAdvice(data.insight, data.action)) return fallback
    const out = { insight: data.insight, action: data.action, source: 'jev', day: today, sig }
    writeCache(out)
    return out
  } catch {
    return fallback
  } finally {
    if (timer) clearTimeout(timer)
  }
}
