// B2 hava ekranları: R katmanlı rıza, K il/ilçe, G onay (PLAN.v1 §3.B.1; tasarım b2-tasarim/, 5sn-b2.md).
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
const { default: SkyConsent, splitFirst } = await import('./SkyConsent.jsx')
const { default: SkyPlace } = await import('./SkyPlace.jsx')
const { default: SkyConfirm } = await import('./SkyConfirm.jsx')
const { CONSENTS } = await import('../lib/consent.js')

async function mount(el) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(el))
  const all = () => document.body
  const btns = (pred) => all().querySelectorAll((n) => n.nodeName === 'BUTTON' && pred(n))
  const btn = (label) => btns((n) => n.textContent.trim() === label || n.getAttribute('aria-label') === label)[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${all().textContent}`); await act(async () => b.click()) }
  return { btn, btns, tap, text: () => all().textContent, all }
}

describe('R · katmanlı weather rızası', () => {
  const w = CONSENTS.weather
  it('ilk ekranda başlık, giriş, her bölümün ilk cümlesi, kutu ve iki düğme; kalanlar kapalı', async () => {
    const v = await mount(h(SkyConsent, { onAnswer: () => {}, portal: false }))
    expect(v.text()).toContain(w.title)
    expect(v.text()).toContain(w.lead)
    expect(v.text()).toContain(w.check)
    for (const [, t] of w.facts) {
      const [first, rest] = splitFirst(t)
      expect(v.text()).toContain(first)
      if (rest) expect(v.text()).not.toContain(rest.trim())
    }
    expect(v.text()).toContain('Önce kutuyu işaretle')
  })
  it('not 1: yurt dışı bilgisi ("Nerede durur?") ilk satırda; not 3: dört satırın hepsinde açılır ok', async () => {
    const v = await mount(h(SkyConsent, { onAnswer: () => {}, portal: false }))
    const rows = v.btns((n) => n.getAttribute('aria-expanded') != null)
    expect(rows.map((r) => r.textContent)).toEqual(['Nerede durur?', 'Ne kaydedilir?', 'Ne işe yarar?', 'Ne kadar kalır?'])
    expect(rows.every((r) => r.querySelectorAll((n) => n.nodeName === 'svg').length === 1)).toBe(true)
  })
  it('dokununca bölümün kalanı aynı paragrafta açılır; metin harfi harfine', async () => {
    const v = await mount(h(SkyConsent, { onAnswer: () => {}, portal: false }))
    await v.tap('Ne kadar kalır?')
    const full = w.facts.find((f) => f[0] === 'Ne kadar kalır?')[1]
    const p = v.all().querySelectorAll((n) => n.nodeName === 'P' && n.textContent === full)
    expect(p).toHaveLength(1)
    expect(v.btn('Ne kadar kalır?').getAttribute('aria-expanded')).toBe('true')
  })
  it('kutu işaretsizken "İzin ver" çalışmaz; "Şimdi değil" false döner', async () => {
    const got = []
    const v = await mount(h(SkyConsent, { onAnswer: (g) => got.push(g), portal: false }))
    expect(v.btn('İzin ver').getAttribute('aria-disabled')).toBe('true')
    await v.tap('İzin ver')
    expect(got).toEqual([])
    await v.tap('Şimdi değil')
    expect(got).toEqual([false])
  })
})

describe('K · il ve ilçe', () => {
  it('yaklaşık konum: il bulundu, "yaklaşık" etiketi, ilçe listeden; ilçe önerisi yok', async () => {
    let got = null
    const v = await mount(h(SkyPlace, { il: 'İzmir', approx: true, onPick: (p) => { got = p }, onBack: () => {} }))
    expect(v.text()).toContain("İzmir'i buldum. Hangi ilçedesin?")
    expect(v.text()).toContain('yaklaşık')
    expect(v.text()).toContain('Telefonda yalnız il ve ilçe adı kalır.')
    const items = v.btns((n) => n.getAttribute('role') === 'listitem').map((n) => n.textContent)
    expect(items[0]).toBe('Yalnız İzmir')
    expect(items).toContain('Gaziemir')
    await v.tap('Gaziemir')
    expect(got).toEqual({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
  })
  it('"Yalnız İzmir" ilçesiz devam eder', async () => {
    let got = null
    const v = await mount(h(SkyPlace, { il: 'İzmir', approx: true, onPick: (p) => { got = p }, onBack: () => {} }))
    await v.tap('Yalnız İzmir')
    expect(got).toEqual({ il: 'İzmir', ilce: null, approx: true })
  })
  it('konum yok: önce il listesi (yer tutuculu soru), il seçilince ilçeler', async () => {
    const v = await mount(h(SkyPlace, { il: null, onPick: () => {}, onBack: () => {} }))
    expect(v.text()).toContain('[[sky.place.ilSor]]')
    expect(v.btns((n) => n.getAttribute('role') === 'listitem')).toHaveLength(81)
    await v.tap('Bursa')
    expect(v.text()).toContain('Hangi ilçedesin?')
    expect(v.text()).not.toContain('yaklaşık')
    expect(v.btn('Mustafakemalpaşa')).toBeTruthy()
  })
})

describe('G · "…\'de misin?"', () => {
  it('soru, yer (il, ilçe), neden satırı, iki düğme', async () => {
    const got = []
    const v = await mount(h(SkyConfirm, { place: { il: 'İzmir', ilce: 'Gaziemir' }, onYes: () => got.push('evet'), onOther: () => got.push('baska') }))
    expect(v.text()).toContain("Gaziemir'de misin?")
    expect(v.text()).toContain('İzmir Gaziemir')
    expect(v.text()).toContain('Konumuna en yakın ilçe merkezi bu.')
    expect(v.text()).toContain('Konumunun kendisi saklanmaz.')
    await v.tap('Evet'); await v.tap('Başka ilçe')
    expect(got).toEqual(['evet', 'baska'])
  })
  it('uzun ilçe adı (≥ 11 harf): soru küçük boyda', async () => {
    const v = await mount(h(SkyConfirm, { place: { il: 'Bursa', ilce: 'Mustafakemalpaşa' }, onYes: () => {}, onOther: () => {} }))
    const t = v.all().querySelectorAll((n) => n.nodeName === 'H1')[0]
    expect(t.className).toContain('uzun')
    expect(t.textContent).toBe("Mustafakemalpaşa'da mısın?")
    const s = await mount(h(SkyConfirm, { place: { il: 'İzmir', ilce: 'Gaziemir' }, onYes: () => {}, onOther: () => {} }))
    expect(s.all().querySelectorAll((n) => n.nodeName === 'H1')[0].className).not.toContain('uzun')
  })
})
