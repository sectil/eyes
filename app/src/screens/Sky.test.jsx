// Hava sayfası (screens/Sky.jsx; PLAN.v1 §3.B.3, tasarım "07 Hava sayfası") ve akış kararları (lib/skyFlow.js).
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
globalThis.localStorage = storage
const { createRoot } = await import('react-dom/client')
const { default: Sky } = await import('./Sky.jsx')
const { SKY_CACHE_KEY, SKY_TEXT } = await import('../lib/sky.js')
const { hourStrip, rainSpan, nefLine, todayRange, skyWord, iconKey, loadAttribution, ATTR_FALLBACK } = await import('../lib/skyView.js')
const { skyEntry, afterLocation } = await import('../lib/skyFlow.js')

const NOW = new Date(2026, 9, 1, 12, 41)
const at = (hh) => new Date(2026, 9, 1, hh, 0).getTime()
const CH = { 12: 0, 13: 0.05, 14: 0.05, 15: 0.05, 16: 0.1, 17: 0.1, 18: 0.2, 19: 0.3, 20: 0.45, 21: 0.7, 22: 0.6, 23: 0.2 }
const HOURS = Array.from({ length: 30 }, (_, i) => {
  const t = at(12) + i * 3600000
  const hr = new Date(t).getHours()
  return { at: t, tempC: 23 - Math.min(i, 5) * 0.4, precipChance: CH[hr] ?? 0, symbol: 'cloud.sun' }
})
const FORECAST = {
  fetchedAt: NOW.getTime(), lat: 38.32, lon: 27.16,
  now: { at: at(12), tempC: 23.2, apparentC: 24.1, precipChance: 0, symbol: 'cloud.sun', isDaylight: true },
  hours: HOURS, days: [{ date: '2026-10-01', highC: 26.4, lowC: 17.1, precipChance: 0.7, symbol: 'cloud.rain' }],
}
const ATTR = { serviceName: 'Apple Weather', legalPageURL: 'https://weatherkit.apple.com/legal-attribution.html', combinedMarkLightURL: 'https://weatherkit.apple.com/assets/branding/en/Apple_Weather_blk_en_3X_090122.png', combinedMarkDarkURL: 'https://weatherkit.apple.com/assets/branding/en/Apple_Weather_wht_en_3X_090122.png', squareMarkURL: 'https://x/sq.png' }
const PLACE = { il: 'İzmir', ilce: 'Gaziemir' }

function fakePlugin({ available = true, iosMajor = 17, forecast = FORECAST, fail = false } = {}) {
  const calls = []
  return {
    calls,
    isAvailable: async () => ({ available, iosMajor }),
    forecast: async (a) => { calls.push(a); if (fail) throw new Error('WEATHER'); return JSON.parse(JSON.stringify(forecast)) },
    attribution: async () => ATTR,
  }
}

async function mount(props) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(h(Sky, { place: PLACE, onBack: () => {}, onChange: () => {}, ...props })))
  await act(async () => { await new Promise((r) => setTimeout(r, 0)) })
  const all = () => document.body
  const q = (pred) => all().querySelectorAll(pred)
  const btn = (label) => q((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  return { text: () => all().textContent, q, btn }
}
const deps = (over = {}) => ({ native: true, online: true, now: () => NOW, storage, ...over })

describe('görünüm hesapları (lib/skyView.js)', () => {
  it('şerit şimdiki saatten 24 saat; ilk sütun "Şimdi"; olasılık yüzdesi, sıfırda —', () => {
    const s = hourStrip(HOURS, NOW)
    expect(s).toHaveLength(24)
    expect(s[0]).toMatchObject({ label: 'Şimdi', temp: '23°', chanceText: '—', now: true })
    expect(s[3]).toMatchObject({ label: '15', chanceText: '5%', chance: 5 })
    expect(s[9]).toMatchObject({ label: '21', chance: 70 })
  })
  it('yağmur aralığı saatlerden: 21.00–23.00 (eşik 0,5); Nef satırı onaylı kalıp', () => {
    expect(rainSpan(HOURS, NOW)).toEqual({ from: '21.00', to: '23.00' })
    expect(nefLine(HOURS, NOW)).toBe('21.00–23.00 arası yağmur bekleniyor.')
  })
  it('bayat önbellekte geçmişteki yağmur sayılmaz; yağmursuz gün Nef kartı yok (onaylı metin yok)', () => {
    const late = new Date(2026, 9, 1, 23, 30)
    expect(rainSpan(HOURS, late)).toBeNull()
    expect(nefLine(HOURS, late)).toBeNull()
  })
  it('en yüksek, en düşük; gökyüzü sözcüğü yalnız tasarımdaki, gerisi boş (ham anahtar yok)', () => {
    expect(todayRange(FORECAST.days, NOW)).toEqual({ high: '26°', low: '17°' })
    expect(skyWord('cloud.sun.fill')).toBe('Parçalı bulutlu')
    expect(skyWord('sun.max')).toBe('')
    expect(iconKey('cloud.bolt.rain')).toBe('bolt')
    expect(iconKey('sun.max')).toBe('sun')
  })
  it('atıf: eklenti düşerse bilinen yasal sayfa ve "Apple Weather" kalır', async () => {
    expect(await loadAttribution({ attribution: async () => { throw new Error('x') } })).toEqual({ ...ATTR_FALLBACK })
    const a = await loadAttribution({ attribution: async () => ATTR })
    expect(a.markLight).toBe(ATTR.combinedMarkLightURL)
    expect(a.legalPageURL).toBe(ATTR.legalPageURL)
  })
})

describe('hava sayfası (07)', () => {
  it('canlı: yer + Değiştir, büyük sıcaklık, hissedilen, gökyüzü, yaş; Nef; 24 saat; en yüksek/düşük; atıf', async () => {
    mem.clear()
    const plugin = fakePlugin()
    const v = await mount({ deps: deps({ plugin }) })
    const t = v.text()
    expect(t).toContain('İzmir Gaziemir')
    expect(v.btn('Değiştir')).toBeTruthy()
    expect(t).toContain('23°')
    expect(t).toContain('Hissedilen 24°')
    expect(t).toContain('Parçalı bulutlu')
    expect(t).toContain("12.41'de alındı")
    expect(t).toContain('21.00–23.00 arası yağmur bekleniyor.')
    expect(v.q((n) => n.getAttribute?.('role') === 'listitem')).toHaveLength(24)
    expect(t).toContain('en yüksek')
    expect(t).toContain('26°')
    expect(t).toContain('Veri kaynakları')
    const link = v.q((n) => n.nodeName === 'A')[0]
    expect(link.getAttribute('href')).toBe(ATTR.legalPageURL)
    expect(v.q((n) => n.nodeName === 'IMG').map((n) => n.getAttribute('alt'))).toEqual(['Apple Weather', 'Apple Weather'])
    expect(t).not.toMatch(/\bay\b|Ay evresi|gün batımı/i) // 5 sn: "küçülen şişkin ay" gereksiz
  })
  it('gizlilik: istek ilçe merkezinin kamusal noktasıyla (2 ondalık); önbellekte koordinat yok', async () => {
    mem.clear()
    const plugin = fakePlugin()
    await mount({ deps: deps({ plugin }) })
    expect(plugin.calls).toHaveLength(1)
    const { lat, lon } = plugin.calls[0]
    expect(Math.round(lat * 100) / 100).toBe(lat)
    expect(Math.round(lon * 100) / 100).toBe(lon)
    const c = JSON.parse(mem.get(SKY_CACHE_KEY))
    expect(c.data).not.toHaveProperty('lat')
    expect(c.data).not.toHaveProperty('lon')
  })
  it('önbellek bir saatten gençse yeni istek yok', async () => {
    mem.clear()
    mem.set(SKY_CACHE_KEY, JSON.stringify({ at: new Date(NOW.getTime() - 20 * 60000).toISOString(), data: FORECAST }))
    const plugin = fakePlugin()
    const v = await mount({ deps: deps({ plugin }) })
    expect(plugin.calls).toHaveLength(0)
    expect(v.text()).toContain("12.21'de alındı")
  })
  it('çevrimdışı, önbellek < 12 sa: son veri ve yaşı; istek yok', async () => {
    mem.clear()
    mem.set(SKY_CACHE_KEY, JSON.stringify({ at: new Date(2026, 9, 1, 8, 10).toISOString(), data: FORECAST }))
    const plugin = fakePlugin()
    const v = await mount({ deps: deps({ plugin, online: false }) })
    expect(plugin.calls).toHaveLength(0)
    expect(v.text()).toContain("08.10'da alındı")
    expect(v.text()).toContain('Hissedilen')
  })
  it('çevrimdışı, önbellek yok: onaylı metin', async () => {
    mem.clear()
    const v = await mount({ deps: deps({ plugin: fakePlugin(), online: false }) })
    expect(v.text()).toContain(SKY_TEXT.offline)
    expect(v.text()).not.toContain('Hissedilen')
  })
  it('WeatherKit hatası, önbellek yok: onaylı metin; atıf kalır', async () => {
    mem.clear()
    const v = await mount({ deps: deps({ plugin: fakePlugin({ fail: true }) }) })
    expect(v.text()).toContain(SKY_TEXT.error)
    expect(v.text()).toContain('Veri kaynakları')
  })
  it('iOS 15 (WeatherKit yok): sade yer tutucu; istek, atıf, anahtar yok', async () => {
    mem.clear()
    const plugin = fakePlugin({ available: false, iosMajor: 15 })
    const v = await mount({ deps: deps({ plugin }), morning: { on: false, delayMin: 10 }, onMorning: () => {} })
    expect(v.text()).toContain('[[sky.ios15]]')
    expect(plugin.calls).toHaveLength(0)
    expect(v.text()).not.toContain('Veri kaynakları')
    expect(v.text()).not.toContain('Sabah havası')
  })
  it('Değiştir ve Sabah havası anahtarı', async () => {
    mem.clear()
    const got = []
    const v = await mount({ deps: deps({ plugin: fakePlugin() }), onChange: () => got.push('degistir'), morning: { on: false, delayMin: 20 }, onMorning: (on) => got.push(on) })
    expect(v.text()).toContain("Alarmından 20 dk sonra, Nef'in yorumuyla")
    await act(async () => v.btn('Değiştir').click())
    await act(async () => v.btn('Sabah havası').click())
    expect(got).toEqual(['degistir', true])
  })
})

describe('akış (lib/skyFlow.js; sahip kararı: il ve ilçe kendiliğinden)', () => {
  it('giriş: rıza yok → rıza; rıza + yer → hava sayfası; rıza, yer yok → konum', () => {
    expect(skyEntry({ consent: false, place: PLACE })).toBe('consent')
    expect(skyEntry({ consent: true, place: PLACE })).toBe('sky')
    expect(skyEntry({ consent: true, place: null })).toBe('locate')
    expect(skyEntry({ consent: true, place: PLACE, mode: 'list' })).toBe('list')
  })
  it('izin var (yaklaşık ya da kesin): il + en yakın ilçe, onay adımı yok, koordinat yok', () => {
    for (const accuracy of ['reduced', 'full']) {
      const r = afterLocation({ status: 'granted', accuracy, pos: { lat: 38.31, lon: 27.15 } })
      expect(r).toEqual({ place: { il: 'İzmir', ilce: 'Gaziemir', approx: false } })
    }
  })
  it('izin yok ya da konum yok → liste', () => {
    expect(afterLocation({ status: 'denied', accuracy: null, pos: null })).toEqual({ list: true })
    expect(afterLocation({ status: 'granted', accuracy: 'reduced', pos: null })).toEqual({ list: true })
    expect(afterLocation(null)).toEqual({ list: true })
  })
})

describe('inceleme düzeltmeleri (şimdi, atıf, yeniden plan)', () => {
  it('bayat önbellek: büyük sıcaklık eski "now"dan değil, şimdiyi içeren saat satırından (şerit "Şimdi" ile aynı)', async () => {
    const { nowView } = await import('../lib/skyView.js')
    const later = new Date(2026, 9, 1, 15, 20)
    const row = HOURS.find((r) => r.at === at(15))
    expect(nowView(FORECAST, later)).toMatchObject({ temp: `${Math.round(row.tempC)}°`, feels: null })
    expect(hourStrip(FORECAST.hours, later)[0]).toMatchObject({ label: 'Şimdi', temp: `${Math.round(row.tempC)}°` })
    expect(nowView(FORECAST, NOW)).toMatchObject({ temp: '23°', feels: '24°' }) // canlı: now aynı saatte
  })
  it('atıf: yalnız bir işaret geçerliyse öteki temada metin işaret kalır', async () => {
    mem.clear()
    const plugin = { ...fakePlugin(), attribution: async () => ({ ...ATTR, combinedMarkDarkURL: 'http://x/d.png' }) }
    const v = await mount({ deps: deps({ plugin }) })
    expect(v.q((n) => n.nodeName === 'IMG')).toHaveLength(1)
    const d = v.q((n) => n.nodeName === 'SPAN' && n.className === 'wx-mark-d')
    expect(d).toHaveLength(1)
    expect(d[0].textContent).toBe('Apple Weather')
  })
  it('yeni veri alınınca onFetched (App: plan yeniden kurulur); taze önbellekte çağrılmaz', async () => {
    mem.clear()
    let n = 0
    await mount({ onFetched: () => { n += 1 }, deps: deps({ plugin: fakePlugin() }) })
    expect(n).toBe(1)
    await mount({ onFetched: () => { n += 1 }, deps: deps({ plugin: fakePlugin() }) })
    expect(n).toBe(1)
  })
  it('yerin noktası yoksa iskelette kalmaz: hata metni', async () => {
    mem.clear()
    const v = await mount({ place: { il: 'Yok', ilce: null }, deps: deps({ plugin: fakePlugin() }) })
    expect(v.text()).toContain(SKY_TEXT.error)
  })
})
