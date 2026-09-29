// Gelişim → Görme keskinliği başlığı (VisionSection): S6 ve S5 seri notları görünür; seriye girmeyen kayıtlar
// nedeniyle söylenir ("Farklı koşuldaki" yalnız gözlük/lens koşulunda); Başlangıç/Son 7 gün logMAR'ı E7 ile aynı
// yuvarlamayla (H8).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisionSection, visionHeadLines, visionMetric } from './Progress.jsx'
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
    expect(visionHeadLines(r)).toEqual({ lead: 'Tek güne değil, haftalık eğilime bakıyoruz. Seri: gözlüksüz.', notes: ['Farklı gözlük/lens koşulundaki 1 ölçüm bu seriye girmiyor.'] })
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
})
