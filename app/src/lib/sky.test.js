import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resetAllData } from './notifyReset.js'
import { SKY_KEYS, validForecast, roundCoord, roundPoint, fetchWeather, loadCache, notifyUsable, skyState, ageText, clockWithSuffix, skySupported, skyAvailable, requestLocation, recordDay, loadDays, enforceWeatherConsent, clearSkyData, SKY_CACHE_KEY, SKY_DAYS_KEY, SKY_TEXT, STALE_H } from './sky.js'
import { SKY_PLACE_KEY } from './places.js'
import { recordConsent } from './consent.js'

function mem(init = {}) {
  const m = new Map(Object.entries(init))
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }
}
const at = (s) => new Date(s)

describe('yuvarlama', () => {
  it('41.0082 → 41.01; 2 ondalık', () => {
    expect(roundCoord(41.0082)).toBe(41.01)
    expect(roundCoord(28.9784)).toBe(28.98)
    expect(roundPoint({ lat: 41.0082, lon: 28.9784, accuracy: 5 })).toEqual({ lat: 41.01, lon: 28.98 })
  })
  it('WeatherKit\'e yuvarlanmış koordinat gider; önbellekte koordinat yok', async () => {
    const fc = { fetchedAt: 1790000000000, now: { tempC: 23 }, hours: [], days: [] }
    const plugin = { forecast: vi.fn(async () => ({ ...fc, lat: 41.0082, lon: 28.9784 })) }
    const s = mem()
    const r = await fetchWeather({ lat: 41.0082, lon: 28.9784 }, { plugin, storage: s, now: at('2026-10-01T09:40:00') })
    expect(plugin.forecast).toHaveBeenCalledWith({ lat: 41.01, lon: 28.98 })
    expect(r.ok).toBe(true)
    expect(s.getItem(SKY_CACHE_KEY)).not.toMatch(/41\.0|28\.9|lat|lon/)
    expect(loadCache(s).data).toEqual(fc)
  })
})

describe('18 saat bayatlık (sabah havası)', () => {
  const cache = { at: at('2026-10-01T22:40:00').toISOString(), data: {} }
  it('bildirim anında 18 saate kadar kullanılır, sonrası kurulmaz', () => {
    expect(STALE_H).toBe(18)
    expect(notifyUsable(cache, at('2026-10-02T08:00:00'))).toBe(true)
    expect(notifyUsable(cache, at('2026-10-02T16:40:00'))).toBe(true)
    expect(notifyUsable(cache, at('2026-10-02T16:41:00'))).toBe(false)
    expect(notifyUsable(null, at('2026-10-02T08:00:00'))).toBe(false)
  })
})

describe('yaş metni', () => {
  const now = at('2026-10-01T15:00:00')
  it('bugün alınan veri: saat ve eki', () => {
    expect(ageText(at('2026-10-01T12:40:00'), now)).toBe("12.40'ta alındı")
    expect(ageText(at('2026-10-01T12:00:00'), now)).toBe("12.00'de alındı")
    expect(ageText(at('2026-10-01T13:30:00'), now)).toBe("13.30'da alındı")
    expect(clockWithSuffix(at('2026-10-01T09:05:00'))).toBe("09.05'te")
    expect(clockWithSuffix(at('2026-10-01T10:00:00'))).toBe("10.00'da")
    expect(clockWithSuffix(at('2026-10-01T20:50:00'))).toBe("20.50'de")
  })
  it('önceki gün: onaylı metin yok, yer tutucu', () => {
    expect(ageText(at('2026-09-30T22:40:00'), now)).toMatch(/^\[\[/)
  })
})

describe('çevrimdışı ve hata durumları', () => {
  const now = at('2026-10-01T15:00:00')
  const young = { at: at('2026-10-01T05:00:00').toISOString(), data: { temp: 20 } } // 10 sa
  const old = { at: at('2026-10-01T02:00:00').toISOString(), data: { temp: 20 } } // 13 sa
  it('çevrimdışı, önbellek < 12 sa: son veri ve yaşı', () => {
    expect(skyState({ supported: true, online: false, cache: young, now })).toMatchObject({ kind: 'cached', age: 10 })
  })
  it('çevrimdışı, önbellek yok ya da eski: "Hava için internet gerekiyor."', () => {
    expect(skyState({ supported: true, online: false, cache: null, now })).toEqual({ kind: 'offline', text: SKY_TEXT.offline })
    expect(skyState({ supported: true, online: false, cache: old, now }).text).toBe('Hava için internet gerekiyor.')
  })
  it('WeatherKit hatası: "Hava bilgisi şu an alınamadı."', () => {
    expect(skyState({ supported: true, online: true, error: true, cache: null, now }).text).toBe('Hava bilgisi şu an alınamadı.')
    expect(skyState({ supported: true, online: true, error: true, cache: young, now }).kind).toBe('cached')
  })
  it('çevrimdışıyken istek yapılmaz', async () => {
    const plugin = { forecast: vi.fn() }
    expect(await fetchWeather({ lat: 38.3, lon: 27.1 }, { plugin, online: false, storage: mem() })).toEqual({ ok: false, reason: 'offline' })
    expect(plugin.forecast).not.toHaveBeenCalled()
  })
  it('hata önbelleği bozmaz', async () => {
    const s = mem({ [SKY_CACHE_KEY]: JSON.stringify(young) })
    const r = await fetchWeather({ lat: 38.3, lon: 27.1 }, { plugin: { forecast: async () => { throw new Error('x') } }, storage: s })
    expect(r).toEqual({ ok: false, reason: 'error' })
    expect(loadCache(s)).toEqual(young)
  })
})

describe('iOS 15 ve web', () => {
  it('iOS 15 ve web: hava yok (bölüm görünmez)', () => {
    expect(skySupported({ native: true, iosMajor: 15 })).toBe(false)
    expect(skySupported({ native: false, iosMajor: 17 })).toBe(false)
    expect(skySupported({ native: true, iosMajor: 16 })).toBe(true)
    expect(skyState({ supported: false, online: true, cache: null })).toEqual({ kind: 'hidden' })
  })
  it('eklenti yoksa ya da iOS 15 bildirirse kullanılamaz', async () => {
    expect(await skyAvailable({ isAvailable: async () => ({ available: true, iosMajor: 15 }) }, true)).toBe(false)
    expect(await skyAvailable({ isAvailable: async () => { throw new Error('UNIMPLEMENTED') } }, true)).toBe(false)
    expect(await skyAvailable({ isAvailable: async () => ({ available: true, iosMajor: 17 }) }, true)).toBe(true)
    expect(await skyAvailable({ isAvailable: async () => ({ available: true, iosMajor: 17 }) }, false)).toBe(false)
  })
  it('Swift yanıtı { available, iosMajor } ya da yalnız { available } (eski derleme) kabul edilir', async () => {
    expect(await skyAvailable({ isAvailable: async () => ({ available: true }) }, true)).toBe(true)
    expect(await skyAvailable({ isAvailable: async () => ({ available: false, iosMajor: 15 }) }, true)).toBe(false)
    expect(await skyAvailable({ isAvailable: async () => ({ available: false }) }, true)).toBe(false)
  })
  it('konum izni: yuvarlanmış konum ve kesinlik; web/ret → konum yok', async () => {
    const plugin = { requestLocation: vi.fn(async () => ({ status: 'granted', accuracy: 'reduced', lat: 41.0082, lon: 28.9784 })) }
    expect(await requestLocation(plugin, true)).toEqual({ status: 'granted', accuracy: 'reduced', pos: { lat: 41.01, lon: 28.98 } })
    // precise: true → Swift, kişi kesin konumu açtıysa 'full' döndürebilir (G yolu); açmadıysa yaklaşık kalır
    expect(plugin.requestLocation).toHaveBeenCalledWith({ precise: true })
    const full = { requestLocation: async () => ({ status: 'granted', accuracy: 'full', lat: 38.3182, lon: 27.1321 }) }
    expect(await requestLocation(full, true)).toEqual({ status: 'granted', accuracy: 'full', pos: { lat: 38.32, lon: 27.13 } })
    expect(await requestLocation({ requestLocation: async () => ({ status: 'notDetermined' }) }, true)).toEqual({ status: 'unavailable', accuracy: null, pos: null })
    expect(await requestLocation({ requestLocation: async () => ({ status: 'denied' }) }, true)).toEqual({ status: 'denied', accuracy: null, pos: null })
    expect((await requestLocation(plugin, false)).pos).toBeNull()
  })
})

describe('90 günlük özet ve rıza kapanınca silme', () => {
  it('günde tek kayıt, 90 günden eskisi atılır', () => {
    const s = mem()
    const now = at('2026-10-01T12:00:00Z')
    recordDay({ date: '2026-06-01', hi: 30 }, { storage: s, now })
    recordDay({ date: '2026-09-30', hi: 25 }, { storage: s, now })
    recordDay({ date: '2026-09-30', hi: 26 }, { storage: s, now })
    expect(loadDays(s)).toEqual([{ date: '2026-09-30', hi: 26 }])
  })
  it('İzin kapanınca il ve ilçe adı, önbellek ve hava özeti silinir; başka veri kalır', () => {
    const now = at('2026-10-01T09:00:00Z')
    const full = () => mem({ [SKY_PLACE_KEY]: '{"il":"İzmir","ilce":"Gaziemir"}', [SKY_CACHE_KEY]: '{"at":"x","data":{}}', [SKY_DAYS_KEY]: '[]', 'gozolcum:v1': '{}' })
    const granted = recordConsent(null, 'weather', true, now)
    const s1 = full()
    expect(enforceWeatherConsent(granted, s1)).toBe(false)
    expect(s1.getItem(SKY_PLACE_KEY)).not.toBeNull()
    const s2 = full()
    expect(enforceWeatherConsent(recordConsent(granted, 'weather', false, now), s2)).toBe(true)
    expect([...s2.m.keys()]).toEqual(['gozolcum:v1'])
    const s3 = full()
    expect(enforceWeatherConsent(null, s3)).toBe(true)
    expect(s3.getItem(SKY_CACHE_KEY)).toBeNull()
    const s4 = full(); clearSkyData(s4)
    expect([...s4.m.keys()]).toEqual(['gozolcum:v1'])
  })
})

// JS ile SkyPlugin.swift arasındaki sözleşme: sahte eklentiler bu dosyadaki adlarla uyuşmalı
describe('SkyPlugin.swift sözleşmesi', () => {
  const swift = readFileSync(new URL('../../ios/App/App/SkyPlugin.swift', import.meta.url), 'utf8')
  const methods = [...swift.matchAll(/CAPPluginMethod\(name: "(\w+)"/g)].map((m) => m[1])
  it('JS\'in çağırdığı yöntemler Swift\'te kayıtlı', () => {
    for (const m of ['isAvailable', 'requestLocation', 'forecast']) expect(methods).toContain(m)
    expect(methods).not.toContain('weather')
    expect(swift).toMatch(/@objc func forecast\(/)
  })
  it('isAvailable iosMajor döndürür; requestLocation precise okur; yanıt alanları şemayla aynı', () => {
    expect(swift).toMatch(/"iosMajor": ProcessInfo\.processInfo\.operatingSystemVersion\.majorVersion/)
    expect(swift).toMatch(/call\.getBool\("precise"\)/)
    for (const k of ['"fetchedAt"', '"hours"', '"days"', '"now"', '"rain"']) expect(swift).toContain(k)
  })
  it('yalnız "Kullanırken"; ters coğrafi kodlama yok', () => {
    expect(swift).toContain('requestWhenInUseAuthorization')
    const code = swift.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n') // yorumlar hariç
    expect(code).not.toMatch(/requestAlwaysAuthorization\(\)|CLGeocoder\(|MKReverseGeocoding/)
  })
  it('şemaya uymayan yanıt önbelleğe yazılmaz', async () => {
    expect(validForecast({ fetchedAt: 1, hours: [], days: [] })).toBe(true)
    const s = mem()
    const r = await fetchWeather({ lat: 38.3, lon: 27.1 }, { plugin: { forecast: async () => ({ temp: 23 }) }, storage: s })
    expect(r).toEqual({ ok: false, reason: 'error' })
    expect(s.getItem(SKY_CACHE_KEY)).toBeNull()
  })
})

// PLAN.v1 §5.3 resetAll: "Tüm verileri sil" yeni anahtarları siler (App.jsx resetAllData({ keys: SKY_KEYS }))
describe('resetAll: hava anahtarları', () => {
  it('il ve ilçe, önbellek ve günlük özet silinir; öteki anahtar kalır', () => {
    const s = mem({ [SKY_PLACE_KEY]: '{"il":"İzmir","ilce":"Gaziemir"}', [SKY_CACHE_KEY]: '{"at":"x","data":{}}', [SKY_DAYS_KEY]: '[]', 'gozolcum:tema': 'koyu' })
    let settings = { consents: { weather: {} } }
    const store = { get: () => ({ settings }), clearAll: () => { settings = {} }, setSetting: (k, v) => { settings[k] = v } }
    resetAllData({ store, storage: s, keys: SKY_KEYS })
    expect(SKY_KEYS).toEqual([SKY_PLACE_KEY, SKY_CACHE_KEY, SKY_DAYS_KEY])
    expect([...s.m.keys()]).toEqual(['gozolcum:tema'])
    expect(settings).toEqual({})
  })
})
