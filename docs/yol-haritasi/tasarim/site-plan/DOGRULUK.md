# DOĞRULUK · TASLAK.md denetimi

Tarih: 2026-09-30. Denetleyen: doğruluk eleştirmeni. Depo salt okunur tarandı. Hiçbir dosya değişmedi, test ya da
derleme koşulmadı. Denetim anında `HEAD` = `653a716`.

Etiketler:
- **DOĞRULANDI:** depoda kanıtı açık.
- **OLASI:** kanıt güçlü ama bir adım yorum ister.

**Tek bakışta**
- TASLAK'taki 60'a yakın olgusal iddiadan çoğu doğru. Dosya yolları, satır numaraları, sayılar ve kapı adları büyük ölçüde
  tutuyor (tablo §7).
- **10 yanlış ya da eski iddia var (§2).** En önemlileri şunlar:
  - TASLAK'ın dayanağı eski (`e71abe6`).
  - §4'teki kayıt depoda zaten var.
  - Ekran düzeneği "kayıp" değil.
  - Sharpe 2023 yayımlanmamış Ders 3'ün kaynağı.
  - "Yoga sitede hiç yok" ancak bir sonraki derlemeye kadar doğru.
- **6 mantık sorunu var (§4).** En ağırları şunlar:
  - `[~]` kuralı bugünkü siteyle çelişiyor.
  - "Madde girdiden çıkar" kuralı Bug 31 kuralıyla çelişiyor.
  - "Yasak sözcük taraması = 0" koşulu bugünkü uyarı cümleleriyle hiç sağlanamaz.
- **Sağlık iddiası:** TASLAK'ın siteye önerdiği cümlelerde yok. Bir cümle ("yeni duraklar zamanla açılır") uygulamada
  olmayan bir şeyi vaat ediyor gibi okunabilir (§5).
- **TASLAK'ın gözden kaçırdığı site sorunları (§6):** Sitede sağlık iddiasına yaklaşan bir cümle var. 20-20-20 bölümü
  "işe yaradı" diyor. Uygulamanın kendi kanıt notu ise tersini söylüyor.

---

## 1. Yöntem

- TASLAK'taki her dosya yolu açıldı ve anılan satır okundu. Sayılar kaynağından sayıldı.
- Kapı ve karar numaraları plan dosyalarında arandı:
  - `SONSUZ_YOL.PLAN.v1.md`
  - `yoga-pilot/v3/PLAN.v3.md`
  - `S0/sorular-kararlar.md`
- Durum işaretleri şu belgelerle karşılaştırıldı:
  - `YAPILACAKLAR.md`
  - `HATA_GUNLUGU.md`
  - `Y1_KOD_RAPORU.md`
  - `ACIK_ISLER.md` (653a716)
- Kod karşılığı `app/src` ve `app/ios/App/App` içinde arandı. `app/src/modules/yoga` altındaki kaydedilmemiş değişikliklere
  dokunulmadı.
- Sharpe 2023, PubMed'de yeniden açıldı.

---

## 2. Yanlış ya da eski iddialar (düzeltilmeli)

**D1 · Dayanak eski (TASLAK satır 4: "`HEAD` = `e71abe6`").** DOĞRULANDI.
- TASLAK yazıldıktan sonra iki kayıt geldi.
- `f810065` "Sahip kararları: site son aşama, ana sayfa şimdi yeniden tasarlanır, 28 Eylül notları gösterilir".
- `653a716` "Açık işler denetimi" (`docs/yol-haritasi/ACIK_ISLER.md`).
- TASLAK bu iki kaydın hiçbirini anmıyor. İkisi de siteyi doğrudan ilgilendiriyor (§8).
- Öneri: Dayanak satırı `653a716` olsun ve §8'deki maddeler işlensin.

**D2 · §4'teki SAHIP_ISTEKLERI kaydı zaten var.** DOĞRULANDI.
- `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:98-103` şu başlığı taşıyor: "## Sahibin 2026-09-30 isteği: nefona.com
  güncellemesi (son aşama)". Kayıt `f810065` ile eklendi.
- TASLAK "yeni kayıt dosyanın 7. `##` başlığı olur" diyor. O başlık artık orada. Arkasından 8. başlık da geldi (`:105`, ana
  sayfa ve sürüm notu kararları).
- §4 olduğu gibi uygulanırsa aynı istek iki kez yazılır.
- Öneri: §4 kaldırılsın ya da yalnız var olan kaydın son cümlesi değişsin: "Plan bölümü taslağı hazırlanıyor." →
  "Plan: §3.K".
- Not: Var olan kayıt sözü "kelimesi kelimesine" diye veriyor. Ama sahibin metnindeki çift boşluğu ve virgül önündeki
  boşluğu düzeltmiş ("yoga, sonsuzluk, alarm"). TASLAK K.1'deki alıntı ise aynen doğru ("yoga,  sonsuzluk , alarm").

**D3 · "Bugünkü site görsellerinin düzeneği kayıp (`_harness/site.html` ve `siteSeed.js` yok)" (K.4).** DOĞRULANDI: yanlış.
- Dosyalar depoda yok ama kayıp değil. İki kopya bu oturumun karalama alanında duruyor:
  - `…/scratchpad/shotwt/app/_harness/`: `site.html`, `site.jsx`, `siteSeed.js`, `vite.site.mjs`, `capmock.js`, `main.jsx`
  - `…/scratchpad/haftalik/shots/_harness/`: `site.html`, `site.jsx`, `siteSeed.js`
- `ACIK_ISLER.md:452-455` (E-A7) aynı şeyi söylüyor. `shotwt` bir worktree'dir; silinmeden önce düzenek alınmalı
  (`ACIK_ISLER.md` E-A8).
- Ayrıca `app/_harness/y1path.html` ve `y1path.jsx` yerelde var. Bu dosyalar `.git/info/exclude` ile depo dışında tutuluyor.
  `home-path-*` görseli bu düzenekle çekildi (`Y1_KOD_RAPORU.md:44`).
- Öneri: "Düzenek kayıp" yerine şu yazılsın: "Düzenek depoda değil. Karalama alanındaki kopya ve `y1path` depoya alınır.
  Y1'in `cek.sh`'ı site görünümlerini de çekecek biçimde genişletilir."

**D4 · "kaynak listesi tek yerde, `lib/sources.js`'te kalır" (K.4, veri hattı).** DOĞRULANDI: yanlış öncül.
- Bugün kaynaklar üç yerde duruyor:
  - `lib/sources.js`: 31 kayıt, DOI ve PMID'li.
  - `lib/evidence.js:97-110`: alarm kartının 12 kaynağı. Bunlar düz metin, yalnız PMID'li, DOI yok. Hiçbiri `sources.js`'te
    değil.
  - `lib/yogaLessons.js`: her dersin `src(pmid, cite, doi)` listesi.
- Yoga için `sources.js`'te yalnız `luu2024` var (`ACIK_ISLER.md:94-97`, A9).
- Öneri: "kalır" yerine "toplanır" yazılsın. Kaynakların `sources.js`'e taşınması `app/src` işidir ve kod oturumuna
  düşer (A9). Veri hattı bunu beklemeden `evidence.js` ve `yogaLessons.js`'ten de okuyabilir.

**D5 · Yoga satırında "karşı kanıt da yazılır (Sharpe 2023)" (K.3).** DOĞRULANDI: bugünkü duruma uymuyor.
- Sharpe 2023 yalnız Ders 3'ün (Uykuya Geçiş) kaynak listesinde (`lib/yogaLessons.js:176`).
- Ders 3 yayımlı değil. Tek yayımlı sürüm Ders 2 · 15 dk (`:134`).
- TASLAK'ın kendi kuralı şu: "Yalnız yayımlı içeriğin kaynakları görünür" (K.4 adım 3). Sharpe 2023 bugün sitede
  görünemez.
- Künye doğru. PubMed kaydına göre: Sharpe ve ark., *J Psychosom Res* 2023;166:111169, PMID 36731199,
  [doi:10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169).
  - Uykusuzluk bildiren 22 yetişkinle yapılmış randomize bir ön çalışma.
  - 30 dakikalık yoga nidra, sessizce uzanmaya göre uykuya dalma süresini değiştirmedi.
- Öneri: Ders 2'nin kendi sınır cümlesi kullanılsın: "alandaki çalışmaların çoğunun kalitesi düşük", `yogaLessons.js:105`.
  Sharpe 2023, Ders 3 yayımlandığı gün eklenir.

**D6 · "Yoga | Bugünkü site: Hiç yok" (K.3).** DOĞRULANDI: kısmen doğru.
- Kaynak sayfalarda (`site/pages/*.html`) yoga geçmiyor. Son üretilen `site/src/data.json` (29 Eylül 14.20) yogasız.
- Ama `site/scripts/data.mjs:18-29` her `manifest.js`'i süzmeden alıyor. Yoga manifesti de `HEAD`'de var.
- Bir sonraki `npm run build` şunları kendiliğinden ekler:
  - Modüller sayfasına ve ana sayfanın modül bölümüne açıklamasız bir "Yoga" satırı. `site/src/main.js`'teki `MOD_DESC`'te
    yoga yok.
  - Kaynakçaya Luu 2024.
- Öneri: Satır "Kaynak sayfalarda yok; bir sonraki derlemede açıklamasız girer" diye yazılsın. Veri hattı düzeltmesi ilk
  yayından önceki işlere alınsın.

**D7 · "Günün ritmi" (K.3, Y1 satırı).** DOĞRULANDI: ekrandaki ad farklı.
- Kullanıcının gördüğü metin "Bugünün ritmi" (`app/src/screens/Breath.jsx:520`).
- "Günün ritmi" yalnız kod yorumlarında geçiyor (`lib/ladders.js:20`, `lib/progression.js:198`).
- `Y1_5SN_SONUCLARI.md` de "Bugünün ritmi" diyor.
- TASLAK'ın kuralı "Uygulamadaki cümlenin aynısı kullanılır". Buna göre ad "Bugünün ritmi" olmalı.

**D8 · Y1'in sitedeki yeri yalnız `index.html:94` olarak verilmiş (K.2, K.3).** DOĞRULANDI: eksik.
- `site/pages/index.html:93`'teki görsel alt metni de Y1'e ait: "3 dakikalık nefesle başlayan 5 dakikalık mola".
- Bu alt metin de metin kapısında bekliyor (`Y1_KOD_RAPORU.md` §6 madde 2; `ACIK_ISLER.md:489` ":89-94").
- Ayrıca tırnak içindeki "ilk gün 8 dk, her gün bir adım" sayfadaki cümle değil. Sayfadaki cümle şu: "Yol ilk gün 8
  dakikadır ve her gün bir adım büyür."
- Öneri: `:93-94` yazılsın, alıntı aynen verilsin.

**D9 · "Alan adının boşta olduğu ve fiyatı 29 Eylül bilgisidir; yeniden denetlenmedi" (§5).** OLASI: eski.
- `ACIK_ISLER.md:243` şöyle diyor: "nefona.com 2026-09-30'da boştaydı (Vercel sorgusu, eski 10)". Aynı yer 11,25 USD/yıl
  fiyatını da veriyor.
- Öneri: Tarih 30 Eylül olsun ve kaynağı bu satır olsun. Yayın günü yine yeniden bakılır.

**D10 · "yoga kanıt kartı" (K.3).** DOĞRULANDI: böyle bir kart yok.
- `lib/evidence.js`'te 6 kart var: acuity, trend, reading, blink, brain, alarm. Yoga kartı yok.
- Yoganın dayanağı derse bağlı: `evidenceLine`, `evidenceByMinutes` ve `sources` (`yogaLessons.js`).
- Öneri: "yayımlı dersin 'Neye dayanıyor' satırı ve kaynakları" yazılsın. Ayrı bir kart yapılacaksa bu yeni iş olarak
  belirtilsin.

---

## 3. VARSAYIM diye işaretli ama depoda kanıtı olanlar

**V1 · "VARSAYIM: Build 59 bilinen son TestFlight'tır; Y1 ve yoga TestFlight'a girmedi" (§5).** DOĞRULANDI.
- `YAPILACAKLAR.md:131`: "TestFlight Build 59 (commit 26419b4 …) yüklendi".
- Yoga (`0b076ba`) ve Y1 (`6ea6890`) bu kayıttan sonra geldi (`git merge-base --is-ancestor 26419b4 …`).
- `docs/yol-haritasi/acik-isler-denetimi/yolharitasi.md` §0: "Sonrasında 'Build'/'TestFlight' kaydı yok".
- Öneri: VARSAYIM etiketi kalksın, bu üç kaynak yazılsın.

**V2 · "VARSAYIM: App Store dışındaki sitede de 'yakında' satırı 2.3.1 riski taşır" (K.7, §5).** Kısmen DOĞRULANDI.
- Depodaki kılavuz kopyası (`docs/yol-haritasi/tasarim/arastirma-v1/apple/guidelines.html`, 2.3.1(a)) şunu açıkça
  yazıyor: "promoting content or services that it does not actually offer … whether within or outside of the App Store".
- Kuralın site için de geçerli olduğu kanıtlı. Bir "yakında" satırının ya da "sonsuz" sözcüğünün bu kapsama girip
  girmediği ise yorumdur.
- Öneri: VARSAYIM bu yoruma daraltılsın, kopya kaynak olarak anılsın.

---

## 4. Mantık sorunları (TASLAK kendi içinde ya da kurallarla çelişiyor)

**M1 · "`[~]` olan iş sitede anlatılmaz" (K.2) bugünkü siteyle çelişiyor.** DOĞRULANDI.
- Bugünkü sitenin anlattığı işlerin çoğu `[~]`:
  - Haftalık E testi ve başlangıç kuralı (`YAPILACAKLAR.md:80`): ana sayfa, Nasıl çalışır ve Destek bunu anlatıyor.
  - Veri merkezi (`:375`).
  - İris haritası ve Gelişim (`:379`).
  - Parlaklık (`:600`).
- `[x]` işaretli madde sayısı 16. Bunların çoğu karar ya da alt iş.
- K.2 yalnız Y1 ve (b) örneklerini veriyor. "Modül beklemeyen tek iş" satırı ise yalnız yanlış cümleleri sayıyor.
- Kural harfiyen uygulanırsa bugünkü sitenin büyük kısmı çıkar.
- Öneri: Kuralın kapsamı açıkça yazılsın. Seçenek 1: "Bu kural yeni özelliklere uygulanır. Bugün sitede olan `[~]` işler
  için ilk yayından önce ayrı bir liste çıkarılır."
- Seçenek 2: İlk satıra "`[~]` olup sitede anlatılan işler" eklensin.
- Hangisinin seçileceğine sahip karar verir.

**M2 · "Cihazda doğrulanmamış madde girdiden çıkar" (K.4 adım 5) sürüm notu kurallarıyla çelişiyor.** DOĞRULANDI.
- Girdi uygulamayla birlikte TestFlight'a gider. Cihaz denemesi ondan sonra yapılır.
- Kural: "TestFlight'a gitmiş girdiye madde eklenmez, her TestFlight yeni id alır" (Bug 31, `HATA_GUNLUGU.md:777-786`).
- `f810065` kararı: 28 Eylül maddeleri gösterilir, bir sonraki girdiye taşınır.
- `site/pages/yenilikler.html:7` "Uygulamanın içindeki … listenin aynısı" diyor.
- Uygulamanın girdisinden madde çıkarmak Apple 2.3.12 ile de çatışır. 2.3.12 yeni özelliklerin "What's New"da açıkça
  yazılmasını istiyor (depodaki kopya).
- Öneri: Süzme uygulamanın girdisinde değil, sitede yapılsın. Site yalnız cihazda `[x]` olan maddeleri basar ve Yenilikler
  sayfasının "aynısı" cümlesi buna göre değişir. Ya da site yalnız bütün maddeleri `[x]` olan girdileri basar.

**M3 · "Yasak sözcük taramasında sonuç 0" (K.5) bugünkü uyarı cümleleriyle sağlanamaz.** DOĞRULANDI.
- K.6 yasak sözcükleri sayıyor: tedavi, önler, teşhis, Hz. Bu sözcükler sitede ve sitenin veri kaynağında zaten var:
  - "Tanı koymaz, tedavi etmez": `index.html:17`, `destek.html:8`, `kosullar.html:11`, alt bilgide `site/scripts/pages.mjs:66`.
  - "Yapmadığımız iddialar" listesi: "Miyopiyi önler ya da tedavi eder.", "demansı önler", "Teşhis koyar …"
    (`lib/evidence.js:118-120`).
  - "Tedavi değildir" (`evidence.js:67`, `:96`).
  - "~500 Hz zengin ton" (`evidence.js:94`, `:96`, `:107`). Kaynağı var: Bruck 2009, Smith 2019.
- Kural harfiyen uygulanırsa ya koşul hiç sağlanmaz ya da biri uyarıları siler.
- Öneri: Tarama olumsuzlanan cümleleri, "Yapmadığımız iddialar" listesini ve kaynağı olan kanıt kartını ayırsın. K.6'daki
  "Hz" yasağı "kaynaksız" nitelemesiyle yazılsın.

**M4 · Tetik TestFlight'a bağlı, ama site kamuya açık ve App Store'u anlatır (K.2, K.5).** OLASI.
- K.2'nin tetiği şu: "TestFlight derlemesinde çalışır ve … cihazda `[x]`".
- Yoga planında modülün App Store'a çıkışı ayrı bir kapıdır: Kapı 8 "App Store derlemesi" (`yoga-pilot/v3/PLAN.v3.md:1052`).
- TestFlight'ta `[x]` olup App Store'a çıkmamış bir özellik, uygulamayı App Store'dan indiren kişi için "olmayan özellik"
  olur. 2.3.1(a) "outside of the App Store" diyor.
- K.7-1'in önerisi sitenin ilk App Store gönderiminden önce yayına çıkması. O noktada iki derleme aynıdır. Sonrası için
  kural eksik.
- Öneri: Tetiğe şu eklensin: "App Store'dan sonra: özellik yayımlanan App Store sürümünde de var".

**M5 · Alarm: "'Sessiz modda da çalar' cümlesi yazılmaz" doğru, ama aynı cümle uygulamanın kendi izin metninde duruyor.** DOĞRULANDI.
- `app/ios/App/App/Info.plist:12` (`NSAlarmKitUsageDescription`): "… alarm sessiz modda da çalar."
- Cihazda doğrulanmadı: `YAPILACAKLAR.md:234-235` "sessiz modda çalma ayrıca doğrulanmadı".
- Bu açık sitenin değil, uygulamanın. Ama "kanıtsız iddia yok" kuralına ve TASLAK'ın "Bugünkü uygulama" satırının amacına
  giriyor.
- Öneri: Bu satır alarm cihaz listesine ve "modül beklemeyen işler"e eklensin. Ayrı bir uygulama maddesi olarak kod
  oturumuna gitsin.

**M6 · "Alarm … Seçilen sesin çaldığı cihazda doğrulandı" (K.1).** OLASI: bağlam eksik.
- Doğrulama Build 59'dan önceki bir derlemede yapıldı (`HATA_GUNLUGU.md:672-673`).
- Build 59'dan sonra `AlarmPlugin.swift` 1024 satır büyüdü (`git diff --stat 26419b4 HEAD`: `0b076ba` ve `58fa1c1`).
  Yoganın `LessonPlayer`'ı bu dosyada.
- Bu dosya derlenmedi (`ACIK_ISLER.md:59-60`).
- Öneri: "Doğrulama Build 59 öncesinden. Alarm cihaz listesine bir sonraki derlemede yeniden bakılır" notu eklensin.

---

## 5. Sağlık iddiası ve vaat taraması (TASLAK'ın siteye önerdiği cümleler)

| Önerilen cümle | Sonuç |
|---|---|
| "Bu cümleyi okurken kaç kez göz kırptın?" (Y3) | İddia yok. Plan §3.F.2 (`SONSUZ_YOL.PLAN.v1.md:1031-1036`) sitede ölçüm ve sağlık iddiasını ayrıca yasaklıyor. |
| "28. gün bir kilometre taşıdır, yol sonra da sürer." | İddia yok. Plan §1 ile uyumlu. |
| "yüzlerce ritim" (230) | Sayı doğru. 230 seçilebilir bileşim var (`Y1_KOD_RAPORU.md:173-176`, "Yüzlerce bileşim sözü tutar"). |
| Sabah akışı "isteğe bağlı" | Ayrıca bakılmadı. Cihaz listesinde doğrulanmalı. |
| **"Yol her gün sürer; yeni duraklar zamanla açılır."** (K.7-2) | **OLASI vaat riski.** Açıklama tablonun altında. |

**"Yeni duraklar zamanla açılır" cümlesinin sorunu:**
- Plan yeni durakların 2.–9. günlerde geldiğini söylüyor. 9. günde tam yola ulaşılıyor, sonrası çeşitlemedir
  (`SONSUZ_YOL.PLAN.v1.md:30-33`).
- Yeni modüller (uyku, yürüyüş, tepki) planın "sonra" satırında ve kodda yok.
- 90. günden sonraki haftalık odak da kodda yok (`ACIK_ISLER.md:99-103`, A10).
- "Zamanla açılır" sözü, yapılmamış duraklar için sınırsız bir vaat gibi okunabilir. Bu, K.6'daki "Y2–Y6'nın yapılmamış
  işleri" yasağına değer.
- Öneri: "İlk dokuz günde yol her gün bir adım büyür; sonra her gün biraz değişerek sürer." Bu da ekrandaki cümleyle
  karşılaştırılmadan yazılmamalı.

TASLAK'ın geri kalanında sağlık iddiası yok. Yasak sözcükler yalnız K.6'nın yasak listesinde geçiyor.

---

## 6. TASLAK'ın gözden kaçırdığı site cümleleri (K.3 ilk satıra ve §3 maddesine eklenmeli)

**O1 · `site/pages/nasil-calisir.html:31` "Okuma testi, nefes sayma …".** DOĞRULANDI.
- Emekli modül Modüller sayfası dışında burada da geçiyor.
- Kanıt: `app/src/modules/breath-count/manifest.js:2` ("Build 26: emekli") ve `:24` (`retired: true`).

**O2 · `site/pages/index.html:58-59` 20-20-20 bölümü.** OLASI: sağlık iddiasına yakın.
- Başlık "Mola hatırlatıldıkça işe yaradı". Metin sonunda şöyle diyor: "Nefona'nın günlük yolundaki uzağa bakış ve mola bu
  kuralı uygular ve her gün hatırlatır."
- Uygulamanın kendi kanıt notu tersini söylüyor. `app/src/components/RestBreak.jsx:10-13`: "20-20-20 kuralının … semptomlara
  etkisi gösterilemedi (Johnson & Rosenfield 2022 …) … metin sağlık iddiası taşımaz". Aynı dayanak `lib/gokyuzu.js:116`'da
  "Küçük ve kontrol grubu olmayan bir çalışma" diye geçiyor.
- "İşe yaradı" başlığı ile "Nefona bu kuralı uygular" cümlesi yan yana durunca faydayı Nefona'ya aktarıyor.
- Yolun 20 dakikada bir hatırlatıp hatırlatmadığı bu denetimde doğrulanmadı.

**O3 · `site/pages/index.html:65` "Bu yüzden Nefona'da sabah alarmı gün ışığına, gece saati karanlığa göre tasarlandı."** OLASI.
- Gözlemsel bir ilişkiden ("neden-sonuç değil" diye yazılmış) tasarım gerekçesi çıkarıyor.
- Alarmın "gün ışığına göre" tasarlandığını gösteren bir kod bulunamadı. Seslerden birinin adı "Gün Işığı".
- TASLAK'ın alarm satırı `:86` ve `:98`'i anıyor, bu satırı anmıyor.

**O4 · `site/pages/gizlilik.html:48` "E-posta adresin başka hiçbir servise gönderilmez."** OLASI.
- E-posta girişi Supabase kod doğrulamasıyla çalışıyor (`app/src/lib/account.js:72-78`).
- Kodun gönderimi bir SMTP sağlayıcısına bağlı (`YAPILACAKLAR.md:536`).
- TASLAK "hesap satırı üç giriş yolunu sayar" diyor. Bu satır da onunla birlikte düzelmeli.

**O5 · `site/pages/destek.html:15` "… hatırlatmalarını telefondan siler".** DOĞRULANDI.
- Deneme hatırlatması (7302) silinmiyor (`app/src/App.jsx:104-106`).

**O6 · Elle yazılmış sayılar.** DOĞRULANDI.
- `site/pages/index.html:209` "6" kanıt kartı sayısını elle yazıyor.
- `:208` yedek olarak "27" gösteriyor. JavaScript çalışınca sayı veriden gelir: bugün 31 kaynak.
- K.4 adım 3 "sayılar elle yazılmaz" diyor. Bu iki yer bugün bu kurala aykırı.

**O7 · TASLAK'ın doğru bulduğu iki açığın ayrıntısı (kanıt eklensin).**
- **Silme:** `gizlilik.html:21` "yalnız tema, ses ve titreşim" diyor. Kod bunlardan fazlasını tutuyor:
  - Deneme anahtarları (`App.jsx:106`, `:1055`).
  - Otomatik ekran ölçüsü (`:1054`, `:1057`).
  - Nef tercihleri, ses seçimi ve alarm kartı tercihi (`lib/prefs.js:2`, `:17`).
- **Konuşma tanıma:** Telefonda tanıma yoksa ses Apple sunucusuna gider. `app/src/screens/ReadingTest.jsx:497`: "tanıma
  için Apple sunucusu kullanılır". İzin metni `Info.plist:81-84`'te. Bu durumda `gizlilik.html:49`'daki "ses kaydı …
  sunucuya hiç gitmez" cümlesi doğru değil.

**O8 · Yoga · yayımlı dosya onaylı dosya değil.** DOĞRULANDI.
- Uygulamada yayımlı Ders 2 · 15 dosyasının SHA-256 değeri `726417fa…`. Bu, pilotun A adımı karışımı.
- Sahibin kulağından geçen ilk bölüm dosyası `yoga-pilot/render/out/ilk-bolum/ders2-15.mp3` ise `c875dcef…`
  (`ACIK_ISLER.md:40-48`, A2; iki değer bu denetimde yeniden hesaplandı).
- K.1'deki "İlk bölümün dört dersinin sesi sahibin kulağından geçti" cümlesi doğru. Ama bugün yayımlı olan dosya o dosya
  değil.
- Sitenin yoga parçası A2'den önce yapılamaz.

---

## 7. Doğrulanan iddialar (kanıtıyla)

| TASLAK iddiası | Kanıt |
|---|---|
| Yalnız Ders 2 · 15 dk yayımlı | `app/src/lib/yogaLessons.js:134` tek `published: true` |
| Dört dersin sesi sahipten geçti; sıradaki numara 19 | `yoga-pilot/SAHIP_ISTEKLERI.md` madde 17–18, son madde 18 |
| Y1: 138 dosya, 1863 test (`e71abe6`) | `e71abe6` kayıt iletisi |
| Ana sayfanın ilk görünümü üç turda geçemedi | `Y1_5SN_SONUCLARI.md:3-5` |
| Alarm: seçilen ses çaldı; cihaz listesi açık, 10 madde | `HATA_GUNLUGU.md:672-673`; `YAPILACAKLAR.md:367-370` |
| Hava durumunun kodu yok | `app/src` ve `ios/App/App`'te WeatherKit, weather, konum izni yok |
| `index.html:86` "bir dakikalık nefesle gün başlar", "bestelendi" | Aynen var |
| `index.html:98` "gözünü ışıkla yormaz" | Aynen var |
| Uyandırma sesleri ElevenLabs Music ile üretildi | `app/src/lib/alarmSounds.js:4` |
| Alarm kartının 12 kaynağı kaynakçada yok | `lib/evidence.js:97-110`; 12 PMID'nin hiçbiri `sources.js`'te yok |
| Gizlilik sayfası mikrofonu ve konuşma tanımayı anmıyor | `gizlilik.html` baştan sona; izinler `Info.plist:81-84` |
| `gizlilik.html:36` telefonda kalan görme ölçümü için rıza diyor, rıza alınmıyor | `lib/consent.js:13`'te yalnız profileSync, health, coach ve coachLife |
| `gizlilik.html:40` e-posta girişini anmıyor; üç giriş yolu | `lib/account.js:4`, `:72`, `:91`, `:139` |
| `gizlilik.html:33` ekran süresi Nef'e gider; Nef rızası 1. sürüm | `consent.js:13` (`coach: 1, coachLife: 1`) |
| Modüller sayfası emekli "Nefes sayma"yı listeliyor | `data.json` modülleri; `breath-count/manifest.js:24` |
| Gökyüzü molası sitede "Bir dakika", uygulamada 2 dk | `site/src/main.js:92`; `lib/gokyuzu.js:8` (`DURATION_SEC = 120`) |
| Yoga: Nef'e dört sayı | `lib/coachCore.js:78-79` |
| Yoga Kapı 4–5; 3 ve 5 dk'lık dersler Kapı 5'te | `yoga-pilot/v3/PLAN.v3.md:1048-1049`, `:562` |
| "230; 629 değil" | `Y1_KOD_RAPORU.md:19`, `:173-176` |
| Y1 cümlesi metin kapısında | `Y1_KOD_RAPORU.md:62`, §6 |
| `nasil-calisir.html:15-16` "önce ölçüm" sırası; (b) `[~]` ve TestFlight'ta yok | Sayfa sırası; `YAPILACAKLAR.md:178-180` |
| Site ilk ekranı "Gözün değişiyor. Sen de gör."; karar 5b; S0 21, Ç11, Ç12, Ç15 | `index.html:7`; plan `:1031`; `S0/sorular-kararlar.md:176`, `:266`, `:271`, `:283` |
| Gelişim anlatımı "en az 0,10 logMAR … doğrulanmış değişim" | `index.html:131`; `nasil-calisir.html:45` |
| `data.mjs` çalışma ağacını okuyor | `site/scripts/data.mjs:9` (`../../app/src`) |
| `tasarim/Y1_5sn_duzenek/cek.sh` depoda | `e71abe6` ile eklendi |
| `acuity-*` ve `sleep-*` hiçbir sayfada yok | `site/pages`, `site/src`, `site/scripts` taraması: 0 |
| Sitenin 8 sayfası; Vercel: kök `site/`, `npm run build`, `dist` | `site/vite.config.js:7`; `YAPILACAKLAR.md:537` |
| 320, 390, 820, 1280 genişlik; Tailscale; yabancı testi beş soru | `YAPILACAKLAR.md:521-529` |
| Apple gizlilik politikası adresi istiyor | `YAPILACAKLAR.md:510` |
| Plan sitenin yayınını Y3'e koyuyor; kapılar S2–S7; S8 yeni | Plan §3.I tablosu (`:1251-1262`); planda "S8" yok |
| Plan §3.H metin kapısı: makine denetimi, iki model incelemesi, sahip | Plan `:1215-1219` |
| §1'de hukukçu yedeği var | Plan `:110`, `:161-166` |
| Yerleştirme yerleri: §3.J → "## Kaynaklar" önü; §3.I'da Y6 ile "sonra" arası | Plan `:1269`, `:1307`, `:1261-1262` |
| `YAPILACAKLAR.md:539` "Sonra: İngilizce sürüm"; `:7` "Son güncelleme: 2026-09-29" | Aynen var; dosya `653a716` ile değişmedi |
| 5 saniye kuralı: en az 3, birbirini görmeyen değerlendirici, çoğunluk "evet" | `tasarim/SAHIP_ISTEKLERI.md:82-90` |
| Sitede analiz kitaplığı ve kamera yok | `site/` taraması: gtag, analytics, getUserMedia 0 |
| `app/src/modules/yoga`'da kaydedilmemiş değişiklik var | `git status`: 6 değişik dosya ve 1 yeni dosya |

---

## 8. TASLAK'a girmesi gereken yeni kayıtlar (`f810065`, `653a716`)

- **`f810065` (SAHIP_ISTEKLERI `:105-113`):**
  - Uygulamanın ana sayfası şimdi yeniden tasarlanır ve TestFlight beklemez. Yoga hazır olunca TestFlight, ana sayfanın
    bugünkü hâliyle çıkar. Bu, K.3'teki `home-*` görsellerinin ne zaman çekileceğini belirler.
  - 28 Eylül sürüm notu maddeleri bir sonraki girdiye taşınır. Bu da site Yenilikler sayfasına girer (bkz. M2).
- **`653a716` (`ACIK_ISLER.md`):** Site planıyla doğrudan ilgili beş madde var.
  - B4 (`:509-510`): bu taslak işi.
  - E-A7 (`:452-455`): düzenek (D3).
  - E-C6 (`:488-493`): sitedeki Y1 içeriği "cihazda görülünce" diye işaretlensin.
  - C14 (`:242-246`): alan adı şimdi alınsın.
  - A4 (`:57-64`): "site yalnız Y1 sürümüyle yayınlanır" koşulu yazılı değil (G-02).
- TASLAK'ın K.2 kuralı E-C6'yla uyumlu. Ama `Y1_KOD_RAPORU.md:62`'deki "site Y1 sürümüyle aynı gün yayınlanmalı" koşulu
  hâlâ yürürlükte. İkisinden hangisinin geçerli olduğu K.2'de açıkça yazılmalı.
- A2 (yayımlı Ders 2 · 15'in değişmesi, O8) ve A9 (yoga kaynaklarının `sources.js`'e girmesi, D4) sitenin yoga parçasının ön
  koşuludur. K.3'ün yoga satırına eklenmeli.
