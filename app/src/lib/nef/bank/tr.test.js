// Banka = onaylı metin kanıtı: her şablon, taslaktaki / tur2'deki örnek veriyle doldurulunca onay dosyasındaki cümleyi
// HARFİ HARFİNE verir; bankada onay dosyası dışında cümle yoktur. Sapma olursa şablon düzeltilir, onaylı metin asla.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import bank, { cells, render, label, lang, actions, renderAction } from './tr.js'
import { DAY_PARTS } from './tr.grammar.js'
import { NEEDS } from '../speak.js'

const ONAY = fileURLToPath(new URL('../../../../../docs/yol-haritasi/tasarim/nef/N1-CUMLELER-onay.md', import.meta.url))
const onayText = readFileSync(ONAY, 'utf8')
// Cümleler düğme bölümünden önce; düğme yazıları onay dosyasının son bölümünde (aşağıdaki "düğme" testi)
const BTN_HEAD = '## Nef kartı düğmeleri'
const [sentencePart, buttonPart = ''] = onayText.split(BTN_HEAD)
const approved = sentencePart.split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim())
// Düğme bölümündeki tırnaklı örnekler, satırın başına göre: onaylı (kullanılan), yedek, kullanılmaz
const btnLines = buttonPart.split('\n').filter((l) => l.startsWith('- '))
const quoted = (l) => [...l.matchAll(/"([^"]+)"/g)].map((m) => m[1])
// Onaylı satırda örnek ilk tırnaktadır (sonraki parantez açıklama: dilim + "da/de")
const btnApproved = btnLines.filter((l) => !/^- (Yedek|Kullanılmaz)/.test(l)).map((l) => quoted(l)[0])
const btnSpare = btnLines.filter((l) => /^- Yedek/.test(l)).flatMap(quoted)
const btnRejected = btnLines.filter((l) => /^- Kullanılmaz/.test(l)).flatMap(quoted)

// Örnek verideki modül adları ve ölçüm sözcükleri: onaylı cümlelerde geçen biçimler (ileride manifest nef.name)
const lexicon = {
  names: {
    dalga: { '': 'Dalga sesi', ABL: 'Dalga sesinden', ACC: 'Dalga sesini', DAT: 'Dalga sesine' },
    'yoga-nefes': { '': 'Nefesin Ritmi yoga dersi', ABL: 'Nefesin Ritmi yoga dersinden', ACC: 'Nefesin Ritmi yoga dersini' },
    yon: { '': 'Yön yazı egzersizi', ABL: 'Yön yazı egzersizinden', ACC: 'Yön yazı egzersizini' },
    'tek-bakis': { '': 'Tek Bakışta oyunu', LOC: 'Tek Bakışta oyununda', ACC: 'Tek Bakışta oyununu', DAT: 'Tek Bakışta oyununa' },
    snake: { '': 'Yılan oyunu', ACC: 'Yılan oyununu', LOC: 'Yılan oyununda', INS: 'Yılan oyunuyla', DAT: 'Yılan oyununa' },
    gokyuzu: { '': 'Gökyüzü molası', POSS: 'Gökyüzü molan', 'POSS-ABL': 'Gökyüzü molandan' },
    yoga: { '': 'yoga dersi', POSS: 'yoga dersin' },
  },
  metrics: { 'tek-bakis-span': { word: 'kavradığın harf sayısı', unit: 'harf' } },
}

// Örnek veri (taslak hücre başlarındaki "Örnek veri" ve tur2 örnekleri)
const F1A = { walkAt: 1170, rainFrom: 1140, rainTo: 1320, earlyAt: 1080, part: 'evening', n: 3, source: 'habit', covered: false } // üç akşam 19.30, yağmur 19.00–22.00
const F1B = { walkAt: 1080, rainFrom: 1140, rainTo: 1320, part: 'evening', n: 3, source: 'habit', covered: false } // 18.00, yağmur 19.00
const F1C = { walkAt: 1170, rainFrom: 1020, rainTo: 1320, part: 'evening', n: 3, source: 'habit', covered: true } // 19.30, yağmur 17.00–22.00
const F1E = { ...F1A, source: 'remind', n: undefined } // hatırlatma 19.30
const HOT = { feels: 31, walkAt: 1170, part: 'evening', source: 'habit' }
const DALGA = { module: 'dalga', effect: 'dalga-sakin', measure: 'sakinlik', better: 'up', part: 'evening' }
const UP1 = { ...DALGA, before: 4, after: 7 }
const YOGA = { module: 'yoga', effect: 'yoga-nefes', measure: 'gerginlik', better: 'down', part: 'evening' }
const YON = { module: 'yon', effect: 'yon-uzak', measure: 'rahatsızlık', better: 'down', part: 'evening' }
const DOWN_Y = { ...YOGA, before: 6, after: 3 }
const DOWN_N = { ...YON, before: 7, after: 4 }
const PAT_UP = { ...DALGA, n: 5, gain: 2, beforeAvg: 4, afterAvg: 6 }
const PAT_YON = { ...YON, n: 4, gain: 1.5, beforeAvg: 6.75, afterAvg: 5.25 }
const PAT_YOGA = { ...YOGA, n: 4, gain: 1.5, beforeAvg: 6.75, afterAvg: 5.25 }
const TB = { module: 'tek-bakis', metric: 'tek-bakis-span', start: 4, current: 6, weeks: 2 }
const SNAKE = { module: 'snake' }

const EX = {
  'F1T-1': [{}, 'Yürüyüşün yağmura denk geliyor'],
  'F1T-2': [{}, 'Yağmur yürüyüş saatine yakın'],
  'F1T-4': [{}, 'Yürüyüşünle yağmur çakışabilir'],
  'F1T-7': [{}, 'Yürüyüşünde yağmur ihtimali'],
  'F1T-8': [{}, 'Yağmur yürüyüşüne denk gelebilir'],
  'F1T-9': [{}, 'Yürüyüş saatinde yağmur bekleniyor'],
  'F1A-1': [F1A, "Bu hafta üç akşam 19.30'da yürüdün. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."],
  'F1A-3': [F1A, "Son iki haftada çoğunlukla 19.30'da yürüdün. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."],
  'F1A-5': [F1A, "Her zamanki 19.30 yürüyüşünü 18.00'e alırsan yağmurdan önce dönebilirsin; yağmur 19.00'da bekleniyor."],
  'F1A-8': [F1A, "Son günlerde akşamları 19.30'da yürüyorsun. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."],
  'F1A-10': [F1A, "Akşamları genelde 19.30'da yürüyorsun. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."],
  'F1B-2': [F1B, "Akşam yürüyüşlerin genelde 18.00'de. Bugün yağmur biraz sonra, 19.00'da bekleniyor; kısa bir tur sığabilir."],
  'F1B-3': [F1B, "Son iki haftada çoğunlukla 18.00'de yürüdün. Bugün yağmur 19.00'da bekleniyor; ondan önce dönebilirsin."],
  'F1B-4': [F1B, "Her zamanki 18.00 yürüyüşünle yağmur arasında az zaman var: yağmur 19.00'da bekleniyor."],
  'F1B-7': [F1B, "Bu hafta üç akşam 18.00'de yürüdün. Bugün yağmur 19.00'da bekleniyor; ondan önce dönebilirsin."],
  'F1B-8': [F1B, "Akşamları genelde 18.00'de yürüyorsun. Yağmur bugün 19.00'da bekleniyor; kısa bir tur yağmurdan önce biter."],
  'F1B-9': [F1B, "Yürüyüş saatin 18.00; yağmur bugün 19.00'da bekleniyor. Yağmurdan önce dönmeye vakit var."],
  'F1B-10': [F1B, "Her zamanki 18.00 yürüyüşün yağmurdan önce bitebilir; yağmur 19.00'da bekleniyor."],
  'F1C-5': [F1C, "19.30 senin yürüyüş saatin; bugün yağmur 22.00'ye kadar bekleniyor. Yürüyüşü yarına bırakmak da olur."],
  'F1C-6': [F1C, "Bu hafta üç akşam 19.30'da yürüdün. Bugün akşam boyu yağmur bekleniyor; içeride kısa bir yürüyüş de olur."],
  'F1C-7': [F1C, "Akşam yürüyüşlerin genelde 19.30'da. Bugün yağmur 17.00'den 22.00'ye kadar bekleniyor; yürüyüşü yarına bırakmak da olur."],
  'F1C-10': [F1C, "Son iki haftada çoğunlukla 19.30'da yürüdün. Bugün akşam boyu yağmur bekleniyor; yürüyüş yarına kalabilir."],
  'F1D-5': [F1A, "Akşam yürüyüşlerin genelde 19.30'da; bugün de yağmur 19.00'da bekleniyor. 18.00'de çıkmak da olur."],
  'F1D-8': [F1A, "Yürüyüş saatin 19.30; bugün de yağmur 19.00'da bekleniyor. İstersen 18.00'de çık."],
  'F1E-1': [F1E, "Yürüyüş hatırlatman 19.30'da. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."],
  'F1E-4': [F1E, "19.30 senin yürüyüş saatin. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."],
  'F1E-5': [F1E, "Yürüyüşünü 19.30'a kurmuştun. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."],
  'F1E-8': [F1E, "Yürüyüş için seçtiğin saat 19.30. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."],
  'F3A-1': [HOT, 'Hissedilen 31 derece; suyunu yanına al.'],
  'F3A-2': [HOT, 'Hissedilen 31 derece; su yanında olsun.'],
  'F3A-4': [HOT, 'Hissedilen 31 derece; gölgeli yolu seçebilirsin.'],
  'F3A-5': [HOT, 'O saatte hissedilen 31 derece; bir şişe su yanında olsun.'],
  'F3A-6': [HOT, 'Hissedilen 31 derece; yolda su yanında olsun.'],
  'F3A-8': [HOT, 'Hissedilen 31 derece; yanına su almak iyi olur.'],
  'F3A-9': [HOT, 'Hissedilen 31 derece; gölgede yürümek daha rahat olabilir.'],
  'F3B-1': [HOT, 'Her zamanki 19.30 yürüyüşünde hissedilen 31 derece; suyunu yanına al.'],
  'F3B-2': [HOT, '19.30 yürüyüşünde hissedilen 31 derece bekleniyor; su yanında olsun.'],
  'F3B-5': [HOT, "Akşam yürüyüşlerin genelde 19.30'da; o saatte hissedilen 31 derece. Su yanında olsun."],
  'F3B-6': [HOT, 'Yürüyüş saatin 19.30; hissedilen 31 derece. Gölge ve su işine yarar.'],
  'F3B-7': [HOT, "Akşam yürüyüşlerin genelde 19.30'da; o saatte hissedilen 31 derece bekleniyor. Suyunu yanına al."],
  'F3B-9': [HOT, 'Yürüyüş saatin 19.30; o saatte hissedilen 31 derece bekleniyor. Su yanında olsun.'],
  'F2A-1': [UP1, "Geçen hafta bu akşam Dalga sesinden sonra sakinliğin 4'ten 7'ye çıkmıştı."],
  'F2A-3': [UP1, 'Geçen hafta bu akşam sakinlik puanın Dalga sesinden önce 4, sonra 7 olmuştu.'],
  'F2A-4': [UP1, "Bir hafta önce bu saatlerde Dalga sesinden sonra sakinlik puanın 4'ten 7'ye yükselmişti."],
  'F2A-5': [UP1, "Geçen hafta bu akşam Dalga sesini seçmiştin; sakinlik puanın 4'ten 7'ye çıkmıştı."],
  'F2A-8': [UP1, "Geçen hafta bu akşam Dalga sesinden sonra sakinlik puanın 4'ten 7'ye çıkmıştı."],
  'F2A-10': [UP1, "Bir hafta önce bu saatlerde Dalga sesini seçmiştin; sakinliğin 4'ten 7'ye yükselmişti."],
  'F2B-1': [DOWN_Y, "Geçen hafta bu akşam Nefesin Ritmi yoga dersinden sonra gerginliğin 6'dan 3'e inmişti."],
  'F2B-2': [DOWN_N, "Geçen hafta bu akşam Yön yazı egzersizi bitince rahatsızlık puanın 7'den 4'e azalmıştı."],
  'F2B-4': [DOWN_Y, "Bir hafta önce bu saatlerde Nefesin Ritmi yoga dersinden sonra gerginlik puanın 6'dan 3'e düşmüştü."],
  'F2B-5': [DOWN_N, "Geçen hafta bu akşam Yön yazı egzersizini seçmiştin; rahatsızlık puanın 7'den 4'e inmişti."],
  'F2B-8': [DOWN_Y, "Geçen hafta bu akşam Nefesin Ritmi yoga dersinden sonra gerginlik puanın 6'dan 3'e düşmüştü."],
  'F2B-9': [DOWN_Y, "Bir hafta önce bu saatlerde Nefesin Ritmi yoga dersini seçmiştin; gerginliğin 6'dan 3'e inmişti."],
  'F2C-1': [PAT_UP, 'Dalga sesinden sonra sakinlik puanın son 5 seansta ortalama 2 puan arttı.'],
  'F2C-2': [PAT_UP, "Son 5 Dalga sesi seansında sakinlik puanın ortalama 4'ten 6'ya çıktı."],
  'F2C-5': [PAT_UP, 'Sakinlik puanın Dalga sesinden sonra son 5 seansta ortalama 2 puan yükseldi.'],
  'F2C-7': [PAT_UP, 'Tek seferlik değil: son 5 Dalga sesi seansında sakinlik puanın ortalama 2 puan arttı.'],
  'F2C-9': [PAT_UP, "Dalga sesinden sonra sakinliğin son 5 seansta ortalama 4'ten 6'ya çıktı."],
  'F2C-10': [PAT_UP, 'Son 5 seansta Dalga sesinden sonra sakinliğin ortalama 2 puan yükseldi.'],
  'F2D-1': [PAT_YON, 'Yön yazı egzersizinden sonra rahatsızlık puanın son 4 seansta ortalama 1,5 puan azaldı.'],
  'F2D-2': [PAT_YON, "Son 4 Yön yazı egzersizi seansında rahatsızlık puanın ortalama 7'den 5'e indi."],
  'F2D-5': [PAT_YOGA, 'Gerginlik puanın Nefesin Ritmi yoga dersinden sonra son 4 seansta ortalama 1,5 puan düştü.'],
  'F2D-6': [PAT_YON, 'Tek seferlik değil: son 4 Yön yazı egzersizi seansında rahatsızlık puanın ortalama 1,5 puan azaldı.'],
  'F2D-9': [PAT_YOGA, 'Son 4 seansta Nefesin Ritmi yoga dersinden sonra gerginliğin ortalama 1,5 puan düştü.'],
  'F4A-2': [{}, 'Bugün söyleyecek yeni bir şeyim yok. Yolun hazır.'],
  'F4A-7': [{}, 'Bugün yalnız yolun var; acelesi yok.'],
  'F4A-8': [{}, 'Bugün benden yeni bir not yok. Yolun hazır.'],
  'F4A-9': [{}, 'Bugün yeni bir haberim yok. Yolun hazır.'],
  'F4A-11': [{}, 'Bugün senin için yeni bir not yok; yolun hazır.'],
  'F4A-13': [{}, 'Bugün kısa bir not: yolun hazır.'],
  'F4B-2': [{}, 'Bugün söyleyecek yeni bir şeyim yok.'],
  'F4B-4': [{}, 'Bugün yeni bir haber yok; gün senin.'],
  'F4B-6': [{}, 'Bugün benden yeni bir not yok.'],
  'F4B-8': [{}, 'Bugün yeni bir haberim yok.'],
  'F4B-9': [{}, 'Bugün senin için yeni bir not yok.'],
  'F4B-11': [{}, 'Bugün benden yeni bir haber yok; gün senin.'],
  'F4B-12': [{}, 'Bugün yeni bir şey yok; dinlenmek de olur.'],
  'F4C-1': [{}, 'Hoş geldin; bugün nereden başlayacağın sende.'],
  'F4C-3': [{}, 'Yeniden buradasın; yolun hazır.'],
  'F4C-4': [{}, 'Hoş geldin; bugün kısa bir durak da yeter.'],
  'F4C-7': [{}, 'Hoş geldin; geçmiş kayıtların yerinde, yolun hazır.'],
  'F4C-8': [{}, 'Hoş geldin; kayıtların yerinde.'],
  'F4C-9': [{}, 'Yeniden hoş geldin; yolun hazır.'],
  'F4C-10': [{}, 'Hoş geldin; bugün birkaç dakika da yeter.'],
  'MC-2': [TB, "Tek Bakışta oyununda kavradığın harf sayısı 4'ten 6'ya çıktı."],
  'MC-10': [TB, "Tek Bakışta oyununda kavradığın harf sayısı başlangıçta 4'tü, şimdi 6."],
  'MC-11': [TB, "Tek Bakışta oyununda ilerleme var: kavradığın harf sayısı 4'ten 6'ya çıktı."],
  'MC-12': [TB, "İki haftadır Tek Bakışta oyununda kavradığın harf sayısı 6; başlangıçta 4'tü."],
  'MC-15': [TB, "Tek Bakışta oyununda kavradığın harf sayısı artık 6; başlangıçta 4'tü."],
  'FT-1': [{ module: 'yoga' }, 'İlk yoga dersin tamam.'],
  'FT-2': [SNAKE, 'Yılan oyununu ilk kez denedin.'],
  'FT-6': [SNAKE, 'Yılan oyununda ilk günün geride kaldı.'],
  'FT-7': [SNAKE, 'Yılan oyunuyla ilk günün tamam.'],
  'FT-8': [SNAKE, 'Yılan oyununa ilk adımı attın.'],
  'FT-10': [{ module: 'gokyuzu' }, 'İlk Gökyüzü molan geride kaldı.'],
  'FTB-2': [{ module: 'tek-bakis', metric: 'tek-bakis-span', start: 4 }, 'Başlangıç sayın belli oldu: Tek Bakışta oyununda 4 harf.'],
  'FTB-4': [{ module: 'gokyuzu', effect: 'gokyuzu-rest', measure: 'dinlenmişlik', better: 'up', before: 3, after: 6 }, "İlk Gökyüzü molandan sonra dinlenmişliğin 3'ten 6'ya çıktı."],
  'FTB-8': [{ module: 'tek-bakis', metric: 'tek-bakis-span', start: 4 }, 'İlk Tek Bakışta turunda 4 harf kavradın; başlangıcın bu.'],
  'FTB-OA1': [{ module: 'okuma-anlama' }, 'İlk okuman tamam. Hızın ancak anladığında sayılır; acele etme.'],
  'MC-OA1': [{ module: 'okuma-anlama', metric: 'okuma-anlama-hiz', start: 200, current: 230 }, 'Okuma hızın başlangıcından iyi, anlaman da yerinde.'],
  'RG-OA1': [{ module: 'okuma-anlama' }, 'Bir süredir okumadın. Bugün kısa bir bulgu seni bekliyor.'],
  'RG-1': [{ module: 'dalga' }, 'Dalga sesi kaldığın yerde duruyor.'],
  'RG-2': [{ module: 'dalga' }, 'Dalga sesine yeniden hoş geldin.'],
  'RG-3': [SNAKE, 'Bir aradan sonra Yılan oyunu; kayıtların olduğu gibi duruyor.'],
  'RG-4': [{ module: 'tek-bakis' }, "Tek Bakışta oyununu yeniden açtın; önceki kayıtların Gelişim'de."],
  'RG-5': [UP1, "En son Dalga sesinden sonra sakinlik puanın 4'ten 7'ye çıkmıştı."],
  'RG-7': [{ module: 'tek-bakis' }, 'Tek Bakışta oyununa yeniden hoş geldin; kayıtların yerinde.'],
  'RG-8': [SNAKE, 'Yılan oyunu seni bekliyordu; kayıtların yerinde.'],
  'PD-1': [{ n: 4 }, 'Bu hafta yolu dördüncü kez bitirdin.'],
  'PD-2': [{ n: 4 }, 'Bu hafta dört gün yolun sonuna vardın.'],
  'PD-6': [{ n: 4 }, 'Bu hafta dört gün bütün durakları bitirdin.'],
  'PD-7': [{ n: 4 }, 'Bu hafta dördüncü kez yolun sonuna vardın.'],
  'PD-8': [{ n: 4 }, 'Bu hafta dört gün yolu bitirdin.'],
  'PD-9': [{ n: 4 }, 'Bugünle birlikte bu hafta yolu dört kez bitirdin.'],
  'PD-10': [{ n: 4 }, 'Bu hafta yolun sonuna dördüncü kez geldin.'],
}

const all = Object.entries(cells).flatMap(([cell, list]) => list.map((t) => ({ ...t, cell })))

describe('bank/tr.js · onaylı metinle harfi harfine', () => {
  it('onay dosyası okunuyor: 115 cümle (112 N1 + 3 Oku ve Anla)', () => {
    expect(approved).toHaveLength(115)
    expect(new Set(approved).size).toBe(115)
  })

  it.each(all.map((t) => [t.id, t]))('%s örnek veriyle onaylı cümleyi verir', (id, t) => {
    expect(EX[id], `${id} için örnek yok`).toBeDefined()
    const [facts, want] = EX[id]
    expect(approved).toContain(want)
    // örnek veri şablonun olgu koşullarını sağlar (şablon gerçek veride de seçilebilir)
    for (const n of t.needs ?? []) expect(NEEDS[n](facts), `${id} needs ${n}`).toBe(true)
    expect(render(t.text, facts, lexicon)).toBe(want)
  })

  it('bankada onay dosyası dışında cümle yok; her onaylı cümle bankada', () => {
    const ids = all.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(Object.keys(EX).sort()).toEqual([...ids].sort())
    const rendered = all.map((t) => render(t.text, EX[t.id][0], lexicon))
    expect(rendered.every((s) => approved.includes(s))).toBe(true)
    expect(new Set(rendered)).toEqual(new Set(approved))
    expect(all).toHaveLength(115)
  })

  it('kart etiketi onaylı: "Nef"', () => {
    expect(label).toBe('Nef')
    expect(onayText).toContain('kart etiketi: "Nef"')
    expect(bank.label).toBe(label)
    expect(lang).toBe('tr')
  })

  it('şablonda elle yazılmış rakam yok (sayıyı kod yazar)', () => {
    for (const t of all) expect(t.text.replace(/\{[^{}]*\}/g, ''), t.id).not.toMatch(/[0-9]/)
  })

  it('değer ya da ad yoksa cümle kurulmaz (uydurma yok)', () => {
    expect(render(cells['F1.A'][0].text, { ...F1A, earlyAt: undefined }, lexicon)).toBeNull()
    expect(render(cells.FT[0].text, { module: 'track' }, lexicon)).toBeNull()
    expect(render(cells.FT[0].text, { module: 'yoga' }, null)).toBeNull()
    expect(render('{bilinmeyen}', {}, lexicon)).toBeNull()
  })
})

// Nef kartı düğmeleri (sahip onayı 2026-10-02; onay dosyasının son bölümü)
describe('bank/tr.js · kart düğmeleri onaylı örneklerle harfi harfine', () => {
  const EXB = [
    ['slot', { part: 'evening', name: 'Dalga sesi', minutes: 8 }, 'Bu akşam da Dalga sesi · 8 dk'],
    ['day', { part: 'evening', name: 'Dalga sesi', minutes: 8 }, 'Bugün de Dalga sesi · 8 dk'],
    ['slot', { part: 'evening', name: 'Nefesin Ritmi', minutes: 12 }, 'Bu akşam da Nefesin Ritmi · 12 dk'],
    ['play', { minutes: 2 }, 'Bugünkü turu oyna · 2 dk'],
  ]
  it('onay dosyası okunuyor: dört onaylı örnek, bir yedek, iki kullanılmaz', () => {
    expect(btnApproved).toEqual(EXB.map((x) => x[2]))
    expect(btnSpare).toEqual(['Dalga sesini aç · 8 dk'])
    expect(btnRejected).toEqual(['Tek Bakışta · 2 dk', 'Şimdi Dalga sesi · 8 dk'])
  })
  it.each(EXB.map(([k, f, want]) => [want, k, f]))('"%s"', (want, kind, facts) => {
    expect(renderAction(kind, facts)).toBe(want)
    expect(bank.renderAction(kind, facts)).toBe(want)
  })
  it('dilim + da/de, cümle başı "Bu": sabah, öğlen, akşam, gece', () => {
    const f = { name: 'Dalga sesi', minutes: 8 }
    expect(renderAction('slot', { ...f, part: 'morning' })).toBe('Bu sabah da Dalga sesi · 8 dk')
    expect(renderAction('slot', { ...f, part: 'noon' })).toBe('Bu öğlen de Dalga sesi · 8 dk')
    expect(renderAction('slot', { ...f, part: 'evening' })).toBe('Bu akşam da Dalga sesi · 8 dk')
    expect(renderAction('slot', { ...f, part: 'night' })).toBe('Bu gece de Dalga sesi · 8 dk')
  })
  it('süre, ad ya da dilim yoksa düğme kurulmaz (süresiz kalıp yok)', () => {
    for (const kind of Object.keys(actions)) {
      expect(renderAction(kind, { part: 'evening', name: 'Dalga sesi' }), kind).toBeNull()
      expect(renderAction(kind, { part: 'evening', name: 'Dalga sesi', minutes: 0 }), kind).toBeNull()
      expect(renderAction(kind, { part: 'evening', name: 'Dalga sesi', minutes: 2.5 }), kind).toBeNull()
    }
    expect(renderAction('slot', { minutes: 8, name: 'Dalga sesi' })).toBeNull()
    expect(renderAction('slot', { minutes: 8, part: 'evening' })).toBeNull()
    expect(renderAction('day', { minutes: 8 })).toBeNull()
    expect(renderAction('yok', { minutes: 8 })).toBeNull()
  })
  it('geçmeyen kalıplar hiçbir girdide kurulmaz; bankada üç kalıp var, yedek yok, şablonda rakam yok', () => {
    expect(Object.keys(actions).sort()).toEqual(['day', 'play', 'slot'])
    const out = []
    const names = ['Dalga sesi', 'Nefesin Ritmi', 'Tek Bakışta', 'Tek Bakışta oyunu', 'nefes pratiği']
    for (const kind of Object.keys(actions)) {
      for (const part of [...Object.keys(DAY_PARTS), undefined]) for (const name of [...names, undefined]) for (const minutes of [1, 2, 5, 8, 12, 90]) {
        const t = renderAction(kind, { part, name, minutes })
        if (t) out.push(t)
      }
    }
    expect(out.length).toBeGreaterThan(0)
    for (const t of out) {
      expect(btnRejected).not.toContain(t)
      expect(btnSpare).not.toContain(t)
      expect(t).not.toMatch(/^Şimdi/)
      expect(t).not.toMatch(/^Tek Bakışta · /)
      expect(t).toMatch(/^(Bu (sabah|öğlen|akşam|gece) (da|de) |Bugün de |Bugünkü turu oyna)/)
      expect(t).toMatch(/ · \d+ dk$/)
    }
    for (const a of Object.values(actions)) expect(a.text.replace(/\{[^{}]*\}/g, '')).not.toMatch(/[0-9]/)
  })
})
