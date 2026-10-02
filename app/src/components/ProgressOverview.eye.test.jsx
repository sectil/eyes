// Gelişim → Göz ayrıntısı (DomainDetail 'eye'): kural metni haftalık E testiyle tutarlı (karar 2026-09-29) ve
// karşılaştırılan değerin kutusu son testten bir hafta sonra boş kalmaz (Bug 26).
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DomainDetail } from './ProgressOverview.jsx'

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString()
const base = { type: 'va-weekly', correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4', logMAR: 0.1 }
// 6 haftalık test (her biri sağ, sol, iki göz); sonuncusu 9 gün önce
const tests = [44, 37, 30, 23, 16, 9].flatMap((d) => ['R', 'L', 'OU'].map((eye) => ({ ...base, eye, date: ago(d) })))
const render = () => text(renderToStaticMarkup(h(DomainDetail, { domain: 'eye', tests, sessions: [], onBack: () => {}, onStart: () => {} })))

describe('Gelişim · göz ayrıntısı', () => {
  it('son testten bir hafta sonra kutu "son 3 test" ve değeri yazar', () => {
    const t = render()
    expect(t).toMatch(/0,10 son 3 test/)
    expect(t).not.toMatch(/– son 7 gün/)
  })
  it('kural metni haftalık: art arda 3 test, 22. gün, 7 teste kadar; "birkaç gün daha ölç" yok; kaynaklarda Rosser ve Lim', () => {
    const t = render()
    expect(t).toContain('Sarı: art arda son 3 testin her biri başlangıçtan en az 0,10 kötü → ışığı ve mesafeyi kontrol et; sonraki testlerde de sürerse göz doktoruna danış.')
    // İnceleme 2026-09-29: başlangıç yalnız haftalık testlerden değil (isteğe bağlı kısa testler de girer)
    expect(t).toContain('Başlangıç, ilk haftadan sonraki ilk testlerin ortancasıdır: 3 haftalık test tamamlanınca (en erken 22. gün) hazır olur ve yeni testlerle 7 teste kadar güçlenir.')
    expect(t).toContain('Her gün test edenlerde başlangıç, 8.–21. günlerdeki en az 7 testin ortancasıdır.')
    expect(t).not.toMatch(/birkaç gün daha ölç|başlangıç 8\. günden itibaren en az 7 test/)
    expect(t).not.toMatch(/son 7 günde 3 ya da daha çok test varsa/) // haftalık seri seyrek: sık ölçüm koşulu yazılmaz
    expect(t).toMatch(/Rosser/)
    expect(t).toMatch(/Lim/)
  })
})
