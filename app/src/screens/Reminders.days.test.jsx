// Hatırlatmalar (D5+D6): "Çoğu gün / Gün aşırı" yerine alarm kurulumundaki gün çipleri; saat kısıtı yok; aynı
// saatteki öteki bildirimler yalnız bilgi satırı (Kaydet kapanmaz). Schedule (Çalışma günleri) aynı bilgi satırını
// gösterir, 1 saat aralık engeli yok.
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act, useState } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
const { default: Reminders } = await import('./Reminders.jsx')
const { default: Schedule } = await import('./Schedule.jsx')
const { notifyTimes, nearTimes, NEAR_MIN } = await import('../components/remindUi.js')

let saved
function Harness({ initial, others }) {
  const [r, setR] = useState(initial)
  return h(Reminders, { reminders: r, permission: 'granted', others, onSave: (x) => { saved = x; setR(x) } })
}

async function mount(el) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(el))
  const all = (pred) => document.body.querySelectorAll(pred)
  const btn = (label) => all((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))
  const tap = async (b) => { if (!b) throw new Error(`düğme yok — ${document.body.textContent}`); await act(async () => b.click()) }
  return { all, btn, tap, text: () => document.body.textContent }
}

const REM = { optIn: 'yes', types: { mola: { on: true, time: '12:30' }, walk: { on: false, time: '15:00' } } }

describe('Hatırlatmalar: gün çipleri', () => {
  it('"Çoğu gün", "Gün aşırı" ve "bilerek göndermiyoruz" notu yok; açık türde "Her gün" + 7 gün çipi', async () => {
    saved = null
    const v = await mount(h(Harness, { initial: REM, others: [] }))
    expect(v.text()).not.toMatch(/Çoğu gün|Gün aşırı|bilerek göndermiyoruz/)
    const group = v.all((n) => n.getAttribute?.('role') === 'group' && n.getAttribute('aria-label') === 'Mola günleri')
    expect(group).toHaveLength(1)
    const days = group[0].querySelectorAll((n) => n.getAttribute?.('role') === 'checkbox')
    expect(days.map((d) => d.textContent)).toEqual(['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'])
    expect(days.every((d) => d.getAttribute('aria-checked') === 'true')).toBe(true)
    expect(v.btn('Her gün')[0].getAttribute('aria-pressed')).toBe('true')
    // Kapalı türde çip yok
    expect(v.all((n) => n.getAttribute?.('aria-label') === 'Yürüyüş günleri')).toHaveLength(0)
  })
  it('güne dokununca çıkar/ekler ve kaydeder; son gün çıkarılamaz; "Her gün" hepsini seçer', async () => {
    saved = null
    const v = await mount(h(Harness, { initial: REM, others: [] }))
    await v.tap(v.btn('Pazar')[0])
    expect(saved.types.mola.days).toEqual([1, 2, 3, 4, 5, 6])
    expect(v.btn('Her gün')[0].getAttribute('aria-pressed')).toBe('false')
    for (const d of ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']) await v.tap(v.btn(d)[0])
    expect(saved.types.mola.days).toEqual([6])
    await v.tap(v.btn('Cumartesi')[0])
    expect(saved.types.mola.days).toEqual([6]) // en az bir gün kalır
    await v.tap(v.btn('Çarşamba')[0])
    expect(saved.types.mola.days).toEqual([3, 6])
    await v.tap(v.btn('Her gün')[0])
    expect(saved.types.mola.days).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(saved.types.mola.time).toBe('12:30')
  })
})

describe('Hatırlatmalar: saat kısıtı yok, bilgi satırı', () => {
  it('aynı saatte başka bildirim varsa "Yarım saat içinde N bildirimin daha var"; Kaydet açık kalır; liste o saattekiler', async () => {
    const others = [
      { key: 'mola', time: '12:30', label: 'Mola', days: [0, 1, 2, 3, 4, 5, 6] }, // kendisi: sayılmaz
      { key: 'walk', time: '12:45', label: 'Yürüyüş', days: [1] },
      { key: 'blink', time: '12:10', label: 'Göz kırpma', days: null },
      { key: 'yoga', time: '14:00', label: 'Yoga', days: null }, // 30 dk'dan uzak
    ]
    const v = await mount(h(Harness, { initial: REM, others }))
    await v.tap(v.btn('Mola saatini değiştir. Şu an 12:30')[0])
    expect(v.text()).toContain('Yarım saat içinde 2 bildirimin daha var')
    expect(v.text()).toContain('Bildirimleri göster')
    const items = v.all((n) => n.nodeName === 'LI').map((n) => n.textContent)
    expect(items).toEqual(['12.10 Göz kırpma', '12.45 Yürüyüş'])
    expect(v.btn('Kaydet')[0].getAttribute('disabled')).toBeNull()
    expect(v.text()).not.toMatch(/arasında olmalı|en geç 18|en az 1 saat/)
  })
  it('çakışma yoksa bilgi satırı yok', async () => {
    const v = await mount(h(Harness, { initial: REM, others: [{ key: 'yoga', time: '20:00', label: 'Yoga', days: null }] }))
    await v.tap(v.btn('Mola saatini değiştir. Şu an 12:30')[0])
    expect(v.text()).not.toContain('bildirimin daha var')
  })
})

describe('nearTimes / notifyTimes', () => {
  it(`±${NEAR_MIN} dk (uçlar dahil, gece yarısını aşan da); kendisi ve günü kesişmeyen hariç; saat sırasıyla`, () => {
    const list = [
      { key: 'a', time: '06:05', label: 'A', days: null },
      { key: 'b', time: '06:35', label: 'B', days: [1, 2] },
      { key: 'c', time: '07:06', label: 'C', days: null },
      { key: 'd', time: '00:10', label: 'D', days: null },
      { key: 'self', time: '06:35', label: 'S', days: null },
    ]
    expect(nearTimes('06:35', list, 'self').map((b) => b.key)).toEqual(['a', 'b'])
    expect(nearTimes('06:35', list, 'self', [0, 6]).map((b) => b.key)).toEqual(['a'])
    expect(nearTimes('23:50', list).map((b) => b.key)).toEqual(['d'])
    expect(nearTimes('x', list)).toEqual([])
  })
  it('açık türler (günleriyle), Çalışma günleri ve açık "Bana hatırlat" saatleri; hatırlatmalar kapalıyken boş', () => {
    const reminders = { optIn: 'yes', types: { mola: { on: true, time: '12:30', days: [1, 3] }, walk: { on: false }, study: { on: true } } }
    const study = { days: ['MO', 'SU'], time: '20:00' }
    const moduleReminders = { blink: { on: true, mode: 'manual', times: ['10:00', '16:00'] }, yoga: { on: false, times: ['21:00'] }, mola: { on: true, mode: 'manual', times: ['15:00'] } }
    expect(notifyTimes({ reminders, study, moduleReminders, names: { blink: 'Göz kırpma' } })).toEqual([
      { key: 'mola', time: '12:30', label: 'Mola', days: [1, 3] },
      { key: 'study', time: '20:00', label: 'Çalışma günleri', days: [1, 0] },
      { key: 'blink', time: '10:00', label: 'Göz kırpma', days: null },
      { key: 'blink', time: '16:00', label: 'Göz kırpma', days: null },
      { key: 'mola', time: '15:00', label: 'Mola', days: [1, 3] },
    ])
    expect(notifyTimes({ reminders: { ...reminders, optIn: null }, study, moduleReminders })).toEqual([])
    // Legacy türün ek saati tür kapalıyken kurulmaz (moduleRemind): sayılmaz
    const molaOff = { ...reminders, types: { ...reminders.types, mola: { on: false, time: '12:30' } } }
    expect(notifyTimes({ reminders: molaOff, study, moduleReminders }).map((b) => `${b.key} ${b.time}`)).toEqual(['study 20:00', 'blink 10:00', 'blink 16:00'])
  })
})

describe('Çalışma günleri (Schedule)', () => {
  it('1 saat aralık engeli yok: Kaydet açık; hatırlatma açıksa bilgi satırı', async () => {
    const reminders = { optIn: 'yes', types: { mola: { on: true, time: '20:15' }, study: { on: true } } }
    const others = notifyTimes({ reminders, study: { days: ['MO'], time: '20:00' } })
    const v = await mount(h(Schedule, { initial: { days: ['MO', 'WE', 'FR'], time: '20:00' }, reminders, others, onSave: () => {}, onBack: () => {} }))
    expect(v.btn('Kaydet')[0].getAttribute('disabled')).toBeNull()
    expect(v.text()).toContain('Yarım saat içinde 1 bildirimin daha var')
    expect(v.text()).not.toMatch(/en az 1 saat/)
  })
  it('hatırlatma kapalıysa bilgi satırı yok', async () => {
    const reminders = { optIn: 'yes', types: { mola: { on: true, time: '20:15' }, study: { on: false } } }
    const v = await mount(h(Schedule, { initial: { days: ['MO'], time: '20:00' }, reminders, others: notifyTimes({ reminders }), onSave: () => {}, onBack: () => {} }))
    expect(v.text()).not.toContain('bildirimin daha var')
  })
})
