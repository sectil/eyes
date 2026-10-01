# Gelişim merkezi PLAN.v1 · Eksiklik eleştirisi (2026-09-30, 16:32–16:47 UTC)

İncelenen: `PLAN.v1.md`, `DENETIM.md`, `SAHIP_ISTEKLERI.md`, `ANA_BELGE.md` §2, `IS_AKISI_KURALLARI.md`; kodda
`lib/dataHub.js` (firstDay, growthMap, verifiedChange), `lib/health.js`, `HealthPlugin.swift` (dailyTotals sınırı),
`App.jsx` (sağlık okuma, "Tüm verileri sil"), `lib/notifyApply.js`, `lib/notifyPlan.js`, `screens/Home.jsx`,
`screens/Who5.jsx`, `lib/coach.js` (grep), `lib/profile.js` (firstLook biçimi); `SONSUZ_YOL.PLAN.v1.md` §3.B.3, B.4,
C.4, F.4; `bildirim-hava-yuruyus/PLAN.v1.md` (grep).
**Bakmadım:** `tasarim.html` (klasörde yok, Artifact), `maket/maket.html`, `kapi/*.md` içerikleri (yalnız dosya adları),
`denetim-betikleri/*` içerikleri (yalnız OKU.md başı), `lib/progress.js`, `lib/trend.js` ayrıntısı, `lib/iris.js`
tamamı, `Calendar.jsx`, `ProgressOverview.jsx` tamamı, B1 planının bütün metni, `Y1_KOD_RAPORU.md`.

Biçim: **[ÖNEM] Yer — Eksik — Neden önemli — Önerilen ek.**

---

## A. Plan kendi içinde eksik ya da çelişkili

1. **[KRİTİK] §1 satır 3, §12 madde 2 — "§2.4" yok.** Plan iki yerde "ilk hafta görünümü 5 saniye kapısında (§2.4)"
   diyor; belgede §2.4 yok, `kapi/` klasöründe ilk hafta turunun dosyası da yok. — Sahibin 2. kararı (ilk hafta ayrı
   görünüm) tasarımsız; §2.1'de 1. gün 2/5 ve 9. gün 2/5 ile geçmemiş; kod oturumu ilk hafta ekranını neye göre çizeceğini
   bilemez. — §2.4'ü (ilk hafta görünümünün çizimi, metni, kapı sonucu ≥ eşik) yazın ya da G2'yi "§2.4 geçene dek
   başlamaz" diye kilitleyin.

2. **[KRİTİK] §1 "Denetimin kritik ve önemli bulgularının hepsi aynı işte kapanır" ↔ §4.4/§7 "Nef paketine yeni alan
   eklenmez", §3.3 "Göz kuralı `trend.js`'te değişmez".** Ö-2 (Nef hükümleri ve WHO-5 görmüyor), Ö-12 (Dalga, Gökyüzü,
   Yön `coach()` yok; boş modüller sıfırlı özet) ve Ö-11 (kamerasız tek E testi kırmızı uyarıyı siliyor; `trend.js
   comparableTests`) için §8.1'de dosya ve düzeltme yok. — "Hepsi kapanır" iddiası yanlış; Ö-11 denetimin kendi sözüyle
   güvenlik bulgusu; denetim betiği C-trend teste çevrilirse (§8.4) kırmızı kalır, iş takılır. — Ö-2/Ö-12'yi "Y6'ya
   ertelendi, YAPILACAKLAR'a yazıldı", Ö-11'i "ayrı güvenlik işi, G1'den önce/içinde, dosya `lib/trend.js`, beklenen test
   `trend.test.js`'e eklenir" diye açıkça yazın ve §8.3'teki "trend.test.js değişmeden yeşil" ile uzlaştırın.

3. **[KRİTİK] §8.1 dosya listesi — K2'nin iki tüketicisi eksik.** `screens/Home.jsx:171` `r.current7 ?? ou.at(-1)` ve
   `lib/coach.js:49` `vaCurrent7` hâlâ eski "şimdi"yi okuyor; ikisi de listede yok. Ayrıca `screens/Who5.jsx:54`
   `metricStatus` okuyor, listede yok. — IS_AKISI kural 7 "izinli dosya listesi"; kod oturumu bu dosyalara dokunamaz ya da
   dokunursa kapsam dışı olur; §3.5.1 "aynı göz değeri her yüzeyde" testi kırılır. — Listeye `screens/Home.jsx`,
   `screens/Who5.jsx`, (Nef için ertelenmiyorsa) `lib/coach.js` ve `App.jsx` (growthCenter'a `health`/`walk` geçirme,
   `onNotifyTap` 7870–7871 yönlendirmesi) ekleyin.

4. **[ÖNEMLİ] §3.3 "mixed → yay rengi değişmez" ↔ onaylı SONSUZ_YOL §3.B.4 "İkisi birden varsa yay boş kalır".** — Kod
   oturumu onaylı plana mı bu plana mı uyacağını soracak. — "Bu plan B.4'ün yay cümlesini değiştirir: yay düzeni gösterir,
   `mixed` yalnız satır hapında" diye bir değişiklik satırı ekleyin.

5. **[ÖNEMLİ] §9 "beşte en az dört" ↔ IS_AKISI kural 5 "beşten en az üçü"; kural 5 "en çok iki tur" ↔ §2'de üç tur
   (tur 1, tur 2, yöntem 2) ve bir tur daha isteniyor.** — Hangi eşiğin geçerli olduğu belirsiz; §2.1'deki ✔/✘ işaretleri
   eşiğe göre değişir (ör. g0 9. gün 3/5). — Eşiği tek cümleyle sabitleyin (sahip 4/5 dediyse kaynağını anın) ve dördüncü
   turun kural 5'in istisnası olduğunu yazın.

6. **[ÖNEMLİ] §4.4 Nef cümlesi ↔ onaylı SONSUZ_YOL §3.F.4 "Günün tek cümlesi" (Y3).** İki ayrı öncelik sırası var
   (F.4: kilometre taşı, rekor, "aynı öncelik iki gün üst üste gelmez", `day-open.lead`'e yazılır ve gün içinde değişmez);
   §4.4 bunlardan hiçbirini anmıyor. — Ana sayfa ile Gelişim aynı gün farklı Nef cümlesi söyleyebilir; §3.5.1 tek hesap
   ilkesine aykırı. — Gelişim cümlesinin F.4 ile ilişkisini (aynı cümle mi, ayrı alan cümlesi mi) ve şablon tablosunu
   (canlı yürüyüş, "yay ilk kez doldu", ilk hafta cümleleri C.4'te yok) plana yazın.

7. **[ÖNEMLİ] §3.1 `live?: { ... cadence }` ve §8.1 G4 "`GrowthHead` B3 `walk` oturum olayını dinler".** B3 kodda yok
   (`WalkPlugin`, `CMPedometer` depoda bulunmadı); olayın adı, biçimi, sıklığı, bitiş ve kesinti olayı tanımlı değil. —
   G4 kod oturumu B3 planında olmayan bir sözleşmeye bağlanacak. — B3 planındaki olay adını/alanlarını (ör. `walk:tick {
   meters, steps, minutes, cadence }`, `walk:end`) buraya kopyalayın ya da "B3 planına eklenecek" diye yazın.

8. **[ÖNEMLİ] §8.1 G3 "`lib/notifyAll.js` (`planAll`'a 7870–7871)".** `notifyAll.js`/`planAll` kodda yok (B1 henüz
   yazılmadı); "Bildirimler sayfası", "Nef'in haberleri", "Kilit ekranında sayı gösterme" anahtarı da yok. B1 planında
   anahtarın kapsamı "yürüyüş ..." diye geçiyor. — G3 tamamen B1 sözleşmesine dayanıyor; kapsam genişlemesi yazılı değil.
   — "G3, B1 cihazda `[x]` olmadan başlamaz; 'sayı gösterme' anahtarının kapsamı gelişim bildirimini de içerecek şekilde
   B1 planında genişler" satırını ekleyin.

9. **[KÜÇÜK] §8.2/§8.3 test dosya yolları.** `registry.test.js` kökte değil `modules/registry.test.js`; "B1 testleri"
   henüz yok; denetim betiklerinden üretilecek testlerin dosya adları yok. — Kod oturumu hangi dosyayı yazacağını
   uyduracak. — Tam yolları ve yeni test dosya adlarını (ör. `lib/growthCenter.test.js`, `lib/growthCenter.denetim.test.js`)
   yazın.

10. **[KÜÇÜK] §2.2 madde 2 "içten dışa Dikkat, Nefes, Ruh hâli, Hareket" ↔ §1 "baş biçiminde dört yay" ↔ §4.1 VoiceOver
    örneği "ilk ayının 28 gününün 8'inde".** Sonuncusu ilk ay dışında ("son 28 gün") ve ilk hafta ("7 günün") için metin
    vermiyor. — Evreye göre üç VoiceOver kalıbı gerek. — Üç evre için VoiceOver etiket şablonunu yazın.

## B. Sahibin istekleri

11. **[ÖNEMLİ] "Gözler olmalı, kamera tespit edebiliyor" — İlk Bakış kenarları.** `profile.firstLook` `null` olabilir
    (atlanmış), `blinks: 0` olabilir (sıfıra bölme: "hiç kırpmayan göz"), `method: 'self'|'camera'|'truedepth'`; 28. gün
    yeniden ölçümü var. Plan hangisinin kullanılacağını, yokken ne olacağını, uç değerlerde sınırı söylemiyor. — Hiç
    kırpmayan ya da saniyede bir kırpan iris "ürkütücü"/"hata" okunur; yöntem karışımı Kü-9'u yeniden açar. — "Yoksa ya da
    0 ise sabit ortalama (VARSAYIM, kaynaklı) ve etiket 'örnek hız'; en son ölçüm, aralık 2–20 sn'ye kırpılır" gibi kural
    ekleyin.

12. **[ÖNEMLİ] "Sağlık verileri" — Apple Sağlık rıza sürümü belirsiz.** Kodda iki düzey var: `healthShow` (v1, "yan yana
    göstermek") ve `healthOk` (v2; "Gelişim'deki yürüyüş ölçümü v2 ister", App.jsx:448–455). Plan "bugünkü `health`
    rızası" diyor. — Yanlış düzey seçilirse rızasız veri işlenir ya da v1'li kullanıcıda yay boş kalır. — "Hareket yayına
    adımlı gün v1 (`healthShow`) ile girer" ya da v2 diye tek düzey yazın; izin yok/geri çekildi durumunda yayın ne
    göstereceğini ekleyin.

13. **[KRİTİK] §3.4 "ilk 14 günün ortancası" — veri yok.** Adımlar depoya yazılmıyor (DENETIM tablo; `summarizeHealth`),
    `dailyTotals` en çok 60 gün döndürüyor (HealthPlugin.swift:63). 60. günden sonra "ilk 14 gün" okunamaz; 14. günden önce
    eşik tanımsız; Apple Sağlık'ta uygulamadan önceki günler var (ilk 14 gün "uygulamanın mı, Sağlık verisinin mi?"). —
    Eşik her açılışta değişir ya da hesaplanamaz; Hareket yayı gün gün tutarsızlaşır, eşdeğerlik testi yazılamaz. — Eşiğin
    tanımını ("okunabilen son 60 günün ortancası" ya da "ilk hesaplandığında sabitlenip ayarlarda saklanır; 'Tüm verileri
    sil'de silinir") ve 14 günden önceki kuralı yazın; Sağlık günlerinin `firstDay`/`sinceStart`'a girmediğini açıkça
    belirtin.

14. **[ÖNEMLİ] "Bildirim; Bildirimler bölümünde öteki bildirimler gibi" — rıza akışı eksik.** "[Evet]" dendiğinde iOS
    bildirim izni yoksa/reddedilmişse ne olur, teklifin "reddedildi" ve açık/kapalı durumu hangi ayar anahtarında durur,
    "Tüm verileri sil"den sonra teklif yeniden çıkar mı — yazılı değil. — Kod oturumu anahtar adı ve akışı uyduracak. —
    Ayar anahtarlarını (ör. `settings.growthNotify = { on, offered, declinedAt }`), izin yokken akışı ve silmedeki davranışı
    ekleyin.

15. **[KÜÇÜK] "Basit sunum".** Beş satırın "tek satır açıklama" metinleri ve hap sözcükleri (`word`) listelenmemiş (yalnız
    üç örnek sözcük). — Dil incelemesi ve eşdeğerlik testi metin ister. — Alan × durum metin tablosunu ekleyin.

## C. Durumlar

16. **[ÖNEMLİ] Evre kuralının kenarları (§1, §2.2, §3.1).** `sinceStart` ilk kayıttan sayılıyor (`firstDay`: test,
    oturum, alışkanlık, iris.baseline; `firstLook` ve alarm günlüğü yok). Tanımsız olanlar: (a) ilk hafta penceresi
    `firstDay`'den mi, son 7 günden mi? 3. günde payda 7 ise en çok 3/7 dolar — bu beklenen mi? (b) 1. gün çalışıp 20. gün
    dönen kişi "İlk ayın · 20. gün" ve 1/28 görür; (c) kurulumu eski ama hiç kaydı olmayan kişi `sinceStart = 0` → hangi
    evre, hangi başlık? (d) 200 gün ara verip dönen kişi "Son 28 gün" 0/28 — kapının geçmediği "boş yay" sorunu geri gelir;
    (e) ilk ay evresinde pencere `window:'first'` mi `'recent'` mi (8. günde ikisi farklı günleri kapsar). — Başlık, payda
    ve sayı her birinde farklı çıkabilir; test yazılamaz. — Beş kenar için tabloyla (girdi → evre, pencere, başlık, payda)
    kural ekleyin.

17. **[ÖNEMLİ] "Uzun ara" tanımı yok.** §2.2 cümlesi "Beş gün ara verdin" diyor; C.4 "3–13 gün", F.4 "≥ 2 gün". 14+ gün
    için cümle yok. — Üç farklı eşik; kod oturumu seçemez. — Eşiği (ör. 3–13, ≥ 14 ayrı cümle) ve sayının yazılışını
    ("Beş" mi "5" mi) sabitleyin.

18. **[ÖNEMLİ] Gece yarısı ve saat dilimi.** Plan "günün ilk açılışı" (animasyon), "bugün" (`today`), "Pazartesi" ve "29.,
    57., 85. gün" kullanıyor ama ekran açıkken gece yarısı geçerse yeniden hesaplanır mı, saat dilimi değişince (İstanbul →
    Berlin) gün/evre/Pazartesi hangi saate göre — yazılı değil. Kod `dayKey` ile yerel gün kullanıyor. — Evre ve bildirim
    günü atlayabilir ya da iki kez gelebilir. — "Yerel gün; ekran açıkken gün değişince `growthCenter` yeniden çağrılır;
    Pazartesi kişinin o anki yerel takvimine göre" ve bir saat dilimi testi ekleyin.

19. **[ÖNEMLİ] Eski kullanıcı geçişi.** v2 ile bugün "iyileşiyor" gören kullanıcı bir sabah "doğrulanmış değişim yok"
    görecek; yaylar ilk açılışta 28 günle dolacak. Plan cihaz listesinde "eski hesapta ilk açılış"ı anıyor ama kullanıcıya
    açıklama (Yenilikler/`releases.js` metni) ve v2'nin başlangıcının uzun geçmişte nereden kurulacağı (ilk `base` gün mü,
    yeniden mi) yazılı değil. — Açıklamasız hüküm değişimi güven kırar. — Yenilikler metnini ve v2 başlangıcının eski
    kullanıcıda seçimini yazın.

20. **[ÖNEMLİ] v2 "iki hafta sürme" durumu nerede tutulur?** Haftalık bakış ve `persist = 2`, geçmiş Pazartesilerin
    hükmünü gerektirir. Plan hesaplamanın durumsuz (her açılışta geçmişten yeniden oynatma) mı, saklanan mı olduğunu
    söylemiyor. — Saklanırsa "Tüm verileri sil" ve eşdeğerlik etkilenir; durumsuzsa hangi Pazartesiler (yerel saat) — kod
    oturumu karar veremez. — "Durumsuz: hüküm, son iki Pazartesi 23.59'a dek kayıtlarla yeniden hesaplanır" gibi tek kural
    yazın.

21. **[ÖNEMLİ] Göz sarı/kırmızı uyarısı.** §2.2 "başın üstünde sabit uyarı kartı" diyor; kartın metni, kaynağı (`trend.js`
    mesajı mı `YOL.nef.md` §7.2 mi), iris kırpması sürer mi, açılış animasyonu oynar mı, Göz yayı/halkası dolumu devam
    eder mi yazılı değil. DENETIM §7 "uyarının bütün yüzeylerde aynı olup olmadığı"na bakmadığını söylüyor. — Uyarı anında
    "canlı, parıltılı" bir ekran güvenlik iletisini gölgeleyebilir. — Uyarı durumunda canlı öğelerin kapanıp kapanmadığını
    ve kart metninin kaynağını yazın; bir tek-hesap testi ekleyin.

22. **[KÜÇÜK] Hareketi Azalt / VoiceOver / 320 pt / iki tema.** Durum listesinde var; ancak Hareketi Azalt'ın nasıl
    okunacağı (`prefers-reduced-motion` mi iOS ayarı köprüsü mü), VoiceOver'da canvas'ın erişilebilir öğelerle nasıl
    örtüleceği (canvas üstünde görünmez düğmeler mi) ve Dynamic Type/büyük yazı durumu yok. — Canvas erişilebilirliği
    kendiliğinden gelmez. — Uygulama yöntemini tek cümleyle ve büyük yazı durumunu ekleyin.

23. **[KÜÇÜK] Boş veri.** "Kurulum yarım" durumu tanımlı; ama kurulum tamam, hiç kayıt yok ve Sağlık izni de yok (her şey
    0) ile "yalnız Sağlık adımı var, başka kayıt yok" durumu (Hareket dolu, öteki boş, `sinceStart` 0) tanımlı değil. —
    Yalnız adım verisi olan kişi evresiz kalır. — İki durumu tabloya ekleyin.

## D. Bildirim (§6)

24. **[ÖNEMLİ] Kimlik çakışması ve bütçe.** 7870–7871 bugünkü `OWN_RANGES` (7400–7499, 7500–7509) ve B1 planındaki
    aralıklarla (7700–7701, 7710–7719, 7800–7859, 7860–7867) çakışmıyor; ama "≤ 58 içinde en çok 2 yuva" B1'in 58'inin
    içinde mi yoksa üstünde mi, bütçe dolunca hangisi kırpılır yazılı değil. — B1 planı JS bekleyenini ≤ 58 ile kilitliyor;
    2 yuva taşarsa iOS 64 sınırı aşılır. — "58'in içinde; bütçe dolarsa gelişim bildirimi en son kırpılır/ilk kırpılır"
    diye öncelik ekleyin.

25. **[ÖNEMLİ] Aylık bildirim (29., 57., 85. gün) — gün sayımı ve saat.** Hangi `sinceStart` (ara verenlerde 85. gün hiç
    gelmeyebilir ya da geçmişte kalabilir), 85. günden sonra ne olur, haftalık ile aynı güne düşerse (Pazartesi 29. gün)
    birleşir mi? — Kimlik 7871 tek; iki bildirim aynı gün gelebilir. — Çakışma ve 85 sonrası kuralını yazın.

26. **[ÖNEMLİ] "Geçen takvim haftası" ve metin üretimi zamanı.** Bildirim önceden planlanıyor (iOS yerel bildirim); metin
    planlama anında mı üretiliyor? Pazartesi saatine kadar yeni kayıt girerse metin eskir; "geçen hafta kayıt yoksa
    gönderilmez" kuralı planlama anında bilinemez (Pazartesi sabahı planlandıysa). — Yanlış sayılı bildirim, §3.5.1 tek
    hesap testini bozar. — "Metin Pazar 23.59'da kapanan haftadan, her `planAll` koşusunda yeniden yazılır" gibi kural ve
    test ekleyin.

27. **[KÜÇÜK] Dokunma yolu.** "`extra.kind: 'growth'` → Gelişim açılır, bilim kartı üstte" — App.jsx `TAP_ROUTE`/
    `onNotifyTap` değişikliği dosya listesinde yok (madde 3); aylık bildirimde (7871) ne açılır yazılmamış. — Kod oturumu
    rotayı uyduracak. — 7870 ve 7871 için `extra` alanlarını ve rotayı tabloya ekleyin.

28. **[KÜÇÜK] "Tüm verileri sil".** 7870–7871 `OWN`'a girince `cancelOwn` ile iptal olur (doğru); ama "bugün
    gösterildi" işareti için "`storageKeys`'e eklenir" deniyor — `storageKeys` modül manifestlerinde (`registry.resetKeys`);
    `growthCenter` bir modül değil. — Anahtar hiçbir manifestte değilse silinmez. — Anahtarın yerini ("`store` ayarı,
    `clearAll` ile silinir" ya da hangi manifest) yazın.

## E. Eşdeğerlik, testler, "bitti"

29. **[ÖNEMLİ] §8.4 eşdeğerlik — "eski kod" nasıl koşulacak?** Eski ve yeni `growthMap` çıktısı karşılaştırılacak; eski
    kodun dondurulmuş kopyası mı, git'ten mi, dosya adı ne — yazılı değil. Ayrıca `growthMap` imzasına `health` girerse
    (Ö-9) `days/strip` Beden'de değişir; bu "0 fark" ile çelişir. — Ö-9 düzeltmesi eşdeğerliği bozar ya da Ö-9 yalnız
    `growthCenter`'da kalır; hangisi belirsiz. — "Adımlı gün yalnız `growthCenter.areas.hareket`'e girer, `growthMap`
    değişmez" ya da izinli fark listesine Beden `days/strip`'i ekleyin; eski kodun dondurma yöntemini yazın.

30. **[ÖNEMLİ] Tek hesap testi — somut beklenen değerler yok.** "Aynı `verdict`'i verir" deniyor ama hangi 4 depo
    durumunda (B betiği) hangi beklenen değerler (ör. Dikkat `mixed`, göz 0,10 "son 3 test") yazılmamış. — Beklenen
    değersiz test kendi çıktısını doğrular. — DENETIM'deki her betik durumu için beklenen çıktıyı bir tabloyla yazın.

31. **[KÜÇÜK] Canlı öğelerin testi.** `GrowthHead` canvas'ının birim testi neyi sınar (VoiceOver etiketleri, evre metni,
    Hareketi Azalt'ta animasyon yok) yazılı değil; pil "10 dk" ölçütünün eşiği yok (% kaç kabul). — "Bitti" ölçülemez. —
    Test maddelerini ve pil kabul eşiğini (VARSAYIM) ekleyin.

32. **[KÜÇÜK] §9 cihaz listesi eksikleri.** Listede yok: saat dilimi değişimi, ilk hafta 3. ve 7.→8. gün geçişi, 28.→29.
    gün geçişi (evre ve aylık bildirim), Sağlık izninin geri çekilmesi, İlk Bakış'ı atlamış kullanıcı, "Tüm verileri sil"
    sonrası Gelişim ve bildirimlerin iptali, ara verip dönen kullanıcı, büyük yazı, gerçek ekranlarda 1. gün/ilk hafta kapısı
    (§2.1'de geçmeyen tek görünüm). — ANA_BELGE §2: görülmeyen durum varsa "bitti" denmez. — Bu maddeleri listeye ekleyin.

33. **[KÜÇÜK] "Bitti" tanımı — aşama başına.** `[x]`/`[~]` kuralı var; ama G1 (görünmeyen veri işi) için "cihazda
    doğrulandı" neyin görülmesi demek (ör. eski hesapta PDF ile Gelişim aynı sayı) yazılı değil; `HATA_GUNLUGU`/
    `YAPILACAKLAR` yazımı var, bağımsız incelemenin girdisi yok. — G1 cihazda "görülemez" diye `[~]`'de kalabilir. — Her
    aşama için 2–3 somut cihaz gözlemi yazın.

## F. Belirsiz ifadeler (kısa)

34. **[KÜÇÜK]** §3.2 "Bugünün görevi" hem Dikkat'te (tablo) hem DENETIM'de Farkındalık'ta; birleşik olduğu için sorun yok
    ama "yoga Ders 5 / nefes sayma → Dikkat" iç alan eşlemesinin koddaki `domainOfSession` ile aynı olduğu doğrulanmamış
    (bakmadım). — Eşleme tablosu kodla çelişirse iki gerçek oluşur. — "Tablo `domainOfSession`'dan üretilir, elle yazılmaz"
    ekleyin.
35. **[KÜÇÜK]** §5 "Açılışta yayların dolması, günün ilk açılışında" ile §7 "'bugün gösterildi' işareti" — birden çok
    cihaz/yeniden kurulum ya da gece yarısı ekranda açıkken davranış yazılı değil.
36. **[KÜÇÜK]** §3.1 `sources: [{label, days}]` — `growthMap.sources` bugün `n` (kayıt) taşıyor; eşdeğerlikte `sources`
    karşılaştırılmıyor ama ekran `days` okuyacak; dönüşümün (`activitiesFrom` 5 dk kuralı) testle bağlanacağı yazılmalı.
