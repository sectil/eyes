// Ana sayfa · hava satırı (components/SkyLine.jsx; B2 tasarımı tpl-home): önbellekten il, ilçe, sıcaklık, yağmur saati,
// atıf; önbellek yoksa ya da eskiyse hiç çizilmez. Home yalnız `sky` verilince çizer (App: SKY_UI + rıza + yer).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SkyLine, { skyLineView } from './SkyLine.jsx'
import Home from '../screens/Home.jsx'
import { SKY_CACHE_KEY } from '../lib/sky.js'

const H = 3600000
const now = new Date(2026, 9, 1, 13, 5)
const hourStart = new Date(2026, 9, 1, 13, 0).getTime()
const hours = Array.from({ length: 24 }, (_, i) => ({ at: hourStart + i * H, tempC: 23, precipChance: i === 8 ? 0.7 : 0.05, symbol: i === 8 ? 'cloud.rain' : 'cloud.sun' }))
const data = { fetchedAt: now.getTime(), hours, days: [{ date: '2026-10-01', highC: 25, lowC: 16, precipChance: 0.7, symbol: 'cloud.rain' }] }
const mem = (v) => { const m = new Map(v ? [[SKY_CACHE_KEY, JSON.stringify(v)]] : []); return { getItem: (k) => m.get(k) ?? null, setItem: (k, x) => m.set(k, x), removeItem: (k) => m.delete(k) } }
const place = { il: 'İzmir', ilce: 'Gaziemir', approx: false }

describe('SkyLine', () => {
  it('il, ilçe, sıcaklık, yağmur saati, atıf ve hava sayfasına giden düğme', () => {
    const html = renderToStaticMarkup(h(SkyLine, { place, now, onOpen: () => {}, deps: { storage: mem({ at: now.toISOString(), data }) } }))
    expect(html).toContain('<span class="wxc-deg">23°</span>')
    expect(html).toContain('<b><span class="il">İzmir </span>Gaziemir</b>')
    expect(html).toContain('21.00–22.00 yağmur bekleniyor')
    expect(html).toContain('Apple Weather')
    expect(html).toContain('>Veri kaynakları</a>')
    expect(html).toContain('class="wxc-main"')
    expect((html.match(/<i class="r"/g) ?? []).length).toBe(1)
  })
  it('önbellek yoksa ya da 12 saatten eskiyse çizilmez', () => {
    expect(renderToStaticMarkup(h(SkyLine, { place, now, deps: { storage: mem(null) } }))).toBe('')
    const old = { at: new Date(now.getTime() - 13 * H).toISOString(), data }
    expect(renderToStaticMarkup(h(SkyLine, { place, now, deps: { storage: mem(old) } }))).toBe('')
    expect(skyLineView(null, { at: now.toISOString(), data }, now)).toBeNull()
  })
  it('ilçe yoksa il adı tek başına (düşmez)', () => {
    const v = skyLineView({ il: 'İzmir', ilce: null }, { at: now.toISOString(), data }, now)
    expect(v.il).toBeNull()
    expect(v.name).toBe('İzmir')
  })
  it('Home: sky verilmezse hava satırı yok', () => {
    const html = renderToStaticMarkup(h(Home, { tests: [], sessions: [], settings: { profile: null, reminders: null, consents: {} }, onStart: () => {} }))
    expect(html).not.toContain('class="wxc"')
  })
})
