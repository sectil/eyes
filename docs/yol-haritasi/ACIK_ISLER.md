# Nefona · açık işler (birleşik liste, 2026-09-30)

> Denetim anı: `155370e`. Sonrası: Y1 bitti (`e71abe6`; ekranlar 5 sn kapısını geçmedi, `tasarim/Y1_5SN_SONUCLARI.md`); sahip kararları `f810065` (ana sayfa şimdi yeniden tasarlanır ve TestFlight beklemez; 28 Eylül notları gösterilir; site son aşama). Görev listesi aynı gün kanıtla düzeltildi: simge, açılış, alarm, WHO-5, E testi sesi ve gece saati işlerinin kodu bitmiş, yalnız cihaz kontrolleri açık.

## Özet
1. Salt okunur denetim. HEAD `155370e` (Y1 turu 3, ara kayıt, 11.22). Kaydedilmemiş tek değişiklik `modules/yoga/text.js`'te (yoga turu).
2. Beş rapordaki 127 madde birleştirildi (tekrarlar dahil). Sonuç: 17 A, 18 C, 10 E, 2 B (S0 turu kapandı), 12 D.
3. En büyük açık: yoganın ilk bölümünde 11 ders hazır ve sahip onaylı, ama uygulamada yalnız eski Ders 2 · 15 var (A1–A2).
4. Yeni ders çizelgeleri oynatıcıyla uyumsuz. Oynatıcı düzeltilmeden yayımlanırsa "Kapanışa geç" dersi ortadan böler (A1).
5. Build 59'dan sonra 15 uygulama kaydı birikti, hiçbiri TestFlight'ta değil. Build 60 için sıralı bir liste de yok (A4).
6. Sürüm notunda eksik maddeler var: yoga, Y1, sahibin onayladığı üç düzeltme ve Türkçe düzeltmeler (A3).
7. Nef sunucusu yoga istemini bilmiyor. Yeniden yayımı sahip yapar, ama Y1 turu kaydedilmeden yapılmamalı (C2).
8. Uyarı: `testflight.sh` ile `coach-setup.sh` dalın ucunu yükler, yani ara kayıtlar da gider. Y1 ve yoga turları bitmeden çalıştırılmamalı.
9. Sahipten en çok karar bekleyen konu hukuk: WHO-5 kriz hattı, KVKK, rıza metni ve yoganın sabah sorusu (C4).
10. Sahibin hemen yapabilecekleri: App Store fiyatını ₺89,99'a çekmek, boşta duran nefona.com'u almak, Build 59'daki cihaz listeleri.
11. Build 59'un sürüm notu cihazda denenmemiş bir özellik vaat ediyor: parlaklık ve ters renk (E2).
12. İlk bölüm MP3 olarak girerse sesler ≈ 177 MB tutar. Kodek testi paketi yok, bu yüzden kodek ve boyut kararı bekliyor (A7, C3).
13. Belgeler geride kalmış: YAPILACAKLAR'da Y1 ile yoga satırı yok, "Şimdi 1" eski, HATA_GUNLUGU'nda kapanmış hatalar açık görünüyor (D).
14. Denetim sırasında S0 turu kapandı: sayfa 5 sn kapısını geçemedi, sahibe gitmedi (C18). Alt raporlardaki iki yanlış düzeltildi (son bölüm).
15. Önerilen sıra: Y1 ve yoga turları biter → A1–A3 → A4 listesiyle Build 60 → E7–E9 cihaz denemeleri → D belge turu.

Kaynaklar `yoga.md`, `sonsuz.md`, `yolharitasi.md`, `eski.md`, `arasi.md` (bu klasörde); madde kimlikleri parantezde (Y-xx, G-xx,
sonsuz A/B/C/D/E, eski n, arası n). Yollar depo köküne göredir; `app/src/` altındaki dosyalar kısaca `lib/…`, `screens/…` diye
yazıldı. Belge yolları `docs/yol-haritasi/` altına göredir.

---

## 1. Şimdi yapılması gerekenler (A · bitmemiş, kimse yapmıyor)

İş büyüklüğü: **XS** < 1 saat · **S** 1–3 saat · **M** yarım ile bir gün · **L** 1–3 gün.

### A1. Yoga oynatıcısını yeni çizelgelere uydur · M
- **Kanıt:** `modules/yoga/timeline.js:113-121` `closingAt` ilk `returnTone`'u alıyor. Yeni çizelgelerde pencere dönüşleri de
  `returnTone`: `ders5-15` için oynatıcı kapanışı 577,45 sn sanıyor, `closing.jumpTo` ise 757,393 (Y-03a). Ders 3 ve 5'in evre
  adları açıklamalı, `timeline.js:159`, `:196` ve `BreathForm.jsx:99` yalın ad bekliyor (Y-03b). Ders 1'de `ring:in/out` var,
  `visualAt` yalnız `pulse` okuyor (`timeline.js:213`; Y-03c). Bırakma klipleri ve dosya adı sözleşmesi de açık (Y-03d, e).
- **İş:** `closing.jumpTo` okunsun, evre adı ilk sözcüğe indirilsin, `ring:*` okunsun, her çizelgeye birim testi eklensin.
- **Zamanlama:** dosyalar yoga tasarım turunun alanında, o tur bitince yapılmalı. A2'den önce gelir.

### A2. İlk bölümün seslerini uygulamaya koy, eski Ders 2 · 15'i değiştir · M
- **Kanıt:** `ls app/public/yoga` yalnız `ders2-15.mp3` ve `.timeline.json` gösteriyor. `lib/yogaLessons.js:134` tek
  `published: true`, `:186` `musicTailFile: null`. Uygulamadaki dosyanın sha256'sı `726417fa…`: bu, pilotun A adımı karışımı.
  Onaylı dosya `render/out/ilk-bolum/ders2-15.mp3` ise `c875dcef…` (Y-02, arası 9). Uygulamadaki çizelgede mutlak `/tmp` yolu
  var (`app/public/yoga/ders2-15.timeline.json:2`). Sahip onayı `yoga-pilot/SAHIP_ISTEKLERI.md` madde 10, 17–18'de.
  `yoga-pilot/DEVAM.md:81`: "Dosyaları uygulamaya koymak kod oturumunun işi".
- **İş:** 11 karışım, çizelgeler ve `ders3-kuyruk.mp3` kopyalanır. `contentHash`, `sections`, `musicTailFile` ve `published`
  doldurulur, testler koşulur.
- **Kimin:** kod oturumu (şu an yok). A1'den sonra, `lib/` ve `public/` ile sınırlı çalışılır.

### A3. Sürüm notunu tamamla · S
- **Kanıt:** Kural `lib/releases.js:3`. `'2026-09-29-2'` (`:11`) Build 59'da yok (`git show 26419b4:app/src/lib/releases.js | grep -c
  2026-09-29-2` → 0), yani eklemek serbest. Maddesi olmayanlar: `0b076ba`'daki üç onaylı düzeltme (`a225142`), `6ea6890`'daki
  "değişmedi: 0,0", `ecdee4f`'teki Türkçe düzeltmeler, Y1 ve yoga. `releases.js`'te yoga maddesi yok (G-01, Y-09, arası 5).
- **İş:** üç düzeltme ve Türkçe maddeler şimdi yazılabilir. Y1 ve yoga maddeleri turları bitince, metin kapısından geçerek eklenir.
- **Kimin:** Build 60'ı hazırlayan kod oturumu.

### A4. Build 60 için sıralı kontrol listesi yaz · S (belge)
- **Kanıt:** "Şimdi" listesinde Build 60 maddesi yok (`YAPILACAKLAR.md:11-13`). `git log 26419b4..HEAD -- app/` 15 kayıt
  döndürüyor. Swift değişti ama derlenmedi (`AlarmPlugin.swift` +1024; `0b076ba`, `58fa1c1` iletileri). `app/scripts/testflight.sh:27`
  `git pull --ff-only` ile dalın ucunu derliyor. `app/scripts/coach-setup.sh:77` `git archive … HEAD` yüklüyor; uçta ara kayıtlar
  var (`155370e`, `93dd037`, `70ca7d5`). Site Y1 ile aynı gün yayınlanmalı (`tasarim/Y1_KOD_RAPORU.md:62`, `:196-197`), bu koşul hiçbir yerde
  yazılı değil (G-02, eski 14, arası 1, sonsuz A6).
- **İş:** YAPILACAKLAR'a şu sırayla yazılsın: Y1 ve yoga turları kaydedilir → A1–A3 → Mac'te Swift derlemesi → `coach-setup.sh` →
  Vercel dosya listesi denetimi → `testflight.sh`. Ayrıca "site yalnız Y1 sürümüyle yayınlanır" koşulu eklensin.
- **Kimin:** orkestratör.

### A5. HATA_GUNLUGU'na yeni hataları işle · XS–S
- **Kanıt:** Kural `docs/ANA_BELGE.md:76`. Son kayıt Bug 32 (`HATA_GUNLUGU.md:789`). `0b076ba`'daki üç düzeltme ve "−0,0"
  düzeltmesi kayıtsız. Yoganın 15 bulgusu yalnız `yoga-pilot/C_DOGRULAMA_RAPORU.md`'de (G-03).
- **İş:** Bug 33–36 yazılsın, yoga bulguları için rapora gönderme konsun.
- **Kimin:** belge.

### A6. Y1 metin kapısı: iki bağımsız dil incelemesi · S
- **Kanıt:** 3 cümle ve NIT #23 kapıyı bekliyor (`tasarim/Y1_KOD_RAPORU.md:154-167`, `:77`). Kapı plan §H'de tanımlı
  (`SONSUZ_YOL.PLAN.v1.md:1216-1220`). Yapıldığına dair kayıt yok (sonsuz A3).
- **Zamanlama:** Y1 turu bitince, çünkü tur bu metinleri değiştirebilir. Sonuç sahibe gider (C5).
- **Kimin:** dil inceleme ajanları.

### A7. WAV ana kopyaları yeniden üret, kodek testi paketini hazırla · L (kredi harcamaz)
- **Kanıt:** Ana kopyalar "depoya girmez" (`yoga-pilot/render/tools/mixib.py:10`) ve bu ortamda yok (Y-05). AAC MP3'ten
  kodlanamaz (SPEC.v3:397). Test paketi yok: `git ls-files | grep parca` boş, `yoga-pilot/b/mac/kodek_testi.sh:15-16` girdi yoksa
  çıkıyor. `DEVAM.md:33-34` bunu açık diye yazıyor. Mac ölçüm betiği de yok (SPEC.v3 §14.4). Boyut: ilk bölüm MP3 olarak
  girerse `public` + `Sounds` ≈ 177,4 MB (Y-01'deki hesap).
- **İş:** `mixib.py` ile ana kopyalar yeniden üretilir ve onaylı MP3'lerle eşitlik ölçülür. Üç kesit (`parcaN.wav/.mp3`) ve Mac
  betiği hazırlanır. WAV'lar sahibin Mac'ine ve buluta gider.
- **Kimin:** render/ses oturumu. Ardından sahip (C3).

### A8. Yoga yardımcı sesleri ve "Kaldığın yerden" kartı · M
- **Kanıt:** `DEVAM.md:76` "SPEC §10 yardımcı dosyaları … kurulmadı". `modules/yoga/Yoga.jsx:33` `SOUND_CHECK_FILE = null`,
  `lib/yogaLessons.js:39` `intro` "henüz yok". `yoga-pilot/C_KOD_RAPORU.md:166`, `:168`: `gozolcum:yoga-resume` yok.
  Gereken birimler zaten seslendirildi (`render/_kalici/sel/hoc/d01/…`), yani ücretli çağrı gerekmiyor (Y-06, Y-07).
- **Kimin:** önce render oturumu (karışım), sonra kod oturumu (yoga turundan sonra).

### A9. Ders kaynaklarını `sources.js`'e ekle, kartta çalışma türünü göster · S–M
- **Kanıt:** `lib/sources.js:247-254`'te yoga için yalnız `luu2024` var. PMID'ler yalnız `yogaLessons.js`'te. Eksik
  `C_KOD_RAPORU.md:172`'de yazılı (Y-08).
- **Kimin:** kod oturumu. Türler PubMed MCP ile doğrulanır.

### A10. 90. günden sonraki haftalık odağı bir aşamaya bağla · XS (plan)
- **Kanıt:** Plan konuyu anlatıyor (`SONSUZ_YOL.PLAN.v1.md:33`, `:55-57`), ama §G.3 tablosunda (`:1146-1151`) yok. Kodda da yok
  (`grep -i 'odak|focus' lib/progression.js lib/ladders.js` boş). `Y1_KOD_RAPORU.md:192-193` bunu açıkça yazıyor (sonsuz A5).
- **Öneri:** Y2'ye bağlansın, sahibe tek cümleyle söylensin (C6).
- **Kimin:** orkestratör.

### A11. Gelişim ve veri merkezi boşlukları · M (toplam)
- **Profilim'de iris satırı yok:** `App.jsx:794-795` IrisPlan'ı yalnız bir kez açıyor, `ProfileHome.jsx`'te satır yok (G-10).
- **Kurulumdaki ve 28. gündeki iris veri merkezine bağlı değil:** `lib/iris.js:4` yalnız `profile.js`'i alıyor. Belgede
  `YAPILACAKLAR.md:388-389`, `:398` (G-07).
- **Mola ve su günlüğü takvimde görünmüyor:** `screens/Calendar.jsx:4` yalnız `lib/calendar.js`'i alıyor. Belgede `YAPILACAKLAR.md:412` (G-05).
- **Kimin:** kod (B işleri bittikten sonra).

### A12. Sonraki aşamalara bağlanacak işler · S (plan notu; kodu aşamasında)
- **Kırpma, Yılan, Çemberler ve okumanın Gelişim ölçümleri → Y2:** `modules/{blink,snake,track,reading}/manifest.js`'te `metrics`
  yok. Belgede `YAPILACAKLAR.md:408-411` (G-04).
- **Yaş kapısı hesaptan sonra geliyor → Y3:** `lib/setupFlow.js:18-19`, `YAPILACAKLAR.md:442-443` (G-08).
- **"Seri yok, baskı yok" metni → Y3:** `screens/Calendar.jsx:34` ile "Seri KALIR" kararı çelişiyor (`YENIDEN_DUSUNME.md:8`; G-09).
- **Hap kontrastı 4,47:1, avatar harfi 3,25:1 → Y2:** `tasarim/S0/ekranlar-inceleme.md:84` (sonsuz A9).
- **Nef zamanı gelmemiş okuma testini önerebiliyor → Y6:** `lib/coachCore.js:82`, `YAPILACAKLAR.md:133-134` (G-11).
- **Nef'in 10 modül sınırı → Y6 ya da `coach()` veren ilk yeni modül:** `lib/coachCore.js:44` `slice(0, 10)`. Bugün 9 modül var,
  yoga sonuncu. Sınırın 16'ya çıkması planda (`SONSUZ_YOL.PLAN.v1.md:1151`) (arası 10, Y-19).
- **Kimin:** orkestratör (PLAN v1.1, bkz. D4).

### A13. Araştırma doğrulamaları · M
- Stres ve öz-şefkat seçenekleri tam metinden doğrulanmadı: `lib/profile.js:79`, `:83` "VARSAYIM" (G-12).
- "Şefkatle ele al" aracının ölçümü yok: `modules/yon/manifest.js:20-25` (G-06).
- `az-hareket` ve `goz-yorgun` kartlarının PubMed doğrulaması yapılmadı (`SONSUZ_YOL.PLAN.v1.md:1254`, `:809-810`). Y4'ten önce
  bitmesi yeter (sonsuz A7).
- **Kimin:** araştırma ajanı.

### A14. Kalan altı yoga dersi: Parti 2 metni ve defter · L
- **Kanıt:** `yoga-pilot/b` altında yalnız ders 1, 2, 3 ve 5 var (Y-10). Defter tutmuyor: hesap 133.485, defter 132.745
  (`DEVAM.md:70-72`; Y-11).
- **İş:** önce defter eşitlenir (S). Sonra Ders 4, 7 ve 8'in metni yazılır, iki model incelemesinden geçer (0 kredi).
  Seslendirme sahip kararıyla yapılır (C16).
- **Kimin:** metin oturumu (yeni) ve render oturumu (defter).

### A15. Alarm ve bildirim işleri · M–L
- **Tek "Hatırlatma ve alarm" planı yok:** `YAPILACAKLAR.md:242-243`. `docs/yol-haritasi/BILDIRIM_PLANI.md`'de "alarm" geçmiyor (G-13, eski 5b).
- **"Nefesle kapanma" onaylandı ama başlamadı:** `YAPILACAKLAR.md:289`. `grep -rli "nefesle kapan" app/src` boş (eski 5g).
- **Alarm sesleri büyük:** `ios/App/App/Sounds/` 6 × 4.321.868 bayt ≈ 26 MB sıkıştırılmamış CAF. Sahip 10'dan fazla ses istiyor (`:246`; eski 5e).
- **Klasik ton yok:** `lib/alarmSounds.js:14-20`. Önce sahibin hâlâ isteyip istemediği sorulur (C9; G-14, eski 5d).
- **Kimin:** tasarım, araştırma ve ses.

### A16. Küçük temizlik · XS–S
- `lib/ics.js` yalnız testinde kullanılıyor (`YAPILACAKLAR.md:474`; G-15). Silinebilir.
- Uyku kısılma MP3'leri iOS paketinden çıkarılabilir (`app/public/sleep/sakin-fade-*.mp3`; PLAN.v3 karar 6; Y-12). A7'deki boyut
  kararıyla birlikte yapılır.
- Saat dilimine bağlı test: `trend.weekly.test.js:211` Asia/Tokyo'da bir saatte düşüyor (`yoga-pilot/C_KOD_RAPORU.md:184-186`).
  YAPILACAKLAR ya da HATA_GUNLUGU'nda kaydı yok.
- Y1'in 20.000 bağlamlık eşdeğerlik ve benzetim düzenekleri depoda değil, karalama alanında (`Y1_KOD_RAPORU.md:109-110`).
  Y2 de bunlara dayanacak, depoya alınmalı (sonsuz A4, daraltıldı; bkz. son bölüm).

### A17. Birikmiş iş (sırası gelmedi, yalnız kayıt)
- Y2–Y6: yeni dosyaların hiçbiri yok (`lib/dayOpen.js`, `lib/sky.js`, `modules/gunun/` …). Sıra plana uygun (sonsuz A8).
- Veri merkezi 3–4 (`YAPILACAKLAR.md:392-395`), Ekran Süresi (`:497-507`), yürüyüş bekçisi (`:464-467`), ≤60 sn iptal (`:479`),
  İngilizce site (`:539`), i18n (`:571`) (G-16). Sırayı sahip belirler.

---

## 2. Sahibin kararı ya da eylemi (C)

### C1. Build 60'ı Mac'te derle ve yükle
- **Kanıt:** Son TestFlight Build 59 (`26419b4`, `YAPILACAKLAR.md:131`). Swift değişti ama derlenmedi (A4).
- **Önerilen karar:** Y1 ve yoga turları kaydedilip A1–A3 bitmeden komut verilmesin. Sonra önce Xcode'da Swift derlemesi yapılsın, ardından `testflight.sh`.

### C2. Nef sunucusunu yeniden yayımla
- **Kanıt:** Yoga satırları `0b076ba` ile `lib/coachCore.js:78-82`'ye girdi. Sunucu istemi bu dosyadan alıyor (`app/api/coach.js:5`).
  Son yayım `97f2f87` (`YAPILACAKLAR.md:131-132`), yogadan önce. Sunucunun süzgeci sağlık iddiasını yakalamıyor, yasak yalnız
  istemde (`coachCore.js:91-100`) (Y-16, arası 1).
- **Önerilen karar:** Y1 turu kaydedilince ve Build 60'tan hemen önce `bash app/scripts/coach-setup.sh` çalıştırılsın. Sonra
  Vercel dosya listesinde `public/yoga` olmadığına bakılsın (`app/.vercelignore`; arası 2).

### C3. Kodek kör dinlemesi ve indirme boyutu (karar 6)
- **Kanıt:** Karar kuralı SPEC.v3 §14.3'te. Defterde `kodek-karari` satırı yok. Boyut ölçüm derlemesi yapılmadı (PLAN.v3
  `:163-167`, `:1047`) (Y-14, Y-15).
- **Önerilen karar:** A7'deki paket gelince 6 deneme kör dinlensin, SPEC kuralı uygulansın. Boyut, yer tutucu dosyalarla yapılan
  bir derlemeyle App Store Connect'ten okunsun. O zamana kadar dosyalar MP3 kalır (`DEVAM.md:33`).

### C4. Hukukçu paketi (tek gönderim)
- **Kanıt:**
  - Hukukçunun adı verilmedi (`tasarim/SAHIP_ISTEKLERI.md:78-79`). S0'ın üç sorusu hazır ama gönderilmedi (`tasarim/S0/hukukcu-sorulari.md:1-4`).
  - WHO-5: kriz hattı ve ticari lisans (`YAPILACAKLAR.md:41-43`, `:390-391`; G-23).
  - KVKK ve gizlilik: bildirim günlüğü, Health rızası v2, boş `VITE_PRIVACY_URL` (`screens/Paywall.jsx:16`), aydınlatma metni,
    yurt dışı aktarım, site metinleri (`YAPILACAKLAR.md:468-472`, `:510-513`, `:536`; G-24).
  - Yoga: dört sayının mevcut rızaya girip girmediği (`lib/consent.js:64`; Y-19). Telefonda kalan sabah uyku cevabı için rıza
    gerekip gerekmediği (`site/pages/gizlilik.html:36`; arası 3). Zorlanma cevabı `hard` dışa aktarılmıyor (arası 8).
  - `YOL.nef.md:627-631`: düşük WHO-5'te kriz hattı (sonsuz C5).
- **Önerilen karar:** sahip bir hukukçu adı versin. Bütün sorular S0'ın hukukçu listesine tek pakette eklensin. Son tarih Y4'ün
  S5 kapısı (plan `:190`). App Store Connect → App Privacy'deki Nef beyanını sahip kendisi görsün.

### C5. Metin onayları
- **Kanıt:** Yoganın yeni arayüz metinleri, Ders 3 açılışı, bölüm adları ve `YT.done.lesson4` (`C_KOD_RAPORU.md` §6, §7-6, §7-7;
  `C_DOGRULAMA_RAPORU` §4). INCELEME açık 2 ve 5 (Y-17). Y1'in 3 cümlesi (A6) ve sitenin iki Y1 cümlesi (`site/pages/index.html:93-94`; arası 7).
- **Önerilen karar:** karar 2'nin yedeği uygulansın: iki bağımsız model incelemesi, ardından sahibe tek soru kartı.

### C6. Y1 raporunda sahibe söylenecekler
- **Kanıt:** `Y1_KOD_RAPORU.md:171-193`: 629 değil 230; 20 dakikalık sınırda açılan yer; 2. günün molası; benzetim farkı;
  `stepIds`; kod ajanlarının dört kararı. Ek olarak 90+ odak (A10). `tasarim/SAHIP_ISTEKLERI.md`'de bunların kaydı yok (sonsuz C4).
- **Önerilen karar:** kod ajanlarının kararları kabul edilsin. Tur bitince tek mesaj gitsin, cevaplar `SAHIP_ISTEKLERI.md`'ye yazılsın.

### C7. S0 soruları: yoga sabah kartının yeri ve App Review
- **Kanıt:** Madde 19 sahibe kalan tek soru (`tasarim/S0/sorular-kararlar.md:23-52`). App Review için plan "sen gönderirsin"
  diyor (`SONSUZ_YOL.PLAN.v1.md:194-196`), belge "gönderilmeyecek" diyor (`tasarim/S0/app-review-sorusu.md:1-7`) (sonsuz C1, C3).
- **Önerilen karar:** kart ilk dokunuştan sonra, büyük düğmenin altında dursun. App Review sorusu gönderilmesin, yedek kural
  (başlıkta yalnız ay) geçerli olsun. Plan §H buna göre düzeltilsin (D4).

### C8. Gelişim kararları
- **"KANITLI" etiketi:** `screens/Routine.jsx:38`, `:462`; `YAPILACAKLAR.md:26` (G-20). **Öneri:** "Araştırmalı" olsun.
- **İyi oluş dilimi hep boşa yakın:** `YAPILACAKLAR.md:36-38` (G-21). **Öneri:** (a), yani son 14 günde WHO-5 cevabı varsa dolu sayılsın.
- **"Bugünün görevi" haftalık hedefe sayılıyor:** `modules/notice/manifest.js:27` `countsTowardGoal: false`, ama `lib/stats.js:207`
  bunu dışlamıyor (G-22). **Öneri:** sayılmasın. Kodu tek satır.
- **Rekor kutusu "Yoga · pratik yapılan gün":** kutu `summary().bests` kalıbına uymuyor (`C_KOD_RAPORU.md:169-171`; Y-18).
  **Öneri:** ilk yayına alınmasın, Y2'nin ölçü kuralıyla birlikte ele alınsın.
- **`verifiedChange` yoga puanlarını sayıyor:** `lib/dataHub.js:151-163` (Y-19). **Öneri:** olduğu gibi kalsın. Her modüle aynı
  kural uygulanıyor ve yalnız anlamlı etki (`e.sig`) sayılıyor.

### C9. Alarm ve bildirim kararları
- **Kanıt:** Yatma saati bildirimi "YAPILMADI, sahibin cevabı bekleniyor" (`YAPILACAKLAR.md:355-356`). v5 onayı VARSAYIM (`:352-353`).
  Alarm kartı tek kart yuvasının dışında (`:313-314`). Sessiz gün oranı %25 VARSAYIM (`lib/notifyPlan.js:16`). Klasik ton isteği (`:269-270`) (G-27, eski 5b, 5f, 5h).
- **Önerilen karar:** v5 ve %25 onaylansın, cihaz verisi gelince yeniden bakılsın. Yatma saati bildirimi A15'teki birleşik plana
  bırakılsın. v5'te büyük kart kalktığı için kart yuvası sorusu kapandı sayılsın; sahibe tek cümleyle teyit ettirilsin. Klasik
  ton hâlâ isteniyor mu, sorulsun.

### C10. Now Playing iOS önerilerine gidiyor (S3)
- **Kanıt:** `yoga-pilot/C_DOGRULAMA_RAPORU.md:44`, `:107`. `AlarmPlugin.swift`'te `ExcludeFromSuggestions` yok (Y-20).
- **Önerilen karar:** evet, çıkarılsın. İş tek satır (iOS 18+) ve Build 60'taki Swift derlemesinde doğrulanır.

### C11. Ses ve müziğin ticari kullanım koşulları
- **Kanıt:** PLAN.v3 §G (`:1100-1101`). Ses ve müzik seçimi VARSAYIM (SPEC.v3:506) (Y-21).
- **Önerilen karar:** App Store'a çıkmadan önce ElevenLabs planının ticari kullanım ve Music koşulları okunup kaydedilsin.

### C12. App Store Connect işleri
- **Kanıt:** Aylık fiyat ₺99,99 görünüyor, istenen ₺89,99 (`YAPILACAKLAR.md:516`). Uygulama fiyatı RevenueCat'ten gösteriyor
  (`lib/subscription.js:140`). Ayrıca abonelik ekran görüntüleri, Sandbox denemesi, DSA, Sandbox e-postası, Small Business
  Program (`:514-518`, `:572`) (G-25, eski 8).
- **Önerilen karar:** fiyat hemen ₺89,99'a çekilsin. Kalanlar ilk abonelik gönderiminden önce yapılsın.

### C13. Google ile girişin konsol adımları
- **Kanıt:** `YAPILACAKLAR.md:566-568`: Redirect URL, "Skip nonce", Publish app (G-26).
- **Önerilen karar:** üç adım yapılsın, sonra cihazda denensin.

### C14. Site, alan adı, destek e-postası ve marka
- **Kanıt:** Alan adı "yayın gününe kadar alınmaz" (`YAPILACAKLAR.md:522`, `:538`). nefona.com 2026-09-30'da boştaydı (Vercel
  sorgusu, eski 10). SMTP ve destek e-postası buna bağlı (`:537`, `:571`). Marka tescili belgede hiç yok (grep "tescil" boş; eski 11).
- **Önerilen karar:** alan adı şimdi alınsın (11,25 USD/yıl), çünkü başkası alabilir. Marka başvurusu mağazadan önce yapılsın,
  YAPILACAKLAR §3'e madde eklensin.

### C15. Çelişen eski kararlar ve sahipsiz belgeler
- **Yol uzunluğu ve sekmeler:** "4–5 durak (~11 dk)" (`YENIDEN_DUSUNME.md:7`) ile "Yol ≈ 15 dk" (`YAPILACAKLAR.md:67`) çelişiyor.
  Sekmeler kodda farklı (`components/ui.jsx:5-10`) (G-28).
- **ENVANTER_VE_PLAN açıkları:** `:100-106`, `:188`, `:247`, YAPILACAKLAR'da yok (G-30).
- **`YOL.*` soruları:** Ayna puanı, alarm günleri, PDF, 56. gün `rechecks[]` (`tasarim/YOL.nef.md:627-631`, `tasarim/YOL.ilerleme.md:626`; sonsuz C5).
- **Önerilen karar:** 30 Eylül'de onaylanan sonsuz yol planı geçerli sayılsın. YENIDEN_DUSUNME'de düşen maddeler işaretlensin,
  sekmeler S0/Y3'te karara bağlansın. ENVANTER'in başına "tarihsel" notu düşülsün, süren işler YAPILACAKLAR'a taşınsın.
  `YOL.*` soruları Y6'dan önce sorulsun.

### C16. Psikolog adı ve kalan derslerin seslendirmesi
- **Kanıt:** Psikolog adı verilmedi (`yoga-pilot/SAHIP_ISTEKLERI.md:38`). Bu yüzden Zor Anlar İçin yolda yok (plan `:289-295`;
  sonsuz C2). Parti 2 ≈ 128–190 bin kredi tutuyor (PLAN.v3:1050) (Y-10).
- **Önerilen karar:** yedek uygulamaya devam edilsin. Parti 2'nin seslendirmesi ilk bölümün cihaz testinden (Kapı 4) sonra yapılsın,
  çünkü Kapı 4'ten sonra karıştırıcı değişirse yeniden basım gerekir (SPEC.v3:19).

### C17. Küçük teyitler
- **Team ID pbxproj'da yok, ama betikler komut satırından veriyor** (`app/scripts/testflight.sh:10`; eski 9). **Öneri:** madde kapansın.
- **E testinde kaldırılan 3 cümle** (`YAPILACAKLAR.md:583-584`; eski 6). **Öneri:** kaldırılmış kalsın.
- **"Kilit ekranı" gece saati:** uygulanan şey uygulama içi ekran, iOS kilit ekranında saat yok (eski 7). **Öneri:** sahibe sorulsun;
  kastettiği uygulama içi ekransa madde kapanır.

### C18. S0 sayfası sahibe gitmedi: S1 kapısı yeniden tanımlanmalı
- **Kanıt:** `76816fc`, `tasarim/S0/5sn-sonuclari.md:3-4`: üç turda da geçemedi, gönderilmedi. Plan §H `:1212` sırayı "tasarım →
  sahibin onayı → kod" diye koyuyor. Y1'in kodu S1 onayından önce yazılmıştı; onay sayfayla geriye dönük verilecekti (sonsuz B2).
  Sahibe gitmesi gereken sorular (C7: yoga kartı, App Review) sayfayla birlikte bekliyordu.
- **Önerilen karar:** sahibe sayfa gönderilmesin. Yerine tek mesaj gitsin: S0 sonucu bir cümleyle, C6 ve C7'deki sorular, Y1'in
  görünüşü de Build 60'taki gerçek ekranlarla onaylansın. PLAN v1.1'de S1 kapısı "her aşamanın kendi 5 sn kapısı" diye yazılsın (D4).

---

## 3. Cihazda doğrulama bekleyenler (E)

**Build 59 telefonda kurulu, bunlara şimdi bakılabilir:**
- **E1. (a) listesi ve Bug 24–27:** `YAPILACAKLAR.md:136-176`. Gelen tek sonuç "Bu hafta tamam" (`:81`). `HATA_GUNLUGU.md:693`,
  `:713`, `:750`, `:758` (G-31, eski 12, sonsuz E2).
- **E2. Parlaklık ve ters renk (önemli):** sürüm notu bunu vaat ediyor (`lib/releases.js:44`, `'2026-09-29'` girdisi, Build 59'da).
  Belgedeki "TestFlight'tan önce doğrulanacak" kapısı geçildi (`YAPILACAKLAR.md:600-603`). Doğrulanmazsa madde silinmesin, yeni
  girdiye bir düzeltme maddesi yazılsın (Bug 31 kuralı, `HATA_GUNLUGU.md:777-787`) (G-37, eski 6).
- **E3. Simge, açılış ekranı, Gelişim haritası ve WHO-5:** `YAPILACAKLAR.md:27-34`. Bug 19 "cihazda doğrulanacak" (`HATA_GUNLUGU.md:489`) (G-35, eski 2–4).
- **E4. Göz takibi raporu, kalibrasyon ve Yılan:** "RAPOR VERİSİ GELMEDİ" (`YAPILACAKLAR.md:552`). Yılan'da aşağı bakış "sağ"
  okunuyor (`HATA_GUNLUGU.md:326`, `:362`) (G-33).
- **E5. Alarmın kalanı:** Dalga sesinin alarmda çalması (Bug 20'nin kalan kısmı), haftalık tekrar, "Nefona'yı aç", izin reddi,
  Tüm verileri sil, sessiz mod, gece saati, E testinin sesli yönlendirmesi (`YAPILACAKLAR.md:258-260`, `:367-371`, `:580-584`)
  (G-36, eski 5a, 6, 7).
- **E6. Ötekiler:** HealthKit, egzersiz sahnesi, İlk Bakış sayacı (`HATA_GUNLUGU.md:438`), Bug 21 (320 px, `:567-571`),
  Bug 8, 12 ve 13. npm eklentileri Release derlemesinde, bildirim v2 (`ios/App/App/capacitor.config.json`; `HATA_GUNLUGU.md:308`) (G-34, G-38).

**Build 60 gerekiyor (C1'den sonra):**
- **E7. (b) listesi, Bug 31 ve 32:** `YAPILACAKLAR.md:178-205`, `HATA_GUNLUGU.md:778`, `:790` (G-32, eski 13).
- **E8. Y1'in 14 maddelik cihaz listesi (S2 kapısı):** `Y1_KOD_RAPORU.md:7`, `:134-152`. 1., 2., 4. ve 9. günler ve eski hesap
  denenmeli. Sonuçlar `HATA_GUNLUGU`'na yazılır (sonsuz E1).
- **E9. Yoga, Kapı 4:** Swift derlemesi (Y-22). `C_KOD_RAPORU` §8'deki 18 madde ve `C_DOGRULAMA_RAPORU` §5'teki 6 madde (Y-23).
  Ders 2 · 15 kilitli ekranda sonuna kadar çalınmalı (`yoga-pilot/v3/modul.md:864`; arası 6). Tüm verileri sil yerel ders kaydını
  siliyor mu (`App.jsx:1070`; arası 4)? PDF'teki yoga satırlarına bakılmalı (arası 8). Deneme onaylı dosyalarla yapılmalı, eski
  Ders 2 · 15 ile değil (A2).
- **E10. Yoga sonrası:** Kapı 5 yol durağı. Durak, 3 dakikalık ders yayımlanınca görünür (`lib/yoga.js:113-116`; Y-24). §E.7'ye
  göre "bitti" demek için cihazda kilitli çalma şart (PLAN.v3 `:1028-1034`; Y-25).

---

## 4. Çalışan işlerde olanlar (B)

- **B1. Yoga ekranlarının 5 sn yeniden tasarımı (`modules/yoga`).** Kapı 3 kaydı tur sonunda yazılacak (Y-13, G-17). A1 ve A8 bu turdan sonra gelir.
- **B2. Y1'in 5 sn turu (Home, TodayPath, Breath).** Son kayıt `155370e` "turu 3 (ara kayıt)", 11.22. Tur sürüyor. Tur bitince yapılacaklar: `Y1_KOD_RAPORU` güncellemesi (bkz. D12), haritanın
  yer değişikliğinin sahibe gösterilmesi, sitenin iki görselinin yeniden çekilmesi (arası 7), YAPILACAKLAR'a (c) satırı (sonsuz B1, G-18).
- **B3. S0 tasarım sayfasının 5 sn turu: denetim sırasında kapandı.** `76816fc` (11.21) ve `tasarim/S0/5sn-sonuclari.md:3-4`:
  "Sayfa üç turda da 5 saniye kapısını geçemedi; sahibe gönderilmedi. … dördüncü tur açılmadı." Sonraki ekranlar Y2–Y6'da
  kendi 5 sn kapısından geçecek. Böylece sonsuz B2 ve G-19 B olmaktan çıktı. Kalanlar C18'e (S1 kapısı ve sahibe gidecek sorular)
  ve D4, D12'ye (belge) taşındı. Ç16–Ç18'in `ekranlar-ozet` Bölüm 3'e eklenmemesi (`tasarim/S0/ekranlar-inceleme.md:85`) artık
  bu sayfa için önemsiz.

---

## 5. Belge düzeltmeleri (D)

Hepsi `app/` dışında, çalışan işleri etkilemez. Aksi yazmadıkça iş orkestratörün ya da belge oturumunun.

- **D1. YAPILACAKLAR "Şimdi 1: TestFlight derlemesi" eskidi:** `YAPILACAKLAR.md:12-13`'teki dört kaydın dördü de Build 59'da
  (`git merge-base --is-ancestor <c> 26419b4`). Yerine A4'teki Build 60 listesi yazılsın (G-39, eski 14).
- **D2. YAPILACAKLAR'ın sonsuz yol bölümü eskidi:** `:49` "onay bekliyor" diyor, plan onaylandı (`bdbaafd`). `:52` "depoda
  değil" diyor, oysa depoda. `:66-70` eski tasarımı anlatıyor. `:71` "yoga pilot sesi üretiliyor" diyor. (c) ve (g) için `[~]`
  satırı yok (yalnız `:80` ve `:178` var). Son güncelleme `:7` 29 Eylül. (g) satırı şimdi yazılsın; (c) satırını Y1 turu
  yazar (G-40, sonsuz D2, Y-31, arası 11).
- **D3. Plan §2.4'ün 8 belge düzeltmesi hiç yapılmadı:** `tasarim/YOL.nef.md:488`, `:498`; `YOL.moduller.md:355-356`,
  `:676-677`; `YOL.ilerleme.md:1-11`; `arastirma-v1/hava-ay.md:58`, `:466`; `gunun.md:170`; `merdiven.md:217`;
  `gelisim-nef.md:86`. Ayrıca kapanmış sorular: `YOL.nef.md:313`, `YOL.ilerleme.md:242` ve ikisinin de §13'ü (sonsuz A1, D4).
- **D4. PLAN v1.1 (S0 turu kapandı, `76816fc`; şimdi yapılabilir):** S0'ın D1–D23 düzeltmeleri (`tasarim/S0/plan-duzeltmeleri.md:3-4`). Y1 raporunun plan
  düzeltmeleri: 629/230, `stepIds`, §G.6 listesi, §A.9 bütçesi, §G.3'te `pathLater.js` ve `today.js` (`Y1_KOD_RAPORU.md:173-190`).
  App Review için §H (C7). A10 ve A12'deki aşama bağları (sonsuz A2).
- **D5. "Kod yoga yayınından sonra" yazan yerler eskidi:** plan `:3-5`, `:89`, `:142`, `:1255`; `yoga-pilot/v3/PLAN.v3.md:171-172`;
  `yoga-pilot/SAHIP_ISTEKLERI.md:42`. Sahip kodu erkene aldı (`tasarim/SAHIP_ISTEKLERI.md:92-96`) (sonsuz D1).
- **D6. Yoga belgeleri (yoga turu bitince):** PLAN.v3 "kısmi yayın yoktur" (`:1067`), kapı sırası (`:1059-1060`), `:81` ve
  `:1086-1087` (Y-26). İşlenmemiş notlar: `PLAN.v2.md:465`, `PLAN.v3.md:822` (Y-27). INCELEME açık 1 ve 3 kapandı (Y-28).
  `DEVAM.md:23-24` "C adımı başka oturumda" (Y-29). `modul.md:281` Ders 4 satırı (Y-30). `ENVANTER_VE_PLAN.md`'de yoga hiç
  geçmiyor (Y-31).
- **D7. HATA_GUNLUGU'nda eski durumlar:**
  - Bug 1 (`:11`/`:64`), 4 (`:92`, düzeltmesi `27738aa`), 11 (`:232`/`:381`), 14 (`:295`/`:308`) ve 22 (`:537`; doğrulama `:623-625`) kapanmış.
  - Bug 2, 5 ve 6 aşılmış. Bug 29 (`:739`) ve 30 (`:767`) yapıldı (`YAPILACAKLAR.md:131-133`).
  - Bug 20 (`:500-501`) yalnız kısmen kapandı: "hangi ses çaldı" sorusu `:672-673`'te cevaplandı, Dalga sesi hâlâ E5'te.
  - Bug 21 (`:530`) düzeltildi (`:567-571`), yalnız cihazda doğrulama kaldı. `YAPILACAKLAR.md:44-45`, `:351`, `:360` da buna göre değişmeli.
  - `:498` AppIcon.icon "DOĞRULANMADI" diyor, ama Build 59 bu dosyayla derlendi. `:628` "bekleniyor" diyor, ikisi de görüldü.
  - Başlık `:6` "Bug 1–20" diyor, son kayıt Bug 32 (G-46, G-41, eski 15).
- **D8. YAPILACAKLAR bildirim ve alarm bölümleri:**
  - Bildirim: `:452` "commit yok" (iş `8bccf79`'da), `:473`, `:475`, `:477` (G-42).
  - Alarm: `:244` iOS 26 öncesi (yapıldı, `lib/alarmNative.js:9-10`). `:266-268` "karar bekleniyor", `:289` "onaylandı" diyor.
    `:273-274` Deneme 2 sonucu geldi. `:275-278` v1 "ONAY BEKLİYOR". `:293` "DERLENMEDİ". `:305` `DEFAULT_SOUND` (şu an
    `'uyan-gunisigi'`, `lib/alarmSounds.js:23`). `:316` "karar bekliyor" (G-43, eski 5c, 5i).
- **D9. YAPILACAKLAR'daki küçük düzeltmeler:**
  - İlk Bakış Gelişim'de gösteriliyor, oysa `:414` "yalnız IrisPlan'da" diyor (`components/ProgressOverview.jsx:240-246`; G-44).
  - Gabor "ertelendi" (`YENIDEN_DUSUNME.md:127`), `:447` hâlâ `[ ]`. Uyku süresi karar 4 ile kapandı (`:486`; G-45).
  - İris maddesinin ikinci yarısı `ee417db` ile yapıldı (`:379-381`; G-10).
  - `:30-31` AppIcon.icon notu (eski 2).
  - Gece saati Artifact bağlantısı eksik (eski 7).
- **D10. ANA_BELGE:** belge haritasında `tasarim/` ve `yoga-pilot/` yok, `:101` "Bug 1–17" diyor (`docs/ANA_BELGE.md:100-107`; G-47).
  `:119-120` "`makeWho5Record` hiç çağrılmıyor" diyor, oysa `screens/Who5.jsx:46` çağırıyor. `:135` "Göz kırp süre
  kaydetmiyor" diyor, `YAPILACAKLAR.md:407` ise tersini (eski 1).
- **D11. Oturumun görev listesi:** #28 (WHO-5; `ee417db`, `3e78093`), #31–#33 (simge ve açılış; `d605eae`, `c8dacf8`), #34–#40
  (alarm; `2cd96b5`, `6762487`, `13761b5` …), #47 (`e289b0d`), #50 (`d515702`) bitti, hepsi Build 59'da. Görev listesinde
  kapatılsın. Kalanları E ve C bölümlerinde (eski 1–7).
- **D12. Çalışan turların kendi belge düzeltmeleri:** `Y1_KOD_RAPORU.md:9` "Git kullanılmadı" diyor, oysa kod `6ea6890` ile
  kaydedildi. §2, §3 #2 (`:56`) ve §5 madde 8 (`:146`), 5 sn turundan sonra eskidi. İş Y1 turunun (sonsuz B1, D3). Ayrıca
  `tasarim/S0/ekranlar-inceleme.md:85`'teki "320 pt Y1 listesine yazılmadı" notu eski, madde `Y1_KOD_RAPORU.md:145`'te var. S0 turu kapandığı için bu iş artık orkestratörün (sonsuz D5).

---

## Birleştirmede çözülen çelişkiler

1. **HEAD:** alt raporların hepsi `70ca7d5` diyor. Denetim sırasında üç kayıt geldi: `93dd037` (Y1 turu 2), `76816fc` (S0 kapanışı)
   ve `155370e` (Y1 turu 3). Şu an `git status` yalnız `modules/yoga/text.js`'i gösteriyor. Sonsuz B1'deki `Home.jsx` satır
   numaraları `70ca7d5`'e göredir.
2. **Y1 eşdeğerliği "yeniden koşulmadı" (sonsuz A4):** kısmen yanlış. Kalıcı eşdeğerlik testi depoda var
   (`lib/today.test.js:621`, `:656`, `:696`: ilerleme kapalı ve açık). `93dd037` iletisi "yol eşdeğerliği dahil" bütün testlerin
   yeşil olduğunu yazıyor. Açık kalan yalnız 20.000 bağlamlık düzeneğin depoya alınması (A16).
3. **Yoga turunun dosya saatleri (Y-13):** 09.02–09.40 arasındaki değişiklikler `58fa1c1`'e (09.51) ait. `git status`'ta
   `modules/yoga` bu sırada temizdi. 11.22'den sonra tur `modules/yoga/text.js`'i değiştirmeye başladı. Madde yine B.
4. **Build 59'dan sonraki kayıt sayısı:** G-02 "12" diyor ama 13 kimlik sayıyor, eski 14 "13" diyor. Şu an 15:
   `git log --oneline 26419b4..HEAD -- app/ | wc -l`.
5. **Bug 20:** eski 15 "kapandı" diyor, G-46 "kısmen" diyor. Başlık "Dalga sesi çalmadı" (`HATA_GUNLUGU.md:500`), `:672-673` ise
   yalnız "hangi ses çaldı" sorusunu kapatıyor. Doğrusu G-46: kısmen D, Dalga kısmı E.
6. **Bug 22'nin doğrulama satırı:** eski `:616-617`, G `:624-625` diyor. `:616-617` "DOĞRULANMADI" satırı. Doğrulama `:623-625`'te,
   yani G haklı.
7. **Parlaklık maddesi:** eski 6 "sonraki derlemede çıkarılır", G-37 "yeni girdiye düzeltme" diyor. Görülmüş girdideki değişiklik
   kişiye gösterilmiyor (Bug 31, `HATA_GUNLUGU.md:777-787`), bu yüzden G-37 doğru.
8. **Sürüm notunun yeri:** Y-09 "yeni kimlik", G-01 ve arası 5 "`'2026-09-29-2'`ye ekle" diyor. İkisi de kurala uyuyor, çünkü
   `'2026-09-29-2'` hiç yayımlanmadı (grep → 0).
9. **Nef'in 10 modül sınırı:** Y-19 "C", arası 10 "A" diyor. `C_KOD_RAPORU.md:179-182` bunu açık karar sayıyor, ama plan sınırın
   16'ya çıkarılmasını zaten Y6'ya koymuş (`SONSUZ_YOL.PLAN.v1.md:1151`). Karar verilmiş, açık olan zamanlama: A12.
10. **YAPILACAKLAR'da (c) ve (g) satırları:** arası 11 "A/B", ötekiler "D" diyor. Kod depoda, eksik olan belge: D2.
11. **`coach-setup.sh` satırı:** arası 1 `:78` diyor. `git archive` satırı `:77`.
12. **S0 turu "sürüyor" (görev metni, sonsuz B2, G-19):** `76816fc` turu kapattı (`tasarim/S0/5sn-sonuclari.md:3-4`). B3 bu yüzden
    kapanmış yazıldı, kalanı C18'e taşındı.

---

## Eleştirmenin ekledikleri (11.26–11.38, HEAD `f810065`)

Madde kimlikleri `E-` ile başlar. Yukarıdaki bölümler değiştirilmedi; burada yazılan, yukarıdakini düzelttiği yerde geçerlidir.

### 0. Denetim sırasında değişenler (Özet 1, 8 ve B2'yi düzeltir)
- **HEAD `f810065` (11.33).** Araya iki kayıt girdi: `e71abe6` "Y1 bitti" (11.31) ve `f810065` sahip kararları.
- **B2 kapandı.** `e71abe6` iletisi: "Ekranlar üç turda 5 saniye kapısını geçemedi; yalnız Nefes 'Bugünün ritmi' geçti … Dördüncü
  tur açılmadı" (`tasarim/Y1_5SN_SONUCLARI.md:3-5`). Kayıt yalnız `home.css` ve 5 sn dosyalarını içeriyor. B2'nin tur sonu
  işleri sahipsiz kaldı (E-A1).
- **Özet 1 eskidi.** Kaydedilmemiş değişiklikler artık yalnız yoga turunda: 6 değişmiş dosya ve yeni `YogaParts.jsx` (+840/−492).
  Yoga turunun hiç ara kaydı yok (`git log -i --grep yoga --since "2026-09-30 09:52"` → yalnız ses kayıtları). Oturum düşerse iş kaybolur (B1).
- **Özet 8:** "Y1 bitmeden" koşulu düştü. Koşul yoga turu ve yeni ana sayfa işi için sürüyor (E-A3).
- **Yeni sahip kararları** (`tasarim/SAHIP_ISTEKLERI.md:98-113`):
  - Site planın son aşamasıdır. Bir özellik siteye ancak cihazda görüldükten sonra girer.
  - Ana sayfa şimdi yeniden tasarlanır: üç tasarım yönü, beş değerlendirici.
  - Build 60, yoga hazır olunca ana sayfanın bugünkü hâliyle çıkar.
  - 28 Eylül sürüm notu maddeleri yeni girdiye taşınır.
  - A3, A4, C1, C18 ve D4 bu kararlara göre güncellenmeli.

### A · bitmemiş, kimse yapmıyor
- **E-A1. Y1 turunun kapanış işleri.**
  - **Kanıt:** `e71abe6` bunlara dokunmadı. `Y1_KOD_RAPORU.md:9` hâlâ "Git kullanılmadı" diyor. YAPILACAKLAR'da (c) satırı yok (D2).
    Haritanın yer değişikliği ve Y1_5SN sonucu sahibe iletilmedi (C6).
  - **Kimin:** orkestratör. D12 artık onun işi.
- **E-A2. Ana sayfanın yeniden tasarımı başlamadı.**
  - **Kanıt:** sahip kararı (`SAHIP_ISTEKLERI.md:106-110`). Görevdeki çalışan işlerde yok, depoda da iz yok.
  - **Girdiler:** `Y3_NOTLAR.md:3-11`, `Y1_5SN_SONUCLARI.md:58-124`.
  - **Plan:** Y3 §3.F'nin ana sayfa kısmı öne alındı. D4'e (PLAN v1.1) yazılmalı. · M–L
- **E-A3. Build 60 ile ana sayfa işi aynı dalda çakışabilir.**
  - **Kanıt:** `app/scripts/testflight.sh:27` `git pull --ff-only` ile dalın ucunu derliyor. Sahip "bugünkü hâliyle" dedi (`:107-108`).
  - **Risk:** Ana sayfa işi bu dala ara kayıt atarsa Build 60'a yarım tasarım girer.
  - **İş:** Ana sayfa işi ayrı dalda ya da worktree'de yürüsün, ya da Build 60 yüklenene kadar dala kayıt atmasın. Bu kural A4 listesine yazılsın. · XS
- **E-A4. Build 60 bugünkü ana sayfayla çıkacak, ama değerlendiricilerin gördüğü olası kusurlar kaydedilmedi.**
  - **Kanıt:**
    - `Y1_5SN_SONUCLARI.md:65`: "'Mola · 1 dk' şeridi … alt menünün altına … üst üste binmiş". `Y3_NOTLAR.md:9` aynı şeyi söylüyor ("cihazda doğrulanmalı").
    - `:77`, `:108`: 10 duraklık zincir "karta sığmıyor, daireler birbirine değiyor".
    - `:93`: Kaydet düğmesi koyu temada kayboluyor.
    - `Y1_5sn_duzenek/notlar.md:10`'a göre sekme çubuğu %95 opak yapıldı, ama son tur sızıntıyı yine gördü.
    - HATA_GUNLUGU'nda kaydı yok (son kayıt Bug 32).
  - **İş:** 320 ve 390 pt'de 9. günün ve güncelleme gününün zinciri, ayrıca sekme çubuğunun altı ölçülsün. Kusur varsa Bug 33+
    açılsın ve Build 60'tan önce düzeltilsin. · S
- **E-A5. Sürüm notu (A3'e ek).**
  - (a) Sahip kararı gereği 28 Eylül girdisinin maddeleri (`lib/releases.js:53`: simge, açılış ekranı, WHO-5, alarm, uyku ekranı)
    yeni girdiye taşınacak. Henüz yapılmadı.
  - (b) `58fa1c1`'in yoga dışı düzeltmesi ("uyku sesi açıkken kayıt bitince oturum kapanmaz"; `FeedbackPlugin.swift`) için
    sürüm notu maddesi yok.
  - (c) `Y1_5sn_duzenek/notlar.md:53-54`: Y1 notu eklenince eski kullanıcı önce "Yenilikler"i görür. Güncelleme gününün ilk
    5 saniyesi buna göre tasarlanmalı (E-A2).
- **E-A6. HATA_GUNLUGU (A5'e ek).** 28 Eylül maddelerinin "Yenilikler"de çıkmaması Bug 31 kalıbının ikinci örneği
  (`SAHIP_ISTEKLERI.md:111-113`). Kaydı yok (son kayıt `HATA_GUNLUGU.md:789`, Bug 32). · XS
- **E-A7. Sitenin ekran düzeneği depoda değil.**
  - **Kanıt:** `YAPILACAKLAR.md:533` "düzenek `_harness/site.jsx` + `siteSeed.js` — depoya girmedi". `git ls-files | grep _harness` boş.
    Dosyalar yalnız karalama alanında: `scratchpad/shotwt/app/_harness/` ve `scratchpad/haftalik/shots/_harness/`.
  - **Neden önemli:** site en sonda gerçek ekranlarla yenilenecek. Y1'in düzeneği depoya alındı (`tasarim/Y1_5sn_duzenek/`), bu da alınmalı. · XS
- **E-A8. Temizlik (A16'ya ek).**
  - İki eski ajan worktree'si duruyor: `.claude/worktrees/agent-a8c3…` ve `agent-af13…`. Uçları 25 Eylül'de, ikisi de HEAD'e
    birleşmiş (`git log HEAD..<dal>` boş).
  - `scratchpad/shotwt` de bir worktree. E-A7'deki düzeneği tuttuğu için silinmeden önce düzenek alınmalı (`git worktree list`).
- **E-A9. Koddaki VARSAYIM'ların listesi yok.**
  - **Kanıt:** 87 dosyada 225 etiket var (test dışı `src`). Çoğu "cihaz verisiyle ayarlanacak" eşik (`lib/gaze.js:12`, `:192`;
    `lib/blinkCounters.js:41`; `lib/gazeCalib.js:91`). E4'teki rapor gelince hangi eşiğin ayarlanacağını gösteren bir liste yok.
  - `lib/track.js:11-13`'teki tek TODO, C15'teki ENVANTER §11'e (bakış motoru) bağlı. · XS, düşük öncelik

### C · sahibin kararı ya da eylemi
- **E-C1. Depo boyutu.**
  - **Kanıt:** izlenen dosyalar ≈ 1012 MB, `.git` 962 MB. Bunun 936 MB'ı `yoga-pilot`: `render/_kalici` 430, `render/out` 248,
    `render/raw` 127, `render/music` 98 MB.
  - **Plan ne diyordu:** ".git bugün 211 MB … depoya yalnız onaylanmış son dosyalar" (`yoga-pilot/v3/uretim.md:268`, `PLAN.v3.md:641`).
  - **Neden önemli:** Parti 2 ve 3 depoyu büyütür, sahibin Mac'i her `testflight.sh`'ta çeker. Hiçbir belgede ele alınmamış.
  - **Karar:** Git LFS mi, ham çekimlerin depodan çıkarılması mı, olduğu gibi mi kalacak?
- **E-C2. Ayna ölçeğinin kullanım izni hukukçu paketinde yok.**
  - **Kanıt:** `lib/yon.js:14-17`: "tam liste ek dosyada ve ölçek sahibinin izni gerekli. Bu yüzden şimdilik bu 6 madde".
    Puanlama VARSAYIM. `ENVANTER_VE_PLAN.md:311-313` aynı şeyi yazıyor.
  - **Öneri:** C4'teki tek pakete girsin (WHO-5 lisansıyla aynı soru).
  - **Ek:** `YAPILACAKLAR.md:570` "Nef'e 'Yön' serbest metni: ayrı açık rıza". Bugün metin Nef'e gitmiyor: `gozolcum:yon-notes`
    yalnız `lib/yon.js` ve `modules/yon/manifest.js`'te geçiyor. İş planlanırsa bu da aynı pakete girer.
- **E-C3. Mesafe uyarısı yapılmadı ve hiçbir listede yok.**
  - **Kanıt:** göz bütçesi planında tanımlı: 30 cm, 10 sn, 3. uyarıda duraklama (`MOLA_KILIDI_VE_YILAN_ANIMASYONU.md:62-68`,
    §7 adım 4 `:171`). Kodda karşılığı yok. Aynı adımdaki rahatsızlık düğmesi yapılmış (`lib/eyeBudget.js:137`). YAPILACAKLAR'da yok.
  - **Karar:** yapılacak mı, hangi aşamaya bağlanacak?
- **E-C4. Yoga planının G11 kararı uygulanmadı.**
  - **Karar:** "`build-dev` yok sayılır, `swiftpm/Package.resolved` izlenir" (`PLAN.v3.md:1078`, `PLAN.v2.md:1685`).
  - **Durum:** `app/.gitignore`'da `build-dev` yok. `git ls-files | grep Package.resolved` boş. Dosya sahibin Mac'inde oluşuyor. · XS
- **E-C5. Sandbox denemesi (C12) test kilidi açık bir derlemeyle yapılamaz.**
  - **Kanıt:** `testflight.sh:14`'te `TEST_UNLOCK` varsayılanı 1. App Store derlemesi için `:7` `TEST_UNLOCK=0` istiyor.
  - **Öneri:** C12'ye yazılsın. Sandbox için ayrı bir derleme gerekir.
- **E-C6. Site yeni kuralla çelişiyor.**
  - **Kanıt:** Sitede Y1 metni ve görselleri var (`site/pages/index.html:89-94` "Yol ilk gün 8 dakikadır ve her gün bir adım büyür";
    görseller `6ea6890`'dan). Ama Y1 cihazda görülmedi (E8) ve ana sayfa yeniden tasarlanacak. Site yayında olmadığı için bugün bir
    zararı yok.
  - **Öneri:** Site planında (B4) bu içerik "cihazda görülünce" diye işaretlensin. A4'teki "site Y1 ile aynı gün yayınlanır"
    koşulu da yeni kurala göre yazılsın.

### E · cihazda doğrulama bekliyor
- **E-E1. "Aboneliği yönet" bağlantısı** iPhone'da App Store abonelik sayfasını açıyor mu (`YAPILACAKLAR.md:562`)? Build 59'da bakılabilir.
- **E-E2. Bug 9 ve Bug 10 (yönler ters).**
  - Bug 10: "ÇÖZÜLDÜ (kod) / cihaz doğrulaması sonraki TestFlight" (`HATA_GUNLUGU.md:201`, `:227`). Sonrasında kayıt yok.
  - Bug 9 aynı durumda (`:180`, `:198`).
- **E-E3. Kendini iyileştiren göz modeli.** "Yeniden göz ayarı ve rapor; `previousAdapt`" (`YAPILACAKLAR.md:20`, `:557-559`
  "CİHAZDA DENENMEDİ"). E4 bunu adıyla anmıyor.
- **E-E4. Sekme çubuğunun altından sızıntı** (`Y3_NOTLAR.md:9`). Alt raporda vardı (G-38), birleştirmede E6'dan düştü. E-A4 ile birlikte bakılsın.
- **E-E5. iOS 27 kesintileri (Build 60, E9'a ek).**
  - **Kanıt:** `yoga-pilot/C_KOD_RAPORU.md:183` "iOS 27'nin yeni kesinti bildirimleri". Not hiçbir yerde açılmamış. Sahibin telefonu
    iOS 27.0 (`HATA_GUNLUGU.md:549`).
  - **İş:** Ders çalarken arama, Siri ve alarm kesintileri iOS 27'de denenmeli. `v3/modul.md:822`'de kesinti maddesi var, iOS 27 notu yok.

### B · çalışan işler (ek)
- **B4. Site planı taslağı.** `SAHIP_ISTEKLERI.md:103` "Plan bölümü taslağı hazırlanıyor" diyor. Taslak dosyaları
  `scratchpad/site-plan/{site,ozellikler,kurallar}.md` (11.17–11.31). Görevin çalışan işler listesinde yok. E-C6 bu işe girdi.

### D · belge düzeltmeleri (ek)
- **D13. Uygulanmış planlar hâlâ "onay bekliyor" diyor.**
  - `MOLA_KILIDI_VE_YILAN_ANIMASYONU.md:7` "onay bekliyor. Kod yazılmadı", oysa `4d2bfb1` ve `27738aa` ile yapıldı.
  - `NEFES_FARKINDALIK.md:7` aynı durumda (`e84d60d`, `eafd586`). ANA_BELGE ikisini de yapıldı sayıyor (`docs/ANA_BELGE.md:176-177`).
  - `BILDIRIM_PLANI.md:14` "v2 … onay bekliyor" diyor, başlığı (`:1`) ise "v2 UYGULANDI".
  - `JEV_GOZ_KOCU.md:95` "Açık sorular (başlamadan cevaplanmalı)" diyor, oysa koç yayında (`:3-6`).
- **D14. HATA_GUNLUGU başlıkları (D7'ye ek).**
  - Bug 3 (`:79`) "AÇIK" diyor.
  - Yılan hassasiyeti (`:111`) "AÇIK" diyor. Planı C15'teki ENVANTER §11.
  - Bug 9: `:180` "AÇIK", `:198` "ÇÖZÜLDÜ".
  - Bug 10: `:201` "AÇIK", `:227` "ÇÖZÜLDÜ".
  - İlk Bakış (`:393`) "AÇIK" diyor, `:438` "sentetikte evet".
  - Bug 15'in (`:298`) durum satırı yok, `:308` "KAPANDI" diyor.
- **D15. YAPILACAKLAR'da eskiyen iki satır.**
  - `:458-459` "Mac'te: Swift derlemesi (WalkGuard …)" hâlâ açık. Oysa WalkGuard `8bccf79`'da ve bu kayıt Build 59'un atası
    (`merge-base --is-ancestor` → evet). Yetkiler de `App.entitlements:13`, `:15`'te. Derleme yapılmış.
  - `:76` "5 saniye, site … sahibin onayına" diyor. Plan onaylandı (`bdbaafd`) ve site artık planın son aşaması.
- **D16. ANA_BELGE (D10'a ek).** §4 "Modüller"de yoga hiç geçmiyor (`grep -ci yoga` → 0). §5 "Yapılanlar" 29 Eylül'de bitiyor
  (son değişiklik `b7cdccf`). Yoga, Y1 ve S0 yok.
- **D17. Yoga belgeleri (D6'ya ek).**
  - `v3/modul.md` §15, G2, G3, G4, G7, G8 ve G11'i "Açık (sahip)" gösteriyor. `PLAN.v3.md:1075-1078` hepsini kapattı.
  - `PLAN.v3.md:452` "(c) … henüz kodda yok, VARSAYIM" diyor. Y1 kodda (`6ea6890`) ve yogalı benzetim yeniden yapıldı
    (`Y1_KOD_RAPORU.md:118-120`).
  - `b/INCELEME.md:129`, açık 6: "İnsan onayı yok … sahibin kulağı bekliyor". Sahip dinledi ve onayladı (yoga `SAHIP_ISTEKLERI` madde 17–18).
- **D18. S0 üreticisinin yolu eski.** `tasarim/S0/sorular-kararlar.md:12` üreticiyi karalama alanında gösteriyor. Üretici `76816fc`
  ile depoya alındı (`tasarim/S0/_uretici/`).
- **D19. Onaylı plan iki kopya.**
  - `tasarim/SONSUZ_YOL.PLAN.v1.md` ile `tasarim/arastirma-v1/SONSUZ_YOL.PLAN.v1.md` birebir aynı (`cmp`). İkisi de `bdbaafd`'de değişti.
  - **Risk:** PLAN v1.1 (D4) yazılırken biri ötekinden ayrılır.
  - **Öneri:** Biri silinsin ya da başına "kopya" notu konsun.
- **D20. Y1_5SN "geçti" demek için kuralın değerlendirici sayısı yok (C'ye de dokunur).**
  - **Kanıt:** `Y1_5SN_SONUCLARI.md:3-4` "Bugünün ritmi (6) geçti" diyor. Ama o ekranı her turda tek değerlendirici gördü (`:16`, `:30`,
    `:42`, `:56`: "1/1"). Dosyada hiçbir ekran 3 değerlendiriciye ulaşmıyor: 30 satır "/1", 10 satır "/2".
  - **Kural:** "birbirini görmeyen, en az 3" (`tasarim/SAHIP_ISTEKLERI.md:87`).
  - **Öneri:** Bu ekran sahibe "geçti" diye sunulmasın ya da kurala uygun biçimde yeniden sınansın. E-A2 beş değerlendiriciyle yapılacak.

### A6'ya ek (metin kapısı)
- `Y1_5sn_duzenek/notlar.md:44-47`: "Bugünün ritmi" kartı ilk ekranda fizyolojik etki cümlesi gösteriyor ("…kalp ritmi
  değişkenliğini artırdı…"). Not "'sağlık iddiası yok' denetiminde bakılmalı" diyor. Cümle A6'nın listesine girsin.

### Bakıldı, sorun yok
- **Kod:** `app/src`'de tek TODO var (`lib/track.js:11`), FIXME yok.
- **"Sürüyor", "ara kayıt", "henüz" geçen kayıtların hepsi kapandı:**
  - `8a42d62` → `76816fc` ile.
  - `70ca7d5`, `93dd037` ve `155370e` → `e71abe6` ile.
  - `b0afe83` "henüz bağlanmadı" → `lib/pathLater.js` artık `Yoga.jsx` ve `Home.jsx`'ten çağrılıyor.
  - `d796f99` ve `43be429` → iki plan da onaylandı.
- **Git:** dal `origin` ile eşit (`git status -sb`, fetch yapılmadı). Stash yok.
- **A7 doğru:** karalama alanındaki 1049 WAV pilotun A adımına ait. İlk bölümün karışımı ya da `mixib.py` yok.
- **Kulak listeleri:** `render/out/ilk-bolum/kulak-ders*.md`'deki VARSAYIM'lar sahibin kulak onayıyla kapandı (madde 17–18).
