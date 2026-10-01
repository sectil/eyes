// Nef cümle bankası · Türkçe (Nef PLAN §4.6; ANA_OTURUM_ISTEMI N1 madde 1).
// YALNIZ sahip onaylı cümleler: docs/yol-haritasi/tasarim/nef/N1-CUMLELER-onay.md (2026-10-01, "Onaylıyorum"; 112 cümle
// ve kart etiketi). Kimlikler N1-CUMLELER-taslak.md ve kapi/tur2-cumleler.txt'ten. Onay dosyasında olmayan cümle buraya
// girmez; tr.test.js her şablonu örnek veriyle doldurup onaylı cümleyle harfi harfine karşılaştırır.
//
// Şablon: { id, text, needs?: [...], only?: { metric } }
//   text   yer tutuculu cümle; sayıyı, saati ve eki tr.grammar.js yazar.
//   needs  olgu koşulları (dil bilmez; speak.js NEEDS): cümle bir şeyi iddia ediyorsa o olgu olmadan seçilmez.
//          habit: saat kişinin yürüyüş alışkanlığından · remind: kurduğu hatırlatmadan · week: bu hafta en az 2 yürüyüş
//          (sayı söylenir; taslak F1 VARSAYIM) · early: öne alınacak saat var · covered: yağmur dilimin tamamında
//          ("akşam boyu") · avgDiff: yuvarlanmış ortalamalar farklı ("4'ten 4'e" yazılmaz) · twoWeeks: değer iki
//          haftadır yerinde · effect: önce–sonra olgusu var · metric: ölçüm olgusu var.
//   only   modüle özel cümle (plan §4.8 `cells`): yalnız bu metrikte.
//
// Yer tutucular (taslak §0 adlarıyla):
//   {walkAt} {earlyAt} {rainFrom} {rainTo}   saat; :LOC "19.30'da", :ABL "17.00'den", :DAT "22.00'ye", yalın "19.30"
//   {n}  sayı · {n:söz} "üç" · {n:SIRA} "dördüncü"
//   {dilim} "akşam" · {dilim:SAYILI} sayıdan sonra ("üç akşam", öğlen için "gün") · {dilim:ÇOĞUL} "akşamları";
//     {Dilim…} cümle başı
//   {modül}  türlü ad ve çekimleri (:ABL :ACC :LOC :DAT :INS :POSS :POSS-ABL); kaynak lexicon.names (ileride manifest
//     `nef.name`). Ad yoksa cümle kurulmaz.
//   {ölçü} "sakinlik", {ölçü:POSS} "sakinliğin", {Ölçü} · {önce} {sonra} {önceOrt} {sonraOrt} (:ABL :DAT)
//   {fark} ortalama fark, en çok bir ondalık · {başlangıç} {şimdi} (:ABL :DAT :GEÇMİŞ) · {metrik} {birim} · {feels}
import { clockWith, numberWith, numberWords, ordinalWords, possessive2, upperFirst, DAY_PARTS } from './tr.grammar.js'

export const lang = 'tr'
// Kart etiketi (onaylı; taslak KET-1)
export const label = 'Nef'

export const cells = Object.freeze({
  // ---------- F1 · yağmur, kişinin yürüyüş saatine denk geliyor (rainOnWalk) ----------
  // Bildirim başlığı (≤ 30)
  'F1.T': [
    { id: 'F1T-1', text: 'Yürüyüşün yağmura denk geliyor' },
    { id: 'F1T-2', text: 'Yağmur yürüyüş saatine yakın' },
    { id: 'F1T-4', text: 'Yürüyüşünle yağmur çakışabilir' },
    { id: 'F1T-7', text: 'Yürüyüşünde yağmur ihtimali' },
    { id: 'F1T-8', text: 'Yağmur yürüyüşüne denk gelebilir' },
    { id: 'F1T-9', text: 'Yürüyüş saatinde yağmur bekleniyor' },
  ],
  // Yürüyüş saatin yağmurun içinde
  'F1.A': [
    { id: 'F1A-1', needs: ['habit', 'week', 'early'], text: "Bu hafta {n:söz} {dilim:SAYILI} {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin." },
    { id: 'F1A-3', needs: ['habit', 'early'], text: 'Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.' },
    { id: 'F1A-5', needs: ['habit', 'early'], text: 'Her zamanki {walkAt} yürüyüşünü {earlyAt:DAT} alırsan yağmurdan önce dönebilirsin; yağmur {rainFrom:LOC} bekleniyor.' },
    { id: 'F1A-8', needs: ['habit', 'early'], text: 'Son günlerde {dilim:ÇOĞUL} {walkAt:LOC} yürüyorsun. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.' },
    { id: 'F1A-10', needs: ['habit', 'early'], text: '{Dilim:ÇOĞUL} genelde {walkAt:LOC} yürüyorsun. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.' },
  ],
  // Yürüyüşün yağmurdan az önce
  'F1.B': [
    { id: 'F1B-2', needs: ['habit'], text: '{Dilim} yürüyüşlerin genelde {walkAt:LOC}. Bugün yağmur biraz sonra, {rainFrom:LOC} bekleniyor; kısa bir tur sığabilir.' },
    { id: 'F1B-3', needs: ['habit'], text: 'Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; ondan önce dönebilirsin.' },
    { id: 'F1B-4', needs: ['habit'], text: 'Her zamanki {walkAt} yürüyüşünle yağmur arasında az zaman var: yağmur {rainFrom:LOC} bekleniyor.' },
    { id: 'F1B-7', needs: ['habit', 'week'], text: 'Bu hafta {n:söz} {dilim:SAYILI} {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; ondan önce dönebilirsin.' },
    { id: 'F1B-8', needs: ['habit'], text: '{Dilim:ÇOĞUL} genelde {walkAt:LOC} yürüyorsun. Yağmur bugün {rainFrom:LOC} bekleniyor; kısa bir tur yağmurdan önce biter.' },
    { id: 'F1B-9', text: 'Yürüyüş saatin {walkAt}; yağmur bugün {rainFrom:LOC} bekleniyor. Yağmurdan önce dönmeye vakit var.' },
    { id: 'F1B-10', needs: ['habit'], text: 'Her zamanki {walkAt} yürüyüşün yağmurdan önce bitebilir; yağmur {rainFrom:LOC} bekleniyor.' },
  ],
  // Yürüyüş saatinin tamamında yağmur
  'F1.C': [
    { id: 'F1C-5', text: '{walkAt} senin yürüyüş saatin; bugün yağmur {rainTo:DAT} kadar bekleniyor. Yürüyüşü yarına bırakmak da olur.' },
    { id: 'F1C-6', needs: ['habit', 'week', 'covered'], text: 'Bu hafta {n:söz} {dilim:SAYILI} {walkAt:LOC} yürüdün. Bugün {dilim} boyu yağmur bekleniyor; içeride kısa bir yürüyüş de olur.' },
    { id: 'F1C-7', needs: ['habit'], text: '{Dilim} yürüyüşlerin genelde {walkAt:LOC}. Bugün yağmur {rainFrom:ABL} {rainTo:DAT} kadar bekleniyor; yürüyüşü yarına bırakmak da olur.' },
    { id: 'F1C-10', needs: ['habit', 'covered'], text: 'Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün {dilim} boyu yağmur bekleniyor; yürüyüş yarına kalabilir.' },
  ],
  // Aynı hafta ikinci kez (tükenirse speak.js F1.A ve F1.E'den seçer)
  'F1.D': [
    { id: 'F1D-5', needs: ['habit', 'early'], text: '{Dilim} yürüyüşlerin genelde {walkAt:LOC}; bugün de yağmur {rainFrom:LOC} bekleniyor. {earlyAt:LOC} çıkmak da olur.' },
    { id: 'F1D-8', needs: ['early'], text: 'Yürüyüş saatin {walkAt}; bugün de yağmur {rainFrom:LOC} bekleniyor. İstersen {earlyAt:LOC} çık.' },
  ],
  // Saat kişinin kurduğu hatırlatmadan
  'F1.E': [
    { id: 'F1E-1', needs: ['remind', 'early'], text: 'Yürüyüş hatırlatman {walkAt:LOC}. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.' },
    { id: 'F1E-4', needs: ['early'], text: '{walkAt} senin yürüyüş saatin. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.' },
    { id: 'F1E-5', needs: ['remind', 'early'], text: 'Yürüyüşünü {walkAt:DAT} kurmuştun. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.' },
    { id: 'F1E-8', needs: ['remind', 'early'], text: 'Yürüyüş için seçtiğin saat {walkAt}. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.' },
  ],

  // ---------- F3 · sıcak, kişinin yürüyüş saatinde (hotWalk; yalnız Nef kartı, sahip kararı) ----------
  // Yağmurla aynı gün (saatsiz; saat bildirimde)
  'F3.A': [
    { id: 'F3A-1', text: 'Hissedilen {feels} derece; suyunu yanına al.' },
    { id: 'F3A-2', text: 'Hissedilen {feels} derece; su yanında olsun.' },
    { id: 'F3A-4', text: 'Hissedilen {feels} derece; gölgeli yolu seçebilirsin.' },
    { id: 'F3A-5', text: 'O saatte hissedilen {feels} derece; bir şişe su yanında olsun.' },
    { id: 'F3A-6', text: 'Hissedilen {feels} derece; yolda su yanında olsun.' },
    { id: 'F3A-8', text: 'Hissedilen {feels} derece; yanına su almak iyi olur.' },
    { id: 'F3A-9', text: 'Hissedilen {feels} derece; gölgede yürümek daha rahat olabilir.' },
  ],
  // Yağmursuz gün
  'F3.B': [
    { id: 'F3B-1', needs: ['habit'], text: 'Her zamanki {walkAt} yürüyüşünde hissedilen {feels} derece; suyunu yanına al.' },
    { id: 'F3B-2', text: '{walkAt} yürüyüşünde hissedilen {feels} derece bekleniyor; su yanında olsun.' },
    { id: 'F3B-5', needs: ['habit'], text: '{Dilim} yürüyüşlerin genelde {walkAt:LOC}; o saatte hissedilen {feels} derece. Su yanında olsun.' },
    { id: 'F3B-6', text: 'Yürüyüş saatin {walkAt}; hissedilen {feels} derece. Gölge ve su işine yarar.' },
    { id: 'F3B-7', needs: ['habit'], text: '{Dilim} yürüyüşlerin genelde {walkAt:LOC}; o saatte hissedilen {feels} derece bekleniyor. Suyunu yanına al.' },
    { id: 'F3B-9', text: 'Yürüyüş saatin {walkAt}; o saatte hissedilen {feels} derece bekleniyor. Su yanında olsun.' },
  ],

  // ---------- F2 · seni hatırlayan Nef (recallEffect, effectPattern) ----------
  // Geçen haftanın aynı anı, puan çıktı (better: up)
  'F2.A': [
    { id: 'F2A-1', text: 'Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} çıkmıştı.' },
    { id: 'F2A-3', text: 'Geçen hafta bu {dilim} {ölçü} puanın {modül:ABL} önce {önce}, sonra {sonra} olmuştu.' },
    { id: 'F2A-4', text: 'Bir hafta önce bu saatlerde {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} yükselmişti.' },
    { id: 'F2A-5', text: 'Geçen hafta bu {dilim} {modül:ACC} seçmiştin; {ölçü} puanın {önce:ABL} {sonra:DAT} çıkmıştı.' },
    { id: 'F2A-8', text: 'Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} çıkmıştı.' },
    { id: 'F2A-10', text: 'Bir hafta önce bu saatlerde {modül:ACC} seçmiştin; {ölçü:POSS} {önce:ABL} {sonra:DAT} yükselmişti.' },
  ],
  // Geçen haftanın aynı anı, puan indi (better: down)
  'F2.B': [
    { id: 'F2B-1', text: 'Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} inmişti.' },
    { id: 'F2B-2', text: 'Geçen hafta bu {dilim} {modül} bitince {ölçü} puanın {önce:ABL} {sonra:DAT} azalmıştı.' },
    { id: 'F2B-4', text: 'Bir hafta önce bu saatlerde {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} düşmüştü.' },
    { id: 'F2B-5', text: 'Geçen hafta bu {dilim} {modül:ACC} seçmiştin; {ölçü} puanın {önce:ABL} {sonra:DAT} inmişti.' },
    { id: 'F2B-8', text: 'Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} düşmüştü.' },
    { id: 'F2B-9', text: 'Bir hafta önce bu saatlerde {modül:ACC} seçmiştin; {ölçü:POSS} {önce:ABL} {sonra:DAT} inmişti.' },
  ],
  // Son seanslarda ortalama artış (en az 3 seans, anlamlı)
  'F2.C': [
    { id: 'F2C-1', text: '{modül:ABL} sonra {ölçü} puanın son {n} seansta ortalama {fark} puan arttı.' },
    { id: 'F2C-2', needs: ['avgDiff'], text: 'Son {n} {modül} seansında {ölçü} puanın ortalama {önceOrt:ABL} {sonraOrt:DAT} çıktı.' },
    { id: 'F2C-5', text: '{Ölçü} puanın {modül:ABL} sonra son {n} seansta ortalama {fark} puan yükseldi.' },
    { id: 'F2C-7', text: 'Tek seferlik değil: son {n} {modül} seansında {ölçü} puanın ortalama {fark} puan arttı.' },
    { id: 'F2C-9', needs: ['avgDiff'], text: '{modül:ABL} sonra {ölçü:POSS} son {n} seansta ortalama {önceOrt:ABL} {sonraOrt:DAT} çıktı.' },
    { id: 'F2C-10', text: 'Son {n} seansta {modül:ABL} sonra {ölçü:POSS} ortalama {fark} puan yükseldi.' },
  ],
  // Son seanslarda ortalama düşüş (better: down)
  'F2.D': [
    { id: 'F2D-1', text: '{modül:ABL} sonra {ölçü} puanın son {n} seansta ortalama {fark} puan azaldı.' },
    { id: 'F2D-2', needs: ['avgDiff'], text: 'Son {n} {modül} seansında {ölçü} puanın ortalama {önceOrt:ABL} {sonraOrt:DAT} indi.' },
    { id: 'F2D-5', text: '{Ölçü} puanın {modül:ABL} sonra son {n} seansta ortalama {fark} puan düştü.' },
    { id: 'F2D-6', text: 'Tek seferlik değil: son {n} {modül} seansında {ölçü} puanın ortalama {fark} puan azaldı.' },
    { id: 'F2D-9', text: 'Son {n} seansta {modül:ABL} sonra {ölçü:POSS} ortalama {fark} puan düştü.' },
  ],

  // ---------- F4 · susan Nef ----------
  // Söyleyecek yeni şey yok, yol var ve bitmedi
  'F4.A': [
    { id: 'F4A-2', text: 'Bugün söyleyecek yeni bir şeyim yok. Yolun hazır.' },
    { id: 'F4A-7', text: 'Bugün yalnız yolun var; acelesi yok.' },
    { id: 'F4A-8', text: 'Bugün benden yeni bir not yok. Yolun hazır.' },
    { id: 'F4A-9', text: 'Bugün yeni bir haberim yok. Yolun hazır.' },
    { id: 'F4A-11', text: 'Bugün senin için yeni bir not yok; yolun hazır.' },
    { id: 'F4A-13', text: 'Bugün kısa bir not: yolun hazır.' },
  ],
  // Söyleyecek yeni şey yok, yol yok ya da bitti
  'F4.B': [
    { id: 'F4B-2', text: 'Bugün söyleyecek yeni bir şeyim yok.' },
    { id: 'F4B-4', text: 'Bugün yeni bir haber yok; gün senin.' },
    { id: 'F4B-6', text: 'Bugün benden yeni bir not yok.' },
    { id: 'F4B-8', text: 'Bugün yeni bir haberim yok.' },
    { id: 'F4B-9', text: 'Bugün senin için yeni bir not yok.' },
    { id: 'F4B-11', text: 'Bugün benden yeni bir haber yok; gün senin.' },
    { id: 'F4B-12', text: 'Bugün yeni bir şey yok; dinlenmek de olur.' },
  ],
  // Günlerce aradan sonra uygulamaya dönüş
  'F4.C': [
    { id: 'F4C-1', text: 'Hoş geldin; bugün nereden başlayacağın sende.' },
    { id: 'F4C-3', text: 'Yeniden buradasın; yolun hazır.' },
    { id: 'F4C-4', text: 'Hoş geldin; bugün kısa bir durak da yeter.' },
    { id: 'F4C-7', text: 'Hoş geldin; geçmiş kayıtların yerinde, yolun hazır.' },
    { id: 'F4C-8', text: 'Hoş geldin; kayıtların yerinde.' },
    { id: 'F4C-9', text: 'Yeniden hoş geldin; yolun hazır.' },
    { id: 'F4C-10', text: 'Hoş geldin; bugün birkaç dakika da yeter.' },
  ],

  // ---------- Genel an türleri (plan §4.8) ----------
  // metricChange: bir ölçüde kalıcı ilerleme (yalnız better: up; aşağı-iyi metrik için onaylı cümle yok)
  MC: [
    { id: 'MC-2', text: '{modül:LOC} {metrik} {başlangıç:ABL} {şimdi:DAT} çıktı.' },
    { id: 'MC-10', text: '{modül:LOC} {metrik} başlangıçta {başlangıç:GEÇMİŞ}, şimdi {şimdi}.' },
    { id: 'MC-11', text: '{modül:LOC} ilerleme var: {metrik} {başlangıç:ABL} {şimdi:DAT} çıktı.' },
    { id: 'MC-12', needs: ['twoWeeks'], text: 'İki haftadır {modül:LOC} {metrik} {şimdi}; başlangıçta {başlangıç:GEÇMİŞ}.' },
    { id: 'MC-15', text: '{modül:LOC} {metrik} artık {şimdi}; başlangıçta {başlangıç:GEÇMİŞ}.' },
  ],
  // firstTime.A: bir modülde ilk gün
  FT: [
    { id: 'FT-1', text: 'İlk {modül:POSS} tamam.' },
    { id: 'FT-2', text: '{modül:ACC} ilk kez denedin.' },
    { id: 'FT-6', text: '{modül:LOC} ilk günün geride kaldı.' },
    { id: 'FT-7', text: '{modül:INS} ilk günün tamam.' },
    { id: 'FT-8', text: '{modül:DAT} ilk adımı attın.' },
    { id: 'FT-10', text: 'İlk {modül:POSS} geride kaldı.' },
  ],
  // firstTime.B: bir modülde ilk ölçüm ya da ilk önce–sonra puanı (yalnız iyi yönde, up)
  FTB: [
    { id: 'FTB-2', needs: ['metric'], text: 'Başlangıç sayın belli oldu: {modül:LOC} {başlangıç} {birim}.' },
    { id: 'FTB-4', needs: ['effect'], text: 'İlk {modül:POSS-ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} çıktı.' },
    // Modüle özel ("kavradın" fiili yalnız Tek Bakışta için doğru)
    { id: 'FTB-8', needs: ['metric'], only: { metric: 'tek-bakis-span' }, text: 'İlk Tek Bakışta turunda {başlangıç} harf kavradın; başlangıcın bu.' },
  ],
  // returnAfterGap: bir modüle uzun aradan dönüş
  RG: [
    { id: 'RG-1', text: '{modül} kaldığın yerde duruyor.' },
    { id: 'RG-2', text: '{modül:DAT} yeniden hoş geldin.' },
    { id: 'RG-3', text: 'Bir aradan sonra {modül}; kayıtların olduğu gibi duruyor.' },
    { id: 'RG-4', text: "{modül:ACC} yeniden açtın; önceki kayıtların Gelişim'de." },
    { id: 'RG-5', needs: ['effect'], text: 'En son {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} çıkmıştı.' },
    { id: 'RG-7', text: '{modül:DAT} yeniden hoş geldin; kayıtların yerinde.' },
    { id: 'RG-8', text: '{modül} seni bekliyordu; kayıtların yerinde.' },
  ],
  // pathDone: bugünkü yol bitti, haftanın sayısı
  PD: [
    { id: 'PD-1', text: 'Bu hafta yolu {n:SIRA} kez bitirdin.' },
    { id: 'PD-2', text: 'Bu hafta {n:söz} gün yolun sonuna vardın.' },
    { id: 'PD-6', text: 'Bu hafta {n:söz} gün bütün durakları bitirdin.' },
    { id: 'PD-7', text: 'Bu hafta {n:SIRA} kez yolun sonuna vardın.' },
    { id: 'PD-8', text: 'Bu hafta {n:söz} gün yolu bitirdin.' },
    { id: 'PD-9', text: 'Bugünle birlikte bu hafta yolu {n:söz} kez bitirdin.' },
    { id: 'PD-10', text: 'Bu hafta yolun sonuna {n:SIRA} kez geldin.' },
  ],
})

// ---------- Doldurma ----------
const PH_RE = /\{([^{}:]+)(?::([^{}]+))?\}/g
const CLOCKS = new Set(['walkAt', 'earlyAt', 'rainFrom', 'rainTo'])
const NUMS = { önce: 'before', sonra: 'after', başlangıç: 'start', şimdi: 'current' }
const AVGS = { önceOrt: 'beforeAvg', sonraOrt: 'afterAvg' }
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

// Modülün türlü adı ve çekimleri: lexicon.names[effect] ya da lexicon.names[module] → { '': yalın, ABL, ACC, … }.
// VARSAYIM: ad çekimleri ileride manifest `nef.name`'den gelir (N1 madde 3, sonraki aşama); o zamana dek çağıran verir.
function nameOf(facts, lexicon, form) {
  const names = lexicon?.names ?? {}
  const forms = (facts.effect && names[facts.effect]) || (facts.module && names[facts.module]) || null
  const v = forms?.[form || '']
  return typeof v === 'string' && v ? v : null
}

// Ölçü sözcüğü: lexicon.measures[effect] varsa o; yoksa manifestin `measure` alanı (bugün Türkçe yazılı; VARSAYIM:
// başka dilde lexicon.measures zorunlu olur, manifest sözcüğüne düşülmez — o dilin bankası kendi lexicon'unu verir).
function measureOf(facts, lexicon, form) {
  const own = lexicon?.measures?.[facts.effect]
  const word = own?.[''] ?? (typeof facts.measure === 'string' && facts.measure ? facts.measure : null)
  if (!word) return null
  if (!form) return word
  if (form === 'POSS') return own?.POSS ?? possessive2(word)
  return null
}

// Ölçüm (metrik) sözcüğü ve birimi: lexicon.metrics[metric] → { word, unit, percent? }
const metricOf = (facts, lexicon) => lexicon?.metrics?.[facts.metric] ?? null

function value(name, form, facts, lexicon) {
  const cap = name[0] !== name[0].toLocaleLowerCase(lang)
  const key = cap ? name[0].toLocaleLowerCase(lang) + name.slice(1) : name
  const up = (s) => (s && cap ? upperFirst(s, lang) : s)
  if (CLOCKS.has(key)) return Number.isInteger(facts[key]) ? clockWith(facts[key], form || null, lang) : null
  if (key === 'n') {
    if (!Number.isInteger(facts.n)) return null
    if (form === 'söz') return numberWords(facts.n)
    if (form === 'SIRA') return ordinalWords(facts.n)
    return form ? null : numberWith(facts.n, null, lang)
  }
  if (key === 'dilim') return up(DAY_PARTS[facts.part]?.[form || ''] ?? null)
  if (key === 'modül') return up(nameOf(facts, lexicon, form))
  if (key === 'ölçü') return up(measureOf(facts, lexicon, form))
  if (key === 'fark') return isNum(facts.gain) && !form ? numberWith(facts.gain, null, lang) : null
  if (key === 'feels') return isNum(facts.feels) && !form ? numberWith(Math.round(facts.feels), null, lang) : null
  if (key in AVGS) return isNum(facts[AVGS[key]]) ? numberWith(Math.round(facts[AVGS[key]]), form || null, lang) : null
  if (key in NUMS) {
    const v = facts[NUMS[key]]
    const m = metricOf(facts, lexicon)
    return isNum(v) ? numberWith(v, form || null, lang, { percent: Boolean(m?.percent) }) : null
  }
  if (key === 'metrik') return up(metricOf(facts, lexicon)?.word ?? null)
  if (key === 'birim') {
    const m = metricOf(facts, lexicon)
    return m ? (m.unit ?? '') : null
  }
  return null
}

// Şablon + olgular → cümle ya da null (yer tutucu bilinmiyor ya da değeri yok: cümle kurulmaz, başka cümle de uydurulmaz).
// Cümle başı büyük harfle ("nefes pratiğinden sonra …" → "Nefes pratiğinden sonra …").
export function render(text, facts = {}, lexicon = null) {
  let bad = false
  const out = String(text).replace(PH_RE, (_, name, form) => {
    const v = value(name, form, facts ?? {}, lexicon)
    if (v == null) bad = true
    return v ?? ''
  })
  if (bad) return null
  return upperFirst(out.replace(/ {2,}/g, ' ').replace(/ ([.,;:])/g, '$1').trim(), lang)
}

export default { lang, label, cells, render }
