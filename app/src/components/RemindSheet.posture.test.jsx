// Dik Dur aralıklı kip: saat sayfası "Belirli saatlerde · Belli aralıklarla", kaydetme, Bildirimler satırı ve anahtar
// (metin-D1-onay.md §I; lib/postureRemind.js; components/remindUi.js applyRemind)
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const { createRoot } = await import('react-dom/client')
const { default: RemindSheet } = await import('./RemindSheet.jsx')
const { default: Notifications } = await import('../screens/Notifications.jsx')
const { applyRemind } = await import('./remindUi.js')
const { normalizeModuleReminders } = await import('../lib/moduleRemind.js')

const NOW = new Date(2026, 9, 3, 9, 0)
const DD = { module: 'dik-dur', route: 'dik-dur', legacy: null, window: 'move', defaultTime: '11:00', maxTimes: 3, science: ['nair2015'] }

async function mount(el) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(el))
  const all = () => document.body
  const btn = (label) => all().querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${all().textContent}`); await act(async () => b.click()) }
  return { btn, tap, text: () => all().textContent }
}

describe('Dik Dur saat sayfası · aralıklı kip', () => {
  it('iki kip seçici; aralıkta varsayılan iki saatte bir, onaylı satırlar; Kaydet aralığı açar ve saatleri boşaltır', async () => {
    let got = null
    const v = await mount(h(RemindSheet, { moduleId: 'dik-dur', remind: DD, moduleReminders: {}, reminders: { optIn: 'yes', types: {} }, now: NOW, onSave: (x) => { got = x }, onClose: () => {} }))
    expect(v.text()).toContain('Belirli saatlerde')
    expect(v.text()).toContain('Nef seçsin') // saat kipi bugünkü sayfa
    await v.tap('Belli aralıklarla')
    for (const t of ['Saatte bir', 'İki saatte bir', 'Başlangıç', 'Bitiş', 'Günler', 'Uygulamayı 5 gün hiç açmazsan hatırlatmalar durur.']) expect(v.text()).toContain(t)
    expect(v.text()).not.toContain('Nef seçsin')
    expect(v.btn('Pazartesi').getAttribute('aria-pressed')).toBe('true')
    await v.tap('Saatte bir')
    expect(v.text()).toContain('Saatte bir seçince en çok 12 saatlik bir aralık seçebilirsin, örneğin 09.00–21.00.')
    expect(v.text()).toContain('Uygulamayı 2 gün hiç açmazsan hatırlatmalar durur.')
    await v.tap('Pazar')
    await v.tap('Kaydet')
    const c = normalizeModuleReminders(got.moduleReminders)['dik-dur']
    expect(c).toMatchObject({ on: false, times: [], interval: { on: true, every: 60, from: '09:00', to: '19:00', days: [1, 2, 3, 4, 5, 6] } })
  })
  it('kayıtlı aralık açıksa sayfa aralıkla açılır', async () => {
    const mr = { 'dik-dur': { on: false, mode: 'manual', times: [], interval: { on: true, every: 120, from: '10:00', to: '18:00' } } }
    const v = await mount(h(RemindSheet, { moduleId: 'dik-dur', remind: DD, moduleReminders: mr, reminders: { optIn: 'yes', types: {} }, now: NOW, onSave: () => {}, onClose: () => {} }))
    expect(v.text()).toContain('Uygulamayı 5 gün hiç açmazsan hatırlatmalar durur.')
  })
  it('öteki modüllerde kip seçici yok', async () => {
    const v = await mount(h(RemindSheet, { moduleId: 'blink', remind: { ...DD, module: 'blink', route: 'blink' }, moduleReminders: {}, reminders: { optIn: 'yes', types: {} }, now: NOW, onSave: () => {}, onClose: () => {} }))
    expect(v.text()).not.toContain('Belli aralıklarla')
  })
})

describe('Dik Dur · Bildirimler satırı ve anahtar', () => {
  const iv = { on: true, every: 120, from: '09:00', to: '19:00', days: [0, 1, 2, 3, 4, 5, 6] }
  it('satır aralığı söyler; kapatınca aralık kapanır, saatsiz açınca geri gelir; saatle kaydedince aralık düşer', async () => {
    const mr = { 'dik-dur': { on: false, mode: 'manual', times: [], interval: iv } }
    const v = await mount(h(Notifications, { modules: [DD], moduleReminders: mr, reminders: { optIn: 'yes', types: {} }, now: NOW, slots: [] }))
    expect(v.text()).toContain('İki saatte bir · 09.00–19.00')
    expect(v.btn('Dik Dur').getAttribute('aria-checked')).toBe('true')
    const off = applyRemind({ moduleId: 'dik-dur', remind: DD, moduleReminders: mr, reminders: { optIn: 'yes' }, times: [], on: false, now: NOW })
    expect(normalizeModuleReminders(off.moduleReminders)['dik-dur'].interval.on).toBe(false)
    const back = applyRemind({ moduleId: 'dik-dur', remind: DD, moduleReminders: off.moduleReminders, reminders: { optIn: 'yes' }, times: [], on: true, now: NOW })
    expect(normalizeModuleReminders(back.moduleReminders)['dik-dur'].interval).toMatchObject({ on: true, every: 120 })
    const timed = applyRemind({ moduleId: 'dik-dur', remind: DD, moduleReminders: back.moduleReminders, reminders: { optIn: 'yes' }, mode: 'manual', times: ['11:00'], on: true, now: NOW })
    expect(normalizeModuleReminders(timed.moduleReminders)['dik-dur']).toMatchObject({ on: true, times: ['11:00'] })
    expect(normalizeModuleReminders(timed.moduleReminders)['dik-dur'].interval).toBeUndefined()
  })
})
