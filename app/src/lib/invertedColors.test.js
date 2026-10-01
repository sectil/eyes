import { describe, it, expect } from 'vitest'
import { INVERTED_QUERY, cssInvertedColors, combineInverted, readInvertedColors, watchInvertedColors } from './invertedColors.js'

// Sahte matchMedia: tek sorgu nesnesi, change dinleyicileri
function fakeMedia(matches = false) {
  const listeners = new Set()
  const mql = {
    media: INVERTED_QUERY,
    matches,
    addEventListener: (type, fn) => type === 'change' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'change' && listeners.delete(fn),
  }
  const mm = (q) => {
    mm.queries.push(q)
    return mql
  }
  mm.queries = []
  mm.set = (v) => {
    mql.matches = v
    for (const fn of [...listeners]) fn({ matches: v })
  }
  mm.count = () => listeners.size
  return mm
}

function fakeDoc() {
  const listeners = new Set()
  return {
    visibilityState: 'visible',
    addEventListener: (type, fn) => type === 'visibilitychange' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'visibilitychange' && listeners.delete(fn),
    fire(state) {
      this.visibilityState = state
      for (const fn of [...listeners]) fn()
    },
    get count() {
      return listeners.size
    },
  }
}

function fakeNative(initial = false) {
  const n = { value: initial, handler: null, stops: 0 }
  n.get = async () => n.value
  n.watch = (fn) => {
    n.handler = fn
    return () => {
      n.stops += 1
      n.handler = null
    }
  }
  n.change = (v) => {
    n.value = v
    n.handler?.(v)
  }
  return n
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('cssInvertedColors', () => {
  it('sorgu: (inverted-colors: inverted); eşleşme true, eşleşmeme false', () => {
    const mm = fakeMedia(true)
    expect(cssInvertedColors(mm)).toBe(true)
    expect(mm.queries).toEqual(['(inverted-colors: inverted)'])
    expect(cssInvertedColors(fakeMedia(false))).toBe(false)
  })
  it('matchMedia yok ya da hata → null (bilinmiyor)', () => {
    expect(cssInvertedColors(null)).toBe(null)
    expect(
      cssInvertedColors(() => {
        throw new Error('x')
      }),
    ).toBe(null)
  })
})

describe('readInvertedColors (S12)', () => {
  it('CSS açık demese de native açık derse açık sayılır (WKWebView CSS desteği doğrulanmadı)', async () => {
    expect(await readInvertedColors({ matchMedia: fakeMedia(false), nativeGet: async () => true })).toBe(true)
    expect(await readInvertedColors({ matchMedia: null, nativeGet: async () => true })).toBe(true)
  })
  it('CSS açık derse native bilinmese de açık', async () => {
    expect(await readInvertedColors({ matchMedia: fakeMedia(true), nativeGet: async () => null })).toBe(true)
  })
  it('ikisi kapalı / bilinmiyor → kapalı; native hata atarsa CSS kullanılır', async () => {
    expect(await readInvertedColors({ matchMedia: fakeMedia(false), nativeGet: async () => false })).toBe(false)
    expect(await readInvertedColors({ matchMedia: null, nativeGet: async () => null })).toBe(false)
    const boom = async () => {
      throw new Error('köprü')
    }
    expect(await readInvertedColors({ matchMedia: fakeMedia(true), nativeGet: boom })).toBe(true)
    expect(await readInvertedColors({ matchMedia: fakeMedia(false), nativeGet: boom })).toBe(false)
  })
  it('combineInverted yalnız kesin true ile açık der', () => {
    expect(combineInverted(null, null)).toBe(false)
    expect(combineInverted('true', 1)).toBe(false)
    expect(combineInverted(false, true)).toBe(true)
  })
})

describe('watchInvertedColors', () => {
  it('ilk okuma bildirilir; native ayar olayı, CSS değişimi ve uygulamaya dönüş yeniden okur; aynı değer tekrar bildirilmez', async () => {
    const mm = fakeMedia(false)
    const native = fakeNative(false)
    const doc = fakeDoc()
    const seen = []
    const stop = watchInvertedColors((v) => seen.push(v), { matchMedia: mm, nativeGet: native.get, nativeWatch: native.watch, doc })
    await flush()
    expect(seen).toEqual([false])

    // Erişilebilirlik kısayolu (uygulamadan çıkmadan): native olay
    native.change(true)
    await flush()
    expect(seen).toEqual([false, true])

    // Ayarlar'dan kapatıp dönüş: visibilitychange
    native.value = false
    doc.fire('visible')
    await flush()
    expect(seen).toEqual([false, true, false])

    // CSS değişimi
    mm.set(true)
    await flush()
    expect(seen).toEqual([false, true, false, true])

    // Aynı değer: bildirim yok
    doc.fire('visible')
    await flush()
    expect(seen).toEqual([false, true, false, true])

    stop()
    expect(mm.count()).toBe(0)
    expect(doc.count).toBe(0)
    expect(native.stops).toBe(1)
    mm.set(false)
    await flush()
    expect(seen).toEqual([false, true, false, true])
  })

  it('eski bir okuma yenisinden sonra biterse yok sayılır', async () => {
    const pending = []
    const nativeGet = () => new Promise((r) => pending.push(r))
    const native = fakeNative(false)
    const seen = []
    watchInvertedColors((v) => seen.push(v), { matchMedia: fakeMedia(false), nativeGet, nativeWatch: native.watch, doc: fakeDoc() })
    // 1. okuma (ilk) sürerken ayar değişti: 2. okuma
    native.handler()
    await flush()
    expect(pending).toHaveLength(2)
    pending[1](true) // yeni okuma: açık
    await flush()
    pending[0](false) // eski okuma sonra bitti: kapalı (bayat)
    await flush()
    expect(seen).toEqual([true])
  })

  it('durdurulduktan sonra biten okuma bildirilmez', async () => {
    let release
    const nativeGet = () => new Promise((r) => (release = r))
    const seen = []
    const stop = watchInvertedColors((v) => seen.push(v), { matchMedia: fakeMedia(false), nativeGet, nativeWatch: () => () => {}, doc: fakeDoc() })
    stop()
    release(true)
    await flush()
    expect(seen).toEqual([])
  })
})
