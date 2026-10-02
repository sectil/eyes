# nefona.com · site envanteri (2026-09-30)

Kapsam: `/home/user/eyes/site` salt okunur tarandı; depoda hiçbir dosya değişmedi, derleme ya da test koşulmadı.
Uygulama tarafı `git show HEAD:` ile okundu (app/src'deki kaydedilmemiş değişiklikler başka iş akışlarının; sayılmadı).
Satır numaraları `site/pages/*.html` kaynak dosyalarınındır.

## 0. Tek bakışta

- Site yayında değil. Yalnız yerelde duruyor (`npm run dev`, 4300 portu, sahip Tailscale üzerinden bakıyor). Vercel projesi yok, alan adı alınmadı. Depoda `vercel.json` yok.
- 8 sayfa var. Üst çubuk ve alt bilgi tek yerden basılıyor (`scripts/pages.mjs`). Modül listesi, kaynakça, kanıt kartları, sürüm notları, belirtiler ve 7 alan elle yazılmıyor, uygulamadan üretiliyor (`scripts/data.mjs` → `src/data.json`).
- Site en son 2026-09-30'da güncellendi (`6ea6890`, Sonsuz yol Y1): yalnız yol görseli (`home-path-*.webp`) ve onun metni değişti.
- Yeni özelliklerin sitedeki durumu:
  - Yoga sitede hiç yok.
  - Sonsuz yol yalnız bir görsel ve bir cümleyle var.
  - Alarm 28 Eylül sürümüyle var; yogayla bağı yok.
  - Hava durumu sitede yok. Uygulamada da henüz kodu yok (plan Y5).
- Üretilmiş veri eski: `src/data.json` 2026-09-29 14:20'de üretildi. İçinde 21 modül ve 30 kaynak var. HEAD'de ise 22 modül (yoga eklendi) ve 31 kaynak (`luu2024`) var. `dist/` de aynı saatten, yani Y1 metnini de içermiyor.

## 1. Yapı ve üretim hattı

| Adım | Dosya | Ne yapar | Depoda mı |
|---|---|---|---|
| Kaynak sayfalar | `site/pages/*.html` (8) | Gövde; ilk satırlardaki `<!-- title: -->` ve `<!-- desc: -->` yorumları başlık ve açıklama olur | evet |
| Sayfa sarma | `site/scripts/pages.mjs` | Ortak `<head>`, OG ve canonical (`https://nefona.com/...`), üst menü (5 bağlantı), alt bilgi (7 bağlantı, "© 2026 Nefona · Tanı koymaz, tedavi etmez."), `{{iris}}` yer tutucusu. Çıktı `site/*.html` | çıktı `.gitignore`'da |
| Uygulamadan veri | `site/scripts/data.mjs` | `app/src/lib/sources.js`, `evidence.js`, `releases.js`, `profile.js` (RED_FLAGS) ve `setupText.js`'i içe aktarır. `app/src/modules/*/manifest.js`'ten id, title, ring ve kind'i metin olarak okur. Çıktı `site/src/data.json` | çıktı `.gitignore`'da |
| Basma | `site/src/main.js` | `data-render` ile şunları basar: `modules`, `evidence`, `notClaimed`, `notClaimedSources`, `sources`, `sourceCount`, `releases`, `flags`, `domains`. Modül açıklamaları (`MOD_DESC`, satır 76-98) siteye özgü ve elle yazılmış | evet |
| Ana sayfa davranışı | `site/src/home.js` | Ekran görüntülerini temaya göre değiştirir (`data-light`/`data-dark`), kaydırınca gösterir, canlı E tadımlığı (5 harf, 0,1 logMAR adım), ses örnekleri | evet |
| Derleme | `vite.config.js`, `package.json` | `prebuild`/`predev` = `prep` (data.mjs + pages.mjs). Çıktı `dist/`. Vite 8, yazı tipleri Onest, Unbounded ve JetBrains Mono | `dist` `.gitignore`'da |

Diskteki üretilmiş dosyaların tarihi: `site/*.html` 2026-09-30 09:34 (Y1 metniyle). `src/data.json` ve `dist/` 2026-09-29 14:20 (Y1 ve yoga öncesi).

Önemli: bir sonraki `npm run prep`, yogayı modül listesine kendiliğinden ekler. Ama `MOD_DESC`'te `yoga` anahtarı yok, bu yüzden açıklaması boş çıkar. `luu2024` de kaynakçaya 31. kaynak olarak girer.

## 2. Sayfa sayfa envanter

### 2.1 index (`pages/index.html`, 236 satır)
Başlık "Nefona · Gözün değişiyor. Sen de gör.". Bölümler şunlar:

| Bölüm | Anlatılan özellik ya da modül | Görsel | Sayısal ya da bilimsel iddia | Kaynak |
|---|---|---|---|---|
| Giriş (s. 3-48) | Yakın görme testi, 28. günde harita, günlük 15 dk yol; göz, dikkat, uyku ve sakinlik; canlı E tadımlığı ("ölçüm değil" diye yazar) | yok (tadımlık HTML) | "Her gün 15 dakikalık bir yol"; "7 gün ücretsiz, 18 yaş ve üstü"; kartla kalibrasyon, TrueDepth mesafe, logMAR; "başlangıç değerin en erken 22. günde" | — |
| Neden gözden (s. 50-76) | 20-20-20 molası, ışık ve uyku, tek test yerine seri | yok | "29 ekran kullanıcısında iki hafta"; "19 çalışma (556 861 kişi)", gözlemsel; "±0,2 logMAR"; "52 uyarının 47'si yanlış"; "art arda 3 test" | talens2022, dunster2022, deprato2025, yu2021, faes2021, han2019, katibeh2022 (`/bilim.html#src-…` bağlantıları; yedisi de data.json'da var) |
| Bir gün (s. 78-102) | Sabah alarmı ve 1 dk nefes; Bugün ekranı; yol (ilk gün 8 dk, her gün bir adım, tam yol yaklaşık 15 dk, haftalık E testi); gece saati ve uyku sesi | morning, home, home-path, night | "07:00", "~15 dk", "Yol ilk gün 8 dakikadır", "3 dakikalık nefesle başlayan 5 dakikalık mola"; "Uyandırma sesleri Nefona'ya özel bestelendi" (s. 86) | — |
| 28 gün (s. 104-124) | İlk Bakış (20 sn kırpma sayımı), 4 soru, iris haritası, 5. gün raporu, 28. günde karşılaştırma | plan, report, compare | "20 saniyede", "5. günde ilk rapor", "28. günde"; örnek değerler (4→7 kırpma, uyku 6→7) | — |
| Gelişim (s. 126-143) | Gelişim sekmesi, doğrulanmış değişim kuralı, Nef (rıza, son 7 günün özeti), Doktoruma göster (PDF ve CSV), göz doktoruna yönlendirme | coach (kart), progress | "en az 0,10 logMAR, yani bir satır"; örnek "Göz 0,14 logMAR · doğrulanmış değişim yok" | — |
| Nasıl ölçer (s. 145-160) | Kart kalibrasyonu, TrueDepth, tek göz, gözlük koşulu | yok | "40 cm", "haftada bir üç ölçüm", "28 harf" | — |
| Modüller (s. 162-169) | `data-render="modules"` (data.json'daki bütün modüller) | yok | — | — |
| Sesler (s. 171-189) | Kadın ve erkek ses, "ekranda ne yazıyorsa onu duyarsın" | `voice/{female,male}/{exFar,exRest}.mp3` | — | — |
| Gizlilik (s. 191-203) | Kamera görüntüsü telefonda kalır, sayılar telefonda, rızalar ayrı ayrı | yok | — | — |
| Bilim (s. 205-220) | Kaynak sayısı, kanıt kartları, 7 alan, 3 test | yok | `sourceCount` yedek değeri "27" (s. 208; basılınca 30); "6 kanıt kartı" elle yazılmış (s. 209) | — |
| Deneme (s. 222-236) | Haftalık, aylık ya da yıllık plan; 7 gün deneme; iPhone; kameralı ölçüm yalnız Face ID'li modellerde | yok | "7 gün", "18 yaş" | — |

### 2.2 moduller (`pages/moduller.html`)
Liste tamamen `data.json`'dan geliyor. Halkalar Göz, Dikkat ve farkındalık, Yaşam. Bugün basılan 21 modül:
- **Göz:** Kısa E testi, Haftalık E testi, Okuma (ölçüm); Göz kırpma egzersizi, Egzersiz setleri (egzersiz); Tek Bakışta (pratik).
- **Dikkat ve farkındalık:** Nefes sayma (ölçüm); Farkındalık, Fark Ettin mi?, Bugünün görevi, Hızlı Bakış, Yılan, Çemberler (pratik).
- **Yaşam:** İyi oluş (ölçüm, WHO-5); Alarm, Nefes, Dalga, Gökyüzü molası, Mola, Su, Yön (pratik).

Sayfada ayrıca bir "Sesler" paragrafı var. Görsel ve kaynak yok. **HEAD'de 22. modül Yoga** (life, practice); sitede yok.

### 2.3 nasil-calisir (`pages/nasil-calisir.html`)
- **Kurulum, 7 adım:** İlk Bakış, Hoş geldin (Apple, Google ya da e-posta), Yola başlamadan önce (6 belirti), Dört soru, Seni tanıyalım, İris haritan, 7 gün deneme.
- **Günlük yol:** yaklaşık 15 dk. Göz bütçesi 5 dk dolunca 5 dk mola kilidi devreye girer.
- **Ölçümler:** haftalık E testi, kısa test, okuma, nefes sayma, iyi oluş.
- **Pratikler:** Nefes (8 kalıp), Dalga, Gökyüzü molası, Çemberler, Yılan, Hızlı Bakış, Fark Ettin mi?, Yön, sabah alarmı ve uyku sesi. **Yoga yok.**
- Nef.
- **Gelişim:** 5. gün, 22. gün, 7 test, 28. gün, 0,10 logMAR, Doktoruma göster.
- **Göz doktoruna git:** `data-render="flags"` ile basılıyor.

Görsel yok. Sayılar: 7 adım, 20 sn, 15 dk, 5 dk, 8 kalıp, 3 hafta, 22. gün, 7 test, 0,10 logMAR.

### 2.4 bilim (`pages/bilim.html`)
Hepsi `data.json`'dan basılıyor:
- **Kanıt kartları (6):** "E hangi yönde" testi (Orta), Gelişim grafiği ve uyarılar (Orta), Okuma testi (Düşük–Orta), Göz kırpma egzersizi (Orta), Görme ve beyin sağlığı (Gözlemsel), Sabah alarmı ve uyku sesi (Sınırlı).
- **"Açıkça yapmadığımız iddialar"** listesi ve dayanağı.
- **Kaynakça:** 30 kaynak (HEAD'de 31). Her kaynakta yazar, yıl, özgün başlık ve Türkçe çevirisi, dergi, `doi.org` ve PubMed bağlantısı, çalışma türü ve n var.

Sayfada şu not var: "Bu sayfadaki hiçbir cümle sağlık iddiası değildir." **Yoga kanıt kartı yok**; HEAD'deki `evidence.js`'te de yok. Yoga için eklenen tek kaynak `luu2024` (uzman görüşü, katılımcı yok).

### 2.5 yenilikler (`pages/yenilikler.html`)
Elle yazılmıyor. `app/src/lib/releases.js` → `RELEASES` → `data.json` → `renderers.releases`. Sayfa şunu söylüyor: "Uygulamanın içindeki Bilgi → Yenilikler listesinin aynısı."

Bugün 5 girdi var: 26, 27, 28, 29 Eylül ve "29 Eylül, ikinci güncelleme". HEAD'deki `releases.js` de aynı 5 girdide; **yoga ve Y1 (sonsuz yol) için girdi yok**. `releases.js`'teki kural her TestFlight'ın yeni bir id alması. Site bu girdiyi kendiliğinden alır.

### 2.6 gizlilik (`pages/gizlilik.html`, "taslak" etiketli)
- **İçerik:** kamera, telefonda tutulanlar, ayrı ayrı sorulan 4 izin (tablo: profil → Supabase Frankfurt; Apple Sağlık → yalnız telefon; Nef → Vercel ve OpenRouter; profil cevapları → Nef), KVKK md. 6, hesap ve abonelik (RevenueCat), kullanılmayanlar, haklar.
- **Sayısal iddia yok.**
- **Yeni özelliklerle çakışan satırlar:**
  - s. 49 "konum sunucuya hiç gitmez": hava gelince (Y5) genişletilecek (plan §1 "Gizlilik değişiklikleri").
  - s. 33 Nef'e "ekran süresi" gidiyor: Y6 ile paketten çıkacak.
  - s. 32 Nef satırında yoganın dört sayısı yok. HEAD'deki `lib/coach.js:78` yoga için şunları gönderiyor: `sessions7`, `minutes7`, `completed7`, `days7`.
  - s. 40 "Apple ile giriş ya da Google ile giriş": nasil-calisir "e-posta" da diyor.

### 2.7 kosullar (`pages/kosullar.html`, "taslak")
Nedir, ne değildir; 18 yaş; ışığa duyarlı nöbet sorusu (Hızlı Bakış, Tek Bakışta); deneme ve abonelik; hesap; sorumluluk; Apple EULA. Sayı olarak yalnız "7 gün" ve "5. gün" geçiyor. Yoga için bir uyarı satırı yok. VARSAYIM: yoga planında güvenlik uyarısı varsa koşullara da girmesi gerekebilir; bu turda denetlenmedi.

### 2.8 destek (`pages/destek.html`)
10 SSS: muayenenin yerini tutmaz, kamera, hangi telefon, 18 yaş, ±0,2 logMAR ve 3 test, gözlük, deneme ve iptal, veri silme, Nef, ses.

İletişim adresi `destek@nefona.com`, yanında "alan adı alınınca açılır" etiketi var. Yoga, alarm, hava, yol ya da seri için soru yok.

## 3. Ekran görüntüleri ve ortam dosyaları (`site/public`)

| Dosya (light + dark) | Kullanan | Son kayıt (`git log -1 --format=%cs`) | Ne gösteriyor |
|---|---|---|---|
| `screens/morning-*.webp` | index s. 85 | 2026-09-29 (`518afb0`) | Sabah: "Bir dakika nefes, sonra güne başla" |
| `screens/home-*.webp` | index s. 89 | 2026-09-29 (`518afb0`) | Bugün: 3/8 durak, seri, haftalık hedef, alarm, "Yola devam et" |
| `screens/home-path-*.webp` | index s. 93 | **2026-09-30** (`6ea6890`) | Y1 yolu: ısınma ve uzağa bakış tamam, sırada çemberler; 3 dk nefes + 5 dk mola |
| `screens/night-*.webp` | index s. 97 | 2026-09-29 (`518afb0`) | Gece saati 23:41, "Müzik · 22 dk sonra susar", "Alarm 06:30" |
| `screens/plan-*.webp` | index s. 111 | 2026-09-29 (`518afb0`) | Kurulum sonu iris haritası |
| `screens/report-*.webp` | index s. 115 | 2026-09-29 (`518afb0`) | 5. gün raporu |
| `screens/compare-*.webp` | index s. 119 | 2026-09-29 (`518afb0`) | 28. gün karşılaştırma |
| `screens/coach-*.webp` | index s. 137 | 2026-09-29 (`b7cdccf`) | Nef kartı: "Haftalık E testinin zamanı geldi." |
| `screens/progress-*.webp` | index s. 140 | 2026-09-29 (`518afb0`) | Gelişim, 28 günlük iris |
| `screens/acuity-*.webp` | **hiçbir sayfa** | 2026-09-29 (`518afb0`) | E testi ekranı (kullanılmıyor; yaklaşık 144 KB) |
| `screens/sleep-*.webp` | **hiçbir sayfa** | 2026-09-29 (`518afb0`) | Uyku ekranı (kullanılmıyor; yaklaşık 46 KB) |
| `og.png` | tüm sayfalar (`og:image`) | 2026-09-29 (`5047748`) | 1200×630: "Nefona · Gözünden başla. Kendini bütün olarak izle." |
| `mark.svg`, `mark-dark.svg` | tüm sayfalar | 2026-09-29 (`5047748`) | Logo |
| `voice/{female,male}/{exFar,exRest}.mp3` | index s. 179-185 | 2026-09-29 (`518afb0`) | Uygulamadaki mp3'ler |

Yoga, sonsuz yol rozetleri ("Yeni" rozeti, "Günün ritmi"), alarmın yoga sabah sorusu ya da hava ve ay için hiç görsel yok.

## 4. Ekran görüntüleri nasıl üretiliyor

Depoda yeniden üretilebilir bir betik yok. Görseller oturum çalışma alanındaki betiklerle çekildi:
- **Çekim:** Playwright ve Chromium; 390×844 @2x, iki tema, güvenli alan 47/34, `tr-TR`.
  - 29 Eylül görselleri: `…/scratchpad/site/appshots.mjs` (on görünüm: home, progress, report, compare, plan, coach, night, morning, sleep, acuity).
  - Y1 yol görseli: `…/scratchpad/y1fix/pathshot.mjs`.
- **Dönüştürme:** `…/scratchpad/site/towebp.py` (PIL, 780 px genişlik, WebP kalite 82).
- **Düzenek:** `app/_harness/` (`.git/info/exclude` ile depo dışında).
  - Bugün burada `index.html` + `main.jsx` var: alarm, sabah, gece, uyku, E testi ve Dalga görünümleri.
  - `y1path.html` + `y1path.jsx` da var: 70 günlük örnek kullanıcı "Deniz".
  - `appshots.mjs`'in kullandığı `_harness/site.html` ve `siteSeed.js` artık yok. Bu yüzden home, progress, report, compare, plan ve coach görselleri bugün aynı yolla yeniden çekilemez.
- **OG görseli:** `/home/user/eyes/scratchpad/site/og.mjs` (Playwright, depo dışında).
- YAPILACAKLAR'daki not: görseller "HEAD'deki sürümden ayrı çalışma ağacında 28 günlük örnek veriyle" çekildi.

Sonuç: ekran görüntüsü hattı tek kişilik ve dağınık. Yeniden çekim için düzeneğin (site görünümleri ve örnek veri) yeniden kurulması gerekiyor.

## 5. Yayın ve alan adı

- **Kaynak:** `docs/yol-haritasi/YAPILACAKLAR.md:520-539` (son değişiklik 2026-09-29, `c4ce6b4`).
  - Sahibin sözü: "önce yerelde yazıp aktaralım; alan adını Vercel'den alırız".
  - Alan adı: "nefona.com, Vercel'de boşta, 11,25 USD/yıl". VARSAYIM: 29 Eylül bilgisi; bugün yeniden denetlenmedi.
  - Kural: "yayın gününe kadar alınmaz".
- **Açık işler:**
  - `[ ]` Yayından önce: hukukçu incelemesi, veri sorumlusunun unvanı ve adresi, destek e-postası (Resend/SMTP ile; Supabase e-posta girişi de buna bağlı), App Store bağlantısı.
  - `[ ]` Yayın: Vercel projesi "nefona" (kök `site/`, `npm run build`, çıktı `dist`), alan adını satın alma ve bağlama.
  - `[ ]` Sonra: İngilizce sürüm ve ön-üretim (SEO; içerik bugün tarayıcıda basılıyor).
- **Vercel:** uygulamanın Nef sunucusu (`app/api/coach.js`) zaten Vercel'de. Gizlilik sayfası bunu söylüyor. Site için ayrı proje yok.
- **Plan:** `SONSUZ_YOL.PLAN.v1.md` §I, Y3 satırı. Çıktı "TestFlight, site yayını"; sitenin ilk ekranı karar 5b (§F.2): "Bu cümleyi okurken kaç kez göz kırptın?", tahminen 0,5 gün (VARSAYIM).
- **S0 kararları:** `S0/sorular-kararlar.md`, madde 21, Ç11, Ç15.
  - Soru satırı ve tanıtım paragrafı kalkar.
  - "Kamera görüntün telefondan çıkmaz" kısa gerçeği kalkar.
  - Telefonda başlık 360 pt altında 1,9rem olur.
  - Sitede analiz kitaplığı yok, yani 5 saniyenin etkisi sitede ölçülemez.
- **Git:** `git log --grep -i "site\|nefona.com"` yalnız sitenin kendi 7 kaydını ve 2025'ten ilgisiz OAuth kayıtlarını buluyor.

## 6. Son güncellemeler (`git log -- site/`, toplam 7 kayıt; 15'e ulaşmıyor)

| Kayıt | Tarih | İş | Sitede ne değişti |
|---|---|---|---|
| `6ea6890` | 2026-09-30 | Sonsuz yol Y1 | index s. 93-94 (yol görselinin alt metni ve açıklaması), `home-path-*.webp` |
| `ecdee4f` | 2026-09-29 | Yoga pilotu depoya alındı; Türkçe düzeltmeler | index, nasil-calisir, main.js (yalnız dil) |
| `c4ce6b4` | 2026-09-29 | Hesap ekranı alt yazısı | nasil-calisir ("Yola başlamadan önce" adı) |
| `b7cdccf` | 2026-09-29 | E testi haftada bir | destek, index (28 satır), nasil-calisir, main.js, `coach-*`, `home-path-*` |
| `518afb0` | 2026-09-29 | Ana sayfa yeniden: canlı E, gerçek ekranlar, hikâye | index, home.js, home.css, 20 görsel, 4 ses |
| `e0b4c8f` | 2026-09-29 | package-lock platform bağlamaları | package-lock |
| `5047748` | 2026-09-29 | Yerel ilk sürüm | bütün iskelet, OG, logo |

## 7. Yeni özellikler: uygulamada neredeler, sitede ne eksik

"Modüller bittikten sonra görerek düzelt" isteğine göre her satırın bir "hazır olma koşulu" var. Site bu koşuldan önce değişmemeli.

| Özellik | Uygulamada bugün (HEAD) | Sitede bugün | Sitede değişmesi gerekenler | Hazır olma koşulu |
|---|---|---|---|---|
| **Yoga** ("Yoga ve Meditasyon") | `modules/yoga` (`0b076ba`, `58fa1c1`). Yaşam halkası, pratik, yalnız iPhone. Dersler: Nefesin Ritmi (Sakinlik), Derin Dinlenme (Beden), Uykuya Geçiş (İyi oluş), Tek Nokta (Dikkat). Sesleri bitti ve sahip onayladı (`yoga-pilot/DEVAM.md`). Ama `lib/yogaLessons.js`'te yalnız **Ders 2 · 15 dk** `published: true`. Kodek testi açık. Cihazda denenmedi. | Hiç yok | Modül açıklaması (`MOD_DESC.yoga`) · nasil-calisir "Pratikler" · index "Bir gün" ya da ayrı bir bölüm · yoga ekran görüntüleri · kanıt kartı (yok; PubMed ve DOI ile yazılmalı, sağlık iddiası olmadan) · gizlilik Nef satırı (yoganın 4 sayısı) · Yenilikler girdisi · SSS ("yoga uyutur mu" gibi soru; "uyutur" denmez) | Yayımlanan dersler cihazda doğrulandıktan ve `releases.js`'e girdi eklendikten sonra |
| **Sonsuz yol** (merdivenler, "Günün ritmi", "Yeni" rozeti, nefes yolda 1-2-3 dk) | Y1 kodu HEAD'de (`6ea6890`), `[~]`, cihazda denenmedi. "Y1 5 saniye turu" sürüyor (`70ca7d5`; Home, TodayPath, DayChain'de kaydedilmemiş değişiklik var) | Yalnız yol görseli ve "ilk gün 8 dk, her gün bir adım" cümlesi | Sayfanın "28 gün" anlatısı, açıklama ve giriş cümlesi (s. 2, 9) · home ve home-path görselleri yeniden (5 saniye turu Ana sayfayı değiştiriyor) · nasil-calisir "Günlük yol" · Yenilikler | Y1'in 5 saniye turu kapanıp cihazda denendikten sonra. Plan Y4 ile bir kez daha değişir. |
| **Alarm** | 28 Eylül'den beri var (AlarmKit, 3 uyandırma sesi, gece saati). Y1'den sonra yeni olan tek şey yoga sabah sorusu (`YogaMorningCard`: "Dün gece uykuya dalmak ne kadar kolaydı?"; önce alarmın sabah kartı gelir) | Sabah ve gece görselleri, `MOD_DESC.alarm`, kanıt kartı "Sabah alarmı ve uyku sesi" | Yoga sabah sorusu yoga ile birlikte · s. 86 "Nefona'ya özel bestelendi": sesler ElevenLabs Music ile üretildi (`lib/alarmSounds.js:4`); sözcük "hazırlandı" olabilir (VARSAYIM: sahibin kararı) | Yoga ile birlikte |
| **Hava durumu** (ve ay, yağmur bildirimi, konum) | **Kod yok.** Plan Y5 (WeatherKit, `SkyPlugin.swift`, `lib/sky.js`, `SkyCard`, `rainNotify`). Ay Y4. App Review atıf sorusu ve hukukçu soruları açık (S0) | Yok | Özellik anlatısı · gizlilik s. 49 ve izin tablosuna yaklaşık konum ve hava rızası · Apple hava atfı (gerekirse) · SSS | Y5 cihazda bittikten sonra. Plana göre gizlilik sayfası, App Store etiketi ve uygulama aynı sürümde çıkar. |
| "Günün nasıl geçti", Nef v2 | Plan Y4 ve Y6, kod yok | Gizlilik s. 33'te "ekran süresi" Nef'e gidiyor | Y6'da Nef satırı yeniden yazılır | Y6 |
| İlk 5 saniye (site) | Plan Y3, karar 5b onaylı | "Gözün değişiyor. Sen de gör." | İlk ekran: "Bu cümleyi okurken kaç kez göz kırptın?" ve S0 madde 21 | Y3; 5 saniye sınamasıyla (en az 3 bağımsız değerlendirici) |

## 8. Tutarsızlık ve eskime bulguları (hepsi salt okuma; düzeltilmedi)

1. `src/data.json` ve `dist/` 29 Eylül'den kalma. HEAD'de yoga (22. modül) ve `luu2024` (31. kaynak) var. Yeniden üretilince yoganın açıklaması boş çıkar (`src/main.js:76-98`'de `yoga` yok).
2. index s. 208'deki `sourceCount` yedek değeri "27"; gerçek sayı 30 (HEAD'de 31). YAPILACAKLAR s. 523 de "27 kaynak" diyor. index s. 209'daki "6 kanıt kartı" elle yazılmış; yoga kartı eklenirse eskir.
3. Giriş yolları iki sayfada farklı: gizlilik s. 40 "Apple ile giriş ya da Google ile giriş", nasil-calisir s. 16 "Apple, Google ya da e-posta". Supabase e-posta girişi SMTP bağlanana kadar gerçek kullanıcıda çalışmıyor (`docs/supabase/KURULUM.md:14`).
4. Mola iki farklı anlatılıyor: `MOD_DESC.mola` "Bir dakikalık göz molası … süre dolunca kendiliğinden kilitler". Kodda Mola modülü 1 dakikalık (`modules/mola/manifest.js:15`), göz bütçesi kilidi ise 5 dakikalık (`lib/eyeBudget.js:20`, `restMs: 5 * MIN`). nasil-calisir s. 29 ve index s. 94 "5 dakikalık mola" diyor. Hangi ekranın ne yaptığı cihazda görülerek netleşmeli (VARSAYIM).
5. nasil-calisir s. 14: "Kurulum: yedi adım" ızgarasının sınıfı `grid steps six`. Görsel düzen denetlenmedi (VARSAYIM: 7. kart tek başına kalıyor olabilir).
6. `acuity-*` ve `sleep-*` görselleri hiçbir sayfada kullanılmıyor (yaklaşık 190 KB, iki tema).
7. Gizlilik tablosunun Nef satırı (s. 32) yoganın dört sayısını saymıyor; HEAD `lib/coach.js:78` bunları gönderiyor. VARSAYIM: uygulamadaki rıza metninin yogayı sayıp saymadığı bu turda denetlenmedi.
8. Görsellerdeki Ana sayfa (`home-*`, 29 Eylül) Y1 öncesi. `home-path-*` Y1 ile çekildi ama 5 saniye turu Ana sayfayı yeniden değiştiriyor (kaydedilmemiş iş). İkisi de bir kez daha çekilmeli.
9. Yenilikler sayfası uygulamayla aynı. Yoga ve Y1 girdisi `releases.js`'e girmeden sitede görünmez. Bu doğru davranış; girdi TestFlight'la eklenir.

## 9. VARSAYIM listesi
- Alan adının boşta olduğu ve fiyatı 29 Eylül bilgisi; Vercel'de yeniden denetlenmedi.
- Mola metni (bulgu 4) ve ızgara düzeni (bulgu 5) cihazda ya da tarayıcıda görülmedi.
- "Nefona'ya özel bestelendi" sözcüğünün değişmesi öneridir; karar sahibin.
- Yoga rıza metni ve güvenlik uyarısının koşullar sayfasına girmesi gerekip gerekmediği denetlenmedi.
- Yoganın "bitti" sayılma ölçütü: yayımlanan her süre (`published: true`) cihazda denenmiş olmalı. Plan belgeleri bunu kapı olarak söylüyor; tarih verilmedi.
