# Açık işler: bu oturumun eski görevleri ve sahibin bekleyen eylemleri

Denetim: 2026-09-30, salt okunur. Depo `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `70ca7d5`
(yerel `origin/claude/cool-pasteur-j5yupf` ile aynı; `git fetch` yapılmadı). Depoda dosya değişmedi.
Sınıflar: **A** bitmemiş, kimse yapmıyor · **B** bitmemiş, çalışan bir iş akışında · **C** sahibin kararı ya da eylemi
bekleniyor · **D** aslında bitmiş, belgede açık görünüyor · **E** cihazda doğrulama bekliyor.
"Build 59'da var" denetimi: `git merge-base --is-ancestor <commit> 26419b4` (Build 59 = 26419b4, YAPILACAKLAR.md:131).

## Kısa tablo

| # | İş | Sınıf | Kimin işi |
|---|---|---|---|
| 1 | #28 WHO-5 (test, iki tema, sürüm notu, belgeler, commit, push) | D (bitti) + E + C | orkestratör / sahip |
| 2 | #31 Simge (appiconset + AppIcon.icon + pbxproj) | D + E | Claude (belge) / sahip |
| 3 | #32 Açılış ekranı (Nefona işareti) | D + E | sahip |
| 4 | #33 Simge/açılış doğrulama, Artifact, sürüm notu | E | sahip |
| 5 | #34–#40 Alarm + bildirim | D (görevler bitti) + E + A + C | karışık, aşağıda |
| 6 | #47 E testine ElevenLabs sesli yönlendirme | D + E (+ C) | sahip |
| 7 | #50 Uyku ekranı gece saati (A/B/C) | D + E | sahip |
| 8 | App Store Connect aylık ₺89,99 | C | sahip |
| 9 | pbxproj Team ID | C (engel değil) | sahip kararı |
| 10 | nefona.com alan adı | C | sahip |
| 11 | Marka tescili | C (+ belgede yok) | sahip / Claude (belge) |
| 12 | (a) cihaz kontrol listesi | E | sahip |
| 13 | (b) cihaz kontrol listesi | C → E | sahip |
| 14 | Bekleyen Mac TestFlight komutu | C (+ D: belge eski) | sahip, zamanlama orkestratör |
| 15 | Eski durum satırları (Bug 20/21/22/30, alarm "bekliyor"lar, ANA_BELGE) | D | Claude (belge) |

---

## 1. #28 "Test, iki tema görsel kontrol, sürüm notu, belgeler, commit, push" (WHO-5)
- **Sınıf: D** (görev listesinde "sürüyor", işin kendisi bitti).
- Kanıt:
  - Kod + belge commit'leri `ee417db` (22 dosya: `modules/who5`, `screens/Who5.jsx`, `lib/who5.js`, `releases.js`,
    `ANA_BELGE.md`, `YAPILACAKLAR.md`) ve `3e78093` ("tüm durumlar incelendi, 19 bulgu"; "her durum iki temada, 320–430 px").
  - Test: `app/src/screens/Who5.test.jsx` (ee417db'de eklendi, 3e78093'te genişledi).
  - İki tema görsel kontrol çıktıları: scratchpad `gm_who5-q_{dark,light}.png`, `gm_who5-res_{dark,light}.png`,
    `r_w-*_{dark,light}.png`.
  - Sürüm notu: `app/src/lib/releases.js:74`.
  - Belge: `docs/ANA_BELGE.md:149`, `:221-222`; `YAPILACAKLAR.md:379-391`, `:405`.
  - Push: `git rev-parse HEAD` = `git rev-parse origin/claude/cool-pasteur-j5yupf` = `70ca7d5`.
  - Build 59'da var (ee417db, 3e78093: evet).
- Kalan (ayrı maddeler):
  - **E**: `YAPILACAKLAR.md:32-34` Gelişim haritası + WHO-5 cihaz kontrolü (Build 59'da denenebilir).
  - **C**: `YAPILACAKLAR.md:35-43` sahip kararları: İyi oluş dilimi (a/b/c), "Bugünün görevi" sayımı, düşük WHO-5'te
    kriz hattı, WHO-5 ticari lisansı (hukukçu).
  - **D**: `docs/ANA_BELGE.md:119-120` "`makeWho5Record` hiç çağrılmıyor" diyor, ama `app/src/screens/Who5.jsx:46`
    çağırıyor. `ANA_BELGE.md:135` "Göz kırp ◐ süre kaydetmiyor" diyor, `YAPILACAKLAR.md:407` ise "süre kaydediyor".
- Sonraki adım: #28'i görev listesinde kapat. ANA_BELGE'deki iki eski notu düzelt (app/ dışında; çalışan işleri etkilemez).
- Kimin işi: orkestratör (görev listesi), Claude (belge), sahip (cihaz ve kararlar).

## 2. #31 "Simge: AppIcon.appiconset açık/koyu/renkli + AppIcon.icon (iOS 26) + pbxproj"
- **Sınıf: D** (kod bitti) **+ E** (cihazda görülmedi).
- Kanıt:
  - `d605eae`: `AppIcon.appiconset` açık, koyu ve renkli PNG'ler. `Contents.json:10-13` luminosity/dark,
    `:22-25` luminosity/tinted.
  - `c8dacf8`: `AppIcon.icon/icon.json` + 4 SVG; `project.pbxproj:21,49,113,196` (`folder.iconcomposer.icon`).
  - Derleme riski (capacitor#8179, `YAPILACAKLAR.md:30-31`, `HATA_GUNLUGU.md:495-498` "DOĞRULANMADI") pratikte aşıldı:
    c8dacf8 Build 59'da var ve Build 59 arşivlenip yüklendi (`YAPILACAKLAR.md:131`).
- Sonraki adım: `HATA_GUNLUGU.md:498` ve `YAPILACAKLAR.md:30-31`'e "Build 59 AppIcon.icon ile derlendi" yaz.
  Ana ekran görünümü (Açık/Koyu/Renklendirilmiş/Şeffaf) sahipten beklenir.
- Kimin işi: Claude (belge), sahip (cihaz).

## 3. #32 "Açılış ekranı: Capacitor logosu yerine Nefona işareti"
- **Sınıf: D + E.**
- Kanıt:
  - `d605eae`: `Splash.imageset` 3 açık + 3 koyu PNG (`Contents.json:9-16` dark).
  - `MainViewController.swift:14-23` web görünümü zemini temaya göre.
  - `HATA_GUNLUGU.md:488-489` "Bug 19 DÜZELTİLDİ (cihazda doğrulanacak)". Build 59'da var.
- Sonraki adım: sahip açık ve koyu temada soğuk açılışa baksın (Capacitor "X" logosu yok mu, gri yanıp sönme yok mu).
  Sonuç Bug 19'a yazılır.
- Kimin işi: sahip.

## 4. #33 "Simge/açılış doğrulama, Artifact, sürüm notu"
- **Sınıf: E** (Artifact ve sürüm notu bitti; cihaz doğrulaması yok).
- Kanıt:
  - Artifact "Nefona Simgesi" https://claude.ai/artifact/MG7F9LpSPajYQoKjmHgGW8 (Artifact list: 2026-09-28).
  - Sürüm notu: `releases.js:70` (simge) ve `:71` (açılış).
  - Cihaz maddesi açık: `YAPILACAKLAR.md:27-31` `[ ]`. `HATA_GUNLUGU`'nda simge/açılış için sahip geri bildirimi yok.
- Sonraki adım: Build 59 kurulu telefonda `YAPILACAKLAR.md:27-29` listesi.
- Kimin işi: sahip.

## 5. #34–#40 "Alarm + bildirim: araştırma, plan, spike, Swift AlarmPlugin, lib, arayüz, inceleme"
- **Görevler olarak: D** (yedisi de commit'li).
- Kanıt:
  - Araştırma: `714ae80`, `d0ed548`. Plan/tasarım: `d3df4ca`, `94b7323`, `1eac392`. Spike: `20eb9a8`, kaldırıldı
    `6efca23` + `c7566a1`.
  - Swift + lib + arayüz: `2cd96b5` (v3), `6762487` (v4), `13761b5` (v5).
  - İnceleme: `e5d9ed8`, `f6435a0`, `4e16770`, `8bfabb1`.
  - Dosyalar mevcut: `ios/App/App/AlarmPlugin.swift`, `lib/alarm{,Log,Native,Sounds}.js`, `components/AlarmCard.jsx`,
    `AlarmLine.jsx`, `screens/AlarmSetup.jsx`, `AlarmMorning.jsx`, `ios/App/App/Sounds/*.caf` (6 dosya).
  - Cihazda doğrulanan: Gün Işığı çaldı, "9 dk ertele" göründü (`YAPILACAKLAR.md:233-235`). Uyku müziği kabloyla Xcode
    derlemesinde çaldı (`HATA_GUNLUGU.md:612-617`).

Alt maddeler:
- 5a **E**: `YAPILACAKLAR.md:367-371` "Cihazda bak (alarm)" 10 madde.
  - (1) "derleniyor mu" cevaplandı: Xcode derlemesi (`HATA_GUNLUGU.md:612`) ve Build 59. Bu kısım D.
  - Sessiz modda çalma ayrıca doğrulanmadı (`:235`).
  - (3) haftalık tekrar, (5) "Nefona'yı aç", (7) ertesi sabah soru, (8) izin reddi, (10) Tüm verileri sil açık.
  - Kimin işi: sahip.
- 5b **A + C**: `YAPILACAKLAR.md:242-243`. Bildirim sistemi v2 (`8bccf79`) ile tek "Hatırlatma ve alarm" planı yapılmadı:
  `grep -i alarm docs/yol-haritasi/BILDIRIM_PLANI.md` boş. `app/src/lib/notifyPlan.js:16` `SILENT_RATE = 0.25`
  VARSAYIM, sahip onayı yok.
  - Kimin işi: Claude (plan), sahip (%25 onayı).
- 5c **D**: `YAPILACAKLAR.md:244` "iOS 26 öncesi davranış tasarla" hâlâ `[ ]`. Ama yapıldı:
  - `lib/alarmNative.js:9-10` bildirim yedeği 7600–7607.
  - `components/AlarmCard.jsx:247` "Bu telefonda gerçek alarm yok (iOS 26 gerekir)".
  - Sabah sorusu ≥ 3 günde bir (`YAPILACAKLAR.md:306`).
  - Kimin işi: Claude (belge).
- 5d **A**: `YAPILACAKLAR.md:269-270` "kendi ürettiğimiz klasik tonlar". `lib/alarmSounds.js:12-20`'de yalnız iOS
  varsayılanı + 3 uyandırma + 3 Dalga sesi var, klasik ton yok.
  - Kimin işi: Claude (sahip önceliklendirirse).
- 5e **A**: `YAPILACAKLAR.md:271-272` ses boyutu. `ios/App/App/Sounds/` 6 × 4.321.868 bayt ≈ 26 MB, sıkıştırılmamış
  CAF. Sahip 10+ ses istiyor (`:246`). Sıkıştırılmış biçim cihazda denenmedi (o kısım E).
  - Kimin işi: Claude + sahip (cihaz).
- 5f **C**: `YAPILACAKLAR.md:355-356` "Yatma saati bildirimi (soru 3) YAPILMADI, sahibin cevabı bekleniyor".
  - Kimin işi: sahip.
- 5g **A** (+ D): "Nefesle kapanma" ölçüm işi onaylandı (`YAPILACAKLAR.md:289`; `d3df4ca`), başlanmadı.
  `grep -rli "nefesle kapan" app/src` boş. `:266-268` hâlâ "Sahibinin kararı bekleniyor" diyor (eski).
  - Kimin işi: Claude (araştırma işi), belge düzeltmesi.
- 5h **C** (belirsiz): `YAPILACAKLAR.md:313-314` "Karar sahibinde: alarm kartı tek kart yuvasının dışında". v4/v5
  (`:334`, `:354-355`) kart yerini değiştirdi. Sorunun hâlâ geçerli olup olmadığı sahibe teyit edilmeli.
- 5i **D**: aşağıdaki satırlar cevabı gelmiş işleri "bekliyor" gösteriyor. Ayrıntı madde 15.
  - `YAPILACAKLAR.md:273-274`, `:275-278`, `:316`.
  - `HATA_GUNLUGU.md:501`, `:537`, `:628`.

## 6. #47 "E testine ElevenLabs sesli yönlendirme"
- **Sınıf: D** (bitti) **+ E**.
- Kanıt:
  - `e289b0d`: 8 cümle × 2 ses = 16 mp3 (`ls app/public/voice/tr/*/acu* | wc -l` → 16).
  - Metinler `lib/voicePack.js:69-76`, sürüm notu `releases.js:49`, Build 59'da var.
- Kalan:
  - **E**: `YAPILACAKLAR.md:580-584` ("harf ekrandayken ses susuyor mu", "Yanlış göz" kartı, 44 cm akışı).
  - **E (önemli)**: parlaklık + ters renk. `YAPILACAKLAR.md:600-603` "TestFlight'tan önce cihazda doğrulanacak;
    doğrulanmazsa sürüm notundan çıkarılır" diyor. Ama madde `releases.js:44` ('2026-09-29' girdisi) Build 59'a gitti
    (e289b0d Build 59'da var). Sürüm notu doğrulanmamış bir özelliği vaat ediyor.
  - **C**: kaldırılan 3 cümle (acuStart, acuEyeDone, acuDone) "sahibi isterse geri gelir" (`:583-584`). S13 10 cümle
    diyordu (`:597`).
- Sonraki adım: sahip Build 59'da parlaklık ve ters renk listesini (`:604-607`) denesin. Olumsuzsa sonraki derlemede
  `releases.js:44` maddesi çıkarılır.
- Kimin işi: sahip.

## 7. #50 "Uyku kilit ekranı: premium gece saati (A/B/C seçimi)"
- **Sınıf: D** (seçim yapıldı, kod bitti) **+ E**.
- Kanıt:
  - Artifact "Nefona Gece Saati" https://claude.ai/artifact/BKa6T44VAqfZD5uhDhpKA5 (Artifact list: 2026-09-28).
  - Sahip A "Amber Saat"i seçti. Kod `d515702`: `components/NightClock.jsx`, `lib/nightClock.js` (+ testler),
    `styles/dalga.css:113-127`, `releases.js:56`. Build 59'da var.
- Kalan:
  - **E**: `YAPILACAKLAR.md:258-260` (müzik bitince telefon kendiliğinden kilitleniyor mu, kilit açılınca saat güncel mi,
    kayma, Hareketi Azalt, açık temada gri kenar).
  - D (küçük): Artifact bağlantısı YAPILACAKLAR'da yok.
  - Not: uygulanan şey uygulama içi uyku ekranı. iOS kilit ekranında (Live Activity) saat yok. Sahip "kilit ekranı" ile
    bunu kastettiyse ayrı iş olur (teyit: C).
- Kimin işi: sahip.

## 8. App Store Connect aylık fiyat ₺89,99
- **Sınıf: C.**
- Kanıt:
  - `YAPILACAKLAR.md:516` "₺99,99 görünüyor, istenen ₺89,99 → düzeltilecek" `[ ]`.
  - İstenen fiyat `docs/abonelik/KURULUM.md:37`; uygulamadaki yedek `screens/Paywall.jsx:24` ₺89,99.
  - Uygulama mağaza fiyatını RevenueCat'ten gösterir (`lib/subscription.js:140`). Düzeltilmezse ekranda ₺99,99 görünür.
  - Depoda düzeltildiğine dair kayıt yok.
- Sonraki adım: sahip App Store Connect → Abonelikler → Nefona Aylık → Fiyat: ₺89,99. Sonra YAPILACAKLAR:516 kapanır.
- Kimin işi: sahip.

## 9. pbxproj Team ID
- **Sınıf: C** (engelleyici değil).
- Kanıt:
  - `grep DEVELOPMENT_TEAM app/ios/App/App.xcodeproj/project.pbxproj` boş; pbxproj geçmişinde hiç yok (`git log -S`).
  - Betikler ekibi komut satırından veriyor: `app/scripts/testflight.sh:10,55,73` ve `device-run.sh:9,41`
    (`TEAM_ID="B39WKYD399"`). Her çalışmada pbxproj'u geri alıyorlar (`testflight.sh:25`).
  - Build 59 bu yolla yüklendi.
  - Yalnız Xcode'u elle açıp derlerken Team seçilir (`app/docs/APP_STORE_KURULUM.md:90`).
- Sonraki adım: sahip Xcode'u elle kullanmıyorsa madde kapanır. İstenirse pbxproj'a `DEVELOPMENT_TEAM = B39WKYD399`
  eklenir (Debug + Release), ama çalışan iş akışları app/ altında bittikten sonra.
- Kimin işi: sahibin kararı, uygulama Claude.

## 10. nefona.com alan adı
- **Sınıf: C.**
- Kanıt:
  - `YAPILACAKLAR.md:522` "yayın gününe kadar alınmaz" (sahip kararı), `:538` `[ ]`.
  - Vercel `get_domain_availability("nefona.com")` → `available: true` (2026-09-30): alınmadı, hâlâ boşta.
  - Destek e-postası ve Supabase e-posta girişi (SMTP) buna bağlı (`:536-537`, `:571`).
- Sonraki adım: sahip yayın gününü beklemeyi yeniden düşünebilir. Başkası alabilir; bedeli 11,25 USD/yıl (`:522`).
- Kimin işi: sahip.

## 11. Marka tescili ("Nefona")
- **Sınıf: C**; üstelik belgede hiç yok.
- Kanıt: `grep -rniE "marka tescil|tescil|TÜRKPATENT"` (docs, app/src, site) yalnız UFOV/CVS-Q araştırma notlarını
  buluyor (`docs/arastirma/ajan-raporlari/20_...md:197`, `18_...md:19`). YAPILACAKLAR'da madde yok, ilerleme kaydı yok.
- Sonraki adım: YAPILACAKLAR §3 "Mağazaya çıkmadan önce"ye madde eklenmeli. Başvuruyu sahip yapar (sınıf 9/42/44).
- Kimin işi: sahip (başvuru), Claude (belgeye ekleme).

## 12. (a) cihaz kontrol listesi (E testi haftada bir + okuma testi ayrı gün)
- **Sınıf: E.**
- Kanıt:
  - `YAPILACAKLAR.md:80-81` `[~]` "cihazda doğrulanıyor … aşağıdaki liste sürüyor"; liste `:136-176`.
  - Sahipten gelen tek sonuç: "Haftalık E testi · Bu hafta tamam" (`:81`).
  - Kod Build 59'da (`26419b4`).
- Sonraki adım: sahip listeyi Build 59'da yürütsün. 8. gün ve 22. gün maddeleri takvim ister (sahte tarih ya da eski hesap).
- Kimin işi: sahip.

## 13. (b) cihaz kontrol listesi (ilk açılışta önce ölçüm)
- **Sınıf: C → E.**
- Kanıt:
  - `YAPILACAKLAR.md:178-179` "CİHAZDA DENENMEDİ, TestFlight'a girmedi"; liste `:192-205`.
  - `c7af2af`, `752d593`, `6b441f3`, `c4ce6b4` Build 59'da YOK (`merge-base` → NO).
  - Bug 31 ve Bug 32 de "sonraki TestFlight'ta görülecek" (`HATA_GUNLUGU.md:778`, `:790`).
- Sonraki adım: önce yeni TestFlight (madde 14), sonra liste.
- Kimin işi: sahip.

## 14. Bekleyen Mac TestFlight komutu
- **Sınıf: C** (+ D: belgedeki madde eski).
- Kanıt:
  - `YAPILACAKLAR.md:12-13` "Şimdi 1: TestFlight derlemesi, içinde fffa276, 1a85b1c, fe06f26, ee417db". Dördü de Build 59'da
    var (`merge-base` → yes). Madde bu hâliyle eski.
  - Gerçek bekleyen: Build 59'dan sonraki derleme (`releases.js:9-11` '2026-09-29-2'). `git log 26419b4..HEAD -- app/`
    13 commit içeriyor: (b), Bug 32, yoga ilk bölüm, Y1.
  - **Uyarı**: `testflight.sh:26` `git pull --ff-only` ile o anki dalın ucunu derler. Uçta ara kayıtlar var: `70ca7d5`
    "Y1 5 saniye turu (ara kayıt)", `8a42d62` "S0 … (ara kayıt)". Yoga yeniden tasarımı da sürüyor.
- Sonraki adım: çalışan üç iş akışı bitip kaydedilmeden sahibe komut verilmesin. Sonra
  `bash ~/Projects/eyes/app/scripts/testflight.sh` ve YAPILACAKLAR:12'nin yeni derlemenin içeriğiyle yeniden yazılması.
- Kimin işi: sahip (Mac); zamanlama orkestratörün.

## 15. Belgede açık görünen ama bitmiş satırlar (toplu D)
Kimin işi: Claude, belge düzeltmesi (app/ dışında).

| Yer | Belgede | Gerçek (kanıt) |
|---|---|---|
| `HATA_GUNLUGU.md:501` | Bug 20 "AÇIK" | Paketteki CAF sesi çaldı (Gün Işığı, `YAPILACAKLAR.md:234`) |
| `HATA_GUNLUGU.md:537` | Bug 22 "cihazda doğrulanacak" | Cihazda doğrulandı (`HATA_GUNLUGU.md:616-617`) |
| `HATA_GUNLUGU.md:628` | "Gün Işığı çaldı mı, 9 simgesi (bekleniyor)" | İkisi de görüldü (`YAPILACAKLAR.md:234`) |
| `HATA_GUNLUGU.md:530` + `YAPILACAKLAR.md:44-45` | Bug 21 "AÇIK", "Düzeltilsin mi?" | Düzeltildi (`HATA_GUNLUGU.md:567-571`); yalnız cihazda doğrulama kaldı (E) |
| `HATA_GUNLUGU.md:767` | Bug 30 "Mac'te yeniden çalıştırılacak" | Nef sunucusu yayımlandı, 97f2f87 (`YAPILACAKLAR.md:131-133`) |
| `YAPILACAKLAR.md:273-274` | "Deneme 2 sonucu bekleniyor" | Sonuç geldi (`:233-235`) |
| `YAPILACAKLAR.md:275-278` | Alarm tasarımı "ONAY BEKLİYOR + 5 soru" | v2/v3 kararları verildi (`:279-289`), kod v5'te |
| `YAPILACAKLAR.md:316` | Araştırma 2 "karar bekliyor" | Kararlar kodda (`:329-333`) |
| `YAPILACAKLAR.md:244` | iOS 26 öncesi `[ ]` | Yapıldı (madde 5c) |
| `YAPILACAKLAR.md:266-268` | Nefesle kapanma "karar bekleniyor" | Onaylandı (`:289`); iş başlamadı (A) |
| `YAPILACAKLAR.md:12-13` | TestFlight içeriği | Build 59'da (madde 14) |
| `ANA_BELGE.md:119-120`, `:135` | WHO-5 kaydı yok; Göz kırp süre yok | `Who5.jsx:46`; `YAPILACAKLAR.md:407` |
| `HATA_GUNLUGU.md:498`, `YAPILACAKLAR.md:30-31` | AppIcon.icon derlemesi doğrulanmadı | Build 59 derlendi (madde 2) |
