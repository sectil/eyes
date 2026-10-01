import { describe, it, expect } from 'vitest'
import { alarmDiag } from './alarmNative.js'

// D4 tanısı (yalnız test derlemesinde Bilgi → "Alarm (tanı)"): uygulamanın kaydı ile AlarmKit'in gerçek alarmları yan yana
describe('alarmDiag', () => {
  const alarm = { on: true, hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6] }
  const log = [{ type: 'set', at: '2026-09-30T19:00:00.000Z', via: 'setup' }]

  it('kayıt, saklanan kimlik ve AlarmKit alarmlarını yazar; saklananı işaretler', async () => {
    const native = { available: true, stored: 'A1', alarms: [{ id: 'A1', state: 'scheduled', schedule: 'relative(...)' }] }
    const t = await alarmDiag({ alarm, log, native })
    expect(t).toContain('Kayıt: açık · 06:35 · günler [1,2,3,4,5,6]')
    expect(t).toContain('Saklanan kimlik: A1')
    expect(t).toContain('AlarmKit alarmları: 1')
    expect(t).toContain('· (saklanan) scheduled · relative(...)')
    expect(t).toContain('set (setup)')
  })

  it('AlarmKit boşsa sayısı 0; kayıt yoksa "yok"; eklenti yoksa okunamadı', async () => {
    expect(await alarmDiag({ alarm, log: [], native: { available: true, stored: 'A1', alarms: [] } })).toContain('AlarmKit alarmları: 0')
    expect(await alarmDiag({ alarm: null, log: [], native: null })).toContain('Kayıt: yok')
    expect(await alarmDiag({ alarm: null, log: [], native: null })).toContain('AlarmKit: okunamadı')
  })
})
