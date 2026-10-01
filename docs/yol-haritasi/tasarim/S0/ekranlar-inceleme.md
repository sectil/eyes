# S0 · ekranlar.html inceleme turu (30 Eylül 2026)

İki merceğin (plan-türkçe ve görsel) 51 bulgusu tek tek doğrulandı ve sayfaya işlendi. Önce yedek alındı:
`/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/s0-ekran/ekranlar.yedek.html`.
Sayfa aynı klasördeki üreteçten yazılır (`gen.mjs`, `lib.mjs`, `page.css`, `client.js`; eski hâlleri `yedek-kaynak/`).
`app/` altında hiçbir dosyaya dokunulmadı, git kullanılmadı.

Sonra 390 ve 320 pt telefonla, açık ve koyu temada, 1280, 400 ve 390 px pencerede ekran görüntüsü alındı
(`…/s0-ekran/tur2/`). Otomatik ölçüm: sayfada yatay kaydırma yok (390 ve 400 px), yolda 320 pt'de kırpılan öğe yok,
sayfa denetimlerinde 44 pt'den küçük öğe yok, konsol hatası yok. Bu turda görülüp düzeltilenler en altta.

Sonuç sütunu: **düzeltildi**, **kısmen** (bir bölümü yapıldı, kalanı yazıldı) ya da **gerekmedi** (bulgu doğrulanmadı).

## Plan-türkçe merceği

| # | Önem | Ekran | Doğrulama | Sonuç |
|---|---|---|---|---|
| P1 | BLOCKER | Sayfa başı | Cümlede yüklem yoktu. | Düzeltildi: "Bu sayfa, … başlıca yeni ekranlarını … telefon çerçevesinde gösterir." |
| P2 | BLOCKER | b · yol, 320 pt | Doğrulandı: `TodayPath.jsx:16` `W = 300`, `todaypath.css:11` `overflow-x: clip`. | Düzeltildi: bölüm etiketi kabın içinde başlar (`left: max(0px, calc(50% - 150px))`); baloncuk ve mola etiketi kap içinde kalır. 320 pt'de kırpılan öğe 0. Eski Y13 artık soru değil; "Ayrıntı"da "bugünkü kod hatası, Y1'de düzeltilmeli, Y1 cihaz listesine yazılmalı" notu var. Plan dosyasına bu işte dokunulmadı. |
| P3 | BLOCKER | i · Nef rızası | Doğrulandı: `lib/consent.js:64-67` satır adları Ne, Neden, Nerede, Ne kadar. | Düzeltildi i'de ve e'de; satır sonu noktaları da uygulamadaki gibi kaldırıldı. |
| P4 | SHOULD | h · haftalık 2. satır | Doğrulandı: §3.B.5 tablosu ve :635-636; görmede başlangıç en erken 22. gün. | Düzeltildi: "En düzenli alanın Göz; başlangıcın henüz oluşuyor." (50 karakter); varsayımda "v2 durumundan türetildi". |
| P5 | SHOULD | h · aylık 4. satır | Doğrulandı. 29–56. günlerde gerçekten yeni basamak var (nefeste 43. gün, gözde V2, V3, V4). | Düzeltildi: "Önümüzdeki 28 günde nefese ve göz egzersizlerine yeni basamak geliyor." (70). |
| P6 | SHOULD | h olay satırı, a soru 5 | Doğrulandı: §3.A.9'a göre 4. gün yukarı–aşağı, 5. gün uzağa bakış, 6. gün Fark Ettin mi?; tekrar kuralı §3.F.4 :1074. | Kısmen. a'ya 1–8. gün cümle tablosu eklendi, a ve h aynı tabloyu kullanıyor. Olay satırı 4 Ekim "Bugün yeni: yukarı–aşağı." oldu. İki mercek 7. gün gerekçesinde ayrıştı: "İlk haftan" kilometre taşı sayılırsa 8. günün E testi cümlesi yazılamaz. Çizimde sayılmadı (7. gün 7. öncelik); karar soru 5'te sahibe bırakıldı. |
| P7 | SHOULD | c · kanıt kartı | Doğrulandı: PMC9873947 STAR Methods, 108 kişi; 24 meditasyon, 84 nefes (30 uzun verişli). | Düzeltildi: "Uzaktan randomize çalışma · 108 kişi (uzun verişli kolda 30, meditasyonda 24) · günde 5 dk, 1 ay". Eski Y2 kapandı. |
| P8 | SHOULD | b · 4 yer | Doğrulandı: §1 :68 ve §3.A.4 :392 "başlayarak" diyor. | Düzeltildi, dört yerde de "başlayarak". |
| P9 | SHOULD | b · mola bandı | Doğrulandı: `TodayPath.jsx:264` ilk yıldız [26, 16], bugünkü kodda da etiketle çakışıyor. | Düzeltildi: çizimde yıldız etiketin altına [26, 44] alındı (öneri); açık soru Ç17 ve varsayım cümlesi eklendi. |
| P10 | SHOULD | b · 24. gün kanıt | Doğrulandı: metin `lib/breath.js:48`'de tutmasız 4 · 6 için yazılmış. | Düzeltildi: öneri metni "… Bu kanıt tutmasız kalıptan geliyor; kısa tutmalı sürüm ayrıca incelenmedi." Ç1 iki seçenekle yeniden yazıldı. |
| P11 | SHOULD | g · Nefes hapı | Doğrulandı: §3.B.6 Nefes'in ölçüsü önce → sonra, kuralı etki; §3.C.4 "Etki anlamlı" cümlesi. | Düzeltildi: hap "nefesin sonunda sakinlik puanın başındakinden yüksek"; soru 16 buna göre güncellendi. |
| P12 | SHOULD | a · dolunay | Doğrulandı. | Düzeltildi: "… öteki günlerde öbür altı evreden biri yazılır." |
| P13 | SHOULD | d · varsayım | Doğrulandı: ekranlar-ozet.md:686. | Düzeltildi: "hava yokken (yalnız ay varken) başlığın 'AY' olması". |
| P14 | SHOULD | d · telefon içi notlar | Doğrulandı. | Düzeltildi: üç hâl telefonun dışına, ayrı parçalara taşındı; telefonda yalnız uygulama metni var. |
| P15 | SHOULD | e · hava rızası | Doğrulandı: §3.E.2 :888-889 (il adı ve önbellek silinir), §2.1 satır 9 (sky-log "Tüm verileri sil" kapsamında). | Düzeltildi: "İznini geri çekersen seçtiğin il ve son hava bilgisi silinir; 90 günlük özet "Tüm verileri sil" ile silinir". Satır adları P3'teki gibi. |
| P16 | SHOULD | k · 320 pt | Doğrulandı. | Düzeltildi: 360 pt altında başlık 1,9rem (öneri). 320 görünümünde bugünkü boy (2,2rem) üçüncü telefon olarak yanında durur. 1,9rem'de iki düğme ilk ekranda görünüyor; başlık yine dört satır. |
| P17 | SHOULD | Sayfa geneli | Doğrulandı: ekranlar-ozet.md Bölüm 4. | Düzeltildi: giriş "başlıca" diyor; "Bu sayfada olmayanlar (6)" listesi eklendi; uzun aradan dönüş cümlesi a'da çizildi. |
| P18 | SHOULD | e · 9. gün sayıları | Doğrulandı: `Home.jsx:162`, `:184`, `:186` bugün kayıt varsa noktayı doldurur ve günü sayar. | Düzeltildi: "9 gün seri · 5✓ hafta · 9 gün seninle"; kural altyazıda. |
| P19 | SHOULD | Soru numaraları | Doğrulandı: "Y1" hem aşama hem soruydu. | Düzeltildi: bu çizimin soruları Ç1–Ç18 oldu; meta satırlarında "Aşama Y1" yazıyor. |
| P20 | NIT | Altyazılar | Doğrulandı. | Düzeltildi: "ilk ekran" etiket satırına alındı; "Karar 3 … ister"; "Günde en çok bir bildirim gelir"; "büyük düğmede"; "bantta"; "Açık temadaki"; "Seri en az 3 gün olduğu için" ve "Seri 3 güne ulaşınca". |
| P21 | NIT | b · "2 dk daha" | Doğrulandı. | Düzeltildi: "2 dk daha yaparsan bugün, 28 günlük nefes programında da bir gün sayılır." |
| P22 | NIT | h · haftalık ve aylık kart | Doğrulandı: `CoachCard.jsx:90` etiket yalnız kural yedeğinde. | Düzeltildi: iki kartta da "çevrimdışı değerlendirme"; Ç8 buna bağlandı. |
| P23 | NIT | c · etiketler | Doğrulandı. | Düzeltildi: kesin cümle kalktı, açık soru Ç18 oldu. |
| P24 | NIT | c · güven satırı | Doğrulandı: §1 :191-192. | Düzeltildi: varsayıma değişecek satırın örneği eklendi. |
| P25 | NIT | k · "İPHONE" | Doğrulandı: `site.css:110` `.eyebrow` büyük harf, lang="tr". | Düzeltildi: `<span lang="en">iPhone</span>` → "IPHONE İÇİN". |
| P26 | NIT | i · giriş cümlesi | Doğrulandı: healthUpdate çift tırnak kullanıyor ve ekleneni söylüyor. | Düzeltildi: eklenen alanlar yazıldı, çift tırnak; "yeni özetler gitmez" korundu. |
| P27 | NIT | d · Neden ve %14 | Doğrulandı: astronomy-engine'e göre 14 Ekim 09.10'da %12,9, 12.45'te %13,9. | Düzeltildi: 09.10 kartında %13; cümle "Hava bu kart ve 'Kaynak: Apple Weather' satırlı yağmur bildirimi dışında hiçbir yerde görünmez." |
| P28 | NIT | Neden blokları | Doğrulandı. | Düzeltildi: her bölümde tek cümlelik Neden (bölüm numarasıyla); geri kalanı açılır "Ayrıntı ve varsayımlar"da. Açık sorular görünür kaldı. |

## Görsel mercek

| # | Önem | Ekran | Doğrulama | Sonuç |
|---|---|---|---|---|
| G1 | BLOCKER | b · yol, 320 pt | P2 ile aynı. | Düzeltildi (P2). |
| G2 | SHOULD | a · "0 / 4" | Doğrulandı (görüntüde sıfır en ağır öğe). | Kısmen. İkinci telefon seçeneği çizdi ("4 durak · ≈8 dk"), soru Ç16 olarak sayfada. ekranlar-ozet.md Bölüm 3'e eklenmedi (bu işin dosyası değil). |
| G3 | SHOULD | Ay simgesi, açık tema | Doğrulandı. | Düzeltildi: `--moon-lit`, `--moon-shadow`, `--moon-line` tokenları ve çevre çizgisi. 3 kat büyütmede gölge %35'te soluk kaldı, %55'e çıkarıldı. |
| G4 | SHOULD | Büyük düğmenin üst yazısı | Doğrulandı: `home.css:193` opaklık 0,72. | Kısmen. Opaklık 1 oldu, sayfanın dipnotunda öneri olarak yazıldı. Avatar harfi "H" (3,25:1) uygulamanın kalıbı olduğu için değişmedi. |
| G5 | SHOULD | Dokunma alanları | Doğrulandı. | Düzeltildi: teklif düğmeleri, "Haftalık değerlendirmen hazır", etiket hapları, "Geri al", "Veri kaynakları", sayfanın düğmeleri ve bağlantıları en az 44 pt. Tarih satırının 44 pt'lik alanı dolunay parçasında kesik çizgiyle gösterildi. |
| G6 | SHOULD | c · beş yüz | Doğrulandı. | Düzeltildi: "Çok kötü" eğik kaşlı ve derin ağızlı, "Çok iyi" gülen gözlü ve açık ağızlı; tek renk çizgi ve 24 × 24 ızgara korundu. |
| G7 | SHOULD | f ve d · tarihler | Doğrulandı. | Düzeltildi: kilit ekranları 21 Ekim Çarşamba; f'de ilk soru önce geliyor; d'deki sayfa "soru cevaplandıktan sonra, 12.46". |
| G8 | SHOULD | e · sayılar | P18 ile aynı. | Düzeltildi (P18). |
| G9 | SHOULD | a ve h · cümle dizisi | P6 ile aynı. | Kısmen (P6). Tabloda 8. gün "Bugün haftalık E testi günü." serbest. |
| G10 | SHOULD | h · aylık 1. satır | Doğrulandı. | Düzeltildi: "Göz alanında 28, Sakinlik alanında 27 gün kaydın var." (53). 4. satırda iki merceğin önerisi farklıydı; §3.C.4 kalıbına uyan P5 biçimi seçildi. |
| G11 | SHOULD | b · 24. gün | P10 ile aynı. | Düzeltildi (P10). |
| G12 | SHOULD | j · alt yazı | Doğrulandı. | Düzeltildi: "fark etmediğin" bölünmüyor; alt yazı en az 14 px. Ç10 öneriyi soruyor. |
| G13 | SHOULD | Satır kırılmaları | Doğrulandı. | Düzeltildi: sayı ile birim, tarih, "E testi", "yol 9/10", soru eki ve saat aralıkları bölünmüyor; kısa sorularda `text-wrap: pretty`. |
| G14 | SHOULD | a · Nef alt satırı | Doğrulandı: `Home.jsx:270` "Nef · {sub}", `homeSuggest.js:26`. | Düzeltildi: günün cümlesi gösterilirken alt satır yok, durak ve süre yalnız düğmede. İlk dokunuştan sonraki satır bugünkü "Nef · 1 dk" biçiminde (e). |
| G15 | SHOULD | Uzun ekranlar | Doğrulandı. | Kısmen. 844 ve 568 pt'de turuncu kesik çizgi var ve sayfa başında anlatılıyor; rıza altyazıları "Sayfa kaydırılır" diyor. Rıza sayfaları ayrı parçalara bölünmedi. |
| G16 | SHOULD | k · masaüstü | Doğrulandı. | Düzeltildi: çizim %60'ın altına küçülmüyor, kendi kutusunda yana kayıyor; sayfa kaymıyor. |
| G17 | SHOULD | Altyazılarda § | Doğrulandı. | Düzeltildi: her telefon altyazısı ve her parça notu plan bölümüyle bitiyor. |
| G18 | SHOULD | Sayfa metni | P1, P12, P20 ile aynı. | Düzeltildi; i'deki cümle "… gitmeyenler arasında yazılır (§1)." oldu. |
| G19 | NIT | j rozeti | Doğrulandı. | Düzeltildi: harf rozetleri JetBrains Mono. |
| G20 | NIT | h · "Hafta · Ay" | Doğrulandı. | Düzeltildi: çizimdeki düğmeler span oldu; sayfada yalnız 5 denetim düğmesi var. |
| G21 | NIT | k · marka adı ve turuncu işaret | Doğrulandı. | Düzeltildi: "IPHONE İÇİN"; turuncu işaret çizimden kalktı, soru 21 maddeyi adıyla anıyor. |
| G22 | NIT | Ses, tırnak, tarih | Ses ve tırnak doğrulandı. Tarih aralığı zaten uzun çizgiydi (U+2013). | Kısmen. Rıza başlığı bugünkü rıza başlıkları gibi "Seçtiğin ilin havası görünsün mü?"; tırnaklar çift. Tarih aralığında değişiklik gerekmedi. |
| G23 | NIT | Küçük kontrastlar | Doğrulandı. | Kısmen. Harf rozeti `--ink`, bant etiketi 11 px. "başlangıcından iyi" hapı uygulamanın kalıbı olduğu için değişmedi. |

## Ekran görüntüsü turunda görülüp düzeltilenler

- Kesik çizginin "ilk ekranın sonu" etiketi içeriği örtüyordu (d'de "4.106", i'de "sunucumuz"). Etiket kaldırıldı, çizgi kaldı, anlamı sayfa başında yazıyor.
- Açık temada hilalin gölgesi soluktu; gölge %55'e çıkarıldı.
- Aylık kartta "yok." tek başına alt satıra düşüyordu; Nef satırlarına `text-wrap: pretty` eklendi.
- Kilit ekranında "14.00– / 17.00" bölünüyordu; saat aralığı artık bölünmüyor.

## Kalan açıklar

- Avatar harfi "H" 3,25:1 ve "başlangıcından iyi" hapı 4,47:1: ikisi de uygulamanın kalıbı, çizimde değişmedi.
- Yolun 320 pt hatasının Y1 cihaz listesine yazılması ve Ç16–Ç18'in ekranlar-ozet.md Bölüm 3'e eklenmesi bu işin dışında kaldı.
- 320 pt'de sitenin başlığı 1,9rem'de de dört satır; iki düğme sığıyor, ama pay az.
- Rıza sayfaları sabit boyda ve parçalı çizilmedi; ilk ekranın sonu kesik çizgiyle gösteriliyor.

## İkinci 5 saniye turu (30 Eylül 2026)

Üç bağımsız değerlendirici sayfanın ilk ekranında ve 27 ekranın çoğunda ilk 5 saniyede etkilenmedi. Önce yedek alındı
(`…/s0-ekran/yedek-tur5/`: `gen.mjs`, `lib.mjs`, `page.css`, `client.js`, `ekranlar.html` ve bu klasörün üç belgesi).
Onaylı metinler değişmedi; değişiklik düzen, vurgu, boşluk ve görsellikte. İki yazım düzeltmesi karar olarak kaydedildi
(Ç19, Ç20), madde 24 ve Ç17 genişledi, sahibin sorusundaki (19) önerim güncellendi (`sorular-kararlar.md`, D18, D23).

| Ekran | Değerlendiricinin notu | Yapılan |
|---|---|---|
| Sayfanın ilk ekranı | İç dilde başlık ekranın %40'ı; telefon %68, alt kenarı kesik; en çarpıcı görsel (gece ve iris ufku) yok | Açılış bir gece sahnesi oldu: giriş ekranının yıldızları ve iris ufku, "Nefona" ve tek cümle ("Her gün birkaç dakikalık göz ve nefes molası."), 390 × 844'te tam görünen %78'lik 1. gün telefonu; sağ üstte "1 karar bekliyor". S0, tarih ve karar kutusu sahnenin altına, küçük. Genişte üç telefon ve Pegasus |
| Bütün Ana sayfa ve yol ekranları | Sekme çubuğunun altından yazı ve düğme sızıyor | Sekme çubuğunun zemini %95 opak (öneri) |
| Koyu tema | Telefon çerçevesi zemine karışıyor | Çerçeve ve kenarı açıldı |
| 01 · 1. gün Ana sayfa | Altta iki eş kart ve boş kayıt kartı | İlk günün cümlesi iris zeminli; Nefes ve Dalga tek satırlık hap; harita kartı tek satır kadar (kayıt 3 alandan azken); yol altında başlıyor |
| 05, 06, 08, 09, 19 · sayı sütunu | "6 gün seri" ve "6 gün seninle" aynı sayı; "4✓ hafta" dört hafta, "5✓ hafta" 9. günde olanaksız gibi | "2/3 gün bu hafta", hedef tutunca "4 gün bu hafta" ve yeşil tik (Ç19); "gün seninle" seriyle aynıyken yazılmaz (24); uzun serinin hapı sütunun sağ kenarını aşmıyor |
| 05 · 7. gün | Kilometre taşı sıradan bej şerit, hizası bozuk | Altın zeminli panel, büyük düğmeyle aynı hizada; altında ilk haftanın yedi günü (altısı dolu, bugün "7" ile parlar) |
| 06 · 30. gün | Bir ayın ödülü olan iris küçük | Harita kartı büyük, iris halkalı ve parlak |
| 09 · önerim, ilk duraktan sonra | Soru yine "Yola devam et"i ilk ekrandan itiyor | Önerim güncellendi: kart ilk dokunuştan sonra büyük düğmenin hemen altında açılır; düğme ilk ekranda |
| 07 · bugünkü yer | Kartta "Uykuya Geçiş", sayfada "yoga sabah sorusu" | Sayfa metni "yoganın Uykuya Geçiş dersinden sonraki sabah sorusu" diyor |
| 02, 10 · yol | Mola bandı köşeli, kenara değmiyor, rastgele noktalar; 1. günde yol "2. BÖLÜM"e sürtünüyor; altı boş | Bant yuvarlak köşeli havuz, beş yıldız; tek duraklı bölümde etiket sağa geçer (Ç17); kilitli durak simgesi iris renginde; 1. günde yolun altında Nef tanıtım kartı başlıyor |
| 12 · nefes bitti | Beş seçim, en parlak düğme "2 dk daha", "Kaydet" bozuk gibi | Molanın iki seçeneği eşit çizgili düğme; sakinlik ölçeği yoga sorusuyla aynı kutular, çizimde "4" seçili; tek dolu düğme "Kaydet" |
| 03, 14 · beş yüz | Hazır simge seti; "Çok kötü" öfkeli; "İdare eder" iki satır | Her yüz iris tonlu diskte, beş disk ince bir ölçek çizgisinde; "Çok kötü" üzgün kaşlı; 390 pt'de etiketler tek satır; yolun şeridinde bitmiş mola noktası iris renginde |
| 15 · dokununca | Makale künyesi soğuk; cevapla bağ yok | Kartın başı "Akşam · kaydedildi"; kanıt kartında bulgu önde ve büyük, sınır altında, künye dipte küçük; simge yoldaki Nefes durağının simgesi |
| 16 · etiketler | Standart çip listesi | İki sütun, simgeler diskte |
| 17, 21 · hava kartı | Kart uzun; grafik neyi ölçüyor belli değil; iç kutular yarışıyor | Grafiğin adı "Yağış olasılığı"; bağlam cümlesi kutusuz; kart sıkı, "Bugün ölçülenler" ilk ekranda başlıyor |
| 18 · hava sorulmamış | Sayfa yarı boş, kişiye dair bir şey yok | Altında "Bugün ölçülenler" (adım, yol); "İstanbul için göster" dolu düğme |
| 20 · hava rızası | Kutu işaretli çizilmiş, önceden işaretli gibi | Kutu işaretsiz, "İzin ver" soluk; sayfa içerik kadar yükselir |
| 22 · kilit ekranı | Düz gradyan, kaba yedek yazı, saat iki kez | Durum çubuğunda saat yok; duvar kâğıdı yumuşak ışıklı; yazı Apple cihazında SF, başka yerde Onest |
| 23 · Gelişim | Barkod gibi şeritler, "değişim yok" hapı üç kez, Yoga satırı eksik | Kartın başında şeridin anahtarı (son 28 gün, kayıt var/yok); "değişim yok" sakin alt satır; Yoga "yolda · 3 dk" |
| 24 · modül ayrıntısı | Grafiğin tarih ekseni yok | "28 gün önce … bugün" ekseni |
| 25 · 6. gün | "Bu hafta 1/3 gün" iki kez; "Ölçümlerin"in altı boş | Nef kartı sayıyı söylediği için yolun altındaki satır yazılmaz (Ç20); ekran kart sekme çubuğunun üstünde bitecek biçimde kaydırıldı |
| 28, 29 · Nef rızası | Nef'in ne olduğu yok; özü söyleyen cümle yok; liste yarım satırla kesiliyor | Başta "Nef Göz Koçu" etiketi; giriş paragrafının ilk cümlesi kalın; kayan metin dipte soluyor |

**Metni onaylı olduğu için değişmeyenler** (değerlendiricilerin notu yerinde, ama metin planın ya da bugünkü kodun):
"Görmeyi iyileştirdiği gösterilmedi" (yolun dipnotu), "Değişim, kayıtlar biriktikçe görünür." (harita kartı, doğrulanmış
değişim yokken), "Kaldığın yerden devam: …" (Nef satırı), "Molanın bitmesine 2 dk var." ve "2 dk daha", yağmur
bildiriminin gövdesi (§3.E.6; Nefona'ya özgü bir cümle yok), rıza metinleri ve altyapı adları (Vercel, OpenRouter),
"çevrimdışı öneri" etiketi, "Günün nasıl geçiyor?" sayfasında havanın üstte durması (§3.D.3).

**Doğrulama.** `node gen.mjs` sayfayı yazdı; `ekranlar.html` üretecin çıktısıdır. `<title>` ve `<style>` en üstte, dış
kaynak yalnız Google Fonts, yeni renkler token. Playwright: 320, 390, 400 ve 1280 px pencerede yatay kaydırma yok; 390 ve
320 pt telefonda ekrandan taşan metin ve yolda kırpılan öğe yok; sayfa denetimlerinde 44 pt'den küçük öğe yok; konsol
hatası yok. İki temada, Hareketi Azalt açıkken bakıldı. Görüntüler `…/s0-ekran/tur5/`.
