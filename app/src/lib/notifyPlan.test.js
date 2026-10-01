import { describe, it, expect, afterEach } from 'vitest'
import * as notifyPlan from './notifyPlan.js'
import { HORIZON_DAYS, LEAD_MS, NOW_SHIFT_MS, walkThreshold, TEXTS, textFor, planNotifications } from './notifyPlan.js'
import { TYPE_INDEX, NUDGE_TYPES } from './reminders.js'
import { dayKey, keyDay } from './habitLog.js'

// 2026-09-27 Pazar. Saatler yerel (testler hangi saat diliminde koşarsa koşsun).
const NOW = new Date(2026, 8, 27, 8, 0)
const TODAY = dayKey(NOW)
const ALL_ON = { mola: { on: true, time: '12:30' }, walk: { on: true, time: '15:00' }, breath: { on: true, time: '16:30' }, water: { on: true, time: '11:00' } }
const HEALTH = { todaySteps: 1000, avgSteps: 8000, readAt: new Date(2026, 8, 27, 7, 50).toISOString() }
const input = (o = {}) => ({
  now: NOW,
  reminders: { optIn: 'yes', types: ALL_ON, ...o.rem },
  study: null,
  habits: [],
  sessions: [],
  health: HEALTH,
  focus: null,
  seed: 'tohum-1',
  ...o,
})
const plan = (o) => planNotifications(input(o))
const logOf = (p, type, date) => p.log.find((e) => e.type === type && e.date === date)
const nudges = (p) => p.notifications.filter((n) => n.extra.kind === 'nudge' && n.type !== 'study')
const dayOffset = (key) => keyDay(key) - keyDay(TODAY)
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes())

describe('planNotifications: izin ve ufuk', () => {
  it("optIn 'yes' değilse her şey boş", () => {
    for (const optIn of [null, 'no', undefined]) {
      expect(planNotifications(input({ rem: { optIn } }))).toEqual({ notifications: [], log: [], walkGuards: [] })
    }
    expect(planNotifications({ now: NOW, reminders: null })).toEqual({ notifications: [], log: [], walkGuards: [] })
  })
  it('7 gün sınırı: gün 0..6, her açık türden günde tek kayıt', () => {
    const p = plan()
    expect(p.log).toHaveLength(HORIZON_DAYS * 4)
    const keys = [...p.log, ...p.notifications.map((n) => ({ date: n.extra.date ?? dayKey(n.at), type: n.type }))]
    for (const e of keys) expect(dayOffset(e.date)).toBeGreaterThanOrEqual(0)
    for (const e of keys) expect(dayOffset(e.date)).toBeLessThan(HORIZON_DAYS)
    const seen = new Set(nudges(p).map((n) => `${n.extra.date}|${n.type}`))
    expect(seen.size).toBe(nudges(p).length)
  })
  it('kimlik 7400 + gün×10 + TYPE_INDEX; extra tarih/tür/arm taşır; düzey active', () => {
    for (const n of nudges(plan())) {
      expect(n.id).toBe(7400 + dayOffset(n.extra.date) * 10 + TYPE_INDEX[n.type])
      expect(n.extra).toEqual({ kind: 'nudge', date: dayKey(n.at), type: n.type, arm: 'send' })
      expect(n.level).toBe('active')
    }
  })
})

describe('planNotifications: geçmiş an', () => {
  it('bugünün geçmiş saati kurulmaz, günlüğe de yazılmaz; yarından itibaren var', () => {
    const p = plan({ now: new Date(2026, 8, 27, 13, 0) })
    expect(logOf(p, 'mola', TODAY)).toBeUndefined()
    expect(p.notifications.some((n) => n.type === 'mola' && n.extra.date === TODAY)).toBe(false)
    expect(p.log.filter((e) => e.type === 'mola')).toHaveLength(6)
    expect(logOf(p, 'walk', TODAY)).toBeDefined()
    for (const n of p.notifications) expect(n.at.getTime()).toBeGreaterThan(new Date(2026, 8, 27, 13, 0).getTime() + LEAD_MS)
  })
  // Sahip kararı 2026-10-01: şu anki dakikaya kurulan saat "birkaç saniye sonra gelsin" (NOW_SHIFT_MS); bir kez
  it('şu anki dakikaya kurulan saat 5 sn sonra kurulur; yeniden planda aynı anla kalır; dakika geçince kurulmaz', () => {
    const now = new Date(2026, 8, 27, 12, 30, 20)
    const p = plan({ now })
    const n = p.notifications.find((x) => x.type === 'mola' && x.extra.date === TODAY)
    expect(n.at.getTime()).toBe(now.getTime() + NOW_SHIFT_MS)
    // 3 sn sonra yeniden plan: aynı an planda kalır (bekleyen bildirim iptal edilmez), yeni kaydırma yapılmaz
    const later = new Date(now.getTime() + 3000)
    const q = plan({ now: later, log: p.log })
    expect(q.notifications.find((x) => x.type === 'mola' && x.extra.date === TODAY).at.getTime()).toBe(n.at.getTime())
    // Bildirim gittikten sonra (aynı dakika içinde) yeniden kurulmaz
    const after = new Date(now.getTime() + 10000)
    expect(plan({ now: after, log: p.log }).notifications.some((x) => x.type === 'mola' && x.extra.date === TODAY)).toBe(false)
    // Dakika geçtiyse (12.31) bugün kurulmaz
    expect(plan({ now: new Date(2026, 8, 27, 12, 31, 0) }).notifications.some((x) => x.type === 'mola' && x.extra.date === TODAY)).toBe(false)
  })
  // Pay 15 sn (sahip, 2026-10-01: 1 dk sonrasına kurulan saat de gelsin)
  it('15 sn içindeki an kurulmaz; 1 dk sonrası kurulur', () => {
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 50) }), 'mola', TODAY)).toBeUndefined()
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 45) }), 'mola', TODAY)).toBeUndefined()
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 44) }), 'mola', TODAY)).toBeDefined()
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 0) }), 'mola', TODAY)).toBeDefined()
  })
  it('15 sn içindeki an önceden aynı anla planlandıysa planda kalır (bildirim ve günlük); saat değiştiyse kurulmaz', () => {
    const now = new Date(2026, 8, 27, 12, 29, 50)
    const at = new Date(2026, 8, 27, 12, 30)
    const earlier = plan({ now: new Date(2026, 8, 27, 9, 0) })
    const prev = logOf(earlier, 'mola', TODAY)
    expect(prev.arm).toBe('send') // uygun gün her zaman 'send' (sessiz gün yok)
    const p = plan({ now, log: earlier.log })
    expect(logOf(p, 'mola', TODAY)).toEqual(prev)
    const n = p.notifications.find((x) => x.type === 'mola' && x.extra.date === TODAY)
    expect(n.at.getTime()).toBe(at.getTime())
    expect(n.id).toBe(7400)
    // günlükteki an farklıysa (saat az önce değişti) yakın an yine kurulmaz
    const moved = [{ ...prev, plannedAt: new Date(2026, 8, 27, 12, 45).toISOString() }]
    expect(logOf(plan({ now, log: moved }), 'mola', TODAY)).toBeUndefined()
    // tür kapandıysa korunmaz
    expect(logOf(plan({ now, log: earlier.log, rem: { types: { ...ALL_ON, mola: { on: false, time: '12:30' } } } }), 'mola', TODAY)).toBeUndefined()
  })
  // Sahip kararı 2026-10-01: "yeni saatte kurulsun" — bugün o türden bildirim gitmiş olsa da yeni saat bugün kurulur
  it('saat bugün değiştiyse bugünün kaydı zamanı gelmiş dursa da yeni saatte bugün yine kurulur', () => {
    const now = new Date(2026, 8, 27, 14, 0)
    const log = [{ date: TODAY, type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: new Date(2026, 8, 27, 12, 30).toISOString() }]
    const rem = { types: { ...ALL_ON, mola: { on: true, time: '17:30' } } }
    const p = plan({ now, rem, log })
    expect(logOf(p, 'mola', TODAY).plannedAt).toBe(new Date(2026, 8, 27, 17, 30).toISOString())
    expect(p.notifications.find((n) => n.type === 'mola' && n.extra.date === TODAY).at.getTime()).toBe(new Date(2026, 8, 27, 17, 30).getTime())
  })
})

describe('planNotifications: atlama nedenleri', () => {
  it('saat kısıtı yok (D5+D6): 09.00–21.00 dışı ve su 18.00 sonrası da seçilen saatte kurulur, kaydırılmaz', () => {
    const times = { mola: '06:35', water: '19:00', walk: '23:30', breath: '00:15' }
    const types = Object.fromEntries(Object.entries(times).map(([t, time]) => [t, { on: true, time }]))
    const p = plan({ now: new Date(2026, 8, 27, 0, 5), rem: { types } })
    for (const [t, time] of Object.entries(times)) {
      const list = p.log.filter((e) => e.type === t)
      expect(list).toHaveLength(HORIZON_DAYS)
      expect(list.every((e) => e.eligible && e.arm === 'send' && e.skipReason === null)).toBe(true)
      const sent = p.notifications.filter((n) => n.type === t)
      expect(sent).toHaveLength(HORIZON_DAYS)
      for (const n of sent) expect(`${String(n.at.getHours()).padStart(2, '0')}:${String(n.at.getMinutes()).padStart(2, '0')}`).toBe(time)
    }
    expect(p.log.some((e) => e.skipReason === 'window')).toBe(false)
  })
  it("seçilmeyen gün 'day' diye atlanır; seçilen günlerde gelir (0 = Pazar)", () => {
    // 27 Eylül 2026 Pazar: ufuk Pz, Pt, Sa, Ça, Pe, Cu, Ct
    const p = plan({ rem: { types: { ...ALL_ON, mola: { on: true, time: '12:30', days: [1, 3, 5] } } } })
    const mola = p.log.filter((e) => e.type === 'mola')
    expect(mola).toHaveLength(HORIZON_DAYS)
    for (const e of mola) {
      const wd = new Date(e.plannedAt).getDay()
      if ([1, 3, 5].includes(wd)) expect(e).toMatchObject({ eligible: true, arm: 'send', skipReason: null })
      else expect(e).toMatchObject({ eligible: false, arm: null, skipReason: 'day' })
    }
    expect(p.notifications.filter((n) => n.type === 'mola').map((n) => n.at.getDay())).toEqual([1, 3, 5])
    // Öteki türlerin günleri değişmez
    expect(p.notifications.filter((n) => n.type === 'breath')).toHaveLength(HORIZON_DAYS)
  })
  it("eski 'Gün aşırı' kaydı yok sayılır: her gün gelir", () => {
    const p = plan({ rem: { types: ALL_ON, thin: { mola: 'alt' }, thinAsked: { mola: '2026-09-20T10:00:00.000Z' } } })
    expect(p.log.filter((x) => x.type === 'mola').every((e) => e.eligible && e.skipReason === null)).toBe(true)
    expect(p.notifications.filter((n) => n.type === 'mola')).toHaveLength(HORIZON_DAYS)
  })
  it("çalışma oturumu anı kapsıyorsa 'focus'; oturum bildirimleri 7500+k-1, timeSensitive, günlükte yok", () => {
    const now = new Date(2026, 8, 27, 11, 30)
    const focus = { startedAt: new Date(2026, 8, 27, 11, 0).toISOString(), hours: 2 }
    const p = plan({ now, focus })
    expect(logOf(p, 'mola', TODAY)).toMatchObject({ eligible: false, arm: null, skipReason: 'focus' })
    expect(logOf(p, 'walk', TODAY).skipReason).not.toBe('focus') // 15:00 oturum bittikten sonra
    expect(logOf(p, 'mola', dayKey(addDays(now, 1))).skipReason).toBeNull()
    const f = p.notifications.filter((n) => n.type === 'focus')
    expect(f.map((n) => n.id)).toEqual([7500, 7501])
    expect(f.map((n) => n.at.getTime())).toEqual([new Date(2026, 8, 27, 12, 0).getTime(), new Date(2026, 8, 27, 13, 0).getTime()])
    expect(f.every((n) => n.level === 'timeSensitive')).toBe(true)
    expect(f.map((n) => n.extra)).toEqual([{ kind: 'focus', k: 1 }, { kind: 'focus', k: 2 }])
    expect(p.log.some((e) => e.type === 'focus')).toBe(false)
    // Geçmiş saatler kurulmaz; 4 saatlik oturumda 7500–7503
    const later = plan({ now: new Date(2026, 8, 27, 12, 10), focus })
    expect(later.notifications.filter((n) => n.type === 'focus').map((n) => n.id)).toEqual([7501])
    const four = plan({ now, focus: { ...focus, hours: 4 } })
    expect(four.notifications.filter((n) => n.type === 'focus').map((n) => n.id)).toEqual([7500, 7501, 7502, 7503])
  })
  it('oturumun son molasıyla aynı dakikadaki hatırlatma kurulmaz (bitiş anı dahil; DEVIR §8.3)', () => {
    // 10.30'da 2 saatlik oturum: son mola 12.30'da, mola hatırlatması da 12.30'da
    const focus = { startedAt: new Date(2026, 8, 27, 10, 30).toISOString(), hours: 2 }
    const p = plan({ now: new Date(2026, 8, 27, 10, 35), focus })
    expect(logOf(p, 'mola', TODAY)).toMatchObject({ eligible: false, skipReason: 'focus' })
    expect(p.notifications.filter((n) => n.at.getTime() === new Date(2026, 8, 27, 12, 30).getTime()).map((n) => n.type)).toEqual(['focus'])
  })
  it('Bug 33: çalışma oturumunun gece saatleri kurulmaz (yalnız 09:00–21:00)', () => {
    // Gece yarısı başlatılmış 4 saatlik oturum: 01.00–04.00 "kalk" bildirimi yok
    const night = plan({ now: new Date(2026, 8, 27, 0, 5), focus: { startedAt: new Date(2026, 8, 27, 0, 0).toISOString(), hours: 4 } })
    expect(night.notifications.filter((n) => n.type === 'focus')).toEqual([])
    // Akşam 20.00'de 4 saat: yalnız 21.00 (uç dahil); 22.00–24.00 kurulmaz
    const eve = plan({ now: new Date(2026, 8, 27, 20, 0), focus: { startedAt: new Date(2026, 8, 27, 20, 0).toISOString(), hours: 4 } })
    const f = eve.notifications.filter((n) => n.type === 'focus')
    expect(f.map((n) => n.at.getTime())).toEqual([new Date(2026, 8, 27, 21, 0).getTime()])
    expect(f.map((n) => [n.id, n.extra.k])).toEqual([[7500, 1]])
    // Sabah 07.30'da 4 saat: 08.30 kurulmaz; 09.30, 10.30, 11.30 kimlikleriyle (k = 2..4)
    const morn = plan({ now: new Date(2026, 8, 27, 7, 30), focus: { startedAt: new Date(2026, 8, 27, 7, 30).toISOString(), hours: 4 } })
    expect(morn.notifications.filter((n) => n.type === 'focus').map((n) => [n.id, n.extra.k])).toEqual([[7501, 2], [7502, 3], [7503, 4]])
  })
  // Sahip kararı 2026-10-01: "yine de gelsin" — o gün yapılmış olsa da mola, su ve nefes gelir (yürüyüş adım koşulu kalır)
  it('bugün yapılmış olsa da mola, su ve nefes kurulur (doneBefore yok)', () => {
    const now = new Date(2026, 8, 27, 10, 0)
    const habits = [
      { date: TODAY, type: 'mola', at: new Date(2026, 8, 27, 9, 0).toISOString() },
      { date: TODAY, type: 'water', at: new Date(2026, 8, 27, 9, 30).toISOString() },
    ]
    const p = plan({ now, habits })
    expect(logOf(p, 'mola', TODAY).skipReason).toBeNull()
    expect(logOf(p, 'water', TODAY).skipReason).toBeNull()
    expect(logOf(p, 'mola', dayKey(addDays(now, 1))).skipReason).toBeNull()
    const short = plan({ now, sessions: [{ type: 'breath', seconds: 59, date: new Date(2026, 8, 27, 9, 0).toISOString() }] })
    expect(logOf(short, 'breath', TODAY).skipReason).toBeNull()
    const full = plan({ now, sessions: [{ type: 'breath', seconds: 60, date: new Date(2026, 8, 27, 9, 0).toISOString() }] })
    expect(logOf(full, 'breath', TODAY).skipReason).toBeNull()
    const yesterday = plan({ now, sessions: [{ type: 'breath', seconds: 300, date: new Date(2026, 8, 26, 20, 0).toISOString() }] })
    expect(logOf(yesterday, 'breath', TODAY).skipReason).toBeNull()
  })
  it("yürüyüş: bugünkü adım eşiğe ulaştıysa 'doneBefore' (okuma bugünse); eski okuma sayılmaz", () => {
    const now = new Date(2026, 8, 27, 10, 0)
    const threshold = walkThreshold(8000, '15:00') // 5000
    const at = (steps, readAt = new Date(2026, 8, 27, 9, 55)) => logOf(plan({ now, health: { todaySteps: steps, avgSteps: 8000, readAt: readAt.toISOString() } }), 'walk', TODAY)
    expect(at(threshold).skipReason).toBe('doneBefore')
    expect(at(threshold - 1).skipReason).toBeNull()
    expect(at(9000, new Date(2026, 8, 26, 22, 0)).skipReason).toBeNull()
    expect(logOf(plan({ now, health: { todaySteps: 9000, avgSteps: 8000, readAt: new Date(2026, 8, 27, 9, 55).toISOString() } }), 'walk', dayKey(addDays(now, 1))).skipReason).toBeNull()
  })
  it("yürüyüş: sağlık verisi ya da ortalama yoksa 'noData'; bekçi yok", () => {
    for (const health of [null, { todaySteps: 500, avgSteps: null, readAt: HEALTH.readAt }, { todaySteps: 500, avgSteps: 0, readAt: HEALTH.readAt }]) {
      const p = plan({ health })
      const walk = p.log.filter((e) => e.type === 'walk')
      expect(walk).toHaveLength(HORIZON_DAYS)
      expect(walk.every((e) => e.skipReason === 'noData' && !e.eligible && e.arm === null)).toBe(true)
      expect(p.notifications.some((n) => n.type === 'walk')).toBe(false)
      expect(p.walkGuards).toEqual([])
    }
  })
})

describe('sessiz gün yok (D5+D6)', () => {
  it('zar kalktı: dice ve SILENT_RATE dışa verilmez', () => {
    expect(notifyPlan.dice).toBeUndefined()
    expect(notifyPlan.SILENT_RATE).toBeUndefined()
  })
  it("uygun her gün 'send'; bildirimler tam olarak 'send' kayıtları; tohum sonucu değiştirmez", () => {
    for (const seed of ['tohum-1', 's1', 's2', '']) {
      const p = plan({ seed })
      expect(p.log.some((e) => e.arm === 'silent')).toBe(false)
      for (const e of p.log) expect(e.arm).toBe(e.eligible ? 'send' : null)
      const sends = p.log.filter((e) => e.arm === 'send').map((e) => `${e.date}|${e.type}`).sort()
      expect(nudges(p).map((n) => `${n.extra.date}|${n.type}`).sort()).toEqual(sends)
      expect(p).toEqual(plan({ seed: 'başka' }))
    }
  })
  it('arm yalnız uygun günde', () => {
    const p = plan({ health: null })
    for (const e of p.log) expect(e.arm === null).toBe(!e.eligible)
  })
})

describe('walkGuards', () => {
  it('yalnız gönderilen yürüyüşler için { id, date, threshold }; seçilmeyen günde bekçi yok', () => {
    const p = plan()
    const walkSend = p.notifications.filter((n) => n.type === 'walk')
    expect(walkSend).toHaveLength(HORIZON_DAYS)
    expect(p.walkGuards).toEqual(walkSend.map((n) => ({ id: n.id, date: n.extra.date, threshold: walkThreshold(8000, '15:00') })))
    const some = plan({ rem: { types: { ...ALL_ON, walk: { on: true, time: '15:00', days: [2, 4] } } } })
    const sent = some.notifications.filter((n) => n.type === 'walk')
    expect(sent.map((n) => n.at.getDay())).toEqual([2, 4])
    expect(some.walkGuards.map((g) => g.id)).toEqual(sent.map((n) => n.id))
  })
  it('eşik: ortalama × dakika / 1440', () => {
    expect(walkThreshold(8000, '15:00')).toBe(5000)
    expect(walkThreshold(7001, '12:30')).toBe(Math.round((7001 * 750) / 1440))
    expect(walkThreshold(null, '15:00')).toBeNull()
    expect(walkThreshold(8000, 'x')).toBeNull()
  })
})

describe('Çalışma günleri', () => {
  const study = { days: ['MO', 'WE'], time: '20:00' }
  it('yalnız seçili günlerde, settings.reminder saatinde; günlük ve zar yok', () => {
    const p = plan({ rem: { types: { ...ALL_ON, study: { on: true } } }, study })
    const s = p.notifications.filter((n) => n.type === 'study')
    expect(s.map((n) => dayKey(n.at))).toEqual(['2026-09-28', '2026-09-30'])
    expect(s.map((n) => n.id)).toEqual([7414, 7434])
    expect(s.every((n) => n.at.getHours() === 20 && n.at.getMinutes() === 0 && n.level === 'active')).toBe(true)
    expect(s[0].extra).toEqual({ kind: 'nudge', date: '2026-09-28', type: 'study', arm: null })
    expect(p.log.some((e) => e.type === 'study')).toBe(false)
  })
  it('kapalıysa ya da gün/saat yoksa kurulmaz', () => {
    expect(plan({ study }).notifications.some((n) => n.type === 'study')).toBe(false)
    expect(plan({ rem: { types: { study: { on: true } } }, study: null }).notifications.some((n) => n.type === 'study')).toBe(false)
    expect(plan({ rem: { types: { study: { on: true } } }, study: { days: [], time: '20:00' } }).notifications).toEqual(
      plan({ rem: { types: {} } }).notifications,
    )
  })
})

describe('yaz saati', () => {
  const tz = process.env.TZ
  afterEach(() => {
    if (tz === undefined) delete process.env.TZ
    else process.env.TZ = tz
  })
  for (const [label, start] of [
    ['ekim (saat geri)', [2026, 9, 22]],
    ['mart (saat ileri)', [2026, 2, 26]],
  ]) {
    it(`${label}: her gün yerel 12:30, günler ardışık, kimlikler gün sırasıyla`, () => {
      process.env.TZ = 'Europe/Berlin'
      const now = new Date(start[0], start[1], start[2], 8, 0)
      const end = new Date(start[0], start[1], start[2] + 6, 8, 0)
      expect(now.getTimezoneOffset()).not.toBe(end.getTimezoneOffset()) // geçiş gerçekten ufukta
      const p = planNotifications(input({ now, seed: 'dst' }))
      const mola = p.log.filter((e) => e.type === 'mola')
      expect(mola).toHaveLength(7)
      mola.forEach((e, d) => {
        const at = new Date(e.plannedAt)
        expect([at.getHours(), at.getMinutes()]).toEqual([12, 30])
        expect(e.date).toBe(dayKey(new Date(start[0], start[1], start[2] + d)))
        expect(keyDay(e.date) - keyDay(mola[0].date)).toBe(d)
      })
      for (const n of p.notifications.filter((x) => x.type === 'mola')) {
        expect(n.id).toBe(7400 + (keyDay(n.extra.date) - keyDay(mola[0].date)) * 10)
        expect(dayKey(n.at)).toBe(n.extra.date)
      }
    })
  }
})

describe('metinler', () => {
  const all = (type) => TEXTS[type].flatMap((t) => [t.title, t.body])
  it('her türde 5–6 metin; her türde en az bir öz-yeterlik ifadesi', () => {
    for (const type of ['mola', 'walk', 'breath', 'water', 'study', 'focus']) {
      expect(TEXTS[type].length).toBeGreaterThanOrEqual(5)
      expect(TEXTS[type].length).toBeLessThanOrEqual(6)
      for (const t of TEXTS[type]) {
        expect(typeof t.title).toBe('string')
        expect(t.body.length).toBeGreaterThan(0)
      }
      expect(all(type).some((s) => /yapabilirsin|[iİ]stersen/.test(s))).toBe(true)
    }
  })
  it('yürüyüş metinlerinde rakam yok (kilit ekranı)', () => {
    for (const s of all('walk')) expect(s).not.toMatch(/\d/)
  })
  it('sağlık iddiası ve suçlama yok', () => {
    for (const type of Object.keys(TEXTS)) {
      for (const s of all(type)) {
        expect(s).not.toMatch(/azaltır|düşürür|iyi gelir|iyileştir|tedavi|yorgunluğ|kuruluğ|stres/i)
        expect(s).not.toMatch(/unuttun|yapmadın|hâlâ|yine mi|tembel/i)
      }
    }
  })
  it('seçim: TEXTS[tür][(dönem günü + TYPE_INDEX) % n]', () => {
    for (const n of nudges(plan())) {
      const list = TEXTS[n.type]
      const t = list[(keyDay(n.extra.date) + TYPE_INDEX[n.type]) % list.length]
      expect({ title: n.title, body: n.body }).toEqual(t)
      expect(textFor(n.type, n.extra.date)).toEqual(t)
    }
  })
})
