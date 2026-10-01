# Nefona · Özellik envanteri ve siteye giriş zamanı

Tarih: 2026-09-30. Kapsam: uygulamada bugün olan ve planlanan, kullanıcının gördüğü her özellik; her birinin durumu,
kanıtı ve nefona.com'a ne zaman girebileceği. Salt okunur çalışıldı: depoda hiçbir dosya değişmedi, test ve derleme
koşulmadı, git yalnız okundu (`HEAD` = `70ca7d5`). `app/src` altındaki kaydedilmemiş değişiklikler (TodayPath, Breath,
Home, stiller, yeni `DayChain.jsx`) başka bir iş akışına ait; envanterde yalnız "süren iş" diye anılır.

Dosya yolları depo köküne (`/home/user/eyes`) göredir.

## Okuma anahtarı

**Durum** (projenin kendi işaretleri, `docs/yol-haritasi/YAPILACAKLAR.md:8-9`):
- `[x] cihaz`: cihazda doğrulandı (sahibin cihaz raporu ya da `HATA_GUNLUGU` kaydı var).
- `[~] TF`: TestFlight'a girdi, cihazda doğrulanmadı ya da yalnız bir kısmı doğrulandı. Tamamlanmış sayılmaz.
- `[~] kod`: depoda kodu var, TestFlight'a girmedi.
- `[ ] plan`: yalnız planda; kod yok.

**TestFlight ölçütü.** Bilinen son TestFlight Build 59'dur ve commit `26419b4`'ten yapılmıştır
(`docs/yol-haritasi/YAPILACAKLAR.md:131`). Bir özelliğin kodu `26419b4`'ün atası ise Build 59'da sayıldı
(`git merge-base --is-ancestor` ile tek tek bakıldı). Sürüm notunda `app/src/lib/releases.js` girdileri şöyle eşleşir:
`2026-09-26`, `-27`, `-28` ve `-29` girdileri Build 59'a kadar çıktı (`2026-09-29` girdisi Build 58'le çıktı,
`docs/yol-haritasi/HATA_GUNLUGU.md:779`); `2026-09-29-2` girdisi "Build 59'dan sonraki TestFlight" içindir ve henüz
gitmedi (`releases.js:9-11`). Yoga ve sonsuz yol için `releases.js`'te hiç madde yok.
VARSAYIM: Build 59'dan sonra yapılmış ama kayda geçmemiş bir TestFlight yoktur (belgelerde ve git günlüğünde iz yok).

**Siteye giriş kapısı.** Sahibin sözü "modüller bittikten sonra görerek düzeltmen gerekiyor" ve projenin "bitti"
tanımı (`SONSUZ_YOL.PLAN.v1.md` §3.H: cihazda doğrulanmadan `[x]` yok) birlikte okununca bir özellik siteye şu üç
koşulla girer:
- **K1**: özellik bir TestFlight derlemesinde.
- **K2**: cihaz listesi bitti ve sahip cihazda baktı (`[x]`).
- **K3**: sitedeki ekran görüntüsü o derlemeden çekilir; cümle metin kapısından ve 5 saniye sınamasından geçer; bilimsel
  cümlenin kaynağı `app/src/lib/sources.js`'te PMID ve DOI ile durur (site kaynakçayı oradan üretir,
  `site/scripts/data.mjs:12-13`).

Zaten sitede olan ama K2'yi geçmemiş özellik için tabloda "sitede kalır; doğrulanmamış cümle çıkar" yazar.

## 1. Tablo

### 1.1 Sahibin saydığı yeni işler: yoga, sonsuz yol, alarm, hava

| Özellik | Durum | Kanıt | Siteye ne zaman girebilir |
|---|---|---|---|
| **Yoga · ilk bölüm** (Ders 1 Nefesin Ritmi, Ders 2 Derin Dinlenme, Ders 3 Uykuya Geçiş, Ders 5 Tek Nokta) | `[~] kod`. Uygulamada yalnız **Ders 2 · 15 dk** yayımlı; öteki 10 ders sürümünün sesi hazır, uygulamaya konmadı | Modül `0b076ba`, doğrulama düzeltmeleri `58fa1c1` (ikisi de Build 59'dan sonra). `app/src/lib/yogaLessons.js:134` tek `published: true`; `app/public/yoga/` içinde yalnız `ders2-15.mp3`. Hazır sesler `yoga-pilot/render/out/ilk-bolum/` (Ders 1: 3/5/15, Ders 2: 5/15/20, Ders 3: 5/15 ve müzik kuyruğu, Ders 5: 3/5/15). Sahip dört dersin sesini kabul etti (`yoga-pilot/SAHIP_ISTEKLERI.md` madde 17–18). Kodek testi açık (`yoga-pilot/DEVAM.md`). Swift derlenmedi, cihazda denenmedi (`yoga-pilot/C_KOD_RAPORU.md` §8) | Sesler uygulamaya konup `published` olunca → TestFlight → yoga Kapı 4 (Ders 2 kilitli ekranda) ve Kapı 5 (Ders 1 ve 5, yol durağı) cihazda → yoga kaynakları `lib/sources.js`'e girince (bugün yok, `C_KOD_RAPORU.md` İSTEK tablosu). Sitede yalnız yayımlı dersler sayılır; "10 ders" yazılmaz |
| **Yoga · kalan 6 ders** (4, 6, 7, 8, 9, 10; aralarında Zor Anlar İçin ve Kendine Şefkat) | `[ ] plan` (üretim sırası bekliyor) | Onaylı plan: `yoga-pilot/v3/PLAN.v3.md` (Kapı 5–7: partiler 4-7-8 ve 6-9-10). Sahip kararı: hazır dersler önce, kalanlar arka planda (`yoga-pilot/SAHIP_ISTEKLERI.md` madde 9–10). Psikolog adı yok, yedek kural: Zor Anlar İçin yolda gelmez, Kendine Şefkat yolda yalnız 17.00'den sonra (`SONSUZ_YOL.PLAN.v1.md` §1) | Her ders kendi denetiminden geçip TestFlight'a ve cihaza girdikten sonra, ders ders |
| **Yoga · yol durağı, "Sonra yaparım", sabah sorusu** ("Dün gece uykuya dalmak ne kadar kolaydı?") | `[~] kod` | `app/src/lib/yoga.js`, `lib/pathLater.js`, `components/YogaMorningCard.jsx:38`. Yalnız Ders 2 yayımlıyken yolda durak görünmez; kısa gün 3 dk'lık ders ister (`C_KOD_RAPORU.md` §8). Sabah kartının Ana sayfadaki yeri sahibin kararını bekliyor (`docs/yol-haritasi/tasarim/S0/sorular-kararlar.md` soru 19) | Ders 1 ve 5 yayımlanıp durak cihazda görülünce; sabah kartı soru 19 kararından sonra |
| **Sonsuz yol Y1 · nefes merdiveni** (yolda 1 → 2 → 3 dk, "2 dk daha", mola bandı) | `[~] kod` | `6ea6890` (Build 59'dan sonra). `docs/yol-haritasi/tasarim/Y1_KOD_RAPORU.md`: durum `[~]`, 1854 test yeşil, cihazda denenmedi; üç cümle metin kapısında (§6). Cihaz listesi 14 madde (§5) | Y1 TestFlight'ı ve S2 kapısı (cihazda 1., 2., 4., 9. gün ve eski hesap) geçince, **Y1 sürümüyle aynı gün** (`Y1_KOD_RAPORU.md` §7 son not). Dikkat: sitenin kaynağı bunu şimdiden anlatıyor (§2, bulgu 1) |
| **Sonsuz yol Y1 · günün ritmi** (nefes kalıbı çeşitlemesi; 230 bileşim) | `[~] kod` | `app/src/lib/breathMix.js`; plan "629" diyor, kod ailesine uyan 230'u seçiyor, plan düzeltmesi bekliyor (`Y1_KOD_RAPORU.md` §7 madde 1). Kanıt satırının sınır cümlesi açık (NIT #23) | Y1 ile; sitede sayı yazılacaksa "yüzlerce" ya da 230, 629 değil |
| **Sonsuz yol Y1 · göz merdiveni** (kırpma → sağ–sol → üçü birlikte → yukarı–aşağı → uzağa bakış → yakın–uzak → daire; Daire ile Yukarı–aşağı gün aşırı; açılma eşikleri; "Yeni" rozeti) | `[~] kod` | `app/src/lib/ladders.js`, `lib/progression.js`, `modules/routine/manifest.js`; eşikler VARSAYIM (`SONSUZ_YOL.PLAN.v1.md` §3.J) | Y1 ile, S2 kapısından sonra |
| **Y1 5 saniye turu** (Ana sayfa, yol ve nefes ekranının ilk görünümü) | Süren iş | `70ca7d5` "ara kayıt, tasarım turu sürüyor"; çalışma ağacında kaydedilmemiş değişiklik ve yeni `DayChain.jsx` (başka iş akışı) | Tur bitip Y1'e girince; siteye alınacak Ana sayfa görüntüsü bu turdan sonra çekilir |
| **Sonsuz yol Y2** (Gelişim ölçü kuralı v2, "Yolun" bölümü, okuma testi Göz alanına) | `[ ] plan` | `SONSUZ_YOL.PLAN.v1.md` §3.B, §3.I (S3 kapısı) | Y2 TestFlight ve S3'ten sonra; sitedeki "doğrulanmış değişim" anlatımı o gün yenilenir |
| **Sonsuz yol Y3 · ilk 5 saniye** (giriş alt yazısı, günün cümlesi, sıfır ve kırık serinin gizlenmesi, açılışta logonun kalkması, **sitenin ilk ekranı** "Bu cümleyi okurken kaç kez göz kırptın?") | `[ ] plan` (S0 tasarım taslağı var, sahibe gitmedi) | `SONSUZ_YOL.PLAN.v1.md` §3.F.2, karar 5; S0 taslağı `docs/yol-haritasi/tasarim/S0/ekranlar.html` (`e19d81f`, "sahibe gitmedi"); Pratikler bölümü 5 sn sınamasını geçmedi (`Y3_NOTLAR.md`) | Sitenin ilk ekranı Y3'ün kendi işi: Y3 TestFlight ve S4 kapısıyla aynı gün |
| **Sonsuz yol Y4 · "Günün nasıl geçti"** (beş çizilmiş yüz), **ay evresi**, "Günün" sayfası, kanıt kartları | `[ ] plan`. Kodda ay evresi yok; akşam hâlâ "Bugün kaç saat ekrana baktın?" soruyor | `SONSUZ_YOL.PLAN.v1.md` §3.D, §3.E.3; grep: `app/src` içinde `moon`, `weather`, `WeatherKit` yok; soru `app/src/lib/profileQuestions.js:76` | Y4 TestFlight ve S5'ten sonra. Ay kartındaki "Bilim ne diyor?" yalnız PMID+DOI'li kaynaklarla |
| **Sonsuz yol Y5 · hava durumu, konum, yağmur bildirimi** (WeatherKit) | `[ ] plan`; kod yok | `SONSUZ_YOL.PLAN.v1.md` §3.E; `app/ios/App/App/` içinde WeatherKit ya da konum eklentisi yok. App Review sorusu gönderilmedi, "şimdilik gönderilmeyecek" (`S0/app-review-sorusu.md:1`); hukukçu adı yok, yedek: yalnız şehir seçimi (`SAHIP_ISTEKLERI.md` 2026-09-30 kararı) | Y5 TestFlight, S6 kapısı, gizlilik sayfası ve App Store etiketi aynı sürümde güncellenince. Sitede "en doğru kaynak" yazılmaz; Apple Weather atfı gösterilir |
| **Sonsuz yol Y6 · Nef haftalık ve aylık değerlendirme**, olay satırı, rıza v2 | `[ ] plan` | `SONSUZ_YOL.PLAN.v1.md` §3.C, §3.I (S7: 30 soruluk Nef sınavı) | Y6'dan sonra; sitedeki Nef ve gizlilik satırları aynı gün |
| **(d) sessiz ölçüm; (e) uyku (Apple Sağlık'tan), yürüyüş modülü, tepki hızı, Gökyüzü molasının yola girmesi** | `[ ] plan` | `YAPILACAKLAR.md:77-79`; kendi planları `YOL.moduller.md`; sağlıktan uyku kodda yok (`app/src/lib/health.js`'te uyku yok; `YAPILACAKLAR.md:486` "ayrı karar") | Kendi aşamaları bittikten sonra |
| **Alarm** (AlarmKit, iOS 26; eski iOS'ta bildirim; 9 dk erteleme; Ana sayfa satırı ve kartı) | `[~] TF`, kısmen `[x]` | Sürüm notu `releases.js:60-63` (28 Eylül). Cihaz: seçilen ses (Gün Işığı) AlarmKit'te çaldı, erteleme simgesi görünüyor (`HATA_GUNLUGU.md:669-674`). Açık: sessiz modda çalma doğrulanmadı (`YAPILACAKLAR.md:233-235`); "Cihazda bak (alarm)" 10 madde işaretsiz (`YAPILACAKLAR.md:367`) | Sitede var (ana sayfa "Sabah", Modüller). Sitede kalır; "sessiz modda da çalar" cümlesi cihazda doğrulanmadan siteye yazılmaz. Kalan liste bitince ekran görüntüsü yenilenir |
| **Uyandırma sesleri** (Gün Işığı, Kuş Bahçesi, Uyanış Marşı) | `[~] TF`, kısmen `[x]` | `releases.js:58`; Gün Işığı'nın ilk sürümü alarmda çaldı; sonra ElevenLabs Music sürümlerine geçildi (`8ae090c`, Build 59'da), bu sürümlerin alarmda çaldığı ayrıca yazılmadı (`HATA_GUNLUGU.md:672-674`) | Sitede var ("Nefona'ya özel bestelendi", `site/pages/index.html:86`). Yeni sürümler cihazda duyulunca kalır; "bestelendi" sözcüğü üretim yoluyla karşılaştırılmalı |
| **Alarm sabah akışı ve sorusu** ("Uyanınca": 1 dk nefes, Dalga ya da gün ışığı; "Ses bittiğinde uyumuş muydun?") | `[~] TF` | `components/AlarmCard.jsx:173`; `releases.js:61-62`; "ertesi sabah soru" cihaz listesinde işaretsiz (`YAPILACAKLAR.md:367-369`). "Uyanınca" isteğe bağlı, varsayılanı "hiçbiri" (`YAPILACAKLAR.md:286`) | Cihaz listesinden sonra. Sitede "bir dakikalık nefesle gün başlar" (`index.html:86`) isteğe bağlı olduğu söylenecek biçimde düzeltilmeli |
| **Uyku sesi** (Dalga'nın sakin müziği, "Sana göre" süre) | `[x] cihaz` (çalma) · `[~]` ("Sana göre" öğrenmesi) | Kabloyla Xcode derlemesinde "Uyku müziği ÇALIYOR ve duyuluyor" (`HATA_GUNLUGU.md:623-625`); sürüm notu `releases.js:61` | Sitede var ve kalabilir; "Sana göre"nin uykuyu dinlemediği cümlesi korunur |
| **Gece saati** (kehribar saat, alarm ve kalan süre) | `[~] TF` | `components/NightClock.jsx` (Build 59'da); cihazda bakılacaklar listesi açık (`YAPILACAKLAR.md:256-260`) | Sitede var ("Gece", `index.html:97-98`). Cihaz bakışından sonra kalır; "gözünü ışıkla yormaz" cümlesinin kaynağı yok, çıkmalı ya da kaynağa bağlanmalı |

### 1.2 Ölçüm ve takip

| Özellik | Durum | Kanıt | Siteye ne zaman girebilir |
|---|---|---|---|
| **Haftalık E testi** (tek ekran hazırlık, 36–44 cm sayım bandı, 28 harf, sesli yönlendirme; ilk günden haftada bir) | `[~] TF`, kısmen `[x]` | Sürüm notu `releases.js:35-50`, `:24-27` (bir kısmı `2026-09-29-2` girdisinde, o girdi henüz gitmedi). Sahip cihazda "Haftalık E testi · Bu hafta tamam" gördü; liste sürüyor (`YAPILACAKLAR.md:80-81`) | Sitede var (E tadımlığı, Nasıl çalışır). Cihaz listesi bitince görüntüler yenilenir |
| **E testinde parlaklık ve ters renk denetimi** | `[~] TF` ama cihazda doğrulanmadı | Kod yorumu: "TestFlight'tan önce doğrulanacak; doğrulanmazsa sürüm notundan çıkarılır" (`releases.js:40-44`); `YAPILACAKLAR.md:600` `[~]`. Madde Build 58'le çıktı; cihaz kaydı bulunamadı | Doğrulanana kadar sitede yazılmaz. Site "Yenilikler"i sürüm notunu kopyaladığı için bu madde oraya da gider (§2, bulgu 3) |
| **Kısa E testi** (isteğe bağlı, sağ ve sol göz) | `[~] TF` | `modules/daily`; `releases.js:24` (`2026-09-29-2`, henüz gitmedi: adın "Kısa E testi" olduğu sürüm) | Sitede var (Modüller, Nasıl çalışır). Ad değişikliği TestFlight'a girince kalır |
| **Okuma testi** (haftada bir, E testiyle aynı güne düşmez) | `[~] TF` | `releases.js:31` (`2026-09-29-2`); kod Build 59'da (`26419b4`); cihaz listesi `YAPILACAKLAR.md:139-143` | Sitede var. Cihaz bakışından sonra kalır |
| **İlk Bakış** (20 sn okuma, kırpma sayımı) | `[~] TF` | `releases.js:105-106`; okuma sırasındaki kırpmalar için yeni sayaç yalnız sentetik izde doğrulandı, "cihazda doğrulanmadı" (`HATA_GUNLUGU.md:391-437`) | Sitede var (Nasıl çalışır, ana sayfa). Cihazda sayım doğrulanınca kalır; Y3'te sitenin ilk ekranı buna dayanır |
| **İlk açılışta önce ölçüm** (giriş → İlk Bakış → hesap → güvenlik → sorular) | `[~] kod` | `c7af2af` (Build 59'dan sonra); "CİHAZDA DENENMEDİ, TestFlight'a girmedi" (`YAPILACAKLAR.md:178`) | TestFlight ve cihazdan sonra. **Site bu sırayı şimdiden anlatıyor** (`site/pages/nasil-calisir.html:15-16`, §2 bulgu 2) |
| **İris haritası** (kurulumda başlangıç, 28. günde yan yana) ve **Gelişim haritası** (7 alan, 28 günlük doluluk, altın ve turuncu yay) | `[~] TF` | `releases.js:102`, `:72-73`; "Cihazda bak (Gelişim haritası)" işaretsiz (`YAPILACAKLAR.md:27-34`); kurulumdaki iris hâlâ sorulardan çizilir (`:388`) | Sitede var (1./28. gün görselleri). Cihaz bakışından sonra kalır |
| **WHO-5 iyi oluş** (14 günde bir 5 soru, resmî Türkçe metin) | `[~] TF` | `releases.js:74`; cihaz listesinde işaretsiz (`YAPILACAKLAR.md:31-34`); ticari kullanım lisansı doğrulanmadı (`:43`, `:390-392`) | Sitede var (Modüller). Lisans hukukçudan geçmeden ve cihaz bakışından önce öne çıkarılmaz |
| **Apple Sağlık: adımlar** (yalnız okuma; Ana sayfa adım satırı, Gelişim → Beden) ve **yürüyüş hatırlatması** | `[~] TF` | `releases.js:151`, `:114`, `:117`; "kod bitti, CİHAZDA DENENMEDİ" (`YAPILACAKLAR.md:484-485`); arka plan teslimi Mac'te denenecek (`:458`) | Sitede var (Rıza kartı). Cihazda izin sayfaları ve adım satırı görülünce kalır |
| **Nef (koç)** (günde bir öneri, iki ayrı izin, haftalık testi hatırlatır) | `[~] TF` | `releases.js:25`; sunucu yeni istemle yayında (`YAPILACAKLAR.md:131-133`, commit `97f2f87`); cihaz listesindeki Nef maddeleri işaretsiz (`:160-163`) | Sitede var (Nef kartı). Cihaz bakışından sonra kalır; Y6 değişiklikleri kendi günü |
| **5. gün İlk rapor, "Doktoruma göster" PDF, CSV dışa aktarma** | `[~] TF` · üç düzeltme `[~] kod` | `releases.js:122` sonrası (26 Eylül girdisi); sahibin onayladığı üç düzeltme (fiil, güven aralığı yönü, Gelişim kutucuğu) Build 59'dan sonra (`a225142`) | Sitede var (5. gün). Üç düzeltme TestFlight'a girince görüntü yenilenir |

### 1.3 Egzersiz ve pratikler

| Özellik | Durum | Kanıt | Siteye ne zaman girebilir |
|---|---|---|---|
| **Nefes** (8 kalıp, kanıt düzeyi, profesyonel Türkçe sesli komut) | `[~] TF` | `releases.js:96-99`; Y1 ile yoldaki süre değişecek (yukarıda) | Sitede var. Yoldaki süre Y1 günü yenilenir |
| **Göz egzersizleri** (Göz kırp, egzersiz setleri, ortak egzersiz sahnesi, sesli yönlendirme) | `[~] TF` | `releases.js:93-94`; egzersiz sahnesi "CİHAZDA DENENMEDİ" (`YAPILACAKLAR.md:544`) | Sitede var. Cihaz bakışından sonra kalır |
| **Göz takibi ve kalibrasyon** (ekrana göre ölçüm, beş noktalık kontrol, kendini iyileştiren ayar) | Takip `[x] cihaz` · rapor verisi ve kendini iyileştirme `[~]` | "apple giriş tamam... göz takibi tamam" (`HATA_GUNLUGU.md:380-384`); rapor verisi gelmedi, kendini iyileştirme cihazda denenmedi (`YAPILACAKLAR.md:548-559`) | Sitede ayrıntı gerekmez; "bakışla oynanan oyun" düzeyi yeterli |
| **Çemberler** (bakışla takip, "Ekrana bak" kurtarması) | `[x] cihaz` (Bug 23 düzeltmesi) | "düzeltme (4aabad9) cihazda 'tamam'" (`HATA_GUNLUGU.md:669-671`) | Sitede var ve kalabilir |
| **Yılan** (gözle yönlendirme) | `[~] TF`; açık hata | Aşağı bakış "sağ" okunuyor (`YAPILACAKLAR.md:560-561`) | Sitede var. Hata kapanmadan öne çıkarılmaz |
| **Dalga** (Sakin, Güç, Motivasyon müziği) | `[~] TF` | Modül `79cad16` (Build 59'da); önce → sonra puanı `releases.js:122` sonrası | Sitede var |
| **Gökyüzü molası** | `[~] TF`; yolda değil | `modules/gokyuzu/manifest.js`; yola (e) ile girecek (`SONSUZ_YOL.PLAN.v1.md` §1) | Sitede var (pratik olarak); "yolda" denmez |
| **Yön** (kendini tanıma ve kendine şefkat yazıları) | `[~] TF` | `modules/yon` (`45f3c2c`) | Sitede var |
| **Dikkat ve farkındalık görevleri** (Fark Ettin mi?, Bugünün görevi, Hızlı Bakış, Tek Bakışta) | `[~] TF` | Modüller 25 Eylül'de, Build 59'da; Y1 açılma eşikleri VARSAYIM | Sitede var. Açılma günleri Y1 günü sitede anlatılabilir |
| **Mola, su, hatırlatmalar, çalışma oturumu** | `[~] TF` | `releases.js:110-116` (27 Eylül); bildirim sistemi "cihazda denenmedi" (`YAPILACAKLAR.md:242`, `:449-462`) | Sitede var (Nasıl çalışır). Cihazda teslim görülünce kalır |
| **Nefes sayma** (emekli modül) | Emekli (`retired: true`) | `app/src/modules/breath-count/manifest.js:24` | Sitede olmamalı; bugün iki yerde görünüyor (§2, bulgu 4) |

### 1.4 Hesap ve kabuk

| Özellik | Durum | Kanıt | Siteye ne zaman girebilir |
|---|---|---|---|
| **Apple ile giriş** | `[x] cihaz` | `HATA_GUNLUGU.md:380-382`; `YAPILACAKLAR.md:542-543` `[x]` | Sitede var ve kalabilir |
| **Google ile giriş, e-posta, hesapsız deneme** | Google `[~]` (yapılandırma ve cihaz denemesi açık) | `YAPILACAKLAR.md:566-568` | Google, cihazda denenince; sitede bugün "Apple, Google ya da e-posta" yazıyor (`nasil-calisir.html:16`) |
| **Abonelik ve 7 gün deneme** | `[~] TF` | "Aboneliği yönet" doğrulanmadı (`YAPILACAKLAR.md:562`) | Yayın gününe; fiyat sitede App Store'dan önce yazılmaz |
| **Yeni simge ve açılış ekranı** | `[~] TF` | "Cihazda bak: yeni simge ve açılış ekranı" işaretsiz (`YAPILACAKLAR.md:27`); Y3'te logo kalkacak (karar 5c) | Y3'ten sonra |

## 2. Siteyi ilgilendiren bulgular

1. **Site Y1'in önünde.** `site/pages/index.html:94` bugün "Yol ilk gün 8 dakikadır ve her gün bir adım büyür ... 3
   dakikalık nefesle başlayan 5 dakikalık mola" diyor; görseller de Y1'den (`home-path-*.webp`). Y1 TestFlight'a
   girmedi ve bu cümle metin kapısında bekliyor (`Y1_KOD_RAPORU.md` §6 madde 3). Site Y1'den önce yayına çıkarsa
   uygulamanın yapmadığı bir şeyi anlatır.
2. **Site (b)'nin önünde.** `site/pages/nasil-calisir.html:15-16` kurulumu "İlk Bakış → Hoş geldin" sırasıyla
   anlatıyor; bu sıra TestFlight'a girmedi (`YAPILACAKLAR.md:178`).
3. **Site verisi uygulamanın çalışma ağacından üretiliyor.** `site/scripts/data.mjs` modül listesini `app/src/modules`
   klasörlerinden, sürüm notlarını `releases.js`'ten okur. Bugünkü `site/src/data.json` ve `site/dist` (2026-09-29
   14:20) henüz TestFlight'a gitmemiş `2026-09-29-2` girdisini içeriyor. Site şimdi yeniden derlenirse "Modüller"e
   açıklamasız "Yoga" satırı girer (`site/src/main.js:76-98` `MOD_DESC`'te yoga yok), ama yoga TestFlight'ta yok.
   Doğrulanmamış parlaklık maddesi de sürüm notuyla birlikte "Yenilikler"e gider. Öneri: site derlemesi TestFlight'a
   giden commit'ten yapılsın; bu bir karar konusu, kod değişmedi.
4. **Emekli modül sitede.** `data.mjs` `retired` alanını okumaz; "Nefes sayma" Modüller sayfasında listeleniyor ve
   `nasil-calisir.html:31` "nefes sayma" diyor. Uygulamada emekli (`breath-count/manifest.js:24`).
5. **Kanıtsız ya da fazla cümleler.** `index.html:98` "gözünü ışıkla yormaz" (kaynaksız göz iddiası);
   `index.html:86` "bir dakikalık nefesle gün başlar" (uygulamada isteğe bağlı, varsayılanı "hiçbiri"). Alarm sürüm
   notundaki "sessiz modda da çalar" sitede yok; doğrulanana kadar da olmamalı.
6. **Yoga kaynakları site kaynakçasına ulaşamaz.** Ders kaynakları `yogaLessons.js` içinde duruyor; `lib/sources.js`'e
   eklenmedi (`C_KOD_RAPORU.md`). Site Bilim sayfası kaynakçayı yalnız oradan üretir.
7. **Site yayında değil.** Vercel projesi ve alan adı alınmadı (`YAPILACAKLAR.md:538` `[ ]`); gizlilik ve koşullar
   hukukçu incelemesi bekliyor (`:536-537`). Sahibin "Nefona.com'u güncelle" isteği yerel siteyi ve ilk yayını kapsar.

## 3. Siteye giriş sırası (özet)

- **Sitede kalabilir, K2 geçti:** Çemberler, uyku sesinin çalması, Apple ile giriş, göz takibi; alarm ve uyandırma
  sesinin doğrulanmış kısmı.
- **Sitede var, cihaz bakışından sonra yeniden bakılacak:** haftalık E testi, okuma testi, İlk Bakış, iris ve Gelişim
  haritası, WHO-5, Apple Sağlık adımları, Nef, İlk rapor ve PDF, nefes, göz egzersizleri, Dalga, gece saati, alarm
  sabah akışı, hatırlatmalar.
- **Sitede olmamalı:** parlaklık ve ters renk (doğrulanana kadar), Nefes sayma, sessiz modda çalma.
- **Sitede erken yazılmış, geri tutulmalı:** Y1 yolu (`index.html:94`), önce ölçüm kurulum sırası
  (`nasil-calisir.html:15-16`); ikisi kendi TestFlight ve cihaz kapısıyla aynı gün açılır.
- **TestFlight ve cihazdan sonra:** yoga ilk bölümü (önce sesler uygulamaya), yoga yol durağı ve sabah sorusu.
- **Kendi aşaması bitince:** Y2 Gelişim, Y3 sitenin ilk ekranı, Y4 ay ve "Günün nasıl geçti", Y5 hava ve yağmur, Y6
  Nef dönemleri, kalan 6 yoga dersi, (d) ve (e).

## 4. VARSAYIM ve sınırlar

- VARSAYIM: Build 59 bilinen son TestFlight'tır ve `26419b4`'ten yapılmıştır; sonrasında kayda geçmemiş derleme yok.
- VARSAYIM: Build 59'daki bir özelliğin cihazda doğrulandığını ancak `HATA_GUNLUGU.md` ya da `YAPILACAKLAR.md`'deki bir
  kayıt gösterir; sahip bir şeyi cihazda görüp yazdırmadıysa burada `[~]` kalır.
- Parlaklık maddesi için cihaz kaydı bulunamadı; doğrulama yapılıp yazılmamış olabilir.
- Swift bu ortamda derlenmedi; hiçbir cihaz davranışı bu çalışmada denenmedi.
- `app/src` başka iş akışlarınca değişiyor; yoga yayım durumu (`published`) ve Y1 turu bu belge yazılırken değişmiş
  olabilir. Belge 2026-09-30 öğleden sonraki çalışma ağacını ve `HEAD` `70ca7d5`'i yansıtır.
