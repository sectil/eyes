// Ana sayfa · su çipi (sahip 2026-10-03): bugünkü bardak sayısı; dokununca bir bardak, 5 sn "Geri al"
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
vi.mock('../../lib/native.js', () => ({ haptic: () => {} }))
// Şerit gövdeye taşınır (createPortal); sahte DOM'da yerinde çizilir
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: (el) => el }))
const { createRoot } = await import('react-dom/client')
const { default: WaterChip, UNDO_MS } = await import('./WaterChip.jsx')
const { loadHabits, dayKey } = await import('../../lib/habitLog.js')

const mem = new Map()
const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }
const btn = (root, pred) => root.querySelectorAll((n) => n.nodeName === 'BUTTON' && pred(n))[0] ?? null
const chip = (root) => btn(root, (n) => String(n.getAttribute?.('aria-label') ?? '').startsWith('Su:'))
const undoBtn = (root) => btn(root, (n) => n.textContent.includes('Geri al'))
async function mount(props) {
  const container = document.createElement('div')
  await act(async () => createRoot(container).render(h(WaterChip, { storage, ...props })))
  return container
}

beforeEach(() => { mem.clear(); vi.useFakeTimers() })
afterEach(() => vi.useRealTimers())

describe('su çipi', () => {
  it('bugünkü bardak sayısı; dünkü kayıt sayılmaz', async () => {
    const today = new Date()
    const y = new Date(today.getTime() - 86400000)
    mem.set('gozolcum:habit-log', JSON.stringify([
      { date: dayKey(y), type: 'water', at: y.toISOString() },
      { date: dayKey(today), type: 'water', at: today.toISOString() },
      { date: dayKey(today), type: 'mola', at: today.toISOString() },
    ]))
    const root = await mount({ now: today })
    expect(chip(root).getAttribute('aria-label')).toBe('Su: bugün 1 bardak. Bir bardak ekle')
  })
  it('dokununca bir bardak eklenir; Geri al 5 sn görünür ve eklenen kaydı siler', async () => {
    const onChange = vi.fn()
    const root = await mount({ onChange })
    expect(undoBtn(root)).toBeNull()
    await act(async () => chip(root).click())
    expect(loadHabits(storage).filter((x) => x.type === 'water').length).toBe(1)
    expect(chip(root).getAttribute('aria-label')).toContain('bugün 1 bardak')
    expect(undoBtn(root)).not.toBeNull()
    await act(async () => undoBtn(root).click())
    expect(loadHabits(storage).length).toBe(0)
    expect(chip(root).getAttribute('aria-label')).toContain('bugün 0 bardak')
    expect(onChange).toHaveBeenCalledTimes(2)
  })
  it('Geri al 5 sn sonra kalkar, kayıt kalır', async () => {
    const root = await mount({})
    await act(async () => chip(root).click())
    await act(async () => { vi.advanceTimersByTime(UNDO_MS) })
    expect(undoBtn(root)).toBeNull()
    expect(loadHabits(storage).length).toBe(1)
  })
})
