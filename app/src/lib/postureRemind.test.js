// Dik Dur aralıklı hatırlatma: ayar, dilimler, ufuk, 30 dk, yapıldıysa atla, kimlik ve son cümle (lib/postureRemind.js)
import { describe, it, expect } from 'vitest'
import { normalizeInterval, intervalError, slotsOf, planPosture, POSTURE_ID_FIRST, POSTURE_ID_LAST, TEXT_KEY, LAST_TEXT_KEY, DEFAULT_INTERVAL } from './postureRemind.js'

const NOW = new Date(2026, 9, 3, 8, 0) // cumartesi 08.00
const on = (o = {}) => ({ ...DEFAULT_INTERVAL, on: true, ...o })

describe('aralıklı hatırlatma · ayar', () => {
  it('varsayılan iki saatte bir 09.00–19.00, her gün; bozuk alan varsayılana döner', () => {
    expect(normalizeInterval(null)).toEqual({ on: false, every: 120, from: '09:00', to: '19:00', days: [0, 1, 2, 3, 4, 5, 6] })
    expect(normalizeInterval({ on: true, every: 45, from: 'x', days: [9, 1, 1] })).toEqual({ on: true, every: 120, from: '09:00', to: '19:00', days: [1] })
  })
  it('dilimler başlangıçtan bitişe dahil; 01.00–05.00 düşer', () => {
    expect(slotsOf(on())).toEqual([540, 660, 780, 900, 1020, 1140])
    expect(slotsOf(on({ every: 60, from: '09:00', to: '12:00' }))).toEqual([540, 600, 660, 720])
    expect(slotsOf(on({ every: 120, from: '00:00', to: '07:00' }))).toEqual([0, 360]) // 02.00 ve 04.00 düşer
  })
  it('hata: bitiş başlangıçtan önce; saatte birde 12 saatten uzun', () => {
    expect(intervalError(on({ from: '19:00', to: '09:00' }))).toBe('order')
    expect(intervalError(on({ every: 60, from: '08:00', to: '21:00' }))).toBe('span')
    expect(intervalError(on({ every: 60, from: '09:00', to: '21:00' }))).toBeNull()
    expect(intervalError(on({ every: 120, from: '06:00', to: '23:00' }))).toBeNull()
  })
})

describe('aralıklı hatırlatma · plan', () => {
  it('kapalıyken boş', () => {
    expect(planPosture({ now: NOW, interval: { ...DEFAULT_INTERVAL } }).notifications).toEqual([])
  })
  it("iki saatte bir: 5 gün × 6 dilim = 30 bildirim, 7868'den sırayla; sonuncusu 'burada bitiyor'", () => {
    const p = planPosture({ now: NOW, interval: on(), science: ['nair2015', 'xing2026'] })
    expect(p.notifications).toHaveLength(30)
    expect(p.horizon).toBe(5)
    expect(p.notifications[0]).toMatchObject({ id: POSTURE_ID_FIRST, type: 'remind', module: 'dik-dur', textKey: TEXT_KEY, extra: { kind: 'remind', route: 'dik-dur', date: '2026-10-03', interval: true, evidence: 'nair2015' } })
    expect(p.notifications[0].at).toEqual(new Date(2026, 9, 3, 9, 0))
    expect(p.notifications.at(-1)).toMatchObject({ id: POSTURE_ID_FIRST + 29, textKey: LAST_TEXT_KEY })
    expect(p.notifications.filter((n) => n.textKey === LAST_TEXT_KEY)).toHaveLength(1)
    expect(p.notifications.every((n) => n.id >= POSTURE_ID_FIRST && n.id <= POSTURE_ID_LAST)).toBe(true)
  })
  it('saatte bir: 2 gün; 32 kimliğe sığar', () => {
    const p = planPosture({ now: NOW, interval: on({ every: 60, from: '09:00', to: '21:00' }) })
    expect(p.notifications).toHaveLength(26)
    expect(p.horizon).toBe(2)
  })
  it('geçmiş dilim kurulmaz; günler seçimi', () => {
    const p = planPosture({ now: new Date(2026, 9, 3, 12, 30), interval: on({ days: [1, 2, 3, 4, 5] }) }) // cumartesi, hafta içi seçili
    expect(p.notifications.every((n) => ![0, 6].includes(n.at.getDay()))).toBe(true)
    expect(p.notifications[0].at).toEqual(new Date(2026, 9, 5, 9, 0)) // pazartesi
  })
  it('başka bildirime 30 dk yakın dilim atlanır; az önce yapıldıysa atlanır', () => {
    const taken = [new Date(2026, 9, 3, 11, 20)]
    const sessions = [{ type: 'dik-dur', date: new Date(2026, 9, 3, 12, 40).toISOString() }]
    const p = planPosture({ now: NOW, interval: on(), taken, sessions })
    const today = p.notifications.filter((n) => n.extra.date === '2026-10-03').map((n) => n.at.getHours())
    expect(today).toEqual([9, 15, 17, 19])
    expect(p.skipped).toContainEqual({ module: 'dik-dur', date: '2026-10-03', time: '11:00', reason: 'gap' })
    expect(p.skipped).toContainEqual({ module: 'dik-dur', date: '2026-10-03', time: '13:00', reason: 'doneBefore' })
  })
  it('kalan pay azsa en erkenler kurulur, sonuncusu yine "burada bitiyor"', () => {
    const p = planPosture({ now: NOW, interval: on(), room: 4 })
    expect(p.notifications.map((n) => n.at.getHours())).toEqual([9, 11, 13, 15])
    expect(p.notifications.at(-1).textKey).toBe(LAST_TEXT_KEY)
    expect(p.skipped.filter((s) => s.reason === 'pending')).toHaveLength(26)
  })
})

describe('aralıklı hatırlatma · planAll ve dokunma', async () => {
  const { planAll } = await import('./notifyAll.js')
  const { tapAction } = await import('./notifyTap.js')
  const { registry } = await import('../modules/registry.js')
  const modules = registry.reminders().map((r) => ({ id: r.module, remind: r, doneToday: false }))
  const input = (interval) => ({ now: NOW, modules, reminders: { optIn: 'yes', types: { mola: { on: false } } }, moduleReminders: { 'dik-dur': { on: false, mode: 'manual', times: [], interval } }, texts: true })
  it('açıkken onaylı cümlelerle kurulur; son bildirim DS1; dokununca Dik Dur', () => {
    const p = planAll(input(on()))
    const dd = p.notifications.filter((n) => n.id >= POSTURE_ID_FIRST && n.id <= POSTURE_ID_LAST)
    expect(dd).toHaveLength(30)
    expect(dd.slice(0, -1).every((n) => ['DD1', 'DD2', 'DD3'].includes(n.extra.text))).toBe(true)
    expect(dd.at(-1)).toMatchObject({ title: 'Dik Dur', body: 'Hatırlatmalar burada bitiyor. Sürmesi için uygulamayı bir kez aç.' })
    expect(tapAction({ id: dd[0].id, extra: dd[0].extra }, { routeOk: () => true })).toMatchObject({ kind: 'remind', route: 'dik-dur' })
    expect(p.notifications.length).toBeLessThanOrEqual(58)
  })
  it('aralık kapalıyken Dik Dur bildirimi yok', () => {
    const p = planAll(input({ ...DEFAULT_INTERVAL }))
    expect(p.notifications.some((n) => n.id >= POSTURE_ID_FIRST && n.id <= POSTURE_ID_LAST)).toBe(false)
  })
})
