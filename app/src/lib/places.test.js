import { describe, it, expect } from 'vitest'
import { nearestPlace, suggestFromLocation, placeFromLocation, ilceList, searchIlce, placePoint, placeLabel, savePlace, loadPlace, clearPlace, normalizePlace, SKY_PLACE_KEY, confirmQuestion, locative, accusative } from './places.js'
import { PLACES, ILLER } from './places.data.js'

function mem(init = {}) {
  const m = new Map(Object.entries(init))
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }
}
// Küçük örnek tablo: tablo üretimine bağlı kalmadan kurallar
const SAMPLE = [
  { il: 'İzmir', ilce: 'Gaziemir', lat: 38.311, lon: 27.1518 },
  { il: 'İzmir', ilce: 'Buca', lat: 38.3481, lon: 27.2505 },
  { il: 'İzmir', ilce: 'Konak', lat: 38.4145, lon: 27.1441 },
  { il: 'İzmir', ilce: 'Çeşme', lat: 38.3166, lon: 26.321 },
  { il: 'Bursa', ilce: 'Mustafakemalpaşa', lat: 40.0497, lon: 28.4183 },
]

describe('en yakın ilçe (telefonda)', () => {
  it('Gaziemir yakınındaki nokta → Gaziemir', () => {
    expect(nearestPlace({ lat: 38.32, lon: 27.16 }, SAMPLE).ilce).toBe('Gaziemir')
    expect(nearestPlace({ lat: 38.35, lon: 27.25 }, SAMPLE).ilce).toBe('Buca')
  })
  it('bozuk koordinat → null', () => {
    expect(nearestPlace({ lat: NaN, lon: 1 }, SAMPLE)).toBeNull()
    expect(nearestPlace(null, SAMPLE)).toBeNull()
  })
  it('gerçek tablo: 81 il; Gaziemir ve Mustafakemalpaşa var; ADM2 eki atılmış', () => {
    expect(ILLER).toHaveLength(81)
    expect(PLACES.length).toBeGreaterThan(900)
    expect(nearestPlace({ lat: 38.31, lon: 27.15 }).ilce).toBe('Gaziemir')
    expect(PLACES.some((p) => / İlçesi$/.test(p.ilce))).toBe(false)
    expect(PLACES.find((p) => p.ilce === 'Mustafakemalpaşa').il).toBe('Bursa')
  })
})

describe('onay yalnız kesin konumda', () => {
  it('yaklaşık konum yalnız ili bulur, onay sorulmaz', () => {
    expect(suggestFromLocation({ lat: 38.32, lon: 27.16 }, 'reduced', SAMPLE)).toEqual({ il: 'İzmir', ilce: null, approx: true, confirm: false })
  })
  it('varsayılan yaklaşıktır', () => {
    expect(suggestFromLocation({ lat: 38.32, lon: 27.16 }, undefined, SAMPLE).confirm).toBe(false)
  })
  it('kesin konum en yakın ilçeyi sorar; öneride koordinat yok', () => {
    const s = suggestFromLocation({ lat: 38.32, lon: 27.16 }, 'full', SAMPLE)
    expect(s).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false, confirm: true })
    expect(s).not.toHaveProperty('lat')
  })
})

describe('kendiliğinden yer (sahip kararı 2026-10-01): yaklaşık konumda da en yakın ilçe', () => {
  it('yaklaşık konum il ve en yakın ilçe merkezini seçer; onay yok, koordinat yok', () => {
    const p = placeFromLocation({ lat: 38.32, lon: 27.16 }, 'reduced', SAMPLE)
    expect(p).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
    expect(p).not.toHaveProperty('lat')
    expect(p).not.toHaveProperty('confirm')
  })
  it('kesin ve varsayılan aynı sonucu verir', () => {
    expect(placeFromLocation({ lat: 38.35, lon: 27.25 }, 'full', SAMPLE)).toEqual({ il: 'İzmir', ilce: 'Buca', approx: false })
    expect(placeFromLocation({ lat: 38.35, lon: 27.25 }, undefined, SAMPLE).ilce).toBe('Buca')
  })
  it('gerçek tablo: yuvarlanmış yaklaşık nokta da ilçe verir ve kaydedilir', () => {
    const p = placeFromLocation({ lat: 38.31, lon: 27.15 }, 'reduced')
    expect(p).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
    expect(normalizePlace(p)).toEqual(p)
  })
  it('bozuk konum → null (liste açılır)', () => {
    expect(placeFromLocation(null, 'reduced', SAMPLE)).toBeNull()
    expect(placeFromLocation({ lat: 999, lon: 1 }, 'full', SAMPLE)).toBeNull()
  })
})

describe('ilçe profile yazılmaz', () => {
  it('yalnız gozolcum:sky-place yazılır; profil kaydı (gozolcum:v1) aynen kalır', () => {
    const profile = JSON.stringify({ version: 1, settings: { profile: { city: 'Ankara' } } })
    const s = mem({ 'gozolcum:v1': profile })
    savePlace({ il: 'İzmir', ilce: 'Gaziemir', approx: false, lat: 38.3, lon: 27.1 }, s)
    expect(s.getItem('gozolcum:v1')).toBe(profile)
    expect([...s.m.keys()].sort()).toEqual(['gozolcum:sky-place', 'gozolcum:v1'])
    expect(JSON.parse(s.getItem(SKY_PLACE_KEY))).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
    expect(loadPlace(s)).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
    clearPlace(s)
    expect(loadPlace(s)).toBeNull()
    expect(s.getItem('gozolcum:v1')).toBe(profile)
  })
  it('tabloda olmayan il/ilçe kaydedilmez; ilçesiz il (Yalnız İzmir) kaydedilir', () => {
    expect(normalizePlace({ il: 'Atlantis' })).toBeNull()
    expect(normalizePlace({ il: 'İzmir', ilce: 'Yok' })).toEqual({ il: 'İzmir', ilce: null, approx: false })
    expect(normalizePlace({ il: 'İzmir', approx: true })).toEqual({ il: 'İzmir', ilce: null, approx: true })
  })
})

describe('liste, arama, kamusal nokta, ad', () => {
  it('ilçe listesi Türkçe sırada; arama aksan duyarsız', () => {
    expect(ilceList('İzmir', SAMPLE)).toEqual(['Buca', 'Çeşme', 'Gaziemir', 'Konak'])
    expect(searchIlce('İzmir', 'cesme', SAMPLE)).toEqual(['Çeşme'])
    expect(searchIlce('İzmir', 'GAZİ', SAMPLE)).toEqual(['Gaziemir'])
    expect(searchIlce('İzmir', '', SAMPLE)).toHaveLength(4)
  })
  it('kamusal nokta: ilçe merkezi, ilçe yoksa ilin merkezi', () => {
    expect(placePoint({ il: 'İzmir', ilce: 'Gaziemir' }, SAMPLE)).toEqual({ lat: 38.311, lon: 27.1518 })
    const il = ILLER.find((i) => i.il === 'İzmir')
    expect(placePoint({ il: 'İzmir', ilce: null })).toEqual({ lat: il.lat, lon: il.lon })
  })
  it('yer adı sırası il, ilçe', () => {
    expect(placeLabel({ il: 'İzmir', ilce: 'Gaziemir' })).toBe('İzmir Gaziemir')
    expect(placeLabel({ il: 'İzmir', ilce: null })).toBe('İzmir')
  })
  it('ekler: bulunma, belirtme ve onay sorusu', () => {
    expect(confirmQuestion('Gaziemir')).toBe("Gaziemir'de misin?")
    expect(confirmQuestion('Mustafakemalpaşa')).toBe("Mustafakemalpaşa'da mısın?")
    expect(locative('Konak')).toBe("Konak'ta")
    expect(locative('Çeşme')).toBe("Çeşme'de")
    expect(accusative('İzmir')).toBe("İzmir'i")
    expect(accusative('Bursa')).toBe("Bursa'yı")
  })
})
