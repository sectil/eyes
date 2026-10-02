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
| G3b | Bir deneyde kuzgunlar, ileride kullanacakları bir aleti 17 saat öncesinden seçebildi. | giriş örnek kartındaki metin; aranan kelime "kuzgunlar" |
| G4a | Kelime üstte çıkar | adım 1 |
| G4b | Metinde bul ve dokun | adım 2 |
| G4c | Yoksa “Yok” de | adım 3 |
| G6 | Neye dayanıyor? | bağlantı; iddia sınırı bu sayfada (N5). Kapı tur 1: girişte Başla'nın üstünde 5/5 motivasyonu düşürdü |
| G7 | Başla | düğme |

### Arama
| Kimlik | Metin | Not |
|---|---|---|
| A1 | Bu kelimeyi bul | aranan kelimenin üstünde, ortada; 320'de gizli |
| A1b | {s} sn | süre çizgisinin yanında kalan süre; 20'den geri sayar |
| A2 | Metinde yok | düğme |
| A3 | {Yazar} ve ark. · {Dergi} {Yıl} · PMID {pmid} | arama sırasında görünmez; A9 geçişinde ve sonuçta S7 altında. İki yazarlıda "{Yazar1} ve {Yazar2}" |
| A4a | Buldun | bulununca kelimenin üstündeki etiket; kelime ve süre yeşile döner |
| A4b | {s} sn | bulma süresi, A1b'nin yerinde |
| A5 | Bu değil | yalnız sesli okuyucu; yanlış dokunuşta kelime kısa sallanır, renk değişmez |
| A6a | Süre doldu. Kelime buradaydı. | 20 sn dolunca, kelime metindeyse; kelime işaretlenir |
| A6b | Süre doldu. Bu kelime metinde yoktu. | 20 sn dolunca, kelime yoksa |
| A7a | Doğru, metinde yok | "Yok" doğruysa kelimenin üstündeki etiket |
| A7b | Kesik çizgili kelimeler benzer ama aynı değil. | A7a'nın altında; benzer biçimler kesik çizgili kutuda |
| A7c | Devam | "Yok" doğru çıkınca düğme |
| A8 | Kelime metindeydi, işaretledik. | "Yok" dendi ama kelime vardı |
| A9 | Sıradaki metin | iki metin arasındaki geçiş etiketi |

### Sonuç
| Kimlik | Metin | Not |
|---|---|---|
| S1 | Tur bitti | üst satır |
| S2 | {x} sn | büyük sayı: doğru bulunan kelimelerin ortanca süresi |
| S2b | {d}/6 · doğru | sağda; doğru bulunan ve doğru "Yok" sayısı |
| S3 | Bir kelimeyi genelde bu sürede buldun. | ortancanın sade anlatımı |
| S3b | Süre için en az 3 kelime bulmak gerekiyor; bu tur sayılarla kaydedildi. | 3'ten az bulunduysa S2 ve S3 yerine |
| S4 | En hızlı turun · {x} sn | en düşük `medianSec`; değişim sözcüğü değildir, Nef'in rekor anıyla aynı veri. İlk turda gösterilmez |
| S5 | Kelime bulma süresi | Gelişim kutusunun başlığı, metrik adıyla aynı (GL1) |
| S6 | Başlangıç · {k}/8 gün · başlangıcından iyi · değişim yok · henüz belli değil | hüküm sözcüğü ve sayı `metricStatusV2` + `changeText` + `verdictWord`'den; modül kendisi kurmaz |
| S7 | Bugün öğrendiğin | altında iki metnin başlığı ve A3 satırı |
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
### B1 · Boş kartı en az sayan arılar (`howard2018`, A tipi, 35 kelime)

Bal arıları kartlardaki şekilleri karşılaştırıp daha az şekilli olanı seçmeyi öğrendi. Sonra boş bir kart gösterildi. Arılar boş kartı, tek şekilli karttan da daha az olarak değerlendirdi. Benzer bir beceri papağanlarda ve maymunlarda da görülmüştü.

Hedefler: **papağanlarda** kolay · **kartı** benzer · **arıya** yok

### B2 · 17 saat sonrası için alet seçen kuzgunlar (`kabadayi2017`, B tipi, 35 kelime)

Geleceği planlamak uzun süre insana ve büyük maymunlara özgü sanıldı. Bir deneyde kuzgunlar, ileride kullanacakları bir aleti 17 saat öncesinden seçebildi; kendilerini de tuttular. Sonuçlar maymunlarınkine benziyor. Araştırmacılara göre bu beceri kuzgunlarda, maymunlardan bağımsız gelişmiş.

Hedefler: **aleti** kolay · **kuzgunlarda** benzer · **maymunlara** iki benzer

### B3 · Ada benzer çağrılarla seslenen filler (`pardo2024`, A tipi, 34 kelime)

Yabani Afrika filleri birbirine kişiye özgü çağrılarla sesleniyor. Kayıtlar geri dinletildiğinde her fil, kendisine yöneltilmiş çağrıya daha güçlü tepki verdi. Yunuslar karşısındakinin sesini taklit eder; fillerin ise taklit etmeden, ada benzer seslerle seslendiği düşünülüyor.

Hedefler: **Yunuslar** kolay · **çağrıya** benzer · **filin** yok

### B4 · Gıdıklanınca zıplayan sıçanlar (`ishiyama2016`, B tipi, 35 kelime)

Sıçanlar gıdıklandığında insan kulağının duyamayacağı ince sesler çıkarır. Gıdıklanan sıçanlar ele yaklaştı ve kendiliğinden zıpladı; bu sıçrayışlara sevinç sıçrayışı deniyor. Ortam ürkütücüyse gıdıklanma aynı etkiyi yapmadı. Bulgular gıdıklanma ile oyun arasında bir bağ olduğunu düşündürüyor.

Hedefler: **zıpladı** kolay · **sıçrayışlara** benzer · **gıdıklandığında** iki benzer

### B5 · Saklambaç oynayan sıçanlar (`reinhold2019`, A tipi, 31 kelime)

Araştırmacılar sıçanlarla, yemek ödülü vermeden saklambaç oynadı. Sıçanlar oyunu çabuk öğrendi, saklanan ve arayan rolleri arasında geçti. Saklanırken pek ses çıkarmadılar ve içi görünmeyen kutuları seçtiler; ararken eski saklanma yerlerini hatırladılar.

Hedefler: **kutuları** kolay · **saklanma** benzer · **oyunun** yok

### B6 · Susuz kalan bitkinin sesi (`khait2023`, B tipi, 31 kelime)

Domates ve tütün bitkileri susuz kaldığında ya da kesildiğinde, uzaktan kaydedilebilen ultrasonik sesler çıkardı. Kayıtlar sessiz bir odada ve bir serada yapıldı. Bilgisayar yalnız bu seslere bakarak bitkinin durumunu ayırt edebildi.

Hedefler: **serada** kolay · **bitkinin** benzer · **seslere** iki benzer

### B7 · Farelerin yüz ifadesi (`dolensek2020`, A tipi, 31 kelime)

Araştırmacılar farelerin yüzünü yakından filme aldı. Hoş ya da tatsız olaylarda yüzlerinde kalıp ifadeler belirdi. Bilgisayar bu ifadeleri gruplara ayırdı. Aynı uyaran, hayvanın o anki durumuna göre farklı bir ifade doğurdu.

Hedefler: **filme** kolay · **ifadeleri** benzer · **farenin** yok

### B8 · Ahtapotun iki uykusu (`medeiros2021`, B tipi, 40 kelime)

Dört ahtapot uyurken kameraya alındı. Uykuda iki evre vardı. Sakin evrede derileri soluktu. Hareketli evrede derileri renkten renge girdi, gözleri kıpırdadı. Bu evre çoğunlukla sakin evrenin ardından, yarım saate yakın aralarla geldi. Bu düzen kuşların ve memelilerin uyku döngüsünü andırıyor.

Hedefler: **kameraya** kolay · **uykuda** benzer · **evrenin** iki benzer

### B9 · Köpekler sözü ve tonu ayırıyor (`andics2016`, A tipi, 32 kelime)

Eğitilmiş köpekler tarayıcıda kıpırdamadan yatarken övgü sözlerini neşeli ve düz bir sesle dinledi. Köpekler sözcüğün anlamını ve ses tonunu ayrı işledi. Hoşnutluk tepkisi ise yalnız söz de ton da övgü olduğunda belirdi.

Hedefler: **tarayıcıda** kolay · **sözcüğün** benzer · **köpeğin** yok

### B10 · Tüyleri diken diken eden ikili (`shwartz2020`, B tipi, 36 kelime)

Üşüdüğümüzde tüylerimiz diken diken olur. Bunu kıl köküne bağlı küçük bir kas ile bir sinir yapar. Farelerde bu sinir, kılı yeniden üreten hücreleri de etkiliyor. Yani diken diken olan tüyler ile yeni tüylerin çıkması aynı ekipten.

Hedefler: **Üşüdüğümüzde** kolay · **kılı** benzer · **tüylerimiz** iki benzer

### B11 · Aynaya bakan balık (`kohda2019`, A tipi, 35 kelime)

Temizlikçi balık adlı küçük bir balık aynanın önünde önce yabancıya tepki verir gibi davrandı, sonra yansımasını uzun uzun izledi. Bedenine renkli bir işaret konunca, ayna karşısında bedenini sürterek işareti silmeye çalıştı. Aynasız ortamda bunu yapmadı.

Hedefler: **sürterek** kolay · **aynanın** benzer · **balığın** yok

### B12 · Kediler adını ayırt ediyor (`saito2019`, B tipi, 37 kelime)

Bir deneyde kedilere önce sıradan sözcükler ya da evdeki başka kedilerin adları dinletildi. Kediler alıştıktan sonra kendi adlarını duyunca yeniden tepki verdi; adı yabancı biri söylese de. Kedi kafedeki kediler ise kendi adını öbür kedilerin adlarından ayıramadı.

Hedefler: **yabancı** kolay · **adını** benzer · **kedilere** iki benzer

### B13 · Gülen yüzü seçen keçiler (`nawroth2018`, A tipi, 30 kelime)

Bir duvara aynı yabancının iki fotoğrafı asıldı: birinde gülüyor, öbüründe kızgındı. Arenanın öbür ucundan bırakılan keçilerden çoğu önce gülen yüze gitti. Bu tercih, gülen yüz sağ taraftayken belirgin biçimde görüldü.

Hedefler: **arenanın** kolay · **yüze** benzer · **keçilerin** yok

### B14 · Suda buruşan parmaklar (`kareklas2013`, B tipi, 35 kelime)

Elimiz suda kalınca parmak uçlarımız buruşur. Bu buruşmayı sinir sistemimiz yönetir. Bir deneyde katılımcılar su içindeki nesneleri buruşuk parmaklarla, düz parmaklardan daha hızlı taşıdı. Kuru nesnelerde fark yoktu. Buruşma ıslak nesneleri tutmaya bir uyum olabilir.

Hedefler: **katılımcılar** kolay · **nesnelerde** benzer · **parmaklardan** iki benzer

### B15 · Koku izini süren insanlar (`porter2007`, A tipi, 34 kelime)

Bir deneyde insanlardan bir kokunun izini yalnız burunlarıyla sürmeleri istendi. İnsanlar bunu başardı ve denedikçe daha iyi yaptı. Burun deliklerimiz yaklaşık üç buçuk santim ayrı yerlerden koku alıyor; bu fark izi bulmaya yardım ediyor.

Hedefler: **santim** kolay · **izini** benzer · **kokuyu** yok

### B16 · Su ayılarının sırrı (`hashimoto2016`, B tipi, 34 kelime)

Su ayıları suda yaşayan minicik hayvanlardır; bazı türleri neredeyse tamamen kurumaya dayanabilir. Araştırmacılar en dayanıklı türlerden birinin genlerini okudu. Hasarı onaran gen aileleri çoğalmıştı. Su ayılarının dayanıklılığı, yalnız su ayılarında bulunan proteinlerle ilişkili görünüyor.

Hedefler: **minicik** kolay · **türlerden** benzer · **ayılarının** iki benzer

### B17 · Yunusun imza ıslığı (`king2013`, A tipi, 38 kelime)

Her yunus kendine özgü bir imza ıslığı geliştirir; ıslık, sesin tınısından bağımsız olarak kimliği taşır. Yabani yunuslar kendi ıslığının kopyasını duyunca karşılık verdi, başka yunusların ıslıklarına vermedi. Öğrenilmiş bir sesi ad gibi kullanmak insan dışındaki memelilerde çok nadirdir.

Hedefler: **tınısından** kolay · **ıslığının** benzer · **yunusun** yok

### B18 · Dokunarak tadan kollar (`vangiesen2020`, B tipi, 39 kelime)

Ahtapotlar deniz dibini esnek kollarıyla tarar. Kollar dokunduğunu tadar da. Araştırmacılar bu işi yapan alıcıları buldu: suda zor çözünen maddeleri yalnız temasla algılıyorlar. Kollardaki farklı hücreler farklı alıcılar taşıyor. Bu yüzden ahtapot kolları kendi başına karar verir gibi davranabiliyor.

Hedefler: **esnek** kolay · **alıcıları** benzer · **kollarıyla** iki benzer

### B19 · Denizanası da uyur mu? (`nath2017`, A tipi, 35 kelime)

Ters denizanası gün boyu düzenli aralıklarla kasılıp gevşer. Araştırmacılar bu atımları günlerce saydı. Geceleri atımlar seyreldi ve hayvan uyarılara geç tepki verdi. Gece uyutulmayan denizanaları ertesi gün daha durgundu. Bu, uykunun çok eski olabileceğini düşündürüyor.

Hedefler: **gevşer** kolay · **atımları** benzer · **denizanasına** yok

### B20 · Sayı sayan sinekkapan (`bohm2016`, B tipi, 30 kelime)

Venüs sinekkapanı, duyarlı tüylere iki kez dokunulunca kapanır. Araştırmacılar tüyleri uyarıp sinyalleri saydı. Üçten fazla dokunuşta sindirim genleri çalıştı; dokunuş arttıkça etkinlik arttı. Çırpınan böcek, kendi dokunuşlarıyla besin olduğunu bildiriyor.

Hedefler: **böcek** kolay · **tüylere** benzer · **dokunuşlarıyla** iki benzer

### B21 · Yüzün peşindeki yenidoğan (`johnson1991`, A tipi, 31 kelime)

Yaşamlarının ilk saatindeki bebeklere yavaşça hareket eden çizimler gösterildi. Bebekler yüze benzeyen çizimi, karışık çizgilerden daha uzağa kadar izledi. Bulgu ikinci bir doğumevinde de yinelendi. Bu güçlü takip ikinci ayda azaldı.

Hedefler: **doğumevinde** kolay · **çizimi** benzer · **bebeğin** yok

### B22 · Monet ile Picasso'yu ayıran güvercinler (`watanabe1995`, B tipi, 30 kelime)

Güvercinler zamanla Monet'nin ve Picasso'nun tablolarını ayırmayı öğrendi; hiç görmedikleri yeni tabloları da ayırdılar. Monet'den Renoir'a, Picasso'dan Matisse'e genelleme yaptılar. Monet tabloları ters çevrilince ayırma bozuldu, Picasso tablolarının tersi bozmadı.

Hedefler: **Renoir'a** kolay · **tablolarının** benzer · **Picasso'dan** iki benzer

### B23 · Yüz ayırt eden okçu balığı (`newport2016`, A tipi, 30 kelime)

Okçu balığı avını tükürdüğü suyla düşürür. Balıklara ekranda iki insan yüzü gösterildi; öğrendikleri yüze su tükürdüler ve 44 yüz arasından doğruyu seçebildiler. Renk, kafa biçimi ve parlaklık eşitlenince de başardılar.

Hedefler: **parlaklık** kolay · **yüze** benzer · **balığın** yok

### B24 · Kızgın yüzü fark eden atlar (`smith2016`, B tipi, 40 kelime)

Atlara aynı yabancının gülen ve kızgın yüzlerinin fotoğrafları gösterildi. Atlar kızgın yüzü daha çok sol gözüyle izledi; bu göz tercihi olumsuz durumlarda sık görülür. Kalp atışları daha hızlı yükseldi. İnsan yüz ifadesine böyle bir tepki daha önce yalnız köpeklerde gösterilmişti.

Hedefler: **köpeklerde** kolay · **gözüyle** benzer · **yüzü** iki benzer

<!-- B:bitir -->
