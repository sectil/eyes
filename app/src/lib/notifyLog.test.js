import { describe, it, expect } from 'vitest'
import {
  NOTIFY_LOG_KEY,
  NOTIFY_SEED_KEY,
  LOG_DAYS,
  READY_DAYS,
  READY_SILENT,
  getSeed,
  loadLog,
  saveLog,
  mergePlanned,
  mergeForPermission,
  markTapped,
  evaluate,
  thinCandidate,
  THIN_AFTER,
} from './notifyLog.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
// Yerel saatle ISO (testler hangi saat diliminde koşarsa koşsun gün anahtarı tutsun)
const iso = (y, mo, d, h = 12, mi = 0, s = 0) => new Date(y, mo - 1, d, h, mi, s).toISOString()
const key = (y, mo, d) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const entry = (date, type, o = {}) => ({ date, type, eligible: true, arm: 'send', skipReason: null, plannedAt: null, tapped: false, ...o })

describe('tohum', () => {
  it('yoksa üretilir ve kaydedilir; sonra hep aynı', () => {
    const st = memStorage()
    const s = getSeed(st)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(5)
    expect(st.getItem(NOTIFY_SEED_KEY)).toBe(s)
    expect(getSeed(st)).toBe(s)
  })
  it('"Tüm verileri sil" anahtarı silince yeni tohum', () => {
    const st = memStorage()
    const a = getSeed(st)
    st.removeItem(NOTIFY_SEED_KEY)
    expect(getSeed(st)).not.toBe(a)
  })
  it('depolama yoksa oturum boyunca aynı tohum', () => {
    const broken = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    const a = getSeed(broken)
    expect(getSeed(broken)).toBe(a)
  })
})

describe('günlük kaydet/yükle', () => {
  it('bozuk kayıt düşer, alanlar tamamlanır, (tarih, tür) başına tek kayıt', () => {
    const st = memStorage()
    saveLog(
      [
        entry('2026-09-26', 'mola', { arm: 'silent' }),
        entry('2026-09-26', 'mola', { arm: 'send', tapped: true }),
        { date: 'dün', type: 'mola' },
        { date: '2026-09-26', type: 'study' },
        { date: '2026-09-25', type: 'walk', eligible: false, arm: 'send', skipReason: 'noData' },
      ],
      st,
    )
    const log = loadLog(st)
    expect(log).toEqual([
      entry('2026-09-25', 'walk', { eligible: false, arm: null, skipReason: 'noData' }),
      entry('2026-09-26', 'mola', { tapped: true }),
    ])
    st.setItem(NOTIFY_LOG_KEY, '{bozuk')
    expect(loadLog(st)).toEqual([])
  })
  it('markTapped yalnız o günün o türünü işaretler', () => {
    const log = [entry('2026-09-26', 'mola'), entry('2026-09-26', 'water'), entry('2026-09-27', 'mola')]
    const out = markTapped(log, '2026-09-26', 'mola')
    expect(out.filter((e) => e.tapped).map((e) => `${e.date}|${e.type}`)).toEqual(['2026-09-26|mola'])
    expect(log[0].tapped).toBe(false)
  })
})

describe('mergePlanned', () => {
  const today = key(2026, 9, 27)
  const now = new Date(2026, 8, 27, 14, 0)
  it('geçmiş günler donar (plan dokunamaz); bugün ve sonrası planla değişir; tapped korunur', () => {
    const log = [
      entry(key(2026, 9, 26), 'mola', { arm: 'silent', plannedAt: iso(2026, 9, 26, 12, 30) }),
      entry(key(2026, 9, 27), 'walk', { plannedAt: iso(2026, 9, 27, 15), tapped: true }),
      entry(key(2026, 9, 28), 'mola', { plannedAt: iso(2026, 9, 28, 12, 30) }),
    ]
    const planned = [
      { date: key(2026, 9, 26), type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: iso(2026, 9, 26, 12, 30) },
      { date: key(2026, 9, 27), type: 'walk', eligible: false, arm: null, skipReason: 'doneBefore', plannedAt: iso(2026, 9, 27, 15) },
      { date: key(2026, 9, 28), type: 'mola', eligible: false, arm: null, skipReason: 'focus', plannedAt: iso(2026, 9, 28, 12, 30) },
    ]
    const out = mergePlanned(log, planned, today, now)
    expect(out.find((e) => e.date === key(2026, 9, 26)).arm).toBe('silent')
    expect(out.find((e) => e.date === today)).toMatchObject({ skipReason: 'doneBefore', eligible: false, tapped: true })
    expect(out.find((e) => e.date === key(2026, 9, 28)).skipReason).toBe('focus')
  })
  // Sahip kararı 2026-10-01 ("yeni saatte kurulsun"): saat bugün değiştiyse gelecekteki yeni an kaydın yerine geçer
  it('bugünün zamanı gelmiş kaydı planda olmasa da kalır; saat sonradan değişince yeni an kaydın yerine geçer', () => {
    const log = [entry(today, 'mola', { plannedAt: iso(2026, 9, 27, 12, 30) })]
    expect(mergePlanned(log, [], today, now)).toHaveLength(1)
    const later = [{ date: today, type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: iso(2026, 9, 27, 15) }]
    const out = mergePlanned(log, later, today, now)
    expect(out).toHaveLength(1)
    expect(out[0].plannedAt).toBe(iso(2026, 9, 27, 15))
  })
  it('tür kapandı: zamanı gelmemiş kayıtlar silinir', () => {
    const log = [entry(today, 'water', { plannedAt: iso(2026, 9, 27, 16) }), entry(key(2026, 9, 29), 'water', { plannedAt: iso(2026, 9, 29, 11) })]
    expect(mergePlanned(log, [], today, now)).toEqual([])
  })
  it(`en çok ${LOG_DAYS} gün tutulur`, () => {
    const old = new Date(2026, 8, 27 - LOG_DAYS)
    const keep = new Date(2026, 8, 27 - LOG_DAYS + 1)
    const k = (d) => key(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const out = mergePlanned([entry(k(old), 'mola'), entry(k(keep), 'mola')], [], today, now)
    expect(out.map((e) => e.date)).toEqual([k(keep)])
  })
})

describe('mergeForPermission (bildirimi kurulamayan gün günlüğe girmez)', () => {
  const today = key(2026, 9, 27)
  const now = new Date(2026, 8, 27, 9, 0)
  const log = [
    entry(key(2026, 9, 26), 'mola', { plannedAt: iso(2026, 9, 26, 12, 30) }),
    entry(today, 'mola', { plannedAt: iso(2026, 9, 27, 12, 30) }),
  ]
  const planned = [
    { date: today, type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: iso(2026, 9, 27, 12, 30) },
    { date: key(2026, 9, 28), type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: iso(2026, 9, 28, 12, 30) },
  ]
  it("izin 'granted' → plan yazılır", () => {
    expect(mergeForPermission(log, planned, 'granted', today, now)).toEqual(mergePlanned(log, planned, today, now))
  })
  it('izne hâlâ bakılıyorsa (null) hiçbir şey yazılmaz', () => {
    expect(mergeForPermission(log, planned, null, today, now)).toBeNull()
    expect(mergeForPermission(log, planned, undefined, today, now)).toBeNull()
  })
  it("'denied' / 'prompt' / 'unsupported' → geçmiş donar, bugünün ve sonrasının zamanı gelmemiş kayıtları düşer", () => {
    for (const perm of ['denied', 'prompt', 'unsupported']) {
      expect(mergeForPermission(log, planned, perm, today, now)).toEqual([log[0]])
    }
  })
  it('izin yokken 30 gün açılış: hiç "hatırlatma günü" birikmez, seyreltme sorusu çıkmaz', () => {
    let l = []
    for (let d = 0; d < 30; d++) {
      const day = new Date(2026, 8, 1 + d, 9, 0)
      const k = key(day.getFullYear(), day.getMonth() + 1, day.getDate())
      const p = [{ date: k, type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: new Date(2026, 8, 1 + d, 12, 30).toISOString() }]
      l = mergeForPermission(l, p, 'denied', k, day)
    }
    expect(l).toEqual([])
    expect(evaluate(l, {}, new Date(2026, 9, 1)).mola.sentDays).toBe(0)
    expect(thinCandidate(l, { optIn: 'yes' }, {}, new Date(2026, 9, 1))).toBeNull()
  })
})

describe('evaluate', () => {
  const now = new Date(2026, 8, 27, 9, 0)
  it('yalnız geçmiş, uygun ve zarı atılmış günler sayılır', () => {
    const log = [
      entry(key(2026, 9, 24), 'mola', { plannedAt: iso(2026, 9, 24, 12, 30) }),
      entry(key(2026, 9, 25), 'mola', { arm: 'silent', plannedAt: iso(2026, 9, 25, 12, 30) }),
      entry(key(2026, 9, 26), 'mola', { eligible: false, arm: null, skipReason: 'focus', plannedAt: iso(2026, 9, 26, 12, 30) }),
      // App yürüyüş iptalini sonradan düzeltti: uygun ve 'send' kaldı ama nedeni var → sayılmaz
      entry(key(2026, 9, 26), 'walk', { skipReason: 'doneBefore', plannedAt: iso(2026, 9, 26, 15) }),
      entry(key(2026, 9, 27), 'mola', { plannedAt: iso(2026, 9, 27, 12, 30) }),
      entry(key(2026, 9, 28), 'mola', { plannedAt: iso(2026, 9, 28, 12, 30) }),
    ]
    const r = evaluate(log, {}, now)
    expect(r.mola).toMatchObject({ firstDate: '2026-09-24', days: 3, sentDays: 1, silentDays: 1, sentDone: 0, silentDone: 0, ready: false })
    expect(r.walk).toMatchObject({ sentDays: 0, silentDays: 0 })
    expect(r.breath).toEqual({ firstDate: null, days: 0, sentDays: 0, silentDays: 0, sentDone: 0, silentDone: 0, ready: false })
  })
  it('mola/su: yalnız plannedAt sonrası kayıt "yapıldı" sayılır', () => {
    const log = [
      entry(key(2026, 9, 24), 'mola', { plannedAt: iso(2026, 9, 24, 12, 30) }),
      entry(key(2026, 9, 25), 'mola', { arm: 'silent', plannedAt: iso(2026, 9, 25, 12, 30) }),
      entry(key(2026, 9, 25), 'water', { plannedAt: iso(2026, 9, 25, 11) }),
    ]
    const habits = [
      { date: key(2026, 9, 24), type: 'mola', at: iso(2026, 9, 24, 12, 10) }, // önce → sayılmaz
      { date: key(2026, 9, 25), type: 'mola', at: iso(2026, 9, 25, 12, 45) },
      { date: key(2026, 9, 25), type: 'mola', at: iso(2026, 9, 25, 11, 30) }, // önce; su kaydı da değil
    ]
    const r = evaluate(log, { habits }, now)
    expect(r.mola).toMatchObject({ sentDone: 0, silentDone: 1 })
    expect(r.water).toMatchObject({ sentDays: 1, sentDone: 0 })
    const r2 = evaluate(log, { habits: [...habits, { date: key(2026, 9, 24), type: 'mola', at: iso(2026, 9, 24, 13) }] }, now)
    expect(r2.mola.sentDone).toBe(1)
  })
  it('nefes: plannedAt sonrası ≥ 60 sn oturum; walk: o günün adımı ≥ ortalama', () => {
    const log = [
      entry(key(2026, 9, 24), 'breath', { plannedAt: iso(2026, 9, 24, 16, 30) }),
      entry(key(2026, 9, 25), 'breath', { plannedAt: iso(2026, 9, 25, 16, 30) }),
      entry(key(2026, 9, 26), 'breath', { arm: 'silent', plannedAt: iso(2026, 9, 26, 16, 30) }),
      entry(key(2026, 9, 24), 'walk', { plannedAt: iso(2026, 9, 24, 15) }),
      entry(key(2026, 9, 25), 'walk', { arm: 'silent', plannedAt: iso(2026, 9, 25, 15) }),
    ]
    const sessions = [
      { type: 'breath', seconds: 60, date: iso(2026, 9, 24, 16, 40) },
      { type: 'breath', seconds: 59, date: iso(2026, 9, 25, 16, 40) }, // kısa
      { type: 'breath', seconds: 180, date: iso(2026, 9, 26, 16, 0) }, // önce
      { type: 'blink', seconds: 300, date: iso(2026, 9, 26, 17, 0) },
    ]
    const healthDays = [
      { date: key(2026, 9, 24), steps: 7000 },
      { date: key(2026, 9, 25), steps: 6999 },
    ]
    const r = evaluate(log, { sessions, healthDays, avgSteps: 7000 }, now)
    expect(r.breath).toMatchObject({ sentDays: 2, sentDone: 1, silentDays: 1, silentDone: 0 })
    expect(r.walk).toMatchObject({ sentDone: 1, silentDone: 0 })
    expect(evaluate(log, { sessions, healthDays, avgSteps: null }, now).walk.sentDone).toBe(0)
  })
  it(`ready: ilk kayıttan bu yana ≥ ${READY_DAYS} gün VE ≥ ${READY_SILENT} sessiz gün`, () => {
    const days = (n, silentEvery) =>
      Array.from({ length: n }, (_, i) => {
        const d = new Date(2026, 8, 27 - n + i)
        return entry(key(d.getFullYear(), d.getMonth() + 1, d.getDate()), 'mola', { arm: i % silentEvery === 0 ? 'silent' : 'send' })
      })
    expect(evaluate(days(21, 4), {}, now).mola).toMatchObject({ days: 21, silentDays: 6, ready: true })
    expect(evaluate(days(20, 4), {}, now).mola).toMatchObject({ days: 20, ready: false })
    expect(evaluate(days(21, 5), {}, now).mola).toMatchObject({ silentDays: 5, ready: true })
    expect(evaluate(days(21, 6), {}, now).mola).toMatchObject({ silentDays: 4, ready: false })
  })
})

describe('thinCandidate (seyreltme sorusu)', () => {
  const now = new Date(2026, 8, 20, 10, 0, 0)
  const rem = (o = {}) => ({ optIn: 'yes', types: { mola: { on: true, time: '12:30' }, water: { on: true, time: '11:00' } }, ...o })
  const sentDays = (type, days, o = {}) => days.map((d) => entry(key(2026, 9, d), type, { plannedAt: iso(2026, 9, d, 12, 30), ...o }))

  it(`son ${THIN_AFTER} hatırlatma gününde ne dokunma ne kayıt → o tür`, () => {
    expect(THIN_AFTER).toBe(3)
    expect(thinCandidate(sentDays('mola', [15, 16, 17]), rem(), {}, now)).toBe('mola')
  })
  it('tek dokunuş ya da bildirimden sonraki tek kayıt yeter; sessiz ve atlanan günler sayılmaz', () => {
    const log = sentDays('mola', [15, 16, 17])
    expect(thinCandidate(markTapped(log, key(2026, 9, 16), 'mola'), rem(), {}, now)).toBe(null)
    const habits = [{ date: key(2026, 9, 17), type: 'mola', at: iso(2026, 9, 17, 14) }]
    expect(thinCandidate(log, rem(), { habits }, now)).toBe(null)
    // bildirimden ÖNCEki kayıt "bildirimden sonra yaptı" sayılmaz
    expect(thinCandidate(log, rem(), { habits: [{ ...habits[0], at: iso(2026, 9, 17, 9) }] }, now)).toBe('mola')
    const mixed = [...sentDays('mola', [15, 16]), entry(key(2026, 9, 17), 'mola', { arm: 'silent', plannedAt: iso(2026, 9, 17, 12, 30) })]
    expect(thinCandidate(mixed, rem(), {}, now)).toBe(null)
  })
  it('bugünün kaydı, sorulmuş ya da seyreltilmiş tür, kapalı tür ve optIn yoksa sorulmaz', () => {
    const log = sentDays('mola', [18, 19, 20])
    expect(thinCandidate(log, rem(), {}, now)).toBe(null) // 20 bugün
    const past = sentDays('mola', [15, 16, 17])
    expect(thinCandidate(past, rem({ thinAsked: { mola: iso(2026, 9, 18) } }), {}, now)).toBe(null)
    expect(thinCandidate(past, rem({ thin: { mola: 'alt' } }), {}, now)).toBe(null)
    expect(thinCandidate(past, rem({ types: { mola: { on: false, time: '12:30' } } }), {}, now)).toBe(null)
    expect(thinCandidate(past, rem({ optIn: null }), {}, now)).toBe(null)
  })
  it('yürüyüşte kayıt: günlük adım ortalamaya ulaştı', () => {
    const r = rem({ types: { walk: { on: true, time: '15:00' } } })
    const log = sentDays('walk', [15, 16, 17])
    const healthDays = [{ date: key(2026, 9, 15), steps: 3000 }, { date: key(2026, 9, 16), steps: 9000 }, { date: key(2026, 9, 17), steps: 2000 }]
    expect(thinCandidate(log, r, { healthDays, avgSteps: 6000 }, now)).toBe(null)
    expect(thinCandidate(log, r, { healthDays: healthDays.map((d) => ({ ...d, steps: 100 })), avgSteps: 6000 }, now)).toBe('walk')
  })
})
