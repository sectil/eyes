# Bildirimler, hava ve yürüyüş eşliği · Plan (sürüm 1, tur 1 düzeltmeli)

Tarih: 2026-09-30. Durum: **TASLAK, sahibin onayını bekliyor.** Uygulama koduna (`app/`) dokunulmadı, ücretli çağrı
yapılmadı. Kod onaydan sonra ana oturumda yazılır (`DEVIR.md`). Sahibin sözleri kelimesi kelimesine: `SAHIP_ISTEKLERI.md`.
Tasarım: `tasarim.html`. Dayanaklar `arastirma/` altında: `kod-haritasi.md`, `apple-hava-bildirim.md`, `apple-yuruyus.md`,
`pubmed.md`, `nef-bildirim.md`; okunan Apple sayfaları `arastirma/apple/` ve `arastirma/apple-json/`. Eleştiriler:
`elestiri-dogruluk.md`, `elestiri-eksiklik.md` (bulguları bu sürüme işlendi, §10).

---

## 1. Tek sayfada

**Kişi ne görür**
1. **Sabah, kilit ekranında (alarm 06.00):** 06.10'da Nef: *"Yağmur 21.00'de · Bugün 21.00–22.00 arası yağmur bekleniyor.
   Yürüyüşü 21.00'den önce bitirirsen şemsiyeye gerek kalmayabilir."*
2. **Ana sayfada, adımların üstünde:** *"İzmir Gaziemir · 23° · 21.00'de yağmur"*. Dokununca saat saat tahmin ve Nef'in
   yorumu.
3. **Yürürken:** *"Yürüyüşe mi çıktın? · Son 15 dakikada 1,1 km yürüdün. Hava 23 derece, yürüyüş için güzel. Eşlik edeyim
   mi?"* Dokununca Apple Watch gibi dört büyük sayı: süre, şu anki tempo, mesafe, adım. Sesli koç 250 metrede bir
   *"Son 250 metre: kilometrede 9 dakika 40 saniye"*, her kilometrede *"1. kilometre 9 dakika 50 saniyede"* der.

Her modülün sonunda tek dokunuşluk **"Bana hatırlat"**; saati Nef seçer ya da kişi seçer. Profil → **Bildirimler**'de
hepsi tek listede ve günün çizelgesinde. Hiçbir iki bildirim aynı yarım saate düşmez; gece 22.00–08.00 alarm dışında
hiçbir bildirim gelmez; 21.00'den sonra "kalk" gelmez. Her bildirimin arkasında bir PubMed çalışması durur.

**Senden üç karar (önerimle)**
1. **Sıra.** Y1'in kodu hazır, cihazda denenmedi; Ana sayfa şu an yeniden tasarlanıyor. Öneri: yoga kodu ve Build 60 →
   **B1** bildirimler ve "Bana hatırlat" → **B2** hava (onaylı plandaki Y5'in yerine, Y2–Y4'ün önüne alınarak) → Y2 → Y3 →
   Y4 → **B3** yürüyüş eşliği → Y6. Gerekçe: B1 gece "kalk" sorununu kalıcı kapatır ve her modüle aynı anda değer katar;
   havayı şimdi istedin ve Y5'in araştırması hazır; yürüyüş en büyük parça (Swift, dışarıda cihaz denemesi, yeni ses
   kayıtları). Öbür seçenek: B3'ü B2'nin hemen arkasına almak; yürüyüş ≈ 3 hafta öne gelir, Y2–Y4 o kadar kayar.
2. **Yürürken fark etmek için "Her Zaman" konum izni.** Öneri: ayrı bir anahtar, **"Yürürken beni fark et"**, varsayılan
   kapalı. Apple, uygulama kapalıyken yürüyüşü görmeye yalnız bu izinle izin veriyor: telefon ≈ 500 m yer değiştirince
   uygulamayı uyandırır, en sık 5 dakikada bir. Açan kişiye Nef yürüyüşün 5–10. dakikasında sorar (hesap; cihazda
   denenmedi; ağ yoksa daha geç). Kapalıyken Nef yürüyüşü Apple Sağlık'ın en sık saatlik uyanışında görür ve yalnız kişi
   hâlâ yürüyorsa sorar; kısa yürüyüşlerin çoğu kaçar. Konum telefondan çıkmaz. Bedeli: kimi kişi güvensizlik duyabilir;
   App Review gerekçe ister. Hukukçu cevap verene kadar bu anahtar yayına girmez (§4).
3. **Nef'in dili ve bilim satırı.** Öneri: **cümle bankası.** Senin "ucuz model, istemle zeki" isteğin bankayı üretirken
   uygulanır: model yüzlerce cümleyi bir kez üretir; makine denetimi, başka bir modelin incelemesi ve senin onayından
   geçenler uygulamaya gömülür; telefon her bildirimde o güne uyan cümleyi seçip sayıları kendisi yazar. Banka sürümü
   başına ≈ 1 USD (güçlü modelle bile; istersen ucuz modelle de üretilir, kalite değerlendirmede ölçülür), yeni rıza
   yok, ağsız çalışır, uydurma sayı olamaz. **Her bildirim** bir PubMed kaynağına bağlıdır ve dokununca bilim kartı
   (bulgu, kişi sayısı, sınır, makale bağlantısı) açılır; bildirimin **içinde görünen** bilim satırı günde bir
   bildirimde olur (tekrar yorgunluğu). Öbür seçenek her bildirimde canlı model: 10.000 kişide ayda ≈ 374 USD, ayrı açık
   rıza, hukukçu onayı; hava ve konum yine gönderilemez; ağ yoksa bildirim eski metne düşer.

**Verdiğim kararlar** (itiraz edersen değişir)

| Karar | İtiraz edersen |
|---|---|
| Nefes, mola, su ve yürüyüş hatırlatması günde **bir** saat kalır; başka modüllerde en çok üç saat. Neden: bu dört tür bildirim deneyinde; bugünkü kod ve senin 27 Eylül "ölçelim" kararın gün başına tek bildirim sayıyor | Deney kapanır ya da yeniden tasarlanır; bu dört türde de üç saat açılır |
| Deneyin bildirim göndermediği günde yürüyüş sorusu da gelmez (yalnız yürüyüş hatırlatmasını açmış kişide) | Soru her gün gelir; yürüyüş deneyinin sonucu bulanıklaşır |
| Yürüyüş sorusu kilit ekranında mesafeyi gösterir (senin cümlen); onaylı "kilit ekranı nötr" kuralının istisnası. Bildirimler'de "Kilit ekranında sayı gösterme" anahtarı var | Kilit ekranında yalnız "Yürüyüşe mi çıktın?" görünür, ayrıntı kilit açılınca |
| Sesli koç sayıları söyler ve aynı cümle ekranda yazar; tempo son 250 metrenin ortalamasıdır | Anons "yaklaşık 9 buçuk dakika" gibi söyler |
| Bildirim metinlerinde sayılar rakamla, sıcaklık sözcüğü hissedilen sıcaklığa göre | Sayılar yazıyla; gerçek sıcaklık |
| "İdeal sıcaklık" denmez, "yürüyüş için güzel" denir; evrensel bir ideal sıcaklık bulgusu yok | "İdeal" yazılır (dayanaksız) |
| Bilim satırında ölüm ve hastalık riski bulgusu kullanılmaz; dolunay yalnız takvim anıdır, "ay uykunu bozar" yazılmaz | Kullanılır (sağlık iddiası riski) |
| Nefona Apple Sağlık'a yazmaz; bu yüzden iPhone'daki egzersiz oturumu (yazma izni ister) kullanılmaz | Yürüyüşler Sağlık'ta antrenman olarak görünür, yeni izin |
| Ana sayfadaki hava için Apple'a soru gönderilmez (senin kararın); Apple'ın kuralı satırın kendisinde karşılanır: satırda "Apple Weather" işareti **ve** "Veri kaynakları" bağlantısı görünür | — |

**Dürüst sınırlar (ayrıntı §8):** yürüyüşü uygulama kapalıyken anında görmenin tek yolu karar 2; yürürken ekrandaki
canlı adım telefonun sayımıdır, bitişte Apple Sağlık'taki sayı kaydedilir; alarmdan sonraki taze hava yalnız iOS 26'da
ve alarmı elle durduran kişide mümkündür, ötekilerde bildirim tahminin yaşını söyler; cihazda hiçbir şey denenmedi.

**Süre (VARSAYIM):** B1 8–10, B2 8–10, B3 12–14 iş günü; B3+ Canlı Etkinlik 3–4. Cihaz denemeleriyle ≈ 7–9 hafta.

---

## 2. Onaylı kararlarla ilişki (değişen her şey burada)

| Onaylı karar | Kaynak | Bu plan | Neden |
|---|---|---|---|
| Hava Y5'te, Y1–Y4'ten sonra | `SONSUZ_YOL.PLAN.v1.md` §1 karar 1, §3.I | B2 Y5'in yerine geçer; sıra karar 1 | Sahip havayı şimdi istedi |
| Başlıkta yalnız ay; hava yalnız tam atıflı kartta; alarm kartlarında hava yok (App Review yedeği) | §1 son paragraf, §3.H; `S0/app-review-sorusu.md`; S0 karar 10 | Kalkar. Hava satırı Ana sayfada adımların üstünde; satırda işaret ve "Veri kaynakları" bağlantısı; alarm kartlarında bir satır hava | Sahip, 2026-09-30 (`SAHIP_ISTEKLERI.md` madde 1). Atıf kuralı: "you must clearly display the Apple Weather trademark ( Weather), as well as the legal link to other data sources" (`arastirma/apple-json/weatherkit_get-started.txt`) |
| Hava tarih satırında | §3.E.7 | Adım bilgisinin hemen üstünde, kendi başına çalışan bileşen | Sahibin tarifi; Ana sayfa yeniden tasarlanıyor |
| Teklif metni "Bulunduğun yerin havasını da göstereyim mi?"; hukukçu yedeğinde "Şehrinin havasını da göstereyim mi?"; 7. gün koşulu | §3.E.7; S0 karar 11 | Metinler aynen; 7. gün koşulu kalkar (teklif ilk günden, günün ilk dokunuşundan sonra) | Sahip satırı Ana sayfada istedi |
| "(yaklaşık)" yalnız konumdan bulunan il için | S0 karar 12 | Aynen | — |
| Konum: yaklaşık konum ya da 81 il | §1 karar 4, §3.E.2 | İl ve ilçe; ilçe listeden seçilir ya da kesin konumda onayla önerilir | Sahibin örneği "İzmir Gaziemir"; yaklaşık konum 1–20 km sapıyor, Gaziemir'in 20 km çevresinde 9 ilçe merkezi var (`apple-hava-bildirim.md` §8.3) |
| Yağmur bildirimi ayrı tercih, varsayılan kapalı, ilk yağmurlu günde bir kez sorulur; 7700–7701 | §3.E.6 | "Sabah havası" bildiriminde birleşir (günde tek hava bildirimi; yağmur varsa ilk cümle yağmur). İlk yağmurlu gün sorusu kalır: sabah havası kapalı kişiye bir kez. Kimlik 7700–7701 | Apple HIG: aynı konu için birden çok bildirim gönderilmez (`apple-hava-bildirim.md` §4.4) |
| Bildirimde "Kaynak: Apple Weather" | S0 karar 15 | Aynen | — |
| "Yeni izin yalnız 'Uygulamayı Kullanırken'; arka planda konum yok" | §1 gizlilik, §3.E.2 | Hava için aynen. Yürüyüş sırasında konum arka plan kipiyle sürer (kişi başlattığı yürüyüşte, mavi göstergeyle); "Her Zaman" yalnız karar 2 | Kilit ekranında 250 m anonsu başka yolla olmaz |
| Push reddedildi (konum sunucuya giderdi) | §3.E.6 | Aynen; push yok | — |
| "Nef hava verisi üretmez; cümle sabit şablondan" | §3.E.1 | Aynen: bankadaki cümle üslubu verir, sayı ve saat WeatherKit'ten ve telefondaki koddan | Dil modeli ölçüm kaynağı olamaz |
| Deney türlerinde günde en çok 1 bildirim; sessiz günler | `BILDIRIM_PLANI.md` §3, §6; sahip kararı 3 (2026-09-27) | Aynen (Verdiğim kararlar, satır 1–2) | Ölçüm bozulmasın |
| Bildirim penceresi 09.00–21.00 | `BILDIRIM_PLANI.md` §3 | Deney türlerinde aynen; yeni kaynaklarda §3.A.4'teki pencereler | Sahip: gece "kalk" yok, 21'den sonra "kalk" yok |
| Çalışma oturumu molası `timeSensitive` | `BILDIRIM_PLANI.md` §5 | Değişmez. Yeni bildirimlerin hepsi `active` | Apple HIG: Time Sensitive yalnız "happening now or will happen within an hour" |
| Kilit ekranı nötr, adım bilgisi yok | `BILDIRIM_PLANI.md` §7 | Yürüyüş sorusunda istisna, anahtarla (Verdiğim kararlar) | Sahibin cümlesi |
| `health` rızası: "Sunucuya ve Nef'e gitmez"; Apple Sağlık yalnız okuma | `lib/consent.js` | Aynen. Yürüyüş kaydı `store.sessions`'a yazılmaz, Nef'e gitmez (§3.C.2) | Nef paketi v2 değişmesin |
| (e) yürüyüş modülü sonra | §3.I, `YOL.moduller.md` (modül `walk`, "2 dakikalık yürüyüş") | B3'te gelir; modül kimliği `walk` | Sahibin isteği |

**Ana oturuma bildirilecek (bu planın işi değil).** (1) Gece "kalk": çalışma oturumu bildirimleri pencereye bakmıyor
(`lib/notifyPlan.js`, `planNotifications` içindeki oturum döngüsü; ana oturum düzeltiyor). (2) Aynı yoldan başka gece
bildirimleri: Çalışma günleri saati pencereye bakılmadan kurulur; 7302 deneme bildirimi denemenin başladığı saate kurulur
(23.40'ta başlayan deneme 5 gün sonra 23.40'ta çalar); 7301 "Mola bitti" molanın bittiği ana kurulur. (3) Oturumun son
bildirimi ile aynı dakikadaki bir hatırlatma bugün de üst üste gelebilir (`inFocus` bitiş anını dışarıda bırakıyor).
(4) AlarmKit ertelemesi geri sayım sunumu kullanıyor, projede widget uzantısı yok; Apple: "the system may unexpectedly
dismiss alarms and fail to alert" (`apple-hava-bildirim.md` §9). B1 bunlara dokunmaz; eşdeğerlik tabanı ana oturumun
düzeltmesinden sonraki commit'tir (§5.4).

---

## 3. Ayrıntı

### A. B1 · Bildirim çekirdeği ve "Bana hatırlat"

**İlk 5 saniye:** modül biter, özetin altında "Bana hatırlat" kartı ve sağında Nef'in önerdiği saat soluk yazıyla.

#### A.1 Manifest yeteneği `remind`

Hatırlatma modül sözleşmesinin (`modules/registry.js`) yeni isteğe bağlı alanıdır. Alanı olan her modülün bitiş
ekranında kart kendiliğinden çıkar ve Bildirimler listesine girer; yeni bir modül bu alanı yazınca başka hiçbir dosya
değişmeden hatırlatma kazanır.

```js
//   remind?: {                          "Bana hatırlat" (components/RemindField.jsx) ve Profil → Bildirimler.
//                                       Planı lib/moduleRemind.js kurar. Yoksa modülde kart çıkmaz.
//     route?: string,                   dokununca açılacak ekran: routes'tan biri. Yoksa kartın gösterildiği ekran.
//     legacy?: 'mola'|'walk'|'breath'|'water',
//                                       hatırlatması bildirim deneyindeki mevcut tür (lib/reminders.js): ayar
//                                       settings.reminders.types[legacy]'ye yazılır; tek saat, 09.00–21.00, zar ve
//                                       sessiz gün, "bugün yaptıysan gönderme" aynen işler.
//     window?: 'move' | 'calm',         legacy yoksa: 'move' 09.00–21.00 (kalk, göz hareketi, oyun), 'calm' 08.00–22.00
//                                       (nefes dışı sakin pratikler: yoga, dalga, gökyüzü, Yön). Yoksa 'move'.
//     defaultTime?: 'HH:MM',            "Sen karar ver" için veri yokken saat; kendi penceresinde
//     maxTimes?: 1 | 2 | 3,             elle seçilebilecek en çok saat (legacy'de her zaman 1; varsayılan 3)
//     doneToday?(sessions, now) → bool  bugün yapıldıysa o günün kalan hatırlatması kurulmaz. Yoksa
//                                       progression.match ?? sessions.match tutan bugünkü kayıt.
//     science: ['sourceKey', …],        bilim kartı havuzu (lib/sources.js anahtarları, en az 1; §A.6)
//   }
```

`validateManifest` bugün bilinmeyen alanı reddetmez. Yeni kurallar: `remind` nesnedir; `route` `routes`'ta olur;
`legacy` dört türden biridir ve varsa `maxTimes` 1'dir; `defaultTime` penceresindedir; `doneToday` işlevdir;
`science`'taki her anahtar `sources.js`'te `pmid` ve `doi` taşır. `createRegistry` bir `reminders()` erişicisi kazanır.

| Modül | `remind` |
|---|---|
| routine (göz egzersizleri) | route `routine-…` yerine yol (`home`) açılır; window `move`; Çalışma günleri (`study`) ayrı kalır, aynı güne 30 dk'dan yakın düşerse tek bildirimde birleşir |
| blink, snake, track, tek-bakis, quick-look, fark-ettin, notice | kendi rotası, `move` |
| yoga, dalga, gokyuzu, yon | kendi rotası, `calm`; dalga uyku kipi hatırlatılmaz |
| breath, mola, water | legacy aynı adla; breath rotası `breath-1` |
| walk (B3) | legacy `walk` |
| weekly, daily, reading, who5, alarm, awareness, emekliler | yok (haftalık ya da kendi aralığında; alarm kendisi bir saat) |

Ayar `settings.moduleReminders`: `{ [modül]: { on, mode: 'auto'|'manual', times: ['HH:MM'], autoAt, setAt } }`, yol için
ayrıca `path`. `settings.reminders` kullanılmaz: `normalizeReminders` bilmediği alanı atar ve Hatırlatmalar ekranı her
kayıtta normalize edilmiş nesneyi yazar (`kod-haritasi.md` Sonuç 7). Legacy türlerin tek kaynağı `settings.reminders`
kalır; `moduleReminders` onlar için yalnız `mode`'u tutar.

#### A.2 Kart, saat sayfası, "açık" durumu

- **Yol ve modül.** Birim yoldur: yolun içinde açılan modülde kart çıkmaz. Yol bitince tek kart: **"Yolunu her gün
  hatırlatayım mı? Genelde 08.30'da başlıyorsun."** Bu hatırlatma Ana sayfayı açar. Modül yolun dışında (Ana sayfadaki
  bölümlerden, Bilgi'den) açılıp bittiğinde modülün kendi kartı çıkar.
- **Kart (ortak bileşen `components/RemindField.jsx`):** bitiş özetinin altında, "Ana sayfaya dön"ün üstünde; solda zil
  simgesi yumuşak vurgu zemininde, "Bana hatırlat", altında "Her gün, senin için uygun saatte. Saati Nef de seçebilir.",
  sağda ok. App modül ekranına `ctx.remindField(route)` verir; her modülde bitiş bloğuna tek satır eklenir (modül başına
  ≈ 2 satır; ortak bir bitiş bileşeni bugün yok, `kod-haritasi.md` §3.3).
- **Saat sayfası (alttan açılır):**
  - **Sen karar ver** (üstte, "Önerilen"): büyük saat ve Nef'in nedeni: *"Nefesi genelde 09.30 ile 10.00 arasında
    yapıyorsun. 09.15'te hatırlatayım; iki hafta sonra yeniden bakarım."* Veri yoksa: *"Henüz saatini bilmiyorum. 16.30'la
    başlayalım; beş kez yaptıktan sonra senin saatine göre ayarlarım."* Kişi günde iki ayrı saatte yapıyorsa iki saat
    önerir: *"Göz egzersizini genelde 10.00'da ve 18.00'de yapıyorsun. İkisinde de hatırlatayım mı?"* [İkisinde]
    [Yalnız sabah].
  - **Saatleri ben seçeyim:** büyük saat seçici, "Bir saat daha" (en çok 3; legacy'de 1).
  - **Çakışma anında söylenir:** *"12.30'da Mola hatırlatman var. İkisi aynı anda gelmesin; 13.00'e ne dersin?"*
    [13.00'ü seç] [Tek bildirimde birleştir].
  - Pencere cümlesi türüne göre: *"Göz egzersizi hatırlatması 09.00–21.00 arasında gelir."* Legacy türde bugünkü cümle
    (`screens/Reminders.jsx`): *"Bazı günler bilerek göndermiyoruz; hatırlatmanın işine yarayıp yaramadığını Gelişim'de
    görmen için."* ve *"Bu hatırlatma günde bir kez."*
  - Bildirim izni yoksa önce bizim tek cümlemiz (*"Hatırlatmayı sana bildirimle göndereceğim; bir sonraki pencerede izin
    istenecek."*), sonra iOS penceresi. Reddedildiyse bugünkü metin: *"Bildirimler kapalı: Ayarlar > Nefona > Bildirimler."*
- **Kurulunca:** kart küçülüp hapa döner, onay titreşimi verir: **"Hatırlatma açık · her gün 09.15 · Nef seçti"**. Aynı
  hap modülün giriş ekranında üstte görünür. Hap her açılışta izin durumunu okur; izin sonradan kapatıldıysa *"Hatırlatma
  kurulu ama bildirimler kapalı · Ayarları aç"* der.
- **Ana sayfada teklifler:** günde en çok bir teklif (bildirim izni → hava → yürüyüş eşliği sırasıyla); reddedilen
  teklif 30 gün sorulmaz (VARSAYIM).

#### A.3 "Sen karar ver"

- **Veri:** bu modülün (yolda yolun) son 28 günkü kayıtlarının yerel saati (`sessions[].date`; varsa başlangıç ≈
  `date − seconds`; habit-log `at`). Gece kayıtları (Dalga uyku kipi, alarm) sayılmaz. Açılış saati bugün tutulmuyor
  (`lib/dayOpen.js` Y3'te gelecek); gelince o da girer. Dilimleme kaydın kendi yerel saatiyle yapılır; saat dilimi
  değişince plan yeni yerel saatte kurulur.
- **Seçim:** her 15 dakikalık dilimde "kaç farklı günde bu dilimde başlandı" sayılır, komşu dilimlerle yumuşatılır;
  pencere içinde en çok günde kullanılan dilim seçilir ve hatırlatma o dilimden 15 dakika önceye kurulur (VARSAYIM; işi
  başlamadan önce anmak için). Başka bir bildirimle arası 60 dakikadan azsa bir sonraki uygun dilime kayar. Beş gün
  kaydı yoksa `remind.defaultTime`. İkinci saat, aynı günde ilkinden en az 2 saat uzak ikinci bir dilimde en az 5 günlük
  kayıt varsa önerilir.
- **Yeniden hesap:** 14 günde bir. Deney türünde saat yalnız kişi onaylarsa değişir: *"Nefesi son iki haftada 09.15'te
  yapıyorsun. Hatırlatmayı oraya alayım mı?"* Deney dışı modülde kendiliğinden değişir ve Bildirimler'de tek satırla
  söylenir.
- **Dayanak ve sınır:** planlama müdahaleleri fiziksel etkinliği küçük–orta ölçüde artırdı (Peng 2022, 41 RKÇ). Sabit
  bir günlük rutine bağlanan hatırlatma meditasyon uygulamasının günlük kullanımını artırdı; kişiye özel bağlama sabit
  olandan iyi değildi (Stecher 2021, RKÇ, 101 kişi). Bağlama göre seçilen bildirim saati, önceden belirlenmiş bir saat
  aralığından daha iyi çıkmadı (Morrison 2017, keşif amaçlı RKÇ, 77 kişi). Bu yüzden "Sen karar ver" bir kolaylıktır;
  "daha etkili" denmez.

#### A.4 Tek plan, çakışmasızlık, gece

- **Tek planlayıcı.** `planAll` bütün kaynakları birlikte dizer: bugünkü `planNotifications` (dokunulmaz),
  `planModuleReminders`, sabah havası (B2), yürüyüş sorusunun yasak dilimleri (B3). `notifyApply` tek listeyi uygular.
- **Çakışma ("asla üst üste binmez"):** alarm ve alarma bağlı sabah havası dışında iki bildirim arasında en az 30 dakika
  olur (VARSAYIM). (1) Kişinin elle seçtiği saat kaymaz; aynı 30 dakikaya düşen modül hatırlatmaları tek bildirimde
  birleşir: *"Nefes ve göz egzersizin hazır. Hangisiyle başlarsın?"*; dokununca Ana sayfa açılır, birleşik bildirim bilim
  satırı taşımaz. (2) "Sen karar ver" saati boş dilime kayar. (3) Deney türünün saati kaymaz ve onaylı nedenler
  dışında düşmez. (4) Çalışma oturumu sürerken modül hatırlatmaları da gelmez (onaylı kuralın genişlemesi). Kurulum
  anında 60, planlamada 30 dakika: ilki ayar kuralı (bugünkü `MIN_GAP_MIN`), ikincisi planlayıcının güvenlik ağıdır.
- **Günlük tavan:** modül hatırlatmalarından günde en çok 6 bildirim (VARSAYIM); fazlası birleşir. Dördüncü modül
  hatırlatması açılırken onaylı Wilson notu çıkar; seyreltme sorusu ("Gün aşırı?") modül hatırlatmalarına da uygulanır.
- **Bildirim Merkezi'nde yığılma yok:** bütün Nefona bildirimleri tek grup (`threadIdentifier: 'nefona'`); bir modülün
  yeni bildirimi gelince ya da uygulama açılınca o modülün teslim edilmiş eski bildirimleri kaldırılır.
- **Gece kuralı (yeni kaynaklar için; bugünkü kaynakların gece sorunları ana oturumda):**

| Tür | Pencere |
|---|---|
| Hareket isteyen hatırlatmalar (`move`, legacy mola ve yürüyüş) | 09.00–21.00 |
| Sakin pratikler (`calm`) | 08.00–22.00 |
| Legacy nefes ve su | Bugünkü kural: 09.00–21.00; su en geç 18.00 |
| Yürüyüş sorusu (kişi o an yürüyor) | 07.00–23.00; kişiyi harekete çağırmaz, yürüyene eşlik önerir |
| Sabah havası | Alarma bağlıysa alarmdan sonra; alarmsız günde en erken 08.00 |
| Hiçbir bildirim | 23.00–07.00 (alarm dışında) |

  Gece sessizliğinin başlangıcı 21.00–24.00, bitişi 06.00–10.00 arasında Bildirimler'den değiştirilebilir (vardiyalı
  çalışanlar); hareket bildirimleri her ayarda sessizlik başlamadan en az bir saat önce biter; 01.00–05.00 hiçbir ayarla
  açılmaz. Alarm kuruluysa ve yatma saati hesaplanabiliyorsa (`lib/alarm.js` `bedtimeFor`) yatmadan önceki 60 dakikada
  hatırlatma gelmez; Uykuya Geçiş dersi istisnadır (yatma saatinden en çok 30 dk önce). Saatler VARSAYIM.
- **Dayanak ve sınır:** yatakta telefon kullanmak ve gece telefonla uyanmak kötü uyku ve yorgunlukla tutarlı biçimde
  ilişkili; çalışmaların çoğu çocuk ve ergenlerde, yetişkinde Exelmans 2016 (844 kişi); hepsi gözlemsel (`pubmed.md` C).
  "21.00'den sonra kalk yok" uyku zararına dayanmaz: akşam egzersizi uykuyu genel olarak bozmuyor (Stutz 2019; Frimpong
  2021). Bilgisayardan gelen kalk uyarıları iş saatinde uzun oturma sürelerini azalttı, toplam oturma anlamlı değişmedi
  (Evans 2012, 28 kişi); akşam için çalışma yok.
- **Sayı bütçesi:** bugün en kötü durumda 48 bildirim bekler, sabah havasıyla 50 (`kod-haritasi.md` Sonuç 2). 64 sınırı
  UserNotifications belgelerinde yok, yalnız eskimiş `UILocalNotification` sayfasında geçiyor. Güvenli taraf: toplam
  bekleyen ≤ 60. Deney türlerinin 7 günlük planı kırpılmaz; modül hatırlatmaları önce 3 gün kurulur, yer yoksa ufuk yarına,
  sonra bugüne iner (plan her açılışta yeniden kurulur). `repeats`'li takvim tetiği kullanılmaz: tek bir günü atlayamaz.
- **Kimlikler:** bugünkü 7400–7499, 7500–7509, 7301, 7302, 7600–7607 dokunulmaz. Yeni: 7700–7701 sabah havası, 7710–7719
  yürüyüş sorusu (Swift kurar ama sayısal kimlik ve Capacitor'ın beklediği `extra` biçimiyle; dokunuş tek
  `onNotifyTap`'tan dağıtılır), 7800–7859 modül hatırlatmaları. Swift'in kurduğu bildirimin dokunuşunun Capacitor
  dinleyicisine ulaştığı doğrulanmadı (risk; cihaz listesi).

#### A.5 Profil → Bildirimler

- **Yer:** Profilim'de Alarm bölümünden sonra (`screens/ProfileHome.jsx`); veriyi App, alarm özetinin kalıbıyla hazırlar.
  Bugünkü Hatırlatmalar ekranı (`screens/Reminders.jsx`) deney türlerinin ve çalışma oturumunun ayrıntı ekranı olarak
  kalır; tek değişikliği dönüş yerinin parametreye bağlanması.
- **Üstte günün çizelgesi:** 06–24 arası tek çizgi; her bildirim bir nokta; gece bölümü taralı, altında *"22.00–08.00
  gece sessiz · alarmın ve ona bağlı sabah havası hariç"*. Başlık: *"Bugün 7 bildirim · hiçbiri üst üste değil"*. 60
  dakikadan yakın iki nokta dar ekranda tek noktada birleşir ve üstünde sayı yazar.
- **Liste:** telefonun kurabildiği her bildirim kaynağı bir kez görünür. "Modüllerin" (yol, her "Bana hatırlat", deney
  türleri de kendi modülüyle; saat, "Nef seçti" ya da "senin saatin", anahtar), "Nef'in haberleri" (Sabah havası, Yürüyüş
  eşliği, Yürürken beni fark et), "Değiştirilemeyenler" (Alarm → Profil'deki Alarm; deneme raporu; gri, nedeniyle),
  "Gece sessizliği" (saatler), "Kilit ekranında sayı gösterme". Satıra dokununca saat sayfası açılır; kapatılan satır
  listede kalır.
- Ana anahtar kapalıysa bütün satırlar gri ve üstte *"Bildirimler kapalı"* yazar (bugünkü `cancelOwn` davranışı).
- Uygulama silinip kurulursa hatırlatmalar sıfırdan başlar; eski kayıtlar varsa "Sen karar ver" aynı saati yeniden bulur.

#### A.6 Nef'in bildirim dili ve bilim kartı

- **Uzunluk:** başlık ≤ 30 karakter. Bilim satırı yoksa gövde ≤ 110; varsa Nef cümlesi ≤ 70, bilim satırı ≤ 100, gövde
  ≤ 160 (kilit ekranında görünen satır sayısı Apple belgesinde yok; VARSAYIM).
- **Zeki cümle türleri** (bankanın iskeleti; örnekler `nef-bildirim.md` §2.5, §3.4, §10.5):

| Tür | Örnek |
|---|---|
| Hatırlatılacak eşya | "Çıkarken şemsiyeyi çantana koymayı unutma." |
| Zamanlama | "Yürüyüşü 21.00'den önce bitirirsen şemsiyeye gerek kalmayabilir." |
| Kişinin alışkanlığı | "Her zamanki 18.00 yürüyüşün yağmurdan önceye denk geliyor." |
| Kendi düne göre | "Dünkünden 4 dakika uzun yürüdün." |
| Engeli seçeneğe çevirme | "Yürüyüş bugün içeride de olur: koridor turu da adımdır." |
| Takvim anı | "Bu gece dolunay. Aya bakarak 3 dakika yavaş nefes: bu akşamın küçük töreni." |
| Aradan dönüş | "5 gün ara verdin; basamağın aynı. Bugün nefes 2 dakika, hazırsan başlayalım." |
| Kararı kişiye bırakma | "Bugünkü tur da hazır; seçim senin." |

- **Banka yöntemi (karar 3):** model rakam, saat ya da hava sözcüğü yazamaz, yalnız yer tutucuyla çağırır
  (`{rainFrom:LOC}` → "21.00'de"); rakam içeren aday otomatik atılır. Sayıyı ve Türkçe eki telefondaki kod yazar (saat
  ekleri okunuşa göre tablodan: "21.00'de", "19.00'da", "15.00'ten") ve birim testiyle sınanır. Sabah havası ve yürüyüş
  sorusu Swift'te de kurulduğu için şablonlar JS'de her olası saatle **doldurulmuş hâlde** üretilip Swift'e yazılır;
  Swift yalnız seçer, ek kurmaz.
- **Yasaklar:** emoji, ünlem yağmuru, "-malısın", korkutma, suçlama, sağlık iddiası ("iyileştirir", "korur",
  "kanıtlandı", "bilimsel olarak"), başkasıyla karşılaştırma. Hava için "yağacak" değil "bekleniyor".
- **Bilim kartı:** her bildirim bir `evidence` anahtarı taşır; dokununca açılan ekranın üstünde kart durur: tek bulgu,
  tür, kişi sayısı, süre, sınır cümlesi, künye, PubMed ve DOI bağlantısı. Kartta yıl olarak basım yılı yazılır (Kim 2020
  gibi e-yayın yılı farklıysa ikisi birden). İsteğe bağlı: bildirimde "Kaynağı gör" eylem düğmesi (uygulamayı ön plana
  açar; cihazda denenir).
- **Görünen bilim satırı:** günde en çok bir bildirimde (öncelik: kişinin kurduğu hatırlatma > yürüyüş > mola > su >
  hava); aynı satır 7 gün içinde tekrar etmez; ilk 14 gün her modülün ilk bildirimi o modülün en güçlü kaynağını taşır;
  kişi kartı açtıysa o satır 30 gün dinlenir (VARSAYIM). Metin çeşitliliği tek başına açılmayı artırmadı (Bell 2023);
  döndürmenin amacı tekrar yorgunluğunu önlemektir.
- **Örnek satırlar (düzeltilmiş):**
  - Nefes: *"12 denemelik bir analizde nefes çalışmaları, algılanan streste küçük–orta azalmayla ilişkiliydi."* Kart: 785
    yetişkin, yanlılık riski orta (Fincham 2023, PMID 36624160).
  - Yürüyüş: *"Bir denemede yürüyüş önerisi sonraki 30 dakikada adımı artırdı; 44 kişi, 6 hafta."* Kart: etki haftalar
    içinde azaldı (Klasnja 2019, PMID 30192907, DOI 10.1093/abm/kay067).
  - Mola: *"56 ofis çalışanıyla yarı-randomize bir çalışmada saatlik hatırlatma iş saatinde oturmayı azalttı."* (Morris
    2020, PMID 33322678.)
  - Dolunay: bilim satırı nefesin kendi bulgusudur (Laborde 2022, PMID 35623448); ay → uyku → nefes zinciri kurulmaz, ayın
    uykuya etkisi tartışmalıdır (onaylı plan §3.E.5).
- **Kanıt kapısı:** bilim kartı taşıyan her kaynak `lib/sources.js`'te `pmid` ve `doi` ile kayıtlı olmalı ve yayından önce
  PubMed'de yeniden açılmalı. Eksik olanlar (≈ 17): `kim2020`, `wolffsohn2025`, `fincham2023`, `laborde2022`,
  `balban2023`, `tucker2007`, `klimek2022`, `denissen2008`, `stout2022`, `desai2026`, `moszeik2025`, `radin2025`, beş ay
  kaynağı. `YOL.nef.md` §14 Kim 2020 ve Wolffsohn 2025'in `sources.js`'te olduğunu söylüyor; yok, yalnız `evidence.js`'te
  metin olarak geçiyorlar. Kişi sayısı "kaynak bekliyor" olan satır (`nef-bildirim.md` §10.5) sayı doğrulanmadan yayına
  girmez.
- **Dayanak ve sınır:** kişiye uyarlanmış mesajın etkisi küçük ama tutarlı (Noar 2007, r = 0,074; Hao 2023, g = 0,16);
  en iyisi sürekli güncellenen veriyle uyarlama (Krebs 2010). Dil modeliyle yalnız üslubu uyarlamak davranışa ek katkı
  yapmadı (Schlicht 2026, RKÇ); dil modelleri sağlık içeriğinde yanlış üretebiliyor (Zaleski 2024). Bu yüzden sayılar ve
  iddialar modelden gelmez. Canlı Nef kartının istemi (`lib/coachCore.js`) bu işin dışındadır; Y6'da iyileştirilir.

### B. B2 · Hava

**İlk 5 saniye:** Ana sayfada adımların üstünde "İzmir Gaziemir · 23° · 21.00'de yağmur".

#### B.1 Kaynak, konum, rıza

- WeatherKit Swift çerçevesi (onaylı plan §3.E.1); yeni `SkyPlugin.swift`; iOS 16+ (iOS 15'te hava bölümü görünmez).
- Konum sayfası: [Konumumu kullan] ya da [İl ve ilçe seç]. Konum yalnız "Kullanırken", varsayılan yaklaşık. Yaklaşık
  konumdan yalnız il bulunur ("İzmir (yaklaşık)", S0 karar 12). İlçe listeden seçilir (GeoNames, 974 ADM2 kaydı, CC BY 4.0;
  resmî sayı 973, fark incelenmedi) ya da kesin konum izni verilmişse telefonda en yakın ilçe merkezi bulunup sorulur:
  *"Gaziemir'de misin?"* [Evet] [Başka ilçe]. Ters coğrafi kodlama yok (koordinatı ikinci kez Apple'a gönderir). Koordinat
  2 ondalığa yuvarlanır, yalnız WeatherKit'e gider, saklanmaz. İl ve ilçe ayrı bir anahtarda tutulur; profildeki şehir
  alanına yazılmaz (profil eşitlemesiyle Supabase'e gitmesin).
- Rıza `weather` v1 (onaylı plan §3.E.2) iki satırla genişler: "Ne" satırına ilçe adı, "Neden" satırına sabah havası.
  Hukukçu yedeği aynen: hukukçu adı gelmeden konum izni App Store'a gitmez; o sürümde yalnız il ve ilçe seçimi vardır.

#### B.2 Ana sayfa satırı

- Adım bilgisinin hemen üstünde tek kart: solda duruma göre çizilen hava simgesi; üst satırda **"İzmir Gaziemir · 23°"**,
  altında **"21.00'de yağmur bekleniyor"** (yağmur yoksa "En çok 26°, açık"); sağda iki küçük satır: "Apple Weather" ve
  **"Veri kaynakları"** bağlantısı (`legalPageURL`). Kartın geri kalanına dokununca hava sayfası açılır. 320 pt'de il adı
  düşer; ilçe adı kısalmaz; en uzun ilçe adıyla (Mustafakemalpaşa) ve en büyük yazı boyutuyla denenir.
- Önbellekte hava yoksa satır görünmez (Ana sayfa ağ beklemez). Konum hiç seçilmemişse satırın yerinde günün ilk
  dokunuşundan sonra bir kez teklif çıkar (S0 karar 11'in metinleri); "Hayır" kalıcıdır.
- Bileşen `components/SkyLine.jsx`; Ana sayfaya tek satırla takılır ve yerinden bağımsızdır (Ana sayfa yeniden
  tasarlanıyor).

#### B.3 Hava sayfası

Yer ve verinin yaşı ("Gaziemir, İzmir · 12.40'ta alındı"); büyük sıcaklık, hissedilen, gökyüzü; **Nef'in yorumu**
(bankadan); saat saat şerit (sıcaklık ve yağmur olasılığı, 24 saat); en yüksek, en düşük; ay evresi (onaylı plan Y4'ün ay
kartı gelince bağlanır); **Sabah havası** anahtarı; atıf (işaret, "Veri kaynakları"). Durumlar: çevrimdışı ve önbellek
< 12 sa (son veri ve yaşı), önbellek yok (*"Hava için internet gerekiyor."*), WeatherKit hatası (*"Hava bilgisi şu an
alınamadı."*), iOS 15 ve web (hava yok).

#### B.4 Sabah havası bildirimi

- Ayrı anahtar, varsayılan kapalı; hava sayfasında ve Bildirimler'de. Sabah havası kapalı kişiye ilk yağmurlu günde bir
  kez sorulur: *"Yağmur beklenen sabahlar sana haber vereyim mi?"* (onaylı §3.E.6).
- **Saat:** alarm kuruluysa "Alarmından 10 dakika sonra" (10 / 20 / 30 dk). Alarmsız günde kişinin seçtiği saatte
  (varsayılan 08.00; "Alarmsız günlerde gönderme" seçeneği). Günde tek hava bildirimi; yağmur varsa ilk cümle yağmur.
  Düzey `active`, kimlik 7700 (yarın 7701). Son satır *"Kaynak: Apple Weather"* (S0 karar 15). Deneyde yürüyüşün sessiz
  günüyse metin yürüyüş önerisi içermez.
- **Katmanlar** (`apple-hava-bildirim.md` §4):
  1. Her açılışta ve plan kurulumunda bildirim o anki tahminle kurulur. Tahmin bir saatten eskiyse metin yaşını söyler:
     *"Dün akşam 22.40 tahminine göre 14.00–17.00 arası yağmur bekleniyor."* Bildirim anında tahmin 18 saatten eski
     olacaksa kurulmaz.
  2. **iOS 26 ve AlarmKit:** alarmın durdurma niyeti (`stopIntent`) uygulamayı açmadan Swift kodunu çalıştırır
     ("launches your app process without opening the app"); kod taze tahmini alır, doldurulmuş şablonlardan metni seçer
     ve 7700'ü durdurma anından 10 dk sonraya aynı kimlikle yeniden kurar; "yerelde yenilendi" işareti bırakır, `planAll`
     o gün 7700'ü yeniden yazmaz. Süre sınırı belgede yok; 8–10 saniyeye göre tasarlanır; yetişmezse 1. katman kalır.
     Bugün kodda `stopIntent` verilmiyor. Erteleme (9 dk) varsa bildirim son durdurmadan sonraya kayar; iOS 25 ve
     öncesinde 1. katmanın bildirimi ertelenen alarmla çakışabilir (sınır).
  3. Arka plan yenilemesi (`BGAppRefreshTask`) yalnız "olursa iyi" katmanıdır: tarih garantisi yok, saatler gecikebilir,
     Düşük Güç Modu'nda çalışmaz. Yapılırsa `UIBackgroundModes` → `fetch`, `BGTaskSchedulerPermittedIdentifiers` ve
     `AppDelegate.swift`'te kayıt gerekir. B2'nin çekirdeği değildir; cihaz ölçümünden sonra karar verilir.
  4. Kişi uygulamayı bildirimden önce açarsa bildirim iptal edilir; bilgi Ana sayfa satırında görünür.
- WeatherKit çağrısı: onaylı hesaba kişi başına günde en çok 2 ek istek (durdurma niyeti ve arka plan); günlük 8 istek
  sınırına sayılır.
- **Dayanak ve sınır:** kötü hava hareketin önündeki engellerden biri, en tutarlı engel yağış (Tucker ve Gilliland 2007;
  Klimek 2022); adımın en yüksek olduğu aralık gözlemsel çalışmalarda ≈ 16–21 °C ve iklime göre değişiyor (Togo 2005; Ho
  2022; Yamanaka 2026); uyarının varlığı tek başına davranışı çoğunlukla değiştirmedi (Toloo 2013). Hava bildirimi bir
  plan önerisidir, sağlık iddiası değildir.

### C. B3 · Yürüyüş eşliği

**İlk 5 saniye:** ekran açılınca süre sayacı zaten akıyor (son 15 dakika eklenmiş), tempo büyük harfle, üstte "Nef
seninle", ilk anons 3 saniye içinde: *"Birlikte yürüyoruz. 1,1 kilometredesin."*

#### C.1 Yürüyüş nasıl başlar

1. **Kişi başlatır:** yolun yürüyüş durağı, `walk` modülünün ekranı ya da hatırlatma → [Yürüyüşe başla].
2. **Nef sorar (varsayılan):** Apple Sağlık yeni adım yazınca uygulamayı en sık saatte bir uyandırır. WalkGuard gözlemcisi
   bugün yalnız yürüyüş hatırlatması açıkken başlıyor (`HealthPlugin.swift`); `walk` rızası ve "Yürüyüş eşliği" açıkken de
   başlayacak biçimde değişir. Uyanan kod son 15 dakikanın adım sayarı verisine (`CMPedometer.queryPedometerData`, son 7
   gün saklanır) ve hareket etkinliğine bakar; kişi şu an yürüyorsa sorar, bitirdiyse sormaz.
3. **Nef yürürken sorar (karar 2):** "Her Zaman" izniyle ≥ 500 m yer değişiminde uygulama uyanır, hareket etkinliğine
   bakar (araba ve bisiklet ayrılır), son 15 dakikanın verisiyle sorar. Konum saklanmaz, yalnız uyandırır.
- **Soru:** başlık *"Yürüyüşe mi çıktın?"* · gövde *"Son 15 dakikada 1,1 km yürüdün. Hava 23 derece, yürüyüş için güzel.
  Eşlik edeyim mi?"* (86 karakter). Hava yoksa ya da bayatsa hava cümlesi düşer. Dokununca yürüyüş ekranı açılır ve son 15
  dakika yürüyüşe eklenir. Günde en çok 2 soru, iki soru arası en az 3 saat; iki kez "Şimdi değil" denirse o gün bir daha
  sorulmaz; pencere 07.00–23.00 (VARSAYIM).
- Apple Watch'un otomatik egzersiz algısını üçüncü taraf iPhone uygulamasına açan bir API bulunamadı (`apple-yuruyus.md`
  Sonuç 3); bildirim bu yüzden soru biçimindedir. Watch'ta süren bir antrenmanı görmek Sağlık'tan antrenman okuma izni
  ister; ilk sürümde yok (sınır).

#### C.2 Yürüyüş ekranı

- **Düzen:** koyu temada siyah zemin, açık temada açık zemin; iki temada aynı dört sayı alt alta: **süre**, **şu anki
  tempo** (dk/km, en büyük), **mesafe**, **adım · bu yürüyüş**. Altında ince satır: *"Bugün toplam 7.482 adım · Apple
  Sağlık"*. Anons anında sesin cümlesi ekranda 4 saniye altyazı olarak durur. En altta [Duraklat] [Koç · 250 m] [Bitir].
- **Tempo:** ekranda son 30 saniyenin ortalaması (adım sayarının `currentPace`, saniye/metre → dk/km). Bilgi satırı:
  *"Tempo ve mesafe telefonun ölçümüdür, yaklaşıktır."* Apple Sağlık'ın yürüme hızı değeri bir çalışmada geçerli çıktı
  (Werner 2023), `currentPace` ayrıca sınanmadı; spor saatlerinde GPS mesafesi kentte %9'a kadar eksik çıktı
  (Gilgen-Ammann 2020); güncel iPhone için çalışma bulunamadı.
- **Mesafe ve konum:** konum oturumu açıksa mesafe konumdan, değilse adım sayarının tahmininden. Kişi yaklaşık konum
  vermişse yürüyüş başlarken geçici kesin konum istenir (`requestTemporaryFullAccuracyAuthorization`,
  `NSLocationTemporaryUsageDescriptionDictionary`: *"Yürüyüşünün mesafesini doğru ölçmek için, yalnız yürüyüş
  sırasında."*); ret gelirse mesafe adım sayarından.
- **Kilit ekranında:** konum oturumu (`location` arka plan kipi, "Kullanırken" izni, iOS 17+ `CLBackgroundActivitySession`)
  uygulamayı uyanık tutar; mavi konum göstergesi görünür. Sessiz ses çalarak uyanık tutmak App Review 2.5.4'e aykırıdır,
  yapılmaz. Duraklatınca konum oturumu durur; 20 dk hareketsizlikte *"Yürüyüşü bitireyim mi?"* sorulur, 40 dk'da yürüyüş
  kendiliğinden biter (VARSAYIM). Düşük Güç Modu'nda konum doğruluğu düşer ve ekranda tek satır yazar.
- **Adım:** canlı sayı telefonun adım sayarından. Günün toplamı Apple Sağlık'ın canlı istatistik sorgusundan (telefon
  kilitliyken okunamayabilir; o zaman eski değer ve saati kalır). **Bitişte** yürüyüşün başlangıç ve bitişi arasındaki
  Apple Sağlık toplamı okunur ("automatically merge the data from all of your data sources", `healthkit/hkstatistics`);
  özet ekranında ve kayıtta o sayı *"Apple Sağlık'a göre"* diye durur. Apple Watch varken Sağlık'ın birleştirmesi
  gecikebilir; özet *"Sayılar Apple Sağlık'ta güncelleniyor"* der ve 2 dk içinde yeniler (VARSAYIM).
- **Yarım kalan yürüyüş:** yürüyüşün durumu her 30 sn diske yazılır. Uygulama kapatılır ya da çökerse yeniden açılışta
  o aralığın adımı ve mesafesi adım sayarı geçmişinden okunur: *"Yürüyüşün yarıda kaldı (18 dk, 1,9 km). Kaydedeyim mi?"*
  [Kaydet] [Sil].
- **Bitiş özeti:** süre, mesafe, ortalama tempo, Apple Sağlık'a göre adım, Nef'in tek cümlesi (yalnız kendi kaydıyla
  karşılaştırma), "Bana hatırlat" kartı.
- **Kayıt ve veri merkezi:** kayıt `gozolcum:walk-log` anahtarına yazılır: `{ date, seconds, distanceM, steps,
  stepsSource: 'health'|'phone', paceSecPerKm }`; koordinat, rota ve konum yok. `store.sessions`'a yazılmaz; böylece
  Nef'e giden paket (`lib/coach.js`), seri ve haftalık hedef değişmez (mola ve su kayıtlarının onaylı kalıbı). `dataHub.js`
  bu anahtarı okur; modül `walk`: `progress.domain: 'body'`, `metrics`: haftalık yürüyüş dakikası (better 'up'); tempo
  yalnız `stats`'ta gösterilir, "iyi/kötü" yorumu yapılmaz. `dataHub.test.js` modülün merkeze ulaştığını denetler.

#### C.3 Sesli koç

- **Ayar** (yürüyüş ekranındaki düğmeden ve Bildirimler → Yürüyüş eşliği'nden): açık/kapalı; aralık 250 m (varsayılan),
  500 m, 1 km; ne söylensin: tempo (her zaman), mesafe; "Hoparlörden de söyle" (varsayılan kapalı). Ses Profilim →
  Seslendirme'deki ses (Neslihan ya da Hakan).
- **Anonslar:** her aralıkta *"Son 250 metre: kilometrede 9 dakika 40 saniye."* (son aralığın ortalama temposu; saniye
  10'a yuvarlanır); her tam kilometrede *"1. kilometre 9 dakika 50 saniyede."* (5'e yuvarlanır). Aynı cümle ekranda
  altyazı. Bu kalıpta sayılar ek almadığı için parça birleştirmek güvenlidir. Parçalar: 28 dakika (3–30), 12 saniye
  (0–55), 15 kilometre sırası, ≈ 10 sabit cümle → ses başına ≈ 65, iki ses için ≈ 130 kısa kayıt. Birleşme yerinde
  tonlama dikişi duyulabilir; dinlenerek onaylanır. 250 m'lik bölümde tempo ±%4–8 oynayabilir (`pubmed.md` I); bilgi
  satırı bunu yazar.
- **Ses oturumu:** `.playback`, `.voicePrompt` modu, `.duckOthers` ve `.interruptSpokenAudioAndMixWithOthers`; her
  anonstan sonra oturum `notifyOthersOnDeactivation` ile bırakılır. Ortak ses yöneticisine (`AppAudioSession`,
  `FeedbackPlugin.swift`) yürüyüş durumu eklenir; yoksa uyku sesi, yoga ve kayıtla çakışır. Anonslar yerel Swift'ten çalar.
- **Çıkış ve kesinti:** çıkış hoparlörse anons yalnız "Hoparlörden de söyle" açıkken çalar; kapalıysa altyazı ve kısa
  titreşim. Kulaklık çıkınca anons susar: *"Kulaklık çıktı; anonsları durdurdum."* Telefon görüşmesi ve Siri süresince
  anons yapılmaz, kaçan anons sonradan okunmaz; ölçüm sürer. VoiceOver açıksa anons VoiceOver duyurusuyla verilir.
- **Güvenlik ve dayanak:** yürüyüşte sesli tempo anonsunun etkisi hiç sınanmadı (`pubmed.md` F); kulaklıkla ses yayanın
  dikkatini dağıtıyor (Schwebel 2012, RKÇ; Simmons 2020, meta-analiz). Anons kısadır, soru sormaz; ilk açılışta tek satır:
  *"Kulaklık takıyorsan çevreni duyabileceğin bir ses düzeyi seç."* Orta şiddetin karşılığı ≈ 100 adım/dk (Tudor-Locke
  2019); dk/km için bilimsel bir şiddet eşiği yok; koç tempoyu söyler, "yavaşsın/hızlısın" demez.

---

## 4. Veri, rıza ve gizlilik (KVKK: her amaç için ayrı açık rıza)

| Amaç | Veri | İşlendiği yer | Gittiği yer | Rıza | İzin |
|---|---|---|---|---|---|
| "Bana hatırlat", "Sen karar ver" | Kendi kayıtlarının saati | Telefon | Hiçbir yer | Yeni rıza yok (VARSAYIM; hukukçuya sorulur) | Bildirim (bugünkü) |
| Hava: satır, sayfa, sabah bildirimi | Yuvarlanmış koordinat ya da seçilen ilçenin merkezi; il ve ilçe adı | Telefon; tahmin Apple'da | Apple WeatherKit (yurt dışı); sunucumuza ve Nef'e gitmez | `weather` v1, iki satır genişler | Konum "Kullanırken", yaklaşık (isteğe bağlı) |
| Yürüyüş ekranı, sesli koç | Adım, tempo, mesafe; konum yalnız mesafe için, saklanmaz; Apple Sağlık toplamı | Telefon | Hiçbir yer | **`walk` (yeni)** | Hareket ve Fitness; konum "Kullanırken" (+ geçici kesin); Apple Sağlık (bugünkü) |
| Nef'in yürüyüş sorusu | Son 15 dakikanın adımı ve hareket etkinliği; Apple Sağlık'ın arka plan okuması | Telefon | Hiçbir yer | `walk` ("Neden" satırında: "uygulama kapalıyken adımların okunur, yürüyorsan sana eşlik teklif edilir") | Hareket ve Fitness; Apple Sağlık arka plan teslimi (bugünkü yetki) |
| Yürürken beni fark et | "Yer değişti mi" sinyali | Telefon | Hiçbir yer | **`walkDetect` (yeni, isteğe bağlı)** | Konum "Her Zaman" |

- Adım ve tempo sağlık verisi sayılır (`lib/consent.js` notu, KVKK m. 6); `walk` ayrı ve açık rızadır, kutusu işaretsiz
  gelir; "Şimdi değil" diyen kişi yürüyüş ekranında yalnız süreyi görür. `health` v2 rızası değişmez: yeni amaçlar `walk`
  rızasına yazılır.
- **Hukukçu yedeği:** konum ve hareket verisi telefondan çıkmadığı için onaylı yedeğin gerekçesi (yurt dışı aktarım)
  yürüyüşte yoktur; B3 "Kullanırken" konumuyla çıkabilir (VARSAYIM; hukukçuya sorulur). "Her Zaman" konumu (karar 2)
  hukukçu cevabına kadar yayına girmez.
- **Gizlilik sayfası, App Store etiketi, izin metinleri aynı sürümde.** Hava için Apple'a giden yuvarlanmış koordinat
  onaylı plandaki gibi yazılır ("Yaklaşık konum · uygulama işlevi · kimliğe bağlı değil"). Yürüyüşün konumu ve hareket
  verisi telefondan çıkmadığı için etikete "toplanan veri" olarak girmez (VARSAYIM; App Store Connect'te doğrulanır).
- **Info.plist:** `NSMotionUsageDescription` (yoksa uygulama çöker), `NSLocationWhenInUseUsageDescription`,
  `NSLocationTemporaryUsageDescriptionDictionary`, `UIBackgroundModes` → `location`; karar 2 evetse
  `NSLocationAlwaysAndWhenInUseUsageDescription` (*"Evden çıkıp yürümeye başladığında 'Yürüyüşe mi çıktın?' diye
  sorabilmem için. Konumun saklanmaz, telefondan çıkmaz. İstediğin an Ayarlar'dan kapatabilirsin."*); arka plan
  yenilemesi yapılırsa `fetch` ve `BGTaskSchedulerPermittedIdentifiers`; B3+ için `NSSupportsLiveActivities`.
  `App.entitlements`: WeatherKit.
- **Rıza geri çekilince ve "Tüm verileri sil"de:** önemli yer değişikliği izlemesi durur, bekleyen 77xx ve 78xx ile yürüyüş
  sorusu iptal edilir, WalkGuard'ın yürüyüş kontrolü kapanır; `moduleReminders`, bilim satırı günlüğü, hava önbelleği, il
  ve ilçe, `walk-log` (kişiye sorularak), yarım yürüyüş durumu ve Swift tarafının şablonları ile "yerelde yenilendi"
  işareti silinir. 7302 deneme bildirimi silinmez (bugünkü kural).
- **Hukukçu soruları** (`S0/hukukcu-sorulari.md`'ye eklenecek; ad gelmezse onaylı yedek): `walk` rızasının kapsamı;
  "Her Zaman" konumun telefonda "yer değişti" sinyali olarak kullanılması; kullanım saati analizinin rıza gerektirip
  gerektirmediği.

---

## 5. Kod sözleşmesi (mevcut sistem bozulmaz)

### 5.1 Yeni dosyalar

| Parça | Dosyalar |
|---|---|
| B1 | `lib/moduleRemind.js` (`planModuleReminders`, `pickAutoTime`), `lib/notifyAll.js` (`planAll`, birleştirici, pencereler, bütçe), `lib/nefBank.js` + `lib/nefBank.data.js`, `lib/sciLine.js`, `components/RemindField.jsx`, `components/RemindSheet.jsx`, `components/NotifyTimeline.jsx`, Profil'de Bildirimler bölümü, testleri |
| B2 | `ios/App/App/SkyPlugin.swift`, `lib/sky.js`, `lib/places.js` + il/ilçe tablosu (atıf Bilgi → Kaynaklar'da), `components/SkyLine.jsx`, `screens/Sky.jsx`, `lib/weatherNotify.js` (onaylı plandaki `rainNotify.js`'in yerine), testleri |
| B3 | `modules/walk/` (manifest, view), `screens/Walk.jsx`, `ios/App/App/WalkPlugin.swift` (adım sayarı, hareket etkinliği, konum oturumu, anons çalar, yarım yürüyüş), `lib/walkCoach.js`, `lib/walkDetect.js`, `lib/walkLog.js`, `public/voice/walk/<ses>/*.mp3`, testleri; B3+: Widget Extension hedefi |

### 5.2 Değişen dosyalar

`modules/registry.js` (`remind` doğrulaması, `reminders()`); `remind` alan her `manifest.js` ve bitiş ekranına tek satır;
`App.jsx` (plan kurulumu `planAll`'a geçer; `ctx.remindField`; `onNotifyTap`'ta 77xx, 771x, 78xx yönlendirmesi; Profil'e
bildirim özeti; "Tüm verileri sil"); `lib/notifyApply.js` (kendi aralığına 7700–7719 ve 7800–7859, `threadIdentifier`,
`relevanceScore`, teslim edilmiş eski bildirimin kaldırılması); `screens/ProfileHome.jsx`; `screens/Reminders.jsx` (dönüş
yeri); `screens/Home.jsx` (tek satır `<SkyLine>`); `lib/consent.js` (`weather` v1 satırları, `walk`, `walkDetect`);
`lib/dataHub.js` (`walk-log`); `lib/sources.js` (≈ 17 kaynak); `lib/alarm.js` ve `screens/AlarmMorning.jsx` (sabah
kartında hava); `ios/App/App/AlarmPlugin.swift` (`stopIntent`); `HealthPlugin.swift` (gözlemcinin `walk` rızasıyla
başlaması, yürüyüş sorusu kontrolü); `FeedbackPlugin.swift` (`AppAudioSession` yürüyüş durumu); `MainViewController.swift`
(eklenti kaydı); `AppDelegate.swift` (yalnız arka plan yenilemesi yapılırsa); `Info.plist`, `App.entitlements`;
`lib/releases.js`; `site/` gizlilik sayfası. `lib/notifyPlan.js`, `lib/reminders.js` ve `lib/restNotify.js`'e **dokunulmaz**
(gece düzeltmesi ana oturumda).

### 5.3 Testler

- **Yeni:** `moduleRemind.test.js` (otomatik saat: 15 dk dilim, farklı gün sayımı, 5 gün eşiği, gece kayıtları dışarıda,
  pencere, 60 dk uzaklık, ikinci saat kuralı, legacy'de tek saat ve onaylı saat değişimi, yol hatırlatmasının tek
  bildirim kurması, yaz saati geçiş günü ve İstanbul → Berlin), `notifyAll.test.js` (20.000 rastgele ayarda alarm ve alarma
  bağlı hava dışında hiçbir iki bildirim 30 dk'dan yakın değil; birleştirme metni; her pencere; 23.00–07.00'de alarm
  dışında bildirim yok; oturum sürerken modül hatırlatması yok; toplam bekleyen ≤ 60 ve deney planı kırpılmaz; kimlikler
  7600–7607'ye dokunmaz; tek `threadIdentifier`), `notifyTap.test.js` (77xx, 771x, 78xx yönlendirmesi; soğuk açılışta tek
  dinleyici), `nefBank.test.js` (`nef-bildirim.md` §7.1'in 50 senaryosu ve S11–S16: sayı eşleşmesi, saat eki, uzunluk,
  yasak kalıp, veriyle tutarlılık, bugün/yarın, kilit ekranı, dolunay, döndürme; JS ve Swift şablon eşliği),
  `sciLine.test.js`, `sky.test.js` (yuvarlama 41.0082 → 41.01, 18 saat bayatlık, yaş metni, çevrimdışı ve iOS 15),
  `places.test.js` (en yakın ilçe, onay yalnız kesin konumda, ilçe profile yazılmaz), `weatherNotify.test.js` (günde tek,
  yağmur ilk cümle, "yerelde yenilendi"de yeniden yazmama, sessiz günde yürüyüş önerisi yok), `walkCoach.test.js`
  (aralıklar, yuvarlama, parça listesi eksiksiz, ekrandaki cümle = parçaların metni), `walkDetect.test.js` (günde ≤ 2,
  3 saat, iki "Şimdi değil", 22.10'da yürüyene soru gider, 21.30'da oturana yürüyüş hatırlatması gitmez, sessiz günde
  soru yok), `walkLog.test.js` (yarım yürüyüş kurtarma), `resetAll` testi (yeni anahtarlar silinir, 7302 kalır, yerel
  eklentiye durdurma çağrısı gider), `coach.test.js`'e "walk kayıtları `buildSignals`'ı değiştirmez", göç testi (bugün
  nefes hatırlatması açık olan kişi nefes modülünde "Hatırlatma açık" görür), `registry.test.js`'e `remind` doğrulaması.
- **Bilerek değişen beklentiler:** `notifyApply.test.js`'teki kimlik sayısı sınaması (aralık genişler);
  `registry.test.js`'teki modül listesine `walk`. Başka hiçbir mevcut beklenti değişmez; değişmesi gerekirse iş durur ve
  sahibe sorulur.
- **Değişmeden yeşil kalmalı:** `notifyPlan.test.js`, `reminders.test.js`, `notifyLog.test.js`, `today.test.js`,
  `dataHub.test.js`, `consent.test.js`, `alarm.test.js`, `coach.test.js`, yoganın ve Y1'in bütün testleri, bütün takım.

### 5.4 Eşdeğerlik

- **Yeni özellik kapalıyken** (`moduleReminders` boş, sabah havası ve yürüyüş eşliği kapalı): `planAll` çıktısı, taban
  commit'teki `planNotifications` çıktısıyla 20.000 rastgele bağlamda derin eşittir (bildirim listesi, günlük, WalkGuard
  listesi). Taban, ana oturumun gece düzeltmesini içeren commit'tir. Yeni gece kuralı yalnız yeni kaynaklara uygulandığı
  için eşdeğerliği bozmaz.
- **Legacy türler:** "Bana hatırlat"tan kurulan nefes hatırlatması, Hatırlatmalar ekranından kurulanla aynı ayarı, aynı
  zarı, aynı günlüğü üretir.
- **Tek hesap:** yürüyüş kaydı Gelişim'de, raporda, dışa aktarmada aynı sayıyı verir; `stepsSource: 'health'` kaydındaki
  adım, aynı aralıkta Apple Sağlık uygulamasında görünen sayıya eşittir (cihaz kapısı).

---

## 6. Kalite kapıları ve "bitti" tanımı

**Her parçada sırasıyla:** (1) tasarım Artifact'i iki temada, 390 ve 320 pt'de; B1'in kartı ve saat sayfası için üç
tasarım yönü; (2) 5 saniye kapısı: beş bağımsız değerlendiricinin en az üçü "etkilendim" der; (3) sahibin onayı; (4) kod ve
testler; (5) bütün takım yeşil ve eşdeğerlik 0 fark; (6) iki bağımsız inceleme (kod ve dil); (7) TestFlight; (8) cihaz
listesi ve durum çizelgesi; (9) sahibin cihazda bakışı; (10) bulgular `HATA_GUNLUGU.md`'ye, kalanlar `YAPILACAKLAR.md`'ye,
sürüm notu `lib/releases.js`'e.

**Metin kapısı:** her cümle makine denetiminden, iki bağımsız model incelemesinden ve sahibin onayından geçer. Nef bankası
sürümünde ayrıca kör insan değerlendirmesi (sahip ve iki ana dili Türkçe okur, biri 50 yaş üstü): hata ve yasak kalıp 0,
dil puanı ortancası ≥ 4/5; her cümleye iki soru daha: *"Bunu bir insan koç mu yazdı, bir uygulama mı?"* ve *"Bu bildirimi
açardın mı? (1–5)"*; ortanca ≥ 4 (eşikler VARSAYIM).

**Kanıt kapısı:** bilim kartı taşıyan her kaynak yayından önce PubMed'de yeniden açılır; PMID ve DOI'si olmayan ya da
kişi sayısı doğrulanmamış satır yayına girmez.

**Gizlilik kapısı:** rıza metni, gizlilik sayfası, App Store etiketi, izin metinleri ve "Tüm verileri sil" kapsamı değişen
özellikle aynı sürümde güncellenir.

**Durum çizelgesi (her satır iki temada ve 320 pt'de cihazda görülür; ANA_BELGE "bitti" kuralı):**

| Ekran | Durumlar |
|---|---|
| Kart ve saat sayfası | veri yok, veri var, iki saat önerisi, çakışma uyarısı, pencere dışı, izin yok, izin reddedildi, legacy tür, kurulu hap, izin sonradan kapatılmış hap, yol kartı |
| Bildirimler | ana anahtar kapalı, hiç hatırlatma yok (1. gün), bir hatırlatma, on hatırlatma, gece sessizliği değişmiş, 320 pt'de birleşen noktalar |
| Ana sayfa hava satırı | teklif, önbellek yok, önbellek eski, yağmurlu, yağmursuz, en uzun ilçe adı, en büyük yazı, iOS 15 |
| Hava sayfası | dört veri durumu, sabah havası açık ve kapalı |
| Yürüyüş ekranı | `walk` rızası yok, Hareket izni yok, konum yok, kesin konum yok, duraklatıldı, kilit ekranı, bitiş özeti ("Sağlık güncelleniyor" dâhil), yarım kalan yürüyüş |
| Gelişim yürüyüş kartı | boş, 1. gün, dolu, artış, azalış |

**Cihaz listesi (her madde `HATA_GUNLUGU.md`'ye):**
- **Ortak:** iOS 15, 16, 17, 26; iPhone SE 1. nesil (320 pt); en büyük yazı; VoiceOver; Uyku ve İş Odağı açıkken; Planlı
  Özet; Bildirim Merkezi'nde tek Nefona yığını; uygulama **kapalıyken** her bildirim türüne dokununca doğru ekran;
  "Tüm verileri sil"den sonra hiçbir 77xx, 771x, 78xx bildiriminin kalmaması.
- **B1:** üç modülde "Sen karar ver" ve bildirimin geldiği saat; elle iki saat; çakışma ve birleşik bildirim; yol kartı;
  yeniden girişte hap; Bildirimler çizelgesi; bir gece boyunca 23.00–07.00'de bildirim gelmemesi; 21.00'den sonra "kalk"
  gelmemesi; izin reddi; bilim kartında PubMed ve DOI bağlantısı; "Kaynağı gör" düğmesi.
- **B2:** izin penceresi, yaklaşık konum, il ve ilçe seçimi, "Gaziemir'de misin?"; satır 390 ve 320 pt; uçak modu; iOS 15;
  alarmdan 10 dk sonra bildirim (iOS 26'da alarm elle durdurulunca taze metin; ertelemede; iOS 25'te yaş metni);
  "Veri kaynakları" bağlantısı.
- **B3 (dışarıda):** 15, 30 ve 60 dakikalık yürüyüş; kilit ekranında anonsun sürmesi; müzik çalarken sesin kısılıp geri
  gelmesi; hoparlör, AirPods, araba Bluetooth; kulaklığın çıkarılması; gelen arama ve WhatsApp araması; Haritalar yol
  tarifi sesiyle birlikte; 250 m anonslarının mesafeyle uyumu; bitişte adımın Apple Sağlık uygulamasındaki sayıyla aynı
  olması (yalnız iPhone; iPhone + Watch); Nef sorusunun saatlik uyanışta geldiği an; karar 2 açıksa sorunun kaçıncı
  dakikada geldiği; Watch'tan soruya dokunma; yürürken uygulamayı kapatma ve kurtarma; Düşük Güç Modu'nda 30 dk; yaklaşık
  konum verilmiş telefonda yürüyüş; 60 dk yürüyüşte pil tüketimi; `walkDetect` kapatılınca bir gün boyunca uygulamanın arka
  planda açılmaması.

**"Bitti" (sahibin kuralı):** bir parça ancak cihazda doğrulanır ve kusursuz görülürse `[x]` olur; kodda bitip cihazda
görülmeyen iş `[~]`'dir. Görülmeyen durum varsa "şu durumlara bakmadım" denir.

---

## 7. Aşamalar ve takvim (karar 1'in önerisiyle)

| Adım | İş | Çıktı | Sahip kapısı | Süre (VARSAYIM) |
|---|---|---|---|---|
| B0 (şimdi) | Plan, tasarım, 5 saniye kapısı, üç karar | Onay, `DEVIR.md` | Plan ve tasarım | — |
| — | Yoga kodu, Build 60 (ana oturum) | | | ana oturumun takvimi |
| B1 | Bildirim çekirdeği, pencereler, "Bana hatırlat", Bildirimler, Nef bankası v1, bilim kartı, `sources.js` kayıtları | TestFlight | B1 cihaz listesi | 8–10 iş günü |
| B2 | Hava: SkyPlugin, il/ilçe, Ana sayfa satırı, hava sayfası, sabah havası, AlarmKit `stopIntent` | TestFlight, gizlilik sayfası, etiket | B2 cihaz listesi | 8–10 iş günü |
| Y2–Y4 | Onaylı sonsuz yol planı | | kendi kapıları | onaylı plan |
| B3 | Yürüyüş eşliği: modül, WalkPlugin, ekran, sesli koç, ses parçaları (üretim sahibin onayıyla), algılama | TestFlight | B3 cihaz listesi | 12–14 iş günü |
| B3+ | Canlı Etkinlik (isteğe bağlı; yeni Widget Extension, en çok 8 saat, veri 4 KB) | TestFlight | kilit ekranı | 3–4 iş günü |
| Y6 | Onaylı plan (canlı Nef isteminin iyileştirilmesi dâhil) | | | |
| Site | Bitmiş ve cihazda görülmüş parçalar (onaylı §3.K) | | S8 | — |

En büyük belirsizlikler: AlarmKit durdurma niyetinin ağ isteğine yetip yetmediği, Swift'in kurduğu bildirimin dokunuşunun
Capacitor'a ulaşması, "Her Zaman" izni için App Review'un tutumu, hukukçunun hızı, parça birleştirmeli sesin doğallığı.

---

## 8. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar**
- Cihazda hiçbir şey denenmedi; Swift bu ortamda derlenmiyor. Bugünkü bildirim sistemi (v2) de cihazda denenmedi; B1
  onun üstüne kurulur.
- Uygulama kapalıyken yürüyüşü anında görmenin yolu yalnız "Her Zaman" konumdur; karar 2 hayırsa kısa yürüyüşlerin çoğu
  kaçar. "Her Zaman" izni App Review'da reddedilirse anahtar kalkar.
- Canlı adım, Apple Watch da takılıyken Sağlık'la bir süre farklı görünebilir; bitişte eşitlenir. Sağlık'taki kaynak
  önceliğinin birleştirmeyi nasıl etkilediği belgede yazmıyor. Bugünkü `dailyTotals` ve WalkGuard `.strictStartDate`
  kullanıyor; gece yarısını kesen adım kaydı düşüyor olabilir; cihazda Sağlık uygulamasıyla karşılaştırılır. Telefonun
  gün toplamı, telefon gün boyu taşınmadığı için %12–22 eksik kalabiliyor (Amagasa 2019; Duncan 2018); yürüyüş
  sırasında sayım iyi (Höchsmann 2018).
- Alarmdan 10 dk sonraki taze hava yalnız iOS 26'da ve alarmı elle durduran kişide mümkündür.
- Apple atfı: satırda işaret ve bağlantı var; bildirimde bağlantı olamaz, yalnız "Kaynak: Apple Weather" yazar ve
  dokununca bağlantılı sayfa açılır. Apple bildirimi yetersiz bulursa bildirimden hava cümlesi çıkar, yalnız "Bugünün
  havası hazır" kalır.
- Etki iddiası yoktur: "Sen karar ver"in üstünlüğü, sesli tempo anonsunun etkisi, hava bildiriminin davranışa etkisi ve
  dil modeliyle üretilmiş bildirimlerin davranış sonucu için deneysel çalışma bulunamadı (`pubmed.md` "Bulunamayanlar").
- `kod-haritasi.md`'deki `reminders.js` ve `habitLog.js` satır numaraları hatalı (dosyalar 96 ve 48 satır); işlev adları
  doğru. Kod oturumu adla arar. Satır numaraları ana oturumun işleriyle zaten kayacaktır.

**VARSAYIM listesi:** bildirimler arası 30 dk; pencereler (09–21, 08–22, yürüyüş sorusu 07–23, sessizlik 23–07,
ayar sınırları 21–24 / 06–10, 01–05 kapalı); yatmadan önce 60 dk, Uykuya Geçiş 30 dk; günde 6 modül bildirimi; teklif 30
gün; "Sen karar ver"de 28 gün, 15 dk dilim, 5 gün, 15 dk önce, 60 dk uzaklık, ikinci saat için 2 saat ve 5 gün, 14 günde
bir yeniden hesap; en çok 3 saat; modül hatırlatmalarında 3 gün ufuk; toplam bekleyen ≤ 60 ve iOS 64 sınırı; sabah
havası 10/20/30 dk, alarmsız gün 08.00; tahmin yaşı 1 ve 18 sa; AlarmKit niyetinde 8–10 sn; karakter sınırları (30, 70,
100, 110, 160) ve kilit ekranı satır sayısı; bilim satırında günde bir, 7, 14 ve 30 gün; sıcaklık sözcüğü eşikleri;
yürüyüş sorusunda günde 2, 3 saat, iki "Şimdi değil", son 15 dakika; "Her Zaman"da 5–10. dakika; tempo 30 sn, anonsta
10 ve 5 sn yuvarlama; ses parçası sayısı; 20 ve 40 dk hareketsizlik; Sağlık yenileme 2 dk; ilçe tablosunun 974 kaydı;
yerelde kalan verinin App Store etiketinde "toplanan" sayılmaması; B3'ün hukukçu yedeğine girmemesi; aşama süreleri.

---

## 9. Kaynakça

Tam tablo, tür, kişi sayısı ve sınırlar `arastirma/pubmed.md`'dedir; plana dayanak olanların PMID'leri orada ve depodaki
kaynak listelerindedir. Planda anılanlar: Peng 2022, Stecher 2021 (PMID 34941558), Morrison 2017 (PMID 28046034), Carter
2016, Van den Bulck 2007, Exelmans 2016, Brosnan 2024, Stutz 2019, Frimpong 2021, Evans 2012 (PMID 22898122), Tudor-Locke
2019, Schwebel 2012, Simmons 2020, Tucker ve Gilliland 2007 (PMID 17920646), Klimek 2022 (PMID 35151273), Togo 2005, Ho
2022, Yamanaka 2026, Toloo 2013, Noar 2007, Hao 2023, Krebs 2010, Schlicht 2026, Zaleski 2024, Bell 2023, Werner 2023 (PMID
37005465), Gilgen-Ammann 2020 (PMID 32396865), Höchsmann 2018, Amagasa 2019, Duncan 2018; bilim kartı örnekleri: Fincham
2023 (PMID 36624160), Klasnja 2019 (PMID 30192907, DOI 10.1093/abm/kay067), Morris 2020 (PMID 33322678), Laborde 2022 (PMID
35623448); ay: Cajochen 2013 (23891110), Haba-Rubio 2015 (26498230), Chaput 2016 (27047907), Smith 2017 (27928860),
Casiraghi 2021 (33571126). Doğruluk denetiminde 27 PMID'in künyesi ve 13 özet PubMed'de yeniden açıldı; §9'daki PMID'ler
doğru makaleye gidiyor (`elestiri-dogruluk.md`).

## 10. İnceleme izi

- 2026-09-30: araştırma (beş bağımsız ajan: kod, Apple yürüyüş, Apple hava ve bildirim, PubMed, Nef); taslak.
- Tur 1: iki bağımsız eleştiri (doğruluk: 7 yüksek, 15 orta, 12 düşük; eksiklik: ≈ 50 bulgu). İşlenenler: pencere
  çelişkisi (nefes 09.00'dan önce kurulamıyordu), legacy türde tek saat, `timeSensitive` kararı korunur, eşdeğerlik
  yalnız yeni kaynaklara bağlandı, geçici kesin konum, WeatherKit atfının bağlayıcı kuralı (satırda bağlantı), §2'ye
  dokuz satır, yol başına tek kart, yürüyüş sorusu penceresi, yürüyüş kaydının Nef'e gitmemesi, `walk` rızası kapsamı,
  kurtarma, hoparlör ve kesinti, gece sessizliği ayarı, durum çizelgesi, cihaz listesi, zeki cümle türleri ve "insan koç
  mu" ölçütü, kaynak cümlelerinin düzeltilmesi (Stecher, Fincham, Morrison, Evans, Morris, Werner, Gilgen-Ammann, Togo),
  karakter sınırları, 30/60 dk ayrımı, Türkçe düzeltmeler. İşlenmeyen: Watch'ta süren antrenmanı görmek (yeni Sağlık izni
  ister; sınır olarak yazıldı).
- Sırada: tasarımın 5 saniye kapısı, sahibin onayı.
