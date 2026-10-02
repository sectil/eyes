// Kelime Avı · metin taslakları (sahip onayı bekliyor). Tek kaynak: METINLER.md bölüm B bu dosyadan üretilir
// (denetle.mjs). Her metin bir PubMed bulgusunun Nefona'nın kendi anlatımıdır; özet çevrilmez, cümle kopyalanmaz.
// Yalnız özette yazan söylenir. Hedef türleri: E kolay (metinde tek, benzer biçim yok), S benzer (tek, aynı kökten
// en az bir başka biçim var), Z zor (tek, aynı kökten en az iki başka biçim), Y yok (metinde yok, aynı kökten biçim var).
// A tipi metin: E, S, Y. B tipi metin: E, S, Z. Bir tur = bir A + bir B = 6 hedef, 1'i "yok" (beşte bir).
export const TEXTS = [
  {
    id: 'arilar-sifir', src: 'howard2018', type: 'A', title: 'Boş kartı seçen arılar',
    text: 'Bal arıları kartlardaki şekilleri karşılaştırıp daha az şekilli olanı seçmeyi öğrendi. Sonra boş bir kart gösterildi. Arılar “daha az olanı seç” kuralını boş karta da uyguladı ve boş kartı seçti. Benzer bir beceri papağanlarda ve maymunlarda da görülmüştü.',
    targets: [{ w: 'papağanlarda', t: 'E' }, { w: 'kartı', t: 'S', r: 'kart' }, { w: 'arıya', t: 'Y', r: 'arı' }],
  },
  {
    id: 'kuzgun-plan', src: 'kabadayi2017', type: 'B', title: '17 saate kadar sonrası için alet seçen kuzgunlar',
    text: 'Geleceği planlamak uzun süre insana ve büyük maymunlara özgü sanıldı. Bir deneyde kuzgunlar, ileride kullanacakları bir aleti 17 saate varan süre öncesinden seçebildi; kendilerini de tuttular. Sonuçlar maymunlarınkine benziyor. Araştırmacılara göre bu beceri kuzgunlarda, maymunlardan bağımsız gelişmiş.',
    targets: [{ w: 'aleti', t: 'E' }, { w: 'kuzgunlarda', t: 'S', r: 'kuzgun' }, { w: 'maymunlara', t: 'Z', r: 'maymun' }],
  },
  {
    id: 'fil-adlari', src: 'pardo2024', type: 'A', title: 'Ada benzer çağrılarla seslenen filler',
    text: 'Yabani Afrika filleri birbirine kişiye özgü çağrılarla sesleniyor. Kayıtlar geri dinletildiğinde her fil, kendisine yöneltilmiş çağrıya daha güçlü tepki verdi. Yunuslar karşısındakinin sesini taklit eder; fillerin ise taklit etmeden, ada benzer seslerle seslendiği düşünülüyor.',
    targets: [{ w: 'Yunuslar', t: 'E' }, { w: 'çağrıya', t: 'S', r: 'çağrı' }, { w: 'filin', t: 'Y', r: 'fil' }],
  },
  {
    id: 'sican-gidik', src: 'ishiyama2016', type: 'B', title: 'Gıdıklanınca zıplayan sıçanlar',
    text: 'Sıçanlar gıdıklandığında insan kulağının duyamayacağı ince sesler çıkarır. Gıdıklanan sıçanlar ele yaklaştı ve kendiliğinden zıpladı; bu sıçrayışlara sevinç sıçrayışı deniyor. Ortam ürkütücüyse gıdıklanma aynı etkiyi yapmadı. Bulgular gıdıklanma ile oyun arasında bir bağ olduğunu düşündürüyor.',
    targets: [{ w: 'zıpladı', t: 'E' }, { w: 'sıçrayışlara', t: 'S', r: 'sıçrayış' }, { w: 'gıdıklandığında', t: 'Z', r: 'gıdıkla' }],
  },
  {
    id: 'sican-saklambac', src: 'reinhold2019', type: 'A', title: 'Saklambaç oynayan sıçanlar',
    text: 'Araştırmacılar sıçanlarla, yemek ödülü vermeden saklambaç oynadı. Sıçanlar oyunu çabuk öğrendi, saklanan ve arayan rolleri arasında geçti. Saklanırken pek ses çıkarmadılar ve içi görünmeyen kutuları seçtiler; ararken eski saklanma yerlerini hatırladılar.',
    targets: [{ w: 'kutuları', t: 'E' }, { w: 'saklanma', t: 'S', r: 'saklan' }, { w: 'oyunun', t: 'Y', r: 'oyun' }],
  },
  {
    id: 'bitki-sesi', src: 'khait2023', type: 'B', title: 'Susuz kalan bitkinin sesi',
    text: 'Domates ve tütün bitkileri susuz kaldığında ya da kesildiğinde, uzaktan kaydedilebilen ultrasonik sesler çıkardı. Kayıtlar sessiz bir odada ve bir serada yapıldı. Bilgisayar yalnız bu seslere bakarak bitkinin durumunu ayırt edebildi.',
    targets: [{ w: 'serada', t: 'E' }, { w: 'bitkinin', t: 'S', r: 'bitki' }, { w: 'seslere', t: 'Z', r: 'ses' }],
  },
  {
    id: 'fare-yuz', src: 'dolensek2020', type: 'A', title: 'Farelerin yüz ifadesi',
    text: 'Araştırmacılar farelerin yüzünü yakından filme aldı. Hoş ya da tatsız olaylarda yüzlerinde kalıp ifadeler belirdi. Bilgisayar bu ifadeleri gruplara ayırdı. Aynı uyaran, hayvanın o anki durumuna göre farklı bir ifade doğurdu.',
    targets: [{ w: 'filme', t: 'E' }, { w: 'ifadeleri', t: 'S', r: 'ifade' }, { w: 'farenin', t: 'Y', r: 'fare' }],
  },
  {
    id: 'ahtapot-uyku', src: 'medeiros2021', type: 'B', title: 'Ahtapotun iki uykusu',
    text: 'Dört ahtapot uyurken kameraya alındı. Uykuda iki evre vardı. Sakin evrede derileri soluktu. Hareketli evrede derileri renkten renge girdi, gözleri kıpırdadı. Bu evre çoğunlukla sakin evrenin ardından, yarım saate yakın aralarla geldi. Bu düzen kuşların ve memelilerin uyku döngüsünü andırıyor.',
    targets: [{ w: 'kameraya', t: 'E' }, { w: 'uykuda', t: 'S', r: 'uyku' }, { w: 'evrenin', t: 'Z', r: 'evre' }],
  },
  {
    id: 'kopek-kelime', src: 'andics2016', type: 'A', title: 'Köpekler sözü ve tonu ayırıyor',
    text: 'Eğitilmiş köpekler tarayıcıda kıpırdamadan yatarken övgü sözlerini neşeli ve düz bir sesle dinledi. Köpekler sözcüğün anlamını ve ses tonunu ayrı işledi. Hoşnutluk tepkisi ise yalnız söz de ton da övgü olduğunda belirdi.',
    targets: [{ w: 'tarayıcıda', t: 'E' }, { w: 'sözcüğün', t: 'S', r: 'söz' }, { w: 'köpeğin', t: 'Y', r: 'köpe' }],
  },
  {
    id: 'tuy-diken', src: 'shwartz2020', type: 'B', title: 'Tüyleri diken diken eden ikili',
    text: 'Üşüdüğümüzde tüylerimiz diken diken olur. Bunu kıl köküne bağlı küçük bir kas ile bir sinir yapar. Farelerde bu sinir, kılı yeniden üreten hücreleri de etkiliyor. Yani diken diken olan tüyler ile yeni tüylerin çıkması aynı ekipten.',
    targets: [{ w: 'Üşüdüğümüzde', t: 'E' }, { w: 'kılı', t: 'S', r: 'kıl' }, { w: 'tüylerimiz', t: 'Z', r: 'tüy' }],
  },
  {
    id: 'balik-ayna', src: 'kohda2019', type: 'A', title: 'Aynaya bakan balık',
    text: 'Temizlikçi balık adlı küçük bir balık aynanın önünde önce yabancıya tepki verir gibi davrandı, sonra yansımasını uzun uzun izledi. Bedenine renkli bir işaret konunca, ayna karşısında bedenini sürterek işareti silmeye çalıştı. Aynasız ortamda bunu yapmadı.',
    targets: [{ w: 'sürterek', t: 'E' }, { w: 'aynanın', t: 'S', r: 'ayna' }, { w: 'balığın', t: 'Y', r: 'balı' }],
  },
  {
    id: 'kedi-ad', src: 'saito2019', type: 'B', title: 'Kediler adını ayırt ediyor',
    text: 'Bir deneyde kedilere önce sıradan sözcükler ya da evdeki başka kedilerin adları dinletildi. Kediler alıştıktan sonra kendi adlarını duyunca yeniden tepki verdi; adı yabancı biri söylese de. Kedi kafedeki kediler ise kendi adını öbür kedilerin adlarından ayıramadı.',
    targets: [{ w: 'yabancı', t: 'E' }, { w: 'adını', t: 'S', r: 'ad' }, { w: 'kedilere', t: 'Z', r: 'kedi' }],
  },
  {
    id: 'keci-yuz', src: 'nawroth2018', type: 'A', title: 'Gülen yüzü seçen keçiler',
    text: 'Bir duvara aynı yabancının iki fotoğrafı asıldı: birinde gülüyor, öbüründe kızgındı. Arenanın öbür ucundan bırakılan keçilerden çoğu önce gülen yüze gitti. Bu tercih, gülen yüz sağ taraftayken belirgin biçimde görüldü.',
    targets: [{ w: 'arenanın', t: 'E' }, { w: 'yüze', t: 'S', r: 'yüz' }, { w: 'keçilerin', t: 'Y', r: 'keçi' }],
  },
  {
    id: 'parmak-buruşuk', src: 'kareklas2013', type: 'B', title: 'Suda buruşan parmaklar',
    text: 'Elimiz suda kalınca parmak uçlarımız buruşur. Bu buruşmayı sinir sistemimiz yönetir. Bir deneyde katılımcılar su içindeki nesneleri buruşuk parmaklarla, düz parmaklardan daha hızlı taşıdı. Kuru nesnelerde fark yoktu. Buruşma ıslak nesneleri tutmaya bir uyum olabilir.',
    targets: [{ w: 'katılımcılar', t: 'E' }, { w: 'nesnelerde', t: 'S', r: 'nesne' }, { w: 'parmaklardan', t: 'Z', r: 'parmak' }],
  },
  {
    id: 'koku-izi', src: 'porter2007', type: 'A', title: 'Koku izini süren insanlar',
    text: 'Bir deneyde insanlardan bir kokunun izini yalnız burunlarıyla sürmeleri istendi. İnsanlar bunu başardı ve denedikçe daha iyi yaptı. Burun deliklerimiz yaklaşık üç buçuk santim ayrı yerlerden koku alıyor; bu fark izi bulmaya yardım ediyor.',
    targets: [{ w: 'santim', t: 'E' }, { w: 'izini', t: 'S', r: 'iz' }, { w: 'kokuyu', t: 'Y', r: 'koku' }],
  },
  {
    id: 'su-ayisi', src: 'hashimoto2016', type: 'B', title: 'Su ayılarının sırrı',
    text: 'Su ayıları suda yaşayan minicik hayvanlardır; bazı türleri neredeyse tamamen kurumaya dayanabilir. Araştırmacılar en dayanıklı türlerden birinin genlerini okudu. Hasarı onaran gen aileleri çoğalmıştı. Su ayılarının dayanıklılığı, yalnız su ayılarında bulunan proteinlerle ilişkili görünüyor.',
    targets: [{ w: 'minicik', t: 'E' }, { w: 'türlerden', t: 'S', r: 'tür' }, { w: 'ayılarının', t: 'Z', r: 'ayı' }],
  },
  {
    id: 'yunus-islik', src: 'king2013', type: 'A', title: 'Yunusun imza ıslığı',
    text: 'Her yunus kendine özgü bir imza ıslığı geliştirir; ıslık, sesin tınısından bağımsız olarak kimliği taşır. Yabani yunuslar kendi ıslığının kopyasını duyunca karşılık verdi, başka yunusların ıslıklarına vermedi. Öğrenilmiş bir sesi ad gibi kullanmak insan dışındaki memelilerde çok nadirdir.',
    targets: [{ w: 'tınısından', t: 'E' }, { w: 'ıslığının', t: 'S', r: 'ısl' }, { w: 'yunusun', t: 'Y', r: 'yunus' }],
  },
  {
    id: 'ahtapot-tat', src: 'vangiesen2020', type: 'B', title: 'Dokunarak tadan kollar',
    text: 'Ahtapotlar deniz dibini esnek kollarıyla tarar. Kollar dokunduğunu tadar da. Araştırmacılar bu işi yapan alıcıları buldu: suda zor çözünen maddeleri yalnız temasla algılıyorlar. Kollardaki farklı hücreler farklı alıcılar taşıyor. Bu yüzden ahtapot kolları kendi başına karar verir gibi davranabiliyor.',
    targets: [{ w: 'esnek', t: 'E' }, { w: 'alıcıları', t: 'S', r: 'alıcı' }, { w: 'kollarıyla', t: 'Z', r: 'kol' }],
  },
  {
    id: 'denizanasi-uyku', src: 'nath2017', type: 'A', title: 'Denizanası da uyur mu?',
    text: 'Ters denizanası gün boyu düzenli aralıklarla kasılıp gevşer. Araştırmacılar bu atımları günlerce saydı. Geceleri atımlar seyreldi ve hayvan uyarılara geç tepki verdi. Gece uyutulmayan denizanaları ertesi gün daha durgundu. Bu, uykunun çok eski olabileceğini düşündürüyor.',
    targets: [{ w: 'gevşer', t: 'E' }, { w: 'atımları', t: 'S', r: 'atım' }, { w: 'denizanasına', t: 'Y', r: 'denizana' }],
  },
  {
    id: 'sinekkapan', src: 'bohm2016', type: 'B', title: 'Sayı sayan sinekkapan',
    text: 'Venüs sinekkapanı, duyarlı tüylere iki kez dokunulunca kapanır. Araştırmacılar tüyleri uyarıp sinyalleri saydı. Üçten fazla dokunuşta sindirim genleri çalıştı; dokunuş arttıkça etkinlik arttı. Çırpınan böcek, kendi dokunuşlarıyla besin olduğunu bildiriyor.',
    targets: [{ w: 'böcek', t: 'E' }, { w: 'tüylere', t: 'S', r: 'tüy' }, { w: 'dokunuşlarıyla', t: 'Z', r: 'dokunuş' }],
  },
  {
    id: 'yenidogan-yuz', src: 'johnson1991', type: 'A', title: 'Yüzün peşindeki yenidoğan',
    text: 'Yaşamlarının ilk saatindeki bebeklere yavaşça hareket eden çizimler gösterildi. Bebekler yüze benzeyen çizimi, karışık çizgilerden daha uzağa kadar izledi. Bulgu ikinci bir doğumevinde de yinelendi. Bu güçlü takip ikinci ayda azaldı.',
    targets: [{ w: 'doğumevinde', t: 'E' }, { w: 'çizimi', t: 'S', r: 'çizim' }, { w: 'bebeğin', t: 'Y', r: 'bebe' }],
  },
  {
    id: 'guvercin-ressam', src: 'watanabe1995', type: 'B', title: 'Monet ile Picasso\'yu ayıran güvercinler',
    text: 'Güvercinler zamanla Monet\'nin ve Picasso\'nun tablolarını ayırmayı öğrendi; hiç görmedikleri yeni tabloları da ayırdılar. Monet\'den Renoir\'a, Picasso\'dan Matisse\'e genelleme yaptılar. Monet tabloları ters çevrilince ayırma bozuldu, Picasso tablolarının tersi bozmadı.',
    targets: [{ w: 'Renoir\'a', t: 'E' }, { w: 'tablolarının', t: 'S', r: 'tablo' }, { w: 'Picasso\'dan', t: 'Z', r: 'picasso' }],
  },
  {
    id: 'okcu-balik', src: 'newport2016', type: 'A', title: 'Yüz ayırt eden okçu balığı',
    text: 'Okçu balığı avını tükürdüğü suyla düşürür. Balıklara ekranda iki insan yüzü gösterildi; öğrendikleri yüze su tükürdüler ve 44 yüz arasından doğruyu seçebildiler. Renk, kafa biçimi ve parlaklık eşitlenince de başardılar.',
    targets: [{ w: 'parlaklık', t: 'E' }, { w: 'yüze', t: 'S', r: 'yüz' }, { w: 'balığın', t: 'Y', r: 'balı' }],
  },
  {
    id: 'at-yuz', src: 'smith2016', type: 'B', title: 'Kızgın yüzü fark eden atlar',
    text: 'Atlara aynı yabancının gülen ve kızgın yüzlerinin fotoğrafları gösterildi. Atlar kızgın yüzü daha çok sol gözüyle izledi; bu göz tercihi olumsuz durumlarda sık görülür. Kalp atışları daha hızlı yükseldi. İnsan yüz ifadesine böyle bir tepki daha önce yalnız köpeklerde gösterilmişti.',
    targets: [{ w: 'köpeklerde', t: 'E' }, { w: 'gözüyle', t: 'S', r: 'göz' }, { w: 'yüzü', t: 'Z', r: 'yüz' }],
  },
]
