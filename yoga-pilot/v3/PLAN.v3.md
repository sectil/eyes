# Nefona Yoga · İlk yayın ve yola entegrasyon planı (sürüm 3)

Tarih: 2026-09-29. Durum: **ONAYLANDI (sahibi, 2026-09-29: "onay"; yedi kararın hepsi öneriyle).** İnceleyici adı verilmedi; ad verilene kadar bütün rollerde karar 2'nin yedeği uygulanır. Uygulama koduna dokunulmadı, ücretli ElevenLabs çağrısı yapılmadı.
Bu belge ve çalışma notları `yoga-pilot/v3/` klasöründedir. Bu belge `yoga-pilot/PLAN.v2.md`'yi (on dersin tasarımı, metin kılavuzu, ses kuralları) ve
yol tasarım belgelerini tekrar etmez; onlara atıf yapar. Yalnız **ilk yayını (Yoga v1)** ve **yola entegrasyonu** kesin
kararlarla anlatır.

**Dayandığı çalışma notları** (bu klasörde; her biri kendi kaynaklarını satır satır verir): `sure.md` (süreler ve 3/5/15
blokları), `yol.md` (yoldaki yer, 30 günlük benzetim), `uretim.md` (teslim biçimi, boyut, kredi), `modul.md` (ekranlar,
kayıt, Gelişim, Nef, güvenlik). Notlar arasındaki çelişkiler §2.0'da tek tek seçildi. İki inceleme turundaki düzeltmeler
(sonda "İnceleme izi") notlara işlenmedi; bir not bu belgeyle çelişirse bu belge geçerlidir.

**Bu belgede ayrıca doğrulananlar:** harcama defteri satır satır yeniden toplandı (`render/ledger.jsonl`, 399 satır);
Ders 2'nin 20 dakikası için gereken ek birimler pilot planlayıcısıyla, kredi ve boyut bu planın kapsamıyla yeniden
hesaplandı (`v3calc/d2_20.py`, `v3calc/kredi.py`; ikisi de depoyu yalnız okur). İkinci inceleme turunda yoganın yoldaki
kuralı değişti (yoga artık hiçbir durağı düşürmez; §B.2 kural 2) ve yol yeniden iki kez benzetildi: **bugünkü yolla**
(canlı 20 manifestin who5 dışındaki 19'u: who5 Node'da yüklenmiyor, `today()`'i olmadığı için yolu etkilemez;
merdivensiz, Nefes 5 dk; `v3fix2/sim_bugun_v4.mjs`) ve (c)'nin merdivenleriyle (`v3fix2/yolsim_c_v4.mjs`); ikisi de
10.00 ve 19.00'da, 30 ve 90 gün, 5 ve 3 dk göz bütçesiyle, ayrıca Hızlı Bakış oynayan kullanıcıyla koşuldu. `today.js`'e
önerilen beş ekin eşdeğerlik sınaması da yeniden yapıldı (`v3fix2/esdeger_v4.mjs`, `v3fix2/esdeger_yoga_v4.mjs`). Boyutlar
bayt olarak yeniden ölçüldü (`du -sb`). Hepsi depoyu yalnız okur. Kod iddiaları `dosya:satır` biçimindedir ve yalnız bu
görevde okuduğum satırlardandır.

**Kanıt kuralı:** bilimsel iddialar yalnız yoga-pilot dosyalarında ikinci turda doğrulanmış kayıtlardandır, PMID ve DOI
taşır. Kanıtın sayı vermediği her değer **VARSAYIM** diye işaretlidir. Sağlık iddiası yoktur; uygulama "tedavi eder,
iyileştirir" demez.

---

## 1. Tek sayfada

**Ne yapılacak.** On dersten oluşan sesli bir yoga modülü yapılacak. Her ders 30 dakikalık bütün bir ders olarak
tasarlanır. İlk yayında yedi ders 3, 5 ve 15 dakikalık, üç ders 5 ve 15 dakikalık sürümlerle gelir; Derin Dinlenme'nin
ayrıca 20 dakikası vardır. Kısa sürüm kesilmiş bir parça değildir: karşılamayla başlar, kapanışla biter, hiçbir cümle
yarıda kalmaz. On dersi tek hoca sesi anlatır. Modül Gelişim'e, Nef'e ve Bugünün yoluna bağlanır; yoldaki durak ilk
yayının parçasıdır. İlk yayında yoga yalnız iPhone uygulamasındadır; web sürümünde görünmez (§D.7).

**On ders ve ilk yayındaki süreleri (dakika):** 1 Nefesin Ritmi 3·5·15 · 2 Derin Dinlenme 5·15·20 · 3 Uykuya Geçiş 5·15 ·
4 Zor Anlar İçin 3·5·15 · 5 Tek Nokta 3·5·15 · 6 Sabah Niyeti 3·5·15 · 7 Kendine Şefkat 5·15 · 8 Sağlam Yer 3·5·15 ·
9 Kendini Tanımak 3·5·15 · 10 Gelecekteki Sen 3·5·15. Üç derste 3 dakika yok. Uzanarak yapılan Derin Dinlenme, güvenli
kalkış adımlarıyla birlikte 3 dakikaya sığmaz. Uykuya Geçiş'in imgelemesi 3 dakikada kurulamaz. Kendine Şefkat'in
kademeli sırası 3 dakikaya sığmaz, kısaltmak da güvenli olmaz. Bu, "3-5-15" sözünden bir sapmadır; karar 4'te onayına
sunuyorum. 30 dakika ve "istediğin dakika" ikinci aşamada gelir; §F'de kendi kapıları, takvimi ve bütçesi var.

**Yolda (kural).** Yoga yola 3. günde girer. 2. bölümde göz duraklarından sonra, Bugünün görevi'nden önce gelir; yolun
son pratik durağıdır. Göz bütçesine sayılmaz; göz payı dolunca da yoldan düşmez. Kısa günlerde 3 dakikalık bir ders
gelir. Altı kısa yoga gününden sonra, ölçüm olmayan ilk gün 5 dakikalık tam ders gelir; bu, yaklaşık 8 günde bir olur.
Tam ders günleri, 3 dakikası olmayan üç dersten ikisine ayrılmıştır (Uykuya Geçiş gece dersidir, yolun sırasında
yoktur): sırayla Derin Dinlenme ve Kendine Şefkat gelir. Öteki yedi dersin 5 dakikası kütüphanededir. Haftalık E testi
günü yolda yoga yoktur; okuma testi günü yoga 3 dakikadır. Her gün, o güne kadar en az yapılmış ders seçilir. 15
dakikalık sürüm yolda durak olarak gelmez; kişi dersi ekranda 15 dakikaya uzatabilir. Yoga hiçbir durağı yoldan
çıkarmaz: yol yogayla 20 dakikayı aşacaksa yoga o gün yolda olmaz. Durak, yol planının ilerleme motorunu ((c) adımı)
beklemez: sayaçlarını uygulamadaki kayıtlardan kendisi türetir. Bu yüzden senin iş sıran ("önce yoga, sonra sonsuz yol")
değişmez.

Uygulamayı her gün 10.00'da açan yeni bir kullanıcının ilk 14 günü (süresi yazılmayanlar 3 dk): 1 E testi, yoga yok ·
2 okuma, yoga henüz açılmadı · 3 Nefesin Ritmi · 4 Tek Nokta · 5 Zor Anlar İçin · 6 Sabah Niyeti · 7 Sağlam Yer · 8 E
testi, yoga yok · 9 Kendini Tanımak · **10 Derin Dinlenme, 5 dk** · 11 Gelecekteki Sen · 12 Nefesin Ritmi · 13 Tek
Nokta · 14 Zor Anlar İçin.

**Yolun süresi (bugünkü yolla benzetim, 30 gün, 5 dk göz bütçesi).** Yol planının hedefi ≈ 15 dk, üst sınırı 20 dk'dır;
sınırı kod, gerektiğinde durak düşürerek korur. Yoga, yolu ortalama 16,9–17,9 dakikaya çıkarır; yogasız yol 14,3–15,3
dakikadır (alt değer Bugünün görevi'ni hiç denememiş, üst değer bir kez denemiş kişi içindir). Yoga olan her gün yol 15
dakikayı aşar. Yoga yüzünden ne yol 20 dakikayı aşar ne de bir durak yoldan çıkar. Bu, benzetimin bir sonucu
değil, kuralın kendisidir: 20 dakika sınırı önce yogasız yola uygulanır, yoga ancak sığarsa eklenir (§B.2 kural 2). Her
gün uygulamayı açan kullanıcının benzetiminde yoganın sığmadığı gün olmadı. Hızlı Bakış oynayan ve Bugünün görevi'ni
deneyen kişide okuma testiyle Hızlı Bakış aynı güne düşünce yol yogasız 18 dakikadır; o gün yoga yolda olmaz (benzetimde
90 günün 4'ü). Göz bütçesi 3 dk olan kullanıcıda da yoga 30 günün 24'ünde yoldadır, çünkü göz payı dolunca yalnız göz
durakları düşer.

**Elde olan.** Yalnız Ders 2'nin 15 dakikası iki sesle (Neslihan, Hakan) ve iki müzik kaynağıyla kör A/B olarak
üretildi. Pilot, şartnamesinin (SPEC §7) ölçülen bütün ölçütlerini geçti; ama üç konu açık olduğu için bitmiş sayılmaz.
(1) Bir ölçüt yapılmadı: tam karışımın yazıya çevrilip plan metniyle hizalanması. Yerine her parçanın karışımdaki yeri
ölçüldü; üretimde de böyle olacak (§C.3, §E.3). (2) Neslihan'ın `n2.hatirla` birimi şartnamenin kesim kuralının dışında
kesildi; bu kesim ve `n1.sec`'teki kesim kulak onayı bekliyor. (3) Birkaç klip, Scribe'ın yazıya çevirdiği metinle harfi
harfine eşleşmedi ve şartnamenin öngördüğü gibi kulak listesine girdi. Farkların hepsi yazım farkıdır: iki seste
`a.durus` ve `k.yan` ("sırtüstü" / "sırt üstü"), Hakan'da `c2.yer` ("nefesteyse" / "nefeste ise"). Ayrıca bu planın daha
sıkı eşiğinde (1 saniyeden kısa parçalar dahil, konuşma yataktan en az 15 dB yüksek) Hakan'ın iki karışımında 8–9,
Neslihan'ın bir karışımında 1 kısa parça eşiğin altında kalıyor. Hakan'ın kısa parçaları, kesim kuralı ve Scribe'ın
yazım istisnaları A aşamasında düzeltilir; kesimler ve eşleşmeyen klipler kulak onayına gider. Karışımlar henüz kulakla
dinlenmedi. Uygulamada yoga kodu yok.

**Sıradaki adımlar ve senin onay kapıların.** Kapı 1: bu planı onaylarsın; pilotun küçük kusurları düzeltilir,
tasarlanan hoca sesi üçüncü aday olur. Kapı 2: kör karışımları dinler, sesi ve müzik kaynağını seçersin. Kapı 3: ekran
tasarımını görür, seçilen sesle Ders 2'nin 5, 15 ve 20 dakikasını tarayıcıda dinlersin; kod ancak bundan sonra yazılır.
Kapı 4: Ders 2'yi iPhone'da, kilitli ekranda dinlersin; uygulamanın ölçülen gerçek indirme boyutunu da bu kapıda
görürsün (karar 6). Kapı 5–7: kalan dokuz ders üçer üçer gelir (1-3-5, 4-7-8, 6-9-10). Metin önce insan inceleyicilerden
geçer, sonra seslendirilip ölçülür; her partide her dersin bütün sürelerini TestFlight'ta dinlersin. Yol durağını
cihazda ilk kez Kapı 5'te görürsün, çünkü yolun kısa günleri 3 dakikalık dersler ister ve bunlar ilk kez Parti 1'le
(Ders 1 ve 5) gelir. Kapı 8: on dersin hepsi onaylanınca ve yol durağı cihazda çalışınca modül yayına girer. Plan
onayından yayına ≈ 7–12 hafta sürer (tahmin; senin dinleme sürelerin bu süreye dahil değil; inceleyici bulunamayan
rolde yedek uygulanır, takvim inceleyici aramayı beklemez; indirme altyapısı gerekirse ≈ 1–2 hafta daha). İkinci aşama (30 dakika ve "istediğin dakika") Kapı 9–11'dir ve ilk
yayından sonra ≈ 7–11 hafta sürer (kaba tahmin).

**Maliyet ve boyut (tahmin).** Tek ses ve ElevenLabs müziğiyle konuşma ve müzik ≈ 370–530 bin kredi tutar
(≈ 67–96 USD). Tasarlanan ses adayı, %15 düzeltme payı ve Ders 2'nin 20 dakikası için ek müzikle ≈ 405–581 bine çıkar
(≈ 74–106 USD); ses tasarımı önizlemelerinin fiyatı bilinmiyor. Müzik uygulamanın kendi motorundan gelirse aday ve pay
dahil ≈ 185–270 bin tutar. Pilot 62,9 bin kredi (11,44 USD) tuttu; bunun 24,2 bini konuşmadır ve tahmin fiyatıyla
yazıldı, gerçek fiyatla uzlaştırılmadı. Ses dosyaları uygulamaya ≈ 113–125 MB ekler (AAC 64; bütün boyutlar ondalık
MB, 1 MB = 1.000.000 bayt). Uygulamanın bugünkü ses ve model dosyaları ≈ 82 MB'tır; ikisi birlikte ≈ 195–207 MB eder.
iOS'ta çalınmayan uyku kısılma MP3'leri çıkarılırsa toplam ≈ 188–200 MB'a iner. Bu, App Store'un 200 MB'lık hücresel
indirme eşiğinin (VARSAYIM) tam sınırıdır; JS dosyaları, `timeline.json` dosyaları ve uygulamanın kendisi eklenince eşik
aşılabilir. Kodek testi AAC 96'yı gerektirirse ses dosyaları ≈ 170–188 MB, toplam ≈ 252–270 MB olur ve eşik kesin
aşılır. Bu yüzden gerçek indirme boyutu kodek testinden hemen sonra, son boyuttaki yer tutucu dosyalarla TestFlight'ta
ölçülür; karar 6 Kapı 4'te bu ölçümle verilir.

**Senden istenen kararlar (önerimle):**
1. **Tasarlanan hoca sesinin tarifi.** Üçüncü adayın kör dinlemeye girmesini 29 Eylül'de sen karara bağladın ("Neslihan,
   Hakan + yeni aday; pilotta üçü kör karşılaştırılır"). Onayını istediğim yalnız tariftir: "sıcak, alçak perdeli, orta
   yaşta, İstanbul Türkçesiyle konuşan bir meditasyon hocası". Önizlemede okunacak örnek cümle, Ders 2'nin açılış
   cümlesidir. Maliyeti ≈ 14–15 bin kredi artı önizlemelerin henüz bilinmeyen fiyatıdır.
2. **İnsan inceleyiciler.** İnceleyiciler şunlar olmalı: Türkçe editör, usta hoca, Ders 4 ve 7 için klinik psikolog ve en
   az beş kişilik bir dinleme paneli (biri 65 yaş üstü). Öneri: bulabildiğin kişilerin adlarını sen belirle; kimseyi
   bulamadığın rolde yedek uygulanır ve yoga o rolü beklemez. Yedekler: Türkçe editör ve usta hoca yerine metni
   birbirinden bağımsız iki model incelemesi okur (Ders 2'nin pilot metni böyle dört turdan geçti); son kulak kararı
   senindir (Kapı 5–7). Klinik psikolog yoksa karar 5.3'teki yedek kural uygulanır. Dinleme paneli yoksa kodek testini
   ve anlaşılırlığı sen kör dinlersin; mümkünse 65 yaş üstü biri de dinler. Yedek, insan onayının yerini tam tutmaz;
   bu yüzden öneri önce insandır. Adı verilen inceleyicinin onayı olmadan metin seslendirilmez. Dinleme paneli metni değil,
   seslendirilmiş dosyaları dinler (§E.4). Tek istisna kör karşılaştırmadır: Ders 2'nin pilot metni, incelemeden önce
   üçüncü sesle de okutulur (Neslihan ve Hakan'da olduğu gibi). Bu kayıtlardan yayına yalnız incelemede değişmeyen
   birimler girer; değişenler yeniden seslendirilir.
3. **Bütçe tavanı.** Öneri: parti başına 195 bin, toplam 600 bin kredi (≈ 109 USD). İki tavan da düzeltme payı dahil üst
   tahminin üstündedir (en ağır parti ≈ 190 bin; toplam ≈ 581 bin ve fiyatı bilinmeyen önizlemeler).
4. **Süreler.** (a) 3 dakika yalnız yedi derste olsun; Derin Dinlenme, Uykuya Geçiş ve Kendine Şefkat'te en kısa sürüm
   5 dakika olsun. Öneri: evet. Öbür seçenek, bu üç derse dersin adını taşıyan ama tekniği farklı, oturarak yapılan
   3 dakikalık bir tanışma sürümü eklemektir (ör. Derin Dinlenme için kısa bir beden taraması). Bunu önermiyorum, çünkü
   böyle bir sürüm dersin adının karşılığını vermez. (b) Derin Dinlenme'ye 20 dakikalık sürüm de eklensin ve dersin
   varsayılanı bu olsun. Öneri: evet, çünkü Yoga Nidra'nın zıt duyumlar bölümü ancak 20 dakikalık sürümde yer buluyor.
   (c) 3 dakikada Sağlam Yer'in ve Gelecekteki Sen'in birer bölümü 55 saniyelik tabanın altında kalabilsin
   (38 ve 43 sn). (d) 3 dakikada kapanıştaki görsel aydınlanma 60 yerine 45 saniye sürsün.
5. **Yol.** Üç alt karar:
   - **5.1 Durak ilk yayında.** Öneri: yoga durağı ilk yayının parçası olsun ve ilerleme motorunu ((c)) beklemesin. Senin
     iş sıran değişmez: (c) ve öteki durakların merdivenleri, yoga yayınından sonra sonsuz yol planıyla gelir. Yoga
     yolda hiçbir durağı düşürmez: yol yogayla 20 dakikayı aşacaksa yoga o gün yolda olmaz. Bu önerinin sonucu: yoga
     olan günlerde yol ≈ 15 dakikalık hedefin üstündedir (ortalama ≈ 17–18 dk); yoga yüzünden yol hiçbir gün 20
     dakikayı aşmaz. Meditasyon yolda ayrı durak olmasın; yolun sesli rehberli dersi yalnız yoganın kısa dersleri olsun.
     Nefes molası yolda bugünkü gibi 5 dakika kalır. (c) geldiğinde Nefes, kendi merdiveninin kuralıyla yolda en çok 3
     dakika olur; 5 dakikalık nefes Ana sayfada kalır.
   - **5.2 "Parça parça" nasıl okunsun?** Sözlerinin ("30 dakikadan oluşuyor ve 10 bölüm… bunları yayman lazım",
     "sonsuz yolun içinde yoga bölümleri de parça parça yer alacak") iki okuması var. Öneri: yolda her gün on dersten
     birinin kısa sürümü baştan sona çalsın; dersler günlere yayılır, sıra sonsuz döner. Gerekçe: her sürüm karşılamayla
     başlar, kapanışla biter; hiçbir cümle yarıda kalmaz. Bu seçimin sonucu: yolda yalnız yedi adet 3 dakikalık ve iki
     adet 5 dakikalık dosya döner. 90 günde her 3 dakikalık ders 9–10 kez (19.00'da açan kişide 11 kez), Derin Dinlenme
     ile Kendine Şefkat'in 5 dakikası 5'er kez çalar; 15 dakikalık sürümlerin içeriği yola girmez, kütüphanede kalır.
     Öbür okuma, bir dersin 30 dakikasını on parçaya bölüp her gün bir parçasını çalmaktır (YOL.ilerleme §5.13). Bunu
     önermiyorum: parçalar ya ortada başlayıp ortada biter ya da her birine ayrı karşılama ve kapanış gerekir (on ders ×
     on parça = 100 ek dosya, 3'er dakikadan ≈ 300 dk ek ses). Ayrıca 30 dakikalık metin ikinci aşamada yazılır; bu
     okuma ilk yayında kurulamaz.
   - **5.3 Zor Anlar İçin ve Kendine Şefkat yolda kendiliğinden gelsin mi?** Kural, Zor Anlar İçin'in 3 dakikasını
     ≈ 9 günde bir, Kendine Şefkat'in 5 dakikasını ≈ 16–18 günde bir, günün herhangi bir saatinde getiriyor. PLAN.v2,
     Kendine Şefkat'i "akşam ya da zor bir günün sonu" için tasarladı; travma yaşamış kişilerde öz-şefkati kendine
     yöneltmek tehdit tepkisi oluşturdu (Creaser 2022, PMID 35391975, DOI
     [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602)). Öneri: evet, ama klinik psikoloğun onayıyla
     (§E.1). Psikolog onaylamazsa yedek kural uygulanır: Kendine Şefkat yolda yalnız 17.00'den sonra aday olur
     (VARSAYIM saat); tam ders günü daha erken açılırsa Derin Dinlenme gelir, yani uygulamayı hep sabah açan kişi
     Kendine Şefkat'i yolda görmez, ders kütüphanede kalır. Zor Anlar İçin de yoldan çıkar ve kütüphanede kalır.
6. **Boyut.** Öneri: bütün dersler pakette olsun (indirme altyapısı bugün yok). Bütün boyutlar ondalık MB'dir. AAC 64'te
   yoganın ses dosyaları ≈ 113–125 MB, uygulamanın bugünkü ses ve model dosyalarıyla birlikte ≈ 195–207 MB tutar.
   iOS'ta çalınmayan ≈ 7,6 MB'lık uyku kısılma MP3'leri yalnız iOS paketinden çıkarılsın (web oynatıcısı ve
   `dalgaSleep.test.js:65` onları `public`'te bekler; ayrı, küçük bir iş); böylece toplam ≈ 188–200 MB olur. Bu, 200 MB
   eşiğinin (VARSAYIM) tam sınırıdır; JS ve CSS (≈ 2,3 MB), `timeline.json` dosyaları (≈ 1 MB) ve uygulamanın kendisi
   eklenince eşik aşılabilir. Kodek testi AAC 96'yı gerektirirse toplam ≈ 252–270 MB (MP3'ler çıkınca ≈ 245–263 MB) olur
   ve eşik kesin aşılır. Eşik aşılırsa iki yol var: hepsi yine pakette kalır (hücresel ağda App Store'un kullanıcıya
   soracağı VARSAYIMdır) ya da indirme altyapısı kurulur (≈ 1–2 hafta ek iş, VARSAYIM). Karar, tahmine değil ölçüme
   dayanır: kodek testinden sonra, seçilen bit hızında ve son toplam sürede yer tutucu ses dosyalarıyla bir TestFlight
   derlemesi yapılır ve App Store Connect'in bildirdiği indirme boyutu okunur (C adımı). Kapı 1'de onayını istediğim
   bu yöntemdir; eşik aşılırsa iki yoldan hangisinin seçileceğine Kapı 4'te, ölçülen boyutla karar verirsin.
7. **Sonsuz yol planı ne zaman başlasın?** İş sıran "önce yoga, sonra sonsuz yol". Gerekçen, yoganın yoldaki yerinin
   önce belli olmasıydı; bu plan onaylanınca o yer belli olur (§B). Yoga ise ≈ 7–12 hafta sürer ve bu sürenin büyük
   kısmı dinlemeyi ve incelemeyi bekler. Öneri: bu plan onaylanınca sonsuz yol planının araştırması başlasın ve yoga
   üretimiyle birlikte yürüsün; plan hazır olunca onayına gelir. Sonsuz yolun kodu yine yoga yayınından sonra yazılır,
   çünkü iki iş aynı dosyalara dokunur (ör. `lib/today.js`). Yoganın hiçbir adımı sonsuz yolu beklemez. Öbür seçenek:
   sonsuz yol planı, yoga yayına girene kadar bekler.

---

## 2. Ayrıntı

### 2.0 Dört çalışma notu arasındaki çelişkiler ve seçimler

| # | Konu | Notlar ne diyor | Seçim | Gerekçe |
|---|---|---|---|---|
| 1 | Teslim biçimi | `uretim.md` §2: her ders × süre için hazır karışım (tek dosya). `modul.md` §4: hazır karışım önerilmez (iki sesle 212–231 MB, tek arka plan, ek kapanış karışımları) | **Hazır karışım** (§C.1) | Boyut tek ses kararıyla ≈ 113–125 MB'a iner; ek kapanış karışımı gerekmez, çünkü "Kapanışa geç" aynı dosyanın kendi kapanışına atlar; tek arka plan ilk yayında bilinçli bir sınırdır (satır 5). "Ses asla kesilmez" ancak dosyada, yayından önce ölçülerek kanıtlanır |
| 2 | Ses sayısı | `uretim.md`: 1 ses. `modul.md`: Neslihan · Hakan seçimi | **Tek ses** | Sahibin kararı: "pilotta üçü kör karşılaştırılır, sahibi dinleyip seçer" (yoga-pilot/SAHIP_ISTEKLERI.md:23-24). On derste tek hoca; konuşma kredisi ve dosya boyutu yarıya iner |
| 3 | 3 dk'nın kapsamı | `uretim.md` §6: on derste 3 dk. `sure.md` §3.4: yalnız yedi derste | **Yedi ders** (1, 4, 5, 6, 8, 9, 10); sahibin "3-5-15" sözünden sapma olduğu için karar 4(a) | Ölçülmüş sürelerle kuruldu (§A.3). Kredi ve boyut bu kapsamla yeniden hesaplandı |
| 4 | 3 dk'nın biçimi | `uretim.md` §2.4: "oturarak ya da gözler açık; usta hoca kararı". `sure.md` §3: yalnız oturarak, kendi kısa karşılama ve kapanış metniyle | **`sure.md`** | Ölçümle kurulmuş iskelet ve 12 kural; usta hoca yine onaylar |
| 5 | Seçenekler | `modul.md` §2.4: arka plan (Müzik · Doğa · Sessizlik), sahne, duruş, netlik anahtarı. `uretim.md` §2.3: ilk yayında tek sahne | **İlk yayında her derste tek ses manzarası**; Ders 2'de Orman; Ders 7 ve 9 oturarak; netlik anahtarı yok | Her seçenek dosya sayısını katlar. Sahibin ölçütü ses, müzik ve görselin tam uyumudur; bu, her derste ölçülmüş tek bir birleşimle en güvenli biçimde sağlanır; seçenekler ikinci aşamada motorla, ek dosya olmadan gelir. Anlaşılırlık panelde 65 yaş üstü dinleyiciyle sınanır (§E.4) |
| 6 | "Kaldığın yerden" kartı | `yol.md` §3.9: Ana sayfada 7 gün. `modul.md` §2.10: kütüphanenin üstünde, yalnız 15 ve 20 dk | **`modul.md`** | PLAN.v2 §E.1 kartı kütüphaneye koyar; 3 ve 5 dk'lık dersi ortasından sürdürmek karşılama–kapanış bütünlüğünü bozar |
| 7 | Akşam önerisi | `yol.md`: 20.00, "Akşam uyumadan önce dinliyorsan uyku dersi daha uygun olabilir." `modul.md` §10.3-d: 20.00, "Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir." | **`modul.md` metni** | Tek saat; dersin adı söylenir; "akşam" ile "uyumadan önce" aynı şeyi iki kez söylemez |
| 8 | Uygulama içi planlayıcı | `yol.md`, `modul.md`: `lib/yoga.js` planlayıcıyla aynı dosya. `uretim.md`: hazır karışımda gerekmez | **İlk yayında uygulamada planlayıcı yok** | Planlayıcı üretimde (Python) kalır. `lib/yoga.js` yol durağını, kaydı, görsel durumunu ve sabah sorusunu taşır. Planlayıcı ikinci aşamada motorla gelir |
| 9 | Boyut | `modul.md` G2: ≈ 165–180 MB (iki ses, ayrı izler). `uretim.md` §4: ≈ 110 MB (230 dk) | **≈ 113–125 MB** (AAC 64) | Tek ses; 7 × 3 + 10 × 5 + 10 × 15 = 221 dk, Ders 2'nin 20 dk'sıyla 241 dk, ayrıca ≈ 15–20 dk yardımcı dosya (§C.2) |
| 10 | İlk ders cümlesi | PLAN.v2 §A.1 ve `sure.md` §3.1: Varış'ın içinde, süreye dahil | **Ders başına kısa bir giriş dosyası** | Hazır karışımda her dosyanın iki sürümü gerekirdi. Kişinin ilk yoga dersinde ders ≈ 7 sn uzar (§D.3; cümle inceleme turunda düzeltildi) |
| 11 | Yoldaki pay | `uretim.md` §2.4, YOL.ilerleme okumasıyla: "her bölüm 3 dk, yürüyüşle gün aşırı" | **`yol.md`** | §B.1 |
| 12 | 30 dk metni ne zaman | `uretim.md` §8: metin 30 dk tasarımına göre yazılır. `sure.md` §6: 16–30 dk metni ikinci aşamada | **İskelet şimdi, 16–30 dk metni ikinci aşamada** (§A.4) | İnsan incelemesi yayına girecek metne yoğunlaşır; önek kuralı ≤ 15 dk planlarını korur |
| 13 | "Bitti" koşulu | PLAN.v2 başlık notu: cihazda 5 ve 30 dk | **Her dersin bütün yayımlanan süreleri, varsayılan sürüm dahil** (§E.7) | İlk yayında 30 dk yok; "5 ve 30 dk" koşulu ikinci aşamanın yayın kapısında (Kapı 11) geri gelir (sahibe görünür değişiklik) |
| 14 | Yol durağının bağımlılığı | `yol.md` §5: durak `ctx.progression` ile, yani (c) ile açılır | **Durak (c)'den bağımsız; ilk yayının koşulu** (§B.5, §E.7) | Sahibin bağlayıcı iş sırası "önce yoga, sonra sonsuz yol"dur; sahibi yogayı yolda istedi. Durak sayaçlarını kayıtlardan türetince ikisi birlikte sağlanır |

---

### A. Süreler ve ders blokları

#### A.1 Ders ders ilk yayın

| Ders | Duruş | Süreler (dk) | Varsayılan | 3 dk'nın çekirdeği | Not |
|---|---|---|---|---|---|
| 1 Nefesin Ritmi | oturarak | 3 · 5 · 15 | 5 | doğal nefesi fark etme → 4 sn al, 6 sn ver, ≈ 6 döngü, tutma yok → anahtar cümle | — |
| 2 Derin Dinlenme (Yoga Nidra) | uzanarak | 5 · 15 · 20 | 20 (karar 4 onaylanmazsa 15) | — | 5 dk'da Varış'ın kısa biçimi (§A.3) |
| 3 Uykuya Geçiş | yatakta | 5 · 15 | 15 | — | müzik kuyruğu sürenin dışında |
| 4 Zor Anlar İçin | oturarak, gözler yarı açık | 3 · 5 · 15 | 5 | yalnız dayanak: ayak tabanları, eller, odadaki sesler, üç uzun veriş, "huzursuzluk normal" cümlesi | duyguyu bedende bulma bloğu 3 dk'da yok; sonda 112 satırı |
| 5 Tek Nokta | oturarak | 3 · 5 · 15 | 5 | nefes çapası, iki kısa sessiz odak aralığı (≤ 18 sn), "Fark ettiğin an, zaten geri döndün." | — |
| 6 Sabah Niyeti | oturarak | 3 · 5 · 15 | 5 | doğal nefes ve oturarak omurga hareketi → tek kelimelik niyet | yolda yalnız 05.00–12.00 |
| 7 Kendine Şefkat | oturarak | 5 · 15 | 5 | — | uzanarak seçeneği ikinci aşamada |
| 8 Sağlam Yer | oturarak | 3 · 5 · 15 | 5 | oturarak dağ duruşu (0:38, istisna) → sakin iç ses | — |
| 9 Kendini Tanımak | oturarak | 3 · 5 · 15 | 15 | kısa beden taraması, bir kez "Dikkatin şimdi nerede?" | uzanarak seçeneği ikinci aşamada |
| 10 Gelecekteki Sen | oturarak | 3 · 5 · 15 | 5 | tek sahne, kişisel alan → küçük adım ve eğer-ise cümlesi (0:43, istisna); niyet son cümle | — |

Varsayılanlar PLAN.v2'nin "5 dk en çok dinlenecek sürüm gibi tasarlanır" ilkesine ve gerçek kullanıma dayanır: bir
RKÇ'nin tam metninde meditasyona özgü kullanım günde ortalama 3,36 dk idi; kullanıcıların %69,7'si günde 5 dakikanın
altında kaldı (Radin 2025, PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435)).
3 dk hiçbir dersin varsayılanı değildir; yoldaki kısa durak ve zor an içindir. Her dersin blok blok 3/5/15 çapa süreleri
`sure.md` §4'tedir (hepsi VARSAYIM; metin okutulunca ölçülen sürelerle yeniden hesaplanır).

#### A.2 3 dakika nasıl kurulur

İskelet (oturarak yapılan gündüz dersi; `sure.md` §3.1): giriş müziği 0:04 → Varış 0:30 → çekirdek 1:38 → Kapanış 0:48.
Metin ≈ 310–330 hece (≈ 130–140 sözcük; Ders 2'nin birimlerinde sözcük başına 2,36 hece), konuşma payı ≈ %41. Varış ve Kapanış'ın hecesi Ders 2'nin ölçülmüş kliplerinden
türetildi; çekirdek hecesi süre × pay × ölçülmüş brüt hız ile hesaplandı (Neslihan: rehberli 4,29, liste 3,80 hece/sn).
Bu bir **VARSAYIM modelidir** (±%15); ilk 3 dk metni okutulunca ölçülür.

Kurallar (hepsi planlayıcı testine girer; ayrıntı `sure.md` §3.2):
1. **Yalnız oturarak.** Uzanarak yapılan dersin kapanışı ölçülmüş sürelerle 1:42–1:44'tür; Derin Dinlenme'de Varış ile
   Kapanış tek başına 2:30–2:33 tutar. Yana dönme, oturma, bekleme ve kalkma adımları kısaltılmaz: 65 yaş üstünde ayağa
   kalkınca ilk anda görülen kan basıncı düşüşü, sürekli ölçümle havuzlanmış olarak %29 sıklıkta bulundu (Tran 2021, PMID
   34260686, DOI [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)).
2. **Kapaklar kendi kısa metinleriyle kurulur, sıkıştırılarak değil.** Kapanış sessizlikleri kısalmaz; kısalık,
   `short` biçimli kliplerden ve `minTarget` ile dışarıda kalan kliplerden gelir.
3. **Zaman verir:** her yönergeden sonra eylem süresi + en az 2 sn; çekirdekte en az bir 12–20 sn'lik nefes payı; 20 sn'yi
   aşan sessizlik yok.
4. **Tabanlar:** çekirdek blok ≥ 0:55, niyet ve yerleşme bloğu ≥ 0:20 (timing.py:111). İki istisna karar 4'tedir.
5. **Anahtar cümle bir kez;** başarısızlığı olağan sayan bir cümle bulunur.
6. **"-(y)abil-" sınırı:** herhangi bir 60 sn'de en çok üç (timing.py:103-104). 3 dk'da sınır iki uçtan daralır.
   Başta, ortak açılış cümlesi (`a.izin`) tek başına üç taşır; bu yüzden dersin kendi açılış cümlesi "-(y)abil-"siz bir
   kısa biçimle söylenir (Ders 1, 5, 6, 8, 9, 10) ve `a.izin`'den sonraki 60 sn'de (çekirdeğin ilk ≈ 30–45 sn'si)
   "-(y)abil-" olmaz. Sonda, oturarak yapılan kapanış Ders 2'nin klipleriyle kurulsa üç taşırdı (`k.nefes` "bulabilir",
   `k.hareket` "gerinebilirsin", `k.goz` "bakabilirsin"; render/units.json); üçü de 48 sn'ye girer ve çekirdeğin son
   ≈ 25 sn'sini kapatırdı. Kural: **3 dk Kapanış'ın metni en çok bir "-(y)abil-" taşır**; her dersin 3 dk kapanışında
   `k.nefes` ve `k.goz` karşılıkları "-(y)abil-"siz kısa biçimlerle yazılır. Metin yazarı ve inceleyiciler bu sınırı
   yazarken bilir; planlayıcı testi ayrıca denetler.
7. **Son 60 sn'de** nefes tutma, yeni imge ya da zor blok yok; çekirdeğin son klibi dönüş cümlesi ya da niyettir.
8. **Şafak:** gündüz kapanışında görsel şafak bugün en az 60 sn ister (timing.py:98); 3 dk'da 45 sn (karar 4).
9. **Zor blok 3 dk'da açılmaz:** duygu açan bloklar (Ders 4'te duyguyu bedende bulmak, Ders 7'de kendine dönüş) 3 dk'ya
   girmez, çünkü hemen ardından kapanış gelirdi.
10. **Alt küme:** 3 dk planı 5 dk planının alt kümesidir; 5 ile 15 dk arasında her plan bir sonraki dakikanın planının
    alt kümesidir (önek kuralı, timing.py:22). Planlayıcı testi bugün 5–30 dk'yı denetler (timing.py:65); ilk yayında
    3 dk da eklenir.
11. **Müzik:** 3 dk'da iki doku geçişi (Varış → çekirdek, çekirdek → Kapanış); dersin müzik teması aynı kalır.
12. **Kaynak kartında 3 dk'ya özgü etki cümlesi yoktur.** Bu dosyalarda 3 dakikalık bir oturumun etkisini sınayan çalışma
    yok; kısa farkındalık eğitimlerinde olumsuz duygulanımdaki etki, yayın yanlılığı düzeltilince g = 0,04'e indi
    (Schumer 2018, PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Kart yalnız Radin
    2025'in kullanım bulgusunu ve "Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık." cümlesini yazar.

#### A.3 Üç dersin 3 dakikası neden yok; Ders 2'nin özel durumu

- **Derin Dinlenme:** uzanarak yapılır; Varış + Kapanış 2:30–2:33, tek bir çekirdek blokla 3:23–3:27 (`sure.md` §2.3).
- **Uykuya Geçiş:** dersin özü ilgi çekici, tek sahneli imgelemedir. Dayanağı şudur: uykusuzluk yaşayan 41 kişilik
  kontrollü bir çalışmada, ilgi çekici bir imgeyle dikkat dağıtma talimatı alan grup, talimat almayan gruba göre daha
  kısa uykuya dalma süresi bildirdi (Harvey & Payne 2002, PMID 11863237, DOI
  [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2); ölçüm yöntemi özette yok). Böyle bir
  sahne 1:40'ta kurulamaz. Hiçbir süre için
  "uyutur" denmez: tek bir 30 dk'lık yoga nidra kaydı, sessiz uzanmaya göre uykuya dalma süresini değiştirmedi (Sharpe
  2023, PMID 36731199, DOI [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169)).
- **Kendine Şefkat:** öz-şefkat kademeli kurulur (tarafsız dayanak → "istersen" daveti → kısa süre → dayanağa dönüş).
  Travma yaşamış kişilerde öz-şefkati kendine yöneltmek tehdit tepkisi oluşturdu (Creaser 2022, PMID 35391975, DOI
  [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602)). Üç P1 blok tabanlarıyla 4:07 eder. Sığdırmak için
  bir blok çıkarılırsa ders ya adının karşılığını yitirir ya da geriye daha riskli, doğrudan kendine yönelen yol kalır.
- **Ders 2'nin 5 dakikası sınırdadır.** Ölçülmüş klip süreleri, planlayıcının üretim köşesindeki tahminden Neslihan'da
  %10,9, Hakan'da %5,5 uzun çıktı. Bu ölçümle 5 dk sürümün boş payı Neslihan'da 11,6 sn'ye iner; taban 15 sn'dir
  (timing.py:114). **Düzeltme (sormadan):** Varış'a 5 dk'ya özgü, ≈ 16 hece kısa bir biçim yazılır; sessizlik ve taban
  korunur. Tasarlanan ses seçilirse ve daha yavaş okursa bütün kısa sürüm bütçeleri yeniden hesaplanır.
- **Ders 2'de 20 dakika (karar 4):** zıtlık çiftleri bloğu ancak 19. dakikada girer (`sure.md` §5-4); pilot ders
  verisinin varsayılanı da 20'dir (`defaultMinutes: 20`, ders2.lesson.json:10). 20 dk, 15 dk takımına 18 klip ve
  653 karakter (232 hece) ekler (üç hız köşesinin hepsiyle hesaplandı; `v3calc/d2_20.py`).
- **Pilot kusurlarından çıkan metin kuralları:** çok cümleli birimde iki nokta kullanılmaz (kesim yanlış yerden
  bölünüyordu). Scribe denetiminde iki yazım farkı eş sayılır: "sırtüstü" gibi bitişik birleşik sözcüklerin ayrı yazımı
  ve ek-fiilin bitişik ya da ayrı yazımı (-(y)sA / ise, -(y)DI / idi, -(y)mIş / imiş; pilotta Hakan'ın `c2.yer`
  klibinde "nefesteyse" / "nefeste ise"). Liste Türkçe editörün onayından geçer.

#### A.4 30 dakikalık tasarım: şimdi ne yapılır, sonra ne gelir

- **İlk yayında sabitlenir:** her dersin 30 dakikalık iskeleti (blok listesi, giriş ve dolum sıraları, anahtar
  cümleler, imge yayı, müzik teması). Bu iskelet usta hocadan geçer. ≤ 15 dk'da (Ders 2'de ≤ 20 dk) çalabilecek bütün
  metin ve 3/5 dk kısa biçimleri yazılır, incelenir, seslendirilir.
- **İkinci aşamada gelir** (§F, Kapı 9–11; takvimi ve kredisi orada): 16–30 dk metni, 30 dk ve 3/5–30 arasında her
  dakikayı seçen kaydırıcı, çalışma anında karışım motoru, arka plan, sahne ve duruş seçenekleri, isteğe bağlı ikinci
  ses. Önek kuralı gereği yeni artımların sırası
  15 dk'nın durduğu sıranın üstünde kaldıkça ≤ 15 dk planları değişmez; bu, derleme testiyle denetlenir. İlk yayının
  onaylı dosyaları motorun **karşılaştırma ölçütü** olur: motor aynı dersi aynı süreyle çaldığında kaydı bu dosyayla
  örtüşmelidir.
- **Neden 30 dk ilk yayında değil:** Ders 2'de 30 dk, 15 dk takımında olmayan 79 klip ve 2.490 karakter ister (metin
  ≈ %62 büyür; `uretim.md` §6). Kilitli ekranda 30 dk kesintisiz çalma bu uygulamada doğrulanmadı. Sahibin sözü de
  "ilk etapta 3-5-15".

---

### B. Yol entegrasyonu

#### B.1 İki yol belgesi arasındaki çelişki ve çözüm

İki tasarım belgesi yoganın yoldaki yerini farklı yazıyor. YOL.ilerleme §5.13: "Bölüm n = merdiven basamağı n (1–10), her
bölüm 3 dk, yol payı 3; yolda günde tek bölüm, Yürüyüş ile `beden` döndürmesinde (gün aşırı)"
(docs/yol-haritasi/tasarim/YOL.ilerleme.md:264-265). YOL.moduller §4.6: yoga Keşfet'ten bir kez dinlenince yola girer,
"Yol bütçesi 5 dk sayar", meditasyonla `sessiz` dönüşümünde (YOL.moduller.md:598-608).

| Konu | YOL.ilerleme §5.13 | YOL.moduller §4.5–4.6 | Karar | Gerekçe |
|---|---|---|---|---|
| Yola giriş | gün belirtilmemiş | Keşfet'ten bir kez dinleyince | **3. gün** (kayıtlı gün sayısı ≥ 2, bugün sayılmaz; sayaç kayıtlardan, §B.5) | Sahibi "günlere göre" dedi; dinleme şartı girişi kişinin yogayı kendiliğinden bulmasına bırakır. 1. gün E testi ve kurulum, 2. gün okuma testi gelir ((c) ile Yılan ve Bugünün görevi de o gün açılır); 3. gün yeni durağı olmayan ilk gündür |
| Süre | her bölüm 3 dk | 5 dk | **Her gün 3, yaklaşık 8 günde bir 5** | Derin Dinlenme ve Kendine Şefkat'in 3 dk'sı yok. Her gün 5 dk, merdivenli benzetimde iki okuma gününde yoganın kendisini düşürüyor |
| "Bölüm" | merdiven basamağı 1–10 | ders | **Her gün bütün bir kısa ders; sıra sonsuz döner** (karar 5.2) | 30 dk'yı 3'er dakikalık on dilime bölmek her sürümün karşılama ve kapanışla bitmesi kuralını bozar; merdiven 10. günde biterdi, oysa yol sonsuz; 30 dk metni ikinci aşamada yazılır |
| Dönüşüm | yürüyüşle, gün aşırı | meditasyonla (`sessiz`) | **Yok** | Bir durak tek dönüşüm grubu taşır (`rotate` tek dizedir, lib/today.js:195); `beden` okuması benzetimde yürüyüşü 30 günün 13'ünde yoldan çıkarıyor. Meditasyon ayrı durak değil (karar 5) |
| Yolda yeri | belirtilmemiş | `practice`, `order: 97` | **2. bölümde göz duraklarından sonra, Bugünün görevi'nden önce; `order: 105`** | Yol sakin biter; uzanarak yapılan dersten sonra göz egzersizine dönülmez; kişi dersi 15 dk'ya uzatırsa yolun geri kalanı beklemez |
| Kayıt | `{ type: 'yoga', part, seconds }` | PLAN.v2 §E.4 | **PLAN.v2 §E.4** (§D.4) | Tek şema |
| Meditasyon | 15. günde açılır | 2. günden her gün 3 dk | **Meditasyon yolda ayrı durak değil; yolun sesli rehberli dersi yoganın kısa dersleri** | İkinci bir ses hattı ve ikinci günlük sakin durak gerekmez; meditasyonun 3 dk'lık `sefkat` parçası Kendine Şefkat'teki güvenlik sorununu taşır |

Sahibin son sözleri iki belgeyi de aşar (yazımı düzeltilerek): "yolda modül entegre olacak, günlere göre yoga modülleri
yollarda yer alacak" (yoga-pilot/SAHIP_ISTEKLERI.md:27-28) ve "sonsuz yolun içinde yoga bölümleri de parça parça yer alacak"
(docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:64-65). Bu planın okuması: her gün on dersten birinin kısa sürümü, bir
"parça" olarak yola girer; dersler günlere yayılır ve sıra sonsuz döner. Öbür okuma (bir dersin 30 dakikasının on
parçası, günde biri: tasarim/SAHIP_ISTEKLERI.md:5-7 ve YOL.ilerleme §5.13) ve iki okumanın sonuçları karar 5.2'de onayına
sunuluyor.

#### B.2 Kural

1. **Giriş:** uygulamada kayıt bırakılan (test ya da pratik) iki ayrı günden sonra; her gün açan kişide 3. gün. Gün
   atlayan kişide yoga, uygulamayı kullandığı 3. günde gelir. Sayaç kayıtlardan türetilir, (c)'yi beklemez (§B.5).
2. **Yer ve 20 dk sınırı:** 2. bölümde göz duraklarından (Yılan dahil) sonra, Bugünün görevi'nden önce. Yoga göz
   bütçesine sayılmaz ve düşme sırası (`dropRank`) taşımaz; bu yüzden bölümün göz payı dolunca yalnız göz durakları
   düşer, yoga düşmez (lib/today.js:220, :286). **Yoga hiçbir durağı yoldan çıkarmaz:** 20 dk sınırı önce yogasız yola,
   bugünkü düşme sırasıyla uygulanır (Yılan ve Hızlı Bakış, o günün Tek Bakışta ya da Fark Ettin mi? durağı, Bugünün
   görevi, Daire; lib/today.js:289-293 ve manifestlerdeki `dropRank`). Yoga ancak ondan sonra, yol 20 dk'yı aşmıyorsa
   eklenir; aşıyorsa o gün yolda olmaz, bugün Ana sayfadan yapılmış olsa da (R7b, §B.5). Örnek: Hızlı Bakış oynayan
   kişide okuma günü Hızlı Bakış da yoldaysa yol yogasız 18 dk'dır (Bugünün görevi dahil); 3 dk'lık yoga sığmaz, Hızlı
   Bakış yerinde kalır.
   Göz molası kilidinde yoga sıradaki durak olabilir.
3. **Süre:** kısa gün 3 dk. Altı kısa yoga gününden sonra, ölçüm olmayan ilk gün 5 dk'lık tam ders. Sayaç yoga günlerini
   sayar, takvim günlerini değil; gün atlamak tam dersi öne çekmez. Ana sayfadan 5 ya da 15 dk'lık bir ders tamamlanırsa o
   gün tam ders sayılır ve sayaç baştan başlar.
4. **Ölçüm günleri:** haftalık E testinin zamanı geldiği gün yoga yolda yoktur, o gün Ana sayfadan ders yapılsa da (E
   testi 5 dk'lık bir ölçümdür; 8., 15., 22. ve 29. günlerde yol yogasız da bugünkü yolla 19 dk, (c)'nin merdivenleriyle
   19–20 dk). E testi o gün yapılmazsa ertesi gün yoga yine gelir ("en çok bir gün"; okuma testindeki kuralın aynısı,
   lib/today.js:124-127). Okuma günü yoga 3 dk'dır; tam ders o güne düşmez.
5. **Ders seçimi:** o güne kadar en az tamamlanmış uygun ders; eşitlikte kütüphane sırası: 1, 2, 5, 7, 4, 6, 8, 9, 10
   (PLAN.v2 §A.3). Kısa günlerde yalnız 3 dk'sı olan yedi ders aday olur. Tam ders günleri bilerek 3 dk'sı olmayan iki
   derse ayrılır: kısa günlerde sayılmayan Derin Dinlenme ve Kendine Şefkat hep en az yapılmış ders olarak kalır, bu
   yüzden tam ders sırayla bu ikisidir (90 günlük benzetimde 10 tam dersin beşi Derin Dinlenme, beşi Kendine Şefkat).
   Böylece dokuz dersin hepsi yolda düzenli görünür; öteki yedi dersin 5 dakikası kütüphanededir. Tam dersin dokuz ders
   arasında dönmesi istenirse tam ders günlerinde 5 dk'lık tamamlamalar ayrı sayılır; o zaman Derin Dinlenme ve Kendine
   Şefkat yolda ≈ 70 günde bir görünür. Sabah Niyeti yalnız 05.00–12.00 arasında adaydır. Seçim gün içinde değişmez; tek
   istisna, sabah görünen Sabah Niyeti'nin öğleden sonra açılmasıdır: o zaman yerine sıradaki uygun ders gelir. Zor
   Anlar İçin ve Kendine Şefkat'in yolda kendiliğinden gelmesi klinik psikoloğun onayına bağlıdır; onaylanmazsa karar
   5.3'teki yedek kural uygulanır.
6. **Uykuya Geçiş sırada yoktur.** 20.00'den sonra yoldan açılan ders ekranında "Uyumadan önce dinliyorsan Uykuya Geçiş
   daha uygun olabilir." satırı ve geçiş düğmesi çıkar; tamamlanırsa durak da tamamlanır.
7. **15 dakikalık sürüm yolda durak olarak gelmez;** ders ekranında seçilip tamamlanırsa durak tamamlanır, yol bütçesine
   yine 3 ya da 5 yazılır.
8. **Uzun ara:** son yoga gününden 14 gün ya da daha uzun süre sonraki ilk gün ders 3 dk'dır, tam ders o gün gelmez.
9. **"Sonra yaparım":** yoldan açılan ders ayrıntısında bir düğmedir. Durak yerinde kalır, sıradaki durak onu atlar
   (Bugünün görevi açılabilir), yol "tamam" sayılır. Öteki duraklar bitince durak yine sıradakidir ve gece yarısına kadar
   açılabilir; gün bitince sessizce düşer, yarına taşınmaz (§B.5, `next` ve `allDone` ekleri).
10. **Nefes:** ilk yayında yolda bugünkü gibi 5 dk'dır (lib/breath.js:16, modules/breath/manifest.js:55-57). (c)
    geldiğinde YOL.ilerleme'nin kendi kuralı uygulanır: nefes merdiveninin son basamağı "5 (meditasyon açıldıysa 3)"
    (YOL.ilerleme.md:139); yolda yönlendirilen nefes en çok 3 dk olur, mola yine 5 dk'dır ve günde 5 dk'lık nefes Ana
    sayfada kalır (Balban 2023: günde 5 dk, 1 ay; uzun verişli nefeste olumlu duygulanımda meditasyondan fazla değişim,
    kaygıda gruplar arası fark yok; PMID 36630953, DOI
    [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)).
11. **Zor Anlar İçin yolda sırasıyla gelir** (klinik psikoloğun onayıyla; karar 5.3). 3 dk sürümü yalnız dayanak bloğudur; açılışı koşulludur ("Zor bir
    andaysan…"). Sonundaki satır yoldan açılınca da aynen çıkar; PLAN.v2'deki "Sık tekrarlarsa bir uzmanla konuşmak iyi
    olur." cümlesinin öznesi yok, ekranda tek başına görününce neyin tekrarladığı anlaşılmıyor. Önerilen biçim: "Zor anlar
    sık sık geliyorsa bir uzmanla konuşmak iyi olur. Acil durumda 112." (son biçim Türkçe editörün ve klinik psikoloğun
    onayıyla).
12. **Durakta sağlık iddiası yoktur;** kart yalnız ders adını ve süreyi yazar ("Yoga · Nefesin Ritmi · 3 dk").

#### B.3 Gün gün, 1–30 (yeni kullanıcı, 1 Ekim 2026'da başlar, gün atlamaz)

İlk yayının yolu **bugünkü kodla** benzetildi: canlı 20 manifestin who5 dışındaki 19'u (who5 Node'da yüklenmiyor;
`today()`'i olmadığı için yolu etkilemez) ve yoga durağı, `ctx.progression` yok, merdiven yok, Nefes 5 dk
(`v3fix2/sim_bugun_v4.mjs`; `today.js` §B.5'teki beş ekle). Kişi yolu her gün sırayla bitirir. Tablo üst değeri
verir: kişi Bugünün görevi'ni 1. gün yol dışında bir kez denemiştir (bugünkü kodda durak ancak bundan sonra yola girer,
modules/notice/manifest.js:30-32). "Yol dk": yolun bütçeye yazdığı toplam, yoga ile / yogasız; 10.00 ve 19.00'da aynı.
Süresi yazılmayan dersler 3 dk'dır.

| Gün | Ölçüm | Yoga, 10.00'da açan | Yoga, 19.00'da açan | Yol dk |
|---|---|---|---|---|
| 1 | E testi | — | — | 18 / 18 |
| 2 | okuma | — (henüz açılmadı) | — | 17 / 17 |
| 3 | — | Nefesin Ritmi | Nefesin Ritmi | 17 / 14 |
| 4 | — | Tek Nokta | Tek Nokta | 17 / 14 |
| 5 | — | Zor Anlar İçin | Zor Anlar İçin | 17 / 14 |
| 6 | — | Sabah Niyeti | Sağlam Yer | 17 / 14 |
| 7 | — | Sağlam Yer | Kendini Tanımak | 17 / 14 |
| 8 | E testi | — | — | 19 / 19 |
| 9 | okuma | Kendini Tanımak | Gelecekteki Sen | 20 / 17 |
| 10 | — | **Derin Dinlenme, 5 dk** | **Derin Dinlenme, 5 dk** | 19 / 14 |
| 11 | — | Gelecekteki Sen | Nefesin Ritmi | 17 / 14 |
| 12 | — | Nefesin Ritmi | Tek Nokta | 17 / 14 |
| 13 | — | Tek Nokta | Zor Anlar İçin | 17 / 14 |
| 14 | — | Zor Anlar İçin | Sağlam Yer | 17 / 14 |
| 15 | E testi | — | — | 19 / 19 |
| 16 | okuma | Sabah Niyeti | Kendini Tanımak | 20 / 17 |
| 17 | — | Sağlam Yer | Gelecekteki Sen | 17 / 14 |
| 18 | — | **Kendine Şefkat, 5 dk** | **Kendine Şefkat, 5 dk** | 19 / 14 |
| 19 | — | Kendini Tanımak | Nefesin Ritmi | 17 / 14 |
| 20 | — | Gelecekteki Sen | Tek Nokta | 17 / 14 |
| 21 | — | Nefesin Ritmi | Zor Anlar İçin | 17 / 14 |
| 22 | E testi | — | — | 19 / 19 |
| 23 | okuma | Tek Nokta | Sağlam Yer | 20 / 17 |
| 24 | — | Zor Anlar İçin | Kendini Tanımak | 17 / 14 |
| 25 | — | Sabah Niyeti | Gelecekteki Sen | 17 / 14 |
| 26 | — | **Derin Dinlenme, 5 dk** | **Derin Dinlenme, 5 dk** | 19 / 14 |
| 27 | — | Sağlam Yer | Nefesin Ritmi | 17 / 14 |
| 28 | — | Kendini Tanımak | Tek Nokta | 17 / 14 |
| 29 | E testi | — | — | 19 / 19 |
| 30 | okuma | Gelecekteki Sen | Zor Anlar İçin | 20 / 17 |

**Özet, 5 dk göz bütçesi.** 30 günde 24 yoga günü var (21 kısa, 3 tam ders). Yol en kısa 17, en uzun 20, ortalama
17,9 dk'dır (yogasız 15,3). Bugünün görevi'ni hiç denememiş kişide her gün 1 dk kısadır: ortalama 16,9 (yogasız 14,3).
Yol planının hedefi ≈ 15 dk'dır (YAPILACAKLAR.md:67; `PATH.targetMin`, lib/today.js:160); yoga olan her gün yol bu hedefi
aşar. Yoga ne bir durağı yoldan çıkarabilir ne de yolu 20 dk'nın üstüne taşıyabilir. Bu, benzetimin sonucu değil,
kuralın kendisidir (§B.2 kural 2, §B.5 R7b). Bu kullanıcıda 90 gün boyunca yoganın sığmadığı gün olmadı. Tablo, önceki
taslağın kuralıyla (`dropRank: 1.8`) koşulan benzetimle gün gün aynıdır (90 gün, iki saat, iki göz bütçesi). 19.00'da açan
kişide Sabah Niyeti hiç gelmez, sıra bir kayar. 90 günde 76 yoga günü ve 10 tam ders var: 10, 18, 26, 34, 42, 52, 60, 68,
76 ve 84. günler (8 günde bir; ölçüm günü araya girince 10), beşi Derin Dinlenme, beşi Kendine Şefkat. 90 günlük
ortalama 17,9 dk'dır ve hiçbir gün 20'yi aşmaz.

**Özet, 3 dk göz bütçesi** (hareket tutması öyküsü ya da profilde günde 6 saat ya da daha uzun ekran; eyeBudget.js:19, :98-99).
Bölümün göz payı 2 dk'dır (lib/today.js:245-246). Göz payı döngüsü yalnız `dropRank` taşıyan durakları düşürür
(lib/today.js:220, :286); yoga `dropRank` taşımadığı için 30 günün 24'ünde yoldadır. Yol ortalaması 14,9 dk (yogasız
12,3), en uzun 17 dk. Önceki taslakta yoganın `dropRank`'ı 1,8'di; o kuralla bugünkü kod yogayı bu kullanıcıda 30 günün
hiçbirinde yolda bırakmıyordu (`v3fix/sim_bugun_no286.mjs`).

**Hızlı Bakış oynayan kullanıcı** (1. gün Hızlı Bakış'ı bir kez oynamış ve Bugünün görevi'ni denemiş; `--hb --gorev`):
Hızlı Bakış haftada en çok üç gün 2. bölümün tek göz durağı olur (quick-look/manifest.js:9, :47; lib/today.js:249-254). Okuma
testi aynı güne düşünce yol yogasız 18 dk'dır; 3 dk'lık yoga sığmaz ve o gün yolda olmaz, Hızlı Bakış yerinde kalır.
30 günde 23 yoga günü var: ilk iki gün ve E testi günleri dışında yoga yalnız 9. gün yolda yok. 90 günde 72 yoga günü
var; bu fazladan yogasız günler 9, 51, 58 ve 65'tir. Yol ortalaması 30 günde
18,2, 90 günde 18,1 dk'dır (yogasız 15,7 ve 15,5); hiçbir gün 20'yi aşmaz. Önceki taslağın kuralıyla bu günlerde yoga
kalıyor, Hızlı Bakış düşüyordu (`inceleme2/sim_hb.mjs`: 90 günün 4'ünde). Bugünün görevi'ni denememiş Hızlı Bakış
oyuncusunda yol o gün 20 dk'ya sığar ve yoga 90 günün 76'sında yoldadır.

**Uzun ara.** 13.–28. günler atlanınca dönüş günü (29) E testi ve okuma birlikte gelir; yol yogasız 20 dk'dır, yoga
sığmaz ve o gün yolda olmaz (öteki duraklar yerinde kalır). Ertesi gün yoga 3 dk olarak geri gelir.

**(c) geldiğinde** (YOL.ilerleme §5 merdivenleriyle; henüz kodda yok, VARSAYIM; `v3fix2/yolsim_c_v4.mjs`): Nefes
merdiveni 1 dk'dan başlar ve 3 dk'da kalır (yogasız karşılaştırmada merdiven 5 dk'ya çıkar). 5 dk göz bütçesinde 30
günde 22 yoga günü var; iki okuma gününde (16 ve 30) yol, yoga durağı olmadan 18 dk olduğu için 3 dk'lık yoga sığmaz ve
o gün yolda olmaz (öteki duraklar yerinde kalır). Yol ortalaması 17,0 dk (yogasız 16,0); 30 günün 25'inde 15 dakikayı aşar (yogasız 23). 90 günde 70 yoga günü var; yol 85 günde 15 dakikayı aşar
(yogasız 83), ortalama 17,8 dk'dır (yogasız 16,9). 3 dk göz bütçesinde 30 günün 24'ünde, 90 günün 76'sında yoga var
(30 günde ortalama 14,6 dk). Önceki taslağın kuralıyla (`dropRank: 1.8`, `today.js`'e ek yok) bu kullanıcıda yoga 30
günün de 90 günün de yalnız 4'ünde yoldaydı (`v3fix2/yolsim_c_eski_kural.mjs`). 90. günden sonra YOL.ilerleme §8.6'daki
haftalık odak modülü yoga olduğunda, o hafta ölçüm olmayan her gün 5 dk'dır.

İki yan bulgu (yogadan bağımsız, ilerleme işinin konusu): YOL.ilerleme merdivenleriyle yol yogasız da 15 dk hedefinin
üstündedir (ortalama 16,0); Yılan 2. bölümün göz payına takılıp yogasız da 30 günün 21'inde düşer.

#### B.4 Özel durumlar

| Durum | Ne olur |
|---|---|
| Gün atlandı | Sıradaki ders bekler; ceza, sıfırlama, "seri bozuldu" ekranı yok |
| Ders yarıda bırakıldı | Tamamlanmadıkça durak tamam değildir; 15 ve 20 dk'lık derste "Kaldığın yerden" kartı kütüphanenin üstünde 7 gün durur; yol ertesi gün yine sıradaki dersi önerir |
| Ana sayfadan ders yapıldı | Bugün tamamlanan herhangi bir yoga dersi (Uykuya Geçiş dahil) yoldaki durağı tamamlar; E testi günü ya da yol yogaya yer bırakmıyorsa durak o gün yolda yoktur (aşağıdaki iki satır) |
| Gece yarısından sonra dinlenen uyku dersi | Yeni günün durağını tamamlar (gün anahtarı yerel takvim günü) |
| Uzun aradan dönüş, E testi ve okuma birlikte gecikmiş | Yol ağırdır; yoga ancak 20 dk'ya sığarsa gelir (benzetimde 16 günlük aradan sonraki gün yol yogasız 20 dk'ydı ve yoga gelmedi; öteki duraklar yerinde kaldı) |
| Yoga bugün Ana sayfadan yapılmış ve yol ağır | Yoga o gün yolda görünmez, öteki duraklar yerinde kalır (R7b tamamlanmış yogayı da ancak sığarsa yola koyar). Ders kayıtta, Gelişim'de ve yoganın sayaçlarında sayılır |
| E testi günü Ana sayfadan ders yapıldı | Yolda yoga yoktur (kural 4); ders kayıtta sayılır. Önceki taslakta tamamlanmış yoga bu gün yolda görünüyor ve 20 dk sınırı Yılan'ı, Daire'yi ve Bugünün görevi'ni düşürüyordu |
| Hızlı Bakış günü okuma testiyle çakıştı | Yol yogasız 18 dk'dır (Bugünün görevi dahil); 3 dk'lık yoga sığmaz, o gün yolda olmaz; Hızlı Bakış yerinde kalır |
| Hafif gün (YOL.ilerleme §13.4, (c) ile gelir; karar bekliyor) | Yoga 3 dk kalır |

#### B.5 Kod sözleşmesi

**(c)'den bağımsızlık.** Yoga durağı `ctx.progression`'a bağlı değildir. Sayaçlarını `ctx.sessions` ve `ctx.tests`'ten
kendisi türetir: bugünden önce kaydı olan ayrı gün sayısı, son yoga gününe uzaklık, son tam dersten beri kısa yoga günü
sayısı, ders başına tamamlama. Bu, `readingStatus`'un hiç yapılmamış okuma testinde kayıtların başladığı günü bulmak için
yaptığının aynısıdır (lib/today.js:141-142). Böylece durak ilk yayına girer ve senin iş sıran değişmez. (c) geldiğinde
durak aynı kalır; yalnız öteki durakların merdivenleri ve Nefes'in 3 dk kuralı eklenir (benzetimi §B.3'te).

```js
// lib/yoga.js (saf, belirlenimci): yol durağı. Taslak: yol.md §5.1; tek fark, sayaçlar ctx.progression'dan değil kayıtlardan
export const PATH_SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]      // PLAN.v2 §A.3; Uykuya Geçiş sırada yok
export function yogaCounters(sessions, tests, now) { /* { totalDays, gapDays, shortSinceFull, byLesson }; bugün sayılmaz */ }
export function pathYoga(ctx, lessonMin) { /* null | { lesson, minutes: 3|5, full, soft, night, done } */ }

// modules/yoga/manifest.js → today(ctx). Taslak: yol.md §5.2 (ctx.progression koşulu kalktı)
today(ctx) {
  if (!isIOSApp()) return null                   // ilk yayında yoga yalnız iPhone uygulamasında (lib/native.js:10; §D.7)
  const p = pathYoga(ctx, LESSON_MIN)            // LESSON_MIN: her dersin yayımlanmış en kısa dosyası
  if (!p) return null                            // < 2 kayıtlı gün, E testi günü (bugün yapılmış olsa da) ya da uygun
                                                 // yayımlanmış ders yok
  return { title: 'Yoga', sub: LESSONS[p.lesson].title, minutes: p.minutes, route: `yoga-${p.lesson}`,
           slot: 'practice', order: 105, glyph: 'lotus', done: p.done,
           yields: true,                         // dropRank yok: yalnız sığarsa yolda (R7b)
           later: Boolean(ctx.later?.later?.includes('yoga')),                 // "Sonra yaparım" (yalnız bugün)
           stage: { lesson: p.lesson, minutes: p.minutes, full: p.full, soft: p.soft, night: p.night } }
}
```

**"Sonra yaparım" kaydı.** YOL.ilerleme'nin tasarladığı bugünlük geçici kayıt kullanılır: `gozolcum:path-later`
anahtarında `{ day, later: [...] }`; gün değişince geçersizdir, `sessions`'a girmez, Nef'e gitmez (YOL.ilerleme.md:92-95,
:387, :430-431). İlk yayında `lib/pathLater.js` yalnız `loadLater` ve `markLater`'ı taşır; Home.jsx:162'deki `buildPath`
bağlamına `later: loadLater(now)` eklenir. Anahtar yoga manifestinin `storageKeys`'ine girer ki "Tüm verileri sil"
temizlesin. (c) geldiğinde aynı anahtar ve biçim `progressionCtx`'e taşınır.

**`lib/today.js`'e beş küçük ek** (her biri isteğe bağlı bir alana bakar; bugünkü manifestlerde davranış değişmez):
1. **`collect`** (lib/today.js:163; alan kopyası :178-205) bilinmeyen alanı düşürür; `later`, `stage` ve `yields`
   alanları eklenir.
2. **R7b** (lib/today.js:289-293, 20 dk sınırı): isteğe bağlı `yields` alanı. Döngü toplamı `yields` taşıyan duraklar
   olmadan hesaplar; bugünkü düşme sırası (`dropRank` 1–3, `dropOne` :216-227) aynen işler. Döngüden sonra toplam
   `yields` duraklarla 20 dk'yı aşıyorsa bu duraklar, tamamlanmış olsalar da, o gün yoldan çıkar. Yoga `yields: true`
   taşır, `dropRank` taşımaz. Sonuç: yoga hiçbir durağı düşürmez, yoga yüzünden yol 20 dk'yı aşmaz. Göz payı döngüsü
   (:286) de yalnız `dropRank`'lı durakları düşürdüğü için (:220) yogaya dokunmaz; 3 dk göz bütçesinde yoga 2. bölümde
   kalır. Önceki taslaktaki R7a eki (göz payı döngüsüne süzgeç; yoga `dropRank: 1.8` taşıdığı için gerekiyordu) bu
   yüzden kalktı. Bugünkü manifestlerin hiçbiri `yields` taşımadığı için ek bugünkü yolu değiştirmez (aşağıda
   eşdeğerlik). Ekin kopyası: `v3fix2/today_v4.js`.
3. **R5** (lib/today.js:294-298): bugün açık uçlu durağı bölümün en sonuna taşır. Ek kuralla açık uçlu durak son **göz
   bütçeli** durağın arkasına gelir, yoga ondan sonra kalır. Eksiz sıra "Göz kırpma · Yoga · Yılan" olurdu.
4. **`next`** (lib/today.js:322) `later` işaretli durağı atlar (YOL.ilerleme §11.2'deki ekin aynısı; hepsi `later` ya
   da bitmişse eski davranış). Ek olmadan yoga için "Sonra yaparım" denince sıradaki durak yine yoga kalır. `canOpen`
   yalnız bitmiş ya da sıradaki durağı açtığı için (:367-370) Bugünün görevi yoldan açılamaz; yol "tamam" görünürken akşam
   raporu kilitli kalırdı (`v3fix/later_v3.mjs`: eksiz `allDone true | next Yoga | Bugünün görevi açılır mı false`, ekle
   `next Bugünün görevi | açılır mı true`; son ek takımıyla aynı sonuç: `v3fix2/later_v4.mjs`).
5. **`allDone`** (core :326, allDone :327) `later` işaretli durağı beklemez.

**Eşdeğerlik.** Beş ekin kopyası (`v3fix2/today_v4.js`), yoga modülü olmadan, bugünkü `today.js` ile, canlı 20
manifestin who5 dışındaki 19'uyla (who5 Node'da yüklenmiyor; `today()`'i olmadığı için yolu etkilemez) 20.000 rastgele
bağlamda karşılaştırıldı (test ve oturum geçmişi, 3 ve 5 dk göz bütçesi, kilit ve dolma, nöbet cevabı, abonelik kapısı).
Durak listesi, bölümler, süreler, sıradaki durak, `allDone`, `minutesLeft`, mola ve kilit işaretleri **0 farkla** aynı
(`v3fix2/esdeger_v4.mjs`). Yoga modülü eklenince (`v3fix2/esdeger_yoga_v4.mjs`, aynı 20.000 bağlam, rastgele yoga
kayıtlarıyla) yoga dışındaki duraklar (anahtar, bölüm, süre, tamamlanma, kilit) yine **0 farkla** aynıdır: yoga hiçbir
bağlamda bir durağı düşürmez. Yoga bu bağlamların 4.481'inde yoldadır. Önceki taslağın kuralıyla 8.863'ündeydi, ama
3.614'ünde başka bir durağı düşürüyordu. Yoganın artık yolda olmadığı 4.382 bağlamın 3.997'sinde yogasız yol 20 dk'ya
yoga kadar yer bırakmıyor, 383'ünde yogasız yol zaten 20'yi aşıyor, 2'si E testi günüdür (`v3fix2/esdeger_kiyas_v4.mjs`).
Rastgele bağlamlar gerçek günlerden ağırdır; her gün açan kullanıcının 90 günlük benzetiminde yoga günleri değişmedi
(§B.3).

**Testler.** `lib/today.test.js` ve `components/TodayPath.test.jsx` yolu `registry.live` ile kuruyor
(lib/today.test.js:10, :67, :71, :76, :82; components/TodayPath.test.jsx:16) ve bazı beklentiler durak listesini birebir
yazıyor (ör. lib/today.test.js:68, :77). Test ortamında `isIOSApp()` yanlış olduğu için yoga durak üretmez; bu testler
değişmeden yeşil kalır (testler web'i varsayar; ör. notifyApply.test.js:3-4). Yoga testleri `isIOSApp`'i taklit eder. `modules/registry.test.js:8`'deki modül listesine `yoga`
eklenir. Yeni testler, `yol.md` §5.6'daki listeye ek olarak:
- Web'de (`isIOSApp()` yanlış) `today()` `null` döndürür ve Pratikler listesinde yoga kutucuğu yoktur.
- Kalıcı eşdeğerlik testi: aynı bağlamda yogalı yolun yoga dışındaki durakları yogasız yolla birebir aynıdır (E testi
  günü, okuma günü, Hızlı Bakış günü, uzun aradan dönüş, 3 ve 5 dk göz bütçesi).
- Hızlı Bakış + okuma günü (Bugünün görevi yolda): yogasız yol 18 dk; yogalı yolda Hızlı Bakış yerinde, yoga yok.
- E testi günü Ana sayfadan 15 dk yoga yapılmış: yolda yoga yok; Yılan, Daire ve Bugünün görevi yerinde (yol 19 dk).
- Sınır: yogasız yol 17 dk iken 3 dk'lık yoga eklenir, 18 dk iken eklenmez; tamamlanmış yoga da 20'yi aşacaksa yolda
  görünmez.
- `ctx.eye.budgetMs` 3 dk iken yoga 2. bölümde kalır; aynı bağlamda Yılan ve o günün Tek Bakışta ya da Fark Ettin mi?
  durağı düşebilir.
- Yoga `later` iken `next` Bugünün görevi'dir, `canOpen` onu açar ve `allDone` doğrudur; öteki duraklar bitince `next`
  yine yogadır.
- `ctx.progression` olmadan: 1. ve 2. kayıtlı günde yoga yok, 3. günde var; E testi gününde yok; altı kısa günden sonra
  5 dk; 14 günlük aradan sonra 3 dk.
- Yalnız Ders 2 yayımlıyken kısa günde durak yoktur (3 dk'lık ders yok); Ders 1 ve 5 yayımlanınca gelir (Kapı 4 ve 5,
  §F).

`TodayPath.jsx`'e yeni `lotus` çizimi ve alt satır (ders adı · süre) eklenir (`yol.md` §5.4).

---

### C. Üretim

#### C.1 Teslim biçimi: hazır karışım

Her ders × süre için tek bir hazır karışım ses dosyası ve aynı hesaptan çıkan bir `timeline.json` üretilir. Pilot zaten
böyle üretildi: `render/tools/mix.py`, motorun kurallarını çevrimdışı uygulayan bir karıştırıcıdır.

Gerekçe:
- **"Ses asla kesilmez" yayından önce dosyada kanıtlanır.** Süre, her konuşma parçasının kendi yerinde bulunması, tık,
  dijital sessizlik ve konuşma/yatak farkı son dosyada ölçülür (§E.3). Motor yolunda aynı güvence, bu ortamda
  derlenemeyen ve cihazda hiç denenmemiş bir yerel koda bağlı kalırdı.
- **Oynatıcı, uygulamanın bugün kilitte çalan oynatıcısıyla aynı sınıftır:** uyku sesi AVAudioPlayer ile çalıyor
  (ios/App/App/AlarmPlugin.swift:244-248), arka planda çalma izni var (ios/App/App/Info.plist:56-59).
- **Uygulamada planlayıcı gerekmez;** yeni yerel kod küçüktür (§D.3).
- **Onaylı dosyalar ikinci aşamanın motoruna karşılaştırma ölçütü olur** (§A.4).

İlk yayında bu yüzden olmayanlar ve karşılıkları:

| Olmayan | İlk yayında | Ne zaman |
|---|---|---|
| Ses seçimi | Sahibin seçtiği tek hoca sesi | İkinci ses, istenirse indirilebilir ek olarak |
| Arka plan seçimi (Müzik · Doğa · Sessizlik) | Her derste tasarlanmış tek ses manzarası (müzik; derste varsa doğa katmanı) | İkinci aşama, motorla |
| Sahne seçimi (Ders 2) | Orman (pilotta üretilen) | Kıyı, ikinci aşama |
| Duruş seçimi (Ders 7, 9) | Oturarak | Uzanarak, ikinci aşama |
| Netlik anahtarı, konuşma/müzik dengesi | Tek karışım; anlaşılırlık panelde 65 yaş üstü dinleyiciyle sınanır, gerekirse bütün karışımlarda eşik yükselir (§E.4) | İkinci aşama, motorla |
| Dönüşümlü açılışlar (Ders 2'de `a.acilis`, `n1.sec`) | Biri dosyada sabit | İkinci aşama |

#### C.2 Dosya takımı, biçim, boyut ve dağıtım

**Dosyalar (1 ses):** 7 × 3 dk + 10 × 5 dk + 10 × 15 dk = 221 dk; Ders 2'nin 20 dk'sıyla 241 dk. Ayrıca ≈ 15–20 dk
yardımcı dosya (VARSAYIM): ders başına kısa giriş (ilk ders cümlesi), açılış izni (kaldığın yerden sürdürmek için),
sesli dönüş (durdurma ekranı), imge ya da zor bloklar için bırakma ön klipleri; Uykuya Geçiş için döngülenen müzik kuyruğu;
ilk derste çalan 10 sn'lik ses denetimi. Her dosyanın yanında `timeline.json` (pilotta 15 dk için ≈ 73–76 kB).

**Biçim:** ana kopya 44,1 kHz stereo WAV, depo dışında (sahibin Mac'i ve bulut, iki kopya). Uygulama dosyası m4a içinde
AAC-LC; bit hızı kör kodek testiyle seçilir: AAC-LC 64 pilot MP3'ünden ayırt edilemezse 64, edilirse 96 (§E.4). HE-AAC
seçilmez: düşük bit hızında yumuşak, sessiz müzikte yapay tını riski taşır (VARSAYIM). Değişken bit hızlı MP3 kullanılmaz: klip başından sürdürme ve görsel uyum kesin konum ister. Bu ortamda
AAC üretilemiyor (ffmpeg ve afconvert yok); kodlama ve kodlanmış dosyanın yeniden ölçümü sahibin Mac'inde tek bir
betikle yapılır.

**Boyut** (1 ses; bütün değerler ondalık MB, 1 MB = 1.000.000 bayt). Alt uç: 221 dk + 15 dk yardımcı dosya = 236 dk
(Ders 2'ye 20 dk eklenmezse); üst uç: 241 dk + 20 dk yardımcı dosya = 261 dk. AAC satırları bit hızından (64 kbit/sn =
8.000 bayt/sn = 0,48 MB/dk); MP3 satırı pilotun ölçülen dosyalarından (15 dk'da 12.384.385–12.800.641 bayt):

| Biçim | MB/dk | Ses dosyaları (236–261 dk) | Ses ve model dosyaları toplamı (bugün 82,2 MB; IPA'nın tamamı değil) |
|---|---|---|---|
| **AAC-LC 64 (kodek testini geçerse)** | 0,48 | **≈ 113–125 MB** | **≈ 195–207 MB** (kısılma MP3'leri çıkınca ≈ 188–200) |
| AAC-LC 96 | 0,72 | ≈ 170–188 MB | ≈ 252–270 MB (≈ 245–263) |
| MP3 ABR 120 (pilot) | 0,83–0,85 | ≈ 195–223 MB | ≈ 277–305 MB |

Bugünkü 82,2 MB bu görevde bayt olarak ölçüldü (`du -sb`): `app/public` 56.265.717 bayt (mediapipe-wasm 35,4 MB, uyku
sesi 16,0 MB, `voice` klasörü 4,8 MB) ve iOS `Sounds` klasörü 25.931.208 bayt. Önceki sürümdeki "≈ 80 MB", `du -h`'nin
MiB değerleriydi (54M + 25M); ses dosyaları ise ondalık MB ile hesaplanmıştı, yani iki birim toplanmıştı. iOS
projesindeki `ios/App/App/public` kopyası (36,7 MB) 25–26 Eylül'de eşitlenmiş eski bir kopyadır (uyku sesi ve `voice`
klasörü içinde yok); hesapta kullanılmadı. Tabloya girmeyenler: derleme çıktısındaki JS ve CSS
(`dist/assets` 2,3 MB), 28 dosyanın `timeline.json`'ı (pilotta 15 dk'lıklar 72.675–75.589 bayt; toplam ≈ 1 MB, VARSAYIM)
ve uygulamanın ikili dosyası (ölçülmedi). iOS'ta çalınmayan uyku kısılma MP3'leri (altı dosya, 7.564.643 bayt;
`public/sleep/sakin-fade-*.mp3`) paketten çıkarılabilir (ayrı iş; yalnız iOS paketinden, çünkü web oynatıcısı ve
`dalgaSleep.test.js:65` onları `public`'te bekler). App Store'un hücresel indirme eşiği bu çalışmada doğrulanmadı;
bilinen değer 200 MB'tır (VARSAYIM). **Sonuç:** AAC 64'te ses ve model dosyaları ≈ 195–207 MB tutar; kısılma MP3'leri
çıkınca ≈ 188–200 MB'a iner. Bu, eşiğin tam sınırıdır: JS, `timeline.json` ve ikili dosya eklenince eşik aşılabilir. AAC
96'da toplam ≈ 252–270 MB'tır (MP3'ler çıkınca ≈ 245–263 MB) ve eşik kesin aşılır. Gerçek indirme boyutu bu yüzden
erken ölçülür: kodek testinden sonra, seçilen bit hızında ve son toplam sürede (236–261 dk) yer tutucu ses dosyalarıyla
bir TestFlight derlemesi yapılır ve App Store Connect'in bildirdiği indirme boyutu okunur (§F, C adımı). Yer tutucular
gerçek sesle, Ders 2'nin kodlanmış karışımlarından doldurulur; sessiz dosya kullanılmaz, çünkü değişken bit hızında
gerçek boyutu vermez. Karar 6 Kapı 4'te bu ölçümle verilir.

**Dağıtım: hepsi pakette** (öneri; eşik aşılırsa karar 6). Ağ yok, sunucu yok, gizlilik akışı yok; ders uçak kipinde de çalar ve
"asla kesilmez" ağa bağlı değildir. İndirme altyapısı bugün yok (`@capacitor/filesystem` yok, Supabase Storage kullanılmıyor; `uretim.md`
§3). İkinci aşamada boyut büyürse indirme, `uretim.md` §5'teki gizlilik kurallarıyla (içerik özetinden dosya adı, tek
paket, kimliksiz istek, bütünlük denetimi, akışla çalma yok) planlanır.

**Depo:** `app/public` altındaki dosyalar depoya girer (Git LFS yok). Bu yüzden depoya yalnız onaylanmış son dosyalar,
parti başına bir kez girer; ham çekimler ve WAV ana kopyalar depo dışında kalır.

**Nef sunucusu (Vercel) ve yoga dosyaları:** Nef sunucusu `app/` klasöründen yayımlanıyor (YAPILACAKLAR.md:131-132: 499
dosya). `app/.vercelignore` `public` altında yalnız `mediapipe-wasm`'ı dışarıda bırakıyor. Yoga dosyaları `public/yoga`'ya
girdikten sonra sunucu yeniden yayımlanırsa (§D.8'deki istem satırı için gerekir) ≈ 113–125 MB'lık ses Vercel'e yüklenir;
proje yapı çıktısını da sunuyorsa (VARSAYIM) dosyalar herkese açık adreslerden, abonelik kapısı (§D.7) atlanarak
indirilebilir. Bu yüzden `.vercelignore`'a `public/yoga` satırı eklenir ve Kapı 8'den önce Vercel dağıtımının dosya
listesinde yoga dosyası olmadığı denetlenir.

#### C.3 Kredi: ölçülmüş birim maliyetle

**Pilotta harcanan (defter satır satır toplandı; 1 kredi = 0,01818 sent, yani 5.500 kredi = 1 USD, MCP çalışma alanının
oranı):**

| Kalem | Kredi | Sent | Fiyatın durumu |
|---|---|---|---|
| Konuşma (TTS, `eleven_v4`, birim başına 3 çekim), Neslihan, 73 satır | 12.381,5 | 225,17 | tahmin fiyatı; **gerçek fiyatla uzlaştırılmadı** |
| Konuşma, Hakan, 71 satır | 11.770,4 | 214,05 | aynı |
| Scribe, konuşma doğrulaması | 4.488,4 | 81,61 | gerçek (5,5 kredi/sn) |
| Müzik (7 parça, 1.620 sn) | 24.294,6 | 441,72 | gerçek (15,0 kredi/sn) |
| Doğa ve dönüş tınısı | 413,3 | 7,51 | gerçek |
| Scribe, müzikte vokal denetimi | 9.592,0 | 174,40 | gerçek |
| **Toplam (399 satır)** | **62.940,3** | **1.144,46 (11,44 USD)** | |

**Birim değerler:** konuşma (3 çekim, pilot oranında yeniden çekim ve Scribe dahil) 3,47–3,62 kredi/karakter; müzik
15,0 kredi/sn, vokal denetimi 5,5 kredi/sn. Ders başına müzik: alt uçta 1.200 sn müzik ve aynı süre denetimle 24,6 bin;
üst uçta pilotun gerçek toplamı, yani 1.620 sn müzik ve 1.744 sn vokal denetimiyle 33,9 bin kredi (denetlenen saniye,
üretilen müzik saniyesinden fazladır). Ders 2'nin 15 dk birim takımı 68 birim, 4.042 karakter, 1.405 hecedir.

**Kapsam:** Ders 2'nin 15 dk birimleri iki seste hazır. Ders 2'ye yalnız 5 dk kısa biçimleri (194 karakter), 20 dk'nın
ek birimleri (653 karakter) ve yardımcı klipler eklenir. Kalan dokuz ders baştan üretilir. Ders başına metin: alt uç
Ders 2'nin ölçülen takımı + kısa biçimler + 3 dk metni (3 dk'sı olan derslerde 4.666, olmayanlarda 4.236 karakter); üst uç
PLAN.v2 §B.4.1 metin bütçesinin Ders 2'de ölçülen oranla ölçeklenmesi (5.040–7.553 karakter). Müziği ElevenLabs'ten gelen
her ders için yatak takımı ayrıca üretilir; bir dersin 3, 5 ve 15 dk'sı aynı yatakları kullanır, dersler arasında yatak
paylaşılmaz ("her ders benzersiz").

| Senaryo (1 ses) | Çekirdek kredi | + tasarlanan ses adayı + %15 düzeltme payı | + Ders 2'nin 20 dk'sı için ek müzik (≤ ≈ 6 bin) |
|---|---|---|---|
| **ElevenLabs müziği (9 ders)** | **≈ 370–530 bin (≈ 67–96 USD)** | **≈ 405–575 bin (≈ 74–105 USD)** | **≈ 405–581 bin (≈ 74–106 USD)** |
| Karma: bordun ya da ton imzalı Ders 1, 4, 5, 8 uygulama hattından, 3, 6, 7, 9, 10 ElevenLabs | ≈ 270–390 bin (≈ 49–71 USD) | ≈ 305–440 bin (≈ 56–80 USD) | ≈ 305–445 bin (≈ 56–81 USD) |
| Dalga motoru müziği | ≈ 150–220 bin (≈ 27–40 USD) | ≈ 185–270 bin (≈ 33–49 USD) | gerekmez |

Üç senaryoda da ses tasarımı önizlemeleri ayrıca eklenir; fiyatları doğrulanmadı. İlk önizleme çağrısının gerçek fiyatı
deftere yazılınca tahmin güncellenir.

Bileşenler (ElevenLabs senaryosu): dokuz dersin konuşması 142,6–216,8 bin; Ders 2'nin eki (5 dk kısa biçimleri ve
20 dk birimleri) 2,9–3,4 bin; dokuz dersin müziği 221,4–305,0 bin; doğa ≈ 2,2 bin. **En büyük kalem müziktir.** Tasarlanan ses adayı (Ders 2'nin 15 dk'sı) 14,0–14,6
bin + ses tasarımı önizlemeleri (maliyeti doğrulanmadı); düzeltme payı konuşmanın %15'i, 21,8–33,0 bin (VARSAYIM).
Yardımcı kliplerin konuşması (ilk ders cümlesi, sesli dönüş; her derste aynı metin) ≈ 1 bin tutar ve düzeltme payından
karşılanır (VARSAYIM).

**Partiler** (1 ses + ElevenLabs müziği): Parti 1 (Ders 1, 3, 5) ≈ 121–166 bin · Parti 2 (Ders 4, 7, 8) ≈ 121–178 bin ·
Parti 3 (Ders 6, 9, 10) ≈ 122–178 bin. Partinin kendi konuşmasının %15 düzeltme payıyla: Parti 1 ≈ 128–175 bin, Parti 2
≈ 128–190 bin, Parti 3 ≈ 130–190 bin (`v3calc/kredi.py` ile; Parti 2'nin üst ucu 21.095 karakter × 3,618 = 76,3 bin
konuşma, payı 11,4 bin). Parti tavanı bu yüzden 195 bindir (karar 3). Sıra PLAN.v2 §F.2'dir: ilk parti gece dersini ve nefes–görsel kilidini içerdiği
için önce gelir.

**Tabloya girmeyenler:** tam karışımın Scribe ile yazıya çevrilmesi. Pilot oturumunda yerel dosyayı yükleme aracı
yoktu (report.md:151). Yükleme yolu bulunsa bile 241 dk × 60 × 5,5 kredi/sn ≈ 80 bin kredi tutar ve ≈ 581 binlik üst
tahminle birlikte 600 binlik toplam tavanı aşar. Bu yüzden tam karışım yazıya çevrilmez; yerine parça konum denetimi
yapılır (§E.3) ve bu değişiklik SPEC v3'e yazılır (§F, B adımı). Ders 2'nin 20 dk'sı için ek müzik (≤ ≈ 6 bin, VARSAYIM)
artık tabloda. İkinci aşama (30 dk; kaba tahmin, VARSAYIM): konuşma ≈ 86–148 bin, ElevenLabs müziği kullanılırsa
≈ 185 bin, konuşmanın %15 payıyla toplam ≈ 285–355 bin (≈ 52–65 USD; `uretim.md` §6; §F, Kapı 9–11).

**Tavanlar (karar 3):** parti başına 195 bin, toplam 600 bin kredi (≈ 109 USD). Toplamın üst tahmini ≈ 581 bin ve
fiyatı bilinmeyen önizlemelerdir; aradaki ≈ 19 bin önizlemelere ve Ders 2'nin inceleme sonrası yeniden
seslendirilmesine ayrılır (VARSAYIM). İkinci aşamanın tavanı ayrıca sorulur.

**Karşılaştırma:** PLAN.v2 on dersin tamamı için 753 bin – 1,17 milyon kredi öngörmüştü (iki ses, 5–30 dk). Pilot, öngörülen
123–141 bin yerine 62,9 bin tuttu (yalnız 15 dk; müziğin gerçek fiyatı tahminin %55'i).

#### C.4 Üretim hattı (her ders için aynı)

1. **Metin:** 30 dk iskeletine göre; ≤ 15 dk'da çalabilecek bütün birimler ve 3/5 dk kısa biçimleri. Model ilk denetimi
   yapar; sonra üç insan incelemesi (§E.1) **seslendirmeden önce** biter.
2. **Planlar:** her süre için pilot planlayıcısıyla, model hızıyla değil **seçilen sesin ölçülmüş süreleriyle** kurulur
   ve bütün plan denetimlerinden geçer (§E.3).
3. **Seslendirme:** `eleven_v4`, birim başına 3 çekim (`generations_count` her çağrıda açıkça 3; verilmezse varsayılan 4);
   ham dosyalar hemen indirilir (imzalı adresler 2 saat geçerli). Çekim sayısı düşürülmez: en iyi okuma, birimlerin
   Neslihan'da %31'inde, Hakan'da %25'inde üçüncü çekimdi.
4. **Seçim:** nesnel sıralama + Scribe ile harf harf eşleşme + en çok bir yeniden çekim (§E.2).
5. **Müzik:** dersin kendi imzasıyla; düzlük, vuruşsuzluk, döngü eki ve vokal denetimleri. Dalga ya da karma seçilirse
   ilgili dersler uygulamanın müzik hattından.
6. **Karışım:** her süre için hazır karışım + `timeline.json`; bütün ölçümler (§E.3).
7. **Kodlama (Mac):** AAC; kodlanmış dosya çözülüp aynı ölçümlerden yeniden geçer.
8. **Rapor:** pilotun `report.md` biçiminde; kulak listesi inceleyiciye gider. Rapor temiz değilse dosya sahibe gitmez.

**Araç işleri (kredisiz):** `render/tools/mix.py` ve `pilot/timing.py` bugün Ders 2'ye bağlı; ders, süre, ses ve müzik
kaynağı parametre olur, Ders 2'ye özgü sabitler ders verisine taşınır, 3 dk kuralları ve denetimleri eklenir (`sure.md`
§8'deki liste: `minutes.min`, `short` listesi, 3 dk tabanları, şafak, hızlı kapanış, T6 ve test dakikaları). Scribe
normalleştirmesine birleşik sözcük ve ek-fiil yazımı kuralları (§A.3), kesim kuralına "iki nokta değil, cümle sonu"
kuralı eklenir.

#### C.5 Bütçe denetimi

Her parti başlamadan tahmin edilir ve onaylı tavanla karşılaştırılır (karar 3). Her ücretli çağrı önce deftere yazılır;
her çağrıdan sonra gerçek fiyat okunup uzlaştırma satırı yazılır, **TTS dahil** (pilotta TTS uzlaştırılmadı). Tavan
aşılacaksa durulur ve rapora yazılır. Tahmin yanıtlarına güvenilmez: pilotta Scribe'ın tahmini gerçeğin 16 katı düşüktü,
müziğin tahmini ise gerçeğin ≈ 1,8 katıydı (`uretim.md` §1).

---

### D. Uygulama modülü

Ayrıntılar `modul.md`'dedir; burada yalnız ilk yayının kesin hâli ve §2.0'daki seçimlerin modüle etkisi var.

#### D.1 Kapsam

| Konu | İlk yayında |
|---|---|
| Dersler | On ders; bir ders ancak §E.7'deki dört koşulu geçince görünür (ders verisinde süre başına `published`) |
| Süreler | §A.1; kaydırıcı yok; ders içinde bölüm işaretli ilerleme çizgisi ve bölüme atlama var |
| Ses ve arka plan | Tek hoca sesi; derste tasarlanmış tek ses manzarası |
| Oynatıcı | Kilit ekranında çalma, Now Playing, duraklat/sürdür, kapanışa geç, durdur, sarma, altyazı |
| Görsel | Her derse özgü tek "nefes formu"; Hareketi Azalt'a uyar; yanıp sönme yok |
| Ölçüm | Önce ve sonra puanı (1–10), zorlanma sorusu, Uykuya Geçiş için ertesi sabah sorusu |
| Gelişim ve Nef | `modul.md` §7–§9; ders başına alan (§D.5) |
| Yol | §B |
| Platform | Yalnız iPhone uygulaması; web sürümünde yoga kutucuğu, yol durağı ve Nef önerisi yok (§D.7) |

#### D.2 Ekranlar

Akış: Ana sayfa → Pratikler → "Yoga" kutucuğu → kütüphane → ders ayrıntısı → (ilk kez: güvenlik kartı ve 10 sn'lik ses
denetimi) → önce puanı → oynatıcı → sonra puanı ve zorlanma sorusu → bitiş. Yoldan açılan ders aynı ekranlardan geçer,
süresi yolun süresiyle hazır gelir. Ekranların metinleri ve kuralları `modul.md` §2'dedir; ilk yayındaki değişiklikler:

- Ders ayrıntısında **ses, arka plan, sahne ve duruş seçimleri ile netlik anahtarı yoktur.** Kalanlar: ad ve söz, süre
  çipleri, bölüm şeridi (yalnız o sürede gerçekten çalan bölümler), hazırlık kartı (uzanarak yapılan derslerde), uyku
  dersinde "Ders bitince müzik: Kapalı · 5 dk · 10 dk · 20 dk", Kaynaklar kartı, "Başla"nın üstünde açılış satırları,
  akşam satırı.
- **Ses denetimi** ilk derste, "Başla"dan önce 10 sn: seçilen sesle, Derin evre düzeyinde üç kısa sözcük. Soru: "Sözcükleri
  rahatça seçebildin mi?" Evet · Hayır · Atla. "Hayır" cevabında: "Sesi biraz açıp yeniden dene; kulaklık da
  kullanabilirsin." Netlik anahtarı olmadığı için anlaşılırlık yayından önce panelde güvenceye alınır (§E.4).
- **Ad (PLAN.v2 G8-b):** kütüphane başlığı "Yoga ve Meditasyon"; 320 px'te sığması gereken kutucuk ve yol durağı "Yoga".
- Güvenlik kartındaki ve sonuç ekranlarındaki dört metin düzeltmesi `modul.md` §10.3'teki gibidir; hepsi Türkçe editör
  onayından geçer.
- Önce tasarım Artifact'ı çizilir (iki tema, 320 px, gerçek Ders 2 sesiyle eşzamanlı görsel); kod ancak sahibin
  onayından sonra yazılır (Kapı 3).

#### D.3 Oynatıcı ve yerel kod

Yeni yerel sınıf, pbxproj'a dokunmamak için mevcut `AlarmPlugin.swift`'e eklenir. Uyku sesi bugün tek bir AVAudioPlayer
ile çalıyor (AlarmPlugin.swift:244-248), oturumu `AppAudioSession.shared.beginSleep()` ile alıyor (:240) ve kesinti
gözlemcisi kuruyor (:256-258). Ders oynatıcısı AVAudioPlayer ve kesinti gözlemcisi kalıbını aynen kullanır, ama
**oturum bayrağını paylaşmaz**:

- **Sorun:** `AppAudioSession`'da tek bir `sleepActive` bayrağı var (FeedbackPlugin.swift:247). Kullanıcının ses tercihi
  yalnız kayıt sürerken ya da bu bayrak açıkken ertelenir (:255). `endSleep()` bayrağı kapatır, oturumu bırakır ve tercihi yeniden uygular
  (:298-305); ses kapalıysa tercih `ambient` kategorisidir (app/src/lib/native.js:304-311). İki oynatıcı aynı bayrağı
  kullansaydı hangisi önce biterse oturumu bırakırdı; öbürü kilitli ekranda susabilirdi ve "ses asla kesilmez" kuralı
  bozulurdu. `sleepStart` de önce yalnız kendi oynatıcısını durdurur (AlarmPlugin.swift:236, :286-299).
- **Çözüm:** `AppAudioSession`'a ders için ayrı bir bayrak eklenir (`beginLesson()` / `endLesson()`). `setPreferredMode`
  ve `endRecording` (:255, :275-280) iki bayraktan biri açıkken tercihe dönmez, `.playback`'te kalır; oturum ancak ikisi
  de kapanınca bırakılır. Kayıt sürerken ders başlamaz (`beginSleep`'teki gibi, :289).
- **Karşılıklı dışlama iki yönlüdür:** ders başlarken çalan uyku sesi durur ("Başla"nın üstünde "Çalan uyku sesi
  duracak." satırı). Ders çalarken uyku sesi başlatılmaz: `sleepStart` ayrı bir kodla, "LESSON" ile reddeder. "BUSY"
  kullanılmaz, çünkü bugün "Ses kaydı sürüyor" anlamındadır (AlarmPlugin.swift:240-242). Bugün her ret, yerel uyku
  oynatıcısında 'blocked' evresine döner (dalgaSleep.js:104-117) ve uyku ekranı "Ses başlamadı · dokun, başlat" düğmesini
  gösterir (NightClock.jsx:34-35; Dalga.jsx:207, :231, :339-342); her dokunuş yine reddedilirdi. Bu yüzden
  `dalgaSleep.js` "LESSON" kodunu ayrı bir evreye çevirir, uyku ekranı "Önce çalan dersi durdur." der ve yeniden deneme
  düğmesi çıkmaz (metin Türkçe editör onayına). Alarm kurulumunda "Kur" ile başlayan uyku sesi aynı oynatıcıdan geçtiği
  için (AlarmSetup.jsx:118, sleepSession.js:13) aynı davranışı gösterir; alarm yine kurulur. Ders kendiliğinden
  durdurulmaz; kişi dersi kendisi bitirir ya da durdurur.
- Mevcut `sleepStart`, `sleepStop` ve `sleepStatus`'un imzası ve bugünkü davranışı (ders yokken) değişmez.
- **Köprü:** `lessonStart({ file, at, title })`, `lessonPause()`, `lessonResume({ at })`, `lessonSeek({ at })`,
  `lessonCrossTo({ file, at })` (iki oynatıcı arasında 2 sn'lik geçiş), `lessonStop()`, `lessonStatus()` →
  `{ time, duration, playing, route }`.
- **Eklenecek gözlemciler:** rota değişimi (kulaklık çıkınca duraklat), medya hizmetlerinin sıfırlanması (aynı konumdan
  yeniden kur). Now Playing ve uzaktan komut (yalnız oynat ve duraklat) eklenir. Dinlenen saniye yerelde de yazılır; JS
  açılışta kaydı uzlaştırır.
- **Ekran:** JS, `lessonStatus().time`'ı ekran açıkken saniyede birkaç kez okur ve görseli `timeline.json`'dan çizer
  (duvar saatinden değil). Ekran açık tutulmaz; ders kilitte sürer.

| Olay | Hazır karışımda nasıl |
|---|---|
| Süre doluyor | Dosya kapanışla biter; hiçbir cümle yarıda kalmaz (planlayıcı bunu dosyayı kurarken sağlar, ölçüm doğrular) |
| Duraklat / sürdür | 1 sn'de söner; sürdürünce `timeline.json`'daki o anki klibin başına oturur, 1 sn'de açılır |
| Kapanışa geç | O anki cümle biter; aynı dosyada Kapanış'ın başına, dönüş tınısından önceki sessizliğe 2 sn'lik geçişle atlanır; kapanış kısalmaz. İmge ya da zor bloğun içindeyse önce o bloğun bırakma ön klibi çalar. Uyku dersinde "Uykuya geç" uyku iznine atlar |
| Sarma, bölüme atlama | En yakın klip başına 1–2 sn'lik geçişle; imge ya da zor bloktan çıkılıyorsa önce bırakma klibi |
| X (durdur) | Onaysız; 2 sn'de söner; durdurma ekranı ve isteğe bağlı sesli dönüş dosyası (20–30 sn) |
| İlk ders cümlesi | Kişinin ilk yoga dersinde önce kısa giriş dosyası çalar (dersin giriş müziği + "Bugün yalnızca tanışıyoruz; zorlanırsan kapanışa geçmen yeterli."), sonra dersin başına 2 sn'lik geçiş. Ders bu tek seferde ≈ 7 sn uzar (VARSAYIM). Cümle ekrandaki "Kapanışa geç" düğmesinin adını söyler; eski biçim ("zorlanırsan kısalt") nesnesizdi ve ekranda olmayan bir eylemi söylüyordu. "-(y)abil-" kullanılmaz, çünkü hemen ardından gelen `a.izin` üç tane taşır (§A.2 kural 6). Son biçim Türkçe editör onayıyla |
| Kaldığın yerden (15 ve 20 dk) | Önce açılış izni dosyası ("İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin."), sonra bölümün başına geçiş |
| Uyku dersinin sonu | Uyku izninden sonra ses susar; müzik kuyruğu, bugünkü uyku sesinin kalıbıyla (döngü + son 3 dk'da kısılma; varsayılan kısılma 180 sn, AlarmPlugin.swift:230, :245, :259) seçilen süre çalar ve **tamamen durur**; uyandırma yok |
| Arama, Siri, kulaklık, Bluetooth, uygulamanın kapanması | `modul.md` §4 tablosundaki gibi; hepsi cihaz listesinde (§E.5) |
| Dalga'nın uyku sesi çalıyorsa | "Başla"nın üstünde "Çalan uyku sesi duracak." satırı; ders başlayınca uyku sesi durur |
| Ders çalarken Dalga'dan ya da alarm kurulumundan uyku sesi başlatılırsa | Uyku sesi başlamaz ("LESSON"), ders sürer; uyku ekranı "Önce çalan dersi durdur." der, "dokun, başlat" düğmesi çıkmaz. İkisi hiçbir zaman aynı anda çalmaz |

Geçiş noktaları hep sessizlik ya da yatak üzerindedir; tık ve faz sorunu cihazda, bilinen anlarında tık olan bir deneme
dosyasıyla sınanır (VARSAYIM: AVAudioPlayer'ın konuma oturma kesinliği doğrulanmadı).

#### D.4 Kayıt

Şema `modul.md` §6.1'dir (`type: 'yoga'`, `lesson`, `planned` 180 | 300 | 900 | 1200, `seconds`, `reachedClosing`,
`completed`, `before`, `after`, `hard`, `sleepEase`, `contentHash` …). İlk yayında sabit olan alanlar (ses, arka plan,
duruş, sahne) yine yazılır; böylece ikinci aşamada şema değişmez. Kurallar:
- 30 sn'den kısa dinleme kaydedilmez (VARSAYIM).
- **Tamamlandı** = kapanışa ulaşıldı **ve** planlanan sürenin en az %60'ı dinlendi (VARSAYIM).
- Kayıt ses bittiği anda yazılır, puanlar sonra eklenir. Bugünkü depo yalnız ekleme yapıyor (lib/storage.js:87-92); küçük
  bir `updateSession(id, patch)` eki gerekir. Başka hiçbir çağrı değişmez.
- `contentHash` dosyanın özetidir; dosya değişirse yarım kalan ders "Bu ders güncellendi; baştan başlayacak." der.

#### D.5 Gelişim ve Nef

- **Gelişim** (`modul.md` §7): Pratikler kartında üç satır (7 günde dakika ve ders, tamamlanan, pratik günü); rekor
  kutusu "Yoga · pratik yapılan gün" (süre rekoru yok); dokuz dersin önce → sonra puanı kendi alanında (Ders 3'te yok);
  Uykuya Geçiş için "Uykuya dalma kolaylığı (ertesi sabah)". 28 günlük şeritte her ders kendi alanını doldurur: Sakinlik
  (1, 4), Beden (2), İyi oluş (3, 6, 10; Ders 3 VARSAYIM), Dikkat (5), Kendine yaklaşım (7, 8), Farkındalık (9). Bu,
  PLAN.v2 G1'in kendi önerisidir ("pilotta (a), 10 ders tamamlanırken (b)"; ilk yayın on dersin tamamlandığı yayındır):
  sözleşmeye isteğe bağlı `sessions.domainOf(s)` eklenir; tanımlamayan modül için bugünkü gibi modülün tek alanı
  kullanılır (registry.js:45-51 sözleşme yorumu, :108-113 doğrulama). **Tek kaynak:** bir kaydın alanını yalnız
  `domainOfSession` (dataHub.js:36-38) söyler; `domainOf`'u o okur. Bugün alanı modülden okuyan iki yer de ona bağlanır:
  28 günlük şeridin kaynak sayımı (dataHub.js:181) ve dışa aktarmadaki süre satırı (exportData.js:69, bugün
  `progress.domain`). Önce → sonra satırları zaten etkinin kendi alanını yazar (exportData.js:60; registry.js:154);
  yoganın her dersinin etkisi kendi alanıyla tanımlanır. 5. gün raporu ve PDF kayıt başına alan yazmaz: rapor modeli
  alan okumaz (exportData.js:94-148), 5. gün raporu ölçümün kendi alanını yazar (FirstReport.jsx:59). Böylece aynı yoga
  kaydı Gelişim'de ve CSV'de aynı alanda görünür. Kartlar puanları "nasıl hissettin" gidişatı olarak gösterir, etki
  kanıtı olarak değil; "stresini azalttı", "bilimsel olarak kanıtlandı" gibi bir cümle hiçbir yerde yok. Nedeni: 73 ruh
  sağlığı uygulamasının mağaza açıklamasının %64'ü etkinlik iddia etti (Larsen 2019, PMID 31304366, DOI
  [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1)).
- **Nef** (`modul.md` §8): yalnız dört sayı gider (7 günde ders, dakika, tamamlanan ders, pratik günü). Puan, ders adı,
  zorlanma ve uyku cevabı gitmez; son 7 günde yoga yoksa özet `null`'dır. Nef'in "Yoga" önerisi için sunucu isteminde bir
  satır ve CoachCard'da bir eşleme eklenir. **Risk:** özet süzgeci ilk 10 modülü geçirir (lib/coachCore.js:44); yeni
  modüller geldikçe yoga dışarıda kalabilir. Karar YOL.moduller §2.6'da bekliyor.
- **Sabah sorusu** (`modul.md` §9): yalnız gece başlanmış Uykuya Geçiş'ten sonra, ertesi sabah tek kart; alarm sorusu
  bekliyorsa önce o.

#### D.6 Güvenlik

`modul.md` §10'daki her şey ilk yayındadır: bir kez gösterilen güvenlik kartı; her ders ekranında açılış satırları ve araç
uyarısı; onaysız durdurma ve dönüş ekranı; kısalmayan kapanış; zorlanma sorusu ve "Çok" cevabının iki biçimi; nefes tutma,
hızlı nefes ve ayakta hareket yok; uyku dersinde uyandırma yok, ses tamamen durur; Ders 4'ün sonunda 112 satırı; nöbet
cevabı "Hayır" değilse nefes formu nabız atmaz.

Dayanaklar (seçme): açılıştaki "dersi bitirebilirsin" izni, travma-duyarlı yoga nidranın özerklik ve onay bileşenlerine
dayanır (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021)); gündüz
derslerinin kısalmayan dışa dönüşü, hipnoz sonrası "uyandırma" başarısızlığının istenmeyen etkilerde önemli bir etken
sayılmasına dayanır (Howard 2017, PMID 28300508, DOI
[10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)). Öteki dayanaklar `modul.md` §10.1'de.

#### D.7 Ücret ve platform

**Ücret.** iPhone uygulamasında bugün bütün uygulama tek yetkinin arkasındadır: abonelik ya da deneme yoksa yalnız
güvenlik bilgisi ekranı açık kalır (App.jsx:895-908). Web'de ödeme yoktur, uygulama her zaman açıktır
(subscription.js:67-69; App.jsx:357). Yoga iPhone'da bu kapının arkasındadır; deneme süresinde on ders açıktır (PLAN.v2
G4-a). "Bir ders hep açık" seçeneği yeni bir ücretsiz kip ister; ilk yayının kapsamı dışındadır.

**Platform: ilk yayında yalnız iPhone.** Ders oynatıcısı yalnız yereldir (AlarmPlugin'e eklenen sınıf, §D.3), ses
dosyaları Vercel'e yüklenmez (§C.2) ve web oynatıcısı planlanmadı; oysa bugünkü uyku sesinin web yedeği vardır
(dalgaSleep.js:72-74). Web'de yoga görünseydi çalmayan bir yol durağı ve açılmayan bir kutucuk olurdu. Bu yüzden web'de
(`isIOSApp()` yanlışken, lib/native.js:10-16) yoga görünmez: `today()` `null` döndürür (§B.5), Ana sayfanın Pratikler
listesi yoga kutucuğunu atlar (`registry.inSection`, Home.jsx:78, :420), Nef'in yoga önerisi CoachCard'da düğme olarak
çıkmaz; rotaya doğrudan gelinirse ekran "Yoga dersleri iPhone uygulamasında." der (metin Türkçe editör onayına). Web'de
yoga kaydı oluşmadığı için Gelişim ve Nef özeti kendiliğinden boştur. Web oynatıcısı ikinci aşamada ayrıca sorulur.

#### D.8 Değişen ve eklenen dosyalar (mevcut sistem bozulmaz)

Yeni: `modules/yoga/` (manifest ve ekranlar), `lib/yoga.js` (yol durağı ve sayaçları, kayıt, `visualAt`, sabah sorusu),
`lib/yogaLessons.js` (ders verisi, `published` ve dosya adları), `lib/pathLater.js` ("Sonra yaparım" kaydı; §B.5),
`public/yoga/` (ses ve `timeline.json`), `AlarmPlugin.swift`'e yeni sınıf.

Küçük ekler:
- `ios/App/App/FeedbackPlugin.swift`: `AppAudioSession`'a ders bayrağı (§D.3); `AlarmPlugin.swift`'te `sleepStart`'a
  "ders çalıyorsa LESSON" denetimi ("BUSY" bugünkü anlamıyla, ses kaydı için kalır).
- `lib/dalgaSleep.js`: yerel uyku oynatıcısı "LESSON" reddini ayrı bir evreye çevirir; `screens/Dalga.jsx` ve
  `components/NightClock.jsx`: bu evrede "Önce çalan dersi durdur." yazar, "dokun, başlat" düğmesi çıkmaz (§D.3). Testleri
  `dalgaSleep.test.js` ve `NightClock.test.jsx`'e eklenir; bugünkü 'blocked' davranışı değişmez.
- `lib/today.js`'te beş ek (§B.5); `screens/Home.jsx:162`'de `buildPath` bağlamına `later`; Home.jsx'in Pratikler
  listelerinde (:78, :420) web'de yoga kutucuğu atlanır (§D.7).
- `modules/registry.js`'te isteğe bağlı `sessions.domainOf`; `lib/dataHub.js`'te `domainOfSession` (:36-38) onu okur ve
  kaynak sayımı (:181) ona bağlanır; `lib/exportData.js:69`'daki süre satırı da `domainOfSession`'dan okur (§D.5, G1-b).
  Test: aynı yoga kaydı Gelişim'in 28 günlük şeridinde ve CSV'de aynı alanda görünür; `domainOf` tanımlamayan
  modüllerde CSV satırları bugünküyle aynı kalır.
- `storage.updateSession`, Ana sayfada sabah kartı, `coachCore.js`'te bir istem satırı, CoachCard'da bir eşleme (web'de
  düğme yok), `sources.js`'te bir kaynak türü, `TodayPath.jsx`'te çizim ve alt satır.
- `app/.vercelignore`'a `public/yoga` satırı. Nef istemi için sunucu yeniden yayımlanmadan önce eklenir; Kapı 8'den önce
  Vercel dağıtımında yoga dosyası olmadığı denetlenir (§C.2).

Değişecek mevcut testler ve eklenecek testler `modul.md` §16, `yol.md` §5.6 ve §B.5'tedir. Değişmeden yeşil kalması
gereken testler, mevcut sistemin bozulmadığının kanıtıdır.

---

### E. Kalite kapıları

#### E.1 Metin (seslendirmeden önce, üç onay: insan ya da karar 2'deki yedek)

- **Model ilk denetimi** (makineyle denetlenen kurallar): yasak sözcük ve iddia listesi (PLAN.v2 §C.6); herhangi bir 60 sn'de
  ≤ 150 hece ve ≤ %60 konuşma (timing.py:72-73); "-(y)abil-" ≤ 3 / 60 sn, 3 dk Kapanış'ta en çok bir (§A.2 kural 6);
  çok cümleli birimde iki nokta yok; ekrandaki cümle = söylenen cümle; uyku dersinde uyandırma cümlesi yok.
- **Türkçe editör:** TDK yazımı; anlatım bozukluğu ve cümle düşüklüğü (özne–yüklem uyumu, eksik öğe, gereksiz sözcük,
  yanlış ek, çeviri kokan yapı); doğal söyleyiş; metin yüksek sesle okunarak denetlenir (yoga-pilot/SAHIP_ISTEKLERI.md:13-17).
- **Usta hoca:** PLAN.v2 §E.6'daki 18 ölçüt; 3 dk'da değişen üçü `modul.md` §12'de.
- **Klinik psikolog:** Ders 4 ve 7, kısa sürümleri dahil. Metnin yanında bu iki dersin **yolda istenmeden önüne
  gelmesini** de onaylar: Zor Anlar İçin'in 3 dakikası ≈ 9 günde bir, Kendine Şefkat'in 5 dakikası ≈ 16–18 günde bir,
  günün herhangi bir saatinde gelir (§B.2 kural 5; benzetimde Kendine Şefkat 18, 34, 52, 68 ve 84. günlerde saat
  10.00'da). Onay çıkmazsa karar 5.3'teki yedek kural uygulanır.
- **Ders 2 metni de bu üç onaydan geçer;** pilot, insan editör onayı beklenirken seslendirildi (PLAN.v2 §C.8 başlığı).
  A aşamasında üçüncü ses de aynı metni okur (karar 2'deki tek istisna: kör karşılaştırma). İncelemede değişen birimler
  hangi ses seçilirse seçilsin yeniden seslendirilir (düzeltme payından).
- **İnceleyici bulunamazsa (karar 2):** Türkçe editör ve usta hoca yerine birbirinden bağımsız iki model incelemesi
  aynı ölçütlerle okur; son kulak kararı sahibindir. Psikolog yerine karar 5.3'ün yedek kuralı uygulanır. Dinleme
  paneli yerine sahibi kör dinler (§E.4). Bir role sonradan insan bulunursa o rol, sıradaki partiden başlayarak insana
  geçer.

#### E.2 Ses (her klip)

- 3 çekim; nesnel sıralama (PLAN.v2 §D.1.4: eklemleme bandı, duraklama deseni, F0, tık, yükseklik, komşu klibe süreklilik).
- **Scribe ile harf harf:** her klip yazıya geri çevrilir; normalleştirilmiş metin sözcük sözcük aynı olmalıdır. İki
  istisna vardır: bitişik yazılan birleşik sözcüklerin ayrı yazımı ("sırtüstü" / "sırt üstü") ve ek-fiilin bitişik ya da
  ayrı yazımı (-(y)sA / ise, -(y)DI / idi, -(y)mIş / imiş; "nefesteyse" / "nefeste ise"). Liste tutulur ve Türkçe
  editörün onayından geçer. Eşleşmezse en çok bir yeniden çekim;
  yine eşleşmezse klip "kulak listesi"ne girer ve Türkçe editör dinler. Yanlış vurgu ya da söyleyiş varsa klip yeniden
  üretilir.
- Kesim, çok cümleli birimde cümle sonundaki duraklamadan yapılır; yalnız ölçüyle denetlenen kesimler kulak listesine
  girer (pilotta ses başına 32 birim).
- Hakan seçilirse üretimde mikro kliplerin RMS ofseti yeniden ayarlanır ve tepe yönetimi klip düzeyinde yapılır (pilotta
  1 sn'den kısa 8–9 parça 13,0–14,9 dB'de kaldı; 40 parça sınırlayıcıda 3 dB'den çok kısıldı).

#### E.3 Karışım ve plan ölçümleri (her dosya; biri geçmezse dosya sahibe gitmez)

| Ölçüt | Eşik | Pilot (15 dk, 4 dosya) |
|---|---|---|
| Süre | hedef ± 1 sn | 900,049 sn |
| Olay sırası, eksik ya da çift cümle | plan ile birebir | geçti |
| Her konuşma parçası kodlanmış dosyada kendi yerinde | ilinti ≥ 0,95 (VARSAYIM), kayma ≤ 1 ms | 127–129 parça, en düşük 0,962, en büyük kayma 0,05 ms |
| Kurgu noktasında tık | yok | yok |
| Dijital sessizlik | < 100 ms | en uzun 0,0264 sn |
| Konuşma / yatak | ≥ 15 dB, **mikro parçalar dahil** | ≥ 1 sn parçalarda geçti; ortanca 17–18 dB; 1 sn'den kısa parçalardan Hakan'da 8–9'u, Neslihan'ın bir karışımında 1'i altında |
| Gerçek tepe | ≤ −1 dBTP | geçti |
| Bütünleşik yükseklik | gündüz −18 ± 1 LUFS, gece −20 (PLAN.v2 VARSAYIM) | −17,39 … −18,10 |
| Ekrandaki = söylenen | birebir | geçti |

Plan denetimleri (her ders × süre, seçilen sesin ölçülmüş süreleriyle): `check_plan` hatasız; boş pay 5 dk'da ≥ 15 sn
(timing.py:114), 3 dk'da ≥ 10 sn (VARSAYIM); yoğunluk ve "-(y)abil-"; şafak; son 60 sn; zor blok bölünmez ve kapanıştan
hemen önceye gelmez; alt küme 3 ⊂ 5 ⊂ 15 ⊂ 20. Kodlama sonrası: AAC dosyası Mac'te çözülüp konum ve tık denetiminden yeniden
geçer. Tam karışımın Scribe ile yazıya çevrilmesi yapılmaz (§C.3); yerine her parça, Scribe'dan geçmiş çekimden gelir ve
kodlanmış dosyada konumuyla bulunur.

#### E.4 Dinleme paneli ve kodek testi

Panel (PLAN.v2 G10): en az beş kişi; en az biri 65 yaş üstü, biri yeni başlayan, iki cinsiyet. Görevleri:
1. **Kodek testi** (Kapı 3'ten önce): aynı Ders 2 karışımı pilot MP3'ü, AAC-LC 96 ve AAC-LC 64 olarak; iPhone hoparlörü
   ve AirPods ile, sessiz odada, kör. AAC-LC 64 ayırt edilemezse o seçilir, edilirse 96.
2. **Anlaşılırlık:** 65 yaş üstü üye Derin evrede her sözcüğü rahatça seçebilmelidir. Seçemezse bütün karışımlarda
   konuşma/yatak eşiği yükseltilir (pilot verisinde netlik kipi için 21 dB yazılı; VARSAYIM).
3. **Her parti:** yayına girecek **her dosya** en az bir panel üyesince baştan sona dinlenir (parti başına ≈ 66–69 dk,
   üyeler arasında bölünür); her dersin varsayılan sürümü, en çok dinlenecek sürüm olduğu için iki üyeden geçer.
   65 yaş üstü üye her dersin en az bir dosyasını dinler. İşaretler: "aceleci", "boş", "tekrar eden müzik",
   "anlaşılmayan sözcük".

Model sesi dinleyemez; kulak kararı gereken her şey insanla verilir. **Panel kurulamazsa (karar 2):** kodek testini ve
anlaşılırlığı sahibi kör dinler; mümkünse 65 yaş üstü biri de dinler. Madde 3'teki dinleme, sahibinin Kapı 5–7'deki
dinlemesiyle yapılmış sayılır.

#### E.5 Cihaz listesi (iPhone; her madde HATA_GUNLUGU'na)

`modul.md` §17'deki liste aynen, şu eklerle: kilitli ekranda 3, 5, 15 ve 20 dk kesintisiz; sarma, bölüme atlama, kapanışa
geç, ilk ders girişi ve kaldığın yerden geçişlerinde tık ya da faz sorunu yok; "Kapanışa geç" imge bloğundayken önce
bırakma klibi; Now Playing ve AirPods dokunuşu; arama ve Siri; kulaklık çıkınca duraklama; Bluetooth'a geçiş; nefes
formunun büyüme anı ile "al" sözü arasındaki fark hoparlörde ve AirPods'ta ölçülür (ölçülmeden "eşzamanlı" denmez);
15 dk kilitli çalmada pil tüketimi. Ses oturumu için: ders çalarken Dalga'dan uyku sesi başlatılmak istenir, uyku sesi
başlamaz ve ders kesilmez; uyku sesi çalarken ders başlatılır, uyku sesi durur ve ders kilitte sürer; ses kapalı
tercihiyle ekran birkaç kez açılıp kapanırken ders kilitli ekranda sürer (§D.3); ders çalarken alarm kurulumunda "Kur"
ile uyku sesi istenir, uyku ekranı "Önce çalan dersi durdur." der ve "dokun, başlat" düğmesi çıkmaz. Yol için (Kapı 5'ten
başlayarak; Kapı 4 derlemesinde yalnız Ders 2 yayımlıdır ve Ders 2'nin 3 dakikası olmadığı için kısa günde durak
görünmez, §B.5): 3. kayıtlı günde yoga yolda; 3 dk göz bütçeli profilde yoga 2. bölümde kalır; "Sonra yaparım" denince
Bugünün görevi açılır ve yol "tamam" olur; gece yarısından sonra "Sonra yaparım" denmiş durak yeni günde yoktur; yoldan
açılan ders bitince durak tamamlanır. Tarih gerektiren durumlar (E testi günü, Hızlı Bakış ile okuma testinin çakışması,
tam ders günü) cihazda beklenmez; birim testleriyle sınanır (§B.5). Bu
uygulamada kilitli ekranda uzun çalma, uyku sesi için bile henüz cihazda işaretlenmedi (`uretim.md` §10); ilk cihaz
testi bu yüzden Kapı 4'tür ve kalan partiler ondan sonra seslendirilir.

#### E.6 Sahibin dinlemesi

| Kapı | Ne dinler ya da görür | Nerede |
|---|---|---|
| 2 | Ders 2'nin 15 dk'sı: 3 ses × 2 müzik = 6 kör karışım (tasarlanan ses girmezse 4) | Artifact ya da dosya |
| 3 | Ekran tasarımı; seçilen sesle Ders 2'nin 5, 15 ve 20 dk'sı, görselle eşzamanlı | Tarayıcı (tasarım Artifact'ı; dosya sınırı yüzünden MP3, 20 dk'da 96 kbit/sn; asıl kodek Kapı 4'te iPhone'da) |
| 4 | Ders 2, kilitli ekranda; ölçülen indirme boyutu (karar 6) | iPhone, TestFlight |
| 5–7 | Partinin her dersinin bütün süreleri, varsayılan sürüm dahil (parti başına ≈ 66–69 dk); Kapı 5'te yol durağı ilk kez | iPhone, TestFlight |
| 8 | Yayın derlemesi; yol durağı (bir gün yoldan yoga, bir gün "Sonra yaparım") | iPhone, TestFlight |

Kusur görülürse sormadan düzeltilir, ölçülür ve yeniden sunulur (yoga-pilot/SAHIP_ISTEKLERI.md:5-6).

#### E.7 "Bitti" tanımı

Bir ders ancak şu dört koşulla `[x]` olur: (1) metni üç incelemeden geçmiş (insan ya da karar 2'deki yedek); (2) her klibi Scribe ile eşleşmiş,
her dosyası §E.3'ten geçmiş ve panelde (panel yoksa sahibince, §E.4) en az bir kez baştan sona dinlenmiş; (3) cihazda kilitli ekranda bütün süreleri,
varsayılan sürüm dahil, kesintisiz çalmış; (4) sahibi bütün sürelerini dinleyip onaylamış.

Modül ancak şu iki koşulla yayına girer: (5) on dersin hepsi `[x]`; (6) yol durağı cihazda çalışmış (§E.5'teki yol
maddeleri), `.vercelignore` denetimi yapılmış (§C.2) ve web sürümünde yoga görünmüyor (§D.7). PLAN.v2'deki "5 ve 30 dakika" koşulu ikinci aşamanın yayın
kapısında (Kapı 11) geri gelir. Cihazda doğrulanmamış iş `[~]`'dir.

---

### F. Aşamalar ve takvim

| Adım | İş | Çıktı | Onay | Kredi | Süre (VARSAYIM) |
|---|---|---|---|---|---|
| **Kapı 1** | Bu plan ve yedi karar | Onay | Sahip | 0 | — |
| A | Pilotun kapatılması (sahibe gitmez): Hakan'ın 40 parçası klip düzeyinde tepe yönetimiyle yeniden karıştırılır, mikro kliplerin RMS ofseti ayarlanır; Scribe'ın birleşik sözcük ve ek-fiil yazımı istisnaları; kesim kuralı SPEC'e yazılır; kulak listesi. Tasarlanan ses: tarifle tasarım, önizlemelerden biri kaydedilir, Ders 2'nin 15 dk birimleri incelemeden önce seslendirilir (karar 2'deki istisna), iki kör karışım | Ölçülmüş 6 (ya da 4) kör karışım ve rapor | — | ≈ 14–15 bin + önizleme | 2–4 gün |
| **Kapı 2** | Kör dinleme | Ses ve müzik kaynağı seçildi (PLAN.v2 G9 kapanır) | Sahip | 0 | sahibin zamanı |
| B | Kalıp: SPEC v3 (ses, model, çekim sayısı, yükseklik, kodek, dosya adları, `timeline.json` şeması, qa eşikleri, Scribe kuralları ve tam karışım denetimi yerine parça konum denetimi, 3 dk biçimi). Ders 2 metninin insan incelemesi; 5 dk kısa biçimleri ve 20 dk birimleri seçilen sesle; 5/15/20 karışımları; kodek testi (panel); tasarım Artifact'ı. Parti 1'in metni yazılıp inceleyicilere gider | Ders 2'nin üç dosyası ve raporu; Artifact | — | ≈ 3–5 bin konuşma (Ders 2 eki 2,9–3,4 bin, yardımcı klipler ≈ 1 bin) + ≤ ≈ 6 bin 20 dk müziği (+ düzeltme) | 1–2 hafta |
| **Kapı 3** | Tasarım ve Ders 2, tarayıcıda | Kod onayı | Sahip | 0 | — |
| C | Kod: yerel oynatıcı ve ses oturumu bayrağı, modül, kayıt, Gelişim (G1-b dahil), Nef, sabah sorusu, yol durağı (sayaçları kayıtlardan; `today.js`'e beş ek; "Sonra yaparım"), `.vercelignore`, web'de yoganın gizlenmesi; testler. Kodek testinden sonra son toplam sürede yer tutucu ses dosyalarıyla bir TestFlight derlemesi ve App Store Connect'in bildirdiği indirme boyutu (karar 6). TestFlight (yalnız Ders 2 yayımlı; yol durağı kodda açık, ama 3 dk'lık ders olmadığı için cihazda ancak Kapı 5'te görünür). Parti 1 metni incelemede | Derleme, test raporu, ölçülen indirme boyutu | — | 0 | 1,5–2,5 hafta |
| **Kapı 4** | Ders 2, iPhone'da; cihaz listesi (yol maddeleri hariç); ölçülen indirme boyutuyla karar 6 | **Kalıp kilidi:** motor ve şartname bundan sonra değişmez; değişirse Ders 2 yeniden basılır | Sahip | 0 | — |
| **Kapı 5** | Parti 1: Ders 1, 3, 5 (seslendirme → müzik → karışım → ölçüm → panel → rapor → TestFlight); yol durağının cihaz maddeleri (§E.5) ilk kez. Parti 2'nin metni incelemede | Üç dersin bütün dosyaları | Sahip | ≈ 121–166 bin (payla ≈ 128–175) | 1–2 hafta |
| **Kapı 6** | Parti 2: Ders 4, 7, 8 | aynı | Sahip | ≈ 121–178 bin (payla ≈ 128–190) | 1–2 hafta |
| **Kapı 7** | Parti 3: Ders 6, 9, 10 | aynı | Sahip | ≈ 122–178 bin (payla ≈ 130–190) | 1–2 hafta |
| **Kapı 8** | Yayın: on dersin cihaz listesi; yol durağı cihazda çalıştı; Vercel dağıtımında yoga dosyası yok; web sürümünde yoga görünmüyor; sürüm notu (yeni kimlik), ENVANTER_VE_PLAN.md satırı, YAPILACAKLAR (g) maddesi | App Store derlemesi | Sahip | 0 | ≈ 1 hafta |
| *İkinci aşama* | | | | | |
| **Kapı 9** | 16–30 dk metni: her dersin 30 dk iskeletine göre yazılır, üç incelemeden geçer (karar 2); kaydırıcı ve çalışma anındaki karışım motorunun tasarımı (motor, onaylı ilk yayın dosyalarıyla örtüşmelidir, §A.4) | Onaylı metin ve motor tasarımı | Sahip | 0 | 3–4 hafta (VARSAYIM) |
| **Kapı 10** | Motorun kodu (iOS yerel, "istediğin dakika" seçimi); 16–30 dk birimlerinin seslendirmesi ve müziği, üç parti | Motor + on dersin 30 dk'ya kadar bütün birimleri | Sahip | ≈ 285–355 bin (kaba, VARSAYIM; tavanı ayrıca sorulur) | 3–6 hafta (VARSAYIM) |
| **Kapı 11** | 30 dk kilitli ekran cihaz testi, her derste 5 ve 30 dk (PLAN.v2'nin "bitti" koşulu) ve rastgele üç ara süre; sahibin dinlemesi | App Store derlemesi | Sahip | 0 | ≈ 1 hafta |

**Takvim:** plan onayından yayına ≈ 7–12 hafta (VARSAYIM). Hesap: A 2–4 gün, B 1–2 hafta, C 1,5–2,5 hafta, üç parti
1–2'şer hafta, Kapı 8 ≈ 1 hafta; toplam ≈ 6,8–12,1 hafta. Partiler sıralıdır, çünkü kalan dokuz dersin seslendirmesi
Kapı 4'ün kalıp kilidinden önce başlamaz; metin incelemesi bir önceki partinin seslendirilmesiyle üst üste yürür. Bu
süreye senin Kapı 2–8'deki dinleme sürelerin dahil değildir. İnceleyici bulunamayan rolde yedek uygulanır (karar 2);
takvim inceleyici aramayı beklemez. En büyük belirsizlik inceleyicilerin hızıdır; tahmin, bir partinin metninin ≈ bir haftada dönmesine dayanır. Kapı 4'te ölçülen
indirme boyutu eşiği aşar ve indirme altyapısı seçilirse ≈ 1–2 hafta daha eklenir (kaba tahmin, VARSAYIM; iş, `uretim.md`
§5'teki gizlilik kurallarıyla planlanır ve partilerle üst üste yürüyebilir). İkinci aşama ilk
yayından sonra başlar ve ≈ 7–11 hafta sürer (Kapı 9 ile motor tasarımı üst üste yürür; kaba tahmin, VARSAYIM).

**Kısmi yayın yoktur:** sahibi "tam bir istiyorum" dedi; modül on dersin hepsi onaylanınca ve yol durağı cihazda
çalışınca yayına girer. Modülü önce Ana sayfada yayımlayıp yol durağını sonra açan bir yedek plan yoktur.

**(c) ile ilişki:** yoga, (c)'nin koşulu da değildir, bağımlısı da. (c), senin iş sırandaki yerinde, yoga yayınından
sonra sonsuz yol planıyla gelir; geldiğinde yoga durağı aynı kalır (§B.5). Sonsuz yol planının araştırmasının ne zaman
başlayacağı karar 7'dedir.

**PLAN.v2 §G'nin durumu:** G1 → (b), PLAN.v2'nin kendi önerisiyle ("pilotta (a), 10 ders tamamlanırken (b)"; ilk yayın
on dersin tamamlandığı yayındır; §D.5). G2 → hepsi pakette (§C.2, karar 6). G3 → oynatıcı hep karanlık, kütüphane
ve ayrıntı iki temada. G4 → (a), tek abonelik kapısı. G5 → yol kapandı (yalnız MCP, `eleven_v4`); bütçe karar 3. G6 → (b),
tarif karar 1. G7 → (a), ayrı yaş sınırı yok (hızlı nefes, hiperventilasyon ve tutma hiçbir derste yok). G8 → (b), §D.2.
G9 → Kapı 2. G10 → karar 2. G11 → (b), `build-dev` yok sayılır, `Package.resolved` izlenir (sahibin Mac'inde). Karar
listesinde olmayanlar bu önerilerle uygulanır; itiraz edilirse değişir.

---

### G. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar:**
- **Kulakla dinleme yapılmadı.** Model sesi dinleyemez; pilotun dört karışımı ölçüldü ama sahibi tarafından henüz
  dinlenmedi. Bu belgedeki hiçbir ses kararı kulakla doğrulanmış değildir.
- **Pilot bitmiş değildir.** SPEC §7'nin ölçülen ölçütlerini geçti; ama bir ölçüt (tam karışımın Scribe ile yazıya
  çevrilip plan metniyle hizalanması) yapılmadı, bir kesim (`n2.hatirla`) şartnamenin kuralı dışında kaldı ve üç klip
  (iki seste `a.durus`, `k.yan`; Hakan'da `c2.yer`) Scribe ile harfi harfine eşleşmedi, farkları yazım farkı
  (report.md:94, :105, :115-125, :151). Pilot bu planın mikro parça eşiğini de geçmiyor; Neslihan'ın iki kesimi kulak
  onayı bekliyor (§1, "Elde olan").
- **İnsan inceleyici henüz yok** (PLAN.v2 G10). Pilot metni, insan editör onayı beklerken seslendirildi. Bulunamayan
  rol için yedek karar 2'dedir; yedek, insan onayının yerini tam tutmaz.
- **Cihazda hiçbir şey denenmedi.** Swift bu ortamda derlenmiyor; AAC burada üretilemiyor; kilitli ekranda 15–20 dk
  çalma, rota değişimi, medya hizmetlerinin sıfırlanması, AVAudioPlayer'ın konuma oturma kesinliği ve Bluetooth
  gecikmesi doğrulanmadı.
- **TTS'in gerçek kredi fiyatı bilinmiyor;** defterdeki 144 TTS satırının hiçbiri uzlaştırılmadı. Aboneliğin kotası ve
  kalan kredisi de doğrulanmadı.
- **Tasarlanan sesin** hızı, önizleme maliyeti ve kullanım koşulları bilinmiyor; Neslihan ve Hakan kütüphane
  seslerinin ticari kullanım koşulları doğrulanmadı.
- **3 dakikalık oturumun etkisini sınayan bir çalışma bu dosyalarda yok;** kısa sürümün kartında etki cümlesi olmaz.
  Önce → sonra puanları beklenti ve tavan etkisi taşır; kişi içi gidişat olarak gösterilir.
- **Yol sayıları bir benzetimdir.** İlk yayının yolu bugünkü kodun canlı manifestleriyle benzetildi; (c)'nin merdivenleri
  henüz kodda yok, onlarla yapılan benzetim VARSAYIMdır. İki benzetim de 5 ve 3 dk göz bütçesiyle koşuldu; bugünkü
  yolun benzetimi ayrıca Bugünün görevi'ni denemiş ve denememiş, Hızlı Bakış oynayan ve oynamayan kullanıcıyla koşuldu.
  Kişinin durakları her gün sırayla bitirdiği varsayılır. Göz bütçesinin gün içinde dolması ve mola kilidi benzetimde
  yoktur; bunları 20.000 bağlamlık eşdeğerlik sınaması kapsar (§B.5). "Yoga hiçbir durağı düşürmez" ise benzetime değil
  kurala dayanır (R7b) ve eşdeğerlik sınamasında 20.000 bağlamın hepsinde doğrulandı.
- Nef rıza metninin dört sayıyı kapsadığı yorumu hukukçuya teyit ettirilmelidir (`modul.md` §8).

**VARSAYIM listesi (sahibin onayına açık):**
- Süre: 3 dk iskeleti (0:34 / 1:38 / 0:48), kapak hece sayıları, bütün çapa süreler ve metin bütçeleri (±%15); 3 dk'da
  boş pay tabanı 10 sn; 3 dk'da şafak 45 sn; oturarak kapanışın 0:46–0:52 sürmesi (Ders 2'nin klipleriyle hesaplandı).
- Kayıt: tamamlanma eşiği %60; 30 sn kayıt eşiği; kaldığın yer kuralları; sabah sorusu pencereleri.
- Yol: 3. gün girişi; 3 ve 5 dk; tam ders için 6 kısa yoga günü; tam ders günlerinin iki derse ayrılması; 14 günlük
  yumuşak dönüş; Sabah Niyeti 05.00–12.00; akşam 20.00; `order: 105`; karar 5.3'ün yedek kuralındaki 17.00; E testinde
  "en çok bir gün"; "en az tamamlanan ders" seçimi; "Sonra yaparım"ın yalnız bugüne ait olması;
  (c) ile gelecek Nefes 3 dk kuralı ve öteki merdivenler; benzetimin üst değerinde Bugünün görevi'nin bir kez denenmiş
  olması.
- Üretim: dokuz dersin metin uzunluğu; ders başına 1.200–1.620 sn müziğin tekrarsızlığa yetmesi; %15 düzeltme payı;
  Ders 2'nin 20 dk'sı için müzik eki; toplam tavandaki ≈ 19 binlik önizleme payı; 5.500 kredi = 1 USD; ikinci aşamanın
  kredi ve süre tahmini.
- Boyut: yardımcı dosyaların 15–20 dk tutması; `timeline.json` dosyalarının toplam ≈ 1 MB tutması; AAC 64'ün pilot
  MP3'ünden ayırt edilemeyeceği; HE-AAC'nin yapay tını riski; ses dosyalarının IPA'da pek küçülmemesi; App Store'un
  200 MB eşiği; eşik aşılırsa App Store'un hücresel ağda kullanıcıya soracağı; indirme altyapısının ≈ 1–2 hafta
  sürmesi; Vercel projesinin `public` klasörünü sunup sunmadığı.
- Metin: ilk ders cümlesinin ≈ 7 sn tutması; Ders 3'ün Gelişim alanının İyi oluş olması.
- Parça konum denetiminde ilinti eşiği 0,95; gece dersinin yükseklik hedefi −20 LUFS.
- Takvim süreleri.

---

## Kaynaklar

**PubMed (hepsi yoga-pilot dosyalarında ikinci turda doğrulanmış):**

| PMID | Künye | DOI | Bu belgede |
|---|---|---|---|
| 39808431 | Radin 2025, JAMA Netw Open | 10.1001/jamanetworkopen.2024.54435 | §A.1, §A.2 (kullanım gerçeği; etki değil) |
| 29939051 | Schumer 2018 | 10.1037/ccp0000324 | §A.2 (kısa farkındalıkta küçük etki) |
| 34260686 | Tran 2021 | 10.1093/ageing/afab090 | §A.2 (kalkış adımları) |
| 11863237 | Harvey & Payne 2002 | 10.1016/s0005-7967(01)00012-2 | §A.3 (uyku dersinin imgelemesi) |
| 36731199 | Sharpe 2023 | 10.1016/j.jpsychores.2023.111169 | §A.3 ("uyutur" denmez) |
| 35391975 | Creaser 2022 | 10.3389/fpsyg.2022.765602 | §A.3 (öz-şefkatin kademeli kurulması); karar 5.3 (Kendine Şefkat'in yolda istenmeden gelmesi) |
| 36630953 | Balban 2023, Cell Rep Med | 10.1016/j.xcrm.2022.100895 | §B.2 (5 dk nefes Ana sayfada) |
| 31304366 | Larsen 2019 | 10.1038/s41746-019-0093-1 | §D.5 (etkinlik iddiası yok) |
| 39690521 | Luu 2024 | 10.17761/2024-D-24-00021 | §D.6 (özerklik ve dışa dönüş) |
| 28300508 | Howard 2017 | 10.1080/00029157.2016.1203281 | §D.6 (kısalmayan kapanış) |

Kaynak: PubMed (National Library of Medicine). DOI'ler `https://doi.org/` önekiyle açılır.

**Dosyalar:** yoga-pilot/SAHIP_ISTEKLERI.md (tamamı) · yoga-pilot/PLAN.v2.md (1–60, 100–110, 156–430 kart başları,
474–482, 563–566, 1130–1150, 1622–1685) · yoga-pilot/render/out/report.md (tamamı) · yoga-pilot/render/ledger.jsonl
(399 satır, yeniden toplandı) · yoga-pilot/pilot/timing.py (20–24, 60–74, 93–115) · yoga-pilot/pilot/ders2.lesson.json
(9–60, 185–290) · yoga-pilot/dossier-*.dogrulanmis.md (kaynak satırları) · docs/yol-haritasi/YAPILACAKLAR.md (40–215) ·
docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md (tamamı) · YOL.ilerleme.md (136–148, 258–268) · YOL.moduller.md (494–510,
594–612) · app/ios/App/App/AlarmPlugin.swift (224–271) · app/ios/App/App/Info.plist (54–60) · app/src/lib/today.js
(118–130, 154–170, 190–209, 289–299, 322–328) · app/src/lib/storage.js (85–93; oturum yazan tek satır :89) · app/src/lib/coachCore.js (42–46) ·
app/src/App.jsx (893–909) · bu klasördeki `sure.md`, `yol.md`, `uretim.md`, `modul.md` (tamamı).

İnceleme turunda ayrıca okunanlar: app/src/lib/today.js (1–380) · app/src/lib/eyeBudget.js (1–110) ·
app/src/screens/Home.jsx (146–176) · app/src/modules/*/manifest.js (`today()` ve `gates` satırları; breath 25–58,
routine 1–60, notice 26–33, snake 1–40, quick-look 36–48, fark-ettin 30–46, tek-bakis 36–48) · app/src/lib/breath.js:16 ·
app/src/lib/dalgaSleep.js (45–70) ve dalgaSleep.test.js (56–65) · app/src/lib/dataHub.js (28–40, 100–115, 172–186) ·
app/src/modules/registry.js (36–120) · app/src/lib/today.test.js (:10, :67, :71, :76, :82) ·
app/src/components/TodayPath.test.jsx:16 · app/src/modules/registry.test.js (1–21) · app/src/lib/native.js (300–313) ·
app/ios/App/App/FeedbackPlugin.swift (238–310) · app/ios/App/App/AlarmPlugin.swift (224–300) · app/.vercelignore ·
app/package.json (build satırı) · app/public ve ios/App/App/Sounds boyutları (`du`) · yoga-pilot/render/units.json
(`a.*` ve `k.*` birimleri) · yoga-pilot/pilot/timing.py (95–116) · yoga-pilot/dossier-sakin.dogrulanmis.md (157, 468) ·
yoga-pilot/PLAN.v2.md (1446–1472, 1670–1680) · docs/yol-haritasi/YAPILACAKLAR.md (55–95, 125–135) ·
docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md (55–75) · YOL.ilerleme.md (88–96, 380–452).

İkinci inceleme turunda ayrıca okunanlar: app/src/lib/today.js (1–400) · app/src/lib/today.test.js (1–20, :38, :52,
60–85) · app/src/modules/quick-look/manifest.js (tamamı) · `dropRank` satırları (notice:32, snake:37, tek-bakis:47,
fark-ettin:44, routine:12) · app/src/modules/who5/manifest.js (tamamı) · app/src/lib/subscription.js (60–75) ·
app/src/App.jsx (350–362, 890–912) · app/src/lib/native.js (1–16) · app/src/lib/dalgaSleep.js (60–125) ·
app/src/lib/sleepSession.js (1–27) · app/src/screens/AlarmSetup.jsx (110–125) · app/src/screens/Dalga.jsx (:80, :184,
:207, :231, :339–342) · app/src/components/NightClock.jsx (:13, :34–35) · app/src/lib/exportData.js (50–75, 94–148) ·
app/src/screens/FirstReport.jsx:59 · app/src/modules/registry.js (36–120, 146–156) · app/src/lib/dataHub.js (30–40,
176–184) · app/src/screens/Home.jsx (:78, :143, :161, :358, :420) · app/ios/App/App/AlarmPlugin.swift (226–262) ·
yoga-pilot/render/SPEC.md (80–98) · yoga-pilot/render/out/report.md (50–160) · yoga-pilot/render/sel/hak/selection-hak-1.json
(`c2.yer`) · yoga-pilot/render/units.json (68 birim; 1.405 hece, 596 sözcük) · yoga-pilot/PLAN.v2.md (330–366) ·
docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md (1–10, 60–68) · YOL.ilerleme.md (262–266) · bayt boyutları (`du -sb`:
app/public ve alt klasörleri, ios/App/App/Sounds, dist/assets, ios/App/App/public; `public/sleep/sakin-fade-*.mp3`;
pilotun MP3 ve `timeline.json` dosyaları).

---

## İnceleme izi (2026-09-29, iki mercek: "sahip ve kod", "sayı ve dil")

### Birinci tur

Her bulgu kaynağından yeniden denetlendi. Yanlış çıkan bulgu olmadı; iki öneride önerilen biçim yerine başka bir biçim
seçildi, gerekçesi satırında. Benzetim ve sınama dosyaları bu klasörün `v3fix/` altındadır (inceleme öncesi plan:
`v3fix/PLAN.v3.inceleme-oncesi.md`).

| # | Bulgu | Denetim | Ne yapıldı |
|---|---|---|---|
| K1 | BLOCKER: 3 dk göz bütçesinde R7 döngüsü yogayı düşürüyor (today.js:286) | Doğrulandı. today.js:216-227, :245-246, :286; eyeBudget.js:19, :98-99 (3 dk bütçe profil sinyaliyle de açılır); Home.jsx:162. Bugünkü yolla 3 dk'da yoga 30 günde 0, merdivenli yolla 4/30 ve 4/90; ekle ikisinde de 24/30 | §B.5'e R7a eki (ek 2) ve testi; §B.3'e 3 ve 5 dk özetleri; §1 "Yolun süresi"; §B.2 kural 2; §G'deki "benzetim göz bütçesi vermez" sınırı kapatıldı. Eşdeğerlik 20.000 bağlamda 0 fark |
| K2 | BLOCKER: yol durağı yayının koşulu değil; (c)'ye bağlı; iş sırası sahibe söylenmemiş | Doğrulandı. SAHIP_ISTEKLERI (yoga-pilot):27-28; tasarim/SAHIP_ISTEKLERI.md:64-68; YAPILACAKLAR.md:77-79 | Seçenek (b) seçildi ve yayının koşulu yapıldı: durak sayaçlarını kayıtlardan türetir (§B.5), bugünkü yolla benzetildi (§B.3). E.7'ye modül koşulu (6), Kapı 8'e "yol durağı cihazda çalıştı" eklendi; "önce Ana sayfada yayımla" yedeği kaldırıldı; §F'deki "Paralel (c)" satırı yerine "(c) ile ilişki"; karar 5 yeniden yazıldı; §2.0 satır 14. (c) artık "Sonra yaparım" kaydını sağlamadığı için `lib/pathLater.js` ve Home.jsx bağlamı eklendi (YOL.ilerleme'nin anahtarı ve biçimiyle). Sonuç: Nefes ilk yayında 5 dk kalır |
| K3 | SHOULD: `next` `later` durağı atlamıyor; Bugünün görevi açılamıyor | Doğrulandı: `v3fix/later_v3.mjs` eksiz `next Yoga, açılır mı false`, ekle `next Bugünün görevi, açılır mı true` | §B.5 ek 4 ve testi; §B.2 kural 9; eşdeğerlik beş ekle yeniden koşuldu (0 fark) |
| K4 | SHOULD: tek `sleepActive` bayrağı iki oynatıcıya paylaştırılıyor | Doğrulandı. FeedbackPlugin.swift:247, :255, :286-305; AlarmPlugin.swift:236, :286-299; native.js:304-311 | §D.3: ayrı ders bayrağı, iki yönlü dışlama (ders çalarken uyku sesi başlamaz); olay tablosuna satır; §D.8'e FeedbackPlugin.swift; §E.5'e üç madde |
| K5 | SHOULD: Vercel yeniden yayımında yoga dosyaları yüklenir | Doğrulandı: `.vercelignore` yalnız `public/mediapipe-wasm`'ı dışlıyor; `public/sleep` ve `public/voice` bugün de yükleniyor. Proje `public`'i sunuyor mu, VARSAYIM kaldı | §C.2 notu; §D.8 maddesi; §E.7 koşul 6; Kapı 8 denetimi |
| K6 | SHOULD: üç derste 3 dk olmaması sahibe sorulmamış | Doğrulandı | Karar 4(a), öbür seçenekle; §1'de açıkça "sapma"; §2.0 satır 3 |
| K7 | SHOULD: varsayılan 5 dk sürümler kulaktan geçmiyor | Doğrulandı | §E.4.3 her dosya panelde; §E.6 Kapı 5–7 bütün süreler; §E.7 (2)–(4); §1 |
| K8 | SHOULD: ikinci aşamanın kapısı, takvimi, bütçesi yok | Doğrulandı | §F'ye Kapı 9–11 (iş, süre, kredi); "5 ve 30 dk" koşulu Kapı 11'de; §A.4 ve §1'e atıf; §C.3'te ikinci aşama toplamı |
| K9 | NIT: today.js satır atıfları | Doğrulandı | §B.5: collect :163 / alan kopyası :178-205; core :326 / allDone :327 |
| K10 | NIT: iki kullanıcı metni | Doğrulandı. Önerilen "kapanışa geçebilirsin" kullanılmadı: hemen ardından çalan `a.izin` üç "-(y)abil-" taşır, dördüncüsü 60 sn sınırını aşar (§A.2 kural 6). "Bu zorlanma sık sık oluyorsa" yerine "Zor anlar sık sık geliyorsa" seçildi: satır Ders 4'ün sonunda tek başına görünür, "zorlanma" ekranda hiçbir şeye bağlanmaz | §D.3: "Bugün yalnızca tanışıyoruz; zorlanırsan kapanışa geçmen yeterli." (≈ 7 sn; §2.0 satır 10); §B.2 kural 11: "Zor anlar sık sık geliyorsa bir uzmanla konuşmak iyi olur. Acil durumda 112." İkisi de Türkçe editör onayına |
| K11 | NIT: karar 1 zaten verilmiş; G1 onaysız kalıcı (a) | Doğrulandı. PLAN.v2.md:1675; dataHub.js:36-38 | Karar 1 yalnız tarife daraltıldı. G1'de PLAN.v2'nin kendi önerisi korundu: ilk yayın on dersin tamamlandığı yayın olduğu için (b); §D.5, §D.8, §F'deki G satırı |
| S1 | BLOCKER: "ölçüm eşiklerini geçti" yanlış | Doğrulandı. report.md:57-59, :94, :99, :105, :116-120 | §1 "Elde olan" yeniden yazıldı; §G'ye not |
| S2 | BLOCKER: §1'de anlatım bozuklukları (a)–(e) | Doğrulandı | (a) Kapı 3 cümlesi, (b) "Uygulamayı her gün 10.00'da açan yeni bir kullanıcının", (c) Kendine Şefkat cümlesi, (d) Nefes cümlesi karar 5'te yeniden kuruldu (ilk yayında Nefes 5 dk kaldığı için), (e) "Kodek testi AAC 96'yı gerektirirse" |
| S3 | BLOCKER: §1'de yüklemsiz cümleler | Doğrulandı | Hepsine yüklem eklendi ("yapılacak", "gelir", "sürer", "tutar", "çıkar", "MB'tır", "İnceleyiciler şunlar olmalı") |
| S4 | SHOULD: "her ders 3, 5, 15" üç ders için yanlış | Doğrulandı | §1 "Ne yapılacak" düzeltildi |
| S5 | SHOULD: tavanlar üst tahmine yer bırakmıyor | Doğrulandı: `v3calc/kredi.py` ile Parti 2 ≈ 189,4, Parti 3 ≈ 189,5 bin; toplam ≈ 581 bin + önizleme | Karar 3: 195 / 600 bin; §C.3'te parti tutarları payla, tabloya 20 dk müziği sütunu, önizleme notu, tavan paragrafı; §1'e TTS uzlaştırılmadı notu |
| S6 | SHOULD: "8–10 hafta" adımlardan çıkmıyor | Doğrulandı (≈ 6,3–11,6 hafta) | ≈ 7–12 hafta, hesabı §F'de; C, eklenen kapsam yüzünden 1,5–2,5 hafta; dinleme ve inceleyici bulma hariç olduğu yazıldı |
| S7 | SHOULD: "haftada bir" yanlış; tam ders hep aynı iki ders | Doğrulandı (90 günde 10, 18, …, 84; 5/5) | "Yaklaşık 8 günde bir"; §B.2 kural 5'te tam ders günlerinin iki derse ayrılması açık kural oldu, gerekçesi ve dönen seçenekle; §1 |
| S8 | SHOULD: 15 dk hedefi ve kodun 20 dk'yı zorladığı söylenmiyor | Doğrulandı (merdivenli yolda 25/30 ve 85/90 gün > 15) | §1 "Yolun süresi" ve §B.3: hedef, R7'nin sınırı düşürerek koruduğu, bugünkü yolda yoga olan her gün > 15; merdivenli sayılar "(c) geldiğinde" özetinde |
| S9 | SHOULD: 200 MB eşiğinin sonucu söylenmiyor; sütun adı yanlış | Doğrulandı (`du`: public 54 MB, Sounds 25 MB) | Sütun adı "Ses ve model dosyaları toplamı"; §C.2 "Sonuç"; §1; yeni karar 6. Kısılma MP3'leri yalnız iOS paketinden çıkarılabilir (`dalgaSleep.test.js:65` onları `public`'te bekler) |
| S10 | SHOULD: 3 dk Kapanış'ı üç "-(y)abil-" taşıyor | Doğrulandı (units.json: `k.nefes`, `k.hareket`, `k.goz`; timing.py:103-104) | §A.2 kural 6: 3 dk Kapanış'ta en çok bir; `k.nefes` ve `k.goz`'un "-(y)abil-"siz kısa biçimleri; §E.1 |
| S11 | SHOULD: karar 2 ile A aşaması çelişiyor | Doğrulandı | Karar 2'ye istisna; §E.1 ve §F A satırı |
| S12 | NIT: 33,9 bin birim fiyatlardan çıkmıyor | Doğrulandı (1.620 × 20,5 = 33,2 bin; gerçek: 24.294,6 + 9.592) | §C.3 "Birim değerler" |
| S13 | NIT: Harvey & Payne ifadesi genişletilmiş | Doğrulandı (dossier-sakin.dogrulanmis.md:157, :468) | §A.3: "talimat almayan gruba göre … bildirdi; ölçüm yöntemi özette yok" |
| S14 | NIT: karar 1 verilmiş; karar 4'te anlaşılmayan terimler | Doğrulandı | Karar 1 daraltıldı; karar 4'te "zıt duyumlar bölümü" ve "kapanıştaki görsel aydınlanma" |

**İncelemenin dışında, düzeltme sırasında bulunan ve işlenenler:**
- Yoga kayıt defterine girince `today.test.js` ve `TodayPath.test.jsx` `registry.live` ile yoga durağını görür; yardımcılar
  yogasız listeyle koşar, `registry.test.js:8` listesine `yoga` eklenir (§B.5).
- Yoga modülü eklenince yoga dışı duraklar yalnız 20 dk sınırında değişir (20.000 bağlamda 3.614, başka fark 0); yoga o gün
  zaten yapılmışsa sınır Bugünün görevi'ni ve Daire'yi düşürebilir (§B.4'e satır).
- Uzun aradan dönüş bugünkü yolla yeniden benzetildi (§B.3).

### İkinci tur (2026-09-29, aynı iki mercek)

Her bulgu kaynağından yeniden denetlendi; hepsi doğru çıktı. Bir bulgunun bir kısmı değişiklik gerektirmedi (K2.5'te 5.
gün raporu ve PDF), bir BLOCKER'da önerilen iki seçenek yerine ikisini de kapsayan genel bir kural seçildi (K2.1).
Benzetim ve sınama dosyaları bu klasörün `v3fix2/` altındadır (ikinci tur öncesi plan: `v3fix2/PLAN.v3.inceleme2-oncesi.md`).
Birinci turun yukarıdaki iki maddesi bu turda değişti: yoga artık 20 dk sınırında hiçbir durağı düşürmez, test yardımcıları
da değişmez (test ortamında `isIOSApp()` yanlış olduğu için yoga durak üretmez). K1'in R7a eki kalktı; yerine R7b geldi,
ek sayısı yine beş.

| # | Bulgu | Denetim | Ne yapıldı |
|---|---|---|---|
| K2.1 | BLOCKER: Hızlı Bakış'ı oynamış kişide okuma günü yoga Hızlı Bakış'ı yoldan çıkarıyor | Doğrulandı. quick-look/manifest.js:47 (`exclusive`, `dropRank: 1`); today.js:251-254 (Hızlı Bakış günü bütçesiz yoga süzülmüyor), :216-227, :289-293. `inceleme2/hb.mjs` ve `inceleme2/sim_hb.mjs` yeniden koşuldu: 90 günün 4'ünde (9, 44, 51, 58) Hızlı Bakış düşüyor | Önerilen iki seçenek (Hızlı Bakış'lı okuma gününde yoga yok; o gün `dropRank` < 1) yerine genel kural: yoga `dropRank` taşımaz, `yields` taşır; R7b eki 20 dk sınırını önce yogasız yola uygular, yoga yalnız sığarsa, tamamlanmış olsa da ancak sığarsa yola girer. Gerekçe: ilk seçenek yalnız bu çakışmayı kapatırdı; (c)'nin merdivenli yolunda yoga iki okuma gününde bir oyunu yine düşürüyordu ve tamamlanmış yoga E testi günü üç durağı düşürüyordu (S2.5); `dropRank`'ı indirmek tamamlanmış yogayı kapsamazdı. Sınama (`v3fix2/`): eşdeğerlik 20.000 bağlamda yoga dışı duraklarda 0 fark (önce 3.614); her gün açan kullanıcının 90 günü iki saatte ve iki göz bütçesinde gün gün aynı; Hızlı Bakış'lı kullanıcıda hiçbir durak düşmüyor, yoga 90 günün 4'ünde (9, 51, 58, 65) yolda yok; (c) ile 30 günde 22 yoga günü, düşen durak yok. R7a gereksiz kaldı. Değişen yerler: §1 "Yolda", "Yolun süresi"; karar 5.1; §B.1; §B.2 kural 2 ve 4; §B.3 özetleri, yeni Hızlı Bakış paragrafı, uzun ara, (c); §B.4 üç satır; §B.5 taslak, ek 1–2, eşdeğerlik, testler (Hızlı Bakış + okuma günü dahil); §G |
| K2.2 | SHOULD: yoganın web'deki davranışı tanımsız; §D.7'deki kod iddiası yanlış | Doğrulandı. subscription.js:67-69; App.jsx:357; dalgaSleep.js:72-74; native.js:10-16 | İlk yayında yoga yalnız iPhone'da: `today()` web'de `null`, Pratikler kutucuğu (Home.jsx:78, :420) ve Nef düğmesi gizli, rotada bilgi satırı. §D.7 "Ücret ve platform" oldu ve kilidin yalnız iOS'ta olduğu yazıldı; §1, §D.1, §B.5 taslak ve test, §D.8, §F C satırı |
| K2.3 | SHOULD: "bölüm" sözünün iki okuması sorulmuyor | Doğrulandı. tasarim/SAHIP_ISTEKLERI.md:5-7, :64-65; YOL.ilerleme.md:264-265; 90 günlük benzetimde ders başına tekrar sayıları yeniden sayıldı | Karar 5.2: iki okuma, önerinin gerekçesi, sonuçları (yolda 7 adet 3 dk ve 2 adet 5 dk dosya; 90 günde 9–10 kez, 19.00'da açanda 11 kez; 5 dk'lar 5'er kez; 15 dk'nın içeriği yolda yok), öbür okumanın bedeli; §B.1 tablo ve paragraf |
| K2.4 | SHOULD: "Pilot SPEC ölçütlerini geçti" fazla iddialı; `c2.yer` yazılmamış | Doğrulandı. SPEC.md:94-95; report.md:94, :105, :120, :125, :151; selection-hak-1.json `c2.yer` (TTS "nefesteyse", Scribe "nefeste ise") | §1 "Elde olan" üç açık konuyla yeniden yazıldı (S2.2 ile birlikte); §G'ye "Pilot bitmiş değildir" maddesi |
| K2.5 | SHOULD: `domainOf` yalnız dataHub'a bağlanıyor; CSV süre satırı modülün alanını yazıyor | Doğrulandı. exportData.js:69 (`progress.domain`), :60; registry.js:154; dataHub.js:36-38, :181. modul.md:520'deki 5. gün raporu ve PDF yolu da denetlendi: rapor modeli alan okumaz (exportData.js:94-148), FirstReport.jsx:59 ölçümün alanını yazar; burada değişiklik gerekmez | §D.5 "tek kaynak" kuralı: `domainOfSession` `domainOf`'u okur, :181 ve exportData.js:69 ona bağlanır; §D.8'e dosyalar ve test (aynı kayıt şeritte ve CSV'de aynı alanda) |
| K2.6 | SHOULD: Ders 4 ve 7 yolda istenmeden geliyor; psikoloğun kapsamında değil | Doğrulandı (satırlar bulgudakinden bir-iki satır önce: PLAN.v2.md:353 "akşam ya da zor bir günün sonu", :357-360 Creaser 2022 uyarısı); benzetimde Kendine Şefkat 18, 34, 52, 68, 84. günlerde 10.00'da | §E.1: psikolog yolda gösterilmeyi de onaylar; karar 5.3 (öneri ve yedek kural: Kendine Şefkat yolda yalnız 17.00'den sonra, Zor Anlar İçin yoldan çıkar); §B.2 kural 5 ve 11; §G VARSAYIM listesine 17.00 |
| K2.7 | NIT: ders yüzünden gelen "BUSY" uyku ekranında yeniden deneme döngüsü açar | Doğrulandı. dalgaSleep.js:104-117; Dalga.jsx:207, :231, :339-342; NightClock.jsx:34-35; AlarmPlugin.swift:240-242; AlarmSetup.jsx:118 ve sleepSession.js:13 (alarm kurulumu aynı oynatıcıdan geçer) | Ayrı "LESSON" kodu, ayrı evre, "dokun, başlat" yok; §D.3 madde ve olay tablosu, §D.8'e dalgaSleep.js, Dalga.jsx, NightClock.jsx ve testleri, §E.5'e alarm kurulumu maddesi |
| K2.8 | NIT: §1'de üç dil ve tutarlılık kusuru | Doğrulandı. Home.jsx:358 ("Bugünün yolu") | (a) "Bugünün yoluna", (b) "Kısa günlerde 3 dakikalık bir ders gelir", (c) "2. bölümde göz duraklarından sonra, Bugünün görevi'nden önce gelir; yolun son pratik durağıdır" (§1, §B.1, §B.2 kural 2) |
| K2.9 | NIT: "19 canlı manifest" yanlış; R7a açıklamasında Tek Bakışta ile Fark Ettin mi? aynı gün sayılıyor | Doğrulandı. registry.test.js:8 (21 modül); breath-count `retired`; who5/manifest.js `today()` yok; `sim/loadmods.mjs`: who5 Node'da yüklenmiyor; tek-bakis:47 ve fark-ettin:44 `rotate: 'week3'` | Belge başı, §B.3, §B.5: "canlı 20 manifestin who5 dışındaki 19'u"; R7a açıklaması kalktı; test maddesi "Yılan ve o günün Tek Bakışta ya da Fark Ettin mi? durağı" |
| K2.10 | NIT: Scribe istisnası ek-fiili kapsamıyor | Doğrulandı (selection-hak-1.json `c2.yer`) | §A.3, §E.2, §C.4 ve §F A satırına ek-fiilin bitişik ve ayrı yazımı; liste Türkçe editörün onayına |
| S2.1 | BLOCKER: boyutta iki birim toplanmış; "eşiğin altında kalır" tutmuyor | Doğrulandı. `du -sb`: `app/public` 56.265.717 + `Sounds` 25.931.208 = 82,2 MB; mediapipe-wasm 35.444.140; kısılma MP3'leri 7.564.643; `dist/assets` 2.326.450; pilot MP3'leri 12.384.385–12.800.641; `timeline.json` 72.675–75.589 bayt | Bütün boyutlar ondalık MB: AAC 64'te ≈ 195–207 MB, MP3'ler çıkınca ≈ 188–200 MB (eşiğin tam sınırı); AAC 96'da ≈ 252–270 / 245–263 MB; MP3 satırı ≈ 195–223 / 277–305 MB. "Eşiğin altında kalır" silindi; JS, `timeline.json` ve ikili dosyanın eşiği aşırabileceği yazıldı. §1, karar 6, §C.2 (tablo, sonuç, eski iOS kopyası notu), §G |
| S2.2 | BLOCKER: §1 "Elde olan" kendi içinde çelişiyor | Doğrulandı (K2.4'teki satırlar; plan §C.3 ve §E.3 tam karışım denetimini yapmıyor) | Önerilen biçim K2.4'ün istediği ek bilgilerle birleştirildi: tam karışım denetimi üretimde de yapılmaz, yerine parça konum denetimi; A aşamasında düzeltilenler ve kulak onayına gidenler ayrı yazıldı |
| S2.3 | SHOULD: §F'nin B satırında 20 dk müziği yok | Doğrulandı (`v3calc/kredi.py`) | B satırı: "≈ 3–5 bin konuşma (Ders 2 eki 2,9–3,4 bin, yardımcı klipler ≈ 1 bin) + ≤ ≈ 6 bin 20 dk müziği (+ düzeltme)"; üst uçlar artık §C.3'ün ≈ 581 binine ulaşır |
| S2.4 | SHOULD: Kapı 4 derlemesinde yol durağı hiç görünmez | Doğrulandı (`v3fix/sim_bugun.mjs` `yogaStop`: 3 dk'lık günde Ders 2 aday değil; tam gün sayacı yalnız kısa yoga günlerini sayar) | Seçenek (a): yolun cihaz maddeleri Kapı 5'e; §1, §E.5, §E.6, §F C/Kapı 4/Kapı 5; birim testi "yalnız Ders 2 yayımlıyken kısa günde durak yok" |
| S2.5 | SHOULD: "20 dk aşılmaz" koşulsuz; tamamlanmış yogayla 263 bağlamda 21–24 dk | Doğrulandı (`v3fix/esdeger_yoga.mjs`; `v3fix/_rev_sim_pre.mjs`, PRE=8: Yılan, Daire, Bugünün görevi düşüyor) | K2.1'in kuralıyla kapandı: E testi günü yoga yolda yok (yapılmış olsa da); tamamlanmış yoga da yalnız sığarsa yolda. PRE=8'de yol 19 dk, üç durak yerinde (`v3fix2/sim_bugun_v4.mjs`). Karar 5.1: "yoga yolu hiçbir gün 20 dakikanın üstüne çıkarmaz"; §B.4'e iki satır; §B.5'e iki test |
| S2.6 | SHOULD: boyut kararı Kapı 8'e kalıyor | Doğrulandı | C adımına yer tutucu ses dosyalarıyla TestFlight ölçümü; karar 6 Kapı 4'te; takvime indirme altyapısı için ≈ 1–2 hafta (VARSAYIM); §1, §C.2, §E.6, §F |
| S2.7 | SHOULD: §1 "Yolda" paragrafında dört anlam hatası ve "Ana sayfadadır" | Doğrulandı | Önerilen biçimler uygulandı; "kütüphanededir" (§1 ve §B.2 kural 5); §B.2 kural 7 de "15 dakikalık sürüm" oldu |
| S2.8 | SHOULD: karar 5'te "tek sakin durak" ile Nefes çelişiyor | Doğrulandı (Nefes yolda her gün 5 dk) | "Yolun sesli rehberli dersi yalnız yoganın kısa dersleri; Nefes molası yolda 5 dk kalır" (karar 5.1, §B.1 tablo) |
| S2.9 | SHOULD: karar 1'de yüklemsiz cümle; karar 2 paneli metin onayına katıyor | Doğrulandı | Önerilen biçimler; karar 2'de panelin seslendirilmiş dosyaları dinlediği yazıldı |
| S2.10 | NIT: 3 dk'da sözcük aralığı | Doğrulandı (units.json: 1.405 hece / 596 sözcük = 2,36) | "≈ 130–140 sözcük" (§A.2) |
| S2.11 | NIT: terim ve söyleyiş | Doğrulandı | "istediğin dakika" (§1, Kapı 10); "Sıradaki adımlar ve senin onay kapıların"; karar 4(b) |
| S2.12 | NIT: "yerel dosyayı yükleme yolu yok" olgu gibi | Doğrulandı (report.md:151 "bu oturumda yok") | §C.3: pilot oturumunda araç yoktu; olsa da ≈ 80 bin kredi toplam tavanı aşar; SPEC v3'e yazılır |

**Bu turda ayrıca bulunan ve işlenenler:**
- Yoga `dropRank` taşımayınca göz payı döngüsü (today.js:286) onu zaten düşürmez (:220); birinci turun R7a eki bu yüzden
  gereksiz kaldı ve bugünkü koda dokunulan yer bir azaldı.
- Tablo §B.3, yeni kuralla koşulan benzetimde gün gün aynı çıktı; sahibe sunulan ilk 14 gün değişmedi.
- (c) geldiğinde yoga iki okuma gününde yolda olmaz (önceden bir oyunu düşürüyordu); §B.3'teki (c) sayıları yeniden yazıldı
  (30 günde 22, 90 günde 70 yoga günü).
- `lib/today.test.js`'teki birebir durak listeleri (:38, :52, :68, :77) test ortamında yoga durak üretmediği için
  değişmez; yoga testleri `isIOSApp`'i taklit eder (§B.5).

### Sahibe gönderilmeden önce son okuma (2026-09-29, orkestratör)

Benzetimler ve hesaplar yeniden koşuldu, sonuçlar belgedekiyle aynı çıktı: `v3fix2/sim_bugun_v4.mjs 10 30 - --gorev`
(ilk 14 gün §1'deki liste; ortalama 17,9 dk; 20 dk hiç aşılmadı; yoga yüzünden düşen durak 0), aynı betik 19.00 ve
90 günle (76 yoga günü, 10 tam ders), 3 dk göz bütçesiyle (24 yoga günü, ortalama 14,9) ve Hızlı Bakış oynayan
kullanıcıyla (72 yoga günü); `v3fix2/esdeger_v4.mjs` (20.000 bağlam, fark 0); `v3calc/kredi.py` (≈ 369–527 ve
≈ 405–575 bin; 20 dk müziğiyle ≈ 581 bin).

| # | Bulgu | Düzeltme |
|---|---|---|
| O1 | İnceleyici bulunamazsa ne olacağı yazılı değildi; her metin insan onayını beklediği için yoga süresiz bekleyebilirdi. Takvim de "inceleyicilerin bulunması dahil değil" diyordu | Karar 2'ye rol rol yedek eklendi (iki bağımsız model incelemesi ve sahibin kulağı; psikolog yerine karar 5.3; panel yerine sahibin kör dinlemesi). §E.1, §E.4, §E.7 (1) ve (2), §F Kapı 9 ve takvim, §G buna göre yazıldı |
| O2 | Yoga ≈ 7–12 hafta sürüyor; sahibin iş sırasına göre sonsuz yol planı bu süre boyunca bekliyordu. Sahibin sıra gerekçesi (yoganın yoldaki yerinin önce belli olması) bu planın onayıyla karşılanıyor | Yeni karar 7 (öneri: araştırma yoga üretimiyle birlikte yürür, kod yoga yayınından sonra); §F "(c) ile ilişki" ve Kapı 1 "yedi karar" |
| O3 | Belge başı, dosyaların depoya "onaydan sonra taşınacağını" söylüyordu; dosyalar kaybolmasın diye önceden `yoga-pilot/v3/` altına alındı | Belge başı düzeltildi |
