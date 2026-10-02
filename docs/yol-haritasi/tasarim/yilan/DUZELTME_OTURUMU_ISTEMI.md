# Yılan · düzeltmeyi bitirecek oturumun istemi

Yazan: Yılan oturumu (dal `claude/yilan-bakis`, taslak PR #9). "---" çizgisinin altı yeni oturuma olduğu gibi yapıştırılır.

---

Görev: Nefona'nın "Yılan" oyununu (göz bakışıyla yönetilen yılan) bitir. Bakış motoru yazıldı ve testli. Kalan iş
ekran tasarımı: 5 saniye kapısını geçmek, metinleri sahibe onaylatmak, belgeleri kapatmak. Sahip Türkçe yazar; ona sade,
doğru Türkçeyle, parantezsiz ve kısa cevap ver. Başlarken bitiş saatini yaz. Her aşama sonunda kısa ara rapor ver.

## 0. Önce oku, sırayla
1. `docs/yol-haritasi/tasarim/yilan/SAHIP_ISTEGI.md` ve `sahip-ekran/` altındaki iki görüntü (Read ile aç).
2. `docs/yol-haritasi/tasarim/yilan/TESHIS_VE_PLAN.md`: teşhis, kanıt ve onaylı plan.
3. `docs/yol-haritasi/tasarim/yilan/5SN_TABAN.md`: üç ölçüm turunun sonuçları ve değerlendirici bulguları.
4. `docs/yol-haritasi/tasarim/yilan/ANA_OTURUM_ISTEMI.md`: entegrasyon notları ve onay bekleyen cümleler.
5. `docs/yol-haritasi/IS_AKISI_KURALLARI.md` ve `HATA_GUNLUGU.md`'nin Yılan bölümleri. Bug 16 ÇIKMAZ-2: "ortaya
   dönmeye bağlı kilit" kullanılmaz; kilit varsa süreyle açılır.
6. Kod: `app/src/lib/snakeGaze.js` ve testi, `app/src/screens/SnakeGame.jsx`, `app/src/styles/snake.css`,
   `app/src/modules/snake/manifest.js`.

## 1. Biten iş, değiştirme
- **Kök neden kanıtlandı:** Eski yöntemde tahtanın 225 hücresinin 134'üne bakmak dönüş komutuydu. Yukarı giderken başı
  izlemek yanal komut üretiyordu. Betikler: `teshis/sim1.mjs`, `teshis/sim2.mjs`.
- **`lib/snakeGaze.js`:** Oyuna özel ayar (anahtar `gozolcum:snake-gaze-v1`). Yön kararı yalnız tahtanın dışındaki
  kapılardan çıkar. Zincir şöyle:
  - Göz sıçraması ayıklanır.
  - 100 ms ortanca alınır.
  - Kapı bölgesinde histerezis uygulanır.
  - Köşeler ölü bölgedir.
  - 200 ms bekleme sonrası komut verilir.
  - Komuttan sonra 320 ms süreli kilit vardır.
  
  Ayrıca oyun içi kayma düzeltmesi ve dört yönlü kısa kontrol var.
- **Sistem kalibrasyonu:** Yılan sistem anahtarlarına yazmaz; bunu bir test kanıtlar.
- **Sentetik karşılaştırma** (`teshis/karsilastir.mjs`): Gürültü 2 mm'ye kadarken tahta içi istenmeyen komut eskide
  18–24, yenide 0. Kapı isabeti 40/40, gecikme yaklaşık 400 ms.
- **Akış:**
  - İlk girişte ayar, sonra kontrol, sonra oyun.
  - Sonraki girişlerde yalnız kontrol.
  - Kontrol tutmazsa ayar kendiliğinden yenilenir; ikinci kez de tutmazsa seçenek sunulur.
  - Sahibin onayı var: "sen mükemmel diyorsan öyle yapalım".
- **Manifest:**
  - `gates.gaze` kalktı.
  - `storageKeys`'e Yılan anahtarı eklendi.
  - Gelişim ölçüsü `snake-gaze-ms` "Bakışla yön verme": ms, düşük iyi.
  - Nef bu ölçüyü kendi planı §4.8 ile `progress.metrics`'ten okur. `coach()` değişmedi.
- **Değişmeyenler:** `lib/gaze.js`, `lib/gazeCalib.js`, `lib/gazeAdapt.js`, kalibrasyon ekranları ve Swift
  değişmedi. Bu yüzden E testi, okuma ve takip aynı kalır.
- **Testler:** Tam takımda tek kırmızı test `yogaLessons.test.js` "Uykuya Geçiş müzik kuyruğu". Sebebi kısmi kopyada
  eksik bir mp3; Yılan değişikliği olmadan da kırmızı. `npx vite build` temiz.

## 2. Kalan iş: ekran tasarımı
Dört ekran (giriş, ayar, kontrol, oyun) ve sonuç ekranı iki turda da 5 saniye kapısını geçmedi: son tur 0, 0, 0, 0 ve
1/5. Kural gereği aynı yöntemle üçüncü tur açılmadı. Bu oturum **yöntemi değiştirir**. Önerilen yeni düzen aşağıda.
Sahip onayı istenecek ana nokta, oyun tahtasının kare sayısının değişmesidir. Ona tek soruyla, kısa sor.

1. **Daha büyük oyun nesneleri.** Göz modunda tahta 15×15 yerine 11×11 kare. Yılan ve yem yaklaşık 1,4 kat büyür.
   - Dokunma modu 15×15 kalır.
   - `createGame({ cols, rows })` zaten parametreli.
   - Oyun bitince ve rekor kaydında iki tahta boyu ayrı tutulmaz; bu bir VARSAYIM, sahibe söyle.
2. **Kapılar ekranın kenarında.**
   - Kapılar parlak şeritler ya da yarım daireler olur. Tahta ile kapı arasında en az 24 pt boşluk kalır:
     `snakeGaze.js` tahtanın içini komut saymaz, kapı tahtaya yapışırsa kenara bakış komut olur.
   - Düzen değişince kapı konumu ayarda yeniden ölçülür (`edgeFromRects`). Eski kayıtlı ayar yeni düzende yanlış olur:
     `SNAKE_GAZE_VERSION`'ı 2'ye çıkar, eski ayar yüklenmesin.
3. **Dikey boşluk kalmaz.** Skor ince bir şerit olur. Tahta, ekranın kalan yüksekliğini dolduracak kadar büyür.
4. **Ayar ve kontrol tahtanın üstünde ama oyunun kendi dilinde.**
   - Ortadaki ok kalkar, çünkü kapıyı tekrar ediyordu.
   - Kontroldeki tahta içi dört simge kalkar, çünkü kapılarla karışıyordu. İlerleme başlığın altında küçük noktalarla
     gösterilir.
   - Parlayan kapı tek odak olur.
5. **Giriş bir oyun kapağı olur.**
   - Büyük, canlı tahta önizlemesi ve tek düğme.
   - Kontrol, duvarlar ve ses ayarları ayrı bir "Seçenekler" yüzeyine gider.
   - 320 genişlikte hiçbir içerik alttaki düğmenin arkasında kesilmez.
6. **Sonuç cesaretlendirir.**
   - Düşük puanda dev "0" olmaz. Puan küçük kalır, öne kısa bir teşvik cümlesi çıkar. Cümle önce sahibe taslak gelir.
   - Tek ana düğme "Tekrar oyna". Diğerleri ikincil, yarışmaz.
   - Sonuç ekranında oyunun üst çubuğu görünmez.
7. **Sağlık iddiası yok.** Alttaki not kalır: "Eğlence ve bakış kontrolü pratiği. Görmeyi iyileştirdiği iddia
   edilmez."

Her değişiklikten sonra:
- `cd app && npx vitest run src/lib/snakeGaze.test.js src/lib/snake.test.js src/modules`
- Ekran çekimi: `bash docs/yol-haritasi/tasarim/yilan/duzenek/cek.sh`. Sahte göz parlayan hedefe bakar; ayar, kontrol,
  oyun ve sonuç akışı uçtan uca çalışmalı. Çıktı `ekran/` altına gelir.
- Görüntülere önce kendin bak. Kesik, taşan ya da boş alan varsa düzelt; değerlendiriciye ondan sonra götür.

## 3. 5 saniye kapısı
- Beş bağımsız değerlendirici, birbirini görmeden. Soru: "5 saniyede etkilendin mi?" "İdare eder" = hayır. Her ekran
  için en az 4/5 gerekir. 390 ve 320, açık ve koyu.
- Bu oturumda en çok iki tur. Geçmezse yöntemi yine değiştir ya da sahibe sor. Aynı yöntem iki kez başarısız olursa
  üçüncüyü deneme.
- Değerlendirici geçirse de kendin mükemmel bulmazsan sahibe gösterme. Sonuçları `5SN_TABAN.md`'ye ekle.

## 4. Metin onayı
Kullanıcıya görünen her yeni ya da değişen cümle şu sırayla geçer: taslak, 5 kişilik kapı, kendi onayın, sahip onayı.
`ANA_OTURUM_ISTEMI.md` madde 6'daki liste güncel tutulur. Onaysız cümle ana dala girmez.

## 5. Bitiş
1. Tam takım `cd app && npx vitest run` ve `npx vite build`, bir kez.
2. `5SN_SONUC.md`: her ekranın son tur sonucu. Ana oturumun önkoşulu bu dosyadır.
3. `ANA_OTURUM_ISTEMI.md`'yi güncelle:
   - commit listesi
   - yeni anahtar sürümü
   - 11×11 kararı
   - sürüm notu önerisi
   - onaylı cümleler
4. `CIHAZ_DENETIM.md`'yi yeni düzene göre güncelle. A adımı kalır: Yılan'dan çıkınca sistem kalibrasyonu, E testi ve
   okuma aynı olmalı.
5. Sahibe kısa rapor ver.

## 6. Bağlayıcı kurallar
- **Dal:** `claude/yilan-bakis`. Yalnız Yılan dosyaları ve `docs/yol-haritasi/tasarim/yilan/` altında çalış.
  - Kendi dosyaların: `lib/snakeGaze.js` ve testi, `lib/snake.js` (yalnız ek), `screens/SnakeGame.jsx`,
    `styles/snake.css`, `modules/snake/`.
  - Ana oturumun dosyalarına dokunma: Ana sayfa, bildirimler, Gelişim (`lib/growthCenter`, `progress`, `dataHub`,
    `exportData`), Nef, `lib/coachCore.js`, `App.jsx`. Dokunmak zorunda kalırsan dur ve sor.
- **Paylaşılan bakış kitaplığı:** `lib/gaze.js`, `gazeCalib.js`, `gazeAdapt.js` değişmez.
- **Commit:**
  - Yazar `Claude <noreply@anthropic.com>`. İleti şu iki satırla biter:
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ve `Claude-Session: (bu oturumun bağlantısı)`.
  - Commit ve PR'da model adı geçmez.
  - Push'tan önce `git fetch`. Yarım ya da kırmızı kod commit edilmez.
- **Sürüm notu:** `app/src/lib/releases.js`'e dokunma; önerini `ANA_OTURUM_ISTEMI.md`'ye yaz.
- **Gizlilik ve maliyet:**
  - Kamera görüntüsü telefondan çıkmaz.
  - Ücretli çağrı (ses, görsel, model) sahip onayı olmadan yapılmaz.
  - Anahtarlar depoya ve sohbete yazılmaz.
  - Kullanıcının e-postası dış servise gönderilmez.
- **Doğruluk:**
  - Doğrulamadan iddia etme.
  - Bilmediğin API, dosya ya da komutu uydurma.
  - Varsayımı "VARSAYIM:" diye işaretle.
  - Daha önce düzeltilmiş hatayı yeniden "düzeltme"; önce `HATA_GUNLUGU.md` ve `git log`'a bak.
- **Çalışma düzeni:** Aynı anda en çok iki iş akışı. İstenmeyen ek iş yapma.
