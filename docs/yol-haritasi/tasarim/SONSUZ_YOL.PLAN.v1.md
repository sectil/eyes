# Sonsuz yol · Üst akıl planı (sürüm 1)

> **Durum (2026-10-01):** Y1 kodda (Build 67), metin kapısı ve notlar kapandı, cihaz listesi sahipte; Y2–Y6 başlamadı; Y5 B2'ye taşındı. Güncel pano: `docs/yol-haritasi/YAPILACAKLAR.md` → "DURUM PANOSU".

Tarih: 2026-09-29 (tur 1 ve tur 2 düzeltmeleriyle). Durum: **ONAYLANDI (sahibi, 2026-09-30: "sonsuz plana da başla"; altı karar öneriyle; hukukçu adı yok → yedek).** Uygulama koduna dokunulmadı, ücretli çağrı
yapılmadı. Belge ve notlar `docs/yol-haritasi/tasarim/arastirma-v1/` klasöründedir. Sonsuz yolun kodu, onaylı yoga planının karar 7'si gereği yoga
yayınından sonra yazılır; bu belge yalnız planı verir.

**Dayandığı çalışma notları** (bu klasörde; her biri kendi kaynaklarını satır satır verir): `merdiven.md` (merdivenler,
ilerleme sözleşmesi, gün gün yol), `gelisim-nef.md` (Gelişim'de izleme, ölçü kuralı, Nef'in gidişat yorumları),
`gunun.md` ("Günün nasıl geçti", ekran süresi, kanıt kartları), `hava-ay.md` (konum, hava, yağmur, ay, bildirim),
`bes-saniye.md` (ilk 5 saniye, devamlılık, bağlılık göstergeleri). Benzetim betikleri: `sim_merdiven.mjs` ve
`today_v4.js` (yol; tur 1'de onaylı yoga planının psikolog yedeği eklendi), `sim.mjs`, `sim2.mjs` ve `sim_kural_esit.mjs`
(ölçü kuralı; sonuncusu bütün kuralları aynı sürede karşılaştırır), `sayim_nefes.mjs` (nefes kalıbı sayımı),
`moontest.mjs` (ay evresi), `_tur2_kart_sayim.mjs` (30 akşamda kanıt kartı sayısı). Sonuçlar: yol ilk 30 günde ortalama
15,3 dk, ilk 90 günde 15,7 dk. Benzetimde, gerçek bir değişim yokken 26 hafta içinde en az bir kez yanlış "geriliyor"
görenlerin oranı bugünkü kuralda %27,2, önerilen kuralda %13,0'dır. Ay evresinde USNO'ya göre en büyük sapma 1,9 dk'dır.

**Bağlayıcı girdiler:** `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md` (bağlayıcı iş sırası dâhil),
`yoga-pilot/SAHIP_ISTEKLERI.md` madde 7, onaylı `yoga-pilot/v3/PLAN.v3.md` (bu plan onu değiştirmez; uyumu §2.3'te).
Mevcut yol belgeleri: `YAPILACAKLAR.md`, `tasarim/YOL.ilerleme.md`, `YOL.moduller.md`, `YOL.nef.md`.

**Kurallar:** Sağlık iddiası yoktur. Bilimsel iddialar yalnız notlarda PubMed'den doğrulanmış kayıtlara dayanır ve PMID
ile DOI taşır; PubMed'de olmayan çalışmalar dayanak yapılmaz. Apple iddiaları notlarda okunan Apple belgelerine, kod
iddiaları `dosya:satır` biçiminde 2026-09-29 tarihli çalışma ağacına dayanır (yollar `app/src/` altına göredir; bu belge
için ayrıca okunup doğrulananlar §3'te işaretli). Kanıtın vermediği her sayı **VARSAYIM** diye yazılır.

---

## 1. Tek sayfada

**Ne değişir.** Yol her gün aynı kalmaz: kısa başlar, 2.–9. günlerde her gün bir adım büyür ve hiç bitmez. İlk gün yol
8 dakikadır: haftalık E testi, Çemberler, 1 dakika nefes ve göz kırpma. 2.–9. günlerde her gün yeni bir adım gelir ve 9.
günde bugünkü tam yola ulaşılır. Sonra yol çeşitlemelerle (tekrar, süre, nefes kalıbı), Daire ile Yukarı–aşağı'nın gün
aşırı gelmesiyle ve 90. günden sonra haftalık odakla değişmeye devam eder. Yoga, onaylı plandaki gibi 3. günden başlayarak
E testi günleri dışında her gün yoldadır: çoğu gün bir dersin 3 dakikalık sürümü, yaklaşık 8 günde bir de 5 dakikalık tam
ders gelir. Psikoloğun adını henüz vermediğin için onaylı yoga planının yedek kuralı geçerlidir: Zor Anlar İçin yolda gelmez,
Kendine Şefkat yolda yalnız 17.00'den sonra gelir. Her modül kaydını tek merkeze yazar; Gelişim her modülü aynı dört
katmanla gösterir; Gelişim, raporlar ve Nef aynı sonucu gösterir. Ana sayfa her günün ilk açılışında kişinin kendi
verisinden çıkan tek bir cümleyle ve ay şeridiyle açılır; Apple onay verirse şeride hava da eklenir. Akşamki üç soruluk
form kalkar; yerine tek dokunuşluk "Günün nasıl geçti?" ve o güne uyan, kaynağı doğrulanmış tek bir bilgi kartı gelir.
Mevcut yolun bölümleri, ölçümleri ve oyunları aynı kalır.

**Kişi ne görür** (uygulamayı her gün açan yeni kullanıcı; sayılar benzetimden gelir, cihazda denenmedi):
- **1. gün:** Ana sayfanın ilk cümlesi "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." olur.
  Tarih satırında ayın evresi görünür; hava, kişi isterse "Hava ve ay" kartında görünür. Yol 8 dakikadır. Akşam
  18.00'den sonra günün nasıl geçtiği tek dokunuşla kaydedilir.
- **7. gün:** Yol 15 dakikadır. Bir hafta içinde sağ–sol bakış, "üçü birlikte", yukarı–aşağı, uzağa bakış, yakın–uzak,
  Yılan, Bugünün görevi, Fark Ettin mi? ve beş yoga dersi yola girmiş, nefes 3 dakikaya çıkmıştır. 5. gün ilk rapor
  kendiliğinden açılmıştır. Günün ilk cümlesi her gün değişir ("Bugün yeni: yakın–uzak.").
- **30. gün:** İlk 30 günün yol ortalaması 15,3 dakikadır (en kısa 8, en uzun 18; 8. günden sonra E testi günleri 17,
  okuma günleri 18 dakikadır). 22. gün görmede
  başlangıç değeri hazır olur, kırpma 10 tekrara çıkar ve kısa tutmalı nefes günleri başlar. 28. gün iris haritası
  başlangıçla yan yana gelir, 29. gün Nef'in ilk aylık değerlendirmesi gelir. Gelişim'in "Yolun" bölümü her modülün
  basamağını ve 28 günlük düzenini gösterir. Yoga 30 günün 24'ünde yoldadır; 10.00'da açan kişide üç tam dersin hepsi
  Derin Dinlenme'dir. Akşamların yaklaşık yarısında o güne uyan bir kanıt kartı çıkar (§3.D.4).
- **90+ gün:** İlk 90 günün yol ortalaması 15,7 dakikadır ve hiçbir gün 20 dakikayı aşmaz; 90. günden sonraki haftalık
  odak benzetilmedi. 43. ve 57. günlerde yeni çeşitlemeler
  açılır, her hafta bir modül odak olur, 57. ve 85. günlerde aylık Nef gelir. Ara verip dönen kişi hiçbir sayının
  sıfırlandığını görmez ve "Kaldığın yerden" cümlesiyle karşılanır. Yürüyüş, uyku ve tepki kendi aşamalarında aynı
  kurallarla eklenir; uygulamada zaten var olan Gökyüzü molası da (e) ile yola girer.

**İsteklerin nasıl karşılandığı**

| İsteğin | Karşılığı |
|---|---|
| Her modül Gelişim'e katkı sağlar; esas beyin merkezdir | Her modül tek merkeze yazar; Gelişim her modülde düzen, basamak, ölçü ve değişimi aynı iskeletle gösterir. Etki ölçüsü olmayan modül (göz egzersizleri, Yılan, Çemberler) düzeniyle ve basamağıyla izlenir; düzen de bir ölçüdür, ama bu modüllere etki ölçüsü uydurulmaz. Gelişim, "Doktoruma göster" raporu, dışa aktarma ve Nef aynı sonucu tek yerden okur. Merkezin değişim kuralı yenilenir (karar 2). Benzetimde, gerçek bir değişim yokken bile bugünkü kuralda kişilerin %27'si 26 hafta içinde en az bir kez "geriliyor" görüyor; yeni kuralda bu oran %13'e iner (dört ölçüsü olan bir alanda %63'ten %35'e). Bu düşüşün çoğu haftada bir bakmaktan ve iki hafta sürme koşulundan gelir. Yeni kural ayrıca aynı günün turlarını tek sayar, başlangıcı sabitler, 1 yıllık geçmişin sonundaki yeni bir düşüşü iki kat sık yakalar ve göreve alışmayı "iyileşme" sanma oranını yarıya indirir. **Bedeli:** kaydın 13. haftasından sonra başlayan gerçek bir düşüşü 26. haftaya kadar bugünkü kural hemen her kişide yakalıyor, yeni kural yaklaşık iki kişiden birinde (%99,8'e karşı %52; §3.B.3) |
| 5 saniye kuralı (uygulama ve site) | İki ayrı an vardır. **İlk kez açan kişi:** bugün ilk 5 saniyede giriş ekranı, "Fark etmeyi yeniden öğren." ve "Başla" görünür; "vay" anı İlk Bakış'ın sonucudur ve ≈ 30 saniye sonra gelir. Öneri: giriş ekranının alt yazısı İlk Bakış'ın vaadini söylesin, sitenin ilk ekranı "Bu cümleyi okurken kaç kez göz kırptın?" sorusuyla açılsın (karar 5, §3.F.2). **Her günün ilk açılışı:** yeni ekran yoktur; Ana sayfanın üstünde ay şeridi (Apple'ın atıf cevabından sonra hava da), kişinin kendi verisinden çıkan tek cümle ve "Yeni" rozeti görünür; sıfırlar, kırık seri ve tam ekran pencereler ilk 5 saniyeden çıkar (§3.F). Dürüst sınır: 5 saniyede ölçüm yapılamaz; ilk saniyeler merak ve kişisel bir cümle verir |
| Merdivenler ve nefes kalıpları | Nefes 1 → 2 → 3 dakika (son sözün; yolda en çok 3, onaylı yoga kararı 5.1). Göz: kırpma → sağ–sol → üçü birlikte → yukarı–aşağı → uzağa bakış → yakın–uzak → daire. Nefes kalıbının süreleri güvenli sınırlar içinde üretilir: 8.–21. günlerde 40, 22. günden başlayarak 99, 43. günden başlayarak 629 bileşimden seçilir; beklemeli olanlar haftada en çok bir gün gelir (sayım §3.A.4). Senin 4·2·4·4'ün 43. günden başlayarak, haftada en çok bir gün ve güvenlik koşullarıyla gelir; hızlı soluma hiç yoktur (§3.A) |
| Aralar | Yolun arası, iki bölüm arasındaki moladır: nefes 1. gün 1, 2. gün 2, 3. günden başlayarak 3 dakikadır. İlk iki gün mola nefesle biter; 3. günden başlayarak molanın kalanı "2 dk daha" düğmesi ya da gözler kapalı dinlenmedir. Meditasyon ayrı durak değildir; yolun sesli rehberli dersleri yoganın kısa dersleridir (onaylı yoga kararı 5.1) |
| Nef'in gidişat yorumları | Nef, günün ilk açılışında telefonda üretilen tek bir cümle söyler. Yeni bir basamakta ya da ilk doğrulanmış değişimde bu cümlenin yerine bir olay satırı yazar. Pazartesi haftalık, 29., 57. ve 85. günde aylık değerlendirme verir. Nef yalnız merkezin doğruladığı durumu söyler; sağlık, tanı ve başkasıyla karşılaştırma yoktur (§3.C) |
| "Günün nasıl geçti" ve ekran süresi sorusu | Apple, toplam ekran süresini uygulamalara sayı olarak vermiyor; veri yalnız Apple'ın kapalı rapor görünümünde gösterilebiliyor (Apple belgesi, §3.D). Uygulama bugün de ekran süresini okumuyor. Bu yüzden "Bugün kaç saat ekrana baktın?" sorusu kalkar; yerine ölçtüğümüz şey adıyla gösterilir: "Nefona'da bugün 11 dk göz çalışması". Akşam akışı 10 saniyede biter: ölçülenler, tek dokunuş, o güne uyan tek bilgi kartı. PubMed bilgisi canlı aramayla değil, önceden doğrulanmış kart kütüphanesinden gelir. Kartlar o günün yolundaki nefese, göz kırpmaya ve uzağa bakışa, dolunaya ve akşam seçilen etikete bağlıdır. Yolu her gün yapan kişi 30 akşamın 14–15'inde kart görür; Y4'te yalnız dolunay ve gece ekranı kartları olsaydı bu sayı ayda 1–4 olurdu (hesap, §3.D.4) |
| Emoji ya da puan | Beş yüz çizilir, altlarına Türkçe etiket yazılır (karar 3) |
| Hava, yağmur, ay, konum ve PubMed | Ay evresi her gün Ana sayfanın tarih satırında görünür; satıra dokununca "Günün" sayfası açılır ve satırın sonundaki küçük ok bunu gösterir. Hava Apple WeatherKit'ten gelir. 7. günden sonra, günün ilk dokunuşundan sonra Ana sayfada bir kez "Bulunduğun yerin havasını da göstereyim mi?" teklifi çıkar; reddedilirse bir daha sorulmaz. Konum yalnız kişi isteyince ve yaklaşık olarak alınır, izin yoksa şehir seçilir. Ay evresi telefonda, ağsız hesaplanır. Ay kartındaki "Bilim ne diyor?" satırı, ayın uykuya etkisinin tartışmalı olduğunu beş kaynakla gösterir. Nef hava bilgisi üretmez, çünkü bir dil modeli ölçüm kaynağı olamaz. "En doğru kaynak" iddiası yazılmaz: Türkiye için bağımsız karşılaştırma bulunamadı, MGM'nin açık bir geliştirici arayüzü yok (§3.E) |
| Yağmur bildirimi | "Bugün yağmur bekleniyor" bildirimi ayrı bir tercihtir, varsayılanı kapalıdır ve ilk yağmurlu günde bir kez sorulur. Günde en çok bir yağmur bildirimi gelir, o da sabah. Türkiye'de dakikalık yağış verisi olmadığı için "Yağmur başlamak üzere" bildirimi gönderilemez (§3.E) |
| Yeni modüller (yürüyüş, uyku, hareket, dikkat) ve Gökyüzü molası | Hepsi aynı kurallarla takılır: kayıt, alan, merdiven verisi ve Nef satırı. Tasarımları `YOL.moduller.md`'dedir; (d) ve (e) aşamalarında gelir. Gökyüzü molası uygulamada zaten vardır (`modules/gokyuzu/manifest.js:1`), yalnız yolda değildir; (e) ile yola girer |

**Bugünkü kullanıcı ne görür.** Yolun bölümleri, ölçümleri ve oyunları aynı kalır. Yoldaki nefes 5 yerine 3 dakikadır ve
"2 dk daha" düğmesiyle 5'e tamamlanır; mola yine 5 dakikadır (onaylı yoga kararı 5.1). Daire ile Yukarı–aşağı gün aşırı
gelir. Bugünün görevi herkesin yoluna girer. Eski kullanıcıda nefesin "Günün ritmi" güncelleme günü açılır; kısa tutma
7, bekleme nefesi 28 çalışma gününden sonra gelir. Göz egzersizlerinde ilk çeşitleme 7, sonrakiler 14, 28 ve 42 çalışma
gününden sonra gelir. Yoldaki 3 dakika, 28 günlük nefes programında ancak "2 dk daha" ile gün sayılır, çünkü program günü
5 dakika ister (`lib/breath.js:16`, `:277-294`). Akşam formunun yerine tek dokunuş gelir. Karar 2 onaylanırsa Gelişim'deki
bazı durum etiketleri, raporlar ve Nef "doğrulanmış bir değişim yok" der. Sitedeki "Bir günün nasıl geçer" bölümü ve
yol görselleri bugünkü yolu anlatır; Y1 ve Y4 ile güncellenir.

**Onaylı tasarım özünden iki sapma** (`YAPILACAKLAR.md:67-70`; gerekçesi §2.1 satır 20 ve 23): "hafif gün ≈ 7 dk" ilk
sürümde yoktur; "daire → 14. günde tam set" basamağı 57. güne kayar, çünkü göz egzersizlerinin beş grubu 9. günden beri
zaten yoldadır ve ayrıca bir tam set eklemek yolu uzatır. İkisi karar 1'in parçasıdır.

**Uygulama sırası ve iş büyüklüğü.** Kod, yoga yayınından (yoga Kapı 8) sonra başlar; her aşama ayrı onay, test,
TestFlight ve cihaz denemesiyle ilerler (§3.I).

| Aşama | İş | Büyüklük (VARSAYIM) |
|---|---|---|
| S0 (şimdi, yoga üretimiyle birlikte) | Plan onayı, ekran tasarımları, App Review'a atıf sorusu, hukukçu soruları; kod yok | — |
| Y1 | İlerleme motoru, nefes ve göz merdivenleri, açılma kuralları ((c) adımı) | 8–10 iş günü |
| Y2 | Gelişim: yeni ölçü kuralı, okuma testinin Göz alanına girmesi, "Yolun" bölümü | ≈ 5 iş günü |
| Y3 | İlk 5 saniye: giriş ekranının alt yazısı, sitenin ilk ekranı, günün cümlesi, rozet, sıfırların kalkması, açılış ekranı | ≈ 4 iş günü |
| Y4 | "Günün nasıl geçti", "Günün" sayfası, ay kartı, kanıt kartları | ≈ 5 iş günü |
| Y5 | Hava, konum, yağmur bildirimi (Swift eklentisi; Mac ve cihaz gerekir) | 7–8 iş günü |
| Y6 | Nef haftalık ve aylık değerlendirme, olay satırı ((f) adımı) | 6–8 iş günü |

Kod ≈ 35–40 iş günü; cihaz denemeleriyle ≈ 8–11 hafta; senin onay sürelerin buna dâhil değildir. Yoga yayını, yoga
planının onayından (29 Eylül) ≈ 7–12 hafta sonra bekleniyor (senin dinleme sürelerin hariç); bu yüzden sonsuz yolun son
aşaması kabaca 2027'nin ilk çeyreğine düşer (VARSAYIM). **Bu sıra onaylı sıradan bir noktada ayrılır**
(`YAPILACAKLAR.md:77-79`: (a) → (g)): Nef'in haftalık ve aylık değerlendirmesi ((f), Y6), sessiz ölçümün (d) ve uyku ile
yürüyüşün (e) önüne geçer. Bu yüzden (d) sessiz ölçüm ile (e)'deki uyku kalitesi, yürüyüş, tepki ve Gökyüzü molası
2027'nin ilk çeyreğinden sonraya kalır (karar 1).

**Maliyet.** WeatherKit, Apple geliştirici üyeliğine dâhil ayda 500.000 çağrı verir; üstü 1 milyon çağrıya kadar ayda
49,99 USD, 2 milyona kadar 99,99 USD, 5 milyona kadar 249,99 USD'dir. Havayı açan kişinin günde ortalama 3 istek yaptığı
varsayıldı (VARSAYIM). Bir isteğin kaç çağrı sayıldığı Apple belgesinde yazmıyor; bu yüzden 1 ve 3 çağrı için ayrı ayrı
hesaplandı. Havayı açan günlük 1.000 etkin kullanıcıda ek ücret yoktur. 5.000 kişide ya ücret yoktur (istek = 1 çağrı)
ya da ayda 99,99 USD ödenir (istek = 3 çağrı). 10.000 kişide ayda 49,99 USD (istek = 1 çağrı, 900 bin çağrı) ya da
249,99 USD (istek = 3 çağrı, 2,7 milyon çağrı) ödenir. En kötü durum, herkesin günlük sınır olan 8 isteği doldurmasıdır:
10.000 kişide istek 1 çağrıysa ayda 2,4 milyon çağrı eder (249,99 USD); istek 3 çağrıysa 7,2 milyon eder ve notlarda
okunan en üst basamağı (5 milyon) aşar. Bu yüzden günlük sınır Y5'te gerçek istek sayısına göre ayarlanır. Nef kişi başına ayda ≈ 35 istek atar; model
fiyatı belli olunca hesaplanır (VARSAYIM). Günün cümlesi, olay satırı, kanıt kartları ve ay hesabı hiçbir hizmete çağrı
yapmaz. Bu plan yeni ses üretmez; ElevenLabs maliyeti yoktur.

**Gizlilik değişiklikleri**
- Yeni izin yalnız "Uygulamayı Kullanırken" konum iznidir ve varsayılanı yaklaşık konumdur; kişi "Hava ve ay" kartında ya
  da Ana sayfadaki tek seferlik hava teklifinde "Konumumu kullan"a dokunmadıkça istenmez. Koordinat 2 ondalığa yuvarlanır ve yalnız hava bilgisi için Apple'ın hava
  servisine gider; sunucumuza ve Nef'e gitmez. Koordinat telefonda da saklanmaz: önbellekte yalnız hava sonucu ve en
  yakın il adı durur. Kişi izni Ayarlar'dan kapatırsa uygulama bunu ilk açılışta görür ve il adını, hava önbelleğini
  siler.
- Yeni ve ayrı bir hava rızası eklenir; kutusu işaretsiz gelir. Gizlilik sayfasındaki "konum sunucuya hiç gitmez"
  cümlesi genişletilir ve App Store gizlilik etiketine "Yaklaşık konum · uygulama işlevi · kimliğe bağlı değil" eklenir;
  üçü aynı sürümde çıkar.
- Nef'e giden paket küçülür: görme sayıları ve okuma hızı çıkar, sayı yerine durum sözcükleri gider; ruh hâlinden yalnız
  durum ve kayıt sayısı gider. Ekran sorusu kalktığı için eski ekran süresi cevabı da paketten çıkar. Rıza metinleri
  sürüm 2 olur ve daha önce rıza vermiş kişiye yeni metin bir kez gösterilip onayı yeniden alınır (karar 6). Yeni metne
  "Şimdi değil" diyen kişiye yalnız eski metnin izin verdiği alanlardan pakette kalanlar gider; ruh hâli ve yol alanları
  gitmez (§3.C.5). Sitedeki gizlilik tablosu ve App Store etiketi aynı sürümde güncellenir.
- Ruh hâli, etiketler, hava bağlamı ve günün ilk açılış kaydı yalnız telefonda durur; "Tüm verileri sil" hepsini siler.
- Kamera izin metnine Y3'te yalnız İlk Bakış'taki kırpma sayımı eklenir; (d)'deki kısa mesafe ölçümü metne (d) ile aynı
  sürümde girer (App Review 5.1.1).
- Konumun yurt dışına (Apple) gitmesi ve ruh hâli verisinin KVKK'daki sınıfı hukukçuya sorulur; hukukçu yoksa aşağıdaki
  yedek uygulanır.

**Senden istenen kararlar (önerimle).** Notlardaki 45 açık sorunun 35'ini kendim karara bağladım; kalan 10'u aşağıdaki
altı karara toplandı. Hepsinin gerekçesi §2.2'dedir.
1. **Planın onayı ve sıra.** Öneri: bu plan ve S0 → Y1 → Y6 sırası onaylansın; kod yine yoga yayınından sonra yazılır.
   Bu sıra onaylı sıradan ayrılır: Nef'in haftalık ve aylık değerlendirmesi ((f), Y6), sessiz ölçümün (d) ve uyku ile
   yürüyüşün (e) önüne geçer. Bu yüzden (d) sessiz ölçüm ile (e)'deki uyku kalitesi, yürüyüş, tepki ve Gökyüzü molası
   2027'nin ilk çeyreğinden sonraya kalır. Gerekçem şu: bağlayıcı iş sırasının 2. maddesi bu planın kapsamını
   merdivenler, Gelişim bağlantısı, Nef'in gidişat yorumları, "günün nasıl geçti", hava ve 5 saniye kuralı olarak
   sayıyor; Nef'in dönem değerlendirmeleri de Y1 ile Y2'nin sayılarına dayanıyor. Öbür seçenek, (e)'yi Y4'ten sonra
   almaktır: uyku ve yürüyüş ≈ 3–4 hafta öne gelir, hava ve Nef dönemleri o kadar geriye kayar (süreler VARSAYIM; (e)'nin
   kendi planı yok). Aynı karar iki küçük sapmayı da kapsar: "hafif gün ≈ 7 dk" ilk sürümde yoktur, "14. günde tam set"
   57. güne kayar (§2.1 satır 20 ve 23).
2. **Gelişim'in yeni ölçü kuralı.** Aynı günün turları tek değer sayılır. Başlangıç ilk günlerin ortancasıyla bir kez
   kurulur. Son üç ölçüm gününün ortancası art arda iki haftalık bakışta başlangıcından belirgin ayrılırsa "değişim"
   sayılır. Görev ve oyun sonuçlarında "iyileşiyor" yerine "başlangıcından iyi" ya da "başlangıcının gerisinde" denir;
   okuma testi Göz alanına girer. Aynı sonuç Gelişim'de, raporlarda, dışa aktarmada ve Nef'te görünür. Gerekçe (aynı 26
   haftalık yapay veriyle, benzetim): gerçek bir değişim yokken en az bir kez "geriliyor" görenlerin oranı %27'den %13'e,
   alışmayı "iyileşme" sananların oranı %71'den %36'ya iner. 1 yıllık geçmişin sonunda başlayan yeni bir düşüş iki kat sık
   yakalanır (%14'e karşı %31). **Bedeli de var:** kaydın 13. haftasından sonra başlayan 1 SD'lik bir düşüşü 26. haftaya
   kadar bugünkü kural hemen her kişide (%99,8) yakalıyor, yeni kural yaklaşık iki kişiden birinde (%52; bunun ≈ 9,5 puanı
   değişim yokken de görülen işarettir). Bugünkü kural bütün geçmişin ilk yarısını son yarısıyla karşılaştırdığı için
   geçmişin ortasındaki bir düşüşü iyi yakalar; ama aylar geçtikçe son haftalardaki bir düşüşü seyreltir. Uzun kullanan
   kişi için asıl soru "son haftalarda bir şey değişti mi?" olduğu için yeni kuralı öneriyorum. Dürüst not: yanlış
   işaretteki düşüşün çoğu haftada bir bakmaktan gelir; bugünkü kurala yalnız haftalık bakış ve iki hafta koşulu eklemek
   de oranı %12'ye indirir, ama alışma ve uzun geçmiş sorunlarını çözmez (§3.B.3). Sonuç: bugün "iyileşiyor" gören bazı
   kişiler "doğrulanmış bir değişim yok" görür; sürüm notunda tek cümleyle yazılır. Öneri: evet.
3. **"Günün nasıl geçti" ölçeği.** Öneri: çizilmiş beş yüz ve altlarında "Çok kötü · Kötü · İdare eder · İyi · Çok iyi".
   Öbür seçenekler 1–5 arası sayılar ya da telefonun kendi emojileridir. Emojiler bağlama göre farklı okunabiliyor;
   örneğin WeChat kullanan Çinli gençler uygulamanın gülen yüz emojisini alaycı ve olumsuz okudu (Cui 2024). Telefonun
   kendi emojileri için doğrudan bir çalışma notlarda yok.
4. **Hava için konum.** Öneri: kişi isterse yaklaşık konum, istemezse şehir seçimi. Öbür seçenek yalnız şehirdir; izin
   hiç sorulmaz ama hava il merkezine göre gelir.
5. **İlk 5 saniye (uygulama ve site).** (a) Uygulamayı ilk kez açan kişi için giriş ekranının alt yazısı "Fark etmeyi
   yeniden öğren." yerine İlk Bakış'ın vaadini söylesin: "20 saniyede sana fark etmediğin bir şeyi göstereceğiz." (senin
   onayladığın giriş ekranının yalnız bu satırı değişir). (b) Sitenin ilk ekranı "Bu cümleyi okurken kaç kez göz
   kırptın?" sorusuyla açılsın; sitede kamera ve ölçüm yoktur (§3.F.2). (c) Açılış ekranındaki logo kalksın (Apple'ın
   önerisi; senin onayladığın açılış ekranı değişir). (d) Ana sayfada sıfırlar ve kırık seri görünmesin: seri 3 gün ve
   üstündeyse görünür; 3 günden kısaysa yerine "N gün seninle" yazar. Öneri: dördü de evet.
6. **Nef'e giden paket ve rıza.** Nef'e sayı yerine durum sözcükleri gitsin; görme sayıları, okuma hızı ve eski ekran
   süresi cevabı çıksın; yol basamakları ve ruh hâlinin durumu eklensin. Daha önce rıza vermiş kişiye yeni rıza metni bir
   kez gösterilsin ve onayı yeniden alınsın. Yeni metne "Şimdi değil" diyen kişiye yalnız eski metnin izin verdiği
   alanlardan pakette kalanlar gitsin. Öneri: evet.

**Bilgi (karar değil):** giriş ekranı ile İlk Bakış tanıtımı şimdilik tek ekrana inmez; önce ilk
dokunuştan sonuca geçen süre (G1) cihazda ölçülür. Yenilikler ve rıza pencereleri günün ilk dokunuşundan sonra açılır;
bu, onaylı tasarımı değiştirmeyen bir sıralama seçimidir (§3.F.3). Telefonda üretilen kural cümleleri rızasız da
görünür; bugün de Ana sayfadaki "Nef · …" satırı rızasız görünüyor (`screens/Home.jsx:256`) ve veri telefondan çıkmıyor.

**Senden istenen iki iş (karar değil).**
- **Hukukçunun adı.** Üç soru ona gider: konumun yurt dışına (Apple) aktarımı (KVKK m. 9), ruh hâli verisinin sınıfı ve
  Nef rızası v2'nin kapsamı. Uygulamanın bugünkü rıza metinleri de hukukçudan geçmedi (`lib/consent.js:6`). Y4'ün cihaz
  kapısına (S5) kadar ad gelmezse yedek uygulanır: Y5 konum izni olmadan, yalnız şehir seçimiyle yayına girer (Apple'a
  kişinin konumu değil, seçtiği ilin merkezi gider); Y6'da ruh hâli alanları (`n7`, `moodStatus`) pakete girmez, paketin
  öteki küçültmeleri yine yayına girer. Hukukçu cevap verince bu iki parça ayrı bir sürümle açılır. Yedek, hukukçu
  onayının yerini tutmaz; yalnız belirsiz olan parçayı bekletir.
- **App Review sorusu.** WeatherKit atfının Ana sayfa başlığında ve bildirimde nasıl gösterileceği sorusunu App Store
  Connect'ten sen gönderirsin; metnini S0'da ben hazırlarım. Cevap gelmezse yedek şudur: başlıkta yalnız ay kalır, hava
  yalnız tam atıflı "Hava ve ay" kartında görünür, yağmur bildiriminde "Kaynak: Apple Weather" satırı bulunur.

---

## 2. Notlar arasındaki çelişkiler, seçimler ve onaylı yoga planıyla uyum

### 2.1 Çelişkiler ve seçimler

| # | Konu | Notlar ne diyor | Seçim | Gerekçe |
|---|---|---|---|---|
| 1 | Nefes merdiveni | `merdiven.md`: 1 → 2 → 3. `YOL.ilerleme` §5.1: 1-1-2-2-3-3-4-4-5. Sahibin önceki sözü: 1, 1, 2 | **1 → 2 → 3, yolda en çok 3** | Sahibin son sözü "ilk önce 1 dakika, sonraki gün 2, 3 gibi"; onaylı yoga kararı 5.1 yolda en çok 3 dk diyor. Benzetimde iki dizinin yol farkı 0,1 dk. You 2021'de ilk 5 dakikalık yavaş nefeste algılanan stres arttı; yazarlar alışma gerektiğini söylüyor. Kısa başlangıç bu bulgudan çıkarılan bir tasarım seçimidir (VARSAYIM) |
| 2 | Olay satırının yeri | `gelisim-nef.md` §7.1: Ana sayfadaki çevrimiçi Nef kartı. `bes-saniye.md` §3.2: üstteki Nef satırı | **Üstteki Nef satırı**; kart aynı gün olayı yinelemez | Çevrimiçi kart ilk görünen alanın altında ve ağı bekliyor (`coach.js:13` zaman aşımı 10 sn); olay satırı kural şablonudur, ağ istemez |
| 3 | "Günün nasıl geçti"nin değişim kuralı | `gunun.md` §8: bugünkü `metricTrend` (ilk yarı / son yarı). `gelisim-nef.md` §4: yeni kural | **Yeni kural** (kendi beyanı türü) | Merkezde tek kural; ilk yarı / son yarı kuralı bütün geçmişe bakıyor ve gürültüye duyarlı (§3.B) |
| 4 | Nef'e ruh hâli | `gunun.md` §8: `mood7`, `mood28` ortalamaları. `gelisim-nef.md` §6: sayı değil durum sözcüğü | **`n7` (kaç akşam kayıt) ve `moodStatus`** | Nef iki sayıdan yön çıkaramaz; durumu merkez hesaplar. Veri de asgarileşir |
| 5 | Ay kartının bilim metni | `gunun.md` `dolunay` kartı Cordi 2014'e "daha büyük veriler bulamadı" içeriğini yüklüyor. `hava-ay.md` §6.1: Cordi'nin özeti PubMed'de yok, içeriği doğrulanamadı | **`hava-ay.md` metni**, tek metin iki yerde | Büyük çalışmalar için doğrulanmış kayıtlar var (Haba-Rubio 2015, Smith 2017); Cordi 2014 kaynak satırına girmez |
| 6 | Koordinat yuvarlama | `gunun.md`: ≈ 0,1° (VARSAYIM). `hava-ay.md`: 2 ondalık | **2 ondalık** | Yaklaşık konum zaten 1–20 km sapıyor; Apple'ın tanımında 3'ten az ondalık "Coarse Location" |
| 7 | WeatherKit arayüzü | `gunun.md`: Swift ya da REST. `hava-ay.md`: Swift | **Swift** | REST her istekte imzalı belirteç ister, anahtar sunucuda durmalı; Apple'ın REST sayfası yerel uygulamaya Swift'i öneriyor |
| 8 | Ay evresi | `gunun.md`: WeatherKit ya da yerel (±1 gün). `hava-ay.md`: yerel Meeus, USNO ile sınandı | **Yerel Meeus** | 50 evrede en büyük sapma 1,9 dk, Türkiye gününde kayma 0; "29,53 güne bölme" üç evreden birinde günü kaydırıyor. Konum ve ağ gerekmez |
| 9 | Hava bağlam deposu | `gunun.md`: `gozolcum:day-context` (şehir dâhil). `hava-ay.md`: `skyLog` (şehir ve koordinat yok, 90 gün) | **Tek depo `gozolcum:sky-log`, şehir ve koordinat yok, 90 gün** (VARSAYIM süre); `gunun` modülünün `storageKeys`'inde | Veri asgariliği; "Tüm verileri sil" kapsar |
| 10 | Yağmurlu günlerin betimleyici karşılaştırması | `gunun.md`: 10 yağmurlu + 10 kuru gün. `hava-ay.md`: 8 + 8 | **10 + 10** (VARSAYIM) | Temkinli olan seçildi; yalnız betimleme, neden-sonuç yok |
| 11 | Akşam kartının saati | `hava-ay.md` §1: "19.00'dan sonra". `gunun.md`: 18.00 | **18.00** | Kod: `lib/profileQuestions.js:174` `EVENING_HOUR = 18`; 19.00 alarmın akşam kartıdır (`lib/alarm.js:9`). `hava-ay.md` bu satırda yanılıyor |
| 12 | Ana sayfa başlığında hava | `bes-saniye.md`: "◐ ilk dördün · 18° · 16.00'dan sonra yağmur". `hava-ay.md` A6: Apple'ın atıf kuralı hava gösteren her yere uygulanıyor | **App Review'un yazılı cevabına kadar başlıkta yalnız ay**; hava tam atıfla "Hava ve ay" kartında. Cevap olumluysa başlığa sıcaklık ve yağmur eklenir | Atıf zorunluluğu Apple'ın kuralıdır; ihlali yayını durdurur |
| 13 | Yağmur bildiriminin kesinti düzeyi | `hava-ay.md`: `active`. `bes-saniye.md` §11: `passive` notu | **`active`** | Kişi bildirimi açıkça istedi; `passive` ekranı yakmaz, sabah bilgisi kaçabilir |
| 14 | "Sonra" düğmesi | `gunun.md`: 2 saat sonra. Bugünkü kod: ertesi akşam (`profileQuestions.test.js:48-51`) | **2 saat sonra** (VARSAYIM) | Kart artık günlük bir kayıttır; ertesi akşama ertelemek o günün kaydını kaybettirir |
| 15 | Nef'e okuma testi | `gelisim-nef.md`: yalnız `readingStatus`, hız gitmez. Bugün `readingWpm` gidiyor (`coach.js:54`) | **`readingStatus`**; hız çıkar | İstemde okuma hızının anlamı tanımlı değil (`coachCore.js:67-83`) |
| 16 | Uyku ve yürüyüşte Nef | `YOL.moduller.md` §5: `sleep`, `walk.steps7` Nef'e. `gelisim-nef.md` §6 ve `consent.js:20`: Sağlık verisi gitmez | **Sağlık kaynaklı alan gitmez**; yalnız kişinin düğmeyle yazdığı alanlar | Rıza metnindeki söz korunur |
| 17 | Haftalık Nef'in gün sayısı | `YOL.nef.md` §5.2: `domains[d].days7`. `gelisim-nef.md` §3.4: o alan kayıt sayıyor | **Gün şeridinden** (`growthMap().domains[d].strip`) | `lib/dataHub.js:81` pencere içindeki kaydı sayıyor, günü değil |
| 18 | Gökyüzü molası yolda | `YOL.ilerleme` §5.5: 4. günden, Uzağa bakışla gün aşırı. `YOL.moduller` §4.8: haftada 2, gündüz, yürüyüşle aynı döndürme | **`YOL.moduller` kuralı, (e) aşamasında** | `merdiven.md` §5.10'un önerisi; iki "dışarı" durağı tek döndürme grubunda |
| 19 | 14. gün iyi oluş | `YAPILACAKLAR.md` "Tasarımın özü": 14. gün kilometre taşı. Kod: WHO-5 hiç yapılmadıysa ilk günden "zamanı geldi" ve Ana sayfada hiç çıkmıyor (`lib/progress.js:19, 41`) | **14. günde Ana sayfada bir kez kart**, yolda değil | Onaylı tasarım sözüne kod uydurulur; 14 günde bir kuralı aynen kalır |
| 20 | Hafif gün | `YAPILACAKLAR.md` "Tasarımın özü": ≈ 7 dk. `merdiven.md` §11.5: yalnız kişinin isteğiyle | **İlk sürümde yok** | Onaylı dört karardan biri değil, kanıtı yok; "sonra yaparım" ve bırakma göstergesi (G6) ihtiyacı gösterirse ayrı iş |
| 21 | Nef'e giden modül sınırı | `YOL.moduller.md` §2.6: boş modül `null`. Onaylı yoga planı §D.5: yoga dışarıda kalabilir | **Sınır 16'ya çıkar; son 7 günde kaydı olmayan modül `null` döner; paket 4.000 bayt sınırında kalır** | Bugün 8 modülün `coach()`'u var; yoga, `gunun` ve `stage` için göz egzersizleri eklenince 11 olur. Süzgeç modülleri kayıt defteri sırasıyla (alfabetik) ilk 10'da kestiği için (`lib/coachCore.js:44`, `lib/coach.js:67-78`, `modules/registry.js:159`) yolu her gün yapan kişide ilk düşen `yoga` olurdu. 16 modül × 6 alan 4.000 baytın altında kalır; en dolu paket testte ölçülür (§3.G.6) |
| 22 | Nefesin 90+ gün odak haftası | `merdiven.md` §5.1: molanın tamamı, 5 dk. Onaylı yoga planı karar 5.1: (c) ile yolda en çok 3 dk | **Yolda 3 dk kalır**; odak haftasında "2 dk daha" öne çıkar | Onaylı plan değiştirilemez; kişi yine 5 dakikaya tek dokunuşla tamamlar |
| 23 | "Daire → 14. günde tam set" | `YAPILACAKLAR.md:69`: 14. günde tam set. `YOL.ilerleme` §5 V4 ve `merdiven.md` §5: haftada bir tam set günü, 56+ | **V4, Dvar 56+ (yeni kullanıcıda 57. gün)** | Göz egzersizlerinin beş grubu (bugünkü tam yapı) 9. günden beri yoldadır; `SETS.normal`'ı ayrıca 14. günde eklemek yolu 2 dk uzatır ve 15 dk hedefini aşar (VARSAYIM süre). Sapma karar 1'de sahibe gösterilir |
| 24 | Konumun telefonda saklanması | `hava-ay.md` §4.3: yuvarlanmış koordinat ve şehir adı telefonda tutulur. İzin metni önerisi: "Konumun kaydedilmez" | **Koordinat saklanmaz; yalnız hava sonucu ve en yakın il adı** | Metin ile davranış aynı olur; konum en çok saatte bir yeniden alındığı için koordinatı saklamaya gerek yoktur |

### 2.2 Notların açık kararları: nasıl kapandı

Beş notta 45 açık soru var. Bunların 10'u §1'deki altı karara toplandı; kalan 35'ini ben karara bağladım.

| Not ve soru | Karar | Gerekçe |
|---|---|---|
| `merdiven` 1 (nefes dizisi) | 1 → 2 → 3 | §2.1 satır 1 |
| `merdiven` 2 (Yılan ile dikkat durakları) | Bugünkü kural kalır | Dikkat durakları ölçü üretiyor; Yılan Ana sayfadan hep açık. Sonucu dürüstçe: yeni kullanıcı Yılan'ı yolda 90 günün 24'ünde görür (§3.J) |
| `merdiven` 3 (Bugünün görevi eski kullanıcıda) | İlerleme açıkken herkesin yolunda, 2. günden; ilerleme yokken bugünkü kural (`modules/notice/manifest.js:31`) aynen | Farkındalık sahibin istediği modül; ek yük 1 dk; eşdeğerlik kapısı 0 farkı korur (§3.G.6) |
| `merdiven` 4 (Ara kilidi) | Yalnız ilerleme açıkken ve 1. bölümdeki göz dakikası payının altındayken yeni kural; öteki her durumda bugünkü kural (§3.A.8) | Nefes 1 dk olunca yeni kullanıcı 1. ve 2. gün 4 dk boş beklerdi. İlerleme yokken `Home.jsx:165-170` aynen çalışır; karar saf bir işleve taşınıp eşdeğerlik düzeneğinde sınanır. Cihazda doğrulanır |
| `merdiven` 5 (hafif gün) | İlk sürümde yok | §2.1 satır 20 |
| `merdiven` 6 (nefes çeşitlemesi) | Yeni kullanıcıda "Günün ritmi" 8. gün, kısa tutma 22. gün, bekleme 43. gün açılır; 4·2·4·4 yalnız 43. günden başlayarak, haftada en çok bir gün, koşullarla gelir. Eşikler `Dvar`'a bağlıdır (§3.A.4) | Güvenlik zarfı (§3.A.5). Marchant 2025'te dakikada 6 nefes, kalp ritmi değişkenliğini kutu ve 4-7-8'den daha çok artırdı (küçük–orta etki); ruh hâlinde hiçbir kalıp fark yaratmadı |
| `merdiven` 7 (kapanış nefesi) | İlk sürümde yok | Mevcut Göz kırpma grubunun içeriği değişmesin; grubun süresi cihazda ölçülmedi |
| `merdiven` 8 (eski kullanıcıda çeşitleme hızı) | `Dvar = min(D, Dstage + 14)` göz çeşitlemelerine ve nefes katmanlarına birlikte uygulanır. Göz: ilk çeşitleme 7, sonrakiler 14, 28 ve 42 çalışma gününden sonra. Nefes: "Günün ritmi" güncelleme günü, kısa tutma 7, bekleme 28 çalışma gününden sonra | Aylardır egzersiz yapan kişi güncellemenin ertesi günü 15 tekrarla, tutmalı ya da beklemeli bir kalıpla karşılaşmaz |
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
| `gunun` 8 (Apple Sağlık'a ruh hâli yazmak) | Hayır | İzin metni "hiçbir veri yazmaz" diyor (`Info.plist:9-10`) |
| `gunun` 9 (Nef ruh hâlini görsün mü) | **Sahibe: karar 6** | Rıza metni değişir |
| `hava-ay` A1 (Open-Meteo) | Hayır | Abonelikli uygulama ticari sayılır (49 USD/ay), ikinci yurt dışı alıcı ve ikinci atıf |
| `hava-ay` A2 (Nef'e yağışlı gün sayısı) | İlk sürümde hayır | Rıza metnini genişletir; kazancı küçük |
| `hava-ay` A3 (dünya şehirleri) | İlk sürümde hayır; yurt dışında konum izni yine çalışır | 81 il listesi yeterli başlangıç |
| `hava-ay` A4 (ay doğuş/batış) | İlk sürümde hayır | Konuma bağlı; 5 sn şeridine sığmaz |
| `hava-ay` A5 (yağmur–ruh hâli satırı) | Evet, 28 günden sonra, 10 + 10 günde, yalnız betimleme | §2.1 satır 10 |
| `hava-ay` A6 (atıf) | App Review'a sorulur; cevaba kadar başlıkta yalnız ay, bildirimde "Kaynak: Apple Weather" | §2.1 satır 12 |
| `hava-ay` A7 (arka planda sabah tazeleme) | İlk sürümde hayır | Apple zamanı garanti etmiyor (`earliestBeginDate`); tasarım buna dayanamaz |
| `hava-ay` A8 (bildirim saati) | Alarm o gün çalacaksa alarm + 15 dk, değilse 07.30; 06.30–09.00 sınırı | Alarm ekranıyla üst üste gelmez (VARSAYIM saatler) |
| `hava-ay` A9 (yağmur eşiği) | 07.00–22.00'de herhangi bir saatte olasılık ≥ %50 ve toplam ≥ 0,5 mm | Çiseleme gürültü olmasın (VARSAYIM; sahada ayarlanır) |
| `bes-saniye` K1 (seri) | **Sahibe: karar 5** (d) | Onaylı Ana sayfa değişir |
| `bes-saniye` K4 (Yenilikler ve rıza pencereleri) | Günün ilk dokunuşundan ya da ilk duraktan sonra açılır; ilk rapor ve kırmızı görme uyarısı istisnadır | Onaylı tasarımı değiştirmeyen bir sıralama seçimi; ilk 5 saniyeyi kişinin kendi cümlesine bırakır (§3.F.3) |
| `bes-saniye` K2 (günün cümlesinin süresi) | İlk dokunuşa kadar ya da en çok 1 saat | Günün geri kalanı bugünkü davranıştır |
| `bes-saniye` K3 (WHO-5 14. gün) | 14. günde Ana sayfada bir kez kart | §2.1 satır 19 |
| `bes-saniye` K5 (alarm sabahında şerit) | Evet, Y5 ile | Bildirimi kapalı olan da yağmuru görür |
| `bes-saniye` K6 (365. gün) | Bu planın dışında; 90. günden sonra ayrı iş | Kod yok, kanıt yok |
| `bes-saniye` K7 (`day-open` dışa aktarmada) | Hayır | Etkinlik değil, tanılama kaydı |
| `bes-saniye` K8 (giriş ekranı metni ve iki "Başla") | **Sahibe: karar 5** (a) ve site konsepti (b); iki "Başla" şimdilik birleşmez | Sahibin "ilk önce 5 saniye" isteğinin çekirdeği ilk kez açan kişidir; onaylı giriş ekranı değişir. İki "Başla"nın birleşmesi kamera iznini ilk dokunuşa çeker; önce G1 cihazda ölçülür |
| `bes-saniye` K9 (kamera izin metni) | Y3'te yalnız İlk Bakış'taki kırpma sayımı eklenir; kısa mesafe ölçümü (d) ile aynı sürümde; metin tasarım kapısında sana gösterilir | App Review 5.1.1 amaç metninin doğru ve eksiksiz olmasını ister; var olmayan kullanım metne girmez |
| `bes-saniye` K10 (sabah çağrısı) | Hayır | Singh 2024'teki bulgu zayıf; saat kişinin |

### 2.3 Onaylı yoga planıyla uyum

Bu plan `PLAN.v3.md`'nin hiçbir kararını değiştirmez:
- **Yoga durağı** ilk yayındaki gibi kalır: 3. günden, 2. bölümde göz duraklarından sonra ve Bugünün görevi'nden önce
  (`order: 105`); kısa gün 3, altı kısa günden sonra 5 dakikalık tam ders; E testi günü yolda yok; `yields: true` ve R7b
  kuralı gereği hiçbir durağı düşürmez (§B.2, §B.5). (c)'nin merdivenleriyle koşulan benzetimde de yoga yüzünden düşen
  durak sıfırdır (30 günde 24, 90 günde 76 yoga günü). PLAN.v3 §B.3'teki (c) sayıları (30 günde 22, 90 günde 70; iki okuma
  gününde yoga yok) `YOL.ilerleme`'nin eski merdivenleriyle koşuldu; bu planın merdivenleriyle okuma günlerinde yol yogayla
  birlikte 18 dk'dır, yani 20 dk sınırına sığar; sayılar bu yüzden 24 ve 76'dır. Kural değişmez, yalnız yolun geri kalanı kısalmıştır.
- **Psikolog yedeği:** Sahip inceleyici adı vermedi (`yoga-pilot/SAHIP_ISTEKLERI.md` madde 7 (2) ve (5)). Bu yüzden
  psikolog adı verilene kadar karar 5.3'ün yedek kuralı geçerlidir (`PLAN.v3.md:154-156`): Zor Anlar İçin yolda aday
  olmaz ve kütüphanede kalır; Kendine Şefkat yolda yalnız 17.00'den sonra aday olur; tam ders günü daha erken açılırsa
  Derin Dinlenme gelir. Benzetim bu kuralla koşuldu (`sim_merdiven.mjs`, `PSIKOLOG=onay` kuralı kaldırır): yoga günü
  sayısı ve yol süreleri değişmez; 10.00'da açan kişide on tam dersin hepsi Derin Dinlenme'dir ve Kendine Şefkat yolda
  hiç gelmez; 19.00'da açan kişide tam dersler sırayla Derin Dinlenme ve Kendine Şefkat'tir (beşer). Psikolog
  onaylarsa iki ders, onaylı yoga planındaki sırayla yola girer.
- **`today.js`'e yoganın beş eki** (`collect` alanları, R7b, R5, `next`, `allDone`) Y1'in temelidir. Y1 `lib/today.js`'e
  bunların dışında bir kural eklemez; `ctx.progression` `buildPath`'e bugünkü gibi `ctx` içinde yayılır (`lib/today.js`
  `:243`). Bu, Y1'in eşdeğerlik kapısında sınanır (§3.G.6).
- **Nefes:** ilk yayında yolda 5 dakikadır; Y1 geldiğinde yolda en çok 3 dakika olur, mola 5 dakika kalır, 5 dakikalık
  nefes Ana sayfada durur (karar 5.1, §B.2 kural 10).
- **Meditasyon** yolda ayrı durak olmaz; sahibin "aralarda nefes, meditasyon" sözünü yolun arasındaki nefes ve yoganın
  kısa dersleri karşılar (karar 5.1).
- **"Sonra yaparım"** yoganın getirdiği `gozolcum:path-later` anahtarıyla aynı biçimde kalır; Y1 onu `progressionCtx`'e
  taşır (§B.5). Düğme ilk sürümde yogada, (e) ile yürüyüşte görünür; 1 dakikalık göz duraklarında düğme yoktur.
- **Sayaçlar:** Y1 `lib/yoga.js`'e dokunmaz. Ortak `doneDays` ve `gapDays` yardımcıları yalnız yeni kodda kullanılır;
  yoganın bunlara taşınması ayrı ve isteğe bağlı bir iştir, yoga yayınından ve kendi eşdeğerlik sınamasından sonra
  yapılır. Yoganın bütün testleri değişmeden geçmelidir.
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
- `hava-ay.md` §1: akşam kartı 18.00'dir; `coachCore.js:66-69` göndermesi `:70`'tir. §4.3: izin metni ve saklama
  kuralı bu planın §3.E.2'sine göre düzeltilir (koordinat saklanmaz). §10: 10.000 kişilik satır "49,99 $ ya da
  249,99 $" olur. §6.1 ay kartı metni §3.E.5'e göre düzeltilir; Benedict 2021 "büyüyen ay dönemi" diye nitelenir.
- `gunun.md:24` ve `:170`: Thompson 2025'te %95'lik sıra uyumu 20 hastalık pilottan, r = 0,70 ise 294 hastalık
  bölümden gelir. Wrzus 2022 soru sayısını değil ölçüm sayısını inceler; Cui 2024 yalnız Çinli gençleri inceler.
- `merdiven.md:217`: sayım tanımı "alış ve veriş 0,5 sn, tutma ve bekleme 1 sn adımla" olur; sayımı yapan betik
  `sayim_nefes.mjs`'tir.
- `gelisim-nef.md` §4.2: ölçü kuralı karşılaştırması aynı süreyle yeniden yazılır (`sim_kural_esit.mjs`, §3.B.3).
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
Dvar(m)   = min(D(m), Dstage(m) + 14)     // eski kullanıcıda çeşitlemeler 7, 14, 28 ve 42 çalışma gününden sonra açılır
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

| Basamak | Eşik | Yolda | Kalıp | Tutma |
|---|---|---|---|---|
| N1 | D = 0 (1. gün) | 1 dk | Sakin ritim, ilk 3 seansta kademeli 3,5·4,5 (`lib/breath.js:13`) | yok |
| N2 | D = 1 | 2 dk | Sakin ritim | yok |
| N3 | D ≥ 2 | 3 dk | Sakin ritim 4·6 | yok |
| Ç-B | Dvar 7–20 | 3 dk | "Günün ritmi": Sakin, Eşit, Uzun veriş, Karın | yok |
| Ç-C | Dvar 21–41 | 3 dk | + Vızıltı, Burun değiştir; alıştan sonra kısa tutma (ör. 4·2·6) | ≤ 2 sn, haftada ≤ 2 gün |
| Ç-D | Dvar 42+ | 3 dk | + yumuşak kutu (ör. 4·2·4·2; senin 4·2·4·4'ün dakikada 4,3 nefes) | bekleme ≤ 4 sn, haftada ≤ 1 gün |
| 90+ | | 3 dk | Nefes odak haftasında kart "2 dk daha"yı öne çıkarır; yol payı 3 kalır | |

- Süre basamakları (N1–N3) D'ye, kalıp katmanları (Ç-B, Ç-C, Ç-D) göz çeşitlemeleri gibi `Dvar(breath)`'e bağlıdır.
  Yeni kullanıcıda `Dvar = D` olduğu için katmanlar 8., 22. ve 43. günde açılır. Eski kullanıcıda güncelleme günü
  `Dvar = 14` olur: "Günün ritmi" (tutmasız) hemen, kısa tutma 7, bekleme nefesi 28 çalışma gününden sonra gelir.
- Ana sayfadaki Nefes (1, 3, 5 dk, bütün kalıplar, "Özel") ve 28 günlük program değişmez. Program günü ≥ 300 sn ister
  (`lib/breath.js:277-294`); bu yüzden yoldaki 3 dakika bitince "2 dk daha" düğmesi çıkar, aynı kalıpla sürer ve o günü
  5 dakikaya tamamlar. Mola zaten 5 dakika olduğu için kişiye ek süre yükü yoktur.
- Kişi Nefes ekranında kalıp ya da süre seçtiyse yol onun seçimini kullanır; merdiven yalnız varsayılanı belirler.
- **Çeşitleme üreteci** (`lib/breathMix.js`, saf): aileler koddaki kalıplardır; alış 3–6 sn, veriş alıştan kısa değil ve
  ≤ 8 sn, ikisi de 0,5 sn adımla; tutma 0–2 sn ve bekleme 0–4 sn, ikisi de 1 sn adımla. Süre bileşimi sayısı birikimlidir
  (`sayim_nefes.mjs`): B katmanında (5–7,5 nefes/dk) 40 tutmasız bileşim; C'de kısa tutma eklenince toplam 99 (59'u
  tutmalı); D'de (4–7,5 nefes/dk) bekleme eklenince toplam 629 (472'si beklemeli). Günlük seçim `hash(gün + modül)`
  ile belirlenir; aynı gün her açılışta aynı kalıp gelir. Aynı bileşim iki gün art arda gelmez; aynı aile haftada en çok
  3 gündür; tutmalı günler art arda gelmez (VARSAYIM kuralları; dayanak Eather 2023'ün çeşitlilik bulgusu).
- Kart kalıbı adıyla söyler ("Bugünün ritmi: 4 · 1 · 6"); kanıt cümlesi ailenin mevcut `evidence` metnidir, yeni iddia
  yazılmaz. **Çeşitlilik etkiyi artırmak için değil, ilgiyi ve sürekliliği korumak içindir:** kanıt kalıplar arasında
  büyük fark göstermiyor (Birdee 2023); Marchant 2025'te de ruh hâlinde ve tansiyonda hiçbir kalıp fark yaratmadı.

#### A.5 Nefes güvenlik sınırları

| Kural | Değer | Dayanak |
|---|---|---|
| Hızlı soluma, döngüsel hiperventilasyon | Hiç yok | Elia 2024 (aç karnına 9 kişi, en uzun tutma denemeleri): tutmadan önceki hiperventilasyon tutmayı uzattı, oksijeni daha çok düşürdü ve bayılma yatkınlığını artırabilir |
| Nefes hızı zarfı | Dakikada 4–7,5 nefes; veriş ≥ alış | Laborde 2022; Marchant 2025 (kalp ritmi değişkenliğinde 6/dk); alt sınır 4 VARSAYIM |
| Tutma | Yeni kullanıcıda 22. günden önce yok; alıştan sonra ≤ 2 sn; 43. günden başlayarak veriş sonu bekleme ≤ 4 sn (eski kullanıcıda `Dvar` eşikleri, §A.4) | VARSAYIM; kısa tutmada zarar kanıtı bulunamadı, en uzun tutmalar sempatik yükü artırıyor (Badrov 2016) |
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
metinler etki söylemez. Ekran kaynaklı göz yorgunluğu için incelenen tedavilerin (gözlük, besin takviyesi) hiçbirinde
yüksek kesinlikte kanıt yok; göz hareketi egzersizleri bu derlemede yer almıyor (Singh 2022). Kırpma ve uzağa bakıştaki kazanımlar bırakınca 1–2 haftada kayboldu (Wolffsohn 2025, Talens-Estarelles 2022). Bu, yolun
bitmemesinin gerekçesidir; kullanıcıya iddia olarak söylenmez.

#### A.7 Öteki duraklar

Çemberler 1. günden her gün 1 dakikadır. Yılan 2. günden açılır, `dropRank: 1` ile ilk düşen duraktır. Bugünün görevi,
ilerleme açıkken 2. günden herkesin yolundadır; ilerleme yokken bugünkü kural (bir kez yapılmışsa yola girer,
`modules/notice/manifest.js:31`) aynen çalışır. Fark Ettin mi? 6. günden, Tek Bakışta 8. günden bugünkü `week3` kuralıyla
(her biri haftada 3 gün) gelir. Haftalık E testi ve okuma testinin haftalık kuralı, Hızlı Bakış'ın bugünkü kuralı ve kısa
E testinin yolda olmaması aynen kalır. Yoga §2.3'teki
gibidir. Göz kırpma modülü (`blink`), Dalga, Yön, Mola, Su, Alarm ve Farkındalık yolda değildir.

#### A.8 Günlük seçim, bütçe ve ara

1. Basamak: `from ≤ D` olan son basamak; G ≥ 14 ise o gün bir basamak aşağı ("yumuşak"), ertesi gün kaldığı yerden.
2. Açılma: `pathDay` eşiğin altındaysa durak yoktur.
3. Döndürme: mevcut `rotate` kuralı aynen (`lib/today.js:255-266`); yeni grup yalnız `donus`.
4. Kayıt: tamamlanan durak `stage` alanıyla yazılır; göz egzersizinde ayrıca `steps` ve `variant`, nefeste `mix`. Yarım
   kalan egzersiz bugünkü gibi kayıt yazmaz. Eski kayıtlar bu alanlar olmadan okunur.
5. Yol payı: nefes 3, göz grubu 1, yoga 3 (tam ders günü 5) dakika; hedef 15, üst sınır 20 dakika değişmez; düşme sırası
   ve yoganın R7b kuralı aynen.
6. **Ara kilidi:** bugün yoldaki nefes durağı açılırken kilit yoksa ve son moladan beri ≥ 1 dk göz çalışması varsa mola
   başlar (`Home.jsx:165-170`). Y1 bu kuralı yalnız bir durumda değiştirir: `ctx.progression` varken ve yolun 1.
   bölümündeki göz dakikası bölümün göz payının altındayken (yeni kullanıcının ilk günleri) yol molası ancak "kullanılan
   göz süresi + 2. bölümün göz dakikası > göz bütçesi" ise başlar; böylece yeni kullanıcı 1 dakikalık nefesten sonra boş
   beklemez. Öteki her durumda, `ctx.progression` yokken de, `Home.jsx:165-170` aynen çalışır. Karar saf bir işleve
   taşınır (`restDecision(st, plan, progression)`, `lib/progression.js`) ve eşdeğerlik düzeneğine eklenir: ilerleme
   kapalıyken bugünkü kararla 0 fark (§G.6). Kullanılan göz süresi saatlik pencereye bağlı olduğu için yolu gün içinde ara
   vererek yapan kişide molanın başlamayabileceği bilinir; bu, Y1 cihaz listesinde ayrıca denenir. Göz bütçesi kuralı
   (`lib/eyeBudget.js:17-29`) değişmez.
7. Atlanan gün cezasızdır; basamak geri gitmez, sayı sıfırlanmaz; "seri bozuldu" ekranı yoktur.

#### A.9 Gün gün 1–30 (yeni kullanıcı, her gün 10.00'da açar, her durağı yapar, 5 dk göz bütçesi)

Benzetim: `sim_merdiven.mjs` (yol kuralları gerçek koddan ve yoganın beş ekinden, `today_v4.js`; merdivenler bu
bölümdeki tablolardan; tur 1'den beri onaylı yoga planının psikolog yedeğiyle, §2.3). Yumuşak dönüş benzetimde yoktur.
**Cihazda denenmedi.**

| Gün | Yeni gelen | Yol dk | Yoga |
|---|---|---|---|
| 1 | Haftalık E testi, Çemberler, Nefes 1 dk, Göz kırpma | 8 | — |
| 2 | Sağ–sol, Nefes 2 dk, okuma testi, Yılan, Bugünün görevi | 11 | — |
| 3 | "Üçü birlikte" (Isınma), Nefes 3 dk, yoga | 12 | Nefesin Ritmi |
| 4 | Yukarı–aşağı | 13 | Tek Nokta |
| 5 | Uzağa bakış; ilk rapor | 14 | Sabah Niyeti |
| 6 | Fark Ettin mi? (Yılan o gün düşer) | 14 | Sağlam Yer |
| 7 | Yakın–uzak | 15 | Kendini Tanımak |
| 8 | Haftalık E testi, Tek Bakışta; nefeste "günün ritmi" | 17 | — |
| 9 | Daire (Yukarı–aşağı ile gün aşırı), okuma testi | 18 | Gelecekteki Sen |
| 10 | — | 17 | Derin Dinlenme, 5 dk |
| 11–14 | — | 15 | Nefesin Ritmi, Tek Nokta, Sabah Niyeti, Sağlam Yer |
| 15 | Haftalık E testi | 17 | — |
| 16 | Okuma testi | 18 | Kendini Tanımak |
| 17–21 | 18. gün tam ders | 15–17 | Gelecekteki Sen, Derin Dinlenme 5 dk, Nefesin Ritmi, Tek Nokta, Sabah Niyeti |
| 22 | Haftalık E testi; kırpma 10 tekrar; kısa tutmalı nefes günleri | 17 | — |
| 23 | Okuma testi | 18 | Sağlam Yer |
| 24–28 | 26. gün tam ders; 28. gün iris yan yana | 15–17 | Kendini Tanımak, Gelecekteki Sen, Derin Dinlenme 5 dk, Nefesin Ritmi, Tek Nokta |
| 29 | Haftalık E testi; bakışlar 8 sn, uzağa bakış 30 sn; aylık Nef | 17 | — |
| 30 | Okuma testi | 18 | Sabah Niyeti |

| Senaryo | Gün | En kısa | En uzun | Ortalama | > 20 dk | Yoga günü | Yoga yüzünden düşen |
|---|---|---|---|---|---|---|---|
| 5 dk göz bütçesi, 10.00 | 30 / 90 | 8 | 18 | 15,3 / 15,7 | 0 | 24 / 76 | 0 |
| 5 dk göz bütçesi, 19.00 | 90 | 8 | 18 | 15,7 | 0 | 76 | 0 |
| 3 dk göz bütçesi | 30 / 90 | 8 | 15 / 16 | 12,7 / 12,9 | 0 | 24 / 76 | 0 |
| (e) sonrası tahmin: + yürüyüş 2 dk (4. günden; `sim_merdiven.mjs`'in MODULES listesine `walk` eklenmiş kopyası `_rev2_walk.mjs`) | 30 / 90 | 8 | 20 | 17,1 / 17,6 | 0 | 24 / 76 | 0 |

19.00'da açan kişide Sabah Niyeti gelmez, sıra bir kayar; tam ders günleri (10, 18, 26…) sırayla Derin Dinlenme ve
Kendine Şefkat'tir. 10.00'da açan kişide Kendine Şefkat yolda hiç gelmez; 90 günün on tam dersinin hepsi Derin
Dinlenme'dir. Zor Anlar İçin iki saatte de yolda yoktur. Yol süreleri ve yoga günü sayısı yedek kuraldan etkilenmez.

13.–28. günler atlanınca 29. gün E testi ve okuma birlikte gelir; yol 20 dakika olur, Yılan ve yoga o gün düşer; ertesi
gün yol 15 dakikaya döner.

#### A.10 Mevcut kullanıcıya geçiş

Sayaçlar kayıtlardan türediği için göç betiği yoktur; eski kullanıcı ilk açılışta merdivenin üstündedir. Çeşitlemeler
`Dvar = min(D, Dstage + 14)` ile açılır: güncelleme günü `Dstage = 0`, `Dvar = 14`'tür. Göz egzersizlerinde V1 (21)
güncellemeden sonraki 7 çalışma gününün ardından, V2 (28) 14, V3 (42) 28 ve V4 (56) 42 çalışma gününden sonra gelir.
Nefeste "Günün ritmi" (Ç-B, 7) güncelleme günü açılır; kısa tutma (Ç-C, 21) 7, bekleme nefesi (Ç-D, 42) 28 çalışma
gününden sonra gelir. `progression.test.js` bunu sınar: D = 200 olan eski kullanıcının güncelleme gününde tutmalı ya da
beklemeli kalıp gelmez. Sayılan takvim haftası
değil, `stage` alanlı kaydın bulunduğu gündür. Görünür değişiklikler §1'de listelidir. Veride yalnız yeni alanlar eklenir (`stage`, `steps`, `variant`, `mix`).

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
   ölçüm, 26 hafta, 5.000 kişi; kod birebir kopya; `sim.mjs` ve `sim_kural_esit.mjs`) kişilerin **%27,2**'si en az bir
   kez "geriliyor" görüyor; alanda 4
   metrik varsa alan yayı **%62,8** kişide en az bir kez "geriliyor"a dönüyor (`verifiedChange`, `lib/dataHub.js:137-150`,
   bir "worse" alanı "down" yapar).
2. Aynı günün turları ayrı ölçüm sayılıyor; "ilk yarı / son yarı" zamanı değil tur sayısını bölüyor.
3. Öğrenme etkisi "iyileşme" diye okunuyor: tekrarlanan bilişsel testlerde ilk 3 ayda belirgin öğrenme etkisi var
   (Bartels 2010, 36 sağlıklı yetişkin, Cohen d 0,36–1,19). Öğrenme eğrili tek metrikte benzetimde kişilerin %71'i en az bir kez
   "iyileşiyor" görüyor.
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

Benzetim (`sim_kural_esit.mjs`, tur 1): bütün kurallar aynı sürede, haftada 3 ölçümle, 5.000 yapay kişide koşuldu.
"Yanlış işaret", gerçek bir değişim yokken en az bir kez "geriliyor" görmektir. "Yakalama" için 13. haftadan sonra 1 SD
düşüş eklenir ve 14–26. haftalardaki işarete bakılır; yanındaki sütun, aynı dönemde değişim yokken de görülen işarettir.
"Alışma" sütununda sonuç ilk haftalarda 1 SD yükselip durur (öğrenme etkisi); sütun en az bir kez "iyileşiyor" görenleri
verir.

| Kural | Yanlış "geriliyor", 13 hafta, tek metrik | 26 hafta, tek metrik | 13 hafta, 4 metrik | 26 hafta, 4 metrik | 1 SD düşüşü 14–26. haftada yakalama | Aynı dönemde değişim yokken işaret | Alışmada yanlış "iyileşiyor", 26 hafta |
|---|---|---|---|---|---|---|---|
| Bugünkü (her ölçümde bakış) | %20,5 | %27,2 | %50,8 | %62,8 | %99,8 | %10,5 | %71,0 |
| Bugünkü + haftalık bakış + iki hafta sürme | %6,8 | %11,5 | %15,9 | %29,0 | %99,0 | %5,9 | %45,1 |
| **v2, c = 1,5, persist 2 (seçilen)** | **%7,1** | **%13,0** | %19,9 | %35,4 | %51,9 | %9,5 | %35,5 |
| v2, c = 2, persist 2 | %2,2 | %4,7 | %7,5 | %14,3 | %30,8 | %3,2 | %17,0 |
| v2, c = 2, persist 3 | %0,5 | %1,0 | %1,6 | %3,4 | %16,0 | %0,7 | %7,7 |

Uzun geçmişte yeni bir düşüş (52 hafta; 48. haftada 1 SD düşüş; sonraki 4 haftada yakalama, aynı betik): bugünkü kural
%14,4, bugünkü + haftalık bakış + iki hafta sürme %8,7, v2 %30,6. Değişim yokken aynı 4 haftada görülen işaret sırasıyla
%3,5, %2,1 ve %3,6'dır.

**Okuma.** Yanlış "geriliyor"daki düşüşün çoğu haftada bir bakmaktan ve iki hafta sürme koşulundan gelir: bugünkü kurala
yalnız bu ikisi eklenince oran %27,2'den %11,5'e iner; v2'de %13,0'dır. Geçmişin ortasındaki bir düşüşü ilk yarı / son
yarı kuralı daha iyi yakalar (%99'a karşı %52). v2'nin kazancı başka yerdedir: (1) aynı günün turlarını tek değer sayar;
(2) başlangıcı sabitler, bu yüzden uzun geçmişte yeni bir düşüşü iki kat sık yakalar (%31'e karşı %14); (3) göreve
alışmayı "iyileşme" sanma oranını yarıya indirir (%71'den %36'ya); (4) göz kuralıyla (`trend.js`) aynı dili konuşur. Uzun
süre kullanan kişi için asıl soru "son haftalarda bir şey değişti mi?" olduğu için v2 önerilir. Yakalama sütunundaki
%51,9'un ≈ 9,5 puanı, değişim yokken de görülen işarettir.

Seçim c = 1,5, persist 2'dir: görev puanları sağlık ölçüsü değildir, yanlış işaretin bedeli düşüktür, duyarlılık
değerlidir. c = 2 yanlış işareti %4,7'ye indirir ama yakalamayı %30,8'e düşürür. "Şimdi" penceresini 3 yerine 6 ölçüm
günü yapmak yanlış işareti %10,2'ye indirir, yakalamayı değiştirmez (%51,3; `_tur1_varyant.mjs`); pencere, gerçek veriyle
yeniden koşulunca seçilir (VARSAYIM). Dört metrikli alanın %35'lik yanlış işaretini alan yayı kuralı (B.4) azaltır. Bu
sayılar yapay veriyle üretildi; gerçek veriyle, telefondan veri çıkarmadan geliştirici cihazında yeniden koşulur.

#### B.4 Alanın doğrulanmış değişimi (iris yayı)

Göz uyarısı ve WHO-5'in "down" durumu her şeyin önündedir ve "karışık" kuralına girmez: ikisinden biri varsa yay her
zaman aşağı döner (bugünkü sıra, `lib/dataHub.js:141-146`). WHO-5'in yayımlanmış bir eşiği ve düşük puan metni vardır;
kişinin günlük beyanı (`day-mood`) onu örtemez. Öteki durumlarda yay ancak alanda en az bir metrik ya da etki "worse"
olduğunda **ve** hiçbiri "better" olmadığında aşağı döner. İkisi birden varsa yay boş kalır ve satırda "karışık" yazar. Yayın yukarı
dönmesi için en az bir "better" gerekir ve hiçbiri "worse" olmamalıdır. Etkiler yalnız son 28 gündeki oturumlarla ve en az 3 oturumla sayılır (`acuteEffects({ since })`, `ACUTE_MIN`).
`verifiedChange` her metrikte `m.verdict ?? m.status` okur; böylece yalnız `status` taşıyan eski test girdileri
(`dataHub.test.js:96`, `:98-100`) aynen geçer. Bu kural `dataHub.test.js:97`'deki "better + worse → down" beklentisini
bilinçli olarak "null" yapar.

#### B.5 Metin

Metin, metriğin yön bilgisine bağlıdır (`better` alanı, `lib/progress.js:154`): Hızlı Bakış'ta ya da tepki süresinde
düşük değer iyidir, bu yüzden metin "artıyor / düşüyor" demez, "başlangıcından iyi / başlangıcının gerisinde" der.

| Metrik türü | Bugün | Y2 |
|---|---|---|
| Görev ve oyun (isabet, eşik, harf, tepki) | "iyileşiyor" / "geriliyor" | "başlangıcından iyi" / "başlangıcının gerisinde" |
| Kendi beyanı (sakinlik, günün puanı, uyku sabah puanı) | aynı | "puanın başlangıcından yüksek" / "puanın başlangıcından düşük" |
| Göz (E testi, okuma) | "iyileşiyor" | değişmez |
| Değişim yok | "doğal oynama" | "doğrulanmış bir değişim yok" |
| Başlangıç kurulmadı | "henüz belirsiz" | "başlangıç oluşuyor" |

Görev kartlarının altına tek satır eklenir: "İlk haftalarda sonuçların alıştıkça iyileşmesi olağandır; bu, göreve
alıştığını gösterir." Önce → sonra kartına ortalamaya dönüş notu eklenir. Gelişim'in "Yöntem" metni
(`components/ProgressOverview.jsx:463`) şöyle olur: "Yayımlanmış bir 'anlamlı değişim' eşiği varsa o kullanılır. Yoksa
aynı günün ölçümleri tek değer sayılır ve ilk günlerin ortancası başlangıç olur. Son üç ölçüm gününün ortancası
başlangıçtan belirgin biçimde ayrılır ve bu, iki haftalık bakışta art arda sürerse değişim denir. Tek güne değil, süren
farka bakılır." Sürüm notu: "Gelişim artık her sonucu ilk günlerindeki başlangıcınla karşılaştırıyor ve bir farkı ancak
iki hafta art arda sürerse değişim sayıyor."

**Tek hesap (veri merkezi ilkesi).** v2 hükmü tek yerde hesaplanır: `metricCards` (`lib/progress.js:152-156`) her karta
`verdict` alanını ekler. Bugünkü `status` alanı mevcut testler ve eşdeğerlik için yerinde kalır, ama hiçbir ekran,
rapor ya da Nef paketi onu artık göstermez. `verdict`'i okuyan yerler şunlardır: Gelişim kartları ve haplar
(`components/ProgressOverview.jsx:37` `metricStatus`), 5. gün raporu (`screens/FirstReport.jsx:57-59`; 5. günde metrikler
çoğunlukla "başlangıç oluşuyor"dur, bugün de 6 ölçümden azsa "henüz belirsiz" yazıyor), alan yayı (`lib/dataHub.js`
`verifiedChange`) ve onu okuyan Ana sayfa haritası (`components/HomeMap.jsx:28`), "Doktoruma göster" raporu ve dışa
aktarma (`lib/exportData.js:117`, `:266`; `STATUS_TEXT`, `:139`, bu bölümün metinleriyle aynı olur) ve Nef paketi. Böylece
aynı kayıt Gelişim'de, raporda ve Nef'te aynı hükmü verir; bu, §G.6'da test edilir.

#### B.6 Modül modül dört katman

Her modül kartı aynı iskeleti taşır: **Düzen** (son 28 günde yapılan gün), **Basamak** (yoldaki yeri, Y1'den sonra),
**Ölçü** (başlangıç → şimdi), **Değişim** (yalnız kural doğrularsa).

| Modül | Ölçü | Kural | Nef'e |
|---|---|---|---|
| Haftalık E testi | logMAR, göz başına | `trend.js`, değişmez | `vaPhase`, `vaTrend`, `vaAlert` (sayısız; karar 6) |
| Okuma | kritik yazı boyu (logMAR), ikinci olarak hız | aynı gözlük koşulunda art arda 2 testte başlangıçtan ≥ 0,2 logMAR fark (VARSAYIM; tekrar payı ±0,12'nin üstünde seçildi); tek test "oynama içinde" (Subramanian 2006: kritik yazı boyunun tekrar payı ±0,12). Kart Göz alanı ayrıntısına taşınır, yaya girer | `readingStatus` |
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
Her satırda modül adı, basamak ("N4 · 3 dk"), 28 günlük şerit ve varsa durum hapı bulunur. Etki ölçüsü olmayan modülün
ayrıntısında bir kez "Bu modülde düzenini izliyoruz: kaç gün yaptığını ve hangi basamakta olduğunu." yazar. Bölüm yeni bir hesap yeri açmaz; ilerleme motorunu, `growthMap`'i ve v2
durumlarını okur.

**Tasarım gerekçesi (kullanıcıya iddia değil):** sağlıklı beslenme ve hareket müdahalelerinde kendini izleme,
çalışmalar arası farkın en büyük payını (%13) açıklayan teknikti; kontrol teorisinden başka bir teknikle (ör. hedef, geri
bildirim) birleşince etki büyüdü (0,42'ye karşı 0,26; Michie 2009, heterojenlik yüksek).

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
| Basamak | "Nefes 4. basamakta: bugün 3 dakika sürecek." |
| Sıradaki | "Bu hafta göz egzersizlerine yakın–uzak ekleniyor." |
| Değişim yok | "Hızlı Bakış'ta doğrulanmış bir değişim yok." |
| Görevde "better" | "Tek Bakışta oyununda sonucun iki haftadır başlangıcından iyi." |
| Görevde "worse" | "Fark Ettin mi?'de sonucun iki haftadır başlangıcının gerisinde." (ışık ve saat notu kartın ayrıntısındadır) |
| Alan karışık | "Dikkat alanında sonuçlar farklı yönlerde; doğrulanmış bir değişim yok." |
| Etki anlamlı | "Son 28 günde nefesin sonunda sakinlik puanın başındakinden yüksek." |
| Ölçüsüz modül | "Göz egzersizlerini 28 günün 22'sinde yaptın." |
| Okuma "better" | "Son iki okuma testinde daha küçük yazıyı rahat okudun." |
| Görmede uyarı yok | "Görmende doğrulanmış bir değişim yok." |
| Görmede sarı/kırmızı | Nef yazmaz; sabit uyarı cümlesi kartın başındadır (`YOL.nef.md` §7.2) |
| 3–13 gün ara | "Beş gün ara verdin; basamağın aynı, kaldığın yerden devam ediyorsun." |

"Nefes seni sakinleştirdi" gibi etki cümlesi yoktur. Yasak kalıplar (`FORBIDDEN` v2) günün cümlesi şablonlarında da
test edilir.

#### C.5 Nef'e giden paket v2 (karar 6)

Bugünkü günlük paket (`coach.js:40-63`) ve `YOL.nef.md` §5.2–§5.3 dönem alanları şu düzeltmelerle: metriklerden yalnız
`{ key, status }`; `readingStatus`; modül başına `stage`; `pathDay`, `gapDays`, `later7`; gün sayıları gün şeridinden;
günün puanından `n7` ve `moodStatus`; görme sayıları (`vaCurrent7`, `vaBaseline`, `vaDelta`), okuma hızı
(`readingWpm`) ve ekran sorusu kalktığı için eski `screenHours` cevabı (`coach.js:24`, `coachCore.js:79`) çıkar;
coachLife rıza metnindeki "ekran süresi" satırı da kalkar. Hava, konum, şehir,
etiket, kart metni, kalıp adı, "Zorlandım" işareti ve Apple Sağlık verisi gitmez. Paket sınırı 4.000 bayt
(`coachCore.js:5`) aynen; en dolu paket testte ölçülür. Modül sınırı 10'dan 16'ya çıkar (`coachCore.js:44`): bugün 8
modülün `coach()`'u var, yoga, `gunun` ve göz egzersizlerinin `stage` alanıyla 11 olur ve alfabetik sırada en sonda duran
`yoga` ilk düşen olurdu (§2.1 satır 21). Son 7 günde kaydı olmayan modül `null` döner.

**Yeni metne "Şimdi değil" diyen kişi.** Mevcut düzende eski sürüme verilmiş izin, yeni metne "Şimdi değil" denince geri
çekilmez (`lib/consent.js:3-5`). Bu kişiye v1 metninin izin verdiği alanlardan v2'de kalanlar gider; v2'de çıkarılan
alanlar (görme sayıları, okuma hızı, `screenHours`) yine gitmez. Yeni alanlar (`moodStatus`, `n7`, `stage`, `pathDay`,
`gapDays`, `later7`, `readingStatus`) yalnız v2 rızasıyla gider. Bu yüzden `gunun` modülünün `coach()`'u Y4'te `null`
döner ve ruh hâli alanları ancak Y6'da, v2 rızasıyla pakete girer. Nef paket testi üç durumu ayrı sınar: v2 rızası var,
v1 rızası var ve v2 reddedildi, hiç rıza yok.

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

İlke: makinenin bildiği sorulmaz, kişinin yaşadığı sorulur. Kanıt: emoji sıralı ölçeğin sırasını 20 hastalık pilotta
hastaların %95'i aynı anladı; 294 kanser hastasında ölçek duygusal iyi oluş ölçeğiyle r = 0,70 ilişki gösterdi (Thompson
2025; hasta örneklemi, Türkçe doğrulama yok). Emojiler bağlama göre farklı okunabiliyor; örneğin WeChat kullanan Çinli
gençler uygulamanın gülen yüz emojisini alaycı ve olumsuz okudu (Cui 2024). Telefonun kendi emojileri için doğrudan bir
çalışma notlarda yok. Tek maddelik ölçekler küçük örneklemlerde (beyin hasarı geçirmiş
61 yetişkin, 284 üniversite öğrencisi) geçerli bulundu, ama tanı aracı değildir (Gertler ve Tate 2020, Killgore 1999).
Gündeki ölçüm sayısı uyumu yordamadı (Wrzus ve Neubauer 2022, 477 çalışmanın gözlemsel meta-analizi, ortalama uyum %79); uzun anket ise yükü ve
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
aittir); gece telefonu sorusu Profilim'de kalır. Profilim → Sorularım'daki üç satır da buna uyar
(`lib/profileQuestions.js:228-230`): ekran satırı yalnız eski bir cevap varsa görünür, uyku satırı "kurulumda" ((e) ile
"sabah sorulacak"), gece telefonu satırı "isteğe bağlı" yazar. WHO-5 14 günde bir doğrulanmış çapa olarak kalır.

**"Günün" sayfası:** Ana sayfa başlığındaki tarih satırına dokununca açılır; satırın sonundaki küçük ok (›) dokunulabildiğini
gösterir. Akşam kartından ve hava teklifinden de açılır (§E.7). Gündüz başlığı "Günün nasıl geçiyor?",
akşam "Günün nasıl geçti?". Üstte "Hava ve ay" kartı (§E.7), altında "Bugün ölçülenler" (adım, Nefona içi göz çalışması ve
mola, yol ilerlemesi, (e)'den sonra dün gece uyku), akşam ise yukarıdaki kart.

#### D.4 Günün kanıt kartı

Canlı PubMed araması yapılmaz: doğrulanmamış bir özeti kişiye gösterir, etki büyüklüğünü değerlendiremez ve kişinin gününü
üçüncü bir hizmete taşır. Onun yerine kart kütüphanesi vardır: her kart yayından önce doğrulanır, `lib/evidence.js`
biçiminde `basis` ve `limits` taşır. Kural motoru `dayCard()` günde en çok bir kart seçer; aynı kart 7 gün içinde yinelenmez;
tetik yoksa kart çıkmaz. Kart bilgidir, öneri ya da yargı değildir; "iyileştirir, korur, önler, kanıtlanmış" yoktur.

| Kart | Tetik | Metin | Kanıt ve sınır | Yayına girer |
|---|---|---|---|---|
| `dolunay` | dolunaydan önceki ve sonraki 2 gece | §E.5'teki metin | Cajochen 2013, Haba-Rubio 2015, Chaput 2016, Smith 2017, Casiraghi 2021 | Y4 |
| `gece-ekran` | etiket "Ekran çoktu" ve saat ≥ 22 | "Çocuk ve ergenlerle yapılan 67 çalışmanın %90'ında fazla ekran süresi, daha kısa ve daha geç başlayan uykuyla birlikte görüldü. Bu birliktelik neden-sonuç ilişkisi göstermez." | Hale ve Guan 2015, 67 çalışma | Y4 |
| `nefes-gunu` | o gün yolda nefes yapıldı | "Bir ay süren bir çalışmada, her gün 5 dakika uzun verişli nefes yapan grupta ruh hâlindeki olumlu değişim, farkındalık meditasyonu yapan gruptakinden büyüktü. Tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez." | Balban 2023 (uzaktan RKÇ, günde 5 dk, 1 ay, aktif kontrol) | Y4 |
| `kirpma-gunu` | o gün yolda göz kırpma yapıldı | "Kuru göz yakınması olan kişilerle yapılan bir çalışmada, kırpma egzersizini bırakanlarda ölçümlerin çoğu iki hafta sonra başlangıca döndü. Yolunda bu adımın her gün olmasının nedeni budur." | Wolffsohn 2025 (RKÇ, 98 + 28 kişi, kuru göz) | Y4 |
| `uzaga-bakis` | o gün yolda uzağa bakış yapıldı | "Göz yakınması olan 29 bilgisayar kullanıcısıyla yapılan bir çalışmada, iki hafta boyunca uzağa bakma molası hatırlatması alanların yakınmaları azaldı; hatırlatma bırakılınca bu fark bir hafta sonra sürmedi." | Talens-Estarelles 2022 (29 kişi, kontrol grubu yok, 2 hafta, 20-20-20 hatırlatması) | Y4 |
| `yagmurlu-gun` | hava şeridinde yağış | "Havanın ruh hâline etkisi ortalamada küçük; kişiden kişiye değişiyor." | Denissen 2008, 1.233 kişi; Klimstra 2011 | Y5 |
| `kisa-gece` | Sağlık gecesi < 6 sa ya da sabah uyku cevabı ≤ 3 | "Bir laboratuvar deneyinde iki hafta boyunca gecede 6 saat yatakta kalan sağlıklı yetişkinlerin dikkat hataları gün gün arttı; kişiler bunu pek fark etmedi. Tek bir kısa gece bu deneyle aynı şey değildir." | Van Dongen 2003 (48 sağlıklı yetişkin, dört gruba ayrıldı; 6 saat yatakta geçen süredir, uyku süresi değil); Lim ve Dinges 2010. Sınır cümlesi kartın içindedir | (e) |
| `az-hareket` | adım < kişinin 7 gün ortancasının yarısı, saat ≥ 18 | Paluch 2022'ye dayalı gözlemsel cümle | `lib/sources.js:166-171`'de PMID 35247352 ve DOI kayıtlı, ama notlarda yeniden doğrulanmadı | Y4 kapısında PubMed'le doğrulanırsa |
| `goz-yorgun` | etiket "Gözlerim yoruldu" | mola kartı | Galinsky 2000 kodda yalnız DOI'yle anılıyor (`lib/eyeBudget.js:3`); PMID yok | PMID ve DOI doğrulanırsa |

**Sıklık (hesap, `_tur2_kart_sayim.mjs`).** Yolu her gün yapan, her akşam kartı açan ve "Ekran çoktu" etiketini hiç
seçmeyen yeni kullanıcı, beş farklı başlangıç tarihinde 30 akşamın 14–15'inde kart görür (dolunay 1, nefes 5, kırpma 5,
uzağa bakış 4). Yalnız `dolunay` ve `gece-ekran` olsaydı bu sayı 30 akşamda 1 ile 4 arasında kalırdı. Sıklığı 7 günlük
tekrar yasağı ve akşam başına tek kart kuralı sınırlar (öncelik: dolunay, gece ekranı, yol kartları). Üç yol kartının metni, öbür
kartlar gibi metin kapısından ve kanıt kapısından geçer; `az-hareket` ve `goz-yorgun` kaynaklarının PubMed doğrulaması
S0'da yapılır.

#### D.5 Veri merkezi

Yeni modül `modules/gunun/` (klasör koymak modül takmaktır): `id: 'gunun'`, alan `wellbeing`, tür `measure`. Kayıt
`sessions`'a yazılır: `{ type: 'day-check', date, day, score: 1–5, tags: [], card, seconds }`; `countsTowardGoal: false`.
Kişinin kendi işi olduğu için İyi oluş gününü doldurur; bu, `YAPILACAKLAR.md` Şimdi 8'deki "İyi oluş dilimi hep boşa
yakın" sorununu da kendiliğinden hafifletir.

`day-check` kaydının hangi sayıya girdiği tek tek belirlenir; amaç, tek bir ruh hâli dokunuşunun mevcut sayıların
anlamını değiştirmemesidir:
- Haftalık hedef ve takvimdeki çalışma günü: **girmez.** `isExerciseSession` (`lib/stats.js:204`) `day-check`'i WHO-5
  gibi dışlar; Ana sayfanın hafta sayısı bu işlevi kullanır (`screens/Home.jsx:150-151`).
- Seri: **girmez** (`countsTowardGoal: false`, `lib/stats.js:134`, `:202`).
- "N gün seninle" (`screens/Home.jsx:172`): **girer**; kişi o gün uygulamaya bir kayıt bırakmıştır.
- Yolun `pathDay`'i, yoganın giriş sayacı (onaylı yoga planı §B.5: "kayıt bırakılan iki ayrı gün") ve okuma testinin ilk
  gün hesabı (`lib/today.js:140`): **girmez.** `lib/today.js`'e kural eklenmez; `screens/Home.jsx:162` yola `day-check`'i
  süzülmüş `sessions` verir, bütün yol sayaçları bu listeden okunur. Metrik `day-mood` v2 kuralıyla değerlendirilir. Etiketler 28 günden sonra
yalnız betimlenir ("'Dışarıdaydım' dediğin günlerin ortalaması 4,1, diğerleri 3,3; 9 ve 17 gün"); 5 günden az kaydı olan
etiket gösterilmez (VARSAYIM). Hava bağlamı `gozolcum:sky-log`'da durur ve haritayı doldurmaz. Modülün `storageKeys`
listesinde `gozolcum:sky-log` ve `gozolcum:day-cards` bulunur; `coach()` Y4'te `null` döner, Y6'dan sonra yalnız v2
rızasıyla `n7` ve `moodStatus` döndürür (karar 6, §C.5). Düşük ruh hâli serisi (ör. 14 günde
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
söylüyor; uygulama zaten yerel eklentiler taşıyor (`MainViewController.swift`, `capacitorDidLoad` içindeki `registerPluginInstance` çağrıları). Uygulamanın alt sınırı iOS 15'tir;
iOS 15'te hava bölümü gizlenir, ay çalışır. Resmî olmayan MGM kazıma servisleri kullanılmaz.

**Nef hava verisi üretmez.** Dil modelinin ölçüme erişimi yoktur; "bugün yağmur yağacak mı?" sorusuna tahmin değil, olası
görünen bir metin üretir. Nef'in kuralı da bunu yasaklar ("yeni sayı, yüzde veya tarih UYDURMA", `lib/coachCore.js` `SYSTEM_PROMPT`, "KESİN KURALLAR").
Veri WeatherKit'ten gelir, hesap telefonda yapılır, cümle sabit şablondan çıkar.

#### E.2 Konum

- Yalnız "Uygulamayı Kullanırken" izni istenir ve `NSLocationDefaultAccuracyReduced = true` yazılır: izin penceresinde
  kesin konum kapalı gelir; yaklaşık konum "typically preserves the city" ve 1–20 km içindedir. Konum tek seferlik
  `requestLocation()` ile alınır.
- Capacitor Geolocation kullanılmaz: README iOS'ta "Always" metnini de istiyor. Aynı Swift eklentisi (`SkyPlugin.swift`)
  CoreLocation'ı doğrudan çağırır.
- İzin yalnız kişi "Hava ve ay" kartında ya da Ana sayfadaki tek seferlik hava teklifinde (§E.7) "Konumumu kullan"a
  dokununca istenir; önce kendi tek cümlelik sayfamız, sonra sistem
  penceresi açılır. Açılışta, kurulumda ve İlk Bakış'ta asla istenmez (Apple'ın önerisi ve 5 sn kuralı).
- İzin metni: "Nefona, bulunduğun yerin hava durumunu ve yağmur olasılığını göstermek için yaklaşık konumunu kullanır.
  Konumun yalnız hava bilgisi için yuvarlanarak Apple'a gider. Konumunun kendisi saklanmaz; telefonda yalnız en yakın il
  adı ve hava bilgisi kalır. Konumun sunucumuza gitmez."
- Metin davranışla aynıdır: koordinat telefonda da saklanmaz; önbellekte yalnız hava sonucu ve en yakın il adı, günlük
  kayıtta (`sky-log`) yalnız günün yağış ve sıcaklık özeti durur
  (§2.1 satır 24). Kişi izni Ayarlar'dan kapatırsa uygulama kapalıyken kod çalışmadığı için (`lib/notifyPlan.js` baş yorumu)
  silme hemen olmaz: uygulama izin durumunu ilk açılışta okur, il adını ve hava önbelleğini siler, bekleyen yağmur
  bildirimini iptal eder.
- Koordinat Swift tarafında 2 ondalığa yuvarlanır. Şehir adı için ters coğrafi kodlama kullanılmaz (koordinatı ayrıca
  Apple'a gönderir); 81 il merkezinin tablosundan en yakın il telefonda bulunur (kaynak ve lisans eklenirken yazılır;
  VARSAYIM: GeoNames, CC BY 4.0).
- İzin yoksa kişi şehir seçer; Profil'deki şehir 81 ilden biriyse öneri olarak çıkar. "Allow Once" seçilirse sonraki
  açılışta kart yine tek dokunuşla sorar, en çok 3 kez; sonra yalnız şehir seçimi kalır.
- Konum ön planda en çok saatte bir alınır; hava önbelleği 60 dakikadır (VARSAYIM). Arka planda konum yoktur.
- Rıza `weather` v1'in metni dört satırdır: Ne (yaklaşık konum ya da seçilen şehrin merkezi), Neden (hava, yağmur olasılığı, istenirse yağmur
  bildirimi), Nerede (Apple'ın hava servisi, yurt dışı; sunucumuza ve Nef'e gitmez), Ne kadar (telefonda yalnız en
  yakın il adı, hava önbelleği ve 90 günlük günlük hava özeti; il adı ve önbellek izin kapandıktan sonraki ilk açılışta
  silinir). KVKK m. 9 (2024) gereği her gün tekrarlanan yurt dışı aktarımın dayanağı hukukçuya
  sorulur.

#### E.3 Ay evresi

`lib/moon.js` Meeus'un *Astronomical Algorithms* kitabındaki 48. ve 49. bölüm formüllerini kullanır (≈ 60 satır,
kitaplık yok). USNO'nun 2026 tablosuyla sınandı:
50 evrede en büyük sapma 1,9 dk, Türkiye gününde kayan evre 0; "29,53 güne bölme" yöntemi 19,4 saate kadar sapıyor ve 50
evrenin 18'inde günü kaydırıyor. Kontrol değerleri şunlardır: 29.09.2026 12.00'de aydınlanma astronomy-engine'e göre %91,1,
Meeus'a göre %91,2'dir (tolerans ±1 puan); evre açısı 214,5°, evre "küçülen şişkin ay"dır; sonraki yeniay 10 Ekim'de,
dolunay 26 Ekim'dedir. Evre adları sekizdir: yeniay, büyüyen hilal, ilk dördün, büyüyen şişkin ay, dolunay, küçülen
şişkin ay, son dördün, küçülen hilal. Sınırlar evre açısına göre sekiz eşit dilimdir (VARSAYIM); "yeniay" ve "dolunay"
yalnız o takvim gününde yazılır. Şeritteki ay simgesi evreye göre çizilir. Testler USNO tablosundan örneklerle, ≤ 2 dk toleransla ve Türkiye günü birebir yazılır. Ay
hesabı konum ve ağ istemez; herkes için aynıdır. Mevcut süs ay simgeleri değişmez.

#### E.4 Hava ve ruh hâli, hava ve hareket

Havanın ruh hâline ortalama etkisi küçük ve kişiden kişiye değişken (Denissen 2008); bir grup kişi yağmuru sevmiyor, bir
grup hiç etkilenmiyor (Klimstra 2011); yaşam doyumu yargısını güvenilir biçimde etkilemiyor (Lucas ve Lawless 2013). Kötü
hava hareketin önünde bir engel (Tucker ve Gilliland 2007; Klimek 2022). Kullanımı: yağmurlu günde yürüyüş hatırlatmasının
metni içeride yapılabilecek bir seçeneğe döner; bu bir metin seçimidir, sağlık iddiası değildir.

#### E.5 Ay kartında "Bilim ne diyor?"

Bir laboratuvar çalışması dolunaya yakın gecelerde toplam uykunun 20 dakika kısaldığını buldu (Cajochen 2013); bir saha
çalışması dolunaydan önceki gecelerde uykunun daha geç başladığını ve daha kısa sürdüğünü gösterdi (Casiraghi 2021); 12 ülkeden 5.812 çocukla yapılan bir çalışma dolunayda gecede ≈ 5
dakika daha kısa uyku buldu ve bu farkın anlamlı olup olmadığını sorguladı (Chaput 2016); 852 kişilik kesitsel bir
çalışma büyüyen ay döneminde daha kısa uyku buldu (Benedict 2021). İki büyük nüfus çalışması etki bulmadı (Haba-Rubio
2015, 2.125 yetişkin; yalnız bir alt grupta anlamlıya yakın bir eğilim var; Smith 2017, 1.411 ergen, ölçülen yatakta
geçen süre); bulgular yöne ve cinsiyete göre tutarsız (Della
Monica 2015); derleme sağlam kanıt görmüyor (Foster ve Roenneberg 2008). Kartın metni:

> Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde uykunun biraz kısaldığını buldu; binden fazla
> kişiyle yapılan bazı büyük çalışmalar ise fark bulmadı ya da yalnız birkaç dakikalık fark buldu.

Kaynak satırı: Cajochen 2013, Haba-Rubio 2015, Chaput 2016, Smith 2017, Casiraghi 2021. Tavsiye yoktur. Hakemsiz 2026 ön baskısı
(PMID 41659491) ve özeti doğrulanamayan Cordi 2014 karta girmez.

#### E.6 Yağmur bildirimi

- Kısıtlar: uygulama kapalıyken kod çalışmaz, bildirimin saati ve metni kurulduğu anda sabitlenir (`lib/notifyPlan.js` baş yorumu);
  arka plan yenilemesinin zamanı garanti değildir ve uygulamada `fetch` kipi yoktur (`Info.plist` `UIBackgroundModes`: yalnız `audio`); Türkiye'de
  dakikalık yağış yoktur; sunucudan push, konumun sunucuya gitmesini gerektirdiği için reddedildi.
- Tercih "Yağmur haberi" ayrı ve varsayılan kapalıdır; hava kartı açık kişiye ilk yağmurlu günde bir kez sorulur:
  "Yağmur beklenen sabahlar sana haber vereyim mi?"
- Planlama: uygulama her ön plana gelişinde önbellek ≥ 60 dk eskiyse hava yenilenir ve bugünün ya da yarının bildirimi
  yeniden hesaplanır; 18.00'den sonraki açılış yarın sabahı planlar. Bildirimin çalacağı anda tahmin 18 saatten eskiyse
  bildirim kurulmaz.
- Saat ve eşik §2.2'dedir (A8, A9). Günde en çok bir bildirim gelir; kimlikler **7700 ve 7701**'dir, çünkü 7600–7607
  alarm yedeğine ayrılmıştır (`lib/alarmNative.js` `FALLBACK_BASE`, `FALLBACK_ONCE`); `lib/notifyApply.js` `OWN_RANGES`'e
  `[7700, 7701]` eklenir (bugünkü kodda var: sabah havası 7700–7701). Düzeyi `active`'dir.
- **Tek plan:** uygulayıcı kendi aralığında olup gelen planda bulunmayan her bekleyen bildirimi iptal eder
  (`lib/notifyApply.js`, `createApplier` içindeki `reconcile`); yağmur bildirimi ayrı kurulsaydı bir sonraki planlamada sessizce silinirdi. Bu yüzden
  `lib/rainNotify.js` yalnız bildirim nesnesini üretir; `App.jsx`'teki plan kurulumu ("Bildirim planı (sözleşme §6)" yorumlu `useEffect`; bugün tek planlayıcı
  `lib/notifyAll.js` `planAll`, ardından `applyPlan`) onu
  `planNotifications` çıktısının bildirim listesine ekler ve `applyPlan` tek planı kurar. Deney ve sessiz gün mantığı
  (`lib/notifyPlan.js`) bu kimliklere dokunmaz.
- **Bildirim deneyiyle ilişki.** Sürmekte olan deney, her hatırlatma türü için günleri zarla "gönder" ve "sessiz" diye
  ayırır ve o türün bildirimden sonra yapılıp yapılmadığını karşılaştırır (`lib/notifyPlan.js` baş yorumu ve
  o günkü `SILENT_RATE`; `lib/notifyLog.js` `evaluate`). Not (2026-10-01): bugünkü kodda sessiz gün deneyi kalktı
  (`lib/notifyPlan.js` baş yorumu: uygun her gün gönderilir, günlükte `arm` `send`); `SILENT_RATE` yok, bu madde tarihsel. Yağmur, zardan bağımsızdır; yağmur bildirimi iki kola da aynı olasılıkla düşer, bu yüzden
  karşılaştırmayı bir yöne çekmez, yalnız biraz gürültü ekler. Yağmur bildiriminden gelen açılış deney günlüğüne yazılmaz:
  dokunma kaydı yalnız hatırlatma türleri için tutulur (`lib/notifyTap.js` `createTapHandler`; `NUDGE_TYPES`,
  `lib/reminders.js`) ve yağmurun türü `rain` bu listede
  yoktur. Açılış ayrı bir sayaçla (G8'in `rain` kolu) telefonda sayılır. Deneyin sonucu gerektiğinde `sky-log`'daki
  yağmurlu günler ayrılarak da okunabilir. `rainNotify.test.js` iki şeyi sınar: yağmur dokunuşu deney günlüğünü
  değiştirmez ve `evaluate` çıktısı yağmur bildirimli ve bildirimsiz aynı günlükte aynıdır.
- Bildirimlerin ana anahtarı kapalıyken `cancelOwn` (`lib/notifyApply.js`; `App.jsx`'teki bildirim planı
  `useEffect`'inde `optIn` `yes` değilken çağrılır) aralığın tamamını iptal eder; bu yüzden yağmur haberi ana anahtar açıkken çalışır ve anahtar kapalıyken tercih
  satırında "Bildirimler kapalı" yazar.
- Metin: başlık "Bugün yağmur bekleniyor"; akşam kurulmuşsa gövde "Dün akşamki tahmine göre 14.00–17.00 arası yağmur
  olasılığı %70." ve sabah kurulmuşsa "14.00–17.00 arası yağmur olasılığı %70."; sonunda "Kaynak: Apple Weather" (App
  Review cevabına bağlı). Dokununca "Hava ve ay" kartı açılır.
- Alarm sabahı: "Uyanınca" kartı (`lib/alarm.js` `morningCard`) bir satır hava gösterir; akşam alarm kartı (`eveningCard`) "Yarın sabah
  yağmur bekleniyor" satırını gösterebilir.
- Bekleyen yerel bildirim sınırı yaygın olarak 64 bilinir (Apple belgesinde bulunamadı, VARSAYIM); bugünkü en dolu plan
  ≈ 49, yağmurla 51.

#### E.7 Ekran: başlık şeridi ve "Hava ve ay" kartı

- Ana sayfa tarih satırı (`screens/Home.jsx`, `home-head` başlığındaki `eyebrow`, `toLocaleDateString`): "Salı, 29 Eylül · küçülen şişkin ay"; önünde evreye göre çizilen ay simgesi
  durur (§E.3). App Review atıf cevabı olumlu gelirse
  "· 18° · öğleden sonra yağmur" eklenir. 320 pt'de şerit ikinci satıra iner. Ağ beklenmez; hava önbellekte yoksa yalnız
  ay görünür.
- "Hava ve ay" kartı "Günün" sayfasının üstünde durur ve sırasıyla şunları gösterir: başlık "HAVA VE AY · İstanbul (yaklaşık)" ve sıcaklık; "Öğleden sonra yağmur
  bekleniyor"; saat saat yağış olasılığı şeridi (tek renk tonu); en yüksek ve en düşük sıcaklık; ay evresi ve aydınlanma;
  son ve sonraki dolunay ve yeniay; "Bilim ne diyor?"; her zaman görünen atıf satırı (Apple Weather markası temaya göre,
  "Veri kaynakları" bağlantısı) ve verinin yaşı ("12.40'ta alındı").
- Bağlam satırı sabit şablondur: yağmurda "Yağmur varsa yürüyüşünü içeride de yapabilirsin.", açık gündüzde "Gökyüzü açık;
  Gökyüzü molası için güzel bir gün."
- **Görünür giriş.** Hava yalnız "Günün" sayfasında kalsaydı kişilerin çoğu onu hiç görmeyebilirdi. Bu yüzden 7. günden
  sonra, günün ilk dokunuşundan sonra (5 saniye kuralı), Ana sayfada ay şeridinin altında bir kez tek satırlık bir teklif
  çıkar: "Bulunduğun yerin havasını da göstereyim mi?" [Konumumu kullan] [Şehir seç] [Hayır]. "Hayır" ya da kapatma
  kalıcıdır; teklif bir daha çıkmaz, kart "Günün" sayfasında yine durur. Akşam kartı da "Günün" sayfasına bağlantı
  verir.
- Kart şu durumları ayrı gösterir: hiç sorulmadı (ay tam; "Bulunduğun yerin havasını göstereyim mi?" [Konumumu kullan] [Şehir seç]); izin
  reddedildi (şehir seç); çevrimdışı ve önbellek < 12 sa (son veri ve yaşı); önbellek yok ("Hava için internet
  gerekiyor."); WeatherKit hatası ("Hava bilgisi şu an alınamadı.", 15 dk sonra yeniden); iOS 15 ve web (hava yok, ay
  tam).
- `gozolcum:sky-log` gün başına `{ date, rainy, tMax, moonIllum }` tutar; koordinat ve şehir tutmaz; 90 gün saklanır
  (VARSAYIM). Notlarda okunan WeatherKit belgelerinde saklama ya da önbellek koşulu yoktur; Apple Developer Program
  Lisans Sözleşmesi'nin WeatherKit maddesi Y5 kapısında okunur, süre ona göre kısaltılır ve sonuç §J'ye yazılır. Hava bir
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

#### F.2 İlk kez açan kişi ve site (Y3; karar 5)

Sahibin "ilk önce" dediği an budur: uygulamaya ya da siteye ilk kez giren kişinin 5 saniyesi.

**Uygulama, bugün** (`bes-saniye.md` §1.1; kodda, cihazda denenmedi):

| Saniye | Ekran | Görünen |
|---|---|---|
| 0–1 | iOS açılış ekranı (`LaunchScreen.storyboard:15`, `Splash.imageset`) | düz zeminde Nefona logosu |
| 1–5 | giriş ekranı (`App.jsx:593`, `components/IntroFilm.jsx:45-47`) | "Nefona", "Fark etmeyi yeniden öğren.", "Başla" |
| 5+ | İlk Bakış tanıtımı (`lib/firstLookText.js:22-27`) | "20 saniye · Önce bir şey fark edelim", ikinci "Başla", sonra kamera izni |
| ≈ 30 | İlk Bakış sonucu | "X kez kırptın" ("vay" anı) |

**Uygulama, önerilen** (karar 5a ve 5c): açılış ekranı logosuz düz zemindir; giriş ekranının alt yazısı İlk Bakış'ın
vaadini söyler: "20 saniyede sana fark etmediğin bir şeyi göstereceğiz." Böylece ilk 5 saniye merakı adıyla verir ve ilk
dokunuş bir vaadin karşılığıdır. Giriş ekranının öteki öğeleri ve iki "Başla" şimdilik aynı kalır: ikisini birleştirmek
kamera iznini ilk dokunuşa çeker; önce G1 (ilk dokunuştan sonuca geçen süre) cihazda ölçülür. Soru, uygulamada sonuçtan
önce sorulmaz: kişinin dikkati kırpmasına giderse sayım bozulur (`lib/firstLookText.js:32` sayıyı okurken gizliyor).

**Site, bugün** (`site/pages/index.html:7`, derlenmiş `site/index.html:34-36`): ilk ekranda "Gözün değişiyor. Sen de gör."
başlığı, "Telefonu biraz daha uzağa mı tutuyorsun? Akşamları harfler mi bulanıyor?" sorusu ve E testi tadımlığı var.

**Site, önerilen** (karar 5b): ilk ekranın başlığı "Bu cümleyi okurken kaç kez göz kırptın?" olur (`YAPILACAKLAR.md:76`,
20 konseptin en yüksek şaşırtma puanı, 8,3/10). Altında tek satır durur: "Bilmiyorsan şaşırma. Nefona ilk açılışta göz
kırpmalarını 20 saniyede sayar; kamera görüntün telefondan çıkmaz." Bugünkü iki düğme ve E testi tadımlığı yerinde kalır.
Kapsam: yalnız `site/pages/index.html`'in ilk bölümü; sitede kamera açılmaz, ölçüm yapılmaz, sayı istenmez ve sağlık ya
da bilim iddiası yazılmaz. Sayfa başlığı (`<title>`) ve öteki bölümler değişmez. Sitede analiz kitaplığı yoktur (bu belge için
aranıp bulunamadı), bu yüzden sitede 5 saniyenin etkisi ölçülmez; bu dürüst bir sınırdır. İş ≈ 0,5 gün, Y3 içinde
(VARSAYIM).

#### F.3 Günün ilk açılışı (yeni ekran yok)

Günün ilk açılışı telefonda tek anahtarla tanınır: `gozolcum:day-open` → `{ day, firstAt, firstTapAt, lead }`. Bu kayıt
`sessions`'a girmez, seriye, hedefe ve Nef'e sayılmaz; "Tüm verileri sil" onu da siler.

| Saniye | Nereye bakılır | İçerik | Aşama |
|---|---|---|---|
| 0–1 | açılış ekranı → Ana sayfa | düz zemin, logosuz (karar 5c) | Y3 |
| 1–2 | tarih satırı | ay evresi; App Review cevabından sonra hava | Y4–Y5 |
| 1–2 | selam | "Günaydın, Haydar" (bugünkü gibi) | — |
| 2–4 | Nef satırı | günün tek cümlesi | Y3 |
| 4–5 | büyük düğme | "Güne başla · Sağ–sol bakış · 1 dk" ve "Yeni" rozeti | Y3 (rozet Y1'e bağlı) |
| yan | sayılar | "0/9 durak · ≈ 15 dk"; seri yalnız ≥ 3 gün, değilse "12 gün seninle"; sıfır satırı yok (karar 5d) | Y3 |

Günün cümlesi ilk dokunuşa kadar ya da en çok 1 saat görünür; sonra `homeSuggest` bugünkü gibi çalışır. Yenilikler ve
rıza pencereleri günün ilk dokunuşundan ya da ilk duraktan sonra açılır (§2.2 K4); ilk rapor (5. gün) ve kırmızı görme
uyarısı istisnadır. Kırmızı ya da sarı görme uyarısı varsa günün cümlesi yazılmaz, uyarının sabit cümlesi en üste çıkar.
Alarm sabahında Sabah ekranı aynı şeridi gösterir. (d) geldiğinde, kişi açtıysa, ilk 5 saniyede şeridin yerinde canlı
mesafe ("● 34 cm") yazar; Ana sayfanın çizimi kamerayı beklemez.

#### F.4 Günün tek cümlesi (ilk tutan kazanır; hepsi telefonda, ağsız)

| Öncelik | Durum | Örnek |
|---|---|---|
| 0 | kırmızı ya da sarı görme uyarısı | cümle yok; uyarı en üstte |
| 1 | kurulumun ertesi günü ya da 1. gün | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." |
| 2 | bugün kilometre taşı | "Bugün 28. gün: iris haritan başlangıçla yan yana geliyor." / "Bugün haftalık E testi günü." |
| 3 | ≥ 2 günlük aradan dönüş | "Kaldığın yerden: basamakların aynı." |
| 4 | dün bir ilk ya da rekor | "Dün Yılan'da 38 puanla en iyi sonucuna ulaştın." |
| 5 | yeni doğrulanmış değişim | "Tek Bakışta oyununda sonucun iki haftadır başlangıcından iyi." |
| 6 | bugün yeni basamak ya da modül | "Bugün yeni: sağ–sol bakış." |
| 7 | dün yol tamamdı | "Dün yolunun bütün duraklarını tamamladın." |
| 8 | ≤ 3 gün içinde kilometre taşı | "İris haritan 3 gün sonra başlangıçla yan yana gelecek." |
| 9 | hiçbiri | bugünkü `homeSuggest` satırı |

Aynı öncelik iki gün üst üste gelmez (0 ve 1 hariç); öneri ve bildirim etkileri zamanla azaldı (Klasnja 2019). Cümle en
çok 70 karakterdir (VARSAYIM) ve tek iddia taşır; içindeki sayılar yalnız o iddiaya aittir (1. öncelikteki cümlede
kırpma sayısı, süresi ve yeniden bakma günü tek bir olayı anlatır). Karşılaştırma yalnız kişinin kendi başlangıcıyladır.
"İyileşti", "gelişiyorsun", "sağlıklı" yoktur. Tek günlük ham fark ("Dün 9, bugün 12 kırpma") söylenmez, çünkü çoğunlukla
gürültüdür. Cümle `day-open.lead`'e yazılır ve gün içinde değişmez.

#### F.5 Deneyim yayı

- **1–7. gün (deneme süresi; hedef "bu uygulama beni tanıyor"):** Her güne bir sürpriz düşer: 1. gün İlk Bakış sonucu, 2. gün sağ–sol ve Yılan, 3. gün
  ilk yoga ve 3 dakikalık nefes, 4. gün yukarı–aşağı, 5. gün ilk rapor (deneme bitmeden), 6. gün Fark Ettin mi?, 7. gün "İlk
  haftan" satırı ve iki isteğe bağlı soru gelir. 5. gün raporunun ilk ekranı kişinin en güçlü kendi sayısıyla açılır ve
  "neyi ölçtük, neyi henüz bilmiyoruz" diye biter (görmede başlangıç en erken 22. gün).
- **8–30. gün (hedef "düzenim oturuyor"):** Kilometre taşları sırayla gelir: 8. gün ikinci E testi, 14. gün iyi oluş
  kartı, 22. gün görmede başlangıç, 25. gün geri sayım, 28. gün iris yan yana, 29. gün ilk aylık Nef. Aylık planda ilk yenileme 37. gündür; 28. ve 29.
  günün değeri ondan önce gelir. Bu bir ödeme hatırlatması değildir; aboneliğin sürekli değer vermesi Apple'ın kuralıdır
  (3.1.2(a)).
- **31–90+ gün (hedef "benim düzenim; ara verirsem de dönerim"):** 43. günden bekleme nefesi, 57. günden tam set günü,
  90. günden sonra haftalık odak açılır ("Bu haftanın odağı: yakın–uzak."). Ay şeridi her gün farklıdır; dolunayda yalnız
  betimleme ("Bu gece dolunay") yapılır. Ara vermek olağandır (Lau 2022, 41.207 kullanıcı); dönen kişi hiçbir sayının
  sıfırlandığını görmez. "66 günde alışkanlık" gibi bir söz verilmez (Singh 2024: kişiler arası 4–335 gün).

#### F.6 Devamlılık kanıtı (tasarımı yönlendirir, kullanıcıya söylenmez)

Bırakma yüksektir: kronik hastalık uygulamalarında birleşik bırakma %43'tür (Meyerowitz-Katz 2020); ruh sağlığı
uygulamalarında 30. gün kalma ortancası %3,3, nefes uygulamalarında %0'dır (Baumel 2019). Bağlılığı artıran bileşenler şunlardır: kişiye uyarlanmış içerik, kişiye göre
hatırlatma, kolay ve kararlı tasarım (Jakob 2022, 99 çalışma); kişinin kendi sağlığına içgörü kazanması ve kontrol
hissi (Borghouts 2021). Hatırlatma yapılan çalışmalarda bırakma daha düşüktü (Linardon 2019); kişiye uyarlanmış bildirim
ertesi 24 saatte kullanımı küçük ölçüde artırdı (Bidargaddi 2018, RR 1,039). Alışkanlığı tutarlılık, düşük karmaşıklık ve
keyif yordadı (Kaushal ve Rhodes 2015); planı tekrar tekrar uygulamak önemli bir yordayıcıydı (Keller 2021). Oyunlaştırmanın etkisi
küçük–orta ve izlemde küçülüyor (Mazeas 2022). Seri kırılmasının etkisini ölçen bir PubMed kaydı bulunamadı; kırık serinin gizlenmesi
kanıta değil, "ceza yok" tasarım ilkesiyle tutarlılığa dayanır.

#### F.7 Bağlılık göstergeleri (telefonda)

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
3. Etki ölçüsü varsa `progress.metrics` (v2 parametreleriyle) ya da `effects`; yoksa kartta "düzenini izliyoruz" satırı.
4. Yolda olacaksa `today(ctx)`, `lib/ladders.js`'te merdiven ve açılma eşiği; benzetim 20 dk sınırını ve düşme sırasını
   yeniden doğrular.
5. `coach()` en çok 6 alan, pencerede kayıt yoksa `null`; sunucudaki `MODULE_NOTES` satırı manifestteki `coachNote`
   ile birebir aynıdır.
6. Kaynak kartı (PMID + DOI) ve `storageKeys` ("Tüm verileri sil").

#### G.3 Aşama aşama dosyalar

| Aşama | Yeni | Değişen |
|---|---|---|
| Y1 | `lib/progression.js` (`restDecision` dâhil), `lib/ladders.js`, `lib/breathMix.js` ve testleri | `screens/Home.jsx:162` (bağlam), `:165-170` (ara kilidi `restDecision`'a bağlanır); `modules/registry.js:85`; `modules/breath/manifest.js`, `view.jsx:25`; `screens/Breath.jsx` ("2 dk daha", tutma ön koşulu); `lib/routines.js` (`dikey`, çeşitleme yaması); `modules/routine/manifest.js`; `screens/Routine.jsx:415` (`stage`); snake, fark-ettin, tek-bakis manifestleri (`unlocked`); `modules/notice/manifest.js:31` (ilerleme varken kayıt şartı kalkar, yokken aynen); `components/TodayPath.jsx` (rozet); `lib/pathLater.js` (`progressionCtx`); sitenin yol metni ve görselleri (`site/pages/index.html:93-94`, `home-path-*.webp`: nefes 3 dk, büyüyen yol). `lib/yoga.js`'e dokunulmaz (§2.3) |
| Y2 | — | `lib/progress.js` (`metricStatusV2`; `metricCards` her karta `verdict` ekler, `status` ve `metricTrend` yerinde kalır), `lib/dataHub.js` (`verifiedChange`: `verdict`, karışık, etkiler 28 gün), `lib/exportData.js:117, :139, :266` (`verdict` ve yeni `STATUS_TEXT`), `components/ProgressOverview.jsx:36-48` (`metricStatus` → `verdict`, metin) ve `:463` (Yöntem metni), `screens/FirstReport.jsx:57-59`, `components/HomeMap.jsx:28` (alan yayı üzerinden), `modules/reading/manifest.js` (`reading-cps`), `screens/Progress.jsx` ("Yolun"), `modules/tek-bakis/manifest.js` (`span7` ortanca) |
| Y3 | `lib/dayOpen.js` ve testi | `lib/homeSuggest.js` (isteğe bağlı `lead`), `screens/Home.jsx:152, 203-204, 236-247, 253-257` (karar 5d), `App.jsx:795-798`, `components/IntroFilm.jsx:45` (alt yazı, karar 5a), `site/pages/index.html:7` ve derlenmiş `site/index.html:34-36` (karar 5b), `LaunchScreen.storyboard` ve `Splash.imageset` (karar 5c), `Info.plist:16` (kamera metnine yalnız İlk Bakış'taki kırpma sayımı), WHO-5 14. gün kartı, `screens/FirstReport.jsx` ilk ekran metni |
| Y4 | `modules/gunun/`, `lib/dayCards.js`, `lib/moon.js`, "Günün" sayfası ve testleri | `lib/profileQuestions.js:170` (akşam grubu) ve `:228-230` (Sorularım satırları), `screens/Home.jsx:334-344` (kart), `:150-151` ve `:162` (`day-check` süzülür), `lib/stats.js:204` (`isExerciseSession` `day-check`'i dışlar), `lib/evidence.js`, `lib/sources.js`, `Home.jsx` tarih satırı (`home-head` `eyebrow`; ay, ›), sitenin "Bir günün nasıl geçer" bölümündeki akşam anlatımı |
| Y5 | `ios/App/App/SkyPlugin.swift`, `lib/sky.js`, il merkezleri tablosu, `components/SkyCard.jsx`, `lib/rainNotify.js` ve testleri | `MainViewController.swift` (`capacitorDidLoad`), `App.entitlements` (WeatherKit), `Info.plist` (iki konum anahtarı), `lib/consent.js` (`weather` v1), `lib/notifyApply.js` (`OWN_RANGES`), `App.jsx` bildirim planı `useEffect`'i (yağmur bildirimi tek plana eklenir), `screens/Home.jsx` (tek seferlik hava teklifi, §E.7), `screens/AlarmMorning.jsx`, `lib/alarm.js`, `site/pages/gizlilik.html` ve derlenmiş `site/gizlilik.html` ("Kamera görüntüsü, ses kaydı ve konum sunucuya hiç gitmez" satırı), App Store gizlilik etiketi |
| Y6 | dönem paketleri (`YOL.nef.md` §11) | `lib/coach.js` (`:24` `screenHours` paketten çıkar; görme sayıları ve okuma hızı çıkar; v2 reddinde v1 alt kümesi), `lib/coachCore.js` (SCHEMA, `MODULE_NOTES`, istem; `:44` modül sınırı 16; `:79` ekran süresi satırı çıkar), `modules/gunun/manifest.js` (`coach()` v2 rızasıyla açılır), `api/coach.js`, `CoachCard`, `lib/consent.js` (coach v2 ve coachLife v2: "ekran süresi" satırı çıkar), breath ve snake `coach()` (boşken `null`), `site/gizlilik.html:59-60` ve `site/pages/gizlilik.html:32-33` (Nef satırları), App Store gizlilik etiketi (ruh hâli ve Nef satırı) |

#### G.4 Bilinçli olarak değişen test beklentileri

- `modules/registry.test.js:8`: modül kimliklerinin birebir listesine Y4'te `gunun`, (d) ve (e)'de yeni modüller
  eklenir; satırın başka bir yeri değişmez (onaylı yoga planı aynı satıra `yoga`'yı ekler, PLAN.v3 §B.5).
- `lib/dataHub.test.js:97`: "better + worse → down" yerine "null (karışık)" (Y2, karar 2). `verifiedChange` `verdict ??
  status` okuduğu için `:96` ve `:98-100` aynen geçer.
- `modules/coachStats.test.js`: Tek Bakışta `span7` en iyiden ortancaya (Y2).
- `lib/profileQuestions.test.js:43-55` (akşam kartının 18.00 testi, erteleme testi ve "cevaplanınca gelmez" testi yeni
  `gunun` kartına taşınır) ve `:75` (uyku satırı "akşam sorulacak" yerine "kurulumda") (Y4). `:56-63`'teki stres kartı
  testi eski soruları cevaplatır; sorular tanımda kaldığı için beklentisi değişmez.
- Başka hiçbir mevcut beklenti değişmez; değişmesi gerekirse iş durur ve sahibe sorulur.

#### G.5 Değişmeden yeşil kalması gereken testler

Şu testler değişmeden geçmelidir: `lib/today.test.js` (45 test; normal gün sekiz durak),
`components/TodayPath.test.jsx`, `modules/registry.test.js` (8. satırdaki modül listesi dışında), `lib/dataHub.test.js`
(97. satır dışında), `lib/progress.test.js`, `lib/breath.test.js`, `lib/homeSuggest.test.js`, `lib/notifyLog.test.js`,
`lib/notifyPlan.test.js`, yoganın bütün testleri ve uygulamanın bütün takımı (2026-09-29'da inceleyicinin koşusunda 103
dosya, 1417 test). §G.4'teki satırlar dışında bu testlerin geçmesi, mevcut sistemin bozulmadığının kanıtıdır.

#### G.6 Eşdeğerlik

- **İlerleme kapalı:** Y1 kodu `ctx.progression` verilmeden, yoganın 20.000 rastgele bağlamlık düzeneğiyle
  (`yoga-pilot/v3/v3fix2/esdeger_v4.mjs` kalıbı) bugünkü yola karşı koşulur. Durak listesi, bölümler, süreler, sıradaki
  durak, `allDone`, `minutesLeft`, mola ve kilit işaretleri **0 farkla** aynı olmalıdır. Düzenek `buildPath`'in yanında
  iki kararı da sınar: `restDecision` (ara kilidi; ilerleme yokken `Home.jsx:165-170` ile aynı karar) ve Bugünün görevi
  (ilerleme yokken `modules/notice/manifest.js:31` ile aynı çıktı).
- **İlerleme açık, yeni kullanıcı:** `today.test.js`'e yeni blok: 1., 2., 4., 8., 9. günler ve 29. gün uzun dönüş (§A.9
  tablosu); yoga dışındaki durakların yogalı ve yogasız yolda birebir aynı kalması.
- **İlerleme açık, eski kullanıcı:** Y1'den sonra `ctx.progression` herkese verildiği için üretimde çalışan yol budur.
  Aynı 20.000 bağlamlık düzenek, uzun geçmişli (her modülde D ≥ 60, `Dstage` 0–60 arası) rastgele kullanıcılarla
  ilerleme açıkken bugünkü yola karşı koşulur. Fark yalnız izinli listede olabilir: nefesin yol payı 5 → 3 dk ve kalıbı,
  `dikey` grubu ile Daire'nin gün aşırı dönüşümü, göz çeşitlemeleri (`Dvar` eşiğini geçmişse), Bugünün görevi'nin yola
  girmesi ve yoldaki "Yeni" rozeti. Öteki her alanda (duraklar, bölümler, sıra, `allDone`, `minutesLeft`, düşme sırası)
  fark sıfır olmalıdır. `restDecision` bu bağlamda da sınanır: eski kullanıcıda 1. bölümün göz payı dolu olduğu için
  karar bugünkü kuralla 0 fark vermelidir.
- Yeni testler: `progression.test.js` (bugün sayılmaz, yumuşak dönüş, açılma, `Dvar`; eski kullanıcının güncelleme gününde tutmalı ya da beklemeli kalıp gelmez), `ladders.test.js`,
  `breathMix.test.js` (zarf, art arda tekrar yok, tutma ön koşulu, belirlenimcilik), `progress.test.js` v2 bloğu (alışma,
  aynı gün beş tur tek nokta, başlangıç donar, tek haftalık sapma "noise", iki haftalık sapma "worse", SD tabanı),
  `dayOpen.test.js` (gece yarısı, saat dilimi, öncelik, tekrar yasağı, yasak kalıplar, 70 karakter, uyarıda cümle yok),
  `moon.test.js` (USNO ±2 dk, TR günü birebir, aydınlanma ±1 puan), `sky.test.js` (yuvarlama 41.0082 → 41.01, eşik,
  18 saat bayatlık, çevrimdışı ve iOS 15 metinleri), `rainNotify.test.js` (kimlik yalnız 7700–7701; 7600–7607'ye dokunmaz),
  Nef paket testi (konum, hava, şehir, koordinat, görme sayısı, okuma hızı ve `screenHours` yok; `YOL.nef.md` T8 kalıbına
  `lat|lon|koordinat` eklenir; yol modüllerinin hepsi ve yoga `coach()` üretirken yoga pakette kalır ve paket 4.000
  baytın altındadır; v2 rızası, v1 rızası ile v2 reddi ve rızasızlık için üç ayrı paket, §C.5).
- **Tek hesap:** aynı kayıtlar Gelişim kartında, 5. gün raporunda, "Doktoruma göster" raporunda, dışa aktarmada ve Nef
  paketinde aynı sonucu verir (`verdict`; §B.5).
- **Alan yayı:** `who5` "down" ile `day-mood` "better" birlikteyken sonuç "down"dır; göz uyarısı ile herhangi bir
  "better" birlikteyken de "down"dır; yalnız metrik ve etkilerde "better" ile "worse" birlikteyken sonuç `null`dır (§B.4).
- **`day-check`:** tek bir ruh hâli dokunuşu hafta hedefini, seriyi, yolun `pathDay`'ini, yoganın giriş gününü ve okuma
  testinin zamanını değiştirmez; "N gün seninle" sayısını bir artırır (§D.5).
- **Yağmur bildirimi:** bildirim planı yeniden kurulunca 7700 iptal edilmez; yağmur tercihi ya da ana anahtar kapanınca
  iptal edilir; konum izni kapandıktan sonraki ilk açılışta bekleyen yağmur bildirimi iptal edilir; yağmur dokunuşu
  bildirim deneyinin günlüğünü ve `evaluate` çıktısını değiştirmez (§E.6).
- **Psikolog yedeği:** yol benzetimi ve `today.test.js` yoga bloğu, 10.00'da Zor Anlar İçin ve Kendine Şefkat'in yolda
  gelmediğini, 19.00'da Kendine Şefkat'in tam ders günlerinde geldiğini doğrular.

### H. Kalite kapıları ve "bitti" tanımı

**Her aşamada sırasıyla:** (1) tasarım Artifact'i iki temada, 390 ve 320 pt'de; (2) sahibin onayı; (3) kod ve testler;
(4) bütün takım yeşil ve eşdeğerlik 0 fark; (5) bağımsız iki inceleme (kod ve dil); (6) TestFlight; (7) cihaz listesi;
(8) sahibin cihazda bakışı.

**Metin kapısı:** ekrana ya da bildirime giren her cümle üç denetimden geçer: makine denetimi (yasak sözcük ve iddia
listesi, Nef satırındaki cümlelerde (günün cümlesi, olay satırı ve §C.4 şablonları) 70 karakter sınırı, "ekrandaki cümle =
söylenen cümle"; kanıt kartlarında karakter sınırı yoktur, sınır cümlesi zorunludur), birbirinden bağımsız iki model incelemesi (TDK yazımı,
anlatım bozukluğu, yüklemsiz cümle, çeviri kokan yapı) ve sahibin onayı. İnsan editör adı verilirse o da okur (onaylı
yoga planı karar 2'deki yedek kuralın aynısı).

**Kanıt kapısı:** her kaynak kartı yayından önce PubMed'de yeniden açılır; PMID ve DOI'si olmayan kart yayına girmez.
Kartta kanıtın türü, kişi sayısı ve sınırı yazar.

**Gizlilik kapısı:** gizlilik sayfası, App Store gizlilik etiketi, rıza metni ve "Tüm verileri sil" kapsamı değişen
özellikle **aynı sürümde** güncellenir; biri eksikse sürüm çıkmaz. İzin ve amaç metinleri yalnız o sürümde gerçekten var
olan kullanımı anlatır: kamera metnine Y3'te yalnız İlk Bakış'taki kırpma sayımı girer, kısa mesafe ölçümü (d) ile aynı
sürümde girer; konum metni koordinatın saklanmadığını söyler ve davranış bunu karşılar. Hukukçu soruları (KVKK m. 9 konum aktarımı, ruh hâli
verisinin sınıfı, coach rızası v2) cevaplanmadan konum izni ve Nef'e giden ruh hâli alanları App Store'a gönderilmez;
TestFlight denemesi beklemez. Hukukçunun adı Y4'ün cihaz kapısına (S5) kadar gelmezse §1'deki yedek uygulanır: Y5
yalnız şehir seçimiyle, Y6 ruh hâli alanları olmadan yayına girer; iki parça hukukçunun cevabıyla ayrı sürümde açılır.

**Apple kapısı:** App Review'dan WeatherKit atfının başlık satırına ve bildirime uygulanışı için yazılı cevap S0'da
istenir. Soruyu App Store Connect'ten sahip gönderir, metnini plan hazırlar. Cevap gelmeden başlıkta hava yoktur; hava
yalnız tam atıflı kartta görünür ve yağmur bildirimi "Kaynak: Apple Weather" satırını taşır.

**Cihaz listesi (örnekler; her madde `HATA_GUNLUGU`'na yazılır).** Her aşamada şunlara bakılır. Y1: yeni kurulumda
1., 2., 4. ve 9. gün; eski hesapta ilk açılış (merdivenin üstünde, çeşitleme 1. hafta yok); ara kilidinin 1. ve 2. günkü hissi ve yolu gün içinde ara vererek yapan kişide molanın başlayıp başlamadığı; V3 kırpma grubunun gerçek süresi
(≤ 75 sn); "2 dk daha". Y3: yeni kurulumda giriş ekranının yeni alt yazısı; sitenin ilk ekranı 390 ve 320 pt'de; sabah ilk açılışta cümle, gün içinde aynı cümle, ilk dokunuştan sonra eski satır; bir gün
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
| S0' | Tasarım Artifact'leri: Ana sayfanın ilk 5 saniyesi (iki tema, 390/320 pt), yol rozetleri, "Günün" sayfası, beş yüz, "Hava ve ay" kartı, sitenin ilk ekranı, Gelişim "Yolun" bölümü; App Review sorusunun metni (sahip gönderir); hukukçu soruları (sahip hukukçunun adını verir; yedek §1); `az-hareket` ve `goz-yorgun` kaynaklarının PubMed doğrulaması | Onaylı tasarımlar | **S1:** tasarımlar | yoga üretimiyle birlikte |
| — | *Yoga yayını (yoga Kapı 8)* | | | yoga planının onayından (29 Eylül) ≈ 7–12 hafta |
| Y1 | İlerleme motoru, merdivenler, açılma, ara kilidi | TestFlight | **S2:** cihazda 1., 2., 4., 9. gün ve eski hesap | 8–10 iş günü |
| Y2 | Ölçü kuralı v2, okuma, metinler, "Yolun" | TestFlight | **S3:** Gelişim cihazda | ≈ 5 iş günü |
| Y3 | İlk 5 saniye: giriş ekranı, site, günün ilk açılışı | TestFlight, site yayını | **S4:** ilk kurulum ve sabah ilk açılış cihazda | ≈ 4 iş günü |
| Y4 | Günün nasıl geçti, "Günün" sayfası, ay, kanıt kartları | TestFlight | **S5:** akşam akışı ve kart metinleri | ≈ 5 iş günü |
| Y5 | Hava, konum, yağmur bildirimi (Mac ve cihaz) | TestFlight, gizlilik sayfası, etiket | **S6:** izin, bildirim, atıf cihazda | 7–8 iş günü |
| Y6 | Nef haftalık, aylık, olay satırı; rıza v2 | TestFlight, sunucu yayını | **S7:** 30 soruluk Nef sınavı ve cihaz | 6–8 iş günü |
| Site | nefona.com: ilk yayından önce yanlış ve erken cümleler, gizlilik ve yayın hazırlığı; her modülün site parçası (modül cihazda bitince); en sonda tek gözden geçirme (§3.K) | Site yayını | **S8:** 5 saniye kapısı ve yabancı testi; sahibin canlı sitede bakışı | hazırlık ≈ 1–2, modül başına ≈ 0,5–1, son gözden geçirme ≈ 2 iş günü |
| sonra | (d) sessiz ölçüm; (e) uyku, yürüyüş, tepki, gökyüzü molası | kendi planları (`YOL.moduller.md`) | kendi kapıları | — |

Kod ≈ 35–40 iş günü; cihaz denemeleriyle ≈ 8–11 hafta; senin onay sürelerin buna dâhil değildir. Aşamalar sıralıdır, çünkü Y3
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
- **Etki iddiası yoktur.** Göz egzersizlerinin ekran yorgunluğuna etkisini gösteren doğrulanmış bir kayıt notlarda yok; nefes kalıpları arasında büyük fark yok;
  yavaş nefesin stres üzerindeki etkisi küçük–orta ve çalışmaların çoğunda yanlılık riski orta (Fincham 2023).
- **Ölçü kuralının parametreleri** yapay veriyle seçildi; klinik ya da yayımlanmış doğrulaması yok.
- **5 saniye stratejisinin** bu uygulamada kalmayı artırdığına dair veri yok; G1–G9 bunu ölçmek içindir.
- **Hava doğruluğu:** Türkiye için WeatherKit'in doğruluğunu bağımsız ölçen bir çalışma bulunamadı; Türkiye'de dakikalık
  yağış ve Apple'ın yağış bildirimleri yok.
- **Apple belirsizlikleri:** bir hava isteğinin kaç çağrı sayıldığı, atfın bildirimde ve başlıkta nasıl uygulanacağı,
  atıf görselinin önbelleğe alınıp alınamayacağı ve bekleyen bildirim sınırı belgelerde açık değildir.
- **Hukuk:** konumun yurt dışına aktarımı, ruh hâli verisinin sınıfı ve coach rızası v2'nin kapsamı hukukçuya sorulacak;
  uygulamanın bugünkü rıza metinleri de hukukçudan geçmedi (`lib/consent.js:6`). Yedek, hukukçu onayının yerini tutmaz.
- **WeatherKit saklama koşulu:** 90 günlük `sky-log`'un WeatherKit kullanım koşullarına uyup uymadığı notlarda
  doğrulanmadı; Y5 kapısında Apple Developer Program Lisans Sözleşmesi'nden okunacak.
- **Kaynak sınırları:** emoji ölçeğinin sıra uyumu 20 hastalık pilottan geliyor ve Türkçe genel toplulukta doğrulaması yok; gece ekranı kanıtı çocuk ve ergenlerden geliyor;
  Lally 2010 ve Silverman ve Barasch 2023 PubMed'de olmadığı için dayanak yapılmadı.
- **Nef'in model maliyeti** fiyat belli olmadığı için hesaplanamadı.

**VARSAYIM listesi:** açılma eşikleri (Yılan 1, görev 1, Fark Ettin mi? 5, Tek Bakışta 7); nefes katmanlarının D eşikleri 7, 21, 42 (yeni kullanıcıda 8., 22., 43. gün); nefes zarfının alt sınırı 4/dk; tutma süreleri ve haftalık sıklıkları; "Zorlandım"dan sonra 7 gün;
göz merdiveninin gün eşikleri ve V2–V4; `Dvar` hızı; göz grubunda 75 sn; ara kilidi kuralı; sıkıcılık kuralları; karışık
gün; ölçü kuralının parametreleri (alışma 1–2 gün, başlangıç 6 gün, son 3, c = 1,5, persist 2, SD tabanları); Pazartesi
bakışı; "karışık" alan hali; okumada art arda 2 test; olay satırının günde bir sınırı; günün cümlesinde 70 karakter ve
1 saat; seri eşiği 3 gün; okumada değişim eşiği ≥ 0,2 logMAR; ölçü kuralında "şimdi" penceresi 3 gün; Kendine
Şefkat'in yolda 17.00 sınırı (onaylı yoga planından); sitedeki işin süresi; sessiz ölçümde kameranın 3 sn hazır olma eşiği; "Sonra" = 2 saat; 03.59 kapanışı; etiketlerin
7. günde açılması; etiket gösterim eşiği 5 gün; düşük ruh hâli eşiği; 44 pt dokunma alanı; yağmur–ruh hâli
karşılaştırmasında 10 + 10 gün; hava önbelleği 60 dk; konum en çok saatte bir; yağmur eşiği %50 ve 0,5 mm; bildirim
saati ve 06.30–09.00 sınırı; 18 saat bayatlık; kişi başı günlük 8 istek; `sky-log` 90 gün; il merkezlerinin kaynağı;
evre adlarının sınırları; ΔT ≈ 69 sn; 64 bildirim sınırı; WeatherKit istek başına çağrı sayısı ve kişi başına günde ortalama 3 istek; RevenueCat panel
metrikleri; aşama süreleri ve takvim.

### K. nefona.com güncellemesi (son aşama)

Eklendi: 2026-09-30, sahibin isteğiyle (`SAHIP_ISTEKLERI.md`, "nefona.com güncellemesi"). K.7'deki üç soru aynı gün
cevaplandı. Dayanak: `site/`, `app/src`, `ACIK_ISLER.md` (`653a716`); taslak iki bağımsız eleştiriden (eksiklik, doğruluk) geçti.

#### K.1 İstek ve amaç

Sahibin sözü (kelimesi kelimesine):

> Bence yaptığını yeni işleri de en son plan eklemesliain Nefona.com sitesini güncellemelisin yeni özellikler ekledik
> yoga,  sonsuzluk , alarm , hava durumu vs gibi. Ama bunları modüller bittikten sonra görerek düzeltmen gerekiyor

**Amaç:** site uygulamanın bugün yaptığını anlatır; ne eksik ne fazla. Her cümlesi bir kayda dayanır: kodda `dosya:satır`,
PubMed kaydında PMID ve DOI ya da cihaz kaydı.

**Bugünkü durum (2026-09-30):**
- **Site yayında değil.** Yalnız yerelde (`npm run dev`, sahip Tailscale üzerinden bakıyor); Vercel projesi yok, alan adı
  alınmadı (30 Eylül'de boştaydı, 11,25 USD/yıl). Modül listesi, kaynakça, kanıt kartları ve Yenilikler uygulamadan
  üretilir (`site/scripts/data.mjs` → `site/src/data.json`).
- **Yoga `[~]`:** uygulamada yalnız Ders 2 · 15 dk yayımlı (`lib/yogaLessons.js:134`); ilk bölümün dört dersinin sesi sahip
  onaylı ama uygulamada değil; cihazda denenmedi. Site sayfalarında yoga yok, ama `data.mjs` manifestleri süzmeden aldığı
  için bir sonraki site derlemesi açıklamasız bir "Yoga" satırı ekler (`site/src/main.js` `MOD_DESC`'te yoga yok).
- **Sonsuz yol Y1 `[~]`:** kod bitti (`e71abe6`); ekranlar 5 saniye kapısını geçmedi (`Y1_5SN_SONUCLARI.md`), ana sayfa
  yeniden tasarlanıyor. Site Y1'in önünde: `site/pages/index.html:93-94` Y1 yolunu şimdiden anlatıyor.
- **Alarm `[~]`:** Build 59'da. Seçilen sesin çaldığı Build 59'dan önceki bir derlemede görüldü; `AlarmPlugin.swift` sonra
  1024 satır büyüdü ve derlenmedi, bir sonraki derlemede yeniden bakılır.
- **Hava `[ ]`:** kodu yok (plan Y5).

#### K.2 Tetik

- **Yeni bir özellik siteye ancak şu koşullarla girer:** TestFlight derlemesinde çalışır; cihaz listesi biter ve sahip
  cihazda baktıktan sonra `[x]` olur; App Store yayınından sonra ayrıca yayımlanan App Store sürümünde de vardır.
- **Planda olup yapılmamış iş girmez:** hava (Y5), Y2–Y6'nın yapılmamış kısımları, kalan altı yoga dersi, (d), (e).
  "Yakında" satırı yazılmaz; Apple 2.3.1(a) uygulamanın sunmadığı içeriğin "App Store içinde ya da dışında" tanıtılmasını
  yasaklar (`arastirma-v1/apple/guidelines.html`).
- **Sıra:** her modül ya da aşama cihazda bitince yalnız onun site parçası yapılır. En sonda, Y6 cihazda bitince bütün site
  bir kez baştan gözden geçirilir (K.4).
- **İstisna 1, beklemez:** bugünkü uygulamayı yanlış ya da erken anlatan cümleler ilk yayından önce düzelir (K.3 ilk satır).
- **İstisna 2, beklemez:** gizlilik sayfası, koşullar ve App Store gizlilik etiketi özelliğin `[x]`'ini beklemez; özelliği
  taşıyan derleme App Review'a girmeden önce yayında olur (Apple 2.3 ve 5.1.1(i)). Özelliğin anlatısı `[x]`'i bekler;
  App Store Connect'te "elle yayımla" seçilir ve sitenin özellik parçası aynı saatte açılır.
- **Bugün sitede anlatılan ama `[x]` olmayan işler** (haftalık E testi, veri merkezi, iris ve Gelişim, parlaklık) ilk
  yayında kalır (sahip kararı, K.7 soru 3). Tetik yalnız yeni özelliklere uygulanır.

#### K.3 Fark tablosu

| Özellik | Bugünkü site | Eklenecek ya da değişecek | Ne zaman |
|---|---|---|---|
| **Bugünkü site ve uygulama** | Aşağıdaki yanlış ya da erken cümleler | **Ana sayfa:** 20-20-20 bölümü "işe yaradı" ve "Nefona bu kuralı uygular" diyor (`index.html:58-59`); uygulamanın kendi kanıt notu tersini söylüyor (`components/RestBreak.jsx:10-13`, Johnson ve Rosenfield 2022) → bulgu diliyle, sınırıyla. "Sabah alarmı gün ışığına göre tasarlandı" (`:65`) kodda karşılıksız → çıkar. "Bir dakikalık nefesle gün başlar" (`:86`; sabah nefesi isteğe bağlı), "gözünü ışıkla yormaz" (`:98`, kaynaksız), "15 dakikalık yol" (`:2`, `:9`, `:81`) düzelir. Y1 (`:93-94`) ve (b) "önce ölçüm" (`nasil-calisir.html:15-16`) cümleleri kendi kapılarına kadar geri tutulur. **Yenilikler:** "sessiz modda da çalar" (28 Eylül) ve parlaklık (29 Eylül) cihazda doğrulanmadı; `2026-09-29-2` TestFlight'ta değil (K.4 adım 5). **Modüller ve Nasıl çalışır:** emekli "Nefes sayma" çıkar (`nasil-calisir.html:31` dahil); Gökyüzü molası 2 dk; giriş yolları (`nasil-calisir.html:16`: Google `[~]`, e-posta SMTP'siz çalışmıyor). **Sesler:** "önceden kaydedilmiş kadın ya da erkek sesi" ve "bestelendi" üretim yoluna göre (ElevenLabs; `lib/voicePack.js:1`, `lib/alarmSounds.js:4`); "ses için ağa çıkmaz" → "sesli yönlendirme için" (okuma testi konuşma tanıması kullanır). **Gizlilik (hukukçuyla):** mikrofon ve konuşma tanıma; "Tüm verileri sil"den sonra kalanlar; rıza cümlesi; hareket izni (rıza v2); RevenueCat; üçüncü taraflar (Apple konuşma tanıma, Google girişi, Nef'in model sağlayıcısı, SMTP); sitenin kendi verisi (tema `localStorage`'da, barındırma erişim kaydı); Nef satırına yoga sayıları. **Koşullar ve destek:** alarmın iOS 26 koşulu, en düşük iOS sürümü (15), dilin Türkçe olduğu. **Uygulama tarafı:** `Info.plist:12` "alarm sessiz modda da çalar" cihazda doğrulanmadı → alarm cihaz listesine | İlk yayından önce |
| **Yoga** | Sayfalarda yok | **Modüller:** açıklama; ad ekrandakiyle aynı ("Yoga" mı "Yoga ve Meditasyon" mu, tek ad seçilir); yalnız yayımlı dersler ve süreler. **Nasıl çalışır:** pratikler. **Bilim:** yayımlı dersin "Neye dayanıyor" satırı ve kaynakları PMID ve DOI'siyle, dersin sınır cümlesiyle ("alandaki çalışmaların çoğunun kalitesi düşük", `yogaLessons.js:105`); Sharpe 2023 (PMID 36731199) Ders 3 yayımlanınca. **Gizlilik:** yoga kayıtları, Nef'e giden dört sayı. **Koşullar:** güvenlik kartındaki uyarılar (`modules/yoga/text.js`). **Ses örneği:** kısa kesit, altında sesteki cümlenin aynısı (dersler abonelik arkasında; `public/yoga` Vercel'e gitmez) | Yayımlı dersler TestFlight'ta ve cihazda `[x]` olunca (yoga Kapı 4–5); her yeni ders kendi gününde |
| **Sonsuz yol Y1** | Yol görseli ve "Yol ilk gün 8 dakikadır ve her gün bir adım büyür." (`index.html:94`) | **Ana sayfa:** "Bir gün" ve "28 gün" bölümleri; 28. gün bir kilometre taşıdır, yol sonra da sürer. **Nasıl çalışır:** merdivenler, "2 dk daha", "Sonra yaparım", "Bugünün ritmi" (ekrandaki ad); sayı gerekirse "yüzlerce ritim" (230 bileşim). Görseller yeniden tasarlanan ana sayfa cihaza girince çekilir; Build 60'ın ara ana sayfasından çekilmez | Y1 S2 kapısı ve yeni ana sayfa cihazda `[x]` |
| **Alarm** | Sabah ve gece görselleri, modül açıklaması, kanıt kartı | Sabah akışının isteğe bağlı olduğu; kartın 12 kaynağı PMID ve DOI'siyle kaynakçaya (bugün `lib/evidence.js:97-110`'da düz metin); alarm günlüğü ve sabah cevabı gizliliğe. "Sessiz modda da çalar" cihazda doğrulanmadan yazılmaz | Alarm cihaz listesi bitince (yeni derlemede yeniden bakılarak); yoga sabah sorusu yogayla |
| **Y2 · Gelişim v2** | "En az 0,10 logMAR, doğrulanmış değişim" | Yeni ölçü kuralı ve "Yolun" bölümü; Gelişim görseli yeniden | Y2 S3 kapısı |
| **Y3 · sitenin ilk ekranı** | "Gözün değişiyor. Sen de gör." | Karar 5b: "Bu cümleyi okurken kaç kez göz kırptın?" (S0 kararları 21, Ç11, Ç12, Ç15); OG görseli yeniden üretilir | Y3 S4 kapısı |
| **Y4 · ay ve "Günün nasıl geçti"** | Yok | Akşamın tek dokunuşu; kartların kaynakları; ruh hâli verisinin telefonda kaldığı | Y4 S5 kapısı |
| **Y5 · hava, konum, yağmur** | Yok (kodu da yok) | Anlatı ve Apple Weather atfı; gizlilikte yaklaşık konum ve hava rızası; App Store etiketine "Yaklaşık konum"; "en doğru kaynak" yazılmaz | Gizlilik ve etiket App Review'dan önce (İstisna 2); anlatı Y5 S6 kapısında |
| **Y6 · Nef dönemleri, rıza v2** | Nef satırı rıza 1'i anlatıyor | Nef kartı; gizlilikte rıza v2 | Y6 S7 kapısı |
| **(b) ilk açılışta önce ölçüm** | `nasil-calisir.html:15-16` şimdiden anlatıyor | Geri tutulur, sonra aynı cümle | (b) cihazda `[x]` |
| **Kalan yoga dersleri, (d), (e)** | Yok | Kendi aşamaları bitince birer parça | Kendi kapıları |

#### K.4 Adımlar

**Bir kez, ilk parçadan önce:**
- **Veri hattı:** site TestFlight'a giden kayıttan derlenir, çalışma ağacından değil (Vercel'in Git bağlantısı yerine
  belirli bir kayıttan yayın ya da ayrı yayın dalı). `data.mjs` emekli modülleri (`retired`) ve yayımlanmamış dersleri
  süzer. Kaynaklar bugün üç yerde (`lib/sources.js`, `lib/evidence.js`, `lib/yogaLessons.js`); hat üçünü de okur, zamanla
  `sources.js`'te toplanır (ACIK_ISLER A9).
- **Ekran düzeneği:** site görsellerinin düzeneği depoda değil (karalama alanında `shotwt/app/_harness/`, yerelde
  `app/_harness/y1path.*`); depoya alınır. Y1'in düzeneği (`tasarim/Y1_5sn_duzenek/`) site görünümlerini de çekecek
  biçimde genişletilir. Web'de çekilemeyen yerel ekranlar (AlarmKit kilit ekranı, yoganın yerel oynatıcısı, WeatherKit)
  sahibin iPhone'undan ya da Mac'te Simülatör'den alınır. OG görselinin üreticisi ve WebP dönüştürücü depoya girer.
  Ölçüler tek tablo: telefon 390 × 844 ve 320 × 568, tablet 820, masaüstü 1280.

**Her parça için sırayla:**
1. **Ekran görüntüleri:** bitmiş modülden, TestFlight'a giden kayıttan; açık ve koyu, 390 ve 320 pt. Sahibin cihazındaki
   ekranla karşılaştırılır, fark varsa cihaz esastır. Alt metin görselle birlikte yeniden yazılır; örnek veriyle
   çekildiği yazar.
2. **Metin:** uygulamadaki cümlenin aynısı; iddiasız, bulgu diliyle. Ses örneğinin altındaki yazı sesteki cümlenin
   aynısıdır. Her cümle §3.H metin kapısından geçer.
3. **Bilim:** her kaynak PubMed'de yeniden açılır; PMID, DOI, çalışmanın türü, kişi sayısı ve sınırı yazılır. Yalnız
   yayımlı içeriğin kaynakları görünür; kaynak ve kart sayıları veriden basılır.
4. **Gizlilik:** gizlilik sayfası = App Store gizlilik etiketi = rıza metni = "Tüm verileri sil" kapsamı; hukukçu onaylar,
   hukukçu yoksa §1'deki yedek. Kamera görüntüsünün telefondan çıkmadığı cümlesi her sürümde doğru kalır.
5. **Yenilikler:** uygulamanın sürüm notundan madde çıkarılmaz (Bug 31 kuralı; Apple 2.3.12 yeni özelliklerin "What's New"da
   yazılmasını ister). Süzme sitede yapılır: site yalnız cihazda `[x]` olan maddeleri basar; sayfadaki "uygulamadaki
   listenin aynısı" cümlesi buna göre değişir. 28 Eylül maddeleri yeni girdiye taşındığında sitede iki kez görünmez.
6. **Mağaza uyumu:** App Store açıklaması, alt başlık, "Bu sürümdeki yenilikler" ve mağaza ekran görüntüleri site ile aynı
   gün güncellenir (Apple 2.3, 2.3.3, 2.3.7). Depodaki tek mağaza belgesi eski (`app/docs/APP_STORE_KURULUM.md`: "Eyelume",
   iki ürün); ilk gönderimden önce yenilenir.
7. **5 saniye kapısı:** beş bağımsız değerlendirici (birbirini ve ürünü görmemiş); değişen bölüm ve sitenin ilk ekranı,
   iki temada, telefon ve masaüstü ölçülerinde. Çoğunluk "etkilendim" demezse sahibe gitmez. Ayrıca yabancı testi (beş
   soru, `YAPILACAKLAR.md` site bölümü).
8. **Sahibe onaya:** iki temada, iki genişlikte; 5 saniye sonuçlarıyla.
9. **Yayın** (ilk kez): alan adı → gizlilik sayfası yayında → adres uygulamaya verilir (`VITE_PRIVACY_URL`; bugün boş, bu
   yüzden ödeme ekranında, hesap ekranında ve rıza kartında gizlilik bağlantısı hiç çizilmiyor) → gönderilecek derleme.
   App Store Connect'te gizlilik, destek (zorunlu) ve pazarlama adresleri. `destek@nefona.com` iki iştir: gelen posta
   (MX ya da yönlendirme) ve giden posta (Resend alan adı doğrulaması; Supabase e-posta girişi buna bağlı). Kullanım
   koşulları: Apple'ın standart sözleşmesi mi Nefona'nın koşulları mı (hukukçu). "Taslak" etiketleri, veri sorumlusunun
   unvanı ve adresi, `www` yönlendirmesi, Türkçe 404 sayfası, `robots.txt`, `sitemap.xml`, geri alma yolu; "yakında App
   Store'da" yerine rozet ve bağlantı. Yayından sonra canlı adreste 390 ve 320 pt'de son bakış.

**En sonda, bir kez:** Y6 cihazda bitince sitenin sekiz sayfası baştan okunur; her cümle bir kayda bağlanır, bağlanamayan
çıkar. İki temada, 320, 390, 820 ve 1280 genişlikte taşma, kırık bağlantı ve kullanılmayan görsel kalmaz (bugün
`acuity-*` ve `sleep-*` hiçbir sayfada yok). Ardından adım 7–9.

#### K.5 "Bitti" tanımı

Site bölümü ancak hepsi doğruysa `[x]` olur:
- Sitedeki her özellik yayındaki derlemede var ve cihazda `[x]`.
- Her ekran görüntüsü o derlemeden; açık ve koyu, 390 ve 320 pt; alt metni görselle aynı.
- Her bilimsel cümle PMID ve DOI'si olan bir kaynağa bağlı. Sözcük taraması (tedavi, iyileştirir, önler, korur, uyutur,
  kanıtlanmış, garanti, teşhis) olumlu ve kaynaksız kullanımda 0 bulur; olumsuzlanan uyarılar ("Tanı koymaz, tedavi
  etmez"), "Yapmadığımız iddialar" listesi ve kaynaklı kanıt kartları ayrı sayılır.
- Gizlilik sayfası, App Store etiketi, rıza metni ve uygulama arasında fark yok.
- Site ile mağaza sayfası aynı şeyi anlatıyor.
- Erişilebilirlik: klavyeyle kullanılabilir; iki temada kontrast ölçülüp kayda geçti; %200 yakınlaştırmada taşma yok; ses
  düğmelerinin adları hangi sesin çalacağını söylüyor; ses kendiliğinden çalmıyor, yazısı görünür; Hareketi Azalt
  korunuyor.
- 5 saniye kapısında çoğunluk "etkilendim" dedi; yabancı testinde beş sorunun beşi cevaplandı.
- Sahip canlı sitede baktı ve onayladı.

#### K.6 Yapılmayacaklar

- **Sağlık iddiası yok;** kaynaksız mekanizma yazılmaz.
- **Olmayan özellik gösterilmez:** yayımlanmamış ders ya da süre ("10 ders"); Y2–Y6'nın yapılmamış işleri ve hava;
  "yakında"; cihazda doğrulanmamış yeni cümle ("sessiz modda da çalar"; bugünkü `[~]` işler K.2'deki sahip kararıyla
  kalır); "yeni duraklar zamanla açılır" gibi
  ucu açık vaat (yol 9. günde tamamlanır, sonrası çeşitlemedir).
- **"Sonsuz" ürün adı olarak kullanılmaz:** uygulamanın arayüzünde geçmiyor; sınırsız içerik vaadi gibi okunur.
- **Sahte görüntü yok:** maket, çizim ya da başka sürümün görüntüsü gerçek ekran diye konmaz.
- **Fiyat ve karşılaştırma yok:** App Store'dan önce fiyat yazılmaz; "en doğru kaynak" gibi karşılaştırma yapılmaz.
- **Sitede kamera, ölçüm, izleme ya da analiz kitaplığı yok;** eklenirse gizlilik sayfası değişir, bu ayrı karardır.
- **İngilizce site İngilizce uygulamadan önce açılmaz** (sunulmayan dili tanıtır).

#### K.7 Sahibin kararları (2026-09-30)

1. **Site ilk kez ne zaman yayına çıksın?** → **İlk App Store derlemesinden önce**, yalnız doğrulanmış içerikle (gizlilik,
   koşullar, destek dâhil); sonra her modül bitince kendi parçası eklenir. Gerekçe: App Store gönderimi bir gizlilik adresi
   ister ve bu adres derlemeye gömülür.
2. **Alan adı ne zaman alınsın?** → **Yayın günü** (bugünkü kural sürer). Sonuç: alan adı, sitenin ilk yayın günü, yani ilk
   App Store derlemesinden önce alınır; gizlilik adresi, destek e-postası, Google izin ekranı ve Resend doğrulaması o gün
   bağlanır.
3. **Bugün sitede anlatılan ama cihazda `[x]` olmayan işler ilk yayında kalsın mı?** → **Hepsi kalsın** (haftalık E testi,
   veri merkezi, iris ve Gelişim, parlaklık). K.2'deki tetik yalnız yeni özelliklere uygulanır. Yanlış cümleler (K.3 ilk
   satır) yine düzelir.

---

## Kaynaklar

**PubMed (notlarda PubMed kaydıyla doğrulandı, 2026-09-29)**

| Kaynak | PMID | DOI | Bu planda |
|---|---|---|---|
| Laborde 2022, Neurosci Biobehav Rev | 35623448 | [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711) | nefes zarfı |
| Fincham 2023, Sci Rep | 36624160 | [10.1038/s41598-022-27247-y](https://doi.org/10.1038/s41598-022-27247-y) | etkinin büyüklüğü |
| Balban 2023, Cell Rep Med | 36630953 | [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895) | 5 dk Ana sayfada; `nefes-gunu` kartı |
| Van Diest 2014, Appl Psychophysiol Biofeedback | 25156003 | [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x) | veriş ≥ alış |
| Birdee 2023, Complement Ther Med | 36871835 | [10.1016/j.ctim.2023.102937](https://doi.org/10.1016/j.ctim.2023.102937) | kalıplar arası fark küçük |
| Marchant 2025, Appl Psychophysiol Biofeedback | 39864026 | [10.1007/s10484-025-09688-z](https://doi.org/10.1007/s10484-025-09688-z) | 6/dk kalp ritmi değişkenliğinde kutu ve 4-7-8'den yüksek; ruh hâlinde fark yok |
| You 2021, Int J Environ Res Public Health | 34203020 | [10.3390/ijerph18126630](https://doi.org/10.3390/ijerph18126630) | ilk yavaş nefeste algılanan stres (kısa başlangıç VARSAYIM) |
| Elia 2024, Am J Physiol Regul Integr Comp Physiol | 38314699 | [10.1152/ajpregu.00260.2023](https://doi.org/10.1152/ajpregu.00260.2023) | hızlı soluma yasağı |
| Badrov 2016, Am J Physiol Heart Circ Physiol | 27542408 | [10.1152/ajpheart.00334.2016](https://doi.org/10.1152/ajpheart.00334.2016) | tutmada ihtiyat |
| Singh 2022, Ophthalmology | 35597519 | [10.1016/j.ophtha.2022.05.009](https://doi.org/10.1016/j.ophtha.2022.05.009) | incelenen tedavilerde yüksek kesinlikte kanıt yok (egzersiz kapsam dışı) |
| Kim 2020, Cont Lens Anterior Eye | 32409236 | [10.1016/j.clae.2020.04.014](https://doi.org/10.1016/j.clae.2020.04.014) | kırpma |
| Wolffsohn 2025, Cont Lens Anterior Eye | 40467388 | [10.1016/j.clae.2025.102453](https://doi.org/10.1016/j.clae.2025.102453) | kırpma tekrarı; bırakınca kayıp; `kirpma-gunu` kartı |
| Talens-Estarelles 2022, Cont Lens Anterior Eye | 35963776 | [10.1016/j.clae.2022.101744](https://doi.org/10.1016/j.clae.2022.101744) | uzağa bakış; `uzaga-bakis` kartı |
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
| Denissen 2008, Emotion | 18837616 | [10.1037/a0013497](https://doi.org/10.1037/a0013497) | hava ve ruh hâli |
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

---

## İnceleme izi

**Tur 1 (2026-09-29).** İki inceleme (sahip ve kod; sayı ve dil), 42 bulgu. Yedek: `_plan_yedek_tur1.md`; benzetim
betiğinin eski hâli `_sim_merdiven_yedek_tur1.mjs`. Her bulgu kaynağından doğrulandı; PubMed özetleri 14 kayıt için
yeniden açıldı. Yeni betikler: `sim_kural_esit.mjs`, `_tur1_varyant.mjs`, `sayim_nefes.mjs`; `sim_merdiven.mjs`'e
psikolog yedeği eklendi. Aşağıda "SK" sahip ve kod, "SD" sayı ve dil incelemesidir.

| # | Önem | Bulgu | Doğrulama | Yapılan |
|---|---|---|---|---|
| SK1 | BLOCKER | Psikolog yedeği uygulanmıyor | Doğru: `yoga-pilot/SAHIP_ISTEKLERI.md` madde 7 (2), (5); `PLAN.v3.md:154-156`; eski benzetim 5. gün Zor Anlar İçin, 18. gün Kendine Şefkat veriyordu | Benzetime yedek eklendi (10.00 ve 19.00, 30 ve 90 gün yeniden koşuldu; gün sayıları ve süreler değişmedi, dersler değişti). §1, §2.3 (yeni madde), §A.9 tablosu ve notu, §G.6 |
| SK2 | BLOCKER | İlk kez açan kişi ve site ele alınmıyor | Doğru: `tasarim/SAHIP_ISTEKLERI.md:17-19, 35-36`; `YAPILACAKLAR.md:76`; K8 "şimdi değişmez" diye kapatılmıştı | Yeni §3.F.2 (uygulama ve site, bugün ve önerilen); karar 5 genişledi (a–f, net öneri); §1 tablo satırı; §2.2 K8 sahibe; Y3, §G.3, §H, §I |
| SK3 | BLOCKER | %27 ile %7 farklı sürelerde | Doğru: `sim.mjs` N = 78, `sim2.mjs` yalnız ilk 13 hafta | Aynı süreyle yeniden benzetildi (`sim_kural_esit.mjs`): 26 haftada %27,2 → %13,0; "bugünkü + haftalık + iki hafta" %11,5; yakalama ile değişim yokken işaret ayrı sütunlarda; uzun geçmiş ve alışma senaryoları eklendi. §B.3, §1, karar 2 gerekçesi yeniden yazıldı; parametreler korundu, "şimdi" penceresi seçeneği yazıldı |
| SK4 | BLOCKER | 10.000 kişide "ücret yok" yanlış | Doğru: 900 bin çağrı 500 bini aşar (`hava-ay.md:86-87, 459-466`) | §1 Maliyet: 49,99 ya da 249,99 USD; iki varsayım ve 8 isteklik en kötü durum yazıldı; `hava-ay.md` §10 düzeltmesi §2.4'e |
| SK5 | SHOULD | Rapor ve dışa aktarma eski hükmü yazar | Doğru: `lib/exportData.js:117, :139, :266`; `ProgressOverview.jsx:463`; `FirstReport.jsx:57-59` | §B.5 "Tek hesap": `metricCards` → `verdict`; bütün okuyucular sayıldı; Yöntem metni yazıldı; §G.3 Y2, §G.6 test |
| SK6 | SHOULD | `day-check` hafta hedefini ve yoga sayacını şişirir | Doğru: `lib/stats.js:204`, `Home.jsx:150-151, :172`, `lib/today.js:140` | §D.5'te sayı sayı karar; `isExerciseSession` dışlar; yola süzülmüş `sessions` gider (`today.js`'e kural eklenmez); §G.3 Y4, §G.6 test |
| SK7 | SHOULD | Yağmur bildirimi bir sonraki planlamada silinir | Doğru: `lib/notifyApply.js:14-20, :90-97`; `App.jsx:478-513`, `:507` | §E.6 "Tek plan": `rainNotify.js` yalnız nesne üretir, `App.jsx` plana ekler; ana anahtar kuralı; §G.3 Y5, §G.6 test |
| SK8 | SHOULD | Ara kilidi ve Bugünün görevi eşdeğerlikte sınanmıyor | Doğru: `Home.jsx:165-170`, `notice/manifest.js:31` | Yeni kural yalnız ilerleme açıkken ve 1. bölüm payı altındayken; `restDecision` saf işlev; iki karar eşdeğerlik düzeneğinde; §A.7, §A.8, §2.2, §G.3, §G.6, §H |
| SK9 | SHOULD | İzin metni "kaydedilmez" diyor, plan konumu saklıyor | Doğru | Koordinat hiç saklanmaz (§2.1 satır 24); izin metni ve rıza "Ne kadar" satırı davranışa uyduruldu; silme ilk açılışta; §1, §E.2 |
| SK10 | SHOULD | Nef paket v2 site tablosunda ve etikette yok; `screenHours` sürer | Doğru: `site/gizlilik.html:59-60`, `site/pages/gizlilik.html:32-33`, `coach.js:24`, `coachCore.js:79` | `screenHours` ve okuma hızı paketten çıkar; coachLife metni; §1, karar 6, §C.5, §G.3 Y6 |
| SK11 | SHOULD | Onaylı sıra (a)→(g) sessizce değişiyor | Doğru: `YAPILACAKLAR.md:67-70, 77-79` | Karar 1 açık seçim oldu (öneri ve öbür seçenek); §1'de sıra notu ve "iki sapma" paragrafı; §2.1 satır 23 (14. gün tam set) |
| SK12 | SHOULD | "Bu modül bir şey ölçmez" altın kuralla çelişiyor | Doğru: `tasarim/SAHIP_ISTEKLERI.md:30` (bulgu :31 diyor, satır bir kaymış) | Ekran cümlesi "Bu modülde düzenini izliyoruz…" oldu; §1 "etki ölçüsü olmayan"; §G.2 madde 3 |
| SK13 | SHOULD | Nefes 3 dk'ya 4. değil 3. gün çıkar | Doğru (§A.4, §A.9, benzetim) | §F.5 düzeltildi |
| SK14 | SHOULD | Kamera metnine var olmayan (d) kullanımı | Doğru | Y3'te yalnız İlk Bakış sayımı; (d) kendi sürümünde; §1, §2.2 K9, §G.3 Y3, §H gizlilik kapısı |
| SK15 | NIT | §A.7 cümlesi E testi ve okumayı yolda değil gösteriyor | Doğru | Cümle önerilen biçimle yeniden yazıldı |
| SK16 | NIT | Ay örneği yanlış simge ve ad | Doğru: `moontest.mjs` %91,1, açı 214,5; `hava-ay.md:279` | "küçülen şişkin ay", simge evreye göre; evre adları §E.3'e |
| SK17 | NIT | Gökyüzü molası yeni modül sayılıyor; kart adı karışıyor | Doğru: `modules/gokyuzu/manifest.js:1` | "(e) ile yola girer"; hava kartının adı her yerde "Hava ve ay" |
| SK18 | NIT | PLAN.v3 (c) sayıları ile fark açıklanmıyor | Doğru: `PLAN.v3.md:452-456` | §2.3'e açıklama cümlesi |
| SK19 | NIT | Test sayısı eski | İnceleyicinin koşusuna dayanıldı (bu turda yeniden koşulmadı) | §G.5: 103 dosya, 1417 test, tarihli |
| SK20 | NIT | §1'de yüklemsiz ve kod kokan cümleler | Doğru | Hava rızası, bileşim sayıları ve emoji satırı önerildiği gibi yazıldı |
| SD1 | BLOCKER | Aynı süre karşılaştırması (SK3 ile aynı) | Doğru; inceleyicinin sayıları (%12,6 / %35,4; 13 haftada %20,4 / %50,8) bu turun betiğiyle ±0,5 puan içinde tekrarlandı | SK3'teki düzeltme; §3.B.3 tablosu 13 ve 26 haftalık sütunlarla; "en az bir kez"; `gelisim-nef.md` §4.2 düzeltmesi §2.4'e |
| SD2 | BLOCKER | WeatherKit maliyeti (SK4 ile aynı) | Doğru | SK4'teki düzeltme |
| SD3 | BLOCKER | Thompson 2025 yanlış aktarılmış | Doğru (PubMed özeti: 20 hastalık pilot %95; 294 hastada r = 0,70) | §D.3 ve §J düzeltildi; `gunun.md` düzeltmesi §2.4'e |
| SD4 | BLOCKER | İzin metni saklama kuralıyla çelişiyor (SK9 ile aynı) | Doğru | SK9'daki düzeltme; öneri metni "koordinat saklanmaz" seçimiyle uyarlandı |
| SD5 | SHOULD | 99 ve 629'un etiketi ve yöntemi yanlış | Doğru: tutma ve bekleme 1 sn adımla; sayılar birikimli | `sayim_nefes.mjs` eklendi (40 / 99, 59'u tutmalı / 629, 472'si beklemeli); §A.4 tanımı; §1'de "yüzlerce bileşim"; `merdiven.md:217` notu §2.4'e |
| SD6 | SHOULD | Nefes 3. gün (SK13 ile aynı) | Doğru | SK13'teki düzeltme |
| SD7 | SHOULD | "Haftada bir basamak" formülle uyuşmuyor | Doğru: V1–V4 7, 14, 28, 42 çalışma günü | §1, §2.2, §A.2 yorumu, §A.10 |
| SD8 | SHOULD | "Artıyor / düşüyor" düşük-iyi metriklerde ters; "son 28 gün" yanlış | Doğru: Hızlı Bakış ms (düşük iyi); başlangıç bir kez kurulur | §B.5 metinleri `better` yönüne bağlandı; görev notu; karar 2 ve sürüm notu yeniden yazıldı; §C.4 ve §F.4 cümleleri |
| SD9 | SHOULD | Ay kartı genellemesi kanıtla uyuşmuyor | Doğru (PubMed: Chaput ≈ 5 dk; Haba-Rubio alt grup p = 0,06; Benedict büyüyen ay) | Kart metni ve §E.5 önerilen biçimde; Chaput kaynak satırına girdi ("beş kaynak"); `hava-ay.md` notu §2.4'e |
| SD10 | SHOULD | Cui 2024 kültürler arası değil | Doğru (PubMed özeti) | Karar 3 ve §D.3 |
| SD11 | SHOULD | Wrzus, Gertler, Killgore yanlış aktarılmış | Doğru (PubMed özetleri) | §D.3: "ölçüm sayısı"; tek madde "geçerli", örneklemleriyle |
| SD12 | SHOULD | Kısa gece kartında sınır ekranda yok; 6 sa yatakta | Doğru; ama önerilen "6 saat yatakta kalan 48 yetişkin" de yanlış: 48 kişi dört gruba bölünmüştü | Kart metni sınır cümlesiyle; "sağlıklı yetişkinler", sayı ekranda yok; kanıt sütununda açıklama |
| SD13 | SHOULD | §1'de olgu ve anlatım kusurları (7 madde) | Doğru | Yedisi de önerilen biçimle ya da ona yakın düzeltildi |
| SD14 | SHOULD | Tablo hücrelerinde anlatım bozukluğu (4 madde) | Doğru | Dördü de düzeltildi |
| SD15 | SHOULD | Karar 3, 5, 6'da yüklemsiz ve çift anlamlı cümleler | Doğru | Üç karar yeniden yazıldı |
| SD16 | SHOULD | Takvim cümleleri çelişiyor | Doğru | §1 ve §I aynı cümle; yoga cümlesi yoga planının onayına bağlandı; Y3'e site eklendiği için kod ≈ 35–40 iş günü |
| SD17 | SHOULD | Günün cümlesi şablonlarında bozukluk | Doğru | §F.4 ve §C.4 şablonları önerilen biçimle |
| SD18 | SHOULD | Gece ekranı kartı yanlış okunabiliyor | Doğru (PubMed: "shortened duration and delayed timing") | Kart metni önerilen biçimle |
| SD19 | NIT | Keller, Mazeas, Klasnja güçlü/zayıf aktarılmış | Doğru (PubMed özetleri) | §F.4 ve §F.6 düzeltildi |
| SD20 | NIT | Ay kontrol değeri ve simge | Doğru | §E.3: %91,1 ve %91,2, ±1 puan; SK16 ile birlikte |
| SD21 | NIT | Yazım: KVKK'daki, dâhil, belirsiz ifadeler | Doğru | Belgenin tamamında düzeltildi |
| SD22 | NIT | Okuma eşiği 0,2 logMAR VARSAYIM değil | Doğru (PubMed: ±0,12) | §B.6 ve §J VARSAYIM listesi |

**Tur 2 (2026-09-29).** İki inceleme (sahip ve kod; sayı ve dil), 45 bulgu (2 BLOCKER, 29 SHOULD, 14 NIT). Yedek:
`_plan_yedek_tur2.md`. Kod satırları çalışma ağacında yeniden okundu; PubMed özetleri 10 kayıt için yeniden açıldı
(Singh 2022, Michie 2009, Wrzus 2022, Bartels 2010, Elia 2024, Casiraghi 2021, Smith 2017, Balban 2023, Wolffsohn
2025, Talens-Estarelles 2022). Yeni betik: `_tur2_kart_sayim.mjs`; inceleyicinin `_rev2_walk.mjs`'i koşuldu (30 günde en uzun 20, ortalama
17,1). "T2K" sahip ve kod, "T2D" sayı ve dil incelemesidir. Bulguların hiçbiri yanlış çıkmadı; ikisinde düzeltme
önerilenden farklı yapıldı (T2K8, T2K12).

| # | Önem | Bulgu | Doğrulama | Yapılan |
|---|---|---|---|---|
| T2K1 | BLOCKER | Karar 2 v2'nin bedelini göstermiyor | Doğru: §3.B.3 tablosu %99,8 / %51,9 (`sim_kural_esit.mjs`) | Karar 2'ye "Bedeli de var" cümlesi ve önerinin gerekçesi (son haftalardaki değişim); §1 tablosunun ilk satırına "Bedeli" |
| T2K2 | SHOULD | §G.4 eksik, §G.5 yanlış | Doğru: `registry.test.js:8` birebir liste; `profileQuestions.test.js:43-55`, `:75`; `dataHub.test.js:96` | §G.4'e `registry.test.js:8`, `profileQuestions.test.js:43-55` ve `:75`; `verifiedChange` `verdict ?? status` okur, `:96` ve `:98-100` aynen geçer; §G.5 kayıtlı istisnalarla yeniden yazıldı (`:56-63` stres testi değişmez) |
| T2K3 | SHOULD | "Karışık" kuralı WHO-5 düşüşünü örtüyor | Doğru: `lib/dataHub.js:141-146` | §B.4: WHO-5 "down" göz uyarısı gibi önceliklidir; §G.6'ya "Alan yayı" testi |
| T2K4 | SHOULD | 10 modül sınırında yoga düşer | Doğru: `coachCore.js:44`, `coach.js:67-78`, `registry.js:159`; bugün 8 `coach()` | Seçenek (1): sınır 16, paket 4.000 baytta; §2.1 satır 21, §C.5, §G.3 Y6, §G.6 Nef paket testi |
| T2K5 | SHOULD | Nefes katmanları `D` ile açılıyor | Doğru | §A.4 eşik sütunu (Ç-B/C/D `Dvar`), açıklama maddesi; §A.10, §1, §2.2 merdiven 6 ve 8; `progression.test.js` sınaması |
| T2K6 | SHOULD | Eşdeğerlik yalnız ilerleme kapalıyken | Doğru | §G.6'ya "İlerleme açık, eski kullanıcı" kolu: D ≥ 60, izinli fark listesi, `restDecision` |
| T2K7 | SHOULD | Yağmur bildirimi deneyi karıştırır | Kısmen: yağmur zardan bağımsız olduğu için karşılaştırmayı bir yöne çekmez; ama plan bunu yazmıyordu. `App.jsx:183` dokunmayı yalnız `NUDGE_TYPES` için kaydediyor | §E.6'ya "Bildirim deneyiyle ilişki" maddesi (yağmur dokunuşu deney günlüğüne girmez, G8'in `rain` kolu); `rainNotify.test.js` ve §G.6 |
| T2K8 | SHOULD | Hukukçu ve App Review sahibin üstünde, yedek yok | Doğru: `lib/consent.js:6` | §1'e "Senden istenen iki iş" ve yedek; §H gizlilik ve Apple kapısı, §I S0', §J. Önerilen "KVKK standart sözleşme" yedeği alınmadı: Apple ile böyle bir sözleşmenin yapılabildiği notlarda yok; yedek, belirsiz parçayı (konum izni, ruh hâli alanları) bekletmektir |
| T2K9 | SHOULD | Kanıt kartı sıklığı söylenmiyor, düşük | Doğru: yalnız `dolunay` ile 30 akşamda 1 kart (`_tur2_kart_sayim.mjs`) | §D.4'e üç yol kartı (Balban 2023, Wolffsohn 2025, Talens-Estarelles 2022; PubMed'de yeniden açıldı) ve sıklık (30 akşamda 14–15); §1 tablo ve 30. gün |
| T2K10 | SHOULD | Hava görünür değil | Doğru | §E.7 "Görünür giriş" (7. günden sonra, ilk dokunuştan sonra tek seferlik teklif); tarih satırında ›; §D.3, §E.2, §1, §G.3 Y5 |
| T2K11 | SHOULD | §F.3 karar harfleri yanlış | Doğru | T2K12'deki yeni harflerle düzeltildi (logo 5c, seri 5d, pencereler §2.2 K4); belge boyunca "karar 5" göndermeleri denetlendi |
| T2K12 | SHOULD | Karar 5'te karar gerektirmeyen maddeler | Doğru: `screens/Home.jsx:256` (bulgu :246 diyor) | Karar 5 dört maddeye indi ve harfler yeniden verildi: (a) giriş, (b) site, (c) logo, (d) seri. Eski (c) ve (f) ile karar 6'nın rızasız cümle parçası "Bilgi (karar değil)" paragrafına geçti; §2.2 K4 plan kararı; açık soru sayısı 11 → 10 |
| T2K13 | SHOULD | v2'yi reddedene ne gideceği yok | Doğru: `lib/consent.js:3-5` | §C.5'e kural (v1'in kalan alanları; yeni alanlar yalnız v2 ile); `gunun` `coach()` Y4'te `null`; karar 6, §1 gizlilik, §D.5, §G.3 Y6, §G.6 |
| T2K14 | NIT | Sorularım satırları "akşam sorulacak" | Doğru: `lib/profileQuestions.js:228-230` | §D.3 ve §G.3 Y4 |
| T2K15 | NIT | Y1 `lib/yoga.js`'e gereksiz dokunuyor | Doğru | §2.3 ve §G.3 Y1: dokunulmaz, taşıma ayrı iş |
| T2K16 | NIT | İzin metni `sky-log`'u saymıyor; WeatherKit saklama koşulu | Doğru | §E.2 izin metni ve rıza "Ne kadar"; §E.7 ve §J'ye lisans okuması |
| T2K17 | NIT | Marchant 2025 fazla güçlü | Doğru (PubMed özeti) | §2.2, §A.4, §A.5, Kaynaklar |
| T2K18 | NIT | Program günü ve site eskir | Doğru: `lib/breath.js:16`, `:277-294`; `site/pages/index.html:93-94` | §1 "Bugünkü kullanıcı"; §G.3 Y1 ve Y4 |
| T2D1 | BLOCKER | Singh 2022'ye olmayan iddia | Doğru (PubMed özeti; `merdiven.md:482`) | §A.6, §J, Kaynaklar önerilen biçimle |
| T2D2 | SHOULD | Karar 2 bedeli (T2K1 ile aynı) | Doğru | T2K1 |
| T2D3 | SHOULD | "Gören kişi iner" ve benzetim çerçevesi | Doğru | Belge başı, §1 tablo, karar 2 |
| T2D4 | SHOULD | Marchant (T2K17 ile aynı) | Doğru | T2K17 |
| T2D5 | SHOULD | You 2021 kısa başlangıcı sınamadı | Doğru (`merdiven.md:479`) | §2.1 satır 1 (VARSAYIM), Kaynaklar |
| T2D6 | SHOULD | "Birkaç dakika ile 20 dakika" aralığı kaynaksız | Doğru (PubMed: Casiraghi sayı vermiyor) | §E.5 önerilen biçimle |
| T2D7 | SHOULD | Cui 2024 WeChat emojisi | Doğru (`gunun.md:185`) | Karar 3 ve §D.3 |
| T2D8 | SHOULD | Gün numarası ile D eşiği karışıyor | Doğru | §1, §2.2, §A.5, VARSAYIM listesi |
| T2D9 | SHOULD | Eski kullanıcıda nefes cümlesi yanlış | Doğru; formülle denetlendi (güncelleme günü `Dvar` = 14; 21 için 7, 42 için 28 çalışma günü) | T2K5 ile birlikte |
| T2D10 | SHOULD | "Yüzlerce bileşim" her dönemde doğru değil | Doğru (`sayim_nefes.mjs`) | §1 tablo |
| T2D11 | SHOULD | Karar harfleri (T2K11 ile aynı) | Doğru | T2K11–T2K12 |
| T2D12 | SHOULD | Karar 1'de iyelik eki ve tırnak | Doğru | Karar 1 önerilen biçimle |
| T2D13 | SHOULD | (d) sessiz ölçüm listede yok | Doğru | §1 sıra paragrafı ve karar 1 |
| T2D14 | SHOULD | Nef satırı yüklemsiz, "her sabah" yanlış | Doğru | §1 tablo önerilen biçimle |
| T2D15 | SHOULD | "Yapısı aynı kalır" ve "ona" | Doğru | §1 ilk paragraf ve tablo |
| T2D16 | SHOULD | Site metninde nesne eksik | Doğru | §F.2 |
| T2D17 | SHOULD | `gece-ekran` kartında "çalışmaların" belirsiz | Doğru (PubMed 25193149, tur 1) | §D.4 önerilen biçimle |
| T2D18 | SHOULD | 70 karakter ve "tek sayı" kendi örneklerine uymuyor | Doğru (sayım: 93, 77, 66 karakter) | §H sınırı yalnız Nef satırına; §F.4 "tek iddia"; §C.4'te iki şablon kısaldı (63 ve 66 karakter); §F.4'ün 7. örneği tek iddiaya indi |
| T2D19 | NIT | E testi ve okuma günleri, 90+ ortalaması, "üçü de" | Doğru | §1, §2.3, §A.9 |
| T2D20 | NIT | "İlk dokuz gün" | Doğru | §1 |
| T2D21 | NIT | Aralar satırı 1. ve 2. gün | Doğru | §1 tablo |
| T2D22 | NIT | Giriş ekranı cümlesi | Doğru | Karar 5a ve §F.2 |
| T2D23 | NIT | "Binlerce kişi" | Doğru (PubMed: 1.411, 2.125, 5.812) | §E.5 kart metni; Smith 2017'de ölçülen "yatakta geçen süre" |
| T2D24 | NIT | Wrzus, Michie, Bartels, Elia aktarımı | Doğru (PubMed özetleri) | §D.3, §B.6, §B.2, §A.5 |
| T2D25 | NIT | Yürüyüş satırının betiği yok | Doğru; `_rev2_walk.mjs` 17,1 verdi | §A.9 satırı |
| T2D26 | NIT | Maliyet, bildirim, psikolog, "hüküm söylemek" | Doğru | §1 dört cümle |
| T2D27 | NIT | "Ruh hali" ve "Tek Bakışta'da" | Doğru | İnceleme izi dışında her yerde "ruh hâli"; §C.4 ve §F.4'te "Tek Bakışta oyununda" |

### Sahibe gönderilmeden önce son okuma (2026-09-29, orkestratör)

Benzetimler bu klasörden yeniden koşuldu ve belgeyle aynı çıktı: `node sim_merdiven.mjs karar 10|19 30|90` (en kısa 8,
en uzun 18, ortalama 15,3 ve 15,7 dk; 20 dk hiç aşılmıyor; yoga yüzünden düşen durak 0; yoga günleri 24 ve 76; tam ders
3 ve 10) ve `node sim_kural_esit.mjs` (yanlış "geriliyor" 26 haftada %27,2 → %13,0; 14–26. hafta düşüşünü yakalama
%99,8 → %51,9; öğrenme etkisinde yanlış "iyileşiyor" %71,0 → %35,5). Tur 2'nin iki BLOCKER düzeltmesi denetlendi:
Singh 2022 artık yalnız "egzersiz kapsam dışı" bulgusuyla anılıyor (§A.6, Kaynaklar); karar 2'de bedel açıkça yazılı.
