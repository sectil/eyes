import { describe, it, expect, afterEach } from 'vitest'
import { SILENT_RATE, HORIZON_DAYS, LEAD_MS, dice, walkThreshold, TEXTS, textFor, planNotifications } from './notifyPlan.js'
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
  it('60 sn içindeki an da kurulmaz', () => {
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 30) }), 'mola', TODAY)).toBeUndefined()
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 29, 0) }), 'mola', TODAY)).toBeUndefined()
    expect(logOf(plan({ now: new Date(2026, 8, 27, 12, 28, 59) }), 'mola', TODAY)).toBeDefined()
  })
  it('60 sn içindeki an önceden aynı anla planlandıysa planda kalır (bildirim ve günlük); saat değiştiyse kurulmaz', () => {
    const now = new Date(2026, 8, 27, 12, 29, 30)
    const at = new Date(2026, 8, 27, 12, 30)
    const earlier = plan({ now: new Date(2026, 8, 27, 9, 0) })
    const prev = logOf(earlier, 'mola', TODAY)
    expect(prev.arm).toBe('send') // tohum-1 zarı bugün mola için 'send'
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
  it('saat bugün değiştiyse ve bugünün kaydı zamanı gelmiş duruyorsa ikinci kez kurulmaz (log verilirse)', () => {
    const now = new Date(2026, 8, 27, 14, 0)
    const log = [{ date: TODAY, type: 'mola', eligible: true, arm: 'send', skipReason: null, plannedAt: new Date(2026, 8, 27, 12, 30).toISOString() }]
    const rem = { types: { ...ALL_ON, mola: { on: true, time: '17:30' } } }
    expect(logOf(plan({ now, rem }), 'mola', TODAY)).toBeDefined()
    const p = plan({ now, rem, log })
    expect(logOf(p, 'mola', TODAY)).toBeUndefined()
    expect(p.notifications.some((n) => n.type === 'mola' && n.extra.date === TODAY)).toBe(false)
  })
})

describe('planNotifications: atlama nedenleri', () => {
  it('pencere dışı saat (ayar seçici dışından gelmiş) → window; su 18:00 sonrası → window', () => {
    const p = plan({ rem: { types: { ...ALL_ON, mola: { on: true, time: '08:00' }, water: { on: true, time: '19:00' } } } })
    for (const t of ['mola', 'water']) {
      const list = p.log.filter((e) => e.type === t)
      expect(list.every((e) => e.skipReason === 'window' && !e.eligible && e.arm === null)).toBe(true)
      expect(p.notifications.some((n) => n.type === t)).toBe(false)
    }
  })
  it("gün aşırı: dönem günü tek olan günler 'thin', çift günler uygun", () => {
    const p = plan({ rem: { types: ALL_ON, thin: { mola: 'alt' } } })
    for (const e of p.log.filter((x) => x.type === 'mola')) {
      if (keyDay(e.date) % 2 === 0) expect(e.eligible).toBe(true)
      else expect(e).toMatchObject({ eligible: false, arm: null, skipReason: 'thin' })
    }
    expect(p.log.filter((x) => x.type === 'walk').every((e) => e.skipReason !== 'thin')).toBe(true)
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
  it("bugün yapıldıysa (yalnız gün 0) 'doneBefore': mola/su habit, nefes ≥ 60 sn", () => {
    const now = new Date(2026, 8, 27, 10, 0)
    const habits = [
      { date: TODAY, type: 'mola', at: new Date(2026, 8, 27, 9, 0).toISOString() },
      { date: TODAY, type: 'water', at: new Date(2026, 8, 27, 9, 30).toISOString() },
    ]
    const p = plan({ now, habits })
    expect(logOf(p, 'mola', TODAY).skipReason).toBe('doneBefore')
    expect(logOf(p, 'water', TODAY).skipReason).toBe('doneBefore')
    expect(logOf(p, 'mola', dayKey(addDays(now, 1))).skipReason).toBeNull()
    const short = plan({ now, sessions: [{ type: 'breath', seconds: 59, date: new Date(2026, 8, 27, 9, 0).toISOString() }] })
    expect(logOf(short, 'breath', TODAY).skipReason).toBeNull()
    const full = plan({ now, sessions: [{ type: 'breath', seconds: 60, date: new Date(2026, 8, 27, 9, 0).toISOString() }] })
    expect(logOf(full, 'breath', TODAY).skipReason).toBe('doneBefore')
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

describe('zar ve sessiz gün', () => {
  it('dice [0,1) ve deterministik; oran ≈ SILENT_RATE', () => {
    expect(dice('a', '2026-09-27', 'mola')).toBe(dice('a', '2026-09-27', 'mola'))
    expect(dice('a', '2026-09-27', 'mola')).not.toBe(dice('b', '2026-09-27', 'mola'))
    let silent = 0
    const N = 4000
    for (let i = 0; i < N; i++) {
      const v = dice('tohum', `2026-01-${i}`, NUDGE_TYPES[i % 4])
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      if (v < SILENT_RATE) silent++
    }
    expect(silent / N).toBeGreaterThan(0.22)
    expect(silent / N).toBeLessThan(0.28)
  })
  it('plan yeniden kurulunca (başka saatte, başka girdiyle) aynı günün zarı değişmez', () => {
    const a = plan()
    const b = plan({ now: new Date(2026, 8, 27, 10, 45), habits: [{ date: TODAY, type: 'water', at: new Date(2026, 8, 27, 10, 0).toISOString() }] })
    let compared = 0
    for (const e of b.log) {
      const old = logOf(a, e.type, e.date)
      if (!old.eligible || !e.eligible) continue
      expect(e.arm).toBe(old.arm)
      compared++
    }
    expect(compared).toBeGreaterThan(20)
  })
  it('sessiz gün: bildirim yok ama günlükte var; yerine başka tür gönderilmez; bildirimler tam olarak "send" kayıtları', () => {
    let p = null
    for (let i = 0; i < 50 && !p; i++) {
      const q = plan({ seed: `s${i}` })
      if (q.log.some((e) => e.arm === 'silent')) p = q
    }
    expect(p).not.toBeNull()
    const silent = p.log.filter((e) => e.arm === 'silent')
    for (const e of silent) {
      expect(e.eligible).toBe(true)
      expect(e.skipReason).toBeNull()
      expect(p.notifications.some((n) => n.type === e.type && n.extra.date === e.date)).toBe(false)
    }
    const sends = p.log.filter((e) => e.arm === 'send').map((e) => `${e.date}|${e.type}`).sort()
    expect(nudges(p).map((n) => `${n.extra.date}|${n.type}`).sort()).toEqual(sends)
  })
  it('zar yalnız uygun günde atılır', () => {
    const p = plan({ health: null })
    for (const e of p.log) expect(e.arm === null).toBe(!e.eligible)
  })
})

describe('walkGuards', () => {
  it('yalnız gönderilen yürüyüşler için { id, date, threshold }', () => {
    let seen = { send: false, silent: false }
    for (let i = 0; i < 30; i++) {
      const p = plan({ seed: `g${i}` })
      const walkSend = p.notifications.filter((n) => n.type === 'walk')
      expect(p.walkGuards).toEqual(walkSend.map((n) => ({ id: n.id, date: n.extra.date, threshold: walkThreshold(8000, '15:00') })))
      if (walkSend.length) seen.send = true
      if (p.log.some((e) => e.type === 'walk' && e.arm === 'silent')) seen.silent = true
    }
    expect(seen).toEqual({ send: true, silent: true })
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
