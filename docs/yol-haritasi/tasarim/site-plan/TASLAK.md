# TASLAK · nefona.com güncellemesi (plan §3.K ve üç ek)

Tarih: 2026-09-30. Durum: **taslak**. Sahibe gitmedi, 5 saniye sınaması yapılmadı. Depoda hiçbir dosya değişmedi.
Dayanak: bu klasördeki `site.md`, `ozellikler.md` ve `kurallar.md`; `SONSUZ_YOL.PLAN.v1.md` §3.H ve §3.I; `HEAD` = `e71abe6`.

**Tek bakışta**
- Bir özellik siteye ancak TestFlight'ta çalışıp cihazda `[x]` olduktan sonra girer.
- Her modül bitince o modülün site parçası yapılır; en sonda bütün site bir kez gözden geçirilir.
- Hava durumunun uygulamada henüz kodu yok (plan Y5). O güne kadar sitede de yer almaz.

---

## 1. Plana eklenecek bölüm

Yeri: `SONSUZ_YOL.PLAN.v1.md`, §3.J'den sonra, "## Kaynaklar"dan önce. Onaylı plana ektir; sahibin onayıyla girer.

### K. nefona.com güncellemesi (son aşama)

#### K.1 Amaç ve sahibin isteği

Sahibin isteği (2026-09-30, kelimesi kelimesine):

> Bence yaptığını yeni işleri de en son plan eklemesliain Nefona.com sitesini güncellemelisin yeni özellikler ekledik
> yoga,  sonsuzluk , alarm , hava durumu vs gibi. Ama bunları modüller bittikten sonra görerek düzeltmen gerekiyor

Okunuşu: "Yaptığın yeni işleri de en son plana ekle. Nefona.com sitesini güncellemelisin; yoga, sonsuzluk, alarm, hava
durumu gibi yeni özellikler ekledik. Ama bunları modüller bittikten sonra, görerek düzeltmen gerekiyor."

**Amaç:** Site uygulamanın bugün yaptığını anlatır; ne eksik ne fazla. Her cümlesi bir kayda dayanır: kod, PubMed kaynağı
ya da cihaz kaydı.

**Bugünkü durum (2026-09-30):**
- **Yoga** `[~]`: Kodu depoda. Uygulamada yalnız Ders 2'nin 15 dakikalık sürümü yayımlı (`lib/yogaLessons.js:134`).
  İlk bölümün dört dersinin sesi sahibin kulağından geçti (`yoga-pilot/SAHIP_ISTEKLERI.md` madde 17–18). Cihazda
  denenmedi.
- **Sonsuz yol Y1** `[~]`: Kod bitti; 138 dosyada 1863 test yeşil (`e71abe6`). TestFlight'a girmedi, cihazda denenmedi.
  Ana sayfanın ilk görünümü 5 saniye kapısını üç turda da geçemedi (`Y1_5SN_SONUCLARI.md`).
- **Alarm** `[~]`: Build 59'da. Seçilen sesin çaldığı cihazda doğrulandı. Cihaz listesinin kalanı açık
  (`YAPILACAKLAR.md:367`).
- **Hava durumu** `[ ]`: Kodu yok; plan Y5.

#### K.2 Tetik

- Bir özellik siteye ancak iki koşulla girer: TestFlight derlemesinde çalışır ve cihaz listesi bitip sahip cihazda
  baktıktan sonra `[x]` olur. `[~]` olan iş sitede anlatılmaz.
- Planda olup yapılmamış olan iş (ör. hava, Y5) yapılana kadar siteye girmez. "Yakında" satırı da yazılmaz (K.7, soru 3).
- Her modül ya da aşama bitince yalnız o modülün site parçası yapılır. Sıra, modüllerin cihazda bitiş sırasıdır.
- En sonda, son aşama (Y6) cihazda bitince bütün site bir kez baştan gözden geçirilir (K.4, son adım).
- Sitede erken yazılmış cümleler de bu kurala uyar. Y1 yolu (`site/pages/index.html:94`) ve "önce ölçüm" kurulum sırası
  (`site/pages/nasil-calisir.html:15-16`) kendi kapıları geçmeden yayına çıkmaz.
- Modül beklemeyen tek iş, bugünkü uygulamayı yanlış ya da eksik anlatan cümlelerdir (K.3, ilk satır). Bunlar ilk
  yayından önce düzelir.

#### K.3 Fark tablosu

| Özellik | Bugünkü site | Eklenecek ya da değişecek (sayfa: ne) | Ne zaman |
|---|---|---|---|
| **Bugünkü uygulama** | Gizlilik sayfası mikrofonu ve konuşma tanımayı hiç anmıyor. `gizlilik.html:49` "ses kaydı … hiç gitmez" diyor. `:21` silmeden sonra "yalnız tema, ses ve titreşim" kaldığını söylüyor. `:36` telefonda kalan görme ölçümü için rıza alındığını söylüyor; alınmıyor. `:40` e-posta girişini anmıyor. Modüller sayfası emekli "Nefes sayma"yı listeliyor; Gökyüzü molasına "Bir dakika" diyor (uygulamada 2 dk) | **Gizlilik:** mikrofon satırı eklenir; "Telefonda tutulanlar"a alarm günlüğü, yazılan notlar ve bakış ayarı girer; silme cümlesi kodla aynı olur; rıza cümlesi daraltılır; hesap satırı üç giriş yolunu sayar. Hepsi hukukçu onayıyla. **Modüller:** emekli modül listeden çıkar; Gökyüzü molası 2 dk olur | İlk yayından önce |
| **Yoga** | Hiç yok | **Modüller:** yoga açıklaması; yalnız yayımlı ders ve süre (bugün Ders 2 · 15 dk). **Nasıl çalışır:** "Pratikler"e yoga. **Bilim:** yoga kanıt kartı ve kaynakları DOI'siyle; karşı kanıt da yazılır (Sharpe 2023). **Gizlilik:** yoga kayıtları ve Nef'e giden dört sayı. **Destek:** bir SSS; "uyutur" denmez. **Ana sayfa:** yol durağı yalnız 3 ve 5 dakikalık dersler yayımlanınca | Yayımlı dersler TestFlight'ta ve cihazda `[x]` olunca (yoga Kapı 4–5). Her yeni ders kendi gününde |
| **Sonsuz yol Y1** (nefes 1 → 2 → 3 dk, göz merdiveni, "Günün ritmi", "Yeni" rozeti, "Sonra yaparım") | Yol görseli ve "ilk gün 8 dk, her gün bir adım" cümlesi (`index.html:94`) var. Erken yazıldı; cümle metin kapısında bekliyor | **Ana sayfa:** "Bir gün" ve "28 gün" bölümleri. 28. gün bir kilometre taşıdır, yol sonra da sürer. `home-*` ve `home-path-*` görselleri yeniden çekilir. **Nasıl çalışır:** "Günlük yol"a merdivenler, "2 dk daha" ve "Sonra yaparım" yazılır. Sayı gerekirse "yüzlerce ritim" denir (230; 629 değil). **Yenilikler** | Y1 S2 kapısını geçince. Ana sayfa görüntüsü, 5 saniye kapısını geçen tasarım cihaza girdikten sonra çekilir |
| **Alarm** (uyandırma sesleri, gece saati, sabah akışı) | Sabah ve gece görselleri, modül açıklaması ve kanıt kartı var | **Ana sayfa:** "bir dakikalık nefesle gün başlar" (`:86`) yerine sabah akışının isteğe bağlı olduğu yazılır. "gözünü ışıkla yormaz" (`:98`) çıkar ya da kaynağa bağlanır. "bestelendi" sözcüğü üretim yoluna göre düzeltilir; sesler ElevenLabs Music ile üretildi (`lib/alarmSounds.js:4`). **Bilim:** kartın 12 kaynağı DOI'siyle kaynakçaya girer. **Gizlilik:** alarm günlüğü ve sabah cevabı eklenir. "Sessiz modda da çalar" cümlesi yazılmaz | Alarmın cihaz listesi (10 madde) bitince. Yoga sabah sorusu yogayla birlikte |
| **Gelişim v2** (Y2) | "En az 0,10 logMAR, doğrulanmış değişim" anlatımı | **Ana sayfa** ve **Nasıl çalışır:** yeni ölçü kuralı ve "Yolun" bölümü anlatılır; Gelişim görseli yeniden çekilir | Y2 S3 kapısını geçince |
| **Sitenin ilk ekranı** (Y3) | "Gözün değişiyor. Sen de gör." | Karar 5b başlığı: "Bu cümleyi okurken kaç kez göz kırptın?" Ayrıntı S0 kararları 21, Ç11, Ç12 ve Ç15'te | Y3 S4 kapısını geçince |
| **Ay ve "Günün nasıl geçti"** (Y4) | Yok | **Ana sayfa:** akşamın tek dokunuşu. **Bilim:** ay ve günün kartlarının kaynakları (PMID ve DOI). **Gizlilik:** ruh hâli verisi telefonda kalır | Y4 S5 kapısını geçince |
| **Hava, konum, yağmur bildirimi** (Y5) | Yok; uygulamada kodu da yok | Özellik anlatısı ve Apple Weather atfı. **Gizlilik:** yaklaşık konum ve hava rızası; `gizlilik.html:49`'daki cümle genişler. App Store etiketine "Yaklaşık konum" eklenir. Bir SSS. "En doğru kaynak" yazılmaz | Y5 S6 kapısını geçince. Gizlilik sayfası, etiket ve uygulama aynı sürümde çıkar |
| **Nef dönemleri ve rıza v2** (Y6) | Nef satırı rızanın 1. sürümünü anlatıyor; `gizlilik.html:33`'e göre ekran süresi Nef'e gidiyor | **Ana sayfa:** Nef kartı. **Gizlilik:** Nef satırı rıza v2'ye göre yazılır | Y6 S7 kapısını geçince |
| **İlk açılışta önce ölçüm** (b) | `nasil-calisir.html:15-16` bu sırayı şimdiden anlatıyor | Bu sıra yayında ancak (b) cihazda `[x]` olunca görünür | (b) TestFlight'ta çalışıp cihazda doğrulanınca |

#### K.4 Adımlar

**Bir kez, ilk parçadan önce** (kod işi; sahibin onayıyla):
- **Veri hattı:** Site, TestFlight'a giden commit'ten derlenir. Bugün `site/scripts/data.mjs` çalışma ağacını okuyor;
  yayımlanmamış yoga ve TestFlight'a gitmemiş sürüm notu bu yolla siteye sızar. `data.mjs` emekli modülleri ve
  yayımlanmamış dersleri süzer. Yoga ve kanıt kartı kaynaklarını DOI'leriyle kaynakçaya taşır; kaynak listesi tek
  yerde, `lib/sources.js`'te kalır.
- **Ekran düzeneği:** Bugünkü site görsellerinin düzeneği kayıp (`_harness/site.html` ve `siteSeed.js` yok). Y1'in
  depodaki düzeneği (`tasarim/Y1_5sn_duzenek/cek.sh`) site görünümlerini de çekecek biçimde genişletilir. Böylece her
  görüntü aynı betikle yeniden çekilebilir.

**Her parça için sırayla:**
1. **Ekran görüntüleri:** Bitmiş modülden, TestFlight'a giden commit'ten çekilir; açık ve koyu temada, 390 ve 320 pt
   genişlikte. Sahibin cihazındaki ekranla yan yana karşılaştırılır; fark varsa cihazdaki esastır. Görselin altında
   örnek veriyle çekildiği yazar.
2. **Metin:** Uygulamadaki cümlenin aynısı kullanılır, iddiasız ve bulgu diliyle. Ses örneği varsa altındaki yazı sesteki
   cümlenin aynısıdır. Her cümle §3.H metin kapısından geçer: makine denetimi, iki bağımsız model incelemesi ve sahibin
   onayı.
3. **Bilim sayfası:** Her kaynak PubMed'de yeniden açılır ve PMID ile DOI'siyle yazılır. Kanıtın türü, kişi sayısı ve
   sınırı belirtilir. Yalnız yayımlı içeriğin kaynakları görünür. Kaynak ve kart sayıları elle yazılmaz, veriden basılır.
4. **Gizlilik:** Gizlilik sayfası, App Store gizlilik etiketi, rıza metni ve "Tüm verileri sil" kapsamı aynı sürümde
   güncellenir (§3.H gizlilik kapısı). Metni hukukçu onaylar; konum ve ruh hâli için hukukçu yoksa §1'deki yedek geçerlidir. Kamera görüntüsünün
   telefondan çıkmadığı cümlesi her sürümde doğru kalır.
5. **Yenilikler:** `lib/releases.js` girdisi TestFlight'la birlikte eklenir ve site aynı girdiyi basar. Cihazda
   doğrulanmamış madde girdiden çıkar.
6. **5 saniye kapısı:** En az 3, önerim 5 bağımsız değerlendirici bakar. Değerlendiriciler birbirini görmez ve ürünü
   bilmez. Değişen bölümün ve sitenin ilk ekranı 390 × 844, 320 × 568 ve 1280 boyutlarında, açık ve koyu temada ayrı ayrı
   gösterilir. Sorular: "Ne anladın? Etkilendin mi (evet/hayır)? Neden?" Çoğunluk "evet" demezse iş sahibe gitmez;
   yeniden tasarlanır ve sınama tekrarlanır. Ayrıca yabancı testi yapılır (beş soru). Sonuçlar kayıt mesajına yazılır.
7. **Sahibe onaya:** İki temada, 390 ve 320 pt'de bir Artifact hazırlanır; yerel site Tailscale üzerinden açılır.
   5 saniye sonuçları eklenir.
8. **Yayın:** Vercel'de "nefona" projesi açılır: kök `site/`, komut `npm run build`, çıktı `dist`. Alan adı yayın günü
   alınır. Yayından sonra canlı adreste 390 ve 320 pt'de son bir bakış yapılır.

**En sonda, bir kez (son gözden geçirme):** Son aşama cihazda bitince sitenin 8 sayfası baştan okunur. Her cümle bir kayda
bağlanır: kodda `dosya:satır`, kaynakta PMID ve DOI ya da cihaz kaydı. Bağlanamayan cümle çıkar. Site iki temada, 320,
390, 820 ve 1280 genişlikte denetlenir: taşma, kırık bağlantı ve kullanılmayan görsel kalmaz (bugün `acuity-*` ve
`sleep-*` hiçbir sayfada kullanılmıyor). Ardından 6–8. adımlar yapılır.

#### K.5 "Bitti" tanımı

Site bölümü ancak aşağıdakilerin hepsi doğruysa `[x]` olur; biri eksikse `[~]` kalır:
- Sitedeki her özellik yayındaki derlemede var ve cihazda `[x]`.
- Her ekran görüntüsü o derlemeden çekildi; açık ve koyu temada, 390 ve 320 pt'de.
- Her bilimsel cümle PMID ve DOI'si olan bir kaynağa bağlı; yasak sözcük taramasında sonuç 0.
- Gizlilik sayfası, App Store etiketi, rıza metni ve uygulama arasında fark yok.
- 5 saniye kapısında çoğunluk "etkilendim" dedi; yabancı testinde beş sorunun beşi cevaplandı.
- Sahip canlı sitede baktı ve onayladı.

#### K.6 Yapılmayacaklar

- **Sağlık iddiası yok:** tedavi eder, iyileştirir, önler, korur, uyutur, kanıtlanmış, garanti, teşhis gibi sözcükler
  kullanılmaz. Kanıtsız mekanizma da yazılmaz (frekans, Hz, bilinçaltı).
- **Olmayan özellik gösterilmez:**
  - yayımlanmamış yoga dersi ya da süresi ("10 ders", "30 dakika");
  - Y2–Y6'nın yapılmamış işleri ve hava;
  - "yakında" satırı;
  - cihazda doğrulanmamış cümleler ("sessiz modda da çalar", parlaklık denetimi).
- **Sahte görüntü kullanılmaz:** tasarım taslağı, çizim ya da başka bir sürümün görüntüsü gerçek ekran diye konmaz.
- **Fiyat ve karşılaştırma yazılmaz:** App Store'dan önce fiyat yok; "en doğru kaynak" gibi bir karşılaştırma yok.
- **Sitede kamera, ölçüm ve izleme yok.** Analiz kitaplığı da eklenmez. Eklenirse gizlilik sayfası değişir; bu ayrı bir
  karardır.

#### K.7 Açık sorular

1. **Site ilk kez ne zaman yayına çıkar?** Apple, App Store'a gönderimde gizlilik politikası adresi istiyor
   (`YAPILACAKLAR.md:510`). Plan ise sitenin yayınını Y3'e koyuyor.
   **Öneri:** iki katman. İlk App Store gönderiminden önce site yalnız doğrulanmış içerikle yayına çıkar (gizlilik,
   koşullar ve destek dâhil). Sonra her modül bitince kendi parçası eklenir. En sonda K.4'teki son gözden geçirme
   yapılır.
2. **"Sonsuz" sözcüğü sitede ürün adı olarak kullanılsın mı?** Sınırsız içerik vaadi gibi okunabilir (Apple 2.3.1(a);
   VARSAYIM).
   **Öneri:** hayır. Yerine şu cümle: "Yol her gün sürer; yeni duraklar zamanla açılır."
3. **Hava ve ay için sitede "yakında" satırı olsun mu?**
   **Öneri:** hayır. Y5 cihazda bitene kadar sitede hava yer almaz. App Review cevabı ve hukukçu bekleniyor.
   VARSAYIM: App Store dışındaki sitede de "yakında" satırı 2.3.1 riski taşır.

---

## 2. §3.I aşamalar tablosuna eklenecek satır

Yeri: Y6 satırından sonra, "sonra" satırından önce.

```
| Site | nefona.com: her modülün site parçası (modül cihazda bitince) ve en sonda bütün sitenin tek gözden geçirmesi (§3.K) | Site yayını | **S8:** 5 saniye kapısı ve yabancı testi; sahibin canlı sitede bakışı | hazırlık ≈ 1–2, modül başına ≈ 0,5–1, son gözden geçirme ≈ 2 iş günü (VARSAYIM) |
```

---

## 3. `docs/yol-haritasi/YAPILACAKLAR.md` maddesi

Yeri: "## nefona.com sitesi" bölümünün sonu, `:539`'daki "Sonra: İngilizce sürüm" maddesinden sonra. Aynı değişiklikte
`:7`'deki tarih "Son güncelleme: 2026-09-30" olur.

```
- [ ] **Yeni özellikleri siteye işle** (sahibi, 2026-09-30: "Nefona.com sitesini güncellemelisin … Ama bunları
      modüller bittikten sonra görerek düzeltmen gerekiyor"). Plan: `tasarim/SONSUZ_YOL.PLAN.v1.md` §3.K.
      Kural: bir özellik siteye ancak TestFlight'ta çalışıp cihazda `[x]` olduktan sonra girer. Her modül bitince o
      modülün parçası yapılır; en sonda bütün site bir kez gözden geçirilir. Hava kodda yok (Y5); o güne kadar sitede de
      yok. Modül beklemeyen iş (ilk yayından önce): gizlilik sayfasındaki bugünkü açıklar (mikrofon ve konuşma tanıma,
      "Tüm verileri sil" sonrası kalanlar, rıza cümlesi, e-posta girişi), emekli "Nefes sayma", Gökyüzü molası 2 dk.
      Her parçada: gerçek ekran görüntüsü (iki tema, 390 ve 320 pt), iddiasız metin, PubMed ve DOI, gizlilik sayfası =
      App Store etiketi = rıza metni, Yenilikler, 5 saniye kapısı, sahibin onayı.
```

---

## 4. `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md` kaydı

Yeri: dosyanın sonu, "Sahibin 2026-09-30 kararı: sonsuz yol kodu erkene alındı" kaydından sonra. Bu dosyada numaralı
kayıt yok; kayıtlar tarihli başlıklarla sıralanıyor. Bu yüzden numara verilmedi. Yeni kayıt dosyanın 7. `##` başlığı
olur. Numaralı liste `yoga-pilot/SAHIP_ISTEKLERI.md`'dedir; orada sıradaki numara 19'dur.

```
## Sahibin 2026-09-30 isteği: nefona.com güncellemesi (kelimesi kelimesine)
> Bence yaptığını yeni işleri de en son plan eklemesliain Nefona.com sitesini güncellemelisin yeni özellikler ekledik
> yoga,  sonsuzluk , alarm , hava durumu vs gibi. Ama bunları modüller bittikten sonra görerek düzeltmen gerekiyor

Okunuşu: Yeni işler en son plana (SONSUZ_YOL.PLAN.v1) eklenir. nefona.com yoga, sonsuz yol, alarm ve hava durumuyla
güncellenir, ama her özellik ancak modülü bitip cihazda görüldükten sonra siteye girer.
Uygulama: plan §3.K (taslak, sahibin onayına), §3.I'da "Site" satırı ve S8 kapısı, `YAPILACAKLAR.md` "nefona.com
sitesi" bölümüne madde. Not: hava durumunun uygulamada henüz kodu yok (plan Y5); o güne kadar sitede yer almaz.
```

---

## 5. Sınırlar ve VARSAYIM

- Bu belge için hiçbir şey cihazda denenmedi. Site derlenmedi, test koşulmadı.
- `app/src` başka iş akışlarınca değişiyor (yogada kaydedilmemiş değişiklikler var). Yoganın yayım durumu bu belge
  yazılırken değişmiş olabilir.
- VARSAYIM: Build 59 bilinen son TestFlight'tır; Y1 ve yoga TestFlight'a girmedi.
- VARSAYIM: iş süreleri; App Store dışındaki sitede "yakında" satırının ve "sonsuz" sözcüğünün 2.3.1 riski taşıdığı.
- Alan adının boşta olduğu ve fiyatı 29 Eylül bilgisidir; yeniden denetlenmedi.

---

## Eksiklik eleştirmeni

Tarih: 2026-09-30. Yöntem: bu taslak ve üç envanter (`site.md`, `ozellikler.md`, `kurallar.md`) okundu; depo yalnız okundu
(`HEAD` = `f810065`, taslağın dayandığı `e71abe6`'dan bir kayıt sonra). Alan adı bugün iki yerden sorgulandı. Hiçbir dosya
değişmedi; derleme ya da test koşulmadı. Önem: **Engel** (sahibe ya da yayına gitmeden düzelmeli), **Gerekli**, **Küçük**.

**Tek bakışta**
- Taslak bir kayıt geride kaldı: §4'teki kayıt depoda zaten var ve sahibin iki yeni kararı taslağa işlenmedi.
- "Sessiz modda da çalar" sitede zaten yayında: Yenilikler sayfası sürüm notunu olduğu gibi basıyor. TestFlight'a
  gitmemiş (b) maddesi de orada.
- Yayın adımlarında uygulama tarafı eksik: gizlilik adresi derlemeye gömülüyor (`VITE_PRIVACY_URL`) ve bugün boş.
  Alan adı, e-posta, Google girişi ve App Store gönderimi birbirine bağlı; taslak bunları "yayın günü"ne bırakıyor.
- App Store açıklaması ve mağaza ekran görüntüleri, dil ve erişilebilirlik taslakta hiç geçmiyor.
- Ana sayfadaki 20-20-20 cümlesi uygulamanın kendi kanıt notuyla çelişiyor; taslağın "ilk yayından önce" listesinde yok.

### E1. Taslağın kendisi (Engel)

1. **§4 artık gereksiz.** Kayıt `f810065` ile eklendi: `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:98-103`
   ("Sahibin 2026-09-30 isteği: nefona.com güncellemesi (son aşama)"). §4 olduğu gibi uygulanırsa aynı kayıt iki kez
   girer. Öneri: §4 silinir. Yerine var olan kayda tek satırlık bir plan göndermesi eklenir (§3.K).
2. **Sahibin iki yeni kararı taslakta yok** (`SAHIP_ISTEKLERI.md:105-113`):
   - "Ana sayfa şimdi yeniden tasarlanır, TestFlight beklemez; yoga hazır olunca TestFlight ana sayfanın bugünkü hâliyle
     çıkar." Buna göre bir sonraki TestFlight, 5 saniye kapısını geçmemiş Ana sayfayla çıkar. K.3'ün Y1 satırı şunu açıkça
     demeli: sitenin `home-*` ve `home-path-*` görselleri o ara derlemeden **çekilmez**. Yeniden tasarlanan Ana sayfa
     cihaza girince çekilir.
   - "28 Eylül sürüm notu maddeleri bir sonraki TestFlight girdisine taşınır." Site Yenilikler'i `releases.js`'i olduğu
     gibi basıyor. Maddeler 28 Eylül girdisinde de kalırsa sitede iki kez görünür (bkz. E2.2).
3. **Dayanak satırı** (`TASLAK.md:4`) `HEAD` = `e71abe6` diyor; bugünkü `HEAD` `f810065`.
4. Taslağın kendisi 5 saniye sınamasından geçmedi (`TASLAK.md:3`). Bağlayıcı kurala göre sahibe gitmeden önce ilk görünümü
   ("Tek bakışta") sınanmalı.

### E2. Site sayfaları: taslağın atladığı yerler

| # | Sayfa ve satır | Eksik | Önem |
|---|---|---|---|
| 1 | `yenilikler.html` (`data-render="releases"`) | 28 Eylül girdisi "iOS 26'da gerçek alarm: sessiz modda da çalar" diyor (`app/src/lib/releases.js`, 2026-09-28 girdisi). Aynı cümle `site/src/data.json`'da ve `site/dist` paketinde var. Oysa sessiz modda çalma cihazda doğrulanmadı (`YAPILACAKLAR.md:233-235`). K.3'ün Alarm satırı ile `ozellikler.md` §2.5 bu cümlenin sitede olmadığını varsayıyor. Parlaklık maddesi (29 Eylül) ile TestFlight'a gitmemiş `2026-09-29-2` girdisi de burada; o girdinin ilk maddesi (b) "önce ölçüm". K.2 (b)'yi yalnız `nasil-calisir`'da arıyor. | Engel |
| 2 | Aynı sayfa | K.4 5. adım "doğrulanmamış madde girdiden çıkar" diyor. Bu bir uygulama değişikliğidir (`releases.js`) ve sayfanın "Uygulamanın içindeki … listesinin aynısı" cümlesiyle çelişir. Karar gerekiyor: (a) sürüm notu düzeltilir ve site aynısını basar, ya da (b) site hattı yalnız gönderilmiş girdileri basar ve sayfa cümlesi değişir. 28 Eylül maddeleri taşınınca çift görünme de aynı kararla çözülür. | Engel |
| 3 | `kosullar.html` | Taslakta hiç yok. Uygulamada yoganın güvenlik kartı var: "Araç kullanırken açma", "Gebelik, epilepsi, kalp ya da akciğer rahatsızlığı … varsa önce danış" (`app/src/modules/yoga/text.js:17-19`). Koşullar bugün yalnız ışığa duyarlı nöbet uyarısını taşıyor (`kosullar.html:21`). Alarmın iOS sürümüne bağlı olduğu da yazmıyor (E3.4). "taslak" etiketi `:7`'de. | Gerekli |
| 4 | `index.html:58-59` | "Mola hatırlatıldıkça işe yaradı" ve "Nefona'nın … mola bu kuralı uygular ve her gün hatırlatır". Uygulamanın kendi kanıt notu şöyle: "20-20-20 kuralının … semptomlara etkisi gösterilemedi (Johnson & Rosenfield 2022 … DOI 10.1097/OPX.0000000000001971)" (`app/src/components/RestBreak.jsx:9-12`). Uygulamadaki kart da çalışmanın sınırını yazıyor: "Küçük ve kontrol grubu olmayan bir çalışma" (`app/src/lib/gokyuzu.js:116`). Sitede ise karşı kanıt da sınır da yok. Johnson 2022 `lib/sources.js`'te yok, o yüzden Bilim sayfasına da ulaşamaz. VARSAYIM: uygulamada 20 dakikada bir hatırlatma yok (`app/src/lib` içinde aranıp bulunamadı; `eyeBudget.js:22` bir süre bütçesidir). Öyleyse "bu kuralı uygular" cümlesi yanlıştır. `kurallar.md` §3.3 bunu işaretlemiş, ama K.3'ün ilk satırına girmemiş. | Engel |
| 5 | `index.html:6`, `:226` | "yakında App Store'da". Yayın günü App Store bağlantısı ve resmî rozetle değişmesi gerekiyor; taslağın yayın adımında yok (`YAPILACAKLAR.md:537` "App Store bağlantısı"). | Gerekli |
| 6 | `index.html:2`, `:9`, `:81` | "Her gün 15 dakikalık bir yol" ve "Sabah bir nefes". Y1'de yol 8 dakikayla başlıyor; sabah nefesi isteğe bağlı. K.3 yalnız `:86` ve `:94`'ü sayıyor; sayfa açıklaması (`:2`) ile giriş cümlesi (`:9`) de değişmeli. | Gerekli |
| 7 | `nasil-calisir.html:16` | "Apple, Google ya da e-posta ile giriş yaparsın". Google girişi `[~]`: yapılandırma ve cihaz denemesi açık (`YAPILACAKLAR.md:566-568`). E-posta girişi SMTP bağlanmadan gerçek kişide çalışmıyor (`docs/supabase/KURULUM.md:11-15`). Taslağın kendi kuralına (K.2) göre erken yazılmış cümledir. Aynı nedenle K.3'teki "hesap satırı üç giriş yolunu sayar" önerisi, SMTP bağlanana kadar çalışmayan bir yolu gizlilik sayfasına yazdırır. | Gerekli |
| 8 | `nasil-calisir.html:29`, `:31`; `site/src/main.js:93` | Mola kilidi: sitede bir yerde "5 dakikalık mola kilidi", bir yerde "bir dakikalık göz molası … kendiliğinden kilitler". Y1 kilidi `restDecision`'a bağlıyor (`SONSUZ_YOL.PLAN.v1.md` §G.3). `:31` emekli "nefes sayma"yı da anıyor; K.3 yalnız Modüller sayfasını sayıyor. | Gerekli |
| 9 | `moduller.html:16`, `index.html:175`, `destek.html:17` | Üç sorun var. (a) "Sesli yönlendirmeler önceden kaydedilmiştir: kadın ya da erkek sesi" yazıyor, ama sesler ElevenLabs ile üretildi (`app/src/lib/voicePack.js:1`). "bestelendi" için K.3'te konan ilke burada da geçerli. (b) Yoga gelince üçüncü bir ses (Nefona Hoca, ElevenLabs; `yoga-pilot/b/ders5/ders5.script.md:435`) ekleniyor. (c) "ekranda yazan cümle ile söylenen cümle aynıdır" yogada varsayılan olarak doğru değil, çünkü altyazı varsayılan kapalı (`app/src/modules/yoga/opts.js:19`). "Uygulama ses için ağa çıkmaz" cümlesi de okuma testinin konuşma tanımasıyla (`kurallar.md` §1.1) karışıyor; "sesli yönlendirme için" diye daraltılmalı. | Gerekli |
| 10 | `index.html:199` | "Rıza" kutusu üç izin sayıyor; uygulamada dört izin var (`coachLife`; `app/src/lib/consent.js:13`). | Küçük |
| 11 | `destek.html:15`, `:21` | Silme cevabı da `gizlilik.html:21` ile birlikte düzelmeli (`kurallar.md` §1.2); K.3 yalnız gizliliği sayıyor. `:21`'deki "alan adı alınınca açılır" etiketi yayın adımına bağlı (E4). | Gerekli |
| 12 | `site/public` | 404 sayfası, `robots.txt`, `sitemap.xml` yok. Vercel'in hazır 404 sayfası İngilizcedir (VARSAYIM). | Küçük |

### E3. Özellikler

1. **Yoganın adı.** Manifestte `title: 'Yoga'` (`app/src/modules/yoga/manifest.js`); ekranda "Yoga ve Meditasyon"
   (`Yoga.test.jsx:124`). Site listesi manifestteki adı basar ("Yoga"). "Ekrandaki ad = sitedeki ad" kuralı için hangisi
   olacağı seçilmeli.
2. **Yoga ses örneği sitede tam ders olmamalı.** Yoga dosyaları abonelik kapısının arkasında tutuluyor; herkese açık
   adresten inmesin diye `.vercelignore`'a giriyor (`yoga-pilot/v3/PLAN.v3.md:643-648`). Sitedeki örnek kısa bir kesit
   olur; altında sesteki cümlenin aynısı yazar.
3. **WHO-5 lisansı.** Sitede "resmî Türkçe metin" yazıyor (`site/src/main.js:96`). Ücretli uygulamada ticari kullanım lisansı
   doğrulanmadı (`YAPILACAKLAR.md:43`, `:390-392`). K.3'te yok.
4. **iOS sürümü.** Uygulama iOS 15'ten başlıyor (`project.pbxproj` `IPHONEOS_DEPLOYMENT_TARGET = 15.0`). Gerçek alarm yalnız
   iOS 26'da; eski iOS'ta bildirimle hatırlatılır (`releases.js`, 28 Eylül girdisi; `YAPILACAKLAR.md:224`). Sitede ne en
   düşük iOS sürümü ne de alarmın iOS 26 koşulu var (`destek.html:10`, `index.html:86`).
5. **(d) ve (e) ile kalan 6 yoga dersinin** K.3'te satırı yok (`ozellikler.md` §1.1, §3). "Kendi aşaması bitince" diye
   birer satır yeterli.
6. **K.7 soru 2'ye kanıt:** "sonsuz" sözcüğü uygulamanın arayüzünde hiç geçmiyor; yalnız kod yorumlarında var
   (`git grep -i sonsuz HEAD -- app/src`). Sitede ürün adı olarak kullanmamak "ekrandaki cümle" kuralıyla da tutarlı.

### E4. Gizlilik metni: K.3'e girmemiş veriler

| # | Eksik | Kanıt | Önem |
|---|---|---|---|
| 1 | Hareket izni rızanın 2. sürümüyle yazılmalı: arka planda adım okuma ve yürüyüş hatırlatması | `consent.js:13`, `:18-19`; `gizlilik.html:31` | Gerekli |
| 2 | RevenueCat: ülkesi, işlediği veri (satın alma geçmişi, cihaz ve uygulama kimliği), yurt dışı aktarım | `gizlilik.html:41`; `app/docs/APP_STORE_KURULUM.md:63-65`; `kurallar.md` §1.4 (hukukçuya 4. soru) | Gerekli |
| 3 | "E-posta adresin başka hiçbir servise gönderilmez." SMTP bağlanınca yanlış olur | `gizlilik.html:48`; `KURULUM.md:11-15` | Gerekli |
| 4 | Adı geçmeyen üçüncü taraflar: Apple konuşma tanıma, Google ile giriş, OpenRouter'ın arkasındaki model sağlayıcısı (`google/gemini-3.1-flash-lite`), SMTP servisi | `app/api/coach.js:9`; `kurallar.md` §1.4 | Gerekli |
| 5 | "Tüm verileri sil" kapsamı: Nef önbelleği, Gökyüzü tercihleri ve `gaze-flip` silinmiyor. Kod mu değişecek, metin mi? Karar yok | `kurallar.md` §1.2 | Gerekli |
| 6 | **Sitenin kendi ziyaretçi verisi.** Gizlilik sayfası yalnız uygulamayı anlatıyor. Site temayı `localStorage`'a yazıyor (`nefona-site-theme`: `site/scripts/pages.mjs` `<head>`, `site/src/main.js:30`, `:38`). Vercel barındırma erişim kaydı tutar (IP, tarayıcı; VARSAYIM: süre ve kapsam doğrulanmadı). K.6'daki "Sitede ölçüm ve izleme yok" doğru, ama "hiç veri yok" değil. | — | Gerekli |
| 7 | **Uygulamadaki aydınlatma bağlantısı boş.** `PRIVACY_URL` boşken Paywall'da gizlilik bağlantısı, hesap ekranında "Gizlilik politikası" ve rıza kartında "Aydınlatma metninin tamamı" hiç çizilmiyor. Site yayını bu açığı kapatır; yayın adımında yazmalı (E5.1). | `Paywall.jsx:16`, `:154`; `AccountStart.jsx:138`; `ConsentSheet.jsx:37`; `app/.env.example:4` | Engel |
| 8 | **Zamanlama çelişkisi.** K.2 "özellik siteye ancak cihazda `[x]` olunca girer" diyor. Oysa App Review gizlilik politikasını ve etiketi **gönderim anında** güncel ister (Apple 2.3 ve 5.1.1(i); `kurallar.md` §4.1). Y5'te konum satırı, uygulama incelemeye girmeden önce yayında olmalı. Öneri: gizlilik ve koşullar satırları K.2'nin dışında tutulur. Bunlar gönderimle çıkar; özellik anlatısı ise `[x]`'i bekler. App Store Connect'te "elle yayımla" seçilir, sitenin özellik parçası da aynı saatte açılır. VARSAYIM: inceleme süresi bilinmiyor. | — | Engel |

### E5. Yayın adımları (K.4 8. adıma eklenecekler)

1. **Gizlilik adresi derlemeye gömülüyor.** `VITE_PRIVACY_URL` derleme anında okunur (`APP_STORE_KURULUM.md:19`, `:62`;
   `Paywall.jsx:16`). Sıra şöyle olmalı: alan adı → gizlilik sayfası yayında → adres uygulamaya verilir → gönderilecek
   derleme. "Alan adı yayın günü alınır" kuralı bu sırada ilk App Store derlemesinden **önceye** düşer. Bu, K.7 soru 1'in
   önerisine bir gerekçe daha ekler.
2. **Kullanım koşulları iki yerde.** Uygulama "Kullanım şartları" diye Apple'ın standart EULA'sını açıyor
   (`Paywall.jsx:13-15`). Sitede ayrıca Nefona'nın kendi koşulları var (`kosullar.html`). Hangisi bağlayıcı, karar yok.
   Kendi koşullar geçerli olacaksa App Store Connect'te özel EULA ya da açıklamada bağlantı gerekir (VARSAYIM; hukukçuya).
3. **App Store Connect alanları:** gizlilik politikası adresi, **destek adresi (zorunlu)** ve pazarlama adresi sitenin
   adresleri olacak. Destek sayfasındaki iletişim adresi o gün çalışıyor olmalı.
4. **`destek@nefona.com` iki ayrı iş.** Gelen posta için MX ya da yönlendirme gerekiyor; Resend yalnız gönderir. Giden
   posta için de Resend alan adı doğrulaması (DNS kayıtları) gerekiyor. Supabase e-posta girişi buna bağlı
   (`YAPILACAKLAR.md:536-537`). İkisi de alan adını bekliyor. VARSAYIM: gelen posta servisi seçilmedi.
5. **Google girişinin yayını.** "Google Auth Platform → Audience → Publish app" açık (`YAPILACAKLAR.md:566-568`).
   VARSAYIM: Google izin ekranı ana sayfa ve gizlilik politikası adresini doğrulanmış alan adında ister. Bu da nefona.com'a
   bağlanır.
6. **"TestFlight commit'inden derlenir" kuralının düzeneği yok.** Vercel'in Git bağlantısı her gönderimde yeniden yayımlar.
   Öneri: ayrı bir yayın dalı ya da etiketi kullanılır, ya da `git.deploymentEnabled` kapatılıp CLI ile belirli bir
   commit'ten yayımlanır (Vercel belgesi). Depo `.git` 962 MB; Vercel'in klonlama ve derleme sınırı doğrulanmadı
   (VARSAYIM).
7. **Yayın günü küçük işler:** "taslak" etiketleri (`gizlilik.html:8`, `kosullar.html:7`) ve veri sorumlusunun unvanı ve
   adresi. `www` → çıplak alan adı yönlendirmesi. Canonical adresler `.html` ile üretiliyor (`pages.mjs`); `cleanUrls`
   açılırsa uyumsuz kalır. Geri alma yolu da yazılmalı (önceki dağıtıma dönüş).

### E6. Alan adı durumu (bugün denetlendi)

- **Kayıtlı değil:** Verisign RDAP `nefona.com` için 404 döndü; aynı sorgu `example.com` için 200 döndü
  (2026-09-30 11:42 UTC). Vercel: `available: true`, alış 11,25 USD, yenileme 11,25 USD (1 yıl).
- Bu yüzden `TASLAK.md` §5'teki "yeniden denetlenmedi" satırı bugünkü bilgiyle değiştirilebilir.
- **Risk (karar sahibin):** site adresleri, canonical ve OG adresleri, `destek@`, `VITE_PRIVACY_URL`, Google izin ekranı
  ve Resend doğrulaması hep bu alan adına bağlı. Sahibin kuralı "yayın gününe kadar alınmaz" (`YAPILACAKLAR.md:522`).
  Taslak bu bağımlılığı sahibe tek soru olarak sormalı: "Alan adı, ilk App Store derlemesinden önce alınsın mı?" Kural
  değiştirilmez, yalnız sorulur.

### E7. Ekran görüntüsü üretim yolu

1. **Y1 düzeneği web kipinde çalışıyor.** Kendi notu şunu söylüyor: iPhone'daki hatırlatma izni kartı, alarm satırı ve
   Sağlık satırı web'de yok (`docs/yol-haritasi/tasarim/Y1_5sn_duzenek/notlar.md` gözlem 10). Yoga yalnız `ios-shim.js` ile
   görünüyor. Yerel ekranlar Playwright'la çekilemez: AlarmKit kilit ekranı, yoganın yerel oynatıcısı ve kilitli ekranı
   (yoga Kapı 4), ileride WeatherKit. K.4 1. adımda bunlar için ikinci bir yol yok. Öneri: sahibin iPhone'undan ya da Mac'te
   Simülatör'den görüntü alınır. TrueDepth Simülatör'de çalışmaz (`APP_STORE_KURULUM.md:72`).
2. **Metin ile görsel ayrışabilir.** Bugünkü Ana sayfa görselinin alt metni "kurulu alarm" diyor (`index.html:89`). Yeni
   düzenekle çekilirse alarm satırı görünmez.
3. **Ölçüler tek değil.** Düzenek 390×844 ve 320×640 çekiyor (`cek.mjs`, `SIZES`). K.4 6. adım 320 × 568 diyor, son gözden
   geçirme 320, 390, 820 ve 1280. Tek bir tablo seçilmeli.
4. **Depo dışında kalan iki araç.** OG görselinin üreticisi `scratchpad/site/og.mjs` `.git/info/exclude` ile depo dışında.
   WebP dönüştürücü (`towebp.py`) eski oturumun klasöründe (`site.md` §4). İkisi de "Ekran düzeneği" maddesine girmeli.
   OG görselindeki "Gözünden başla. Kendini bütün olarak izle." cümlesi sitenin ilk ekranı (Y3) değişince yeniden
   üretilmeli.
5. **Alt metinler** (`index.html:85-140`) ekrandaki sayıları birebir anlatıyor ("3/8 durak", "0,14 logMAR"). Her yeni
   görselle yeniden yazılmalı; K.4 1. adımda yok.
6. **Mağaza görüntüleri.** Site görselleri 780×1688. App Store ise kendi boyutlarını ister (VARSAYIM: 6,9 inç,
   1320×2868). Aynı düzenek iki çıktı verirse site ile mağaza aynı ekranı gösterir.

### E8. App Store açıklaması ve ekran görüntüleriyle uyum (taslakta hiç yok)

1. **Depoda mağaza metni yok.** Tek belge `app/docs/APP_STORE_KURULUM.md` ve o da eski:
   - adı "Eyelume: Görme Takibi" (`:31-33`); uygulamanın görünen adı ise Nefona (`Info.plist:20`, `capacitor.config.json`
     `appName`);
   - iki ürün sayıyor, aylık ve yıllık (`:35-37`); kod, site ve yol haritası üç plan diyor (haftalık, aylık, yıllık):
     `Paywall.jsx:23-25`, `index.html:228`, `kosullar.html:27`, `YAPILACAKLAR.md:514`.
2. **Tek kaynak.** Konumlandırma cümlesi "deneme ekranında, Premium kartında ve App Store metninde aynen kullanılır"
   (`docs/yol-haritasi/YENIDEN_DUSUNME.md:22`). Sitede bu cümle yalnız varsayılan açıklamada ve OG görselinde duruyor;
   ana sayfanın başlığı başka.
3. **Önerilen K.4 5b adımı.** Her parçada şunlar sitenin Yenilikler sayfasıyla aynı gün güncellenir: App Store açıklaması,
   alt başlık, promosyon metni, "Bu sürümdeki yenilikler" (= `releases.js` girdisi) ve mağaza ekran görüntüleri
   (Apple 2.3, 2.3.3, 2.3.7; `kurallar.md` §4.1). K.5 "bitti" tanımına da "site = mağaza sayfası" maddesi girer.
4. **Yaş.** Site "18 yaş ve üstü" diyor; App Store yaş derecelendirmesinin ne seçildiği depoda yazmıyor (VARSAYIM).
5. **DSA tacir durumu** açık (`YAPILACAKLAR.md:517`). Tacir seçilirse iletişim bilgisi mağazada görünür. Bu bilgi gizlilik
   sayfasındaki veri sorumlusu bilgisiyle aynı olmalı.

### E9. Dil (taslakta hiç yok)

- Uygulama yalnız Türkçe: `CFBundleDevelopmentRegion` = `tr` (`Info.plist:8`); yalnız `Base.lproj` var; `setupText('tr')`.
  Site `lang="tr"` (`pages.mjs`). Bugün tutarlı.
- `YAPILACAKLAR.md:539` "Sonra: İngilizce sürüm" diyor. İngilizce uygulama gelmeden İngilizce site, sunulmayan bir dili
  tanıtır (2.3.1 riski; VARSAYIM).
- Sitede "Uygulama Türkçedir" satırı yok. `destek.html:10`'daki "Hangi telefonlarda çalışır?" cevabına dil ve en düşük iOS
  sürümü eklenmeli.
- Mağazanın açılacağı ülkeler (DSA notu) belli olunca hukuk metinlerinin kapsamı (AB için GDPR) netleşir (VARSAYIM;
  hukukçuya).

### E10. Erişilebilirlik (taslakta ve planda ölçüt yok)

- `SONSUZ_YOL.PLAN.v1.md`'de "erişilebilir", "VoiceOver", "kontrast" ve "Hareketi Azalt" geçmiyor (grep). Sitenin ilk
  sürümü bir kez erişilebilirlik incelemesinden geçmişti (`YAPILACAKLAR.md:525-527`). Sonraki parçalar için kural yok.
- Dört ses düğmesinin adı da "Dinle" ya da "Durdur" (`index.html:179-185`, `site/src/home.js:129`). Ekran okuyucu hangi
  sesin, hangi cümlenin çalacağını söylemiyor. Yoga örneği eklenince bir düğme daha aynı ada sahip olur.
- Var olanlar korunmalı: Hareketi Azalt (`home.css:6`, `site.css:251`, `main.js:175`), atlama bağlantısı, Escape ile menü.
- K.5'e eklenecek madde: her görselin alt metni o görselle aynı; E tadımlığı klavyeyle yapılabiliyor; iki temada kontrast
  ölçülüp kayda geçti; %200 yakınlaştırmada taşma yok; ses örneklerinin yazısı görünür ve otomatik çalmıyor.

### Taslağa önerilen düzeltmeler (özet)

1. §4 silinir; K.3'e iki yeni sahip kararı işlenir (E1).
2. K.3'ün "Bugünkü uygulama" satırına şunlar eklenir: Yenilikler'deki doğrulanmamış maddeler, 20-20-20 cümlesi, giriş
   yolları, ses cümleleri, mola kilidi, destek ve koşullar sayfaları, E4'teki 1–7 (E2, E4).
3. K.2'ye istisna: gizlilik ve koşullar metni App Store gönderimiyle çıkar; özellik anlatısı `[x]`'i bekler (E4.8).
4. K.4'e eklenir: yayın öncesi uygulama işleri (`VITE_PRIVACY_URL`, koşullar bağlantısı, App Store Connect adresleri,
   e-posta, Google), commit sabitleme düzeneği, cihaz görüntüsü yolu, OG ve WebP araçları, 5b mağaza uyumu (E5, E7, E8).
5. K.5'e eklenir: site = mağaza sayfası; erişilebilirlik maddeleri (E8, E10).
6. K.7'ye iki soru eklenir: alan adı ilk App Store derlemesinden önce alınsın mı (E6); İngilizce site İngilizce uygulamayı
   beklesin mi (E9).
