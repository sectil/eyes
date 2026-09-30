# Bildirim, hava, yürüyüş planı (v1): eksiklik ve tasarım eleştirisi

Tarih: 2026-09-30. İncelenen: `PLAN.v1.md` (643 satır). Karşılaştırılanlar: `arastirma/*.md`, `SONSUZ_YOL.PLAN.v1.md`,
`BILDIRIM_PLANI.md` (v2), `ANA_BELGE.md`, `SAHIP_ISTEKLERI.md`, `S0/sorular-kararlar.md`, `S0/app-review-sorusu.md`,
`YAPILACAKLAR.md` §0b ve kod (`app/src/lib/coach.js`, `lib/consent.js`, `ios/App/App/Info.plist`,
`components/YogaMorningCard.jsx`). Yalnız okundu; bu dosyadan başka hiçbir dosya yazılmadı, git kullanılmadı. Cihazda
hiçbir şey denenmedi. Bu belge doğruluk (kaynak ve Apple alıntıları) denetimi değildir; o ayrı eleştiridir.

Önem: **yüksek** = sahibin sözünden sapma, mevcut sistemi bozma ya da yayını durdurabilecek eksik; **orta** = kullanıcıyı
şaşırtacak ya da işi yeniden yaptıracak boşluk; **düşük** = netlik ve cila.

---

## 0. En önemli 12 bulgu (önem sırasıyla)

| # | Önem | Bulgu | Yer |
|---|---|---|---|
| 1 | yüksek | Nef'in yürüyüş sorusu ve sabah havasının "yürüyüş için güzel" cümlesi, yürüyüş deneyinin **sessiz günlerinde de** yürümeye çağırır; deneyin karşılaştırması bozulur (E3.1) | §2 satır "Bildirim deneyi", §C.1 |
| 2 | yüksek | Deney türlerinde (nefes, mola, su, yürüyüş) 3 saate kadar izin verilir; onaylı plan "her türden günde en çok 1", kimlik şeması ve günlük tek `plannedAt` taşıyor. Kod haritası da tek saat öneriyordu (E3.2) | §A.1 `maxTimes`, §2 |
| 3 | yüksek | Yürüyüş kaydı `store.sessions`'a yazılıyor: `coach.js buildSignals` onu `minutes7`, seri ve haftalık güne sayar, yani Nef'e yeni sağlık verisi gider ve seri şişer. "Bu plan Nef'e yeni veri göndermez" cümlesi tutmaz (E3.3) | §C.2 "Kayıt", §2 son satırlar |
| 4 | yüksek | Sahip "**her** bildirim PubMed'e dayanır" dedi; plan "günde en çok bir bildirim bilim satırı taşır" diye kendisi karar verdi. Notlar bunu sahibe sorulacak soru olarak bırakmıştı (`nef-bildirim.md` §10.8 soru 8) (E1.4) | §1 "Kendi karar verdiklerim", §A.6 |
| 5 | yüksek | Sonsuz yolda modüller aynı oturumda art arda yapılır. "Sen karar ver" her modüle ayrı saat seçip 60 dk uzaklaştırınca yolu yapan kişiye 08.15 nefes, 09.15 göz, 10.15 yoga gibi anlamsız bir dizi çıkar; yolda her duraktan sonra "Bana hatırlat" kartı 6–8 kez görünür (E2.1) | §A.2, §A.3 |
| 6 | yüksek | Gece kuralı yürüyüş sorusuna da uygulanıyor. Hareket penceresi 09.00–21.00 olunca İzmir yazında en yaygın akşam yürüyüşü (21.00–22.30) hiç yakalanmaz. Sahibin "21'den sonra kalk mantıksız" sözü **kalk** içindir, zaten yürüyen kişiye eşlik için değil (E1.6) | §C.1, §A.4 |
| 7 | yüksek | Apple Sağlık verisi yeni amaçlarla okunuyor (yürüyüş sorusu için arka plan uyanışı, yürüyüş kaydına adım yazmak). Plan bunu mevcut `health` v2 rızasına bırakıyor. `health` metni "Sunucuya ve Nef'e gitmez" ve amaçları sayıyor; amaç genişleyince sürüm 3 ve yeniden rıza gerekir (E4.1) | §4 tablo, satır 451–452 |
| 8 | yüksek | ANA_BELGE'nin "bitti" kuralı karşılanmıyor. Hiçbir ekran için durum çizelgesi yok (boş veri, 1. gün, dolu, iyileşme, gerileme, 320 px, iki tema, akışın her adımı); cihaz listesinde Gelişim'deki yürüyüş kartı, Bildirimler'in boş hâli ve izin yok hâli, yürüyüş ekranının izinsiz hâli yok (E5.1) | §6 |
| 9 | yüksek | Yürüyüş sırasında uygulama kaydırılıp kapatılırsa ölçüm biter ("Kullanırken" izni yeniden açmaz) ve kayıt kaybolur. Kurtarma yolu yazılmamış; `CMPedometer` son 7 günü sakladığı için yürüyüş geri kurulabilir (E2.6) | §C.2 |
| 10 | yüksek | Plan, sahibin "ucuz model, istem ve veriyle zeki" isteğini yalnız bildirim bankası olarak okuyor. Nef'in canlı sohbet ve yorum istemine (`coachCore.js` SYSTEM_PROMPT) hiçbir iyileştirme önerilmiyor. "Zeki" ölçülmüyor: kör değerlendirme yalnız dil ve hata puanlıyor, "etkiledi mi / zeki mi" puanı yok (E1.3) | §A.6, §6 metin kapısı, karar 3 |
| 11 | orta | Kendi içinde çelişen kurallar var: sabah havası alarmsız varsayılanı **07.30**, oysa gece kuralı 22.00–08.00'de alarm dışında bildirimi yasaklıyor ve test de bunu sınıyor. "Sen karar ver" başka bildirimden **60 dk**, çakışma kuralı **30 dk** diyor. Nefes 'calm' penceresi 08–22, dokunulmayan `notifyPlan` ise 09–21 uyguluyor: 08.30'a kurulan nefes sessizce gelmez (E3.6) | §A.3, §A.4, §B.4 |
| 12 | orta | §1 sahibe beş saniyede bir şey göstermiyor. 75 satırlık yoğun metin var; ilk tabloda `remind`, `planAll`, WeatherKit, `CMMotionActivityManager` yolları ve `HKWorkoutSession` geçiyor. Kişinin göreceği üç an (kilit ekranındaki bildirim, Ana sayfa satırı, yürüyüş ekranı) bir bakışta verilmiyor (E7.1) | §1 |

---

## 1. Sahibin istekleri karşılanmış mı

**E1.1 · orta · §A.3, §A.2: "günde kaç kezse o saatler"**
- Sorun: "Sen karar ver" her zaman **tek** saat seçiyor ("en yüksek dilim seçilir"). Günde iki kez nefes yapan kişiye iki saat
  önerilmiyor. Elle seçimde üst sınır 3 ve bu sınırın gerekçesi yok; deney türlerinde de çok saat serbest (bkz. E3.2).
  Sahibin sözü iki yolla okunabilir: (a) sistem kişinin günde kaç kez yaptığını görür ve o sayıda saat kurar; (b) kişi
  günde kaç kez istediğini söyler ve saatleri seçer. Plan (a)'yı hiç ele almıyor.
- Düzeltme: §A.3'e şu kural eklenmeli: "Son 28 günde, aynı günde birbirinden en az 2 saat ayrı iki ayrı dilimde en az 5
  farklı gün kayıt varsa 'Sen karar ver' iki saat önerir: 'Nefesi genelde 08.30'da ve 17.00'de yapıyorsun. İkisinde de
  hatırlatayım mı?' [İkisinde] [Yalnız sabah]." Deney türlerinde (nefes, mola, su, yürüyüş) sayı 1'de kalır ve ekranda
  şu yazar: "Bu hatırlatmanın işine yarayıp yaramadığını ölçüyoruz; bu yüzden günde bir kez." Deney dışı modüllerde sınır
  3 kalabilir, ama VARSAYIM listesine gerekçesiyle girmeli.

**E1.2 · orta · §A.2: "şık" tasarımın tarifi yok**
- Sorun: Kart iki satırla anlatılıyor ("Bana hatırlat" + "Her gün, senin için uygun saatte"). Görsel dil, yer, ikon,
  kurulu hâldeki hap, dokunma geri bildirimi, iki tema ve 320 pt hiç tarif edilmiyor. "Şık" sözü tasarım Artifact'ine
  devredilmiş, ama planın hangi ölçütle "şık" diyeceği belirsiz. Yoga ve Y1'deki "üç ayrı tasarım yönü, beş bağımsız
  değerlendirici" yöntemi (SAHIP_ISTEKLERI, 2026-09-30) burada anılmıyor.
- Düzeltme: §A.2'ye bir tasarım tarifi eklenmeli. Kart bitiş özetinin **altında** durur, özeti itmez. Tek satırlık
  yüzey: solda saat simgesi, "Bana hatırlat", sağda Nef'in önerdiği saat soluk yazıyla ("08.45"). Dokununca yaprak açılır.
  Kurulunca kart küçülüp hapa döner ("Hatırlatma açık · 08.45"), onay titreşimi (Haptics) verir. İki tema ve 320 pt'de
  çizilir. §6 kapısına şu satır eklenmeli: "B1 kartı ve saat yaprağı için üç tasarım yönü; beş değerlendiricinin en az
  üçü 'şık' der."

**E1.3 · yüksek · §A.6, karar 3, §6: Nef'in "en zeki" olması**
- Sorun: Sahibin sözü "Nef ucuz model; istem ve veriyle zeki hâle getirilecek". Plan bunu yalnız bildirim bankası için
  çözüyor. Ekrandaki Nef yorumları (hava sayfasındaki yorum, yürüyüş bitişindeki tek cümle) da bankadan geliyor.
  Canlı Nef'in istemi (`coachCore.js`) ve ona giden veri (`coach.js`) için hiçbir iyileştirme yok. "Zekâ" ölçülmüyor:
  §6'daki kör değerlendirme yalnız hata sayısını ve dil puanını tutuyor. Hangi "zeki cümle türleri"nin var olduğu
  (`nef-bildirim.md` §3.4) plana taşınmamış.
- Düzeltme: §A.6'ya "Zeki cümle türleri" tablosu eklenmeli; her birine bir örnek yazılmalı. Türler: kendi dünüyle
  karşılaştırma, her zamanki saatini bilme, hava ile alışkanlığı birleştirme ("Salı akşamları yürüyorsun; bu akşam 21.00'de
  yağmur var, 20.00'de çıkarsan kuru kalırsın"), seriyi korumaya davet, ay ve takvim anı, ara sonrası dönüş. §6 metin
  kapısına şu ölçüt eklenmeli: "Kör değerlendirmede her cümleye iki soru daha sorulur: 'Bunu bir insan koç mu yazdı, bir
  uygulama mı?' ve 'Bu bildirimi açardın mı? (1–5)'. Geçme koşulu: ortanca en az 4." Karar 3'ün metni sahibin sözünü
  anmalı: "Ucuz modeli istemle zeki yapma isteğin bankayı üretirken uygulanır. Canlı Nef'in istemi ayrı bir işte
  (Y6 ile) iyileştirilir." Y6'yla bağ kurulmalı.

**E1.4 · yüksek · §1 "Kendi karar verdiklerim", §A.6: bilim satırı günde bir**
- Sorun: Sahip "bütün bildirimlerde Nef etkisi; her bildirim PubMed'e dayanır, altında bilimsel yazı ve makale
  bağlantısı" dedi. Plan bunu "günde en çok bir bildirim" diye kısıtlıyor ve soru olarak sormuyor. Notlar bu noktayı
  açıkça sahibin kararı sayıyordu (`nef-bildirim.md` §10.8 soru 8). "Makale bağlantısı" için bildirim eylem düğmesi
  seçeneği de not edilmişti ("Kaynağı gör"); plan onu değerlendirmiyor. Bu tür düğme uygulamayı açtığı için arka plan
  güvenilirliği sorunu yaşamaz.
- Düzeltme: İki yol var. (a) Her bildirim bir **kaynak kimliği** taşır ve dokununca bilim kartı açılır. Görünen bilim
  **satırı** günde birdir. Böylece sahibin "her bildirim PubMed'e dayanır" sözü tam karşılanır, tekrar yorgunluğu da
  önlenir. (b) Soru karar 3'ün içine alınır (bkz. E6.2). Her iki yolda da "Kaynağı gör" eylem düğmesi (ön plana açan
  `UNNotificationAction`) cihaz listesine eklenmeli.

**E1.5 · orta · §B.2: "İzmir Gaziemir 23°"**
- Sorun: Sahibin örneğinde il de var; planın satırı "Gaziemir · 23° · 21.00'de yağmur" diyor ve ili düşürüyor. Bu
  seçimin gerekçesi yazılmamış. Uzun ilçe adları sınanmamış: Mustafakemalpaşa (16 harf), Kahramankazan, Küçükçekmece.
- Düzeltme: Satır 390 pt'de "İzmir Gaziemir · 23° · 21.00'de yağmur" olmalı. Dar ekranda sıra şöyle düşer: önce üçüncü
  parça, sonra il adı; ilçe adı kısalmaz. §6'da 320 pt denemesi en uzun ilçe adıyla ve en büyük yazı boyutuyla yapılır.

**E1.6 · yüksek · §C.1, §A.4: akşam yürüyüşü**
- Sorun: Yürüyüş sorusuna "gece kuralı geçerli" deniyor. Soru hareket türü sayılırsa 21.00'den sonra hiç gelmez. Sahibin
  asıl senaryosu ("Son 15 dakikada 1 km yürüdün, hava 23 derece") yaz akşamlarında en sık 21.00'den sonra yaşanır; planın
  kendi hava örneği de akşam yürüyüşünden söz ediyor. Sahibin "21'den sonra kalk mantıksız" kuralı kişiyi harekete
  **çağıran** bildirim içindir; yürüyüş sorusu zaten yürüyen kişiye cevaptır.
- Düzeltme: §A.4'e üçüncü bir pencere eklenmeli, **'companion'**: 08.00–23.00. Yalnız kişi o anda yürüyorsa kullanılır.
  01.00–06.00 arasında hiçbir koşulda gelmez (VARSAYIM). Metin "Kalk" demez. `walkDetect.test.js`'e "22.10'da yürüyen
  kişiye soru gider; 21.30'da oturan kişiye yürüyüş hatırlatması gitmez" testi eklenmeli.

**E1.7 · orta · §A.5: "Bildirimler'de görülür, açılır, kapanır"**
- Sorun: Liste her bildirimi içermiyor. Deney türleri ve Çalışma günleri "Hatırlatmalar ekranına götürür" diye listede
  açılıp kapanmıyor. "Mola bitti" (7301), deneme raporu (7302), alarm ve alarm yedeği listede yok. Nefes hem "Modüllerin"
  hem "Günlük düzen" altında iki kez görünebilir; bunun kuralı yazılmamış.
- Düzeltme: "Bildirimler'deki liste telefonun kurabildiği **her** bildirim kaynağını bir kez gösterir. Deney türleri
  'Modüllerin' altında kendi modülüyle durur ve orada açılıp kapanır. Değiştirilemeyenler (Alarm → Profil'deki Alarm,
  deneme raporu) gri bir satırla ve nedeniyle görünür." Aynı satırın iki bölümde görünmemesi için test yazılmalı.

**E1.8 · düşük · §1 "Sahibin isteği": özet ile kelimesi kelimesine arasında fark**
- Sorun: SAHIP_ISTEKLERI.md'de 2026-09-30 bildirim, hava ve yürüyüş isteği kelimesi kelimesine yok. Plan yalnız özet
  veriyor. Özet "5 saniyede etkileme" ve "mükemmel olmayan önerilmez" sözlerini, bir de "İzmir"i atlıyor. §2'deki
  "Sahip (2026-09-30): 'gerek yok, böyle bir bölüm yok…'" alıntısının kaynağı gösterilmiyor. Bu alıntı onaylı S0 karar
  10'u ve App Review yedeğini kaldırıyor.
- Düzeltme: İstek kelimesi kelimesine SAHIP_ISTEKLERI.md'ye bir bölüm olarak eklenmeli (ana oturumun işi). Plan o bölümü
  anmalı; "gerek yok" alıntısı tarihiyle o bölümde durmalı.

**E1.9 · düşük · §C.3: "o anki hız"**
- Sorun: Anonsta hangi tempo söyleniyor, belli değil: ekrandaki 30 saniyelik yumuşatılmış anlık tempo mu, son 250 m'nin
  ortalaması mı? Adım sayarının `currentPace` değeri kısa pencerede oynaktır.
- Düzeltme: "Anons son 250 metrenin ortalama temposunu söyler ('Son 250 metre: kilometre başına 9 dakika 40 saniye');
  1 km'de ayrıca o kilometrenin süresini söyler ('1. kilometre 9 dakika 52 saniyede')." Sahibin "özellikle 1 km kaç
  dakika" sözü böylece doğrudan karşılanır.

---

## 2. Kullanıcı deneyimi boşlukları

**E2.1 · yüksek · §A.2, §A.3: sonsuz yolla uyum**
- Sorun: Modüllerin çoğu yol içinde art arda yapılır. (1) Her durağın bitişinde "Bana hatırlat" kartı çıkarsa bir yol
  gününde 6–8 kez görünür. (2) "Sen karar ver" her modülün saatini ayrı hesaplar; hepsi aynı 30 dakikaya düşer, sonra
  "başka bildirimlerden 60 dk uzak" kuralı onları saatlere dağıtır. Sonuç, yolu tek oturumda yapan kişiyi günde birçok kez
  çağıran bir diziye dönüşür. Sahip "sonsuz yol mimarisine uygun" dedi; mimaride birim **yol**dur.
- Düzeltme: §A.1'e bir kural eklenmeli. "Yol içinde açılan modülde kart çıkmaz. Yolun son ekranında tek kart çıkar:
  'Yolunu hatırlatayım mı?' (`route: 'home'`). Tek başına açılan modülde modülün kendi kartı çıkar. 'Sen karar ver', yol
  duraklarının saatini yol hatırlatmasına sayar ve aynı modüle ayrı saat önermez." Test: "Yolu her gün 08.30'da yapan
  kişide 'Sen karar ver' tek bildirim kurar."

**E2.2 · orta · §A.2: izin reddi ve "açık" hapının doğruluğu**
- Sorun: Kişi bildirimi sonradan iOS Ayarlar'dan kapatırsa modüldeki hap yine "Hatırlatma açık · 08.45" der, yani yalan
  söyler. İlk kurulum anı tarif edilmemiş. Ana sayfadaki mevcut "Günde bir mola hatırlatması ister misin?" kartı, "Bana
  hatırlat", hava teklifi, `walk` rızası ve "Yürürken beni fark et" ilk günlerde üst üste gelebilir.
- Düzeltme: (1) Hap her açılışta izin durumunu okur. İzin kapalıysa "Hatırlatma kurulu, ama bildirimler kapalı · Ayarları
  aç" der. (2) "Ana sayfada günde en çok bir teklif (bildirim, hava, yürüyüş) çıkar; sıra: bildirim izni → hava → yürüyüş.
  Reddedilen teklif 30 gün sorulmaz." (3) İzin istenmeden önceki ilk açıklama cümlesi ekran taslağında yazılı olmalı.

**E2.3 · orta · §A.4: çok modülde hatırlatma, günlük tavan**
- Sorun: 10 modülde 3'er saat 30 bildirim eder. 30 dk kuralıyla 08–22 arası 28 dilime sığar, birleştirme de "üst üste
  binmemeyi" sağlar. Ama günlük üst sınır yok ve onaylı plandaki Wilson uyarısı (üçüncü tür açılırken) ile seyreltme
  sorusu (3 gün dokunulmazsa "Gün aşırı?") modül hatırlatmalarına uygulanmıyor.
- Düzeltme: "Gün başına en çok 6 modül bildirimi (VARSAYIM). Fazlası birleşir: 'Nefes, göz ve yoga hazır.' Dördüncü
  modülde Wilson notu çıkar. Seyreltme kuralı her modül hatırlatmasına uygulanır." Birleşik bildirime dokununca ne açılır,
  bilim satırı hangisi olur, yazılmalı: dokununca en erken kurulan modül açılır, bilim satırı birleşik bildirimde olmaz.

**E2.4 · orta · §A.4: "üst üste binmez"in ikinci anlamı**
- Sorun: Sahibin "asla üst üste binmez" sözü Bildirim Merkezi'nde **yığılmayı** da anlatıyor olabilir. Plan tür başına
  `threadIdentifier` ekliyor; iOS her türü ayrı yığın yapar. Dünün okunmamış hatırlatmaları yığında kalır.
- Düzeltme: "Aynı modülün yeni bildirimi gelince ya da uygulama açılınca o modülün teslim edilmiş eski bildirimleri
  kaldırılır (`removeDeliveredNotifications`). Bütün Nefona bildirimleri tek `threadIdentifier` ('nefona') altında
  toplanır." Cihaz listesine "Bildirim Merkezi'nde en çok bir Nefona yığını" eklenmeli.

**E2.5 · orta · §A.4, §A.3: saat dilimi ve yaz saati**
- Sorun: Türkiye yaz saati uygulamıyor, ama kullanıcı yurt dışına gidebilir, yurt dışında yaşayan kullanıcı da olabilir.
  "Sen karar ver" kayıtların ISO saatiyle çalışıyor. Hangi saat diliminde dilimlendiği, seyahatten sonra ne olduğu ve
  alarm + 10 dk'nın saat dilimi değişince nasıl davrandığı yazılmamış. Onaylı planın testinde "yaz saati geçişi doğru
  işler" vardı; yeni test listesinde yok.
- Düzeltme: "Dilimleme kaydın **kendi yerel saatiyle** yapılır (kayıt anındaki saat dilimi farkı kayda yazılır). Saat
  dilimi değişince plan yeniden kurulur ve saatler yeni yerel saatte korunur." `moduleRemind.test.js` ve
  `notifyAll.test.js`'e Avrupa yaz saati geçiş günü ile İstanbul → Berlin seyahati eklenmeli.

**E2.6 · yüksek · §C.2: yürüyüşte uygulamanın kapatılması, çökme**
- Sorun: Kişi yürürken uygulamayı kaydırıp kapatırsa konum oturumu biter. "Kullanırken" izni uygulamayı yeniden açmaz
  (`apple-yuruyus.md` §3.2). Yürüyüş kaydı ve sesli koç kaybolur, kişi bunu bilmez.
- Düzeltme: "Yürüyüş durumu (başlangıç anı, duraklatmalar) her 30 sn diske yazılır. Uygulama yeniden açılınca yarım
  yürüyüş bulunursa `CMPedometer` geçmişinden o aralığın adımı ve mesafesi okunur ve şu sorulur: 'Yürüyüşün yarıda kaldı
  (18 dk, 1,9 km). Kaydedeyim mi?' [Kaydet] [Sil]." Cihaz listesine "yürürken uygulamayı kapat" maddesi eklenmeli.

**E2.7 · orta · §C.3: kulaklıksız sesli koç**
- Sorun: `.playback` kategorisi sessiz tuşuna uymaz. Kulaklık yoksa anons sokakta, toplu taşımada ya da camide
  hoparlörden çalar. Plan yalnız kulaklık ses düzeyini söylüyor.
- Düzeltme: "Çıkış telefonun hoparlörüyse anons yalnız 'Hoparlörden de söyle' açıkken çalar (varsayılan kapalı); kapalıysa
  altyazı ve kısa titreşim verilir. Kulaklık çıkarılınca (rota değişimi) anons susar, ekranda 'Kulaklık çıktı; anonsları
  durdurdum' yazar." Cihaz listesine hoparlör, AirPods ve araba Bluetooth'u eklenmeli.

**E2.8 · orta · §C.3, §6: yürürken telefon görüşmesi, başka sesler**
- Sorun: Görüşme ya da Siri kesintisi, navigasyon sesi ve başka bir egzersiz uygulamasıyla çakışma tarif edilmemiş. Notlar
  (`apple-yuruyus.md` §6.4) görüşme kesintisini cihazda denenecekler arasında sayıyor; planın cihaz listesinde yok.
- Düzeltme: "Kesinti süresince anons yapılmaz, kaçan anons sonradan okunmaz. Kesinti bitince sıradaki 250 m'de sürer.
  Ölçüm kesintiden etkilenmez." Cihaz listesine B3 için: gelen arama, WhatsApp araması, Apple Haritalar yol tarifi
  sesiyle birlikte yürüyüş.

**E2.9 · orta · §A.5, §A.4: gece sessizliği değiştirilemez**
- Sorun: "Gece sessizliği (bilgi satırı, değiştirilemez)". Vardiyalı çalışan ve gece çalışan kişi 09–21 penceresi
  yüzünden hatırlatmaları uyanık olmadığı saatte alır. Ramazan'da sahur ve iftar düzeni de değişir.
- Düzeltme: "Gece sessizliğinin başlangıcı 21.00–24.00, bitişi 06.00–10.00 arasında değiştirilebilir. 'Kalk' ve hareket
  bildirimleri her durumda sessizlik başlamadan en az 1 saat önce biter; 01.00–04.00 hiçbir ayarla açılmaz." Böylece
  sahibin iki kuralı korunur.

**E2.10 · orta · §C.1, §6: iPhone + Apple Watch**
- Sorun: Yerel bildirimler telefon kilitliyken saate yansır. Yürüyüş sorusuna saatten dokunan kişide (uygulamanın saat
  sürümü yok) hiçbir şey olmaz. Kişi Watch'ta zaten Dış Mekân Yürüyüşü antrenmanı yapıyorsa "Eşlik edeyim mi?" sorusu
  gereksizdir.
- Düzeltme: "Son 15 dakikada Apple Sağlık'a yazılmış bir antrenman ya da süren bir yürüyüş kaydı varsa soru sorulmaz
  (VARSAYIM: yalnız Watch eşitlediyse görülür)." Metin saat yüzeyine uygun olmalı: "iPhone'da aç" bilgisi. Cihaz
  listesine "Watch takılıyken soruya saatten dokunma" eklenmeli.

**E2.11 · düşük · §C.2, §B.4: düşük pil ve Düşük Güç Modu**
- Sorun: Pil yalnız ölçülüyor. Düşük Güç Modu'nda ve %10 pilde ne olacağı yazılmamış. Duraklatılmış yürüyüşte konum açık
  kalırsa mavi gösterge ve pil tüketimi sürer, bu da App Review 2.5.4 açısından risklidir.
- Düzeltme: "Duraklatınca konum oturumu durur. 20 dk hareketsizlikte 'Yürüyüşü bitireyim mi?' bildirimi gelir; 40 dk'da
  yürüyüş kendiliğinden biter (VARSAYIM). Düşük Güç Modu'nda konum doğruluğu 'yakın on metre'ye iner ve ekranda tek satır
  yazar." Cihaz listesine Düşük Güç Modu'nda 30 dk yürüyüş eklenmeli.

**E2.12 · düşük · genel: uygulamanın silinip yeniden kurulması**
- Sorun: Silmede iOS bekleyen bildirimleri ve `UserDefaults`'u siler; bildirim izni ve konum izni yeniden sorulur, Apple
  Sağlık izni kalır. `settings.moduleReminders` bulutla eşitlenmiyor. Kişi yeniden kurunca hatırlatmalarının gittiğini
  fark etmez.
- Düzeltme: §A.5'e tek satır: "Yeniden kurulumda hatırlatmalar sıfırdan başlar. Eski kayıtlar varsa 'Sen karar ver'
  aynı saati yeniden bulur." İleride hesaba kaydetme ayrı bir rıza işidir (profileSync kapsamında değil).

**E2.13 · orta · §A.5: 320 pt'de gün çizelgesi**
- Sorun: 08–22 arası 14 saat, 320 pt'de ≈ 288 pt genişliğe sığıyor; saat başına ≈ 20 pt, 30 dakikaya ≈ 10 pt düşüyor.
  Simgeli noktalar (en az 20 pt) 30 dk arayla **görsel olarak** üst üste biner. "Kişi ilk bakışta hiçbir şeyin üst üste
  binmediğini görür" vaadi dar ekranda tam tersini gösterir.
- Düzeltme: "Çizelgede nokta simgesiz ve 8 pt'dir; 60 dk'dan yakın noktalar tek noktada birleşir ve üstünde sayı yazar
  ('2'). Dokununca liste açılır." 320 pt ve en büyük yazı boyutu tasarım Artifact'inde çizilmeli.

**E2.14 · orta · §A.4, B3: erişilebilirlik**
- Sorun: Planda VoiceOver ve Dynamic Type hiç geçmiyor. Yürüyüş ekranındaki dört büyük sayı, çizelge ve saat seçici
  erişilebilirlik etiketi ister. VoiceOver açıkken sesli koçun anonsu ile VoiceOver'ın konuşması çakışır.
- Düzeltme: §6 cihaz listesine VoiceOver ve en büyük yazı boyutu eklenmeli. §C.3'e şu kural: "VoiceOver açıksa anons
  VoiceOver'ın duyurusuyla gönderilir (`UIAccessibility.post(.announcement)`), parçalı ses çalmaz."

**E2.15 · düşük · §A.3: yanlış söz**
- Sorun: "Bir hafta sonra senin saatine göre ayarlarım" deniyor, ama eşik "28 günde 5 farklı gün kayıt". Haftada bir
  yapan kişi için bu söz tutmaz.
- Düzeltme: "Beş kez yaptıktan sonra senin saatine göre ayarlarım."

**E2.16 · orta · §B.4: alarm ertelemesi ve alarmsız günler**
- Sorun: Alarm üç kez ertelenirse "alarmdan 10 dk sonra" bildirimi kişi yataktayken gelir. Alarm yalnız hafta içi
  kuruluysa hafta sonunda ne olduğu yazılmamış.
- Düzeltme: "Ertelemede 1. katmanın bildirimi her ertelemede 10 dk ileri alınır (iOS 26 ve AlarmKit'te erteleme niyeti
  varsa). Alarmın olmadığı günde bildirim, kişinin seçtiği 'alarmsız gün saatine' kurulur; o saat seçilmemişse o gün
  bildirim gitmez."

**E2.17 · düşük · §C.2: yürüyüş ekranının açık teması**
- Sorun: "Siyah zemin (açık temada da koyu değil, açık zemin çizilir)" cümlesi kendisiyle çelişiyor. ANA_BELGE her ekranın
  iki temada kusursuz olmasını istiyor.
- Düzeltme: Cümle netleşmeli: "Koyu temada siyah zemin, açık temada açık zemin; iki temada sayılar aynı düzende."

---

## 3. Mevcut sistemi bozma riskleri

**E3.1 · yüksek · §C.1, §B.4, §2: yürüyüş deneyinin kontrol günleri**
- Sorun: Onaylı deneyde yürüyüş hatırlatması uygun günlerin %25'inde bilerek gönderilmez ve ölçü günlük adımdır
  (`BILDIRIM_PLANI.md` §6). Nef'in yürüyüş sorusu ve sabah havasındaki "Akşam yürüyüşü için güzel bir gün" cümlesi
  birer yürüyüş çağrısıdır ve sessiz günlerde de gider. Kontrol kolu kirlenir; kişinin Gelişim'deki "hatırlatma işine
  yaradı mı" kartı yanlış sonuç verir. Sahibin kararı 3 ("ölçme: evet") dolaylı olarak bozulur.
- Düzeltme: §2 tablosuna yeni satır. "Yürüyüş türünün sessiz gününde (a) yürüyüş sorusu gönderilmez ya da (b) gönderilir
  ve günlüğe `companionAsked: true` yazılır, o gün karşılaştırmadan çıkar." Hava bildiriminde yürüyüş önerisi sessiz günde
  kurulmaz; o gün yalnız havanın kendisi yazılır. Hangisi seçilirse `notifyLog.test.js`'e eklenmeli. (a) daha temizdir
  ve öneri odur.

**E3.2 · yüksek · §A.1, §2 "Bildirim deneyi": deney türlerinde çok saat**
- Sorun: Plan deney türlerinde birden çok saate izin veriyor ve zarı hepsine birlikte uyguluyor. Onaylı plan "her türden
  günde en çok 1 bildirim" diyor (§1, §3). Kimlik şeması `7400 + gün×10 + tür` gün başına tür başına tek kimlik taşıyor.
  Günlük (`notify-log`) gün ve tür başına tek `plannedAt` ve tek `tapped` tutuyor. `notifyPlan.js` ve `reminders.js`'e
  dokunulmayacağı için ek saatler 78xx'ten kurulacak; zar, "yaptıysan gönderme", 60 dk kuralı ve günlük `moduleRemind.js`
  içinde **ikinci kez** yazılacak. İki kopya ayrışır. Kod haritası (Sonuç 8) açıkça "Bu türlerde v1'de tek saat" diyordu.
- Düzeltme: `legacy` olan modülde `maxTimes` 1'e sabitlenmeli (doğrulama kuralı: "`legacy` varsa `maxTimes` 1"). Saat
  yazılırken `normalizeReminders`'ın 60 dk ve 09–21 kurallarına uyduğu testle gösterilmeli. Deney türünde birden çok saat
  istenirse bu bir sahip kararıdır (deneyin dozu değişir), plan bunu kendisi açamaz.

**E3.3 · yüksek · §C.2 "Kayıt": yürüyüş kaydı Nef'e ve seriye sızar**
- Sorun: `{ type: 'walk', … }` kaydı `store.sessions`'a yazılıyor. `lib/coach.js` `buildSignals`, `activitiesFrom(tests,
  sessions)` üzerinden `daysActive7`, `minutes7`, `streakDays` ve `thisWeekDays` hesaplıyor ve bunları Nef'e gönderiyor.
  60 dakikalık bir yürüyüş "göz çalışması dakikası"nı ve seriyi şişirir. Hareket verisi (`health` rızası: "Sunucuya ve
  Nef'e gitmez") `coach` rızasıyla sunucuya gider. Onaylı Nef paketi v2 değişir. Onaylı bildirim planı mola ve su
  kayıtlarını tam bu nedenle `sessions` dışında tutmuştu (§7 "Kayıt yeri").
- Düzeltme: Bir kural yazılmalı: "`walk` kaydı `countedActivities`, `buildSignals` ve Ana sayfadaki 'N dk göz çalışması'
  sayısına girmez; `yuruyus` manifestinde `coach()` yoktur. Yürüyüşün seriye sayılıp sayılmayacağı ayrı bir karardır
  (öneri: sayılmaz, Gelişim'de Beden alanında görünür)." Test: "`walk` kayıtları eklenince `buildSignals` çıktısı derin
  eşit kalır." Aynı kural yoga kaydı için nasıl çözüldüyse ona bağlanmalı.

**E3.4 · yüksek · §5.2, §A.4: tek dokunma dinleyicisi ve Swift'in kurduğu bildirimler**
- Sorun: Onaylı plan, uygulama kapalıyken dokunuşun yalnız ilk dinleyiciye gittiğini ve bu yüzden tek `onNotifyTap`
  bulunduğunu yazıyor. Yürüyüş sorusu Swift'te "kendi dize kimliğiyle" kuruluyor; 7700 de `stopIntent` içinde Swift'te
  yeniden kuruluyor. Capacitor LocalNotifications eklentisinin, kendi kurmadığı ve kimliği sayı olmayan bir bildirimin
  dokunuşunu `localNotificationActionPerformed`'a nasıl ilettiği plana ve notlara bakılarak doğrulanmamış (bakmadım;
  risk). Dokunuş kaybolursa sahibin "dokununca Apple Watch gibi ekran" isteği kapalı uygulamada çalışmaz.
- Düzeltme: §5.2'ye şu madde: "Swift'in kurduğu bildirimler de sayısal kimlik aralığı (7710–7719 yürüyüş sorusu) ve
  Capacitor'ın beklediği `extra` biçimiyle kurulur; dağıtım `onNotifyTap`'ta yapılır." Cihaz listesine "uygulama
  **kapalıyken** yürüyüş sorusuna ve Swift'in yenilediği sabah havasına dokununca doğru ekran" eklenmeli.

**E3.5 · orta · §5.4, §A.4: eşdeğerlik ile gece kuralı çelişiyor**
- Sorun: Gece kuralı "her kaynağa" uygulanacak (Çalışma günleri, oturum, 7302 dâhil), ama `notifyPlan.js`'e dokunulmuyor.
  Kural `planAll`'da uygulanırsa "yeni özellik kapalıyken `planAll` ≡ `planNotifications`" eşitliği Çalışma günleri
  23.00'e kuruluysa bozulur. Taban çizgisi "ana oturumun gece düzeltmesi"; o düzeltmenin (2) ve (3)'ü kapsayıp
  kapsamadığı bilinmiyor.
- Düzeltme: §5.4 şöyle yazılmalı: "Eşdeğerlik, gece kuralı **dışındaki** her alanda derin eşittir. Gece kuralının
  değiştirdiği her bildirim ayrı bir listede beklenen farktır ve testte tek tek adlandırılır." Ya da gece kuralının
  tamamı ana oturumun `notifyPlan` düzeltmesine bırakılır; bu durumda planın "B1 kalıcı çözümdür" cümlesi düzeltilmeli.

**E3.6 · orta · §A.3, §A.4, §B.4: kendi içindeki çelişkiler**
- Sorun: (1) Sabah havasının alarmsız varsayılanı 07.30; gece kuralı 22.00–08.00'de yalnız "alarma bağlı" havaya izin
  veriyor ve test de bunu sınıyor. (2) "Sen karar ver" başka bildirimlerden 60 dk uzak, çakışma kuralı 30 dk. (3) Nefes
  'calm' penceresi (08–22) ile deney türü penceresi (`notifyPlan.js` 09–21) çelişiyor: nefes için 08.30 seçilirse
  `notifyPlan` onu sessizce kurmaz. (4) Saat seçicinin altındaki "Gece 22.00–08.00 arası bildirim göndermiyoruz" cümlesi
  'move' modüllerde yanlış (onlarda 21.00–09.00).
- Düzeltme: (1) Varsayılan 08.00 olmalı ya da "kişinin kendi seçtiği sabah havası saati" istisnaya yazılmalı.
  (2) Tek sayı: 30 dk. (3) Deney türleri kendi penceresini (09–21) kullanır; `remind.window` `legacy` varsa yok sayılır.
  (4) Seçici metni pencereden üretilir: "Bu hatırlatmayı 09.00–21.00 arasında gönderiyoruz."

**E3.7 · orta · §A.4 madde 4: deney türünün düşürülmesi**
- Sorun: "Kişinin başlattığı anın 30 dakika çevresine düşen hatırlatma … o gün gönderilmez." Deney türüne uygulanırsa
  günlükte karşılığı yok (`skipReason` yalnız `focus|window|noData|doneBefore`); ölçüm yanlı olur. Onaylı "çalışma oturumu
  sürerken diğer türler gelmez" kuralı modül hatırlatmalarına uygulanıyor mu, yazılmamış.
- Düzeltme: "Deney türü yalnız onaylı nedenlerle düşer. Alarm, 7301 ya da oturum yüzünden düşerse `skipReason: 'focus'`
  yazılır ve karşılaştırmadan çıkar. Çalışma oturumu sürerken modül hatırlatmaları da gelmez."

**E3.8 · orta · §A.3, §C.2: veri merkezi ilkesi (`dataHub.js`)**
- Sorun: ANA_BELGE: "Bütün veri tek kapıdan okunur; … kendi ayrı hesabını kurmaz." `pickAutoTime` doğrudan `sessions` ve
  habit-log okuyor. Yürüyüş bitişindeki "Dünkünden 4 dakika uzun" karşılaştırması ve Profil → Bildirimler özeti de kendi
  hesabını kuruyor gibi görünüyor. `dataHub.test.js` "değişmeden yeşil" sayılmış; oysa yeni `yuruyus` modülü merkeze
  ulaşmazsa bu test **kırılmalı** (ilke budur).
- Düzeltme: "`pickAutoTime` ve yürüyüş karşılaştırmaları `dataHub`'dan okur (gerekirse merkeze `activityTimes(moduleId)`
  eklenir)." §5.3'teki "bilerek değişen beklentiler" listesine `dataHub.test.js`'in `yuruyus`'u kapsaması eklenmeli.

**E3.9 · orta · §C.2: Gelişim'de tempo "iyi" sayılıyor**
- Sorun: `metrics`: ortalama tempo, better 'down'. Y2'nin yeni kuralı daha hızlı yürüyüşe "başlangıcından iyi" der. Plan
  sesli koç için "dk/km için bilimsel şiddet eşiği yok; 'yavaşsın/hızlısın' demez" diyor; Gelişim ise tam bunu söylemiş
  olur.
- Düzeltme: Tempo `metrics`'te yön taşımaz (betimleyici). Gelişim'deki yürüyüş ölçüsü haftalık yürüyüş dakikası ve
  günlük adım olur (Tudor-Locke'un adım/dk dayanağıyla, iddiasız).

**E3.10 · orta · §A.1: legacy saatin iki yerden değişmesi**
- Sorun: Nefes saati hem "Bana hatırlat"tan hem Hatırlatmalar ekranından değişebilir. "Sen karar ver" saati 7 günde bir
  kendiliğinden değişirse deney türünün saati kayar. Oysa §A.4 (3) "Deney türünün saati kaydırılmaz" diyor.
- Düzeltme: "Deney türünde 'Sen karar ver' saati yalnız kişi onaylarsa değişir: 'Nefesi son iki haftada 09.15'te
  yapıyorsun. Hatırlatmayı oraya alayım mı?'" Hatırlatmalar ekranında o satırda "Nef seçti" etiketi görünmeli.

**E3.11 · düşük · §A.1, yoga: Uykuya Geçiş ve yatma öncesi kural**
- Sorun: Yoga 'calm' penceresi 22.00'ye kadar, Uykuya Geçiş dersi için akşam saati serbest. Ama "yatmadan önceki 60
  dakikada bildirim yok" kuralı, doğası gereği yatma saatinde yapılan bu dersin hatırlatmasını düşürür.
- Düzeltme: İstisna yazılmalı: "Uykuya Geçiş hatırlatması yatma saatinden en çok 30 dk önce gelebilir." Ya da ders
  hatırlatılmaz; sahibin yoga kararlarıyla karşılaştırılmalı.

**E3.12 · orta · §4 "Tüm verileri sil" ve rızanın geri çekilmesi**
- Sorun: Liste eksik: bekleyen 77xx ve 78xx bildirimleri, Swift'in kurduğu yürüyüş sorusu, AlarmKit "yerelde yenilendi"
  işareti, yarım yürüyüş durumu, **önemli yer değişikliği izlemesi** (`startMonitoringSignificantLocationChanges`
  durdurulmazsa uygulama kapalıyken bile yeniden açılmaya devam eder). `walk` ya da `walkDetect` rızası geri çekilince ne
  olduğu yazılmamış.
- Düzeltme: §4'e şu madde: "Rıza geri çekilince ya da 'Tüm verileri sil'de: önemli yer değişikliği izlemesi durur, yürüyüş
  sorusu iptal edilir, WalkGuard'ın yürüyüş kontrolü kapanır, `walk` kayıtları (kişiye sorularak) silinir." Test:
  "`walkDetect` kapanınca yerel eklentiye `stopMonitoring` çağrısı gider."

**E3.13 · düşük · §2, §7: bugünkü bildirim sistemi cihazda hiç denenmedi**
- Sorun: B1, v2 bildirim sisteminin (`8bccf79`) üstüne kuruluyor. `YAPILACAKLAR.md` §0b'ye göre v2 cihazda denenmedi
  (kapalı uygulamada teslim, dokunma, iptal).
- Düzeltme: §7'de B1'in ön koşulu olarak yazılmalı: "v2 cihaz listesi (§0b) B1 kodundan önce geçer." Yoksa B1'in hatası
  v2'nin hatasından ayrılamaz.

---

## 4. KVKK ve App Store

**E4.1 · yüksek · §4 tablo: `health` rızasının kapsamı**
- Sorun: Apple Sağlık artık (a) yürüyüş sorusu için saatlik arka plan uyanışında, (b) yürüyüş kaydına adım yazmak için
  okunuyor. `health` v2'nin "Neden" satırı bu amaçları saymıyor. Onaylı plan amaç eklenince sürüm yükseltiyordu (health
  v1 → v2, `healthUpdate`).
- Düzeltme: `health` v3: "Neden" satırına "yürürken sana eşlik etmek için son 15 dakikanın adımına bakmak" ve "yürüyüş
  kaydına Apple Sağlık'taki adım sayısını yazmak" eklenir. `healthUpdate` kalıbıyla yeniden sorulur; "Şimdi değil"
  diyene yürüyüş sorusu gelmez, adımlar yine görünür. Ya da bu iki amaç `walk` rızasının metnine yazılır ve `walk`
  olmadan Sağlık bu amaçla okunmaz. Hangisi seçilirse hukukçu sorusuna eklenmeli.

**E4.2 · orta · §4: rıza metinleri taslak değil**
- Sorun: `walk` ve `walkDetect` için Ne / Neden / Nerede / Ne kadar satırları ve onay kutusu cümlesi yazılmamış; yalnız
  Info.plist metinleri var. Metin kapısına girecek bir şey yok.
- Düzeltme: §4'e `lib/consent.js` kalıbında iki taslak yazılmalı. Örnek `walk` kutusu: "Yürüyüşlerimde adım, tempo ve
  mesafemin ölçülmesine ve yalnızca bu telefonda saklanmasına açık rıza veriyorum." `walkDetect`: "'Yürürken beni fark
  et' için telefonumun yer değiştirdiğinin (konumum saklanmadan) bu telefonda kullanılmasına açık rıza veriyorum."

**E4.3 · orta · §B.1: ilçe bilgisi ve profil eşitlemesi**
- Sorun: `profileSync` rızası "şehrin"i Supabase'e (Frankfurt) kaydediyor. İlçe profildeki şehir alanına yazılırsa sunucuya
  gider; plan "sunucumuza gitmez" diyor.
- Düzeltme: "İl ve ilçe hava ayarında (`settings.sky`) durur; profildeki şehir alanına yazılmaz ve eşitlenmez." Ya da
  `profileSync` metni ilçeyi kapsayacak biçimde güncellenir (sürüm artar).

**E4.4 · yüksek · §B.1, §C: konum iznini bekleten hukukçu yedeği yürüyüşe de uygulanmalı**
- Sorun: Onaylı yedek: "hukukçu adı gelmeden konum izni App Store'a gitmez". Plan bunu yalnız havaya uyguluyor. B3 konumu
  "Kullanırken" ve "Her Zaman" izniyle kullanıyor; `hukukcu-sorulari.md`'ye "Her Zaman" eklenecek ama B3'ün yayın
  koşulu yazılmamış.
- Düzeltme: §4'e: "Hukukçu cevabına kadar B3 konumsuz çıkar: mesafe ve tempo adım sayarından ('yaklaşık'), yürüyüş sorusu
  yalnız saatlik yoldan; 'Yürürken beni fark et' hukukçu cevabıyla açılır."

**E4.5 · yüksek · §4 Info.plist: kesin konum anahtarı eksik**
- Sorun: Hava için varsayılan yaklaşık konum isteniyor (`NSLocationDefaultAccuracyReduced`). Yürüyüşte GPS mesafesi kesin
  konum ister. Kişi yaklaşık konum verdiyse geçici kesin konum `requestTemporaryFullAccuracyAuthorization(withPurposeKey:)`
  ile istenmeli; bunun için `NSLocationTemporaryUsageDescriptionDictionary` gerekir. Listede yok. Olmazsa yürüyüşte
  mesafe 1–20 km bulanık konumdan hesaplanır ya da istek hata verir.
- Düzeltme: Info.plist listesine anahtar ve metin eklenmeli ("Yürüyüşünün mesafesini doğru ölçmek için, yalnız yürüyüş
  sırasında."). Yürüyüş başlarken yetki yaklaşıksa kesin konum istenir; ret gelirse mesafe adım sayarından ölçülür.
  Cihaz listesine "yaklaşık konum verilmiş telefonda yürüyüş" eklenmeli.

**E4.6 · orta · §4, §8: App Review riskleri (5.1.1, 5.1.5, 2.5.4)**
- Sorun: (a) Arka plan `location` kipi yalnız yürüyüş sırasında açık olmalı; duraklatmada ve bitişte kapanma kuralı yok
  (bkz. E2.11). (b) "Her Zaman" izni için App Review notu (inceleme notu metni ve demo adımları) yazılmamış. (c) iOS "Her
  Zaman" konum için belli aralıklarla "Nefona konumunu arka planda N kez kullandı" uyarısı gösterir; bu uyarıya karşı
  ürün içi açıklama yok. (d) Mevcut `NSHealthUpdateUsageDescription` Sağlık'a yazma izni ister, oysa plan "Nefona
  Apple Sağlık'a yazmaz" diyor; incelemede tutarsızlık sorulabilir.
- Düzeltme: §4'e "App Review notu" alt başlığı: "Konum yalnız kişinin başlattığı yürüyüş ekranında ve 'Yürürken beni fark
  et' açıkken kullanılır; ekran ve mavi gösterge görünür; konum saklanmaz." Demo adımları da yazılmalı.
  `NSHealthUpdateUsageDescription`'ın neden durduğu yazılmalı (kullanılmıyorsa kaldırılması ana oturuma not edilmeli).

**E4.7 · orta · §A.6: kilit ekranında adım ve mesafe**
- Sorun: Onaylı kural: "Kilit ekranında görünen metin nötrdür, adım bilgisi içermez." Plan yürüyüş sorusunda mesafeyi
  **varsayılan açık** gösteriyor ("kişi 'gösterme'yi seçebilir"). Hareket verisi özel nitelikli sağlık verisi sayılıyor.
  Sabah havası ilçe adını kilit ekranında gösteriyor (konum).
- Düzeltme: Ya bu, sahibin cümlesine dayanan bilinçli bir istisna olarak §2 tablosuna yazılır ("Onaylı kural: nötr kilit
  ekranı → bu plan: mesafe görünür, çünkü sahibin cümlesi bu"), ya da varsayılan "Önizlemeleri göster: kilit açıkken"
  (`hiddenPreviewsBodyPlaceholder`) kullanılır. Önerim ikincisi: kilit açılınca tam metin görünür.

**E4.8 · düşük · §4: gizlilik etiketi VARSAYIM'ı**
- Sorun: "Yerelde kalan veri 'toplanan' sayılmaz" VARSAYIM'ı doğru bir okumaya dayanıyor, ama WeatherKit'e giden koordinat
  için "Yaklaşık konum" etiketi zaten var. Kesin konumdan 2 ondalığa yuvarlanan koordinat (≈ 1,1 km) Apple'ın "Coarse"
  tanımına girse de etikette hangi kutunun işaretleneceği Mac'te doğrulanacak işler listesine yazılmamış.
- Düzeltme: §6 gizlilik kapısına "App Store Connect'te etiket ekran görüntüsü HATA_GUNLUGU'na" maddesi.

---

## 5. Test ve "bitti" tanımı

**E5.1 · yüksek · §6: ANA_BELGE "bitti" kuralı**
- Sorun: ANA_BELGE: "Ekranın her durumu iki temada görülür: boş veri, 1. gün, dolu, iyileşme, gerileme, dar ekran (320
  px), akışın her adımı." Plan bunu yalnız tasarım Artifact'i için "iki temada, 390 ve 320" diye anıyor. Ekran ekran
  durum listesi yok.
- Düzeltme: §6'ya bir durum çizelgesi eklenmeli; her satır iki temada ve 320 pt'de cihazda görülür. En az şu satırlar:
  - RemindField / saat yaprağı: veri yok, veri var, iki saat önerisi, çakışma uyarısı, pencere dışı, izin yok, izin
    reddedildi, deney türü, kurulu hap, izin sonradan kapatılmış hap.
  - Bildirimler: ana anahtar kapalı, hiç hatırlatma yok (1. gün), bir hatırlatma, on hatırlatma, gece sessizliği.
  - SkyLine: teklif, önbellek yok, önbellek eski, yağmurlu, yağmursuz, en uzun ilçe adı, iOS 15.
  - Hava sayfası: dört durum (§B.3) ve sabah havası açık / kapalı.
  - Yürüyüş ekranı: `walk` rızası yok, Hareket izni yok, konum yok, kesin konum yok, duraklatıldı, kilit ekranı,
    bitiş özeti ("Sağlık güncelleniyor" dâhil), yarım kalan yürüyüş.
  - Gelişim yürüyüş kartı: boş, 1. gün, dolu, iyileşme, gerileme.

**E5.2 · orta · §5.3: eksik testler**
- Eklenecekler:
  - `notifyTap.test.js`: 77xx, 78xx ve Swift'in kurduğu kimliklerin yönlendirmesi; soğuk açılışta tek dinleyici.
  - Yaz saati ve saat dilimi (E2.5).
  - `resetAll` testi: yeni anahtarların hepsi silinir, 7302 kalır, yerel eklentiye durdurma çağrısı gider (E3.12).
  - `coach.test.js`: `walk` kayıtları `buildSignals`'ı değiştirmez (E3.3).
  - JS ile Swift metin motoru eşliği: aynı veriyle aynı metin (sabah havası ve yürüyüş sorusu Swift'te kuruluyor; ek ve
    yer tutucu kuralları iki dilde yazılacak). Bunun için Swift'in kullandığı şablonlar JS'de **doldurulmuş hâlde**
    üretilip yazılmalı. Swift yalnız sayıyı yerleştirir ve ek seçmez; ya da her olası saat için ek JS'de önceden yazılır.
  - Göç testi: bugün nefes hatırlatması açık olan kullanıcının nefes modülünde "Hatırlatma açık" hapını görmesi.
  - Yol bağlamında "Sen karar ver"in tek bildirim kurması (E2.1).
  - Deney kirlenmesi: sessiz günde yürüyüş sorusu yok (E3.1).

**E5.3 · orta · §6 cihaz listesi: eksik durumlar**
- Eklenecekler: iOS 15 / 16 / 17 / 26 (yürüyüşte `CLBackgroundActivitySession` 17+); iPhone SE 1. nesil (320 pt);
  Uyku Odağı ve İş Odağı açıkken sabah havası ve hatırlatma; Planlı Özet (B2'de var, B1'de yok); gelen arama; kulaklık,
  hoparlör, araba; Watch'tan dokunma; uygulamayı yürürken kapatma; Düşük Güç Modu; yaklaşık konum verilmiş telefon;
  "Tüm verileri sil"den sonra hiçbir 77xx, 78xx ve yürüyüş bildiriminin kalmaması; `walkDetect` kapatılınca uygulamanın
  bir gün boyunca arka planda açılmaması; en büyük yazı boyutu; VoiceOver.

**E5.4 · düşük · §6 "bitti" tanımı eksik adımlar**
- Sorun: ANA_BELGE'deki "bulgular HATA_GUNLUGU'na, kalanlar YAPILACAKLAR'a; her değişiklik `releases.js`'e sürüm notu"
  adımları §6'da yazılmamış (yalnız HATA_GUNLUGU var). Site aşaması var, ama "görülmeyen durum varsa 'şu durumlara
  bakmadım'" dışında durum çizelgesine bağlanmamış.
- Düzeltme: §6 "bitti" tanımına bu üç adım ve E5.1'deki çizelge bağlanmalı.

---

## 6. Sahibe giden sorular

**E6.1 · orta · Soru 1 (sıra): eksik bağlam**
- Sorun: Soru gerçekten sahibin (onaylı sırayı değiştiriyor). Ama Y1'in durumu yazılmamış (Y1 kodu `[~]`,
  `Y1_KOD_RAPORU.md`). Ana sayfanın şu an yeniden tasarlandığı ve B2'nin "adım satırının üstü"nün bu tasarıma bağlı olduğu
  da söylenmiyor. B1'in ön koşulu olan v2 cihaz denemesi (E3.13) sırada görünmüyor.
- Düzeltme: Soru bir satır uzamalı: "Y1 kodu hazır (cihazda denenmedi); Ana sayfa yeniden tasarlanıyor. B2'nin satırı o
  tasarıma tek satırla takılır."

**E6.2 · yüksek · soru sayısı ve planın kendi verdiği kararlar**
- Sorun: Üç soru kuralına uyulmuş, ama plan sahibin açık sözüyle çelişen iki konuda kendisi karar vermiş:
  (a) bilim satırı günde bir (sahip: "her bildirim"; E1.4); (b) sabah havası ve yürüyüş sorusunun deneye etkisi (sahibin
  kararı 3; E3.1). S0'nun ölçütüne göre ("onaylı bir kararı değiştiren … soru sahibe gider"), onaylı bir kuralı değiştiren
  iki başka konu da soru olmadan geçmiş: kilit ekranında mesafe (E4.7) ve deney türlerinde çok saat (E3.2). Kısacası
  plan (a) ile (b)'yi ve bu iki konuyu kendisi kapatmış.
- Düzeltme: Üç soruyu korumak için: (a) karar 3'e katılır ("Nef'in dili: banka **ve** her bildirimde kaynak kimliği,
  görünür bilim satırı günde bir. Öneri: evet"). (b), (E3.2) ve (E4.7) için planın varsayılanı onaylı kurala geri döner
  (sessiz günde yürüyüş sorusu yok, deney türünde tek saat, kilit ekranında önizleme gizli). Onaylı kural korunduğu için
  bunlar soru olmaktan çıkar.

**E6.3 · orta · Karar 3: soru sahibin sözünden farklı kurulmuş**
- Sorun: Sahip "ucuz model, istem ve veriyle zeki" dedi. Soru "banka mı, canlı mı" diye kurulmuş ve bankayı "güçlü bir
  modelle" ürettiriyor. Bu seçim sahibin "ucuz model" sözünden sapıyor. Sapma yanlış değil (≈ 1 USD), ama gerekçesi
  soruda yazmalı.
- Düzeltme: Soruya bir cümle eklenmeli: "Senin 'ucuz model' isteğin: banka her sürümde bir kez üretildiği için güçlü
  model de toplamda ≈ 1 USD tutar. İstersen banka da ucuz modelle üretilir; o zaman aday sayısı artar, kalite
  değerlendirmede ölçülür."

**E6.4 · orta · Önceden karara bağlanmış şeyler plana yeniden girmiş**
- Sorun: Plan S0 kararlarından birkaçını anmadan değiştiriyor:
  - S0 karar 10: App Review cevabına kadar alarm kartında hava yok. Plan açıyor ve sahibin sözüne dayandırıyor; söz kayıtlı
    değil (E1.8).
  - S0 karar 11: teklif metni "Şehrinin havasını da göstereyim mi?". Plan "Havayı burada göstereyim mi?" diyor.
  - S0 karar 12: "(yaklaşık)" yalnız konumdan bulunan il için. Planda yok.
  - S0 karar 15: bildirimde "Kaynak: Apple Weather". Plan "Son satır 'Apple Weather'" diyor.
  - Onaylı plan §3.E: yağmur tercihi "ilk yağmurlu günde bir kez sorulur". Planda bu keşif anı kaybolmuş.
- Düzeltme: §2 tablosuna bu beş satır eklenmeli ("Onaylı karar → bu plan ne yapar → neden"). Gerekçe yoksa S0 kararı
  korunur.

**E6.5 · düşük · Kendi kararlar listesi sahibin gözü önünde değil**
- Sorun: "Kendi karar verdiklerim" tek paragrafta dokuz karar sayıyor. Bazıları ürünün sesini değiştiriyor ("ideal"
  yasak, ölüm ve hastalık bulgusu yok, dolunay kuralı). Sahip bunları itiraz edilecek bir liste olarak göremez.
- Düzeltme: Madde madde, her biri tek satır, en fazla 9 madde; her birinin yanında "itiraz edersen ne değişir".

---

## 7. Uzunluk ve okunurluk

**E7.1 · orta · §1: 5 saniye**
- Sorun: §1, 75 satır ve dört alt bölümden oluşuyor. İlk tabloda "manifest yeteneği (`remind`)", "Tek planlayıcı",
  "WeatherKit (Swift)", "konum arka plan kipi" geçiyor. "Dürüst sınırlar"da Apple belge yolları ve API adları var. Sahip
  ilk ekranda neyin **görüleceğini** anlamıyor. ANA_BELGE ve SAHIP_ISTEKLERI sahibe giden her işin 5 saniye sınamasından
  geçmesini istiyor; plan bu sınamayı kendi §1'ine uygulamamış (§6 kapısı yalnız tasarıma uygulanıyor).
- Düzeltme: §1'in ilk 6 satırı üç sahne olmalı, teknik terim olmamalı:
  1. "Kilit ekranın, 06.10: **Bugün 21.00–22.00 arası yağmur bekleniyor** · Yürüyüşü 20.30'dan önce bitirirsen kuru
     kalırsın."
  2. "Ana sayfa, adımların üstünde: **İzmir Gaziemir · 23° · 21.00'de yağmur**."
  3. "Yürürken: **Son 15 dakikada 1,1 km yürüdün, hava 23 derece. Eşlik edeyim mi?** → Watch gibi ekran, 250 metrede bir
     'kilometre başına 9 dakika 40 saniye'."
  Sonra tek satır: "Her modülün sonunda 'Bana hatırlat'; Profil → Bildirimler'de hepsi tek listede; hiçbir bildirim üst
  üste gelmez, gece hiç 'kalk' yok." "Nasıl" sütunu, API adları ve Apple yolları §3'e taşınmalı. Bu ilk bölüm yazıldıktan
  sonra 5 saniye sınamasından geçmeli.

**E7.2 · düşük · tekrar**
- Sorun: Dürüst sınırlar §1, §3 (A.3, B.4, C.1, C.2) ve §8'de üç kez yazılmış; maliyet ve gizlilik §1 ile §4'te; VARSAYIM
  listesi §8'de 30'dan fazla madde. Plan 62 KB; bunun yarısı tekrar ve dayanak paragrafı.
- Düzeltme: Sınırlar tek yerde (§8) durur, §1 yalnız dördünün başlığını anar. Her "Dayanak ve sınır" paragrafı iki
  cümleye iner, geri kalanı `pubmed.md`'ye atıf olur. Hedef: §1 en çok 40 satır, bütün plan en çok 450 satır.

**E7.3 · düşük · ürünün kendi 5 saniyesi**
- Sorun: Sahip "5 saniyede etkileme"yi ürünün her ekranına da uyguluyor. Planda her parçanın ilk 5 saniyesi yazılmamış:
  kilit ekranında görünen ilk satır, Ana sayfa satırı ve yürüyüş ekranı açılınca ilk görülen.
- Düzeltme: Her parçanın başına tek satır: "İlk 5 saniye: …". Örneğin B3: "Açılınca büyük süre sayacı zaten akıyor (son 15
  dakika eklenmiş), altında 'Nef seninle' yazıyor ve ilk anons 3 saniye içinde gelir: 'Birlikte yürüyoruz. 1,1
  kilometredesin.'"

**E7.4 · düşük · süre tahmini**
- Sorun: B1 ≈ 8–10 iş günü. İş kalemleri: 15 modül, ortak bileşen, `planAll`, çizelge, Nef bankası (üretim, iki model
  incelemesi, kör insan değerlendirmesi, sahip onayı), ≈ 17 kaynak ve bilim kartı. Bu kalemler için tahmin iyimser
  görünüyor; banka onay turları sahibin süresine bağlı.
- Düzeltme: Nef bankası B1'den ayrı bir satır (B1b) olarak yazılmalı. B1 bankasız, onaylı metinlerle çıkabilir; banka
  hazır olunca metinler değişir.

---

## 8. Bakmadıklarım

- Capacitor LocalNotifications'ın sayı olmayan kimlikli ya da yerelde kurulmuş bildirimin dokunuşunu nasıl ilettiği
  (E3.4): kaynak koduna bakmadım.
- `pubmed.md`'deki kaynakların ve Apple alıntılarının doğruluğu (doğruluk eleştirisinin işi).
- Onaylı yoga planı (`yoga-pilot/v3/PLAN.v3.md`) depoda bulunamadı. Yoga ile ilgili bulgu (E3.11) yalnız
  `YogaMorningCard.jsx` yorumlarına ve plandaki satıra dayanıyor.
- `settings` nesnesinin bulutla eşitlenip eşitlenmediği: yalnız `profileSync` rıza metnine baktım (E2.12, E4.3).
