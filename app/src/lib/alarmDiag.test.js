import { describe, it, expect } from 'vitest'
import { alarmDiag } from './alarmNative.js'

// D4 tanısı (yalnız test derlemesinde Bilgi → "Alarm (tanı)"): uygulamanın kaydı ile AlarmKit'in gerçek alarmları yan yana
describe('alarmDiag', () => {
  const alarm = { on: true, hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6] }
  const log = [{ type: 'set', at: '2026-09-30T19:00:00.000Z', via: 'setup' }]

  it('kayıt, saklanan kimlik ve AlarmKit alarmlarını yazar; saklananı işaretler', async () => {
    const native = { available: true, stored: 'A1', alarms: [{ id: 'A1', state: 'scheduled', schedule: 'relative(...)' }] }
    const t = await alarmDiag({ alarm, log, native, pending: null })
    expect(t).toContain('Kayıt: açık · 06:35 · günler [1,2,3,4,5,6]')
    expect(t).toContain('Saklanan kimlik: A1')
    expect(t).toContain('AlarmKit alarmları: 1')
    expect(t).toContain('· (saklanan) scheduled · relative(...)')
    expect(t).toContain('set (setup)')
  })

  it('bekleyen bildirimleri saate göre sıralar; izni yazar', async () => {
    const pending = { perm: 'granted', list: [{ id: 7402, schedule: { at: '2026-10-01T09:00:00Z' }, title: 'Nefes' }, { id: 7400, schedule: { at: '2026-10-01T08:00:00Z' }, title: 'Mola' }] }
    const t = await alarmDiag({ alarm: null, log: [], native: null, pending })
    expect(t).toContain('Bildirim izni: granted · bekleyen: 2')
    expect(t.indexOf('7400')).toBeLessThan(t.indexOf('7402'))
  })

  it('AlarmKit boşsa sayısı 0; kayıt yoksa "yok"; eklenti yoksa okunamadı', async () => {
    expect(await alarmDiag({ alarm, log: [], native: { available: true, stored: 'A1', alarms: [] }, pending: null })).toContain('AlarmKit alarmları: 0')
    expect(await alarmDiag({ alarm: null, log: [], native: null, pending: null })).toContain('Kayıt: yok')
    expect(await alarmDiag({ alarm: null, log: [], native: null, pending: null })).toContain('AlarmKit: okunamadı')
  })

  it("'set' olaylarında saat ve günler de yazılır (tek seferlik [] ayrılsın); öteki olaylar değişmez", async () => {
    const log2 = [
      { type: 'set', at: '2026-09-29T19:00:00.000Z', via: 'setup', hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6] },
      { type: 'set', at: '2026-09-30T19:00:00.000Z', hour: 9, minute: 5, days: [] },
      { type: 'cancel', at: '2026-09-30T20:00:00.000Z', via: 'home' },
    ]
    const t = await alarmDiag({ alarm, log: log2, native: null, pending: null })
    expect(t).toContain('· 2026-09-29T19:00:00.000Z set (setup) 06:35 · günler [1,2,3,4,5,6]')
    expect(t).toContain('· 2026-09-30T19:00:00.000Z set 09:05 · günler []')
    expect(t).toContain('· 2026-09-30T20:00:00.000Z cancel (home)\n')
  })
})
