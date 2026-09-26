import { describe, it, expect, vi, afterEach } from 'vitest'
import { createPrefs, getPrefs, setPrefs, subscribePrefs, DEFAULT_PREFS } from './prefs.js'

function fakeBackend(initial = {}) {
  const m = new Map(Object.entries(initial))
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

const KEY = 'gozolcum:prefs'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('prefs', () => {
  it('varsayılan: ses ve titreşim açık', () => {
    const p = createPrefs(fakeBackend())
    expect(p.get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(DEFAULT_PREFS).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
  })

  it('kalıcıdır: aynı depoyla yeniden açılınca geri gelir', () => {
    const b = fakeBackend()
    createPrefs(b).set({ sound: false })
    expect(JSON.parse(b.map.get(KEY))).toEqual({ sound: false, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(createPrefs(b).get()).toEqual({ sound: false, haptics: true, coach: false, coachHidden: false, coachLife: false })
  })

  it('bilinmeyen anahtarları ve boolean olmayan değerleri yok sayar', () => {
    const p = createPrefs(fakeBackend())
    expect(p.set({ sound: 'no', haptics: 0, volume: 3 })).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(p.set(null)).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(p.set({ haptics: false, extra: true })).toEqual({ sound: true, haptics: false, coach: false, coachHidden: false, coachLife: false })
    expect(p.get()).not.toHaveProperty('extra')
  })

  it('bozuk veya eksik kayıt varsayılana düşer', () => {
    expect(createPrefs(fakeBackend({ [KEY]: '{bozuk' })).get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(createPrefs(fakeBackend({ [KEY]: '[1,2]' })).get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(createPrefs(fakeBackend({ [KEY]: '{"haptics":false}' })).get()).toEqual({ sound: true, haptics: false, coach: false, coachHidden: false, coachLife: false })
    expect(createPrefs(fakeBackend({ [KEY]: '{"sound":"false"}' })).get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
  })

  it('get() kopya döndürür (dışarıdan değiştirilemez)', () => {
    const p = createPrefs(fakeBackend())
    const a = p.get()
    a.sound = false
    expect(p.get().sound).toBe(true)
  })

  it('depolama hata verse de çalışır (bellekte)', () => {
    const throwing = {
      getItem() { throw new Error('SecurityError') },
      setItem() { throw new Error('QuotaExceededError') },
    }
    const p = createPrefs(throwing)
    expect(p.get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    expect(p.set({ haptics: false })).toEqual({ sound: true, haptics: false, coach: false, coachHidden: false, coachLife: false })
    expect(p.get().haptics).toBe(false)
  })

  it('depo erişimi fırlatırsa veya depo yoksa çökmez', () => {
    const p1 = createPrefs(() => { throw new Error('SecurityError') })
    expect(p1.set({ sound: false }).sound).toBe(false)
    const p2 = createPrefs(undefined)
    expect(p2.get()).toEqual({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
  })

  it('aboneler yalnızca gerçek değişiklikte (yeni, önceki) ile çağrılır', () => {
    const p = createPrefs(fakeBackend())
    const fn = vi.fn()
    const off = p.subscribe(fn)
    p.set({ sound: true }) // değişiklik yok
    expect(fn).not.toHaveBeenCalled()
    p.set({ sound: false })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({ sound: false, haptics: true, coach: false, coachHidden: false, coachLife: false }, { sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
    off()
    p.set({ sound: true })
    expect(fn).toHaveBeenCalledTimes(1)
    off() // ikinci kez çağırmak zararsız
  })

  it('bir dinleyicinin hatası diğerlerini engellemez', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const p = createPrefs(fakeBackend())
    const good = vi.fn()
    p.subscribe(() => { throw new Error('bozuk dinleyici') })
    p.subscribe(good)
    expect(() => p.set({ haptics: false })).not.toThrow()
    expect(good).toHaveBeenCalledTimes(1)
    expect(p.get().haptics).toBe(false)
  })

  it('dinleyici çalışırken abonelikten çıkabilir', () => {
    const p = createPrefs(fakeBackend())
    const calls = []
    const off = p.subscribe(() => { calls.push('a'); off() })
    p.subscribe(() => calls.push('b'))
    p.set({ sound: false })
    p.set({ sound: true })
    expect(calls).toEqual(['a', 'b', 'b'])
  })

  it('fonksiyon olmayan abone yok sayılır', () => {
    const p = createPrefs(fakeBackend())
    const off = p.subscribe(null)
    expect(typeof off).toBe('function')
    expect(() => p.set({ sound: false })).not.toThrow()
  })

  it('uygulama geneli getPrefs/setPrefs/subscribePrefs birlikte çalışır', () => {
    const start = getPrefs()
    const fn = vi.fn()
    const off = subscribePrefs(fn)
    const next = setPrefs({ haptics: !start.haptics })
    expect(next.haptics).toBe(!start.haptics)
    expect(getPrefs().haptics).toBe(!start.haptics)
    expect(fn).toHaveBeenCalledTimes(1)
    off()
    setPrefs(start) // geri al
    expect(getPrefs()).toEqual(start)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
