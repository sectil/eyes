// Ana sayfa · ilk görünümde hava hapı (D9): ilçe, sıcaklık ve yağmurun başladığı saat; önbellek yoksa ya da eskiyse yok.
import { describe, it, expect } from 'vitest'
import { skyChipView, atHour } from './SkyChip.jsx'

const NOW = new Date(2026, 8, 30, 10, 0, 0)
const H = 3600000
const cache = (rainAt = 21, age = 0) => {
  const h0 = new Date(NOW).setMinutes(0, 0, 0)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const at = h0 + i * H
    return { at, tempC: 20, precipChance: new Date(at).getHours() === rainAt ? 0.7 : 0.05, symbol: 'cloud.sun' }
  })
  return { at: new Date(NOW.getTime() - age * H).toISOString(), data: { fetchedAt: NOW.getTime(), now: { at: NOW.getTime(), tempC: 23, symbol: 'cloud.sun' }, hours, days: [] } }
}

describe('skyChipView', () => {
  it('ilçe, sıcaklık ve yağmur saati', () => {
    expect(skyChipView({ il: 'İzmir', ilce: 'Gaziemir' }, cache(), NOW)).toMatchObject({ name: 'Gaziemir', temp: '23°', rain: "21.00'de yağmur", icon: 'rain' })
  })
  it('saatin eki okunduğu gibi', () => {
    expect(['00.00', '06.00', '10.00', '13.00', '16.00', '20.00', '21.00', '23.00'].map(atHour)).toEqual(["00.00'da", "06.00'da", "10.00'da", "13.00'te", "16.00'da", "20.00'de", "21.00'de", "23.00'te"])
  })
  it('ilçe yoksa il; yağmur yoksa yalnız sıcaklık', () => {
    expect(skyChipView({ il: 'İzmir' }, cache(null), NOW)).toMatchObject({ name: 'İzmir', rain: null })
  })
  it('önbellek yok ya da 12 saatten eski: hap yok', () => {
    expect(skyChipView({ il: 'İzmir' }, null, NOW)).toBeNull()
    expect(skyChipView({ il: 'İzmir' }, cache(21, 13), NOW)).toBeNull()
  })
})
