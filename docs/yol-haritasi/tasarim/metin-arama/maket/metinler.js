// Kelime Avı · metin taslakları (sahip onayı bekliyor). Tek kaynak: METINLER.md bölüm B bu dosyadan üretilir
// (denetle.mjs). Her metin bir PubMed bulgusunun Nefona'nın kendi anlatımıdır; özet çevrilmez, cümle kopyalanmaz.
// Yalnız özette yazan söylenir. Hedef türleri: E kolay (metinde tek, benzer biçim yok), S benzer (tek, aynı kökten
// en az bir başka biçim var), Z zor (tek, aynı kökten en az iki başka biçim), Y yok (metinde yok, aynı kökten biçim var).
// A tipi metin: E, S, Y. B tipi metin: E, S, Z. Bir tur = bir A + bir B = 6 hedef, 1'i "yok" (beşte bir).
export const TEXTS = [
  {
    id: 'arilar-sifir', src: 'howard2018', type: 'A', title: 'Sıfırı en küçük sayan arılar',
    text: 'Araştırmacılar bal arılarına kartlardaki şekil sayısını karşılaştırmayı öğretti. Kartlarda birden altıya kadar şekil vardı ve arılar daha az şekilli olanı seçmeyi öğrendi. Ardından hiç şekil taşımayan boş bir kart gösterildi. Arılar boş kartı, tek şekilli karttan da daha az saydı. Araştırmacılara göre arılar sıfırı sayıların en küçüğü gibi ele aldı. Benzer bir beceri daha önce papağanlarda, maymunlarda ve okul öncesi çocuklarda görülmüştü.',
    targets: [{ w: 'papağanlarda', t: 'E' }, { w: 'kartı', t: 'S' }, { w: 'arıya', t: 'Y', r: 'arı' }],
  },
  {
    id: 'kuzgun-plan', src: 'kabadayi2017', type: 'B', title: '17 saat sonrası için seçen kuzgunlar',
    text: 'Geleceği planlamak uzun süre insana ve büyük maymunlara özgü sanıldı. Bir deneyde kuzgunlar da benzer bir beceri gösterdi. Kuşlar, ileride kullanacakları bir aleti ve takasta işe yarayacak bir nesneyi 17 saate varan bir süre öncesinden seçebildi. Kendilerini tutmayı da başardılar. Sonuçları büyük maymunlarınkine benziyor. Araştırmacılara göre bu planlama becerisi kuzgunlarda, maymunlardan bağımsız olarak gelişmiş.',
    targets: [{ w: 'aleti', t: 'E' }, { w: 'kuzgunlarda', t: 'S', r: 'kuzgun' }, { w: 'maymunlara', t: 'Z' }],
  },
  {
    id: 'fil-adlari', src: 'pardo2024', type: 'A', title: 'Birbirine adla seslenen filler',
    text: 'Yabani Afrika filleri birbirine seslenirken kişiye özgü çağrılar kullanıyor. Araştırmacılar kayıtları bilgisayarla inceledi ve bir çağrının kime yöneldiğini sesin yapısından tahmin edebildi. Kayıtlar fillere geri dinletildiğinde her fil kendisine yöneltilmiş çağrıya daha güçlü tepki verdi. Yunuslar ve papağanlar karşısındakinin sesini taklit ederek seslenir. Fillerin ise taklit etmeden, ada benzer seslerle seslendiği düşünülüyor.',
    targets: [{ w: 'Yunuslar', t: 'E' }, { w: 'çağrıya', t: 'S' }, { w: 'filin', t: 'Y', r: 'fil' }],
  },
  {
    id: 'sican-gidik', src: 'ishiyama2016', type: 'B', title: 'Gıdıklanınca zıplayan sıçanlar',
    text: 'Sıçanlar gıdıklandığında insan kulağının duyamayacağı kadar ince sesler çıkarır. Araştırmacılar bunu yeniden gösterdi ve fazlasını da gördü. Gıdıklanan hayvanlar ele yaklaştı ve kendiliğinden havaya zıpladı. Almancada bu sıçrayışlara sevinç sıçrayışı deniyor. Ortam ürkütücü olduğunda ise gıdıklanma aynı etkiyi yapmadı, çıkan ses azaldı. Bulgular, gıdıklanma ile oyun arasında bir bağ olduğunu düşündürüyor.',
    targets: [{ w: 'zıpladı', t: 'E' }, { w: 'sıçrayışlara', t: 'S' }, { w: 'gıdıklandığında', t: 'Z', r: 'gıdıkla' }],
  },
  {
    id: 'sican-saklambac', src: 'reinhold2019', type: 'A', title: 'Saklambaç oynayan sıçanlar',
    text: 'Araştırmacılar sıçanlarla saklambaç oynadı. Yemek ödülü yoktu; bulunca ya da bulununca sıçanlar yalnızca oyunla, şakalaşmayla karşılandı. Hayvanlar oyunu çabuk öğrendi, saklanan ve arayan rolleri arasında geçiş yaptı. Ararken gözlerini ve eski saklanma yerlerinin anısını kullandılar. Saklanırken neredeyse hiç ses çıkarmadılar ve içi görünmeyen kutuları seçtiler. Araştırmacılara göre bu oyun çok eski olabilir.',
    targets: [{ w: 'kutuları', t: 'E' }, { w: 'saklanma', t: 'S' }, { w: 'oyunun', t: 'Y' }],
  },
  {
    id: 'bitki-sesi', src: 'khait2023', type: 'B', title: 'Susayan bitkinin sesi',
    text: 'Bitkiler zor durumda kalınca rengini, kokusunu ve biçimini değiştirir. Yeni bir çalışma bir şey daha buldu: ses. Domates ve tütün bitkileri susuz kaldığında ya da kesildiğinde, uzaktan kaydedilebilen ultrasonik sesler çıkardı. Kayıtlar sessiz bir odada ve bir serada yapıldı. Bilgisayar, yalnız bu seslere bakarak bitkinin susuz mu, kesilmiş mi olduğunu ayırt edebildi. Bu sesleri başka canlılar da duyuyor olabilir.',
    targets: [{ w: 'serada', t: 'E' }, { w: 'bitkinin', t: 'S' }, { w: 'seslere', t: 'Z', r: 'ses' }],
  },
  {
    id: 'fare-yuz', src: 'dolensek2020', type: 'A', title: 'Farelerin yüz ifadesi',
    text: 'Bir hayvanın ne hissettiğini anlamak çoğu zaman zordur. Araştırmacılar farelerin yüzünü yakından filme aldı. Hoş ya da tatsız olaylar karşısında farelerin yüzünde her seferinde benzer, kalıp ifadeler belirdi. Bilgisayar bu ifadeleri ayrı gruplara ayırabildi. Aynı uyaran, hayvanın o anki durumuna göre farklı bir ifade doğurdu. Yani yüz, o anki durumu yansıtıyordu.',
    targets: [{ w: 'filme', t: 'E' }, { w: 'ifadeleri', t: 'S' }, { w: 'farenin', t: 'Y' }],
  },
  {
    id: 'ahtapot-uyku', src: 'medeiros2021', type: 'B', title: 'Ahtapotun iki uykusu',
    text: 'Dört ahtapot uyurken kameraya alındı. Uykuda iki ayrı evre göze çarptı. Sakin evrede derileri soluk, gözbebekleri kapalıydı ve bu evre uzun sürdü. Hareketli evrede ise derileri renkten renge girdi, gözleri hızla kıpırdadı; bu evre yaklaşık kırk saniye sürdü. Hareketli evre çoğunlukla sakin evrenin ardından, yarım saate yakın aralarla geldi. Bu düzen, kuşların ve memelilerin uyku döngüsünü andırıyor.',
    targets: [{ w: 'kameraya', t: 'E' }, { w: 'uykuda', t: 'S', r: 'uyku' }, { w: 'evrenin', t: 'Z', r: 'evre' }],
  },
  {
    id: 'kopek-kelime', src: 'andics2016', type: 'A', title: 'Köpekler sözü ve tonu ayırıyor',
    text: 'Bir köpeğe aynı övgü sözünü neşeli ve düz bir sesle söylediğinizi düşünün. Eğitilmiş köpekler tarayıcıda kıpırdamadan yatarken bu sözleri dinledi. Köpekler sözcüğün anlamını ve ses tonunu ayrı ayrı işledi. Hoşnutluk tepkisi ise yalnız söz de ton da övgü olduğunda belirdi. Bu iki bilgiyi ayırıp birleştirme yeteneği, dil olmadan da gelişebiliyor.',
    targets: [{ w: 'tarayıcıda', t: 'E' }, { w: 'sözcüğün', t: 'S', r: 'söz' }, { w: 'köpeğin', t: 'Y' }],
  },
  {
    id: 'tuy-diken', src: 'shwartz2020', type: 'B', title: 'Tüyleri diken diken eden ikili',
    text: 'Üşüdüğümüzde tüylerimiz diken diken olur. Bunu kıl köküne bağlı küçük bir kas ile ona uzanan bir sinir yapar. Farelerde yapılan bir çalışma bu ikilinin başka bir işini de buldu. Sinir, kılı yeniden üreten hücrelerin ne zaman çalışacağını etkiliyor; kas da bu sinirin yerinde kalmasını sağlıyor. Yani diken diken olan tüyler ile yeni tüylerin çıkması aynı ekipten.',
    targets: [{ w: 'Üşüdüğümüzde', t: 'E' }, { w: 'kılı', t: 'S', r: 'kıl' }, { w: 'tüylerimiz', t: 'Z', r: 'tüy' }],
  },
  {
    id: 'balik-ayna', src: 'kohda2019', type: 'A', title: 'Aynaya bakan balık',
    text: 'Aynada kendini bilmek uzun süre memelilere ve kuşlara özgü sanıldı. Temizlikçi balık adlı küçük bir balık bu sınırı zorladı. Balıklar önce yansımaya bir yabancıymış gibi tepki verdi, sonra aynanın önünde tuhaf hareketler denedi, sonunda yansımasını uzun uzun izledi. Bedenine renkli bir işaret konunca, ayna karşısında bedenini bir yüzeye sürterek işareti silmeye çalıştı. Şeffaf işarete ve aynasız ortama hiç tepki vermedi.',
    targets: [{ w: 'sürterek', t: 'E' }, { w: 'aynanın', t: 'S', r: 'ayna' }, { w: 'balığın', t: 'Y' }],
  },
  {
    id: 'kedi-ad', src: 'saito2019', type: 'B', title: 'Kediler adını ayırt ediyor',
    text: 'Kedilerin bizi dinlemediği söylenir. Bir deneyde kedilere önce dört sıradan sözcük ya da evdeki başka kedilerin adları dinletildi. Kediler alışıp ilgisini kaybettikten sonra kendi adlarını duydu ve belirgin biçimde yeniden tepki verdi. Bu, adı yabancı biri söylese de oldu. Kedi kafede yaşayan kediler ise kendi adını evdeki öbür kedilerin adlarından ayıramadı.',
    targets: [{ w: 'yabancı', t: 'E' }, { w: 'adını', t: 'S', r: 'ad' }, { w: 'kedilere', t: 'Z', r: 'kedi' }],
  },
  {
    id: 'keci-yuz', src: 'nawroth2018', type: 'A', title: 'Gülen yüzü seçen keçiler',
    text: 'Köpekler ve atlar insan yüzünü okuyabiliyor. Peki süt ve et için yetiştirilen keçiler? Bir duvara aynı yabancının iki fotoğrafı asıldı: birinde gülüyor, öbüründe kızgındı. Keçiler arenanın öbür ucundan bırakıldı. Çoğu, önce gülen yüze gitti ve onunla daha uzun ilgilendi. Bu tercih, gülen yüz sağ taraftayken belirgindi. Evcilleşme, hayvanların zihnini sandığımızdan derin etkilemiş olabilir.',
    targets: [{ w: 'arenanın', t: 'E' }, { w: 'yüze', t: 'S', r: 'yüz' }, { w: 'keçilerin', t: 'Y', r: 'keçi' }],
  },
  {
    id: 'parmak-buruşuk', src: 'kareklas2013', type: 'B', title: 'Suda buruşan parmaklar',
    text: 'Elimiz uzun süre suda kalınca parmak uçlarımız yavaş yavaş buruşur. Bu buruşma kendiliğinden olmaz; sinir sistemimiz onu yönetir. Bir deneyde katılımcılar küçük nesneleri elleriyle taşıdı. Nesneler suyun içindeyken, buruşuk parmaklar düz parmaklardan daha hızlı çalıştı. Kuru nesnelerde ise buruşukluk hiç fark yaratmadı. Parmak buruşması, ıslak nesneleri tutmak için bir uyum olabilir.',
    targets: [{ w: 'katılımcılar', t: 'E' }, { w: 'nesnelerde', t: 'S', r: 'nesne' }, { w: 'parmaklardan', t: 'Z', r: 'parmak' }],
  },
  {
    id: 'koku-izi', src: 'porter2007', type: 'A', title: 'Koku izini süren insanlar',
    text: 'Koku denince akla köpekler gelir. Bir deneyde insanlardan bir kokunun izini yalnız burunlarıyla sürmeleri istendi. İnsanlar bunu başardı ve denedikçe daha iyi yaptı. Burun deliklerimiz birbirinden yaklaşık üç buçuk santim ayrı yerlerden koku alıyor. İki deliğin farkı izi bulmaya yardım ediyor. Koku alma yeteneğimizin kötü ünü, belki de bu yeteneği az kullanmamızdan geliyor.',
    targets: [{ w: 'santim', t: 'E' }, { w: 'izini', t: 'S', r: 'iz' }, { w: 'kokuyu', t: 'Y', r: 'koku' }],
  },
  {
    id: 'su-ayisi', src: 'hashimoto2016', type: 'B', title: 'Su ayılarının sırrı',
    text: 'Su ayıları suda yaşayan minicik hayvanlardır. Bazı türleri neredeyse tamamen kurumaya ve kuruyken pek çok zorlu koşula dayanabilir. Araştırmacılar en dayanıklı türlerden birinin genlerini tek tek okudu. Hasara yol açan bazı yollar kaybolmuş, hasarı onaran gen aileleri çoğalmıştı. Yalnız su ayılarında bulunan yeni proteinler de vardı. Su ayılarının dayanıklılığı bu proteinlerle ilişkili görünüyor.',
    targets: [{ w: 'minicik', t: 'E' }, { w: 'türlerden', t: 'S' }, { w: 'ayılarının', t: 'Z', r: 'ayı' }],
  },
  {
    id: 'yunus-islik', src: 'king2013', type: 'A', title: 'Yunusun imza ıslığı',
    text: 'Her yunus kendine özgü bir ıslık geliştirir; buna imza ıslığı denir. Islık, sesin tınısından bağımsız olarak kimliği taşır. Araştırmacılar yabani yunuslara kendi ıslıklarının bir kopyasını dinletti. Yunuslar kendi ıslığını duyunca karşılık verdi. Başka yunusların ıslıklarına ise yanıt vermedi. Öğrenilmiş bir sesi ad gibi kullanmak, insan dışındaki memelilerde çok nadir görülür.',
    targets: [{ w: 'tınısından', t: 'E' }, { w: 'ıslığını', t: 'S' }, { w: 'yunusun', t: 'Y' }],
  },
  {
    id: 'ahtapot-tat', src: 'vangiesen2020', type: 'B', title: 'Dokunarak tadan kollar',
    text: 'Ahtapotlar deniz dibini esnek kollarıyla adım adım tarar. Kollar yalnız dokunmaz, dokunduğunu tadar da. Araştırmacılar bu işi yapan alıcıları buldu. Bu alıcılar suda zor çözünen maddeleri, yalnız temas edince algılıyor. Kollardaki farklı hücreler farklı alıcılar taşıyor ve bilgiyi yerinde işliyor. Bu yüzden ahtapot kolları kendi başına karar verir gibi davranabiliyor.',
    targets: [{ w: 'esnek', t: 'E' }, { w: 'alıcıları', t: 'S' }, { w: 'kollarıyla', t: 'Z', r: 'kol' }],
  },
  {
    id: 'denizanasi-uyku', src: 'nath2017', type: 'A', title: 'Uyuyan denizanası',
    text: 'Denizanasının bir merkezi yoktur; sinirleri bedenine ağ gibi yayılmıştır. Ters denizanası adı verilen bir tür, gün boyu düzenli aralıklarla kasılıp gevşer. Araştırmacılar bu atımları günlerce saydı. Geceleri atımlar seyreldi ve hayvan uyarılara geç tepki verdi. Güçlü bir uyarıyla ise hemen kendine geldi. Gece uyutulmayan denizanaları ertesi gün daha durgundu. Bu, uykunun çok eski olduğunu düşündürüyor.',
    targets: [{ w: 'gevşer', t: 'E' }, { w: 'atımları', t: 'S' }, { w: 'denizanasına', t: 'Y', r: 'denizana' }],
  },
  {
    id: 'sinekkapan', src: 'bohm2016', type: 'B', title: 'Sayı sayan sinekkapan',
    text: 'Venüs sinekkapanı, yapraklarındaki duyarlı tüylere iki kez dokunulunca kapanır. Ama kapan yemeğe değip değmeyeceğini saymadan karar vermez. Araştırmacılar tüyleri sırayla uyarıp sinyalleri saydı. İki dokunuştan sonra kapanma yolu açıldı. Üçten fazla dokunuşta sindirim genleri çalışmaya başladı. Dokunuş arttıkça gen etkinliği de arttı. Çırpınan böcek, kendi dokunuşlarıyla besin olduğunu bildirmiş oluyor.',
    targets: [{ w: 'böcek', t: 'E' }, { w: 'tüylere', t: 'S', r: 'tüy' }, { w: 'dokunuşlarıyla', t: 'Z', r: 'dokunuş' }],
  },
  {
    id: 'yenidogan-yuz', src: 'johnson1991', type: 'A', title: 'Yüzün peşindeki yenidoğan',
    text: 'Yaşamlarının ilk saatindeki bebeklere yavaşça hareket eden kartlar gösterildi. Kartlardan birinde yüze benzeyen bir çizim, öbürlerinde karışık çizgiler vardı. Bebekler yüze benzeyen çizimi başlarıyla ve gözleriyle daha uzağa kadar izledi. Bu bulgu iki ayrı doğumevinde yinelendi. Bulgu, bebeklerin yüze benzeyen desenlere yaşamın ilk saatinden ilgi gösterdiğini düşündürüyor. İlginç biçimde bu güçlü takip ikinci ayda azaldı.',
    targets: [{ w: 'doğumevinde', t: 'E' }, { w: 'çizimi', t: 'S' }, { w: 'bebeğin', t: 'Y', r: 'bebe' }],
  },
  {
    id: 'guvercin-ressam', src: 'watanabe1995', type: 'B', title: 'Monet ile Picasso\'yu ayıran güvercinler',
    text: 'Güvercinlere Monet\'nin ve Picasso\'nun tablolarının renkli fotoğrafları gösterildi. Kuşlar zamanla iki ressamı ayırmayı öğrendi. Daha önce hiç görmedikleri tabloları da doğru ayırdılar. Monet\'den Cezanne ve Renoir\'a, Picasso\'dan Braque ve Matisse\'e genelleme yaptılar. Monet tabloları ters çevrilince ayırma bozuldu, Picasso tabloları ters çevrilince bozulmadı. Belki de kuşlar Monet tablolarında resmedilen nesnelere bakıyordu.',
    targets: [{ w: 'Renoir\'a', t: 'E' }, { w: 'tablolarının', t: 'S', r: 'tablo' }, { w: 'Picasso\'dan', t: 'Z', r: 'picasso' }],
  },
  {
    id: 'okcu-balik', src: 'newport2016', type: 'A', title: 'Yüz ayırt eden okçu balığı',
    text: 'Okçu balığı, avını sudan tükürdüğü bir su okuyla düşürür. Araştırmacılar bu tükürüğü bir seçim aracı yaptı. Balıklara ekranda iki insan yüzü birlikte gösterildi; öğrendikleri yüze su tükürdüler ve 44 yüz arasından doğruyu seçebildiler. Renk, kafa biçimi ve parlaklık eşitlendiğinde de başarılı oldular. Balıkların insan yüzüne özel bir donanımı olmadığı düşünülüyor; yine de bunu yapabildiler.',
    targets: [{ w: 'parlaklık', t: 'E' }, { w: 'yüze', t: 'S', r: 'yüz' }, { w: 'balığın', t: 'Y' }],
  },
  {
    id: 'at-yuz', src: 'smith2016', type: 'B', title: 'Kızgın yüzü fark eden atlar',
    text: 'Atlara aynı yabancının gülen ve kızgın yüz fotoğrafları gösterildi. Kızgın yüzü görünce atlar başını çevirip ona daha çok sol gözüyle baktı. Hayvanlarda sol gözle bakış, olumsuz algılanan durumlarda sık görülür. Kızgın yüzler karşısında atların kalp atışı da daha hızlı yükseldi. İnsan yüz ifadesine böyle yönlü bir tepki daha önce yalnız köpeklerde gösterilmişti.',
    targets: [{ w: 'köpeklerde', t: 'E' }, { w: 'gözüyle', t: 'S', r: 'göz' }, { w: 'yüzü', t: 'Z', r: 'yüz' }],
  },
]
