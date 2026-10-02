# Yılan · ana oturum istemi (eksiksiz)

Yazan: Yılan oturumu, 2026-10-01/02. Dal `claude/yilan-bakis`, taslak PR #9. Aşağıdaki "---" çizgisinin altı ana
oturuma olduğu gibi yapıştırılır.

---

Bu ileti, Yılan oyununun ayrı oturumda yapılan işini eksiksiz anlatır. Sahip Türkçe yazar; ona sade, doğru Türkçeyle,
parantezsiz ve kısa cevap ver. Doğrulamadan iddia etme; varsayımları "VARSAYIM:" diye işaretle.

## 1. Sahibin isteği
Kelimesi kelimesine: `docs/yol-haritasi/tasarim/yilan/SAHIP_ISTEGI.md`. Cihaz görüntüleri `sahip-ekran/` altında.
1. Göz bebeği sürekli kıpırdadığı için yılan sağa sola dönüyor, yemi yiyemiyor.
2. Yukarı giderken göz istemeden kayıyor, yılan yoldan çıkıyor.
3. Sistem kalibrasyonu ile Yılan kalibrasyonu ayrı olmalı. Oyundan çıkınca sistem kalibrasyonu asla değişmemeli.
4. Oyuna girerken oyuna göre bir kalibrasyon testi yapılmalı.
5. Gelişim, Nef ve Yılan uyumlu çalışmalı, takibi yapılmalı.
6. Tasarım ve entegrasyon mükemmel olmalı.

## 2. Teşhis: kanıtlı
Ayrıntı `TESHIS_VE_PLAN.md`. Betikler `teshis/sim1.mjs`, `sim2.mjs`, `karsilastir.mjs` gerçek kodu çalıştırır.
- **Sinyal yolu:**
  - Swift `FaceDistancePlugin.swift` göz ışınının ekranla kesişimini (`scrLX/LY/RX/RY`, mm) verir.
  - `useFaceTracking` bunu her karede iletir.
  - Eski Yılan `createGazeReader` ile **sistem kalibrasyonunu** okuyordu: `stepDir` eşiği 10, bekleme `createDwell` 220 ms.
- **Kök neden 1:** Eşik, sistem kalibrasyonunun biriminde ekran ortasından yaklaşık 79 pt'ye düşüyordu; tahta ise
  ±167 pt. Sonuç: **tahtanın 225 hücresinin 134'üne sabit bakmak dönüş komutuydu.** Yeme ya da yılana bakmak yılanı
  döndürüyordu.
- **Kök neden 2:** "Yukarı" yönündeyken yatay sapma dikeyden büyük olunca `stepDir` doğrudan sağa ya da sola geçiyordu.
  Yukarı giden başı kenar sütunlarda izlemek yanal komut üretti.
- **Sistem kalibrasyonu:** Eski kod sistem modelini yazmıyordu, yalnız paylaşıyordu. Tek ortak yazma, modelsiz yedek
  yolda `gozolcum:gaze-flip` idi.
- **Açık kalan:** Sahibin 2. görüntüsünde "Sağa bak" adımında "Sola bakıyorsun" yazıyor. Tek kareden neden
  bilinmiyor. Yeni kontrol adımı bu durumu ölçer.
- **Eski ders (HATA_GUNLUGU Bug 16, ÇIKMAZ-2):** Ortaya dönmeye bağlı kilit kullanılmadı. Kilit süreyle açılıyor.

## 3. Yapılan iş

### 3.1 Bakış motoru: bitti, testli
Yeni dosya `app/src/lib/snakeGaze.js` ve testi `snakeGaze.test.js`, 22 test.
- **Yılan ayarı:**
  - Oyunun kendi düzeninde 6 hedef: tahta ortası, sağ, üst, sol ve alt kapı, yine orta.
  - Hesap `gazeCalib.fitModel` ile yapılır; bu fonksiyon yalnız okunur, değişmez.
  - Ayrı kayıt: `gozolcum:snake-gaze-v1`.
- **Okuyucu:** `applyModel` ve One Euro süzgeci. Yem yenince sınırlı kayma düzeltmesi: adım payı %25, toplam en çok 0,3.
- **Yön kararı:**
  - Göz sıçraması ayıklanır.
  - 100 ms ortanca alınır.
  - Yalnız tahtanın dışındaki kapı bölgesi komut sayılır; histerezis var.
  - Köşeler ölü bölgedir.
  - 200 ms bekleme.
  - Komuttan sonra 320 ms süreli kilit.
- **Kısa kontrol:** Dört kapı. Geçme ölçütü 4 isabet ve en çok 1 yanlış.
- **Sentetik karşılaştırma** (`teshis/karsilastir.mjs`). Gürültü ölçülmedi, VARSAYIM:

  | Gürültü | Eski: tahta içi istenmeyen komut | Yeni | Yeni kapı isabeti | Gecikme |
  |---|---|---|---|---|
  | 0–2 mm | 18–24 | 0 | 40/40 | ~400 ms |
  | 3 mm | 35 | 7 | 38/40 | ~400 ms |

- **Testlerin kanıtladıkları:**
  - 225 hücrenin hiçbirine bakmak komut üretmez.
  - Yukarı giderken altı farklı sütunda baş izlenir; yalnız "up" komutu çıkar.
  - Kayık merkezde de komutlar alınır.
  - Kayıt yalnız Yılan anahtarına yazılır; sistem anahtarları bayt bayt aynı kalır.

### 3.2 Oyun akışı
- İlk girişte Yılan ayarı yapılır, ardından kısa kontrol, ardından oyun.
- Sonraki girişlerde yalnız kısa kontrol. Tekrar oyunlarında yeniden sorulmaz.
- Kontrol tutmazsa ayar kendiliğinden yenilenir. İkinci kez de tutmazsa "Yeniden ayarla", "Dokunarak" ya da
  "Yine de başla" seçeneği sunulur.
- Sahip onayı: "sen mükemmel bu şekilde olsun diyorsan öyle yapalım". Yani iki öneri kabul edildi: ilk girişte tam
  ayar, sonrasında kontrol; sistem kalibrasyonu şart değil.

### 3.3 Ekran: dosyalar `SnakeGame.jsx`, `snake.css`
- **Kaldırılanlar:** "Şimdi sen dene" ve tahtanın altındaki "Bakışla kontrol" kutusu.
- **Gözle oyun:** Tahtanın dışında dört yön kapısı, dolan halka ile. Tahtanın üstünde tek satırlık durum.
- **Ayar ve kontrol:** Talimat tahtanın üstünde, tahta bu sırada boş çizilir.
- **Sonuç:** Tahtanın yerinde tam kart: amblem, puan, rekora kalan, yem, süre ve kapı sonucu. Rekorda kutlama.
- **Giriş:** Kapılı tahta önizlemesi, rekor rozeti.
- **Dokunma modu:** Değişmedi.

### 3.4 Modül tanımı: `modules/snake/manifest.js`
- `gates.gaze` kalktı. Yılan sistem göz kalibrasyonunu şart koşmuyor.
- `storageKeys`'e `gozolcum:snake-gaze-v1` eklendi; "Tüm verileri sil" bunu da siler.
- `progress.metrics`'e `snake-gaze-ms` eklendi:
  - Etiketi "Bakışla yön verme", birimi ms, düşük olan iyi, `meaningful` yok.
  - Kaynağı, girişteki kontrolde 4/4 isabet olan oturumların süre ortancası.
  - Oyun puanı ölçü sayılmaz.
- **Oturum kaydı:** Kontrolden sonraki ilk oyuna yalnız sayılar eklenir: `gaze: { hits, n, wrong, ms }`. Görüntü ya da
  ham bakış kaydedilmez.
- **Nef:** `coach()` değişmedi. Nef bu ölçüyü kendi planı §4.8'e göre `progress.metrics`'ten okur.
- **Gelişim kuralı v2:** Metrik `series({ tests, sessions }) → [{ date, value }]` biçiminde ve boş kayda dayanıklı.
  `growth.equiv` ve `growth.single` testleri geçiyor.
- **`modules/registry.test.js`:**
  - Yılan "kapılar" beklentisi güncellendi: `gates.gaze` artık yok.
  - `metSample`'a `snake` örneği eklendi.

### 3.5 Değişmeyenler
`lib/gaze.js`, `lib/gazeCalib.js`, `lib/gazeAdapt.js`, kalibrasyon ekranları, Swift, `App.jsx`, `lib/coachCore.js`,
Gelişim dosyaları, `releases.js`.

Sonuç: E testi, okuma, takip ve Rutin'in bakış davranışı aynı kalır. Doğrulamak için:
`git diff master...origin/claude/yilan-bakis --stat -- app/src/lib/gaze.js app/src/lib/gazeCalib.js app/src/lib/gazeAdapt.js app/src/screens app/ios app/src/App.jsx`
Bu komut yalnız `app/src/screens/SnakeGame.jsx`'i göstermeli.

### 3.6 Tasarım kapısı: geçmedi, iş sürüyor
Sonuçlar `5SN_TABAN.md`'de. Beş bağımsız değerlendirici bakıyor; geçmek için en az 4/5 gerekiyor.

| Tur | Giriş | Ayar | Kontrol | Oyun | Sonuç |
|---|---|---|---|---|---|
| Taban, eski ekranlar | 0/5 | 0/5 deneme | – | 0/5 | 0/5 |
| Tur 1, yeni ekranlar | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 |
| Tur 2, düzeltmeli | 0/5 | 0/5 | 0/5 | 0/5 | 1/5 |

- Ortak bulgular:
  - Yılan ve yem tahtada küçük kalıyor.
  - Tahtanın üstü ve altı boş.
  - Kontrol simgeleri kapılarla karışıyor.
  - Giriş ayar formu gibi; 320 genişlikte içerik düğmenin arkasında kesik.
  - Sonuçta dev "0" moral bozuyor.
- İki tur doldu, aynı yöntemle üçüncü tur açılmadı.
- Yöntem değişikliği yeni bir oturuma verildi: `DUZELTME_OTURUMU_ISTEMI.md`. İçeriği:
  - Gözle oyunda tahta 11×11; bunun için sahip onayı istenecek.
  - Kapılar ekran kenarında olacak.
  - Giriş bir oyun kapağı olacak.
  - Sonuç cesaretlendiren bir dille konuşacak.
- Kurala göre geçmeyen ekranlar sahibe gösterilmedi.

### 3.7 Commitler: hepsi `claude/yilan-bakis` dalında
| Commit | İçerik |
|---|---|
| `b032073` | Teşhis, sentetik kanıt betikleri, plan |
| `0bf4478` | Ekran çekim düzeneği (`duzenek/`), taban görüntüleri |
| `7dd3d06` | 5 saniye taban ölçümü, planın tasarım bölümü |
| `5a99342` | Kod: `snakeGaze.js`, ayar, kapılar, kontrol, sonuç, manifest |
| `67246a7` | Ana oturum istemi, cihaz denetim listesi |
| `776d9ac` | Tur 1 bulgularına göre ekran düzeltmeleri |
| `4e31e75` | Tur 2 sonuçları |
| `38f25c5` | Düzeltme oturumu istemi |

Bu istemin güncellendiği commit de dalda. Güncel liste için: `git log --oneline master..origin/claude/yilan-bakis`.

### 3.8 Testler: bu ortamda
- `npx vitest run`: 2419 test geçti, 1 test kırmızı, 5 test bekliyor.
- Kırmızı olan `yogaLessons.test.js` "Uykuya Geçiş müzik kuyruğu". Sebebi kısmi kopyada eksik
  `yoga-pilot/render/out/ilk-bolum/ders3-kuyruk.mp3`. Yılan değişikliği olmadan da kırmızı; doğrulandı.
- `npx vite build`: temiz.

## 4. Ana oturumun şimdi yapacakları
1. **Entegre etme, bekle.** Önkoşul `docs/yol-haritasi/tasarim/yilan/5SN_SONUC.md`: her ekran en az 4/5 almış
   olmalı. Ayrıca bölüm 7'deki cümleler sahip onayından geçmiş olmalı. İkisi de henüz yok. Düzeltme oturumu bunları
   üretecek.
2. **Sahip göz kontrolünü önce telefonda denemek isterse** bu bir sahip kararıdır, sen önerme.
   - Dal olduğu gibi deneme sürümü olarak derlenebilir; Swift değişmedi.
   - Deneme adımları `CIHAZ_DENETIM.md`'de.
   - Bu durumda bile ana dala birleştirme yapılmaz.
3. **Ortak belgelere kayıt.** Yılan oturumu bu dosyalara yazmadı, sen ekle:
   - `HATA_GUNLUGU.md`, Yılan bölümüne:
     - "Kök neden kanıtlandı (2026-10-01): sistem kalibrasyonu biriminde eşik tahtanın içinde, 134/225 hücre komuttu.
       Yukarı yönden yanal geçiş `stepDir` kaynaklı. Çözüm: Yılan'a özel ayar ve tahta dışı kapılar
       (`lib/snakeGaze.js`). Dal `claude/yilan-bakis`. Cihazda doğrulanmadı."
   - `YAPILACAKLAR.md`:
     - Madde 4 ve "Yılan (gözle): aşağı bakış sağ okunuyor" maddelerine "yeni yöntem dalda, cihaz denemesi bekliyor"
       notunu ekle.
     - Yeni madde: "Yılan tasarımı: 5 saniye kapısı geçmedi, düzeltme oturumu sürüyor."
4. **Entegrasyon zamanı gelince:**
   1. `git fetch origin claude/yilan-bakis master`.
   2. Ana dalın son hâlinden yeni bir entegrasyon dalı aç ve Yılan dalını **merge** et. Rebase ya da force-push yok.
   3. Çakışmaları bölüm 5'e göre çöz.
   4. Önce `cd app && npx vitest run src/lib/snakeGaze.test.js src/lib/snake.test.js src/modules`.
   5. Sonra tam takım `npx vitest run` ve `npx vite build`.
   6. Sahibe `CIHAZ_DENETIM.md`'yi gönder.

## 5. Olası çakışmalar
- **`app/src/modules/registry.test.js`:** Yılan "kapılar" satırı ve `metSample` bloğu değişti. Gelişim işi aynı bloğa
  örnek eklediyse iki tarafı da tut.
- **`app/src/modules/snake/manifest.js`:** Ana oturum Nef için `nef` alanı ya da `progress` değişikliği yaptıysa
  birleştir. Yılan tarafındaki `progress.metrics`, `storageKeys` ve `gates`'in `gaze`'siz hâli korunmalı.
- **Gelişim eşdeğerlik testleri:** Ana dalda izinli fark listesi (ALLOWED) değiştiyse ve yeni metrik fark sayılıyorsa
  bu Gelişim kuralı v2'nin kararıdır. Testi gevşetme; sahibe sor.
- **"Tüm verileri sil":** `resetKeys` Yılan anahtarını da siler. Bildirimlerin `DATA_RESET_KEYS`'i değişmedi.
- **Düzeltme oturumu:**
  - `SNAKE_GAZE_VERSION`'ı 2'ye çıkaracak; eski ayar yüklenmez, kişi bir kez yeniden ayar yapar.
  - Göz modunda tahta 11×11 olabilir; sahip onayına bağlı.
  - Entegrasyondan önce bu iki karar `5SN_SONUC.md` ve bu dosyada güncel olacak.

## 6. Sürüm notu önerisi
`app/src/lib/releases.js`'e Yılan oturumu dokunmadı. Kimliği sen ver.
- Yılan artık yalnız tahtanın dışındaki yön kapılarına bakınca döner. Yeme ve yılana bakmak onu döndürmez.
- Yılan'ın kendi göz ayarı var: ilk girişte yaklaşık 10 saniye, sonra her girişte kısa bir kontrol. Sistem göz
  kalibrasyonu değişmez.
- Oyun sonu ekranı yenilendi.
- Gelişim'de yeni ölçü: "Bakışla yön verme".

## 7. Sahip onayı bekleyen cümleler
Hepsi `SnakeGame.jsx` içinde. Düzeltme oturumu bunları değiştirebilir; son liste orada.
- "Gözünle yönlendir: dönmek istediğin yöndeki kapıya bak."
- "Dönmek istediğin yöndeki kapıya bak; yılan döner. Tahtanın içine bakmak yılanı döndürmez."
- "Her girişte dört kapıya birer kez bakarak kısa bir kontrol yaparsın."
- "İlk girişte bakışın bu oyuna göre ayarlanır; yaklaşık 10 saniye sürer."
- "Ayarla ve başla" · "Bakışı yeniden ayarla"
- "Yılan ayarı · n/6" · "Ayarı yeniliyorum · n/6" · "Ortadaki noktaya bak" · "Sağdaki kapıya bak" ve diğer üç kapı
  için aynısı · "Kontrol · n/4" · "Hazırsın"
- "Ayar tutmadı" · "Telefonu yüzüne dönük tut, başını sabit tutup yalnız gözünü oynat." · "Yeniden dene" ·
  "Dokunarak oyna"
- "Kapılar karışıyor" · "Ayar bu duruşta tutmadı. Yeniden ayarlayabilir ya da dokunarak oynayabilirsin." ·
  "Yeniden ayarla" · "Yine de başla"
- "Dönmek için o yöndeki kapıya bak" · "Rekora N puan kaldı" · "Yem" · "Kapılar" · "puan"

## 8. Dosya haritası: `docs/yol-haritasi/tasarim/yilan/`
| Dosya | Ne |
|---|---|
| `SAHIP_ISTEGI.md`, `sahip-ekran/` | Sahibin sözleri ve cihaz görüntüleri |
| `TESHIS_VE_PLAN.md` | Teşhis, kanıt, onaylı plan, kapatılan eksikler |
| `teshis/` | Kanıt ve karşılaştırma betikleri; gerçek kodu çalıştırır |
| `duzenek/` | Ekran çekim düzeneği: `bash duzenek/cek.sh`, sahte yüz takibi |
| `ekran/` | Son çekilen 20 görüntü; tabanın görüntüleri `0bf4478`'de |
| `5SN_TABAN.md` | Üç ölçüm turunun sonuçları |
| `CIHAZ_DENETIM.md` | Sahibin telefonda deneyeceği adımlar |
| `DUZELTME_OTURUMU_ISTEMI.md` | Tasarımı bitirecek oturumun istemi |
| `ANA_OTURUM_ISTEMI.md` | Bu dosya |

## 9. Kurallar
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti attribution satırlarıyla biter. Model adı geçmez.
- Push'tan önce `git fetch`. Kırmızı kod commit edilmez.
- Yılan dalındaki tasarımı ve metinleri yeniden yorumlama. Sorun görürsen sahibe sor.
