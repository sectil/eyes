// Gelişim → Görme keskinliği başlığı (VisionSection): S6 ve S5 seri notları görünür; seriye girmeyen kayıtlar
// nedeniyle söylenir ("Farklı koşuldaki" yalnız gözlük/lens koşulunda); Başlangıç/Son 7 gün logMAR'ı E7 ile aynı
// yuvarlamayla (H8).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisionSection, visionHeadLines, visionMetric, currentLabel } from './Progress.jsx'
import { analyzeTrend } from '../lib/trend.js'

const D = (n) => new Date(Date.UTC(2026, 0, 1 + n, 9)).toISOString()
const base = { type: 'va-weekly', eye: 'R', correction: 'none', distanceTracked: true, meanDistanceMm: 400 }
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('Gelişim · görme bölümü başlığı', () => {
  it('ilk v4 testinden sonra: "Ölçüm yöntemi güncellendi; yeni seri." görünür, "Farklı koşuldaki 30" yazmaz', () => {
    const v3 = Array.from({ length: 30 }, (_, n) => ({ ...base, date: D(n), logMAR: 0.1, algorithm: 'descent-zest-v3' }))
    const tests = [...v3, { ...base, date: D(31), logMAR: 0.12, algorithm: 'descent-zest-v4' }]
    const t = text(renderToStaticMarkup(h(VisionSection, { tests, profile: null })))
    expect(t).toContain('Ölçüm yöntemi güncellendi; yeni seri.')
    expect(t).not.toMatch(/Farklı koşuldaki/)
  })

  it('kamerasız seri: "Mesafe ölçülmedi · 40 cm varsayıldı" ve kameralı kayıtlar ayrı cümleyle', () => {
    const cam = Array.from({ length: 4 }, (_, n) => ({ ...base, date: D(n), logMAR: 0.1, algorithm: 'descent-zest-v4' }))
    const tests = [...cam, { ...base, date: D(6), logMAR: 0.1, algorithm: 'descent-zest-v4', distanceTracked: false, meanDistanceMm: null }]
    const t = text(renderToStaticMarkup(h(VisionSection, { tests, profile: null })))
    expect(t).toContain('Mesafe ölçülmedi · 40 cm varsayıldı')
    expect(t).toContain('Kamerayla yapılan 4 ölçüm bu seriye girmiyor.')
    expect(t).not.toMatch(/Farklı koşuldaki/)
  })

  it('gözlük koşulu farkı: yalnız o zaman "Farklı gözlük/lens koşulundaki"', () => {
    const tests = [
      { ...base, date: D(0), logMAR: 0.1, algorithm: 'descent-zest-v4', correction: 'reading' },
      { ...base, date: D(1), logMAR: 0.1, algorithm: 'descent-zest-v4' },
    ]
    const r = analyzeTrend(tests)
    expect(visionHeadLines(r)).toEqual({ lead: 'Tek teste değil, art arda ölçümlere bakıyoruz. Seri: gözlüksüz.', notes: ['Farklı gözlük/lens koşulundaki 1 ölçüm bu seriye girmiyor.'] })
  })

  it('Başlangıç / Son 7 gün: logMAR ve 20/x aynı yuvarlanmış değerden (0,105 → "0,11 · 20/26")', () => {
    expect(visionMetric(0.105)).toEqual({ value: '0,11', snellen: '20/26' })
    expect(visionMetric(-0.105)).toEqual({ value: '−0,11', snellen: '20/16' })
    expect(visionMetric(null)).toEqual({ value: '—', snellen: '' })
  })

  it('boş sayfada ölçülmemiş süre ve yanlış göz listesi yok', () => {
    const t = text(renderToStaticMarkup(h(VisionSection, { tests: [], profile: null })))
    expect(t).toContain('Henüz görme ölçümü yok')
    expect(t).not.toMatch(/Günlük test yaklaşık/)
    const one = text(renderToStaticMarkup(h(VisionSection, { tests: [{ ...base, eye: 'L', date: D(0), logMAR: 0.1, algorithm: 'descent-zest-v4' }], profile: null })))
    expect(one).not.toMatch(/Günlük test sağ, sol ve iki gözü/)
  })

  // Karar 2026-09-29: E testi haftada bir; boş sayfa haftalık testi açar, günlük test önermez
  it('boş sayfa düğmesi "Haftalık testi başlat"', () => {
    const t = text(renderToStaticMarkup(h(VisionSection, { tests: [], profile: null, onStart: () => {} })))
    expect(t).toContain('Haftalık testi başlat')
    expect(t).not.toMatch(/Günlük test/)
    // İlk test alışmadır; "ilk ölçümün başlangıç noktası olur" denmez (inceleme 2026-09-29)
    expect(t).toContain('İlk test alışmadır; sonraki 3 haftalık test, sonuçlarını karşılaştıracağımız başlangıç değerini oluşturur.')
    expect(t).not.toMatch(/İlk ölçümün, sonraki sonuçları/)
  })

  // Bug 26: haftalık testte son testten 7 gün geçince "Son 7 gün" kutusu "—" kalıyordu; uyarı ve metin son 3 testin
  // ortancasıyla sürüyordu. Kutu karşılaştırılan değeri ve doğru etiketi yazar (exportData.js ile aynı).
  it('haftalık seride son testten 8 gün sonra kutu "Son 3 test" ve değeri yazar ("—" değil)', () => {
    const tests = Array.from({ length: 6 }, (_, k) => ({ ...base, date: D(7 * k), logMAR: 0.1, algorithm: 'descent-zest-v4' }))
    const late = analyzeTrend(tests, D(7 * 5 + 8))
    expect(late).toMatchObject({ phase: 'tracking', current7: null, current: 0.1, currentWindow: 'last3' })
    expect(currentLabel(late)).toBe('Son 3 test')
    // Seyrek seride (son 7 günde 3 test yok) test yeni olsa da "Son 3 test": değer tek teste atlamaz (inceleme 2026-09-29)
    expect(currentLabel(analyzeTrend(tests, D(7 * 5 + 2)))).toBe('Son 3 test')
    // Sık seride (son 7 günde 3 test) "Son 7 gün"
    const dense = [...tests, ...[1, 2].map((n) => ({ ...base, date: D(7 * 5 + n), logMAR: 0.1, algorithm: 'descent-zest-v4' }))]
    expect(currentLabel(analyzeTrend(dense, D(7 * 5 + 2)))).toBe('Son 7 gün')
  })
})
