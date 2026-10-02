# Ders 5 · Tek Nokta · metin (B adımı, Parti 1)

Sürüm: B-parti1-taslak-1 (2026-09-30; insan ya da yedek incelemeden geçmedi). Tek kaynak `ders5_kaynak.py` (+ `ders5_meta.py`) → `ders5.lesson.json`; bu dosya ve `timing.txt` `ders5_md.py` ve `timing_d5.py` ile aynı veriden üretilir. Planlayıcı pilotun `timing.py`sidir (birebir kopya, sha256 58f6c405…, değiştirilmedi); Ders 2'ye özgü birkaç sabiti yalnız çalışma anında Ders 5 verisine göre ayarlanır (`timing.txt` başındaki "YAMA" satırları).

**Durum, açıkça.** Bu, Ders 5'in ilk yayın metnidir (3 · 5 · 15 dk ve 30 dk iskeleti). Hiçbir cümle seslendirilmedi: ElevenLabs bağlantısı bu oturumda yoktu, ücretli çağrı yapılmadı; müzik ve çan da üretilmedi. Metin PLAN.v3 §E.1'in üç onayından henüz geçmedi: model ilk denetimi (makineyle denetlenen kurallar) yapıldı ve geçti; Türkçe editör ve usta hoca yerine karar 2 yedeği olan **iki bağımsız model incelemesi** ve sahibin kulağı bekleniyor. Ders 5 klinik psikolog incelemesi gerektiren derslerden değildir (yalnız Ders 4 ve 7). Bütün süreler hece modelinden tahmindir (VARSAYIM); ses üretilince ölçülen sürelerle yeniden kurulur. Bu yüzden ders "bitti" sayılmaz.

## 0. Tek bakışta

| | |
|---|---|
| Söz (kart) | Dikkatini tek bir noktada toplamayı, dağıldığında nazikçe geri getirmeyi deniyorsun. |
| Kartın kanıt satırı (5 ve 15 dk) | "Neye dayanıyor: bir çalışmada sekiz dakikalık nefes farkındalığından sonra, bir dikkat görevinde zihin dağılmasının göstergeleri gevşeme ve okumaya göre azaldı. 45 çalışmayı birleştiren bir incelemede düşünme becerilerindeki etki küçüktü ve etkin karşılaştırmalardan üstün değildi. Bu ders bir sonuç vaadi taşımaz." |
| 3 dk kartı (PLAN.v3 §A.2 kural 12) | "Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık. Bir çalışmada meditasyon uygulamasını kullananların çoğu günde beş dakikanın altında kaldı; bu sürüm o gerçek kullanım için var." |
| Süreler ve varsayılan | 3 · 5 · 15 dk; varsayılan 5 dk (PLAN.v3 §A.1). 30 dk ve kaydırıcı ikinci aşamada; 30 dk iskeleti `iskelet30.md` |
| Duruş | yalnız oturarak (sandalye ya da yer); ayakta ve uzanarak hiçbir şey yok |
| Açılış ekranı (`openingScreen`, `openingNotice`) | "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin." · "Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle." · "Gözlerin yorulursa kapatman ya da kırpman yeterli." |
| Hazırlık kartı | Sırtını dik tutabileceğin bir sandalye ya da minder · Birkaç dakika bildirimlerin susacağı sessiz bir yer |
| İlk yoga dersiyse | ayrı giriş dosyası: "Bugün yalnızca tanışıyoruz; zorlanırsan kapanışa geçmen yeterli." (PLAN.v3 §D.3; planın dışında, ≈ 7 sn; Ders 1 ile aynı) |
| Derse özgü açılış (her sürümde aynı) | "Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun." |
| Ortak çıkış cümlesi | "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin." |
| Anahtar cümle, giderek kısa | 1) "Fark ettiğin an, zaten geri döndün." (11 hece; her sürümde, C1 sonu) · 2) "Fark ettin; döndün." (5; C2 varken) · 3) "Yine döndün." (4; C3 varken) |
| İmge yayı (tek imge, seçim gerekmez) | el fenerinin ışığı: geniş ve dağınık (Varış) → tek noktada toplanmış (C1), Derin'de küçük ve parlak (C3) → yeniden genişleyip odayı aydınlatan ışık (Kapanış; 30 dk'da C5 açık izleme) → "El feneri yine senin elinde." |
| Teknik | nefes çapası: nefesin en açık duyulduğu yer (burun, göğüs ya da karın) → dağıl, fark et, dön · içinden nefes sayma bir → on, sonra yalnız verişte · uzayan sessiz odak aralıkları (≈ 15 → 18 → 30 → 45 sn), her aralığın sonunda çan ve yumuşak geri çağırma · Kapanış'ta isteğe bağlı avuçlama |
| Nefes | değiştirilmez: yalnız izlenir ve içinden sayılır; "derin nefes al", tutma ve sesli sayım yok |
| Kapanış (gündüz, oturarak) | dönüş → nefes (ışık genişler) → sesler → parmaklar ve gerinme ("ağrı ya da baş dönmesi olursa bırak") → [avuçlama] → gözler ve oda → gün içine köprü → son cümle "El feneri yine senin elinde." |
| Müzik | Sol, "neredeyse yok": sürekli, sinüs benzeri tek ton (müzik A, ElevenLabs Music; saf ton sentezle de olur, açık karar); Varış'ta geniş, Derin'de tek kısmi ses; sessiz odak aralıklarında yatak **çekilir** (kabarmaz); aralık sonunda çan (dönüş tınısı); doğa kapalı; 3 dk'da iki doku geçişi |
| Görsel | tek ışık noktası (soğuk ışık beyazı `#D6E4F2`, açık temada arduvaz `#4F5D6E`); nefese kilitli değil; Varış'ta geniş hale → Derin'de en küçük ve parlak → Kapanış'ta şafakla yeniden genişler; şafak 60–90 sn (3 dk'da 45) |
| Gelişim | `focus` · "Dikkatin şu an ne kadar toplanmış?" 1–10 (dağınık → toplanmış), ölçü etiketi "odak"; "dikkatin gelişti" denmez |
| Zamanlama (`timing.txt`) | 3 köşe × 13 dakika (3, 4, 5–15): **39/39 vaka geçti**; yayın süreleri 3 dk GEÇTİ, 5 dk GEÇTİ, 15 dk GEÇTİ (üç köşede). Köşeler VARSAYIM: Nefona Hoca 4,68 hece/sn (yüksek ve düşük duraklama), Neslihan ölçülmüş süreleri |
| Metin envanteri | 61 birim (klip kimliği; çok cümleli olanlar 6, parça toplamı 69) + 3 ayrı metinli 3 dk kısa biçimi (8 kısa biçim yalnız sessizliği değiştirir); TTS'e 64 istek, 3592 karakter; birimler 1240 hece, 491 sözcük; kısa biçimler 56 hece, 21 sözcük. Mikro ipucu ve taşıyıcı yok. Ortak yardımcı klipler (Durdur dönüşü, ilk ders girişi; her derste aynı) ayrıca 4 istek, 196 karakter |
| 3 dk (hoc) | A → C1 → K · 14 birim, 279 hece, konuşma %38 |
| 5 dk (hoc) | A → C1 → K · 22 birim, 484 hece, konuşma %40 |
| 15 dk (hoc) | A → C1 → C2 → C3 → K · 61 birim, 1240 hece, konuşma %34 |

## 1. Hocanın kurgusu

### 1.1 Akış, evreler; ses, müzik ve görüntü

Ders bir dikkat dersidir. Dinleyicinin işi nefesin en açık duyulduğu tek bir noktada kalmak, dağıldığında bunu fark etmek ve nazikçe geri gelmektir. Dersin fikri anahtar cümlededir: dağılmak başarısızlık değil, fark ettiğin an dönüş zaten olmuştur (PLAN.v2 §C.1; dossier-benlik §11 "Tasarıma etkisi"). Önce nefes değiştirilmeden izlenir (güvenlik §11.B-6; Toussaint 2021), sonra sayı bir tutamak olarak eklenir, sonra sayı da bırakılır ve aralar uzar. Evre geçişleri ses, müzik ve görüntüde aynı klipte olur.

| Evre | Bloklar | Ses | Müzik (konuşmada kısık) | Görsel (tek ışık noktası) |
|---|---|---|---|---|
| Varış | A | 0 dB; cümle arası 0,6–1 sn | Sol, iki kısmi sesli geniş ton, ≈ −33 LUFS; ders 3–5 sn'de açılır | geniş, soluk hale |
| Derinleşme | C1, C2 | −1,5 dB; cümleler kısalır | `c1.yer`'de ≥ 8 sn çapraz geçişle daralan ton; `c2.giris`'te çok hafif ikinci kısmi ses | hale daralır; nefese kilitli değil, ≥ 20 sn periyotlu çok yavaş ışık kayması |
| Derin | C3 | −3 dB; en kısa cümleler (H12) | `c3.ad`'da tek kısmi ses; sessiz odak aralıklarında yatak ≈ 6 dB **çekilir** (≥ 6 sn rampa), aralık sonunda çan | en küçük ve en parlak nokta; pencerede kıpırtısız |
| Kapanış | K | ≥ 4 sn'lik sessizlikte rampa, 0 dB | `k.donus`'tan 2 sn önce çan; ton yeniden genişler; `k.goz`'de tek sıcak akor; son 5 sn söner | şafak: max(`k.donus`, son − 90 sn)'den sona, ≥ 60 sn (3 dk'da 45); nokta genişler |

### 1.2 Neden sesli sayım yok; sessizlikler nasıl kurulur

Nefes sayma (C2) dinleyicinin **içinden** ve kendi hızında yapılır. Hoca "bir… iki…" demez: sesli sayım bir nefes temposu dayatırdı; bu derste nefes değiştirilmez, yalnız izlenir (güvenlik §11.B-6). Ders 1'in kilitli nefes ipuçlarından (4 al / 6 ver) bilinçli olarak ayrışır. Bu yüzden Ders 5'te mikro-klip, taşıyıcı ve nefes kilidi yoktur; bütün birimler 1–3 tam cümledir ve üretimin en riskli parçası (mikro kesim) bu derste yoktur.

Sessizlik üç sınıftadır (PLAN.v2 §B.2): eylem payı (yönergeden sonra 3–8 sn), nefes payı (12–20 sn; "birkaç nefes boyunca…", "Sayıyı bir süre sen sürdürüyorsun." gibi bir cümle sessizliği önceden söyler) ve C3'te duyurulu sessiz pencere. Pencere yalnız 15 dk'dadır: `c3.w30` (25–36 sn, zorunlu) ve `c3.w45` (40–52 sn, isteğe bağlı). Her pencere duyuru ile başlar (ne kadar süreceği, bir çıkış kapısı ve "Çanla yine seslenirim."), çanla ve bir karşılama cümlesiyle biter (güvenlik §11.B-16). 3 ve 5 dk'da pencere yoktur; 20 sn'yi aşan sessizlik de yoktur. Uzayan aralıkların sırası: `c1.aralik1` ≈ 16 sn → `c3.kisa` ≈ 15 sn → `c3.kisa2` ≈ 17–18 sn → `c3.w30` ≈ 30 sn → `c3.w45` ≈ 45 sn; 60 sn'lik aralık 30 dk iskeletindedir.

Anlatım evreden evreye azalır (PLAN.v2 §C.2): Varış'ta uzun, davetkâr cümleler; C1–C2'de tek yönerge; C3'te "Işığın hâlâ noktada mı?", "Yine döndün." gibi en kısa cümleler. Evre başına ortalama cümle uzunluğu (hoc, 15 dk): Varış 23,9, Derinleşme 19,7, Derin 11,3, Kapanış 20,5 (H12: Varış > Derinleşme > Derin).

### 1.3 Anahtar cümle (PLAN.v2 §A.2.1, §C.4)

"Fark ettiğin an, zaten geri döndün." yalnız Ders 5'e aittir (PLAN.v2 §A.2.1 ve §C.1). Üç geçiş giderek kısalır (11 → 5 → 4 hece) ve her biri bir bloğun sonundadır; 3 ve 5 dk'da bir kez (PLAN.v3 §A.2 kural 5), 15 dk'da üç kez söylenir. İki sapma: (1) PLAN.v2'nin 3. biçimi "Döndün…" üç nokta taşıyordu; üç nokta yalnız listelerde kullanıldığı için (PLAN.v2 §C.2) atıldı. (2) Tek sözcüklük "Döndün." pencereden sonra kopuk ve "başın döndü" çağrışımına açık duyuluyordu; "Yine döndün." yazıldı: dönüşün her seferinde olduğunu söyler ve kısalma sırasını korur. İkinci biçim "Fark ettin; döndün." PLAN.v2'deki gibidir. Üçü de Türkçe editör ve kulak denetimine gider (panelChecks D5-05).

### 1.4 İmge yayı: el fenerinin ışığı (tek imge, seçimsiz)

Açılış imgeyi kurar: "Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun." Yay üç adımdır ve her sürümde en az iki adımı duyulur: (1) geniş ve dağınık ışık: "Başta ışık geniş ve dağınık; seslere ve düşüncelere aynı anda vuruyor." (hoc köşesinde 6. dakikadan; daha kısa sürümlerde açılış cümlesi bu adımı taşır); (2) tek noktada toplanan ışık: "Hangisi olursa olsun, ışığın bugün o noktaya düşüyor.", Derin'de "Işık artık küçük ve parlak bir nokta."; (3) yeniden genişleyen ışık: Kapanış'ta "Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor.", "Odadaki sesler de ışığın içine giriyor." ve son cümle "El feneri yine senin elinde.". 30 dk'da üçüncü adım C5 açık izleme bloğunda tam bir bölüm olur (iskelet). İmgede su, derinlik, kapalı alan, yükseklik ya da karanlık yoktur; bu yüzden seçenek gerekmez (güvenlik §11.B-10). Görme tek başına bırakılmaz (PLAN.v2 §C.4): ışık imgesi hep somut bir duyuya bağlanır (burundaki serin ve ılık hava, göğsün ya da karnın yükselip inmesi, çanın sesi, avuçların sıcaklığı). Gözleri açık dinleyen için metafor ışığı ile odanın ışığı karışmasın diye Kapanış'ta "ışığa alıştıra alıştıra" denmez; gözler "acele etmeden" açılır.

### 1.5 Benzersizlik (PLAN.v2 §A.2.1, §E.6 #17)

| Öğe | Ders 5 | Yakınlık denetimi |
|---|---|---|
| Açılış | "Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun." | PLAN.v2 yönündeki "…toplayabilirsin" "-(y)abil-"siz yazıldı; öteki dokuz dersin açılışıyla örtüşmez |
| Anahtar cümle | fark et / dön | yalnız Ders 5; Ders 1 ve 2 kullanmaz (PLAN.v2 §C.1) |
| İmge | el feneri ışığı | Ders 6'nın "pencereye vuran ilk ışık"ı şafak ışığıdır, dikkat metaforu değildir; Ders 7'nin "göğüste sıcak ışık"ı görsel biçimdir. Metinde çakışan cümle yok; yakınlık kör dinlemede izlenir |
| Görsel | tek ışık noktası | öteki derslerin biçimleriyle çakışmaz; Ders 1'in halkası nefese kilitli, bu nokta değil |
| Müzik | Sol, sinüs benzeri tek ton + çan | öteki derslerin tonları Re, Mi♭, La♭, Fa, Mi, La; çan yalnız bu derste ses çapası |
| Teknik | sessiz sayma, uzayan sessiz odak aralıkları | Ders 2'nin sesli geri sayımından ve Ders 1'in sayılı nefes döngüsünden ayrışır |
| Ders 2, 5 ve 9 sınırı | ≤ 15 dk'da açık izleme yok; "fark eden sensin" tanık göstergesi yok | PLAN.v2 §A.2.1: sesleri ve düşünceleri açık izleme Ders 5'in 30 dk'sına (C5), izleyen farkındalık Ders 9'a aittir |
| Ortak cümleler | `a.izin`, `k.donus`, `k.hareket`, Durdur dönüşü, ilk ders girişi her derste aynı; `a.gozler` Ders 1 ve 2'nin göz cümlesiyle aynı kalıptadır | ritüel ve güvenlik cümleleridir; benzersizlik ölçütüne girmez |

### 1.6 Dikkat eğrisi (15 dk, hoc köşesi; doku ya da teknik değişim anları)

0:04 varış · 1:34 nefes çapası (nokta seçimi, izleme) · 2:55 dağıl, fark et, dön; odak aralıkları · 5:30 nefes sayma, bir → on (içinden) · 7:43 yalnız verişte sayma · 8:49 sessiz odak aralıkları (çan) · 10:37 sessiz pencere ≈ 30 sn · 11:33 sessiz pencere ≈ 45 sn · 12:40 kapanış · 13:19 avuçlama (isteğe bağlı) · 14:17 kapanış

En uzun tek doku koşusu: "C1/cümle" 236 sn (pilot sınırı 300 sn). 30 dk'nın değişim anları `iskelet30.md`'de.

### 1.7 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)

- **Nefese odaklanıp dağılınca dönmek:** 8 dakikalık farkındalıkla nefes, bir dikkat görevinde zihin gezinmesinin davranışsal göstergelerini pasif gevşemeye ve okumaya göre azalttı (Mrazek 2012, Çalışma 2, PMID 22309719, DOI [10.1037/a0026678](https://doi.org/10.1037/a0026678); benlik C04). Acemilerde 10 dakikalık bir meditasyon kaydı, kontrol kaydına göre dikkat görevlerinde daha iyi sonuçla birlikte gitti; yazarlar bunu "bazı acemilerde" diye sınırlıyor (Norris 2018, PMID 30127731, DOI [10.3389/fnhum.2018.00315](https://doi.org/10.3389/fnhum.2018.00315); benlik C05, düzeltilmiş kayıt). Bu iki süre (8 ve 10 dk) 15 dk sürümünden kısadır; 3 ve 5 dk için doğrudan kanıt değildir.
- **Etki küçük, kalıcılık zayıf:** 45 RKÇ'lik meta-analizde nesnel bilişte etki küçüktü (g = 0,15) ve aktif karşılaştırmalardan üstün değildi (Whitfield 2021, PMID 34350544, DOI [10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y); benlik C39). Zihin gezinmesindeki azalma çalışmaların çoğunda en az 2 haftalık pratikten sonra görüldü (Feruglio 2021, PMID 34560133, DOI [10.1016/j.neubiorev.2021.09.032](https://doi.org/10.1016/j.neubiorev.2021.09.032); benlik C40). Bu yüzden kart sonuç vaadi taşımaz ve Gelişim "dikkatin gelişti" demez.
- **Sessiz aralıklarda müziğin çekilmesi:** müzik parçaları arasına rastgele konan 2 dakikalık sessizlik kalp hızını, kan basıncını ve dakika ventilasyonunu başlangıç düzeyinin de altına indirdi (Bernardi 2006, n=24, PMID 16199412, DOI [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600); sakin §11.5). PLAN.v2 kartı bu yüzden odak aralıklarında müziği çeker. Bu bir **tasarım çıkarımıdır**: çalışma meditasyon aralığını değil, müzik dinlerken sessizliği sınadı.
- **Nefes değiştirilmez:** "derin nefes" talimatı alan grupta fizyolojik uyarılma önce arttı (Toussaint 2021, PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040)); ders nefesi yalnız izletir ve içinden saydırır.
- **Varış ve dönüş:** travma-duyarlı yoga nidranın bileşenlerinden "uygun uzunluk ve hazırlık" ile "yeterli yerleşme ve dışa dönüş" (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021); kavramsal); uyandırma başarısızlığı istenmeyen etkilerde önemli bir etken sayıldı (Howard 2017, PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).
- **Hareket:** her harekette "ağrı ya da baş dönmesi olursa bırak" (güvenlik §11.B-17; Cramer 2013, PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)).
- **Avuçlama:** PLAN.v2 kartındaki isteğe bağlı dinlenme ritüelidir; etkisi için kaynak aranmadı, **iddiasızdır** (doğrulanmadı). Avuçlar gözlere değmez ve bastırmaz (PLAN.v2 §A.1 "Gözlere dokunan yönerge yok").
- **3 dk:** 3 dakikalık bir oturumun etkisini sınayan çalışma dosyalarda yok; kısa farkındalık eğitimlerinde olumsuz duygulanımdaki etki yayın yanlılığı düzeltilince g = 0,04'e indi (Schumer 2018, PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Gerçek kullanımda meditasyona özgü kullanım günde ortalama 3,36 dk, kullanıcıların %69,7'si günde 5 dk'nın altında (Radin 2025, PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435); tam metin). 3 dk kartı yalnız bunu söyler.
- **Kullanılmayanlar:** Zuo 2023 ("dikkat zamanın yarısında dağılıyor"), Colzato 2012 ve Pascoe 2017 (açık izleme), Chu 2023 ("fark ettim" dokunuşu) dosyada var ama ikinci turda doğrulanmadı (benlik §19 başlık notu); metinde ve kartta kullanılmadı.

## 2. Süre modeli, planlayıcı ve sonuç

Model pilotunkidir: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31 sn). **Ders 5 için ölçülmüş süre yok.** Köşeler (hepsi VARSAYIM):

- `hoc`: 4.68 hece/sn, hi duraklama, süre × 1.000. Nefona Hoca önizleme eklemleme hızı 4,68 hece/sn (render/sel/hoc; orkestratör verisi) + yüksek (Hakan v2) duraklama profili. VARSAYIM. Ders 1'deki denetim: aynı model Ders 2'nin ölçülmüş hoc kliplerinden %3,6 uzun (ölçülen/model 0,965; 110 ortak klip) → muhafazakâr.
- `hoc-lo`: 4.68 hece/sn, lo duraklama, süre × 1.000. aynı hız, düşük duraklama profili. VARSAYIM. Ders 2'nin ölçülmüş hoc kliplerine en yakın model (ölçülen/model 0,990, 110 ortak klip).
- `nes`: 5.60 hece/sn, hi duraklama, süre × 1.109. Neslihan'ın Ders 2'de ölçülmüş süreleri: ölçülen/model(5,6 yüksek) = 1,109 (110 ortak klip; v3/calc/measure.py). VARSAYIM: Ders 5 metnine aynı oranla taşındı.

Denetimler: pilot `check_plan` (toplam ±1 sn; kapaklar eksiksiz; sessizlik sınırları; son 60 sn; P1 bloklar; anahtar cümle sırası, kısalması ve aralığı; kapanış ritüeli; pencere duyurusu, kapı ve karşılama; blokta ≥ 5 sn ve planda ≥ 8 sn sessizlik; dolgu sözcükleri; klip ≤ 15 sn; 60 sn'de ≤ 150 hece ve ≤ %60 konuşma; Derin evre sınırları; duyurusuz sessiz 60 sn yok; ortalama hece/dk bandı; 10 dk ve üstünde doku koşusu ≤ 300 sn; T1 nefes beklemesi; pencereden önceki 60 sn'de ≥ %10 konuşma; pencere dışı 180 sn'de ≥ %12 konuşma; Derin'de tekdüze boşluk yok; "-(y)abil-" ≤ 3 / 60 sn; art arda ≤ 3 "-abilir"; şafak; blok tabanları; H12; L3-02; L3-03) + Ders 5 ekleri (D5-sessizlik: pencere dışında ≤ 20 sn; D5-pencere: yalnız 15 dk'da, müzik çekilir, sonra çan; D5-kapı; D5-normal; D5-anahtar; D5-nefes-payı; 3 dk'nın PLAN.v3 §A.2 kuralları ve iki kısa odak aralığı; üretim köşesinde boş pay) + önek kuralı (3 ⊆ 5; 5 → 15 her dakika) + T5 + metin denetimi (`lint_text`) ve "Kapanışa geç"in bütün bağlamları (pencere içinde basılması dahil).

| Köşe | 3 dk | 5 dk | 15 dk | 3–15 dk (13 dakika) | Boş pay 3 / 5 dk (min sessizlik) |
|---|---|---|---|---|---|
| hoc | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 19.8 / 43.8 sn |
| hoc-lo | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 23.4 / 32.3 sn |
| nes | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 23.2 / 30.9 sn |

Boş pay tabanı (VARSAYIM): 3 dk'da 10 sn (sure.md §8 önerisi), 5 dk'da 15 sn (pilot T6); yalnız üretim sesinde (hoc, hoc-lo) denetlenir, `nes` bilgi içindir (pilot T6 kalıbı).

**Blok süreleri (Giriş Varış'a dahil) ve çapalar:**

| Sürüm | Çapa (PLAN.v3 §A.2; sure.md §4; PLAN.v2 §B.4) | hoc | hoc-lo | nes |
|---|---|---|---|---|
| 3 dk | A 0:34 · C1 1:38 · K 0:48 | A 0:37 · C1 1:32 · K 0:51 | A 0:37 · C1 1:33 · K 0:50 | A 0:37 · C1 1:33 · K 0:51 |
| 5 dk | A 0:45 · C1 3:00 · K 1:15 | A 0:52 · C1 2:54 · K 1:14 | A 0:47 · C1 3:03 · K 1:10 | A 0:48 · C1 3:03 · K 1:10 |
| 15 dk | A 1:15 · C1 4:00 · C2 4:00 · C3 4:00 · K 1:45 | A 1:34 · C1 3:56 · C2 3:20 · C3 3:51 · K 2:20 | A 1:34 · C1 3:55 · C2 3:17 · C3 3:55 · K 2:19 | A 1:34 · C1 3:56 · C2 3:20 · C3 3:52 · K 2:18 |

Blokların girdiği dakika (hoc): C1 3 dk, C2 8 dk, C3 12 dk. PLAN.v2 §B.4'ün 10 dk çapası C2'yi 10 dk'da tam ister; planlayıcıda C2 8., C3 12. dakikada girer (önek kuralı bir bloğun tabanını ancak sığdığında alır). 15 dk'da Varış ve Kapanış çapadan uzun, C2 kısadır; neden: isteğe bağlı avuçlama Kapanış'a 58 sn ekler (hoc; §7). 15 dk planının durduğu artım: hoc yok (bütün ≤ 15 dk içeriği girdi); hoc-lo yok (bütün ≤ 15 dk içeriği girdi); nes yok (bütün ≤ 15 dk içeriği girdi).

## 3. Metin

Sütunlar: kimlik · kat (Z zorunlu, İ isteğe bağlı + dolum sırası) · metin · sonraki sessizlik min / pref / max sn (pencerede pencere süresi) · not. "↳ 3 dk" satırı aynı kimliğin 3 dk'daki biçimidir (`short`, belowSec 240; metni aynıysa yalnız sessizlik değişir, ayrı ses üretilmez). "3 dk'da yok" = `minTarget 240`. Çok cümleli birim tek TTS isteğidir, cümle sonlarından kesilir; araya uygulamanın cümle arası sessizliği girer (Varış 0,6–1,0; Derinleşme 0,8–1,3; Derin 1,2–2,5; Kapanış 0,8–1,2 sn). Hiçbir çok cümleli birimde iki nokta üst üste yoktur (SPEC v3.1).

### A · Varış (tek kapak; isteğe bağlılar süreyle eklenir)

Öncelik sabit, çalma sırası 0. Tahmini süre (hoc): en kısa 40 sn, 3/5/15 dk planında 33,1 / 47,9 / 90,1 sn, en uzun 121 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| a.durus | Z | Sırtın dik olsun ama gerilmesin; rahatça oturman yeterli. | 3 / 4 / 8 |  |
| ↳ 3 dk | | Sırtın dik olsun ama gerilmesin. Gözlerini kapatıp kapatmamak sana kalmış. | 3 / 3,5 / 4 | 3 dk: duruş ve gözler tek birimde (PLAN.v3 §A.2, sure.md §3.1); "-(y)abil-" yok |
| a.gozler | Z | Gözlerini kapatmak ya da açık tutmak sana kalmış; açıksa bakışın yere insin. | 4 / 5 / 9 | 3 dk'da yok |
| a.izin | Z | İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin. | 3 / 4 / 8 | ortak çıkış cümlesi; "-(y)abil-" ×3 |
| ↳ 3 dk | | (aynı metin) | 2,5 / 3 / 3,5 | 3 dk: aynı metin, kısa eylem payı |
| a.acilis | Z | Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun. | 5 / 6 / 10 | derse özgü açılış |
| ↳ 3 dk | | (aynı metin) | 5 / 6 / 6,5 | 3 dk: aynı metin, bloğun tek >= 5 sn sessizliği |
| a.dagink | İ 145 | Başta ışık geniş ve dağınık; seslere ve düşüncelere aynı anda vuruyor. | 6 / 7 / 11 | imge yayı 1 |
| a.omuz | İ 255 | Omuzlarını kulaklarından uzaklaştırıp çeneni gevşek bırakıyorsun. | 5 / 6 / 10 |  |
| a.normal | İ 160 | Dikkatin birçok kez dağılacak; bu da pratiğin bir parçası. | 4 / 5 / 9 | başarısızlığı olağan sayar |
| a.karar | İ 355 | Işığı ne kadar sıkı tutacağına sen karar veriyorsun. | 4 / 5 / 9 |  |

### C1 · Nefes çapası: dağıl, fark et, dön

Öncelik P1, çalma sırası 1. Tahmini süre (hoc): en kısa 87 sn, 3/5/15 dk planında 91,7 / 173,7 / 235,6 sn, en uzun 293 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c1.yer | Z | Nefesi en açık burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun? | 5 / 6 / 10 |  |
| ↳ 3 dk | | (aynı metin) | 5 / 5,5 / 7 | 3 dk: aynı metin, eylem payı 5–7 sn |
| c1.nokta | Z | Hangisi olursa olsun, ışığın bugün o noktaya düşüyor. | 3 / 4 / 8 | imge yayı 2; 3 dk'da yok |
| c1.izle | Z | Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun. | 13 / 16 / 20 | nefes payı |
| ↳ 3 dk | | (aynı metin) | 12 / 14 / 17 | 3 dk: aynı metin, nefes payı 12–17 sn |
| c1.his | İ 120 | Nokta burnundaysa, alışta serin, verişte ılık bir hava geçiyor. Göğsünde ya da karnındaysa, orası alışla yükselip verişle iniyor. | 9 / 11 / 15 |  |
| c1.duzeltme | İ 130 | Nefesini düzeltmeye çalışmıyorsun; o kendi hızında geliyor. | 6 / 8 / 12 |  |
| c1.kayma | Z | Birazdan dikkatin bir düşünceye ya da bir sese kayacak; bu çok olağan. | 3 / 4 / 8 | başarısızlığı olağan sayar; açıklama (blokta tek) |
| ↳ 3 dk | | Dikkatin birazdan kayacak; bu çok olağan. | 3 / 4 / 6 | 3 dk: kısa biçim (boş pay ve açılıştaki yoğunluk) |
| c1.donus | Z | Kaydığını fark ettiğinde ışığı nazikçe nefese getiriyorsun. | 4 / 5 / 9 |  |
| c1.aralik1 | Z | Birkaç soluk boyunca ışığı orada tutuyorsun. | 14 / 16 / 20 | nefes payı |
| ↳ 3 dk | | (aynı metin) | 14 / 16 / 18 | 3 dk: aynı metin, aralık 14–18 sn |
| c1.nerede | İ 101 | Işık hâlâ nefeste mi, yoksa başka bir yere mi kaydı? | 4 / 5 / 9 |  |
| c1.getir | İ 101 | Kaydıysa, bir sonraki alışta onu yeniden noktaya getiriyorsun. | 9 / 11 / 15 |  |
| c1.aralik2 | İ 140 | Işık yine noktada; birkaç nefes daha orada kalıyor. | 14 / 16 / 20 | nefes payı |
| c1.dusunce | İ 170 | Bir düşünce gelirse onu itmen gerekmiyor; ışığı usulca geri çeviriyorsun. | 8 / 10 / 14 |  |
| c1.kac | İ 150 | Kaç kez dağıldığın hiç önemli değil; her dönüş değerli. | 6 / 8 / 12 | başarısızlığı olağan sayar |
| c1.aralik3 | İ 285 | Şu an ışığın gideceği başka bir yer yok. | 14 / 16 / 20 | nefes payı |
| c1.anahtar1 | Z | Fark ettiğin an, zaten geri döndün. | 10 / 14 / 18 | anahtar 1 |
| ↳ 3 dk | | (aynı metin) | 12 / 15 / 18 | 3 dk: aynı metin; ardından ikinci kısa aralık (<= 18 sn), sonra Kapanış |

### C2 · Nefes sayma, bir → on (içinden); sonra yalnız verişte

Öncelik P2, çalma sırası 2. Blok giriş sırası (entryRank) 295. Tahmini süre (hoc): en kısa 55 sn, 3/5/15 dk planında 0 / 0 / 199,6 sn, en uzun 242 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c2.giris | Z | Sıradaki bölümde nefeslerini içinden sayıyorsun. | 3 / 4 / 8 | açıklama (blokta tek) |
| c2.nasil | Z | Alışta bir, verişte iki, sonra üç, dört diye ona kadar gidiyorsun. | 3 / 4 / 8 |  |
| c2.bas | Z | Ona varınca yeniden birden başlıyorsun; sayıyı kaybedersen de öyle. | 3 / 4 / 8 | başarısızlığı olağan sayar |
| c2.say1 | Z | Sayıyı bir süre sen sürdürüyorsun. | 16 / 18 / 20 | nefes payı |
| c2.hangi | İ 305 | Hangi sayıda olursan ol, oradan devam ediyorsun. | 14 / 16 / 20 | nefes payı |
| c2.onbir | İ 310 | On bire, on ikiye vardıysan bu da olur; sayı yine birden başlıyor. | 12 / 14 / 18 | başarısızlığı olağan sayar |
| c2.dusunce | İ 320 | Sayıların arasına bir düşünce girerse, bunu fark etmen yeter. | 14 / 16 / 20 | başarısızlığı olağan sayar |
| c2.yonetme | İ 340 | Sayı nefesi yönetmiyor; nefes geliyor, sayı onu izliyor. | 12 / 14 / 18 |  |
| c2.veris | İ 330 | Bu kez yalnız verişleri sayıyorsun; her verişe bir sayı düşüyor. | 4 / 5 / 9 |  |
| c2.veris2 | İ 330 | Alış sessiz geçiyor, sayı verişle geliyor. | 16 / 18 / 20 | nefes payı |
| c2.seyrek | İ 380 | Sayılar seyrekleşiyor; aralarında nefes var, bir de nokta. | 14 / 16 / 20 | imge yayı 2 |
| c2.anahtar2 | Z | Fark ettin; döndün. | 8 / 10 / 14 | anahtar 2 |

### C3 · Uzayan sessiz odak aralıkları (15 → 30 → 45 sn; çanla dönüş)

Öncelik P3, çalma sırası 4. Blok giriş sırası (entryRank) 400. Tahmini süre (hoc): en kısa 97 sn, 3/5/15 dk planında 0 / 0 / 231 sn, en uzun 289 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c3.ad | Z | Bundan sonra yalnızca nokta ve nefes var. | 4 / 5 / 9 | açıklama (blokta tek) |
| c3.parlak | İ 402 | Işık artık küçük ve parlak bir nokta. | 5 / 6 / 10 | imge yayı 2 |
| c3.can | Z | Her sessizliğin sonunda bir çan çalacak. Çanı duyunca ışık noktaya dönüyor. | 3 / 4 / 8 |  |
| c3.kisa | Z | Önce kısa bir sessizlik geliyor. | 14 / 15 / 19 |  |
| c3.d15 | Z | Işığın hâlâ noktada mı? | 5 / 6 / 10 | öncesinde çan |
| c3.kaydiysa | İ 403 | Değilse, bir sonraki nefeste geri getiriyorsun. | 5 / 6 / 10 |  |
| c3.kisa2 | İ 404 | Kısa bir sessizlik daha geliyor. | 15 / 17 / 20 |  |
| c3.d18 | İ 404 | Işığı nefese geri getiriyorsun. | 5 / 6 / 10 | öncesinde çan |
| c3.w30 | Z | Şimdi biraz daha uzun bir sessizlik geliyor. Zorlanırsan gözlerini açman yeterli. Çanla yine seslenirim. | 25 / 30 / 36 | **duyurulu pencere** (kapı: gözleri açmak) |
| c3.d30 | Z | Buradayım. Işık başka bir yere kaydıysa, noktaya geri getiriyorsun. | 5 / 6 / 10 | karşılama; öncesinde çan |
| c3.w45 | İ 410 | Bu kez sessizlik biraz daha uzun. Zorlanırsan ellerini hissetmen de olur. Çanla yine seslenirim. | 40 / 45 / 52 | **duyurulu pencere** (kapı: eller) |
| c3.d45 | İ 410 | Buradayım. Işığın nerede olduğunu fark etmen yeter. | 5 / 6 / 10 | başarısızlığı olağan sayar; karşılama; öncesinde çan |
| c3.anahtar3 | Z | Yine döndün. | 6 / 8 / 12 | anahtar 3 |

### K · Kapanış: dışa dönüş (gündüz, oturarak; isteğe bağlı avuçlama)

Öncelik sabit, çalma sırası 99. Tahmini süre (hoc): en kısa 51 sn, 3/5/15 dk planında 50,9 / 74,2 / 139,5 sn, en uzun 166 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| k.donus | Z | Artık dönüş zamanı. | 3,5 / 3,5 / 5 | öncesinde çan |
| k.nefes | Z | Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor. | 4 / 4 / 6 | imge yayı 3; adım: nefes |
| ↳ 3 dk | | (aynı metin) | 4 / 4 / 4,5 | 3 dk: aynı metin; sessizlik esnemez (Kapanış 0:48) |
| k.sesler | İ 102 | Odadaki sesler de ışığın içine giriyor. | 5 / 5 / 7 | imge yayı 3; adım: sesler |
| k.hareket | Z | Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak. | 7 / 7 / 10 | güvenlik; adım: parmak+gerin; "-(y)abil-" ×1 |
| ↳ 3 dk | | (aynı metin) | 7 / 7 / 7,5 | 3 dk: aynı metin; sessizlik esnemez (Kapanış 0:48) |
| k.avuc1 | İ 420 | Gözlerin kapalıysa, istersen avuçlarını birbirine sürtüp ısıtabilirsin. | 6 / 6 / 8 | adım: avuc; "-(y)abil-" ×1 |
| k.avuc2 | İ 420 | Sonra onları, bastırmadan, gözlerinin üstüne getiriyorsun. | 4 / 4 / 6 | adım: avuc |
| k.avuc3 | İ 420 | Avuçların gözlerine değmesin; kenarları alnına ve elmacık kemiklerine yaslansın. | 6 / 6 / 8 | güvenlik; adım: avuc |
| k.avuc4 | İ 420 | Bu sıcaklığı birkaç nefes boyunca hissediyorsun. | 12 / 12 / 14 | adım: avuc |
| k.avuc5 | İ 420 | Ellerini dizlerine indiriyorsun. | 3 / 3 / 5 | adım: avuc |
| k.goz | Z | Gözlerin kapalıysa, onları acele etmeden açıp çevrene bakıyorsun. | 7 / 7 / 10 | adım: goz+oda |
| ↳ 3 dk | | Gözlerin kapalıysa, açıp çevrene bakıyorsun. | 7 / 7 / 8 | 3 dk: Kapanış 0:48 içinde kalmak için kısa biçim |
| k.oda | İ 108 | Bakışın odada bir renkte ya da bir nesnede bir an duruyor. | 6 / 6 / 8 | adım: oda |
| k.gun | İ 365 | Gün içinde dikkatinin dağıldığını fark ettiğinde, tek bir nefese dönmek yeter. | 4 / 4 / 6 |  |
| k.son | Z | El feneri yine senin elinde. | 6 / 6 / 8 | imge yayı 3; adım: son |

### Ekler: hızlı kapanış, Durdur dönüşü, ilk ders girişi

- **"Kapanışa geç":** PLAN.v3 §D.3: o anki cümle biter; aynı dosyada Kapanış'ın başına, dönüş tınısından önceki sessizliğe 2 sn'lik geçişle atlanır; kapanış kısalmaz. Ders 5'te imge ya da zor blok yok, bu yüzden bırakma ön klibi yok; k.nefes ('Işığı yeniden genişletiyorsun; …') odağı bırakır. Duyurulu bir pencerenin sessizliğinde basılırsa önce çan ve o pencerenin karşılama klibi çalar (pilot S3-01, MT3-07). Aşağıdaki klipler denetim içindir: en kısa Kapanış'ın zorunlu klipleri.
- **Durdur (X) sonrası sesli dönüş** (her derste aynı metin; pilot ders2'den aynen): "Gözlerini aç, etrafına bak, acele etme." · "Uzanıyorsan önce yana dön, sonra otur." · "Birkaç nefes böyle kal; başın dönerse biraz daha bekle."
- **İlk ders girişi** (ayrı dosya, her derste aynı): "Bugün yalnızca tanışıyoruz; zorlanırsan kapanışa geçmen yeterli."

## 4. Sürümler (hoc köşesi: 4,68 hece/sn, yüksek duraklama; `nes` başlangıcı yanında)

Her satır: başlangıç (hoc) · [nes] · blok · metin · ardından sessizlik (hoc, sn). "(3 dk kısa biçimi)" = `short`. Çok cümleli birimde cümle arası sessizlik satırın içindedir.

### 4.1 3 dakika · hoc toplam 180.0 sn, konuşma 68.6 sn (%38), 279 hece, sessizlik kipi pref→max f=0.30 · nes konuşma 65.2 sn

```
  giriş      müzik açılır, 4.3 sn
 0:04.3 [ 0:04.4] A   Sırtın dik olsun ama gerilmesin. Gözlerini kapatıp kapatmamak sana kalmış. (3 dk kısa biçimi)  [3.7]
 0:15.0 [ 0:14.9] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin. (3 dk kısa biçimi)  [3.2]
 0:25.0 [ 0:24.6] A   Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun. (3 dk kısa biçimi)  [6.2]
 0:37.4 [ 0:36.8] C1  Nefesi en açık burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun? (3 dk kısa biçimi)  [6.0]
 0:49.6 [ 0:48.9] C1  Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun. (3 dk kısa biçimi)  [14.9]
 1:09.7 [ 1:09.1] C1  Dikkatin birazdan kayacak; bu çok olağan. (3 dk kısa biçimi)  [4.6]
 1:18.2 [ 1:17.8] C1  Kaydığını fark ettiğinde ışığı nazikçe nefese getiriyorsun.  [6.2]
 1:29.6 [ 1:29.5] C1  Birkaç soluk boyunca ışığı orada tutuyorsun. (3 dk kısa biçimi)  [16.6]
 1:50.2 [ 1:50.1] C1  Fark ettiğin an, zaten geri döndün. (3 dk kısa biçimi)  [15.9]
 2:09.1 [ 2:09.4] K   (çan) Artık dönüş zamanı.  [4.0]
 2:14.9 [ 2:15.3] K   Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor. (3 dk kısa biçimi)  [4.2]
 2:24.6 [ 2:24.8] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak. (3 dk kısa biçimi)  [7.2]
 2:39.3 [ 2:39.2] K   Gözlerin kapalıysa, açıp çevrene bakıyorsun. (3 dk kısa biçimi)  [7.3]
 2:50.7 [ 2:50.6] K   El feneri yine senin elinde.  [6.6]
```

### 4.2 5 dakika · hoc toplam 300.0 sn, konuşma 118.9 sn (%40), 484 hece, sessizlik kipi pref→max f=0.24 · nes konuşma 117.8 sn

```
  giriş      müzik açılır, 4.2 sn
 0:04.2 [ 0:04.0] A   Sırtın dik olsun ama gerilmesin; rahatça oturman yeterli.  [5.0]
 0:14.4 [ 0:13.2] A   Gözlerini kapatmak ya da açık tutmak sana kalmış; açıksa bakışın yere insin.  [6.0]
 0:27.0 [ 0:24.7] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [5.0]
 0:38.9 [ 0:35.4] A   Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun.  [7.0]
 0:52.1 [ 0:47.6] C1  Nefesi en açık burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun?  [7.0]
 1:05.3 [ 0:59.7] C1  Hangisi olursa olsun, ışığın bugün o noktaya düşüyor.  [5.0]
 1:15.2 [ 1:08.6] C1  Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun.  [17.0]
 1:37.4 [ 1:29.7] C1  Nokta burnundaysa, alışta serin, verişte ılık bir hava geçiyor. Göğsünde ya da karnındaysa, orası alışla yükselip verişle iniyor.  [12.0]
 2:02.0 [ 1:52.9] C1  Nefesini düzeltmeye çalışmıyorsun; o kendi hızında geliyor.  [9.0]
 2:16.6 [ 2:06.5] C1  Birazdan dikkatin bir düşünceye ya da bir sese kayacak; bu çok olağan.  [5.0]
 2:27.6 [ 2:16.4] C1  Kaydığını fark ettiğinde ışığı nazikçe nefese getiriyorsun.  [6.0]
 2:38.8 [ 2:26.5] C1  Birkaç soluk boyunca ışığı orada tutuyorsun.  [17.0]
 2:59.7 [ 2:46.4] C1  Işık hâlâ nefeste mi, yoksa başka bir yere mi kaydı?  [6.0]
 3:10.2 [ 2:55.9] C1  Kaydıysa, bir sonraki alışta onu yeniden noktaya getiriyorsun.  [12.0]
 3:27.8 [ 3:33.4] C1  Fark ettiğin an, zaten geri döndün.  [15.0]
 3:45.8 [ 3:50.5] K   (çan) Artık dönüş zamanı.  [3.9]
 3:51.5 [ 3:55.8] K   Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor.  [4.5]
 4:01.6 [ 4:05.3] K   Odadaki sesler de ışığın içine giriyor.  [5.5]
 4:10.8 [ 4:13.9] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.  [7.7]
 4:26.0 [ 4:28.1] K   Gözlerin kapalıysa, onları acele etmeden açıp çevrene bakıyorsun.  [7.7]
 4:39.8 [ 4:41.0] K   Bakışın odada bir renkte ya da bir nesnede bir an duruyor.  [6.5]
 4:50.9 [ 4:51.4] K   El feneri yine senin elinde.  [6.5]
```

`nes` köşesinde ayrıca çalan (daha hızlı ses, aynı sürede daha çok içerik): `c1.aralik2`.

### 4.3 15 dakika · hoc toplam 900.0 sn, konuşma 307.6 sn (%34), 1240 hece, sessizlik kipi pref→max f=0.05 · nes konuşma 292.9 sn

```
  giriş      müzik açılır, 4.0 sn
 0:04.0 [ 0:04.1] A   Sırtın dik olsun ama gerilmesin; rahatça oturman yeterli.  [4.2]
 0:13.4 [ 0:13.5] A   Gözlerini kapatmak ya da açık tutmak sana kalmış; açıksa bakışın yere insin.  [5.2]
 0:25.3 [ 0:25.3] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [4.2]
 0:36.3 [ 0:36.3] A   Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun.  [6.2]
 0:48.8 [ 0:48.7] A   Başta ışık geniş ve dağınık; seslere ve düşüncelere aynı anda vuruyor.  [7.2]
 1:02.4 [ 1:02.3] A   Omuzlarını kulaklarından uzaklaştırıp çeneni gevşek bırakıyorsun.  [6.2]
 1:14.3 [ 1:14.0] A   Dikkatin birçok kez dağılacak; bu da pratiğin bir parçası.  [5.2]
 1:24.4 [ 1:24.2] A   Işığı ne kadar sıkı tutacağına sen karar veriyorsun.  [5.2]
 1:34.2 [ 1:34.0] C1  Nefesi en açık burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun?  [6.2]
 1:46.6 [ 1:46.4] C1  Hangisi olursa olsun, ışığın bugün o noktaya düşüyor.  [4.2]
 1:55.7 [ 1:55.5] C1  Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun.  [16.2]
 2:17.1 [ 2:16.9] C1  Nokta burnundaysa, alışta serin, verişte ılık bir hava geçiyor. Göğsünde ya da karnındaysa, orası alışla yükselip verişle iniyor.  [11.2]
 2:40.9 [ 2:40.4] C1  Nefesini düzeltmeye çalışmıyorsun; o kendi hızında geliyor.  [8.2]
 2:54.7 [ 2:54.2] C1  Birazdan dikkatin bir düşünceye ya da bir sese kayacak; bu çok olağan.  [4.2]
 3:04.9 [ 3:04.4] C1  Kaydığını fark ettiğinde ışığı nazikçe nefese getiriyorsun.  [5.2]
 3:15.3 [ 3:14.8] C1  Birkaç soluk boyunca ışığı orada tutuyorsun.  [16.2]
 3:35.4 [ 3:34.9] C1  Işık hâlâ nefeste mi, yoksa başka bir yere mi kaydı?  [5.2]
 3:45.2 [ 3:44.7] C1  Kaydıysa, bir sonraki alışta onu yeniden noktaya getiriyorsun.  [11.2]
 4:01.9 [ 4:01.5] C1  Işık yine noktada; birkaç nefes daha orada kalıyor.  [16.2]
 4:23.1 [ 4:22.7] C1  Bir düşünce gelirse onu itmen gerekmiyor; ışığı usulca geri çeviriyorsun.  [10.2]
 4:40.2 [ 4:39.7] C1  Kaç kez dağıldığın hiç önemli değil; her dönüş değerli.  [8.2]
 4:53.1 [ 4:52.7] C1  Şu an ışığın gideceği başka bir yer yok.  [16.2]
 5:12.6 [ 5:12.2] C1  Fark ettiğin an, zaten geri döndün.  [14.2]
 5:29.8 [ 5:29.6] C2  Sıradaki bölümde nefeslerini içinden sayıyorsun.  [4.2]
 5:38.4 [ 5:38.2] C2  Alışta bir, verişte iki, sonra üç, dört diye ona kadar gidiyorsun.  [4.2]
 5:48.9 [ 5:48.8] C2  Ona varınca yeniden birden başlıyorsun; sayıyı kaybedersen de öyle.  [4.2]
 5:59.1 [ 5:59.0] C2  Sayıyı bir süre sen sürdürüyorsun.  [18.1]
 6:20.1 [ 6:19.9] C2  Hangi sayıda olursan ol, oradan devam ediyorsun.  [16.2]
 6:40.8 [ 6:40.7] C2  On bire, on ikiye vardıysan bu da olur; sayı yine birden başlıyor.  [14.2]
 7:01.2 [ 7:01.1] C2  Sayıların arasına bir düşünce girerse, bunu fark etmen yeter.  [16.2]
 7:22.8 [ 7:22.7] C2  Sayı nefesi yönetmiyor; nefes geliyor, sayı onu izliyor.  [14.2]
 7:42.7 [ 7:42.7] C2  Bu kez yalnız verişleri sayıyorsun; her verişe bir sayı düşüyor.  [5.2]
 7:53.5 [ 7:53.5] C2  Alış sessiz geçiyor, sayı verişle geliyor.  [18.1]
 8:15.5 [ 8:15.5] C2  Sayılar seyrekleşiyor; aralarında nefes var, bir de nokta.  [16.2]
 8:37.3 [ 8:37.3] C2  Fark ettin; döndün.  [10.2]
 8:49.4 [ 8:49.8] C3  Bundan sonra yalnızca nokta ve nefes var.  [5.2]
 8:57.7 [ 8:58.1] C3  Işık artık küçük ve parlak bir nokta.  [6.2]
 9:06.7 [ 9:07.3] C3  Her sessizliğin sonunda bir çan çalacak. Çanı duyunca ışık noktaya dönüyor.  [4.2]
 9:18.9 [ 9:19.5] C3  Önce kısa bir sessizlik geliyor.  [15.2]
 9:36.8 [ 9:37.4] C3  (çan) Işığın hâlâ noktada mı?  [6.2]
 9:45.2 [ 9:46.0] C3  Değilse, bir sonraki nefeste geri getiriyorsun.  [6.2]
 9:55.7 [ 9:56.6] C3  Kısa bir sessizlik daha geliyor.  [17.1]
10:15.5 [10:16.4] C3  (çan) Işığı nefese geri getiriyorsun.  [6.2]
10:24.8 [10:25.8] C3  Şimdi biraz daha uzun bir sessizlik geliyor. Zorlanırsan gözlerini açman yeterli. Çanla yine seslenirim.  [30.3 PENCERE]
11:07.3 [11:08.4] C3  (çan) Buradayım. Işık başka bir yere kaydıysa, noktaya geri getiriyorsun.  [6.2]
11:21.5 [11:22.6] C3  Bu kez sessizlik biraz daha uzun. Zorlanırsan ellerini hissetmen de olur. Çanla yine seslenirim.  [45.3 PENCERE]
12:18.4 [12:19.7] C3  (çan) Buradayım. Işığın nerede olduğunu fark etmen yeter.  [6.2]
12:31.1 [12:32.4] C3  Yine döndün.  [8.2]
12:40.5 [12:42.0] K   (çan) Artık dönüş zamanı.  [3.6]
12:45.8 [12:47.4] K   Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor.  [4.1]
12:55.5 [12:57.0] K   Odadaki sesler de ışığın içine giriyor.  [5.1]
13:04.4 [13:05.7] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.  [7.1]
13:19.0 [13:20.2] K   Gözlerin kapalıysa, istersen avuçlarını birbirine sürtüp ısıtabilirsin.  [6.1]
13:31.6 [13:32.5] K   Sonra onları, bastırmadan, gözlerinin üstüne getiriyorsun.  [4.1]
13:41.2 [13:42.1] K   Avuçların gözlerine değmesin; kenarları alnına ve elmacık kemiklerine yaslansın.  [6.1]
13:54.6 [13:55.3] K   Bu sıcaklığı birkaç nefes boyunca hissediyorsun.  [12.1]
14:10.7 [14:11.2] K   Ellerini dizlerine indiriyorsun.  [3.1]
14:16.9 [14:17.3] K   Gözlerin kapalıysa, onları acele etmeden açıp çevrene bakıyorsun.  [7.1]
14:30.0 [14:30.4] K   Bakışın odada bir renkte ya da bir nesnede bir an duruyor.  [6.1]
14:40.7 [14:40.9] K   Gün içinde dikkatinin dağıldığını fark ettiğinde, tek bir nefese dönmek yeter.  [4.1]
14:51.2 [14:51.3] K   El feneri yine senin elinde.  [6.1]
```

## 5. Denetim listeleri (model ilk denetimi; insan ya da yedek inceleme değildir)

### 5.1 PLAN.v3 §A.2: 3 dakikanın 12 kuralı

| Kural | Durum | Kanıt (hoc 3 dk planı) |
|---|---|---|
| 1 Yalnız oturarak | evet | posture = seated; kapanışta yana dönme, oturma, kalkma adımı yok |
| 2 Kapaklar kendi kısa metinleriyle | evet | `a.durus` (duruş + gözler tek birim) ve `k.goz` kısa metinli; `a.izin`, `a.acilis`, `k.nefes`, `k.hareket` kısa sessizlikli; `a.gozler`, `c1.nokta` minTarget 240; Kapanış sessizlikleri min = pref |
| 3 Zaman verir; nefes payı 12–20 sn; > 20 sn sessizlik yok | evet | `c1.izle` sonrası 14.9 sn; en uzun sessizlik 16.6 sn; pencere yok |
| 4 Tabanlar (çekirdek ≥ 0:55) | evet | C1 1:32 |
| 5 Anahtar cümle bir kez; başarısızlığı olağan sayan cümle | evet | `c1.anahtar1` bir kez; "Dikkatin birazdan kayacak; bu çok olağan." |
| 6 "-(y)abil-" | evet | derse özgü açılış "-(y)abil-"siz; `a.izin`'den sonraki 60 sn'de başka yok; Kapanış'ta 1 (`k.hareket`) |
| 7 Son 60 sn | evet | yeni imge, tutma, zor blok yok; çekirdeğin son klibi anahtar cümle |
| 8 Şafak 45 sn | evet | `k.donus` bitişe 51 sn kala başlar |
| 9 Zor blok yok | evet | Ders 5'te zor blok yok |
| 10 Alt küme | evet | 3 ⊆ 5 denetimi üç köşede; bilgi: hoc: 3 ⊆ 4: evet; 4 ⊆ 5: evet | hoc-lo: 3 ⊆ 4: evet; 4 ⊆ 5: evet | nes: 3 ⊆ 4: evet; 4 ⊆ 5: evet |
| 11 Müzik: iki doku geçişi, aynı tema | evet | geniş ton → daralan ton (`c1.yer`) → genişleyen ton (`k.donus`) |
| 12 Kartta 3 dk'ya özgü etki cümlesi yok | evet | `evidenceByVersion["3"]` |
| A.1 çekirdeği: iki kısa sessiz odak aralığı (≤ 18 sn) ve anahtar cümle | evet | `c1.aralik1` sonrası 16.6 sn, `c1.anahtar1` sonrası 15.9 sn |

İskelet: giriş 4.3 sn · Varış 0:33 · çekirdek 1:32 · Kapanış 0:51 (hedef 0:04 / 0:30 / 1:38 / 0:48). Varış ve Kapanış hedefi birkaç saniye aşar: Varış'ın üç birimi (duruş ve gözler, ortak çıkış cümlesi, derse özgü açılış) en kısa sessizliklerle 30.4 sn tutar; Kapanış'ın beş zorunlu adımının konuşması 21.7 sn'dir ve sessizlikleri sıkıştırılmaz.

### 5.2 Usta hoca ölçütleri (PLAN.v2 §E.6, 18 madde; model ilk işareti)

| Ölçüt | Durum | Gerekçe |
|---|---|---|
| 1 Zaman verir | evet | her yönergeden sonra eylem süresi + ≥ 2 sn; çekirdek blok her sürümde ≥ 0:55 (denetim) |
| 2 Sessizliği kullanır | evet | her blokta ≥ 5 sn; 3 dk'da en uzun ≥ 12 sn, 5 dk'da ≥ 16 sn (denetim) |
| 3 Sessizliği korur | evet | pencereler duyurulu, kapılı ve çanla karşılanıyor; pencere dışında ≤ 20 sn |
| 4 Somut beden dili | evet | burun, göğüs, karın, serin ve ılık hava, yükselip inme, omuz, çene, avuç, alın, elmacık kemiği, sıcaklık; "enerji" yok |
| 5 Tutarlı yön | uygulanmaz | beden dolaşımı yok |
| 6 Dolgu yok | evet | dolgu denetimi her planda geçti ("şimdi" yalnız açılışta ve `c3.w30`'da) |
| 7 Anlatmaz, yaşatır | evet | blok başına tek açıklama (`c1.kayma`, `c2.giris`, `c3.ad`) |
| 8 Tek imge yayı | evet | el feneri ışığı (§1.4) |
| 9 Davet dili | evet (bir not) | emir kipi yalnız güvenlikte ("bırak"); beden yönergelerinde şimdiki zaman, "-mek yeterli", "sana kalmış" ve istek kipi ("insin", "değmesin", "yaslansın"); karar Türkçe editör yedeğinin |
| 10 Başarısızlığı normalleştirir | evet | `c1.kayma`, `a.normal`, `c1.kac`, `c2.bas`, `c2.onbir`, `c2.dusunce`, `c3.d45` |
| 11 Çıkış kapısı | evet | açılış cümlesi her sürümde; iki pencere duyurusunda kapı; 30 dk'da ortada `BR.orta` (iskelet); zor blok yok |
| 12 Kapanış ritüeli | evet | oturarak gündüz: nefes → parmaklar → gerinme → [avuçlama] → gözler → oda |
| 13 Azalan anlatım | evet | boşluklar uzuyor (eylem payı → nefes payı → 30 ve 45 sn pencere), cümleler kısalıyor (H12 geçti), seviye evreyle alçalıyor; Kapanış'ta geri çıkış |
| 14 Doğal hız | açık | ses yok; üretimde ölçülür |
| 15 Ses–müzik | açık | ses yok; karışımda ölçülür (SPEC v3.4); çan ≥ 6 dB konuşmanın altında (VARSAYIM) |
| 16 Kusursuz Türkçe | açık | model okuması yapıldı; iki bağımsız model incelemesi ve Scribe geri çevirisi bekliyor |
| 17 Benzersizlik | evet | §1.5 |
| 18 Yasak liste ve güvenlik | evet | lint GEÇTİ; §5.3 |

### 5.3 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)

| Kural | Durum | Not |
|---|---|---|
| 1 Davet | evet | bkz. E.6 #9 |
| 2 Gözler açık seçeneği | evet | Varış'ta her sürümde (`a.durus` kısa biçimi ya da `a.gozler`), `a.izin`; uzun sessizlikten önce `c3.w30`'da yeniden |
| 3 "İstediğin an…" | evet | açılışta; 30 dk'da ortada (iskelet `BR.orta`) |
| 4 Kontrol kişide | evet | `a.karar` ("Işığı ne kadar sıkı tutacağına sen karar veriyorsun."); yasak ifade yok |
| 5 Gevşeme zorunlu değil; huzursuzluk normal | evet | dersin özü: dağılmak olağan (`c1.kayma` her sürümde) |
| 6 Önce doğal nefes | evet | `c1.izle` her sürümde; nefes hiç değiştirilmez; "derin nefes al" yok |
| 7 Tutma | evet | hiç yok |
| 8 Dayanak ve kapı | evet | zor bölüm yok; pencerelerde kapı: gözleri açmak (`c3.w30`), elleri hissetmek (`c3.w45`) |
| 9 Beden taraması | uygulanmaz | yok; nokta seçimi (burun, göğüs, karın) kişiye bırakılır |
| 10 İmge seçimli | evet | imgede su, derinlik, kapalı alan, yükseklik ya da karanlık yok; seçim gerekmez |
| 11 Anı arama yok | evet |  |
| 12 Öz-şefkat | uygulanmaz |  |
| 13 Sağlık iddiası yok | evet | lint (PLAN.v2 §C.6 + E12); kart "Bu ders bir sonuç vaadi taşımaz." |
| 14 Gündüz dersi dönüşle biter | evet | oturarak: yana dönme ve kalkma yok |
| 15 Uyku izni | uygulanmaz |  |
| 16 Sessizlik rehberli | evet | her pencerede süre ve dönüş söylenir ("Çanla yine seslenirim."); kısa aralıklarda "Önce kısa bir sessizlik geliyor.", "Sayıyı bir süre sen sürdürüyorsun." |
| 17 Hareket hafif | evet | `k.hareket`: "ağrı ya da baş dönmesi olursa bırak"; avuçlama bastırmadan |
| 18 Tıbbi uyarı kartta | evet | açılış ekranında "Gözlerin yorulursa kapatman ya da kırpman yeterli."; derste durum adı yok |

### 5.4 "-(y)abil-" ve yasak sözcükler

"-(y)abil-" taşıyan birimler: `a.izin`, `k.hareket`, `k.avuc1`. Herhangi bir 60 sn'de en çok 3 ve art arda en çok 3 "-abilir" cümlesi her planda denetlendi; 3 dk'da `a.izin`'den sonraki 60 sn'de başka yok, Kapanış'ta bir (`k.hareket`). Yasak sözcük ve iddia listesi (PLAN.v2 §C.6 + pilot E12), İngilizce, Sanskritçe (≤ 15 dk'da hiç yok; "drişti" 30 dk'da bir kez), cümle başına ≤ 14 sözcük, birim başına 1–3 cümle, iki nokta üst üste (yok), üç nokta (yok): `timing.txt` "Metin denetimi" GEÇTİ.

## 6. Üretim notları (seslendirme ve müzik; bu adımda yapılmadı)

- Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`), `eleven_v4`, birim başına 3 çekim, Scribe birebir (SPEC.v3 §2–§6).
- İstekler: 61 birim + 3 ayrı metinli kısa biçim = **64 istek, 3592 karakter**. SPEC.v3 §15.2 fiyatıyla (0,99989 kredi / karakter / çekim, 3 çekim) ≈ **10.775 kredi** (tahmin; yeniden çekimler ve Scribe hariç). Aynı metinli kısa biçimler (yalnız sessizlik değişir, ayrı ses gerekmez): `a.izin`, `a.acilis`, `c1.yer`, `c1.izle`, `c1.aralik1`, `c1.anahtar1`, `k.nefes`, `k.hareket`. Ortak yardımcılar (Durdur dönüşü, ilk ders girişi; her derste aynı, bir kez üretilir): 4 istek, 196 karakter.
- Çok cümleli birimler (6; cümle sonlarından kesilir, iki nokta yok): `c1.his`, `c3.can`, `c3.w30`, `c3.d30`, `c3.w45`, `c3.d45`. En uzun üç cümleli birimler pencere duyurularıdır (`c3.w30`, `c3.w45`); kesimde "en uzun N−1 duraklama" kuralı cümle sonlarına düşmelidir (SPEC.v3 §4).
- Scribe'da dikkat: "hâlâ" (düzeltme işaretli) ve "ona kadar" (sayı) yazımı; "On bire, on ikiye" sayıları sözcükle yazıldı (PLAN.v2 §C.7).
- **Müzik (A = ElevenLabs Music) istem önerisi**, SPEC.v3 §7.1 kalıbıyla (zorunlu son cümle eklenir): `varis` "Ambient meditation tone in G: a single soft, sustained, almost sine-like tone with one quiet upper partial, no melody, no chord changes, barely moving." · `derin` "The same single sustained sine-like tone in G, thinner and quieter, one partial only, no movement." · `kapanis` "The same sustained tone in G slowly opening into a warm, soft, long-held G major chord." Ton ölçülür (ElevenLabs istenen tonu tutmuyor; SPEC.v3 §7.1); aile kuralı aynen. Saf ton ElevenLabs'te temiz çıkmazsa ton yerel sentezle üretilir (açık karar, §7).
- **Çan:** tek vuruşlu, yumuşak saldırılı (≥ 30 ms), uyumsuz kısmi sesli kısa çan; pilotta dönüş tınısı yerel sentezdi (ElevenLabs tınısı "kaba" ölçüldü; SPEC.v3 §7.1). Öneri: aynı yol, Sol ailesinde (VARSAYIM). Çan `returnTone:-2s` ipucu taşıyan her klipten 2 sn önce ve `k.donus`'tan 2 sn önce çalar.
- **Pencere müziği:** pilotun karıştırıcısı pencerede yatağı +6 dB kabartır; Ders 5'te −6 dB çekilir (`music.windowBedAboveDuckDb = −6`, rampa 1 dB/sn). `mix.py`'de pencere yönü parametresi gerekir (açık iş).
- Kulak denetimi listesi (insan kulağı; Scribe yakalayamaz):
  - D5-01: çan sessizlikten sonra ürkütüyor mu? Tek vuruş, yumuşak saldırı, konuşmanın en az 6 dB altında; kör dinlemede "irkildim" diyen olursa çan yumuşatılır
  - D5-02: pencerede müziğin çekilmesi "ses kesildi, bir şey bozuldu" diye algılanıyor mu? Duyuru ("Çanla yine seslenirim.") bunu karşılıyor mu
  - D5-03: metafor ışığı ile gerçek ışık karışıyor mu ("Işığın hâlâ noktada mı?"); gözleri açık dinleyen soruyu yanlış anlıyor mu
  - D5-04: "ona kadar" (sayı) ile "ona" (zamir) ve "On bire, on ikiye" söyleyişi; "Hâlâ" düzeltme işaretiyle (hala değil) okunuyor mu
  - D5-05: "Fark ettin; döndün." ve "Yine döndün." bağlamında doğal mı; "başım döndü" çağrışımı var mı
  - D5-06: avuçlama yönergesi (k.avuc1–4) kulakla izlenebiliyor mu; göze dokunma ya da bastırma algısı doğuruyor mu
  - D5-07: sessiz sayma bölümünde (C2) 16–20 sn'lik nefes payları uzun mu, kısa mı; dinleyici sayıyı sürdürebiliyor mu

## 7. VARSAYIM'lar, açık noktalar ve kendi gördüğüm zayıf yerler

1. **Ses yok, süreler tahmin.** Nefona Hoca köşesi önizleme hızına (4,68) dayanır; Ders 1'deki denetimde aynı model Ders 2'nin ölçülmüş hoc kliplerinden yüksek duraklamayla %3,6, düşük duraklamayla %1 uzun çıktı. Ders 5 ölçülünce bütün planlar yeniden kurulur.
2. **3 dk'nın boş payı hoc köşesinde 19.8 sn** (taban 10 sn, VARSAYIM). Sarsıntı taraması (bütün klip süreleri × ölçek, hoc köşesi, 3–15 dk): × 0,9: kalan 11 dk (60 sn penceresinde 152 hece > 150); × 0,95: hepsi geçiyor; × 1,05: hepsi geçiyor; × 1,1: kalan 4 dk (şafak 55 sn < 60 (k.donus sonu çok yakın)). 3 dk'nın açılışı en yoğun yerdir (en yoğun 60 sn: 127 hece, %51 konuşma; tavan 150 ve %60); süreler %5 uzadığında da tavanın altında kalsın diye `c1.nokta` 3 dk'dan çıkarıldı ve `c1.kayma` kısa biçimle söylenir; imge adımını açılış cümlesi ve `c1.izle` ("o noktadaki") taşır.
3. **3 dk iskeletten birkaç saniye sapıyor:** Varış 0:37 (hedef 0:34, giriş dahil), çekirdek 1:32 (1:38), Kapanış 0:51 (0:48). Toplam tam 3:00 ve bütün kurallar tutuyor; çekirdeğin payını artırmak Varış'ın açılış yoğunluğunu (60 sn'de ≤ %60 konuşma) sınıra dayıyordu.
4. **15 dk dağılımı çapadan sapıyor (hoc):** Varış 1:34 ve Kapanış 2:20 çapadan (1:15, 1:45) uzun, C2 3:20 çapadan (4:00) kısa; C1 3:56, C3 3:51. Neden: isteğe bağlı avuçlama Kapanış'a 58 sn ekliyor. Avuçlama yalnız 30 dk'ya bırakılırsa ilk yayında hiç duyulmaz; bu yüzden 15 dk'ya kondu (dolum sırası 420, C3'ten sonra). Karar usta hoca yedeğinin.
5. **15 dk'da ikinci aşamaya pay dar:** hoc köşesinde hedef ile pref sessizliklerle toplam arası 10.3 sn. İkinci aşamanın ilk artımı (sıra ≥ 500) bundan büyük ve esneme kuralını (T5) da aşacak kadar uzun olmalı (öneri: BR.orta + C4 tabanı, ≈ 1,5 dk); aksi halde 15 dk dosyası değişir (`iskelet30.md` §2).
6. **Pencerede müziğin çekilmesi** pilot karıştırıcısında yok (pilot +6 dB kabartıyordu). Kör dinlemede "ses kesildi" diye algılanma riski var (D5-02); duyuru "Çanla yine seslenirim." bunu karşılamak için.
7. **Çan üretimi açık:** ElevenLabs Music tek vuruşu yerleştiremez; pilotun dönüş tınısı gibi yerel sentez önerildi. Sahibin "müzik A = ElevenLabs Music" kararının çanı ve sürekli tonu kapsayıp kapsamadığı orkestratöre sorulmalı.
8. **Metafor ışığı** ("Işığın hâlâ noktada mı?") gözleri açık dinleyende gerçek ışıkla karışabilir (D5-03). Açılış imgeyi "dikkatin bir el feneri gibi" diye kurduğu için risk düşük; kulakta sınanmalı.
9. **Anahtar cümlenin 3. biçimi değişti** ("Döndün…" → "Yine döndün."; §1.3). PLAN.v2 §A.2.1'den sapma; Türkçe editör yedeğinin onayına gider.
10. **"Ona kadar"** yazımda zamirle aynıdır ("ona"); bağlam net ama TTS vurgusu ve Scribe denetimi izlenmeli (D5-04).
11. **Sessiz sayma (C2)** dinleyiciye bırakılıyor; 16–20 sn'lik nefes paylarında sayıyı sürdürmek kişiden kişiye değişir (D5-07). Sesli sayım bilinçli olarak yok (§1.2); pilot dinlemede eksik bulunursa ikinci aşamada ilk turu sesle eşlik eden bir seçenek düşünülebilir.
12. **Emir ve istek kipi:** "bırak" (güvenlik), "insin", "değmesin", "yaslansın" (bedensel yönerge) davet dilinin sınırında (E.6 #9); karar Türkçe editör ve usta hoca yedeğinin.
13. **`a.gozler`** Ders 1 ve 2'nin göz cümlesiyle aynı kalıpta; ortak ritüel sayıldı, benzersizlik ölçütüne girmez.
14. **"dön" yankısı:** anahtar cümlelerin son geçişinden ("…geri döndün.", "Yine döndün.") hemen sonra ortak kapanış cümlesi "Artık dönüş zamanı." gelir. Anlamca tutarlı (dönüş dersin fikri), ama kulakta tekrar gibi duyulursa `k.donus` yerine bu derse özgü bir dönüş cümlesi yazılır (Türkçe editör yedeğinin kararı).
15. **İnceleme yok:** PLAN.v3 §E.1'in Türkçe editör ve usta hoca onayları (karar 2 yedeği: iki bağımsız model incelemesi) ve sahibin kulağı henüz yok; metin seslendirilmeden önce bu iki incelemeden geçmeli.

## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI'ler https://doi.org/ önekiyle açılır)

- Mrazek 2012 (Emotion; Çalışma 2: 8 dk farkındalıkla nefes, bir dikkat görevinde zihin gezinmesinin davranışsal göstergelerini pasif gevşemeye ve okumaya göre azalttı) — PMID 22309719, DOI [10.1037/a0026678](https://doi.org/10.1037/a0026678) (benlik (C04))
- Norris 2018 (2 çalışma; acemilerde 10 dk meditasyon kaydı kontrol kaydına göre dikkat görevlerinde daha iyi sonuçla birlikte gitti; yazarlar "bazı acemilerde" diye sınırlıyor; nevrotizm ayrımı yalnız ERP için) — PMID 30127731, DOI [10.3389/fnhum.2018.00315](https://doi.org/10.3389/fnhum.2018.00315) (benlik (C05))
- Whitfield 2021 (56 çalışma, 45'i meta-analizde, n=2238; nesnel bilişte g=0,15; etkisiz karşılaştırmalardan üstün, aktif karşılaştırmalardan değil) — PMID 34350544, DOI [10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y) (benlik (C39))
- Feruglio 2021 (24 çalışma; önce-sonra çalışmalarının çoğunda en az 2 hafta pratikten sonra zihin gezinmesi azaldı) — PMID 34560133, DOI [10.1016/j.neubiorev.2021.09.032](https://doi.org/10.1016/j.neubiorev.2021.09.032) (benlik (C40))
- Bernardi 2006 (n=24; rastgele eklenen 2 dk sessizlik kalp hızını, kan basıncını ve dakika ventilasyonunu başlangıç düzeyinin altına indirdi) → sessiz odak aralıklarında müzik çekilir — PMID 16199412, DOI [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600) (sakin)
- Toussaint 2021 (RKÇ, n=60; derin nefes grubunda fizyolojik uyarılma önce arttı) → ders nefesi değiştirmeden izletir, 'derin nefes al' demez — PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040) (sakin, güvenlik)
- Luu 2024 (travma-duyarlı YN'nin 10 bileşeni; uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş; kavramsal) — PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021) (sakin, güvenlik)
- Howard 2017 (klinik yorum ve 3 vaka; uyandırma başarısızlığı istenmeyen etkilerde önemli) — PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281) (güvenlik)
- Cramer 2013 (vaka raporları) → her harekette 'ağrı ya da baş dönmesi olursa bırak' (güvenlik §11.B-17) — PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515) (güvenlik)
- Radin 2025 (RKÇ, n=1458; tam metin: meditasyona özgü kullanım ortalama 3,36 dk/gün, kullanıcıların %69,7'si günde 5 dk'nın altında) — PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435) (benlik (C09))
- Schumer 2018 (65 RKÇ, n=5489; kısa farkındalık eğitimi olumsuz duygulanımda g=0,21; yayın yanlılığı düzeltilince g=0,04) — PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324) (benlik (C02), sakin)

