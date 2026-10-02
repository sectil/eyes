import { describe, it, expect } from 'vitest'
import { setupText } from './setupText.js'
import { IRIS_ORDER } from './iris.js'
import { STRESS_NOW, SELF_AGREE } from './profile.js'

describe('kurulum yazıları', () => {
  const T = setupText('tr')
  it('7 alanın adı ve "ne zaman dolacak" yazısı var; bilinmeyen dil Türkçeye düşer', () => {
    for (const d of IRIS_ORDER) {
      expect(T.domains[d], d).toMatch(/\S/)
      expect(T.later[d], d).toMatch(/\S/)
    }
    expect(setupText('xx')).toBe(T)
  })
  it('hücre değerleri her cevap için yazı üretir', () => {
    STRESS_NOW.forEach((_, v) => expect(T.cell.calm(v)).toMatch(/\S/))
    SELF_AGREE.forEach((_, v) => expect(T.cell.self(v)).toBe(SELF_AGREE[v]))
    expect(T.cell.calm(0)).toBe('Stres yok')
    expect(T.cell.wellbeing(6)).toBe('Uyku 6/10')
    expect(T.cell.body(0)).toBe('0 gün hareket')
    expect(T.cell.eye(6)).toBe('6 kırpma')
  })
  it('ad yoksa başlık adsız kurulur; deneme çizgisi 3 adım', () => {
    expect(T.plan.title('')).not.toMatch(/^,/)
    expect(T.plan.title('Deniz')).toMatch(/^Deniz, /)
    expect(T.paywall.trial(5, 7)).toHaveLength(3)
    expect(T.paywall.trialTitle(7)).toMatch(/^7 gün/)
  })
})
