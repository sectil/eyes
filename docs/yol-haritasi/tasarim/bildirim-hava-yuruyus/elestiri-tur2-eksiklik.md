# Bildirim, hava, yürüyüş · eksiklik ve uygulanabilirlik denetimi (tur 2)

Tarih: 2026-09-30. İncelenenler: `PLAN.v1.md` (onaylı, 708 satır) ve `DEVIR.md` (117 satır). Bağlam olarak okunanlar:
`SAHIP_ISTEKLERI.md`, `elestiri-eksiklik.md` (tur 1), `5sn-tur1/2/3`, `tasarim.html` (metni çıkarıldı), `arastirma/nef-bildirim.md`
(başlıklar ve §1–§2), `arastirma/apple/` (Review Guidelines, konum yetkisi), `ANA_BELGE.md` §2, `S0/hukukcu-sorulari.md`,
`SONSUZ_YOL.PLAN.v1.md` (yürüyüş satırları).

Okunan kod: `modules/registry.js`, `lib/notifyPlan.js`, `lib/notifyApply.js` ve testi, `lib/sources.js` ve testi,
`lib/consent.js`, `lib/dataHub.js` ve testi, `App.jsx` (dokunma dağıtıcısı, plan kurulumu, "Tüm verileri sil"),
`ios/App/App/` (`AlarmPlugin`, `HealthPlugin`, `MainViewController`, `Info.plist`) ve `@capacitor/local-notifications`
8.3.1'in iOS kaynağı (`LocalNotificationsHandler.swift`, `LocalNotificationsPlugin.swift`).

Apple HIG "Privacy" sayfası JSON ucundan okundu. Hiçbir dosya değiştirilmedi, git kullanılmadı, cihazda bir şey denenmedi.

Önem derecesi:
- **yüksek:** kod oturumunu durdurur, mevcut sistemi bozar, sahibin kararından sapar ya da yayını durdurur.
- **orta:** iki türlü okunur, iş yeniden yapılır ya da kullanıcı şaşırır.
- **düşük:** netlik.

---

## 0. En önemli 12 bulgu

| # | Önem | Bulgu | Yer |
|---|---|---|---|
| 1 | yüksek | `notifyApply`'ın kendi aralığına 7700–7719 eklenirse, JS her plan kurulumunda Swift'in kurduğu yürüyüş sorusunu ve AlarmKit'in yenilediği 7700'ü **iptal eder**. `reconcile` aralıktaki her bekleyeni ya planla eşler ya da iptal eder. Plan hem "kendi aralığına 7700–7719" diyor hem "planAll 7700'ü yeniden yazmaz" (T3.1) | PLAN §5.2, §B.4; DEVIR §2 |
| 2 | yüksek | Bildirimdeki eylem düğmeleri ([Eşlik et], [Şimdi değil], "Kaynağı gör", fark et teklifindeki [Nasıl olur, göster]) bugün yutuluyor. `bindTap` `actionId !== 'tap'` olan her şeyi atıyor. `registerActionTypes` iOS'ta bütün kategorileri **değiştirir**; Swift de kategori kurarsa ikisi birbirini siler. Plan ve DEVIR bunu anmıyor (T3.2) | `lib/notifyApply.js` `bindTap`; PLAN §C.1, §A.6 |
| 3 | yüksek | `remind.science` doğrulaması `sources.js`'e bağlı. `createRegistry` geçersiz manifesti **sessizce atıyor** (yalnız `console.warn`). B1 sırasında `sources.js` kayıtları 7. adımda geliyor. 1. adımda `science` yazılan modül (nefes, mola…) uygulamadan kaybolur (T3.3) | `modules/registry.js` `createRegistry`; DEVIR §4 B1 sırası |
| 4 | yüksek | Eşdeğerlik düzeneği tanımsız. `planAll`, `planNotifications`'ı değiştirmeden çağırdığı için "planAll ≡ planNotifications" kendiliğinden doğrudur. Asıl risk `notifyApply` katmanında: `threadIdentifier`, teslim edilmiş bildirimin kaldırılması, aralık. Taban commit (ana oturumun gece düzeltmesi) henüz yok: `planNotifications`'ın oturum döngüsü hâlâ pencereye bakmıyor. `notifyApply.test.js`'teki tam biçim beklentisi (`toEqual`) `threadIdentifier` ile kırılır; "bilerek değişen" listede yok (T3.4) | DEVIR §4 B1, §5; PLAN §5.4 |
| 5 | yüksek | Sabah havasının 2. katmanı (AlarmKit `stopIntent`) yazıldığı gibi yapılamaz. (1) Swift arka planda konum alamaz ("Kullanırken" izni). (2) Plan koordinatı saklamıyor. Swift hangi yerin tahminini isteyeceğini bilemez. Şablonun "her olası saatle doldurulmuş" biçimi, nerede durduğu ve JS'e "yerelde yenilendi" bilgisini veren çağrı tanımsız (T3.8) | PLAN §B.1, §B.4 katman 2; DEVIR §2 "Hava" |
| 6 | yüksek | "Fark et" teklifinin açıklama sayfası Apple HIG'e aykırı. Sayfada [Aç] ve [Şimdi değil] var. HIG: *"Include only one button and make it clear that it opens the system alert… Use a term like 'Continue' or 'Next'… Don't include an option to cancel."* Ayrıca "When in Use" izni olmayan kişide iOS "Her Zaman" penceresini hiç göstermez, "geçici Her Zaman" verir. Planın "[Aç] → iOS'un Her Zaman penceresi" akışı bu kişide yanlış (T5.1, T5.2) | PLAN §C.1 madde 4; `tasarim.html` 19:05 ekranı; DEVIR §1.2, §6 |
| 7 | yüksek | Yürüyüş modülü veri merkezine ve yola bağlanamıyor. `walk-log` `sessions`'ta olmadığı için `progress.metrics.series({tests, sessions})`, `today(ctx)` ve `progression.match` onu göremez. `dataHub.test.js` `sessions.match` ya da `OTHER_ROUTE` istiyor; yani test **değişmek zorunda**, oysa DEVIR onu "değişmeden yeşil" sayıyor. Sonsuz yolun (e) aşamasındaki "2 dk yürüyüş" durağıyla B3'ün `walk` modülünün aynı modül olup olmadığı yazılı değil (T4.3) | PLAN §C.2 "Kayıt"; DEVIR §5; `lib/dataHub.test.js` |
| 8 | yüksek | Deney türlerinde 3 saat (sahibin kararı) için gereken çözümler tanımsız: günlük biçimi ("o gün kaç saat kurulduğu" hangi alanda), 78xx ek saatine dokununca `markTapped`, yürüyüş ek saatlerinin WalkGuard eşiği, "bugün yaptıysan" kuralının ikinci ve üçüncü saate etkisi. Sahip "günde kaç kez" dedi; tek kayıt bütün günü susturursa istek boşa çıkar. `notifyLog.test.js` "değişmeden yeşil" sayılıyor (T2.1) | PLAN §A.1 `legacy`; DEVIR §1.4 |
| 9 | yüksek | Nef bankasını kimin, ne zaman, hangi anahtarla, hangi betikle ürettiği ve B1 bankasız çıkarsa hangi metinle çıktığı yazılı değil. Kör insan değerlendirmesi (sahip + iki okur, biri 50 yaş üstü) B1'in kritik yoluna girmiş, ama okurları kim buluyor belli değil. Tur 1'in "B1b" önerisi (E7.4) işlenmemiş (T3.5) | DEVIR §4 B1, §7; PLAN §6 metin kapısı |
| 10 | yüksek | Gece kuralları birbiriyle çelişiyor. §1 ve tasarım "22.00–08.00 alarm dışında hiçbir bildirim" diyor. §A.4 tablosu "23.00–07.00" diyor; nefes 08.00'de, yürüyüş sorusu 22.00–23.00'te gelebiliyor. Varsayılan gece sessizliği kaç, yazılı değil. Kişinin değiştirdiği sessizlik deney türlerine ve Çalışma günlerine uygulanıyor mu, belli değil; uygulanırsa `notifyPlan`'a dokunmadan nasıl yapılacağı ve günlüğe ne yazılacağı yok (T2.3) | PLAN §1, §A.4; `tasarim.html` Bildirimler |
| 11 | yüksek | B3'te "Kullanırken" konum ve geçici kesin konum hukukçu cevabı beklenmeden yayına çıkıyor (plan VARSAYIM'ı). Onaylı yedek kural bunun tersi: "hukukçu adı gelmeden konum izni App Store'a gitmez". Bu değişiklik §2'deki "onaylı kararla ilişki" tablosunda da yok. `walk` ve `walkDetect` rıza metinlerinin taslağı yazılmamış (tur 1 E4.2 açık). Onaylı hukukçu sorusu "arka planda konum alınmaz, istek yalnız uygulama açıkken" diyor; katman 2 ve 3 bunu değiştiriyor (T5.3, T5.4) | PLAN §4; DEVIR §7; `S0/hukukcu-sorulari.md` Soru 1 |
| 12 | orta | Sesli koç ekranında ses seçimi var ("Ses: Neslihan · Hakan"). ANA_BELGE'nin değişmez kuralı: "Ses Profilim → Seslendirme'de bir kez seçilir; modüller sormaz." Ses parçası listesi de eksik: ilk anonstaki "1,1 kilometredesin" ondalık ister; 0 saniye ("10 dakikada"), km başına 30 dakikanın üstü, 15 km'nin üstü ve "Son 500 metre" parçaları yok. Dosya yolu mevcut ses paketi düzenine (`voice/tr/<female/male>/`, `index.json`) uymuyor (T3.9) | PLAN §C.3; `ANA_BELGE.md` §2 Tasarım |

---

## 1. Tur 1 bulgularının durumu

Tur 1'in 22 yüksek ve orta bulgusuna bakıldı. Düşük önemlilere yalnız değişen yerde değinildi.

| Tur 1 | Durum | Kalan |
|---|---|---|
| E1.1 günde kaç kez | kapandı | İki saat önerisi var. Sahibin kararıyla deney türleri de 3 saat; yeni sorunları T2.1'de |
| E1.2 "şık" ölçütü | kısmen | §6 "B1 kartı ve saat sayfası için üç tasarım yönü" diyor, ama bu tur yapılmadı. B1'in tasarım kapısı geçti mi, yeniden mi yapılacak, belli değil (T3.6) |
| E1.3 Nef'in zekâsı | kapandı | Zeki cümle türleri eklendi, "insan koç mu?" sorusu eklendi, canlı istem Y6'ya bağlandı |
| E1.4 her bildirimde PubMed | kapandı | Sahibin 3. kararı |
| E1.6 akşam yürüyüşü | kapandı | Yürüyüş sorusu 07.00–23.00. Ama gece çelişkisi var (T2.3) |
| E2.1 yol birimi | kısmen | Yol kartı tek. §A.3 "bu modülün (yolda yolun) kayıtları" diyor. Yolda yapılan nefes kayıtları, nefesin kendi "Sen karar ver"ine de sayılıyor mu? Sayılıyorsa yolu açan kişiye aynı saatte iki bildirim gelir ve birleşir. Sayılmıyorsa yazılmalı (T2.4) |
| E2.2 izin durumu, teklif sırası | kısmen | Ana sayfadaki mevcut kartlar (`profileSync`, `health`, seyreltme sorusu, deneme şeridi, `YogaMorningCard`) "günde bir teklif" sırasında yok (T4.6) |
| E2.3 günlük tavan | kapandı | — |
| E2.4 Bildirim Merkezi'nde yığılma | kısmen | "Yeni bildirim gelince eski teslim edilmişler kaldırılır" yerel bildirimde yapılamaz: uygulama kapalıyken JS çalışmaz, Notification Service Extension yalnız push'ta çalışır. Yalnız "uygulama açılınca" yapılabilir (T4.5) |
| E2.5 saat dilimi | kapandı | — |
| E2.6 kurtarma | kapandı | — |
| E2.7, E2.8 hoparlör ve kesinti | kapandı | — |
| E2.9 gece sessizliği ayarı | kısmen | Ayar var, varsayılanı çelişkili (T2.3) |
| E2.10 Watch | kapandı | Sınır olarak yazıldı |
| E2.13 320 pt çizelge | kapandı | — |
| E2.14 erişilebilirlik | kısmen | VoiceOver cihaz listesinde var. Dört büyük sayı, çizelge ve saat seçici için erişilebilirlik etiketi yazılmamış |
| E2.16 erteleme | kısmen | iOS 26 dışı için "sınır" diye kaldı, kabul edilebilir |
| E3.1 deney kirlenmesi | kapandı | — |
| E3.2 deney türünde çok saat | sahip kararıyla aşıldı | Uygulama ayrıntısı tanımsız (T2.1) |
| E3.3 yürüyüş kaydının Nef'e sızması | kapandı | Merkeze bağlanma sorunu doğdu (T4.3) |
| E3.4 Swift bildiriminin dokunuşu | kısmen | Sayısal kimlik yazıldı. Capacitor'ın beklediği biçim `userInfo["cap_extra"]` ve kimlik sayı dizesi; bu açıkça yazılmalı. Aralık çelişkisi (T3.1) ve eylem düğmeleri (T3.2) yeni |
| E3.5 eşdeğerlik ve gece | kısmen | Yeni kaynaklara bağlandı. Düzenek ve taban tanımsız (T3.4) |
| E3.6 iç çelişkiler | kısmen | (1) 08.00 oldu. (2) açık kaldı: "Sen karar ver" 60 dk diyor, çakışma sayfası 30 dk (12.30 → 13.00) öneriyor (T2.5). (3) ve (4) kapandı |
| E3.7 deney türünün düşmesi | kısmen | Deney bildirimi ile modül hatırlatması aynı yarım saate düşerse birleşiyor mu? Birleşirse deneyin metni ve kimliği değişir, `markTapped` kaybolabilir. Yazılmamış (T2.2) |
| E3.8 veri merkezi | açık | `pickAutoTime` `sessions` ve habit-log'u doğrudan okuyor. `walk-log` merkeze nasıl girer, tanımsız (T4.3) |
| E3.12 silme ve rıza geri çekme | kapandı | "`walk-log` (kişiye sorularak)" ifadesi "Tüm verileri sil" ile çelişiyor (T4.7) |
| E3.13 v2 cihaz denemesi önkoşulu | açık | §7'de ve DEVIR sırasında yok. Yalnız sınır olarak yazılmış |
| E4.1 `health` rızasının kapsamı | kısmen | `walk` rızasına yazıldı. `Info.plist`'teki `NSHealthShareUsageDescription` yalnız yürüyüş hatırlatmasını sayıyor; güncellenmesi listede yok. `walk` rızası var, `health` rızası yoksa ne olur, yazılmamış (T5.5) |
| E4.2 rıza metin taslakları | açık | T5.3 |
| E4.4 B3 hukukçu yedeği | açık, yön değişti | T5.4 |
| E4.5 kesin konum anahtarı | kapandı | — |
| E4.6 App Review notu, `NSHealthUpdateUsageDescription`, iOS'un "arka planda N kez kullandı" uyarısı | açık | T5.6 |
| E4.7 kilit ekranında mesafe | kapandı | Anahtarla, bilinçli istisna |
| E5.1 durum çizelgesi | kısmen | T6.1 |
| E5.2 testler | kapandı | "Fark et" testleri yalnız DEVIR'de; PLAN §5.3'te yok |
| E5.3 cihaz listesi | kısmen | T6.2 |
| E6.x sahibe sorular | kapandı | Onayla |
| E7.4 B1b | açık | T3.5 |

---

## 2. Sahibin kararları: eksiksiz ve çelişkisiz mi

**T2.1 · yüksek · PLAN §A.1 `legacy`, DEVIR §1.4 · deney türlerinde 3 saatin uygulanışı**

Sorunlar:
- `planNotifications` gün ve tür başına tek kimlik (7400 + gün×10 + tür) ve tek günlük kaydı üretiyor. Ek saatler 78xx'ten kurulacak, zar ise o günün kaydından okunacak. Bu "okuma" yolu yazılmamış.
- "Günlükte saat sayısı durur" hangi alanda? `notify-log` biçimi mi değişecek? `notifyLog.test.js` "değişmeden yeşil" sayılıyor.
- 78xx'teki ek saatin bildirimine dokununca `markTapped` çalışacak mı? `App.jsx`'te `extra.kind === 'nudge'` ise çalışır.
- Yürüyüş ek saatinin WalkGuard eşiği (`walkThreshold(avg, time)`) hangi saate göre? `setWalkGuards` yalnız planın `walkGuards` listesini alıyor.
- `doneToday` tek kayıtla günün **bütün** kalan saatlerini susturuyor. Sahip su ve nefes için "günde kaç kez" dedi: 09.00'da su içen kişi 13.00 ve 17.00 hatırlatmasını almazsa kararın anlamı kalmaz.
- Hatırlatmalar ekranı (`Reminders.jsx`) yalnız ilk saati gösteriyor; "Bana hatırlat" üç saati. İki ekran farklı şey söyler.
- `normalizeReminders`'ın türler arası 60 dk kuralı ek saatlere uygulanıyor mu, yazılmamış.

Düzeltme: DEVIR'e bir "legacy çok saat" alt bölümü eklenmeli.
1. Zar ve sessiz gün: `planAll`, `planNotifications`'ın o güne ait `log` kaydından (`arm`) okur. `arm !== 'send'` ise ek saatler kurulmaz.
2. Kimlik: 7800 + gün×20 + yuva.
3. `extra: { kind: 'nudge', type, date, slot }`; dokununca aynı `markTapped` çalışır.
4. Günlük: `notify-log`'a dokunulmaz. Ayrı `gozolcum:notify-slots` anahtarı `{date, type, times}` tutar; "Tüm verileri sil" listesine girer.
5. Yürüyüş ek saatine her saat için kendi eşiğiyle WalkGuard kaydı.
6. `doneToday`: legacy türde "o saatten önceki son 2 saatte yapıldıysa" kural olur. Su ve mola için "bugün en az bir kez yapıldıysa" bırakılırsa bu sahibe bir cümleyle söylenir.
7. `Reminders.jsx` ek saatleri salt okunur gösterir ("+ 13.00 · 17.00 · Bana hatırlat'tan").

Testler: "sessiz günde 3 saatin hiçbiri kurulmaz", "ek saate dokunmak o günü dokunulmuş sayar".

**T2.2 · orta · PLAN §A.4 (1) · deney bildirimi ile modül hatırlatmasının birleşmesi**
- Sorun: "Aynı 30 dakikaya düşen modül hatırlatmaları tek bildirimde birleşir" cümlesi deney bildirimini (74xx) kapsıyor mu, belli değil.
- Düzeltme: "74xx asla birleşmez ve metni değişmez. Modül hatırlatması 74xx'ten 30 dk'dan yakınsa kayar; elle seçilmiş saatse o gün düşer ve Bildirimler'de tek satırla söylenir." Bir test: "74xx'in `title`, `body`, `id` ve `at` alanları modül hatırlatmaları açıkken de değişmez."

**T2.3 · yüksek · PLAN §1, §A.4; `tasarim.html` · gece saatleri üç yerde üç türlü**
- Sorun:
  - §1: "gece 22.00–08.00 alarm dışında hiçbir bildirim gelmez".
  - Tasarım: "Gece sessizliği 22.00–08.00 · değiştir".
  - §A.4 tablosu: "Hiçbir bildirim 23.00–07.00"; `calm` 08.00–22.00; yürüyüş sorusu 07.00–23.00.
  - Varsayılan sessizlik 22–08 ise yürüyüş sorusu 22.00–23.00'te gelir mi? 23–07 ise §1'in sözü yanlış.
  - Kişi sessizliği 21.00'e çekerse deney türünün 20.45 molası (pencere 09–21, `notifyPlan`) yine gelir. "Hareket bildirimleri sessizlikten 1 saat önce biter" sözü deney türünde tutmaz.
  - Sessizliğin sonu 10.00 yapılırsa 09.00'daki deney bildirimi ne olur?
- Düzeltme: Tek tablo yazılmalı.
  - Varsayılan sessizlik (öneri 22.00–08.00, tasarımla aynı).
  - Yürüyüş sorusu sessizlikte gelmez; yalnız "kişi yürüyorsa sessizliğin ilk 60 dakikasında" istisnası sahibe sorulmadan eklenmez.
  - Sessizlik ayarı deney türlerine ve Çalışma günlerine `planAll`'da süzgeç olarak uygulanır. Düşen deney bildirimi günlüğe `skipReason: 'window'` ile yazılır.
  - Bu süzgeç yalnız ayar varsayılandan farklıyken çalışır; böylece eşdeğerlik (T3.4) korunur.
  - `notifyAll.test.js`'e iki test: "sessizlik 21.00 → 20.45 molası kurulmaz ve günlükte `window`", "varsayılan ayarda `planAll` ≡ taban".

**T2.4 · orta · PLAN §A.3 · yol kayıtları ile modülün kendi saati**
- Düzeltme: "Yolun içinde yapılan kayıt yalnız yol hatırlatmasının 'Sen karar ver'ine sayılır. Modülün kendi hatırlatması yalnız yol dışında yapılan kayıtlarından hesaplanır (kayıtta `pathDay` ya da `pathContext` işareti)." Hangi alanın bu işareti taşıdığı `modules/pathContext.js`'ten okunup DEVIR'e yazılmalı.

**T2.5 · orta · PLAN §A.2 ve §A.3 · 60 dk mı 30 dk mı**
- Sorun: §A.3 "başka bir bildirimle arası 60 dakikadan azsa kayar" diyor. Çakışma sayfası 12.30 Mola için 13.00'ü (30 dk) öneriyor ve tasarımda da öyle.
- Düzeltme: Öneri 60 dk ise örnek 13.30 olmalı. Ya da kurulum kuralı 30 dk'ya iner ve §A.4'teki "kurulumda 60" cümlesi silinir. Tek sayı seçilip teste yazılmalı.

**T2.6 · orta · PLAN §C.3 · 250 m ile kilometre anonsunun çakışması**
- Sorun: 250 m ya da 500 m seçiliyken 1.000. metrede iki cümle mi söylenir ("Son 250 metre…" + "1. kilometre…"), yalnız kilometre cümlesi mi? Tasarımdaki "3 km'de 12 kez" sayısı ikisinin de söylendiğini ima ediyor.
- Düzeltme: Kural yazılmalı. Öneri: tam kilometrede yalnız kilometre cümlesi. `walkCoach.test.js`'e "3.000 m'de 250 aralıkla anons listesi" beklentisi eklenmeli (12 + 3 mü, 9 + 3 mü?). Tasarımdaki sayı buna göre düzeltilmeli.

**T2.7 · orta · PLAN §C.1 madde 4, `tasarim.html` · "fark et" teklifinin metni iki türlü**
- Sorun:
  - Plan: *"Yürüyüşünü 20 dakika geç fark ettim. Yürürken hemen fark etmemi ister misin?"*
  - Tasarım: *"Yürüyüşlerine eşlik edebilirim · Bugünkü yürüyüşünü Apple Sağlık'ta gördüm. İzin verirsen bir dahakine yürürken yanında olurum."*
  - Tasarımdaki düğmeler [Nasıl olur, göster] [Şimdi değil]; plan düğme yazmıyor.
  - Hangisi bağlayıcı, belli değil. Bu ekran 5 saniye sınamasından geçmedi. DEVIR onu bekleyen kapı sayıyor, tasarım ise "14 ekran" içinde gösteriyor.
- Düzeltme: DEVIR "plan metni bağlayıcıdır; tasarım taslaktır, B3 kapısında sınanır" demeli. Şunlar da tanımlanmalı:
  - "Kaçırılan yürüyüş" ölçütü: son saatte ≥ 10 dk ve ≥ 800 m kesintisiz, soru gönderilmemiş.
  - "Hayır"ın nerede sayıldığı: bildirim düğmesi mi, sayfa mı.
  - Özet ekranındaki teklifin aynı sınıra (14 günde 1, toplam 3) sayılıp sayılmadığı.
  - Teklifin gece penceresi (§A.4 tablosunda satırı yok).

**T2.8 · düşük · karar 3 · tutarlı**
Cümle bankası, "her bildirimde kaynak kimliği" ve "görünür satır günde bir" üç belgede aynı. Tek eksik: birleşik bildirimde (§A.4) bilim satırı yok. Dokununca açılan Ana sayfada bilim kartı açılır mı? "Her bildirim bir PubMed kaynağına bağlı" sözü birleşik bildirimde tutmuyor. Düzeltme: birleşik bildirim ilk modülün `evidence` anahtarını taşır.

---

## 3. DEVIR ile kod oturumu işi bitirebilir mi

**T3.1 · yüksek · PLAN §5.2 `notifyApply.js`, §B.4 · Swift'in kurduğu kimlikleri JS iptal eder**
- Sorun: `reconcile` kendi aralığındaki her bekleyeni ya plandaki bildirimle "aynı" sayar ya da iptal eder. 7700 Swift'te `stopIntent` ile, 7710–7719 Swift'te yürüyüş sorusu olarak kurulacak.
  - Aralık 7700–7719'u kapsarsa, uygulama açıldığında ya da HealthKit arka planda uyandırıp plan yeniden kurulduğunda Swift'in bildirimi silinir.
  - Kapsamazsa "Tüm verileri sil" ve `cancelOwn` onları silmez.
- Düzeltme: İki ayrı küme yazılmalı.
  - `OWN_RANGES` (uzlaştırılan): 7400–7499, 7500–7509, 7700–7701 (yalnız "yerelde yenilendi" işareti yokken), 7800–7859.
  - `CANCEL_ONLY` (yalnız `cancelOwn`, rıza geri çekme ve silmede): 7710–7719.
  - "Yerelde yenilendi" günü 7700 `kept` sayılır, iptal edilmez.
  - Testler: "Swift'in 7712'si plan kurulumunda iptal edilmez; `cancelOwn`'da edilir", "yerelde yenilenen 7700 plan kurulumunda kalır".

**T3.2 · yüksek · `lib/notifyApply.js` `bindTap`; PLAN §C.1, §A.6 · eylem düğmeleri ve kategoriler**
- Sorun:
  - `if (a?.actionId !== 'tap') return` yüzünden [Eşlik et], [Şimdi değil] ve "Kaynağı gör" hiçbir yere ulaşmaz.
  - [Şimdi değil] uygulamayı açmadan sayılmalı. Günde iki "Şimdi değil" kuralı bu sayıya dayanıyor; bu yüzden eylemin seçeneği (`foreground` değil) ve kaydın Swift'te tutulması gerekir.
  - Capacitor'ın `registerActionTypes` çağrısı `setNotificationCategories` ile bütün kategorileri değiştirir. Swift (WalkPlugin) ayrıca kategori kurarsa iki taraf birbirini siler.
- Düzeltme:
  - Kategoriler tek yerden kurulur (öneri: Swift, açılışta). `nefona.walkAsk`: [Eşlik et] (ön plan) ve [Şimdi değil] (arka plan). `nefona.sci`: [Kaynağı gör] (ön plan).
  - JS `registerActionTypes` çağırmaz.
  - [Şimdi değil] Swift'te UserDefaults'a sayılır; JS açılışta okur.
  - `bindTap` `actionId`'yi `deliver`'a geçirir.
  - `notifyTap.test.js`'e "actionId 'walkGo' → yürüyüş ekranı, 'walkLater' → yönlendirme yok" eklenir.
  - Swift'in kurduğu bildirimde kimlik sayı dizesi (`"7712"`) ve `userInfo["cap_extra"]` (Capacitor 8.3.1 `makePendingNotificationRequestJSObject` bunu okuyor) olmalı; DEVIR'e bu adla yazılmalı.

**T3.3 · yüksek · `modules/registry.js`, DEVIR §4 B1 sırası · modülün sessizce kaybolması**
- Sorun: `createRegistry` doğrulamadan geçemeyen manifesti listeye almıyor. Yeni kural "`science`'taki her anahtar `sources.js`'te `pmid` ve `doi` taşır". Kaynaklar sıranın 7. adımında ekleniyor. Arada `remind` yazılan bir modül uygulamadan düşer; testte yalnız `registry.problems` boş değil diye görünür.
- Düzeltme:
  - `remind`'deki hata **yalnız `remind`'i** düşürür, modülü değil. `validateManifest` `remind` hatalarını ayrı bir listede (`remindProblems`) döndürür; `reminders()` erişicisi o modülü atlar.
  - Sıra değişir: `sources.js` kayıtları (kanıt kapısıyla) B1'in 1. adımına alınır.
  - Test: "`science` anahtarı eksik olan modül yine `registry.live`'da, `reminders()`'da yok".

**T3.4 · yüksek · DEVIR §4 B1 "eşdeğerlik düzeneği önce", §5 · düzenek tanımsız**

Sorunlar:
- `planAll` `planNotifications`'ı çağırıyorsa "planAll ≡ planNotifications" kendiliğinden doğrudur ve hiçbir şeyi sınamaz.
- Mevcut sistemin bozulabileceği yerler başka:
  - (a) `notifyApply`'a eklenen `threadIdentifier` ve `relevanceScore`. `notifyApply.test.js` satır 98'deki `toEqual` tam biçim beklentisi kırılır. DEVIR'in "bilerek değişen" listesinde yalnız kimlik sayısı var; bu yüzden kod oturumu kurala göre durmak zorunda kalır.
  - (b) "Eski teslim edilmişlerin kaldırılması" yeni özellik kapalıyken de çalışırsa bugünkü davranış değişir.
  - (c) `App.jsx`'teki plan etkisi (`mergeForPermission`, `cancelOwn`).
  - (d) `same()` karşılaştırması yalnız başlık, gövde ve saate bakıyor. `threadIdentifier` sonradan eklenince bekleyen eski bildirimler grubsuz kalır.
- Taban commit belirsiz. Kodda gece düzeltmesi yok: `planNotifications`'ın oturum döngüsü hâlâ pencereye bakmıyor. DEVIR "taban, ana oturumun gece düzeltmesini içeren commit" diyor ama o commit yokken ne yapılacağını söylemiyor.

Düzeltme (DEVIR §5'e):
1. **Taban dondurulur:** gece düzeltmesinden sonraki `lib/notifyPlan.js` `test/fixtures/notifyPlan.base.js` olarak kopyalanır. Düzeltme henüz yoksa B1 başlamaz ya da taban bugünkü HEAD olur ve düzeltme gelince yeniden dondurulur. Hangisi olacağı ana oturumda seçilir.
2. **Bağlam üreteci:** tohumlu (ör. `mulberry32(1)`); alanları `now` (7 gün × 24 saat, yaz saati günü dâhil), `reminders` (4 tür × on/off × saat × `thin`), `study`, `habits`, `sessions`, `health` (null, eski, taze), `focus` (1–4 sa, gece dâhil), `seed`, `log`. 20.000 bağlam.
3. **İki katman:** (i) `planAll(ctx, özellikler kapalı)` ≡ `base.planNotifications(ctx)`, derin eşit (`notifications`, `log`, `walkGuards`). (ii) Sahte LN ile `applyPlan` çağrı dizisi (`schedule`, `cancel`, `removeDelivered*`, `setWalkGuards`) taban `notifyApply`'la aynı. `threadIdentifier` yalnız yeni özellik açıkken eklenir ya da bilerek değişen alan olarak listeye yazılır.
4. "Kapalı"nın tanımı: `moduleReminders` boş, sabah havası kapalı, yürüyüş eşliği kapalı, `walk` ve `walkDetect` rızası yok, gece sessizliği varsayılanda.
5. Bilerek değişen beklentiler listesine `notifyApply.test.js` biçim testi ve `cancelOwn` kimlik sayısı (110 → yeni sayı) açıkça yazılır.

**T3.5 · yüksek · DEVIR §4 B1, §7 · Nef bankası: kim, ne zaman, nasıl**

Belirsiz kalanlar:
- Üretimi kim çalıştırıyor: kod oturumu mu, sahip mi?
- Anahtar: OpenRouter; ANA_BELGE'ye göre anahtar depoya ve sohbete yazılmaz. Nereden okunur?
- Betik yeri ve adı (depoda `app/scripts/` altında böyle bir betik yok).
- Hangi model ve yargıç: `nef-bildirim.md` §4'te gemini-3.1-flash-lite ile haiku-4.5 öneriliyor, plan "güçlü model" diyor.
- Sahip onayı iki kez gerekir: harcamadan önce (≈ 1 USD) ve metinden sonra. DEVIR yalnız "sahibin onayıyla" diyor.
- İki okur kim bulacak? Değerlendirme formu nerede?
- Banka onaylanmadan B1 TestFlight'a çıkar mı? Çıkarsa hangi metinle?

Düzeltme: B1 ikiye bölünür.
- **B1a:** banka yokken bugünkü `TEXTS` ve her modül için elle yazılmış 3 cümle, sahip onaylı. Sayı ve saat yer tutucuları aynı motordan geçer.
- **B1b:** banka.

DEVIR'e bir adım listesi yazılır:
1. Kod oturumu `app/scripts/nef-bank/generate.mjs` ve `judge.mjs`'i yazar. Anahtar yalnız ortam değişkeninden okunur (`OPENROUTER_API_KEY`); çıktı `lib/nefBank.data.js`.
2. Sahibe maliyet tahmini ve istem gösterilir; onay alınır.
3. Üretim ve yargıç çalışır. Makine sınavı (`nefBank.test.js`) geçer.
4. Kör değerlendirme sayfası (Artifact) sahibe ve iki okura gider.
5. Sahip onaylar; banka sürümü `releases.js`'e yazılır.

**T3.6 · orta · DEVIR §4, PLAN §6 · B1'in tasarım kapısı ve bekleyen tasarımlar**
- Sorun:
  - §6 B1 için "kart ve saat sayfasında üç tasarım yönü" istiyor; bu yapılmadı. Tur 1–3'te 00–05 tek yönle geçti.
  - "Gece sessizliği" ayar sayfası B1'in parçası ama tasarımı yok. DEVIR onu bekleyen tasarımlar arasında sayıyor, B1 sırasına koymuyor.
  - Tasarım listesinde hiç olmayan ekranlar: konum ve il/ilçe seçimi, *"Gaziemir'de misin?"*, hava teklif kartı, `weather`/`walk`/`walkDetect` rıza sayfaları, birleşik bildirim, yürüyüş bitiş özeti, yarım yürüyüş sorusu, "Kilit ekranında sayı gösterme" satırı.
- Düzeltme: DEVIR §4'te her parçanın başına "tasarım kapısında çizilecek ekranlar" listesi konur. B1 için: üç yön (ya da tur 1–3 sonucunun yeterli sayıldığına dair sahip onayı), Gece sessizliği sayfası, birleşik bildirim.

**T3.7 · orta · PLAN §A.6, `lib/sources.js` · bilim kartının alanları yok**
- Sorun: Kart "tek bulgu, tür, kişi sayısı, süre, sınır cümlesi, künye, PubMed, DOI" gösterecek. `SOURCES` biçiminde yalnız `design` ve `n` (serbest metin) var; "bulgu", "süre", "sınır" alanı yok. `evidence.js` kartları başka biçimde. Alanların nerede tutulacağı yazılı değil.
- Kaynak doğrulama adımı da tanımsız:
  - Kod oturumu PubMed'e nasıl erişecek?
  - Hangi alanlar karşılaştırılacak: yazar, yıl, dergi, DOI, n, tasarım?
  - Kanıt nereye yazılacak?
  - "Beş ay kaynağı" neden `sources.js`'e giriyor? Dolunayın bilim satırı Laborde (nefes).
- Düzeltme:
  - `sources.js`'e isteğe bağlı `finding`, `duration`, `limit` alanları eklenir; `sources.test.js`'e bu alanlar için kısa bir test eklenir. Mevcut test yeşil kalır.
  - Doğrulama adımı: her anahtar için PMID, PubMed E-utilities `esummary` ile açılır. Başlık, ilk yazar, yıl, DOI ve dergi karşılaştırılır. Kişi sayısı özetten alıntılanır. Sonuç `docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/kaynak-dogrulama.md` tablosuna yazılır. Uyuşmayan kaynak girmez.
  - Ay kaynakları yalnız hava sayfasında "ay evresi" satırı kullanılırsa eklenir.

**T3.8 · yüksek · PLAN §B.4 katman 2 · AlarmKit `stopIntent`**

Sorunlar:
1. **Yer:** `stopIntent` uygulamayı arka planda başlatır. "Kullanırken" izniyle arka planda konum alınamaz. Plan koordinatı saklamıyor, onaylı hukukçu metni de "koordinat saklanmaz" diyor. Swift hangi yer için tahmin isteyecek?
2. **Şablon:** "Her olası saatle doldurulmuş" şablon; yağmur başlangıcı × bitişi × sıcaklık × gökyüzü birleşiminde patlar. "Swift yalnız seçer, ek kurmaz" cümlesinin somut biçimi yok.
3. **Depo:** şablonlar ve "yerelde yenilendi" işareti Swift'te nerede duruyor (UserDefaults anahtarı)? JS bu işareti hangi eklenti çağrısıyla okuyor?
4. **Bugünkü alarm:** ana yapılandırma `AlarmConfiguration(countdownDuration:schedule:attributes:sound:)` ile kuruluyor, yedek yol `.alarm(…secondaryIntent: OpenNefonaIntent())`. `stopIntent` iki yola da eklenmeli; ertelemeden sonraki "Kapat" da aynı niyeti çalıştırır.
5. **Süre:** WeatherKit isteği yetişmezse 1. katmanın bildirimi zaten kurulu olmalı; yeniden kurulmamalı.

Düzeltme:
- (1) Swift'e kişinin seçtiği yer verilir: ilçe merkezinin tablo koordinatı ya da yaklaşık konumdan bulunan ilin merkezi. Kişinin kendi koordinatı değil; zaten tablodaki kamusal bir nokta olduğu için "saklanmaz" sözü korunur. Bu hukukçu metnine yazılır.
- (2) Biçim: JS, `{ templates: [{id, cell, text:"{tempNow}° … {rainFrom}"}], hours: {"21": {"LOC":"21.00'de","ABL":"21.00'den","DAT":"21.00'e"}, …} }` gönderir. Swift yalnız `cell` seçer, saat yer tutucusunu tablodan, sıcaklığı rakamla doldurur. JS–Swift eşlik testi aynı girdide aynı metni sınar.
- (3) `SkyPlugin.setMorningKit(obj)` ve `SkyPlugin.takeLocalRefresh() → { date, at }`.
- (4) ve (5) cihaz listesine: "ertelemeden sonra Kapat", "uçak modunda Kapat → 1. katmanın bildirimi gelir".

**T3.9 · orta · PLAN §C.3, `public/voice/` · ses parçaları**

Sorunlar:
- Parça listesinde eksikler:
  - İlk anons "1,1 kilometredesin" (ondalık sayı).
  - Saniyesi 0 olan cümle ("10 dakikada"; "dakika" + "da" ayrı parça).
  - Km başına 30 dakikanın üstü (duraklama ve çok yavaş yürüme) ve 3 dakikanın altı.
  - 15. kilometrenin ötesi.
  - "Son 500 metre" ve "Birlikte yürüyoruz".
- Mevcut ses paketi `public/voice/tr/{female,male}/<id>.mp3` ve `voice/index.json` düzeninde. Plan `public/voice/walk/<ses>/` diyor: dil katmanı ve dizin dosyası yok (ANA_BELGE "bütün dillere hazır").
- Swift'in bu dosyaları hangi yoldan okuyacağı yazılı değil (`Bundle.main` altında `public/voice/...`).
- Üretim betiği depoda yok, anahtar ortamda.
- ANA_BELGE: "Ses Profilim → Seslendirme'de bir kez seçilir; modüller sormaz." Koç ekranında ses seçimi var.

Düzeltme:
- Parça listesi `lib/walkCoach.js`'te tek dizi olur; test "üretilebilecek her anons parçalara ayrılır" (tempo 2:00–60:00 ve mesafe 0–42 km taranır). Kapsam dışı tempo için sabit cümle: *"Tempo şu an ölçülemiyor."*
- Yol: `voice/tr/<female|male>/walk-*.mp3`; `index.json`'a eklenir.
- Koç ekranında yalnız seçili ses ve "Dinle" durur; değiştirmek Profilim'e götürür. Ya da ANA_BELGE istisnası sahibe sorulur.
- Üretim adımı: sahip maliyeti onaylar, betik ortam anahtarıyla çalışır, sahip dikişleri dinler.

**T3.10 · orta · DEVIR §2 "Hava" · il/ilçe tablosu ve lisans**
- Sorun: GeoNames ADM2 (974 kayıt, CC BY 4.0) dosyası nasıl üretilecek, nerede duracak, ilçe merkezi koordinatı hangi alandan gelecek, "resmî 973, fark incelenmedi" nasıl kapanacak? Hiçbiri yazılı değil. Atıf "Bilgi → Kaynaklar"da (`Sources.jsx`) hangi metinle yer alacak, o da yok.
- Düzeltme: DEVIR'e "`lib/places.data.js`: `{il, ilce, lat, lon}`; üretim betiği `scripts/places.mjs` (GeoNames `TR.zip`, `feature code ADM2`); fark raporu `places-fark.md`; atıf metni: 'İlçe listesi: GeoNames (CC BY 4.0)'" eklenmeli.

**T3.11 · orta · DEVIR §4 · her parçanın "bitti" testi ve sıra bağımlılıkları**
- Sorun: B1'de "sürüm notu" var, `YAPILACAKLAR.md` yok. YAPILACAKLAR'da bu işin hiçbir satırı yok (grep: yok). ANA_BELGE "her açık iş YAPILACAKLAR'a" diyor. Hukukçu soruları "eklenecek" diye duruyor, kimin ekleyeceği yazılı değil. v2 cihaz denemesi önkoşulu da sırada yok (tur 1 E3.13).
- Düzeltme: DEVIR §4'e B0 adımı: "B1–B3 ve B3+ `YAPILACAKLAR.md`'ye `[ ]` olarak yazılır; hukukçu soruları `S0/hukukcu-sorulari.md`'ye eklenir; v2 cihaz listesi (§0b) B1 kodundan önce geçer ya da sahip bunu bilerek atlar."

---

## 4. Mevcut sistemi bozma riski

**T4.1 · yüksek** → T3.1 (JS'in Swift bildirimini iptal etmesi).

**T4.2 · yüksek** → T3.3 (modülün sessizce kaybolması).

**T4.3 · yüksek · PLAN §C.2 "Kayıt", DEVIR §5, `lib/dataHub.js` · yürüyüş modülünün veri merkezi ve yol bağlantısı**
- Sorun:
  - `progress.metrics[].series({ tests, sessions })` `walk-log`'u almıyor. "Haftalık yürüyüş dakikası" metriği ya `localStorage`'dan kendisi okur (ANA_BELGE'nin "tek kapı" ilkesine aykırı) ya da hiç çalışmaz.
  - `hub()` ve `growthMap()` `habits` alıyor, `walks` almıyor.
  - `dataHub.test.js` `sessions.match` ya da `OTHER_ROUTE` istiyor: test **değişmek zorunda**.
  - `today(ctx)` ve `progression.match(s)` `sessions` üzerinden çalışıyor; yolun yürüyüş durağı "yapıldı" olamaz.
  - Sonsuz yol planı (e) aşamasında `walk`'ı "2 dk yürüyüş, 4. günden, merdivenli" diye tanımlıyor (§A.9, satır 506). B3 bunu mu yapıyor, ayrı bir modül mü, yazılı değil.
- Düzeltme:
  - Mevcut `alarmHabits` kalıbı izlenir: `loadHubHabits` `walk-log`'u `{type:'walk', at, date, minutes}` habit'i olarak katar; `HABIT_DOMAIN.walk = 'body'`. Yürüyüş seriye ve Nef'e girmez; merkez okur.
  - `today()` ve `progression` için `ctx.habits` eklenir; ya da B3 yola girmez ve bu açıkça yazılır.
  - `dataHub.test.js` ve `registry.test.js` "bilerek değişen" listesine eklenir (`OTHER_ROUTE.walk`).
  - `thinCandidate`'in `habits` içinde `walk` türünü görmesi yürüyüş seyreltmesini değiştirmemeli: test eklenir.
  - DEVIR'e tek cümle: "B3'ün `walk`'ı sonsuz yolun (e) `walk` modülünün ilk sürümüdür; yol durağı (e) aşamasında eklenir."

**T4.4 · orta · PLAN §5.2 `App.jsx` · tek dokunma dinleyicisi**
- Sorun: Dağıtıcı (`App.jsx` satır 163 civarı) yalnız `id` ve `extra.kind` ile yönlendiriyor. 77xx, 771x ve 78xx için `extra.kind` değerleri (`weather`, `walkAsk`, `walkOffer`, `remind`, `remindMerged`) sözleşmede yazılı değil. Soğuk açılışta dokunuş, `goRef` hazır olmadan gelirse kuyrukta bekliyor (iyi). Ama yürüyüş ekranının "son 15 dakikayı ekle" verisi (`extra.since`) Swift bildiriminde taşınmalı.
- Düzeltme: DEVIR'e `extra` sözlüğü tablo olarak yazılır: kimlik aralığı → `kind` → alanlar → açılacak ekran. `notifyTap.test.js` bu tabloyu tek tek sınar.

**T4.5 · orta · PLAN §A.4 · "yeni bildirim gelince eskisini kaldır"**
- Sorun: Yerel bildirim geldiğinde uygulama kodu çalışmaz (ön planda değilse). Söz tutulamaz.
- Düzeltme: "Uygulama her açıldığında Nefona'nın teslim edilmiş eski bildirimleri kaldırılır (`removeDeliveredNotifications`, yalnız 74xx dışı; 74xx'e dokunulmaz ki deneyin dokunma ölçüsü değişmesin)." Cihaz listesinde "Bildirim Merkezi'nde tek yığın" maddesi `threadIdentifier` ile karşılanır.

**T4.6 · orta · PLAN §A.2 "Ana sayfada teklifler", Ana sayfa yeniden tasarımı**
- Sorun: "Günde en çok bir teklif" sırası yalnız bildirim izni → hava → yürüyüşü sayıyor. Ana sayfada bugün `profileSync` rızası, `health` rızası, seyreltme sorusu (`thinAsk`), deneme şeridi ve `YogaMorningCard` var. Ana sayfa yeniden tasarlanırken teklif yuvasının yeri ve önceliği iki oturumda ayrı ayrı karara bağlanabilir. `SkyLine`'ın "adımların üstünde" yeri de yeni tasarıma bağlı; tasarımdaki Ana sayfa (seri, "Bu hafta 3/4") yeni Ana sayfayla çelişebilir.
- Düzeltme: DEVIR'e "Ana sayfada tek teklif yuvası (`HomeOffer`), öncelik listesi bütün mevcut kartlarla birlikte" maddesi. B2'nin Ana sayfa işi, Ana sayfa tasarımı onaylandıktan sonra ve o tasarımın dosyasına göre yapılır; tasarımdaki 06 ekranı yalnız satırın kendisi için bağlayıcıdır.

**T4.7 · düşük · PLAN §4 "Tüm verileri sil"**
- Sorun: "`walk-log` (kişiye sorularak)" ifadesi "Tüm verileri sil"de soru anlamına gelebilir; bugünkü akış sormuyor, hepsini siliyor.
- Düzeltme: "Tüm verileri sil'de sorulmadan silinir. `walk` rızası geri çekilince 'Kayıtların da silinsin mi?' diye sorulur."

**T4.8 · orta · bekleyen bildirim bütçesi**
- Sorun: JS ≤ 60 sayıyor. Swift'in kurduğu yürüyüş sorusu ve fark et teklifi (771x) JS'in bilgisi dışında. 64'ü aşınca iOS'un hangisini düşürdüğü belgede yok.
- Düzeltme: Bütçe "JS ≤ 58; 2 yuva Swift'e ayrılır" olur ve teste yazılır.

---

## 5. KVKK ve App Store

**T5.1 · yüksek · PLAN §C.1 madde 4, `tasarim.html` 19:05 · açıklama sayfası HIG'e aykırı**
- Kaynak: HIG "Privacy", Pre-alert screens: *"Include only one button and make it clear that it opens the system alert… Use a term like 'Continue' or 'Next'… Don't include additional actions in your custom screen or window, unless needed to obtain a legal consent… Don't include an option to cancel."* Review Guideline 5.1.1(iv): izin için yönlendirme ya da zorlama yasak.
- Sorun: Sayfada [Aç] (izin veriyormuş gibi okunan bir sözcük) ve [Şimdi değil] var.
- Düzeltme: İki yol var.
  - (a) Sayfa KVKK `walkDetect` açık rıza sayfasıdır. İşaretsiz kutu, [Devam] ve "Vazgeç"; HIG'in "legal consent" istisnası bu yüzden. [Devam]'a yalnız kutu işaretliyken basılabilir ve iOS penceresini açar.
  - (b) Tek düğmeli [Devam]; "Şimdi değil" yalnız bildirimin kendi eylem düğmesinde durur.
  - Öneri (a): KVKK zaten ayrı rıza istiyor. Ayrıca rıza iOS penceresinden **önce** alınmalı; bu sıra DEVIR'de yazılı değil.

**T5.2 · yüksek · PLAN §C.1 madde 4 · "Her Zaman" izninin gerçek akışı**
- Kaynak: `arastirma/apple/corelocation__requesting-authorization-to-use-location-services.json`: *"If your app already has When in Use authorization, you can make a separate request for Always authorization later. However, you can make the request only once."*
- Sorun:
  - Konum izni hiç verilmemişse (hava için ilçeyi listeden seçen, yürüyüşte konum istenmemiş kişi) `requestAlwaysAuthorization` önce "Kullanırken / Bir Kez / İzin Verme" penceresini açar. "Her Zaman"ı iOS kendisi, sonraki bir arka plan olayında sorar.
  - "Bir Kez" seçilirse özellik çalışmaz.
  - iOS pencerenin daha önce gösterilip gösterilmediğini söylemez; uygulama bunu kendisi tutmalı (yeniden kurulumda kaybolur).
- Düzeltme: Akış durum durum yazılır.
  - `notDetermined` → önce "Kullanırken" penceresi, sonra ayrı bir adımda "Her Zaman".
  - `authorizedWhenInUse` ve daha önce sorulmamış → "Her Zaman" penceresi.
  - Daha önce sorulmuş ya da `denied` → Ayarlar.
  - "Bir Kez" → anahtar kapalı kalır, tek satır açıklama.
  - Cihaz listesine üç başlangıç durumu ve "Bir Kez" eklenir; testte `walkDetect` durum makinesi sınanır.

**T5.3 · yüksek · PLAN §4, DEVIR §2 "Rızalar" · rıza metinleri yok**
- Sorun: `weather` v1 kodda hiç yok (`CONSENT_VERSIONS`'ta yok). Plan "iki satırla genişler" diyor ama ana metin onaylı §3.E.2'de, eklenecek iki satır ise yazılı değil. `walk` ve `walkDetect` için Ne / Ne işe yarar / Nerede durur / Ne kadar kalır satırları ve kutu cümlesi yok (`consent.test.js` bu dört başlığı `profileSync` için sınıyor). Metin kapısı sahibin onayını istiyor; kod oturumu metni kendisi yazamaz.
- Düzeltme: B2 ve B3'ün tasarım kapısına rıza sayfaları çizilerek girer. Metinler `lib/consent.js` kalıbında taslak olarak DEVIR'e ya da `rizalar-taslak.md`'ye yazılır ve sahip onaylar. `consent.test.js`'e yeni anahtarların dört başlığı eklenir. Bu "değişmeden yeşil" kuralını bozmaz, yalnız ekler.

**T5.4 · yüksek · PLAN §4 "Hukukçu yedeği", DEVIR §7 · onaylı yedeğin sessizce değişmesi**
- Sorun:
  - Onaylı yedek "hukukçu adı gelmeden konum izni App Store'a gitmez" diyor. Plan B3'ün "Kullanırken" konumunu ve geçici kesin konumunu VARSAYIM'la yayına açıyor.
  - Bu değişiklik §2'deki "onaylı kararla ilişki" tablosunda yok ve sahibe sorulmadı. DEVIR §7 yalnız "Her Zaman"ı ve havayı anıyor.
  - Onaylı hukukçu sorusu (`S0/hukukcu-sorulari.md` Soru 1) "arka planda konum alınmaz; istek yalnız uygulama açıkken, günde ≤ 8" diyor. B2'nin 2. ve 3. katmanı arka planda WeatherKit isteği yapıyor; ilçe yeni bir veri.
  - "Her Zaman" anahtarının App Store'a gitmemesi için derleme düzeyinde ne yapılacağı yazılı değil. `NSLocationAlwaysAndWhenInUseUsageDescription` ikili dosyada durursa App Review yine sorar.
- Düzeltme:
  - §2 tablosuna satır: "Konum izni hukukçudan önce yayına girmez → B3 'Kullanırken' ile girer (VARSAYIM) → gerekçe: konum telefondan çıkmıyor." Bu karar sahibe tek soru olarak gider ya da B3 konumsuz çıkar (mesafe adım sayarından, tur 1 E4.4).
  - Hukukçu Soru 1'in metni ilçe ve arka plan istekleriyle güncellenir.
  - DEVIR'e: "App Store derlemesinde `walkDetect` kodu derleme bayrağıyla (`NEFONA_WALK_DETECT`) kapalıdır ve `NSLocationAlwaysAndWhenInUseUsageDescription` Info.plist'te yoktur. TestFlight iç derlemesinde açıktır."

**T5.5 · orta · `Info.plist` · amaç metinleri**
- Sorun: `NSHealthShareUsageDescription` arka plan okumasının amacını yalnız "yürüyüş hatırlatması" diye sayıyor. Yeni amaçlar yazılmamış: yürüyüş sorusu, yürüyüş kaydına Sağlık adımı. Guideline 5.1.1: amaç metni doğru olmalı. `NSHealthUpdateUsageDescription` "hiçbir veri yazmaz" diyerek duruyor; yazma izni istenmiyorsa bu anahtar gerekçesiz (tur 1 E4.6d). `walk` rızası var ama `health` rızası yoksa Sağlık okunur mu, belli değil.
- Düzeltme: §4 Info.plist listesine `NSHealthShareUsageDescription` güncellemesi eklenir. Kural: "Sağlık okuması `health` rızası ister; `walk` rızası yalnız yürüyüş amaçlarını ekler. `health` yoksa bitişte adım telefonun sayımıdır (`stepsSource: 'phone'`)." `NSHealthUpdateUsageDescription` ana oturuma not edilir.

**T5.6 · orta · App Review notu ve arka plan konum uyarısı** (tur 1 E4.6'dan açık kalan)
- Düzeltme: B3 için App Review Notes taslağı: ne zaman konum, mavi gösterge, demo adımları, "Her Zaman" yalnız anahtarla. Uygulama içinde iOS'un "Nefona konumunu arka planda N kez kullandı" uyarısına karşılık Bildirimler → "Yürürken beni fark et" satırında tek cümle.

**T5.7 · orta · fark et teklifinin bildirimle istenmesi (Apple açısından)**
- Değerlendirme: Guideline 4.5.4 push bildirimleri için "promotions" yasağı koyuyor. Yerel bildirim bu maddenin sözüne girmiyor, ama inceleme aynı ölçütle bakabilir. HIG "izni özellik kullanıldığında iste" diyor. Teklif ancak kişi `walk` rızası verip "Yürüyüş eşliği"ni açmışsa (saatlik uyanış yalnız o zaman var) ve bir yürüyüşün hemen ardından gelirse "özellik kullanımına bağlı" sayılabilir. Bu koşul planda **yazılı değil**.
- Düzeltme: §C.1 madde 4'e: "Teklif yalnız `walk` rızası ve 'Yürüyüş eşliği' açık kişiye gider; bildirim yalnız özelliğin kendisini anlatır; ödül ya da baskı cümlesi yok; 'Bildirimler'de kapatılabilir' satırı açıklama sayfasında." App Review notuna bu akış yazılır.

**T5.8 · düşük · kilit ekranı**
- Sorun: Fark et teklifinin metni ("20 dakika geç fark ettim") ve sabah havasındaki ilçe adı kilit ekranında görünüyor. "Kilit ekranında sayı gösterme" anahtarının bu iki bildirime de uygulanıp uygulanmadığı yazılı değil.
- Düzeltme: Anahtarın kapsamı "yürüyüş sorusu, fark et teklifi ve sabah havasındaki yer adı" diye yazılır.

---

## 6. ANA_BELGE "bitti" kuralı: durum çizelgesi ve cihaz listesi

**T6.1 · yüksek · PLAN §6 durum çizelgesi · eksik ekranlar ve durumlar**

ANA_BELGE kuralı: "ekranın her durumu iki temada görülür — boş veri, 1. gün, dolu, iyileşme, gerileme, dar ekran (320 px), akışın her adımı". Çizelgede olmayan ekranlar:
- **Bilim kartı:** kaynak var, kişi sayısı bekleniyor (yayına girmez), "Kaynağı gör"le açılış, uygulama kapalıyken açılış.
- **Sesli koç ayarı:** kapalı, üç aralık, kulaklık yok, VoiceOver açık.
- **Kilit ekranı bildirimleri:**
  - Sabah havası: taze, yaşı yazılı, yağmursuz, yürüyüşün sessiz günü, "yerelde yenilendi".
  - Yürüyüş sorusu: hava var ve yok, "sayı gösterme" açık.
  - Birleşik bildirim.
  - Fark et teklifi.
- **Rıza sayfaları:** `weather`, `walk`, `walkDetect`; ilk kez ve güncelleme.
- **Konum sayfası:** konum ret, yaklaşık konum, il/ilçe listesi (arama, boş sonuç), *"Gaziemir'de misin?"*, sonradan izin kapatılınca il adının silinmesi (onaylı kural).
- **Fark et açıklama sayfası:** üç izin başlangıç durumu (T5.2).
- **Gece sessizliği ayarı:** sınır değerler.
- **Yol bitiş kartı:** ilk gün, seri kırılmış.
- **Ana sayfa teklif yuvası.**
- **Gelişim yürüyüş kartı:** "artış/azalış" yazıyor; ANA_BELGE'nin terimi "iyileşme/gerileme". Tempo yön taşımadığı için iyileşme ve gerileme yalnız haftalık dakikada tanımlanmalı.
- **Akışlar:** "Bana hatırlat → izin penceresi → ret → Ayarlar'a gidip dönüş"; "teklif → rıza → iOS → Bir Kez".
- **Sağdan sola ve uzun çeviri** (ANA_BELGE "bütün dillere hazır"): hiçbir satırda yok.

Düzeltme: Bu satırlar çizelgeye eklenir. Her satırın yanına hangi parçada (B1/B2/B3) görüleceği yazılır.

**T6.2 · orta · PLAN §6 cihaz listesi · eksikler**
- **B1:**
  - Legacy türde ek saatin sessiz günde gelmemesi.
  - Ek saate dokununca günlükte "dokunuldu".
  - Uygulama kapalıyken birleşik bildirime dokunma.
  - Uygulama açılınca eski teslim edilmişlerin kaldırılması.
  - Saat dilimi değişimi.
  - Silip yeniden kurma.
- **B2:**
  - Katman 2'nin ilçeyi listeden seçmiş (konumsuz) kişide çalışması.
  - Ertelemeden sonra "Kapat".
  - Uçak modunda "Kapat".
  - Uyku Odağı'nda 06.10 bildirimi.
  - Günlük WeatherKit isteği sayımı (≤ 8 + 2).
- **B3:**
  - Telefon kilitliyken HealthKit verisi şifreli; `HealthPlugin` notu kilitli telefonda sorgunun hata verdiğini söylüyor. Cepte kilitli telefonda yürüyüş sorusunun gelip gelmediği ve `CMPedometer` geçmiş sorgusunun kilitliyken çalışıp çalışmadığı denenmeli.
  - [Şimdi değil] düğmesinin uygulamayı açmadan sayılması.
  - Kategori çakışması: "Kaynağı gör" ve yürüyüş düğmeleri birlikte.
  - "Bir Kez" izni.
  - Teklif sınırının (14 günde 1) cihaz saatini ileri alarak denenmesi.
- **Ortak:** App Store derlemesinde `NSLocationAlwaysAndWhenInUseUsageDescription`'ın bulunmaması (T5.4).

**T6.3 · düşük · §6 "bitti" · kayıt yerleri**
- Sorun: Cihaz listesindeki her maddenin HATA_GUNLUGU'na yazılacağı söyleniyor; durum çizelgesinin ekran görüntülerinin nereye konacağı ve "şu durumlara bakmadım" listesinin nerede tutulacağı yazılı değil.
- Düzeltme: "Her parça için `…/bildirim-hava-yuruyus/cihaz-B1.md`: çizelge satırı → görüldü / görülmedi → not."

---

## 7. Bakmadıklarım

- `tasarim.html`'in görsel hâli (yalnız metni çıkarıldı).
- `arastirma/apple-hava-bildirim.md`, `apple-yuruyus.md` ve `pubmed.md`'nin tamamı; yalnız plan atıflarıyla ilgili yerlere ve Apple konum yetkisi belgesine bakıldı.
- `CMPedometer`'ın kilitli telefonda geçmiş sorgusu: belgeye bakmadım (T6.2'de cihaz maddesi olarak bırakıldı).
- AlarmKit `stopIntent`'in arka planda ağ ve WeatherKit çağrısına izin verip vermediği: belgeye bakmadım (plan da "doğrulanmadı" diyor).
- `modules/pathContext.js` ve `lib/today.js`'in yol kaydını nasıl işaretlediği (T2.4 bu yüzden "okunup yazılmalı" diyor).
- `SONSUZ_YOL.PLAN.v1.md`'nin yalnız yürüyüş satırlarını okudum; Y5 ve hava bölümünü baştan sona okumadım.
