# PubMed doğrulaması: bildirim bilim satırları (`nef-bildirim.md` §10.5)

Tarih: 2026-09-30. Yöntem: 23 PMID için NCBI E-utilities `efetch` (özet, `rettype=abstract`) ve `esummary` (künye, DOI
`articleids` içinden). **Yalnız PubMed özeti okundu; tam metin okunmadı.** Özette geçmeyen bilgi "özette yok" diye
yazıldı. Karakter sayıları Python `len` ile (Unicode karakter). Yasak sözcük taraması: `coachCore.js` `FORBIDDEN`
(iyileştir, tedavi, teşhis, garanti…) + §10.7 S12 (kanıtla, korur, önler, bilimsel); önerilen satırların hiçbiri takılmıyor.

Kısaltmalar: RKÇ = randomize kontrollü çalışma; MRT = mikro-randomize deneme; SD = sistematik derleme; MA = meta-analiz.
Yıl: "basım" = derginin sayı tarihi, "e-yayın" = PubMed `Epub` tarihi (yoksa "—").

## 1. Künye ve özet bulguları

| Anahtar | İlk yazar · basım / e-yayın | Dergi | DOI | Tür | Kişi sayısı (özette) | Süre | Ana bulgu (özetteki sayıyla) | Sınır |
|---|---|---|---|---|---|---|---|---|
| kim2020 (32409236) | Kim AD · 2021 Haz / 2020-05-12 | Cont Lens Anterior Eye 44(3):101329 | 10.1016/j.clae.2020.04.014 | Tek kollu öncesi–sonrası (kontrolsüz) | 54 başladı, 41 bitirdi | 4 hafta (28. gün) | 20 dk'da bir 10 sn kırpma; günde ort. 25,6 set. DEQ-5 11→7, OSDI 36→22, NIBUT 6,5→8,1 sn, eksik kırpma %54→%34; menisküs ve lipid katmanı değişmedi | Kontrol grubu yok; kuru göz belirtili kişiler; bırakma nedeni **özette yok** |
| wolffsohn2025 (40467388) | Wolffsohn JS · 2025 Eki / 2025-06-03 | Cont Lens Anterior Eye 48(5):102453 | 10.1016/j.clae.2025.102453 | RKÇ (optimizasyon) + ikinci etkinlik çalışması | 98 (optimizasyon) + 28 (etkinlik) | 2 hafta egzersiz + 2 hafta bırakma sonrası | En uygun düzen: kapa-sık-aç 15 tekrar, günde 3 kez; belirti şiddeti (p=0,001), sıklık (p=0,027), eksik kırpma (p<0,001), konjonktiva boyanması (p=0,041) azaldı; bırakıldıktan 2 hafta sonra ölçümler "çoğunlukla" başa döndü | Kırpma hızı, NIBUT, menisküs, kornea boyanması değişmedi; uygulama yazar tarafından yapılmış (çıkar beyanı); kuru göz hastaları |
| sturm2020 (32955293) | Sturm VE · 2022 Ağu / 2020-09-21 | Emotion 22(5):1044-1058 | 10.1037/emo0000876 | RKÇ | 60 sağlıklı yaşlı yetişkin | 8 hafta, haftada 15 dk dış mekân yürüyüşü | Hayranlık (awe) yürüyüşü grubu, kontrol yürüyüşüne göre yürüyüşte daha çok hayranlık, neşe ve toplum yanlısı olumlu duygu; günlük sıkıntıda daha çok azalma bildirdi | Kaygı, depresyon, yaşam doyumu iki grupta da değişmedi; etki büyüklüğü sayısı özette yok |
| tucker2007 (17920646) | Tucker P · 2007 Ara / 2007-10-24 | Public Health 121(12):909-22 | 10.1016/j.puhe.2007.04.009 | SD (MA değil) | 37 birincil çalışma, 291.883 katılımcı, 8 ülke | Yayınlar 1980–2006 | Fiziksel etkinlik mevsime göre değişiyor; kötü ya da aşırı hava, etkinliğe katılımın önünde engel olarak tanımlanmış | Nicel birleştirme yok; etki büyüklüğü özette yok |
| fincham2023 (36624160) | Fincham GW · 2023-01-09 / 2023-01-09 | Sci Rep 13(1):432 | 10.1038/s41598-022-27247-y | MA (RKÇ'ler) | 12 RKÇ, 785 yetişkin (birincil sonuç) | — | Nefes çalışması (breathwork) kontrole göre daha düşük algılanan stres: g = −0,35 [−0,55; −0,14]; kaygı g = −0,32 (k=20), depresif belirti g = −0,40 (k=18) | Çalışmaların çoğu orta yanlılık riskli; I² = %42; yazarlar "abartı ile kanıt" konusunda uyarıyor; kapsam "yavaş nefes" değil genel nefes çalışması |
| laborde2022 (35623448) | Laborde S · 2022 Tem / 2022-05-24 | Neurosci Biobehav Rev 138:104711 | 10.1016/j.neubiorev.2022.104711 | SD + MA | 223 çalışma (172 seans sırasında, 16 tek seans sonrası, 49 çok seanslı) | — | İstemli yavaş nefes, vagal KAD'yi (kalp atışı değişkenliği) seans sırasında, hemen sonra ve program sonrasında artırdı | Etki büyüklükleri ve toplam kişi sayısı özette yok |
| moszeik2025 (40373021) | Moszeik EN · 2025 Haz / — | Stress Health 41(3):e70049 | 10.1002/smi.70049 | RKÇ (4 kol) | 362 (11 dk: 101; 30 dk: 80; müzik: 74; bekleme: 107) | 2 ay, "ideal olarak" her gün, çevrim içi ses kaydı | 11 dk yoga nidra, bekleme grubuna göre anlamlı ama küçük etki (d = 0,08–0,16); aktif kontrole göre depresyonda d = 0,13; 30 dk sürüm, 11 dk'ya göre "farkındalıkla davranma"da d = 0,10 fazla ve kontrollere karşı etkisi 11 dk'yı aştı | Tüm etkiler küçük; "11 ile 30 dk arasında fark çok küçüktü" cümlesi özette **doğrudan yok** (yalnız d = 0,10 farkı ve 30 dk'nın üstünlüğü var); "alanın kalitesi düşük" ifadesi özette yok |
| radin2025 (39808431) | Radin RM · 2025-01-02 / 2025-01-02 | JAMA Netw Open 8(1):e2454435 | 10.1001/jamanetworkopen.2024.54435 | RKÇ (bekleme listesi kontrollü) | 1458 çalışan (728 meditasyon, 730 bekleme) | 8 hafta (günde 10 dk) + 4. ay izlem | Algılanan stres (PSS) Cohen d = 0,85 (8. hafta), 0,71 (4. ay); iş gerginliği d = 0,34; günde 5–9,9 dk kullananlarda PSS, 5 dk altındakilere göre −6,58 puan daha çok düştü | **Yoga değil, dijital farkındalık meditasyonu**; bekleme listesi kontrolü (aktif kontrol yok); tek akademik tıp merkezi; kullanım süresi karşılaştırması randomize değil; yazarlardan birine Headspace hibesi |
| talens2022 (35963776) | Talens-Estarelles C · 2023 Nis / 2022-08-11 | Cont Lens Anterior Eye 46(2):101744 | 10.1016/j.clae.2022.101744 | Tek kollu öncesi–sonrası | 29 belirtili bilgisayar kullanıcısı | 2 hafta hatırlatma + bırakmadan 1 hafta sonra ölçüm | 20-20-20 hatırlatmasıyla mola sayısı arttı (p ≤ 0,015); dijital göz yorgunluğu ve kuru göz belirtileri azaldı (p ≤ 0,045), bırakıldıktan **1 hafta** sonra kazanım sürmedi (p > 0,05) | Kontrol grubu yok; göz yüzeyi ve gözyaşı ölçümleri değişmedi; binoküler ölçümler (uyum esnekliği dışında) değişmedi |
| morris2020 (33322678) | Morris AS · 2020-12-12 / 2020-12-12 | Int J Environ Res Public Health 17(24):9300 | 10.3390/ijerph17249300 | Yarı-randomize, 3 kollu fizibilite | 56 ofis çalışanı (başlangıç) | 12 hafta | 60 dk'da bir uyarı kolu, uyarısız kola göre iş başında oturmada 6. haftada −46,8, 12. haftada −69,6 dk/8 sa iş günü (p < 0,05); oturmanın yerini çoğunlukla ayakta durma aldı | 30 dk kolu toplam oturmada anlamlı bildirilmedi; uzun oturma nöbetlerindeki azalma anlamsız; adım ve kardiyometabolik risk değişmedi; fizibilite çalışması |
| galinsky2007 (17514726) | Galinsky T · 2007 Tem / — | Am J Ind Med 50(7):519-27 | 10.1002/ajim.20472 | Saha çalışması (mola koşulları sıralı; germe grubu randomize) | 51 veri girişi çalışanı (germe 21, germesiz 30) | 4 hafta olağan mola + 4 hafta ek mola | Ek molalarla (2×15 dk'ya ek 4×5 dk) rahatsızlık ve göz yorgunluğu anlamlı olarak daha düşüktü; veri giriş hızı arttı, 20 dk iş süresi molaya gitse de iş çıktısı korundu | Germe uyumu düşük (%25 / %39), germenin etkisi değerlendirilemedi; etki büyüklüğü özette yok |
| stout2022 (35283036) | Stout TE · 2022 Tem / 2022-03-10 | J Ren Nutr 32(4):389-395 | 10.1053/j.jrn.2021.07.007 | RKÇ | 85 (44 standart öneri, 41 akıllı şişe); 51'inde izlem idrarı var | 6 ve 12 hafta | Başlangıçta az su içmenin başlıca nedeni içmeyi unutmak (%60). 24 sa idrar hacmi artışı akıllı şişe kolunda 1,37 L, öneri kolunda 0,79 L (P = 0,04); "unutmak" diyenler akıllı şişe kolunda %68,4 → %45,4 | Böbrek taşı hastaları; izlemde yüksek kayıp (85 → 51); ölçülen su içme değil idrar hacmi; "sağlık sonucu değişmedi" ifadesi **özette yok** (sağlık sonucu ölçülmemiş) |
| desai2026 (41864748) | Desai AC · 2026-03-21 / — | Lancet 407(10534):1171-1181 | 10.1016/S0140-6736(25)02637-6 | Çok merkezli RKÇ | 1658 (826 müdahale, 832 kontrol); ≥ 12 yaş | Ortanca 738 gün (2 yıl) | Çok bileşenli su içme programı (reçete, para ödülü, koçluk, SMS vb.) taş olaylarını azaltmadı (%19 vs %20, HR 0,96); idrar hacmi daha yüksekti; sık idrara çıkma, sıkışma ve **noktüri 6. ve 12. ayda** müdahale grubunda daha fazlaydı; 12 kişide (%1) belirtisiz hiponatremi (kontrolde 2) | Taş hastaları; yalnız 6. ve 12. ayda, öteki zamanlarda fark yok; müdahale çok bileşenli (yalnız hatırlatma değil); Ağustos 2026'da düzeltme (erratum) yayımlanmış |
| klimek2022 (35151273) | Klimek M · 2022-02-12 / 2022-02-12 | Eur Rev Aging Phys Act 19(1):6 | 10.1186/s11556-022-00286-0 | İleriye dönük gözlemsel (ActiFE kohortu) | **özette yok** (≥ 65 yaş, Ulm/Almanya) | 2009–2018, 3 dalga, dalga başına ≤ 7 gün ivmeölçer | Yüksek sıcaklık, güneş ışınımı ve güneşlenme süresi yürüme süresini ve evden dışarıda geçen süreyi artırdı; daha çok yağış, nem ve rüzgâr azalttı | Kişi sayısı ve etki büyüklüğü özette yok; yalnız yaşlılar; gözlemsel |
| denissen2008 (18837616) | Denissen JJ · 2008 Eki / — | Emotion 8(5):662-7 | 10.1037/a0013497 | Çevrim içi günlük (diary), çok düzeyli analiz | 1233 | özette yok | Sıcaklık, rüzgâr ve güneş ışığının olumsuz duygu üzerinde ana etkisi var; açıklanan varyans açısından havanın ruh hâline ortalama etkisi küçük; kişiler arasında anlamlı değişkenlik (özellikle gün uzunluğu) | Kişilik, cinsiyet, yaş bireysel farkı açıklamadı; gözlemsel |
| yamashita2021 (34065588) | Yamashita R · 2021-05-20 / 2021-05-20 | Int J Environ Res Public Health 18(10):5500 | 10.3390/ijerph18105500 | Randomize kontrollü çapraz deney | 30 genç yetişkin | Her görüntü seti 3 dk (tek oturum) | Doğa görüntüleri, yapılı çevre görüntülerine göre rahatlık ve gevşemeyi anlamlı artırdı (büyük etki), canlılığı artırmadı; sağ OFC oksi-Hb azaldı (orta etki) | Fotoğraf, gerçek doğa değil; tek oturum; küçük örneklem; başlıktaki "mood-improving" sözcüğü bildirimde kullanılamaz |
| klasnja2019 (30192907) | Klasnja P · 2019-05-03 / — | Ann Behav Med 53(6):573-582 | 10.1093/abm/kay067 | MRT | 44 yetişkin | 6 hafta | Herhangi bir öneri: sonraki 30 dk adım %14 (p = 0,06); yürüyüş önerisi: %24 (59 adım, p = 0,02); başlangıçta %107'ye kadar, zamanla azaldı; hareketsizlik karşıtı öneride etki yok | Etki haftalar içinde azaldı; küçük örneklem |
| balban2023 (36630953) | Balban MY · 2023-01-17 / 2023-01-10 | Cell Rep Med 4(1):100895 | 10.1016/j.xcrm.2022.100895 | Uzaktan RKÇ | **özette yok** | 1 ay, günde 5 dk | Nefes çalışması, özellikle uzun nefes vermeli "döngüsel iç çekme", farkındalık meditasyonuna göre ruh hâlinde daha çok artış (p < 0,05) ve solunum hızında daha çok azalma (p < 0,05) | Etki büyüklüğü ve kişi sayısı özette yok; aktif kontrol meditasyon (pasif kontrol yok); yazarlardan birinin WHOOP danışmanlığı |
| cajochen2013 (23891110) | Cajochen C · 2013-08-05 / 2013-07-25 | Curr Biol 23(15):1485-8 | 10.1016/j.cub.2013.06.029 | Geriye dönük kesitsel analiz (laboratuvar verisi) | **özette yok** | — | Dolunay çevresinde NREM delta etkinliği %30 düştü, uykuya dalma 5 dk uzadı, EEG toplam uyku 20 dk kısaldı; öznel uyku kalitesi ve melatonin azaldı | Sonradan (a posteriori) analiz; örneklem sayısı özette yok; üç yorum mektubu yayımlanmış |
| habarubio2015 (26498230) | Haba-Rubio J · 2015 Kas / 2015-08-18 | Sleep Med 16(11):1321-1326 | 10.1016/j.sleep.2015.08.002 | Toplum tabanlı kohortta kesitsel (evde PSG) | 2125 (EEG spektral: 759) | — | Ay evreleri arasında öznel uyku kalitesinde, objektif uyku süresinde (398 / 402 / 403 dk; p = 0,31) ve kortizolde fark yok | Uyku bozukluğu olmayan alt grupta dolunayda daha kısa uyku eğilimi (p = 0,06) |
| chaput2016 (27047907) | Chaput JP · 2016 / 2016-03-24 | Front Pediatr 4:24 | 10.3389/fped.2016.00024 | Gözlemsel kesitsel (12 ülke) | 5812 çocuk (9–11 yaş), 33.710 kayıt | 7 gün ivmeölçer | Yalnız uyku süresi farklı: dolunayda yeniaya göre gecede ~5 dk (%1) daha kısa; etkinlikte fark < 2 dk/gün, anlamsız | Yazarlar farkın klinik anlamını "tartışmalı" buluyor |
| smith2017 (27928860) | Smith MP · 2017 Haz / 2016-12-08 | J Sleep Res 26(3):371-376 | 10.1111/jsr.12472 | Toplum tabanlı gözlemsel | 1411 genç (14–17 yaş), 8832 gün | 2011–2014 | Ay evresi fiziksel etkinlik, öznel uyku kalitesi ve yatakta geçen süreyle anlamlı ilişkili değil | Uyku günlükle (öznel) ölçüldü; yalnız Almanya |
| casiraghi2021 (33571126) | Casiraghi L · 2021 Oca / 2021-01-27 | Sci Adv 7(5):eabe0465 | 10.1126/sciadv.abe0465 | Gözlemsel saha çalışması (bilek aktimetrisi) | **özette yok** | özette yok | Dolunaydan önceki gecelerde uyku daha geç başlıyor ve daha kısa sürüyor; kırsal (elektrikli/elektriksiz Toba/Qom) ve kentsel (ABD) topluluklarda | Kişi sayısı ve dakika farkı özette yok |

## 2. Bilim satırları: mevcut öneri ve doğrulanmış öneri

"Durum": **Doğru** = özetle uyumlu, değişiklik gerekmiyor; **Küçük düzeltme** = sayı/tasarım eklenmeli ya da ifade
daraltılmalı; **Düzeltilmeli** = özette olmayan ya da özetle çelişen içerik var.

| # | Kaynak | Mevcut satır (`nef-bildirim.md`) | Kar. | Önerilen satır | Kar. | Durum |
|---|---|---|---|---|---|---|
| G1 | Kim 2020 | Bir çalışmada kırpma egzersizini bırakanların başlıca nedeni unutmaktı. | 71 | 41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada %54'ten %34'e indi. | 84 | Düzeltilmeli |
| G2 | Wolffsohn 2025 | Bir denemede en iyi sonuç günde 3 kez 15 tekrarla alındı. | 57 | 98 kişilik bir denemede en uygun düzen günde 3 kez 15 tekrar çıktı. | 67 | Küçük düzeltme (kişi sayısı) |
| G3 | Wolffsohn 2025 | Bir denemede egzersiz bırakılınca kazanım 2 haftada kayboldu. | 61 | 28 kişilik bir denemede egzersiz bırakılınca ölçümler 2 haftada çoğunlukla başa döndü. | 86 | Küçük düzeltme ("kayboldu" → "çoğunlukla başa döndü"; kişi sayısı) |
| Y1 | Klasnja 2019 | Bir denemede yürüyüş önerisi sonraki 30 dakikada adımı artırdı; 44 kişi, 6 hafta. | 81 | (aynı) | 81 | Doğru |
| Y2 | Sturm 2020 | 60 yaşlıyla bir denemede çevreye hayranlıkla bakarak yürüyenler daha çok olumlu duygu bildirdi. | 95 | 60 yaşlıyla 8 haftalık bir denemede hayranlık yürüyüşü yapanlar daha çok olumlu duygu bildirdi. | 95 | Doğru; süre eklenebilir (öneri) |
| Y3 | Tucker ve Gilliland 2007 | Araştırmalarda kötü hava, hareketin önündeki engellerden biri çıktı. | 68 | 37 çalışmalık bir derlemede kötü ya da aşırı hava, hareketin önünde bir engel olarak görüldü. | 93 | Küçük düzeltme (tasarım ve çalışma sayısı) |
| N1 | Fincham 2023 | 12 denemelik bir analizde yavaş nefes, algılanan streste küçük–orta azalmayla ilişkiliydi. | 90 | 12 denemede (785 kişi) nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi. | 91 | Düzeltilmeli ("yavaş nefes" değil "nefes çalışması") |
| N2 | Laborde 2022 | 223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı. | 82 | (aynı) | 82 | Doğru |
| N3 | Ay (5 kaynak) | Ayın uykuya etkisi tartışmalı: bazı çalışmalar küçük fark buldu, büyük çalışmalar bulmadı. | 90 | Ayın uykuya etkisi tartışmalı: 5812 çocukta ~5 dk fark bulundu, 2125 yetişkinde bulunmadı. | 90 | Düzeltilmeli |
| O1 | Laborde 2022 | 223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı. | 82 | (aynı) | 82 | Doğru (yoga dersi nefes temelliyse) |
| O2 | Moszeik 2025 | 11 ve 30 dakikalık yoga nidrayı karşılaştıran bir çalışmada fark çok küçüktü. | 77 | 362 kişilik 2 aylık bir denemede 11 dakikalık yoga nidranın bekleme grubuna göre etkisi küçüktü. | 96 | Düzeltilmeli |
| O3 | Radin 2025 | Gerçek kullanımı inceleyen bir çalışmada seanslar çoğunlukla kısaydı. | 69 | 362 kişilik denemede 11 dakikalık kısa yoga nidra da bekleme grubundan ayrıştı; etki küçüktü. (kaynak: Moszeik 2025) | 93 | Düzeltilmeli (kaynak değişmeli) |
| L1 | Talens-Estarelles 2022 | 29 kişilik bir çalışmada 20-20-20 molasının etkisi, hatırlatma bitince 1–2 haftada kayboldu. | 92 | 29 kişilik bir çalışmada 20-20-20 hatırlatmasıyla gelen azalma, bırakıldıktan 1 hafta sonra sürmedi. | 100 | Düzeltilmeli ("1–2 hafta" → "1 hafta") |
| L2 | Morris 2020 | 56 ofis çalışanıyla 12 haftalık bir çalışmada telefondan gelen mola hatırlatması oturmayı azalttı. | 98 | 56 ofis çalışanıyla 12 haftalık çalışmada saatlik telefon hatırlatmasıyla iş başında oturma azaldı. | 99 | Küçük düzeltme (yalnız 60 dk kolu anlamlı) |
| L3 | Galinsky 2007 | 51 veri girişi çalışanıyla bir saha çalışmasında ek kısa molalar denendi. | 73 | 51 veri girişçisiyle bir saha çalışmasında ek kısa molalarla rahatsızlık ve göz yorgunluğu azaldı. | 98 | Tamamlandı (bulgu eklendi) |
| U1 | Stout 2022 | Bir denemede hatırlatma ve kayıtla su içme biraz arttı; sağlık sonucu değişmedi. | 80 | 85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı (%60). | 69 | Düzeltilmeli |
| U2 | Desai 2026 | Bir çalışmada sıvıyı artıranlarda gece tuvalete kalkma arttı; bu yüzden 18.00'den sonra sormuyoruz. | 99 | 1658 kişilik bir denemede su programındakiler 6. ve 12. ayda gece daha sık tuvalete kalktı. | 91 | Küçük düzeltme (kişi sayısı, zaman sınırı) |
| U3 | — | kaynak bekliyor | — | kaynak bekliyor (bu görevde yeni kaynak aranmadı) | — | Hâlâ eksik |
| H1 | Klimek 2022 | Bir çalışmada yağışlı günlerde yürüyüş azaldı. | 46 | 65 yaş üstü kişilerle bir izlem çalışmasında yağış arttıkça günlük yürüme süresi azaldı. | 88 | Küçük düzeltme (tasarım; kişi sayısı özette yok) |
| H2 | Denissen 2008 | Bir çalışmada havanın ruh hâline ortalama etkisi küçüktü ve kişiden kişiye değişti. | 83 | 1233 kişilik günlük çalışmasında havanın ruh hâline ortalama etkisi küçüktü; kişiden kişiye değişti. | 100 | Küçük düzeltme (kişi sayısı) |
| H3 | Yamashita 2021 | 30 genç yetişkinle bir çalışmada doğa görüntülerine bakmak olumlu ruh hâliyle ilişkiliydi. | 90 | (aynı) | 90 | Doğru |
| — | Balban 2023 (yeni) | (örneklerde kullanılmadı; bulgu "kaynak bekliyor") | — | Uzaktan 1 aylık denemede günde 5 dk uzun nefes verme, ruh hâlinde meditasyondan çok artış gösterdi. | 99 | Bulgu tamamlandı; kişi sayısı özette yok |
| — | Radin 2025 (meditasyon için) | — | — | 1458 çalışanla bir denemede günde 5–10 dk meditasyon yapanlarda stres, 5 dk altından çok düştü. | 95 | Yalnız meditasyon içeriğinde kullanılabilir; yoga bildiriminde değil |

Not: Tablodaki "(aynı)" satırlar mevcut satırın harfi harfine korunmasıdır. §10.5'teki B/N/S sütunundaki S değerleri
(71, 57, 61, 81, 95, 68, 90, 82, 90, 82, 77, 69, 92, 98, 73, 80, 99, 46, 83, 90) Python `len` ile yeniden sayıldı ve
doğru bulundu.

## 3. Düzeltilmesi gereken satırlar

1. **G1 (Kim 2020)** — "bırakanların başlıca nedeni unutmaktı" bilgisi PubMed özetinde **yok**. Özette yalnız 54 kişinin
   başladığı, 41'inin bitirdiği var (%24 ayrılma buradan hesaplanabilir; ayrılma nedeni yazmıyor). Tam metinde
   doğrulanmadıkça bu satır kullanılmamalı. Öneri: "41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada
   %54'ten %34'e indi." (84). "Unutma" gerekçesi için özette doğrulanan kaynak Stout 2022'dir (su, %60).
2. **N1 (Fincham 2023)** — Meta-analiz "yavaş nefes"i değil, genel **nefes çalışmasını (breathwork)** kapsıyor. "yavaş
   nefes" → "nefes çalışması"; 785 kişi eklendi.
3. **N3 (ay)** — "büyük çalışmalar bulmadı" eksik: en büyük çalışma (Chaput 2016, 5812 çocuk) küçük bir fark (~5 dk,
   %1) **buldu**; fark bulmayanlar Haba-Rubio 2015 (2125) ve Smith 2017 (1411). Öneri satırı iki somut sayıyla
   yeniden yazıldı. Cajochen 2013 ve Casiraghi 2021'in kişi sayıları özette yok.
4. **O2 (Moszeik 2025)** — "11 ve 30 dakikayı karşılaştıran bir çalışmada fark çok küçüktü" özetle birebir örtüşmüyor:
   çalışma 4 kollu bir RKÇ (362 kişi); 30 dk sürüm 11 dk'ya göre bir ölçümde d = 0,10 fazla ve kontrollere karşı
   etkisi 11 dk'yı aştı. Özetin açık bulgusu "11 dk sürümün bekleme grubuna göre etkisi küçük ama anlamlı (d = 0,08–0,16)".
   Ayrıca `nef-bildirim.md`'deki "alandaki çalışmaların çoğunun kalitesi düşük" kart cümlesi bu özette yok (başka
   kaynaktan olmalı; kontrol edilmeli).
5. **O3 (Radin 2025)** — İki sorun: (a) çalışma **yoga değil**, dijital farkındalık meditasyonu RKÇ'si (1458 çalışan);
   (b) "gerçek kullanımda seanslar çoğunlukla kısaydı" özette **yok**; özette olan, günde 5–9,9 dk kullananların 5 dk
   altındakilere göre daha çok stres düşüşü bildirdiği (randomize olmayan karşılaştırma). Yoga bildirimi için kaynak
   Moszeik 2025'e çevrilmeli; `yogaLessons.js:27, :56`'daki Radin atfı da ayrıca gözden geçirilmeli.
6. **L1 (Talens-Estarelles 2022)** — Özet "1–2 hafta" değil, bırakıldıktan **1 hafta sonra** kazanımın sürmediğini
   söylüyor (tek ölçüm noktası). Ayrıca etki "molanın etkisi" değil, belirtilerdeki azalma.
7. **U1 (Stout 2022)** — "sağlık sonucu değişmedi" özette **yok** (çalışma sağlık sonucu ölçmemiş; ölçüt 24 sa idrar
   hacmi). "su içme biraz arttı" da dolaylı (içilen su değil idrar hacmi: 1,37 L vs 0,79 L). Önerilen satır özetteki
   başlangıç bulgusunu (%60 unutma) kullanıyor; sınır: böbrek taşı hastaları.
8. **Küçük düzeltmeler (anlamca doğru, kişi sayısı/tasarım eksik):** G2 (98 kişi), G3 (28 kişi; "kayboldu" yerine
   "çoğunlukla başa döndü"), Y3 (SD, 37 çalışma), L2 (yalnız saatlik uyarı kolu anlamlı), U2 (1658 kişi; noktüri yalnız
   6. ve 12. ayda; müdahale çok bileşenli), H1 (izlem çalışması, ≥ 65 yaş), H2 (1233 kişi). U2'deki "bu yüzden
   18.00'den sonra sormuyoruz" bir bulgu değil uygulama kuralıdır; bilim satırından çıkarılıp kartta kalması önerilir.
9. **Künye yılı notu:** Kim "2020" (e-yayın 2020, basım 2021), Sturm "2020" (e-yayın 2020, basım 2022),
   Talens-Estarelles "2022" (e-yayın 2022, basım 2023), Smith "2017" (e-yayın 2016). `sources.js`'e eklenirken iki
   tarih de yazılmalı.

## 4. Hâlâ eksik olanlar

- **U3 (su ↔ göz konforu/odak):** kaynak yok; bu görevde yeni kaynak aranmadı.
- **Kişi sayısı özette yok:** Klimek 2022, Balban 2023, Cajochen 2013, Casiraghi 2021 (tam metinden alınmalı).
- **Kim 2020 "unutma" gerekçesi:** özette yok; tam metin ya da `docs/` altındaki notun kaynağı açılmalı.
- **Moszeik kartındaki "alanın kalitesi düşük" cümlesi:** özette yok; hangi kaynaktan geldiği belirlenmeli.
