# Ana sayfa yeniden tasarımı · özet (tasarımcılar ve değerlendiriciler için girdi)

Tarih: 30 Eylül 2026. Bu belge kod değiştirmez; üç tasarım yönünün ve beş değerlendiricinin ortak girdisidir.

**Sahip kararı** (`SAHIP_ISTEKLERI.md`, 2026-09-30): ana sayfa şimdi yeniden tasarlanır, TestFlight beklemez. Yöntem: üç ayrı
tasarım yönü, beş bağımsız değerlendirici. Kapı: işin yalnız ilk 5 saniyede görünen kısmı (telefonda ilk ekran) gösterilir;
"Ne anladın? Etkilendin mi? Neden?"; çoğunluk "etkilendim" demezse iş gönderilmez. Sahibin sözü: "ilk 4 saniyede
etkilemek gerekiyor", "kullanıcılar devamlı olması lazım", "5 saniyede insanları nasıl şaşırtırız".

**Kaynaklar.** `Y1_5SN_SONUCLARI.md` ve Y1 iş akışının üç turunun bütün notları (wf_83f6f514-cf3); `S0/5sn-sonuclari.md`
ve S0 iş akışının üç turunun notları (wf_bb871f5b-a11); `Y3_NOTLAR.md` ve yoga 5 saniye iş akışının Pratikler notları
(wf_7bb59cec-53b); `SONSUZ_YOL.PLAN.v1.md` §1, §2.2, §3.A, §3.F (tamamı okundu); `S0/sorular-kararlar.md`;
`S0/ekranlar-ozet.md` (a) ve (b); kod: `screens/Home.jsx`, `components/TodayPath.jsx`, `DayChain.jsx`, `CoachCard.jsx`,
`HomeMap.jsx`, `lib/homeSuggest.js`, `lib/today.js`, `lib/progression.js`, `App.jsx` (yalnız okundu). Bugünkü hâlin
görüntüleri: `…/scratchpad/ana-5sn/shots-once/` (INDEX.md: her ilk görünümün metin dökümü, en büyük düğmesi, piksel
denetimi).

---

## (a) Önceki değerlendirici notları

**Kapsam.** Ana sayfayı gösteren her ekranın her notu: **148 not**; "etkilendim" 28 (%19).
- Y1, üç tur (gerçek uygulama, düzenekten): 1. gün, 2. gün, 9. gün, eski kullanıcı; 36 not, 3 "etkilendim".
- S0, üç tur (çizim sayfası): ana sayfa ilk ekranı (1., 7., 30. gün), bugünün yolu (1. ve 7. gün), 16 Ekim sabahı
  (yoga sorusu), 9. gün hava teklifi, 6. gün Nef kartı, akşam "Günün nasıl geçti?" kartı, sayfanın vitrin telefonu;
  103 not, 25 "etkilendim". (Sayfanın kendi başlığı ve karar kutusu hakkındaki 6 not sayıldı, konu ana sayfa olmadığı için
  temalara kodlanmadı.)
- Yoga 5 saniye, üç tur: Ana sayfanın Pratikler bölümü; 9 not, 0 "etkilendim".

Sayım yöntemi: her notun "neden" ve "en zayıf yer" metni elle okundu; bir not birden çok şikâyete girebilir; aynı şikâyet
aynı notta bir kez sayılır. Çalışma dosyaları: `ana-maket/_calisma/notlar.json` (148 not), `elle.py` (not → tema),
`temalar.json` (sayım).

### Senaryo senaryo

**1. gün** (25 not, 7 "etkilendim"; Y1 1-gun1, S0 1. gün ilk ekranı ve 1. gün yolu. Ayrıca S0 sayfasının vitrin telefonu
(1. gün Ana sayfası) üzerine 10 not, 4 "etkilendim"; 6'sı yalnız sayfanın kendi başlığı hakkında)
- Beğenilen: tek, büyük, kontrastlı düğme ("ne yapacağım belli"); koyu tema şık; "İlk Bakış'ta 20 saniyede 3 kez
  kırptın" cümlesi "bana ait bir veriyle açılıyor", "merak uyandırıyor" (S0); düz Türkçe alt satır "3 bölüm · sağ, sol,
  iki göz"; yalnız 4 durak olduğu için sade.
- Şikâyetler (birleşik): ilk iş bir sınav ("Haftalık E testi · 5 dk"; ilk gün "haftalık" anlamsız, "E testi" bilinmiyor,
  hoş geldin ya da neden yok); aynı E testi hem kartta hem yolda (2. turda Nef cümlesi, düğme ve baloncukla üç kez); en büyük görsel (diyafram) bir şey
  söylemiyor, deklanşör sanılıyor; "1 / 7 alanda kaydın var · Değişim, kayıtlar biriktikçe görünür" kartı anlaşılmıyor;
  süreler birbirini tutmuyor (düğmede 5 dk, üstte ≈8 dk, yolda ≈1 dk göz; "Nefes · 5 dk mola" 8 dakikanın içinde mi);
  sekme çubuğunun altından "Mola · 1 dk" sızıyor; yolun gri hilali leke ya da çizim hatası gibi; "Görmeyi iyileştirdiği
  gösterilmedi" ilk gün hevesi kırıyor; "20 saniyede 3 kez" bağlamsız (az mı, çok mu?); "sıradan sağlık panosu".

**2. gün** (9 not, 0 "etkilendim"; Y1 2-gun2)
- Beğenilen: 1 dakikalık ilk adım başlamayı kolaylaştırıyor; "Yeni" rozeti hoş.
- Şikâyetler: "Bu hafta 1/3 gün" ile "1 gün seninle" aynı şeyi iki belirsiz biçimde söylüyor ("neyin 3'ü?", "çeviri
  gibi"); "Sağ–sol" neyin sağı solu, açıklama yok; 7 minik gri ikon (günün zinciri) şifre gibi; 8 → 11 dk, 4 → 7 durak
  sıçraması açıklanmıyor, "yük artmış"; dünkü ekranın aynısı, "seri başladı" duygusu yok; aynı çağrı üç yerde.

**6.–9. gün** (41 not, 7 "etkilendim"; Y1 3-gun9, S0 6., 7., 9. gün)
- Beğenilen: turuncu "8 gün seri" çipi ("kaybetmek istemeyeceğim bir şey"); "Uzağa bakış" gibi herkesin anladığı adlar;
  yolun tamamlanan kısmı (mavi çizgi, onaylar); 7. gün "ilk haftanı tamamlıyorsun" kartı sıcak.
- Şikâyetler: hafta ve seri sayıları çelişiyor ("6 gün seri" ile "2/3 gün bu hafta"; "5✓ hafta" imkânsız bir sayı
  gibi; "Bu hafta 1/3 gün çalıştın" her gün açan birine azar gibi; aynı sayı iki kez); 10 ikonluk şerit sıkışık ve
  etiketsiz; en büyük yazı "≈15 dk" ya da "0/10", emek küçük satırda ("hiyerarşi ters", "beni cezalandırıyor gibi");
  ilk haftanın bitişi kutlamaya dönüşmüyor; her gün aynı şablon; 9. gün hava teklifi asıl işin önüne geçiyor; Nef kim,
  "çevrimdışı öneri" ve üstü çizili Wi-Fi hata gibi.

**15.–30. gün** (30 not, 5 "etkilendim"; S0 30. gün, 16 Ekim sabahı yoga sorusu)
- Beğenilen: "29 gün seri" vurgusu, "Dün yolunun bütün duraklarını tamamladın" gururlandırıyor; renklenen iris ilerleme
  hissi veriyor; anketsiz sabah ekranı "sakin, tek düğme".
- Şikâyetler: bir ay sonra ekran 7. günle aynı; bir aylık emek görünmüyor, 30. günde hâlâ "Değişim, kayıtlar biriktikçe
  görünür"; "4✓ hafta" dört hafta gibi okunuyor; sabah ilk açılışta anket "Güne başla"yı ilk ekrandan itiyor (üç turda
  bütün değerlendiriciler); "Kaldığın yerden devam: X" ile düğme aynı şeyi söylüyor; "≈17 dk kaldı" görev gibi;
  "Dün tamamladın" küçük düz yazı, ödülü yok.

**Eski kullanıcı, güncelleme günü** (9 not, 0 "etkilendim"; Y1 4-eski-guncelleme)
- Şikâyetler: 9. günün aynısı; güncelleme ya da yenilik işareti yok; "tekrar hoş geldin" yok; "68 gün seninle" soğuk bir
  sayaç; "Bu hafta 1/3 gün" azar gibi; seri sessizce kaybolmuş; en büyük yazı "≈17 dk", 10 durak, kısa dönüş yolu yok
  ("kopmuş birini en uzun güne atmak"); (Y1 1. tur) renkli iris yayları alarm gibi, "4/7" ile "İyileşiyor" çelişiyor.

**Akşam** (15 not, 5 "etkilendim"; S0 8. gün 20.30 ve akşam vitrin)
- Beğenilen: tek soru, adı yazılı büyük yüzler; "Cevabın yalnız bu telefonda kalır" güven veriyor; "Sonra" nazik.
- Şikâyetler: beş surat her ruh hâli uygulamasında var, Nefona'ya özgü değil; "Çok kötü" öfkeli yüz; günün sayıları
  (adım, dakika, "yol 9/10") küçük gri satırda, "yol 9/10" anlaşılmıyor; sekme çubuğundan "Uzağa bakış · tamam" sızıyor.
  (Bu kart Y4 tasarımıdır; bugünkü kodda akşam kartı üç soruluk eski karttır.)

**Pratikler** (9 not, 0 "etkilendim"; ana sayfanın aşağısı, her gün)
- Şikâyetler: her birinde "Başla" yazan, eşit ağırlıkta 12 kutu; seçim felci; adlar (Yılan, Dalga, Yön, Fark Ettin mi?)
  ne yaptıklarını, kutular süreyi söylemiyor; yoga bir oyunun yanında kayboluyor; üstteki "henüz ölçüm yok" kartları
  "burada bir şey yok" dedirtiyor; sekme çubuğunun altından "Derin set" sızıyor.

### En sık 10 şikâyet (148 not)

| # | Şikâyet (birleşik) | Not | Kaynak (Y1 / S0 / yoga) | Bugünkü ilk görünümde (`shots-once`) |
|---|---|---|---|---|
| 1 | Her gün aynı ekran, bildik sağlık ya da alışkanlık panosu (Duolingo, wellness şablonu); yenilik, ilerleme ya da şaşırtan an yok | 43 | 12 / 28 / 3 | Sürüyor: 9. gün, 30. gün ve eski kullanıcı aynı iskelet; yalnız çipler değişiyor |
| 2 | Hafta ve seri sayıları anlaşılmıyor ya da çelişiyor ("Bu hafta 1/3 gün", "2/3 hafta ●●○", "4✓ hafta"; "N gün seri" ile "N gün seninle"); hafta satırı azar gibi | 42 | 14 / 28 / 0 | Kısmen: aynı sayının iki kez yazılması kalktı (karar 24); "Bu hafta 1/3 gün" + "1 gün seninle" (2. gün), "Bu hafta 1/3 gün" + "68 gün seninle" (eski), "8 gün seri" + "Bu hafta 2/3 gün" (9. gün) duruyor |
| 3 | Sekme çubuğunun altından yazı sızıyor; ekran kirli, bozuk, bitmemiş görünüyor | 35 | 8 / 19 / 8 | Azaldı (çubuk %95 opak); yolun durak yazıları çubuğun üst kenarında kesik duruyor (1. gün "Nefes · 1 dk", 2. gün "Mola · Yeni · Nefes · 2 dk") |
| 4 | Adlar ve terimler açıklamasız: Nef kim, "Sağ–sol" neyin sağı, "E testi", "haftalık", Dalga, Yılan, Yön, "alan", "durak", "yol 9/10" | 31 | 5 / 19 / 7 | Sürüyor: "Sağ–sol · 1 dk" açıklamasız; "Nef · İstersen Dalga ile gevşe"; "Dalga · sakinleş" |
| 5 | Asıl iş ilk ekranda zayıf ya da yok: anket, hava teklifi ya da üst kart "Güne başla"yı itiyor ya da onunla yarışıyor; yoldaki "Başla" en soluk öğe | 29 | 4 / 25 / 0 | Bu senaryolarda düzeldi: büyük düğme ilk görünümün üst yarısında (390'da y ≈ 234–405 pt arası); iPhone'da yoga sabah kartı üstte kalır (sahip kararı bekliyor) |
| 6 | "N / 7 alanda kaydın var · Değişim, kayıtlar biriktikçe görünür" / "İyi oluş: 5 soru" kartı anlaşılmıyor, en değerli yeri kaplıyor | 26 | 11 / 15 / 0 | İlk görünümden çıktı (Gelişim haritası yolun altında) |
| 7 | "Bugünün yolu" bitmemiş ya da dağınık: gri hilal leke gibi, mola bandı köşeli ve noktaları rastgele, kilitli duraklar soluk gri, boş maskot dairesi, çakışan çizimler | 18 | 4 / 14 / 0 | Sürüyor: gri hilal ve yolun ilk durakları 390'da ilk görünümün alt yarısında |
| 8 | Ekranın en büyük görseli bir şey söylemiyor: gri diyafram ya da "çark" (deklanşör sanılıyor), iris halkası, renkli yaylar (kırmızı ve turuncu endişe veriyor) | 17 | 12 / 5 / 0 | Ana sayfanın diyaframı kalktı; yolun ilk durağının diyafram çizimi (Isınma, Sağ–sol) ilk görünümde |
| 9 | Süre yük gibi: en büyük yazı dakika (≈15, ≈17 dk); 8 → 11 → 15 dk sıçrama açıklanmıyor; "ödev", "ikinci bir iş" | 17 | 12 / 5 / 0 | Sürüyor: en büyük yazı "≈15 dk" (9. ve 30. gün), "≈17 dk" (eski) |
| 10 | Aynı çağrı ya da bilgi birkaç kez: Nef cümlesi + büyük düğme + baloncuk + "Başla"; E testi kartta ve yolda; "Kaldığın yerden devam" = düğme; "Bu hafta 1/3 gün" iki kez | 16 | 7 / 9 / 0 | Kısmen: Nef satırı ve baloncuk düğmeyi tekrar etmiyor; ama ilk iş hâlâ zincirde, düğmede ve yolun ilk durağında (1. gün E testi, 9. gün Isınma) |

Ardından gelenler: emek ve başarı görünmüyor, hiyerarşi ters (15 not; sürüyor: "8 gün seri" küçük çip, en büyük yazı
dakika); küçük, soluk, aralıklı büyük harfli yazılar (14; "GÜNE BAŞLA" üst başlığı mono büyük harf); kalabalık (13);
sıfırlar ve boş kartlar (13; ilk görünümden çıktı, "henüz ölçüm yok" aşağıda duruyor); minik ikon şeridi şifre gibi (13;
sürüyor: günün zinciri 10 halka); beş surat (9); Pratikler'in 12 eş kutusu (9; aşağıda duruyor); "Görmeyi iyileştirdiği
gösterilmedi" hevesi kırıyor (7; yolun altında duruyor); "çevrimdışı öneri" (7; Nef kartında duruyor); eski kullanıcı
karşılanmıyor (6; sürüyor); sayılar tutmuyor (4; 1. gün "Nefes · 5 dk mola" ile "Mola · 1 dk" aynı ekranda duruyor);
ilk gün sınavla açılıyor (3; sürüyor).

**Geçen ekranlardan ders.** Y1'in tek geçen ekranı (Nefes "Bugünün ritmi", 3 turda geçti): uygulamanın kendi çizimi
(dalga) bilgiyi okumadan anlatıyor, somut ve birimli bir satır ("5 sn al · 5 sn ver · dakikada 6 nefes"), tek ve kocaman
bir "Başla". S0'da en çok "etkilendim" alanlar kişisel bir veriyle açılan ekranlar ("20 saniyede 3 kez kırptın"),
görünür ilerleme (tamamlanan yolun mavi çizgisi, renklenen iris) ve "Dün yolunun bütün duraklarını tamamladın".

---

## (b) Plan §3.F'nin ilk 5 saniye için istedikleri

Kaynak: `SONSUZ_YOL.PLAN.v1.md` §3.F (satır 991–1115), §1 (satır 66), §2.2 K2 ve K4, §3.A.8-7; S0 kararlarıyla düzeltilmiş
yerleri köşeli ayraçta.

1. **Yeni ekran yok** (§3.F.3): günün ilk açılışı Ana sayfadır; değişen, Ana sayfanın üst alanıdır.
2. **Göz sırası** (§3.F.3 tablosu):
   - 0–1 sn: açılış ekranı → Ana sayfa, düz zemin, logosuz (karar 5c; `ios/` işi, bu tasarımın dışında).
   - 1–2 sn: tarih satırı (ay evresi Y4'te, hava App Review cevabından sonra; şimdi yok) [biçim "30 Eylül Çarşamba",
     S0 kararı 1; kod bugün böyle yazıyor].
   - 1–2 sn: selam, "Günaydın, Haydar" (bugünkü gibi).
   - 2–4 sn: Nef satırı, **günün tek cümlesi**.
   - 4–5 sn: **büyük düğme**, "Güne başla · Sağ–sol bakış · 1 dk" ve **"Yeni" rozeti** [adı "Sağ–sol bakış", S0 kararı
     4; ölçüm durağında süre yazmaz, S0 kararı 22].
   - yan: sayılar, [ilk duraktan önce "N durak" ve "≈ X dk"; ilk duraktan sonra "1/N"; "0/9" yok, S0 Ç16]; seri yalnız
     ≥ 3 gün, değilse "N gün seninle"; sıfır satırı yok (karar 5d).
3. **Günün tek cümlesi** (§3.F.4): kişinin kendi verisinden, telefonda, ağsız; "ilk tutan kazanır":
   0 kırmızı ya da sarı görme uyarısı → cümle yok, uyarının sabit cümlesi en üstte; 1 kurulumun ertesi günü ya da 1. gün →
   "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız."; 2 kilometre taşı → "Bugün 28. gün: iris haritan
   başlangıçla yan yana geliyor." / "Bugün haftalık E testi günü." [7. gün "Bugün 7. gün: ilk haftanı tamamlıyorsun.",
   S0 kararı 5]; 3 ≥ 2 günlük aradan dönüş → "Kaldığın yerden: basamakların aynı."; 4 dün bir ilk ya da rekor → "Dün
   Yılan'da 38 puanla en iyi sonucuna ulaştın."; 5 yeni doğrulanmış değişim → "Tek Bakışta oyununda sonucun iki haftadır
   başlangıcından iyi."; 6 bugün yeni basamak ya da modül → "Bugün yeni: sağ–sol bakış."; 7 dün yol tamamdı → "Dün
   yolunun bütün duraklarını tamamladın."; 8 ≤ 3 gün içinde kilometre taşı → "İris haritan 3 gün sonra başlangıçla yan
   yana gelecek."; 9 hiçbiri → bugünkü `homeSuggest` satırı.
4. **Cümle kuralları** (§3.F.4): aynı öncelik iki gün üst üste gelmez (0 ve 1 hariç [S0 kararı 5: 2 de hariç]); en çok
   70 karakter; tek iddia, içindeki sayılar yalnız o iddiaya ait; karşılaştırma yalnız kişinin kendi başlangıcıyla;
   "iyileşti", "gelişiyorsun", "sağlıklı" yok; tek günlük ham fark ("Dün 9, bugün 12 kırpma") yok; cümle gün içinde
   değişmez; ilk dokunuşa kadar ya da en çok 1 saat görünür, sonra `homeSuggest` bugünkü gibi (§2.2 K2).
5. **Tam ekran pencereler ilk 5 saniyeden çıkar** (§3.F.3, §2.2 K4): Yenilikler ve rıza pencereleri günün ilk
   dokunuşundan ya da ilk duraktan sonra açılır; istisna ilk rapor (5. gün) ve kırmızı görme uyarısı. (Pencerelerin
   sırası `App.jsx`'te; bu işte dokunulmaz.)
6. **Sıfır ve kırık seri görünmez** (§3.F.1, karar 5d; S0 kararı 23: kapsam Ana sayfanın tamamı: seri, "0/3 hafta",
   1. gün "N gün seninle", yolun altındaki "Bu hafta 0/3 gün", "0 / N" sayacı, Nef kartının "0/3"ü). §3.A.8-7: atlanan gün
   cezasızdır, basamak geri gitmez, sayı sıfırlanmaz, "seri bozuldu" ekranı yoktur. §3.F.5: dönen kişi hiçbir sayının
   sıfırlandığını görmez.
7. **Dünden bir şey söyler** (§3.F.1 bulgusu): bugün Ana sayfa dünden hiçbir şey söylemiyor; `homeSuggest` yalnız
   sıradaki durağı, yürümeyi ve molayı biliyor. Çevrimiçi Nef kartı ilk 5 saniyeye yetişemez (istek zaman aşımı 10 sn,
   kart ilk görünen alanın altında); ilk 5 saniyede ağ beklenmez.
8. **"Yeni" rozeti** (§1, §3.F.3): bugün ilk kez gelen durak ya da basamak işaretlenir (1. gün yok; kural
   `newStopKeys`).
9. **Deneyim yayı** (§3.F.5): 1–7. gün "bu uygulama beni tanıyor" (her güne bir sürpriz: 1. gün İlk Bakış sonucu, 2. gün
   sağ–sol ve Yılan, 3. gün 3 dk nefes (ve yoga), 4. gün yukarı–aşağı, 5. gün ilk rapor, 6. gün Fark Ettin mi?, 7. gün
   "İlk haftan"); 8–30. gün "düzenim oturuyor" (8. gün ikinci E testi, 14. gün iyi oluş kartı, 22. gün görmede başlangıç,
   25. gün geri sayım, 28. gün iris yan yana, 29. gün ilk aylık Nef); 31–90+ "benim düzenim; ara verirsem de dönerim"
   ("66 günde alışkanlık" gibi söz verilmez).
10. **Tasarımı yönlendiren kanıt** (§3.F.6; kullanıcıya söylenmez): kişiye uyarlanmış içerik, kolay ve kararlı tasarım,
    kendi sağlığına içgörü ve kontrol hissi, tutarlılık, düşük karmaşıklık ve keyif; oyunlaştırmanın etkisi küçük ve
    zamanla azalıyor; kırık serinin gizlenmesi "ceza yok" ilkesine dayanır.
11. **Ölçü** (§3.F.7): G1 ilk dokunuş süresi 5 saniye kuralının doğrudan ölçüsüdür; G2 ilk açılışta durak başlatma
    oranı, G9 cümle türüne göre durak başlatma. (Ölçüm kodu bu işin kapsamında değil.)
12. **Dürüst sınır** (§1): 5 saniyede ölçüm yapılamaz; ilk saniyeler merak ve kişisel bir cümle verir. Kırmızı ya da
    sarı görme uyarısında günün cümlesi yazılmaz, uyarı en üste çıkar.

§3.A'dan ilk görünümü ilgilendirenler: yol her gün aynı değil (1. gün 8 dk, 2.–9. gün her gün yeni bir adım, 9. günde
tam yol; §3.A.9 tablosu); yol sıralıdır (yalnız sıradaki ve biten durak açılır); mola 1. gün 1, 2. gün 2, 3. günden 5
dakikadır ("Mola · 5 dk", baloncuk "Sırada mola: 3 dk nefes, 2 dk dinlenme"; S0 kararı 8); nefes kalıbı "Bugünün ritmi:
4 · 1 · 6" diye söylenir (S0 kararı 6); ekrandaki metinler etki söylemez (§3.A.6).

---

## (c) Ana sayfada bugün ne var

### Ana sayfadan önce (App.jsx; bu işte dokunulmaz)
Güncellemeden sonra görülmemiş sürüm notu varsa **Yenilikler** tam ekran; kurulumdan 5–14. gün arası bir kez **İlk
rapor**; kurulumun sonunda **İris haritan**; iPhone'da deneme teklifi. Hesap ve Sağlık rızası sayfaları Ana sayfanın
üstünde açılır (`ConsentSheet`). Sekme çubuğu (`Bugün · Gelişim · Takvim · Bilgi`) `App.jsx`'te, `styles.css` `.tabbar`
(sabit, %95 opak zemin, `--tabbar-bg`); sayfanın alt boşluğu `.screen.has-tabbar` (104 pt + güvenli alan).

### Ana sayfa, yukarıdan aşağı (`screens/Home.jsx`)

| # | Öğe | Veri kaynağı | Ne zaman görünür |
|---|---|---|---|
| 1 | Tarih satırı "30 Eylül Çarşamba" | `toLocaleDateString('tr-TR', {weekday, day, month})` | her zaman |
| 2 | Selam + ad ("Günaydın, / Deniz") | `lib/greeting.js` (saat: <5 İyi geceler, <12 Günaydın, <18 İyi günler, <22 İyi akşamlar), `settings.identity.name` | her zaman |
| 3 | Avatar düğmesi (Profilim; üyede yıldız) | `settings.identity` | her zaman |
| 4 | Çalışma oturumu şeridi | App `focus` | oturum açıkken |
| 5 | Yoga sabah kartı (**yeri sahip kararı bekliyor: bugünkü yerinde kalır**; dosyasına dokunulmaz) | `components/YogaMorningCard.jsx` | yalnız iPhone; Uykuya Geçiş dersinden sonraki sabah 04.00–11.59; rıza sayfası açıkken yok |
| 6 | Sayı çipleri: "N gün seri" (mercek rengi), "Bu hafta N/3 gün" ya da "Bu hafta N gün · hedef tamam", "N gün seninle", adım, alarm satırı | seri `lib/stats.js summary().streakDays`; hafta `lib/calendar.js weekProgress` (test + egzersiz oturumu günleri, hedef `settings.reminder.weeklyTarget`, hafta Pazartesi başlar); gün `activeDays(tests+sessions).size`; adım `health` (iPhone); `AlarmLine` (iPhone) | seri ≥ 3; hafta > 0; "gün seninle" > 0 ve seriyle aynı sayı değilse |
| 7 | **"Bugün" kartı**: büyük "≈N dk" (+ " kaldı") ve "N durak" / "k/N durak"; yol bitince "N/N durak" | `buildPath` → `plan.minutesLeft`, `doneCount`, `total`, `allDone` | yolda durak varsa |
| 8 | Günün zinciri (her durak yoldaki çizimiyle; biten dolu ve onaylı, sıradaki halkalı) | `components/DayChain.jsx`, `plan.stops` | aynı |
| 9 | Nef satırı ("Bugünkü yol tamam." / "Gözlerin mola istiyor." / "Önce kalk, 2 dakika yürü; sonra X." + "Nef · alt satır") | `lib/homeSuggest.js` `primary.line`, `.sub` | yalnız düğmeyi tekrar etmiyorsa (göz molası, yürüme, gün tamam, serbest gün) |
| 10 | **Büyük düğme**: üst başlık ("Güne başla" / "Yola devam et" / "Göz molası" / "Bugün tamam" / "Serbest gün"), başlık ("Haftalık E testi · 5 dk", "Sağ–sol · 1 dk", "Nefes · 5 dk", "Dalga"), durağın alt satırı, "Yeni" | `homeSuggestion` (öncelik: göz molası kilidi ya da vakti → yol yarımsa sıradaki durak → Dalga); "Yeni" `newStopKeys` | her zaman; dokununca `startSuggest` (yolun Nefes durağında mola kararı `restDecision`; göz molası önerisi `breath-5`) |
| 11 | Sakin seçenekler "Nefes · 5 dk mola", "Dalga · sakinleş" | `homeSuggest` `alts` (birincil olmayanlar) | her zaman (biri ya da ikisi) |
| 12 | Kart yuvası (tek): hatırlatma izni → izin notu → deneme şeridi → seyreltme sorusu | App (bildirim planı v2) | iPhone koşulları; rıza sayfası açıkken yok |
| 13 | Göz molası kilidi bandı (`REASON_TEXT`) | `eyeBudget.locked` | mola sürerken |
| 14 | Yerinde sorular: "28. gün · İris haritan yeniden", "Akşam kontrolü · Günün nasıl geçti?", "İlk haftan bitti · İki kısa soru daha" | `lib/profileQuestions.js pendingCard` | iris 28 gün sonra (yapılana dek); akşam 18.00'den sonra ve akşam soruları eksikse; stres ilk haftadan sonra |
| 15 | "Bugünün yolu" / "Bugünkü yol tamam" / "Serbest gün" başlığı ve **yol** (bölümler, kanat hilali, mola bandı "Mola · N dk", duraklar, "Yeni" etiketleri, Nef baloncuğu ve "Başla" (az önce durak bittiyse), "Önce: X" uyarısı, alt not "Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi.", hafta satırı) | `components/TodayPath.jsx`; `jevLine`, `canOpen`, `pathRestMinutes`, `newStopKeys` | yolda durak varsa; açılışta kendiliğinden kaydırma yalnız az önce bir durak bittiyse (sıradaki durağa) |
| 16 | Alarm kartı | `AlarmCard` | iPhone, alarm kurulu |
| 17 | Gelişim haritası: küçük iris, "N / 7 alanda kaydın var", "İyileşiyor: …" ya da "Değişim, kayıtlar biriktikçe görünür.", tek eylem (WHO-5 ya da en az kayıtlı alan) | `components/HomeMap.jsx`, `lib/dataHub.js growthMap` | kurulumdan sonra |
| 18 | Nef kartı: rızasızsa "Nef Göz Koçu" tanıtımı; rızalıysa "Bugün · Nef" + içgörü + eylem, "çevrimdışı öneri" | `components/CoachCard.jsx`, `lib/coach.js` (ağ; 10 sn) | hatırlatma kartı açıkken tanıtım yok |
| 19 | "Ölçümlerin" kutucukları (Yakın görme + ölçüm modülleri, küçük eğri) | `lib/vaSeries.js`, `trend.js`, modül `tile` | her zaman ("henüz ölçüm yok") |
| 20 | Görme uyarısı kartı (kırmızı ya da sarı) | `trendMessage(r)` | uyarı varsa (bugün Ölçümlerin'in altında) |
| 21 | "Pratikler" 12 kutu (+ Su) | `registry.inSection('practice')`, yoga yalnız iPhone | her zaman |
| 22 | "Egzersiz" ve "Ölçüm" satırları | `registry.inSection('exercise' / 'measure')` | her zaman |
| 23 | Mesafe takibi notu; yasal alt not ("Bu uygulama teşhis koymaz…") | `distanceTracked` | not kapalıysa; alt not her zaman |

**Bugünkü ilk görünüm** (`shots-once`): 390×844'te 1–7 (web'de 4, 5, 12 yok) + 11 + "Bugünün yolu" başlığı + yolun ilk bir-iki
durağı; 320×640'ta "Bugünün yolu"nun ilk durağına kadar. İlk görünüm sayfanın %14–25'i. Açılışta kaydırma yok.

### Değişmez
- **Yolun mantığı**: `lib/today.js` (buildPath, canOpen, jevLine), `lib/progression.js` (progressionCtx, newStopKeys,
  restDecision, pathRestMinutes, updateDay), `lib/ladders.js`, `lib/breathMix.js`, `lib/homeSuggest.js`,
  `lib/pathLater.js`, `modules/*/manifest.js`; `modules/pathModules.equiv.test.js` ve `lib/today.test.js` beklentileri.
  Buna göre durakların sırası, sıralı açılma ("önce sıradaki"), büyük düğmenin önceliği (göz molası → sıradaki durak →
  Dalga), her dokunuşun açtığı rota ve başlattığı mola kararı (`startStop`, `startSuggest`), "Yeni" kuralı, mola süresi,
  seri ve sayı kuralları aynen kalır. Sunuş katmanında kural icat edilmez.
- **Onaylı cümleler**: `homeSuggest` satırları ("Güne X ile başla.", "Kaldığın yerden devam: X.", "Önce kalk, 2 dakika
  yürü; sonra X.", "Gözlerin mola istiyor.", "Ekrandan uzak, yavaş nefes", "Bugünkü yol tamam.", "Bugün yol yok.",
  "İstersen Dalga ile gevşe", üst başlıklar); sakin seçenekler ("Nefes · 5 dk mola", "Dalga · sakinleş"); yolun
  baloncuk sözcükleri ve satırları (`JEV_WORDS`, "Sırada mola: 3 dk nefes, 2 dk dinlenme"); `WEEKLY_SUB` "3 bölüm · sağ,
  sol, iki göz", "✓ Bu hafta tamam"; selamlar; plan §3.F.4'ün cümle örnekleri; S0'nun onayladığı cümleler.
- **S0 kararları**: tarih "30 Eylül Çarşamba" (1); "Sağ–sol bakış" (4); 7. gün "Bugün 7. gün: ilk haftanı
  tamamlıyorsun." (5); "Bugünün ritmi" (6); iç kodlar (N1, K2…) ekranda yok (7); mola bandı "Mola · 1 / 2 / 5 dk" (8);
  büyük düğme ölçüm durağında süre yazmaz (22); Ana sayfanın tamamında sıfır yok (23, Ç7, Ç16); seri ≥ 3 iken "N gün
  seninle" kalır, aynı sayıysa yazılmaz (24); hafta satırı "2/3 gün bu hafta", hedef tutunca "4 gün bu hafta" ve yeşil tik
  (Ç19; kod bugün "Bu hafta 2/3 gün" yazıyor, açık nokta 4); yolun altındaki hafta satırı Nef kartı aynı sayıyı
  söylüyorsa yazılmaz (Ç20); yoga sabah kartının yeri sahibin kararı (19) → bugünkü yerinde.
- **Güvenlik ve dürüstlük**: sağlık iddiası yok ("iyileşti", "gelişiyorsun", "sağlıklı", tedavi eder, önler yok); görme
  uyarısı kartı (kırmızı, sarı) hiçbir katmanda gizlenmez, plan onu en üste ister; göz molası kilidi bandı ve metni;
  alt not "Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi." ve yasal alt not sayfada kalır (yeri
  serbest); rıza sayfaları; Nef yalnız rızayla ve ağ ister, ilk 5 saniyede beklenmez.
- **Dokunulmayan dosyalar**: `modules/yoga/*`, `lib/yoga*.js`, `components/YogaMorningCard.jsx`,
  `styles/yogaMorning.css`, `lib/releases.js`, `site/`, `ios/`, `App.jsx`.
- **Tasarım dili**: renkler, yazılar, köşeler tokenlardan (`src/styles.css` `:root` ve iki tema; `src/styles/*`
  bileşen stilleri); iki tema tokenlarla; 320 ve 390 pt'de taşma yok; dokunma alanı ≥ 44 pt; Hareketi Azalt'ta hareket
  durur; sekme çubuğunun altına içerik sızmaz.

### Serbest (yalnız sunuş)
Düzen ve sıra (hangi öğe ilk görünümde, hangisi aşağıda); vurgu ve ölçek (en büyük yazının ne olduğu: dakika, durak, seri,
kişinin cümlesi); gruplama (çiplerin, kartın, zincirin, düğmenin birleşmesi ya da ayrılması); katmanlama (ayrıntının bir
dokunuşla açılması, ilk görünümden aşağı inmesi: hafta satırı, sakin seçenekler, zincir, yol, Gelişim haritası, Nef kartı,
Pratikler); kendiliğinden kaydırma (açılışta ya da dönüşte); görsel dil (yolun çizimi, zincirin biçimi, iris, diyafram,
mercek, ay, renk ve hareket tokenlar içinde); ilk görünümün sekme çubuğunun üstünde temiz bitmesi. Aynı veriyi yeniden
sunmak (ör. seri ile haftayı tek bir görsel dilde, ya da durak adının yanında kısa açıklama göstermek) serbesttir; yeni
bir cümle gerekirse önce onaylı cümleler kullanılır, yenisi raporda "metin kapısına" diye işaretlenir.

### Karar gerektiren açık noktalar (orkestratöre)
1. **Günün tek cümlesi kodda yok** (`day-open` kaydı, öncelik tablosu, "ilk tutan kazanır"). Veri hazır (ör.
   `settings.profile.firstLook` = { blinks, seconds, method }, iris başlangıç tarihi, kayıtlar), ama öncelik seçimi yeni
   bir kuraldır. Yol mantığına dokunmaz; yine de "yalnız sunuş" sınırının içinde mi, kapsam kararı gerekir. Ay şeridi
   (Y4) ve hava (Y5) bu işte yok.
2. **"Sağ–sol bakış" (S0 kararı 4)** ile `lib/today.test.js:514` (`title` "Sağ–sol") çelişir; başlık yalnız görünümde
   değiştirilebilir (`lib/ladders.js` değişmez).
3. **Büyük düğmede ölçüm süresi (S0 kararı 22)**: başlığı `homeSuggest` kuruyor ("Haftalık E testi · 5 dk");
   `homeSuggest.js` değişmez. Düğme başlığını görünümde `plan.next.title` ve `hideMinutes`'ten yazmak mümkün.
4. **Hafta satırının yazımı**: kod "Bu hafta 2/3 gün", S0 Ç19 "2/3 gün bu hafta". Değerlendiricilerin en sık ikinci
   şikâyeti; ilk görünümde gerekip gerekmediği de tasarım sorusu.
5. **Görme uyarısının yeri**: plan en üst ister, kod "Ölçümlerin"in altında çizer (ilk görünümde değil).

---

## (d) Senaryo senaryo: ilk 4 saniyede ne anlaşılmalı, ne hissedilmeli

Veriler düzenekten (`shots-once/INDEX.md`, "Senaryolar"). Cümle adayları plan §3.F.4 ve S0 kararlarındandır; kodda
olmadıkları için kullanımı (c)'deki 1. açık noktaya bağlıdır.

**1 · 1. gün, 10.00** (4 durak, ≈ 8 dk: Haftalık E testi → Çemberler → Nefes 1 dk (mola 1 dk) → Göz kırpma; İlk Bakış'ta
20 saniyede 3 kırpma; seri, hafta, "gün seninle" yok)
- Anlaşılmalı: bugün kısa ve belli bir şey var (≈ 8 dk, 4 durak); ilk adım E testi ve ne olduğu ("3 bölüm · sağ, sol,
  iki göz"); bu yol her gün biraz büyüyecek.
- Hissedilmeli: "beni tanıdı, merak ettim" (kendi verisi); kolaylık; sınav değil, başlangıç.
- Olmamalı: aynı ilk işin üç kez yazılması; "5 dk" ile "≈8 dk"ın çelişmesi; "Nefes · 5 dk mola" ile "Mola · 1 dk"nın yan
  yana durması; boş ya da sıfır bir şey.
- Cümle adayı: "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." (öncelik 1).

**2 · 2. gün, 10.00** (7 durak, ≈ 11 dk; "Yeni": Sağ–sol bakış, Nefes 2 dk, Okuma, Yılan, Bugünün görevi; dün yol tamam;
"Bu hafta 1/3 gün", "1 gün seninle")
- Anlaşılmalı: dün yaptığım sayıldı; bugün yol bir adım büyüdü ve yeni olan belli (Sağ–sol bakış, ne olduğu tek satırda);
  ilk adım 1 dakika.
- Hissedilmeli: ilerleme ve merak ("bugün yeni bir şey var"); yük değil.
- Olmamalı: "1/3" gibi hedefi bilinmeyen kesir; 8 → 11 dk sıçramasının açıklamasız en büyük yazı olması; etiketsiz ikon
  şeridi.
- Cümle adayı: "Bugün yeni: sağ–sol bakış." (öncelik 6; S0 (a) 2. gün cümlesi).

**3 · 9. gün, 10.00** (10 durak, ≈ 15 dk; "Yeni": Daire; nefes 3 dk, "Bugünün ritmi" Eşit ritim 5 · 5; 8 gün seri;
"Bu hafta 2/3 gün")
- Anlaşılmalı: 8 gündür her gün buradayım (emek görünür); bugün tam yol ve yeni olan Daire; yol bölümlere ve bir molaya
  ayrılmış, tek parça 15 dakika değil.
- Hissedilmeli: gurur ve "düzenim oturuyor".
- Olmamalı: en büyük şeyin dakika olması; seri ile haftanın çelişkisi; 10 minik ikonun sıkışması.
- Cümle adayı: "Bugün yeni: daire." (öncelik 6; plandaki kalıbın doldurulmuşu, metin kapısına) ya da "Dün yolunun bütün
  duraklarını tamamladın." (öncelik 7).

**4 · 30. gün, 10.00** (10 durak, ≈ 15 dk; bugün yeni durak yok; nefes 3. katman, "Bugünün ritmi" Karın nefesi 3 · 7,5;
29 gün seri; iris haritası dün yeniden yapıldı; planda 29. gün ilk aylık Nef, kodda yok)
- Anlaşılmalı: bir ay oldu; bu ay yolum büyüdü ve birikti (ilk günden bugüne); bugünün ilk adımı.
- Hissedilmeli: sahiplenme ("benim düzenim"), emeğin karşılığı; 9. günden farklı bir ekran.
- Olmamalı: 9. günün aynısı; "Değişim, kayıtlar biriktikçe görünür" gibi erteleyen bir cümle; sağlık iddiası
  ("gelişiyorsun" yok).
- Cümle adayı: "Dün yolunun bütün duraklarını tamamladın." (öncelik 7; S0 30. gün kararı).

**5 · Eski kullanıcı, Y1 güncelleme günü, 10.00** (70 günlük geçmiş, 68 kayıtlı gün; 10 durak, ≈ 17 dk (haftalık E testi
günü); "Yeni": Bugünün ritmi (Eşit ritim 5 · 5), Yukarı–aşağı, Bugünün görevi; seri < 3; "Bu hafta 1/3 gün", "68 gün
seninle")
- Anlaşılmalı: yolum artık her gün değişiyor ve bugün yeni şeyler var; 68 günüm yerinde, hiçbir şey sıfırlanmadı;
  17 dakika bölümlere ayrılmış, ilk adım 1 dakika.
- Hissedilmeli: tanınma ("tekrar hoş geldin" duygusu, yazıyla değil), yenilik, azar değil.
- Olmamalı: 9. günün aynısı; "1/3" azarı; en büyük şeyin "≈17 dk" olması.
- Cümle adayı: "Bugün yeni: yukarı–aşağı." (öncelik 6; kalıbın doldurulmuşu, metin kapısına) ya da son iki gün açılmadıysa
  "Kaldığın yerden: basamakların aynı." (öncelik 3). Güncellemeyi anlatan yeni bir cümle gerekirse metin kapısına.
  Yenilikler penceresi (varsa) ilk dokunuştan sonra (§2.2 K4; `App.jsx` bu işte değişmez).

**6 · 9. gün, 20.30, yol bitmiş** (10/10 durak; 9 gün seri; "Bu hafta 3 gün · hedef tamam"; büyük düğme "Bugün tamam ·
Dalga"; akşam soruları cevaplı, akşam kartı yok)
- Anlaşılmalı: bugün tamam; bugünün emeği (10 durak, seri 9 gün, haftanın hedefi tuttu); isterse sakin bir seçenek var,
  zorunlu bir şey yok.
- Hissedilmeli: kapanış, tatmin, huzur; yarına davet (baskı değil).
- Olmamalı: sabahki gibi bir "iş" ekranı; bitmiş durakların uzun listesi ilk görünümü kaplaması; sağlık iddiası.
- Cümle: günün cümlesinin süresi dolmuştur (ilk dokunuş sabahtı); bugünkü `homeSuggest` satırı "Bugünkü yol tamam."
  (onaylı). Akşam kartı (Y4, "Günün nasıl geçti?") bu işin kapsamında değil.

**Her senaryoda ortak kapı** (değerlendiricilerin sık şikâyetlerinden): ilk görünümde tek odak ve tek eylem; aynı şey
bir kez yazılır; en büyük öğe kişinin emeği ya da bugünün anlamı olur, dakika değil; her ad ya kendini anlatır ya da
yanında kısa bir açıklama taşır; sayılar birbirini tutar; sıfır ve kesir-azar yok; ilk görünüm sekme çubuğunun üstünde
temiz biter; açık ve koyu temada, 320 ve 390 pt'de aynı hiyerarşi.

---

## Düzenek (GÖREV 1)

- Klasör: `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/ana-5sn/duzenek/` (Y1 düzeneğinin
  kopyası; port 4293, `--strictPort`; Y1 düzeneğine dokunulmadı).
- Tek komut: `bash …/ana-5sn/duzenek/cek.sh [hedef-klasör] [önek]`; hedef verilmezse `…/ana-5sn/shots/`. Sunucu PID ile
  kapanır.
- Senaryolar: 1 `gun1`, 2 `gun2`, 3 `gun9`, 4 `gun30` (yeni), 5 `eski-guncelleme`, 6 `gun9-aksam` (yeni, 20.30); her biri
  390×844 ve 320×640, açık ve koyu; dosya `<no>-<ad>-<390|320>-<acik|koyu>.png`, `INDEX.md`, `_rows.json`.
- Bugünkü hâl: `…/ana-5sn/shots-once/` (24 görüntü). Açık tema pikselden doğrulandı: açıkta kenar parlaklığı 243–244
  (zemin #f3f6f8), koyuda 11 (#070c12); 24/24 doğru. Taşma yok, 44 pt altı dokunma alanı yok, sayfa ve konsol hatası yok.
