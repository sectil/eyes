# Nefona Yoga: Güvenlik Kanıt Dosyası

Hazırlanma tarihi: 2026-09-28. Kaynak: PubMed (MCP `search_articles`, ardından her makale için `get_article_metadata`).
Bu dosyadaki her makalenin başlığı, özeti ve DOI'si bu oturumda PubMed kaydından okundu. **Tam metinler okunmadı.** Özette yazmayan her ayrıntı "doğrulanmadı" olarak işaretlendi. Özeti olmayan kayıtlarda yalnızca başlık doğrulandı ve bu durum yanlarında belirtildi.

Kod atıfları `/home/user/eyes` çalışma ağacından okundu (HEAD `c7566a1`). Depodaki hiçbir dosya değiştirilmedi.

**Dil kuralı.** Nefona sağlık iddiasında bulunmaz. Aşağıdaki kanıtlar yalnızca tasarım gerekçesi olarak kullanılır. Bulgular "çalışmada … görüldü" diye yazılır; "tedavi eder", "iyileştirir" ya da "korur" gibi ifadeler kullanılmaz. "Tasarım çıkarımı" etiketi, kanıttan yola çıkan ama doğrudan test edilmemiş kararları gösterir.

Kısaltmalar: SD = sistematik derleme; MA = meta-analiz; RKÇ = randomize kontrollü çalışma; AE = istenmeyen olay; HV = hiperventilasyon (hızlı ya da derin soluyarak kandaki karbondioksiti düşürmek); YN = yoga nidra; TSSB = travma sonrası stres bozukluğu; KB = kan basıncı.

---

## 0. Tek bakışta: 12 karar

| # | Karar | Dayanak (kısaca) | PMID |
|---|---|---|---|
| 1 | Onboarding'de kısa bir güvenlik kartı gösterilir (bkz. §11.A). Kart ilk kez bir kez açılır, sonra Bilgi ekranından yeniden okunabilir. | Meditasyonla ilişkili istenmeyen etkiler seyrek değil. Yaygınlık deneysel çalışmalarda %3,7, gözlemsel çalışmalarda %33,2. | 32820538 |
| 2 | Her derste açılışta tek cümle: "İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin." | Travma-duyarlı YN'de özerklik ve onay ilk bileşenler arasında. Geri dönüşler (flashback) ve uzamış dissosiyasyon bildirilmiş. | 39690521 |
| 3 | Dil komut değil davettir ("istersen …", "… edebilirsin"). | TC-TSY eğitiminde seçime dayalı yaklaşım ve davet dili öne çıkıyor. TCTSY RKÇ'sinde tamamlama oranı %65,3, bilişsel işleme terapisinde %45,8. | 33819832, 42370917, 38064219 |
| 4 | **Hızlı ya da zorlu nefes hiçbir derste yok:** kapalabhati, bhastrika, "ateş nefesi", döngüsel hiperventilasyon. | 3 dakikalık HV absans epilepsili çocukların neredeyse hepsinde nöbet tetikliyor. Jeneralize epilepside klinik nöbet oranı %50'ye kadar çıkabiliyor. Vaka raporlarında en sık anılan tekniklerden biri zorlu nefes. | 32446208, 37813123, 24146758 |
| 5 | **HV'nin ardından nefes tutma** (Wim Hof tarzı) hiç yok. Suda, araçta ya da ayaktayken hiçbir nefes pratiği yapılmaz. | Önce HV yapılıp ardından nefes tutulduğunda nefes alma dürtüsü gecikiyor ve oksijen doygunluğu daha çok düşüyor. Şnorkel ölümlerinin bir bölümü bu yoldan oluşmuş. | 37060440, 10721339, 22900874 |
| 6 | Nefes tutma yalnızca isteğe bağlı. Uygulamadaki üst sınır 7 sn (`breath.js:14`) aşılmaz. Varsayılan tutma süresi 0'dır. | Gözetimsiz, kendi kendine yapılan pratik yan etki riskinin artmasıyla ilişkili bulundu. Gebelikte tutmalı nefes tekniklerinin güvenliğini doğrudan test eden çalışma bulunamadı. | 31357980 |
| 7 | Gündüz derslerinin sonu **dışa dönüşle** biter: gözler açılır, çevre fark edilir, beden hareket ettirilir. Zamanlayıcı bu bölümü kesemez. | Hipnoz sonrası "uyandırma" başarısızlığı, istenmeyen etkilerde önemli bir etken sayılıyor. YN'de yeterli yerleşme ve dışa dönüş bir bileşen. | 28300508, 39690521 |
| 8 | Uyku derslerinde dışa dönüş olmaz, bunun yerine uyku izni verilir. Ses kosinüs eğrisiyle kısılarak biter; sabaha kadar çalmaz. | YN'de "uyku izni" bir bileşen. Kulaklıkla uyumak, işitme sağlığı çalışmasında riskli bir davranış olarak ele alındı. | 39690521, 33562129 |
| 9 | "Araç kullanırken dinleme" uyarısı konur. Uyku derslerinden hemen sonra direksiyona geçilmemesi söylenir. | Direksiyonda uykululuk kaza riskiyle ilişkili (OR 2,51). 30 dakikadan uzun şekerlemelerden sonra kısa süreli uyku ataleti görülüyor. | 28958002, 21075238 |
| 10 | Uzanarak yapılan derslerden sonra "önce otur, sonra kalk" denir. | Yoga nidra sonrası KB düşüşü görüldü. Ayağa kalkınca görülen ani KB düşüşü 65 yaş üstünde %29 sıklıkta. | 39974253, 40840566, 34260686 |
| 11 | Senaryolarda "tamamen kontrolü bırak" ya da "kıpırdayamıyorsun" gibi ifadeler, anı arama, geriye gitme (regresyon) ve "en acı anını hatırla" türü yönlendirmeler yer almaz. | Gevşemeye bağlı kaygı, kontrolü kaybetme korkusuyla ilişkili bulundu. Hipnoz ve bazı terapi işlemleri sahte anıya zemin hazırlayabiliyor. | 3069875, 17716079, 21227110 |
| 12 | Dersten sonra isteğe bağlı tek soru sorulur: "Zorlandın mı?" "Çok" cevabına sakin bir yönlendirme verilir (§11.F). | Etkiler çoğunlukla geçici. Kalıcı olumsuz etkiler aşırı uyarılma ve dissosiyasyonla ilişkili. Zararın izlenmesi öneriliyor. | 35174010, 35048869, 34074221 |

---

## 1. Meditasyon ve rehberli pratikte istenmeyen etkiler

### 1.1 Ne sıklıkta?

| Çalışma | Tasarım, n | Bulgular (özetteki sayılarla) | PMID · DOI |
|---|---|---|---|
| Farias 2020 | SD, 83 çalışma, 6.703 katılımcı (yoga duruşları dışarıda) | 55/83 çalışmada (%65) en az bir AE bildirildi. Toplam yaygınlık %8,3 (%95 GA 5–12). Deneysel çalışmalarda %3,7, gözlemsel çalışmalarda %33,2. En sık görülenler kaygı (%33), depresyon (%27) ve bilişsel anomaliler (%25); en seyrekler mide-bağırsak sorunları ve intihar davranışı (her biri %11). Daha önce ruh sağlığı sorunu olmayanlarda da görülebildi. | 32820538 · [10.1111/acps.13225](https://doi.org/10.1111/acps.13225) |
| Goldberg 2021 | ABD, nüfusa dayalı anket; 434 meditasyon deneyimli kişi | Genel soruda istenmeyen etki %32,3; en az bir özgül maddede %50,0. Bir aydan uzun sürenler %10,4. En sık görülenler kaygı, **travmatik yeniden yaşama** ve duygusal hassasiyet. İşlevsellikte bir miktar bozulma %10,6; bir aydan uzun süren bozulma %1,2. Çocuklukta yaşanan olumsuzluklar daha yüksek riskle ilişkiliydi. Bu etkileri yaşayanlar da meditasyon yaptıklarından ötekiler kadar memnundu. Yazarlar şeffaflık ve travma-duyarlılık öneriyor. | 34074221 · [10.1080/10503307.2021.1933646](https://doi.org/10.1080/10503307.2021.1933646) |
| Britton 2021 | 8 haftalık MBCT'nin 3 çeşidi, n=96; bağımsız değerlendirici, 44 maddelik görüşme (MedEx-I) | %83 en az bir meditasyon yan etkisi bildirdi. Olumsuz duygu tonlu etki %58; işlevselliği olumsuz etkileyen %37. **Kalıcı kötü etki %6–14**; bunlar aşırı uyarılma ve dissosiyasyon belirtileriyle ilişkiliydi. Oranlar diğer psikolojik tedavilere benziyordu. | 35174010 · [10.1177/2167702621996340](https://doi.org/10.1177/2167702621996340) |
| Schlosser 2019 | Kesitsel, 1.232 düzenli meditasyon yapan kişi | %25,6 (%95 GA 23,1–28,0) "özellikle hoş olmayan" bir deneyim bildirdi. Daha olası olanlar: tekrarlayan olumsuz düşünmesi yüksek olanlar, yalnızca içgörü (vipassana) tarzı pratik yapanlar, inzivaya katılmış olanlar. Kadınlarda ve dindar kişilerde daha az görüldü. | 31071152 · [10.1371/journal.pone.0216643](https://doi.org/10.1371/journal.pone.0216643) |
| Lindahl 2017 | Nitel çalışma, Batılı Budist uygulayıcılar | 7 alanda 59 deneyim tanımlandı: bilişsel, algısal, duygusal, bedensel, istem, benlik duygusu, sosyal. Şiddeti "hafif ve geçici" ile "ağır ve kalıcı" arasında değişiyor. | 28542181 · [10.1371/journal.pone.0176239](https://doi.org/10.1371/journal.pone.0176239) |
| Adams 2026 | Medito uygulaması, n=668 | İlk 30 günde medyan kullanım 16 dk. 14. günden sonra kullananlar %20'nin altında. Yazarlar, meditasyon uygulamalarının tanıtımında daha çok şeffaflık gerektiğini yazıyor. | 42258809 · [10.2196/79366](https://doi.org/10.2196/79366) |

**Raporlama eksikliği.** Etki çalışmaları istenmeyen olayları çoğu zaman sormuyor. Fibromiyaljide zihin-beden SD'sinde çalışmaların yalnızca yaklaşık üçte biri istenmeyen olayları raporladı (Steen 2024, PMID 39093008, [10.1093/pm/pnae076](https://doi.org/10.1093/pm/pnae076)). Rehberli imgeleme ve hipnoz MA'sında hiçbir çalışma güvenlik raporlamadı (Zech 2016, PMID 27896907, [10.1002/ejp.933](https://doi.org/10.1002/ejp.933)). Bel ağrısında meditasyon MA'sında çoğu çalışma ciddi istenmeyen olay bildirmedi (Soares 2021, PMID 34516731, [10.1515/sjpain-2021-0096](https://doi.org/10.1515/sjpain-2021-0096)). "Etki çalışmalarında yan etki bildirilmedi" bu yüzden "yan etki yok" anlamına gelmez. Farias 2020'de deneysel çalışmalardaki %3,7 ile gözlemsel çalışmalardaki %33,2 arasındaki fark da bununla uyumlu.

### 1.2 Tasarım okuması

- Olumsuz etkiler geçici olabildiği gibi, azınlıkta kalıcı da olabiliyor (Britton 2021). **Uygulama "herkese iyi gelir" demez** (Adams 2026: şeffaflık).
- En sık görülen türler kaygı, travmatik yeniden yaşama ve dissosiyasyon. Senaryoların her yerinde bir **çıkış yolu** ve **dünyaya dönüş kapısı** bulunur (§11.B).
- Dersler "yapısöküm" türü uzun içgörü pratiği ya da inziva yoğunluğunda değildir (Schlosser 2019). Nefona dersleri rehberlidir ve yoğunluğu ölçülüdür. *Tasarım çıkarımı.*

---

## 2. Gevşemeye bağlı kaygı ve panik

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Heide & Borkovec 1983 | Başlık: "gevşeme eğitimine bağlı paradoksal kaygı artışı". **Özet yok; oranlar doğrulanmadı.** 1984 tarihli devam makalesinin (mekanizmalar) de özeti yok. | 6341426 · [10.1037//0022-006x.51.2.171](https://doi.org/10.1037//0022-006x.51.2.171); 6365071 · [10.1016/0005-7967(84)90027-5](https://doi.org/10.1016/0005-7967(84)90027-5) |
| Braith 1988 | 30 kronik kaygılı kişiye **tek seans, kayıttan dinletilen** progresif gevşeme uygulandı. 5 kişide (%17) seans sırasında kaygı arttı. İç denetim odağı, kaygılanma korkusu ve **kontrolü kaybetme korkusu** ile ilişkili olabilir. | 3069875 · [10.1016/0005-7916(88)90040-7](https://doi.org/10.1016/0005-7916(88)90040-7) |
| Norton 1985 | Meditasyon grubunda 3/18, PMR grubunda 2/20 kişinin gevşeme sırasında kalp hızı arttı. | 3905864 · [10.1016/0005-7916(85)90065-5](https://doi.org/10.1016/0005-7916(85)90065-5) |
| Ley 1988 (kuram/derleme) | Kronik olarak hızlı soluyan kişi oturup ya da uzanıp gevşediğinde vücudun ürettiği CO₂ azalır. Soluk hacmi aynı kalırsa kandaki CO₂ daha da düşer ve panik benzeri duyumlar ortaya çıkabilir. | 3148637 · [10.1016/0005-7916(88)90054-7](https://doi.org/10.1016/0005-7916(88)90054-7) |
| Kim & Newman 2019 | Yaygın anksiyete bozukluğu (n=32), majör depresyon (n=34) ve sağlıklı kontroller (n=30) incelendi. "Olumsuz duyguya ani geçişe duyarlılık", gevşemeye bağlı kaygıyı yaygın anksiyete bozukluğunda tamamen, depresyonda kısmen açıkladı. | 31450137 · [10.1016/j.jad.2019.08.045](https://doi.org/10.1016/j.jad.2019.08.045) |
| Newman 2016/2018 | Yaygın anksiyete bozukluğu, n=41. Gevşemeye bağlı kaygıdan bağımsız olarak herkes iyileşti. Bu kaygının tepe düzeyinin düşük olması, özellikle tedavinin son üçte birinde, daha iyi sonuçla ilişkiliydi. | 27855541 · [10.1080/10503307.2016.1253891](https://doi.org/10.1080/10503307.2016.1253891) |
| Luberto 2020 | Gevşeme Duyarlılığı İndeksi üç boyutlu: fiziksel, bilişsel ve sosyal kaygılar. Belirtisi olan örneklemde puanlar daha yüksekti ve geçmişte gevşemeye korkuyla tepki vermiş olmayı yordadı. | 34149986 · [10.1007/s41811-020-00086-3](https://doi.org/10.1007/s41811-020-00086-3) |
| Khasky & Smith 1999 | RKÇ, n=114; 25 dk PMR, yoga esnemesi, imgeleme ya da kontrol görevi. Tüm gevşeme gruplarında "uzaklaşma" duygusu ("uzakta, ilgisiz" hissetme) olumsuz duygu ile pozitif ilişkiliydi. | 10483629 · [10.2466/pms.1999.88.2.409](https://doi.org/10.2466/pms.1999.88.2.409) |
| Toussaint 2021 | n=60; 20 dk kayıttan PMR, derin nefes, imgeleme ya da kontrol dinletildi. Üç yöntem de gevşemeyi artırdı. **Derin nefes grubunda önce ani bir fizyolojik uyarılma artışı görüldü**, sonra değerler başlangıç düzeyine döndü. PMR ve imgelemede gevşeme doğrusal ilerledi. | 34306146 · [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040) |
| Schaefert 2014 | Hipnoz, IBS, 8 RKÇ (n=464). Hipnoz grubundaki 238 kişiden biri (%0,4) istenmeyen olay nedeniyle çalışmayı bıraktı; bu olay **panik atak**tı. | 24901382 · [10.1097/PSY.0000000000000039](https://doi.org/10.1097/PSY.0000000000000039) |

**Tasarım okuması**
- Gevşeme bazı kişilerde, hatta **kayıttan dinletilen tek bir seansta bile**, kaygıyı artırabiliyor (Braith 1988). Onboarding kartı bunu dürüstçe ve korkutmadan söyler: "Bazen gevşerken huzursuz hissedebilirsin; bu olabilir."
- "Kontrolü kaybetme korkusu" bir risk etkeni. Bu yüzden senaryo "kontrol sende" der; "her şeyi bırak, kendini kaybet" demez.
- "Derin bir nefes al" komutu ilk anda uyarılmayı artırabiliyor (Toussaint 2021). Dersler **doğal nefesi fark etmekle** başlar; nefes derinleştirmek yerine **nefes vermeyi uzatmak** tercih edilir. *Tasarım çıkarımı.*
- Kaygıdaki ani yükselişler zamanla azalabiliyor (Newman). Kişi aynı dersi daha kısa ve gözleri açık sürümüyle yeniden deneyebilir (§11.F).

---

## 3. Hipnoz tarzı telkin: yan etkiler, "uyandırma" ve bellek

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Bollinger 2018 | ClinicalTrials.gov'daki hipnoz çalışmalarında hipnoza bağlanabilecek ciddi istenmeyen olay %0, diğerleri %0,47. Birçok çalışma bu verileri raporlamamış. Hepsi tıbbi durumlarda kullanılmış, psikiyatrik durumlarda değil; bu yüzden genellenebilirlik sınırlı. | 29485379 · [10.1080/00029157.2017.1315927](https://doi.org/10.1080/00029157.2017.1315927) |
| Häuser 2016 | En az 400 hastalık 5 MA incelendi. İkisinde hipnoz ve kontrol grupları arasında yan etki ya da güvenlik farkı bulunmadı. | 27173407 · [10.3238/arztebl.2016.0289](https://doi.org/10.3238/arztebl.2016.0289) |
| Howard 2017 | İstenmeyen etkiler genelde hafif ve geçici. **Hipnozdan çıkarma (uyandırma) başarısızlığı** istenmeyen etkilerde önemli bir rol oynuyor. Kişiyi hipnoz öncesi uyanıklık düzeyine geri döndürmek en az hipnozun kendisi kadar önemli. (Klinik yorum ve 3 vaka.) | 28300508 · [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281) |
| Cordi 2014 | n=70 sağlıklı kadın. Öğle şekerlemesinden önce "daha derin uyu" telkini dinletildi; derin uyku %81 arttı, uyanık geçen süre %67 azaldı. **Telkine az yatkın kişilerde bu etki görülmedi.** | 24882909 · [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778) |
| Loftus & Davis 2006 | Bazı terapötik işlemler sahte otobiyografik anılara yol açabiliyor; bireysel yatkınlık farklı. | 17716079 · [10.1146/annurev.clinpsy.2.022305.095315](https://doi.org/10.1146/annurev.clinpsy.2.022305.095315) |
| Johnson & Raye 1998 | Bir anının kaynağını ayırt etme süreci hipnoz, sosyal beklenti ve güdülenmeyle bozulabiliyor. "Anı arayan" meslekler sahte anı oluşturmamak için dikkatli olmalı. | 21227110 · [10.1016/s1364-6613(98)01152-8](https://doi.org/10.1016/s1364-6613(98)01152-8) |
| Lynn 1996 | Başlık: "Hipnoz olumsuz etkiler için özel bir risk taşır mı?" **Özet yok; içerik doğrulanmadı.** | 8582780 · [10.1080/00207149608416064](https://doi.org/10.1080/00207149608416064) |

**Tasarım okuması**
- Sahibin "dinlerken hipnoz olmalıyım" isteği, derinden içine çeken bir deneyim olarak anlaşılır. Metinde "hipnoz" klinik bir yöntem olarak geçmez; bu, `dossier-benlik.md` §15 ile tutarlıdır. Telkin etkisi kişiden kişiye çok değişiyor (Cordi 2014). Bu yüzden hiçbir ekranda "herkesi transa sokar" gibi bir vaat yer almaz.
- **Gündüz derslerinde "uyandırma" kapanışı zorunludur** (Howard 2017). Bu bölüm kısaltılmış sürümlerde de korunur (§11.D).
- **Sınama telkinleri yoktur.** "Kolların o kadar ağır ki kaldıramıyorsun" gibi ifadeler kişiye kontrolü kaybettiği duygusunu verir; bu, gevşemeye bağlı kaygının risk etkeniyle çakışıyor (Braith 1988). *Tasarım çıkarımı.*
- **Anı arama ve geriye gitme (regresyon) yoktur.** "Çocukluğuna dön", "o günü yeniden yaşa" gibi yönlendirmeler kullanılmaz (Loftus & Davis 2006; Johnson & Raye 1998).

---

## 4. Psikoz, bipolar bozukluk ve mani

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Kuijpers 2007 | Bir vaka ve literatür taraması: meditasyondan sonra akut, geçici ve çok biçimli bir psikoz tablosu. Diğer vakalar ya önceden var olan psikotik bozukluğun alevlenmesi ya da psikiyatrik öyküsü olmayan kişilerde kısa psikotik tepkiydi. Yazarlara göre meditasyon yatkın kişilerde bir stres etkeni gibi davranabilir. | 17848828 · [10.1159/000108125](https://doi.org/10.1159/000108125) |
| Goud 2022 | Vaka: aşırı ve **rehbersiz** meditasyondan sonra ortaya çıkan psikoz. | 36316997 · [10.1155/2022/2661824](https://doi.org/10.1155/2022/2661824) |
| Sherrill 2017; Prakash 2018; Charan 2022; Lu & Pierre 2007 | Meditasyon ya da yogayla ilişkilendirilen psikoz ve mani vakaları. **Özetleri yok; yalnızca başlıklar doğrulandı.** | 28073599 · [10.1016/j.psychres.2016.12.035](https://doi.org/10.1016/j.psychres.2016.12.035); 29475163 · [10.1016/j.ajp.2018.02.001](https://doi.org/10.1016/j.ajp.2018.02.001); 36778606 · [10.1177/02537176211059457](https://doi.org/10.1177/02537176211059457); 17974947 · [10.1176/appi.ajp.2007.07060960](https://doi.org/10.1176/appi.ajp.2007.07060960) |
| Chadwick 2009 | Özette "klinik literatür psikozu olanlarda meditasyona karşı uyarır" deniyor. Uyarlanmış grup mindfulness'ı ve evde CD ile pratik, n=22'lik bir fizibilite RKÇ'sinde denendi. Gruplar arasında fark çıkmadı; iki grup birlikte incelendiğinde işlevsellikte iyileşme görüldü. | 19545481 · [10.1017/S1352465809990166](https://doi.org/10.1017/S1352465809990166) |
| Ellett & Chadwick 2021 | Psikozda mindfulness araştırmalarında zararın izlenmesi ve raporlanması tutarsız. Yazarlar 8 öneri sunuyor; önerilerin içeriği özette yok. | 35048869 · [10.1192/bjp.2021.98](https://doi.org/10.1192/bjp.2021.98) |
| Jacobsen 2020 | Yatarak tedavi gören psikoz hastaları, 1–5 seanslık mindfulness temelli kriz müdahalesi, n=50. 3 istenmeyen olay oldu; hiçbiri çalışmayla ilişkili bulunmadı. | 32349698 · [10.1186/s12888-020-02608-x](https://doi.org/10.1186/s12888-020-02608-x) |
| Ellett 2022 | Çevrimiçi, 12 seanslık, psikoz için mindfulness grubu. Tamamlayanlarda anlamlı ve güvenilir düzeyde kötüleşme gösteren kimse olmadı. Gruplar rutin klinik bakım içinde verildi; Nefona'daki gibi tek başına dinleme değildi. | 35049131 · [10.1111/papt.12382](https://doi.org/10.1111/papt.12382) |

**Tasarım okuması**
- Kanıtın çoğu vaka raporu. Neden-sonuç ilişkisi ve sıklık bilinmiyor. Bu yüzden kart korkutmaz, yalnızca "önce danış" der.
- Vakalar "aşırı" ve "rehbersiz" pratikle ilişkilendiriliyor (Goud 2022). **Nefona dersleri sürekli rehberlidir.** Uzun sessizlik blokları kısa tutulur ve her sessizliğin sonunda ses geri gelir. *Tasarım çıkarımı; bu grupta sessizlik uzunluğunun güvenli sınırı doğrulanmadı.*
- Günlük ders sayısı sınırlanmaz, ama art arda çok uzun oturumlar teşvik edilmez: Gelişim ekranı "süre rekoru" değil "gün sayısı" ödüllendirir (`dossier-sakin.md` §11.8 ile tutarlı).

---

## 5. Travma ve TSSB: travma-duyarlı dil

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Luu 2024 | YN özenle uygulanmazsa yeniden travmatize edebilir: **bunaltıcı geri dönüşler, duygusal sıkıntı ve uzamış dissosiyasyon** bildirilmiş. Makale 10 bileşen öneriyor: (1) daha güvenli ve rahat ortam, (2) özerklik, sağlıklı sınırlar ve onay, (3) becerili farkındalık, (4) **uygun uzunluk ve hazırlık**, (5) **yeterli yerleşme ve dışa dönüş**, (6) **uyku izni**, (7) kişinin kendi seçtiği niyet, (8) **esnek beden dolaşımı ve nefes farkındalığı**, (9) bedende hissedilen zıtlık çiftleri, (10) **özenli imgeleme**. | 39690521 · [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021) |
| Zaccari 2023 | RKÇ, askerlik sırasında cinsel travmaya bağlı TSSB'si olan kadın gaziler; ITT n=131. Trauma Center Trauma-Sensitive Yoga (TCTSY; iç duyuma ve güçlenmeye odaklı Hatha yoga, 10 × 60 dk) bilişsel işleme terapisiyle (CPT) karşılaştırıldı. Tamamlama TCTSY'de %65,3, CPT'de %45,8 (p=0,03). İki grupta da belirtiler zamanla azaldı; gruplar arasında fark yoktu (eşdeğerlik). | 38064219 · [10.1001/jamanetworkopen.2023.44862](https://doi.org/10.1001/jamanetworkopen.2023.44862) |
| Kelly 2021 | Aynı çalışmanın ara analizi, n=104: beklenmeyen istenmeyen olay görülmedi. | 33788599 · [10.1089/acm.2020.0417](https://doi.org/10.1089/acm.2020.0417) |
| Oosterbroek & Dirk 2021 | Nitel, 7 eğitmen ve psikolog. TC-TSY eğitiminin öne çıkan yanları: **seçime dayalı yaklaşım**, **davet ve farkındalık diliyle konuşmak**, güven ve uyum. Bazı katılımcılar terminolojinin katılığını eleştirdi. | 33819832 · [10.1016/j.ctcp.2021.101365](https://doi.org/10.1016/j.ctcp.2021.101365) |
| Dietrich 2026 | Yerli halktan bir TCTSY eğitim grubu, nitel, n=15. Eğitimden akılda kalanlar: travmanın etkileri ve **davet eden dilin değeri**. | 42370917 · [10.1037/tra0002215](https://doi.org/10.1037/tra0002215) |
| Shatrova 2024 | 6 haftalık TSY, n=62 kadın. %23'ü bıraktı; çoğu ilk seanstan sonra. | 38289065 · [10.1080/20008066.2024.2306747](https://doi.org/10.1080/20008066.2024.2306747) |
| Creaser 2022 | Travma yaşamış kişilerde öz-şefkati kendine yöneltmek üç grupta da olumsuz benlik algısını harekete geçirdi ve tehdit tepkisi oluşturdu. Tepki en çok, eşik altı TSSB'si ve yüksek aşırı uyarılması olan grupta görüldü. | 35391975 · [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602) |
| Joss & Teicher 2021 | Çocuklukta kötü muamele görmüş yetişkinlerde mindfulness müdahaleleri (17 çalışma) yarar sağlayabilir, ancak "bazı uyarlamalar gerekebilir". Uyarlamaların ayrıntısı özette yok. | 33987076 · [10.1007/s40501-021-00240-4](https://doi.org/10.1007/s40501-021-00240-4) |

**Tasarım okuması**
- Davet dili, seçim, gözleri açık tutma seçeneği, istenen bölgeyi atlama izni ve imgelem seçeneği kuralları §11.B'de.
- İlk seansta bırakma oranı yüksek (Shatrova 2024). **İlk ders en yumuşak ve en kısa derstir.** İlk açılışta önerilen süre 5–10 dk; kişi uzunluğu kendisi seçer. *Tasarım çıkarımı.*
- Öz-şefkat ve özgüven derslerinde "kendine sevgiyle bak" yönergesi bazı kişilerde tehdit tepkisi doğurabiliyor (Creaser 2022). Bu derslerde önce **tarafsız bir dayanak** kurulur (ayaklar, eller, ses), ardından "istersen" diye davet edilir, ve **"Bu an zor gelirse nefese ya da ayaklarına dönebilirsin"** cümlesi söylenir. Bu, `dossier-benlik.md` §15 ile tutarlıdır.

---

## 6. Nefes teknikleri

### 6.1 Hiperventilasyon ve nöbet

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Rana 2023 (derleme) | HV, EEG'de kullanılan ilk tetikleme yöntemi. Epileptik boşalmaları nöbetten daha sık tetikler, ama **jeneralize epilepside hastaların %50'sine kadarında klinik nöbet tetikleyebilir.** Absans nöbetleri olan çocuklarda yetişkinlerden daha olası, fokal epilepside çok daha seyrek. | 37813123 · [10.1055/s-0043-1774808](https://doi.org/10.1055/s-0043-1774808) |
| Rozenblat 2020 | Doğru yapılan 3 dakikalık HV, çocukluk çağı absans epilepsisinde **neredeyse her çocukta** absans nöbeti tetikliyor. RKÇ (n=20): oturarak yapılan HV'de 17/20, sırtüstü yapılanda 13/20 çocukta nöbet görüldü (p=0,031). | 32446208 · [10.1016/j.seizure.2020.03.013](https://doi.org/10.1016/j.seizure.2020.03.013) |
| Vasudevan 2021 | 579 çocuk. HV bazı çocuklarda nöbet tetikledi: ilk 3 dakikada 2, son 2 dakikada 1 çocuk. | 34779251 · [10.1177/15500594211058266](https://doi.org/10.1177/15500594211058266) |
| Nadarajah 2024 | 3.273 hasta. HV çocuklarda absans nöbeti yakalama oranını artırdı (OR 2,44), yetişkinlerde artırmadı. Güvenli değilse yetişkinlerde HV yapılmayabilir. | 38916885 · [10.1097/WNP.0000000000001066](https://doi.org/10.1097/WNP.0000000000001066) |
| Erdoğan 2025 | Yetişkin epilepside HV tanı duyarlılığını artırmadı. 55 yaş ve üstü ile HV'ye engel durumu olanlar çalışmaya alınmadı. HV en çok absans öyküsü olanlarda ya da nöbeti HV ile tetiklenenlerde işe yarıyor. | 39970608 · [10.1016/j.neucli.2025.103060](https://doi.org/10.1016/j.neucli.2025.103060) |
| Denhard 2026 | 659 hasta, 806 EEG. Hiçbir yetişkinde HV ile tetiklenen epileptik bulgu görülmedi. | 41705827 · [10.1097/WNP.0000000000001244](https://doi.org/10.1097/WNP.0000000000001244) |

**Okuma.** Yetişkinlerde HV'nin nöbet tetikleme gücü çocuklardan düşük. Ancak Nefona'yı kimin dinleyeceği (çocuk ya da ergen olabilir) ve epilepsi tanısının bilinip bilinmediği kontrol edilemez. Kapalabhati ve bhastrika, adı üstünde, isteyerek yapılan hızlı ve güçlü soluma pratikleridir. Nöbetle ilişkiyi doğrudan test eden bir çalışma bu taramada bulunamadı; bağlantı HV kanıtından çıkarıldı. **Karar: bu teknikler herkes için dışarıda.**

### 6.2 Hiperventilasyon + nefes tutma → bilinç kaybı

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Pernett 2023 | n=18, serbest dalış deneyimi az olan kişiler. 15 sn HV sonrasında nefes tutma süresi uzadı (133 sn'ye karşı 111 sn), istemsiz solunum hareketlerinin başlangıcı gecikti (112 sn'ye karşı 89 sn), oksijen doygunluğunun en düşük değeri daha aşağı indi (%90,6'ya karşı %93,6). Art arda yapılan tutmalarda **doygunluk giderek daha çok düştü** (%94,0'dan %86,7'ye); yazarlara göre bu bayılma riskini artırabilir. | 37060440 · [10.1007/s00421-023-05202-7](https://doi.org/10.1007/s00421-023-05202-7) |
| Edmonds & Walker 1999 | Avustralya'da 60 şnorkel ölümünün 12'si, HV sonrası nefes tutmaya bağlı oksijensizlikten gelişen bilinç kaybı ve boğulmayla oldu. "Nefes tutma süresini uzatmak için HV yapmak tehlikelidir." | 10721339 · [10.5694/j.1326-5377.1999.tb123809.x](https://doi.org/10.5694/j.1326-5377.1999.tb123809.x) |
| Lippmann & Pearn 2012 | 140 şnorkel ölümünün 19'u uzun nefes tutmalı dalış sonrası boğulma. Önlemlerden biri, nefes tutmadan önce HV yapmamak. | 22900874 · [10.5694/mja11.10988](https://doi.org/10.5694/mja11.10988) |

**Karar.** Döngüsel HV'nin ardından nefes tutma (Wim Hof ya da "tummo" benzeri akışlar) hiçbir derste yer almaz. Hiçbir nefes pratiği suda, küvette, araçta ya da ayakta yapılmaz. Bu, uygulamadaki mevcut kuralla aynı (`breath.js:354`).

### 6.3 Zorlu nefes, gözetimsiz pratik ve yoga yan etkileri

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Cramer 2013 | Vaka raporlarının SD'si: 76 vaka. En sık anılan uygulamalar pranayama, hatha ve Bikram; en sık anılan duruş ve teknikler baş duruşu, omuz duruşu, lotus ve **zorlu nefes**. Etkilenen sistemler: kas-iskelet %35,5, sinir sistemi %18,4, göz %11,8. 1 ölüm bildirilmiş. Yazarların önerisi: yeni başlayanlar baş duruşu, lotus ve **zorlu nefes** gibi aşırı pratiklerden uzak durmalı; glokomu olanlar ters duruş yapmamalı. | 24146758 · [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515) |
| Cramer 2019 | Almanya, n=1.702. %21,4 akut, %10,2 kronik yan etki bildirdi. **Yalnızca kendi başına, gözetimsiz çalışmak** hem akut hem kronik yan etki riskinde artışla ilişkiliydi. | 31357980 · [10.1186/s12906-019-2612-7](https://doi.org/10.1186/s12906-019-2612-7) |
| Cramer 2017 | 9 gözlemsel çalışma, 9.129 yoga uygulayıcısı. Ders sırasında istenmeyen olay %22,7; ciddi olay %1,9; çoğu hafif ve geçici. Ciddi akut ya da kronik hastalığı olanlar önce tıbbi görüş almalı. | 28958637 · [10.1016/j.jsams.2017.08.026](https://doi.org/10.1016/j.jsams.2017.08.026) |
| Cramer 2015 | 94 RKÇ, n=8.430. Yoga, olağan bakım ve egzersizle benzer güvenlikte; psikolojik ya da eğitim müdahalelerine göre ciddi olmayan olay daha fazla (OR 7,30). | 26116216 · [10.1093/aje/kwv071](https://doi.org/10.1093/aje/kwv071) |
| Wieland 2022 (Cochrane) | Bel ağrısında yoga, egzersiz yapmamaya göre 6–12 ayda daha fazla istenmeyen olayla ilişkili (RR 4,76; çoğunlukla bel ağrısında artış; düşük kesinlik). Diğer egzersizlerle fark yok. | 36398843 · [10.1002/14651858.CD010671.pub3](https://doi.org/10.1002/14651858.CD010671.pub3) |

**Okuma.** Nefona'nın yoga bölümü yalnızca sesle, gözetimsiz dinlenir. Bu nedenle ters duruş, zorlayıcı duruş ve zorlu nefes yönergesi hiç verilmez. Beden hareketi varsa hafif, oturarak ya da uzanarak yapılır ve "ağrı varsa atla" izniyle sunulur.

### 6.4 Gebelik

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Babbar & Shyken 2016 (derleme) | Gebelikte ilk kez yoga yapmanın güvenliği ve fetüsün bunu tolere ettiği gösterilmiş (özetteki ifade). **Nefes tekniklerine özgü güvenlik bilgisi özette yok.** | 27152528 · [10.1097/GRF.0000000000000210](https://doi.org/10.1097/GRF.0000000000000210) |
| Tragea 2014 | RKÇ, n=60, ilk gebeliğinin ikinci üç ayındaki kadınlar. 6 hafta, günde iki kez gevşeme nefesi ve PMR uygulandı. Algılanan stres azaldı (−3,23), kontrol duygusu arttı (+1,99). | 24731890 · [10.1016/j.ctim.2014.01.006](https://doi.org/10.1016/j.ctim.2014.01.006) |
| Yakıt Yeşilyurt 2024 | RKÇ, n=76, yüksek riskli gebelik. Diyafram nefesi (motor imgelemeyle birlikte ya da tek başına) fetüse olumsuz etki göstermedi ve rahim kasılması tetiklemedi. | 39031032 · [10.1002/ijgo.15799](https://doi.org/10.1002/ijgo.15799) |

**Arama sonucu.** İki ayrı PubMed aramasında gebelikte kapalabhati, hızlı nefes ya da nefes tutmanın güvenliğini doğrudan test eden bir çalışma bulunamadı. **Karar (ihtiyat ilkesi):** gebelikte yalnızca yavaş ve doğal nefes ile uzun veriş kullanılır; nefes tutma önerilmez. Bu, uygulamadaki mevcut kuralla tutarlı (`breath.js:353`). Gebelikte uzun süre sırtüstü yatma konusunda bu oturumda bir kaynak doğrulanmadı. Derslerde "yan yatabilirsin" seçeneği yalnızca konfor önerisi olarak sunulur; **tıbbi dayanağı doğrulanmadı.**

### 6.5 Uygulamanın mevcut nefes kuralları (yoga bunlarla çelişmemeli)

- `app/src/lib/breath.js:2-6`: "dakikada ~6 nefes en sağlam kalıp … Kutu: kanıt zayıf, isteğe bağlı. **4-7-8 ve hızlı soluma yok** … Sağlık iddiası yok … HRV ölçülmez, gösterilmez."
- `breath.js:14`: `HOLD_MAX = 7`, nefes tutma üst sınırı saniye cinsinden (kodda "VARSAYIM" olarak işaretli).
- `breath.js:113-122`: kutu nefesi 4·4·4·4, "Tutmalar isteğe bağlı", kanıt düzeyi `limited`.
- `breath.js:351-354`, `SAFETY_ROWS`:
  - "Başın döner ya da karıncalanırsa dur."
  - "Gebelik, kalp ya da akciğer rahatsızlığı, glokom, nöbet ya da panik atakta nefes tutmalı kalıplardan önce hekimine danış."
  - "Araç kullanırken, suda ya da ayaktayken yapma."
- `app/src/screens/Breath.jsx:80`, `:244-251`: güvenlik ekranı yalnızca bir kez gösterilir; `markSafetySeen` ile "Anladım" düğmesi.
- `app/src/lib/profileQuestions.js:30-41`: epilepsi ve ışığa duyarlı nöbet sorusu. `app/src/lib/profile.js:198` bunu `flashSafe` bayrağına çeviriyor.

---

## 7. Derin gevşemeden kalkarken baş dönmesi

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Ahuja 2025 | Tek kollu, n=32 hipertansif kişi. Tek bir 16 dakikalık YN seansından sonra sistolik KB 7 mmHg, diyastolik KB 6 mmHg düştü. **Kontrol grubu yok.** | 39974253 · [10.7759/cureus.77717](https://doi.org/10.7759/cureus.77717) |
| Ghai & Ghai 2025 | YN meta-analizi, 28 çalışma. Aktif kontrole göre sistolik KB g=−1,65, diyastolik KB −1,01, kalp hızı −0,73. Çoğu çalışmada yöntem sınırlılıkları var. | 40840566 · [10.1016/j.ctim.2025.103231](https://doi.org/10.1016/j.ctim.2025.103231) |
| Wieling 2022 | Ortostatik hipotansiyon, yani ayağa kalkınca KB'nin aşırı düşmesi, belirti vermese bile olumsuz sonuç riskini artırıyor. Tablo bilişsel yavaşlama ya da açıklanamayan düşmelerden bayılmaya kadar uzanıyor. Yönetimde yaşam tarzı önlemleri var; örneğin **karşı-basınç manevraları**. | 35841911 · [10.1016/S1474-4422(22)00169-7](https://doi.org/10.1016/S1474-4422(22)00169-7) |
| Lei 2020 | Ortostatik hipotansiyon orta yaşlılarda %5–10, 60 yaş üstünde %20'nin üzerinde görülüyor. Ölüm, düşme ve bayılma riskiyle ilişkili. | 32805514 · [10.1016/j.autneu.2020.102713](https://doi.org/10.1016/j.autneu.2020.102713) |
| Tran 2021 | Ayağa kalkınca ilk anda görülen KB düşüşü, sürekli ölçümle 65 yaş üstünde havuzlanmış olarak %29,0 (%95 GA 22,1–36,9). Düşme, kırılganlık ve bayılmayla ilişkili. | 34260686 · [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090) |
| Stewart 2017 | İnsanların yaklaşık %40'ı hayatında en az bir kez bayılıyor; bunların yarısı ergenlikte. İlk bayılmanın en sık görüldüğü yaş 15. Ayağa kalkınca görülen ilk KB düşüşü gençlerde sık ve zararsız. | 29222399 · [10.1542/peds.2017-1673](https://doi.org/10.1542/peds.2017-1673) |

**Karar.** Uzanarak yapılan her gündüz dersinin kapanışı sırayla şöyle ilerler: el ve ayak parmaklarını oynat, gerin, yana dön, otur, birkaç nefes bekle, sonra kalk. Bu adımlar kapanış süresinin içindedir. "Başın dönerse otur" cümlesi karttadır. *Uzun gevşemeden sonra kalkınca baş dönmesinin sıklığı doğrudan ölçülmedi; bağlantı KB düşüşü ve ortostatik hipotansiyon kanıtından çıkarıldı.*

---

## 8. Uykululuk: araç, makine ve uyku ataleti

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Bioulac 2017 | SD/MA, 17 çalışma. Direksiyonda uykulu olmak trafik kazası riskiyle ilişkili: havuzlanmış OR 2,51 (1,87–3,39); I²=%83. (Düzeltme notu: 29718456.) | 28958002 · [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134) |
| Lovato & Lack 2010 | 5–15 dakikalık kısa şekerlemenin yararı hemen başlıyor. 30 dakikadan uzun şekerlemelerden uyanınca kısa bir süre **uyku ataleti** kaynaklı bozulma görülüyor. | 21075238 · [10.1016/B978-0-444-53702-7.00009-9](https://doi.org/10.1016/B978-0-444-53702-7.00009-9) |
| Hilditch 2017 | 30 dakika ya da daha kısa şekerlemelerin uyku ataletinden gerçekten kaçındığına dair kanıt karışık. Sonuç günün saatine ve önceki uyku düzenine bağlı. | 28366332 · [10.1016/j.sleep.2016.12.016](https://doi.org/10.1016/j.sleep.2016.12.016) |
| Dutheil 2021 | SD/MA, 11 çalışma, n=381. Şekerleme bilişsel performansı artırdı; ancak uyku ataleti döneminde sonuçlar çelişkili. | 34639511 · [10.3390/ijerph181910212](https://doi.org/10.3390/ijerph181910212) |
| Cordi 2014 | "Daha derin uyu" telkini şekerlemede derin uykuyu artırdı (bkz. §3). | 24882909 · [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778) |

**Karar.** Gevşeme ve uyku dersleri gerçekten uyku getirebilir. Kartta ve derslerin açılış ekranında "araç ya da makine kullanırken dinleme" yazar. Uyku derslerinden sonra "hemen direksiyona geçme" denir. İleride bir "araç modu" algılanırsa dersi başlatmamak düşünülebilir; iOS'ta bunun mümkün olup olmadığı **doğrulanmadı.**

---

## 9. Kulaklık, ses düzeyi ve yatarken dinleme

| Çalışma | Bulgular | PMID · DOI |
|---|---|---|
| Dillard 2022 | SD/MA, 12–34 yaş, 33 çalışma, 19.046 kişi. Kişisel dinleme cihazlarında güvensiz dinleme yaygınlığı %23,81 (18,99–29,42). 0,67–1,35 milyar gencin işitme kaybı riski altında olabileceği hesaplandı. | 36379592 · [10.1136/bmjgh-2022-010501](https://doi.org/10.1136/bmjgh-2022-010501) |
| Chen 2023 | DSÖ 2019'da ITU-T H.870 tavsiyesini yayımladı: ses dozu ve kullanım süresi önerileri. **Sayısal eşikler özette yok. "80 dB(A), haftada 40 saat" gibi değerler bu oturumda doğrulanmadı.** | 36767527 · [10.3390/ijerph20032161](https://doi.org/10.3390/ijerph20032161) |
| Stone 2019 | Çocuk kulaklıklarındaki "ses sınırlayıcı" etiketleri belirsizdi. Bazı modeller, dizüstü bilgisayar ya da CD çalara bağlandığında 85 dB(A) "güvenli dinleme" düzeyinin çok üstüne çıkabildi. | 31868131 · [10.1177/2331216519889232](https://doi.org/10.1177/2331216519889232) |
| Wang 2021 | Küme RKÇ, 830 üniversite öğrencisi. Sağlık eğitimi, yüksek sesle kulaklık kullanımını ve **kulaklıkla uyumayı** azalttı. Çalışmada kulaklıkla uyumak işitme açısından riskli davranış olarak ele alındı. | 33562129 · [10.3390/ijerph18041560](https://doi.org/10.3390/ijerph18041560) |
| Kim 2015 | Kore, n=19.290. Kulaklıktan gelen gürültüye maruz kalmak kulak çınlamasıyla ilişkili bulundu. | 26020239 · [10.1371/journal.pone.0127578](https://doi.org/10.1371/journal.pone.0127578) |

**Koddaki mevcut ses davranışı** (yoga modülü bunlardan yararlanabilir):
- `app/src/lib/dalgaAudio.js:289`: oturumlar varsayılan olarak `volume = 0.6` ile başlıyor. `:296`: ses 3 saniyede yükseliyor, ani başlamıyor.
- `app/src/lib/dalgaSleep.js:12`: `SLEEP_FADE_MAX = 180`, yani uyku modunda son 3 dakikada ses kısılıyor. `:15` `fadeSeconds`, `:18` kosinüs eğrili kısılma.
- `app/src/lib/voicePack.js:104-105`: ses kayıtları `TARGET_PEAK = 0.8` değerine normalize ediliyor; kazanç en fazla 4 kat.

**Karar.** Uygulama kulaktaki ses basıncını (dB SPL) ölçemez. Bu yüzden hiçbir ekranda "güvenli dB" iddiası yer almaz. Yalnızca davranış önerilir: "Sesi, konuşmayı zorlanmadan duyacağın en düşük düzeye getir." Uyku dersleri kısılarak kendiliğinden biter ve yatarken kulak içi kulaklık yerine hoparlör önerilir.

---

## 10. Dijital bağlam

- Gözetimsiz, kendi kendine pratik yan etki riskinin artmasıyla ilişkili bulundu (Cramer 2019, PMID 31357980). Ses yönergesi bu yüzden görsel denetim gerektiren hiçbir şey istemez.
- Kullanımın düşük ve beklentilerin yüksek olması (Adams 2026, PMID 42258809), dürüst ve abartısız bir onboarding metninin gerekli olduğunu gösteriyor.
- Mevcut uygulama dili: `app/src/screens/Yon.jsx:362` "**Tedavi değildir.** Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda **112**." Yoga kartı da aynı dili kullanır.

---

## 11. Türetilen kararlar

### 11.A Onboarding güvenlik notu (son metin; sade Türkçe)

Biçim, nefes modülündeki `SAFETY_ROWS` ile aynıdır (`breath.js:351-354`): kalın başlıklı kısa satırlar. Kart **yoga bölümüne ilk girişte bir kez** gösterilir ("Anladım"). Sonra dersin bilgi (i) düğmesinden yeniden açılabilir. Onay kutusu ya da kilit yoktur; bu, mevcut güvenlik ekranının kararıyla tutarlı (`app/src/screens/Safety.jsx:7-9`: "soru değil, bilgi … işaret kutusu ve kilit yok"; akış: `app/src/screens/Onboarding.jsx:9-16`).

> **Başlamadan önce**
>
> **İstediğin an durabilirsin.** Gözlerini açabilir, kıpırdayabilir, nefesini kendi haline bırakabilirsin. Buradaki her şey bir davet. Bazen gevşerken huzursuz ya da tuhaf hissedebilirsin; bu olabilir. Durmak da pratiğin bir parçası.
>
> **Araç kullanırken dinleme.** Bu dersler uyku getirebilir. Araç ya da makine kullanırken, suda ya da dikkat isteyen bir işteyken açma.
>
> **Bir sağlık durumun varsa önce danış.** Gebelik, epilepsi, kalp ya da akciğer rahatsızlığı, psikoz ya da bipolar bozukluk öyküsü ya da seni hâlâ zorlayan bir travma varsa başlamadan önce hekimine ya da terapistine sor.
>
> **Yavaşça kalk.** Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk. Başın dönerse otur ve bekle.
>
> **Sesi kısık tut.** Konuşmayı zorlanmadan duyacağın kadar yeter. Uyku dersleri kendiliğinden kısılıp biter. Uyurken kulak içi kulaklık yerine hoparlör daha iyi.
>
> Nefona tedavi değildir. Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda **112**.

Kanıt eşlemesi:
- Satır 1: Farias 2020, Goldberg 2021, Braith 1988, Luu 2024.
- Satır 2: Bioulac 2017, Lovato & Lack 2010, `breath.js:354`.
- Satır 3: §4, §5, §6.1, §6.4, `breath.js:353`.
- Satır 4: §7.
- Satır 5: §9.
- Son satır: `Yon.jsx:362`.

**Her dersin açılışındaki tek cümle** (ses ve ekran aynı): "İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin."

**İlk dersin ek cümlesi:** "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt."

### 11.B Senaryo dil kuralları (ElevenLabs metinleri için bağlayıcı)

Her kuralda **Yap** ve **Yapma** örnekleri var. Kurallar kanıttan çıkarıldı; kaynaklar köşeli parantez içinde.

1. **Davet, komut değil.** [33819832, 42370917, 38064219]
   - Yap: "İstersen gözlerini kapatabilirsin." "Dikkatini ellerine getirebilirsin."
   - Yapma: "Gözlerini kapat." "Şimdi ellerine odaklan."
   - Emir kipi yalnızca güvenlik cümlelerinde kullanılır: "Başın dönerse otur."
2. **Gözleri açık seçeneği her zaman var.** Açılışta sunulur; uzun iç gözlem bölümlerinden önce hatırlatılır. [39690521]
   - Yap: "Gözlerini kapatabilir ya da bakışını önünde bir noktaya yumuşakça bırakabilirsin."
3. **"İstediğin an durabilirsin" açılışta söylenir, 30 dakikalık sürümlerde ortada bir kez daha tekrarlanır.** [39690521, 32820538]
4. **Kontrol kişide kalır.** "Kontrolü bırak", "kendini kaybet", "iraden eriyor", "kıpırdayamıyorsun" gibi ifadeler ve sınama telkinleri kullanılmaz. [3069875, 34149986]
   - Yap: "Ne kadar gevşeyeceğine sen karar verirsin." "Kıpırdamak istersen kıpırdayabilirsin."
   - Yapma: "Kolların öyle ağır ki kaldıramıyorsun."
5. **Gevşeme zorunlu değildir; huzursuzluk normaldir.** [3069875, 27855541]
   - Yap: "Bugün gevşemek kolay gelmeyebilir; bu da olur. Sadece burada olman yeterli."
   - Yapma: "Şimdi tamamen gevşemiş durumdasın."
6. **Nefes, değiştirilmeden önce fark edilir.** Önce doğal nefes gözlenir. Sonra, istenirse, verilen nefes uzatılır. "Derin bir nefes al" tekrarı yoktur. [34306146]
   - Yap: "Nefesini olduğu gibi fark et. İstersen verişini biraz uzatabilirsin."
   - Yapma: "Derin bir nefes al… daha derin… tut."
7. **Nefes tutma asla zorunlu değildir, asla 7 saniyeyi geçmez ve asla hızlı nefesin ardından gelmez.** Tutma geçen her yerde "istersen tutmadan devam et" alternatifi de söylenir. [37060440, `breath.js:14`, `breath.js:352`]
8. **Tarafsız bir dayanak ve çıkış kapısı.** Her zor bölümden önce güvenli bir dayanak kurulur: ayak tabanları, ellerin temas ettiği yüzey ya da odadaki sesler. Zor bölüm sırasında bu dayanağa dönüş kapısı söylenir. [35174010, 39690521, 35391975]
   - Yap: "Bu an zor gelirse, ayaklarının yere değdiği yere dönebilirsin. Gözlerini açıp odada üç şeye bakabilirsin."
9. **Beden taraması esnektir.** Ağrılı ya da rahatsız eden bölgeyi atlama izni verilir; göğüs, karın ve kalça gibi hassas bölgelerde uzun durulmaz. [39690521]
   - Yap: "Bu bölge rahatsız ederse bir sonrakine geçebilirsin."
   - *Hangi bölgelerin hassas olduğu kişiden kişiye değişir. Bu liste bir tasarım çıkarımıdır; doğrulanmadı.*
10. **İmgeleme seçimlidir.** Su, derinlik, kapalı alan, yükseklik ya da karanlık gibi imgeler herkese güvenli gelmeyebilir. Her imgede bir alternatif sunulur. [39690521; `dossier-sakin.md` §11.7]
    - Yap: "Bir kıyı ya da bir orman… hangisi sana daha iyi geliyorsa."
11. **Anı arama, geriye gitme, travmayı çağırma yok.** "En acı anını hatırla", "çocukluğuna dön", "o günü yeniden yaşa" kullanılmaz. Zor bir duygu ele alınacaksa geçmiş olay değil, **şu anki bedensel his** üzerinde çalışılır. [17716079, 21227110, 34074221; `dossier-benlik.md` §15]
12. **Öz-şefkat yönergeleri kademelidir.** Önce tarafsız dayanak, sonra "istersen" diyen bir davet, sonra kısa süre, sonra dayanağa dönüş. [35391975]
13. **Sağlık iddiası yok, vaat yok.** "Kaygını yok edecek", "uykusuzluğunu tedavi eder" ya da "herkesi transa sokar" gibi cümleler kullanılmaz. "Birçok kişi … hissettiğini söylüyor" gibi yumuşak bir dil tercih edilir. [`breath.js:6`]
14. **Gündüz dersleri uyandırmayla biter.** Adımlar: nefesi normale bırak, parmakları oynat, gerin, gözleri aç, odada birkaç şey gör, yana dön, otur. "Şimdi buradasın, uyanık ve dinlenmiş" gibi bir cümleyle kapanır. [28300508, 39690521, 35841911]
15. **Uyku dersleri uyku izniyle biter.** "Uykuya dalarsan bu da güzel; ses kendiliğinden kısılacak." Uyandırma cümlesi yoktur. [39690521]
16. **Sessizlikler rehberlidir.** Her sessizlikten önce ne kadar süreceği ya da sonunda ses geleceği söylenir. Örnek: "Birkaç nefes sessizlik… sonra sesim geri gelecek." Rehbersiz ve uzun pratik vaka raporlarında öne çıkıyor. [36316997, 17848828] *Güvenli sessizlik uzunluğu doğrulanmadı. Pratik bir üst sınır olarak yaklaşık 60–90 sn önerilir; bu bir tasarım çıkarımıdır.*
17. **Beden hareketi hafiftir.** Ters duruş, uzun süre öne eğilme ya da zorlu duruş yoktur. Her harekette "ağrı ya da baş dönmesi olursa bırak" denir. [24146758, 31357980]
18. **Kişiye özel tıbbi uyarılar derste değil, kartta yer alır.** Derste gebelik ya da epilepsi gibi durumlar adıyla tekrar edilmez; bunun yerine teknik düzeyde "istersen tutmadan devam et" gibi genel bir alternatif söylenir. Böylece akış bozulmaz ve kimse hedef alınmış hissetmez. *Tasarım çıkarımı.*

### 11.C Nefes teknikleri: dahil, isteğe bağlı, hariç

| Durum | Teknik | Neden | Uygulamada karşılığı |
|---|---|---|---|
| **Varsayılan** | Doğal nefesi fark etmek (değiştirmeden) | En düşük uyarılma. "Derin nefes" komutu ilk anda uyarılmayı artırabiliyor. [34306146] | — |
| **Varsayılan** | Yavaş, rahat nefes; uzun veriş (ör. 4 al / 6 ver), tutma yok | Uygulamada en sağlam kanıtlı kalıp. [`breath.js:2-3`] Gebelikte gevşeme nefesi ve diyafram nefesi RKÇ'lerde denendi; yüksek riskli gebelikte fetüse olumsuz etki görülmedi. [24731890, 39031032] | `breath.js:40-51` `calm` |
| **Varsayılan (kısa)** | İç çekiş: iki kısa alış ve uzun veriş, birkaç tur | Uygulamada `moderate` düzeyinde. Tutma yok. | `breath.js:63-74` `sigh` |
| **Varsayılan (kısa)** | Vızıltılı veriş (bhramari, "mmm") | Tutma yok. Başkasını rahatsız edebileceği için "sesin rahatsız etmeyeceği bir yerde" uyarısıyla sunulur. | `breath.js:100-112` `hum` |
| **İsteğe bağlı** | Burun deliği değiştirme (nadi shodhana), **tutmasız** | Tutma yok. Burun tıkanıklığında rahatsız edebilir; "burnun tıkalıysa atla" denir. | `breath.js:87-99` `nose` |
| **İsteğe bağlı** | Kısa nefes tutma ya da kutu nefesi (2–4 sn; üst sınır 7 sn) | Kanıtı zayıf. Uygulamada "Tutmalar isteğe bağlı" olarak işaretli. Gebelik, kalp ve akciğer rahatsızlığı, glokom, nöbet ya da panik öyküsünde önerilmez. Uyku derslerinde ve derslerin son dakikasında yer almaz. [`breath.js:113-122`, `:353`] | `box`, `HOLD_MAX` |
| **Hariç** | Kapalabhati, bhastrika, "ateş nefesi" ve her türlü hızlı ya da zorlu nefes | HV nöbet tetikleyebilir. [37813123, 32446208] Vaka raporlarında en sık anılan tekniklerden biri zorlu nefes; yeni başlayanlara önerilmiyor. [24146758] Gözetimsiz pratik riski artırıyor. [31357980] Gebelikte güvenliği test edilmemiş. Uygulamada zaten yok. [`breath.js:4`] | — |
| **Hariç** | Döngüsel HV ve ardından nefes tutma (Wim Hof, "tummo" benzeri), bağlantılı ya da holotropik nefes | HV'den sonra nefes tutma, oksijen düşüşünü derinleştiriyor ve nefes alma dürtüsünü geciktiriyor. Şnorkel ölümlerinde görülen bir yol. [37060440, 10721339, 22900874] | — |
| **Hariç** | 7 saniyeden uzun tutma (kumbhaka), nefesi tutup ıkınma ya da bandhalar | Uygulamanın üst sınırı 7 sn. [`breath.js:14`] Ikınmanın (Valsalva) riskleri bu oturumda **doğrulanmadı**; ihtiyat ilkesiyle dışarıda. | — |
| **Hariç** | 4-7-8 | Uygulamada bilinçli olarak yok. [`breath.js:4`] | — |
| **Hariç (her teknik için)** | Suda, küvette, araçta ya da ayaktayken nefes pratiği | [`breath.js:354`; 10721339] | — |

### 11.D Zamanlayıcı ve ses güvenliği (mühendislik kuralları)

Sahibin istediği davranış şu: kişi 30 dakikalık bir dersten 5 dakikasını seçtiğinde bile ders bütün ve güvenli kalmalı.

1. **Her sürüm üç parçalıdır: yerleşme, çekirdek ve kapanış.** Zamanlayıcı çekirdek bölümü kısaltır. Yerleşme ve kapanış hiçbir zaman kesilmez; seçilen sürenin içine dahildir. [39690521: uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş; 28300508]
   - 5 dakikalık sürüm için önerilen bölüşüm: yaklaşık 45 sn yerleşme, 3 dk çekirdek, 75 sn kapanış. *Oranlar tasarım çıkarımıdır; doğrulanmadı.*
2. **Zor bloklar kesilmez, gerekirse tümüyle çıkarılır.** Kısaltılmış bir sürüm hiçbir zaman bir zor bloğun ortasında ya da hemen ardından kapanışa geçmez. Zor blok sığmıyorsa tamamen düşürülür. [35391975; `dossier-benlik.md` §15 "çıkış noktası"]
3. **Son 60 saniyede nefes tutma, yeni imge ya da yoğun içerik olmaz.** *Tasarım çıkarımı.*
4. **"Durdur" düğmesi her zaman hemen çalışır.** Ses 1–2 saniyede kısılarak durur. Ardından tek bir ekran gösterilir: "Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur." Ekranda isteğe bağlı 20 saniyelik bir "dönüş" düğmesi de bulunur. Kişiyi durmaktan alıkoyan bir onay sorusu çıkmaz. [39690521: özerklik; 28300508: uyandırma; 35841911]
5. **Uyku dersleri** uyandırmayla bitmez; bunun yerine ses kısılır. `dalgaSleep.js:12-18` kısılma eğrisi yeniden kullanılır. Ders sonunda ses **tamamen durur**; döngü ya da sabaha kadar çalma yoktur. [39690521, 33562129]
6. **Gündüz dersi ile uyku dersi karıştırılmaz.** Kişi bir gündüz dersini gece dinlerse kapanıştaki uyandırma yine çalar. Uyku izni yalnızca uyku derslerinde verilir. *Tasarım çıkarımı.*
7. **Ses düzeyi.** Başlangıç düzeyi ölçülüdür (`dalgaAudio.js:289` ile aynı mantık) ve ses 3 saniyede yükselir (`:296`). Uygulama sistem ses düzeyini asla kendisi artırmaz. Ses kayıtları çevrimdışı normalize edilir (`voicePack.js:104-105`), böylece derin gevşeme sırasında ani yüksek bir başlangıç duyulmaz. *Ani yüksek sesin bu bağlamdaki etkisi doğrulanmadı; ilke ihtiyattan geliyor.*
8. **Hiçbir ekran dB iddiasında bulunmaz.** Uygulama kulaktaki ses basıncını ölçemez. [36767527: DSÖ H.870 var, ama eşikleri bu oturumda doğrulanmadı]

### 11.E Kimler dikkatli olmalı: uygulama ne yapar?

| Durum | Kanıt | Uygulamanın davranışı |
|---|---|---|
| Epilepsi ya da nöbet öyküsü | HV absans nöbetlerini tetikliyor; jeneralize epilepside klinik nöbet oranı %50'ye kadar. [32446208, 37813123] | Hızlı nefes herkes için zaten yok. Profilde nöbet sorusuna "Evet" ya da "Emin değilim" cevabı verilmişse (`profileQuestions.js:30-41`), nefes tutma alternatifleri varsayılan olarak "tutmadan" sunulur. *Nefes tutmanın nöbetle ilişkisi doğrulanmadı; ihtiyat ilkesi.* |
| Gebelik | Kapalabhati ve nefes tutma için doğrudan kanıt bulunamadı. Yavaş ve diyafram nefesinin olumsuz etkisi görülmedi. [24731890, 39031032] | Kartta "önce danış" yazar. Tutmalar isteğe bağlıdır. "Yan yatabilirsin" seçeneği konfor önerisi olarak sunulur; tıbbi dayanağı doğrulanmadı. |
| Psikoz ya da bipolar bozukluk öyküsü | Vaka raporları; klinik literatürde uyarı. [17848828, 36316997, 19545481] | Kartta "önce danış" yazar. Dersler sürekli rehberlidir, uzun sessizlik yoktur, gözleri açık seçeneği sunulur. |
| TSSB ya da travma | Travmatik yeniden yaşama en sık etkilerden biri; YN'de geri dönüşler bildirilmiş; öz-şefkat tehdit tepkisi doğurabiliyor. [34074221, 39690521, 35391975] | Dil kuralları (§11.B), dayanak ve çıkış kapısı, anı arama yok. |
| Panik ya da yüksek kaygı | Gevşemeye bağlı kaygı; HV ile panik ilişkisi; hipnoz çalışmasında panik nedeniyle bırakma. [3069875, 3148637, 24901382] | "Huzursuzluk normal" cümlesi, derin nefes komutu yok, kısa ve gözleri açık seçenek. |
| Kalp ya da akciğer hastalığı, glokom | `breath.js:353`; glokomda ters duruş önerilmiyor. [24146758] | Nefes tutma önerilmez, ters duruş hiç yoktur. |
| İleri yaş ya da düşük tansiyon | Ortostatik hipotansiyon ve ayağa kalkınca ilk KB düşüşü sık; YN sonrası KB düşüşü görüldü. [34260686, 32805514, 39974253] | Kapanıştaki "yana dön, otur, bekle, kalk" adımları. |
| Araç ya da makine kullanan kişi | OR 2,51; uyku ataleti. [28958002, 21075238] | Kart satırı ve dersin açılış ekranında uyarı. |
| Uyurken kulaklık kullanan kişi | Kulaklıkla uyumak risk davranışı sayıldı; kulaklıktan gelen gürültü kulak çınlamasıyla ilişkili. [33562129, 26020239] | Ses kısılarak biter ve tamamen durur; hoparlör önerilir. |

### 11.F Gelişim istatistikleri ve yol haritası: güvenlikle ilgili eklemeler

- **İsteğe bağlı tek soru** (dersten sonra, atlanabilir): "Ders sırasında zorlandın mı?" Seçenekler: Hayır / Biraz / Çok. [35174010; 35048869: zarar izleme önerisi; 34074221]
  - "Çok" cevabında gösterilecek metin: "Bu olabiliyor ve durman doğruydu. Bir dahaki sefere daha kısa ya da gözleri açık bir sürüm deneyebilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112."
  - Veri telefonda kalır. Gelişim ekranında bir "puan" olarak gösterilmez; yalnızca bir sonraki önerinin kısa ve gözleri açık sürüm olmasını sağlar. *Tasarım çıkarımı.*
- Gelişim ekranı "dakika rekoru" değil gün sayısı gösterir. 5 dakikada kapanışına ulaşan bir ders "tamamlandı" sayılır (`dossier-sakin.md` §11.8 ile aynı). Kişiyi uzun ve yoğun oturumlara itmemek, "aşırı pratik" vakalarıyla da tutarlı. [36316997]
- Önce ve sonra verilen öz-bildirim puanları "etki kanıtı" olarak değil, "nasıl hissettin" gidişatı olarak gösterilir (`dossier-benlik.md` §16 ile aynı).
- **Yol haritasına girecek güvenlik maddeleri:**
  1. Yoga güvenlik kartı (§11.A) ve Bilgi ekranından erişim.
  2. Ders motorunda yerleşme ve kapanışın korunması, zor blokların düşürülmesi (§11.D-1/2).
  3. "Durdur" ekranı ve 20 saniyelik dönüş (§11.D-4).
  4. Uyku dersinin kısılarak ve tamamen durarak bitmesi (§11.D-5).
  5. Senaryo inceleme kontrol listesi: §11.B'deki 18 kural. Her metin, ElevenLabs'e gitmeden önce bu listeyle tek tek denetlenir. Seslendirmeden sonra metne geri çevirilip ikinci kez denetlenir (`SAHIP_ISTEKLERI.md` madde 5 ile birlikte).
  6. Nöbet profili "Evet" ya da "Emin değilim" ise tutmasız varsayılan (§11.E).

---

## 12. Doğrulanmadı ve açık sorular

- Heide & Borkovec 1983/1984 ve Lynn 1996: özet yok, sayılar doğrulanmadı.
- DSÖ ve ITU H.870'in sayısal eşikleri (80 dB(A), haftalık doz gibi): doğrulanmadı.
- Gebelikte sırtüstü yatma, hızlı nefes ya da nefes tutma güvenliği: doğrudan kanıt bulunamadı.
- Nefes tutmanın tek başına nöbetle ilişkisi: doğrulanmadı. Bulunan kanıt HV ile ilgili.
- Kapalabhati ve bhastrikanın nöbet ya da bayılmayla doğrudan ilişkisini test eden çalışma: bulunamadı. Karar HV kanıtından çıkarıldı.
- Psikoz öyküsü olanlar için güvenli sessizlik süresi ve uyarlanmış mindfulness'ın ayrıntıları (Chadwick'in uyarlamaları): özetlerde yok, doğrulanmadı.
- Ikınmanın (Valsalva) ve bandhaların riskleri: bu oturumda aranmadı ya da doğrulanmadı.
- iOS'ta "araç kullanıyor" durumunun algılanıp algılanamayacağı: doğrulanmadı.
- 5 dakikalık sürümde yerleşme, çekirdek ve kapanış oranları: tasarım çıkarımı, doğrulanmadı.
- Çocuk ve ergen kullanıcılar: HV kanıtı çocuklarda riskin daha yüksek olduğunu gösteriyor (Nadarajah 2024, Rozenblat 2020). Uygulamanın yoga bölümü için bir yaş sınırı olup olmayacağına sahip karar verir.

---

## 13. Kaynak listesi (hepsi bu oturumda PubMed kaydından doğrulandı)

| PMID | Yazar, yıl | Tür | DOI |
|---|---|---|---|
| 32820538 | Farias 2020 | SD | 10.1111/acps.13225 |
| 34074221 | Goldberg 2021 | Nüfus anketi | 10.1080/10503307.2021.1933646 |
| 35174010 | Britton 2021 | MBCT, n=96 | 10.1177/2167702621996340 |
| 31071152 | Schlosser 2019 | Kesitsel, n=1.232 | 10.1371/journal.pone.0216643 |
| 28542181 | Lindahl 2017 | Karma yöntem | 10.1371/journal.pone.0176239 |
| 42258809 | Adams 2026 | Boylamsal uygulama çalışması | 10.2196/79366 |
| 6341426 | Heide & Borkovec 1983 | Kontrollü çalışma (özet yok) | 10.1037//0022-006x.51.2.171 |
| 6365071 | Heide & Borkovec 1984 | (özet yok) | 10.1016/0005-7967(84)90027-5 |
| 3069875 | Braith 1988 | Tek seans, n=30 | 10.1016/0005-7916(88)90040-7 |
| 3905864 | Norton 1985 | n=38 | 10.1016/0005-7916(85)90065-5 |
| 3148637 | Ley 1988 | Kuram ve derleme | 10.1016/0005-7916(88)90054-7 |
| 31450137 | Kim & Newman 2019 | Klinik çalışma | 10.1016/j.jad.2019.08.045 |
| 27855541 | Newman 2016 | İkincil analiz | 10.1080/10503307.2016.1253891 |
| 34149986 | Luberto 2020 | Ölçek geliştirme | 10.1007/s41811-020-00086-3 |
| 10483629 | Khasky & Smith 1999 | RKÇ, n=114 | 10.2466/pms.1999.88.2.409 |
| 34306146 | Toussaint 2021 | Randomize, n=60 | 10.1155/2021/5924040 |
| 24901382 | Schaefert 2014 | SD/MA | 10.1097/PSY.0000000000000039 |
| 29485379 | Bollinger 2018 | Kayıt analizi | 10.1080/00029157.2017.1315927 |
| 27173407 | Häuser 2016 | MA'ların SD'si | 10.3238/arztebl.2016.0289 |
| 28300508 | Howard 2017 | Klinik yorum ve vakalar | 10.1080/00029157.2016.1203281 |
| 8582780 | Lynn 1996 | Derleme (özet yok) | 10.1080/00207149608416064 |
| 27896907 | Zech 2016 | MA | 10.1002/ejp.933 |
| 24882909 | Cordi 2014 | Çapraz, n=70 | 10.5665/sleep.3778 |
| 17716079 | Loftus & Davis 2006 | Derleme | 10.1146/annurev.clinpsy.2.022305.095315 |
| 21227110 | Johnson & Raye 1998 | Derleme | 10.1016/s1364-6613(98)01152-8 |
| 17848828 | Kuijpers 2007 | Vaka ve literatür | 10.1159/000108125 |
| 36316997 | Goud 2022 | Vaka | 10.1155/2022/2661824 |
| 28073599 | Sherrill 2017 | Mektup (özet yok) | 10.1016/j.psychres.2016.12.035 |
| 29475163 | Prakash 2018 | Vaka (özet yok) | 10.1016/j.ajp.2018.02.001 |
| 36778606 | Charan 2022 | Vaka serisi (özet yok) | 10.1177/02537176211059457 |
| 17974947 | Lu & Pierre 2007 | Vaka (özet yok) | 10.1176/appi.ajp.2007.07060960 |
| 19545481 | Chadwick 2009 | Fizibilite RKÇ, n=22 | 10.1017/S1352465809990166 |
| 35048869 | Ellett & Chadwick 2021 | Öneriler | 10.1192/bjp.2021.98 |
| 32349698 | Jacobsen 2020 | Fizibilite RKÇ, n=50 | 10.1186/s12888-020-02608-x |
| 35049131 | Ellett 2022 | Öncesi-sonrası | 10.1111/papt.12382 |
| 39690521 | Luu 2024 | Kavramsal | 10.17761/2024-D-24-00021 |
| 38064219 | Zaccari 2023 | RKÇ, n=131 | 10.1001/jamanetworkopen.2023.44862 |
| 33788599 | Kelly 2021 | RKÇ ara analizi | 10.1089/acm.2020.0417 |
| 33819832 | Oosterbroek & Dirk 2021 | Nitel | 10.1016/j.ctcp.2021.101365 |
| 42370917 | Dietrich 2026 | Nitel | 10.1037/tra0002215 |
| 38289065 | Shatrova 2024 | Fizibilite, n=62 | 10.1080/20008066.2024.2306747 |
| 35391975 | Creaser 2022 | EEG ve otonom ölçüm | 10.3389/fpsyg.2022.765602 |
| 33987076 | Joss & Teicher 2021 | Kapsam derlemesi | 10.1007/s40501-021-00240-4 |
| 37813123 | Rana 2023 | Derleme | 10.1055/s-0043-1774808 |
| 32446208 | Rozenblat 2020 | RKÇ, n=20 | 10.1016/j.seizure.2020.03.013 |
| 34779251 | Vasudevan 2021 | n=579 | 10.1177/15500594211058266 |
| 38916885 | Nadarajah 2024 | Geriye dönük, n=3.273 | 10.1097/WNP.0000000000001066 |
| 39970608 | Erdoğan 2025 | Geriye dönük | 10.1016/j.neucli.2025.103060 |
| 41705827 | Denhard 2026 | Geriye dönük, n=659 | 10.1097/WNP.0000000000001244 |
| 37060440 | Pernett 2023 | Deneysel, n=18 | 10.1007/s00421-023-05202-7 |
| 10721339 | Edmonds & Walker 1999 | Ölüm serisi, n=60 | 10.5694/j.1326-5377.1999.tb123809.x |
| 22900874 | Lippmann & Pearn 2012 | Ölüm serisi, n=140 | 10.5694/mja11.10988 |
| 24146758 | Cramer 2013 | Vaka SD'si | 10.1371/journal.pone.0075515 |
| 31357980 | Cramer 2019 | Anket, n=1.702 | 10.1186/s12906-019-2612-7 |
| 28958637 | Cramer 2017 | SD | 10.1016/j.jsams.2017.08.026 |
| 26116216 | Cramer 2015 | SD/MA | 10.1093/aje/kwv071 |
| 36398843 | Wieland 2022 | Cochrane | 10.1002/14651858.CD010671.pub3 |
| 27152528 | Babbar & Shyken 2016 | Derleme | 10.1097/GRF.0000000000000210 |
| 24731890 | Tragea 2014 | RKÇ, n=60 | 10.1016/j.ctim.2014.01.006 |
| 39031032 | Yakıt Yeşilyurt 2024 | RKÇ, n=76 | 10.1002/ijgo.15799 |
| 39974253 | Ahuja 2025 | Tek kollu, n=32 | 10.7759/cureus.77717 |
| 40840566 | Ghai & Ghai 2025 | SD/MA | 10.1016/j.ctim.2025.103231 |
| 35841911 | Wieling 2022 | Derleme | 10.1016/S1474-4422(22)00169-7 |
| 32805514 | Lei 2020 | Derleme | 10.1016/j.autneu.2020.102713 |
| 34260686 | Tran 2021 | SD/MA | 10.1093/ageing/afab090 |
| 29222399 | Stewart 2017 | Derleme | 10.1542/peds.2017-1673 |
| 28958002 | Bioulac 2017 | SD/MA | 10.1093/sleep/zsx134 |
| 21075238 | Lovato & Lack 2010 | Derleme | 10.1016/B978-0-444-53702-7.00009-9 |
| 28366332 | Hilditch 2017 | Derleme | 10.1016/j.sleep.2016.12.016 |
| 34639511 | Dutheil 2021 | SD/MA | 10.3390/ijerph181910212 |
| 36379592 | Dillard 2022 | SD/MA | 10.1136/bmjgh-2022-010501 |
| 36767527 | Chen 2023 | Yöntem ve sistem | 10.3390/ijerph20032161 |
| 31868131 | Stone 2019 | Ölçüm | 10.1177/2331216519889232 |
| 33562129 | Wang 2021 | Küme RKÇ, n=830 | 10.3390/ijerph18041560 |
| 26020239 | Kim 2015 | Kesitsel, n=19.290 | 10.1371/journal.pone.0127578 |
| 34516731 | Soares 2021 | SD/MA | 10.1515/sjpain-2021-0096 |
| 39093008 | Steen 2024 | SD | 10.1093/pm/pnae076 |
