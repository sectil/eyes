import { describe, it, expect } from 'vitest'
import { createBrightnessSession, TEST_BRIGHTNESS } from './brightnessSession.js'

// Sahte ekran: get/set her çağrıyı kaydeder; set okunan değeri döner (native gibi).
function fakeScreen(initial = 0.4) {
  const screen = { value: initial, calls: [] }
  screen.get = async () => screen.value
  screen.set = async (v, opts) => {
    screen.calls.push(opts === undefined ? [v] : [v, opts])
    screen.value = v
    return v
  }
  return screen
}

// Sahte belge: visibilitychange dinleyicisi
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

// Sahte native olay kaynağı ("brightness" olayı)
function fakeNative() {
  const n = { handler: null, stops: 0 }
  n.listen = (fn) => {
    n.handler = fn
    return () => {
      n.stops += 1
      n.handler = null
    }
  }
  n.emit = (e) => n.handler?.(e)
  return n
}

const flush = () => new Promise((r) => setTimeout(r, 0))

function setup(initial = 0.4) {
  const screen = fakeScreen(initial)
  const doc = fakeDoc()
  const native = fakeNative()
  const session = createBrightnessSession({ get: screen.get, set: screen.set, listen: native.listen, doc })
  return { screen, doc, native, session }
}

describe('createBrightnessSession (S7)', () => {
  it('Başla: eski değeri okur, 1 yapar, native korumaya eski değeri verir; bitişte eski değere döner', async () => {
    const { screen, session } = setup(0.4)
    const st = await session.start()
    expect(TEST_BRIGHTNESS).toBe(1)
    expect(st).toEqual({ active: true, applied: true, from: 0.4 })
    expect(screen.value).toBe(1)
    expect(screen.calls).toEqual([[1, { restoreOnLeave: 0.4 }]])
    const done = await session.end()
    expect(done).toEqual({ active: false, applied: false, from: 0.4 })
    expect(screen.value).toBe(0.4)
    // Geri yükleme native korumayı kaldırır (restoreOnLeave yok)
    expect(screen.calls[1]).toEqual([0.4])
  })

  it('start iki kez çağrılırsa eski değer 1 ile ezilmez (her gözde tekrar çağrı zararsız)', async () => {
    const { screen, session } = setup(0.3)
    await session.start()
    await session.start()
    expect(screen.calls.filter((c) => c[0] === 1)).toHaveLength(1)
    await session.end()
    expect(screen.value).toBe(0.3)
  })

  it('geri yükleme bir kez: bitiş iki kez, ya da gizlenme + bitiş eski değeri bir kez yazar', async () => {
    const { screen, doc, session } = setup(0.25)
    await session.start()
    await session.end()
    await session.end()
    expect(screen.calls.filter((c) => c.length === 1)).toEqual([[0.25]])

    const b = setup(0.6)
    await b.session.start()
    b.doc.fire('hidden')
    await flush()
    expect(b.screen.value).toBe(0.6)
    await b.session.end()
    expect(b.screen.calls.filter((c) => c.length === 1)).toEqual([[0.6]])
    expect(doc.count).toBe(0)
  })

  it('arka plan (hidden) eski değere döner; dönüşte (visible) test sürüyorsa yeniden 1, aradaki kullanıcı ayarı saklanır', async () => {
    const { screen, doc, session } = setup(0.5)
    await session.start()
    doc.fire('hidden')
    await flush()
    expect(screen.value).toBe(0.5)
    expect(session.state().applied).toBe(false)
    // kullanıcı dışarıdayken parlaklığı değiştirdi
    screen.value = 0.7
    doc.fire('visible')
    await flush()
    expect(screen.value).toBe(1)
    expect(screen.calls.at(-1)).toEqual([1, { restoreOnLeave: 0.7 }])
    await session.end()
    expect(screen.value).toBe(0.7)
    // Başlangıç değeri (kayıt için) ilk okunan değer kalır
    expect(session.state().from).toBe(0.5)
  })

  it('bitişten sonra görünürlük olayı parlaklığı değiştirmez; dinleyiciler kaldırılır', async () => {
    const { screen, doc, native, session } = setup(0.2)
    await session.start()
    expect(doc.count).toBe(1)
    await session.end()
    expect(doc.count).toBe(0)
    expect(native.stops).toBe(1)
    const n = screen.calls.length
    doc.fire('visible')
    doc.fire('hidden')
    native.emit({ reason: 'active' })
    await flush()
    expect(screen.calls).toHaveLength(n)
    expect(screen.value).toBe(0.2)
  })

  it('Başla ve hemen çıkış ya da okuma sürerken çıkış: parlaklık hiç 1 olmaz', async () => {
    const quick = setup(0.35)
    const s1 = quick.session.start()
    const e1 = quick.session.end()
    await s1
    await e1
    expect(quick.screen.calls).toEqual([])

    const screen = fakeScreen(0.35)
    let release = null
    const slowGet = () => new Promise((r) => (release = () => r(screen.value)))
    const session = createBrightnessSession({ get: slowGet, set: screen.set, listen: () => () => {}, doc: fakeDoc() })
    const started = session.start()
    await flush()
    const ended = session.end()
    release()
    await started
    await ended
    await flush()
    expect(screen.calls).toEqual([])
    expect(screen.value).toBe(0.35)
    expect(session.state()).toEqual({ active: false, applied: false, from: null })
  })

  it('çıkış, 1 yazılırken gelirse önce 1 biter sonra eski değer yazılır', async () => {
    const screen = fakeScreen(0.45)
    let releaseSet = null
    const slowSet = (v, opts) =>
      new Promise((r) => {
        const done = () => r(screen.set(v, opts))
        if (v === 1) releaseSet = done
        else done()
      })
    const session = createBrightnessSession({ get: screen.get, set: slowSet, listen: () => () => {}, doc: fakeDoc() })
    const started = session.start()
    await flush()
    const ended = session.end()
    await flush()
    releaseSet()
    await started
    await ended
    expect(screen.value).toBe(0.45)
    expect(screen.calls.map((c) => c[0])).toEqual([1, 0.45])
  })

  it('native etkinlik kaybında geri yükledi: bir daha yazılmaz; yeniden etkinleşince 1 yeniden uygulanır', async () => {
    const { screen, native, session } = setup(0.4)
    await session.start()
    // native tarafın yaptığı: eski değeri yazdı, olay gönderdi
    screen.value = 0.4
    native.emit({ reason: 'restored', brightness: 0.4 })
    await flush()
    expect(session.state().applied).toBe(false)
    native.emit({ reason: 'active' })
    await flush()
    expect(screen.value).toBe(1)
    expect(session.state().applied).toBe(true)
    native.emit({ reason: 'restored', brightness: 0.4 })
    screen.value = 0.4
    await flush()
    const before = screen.calls.length
    await session.end()
    // native zaten geri yükledi: bitişte ikinci kez yazılmaz
    expect(screen.calls).toHaveLength(before)
    expect(screen.value).toBe(0.4)
  })

  it('web: okuma null → hiçbir şey yazılmaz', async () => {
    const calls = []
    const session = createBrightnessSession({
      get: async () => null,
      set: async (...a) => {
        calls.push(a)
        return null
      },
      listen: () => () => {},
      doc: fakeDoc(),
    })
    expect(await session.start()).toEqual({ active: true, applied: false, from: null })
    expect(await session.end()).toEqual({ active: false, applied: false, from: null })
    expect(calls).toEqual([])
  })

  it('native yazamazsa (null) uygulanmış sayılmaz, bitişte eski değer yazılmaz', async () => {
    const calls = []
    const session = createBrightnessSession({
      get: async () => 0.5,
      set: async (...a) => {
        calls.push(a)
        return null
      },
      listen: () => () => {},
      doc: fakeDoc(),
    })
    expect((await session.start()).applied).toBe(false)
    await session.end()
    expect(calls).toEqual([[1, { restoreOnLeave: 0.5 }]])
  })

  it('get/set hata atarsa zincir kırılmaz', async () => {
    let n = 0
    const screen = fakeScreen(0.3)
    const session = createBrightnessSession({
      get: async () => {
        n += 1
        if (n === 1) throw new Error('köprü')
        return screen.value
      },
      set: screen.set,
      listen: () => () => {},
      doc: fakeDoc(),
    })
    expect((await session.start()).applied).toBe(false)
    await session.end()
    expect(await session.start()).toEqual({ active: true, applied: true, from: 0.3 })
    await session.end()
    expect(screen.value).toBe(0.3)
  })
})
