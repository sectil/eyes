# Yılan · ana oturum istemi

Yazan: Yılan oturumu (dal `claude/yilan-bakis`, taslak PR #9). Durum ve ayrıntı: `TESHIS_VE_PLAN.md`, `5SN_TABAN.md`,
`CIHAZ_DENETIM.md`. Aşağıdaki "---" çizgisinin altı ana oturuma olduğu gibi yapıştırılır.

---

Görev: `claude/yilan-bakis` dalındaki Yılan işini ana dala karıştırmadan entegre et. Sahip Türkçe yazar; ona sade,
kısa ve parantezsiz Türkçeyle cevap ver.

## 1. Önkoşul: dalın bitmiş olduğunu doğrula
- `docs/yol-haritasi/tasarim/yilan/5SN_SONUC.md` var mı ve dört ekranın (ayar, kontrol, oyun, sonuç) her biri en az
  4/5 aldı mı? Yoksa Yılan oturumu işi bitirmemiştir: entegre etme, sahibe "Yılan oturumu henüz bitmedi" de.
- Sahip, yeni cümleleri onayladı mı? Liste aşağıda, madde 6. Onaylanmamış cümle ana dala girmez.
- Bu istem yazıldığında 5 saniye turu ve cümle onayı henüz yapılmamıştı.

## 2. Ne değişti
- **Teşhis, kanıtlı:** Sistem kalibrasyonunun biriminde Yılan eşiği tahtanın içine düşüyordu. Tahtanın 225 hücresinin
  134'üne bakmak dönüş komutuydu. Yukarı giderken başı izlemek yanal komut üretiyordu.
  Betikler: `docs/yol-haritasi/tasarim/yilan/teshis/`.
- **`app/src/lib/snakeGaze.js` (yeni):** Yılan'a özel ayar, okuyucu, yön kararı, oyun içi kayma düzeltmesi ve dört
  yönlü kontrol. Kayıt anahtarı `gozolcum:snake-gaze-v1`. Sistem anahtarlarına (`gozolcum:gaze-model-v1`,
  `gozolcum:gaze-flip`) yazmaz; `gazeCalib.js`'ten yalnız saf fonksiyon okur.
- **`app/src/screens/SnakeGame.jsx`, `app/src/styles/snake.css`:**
  - Tahtanın dışında dört yön kapısı var; tahtanın içine bakmak komut değil.
  - İlk girişte ayar yapılır, sonraki girişlerde kısa kontrol. Kontrol tutmazsa ayar kendiliğinden yenilenir.
  - Alttaki "Bakışla kontrol" kutusu ve "Şimdi sen dene" kalktı.
  - Sonuç ekranı tahtanın yerinde tam kart.
- **`app/src/modules/snake/manifest.js`:**
  - `gates.gaze` kalktı; Yılan sistem kalibrasyonunu şart koşmuyor.
  - `storageKeys`'e `gozolcum:snake-gaze-v1` eklendi.
  - `progress.metrics`'e `snake-gaze-ms` "Bakışla yön verme" eklendi: ms, düşük iyi, `meaningful` yok.
- **Oturum kaydı:** Girişteki kontrolden sonraki ilk oyuna yalnız sayılar eklenir:
  `gaze: { hits, n, wrong, ms }`.
- **Değişmeyenler:** `lib/gaze.js`, `lib/gazeCalib.js`, `lib/gazeAdapt.js`, kalibrasyon ekranları, Swift, App.jsx,
  Nef ve Gelişim dosyaları. Bu yüzden E testi, okuma, takip ve Rutin'in bakış davranışı aynı kalır.
  Doğrulamak için: `git diff master...origin/claude/yilan-bakis --stat -- app/src/lib/gaze.js app/src/lib/gazeCalib.js
  app/src/lib/gazeAdapt.js app/src/screens app/ios` yalnız `SnakeGame.jsx` göstermeli.

## 3. Nasıl entegre edilir
1. `git fetch origin claude/yilan-bakis master`
2. `git log --oneline master..origin/claude/yilan-bakis` ile commitleri listele. Bu istem yazıldığında:
   - `b032073` teşhis ve plan
   - `0bf4478` çekim düzeneği ve taban görüntüleri
   - `7dd3d06` 5 saniye taban ölçümü
   - `5a99342` kod: ayar, kapılar, kontrol, sonuç
   - Sonraki commitler 5 saniye turları ve belgelerdir; listeyi dalın kendisinden al.
3. Ana dalın son hâlinden yeni bir entegrasyon dalı aç ve Yılan dalını **merge** et. Rebase ya da force-push yapma.
4. Çakışma çözümü, aşağıdaki 4. bölüme göre.
5. Testler:
   - `cd app && npx vitest run src/lib/snakeGaze.test.js src/lib/snake.test.js src/modules`
   - Sonra tam takım: `npx vitest run`, ardından `npx vite build`.
6. Yılan oturumunun bu ortamda bildiği tek kırmızı test `src/lib/yogaLessons.test.js` "Uykuya Geçiş müzik kuyruğu".
   Sebebi kısmi kopyada eksik `yoga-pilot/render/out/...mp3` dosyası; Yılan değişikliği olmadan da kırmızı.
   Tam kopyada geçmesi gerekir; geçmezse Yılan'a bağlama.

## 4. Olası çakışmalar
- **`app/src/modules/registry.test.js`:**
  - "kapılar" testinde Yılan satırı değişti: `gates.gaze` artık yok.
  - `metSample`'a `snake` örneği eklendi.
  - Gelişim işi aynı bloğa örnek eklediyse iki tarafı da tut.
- **`app/src/modules/snake/manifest.js`:** Ana oturum Nef için `nef` alanı ya da `progress` değişikliği yaptıysa iki
  tarafı birleştir. Yılan tarafındaki `progress.metrics` ve `storageKeys` korunmalı.
- **Gelişim eşdeğerlik testleri** (`growth.equiv`, `growth.single`): Yeni metrik serisi boş ve `null` kayıtlara
  dayanıklı yazıldı, Yılan dalında geçiyor. Ana dalda Gelişim izinli fark listesi (ALLOWED) değiştiyse ve yeni metrik
  fark sayılıyorsa bu Gelişim kuralı v2'nin kararıdır. Testi gevşetme; sahibe sor.
- **`lib/coachCore.js` / Nef:** Yılan dokunmadı. Nef yeni ölçüyü kendi planı §4.8'e göre `progress.metrics`'ten okur.
  `coach()` çıktısı aynı kaldı.
- **"Tüm verileri sil":** `resetKeys` artık `gozolcum:snake-gaze-v1`'i de siler. Bildirimlerin
  `DATA_RESET_KEYS`'ine dokunulmadı.

## 5. Sürüm notu önerisi
`app/src/lib/releases.js`'e Yılan oturumu dokunmadı. Kimliği sen ver.
- Yılan artık yalnız tahtanın dışındaki yön kapılarına bakınca döner; yeme ve yılana bakmak onu döndürmez.
- Yılan'ın kendi göz ayarı var. İlk girişte 10 saniye sürer, sonra her girişte kısa bir kontrol yapılır.
  Sistem göz kalibrasyonu değişmez.
- Oyun sonu ekranı yenilendi: puan, rekora kalan ve kapı kontrolünün sonucu.
- Gelişim'de yeni ölçü: "Bakışla yön verme".

## 6. Sahip onayı bekleyen yeni cümleler
Hepsi `SnakeGame.jsx` içinde. Sahip değiştirirse yalnız metni değiştir.
- "Gözünle yönlendir: dönmek istediğin yöndeki kapıya bak."
- "Dönmek istediğin yöndeki kapıya bak; yılan döner. Tahtanın içine bakmak yılanı döndürmez."
- "Her girişte dört kapıya birer kez bakarak kısa bir kontrol yaparsın."
- "İlk girişte bakışın bu oyuna göre ayarlanır; yaklaşık 10 saniye sürer."
- "Ayarla ve başla" · "Bakışı yeniden ayarla"
- "Yılan ayarı · n/6" · "Ayarı yeniliyorum · n/6" · "Ortadaki noktaya bak" · "Sağdaki kapıya bak" ve diğer üç kapı için
  aynısı · "Kontrol · n/4"
- "Ayar tutmadı" · "Telefonu yüzüne dönük tut, başını sabit tutup yalnız gözünü oynat." · "Yeniden dene" ·
  "Dokunarak oyna"
- "Kapılar karışıyor" · "Ayar bu duruşta tutmadı. Yeniden ayarlayabilir ya da dokunarak oynayabilirsin." ·
  "Yeniden ayarla" · "Yine de başla"
- "Dönmek için o yöndeki kapıya bak" · "Rekora N puan kaldı" · "Yem" · "Kapılar" · "puan"

## 7. Cihaz
Entegrasyondan sonra sahibe `docs/yol-haritasi/tasarim/yilan/CIHAZ_DENETIM.md`'yi gönder. En önemli adım A:
Yılan'dan çıkınca sistem kalibrasyonu, E testi ve okuma aynı kalmalı. Swift değişmedi; Mac'te her zamanki derleme
yeterli.

## 8. Kurallar
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti attribution satırlarıyla biter. Model adı geçmez.
- Push'tan önce `git fetch`. Kırmızı kod commit edilmez.
- Yılan dalındaki tasarım ve metinleri yeniden yorumlama. Sorun görürsen sahibe sor.
