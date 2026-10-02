# Açık işler · YOGA (salt okunur denetim, 2026-09-30 10:50 UTC)

Depo: `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `70ca7d5`, çalışma ağacı temiz (`git status --short` boş).
Depoda hiçbir dosya değişmedi; test/derleme koşulmadı. Yollar depo köküne görelidir.

Sınıflar: **A** bitmemiş, kimse yapmıyor · **B** bitmemiş, şu an çalışan bir işte · **C** sahibin kararı/eylemi bekliyor ·
**D** aslında bitmiş ya da karar verilmiş, belge eski · **E** cihazda doğrulama bekliyor.

Şu an çalışanlar (açık iş sayılmaz): yoga ekranlarının 5 sn yeniden tasarımı (`app/src/modules/yoga`), Y1 5 sn turu
(Home, TodayPath, Breath; `70ca7d5`), S0 tasarım sayfası.

## Özet tablo

| # | Başlık | Sınıf | Kimin işi |
|---|---|---|---|
| Y-01 | İlk bölümün sesleri uygulamaya konmadı | A | kod oturumu |
| Y-02 | Uygulamadaki Ders 2 · 15 dk eski dosya (A adımı karışımı) | A | kod oturumu |
| Y-03 | Yeni `timeline.json` (v2) ile oynatıcı uyumsuz: kapanış noktası, evre ışığı, Ders 1 halkası | A | kod oturumu (yoga tasarım turundan sonra) |
| Y-04 | Kodek testi paketi ve Mac ölçüm betiği yok | A (+C) | render oturumu, sonra sahip |
| Y-05 | İlk bölümün WAV ana kopyaları bu ortamda yok, yedeği kayıtlı değil | A | render oturumu |
| Y-06 | SPEC §10 yardımcı dosyaları kurulmadı | A | render oturumu + kod oturumu |
| Y-07 | "Kaldığın yerden" kartı yok | A | kod oturumu |
| Y-08 | Ders kaynakları `sources.js`'te yok, kartta çalışma türü yok | A | kod oturumu |
| Y-09 | `releases.js`'te yoga sürüm notu yok | A | kod oturumu |
| Y-10 | Kalan altı ders (4, 6, 7, 8, 9, 10): metin ve ses yok | A (+C) | metin oturumu; seslendirme sahip kararı |
| Y-11 | Defter: TTS uzlaştırılmadı, ≈ 740 kredi açıklanamadı | A (düşük) | render oturumu |
| Y-12 | Uyku kısılma MP3'lerini iOS paketinden çıkarma | A (düşük) | kod oturumu |
| Y-13 | Ekran tasarımı / Kapı 3 | B | yoga 5 sn tasarım turu |
| Y-14 | Kodek kör dinlemesi ve bit hızı kararı | C | sahip |
| Y-15 | Karar 6: gerçek indirme boyutu ölçümü | C (+A) | sahip (hazırlık: kod oturumu) |
| Y-16 | Nef sunucusu yoga istemiyle yeniden yayımlanmadı | C | sahip onayı, sonra orkestratör |
| Y-17 | Editör / usta hoca / psikolog onayı bekleyen metinler | C | sahip (ya da karar 2 yedeği) |
| Y-18 | Gelişim rekor kutusu "Yoga · pratik yapılan gün" | C | sahip |
| Y-19 | Veri merkezi kararları (verifiedChange, 10 modül sınırı, rıza metni) | C | sahip / hukukçu |
| Y-20 | S3: Now Playing'in iOS önerilerinden çıkarılması | C | sahip |
| Y-21 | Ses ve müziğin ticari kullanım koşulları | C | sahip |
| Y-22 | Swift derlenmedi | E | sahip (Xcode) |
| Y-23 | Kapı 4 cihaz listesi (Ders 2, kilitli ekran) | E | sahip |
| Y-24 | Kapı 5: yol durağı cihazda | E | sahip (Y-01'den sonra) |
| Y-25 | §E.7 "bitti": dört dersin durumu `[~]` | E | sahip |
| Y-26 | PLAN.v3: "kısmi yayın yoktur" ve kapı sırası eski | D | orkestratör (belge) |
| Y-27 | Plan belgelerine işlenmesi bekleyen notlar (INCELEME açık 4) | D | orkestratör (belge) |
| Y-28 | INCELEME "kalan açıklar" 1 ve 3 kapandı | D | orkestratör (belge) |
| Y-29 | DEVAM.md: "C adımı başka oturumda yazılıyor" eski | D | orkestratör (belge) |
| Y-30 | modul.md §2.9 Ders 4 satırı eski | D | orkestratör (belge) |
| Y-31 | YAPILACAKLAR ve ENVANTER'de yoga durumu yok ya da eski | D | orkestratör (belge) |

---

## A · bitmemiş, kimse yapmıyor

### Y-01 · İlk bölümün sesleri uygulamaya konmadı — A
- **Kanıt:**
  - `ls app/public/yoga` → yalnız `ders2-15.mp3` ve `ders2-15.timeline.json`.
  - `yoga-pilot/render/out/ilk-bolum/` → 11 ders dosyası + `ders3-kuyruk.mp3` + 11 `.timeline.json`. `_rapor/d0*.json`'ın hepsinde `pass: True` (12/12).
  - `app/src/lib/yogaLessons.js`: yalnız Ders 2 · 15'te `published: true` (:134). Ders 1 (:79-81), Ders 2 · 5 ve 20 (:131, :145), Ders 3 (:188-189) ve Ders 5 (:229-231) yayımlı değil. `musicTailFile: null` (:186).
  - Sahip dört dersi kabul etti (SAHIP_ISTEKLERI 17–18). SAHIP 10: "her ders kendi denetimlerinden geçince eklenir". DEVAM:81: "Dosyaları uygulamaya koymak kod oturumunun işi".
- **Boyut notu (hesap):** ilk bölümün MP3'lerinin hepsi girerse `public` + iOS `Sounds` ≈ 177,4 MB olur. JS ve ikili dosya bu sayıya dahil değil. Hesap: 69.020.332 − 12.754.615 + 94.531.308 + 717.994 + 25.931.208 bayt (`du -sb`, `du -cb`). 200 MB eşiğine (VARSAYIM) yakın; AAC 64 ile aynı süre (≈ 116 dk) ≈ 56 MB tutar. Y-14 ve Y-15 bu yüzden önemli.
- **Sonraki adım:**
  1. Önce Y-02 ve Y-03 yapılır.
  2. Dosyalar `public/yoga`'ya kopyalanır. `contentHash`, `sections` (yogaLessons.test dosyayla karşılaştırır) ve `musicTailFile` doldurulur.
  3. Sahibin ilk bölüm kararına (SAHIP 10) göre `published` açılır.
  4. Testler koşulur ve TestFlight'a gidilir.
- **Kimin:** kod oturumu (şu an yok). `modules/yoga`'daki tasarım turuyla çakışmaması için o tur bittikten sonra ya da yalnız `lib/` ve `public/` ile sınırlı çalışılır.

### Y-02 · Uygulamadaki Ders 2 · 15 dk eski dosya — A
- **Kanıt:**
  - `sha256sum`: `app/public/yoga/ders2-15.mp3` = `726417fa…` ile `yoga-pilot/render/out/ders2-15dk-hoc-A.mp3` (A adımı, Kapı 2 kör karışımı) aynı. Onaylı `render/out/ilk-bolum/ders2-15.mp3` ise `c875dcef…`.
  - Eski dosyada B adımı metin düzeltmeleri yok. `c4.ses` = "Uzaktan gelip giden yaprak hışırtısı." (INCELEME TE2, BLOCKER: yüklem yok); yenisi "…gelip gidiyor." `n1.sec` ve `n2.hatirla` da eski biçimde.
  - Uygulamadaki çizelgede mutlak geçici yol var: `app/public/yoga/ders2-15.timeline.json:2` `"file": "/tmp/claude-0/…/ders2-15dk-hoc-A.mp3"`. SPEC.v3 §10 (:292-293) mutlak yolu yasaklıyor.
  - `yogaLessons.js:140` `contentHash: '726417faa1760e11'`.
- **Sonraki adım:** Y-01 ile birlikte dosya ve çizelge değiştirilir, `contentHash` güncellenir. Yarım kalan eski ders "güncellendi" davranışına düşer (PLAN.v3 §D.4).
- **Kimin:** kod oturumu.

### Y-03 · Yeni `timeline.json` (v2) ile oynatıcı uyumsuz — A
Ders yayımlanınca ortaya çıkar. Bugün yalnız eski Ders 2 · 15 yayımlı olduğu için görünmüyor. Doğrulama Python ile, oynatıcının `closingAt` mantığının aynısı çizelgelere uygulanarak yapıldı.
- **(a) "Kapanışa geç", sarma koruması ve "tamamlandı" yanlış noktada.** `closingAt` ilk `returnTone` olayını alıyor (`app/src/modules/yoga/timeline.js:114-124`). Yeni çizelgelerde pencere dönüş tınıları da `returnTone`:
  - `ders5-15`: tınılar 579,45 / 618,52 / 669,73 / 740,98 / 763,39. Oynatıcı kapanışı **577,45 sn** sanar; çizelgenin `closing.jumpTo` değeri 757,393.
  - `ders2-20`: tınılar 958,5 (`c4.donus1`) ve 1055,18. Oynatıcı **956,5 sn** sanar; `jumpTo` 1059,483.
  - Sonuç: "Kapanışa geç" dersi Derin evrenin ortasına atlatır. `guardClosing` 577 sn'den sonra ileri sarmayı engeller (`YogaPlayer.jsx:103`, `:164`). `reachedClosing` erken doğru olur, kayıt da öyle yazılır (`session.js:45`, `journal.js:31`, `:90`).
- **(b) Ders 3 ve 5'te evre adları açıklamalı.** Ders 3 ve 5'te `visual_state.phase` değerleri şöyle: `'varis (ışık noktası geniş ve soluk)'`, `'derinlesme (ışık daralmaya başlar)'`, `'derin (kor)'` gibi. Oynatıcı ise `PHASE_LIGHT` anahtarlarını (`timeline.js:159`, `:196`) ve `BreathForm.jsx:99`'daki `v.phase === 'varis'` karşılaştırmasını bekliyor. Bu adlar eşleşmediği için evre ışığı hep 0,8'de, Ders 5'in hale çapı hep 24'te kalır: dersin görsel yayı çalışmaz.
- **(c) Ders 1'de halka nefesle büyümez.** Ders 1'in nefes ipuçları `ring:in` / `ring:out` biçiminde (`ders1-15`: 42 + 21 olay) ve çizelgede `pulse` yok. `visualAt` yalnız `pulse` okuyor (`timeline.js:213`).
- **(d) Bırakma klipleri.** `release.prefixFile` (`yoga-d02-birak-imge.m4a`, `…-zitlik.m4a`) diye dosyalar yok. Oynatıcı bırakma klibini dosyanın içinden, `image:on` / `image:off` ipuçlarından buluyor (`timeline.js:127-151`); Ders 2 · 20'deki C3 zıtlık bırakması bu yolda yok.
- **(e) Dosya adı.** SPEC §10 uygulama adını `yoga-dNN-MMdk.m4a` diye veriyor (çizelgede `appFile`); kod `yoga/ders2-15.mp3` bekliyor. AAC'ye geçerken ad sözleşmesi tek karara bağlanmalı.
- **Sonraki adım:** oynatıcı `closing.jumpTo` alanını okur (yoksa eski yöntemle hesaplar). Evre adı ilk sözcüğüne indirilir (ya da `mixib.py` çizelgeye yalın ad yazar). `ring:*` ipuçları ya okunur ya da `pulse`'a çevrilir. Her yeni çizelge için birim testi eklenir.
- **Kimin:** kod oturumu. Dosyalar (`modules/yoga/timeline.js`, `BreathForm.jsx`) şu an çalışan yoga tasarım turunun alanında; o tur bitince yapılmalı.

### Y-04 · Kodek testi paketi ve Mac ölçüm betiği yok — A (+C)
- **Kanıt:**
  - DEVAM.md:21, :33-34 ("AÇIK: … `parca{1,2,3}.wav` + `.mp3` … henüz hazırlanmadı"), :79.
  - `git ls-files | grep parca` boş. `yoga-pilot/b/mac/kodek_testi.sh:15-16` girdi yoksa "eksik" deyip çıkıyor.
  - SPEC.v3 §14.4 (:428-429) ve §18 (:513): Mac'te kodlanmış dosyayı yeniden ölçecek betik yazılmadı.
  - PLAN.v3 §E.4 kodek testini Kapı 3'ten önceye koyuyor.
- **Sonraki adım:**
  1. WAV ana kopyadan üç kesit hazırlanır: SPEC §14.2'deki `a.hosgeldin→a.izin`, `car.sag1→car.sag3`, `c4.yer→c4.ses`. Bunun için önce Y-05 gerekir.
  2. Kesitler `parcaN.wav` ve `parcaN.mp3` olarak paketlenir.
  3. Mac ölçüm betiği yazılır.
  4. Paket sahibe gider (Y-14).
- **Kimin:** render/ses oturumu (şu an yok); sonra sahip.

### Y-05 · İlk bölümün WAV ana kopyaları bu ortamda yok — A
- **Kanıt:**
  - `yoga-pilot/render/tools/mixib.py:10` ana kopyaları `out/ilk-bolum/_master/dNN-MMdk-hoc-A.wav` olarak yazıyor ve "(depoya girmez)" diyor. Ses oturumu başka dalda çalıştı (`claude/eager-clarke-7547q6`, DEVAM:39).
  - Bu ortamdaki `scratchpad/yoga/render/out/` altında `ilk-bolum` yok (`ls`).
  - SPEC.v3 §10:291-292 ana kopyanın yerini "sahibin Mac'i ve bulut, iki kopya" diye veriyor; gönderildiğine dair kayıt bulunamadı.
  - `render/_kalici/manifest.json`'da 518 dosya var: 501 seçilmiş parça, 9 Kapı 2 müziği, 8 ortak katman. İlk bölümün işlenmiş müzikleri (`d1-varis`, `d1-kapanis.keyD`, `el-derin-c`, `yagmur-*`, `d3-*`) depoda yalnız ham MP3 olarak duruyor (`render/music/el/raw/ib/`).
  - AAC "hiçbir zaman MP3'ten kodlanmaz" (SPEC.v3:397).
- **Sonraki adım:** ana kopyalar `_kalici` ve ham MP3'lerden `mixib.py` ile yeniden üretilir. Onaylı MP3'lerle eşitlik ölçülür: aynı plan, parça konumu ve yükseklik. Sonra WAV'lar sahibin Mac'ine ve buluta iletilir, işlenmiş müzikler `_kalici`'ye eklenir.
- **Kimin:** render/ses oturumu.

### Y-06 · SPEC §10 yardımcı dosyaları kurulmadı — A
- **Kanıt:**
  - DEVAM.md:76 ("Açık: SPEC §10 yardımcı dosyaları … kurulmadı") ve :80.
  - C_KOD_RAPORU §7-2: ses denetimi, ilk ders girişi, sesli dönüş ve müzik kuyruğu "kod hazır; dosya adı verilince görünür".
  - `app/src/modules/yoga/Yoga.jsx:33` `SOUND_CHECK_FILE = null`; `yogaLessons.js:39` `intro` "henüz yok".
  - Birimler zaten seslendirildi: `render/_kalici/sel/hoc/d01/{i.ilk,a.izin,d.goz,d.kalk,d.bekle}`, `d02/g.ilk`, `d03/g.ilk.uyku`, `d05/i.ilk` … Yani iş yalnız karışım ve kodda bağlama; ücretli çağrı gerekmez.
- **Sonraki adım:** giriş, izin, bırakma ön klipleri (ya da Y-03d kararı), durdurma dönüşü ve ses denetimi dosyaları karıştırılır, §12.1 ölçümünden geçirilir, sahibin kulağına gider; sonra uygulamaya bağlanır.
- **Kimin:** render oturumu (karışım), sonra kod oturumu.

### Y-07 · "Kaldığın yerden" kartı yok — A
- **Kanıt:** C_KOD_RAPORU §7-3 ("açılış izni klibi dosyası ve `gozolcum:yoga-resume` kaydı yazılmadı"). Tasarım `yoga-pilot/v3/modul.md` §2.10 (:285). `app/src`'de `yoga-resume` yok (grep boş).
- **Sonraki adım:** Y-06'daki `a.izin` dosyası gelince kart ve kayıt yazılır (yalnız 15 ve 20 dk; PLAN.v3 §2.0 satır 6).
- **Kimin:** kod oturumu (tasarım turundan sonra).

### Y-08 · Ders kaynakları `lib/sources.js`'te yok — A
- **Kanıt:** C_KOD_RAPORU §7-5. `app/src/lib/sources.js:247-254`'te yoga için yalnız `luu2024` var; derslerin PMID'leri yalnız `yogaLessons.js` içinde (ör. Ders 5: :214-226). Kaynak kartında çalışma türü yok (C_KOD metin merceği 15).
- **Sonraki adım:** PubMed MCP ile türler doğrulanır, `sources.js`'e eklenir, kart türü gösterir.
- **Kimin:** kod oturumu.

### Y-09 · `releases.js`'te yoga sürüm notu yok — A
- **Kanıt:** `app/src/lib/releases.js:3` kuralı: her TestFlight işi buraya bir madde ekler. En yeni girdi `id: '2026-09-29-2'` (:11); dosyada "yoga" geçmiyor (`grep -i yoga` boş). Yoga kodu `0b076ba` ve `58fa1c1` ile depoda. PLAN.v3 §F Kapı 8 (:1052) "sürüm notu (yeni kimlik)" istiyor.
- **Sonraki adım:** yoga içeren ilk TestFlight'tan önce yeni kimlikle bir girdi yazılır; yalnız iPhone ve yalnız yayımlı dersler anılır.
- **Kimin:** kod oturumu (Y-01 ile aynı iş).

### Y-10 · Kalan altı ders (4, 6, 7, 8, 9, 10) — A (+C)
- **Kanıt:**
  - `ls yoga-pilot/b` yalnız `ders1`, `ders2`, `ders3`, `ders5` içeriyor; altı ders için `lesson.json`, `script` ya da ses yok. `git ls-files` da yalnız PLAN.v2 tasarımlarını gösteriyor (`PLAN.v2.md:259, :313, :339, :364, :386, :407`).
  - SAHIP 9: "sonra arka planda diğer dersleri …". DEVAM "Sonraki olası işler" (:78-81) bu işi saymıyor.
  - Kredi: Parti 2 ≈ 128–190 bin, Parti 3 ≈ 130–190 bin (PLAN.v3:1050-1051). Hesapta ≈ 52,5 bin kalmıştı (SAHIP 14); defter A adımından beri 133.045 kredi (`ledger.jsonl` 400.–1171. satırlar). Toplam tavan 600 bin.
- **Sonraki adım:** Parti 2 (Ders 4, 7, 8) metni B adımındaki gibi yazılır ve iki model incelemesinden geçer (0 kredi). Seslendirmeden önce sahipten kredi ve sıra onayı alınır. Ders 4 ve 7 için psikolog yoksa karar 5.3 yedeği uygulanır.
- **Kimin:** metin: yeni oturum (A). Seslendirme: sahip kararı (C).

### Y-11 · Defter uzlaştırması — A (düşük)
- **Kanıt:** DEVAM.md:70-72 (hesap 133.485, defter 132.745; ≈ 740 kredinin kaynağı bulunamadı). A+B konuşma satırlarının 325'i `estimate_only`. SPEC.v3 §15.1 TTS için uzlaştırma satırı istiyor.
- **Sonraki adım:** Parti 2'den önce hesap sayfasıyla defter eşitlenir.
- **Kimin:** render oturumu.

### Y-12 · Uyku kısılma MP3'lerini iOS paketinden çıkarma — A (düşük)
- **Kanıt:** PLAN.v3 karar 6 (:159-161) ve §C.2 (:625-627) bunu "ayrı, küçük iş" diyor. `app/public/sleep/sakin-fade-{30…180}.mp3` duruyor. Web testi onları bekliyor (`dalgaSleep.test.js:56-57`).
- **Sonraki adım:** Kapı 4'teki boyut ölçümüyle (Y-15) birlikte karar verilir.
- **Kimin:** kod oturumu.

## B · bitmemiş, şu an çalışan bir işte

### Y-13 · Ekran tasarımı / Kapı 3 — B
- **Kanıt:**
  - PLAN.v3 §D.2 (:778-779) ve §F (:1046): önce tasarım Artifact'ı, kod ancak sahip onayından sonra.
  - Depoda Kapı 3 kaydı yok: `grep "Kapı 3"` yalnız plan kopyalarında çıkıyor. Kod, sahibin ilk bölüm kararıyla yazıldı (SAHIP 10).
  - Ders 2'nin 5, 15 ve 20 dk sesleri sahip kulağından geçti (SAHIP 17).
  - Ekranların 5 sn yeniden tasarımı şu an `modules/yoga`'da sürüyor (`yoga.css`, `Yoga.jsx`, `BreathForm.jsx`, `LessonArt.jsx` 09:02–09:40 arası değişmiş).
- **Sonraki adım:** tur bitince sahip onayı Kapı 3 olarak kaydedilir. Y-03 ve Y-07 bu turdan sonra aynı dosyalarda yapılır.
- **Kimin:** çalışan yoga tasarım turu.

## C · sahibin kararı ya da eylemi bekliyor

### Y-14 · Kodek kör dinlemesi ve bit hızı kararı — C
- **Kanıt:** SPEC.v3 §14.3 (karar kuralı: 6 denemede AAC 64 en az 4 kez sonda ise 96). Defterde `kind: "kodek-karari"` satırı yok. DEVAM.md:33: "sonuç gelene kadar dosyalar MP3".
- **Sonraki adım:** Y-04'ten sonra sahip Mac'te `kodek_testi.sh`'yi çalıştırır ve iPhone hoparlörü ile AirPods'ta kör dinler.
- **Kimin:** sahip.

### Y-15 · Karar 6: gerçek indirme boyutu — C (+A)
- **Kanıt:** PLAN.v3 karar 6 (:163-167) ve §F C satırı (:1047): kodek testinden sonra, son toplam sürede yer tutucu dosyalarla TestFlight derlemesi yapılır ve App Store Connect'in bildirdiği boyut okunur. Böyle bir derleme ya da kayıt yok. Bugünkü hesap için Y-01'deki boyut notuna bakılır.
- **Sonraki adım:** yer tutucu dosyalar hazırlanır (A, kod oturumu), sahip derler ve boyutu okur (C).
- **Kimin:** kod oturumu, sonra sahip.

### Y-16 · Nef sunucusu yoga istemiyle yeniden yayımlanmadı — C
- **Kanıt:**
  - `app/src/lib/coachCore.js:78-82`'deki yoga satırları `0b076ba`'da eklendi.
  - Son sunucu yayını `97f2f87` (`docs/yol-haritasi/YAPILACAKLAR.md:132`). `git merge-base --is-ancestor 97f2f87 0b076ba` doğru: yayın yogadan önce.
  - `app/.vercelignore` `public/yoga` satırını taşıyor.
- **Sonraki adım:** sahibin onayıyla sunucu yeniden yayımlanır. Sonra Vercel dosya listesinde yoga dosyası olmadığı denetlenir (PLAN.v3 §C.2:648-649, Kapı 8).
- **Kimin:** sahip onayı, sonra orkestratör.

### Y-17 · Onay bekleyen metinler — C
- **Kanıt:**
  - C_KOD_RAPORU §6 (yeni arayüz metinleri "Türkçe editör onayına"), §7-6 (Ders 3 açılış satırları ↔ `modul.md` §10.3-e) ve §7-7 (N1 dışındaki bölüm adları).
  - C_DOGRULAMA §4: `YT.done.lesson4` Türkçe editör ve klinik psikolog onayına.
  - INCELEME.md açık 2: Ders 2 · 5 dk N2 kısa biçiminden bir cümle çıktı; bu "sahibin ya da insan editörün onayını bekliyor". Sahip dosyayı dinleyip sorun bildirmedi (SAHIP 17), ama bu karar ona açıkça sorulmadı.
  - INCELEME.md açık 5: önerilenden farklı yazılan sekiz metne başka inceleyici bakmadı.
- **Sonraki adım:** karar 2 yedeği uygulanır: iki bağımsız model incelemesi, sonra sahibe tek soru kartı.
- **Kimin:** sahip (yedek inceleme orkestratörce koşulabilir).

### Y-18 · Rekor kutusu "Yoga · pratik yapılan gün" — C
- **Kanıt:** C_KOD_RAPORU §7-4: `summary().bests` kalıbına uymuyor, `stats.test.js:224` beklentisi değişir; "sahip ya da Gelişim sahibi karar vermeli". `app/src/lib/stats.js`'te "yoga" geçmiyor. PLAN.v3 §D.5 (:846) bu kutuyu istiyor.
- **Kimin:** sahip.

### Y-19 · Veri merkezi kararları — C
- **Kanıt:**
  - C_KOD_RAPORU §7-9.
  - `app/src/lib/dataHub.js:151` `verifiedChange` yoganın puanlarını sayıyor.
  - `app/src/lib/coachCore.js:44` `.slice(0, 10)`: yoga ilk on modülün dışında kalabilir (PLAN.v3:863-864).
  - Nef rıza metninin yoganın dört sayısını kapsadığı yorumu hukukçuya gitmedi (PLAN.v3 §G:1110; `consent.js` "Ne" satırında yoga anılmıyor).
- **Kimin:** sahip / hukukçu.

### Y-20 · S3: Now Playing'in iOS önerilerinden çıkarılması — C
- **Kanıt:** C_DOGRULAMA_RAPORU S3 ve §6-2 ("sahip kararı bekliyor"). `AlarmPlugin.swift`'te `MPNowPlayingInfoPropertyExcludeFromSuggestions` yok (grep boş).
- **Kimin:** sahip.

### Y-21 · Ses ve müziğin ticari kullanım koşulları — C
- **Kanıt:** PLAN.v3 §G (:1100-1101): tasarlanan sesin kullanım koşulları bilinmiyor. Ses (Nefona Hoca) ve müzik (A) seçimi orkestratörün VARSAYIMı (SAHIP 8; SPEC.v3 §18:506). Sahip sesleri dinleyip kabul etti (17–18), ama lisans konusu kapanmadı.
- **Sonraki adım:** ElevenLabs planının ticari kullanım ve Music koşulları, App Store yayınından önce sahipçe doğrulanır.
- **Kimin:** sahip.

## E · cihazda doğrulama bekliyor

### Y-22 · Swift derlenmedi — E
- **Kanıt:** C_KOD_RAPORU §7-1 ve C_DOGRULAMA_RAPORU §6-1: `endRecording`, `yieldToRecording` (`DispatchQueue.main.sync`), `pausedAt`, kuyrukta kesinti, uzaktan komutların kapatılması (`AlarmPlugin.swift`, `FeedbackPlugin.swift`, `SpeechPlugin.swift`).
- **Kimin:** sahip (Xcode derlemesi).

### Y-23 · Kapı 4 cihaz listesi (Ders 2, kilitli ekran) — E
- **Kanıt:** C_KOD_RAPORU §8'de 18 `[ ]` madde, C_DOGRULAMA_RAPORU §5'te 6 madde daha. `docs/yol-haritasi/HATA_GUNLUGU.md`'de yoga kaydı yok (`grep -i yoga` boş). PLAN.v3 §E.5: ilk cihaz testi Kapı 4.
- **Not:** Y-02'deki eski dosyayla değil, onaylı Ders 2 dosyalarıyla sınanmalı.
- **Kimin:** sahip (TestFlight).

### Y-24 · Kapı 5: yol durağı cihazda — E
- **Kanıt:** PLAN.v3 §E.5 (:1005-1010) ve C_KOD_RAPORU:189-190: yolda 3 dk'lık yayımlı ders olmadığı için durak görünmüyor (`lib/yoga.js:113-116` `pick` yalnız yayımlı süreye bakıyor).
- **Sonraki adım:** Ders 1 ve 5'in 3 dk'sı yayımlanınca (Y-01) cihazda denenir: 3. gün, "Sonra yaparım", gece yarısı.
- **Kimin:** sahip.

### Y-25 · §E.7 "bitti" tanımına göre dört dersin durumu `[~]` — E
- **Kanıt:** PLAN.v3 §E.7 (:1028-1034) ve SPEC.v3 §12.3. Koşullar:
  - (1) Metin: karar 2 yedeği yapıldı (INCELEME.md).
  - (2) Ölçüm: 12/12 `pass: True` (`_rapor/`) ve sahip kabul etti (17–18). Ama "baştan sona dinlendi" yazılı değil; sahip ilk 5 saniyeyi değerlendirdi (SAHIP 15).
  - (3) Cihazda kilitli çalma: yok.
  - (4) Sahip onayı: var.
- **Kimin:** sahip (cihaz); orkestratör sonucu kaydeder.

## D · aslında bitmiş ya da karar verilmiş, belge eski

### Y-26 · PLAN.v3: "kısmi yayın yoktur" ve kapı sırası eski — D
- **Kanıt:**
  - `yoga-pilot/v3/PLAN.v3.md:1067` "Kısmi yayın yoktur" diyor; bu kural SAHIP_ISTEKLERI 9–10 ile değişti. PLAN.v3'te "ilk bölüm" ya da madde 9–10 geçmiyor (grep boş).
  - §F (:1059-1060) "kalan dokuz dersin seslendirmesi Kapı 4'ün kalıp kilidinden önce başlamaz" diyor; oysa Ders 1, 3 ve 5 Kapı 4'ten önce seslendirildi (`7be2f57`, `e6076e7`).
  - §1 (:81) ve §G (:1086-1087) "Uygulamada yoga kodu yok" ve "sahibi tarafından henüz dinlenmedi" diyor; ikisi de artık doğru değil.
- **Risk notu:** SPEC.v3:19 der ki Kapı 4'ten sonra karıştırıcı ya da şartname değişirse yeniden basım gerekir; bu artık dört dersin hepsini kapsar.
- **Sonraki adım:** PLAN.v3'e "ilk bölüm" eki yazılır.
- **Kimin:** orkestratör.

### Y-27 · Plan belgelerine işlenmesi bekleyen notlar — D
- **Kanıt:** DEVAM.md:36-37 ve INCELEME.md "Kalan açıklar" 4 (:115-121). Durum:
  - `PLAN.v2.md:465` hâlâ "23:30 imgede sessiz yürüyüş" diyor (UH10: "imgede sessiz kalış").
  - `PLAN.v3.md:822` hâlâ eski ilk ders cümlesini taşıyor ("…zorlanırsan kapanışa geçmen yeterli."); `g.ilk.uyku` yok (TE21, UH16).
  - Ayrıca işlenmemiş: PLAN.v2 §B.5 (Ders 3 durdurma ekranı, TE1), §E.6 #5 (yön ayaklardan başa, UH17) ve Ders 3'ün 45 sn pencere kuralı (UH11).
- **Kimin:** orkestratör.

### Y-28 · INCELEME "kalan açıklar" 1 ve 3 kapandı — D
- **Kanıt:**
  - Açık 1 (süre kestirimi): ses ölçüldü, plan payları geçti. `_rapor/plan-d01-03dk.json` `slack_min_s` 15,5 (taban 10); `plan-d02-05dk.json` 15,97 (taban 15); 11 planın hepsinde `check_plan.fails = []`.
  - Açık 3 (yeniden seslendirilecek birimler): seslendirildi (`_kalici/sel/hoc/d02/c4.ses.orman`, `c4.ses.kiyi`, `n1.sec`, `n2.hatirla`, `c4.koku`, `g.ilk`; d01/d03/d05 dizinlerinde 68/67/68 birim).
- **Sonraki adım:** INCELEME.md'ye "kapandı" notu düşülür.
- **Kimin:** orkestratör.

### Y-29 · DEVAM.md eski satır — D
- **Kanıt:** `yoga-pilot/DEVAM.md:23-24`: "Uygulama kodu (C adımı) BAŞKA bir oturumda yazılıyor". C adımı bitti ve kaydedildi (`0b076ba`, `a225142`, `58fa1c1`; C_KOD_RAPORU, C_DOGRULAMA_RAPORU).
- **Sonraki adım:** DEVAM'a yukarıdaki A işleri "sonraki işler" olarak yazılır.
- **Kimin:** orkestratör.

### Y-30 · modul.md §2.9 Ders 4 satırı eski — D
- **Kanıt:** `yoga-pilot/v3/modul.md:281` "Sık tekrarlarsa bir uzmanla…" diyor. Kod düzeltilmiş biçimi taşıyor (`app/src/modules/yoga/text.js:113`, PLAN.v3 §B.2 kural 11). C_DOGRULAMA_RAPORU §6-3 düzeltme öneriyor.
- **Kimin:** orkestratör.

### Y-31 · YAPILACAKLAR ve ENVANTER'de yoga durumu yok ya da eski — D
- **Kanıt:**
  - `docs/yol-haritasi/YAPILACAKLAR.md:71` "yoga (pilot sesi üretiliyor)" diyor; oysa ilk bölümün sesleri bitti.
  - (g) maddesi (:79) için `[~]` durum satırı yok. (a) :80 ve (b) :178'de var.
  - `ENVANTER_VE_PLAN.md`'de "yoga" geçmiyor (grep boş). PLAN.v3 Kapı 8 (:1052) ikisini de istiyor.
- **Sonraki adım:** yoga için `[~]` satırı yazılır: kod depoda, cihazda denenmedi, sesler uygulamada değil.
- **Kimin:** orkestratör.

---

## Kapsam dışı, bilgi
- İkinci aşama (Kapı 9–11: 30 dk ve "istediğin dakika") planda ilk yayından sonra geliyor (PLAN.v3 §F); başlamamış olması açık iş sayılmadı.
- INCELEME.md açık 7 (Ders 2 · 6,6 hece/sn · 13 dk T5) yayında olmayan bir süre; iş gerekmiyor.
- C_KOD_RAPORU §7-11 (`trend.weekly.test.js:211`, saat dilimine bağlı) yoga dışı; bu alana yazılmadı.
