// Fark Ettin mi? ekran metinleri: tek kaynak (fark-ettin-mi/METINLER.md). Kural: ekrana yalnız onaylı metin çıkar.
// Onaylı = sahip onaylı (S; METINLER "Sahip onayı" ve "Yeni metinler (2026-10-02)" bölümleri, harfi harfine) ya da bugünkü
// uygulamada zaten görünen metin ('onayli', aynen). Taslaklar (T; yalnız Nef N1–N4) metinsiz durur: say() null döner.
// METINLER örnekleri doldurulmuş hâldir; burada örneğin yerinde yer tutucu durur ({N} {B} {i} {n} {sahne} {dk} {görev}
// {Yer} {kim} {soru} {hedef} {ad} {Ad} {hayvan} {Hayvan} {yer} {iyelik} {X} {Y}). " / " satır ayırıcıdır.
// Türkçe ek: yalnız lib/nef/bank/tr.grammar.js (suffixFor 'GEÇMİŞ', upperFirst); M3'ün "-da/-de" hâli hedef başına açık
// tablodur (FOCUS; tr.grammar'da çoğul belirtme ekini çözen işlev yok).
import { COLORS } from './streetScenes.js'
import { ITEMS, VENDORS, TASKS } from './street.js'
import { VERDICT_WORD } from './changeText.js'
import { suffixFor, upperFirst } from './nef/bank/tr.grammar.js'

const OK = 'onayli'
const S = 'S'
const T = 'T'
const s = (text) => ({ status: S, text })
const map = (prefix, obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${prefix}.${k}`, s(v)]))

// Sayma görevleri: görev / soru (bugünkü dört görev 'onayli', öbürleri S)
const TASK_TEXT = {
  redCar: ['Kırmızı arabaları say', 'Kaç kırmızı araba geçti?'],
  dog: ['Köpekleri say', 'Kaç köpek gördün?'],
  hat: ['Şapkalı kişileri say', 'Kaç şapkalı kişi gördün?'],
  glasses: ['Gözlüklü kişileri say', 'Kaç gözlüklü kişi gördün?'],
  litShop: ['Işıklı vitrinleri say', 'Kaç ışıklı vitrin gördün?'],
  redUmbrella: ['Kırmızı şemsiyeleri say', 'Kaç kırmızı şemsiye gördün?'],
  yellowCoat: ['Sarı yağmurluk giyenleri say', 'Kaç kişi sarı yağmurluk giyiyordu?'],
  watermelon: ['Karpuzları say', 'Kaç karpuz gördün?'],
  hatVendor: ['Şapkalı satıcıları say', 'Kaç şapkalı satıcı gördün?'],
  redCrate: ['Kırmızı kasaları say', 'Kaç kırmızı kasa gördün?'],
  basket: ['Sepetleri say', 'Kaç sepet gördün?'],
  flowerBucket: ['Çiçek dolu kovaları say', 'Kaç çiçek dolu kova gördün?'],
  balloon: ['Balonları say', 'Kaç balon gördün?'],
  kite: ['Uçurtmaları say', 'Kaç uçurtma gördün?'],
  runner: ['Koşanları say', 'Kaç kişi koşuyordu?'],
  ball: ['Topları say', 'Kaç top gördün?'],
  stroller: ['Bebek arabalarını say', 'Kaç bebek arabası geçti?'],
  pigeon: ['Güvercinleri say', 'Kaç güvercin gördün?'],
}
// M3 "Gözün {hedef} olsun." için hedefin "-da/-de" hâli: görev adından elle türetildi (açık tablo; ana oturum denetler).
// "mavi arabalarda" M3'ün onaylı örneğidir.
export const FOCUS = {
  blueCar: 'mavi arabalarda', taxi: 'sarı taksilerde', cat: 'kedilerde', bike: 'bisikletlerde',
  redCar: 'kırmızı arabalarda', dog: 'köpeklerde', hat: 'şapkalı kişilerde', glasses: 'gözlüklü kişilerde',
  litShop: 'ışıklı vitrinlerde', redUmbrella: 'kırmızı şemsiyelerde', yellowCoat: 'sarı yağmurluk giyenlerde',
  watermelon: 'karpuzlarda', hatVendor: 'şapkalı satıcılarda', redCrate: 'kırmızı kasalarda', basket: 'sepetlerde',
  flowerBucket: 'çiçek dolu kovalarda', balloon: 'balonlarda', kite: 'uçurtmalarda', runner: 'koşanlarda',
  ball: 'toplarda', stroller: 'bebek arabalarında', pigeon: 'güvercinlerde',
}
// "Gözünden kaçan": {kim} ve ayrıntı sorusu (şablon kimliğiyle; lib/street.js TEMPLATES)
const WHO = {
  laugh: 'kahkaha atan bir kadın', blonde: 'sarışın bir kadın', child: 'çocuklu bir kadın', hat: 'şapkalı bir adam',
  vendor: 'bir sokak satıcısı', shop: 'yeşil tenteli bir dükkân', stall: 'yeşil tenteli bir tezgâh', beard: 'sakallı bir adam',
  dogwalker: 'köpeğini gezdiren biri', scarf: 'atkılı bir kadın', cyclist: 'bisikletli biri', scooter: 'scooter süren biri',
  cane: 'bastonlu yaşlı bir adam', flowers: 'elinde çiçek olan bir kadın', musician: 'çalgı çalan bir adam',
  umbrella: 'şemsiyeli biri', helmet: 'baretli bir işçi', kite: 'uçurtma uçuran bir çocuk',
}
const ASK = {
  laugh: 'Elbisesi ne renkti?', blonde: 'Çantası ne renkti?', child: 'Çocuğun elinde ne vardı?', hat: 'Şapkası ne renkti?',
  vendor: 'Ne satıyordu?', shop: 'Hangi dükkândı?', stall: 'Tabelasında ne yazıyordu?', beard: 'Tişörtü ne renkti?',
  dogwalker: 'Köpeği ne renkti?', scarf: 'Atkısı ne renkti?', cyclist: 'Bisikleti ne renkti?', scooter: 'Scooter ne renkti?',
  cane: 'Tişörtü ne renkti?', flowers: 'Çiçekler ne renkti?', musician: 'Ne çalıyordu?', umbrella: 'Şemsiyesi ne renkti?',
  helmet: 'Bareti ne renkti?', kite: 'Uçurtması ne renkti?',
}
// Nesne adları (değişebilen nesneler, lib/streetChange.js OBJECTS; kişinin üstü: elbise ya da tişört)
const OBJ = {
  cat: 'kedi', dog: 'köpek', bike: 'bisiklet', scooter: 'scooter', pot: 'saksı', bin: 'çöp kutusu', aboard: 'ayaklı tabela',
  ball: 'top', suitcase: 'valiz', stroller: 'bebek arabası', crate: 'kasa', bucket: 'kova', chair: 'sandalye',
  pigeon: 'güvercin', basket: 'sepet', cone: 'koni', watermelon: 'karpuz', bench: 'bank', hydrant: 'yangın musluğu',
  awning: 'tente', door: 'kapı', hat: 'şapka', bag: 'çanta', tshirt: 'tişört', dress: 'elbise', scarf: 'atkı',
  umbrella: 'şemsiye', balloon: 'balon', phone: 'telefon', glasses: 'gözlük',
}
// Kişide beliren parçanın yeri ve iyelik hâli
const ON_PERSON = {
  hat: ['başında', 'şapkası'], bag: ['omzunda', 'çantası'], scarf: ['boynunda', 'atkısı'], umbrella: ['elinde', 'şemsiyesi'],
  balloon: ['elinde', 'balonu'], phone: ['elinde', 'telefonu'], glasses: ['gözünde', 'gözlüğü'],
}
const ANIMALS = ['cat', 'dog', 'pigeon']

export const TEXTS = {
  // Görev ekranı
  M1: s('Fark Ettin mi? · 2 dk · {sahne}'),
  M2: s('Görevin / {görev}'),
  M3: s('Gözün {hedef} olsun. Sonunda birkaç sorum var.'),
  M4: s('01 Caddeden geç · 40 sn / 02 Ne değişti? · 4 sahne / 03 Gözünden kaçan · 2 soru'),
  M5: { status: OK, text: 'Bu bir fark etme alıştırması. Gerçek hayatta daha çok fark ettirdiği gösterilmedi.' },
  M6: { status: OK, text: 'Yürümeye başla' },
  // Ne değişti?
  D1: s('Ne değişti? · {i} / {n}'),
  D2: s('Bir şey değişti. Nerede?'),
  D3: s('Değişen yere dokun.'),
  D4: s('Bu sahnede {N} nesne var'),
  D5: s('Bulamadım, bir daha göster'),
  D6: s('Buldun.'),
  D7: s('{Ne} {önce}ydı, {sonra} oldu'), // "ydı" yerine tr.grammar suffixFor 'GEÇMİŞ': changeSentence
  D8: { status: S, parts: ['D8.1', 'D8.2'] },
  'D8.1': s('İlk bakışta buldun. Sıradaki sahnede {N} nesne var.'),
  'D8.2': s('İkinci bakışta buldun. Sıradaki sahnede {N} nesne var.'),
  D9: s('Burasıydı. Sıradaki sahnede {N} nesne var.'),
  'change.gelir': s('Bir {ad} eklendi'),
  'change.gider': s('{Ad} artık yok'),
  'change.geldi': s('Bir {hayvan} geldi'),
  'change.gitti': s('{Hayvan} gitti'),
  'change.belirdi': s('Birinin {yer} {ad} belirdi'),
  'change.yokOldu': s('Birinin {iyelik} yok oldu'),
  'change.yer': s('{Ad} yer değiştirdi'),
  'change.tabela': s('Tabelada {X} harfi {Y} oldu'),
  // Gözünden kaçan: G2 "{Yer} {kim} vardı." + onaylı "Onu fark ettin mi?"; G4 ayrıntı + onaylı "Görmediysen de tahmin et."
  G1: s('Gözünden kaçan · {i} / 2'),
  G2: s('{Yer} {kim} vardı. / Onu fark ettin mi?'),
  G3: s('Gördüm · Görmedim'),
  G4: s('{soru} / Görmediysen de tahmin et.'),
  G5: s('{sahne} · {dk} dk önce'),
  'Ş1': s('Görmediğini düşünsen de doğru bildin. Araştırmalarda bu tür tahminler şanstan daha sık tutuyor.'),
  ...map('who', WHO),
  ...map('ask', ASK),
  // Sonuç
  R1: s('Bugünkü turun'),
  R2: s('{N} nesne / Değişikliği {N} nesnenin olduğu kalabalık bir sahnede buldun.'),
  R3: s(VERDICT_WORD.unclear), // ayrı çip metni yok: Gelişim'in onaylı sözü (lib/changeText.js)
  R4: s('Başlangıç: {B} nesne · Bugün: {N} nesne'),
  'R5.tags': s('TAM / YAKIN / KAÇTI / GÖRDÜN / TAHMİN'),
  R5: s('{görev}: {n} geçti, sen de {n} dedin'),
  R6: { status: OK, text: 'Bitti' },
  // Yol durağı
  Y1: s('Caddeden geç, değişeni bul · 2 dk'),
  Y2: s('Yeni sahne: {sahne} · 2 dk'),
  // Nef: sahip kararıyla onaylı listede yok (taslak)
  N1: { status: T }, N2: { status: T }, N3: { status: T }, N4: { status: T },
  // Sahne adları ve soru başındaki yer
  ...map('scene', { cadde: 'Cadde', pazar: 'Pazar yeri', park: 'Park', aksam: 'Akşam ışıkları', yagmur: 'Yağmurlu cadde' }),
  ...map('place', { cadde: 'Caddede', aksam: 'Caddede', yagmur: 'Caddede', pazar: 'Pazar yerinde', park: 'Parkta' }),
  // Sayma görevleri ve odak
  'task.label': { status: OK, text: 'Görevin' },
  ...Object.fromEntries(TASKS.flatMap((t) => [[`task.${t.id}`, { status: OK, text: t.text }], [`count.${t.id}`, { status: OK, text: t.q }]])),
  ...Object.fromEntries(Object.entries(TASK_TEXT).flatMap(([id, [task, q]]) => [[`task.${id}`, s(task)], [`count.${id}`, s(q)]])),
  ...map('focus', FOCUS),
  // Tek sözcükler: çalgılar, tezgâh tabelaları, ek renk adları, nesne adları
  ...map('instrument', { gitar: 'Gitar', keman: 'Keman', akordeon: 'Akordeon', flut: 'Flüt' }),
  ...map('stall', { ELMA: 'Elma', LİMON: 'Limon', ARMUT: 'Armut', PORTAKAL: 'Portakal', İNCİR: 'İncir', KAVUN: 'Kavun', ERİK: 'Erik', KİRAZ: 'Kiraz', NAR: 'Nar' }),
  ...map('color', { gri: 'gri', kahve: 'kahverengi', lacivert: 'lacivert', bordo: 'bordo' }),
  ...map('obj', OBJ),
}
// Bilinmeyen kimlik taslak sayılır (say → null).
export const isApproved = (id) => [OK, S].includes(TEXTS[id]?.status) && typeof TEXTS[id]?.text === 'string'
// Onaylı metin ({ad} yer tutucuları doldurulur) ya da null (taslak ya da bilinmeyen kimlik: ekrana çıkmaz)
export function say(id, vars = {}) {
  if (!isApproved(id)) return null
  return TEXTS[id].text.replace(/\{([^{}]+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m))
}
// Ekranın kullanacağı tek yol: onaylıysa metin, değilse kimlik yer tutucusu (görünür cümle değil; geliştirici görür)
export const textOr = (id, vars) => say(id, vars) ?? `⟨${id}⟩`
// " / " ile ayrılmış satırlar
export const lines = (id, vars) => say(id, vars)?.split(' / ') ?? null
const up = (w) => upperFirst(w, 'tr')

// Renk adı: 8 temel renk (bugünkü ekran) ve ek renk adları
export const colorName = (k) => COLORS[k]?.name ?? say(`color.${k}`)
// Seçenek adları: renk, çocuğun elindeki, satıcının sattığı ve dükkân adı bugünkü ekranda var; çalgı ve tezgâh adı S
export function optionText(detail, id, v) {
  if (detail === 'color') return colorName(v)
  if (id === 'child') return ITEMS[v] ?? null
  if (id === 'vendor') return VENDORS[v] ?? null
  if (id === 'musician') return say(`instrument.${v}`)
  if (detail === 'stall') return say(`stall.${v}`)
  if (detail === 'shop') return v.charAt(0) + v.slice(1).toLocaleLowerCase('tr')
  return null
}
export const sceneName = (scene) => say(`scene.${scene}`)
// Görev ekranı satırları: görev adı, M3 odak cümlesi, sayı sorusu
export const taskLines = (taskId) => {
  const hedef = say(`focus.${taskId}`)
  return { task: say(`task.${taskId}`), focus: hedef ? say('M3', { hedef }) : null, count: say(`count.${taskId}`) }
}
// "Gözünden kaçan": ilk soru (G2, iki satır), cevaplar (G3) ve ayrıntı sorusu (G4, iki satır)
export function missedLines(id, scene) {
  const Yer = say(`place.${scene}`)
  const kim = say(`who.${id}`)
  const soru = say(`ask.${id}`)
  return { saw: Yer && kim ? lines('G2', { Yer, kim }) : null, yesNo: say('G3')?.split(' · ') ?? null, detail: soru ? lines('G4', { soru }) : null }
}

// "Ne değişti?" açıklaması (lib/streetChange.js makeFrame change: { obj, kind, from, to, dress })
//   renk: D7 "{Ne} {önce}ydı, {sonra} oldu"; geçmiş zaman eki tr.grammar suffixFor 'GEÇMİŞ' (kırmızıydı, lacivertti)
//   gelir/gider: nesne "Bir {ad} eklendi" / "{Ad} artık yok"; hayvan "Bir {hayvan} geldi" / "{Hayvan} gitti"; kişide
//   "Birinin {yer} {ad} belirdi" / "Birinin {iyelik} yok oldu"; yer "{Ad} yer değiştirdi"; tabela "Tabelada {X} harfi
//   {Y} oldu". Ad ya da renk adı yoksa null.
export const pastOf = (word) => `${word}${suffixFor(word, 'GEÇMİŞ')}`
const objName = (c) => say(`obj.${c.obj === 'top' ? (c.dress ? 'dress' : 'tshirt') : c.obj}`)
export function changeSentence(c) {
  if (!c) return null
  if (c.kind === 'tabela') {
    const i = [...String(c.from)].findIndex((ch, k) => ch !== String(c.to)[k])
    return i < 0 ? null : say('change.tabela', { X: c.from[i], Y: c.to[i] })
  }
  const ad = objName(c)
  if (!ad) return null
  if (c.kind === 'renk') {
    const once = colorName(c.from)
    const sonra = colorName(c.to)
    if (!once || !sonra) return null
    return TEXTS.D7.text.replace('{önce}ydı', pastOf(once)).replace('{Ne}', up(ad)).replace('{sonra}', sonra)
  }
  if (c.kind === 'yer') return say('change.yer', { Ad: up(ad) })
  const person = ON_PERSON[c.obj]
  if (person) return c.kind === 'gelir' ? say('change.belirdi', { yer: person[0], ad }) : say('change.yokOldu', { iyelik: person[1] })
  if (ANIMALS.includes(c.obj)) return c.kind === 'gelir' ? say('change.geldi', { hayvan: ad }) : say('change.gitti', { Hayvan: up(ad) })
  return c.kind === 'gelir' ? say('change.gelir', { ad }) : say('change.gider', { Ad: up(ad) })
}
