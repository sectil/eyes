import { describe, it, expect } from 'vitest'
import { numberWords, ordinalWords, lastSpokenWord, suffixFor, formatNumber, numberWith, formatClock, clockWith, possessive2, upperFirst, DAY_PARTS, nounForms, conjDe } from './tr.grammar.js'
import { hourTable } from '../../weatherNotify.js'
import { clockWithSuffix } from '../../sky.js'

const L = 'tr'

describe('saat eki tablosu', () => {
  it('onaylı cümlelerdeki saatler', () => {
    expect(clockWith(1170, 'LOC', L)).toBe("19.30'da")
    expect(clockWith(1080, 'LOC', L)).toBe("18.00'de")
    expect(clockWith(1140, 'LOC', L)).toBe("19.00'da")
    expect(clockWith(1320, 'DAT', L)).toBe("22.00'ye")
    expect(clockWith(1170, 'DAT', L)).toBe("19.30'a")
    expect(clockWith(1080, 'DAT', L)).toBe("18.00'e")
    expect(clockWith(1020, 'ABL', L)).toBe("17.00'den")
    expect(clockWith(1140, 'ABL', L)).toBe("19.00'dan")
    expect(clockWith(1260, 'LOC', L)).toBe("21.00'de")
    expect(clockWith(1170, null, L)).toBe('19.30')
  })

  it('dakikalı saat: okunuşun son sözcüğü dakikadır', () => {
    expect(clockWith(9 * 60 + 5, 'LOC', L)).toBe("09.05'te")
    expect(clockWith(20 * 60 + 40, 'LOC', L)).toBe("20.40'ta")
    expect(clockWith(20 * 60 + 40, 'DAT', L)).toBe("20.40'a")
    expect(clockWith(7 * 60 + 50, 'ABL', L)).toBe("07.50'den")
    expect(clockWith(6 * 60 + 15, 'DAT', L)).toBe("06.15'e")
    expect(clockWith(0, 'LOC', L)).toBe("00.00'da")
  })

  it('weatherNotify.js hourTable ile 24 tam saatte aynı (kopya değil, aynı kural)', () => {
    const t = hourTable()
    for (let h = 0; h < 24; h++) {
      const k = String(h).padStart(2, '0')
      expect(clockWith(h * 60, null, L)).toBe(t[k].NUM)
      expect(clockWith(h * 60, 'LOC', L)).toBe(t[k].LOC)
      expect(clockWith(h * 60, 'ABL', L)).toBe(t[k].ABL)
      expect(clockWith(h * 60, 'DAT', L)).toBe(t[k].DAT)
    }
  })

  it('sky.js clockWithSuffix ile her dakikada aynı bulunma eki', () => {
    for (let m = 0; m < 1440; m++) expect(clockWith(m, 'LOC', L)).toBe(clockWithSuffix(new Date(2026, 0, 1, Math.floor(m / 60), m % 60)))
  })

  it('geçersiz saat: null', () => {
    expect(formatClock(-1, L)).toBeNull()
    expect(formatClock(1440, L)).toBeNull()
    expect(clockWith(12.5, 'LOC', L)).toBeNull()
  })
})

describe('sayı eki tablosu', () => {
  const cases = [
    [4, 'ABL', "4'ten"], [7, 'DAT', "7'ye"], [6, 'ABL', "6'dan"], [3, 'DAT', "3'e"], [7, 'ABL', "7'den"],
    [4, 'DAT', "4'e"], [6, 'DAT', "6'ya"], [5, 'DAT', "5'e"], [2, 'ABL', "2'den"], [3, 'ABL', "3'ten"],
    [9, 'DAT', "9'a"], [10, 'ABL', "10'dan"], [20, 'DAT', "20'ye"], [40, 'ABL', "40'tan"], [100, 'DAT', "100'e"],
    [120, 'ABL', "120'den"], [80, 'DAT', "80'e"], [0, 'DAT', "0'a"], [1, 'ABL', "1'den"], [8, 'LOC', "8'de"],
    [4, 'GEÇMİŞ', "4'tü"], [6, 'GEÇMİŞ', "6'ydı"], [5, 'GEÇMİŞ', "5'ti"], [9, 'GEÇMİŞ', "9'du"], [2, 'GEÇMİŞ', "2'ydi"],
    [3, 'GEÇMİŞ', "3'tü"], [10, 'GEÇMİŞ', "10'du"], [7, 'ACC', "7'yi"], [4, 'ACC', "4'ü"],
  ]
  it.each(cases)('%s %s → %s', (n, kind, want) => {
    expect(numberWith(n, kind, L)).toBe(want)
  })

  it('ondalık: virgül ve son okunan sözcük', () => {
    expect(formatNumber(1.5, L)).toBe('1,5')
    expect(numberWith(1.5, null, L)).toBe('1,5')
    expect(numberWith(3.6, 'DAT', L)).toBe("3,6'ya")
    expect(numberWith(1.5, 'DAT', L)).toBe("1,5'e")
    expect(numberWith(2.0, null, L)).toBe('2')
    expect(numberWith(1.54, null, L)).toBe('1,5') // en çok bir ondalık
    expect(lastSpokenWord(3.25)).toBe('beş')
  })

  it('yüzde: Intl biçimi, ek okunuştan', () => {
    expect(numberWith(55, 'ABL', L, { percent: true })).toBe("%55'ten")
    expect(numberWith(70, 'DAT', L, { percent: true })).toBe("%70'e")
  })

  it('sayı sözle', () => {
    expect(numberWords(0)).toBe('sıfır')
    expect(numberWords(3)).toBe('üç')
    expect(numberWords(4)).toBe('dört')
    expect(numberWords(14)).toBe('on dört')
    expect(numberWords(100)).toBe('yüz')
    expect(numberWords(230)).toBe('iki yüz otuz')
    expect(numberWords(1000)).toBe('bin')
    expect(numberWords(2024)).toBe('iki bin yirmi dört')
    expect(numberWords(-1)).toBeNull()
    expect(numberWords(1.5)).toBeNull()
  })

  it('sıra sayısı ve ünsüz yumuşaması', () => {
    expect(ordinalWords(1)).toBe('birinci')
    expect(ordinalWords(2)).toBe('ikinci')
    expect(ordinalWords(3)).toBe('üçüncü')
    expect(ordinalWords(4)).toBe('dördüncü')
    expect(ordinalWords(5)).toBe('beşinci')
    expect(ordinalWords(6)).toBe('altıncı')
    expect(ordinalWords(7)).toBe('yedinci')
    expect(ordinalWords(9)).toBe('dokuzuncu')
    expect(ordinalWords(10)).toBe('onuncu')
    expect(ordinalWords(14)).toBe('on dördüncü')
    expect(ordinalWords(0)).toBeNull()
  })

  it('ekler sözcüğe göre', () => {
    expect(suffixFor('oyunu', 'INS')).toBe('yla')
    expect(suffixFor('ses', 'INS')).toBe('le')
    expect(suffixFor('dört', 'LOC')).toBe('te')
    expect(suffixFor('x', 'YOK')).toBeNull()
  })
})

describe('iyelik, büyük harf, gün dilimi', () => {
  it('2. tekil iyelik ve k → ğ', () => {
    expect(possessive2('sakinlik')).toBe('sakinliğin')
    expect(possessive2('gerginlik')).toBe('gerginliğin')
    expect(possessive2('rahatsızlık')).toBe('rahatsızlığın')
    expect(possessive2('dinlenmişlik')).toBe('dinlenmişliğin')
    expect(possessive2('odak')).toBe('odağın')
    expect(possessive2('enerji')).toBe('enerjin')
    expect(possessive2('kendine güven')).toBe('kendine güvenin')
    expect(possessive2('beden gerginliği')).toBe('beden gerginliğin')
    expect(possessive2('ok')).toBe('okun')
    expect(possessive2('')).toBeNull()
  })
  it('büyük harf dile göre', () => {
    expect(upperFirst('ilk', 'tr')).toBe('İlk')
    expect(upperFirst('akşamları', 'tr')).toBe('Akşamları')
  })
  it('gün dilimi biçimleri', () => {
    expect(DAY_PARTS.evening['']).toBe('akşam')
    expect(DAY_PARTS.evening.ÇOĞUL).toBe('akşamları')
    expect(DAY_PARTS.noon.SAYILI).toBe('gün')
  })
})

describe('modül adı çekimleri (manifest nef.name)', () => {
  it('ad tamlaması: n kaynaştırması, vasıtada y, 2. tekil iyelik', () => {
    expect(nounForms('Dalga ses', { compound: true })).toMatchObject({ '': 'Dalga sesi', ABL: 'Dalga sesinden', ACC: 'Dalga sesini', DAT: 'Dalga sesine', LOC: 'Dalga sesinde' })
    expect(nounForms('Yılan oyun', { compound: true })).toMatchObject({ '': 'Yılan oyunu', ACC: 'Yılan oyununu', LOC: 'Yılan oyununda', INS: 'Yılan oyunuyla', DAT: 'Yılan oyununa' })
    expect(nounForms('Gökyüzü mola', { compound: true })).toMatchObject({ '': 'Gökyüzü molası', POSS: 'Gökyüzü molan', 'POSS-ABL': 'Gökyüzü molandan' })
    expect(nounForms('yoga ders', { compound: true })).toMatchObject({ '': 'yoga dersi', POSS: 'yoga dersin', ABL: 'yoga dersinden' })
    expect(nounForms('su kayd', { compound: true })).toMatchObject({ '': 'su kaydı', ABL: 'su kaydından', POSS: 'su kaydın' })
    expect(nounForms('nefes pratiğ', { compound: true })).toMatchObject({ '': 'nefes pratiği', ACC: 'nefes pratiğini', POSS: 'nefes pratiğin' })
  })
  it('yalın ad: ek doğrudan', () => {
    expect(nounForms('alarm')).toMatchObject({ '': 'alarm', ABL: 'alarmdan', ACC: 'alarmı', LOC: 'alarmda', DAT: 'alarma', INS: 'alarmla' })
    expect(nounForms('1 dakikalık mola')).toMatchObject({ ABL: '1 dakikalık moladan', ACC: '1 dakikalık molayı', DAT: '1 dakikalık molaya', POSS: '1 dakikalık molan' })
    expect(nounForms('')).toBeNull()
  })
})

describe('Nef kodunda bölge sabiti yok', () => {
  it("'tr-TR' yazılmamış", async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const here = path.dirname(fileURLToPath(import.meta.url))
    const dir = path.resolve(here, '..')
    const files = [
      ...fs.readdirSync(dir).map((f) => path.join(dir, f)),
      ...fs.readdirSync(here).map((f) => path.join(here, f)),
    ].filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))
    expect(files.length).toBeGreaterThanOrEqual(5)
    for (const f of files) expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(/tr-TR/)
  })
})

describe('"de/da" bağlacı (Nef kartı düğmesi)', () => {
  it('gün dilimlerinde ünlü uyumu; ünsüz benzeşmesi yok (ayrı yazılan bağlaç)', () => {
    expect(conjDe(DAY_PARTS.evening[''])).toBe('da') // akşam
    expect(conjDe(DAY_PARTS.morning[''])).toBe('da') // sabah
    expect(conjDe(DAY_PARTS.night[''])).toBe('de') // gece
    expect(conjDe(DAY_PARTS.noon[''])).toBe('de') // öğlen
    expect(conjDe('Bugün')).toBe('de')
  })
})
