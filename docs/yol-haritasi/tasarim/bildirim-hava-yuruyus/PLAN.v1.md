# Bildirimler, hava ve yürüyüş eşliği · Plan (sürüm 1)

Tarih: 2026-09-30. Durum: **TASLAK, sahibin onayını bekliyor.** Uygulama koduna (`app/`) dokunulmadı, ücretli çağrı
yapılmadı. Kod, onaydan sonra ana oturumda yazılır (`DEVIR.md`).

**Dayandığı notlar** (bu klasörde, `arastirma/`): `kod-haritasi.md` (bugünkü bildirim sistemi, modüllerin bitiş
ekranları, `remind` alanı taslağı), `apple-hava-bildirim.md` (AlarmKit, arka plan, push, WeatherKit atfı, ilçe),
`apple-yuruyus.md` (hareket algısı, adım, tempo, konum, ses, Canlı Etkinlik), `pubmed.md` (A–I konuları, 70'ten fazla
yeni kaynak, PMID ve DOI ile), `nef-bildirim.md` (Nef'in bildirim dili, banka yöntemi, maliyet, bilim satırı, sınav).
Okunan Apple sayfalarının kopyaları `arastirma/apple/` ve `arastirma/apple-json/` altında.

**Kurallar.** Sağlık iddiası yok; bulgu dili, kişi sayısı ve sınırıyla. Ekrandaki cümle = sesteki cümle. Apple
iddiaları okunan Apple sayfasına, bilimsel iddialar PubMed kaydına (PMID + DOI), kod iddiaları dosya ve işlev adına
dayanır. Kanıtın vermediği her sayı **VARSAYIM** diye yazılır. Cihazda hiçbir şey denenmedi.

---

## 1. Tek sayfada

**Sahibin isteği (2026-09-30, özet).** Profil'de bir Bildirimler bölümü; sonsuz yoldaki her modülün sonunda şık bir
"Bana hatırlat"; saat için "Sen karar ver" ya da elle bir veya birkaç saat; kurulu hatırlatma modüle yeniden girince
"açık" görünür; bildirimler asla üst üste binmez. Ana sayfada adım satırının üstünde konum ve hava; dokununca ayrıntılı
tahmin ve Nef'in yorumu; isteyene alarmdan ~10 dakika sonra Nef yorumlu hava bildirimi. Yürürken Nef'in "Son 15
dakikada 1 km yürüdün, hava 23 derece. Yürüyüş mü yapıyorsun? Eşlik edeyim mi?" bildirimi; Apple Watch'taki gibi bir
yürüyüş ekranı; Apple'la aynı adım; açılıp kapanan sesli koç, 250 metrede bir "1 km kaç dakika". Bütün bildirimlerde
Nef'in sesi ve altında PubMed'e dayanan bir bilim satırı. Gece "kalk" yok; 21.00'den sonra "kalk" yok.

**Ne yapılır (üç parça, tek bildirim çekirdeği).**

| Parça | Kişi ne görür | Nasıl |
|---|---|---|
| **B1 · Bildirim çekirdeği ve "Bana hatırlat"** | Her modülün bitişinde "Bana hatırlat" kartı; dokununca saat sayfası: **Sen karar ver** (Nef, kişinin bu modülü en çok yaptığı saatlerden boş bir saat seçer ve nedenini söyler) ya da **Saatleri ben seçeyim** (en çok 3 saat). Modüle yeniden girince üstte "Hatırlatma açık · her gün 08.45". Profil → **Bildirimler**: günün çizelgesi (her bildirim tek noktada, hiçbiri üst üste değil), bütün hatırlatmalar tek listede, her biri aç/kapa; gece sessizliği satırı | Hatırlatma bir **manifest yeteneği** (`remind`): bir modüle alan eklemek, modüle hatırlatma kazandırır; ekrana yama yok. Tek planlayıcı bütün bildirimleri birlikte dizer, çakışanı birleştirir ya da kaydırır, gece kuralını her kaynağa uygular. Metinler Nef'in bankasından gelir, sayılar telefondaki gerçek veriden |
| **B2 · Hava** | Ana sayfada adım satırının üstünde tek satır: "Gaziemir · 23° · 21.00'de yağmur" ve Apple Weather işareti. Dokununca hava sayfası: saat saat sıcaklık ve yağmur olasılığı, Nef'in yorumu, ay, verinin yaşı, yasal bağlantı. İsteyene **Sabah havası** bildirimi: alarm kuruluysa alarmdan 10 dk sonra, yoksa kişinin seçtiği saatte | WeatherKit (Swift). İl ve ilçe listeden seçilir; kesin konum izni verenlere ilçe bir onayla önerilir. Bildirim son açılışta kurulur; iOS 26'da alarm durdurulunca güncel tahminle yeniden yazılır. Tahmin eskiyse metin bunu söyler |
| **B3 · Yürüyüş eşliği** | Yürürken Nef'in sorusu (bildirim); dokununca yürüyüş ekranı: süre, tempo (dk/km), mesafe, bu yürüyüşün adımı, günün toplam adımı; sesli koç (250 m / 500 m / 1 km / kapalı); bitişte Apple Sağlık'taki sayıyla kayıt | Yeni modül `yuruyus`. Canlı sayım telefonun adım sayarından, kesin sayı bitişte Apple Sağlık'tan. Kilit ekranında ölçümün sürmesi için "Kullanırken" konum izni ve konum arka plan kipi. Anonslar ElevenLabs parçalarından (Neslihan / Hakan), ekranda aynı cümle |

**Dürüst sınırlar (ilk bakışta bilinmesi gereken dört şey).**
1. **Apple, uygulama kapalıyken yürüyüşü anında algılamaya izin vermiyor.** Hareket verisi askıdaki uygulamaya gelmez
   (`coremotion/cmmotionactivitymanager/startactivityupdates(to:withhandler:)`). Kapalı uygulamayı yalnız iki şey
   uyandırır: Apple Sağlık'ın adım teslimi (iOS'ta en sık saatte bir; `healthkit/hkhealthstore/enablebackgrounddelivery`)
   ve "Her Zaman" konum izniyle ≥ 500 m yer değişimi (en sık 5 dakikada bir;
   `corelocation/cllocationmanager/startmonitoringsignificantlocationchanges()`). Bu yüzden "yürürken yakalama" ancak
   "Her Zaman" izniyle olur ve yürüyüşün 5–10. dakikasına düşer (hesap, cihazda denenmedi). **Karar 2.**
2. **"Apple'la birebir aynı adım" yalnız Apple Sağlık'ın istatistik sorgusundan gelir** ("automatically merge the data
   from all of your data sources", `healthkit/hkstatistics`). Yürürken ekrandaki canlı sayı telefonun sayımıdır;
   Apple Watch da takılıysa birkaç dakika farklı görünebilir. Bitişte Sağlık'taki sayı okunur, kayda o yazılır ve
   ekranda "Apple Sağlık'a göre" diye yalnız o sayı gösterilir.
3. **Alarmdan 10 dk sonraki havanın taze olması yalnız iOS 26 ve alarmı elle durduran kişide denenebilir.** AlarmKit'in
   durdurma niyeti "launches your app process without opening the app" (`appintents/liveactivityintent`); içinde ağ
   isteği yapmayı Apple yasaklamıyor ama anlatmıyor da. iOS 15–25'te ve alarmı kurulu olmayan kişide bildirim son
   açılışta kurulur ve tahminin yaşını söyler ("Dün akşam 22.40 tahminine göre…"). 18 saatten eski tahminle kurulmaz.
4. **Nef bildirim anında düşünmez.** Bildirimin metni kurulduğu an sabitlenir, uygulama kapalıyken kod çalışmaz, hava ve
   konum sunucuya gitmez. Bu yüzden Nef'in "zekâsı" önceden yazılmış, denetlenmiş ve sahibin onayladığı bir cümle
   bankasından ve telefondaki gerçek veriden gelir; model yalnız banka üretilirken çalışır (karar 3).

**Sahibe üç soru (önerimle).**
1. **Sıra.** Öneri: yoga kodu depoya girer ve Build 60 çıkar → **B1** → **B2** (onaylı plandaki Y5'in yerine geçer, Y2–Y4'ün
   önüne alınır) → Y2 → Y3 → Y4 → **B3** → Y6. Gerekçe: B1 gece bildirimi hatasının kalıcı çözümüdür ve her modüle aynı
   anda değer katar; havayı sen şimdi istedin ve Y5'in işi zaten hazır; yürüyüş eşliği en büyük parça (Swift, dışarıda
   cihaz denemesi, yeni ses parçaları), Y1–Y4'ün Ana sayfa işlerini beklemesi riskleri azaltır. Öbür seçenek: B3'ü B2'nin
   hemen arkasına almak; yürüyüş ≈ 3 hafta öne gelir, Y2–Y4 o kadar geriye kayar.
2. **Yürüyüşü yürürken yakalamak için "Her Zaman" konum izni.** Öneri: ayrı bir anahtar, **"Yürürken beni fark et"**,
   varsayılan kapalı. Kapalıyken Nef yürüyüşü Apple Sağlık'ın saatlik uyanışında görür ve soruyu yalnız kişi hâlâ
   yürüyorsa sorar (çoğu kısa yürüyüş kaçar). Açılınca "Her Zaman" izni istenir; Nef yürüyüşün 5–10. dakikasında sorar.
   Konum telefondan çıkmaz, yalnız "yer değişti mi" diye bakılır. Bedeli: kişide güvensizlik, App Review'da gerekçe.
   Öbür seçenekler: hiç "Her Zaman" istememek ya da anahtarı varsayılan açık getirmek (önermiyorum).
3. **Nef'in bildirim dili.** Öneri: **cümle bankası.** Banka, güçlü bir modelle bir kez üretilir, makine denetiminden,
   başka bir modelin incelemesinden ve senin onayından geçip uygulamaya gömülür. Telefon her bildirimde o günün
   verisine (saat, hava, ay, kişinin kendi kaydı) uyan cümleyi seçip sayıları kendisi yazar. Maliyet banka sürümü
   başına ≈ 1 USD, kullanıcı sayısından bağımsız; yeni rıza gerekmez. Öbür seçenek her bildirim için canlı model
   çağrısıdır: ≈ 0,037 USD kişi/ay (10.000 kişide ≈ 374 USD/ay; token sayıları VARSAYIM), ayrı açık rıza, hukukçu onayı
   ve kişinin verisinin sunucuya gitmesi gerekir; hava ve konum yine gidemez; ağ yoksa bildirim eski metne düşer.

**Kendi karar verdiklerim** (gerekçeleri §3'te; itiraz edersen değişir): sayılar bildirimde rakamla yazılır; sıcaklık
sözcüğü hissedilen sıcaklığa göre seçilir; "ideal" sözcüğü kullanılmaz ("yürüyüş için güzel" denir; evrensel bir ideal
sıcaklık bulgusu yok, `pubmed.md` G); günde en çok bir bildirim bilim satırı taşır; bilim satırında ölüm ve hastalık
riski bulgusu kullanılmaz; dolunay yalnız bir takvim anı ve davettir, ay → uyku → nefes zinciri kurulmaz; sesli koç
sayıları söyler (senin isteğin) ve aynı cümle ekranda yazar; Nefona Apple Sağlık'a yazmaz, bu yüzden iPhone'daki
egzersiz oturumu (`HKWorkoutSession`, yazma izni ister) kullanılmaz; ana sayfadaki hava için Apple'a soru gönderilmez
(sahibin kararı, `S0/app-review-sorusu.md`), atıf kuralı satırın kendisinde karşılanır.

**Maliyet.** WeatherKit onaylı planın hesabıyla aynı (üyelikte ayda 500.000 çağrı; §3.E.1). Nef bankası ≈ 1 USD / sürüm.
Ses parçaları: iki ses için ≈ 128 kısa kayıt (ElevenLabs); bu oturumda üretilmedi, ücreti sahibin onayıyla hesaplanır.
Canlı Etkinlik ve push için ek hizmet yok (push ikinci sürüme bırakıldı, §3.C.3).

**Gizlilik (özet, ayrıntı §4).** Yeni izinler: Hareket ve Fitness (yürüyüş), konum "Kullanırken" (hava ve yürüyüş),
isteğe bağlı "Her Zaman" (yalnız karar 2'deki anahtar açılırsa). Yürüyüşün yolu (koordinatlar) hiçbir yerde saklanmaz;
kayda yalnız süre, mesafe, adım ve ortalama tempo yazılır. Konum, hareket ve hava sunucuya ve Nef'e gitmez; hava için
yuvarlanmış koordinat ya da seçilen ilçenin merkezi yalnız Apple'ın hava servisine gider. Her amaç ayrı açık rıza:
`weather` (onaylı plandaki v1, ilçe ve sabah bildirimiyle genişler), `walk` (yeni), `walkDetect` (yeni, isteğe bağlı).

**Süre (VARSAYIM).** B1 ≈ 8–10 iş günü (Swift yok). B2 ≈ 8–10 iş günü (Swift, Mac, cihaz). B3 ≈ 11–13 iş günü (Swift,
Mac, dışarıda cihaz yürüyüşü, ses parçaları). İsteğe bağlı B3+ Canlı Etkinlik ≈ 3–4 iş günü. Toplam ≈ 27–33 iş günü;
cihaz denemeleriyle ≈ 7–9 hafta; senin onay sürelerin hariç.

---

## 2. Onaylı planlarla ilişki (çelişkiler gizlenmez)

| Onaylı karar | Kaynak | Bu plan ne yapar | Neden |
|---|---|---|---|
| Hava Y5'te, Y1–Y4'ten sonra | `SONSUZ_YOL.PLAN.v1.md` §1 karar 1, §3.I | B2 Y5'in yerine geçer; sıra karar 1'de sorulur | Sahip havayı şimdi istedi |
| Başlıkta yalnız ay; hava yalnız tam atıflı kartta (App Review yedeği) | §1 son paragraf, §3.H Apple kapısı, `S0/app-review-sorusu.md`, S0 karar 10 | Kalkar. Hava satırı adım satırının üstünde; satırda Apple Weather işareti, dokununca açılan sayfada işaret ve "Veri kaynakları" (`legalPageURL`). Alarm kartlarındaki hava satırı da açılır | Sahip (2026-09-30): "gerek yok, böyle bir bölüm yok, onun için yapmadık". Apple'a soru gönderilmez. Kalan risk §8'de |
| Hava tarih satırında (`Home.jsx` tarih satırı) | §3.E.7 | Adım şeridinin hemen üstünde, kendi başına çalışan tek satırlık bileşen | Sahibin tarifi; Ana sayfa yeniden tasarlanırken bileşen yerinden bağımsız kalır |
| Konum: isteyene yaklaşık konum, istemeyene 81 il | §1 karar 4, §3.E.2 | İl + ilçe listeden (GeoNames, 974 ADM2 kaydı, CC BY 4.0; resmî sayı 973, fark incelenmedi). Yaklaşık konumdan yalnız il; ilçe ancak kesin konumda ve onay sorusuyla | Yaklaşık konum 1–20 km sapıyor; Gaziemir'in 20 km çevresinde 9 ilçe merkezi var (`apple-hava-bildirim.md` §8.3) |
| Yağmur bildirimi ayrı tercih, sabah, 7700–7701 | §3.E.6 | "Sabah havası" bildiriminde birleşir (günde tek hava bildirimi; yağmur varsa ilk cümle yağmurdur). Kimlik 7700 kalır | Apple HIG: aynı konu için birden çok bildirim gönderme (`apple-hava-bildirim.md` §5) |
| "Nef hava verisi üretmez; cümle sabit şablondan çıkar" | §3.E.1 | Aynen korunur. Nef bankası yalnız üslubu verir; sıcaklık, saat, olasılık WeatherKit'ten ve telefondaki koddan | Dil modeli ölçüm kaynağı olamaz |
| Bildirim deneyi: türler için sessiz günler (%25, VARSAYIM) | `BILDIRIM_PLANI.md` §6, sahip kararı 3 (2026-09-27) | Korunur. Nefes, mola, su ve yürüyüş hatırlatması "Bana hatırlat"tan kurulsa da aynı türdür; birden çok saat seçilirse o günün zarı hepsine birlikte uygulanır. Yeni modül hatırlatmaları deneyin dışındadır (sessiz gün yok) | Sahip ölçmeyi seçti; deney kişinin kendi Gelişim'inde sonuç verir |
| Bildirim penceresi 09.00–21.00 (VARSAYIM) | `BILDIRIM_PLANI.md` §3 | Genel gece kuralına dönüşür, her kaynağa uygulanır (§3.A.4) | Sahip: gece 01–04 "kalk" geldi; 21'den sonra "kalk" mantıksız |
| (e) yürüyüş modülü sonra, kendi planıyla | §3.I "sonra" satırı, `YOL.moduller.md` | Yürüyüş eşliği bu planla B3'te gelir; `YOL.moduller.md`'deki "2 dakikalık yürüme" durağı B3'ün modülüne bağlanır | Sahibin yeni isteği |
| Nef'e giden paket v2, rıza v2 | §3.C.5, karar 6 | Değişmez. Bu plan Nef'e yeni veri göndermez (karar 3 bankaysa) | — |
| Sesler ElevenLabs, Neslihan / Hakan | `ANA_BELGE.md` §2 | Aynı. Sesli koç parçaları bu iki sesle üretilir; ses Profilim → Seslendirme'den | — |

**Ana oturuma bildirilecek (bu planın işi değil).** (1) Gece "kalk" hatası ana oturumda düzeltiliyor; kaynak doğrulandı:
çalışma oturumu bildirimleri pencereye bakmaz ve `timeSensitive` kurulur (`lib/notifyPlan.js` `planNotifications`
içindeki oturum döngüsü; `kod-haritasi.md` §2). (2) Gece bildirimi kurabilen başka yollar da var: Çalışma günleri saati
pencereye bakılmadan kurulur; 7302 deneme bildirimi denemenin başladığı saate kurulur (23.40'ta başlayan deneme 5 gün
sonra 23.40'ta çalar). (3) Oturumun son bildirimi ile aynı dakikadaki bir hatırlatma bugün de üst üste gelebilir
(`inFocus` bitiş anını dışarıda bırakıyor). (4) AlarmKit ertelemesi geri sayım sunumu kullanıyor, projede widget uzantısı
yok; Apple bu durumda "the system may unexpectedly dismiss alarms and fail to alert" diyor (`apple-hava-bildirim.md` §9).
B1'in gece kuralı (1)–(3)'ü kalıcı olarak kapsar; ama ana oturumun düzeltmesi B1'i beklemez.

---

## 3. Ayrıntı

### A. B1 · Bildirim çekirdeği ve "Bana hatırlat"

#### A.1 Manifest yeteneği: `remind`

Hatırlatma, modül sözleşmesinin (`modules/registry.js`) yeni isteğe bağlı alanıdır. Alanı olan her modülün bitiş
ekranında "Bana hatırlat" kartı kendiliğinden çıkar ve Profil → Bildirimler listesine girer. Yeni bir modül bu alanı
yazınca başka hiçbir dosya değişmeden hatırlatma kazanır (sonsuz yol ilkesi).

```js
//   remind?: {                          "Bana hatırlat" (components/RemindField.jsx) ve Profil → Bildirimler.
//                                       Planı lib/moduleRemind.js kurar. Yoksa modülde alan çıkmaz.
//     route?: string,                   dokununca açılacak ekran: routes'tan biri ya da 'home' (günden güne değişen
//                                       yol durakları için). Yoksa alanın gösterildiği ekran.
//     legacy?: 'mola'|'walk'|'breath'|'water',
//                                       bu modülün hatırlatması bildirim deneyindeki mevcut tür (lib/reminders.js):
//                                       ayar settings.reminders.types[legacy]'ye yazılır; zar, sessiz gün, günlük ve
//                                       "bugün yaptıysan gönderme" aynen işler.
//     window?: 'move' | 'calm',         'move' (kalk, yürü, göz hareketi): 09.00–21.00. 'calm' (nefes, yoga, dalga):
//                                       08.00–22.00. Yoksa 'move'. (§A.4; saatler VARSAYIM)
//     defaultTime?: 'HH:MM',            "Sen karar ver" için veri yokken saat; kendi penceresinin içinde
//     maxTimes?: 1 | 2 | 3,             elle seçilebilecek en çok saat (varsayılan 3)
//     doneToday?(sessions, now) → bool  bugün yapıldıysa o günün kalan hatırlatması kurulmaz. Yoksa
//                                       progression.match ?? sessions.match tutan bugünkü kayıt.
//     science?: ['sourceKey', …],       bilim satırı havuzu (lib/sources.js anahtarları; §A.6)
//   }
```

`validateManifest` bugün bilinmeyen alanı reddetmez; yeni kurallar: `remind` nesnedir; `route` `routes`'ta ya da
`'home'`dur; `legacy` dört türden biridir; `defaultTime` kendi penceresindedir; `maxTimes` 1–3 arası tam sayıdır;
`doneToday` işlevdir; `science`'taki her anahtar `sources.js`'te `pmid` ve `doi` taşır. `createRegistry` bir
`reminders()` erişicisi kazanır.

**Hangi modül ne alır** (bitiş ekranları `kod-haritasi.md` §3.1 tablosunda, dosya ve satırla):

| Modül | `remind` | Not |
|---|---|---|
| routine (göz egzersizleri) | route `'home'`, window `move` | Gruplar günden güne değiştiği için yol açılır. Çalışma günleri (`study`) ayrı kalır; ikisi aynı güne 60 dk'dan yakın düşerse tek bildirimde birleşir (§A.4) |
| blink, snake, track, tek-bakis, quick-look, fark-ettin, notice, yon, gokyuzu | kendi rotası, window `move` (gokyuzu `calm`) | — |
| breath | legacy `breath`, route `breath-1`, window `calm` | Deney türü |
| yoga | route `yoga`, window `calm` | Uykuya Geçiş dersi için akşam saati serbest (22.00'ye kadar) |
| dalga | route `dalga`, window `calm` | Uyku kipi hatırlatılmaz |
| mola, water | legacy `mola` / `water` | Deney türü; su en geç 18.00 (bugünkü kural) |
| yuruyus (B3) | legacy `walk`, route `yuruyus` | Mevcut yürüyüş türü |
| weekly, daily, reading, who5, alarm, awareness, emekliler | yok | E testi haftada bir; okuma, WHO-5 kendi aralığında; alarm kendisi bir saat |

Ayar `settings.moduleReminders` anahtarında durur: `{ [modül]: { on, mode: 'auto'|'manual', times: ['HH:MM'], autoAt,
setAt } }`. `settings.reminders` kullanılmaz: `normalizeReminders` bilmediği alanı atar ve Hatırlatmalar ekranı her
kayıtta normalize edilmiş nesneyi geri yazar; oraya konan her yeni alan ilk dokunuşta silinir (`kod-haritasi.md`
Sonuç 7). Legacy türlerin tek kaynağı `settings.reminders` olarak kalır; `moduleReminders` onlar için yalnız
`mode` ve ek saatleri tutar.

#### A.2 Bitiş kartı, saat sayfası, "açık" durumu

- **Ortak bileşen** `components/RemindField.jsx`. App, modül ekranına `ctx.remindField(route)` olarak verir; her modülün
  bitiş bloğuna tek satır eklenir (modül başına ≈ 2 satır; `kod-haritasi.md` §3.3). Ortak bir bitiş bileşeni bugün yok.
- **Kart (kapalıyken):** "Bana hatırlat" başlığı, altında tek satır "Her gün, senin için uygun saatte". Tek dokunuş.
- **Saat sayfası (alttan açılan):**
  - **Sen karar ver** (önerilen, üstte): Nef'in seçtiği saat ve nedeni: "Nefesi genelde 08.30 ile 09.00 arasında
    yapıyorsun. 08.45'te hatırlatayım." Veri yoksa: "Henüz saatini bilmiyorum. 16.30'la başlayalım; bir hafta sonra
    senin saatine göre ayarlarım."
  - **Saatleri ben seçeyim:** büyük saat seçici, "Bir saat daha ekle" (en çok 3). Seçilen saat başka bir bildirimle
    çakışırsa altında hemen yazar: "12.30'da Mola hatırlatman var. 13.30'a ne dersin?" [13.30'u seç] [Yine de 12.30].
    "Yine de" seçilirse ikisi tek bildirimde birleşir (§A.4); hiçbir zaman iki bildirim aynı anda gelmez.
  - Pencere dışı saat seçilemez; seçicinin altında "Gece 22.00–08.00 arası bildirim göndermiyoruz." yazar.
  - Deney türlerinde bir cümle daha: "Bazı günler bilerek göndermiyoruz; hatırlatmanın işine yarayıp yaramadığını
    görmen için." (bugünkü cümle, `BILDIRIM_PLANI.md` §4).
  - Bildirim izni yoksa önce bizim tek cümlelik açıklamamız, sonra iOS penceresi. İzin reddedildiyse: "Bildirimler
    kapalı: Ayarlar > Nefona > Bildirimler." (bugünkü metin).
- **Açık durumu:** kart "Hatırlatma açık · her gün 08.45 · Nef seçti" olur; aynı hap modülün giriş ekranının üstünde
  görünür (yolun 1. günü 4. durakta modüle yeniden giren kişi de görür). Dokununca saat sayfası açılır; orada "Kapat".
- **Bildirimi açınca:** hatırlatmaya dokunulunca modülün ekranı açılır; hatırlatma o günün kaydını tutar (açıldı mı,
  yapıldı mı). Bu kayıt yalnız telefondadır.

#### A.3 "Sen karar ver" yöntemi

- **Veri:** bu modülün son 28 gündeki kayıtlarının saati (`sessions[].date`; varsa başlangıç ≈ `date − seconds`) ve
  habit-log `at`. Gece kayıtları (Dalga uyku kipi, alarm) sayılmaz. Açılış saatleri bugün tutulmuyor (`lib/dayOpen.js`
  Y3'te gelecek); gelince o da girer.
- **Seçim:** her 15 dakikalık dilim için "kaç farklı günde bu dilimde yapıldı" sayılır; komşu dilimlerle yumuşatılır;
  pencere içindeki ve başka bildirimlere 60 dakikadan uzak en yüksek dilim seçilir. Kayıt 5 günden azsa
  `remind.defaultTime` (VARSAYIM eşiği). Saat 7 günde bir yeniden hesaplanır ve değişirse Bildirimler'de bir satırla
  söylenir: "Nefes hatırlatmanı 08.45'ten 09.15'e aldım; son iki haftada daha geç yapıyorsun."
- **Kişi yaptığı saatten biraz önce hatırlatılır** (VARSAYIM: 15 dk önce), çünkü hatırlatma yapılmadan önce işe yarar.
- **Dayanak ve sınır:** hatırlatmayı günlük bir rutine bağlamak meditasyon uygulamasının sürdürülmesini artırdı (Stecher
  2021, RKÇ; PMID ve kişi sayısındaki tutarsızlık `pubmed.md` A'da). Egzersizi hep aynı saatte yapmak daha çok
  egzersizle ilişkili, hangi saat olduğu fark etmiyor (Schumacher 2019, kesitsel). Sistemin seçtiği saatin kişinin
  seçtiği saatten üstün olduğu gösterilmedi (Morrison 2017, RKÇ, 77 kişi). Bu yüzden "Sen karar ver" bir kolaylıktır;
  ekranda "daha etkili" denmez.

#### A.4 Tek plan, çakışmasızlık ve gece kuralı

- **Tek planlayıcı.** `planAll` bütün kaynakları birlikte dizer: bugünkü `planNotifications` (dokunulmaz), yeni
  `planModuleReminders`, sabah havası (B2), yürüyüş sorusunun yasak dilimleri (B3). Çıktı tek listedir;
  `notifyApply` onu tek seferde uygular. Hiç yeni özellik açık değilken `planAll` çıktısı bugünkü `planNotifications`
  çıktısıyla derin eşit olmalıdır (§5.4).
- **Çakışma kuralı ("asla üst üste binmez"):** iki bildirim arasında en az 30 dakika olur (VARSAYIM; bugünkü ayar
  kuralı 60 dk'dır ve korunur). Planlayıcı çakışmayı şöyle çözer: (1) Kişinin elle seçtiği saat yer değiştirmez; aynı
  30 dakikaya düşen modül hatırlatmaları **tek bildirimde birleşir**: "Nefes ve göz egzersizin hazır. Hangisiyle
  başlarsın?" (2) "Sen karar ver" saatleri boş dilime kaydırılır. (3) Deney türünün saati kaydırılmaz (deney bozulmasın).
  (4) Alarm, çalışma oturumu ve "Mola bitti" gibi kişinin başlattığı anlar önceliklidir; o anın 30 dakika çevresine
  düşen hatırlatma bir sonraki boş dilime kayar ya da o gün gönderilmez. Kural, aynı dakikadaki bugünkü çakışmayı da
  kapatır (§2 son paragraf, madde 3).
- **Gece kuralı (her kaynağa uygulanır, istisnası yazılıdır):**
  - Hareket isteyen bildirimler (mola, kalk, yürüyüş, göz hareketi, çalışma oturumu molası): yalnız 09.00–21.00.
  - Sakin bildirimler (nefes, yoga, dalga, su hariç her şey): 08.00–22.00. Su en geç 18.00 (bugünkü kural).
  - Alarm kuruluysa ve yatma saati hesaplanabiliyorsa (`lib/alarm.js` `bedtimeFor`) yatmadan önceki 60 dakikada bildirim
    yok (VARSAYIM süresi).
  - **İstisnalar:** kişinin kendi alarmı ve alarma bağlı sabah havası (kişi zaten uyanık); kişinin kendi başlattığı
    "Mola bitti" (7301) gece 22.00–08.00'de kurulmaz, uygulama içinde gösterilir; 7302 deneme bildirimi gece saatine
    düşerse 10.00'a kaydırılır.
  - Çalışma oturumu 21.00'e yaklaşırsa kalan saatlerin bildirimi kurulmaz; oturum şeridinde "21.00'den sonra
    hatırlatmıyorum." yazar.
  - `timeSensitive` yalnız alarmda kalır. Hatırlatmalar, hava ve yürüyüş sorusu `active`tir (Apple HIG: Time Sensitive
    yalnız "happening now or will happen within an hour"; `apple-hava-bildirim.md` §5).
  - **Dayanak:** yatakta telefon kullanmak ve gece telefonla uyanmak kötü uyku ve yorgunlukla tutarlı biçimde ilişkili
    (Carter 2016 meta-analiz; Van den Bulck 2007; Exelmans 2016; Brosnan 2024; hepsi gözlemsel, `pubmed.md` C). "21.00'den
    sonra kalk yok" uyku zararına dayanmaz: akşam egzersizi uykuyu genel olarak bozmuyor (Stutz 2019; Frimpong 2021);
    kalk bildirimleri yalnız iş saatlerinde sınandı ve orada işe yaradı (Evans 2012; Swartz 2014), akşam için kanıt yok.
    21.00, 22.00 ve 08.00 VARSAYIM'dır.
- **Sayı bütçesi.** Bugün en kötü durumda 48 bildirim bekler (`kod-haritasi.md` Sonuç 2). iOS'ta 64 bekleyen sınırı
  UserNotifications belgelerinde yok, yalnız eskimiş `UILocalNotification` sayfasında geçiyor (`apple-hava-bildirim.md`
  §5). Güvenli taraf: modül hatırlatmaları 3 günlük ufukla kurulur, toplam bekleyen ≤ 60 tutulur; bütçe dolarsa en uzak
  gün kırpılır (plan her açılışta yeniden kurulur). `repeats`'li takvim tetiği kullanılmaz: tek bir günü atlayamaz ve
  "bugün yaptıysan gönderme" kuralını uygulayamaz.
- **Kimlikler.** 7400–7599 bugünkü; 7600–7607 alarm yedeği (dokunulmaz); **7700–7709 hava**; **7800–7859 modül
  hatırlatmaları**. Yürüyüş sorusu Swift tarafında kendi dize kimliğiyle kurulur; JS'in sayısal aralığına girmez.
  `notifyApply` kendi aralığına yeni aralıkları ekler; `threadIdentifier` (tür başına) ve `relevanceScore` Capacitor
  eklentisinde var, bugün gönderilmiyor; eklenir (`apple-hava-bildirim.md` §5.2).

#### A.5 Profil → Bildirimler

- **Yer:** Profilim'de Alarm bölümünden sonra (`screens/ProfileHome.jsx`). Veriyi App, alarm özetinin kalıbıyla
  hazırlar. Bugünkü Hatırlatmalar ekranı (`screens/Reminders.jsx`, Bilgi → Günlük düzen) deney türlerinin ve çalışma
  oturumunun ayrıntı ekranı olarak kalır; tek değişikliği dönüş yerinin parametreye bağlanmasıdır.
- **Üstte günün çizelgesi:** 08.00–22.00 arası tek yatay çizgi; bugünkü her bildirim tek nokta (modülün simgesiyle);
  gece bölümü koyu ve "Gece sessiz" yazılı. Kişi ilk bakışta hiçbir şeyin üst üste binmediğini görür (5 saniye).
- **Liste (bölümler):** "Modüllerin" (her "Bana hatırlat"; saat, "Nef seçti" ya da "Senin saatin", anahtar),
  "Nef'in haberleri" (Sabah havası, Yürüyüş eşliği, Yürürken beni fark et), "Günlük düzen" (bugünkü deney türleri ve
  Çalışma günleri; Hatırlatmalar ekranına götürür), "Gece sessizliği" (bilgi satırı, değiştirilemez; "Alarmın hariç").
- Ana anahtar kapalıysa bütün satırlar gri ve üstte "Bildirimler kapalı" yazar (bugünkü `cancelOwn` davranışı).
- Satıra dokununca o hatırlatmanın saat sayfası açılır. Kapatılan satır listede kalır (yeniden açmak tek dokunuş).

#### A.6 Nef'in bildirim dili ve bilim satırı

- **İki katman:** (1) **Nef cümlesi** (en çok 70 karakter): o güne uyan, kişinin kendi verisine dayanan tek cümle.
  (2) **Bilim satırı** (en çok 100 karakter): tek bulgu, kişi sayısı ve süresiyle. Başlık en çok 30, gövde en çok 160
  karakter (VARSAYIM: kilit ekranında görünen satır sayısı Apple belgesinde yok). Bildirimde bağlantı tıklanamaz;
  dokununca açılan ekranın üstünde **bilim kartı** durur: makalenin adı, yazar ve yıl, PMID, DOI bağlantısı, tür, kişi
  sayısı, sınır cümlesi.
- **Örnekler** (bankadan; sayılar örnek günün verisi; hepsi `nef-bildirim.md` §2.5 ve §10.5'te, uzunlukları sayılmış):
  - Nefes: "Nefes · 4. basamak" · "Bugün 3 dakika. Omuzlarını bırak, gerisini birlikte sayarız." · "12 denemelik bir
    analizde yavaş nefes, algılanan streste küçük–orta azalmayla ilişkiliydi." (Fincham 2023)
  - Dolunay: "Bu gece dolunay" · "Aya bakarak 3 dakika yavaş nefes: bu akşamın küçük töreni." · bilim satırı nefesin
    kendi bulgusu (Laborde 2022). Ay → uyku → nefes zinciri kurulmaz; ayın uykuya etkisi tartışmalıdır (onaylı plan
    §3.E.5).
  - Yürüyüş: "Kısa bir yürüyüş" · "Hava 21 derece, ılık. İstersen şimdi 5 dakikalık bir tur." · "Bir denemede yürüyüş
    önerisi sonraki 30 dakikada adımı artırdı; 44 kişi, 6 hafta." (Klasnja 2019)
  - Mola: "Kalk, biraz gerin" · "Bir saat oldu; bir dakikalık ara yeter." · "56 ofis çalışanıyla 12 haftalık bir
    çalışmada telefondan gelen mola hatırlatması oturmayı azalttı." (Morris 2020)
- **Banka yöntemi (karar 3'ün önerisi):** model rakam, saat ya da hava sözcüğü yazamaz; bunları yalnız yer tutucuyla
  çağırır (`{rainFrom:LOC}` → "21.00'de"). Rakam içeren aday otomatik atılır. Sayıyı ve Türkçe eki (saat ekleri
  okunuşa göre: "21.00'de", "19.00'da", "15.00'ten") telefondaki kod yazar ve birim testiyle sınanır. Banka aday
  cümleleri makine denetimi (uzunluk, yasak kalıp, ek, veriyle tutarlılık), başka aileden bir model incelemesi ve
  sahibin onayından geçer (`nef-bildirim.md` §1, §2, §7).
- **Yasaklar:** emoji, ünlem yağmuru, "-malısın", korkutma, suçlama, sağlık iddiası ("iyileştirir", "korur", "kanıtlandı",
  "bilimsel olarak"), başkasıyla karşılaştırma. Hava için "yağacak" değil "bekleniyor". Kilit ekranında adım sayısı
  görünmez (bugünkü kural); yürüyüş sorusundaki mesafe istisnadır ve kişi "Kilit ekranında sayı gösterme"yi seçebilir.
- **Döndürme:** günde en çok bir bildirim bilim satırı taşır (öncelik: kişinin kurduğu modül hatırlatması > yürüyüş >
  mola > su > hava); aynı satır 7 gün içinde tekrar etmez; ilk 14 gün her modülün ilk bildirimi o modülün en güçlü
  kaynağını taşır; kişi kartı açtıysa o satır 30 gün dinlenir (süreler VARSAYIM). Döndürmenin amacı etkiyi artırmak
  değil tekrar yorgunluğunu önlemektir: metin çeşitliliği tek başına açılmayı artırmadı (Bell 2023).
- **Kanıt kapısı:** bilim satırı taşıyan her kaynak `lib/sources.js`'e `pmid` ve `doi` ile kayıtlı olmalı ve yayından
  önce PubMed'de yeniden açılmalı. Bugün eksik olanlar (≈ 17): `kim2020`, `wolffsohn2025`, `fincham2023`, `laborde2022`,
  `balban2023`, `tucker2007`, `klimek2022`, `denissen2008`, `stout2022`, `desai2026`, `moszeik2025`, `radin2025` ve beş ay
  kaynağı. `YOL.nef.md` §14 Kim 2020 ve Wolffsohn 2025'in `sources.js`'te "zaten var" olduğunu söylüyor; yok, yalnız
  `evidence.js`'te metin olarak geçiyorlar. Kişi sayısı "kaynak bekliyor" olan satırlar (`nef-bildirim.md` §10.5) sayı
  doğrulanmadan yayına girmez.
- **Dayanak ve sınır:** kişiye uyarlanmış mesajların etkisi küçük ama tutarlı (Noar 2007, r = 0,074; Hao 2023,
  g = 0,16); en iyisi sürekli güncellenen veriyle uyarlama (Krebs 2010). Dil modeliyle yalnız üslubu uyarlamak davranışa
  ek katkı yapmadı (Schlicht 2026, RKÇ) ve dil modelleri sağlık içeriğinde yanlış üretebiliyor (Zaleski 2024). Bu yüzden
  sayılar ve iddialar modelden gelmez.

### B. B2 · Hava

#### B.1 Kaynak, konum, rıza

- **Kaynak:** WeatherKit Swift çerçevesi (onaylı plan §3.E.1 aynen). Yeni Swift eklentisi `SkyPlugin.swift`; iOS 16+
  (iOS 15'te hava bölümü görünmez, ay çalışır).
- **Konum:** önce kısa sayfamız, sonra seçim: [Konumumu kullan] ya da [İl ve ilçe seç]. Konum yalnız "Kullanırken" ve
  varsayılan yaklaşık (`NSLocationDefaultAccuracyReduced`). Yaklaşık konumdan yalnız il bulunur (81 il merkezi,
  telefonda); ilçe listeden seçilir ya da kesin konum izni verilmişse telefonda en yakın ilçe merkezi bulunup sorulur:
  "Gaziemir'de misin?" [Evet] [Başka ilçe]. Ters coğrafi kodlama kullanılmaz (koordinatı ikinci kez Apple'a gönderir;
  `CLGeocoder` iOS 26'da eskidi). Koordinat 2 ondalığa yuvarlanır, yalnız WeatherKit'e gider, saklanmaz; telefonda il,
  ilçe adı ve hava önbelleği kalır.
- **Rıza `weather` v1** (onaylı plan §3.E.2) iki satırla genişler: "Ne" satırına ilçe adı, "Neden" satırına sabah
  havası bildirimi. Hukukçu yedeği (onaylı plan §1) aynen: hukukçu adı gelmeden konum izni App Store'a gitmez; o
  sürümde yalnız il ve ilçe seçimi vardır.

#### B.2 Ana sayfa satırı

- Adım şeridinin hemen üstünde tek satır: **"Gaziemir · 23° · 21.00'de yağmur"**, solda duruma göre çizilen küçük hava
  simgesi, sağda küçük Apple Weather işareti. Yağmur yoksa üçüncü parça günün en yüksek sıcaklığı ("en çok 26°") ya da
  "açık". 320 pt'de ilçe adı kısalmaz, üçüncü parça düşer.
- Hava önbellekte yoksa satır görünmez (Ana sayfa ağ beklemez). Konum ve ilçe hiç seçilmemişse satırın yerinde bir
  kez, günün ilk dokunuşundan sonra tek satırlık teklif çıkar: "Havayı burada göstereyim mi?" [Göster] [Hayır]; "Hayır"
  kalıcıdır (onaylı plan §3.E.7 teklif kuralı; 7. gün koşulu kalkar, çünkü sahip satırı Ana sayfada istedi).
- **Atıf:** Apple'ın kuralı hava verisi gösterilen yerde Apple Weather işaretini ve yasal atıf sayfası bağlantısını
  ister ("The required attribution which includes a legal attribution page and Apple Weather mark",
  `weatherkit/weatherservice/attribution`). Satırda işaret durur; satıra dokununca açılan hava sayfasının altında
  işaret ve "Veri kaynakları" (`legalPageURL`) her zaman görünür. Kalan risk §8.
- Satır `components/SkyLine.jsx`; Ana sayfaya tek satırla takılır. Ana oturum Ana sayfayı yeniden tasarladığı için
  bileşen yerinden bağımsızdır; yeni tasarımda adım bilgisinin hemen üstünde durur.

#### B.3 Hava sayfası

Sırayla: yer ve saat ("Gaziemir · 12.40'ta alındı"); büyük sıcaklık ve hissedilen; **Nef'in yorumu** (bankadan, o günün
verisine göre: "21.00–22.00 arası yağmur bekleniyor. Akşam yürüyüşünü 20.30'dan önce bitirirsen şemsiyeye gerek
kalmayabilir."); saat saat şerit (sıcaklık ve yağmur olasılığı çubuğu, şimdiden 24 saat); en yüksek ve en düşük; ay
evresi ve aydınlanma (onaylı plan Y4'ün ay kartı gelince oraya bağlanır); **Sabah havası** anahtarı; atıf satırı
(işaret, "Veri kaynakları"). Durumlar: çevrimdışı ve önbellek < 12 sa (son veri ve yaşı), önbellek yok ("Hava için
internet gerekiyor."), WeatherKit hatası ("Hava bilgisi şu an alınamadı."), iOS 15 ve web (hava yok).

#### B.4 Sabah havası bildirimi

- **Tercih:** ayrı anahtar, varsayılan kapalı. Hava sayfasında ve Profil → Bildirimler'de. Alarm kuruluysa saat
  "Alarmından 10 dakika sonra" (değiştirilebilir: 5 / 10 / 20 dk); alarm yoksa kişi saat seçer (varsayılan 07.30,
  VARSAYIM). Günde tek hava bildirimi; yağmur varsa ilk cümle yağmurdur (onaylı plandaki ayrı yağmur tercihi bununla
  birleşir). Düzey `active`. Kimlik 7700 (yarın için 7701).
- **Katmanlar** (`apple-hava-bildirim.md` §4):
  1. **Her açılışta ve her plan kurulumunda** yarının (ya da bugünün) bildirimi o anki tahminle kurulur. Tahmin 1
     saatten eskiyse metin yaşını söyler: "Dün akşam 22.40 tahminine göre 14.00–17.00 arası yağmur bekleniyor." Bildirim
     anında tahmin 18 saatten eski olacaksa kurulmaz.
  2. **iOS 26 ve AlarmKit alarmı:** alarmın durdurma niyeti (`stopIntent`) uygulamayı açmadan Swift kodunu çalıştırır;
     kod WeatherKit'ten taze tahmini alır, bankadan metni kurar (şablonlar önceden `UserDefaults`'a yazılır, çünkü arka
     planda JS çalışmaz; VARSAYIM) ve 7700'ü aynı kimlikle yeniden kurar. Süre sınırı belgede yok; 8–10 saniyeye göre
     tasarlanır; yetişmezse 1. katmanın bildirimi kalır. Bugün kodda `stopIntent` verilmiyor.
  3. **Arka plan yenilemesi** (`BGAppRefreshTask`) yalnız "olursa iyi" katmanıdır: tarih garantisi yok, gecikme saatler
     sürebilir, Düşük Güç Modu'nda çalışmaz.
  4. **Kişi uygulamayı bildirimden önce açarsa** bildirim iptal edilir, bilgi Ana sayfadaki satırda görünür.
  - Tuzak: bir sonraki plan kurulumu Swift'in yazdığı taze metni eski metinle ezebilir; Swift "yerelde yenilendi" işareti
    bırakır, `planAll` o gün 7700'ü yeniden yazmaz.
  - Push + Notification Service Extension teknik olarak tek "her zaman taze" yoldur, ama sunucunun kişinin uyanma
    saatini ve cihaz belirtecini bilmesini, APNs anahtarını ve dakikalık zamanlayıcıyı gerektirir; WeatherKit'in
    uzantıda kullanılabildiği belgede yok. İkinci sürüme bırakıldı.
- **Metin örnekleri** (`nef-bildirim.md` §2.5 W1–W10): "Yağmur 21.00'de" · "Bugün 21.00–22.00 arası yağmur bekleniyor.
  Yürüyüşü 21.00'den önce bitirirsen şemsiyeye gerek kalmayabilir." Yağmur yoksa: "Güne 14 derecede başlıyorsun" ·
  "Öğleden sonra 23 dereceye çıkıyor, yağmur beklenmiyor. Akşam yürüyüşü için güzel bir gün." Son satır "Apple Weather".
- **Dayanak ve sınır:** kötü hava hareketin önündeki engellerden biri, en tutarlı engel yağış (Tucker ve Gilliland 2007;
  Klimek 2022; `pubmed.md` G); adımın en yüksek olduğu aralık gözlemsel çalışmalarda ≈ 16–21 °C ve iklime göre değişiyor
  (Togo 2005; Ho 2022); uyarının var olması tek başına davranışı çoğunlukla değiştirmedi (Toloo 2013). Bu yüzden hava
  bildirimi bir plan önerisidir ("şemsiye", "öncesine al"), sağlık iddiası değildir.

### C. B3 · Yürüyüş eşliği

#### C.1 Yürüyüş nasıl başlar

1. **Kişi başlatır:** Ana sayfada yolun "Yürüyüş" durağı, yürüyüş modülünün ekranı ya da "Bana hatırlat"
   hatırlatması → [Yürüyüşe başla].
2. **Nef sorar (varsayılan):** Apple Sağlık yeni adım yazınca uygulamayı en sık saatte bir uyandırır (bugünkü WalkGuard
   altyapısı). Uyanan kod son 15 dakikanın adım sayarı verisine bakar (`CMPedometer.queryPedometerData`, son 7 gün
   saklanır) ve hareket etkinliğinin şu an "yürüyor" olduğunu görürse sorar. Kişi yürümeyi bitirdiyse sormaz.
3. **Nef yürürken sorar (karar 2, "Yürürken beni fark et" açıksa):** "Her Zaman" konum izniyle ≥ 500 m yer değişiminde
   uygulama uyanır, hareket etkinliğine bakar (araba ve bisiklet ayrılır), son 15 dakikanın verisiyle sorar. Konum
   saklanmaz, yalnız uyandırmak için kullanılır.
- **Soru bildirimi** (sahibin cümlesine yakın; `nef-bildirim.md` D1–D10): başlık "Yürüyüşe mi çıktın?" · gövde "Son 15
  dakikada 1,1 km yürüdün, hava 23 derece ve yürüyüş için güzel. Eşlik edeyim mi?" Dokununca yürüyüş ekranı açılır ve
  son 15 dakika yürüyüşe eklenir. Günde en çok 2 soru, iki soru arası en az 3 saat, gece kuralı geçerli (VARSAYIM).
  Kişi iki kez "Şimdi değil" derse o gün bir daha sorulmaz.
- Dürüst sınır: Apple Watch'un otomatik egzersiz algısını üçüncü taraf iPhone uygulamasına açan bir API bulunamadı
  (`apple-yuruyus.md` Sonuç 3). Bildirim bu yüzden **soru** biçimindedir, "Yürüyüşe çıktın" diye kesin konuşmaz.

#### C.2 Yürüyüş ekranı

- Apple Watch'taki antrenman ekranının düzeni: siyah zemin (açık temada da koyu değil, açık zemin çizilir), dört büyük
  sayı alt alta: **süre** (00:18:42), **şu anki tempo** (9'40" /km), **mesafe** (1,94 km), **adım** (bu yürüyüş · 2.316).
  Altında ince satır: "Bugün toplam 7.482 adım · Apple Sağlık". En altta [Duraklat] [Bitir] ve sesli koç düğmesi.
- **Tempo:** telefonun adım sayarının `currentPace` değeri (saniye/metre) dk/km'ye çevrilir; ekranda son 30 saniyenin
  yumuşatılmışı. Konum oturumu açıksa mesafe konumdan, değilse adım sayarının tahmininden. Sayılar ekranda
  "yaklaşık" diye işaretlenmez ama bilgi satırı söyler: "Tempo ve mesafe telefonun ölçümüdür; yaklaşıktır."
  (iPhone'un yürüme hızı ölçümü geçerli çıktı, Werner 2023; kentte GPS mesafesi %3–9 eksik çıkabiliyor,
  Gilgen-Ammann 2020.)
- **Adım:** canlı sayı telefonun adım sayarından ("bu yürüyüş"). Günün toplamı Apple Sağlık'ın canlı istatistik
  sorgusundan (telefon kilitliyken okunamayabilir; o an eski değer ve saati kalır). **Bitişte** yürüyüşün başlangıç ve
  bitişi arasındaki Apple Sağlık toplamı okunur; özet ekranında ve kayıtta o sayı "Apple Sağlık'a göre" diye durur.
  Apple Watch varken Sağlık'ın birleştirmesi birkaç dakika gecikebilir; özet "Sayılar Apple Sağlık'ta güncelleniyor"
  der ve 2 dakika içinde yeniler (VARSAYIM süresi).
- **Kilit ekranında:** konum oturumu (`location` arka plan kipi, "Kullanırken" izni, iOS 17+ `CLBackgroundActivitySession`)
  uygulamayı uyanık tutar; mavi konum göstergesi görünür. Sessiz ses çalarak uyanık tutmak App Review 2.5.4'e aykırıdır,
  yapılmaz. İsteğe bağlı B3+: kilit ekranı ve Dinamik Ada için Canlı Etkinlik (yeni Widget Extension hedefi; en çok 8
  saat, veri 4 KB).
- **Bitiş özeti:** süre, mesafe, ortalama tempo, Apple Sağlık'a göre adım, Nef'in tek cümlesi (bankadan; "Dünkünden 4
  dakika uzun yürüdün." gibi yalnız kendi kaydıyla karşılaştırma), "Bana hatırlat" kartı.
- **Kayıt:** `sessions`'a `{ type: 'walk', date, seconds, distanceM, steps, stepsSource: 'health'|'phone', paceSecPerKm }`;
  koordinat, rota ve konum yok. Modül `yuruyus`: `progress.domain: 'body'`, `metrics`: ortalama tempo (better 'down') ve
  haftalık yürüyüş dakikası; veri merkezine yazar, Gelişim'e bağlanır (ANA_BELGE veri merkezi ilkesi). Nefona Apple
  Sağlık'a yazmaz.

#### C.3 Sesli koç

- **Ayar** (yürüyüş ekranındaki düğmeden, Profil → Bildirimler → Yürüyüş eşliği'nden): Açık/Kapalı; aralık 250 m (varsayılan),
  500 m, 1 km; ne söylensin: tempo (her zaman), mesafe, süre (ikisi isteğe bağlı). Ses Profilim → Seslendirme'deki ses.
- **Anons:** "250 metre. Kilometre başına 9 dakika 40 saniye." Saniye 5'e yuvarlanır (VARSAYIM). Aynı cümle ekranda
  altyazı olarak 4 saniye görünür (ekrandaki cümle = sesteki cümle). Sayılar Türkçede ek almadığı için parça birleştirmek
  dil bilgisi açısından güvenlidir. Parçalar: 1 giriş, 28 dakika (3–30), 12 saniye (0–55), 15 kilometre, 3 metre, ≈ 6
  sabit cümle → ses başına ≈ 64, iki ses için ≈ 128 kısa kayıt (`apple-yuruyus.md` §4). Birleşme yerinde tonlama dikişi
  duyulabilir; dinlenerek onaylanır.
- **Ses oturumu:** `.playback` kategorisi, `.voicePrompt` modu, `.duckOthers` ve `.interruptSpokenAudioAndMixWithOthers`;
  her anonstan sonra oturum `notifyOthersOnDeactivation` ile bırakılır (Apple bu seçenekleri egzersiz uygulaması
  örneğiyle veriyor). Uygulamanın ortak ses yöneticisine (`AppAudioSession`, `FeedbackPlugin.swift`) yürüyüş durumu
  eklenir; yoksa uyku sesi, yoga ve kayıtla çakışır. Anonslar WebView'den değil yerel Swift'ten çalar. Türkçe sistem
  sesi (`AVSpeechSynthesizer`) yalnız parça eksikse yedektir.
- **Güvenlik ve dayanak:** yürüyüşte sesli tempo anonsunun etkisi hiç sınanmadı (`pubmed.md` F). Kulaklıkla ses yayanın
  dikkatini dağıtıyor (Schwebel 2012, RKÇ; Simmons 2020, meta-analiz). Bu yüzden anons kısadır, soru sormaz, sıklığı
  ayarlanır ve ilk açılışta tek satır yazar: "Kulaklık takıyorsan çevreni duyabileceğin bir ses düzeyi seç." Tempo
  yorumunda sağlık iddiası yoktur; orta şiddetin karşılığı ≈ 100 adım/dk'dır (Tudor-Locke 2019), dk/km için bilimsel bir
  şiddet eşiği yok; bu yüzden koç tempoyu söyler, "yavaşsın/hızlısın" demez.

---

## 4. Veri, rıza ve gizlilik (KVKK: her amaç için ayrı açık rıza)

| Amaç | Veri | Nerede işlenir | Nereye gider | Rıza | İzin penceresi |
|---|---|---|---|---|---|
| "Bana hatırlat", "Sen karar ver" | Uygulamadaki kendi kayıtlarının saati | Telefonda | Hiçbir yere | Yeni rıza yok (VARSAYIM: telefonda kalan ve yalnız hizmetin kendisi için işlenen veri; hukukçu sorusuna eklenir) | Bildirim izni (bugünkü) |
| Hava (satır, sayfa, sabah bildirimi) | Yuvarlanmış koordinat ya da seçilen ilçenin merkezi; il ve ilçe adı | Telefonda; tahmin Apple'da | Apple WeatherKit (yurt dışı); sunucumuza ve Nef'e gitmez | `weather` v1 (onaylı plan), ilçe ve sabah bildirimi satırlarıyla | Konum "Kullanırken", yaklaşık (isteğe bağlı) |
| Yürüyüş ekranı ve sesli koç | Adım, tempo, mesafe (canlı); konum yalnız mesafe için, saklanmaz; Apple Sağlık toplamı | Telefonda | Hiçbir yere | **`walk` (yeni)**; Apple Sağlık okuması mevcut `health` v2 rızasıyla | Hareket ve Fitness; konum "Kullanırken" |
| Nef'in yürüyüş sorusu (varsayılan) | Son 15 dakikanın adım ve hareket etkinliği | Telefonda | Hiçbir yere | `walk` | — (Apple Sağlık arka plan teslimi bugün var) |
| Yürürken beni fark et | "Yer değişti mi" sinyali (konumun kendisi saklanmaz) | Telefonda | Hiçbir yere | **`walkDetect` (yeni, isteğe bağlı)** | Konum "Her Zaman" |

- Hareket ve konum verisi özel nitelikli sağlık verisine dönüşebilir (adım ve tempo `health` rızasında zaten sağlık
  verisi sayılıyor; `lib/consent.js` notu); bu yüzden `walk` ayrı ve açık rızadır, kutusu işaretsiz gelir, "Şimdi
  değil" hiçbir şeyi kapatmaz (yürüyüş ekranı sayılar olmadan süre ölçer).
- **Gizlilik sayfası ve App Store etiketi aynı sürümde:** konum sunucuya hiç gitmez cümlesi korunur; hava için Apple'a
  giden yuvarlanmış koordinat onaylı plandaki gibi yazılır ("Yaklaşık konum · uygulama işlevi · kimliğe bağlı değil").
  Yürüyüşün konumu ve hareket verisi telefondan çıkmadığı için etikete "toplanan veri" olarak girmez (VARSAYIM; Apple'ın
  etiket tanımı "toplanan" = cihazdan çıkan; Mac'te App Store Connect'te doğrulanır).
- **Info.plist:** `NSMotionUsageDescription`, `NSLocationWhenInUseUsageDescription`, `UIBackgroundModes` → `location`;
  karar 2 evetse `NSLocationAlwaysAndWhenInUseUsageDescription`; B3+ için `NSSupportsLiveActivities`. İzin metinleri
  davranışla aynıdır ("Yürüyüşün sırasında tempo ve mesafeyi ölçmek için. Konumun saklanmaz, telefondan çıkmaz.").
  Karar 2'nin "Her Zaman" metni: "Evden çıkıp yürümeye başladığında 'Yürüyüş mü yapıyorsun?' diye sorabilmem için. Konumun
  saklanmaz, telefondan çıkmaz. İstediğin an Ayarlar'dan kapatabilirsin."
- **"Tüm verileri sil"** yeni anahtarları da siler: `moduleReminders`, bilim satırı günlüğü, hava önbelleği, il ve ilçe,
  yürüyüş kayıtları (sessions içinde zaten silinir), Swift tarafının `UserDefaults` şablonları.
- **Hukukçu soruları** (S0 listesine eklenir; ad gelmezse onaylı plandaki yedek): `walk` rızasının kapsamı; "Her Zaman"
  konumun telefonda "yer değişti" sinyali olarak kullanılması; kullanım saati analizinin rıza gerektirip gerektirmediği.

---

## 5. Kod sözleşmesi (mevcut sistem bozulmaz)

### 5.1 Yeni dosyalar

| Parça | Dosya |
|---|---|
| B1 | `lib/moduleRemind.js` (`planModuleReminders`, `pickAutoTime`), `lib/notifyAll.js` (`planAll`, çakışma birleştirici, gece kuralı), `lib/nefBank.js` + `lib/nefBank.data.js` (onaylı banka), `lib/sciLine.js` (bilim satırı ve döndürme), `components/RemindField.jsx`, `components/RemindSheet.jsx`, `components/NotifyTimeline.jsx`, Profil'de `NotifyPref` bölümü, testleri |
| B2 | `ios/App/App/SkyPlugin.swift`, `lib/sky.js`, `lib/places.js` + il/ilçe tablosu (GeoNames, CC BY 4.0, atıf Bilgi → Kaynaklar'da), `components/SkyLine.jsx`, `screens/Sky.jsx`, `lib/weatherNotify.js` (onaylı plandaki `rainNotify.js`'in yerine), testleri |
| B3 | `modules/yuruyus/` (manifest, view), `screens/Walk.jsx`, `ios/App/App/WalkPlugin.swift` (adım sayarı, hareket etkinliği, konum oturumu, anons çalar), `lib/walkCoach.js` (anons zamanı, tempo yumuşatma, yuvarlama), `lib/walkDetect.js` (soru kuralları), `public/voice/walk/<ses>/*.mp3` (parçalar), testleri; B3+: Widget Extension hedefi |

### 5.2 Değişen dosyalar

`modules/registry.js` (`remind` doğrulaması, `reminders()`); `remind` alacak her `manifest.js` (§A.1 tablosu) ve bitiş
ekranına tek satır `ctx.remindField(route)`; `App.jsx` (plan kurulumu `planAll`'a geçer, `ctx.remindField`, dokunma
dinleyicisinde 77xx ve 78xx yönlendirmesi, Profil'e bildirim özeti, "Tüm verileri sil"); `lib/notifyApply.js` (kendi
aralığına 7700–7709 ve 7800–7859, `threadIdentifier`, `relevanceScore`; eşleşme denetimi aynı kalır);
`screens/ProfileHome.jsx` (Bildirimler bölümü); `screens/Reminders.jsx` (dönüş yeri parametresi);
`screens/Home.jsx` (tek satır `<SkyLine>`); `lib/consent.js` (`weather`, `walk`, `walkDetect`; sürüm rıza başına);
`lib/sources.js` (≈ 17 kaynak, §A.6); `lib/alarm.js` ve `screens/AlarmMorning.jsx` (sabah kartında hava satırı);
`ios/App/App/AlarmPlugin.swift` (`stopIntent`); `ios/App/App/HealthPlugin.swift` (WalkGuard uyanışında yürüyüş sorusu
kontrolü); `FeedbackPlugin.swift` (`AppAudioSession` yürüyüş durumu); `MainViewController.swift` (eklenti kaydı);
`Info.plist`, `App.entitlements` (WeatherKit); `lib/releases.js` (sürüm notu); `site/` gizlilik sayfası.
`lib/notifyPlan.js` ve `lib/reminders.js`'e **dokunulmaz** (gece düzeltmesi ana oturumda yapılıyorsa o hâliyle).

### 5.3 Testler

- **Yeni:** `moduleRemind.test.js` (otomatik saat: 15 dk dilim, farklı gün sayımı, 5 gün eşiği, gece kayıtları dışarıda,
  pencere, 60 dk uzaklık; `doneToday`; 3 gün ufuk; legacy türde çok saatin aynı zarı paylaşması), `notifyAll.test.js`
  (hiçbir iki bildirim 30 dk'dan yakın değil — 20.000 rastgele ayar ve günde; birleştirme metni; gece kuralı her
  kaynakta: 22.00–08.00'de alarm ve alarma bağlı hava dışında bildirim yok, 21.00–09.00'da hareket bildirimi yok;
  7302'nin 10.00'a kayması; toplam bekleyen ≤ 60; kimliklerin 7600–7607'ye dokunmaması), `nefBank.test.js`
  (`nef-bildirim.md` §7.1'deki 50 senaryo ve S11–S16: sayı eşleşmesi, saat eki, uzunluk, yasak kalıp, veriyle
  tutarlılık, bugün/yarın, kilit ekranı gizliliği, dolunay kuralı, döndürme), `sciLine.test.js`, `sky.test.js`
  (yuvarlama 41.0082 → 41.01, 18 saat bayatlık, yaş metni, çevrimdışı ve iOS 15 metinleri), `places.test.js` (en yakın
  ilçe, onay sorusu yalnız kesin konumda), `weatherNotify.test.js` (günde tek bildirim, yağmurun ilk cümle olması,
  "yerelde yenilendi" işaretinde yeniden yazmama), `walkCoach.test.js` (250/500/1000 m eşikleri, saniye yuvarlama,
  parça listesi eksiksiz, ekrandaki cümle = parça dizisinin metni), `walkDetect.test.js` (günde ≤ 2 soru, 3 saat ara,
  iki "Şimdi değil"den sonra o gün yok, gece kuralı), `registry.test.js`'e `remind` doğrulaması.
- **Bilerek değişen beklentiler:** `notifyApply.test.js`'teki kimlik sayısı sınaması (aralık genişler; `kod-haritasi.md`
  Sonuç 12); `registry.test.js`'teki modül listesine `yuruyus`. Başka hiçbir mevcut beklenti değişmez; değişmesi
  gerekirse iş durur ve sahibe sorulur.
- **Değişmeden yeşil kalması gerekenler:** `notifyPlan.test.js`, `reminders.test.js`, `notifyLog.test.js`,
  `today.test.js`, `dataHub.test.js`, `consent.test.js`, `alarm.test.js`, yoganın ve Y1'in bütün testleri, uygulamanın
  bütün takımı.

### 5.4 Eşdeğerlik

- **Yeni özellik kapalıyken:** `planAll` çıktısı, bugünkü `planNotifications` çıktısıyla 20.000 rastgele bağlamda derin
  eşittir (bildirim listesi, günlük, WalkGuard listesi). Taban çizgisi, ana oturumun gece düzeltmesini içeren commit'tir.
- **Legacy türler:** "Bana hatırlat"tan kurulan nefes hatırlatması, Hatırlatmalar ekranından kurulanla aynı ayarı,
  aynı zarı ve aynı günlüğü üretir.
- **Tek hesap:** yürüyüş kaydı Gelişim'de, raporda, dışa aktarmada aynı sayıyı verir; `stepsSource: 'health'` olan
  kayıttaki adım, aynı aralıkta Apple Sağlık uygulamasında görünen sayıya eşittir (cihaz kapısı).

---

## 6. Kalite kapıları ve "bitti" tanımı

**Her parçada sırasıyla:** (1) tasarım Artifact'i iki temada, 390 ve 320 pt'de; (2) 5 saniye kapısı: beş bağımsız
değerlendiricinin en az üçü "etkilendim" der; (3) sahibin onayı; (4) kod ve testler; (5) bütün takım yeşil ve
eşdeğerlik 0 fark; (6) bağımsız iki inceleme (kod ve dil); (7) TestFlight; (8) cihaz listesi; (9) sahibin cihazda bakışı.

**Metin kapısı:** her bildirim ve ekran cümlesi makine denetiminden, iki bağımsız model incelemesinden ve sahibin
onayından geçer. Nef bankası sürümünde ek olarak kör insan değerlendirmesi (sahip ve iki ana dili Türkçe okur, biri
50 yaş üstü); geçme koşulu: olgu ve sayı hatası 0, yasak kalıp 0, dil puanı ortancası en az 4/5 (eşik VARSAYIM).

**Kanıt kapısı:** bilim satırı taşıyan her kaynak yayından önce PubMed'de yeniden açılır; PMID ve DOI'si olmayan ya da
kişi sayısı doğrulanmamış satır yayına girmez.

**Gizlilik kapısı:** rıza metni, gizlilik sayfası, App Store etiketi, izin metinleri ve "Tüm verileri sil" kapsamı
değişen özellikle aynı sürümde güncellenir; biri eksikse sürüm çıkmaz.

**Cihaz listesi (her madde `HATA_GUNLUGU`'na yazılır).**
- B1: üç modülde "Bana hatırlat" → Sen karar ver → bildirimin geldiği saat; elle iki saat; çakışma uyarısı ve birleşik
  bildirim; modüle yeniden girişte "açık" hapı; Profil → Bildirimler çizelgesi; gece 22.00–08.00'de hiçbir bildirim
  gelmemesi (bir gece boyunca, alarm hariç); 21.00'den sonra "kalk" gelmemesi; izin reddi; uygulama kapalıyken gelen
  bildirime dokununca doğru ekran; bilim kartında PMID ve DOI bağlantısı.
- B2: izin penceresi, yaklaşık konum, il ve ilçe seçimi, "Gaziemir'de misin?" sorusu (kesin konum); Ana sayfa satırı
  390 ve 320 pt, iki tema; uçak modu; iOS 15 cihaz ya da benzetici; alarmdan 10 dk sonra bildirim (iOS 26, alarm elle
  durdurulunca metnin taze olduğu; iOS 25'te yaş metni); Planlı Özet açıkken davranış; atıf ve "Veri kaynakları".
- B3: dışarıda en az üç yürüyüş (15, 30, 60 dk): kilit ekranında anonsun sürmesi, müzik çalarken sesin kısılıp geri
  gelmesi, 250 m anonslarının mesafeyle uyumu, bitişte adımın Apple Sağlık uygulamasındaki sayıyla aynı olması
  (yalnız iPhone ve iPhone + Apple Watch ayrı ayrı), Nef sorusunun saatlik uyanışta geldiği an, karar 2 açıksa sorunun
  yürüyüşün kaçıncı dakikasında geldiği, pil tüketimi (60 dk yürüyüşte yüzde kaç), mavi konum göstergesi.

**"Bitti" tanımı (sahibin kuralı):** bir parça ancak cihazda doğrulanır ve kusursuz görülürse `[x]` olur; kodda bitip
cihazda görülmeyen iş `[~]`'dir ve tamamlanmış sayılmaz. Görülmeyen durum varsa "şu durumlara bakmadım" denir.

---

## 7. Aşamalar ve takvim (karar 1'in önerisiyle)

| Adım | İş | Çıktı | Sahip kapısı | Süre (VARSAYIM) |
|---|---|---|---|---|
| B0 (şimdi) | Bu plan, tasarım Artifact'i, 5 saniye kapısı, üç karar | Onay, `DEVIR.md` | Plan ve tasarım | — |
| — | Yoga kodu depoya girer, Build 60 (ana oturum) | | | ana oturumun takvimi |
| B1 | Bildirim çekirdeği, gece kuralı, "Bana hatırlat", Bildirimler, Nef bankası v1, bilim satırı, sources kayıtları | TestFlight | B1 cihaz listesi | 8–10 iş günü |
| B2 | Hava: SkyPlugin, il/ilçe, Ana sayfa satırı, hava sayfası, sabah havası, AlarmKit `stopIntent` | TestFlight, gizlilik sayfası, etiket | B2 cihaz listesi | 8–10 iş günü |
| Y2–Y4 | Onaylı sonsuz yol planı | | kendi kapıları | onaylı plan |
| B3 | Yürüyüş eşliği: modül, WalkPlugin, ekran, sesli koç, ses parçaları (sahibin onayıyla üretim), algılama | TestFlight | B3 cihaz listesi (dışarıda) | 11–13 iş günü |
| B3+ | Canlı Etkinlik (isteğe bağlı) | TestFlight | kilit ekranı cihazda | 3–4 iş günü |
| Y6 | Onaylı plan | | | |
| Site | Bitmiş ve cihazda görülmüş parçalar nefona.com'a (onaylı plan §3.K) | | S8 | — |

Kod ≈ 27–33 iş günü; cihaz denemeleriyle ≈ 7–9 hafta. En büyük belirsizlikler: AlarmKit durdurma niyetinin ağ isteğine
yetip yetmediği, Apple'ın atfı ve "Her Zaman" izni için App Review'un tutumu, hukukçunun hızı, parça birleştirmeli
sesin doğallığı.

---

## 8. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar**
- Cihazda hiçbir şey denenmedi; Swift bu ortamda derlenmiyor.
- Yürüyüşü uygulama kapalıyken anında algılamanın Apple'ın izin verdiği yolu yok; karar 2 hayırsa kısa yürüyüşlerin çoğu
  kaçar.
- Canlı adım, Apple Watch da takılıyken Sağlık'la birkaç dakika farklı görünebilir; bitişte eşitlenir. Sağlık'taki
  kaynak önceliğinin birleştirmeyi nasıl etkilediği belgede yazmıyor. Bugünkü `dailyTotals` ve WalkGuard
  `.strictStartDate` kullanıyor; gece yarısını kesen adım kaydı düşüyor olabilir; cihazda Sağlık uygulamasıyla
  karşılaştırılır.
- Alarmdan 10 dk sonraki taze hava yalnız iOS 26 ve alarmı elle durduran kişide; alarmı yana kaydırmak ya da iOS 15–25
  "Dün akşamki tahmin" metnine düşer.
- **Apple atfı:** hava satırında işaret, yasal bağlantı bir dokunuş ötede. Apple bunu yetersiz bulursa satıra bağlantı
  eklenir (küçük iş). Sahibin kararıyla Apple'a önceden soru gönderilmedi.
- "Her Zaman" konum izni App Review'da gerekçe ister; reddedilirse karar 2'nin anahtarı kalkar, varsayılan yol kalır.
- Etki iddiası yoktur: "Sen karar ver"in üstünlüğü, sesli tempo anonsunun etkisi, hava bildiriminin davranışa etkisi ve
  dil modeliyle üretilmiş bildirimlerin davranış sonucu için PubMed'de deneysel çalışma bulunamadı (`pubmed.md`
  "Bulunamayanlar").
- Telefonun gün toplamındaki adımı %12–22 eksik sayabildiği gösterildi (Amagasa 2019; Duncan 2018), çünkü telefon gün
  boyu taşınmıyor; yürüyüş sırasında sayım iyi (Höchsmann 2018).
- `kod-haritasi.md`'deki `reminders.js` ve `habitLog.js` satır numaraları hatalı (dosyalar 96 ve 48 satır); işlev
  adları doğru. Kod oturumu satır yerine adla arar.

**VARSAYIM listesi:** bildirimler arası 30 dk; hareket penceresi 09.00–21.00, sakin pencere 08.00–22.00; yatmadan önce 60
dk; 7302'nin 10.00'a kayması; "Sen karar ver"de 28 gün, 15 dk dilim, 5 gün eşiği, 15 dk önce, 7 günde bir yeniden hesap;
modül hatırlatmalarında 3 gün ufuk ve en çok 3 saat; toplam bekleyen ≤ 60 ve iOS 64 sınırı; sabah havası varsayılan
07.30 ve alarm + 10 dk; tahmin yaşı eşikleri (1 sa, 18 sa); AlarmKit niyetinde 8–10 sn; kilit ekranı satır sayısı;
başlık 30, Nef cümlesi 70, bilim satırı 100, gövde 160 karakter; bilim satırının günde bir, 7 gün, 14 gün ve 30 gün
kuralları; sıcaklık sözcüğü eşikleri; yürüyüş sorusunda günde 2, 3 saat, iki "Şimdi değil"; son 15 dakika penceresi;
tempo yumuşatma 30 sn; saniyenin 5'e yuvarlanması; ses parçası sayısı; Sağlık yenileme 2 dk; ilçe tablosunun 974
kaydı; App Store etiketinde yerelde kalan verinin "toplanan" sayılmaması; B1–B3 süreleri.

---

## 9. Kaynakça (bu planda anılanlar; PMID ve DOI'ler notlarda PubMed kaydından)

Tam tablo, tür, kişi sayısı ve sınırlarla `arastirma/pubmed.md`'dedir; aşağıdaki PMID'ler oradan ve depodaki kaynak
listelerinden alınmıştır. Plana girerken her biri yeniden açılır (kanıt kapısı).

- Bildirim ve hatırlatma: Klasnja 2019 (PMID 30192907), Morris 2020 (PMID 33322678), Bell 2023, Stecher 2021, Morrison
  2017, Schumacher 2019, Fournier 2017, Peng 2022, Wrzus 2023, Jones 2019, Stothart 2015 — PMID ve DOI `pubmed.md` A, B.
- Gece ve uyku: Carter 2016, Van den Bulck 2007, Exelmans 2016, Brosnan 2024, Stutz 2019, Frimpong 2021 — `pubmed.md` C.
- Hareketsizlik: Evans 2012, Swartz 2014, Murtagh 2020 (Cochrane), Zhao 2023, Yerrakalva 2017, Compernolle 2021 —
  `pubmed.md` D.
- Yürüyüş ve tempo: Tudor-Locke 2019, Tudor-Locke 2020, McAvoy 2021, McAvoy 2023 — `pubmed.md` E.
- Sesli koç ve güvenlik: Terry 2020, Singh 2023, Schwebel 2012, Simmons 2020 — `pubmed.md` F.
- Hava: Tucker ve Gilliland 2007 (PMID 17920646), Klimek 2022 (PMID 35151273), Denissen 2008 (PMID 18837616), Togo 2005,
  Ho 2022, Toloo 2013 — `pubmed.md` G ve onaylı plan §3.E.4.
- Kişiye uyarlama ve dil modeli: Noar 2007, Hao 2023, Krebs 2010, Schlicht 2026, Zaleski 2024 — `pubmed.md` H.
- Ölçüm doğruluğu: Höchsmann 2018, Amagasa 2019, Duncan 2018, Werner 2023, Gilgen-Ammann 2020 — `pubmed.md` I.
- Bilim satırı örnekleri: Fincham 2023 (PMID 36624160), Laborde 2022 (PMID 35623448), Talens-Estarelles 2022 (PMID
  35963776), Kim 2020 (PMID 32409236), Wolffsohn 2025 (PMID 40467388), Moszeik 2025 (PMID 40373021), Radin 2025 (PMID
  39808431), Stout 2022 (PMID 35283036), Desai 2026 (PMID 41864748), Yamashita 2021 (PMID 34065588), Sturm 2020 (PMID
  32955293); ay: Cajochen 2013 (23891110), Haba-Rubio 2015 (26498230), Chaput 2016 (27047907), Smith 2017 (27928860),
  Casiraghi 2021 (33571126).

## İnceleme izi

- 2026-09-30: araştırma (beş bağımsız ajan: kod, Apple yürüyüş, Apple hava ve bildirim, PubMed, Nef); plan taslağı.
- Sırada: iki bağımsız eleştiri (doğruluk, eksiklik), düzeltme, tasarım, 5 saniye kapısı.
