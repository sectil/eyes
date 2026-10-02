// Gelişim merkezi eşdeğerlik düzeneği için tohumlu depo üreteci (gelisim-merkezi/PLAN.v1.md §8.4). Yalnız testler kullanır.
// makeStore(rnd) → { now, tests, sessions, profile, habits, health }: bir kişinin cihazındaki kayıtlar.
//  - Geçmiş 0–400 gün (yaklaşık %4 depo tamamen boş); kişi başına yoğunluk (seyrekten her güne) ve 0–3 ara (3–60 gün).
//  - Her modülden kayıt (registry'deki her kayıtlı modül: nefes, Dalga, Gökyüzü, Yön, Hızlı Bakış, Tek Bakışta, Fark
//    Ettin mi?, Bugünün görevi, eski nefes sayma, göz kırp, egzersiz seti, Yılan, Çemberler, yoga dersleri, WHO-5) ve
//    görme testleri (haftalık: aynı dakikalarda 3 göz kaydı; kısa test: 2 göz; okuma testi v1/v2; kamerasız, eski
//    yöntem, yeni gözlük kayıtları); aynı gün çok tur; tanınmayan ve bozuk kayıtlar (null, dize, geçersiz tarih).
//  - Alışkanlık: mola, su (gün içinde birden çok) ve alarm günleri (lib/alarmLog.js alarmHabits biçimi).
//  - Profil: yok / iris başlangıcı / başlangıç + 28. gün (lib/profile.js normalizeSnap alanları); bazen ilk kayıttan önce.
//  - Sağlık: yok / izin yok (hep 0) / son 60 günün adımları; App.jsx'teki biçimle (summarizeHealth + stepRows).
// Saat dilimi çağıranda (Europe/Berlin: yaz saati geçiş günleri gerçekten geçiş olsun). Bütün tarihler yerel saatle kurulur.
import { summarizeHealth } from '../src/lib/health.js'

export { mulberry32 } from './notifyCtx.js'

const pad = (n) => String(n).padStart(2, '0')
const dayKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// "Şimdi" adayları: sıradan günler, Berlin yaz saati geçiş günleri ve arifeleri (29 Mart, 25 Ekim 2026), ay ve yıl sonu
const NOW_DAYS = [
  [2026, 8, 28], [2026, 8, 30], [2026, 9, 1], [2026, 9, 4],
  [2026, 9, 25], [2026, 9, 26], [2026, 2, 29], [2026, 2, 30],
  [2026, 10, 30], [2026, 11, 31], [2027, 0, 1], [2026, 5, 15],
]

const DALGA_MODES = ['sakin', 'guc', 'motive']
const YOGA_LESSONS = [1, 2, 3, 5]
const ROUTINE_IDS = ['lite', 'normal', 'full', 'deep', 'isinma', 'uzak', 'daire']
const CORRECTIONS = ['none', 'none', 'none', 'reading', 'distance', 'contacts']

// Modül kaydı üreticileri. w: kişinin bu modülü seçme ağırlığı (makeStore'da kişiye göre açılıp kapanır).
const MAKERS = {
  breath: (r, date) => ({ type: 'breath', date, seconds: r.int(30, 600), ...(r.chance(0.85) ? { calmBefore: r.int(1, 5), calmAfter: r.int(1, 5) } : {}) }),
  dalga: (r, date) => ({ type: 'dalga', date, mode: r.pick(DALGA_MODES), seconds: r.int(60, 900), ...(r.chance(0.8) ? { before: r.int(0, 10), after: r.int(0, 10) } : {}) }),
  gokyuzu: (r, date) => ({ type: 'gokyuzu', date, seconds: r.int(60, 400), ...(r.chance(0.8) ? { before: r.int(0, 10), after: r.int(0, 10) } : {}) }),
  yon: (r, date) => (r.chance(0.5)
    ? { type: 'yon', date, tool: 'ayna', score: r.int(1, 5), seconds: r.int(60, 300) }
    : { type: 'yon', date, tool: 'uzak', before: r.int(0, 10), after: r.int(0, 10), seconds: r.int(60, 300) }),
  quickLook: (r, date, k) => ({ type: 'quick-look', date, threshold: Math.max(17, Math.round(k.ql + r.int(-40, 40))), seconds: r.int(60, 300) }),
  span: (r, date, k) => ({ type: 'span', date, span: Math.max(2, Math.round((k.span + (r.next() - 0.5) * 1.6) * 10) / 10), seconds: r.int(60, 240) }),
  street: (r, date) => {
    const asked = r.int(0, 6)
    return { type: 'street', date, asked, noticed: r.int(0, asked), seconds: r.int(30, 200) }
  },
  notice: (r, date) => ({ type: 'notice', date, count: r.int(0, 12) }),
  breathCount: (r, date) => ({ type: 'breath-count', date, accuracy: r.int(0, 100), seconds: r.int(60, 300) }),
  blink: (r, date) => ({ type: 'blink', date, seconds: r.int(20, 150), ...(r.chance(0.5) ? { detectedClosures: r.int(0, 40) } : {}) }),
  routine: (r, date) => ({ type: 'routine', date, setId: r.pick(ROUTINE_IDS), seconds: r.int(30, 600), steps: r.int(1, 6) }),
  snake: (r, date) => ({ type: 'game', game: 'snake', date, score: r.int(0, 80), seconds: r.int(20, 300) }),
  track: (r, date) => ({ type: 'game', game: 'track', date, score: r.int(0, 50), seconds: r.int(20, 300), ...(r.chance(0.4) ? { control: 'eyes', arriveMs: r.int(300, 3000) } : {}) }),
  yoga: (r, date) => {
    const lesson = r.pick(YOGA_LESSONS)
    const done = r.chance(0.7)
    const rated = lesson !== 3 && r.chance(0.85)
    return {
      type: 'yoga', date, lesson, planned: 900, seconds: done ? 900 : r.int(30, 800), completed: done, reachedClosing: done || r.chance(0.2),
      ...(rated ? { before: r.int(0, 10), after: r.int(0, 10) } : {}),
      ...(lesson === 3 && r.chance(0.6) ? { sleepEase: r.int(0, 10) } : {}),
    }
  },
}
const MAKER_KEYS = Object.keys(MAKERS)

function rng(rnd) {
  return {
    next: rnd,
    int: (a, b) => a + Math.floor(rnd() * (b - a + 1)),
    pick: (list) => list[Math.floor(rnd() * list.length)],
    chance: (p) => rnd() < p,
  }
}

// Görme testi oturumu: haftalık (R, L, OU; dakikalar içinde), kısa (R, L) ya da okuma testi
function vaSession(r, base, kind, k) {
  const out = []
  if (kind === 'reading') {
    const v2 = r.chance(0.7)
    out.push({ type: 'reading', date: base.toISOString(), ...(v2 ? { protocol: 2 } : {}), maxReadingSpeed: r.int(80, 260), criticalPrintSize: Math.round((0.1 + r.next() * 0.6) * 100) / 100, seconds: r.int(60, 300) })
    return out
  }
  const eyes = kind === 'va-weekly' ? ['R', 'L', 'OU'] : ['R', 'L']
  let t = base.getTime()
  const tracked = !r.chance(k.untrackedRate)
  const algorithm = r.chance(k.oldAlgoRate) ? r.pick(['descent-zest-v3', undefined]) : 'descent-zest-v4'
  const newBaseline = r.chance(0.02)
  for (const eye of eyes) {
    if (r.chance(0.05)) continue // bir göz atlanmış (yarıda bırakılan test)
    const drift = k.vaDrift * (k.dayIdx / 100)
    out.push({
      type: kind, eye, date: new Date(t).toISOString(),
      logMAR: Math.round((k.va + drift + (r.next() - 0.5) * 0.12) * 100) / 100,
      correction: k.correction, ...(algorithm ? { algorithm } : {}),
      distanceTracked: tracked, ...(tracked && r.chance(0.8) ? { meanDistanceMm: r.int(300, 700) } : {}),
      // kamera test ortasında durdu (Ö-11): kamerasız kayıtların yarısı; rastgele sayı tüketmez (öbür değerler aynı kalır)
      ...(!tracked && k.dayIdx % 2 === 0 ? { camFailedMidTest: true } : {}),
      ...(r.chance(0.6) ? { seconds: r.int(60, 200) } : {}), ...(r.chance(0.3) ? { trials: r.int(10, 40) } : {}),
      ...(newBaseline ? { newBaseline: true } : {}),
    })
    t += r.int(60, 200) * 1000
  }
  return out
}

export function makeStore(rnd) {
  const r = rng(rnd)
  const [y, mo, d] = r.pick(NOW_DAYS)
  const now = new Date(y, mo, d, r.int(0, 23), r.int(0, 59), r.int(0, 59))
  const empty = r.chance(0.04)
  const span = empty ? 0 : r.chance(0.15) ? r.int(0, 10) : r.int(0, 400) // yeni kullanıcı (ilk günler) ayrıca sık
  const density = r.pick([0.05, 0.15, 0.3, 0.5, 0.8, 1])
  // Aralar: [başlangıç günü geri sayımı, uzunluk]
  const gaps = Array.from({ length: r.int(0, 3) }, () => [r.int(0, span), r.int(3, 60)])
  const inGap = (back) => gaps.some(([s, len]) => back <= s && back > s - len)
  // Kişinin kullandığı modüller (her depo her modülü kullanmaz; ortalama yarısı)
  const weights = Object.fromEntries(MAKER_KEYS.map((key) => [key, r.chance(0.5) ? 1 + r.int(0, 3) : 0]))
  const wsum = Object.values(weights).reduce((a, b) => a + b, 0)
  const pickModule = () => {
    let x = r.next() * wsum
    for (const key of MAKER_KEYS) if ((x -= weights[key]) < 0) return key
    return MAKER_KEYS.at(-1)
  }
  const k = {
    ql: r.int(60, 250), span: 3 + r.next() * 4, va: -0.1 + r.next() * 0.6, vaDrift: (r.next() - 0.5) * 0.4,
    correction: r.pick(CORRECTIONS), untrackedRate: r.pick([0, 0.05, 0.3]), oldAlgoRate: r.pick([0, 0, 0.1, 0.5]), dayIdx: 0,
  }
  const testKinds = { weekly: r.chance(0.6), daily: r.chance(0.35), reading: r.chance(0.3) }
  const who5 = r.chance(0.4)
  const habitTypes = ['mola', 'water', 'alarm'].filter(() => r.chance(0.4))

  const sessions = []
  const tests = []
  const habits = []
  const at = (back, minute) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - back, Math.floor(minute / 60), minute % 60, r.int(0, 59))
  let lastWho5 = Infinity
  for (let back = span; back >= 0 && !empty; back--) {
    k.dayIdx = span - back
    if (inGap(back)) continue
    // bugünün kayıtları "şimdi"den önce (gelecek tarihli kayıt ayrıca, seyrek)
    const maxMin = back === 0 ? now.getHours() * 60 + now.getMinutes() : 1439
    const minute = () => r.int(0, Math.max(0, maxMin))
    if (r.chance(density) && wsum > 0) {
      const n = r.chance(0.15) ? r.int(3, 8) : r.int(1, 3) // aynı gün çok tur
      const sameModule = r.chance(0.3) ? pickModule() : null
      for (let i = 0; i < n; i++) {
        const key = sameModule ?? pickModule()
        sessions.push(MAKERS[key](r, at(back, minute()).toISOString(), k))
      }
    }
    if (testKinds.weekly && (back % 7 === 0 ? r.chance(0.8) : r.chance(0.03))) tests.push(...vaSession(r, at(back, minute()), 'va-weekly', k))
    if (testKinds.daily && r.chance(density * 0.5)) tests.push(...vaSession(r, at(back, minute()), 'va-daily', k))
    if (testKinds.reading && r.chance(0.08)) tests.push(...vaSession(r, at(back, minute()), 'reading', k))
    if (who5 && lastWho5 - back >= 14 && r.chance(0.6)) {
      lastWho5 = back
      sessions.push({ type: 'who5', date: at(back, minute()).toISOString(), score: r.int(0, 25) * 4, answers: Array.from({ length: 5 }, () => r.int(0, 5)) })
    }
    for (const type of habitTypes) {
      if (!r.chance(density * 0.6)) continue
      const times = type === 'alarm' ? 1 : r.int(1, 4) // alarm günü bir kez (alarmHabits), mola/su gün içinde çok
      for (let i = 0; i < times; i++) {
        const t = at(back, minute())
        habits.push({ date: dayKeyOf(t), type, at: t.toISOString() })
      }
    }
  }
  if (!empty) {
    // Tanınmayan ve bozuk kayıtlar (merkez düşürmeli, ikisi de aynı biçimde)
    if (r.chance(0.1)) sessions.push({ type: 'mystery', date: at(r.int(0, span), 600).toISOString() })
    if (r.chance(0.05)) sessions.push(null, 'bozuk', { type: 'breath', date: 'geçersiz', seconds: 60 })
    if (r.chance(0.05)) tests.push(null, { type: 'va-weekly', eye: 'R', date: 'yok', logMAR: 0.1 })
    if (r.chance(0.05)) habits.push({ type: 'mola' }, null, { date: '2026-01-01', type: 'bilinmeyen', at: now.toISOString() })
    // Sıra: depoda çoğunlukla eskiden yeniye; bazen (updateSession, içe aktarma) karışık
    if (r.chance(0.1) && sessions.length > 2) sessions.splice(r.int(0, sessions.length - 1), 0, sessions.pop())
    // Gelecek tarihli kayıt (saat değişimi, saat dilimi): seyrek
    if (r.chance(0.03)) sessions.push({ type: 'breath', date: new Date(now.getTime() + r.int(1, 48) * 3600000).toISOString(), seconds: 60 })
  }

  // Profil: iris başlangıcı (bazen ilk kayıttan önce, bazen sonra) ve 28. gün
  let profile = null
  const pk = r.next()
  if (pk > 0.35) {
    const snap = (back) => ({
      date: at(Math.max(0, back), r.int(480, 1200)).toISOString(),
      ...(r.chance(0.9) ? { blinks: r.int(0, 60) } : {}),
      ...(r.chance(0.9) ? { stressNow: r.int(0, 4) } : {}),
      ...(r.chance(0.9) ? { sleep: r.int(0, 10) } : {}),
      ...(r.chance(0.9) ? { activityDays: r.int(0, 7) } : {}),
      ...(r.chance(0.9) ? { selfCompassion: r.int(0, 4) } : {}),
    })
    const startBack = span + (r.chance(0.2) ? r.int(1, 30) : -r.int(0, Math.min(5, span)))
    const baseline = snap(startBack)
    const recheck = pk > 0.7 && startBack >= 28 ? snap(startBack - 28 - r.int(0, 10)) : null
    profile = { iris: { baseline, recheck }, ...(r.chance(0.5) ? { firstLook: { blinks: r.int(0, 60), seconds: 20, method: r.pick(['truedepth', 'camera', 'self']), date: baseline.date } } : {}) }
  } else if (pk > 0.3) {
    profile = { iris: { baseline: null, recheck: null } } // eski kurulum: iris yok
  }

  // Sağlık (App.jsx: { ...summarizeHealth(son 7 gün), stepRows: summarizeHealth(60 gün).rows, recentSteps, at })
  let health = null
  const hk = r.next()
  if (hk > 0.4) {
    const zero = hk < 0.5 // izin yok: iOS hep 0 döndürür
    const median = r.int(1500, 12000)
    const days = Array.from({ length: 60 }, (_, i) => {
      const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59 + i, 12)
      const steps = zero || (r.chance(0.1)) ? 0 : Math.max(0, Math.round(median * (0.3 + r.next() * 1.4)))
      return { date: dayKeyOf(t), steps, distanceM: Math.round(steps * 0.75), exerciseMin: r.int(0, 60) * (steps > 0 ? 1 : 0) }
    })
    health = { ...summarizeHealth(days.slice(-7)), stepRows: summarizeHealth(days).rows, recentSteps: r.int(0, 800), at: now.toISOString() }
  }

  return { now, tests, sessions, profile, habits, health }
}
