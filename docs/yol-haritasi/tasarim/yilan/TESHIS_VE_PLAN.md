# Yılan · bakış teşhisi ve plan (2026-10-01, dal `claude/yilan-bakis`)

Durum: TEŞHİS BİTTİ · PLAN SAHİP ONAYI BEKLİYOR. Onaysız kod değişikliği yok.

## 1. Teşhis

### 1.1 Sinyalin yolu (koddan okundu)
1. Swift `FaceDistancePlugin.swift`: ARKit yüz karesinden göz ışınının telefon ekranıyla kesişimi (`screenHit`, mm)
   → `scrLX/scrLY/scrRX/scrRY`; ayrıca açı, kamera açısı, baş açısı ve göz kapağı değerleri.
2. `hooks/useFaceTracking.js` bunları her karede `onFrame(m)` ile verir.
3. `screens/SnakeGame.jsx:126` `createGazeReader({ enterDeg: 10, exitDeg: 6 })`. Model verilmediği için
   `lib/gaze.js:439` **sistem kalibrasyonunu** yükler (`loadGazeModel`, anahtar `gozolcum:gaze-model-v1`).
4. `lib/gaze.js:382-395` `applyModel` → kalibrasyon noktasına göre birim (sistem hedefi = ±20), One Euro süzgeci,
   `stepDir` (baskın eksen + 10/6 histerezis).
5. `lib/snake.js:212` `createDwell`: aynı yön 220 ms sürerse dönüş komutu (`SnakeGame.jsx:648`).

### 1.2 Kök neden 1: tahtanın içine bakmak dönüş komutu sayılıyor
- Sistem kalibrasyonunun sağ/sol noktası ekranın %8 ve %92'sinde. Yılan eşiği 10 birim = bu mesafenin yarısı
  ≈ ekran ortasından **79 pt**. Tahta ortadan **±167 pt** genişliğinde. Yani tahtanın sağ ve sol dış kısmı
  dönüş bölgesi. Yukarı eşiği ortadan 138 pt yukarıda, o da tahtanın içinde kalıyor.
- Kanıt (`teshis/sim2.mjs`, gerçek `createGazeReader` + gerçek `createDwell`, gürültüsüz sabit bakış):
  **tahtanın 225 hücresinin 134'üne bakmak komut üretiyor** (sol 59, sağ 59, yukarı 16).
- `teshis/sim1.mjs`: tahtanın ortasından 4 sütun sağdaki yeme bakınca "sağ", 5 sütun soldakine bakınca "sol" komutu.
- Sonuç: oyuncu yeme ya da yılanın başına baktıkça yılan döner. Sahibin "sürekli sağa sola dönüyor, yemi
  yiyemiyor" bulgusu bununla açıklanıyor. Bu, göz takibinde bilinen "Midas dokunuşu" sorunudur: bakılan her yer komut olur.
- Ek: tahtanın altındaki "Bakışla kontrol" kutusu aşağı eşiğinin altında (ekranda ~552–658 pt, eşik 528 pt).
  Kutudaki yazıyı okumak "aşağı" komutu olabilir.

### 1.3 Kök neden 2: yukarı giderken yılanı izlemek yanal komut üretiyor
- `lib/gaze.js:267-277` `stepDir`: yön "yukarı"dayken yatay sapma dikeyden büyük olursa doğrudan "sol/sağ"a geçer.
- Kanıt (`teshis/sim2.mjs`): "yukarı" komutu verilir, sonra kişi yukarı giden başı izler.
  Baş 2. ya da 3. sütundaysa **ilk satırda "sol"**, 12. sütundaysa **"sağ"** komutu çıkıyor. Orta sütunlarda çıkmıyor.
- Sahibin "yukarı giderken göz kayıyor ve yoldan çıkıyor" bulgusu bununla açıklanıyor.
- Göz kapağının yukarı bakışta dikey sinyali bozduğuna dair cihaz verisi yok. Bakmadım, bilmiyorum. Plan bunu
  oyuna özel ayarda ayrıca ölçer.

### 1.4 Gürültü
- Beyaz gürültüyle (σ 1–4 mm) tahta ortasına bakışta komut çıkmadı; One Euro süzgeci bunu yutuyor (`sim1.mjs` C, D).
- Gerçek göz titremesi ve kayması beyaz gürültü değil, yavaş kayma ve küçük sıçramalar. Bunun cihazdaki büyüklüğü
  ölçülmedi (rapor verisi hiç gelmedi, YAPILACAKLAR 4). VARSAYIM: eşiğe yakın bakışta bu kayma komut üretir.
  Asıl sorun gürültü değil, 1.2'deki bölge hatası.

### 1.5 Sistem kalibrasyonu bozuluyor mu?
- Kod bugün sistem modelini **yazmıyor**: `saveGazeModel` yalnız `GazeCalibration.jsx` ve `Routine.jsx`'te var.
- Tek ortak yazma: sistem modeli yoksa okuyucunun yedek yolu `gozolcum:gaze-flip` anahtarına işaret yazabiliyor
  (`gaze.js:487`). Yılan bunu kapatmıyor.
- Sorun yazma değil, **paylaşma**: Yılan sistem modelini olduğu gibi kullanıyor, oyunun ekran düzenine göre ayar yok.

### 1.6 Açık kalan
- Sahibin 2. ekran görüntüsü: "Sağa bak" adımında kutu "Sola bakıyorsun" diyor. Tek kareden neden anlaşılmıyor.
  İşaret ters mi, bakış mı kaydı, bilmiyorum. Yeni oyun içi ayar her girişte yönleri ölçeceği için bu durum ayarda
  yakalanır; ayrıca teşhis kaydına girer.

### 1.7 Eski hatalardan dersler (HATA_GUNLUGU)
- Bug 16 ÇIKMAZ-2: "ortaya dönmeyi şart koşan kilit" denendi, yönler hiç alınmadı, geri alındı. Kural: ortaya bağlı
  kilit yok; kilit varsa süreyle kendiliğinden açılır.
- ENVANTER_VE_PLAN §11 (2026-09-25) aynı teşhisi koymuştu, uygulanmadı. Bu plan onun üstüne kurulu.

## 2. Plan (onay bekliyor)

### 2.1 Yön kararı: tahta güvenli bölge
- Tahtanın içine bakış hiçbir zaman komut değil. Komut yalnız bakış tahtanın dışına, bir kenarın ötesine
  çıkınca. Bölge sınırı oyuna özel ayardan gelir.
- Süzme zinciri (her biri ayrı saf fonksiyon, `lib/snakeGaze.js`, testli):
  1. Göz sıçraması ayıklama: hız eşiği (I-VT, Salvucci ve Goldberg 2000). Hızlı karelerde karar yok.
  2. Duraklama konumu: son ~150 ms ortancası.
  3. Kenar histerezisi: dışarı çıkma ve geri girme için iki ayrı çizgi.
  4. Köşe ölü bölgesi: çapraz bakışta komut yok.
  5. Bekleme: dışarıda 250–300 ms. Kesin değer sentetik testle seçilir.
  6. Komuttan sonra kısa kilit: geri dönüş ve aynı komut yok sayılır. Kilit süreyle açılır, ortaya bağlı değil.
- Ölçüt: aynı sentetik düzenekte tahta içi istenmeyen komut 134/225'ten 0'a; yukarı izleme senaryosunda 0 yanal komut;
  gecikme tablosu eski ve yeni için yan yana.

### 2.2 Oyuna özel ayar ve kontrol
- **Ayar** (yaklaşık 10 sn): oyunun kendi düzeninde 5 hedef. Tahta ortası, tahtanın üstü, altı, solu ve sağı.
  Hesap mevcut saf fonksiyonlarla yapılır (`fitModel`, `closeThreshold`); bunlar yalnız okunur, değişmez.
- **Kontrol** (yaklaşık 5 sn): dört yöne birer bakış. İsabet ve süre ölçülür. Bugünkü "Şimdi sen dene" bunun yerine geçer.
- Ayrı kayıt: `gozolcum:snake-gaze-v1`. Sistem anahtarlarına yazma yok.
- Yılan okuyucuyu kendi modeliyle ve işaret kaydı kapalı kurar (`persistKey: null`).
- Test: Yılan ayarı, kontrol ve oyun akışı sonrası `gozolcum:gaze-model-v1`, `gozolcum:gaze-flip` ve kendini iyileştirme
  verisi bayt bayt aynı kalır.

### 2.3 Yukarı bakış
- Yukarı ve aşağı kazancı ayarda ayrı ölçülür. Kapak eşiği kişinin aşağı bakışından alınır.
- Asıl düzeltme 2.1: yukarı giderken tahta içinde baş izlemek artık yanal komut üretmez.

### 2.4 Tasarım
- Gözle oyunda tahtanın dört kenarında yön kapıları: bakış dışarı çıkınca o kapı dolar.
- Tahtanın altındaki bakış kutusu kalkar, durum tek satır olarak tahtanın üstüne taşınır.
- Yeni ekranlar: ayar, kontrol, oyun, sonuç. 390 ve 320 genişlik, açık ve koyu tema, 5 kişilik kapı.
- Yeni her cümle önce taslak olarak sahibe gelir.

### 2.5 Gelişim ve Nef
- Oturum kaydına yalnız sayılar eklenir: kontrol isabeti, kontrol süresi ortancası, ayar kalitesi.
- `progress.metrics`: "Bakışla yön verme süresi" (ms, düşük iyi), kontrol ortancasından. Oyun puanı ölçü sayılmaz.
- `coach()`: 7 günlük kontrol süresi ortancası. Nef bunu kendi kurallarıyla okur.
- Yalnız `modules/snake/manifest.js` değişir. `growthCenter`, `progress`, `dataHub` ve Nef dosyalarına dokunulmaz.

### 2.6 Dokunulacak dosyalar
- Yeni: `lib/snakeGaze.js`, `lib/snakeGaze.test.js`, oyun içi ayar bileşeni.
- Değişecek: `screens/SnakeGame.jsx`, `styles/snake.css`, `lib/snake.js` (yalnız ek), `modules/snake/manifest.js`
  ve `view.jsx`.
- Değişmeyecek: `lib/gaze.js`, `lib/gazeCalib.js`, `lib/gazeAdapt.js`, kalibrasyon ekranları, Swift.
  Bu dosyalar değişmediği için E testi, okuma ve takip davranışı aynı kalır. Eşdeğerlik testi bunu ayrıca gösterir.
- Swift değişikliği yok, Mac'te derleme gerekmiyor.

### 2.7 Değişebilecek testler
- `lib/snake.test.js`: yalnız eklenir.
- Yeni `lib/snakeGaze.test.js`: süzme zinciri, sentetik senaryolar, ayrı anahtar testi.
- `modules/registry.test.js`, `lib/growth.audit.test.js`, `lib/growth.consumers.test.js`: yeni metrik nedeniyle.
  Ana oturumun Gelişim işiyle çakışabilir; ANA_OTURUM_ISTEMI'nde yazılır.

## 3. Sahibe sorular
1. Oyuna her girişte ne olsun? Öneri: ilk girişte tam ayar (yaklaşık 10 sn), sonraki girişlerde yalnız 4 yön kontrolü
   (yaklaşık 5 sn). Kontrol tutmazsa tam ayar kendiliğinden açılır.
2. Yılan kendi ayarını yapacağı için sistem göz kalibrasyonunu şart koşmasın mı? Öneri: koşmasın.
