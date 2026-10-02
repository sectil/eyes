# Kelime Avı · görünen metinler (taslak, sahip onayı bekliyor)

Kural: kullanıcıya görünen her cümle buradan gelir; sahip onayı olmadan koda girmez. Süreç: taslak → 5 kişilik kapı →
kendi onayım → sahip. "beyin" ve "tanıma" sözcükleri geçmez. Değişim sözcükleri yalnız "başlangıcından iyi",
"değişim yok", "henüz belli değil", "başlangıç". Sayı biçimi: virgüllü, bir basamak ("3,4 sn").

## A. Ekran cümleleri

### Giriş
| Kimlik | Metin | Not |
|---|---|---|
| G1 | Dikkat · 2 dk | üst satır |
| G2 | Kelime Avı | başlık |
| G3 | Bilimden kısa bir metin, aranan bir kelime. Bul ve dokun; metinde yoksa “Yok” de. | |
| G4a | Kelime üstte çıkar | adım 1 |
| G4b | Metinde bul ve dokun | adım 2 |
| G4c | Yoksa “Yok” de | adım 3 |
| G6 | Neye dayanıyor? | bağlantı; iddia sınırı bu sayfada (N5). Kapı tur 1: girişte Başla'nın üstünde 5/5 motivasyonu düşürdü |
| G7 | Başla | düğme |

### Arama
| Kimlik | Metin | Not |
|---|---|---|
| A1 | Bu kelimeyi bul | aranan kelimenin üst etiketi; 320'de gizli, yalnız kelime |
| A2 | Metinde yok | düğme |
| A3 | {Yazar} ve ark. · {Dergi} {Yıl} · PMID {pmid} | arama sırasında görünmez; metin bitince A9 geçişinde ve sonuçta S7 altında. İki yazarlıda "{Yazar1} ve {Yazar2}" |
| A4 | {s} sn | bulununca aranan kelime kartı yeşile döner, süre büyük yazılır; kelime dolu renkle parlar |
| A5 | Bu değil | yalnız sesli okuyucu; yanlış dokunuşta kelime kısa bir titreşimle sallanır, renk değişmez |
| A6a | Süre doldu. Kelime buradaydı. | 20 sn dolunca, kelime metindeyse; kelime işaretlenir |
| A6b | Süre doldu. Bu kelime metinde yoktu. | 20 sn dolunca, kelime yoksa |
| A7 | Doğru, metinde yok. Benzer kelimelerin altını çizdik. | "Yok" doğruysa alt not; kart yeşile döner, benzer biçimlerin altı kesik çizgili |
| A8 | Kelime metindeydi, işaretledik. | "Yok" dendi ama kelime vardı |
| A9 | Sıradaki metin | iki metin arasındaki geçiş etiketi |

### Sonuç
| Kimlik | Metin | Not |
|---|---|---|
| S1 | Tur bitti | üst satır |
| S2 | {x} sn | büyük sayı: doğru bulunan kelimelerin ortanca süresi |
| S3 | Kelimelerin yarısını bundan hızlı buldun. | ortancanın sade anlatımı; kapı tur 2: "ortanca" sözcüğü 4/5 anlaşılmadı |
| S3b | Süre için en az 3 kelime bulmak gerekiyor; bu tur sayılarla kaydedildi. | 3'ten az bulunduysa S2 ve S3 yerine |
| S4a | kelime bulundu | "4/5" altında |
| S4b | doğru “Yok” | "1/1" altında |
| S4c | yanlış dokunuş | "1" altında |
| S5 | Kelime bulma süresi | Gelişim kutusunun başlığı, metrik adıyla aynı (GL1) |
| S6 | Başlangıç · {k}/8 gün · başlangıcından iyi · değişim yok · henüz belli değil | hüküm sözcüğü ve sayı `metricStatusV2` + `changeText` + `verdictWord`'den; modül kendisi kurmaz |
| S6b | 8 gün sonra başlangıç ölçün çıkar; sonra her hafta onunla karşılaştırılır. | yalnız başlangıç oluşurken; 320'de gizli |
| S7 | Bu turda okuduğun bulgular | altında her metnin başlığı ve A3 satırı |
| S8 | Tamam | düğme |

### Neye dayanıyor? sayfası
| Kimlik | Metin | Kaynak |
|---|---|---|
| N1 | Neye dayanıyor? | |
| N2 | Görsel aramada alıştırma aramayı hızlandırabiliyor: bir çalışmada birkaç yüz denemeden sonra yavaş aramalar hızlandı. | sireteanu1995 |
| N3 | Metinde kelime aramak okumaktan ayrı bir iştir; gözler iki işte farklı hareket eder. | rayner1996, rayner-raney1996 |
| N4 | “Yok” demek de aramanın parçasıdır: kelime yoksa ne zaman bırakacağına sen karar verirsin. | chun1996, wolfe2021 |
| N5 | Bu bir arama alıştırması; okuma hızını artırdığı gösterilmedi. Hızlı okuma uygulamaları, anlamayı korurken hızı katlayamıyor. | rayner2016 |
| N6 | Metinler PubMed'deki çalışmaların Nefona'nın kendi sözleriyle kısa anlatımıdır; her metnin altında kaynağı yazar. | |

### Gelişim
| Kimlik | Metin | Not |
|---|---|---|
| GL1 | Kelime bulma süresi | metrik etiketi; birim `sn` |

### Nef (taslak; Nef oturumunun onaylı cümle biçimine göre son hâli orada kurulur)
| Kimlik | Metin | An türü |
|---|---|---|
| NF1 | İlk Kelime Avı turun tamam: kelimeleri çoğunlukla {x} saniyede buldun. | firstTime |
| NF2 | Kelime Avı'nda en hızlı turun: {x} saniye. | metricBest; `better: 'down'` olduğu için en düşük süre |
| NF3 | Kelime Avı'nda bulma süren başlangıcından iyi: {a} → {b} saniye. | metricChange, yalnız doğrulanmış değişimde |
| Ad çekimleri | Kelime Avı · Kelime Avı'nda · Kelime Avı'ndan · Kelime Avı'nı · Kelime Avı'na | `nef.name` |

### Bildirim ve Ana sayfa (taslak)
| Kimlik | Metin | Not |
|---|---|---|
| KA1 | Bugünün metni hazır: iki dakikalık Kelime Avı. | "Bana hatırlat" bildirimi |
| KA2 | Bilimden iki kısa metin | Ana sayfa durağı `sub` |

## B. Metinler (24)

Her metin bir PubMed bulgusunun Nefona'nın kendi anlatımıdır. Yalnız özette yazan söylenir; özet çevrilmez, cümle
kopyalanmaz. PMID ve DOI `arastirma/KAYNAKLAR.md`'de. Tek kaynak `maket/metinler.js`; bu bölüm `node maket/denetle.mjs`
ile üretilir, elle düzenlenmez. Hedef türleri: E kolay, S benzer biçimli, Z iki benzer biçimli, Y metinde yok.

<!-- B:basla -->
### B1 · Sıfırı en küçük sayan arılar (`howard2018`, A tipi, 62 kelime)

Araştırmacılar bal arılarına kartlardaki şekil sayısını karşılaştırmayı öğretti. Kartlarda birden altıya kadar şekil vardı ve arılar daha az şekilli olanı seçmeyi öğrendi. Ardından hiç şekil taşımayan boş bir kart gösterildi. Arılar boş kartı, tek şekilli karttan da daha az saydı. Araştırmacılara göre arılar sıfırı sayıların en küçüğü gibi ele aldı. Benzer bir beceri daha önce papağanlarda, maymunlarda ve okul öncesi çocuklarda görülmüştü.

Hedefler: **papağanlarda** kolay · **kartı** benzer · **arıya** yok

### B2 · 17 saat sonrası için seçen kuzgunlar (`kabadayi2017`, B tipi, 54 kelime)

Geleceği planlamak uzun süre insana ve büyük maymunlara özgü sanıldı. Bir deneyde kuzgunlar da benzer bir beceri gösterdi. Kuşlar, ileride kullanacakları bir aleti ve takasta işe yarayacak bir nesneyi 17 saate varan bir süre öncesinden seçebildi. Kendilerini tutmayı da başardılar. Sonuçları büyük maymunlarınkine benziyor. Araştırmacılara göre bu planlama becerisi kuzgunlarda, maymunlardan bağımsız olarak gelişmiş.

Hedefler: **aleti** kolay · **kuzgunlarda** benzer · **maymunlara** iki benzer

### B3 · Birbirine adla seslenen filler (`pardo2024`, A tipi, 52 kelime)

Yabani Afrika filleri birbirine seslenirken kişiye özgü çağrılar kullanıyor. Araştırmacılar kayıtları bilgisayarla inceledi ve bir çağrının kime yöneldiğini sesin yapısından tahmin edebildi. Kayıtlar fillere geri dinletildiğinde her fil kendisine yöneltilmiş çağrıya daha güçlü tepki verdi. Yunuslar ve papağanlar karşısındakinin sesini taklit ederek seslenir. Fillerin ise taklit etmeden, ada benzer seslerle seslendiği düşünülüyor.

Hedefler: **Yunuslar** kolay · **çağrıya** benzer · **filin** yok

### B4 · Gıdıklanınca zıplayan sıçanlar (`ishiyama2016`, B tipi, 51 kelime)

Sıçanlar gıdıklandığında insan kulağının duyamayacağı kadar ince sesler çıkarır. Araştırmacılar bunu yeniden gösterdi ve fazlasını da gördü. Gıdıklanan hayvanlar ele yaklaştı ve kendiliğinden havaya zıpladı. Almancada bu sıçrayışlara sevinç sıçrayışı deniyor. Ortam ürkütücü olduğunda ise gıdıklanma aynı etkiyi yapmadı, çıkan ses azaldı. Bulgular, gıdıklanma ile oyun arasında bir bağ olduğunu düşündürüyor.

Hedefler: **zıpladı** kolay · **sıçrayışlara** benzer · **gıdıklandığında** iki benzer

### B5 · Saklambaç oynayan sıçanlar (`reinhold2019`, A tipi, 52 kelime)

Araştırmacılar sıçanlarla saklambaç oynadı. Yemek ödülü yoktu; bulunca ya da bulununca sıçanlar yalnızca oyunla, şakalaşmayla karşılandı. Hayvanlar oyunu çabuk öğrendi, saklanan ve arayan rolleri arasında geçiş yaptı. Ararken gözlerini ve eski saklanma yerlerinin anısını kullandılar. Saklanırken neredeyse hiç ses çıkarmadılar ve içi görünmeyen kutuları seçtiler. Araştırmacılara göre bu oyun çok eski olabilir.

Hedefler: **kutuları** kolay · **saklanma** benzer · **oyunun** yok

### B6 · Susayan bitkinin sesi (`khait2023`, B tipi, 59 kelime)

Bitkiler zor durumda kalınca rengini, kokusunu ve biçimini değiştirir. Yeni bir çalışma bir şey daha buldu: ses. Domates ve tütün bitkileri susuz kaldığında ya da kesildiğinde, uzaktan kaydedilebilen ultrasonik sesler çıkardı. Kayıtlar sessiz bir odada ve bir serada yapıldı. Bilgisayar, yalnız bu seslere bakarak bitkinin susuz mu, kesilmiş mi olduğunu ayırt edebildi. Bu sesleri başka canlılar da duyuyor olabilir.

Hedefler: **serada** kolay · **bitkinin** benzer · **seslere** iki benzer

### B7 · Farelerin yüz ifadesi (`dolensek2020`, A tipi, 51 kelime)

Bir hayvanın ne hissettiğini anlamak çoğu zaman zordur. Araştırmacılar farelerin yüzünü yakından filme aldı. Hoş ya da tatsız olaylar karşısında farelerin yüzünde her seferinde benzer, kalıp ifadeler belirdi. Bilgisayar bu ifadeleri ayrı gruplara ayırabildi. Aynı uyaran, hayvanın o anki durumuna göre farklı bir ifade doğurdu. Yani yüz, o anki durumu yansıtıyordu.

Hedefler: **filme** kolay · **ifadeleri** benzer · **farenin** yok

### B8 · Ahtapotun iki uykusu (`medeiros2021`, B tipi, 57 kelime)

Dört ahtapot uyurken kameraya alındı. Uykuda iki ayrı evre göze çarptı. Sakin evrede derileri soluk, gözbebekleri kapalıydı ve bu evre uzun sürdü. Hareketli evrede ise derileri renkten renge girdi, gözleri hızla kıpırdadı; bu evre yaklaşık kırk saniye sürdü. Hareketli evre çoğunlukla sakin evrenin ardından, yarım saate yakın aralarla geldi. Bu düzen, kuşların ve memelilerin uyku döngüsünü andırıyor.

Hedefler: **kameraya** kolay · **uykuda** benzer · **evrenin** iki benzer

### B9 · Köpekler sözü ve tonu ayırıyor (`andics2016`, A tipi, 50 kelime)

Bir köpeğe aynı övgü sözünü neşeli ve düz bir sesle söylediğinizi düşünün. Eğitilmiş köpekler tarayıcıda kıpırdamadan yatarken bu sözleri dinledi. Köpekler sözcüğün anlamını ve ses tonunu ayrı ayrı işledi. Hoşnutluk tepkisi ise yalnız söz de ton da övgü olduğunda belirdi. Bu iki bilgiyi ayırıp birleştirme yeteneği, dil olmadan da gelişebiliyor.

Hedefler: **tarayıcıda** kolay · **sözcüğün** benzer · **köpeğin** yok

### B10 · Tüyleri diken diken eden ikili (`shwartz2020`, B tipi, 56 kelime)

Üşüdüğümüzde tüylerimiz diken diken olur. Bunu kıl köküne bağlı küçük bir kas ile ona uzanan bir sinir yapar. Farelerde yapılan bir çalışma bu ikilinin başka bir işini de buldu. Sinir, kılı yeniden üreten hücrelerin ne zaman çalışacağını etkiliyor; kas da bu sinirin yerinde kalmasını sağlıyor. Yani diken diken olan tüyler ile yeni tüylerin çıkması aynı ekipten.

Hedefler: **Üşüdüğümüzde** kolay · **kılı** benzer · **tüylerimiz** iki benzer

### B11 · Aynaya bakan balık (`kohda2019`, A tipi, 60 kelime)

Aynada kendini bilmek uzun süre memelilere ve kuşlara özgü sanıldı. Temizlikçi balık adlı küçük bir balık bu sınırı zorladı. Balıklar önce yansımaya bir yabancıymış gibi tepki verdi, sonra aynanın önünde tuhaf hareketler denedi, sonunda yansımasını uzun uzun izledi. Bedenine renkli bir işaret konunca, ayna karşısında bedenini bir yüzeye sürterek işareti silmeye çalıştı. Şeffaf işarete ve aynasız ortama hiç tepki vermedi.

Hedefler: **sürterek** kolay · **aynanın** benzer · **balığın** yok

### B12 · Kediler adını ayırt ediyor (`saito2019`, B tipi, 51 kelime)

Kedilerin bizi dinlemediği söylenir. Bir deneyde kedilere önce dört sıradan sözcük ya da evdeki başka kedilerin adları dinletildi. Kediler alışıp ilgisini kaybettikten sonra kendi adlarını duydu ve belirgin biçimde yeniden tepki verdi. Bu, adı yabancı biri söylese de oldu. Kedi kafede yaşayan kediler ise kendi adını evdeki öbür kedilerin adlarından ayıramadı.

Hedefler: **yabancı** kolay · **adını** benzer · **kedilere** iki benzer

### B13 · Gülen yüzü seçen keçiler (`nawroth2018`, A tipi, 53 kelime)

Köpekler ve atlar insan yüzünü okuyabiliyor. Peki süt ve et için yetiştirilen keçiler? Bir duvara aynı yabancının iki fotoğrafı asıldı: birinde gülüyor, öbüründe kızgındı. Keçiler arenanın öbür ucundan bırakıldı. Çoğu, önce gülen yüze gitti ve onunla daha uzun ilgilendi. Bu tercih, gülen yüz sağ taraftayken belirgindi. Evcilleşme, hayvanların zihnini sandığımızdan derin etkilemiş olabilir.

Hedefler: **arenanın** kolay · **yüze** benzer · **keçilerin** yok

### B14 · Suda buruşan parmaklar (`kareklas2013`, B tipi, 51 kelime)

Elimiz uzun süre suda kalınca parmak uçlarımız yavaş yavaş buruşur. Bu buruşma kendiliğinden olmaz; sinir sistemimiz onu yönetir. Bir deneyde katılımcılar küçük nesneleri elleriyle taşıdı. Nesneler suyun içindeyken, buruşuk parmaklar düz parmaklardan daha hızlı çalıştı. Kuru nesnelerde ise buruşukluk hiç fark yaratmadı. Parmak buruşması, ıslak nesneleri tutmak için bir uyum olabilir.

Hedefler: **katılımcılar** kolay · **nesnelerde** benzer · **parmaklardan** iki benzer

### B15 · Koku izini süren insanlar (`porter2007`, A tipi, 53 kelime)

Koku denince akla köpekler gelir. Bir deneyde insanlardan bir kokunun izini yalnız burunlarıyla sürmeleri istendi. İnsanlar bunu başardı ve denedikçe daha iyi yaptı. Burun deliklerimiz birbirinden yaklaşık üç buçuk santim ayrı yerlerden koku alıyor. İki deliğin farkı izi bulmaya yardım ediyor. Koku alma yeteneğimizin kötü ünü, belki de bu yeteneği az kullanmamızdan geliyor.

Hedefler: **santim** kolay · **izini** benzer · **kokuyu** yok

### B16 · Su ayılarının sırrı (`hashimoto2016`, B tipi, 53 kelime)

Su ayıları suda yaşayan minicik hayvanlardır. Bazı türleri neredeyse tamamen kurumaya ve kuruyken pek çok zorlu koşula dayanabilir. Araştırmacılar en dayanıklı türlerden birinin genlerini tek tek okudu. Hasara yol açan bazı yollar kaybolmuş, hasarı onaran gen aileleri çoğalmıştı. Yalnız su ayılarında bulunan yeni proteinler de vardı. Su ayılarının dayanıklılığı bu proteinlerle ilişkili görünüyor.

Hedefler: **minicik** kolay · **türlerden** benzer · **ayılarının** iki benzer

### B17 · Yunusun imza ıslığı (`king2013`, A tipi, 50 kelime)

Her yunus kendine özgü bir ıslık geliştirir; buna imza ıslığı denir. Islık, sesin tınısından bağımsız olarak kimliği taşır. Araştırmacılar yabani yunuslara kendi ıslıklarının bir kopyasını dinletti. Yunuslar kendi ıslığını duyunca karşılık verdi. Başka yunusların ıslıklarına ise yanıt vermedi. Öğrenilmiş bir sesi ad gibi kullanmak, insan dışındaki memelilerde çok nadir görülür.

Hedefler: **tınısından** kolay · **ıslığını** benzer · **yunusun** yok

### B18 · Dokunarak tadan kollar (`vangiesen2020`, B tipi, 50 kelime)

Ahtapotlar deniz dibini esnek kollarıyla adım adım tarar. Kollar yalnız dokunmaz, dokunduğunu tadar da. Araştırmacılar bu işi yapan alıcıları buldu. Bu alıcılar suda zor çözünen maddeleri, yalnız temas edince algılıyor. Kollardaki farklı hücreler farklı alıcılar taşıyor ve bilgiyi yerinde işliyor. Bu yüzden ahtapot kolları kendi başına karar verir gibi davranabiliyor.

Hedefler: **esnek** kolay · **alıcıları** benzer · **kollarıyla** iki benzer

### B19 · Uyuyan denizanası (`nath2017`, A tipi, 55 kelime)

Denizanasının bir merkezi yoktur; sinirleri bedenine ağ gibi yayılmıştır. Ters denizanası adı verilen bir tür, gün boyu düzenli aralıklarla kasılıp gevşer. Araştırmacılar bu atımları günlerce saydı. Geceleri atımlar seyreldi ve hayvan uyarılara geç tepki verdi. Güçlü bir uyarıyla ise hemen kendine geldi. Gece uyutulmayan denizanaları ertesi gün daha durgundu. Bu, uykunun çok eski olduğunu düşündürüyor.

Hedefler: **gevşer** kolay · **atımları** benzer · **denizanasına** yok

### B20 · Sayı sayan sinekkapan (`bohm2016`, B tipi, 50 kelime)

Venüs sinekkapanı, yapraklarındaki duyarlı tüylere iki kez dokunulunca kapanır. Ama kapan yemeğe değip değmeyeceğini saymadan karar vermez. Araştırmacılar tüyleri sırayla uyarıp sinyalleri saydı. İki dokunuştan sonra kapanma yolu açıldı. Üçten fazla dokunuşta sindirim genleri çalışmaya başladı. Dokunuş arttıkça gen etkinliği de arttı. Çırpınan böcek, kendi dokunuşlarıyla besin olduğunu bildirmiş oluyor.

Hedefler: **böcek** kolay · **tüylere** benzer · **dokunuşlarıyla** iki benzer

### B21 · Yüzün peşindeki yenidoğan (`johnson1991`, A tipi, 55 kelime)

Yaşamlarının ilk saatindeki bebeklere yavaşça hareket eden kartlar gösterildi. Kartlardan birinde yüze benzeyen bir çizim, öbürlerinde karışık çizgiler vardı. Bebekler yüze benzeyen çizimi başlarıyla ve gözleriyle daha uzağa kadar izledi. Bu bulgu iki ayrı doğumevinde yinelendi. Bulgu, bebeklerin yüze benzeyen desenlere yaşamın ilk saatinden ilgi gösterdiğini düşündürüyor. İlginç biçimde bu güçlü takip ikinci ayda azaldı.

Hedefler: **doğumevinde** kolay · **çizimi** benzer · **bebeğin** yok

### B22 · Monet ile Picasso'yu ayıran güvercinler (`watanabe1995`, B tipi, 51 kelime)

Güvercinlere Monet'nin ve Picasso'nun tablolarının renkli fotoğrafları gösterildi. Kuşlar zamanla iki ressamı ayırmayı öğrendi. Daha önce hiç görmedikleri tabloları da doğru ayırdılar. Monet'den Cezanne ve Renoir'a, Picasso'dan Braque ve Matisse'e genelleme yaptılar. Monet tabloları ters çevrilince ayırma bozuldu, Picasso tabloları ters çevrilince bozulmadı. Belki de kuşlar Monet tablolarında resmedilen nesnelere bakıyordu.

Hedefler: **Renoir'a** kolay · **tablolarının** benzer · **Picasso'dan** iki benzer

### B23 · Yüz ayırt eden okçu balığı (`newport2016`, A tipi, 54 kelime)

Okçu balığı, avını sudan tükürdüğü bir su okuyla düşürür. Araştırmacılar bu tükürüğü bir seçim aracı yaptı. Balıklara ekranda iki insan yüzü birlikte gösterildi; öğrendikleri yüze su tükürdüler ve 44 yüz arasından doğruyu seçebildiler. Renk, kafa biçimi ve parlaklık eşitlendiğinde de başarılı oldular. Balıkların insan yüzüne özel bir donanımı olmadığı düşünülüyor; yine de bunu yapabildiler.

Hedefler: **parlaklık** kolay · **yüze** benzer · **balığın** yok

### B24 · Kızgın yüzü fark eden atlar (`smith2016`, B tipi, 52 kelime)

Atlara aynı yabancının gülen ve kızgın yüz fotoğrafları gösterildi. Kızgın yüzü görünce atlar başını çevirip ona daha çok sol gözüyle baktı. Hayvanlarda sol gözle bakış, olumsuz algılanan durumlarda sık görülür. Kızgın yüzler karşısında atların kalp atışı da daha hızlı yükseldi. İnsan yüz ifadesine böyle yönlü bir tepki daha önce yalnız köpeklerde gösterilmişti.

Hedefler: **köpeklerde** kolay · **gözüyle** benzer · **yüzü** iki benzer

<!-- B:bitir -->
