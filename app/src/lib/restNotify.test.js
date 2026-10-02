import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// iOS uygulaması gibi: eklenti sahte LocalNotifications (bekleyenleri id → bildirim olarak tutar)
const fake = vi.hoisted(() => {
  const store = new Map()
  const LN = {
    perm: 'granted',
    checkPermissions: vi.fn(async () => ({ display: LN.perm })),
    cancel: vi.fn(async ({ notifications }) => notifications.forEach(({ id }) => store.delete(id))),
    schedule: vi.fn(async ({ notifications }) => notifications.forEach((n) => store.set(n.id, n))),
  }
  return { LN, store }
})
vi.mock('./native.js', () => ({ isIOSApp: () => true }))
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: fake.LN }))

import {
  trialRemindAt,
  trialEndAt,
  scheduleTrialReminder,
  TRIAL_REMIND_DAYS,
  TRIAL_NOTIFY_ID,
  TRIAL_END_NOTIFY_ID,
  REST_NOTIFY_ID,
  TRIAL_END_GAP_MS,
  MANAGE_SUBS_URL,
} from './restNotify.js'

// Saatler yerel (testler hangi saat diliminde koşarsa koşsun)
const D = 86400000
const H = 3600000
const local = (d, h, m = 0) => new Date(2026, 8, d, h, m).getTime()

describe('deneme hatırlatması (7302) gündüze alınır', () => {
  it('gündüz başlayan denemede anı değişmez', () => {
    expect(TRIAL_REMIND_DAYS).toBe(5)
    expect(trialRemindAt(local(1, 14, 30))).toBe(local(1, 14, 30) + 5 * D)
    expect(trialRemindAt(local(1, 9, 0))).toBe(local(1, 9, 0) + 5 * D)
    expect(trialRemindAt(local(1, 21, 0))).toBe(local(1, 21, 0) + 5 * D)
  })
  it('gece geç başlayan deneme aynı gün 20.00, sabah erken başlayan aynı gün 10.00', () => {
    expect(new Date(trialRemindAt(local(1, 23, 40))).getHours()).toBe(20)
    expect(new Date(trialRemindAt(local(1, 23, 40))).getDate()).toBe(new Date(local(1, 23, 40) + 5 * D).getDate())
    expect(new Date(trialRemindAt(local(1, 2, 15))).getHours()).toBe(10)
    expect(new Date(trialRemindAt(local(1, 2, 15))).getDate()).toBe(new Date(local(1, 2, 15) + 5 * D).getDate())
  })
  it('geçersiz başlangıç NaN', () => {
    expect(trialRemindAt(NaN)).toBeNaN()
  })
})

// Deneme bitişi bildirimi (7303): rapor bildiriminden 60 dk sonra; 21.00'i geçerse 60 dk önce (VARSAYIM, sahip kuralı)
describe('deneme bitişi bildirimi (7303) zamanı', () => {
  it('kimlikler ayrı ve çakışmıyor', () => {
    expect(TRIAL_NOTIFY_ID).toBe(7302)
    expect(TRIAL_END_NOTIFY_ID).toBe(7303)
    expect(new Set([REST_NOTIFY_ID, TRIAL_NOTIFY_ID, TRIAL_END_NOTIFY_ID]).size).toBe(3)
    expect(TRIAL_END_GAP_MS).toBe(H)
  })
  it('rapordan 60 dk sonra', () => {
    expect(trialEndAt(local(1, 14, 30))).toBe(local(6, 15, 30))
    expect(trialEndAt(local(1, 9, 0))).toBe(local(6, 10, 0))
    // sabah erken başlayan: rapor 10.00 → deneme 11.00
    expect(trialEndAt(local(1, 2, 15))).toBe(local(6, 11, 0))
    // tam 21.00'e düşen geçmiş sayılmaz: rapor 20.00 (gece başlayan) → deneme 21.00
    expect(trialEndAt(local(1, 23, 40))).toBe(local(6, 21, 0))
    expect(trialEndAt(local(1, 20, 0))).toBe(local(6, 21, 0))
  })
  it("21.00'i geçerse rapordan 60 dk önce; gün değişmez", () => {
    expect(trialEndAt(local(1, 20, 1))).toBe(local(6, 19, 1))
    expect(trialEndAt(local(1, 20, 30))).toBe(local(6, 19, 30))
    expect(trialEndAt(local(1, 21, 0))).toBe(local(6, 20, 0))
    for (const s of [local(1, 20, 30), local(1, 21, 0), local(1, 23, 40), local(1, 2, 15)]) {
      expect(new Date(trialEndAt(s)).getDate()).toBe(new Date(trialRemindAt(s)).getDate())
    }
  })
  it('geçersiz başlangıç NaN', () => {
    expect(trialEndAt(NaN)).toBeNaN()
  })
})

describe('scheduleTrialReminder: iki ayrı bildirim', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(local(1, 12, 0))
    fake.store.clear()
    fake.LN.perm = 'granted'
    for (const f of [fake.LN.checkPermissions, fake.LN.cancel, fake.LN.schedule]) f.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it('sahibin onayladığı metinler, zamanlar; ikisi de önce iptal edilir', async () => {
    const start = local(1, 14, 30)
    expect(await scheduleTrialReminder(start)).toBe(true)
    expect(fake.LN.cancel).toHaveBeenCalledWith({ notifications: [{ id: 7302 }, { id: 7303 }] })
    expect(fake.LN.cancel.mock.invocationCallOrder[0]).toBeLessThan(fake.LN.schedule.mock.invocationCallOrder[0])
    expect(fake.LN.schedule).toHaveBeenCalledTimes(1)
    const [report, end] = fake.LN.schedule.mock.calls[0][0].notifications
    expect(report).toEqual({
      id: 7302,
      title: 'İlk 5 günün raporu hazır',
      body: 'Ne kadar düzenliydin, molalardan sonra nasıl hissettin, bir bak.',
      schedule: { at: new Date(start + 5 * D) },
      interruptionLevel: 'active',
      foreground: false,
    })
    expect(end).toEqual({
      id: 7303,
      title: 'Deneme süren 2 gün sonra bitiyor',
      body: "Bitince ücretli planın başlar. İptal etmek istersen dokun; Apple'ın abonelik sayfası açılır.",
      schedule: { at: new Date(start + 5 * D + H) },
      interruptionLevel: 'active',
      foreground: false,
    })
    expect([...fake.store.keys()].sort()).toEqual([7302, 7303])
  })

  it("rapor 20.30'da: deneme bildirimi 19.30'da", async () => {
    await scheduleTrialReminder(local(1, 20, 30))
    const ns = fake.LN.schedule.mock.calls[0][0].notifications
    expect(ns.map((n) => n.id)).toEqual([7302, 7303])
    expect(ns[0].schedule.at.getTime()).toBe(local(6, 20, 30))
    expect(ns[1].schedule.at.getTime()).toBe(local(6, 19, 30))
  })

  it('tekrar çağrı zararsız: her seferinde ikisi önce iptal edilip yeniden kurulur, çift kalmaz', async () => {
    await scheduleTrialReminder(local(1, 14, 30))
    await scheduleTrialReminder(local(1, 15, 0))
    expect(fake.LN.cancel).toHaveBeenCalledTimes(2)
    expect(fake.LN.cancel.mock.calls[1][0]).toEqual({ notifications: [{ id: 7302 }, { id: 7303 }] })
    expect(fake.store.size).toBe(2)
    expect(fake.store.get(7303).schedule.at.getTime()).toBe(local(6, 16, 0))
  })

  it('izin yoksa ikisi de kurulmaz, iptal de edilmez (eskisi gibi)', async () => {
    for (const perm of ['denied', 'prompt']) {
      fake.LN.perm = perm
      expect(await scheduleTrialReminder(local(1, 14, 30))).toBe(false)
    }
    expect(fake.LN.cancel).not.toHaveBeenCalled()
    expect(fake.LN.schedule).not.toHaveBeenCalled()
  })

  it('rapor anı geçmişse hiçbiri kurulmaz; deneme anı geçmiş ama rapor gelecekteyse yalnız rapor', async () => {
    expect(await scheduleTrialReminder(local(1, 11, 0) - 5 * D)).toBe(false)
    expect(fake.LN.schedule).not.toHaveBeenCalled()
    // rapor 20.30, deneme 19.30; şimdi 20.00
    vi.setSystemTime(local(6, 20, 0))
    expect(await scheduleTrialReminder(local(1, 20, 30))).toBe(true)
    expect(fake.LN.cancel).toHaveBeenCalledWith({ notifications: [{ id: 7302 }, { id: 7303 }] })
    expect(fake.LN.schedule.mock.calls[0][0].notifications.map((n) => n.id)).toEqual([7302])
  })

  it("dokununca açılacak yedek adres Apple'ın abonelik sayfası", () => {
    expect(MANAGE_SUBS_URL).toBe('https://apps.apple.com/account/subscriptions')
  })
})
