// Yoga ekran metinleri: sağlık iddiası yok, güvenlik metinleri modul.md §2.2, §2.7, §2.8 ve §10.3'teki biçimde.
import { describe, it, expect } from 'vitest'
import { YT, capFirst, listTr } from './text.js'

const strings = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [])

describe('yoga metinleri', () => {
  it('sağlık iddiası ve kanıt iddiası yok', () => {
    for (const t of strings(YT)) expect(t).not.toMatch(/iyileştirir|stres(ini)? azalt|kanıtland|tedavi eder|garanti|uyutur/i)
  })
  it('güvenlik kartı: §10.3 düzeltmeleri (başlıklar "bitirebilirsin" ve "açma", "kendi hâline")', () => {
    const [a, b] = YT.safety.items
    expect(a.h).toBe('İstediğin an dersi bitirebilirsin.')
    expect(a.p).toContain('nefesini kendi hâline bırakabilirsin')
    expect(a.p).toContain('Dersi yarıda bırakmak da pratiğin bir parçası.')
    expect(b.h).toBe('Araç kullanırken açma.')
    expect(YT.safety.items).toHaveLength(5)
  })
  it('"Çok" cevabı iki biçimde: yalnız durdurana "durman doğruydu"; "sürüm" yok', () => {
    expect(YT.hard.muchStopped).toContain('durman doğruydu')
    expect(YT.hard.muchFinished).not.toContain('durman doğruydu')
    for (const t of [YT.hard.muchStopped, YT.hard.muchFinished]) {
      expect(t).toContain('daha kısa bir süre seçebilir, gözlerini açık tutabilirsin')
      expect(t).not.toContain('sürüm')
      expect(t).toMatch(/Acil durumda 112\.$/)
    }
  })
  it('"Çok" cevabı, dersin daha kısa süresi yokken: onaylı metinden yalnız "daha kısa bir süre seçebilir," çıkar', () => {
    expect(YT.hard.muchStoppedNoShorter).toBe(YT.hard.muchStopped.replace('daha kısa bir süre seçebilir, ', ''))
    expect(YT.hard.muchFinishedNoShorter).toBe(YT.hard.muchFinished.replace('daha kısa bir süre seçebilir, ', ''))
    for (const t of [YT.hard.muchStoppedNoShorter, YT.hard.muchFinishedNoShorter]) expect(t).not.toContain('daha kısa')
  })
  it('Türkçe sıralama: son öğeden önce "ve"', () => {
    expect(listTr([])).toBe('')
    expect(listTr(['imgeleme'])).toBe('imgeleme')
    expect(listTr(['niyet', 'imgeleme'])).toBe('niyet ve imgeleme')
    expect(listTr(['niyet', 'imgeleme', 'niyete dönüş'])).toBe('niyet, imgeleme ve niyete dönüş')
  })
  it('akşam satırı dersin adını söyler; tek saat eşiği', () => {
    expect(YT.detail.evening).toBe('Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir.')
    expect(YT.detail.added(15, 'imgeleme')).toBe('15 dakikada imgeleme eklendi')
  })
  it('Türkçe büyük harf', () => {
    expect(capFirst('işlem')).toBe('İşlem')
    expect(capFirst('beden gerginliği')).toBe('Beden gerginliği')
  })
})
