# Gelişim merkezi PLAN.v1 · Doğruluk eleştirisi

Tarih: 2026-09-30 (başlangıç 16:32 UTC). Depoya hiçbir şey yazılmadı. Okunanlar: `PLAN.v1.md`, `DENETIM.md`,
`SONSUZ_YOL.PLAN.v1.md` §1 kararlar, §3.B, §3.C, §3.G.3–G.6, §3.I; `bildirim-hava-yuruyus/PLAN.v1.md` §A.3, §A.4 (gece,
bütçe, kimlik), §A.5, §A.6, §5.5; `DEVIR.md` §1–2; kod: `lib/dataHub.js`, `lib/progress.js`, `lib/notifyApply.js`,
`lib/consent.js`, `lib/iris.js`, `lib/stats.js`, `components/ProgressOverview.jsx`, `components/HomeMap.jsx`,
`modules/*/manifest.js` (alan satırları), `App.jsx` (onReset), `lib/dataHub.test.js`. PubMed: iki PMID üst verisi ve özeti.
Bakmadıklarım: `tasarim.html` (klasörde yok; Artifact olarak var olup olmadığına bakmadım), `kapi/5sn-*.md` içerikleri,
`maket/`, `SAHIP_ISTEKLERI.md`, `IS_AKISI_KURALLARI.md`, `ana-sayfa/`, Swift tarafı, `site/`.

## A. Doğrulananlar (sorunsuz)

- Kodda var: `growthMap`, `hub`, `verifiedChange`, `weakestDomain`, `ANSWER_FIELDS`, `loadHubHabits` (hepsi `lib/dataHub.js`
  ya da `lib/alarmLog.js`); `metricCards`, `metricTrend`, `metricStatus` (ProgressOverview), `acuteEffects` (`since`
  parametresi var, `ACUTE_MIN = 3`), `FEEL_ONLY_MODULES = new Set(['yoga'])`, `feelOnlyText`, `eyeCard` (`current`,
  `currentWindow`, `current7`, `phase`, `alert`, `message` alanları var) — `lib/progress.js`; `activitiesFrom` ve 5 dk
  gruplama (`lib/stats.js TEST_GROUP_WINDOW_MS`); `irisCells` ve `snapshot` (`lib/iris.js`); `OWN_RANGES` = [7400–7499],
  [7500–7509] (`lib/notifyApply.js`); `FORBIDDEN` (`lib/coachCore.js`); `span7` = `Math.max` (`modules/tek-bakis/manifest.js`);
  okuma manifestinde `metrics` yok; `ProgressOverview signed` işareti yuvarlamadan önce alıyor (Kü-4 doğru); `tileOf` →
  `current7 ?? last` (K2 doğru); `profile.firstLook {blinks, seconds, method}` (`lib/profile.js`); `hub` imzasında `health`
  yok (Ö-9 doğru); `growthMap` alan girdisinde `days, frac, strip, status, sources, summary` ve kökte `sinceStart` var.
- `DOMAINS` yedi alan (`modules/registry.js`): plan §3.2 listesi doğru. Yoga ders alanları (1 calm, 2 body, 3 wellbeing,
  5 focus) `modules/yoga/manifest.js domainOf` ile birebir.
- `consent.js HEALTH_FACTS`: "Hareketini göz çalışmalarınla yan yana göstermek…", "Yalnızca bu telefonda. Sunucuya ve
  Nef'e gitmez" — plan §3.4 ve §7'deki alıntılar doğru.
- Adı geçen bütün test ve ekran dosyaları var (`ProgressOverview.eye/.yoga.test.jsx`, `FirstReport.test.jsx`,
  `coachStats.test.js`, `trend/today/registry/notifyPlan/reminders/notifyLog` testleri, `styles/progress2.css`,
  `screens/Calendar.jsx`, `ProfileHome.jsx`, `lib/sources.js`, `lib/releases.js`). `styles.css` Unbounded ve Onest.
- Sıra "Build 60 → B1 → B2 → Y2 → Y3 → Y4 → B3 → Y6" DEVIR §1 madde 1 ile aynı ("yoga kodu" öneki atlanmış). Y2 ≈ 5 iş
  günü (SONSUZ §3.I) doğru.
- Ölçü kuralı v2 özeti (günlük ortanca, sabit başlangıç, son 3, Pazartesi bakış, iki hafta sürme) SONSUZ §3.B.3 ile
  uyumlu; Pazartesi = haftalık Nef ve 29./57./85. gün SONSUZ §3.C.2 ile uyumlu.
- 7870–7871 onaylı hiçbir aralıkla çakışmıyor (7301, 7302, 7400–7499, 7500–7509, 7600–7607, 7700–7701, 7710–7719,
  7800–7859, 7860–7867). `calm` 08.00–22.00, varsayılan gece sessizliği 23.00–07.00, başlık ≤ 30 / gövde ≤ 110, görünür
  bilim satırı günde bir: bildirim planı §A.4/§A.6 ile uyumlu.
- DENETIM atıfları: K1, K2, K3, K4, Ö-1, Ö-3, Ö-5, Ö-6, Ö-7, Ö-8, Ö-9, Kü-1, Kü-4, Kü-5, Kü-9, Kü-12 planda doğru
  konuda anılıyor. "4 kritik, 12 önemli" sayısı doğru (Ö-11 ve Ö-12 DENETIM §4'te).
- PubMed (PubMed üst verisiyle doğrulandı): Harkin ve ark., *Psychol Bull* 142(2):198-229, PMID 26479070,
  [DOI 10.1037/bul0000025](https://doi.org/10.1037/bul0000025): 138 çalışma, N = 19.951, hedefe ulaşma d+ = 0,40
  (%95 GA 0,32–0,48); sonuçlar raporlandığında/açıklandığında ve fiziksel olarak kaydedildiğinde etki daha büyük — plan
  doğru. Michie ve ark., *Health Psychol* 28(6):690-701, PMID 19916637,
  [DOI 10.1037/a0016136](https://doi.org/10.1037/a0016136): 122 değerlendirme, N = 44.747, genel etki 0,31, I² = %69,
  kendini izleme heterojenliğin %13'ünü açıkladı, kontrol teorisinden en az bir teknikle birleşince 0,42'ye karşı 0,26 —
  plan doğru.

## B. Bulgular

### KRİTİK

**B1. "Denetimin kritik ve önemli bulgularının hepsi aynı işte kapanır" yanlış.**
- Yer: §1 "Arkadaki asıl iş" ve §1 tablosu son satırdan önceki satır ("4 kritik, 12 önemli bulgusu bu işte kapanır").
- Sorun: Ö-2 (Nef hükümleri ve WHO-5'i görmüyor) planda bilerek Y6'ya bırakılıyor (§4.4, §7 "Nef paketine yeni alan
  eklenmez"); Ö-11 (tek kamerasız E testi kırmızı uyarıyı siliyor; DENETIM'e göre güvenlik bulgusu) ve Ö-12 (Dalga,
  Gökyüzü, Yön `coach()` yok; boş modüller sıfırlı özet) planda hiç anılmıyor; üstelik §3.3 "Göz kuralı `trend.js`'te
  değişmez" diyor, Ö-11'in düzeltmesi ise `trend.js comparableTests`'tedir.
- Kanıt: DENETIM §3 Ö-2, §4 Ö-11, Ö-12; PLAN §3.3, §4.4, §7; `grep` PLAN'da "Ö-2", "Ö-11", "Ö-12" yok.
- Düzeltme: §1'i "K1–K4 ve Ö-1, Ö-3…Ö-10 kapanır; Ö-2 Y6'da, Ö-11 ana oturumda ayrı güvenlik işi, Ö-12 Y6'da" diye
  yazın ve Ö-11'in sahibini/aşamasını açıkça koyun.

### ÖNEMLİ

**B2. "Tek hesap" testi Nef paketinin aynı `verdict`'i vermesini istiyor; plan ise Nef paketine alan eklemiyor.**
- Yer: §3.5 madde 1, §8.4 "Tek hesap testi" ↔ §4.4 ve §7 "bu planda Nef paketine yeni alan eklenmez".
- Sorun: bugünkü paket göz dışında hüküm taşımıyor (`lib/coach.js buildSignals`; DENETIM Ö-2); aynı verdict'i sınayacak
  alan yok, test ya yazılamaz ya da yanlış yeşil verir.
- Kanıt: DENETIM Ö-2; SONSUZ §3.C.5 (`{key, status}` Y6'da, rıza v2).
- Düzeltme: G1–G3 tek hesap testinden "Nef paketi"ni çıkarın, "Y6'da eklenir" notu düşün.

**B3. Hüküm değeri `mixed`, onaylı §3.G.4 ile "aynı satır" değil.**
- Yer: §8.2 madde 1 ("`mixed` (onaylı §3.G.4 ile aynı satır)"), §3.1 `verdict: … | 'mixed'`, §3.3.
- Sorun: onaylı §3.G.4 ve §3.G.6 "Alan yayı" beklentiyi `null (karışık)` olarak yazıyor; §3.B.4 "yay boş kalır, satırda
  karışık yazar". Yeni bir `'mixed'` değeri `verifiedChange`'in dönüş kümesini genişletir; `HomeMap.jsx` `status === 'up'`
  ve `IrisMap marks` bu değeri bilmiyor.
- Kanıt: SONSUZ §3.G.4, §3.G.6, §3.B.4; `lib/dataHub.test.js:97`; `components/HomeMap.jsx:28, :39`.
- Düzeltme: ya `verifiedChange` onaylı biçimde `null` döndürsün ve "karışık" ayrı bir alan (`mixed: true`) olsun, ya da
  sapmayı "onaylı plandan fark" diye yazıp sahibe sorun.

**B4. Plan, onaylı §3.G.4 listesinin dışında test beklentisi değiştiriyor ama bunu sahibin onayına bağlamıyor.**
- Yer: §8.2 (`dataHub.test.js` "`records` gün sayar", `ProgressOverview.eye.test.jsx`, `.yoga.test.jsx`,
  `FirstReport.test.jsx`).
- Sorun: onaylı §3.G.4 "Başka hiçbir mevcut beklenti değişmez; değişmesi gerekirse iş durur ve sahibe sorulur" diyor.
  §12'deki üç karar test beklentilerini kapsamıyor. Ayrıca `dataHub.test.js:59` (`records … days7: 2`) doğrudan etkilenir.
- Kanıt: SONSUZ §3.G.4, §3.G.5 ("`lib/dataHub.test.js` (97. satır dışında)"); PLAN §12.
- Düzeltme: bu dört beklentiyi sahibin açık onayına sunulacak dördüncü karar olarak §12'ye ekleyin.

**B5. Eşdeğerlikte `growthMap` "0 fark" iddiası G1 değişiklikleriyle çelişebilir.**
- Yer: §8.4 ilk madde ↔ §8.1 G1 `lib/dataHub.js` ("test kayıtlarını `activitiesFrom` kuralıyla gün sayma; `health` ve adımlı
  gün").
- Sorun: adımlı gün `domainDays`'e girerse `body.days/strip/frac` değişir; `activitiesFrom` 5 dk gruplaması gece yarısını
  aşan bir test çiftinde gün sayısını değiştirebilir. İzinli listede Ö-9 ve Ö-5'in gün etkisi yok (yalnız Ö-5 anılıyor).
- Kanıt: `lib/dataHub.js domainDays`, `growthMap`; `lib/stats.js TEST_GROUP_WINDOW_MS`.
- Düzeltme: adımlı günün yalnız `growthCenter`'da eklendiğini, `growthMap`'e girmediğini açıkça yazın ya da Ö-9'u izinli
  listeye ekleyin.

**B6. Dalga (güç, motive) günleri Ruh hâli'ne değil Nefes'e sayılır.**
- Yer: §3.2 tablosu, Ruh hâli satırı ("Dalga (güç, motive)") ve altındaki "çalışılmış gün" kuralı.
- Sorun: Dalga manifestinde `domainOf` yok; `progress.domain: 'calm'`. Bütün Dalga oturumları gün şeridinde `calm`'a
  gider; yalnız güç/motive **etkileri** `self`/`wellbeing`'e düşer. Tablo "kaynak" olarak iki farklı şeyi (gün ve etki)
  karıştırıyor; plan yazıldığı gibi uygulanırsa ya kod değişir (planda yok) ya da ekran söylenenden farklı sayar.
- Kanıt: `modules/dalga/manifest.js:18, :21-22`; `lib/dataHub.js domainOfSession`; `grep domainOf modules/*/manifest.js`
  yalnız yoga.
- Düzeltme: tabloda Dalga güç/motive'yi "etki olarak Ruh hâli, gün olarak Nefes" diye yazın ya da Dalga'ya `domainOf`
  eklemeyi G1 dosya listesine koyun.

**B7. Var olmayan bölüm ve eksik kapı sonucu: §2.4.**
- Yer: satır 3 ("ilk hafta görünümü 5 saniye kapısında (§2.4)") ve §12 madde 2.
- Sorun: planda §2.4 yok (yalnız 2.1–2.3); `kapi/` klasöründe ilk hafta görünümüne ait bir kapı dosyası yok (dosyalar:
  `5sn-secim`, `5sn-kapi1`, `5sn-kapi2`, `5sn-yontem2`). §2.1'e göre 1. gün 2/5 ile geçmedi.
- Kanıt: PLAN başlık yapısı; `ls gelisim-merkezi/kapi`.
- Düzeltme: §2.4'ü "bekliyor" durumuyla ekleyin ya da atıfı "kapı sonrası eklenecek" diye değiştirin.

**B8. Bildirim bütçesinde gelişim bildirimine yer ayrılmamış.**
- Yer: §6 "Kimlik" ("JS'in bekleyen bütçesi (≤ 58) içinde; en çok 2 yuva").
- Sorun: onaylı sıralama deney türleri (kırpılmaz) → legacy ek saatler → modül hatırlatmaları (ufuk daralarak) diye
  tanımlı; bugünkü en kötü 48 + sabah havası 2 + ek saatler 8 = 58 zaten doluyor. 7870–7871'in önceliği yazılmadığı için
  "bütçe içinde" iddiası kanıtsız.
- Kanıt: bildirim PLAN §A.4 "Sayı bütçesi"; DEVIR §2 "Tek planlayıcı".
- Düzeltme: 787x'in bütçe sırasındaki yerini (ör. modül hatırlatmalarından önce, ufku 1 gün) ve `notifyApply.test`
  kimlik sayısı değişimini yazın.

### KÜÇÜK

**B9.** Yer: §6 "Ne zaman". Sorun: "iki bildirim arası ≥ 60 dk kuralı (`planAll`)"; onaylı kural kurulumda ≥ 60 dk,
planlayıcıda (`planAll`) ≥ 30 dk. Kanıt: DEVIR §2 "Tek planlayıcı". Düzeltme: "kurulumda ≥ 60 dk, planlayıcıda ≥ 30 dk".

**B10.** Yer: §6 "kişinin uygulamayı en sık açtığı saat (B1'deki 'Sen karar ver' motoru)". Sorun: motor modülün kendi
kayıt saatlerinden hesaplar; "açılış saati bugün tutulmuyor" (`dayOpen.js` Y3'te, yani G3'ten sonra). Kanıt: bildirim PLAN
§A.3 "Veri". Düzeltme: "kişinin son 28 gündeki kayıtlarının en yoğun saati" deyin.

**B11.** Yer: §6 örnek 3. Sorun: "Kilit ekranında sayı gösterme" onaylı kapsamı yalnız yürüyüş sorusundaki mesafe ve sabah
havasındaki yer adı; plan kapsamı sessizce genişletiyor. Kanıt: bildirim PLAN §A.5 Liste. Düzeltme: kapsam genişlemesini
açıkça yazıp Bildirimler satır metnine ekleyin.

**B12.** Yer: §8.1 G3 "`lib/notifyAll.js` (`planAll`…)", §6 "`notifyApply` … (`OWN`)". Sorun: `lib/notifyAll.js` ve
`planAll` bugün kodda yok (B1 getirecek); `notifyApply`'daki ad `OWN_RANGES` (`OWN` bildirim planının adı). Kanıt:
`ls lib`, `grep planAll` boş; `lib/notifyApply.js:15`. Düzeltme: "B1'in getirdiği `notifyAll.js`" ve `OWN_RANGES`/`OWN`
ayrımını yazın; dokunma sözlüğüne (§5.5 madde 4) `growth` satırını ekleyin.

**B13.** Yer: §7 "`storageKeys`'e eklenir". Sorun: `storageKeys` modül manifest alanı; `GrowthHead` modül değil. "Tüm
verileri sil" `App.jsx onReset` + `registry.resetKeys()` ile çalışır. Kanıt: `modules/registry.js:21, :163`;
`App.jsx:1051-1078`. Düzeltme: anahtarın `onReset`'te (ya da `store.clearAll` kapsamında) silineceğini yazın.

**B14.** Yer: §7 "WHO-5 durumu ve hükümler Y6'da, rıza v2 ile girer (onaylı karar 6)". Sorun: karar 6 ve §3.C.5 WHO-5'i
adıyla anmıyor (metrik `{key, status}`, `moodStatus`, `n7`); WHO-5 önerisi DENETIM Ö-2'nindir. Kanıt: SONSUZ §1 karar 6,
§3.C.5. Düzeltme: "karar 6'nın `{key,status}` alanı üzerinden; WHO-5'in pakete girişi Y6'da ayrıca doğrulanır" deyin.

**B15.** Yer: §3.3 "WHO-5 'worse'". Sorun: kodda WHO-5 durumu `'down'`/`'up'` (`verifiedChange who5?.status === 'down'`);
onaylı §3.B.4 de "down" diyor. Düzeltme: "WHO-5 `down`".

**B16.** Yer: §6 bilim kartı "Harkin 2016". Sorun: PubMed e-yayın 2015-10-19, basım 2016 (cilt 142); bildirim planı §A.6
"e-yayın yılı farklıysa ikisi birden" kuralı. Düzeltme: "Harkin 2016 (e-yayın 2015)".

**B17.** Yer: §6 son cümle ↔ Harkin maddesi. Sorun: plan "kart 'izlemek, hedefe ulaşmayla ilişkili bulundu' der" diyor,
ama kart metni "müdahaleler hedefe ulaşmayı artırdı" (nedensel) diyor; iki cümle birbirini tutmuyor. (Nedensel dil
kaynağa uygun: RKÇ meta-analizi.) Düzeltme: kart metnini ve kuralı tek biçime getirin.

**B18.** Yer: §3.5 madde 1 "Ana sayfa haritası aynı `verdict`". Sorun: Ana sayfa `HomeMap` yedi alan gösteriyor
(`IRIS_ORDER`), Gelişim beş alan; aynı verdict ancak iç alan düzeyinde karşılaştırılabilir. Kanıt:
`components/HomeMap.jsx:28, :39`. Düzeltme: testin hangi düzeyde (7 iç alan) karşılaştırdığını yazın.

**B19.** Yer: §1 "İlk Bakış'ta ölçülen kendi kırpma hızı", §2.1 dipnot. Sorun: `firstLook.method` `'self'` olabilir
(kendi sayımı, ölçüm değil; Kü-9). Düzeltme: "sayılan" deyin ya da `self` yönteminde yazıyı buna göre kurun.

**B20.** Yer: satır 9 "Kapı notları: `5sn-*.md`", "Tasarım sayfası: `tasarim.html`". Sorun: notlar `kapi/` alt klasöründe;
`tasarim.html` bu klasörde yok (Artifact olarak varlığına bakmadım). Düzeltme: yolları `kapi/5sn-*.md` ve Artifact
bağlantısıyla yazın.

**B21.** Yer: §6 "Geçen takvim haftasında hiç kayıt yoksa gönderilmez". Sorun: onaylı haftalık Nef tetiği "geçen takvim
haftasında ≥ 4 gün veri" (SONSUZ §3.C.2). Çelişki değil ama iki farklı eşik; bilinçli ise gerekçe yok. Düzeltme: eşiği
hizalayın ya da farkı gerekçelendirin.

## C. Sağlık iddiası taraması (madde 6)

Açık bir sağlık iddiası bulmadım. "Beyin" sözcüğü ekrana girmiyor (§2.3); "dolu yay sağlığın iyi olduğu anlamına gelmez"
(§11); adım eşiği bilerek kişisel ortanca (§3.4). Riskli sayılabilecek tek yer bilim kartı (B17): Harkin ve Michie
davranış değişimi ve (Michie) beslenme/hareket kaynaklıdır; göz ve dikkat alanlarına genellenmediği kartın sınır
cümlesinde yazılı olmalı (§11'de yazılı, kart metninde Harkin için yalnız "bir sağlık sonucunu göstermez" var — yeterli).
