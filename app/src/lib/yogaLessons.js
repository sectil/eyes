// Yoga ders verisi (ilk bölüm: Ders 1, 2, 3, 5). Saf veri ve küçük yardımcılar; React yok.
// Kaynak: yoga-pilot/b/ders{1,2,3,5}/*.lesson*.json (ad, söz, açılış satırları, hazırlık, kanıt cümlesi, kaynaklar,
// önce/sonra sorusu) ve yoga-pilot/v3/modul.md §2 (ekran kuralları). Numara PLAN.v2 ders numarasıdır (yol ile aynı).
//
// Yayın kuralı (sahip, 2026-09-30): bir ders ancak kendi denetimlerinden geçince görünür; yalnız hazır dersler görünür.
// Her süre (versions[dk]) ayrı bir hazır karışım dosyasıdır; `published: true` taşımayan süre arayüzde hiç görünmez,
// yolda aday olmaz. Ses dosyası geldikçe yalnız bu dosyadaki veri değişir: `published`, `file`, `timeline`,
// `contentHash`, `sections` (dosyanın zaman çizelgesindeki blok sırası; yogaLessons.test.js dosyayla karşılaştırır).
// Dosyalar app/public/yoga/ altındadır ve web dağıtımına girmez (.vercelignore).
//
// İlk bölüm (2026-09-30): dört dersin on bir süresi yayımlandı. Kaynak yoga-pilot/render/out/ilk-bolum/dersN-DK.{mp3,
// timeline.json} (render/tools/mixib.py; nefona.yoga.timeline/2; _rapor/d0N-DKdk.json hepsi pass). Sahip onayı:
// SAHIP_ISTEKLERI.md madde 10 (ilk bölüm), 17 (Ders 2, 3, 5 sesleri), 18 (Ders 1 sesleri). Ses Nefona Hoca (hoc), müzik
// A (ElevenLabs Music; madde 8). MP3 bilinçli bir ara karar: AAC kodek testi sonrası (SPEC.v3 §14) dosyalar değişir,
// contentHash ile birlikte. planVersion: ders verisinin sürümü (b/dersN/*.lesson*.json "version") / ses-müzik.
// seconds dosyanın hedef süresidir (çizelgenin T'si); çözülmüş MP3 kodlayıcı dolgusu kadar (≈ 0,04 sn) uzundur.
import { NBSP } from './format.js'

// Kütüphane sırası (PLAN.v2 §A.3; modul.md §2.3): numarasız bir başlangıç yolu, dersler serbest. Ders 3 (Uykuya Geçiş)
// sırada yoktur; 20:00–04:59 arasında en üste çıkar (NIGHT_FROM / NIGHT_TO, VARSAYIM saat; modul.md §10.3-d).
export const LIBRARY_ORDER = [1, 2, 5, 7, 4, 6, 8, 9, 10]
export const NIGHT_FROM = 20
export const NIGHT_TO = 5
export const isNightHour = (now = new Date()) => {
  const h = new Date(now).getHours()
  return h >= NIGHT_FROM || h < NIGHT_TO
}

export const POSTURE_LABEL = { sit: 'Oturarak', lie: 'Uzanarak' }
// Uyku dersinde "Ders bitince müzik" seçenekleri (dk; 0 = Kapalı) ve varsayılanı (modul.md §2.4-9)
export const MUSIC_TAIL = [0, 5, 10, 20]
export const MUSIC_TAIL_DEFAULT = 10

// 3 dakika seçiliyken Kaynaklar kartına eklenen satır (modul.md §2.4-11; Radin 2025, PMID 39808431). 3 dk'da etki cümlesi yok.
export const THREE_MIN_LINE = "Bir çalışmada günde 10 dakika meditasyon yapması istenen çalışanların %69,7'si günde 5 dakikanın altında kaldı (Radin 2025). Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma ise bulamadık."
export const SOURCES_FOOTER = "Kaynak: PubMed (National Library of Medicine). DOI'ler https://doi.org/ önekiyle açılır."

// Ortak açılış satırları (modul.md §2.4-12; pilot 4. tur metni). Dersin kendi `opening` listesi bunlarla başlar.
export const OPENING_PERMISSION = 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.'
export const OPENING_VEHICLE = 'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.'

const src = (pmid, cite, doi) => ({ pmid, cite, doi })

// versions: { dk: { published?, file, timeline, seconds, contentHash, planVersion, voice, bg, scene?, sections, intro? } }
// file ve timeline public/ altına görelidir (iOS paketinde public/yoga/…; yerel köprü lessonStart({ file })).
// intro: kişinin ilk yoga dersinde önce çalan kısa giriş dosyası (PLAN.v3 §D.3 "İlk ders cümlesi"); henüz yok.
// musicTailFile (yalnız uyku dersi): "Ders bitince müzik" kuyruğunun dosyası; yokken seçici görünmez, kuyruk çalmaz.
export const LESSONS = {
  1: {
    n: 1,
    slug: 'ders1-nefesin-ritmi',
    title: 'Nefesin Ritmi',
    fullTitle: 'Nefesin Ritmi',
    tagline: 'Nefesini yavaşlatmayı ve verişini uzatmayı adım adım öğreniyorsun.',
    daypart: 'day',
    posture: 'sit',
    domain: 'calm', // Sakinlik (PLAN.v3 §D.5)
    effectKey: 'yoga-nefes',
    measure: 'gerginlik',
    question: 'Şu an ne kadar gerginsin?',
    ends: ['hiç', 'çok'],
    better: 'down',
    form: 'ring', // genişleyen halka (modul.md §3)
    color: { dark: '#8CCB9E', light: '#397E4C' },
    defaultMinutes: 5,
    minutes: [3, 5, 15],
    opening: [OPENING_PERMISSION, OPENING_VEHICLE, 'Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.'],
    preparation: null, // hazırlık kartı yalnız uzanarak yapılan derslerde (modul.md §2.4-10)
    evidenceLine: 'Neye dayanıyor: yavaş nefesle ilgili 223 çalışmayı birleştiren bir incelemede kalp atışı değişkenliği seans sırasında ve hemen sonrasında arttı; kısa alış ve uzun verişle yapılan nefes, uzun alış ve kısa verişe göre daha çok gevşeme bildirimiyle ilişkiliydi. Bu ders bir sonuç vaadi taşımaz.',
    evidenceByMinutes: {},
    sources: [
      src('35623448', 'Laborde 2022 · yavaş nefes ve kalp atışı değişkenliği (223 çalışma)', '10.1016/j.neubiorev.2022.104711'),
      src('25156003', 'Van Diest 2014 · kısa alış, uzun veriş', '10.1007/s10484-014-9253-x'),
      src('11751348', 'Bernardi 2001 · dakikada altı soluk ritmi', '10.1136/bmj.323.7327.1446'),
      src('36630953', 'Balban 2023 · günde 5 dakika iç çekiş', '10.1016/j.xcrm.2022.100895'),
      src('38204770', 'Trivedi 2023 · vızıltılı nefeste döngü uzunluğu', '10.4103/ijoy.ijoy_113_23'),
      src('34306146', 'Toussaint 2021 · "derin nefes" talimatı ve uyarılma', '10.1155/2021/5924040'),
      src('37813123', 'Rana 2023 · hızlı soluma ve nöbet (neden hızlı nefes yok)', '10.1055/s-0043-1774808'),
      src('39690521', 'Luu 2024 · hazırlık, yerleşme ve dışa dönüş', '10.17761/2024-D-24-00021'),
      src('28300508', 'Howard 2017 · dönüşün önemi', '10.1080/00029157.2016.1203281'),
      src('24146758', 'Cramer 2013 · yoganın yan etkileri', '10.1371/journal.pone.0075515'),
      src('39808431', 'Radin 2025 · gerçek kullanım kısa (3 dk kartı)', '10.1001/jamanetworkopen.2024.54435'),
    ],
    sectionLabels: { A: 'Karşılama', C1: 'Uzun veriş', C2: 'İç çekiş', C3: 'Vızıltılı nefes', K: 'Kapanış' },
    versions: {
      3: { published: true, file: 'yoga/ders1-3.mp3', timeline: 'yoga/ders1-3.timeline.json', seconds: 180, contentHash: '08a93d0a56b9a1c8', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'K'] },
      5: { published: true, file: 'yoga/ders1-5.mp3', timeline: 'yoga/ders1-5.timeline.json', seconds: 300, contentHash: '98234d291b894f66', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'K'] },
      15: { published: true, file: 'yoga/ders1-15.mp3', timeline: 'yoga/ders1-15.timeline.json', seconds: 900, contentHash: 'c5db519ffc854ef0', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'C2', 'C3', 'K'] },
    },
  },
  2: {
    n: 2,
    slug: 'ders2-derin-dinlenme',
    title: 'Derin Dinlenme',
    fullTitle: 'Derin Dinlenme (Yoga Nidra)',
    tagline: 'Uyanıkken derin bir dinlenmeye davet.',
    daypart: 'day',
    posture: 'lie',
    domain: 'body', // Beden
    effectKey: 'yoga-nidra',
    measure: 'beden gerginliği',
    question: 'Bedenin şu an ne kadar gergin?',
    ends: ['hiç', 'çok'],
    better: 'down',
    form: 'horizon', // ince, yatay ufuk çizgisi
    color: { dark: '#7EB2DD', light: '#2E75B0' },
    defaultMinutes: 20,
    minutes: [5, 15, 20], // PLAN.v3 karar 4: 3 dk yok, 20 dk var
    opening: [OPENING_PERMISSION, OPENING_VEHICLE, 'Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.'],
    preparation: ['İnce bir örtü', 'Dizlerinin altı için bir yastık', 'Uzanabileceğin rahat bir yüzey'],
    evidenceLine: 'Neye dayanıyor: 11 ve 30 dakikalık yoga nidrayı karşılaştıran bir çalışmada iki sürüm arasındaki fark çok küçüktü; alandaki çalışmaların çoğunun kalitesi düşük. Bu ders bir sonuç vaadi taşımaz.',
    evidenceByMinutes: {},
    sources: [
      src('39690521', 'Luu 2024 · travma-duyarlı yoga nidra, 10 bileşen', '10.17761/2024-D-24-00021'),
      src('40373021', 'Moszeik, Rohleder & Renner 2025 · 11 ve 30 dakikalık yoga nidra', '10.1002/smi.70049'),
      src('41327816', 'Ghai, Odyniec & Ghai 2025 · 73 çalışmalık yoga nidra meta-analizi', '10.1111/nyas.70149'),
      src('41743305', 'Gibbs 2026 · tek seans yoga nidra ve beden taraması', '10.4103/ijoy.ijoy_2_25'),
      src('34306146', 'Toussaint 2021 · derin nefes talimatı ve uyarılma', '10.1155/2021/5924040'),
      src('42757902', 'Shuminsky & Davidow 2026 · konuşma hızı ve doğallık', '10.1044/2026_JSLHR-25-00691'),
      src('16941239', 'Knowlton & Larkin 2006 · azalan anlatım', '10.1007/s10484-006-9014-6'),
      src('16199412', 'Bernardi 2006 · müzik ve sessizlik', '10.1136/hrt.2005.064600'),
      src('42466037', 'Lieutaud & Bourhis 2026 · rehberli ve rehbersiz pratik', '10.3389/fpsyg.2026.1833806'),
      src('19493324', 'Wood 2009 · olumlu cümle tekrarı', '10.1111/j.1467-9280.2009.02370.x'),
      src('3069875', 'Braith 1988 · gevşeme sırasında huzursuzluk', '10.1016/0005-7916(88)90040-7'),
      src('32820538', 'Farias 2020 · meditasyonda istenmeyen etkiler', '10.1111/acps.13225'),
      src('28300508', 'Howard 2017 · dönüşün önemi', '10.1080/00029157.2016.1203281'),
      src('34260686', 'Tran 2021 · ayağa kalkınca ilk kan basıncı düşüşü', '10.1093/ageing/afab090'),
      src('24882909', 'Cordi 2014 · telkin ve şekerleme', '10.5665/sleep.3778'),
      src('24146758', 'Cramer 2013 · yoganın yan etkileri', '10.1371/journal.pone.0075515'),
      src('31357980', 'Cramer 2019 · gözetimsiz pratik', '10.1186/s12906-019-2612-7'),
      src('3148637', 'Ley 1988 · gevşeme sırasında hızlı soluma (kuramsal derleme)', '10.1016/0005-7916(88)90054-7'),
      src('10483629', 'Khasky & Smith 1999 · gevşemede uzaklaşma hissi', '10.2466/pms.1999.88.2.409'),
    ],
    // BR.* köprü blokları şeritte ayrı bölüm değildir (öndeki bölüme sayılır). N1'in ekran adı ders verisinden
    // (b/ders2/ders2.lesson.v3.json blocks.N1.screenLabel); ötekiler öneridir, Türkçe editör onayına.
    sectionLabels: { A: 'Karşılama', N1: 'Niyet (sankalpa)', C1: 'Beden dolaşımı', C2: 'Nefes ve geri sayma', C3: 'Zıtlıklar', C4: 'İmgeleme', C5: 'Sessiz dinlenme', N2: 'Niyete dönüş', K: 'Kapanış' },
    // 15 dk: onaylı ilk bölüm dosyası (c875dcef…) Kapı 2'nin A adımı karışımının (726417fa…) yerine geçti (B adımı metin
    // düzeltmeleri; acik-isler-denetimi Y-02). Dosya adı aynı kaldı: eski karışımı yeni dosyadan ayıran bir düzenek yok;
    // güncellemeden önce yarım kalmış dersin yerel kaydı (journal) dosya adıyla eşleşir (yogaRecord.js lessonByFile) ve
    // yeni contentHash'le yazılır.
    versions: {
      5: { published: true, file: 'yoga/ders2-5.mp3', timeline: 'yoga/ders2-5.timeline.json', seconds: 300, contentHash: 'ccf41e3801bb23a9', planVersion: 'b-v3.1/hoc-A', voice: 'hoc', bg: 'music', scene: 'orman', sections: ['A', 'N1', 'C1', 'C2', 'N2', 'K'] },
      15: {
        published: true,
        file: 'yoga/ders2-15.mp3',
        timeline: 'yoga/ders2-15.timeline.json',
        seconds: 900,
        contentHash: 'c875dcef4885db95', // mp3'ün SHA-256'sının ilk 16 hanesi
        planVersion: 'b-v3.1/hoc-A',
        voice: 'hoc',
        bg: 'music',
        scene: 'orman',
        sections: ['A', 'N1', 'C1', 'C2', 'C4', 'N2', 'K'],
      },
      20: { published: true, file: 'yoga/ders2-20.mp3', timeline: 'yoga/ders2-20.timeline.json', seconds: 1200, contentHash: '7d64336d1c5ffdea', planVersion: 'b-v3.1/hoc-A', voice: 'hoc', bg: 'music', scene: 'orman', sections: ['A', 'N1', 'C1', 'C2', 'C3', 'C4', 'N2', 'K'] },
    },
  },
  3: {
    n: 3,
    slug: 'ders3-uykuya-gecis',
    title: 'Uykuya Geçiş',
    fullTitle: 'Uykuya Geçiş',
    tagline: 'Günü bırakıp uykuya yavaşça geçmek için.',
    daypart: 'night',
    posture: 'lie',
    domain: 'wellbeing', // İyi oluş (VARSAYIM; PLAN.v3 §D.5)
    effectKey: null, // önce puanı sorulmaz (yatakta en az dokunuş); ölçüsü ertesi sabahın sorusu
    measure: null,
    question: null,
    ends: null,
    better: 'up',
    form: 'ember', // sönen kor
    color: { dark: '#E3A857', light: '#9B651A' },
    defaultMinutes: 15,
    minutes: [5, 15],
    opening: [OPENING_PERMISSION, `${OPENING_VEHICLE} Bu dersten hemen sonra araç kullanma.`, 'Gece kalkman gerekirse önce yana dön, otur, sonra kalk.'],
    preparation: ['Işığı kapat ya da iyice kıs', 'Telefonu, ekranı aşağıya bakacak biçimde yanına bırak', 'Sesi, konuşmayı zorlanmadan duyacağın en düşük düzeye getir', 'Uyurken kulak içi kulaklık yerine hoparlör daha iyi'],
    evidenceLine: 'Neye dayanıyor: Uyumakta zorlanan 41 kişiyle yapılan bir çalışmada, ilgi çekici bir imgeyle dikkatlerini dağıtmaları söylenenler, talimat almayanlara göre daha kısa sürede uykuya daldıklarını bildirdi. Yatmadan önce yavaş nefes alma ve müzik dinleme çalışmalarında kişilerin kendi uyku değerlendirmesi iyileşti; cihazla ölçülen uykuda belirgin bir fark görülmedi. Tek bir yoga nidra kaydı sessizce uzanmaya göre uykuya dalma süresini değiştirmedi. Bu ders uyutma vaadi taşımaz.',
    evidenceByMinutes: { 5: 'Beş dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık; bu sürüm aynı sırayı daha az ayrıntıyla izler.' },
    sources: [
      src('11863237', 'Harvey & Payne 2002 · uyku öncesi imgeleme', '10.1016/s0005-7967(01)00012-2'),
      src('41886931', 'Eide, Hernes & Grønli 2026 · yatmadan önce yavaş nefes', '10.1016/j.smrv.2026.102284'),
      src('25156003', 'Van Diest 2014 · kısa alış, uzun veriş', '10.1007/s10484-014-9253-x'),
      src('34306146', 'Toussaint 2021 · derin nefes talimatı', '10.1155/2021/5924040'),
      src('36000763', 'Jespersen 2022 (Cochrane) · müzik ve uyku', '10.1002/14651858.CD010459.pub3'),
      src('36731199', 'Sharpe 2023 · tek 30 dk yoga nidra kaydı (karşı kanıt)', '10.1016/j.jpsychores.2023.111169'),
      src('16941239', 'Knowlton & Larkin 2006 · azalan ses', '10.1007/s10484-006-9014-6'),
      src('39690521', 'Luu 2024 · travma-duyarlı yoga nidra, 10 bileşen', '10.17761/2024-D-24-00021'),
      src('24882909', 'Cordi, Schlarb & Rasch 2014 · sesli telkin ve uyku', '10.5665/sleep.3778'),
      src('33562129', 'Wang 2021 · kulaklıkla uyumak', '10.3390/ijerph18041560'),
      src('28958002', 'Bioulac 2017 · uykululuk ve trafik kazası', '10.1093/sleep/zsx134'),
      src('39808431', 'Radin 2025 · gerçek kullanım süresi', '10.1001/jamanetworkopen.2024.54435'),
      src('34260686', 'Tran 2021 · ayağa kalkınca kan basıncı düşüşü', '10.1093/ageing/afab090'),
    ],
    sectionLabels: { A: 'Karşılama', C1: 'Yavaş veriş', C2: 'Bedenin ağırlaşması', C4: 'Geri sayma', C3: 'İmgeleme', K: 'Uyku izni' },
    // "Ders bitince müzik" kuyruğu: 10 dk'lık dosya (render/out/ilk-bolum/ders3-kuyruk.mp3); 20 dk seçilirse yerel
    // oynatıcı döngüler (SPEC.v3 §10 "döngü")
    musicTailFile: 'yoga/ders3-kuyruk.mp3',
    versions: {
      5: { published: true, file: 'yoga/ders3-5.mp3', timeline: 'yoga/ders3-5.timeline.json', seconds: 300, contentHash: '76ab8a403478696c', planVersion: 'B-parti1-metin-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'C2', 'C3', 'K'] },
      15: { published: true, file: 'yoga/ders3-15.mp3', timeline: 'yoga/ders3-15.timeline.json', seconds: 900, contentHash: 'fea337327a711018', planVersion: 'B-parti1-metin-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'C2', 'C4', 'C3', 'K'] },
    },
  },
  5: {
    n: 5,
    slug: 'ders5-tek-nokta',
    title: 'Tek Nokta',
    fullTitle: 'Tek Nokta',
    tagline: 'Dikkatini tek bir noktada toplamayı, dağıldığında nazikçe geri getirmeyi deniyorsun.',
    daypart: 'day',
    posture: 'sit',
    domain: 'focus', // Dikkat
    effectKey: 'yoga-odak',
    measure: 'odak',
    question: 'Dikkatin şu an ne kadar toplanmış?',
    ends: ['dağınık', 'toplanmış'],
    better: 'up',
    form: 'point', // tek ışık noktası
    color: { dark: '#D6E4F2', light: '#4F5D6E' },
    defaultMinutes: 5,
    minutes: [3, 5, 15],
    opening: [OPENING_PERMISSION, OPENING_VEHICLE, 'Gözlerin yorulursa kapatman ya da kırpman yeterli.'],
    preparation: null,
    evidenceLine: 'Neye dayanıyor: bir çalışmada sekiz dakikalık nefes farkındalığından sonra, bir dikkat görevinde zihin dağılmasının göstergeleri, gevşeme egzersizi yapanlara ya da okuyanlara göre azaldı. 45 çalışmayı birleştiren bir incelemede düşünme becerilerindeki etki küçüktü ve başka etkin uygulamalardan üstün değildi. Bu ders bir sonuç vaadi taşımaz.',
    evidenceByMinutes: {},
    sources: [
      src('22309719', 'Mrazek 2012 · 8 dakika nefes farkındalığı ve zihin dağılması', '10.1037/a0026678'),
      src('30127731', 'Norris 2018 · acemilerde 10 dakikalık kayıt', '10.3389/fnhum.2018.00315'),
      src('34350544', 'Whitfield 2021 · 45 çalışmada küçük etki', '10.1007/s11065-021-09519-y'),
      src('34560133', 'Feruglio 2021 · zihin dağılması ve pratik süresi', '10.1016/j.neubiorev.2021.09.032'),
      src('16199412', 'Bernardi 2006 · müzikte sessizlik aralığı', '10.1136/hrt.2005.064600'),
      src('34306146', 'Toussaint 2021 · "derin nefes" talimatı ve uyarılma', '10.1155/2021/5924040'),
      src('39690521', 'Luu 2024 · hazırlık, yerleşme ve dışa dönüş', '10.17761/2024-D-24-00021'),
      src('28300508', 'Howard 2017 · dönüşün önemi', '10.1080/00029157.2016.1203281'),
      src('24146758', 'Cramer 2013 · yoganın yan etkileri', '10.1371/journal.pone.0075515'),
      src('39808431', 'Radin 2025 · gerçek kullanım kısa (3 dk kartı)', '10.1001/jamanetworkopen.2024.54435'),
      src('29939051', 'Schumer 2018 · kısa farkındalık eğitimlerinde küçük etki', '10.1037/ccp0000324'),
    ],
    sectionLabels: { A: 'Karşılama', C1: 'Nefes çapası', C2: 'Nefes sayma', C3: 'Sessiz odak', K: 'Kapanış' },
    versions: {
      3: { published: true, file: 'yoga/ders5-3.mp3', timeline: 'yoga/ders5-3.timeline.json', seconds: 180, contentHash: 'a72587e780826447', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'K'] },
      5: { published: true, file: 'yoga/ders5-5.mp3', timeline: 'yoga/ders5-5.timeline.json', seconds: 300, contentHash: '21c25353e2f59dfc', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'K'] },
      15: { published: true, file: 'yoga/ders5-15.mp3', timeline: 'yoga/ders5-15.timeline.json', seconds: 900, contentHash: '06b1ed2d716e5566', planVersion: 'B-parti1-taslak-2/hoc-A', voice: 'hoc', bg: 'music', sections: ['A', 'C1', 'C2', 'C3', 'K'] },
    },
  },
}

export const lessonOf = (n) => LESSONS[n] ?? null
// Yerel kayıttaki dosya adından ders ve süre (uzlaştırma, oynatıcıya yeniden bağlanma): { lesson, minutes, version } | null
export function lessonByFile(file, lessons = LESSONS) {
  if (typeof file !== 'string' || !file) return null
  const f = file.replace(/^\.?\//, '')
  for (const [n, L] of Object.entries(lessons)) {
    for (const [m, v] of Object.entries(L.versions ?? {})) {
      if (v?.file === f) return { lesson: Number(n), minutes: Number(m), version: v }
    }
  }
  return null
}
export const versionOf = (n, minutes) => LESSONS[n]?.versions?.[minutes] ?? null
export const isPublished = (n, minutes) => versionOf(n, minutes)?.published === true

// Dersin yayımlanmış süreleri (küçükten büyüğe); yalnız dersin çip listesindekiler
export const publishedMinutes = (n) => (LESSONS[n]?.minutes ?? []).filter((m) => isPublished(n, m))

// En az bir süresi yayımlanmış dersler; kütüphane sırasıyla (Ders 3 sırada yok: gece en üste, gündüz en sona)
export function visibleLessons(now = new Date(), lessons = LESSONS) {
  const has = (n) => (lessons[n]?.minutes ?? []).some((m) => lessons[n].versions?.[m]?.published === true)
  const day = LIBRARY_ORDER.filter((n) => lessons[n] && has(n))
  const night = Object.keys(lessons).map(Number).filter((n) => !LIBRARY_ORDER.includes(n) && has(n))
  return isNightHour(now) ? [...night, ...day] : [...day, ...night]
}

// { ders: yayımlanmış en kısa süre (dk) } — yol durağı (lib/yoga.js pathYoga) yalnız bunlardan seçer
export const LESSON_MIN = Object.fromEntries(
  Object.keys(LESSONS).map(Number).map((n) => [n, publishedMinutes(n)[0]]).filter(([, m]) => m != null),
)
// { ders: [yayımlanmış süreler] } — yol belirli bir süre isterse (ör. 5 dk tam ders) yalnız bunlar çalınabilir
export const PUBLISHED_MINUTES = Object.fromEntries(
  Object.keys(LESSONS).map(Number).map((n) => [n, publishedMinutes(n)]).filter(([, l]) => l.length > 0),
)

// Açılışta seçili süre: istenen (yoldan gelen ya da son seçilen) yayımlanmışsa o; değilse dersin varsayılanı; o da
// yoksa varsayılana en yakın yayımlanmış süre. Hiçbiri yoksa null.
export function pickMinutes(n, wanted = null) {
  const list = publishedMinutes(n)
  if (!list.length) return null
  if (wanted != null && list.includes(wanted)) return wanted
  const d = LESSONS[n].defaultMinutes
  if (list.includes(d)) return d
  return [...list].sort((a, b) => Math.abs(a - d) - Math.abs(b - d) || a - b)[0]
}

// Seçilen sürenin bölümleri (yalnız o dosyada gerçekten çalanlar): [{ id, label }]
export function sectionsOf(n, minutes) {
  const L = LESSONS[n]
  const v = versionOf(n, minutes)
  if (!L || !v?.sections) return []
  return v.sections.map((id) => ({ id, label: L.sectionLabels[id] ?? id }))
}

// Süre değişince eklenen bölümler (şeritte vurgulanır): önceki sürede olmayanlar
export function addedSections(n, fromMinutes, toMinutes) {
  if (fromMinutes == null || fromMinutes === toMinutes) return []
  const before = new Set(sectionsOf(n, fromMinutes).map((s) => s.id))
  return sectionsOf(n, toMinutes).filter((s) => !before.has(s.id))
}

// Süre etiketi: "15 dk" ya da "5 · 15 dk" (sayı ile birim arasında bölünmez boşluk)
export const minutesLabel = (list = []) => (list.length ? `${list.join(' · ')}${NBSP}dk` : '')
