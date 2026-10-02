# Sonsuz yol · Her modülün Gelişim'de izlenmesi ve Nef'in gidişat yorumları (tasarım, 2026-09-29)

Yol haritası maddesi: YAPILACAKLAR.md "Sonsuz yol ve ilk 5 saniye", uygulama sırası **(f) Nef haftalık/aylık**; bu belge
(f)'nin önüne bir ön koşul ekler: Nef'in "gidişat" diyebilmesi için merkezin her modülde gidişatı doğru hesaplaması
gerekir. Bu bir PLAN ve TASARIMDIR; depoda hiçbir dosya değişmedi, git yazma komutu çalıştırılmadı, ücretli çağrı
yapılmadı. Dosya:satır göndermeleri 2026-09-29 tarihli çalışma ağacına aittir (`/home/user/eyes/app/src/...`) ve
hepsi bu görevde okundu. Sağlık iddiası yok. Bilimsel dayanaklar bu görevde PubMed'den çekildi (§11); kanıtı olmayan her
eşik **VARSAYIM** diye işaretli. Bu görevde cihaz denenmedi, test çalıştırılmadı; yalnız iki küçük simülasyon koşuldu
(scratchpad `yol-v1/sim.mjs`, `yol-v1/sim2.mjs`).

**Var olan tasarımlara atıf (yeniden icat edilmedi):** Nef'in dönemleri, sinyal paketleri, istem, bekçi, rıza v2 ve
test planı `YOL.nef.md` §2–§11'de; modül merdivenleri `YOL.ilerleme.md` §5; yeni modüllerin kayıt ve metrikleri
`YOL.moduller.md` §4–§5. Bu belge yalnız üç şey ekler: (1) yoldaki her modülün bugün Gelişim'e nasıl bağlı olduğunun
envanteri, (2) "gelişim neyle ölçülür ve gürültüden nasıl ayrılır" sorusunun modül modül cevabı ile merkezde bulunan
hesap sorunları, (3) `YOL.nef.md`'nin (a) işinden sonra eskiyen ya da yanlış kalan yerleri ve Nef'in gidişat cümleleri.

---

## 0. On satırda özet

1. Bugün yolda görünebilen 10 modülün hepsi veri merkezine bağlı (düzen = alan gün sayısı), ama **ölçüyle** bağlı olan
   yalnız 6'sı: haftalık E testi, Nefes, Fark Ettin mi?, Tek Bakışta, Hızlı Bakış, Bugünün görevi. Göz egzersizleri
   (`routine`), Yılan ve Çemberler Gelişim'e yalnız "gün" olarak girer; Okuma kendi kartında durur, doğrulanmış
   değişime ve Göz alanı yayına girmez (§2).
2. Göz egzersizlerinin (sahibinin merdiveni) bugün ne basamağı ne de ölçüsü Gelişim'de var; kayıt `{type:'routine', setId}`.
3. Merkezdeki genel metrik kuralı (`progress.js:130-150` "ilk yarı / son yarı") **bütün geçmişe** bakıyor ve her
   açılışta yeniden hesaplanıyor. Kendi simülasyonumuzda gerçek değişim olmayan tek bir metrik için 26 haftada kişilerin
   **%27'si** en az bir kez "geriliyor" görüyor; aynı alanda 4 metrik varsa alan yayı **%63** kişide en az bir kez
   "geriliyor"a dönüyor (§3.1). Sonsuz yolda bu kural hem gürültüye duyarlı hem de son ayı görmüyor.
4. Öneri: göz için zaten var olan `trend.js` kuruluşunu (alışma → başlangıç ortancası → son pencere → ardışık doğrulama)
   bütün metriklere genelleyen tek bir **ölçü kuralı**; simülasyonda yanlış "geriliyor" 13 haftada %6,9'a iner, gerçek
   1 SD düşüşün yarısı 13 hafta içinde yakalanır (§4.2). Eşikler VARSAYIM; parametreler manifestte.
5. Gelişim her modül için dört katman gösterir: **Düzen** (28 günde gün), **Basamak** (yoldaki yeri; ilerleme motoru
   gelince), **Ölçü** (başlangıç → şimdi), **Değişim** (yalnız kural doğrularsa). Ölçüsü olmayan modülde üçüncü ve
   dördüncü katman boş kalır ve bu açıkça yazılır; ölçü uydurulmaz (§5).
6. Oyun ve görev puanları tekrarla artar (öğrenme etkisi; Bartels 2010, §11). Bu yüzden görev metriklerinde "iyileşiyor"
   değil "**görevdeki sonucun artıyor**" denir; Yılan ve Çemberler puanı doğrulanmış değişime hiç girmez (bugünkü karar,
   `snake/manifest.js:14`, `track/manifest.js:18`, korunur).
7. Nef hesap yapmaz, merkezin durum dizelerini söyler (`YOL.nef.md` §2, onaylanır). Günlük: Ana sayfa kartı;
   haftalık: Pazartesi; aylık: 29., 57., 85. gün (`YOL.nef.md` §5.1). Bu belge her durum için sabit cümle kalıbı verir
   (§7.3) ve olay tetikli tek satırı (yeni basamak, ilk doğrulanmış değişim) ekler.
8. `YOL.nef.md`'de düzeltilmesi gereken 7 yer var: taslak istem "Günlük test" öneriyor (bugünkü bekçi bunu atar,
   `coachCore.js:108`), 8.–21. gün tablosu eski günlük başlangıç kuralını anlatıyor, `domains[d].days7` kaynağı yanlış
   (merkez kayıt sayıyor, gün değil: `dataHub.js:81`), §8.1'deki "bugünkü açık" (a) işinde kapandı (`coach.js:87-92`),
   dosya:satır göndermeleri kaydı (§8).
9. Nef'e yalnız durum dizeleri ve düzen sayıları gider; görme ve iyi oluş sayıları gitmez (öneri, `YOL.nef.md` §13.9 ile
   aynı yönde); Apple Sağlık hiç gitmez (`consent.js:20` sözü korunur).
10. İş büyüklüğü: ölçü kuralı ve Gelişim katmanları orta (≈ 3–4 iş günü kod + test), Nef dönemleri `YOL.nef.md` §11
    sırasıyla (≈ 5–7 iş günü). Sıra ve karar soruları §9–§10.

---

## 1. Sahibinin isteği (bu belgeyi bağlayan kısım)

> "yolda kullanılan her modül gelişim tarafından takip edilir ve kişi gelişimi verilerle değerlendirilir… yolda nefes,
> E testi haftada bir, göz egzersizleri, dikkat, farkındalık, okuma, yılan oyunu ve daha birçok modül var… bu yol sonsuz
> devam eder… Nef'in gidişatla ilgili yorumları olabilir… biz üst akıl olmalıyız."

Okunuşu: (a) yoldaki **her** modül Gelişim'de görünür; (b) değerlendirme veriye dayanır, izlenime değil; (c) yol sonsuz
olduğu için değerlendirme de pencerelidir (son ay, ilk ay, bugün); (d) Nef bu değerlendirmeyi günlük, haftalık ve aylık
cümleye döker. "Üst akıl" bu belgede şu demektir: tek hesap yeri (merkez), tek gürültü kuralı, tek sözcü (Nef).

---

## 2. Bugünkü durum: yoldaki modüller Gelişim'e nasıl bağlı

### 2.1 Bugün yolda hangi modüller var

- Normal gün (haftalık test ve okuma olmayan gün): `routine` beş grup (Isınma, Uzağa bakış, Yakın–uzak, Daire, Göz
  kırpma), Çemberler, Nefes, Yılan — `lib/today.test.js:22` (`DAY`).
- Koşullu duraklar: Haftalık E testi (zamanı gelince, `weekly/manifest.js:255-262`), Okuma (haftada bir, E testinden
  ayrı gün, `reading/manifest.js:303-308`), Fark Ettin mi? ve Tek Bakışta (7 günde 3 günden azsa, `week3` döndürmesi;
  `fark-ettin/manifest.js:210-215`, `tek-bakis/manifest.js:149-155`), Hızlı Bakış (bir kez oynandıysa,
  `quick-look/manifest.js:84-91`), Bugünün görevi (bir kez yapıldıysa, `notice/manifest.js:30-33`).
- Yoldan çıkan: Kısa E testi (`daily/manifest.js:282-284`, `today()` → null; Ölçüm listesinde isteğe bağlı).

### 2.2 Bağlantı envanteri (üç düzey: D = düzen, Ö = ölçü, N = Nef)

"D" = kaydı merkeze giriyor ve alanın 28 günlük gün şeridini dolduruyor (`dataHub.js:102-120 domainDays`). "Ö" = Gelişim
bir ölçü gösteriyor ve bu ölçü alanın doğrulanmış değişimine (`dataHub.js:137-150 verifiedChange`, iris dış yayı)
giriyor. "N" = Nef'e özet gidiyor (`coach.js:67-79 moduleSignals` ya da `buildSignals` içinde).

| Modül (yol) | Alan | D | Ö: Gelişim'de ne var | Doğrulanmış değişime giriyor mu | N: Nef'e ne gidiyor | Eksik |
|---|---|---|---|---|---|---|
| Haftalık E testi `weekly` | Göz | ✔ `tests` (`dataHub.js:112`) | ✔ `eyeCard` (`progress.js:159-180`), alan ayrıntısında çizgi + kural (`ProgressOverview.jsx` alan ayrıntısı, göz kartı) | ✔ `eye.alert`/`eye.trend` (`dataHub.js:142, 148`) | ✔ `vaPhase, vaCurrent7, vaBaseline, vaDelta, vaTrend, vaAlert, weeklyDue` (`coach.js:48-56`) | yok (örnek alınacak modül) |
| Okuma `reading` | Göz | ✔ `tests` | kısmen: ayrı kart `ReadingCard` (`Progress.jsx:553, 562-626`), iki test arası kural `jevProgressLine` (`reading.js:420-433`) | ✘ (`progress.metrics` yok, `reading/manifest.js:297`) | yalnız `readingWpm` = son testin `maxReadingSpeed`'i (`coach.js:39, 54`); rahat boy (kritik yazı boyu) gitmiyor | alan kartına ve yaya girmiyor; Nef ana sonucu bilmiyor |
| Göz egzersizleri `routine` | Göz | ✔ `sessions.match` (`routine/manifest.js:31`) | ✘ — yalnız gün; `stats()` yok, kayıt `{ type, setId }` (`:39`), `describe` detay boş (`:33`) | ✘ | yalnız toplu `exercises7`, `daysSinceLastExercise` (`coach.js:46, 58`) | basamak, tekrar, süre ve konfor hiçbir yerde yok |
| Nefes `breath` | Sakinlik | ✔ | ✔ etki "sakinlik 1–5" önce→sonra (`breath/manifest.js:71`; soru `screens/Breath.jsx:316-324, 454-460`), `stats()` 7 gün dakika + değişim (`:92-100`) | ✔ `effects[].sig` | ✔ `sessions7, minutes7, calmDelta7` (`:87-91`) | dakika basamağı ve kalıp çeşidi Gelişim'de yok; hatırlatmadan açılan 1 dk nefes puansız (`Breath.jsx:69`) |
| Çemberler `track` | Dikkat | ✔ | yalnız `stats()`: rekor, isabet %, varış ms (`track/manifest.js:221-234`) — bilerek ölçü değil (`:18`) | ✘ (bilinçli) | ✔ `best, sessions7, follow7, arrive7` (`:211-220`) | oyun seviyesi ilerlemesi Gelişim'de görünmüyor |
| Yılan `snake` | Dikkat | ✔ | yalnız `stats()`: rekor, 7 gün oyun (`snake/manifest.js:152-160`) — bilerek (`:14`) | ✘ (bilinçli) | ✔ `best, sessions7, eyes7` (`:148-151`) | — (oyun; doğru karar) |
| Fark Ettin mi? `fark-ettin` | Farkındalık | ✔ | ✔ metrik "fark etme isabeti %" (`fark-ettin/manifest.js:189-194`) | ✔ `metrics[].status` | ✔ `rounds7, noticedPct7, level` (`:216-221`) | seviye değişince isabet karşılaştırılabilir değil (kural seviyeyi ayırmıyor) |
| Tek Bakışta `tek-bakis` | Dikkat | ✔ | ✔ metrik "harf" (`tek-bakis/manifest.js:128-133`) | ✔ | ✔ `span7, rounds7, first` (`:156-160`) | `span7` haftanın **en iyisi** (`Math.max`), metrik ise her tur; Nef ile Gelişim farklı şey söylüyor |
| Hızlı Bakış `quick-look` | Dikkat | ✔ | ✔ metrik "eşik ms", düşük daha iyi (`quick-look/manifest.js:63-68`) | ✔ | ✔ `first, last, sessions7, hours` (`:92-97`) | — |
| Bugünün görevi `notice` | Farkındalık | ✔ | ✔ metrik "fark edilen 0–3+" (`notice/manifest.js:15-20`) | ✔ | ✔ `days7, avgCount7` (`:34-38`) | ölçek 0–3'te tavan; görev metni her gün değişir (`notice.js` `promptFor`) |

Yolda olmayan ama Gelişim'e bağlı modüller (yol büyüdükçe girecekler): Gökyüzü molası (etki "dinlenmişlik 1–10",
`gokyuzu/manifest.js:16`, Nef'e gitmiyor), Dalga (üç etki, `dalga/manifest.js:19-23`, Nef'e gitmiyor), Yön (etki + Ayna
metriği, `yon/manifest.js:19-27`, bilerek gitmiyor), İyi oluş (WHO-5, `progress.js:36-47`, Nef'e gitmiyor), Göz kırpma
egzersizi `blink` (yalnız gün, `blink/manifest.js:9-13`), Mola/Su/Alarm (alışkanlık günlüğü, `dataHub.js:32`).
Farkındalık (`awareness`) kayıt tutmaz, giriş kapısıdır (`awareness/manifest.js:10`).

**Cevap (soru: hangisi bağlı, hangisi eksik):** düzen düzeyinde hepsi bağlı; ölçü düzeyinde **eksik** olanlar göz
egzersizleri (`routine`, `blink`) ve Okuma (merkeze ölçü olarak girmiyor); **bilerek** ölçüsüz olanlar Yılan ve
Çemberler; ölçüsü olup **Nef'e gitmeyenler** Gökyüzü, Dalga, İyi oluş, Yön.

### 2.3 Gelişim ekranı bugün neyi, nerede gösteriyor

- Üstte göz uyarısı, 5. gün raporu düğmesi, iris haritası ve 7 alan satırı (`ProgressOverview.jsx:161-194`, harita
  `:239-310`). Alan satırının değeri `tileOf` ile "en çok ölçülen metrik ya da etki" (`:143-159`); satırda 28 günlük gün
  şeridi ve durum hapı.
- Alan ayrıntısı (`DomainDetail`, `:350-…`): düzen şeridi ve kaynak modüller (`DomainRegularity`, `:313-348`),
  metrik çizgileri (ilk yarı → son yarı, %95 GA), etkiler (önce→sonra, haftalara göre seyir), yöntem metni (`:461-464`).
- Alt kısım (`Progress.jsx:673-690`): özet ve seri, takvim, gün listesi, "Pratikler" (`stats()` satırları,
  `:318-353`), hatırlatma ölçümü, görme ve okuma bölümü (`:485-556`).
- Yolun kendisi (basamak, "kaç gündür", sıradaki adım) Gelişim'de **yok**; ilerleme motoru (`lib/progression.js`)
  henüz yazılmadı (`YOL.ilerleme.md` §11).

---

## 3. Merkezde bulunan hesap sorunları (bulgu)

### 3.1 Metrik kuralı bütün geçmişe bakıyor ve her açılışta yeniden bakıyor

- `metricCards` her metriği bütün kayıtlarla çağırır (`progress.js:152-156`); `metricTrend` en az 6 ölçümde **ilk yarı
  ile son yarının** ortalamasını Welch aralığıyla karşılaştırır (`:143-149`). Pencere yoktur: 6. ayda "son yarı"
  4–6. aylardır; son ayda başlayan bir düşüş seyrelir, bir yıl önceki öğrenme dönemi hâlâ "başlangıç"tır.
- Hesap her çizimde yeniden yapılır (`ProgressOverview.jsx:163`, `:243`); yani aynı veri üzerinde her gün yeni bir
  anlamlılık testi yapılır. Tekrarlı bakış yanlış işaret olasılığını büyütür.
- **Simülasyon** (kendi, VARSAYIM: normal dağılımlı gürültü, gerçek değişim yok, haftada 3 ölçüm, 26 hafta, her
  ölçümden sonra bakış, 5000 kişi; kod `progress.js:117-150`'nin birebir kopyası, `yol-v1/sim.mjs`):
  - tek metrik: kişilerin **%27,2**'si en az bir kez "geriliyor", %26,2'si en az bir kez "iyileşiyor" görüyor;
  - alanda 2 metrik: en az bir "geriliyor" %48,0; 4 metrik: %62,8. `verifiedChange` alan yayını herhangi bir metrik
    "worse" olduğunda "down" yapar (`dataHub.js:141-147`); yani yeni metrik ekledikçe (Dikkat alanına `tepki`'nin iki
    metriği gelecek, `YOL.moduller.md` §4.4) yanlış "geriliyor" yayı artar.
  - Yalnız haftada bir bakıp "iki haftalık bakışta üst üste" şartı eklense bile tek metrikte %11,2, dört metrikte %28,9.
- Sınır: gerçek veriler normal dağılmaz, aynı gün birden çok tur olabilir, öğrenme etkisi vardır; sayılar yön gösterir,
  ürün kararı için kesin değer değildir.

### 3.2 Aynı günün turları ayrı ölçüm sayılıyor

Metrik serileri oturum başına nokta üretir (ör. `tek-bakis/manifest.js:131`, `quick-look/manifest.js:66`). Bir günde
5 tur oynayan kişinin o günü seride 5 kez sayılır; "ilk yarı / son yarı" zamanı değil tur sayısını böler. Göz kuralı
bunu "son 7 günün ortancası" ve "son 3 test" ile çözer (`trend.js` S9); diğer metriklerde karşılığı yok.

### 3.3 Öğrenme etkisi "iyileşme" olarak okunuyor

Görev puanları tekrarla artar. Bartels 2010 (§11): 36 sağlıklı yetişkinde sık tekrarlanan bilişsel testlerde ilk 3 ayda
belirgin öğrenme etkisi (Cohen d 0,36–1,19), sonra düzlük. Simülasyonda öğrenme eğrisi olan tek metrikte kişilerin
%70,8'i "iyileşiyor" görüyor (`sim.mjs`, `learn=1`). Gelişim bu durumda "iyileşiyor" hapını gösterir
(`ProgressOverview.jsx:38`). Bu sağlık iddiası değildir ama okuyan için öyle anlaşılabilir.

### 3.4 Merkezde "days7" gün değil kayıt sayıyor

`hub().domains[d].records.days7` ve `.days28` pencere içindeki **kayıt** sayısıdır (`dataHub.js:81`; testte de öyle,
`dataHub.test.js:59`). Adı gün der. `YOL.nef.md` §5.2 haftalık Nef paketindeki `domains[d].days7`'yi buradan almayı
öneriyor; bu, "5 gün çalıştın" yerine "5 kayıt"ı gün diye söyletir. Doğru kaynak `growthMap().domains[d].strip`
(gün şeridi, `dataHub.js:176-177`); 7 günlük sayı şeridin son 7 hücresidir.

### 3.5 Önce→sonra etkileri de bütün geçmişten

`domainSummary` etkileri bütün oturumlarla hesaplar (`progress.js:192`); `acuteEffects`'in `since` parametresi var ama
Gelişim onu kullanmıyor. Önce→sonra puanlarında ortalamaya dönüş payı da vardır (Barnett 2005, §11): gergin başlanan
seansta "sonra" puanı kendiliğinden ortaya yaklaşır. Kart bugün "kontrol grubu yok" diyor (`ProgressOverview.jsx`
etki kartı notu); ortalamaya dönüş yazmıyor.

### 3.6 Okuma, Göz alanının yayına girmiyor

Okuma testinin ana sonucu (rahat okunan en küçük yazı, "kritik yazı boyu") yalnız ayrı kartta ve iki test arası
cümlede kullanılıyor (`reading.js:420-433`: tek basamak fark "oynama içinde", `:414` Subramanian 2006 notu). Göz
alanının "doğrulanmış değişimi" yalnız E testinden (`dataHub.js:142, 148`). Okuma gerçekten değişse Gelişim haritası
bunu göstermez; Nef yalnız okuma hızını görür (`coach.js:54`) ve istemde okuma hızının anlamı tanımlı değildir
(`coachCore.js:67-83`'te `readingWpm` açıklaması yok).

---

## 4. Önerilen tasarım: merkezde tek "ölçü kuralı"

### 4.1 İlke

Göz için zaten doğrulanmış bir kuruluş var (`trend.js:1-42`): **alışma** (ilk ölçüm sayılmaz) → **başlangıç** (sonraki
birkaç ölçümün ortancası) → **şimdi** (son 3 ölçümün ortancası) → **değişim** yalnız ardışık ölçümler aynı yönde eşiği
geçince. Sahibin "5 sn" ya da "iyileşme hissi" isteği bu kuralı gevşetmek için gerekçe değildir: yanlış "geriliyor"
kişiyi kaçırır, yanlış "iyileşiyor" uygulamanın dürüstlüğünü bitirir. Karar: **aynı kuruluş bütün metriklere**
uygulanır; parametreleri metrik başına manifestte durur.

### 4.2 Ölçü kuralı v2 (bütün `progress.metrics` için; göz `trend.js`'te kalır)

| Adım | Kural | Parametre (varsayılan) | Dayanak |
|---|---|---|---|
| Günlük toplama | Aynı takvim gününün ölçümleri o günün **ortancası** olur (tur sayısı ağırlık değil) | — | §3.2; göz kuralındaki ortanca ile aynı |
| Alışma | İlk `familiar` gün değerlendirmeye girmez | 1 gün | Lim 2010 (göz, `trend.js:21-22`); görevlerde öğrenme daha uzun (Bartels 2010) → görev metriklerinde 2 gün (VARSAYIM) |
| Başlangıç | Alışmadan sonraki ilk `base` günün ortancası ve SD'si; bir kez oluşur, sonra değişmez (kötüleşmeyi yutmasın; `trend.js:31-33` gerekçesi) | 6 gün | VARSAYIM (simülasyon) |
| Şimdi | Son 3 ölçüm gününün ortancası | 3 | göz S9 ile aynı |
| Bakış sıklığı | Haftada bir (Pazartesi; Nef haftalık değerlendirmesiyle aynı gün) | 7 gün | tekrarlı bakışı azaltır (§3.1) |
| Değişim | Şimdi − başlangıç, iyi yönde ya da kötü yönde **c × SD_başlangıç**'tan büyükse ve bu **art arda `persist` haftalık bakışta** sürerse "better"/"worse" | c = 1,5; persist = 2 | Jacobson ve Truax 1991 güvenilir değişim fikri (ölçüm hatasına oranla değişim; §11); sayılar VARSAYIM |
| Yayımlanmış eşik | Metrik `meaningful` verirse c × SD yerine o eşik kullanılır (bugünkü sözleşme, `registry.js:42-43`) | — | ör. WHO-5 10 puan (`progress.js:20`) |
| SD tabanı | SD_başlangıç, metriğin birimine göre en küçük değerin altına inemez (tek düze başlangıçta sonsuz duyarlılık olmasın) | metrik başına (ör. harf 0,5; ms 10) | VARSAYIM |
| Pencere | "Son 28 gün" ve "ilk 28 gün" pencereleri haritayla aynı (`dataHub.js:97`); değişim durumu son pencerenin sonundaki durumdur | 28 | merkezle uyum |

Simülasyon (`yol-v1/sim2.mjs`, VARSAYIM: normal gürültü, haftada 3 ölçüm, 13 hafta boyunca değişim yok, sonra 1 SD
düşüş):

| Kural | Yanlış "geriliyor" (13 hafta, 1 metrik) | Aynı, 4 metrik (alan) | Gerçek 1 SD düşüşü sonraki 13 haftada yakalama |
|---|---|---|---|
| Bugünkü (tüm geçmiş, her ölçümde bakış) | %27,2 (26 haftada) | %62,8 | ölçülmedi (kural pencereli değil) |
| v2, c = 1,5, persist 2 | %6,9 | %20,0 | %51,8 |
| v2, c = 2, persist 2 | %2,2 | %7,5 | %30,5 |
| v2, c = 2, persist 3 | %0,5 | %1,6 | %15,8 |

Öneri: **c = 1,5, persist = 2** metrik düzeyinde (görev puanları sağlık ölçüsü değil; yanlış işaretin bedeli düşük,
duyarlılık değerli); alan yayı için ayrıca §4.3. Bu sayılar bizim simülasyonumuzdur; klinik ya da yayımlanmış doğrulama
yoktur, kanıt kartında böyle yazılır.

### 4.3 Alanın doğrulanmış değişimi (iris yayı)

- Göz uyarısı her şeyin önündedir (bugünkü sıra, `dataHub.js:142`).
- "down": alanda en az bir metrik ya da etki v2 kuralıyla "worse" **ve** o alanda "better" olan yok. İkisi birden varsa
  yay boş kalır, satırda "karışık" yazar (VARSAYIM; bugün "down" önceliklidir, `:147`, ve `dataHub.test.js:97` bunu sınar). Gerekçe: dört metrikli alanda
  tek metriğin gürültüsü alanın tamamını boyamasın (§3.1).
- "up": en az bir "better", hiç "worse" yok.
- Etkiler (önce→sonra) yay için yalnız **son 28 gündeki** oturumlarla (`acuteEffects({ since })`) ve en az 3 oturumla
  (bugünkü `ACUTE_MIN`, `progress.js:73`) sayılır.

### 4.4 Metin: "iyileşiyor" yerine ne denir

| Metrik türü | Bugün (`ProgressOverview.jsx:38-39`) | Öneri |
|---|---|---|
| Görev ve oyun (isabet, eşik, harf, tepki) | "iyileşiyor" / "geriliyor" | "görevdeki sonucun artıyor" / "görevdeki sonucun düşüyor" |
| Kendi beyanı (sakinlik, konfor, uyku sabah puanı) | aynı | "puanın artıyor" / "puanın düşüyor" |
| Göz (E testi, okuma) | "iyileşiyor" | değişmez (kural metni `trend.js`'ten) |
| Değişim yok | "doğal oynama" | "doğrulanmış bir değişim yok" (göz ve Nef ile aynı söz) |

Ek satır (görev metrikleri, kartın altında): "İlk haftalarda sonuçların alıştıkça artması olağandır; bu, görevde
alışmayı gösterir." (Bartels 2010 dayanağı; sağlık iddiası değil.)

### 4.5 Mevcut sistem nasıl bozulmaz

- `metricTrend` silinmez; `firstReport` (5. gün raporu, `progress.js:208-220`) onu kullanmaya devam eder (ilk günlerde
  zaten "too-few").
- Yeni saf fonksiyon `metricStatusV2(points, rule, now)` `progress.js`'e eklenir; `metricCards` bir bayrakla
  (`rule: 'v2'`) onu çağırır. Manifest alanı isteğe bağlı: `metrics[].rule?: { familiar, base, persist, c, sdFloor }`;
  `validateProgress` bilmediği alanı reddetmez (`registry.js:60-83`).
- **Dürüst uyarı:** bayrak açıldığında Gelişim'de bazı hapların metni ve bazı alan yaylarının rengi değişir (bugün
  "iyileşiyor" gören kişi "doğrulanmış bir değişim yok" görebilir). Bu davranış değişikliğidir; sürüm notunda tek cümle
  yazılır ("Gelişim artık son 28 güne ve art arda iki haftaya bakıyor; tek haftalık oynamayı değişim saymıyor.").
- `progress.test.js` ve `dataHub.test.js` mevcut beklentileri eski fonksiyonla aynen geçer; yeni testler v2 için
  (sabit tarih, sabit seri): alışma günü sayılmaz, aynı gün beş tur tek nokta, başlangıç donar, tek haftalık sapma
  "noise", iki hafta süren sapma "worse", SD tabanı.

---

## 5. Modül modül: gelişim neyle ölçülür, nasıl değerlendirilir

Dört katman (her modül kartı aynı iskelet; `progress.js:1-3` "şimdi, başlangıç, değişim, ölçüm hatasından büyük mü"
ilkesinin genişlemesi):
**Düzen** = son 28 günde yapılan gün (bugün var) · **Basamak** = yoldaki basamak ve D (ilerleme motoru, `YOL.ilerleme.md`
§3–§5) · **Ölçü** = başlangıç → şimdi (modülün birimi) · **Değişim** = §4 kuralı.

| Modül | Düzen | Basamak (merdiven) | Ölçü: neyle ölçülür | Başlangıç ve gürültü kuralı | Gelişim'de | Nef'e (özet) |
|---|---|---|---|---|---|---|
| Haftalık E testi | haftalık test sayısı | — (haftada bir, basamak yok) | logMAR, göz başına | `trend.js` (alışma 1. test; başlangıç 8. günden sonraki ≥ 3 testin ortancası, 7'ye büyür; sarı ≥ 0,10, kırmızı ≥ 0,20 art arda 3 test) — **değişmez** | değişmez | `vaPhase, vaTrend, vaAlert` (sayısız; §6) |
| Okuma | 28 günde test sayısı | — | **kritik yazı boyu** (logMAR), ikinci olarak okuma hızı | Yayımlanmış tekrar payı: kritik yazı boyu ±0,12 logMAR, okuma hızı ±8,6 kelime/dk (Subramanian 2006; genç, sağlıklı, klinik çizelge). Öneri: aynı gözlük koşulunda (`sameCondition`, `trend.js:83`) **art arda 2 test**te başlangıçtan ≥ 2 basamak (0,2 logMAR) fark → "better/worse"; tek test "oynama içinde" (bugünkü `jevProgressLine` dili). Manifeste `metrics: [{ key:'reading-cps', unit:'logMAR', better:'down', meaningful: 0.2, … }]` | Okuma kartı Göz alanı ayrıntısına taşınır; yaya girer | `readingStatus` dizesi (`'first'|'noise'|'better'|'worse'`); hız sayısı gitmez |
| Göz egzersizleri (`routine`, `blink`) | ✔ gün | ✔ K1–K9, V1–V4 (`YOL.ilerleme.md` §5.2); kayda `stage` alanı (aynı belgede önerildi) | **Nesnel ölçü yok.** Egzersizin "etkisini" ölçen bir test uygulamada yok ve uydurulmaz. Seçenek A (öneri): yalnız düzen + basamak + tamamlanan tekrar. Seçenek B: 14 günde bir tek soru "Bugün gözlerin ne kadar rahat? 0–10" (doğrulanmamış tek madde, VARSAYIM) önce→sonra değil **zaman serisi** olarak. Seçenek C: 28 günde bir doğrulanmış 16 maddelik bilgisayar görme sendromu anketi CVS-Q (Seguí 2015; test-tekrar ICC 0,80) — lisans ve Türkçe geçerliliği **bakılmadı** | A: "Göz egzersizleri: 22/28 gün · K7 basamağı · kırpma 10 tekrar" | `days7`, `stage` (ilerleme gelince) |
| Nefes | ✔ | ✔ N1–N6 + kalıp varyantları (`YOL.ilerleme.md` §5.1); sahibin "4-2-4-4 gibi" kalıpları kayıttaki `pattern` alanıyla zaten ayrılır (`breath/manifest.js:83`) | dakika (basamak), denenen kalıp sayısı, **sakinlik önce→sonra 1–5** (etki) | etki: son 28 gün, ≥ 3 seans, %95 GA sıfırı içermiyor (bugünkü `acuteEffects`, pencereli); karta ortalamaya dönüş notu (Barnett 2005) | "Nefes: N4 · 3 dk · 3 kalıp denedin · sakinlik seans sonunda ortalama +0,8 (son 28 gün)" | `sessions7, minutes7, calmDelta7` (var) + `stage` |
| Çemberler | ✔ | seviye (oyun içi, kayıtta `level`) | oyun: rekor, isabet %, varış ms | **doğrulanmış değişime girmez** (bilinçli, `track/manifest.js:18`); yalnız "oyundaki ilerleme": en yüksek seviye ve rekor | "Çemberler: seviye 6 · rekor 54" | var |
| Yılan | ✔ (hedefe sayılmaz, `snake/manifest.js:20`) | — (açık uçlu) | rekor, gözle oynanan tur | girmez (bilinçli) | "Yılan: rekor 38 · bu hafta 4 oyun" | var |
| Fark Ettin mi? | ✔ | seviye (`level`) | fark etme isabeti % | v2 kuralı **seviye içinde**: seviye değişince başlangıç yeniden kurulur ve kartta "yeni seviye, yeni başlangıç" yazar (farklı zorluk karşılaştırılmaz) | görev metni §4.4 | var |
| Tek Bakışta | ✔ | — | harf (tur başı) | v2; SD tabanı 0,5 harf (VARSAYIM) | görev metni | `span7` **ortanca**ya çevrilir (bugün en iyi, `tek-bakis/manifest.js:159`); Gelişim ile Nef aynı sayıyı söylesin |
| Hızlı Bakış | ✔ | program saati (`programHours`) | eşik ms (düşük daha iyi) | v2; alışma 2 gün (öğrenme etkisi büyük); SD tabanı 10 ms (VARSAYIM; WKWebView zamanlama sınırı `quicklook.js:14` notu) | görev metni | var |
| Bugünün görevi | ✔ (hedefe sayılmaz) | katman 1–3 (`YOL.moduller.md` §4.7) | fark edilen 0–3+ | ölçek tavanlı ve görev her gün değişiyor → **değişim kuralı uygulanmaz**; yalnız düzen ve katman ("katman 2'ye geçtin") | "Bugünün görevi: 18/28 gün · katman 2" | `days7, avgCount7` + katman |
| Gökyüzü molası (yola girecek) | ✔ | — (süre sabit) | dinlenmişlik 1–10 önce→sonra | etki kuralı (pencereli) | etki kartı | **yeni** `breaks7, restDelta7` (`YOL.nef.md` §4.4) |
| Yürüyüş (yeni) | ✔ | Y1, varyant (`YOL.ilerleme.md` §5.4) | yapıldı / ertelendi / adımla doğrulandı | ölçü değil düzen: "7 günde 4 yürüyüş, 3'ü adımla doğrulandı"; 2 dakikadaki adım sayısı metrik **olmaz** (tempo ölçüsü değil; telefon elde tutulur, Höchsmann 2018 sınırı `YOL.moduller.md` §4.1) | düzen satırı | `walks7, verified7, deferred7` (`steps7` gitmez: sağlık verisi) |
| Uyku (yeni) | sabah cevabı günleri | — | süre ve orta nokta düzeni (Sağlık), sabah 0–10 | `YOL.moduller.md` §4.2 (28 günde ≥ 14 gece); v2 kuralı sabah puanına | İyi oluş alanı | **gitmez** (sağlık rızası) — `YOL.moduller.md` §5'teki `sleep` Nef satırı bu belgeyle çelişir, §8 |
| Tepki (yeni) | ✔ | — | hız (1/RT) ve kaçırma | v2; iki metrik aynı alanda → §4.3 "karışık" kuralı önemli | görev metni | `n7` ve iki durum dizesi; `speed7` sayısı istenirse |
| Meditasyon, yoga (yeni) | ✔ | M1–M4 (`YOL.ilerleme.md` §5.3) | dakika, önce→sonra (sakinlik, beden, şefkat), "aklın dağılması 1–5" | etki kuralı; "aklın dağılması" v2 (kendi beyanı) | etki kartı | `YOL.moduller.md` §5 |
| İyi oluş (WHO-5) | 14 günde bir | — | 0–100 | yayımlanmış eşik 10 puan (`progress.js:20`, Eser 2019) — değişmez | değişmez | yalnız `status` ve `due` |

"Günün nasıl geçti" yeniden tasarımı (ayrı belge): akşam puanı ya da simgesi bir kayıt olarak (`sessions`, İyi oluş
alanı) yazılırsa bu tabloya "kendi beyanı" satırı olarak girer ve v2 kuralıyla değerlendirilir; Nef'e yalnız durum
dizesi gider.

### 5.1 Gelişim ekranında "Yolun" bölümü

- Yer: iris haritasının altında, alan satırlarından sonra; başlık "Yolun · 34. gün".
- Satır: modül adı · basamak ("N4 · 3 dk") · 28 günlük şerit · durum hapı (varsa). Ölçüsü olmayan modülde hap yoktur;
  "Bu modül bir şey ölçmez, düzenini sayar." cümlesi ayrıntıda bir kez yazar (sahibin "her modül takip edilir" isteği
  dürüstçe: takip = düzen + basamak; değerlendirme = ölçüsü olanlarda).
- Kaynak: ilerleme motoru (`progressionCtx`, `YOL.ilerleme.md` §11.1) + `growthMap` + v2 durumları. Yeni hesap yeri
  açılmaz; bölüm yalnız okur.
- Tasarım Artifact'i iki temada, 390 ve 320 px'te; bu belgede ekran çizilmedi.

---

## 6. Gizlilik ve güvenlik

- Kamera görüntüsü, bakış noktaları, tarih damgaları, ham seriler, WHO-5 puanı, Apple Sağlık verisi, konum ve kimlik
  Nef'e gitmez (`YOL.nef.md` §7.3; bu belge listeyi değiştirmez).
- **Yeni öneri:** v2 ile Nef'e metrik **sayısı değil durum dizesi** gider (`'first'|'noise'|'better'|'worse'|'mixed'`).
  Görme için de yalnız `vaPhase, vaTrend, vaAlert` (`YOL.nef.md` §13.9'daki öneriyle aynı; bugün `vaCurrent7, vaBaseline,
  vaDelta` de gidiyor, `coach.js:49-51`). Böylece model "iki sayıyı karşılaştırma" kuralını çiğneyemez; veri asgarileşir.
- Okuma ve göz egzersizi durumları görme ile ilgilidir → `coach` rızası v2 "Ne" satırına ayrı ayrı yazılır
  (`consent.js:56` yorumu: liste gidenle birebir olmalı; `YOL.nef.md` §7.4 taslağına "okuma testi değişim yönü" eklenir).
- Uyku ve yürüyüşte adım: sağlık rızası "Nef'e gitmez" der (`consent.js:20`); `YOL.moduller.md` §5 `sleep` ve `walk.steps7`
  satırları bu sözle çelişir → yalnız kişinin kendi düğmesiyle yazdığı alanlar (`walks7`, `deferred7`, sabah puanının
  durum dizesi) gider; Sağlık kaynaklı alanlar gitmez (karar §10.4).
- Kural tabanlı Nef rıza olmadan da konuşabilir (veri telefondan çıkmaz; `YOL.nef.md` §8.3 önerisi, bu belge destekler).

---

## 7. Nef'in gidişat yorumları

### 7.1 Ne zaman çıkar (`YOL.nef.md` §5.1 onaylanır; ekler işaretli)

| Dönem | Tetik | Nerede | Satır |
|---|---|---|---|
| Günlük | her açılış; günde bir istek | Ana sayfa "Bugün · Nef" | 1 içgörü + 1 eylem |
| Olay (**yeni**) | yeni basamak açıldı, bir metrik ilk kez "better"/"worse" oldu, 28. gün, uzun aradan dönüş; **günde en çok bir** olay satırı ve günlük içgörünün yerine geçer | Ana sayfa kartı | 1 satır, kural şablonu (model gerekmez) |
| Haftalık | Pazartesi, geçen takvim haftasında ≥ 4 gün veri | Ana sayfa (Pzt–Çar) + Gelişim başı | 3 satır: düzen · alan · sıradaki |
| Aylık | 29., 57., 85. gün… | Gelişim + Ana sayfa (3 gün) | 4 satır: düzen · doğrulanmış değişimler · görme · sıradaki 28 gün |

v2 kuralının haftalık bakışı ile haftalık Nef aynı gün (Pazartesi) çalışır: Nef'in söylediği durum, Gelişim'in o hafta
gösterdiği durumla birebir aynıdır (tek hesap, iki yüz).

### 7.2 Ne söyler, ne söylemez

Söyler: düzen sayıları (gün, dakika, seri, hedef), basamak ve sıradaki adım (yalnız `path.next`'ten), merkezin verdiği
durumlar ("doğrulanmış bir değişim yok", "görevdeki sonucun artıyor"), yeni açılan modülün **ne ölçtüğü**.
Söylemez (`YOL.nef.md` §5.6 ve §7.1 aynen, ekler işaretli): sayı uydurmaz; iki sayıdan yön çıkarmaz; başkalarıyla
karşılaştırmaz; tanı, risk, "normal" demez; "seri bozuldu, kaçırdın" demez; doktor cümlesini yazmaz, yumuşatmaz;
**(yeni)** görev ya da oyun sonucunu görme, dikkat düzeyi ya da sağlıkla ilişkilendirmez ("dikkatin arttı" yok);
**(yeni)** ölçüsü olmayan modül için "işe yarıyor" ya da "gelişiyorsun" demez, yalnız düzeni söyler.

### 7.3 Durum → cümle kalıbı (şablon ve model aynı iskelet; örnekler)

| Durum (merkezden) | Nef cümlesi (örnek) |
|---|---|
| düzen, hedef tuttu | "Geçen hafta 5 gün çalıştın; hedefin 3 gündü." |
| düzen, hedef tutmadı | "Geçen hafta 2 gün çalıştın; hedefin 3 gün." |
| basamak | "Nefes 4. basamakta: bugün 3 dakika." |
| sıradaki | "Bu hafta göz egzersizlerine Yakın–uzak ekleniyor." |
| metrik `first`/`noise` | "Hızlı Bakış'ta doğrulanmış bir değişim yok." |
| metrik `better` (görev) | "Tek Bakışta'da görevdeki sonucun iki haftadır başlangıcının üstünde." |
| metrik `worse` (görev) | "Fark Ettin mi?'de sonuçların iki haftadır başlangıcının altında; ışık ve saat farklı olabilir." |
| alan `mixed` | "Dikkat alanında sonuçlar farklı yönlerde; doğrulanmış bir değişim yok." |
| etki anlamlı | "Nefes seanslarının sonunda sakinlik puanın başındakinden yüksek (son 28 gün)." ("Nefes seni sakinleştirdi" değil) |
| ölçüsüz modül | "Göz egzersizlerini 28 günün 22'sinde yaptın." |
| okuma `better` | "Son iki okuma testinde daha küçük yazıyı rahat okudun." (tek test için değil) |
| görme `tracking`, uyarı yok | "Görmende doğrulanmış bir değişim yok." |
| görme sarı/kırmızı | Nef görme hakkında yazmaz; sabit satır kartın başında (`YOL.nef.md` §7.2) |
| ara 3–13 gün | "Beş gündür yoktun; basamağın aynı, kaldığın yerden." |
| ilk doğrulanmış değişim (olay) | "Hızlı Bakış'ta ilk kez iki hafta üst üste başlangıcının üstündesin." |

### 7.4 Hangi veri gider (öneri, v2 paketi)

Bugünkü günlük paket (`coach.js:40-63`) + `YOL.nef.md` §5.2–§5.3 dönem alanları, şu düzeltmelerle: `domains[d].days7`
gün şeridinden (§3.4); `metrics[]` `{ key, status }` v2 durumuyla; `reading.status`; `modules[id].stage`; görme sayıları
çıkar (§6). Boyut sınırı 4000 bayt (`coachCore.js:5`) aynen; en dolu paket testte ölçülür (`YOL.nef.md` T9).

### 7.5 Nef'in "gidişat" dediği şeyin sınırı

Kanıt: kendini izleme (self-monitoring), sağlıklı beslenme ve hareket müdahalelerinde etki farkını en çok açıklayan
tekniktir; hedef ve geri bildirim gibi bir başka teknikle birlikte daha etkilidir (Michie 2009, 122 değerlendirme; etki
0,42'ye karşı 0,26; heterojenlik yüksek, I² %69). Bu, Gelişim ve Nef'in **tasarım** gerekçesidir; kullanıcıya "takip
etmek seni iyileştirir" diye söylenmez. Göz egzersizlerinde etkiler bırakınca 1–2 haftada kayboluyor (Wolffsohn 2025,
Talens-Estarelles 2022; `YOL.ilerleme.md` §8 ve §12'de doğrulandı): Nef'in birincil konusu bu yüzden **düzen**dir.

---

## 8. `YOL.nef.md` ve kardeş belgelerde düzeltilecek yerler

| # | Yer | Sorun | Düzeltme |
|---|---|---|---|
| 1 | `YOL.nef.md` §9.1 (satır 488, 498), §6.3 madde 1 (339), §7.2 kırmızı satırı (377) | taslak istem ve şablon "Günlük test" öneriyor; bugünkü bekçi `STALE_ADVICE` (`coachCore.js:108`) bu cevabı atar, istemci de (`coach.js:146`) | eylem "Haftalık test" (yalnız `weeklyDue`), uyarıda eylem yok ya da "Işığı ve mesafeyi kontrol et" (ekrandaki cümle) |
| 2 | `YOL.nef.md` §5.5 (satır 283–290) | 1. gün "ilk ölçüm başlangıç noktan olacak" ve 8.–21. günde "≥ 7 test" kuralı; (a) işinden sonra haftalık yol: ilk test alışma, başlangıç en erken 22. gün (`trend.js:18-42`, `coach.js:100`) | tabloyu haftalık kurala göre yeniden yaz |
| 3 | `YOL.nef.md` §5.2 `domains[d].days7` | merkez kayıt sayıyor (`dataHub.js:81`) | `growthMap` şeridinden gün |
| 4 | `YOL.nef.md` §8.1 | "kırmızıda yumuşak cümle" açığı kapandı (`coach.js:87-92`) | "kapandı (2026-09-29, (a) işi)" notu; T13 yine yazılır |
| 5 | `YOL.nef.md` §1 dosya:satır | kaydı: `buildSignals` artık `coach.js:27-64`, `fallbackInsight` `:86-106`, `SYSTEM_PROMPT` `coachCore.js:67-83`, `FORBIDDEN` `:90-99`, `parseCoachReply` `:112-127`, `sanitizeModules` `:41-55` | güncelle |
| 6 | `YOL.moduller.md` §5 `sleep` ve `walk.steps7` | Sağlık kaynaklı alanlar Nef'e öneriliyor; `consent.js:20` ve `YOL.nef.md` §7.3 "gitmez" diyor | Sağlık kaynaklı alanlar çıkar (§6) |
| 7 | `YOL.moduller.md` ↔ `YOL.ilerleme.md` | aynı yeni modüle iki ad ve iki sözleşme: `walk`/`grow` ile `yuruyus`/`progression`; meditasyon açılışı 2. gün ile D_toplam ≥ 14; kayıt alanı `before/after` ile `calmBefore/calmAfter` (YAPILACAKLAR "4 tutarlılık engeli") | Gelişim açısından tek şart: etki `pick` alanları ve metrik `key`'leri tek sözleşmede sabitlensin; öneri `progression` (ilerleme belgesi) + `walk` (kısa id), meditasyon kaydı `before/after` (Dalga kalıbı) |

---

## 9. Uygulanabilirlik, iş büyüklüğü ve sıra

Her adım: tasarım Artifact'i → sahibin onayı → kod → iki temada her durum → bağımsız inceleme → TestFlight → cihaz.

| Adım | İş | Dosyalar | Büyüklük | Bozmama gerekçesi |
|---|---|---|---|---|
| 1 | Ölçü kuralı v2 (`metricStatusV2`, günlük ortanca, pencere, haftalık bakış, persist) + testler | `lib/progress.js`, `lib/progress.test.js` | orta (1,5–2 gün) | yeni fonksiyon; eski `metricTrend` ve 5. gün raporu aynı |
| 2 | Alan yayı: "mixed", etkiler son 28 gün | `lib/dataHub.js verifiedChange`, `dataHub.test.js` | küçük (0,5 gün) | `verifiedChange` imzası aynı; ama `dataHub.test.js:97` bugün "better + worse → down" bekliyor: bu beklenti **bilinçli olarak** "null (karışık)" olur (davranış değişikliği; karar §10.6). Göz uyarısının önceliği (`:99`) ve tek yönlü satırlar (`:96, :98, :100`) aynen geçer |
| 3 | Okuma metriği (`reading-cps`, `meaningful: 0.2`, art arda 2 test) + Göz ayrıntısına taşıma | `modules/reading/manifest.js`, `registry.test.js metSample`, `ProgressOverview.jsx` | küçük–orta (1 gün) | `progress.metrics` isteğe bağlı; `ReadingCard` kalır |
| 4 | Metin: §4.4 hapları, görev notu, ortalamaya dönüş notu | `ProgressOverview.jsx:36-48` ve kartlar | küçük | metin |
| 5 | Nef paketinde durum dizeleri, `span7` ortanca, görme sayılarının çıkması | `lib/coach.js`, `coachCore.js SCHEMA`, `tek-bakis/manifest.js`, `coachStats.test.js` | küçük (0,5 gün) | `coachStats.test.js:19-30` tek-bakis beklentisi bilinçli güncellenir |
| 6 | "Yolun" bölümü | `Progress.jsx`/`ProgressOverview.jsx` | orta (1 gün) | ilerleme motoru (`YOL.ilerleme.md` (c) adımı) gelmeden basamak sütunu boş |
| 7 | Nef haftalık/aylık + olay satırı | `YOL.nef.md` §11 sırası | büyük (5–7 gün) | orada yazılı |

Bağımlılık: 1–5 ilerleme motorundan bağımsızdır ve (c)'den önce yapılabilir; 6 ve 7'nin basamak kısmı (c)'yi bekler.
Maliyet: Nef istek sayısı `YOL.nef.md` §5.1 hesabı (~35/ay/kişi); olay satırı model çağırmaz.

---

## 10. Sahibinin kararını bekleyen sorular

1. Ölçü kuralı v2 (c = 1,5, art arda 2 haftalık bakış, günlük ortanca, 28 gün pencere) kabul mü? Sonuç: Gelişim bazı
   "iyileşiyor/geriliyor" haplarını "doğrulanmış bir değişim yok"a çevirir (sürüm notuyla).
2. Görev ve oyun metriklerinde "iyileşiyor" yerine "görevdeki sonucun artıyor" metni kabul mü?
3. Göz egzersizleri için hangi seçenek: A (yalnız düzen + basamak; önerim), B (14 günde bir tek soruluk konfor,
   doğrulanmamış), C (28 günde bir CVS-Q; lisans ve Türkçe geçerlilik araştırılacak)?
4. Uyku ve yürüyüşün Sağlık kaynaklı alanları Nef'e gitmesin (önerim; `consent.js:20` sözü) — onay.
5. Okuma testi Göz alanının yayına girsin mi (öneri: evet, art arda 2 testte ≥ 0,2 logMAR)?
6. Alan yayında "karışık" hali (bir metrik yukarı, bir metrik aşağı → yay yok) kabul mü?
7. Olay tetikli Nef satırı günde en çok bir kez ve günlük içgörünün yerine — onay.
8. Görme sayıları (`vaCurrent7`, `vaBaseline`, `vaDelta`) Nef'e gitmesin (`YOL.nef.md` §13.9 ile aynı) — onay.

---

## 11. Kaynaklar (bu görevde PubMed'den doğrulandı, 2026-09-29)

PubMed'den alınan bilgiye göre (`get_article_metadata`):

| Künye | PMID | DOI | Bulgu ve sınır | Bu belgede |
|---|---|---|---|---|
| Jacobson NS, Truax P. J Consult Clin Psychol 1991;59(1):12-9 | 2002127 | [10.1037//0022-006x.59.1.12](https://doi.org/10.1037//0022-006x.59.1.12) | Kişi düzeyinde değişimin ölçüm güvenilirliğine göre "güvenilir" sayılması için güvenilir değişim indeksi önerir. Psikoterapi araştırması; bizim c × SD eşiğimiz bu fikrin basitleştirilmiş, doğrulanmamış uyarlamasıdır | §4.2 |
| Bartels C ve ark. BMC Neurosci 2010;11:118 | 20846444 | [10.1186/1471-2202-11-118](https://doi.org/10.1186/1471-2202-11-118) | 36 sağlıklı yetişkin, 1 yılda 7 oturum: sık tekrarda ilk 3 ayda belirgin öğrenme etkisi (d 0,36–1,19), sonra düzlük. Yüksek IQ'lu küçük örneklem; bizim görevlerimiz test edilmedi | §3.3, §4.2, §4.4 |
| Michie S ve ark. Health Psychol 2009;28(6):690-701 | 19916637 | [10.1037/a0016136](https://doi.org/10.1037/a0016136) | 122 değerlendirme, 44.747 kişi; ortak etki 0,31; kendini izleme heterojenliğin en büyük kısmını açıklıyor; başka bir kontrol teorisi tekniğiyle birlikte 0,42'ye karşı 0,26. Beslenme ve hareket; heterojenlik yüksek | §7.5 (tasarım gerekçesi, kullanıcıya iddia değil) |
| Barnett AG ve ark. Int J Epidemiol 2005;34(1):215-20 | 15333621 | [10.1093/ije/dyh299](https://doi.org/10.1093/ije/dyh299) | Ortalamaya dönüş, tekrarlı ölçümde doğal oynamayı gerçek değişim gibi gösterir; ölçüm hatası büyüdükçe artar | §3.5, §5 Nefes |
| Subramanian A, Pardhan S. Optom Vis Sci 2006;83(8):572-6 | 16909082 | [10.1097/01.opx.0000232225.00311.53](https://doi.org/10.1097/01.opx.0000232225.00311.53) | MNREAD tekrar katsayısı: okuma keskinliği ±0,05, kritik yazı boyu ±0,12 logMAR, okuma hızı ±8,6 kelime/dk; 30 genç sağlıklı yetişkin, klinik çizelge (telefon değil) | §3.6, §5 Okuma (`reading.js:414`'teki atıf doğrulandı) |
| Seguí MM ve ark. J Clin Epidemiol 2015;68(6):662-73 | 25744132 | [10.1016/j.jclinepi.2015.01.015](https://doi.org/10.1016/j.jclinepi.2015.01.015) | 16 maddelik CVS-Q; Rasch uyumu, duyarlılık ve özgüllük > %70, test-tekrar ICC 0,80. İşyerinde bilgisayar kullananlar, İspanyolca; Türkçe sürüm ve lisans bu görevde **bakılmadı** | §5 Göz egzersizleri seçenek C |

Önceki belgelerde doğrulanan ve burada yalnız atıf yapılanlar (PMID): Lim 2010 (19557025), Faes 2021 (33414531),
Rosser 2003 (12882770), Eser 2019 (32800004), Wolffsohn 2025 (40467388), Talens-Estarelles 2022 (35963776),
Höchsmann 2018 (29460319).

**VARSAYIM listesi:** ölçü kuralı parametreleri (alışma 1–2 gün, başlangıç 6 gün, son 3, c = 1,5, persist 2, SD
tabanları); haftalık bakış günü Pazartesi; "karışık" alan hali; okumada art arda 2 test; olay satırının günde bir
sınırı; göz konforu tek sorusu (seçenek B). Simülasyon sonuçları yalnız normal dağılımlı yapay veriyle üretildi;
gerçek kullanıcı verisiyle yeniden koşulmalı (telefon dışına veri çıkarmadan, geliştirici cihazında dışa aktarımla).
