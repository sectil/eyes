// Profil → Bildirimler'den modül hatırlatması (B1a son tur: bitiş ekranındaki satır kapalı, App REMIND_ROW = false;
// Bildirimler ve saat sayfası açık, NOTIFY_PAGE = true). App'in bağlantısı kadar bir düzenek: anahtar applyRemind'le
// ayarı yazar (App toggleRemind), satıra dokunmak saat sayfasını açar (App remindSheet).
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act, useState } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
const { default: Notifications } = await import('./Notifications.jsx')
const { default: RemindSheet } = await import('../components/RemindSheet.jsx')
const { applyRemind } = await import('../components/remindUi.js')
const { pickAutoTime } = await import('../lib/moduleRemind.js')

const NOW = new Date(2026, 9, 1, 9, 0)
const BLINK = { module: 'blink', route: 'blink', legacy: null, window: 'move', maxTimes: 3, science: ['kim2020'] }
const YOGA = { module: 'yoga', route: 'yoga', legacy: null, window: 'calm', maxTimes: 3, science: ['luu2024'] }
const MODULES = [BLINK, YOGA]

let settings
function Harness() {
  const [s, setS] = useState(settings)
  const [open, setOpen] = useState(null)
  const save = ({ moduleReminders, reminders } = {}) => {
    setS((cur) => {
      const next = { ...cur, ...(moduleReminders ? { moduleReminders } : {}), ...(reminders ? { reminders } : {}) }
      settings = next
      return next
    })
  }
  const entry = (id) => MODULES.find((m) => m.module === id)
  const toggle = (id, on) => {
    const cfg = s.moduleReminders?.[id]
    const times = cfg?.times?.length ? cfg.times : pickAutoTime({ remind: entry(id), now: NOW }).times
    save(applyRemind({ moduleId: id, remind: entry(id), moduleReminders: s.moduleReminders, reminders: s.reminders, mode: cfg?.mode ?? 'auto', times, on, now: NOW }))
  }
  return h('div', null,
    h(Notifications, { modules: MODULES, moduleReminders: s.moduleReminders, reminders: s.reminders, slots: [], now: NOW, onToggle: toggle, onOpen: (id) => setOpen(id) }),
    open && h(RemindSheet, { moduleId: open, remind: entry(open), moduleReminders: s.moduleReminders, reminders: s.reminders, now: NOW, onSave: (x) => { save(x); setOpen(null) }, onClose: () => setOpen(null) }),
  )
}

async function mount() {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(h(Harness)))
  const btn = (label) => document.body.querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${document.body.textContent}`); await act(async () => b.click()) }
  const sw = (label) => document.body.querySelectorAll((n) => n.getAttribute?.('role') === 'switch' && n.getAttribute('aria-label') === label)[0]
  const byClass = (c) => document.body.querySelectorAll((n) => (n.getAttribute?.('class') ?? '').split(' ').includes(c))
  return { btn, tap, sw, byClass, text: () => document.body.textContent }
}

describe('Bildirimler → modül hatırlatması', () => {
  it('kurulmamış modül kapalı satırda Nef\'in önerisiyle durur; anahtar açar ve kapatır', async () => {
    settings = { moduleReminders: undefined, reminders: { optIn: null, types: { mola: { on: true, time: '12:30' } } } }
    const v = await mount()
    expect(v.text()).toContain('Gece sessizliği')
    expect(v.text()).toContain('Göz kırpma')
    expect(v.text()).toContain('Her gün 16.30')
    expect(v.sw('Göz kırpma').getAttribute('aria-checked')).toBe('false')

    await act(async () => v.sw('Göz kırpma').click())
    expect(settings.moduleReminders.blink).toMatchObject({ on: true, mode: 'auto', times: ['16:30'] })
    expect(settings.reminders.optIn).toBe('yes')
    expect(v.sw('Göz kırpma').getAttribute('aria-checked')).toBe('true')
    expect(v.text()).toContain('Her gün 16.30 · Nef seçti')

    await act(async () => v.sw('Göz kırpma').click())
    expect(settings.moduleReminders.blink.on).toBe(false)
    expect(settings.moduleReminders.blink.times).toEqual(['16:30']) // kapatılan satır saatiyle listede kalır
    expect(v.sw('Göz kırpma').getAttribute('aria-checked')).toBe('false')
    // öteki modüle dokunulmadı
    expect(settings.moduleReminders.yoga).toBeUndefined()
  })

  it('satıra dokununca saat sayfası açılır ("Nef seçsin", Nef işareti bir kez); kaydedince satır açık', async () => {
    settings = { moduleReminders: undefined, reminders: { optIn: 'yes', types: { mola: { on: true, time: '12:30' } } } }
    const v = await mount()
    expect(v.byClass('iris-mark').length).toBe(0) // listede Nef simgesi/rozeti yok
    await v.tap('Göz kırpma saatleri')
    expect(v.text()).toContain('Nef seçsin')
    expect(v.text()).toContain('Saatleri ben seçeyim')
    expect(v.text()).toContain('Önerilen')
    expect(v.text()).toContain('Henüz saatini bilmiyorum. 16.30\'la başlayalım; beş kez yaptıktan sonra senin saatine göre ayarlarım.')
    expect(v.byClass('iris-mark').length).toBe(1)
    await v.tap('Hatırlatmayı aç')
    expect(settings.moduleReminders.blink).toMatchObject({ on: true, mode: 'auto', times: ['16:30'] })
    expect(v.text()).not.toContain('Nef seçsin') // sayfa kapandı
    expect(v.sw('Göz kırpma').getAttribute('aria-checked')).toBe('true')
    await v.tap('Yoga saatleri')
    expect(v.text()).toContain('Nef seçsin')
    await v.tap('Kapat')
    expect(v.text()).not.toContain('Nef seçsin')
    expect(settings.moduleReminders.yoga).toBeUndefined()
  })

  it('App bayrakları: bitiş satırı ve Bildirimler kapalı (5 sn kapısı geçmedi)', async () => {
    const { readFileSync } = await import('node:fs')
    const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
    expect(app).toMatch(/^const REMIND_ROW = false$/m)
    expect(app).toMatch(/^const NOTIFY_PAGE = false\b/m)
    expect(app).toMatch(/if \(!REMIND_ROW\) return null/)
    expect(app).toMatch(/notify=\{NOTIFY_PAGE && isIOSApp\(\)/)
    expect(app).not.toMatch(/REMIND_UI/)
  })
})
