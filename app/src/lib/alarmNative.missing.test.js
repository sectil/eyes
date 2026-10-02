import { describe, it, expect, beforeEach } from 'vitest'

// Kayıt ile telefondaki AlarmKit alarmı karşılaştırması (alarm-risk.md Adım 1.2; sahip 2026-10-01):
// kayıt açık + AlarmKit + sırada çalış varken telefonda alarm yoksa "kayıp" ve günlüğe bir kez 'nativeMissing'.
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { nativeMissing, alarmCheck } = await import('./alarmNative.js')
const { ALARM_KEY, ALARM_LOG_KEY, loadAlarmLog, addAlarmEvent } = await import('./alarmLog.js')

const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi)
const NOW = at(2026, 10, 1, 9, 32) // Perşembe
const weekly = { on: true, hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 29, 22).toISOString() }
const gone = { id: 'A1', scheduled: false }
const types = () => loadAlarmLog().map((e) => e.type)

describe('nativeMissing', () => {
  beforeEach(() => mem.clear())

  it('kayıt açık, AlarmKit, telefonda yok: true ve günlüğe bir kez yazılır', async () => {
    mem.set(ALARM_KEY, JSON.stringify(weekly))
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(true)
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'nativeMissing', hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6], setAt: weekly.setAt, id: 'A1' })
    // öne her gelişte yeniden yazılmaz
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(true)
    expect(types()).toEqual(['nativeMissing'])
    // yeniden kurulup yine kaybolursa yeni olay
    addAlarmEvent('set', { hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6] }, NOW)
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(true)
    expect(types()).toEqual(['nativeMissing', 'set', 'nativeMissing'])
  })

  it('telefonda kuruluysa ya da okunamazsa false; günlüğe yazmaz', async () => {
    mem.set(ALARM_KEY, JSON.stringify(weekly))
    expect(await nativeMissing('alarmkit', { now: NOW, current: { id: 'A1', scheduled: true } })).toBe(false)
    expect(await nativeMissing('alarmkit', { now: NOW, current: null })).toBe(false)
    // web ortamında eklenti yanıt vermez: hata yutulur
    expect(await nativeMissing('alarmkit', { now: NOW })).toBe(false)
    expect(mem.has(ALARM_LOG_KEY)).toBe(false)
  })

  it('web ve bildirim yedeği hiç bakılmaz; kayıt kapalı, yok ya da bildirim türündeyse false', async () => {
    mem.set(ALARM_KEY, JSON.stringify(weekly))
    expect(await nativeMissing('web', { now: NOW, current: gone })).toBe(false)
    expect(await nativeMissing('notify', { now: NOW, current: gone })).toBe(false)
    mem.set(ALARM_KEY, JSON.stringify({ ...weekly, on: false }))
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(false)
    mem.set(ALARM_KEY, JSON.stringify({ ...weekly, kind: 'notify' }))
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(false)
    mem.delete(ALARM_KEY)
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(false)
    expect(mem.has(ALARM_LOG_KEY)).toBe(false)
  })

  it('çalmış tek seferlik alarm (iOS siler) kayıp sayılmaz; sıradaki tek seferlik sayılır', async () => {
    const once = { ...weekly, days: [], at: at(2026, 10, 1, 6, 35).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(once))
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(false)
    mem.set(ALARM_KEY, JSON.stringify({ ...once, at: at(2026, 10, 2, 6, 35).toISOString() }))
    expect(await nativeMissing('alarmkit', { now: NOW, current: gone })).toBe(true)
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'nativeMissing', days: [] })
  })

  it('alarmCheck: durum + missing (web\'de hep false)', async () => {
    mem.set(ALARM_KEY, JSON.stringify(weekly))
    expect(await alarmCheck()).toEqual({ platform: 'web', auth: null, missing: false })
  })
})
