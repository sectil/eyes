import { describe, it, expect, vi, afterEach } from 'vitest'
import { installTapHaptics } from './native.js'

// Sahte DOM: yalnızca dinleyicinin kullandığı parçalar
function fakeRoot() {
  let handler = null
  return {
    addEventListener: (type, fn) => (handler = fn),
    removeEventListener: () => (handler = null),
    click: (target) => handler?.({ target }),
    get installed() {
      return Boolean(handler)
    },
  }
}
const el = ({ attrs = {}, disabled = false, noTap = false, isButton = true } = {}) => {
  const node = {
    disabled,
    getAttribute: (k) => attrs[k] ?? null,
    hasAttribute: (k) => k in attrs,
    closest: (sel) => (sel === '[data-no-tap]' ? (noTap ? node : null) : isButton ? node : null),
  }
  return node
}
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('installTapHaptics', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('düğmeye dokununca hafif titreşim; anahtar, devre dışı ve data-no-tap atlanır', async () => {
    const vibrate = vi.fn(() => true)
    vi.stubGlobal('navigator', { vibrate })
    const root = fakeRoot()
    const off = installTapHaptics(root)
    root.click(el())
    await flush()
    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenLastCalledWith([20])
    root.click(el({ attrs: { role: 'switch' } }))
    root.click(el({ attrs: { 'aria-pressed': 'true' } }))
    root.click(el({ disabled: true }))
    root.click(el({ noTap: true }))
    root.click(el({ isButton: false }))
    await flush()
    expect(vibrate).toHaveBeenCalledTimes(1)
    off()
    expect(root.installed).toBe(false)
  })
})
