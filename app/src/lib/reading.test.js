import { describe, it, expect } from 'vitest'
import {
  TEXTS, TEXT_CHARS, textString, orderTexts, usedTextIds, readingLadder, longestLine,
  itemWpm, analyzeReading, fontSizeCssPx, normalizeTr, withinOneEdit, wordsMatch, alignWords,
  autoFinish, tapOutcome, segmentEndSec, fmtLogMAR, fmtM, jevResultLine, jevProgressLine,
  previousComparable, cpsText, ladderStatus, PROTOCOL,
} from './reading.js'

// Havuz kuralları (onaylı taslak): tam 60 karakter, 3 satır (17–21), 7–9 kelime, 21–24 hece,
// yalnız harf ve boşluk, yalnız ilk harf büyük, en az 60 yazı, tekrar yok, calibrated:false.
const VOWELS = /[aeıioöuü]/g
describe('TEXTS (yazı havuzu)', () => {
  it('en az 60 yazı, kimlikler ve yazılar tekrarsız', () => {
    expect(TEXTS.length).toBeGreaterThanOrEqual(60)
    expect(new Set(TEXTS.map((t) => t.id)).size).toBe(TEXTS.length)
    expect(new Set(TEXTS.map(textString)).size).toBe(TEXTS.length)
  })
  it('her yazı tam 60 karakter, 3 satır, satır 17–21 karakter', () => {
    const bad = TEXTS.filter((t) => t.lines.length !== 3 || textString(t).length !== TEXT_CHARS || t.lines.some((l) => l.length < 17 || l.length > 21 || l !== l.trim()))
    expect(bad.map((t) => `${t.id}: ${t.lines.map((l) => l.length).join('/')} ${textString(t)}`)).toEqual([])
  })
  it('7–9 kelime, 21–24 hece (ünlü sayısı)', () => {
    const bad = TEXTS.filter((t) => {
      const s = textString(t)
      const w = s.split(' ').length
      const syl = (s.toLocaleLowerCase('tr').match(VOWELS) || []).length
      return w < 7 || w > 9 || syl < 21 || syl > 24
    })
    expect(bad.map((t) => textString(t))).toEqual([])
  })
  it('noktalama ve rakam yok; yalnız ilk harf büyük', () => {
    const bad = TEXTS.filter((t) => !/^[A-ZÇĞİÖŞÜ][a-zçğıöşü ]+$/.test(textString(t)) || /\s{2}/.test(textString(t)))
    expect(bad.map((t) => textString(t))).toEqual([])
  })
  it('pilot yapılana kadar eşit sayılmaz (calibrated:false)', () => {
    expect(TEXTS.every((t) => t.calibrated === false)).toBe(true)
  })
  it('en uzun satır 21 karakter (merdiven hesabı buna dayanır)', () => {
    expect(longestLine()).toBeLessThanOrEqual(21)
  })
})

describe('orderTexts / usedTextIds', () => {
  it('son testlerin yazıları sona kalır', () => {
    const ex = TEXTS.slice(0, 20).map((t) => t.id)
    const order = orderTexts(ex)
    expect(order.length).toBe(TEXTS.length)
    expect(order.slice(0, TEXTS.length - 20).some((t) => ex.includes(t.id))).toBe(false)
  })
  it('kayıtlardan kimlik ve eski dize biçimi okunur', () => {
    const ids = usedTextIds([{ textsUsed: ['r05'] }, { sentencesUsed: [textString(TEXTS[2]), 'eski cümle'] }])
    expect(ids.sort()).toEqual(['r03', 'r05'])
  })
})

describe('readingLadder', () => {
  // iPhone 15/13: 460 ppi → 18,1 px/mm fiziksel, @3x → 6,04 CSS px/mm; genişlik 390 − 32
  const phone = { pxPerMm: 460 / 25.4 / 3, xRatio: 0.52, dpr: 3, widthPx: 390 - 32 }
  it('0,5 → −0,3, 0,1 adım', () => {
    expect(readingLadder(phone)).toEqual([0.5, 0.4, 0.3, 0.2, 0.1, 0, -0.1, -0.2, -0.3])
  })
  it('dar ekranda sığmayan üst boylar atlanır, yazı kırılmaz', () => {
    const sizes = readingLadder({ ...phone, widthPx: 150 })
    expect(sizes[0]).toBeLessThan(0.5)
    expect(sizes.at(-1)).toBe(-0.3)
  })
  it('çizilemeyecek kadar küçük boy (x-yüksekliği < 3 cihaz pikseli) atlanır', () => {
    const sizes = readingLadder({ ...phone, dpr: 1, pxPerMm: 3.8 })
    expect(sizes.at(-1)).toBeGreaterThan(-0.3)
  })
})

describe('itemWpm', () => {
  it('60 karakter 6 saniyede = 100 standart kelime/dk', () => {
    expect(itemWpm(6, 9, null).wpm).toBeCloseTo(100, 6)
  })
  it('eksik kelime oranla düşürür', () => {
    expect(itemWpm(6, 8, 6).wpm).toBeCloseTo(75, 6)
  })
  it('geçersiz süre null; 350 k/dk üstü hıza katılmaz', () => {
    expect(itemWpm(0, 8, 8).wpm).toBeNull()
    expect(itemWpm(1.2, 8, 8)).toEqual({ wpm: null, fast: true })
  })
})

describe('analyzeReading', () => {
  const it2 = (logMAR, seconds, status = 'read', extra = {}) => ({ logMAR, seconds, status, wpm: seconds ? itemWpm(seconds, 8, null).wpm : null, errors: 0, ...extra })
  it('düzlüğü ve rahat boyu (%80 kuralı) bulur', () => {
    const items = [it2(0.5, 3.5), it2(0.4, 3.6), it2(0.3, 3.6), it2(0.2, 4.8), it2(0.1, 6.9), it2(0, 11.2, 'struggled'), it2(-0.1, null, 'failed')]
    const r = analyzeReading(items)
    expect(r.criticalPrintSize).toBe(0.3)
    expect(r.readingAcuity).toBe(0.1)
    expect(r.maxReadingSpeed).toBeGreaterThan(160)
    expect(r.maxReadingSpeed).toBeLessThan(175)
    expect(r.cpsCensored).toBeNull()
  })
  it('hiç okunmadıysa boş sonuç, üst sınır işareti', () => {
    const r = analyzeReading([it2(0.5, null, 'failed')])
    expect(r.criticalPrintSize).toBeNull()
    expect(r.maxReadingSpeed).toBeNull()
    expect(r.cpsCensored).toBe('above')
  })
  it('düzlük en küçük boya kadar sürerse alt sınır ve floor', () => {
    const items = [0.5, 0.4, 0.3, 0.2, 0.1, 0, -0.1, -0.2, -0.3].map((l) => it2(l, 3.6))
    const r = analyzeReading(items)
    expect(r.cpsCensored).toBe('below')
    expect(r.floor).toBe(true)
    expect(r.criticalPrintSize).toBe(-0.3)
  })
  it('yenisiyle değiştirilen ve deneme adımları sayılmaz; tek adımlık düzlükte hız raporlanmaz', () => {
    const items = [it2(0.5, 3.5, 'read', { practice: true }), it2(0.5, 3.6), it2(0.4, 20, 'read', { superseded: true }), it2(0.4, 9)]
    const r = analyzeReading(items)
    expect(r.criticalPrintSize).toBe(0.5)
    expect(r.maxReadingSpeed).toBeNull()
  })
  it('MNREAD tarzı keskinlik: en küçük okunan boy + hata başına 0,01', () => {
    const r = analyzeReading([it2(0.5, 3.5, 'read', { errors: 1 }), it2(0.4, 6, 'struggled', { errors: 3 })])
    expect(r.readingAcuityMnread).toBeCloseTo(0.44, 6)
  })
})

describe('fontSizeCssPx', () => {
  it('x-yüksekliği oranı küçüldükçe font büyür', () => {
    expect(fontSizeCssPx(0.4, 400, 6.3, 0.45)).toBeGreaterThan(fontSizeCssPx(0.4, 400, 6.3, 0.55))
  })
  it('logMAR 0 @ 40 cm, oran 0.5 → x-yüksekliği 0.582 mm', () => {
    const px = fontSizeCssPx(0, 400, 10, 0.5)
    expect((px * 0.5) / 10).toBeCloseTo(0.5818, 3)
  })
  it('iPhone 15, 40 cm, 0,5 ≈ 21,4 px (taslaktaki tablo)', () => {
    expect(fontSizeCssPx(0.5, 400, 460 / 25.4 / 3, 0.52)).toBeCloseTo(21.4, 1)
  })
})

// Sıralı hizalama: eski test sırasız %70 eşleşmeyle ortada geçiyordu; yenisi kelimeleri sırayla eşler.
describe('alignWords (sesli okuma)', () => {
  const T = normalizeTr('Küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya vurdu')
  it('birebir okuma → hepsi eşleşir', () => {
    const a = alignWords(T, normalizeTr('küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya vurdu.'))
    expect(a.matched).toBe(8)
    expect(a.lastAligned).toBe(7)
  })
  it('fazlalık ve tekrar kelimeler hata sayılmaz', () => {
    const a = alignWords(T, normalizeTr('küçük küçük kayık ııı hafif rüzgarla sallanırken dalgalar şey kıyıya vurdu'))
    expect(a.matched).toBe(8)
  })
  it('sıra dışı kelime eşleşmez', () => {
    const a = alignWords(T, normalizeTr('vurdu küçük kayık'))
    expect(a.matched).toBe(2)
    expect(a.lastAligned).toBe(1)
  })
  it('birleşik ve bölünmüş tanıma eşleşir', () => {
    const t = normalizeTr('Tarladaki ayçiçekleri sabah güneşine')
    expect(alignWords(t, normalizeTr('tarladaki ay çiçekleri sabah güneşine')).matched).toBe(4)
    expect(alignWords(t, normalizeTr('tarladaki ayçiçekleri sabahgüneşine')).matched).toBe(4)
  })
  it('≥ 6 harfte 1 harf farkı kabul; kısa kelimede kabul değil', () => {
    expect(withinOneEdit('sallanırken', 'sallanırkin')).toBe(true)
    expect(withinOneEdit('dalgalar', 'dalgala')).toBe(true)
    expect(withinOneEdit('dalgalar', 'dalgal')).toBe(false)
    expect(wordsMatch('sallanırken', 'sallanırkan')).toBe(true)
    expect(wordsMatch('kayık', 'kayak')).toBe(false)
  })
  it('Türkçe büyük İ/I doğru küçülür', () => {
    expect(normalizeTr('İstanbul IŞIK')).toEqual(['istanbul', 'ışık'])
  })
  it('boş → eşleşme yok', () => {
    expect(alignWords(T, []).matched).toBe(0)
  })
})

describe('autoFinish (ortada geçmez)', () => {
  const T = normalizeTr('Küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya vurdu')
  const check = (heard, extra = {}) => {
    const a = alignWords(T, normalizeTr(heard))
    return autoFinish({ words: T.length, matched: a.matched, lastAligned: a.lastAligned, silenceS: 2, endSec: 4, ...extra })
  }
  it('ilk %70 ya da %80 okunmuş yazı ASLA bitirmez', () => {
    expect(check('küçük kayık hafif rüzgarla sallanırken').ok).toBe(false) // %62
    expect(check('küçük kayık hafif rüzgarla sallanırken dalgalar').ok).toBe(false) // %75
    expect(check('küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya').ok).toBe(true) // son 2'den biri + 1 eksik
  })
  it('son kelime ve sessizlik bitirir', () => {
    expect(check('küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya vurdu').ok).toBe(true)
  })
  it('bir kelime atlanırsa biter, iki kelime atlanırsa bitmez', () => {
    expect(check('küçük kayık hafif sallanırken dalgalar kıyıya vurdu').ok).toBe(true)
    expect(check('küçük hafif sallanırken dalgalar kıyıya vurdu').ok).toBe(false)
  })
  it('sessizlik yoksa ya da süre 1,7 sn altındaysa bitmez; sonuç kesinse sessizlik beklenmez', () => {
    const all = 'küçük kayık hafif rüzgarla sallanırken dalgalar kıyıya vurdu'
    expect(check(all, { silenceS: 0.3 }).ok).toBe(false)
    expect(check(all, { endSec: 1.2 }).ok).toBe(false)
    expect(check(all, { silenceS: 0.1, isFinal: true }).ok).toBe(true)
  })
})

describe('tapOutcome ("Okudum")', () => {
  it('≤ 1 eksik okundu, yarıya kadar takıldı, yarıdan çoğu duyulmadı', () => {
    expect(tapOutcome(8, 7)).toBe('read')
    expect(tapOutcome(8, 5)).toBe('struggled')
    expect(tapOutcome(8, 4)).toBe('struggled')
    expect(tapOutcome(8, 3)).toBe('low')
  })
})

describe('segmentEndSec', () => {
  it('segment sayısı uyuşursa son kelimenin bitişi, yoksa null', () => {
    const seg = [{ t: 0.4, d: 0.3 }, { t: 0.8, d: 0.4 }]
    expect(segmentEndSec(seg, 2, 1)).toBeCloseTo(1.2, 6)
    expect(segmentEndSec(seg, 3, 1)).toBeNull()
    expect(segmentEndSec([{ t: 0, d: 0 }], 1, 0)).toBeNull()
  })
})

describe('gösterim ve karşılaştırma', () => {
  it('logMAR ve M birimi', () => {
    expect(fmtLogMAR(0.3)).toBe('0,3')
    expect(fmtLogMAR(-0.1)).toBe('−0,1')
    expect(fmtLogMAR(1e-12)).toBe('0,0')
    expect(fmtM(0.3)).toBe('0,8')
    expect(fmtM(0.4)).toBe('1,0')
  })
  const rec = (date, cps, correction = 'none', extra = {}) => ({ type: 'reading', protocol: PROTOCOL, date, criticalPrintSize: cps, correction, ...extra })
  it('yalnız protocol 2 ve aynı koşul karşılaştırılır', () => {
    const tests = [
      { type: 'reading', date: '2026-09-01', maxReadingSpeed: 180, criticalPrintSize: 0.2 },
      rec('2026-09-08', 0.4, 'reading'),
      rec('2026-09-15', 0.3, 'none'),
    ]
    expect(previousComparable(tests, 'none', '2026-09-20').date).toBe('2026-09-15')
    expect(previousComparable(tests, 'progressive', '2026-09-20')).toBeNull()
    expect(previousComparable(tests, 'none', '2026-09-15')).toBeNull()
  })
  it('Nef tek cümle: ilk, aynı, bir basamak, belirgin fark, sınırlar', () => {
    expect(jevResultLine({ criticalPrintSize: 0.3 }, null)).toMatch(/^İlk ölçümün bu/)
    expect(jevResultLine({ criticalPrintSize: 0.3 }, { criticalPrintSize: 0.3 })).toBe('Rahat boyun geçen testle aynı: 0,3.')
    expect(jevResultLine({ criticalPrintSize: 0.2 }, { criticalPrintSize: 0.3 })).toMatch(/bir basamak/)
    expect(jevResultLine({ criticalPrintSize: 0.1 }, { criticalPrintSize: 0.3 })).toMatch(/daha küçük/)
    expect(jevResultLine({ criticalPrintSize: 0.5 }, { criticalPrintSize: 0.3 })).toMatch(/büyük çıktı/)
    expect(jevResultLine({ criticalPrintSize: null, cpsCensored: 'above' }, null)).toMatch(/En büyük yazıda/)
    expect(jevResultLine({ criticalPrintSize: -0.3, cpsCensored: 'below', floor: true }, null)).toMatch(/En küçük yazıya/)
  })
  it('Gelişim cümlesi son iki karşılaştırılabilir testten', () => {
    expect(jevProgressLine([rec('2026-09-08', 0.3), rec('2026-09-15', 0.3)])).toBe('Rahat boyun son iki testte aynı: 0,3.')
    expect(jevProgressLine([{ type: 'reading', date: '2026-09-01', maxReadingSpeed: 180 }])).toBeNull()
  })
  it('sınırdaki rahat boy "> 0,5" yazılır', () => {
    expect(cpsText({ criticalPrintSize: null, cpsCensored: 'above', ladderTop: 0.5 })).toBe('> 0,5')
    expect(cpsText({ criticalPrintSize: 0.2 })).toBe('0,2')
  })
  it('merdiven durumu: geçersiz ve deneme adımları görünmez, sıra gelmeyen boy "none"', () => {
    const r = { ladder: [0.5, 0.4, 0.3], items: [{ logMAR: 0.5, status: 'read', practice: true }, { logMAR: 0.5, status: 'struggled' }, { logMAR: 0.4, status: 'failed', superseded: true }, { logMAR: 0.4, status: 'failed' }] }
    expect(ladderStatus(r).map((x) => x.status)).toEqual(['struggled', 'failed', 'none'])
  })
})
