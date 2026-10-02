import { describe, it, expect, vi, beforeEach } from 'vitest'

// Capacitor sahte: platform değiştirilebilir, FaceDistance eklentisi sahte nesne
const h = vi.hoisted(() => {
  const plugin = {
    getBrightness: null,
    setBrightness: null,
    isInvertColorsEnabled: null,
    addListener: null,
  }
  return { native: true, plugin }
})
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => h.native,
    getPlatform: () => (h.native ? 'ios' : 'web'),
  },
  registerPlugin: (name) => (name === 'FaceDistance' ? h.plugin : {}),
}))

const { getScreenBrightness, setScreenBrightness, watchScreenBrightness, nativeInvertColors, watchNativeInvertColors } = await import('./native.js')

const flush = () => new Promise((r) => setTimeout(r, 0))
const unimplemented = () => Promise.reject(Object.assign(new Error('not implemented'), { code: 'UNIMPLEMENTED' }))

beforeEach(() => {
  h.native = true
  h.plugin.getBrightness = vi.fn(async () => ({ brightness: 0.42 }))
  h.plugin.setBrightness = vi.fn(async (o) => ({ brightness: o.brightness }))
  h.plugin.isInvertColorsEnabled = vi.fn(async () => ({ enabled: true }))
  h.plugin.addListener = vi.fn(async () => ({ remove: vi.fn(async () => {}) }))
})

describe('ekran parlaklığı köprüsü (FaceDistancePlugin.swift)', () => {
  it('iPhone: okuma sayı döner; geçersiz yanıt ve eski derleme (UNIMPLEMENTED) null', async () => {
    expect(await getScreenBrightness()).toBe(0.42)
    h.plugin.getBrightness = vi.fn(async () => ({ brightness: 'x' }))
    expect(await getScreenBrightness()).toBe(null)
    h.plugin.getBrightness = vi.fn(unimplemented)
    expect(await getScreenBrightness()).toBe(null)
  })

  it('yazma 0–1 arasına sıkıştırılır; restoreOnLeave yalnız verilince gönderilir', async () => {
    expect(await setScreenBrightness(1.7, { restoreOnLeave: 0.3 })).toBe(1)
    expect(h.plugin.setBrightness).toHaveBeenLastCalledWith({ brightness: 1, restoreOnLeave: 0.3 })
    await setScreenBrightness(-0.2, { restoreOnLeave: 2 })
    expect(h.plugin.setBrightness).toHaveBeenLastCalledWith({ brightness: 0, restoreOnLeave: 1 })
    await setScreenBrightness(0.55)
    expect(h.plugin.setBrightness).toHaveBeenLastCalledWith({ brightness: 0.55 })
    await setScreenBrightness(0.55, { restoreOnLeave: null })
    expect(h.plugin.setBrightness).toHaveBeenLastCalledWith({ brightness: 0.55 })
  })

  it('geçersiz değer köprüye gitmez; eklenti reddederse null', async () => {
    expect(await setScreenBrightness(NaN)).toBe(null)
    expect(await setScreenBrightness(undefined)).toBe(null)
    expect(h.plugin.setBrightness).not.toHaveBeenCalled()
    h.plugin.setBrightness = vi.fn(unimplemented)
    expect(await setScreenBrightness(1)).toBe(null)
  })

  it('"brightness" olayı dinlenir; durdurunca dinleyici kaldırılır, sonraki olay iletilmez', async () => {
    let handler = null
    const remove = vi.fn(async () => {})
    h.plugin.addListener = vi.fn(async (name, fn) => {
      handler = fn
      return { remove }
    })
    const seen = []
    const stop = watchScreenBrightness((e) => seen.push(e))
    await flush()
    expect(h.plugin.addListener).toHaveBeenCalledWith('brightness', expect.any(Function))
    handler({ reason: 'restored', brightness: 0.4 })
    expect(seen).toEqual([{ reason: 'restored', brightness: 0.4 }])
    stop()
    expect(remove).toHaveBeenCalledTimes(1)
    handler({ reason: 'active' })
    expect(seen).toHaveLength(1)
  })

  it('dinleyici eklenmeden durdurulursa eklenince hemen kaldırılır', async () => {
    const remove = vi.fn(async () => {})
    let resolveAdd
    h.plugin.addListener = vi.fn(() => new Promise((r) => (resolveAdd = () => r({ remove }))))
    const stop = watchNativeInvertColors(() => {})
    await flush()
    stop()
    resolveAdd()
    await flush()
    expect(remove).toHaveBeenCalledTimes(1)
  })
})

describe('ters renk köprüsü', () => {
  it('iPhone: enabled boolean döner; hata ya da boolean olmayan yanıt null', async () => {
    expect(await nativeInvertColors()).toBe(true)
    h.plugin.isInvertColorsEnabled = vi.fn(async () => ({ enabled: false }))
    expect(await nativeInvertColors()).toBe(false)
    h.plugin.isInvertColorsEnabled = vi.fn(async () => ({}))
    expect(await nativeInvertColors()).toBe(null)
    h.plugin.isInvertColorsEnabled = vi.fn(unimplemented)
    expect(await nativeInvertColors()).toBe(null)
  })

  it('"invertColors" olayı onChange(boolean) olarak iletilir', async () => {
    let handler = null
    h.plugin.addListener = vi.fn(async (name, fn) => {
      handler = fn
      return { remove: async () => {} }
    })
    const seen = []
    watchNativeInvertColors((v) => seen.push(v))
    await flush()
    expect(h.plugin.addListener).toHaveBeenCalledWith('invertColors', expect.any(Function))
    handler({ enabled: true })
    handler({ enabled: false })
    handler({})
    expect(seen).toEqual([true, false, false])
  })
})

describe('web: hiçbir şey yapmaz', () => {
  it('eklentiye hiç gidilmez; null / boş durdurma döner', async () => {
    h.native = false
    expect(await getScreenBrightness()).toBe(null)
    expect(await setScreenBrightness(1, { restoreOnLeave: 0.5 })).toBe(null)
    expect(await nativeInvertColors()).toBe(null)
    const stopA = watchScreenBrightness(() => {})
    const stopB = watchNativeInvertColors(() => {})
    await flush()
    stopA()
    stopB()
    expect(h.plugin.getBrightness).not.toHaveBeenCalled()
    expect(h.plugin.setBrightness).not.toHaveBeenCalled()
    expect(h.plugin.isInvertColorsEnabled).not.toHaveBeenCalled()
    expect(h.plugin.addListener).not.toHaveBeenCalled()
  })
})
