# Rıza metinleri · ONAYLANDI (sahibi, 2026-09-30: "rıza taslaklarını onaylıyorum.")

Tarih: 2026-09-30. Kalıp `app/src/lib/consent.js`'tir: başlık, giriş, dört satır (Ne kaydedilir? / Ne işe yarar? / Nerede
durur? / Ne kadar kalır?) ve işaretsiz kutunun cümlesi. Bu metinler hukukçu onayından geçmedi (`consent.js`'teki not
aynen geçerli). Sahip 2026-09-30'da onayladı; metinler bu dosyadaki hâliyle, harfi harfine koda girer (her biri kendi
parçasında: `weather` B2, `walk` ve `walkDetect` B3). Hukukçu cevabı metni değiştirirse yeni sürüm olur. Sürüm: üçü de 1. `CONSENT_VERSIONS`'a `weather: 1, walk: 1, walkDetect: 1`
eklenir. `consent.test.js` "bilerek değişen" beklentisidir ve üçünün dört başlığı teste eklenir.

Kurallar:
- Rıza sayfası her zaman iOS izin penceresinden önce gelir.
- Kutu işaretsiz gelir. "Şimdi değil" hiçbir özelliği kapatmaz, yalnız yeni özellik açılmaz.
- Apple Sağlık'ı okuyan her amaç ayrıca `health` rızasını ister. `health` metni "geri çekince Nefona bu verileri okumaz"
  diyor.

---

## `weather` (yeni; onaylı `SONSUZ_YOL.PLAN.v1.md` §E.2'nin metni + iki satır)

- **Başlık:** Bulunduğun yerin havasını da göstereyim mi?
- **Giriş:** İstersen Ana sayfada hava ve yağmur saatini gösteririm. İzin vermesen de her şey açık kalır; il ve ilçeyi
  listeden de seçebilirsin.
- **Ne kaydedilir?** Yaklaşık konumun ya da seçtiğin il ve ilçenin merkezi. Telefonda yalnız il ve ilçe adı kalır.
  Konumunun kendisi saklanmaz.
- **Ne işe yarar?** Hava, yağmur olasılığı ve istersen alarmdan sonra gelen sabah havası bildirimi.
- **Nerede durur?** Hava bilgisi için konum yuvarlanarak Apple'ın hava servisine (yurt dışı) gider. Sabah bildirimi
  yenilenirken yalnız seçtiğin yerin merkezi gider. Sunucumuza ve Nef'e gitmez.
- **Ne kadar kalır?** Telefonda il ve ilçe adı, hava önbelleği ve son 90 günün günlük hava özeti. İzin kapanınca ilk
  açılışta il ve ilçe adı, önbellek ve hava özeti silinir.
- **Kutu:** Hava bilgisi için yaklaşık konumumun ya da seçtiğim yerin merkezinin yurt dışındaki Apple hava servisine
  gönderilmesine açık rıza veriyorum.

## `walk` (yeni)

- **Başlık:** Yürürken sana eşlik edeyim mi?
- **Giriş:** İstersen yürüyüşünde süreyi, temponu ve mesafeni gösteririm; istersen sesli söylerim. İzin vermesen de
  yürüyüş ekranında süre görünür.
- **Ne kaydedilir?** Yürüyüşün süresi, mesafesi, temposu ve adımı. Konum yalnız yürüyüş sırasında mesafe için
  kullanılır; rota ve konum kaydedilmez. Apple Sağlık izni de verdiysen yürüyüş bitince Sağlık'taki adım okunur.
  Uygulama kapalıyken adımların okunur.
- **Ne işe yarar?** Yürüyüş ekranı, sesli koç ve Gelişim'de haftalık yürüyüş dakikan. Yürüyor görünüyorsan "Yürüyüşe mi
  çıktın?" diye sorarım. Yürüyüşünü kaçırırsam "Yürürken beni fark et"i önerebilirim.
- **Nerede durur?** Yalnızca bu telefonda. Sunucuya ve Nef'e gitmez.
- **Ne kadar kalır?** İznini geri çekene kadar. Geri çekince yürüyüş kayıtlarının silinmesini isteyip istemediğin
  sorulur.
- **Kutu:** Yürüyüş verilerimin (sağlık verisi) yukarıdaki amaçla, yalnızca bu telefonda işlenmesine açık rıza
  veriyorum.

## `walkDetect` (yeni; "Yürürken beni fark et")

- **Başlık:** Yürüyüşe çıktığını fark edeyim mi?
- **Giriş:** Bunun için iPhone'un "Her Zaman" konum izni gerekir. İstediğin an Bildirimler'den kapatabilirsin.
- **Ne kaydedilir?** Hiçbir şey. Telefon yaklaşık 500 metre yer değiştirince uygulamayı uyandırır, uygulama yürüyüp
  yürümediğine bakar. Konumun saklanmaz.
- **Ne işe yarar?** Yürümeye başladığında "Yürüyüşe mi çıktın?" diye sormam. İstersen 250 metrede bir temponu
  söylerim.
- **Nerede durur?** Yalnızca bu telefonda. Sunucuya ve Nef'e gitmez.
- **Ne kadar kalır?** Kapatana kadar. Kapatınca uygulama arka planda uyanmaz.
- **Kutu:** Yürüyüşe çıktığımı fark etmek için konumumun telefonumda "Her Zaman" izniyle kullanılmasına açık rıza
  veriyorum.
- **Düğmeler (HIG, yasal rıza istisnası):** tek düğme **[Devam]**, yalnız kutu işaretliyken etkindir; altında küçük
  "Vazgeç" bağlantısı bulunur. [Devam] iOS'un izin durumuna göre ilerler (`PLAN.v1.md` §3.C.1 madde 4).

---

**Açık:** `NSHealthShareUsageDescription` yeni amaçları sayacak biçimde güncellenir. Taslak: *"Adımlarını göz
çalışmalarınla yan yana göstermek, yürüyüş hatırlatması, yürüyüşe çıktığında eşlik teklifi ve yürüyüş kaydındaki adım
için. Veriler telefondan çıkmaz."*


## Değişiklik (sahip onayı 2026-10-01)
- `weather` "Ne kadar kalır?": "90 günlük günlük hava özeti" → "son 90 günün günlük hava özeti".
- Rıza sayfası katmanlı: ilk ekranda kısa özet, onay kutusu ve düğme; dört bölüm dokununca açılır; metin harfi harfine aynı (hukukçuya bu düzen de sorulur).
- (2026-10-01) `weather` "Ne kadar kalır?" silme cümlesi: "il ve ilçe adı, önbellek ve hava özeti silinir" (sahip onayı); kod da bunu yapar.

## iOS konum izni metni (sahip onayı 2026-10-01)

`NSLocationWhenInUseUsageDescription`: "Bulunduğun yerin havasını göstermek için yaklaşık konumunu kullanırım. Konum
yuvarlanarak Apple'ın hava servisine gider; telefonda yalnız il ve ilçe adı kalır." Info.plist'e hava açılırken girer
(SKY_UI ile birlikte); hukukçu adı gelene kadar App Store derlemesinde konum izni yok (DEVIR §7 onaylı yedek).
WeatherKit: Apple Developer'da App ID için Capabilities ve App Services işaretlendi (sahip, 2026-10-01).
