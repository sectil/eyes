// Tek metin işlevi (gelisim-merkezi PLAN.v1 §3.5 madde 4; DENETIM Ö-8, Kü-4, Kü-6)
import { describe, it, expect } from 'vitest'
import { changeText, effectChangeText, signedText, numText, verdictWord, VERDICT_WORD, DIGITS } from './changeText.js'

describe('changeText', () => {
  it('hüküm sözcükleri yalnız dört (DEVIR §1.8)', () => {
    expect(VERDICT_WORD).toEqual({ better: 'başlangıcından iyi', same: 'değişim yok', unclear: 'henüz belli değil', start: 'başlangıç' })
    expect(verdictWord('better', { cap: true })).toBe('Başlangıcından iyi')
    // bilinmeyen hüküm (ör. 'worse') ekranda dört sözcüğün dışına çıkmaz
    expect(verdictWord('worse')).toBe('henüz belli değil')
  })

  it('işaret yuvarlanmış değerden: "−0,0" yok (Kü-4)', () => {
    expect(signedText(-0.02, '', 1)).toBe('0,0')
    expect(signedText(-0.06, '', 1)).toBe('−0,1')
    expect(signedText(1.26, '', 1)).toBe('+1,3')
    expect(signedText(0, 'logMAR')).toBe('0,00')
  })

  it('basamak birimden (Kü-6): aynı birim her yüzeyde aynı', () => {
    expect(DIGITS).toMatchObject({ logMAR: 2, ms: 0 })
    expect(numText(119.5, 'ms')).toBe('120')
    expect(numText(0.2, 'logMAR')).toBe('0,20')
    expect(numText(-0.12, 'logMAR')).toBe('−0,12')
    expect(numText(6, 'harf')).toBe('6')
    expect(numText(5.24, 'harf')).toBe('5,2')
    expect(numText(7080, 'adım')).toBe('7.080')
  })

  it('maketteki çip metinleri (DEVIR §2)', () => {
    expect(changeText({ from: 0.2, to: 0.2, unit: 'logMAR', better: 'down', prefix: 'E testi', showUnit: false }).text).toBe('E testi 0,20 → 0,20')
    expect(changeText({ from: 4, to: 6, unit: 'harf' }).text).toBe('4 → 6 harf')
    expect(changeText({ from: 56, to: 68, unit: '/100', prefix: 'İyi oluş', showUnit: false }).text).toBe('İyi oluş 56 → 68')
    expect(changeText({ to: 56, unit: '/100', prefix: 'İyi oluş', showUnit: false }).text).toBe('İyi oluş 56')
    expect(changeText({ from: 60, to: 75, unit: '%' }).text).toBe('%60 → %75')
    expect(changeText({ from: 3, to: 3.5, unit: '/5' }).text).toBe('3,0 → 3,5/5')
  })

  it('",0" kırpması ifadenin tamamına göre: iki yan aynı basamakla (Kü-6)', () => {
    expect(changeText({ from: 6, to: 5.4, unit: 'harf' }).text).toBe('6,0 → 5,4 harf')
    expect(changeText({ from: 3.7, to: 4, unit: 'harf' }).text).toBe('3,7 → 4,0 harf')
    expect(changeText({ from: 4, to: 6, unit: 'harf' }).text).toBe('4 → 6 harf')
    expect(changeText({ from: 2.8, to: 5, unit: '/5' }).text).toBe('2,8 → 5,0/5')
    // tek sayı kendi başına kırpılır
    expect(changeText({ to: 6, unit: 'harf' }).text).toBe('6 harf')
    // etki (n < 3 ya da belirgin değil): aynı kural
    expect(effectChangeText({ measure: 'kendine güven', max: 10, n: 2, before: 7, after: 4.5, gain: -2.5, sig: false }).text).toBe('Kendine güven 7,0 → 4,5')
    expect(effectChangeText({ measure: 'sakinlik', max: 5, n: 1, before: 0.5, after: 3, gain: 2.5, sig: false }).text).toBe('Sakinlik 0,5 → 3,0')
  })

  it('yön: good iyi yönü söyler; düşük daha iyi ölçüde azalma iyi', () => {
    expect(changeText({ from: 120, to: 90, unit: 'ms', better: 'down' })).toMatchObject({ delta: -30, deltaText: '−30', good: true })
    expect(changeText({ from: 4, to: 6, unit: 'harf' })).toMatchObject({ delta: 2, good: true })
    expect(changeText({ from: 0.1, to: 0.1, unit: 'logMAR', better: 'down' }).good).toBeNull()
    // fark yazılan iki yuvarlanmış değerden: 0,104 → 0,196 "+0,10" (ham +0,09 değil)
    expect(changeText({ from: 0.104, to: 0.196, unit: 'logMAR' }).deltaText).toBe('+0,10')
  })

  it('etki puanın kendi yönüyle yazılır (Ö-8): düşük daha iyi ölçüde azalma "−", iyi olduğu good ile', () => {
    // Yön · Dışarıdan bak: rahatsızlık 8 → 5 (gain = önce − sonra = 3)
    const e = { measure: 'rahatsızlık', max: 10, better: 'down', n: 6, before: 8, after: 5, gain: 3, sig: true }
    expect(effectChangeText(e)).toMatchObject({ text: '−3,0 rahatsızlık', delta: -3, good: true })
    // nefes sakinlik 2 → 3,3 (artış iyi)
    expect(effectChangeText({ measure: 'sakinlik', max: 5, better: 'up', n: 24, before: 2, after: 3.3, gain: 1.3, sig: true }).text).toBe('+1,3 sakinlik')
    // 3 oturumdan az: ortalama önce → sonra, yön hükmü yok
    expect(effectChangeText({ measure: 'sakinlik', max: 5, better: 'up', n: 1, before: 2, after: 4, gain: 2, sig: false })).toMatchObject({ text: 'Sakinlik 2 → 4', good: null })
    // belirgin olmayan etki (≥ 3 oturum, aralık sıfırı içeriyor): işaretsiz önce → sonra; fark ve işareti deltaText'te
    expect(effectChangeText({ measure: 'sakinlik', max: 5, n: 5, before: 3, after: 2.98, gain: -0.02, sig: false })).toMatchObject({ text: 'Sakinlik 3 → 3', deltaText: '0,0', good: null })
    expect(effectChangeText({ measure: 'dinlenmişlik', max: 10, n: 6, before: 4.5, after: 6.5, gain: 2, sig: false }).text).toBe('Dinlenmişlik 4,5 → 6,5')
  })
})
