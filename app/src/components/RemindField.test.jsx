// "Bana hatırlat" satırı, saat sayfası, Bildirimler ve Gece sessizliği (bildirim PLAN.v1 §3.A.2, §A.4, §A.5; K2).
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
const { default: RemindField } = await import('./RemindField.jsx')
const { default: RemindSheet } = await import('./RemindSheet.jsx')
const { applyRemind, checkTimes, locTime, listTimes } = await import('./remindUi.js')
const { default: QuietHours, quietClashes } = await import('../screens/QuietHours.jsx')
const { default: Notifications } = await import('../screens/Notifications.jsx')

const NOW = new Date(2026, 9, 1, 9, 0)
const BLINK = { module: 'blink', route: 'blink', legacy: null, window: 'move', maxTimes: 3, science: ['kim2020'] }
const YOGA = { module: 'yoga', route: 'yoga', legacy: null, window: 'calm', maxTimes: 3, science: ['luu2024'] }
const rem = (patch = {}) => ({ optIn: null, types: { mola: { on: true, time: '12:30' } }, ...patch })

async function mount(el) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(el))
  const all = () => document.body
  const btn = (label) => all().querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${all().textContent}`); await act(async () => b.click()) }
  return { btn, tap, text: () => all().textContent, rerender: (e) => act(async () => root.render(e)) }
}

describe('RemindField', () => {
  it('kapalıyken "Bana hatırlat", alt yazı ve Nef\'in önerdiği saat (veri yok: 16.30)', async () => {
    const v = await mount(h(RemindField, { moduleId: 'blink', remind: BLINK, settings: {}, now: NOW }))
    expect(v.text()).toContain('Bana hatırlat')
    expect(v.text()).toContain('Her gün, senin için uygun saatte. Saati Nef de seçebilir.')
    expect(v.text()).toContain('16.30')
  })

  it('yol içinde kart çıkmaz', async () => {
    const v = await mount(h(RemindField, { moduleId: 'blink', remind: BLINK, settings: {}, inPath: true, now: NOW }))
    expect(v.text()).toBe('')
  })

  it('açıkken "Hatırlatman açık · Her gün 16.30 · saati Nef seçti"', async () => {
    const settings = { moduleReminders: { blink: { on: true, mode: 'auto', times: ['16:30'] } } }
    const v = await mount(h(RemindField, { moduleId: 'blink', remind: BLINK, settings, now: NOW }))
    expect(v.text()).toContain('Hatırlatman açık · Her gün 16.30 · saati Nef seçti')
  })

  it('optIn null iken "Sen karar ver" → modül açılır, optIn yes, mola kapanır', async () => {
    let got = null
    const v = await mount(h(RemindField, { moduleId: 'blink', remind: BLINK, settings: { reminders: rem() }, now: NOW, onChange: (n) => { got = n } }))
    // satıra dokun (satır düğmesinin metni birleşik)
    const row = document.body.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.startsWith('Bana hatırlat'))[0]
    await act(async () => row.click())
    expect(v.text()).toContain('Sen karar ver')
    expect(v.text()).toContain('Önerilen')
    expect(v.text()).toContain('Henüz saatini bilmiyorum. 16.30\'la başlayalım; beş kez yaptıktan sonra senin saatine göre ayarlarım.')
    await v.tap('Hatırlatmayı aç')
    expect(got.moduleReminders.blink).toMatchObject({ on: true, mode: 'auto', times: ['16:30'] })
    expect(got.reminders.optIn).toBe('yes')
    expect(got.reminders.types.mola.on).toBe(false)
  })
})

describe('RemindSheet', () => {
  it('onaylı metni olmayan başlık ve neden ekrana ham yer tutucu yazmaz (yoga verili, mola 12.30 varsayılan)', async () => {
    const recs = Array.from({ length: 8 }, (_, i) => ({ date: new Date(2026, 8, 30 - i, 10, 0).toISOString(), seconds: 300 }))
    const y = await mount(h(RemindSheet, { moduleId: 'yoga', remind: YOGA, reminders: rem({ optIn: 'yes' }), records: recs, now: NOW }))
    expect(y.text()).not.toMatch(/YER TUTUCU|\[/)
    expect(document.body.querySelectorAll((n) => n.nodeName === 'H2')[0].textContent).toBe('Yoga')
    const m = await mount(h(RemindSheet, { moduleId: 'mola', remind: { module: 'mola', legacy: 'mola', window: 'move', defaultTime: '12:30' }, reminders: rem({ optIn: 'yes' }), now: NOW }))
    expect(m.text()).not.toMatch(/YER TUTUCU|\[/)
    expect(m.text()).toContain('Mola')
  })

  it('izin sorulmamışsa önce bizim cümlemiz, ikinci dokunuşta kaydeder ve izin ister', async () => {
    let saved = 0
    let asked = 0
    const v = await mount(h(RemindSheet, { moduleId: 'blink', remind: BLINK, reminders: rem({ optIn: 'yes' }), permission: 'prompt', now: NOW, onSave: () => saved++, onAskPermission: () => asked++ }))
    await v.tap('Hatırlatmayı aç')
    expect(v.text()).toContain('Hatırlatmayı sana bildirimle göndereceğim; bir sonraki pencerede izin istenecek.')
    expect(saved).toBe(0)
    await v.tap('Hatırlatmayı aç')
    expect(saved).toBe(1)
    expect(asked).toBe(1)
  })

  it('elle: pencere cümlesi türüne göre, "Bir saat daha" en çok 3 saat', async () => {
    const v = await mount(h(RemindSheet, { moduleId: 'yoga', remind: YOGA, reminders: rem({ optIn: 'yes' }), now: NOW }))
    await v.tap('Saatleri ben seçeyim')
    expect(v.text()).toContain('08.00–22.00 arasında, günde en çok 3 saat.')
    await v.tap('Bir saat daha')
    await v.tap('Bir saat daha')
    expect(v.btn('Bir saat daha')).toBeUndefined()
  })

  it('çakışma: "12.30\'da Mola var." ve bir saat sonrası önerisi; hata varken Kaydet kapalı', async () => {
    const busy = [{ time: '12:30', label: 'Mola' }]
    const c = checkTimes(['12:00'], BLINK, busy)[0]
    expect(c).toMatchObject({ error: 'gap', suggest: '13:30' })
    expect(checkTimes(['08:00'], BLINK, busy)[0].error).toBe('window')
    expect(checkTimes(['10:00', '10:30'], BLINK)[1].error).toBe('gap') // kendi saatleri arasında da 60 dk
    expect(locTime('12:30')).toBe("12.30'da")
    expect(locTime('09:15')).toBe("09.15'te")
    expect(locTime('13:40')).toBe("13.40'ta")
    expect(locTime('10:00')).toBe("10.00'da")
    expect(listTimes(['10:00', '13:30', '18:00'])).toBe('10.00, 13.30 ve 18.00')
  })

  it('applyRemind: legacy türde ilk saat settings.reminders\'ta, ek saatler moduleReminders\'ta', () => {
    const out = applyRemind({ moduleId: 'breath', remind: { legacy: 'breath' }, reminders: rem(), mode: 'manual', times: ['18:00', '09:30'], now: NOW })
    expect(out.reminders.types.breath).toMatchObject({ on: true, time: '09:30' })
    expect(out.reminders.types.mola.on).toBe(false)
    expect(out.moduleReminders.breath).toMatchObject({ on: true, mode: 'manual', times: ['18:00'] })
  })

  it('applyRemind: optIn zaten yes ise settings.reminders değişmez (null)', () => {
    const out = applyRemind({ moduleId: 'blink', remind: BLINK, reminders: rem({ optIn: 'yes' }), times: ['10:00'], now: NOW })
    expect(out.reminders).toBeNull()
  })

  it('applyRemind: legacy türü kapatınca 74xx türü de kapanır, saati kalır; zaten kapalıysa null', () => {
    const on = rem({ optIn: 'yes', types: { mola: { on: true, time: '12:30' }, breath: { on: true, time: '09:30' } } })
    const out = applyRemind({ moduleId: 'breath', remind: { legacy: 'breath' }, reminders: on, times: ['09:30'], on: false, now: NOW })
    expect(out.reminders.types.breath).toMatchObject({ on: false, time: '09:30' })
    expect(out.reminders.types.mola).toMatchObject({ on: true, time: '12:30' })
    expect(out.moduleReminders.breath.on).toBe(false)
    const off = applyRemind({ moduleId: 'breath', remind: { legacy: 'breath' }, reminders: out.reminders, times: [], on: false, now: NOW })
    expect(off.reminders).toBeNull()
    // legacy olmayan modül kapanınca settings.reminders dokunulmaz
    expect(applyRemind({ moduleId: 'blink', remind: BLINK, reminders: on, times: [], on: false, now: NOW }).reminders).toBeNull()
  })
})

describe('Gece sessizliği', () => {
  it('tasarım C: iki saat tek kartta (.qh-clocks > 2 × .qh-ck); "en geç" notu saatin altında, düğme sütununda değil; CSS', async () => {
    const { readFileSync } = await import('node:fs')
    const v = await mount(h(QuietHours, { quiet: { from: '23:00', to: '10:00' }, reminders: rem({ optIn: 'yes' }) }))
    const card = document.body.querySelectorAll((n) => n.getAttribute?.('class') === 'qh-clocks')[0]
    expect(card.querySelectorAll((n) => n.getAttribute?.('class') === 'qh-ck').length).toBe(2)
    const stp = document.body.querySelectorAll((n) => n.getAttribute?.('class') === 'qh-stp')
    expect(stp.every((n) => !n.textContent.includes('en geç'))).toBe(true)
    expect(v.text()).toContain('en geç 10.00')
    const css = readFileSync(new URL('../styles/remind.css', import.meta.url), 'utf8')
    expect(css).toMatch(/\.qh-ck \+ \.qh-ck \{ border-top/)
    expect(css).toMatch(/\.qh-stp button \{[^}]*border-radius: 50%/)
    expect(css).toMatch(/\.qh-v b \{ font: [^;]*var\(--font-display\)/)
    expect(css).toMatch(/\.qh-core svg[^{]*\{ flex: none; \}/)
    // PrefToggle satır düzeni bileşenin yüklediği info.css'te (breath.css'e bağlı değil)
    const pt = readFileSync(new URL('./PrefToggle.jsx', import.meta.url), 'utf8')
    const info = readFileSync(new URL('../styles/info.css', import.meta.url), 'utf8')
    expect(pt).toContain("import '../styles/info.css'")
    expect(info).toContain('.pref-toggle-row {')
    expect(info).toContain('.pref-toggle-main {')
  })

  it('varsayılan 23.00–07.00; değişmeyen satır ve sessizlikte de gelenler', async () => {
    const v = await mount(h(QuietHours, { quiet: null, reminders: rem({ optIn: 'yes' }) }))
    expect(v.text()).toContain('23.00')
    expect(v.text()).toContain('07.00')
    expect(v.text()).toContain('01.00–05.00 arası her gece sessiz; bu saatler değişmez.')
    expect(v.text()).toContain('Alarm')
    expect(v.text()).not.toContain('gece sessizliğinin içinde')
  })

  it('sınırda "+" kapalı ve nedenini söyler (en geç 10.00); deney saati içerideyse uyarı', async () => {
    let q = null
    const reminders = rem({ optIn: 'yes', types: { mola: { on: true, time: '09:30' } } })
    const v = await mount(h(QuietHours, { quiet: { from: '23:00', to: '10:00' }, reminders, onChange: (x) => { q = x } }))
    expect(v.btn('Geç bitir').disabled ?? v.btn('Geç bitir').getAttribute('disabled') != null).toBeTruthy()
    expect(v.text()).toContain('en geç 10.00')
    expect(v.text()).toContain('09.30 Mola gece sessizliğinin içinde; saatini değiştir')
    expect(v.text()).toContain('Mola saatine git')
    expect(v.text()).toContain('Mola hatırlatması')
    await v.tap('Erken bitir')
    expect(q).toEqual({ from: '23:00', to: '09:30' })
    expect(quietClashes(reminders, { from: '23:00', to: '09:00' })).toEqual([])
  })

  it('başlangıç 24.00\'e kadar; 24.00 "00:00" olarak yazılır', async () => {
    let q = null
    const v = await mount(h(QuietHours, { quiet: { from: '23:30', to: '07:00' }, onChange: (x) => { q = x } }))
    await v.tap('Geç başlat')
    expect(q).toEqual({ from: '00:00', to: '07:00' })
  })
})

describe('Bildirimler', () => {
  it('ana anahtar kapalıysa "Bildirimler kapalı"', async () => {
    const v = await mount(h(Notifications, { reminders: rem(), slots: [] }))
    expect(v.text()).toContain('Bildirimler kapalı')
  })

  it('satırlar: Nef seçti, elle saatler, legacy ek saatleri salt okunur, gece sessizliği', async () => {
    const slots = [{ date: '2026-10-01', type: 'mola', times: ['13:00', '17:00'] }]
    const moduleReminders = { blink: { on: true, mode: 'auto', times: ['09:15'] }, yoga: { on: false, mode: 'manual', times: ['10:00', '13:30', '18:00'] } }
    let toggled = null
    let quietOpened = 0
    const v = await mount(h(Notifications, {
      modules: [BLINK, YOGA], moduleReminders, reminders: rem({ optIn: 'yes' }), slots, now: NOW,
      next: { time: '10:00', label: 'Göz egzersizi' }, onToggle: (id, on) => { toggled = [id, on] }, onQuiet: () => quietOpened++,
    }))
    expect(v.text()).toContain('Sıradaki: 10.00 Göz egzersizi. Hiçbiri üst üste gelmez.')
    expect(v.text()).toContain('Göz kırpma')
    expect(v.text()).toContain('Her gün 09.15 · Nef seçti')
    expect(v.text()).toContain('10.00, 13.30 ve 18.00') // kapatılan satır listede kalır
    expect(v.text()).toContain("+ 13.00 · 17.00 · Bana hatırlat'tan")
    expect(v.text()).toContain('23.00–07.00')
    await v.tap('Yoga')
    expect(toggled).toEqual(['yoga', true])
    const q = document.body.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.startsWith('Gece sessizliği'))[0]
    await act(async () => q.click())
    expect(quietOpened).toBe(1)
  })

  it('legacy satırı (Mola, Nefes): saat ve tek anahtar; anahtar onToggleLegacy, ok Hatırlatmalar', async () => {
    let tog = null
    let opened = null
    const reminders = rem({ optIn: 'yes', types: { mola: { on: true, time: '12:30' }, breath: { on: true, time: '09:15' } } })
    const v = await mount(h(Notifications, {
      modules: [], moduleReminders: { breath: { on: true, mode: 'auto', times: [] } }, reminders, slots: [], now: NOW,
      onToggleLegacy: (t, on) => { tog = [t, on] }, onOpenReminders: (t) => { opened = t },
    }))
    expect(v.text()).toContain('Her gün 12.30')
    expect(v.text()).toContain('Her gün 09.15 · Nef seçti')
    await v.tap('Mola')
    expect(tog).toEqual(['mola', false])
    await v.tap('Nefes saatleri')
    expect(opened).toBe('breath')
  })
})

describe('Profil → Bildirimler satırı (PLAN.v1 §A.5)', () => {
  it('notify gelirse Alarm\'dan sonra "Bildirimler" satırı; dokununca açılır; kapalıyken "Bildirimler kapalı"', async () => {
    const { default: ProfileHome } = await import('../screens/ProfileHome.jsx')
    let opened = 0
    const base = { identity: null, profile: null, onSave() {}, onBack() {}, loadMembership: async () => null, alarm: { time: null, onOpen() {} } }
    const v = await mount(h(ProfileHome, { ...base, notify: { on: false, onOpen: () => { opened++ } } }))
    const t = v.text()
    expect(t).toContain('Bildirimler kapalı')
    expect(t.indexOf('Alarm kurulu değil')).toBeLessThan(t.indexOf('Bildirimler'))
    const row = document.body.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.startsWith('Bildirimler'))[0]
    await act(async () => row.click())
    expect(opened).toBe(1)
    await v.rerender(h(ProfileHome, { ...base, notify: { on: true, onOpen() {} } }))
    expect(v.text()).not.toContain('Bildirimler kapalı')
    await v.rerender(h(ProfileHome, { ...base, notify: null }))
    expect(v.text()).not.toContain('Bildirimler')
  })
})
