# Nef · süper zekâ planı (sürüm 1, 2026-10-01)

Durum: **ONAYLANDI** (sahip, 2026-10-01, kelimesi kelimesine: "onaylıyorum sen mükemmel diyorsan"). Ayrıntılar §10. Bu oturumda `app/` altında hiçbir dosyaya dokunulmadı. Ücretli çağrı da
yapılmadı: model, ElevenLabs ve banka üretimi yok. Kod, onaydan sonra ana oturumda yazılır. Dal: `claude/nef-super-zeka`.

**Girdiler**
- Sahibin sözleri: §0.
- Bugünkü kod: `lib/coach.js`, `coachCore.js`, `api/coach.js`, `CoachCard.jsx`, `notifyAll.js` ailesi, `sky.js`,
  `health.js`, `alarm*.js`, `dataHub.js`, `progress.js`, `sources.js`.
- Onaylı planlar:
  - `bildirim-hava-yuruyus/PLAN.v1.md` ve `DEVIR.md`: cümle bankası, B1–B3.
  - `YOL.nef.md`: dönem paketleri, bekçi kuralları.
  - `gelisim-merkezi/PLAN.v1.md`: tek çıkış `growthCenter`.
  - `ana-sayfa/d9-karar/nef-cumleleri-onay.md`: 13 onaylı Nef cümlesi.
- Araştırma: `arastirma/rakipler-ve-ios.md` (bu oturum), önceki `bildirim-hava-yuruyus/arastirma/` dosyaları.
- Örnek görseller: `ornekler/`. 5 saniye sonuçları: §9.

---

## 0. Sahibin istediği, tek bakışta

> "nef akıllı analizler yapar bildirim gönderir yorum yapar gelişimi takip eder … hem jey ai fazla token
> yakmamak hem de ileri derece yapay zekâymış gibi olmasını istiyorum. kullanıcılara her gün aynı bilgiyi vererek
> sıkmamasını da istiyorum … su içme hatırlatıcısından yağmur başlıyor veya gelişimini takip etmesine kadar inanılmaz
> zeki olacak … hiçbir app'de olmayan bir şey istiyorum … token harcaması benim için önemli"
>
> Ek istek, aynı gün: "nef'i pubmed bilgi bankası ile güçlendirelim … daha sonra bütün app başka dillerde yapılacak …
> nef ve nefona tam olarak bütün dillerde olacak … şu an sadece türkçe"

| İstek | Plandaki karşılığı |
|---|---|
| İnanılmaz zeki | Nef, telefondaki **an motoruyla** doğru anı seçer. Söyleyeceği şeyi kişinin kendi verisinden kurar (§3, §4) |
| Az token | Günlük işlerin hepsi telefonda ve **sıfır token**. Model yalnız haftalık mektupta, aylık hikâyede ve isteğe bağlı sohbette çalışır (§6) |
| Her gün aynı şeyi söylemesin | **Söz hafızası** ve tekrar kuralları var; söyleyecek yeni bir şey yoksa Nef **susar** (§4.4, §4.5) |
| Hiçbir uygulamada olmayan | Kaynakla tarandı. Büyük uygulamalarda bulunmayan dört şey var. "Hiçbir uygulamada yok" denmez, "bulamadık" denir (§2) |
| OpenAI'den zeki | Dürüst cevap §1'de |
| PubMed bilgi bankası | `sources.js` genişler: her kaynağın bulgusu, sınırı ve hangi an için kullanılacağı tutulur. Model yalnız bankadan alıntı yapar (§5) |
| Bütün diller | Cümle bankası, bilgi bankası, ses ve ek tablosu dile göre anahtarlı. Şimdi yalnız `tr` yazılır (§4.7) |
| Büyüyen, öğrenen Nef | Her modül Nef'e manifestindeki `progress` alanıyla kendiliğinden öğretilir; öğretilmemiş modül testten geçemez. Uyku ölçülünce o da kendiliğinden girer (§4.8) |

---

## 1. Dürüst çerçeve: "OpenAI'den zeki" ne demek

- OpenAI'nin modelinden daha zeki bir model biz yapamayız. Yapmaya çalışmak da gereksiz.
- Bir koçu zeki gösteren üç şey var, üçü de modelden değil veriden gelir:
  1. **Doğru an.** Yağmur kişinin yürüyüş saatine denk geliyorsa sabah söylemek.
  2. **Seni bilmek.** "Geçen salı Dalga'dan sonra 4'ten 7'ye çıkmıştın."
  3. **Ne zaman susacağını bilmek.**
- ChatGPT bunların hiçbirini kendiliğinden bilmez. Çünkü o kişinin adımını, alarmını, Dalga puanını ve sokağındaki
  yağmuru görmez. Nef görür.
- Bilimsel dayanak:
  - Kişiye ve onun son verisine göre uyarlanan mesajın etkisi küçük ama tutarlı: Noar 2007, Krebs 2010, Hao 2023
    (`BILDIRIM_PLANI.md` kaynakçası).
  - Yalnız üslubu dil modeliyle uyarlamak davranışa ek katkı yapmadı (Schlicht 2026).
  - Metni yenilemek, uygulamanın açılmasını sabit metinden fazla artırmadı (Bell 2023, PMID 37294612).
  - Sonuç: zekâ cümlenin süsünde değil, **seçilen anda ve kişisel olguda**.
- Sağlık iddiası yok. Nef "iyi gelir", "azaltır" demez; kişinin kendi sayısını ve kaynağın kendi bulgusunu söyler.

---

## 2. Araştırma: bu fikirler başka uygulamada var mı

Ayrıntı ve bütün bağlantılar `arastirma/rakipler-ve-ios.md` dosyasında. Tarama tarihi 2026-10-01. Taranan uygulamalar:
Apple Sağlık, Fitness, Watch, Weather; Google Fit; Fitbit; Whoop; Oura; Garmin; Strava; Nike Run Club; Headspace;
Calm; Finch; Fabulous; Streaks; WaterMinder; Waterllama; Carrot; Gentler Streak; Bevel; Welltory; Rise; Sleep Cycle.

| Fikir | Kimde var | Bizim farkımız |
|---|---|---|
| Yürüyüş başlayınca soru ve sesli eşlik | Apple Watch 10–15 dk sonra "antrenman yapıyor gibisin" der. Workout Buddy sesli eşlik eder ama saat ve Apple Intelligence ister | İkisini **iPhone'da birleştiren** uygulama bulamadık |
| Geçmiş etkini hatırlayan koç | Oura, Whoop ve Headspace Ebb sohbet hafızası tutar. Garmin günler arası ilişki kurar | Ders bazında **"o dersten sonra puanın 4'ten 7'ye çıktı"** diyen bulamadık |
| Bilerek susan, tekrar etmeyen koç | Oura'da kişi sıklığı seçer; tekrar hafızası bulamadık | **Bulamadık.** Bizde kural (§4.4) |
| Havaya göre su | Waterllama hedefi iklim türüne göre ayarlar, günün hissedilen sıcaklığına göre değil | Günün sıcaklığıyla değişen hatırlatma **bulamadık** |
| Yağmur + eylem önerisi | Apple Weather ve Carrot yalnız yağmur der. Küçük koşu uygulamaları koşu saati önerir | Büyük bir sağlık uygulamasında **kişinin kendi saatine göre** öneri bulamadık |
| Gün ışığına göre mola | Yalnız gün batımı uygulamaları | İyi oluş uygulamasında **bulamadık** |
| Aylık hikâye kartı | Gentler Streak, Whoop, Oura, Strava yıllık | Var. Biz ilk olmayız, hikâyeyi kendi verimizle kurarız |
| Haftalık yapay zekâ özeti | Whoop, Oura | Var. "Mektup" biçimi bulamadık |
| Kişinin saatini öğrenen hatırlatma | Streaks "otomatik saat" (yöntemi doğrulanamadı); Rise vücut saatine göre | Bizde B1'de var ("Nef seçsin") |
| Modelsiz cümle bankası | Bulamadık. Bütün büyük koçlar dil modeli kullanıyor | Maliyet ve gizlilik avantajı |

**Söylenebilecek cümle:** "Bu dört özelliği birlikte sunan bir uygulama bulamadık." Bu dördü şunlar: kendi anını
hatırlayan, susmayı bilen, havayı kişinin saatine bağlayan ve modelsiz çalışan koç. "Hiçbir uygulamada yok" denmez,
çünkü kapalı uygulamaların içi görülemez.

---

## 3. Fikirler

Her fikir aynı biçimde yazıldı: hangi veriden doğduğu, ne zaman geldiği, örnek cümle, neden şaşırttığı, iOS'ta
olabilirliği, maliyeti ve gereken rıza. Örnek cümleler taslaktır, sahip onayı olmadan koda girmez.

Bütün telefon kurallarının token maliyeti 0'dır. Sinyal adlarının nerede olduğu `ARA_RAPOR_envanter.md` dosyasında.

### Birinci sürüme önerilenler

**F1 · Yağmur senin saatine denk geliyor** (sahibin örneği; D11'in çözümü)
- Veri: WeatherKit saatlik tahmini (`sky.js`, `rain {from,to}`) ve kişinin yürüyüş saati. Saat iki yerden gelir:
  kişinin kurduğu yürüyüş hatırlatması ya da son 28 günün yürüyüş adımlarından çıkan alışkanlık saati.
- An: sabah havası bildiriminin yerine ya da yürüyüş hatırlatmasının metni olarak. Günde tek hava cümlesi kuralı
  bozulmaz.
- Örnek (görsel M1C, 5 saniye kapısında 4/5 ile **geçti**): başlık "Yürüyüşün yağmura denk geliyor", gövde "Bu hafta üç
  akşam 19.30'da yürüdün. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."
- Cümle önce kişinin kendi düzenini söyler, sonra havayı. Kişisel olgu yoksa (yürüyüş alışkanlığı oluşmadıysa) bu an
  kurulmaz; düz hava uyarısı 0/5 aldı (M1A).
- Saatler tutarlı olmalı: "bir saat erken" deyip 1,5 saat önceki saati önermek güveni kırdı (M1B).
- Neden şaşırtır: hava uygulaması yağmuru söyler; Nef **senin** yürüyüşünü söyler.
- iOS: var olan sabah havası yolu kullanılır. Türkiye'de Apple'ın dakikalık yağmuru yok
  (support.apple.com/105038), saatlik tahmin yeter.
- Rıza: `weather` (var).

**F2 · Seni hatırlayan Nef**
- Veri: modüllerin öncesi–sonrası puanları. Nefes `calmBefore/After` 1–5; Dalga sakin, güç ve motive 0–10;
  Gökyüzü 0–10; Yön uzak rahatsızlık 0–10. Hesap `progress.js acuteEffects`.
- An: Ana sayfa Nef kartı. Kişinin o modülü en sık açtığı güne ve saate yakın.
- Örnek: "Geçen hafta bu akşam Dalga'dan sonra sakinliğin 4'ten 7'ye çıkmıştı." ve düğme "Bu akşam da Dalga · 8 dk"
  (görsel M2; 5 saniye kapısında 5/5 ve 4/5 ile **geçti**). Bugünün gün adı tekrar edilmez, "geçen salı" denmez.
- Kural:
  - Tek bir seans **olgu** olarak söylenir: tarih, modül, önce ve sonra.
  - "Sayesinde", "iyi geldi" gibi sebep sözü yasak.
  - Genel cümle ("Dalga'dan sonra genelde 2 puan artıyor") yalnız `acuteEffects` anlamlıysa kurulur: en az 3 seans
    ve güven aralığı sıfırı geçmiyor.
- Neden şaşırtır: koç seni hatırlıyor. Rakip taramasında ders bazında bunu yapan bulunamadı.
- Rıza: yok. Veri telefondan çıkmaz.

**F3 · Sıcaklık, kişinin kendi saatinde** (sahibin "su içme" örneği; 5 saniye kapısından sonra değişti)
- Su tek başına bir Nef anı **değil**. "Bugün hissedilen 33°, bardağını doldur" iki turda 0/5 ve 1/5 aldı.
  Değerlendiricilerin ortak sözü: "sıradan su hatırlatması, beni tanımıyor" (`ornekler/5sn-sonuclari.md`).
- Bunun yerine sıcaklık, kişinin **kendi** yürüyüş ya da yağmur bildirimine bir yan cümle olarak girer.
  - Örnek: "Yağmur yok ama 19.30 yürüyüşünde hava hâlâ 31 derece; suyunu yanına al."
  - Ayrı bildirim yok. Kişinin su hatırlatması da her zamanki metniyle gelir.
- Eşik: hissedilen ≥ 30° (VARSAYIM; `nef-bildirim.md` §3.3 sıcaklık sözcükleriyle aynı aile).
- Metin kuralları:
  - Sıcaklık "31 derece" diye yazılır; "31°'ye" gibi ek almış derece işareti kullanılmaz (değerlendirici şikâyeti).
  - Bildirimde tek saat geçer.
- Sağlık iddiası yok: "susuz kalırsın" ya da "sıcak çarpar" denmez.
- Rıza: `weather`.

**F4 · Susan Nef**
- Kural: o gün Nef'in söyleyeceği yeni bir olgu yoksa Nef kartı küçülür ve tek satır olur, Nef'in kendi bildirimi
  gelmez.
  - Örnek satır: "Bugün senden bir şey istemiyorum. Yolun hazır."
  - Kişinin kendi kurduğu hatırlatmalar her zamanki gibi gelir.
- Kişi bugünkü yolunu bitirdiyse akşam Nef bildirim göndermez.
- Neden şaşırtır: hiçbir koç susmaz; susan koç güven verir.

**F5 · Nef'ten mektup** (haftalık, model)
- Veri: geçen takvim haftasının paketi (`YOL.nef.md` §5.2 `kind:'week'`) ve haftanın en dikkat çekici iki olgusu.
  Olguları an motoru seçer.
- An: Pazartesi, kişinin en sık açtığı saatte, Ana sayfada kart. Bildirim isteğe bağlı ve varsayılan kapalı
  (Gelişim planındaki "Haftalık gelişim" satırıyla birleşir; iki ayrı Pazartesi bildirimi olmaz).
- Görünüm (görsel M4A, 5 saniye kapısında 5/5 ile **geçti**):
  - Tek cümlelik başlık: "Yağmurlu iki akşam yürüyüş yerine nefesi seçtin; düzenin bozulmadı."
  - Altında 7 günlük şerit: yürüyüş, yağmurlu akşamın nefesi ve boş gün.
  - En altta tek öneri satırı: "Bu hafta: salı, perşembe 19.30".
  - Uzun metin yok. Uzun mektup 2/5 aldı: "metin duvarı".
- Model yalnız cümleyi kurar. Sayılar paketteki sayılarla birebir aynı olmalı; değilse mektup atılır ve şablon
  mektup gösterilir (§6.3).
- Rıza: `coach` sürüm 2 (`YOL.nef.md` §7.4).

### İkinci sürüm

**F6 · Söz tutan Nef**
- Akşam kartında tek soru: "Yarın yürüyüş ne zaman?" Cevap çiplerle verilir: sabah, öğle, akşam, bilmiyorum.
- Ertesi gün Nef kişinin kendi sözünü hatırlatır: "Dün 'akşam yürürüm' demiştin; yağmur 20.00'de bekleniyor, 18.30
  iyi olur."
- Dayanak: eğer–o zaman planlarının fiziksel aktiviteye etkisi pekiştirildiğinde var (Silva 2018, PMID 30427874).
- Serbest metin yok, yalnız çip; veri telefonda kalır.

**F7 · Gün ışığı molası**
- Gün batımı saati telefonda, konumdan ve tarihten hesaplanır; ağ ve API gerekmez. Bugün `sky.js` gün batımını
  almıyor (envanter).
- An: gün batımından 45 dk önce. Yalnız iki koşul birlikte varsa gelir: son saatte adım < 100
  (`health.js walkNudge`'ın kuralı) ve kişi mola hatırlatmasını açmış.
- Örnek: "Güneş 18.52'de batıyor. Işık varken 10 dakika dışarı çıkmak ister misin?"
- Dayanak: gün uzunluğu adım sayısıyla ilişkili bulundu (Schepps 2018, 16.741 kadın, gözlemsel; PMID 29700376). Bu
  bir ilişkidir, öneri değil; kartta öyle yazar.

**F8 · Kendi düzenini öğrenen Nef**
- B1'in "Nef seçsin" saatine ek bir kural: kişi iki haftadır hatırlatmadan farklı bir saatte yapıyorsa Nef bir kez
  sorar.
- Örnek: "Nefesi son iki haftada çoğunlukla 22.00'de yaptın. Hatırlatmayı oraya alayım mı?"
- Tek dokunuşla taşınır; "Hayır" denirse 60 gün sorulmaz.

**F9 · Aylık hikâye**
- 29., 57. ve 85. gün (Gelişim planındaki aylık günler) Ana sayfada tek kart.
- Ayın üç "ilki" gösterilir: ilk 10 dakikalık nefes, en uzun yürüyüş, en yüksek sakinlik artışı.
- Paylaşılabilir görsel: kişisel sayı paylaşımı kişinin elinde, varsayılan kapalı.
- Model isteğe bağlı: şablon da yeter; model yalnız `coach` v2 rızasıyla tek paragraf yazar.

**F10 · Yürüyüşe eşlik daveti, hafızalı**
- B3'ün onaylı sorusuna ("Yürüyüşe mi çıktın? … Eşlik edeyim mi?") bir hafıza satırı eklenir: "Bu hafta üçüncü
  akşam yürüyüşün."
- iOS sınırı: CoreMotion güncellemesi uygulama askıdayken gelmez (Apple belgesi, `startActivityUpdates`). Yürüyüşü
  anında yakalamak için onaylı yol karar 2'dir: "Her Zaman" konum, ≥ 500 m.
- Yeni bulgu, cihazda denenir: `UNLocationNotificationTrigger` uygulama kapalıyken bölgeden çıkışta bildirim
  gösterir ve yalnız "Kullanırken" izni ister (Apple belgesi). Kişi evini işaretlerse "evden çıktın" anı
  "Her Zaman" izni olmadan yakalanabilir.
  - Bedeli: evin yeri telefonda saklanır.
  - Metin kurulduğu anda sabitlenir, o anki havayı bilemez.
  - Ayrı rıza ve hukukçu sorusu gerekir.
  - Sahibe soru 4.

**F11 · Dolunay, ilk kar, en uzun gün**
- Takvim anları; bankada zaten bir tür ("Takvim anı").
- Yılda birkaç kez gelir; aynı anın cümlesi bir yıl tekrar etmez.
- Ay ve uyku arasında bağ kurulmaz (onaylı kural).

### Elenenler

| Fikir | Neden elendi |
|---|---|
| Ortam ışığına göre mola | iPhone'un ortam ışığı sensörüne uygulamalar erişemiyor. Envanterde de yok |
| "Su iç, baş ağrın geçer" türü | Sağlık iddiası; su–göz bağı için kaynak da yok (`nef-bildirim.md`) |
| Her bildirimde canlı model | Bildirim metni kurulduğu anda sabitlenir; hava ve konum sunucuya gidemez (onaylı plan). Banka yöntemi seçildi |
| Bildirimde kişinin adı | Ad eklemenin yanıta etkisi bulunamadı (Atluri 2026, PMID 42580690) |

---

## 4. Mimari: telefon aklı

```
VERİ  (hepsi telefonda; yeni hesap yok)
  growthCenter (Gelişim planı) · progress.acuteEffects · health · sky.js (saatlik, rain, apparentC)
  alarm + alarm-log · moduleRemind (kurulu saatler, "Nef seçsin") · notify-log · yol (progression)
        │
        ▼
AN MOTORU   lib/nef/moments.js     ← kurallar: "şu an söylenecek bir olgu var mı?"
        │   her an: { id, tür, olgu sayıları, önem, son kullanma, kanal, kaynak anahtarı }
        ▼
SEÇİCİ      lib/nef/speak.js       ← önem × yenilik × kanal bütçesi; susma kuralları
        │   hafıza: gozolcum:nef-said (ne, ne zaman, hangi cümle)
        ▼
SÖZ         lib/nef/bank/tr.js     ← onaylı, boşluklu cümleler; sayıyı ve eki kod yazar
            lib/nef/knowledge.js   ← PubMed bilgi bankası (sources.js genişler)
        │
        ├─► Ana sayfa Nef kartı / satırı      (anında, bildirim yok)
        ├─► planAll kaynağı "nef" (7900–7919)  (mevcut kurallara uyar)
        └─► Haftalık mektup / sohbet           (model, rızayla, §6)
```

### 4.1 An motoru

- Saf işlevlerden oluşur ve test edilir; dosya önerisi `lib/nef/moments.js`.
- Her an türü bir kuraldır. Girdisi veri, çıktısı olgudur:
  - `rainOnWalk`: rain.from − 90 dk ≤ yürüyüş saati ≤ rain.to.
  - `recallEffect`: o modülün geçen haftaki aynı gün ve saatte bir seansı var, sonra − önce ≥ 2.
  - `hotWalk`: apparentC ≥ 30 ve kişinin yürüyüş saatine denk geliyor; yalnız yan cümle üretir.
  - `silentDay`: yeni olgu yok.
  - `weekLetter`: Pazartesi.
  - `promiseKept`: F6. `daylight`: F7. `drift`: F8. `firsts`: F9.
  - `returnAfterGap`: onaylı cümle 3.
  - `pathDone`: onaylı cümle 1 ve 5.
- Ölçüm, sayım ve tehlike uyarısı an motoruna da girmez. Göz kırmızı ve sarı uyarıları sabit kalır
  (`JEV_GOZ_KOCU.md` temel kuralı).
- Var olan Nef sesleri bozulmaz, an motorunun ilk "üreticileri" olur: `homeSuggest.js`, `today.js jevLine` ve 13
  onaylı Nef cümlesi. Davranışları değişmezse eşdeğerlik testi 0 fark verir.

### 4.2 Seçici: hangi an, hangi kanal

- Önem puanı her an türünde sabittir (VARSAYIM; ilk sürümde elle). Sıra şöyledir: güvenlik ve doktor cümleleri
  (Nef'in dışında, kart) > kişinin bugünkü yolu > hava ile kişisel saat > kişisel olgu > düzen > takvim anı.
- Kanal bütçesi:
  - Ana sayfa kartı: günde 1 ana cümle ve en çok 1 küçük satır.
  - Nef'in **kendi** bildirimi: günde en çok 1, haftada en çok 4 (VARSAYIM). Kişinin kurduğu hatırlatmalar bu
    bütçeye sayılmaz.
  - Nef'in kendi bildirimi yalnız şu üç durumda gelir: hava–saat çakışması, kişinin sözü, haftalık mektup (açtıysa).
  - Öteki anlar yalnız Ana sayfada ya da var olan bir hatırlatmanın metninde söylenir.
- Var olan bildirimin metnini zenginleştirmek yeni bildirim eklemekten önce gelir. F1 ve F3 böyle çalışır.
  Gerekçe: bildirimin ilk haftalardaki etkisi zamanla azalıyor (Klasnja 2019, PMID 30192907) ve aktivite
  bildirimleri bazı denemelerde adımı artırmadı (Golbus 2026, PMID 41499691). Az ama yerinde bildirim.

### 4.3 Bildirim planlayıcısıyla bağ (mevcut kurallar bozulmaz)

- Yeni kaynak `planNef` `notifyAll.planAll` içinde, modül hatırlatmalarından **sonra** sıralanır, yani en düşük
  öncelikle. Kimlik aralığı 7900–7919 boş (bu oturumda `notifyApply.js` ve belgelerde arandı); `OWN_RANGES`'e eklenir.
- Uyduğu kurallar şunlar:
  - Gece 01–05 kesin yasak, sessizlik 23–07, yatmadan önceki 60 dk.
  - İki bildirim arası ≥ 30 dk.
  - JS bekleyeni ≤ 58.
  - Çalışma oturumunda gelmez.
  - Deney bildirimleri (74xx) asla kaymaz.
- Metin zenginleştirme (F1, F3) yeni kaynak değildir. `remindTexts.resolvePlanTexts` o günün metni için an motoruna
  sorar; kimlik ve saat değişmez. Deney türlerinde (74xx) deney metni değişmez; zenginleştirme yalnız 77xx ve 78xx
  bildirimlerinde olur. Böylece deney sonucu bozulmaz.
- Bildirim kurulduğu anda metni sabittir. Hava değişirse uygulama açılınca yeniden planlanır; bugünkü düzen de böyle.
  Uygulama hiç açılmazsa metin dünün tahminiyle kalır; tahmin 18 saatten eskiyse hava cümlesi kullanılmaz
  (onaylı sabah havası kuralı).

### 4.4 Tekrar etmeme hafızası

- Yeni kayıt `gozolcum:nef-said`: en çok 400 satır ve 180 gün. Her satır şunları tutar: tarih, an türü, olgu anahtarı,
  cümle kimliği, kanal, dokunuldu mu.
- Bugün Nef'in ne söylediği hiçbir yerde tutulmuyor (envanter); bu kayıt bunu kapatır.
- Kurallar (sayılar VARSAYIM; ilk ay ölçülür):
  1. Aynı **cümle** 21 gün içinde tekrar etmez.
  2. Aynı **olgu** bir kez söylenir. Örnek: "geçen salı 4'ten 7'ye" ikinci kez söylenmez.
  3. Aynı **an türü** Ana sayfada üst üste iki gün gelmez; güvenlik ve yol hariç.
  4. Aynı bilim satırı 7 gün içinde tekrar etmez. Kart açıldıysa 30 gün dinlenir (onaylı A.6; bugün kodda yok çünkü
     geçmiş tutulmuyordu, bu kayıtla mümkün olur).
  5. Dokunulmayan an türünün önemi her seferinde düşer. Üç kez yok sayılan tür 14 gün dinlenir.
- Hafıza telefonda kalır ve "Tüm verileri sil" ile silinir. Dışa aktarım (`exportData.js`) ona da bakar.

### 4.5 Susma kuralları

- Söylenecek yeni olgu yoksa Nef susar. Kart küçülür ve F4 satırı görünür; bildirim gelmez.
- Kişi bugünün yolunu bitirdiyse o gün Nef kendi bildirimini göndermez.
- Kişi uygulamayı 2 saat içinde açtıysa ve o anı Ana sayfada gördüyse aynı an bildirimle tekrar gelmez. Bu, sabah
  havasının bugünkü 2 saat kuralıyla aynıdır.
- Uzun aradan dönüşte (5+ gün) tek bir cümle gelir, sonra Nef susar. "Seni özledik" ya da suçlama yoktur.
- Düşük WHO-5'te Nef öneri ve neşe cümlesi kurmaz. Yalnız onaylı sabit yönlendirme satırı görünür (`who5.js`).

### 4.6 Cümle bankası

Onaylı B1b yöntemi aynen kullanılır (`nef-bildirim.md` §1–§3):
- Model yalnız **yapım anında**, kişisel veri görmeden, yer tutuculu aday üretir. Telefon cümleyi seçer, sayıyı ve
  eki kod yazar.
- Rakam içeren aday atılır.
- Saat ekleri tablodan gelir: "19.00'da", "21.00'de".

Bu plan bankaya şunları ekler:
- **An türü başına hücre:** her hücrede 6–10 onaylı cümle. Hücre anahtarı şöyle kurulur: an türü × saat dilimi ×
  ton (sakin ya da canlı) × ilk kez ya da tekrar.
- **Taslak hücreler** (örnek; hepsi onaya):

| Hücre | Cümle taslağı |
|---|---|
| rainOnWalk · sabah · ilk | "Yağmur {rainFrom:LOC} bekleniyor. Her zamanki {walkAt} yürüyüşünü {shift} öne alırsan yağmura kalmazsın." |
| rainOnWalk · sabah · tekrar | "Bugün de yağmur akşama denk geliyor; yürüyüş {walkEarly} daha kuru." |
| rainOnWalk · içeride | "Yağmur {rainFrom:LOC} başlıyor. Bugün yürüyüş yerine 5 dakikalık nefes de olur." |
| recallEffect · ilk | "Geçen {weekday} {module}'dan sonra {scaleWord} {before}'ten {after}'ye çıkmıştı." |
| recallEffect · genel | "{module}'dan sonra {scaleWord} son {n} seansta genelde {delta} puan arttı." |
| hotWalk (yan cümle) | "…{walkAt} yürüyüşünde hava hâlâ {feels} derece; suyunu yanına al." |
| silentDay | "Bugün senden bir şey istemiyorum. Yolun hazır." |
| drift | "{module}'i son iki haftada çoğunlukla {usualAt} yaptın. Hatırlatmayı oraya alayım mı?" |

- `{before}'ten` gibi Türkçe ekler sayıya göre ek tablosundan gelir ("4'ten", "3'ten", "6'dan"). Bu yüzden ek tablosu
  her dilin kendi dosyasındadır (§4.7).
- Yasaklar aynen geçerli (`nef-bildirim.md` §3.5): emoji yok, "-malısın" yok, korkutma yok, suçlama yok, sağlık
  iddiası yok, başkasıyla karşılaştırma yok.

### 4.7 Bütün diller için hazırlık (şimdi yalnız Türkçe)

Belgelerde zaten bekleyen iş olarak duruyor: YAPILACAKLAR "i18n", ACIK_ISLER G-16. Nef'i şimdiden buna uygun
kuruyoruz ki sonra yeniden yazılmasın:

- **Anahtar ve metin ayrı.** Kod yalnız cümle kimliğini ve yer tutucuları bilir. Metin `bank/tr.js` içinde durur;
  ileride `bank/en.js`, `bank/de.js` eklenir. Bir dilde cümle yoksa o an türü **susar**. Türkçeye ya da İngilizceye
  geri düşmez; yarım çeviri gösterilmez.
- **Dil kuralları dile özgü dosyada.** Türkçe sayı ve saat ekleri, ünlü uyumu, "salı"–"Salı" yazımı, ondalık virgül:
  `bank/tr.grammar.js`. Başka dilin çoğul kuralı kendi dosyasında olur (`Intl.PluralRules` gibi). An motoru dil bilmez.
- **Bilgi bankası iki katmanlı.** Kaynağın kendisi (yazar, yıl, PMID, DOI, tür, kişi sayısı) dilden bağımsızdır. Bulgu
  satırı ve sınır cümlesi dile göre tutulur: `finding.tr`, `limit.tr`. Bugünkü `titleTr` alanı bu yapıya taşınır.
- **Ses dile göre.** Ses klasörü bugün zaten dile göre ayrı (`public/voice/tr/…`). Yürüyüş koçu parçaları da böyle
  üretilir.
- **Model istemleri dile göre.** Mektup istemi her dil için ayrı yazılır ve ayrı sınanır. Bir dilde sınav geçilmeden
  o dilde model açılmaz.
- **Tarih, saat ve birim** her yerde `Intl` ile ve kişinin bölgesine göre yazılır: 19.00 ya da 7:00 PM, °C ya da °F.
  Bugün Ana sayfa tarihi `tr-TR` sabit yazıyor (`Home.jsx`); Nef bu sabiti kullanmaz.
- **Maliyet:** dil başına banka üretimi ≈ 1 USD ve ses ≈ 0,4 USD (§7). Asıl maliyet her dilde bir ana dili
  konuşanın onayıdır.

### 4.8 Büyüyen Nef: her yeni modül Nef'e kendiliğinden öğretilir

Sahip, 2026-10-01: "yeni modüller eklendiğinde nef öğretilmesi lazım … devamlı büyüyen öğrenen bir yapıda olacak …
gelişim merkezinden veri alarak yönlendirmesi ve takip etmesi gerekiyor her modülü … nef de sadece 3 değil yoga nefes
dalga göz egzersizleri de olacak; uyku kalitesi ölçülmüyor, ölçüldüğünde olacak".

**Bugünkü durum** (`modules/*/manifest.js`, bu oturumda okundu):
- 21 canlı modül var. Bunların 9'u `coach()` ile Nef'e özet gönderiyor; Dalga, Gökyüzü, Yön, göz egzersizleri,
  okuma, mola ve su göndermiyor.
- Buna karşılık her modül zorunlu `progress` alanında ne ölçtüğünü zaten bildiriyor:
  - `domain`: hangi alana sayıldığı.
  - `effects`: öncesi–sonrası puan.
  - `metrics`: zaman içindeki ölçüm.
- Gelişim de bunu okuyor. Nef'in ayrıca `coach()` istemesi gereksiz bir ikinci kapı.

**Öneri: Nef de `progress`'i okur; modül eklemek Nef'i de büyütür.**

1. **Genel an türleri.** Her modülden kendiliğinden çıkar, modül ek kod yazmaz. Veri Gelişim merkezinden gelir
   (`growthCenter`, `acuteEffects`, `metricTrend`, `verifiedChange`).

| Modülde ne varsa | Nef'in kendiliğinden kurduğu an | Örnek (taslak) |
|---|---|---|
| `effects` (öncesi–sonrası) | `recallEffect`, `effectPattern` | "Geçen hafta bu akşam Dalga'dan sonra sakinliğin 4'ten 7'ye çıkmıştı." |
| `metrics`, `better` yönünde rekor | `metricBest` | "Sayı hafızan ilk kez 7 haneye çıktı." |
| `metrics`, doğrulanmış değişim | `metricChange` (yalnız `verifiedChange` ya da `meaningful` eşiği geçilince) | "Okunuş bulmada son iki haftada ortalaman 3 saniye kısaldı." |
| `progression` basamağı | `ladderStep` | "Nefes bugün 3 dakikaya çıkıyor." |
| İlk kayıt | `firstTime` | "İlk yoga dersin tamam." |
| Uzun ara | `returnAfterGap` | Onaylı cümle 3: "Kaldığın yerden: basamakların aynı." |
| `remind` saati ile gerçek saat farkı | `drift` (F8) | "Yogayı son iki haftada çoğunlukla 07.30'da yaptın…" |

2. **İsteğe bağlı `nef` alanı.** Manifeste yeni bir alan gelir; hepsi isteğe bağlıdır.
   - `name`: modülün Türkçe çekimleri. "Dalga" → "Dalga'dan", "Dalga'yı". Yoksa ek tablosu ünlü uyumuyla kurar; özel
     adlarda modül kendi çekimini verir. Dil başına ayrı tutulur (§4.7).
   - `metricWords`: metrik sözcükleri; örneğin `span` → "hane", `ms` → "saniye".
   - `moments`: modüle özel an kuralı (saf işlev, test edilir). Örnek: yoga "sabah dersinden sonraki gece uykuya
     dalma kolaylığı" sorusu.
   - `cells`: o modüle özel onaylı cümle hücreleri; bankada `bank/tr.js` içinde modül kimliğiyle durur.
   - `evidence`: bilgi bankası anahtarları. Modülün `remind.science` alanında zaten en az bir PubMed kaynağı var;
     Nef aynı havuzu kullanır.
   - `note`: modülün kendini Nef'e tanıtan tek satırı (`YOL.nef.md` §4.4 `coachNote`); mektup isteminde kullanılır.
3. **Sözleşme testi** (`registry.test.js` yanında). Her canlı modül için şunlar denetlenir:
   - En az bir genel an üretilebiliyor mu?
   - Ad çekimi her ek için doğru mu?
   - `evidence` anahtarları `sources.js`'te PMID ve DOI ile kayıtlı mı?
   - Bankada o modülün genel hücrelerinde onaylı cümle var mı?

   Bunlardan biri yoksa test düşer. Yani **Nef'e öğretilmemiş modül yayına çıkamaz**.
4. **Mektup ve sohbet de kendiliğinden büyür.** Haftalık paket modül listesini manifestlerden kurar. `coachCore.js`'in
   bugünkü "en çok 10 modül" sınırı (ACIK_ISLER) yerine haftanın en çok 4 olayı seçilir. Model yeni modülü `note`
   satırından tanır; istem elle değişmez.

**Bugünkü modüllerde Nef'in takip edeceği** (ilk sürümde genel anlarla):

| Alan | Modül | Nef'in okuduğu |
|---|---|---|
| Göz | E testi, okuma, rutin, kırpma, günlük | Haftalık ölçüm ve doğrulanmış değişim (sabit doktor cümleleri modelden ve an motorundan bağımsız kalır), basamak, gün sayısı |
| Sakinlik | Nefes, Dalga (sakin, güç, motive), Gökyüzü, yoga | Öncesi–sonrası puanlar, basamak, ders sayısı, yoganın uyku sorusu |
| Dikkat | Çemberler, Yılan, Hızlı Bakış, Tek Bakışta | Rekor, isabet, doğrulanmış değişim |
| Farkındalık | Fark ettin, Farkındalık, notice | Gün ve ölçüm serisi |
| Kendin | Yön | "Dışarıdan bak" rahatsızlık puanı, ayna puanı |
| İyi oluş | WHO-5, alarm | WHO-5 durumu (düşükse yalnız sabit yönlendirme); alarm ve uyku saati düzeni |
| Beden | Mola, su, yürüyüş (B3) | Gün sayısı, adım (yalnız telefonda; Apple Sağlık verisi sunucuya gitmez) |
| Uyku | **Henüz ölçülmüyor** | Uyku modülü `metrics` ile geldiği gün Nef'in genel anları kendiliğinden açılır. Nef o güne kadar uyku hakkında yorum yapmaz |

**Sahibin örnekleriyle gelecekteki iki modül:**
- **Sayı hafızası** (rakamları aklında tutma). `metrics: [{ key: 'digits', unit: 'hane', better: 'up' }]` ve
  `effects` yoksa Nef kendiliğinden şunu söyler: "Sayı hafızan ilk kez 7 haneye çıktı." ve "Son iki haftada en iyi
  dizin 6 haneden 7'ye." Sağlık ya da "zekâ artar" iddiası yok; kaynak modül tasarlanırken PubMed'de taranır.
- **Okunuş bulma** ("hvaa" → "hava"). `metrics: [{ key: 'solveMs', unit: 'saniye', better: 'down' }, { key: 'solved',
  better: 'up' }]` → "Karışık kelimeleri bu hafta ortalama 4 saniyede buldun; geçen hafta 6'ydı." Kelime listesi dile
  göre ayrı tutulur (§4.7).

**Modül adı kuralı:** Nef cümlesinde oyun ya da modül adı geçerken türü de yazılır: "Yılan oyunu", "Dalga sesi". 5
saniye kapısında yalın ad ilk kez görene anlaşılmadı.

**"Zeki olduğunu anlaması" için kural:** Nef her modülde ilk kez **kişiye özgü bir olgu** söylediği anda bunu
kaydeder (`nef-said`). Kişi ilk 7 günde en az 3 farklı modülden böyle bir cümle görür; eşik VARSAYIM, ilk ay ölçülür.
5 saniye kapısının dersi de bu: etkileyen şey kişinin kendi olgusu (§9).

**Bilim kuralı:** yeni modül bilgi bankasına en az bir PubMed kaynağı getirmeden (bulgu ve sınırıyla, §5) Nef o
modül için bilim satırı kuramaz. Kaynak yoksa Nef yalnız kişinin kendi sayısını söyler, "kanıt" sözü etmez.

---

## 5. PubMed bilgi bankası

**Bugün:** `lib/sources.js` 47 kaynak tutuyor. Alanları künye, PMID, DOI, tür ve kişi sayısı; isteğe bağlı olarak
bulgu, süre ve sınır. Bilim kartı bunları gösteriyor. Nef'in model istemi bu bankayı görmüyor.

**Öneri: tek bilgi bankası, üç kullanıcı.**

1. **Kayıt biçimi.** `sources.js` aynen kalır, kayıtlara üç alan eklenir:
   - `claims`: her biri tek cümlelik bulgu. Kimliği, dile göre metni, yönü (olumlu, karışık ya da boş) ve hangi an
     türünde kullanılabileceği (`moments: ['rainOnWalk', 'walk']`) tutulur.
   - `checkedAt`: PubMed'de en son açıldığı tarih.
   - `strength`: var olan `DESIGN_RANK`'tan gelir.
   - Bir bulgu ancak PubMed özetinde birebir doğrulandıysa bankaya girer. Bugünkü kanıt kapısı
     (`PLAN.v1.md` A.6 "Kanıt kapısı") aynen geçerli.
2. **Telefonda kullanım (0 token).** An motoru bir an seçince o anın `moments` etiketine uyan en güçlü ve son 7 günde
   gösterilmemiş bulguyu ekler. Bulgu ya kartta ya da günde bir bildirimde bilim satırı olarak görünür.
3. **Mektupta kullanım.** Modele yalnız o haftanın anlarına uyan **en çok 2 bulgu** kimliğiyle verilir. Model bunlara
   yalnız `[[k:fincham2023.1]]` gibi atıfla değinebilir. Atıfsız bilimsel cümle, ya da bankada olmayan atıf, mektubu
   düşürür.
4. **Sohbette kullanım (ikinci sürüm).**
   - Soru telefonda anahtar sözcükle bankada aranır. Ek model ya da gömme maliyeti yok.
   - Uyan en çok 3 bulgu ≈ 600 token olarak gider.
   - Bankada cevap yoksa Nef "Bu konuda bankamda kaynak yok" der. `JEV_GOZ_KOCU.md`'deki "kanıt yok" kuralı aynen.
5. **Bankayı büyütme yöntemi** (geliştirme sırasında, kişisel veri olmadan):
   - Her yeni an türü için PubMed taranır ve özet okunur.
   - Bulgu çalışmanın kendi sözüyle ve sınırıyla yazılır.
   - Sahip onayından sonra bankaya girer.
   - Yılda bir kez bütün kayıtlar yeniden açılır; geri çekilen makale çıkarılır.
6. **Bu oturumda bankaya aday iki kaynak** (PubMed'de açıldı, onaya):
   - Schepps 2018, Sci Rep, PMID 29700376, doi:10.1038/s41598-018-25145-w. 16.741 yaşlı kadında 14 saatten uzun
     günlerde, 10 saatten kısa günlere göre %5,5 daha çok adım. Gözlemsel; F7'nin bilim kartı.
   - Vongsachang 2021, Sensors, PMID 34068938, doi:10.3390/s21103415. 240 glokomlu yaşlıda sıcaklık, yağış ve mevsim
     günlük adımla anlamlı ilişkili bulunmadı.
   - İkisi birlikte okunmalı: hava ile adım arasındaki bağ karışık. Bu yüzden F1 "yağmur adımını düşürür" demez, yalnız
     saati söyler.

---

## 6. Büyük model katmanı

### 6.1 Ne zaman çağrılır

| Çağrı | Sıklık | Rıza | Girdi (en çok) | Çıktı (en çok) |
|---|---|---|---|---|
| Haftalık mektup | Haftada 1, Pazartesi; kişi Ana sayfayı açınca | `coach` v2 | 2.000 token | 350 token |
| Aylık hikâye paragrafı | Ayda 1 | `coach` v2 | 3.000 token | 500 token |
| Sohbet (2. sürüm) | Kişi sorarsa; günde en çok 3, ayda en çok 30 (VARSAYIM) | `coach` v2 | 3.000 token | 200 token |
| Bugün kartı | **Kalkar.** An motoru yapar | — | — | — |

**Bugünkü günlük model çağrısının kalkması önerilir.** Ana sayfa "Bugün · Nef" kartı her gün modele gidiyor.
- Kural katmanı zaten aynı içgörüyü kuruyor (`fallbackInsight`).
- An motoru bundan zengin olur.
- Ağ yokken "çevrimdışı öneri" damgası da kalkar, çünkü telefon aklı her zaman çevrimiçidir.

### 6.2 Önbellek ve yedek

- Mektup haftada bir üretilir ve `gozolcum:nef-letter` içinde o hafta için saklanır. Aynı hafta yeniden çağrılmaz.
- İstemin sabit kısmı önce, değişen veri sonra yazılır; sağlayıcı önbelleği destekliyorsa ucuzlar. VARSAYIM: indirimin
  tutması sağlayıcıya bağlı; hesapta indirim sayılmadı.
- **Yedek şablon:** model cevap vermezse, rıza yoksa ya da bekçi cevabı atarsa aynı olgular bankanın mektup
  hücreleriyle yazılır. Kişi farkı yalnız üslupta görür; sayılar aynıdır.

### 6.3 Bekçi (var olanın genişlemesi)

- Var olan `FORBIDDEN` ve `STALE_ADVICE` kalıpları aynen uygulanır.
- Mektuptaki her rakam paketteki bir sayıyla eşleşmelidir; eşleşmeyen rakam mektubu düşürür.
- Bilimsel cümle yalnız bilgi bankası atfıyla yazılabilir (§5.3).
- Uzunluk ≤ 600 karakter; en çok 1 öneri cümlesi.

### 6.4 Model seçimi

Seçim 30 soruluk sınavla yapılır (`JEV_GOZ_KOCU.md`). Uydurma %0, doğruluk ≥ %90. Aday modeller:
- Bugünkü `google/gemini-3.1-flash-lite`.
- Daha ucuz `google/gemini-2.5-flash-lite`.
- Yargıç başka aileden: `anthropic/claude-haiku-4.5`.

Sınav ücretli çağrı ister, sahip onayıyla yapılır.

---

## 7. Token ve para bütçesi

**Fiyatlar (USD / 1 milyon token):**

| Model | Giriş | Çıkış | Kaynak |
|---|---|---|---|
| `google/gemini-3.1-flash-lite` | 0,25 | 1,50 | OpenRouter `/api/v1/models`, 2026-09-30 (`nef-bildirim.md` §4.1) |
| `google/gemini-2.5-flash-lite` | 0,10 | 0,40 | OpenRouter `/api/v1/models`, 2026-10-01 |
| `claude-haiku-4.5` | 1 | 5 | platform.claude.com/docs/en/about-claude/pricing, 2026-10-01 |

ElevenLabs Multilingual v2: 1.000 karakter 0,08 USD (elevenlabs.io/pricing/api, 2026-10-01).

**Kişi başı, ayda (gemini-3.1-flash-lite ile; token sayıları VARSAYIM):**

| Kalem | Çağrı | Hesap | USD |
|---|---|---|---|
| Haftalık mektup | 4,35 | (2.000 × 0,25 + 350 × 1,50) / 10⁶ = 0,00103 | 0,0045 |
| Aylık hikâye | 1 | (3.000 × 0,25 + 500 × 1,50) / 10⁶ | 0,0015 |
| Sohbet, ortalama 8 soru (VARSAYIM) | 8 | (3.000 × 0,25 + 200 × 1,50) / 10⁶ = 0,00105 | 0,0084 |
| Sohbet, sınırın tamamı | 30 | aynı | 0,0315 |
| **Bugünkü günlük kart (kalkar)** | 30 | (1.300 × 0,25 + 80 × 1,50) / 10⁶ | **−0,0134** |

| Senaryo | Kişi/ay | 1.000 kişi/ay | 10.000 kişi/ay |
|---|---|---|---|
| Bugün (günlük kart) | 0,0134 | 13 | 134 |
| Öneri, sohbetsiz (1. sürüm) | 0,0060 | 6 | 60 |
| Öneri, ortalama sohbetle (2. sürüm) | 0,0144 | 14 | 144 |
| Öneri, herkes sohbet sınırını doldurursa | 0,0375 | 38 | 375 |

- Gün başına model çağrısı: **0**. Hafta başına: **1**, sohbet hariç.
- Tek seferlik giderler:
  - Cümle bankası: dil ve sürüm başına ≈ 1 USD (`nef-bildirim.md` §4.3).
  - Yürüyüş sesleri: ≈ 66 parça × 40 karakter × 2 ses ≈ 5.300 karakter, yani ≈ 0,42 USD.
  - Model sınavı: ≈ 1 USD (VARSAYIM).
  - Hepsi sahip onayıyla yapılır.

---

## 8. Aşamalar ve "bitti" tanımı

Sıra, onaylı işlerin önüne geçmez. N1, B1b ve B2 sabah havasıyla birlikte gelir; N2, B3'ten önce ya da birlikte gelir.

**N1 · Telefon aklı (ilk sürüm)**
- İçerik:
  - `lib/nef/` iskeleti: moments, speak, memory, `bank/tr.js`, `tr.grammar.js`.
  - F1 (F3 yan cümlesiyle), F2, F4.
  - Genel an türleri ve modül sözleşme testi (§4.8): bugünkü 21 canlı modülün hepsi Nef'e bağlanır.
  - Mevcut Nef seslerinin an motoruna taşınması: eşdeğerlik 0 fark.
  - `nef-said` hafızası; `planNef` 7900–7919.
  - Bugün kartının model çağrısının kalkması.
- Bitti sayılması için:
  - Bütün yeni cümleler sahip onaylı.
  - Kartlar ve bildirim görünümleri 5 saniye kapısında 4/5: iki tema, 390 ve 320.
  - Birim testleri: sayı–ek tablosu, 21 gün kuralı, susma, gece kuralları, 74xx dokunulmazlığı.
  - Tam test takımı ve derleme yeşil.
  - Cihazda bir hafta: aynı cümle iki kez görülmedi; yağmur günü doğru saatte bildirim geldi.

**N2 · Bilgi bankası ve mektup**
- İçerik: `sources.js` `claims` alanı, F5 mektup, `coach` v2 rızası, model sınavı, yedek mektup.
- Bitti sayılması için:
  - Sınav geçti: uydurma %0, doğruluk ≥ %90.
  - Rıza metni sahip ve hukukçu onaylı.
  - 5 saniye 4/5.
  - Mektup ağsız da gösteriliyor.

**N3 · Hafızanın derinleşmesi**
- İçerik: F6 söz, F7 gün ışığı, F8 düzen, F9 aylık hikâye, F11 takvim anları.
- Bitti sayılması için: her biri için onaylı cümle, 5 saniye kapısı, cihazda bir ay sonunda tekrar sayısı 0.

**N4 · Sohbet ve yürüyüş eşliği**
- İçerik: F10'un B3'e eklenmesi, sohbet ve bankadan atıf.
- Bitti sayılması için: sohbet sınavı (30 soru, 10 tuzak) geçti, günlük sınır çalışıyor, ses = ekran.

**N5 · Başka diller**
- İçerik: sıra sahipte. Önce İngilizce bankası, ek kuralı, ses ve istem.
- Bitti sayılması için: ana dili konuşan iki okur onayı, aynı sınav ve 5 saniye kapısı o dilde.

**Süre (VARSAYIM):** N1 6–8 iş günü, N2 5–6, N3 6–8, N4 8–10. Cihaz denemeleri ayrıca.

---

## 9. 5 saniye kapısı

Üç tur yapıldı; her turda beş yeni ve bağımsız değerlendirici baktı. İki tema, 390 ve 320 genişlik. Ayrıntı
`ornekler/5sn-sonuclari.md` dosyasında. İki tur geçmeyen parçalar için 3. turda yöntem değişti: her biri üç yönle
çizildi.

| Parça | Geçen tasarım | Sonuç |
|---|---|---|
| Seni hatırlayan Nef (F2) | M2 | 5/5 ve 4/5 · **geçti** |
| Yağmur ve kişinin yürüyüş saati (F1) | M1C | 4/5 · **geçti**, 4 kişi en iyisi seçti |
| Nef'ten mektup (F5) | M4A: tek cümle + 7 günlük şerit + tek öneri | 5/5 · **geçti**, 4 kişi en iyisi seçti |
| Haftanın alanları, büyüyen Nef (§4.8) | M5C "Sırada Dikkat var" | 4/5 · **geçti** |
| Rekor kartı (§4.8 `metricBest`) | M5A | 3/5 · kaldı |
| Basamak kartı (§4.8 `ladderStep`) | M5B | 0/5 · kaldı; basamak bilgisi ayrı Nef kartı olmaz, yolun kendisinde kalır |
| Havaya göre su (F3) | M3 | 0/5 ve 1/5 · kaldı; yürüyüş cümlesine yan cümle oldu |

**Rekor kartı için karar:** iki tur kuralı nedeniyle yeniden denenmedi. Kod aşamasında yeni yöntemle ele alınacak:
gerçek veri, oyunun türü cümlede, çubuklarda değer etiketi. Kapıdan geçene kadar rekor yalnız Gelişim'de görünür, Nef
kartı olmaz.

**Çıkan ders:** etkileyen şey kişinin kendi düzeninden bir olgu. Hava, su ya da genel ilerleme kartı tek başına
etkilemiyor.

## 10. Sahibe sorular ve kararlar

**Karar (2026-10-01):** plan onaylandı. VARSAYIM: 1, 2, 3 ve 5. sorularda onay, önerdiğim seçenek için sayıldı. 4. soruda
öneri yoktu; açık kalır. N4'e kadar gerekmez, "Her Zaman" yolu onaylı plandaki gibi sürer.


1. **Bugün kartının günlük model çağrısı kalksın mı?** Öneri: evet. An motoru yerini alır; model haftalık mektuba
   geçer.
2. **Nef'in kendi bildirimi için üst sınır** günde 1, haftada 4 olsun mu? Kişinin kurduğu hatırlatmalar bu sınıra
   sayılmaz.
3. **İlk sürüm F1 + F2 + F4** mü? F3 sıcaklık, F1'in içinde yan cümle olarak gelir. Mektup (F5) rıza v2 ve
   sınavla ikinci aşamada gelir.
4. **"Evden çıktın" anı** (F10): kişi evini işaretlerse, uygulama kapalıyken ve "Her Zaman" izni olmadan yürüyüş
   sorusu gelebilir. Evin yeri telefonda saklanır. Cihazda denensin mi, yoksa onaylı "Her Zaman" yolu mu kalsın?
5. **Başka diller:** hangi dil önce gelsin? Öneri İngilizce.

---

## 11. Bilinmeyenler ve VARSAYIM listesi

- Cihazda hiçbir şey denenmedi. `UNLocationNotificationTrigger` davranışı, hava metninin uygulama açılmadan
  güncellenememesi ve kilit ekranında görünen satır sayısı denenmeli.
- 64 bekleyen bildirim sınırı Apple'ın eski belgesinde yazılı (`UILocalNotification`). Yeni belgede bulunamadı; bugünkü
  plan zaten 58 ile çalışıyor.
- VARSAYIM listesi:
  - Bildirim sınırları: günde 1, haftada 4.
  - Hafıza kuralları: 21, 7, 30 ve 14 gün; 3 yok sayma.
  - Eşikler: hissedilen 30 derece, sonra − önce ≥ 2, gün batımından 45 dk önce, yağmurdan 90 dk önce.
  - Token sayıları ve sohbet ortalaması (8 soru).
  - Önem sırası.
  - Aşama süreleri.
- Rakip taramasında "doğrulanamadı" kalanlar: WaterMinder'ın hava ayarı, Streaks'in otomatik saat yöntemi, Garmin
  özetinin yapay zekâ olup olmadığı, Nike Run Club'da yürüyüş daveti.
