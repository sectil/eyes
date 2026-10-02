# Açık işler · GENEL YOL HARİTASI (salt okunur denetim, 2026-09-30)

Depo `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `70ca7d5`. Çalışma ağacı temiz (`git status --short` boş),
uzak dalla eşit. Satır numaraları bu HEAD'e göredir. Belge yolları `docs/yol-haritasi/` altına, kod yolları `app/src/` altına
göredir. `/home/user/eyes/CLAUDE.md` yok (`find -name CLAUDE.md` boş); onun yerini `docs/ANA_BELGE.md` tutuyor.
Sınıflar: **A** bitmemiş, kimse yapmıyor · **B** bitmemiş, şu an çalışan bir işte · **C** sahibin kararını ya da eylemini
bekliyor · **D** aslında bitmiş ya da karar verilmiş, belgede açık görünüyor · **E** cihazda doğrulama bekliyor.
Yoga ve sonsuz yol ayrıntıları kardeş raporlarda (`yoga.md`, `sonsuz.md`); burada yalnız gönderme var.

## 0. TestFlight durumu (sorulan)
- **Son TestFlight: Build 59 = `26419b4`** (kayıt `84e8b79`; `YAPILACAKLAR.md:131`). Build 58 = `'2026-09-29'` girdisi
  (`HATA_GUNLUGU.md:779`). Sonrasında "Build"/"TestFlight" kaydı yok: `git log -i --grep='Build 6[0-9]'` boş.
- **`ecdee4f` (29 Eylül 16:16, Türkçe düzeltmeler) HİÇBİR DERLEMEYE GİRMEDİ.** `git merge-base --is-ancestor 26419b4 ecdee4f`
  → evet, yani Build 59'dan sonra. Dokunduğu uygulama dosyaları: `lib/evidence.js`, `lib/exportData.js`, `lib/trend.js`
  (`WEEKLY_PLAN_NOTE`) ve `lib/releases.js`. Hepsi sonraki TestFlight'ı (Build 60) bekliyor. `releases.js`'te bu
  düzeltmelerin maddesi yok. Ayrıca `ecdee4f`, Build 58'le yayımlanmış `'2026-09-29'` girdisindeki bir maddenin metnini
  değiştirdi (`releases.js:48`). Bu yeni madde eklemek sayılmadığı için Bug 31 kuralını çiğnemiyor. Ama düzeltilen metin
  yalnız Bilgi → Yenilikler'de görünür.
- Build 59'dan sonra uygulamaya giren 12 kayıt (`git log 26419b4..HEAD -- app/`): `97f2f87`, `c7af2af`, `752d593`, `6b441f3`,
  `c4ce6b4`, `ecdee4f`, `207b6e1`, `b0afe83`, `8e61960`, `0b076ba`, `58fa1c1`, `6ea6890`, `70ca7d5` (97f2f87 yalnız betik).
  Bunlardan yalnız (b) ve Bug 32 sürüm notunda.
- `'2026-09-29-2'` girdisi Build 59'da yok (`git show 26419b4:app/src/lib/releases.js | grep -c 2026-09-29-2` → 0), yani
  Build 60 için bu girdiye madde eklenebilir.

## Özet tablo
| # | Başlık | Sınıf | Kimin işi |
|---|---|---|---|
| G-01 | Sürüm notunda eksik maddeler | A | Build 60'ı hazırlayan kod oturumu |
| G-02 | Build 60'ın kontrol listesi yok | A (+C) | orkestratör + sahip (Mac) |
| G-03 | Yeni hatalar HATA_GUNLUGU'na işlenmedi | A | belge |
| G-04 | Kırpma, Yılan, Çemberler ve okumanın Gelişim ölçümleri yok | A | Y2 kod oturumu |
| G-05 | Mola ve su günlüğü takvimde görünmüyor | A | kod |
| G-06 | "Şefkatle ele al" aracının ölçümü yok | A | araştırma |
| G-07 | Kurulumdaki ve 28. gündeki iris veri merkezine bağlı değil | A | kod |
| G-08 | Yaş kapısı hesaptan sonra geliyor | A | kod (Y3'e bağlanmalı) |
| G-09 | "Seri yok, baskı yok" metni seri kararıyla çelişiyor | A | kod (Y3) |
| G-10 | Profilim'de iris haritasını yeniden açan satır yok | A | kod |
| G-11 | Nef, zamanı gelmemiş okuma testini önerebiliyor | A | kod (Y6) |
| G-12 | Stres ve öz-şefkat seçenekleri tam metinden doğrulanmadı | A | araştırma |
| G-13 | Hatırlatma ve alarm tek planda birleşmedi; "nefesle kapanma" işi başlamadı | A | tasarım/araştırma |
| G-14 | Klasik alarm tonları yok | A | ses |
| G-15 | `lib/ics.js` yalnız testinde kullanılıyor | A | kod (temizlik) |
| G-16 | Birikmiş iş (Ekran Süresi, veri merkezi 3–4, Y2–Y6, i18n…) | A | sırası gelmedi |
| G-17 | Yoga ekranlarının 5 sn yeniden tasarımı | B | yoga iş akışı |
| G-18 | Y1'in 5 sn turu | B | Y1 iş akışı |
| G-19 | S0 tasarım sayfası | B | S0 iş akışı |
| G-20 | "KANITLI" etiketi | C | sahip |
| G-21 | İyi oluş dilimi hep boşa yakın | C | sahip |
| G-22 | "Bugünün görevi" haftalık hedefe sayılıyor | C | sahip |
| G-23 | WHO-5: kriz hattı ve ticari lisans | C | sahip + hukukçu |
| G-24 | Hukuk ve KVKK işleri | C | sahip + hukukçu |
| G-25 | App Store Connect işleri | C | sahip |
| G-26 | Google ile girişin konsol adımları | C | sahip |
| G-27 | Alarmda açık kararlar | C | sahip |
| G-28 | Yol uzunluğu ve sekmeler: iki karar çelişiyor | C (+B) | sahip / S0 |
| G-29 | Sitenin yayını ve sahibin bakışı | C | sahip |
| G-30 | ENVANTER_VE_PLAN açıkları sahipsiz | C (+D) | sahip |
| G-31 | Build 59 cihaz listesi ((a), Bug 24–27) | E | sahip |
| G-32 | (b), Bug 31 ve Bug 32 (Build 60 bekliyor) | E | sahip |
| G-33 | Göz takibi raporu, kalibrasyon, kendini iyileştirme, Yılan | E (+C) | sahip |
| G-34 | npm eklentileri Release'te; bildirim v2 | E | sahip |
| G-35 | Simge, açılış ekranı, Gelişim haritası | E | sahip |
| G-36 | Alarm cihaz listesi (kalan kısmı) | E | sahip |
| G-37 | E testi yeniden tasarımı; parlaklık ve ters renk | E (+D) | sahip |
| G-38 | Öteki cihaz doğrulamaları (HealthKit, İlk Bakış sayacı, Bug 21…) | E | sahip |
| G-39 | "Şimdi 1: TestFlight derlemesi" | D | belge |
| G-40 | YAPILACAKLAR'ın "Sonsuz yol" bölümü eskidi | D | belge |
| G-41 | Bug 21 (320 px taşma) belgede hâlâ açık | D (+E) | belge |
| G-42 | Bildirim bölümünde eski maddeler | D | belge |
| G-43 | Alarm bölümünde eski satırlar | D | belge |
| G-44 | İlk Bakış ve 4 soru Gelişim'de (kısmen yapıldı) | D | belge |
| G-45 | Gabor ve uyku süresi: karar verildi | D | belge |
| G-46 | HATA_GUNLUGU'nda kapanmış hatalar "AÇIK" görünüyor | D | belge |
| G-47 | ANA_BELGE belge haritası eskidi | D | belge |

---

## A · Bitmemiş, kimse yapmıyor

### G-01 · Sürüm notunda eksik maddeler — A
- **Kanıt:** Kural `releases.js:3`: "her yeni commit dizisi … buraya bir madde ekler". `'2026-09-29-2'` (`:11-31`) yalnız
  şunları içeriyor: (b), Bug 32 ve Bug 31 ile taşınan beş madde. Sürüm notunda karşılığı olmayan kullanıcıya görünür değişiklikler:
  1. `0b076ba`'daki üç hata düzeltmesi: 5. gün raporundaki fiil, PDF'te güven aralığının yönü ve Gelişim kutucuğundaki
     işaret. Sahip bunları onayladı (`a225142`; `yoga-pilot/SAHIP_ISTEKLERI.md:62-64`).
  2. `6ea6890`: 5. gün raporunda "−0,0" yerine "değişmedi: 0,0".
  3. `ecdee4f`: kanıt kartı, doktor raporu ve İlk rapor cümlesindeki Türkçe düzeltmeler.
  4. Y1: nefes yolda 1-2-3 dk, göz merdiveni, "Yeni" rozeti (`6ea6890`) ve büyük düğmenin durağın süresini açması (`70ca7d5`).
  5. Yoga ilk bölümü (`yoga.md` Y-09).
  `grep -in "yoga\|merdiven" app/src/lib/releases.js` yalnız yorum satırı döndürüyor (:14, :19).
- **Sonraki adım:** Build 60'tan önce maddeler `'2026-09-29-2'`ye yazılsın (henüz yayımlanmadı). İstenirse başlığı güncellenir.
  Yoga ve Y1 maddeleri kendi iş akışları kapanınca eklensin.
- **Kimin işi:** Build 60'ı hazırlayan kod oturumu.

### G-02 · Sonraki TestFlight'ın (Build 60) kontrol listesi yok — A (+C)
- **Kanıt:** "Şimdi" listesinde Build 60 maddesi yok (`YAPILACAKLAR.md:11-47`). Ön koşullar dağınık:
  1. Swift değişti ama derlenmedi: `git diff --stat 26419b4 HEAD -- app/ios` → `AlarmPlugin.swift` +1024,
     `FeedbackPlugin.swift`, `SpeechPlugin.swift`. `0b076ba` ve `58fa1c1` iletileri "Swift derlenmedi" diyor.
  2. Yoga sesleri uygulamada yok: `app/public/yoga`'da yalnız `ders2-15.*` var (`yoga.md` Y-01).
  3. Nef sunucusu `97f2f87`'den beri yayımlanmadı. Oysa `coachCore.js` değişti (`git diff 97f2f87 HEAD -- app/src/lib/coachCore.js`:
     yoga satırları ve "Yoga" eylemi). Sunucu istemi bu dosyadan alıyor (`api/coach.js:5`); ayrıntı `yoga.md` Y-16.
  4. Sürüm notu eksik (G-01).
  5. B iş akışları sürüyor (G-17, G-18).
- **Sonraki adım:** YAPILACAKLAR'a sıralı bir "Build 60" maddesi yazılsın: B işleri bitince sırasıyla sesler ve sürüm notu,
  Mac'te Swift derlemesi, `coach-setup.sh` (sunucu) ve `testflight.sh`.
- **Kimin işi:** Listeyi orkestratör yazar. Mac'teki derleme ve yükleme sahibin işi (C).

### G-03 · Yeni hatalar HATA_GUNLUGU'na işlenmedi — A
- **Kanıt:** `ANA_BELGE.md:76`: "Her hata HATA_GUNLUGU.md'ye işlenir". Son kayıt Bug 32 (`HATA_GUNLUGU.md:789`).
  `grep -n "güven aralığı\|FirstReport\|Bug 3[3-9]" HATA_GUNLUGU.md` boş dönüyor. Kayıtsız kalanlar: G-01'deki üç düzeltme ve
  "−0,0" düzeltmesi. Yoganın 15 bulgusu yalnız `yoga-pilot/C_DOGRULAMA_RAPORU.md`'de (`58fa1c1`).
- **Sonraki adım:** Bug 33–36 kayıtları eklensin; yoga bulguları için rapora gönderme yazılsın.
- **Kimin işi:** belge.

### G-04 · Kırpma, Yılan, Çemberler ve okuma ölçümleri Gelişim'de yok — A
- **Kanıt:** `grep -rn "metrics" modules/{blink,snake,track,reading}/manifest.js` boş. `metrics` yalnız breath-count,
  fark-ettin, notice, quick-look, tek-bakis, yoga ve yon modüllerinde var. `lib/progress.js`'te "reading" geçmiyor.
  Belgedeki karşılıkları: `YAPILACAKLAR.md:408`, `:410`, `:411` (hepsi `[ ]`).
- **Sonraki adım:** Y2'ye ("ölçü kuralı v2, okuma"; `tasarim/SONSUZ_YOL.PLAN.v1.md` §I) açıkça bağlansın.
- **Kimin işi:** Y2 kod oturumu (henüz sırası gelmedi).

### G-05 · Mola ve su günlüğü takvimde görünmüyor — A
- **Kanıt:** `screens/Calendar.jsx:4` yalnız `lib/calendar.js`'i alıyor; `habitLog` yalnız `lib/dataHub.js:20`'de kullanılıyor.
  Belgede `YAPILACAKLAR.md:412`.
- **Sonraki adım:** Takvim günlerine mola ve su kayıtları eklensin (seriye ve hedefe sayılmadan).
- **Kimin işi:** kod.

### G-06 · "Şefkatle ele al" aracının ölçümü yok — A
- **Kanıt:** `modules/yon/manifest.js:20-25`'teki metrics yalnız `yon-ayna`; `sefkat` aracının (:8) ölçüsü yok.
  Belgede `YAPILACAKLAR.md:413`.
- **Sonraki adım:** Kanıta uygun bir ölçüm var mı, PubMed'de bakılsın.
- **Kimin işi:** araştırma.

### G-07 · Kurulumdaki ve 28. gündeki iris veri merkezine bağlı değil — A
- **Kanıt:** `lib/iris.js` yalnız `./profile.js`'i alıyor (`:4`). `dataHub` ve `growthMap` ne iris.js'te ne de
  `IrisPlan`/`IrisRecheck`'te geçiyor. Belgede `YAPILACAKLAR.md:388-389` ve `:398`.
- **Sonraki adım:** 28. gün karşılaştırması `dataHub.growthMap`'ten beslensin.
- **Kimin işi:** kod.

### G-08 · Yaş kapısı hesaptan sonra geliyor — A
- **Kanıt:** `lib/setupFlow.js:18-19`'da `'account'`, `'onboarding'`den önce. "Seni tanıyalım" (doğum tarihi) daha sonra
  `App.jsx`'te geliyor (`setupFlow.js:1-3`). `YAPILACAKLAR.md:442-443`: "18 altı kişinin hesabı sunucuda açılıyor, sonra
  durduruluyor". (b) bu sırayı değiştirmedi.
- **Sonraki adım:** Y3'ün ilk kurulum tasarımına alınsın ya da sahibe tek soru olarak sorulsun.
- **Kimin işi:** kod (Y3).

### G-09 · "Seri yok, baskı yok" metni seri kararıyla çelişiyor — A
- **Kanıt:** Metin `screens/Calendar.jsx:34`'te duruyor. Sahip "Seri KALIR" dedi (`YENIDEN_DUSUNME.md:8`); belgede
  `YAPILACAKLAR.md:445`. Sonsuz yol kararı 5(d) "kırık seri gizlenir" (`tasarim/SAHIP_ISTEKLERI.md:77-78`).
- **Sonraki adım:** Metin Y3'te 5(d) ile birlikte yeniden yazılsın.
- **Kimin işi:** kod (Y3).

### G-10 · Profilim'de iris haritasını yeniden açan satır yok — A (yarısı D)
- **Kanıt:** `App.jsx:794-795`: IrisPlan yalnız `irisPlanSeen` yokken bir kez açılıyor. `ProfileHome.jsx`'te iris satırı yok.
  Maddenin ikinci yarısı ("Gelişim'de 7 alanla iris bağı") `ee417db` ile yapıldı (`YAPILACAKLAR.md:379-381`).
- **Sonraki adım:** Profilim'e satır eklensin; belgede ikinci yarı kapatılsın.
- **Kimin işi:** kod + belge.

### G-11 · Nef, zamanı gelmemiş okuma testini önerebiliyor — A
- **Kanıt:** `lib/coachCore.js:82`'deki eylem listesinde "Okuma testi" var; okuma zamanı sinyali yok (okumaya ilişkin tek
  alan `readingWpm`, `:23`). Açık `YAPILACAKLAR.md:133-134`'te not edilmiş, ama iş olarak yazılmamış.
- **Sonraki adım:** `weeklyDue` gibi bir `readingDue` sinyali eklensin (Y6, Nef aşaması).
- **Kimin işi:** kod (Y6).

### G-12 · Stres ve öz-şefkat seçenekleri tam metinden doğrulanmadı — A
- **Kanıt:** `lib/profile.js:79` ve `:83`'te "VARSAYIM: tam metinden doğrulanacak". Belgede `YAPILACAKLAR.md:440`.
- **Sonraki adım:** Elo 2003 ve Zhang 2022 tam metinleri okunsun, seçenekler düzeltilsin.
- **Kimin işi:** araştırma.

### G-13 · Hatırlatma ve alarm tek planda birleşmedi; "nefesle kapanma" işi başlamadı — A
- **Kanıt:** `YAPILACAKLAR.md:242-243` `[ ]`. Nefesle kapanma "onaylandı … ayrı iş" (`:289`), ama depoda bu işin planı ya da
  kodu yok (grep yalnız YAPILACAKLAR'ı buluyor).
- **Sonraki adım:** İki iş için ayrı plan maddesi açılsın. %25'lik sessiz gün oranı için G-27'ye bakın.
- **Kimin işi:** tasarım ve araştırma.

### G-14 · Klasik alarm tonları yok — A (düşük)
- **Kanıt:** `lib/alarmSounds.js:14-20`'de telefonun sesi, üç uyandırma sesi ve üç Dalga sesi var; klasik ton yok.
  Belgede `YAPILACAKLAR.md:269-270`.
- **Sonraki adım:** Önce gerçekten isteniyor mu, bu netleşsin; isteniyorsa pakete ton eklensin.
- **Kimin işi:** ses.

### G-15 · `lib/ics.js` yalnız testinde kullanılıyor — A (düşük)
- **Kanıt:** `grep -rln "from './ics" app/src` yalnız `lib/ics.test.js`'i buluyor. Belgede `YAPILACAKLAR.md:474`.
- **Sonraki adım:** Dosya ve testi silinsin (B işleri bittikten sonra).
- **Kimin işi:** kod.

### G-16 · Birikmiş iş (sırası gelmedi) — A
- **Kanıt:** Veri merkezi 3 ve 4 (`YAPILACAKLAR.md:392-395`); Ekran Süresi §2 (`:497-507`); yürüyüşte sessiz günler için
  native bekçi (`:464-467`); çalışma günleri bildiriminde ≤60 sn iptali (`:479`); İngilizce site ve ön-üretim (`:539`);
  i18n (`:571`). Y2–Y6, (d) ve (e) için `sonsuz.md` A8.
- **Sonraki adım:** Hiçbiri acil değil; sırayı sahip belirler. Belgede "birikmiş iş" başlığı altında toplansın.
- **Kimin işi:** sırası gelince kod.

## B · Bitmemiş, şu an çalışan bir işte

### G-17 · Yoga ekranlarının 5 saniye yeniden tasarımı — B
- **Kanıt:** Görevde çalışan iş olarak yazılı. `yoga.md` Y-13. Y3 bulgusu `tasarim/Y3_NOTLAR.md:3-11`.
- **Sonraki adım:** Bitince G-01 (yoga maddesi) ve G-02.
- **Kimin işi:** yoga iş akışı.

### G-18 · Y1'in 5 saniye turu (Ana sayfa, yol, Nefes) — B
- **Kanıt:** `70ca7d5` "ara kayıt"; `6ea6890` iletisi "Y1 5 saniye sınaması sürüyor". `sonsuz.md` B1.
- **Sonraki adım:** Bitince G-01 (Y1 maddesi) ve S2 cihaz kapısı.
- **Kimin işi:** Y1 iş akışı.

### G-19 · S0 tasarım sayfası (Ana sayfanın ilk 5 saniyesi, site ilk ekranı, hukukçu ve App Review soruları) — B
- **Kanıt:** `8a42d62` "soruların karara bağlanması sürüyor (ara kayıt)". `sonsuz.md` B2.
- **Not:** S0'ın hukukçu listesinde üç soru var (`tasarim/S0/hukukcu-sorulari.md:23`, `:80`, `:140`). YAPILACAKLAR'daki
  eski hukuk soruları (G-23, G-24) bu listede yok; `grep -i "lisans\|notify-log"` boş dönüyor. Bu tur, onları da aynı
  listeye eklemek için doğru yer.
- **Kimin işi:** S0 iş akışı.

## C · Sahibin kararını ya da eylemini bekliyor

### G-20 · "KANITLI" etiketi — C
- **Kanıt:** Etiket `screens/Routine.jsx:38` ve `:462`'de hâlâ duruyor. Belgede `YAPILACAKLAR.md:26`.
- **Sonraki adım:** Sahip üç seçenekten birini seçsin: kaldır / "Araştırmalı" / kalsın.
- **Kimin işi:** sahip.

### G-21 · İyi oluş dilimi hep boşa yakın — C
- **Kanıt:** `YAPILACAKLAR.md:36-38` ve `HATA_GUNLUGU.md:484-486`. Seçenekler (a), (b), (c); henüz cevap yok.
- **Kimin işi:** sahip.

### G-22 · "Bugünün görevi" haftalık hedefe ve takvime sayılıyor — C
- **Kanıt:** `modules/notice/manifest.js:27` `countsTowardGoal: false`. Ama `lib/stats.js:207` `isExerciseSession` yalnız
  `game` ve `who5`'i dışlıyor. Belgede `YAPILACAKLAR.md:39-40`.
- **Kimin işi:** sahip karar verir; uygulaması tek satırlık kod işi.

### G-23 · WHO-5: düşük puanda kriz hattı ve ticari kullanım lisansı — C
- **Kanıt:** `lib/who5.js:27` yalnız "bir sağlık uzmanıyla konuşmak iyi gelebilir" diyor. Belgede `YAPILACAKLAR.md:41-43`
  ve `:390-391` (lisans "DOĞRULANMADI").
- **Sonraki adım:** S0 hukukçu listesine eklensin (G-19).
- **Kimin işi:** sahip ve hukukçu.

### G-24 · Hukuk ve KVKK işleri — C
- **Kanıt:**
  - Bildirim günlüğü için rıza gerekir mi (`YAPILACAKLAR.md:468-470`).
  - Health rızası v2 metni (`:471-472`).
  - Gizlilik politikasının adresi boş: `screens/Paywall.jsx:16` ve `.env.example:4` `VITE_PRIVACY_URL=`; belgede `:510`.
  - Aydınlatma metni ve veri sorumlusu (`:511`).
  - Nef'in yurt dışı aktarımı (`:512-513`).
  - Sitenin gizlilik ve koşullar metinleri (`:536`).
  - Nef'e "Yön" serbest metni (`:570`).
  Sahip hukukçunun adını vermedi (`tasarim/SAHIP_ISTEKLERI.md:79`).
- **Sonraki adım:** Hepsi tek hukukçu paketinde toplansın (G-19).
- **Kimin işi:** sahip ve hukukçu.

### G-25 · App Store Connect işleri — C
- **Kanıt:**
  - Abonelik ekran görüntüleri (`YAPILACAKLAR.md:514`).
  - Sandbox satın alma denemesi (`:515`).
  - Aylık fiyat ₺99,99 görünüyor, istenen ₺89,99 (`:516`; `HATA_GUNLUGU.md:309`).
  - DSA (`:517`).
  - Sandbox hesabının e-postası (`:518`).
  - Small Business Program (`:572`).
  - "Aboneliği yönet" bağlantısı (`:562`, cihaz).
- **Kimin işi:** sahip.

### G-26 · Google ile girişin konsol adımları — C
- **Kanıt:** `YAPILACAKLAR.md:566-568`: Supabase Redirect URL, "Skip nonce", Publish app, ardından cihazda deneme.
- **Kimin işi:** sahip.

### G-27 · Alarmda açık kararlar — C
- **Kanıt:**
  - Yatma saati bildirimi "YAPILMADI, sahibinin cevabı bekleniyor" (`YAPILACAKLAR.md:355-356`).
  - v5 onayı yalnız VARSAYIM (`:352-353`).
  - Alarm kartı tek kart yuvasının dışında duruyor (`:313-314`).
  - Sessiz gün oranı %25 VARSAYIM (`:243`).
- **Kimin işi:** sahip.

### G-28 · Yol uzunluğu ve sekmeler: iki karar çelişiyor — C (+B)
- **Kanıt:** 27 Eylül kararı "4–5 durak (~11 dk)" (`YAPILACAKLAR.md:444`, `YENIDEN_DUSUNME.md:7`). Sonsuz yol kararı
  "Yol ≈ 15 dk" (`YAPILACAKLAR.md:67`). Sekmeler kodda Bugün · Gelişim · Takvim · Bilgi (`components/ui.jsx:5-10`), karar
  ise Bugün · Keşfet · Gelişim (`:446`).
- **Sonraki adım:** S0/Y3 tasarımında tek karara bağlansın; YENIDEN_DUSUNME'nin hangi maddelerinin düştüğü yazılsın.
- **Kimin işi:** sahip (tasarım S0'da sürüyor).

### G-29 · Sitenin yayını ve sahibin bakışı — C
- **Kanıt:** Site `[~]`; "Sahibi Tailscale üzerinden bakacak" (`YAPILACAKLAR.md:526-535`). Alan adı ve Vercel projesi
  alınmadı (`:538`). Destek e-postası ve SMTP (`:537`, `:571`). Site ilk ekranı Y3'e bağlı (`sonsuz.md` A6).
- **Kimin işi:** sahip.

### G-30 · ENVANTER_VE_PLAN'daki açıklar sahipsiz — C (+D)
- **Kanıt:** Belge 25 Eylül tarihli, son kaydı `ca66461` (26 Eylül). Açık kalanlar:
  - §4 kalanları: 53 Değişimi yakala, 54 Çoklu takip, Ders motoru C, Yaşam J, HealthKit nabız ve mindfulSession, 01/10/40/42
    (`ENVANTER_VE_PLAN.md:100-106`). `app/src/modules` listesinde change ya da multi-track modülü yok.
  - §11 "Yılan bakış motoru — onay bekliyor" (`:188`).
  - Build 26'nın "Yapılmadı" maddeleri (`:247`).
  Bunların hiçbiri YAPILACAKLAR'da yok.
- **Sonraki adım:** Sahip hangilerinin sürdüğünü söylesin; sürenler YAPILACAKLAR'a taşınsın, belgenin başına "tarihsel" notu düşülsün.
- **Kimin işi:** sahip (karar) ve belge.

## E · Cihazda doğrulama bekliyor

### G-31 · Build 59 cihaz listesi: (a), Bug 24–27 — E
- **Kanıt:** `YAPILACAKLAR.md:136-176`. Görülen tek şey "Bu hafta tamam" (`:81`). Bug 24, 25, 26 ve 27'de "cihazda
  doğrulanacak" yazıyor (`HATA_GUNLUGU.md:693`, `:750`, `:758`, `:713`). Ayrıca `sonsuz.md` E2.
- **Kimin işi:** sahip (Build 59 telefonda).

### G-32 · (b), Bug 31 ve Bug 32 — E (Build 60 bekliyor)
- **Kanıt:** `YAPILACAKLAR.md:178-205` "TestFlight'a girmedi". `HATA_GUNLUGU.md:778` ve `:790`.
- **Kimin işi:** sahip (G-02'den sonra).

### G-33 · Göz takibi raporu, kalibrasyon, kendini iyileştirme, Yılan — E (+C)
- **Kanıt:** `YAPILACAKLAR.md:14-21` ve `:548-561`. "RAPOR VERİSİ GELMEDİ" (`:552`, `HATA_GUNLUGU.md:382-383`). Yılan'da aşağı
  bakış "sağ" okunuyor, hâlâ AÇIK (`HATA_GUNLUGU.md:326`, `:362`).
- **Sonraki adım:** Sahip Build 59'da göz ayarını yapıp "Verileri paylaş" çıktısını göndersin.
- **Kimin işi:** sahip.

### G-34 · npm eklentileri Release'te; bildirim v2 — E
- **Kanıt:** `ios/App/App/capacitor.config.json` packageClassList: DevicePlugin, HapticsPlugin, LocalNotificationsPlugin,
  PurchasesPlugin. Planlar yalnız Debug derlemesinde geldi (`HATA_GUNLUGU.md:308`). Belgede `YAPILACAKLAR.md:22-25`,
  `:449`, `:458-463`; Mac'teki WalkGuard derlemesi `:458`.
- **Kimin işi:** sahip.

### G-35 · Simge, açılış ekranı, Gelişim haritası — E
- **Kanıt:** Bug 19 "cihazda doğrulanacak" ve `.icon` "DOĞRULANMADI" (`HATA_GUNLUGU.md:489`, `:498`). Belgede
  `YAPILACAKLAR.md:27-34`. Bunlar Build 59'da, yani sahip şimdi bakabilir.
- **Kimin işi:** sahip.

### G-36 · Alarm cihaz listesinin kalan kısmı — E
- **Kanıt:** `YAPILACAKLAR.md:367-371`. Doğrulananlar: Gün Işığı çaldı, "9 dk ertele" görünüyor (`HATA_GUNLUGU.md:672-673`),
  uyku müziği duyuldu (`:624-625`). Kalanlar:
  - Dalga seslerinin alarmda çalması (Bug 20 `:501`).
  - Haftalık tekrar.
  - "Nefona'yı aç".
  - İzin reddi.
  - Tüm verileri sil.
  - Gece saati kontrolleri (`YAPILACAKLAR.md:258-260`).
  - v3, v4 ve v5 halleri (`:290-366`).
- **Kimin işi:** sahip.

### G-37 · E testi yeniden tasarımı; parlaklık ve ters renk — E (+D)
- **Kanıt:** `YAPILACAKLAR.md:575-584` ve `:600-607`. Parlaklık maddesi için "TestFlight'tan önce doğrulanacak; doğrulanmazsa
  sürüm notundan çıkarılır" deniyor (`:600-603`; `releases.js:40-43`). Ama madde Build 58 girdisiyle zaten yayımlandı
  (`releases.js:35`, `:44`), yani belgedeki kapı geçildi.
- **Sonraki adım:** Sahip cihazda denesin. Doğrulanmazsa, madde yayımlanmış girdide olduğu için yeni girdiye bir düzeltme maddesi yazılsın.
- **Kimin işi:** sahip.

### G-38 · Öteki cihaz doğrulamaları — E
- **Kanıt:**
  - HealthKit izinleri ve adım satırı (`YAPILACAKLAR.md:485`).
  - Egzersiz sahnesi (`:544-547`).
  - İlk Bakış okuma sayacı: "SENTETİKTE EVET — cihazda doğrulanmadı" (`HATA_GUNLUGU.md:438`). (b) ile artık ilk ekran bu.
  - Bug 21: 428/390/375/320 px (`HATA_GUNLUGU.md:567-571`).
  - Bug 12 ve 13: tarih ve şehir (`:272`, `:283`).
  - Bug 8: derinlikle örtme (`:152`).
  - Alt sekme çubuğunun altından sızıntı (`tasarim/Y3_NOTLAR.md:9`).
- **Kimin işi:** sahip.

## D · Aslında bitmiş ya da karar verilmiş, belgede açık görünüyor

### G-39 · "Şimdi 1: TestFlight derlemesi (fffa276, 1a85b1c, fe06f26, ee417db)" — D
- **Kanıt:** Dört commit de Build 59'da: `git merge-base --is-ancestor <c> 26419b4` dördü için evet.
- **Sonraki adım:** Madde kapatılsın, yerine G-02 yazılsın.
- **Kimin işi:** belge.

### G-40 · YAPILACAKLAR'ın "Sonsuz yol" bölümü eskidi — D
- **Kanıt:**
  - `:49` "uygulama onay bekliyor" yazıyor; oysa plan 30 Eylül'de onaylandı (`bdbaafd`; `tasarim/SAHIP_ISTEKLERI.md:75-80`).
  - `:52` "çalışma notu, depoda değil" yazıyor; `4e6f528` ile depoda.
  - `:76` site cümlesi "sahibin onayına" yazıyor; karar 5(b) onaylı (`tasarim/SAHIP_ISTEKLERI.md:77`).
  - (c) kodda (`6ea6890`), (g) yoganın ilk bölümü kodda (`0b076ba`); ikisi de YAPILACAKLAR'da geçmiyor.
  - "Son güncelleme: 2026-09-29" (`:7`).
  - Plan §2.4'teki düzeltmeler de yapılmadı (`sonsuz.md` A1, D2).
- **Kimin işi:** belge.

### G-41 · Bug 21 (320 px taşma) belgede hâlâ açık — D (+E)
- **Kanıt:** `YAPILACAKLAR.md:44-45` "Düzeltilsin mi?", `:351` ve `:360` "şimdi 14". `HATA_GUNLUGU.md:530` "AÇIK".
  Oysa `:567-571` düzeltildi diyor; `styles/home.css:134` `.hh-day` ızgarası `max-content`. Kalan iş cihazda bakmak (G-38).
- **Kimin işi:** belge.

### G-42 · Bildirim bölümünde eski maddeler — D
- **Kanıt:**
  - `:452` "commit yok" diyor; iş `8bccf79`'da ve Build 59'da.
  - `:473` Info.plist maddesi: yürüyüş amacı zaten yazılı (`ios/App/App/Info.plist:13-14`).
  - `:475` Paywall metni: "İzin verirsen bildirimle" `8bccf79`'da kaldırıldı (`git log -S`); kurulumda
    `lib/setupText.js:56` "Bitmeden hatırlatırız" diyor.
  - `:477`: `BILDIRIM_PLANI.md:106` bu notu zaten düzeltmiş.
- **Kimin işi:** belge.

### G-43 · Alarm bölümünde eski satırlar — D
- **Kanıt:**
  - `:244` iOS 26 öncesi davranış kodda (`lib/alarmNative.js:1-9`, 7600–7607).
  - `:268` "Sahibinin kararı bekleniyor" yazıyor; `:289` "onaylandı" diyor.
  - `:273-274` "Deneme 2 sonucu bekleniyor"; sonuç geldi (`HATA_GUNLUGU.md:672-673`).
  - `:275` v1 Artifact "ONAY BEKLİYOR"; v2–v5 ile geçildi.
  - `:293` "DERLENMEDİ"; kabloyla Xcode derlemesi cihazda çalıştı (`HATA_GUNLUGU.md:623`).
  - `:305` "çalmazsa DEFAULT_SOUND = 'phone'"; şu an `'uyan-gunisigi'` (`lib/alarmSounds.js:23`).
  - `:316` "karar bekliyor"; kararlar kodda (`:329`).
- **Kimin işi:** belge.

### G-44 · İlk Bakış ve 4 soru Gelişim'de — D (kısmen yapıldı)
- **Kanıt:** `YAPILACAKLAR.md:414` "bugün yalnız IrisPlan'da" diyor. Oysa `components/ProgressOverview.jsx:240-246` ölçüsü
  olmayan satırda cevabı gösteriyor ("İlk Bakış: 20 sn'de N kırpma"; `lib/dataHub.js:26`). Kalan kısım (zaman serisi) G-04'te.
- **Kimin işi:** belge.

### G-45 · Gabor ve uyku süresi: karar verildi — D
- **Kanıt:** `YENIDEN_DUSUNME.md:127`: "Gabor … Belgeye 'ertelendi' diye yazılır"; `YAPILACAKLAR.md:447` hâlâ `[ ]`.
  Uyku süresi (`:486`, "ayrı karar"): karar 4 "Uyku, Sağlık'tan okunur" (`:64`); iş (e) aşamasında.
- **Kimin işi:** belge.

### G-46 · HATA_GUNLUGU'nda kapanmış hatalar "AÇIK" görünüyor — D
- **Kanıt:**
  - Bug 1: `:11` AÇIK, `:64` ÇÖZÜLDÜ.
  - Bug 2 ve 6: sonradan Bug 17 ve 13. denemeyle aşıldı.
  - Bug 4: `:92` AÇIK. `27738aa` "tek E testi … molaya sokuyordu; testler artık bütçeyi … tüketmez" diyerek düzeltti.
  - Bug 5: okuma testi Build 26'da yenilendi (`ENVANTER_VE_PLAN.md:244`).
  - Bug 11: `:232` AÇIK, `:381` "ÇÖZÜLDÜ (cihaz)".
  - Bug 14: `:295` kök neden, `:308` "planlar geldi".
  - Bug 20: `:501` AÇIK; "hangi ses çaldı" sorusu `:673`'te kapandı. Kalan tek iş Dalga'nın alarmda çalması (G-36).
  - Bug 22: `:537` "AÇIK"; `:624-625` cihazda doğrulandı.
  - Bug 29: `:739` "sunucu yayımı TestFlight'tan önce" ve Bug 30 `:767` "Mac'te yeniden çalıştırılacak"; ikisi de
    yapıldı (`YAPILACAKLAR.md:131-133`, `84e8b79`).
  - Başlık `:6` "Bug 1–20" diyor; son kayıt Bug 32.
- **Kimin işi:** belge.

### G-47 · ANA_BELGE'nin belge haritası eskidi — D
- **Kanıt:** `docs/ANA_BELGE.md:100-107` tablosunda `yol-haritasi/tasarim/` yok (SONSUZ_YOL.PLAN.v1 ve bağlayıcı 5 saniye
  kuralı `tasarim/SAHIP_ISTEKLERI.md:82-90`), `yoga-pilot/` de yok. `:101` "Bug 1–17" diyor. Son kayıt `b7cdccf`
  (29 Eylül).
- **Kimin işi:** belge.
