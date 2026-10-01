# Sonsuz yol · Üst akıl planı (sürüm 1)

Tarih: 2026-09-29. Durum: **PLAN, sahibin onayına sunuluyor.** Uygulama koduna dokunulmadı, depoda hiçbir dosya
değişmedi, git komutu ve ücretli çağrı yapılmadı. Sonsuz yolun kodu, onaylı yoga planının karar 7'si gereği yoga
yayınından sonra yazılır; bu belge yalnız planı verir.

**Dayandığı çalışma notları** (bu klasörde; her biri kendi kaynaklarını satır satır verir): `merdiven.md` (merdivenler,
ilerleme sözleşmesi, gün gün yol), `gelisim-nef.md` (Gelişim'de izleme, ölçü kuralı, Nef'in gidişat yorumları),
`gunun.md` ("Günün nasıl geçti", ekran süresi, kanıt kartları), `hava-ay.md` (konum, hava, yağmur, ay, bildirim),
`bes-saniye.md` (ilk 5 saniye, devamlılık, bağlılık göstergeleri). Benzetim betikleri: `sim_merdiven.mjs` ve
`today_v4.js` (yol), `sim.mjs` ve `sim2.mjs` (ölçü kuralı), `moontest.mjs` (ay evresi). Bu belge yazılırken üç
benzetim yeniden koşuldu ve notlardaki sonuçları birebir verdi: yol 30 günde ortalama 15,3 dk, 90 günde 15,7 dk; bugünkü
metrik kuralında yanlış "geriliyor" %27,2, önerilen kuralda %6,9; ay evresinde USNO'ya göre en büyük sapma 1,9 dk.

**Bağlayıcı girdiler:** `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md` (bağlayıcı iş sırası dahil),
`yoga-pilot/SAHIP_ISTEKLERI.md` madde 7, onaylı `yoga-pilot/v3/PLAN.v3.md` (bu plan onu değiştirmez; uyumu §2.3'te).
Mevcut yol belgeleri: `YAPILACAKLAR.md`, `tasarim/YOL.ilerleme.md`, `YOL.moduller.md`, `YOL.nef.md`.

**Kurallar:** Sağlık iddiası yoktur. Bilimsel iddialar yalnız notlarda PubMed'den doğrulanmış kayıtlara dayanır ve PMID
ile DOI taşır; PubMed'de olmayan çalışmalar dayanak yapılmaz. Apple iddiaları notlarda okunan Apple belgelerine, kod
iddiaları `dosya:satır` biçiminde 2026-09-29 tarihli çalışma ağacına dayanır (yollar `app/src/` altına göredir; bu belge
için ayrıca okunup doğrulananlar §3'te işaretli). Kanıtın vermediği her sayı **VARSAYIM** diye yazılır.

---

## 1. Tek sayfada

**Ne değişir.** Yol her gün aynı kalmaz: kısa başlar, her gün bir adım büyür ve bitmez. İlk gün yol 8 dakikadır:
haftalık E testi, Çemberler, 1 dakika nefes ve göz kırpma. 2.–9. günlerde her gün bir yeni adım gelir ve 9. günde bugünkü
tam yola ulaşılır. Sonra yol çeşitlemeyle (tekrar, süre, nefes kalıbı), döndürmeyle ve 90. günden sonra haftalık odakla
değişmeye devam eder. Yoga, onaylı plandaki gibi 3. günden her gün bir dersin kısa sürümüyle yoldadır. Her modül kaydını
tek merkeze yazar; Gelişim her modülü aynı dört katmanla gösterir; Nef yalnız merkezin doğruladığını söyler. Ana sayfa her
günün ilk açılışında kişiye ait tek bir doğru cümleyle, ay ve hava şeridiyle açılır. Akşamki üç soruluk form kalkar;
yerine tek dokunuşluk "Günün nasıl geçti?" ve o güne uyan, kaynağı doğrulanmış tek bir bilgi kartı gelir. Mevcut yolun
yapısı, ölçümleri ve oyunları aynı kalır.

**Kişi ne görür** (her gün açan yeni kullanıcı; benzetimdir, cihazda denenmedi):
- **1. gün:** Ana sayfanın ilk cümlesi "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." olur.
  Tarih satırında ayın evresi görünür; hava, kişi isterse Gökyüzü kartında görünür. Yol 8 dakikadır. Akşam 18.00'den sonra günün nasıl
  geçtiği tek dokunuşla kaydedilir.
- **7. gün:** Yol 15 dakikadır. Bir hafta içinde sağ–sol bakış, "üçü birlikte", yukarı–aşağı, uzağa bakış, yakın–uzak,
  Yılan, Bugünün görevi, Fark Ettin mi? ve beş yoga dersi yola girmiş, nefes 3 dakikaya çıkmıştır. 5. gün ilk rapor
  kendiliğinden açılmıştır. Günün ilk cümlesi her gün değişir ("Bugün yeni: yakın–uzak.").
- **30. gün:** İlk 30 günün yol ortalaması 15,3 dakikadır (en kısa 8, en uzun 18; E testi ve okuma günleri 17–18). 22. gün görmede
  başlangıç değeri hazır olur, kırpma 10 tekrara çıkar ve kısa tutmalı nefes günleri başlar. 28. gün iris haritası
  başlangıçla yan yana gelir, 29. gün Nef'in ilk aylık değerlendirmesi gelir. Gelişim'in "Yolun" bölümü her modülün
  basamağını ve 28 günlük düzenini gösterir.
- **90+ gün:** Yol ortalaması 15,7 dakikadır ve hiçbir gün 20 dakikayı aşmaz. 43. ve 57. günlerde yeni çeşitlemeler
  açılır, her hafta bir modül odak olur, 57. ve 85. günlerde aylık Nef gelir. Ara verip dönen kişi hiçbir sayının
  sıfırlandığını görmez ve "Kaldığın yerden" cümlesiyle karşılanır. Yürüyüş, uyku, tepki ve gökyüzü molası kendi
  aşamalarında aynı sözleşmeyle eklenir.

**İsteklerin nasıl karşılandığı**

| İsteğin | Karşılığı |
|---|---|
| Her modül Gelişim'e katkı sağlar; esas beyin merkezdir | Her modül tek merkeze yazar; Gelişim her modülde düzen, basamak, ölçü ve değişimi aynı iskeletle gösterir. Ölçüsü olmayan modül (göz egzersizleri, Yılan, Çemberler) düzeniyle ve basamağıyla izlenir; ona ölçü uydurulmaz. Merkezin değişim kuralı yenilenir: bugünkü kuralda gerçek bir değişim yokken kişilerin %27'si bir kez "geriliyor" görüyor, yeni kuralda %7 (§3.B) |
| 5 saniye kuralı | Yeni ekran yoktur. Günün ilk açılışında Ana sayfanın üstünde ay şeridi (Apple'ın atıf cevabından sonra hava da), kişiye ait tek cümle ve "Yeni" rozeti görünür; sıfırlar, kırık seri ve tam ekran pencereler ilk 5 saniyeden çıkar (§3.F). Dürüst sınır: 5 saniyede bir ölçüm yapılamaz; ilk saniyeler merak ve kişisel bir cümle verir |
| Merdivenler ve nefes kalıpları | Nefes 1 → 2 → 3 dakika (son sözün; yolda en çok 3, onaylı yoga kararı 5.1). Göz: kırpma → sağ–sol → üçü birlikte → yukarı–aşağı → uzağa bakış → yakın–uzak → daire. "Yüzlerce kombinasyon" güvenli bir zarfın içinde üretilir (tutmasız 40, kısa tutmalı 99, beklemeli 629 süre bileşimi). Senin 4·2·4·4'ün 43. günden sonra, haftada en çok bir gün ve güvenlik koşullarıyla gelir; hızlı soluma hiç yoktur (§3.A) |
| Aralar | İki bölüm arasındaki mola yolun arasıdır: 1. gün 1, 2. gün 2, 3. günden sonra 3 dakika nefes; kalan süre "2 dk daha" düğmesi ya da gözler kapalı dinlenmedir. Meditasyon ayrı durak değildir; yolun sesli rehberli dersi yoganın kısa dersleridir (onaylı yoga kararı 5.1) |
| Nef'in gidişat yorumları | Her sabah telefonda üretilen tek cümle, yeni basamakta ya da ilk doğrulanmış değişimde bir olay satırı, Pazartesi haftalık, 29./57./85. günde aylık değerlendirme. Nef yalnız merkezin doğruladığı durumu söyler; sağlık, tanı ve başkasıyla karşılaştırma yoktur (§3.C) |
| "Günün nasıl geçti" ve ekran süresi sorusu | Apple, toplam ekran süresini uygulamalara sayı olarak vermiyor; veri yalnız Apple'ın kapalı rapor görünümünde gösterilebiliyor (Apple belgesi, §3.D). Uygulama bugün de ekran süresini okumuyor. Bu yüzden "Bugün kaç saat ekrana baktın?" sorusu kalkar; yerine ölçtüğümüz şey adıyla gösterilir: "Nefona'da bugün 11 dk göz çalışması". Akşam akışı 10 saniyede biter: ölçülenler, tek dokunuş, o güne uyan tek bilgi kartı. PubMed bilgisi canlı aramayla değil, önceden doğrulanmış kart kütüphanesinden gelir |
| Emoji ya da puan | Çizilmiş beş yüz ve altlarında Türkçe etiket (karar 3) |
| Hava, yağmur, ay, konum ve PubMed | Hava Apple WeatherKit'ten gelir; konum yalnız kişi isteyince ve yaklaşık olarak alınır, izin yoksa şehir seçilir. Ay evresi telefonda, ağsız hesaplanır. Ay kartında "Bilim ne diyor?" satırı vardır: ayın uykuya etkisi tartışmalıdır, dört kaynakla. Nef hava bilgisi üretmez, çünkü bir dil modeli ölçüm kaynağı olamaz. "En doğru kaynak" iddiası yazılmaz: Türkiye için bağımsız karşılaştırma bulunamadı, MGM'nin açık bir geliştirici arayüzü yok (§3.E) |
| Yağmur bildirimi | "Bugün yağmur bekleniyor." Ayrı bir tercihtir, varsayılan kapalıdır ve ilk yağmurlu günde bir kez sorulur. Günde en çok bir bildirim sabah gelir. Türkiye'de dakikalık yağış verisi olmadığı için "yağmur başlamak üzere" bildirimi yapılamaz (§3.E) |
| Yeni modüller (yürüyüş, uyku, hareket, dikkat, gökyüzü) | Hepsi aynı sözleşmeyle takılır: kayıt, alan, merdiven verisi ve Nef satırı. Tasarımları `YOL.moduller.md`'dedir; sıradaki (d) ve (e) aşamalarında gelir |

**Bugünkü kullanıcı ne görür.** Yolun bölümleri, ölçümleri ve oyunları aynı kalır. Yoldaki nefes 5 yerine 3 dakikadır ve
"2 dk daha" düğmesiyle 5'e tamamlanır; mola yine 5 dakikadır (onaylı yoga kararı 5.1). Daire ile Yukarı–aşağı gün aşırı
gelir. Bugünün görevi herkesin yoluna girer. Çeşitlemeler eski kullanıcıya haftada bir basamak açılır. Akşam formunun
yerine tek dokunuş gelir. Karar 2 onaylanırsa bazı Gelişim hapları "doğrulanmış bir değişim yok" der.

**Uygulama sırası ve iş büyüklüğü.** Kod, yoga yayınından (yoga Kapı 8) sonra başlar; her aşama ayrı onay, test,
TestFlight ve cihaz denemesiyle ilerler (§3.I).

| Aşama | İş | Büyüklük (VARSAYIM) |
|---|---|---|
| S0 (şimdi, yoga üretimiyle birlikte) | Plan onayı, ekran tasarımları, App Review'a atıf sorusu, hukukçu soruları; kod yok | — |
| Y1 | İlerleme motoru, nefes ve göz merdivenleri, açılma kuralları ((c) adımı) | 8–10 iş günü |
| Y2 | Gelişim: yeni ölçü kuralı, okuma testinin Göz alanına girmesi, "Yolun" bölümü | ≈ 5 iş günü |
| Y3 | İlk 5 saniye: günün cümlesi, rozet, sıfırların kalkması, açılış ekranı | ≈ 3 iş günü |
| Y4 | "Günün nasıl geçti", "Günün" sayfası, ay kartı, kanıt kartları | ≈ 5 iş günü |
| Y5 | Hava, konum, yağmur bildirimi (Swift eklentisi; Mac ve cihaz gerekir) | 7–8 iş günü |
| Y6 | Nef haftalık ve aylık değerlendirme, olay satırı ((f) adımı) | 6–8 iş günü |

Toplam ≈ 34–39 iş günü; senin onay ve dinleme sürelerin hariç ≈ 8–11 hafta. Yoga yayını plan onayından ≈ 7–12 hafta
sonra beklendiği için sonsuz yolun son aşaması kabaca 2027'nin ilk çeyreğine düşer (VARSAYIM). Sonra (d) sessiz ölçüm
ve (e) uyku, yürüyüş, tepki ve gökyüzü molası kendi planlarıyla gelir.

**Maliyet.** WeatherKit, Apple geliştirici üyeliğine dahil ayda 500.000 çağrı verir. Havayı açan 1.000 günlük kullanıcıda
ek ücret yoktur; 5.000 kişide ya ücret yoktur ya da ayda 99,99 USD; 10.000 kişide ya ücret yoktur ya da ayda 249,99 USD
(bir hava isteğinin kaç çağrı sayıldığı Apple belgesinde yok: VARSAYIM). Nef kişi başına ayda ≈ 35 istek atar; model
fiyatı belli olunca hesaplanır (VARSAYIM). Günün cümlesi, olay satırı, kanıt kartları ve ay hesabı hiçbir hizmete çağrı
yapmaz. Bu plan yeni ses üretmez; ElevenLabs maliyeti yoktur.

**Gizlilik değişiklikleri**
- Yeni izin: yalnız "Uygulamayı Kullanırken" konum, varsayılanı yaklaşık konum; yalnız kişi hava kartında "Konumumu
  kullan"a dokununca istenir. Koordinat 2 ondalığa yuvarlanıp yalnız Apple'ın hava servisine gider; sunucumuza ve Nef'e
  gitmez. Telefonda yalnız son yuvarlanmış konum tutulur ve izin kapanınca silinir.
- Yeni rıza `weather` (ayrı, işaretsiz). Gizlilik sayfasındaki "konum sunucuya hiç gitmez" cümlesi genişletilir ve App
  Store gizlilik etiketine "Yaklaşık konum · uygulama işlevi · kimliğe bağlı değil" eklenir; üçü aynı sürümde çıkar.
- Nef'e giden paket küçülür: görme sayıları çıkar, sayı yerine durum sözcükleri gider; ruh halinden yalnız durum ve
  kayıt sayısı gider. Rıza metni sürüm 2 olur ve izin vermiş kişiye bir kez yeniden sorulur (karar 6).
- Ruh hali, etiketler, hava bağlamı ve günün ilk açılış kaydı yalnız telefonda durur; "Tüm verileri sil" hepsini siler.
- Kamera izin metni İlk Bakış'taki sayımı ve (d)'deki kısa mesafe ölçümünü de söyleyecek biçimde güncellenir (App Review
  5.1.1).
- Konumun yurt dışına (Apple) gitmesi ve ruh hali verisinin KVKK'deki sınıfı hukukçuya sorulur.

**Senden istenen kararlar (önerimle).** Notlardaki 45 açık sorunun 35'ini kendim karara bağladım; kalan 10'u aşağıdaki
altı karara toplandı. Hepsinin gerekçesi §2.2'dedir.
1. **Planın onayı ve sıra.** Öneri: bu plan ve S0 → Y1 → Y6 sırası onaylansın. Kod yine yoga yayınından sonra yazılır.
2. **Gelişim'in yeni ölçü kuralı.** Aynı günün turları tek değer sayılır; son 28 güne bakılır; bir sonuç ancak iki hafta
   art arda başlangıcından belirgin ayrılırsa "değişim" sayılır; oyun ve görev sonuçlarında "iyileşiyor" yerine
   "görevdeki sonucun artıyor" denir; okuma testi Göz alanına girer. Sonuç: bugün "iyileşiyor" gören bazı kişiler
   "doğrulanmış bir değişim yok" görür; sürüm notunda tek cümleyle yazılır. Öneri: evet.
3. **"Günün nasıl geçti" ölçeği.** Öneri: çizilmiş beş yüz ve altlarında "Çok kötü · Kötü · İdare eder · İyi · Çok iyi".
   Öbür seçenekler 1–5 sayı ya da telefonun kendi emojileri; emojiler kültüre göre ters okunabiliyor.
4. **Hava için konum.** Öneri: kişi isterse yaklaşık konum, istemezse şehir seçimi. Öbür seçenek yalnız şehirdir; izin
   hiç sorulmaz ama hava il merkezine göre gelir.
5. **İlk 5 saniye.** (a) Açılış ekranındaki logo kalksın (Apple'ın önerisi; senin onayladığın açılış ekranı değişir);
   (b) Ana sayfada sıfırlar ve kırık seri görünmesin: seri 3 gün ve üstündeyken görünür, altında "N gün seninle" yazar;
   (c) Yenilikler ve rıza pencereleri günün ilk dokunuşundan sonra açılsın. Öneri: üçü de evet.
6. **Nef'e giden paket ve rıza.** Nef'e sayı yerine durum sözcükleri gitsin, görme sayıları çıksın, yol basamakları ve
   ruh halinin durumu eklensin; rıza vermiş kişiye yeni metin bir kez sorulsun. Telefonda üretilen kural cümleleri
   rızasız da görünsün, çünkü veri telefondan çıkmaz. Öneri: evet.

---

## 2. Notlar arasındaki çelişkiler, seçimler ve onaylı yoga planıyla uyum

### 2.1 Çelişkiler ve seçimler

| # | Konu | Notlar ne diyor | Seçim | Gerekçe |
|---|---|---|---|---|
| 1 | Nefes merdiveni | `merdiven.md`: 1 → 2 → 3. `YOL.ilerleme` §5.1: 1-1-2-2-3-3-4-4-5. Sahibin önceki sözü: 1, 1, 2 | **1 → 2 → 3, yolda en çok 3** | Sahibin son sözü "ilk önce 1 dakika, sonraki gün 2, 3 gibi"; onaylı yoga kararı 5.1 yolda en çok 3 dk diyor. Benzetimde iki dizinin yol farkı 0,1 dk; You 2021 kısa başlangıcı destekliyor |
| 2 | Olay satırının yeri | `gelisim-nef.md` §7.1: Ana sayfadaki çevrimiçi Nef kartı. `bes-saniye.md` §3.2: üstteki Nef satırı | **Üstteki Nef satırı**; kart aynı gün olayı yinelemez | Çevrimiçi kart ilk görünen alanın altında ve ağı bekliyor (`coach.js:13` zaman aşımı 10 sn); olay satırı kural şablonudur, ağ istemez |
| 3 | "Günün nasıl geçti"nin değişim kuralı | `gunun.md` §8: bugünkü `metricTrend` (ilk yarı / son yarı). `gelisim-nef.md` §4: yeni kural | **Yeni kural** (kendi beyanı türü) | Merkezde tek kural; ilk yarı / son yarı kuralı bütün geçmişe bakıyor ve gürültüye duyarlı (§3.B) |
| 4 | Nef'e ruh hali | `gunun.md` §8: `mood7`, `mood28` ortalamaları. `gelisim-nef.md` §6: sayı değil durum sözcüğü | **`n7` (kaç akşam kayıt) ve `moodStatus`** | Nef iki sayıdan yön çıkaramaz; durumu merkez hesaplar. Veri de asgarileşir |
| 5 | Ay kartının bilim metni | `gunun.md` `dolunay` kartı Cordi 2014'e "daha büyük veriler bulamadı" içeriğini yüklüyor. `hava-ay.md` §6.1: Cordi'nin özeti PubMed'de yok, içeriği doğrulanamadı | **`hava-ay.md` metni**, tek metin iki yerde | Büyük çalışmalar için doğrulanmış kayıtlar var (Haba-Rubio 2015, Smith 2017); Cordi 2014 kaynak satırına girmez |
| 6 | Koordinat yuvarlama | `gunun.md`: ≈ 0,1° (VARSAYIM). `hava-ay.md`: 2 ondalık | **2 ondalık** | Yaklaşık konum zaten 1–20 km sapıyor; Apple'ın tanımında 3'ten az ondalık "Coarse Location" |
| 7 | WeatherKit arayüzü | `gunun.md`: Swift ya da REST. `hava-ay.md`: Swift | **Swift** | REST her istekte imzalı belirteç ister, anahtar sunucuda durmalı; Apple'ın REST sayfası yerel uygulamaya Swift'i öneriyor |
| 8 | Ay evresi | `gunun.md`: WeatherKit ya da yerel (±1 gün). `hava-ay.md`: yerel Meeus, USNO ile sınandı | **Yerel Meeus** | 50 evrede en büyük sapma 1,9 dk, Türkiye gününde kayma 0; "29,53 güne bölme" üç evreden birinde günü kaydırıyor. Konum ve ağ gerekmez |
| 9 | Hava bağlam deposu | `gunun.md`: `gozolcum:day-context` (şehir dahil). `hava-ay.md`: `skyLog` (şehir ve koordinat yok, 90 gün) | **Tek depo `gozolcum:sky-log`, şehir ve koordinat yok, 90 gün** (VARSAYIM süre); `gunun` modülünün `storageKeys`'inde | Veri asgariliği; "Tüm verileri sil" kapsar |
| 10 | Yağmurlu günlerin betimleyici karşılaştırması | `gunun.md`: 10 yağmurlu + 10 kuru gün. `hava-ay.md`: 8 + 8 | **10 + 10** (VARSAYIM) | Temkinli olan seçildi; yalnız betimleme, neden-sonuç yok |
| 11 | Akşam kartının saati | `hava-ay.md` §1: "19.00'dan sonra". `gunun.md`: 18.00 | **18.00** | Kod: `lib/profileQuestions.js:174` `EVENING_HOUR = 18`; 19.00 alarmın akşam kartıdır (`lib/alarm.js:9`). `hava-ay.md` bu satırda yanılıyor |
| 12 | Ana sayfa başlığında hava | `bes-saniye.md`: "◐ ilk dördün · 18° · 16.00'dan sonra yağmur". `hava-ay.md` A6: Apple'ın atıf kuralı hava gösteren her yere uygulanıyor | **App Review'un yazılı cevabına kadar başlıkta yalnız ay**; hava tam atıfla Gökyüzü kartında. Cevap olumluysa başlığa sıcaklık ve yağmur eklenir | Atıf zorunluluğu Apple'ın kuralıdır; ihlali yayını durdurur |
| 13 | Yağmur bildiriminin kesinti düzeyi | `hava-ay.md`: `active`. `bes-saniye.md` §11: `passive` notu | **`active`** | Kişi bildirimi açıkça istedi; `passive` ekranı yakmaz, sabah bilgisi kaçabilir |
| 14 | "Sonra" düğmesi | `gunun.md`: 2 saat sonra. Bugünkü kod: ertesi akşam (`profileQuestions.test.js:45-51`) | **2 saat sonra** (VARSAYIM) | Kart artık günlük bir kayıttır; ertesi akşama ertelemek o günün kaydını kaybettirir |
| 15 | Nef'e okuma testi | `gelisim-nef.md`: yalnız `readingStatus`, hız gitmez. Bugün `readingWpm` gidiyor (`coach.js:54`) | **`readingStatus`**; hız çıkar | İstemde okuma hızının anlamı tanımlı değil (`coachCore.js:67-83`) |
| 16 | Uyku ve yürüyüşte Nef | `YOL.moduller.md` §5: `sleep`, `walk.steps7` Nef'e. `gelisim-nef.md` §6 ve `consent.js:20`: Sağlık verisi gitmez | **Sağlık kaynaklı alan gitmez**; yalnız kişinin düğmeyle yazdığı alanlar | Rıza metnindeki söz korunur |
| 17 | Haftalık Nef'in gün sayısı | `YOL.nef.md` §5.2: `domains[d].days7`. `gelisim-nef.md` §3.4: o alan kayıt sayıyor | **Gün şeridinden** (`growthMap().domains[d].strip`) | `lib/dataHub.js:81` pencere içindeki kaydı sayıyor, günü değil |
| 18 | Gökyüzü molası yolda | `YOL.ilerleme` §5.5: 4. günden, Uzağa bakışla gün aşırı. `YOL.moduller` §4.8: haftada 2, gündüz, yürüyüşle aynı döndürme | **`YOL.moduller` kuralı, (e) aşamasında** | `merdiven.md` §5.10'un önerisi; iki "dışarı" durağı tek döndürme grubunda |
| 19 | 14. gün iyi oluş | `YAPILACAKLAR.md` "Tasarımın özü": 14. gün kilometre taşı. Kod: WHO-5 hiç yapılmadıysa ilk günden "zamanı geldi" ve Ana sayfada hiç çıkmıyor (`lib/progress.js:19, 41`) | **14. günde Ana sayfada bir kez kart**, yolda değil | Onaylı tasarım sözüne kod uydurulur; 14 günde bir kuralı aynen kalır |
| 20 | Hafif gün | `YAPILACAKLAR.md` "Tasarımın özü": ≈ 7 dk. `merdiven.md` §11.5: yalnız kişinin isteğiyle | **İlk sürümde yok** | Onaylı dört karardan biri değil, kanıtı yok; "sonra yaparım" ve bırakma göstergesi (G6) ihtiyacı gösterirse ayrı iş |
| 21 | Nef'e giden modül sınırı | `YOL.moduller.md` §2.6: boş modül `null`. Onaylı yoga planı §D.5: yoga dışarıda kalabilir | **Sınır 10 kalır; son 7 günde kaydı olmayan modül `null` döner** | Yeni modüller geldikçe sıra kalabalığı kalkar; yoga dışarıda kalmaz |
| 22 | Nefesin 90+ gün odak haftası | `merdiven.md` §5.1: molanın tamamı, 5 dk. Onaylı yoga planı karar 5.1: (c) ile yolda en çok 3 dk | **Yolda 3 dk kalır**; odak haftasında "2 dk daha" öne çıkar | Onaylı plan değiştirilemez; kişi yine 5 dakikaya tek dokunuşla tamamlar |

### 2.2 Notların açık kararları: nasıl kapandı

Beş notta 45 açık soru var. Bunların 10'u §1'deki altı karara toplandı; kalan 35'ini ben karara bağladım.

| Not ve soru | Karar | Gerekçe |
|---|---|---|
| `merdiven` 1 (nefes dizisi) | 1 → 2 → 3 | §2.1 satır 1 |
| `merdiven` 2 (Yılan ile dikkat durakları) | Bugünkü kural kalır | Dikkat durakları ölçü üretiyor; Yılan Ana sayfadan hep açık. Sonucu dürüstçe: yeni kullanıcı Yılan'ı yolda 90 günün 24'ünde görür (§3.J) |
| `merdiven` 3 (Bugünün görevi eski kullanıcıda) | Herkesin yolunda, 2. günden | Farkındalık sahibin istediği modül; ek yük 1 dk |
| `merdiven` 4 (Ara kilidi) | Yol molası ancak kalan göz çalışması bütçeyi aşacaksa başlar | Nefes 1 dk olunca yeni kullanıcı 1. ve 2. gün 4 dk boş beklerdi. Eski kullanıcıda kilit her gün yine başlar; göz bütçesi kuralı değişmez. Cihazda doğrulanır |
| `merdiven` 5 (hafif gün) | İlk sürümde yok | §2.1 satır 20 |
| `merdiven` 6 (nefes çeşitlemesi) | "Günün ritmi" 8. gün, kısa tutma 22. gün, bekleme 43. gün; 4·2·4·4 yalnız 43. günden sonra, haftada en çok bir gün, koşullarla | Güvenlik zarfı (§3.A.5); Marchant 2025 dakikada 6 nefesi kutu ve 4-7-8'den üstün buldu |
| `merdiven` 7 (kapanış nefesi) | İlk sürümde yok | Mevcut Göz kırpma grubunun içeriği değişmesin; grubun süresi cihazda ölçülmedi |
| `merdiven` 8 (eski kullanıcıda çeşitleme hızı) | Haftada bir basamak (`Dvar`) | Aylardır egzersiz yapan kişi güncellemenin ertesi günü 15 tekrarla karşılaşmaz |
| `merdiven` 9 (gökyüzü molası) | `YOL.moduller` §4.8, (e)'de | §2.1 satır 18 |
| `gelisim-nef` 1, 2, 5, 6 (kural, metin, okuma, "karışık") | **Sahibe: karar 2** | Gelişim'de görünür davranış değişir |
| `gelisim-nef` 3 (göz egzersizlerinin ölçüsü) | Seçenek A: düzen, basamak, tamamlanan tekrar | Etkiyi ölçen bir test uygulamada yok; ölçü uydurulmaz. Doğrulanmış 16 maddelik anket (CVS-Q, Seguí 2015) için lisans ve Türkçe geçerlik araştırılır; sonuç ayrı plan |
| `gelisim-nef` 4 (Sağlık alanları Nef'e) | Gitmez | §2.1 satır 16 |
| `gelisim-nef` 7 (olay satırı günde bir) | Günde en çok bir; günün cümlesinin yerine geçer | §2.1 satır 2 |
| `gelisim-nef` 8 (görme sayıları) | **Sahibe: karar 6** | Rıza metni değişir |
| `gunun` 1 (ekran süresi) | Nefona içi süre gösterilir; Apple'ın raporu `YAPILACAKLAR` §2'deki planla ve ücretsiz gelir | App Store 4.10: Screen Time özellikleri ücretlendirilemez; bu kural `YAPILACAKLAR` §2'ye eklenir |
| `gunun` 2 (ölçek) | **Sahibe: karar 3** | Sahibin kendi sorusu |
| `gunun` 3 (etiketler) | Evet, altı etiket, 7. günden sonra, isteğe bağlı, en çok 3 | İlk hafta tek dokunuş (5 sn kuralı); Eisele 2020 uzun anketin yükünü gösterdi |
| `gunun` 4 (gece telefonu sorusu) | Profilim → Sorularım'da isteğe bağlı kalır; akşam kartında yok | Sahibin "basit sorular değil" sözü; eski cevaplar bozulmaz |
| `gunun` 5 (kart listesi) | Yayına yalnız PMID ve DOI'si doğrulanan kartlar girer (§3.D.4) | Kanıt kuralı |
| `gunun` 6 (konum) | **Sahibe: karar 4** | Yeni izin |
| `gunun` 7 (yağmur bildirimi varsayılanı) | Kapalı, ilk yağmurlu günde bir kez sorulur | Mevcut rıza ilkesi: "Şimdi değil" hiçbir şeyi kapatmaz (`consent.js:1-5`) |
| `gunun` 8 (Apple Sağlık'a ruh hali yazmak) | Hayır | İzin metni "hiçbir veri yazmaz" diyor (`Info.plist:9-10`) |
| `gunun` 9 (Nef ruh halini görsün mü) | **Sahibe: karar 6** | Rıza metni değişir |
| `hava-ay` A1 (Open-Meteo) | Hayır | Abonelikli uygulama ticari sayılır (49 USD/ay), ikinci yurt dışı alıcı ve ikinci atıf |
| `hava-ay` A2 (Nef'e yağışlı gün sayısı) | İlk sürümde hayır | Rıza metnini genişletir; kazancı küçük |
| `hava-ay` A3 (dünya şehirleri) | İlk sürümde hayır; yurt dışında konum izni yine çalışır | 81 il listesi yeterli başlangıç |
| `hava-ay` A4 (ay doğuş/batış) | İlk sürümde hayır | Konuma bağlı; 5 sn şeridine sığmaz |
| `hava-ay` A5 (yağmur–ruh hali satırı) | Evet, 28 günden sonra, 10 + 10 günde, yalnız betimleme | §2.1 satır 10 |
| `hava-ay` A6 (atıf) | App Review'a sorulur; cevaba kadar başlıkta yalnız ay, bildirimde "Kaynak: Apple Weather" | §2.1 satır 12 |
| `hava-ay` A7 (arka planda sabah tazeleme) | İlk sürümde hayır | Apple zamanı garanti etmiyor (`earliestBeginDate`); tasarım buna dayanamaz |
| `hava-ay` A8 (bildirim saati) | Alarm o gün çalacaksa alarm + 15 dk, değilse 07.30; 06.30–09.00 sınırı | Alarm ekranıyla üst üste gelmez (VARSAYIM saatler) |
| `hava-ay` A9 (yağmur eşiği) | 07.00–22.00'de herhangi bir saatte olasılık ≥ %50 ve toplam ≥ 0,5 mm | Çiseleme gürültü olmasın (VARSAYIM; sahada ayarlanır) |
| `bes-saniye` K1, K4 (seri, Yenilikler) | **Sahibe: karar 5** | Onaylı Ana sayfa değişir |
| `bes-saniye` K2 (günün cümlesinin süresi) | İlk dokunuşa kadar ya da en çok 1 saat | Günün geri kalanı bugünkü davranıştır |
| `bes-saniye` K3 (WHO-5 14. gün) | 14. günde Ana sayfada bir kez kart | §2.1 satır 19 |
| `bes-saniye` K5 (alarm sabahında şerit) | Evet, Y5 ile | Bildirimi kapalı olan da yağmuru görür |
| `bes-saniye` K6 (365. gün) | Bu planın dışında; 90. günden sonra ayrı iş | Kod yok, kanıt yok |
| `bes-saniye` K7 (`day-open` dışa aktarmada) | Hayır | Etkinlik değil, tanılama kaydı |
| `bes-saniye` K8 (giriş ekranı metni) | Şimdi değişmez; önce ilk dokunuştan sonuca geçen süre (G1) ölçülür | Onaylı giriş ekranı; veri yok |
| `bes-saniye` K9 (kamera izin metni) | Güncellenir; metin tasarım kapısında sana gösterilir | App Review 5.1.1 zorunlu kılıyor |
| `bes-saniye` K10 (sabah çağrısı) | Hayır | Singh 2024'teki bulgu zayıf; saat kişinin |

### 2.3 Onaylı yoga planıyla uyum

Bu plan `PLAN.v3.md`'nin hiçbir kararını değiştirmez:
- **Yoga durağı** ilk yayındaki gibi kalır: 3. günden, 2. bölümde göz duraklarından sonra ve Bugünün görevi'nden önce
  (`order: 105`); kısa gün 3, altı kısa günden sonra 5 dakikalık tam ders; E testi günü yolda yok; `yields: true` ve R7b
  kuralı gereği hiçbir durağı düşürmez (§B.2, §B.5). (c)'nin merdivenleriyle koşulan benzetimde de yoga yüzünden düşen
  durak sıfırdır (30 günde 24, 90 günde 76 yoga günü).
- **`today.js`'e yoganın beş eki** (`collect` alanları, R7b, R5, `next`, `allDone`) Y1'in temelidir. Y1 `lib/today.js`'e
  bunların dışında bir kural eklemez; `ctx.progression` `buildPath`'e bugünkü gibi `ctx` içinde yayılır (`lib/today.js`
  `:243`). Bu, Y1'in eşdeğerlik kapısında sınanır (§3.G.6).
- **Nefes:** ilk yayında yolda 5 dakikadır; Y1 geldiğinde yolda en çok 3 dakika olur, mola 5 dakika kalır, 5 dakikalık
  nefes Ana sayfada durur (karar 5.1, §B.2 kural 10).
- **Meditasyon** yolda ayrı durak olmaz; sahibin "aralarda nefes, meditasyon" sözünü yolun arasındaki nefes ve yoganın
  kısa dersleri karşılar (karar 5.1).
- **"Sonra yaparım"** yoganın getirdiği `gozolcum:path-later` anahtarıyla aynı biçimde kalır; Y1 onu `progressionCtx`'e
  taşır (§B.5). Düğme ilk sürümde yogada, (e) ile yürüyüşte görünür; 1 dakikalık göz duraklarında düğme yoktur.
- **Sayaçlar:** yoganın `yogaCounters` işlevi Y1'de ortak `doneDays` ve `gapDays` yardımcılarını çağırır; davranış
  değişmez, iki tanım teke iner. Yoganın bütün testleri değişmeden geçmelidir.
- **Gelişim ve Nef:** yoganın `sessions.domainOf` eki ve dört Nef sayısı aynen kalır; yeni ölçü kuralı yoganın önce →
  sonra etkilerine yalnız son 28 günle uygulanır (yoga planı da puanları "nasıl hissettin gidişatı" olarak gösterir).
- **Hafif gün:** yoga planı §B.4 "karar bekliyor" diyordu; bu planda hafif gün olmadığı için satır boşa düşer.
- **90+ gün:** haftalık odak yoga olduğunda o hafta ölçüm olmayan her gün yoga 5 dakikadır (yoga planı §B.3 son paragraf).

### 2.4 Onaydan sonra düzeltilecek belge yerleri (şimdi dokunulmadı)

- `YOL.nef.md`: taslak istem ve şablonda "Günlük test" önerisi (§9.1, §6.3, §7.2); §5.5'teki 8.–21. gün tablosu (eski
  günlük başlangıç kuralı); §5.2 `days7` kaynağı; §8.1 açığı kapandı notu; §1 dosya:satır kayması (`gelisim-nef.md` §8).
- `YOL.moduller.md` §5: `sleep` ve `walk.steps7` Nef satırları çıkar; §4.2'deki Watson 2015 ve Windred 2024
  `lib/sources.js`'te değil, `lib/evidence.js:99-101`'dedir.
- `YOL.ilerleme.md`: §5.1 nefes dizisi, §5.3 meditasyon durağı, §5.11 E testi evreleri, §5.13 yoga ve §6 gün tablosu bu
  planla geçersizdir; belgenin başına not düşülür.
- `YAPILACAKLAR.md`: "14. gün iyi oluş" satırı Y3'e bağlanır; "hafif gün ≈ 7 dk" ilk sürümden çıkar; §2'ye App Store
  4.10 kuralı eklenir; (c) ve (f) maddeleri bu planın Y1 ve Y6 aşamalarına bağlanır.
- `hava-ay.md` §1: akşam kartı 18.00'dir; `coachCore.js:66-69` göndermesi `:70`'tir.
- `gelisim-nef.md` §2: okuma manifesti 24 satırdır; `reading/manifest.js:297` ve `:303-308` göndermeleri yanlıştır, doğru
  satır `:12`'dir (`merdiven.md` §2 okuma kuralını `:18-23` diye doğru veriyor).

---

## 3. Ayrıntı

### A. Merdivenler ve ilerleme motoru ((c), Y1)

#### A.1 Bugünkü durum (kod)

Yol her gün aynıdır: ilk günden bütün duraklar, nefes 5 dakika, göz grupları sabit. Şablon `lib/today.js:156` (ORDER),
`:160` (PATH: hedef 15, üst sınır 20 dk), `:242` (`buildPath`); Ana sayfa yolu `screens/Home.jsx:162`'de ilerleme alanı
olmadan kurar. Nefes durağı 5 dakikadır (`lib/breath.js:16` `PROGRAM_DAY_SEC = 300`, `modules/breath/view.jsx:25`).
Göz egzersizleri beş gruptur (`lib/routines.js:71-77` `PATH_GROUPS`); Yukarı–aşağı yalnız setlerdedir. Bugünün görevi
yalnız bir kez yapılmışsa yola girer (`modules/notice/manifest.js:30-33`). Normal gün testi sekiz durak bekler
(`lib/today.test.js:22`). (Bu satırların hepsi bu belge için yeniden okundu.)

#### A.2 Tek ilerleme sözleşmesi

Üç belge üç ayrı sözleşme öneriyordu (`ctx.progression` + `progression`, `ctx.day` + `grow`, yoganın kendi sayaçları).
Seçilen: **`ctx.progression` ve manifestte isteğe bağlı `progression` alanı.** Sayaçlar saklanmaz, kayıtlardan türetilir:

```
pathDay   = yola ait herhangi bir kaydın bulunduğu ayrı yerel gün sayısı, BUGÜNDEN ÖNCE
D(m)      = m modülünün "yapıldı" sayılan kaydının bulunduğu ayrı gün sayısı, bugünden önce
G(m)      = m'nin son yapıldığı günden bugüne takvim günü (hiç yoksa null)
Dstage(m) = m'nin `stage` alanı taşıyan (Y1'den sonra yazılmış) kayıtlarının ayrı gün sayısı
Dvar(m)   = min(D(m), Dstage(m) + 14)     // çeşitlemeler eski kullanıcıya haftada bir basamak açılır
```

- **Bugün sayılmaz** (`YAPILACAKLAR.md:74-75`; yoga planı §B.2 kural 1). Basamak gün içinde değişmez; yeni kullanıcının
  1. günü D = 0'dır.
- **Açılma sayacı `pathDay`'dir, takvim günü değil.** Takvim günüyle sayılsaydı 30 gün sonra dönen kişi bütün durakları
  birden görürdü; kayıtlı gün sayısı yoganın "iki ayrı günden sonra" kuralıyla da aynıdır.
- Gün anahtarı ölçümlerde `runDayOf`, diğer kayıtlarda yerel gün; yeni bir tarih kuralı icat edilmez.
- `ctx.progression` yalnız `Home.jsx:162`'de bir kez hesaplanır. Verilmezse her manifest bugünkü çıktısını verir; bu,
  "mevcut sistem bozulmaz" kuralının teknik güvencesidir (§G.6).

#### A.3 Merdivenler veridir (`lib/ladders.js`)

Bütün merdivenler tek bir veri dosyasında durur; bir modül isterse kendi merdivenini `progression.ladder` ile verir.
Basamak `{ from: D eşiği, ...içerik }` biçimindedir; D ≥ `from` olan son basamak geçerlidir. Merdiven bitince sonsuzluğu
çeşitlemeler (`variants`, `Dvar` ile) ve döndürme taşır. Açılma eşikleri: Yılan ve Bugünün görevi `pathDay ≥ 1`, Fark
Ettin mi? `≥ 5`, Tek Bakışta `≥ 7` (VARSAYIM; yeni durak yeni güne düşsün, aynı güne iki yeni durak yığılmasın).
`lib/ladders.test.js` her merdiveni sınırlarına göre denetler: `from` artan, nefes dakikası ≤ 3, her adım `EXERCISES`'te
var, her göz grubu ≤ 75 sn (VARSAYIM), nefes ailelerinin ürettiği her kalıp güvenlik zarfında, kırpma ≤ 15, daire ≤ 3 tur.

#### A.4 Nefes merdiveni (yolun arası)

| Basamak | D | Yolda | Kalıp | Tutma |
|---|---|---|---|---|
| N1 | 0 (1. gün) | 1 dk | Sakin ritim, ilk 3 seansta kademeli 3,5·4,5 (`lib/breath.js:13`) | yok |
| N2 | 1 | 2 dk | Sakin ritim | yok |
| N3 | 2–6 | 3 dk | Sakin ritim 4·6 | yok |
| Ç-B | 7–20 | 3 dk | "Günün ritmi": Sakin, Eşit, Uzun veriş, Karın | yok |
| Ç-C | 21–41 | 3 dk | + Vızıltı, Burun değiştir; alıştan sonra kısa tutma (ör. 4·2·6) | ≤ 2 sn, haftada ≤ 2 gün |
| Ç-D | 42+ | 3 dk | + yumuşak kutu (ör. 4·2·4·2; senin 4·2·4·4'ün dakikada 4,3 nefes) | bekleme ≤ 4 sn, haftada ≤ 1 gün |
| 90+ | | 3 dk | Nefes odak haftasında kart "2 dk daha"yı öne çıkarır; yol payı 3 kalır | |

- Ana sayfadaki Nefes (1, 3, 5 dk, bütün kalıplar, "Özel") ve 28 günlük program değişmez. Program günü ≥ 300 sn ister
  (`lib/breath.js:277-294`); bu yüzden yoldaki 3 dakika bitince "2 dk daha" düğmesi çıkar, aynı kalıpla sürer ve o günü
  5 dakikaya tamamlar. Mola zaten 5 dakika olduğu için kişiye ek süre yükü yoktur.
- Kişi Nefes ekranında kalıp ya da süre seçtiyse yol onun seçimini kullanır; merdiven yalnız varsayılanı belirler.
- **Çeşitleme üreteci** (`lib/breathMix.js`, saf): aileler koddaki kalıplardır; alış 3–6 sn, veriş alıştan kısa değil ve
  ≤ 8 sn, 0,5 sn adımlarla. Süre bileşimi sayısı B katmanında 40, C'de 99, D'de 629'dur. Günlük seçim `hash(gün + modül)`
  ile belirlenir; aynı gün her açılışta aynı kalıp gelir. Aynı bileşim iki gün art arda gelmez; aynı aile haftada en çok
  3 gündür; tutmalı günler art arda gelmez (VARSAYIM kuralları; dayanak Eather 2023'ün çeşitlilik bulgusu).
- Kart kalıbı adıyla söyler ("Bugünün ritmi: 4 · 1 · 6"); kanıt cümlesi ailenin mevcut `evidence` metnidir, yeni iddia
  yazılmaz. **Çeşitlilik etkiyi artırmak için değil, ilgiyi ve sürekliliği korumak içindir:** kanıt kalıplar arasında
  büyük fark göstermiyor (Birdee 2023; Marchant 2025).

#### A.5 Nefes güvenlik sınırları

| Kural | Değer | Dayanak |
|---|---|---|
| Hızlı soluma, döngüsel hiperventilasyon | Hiç yok | Elia 2024: tutmadan önce hiperventilasyon oksijeni düşürdü, bayılma yatkınlığını artırabilir |
| Nefes hızı zarfı | Dakikada 4–7,5 nefes; veriş ≥ alış | Laborde 2022; Marchant 2025 (6/dk en tutarlı); alt sınır 4 VARSAYIM |
| Tutma | 21. günden önce yok; alıştan sonra ≤ 2 sn; 42. günden sonra veriş sonu bekleme ≤ 4 sn | VARSAYIM; kısa tutmada zarar kanıtı bulunamadı, en uzun tutmalar sempatik yükü artırıyor (Badrov 2016) |
| Tutmanın ön koşulu | Güvenlik kartı görülmüş (`lib/breath.js:335`) ve son 7 günde "Zorlandım" yok | Mevcut güvenlik satırları (`lib/breath.js:351`) |
| "Zorlandım"dan sonra | Ertesi gün bir basamak kısa süre, 7 gün tutmasız | VARSAYIM |
| 4-7-8 | Kendiliğinden hiç gelmez; kişi "Özel" ile kurabilir | Marchant 2025; kodda bugün de yok (`lib/breath.js:4`) |

Gebelikte, kalp ve akciğer hastalığında kısa tutmanın zararını ya da güvenliğini gösteren bir PubMed kaydı bulunamadı;
kural kanıta değil ihtiyata dayanır ve mevcut güvenlik kartının cümlesi aynen kalır.

#### A.6 Göz egzersizleri merdiveni (`routine`)

| Basamak | D | Yoldaki gruplar | Yol dk | Dayanak |
|---|---|---|---|---|
| K1 | 0 | Göz kırpma [kırp, kapat] | 1 | Kim 2020, Wolffsohn 2025 (kanıtı en güçlü adım) |
| K2 | 1 | **Sağ–sol** [sağa bak, sola bak, kapat] · Göz kırpma | 2 | sahibin "göz + yana bak"ı; rahatlama hareketi, etki kanıtı yok |
| K3 | 2 | Isınma [kırp, sağa, sola] ("üçü birlikte") · Göz kırpma | 2 | bugünkü Isınma |
| K4 | 3 | Isınma · **Yukarı–aşağı** · Göz kırpma | 3 | sahibin 4. günü; tek yeni grup `dikey` |
| K5 | 4–5 | + Uzağa bakış | 4 | Talens-Estarelles 2022 |
| K6 | 6–7 | + Yakın–uzak | 5 | konfor; kanıt karışık |
| K7 | 8+ | + Daire; Daire ile Yukarı–aşağı gün aşırı | 5 | bugünkü beş duraklık yapı |
| V1 | Dvar 21+ | kırpma 5 → 10 tekrar | 5 | Wolffsohn 2025 |
| V2 | Dvar 28+ | bakışlar 5 → 8 sn, uzağa bakış 20 → 30 sn; haftada bir karışık gün | 5 | VARSAYIM |
| V3 | Dvar 42+ | kırpma 15, yakın–uzak 10 geçiş, daire 3 tur | 5 | Wolffsohn 2025 (tekrar); diğerleri VARSAYIM |
| V4 | Dvar 56+ | haftada bir tam set günü | 5 | VARSAYIM |

`isinma` anahtarı basamakla büyür (K2'de başlığı "Sağ–sol"); böylece yeni kimlik gerekmez, kayıt eşlemesi değişmez. Tek
yeni grup `dikey`'dir (`order: 70`, `rotate: 'donus'`). Çeşitleme `EXERCISES`'in üstüne yama olarak geçer. Ekrandaki
metinler etki söylemez: göz egzersizlerinde ekran kaynaklı yorgunluk için yüksek kesinlikte kanıt yoktur (Singh 2022);
kırpma ve uzağa bakıştaki kazanımlar bırakınca 1–2 haftada kayboldu (Wolffsohn 2025, Talens-Estarelles 2022). Bu, yolun
bitmemesinin gerekçesidir; kullanıcıya iddia olarak söylenmez.

#### A.7 Öteki duraklar

Çemberler 1. günden her gün 1 dakikadır. Yılan 2. günden açılır, `dropRank: 1` ile ilk düşen duraktır. Bugünün görevi
2. günden herkesin yolundadır. Fark Ettin mi? 6. günden, Tek Bakışta 8. günden bugünkü `week3` kuralıyla (her biri haftada
3 gün) gelir. Hızlı Bakış, haftalık E testi, okuma testi ve kısa E testinin yolda olmaması aynen kalır. Yoga §2.3'teki
gibidir. Göz kırpma modülü (`blink`), Dalga, Yön, Mola, Su, Alarm ve Farkındalık yolda değildir.

#### A.8 Günlük seçim, bütçe ve ara

1. Basamak: `from ≤ D` olan son basamak; G ≥ 14 ise o gün bir basamak aşağı ("yumuşak"), ertesi gün kaldığı yerden.
2. Açılma: `pathDay` eşiğin altındaysa durak yoktur.
3. Döndürme: mevcut `rotate` kuralı aynen (`lib/today.js:255-266`); yeni grup yalnız `donus`.
4. Kayıt: tamamlanan durak `stage` alanıyla yazılır; göz egzersizinde ayrıca `steps` ve `variant`, nefeste `mix`. Yarım
   kalan egzersiz bugünkü gibi kayıt yazmaz. Eski kayıtlar bu alanlar olmadan okunur.
5. Yol payı: nefes 3, göz grubu 1, yoga 3 (tam ders günü 5) dakika; hedef 15, üst sınır 20 dakika değişmez; düşme sırası
   ve yoganın R7b kuralı aynen.
6. **Ara kilidi:** bugün kilit, son moladan beri ≥ 1 dk göz çalışması varsa başlar (`Home.jsx:165-170`). Y1'de yol molası
   ancak "kullanılan göz süresi + 2. bölümün göz dakikası > göz bütçesi" ise başlar. Eski kullanıcıda 1. bölüm 4 dakika
   göz çalışması olduğu için kilit her gün yine başlar; yeni kullanıcı ilk günlerde 1 dakikalık nefesten sonra boş
   beklemez. Göz bütçesi kuralı (`lib/eyeBudget.js:17-29`) değişmez.
7. Atlanan gün cezasızdır; basamak geri gitmez, sayı sıfırlanmaz; "seri bozuldu" ekranı yoktur.

#### A.9 Gün gün 1–30 (yeni kullanıcı, her gün 10.00'da açar, her durağı yapar, 5 dk göz bütçesi)

Benzetim: `sim_merdiven.mjs` (yol kuralları gerçek koddan ve yoganın beş ekinden, `today_v4.js`; merdivenler bu
bölümdeki tablolardan). Yumuşak dönüş benzetimde yoktur. **Cihazda denenmedi.**

| Gün | Yeni gelen | Yol dk | Yoga |
|---|---|---|---|
| 1 | Haftalık E testi, Çemberler, Nefes 1 dk, Göz kırpma | 8 | — |
| 2 | Sağ–sol, Nefes 2 dk, okuma testi, Yılan, Bugünün görevi | 11 | — |
| 3 | "Üçü birlikte" (Isınma), Nefes 3 dk, yoga | 12 | Nefesin Ritmi |
| 4 | Yukarı–aşağı | 13 | Tek Nokta |
| 5 | Uzağa bakış; ilk rapor | 14 | Zor Anlar İçin |
| 6 | Fark Ettin mi? (Yılan o gün düşer) | 14 | Sabah Niyeti |
| 7 | Yakın–uzak | 15 | Sağlam Yer |
| 8 | Haftalık E testi, Tek Bakışta; nefeste "günün ritmi" | 17 | — |
| 9 | Daire (Yukarı–aşağı ile gün aşırı), okuma testi | 18 | Kendini Tanımak |
| 10 | — | 17 | Derin Dinlenme, 5 dk |
| 11–14 | — | 15 | Gelecekteki Sen, Nefesin Ritmi, Tek Nokta, Zor Anlar İçin |
| 15 | Haftalık E testi | 17 | — |
| 16 | Okuma testi | 18 | Sabah Niyeti |
| 17–21 | 18. gün tam ders | 15–17 | Sağlam Yer, Kendine Şefkat 5 dk, Kendini Tanımak, Gelecekteki Sen, Nefesin Ritmi |
| 22 | Haftalık E testi; kırpma 10 tekrar; kısa tutmalı nefes günleri | 17 | — |
| 23 | Okuma testi | 18 | Tek Nokta |
| 24–28 | 26. gün tam ders; 28. gün iris yan yana | 15–17 | Zor Anlar İçin, Sabah Niyeti, Derin Dinlenme 5 dk, Sağlam Yer, Kendini Tanımak |
| 29 | Haftalık E testi; bakışlar 8 sn, uzağa bakış 30 sn; aylık Nef | 17 | — |
| 30 | Okuma testi | 18 | Gelecekteki Sen |

| Senaryo | Gün | En kısa | En uzun | Ortalama | > 20 dk | Yoga günü | Yoga yüzünden düşen |
|---|---|---|---|---|---|---|---|
| 5 dk göz bütçesi, 10.00 | 30 / 90 | 8 | 18 | 15,3 / 15,7 | 0 | 24 / 76 | 0 |
| 5 dk göz bütçesi, 19.00 | 90 | 8 | 18 | 15,7 | 0 | 76 | 0 |
| 3 dk göz bütçesi | 30 / 90 | 8 | 15 / 16 | 12,7 / 12,9 | 0 | 24 / 76 | 0 |
| (e) sonrası tahmin: + yürüyüş 2 dk | 30 / 90 | 8 | 20 | 17,1 / 17,6 | 0 | 24 / 76 | 0 |

13.–28. günler atlanınca 29. gün E testi ve okuma birlikte gelir; yol 20 dakika olur, Yılan ve yoga o gün düşer; ertesi
gün yol 15 dakikaya döner.

#### A.10 Mevcut kullanıcıya geçiş

Sayaçlar kayıtlardan türediği için göç betiği yoktur; eski kullanıcı ilk açılışta merdivenin üstündedir. Görünür
değişiklikler §1'de listelidir. Veride yalnız yeni alanlar eklenir (`stage`, `steps`, `variant`, `mix`).

### B. Gelişim ve ölçü kuralı v2 (Y2)

#### B.1 Bugün yoldaki modüller Gelişim'e nasıl bağlı

Yolda görünebilen on modülün hepsi merkezdeki gün şeridine bağlıdır. Ölçüyle bağlı olan altısıdır: haftalık E testi,
Nefes, Fark Ettin mi?, Tek Bakışta, Hızlı Bakış, Bugünün görevi. Göz egzersizleri, Yılan ve Çemberler yalnız "gün" olarak
girer; Yılan ve Çemberler bilerek ölçü değildir (`snake/manifest.js:14`, `track/manifest.js:18`). Okuma testi kendi
kartında durur, alanın doğrulanmış değişimine girmez (`modules/reading/manifest.js:12` yalnız alanı verir, `metrics`
yok). Yolun kendisi (basamak, sıradaki adım) Gelişim'de hiç yoktur.

#### B.2 Merkezde bulunan hesap sorunları

1. **Genel metrik kuralı bütün geçmişe bakıyor ve her açılışta yeniden hesaplanıyor.** `metricTrend` en az 6 ölçümde
   ilk yarının ortalamasını son yarınınkiyle karşılaştırır (`lib/progress.js:130-150`; `METRIC_MIN = 6`, `:116`).
   Pencere yoktur: 6. ayda son ayın düşüşü seyrelir. Benzetimde (normal dağılımlı gürültü, gerçek değişim yok, haftada 3
   ölçüm, 26 hafta, 5.000 kişi; kod birebir kopya) kişilerin **%27,2**'si en az bir kez "geriliyor" görüyor; alanda 4
   metrik varsa alan yayı **%62,8** kişide en az bir kez "geriliyor"a dönüyor (`verifiedChange`, `lib/dataHub.js:137-150`,
   bir "worse" alanı "down" yapar).
2. Aynı günün turları ayrı ölçüm sayılıyor; "ilk yarı / son yarı" zamanı değil tur sayısını bölüyor.
3. Öğrenme etkisi "iyileşme" diye okunuyor: tekrarlanan bilişsel testlerde ilk 3 ayda belirgin öğrenme etkisi var
   (Bartels 2010, Cohen d 0,36–1,19). Öğrenme eğrili tek metrikte benzetimde kişilerin %70,8'i "iyileşiyor" görüyor.
4. Merkezin `days7` alanı günü değil kaydı sayıyor (`lib/dataHub.js:81`).
5. Önce → sonra etkileri bütün geçmişten hesaplanıyor; ortalamaya dönüş payı yazılmıyor (Barnett 2005).
6. Okuma testinin ana sonucu Göz alanının yayına girmiyor; Nef yalnız okuma hızını görüyor (`coach.js:54`).

#### B.3 Ölçü kuralı v2 (bütün `progress.metrics` için; göz kuralı `trend.js`'te aynen kalır)

Göz için doğrulanmış kuruluş (`lib/trend.js`: alışma → başlangıç → son 3 → ardışık doğrulama) bütün metriklere genişler:

| Adım | Kural | Varsayılan |
|---|---|---|
| Günlük toplama | Aynı takvim gününün ölçümleri o günün ortancası olur | — |
| Alışma | İlk `familiar` gün değerlendirmeye girmez | 1 gün; görev metriklerinde 2 (VARSAYIM) |
| Başlangıç | Alışmadan sonraki ilk `base` günün ortancası ve SD'si; bir kez oluşur, sonra değişmez | 6 gün (VARSAYIM) |
| Şimdi | Son 3 ölçüm gününün ortancası | 3 |
| Bakış | Haftada bir, Pazartesi (haftalık Nef ile aynı gün) | 7 gün |
| Değişim | Şimdi ile başlangıç arasındaki fark c × SD'yi aşar ve bu art arda `persist` haftalık bakışta sürerse "better" ya da "worse" | c = 1,5; persist = 2 (VARSAYIM; Jacobson ve Truax 1991'in güvenilir değişim fikrinin basit ve doğrulanmamış uyarlaması) |
| Yayımlanmış eşik | Metrik `meaningful` verirse c × SD yerine o kullanılır | ör. WHO-5 10 puan (`lib/progress.js:20`) |
| SD tabanı | SD, metriğin biriminde bir alt sınırın altına inmez | ör. harf 0,5; ms 10 (VARSAYIM) |
| Pencere | "İlk 28 gün" ve "son 28 gün" haritayla aynı | 28 |

Benzetim (`sim2.mjs`; 13 hafta değişim yok, sonra 1 SD düşüş):

| Kural | Yanlış "geriliyor", 13 hafta, tek metrik | Aynı, 4 metrik | Gerçek düşüşü sonraki 13 haftada yakalama |
|---|---|---|---|
| Bugünkü (26 haftada) | %27,2 | %62,8 | ölçülmedi |
| **v2, c = 1,5, persist 2 (seçilen)** | **%6,9** | %20,0 | %51,8 |
| v2, c = 2, persist 2 | %2,2 | %7,5 | %30,5 |
| v2, c = 2, persist 3 | %0,5 | %1,6 | %15,8 |

Seçim c = 1,5'tir: görev puanları sağlık ölçüsü değildir, yanlış işaretin bedeli düşüktür, duyarlılık değerlidir. Dört
metrikli alanın %20'lik yanlış işaretini alan yayı kuralı (B.4) azaltır. Bu sayılar yapay veriyle üretildi; gerçek veriyle,
telefondan veri çıkarmadan geliştirici cihazında yeniden koşulur.

#### B.4 Alanın doğrulanmış değişimi (iris yayı)

Göz uyarısı her şeyin önündedir (bugünkü sıra). Yay ancak alanda en az bir metrik ya da etki "worse" olduğunda **ve**
hiçbiri "better" olmadığında aşağı döner. İkisi birden varsa yay boş kalır ve satırda "karışık" yazar. Yayın yukarı
dönmesi için en az bir "better" gerekir ve hiçbiri "worse" olmamalıdır. Etkiler yalnız son 28 gündeki oturumlarla ve en az 3 oturumla sayılır (`acuteEffects({ since })`, `ACUTE_MIN`).
Bu, `dataHub.test.js:97`'deki "better + worse → down" beklentisini bilinçli olarak "null" yapar.

#### B.5 Metin

| Metrik türü | Bugün | Y2 |
|---|---|---|
| Görev ve oyun (isabet, eşik, harf, tepki) | "iyileşiyor" / "geriliyor" | "görevdeki sonucun artıyor" / "görevdeki sonucun düşüyor" |
| Kendi beyanı (sakinlik, günün puanı, uyku sabah puanı) | aynı | "puanın artıyor" / "puanın düşüyor" |
| Göz (E testi, okuma) | "iyileşiyor" | değişmez |
| Değişim yok | "doğal oynama" | "doğrulanmış bir değişim yok" |

Görev kartlarının altına tek satır eklenir: "İlk haftalarda sonuçların alıştıkça artması olağandır; bu, görevde alışmayı
gösterir." Önce → sonra kartına ortalamaya dönüş notu eklenir. Sürüm notu: "Gelişim artık son 28 güne ve art arda iki
haftaya bakıyor; tek haftalık oynamayı değişim saymıyor."

#### B.6 Modül modül dört katman

Her modül kartı aynı iskeleti taşır: **Düzen** (son 28 günde yapılan gün), **Basamak** (yoldaki yeri, Y1'den sonra),
**Ölçü** (başlangıç → şimdi), **Değişim** (yalnız kural doğrularsa).

| Modül | Ölçü | Kural | Nef'e |
|---|---|---|---|
| Haftalık E testi | logMAR, göz başına | `trend.js`, değişmez | `vaPhase`, `vaTrend`, `vaAlert` (sayısız; karar 6) |
| Okuma | kritik yazı boyu (logMAR), ikinci olarak hız | aynı gözlük koşulunda art arda 2 testte başlangıçtan ≥ 0,2 logMAR fark; tek test "oynama içinde" (Subramanian 2006: kritik yazı boyunun tekrar payı ±0,12). Kart Göz alanı ayrıntısına taşınır, yaya girer | `readingStatus` |
| Göz egzersizleri | ölçü yok; düzen, basamak, tamamlanan tekrar | değişim kuralı yok | gün sayısı, `stage` |
| Nefes | dakika, denenen kalıp, sakinlik önce → sonra (1–5) | etki, son 28 gün, ≥ 3 seans | mevcut üç alan + `stage` |
| Çemberler, Yılan | oyun içi seviye ve rekor | doğrulanmış değişime girmez (bilinçli) | mevcut |
| Fark Ettin mi? | fark etme isabeti | v2, seviye içinde; seviye değişince başlangıç yeniden kurulur ve kart bunu yazar | mevcut |
| Tek Bakışta | harf | v2; SD tabanı 0,5 | `span7` en iyiden ortancaya çevrilir (bugün `Math.max`) |
| Hızlı Bakış | eşik ms (düşük daha iyi) | v2; alışma 2 gün; SD tabanı 10 ms | mevcut |
| Bugünün görevi | fark edilen 0–3+ | tavanlı ölçek, görev her gün değişiyor → değişim kuralı yok; düzen ve katman | mevcut + katman |
| Günün nasıl geçti (Y4) | 1–5 | v2, kendi beyanı | `n7`, `moodStatus` (karar 6) |
| Yoga | dakika, önce → sonra | onaylı yoga planı §D.5; etkiler son 28 gün | yoganın dört sayısı |
| Yürüyüş, uyku, tepki, gökyüzü ((e)) | `YOL.moduller.md` §4 | v2 ya da etki kuralı | Sağlık kaynaklı alan gitmez |

**"Yolun" bölümü:** Bölüm Gelişim'de iris haritasının ve alan satırlarının altında durur; başlığı "Yolun · 34. gün"dür.
Her satırda modül adı, basamak ("N4 · 3 dk"), 28 günlük şerit ve varsa durum hapı bulunur. Ölçüsü olmayan modülün
ayrıntısında bir kez "Bu modül bir şey ölçmez, düzenini sayar." yazar. Bölüm yeni bir hesap yeri açmaz; ilerleme motorunu, `growthMap`'i ve v2
durumlarını okur.

**Tasarım gerekçesi (kullanıcıya iddia değil):** kendini izleme, sağlıklı beslenme ve hareket müdahalelerinde etki
farkını en çok açıklayan tekniktir; hedef ve geri bildirimle birlikte daha etkilidir (Michie 2009; 0,42'ye karşı 0,26,
heterojenlik yüksek).

### C. Nef yorumları (günlük cümle Y3, dönemler Y6)

#### C.1 İlke

Nef hesap yapmaz: merkez hesaplar, Nef söyler (`YOL.nef.md` §2). Nef'in söylediği durum, Gelişim'in aynı hafta gösterdiği
durumla birebir aynıdır: tek hesap, iki yüz.

#### C.2 Ne zaman çıkar

| Dönem | Tetik | Nerede | Kim üretir |
|---|---|---|---|
| Günün cümlesi | günün ilk açılışı | Ana sayfanın üstündeki Nef satırı | telefonda kural şablonu; ağ ve rıza gerekmez |
| Olay | yeni basamak, ilk doğrulanmış değişim, 28. gün, uzun aradan dönüş; günde en çok bir | aynı satır (günün cümlesinin yerine geçer) | kural şablonu |
| Günlük | her açılış, günde bir istek | Ana sayfadaki "Bugün · Nef" kartı (bugünkü gibi) | model (rızayla) ya da kural yedeği |
| Haftalık | Pazartesi, geçen takvim haftasında ≥ 4 gün veri | Ana sayfa (Pazartesi–Çarşamba) ve Gelişim başı | model ya da kural yedeği |
| Aylık | 29., 57., 85. gün… | Gelişim ve 3 gün Ana sayfa | model ya da kural yedeği |

Model yolu haftalık ve aylık dönemde ancak `YOL.nef.md` §10'daki 30 soruluk sınavdan sonra açılır (uydurma %0,
doğruluk ≥ %90); o zamana kadar kural yedeği konuşur.

#### C.3 Söyler, söylemez

Söyler: düzen sayıları, basamak ve sıradaki adım, merkezin verdiği durumlar, yeni açılan modülün ne ölçtüğü. Söylemez:
sayı uydurmaz; iki sayıdan yön çıkarmaz; başkasıyla karşılaştırmaz; tanı, risk, "normal" demez; "seri bozuldu",
"kaçırdın" demez; doktor cümlesini yazmaz, yumuşatmaz; görev sonucunu görme, dikkat ya da sağlıkla ilişkilendirmez;
ölçüsü olmayan modül için "işe yarıyor" demez.

#### C.4 Durum → cümle (şablon ve model aynı iskeleti kullanır)

| Durum | Cümle |
|---|---|
| Düzen, hedef tuttu | "Geçen hafta 5 gün çalıştın; hedefin 3 gündü." |
| Basamak | "Nefes 4. basamakta: bugün 3 dakika." |
| Sıradaki | "Bu hafta göz egzersizlerine yakın–uzak ekleniyor." |
| Değişim yok | "Hızlı Bakış'ta doğrulanmış bir değişim yok." |
| Görevde "better" | "Tek Bakışta'da görevdeki sonucun iki haftadır başlangıcının üstünde." |
| Görevde "worse" | "Fark Ettin mi?'de sonuçların iki haftadır başlangıcının altında; ışık ve saat farklı olabilir." |
| Alan karışık | "Dikkat alanında sonuçlar farklı yönlerde; doğrulanmış bir değişim yok." |
| Etki anlamlı | "Nefes seanslarının sonunda sakinlik puanın başındakinden yüksek (son 28 gün)." |
| Ölçüsüz modül | "Göz egzersizlerini 28 günün 22'sinde yaptın." |
| Okuma "better" | "Son iki okuma testinde daha küçük yazıyı rahat okudun." |
| Görmede uyarı yok | "Görmende doğrulanmış bir değişim yok." |
| Görmede sarı/kırmızı | Nef yazmaz; sabit uyarı cümlesi kartın başındadır (`YOL.nef.md` §7.2) |
| 3–13 gün ara | "Beş gündür yoktun; basamağın aynı, kaldığın yerden." |

"Nefes seni sakinleştirdi" gibi etki cümlesi yoktur. Yasak kalıplar (`FORBIDDEN` v2) günün cümlesi şablonlarında da
test edilir.

#### C.5 Nef'e giden paket v2 (karar 6)

Bugünkü günlük paket (`coach.js:40-63`) ve `YOL.nef.md` §5.2–§5.3 dönem alanları şu düzeltmelerle: metriklerden yalnız
`{ key, status }`; `readingStatus`; modül başına `stage`; `pathDay`, `gapDays`, `later7`; gün sayıları gün şeridinden;
günün puanından `n7` ve `moodStatus`; görme sayıları (`vaCurrent7`, `vaBaseline`, `vaDelta`) çıkar. Hava, konum, şehir,
etiket, kart metni, kalıp adı, "Zorlandım" işareti ve Apple Sağlık verisi gitmez. Paket sınırı 4.000 bayt
(`coachCore.js:5`) aynen; en dolu paket testte ölçülür. Modül sınırı 10 kalır; son 7 günde kaydı olmayan modül `null`
döner (`coachCore.js:44`).

### D. Günün nasıl geçti (Y4)

#### D.1 Bugünkü durum ve bulgular

Akşam kartı (`screens/Home.jsx:334-344`) "Akşam kontrolü · 3 soru · 30 sn" ve "Günün nasıl geçti?" der; üç profil
sorusu sorar (`lib/profileQuestions.js:170`: ekran saati, uyku, gece telefonu). Kart 18.00'den sonra ve ancak bir soru
cevapsızsa çıkar (`:174`, `:193`). Üç sorun var:
1. Kart bir kerelik profil formudur: cevaplanan soru bir daha sorulmaz; "günün nasıl geçtiği" hiç kaydedilmez, Gelişim
   seri kuramaz.
2. "3 soru" çoğu kişide yanlıştır: uyku sorusu kurulumda da soruluyor; kurulumu yapan kişiye kart 2 soru sorar.
3. Ekran sorusu hiçbir şeyi değiştirmiyor: `heavyScreen` "bilgi amaçlı" (`lib/profile.js:199`).

#### D.2 Ekran süresi: Apple ne diyor

- DeviceActivityReport: "To protect the user's privacy, your extension runs in a sandbox. This sandbox prevents your
  extension from making network requests or moving sensitive content outside the extension's address space."
- Veri yalnız Family Controls yetkisiyle gelir; yetki Apple başvurusu ister. Uygulamada bu yetki yoktur
  (`ios/App/App/App.entitlements`; bu belge için yeniden bakıldı).
- App Store 4.10: Screen Time API'leri gibi yerleşik yetenekler ücretlendirilemez.

Sonuç: uygulama toplam ekran süresini sayı olarak okuyamaz; Apple'ın raporu yalnız kişiye gösterilebilir; onu ne biz
görebiliriz ne Gelişim ne de Nef. Kendi tahminini sormak da doğru sayı vermez: öz bildirim kayıtla yalnız orta düzeyde ilişkilidir (Parry
2021, 106 etki büyüklüğü). Karar: soru kalkar; "Nefona'da bugün 11 dk göz çalışması, 2 mola" (`lib/eyeBudget.js` parçaları)
adıyla gösterilir ve hiçbir zaman "ekran süren" denmez. Apple'ın raporu `YAPILACAKLAR.md` §2 planıyla, Apple onayından
sonra ve ücretsiz gelir; altında "Bu sayıyı yalnız sen görüyorsun; Nefona kaydetmez." yazar.

#### D.3 Ölçek ve akış

İlke: makinenin bildiği sorulmaz, kişinin yaşadığı sorulur. Kanıt: emoji sıralı ölçeğin sırası 294 kişinin %95'inde aynı
anlaşıldı ve iyi oluşla ilişkisi r = 0,70 oldu (Thompson 2025; hasta örneklemi, Türkçe doğrulama yok); sistem emojileri kültüre göre
ters okunabiliyor (Cui 2024); tek maddelik ölçekler tutarlıdır ama tanı aracı değildir (Gertler ve Tate 2020, Killgore 1999);
gündeki soru sayısı uyumu değiştirmedi (Wrzus ve Neubauer 2022, 477 çalışma, ortalama uyum %79), uzun anket yükü ve
özensiz cevabı artırdı (Eisele 2020). 93 ruh sağlığı uygulamasında 30. gün kalma ortancası %3,3 (Baumel 2019). Bu
yüzden akış kısadır:

| Saniye | Ekranda | Kişi |
|---|---|---|
| 0–2 | "Akşam · 1 dokunuş". Üstte ölçülenler: "7.412 adım · Nefona'da 11 dk · yol 5/6". Başlık "Günün nasıl geçti?" | okur |
| 2–4 | Beş yüz (karar 3), dokunma alanı ≥ 44 pt | bir yüze dokunur; kayıt yazılır, hafif titreşim |
| 4–8 | Kart yerinde dönüşür: seçilen yüz ve varsa günün kanıt kartı | okur ya da geçer |
| 8–10 | 7. günden sonra isteğe bağlı etiketler: "İş yoğundu", "Hareketliydim", "Dışarıdaydım", "İnsanlarla", "Gözlerim yoruldu", "Ekran çoktu"; "Tamam" | dokunur ya da kapatır |

Tek dokunuş kaydeder, 3 saniye "Geri al" görünür. "Sonra" 2 saat erteler. Kart 18.00'de açılır, 03.59'da düşer; kaçan
gün boş kalır, tahmin yazılmaz, ceza yoktur. Akşam grubundan ekran ve uyku soruları çıkar (uyku, (e)'deki sabah kartına
aittir); gece telefonu sorusu Profilim'de kalır. WHO-5 14 günde bir doğrulanmış çapa olarak kalır.

**"Günün" sayfası:** Ana sayfa başlığındaki tarih satırına dokununca açılır. Gündüz başlığı "Günün nasıl geçiyor?",
akşam "Günün nasıl geçti?". Üstte Gökyüzü kartı (§E.7), altında "Bugün ölçülenler" (adım, Nefona içi göz çalışması ve
mola, yol ilerlemesi, (e)'den sonra dün gece uyku), akşam ise yukarıdaki kart.

#### D.4 Günün kanıt kartı

Canlı PubMed araması yapılmaz: doğrulanmamış bir özeti kişiye gösterir, etki büyüklüğünü değerlendiremez ve kişinin gününü
üçüncü bir hizmete taşır. Onun yerine kart kütüphanesi vardır: her kart yayından önce doğrulanır, `lib/evidence.js`
biçiminde `basis` ve `limits` taşır. Kural motoru `dayCard()` günde en çok bir kart seçer; aynı kart 7 gün içinde yinelenmez;
tetik yoksa kart çıkmaz. Kart bilgidir, öneri ya da yargı değildir; "iyileştirir, korur, önler, kanıtlanmış" yoktur.

| Kart | Tetik | Metin | Kanıt ve sınır | Yayına girer |
|---|---|---|---|---|
| `dolunay` | dolunaydan önceki ve sonraki 2 gece | §E.5'teki metin | Cajochen 2013, Haba-Rubio 2015, Casiraghi 2021, Smith 2017 | Y4 |
| `gece-ekran` | etiket "Ekran çoktu" ve saat ≥ 22 | "Çalışmaların %90'ında ekran süresi daha kısa ve daha geç uykuyla birlikte görüldü; neden-sonuç gösterilmedi. Bu çalışmalar çocuk ve ergenlerde yapıldı." | Hale ve Guan 2015, 67 çalışma | Y4 |
| `yagmurlu-gun` | hava şeridinde yağış | "Havanın ruh haline etkisi ortalamada küçük; kişiden kişiye değişiyor." | Denissen 2008, 1.233 kişi; Klimstra 2011 | Y5 |
| `kisa-gece` | Sağlık gecesi < 6 sa ya da sabah uyku cevabı ≤ 3 | "Laboratuvarda iki hafta gecede 6 saat uyuyanların dikkat hataları gün gün arttı; kişiler bunu pek fark etmedi." | Van Dongen 2003, 48 kişi; Lim ve Dinges 2010. Sınır: tek kısa gece bu deneylerle aynı şey değil | (e) |
| `az-hareket` | adım < kişinin 7 gün ortancasının yarısı, saat ≥ 18 | Paluch 2022'ye dayalı gözlemsel cümle | `lib/sources.js:166-171`'de PMID 35247352 ve DOI kayıtlı, ama notlarda yeniden doğrulanmadı | Y4 kapısında PubMed'le doğrulanırsa |
| `goz-yorgun` | etiket "Gözlerim yoruldu" | mola kartı | Galinsky 2000 kodda yalnız DOI'yle anılıyor (`lib/eyeBudget.js:3`); PMID yok | PMID ve DOI doğrulanırsa |

#### D.5 Veri merkezi

Yeni modül `modules/gunun/` (klasör koymak modül takmaktır): `id: 'gunun'`, alan `wellbeing`, tür `measure`. Kayıt
`sessions`'a yazılır: `{ type: 'day-check', date, day, score: 1–5, tags: [], card, seconds }`; `countsTowardGoal: false`.
Kişinin kendi işi olduğu için İyi oluş gününü doldurur; bu, `YAPILACAKLAR.md` Şimdi 8'deki "İyi oluş dilimi hep boşa
yakın" sorununu da kendiliğinden hafifletir. Metrik `day-mood` v2 kuralıyla değerlendirilir. Etiketler 28 günden sonra
yalnız betimlenir ("'Dışarıdaydım' dediğin günlerin ortalaması 4,1, diğerleri 3,3; 9 ve 17 gün"); 5 günden az kaydı olan
etiket gösterilmez (VARSAYIM). Hava bağlamı `gozolcum:sky-log`'da durur ve haritayı doldurmaz. Modülün `storageKeys`
listesinde `gozolcum:sky-log` ve `gozolcum:day-cards` bulunur; `coach()` yalnız `n7` ve `moodStatus` döndürür (karar 6). Düşük ruh hali serisi (ör. 14 günde
≥ 10 kötü gün; eşik VARSAYIM) için modelden bağımsız sabit cümle WHO-5'in düşük puan metnini (`lib/who5.js:27`) izler.

### E. Hava, ay, konum ve bildirim (ay Y4, hava Y5)

#### E.1 Kaynak

| Ölçüt | WeatherKit (Swift) | Open-Meteo | MGM |
|---|---|---|---|
| Ticari kullanım | üyelikte ayda 500.000 çağrı | ayda 49 USD'den başlar | açık geliştirici arayüzü yok (MEVBİS, ücretli ürün) |
| Anahtar | gerekmez; yetki uygulamada | ücretli planda API anahtarı | — |
| Türkiye'de saatlik yağış olasılığı | var | var (≈ 27 km topluluk modeli) | — |
| Türkiye'de dakikalık yağış | **yok** (Apple Destek 105038) | Orta Avrupa ve Kuzey Amerika dışında yok | — |
| Konum gizliliği | "not associated with any personally identifiable information, and is never tracked between requests" | koordinat 90 gün günlükte | — |
| iOS 15 | çalışmaz (iOS 16 ister) | çalışır | — |

**Seçim WeatherKit'in Swift çerçevesidir.** Ek ücret ve anahtar sorunu yoktur; Apple konumun kimliksiz işlendiğini yazılı
söylüyor; uygulama zaten yerel eklentiler taşıyor (`MainViewController.swift:25-30`). Uygulamanın alt sınırı iOS 15'tir;
iOS 15'te hava bölümü gizlenir, ay çalışır. Resmî olmayan MGM kazıma servisleri kullanılmaz.

**Nef hava verisi üretmez.** Dil modelinin ölçüme erişimi yoktur; "bugün yağmur yağacak mı?" sorusuna tahmin değil, olası
görünen bir metin üretir. Nef'in kuralı da bunu yasaklar ("yeni sayı, yüzde veya tarih UYDURMA", `lib/coachCore.js:70`).
Veri WeatherKit'ten gelir, hesap telefonda yapılır, cümle sabit şablondan çıkar.

#### E.2 Konum

- Yalnız "Uygulamayı Kullanırken" izni istenir ve `NSLocationDefaultAccuracyReduced = true` yazılır: izin penceresinde
  kesin konum kapalı gelir; yaklaşık konum "typically preserves the city" ve 1–20 km içindedir. Konum tek seferlik
  `requestLocation()` ile alınır.
- Capacitor Geolocation kullanılmaz: README iOS'ta "Always" metnini de istiyor. Aynı Swift eklentisi (`SkyPlugin.swift`)
  CoreLocation'ı doğrudan çağırır.
- İzin yalnız kişi Gökyüzü kartında "Konumumu kullan"a dokununca istenir; önce kendi tek cümlelik sayfamız, sonra sistem
  penceresi açılır. Açılışta, kurulumda ve İlk Bakış'ta asla istenmez (Apple'ın önerisi ve 5 sn kuralı).
- İzin metni: "Nefona, bulunduğun yerin hava durumunu ve yağmur olasılığını göstermek için yaklaşık konumunu kullanır.
  Konumun kaydedilmez; hava bilgisi için yalnız yuvarlanmış koordinat Apple'a gider."
- Koordinat Swift tarafında 2 ondalığa yuvarlanır. Şehir adı için ters coğrafi kodlama kullanılmaz (koordinatı ayrıca
  Apple'a gönderir); 81 il merkezinin tablosundan en yakın il telefonda bulunur (kaynak ve lisans eklenirken yazılır;
  VARSAYIM: GeoNames, CC BY 4.0).
- İzin yoksa kişi şehir seçer; Profil'deki şehir 81 ilden biriyse öneri olarak çıkar. "Allow Once" seçilirse sonraki
  açılışta kart yine tek dokunuşla sorar, en çok 3 kez; sonra yalnız şehir seçimi kalır.
- Konum ön planda en çok saatte bir alınır; hava önbelleği 60 dakikadır (VARSAYIM). Arka planda konum yoktur.
- Rıza `weather` v1'in metni dört satırdır: Ne (yaklaşık konum ya da seçilen şehrin merkezi), Neden (hava, yağmur olasılığı, istenirse yağmur
  bildirimi), Nerede (Apple'ın hava servisi, yurt dışı; sunucumuza ve Nef'e gitmez), Ne kadar (telefonda yalnız son
  konum; izin kapanınca silinir). KVKK m. 9 (2024) gereği her gün tekrarlanan yurt dışı aktarımın dayanağı hukukçuya
  sorulur.

#### E.3 Ay evresi

`lib/moon.js` Meeus'un *Astronomical Algorithms* kitabındaki 48. ve 49. bölüm formüllerini kullanır (≈ 60 satır,
kitaplık yok). USNO'nun 2026 tablosuyla sınandı:
50 evrede en büyük sapma 1,9 dk, Türkiye gününde kayan evre 0; "29,53 güne bölme" yöntemi 19,4 saate kadar sapıyor ve 50
evrenin 18'inde günü kaydırıyor. Kontrol değerleri şunlardır: 29.09.2026 12.00'de aydınlanma %91,1'dir (küçülen ay);
sonraki yeniay 10 Ekim'de, dolunay 26 Ekim'dedir. Testler USNO tablosundan örneklerle, ≤ 2 dk toleransla ve Türkiye günü birebir yazılır. Ay
hesabı konum ve ağ istemez; herkes için aynıdır. Mevcut süs ay simgeleri değişmez.

#### E.4 Hava ve ruh hali, hava ve hareket

Havanın ruh haline ortalama etkisi küçük ve kişiden kişiye değişken (Denissen 2008); bir grup kişi yağmuru sevmiyor, bir
grup hiç etkilenmiyor (Klimstra 2011); yaşam doyumu yargısını güvenilir biçimde etkilemiyor (Lucas ve Lawless 2013). Kötü
hava hareketin önünde bir engel (Tucker ve Gilliland 2007; Klimek 2022). Kullanımı: yağmurlu günde yürüyüş hatırlatmasının
metni içeride yapılabilecek bir seçeneğe döner; bu bir metin seçimidir, sağlık iddiası değildir.

#### E.5 Ay kartında "Bilim ne diyor?"

Laboratuvar ve saha çalışmalarının bir kısmı dolunaya yakın gecelerde uykunun birkaç dakika ile 20 dakika arası
kısaldığını bildirdi (Cajochen 2013, Casiraghi 2021, Chaput 2016, Benedict 2021); büyük nüfus çalışmalarında etki
bulunmadı (Haba-Rubio 2015, 2.125 yetişkin; Smith 2017, 1.411 ergen); bulgular yöne ve cinsiyete göre tutarsız (Della
Monica 2015); derleme sağlam kanıt görmüyor (Foster ve Roenneberg 2008). Kartın metni:

> Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde uykunun biraz kısaldığını buldu; binlerce
> kişiyle yapılan daha büyük çalışmalar fark bulamadı.

Kaynak satırı: Cajochen 2013, Haba-Rubio 2015, Casiraghi 2021, Smith 2017. Tavsiye yoktur. Hakemsiz 2026 ön baskısı
(PMID 41659491) ve özeti doğrulanamayan Cordi 2014 karta girmez.

#### E.6 Yağmur bildirimi

- Kısıtlar: uygulama kapalıyken kod çalışmaz, bildirimin saati ve metni kurulduğu anda sabitlenir (`lib/notifyPlan.js:1-3`);
  arka plan yenilemesinin zamanı garanti değildir ve uygulamada `fetch` kipi yoktur (`Info.plist:56-58`); Türkiye'de
  dakikalık yağış yoktur; sunucudan push, konumun sunucuya gitmesini gerektirdiği için reddedildi.
- Tercih "Yağmur haberi" ayrı ve varsayılan kapalıdır; hava kartı açık kişiye ilk yağmurlu günde bir kez sorulur:
  "Yağmur beklenen sabahlar sana haber vereyim mi?"
- Planlama: uygulama her ön plana gelişinde önbellek ≥ 60 dk eskiyse hava yenilenir ve bugünün ya da yarının bildirimi
  yeniden hesaplanır; 18.00'den sonraki açılış yarın sabahı planlar. Bildirimin çalacağı anda tahmin 18 saatten eskiyse
  bildirim kurulmaz.
- Saat ve eşik §2.2'dedir (A8, A9). Günde en çok bir bildirim gelir; kimlikler **7700 ve 7701**'dir, çünkü 7600–7607
  alarm yedeğine ayrılmıştır (`lib/alarmNative.js:9-10`); `notifyApply.js:15` `OWN_RANGES`'e `[7700, 7701]` eklenir. Bildirim sessiz gün deneyine
  girmez; düzeyi `active`'dir.
- Metin: başlık "Bugün yağmur bekleniyor"; akşam kurulmuşsa gövde "Dün akşamki tahmine göre 14.00–17.00 arası yağmur
  olasılığı %70." ve sabah kurulmuşsa "14.00–17.00 arası yağmur olasılığı %70."; sonunda "Kaynak: Apple Weather" (App
  Review cevabına bağlı). Dokununca Gökyüzü kartı açılır.
- Alarm sabahı: "Uyanınca" kartı (`lib/alarm.js:309`) bir satır hava gösterir; akşam alarm kartı (`:271`) "Yarın sabah
  yağmur bekleniyor" satırını gösterebilir.
- Bekleyen yerel bildirim sınırı yaygın olarak 64 bilinir (Apple belgesinde bulunamadı, VARSAYIM); bugünkü en dolu plan
  ≈ 49, yağmurla 51.

#### E.7 Ekran: başlık şeridi ve Gökyüzü kartı

- Ana sayfa tarih satırı (`Home.jsx:207`): "Salı, 29 Eylül · ◐ küçülen ay". App Review atıf cevabı olumlu gelirse
  "· 18° · öğleden sonra yağmur" eklenir. 320 pt'de şerit ikinci satıra iner. Ağ beklenmez; hava önbellekte yoksa yalnız
  ay görünür.
- Gökyüzü kartı "Günün" sayfasının üstünde durur ve sırasıyla şunları gösterir: başlık "GÖKYÜZÜ · İstanbul (yaklaşık)" ve sıcaklık; "Öğleden sonra yağmur
  bekleniyor"; saat saat yağış olasılığı şeridi (tek renk tonu); en yüksek ve en düşük sıcaklık; ay evresi ve aydınlanma;
  son ve sonraki dolunay ve yeniay; "Bilim ne diyor?"; her zaman görünen atıf satırı (Apple Weather markası temaya göre,
  "Veri kaynakları" bağlantısı) ve verinin yaşı ("12.40'ta alındı").
- Bağlam satırı sabit şablondur: yağmurda "Yağmur varsa yürüyüşünü içeride de yapabilirsin.", açık gündüzde "Gökyüzü açık;
  Gökyüzü molası için güzel bir gün."
- Kart şu durumları ayrı gösterir: hiç sorulmadı (ay tam; "Bulunduğun yerin havasını göstereyim mi?" [Konumumu kullan] [Şehir seç]); izin
  reddedildi (şehir seç); çevrimdışı ve önbellek < 12 sa (son veri ve yaşı); önbellek yok ("Hava için internet
  gerekiyor."); WeatherKit hatası ("Hava bilgisi şu an alınamadı.", 15 dk sonra yeniden); iOS 15 ve web (hava yok, ay
  tam).
- `gozolcum:sky-log` gün başına `{ date, rainy, tMax, moonIllum }` tutar; koordinat ve şehir tutmaz; 90 gün saklanır
  (VARSAYIM). Hava bir
  modül değil bağlamdır: `sessions`'a yazılmaz, alan puanına girmez, Nef'e gitmez.
- Kota için kişi başına günde en çok 8 istek yapılır; kota hatasında 15 dk beklenir (VARSAYIM).

### F. İlk 5 saniye ve devamlılık (Y3; şerit Y4–Y5)

#### F.1 Bugünkü durum

Kişinin "vay" dediği an İlk Bakış'ın sonucudur ve ilk dokunuştan ≈ 30 saniye sonra gelir; ilk 5 saniyede verilen şey
sonuç değil meraktır ("Önce bir şey fark edelim"). Kırpma sayısı 5 saniyede ölçülemez; bu dürüst bir sınırdır. Her günün
ilk açılışında Ana sayfa:
- dünden hiçbir şey söylemiyor; `homeSuggest` yalnız sıradaki durağı, yürüme uyarısını ve molayı biliyor;
- çevrimiçi Nef kartı ilk 5 saniyeye yetişemiyor (günün ilk açılışında sinyal yeni, istek zaman aşımı 10 sn, kart ilk
  görünen alanın altında);
- sıfırları ve kırık seriyi gösteriyor: seri bugün boşsa dünden sayılır (`lib/stats.js:223-232`) ve bir gün atlayan kişi
  ertesi sabah "0 gün seri" görür (`Home.jsx:236`); ilk günün ilk ekranında üç sıfır var. Bu, "seri bozuldu ekranı yok"
  tasarım ilkesiyle çelişiyor;
- tam ekran pencerelerle açılabiliyor: güncellemeden sonra Yenilikler (`App.jsx:795-798`), rıza sayfaları
  (`Home.jsx:203-204`);
- açılış ekranında logo var; Apple açılış ekranının ilk ekrana neredeyse benzemesini ve marka için kullanılmamasını
  öneriyor ("Launch instantly", "Don't advertise").

#### F.2 Günün ilk açılışı (yeni ekran yok)

Günün ilk açılışı telefonda tek anahtarla tanınır: `gozolcum:day-open` → `{ day, firstAt, firstTapAt, lead }`. Bu kayıt
`sessions`'a girmez, seriye, hedefe ve Nef'e sayılmaz; "Tüm verileri sil" onu da siler.

| Saniye | Nereye bakılır | İçerik | Aşama |
|---|---|---|---|
| 0–1 | açılış ekranı → Ana sayfa | düz zemin, logosuz (karar 5a) | Y3 |
| 1–2 | tarih satırı | ay evresi; App Review cevabından sonra hava | Y4–Y5 |
| 1–2 | selam | "Günaydın, Haydar" (bugünkü gibi) | — |
| 2–4 | Nef satırı | günün tek cümlesi | Y3 |
| 4–5 | büyük düğme | "Güne başla · Sağ–sol bakış · 1 dk" ve "Yeni" rozeti | Y3 (rozet Y1'e bağlı) |
| yan | sayılar | "0/9 durak · ≈ 15 dk"; seri yalnız ≥ 3 gün, değilse "12 gün seninle"; sıfır satırı yok (karar 5b) | Y3 |

Günün cümlesi ilk dokunuşa kadar ya da en çok 1 saat görünür; sonra `homeSuggest` bugünkü gibi çalışır. Yenilikler ve
rıza pencereleri günün ilk dokunuşundan ya da ilk duraktan sonra açılır (karar 5c); ilk rapor (5. gün) ve kırmızı görme
uyarısı istisnadır. Kırmızı ya da sarı görme uyarısı varsa günün cümlesi yazılmaz, uyarının sabit cümlesi en üste çıkar.
Alarm sabahında Sabah ekranı aynı şeridi gösterir. (d) geldiğinde, kişi açtıysa, ilk 5 saniyede şeridin yerinde canlı
mesafe ("● 34 cm") yazar; Ana sayfanın çizimi kamerayı beklemez.

#### F.3 Günün tek cümlesi (ilk tutan kazanır; hepsi telefonda, ağsız)

| Öncelik | Durum | Örnek |
|---|---|---|
| 0 | kırmızı ya da sarı görme uyarısı | cümle yok; uyarı en üstte |
| 1 | kurulumun ertesi günü ya da 1. gün | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." |
| 2 | bugün kilometre taşı | "Bugün 28. gün: iris haritan başlangıçla yan yana." / "Bugün haftalık E testi günü." |
| 3 | ≥ 2 günlük aradan dönüş | "Kaldığın yerden: basamakların aynı." |
| 4 | dün bir ilk ya da rekor | "Dün Yılan'da 38 ile en iyi sonucunu yaptın." |
| 5 | yeni doğrulanmış değişim | "Tek Bakışta'da iki haftadır başlangıcının üstündesin." |
| 6 | bugün yeni basamak ya da modül | "Bugün yeni: sağ–sol bakış." |
| 7 | dün yol tamamdı | "Dün yolun tamamdı. Bugün 9 durak, ≈ 15 dk." |
| 8 | ≤ 3 gün içinde kilometre taşı | "İris haritan 3 gün sonra başlangıçla yan yana." |
| 9 | hiçbiri | bugünkü `homeSuggest` satırı |

Aynı öncelik iki gün üst üste gelmez (0 ve 1 hariç); öneri ve bildirim etkileri zamanla söndü (Klasnja 2019). Cümle en
çok 70 karakterdir (VARSAYIM), tek sayı ve tek iddia taşır; karşılaştırma yalnız kişinin kendi başlangıcıyladır.
"İyileşti", "gelişiyorsun", "sağlıklı" yoktur. Tek günlük ham fark ("Dün 9, bugün 12 kırpma") söylenmez, çünkü çoğunlukla
gürültüdür. Cümle `day-open.lead`'e yazılır ve gün içinde değişmez.

#### F.4 Deneyim yayı

- **1–7. gün (deneme süresi; hedef "bu uygulama beni tanıyor"):** Her güne bir sürpriz düşer: 1. gün İlk Bakış sonucu, 2. gün sağ–sol ve Yılan, 3. gün
  ilk yoga, 4. gün nefes 3 dk ve yukarı–aşağı, 5. gün ilk rapor (deneme bitmeden), 6. gün Fark Ettin mi?, 7. gün "İlk
  haftan" satırı ve iki isteğe bağlı soru gelir. 5. gün raporunun ilk ekranı kişinin en güçlü kendi sayısıyla açılır ve
  "neyi ölçtük, neyi henüz bilmiyoruz" diye biter (görmede başlangıç en erken 22. gün).
- **8–30. gün (hedef "düzenim oturuyor"):** Kilometre taşları sırayla gelir: 8. gün ikinci E testi, 14. gün iyi oluş
  kartı, 22. gün görmede başlangıç, 25. gün geri sayım, 28. gün iris yan yana, 29. gün ilk aylık Nef. Aylık planda ilk yenileme 37. gündür; 28. ve 29.
  günün değeri ondan önce gelir. Bu bir ödeme hatırlatması değildir; aboneliğin sürekli değer vermesi Apple'ın kuralıdır
  (3.1.2(a)).
- **31–90+ gün (hedef "benim düzenim; ara verirsem de dönerim"):** 43. günden bekleme nefesi, 57. günden tam set günü,
  90. günden sonra haftalık odak açılır ("Bu haftanın odağı: yakın–uzak."). Gökyüzü şeridi her gün farklıdır; dolunayda yalnız
  betimleme ("Bu gece dolunay") yapılır. Ara vermek olağandır (Lau 2022, 41.207 kullanıcı); dönen kişi hiçbir sayının
  sıfırlandığını görmez. "66 günde alışkanlık" gibi bir söz verilmez (Singh 2024: kişiler arası 4–335 gün).

#### F.5 Devamlılık kanıtı (tasarımı yönlendirir, kullanıcıya söylenmez)

Bırakma yüksektir: kronik hastalık uygulamalarında birleşik bırakma %43'tür (Meyerowitz-Katz 2020); ruh sağlığı
uygulamalarında 30. gün kalma ortancası %3,3, nefes uygulamalarında %0'dır (Baumel 2019). Bağlılığı artıran bileşenler şunlardır: kişiye uyarlanmış içerik, kişiye göre
hatırlatma, kolay ve kararlı tasarım (Jakob 2022, 99 çalışma); kişinin kendi sağlığına içgörü kazanması ve kontrol
hissi (Borghouts 2021). Hatırlatma yapılan çalışmalarda bırakma daha düşüktü (Linardon 2019); kişiye uyarlanmış bildirim
ertesi 24 saatte kullanımı küçük ölçüde artırdı (Bidargaddi 2018, RR 1,039). Alışkanlığı tutarlılık, düşük karmaşıklık ve
keyif yordadı (Kaushal ve Rhodes 2015); planı yinelemek en güçlü yordayıcıydı (Keller 2021). Oyunlaştırmanın etkisi küçük ve
izlemde azalıyor (Mazeas 2022). Seri kırılmasının etkisini ölçen bir PubMed kaydı bulunamadı; kırık serinin gizlenmesi
kanıta değil, "ceza yok" tasarım ilkesiyle tutarlılığa dayanır.

#### F.6 Bağlılık göstergeleri (telefonda)

Yeni analiz kitaplığı eklenmez. Sahibin toplu görünümü App Store Connect (yalnız paylaşım izni verenlerden kalma
oranı) ve RevenueCat'tir (deneme → ücretli, yenileme; panel metrikleri VARSAYIM). Kişisel göstergeler telefonda hesaplanır:
G1 ilk dokunuş süresi (5 saniye kuralının doğrudan ölçüsü), G2 ilk açılışta durak başlatma oranı, G3 etkin gün, G4 yol
tamamlama, G5 dönüş, G6 durak bazında bırakma ve "sonra yaparım", G7 kilometre taşının görülmesi, G8 bildirimden açılış,
G9 cümle türüne göre durak başlatma. G1, G2 ve G9 yalnız TestFlight derlemesinde Profilim → Hakkında altında görünür;
yayın sürümünde hesaplanır ama gösterilmez ve gönderilmez. İlk sürümde deney yoktur, çünkü bildirim deneyi zaten
sürüyor ve iki deney aynı kişide ayrışmaz. Hedef değer konmaz; ilk 3 ay kendi başlangıcını kurar.

### G. Kod sözleşmesi ve değişen dosyalar (mevcut sistem bozulmaz)

#### G.1 İlerleme bağlamı ve manifest alanı

```
manifest.progression?: { match(s) → bool, ladder?: {...}, unlock?: { pathDay: n } }
ctx.progression = { pathDay, mod: { [id]: { D, G, Dstage } }, later: [...], seedDay: 'YYYY-MM-DD' }
stageOf(ctx, id) → null | { index, soft, D, Dvar, ...basamak, variant }
unlocked(ctx, id) → ctx.progression yoksa true
```

`validateManifest` (`modules/registry.js:85`) bilinmeyen alanı reddetmez; tek yeni kural: `progression` varsa `match`
işlev olmalıdır.

#### G.2 Yeni modül takma sözleşmesi (sahibin "daha birçok modül ekleyeceğiz" sözü için)

Yeni bir modül ancak şu altı parçayla "takılmış" sayılır; test her biri için ayrı denetim yapar:
1. `modules/<id>/manifest.js` ve ekranı (klasör koymak modül takmaktır).
2. `sessions.match` ve `progress.domain`: kayıt merkeze girer, alanın gün şeridini doldurur (`dataHub.test.js`).
3. Ölçüsü varsa `progress.metrics` (v2 parametreleriyle) ya da `effects`; yoksa kartta "düzenini sayar" satırı.
4. Yolda olacaksa `today(ctx)`, `lib/ladders.js`'te merdiven ve açılma eşiği; benzetim 20 dk sınırını ve düşme sırasını
   yeniden doğrular.
5. `coach()` en çok 6 alan, pencerede kayıt yoksa `null`; sunucudaki `MODULE_NOTES` satırı manifestteki `coachNote`
   ile birebir aynıdır.
6. Kaynak kartı (PMID + DOI) ve `storageKeys` ("Tüm verileri sil").

#### G.3 Aşama aşama dosyalar

| Aşama | Yeni | Değişen |
|---|---|---|
| Y1 | `lib/progression.js`, `lib/ladders.js`, `lib/breathMix.js` ve testleri | `screens/Home.jsx:162` (bağlam), `:165-170` (ara kilidi); `modules/registry.js:85`; `modules/breath/manifest.js`, `view.jsx:25`; `screens/Breath.jsx` ("2 dk daha", tutma ön koşulu); `lib/routines.js` (`dikey`, çeşitleme yaması); `modules/routine/manifest.js`; `screens/Routine.jsx:415` (`stage`); snake, notice, fark-ettin, tek-bakis manifestleri (`unlocked`); `components/TodayPath.jsx` (rozet); `lib/yoga.js` (ortak sayaç yardımcısı); `lib/pathLater.js` (`progressionCtx`) |
| Y2 | — | `lib/progress.js` (`metricStatusV2`; `metricTrend` ve 5. gün raporu aynen), `lib/dataHub.js` (`verifiedChange`: karışık, etkiler 28 gün), `modules/reading/manifest.js` (`reading-cps`), `components/ProgressOverview.jsx:36-48` (metin), `screens/Progress.jsx` ("Yolun"), `modules/tek-bakis/manifest.js` (`span7` ortanca) |
| Y3 | `lib/dayOpen.js` ve testi | `lib/homeSuggest.js` (isteğe bağlı `lead`), `screens/Home.jsx:152, 203-204, 236-247, 253-257`, `App.jsx:795-798`, `LaunchScreen.storyboard` ve `Splash.imageset`, `Info.plist:16` (kamera metni), WHO-5 14. gün kartı, `screens/FirstReport.jsx` ilk ekran metni |
| Y4 | `modules/gunun/`, `lib/dayCards.js`, `lib/moon.js`, "Günün" sayfası ve testleri | `lib/profileQuestions.js:170` (akşam grubu), `screens/Home.jsx:334-344` (kart), `lib/evidence.js`, `lib/sources.js`, `Home.jsx:207` (ay) |
| Y5 | `ios/App/App/SkyPlugin.swift`, `lib/sky.js`, il merkezleri tablosu, `components/SkyCard.jsx`, `lib/rainNotify.js` ve testleri | `MainViewController.swift:25-30`, `App.entitlements` (WeatherKit), `Info.plist` (iki konum anahtarı), `lib/consent.js` (`weather` v1), `notifyApply.js:15` (`OWN_RANGES`), `screens/AlarmMorning.jsx`, `lib/alarm.js`, `site/gizlilik.html:76`, `site/pages/gizlilik.html:49`, App Store gizlilik etiketi |
| Y6 | dönem paketleri (`YOL.nef.md` §11) | `lib/coach.js`, `lib/coachCore.js` (SCHEMA, `MODULE_NOTES`, istem), `api/coach.js`, `CoachCard`, `lib/consent.js` (coach v2), breath ve snake `coach()` (boşken `null`) |

#### G.4 Bilinçli olarak değişen test beklentileri

- `lib/dataHub.test.js:97`: "better + worse → down" yerine "null (karışık)" (Y2, karar 2).
- `modules/coachStats.test.js`: Tek Bakışta `span7` en iyiden ortancaya (Y2).
- `lib/profileQuestions.test.js:45-51`: akşam kartının erteleme testi yeni `gunun` kartına taşınır (Y4).
- Başka hiçbir mevcut beklenti değişmez; değişmesi gerekirse iş durur ve sahibe sorulur.

#### G.5 Değişmeden yeşil kalması gereken testler

Şu testler değişmeden geçmelidir: `lib/today.test.js` (45 test; normal gün sekiz durak),
`components/TodayPath.test.jsx`, `modules/registry.test.js`, `lib/dataHub.test.js` (97. satır dışında), `lib/progress.test.js`, `lib/breath.test.js`, `lib/homeSuggest.test.js`,
yoganın bütün testleri ve uygulamanın bütün takımı (bugün 1401 test). Bunlar mevcut sistemin bozulmadığının kanıtıdır.

#### G.6 Eşdeğerlik

- **İlerleme kapalı:** Y1 kodu `ctx.progression` verilmeden, yoganın 20.000 rastgele bağlamlık düzeneğiyle
  (`yoga-pilot/v3/v3fix2/esdeger_v4.mjs` kalıbı) bugünkü yola karşı koşulur. Durak listesi, bölümler, süreler, sıradaki
  durak, `allDone`, `minutesLeft`, mola ve kilit işaretleri **0 farkla** aynı olmalıdır.
- **İlerleme açık:** `today.test.js`'e yeni blok: 1., 2., 4., 8., 9. günler ve 29. gün uzun dönüş (§A.9 tablosu);
  yoga dışındaki durakların yogalı ve yogasız yolda birebir aynı kalması.
- Yeni testler: `progression.test.js` (bugün sayılmaz, yumuşak dönüş, açılma, `Dvar`), `ladders.test.js`,
  `breathMix.test.js` (zarf, art arda tekrar yok, tutma ön koşulu, belirlenimcilik), `progress.test.js` v2 bloğu (alışma,
  aynı gün beş tur tek nokta, başlangıç donar, tek haftalık sapma "noise", iki haftalık sapma "worse", SD tabanı),
  `dayOpen.test.js` (gece yarısı, saat dilimi, öncelik, tekrar yasağı, yasak kalıplar, 70 karakter, uyarıda cümle yok),
  `moon.test.js` (USNO ±2 dk, TR günü birebir, aydınlanma ±1 puan), `sky.test.js` (yuvarlama 41.0082 → 41.01, eşik,
  18 saat bayatlık, çevrimdışı ve iOS 15 metinleri), `rainNotify.test.js` (kimlik yalnız 7700–7701; 7600–7607'ye dokunmaz),
  Nef paket testi (konum, hava, şehir, koordinat, görme sayısı yok; `YOL.nef.md` T8 kalıbına `lat|lon|koordinat` eklenir).

### H. Kalite kapıları ve "bitti" tanımı

**Her aşamada sırasıyla:** (1) tasarım Artifact'i iki temada, 390 ve 320 pt'de; (2) sahibin onayı; (3) kod ve testler;
(4) bütün takım yeşil ve eşdeğerlik 0 fark; (5) bağımsız iki inceleme (kod ve dil); (6) TestFlight; (7) cihaz listesi;
(8) sahibin cihazda bakışı.

**Metin kapısı:** ekrana ya da bildirime giren her cümle üç denetimden geçer: makine denetimi (yasak sözcük ve iddia
listesi, 70 karakter sınırı, "ekrandaki cümle = söylenen cümle"), birbirinden bağımsız iki model incelemesi (TDK yazımı,
anlatım bozukluğu, yüklemsiz cümle, çeviri kokan yapı) ve sahibin onayı. İnsan editör adı verilirse o da okur (onaylı
yoga planı karar 2'deki yedek kuralın aynısı).

**Kanıt kapısı:** her kaynak kartı yayından önce PubMed'de yeniden açılır; PMID ve DOI'si olmayan kart yayına girmez.
Kartta kanıtın türü, kişi sayısı ve sınırı yazar.

**Gizlilik kapısı:** gizlilik sayfası, App Store gizlilik etiketi, rıza metni ve "Tüm verileri sil" kapsamı değişen
özellikle **aynı sürümde** güncellenir; biri eksikse sürüm çıkmaz. Hukukçu soruları (KVKK m. 9 konum aktarımı, ruh hali
verisinin sınıfı, coach rızası v2) cevaplanmadan Y5 ve Y6 App Store'a gönderilmez; TestFlight denemesi beklemez.

**Apple kapısı:** App Review'dan WeatherKit atfının başlık satırına ve bildirime uygulanışı için yazılı cevap S0'da
istenir; cevap gelmeden başlıkta hava, bildirimde atıf satırı yayına girmez.

**Cihaz listesi (örnekler; her madde `HATA_GUNLUGU`'na yazılır).** Her aşamada şunlara bakılır. Y1: yeni kurulumda
1., 2., 4. ve 9. gün; eski hesapta ilk açılış (merdivenin üstünde, çeşitleme 1. hafta yok); ara kilidinin 1. ve 2. günkü hissi; V3 kırpma grubunun gerçek süresi
(≤ 75 sn); "2 dk daha". Y3: sabah ilk açılışta cümle, gün içinde aynı cümle, ilk dokunuştan sonra eski satır; bir gün
atlayınca "0 gün seri" yok; güncellemeden sonra Yenilikler ilk dokunuştan sonra; açılış ekranından geçişte parlama yok.
Y4: akşam akışının 10 saniyede bitişi, "Geri al", 03.59 kapanışı. Y5: izin penceresi, yaklaşık konum, "Allow Once",
uçak modu, iOS 15 cihaz ya da benzetici, alarm sabahı, yağmur bildiriminin saati ve metni. Y6: çevrimdışı ve çevrimiçi
Nef'in aynı veride aynı satırları söylemesi.

**"Bitti" tanımı (sahibin kuralı):** bir aşama ancak cihazda doğrulanır ve kusursuz görülürse `[x]` olur. Kodda bitip
cihazda doğrulanmayan ya da eksiği olan iş `[~]`'dir ve tamamlanmış sayılmaz. Mükemmel olmayan hiçbir iş sahibe
"bitti" diye sunulmaz; kusur görülürse sormadan düzeltilir ve yeniden ölçülür.

### I. Aşamalar ve takvim

| Adım | İş | Çıktı | Sahip kapısı | Süre (VARSAYIM) |
|---|---|---|---|---|
| **S0** | Bu plan ve altı karar | Onay | Sahip | — |
| S0' | Tasarım Artifact'leri: Ana sayfanın ilk 5 saniyesi (iki tema, 390/320 pt), yol rozetleri, "Günün" sayfası, beş yüz, Gökyüzü kartı, Gelişim "Yolun" bölümü; App Review sorusu; hukukçu soruları; `az-hareket` ve `goz-yorgun` kaynaklarının PubMed doğrulaması | Onaylı tasarımlar | **S1:** tasarımlar | yoga üretimiyle birlikte |
| — | *Yoga yayını (yoga Kapı 8)* | | | plan onayından ≈ 7–12 hafta |
| Y1 | İlerleme motoru, merdivenler, açılma, ara kilidi | TestFlight | **S2:** cihazda 1., 2., 4., 9. gün ve eski hesap | 8–10 iş günü |
| Y2 | Ölçü kuralı v2, okuma, metinler, "Yolun" | TestFlight | **S3:** Gelişim cihazda | ≈ 5 iş günü |
| Y3 | İlk 5 saniye | TestFlight | **S4:** sabah ilk açılış cihazda | ≈ 3 iş günü |
| Y4 | Günün nasıl geçti, "Günün" sayfası, ay, kanıt kartları | TestFlight | **S5:** akşam akışı ve kart metinleri | ≈ 5 iş günü |
| Y5 | Hava, konum, yağmur bildirimi (Mac ve cihaz) | TestFlight, gizlilik sayfası, etiket | **S6:** izin, bildirim, atıf cihazda | 7–8 iş günü |
| Y6 | Nef haftalık, aylık, olay satırı; rıza v2 | TestFlight, sunucu yayını | **S7:** 30 soruluk Nef sınavı ve cihaz | 6–8 iş günü |
| sonra | (d) sessiz ölçüm; (e) uyku, yürüyüş, tepki, gökyüzü molası | kendi planları (`YOL.moduller.md`) | kendi kapıları | — |

Toplam kod işi ≈ 34–39 iş günü; cihaz denemeleri ve sahibin bakışlarıyla ≈ 8–11 hafta. Aşamalar sıralıdır, çünkü Y3
Y1'in basamaklarına ve Y2'nin doğrulanmış değişimine, Y6 ikisine birden dayanır; Y4 ile Y5'in tasarımı Y1–Y3 kodlanırken
hazırlanabilir. En büyük belirsizlikler Mac ve cihaz gerektiren Y5, App Review'un cevabı ve hukukçunun hızıdır. Her aşama
kendi TestFlight'ıyla yayına girebilir; bir aşamanın gecikmesi öncekileri geri almaz.

### J. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar:**
- **Cihazda hiçbir şey denenmedi.** Swift bu ortamda derlenmiyor; izin pencereleri, yaklaşık konum, bildirim zamanlaması,
  açılış ekranı geçişi ve ara kilidinin hissi doğrulanmadı.
- **Yol sayıları benzetimdir.** Kişinin durakları her gün sırayla bitirdiği varsayılır; göz bütçesinin gün içinde dolması
  benzetimde yoktur (eşdeğerlik sınaması kapsar). Yeni kullanıcı Yılan'ı yolda 90 günün yalnız 24'ünde görür; bu bugünkü
  düşme kuralının sonucudur ve bilerek korunur.
- **Etki iddiası yoktur.** Göz egzersizlerinde yüksek kesinlikte kanıt yok; nefes kalıpları arasında büyük fark yok;
  yavaş nefesin stres üzerindeki etkisi küçük–orta ve çalışmaların çoğunda yanlılık riski orta (Fincham 2023).
- **Ölçü kuralının parametreleri** yapay veriyle seçildi; klinik ya da yayımlanmış doğrulaması yok.
- **5 saniye stratejisinin** bu uygulamada kalmayı artırdığına dair veri yok; G1–G9 bunu ölçmek içindir.
- **Hava doğruluğu:** Türkiye için WeatherKit'in doğruluğunu bağımsız ölçen bir çalışma bulunamadı; Türkiye'de dakikalık
  yağış ve Apple'ın yağış bildirimleri yok.
- **Apple belirsizlikleri:** bir hava isteğinin kaç çağrı sayıldığı, atfın bildirimde ve başlıkta nasıl uygulanacağı,
  atıf görselinin önbelleğe alınıp alınamayacağı ve bekleyen bildirim sınırı belgelerde açık değildir.
- **Hukuk:** konumun yurt dışına aktarımı, ruh hali verisinin sınıfı ve coach rızası v2'nin kapsamı hukukçuya sorulacak.
- **Kaynak sınırları:** emoji ölçeğinin Türkçe genel toplulukta doğrulaması yok; gece ekranı kanıtı çocuk ve ergenlerden geliyor;
  Lally 2010 ve Silverman ve Barasch 2023 PubMed'de olmadığı için dayanak yapılmadı.
- **Nef'in model maliyeti** fiyat belli olmadığı için hesaplanamadı.

**VARSAYIM listesi:** açılma eşikleri (Yılan 1, görev 1, Fark Ettin mi? 5, Tek Bakışta 7); nefes basamak ve katman
günleri (7, 21, 42); nefes zarfının alt sınırı 4/dk; tutma süreleri ve haftalık sıklıkları; "Zorlandım"dan sonra 7 gün;
göz merdiveninin gün eşikleri ve V2–V4; `Dvar` hızı; göz grubunda 75 sn; ara kilidi kuralı; sıkıcılık kuralları; karışık
gün; ölçü kuralının parametreleri (alışma 1–2 gün, başlangıç 6 gün, son 3, c = 1,5, persist 2, SD tabanları); Pazartesi
bakışı; "karışık" alan hali; okumada art arda 2 test; olay satırının günde bir sınırı; günün cümlesinde 70 karakter ve
1 saat; seri eşiği 3 gün; sessiz ölçümde kameranın 3 sn hazır olma eşiği; "Sonra" = 2 saat; 03.59 kapanışı; etiketlerin
7. günde açılması; etiket gösterim eşiği 5 gün; düşük ruh hali eşiği; 44 pt dokunma alanı; yağmur–ruh hali
karşılaştırmasında 10 + 10 gün; hava önbelleği 60 dk; konum en çok saatte bir; yağmur eşiği %50 ve 0,5 mm; bildirim
saati ve 06.30–09.00 sınırı; 18 saat bayatlık; kişi başı günlük 8 istek; `sky-log` 90 gün; il merkezlerinin kaynağı;
evre adlarının sınırları; ΔT ≈ 69 sn; 64 bildirim sınırı; WeatherKit istek başına çağrı sayısı; RevenueCat panel
metrikleri; aşama süreleri ve takvim.

---

## Kaynaklar

**PubMed (notlarda PubMed kaydıyla doğrulandı, 2026-09-29)**

| Kaynak | PMID | DOI | Bu planda |
|---|---|---|---|
| Laborde 2022, Neurosci Biobehav Rev | 35623448 | [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711) | nefes zarfı |
| Fincham 2023, Sci Rep | 36624160 | [10.1038/s41598-022-27247-y](https://doi.org/10.1038/s41598-022-27247-y) | etkinin büyüklüğü |
| Balban 2023, Cell Rep Med | 36630953 | [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895) | 5 dk Ana sayfada |
| Van Diest 2014, Appl Psychophysiol Biofeedback | 25156003 | [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x) | veriş ≥ alış |
| Birdee 2023, Complement Ther Med | 36871835 | [10.1016/j.ctim.2023.102937](https://doi.org/10.1016/j.ctim.2023.102937) | kalıplar arası fark küçük |
| Marchant 2025, Appl Psychophysiol Biofeedback | 39864026 | [10.1007/s10484-025-09688-z](https://doi.org/10.1007/s10484-025-09688-z) | 6/dk, kutu ve 4-7-8 |
| You 2021, Int J Environ Res Public Health | 34203020 | [10.3390/ijerph18126630](https://doi.org/10.3390/ijerph18126630) | kısa başlangıç |
| Elia 2024, Am J Physiol Regul Integr Comp Physiol | 38314699 | [10.1152/ajpregu.00260.2023](https://doi.org/10.1152/ajpregu.00260.2023) | hızlı soluma yasağı |
| Badrov 2016, Am J Physiol Heart Circ Physiol | 27542408 | [10.1152/ajpheart.00334.2016](https://doi.org/10.1152/ajpheart.00334.2016) | tutmada ihtiyat |
| Singh 2022, Ophthalmology | 35597519 | [10.1016/j.ophtha.2022.05.009](https://doi.org/10.1016/j.ophtha.2022.05.009) | göz yorgunluğunda kanıt yok |
| Kim 2020, Cont Lens Anterior Eye | 32409236 | [10.1016/j.clae.2020.04.014](https://doi.org/10.1016/j.clae.2020.04.014) | kırpma |
| Wolffsohn 2025, Cont Lens Anterior Eye | 40467388 | [10.1016/j.clae.2025.102453](https://doi.org/10.1016/j.clae.2025.102453) | kırpma tekrarı; bırakınca kayıp |
| Talens-Estarelles 2022, Cont Lens Anterior Eye | 35963776 | [10.1016/j.clae.2022.101744](https://doi.org/10.1016/j.clae.2022.101744) | uzağa bakış |
| Eather 2023, J Sport Exerc Psychol | 37169353 | [10.1123/jsep.2020-0355](https://doi.org/10.1123/jsep.2020-0355) | çeşitlilik |
| Kaushal ve Rhodes 2015, J Behav Med | 25851609 | [10.1007/s10865-015-9640-7](https://doi.org/10.1007/s10865-015-9640-7) | alışkanlık |
| Jacobson ve Truax 1991, J Consult Clin Psychol | 2002127 | [10.1037//0022-006x.59.1.12](https://doi.org/10.1037//0022-006x.59.1.12) | güvenilir değişim fikri |
| Bartels 2010, BMC Neurosci | 20846444 | [10.1186/1471-2202-11-118](https://doi.org/10.1186/1471-2202-11-118) | öğrenme etkisi |
| Michie 2009, Health Psychol | 19916637 | [10.1037/a0016136](https://doi.org/10.1037/a0016136) | kendini izleme |
| Barnett 2005, Int J Epidemiol | 15333621 | [10.1093/ije/dyh299](https://doi.org/10.1093/ije/dyh299) | ortalamaya dönüş |
| Subramanian ve Pardhan 2006, Optom Vis Sci | 16909082 | [10.1097/01.opx.0000232225.00311.53](https://doi.org/10.1097/01.opx.0000232225.00311.53) | okuma tekrar payı |
| Seguí 2015, J Clin Epidemiol | 25744132 | [10.1016/j.jclinepi.2015.01.015](https://doi.org/10.1016/j.jclinepi.2015.01.015) | CVS-Q (araştırılacak) |
| Parry 2021, Nat Hum Behav | 34002052 | [10.1038/s41562-021-01117-5](https://doi.org/10.1038/s41562-021-01117-5) | ekran süresi öz bildirimi |
| Thompson 2025, JCO Clin Cancer Inform | 39772639 | [10.1200/CCI-24-00148](https://doi.org/10.1200/CCI-24-00148) | emoji sıralı ölçek |
| Gertler ve Tate 2020, Brain Inj | 32126846 | [10.1080/02699052.2020.1733087](https://doi.org/10.1080/02699052.2020.1733087) | tek madde |
| Killgore 1999, Psychol Rep | 10710979 | [10.2466/pr0.1999.85.3f.1238](https://doi.org/10.2466/pr0.1999.85.3f.1238) | görsel tek madde |
| Cui 2024, Heliyon | 39717587 | [10.1016/j.heliyon.2024.e39796](https://doi.org/10.1016/j.heliyon.2024.e39796) | sistem emojisi riski |
| Wrzus ve Neubauer 2022, Assessment | 35016567 | [10.1177/10731911211067538](https://doi.org/10.1177/10731911211067538) | EMA uyumu |
| Eisele 2020, Assessment | 32909448 | [10.1177/1073191120957102](https://doi.org/10.1177/1073191120957102) | uzun anket yükü |
| Baumel 2019, J Med Internet Res | 31573916 | [10.2196/14567](https://doi.org/10.2196/14567) | 30. gün kalma |
| Van Dongen 2003, Sleep | 12683469 | [10.1093/sleep/26.2.117](https://doi.org/10.1093/sleep/26.2.117) | kısa gece kartı |
| Lim ve Dinges 2010, Psychol Bull | 20438143 | [10.1037/a0018883](https://doi.org/10.1037/a0018883) | kısa gece kartı |
| Hale ve Guan 2015, Sleep Med Rev | 25193149 | [10.1016/j.smrv.2014.07.007](https://doi.org/10.1016/j.smrv.2014.07.007) | gece ekranı kartı |
| Denissen 2008, Emotion | 18837616 | [10.1037/a0013497](https://doi.org/10.1037/a0013497) | hava ve ruh hali |
| Klimstra 2011, Emotion | 21842988 | [10.1037/a0024649](https://doi.org/10.1037/a0024649) | hava tipleri |
| Lucas ve Lawless 2013, J Pers Soc Psychol | 23607534 | [10.1037/a0032124](https://doi.org/10.1037/a0032124) | yaşam doyumu |
| Tucker ve Gilliland 2007, Public Health | 17920646 | [10.1016/j.puhe.2007.04.009](https://doi.org/10.1016/j.puhe.2007.04.009) | hava ve hareket |
| Klimek 2022, Eur Rev Aging Phys Act | 35151273 | [10.1186/s11556-022-00286-0](https://doi.org/10.1186/s11556-022-00286-0) | yağış ve yürüme |
| Cajochen 2013, Curr Biol | 23891110 | [10.1016/j.cub.2013.06.029](https://doi.org/10.1016/j.cub.2013.06.029) | ay (lehte) |
| Haba-Rubio 2015, Sleep Med | 26498230 | [10.1016/j.sleep.2015.08.002](https://doi.org/10.1016/j.sleep.2015.08.002) | ay (etki yok, 2.125) |
| Della Monica 2015, J Sleep Res | 26096730 | [10.1111/jsr.12312](https://doi.org/10.1111/jsr.12312) | ay (sınırlı kanıt) |
| Smith 2017, J Sleep Res | 27928860 | [10.1111/jsr.12472](https://doi.org/10.1111/jsr.12472) | ay (etki yok, 1.411) |
| Chaput 2016, Front Pediatr | 27047907 | [10.3389/fped.2016.00024](https://doi.org/10.3389/fped.2016.00024) | ay (≈ 5 dk) |
| Casiraghi 2021, Sci Adv | 33571126 | [10.1126/sciadv.abe0465](https://doi.org/10.1126/sciadv.abe0465) | ay (lehte, saha) |
| Benedict 2021, Sci Total Environ | 34520928 | [10.1016/j.scitotenv.2021.150222](https://doi.org/10.1016/j.scitotenv.2021.150222) | ay (kesitsel) |
| Foster ve Roenneberg 2008, Curr Biol | 18786384 | [10.1016/j.cub.2008.07.003](https://doi.org/10.1016/j.cub.2008.07.003) | ay (derleme) |
| Singh 2024, Healthcare (Basel) | 39685110 | [10.3390/healthcare12232488](https://doi.org/10.3390/healthcare12232488) | alışkanlık süresi |
| Keller 2021, Br J Health Psychol | 33405284 | [10.1111/bjhp.12504](https://doi.org/10.1111/bjhp.12504) | planı yinelemek |
| Meyerowitz-Katz 2020, J Med Internet Res | 32990635 | [10.2196/20283](https://doi.org/10.2196/20283) | bırakma %43 |
| Linardon ve Fuller-Tyszkiewicz 2019, J Consult Clin Psychol | 31697093 | [10.1037/ccp0000459](https://doi.org/10.1037/ccp0000459) | hatırlatma |
| Lau 2022, Front Public Health | 36438245 | [10.3389/fpubh.2022.914433](https://doi.org/10.3389/fpubh.2022.914433) | ara ve dönüş |
| Mazeas 2022, J Med Internet Res | 34982715 | [10.2196/26779](https://doi.org/10.2196/26779) | oyunlaştırma |
| Jakob 2022, J Med Internet Res | 35612886 | [10.2196/35371](https://doi.org/10.2196/35371) | bağlılık bileşenleri |
| Borghouts 2021, J Med Internet Res | 33759801 | [10.2196/24387](https://doi.org/10.2196/24387) | içgörü, kontrol |
| Bidargaddi 2018, JMIR Mhealth Uhealth | 30497999 | [10.2196/10123](https://doi.org/10.2196/10123) | kişiye göre bildirim |
| Klasnja 2019, Ann Behav Med | 30192907 | [10.1093/abm/kay067](https://doi.org/10.1093/abm/kay067) | etkinin sönmesi |

**Dayanak yapılmayanlar:** Cordi 2014 (PMID 24937275; özeti PubMed'de yok, içeriği doğrulanamadı); Ferrante 2026 (PMID
41659491; hakemsiz ön baskı); Vierra 2022 (PMID 35822447; kontrol koşulu yok); Sadhwani 2024 (PMID 39185289; küçük ve
beklenmedik bulgu); Zhong 2026 (PMID 42516552; göz hareketinin payı ayrılamıyor, yalnız "incelenmekte" çerçevesi); Wiecek
2026 (PMID 42078174; şirket verisi); Toet 2018, Kaneko 2018, Dewey 2025, Mazerolle 2026, Ulitzsch 2025, Kahneman 2004
(notlarda doğrulandı; ölçek seçiminin arka planı, kartlarda kullanılmaz); Lally 2010 ve Silverman ve Barasch 2023
(PubMed'de yok); Paluch 2022 ve Galinsky 2000 (koddaki kayıtlar; Y4 kapısında doğrulanacak).

**Apple (notlarda okundu, 2026-09-29):** DeviceActivityReport, DeviceActivity, DeviceActivityEvent, FamilyControls,
AuthorizationCenter; Apple Developer Forums 727958 (Apple çalışanının cevabı, belge değil); App Review Guidelines 3.1.2(a),
4.5.4, 4.10, 5.1.1, 5.1.2(vi), 5.1.5; HIG "Launching"; "Reducing your app's launch time"; App Store Connect "App retention";
WeatherKit (genel sayfa, get-started, veri kaynakları atfı, WeatherAttribution, WeatherAvailability, yetki,
`DayWeather.precipitationChance`, `HourWeather.precipitationAmount`, `MoonEvents`); WeatherKit REST (kimlik doğrulama);
Apple Destek 105038; CoreLocation (yetki isteme, `requestWhenInUseAuthorization`, `requestLocation`,
`kCLLocationAccuracyReduced`); `NSLocationWhenInUseUsageDescription`, `NSLocationDefaultAccuracyReduced`; BackgroundTasks
(`BGAppRefreshTask`, `earliestBeginDate`); App privacy details; HealthKit (`HKCategoryValueSleepAnalysis`,
`timeInDaylight`, `HKStateOfMind`); `UNNotificationInterruptionLevel.passive`.

**Diğer:** Open-Meteo kullanım koşulları, fiyatlar ve belgeler; MEVBİS ve MGM ürünler sayfası; KVKK "Yurt Dışına
Aktarım"; USNO 2026 ay evreleri (`usno2026.json`); `@capacitor/geolocation` 8.2.2 README; Meeus J., *Astronomical
Algorithms*, 2. baskı, bölüm 48–49 (kitap).
