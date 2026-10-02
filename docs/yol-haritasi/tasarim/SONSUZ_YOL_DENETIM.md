# Sonsuz yol · salt okuma denetimi (2026-09-30, Build 60'tan sonra)

Kanıt betikleri denetim sırasında karalama alanındaydı (probe1.mjs, probe2.mjs); bulgu Bug 35 olarak düzeltildi.

## Özet

**Durum**
- Sonsuz yolun ilk parçası Y1 kodda açık ve Build 60'a girdi. Onu açıp kapatan bir ayar yok.
- Y2, Y3, Y4 ve Y6 için henüz kod yok. Y5'in yerini B2 bildirim planı aldı.
- Y1'in testleri geçiyor: 1854 test yeşil, eşdeğerlikte 0 fark var. Cihazda henüz denenmedi.
- Build 60'ın TestFlight'a yüklendiğini kontrol etmedim.

**Build 60'ta görünen**
- Yoldaki nefes 1. gün 1, 2. gün 2, sonra 3 dakika sürüyor. Bitince "2 dk daha" ile 5 dakikaya tamamlanıyor.
- Nefes ekranında "Bugünün ritmi" yazıyor.
- Göz egzersizi kademeli: kırpma, Isınma, Yukarı–aşağı, Uzağa bakış, Yakın–uzak.
- Yeni durakta "Yeni" rozeti çıkıyor. Yolda 3 ve 5 dakikalık kısa yoga var.
- Ana sayfanın yeni tasarımı bu sürümde yok. Y1 eski Ana sayfanın üstünde görünüyor.

**Kapanması için**
- Cihazda 14 madde denenecek. Başlıcaları: yeni kurulumda 1., 2., 4. ve 9. gün, eski hesabın ilk açılışı, "2 dk daha", 390 ve 320 pt, iki tema.
- 5 saniye kapısı geçilmedi. Üç turda yalnız "Bugünün ritmi" geçti.
  - İlk görünümde "Yeni" rozeti ve 1. günün "8 dk"sı görünmüyor.
  - 320 pt'de "Sağ–sol" tireden bölünüyor.
- Metin kapısı açık: üç ekran cümlesi ve bir sınır cümlesi var. Bunlar için iki bağımsız inceleme ve senin onayın gerekiyor.
- Altı not onayını bekliyor. En önemlisi: plandaki 629 nefes bileşiminden gerçekte yalnız 230'u seçilebiliyor.
- Test düzenekleri hâlâ karalama alanında, depoya alınmalı.

**Bulgular**
- Kanıtlı bir hata var: nefes çeşitliliği kuralı, aynı günkü birden çok kaydı ayrı günler gibi sayıyor.
  - Aynı gün 3 Karın nefesi kaydedilirse, bu nefes haftanın kalanında hiç gelmiyor.
  - Aynı gün 2 tutmalı kayıt olursa, haftanın kalanında tutmalı gün gelmiyor.
  - Kullanıcı erken bitirip kaydederek bu duruma düşebiliyor. Hata güvenlik sınırını aşmıyor, kuralı gereğinden sıkı uyguluyor.
- 400 günlük benzetimde başka kural ihlali çıkmadı. Göz gruplarının hiçbiri 75 saniyeyi aşmıyor.
- Kanıtlayamadığım dört kuşku var. Biri: bazı durumlarda mola, bugünkü kurala göre farklı başlayabiliyor.

**Sıradaki adım**
- Build 60 telefona kurulunca Y1 ve B0'ın cihaz listeleri birlikte geçilecek. Aynı anda metin kapısı ve altı not kapatılabilir; bunlar kod istemiyor.
- Ardından onaylı sıra: B0, B1a, B1b, B2 bildirimler, Y2 Gelişim "Yolun" bölümü, Y3, Y4, B3, Y6.
- Hava ve yürüyüş eşliğine bu iki denetimde bakılmadı.

## Durum raporu

Kaynaklar: plan §1, Y1_KOD_RAPORU, Y1_5SN_SONUCLARI, YAPILACAKLAR, ACIK_ISLER ve git log. Hiçbir dosya değişmedi.

**1) Y1 açık mı, kapalı mı:** Açık. Açıp kapatan bir bayrak ya da ayar yok.
- İlerleme bağlamı Ana sayfada her zaman kuruluyor: `app/src/screens/Home.jsx:181-186`. Oradan `TodayPath`'e `staged={Boolean(progression)}` olarak gidiyor (`Home.jsx:438`).
- Modül ekranları da bağlamı kendileri kuruyor (`app/src/modules/pathContext.js:16-23`). Bağlam yalnız hata olursa `null` oluyor ve ekran eski hâline dönüyor (`:25`).
- Y1 kodu Build 60'tan önce kaydedilmiş: `6ea6890`, `e71abe6`, ardından `52dcf67` "Build 60".
- Build 60 sürüm notu Y1'i sayıyor (`app/src/lib/releases.js:36-47`). Kullanıcı şunları görür:
  - yoldaki nefes 1. gün 1, 2. gün 2, sonra 3 dk; bitince "2 dk daha" ile 5 dk'ya tamamlanır;
  - nefeste "Bugünün ritmi";
  - kademeli göz egzersizi (kırpma → Isınma → Yukarı–aşağı → Uzağa bakış → Yakın–uzak; Daire ile Yukarı–aşağı gün aşırı);
  - yeni durakta "Yeni" rozeti;
  - yolda 3 ve 5 dakikalık kısa yoga.
- Ana sayfanın yeni tasarımı Build 60'a girmiyor (`c425a59`: "yama; Build 60'a girmez"). Yani Y1, eski Ana sayfanın üstünde görünür.
- Build 60 TestFlight'a gerçekten yüklendi mi, bakmadım.

**2) Parça parça durum** (dosyaları `ls` ve `grep` ile aradım):

| Parça | Kod | Test | 5 sn kapısı | Cihaz | Sahip onayı |
|---|---|---|---|---|---|
| Y1 | Var (`lib/progression.js`, `lib/ladders.js`, `lib/breathMix.js` …) | Var: 136 dosya, 1854 test yeşil (rapor §4.1); eşdeğerlik 0 fark | Geçmedi: 3 turda yalnız "Bugünün ritmi" geçti (5SN:3-5) | Denenmedi; 14 madde açık (rapor §5) | Plan onaylı; §6'daki metinler ve §7'deki notlar onay bekliyor |
| Y2 | Yok | Yok | — | — | Plan onaylı |
| Y3 | Yok (`lib/dayOpen.js` yok) | Yok | — | — | Plan onaylı |
| Y4 | Yok (`modules/gunun` yok) | Yok | — | — | Plan onaylı |
| Y5 | Yok (`lib/sky.js` yok); yerini B2 aldı (bildirim planı `PLAN.v1.md:30`) | Yok | — | — | B2 sırası onaylı |
| Y6 | Yok | Yok | — | — | Plan onaylı |
| §3.K site | Yalnız Y1'in görseli ve metni (`site/pages/index.html`) | 390 ve 320 pt'de gözle bakıldı | Site Y1 ile birlikte bekliyor | — | K.7 kararları verildi; Y1 parçası, Y1 cihaz kapısı ve yeni Ana sayfa cihazda bitince (`PLAN:1356`) |

**3) Y1'in kapanması için eksikler**
- **Metin kapısı** (`Y1_KOD_RAPORU.md:159-167`). İki bağımsız model incelemesi ve senin onayın gerekiyor; yapıldığına dair kayıt yok (ACIK_ISLER A6). Üç cümle aynen şöyle:
  1. "Sırada mola: 3 dk nefes, 2 dk dinlenme"
  2. "Haftalık E testinin olmadığı bir günün yolu: ısınma ve uzağa bakış tamam, sırada çemberler; ardından yakın–uzak ve 3 dakikalık nefesle başlayan 5 dakikalık mola; yolda E testi yok"
  3. "Yol ilk gün 8 dakikadır ve her gün bir adım büyür. Göz hareketleri, uzağa bakış, bakışla oynanan bir oyun ve 3 dakikalık nefesle başlayan 5 dakikalık mola sırayla gelir; tam yol yaklaşık 15 dakika sürer. E testi haftada bir gün yola eklenir."
  - Ayrıca açık bir madde var (NIT #23): kanıt satırının altına bir sınır cümlesi eklenmesi.
- **Sahibe altı not** (`Y1_KOD_RAPORU.md:173-193`):
  1. Plandaki "629 nefes bileşimi" yerine gerçekte 230 bileşim seçilebiliyor.
  2. Eski kullanıcının yolunda nefes kısalınca 20 dk sınırında yer açılıyor; plandaki izinli farklar listesine eklenmeli.
  3. 2. günün molası 5 dk'ya çıkabiliyor (1. bölüm 2 dk'dan uzun sürerse).
  4. Benzetim ile plan metni farklı (Daire ile Yukarı–aşağı; 3 dk bütçede 12,5 / 12,8 dk).
  5. Kayıt alanı `steps` değil, yeni `stepIds` alanı.
  6. Kod ajanlarının kararları onay bekliyor: tam set gününün adı "Normal set"; yoldaki nefes kayıtlı süre tercihini değil basamağı açar; 90. günden sonraki nefes odak haftası Y1'de yok; kısa E testi yol gününe sayılmaz.
- **Cihaz** (S2 kapısı, rapor §5, 14 madde). Başlıcaları:
  - yeni kurulumda 1., 2., 4. ve 9. gün;
  - eski hesabın ilk açılışı;
  - ara kilidinin 1. ve 2. günkü hissi;
  - V3 kırpma grubunun süresi (en çok 75 sn);
  - "2 dk daha";
  - 390 ve 320 pt, iki tema;
  - Ana sayfadaki "Nefes · 5 dk" önerisi;
  - mola bandı ve baloncuk;
  - 1 yıllık geçmişte takılma olmaması.
- **Öteki eksikler:**
  - 5 sn kapısı hâlâ açık. 5SN gözlemlerinden: ilk görünümde "Yeni" rozeti görünmüyor, 320 pt'de "Sağ–sol" tireden bölünüyor, yol sayfayı kaydırdığı için 1. günün "8 dk"sı ilk görünümde yazmıyor.
  - YAPILACAKLAR'da (c) satırı yok (ACIK_ISLER D2).
  - Eşdeğerlik ve benzetim düzenekleri hâlâ karalama alanında; depoya alınmalı (ACIK_ISLER:150).

**4) Sıradaki somut adım**
- Onaylı sıra: B1 → B2 → Y2 → Y3 → Y4 → B3 → Y6. YAPILACAKLAR başa B0 ekliyor ve B1'i ikiye bölüyor: B0 → B1a → B1b → B2 → Y2–Y4 → B3 → Y6 (`YAPILACAKLAR.md:485`).
- **Sonsuz yolun hemen sıradaki adımı:** Build 60 telefona kurulunca Y1'in 14 maddelik cihaz listesi (S2) ve B0'ın cihaz listesi birlikte geçilir (`YAPILACAKLAR.md:496`).
  - Buna paralel olarak Y1'in metin kapısı (3 cümle ve NIT #23) ile altı notun onayı kapatılır. Bunların hiçbiri kod istemiyor.
- **Y2'den önce bitmesi gerekenler:**
  - B1a, B1b ve B2 (B1a Build 60'tan sonra başlar);
  - Y2 tasarımı (Gelişim "Yolun" bölümü) ve senin onayın (S1);
  - Y1 düzeneklerinin depoya alınması;
  - Y2'ye bağlanan açık işler: 90. günden sonraki odak, hap kontrastı, kırpma, Yılan, Çemberler ve okumanın Gelişim ölçümleri (ACIK_ISLER:100-117).
- **Y3'ten önce:** Ana sayfanın yeni tasarımı onaylanıp cihaza girmeli. Sitenin Y1 parçası da buna bağlı (`PLAN:1356`).

Not: ACIK_ISLER `155370e` anına göre yazılmış. Sonraki kayıtlarda A6 ve C6'nın kapandığına dair bir şey görmedim.

## Doğruluk raporu

Kanıtlı bir bulgu var, küçük. Güvenlik sınırları aşılmıyor, yalnızca haftalık sınır fazla sıkı çalışıyor.

**Test sonucu:** `cd /home/user/eyes/app && npx vitest run src/lib/progression src/lib/ladders src/lib/breathMix` çalıştı: 3 dosya geçti, 71 testin 71'i geçti (3.35 sn).

**Kanıtlı bulgu (1)**
1. `app/src/lib/breathMix.js:130-138` `mixHistory` kayıtları gün başına tekilleştirmiyor, her seans ayrı satır oluyor. `breathMix.js:199` (`famUsed`) ve `:194` (`week.filter(holdy).length`) bu satırları "gün" diye sayıyor. Oysa plan §A.4 ve A.5 "7 günde en çok 3 gün" ve "haftada ≤ 2 gün" diyor. Sonuç:
   - Aynı günde 3 Karın nefesi kaydı varsa o aile haftanın geri kalanında hiç seçilmiyor.
   - Aynı günde 2 tutmalı kayıt varsa hafta bitene kadar başka tutmalı gün gelmiyor.
   - Bu duruma gerçekten düşülebiliyor. `screens/Breath.jsx:311-313` erken bitirince sonuç ekranına geçiyor. `:329-333` "Kaydet" ile seansı `mix` alanıyla yazıyor, 60 sn'den kısa olsa da. `modules/breath/view.jsx:30` gün 60 sn'ye ulaşmadıkça yol nefesini yine açıyor. Aynı gün aynı kalıp ikinci kez kaydedilebiliyor.
   - Hata güvenli yönde: sınırı gevşetmiyor, fazla sıkılaştırıyor. Ama plandaki kurala uymuyor.
   - Kanıt `scratchpad/sonsuz-denetim/probe1.mjs` ve `probe2.mjs` çıktısında:
     `mixHistory 3 kayıt aynı gün -> 3 girdi`
     `belly seçimi, 3 gün önce 1 kayıt : 75/300` / `... aynı günde 3 kayıt: 0/300`
     `tutmalı gün, 3 gün önce 1 tutmalı kayıt : 108/300` / `... aynı günde 2 tutmalı kayıt: 0/300`

**İhlal çıkmayan denetimler** (`probe1.mjs`, `probe2.mjs`)
- B, C ve D katmanlarının her biri 400 gün benzetildi. Zarf dışı kalıp, art arda aynı bileşim, haftada 3'ten çok aynı aile, art arda tutmalı gün, haftada 2'den çok tutmalı gün ve 1'den çok beklemeli gün sayıları hepsinde 0 çıktı.
- Bileşim sayıları plandakiyle aynı: B 40, C 99, D 629, seçilebilen D 230.
- Göz gruplarının hiçbiri, hiçbir çeşitlemede (V1–V4 dahil) 75 sn sınırını aşmıyor.

**Kuşku (kanıtlayamadım)**
- `progression.js:254-258` `restDecision`: kullanılan göz süresi 0 iken (1. bölümün göz payı 1, üst sınırı 3; 2. bölümde 6 dk göz; bütçe 5 dk) Y1 kolu `'path'` dönüyor, bugünkü kural `null`. Fark saf işlevde kanıtlı. Ama bu girdinin gerçek bir yolda oluşup oluşmadığına bakmadım. Plandaki "ancak … ise başlar" ifadesi de iki türlü okunabiliyor (Y1 molayı yalnız kısıtlar mı, yoksa kendisi de başlatabilir mi).
- `progression.js:271`: `pathRestMinutes` `s.restSlot` yazıyor; `:250` `s?.restSlot` yazıyor. `plan.stops` içinde null olursa `pathRestMinutes` çöker. `buildPath`'in null durak üretip üretmediğine bakmadım.
- `progression.js:201`: `updateDay` yalnız `LADDERS` anahtarlarına bakıyor. Modülün manifestte kendi verdiği merdiven hesaba girmiyor. Bugün böyle bir modül var mı, bakmadım.
- `progression.js:78`: Ana sayfadaki `breath-5` ve set seansları `stage` alanı yazmıyor. Yolu hiç kullanmayan yeni kullanıcıda Dvar geride kalabilir, ya da D ≥ 14 olunca güncelleme günü sanılabilir. Benzetmedim.

Dosyalar: `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/sonsuz-denetim/probe1.mjs`, `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/sonsuz-denetim/probe2.mjs`
