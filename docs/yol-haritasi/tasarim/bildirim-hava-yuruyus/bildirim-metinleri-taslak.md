# Bildirim metinleri · yeniden yazım taslağı

Tarih: 2026-10-01. Durum: **taslak, sahip onayı bekliyor.** `app/` değişmedi, commit yok.

Çıkış noktası (sahip, 2026-10-01): "Bildirimlerin Türkçe ifadesi çok kötü. 'Gerin' ne demek yahu." Kilit ekranındaki örnek:
**Kısa mola** / "Bir saat doldu. Kalk, biraz gerin, sonra devam et." (`notifyPlan.js` `TEXTS.focus[2]`).

Okunanlar: `app/src/lib/notifyPlan.js` (`TEXTS`, `textFor`, odak molası kurulumu), `app/src/lib/restNotify.js` (7301, 7302),
`app/src/lib/alarmNative.js` (`ALARM_TITLE`, `FALLBACK_BODY`); bağlam için `eyeBudgetStore.js` (7301 göz bütçesi kilidi
bitince gelir), `components/RestLock.jsx`, `screens/Home.jsx:361` (deneme şeridi), `ios/App/App/AlarmPlugin.swift:126`
(AlarmKit başlığı). Sabah havası ve "Bana hatırlat" modül cümleleri kapsam dışı.

## Yazım kuralları (uygulanan)

- Gündelik İstanbul Türkçesi, arkadaştan kısa mesaj tonu. Emir yumuşatıldı ("şöyle bir kalk", "ne dersin", "müsaitsen"), dolambaç yok.
- Çıkarılan sözcükler: gerin, sürdürürsün, ara ver, odaklan, rehberli, tazelemek, "seni bekliyor", "uygun bir an olabilir".
  "Gerin" yerine herkesin kullandığı **"belini doğrult"**.
- Sağlık iddiası yok: eski 7301'deki "Gözlerin dinlendi" çıkarıldı. "İyi gelir", "korur", "dinlendirir" yok.
- Suçlama yok: "içtin mi / içmediysen", "hâlâ oturuyorsun" gibi sorgu ve sitem kalıpları elendi (aşağıda su 5).
- Yürüyüşte rakam yok, adım sözü yok. ("Birkaç dakika" var, rakam yok.)
- Başlık ≤ 30, gövde ≤ 90 karakter (Python `len`; en uzun başlık 25, en uzun gövde 85).
- Her türde 5 ya da 6 çift (bugünkü sayılar korundu, sıra `textFor` dönüşümüne göre). Her türde en az bir öz güven cümlesi
  (tabloda **[ÖG]**). Değişken yok, hepsi sabit metin.
- Odak molasında "devam" kalıbı bilerek azaltıldı: oturumun son molası bitiş anında geliyor (`notifyPlan.js:121`), o anda
  "sonra devam et" yanlış olur.

## Okurlar ve değerlendirme yöntemi

Her yeni metin kilit ekranında 5 saniyede okunuyormuş gibi beş okur tarafından üç soruyla tartıldı: **doğal mı, anlaşılır
mı, hoş mu.** Okur üçüne de "evet" diyorsa metne "evet" verir; sonuç x/5. 4/5'in altı yeniden yazıldı (en çok 2 tur).

| Kısaltma | Okur | Neye takılır |
|---|---|---|
| Y34 | 34 yaşında yazılımcı | Yapmacık "biz" dili, koçluk/reklam tonu, gereksiz cümle |
| Ö52 | 52 yaşında öğretmen | Yarım cümle, tuhaf söz dizimi, itici emir |
| T27 | 27 yaşında tasarımcı | Klişe, tekrar, başlık ile gövdenin aynı şeyi söylemesi |
| M41 | 41 yaşında muhasebeci | Belirsizlik: "neyi, nereye, ne zaman?" |
| S23 | 23 yaşında öğrenci | Anne/öğretmen gibi sorgulama, kitabi sözcük, ev/ofis varsayımı |

Not: Değerlendirme tek bir modelin beş okuru canlandırmasıdır, gerçek kullanıcı testi değildir.

---

## 1. `mola` · bir dakikalık "kalk, uzağa bak" molası (`TEXTS.mola`, 6 çift)

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Bir dakikalık mola** / Bir dakika yeter: kalk, uzağa bak. | **Mola vakti** / Şöyle bir kalk, pencereden uzağa bak. Bir dakikada yaparsın. **[ÖG]** | 10/60 | 5/5 | — |
| 2 | **Mola zamanı** / İstersen şimdi kalk, pencereden uzağa bak. | **Gözünü ekrandan ayır** / Kalkıp bir dakika uzağa bakalım mı? | 20/35 | 4/5 | Y34: "bakalım mı" uygulamanın ağzından "biz", yapmacık |
| 3 | **Kısa bir ara** / Kalk, biraz gerin, sonra uzağa bak. Bir dakikada yapabilirsin. | **Bir dakikalığına kalk** / Belini doğrult, pencereden dışarı bak. Sonra kaldığın yerden devam. | 21/67 | 4/5 | Ö52: "devam." fiilsiz biten cümle yazıda eksik duruyor |
| 4 | **Mola** / Başını ekrandan kaldır, uzaktaki bir noktaya bak. Sonra devam edersin. | 1. tur: **Bir dakika kendine** / Başını ekrandan kaldır, uzaktaki bir noktaya bak.<br>2. tur: **Uzağa bir bak** / Başını ekrandan kaldır, gördüğün en uzak şeye bir dakika bak. | 18/49<br>13/61 | 3/5<br>**5/5** | 1. tur: Y34 "reklam sloganı"; T27 "kendine bir dakika ayır klişesi". 2. tur: somut, ne yapılacağı belli |
| 5 | **Bir dakika senin** / Kalk, pencereye kadar yürü, uzağa bak. | **Kısa bir mola** / Dokun, bir dakikalık molayı birlikte yapalım. | 13/45 | 4/5 | T27: başlıkta ve gövdede iki kez "mola" |
| 6 | **Ara ver** / Dokun, bir dakikalık molayı birlikte yapalım. | **Kalk, biraz dolaş** / Pencereye kadar git, dışarıya şöyle bir bak, gel. | 17/49 | 4/5 | M41: "gel" ile bitince bir an duraksadı ("nereye gel?") |

## 2. `walk` · adımın az olduğu günlerde kısa yürüyüş (`TEXTS.walk`, 5 çift, rakam yok)

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Kısa yürüyüş** / Birkaç dakikalık yürüyüş? Şimdi yapabilirsin. | **Biraz yürüyelim mi?** / Birkaç dakika dolaşmaya ne dersin? Koridor bile olur. | 19/53 | 5/5 | — |
| 2 | **Biraz hareket** / Kalkıp biraz yürümek ister misin? | **Kısa bir tur** / Kalk, evin ya da ofisin içinde şöyle bir tur at. | 12/48 | 4/5 | S23: kütüphanedeyim, "ev ya da ofis" bana değil |
| 3 | **Yürüyüş molası** / Koridorda ya da dışarıda kısa bir tur atabilirsin. | 1. tur: **Hadi biraz hava al** / Çıkabiliyorsan dışarıda, olmazsa içeride birkaç dakika yürü.<br>2. tur: **Kısa bir yürüyüş** / Dışarısı da olur, koridor da. Birkaç dakika yürüyüp gel. | 18/60<br>16/56 | 3/5<br>**5/5** | 1. tur: M41 "başlık hava al diyor, gövde içeride yürü; çelişki"; Ö52 "Hadi" itiyor, koşul cümlesi 5 sn'de ağır. 2. tur: kısa, seçenek açık |
| 4 | **Kalk, biraz yürü** / İstersen şimdi birkaç dakika yürü, sonra devam et. | **Biraz yürü, gel** / Birkaç dakikalık bir yürüyüş. Sen bunu kolay yaparsın. **[ÖG]** | 15/54 | 4/5 | Y34: "sen bunu kolay yaparsın" koçluk kitabı tonu |
| 5 | **Kısa bir tur** / Su almaya ya da pencereye kadar yürüyebilirsin. | **Bir dolaşıp gel** / Su almaya git, merdiveni kullan ya da biraz dolaş. Nasıl kolayına gelirse. | 15/74 | 5/5 | — |

## 3. `breath` · bir dakikalık nefes (`TEXTS.breath`, 5 çift)

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Nefes** / 1 dakika nefes? Dokun, birlikte yapalım. | **Bir dakika nefes** / Dokun, birlikte yavaşça nefes alıp verelim. | 16/43 | 5/5 | — (Y34: rehberli egzersizde "birlikte" anlamlı) |
| 2 | **Bir dakika nefes** / İstersen şimdi yavaşça nefes al, uzun ver. | **Biraz nefeslen** / Omuzlarını gevşet, yavaşça nefes al, uzun uzun ver. Kolayca yaparsın. **[ÖG]** | 14/69 | 4/5 | Y34: nefes için "kolayca yaparsın" çocuğa konuşur gibi |
| 3 | **Nefes arası** / Bir dakikan varsa birlikte yavaş nefes alabiliriz. | **Bir dakikan var mı?** / Birlikte yavaş yavaş nefes alalım. Dokunman yeter. | 19/50 | 5/5 | — |
| 4 | **Yavaş nefes** / Omuzlarını bırak; bir dakika nefesine odaklanabilirsin. | 1. tur: **Bir soluklan** / Gözlerini kapat ya da bir noktaya bak, nefesini yavaşlat.<br>2. tur: **Yavaş bir nefes** / Gözlerini kapat, yavaşça nefes al, uzun uzun ver. Bir dakika sürer. | 12/57<br>15/67 | 3/5<br>**4/5** | 1. tur: S23 "soluklan kitabi"; M41 "nefesini yavaşlat, nasıl?". 2. tur: T27 "2 numarayla neredeyse aynı kalıp" |
| 5 | **Kısa nefes** / Dokun, bir dakikalık rehberli nefes başlasın. | **Nefes vakti** / Bir dakikalık nefes çalışması hazır. İstediğinde dokun. | 11/55 | 4/5 | S23: "nefes çalışması" ders gibi |

## 4. `water` · birkaç yudum su (`TEXTS.water`, 5 çift)

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Su** / Birkaç yudum su? | **Birkaç yudum su** / Bardağın yakındaysa şöyle bir iki yudum al. | 15/43 | 5/5 | — |
| 2 | **Bir bardak su** / İstersen şimdi birkaç yudum iç. | **Bir bardak su?** / Kendine bir bardak su koy, birkaç yudum al. | 14/43 | 5/5 | — |
| 3 | **Su molası** / Suyun yanında mı? Birkaç yudum alabilirsin. | **Suyun yanında mı?** / Değilse kalkıp bir bardak doldur, hemen halledersin. **[ÖG]** | 17/52 | 4/5 | T27: "hemen halledersin" su için fazla, gereksiz |
| 4 | **Su** / Kalkıp suyunu tazelemek ister misin? | 1. tur: **Su molası** / Birkaç yudum iç, istersen dokunup işaretle.<br>2. tur: **Su molası** / Birkaç yudum iç, sonra dokun, içtiğini not edelim. | 9/43<br>9/50 | 3/5<br>**4/5** | 1. tur: M41 "neyi işaretleyeceğim?"; Ö52 "işaretle uygulama dili". 2. tur: Y34 "not edelim, yine biz" |
| 5 | **Birkaç yudum** / Birkaç yudum iç, sonra dokunup kaydedebilirsin. | 1. tur: **Bugün su içtin mi?** / İçmediysen şimdi birkaç yudum al.<br>2. tur: **Su bardağın nerede?** / Bir bakıver, boşsa doldur, birkaç yudum al.<br>3. metin (2. yeniden yazım): **Masada su var mı?** / Yoksa kalkıp bir bardak koy, şöyle bir iki yudum al. | 18/33<br>19/43<br>17/52 | 2/5<br>3/5<br>**4/5** | 1.: S23 "annem gibi sorguluyor"; Y34 "içmediysen = suçlama"; T27 "denetleniyormuşum". 2.: M41 "başlık bilmece, bardağı mı arayayım?"; Y34 "yine sorgu". 3.: T27 "şöyle bir iki yudum, 1 numarayla aynı kalıp" |

## 5. `study` · göz çalışması, çalışma günleri (`TEXTS.study`, 5 çift)

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Göz çalışması** / Bugün çalışma günün. Hazırsan başlayabilirsin. | **Göz çalışması** / Bugün çalışma günün. Hazırsan başlayalım. | 13/41 | 5/5 | — (eski iyiydi, yalnız "başlayabilirsin" kısaldı) |
| 2 | **Çalışma zamanı** / Bugünün yolu seni bekliyor. İstersen şimdi başla. | **Bugünkü çalışma** / Birkaç dakikan varsa kaldığın yerden devam edelim. | 15/50 | 4/5 | M41: yeni gün, "kaldığım yer" neresi? |
| 3 | **Çalışma günü** / Planladığın saat geldi. Dokun, birlikte başlayalım. | **Çalışma saatin geldi** / Bu saati sen seçmiştin. Dokun, birlikte başlayalım. | 20/51 | 4/5 | S23: "sen seçmiştin" hafif sitem gibi ("sen istedin, şimdi yap") |
| 4 | **Göz çalışması** / Birkaç dakikan varsa kaldığın yerden devam edebilirsin. | **Sıra göz çalışmasında** / Kısa bir çalışma, sen bunu halledersin. Hazır olunca dokun. **[ÖG]** | 21/59 | 4/5 | Y34: koçluk tonu |
| 5 | **Çalışma günü** / Kısa bir göz çalışması için uygun bir an olabilir. | 1. tur: **Bugünün yolu hazır** / Egzersizlerin seni bekliyor. Uygunsan şimdi başla.<br>2. tur: **Bugünkü egzersizler hazır** / Müsaitsen şimdi başlayalım, değilsen sonra da olur. | 18/50<br>25/51 | 2/5<br>**5/5** | 1. tur: T27 ve Y34 "seni bekliyor çeviri klişesi"; M41 "bugünün yolu ne?". 2. tur: "müsaitsen" herkesin sözü, baskı yok |

## 6. `focus` · kişinin başlattığı çalışma oturumunda her saat başı mola (`TEXTS.focus`, 5 çift)

`textFor('focus', gün, k − 1)`: ardışık saatler ardışık metin alır. Sahibin şikâyet ettiği metin 3 numara.

| # | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 1 | **Çalışma oturumu** / Bir saat oldu. Kalk, uzağa bak; sonra devam edebilirsin. | **Bir saat oldu bile** / Şöyle bir kalk, bir dakika uzağa bak. | 18/37 | 5/5 | — |
| 2 | **Mola zamanı** / Bir saat oldu. İstersen bir dakika kalk, uzağa bak. | **Kalkma vakti** / Bir saattir çalışıyorsun. Kalk, belini doğrult, pencereden dışarı bak. | 12/70 | 4/5 | T27: başlıkta ve gövdede iki kez "kalk" |
| 3 | **Kısa mola** / Bir saat doldu. Kalk, biraz gerin, sonra devam et. | **Ekrandan bir kalk** / Bir saat geçti. Biraz dolaş, bir su iç, öyle dön. | 17/49 | 4/5 | M41: "öyle dön" an duraksattı (nereye?) |
| 4 | **Çalışma oturumu** / Dokun, bir dakikalık molayı yap; sonra kaldığın yerden sürdürürsün. | 1. tur: **Bir dakikalık mola** / Bu molayı hemen yaparsın: kalk, bir dakika uzağa bak.<br>2. tur: **Bir dakikalık mola** / Kalk, bir dakika uzağa bak. Kolay iş, yaparsın. **[ÖG]** | 18/53<br>18/47 | 3/5<br>**4/5** | 1. tur: Ö52 "söz dizimi tuhaf"; Y34 "koçluk". 2. tur: T27 "1 numarayla çok benzer gövde" |
| 5 | **Ara ver** / Bir saat geçti. Uzağa bakıp biraz yürüyebilirsin. | **Bir saatlik iş tamam** / Kısa bir mola: kalk, pencereden dışarı bak, bir su iç. | 20/54 | 4/5 | M41: "iş tamam" deyince oturum bitti sandı |

## 7. Tek metinler (sabit, dönüşüm yok)

| Kimlik | Eski | Yeni | Uz. (b/g) | Sonuç | Hayır diyen ve nedeni |
|---|---|---|---|---|---|
| 7301 mola bitti (`restNotify.js`) | **Mola bitti** / Gözlerin dinlendi, devam edebilirsin. | **Mola bitti** / Hazırsan kaldığın yerden devam edebilirsin. | 10/43 | 5/5 | — (sağlık iddiası "gözlerin dinlendi" çıktı) |
| 7302 deneme hatırlatması (`restNotify.js`) | **İlk 5 günün raporu hazır** / Neler değişti, bak. Deneme 2 gün sonra bitiyor; iptal etmezsen seçtiğin plan başlar (Ayarlar → Apple Kimliği → Abonelikler). (124 karakter, sınırı aşıyor) | **İlk 5 günün raporu hazır** / İptal etmezsen 2 gün sonra ücretli plan başlar. Ayarlar → Apple Kimliği → Abonelikler | 24/85 | 4/5 | S23: menü yolu 5 sn'de okunmuyor (anlaşılır ama uzun) |
| Alarm (`alarmNative.js` `ALARM_TITLE`, `FALLBACK_BODY`) | **Nefona · Günaydın** / Güne başlama vakti. | **Günaydın** / Kalkma vakti geldi. Yavaştan güne başlayabilirsin. | 8/50 | 5/5 | — |

7302 notu: "Neler değişti, bak" çıktı (başlık zaten raporu söylüyor); ücretlenme, süre ve iptal yolu korundu, 90 sınırına
girdi. Alarm notu: iOS bildirimin üstünde uygulama adını zaten gösteriyor, "Nefona ·" bu yüzden çıktı; sahip markayı
başlıkta istiyorsa **Nefona · Günaydın** (17) de sınır içinde.

---

## Özet sayılar

- 31 dönüşümlü çift + 3 tek metin = 34 yeni metin. Hepsi kurallara uyuyor (en uzun başlık 25, gövde 85; yürüyüşte rakam yok).
- 1. değerlendirmede 4/5'in altında kalan 7 metin: mola 4, walk 3, breath 4, water 4, water 5, study 5, focus 4.
  1. yeniden yazımda water 5 dışında hepsi geçti; water 5 ikinci yeniden yazımda 4/5'e çıktı.
- Son durumda 14 metin 5/5, 20 metin 4/5; 4/5'in altında metin yok.

## Kalan şüpheli metinler ve açık noktalar

**Metin şüpheleri (geçti ama tartışmalı):**

1. **study 3** "Bu saati sen seçmiştin." Bir okur sitem duydu. "Suçlama yok" kuralına en yakın metin. Yedek:
   **Çalışma saatin geldi** / Hazırsan dokun, birlikte başlayalım. (değerlendirilmedi)
2. **water 5** "Masada su var mı?" İki kez düştükten sonra 4/5 ile geçti; su 1 ile aynı "şöyle bir iki yudum" kalıbı.
3. **breath 4** "Yavaş bir nefes" ve **breath 2** gövdeleri benzer ("yavaşça nefes al, uzun uzun ver").
4. **focus 4** ve **focus 1** gövdeleri benzer ("kalk, bir dakika uzağa bak").
5. **focus 5** "Bir saatlik iş tamam": oturum bitti diye okunabilir. Oturumun son molasında bu tam doğru, ara saatlerde değil.
6. **"Biz" dili** (mola 2, mola 5, breath 1, breath 3, water 4, study 1–3, study 5): Y34 tipi okur yapmacık buluyor. Rehberli
   egzersizde ("birlikte nefes alalım") yerinde, su ve mola için tartışmalı. Sahip tonu seçmeli.
7. **Öz güven cümleleri** ("yaparsın", "halledersin", "kolay iş") her türde en zayıf halka: zorunlu oldukları için kaldılar,
   Y34 ve T27 tipi okur koçluk tonu buluyor. Türde birden fazla olmasın diye bilerek tek tutuldu.

**Metnin çözemediği, koda ait noktalar (kod değişmedi, yalnız not):**

8. **Odak oturumunun son molası** bitiş anında geliyor (`notifyPlan.js:121`). Odak metinlerinden yalnız **focus 3** ("öyle
   dön") devam ima ediyor; son saatte o düşerse hafif yanlış olur. Kalıcı çözüm: son mola için ayrı metin.
9. **Alarm "Günaydın"**: AlarmKit (iOS 26+) başlığı saate bakıyor (`AlarmPlugin.swift:126`: 04–11 arası "Günaydın",
   değilse "Alarm"), JS yedeği (`alarmNative.js` `ALARM_TITLE`) her saatte "Günaydın" diyor. Öğleden sonraya kurulan tek
   seferlik alarmda yanlış selam. Öneri (kod işi): aynı saat kuralı; 04–11 dışı için **Alarm** / "Kurduğun saat geldi."
10. **7302 "Apple Kimliği"**: iOS 18'den beri adı "Apple Hesabı"; Ayarlar'da yol artık "Ayarlar → [adın] → Abonelikler".
    Cihazda doğrulanmalı; değişirse `Home.jsx:361`, `Paywall.jsx:144`, `ProfileHome.jsx:254` ile birlikte değişmeli.
11. **7302 "2 gün"** sabit: 7 günlük deneme ve `TRIAL_REMIND_DAYS = 5` ile doğru; deneme süresi değişirse metin bozulur.
12. **water 4** "dokun, içtiğini not edelim" ve **study 2** "kaldığın yerden": dokununca suyun gerçekten kaydedildiği ve
    göz çalışmasında "kaldığın yer" diye bir ilerleme olduğu eski metinlerden çıkarıldı, ekranda doğrulanmadı.
