# 5 saniye kuralı ve devamlılık: her günün ilk açılışı, deneyim yayı, bağlılık göstergeleri (plan, 2026-09-29)

Bu belge bir PLAN ve TASARIMDIR; kod değişikliği sahibinin onayından sonra yapılır (`SAHIP_ISTEKLERI.md`, bağlayıcı
ilkeler). Kod iddiaları yalnız bu oturumda okunan dosya:satır ile verilir (yollar `app/src/` altına göredir). Bilimsel
iddialar PubMed'den bu oturumda çekilen PMID + DOI ile, PubMed'de olmayanlar yayıncı sayfasıyla ve açıkça "PubMed'de
yok" notuyla verilir. Apple iddiaları developer.apple.com belgelerinden (bağlantılı). Doğrulanamayan her şey
**VARSAYIM** diye yazılır. Kardeş belgeler (aynı klasör): `merdiven.md` (merdivenler, gün gün yol), `gelisim-nef.md`
(Gelişim ve Nef gidişat yorumları), `gunun.md` ("Günün nasıl geçti", hava, ay, konum). Burada onların kararları
yeniden icat edilmez; atıf yapılır, eksik ya da çelişen yer söylenir.

---

## 0. On satırda özet

1. **İlk 5 saniye bir ekran değil, Ana sayfanın "günün ilk açılışı" hâlidir.** Yeni ekran, açılış filmi ya da bekleme
   yok (Apple: "Launch instantly", açılış ekranı ilk ekranla neredeyse aynı olmalı). Bugünkü Ana sayfanın ilk görünen
   alanı (tarih, selam, gün diyaframı, Nef satırı, "Güne başla" düğmesi) korunur; üç şey eklenir, iki şey kalkar.
2. **Eklenen:** (a) tarih satırında gökyüzü şeridi: ay evresi · sıcaklık · yağmur (`gunun.md` §7.3 verisi);
   (b) Nef satırında günün **tek cümlesi**: dünden bir şey ya da bugün yeni olan (kural şablonu, ağsız, anında);
   (c) sıradaki durakta "Yeni" rozeti (merdiven basamağı bugün açıldıysa).
3. **Kalkan:** (a) sıfırlar ("0 gün seri", "0 gün seninle" ilk günün ilk ekranında üç sıfır); (b) ilk 5 saniyeyi
   kapatan tam ekranlar (Yenilikler, rıza sayfaları) günün ilk dokunuşundan sonraya kayar.
4. **Seri kuralı:** kırık seri hiç gösterilmez; seri yalnız 3 gün ve üstündeyken görünür, altındayken yerinde
   kırılmayan sayı ("N gün seninle") durur. Dayanak: kırık seriyi öne çıkarmak sonraki katılımı düşürdü (Silverman ve
   Barasch 2023, PubMed'de yok); bir günü kaçırmak alışkanlığı bozmadı (Lally 2010, PubMed'de yok).
5. **Günün cümlesi yalnız doğrulanmış olanı söyler.** Günlük ölçümlerin çoğu gürültüdür; "dünden değişim" ancak
   merkezin doğrulanmış değişim kuralı (`gelisim-nef.md` §4) "var" derse söylenir. Çoğu gün cümle bir düzen, bir ilk,
   bir kilometre taşı ya da bugün açılan basamak olur. Aynı kalıp iki gün üst üste gelmez (bildirimlerin etkisi
   zamanla azaldı: Klasnja 2019).
6. **Kanıt dürüstçe:** sağlık uygulamalarında bırakma yüksek (derlemede %43; gerçek kullanımda 30. gün kalma ortancası
   %3,3, nefes uygulamalarında %0). Bağlılığı artıran bileşenler kişiselleştirme, kişiye göre hatırlatma, kolay ve
   kararlı tasarım ve kişinin kendi verisini görmesi; etkiler küçük ve çalışmalar karışık (§4).
7. **Yay:** 1. gün İlk Bakış sonucu Ana sayfaya taşınır ("20 sn'de 3 kez kırptın; 28. gün yeniden bakacağız"),
   2. gün Yılan ve sağ–sol, 5. gün ilk rapor (denemenin bitiminden önce), 7. gün ilk hafta, 28. gün iris yan yana,
   29./57./85. gün aylık Nef; 90+ gün haftalık odak modülü ve mevsim (§5). **Bulgu:** "14. gün WHO-5" kodda bir
   kilometre taşı değil; WHO-5 hiç yapılmadıysa ilk günden "zamanı geldi" sayılır ve Ana sayfada hiç çıkmaz.
8. **Göstergeler telefonda hesaplanır;** yeni analiz SDK'sı yok (bugün de yok). Sahibin toplu görünümü App Store
   Connect (yalnız paylaşım izni verenlerden 1./5./28. gün kalma) ve RevenueCat (deneme → ücretli, yenileme). En
   önemli yeni gösterge "ilk dokunuşa kadar geçen süre" (5 saniye kuralının doğrudan ölçüsü), telefonda kalır (§6).
9. **İki küçük düzeltme bulgusu:** açılış ekranında logo var (Apple: marka ve yazı koyma); kamera izin metni İlk
   Bakış'taki okuma sırasındaki kırpma sayımını ve karar 3'teki günlük mesafe ölçümünü söylemiyor (App Review 5.1.1:
   amaç metni kullanımı "açık ve eksiksiz" anlatmalı).
10. İş dört parçada, her biri ayrı onay: A (S–M, hemen yapılabilir), B (merdivenlerden sonra), C (hava/ay işinden
    sonra), D (sessiz ölçümden sonra). Açık kararlar §9'da.

---

## 1. Bugünkü durum (kod)

### 1.1 İlk kez açan kişi (karar (b) sonrası; kodda bitti, cihazda denenmedi)

| Sıra | Ekran | Kod | İlk saniyelerde görünen |
|---|---|---|---|
| 0 | iOS açılış ekranı | `ios/App/App/Base.lproj/LaunchScreen.storyboard:15` "Splash" görseli; `Assets.xcassets/Splash.imageset` | açık/koyu düz zeminde ortada Nefona logosu (görsel bu oturumda açılıp bakıldı) |
| 1 | Giriş ekranı | `App.jsx:593`, `components/IntroFilm.jsx:50-57`, `lib/intro.js:4` (sürüm 3, hareketsiz) | "Nefona", "Fark etmeyi yeniden öğren.", "Başla" |
| 2 | İlk Bakış tanıtımı | `App.jsx:594-596`, `lib/setupFlow.js:14-21`, `lib/firstLookText.js:22-27` | "20 saniye · Önce bir şey fark edelim", "Başla"; sonra kamera izni |
| 3 | 20 sn okuma, sonuç | `lib/firstLookText.js:13-18, 33-44` | "X kez kırptın"; kaynak satırı (Abusharha 2017) |
| 4 | Hesap → güvenlik → 4 soru → Seni tanıyalım | `setupFlow.js:18-19`, `App.jsx:598-776` | form ekranları |
| 5 | İris haritası, deneme teklifi | `App.jsx:778-791` | harita; ödeme ekranı (7 gün deneme) |
| 6 | Ana sayfa | `screens/Home.jsx` | bkz. 1.2 |

Kişinin "vay" dediği an İlk Bakış'ın sonucudur; bu, ilk dokunuştan ≈ 30 saniye sonra gelir (iki "Başla", kamera
izni, "Birazdan başlıyor…" ve 20 sn okuma). İlk 5 saniyede verilen şey sonuç değil, **merak**tır ("Önce bir şey fark
edelim"). Bu dürüst bir sınırdır: kırpma sayısı 5 saniyede ölçülemez.

Site konsepti "Bu cümleyi okurken kaç kez göz kırptın?" (YAPILACAKLAR:76, şaşırtma 8,3/10) uygulamada zaten var, ama
**soru önce değil, sonuç ekranında** soruluyor: `firstLookText.js:5-6` bilerek kırpmayı anlatan bir metin seçmemiş ve
`:32` sayıyı okurken gizliyor, çünkü kişinin dikkati kırpmasına giderse ölçüm bozulur (VARSAYIM, kodda yazılı). Site
sayfasında soru önce sorulabilir (ölçüm yok); uygulamada sorulmamalı. Not: 20 konseptin listesi depoda yok
(YAPILACAKLAR yalnız kazananı yazıyor); iş akışının ajan kayıtlarından (`wf_8cb22f06-e72`) okundu, §3.4'te bu
belgenin önerisiyle eşleştirildi.

### 1.2 Her günün ilk açılışı (Ana sayfa)

Ana sayfanın 390 pt genişlikte ilk görünen alanı (27 Eylül ekran görüntüsü `scratchpad/hk-light-home.png`, bu
oturumda açıldı; koddaki sıra aynı):

| Alan | Kod | İçerik |
|---|---|---|
| Rıza sayfaları (varsa, üstte) | `Home.jsx:203-204` | profil eşitleme ya da Sağlık rızası; açıkken kart yuvası boş (`:188-189`) |
| Başlık | `Home.jsx:205-221` | tarih (`:207`), saate göre selam (`lib/greeting.js:2-9`), ad |
| Gün diyaframı ve sayılar | `Home.jsx:226-251` | "0 / 9 durak · ≈19 dk kaldı"; seri (`:236`, hesap `:152`), hafta (`:238`), adım (`:241-246`), "gün seninle" (`:247`) |
| Nef satırı + büyük düğme | `Home.jsx:253-272`, `lib/homeSuggest.js:21-51` | kural tabanlı tek cümle ("Güne Isınma ile başla." / "Önce kalk, 2 dakika yürü…") ve "Güne başla" düğmesi; Nefes, Dalga |
| (ekranın altı) | `Home.jsx:274-376` | harita, kart yuvası, akşam/28. gün kartları, Bugünün yolu, alarm kartı, çevrimiçi Nef kartı |

Bulgular:

- **Dünden hiçbir şey yok.** İlk ekran bugünün sayılarını gösterir; dünün sonucu, bugün açılan yeni basamak ya da
  yaklaşan kilometre taşı söylenmez. `homeSuggest.js` yalnız sıradaki durağı, yürüme uyarısını ve göz molasını bilir.
- **Çevrimiçi Nef ilk 5 saniyeye yetişemez.** `CoachCard` gün değişince ve sinyaller değişince sunucuya gider
  (`lib/coach.js:128-153`); önbellek aynı gün ve aynı sinyalle geçerli (`:133`), zaman aşımı 10 sn (`:13`). Günün
  ilk açılışında sinyaller her zaman yenidir, kart önce iskelet gösterir (`CoachCard.jsx:101-104`) ve zaten ilk
  görünen alanın altındadır (`Home.jsx:376`). Anında konuşan Nef sesi yalnız `homeSuggest` satırıdır (YOL.nef:56).
- **Sıfırlar ve kırık seri öne çıkıyor.** Seri, bugün boşsa dünden sayılır (`lib/stats.js:223-232`); bir gün
  atlayan kişi ertesi sabah ilk ekranda "0 gün seri" görür. İlk günün ilk ekranında üç sıfır var (seri, hafta,
  "gün seninle"; ekran görüntüsünde de). YOL.ilerleme:316 "seri bozuldu ekranı yok" diyor ve Nef'e "seri bozuldu"
  demek yasak (YOL.nef:306, :361); ama Ana sayfanın kendisi kırık seriyi sayıyla gösteriyor. Tasarım ilkesiyle kod
  arasında çelişki.
- **Tam ekran araya girenler ilk saniyeleri alıyor.** Güncellemeden sonraki ilk açılışta Yenilikler tam ekran
  (`App.jsx:795-798`); 5.–14. günler arasında ilk rapor Ana sayfanın yerine kendiliğinden açılır (`App.jsx:807`);
  rıza sayfaları Ana sayfanın üstünde (`Home.jsx:203-204`). İlk rapor bir kilometre taşıdır (istenen sürpriz);
  Yenilikler ve rıza sayfaları değildir.
- **Alarm sabahı ayrı:** alarmdaki "Nefona'yı aç"tan gelen kişi 10 dakika içinde Sabah ekranına gider
  (`App.jsx:94, 264-272`; `screens/AlarmMorning.jsx:5-20`). Onun ilk 5 saniyesi Ana sayfa değil, bu ekrandır.
- **"Günün ilk açılışı" diye bir kavram kodda yok** (arama: `lastOpen|openDay|firstOpenToday` sonuçsuz).
- **Analiz SDK'sı yok** (`package.json:15-31`; arama `analytics|telemetry|posthog|mixpanel|firebase|amplitude|sentry`
  sonuçsuz). Telefonda deney düzeni zaten var: bildirim günlüğü gönder/sessiz kolunu gün gün yazar, veri telefondan
  çıkmaz (`lib/notifyLog.js:1-19`).
- **Kilometre taşları kodda:** ilk rapor 5. gün (`lib/progress.js:203`, `App.jsx:807`), deneme hatırlatması 5. gün
  (`lib/restNotify.js:113`), "ilk haftan bitti" soruları (`Home.jsx:345-355`), iris 28. gün (`lib/iris.js:8, 44-48`,
  `Home.jsx:323-333`). WHO-5 ise 14 günde bir, ama **ilk kez yapılmadıysa ilk günden "zamanı geldi"**
  (`lib/progress.js:19, 41`) ve Ana sayfada, yolda hiç çıkmaz (Home.jsx ve today.js'te `who5` yok). YAPILACAKLAR:68
  "14. gün iyi oluş" bir tasarım sözü; kodda karşılığı yok.

### 1.3 Karar 3 (sessiz ölçüm) kodda

Henüz yok (uygulama sırasında (d)). Kamera izin metni bugün "testlerde 40 cm'yi doğrulamak ve göz kırpma egzersizinde
kapanmaları saymak" diyor (`ios/App/App/Info.plist:15-16`); İlk Bakış'ın okuma sırasındaki sayımı ve günlük mesafe
ölçümü bu metinde yok (§7).

---

## 2. Sahibin isteği (bu belgeye düşenler)

- "İlk 4 saniyede etkilemek gerekiyor, 5 sn kuralı önemli… ilk zamanlarda 5 sn etkileme kuralı önemli, kullanıcılar
  devamlı olması lazım." (SAHIP_ISTEKLERI, 29 Eylül akşam)
- "5 saniye zamanımız var, hadi insanları şaşırtalım… ilk önce 5 saniyede insanları nasıl şaşırtırız onu bulalım."
- "Önce kişileri kendimize bağlamalıyız; bu bağlanma kişinin kendi sağlığı için, her gün yapılan spor gibi."
- "Nef'in gidişatla ilgili yorumları olabilir." "Günün nasıl geçiyor ekranında ay durumu, hava durumu, yağmur durumu
  gözükecek."
- "Şu anki sistemi asla bozmuyoruz." "Bu yol sonsuz devam eder."
- Görev metni: kişiler bırakmasın, abonelik sürsün.

Okuma: sahibin "şaşırtma"sı her gün büyük bir gösteri olamaz (kanıt: yenilik etkisi söner, §4.4). Her gün
**küçük ve doğru bir kişisel şey**, belirli günlerde **büyük bir sürpriz** (kilometre taşları).

---

## 3. Soru 1 — Her günün ilk 4–5 saniyesi: ekran önerisi

### 3.1 Net kararlar (öneri)

1. **Yeni ekran yok.** Ana sayfa aynı kalır; yalnız günün ilk açılışında (yerel gün değiştikten sonraki ilk
   görünüm) üst alan üç öğeyle zenginleşir. Apple İnsan Arayüzü Yönergeleri: "Launch instantly… sometimes they
   don't want to wait more than a couple of seconds"; açılış ekranı "nearly identical to the first screen"; "Restore
   the previous state" ([Launching](https://developer.apple.com/design/human-interface-guidelines/launching)).
2. **Günün ilk açılışı** telefonda tek anahtarla tanınır: `gozolcum:day-open` → `{ day: 'YYYY-MM-DD', firstAt, firstTapAt,
   lead }`. `sessions`'a yazılmaz (etkinlik değildir; seriye, haftalık hedefe ve Nef'e girmesin: `habitLog.js`
   ve `notifyLog.js` ile aynı ilke). "Tüm verileri sil" bu anahtarı da siler.
3. **İlk görünen alan, saniye saniye** (390 pt; 320 pt'de gökyüzü şeridi ikinci satıra iner):

| Saniye | Göz nereye gider | İçerik | Kaynak | Bugünkü Home'dan farkı |
|---|---|---|---|---|
| 0–1 | açılış ekranı → Ana sayfa | düz zemin, logosuz (Apple: "Don't advertise… isn't a branding opportunity") | `LaunchScreen.storyboard` | logo kalkar (S) |
| 1–2 | tarih satırı | "29 Eylül Salı · ◐ ilk dördün · 18° · 16.00'dan sonra yağmur" | ay: telefonda hesap; hava: `gunun.md` §7.3 önbelleği | **yeni** şerit (C); dokununca `gunun.md` §7.1 "Bugün" sayfası |
| 1–2 | selam | "Günaydın, Haydar" | `greeting.js` | aynı |
| 2–4 | Nef satırı (göz simgeli) | **günün tek cümlesi** (§3.2) + altında "Nef · ilk durak Isınma, 1 dk" | yeni `lib/dayOpen.js` leadLine, kural şablonu | satırın metni günün ilk açılışında değişir (A) |
| 4–5 | büyük düğme | "Güne başla · Sağ–sol bakış · 1 dk" + küçük **"Yeni"** rozeti | `homeSuggest.js`; basamak `merdiven.md` §4 | rozet yeni (B) |
| (yan) | gün diyaframı ve sayılar | "0/9 durak · ≈15 dk"; "3 gün seri" yalnız ≥ 3 ise, değilse "12 gün seninle"; sıfır satırı yok | `Home.jsx:226-251` | sıfırlar ve kırık seri kalkar (A) |

4. **Günün cümlesi**, günün ilk dokunuşuna kadar ya da en çok 1 saat görünür; sonra `homeSuggest` bugünkü gibi
   çalışır (kaldığın yerden, yürüme uyarısı). Böylece günün geri kalanı bugünkü davranıştır.
5. **İlk 5 saniyede tam ekran yok:** Yenilikler günün ilk dokunuşundan sonra (ya da ilk durak bitince) gösterilir;
   rıza sayfaları günün ilk açılışında değil, ikinci açılışında ya da ilk durak bitince açılır. **İlk rapor (5. gün)
   ve kırmızı görme uyarısı istisnadır**: biri günün sürprizidir, öbürü güvenliktir.
6. **Kırmızı ya da sarı görme uyarısı varsa** günün cümlesi yazılmaz; uyarının sabit cümlesi (`lib/trend.js`
   `trendMessage`, bugün `Home.jsx:405-412`'de ekranın altında) Nef satırının yerine en üste çıkar. Tehlike
   cümlesi modele ya da şablona bırakılmaz (YOL.nef §7.2).
7. **Alarm sabahı:** Sabah ekranı (`AlarmMorning.jsx`) aynı gökyüzü şeridini tarih yerine üstte gösterir; yağmur
   bekleniyorsa "Perdeyi aç, gün ışığı al" satırı değişmez (ışık yine dışarıdan gelir), yalnız şeritte yağmur yazar.
   (Seçenek; §9 K5.)
8. **Sessiz ölçüm (karar 3) açıksa:** ilk 5 saniyede gökyüzü şeridinin yerinde "● 34 cm" canlı yazar; kamera
   kendiliğinden kapanınca şerit gökyüzüne döner. Kamera 3 saniyede hazır olmazsa ölçüm o gün sessizce atlanır;
   Ana sayfanın çizimi kamerayı hiç beklemez (VARSAYIM: 3 sn eşiği; cihazda ölçülecek).

### 3.2 Günün tek cümlesi: kural (ilk tutan kazanır)

Hepsi merkezdeki kayıtlardan, telefonda, ağsız hesaplanır. Nef'in rızası gerekmez, çünkü veri telefondan çıkmaz
(`homeSuggest` satırı bugün de rızasız konuşuyor; YOL.nef §8.3 "Nef rıza olmadan da konuşsun" önerisiyle aynı).
Cümle kalıpları `gelisim-nef.md` §7.3 tablosuyla aynı iskelettir; burada yalnız **hangisinin ilk ekrana çıktığı**
belirlenir.

| Öncelik | Durum (kayıttan) | Örnek cümle | Not |
|---|---|---|---|
| 0 | kırmızı/sarı görme uyarısı | (cümle yok; uyarı kartı en üstte, §3.1-6) | güvenlik |
| 1 | kurulumun ertesi günü ya da 1. gün Ana sayfa | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." | `profile.firstLook` (`setupFlow.js:28-32`), `IrisRecheck` 28. gün İlk Bakış'ı yineler (`Home.jsx:326-327`) |
| 2 | bugün kilometre taşı | "Bugün 28. gün: iris haritan başlangıçla yan yana." / "Bugün haftalık E testi günü." | `iris.recheckDue`, `today.js weeklyStatus` |
| 3 | ara sonrası dönüş (son etkin günden bu yana ≥ 2 gün) | "Kaldığın yerden: basamakların aynı." | `gelisim-nef.md` §7.3 "ara" satırı; "seri bozuldu", "kaçırdın" YASAK |
| 4 | dün bir ilk ya da rekor (modülün `coach()` özeti) | "Dün Yılan'da 38 ile en iyi sonucunu yaptın." | yalnız kayıtta olan sayı |
| 5 | merkezde yeni **doğrulanmış** değişim olayı | "Tek Bakışta'da iki haftadır başlangıcının üstündesin." | `gelisim-nef.md` §7.1 "olay"; ham fark asla |
| 6 | bugün yeni basamak ya da modül (B'den sonra) | "Bugün yeni: sağ–sol bakış." | `merdiven.md` §4.1, §5.2 |
| 7 | dün yol tamam | "Dün yolun tamamdı. Bugün 9 durak, ≈15 dk." | `buildPath` dün için yeniden kurulmaz; dünün kayıtları yeter (VARSAYIM: "tamam" = dünün ilk durak kümesi) |
| 8 | yaklaşan kilometre taşı (≤ 3 gün) | "İris haritan 3 gün sonra başlangıçla yan yana." | geri sayım |
| 9 | hiçbiri | bugünkü `homeSuggest` satırı | değişmez |

Kurallar:
- **Aynı öncelik satırı iki gün üst üste çıkmaz** (bir alttakine geçilir); 1 ve 0 hariç. Gerekçe: öneri ve bildirim
  etkisi zamanla söndü (Klasnja 2019; §4.4).
- Cümle en çok 70 karakter (390 pt'de iki satır; VARSAYIM). Tek sayı, tek iddia. Karşılaştırma yalnız kişinin kendi
  başlangıcıyla. "İyileşti", "gelişiyorsun", "sağlıklı" yok (YOL.nef §5.6; `gelisim-nef.md` §7.2).
- Cümle `gozolcum:day-open.lead`'e yazılır: gün içinde aynı cümle kalır (açıp kapayınca değişmez).
- Günün ilk açılışında çevrimiçi Nef kartı yine istek atar; kart ekranın altındadır, ilk 5 saniyeyi etkilemez.
  `gelisim-nef.md` §7.1 "olay" satırını Ana sayfa **kartına** koyuyor; bu belge olay satırını **üstteki Nef
  satırına** taşır (anında, ağsız). Kart o gün olayı tekrarlamaz (düzeltme önerisi, §8).

### 3.3 İlk kez açan kişi için (tek öneri, küçük)

İlk açılış sırası (karar (b)) doğru: ilk dakika bir form değil, kişinin kendi sayısı. İki küçük seçenek:
- **K1 (seçenek):** Giriş ekranının alt yazısı "Fark etmeyi yeniden öğren." yerine İlk Bakış'ın vaadini söylesin
  ("20 saniyede, fark etmediğin bir şeyi göstereceğiz."). Giriş ekranı onaylı bir tasarım (`IntroFilm.jsx:15`);
  değişiklik sahibinin kararı.
- **K2 (seçenek):** Giriş ekranı ile İlk Bakış tanıtımı tek ekrana insin (bir dokunuş eksik). Risk: onaylı giriş
  ekranı değişir; kamera izni ilk dokunuşta sorulur (erken). Öneri: şimdilik yapma; önce cihazda ilk dokunuştan
  sonuca kadar geçen süreyi ölç (§6 G1).
- Soruyu önceden sorma: uygulamada ölçüm bozulur (§1.1). Site sayfası ayrı iştir.

### 3.4 20 konseptle ilişki (neyi alıyoruz, neyi almıyoruz)

Uygulamaya dönük konseptler (kimlikler iş akışındaki gibi; puanlar YAPILACAKLAR'da yalnız kazanan için yazılı):

| Konsept | Durum | Bu belgede |
|---|---|---|
| `psikoloji-once-olcum-sonra-hesap`, `rakipler-01` (önce ölç, sonra hesap) | kodda bitti (karar (b)) | §1.1 |
| `psikoloji-donuste-tek-sayi` (geri gelenin ilk 5 saniyesi: kendi sayısı) | alındı | §3.2 öncelik 3 ve 4 |
| `rakipler-04` ("Dün 9, bugün 12 kırpma") | **alınmadı, düzeltildi**: tek günlük ham fark çoğunlukla gürültüdür; yalnız doğrulanmış değişim söylenir | §3.2 öncelik 5 |
| `rakipler-05` (Sağlık'tan "son 1 saatte 40 adım; kalk, 2 dk yürü") | kodda var (`homeSuggest.js:33-35`) | değişmez |
| `app-ilk-acilis-gokyuzu-simdi` (gökyüzü şimdi) | sade hâli alındı: ay evresi + hava; yıldız haritası yok | §3.1 tablo, C |
| `app-ilk-acilis-sessiz-olcum`, `rakipler-03` (mesafe aynası) | karar 3 | §3.1-8, D |
| `psikoloji-yarin-sabah-secimi` ("Yarın sabah 1 dakika, hangisi?") | açık karar (sabah çağrısı zayıf kanıt) | §9 K10 |
| `app-ilk-acilis-goz-kapat-basla`, `app-ilk-acilis-nefes-alan-iris`, `app-ilk-acilis-goz-aynasi` | bu belgede önerilmez: her gün kamera açmak karar 3'le çelişir (kapalı başlar, her açılışta değil) | — |
| `psikoloji-gozbebegi-sorusu` (giriş ekranında tek soru) | §3.3 K1 ile aynı yönde, seçenek | §9 K8 |

### 3.5 Mevcut sistem nasıl bozulmaz

- `homeSuggestion` imzası aynı kalır; yeni isteğe bağlı `lead` alanı gelir. Verilmezse bugünkü çıktı (bugünkü
  testler değişmez).
- `buildPath`, `today()` sözleşmesi, göz bütçesi, yol kuralları hiç değişmez; `merdiven.md`'nin `ctx.progression`
  katmanı gelmeden B parçası çalışmaz, A ve C çalışır.
- Seri hesabı (`stats.js:223`) değişmez; yalnız Ana sayfadaki **gösterim** kuralı değişir. Gelişim'deki seri ve Nef'e
  giden `streakDays` aynı kalır.
- Yeni kayıt `sessions`'a girmez; veri merkezi, Gelişim ve raporlar etkilenmez.

---

## 4. Soru 2 — Devamlılık: kanıt (sağlık iddiası değil; tasarımı yönlendirir, kullanıcıya söylenmez)

PubMed kayıtları bu oturumda PubMed MCP ile çekildi.

### 4.1 Alışkanlık ne kadar sürer, ne besler

- **Lally 2010** (Eur J Soc Psychol 40(6):998-1009, [doi:10.1002/ejsp.674](https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674);
  **PubMed'de yok**, yayıncı sayfası ve arama sonuçlarıyla doğrulandı): 96 gönüllü 12 hafta her gün aynı bağlamda bir
  davranış seçti; otomatikliğin düzleşmesi ortalama 66 gün, aralık 18–254 gün; **ara sıra bir fırsatı kaçırmak süreci
  ciddi bozmadı**. Sınır: tek çalışma, kişiler arası fark çok büyük; "66 gün" bir hedef değil, kaba bir ortalama.
- **Singh 2024** (Healthcare (Basel), PMID 39685110, [DOI](https://doi.org/10.3390/healthcare12232488); uygulamada
  kaynak `lib/sources.js:230`): 20 çalışma, 2601 kişi; süre bildiren 4 çalışmada ortanca 59–66 gün, ortalama 106–154
  gün, kişiler arası 4–335 gün; müdahale sonrası alışkanlık puanı arttı (SMD 0,69); **sabah yapılan ve kişinin kendi
  seçtiği** alışkanlıklar daha güçlü. Sınır: 11 çalışma yüksek yanlılık riskli, sayı az.
- **Keller 2021** (Br J Health Psychol, PMID 33405284, [DOI](https://doi.org/10.1111/bjhp.12504)): RKÇ, 192 yetişkin, 84
  gün; alışkanlık kuranlarda tepe otomatikliğe ortanca 59 gün; rutine bağlı ipucu ile saate bağlı ipucu arasında fark
  yok; **planı tekrar tekrar yapmak** en güçlü yordayıcı.
- **Kaushal ve Rhodes 2015** (J Behav Med, PMID 25851609, [DOI](https://doi.org/10.1007/s10865-015-9640-7)): 111 yeni
  spor salonu üyesi; haftada ≥ 4 kez, 6 hafta; tutarlılık (β 0,21), düşük karmaşıklık (0,19), ortam (0,17), keyif
  (0,13) alışkanlığı yordadı. Sahibin "spor gibi" benzetmesine en yakın veri.
- **Gardner 2012** (Br J Gen Pract, PMID 23211256, [DOI](https://doi.org/10.3399/bjgp12X659466)): aynı bağlamda tekrar;
  yorum yazısı, özet yok, sayı vermez.

Tasarıma çevirisi (zaten kararlaştırılmış olanlarla aynı): küçük başlangıç (nefes 1 dk, tek egzersiz;
`merdiven.md` §5), her gün aynı saat (hatırlatma sistemi var), ceza yok (YOL.ilerleme §2.3), keyif (Yılan 2. gün).
**Bu belgenin eki:** kırık seriyi gösterme (4.3) ve yolu **sabah** başlatmaya çağır (Singh 2024: sabah
alışkanlıkları daha güçlü; tek ve zayıf bir bulgu, zorunlu değil: hatırlatma saatini kişi seçer).

### 4.2 Bırakma ne kadar yaygın

- **Meyerowitz-Katz 2020** (J Med Internet Res, PMID 32990635, [DOI](https://doi.org/10.2196/20283)): kronik
  hastalık uygulamaları, 17 çalışma; birleşik bırakma %43 (%95 GA 29–57), gözlemsel çalışmalarda %49; çalışmalar
  arası fark çok büyük (I² > %99).
- **Baumel 2019** (J Med Internet Res, PMID 31573916, [DOI](https://doi.org/10.2196/14567)): 93 ruh sağlığı
  uygulaması, bağımsız kullanım paneli; günlük açılma oranı ortanca %4,0; **15. gün kalma %3,9, 30. gün %3,3**;
  30. günde **nefes uygulamalarında ortanca %0,0**, farkındalık/meditasyonda %4,7, izleme (tracker) uygulamalarında
  %6,1. Nefona için ayıltıcı: yalnız nefes sunan bir uygulama olsaydık neredeyse kimse kalmazdı; ölçüm + izleme +
  çeşit, bu verideki daha iyi grupların özelliği (nedensellik değil).
- **Linardon ve Fuller-Tyszkiewicz 2019** (J Consult Clin Psychol, PMID 31697093, [DOI](https://doi.org/10.1037/ccp0000459)):
  70 RKÇ; bırakma kısa izlemde %24,1, uzun izlemde %35,5; **katılımcılara hatırlatma yapılan** çalışmalarda
  bırakma daha düşük; kullanım çalışma boyunca sürekli azaldı.
- **Lau 2022** (Front Public Health, PMID 36438245, [DOI](https://doi.org/10.3389/fpubh.2022.914433)): 41.207
  kullanıcı, 12 ay, bir yürüyüş uygulaması; %60'tan fazlası ≥ 6 ay kullandı; **ara verip geri dönmek olağan**
  ("birden çok hayat"): ilk araya ortanca 18 hafta, ikinci döneme dönüş 12–32 hafta. Tasarıma çevirisi: dönen kişi
  "kaldığın yerden" karşılanır (§3.2 öncelik 3); dönüş bir gösterge olarak sayılır (§6 G5). Sınır: ödüllü (puanlı)
  bir uygulama, gözlemsel.

### 4.3 Seri (streak): göster ama kırığını gösterme

- **PubMed'de seri kırılmasının etkisini doğrudan ölçen bir çalışma bulunamadı** (arama:
  `streak AND (app OR digital) AND (engagement OR adherence OR habit)` ve `streak AND motivation AND broken`; çıkan
  kayıtlar ilgisiz ya da yalnız betimleyici, ör. Wiecek 2026 yaşlılarda seri izleyiciyi kullananlar %26,5,
  PMID 42078174, bir şirket verisi).
- **Silverman ve Barasch 2023** (J Consum Res 49(6):1095-1117, [doi:10.1093/jcr/ucac029](https://doi.org/10.1093/jcr/ucac029);
  **PubMed'de yok**, yayıncı özeti okundu): 7 çalışma; kayıtta **bozulmamış** seriyi öne çıkarmak, bozulmuş seriyi öne
  çıkarmaya göre sonraki katılımı artırdı; etki geçmiş davranıştan bağımsız, yalnız kaydın nasıl gösterildiğine bağlı;
  kişi kırılmayı kendine yüklediğinde güçleniyor, seri "onarılabildiğinde" zayıflıyor. Sınır: tüketici davranışı
  deneyleri, sağlık uygulaması değil.
- **Mazeas 2022** (J Med Internet Res, PMID 34982715, [DOI](https://doi.org/10.2196/26779)): oyunlaştırma, fiziksel
  aktivitede 16 RKÇ, 2407 kişi; etki g = 0,42, izlemde g = 0,15 (küçük). Seri tek başına ölçülmemiş.

Karar önerisi (§3.1 tablosu): seri Ana sayfada yalnız **≥ 3 gün** iken (Silverman'ın seri tanımı: üç ya da daha çok)
görünür; altında hiç görünmez, yerinde "N gün seninle" (hiç azalmayan sayı) durur. Gelişim'de seri, en uzun seri ve
toplam gün yine görünür (orada kişi kendi verisini inceler). Bildirimde seri kaybı korkusu **hiç** kullanılmaz ("serini
kaybetme" yok); bu hem ceza yok ilkesi hem App Review 4.5.4'ün ruhu (§7).

### 4.4 Bağlılığı artıran bileşenler (sistematik derlemeler)

- **Jakob 2022** (J Med Internet Res, PMID 35612886, [DOI](https://doi.org/10.2196/35371)): 99 çalışma; bütün alanlarda
  bağlılığı artıran dört bileşen: **içeriğin kişiye göre uyarlanması**, **kişiye göre anlık bildirim hatırlatmaları**,
  **kullanımı kolay ve teknik olarak kararlı tasarım**, dijital müdahaleye eşlik eden **kişisel destek**; sosyal ve
  oyun öğeleri birkaç alanda. Ortalama bağlılık (amaçlanan kullanıma göre) %56. Sınır: çoğu kısa pilot çalışma.
- **Borghouts 2021** (J Med Internet Res, PMID 33759801, [DOI](https://doi.org/10.2196/24387)): 208 makale; engeller
  kişiselleştirme eksikliği ve teknik sorunlar; kolaylaştırıcılar **sağlığına dair içgörü kazanmak**, **kendi
  sağlığını kontrol ettiğini hissetmek**, sosyal bağ.
- **Michie 2009** (Health Psychol, PMID 19916637, [DOI](https://doi.org/10.1037/a0016136)): 122 değerlendirme, 44.747
  kişi; **kendini izleme** çalışmalar arası farkın en büyük payını açıkladı; kendini izleme + kontrol kuramından bir
  teknik daha (hedef, geri bildirim) birlikte olunca etki 0,42'ye karşı 0,26.
- **Bidargaddi 2018** (JMIR Mhealth Uhealth, PMID 30497999, [DOI](https://doi.org/10.2196/10123)): 1255 kişi, 89 gün,
  mikro-randomize; kişiye uyarlanmış bildirim gönderilen günlerde sonraki 24 saatte uygulamayı kullanma %3,9 daha
  olası (RR 1,039; küçük); hafta sonu öğlen en yüksek.
- **Klasnja 2019** (Ann Behav Med, PMID 30192907, [DOI](https://doi.org/10.1093/abm/kay067)): 44 kişi, 6 hafta,
  mikro-randomize; yürüme önerisinin etkisi başta büyük (+%107), **zamanla azaldı**.

Tasarıma çevirisi: ilk 5 saniyedeki cümle **kişiseldir** (kendi kaydı), **içgörü** verir ("dün yolun tamamdı",
"28. gün yan yana") ve **kontrolü kişiye** bırakır (tek düğme, "sonra yaparım" serbest). Aynı cümle tekrarlanmaz
(Klasnja). Bildirimler az ve kişiye göre kalır (bugünkü bildirim planı zaten gönder/sessiz deneyiyle ölçüyor,
`notifyLog.js`). "Kişisel destek" bizde insan değil; Nef bunun yerine geçmez, geçer gibi de anlatılmaz.

---

## 5. Soru 3 — Deneyim yayı: ilk 7 gün, ilk 30 gün, 90+ gün

Yolun gün gün içeriği `merdiven.md` §6'dadır (benzetim, cihazda denenmedi); aşağıdaki tablo yalnız **o günün ilk 5
saniyesinde** ne göründüğünü ve günün sürprizini verir. "Gün" = kurulumdan sonraki takvim günü; merdivenler yapılan
güne göre ilerler (atlayan için kayar, ceza yok).

### 5.1 İlk 7 gün (deneme süresi; hedef: "bu uygulama beni tanıyor")

| Gün | İlk 5 saniyede (günün cümlesi) | Günün sürprizi | Kod/kaynak |
|---|---|---|---|
| 1 | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." | İlk Bakış sonucu, iris haritası (kurulumda) | `setupFlow.js`, `IrisPlan` |
| 2 | "Bugün yeni: sağ–sol bakış. Yılan da açıldı." | Yılan'ın açılması (1. gün bilerek kısa; YOL.ilerleme §5.7) | `merdiven.md` §5.2, §5.4 |
| 3 | "Dün yolun tamamdı. Bugün yeni: üçü birlikte." | ilk yoga bölümü (yoga planı onayıyla) | `merdiven.md` §6 |
| 4 | "Nefes 3 dakikaya çıktı." ya da dünün rekoru | yukarı–aşağı | `merdiven.md` §5.1 |
| 5 | (ilk rapor kendiliğinden açılır) | **İlk rapor**: 5 günün kendi sayıları, denemenin bitiminden önce | `App.jsx:807`, `progress.js:203` |
| 6 | "Bugün yeni: Fark Ettin mi?" | yeni pratik (D ≥ 5) | YOL.ilerleme §5.8 |
| 7 | "İlk haftan: 6 gün." (sayı kaydan) | "İlk haftan bitti" iki soru (isteğe bağlı) | `Home.jsx:345-355` |

Deneme 7 gün (`screens/Paywall.jsx:23-24`, yedek fiyat listesi). Kişi ödeme kararını 5. gün raporundan sonra verir;
bu, kodda zaten bilinçli (`progress.js:202`). Öneri: 5. gün raporunun ilk ekranında kişinin kendi en güçlü sayısı
(ör. yaptığı gün sayısı ve İlk Bakış ile son kırpma sayımı yan yana) en üstte; rapor "neyi ölçtük, neyi henüz
bilmiyoruz" diye bitsin (görmede başlangıç en erken 22. günde hazır; YAPILACAKLAR (a)). Ayrı iş, `FirstReport`
metnine dokunur (S).

### 5.2 8–30. günler (hedef: "düzenim oturuyor, bir şey birikiyor")

| Gün | Kilometre taşı | İlk 5 saniyede | Not |
|---|---|---|---|
| 8 | 2. haftalık E testi | "Bugün haftalık E testi günü." | `today.js weeklyStatus` |
| 14 | ilk iki hafta | "İki haftada 11 gün." | **WHO-5 burada bir kilometre taşı olacaksa kod değişmeli** (§1.2 bulgu; §9 K3) |
| 22 | görmede başlangıç hazır (en erken) | "Görmende başlangıç değerin hazır; bundan sonra değişim izlenecek." | YAPILACAKLAR (a); `trend.js` |
| 25 | geri sayım | "İris haritan 3 gün sonra başlangıçla yan yana." | §3.2 öncelik 8 |
| 28 | **iris yan yana** | "Bugün 28. gün: iris haritan başlangıçla yan yana." | `iris.js:44-48`, `Home.jsx:323-333` |
| 29 | ilk aylık Nef | "Nef'in ilk ay değerlendirmesi hazır." | `gelisim-nef.md` §7.1 (29., 57., 85. gün) |

Sahibinin "sonsuz yol"u burada görünür olur: 28. gün bir bitiş değil, "yan yana" anıdır; ertesi gün yol aynı saatte,
aynı uzunlukta sürer (`merdiven.md` §6: 29. gün 17 dk).

Abonelik açısından not (dürüstlük sınırıyla): aylık planda ilk yenileme 37. gündür (7 gün deneme + 30 gün). 28. gün
iris ve 29. gün aylık Nef bu tarihten önce gelir; 57. ve 85. gün aylık Nef de 67. ve 97. gündeki yenilemelerden önce.
Bu, "değeri ödeme gününden önce gösterme" düzenidir; ödeme hatırlatması ya da "kaybedeceksin" dili değildir. Apple
3.1.2(a): abonelik "must provide ongoing value" ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)).

### 5.3 31–90. günler ve sonrası (hedef: "benim düzenim; ara verirsem de dönerim")

- **Otomatiklik penceresi:** Lally'nin ortalaması (66 gün) ve Singh'in ortancaları (59–66) bu aralıkta. Uygulama bunu
  kullanıcıya "66 günde alışkanlık" diye **söylemez** (kişiler arası 4–335 gün; söz verilemez).
- **Varyantlar ve odak:** `merdiven.md` §5 ve YOL.ilerleme §8.6: 43. günden kalıp çeşitlemesi, 57. günden haftada bir
  tam set günü; 90+ gün her hafta bir "odak modülü". İlk 5 saniyede "Bu haftanın odağı: yakın–uzak." (§3.2 öncelik 6
  kapsamına girer).
- **Mevsim ve gökyüzü:** gökyüzü şeridi her gün farklıdır (ay evresi 29,5 günde bir döner; hava). Bu, uygulamanın
  her gün "aynı ekran" olmamasının ucuz ve dürüst yoludur. Dolunay gibi günlerde yalnız betimleme ("Bu gece dolunay");
  ayla uyku ya da sağlık ilişkisi iddia edilmez (kanıtı `gunun.md` işi).
- **Ara ve dönüş:** 3–13 gün ara → "Kaldığın yerden."; ≥ 14 gün → o gün bir basamak yumuşak (YOL.ilerleme:318,
  `merdiven.md` §4.8). Lau 2022'ye göre ara vermek olağandır; dönen kişi hiçbir sayının sıfırlandığını görmez.
- **Yıllık:** 365. gün iris ve İlk Bakış yıllık yan yana (öneri; kod yok, VARSAYIM; §9 K6).

---

## 6. Soru 4 — Ölçülecek bağlılık göstergeleri (gizlilikle)

### 6.1 İki katman

| Katman | Nerede hesaplanır | Kim görür | Dışarı çıkar mı |
|---|---|---|---|
| Kişisel | telefonda, merkezdeki kayıtlardan ve `gozolcum:day-open` anahtarından | kişi (Gelişim "Düzen"), Nef (yalnız özet sayı, rızayla, bugünkü paket gibi) | Nef rızasıyla yalnız sayılar; başka hiçbir yere |
| Toplu (sahip) | Apple ve RevenueCat'in kendi sistemleri | sahip | yeni bir veri akışı yok |

**Yeni analiz SDK'sı eklenmez.** Toplu görünüm iki mevcut kaynaktan gelir:
- **App Store Connect Analiz:** kalma oranı "yalnız tanı ve kullanım bilgisini paylaşmayı kabul eden
  kullanıcılardan"; 1. ve 5. gün gibi günlerde kurulumdan sonra açılan cihaz yüzdesi; yeterli sayı yoksa hücreler
  boş ([App retention](https://developer.apple.com/help/app-store-connect-analytics/engagement/app-retention/),
  [Measure app retention](https://developer.apple.com/help/app-store-connect/view-app-analytics/measure-app-retention/)).
- **RevenueCat** (uygulamada zaten var, `package.json:26`): deneme → ücretli dönüşüm, yenileme, iptal. Bu, sahibin
  "abonelik sürsün" hedefinin doğrudan ölçüsüdür; uygulamaya yeni kod gerekmez (VARSAYIM: panelde bu metrikler
  hazır; bu oturumda RevenueCat belgesi okunmadı).

### 6.2 Kişisel göstergeler (telefonda)

| # | Gösterge | Tanım | Kaynak | Neden |
|---|---|---|---|---|
| G1 | **İlk dokunuş süresi** | günün ilk açılışından ilk durağın başlamasına kadar saniye; 7 günlük ortanca | `day-open.firstAt`, `firstTapAt` | 5 saniye kuralının doğrudan ölçüsü |
| G2 | Günün ilk açılışından sonra durak başlatma oranı | ilk açılışta en az bir durak başlatılan gün / açılan gün (28 gün) | `day-open` + `sessions` | açılış "işe" dönüşüyor mu |
| G3 | Etkin gün | son 7 ve 28 günde en az bir kayıt olan gün | `calendar.js activeDays` (var) | düzen |
| G4 | Yol tamamlama | o gün yolun tamamlandığı gün oranı | `buildPath` o günün kayıtlarıyla (VARSAYIM: geçmiş gün için yeniden kurma yerine günlük tek satır özet; `merdiven.md` kararıyla) | yük fazla mı |
| G5 | Dönüş | ≥ 3 günlük aradan sonra geri gelinen ara sayısı ve ara uzunluğu | `activeDays` | "birden çok hayat" (Lau 2022) |
| G6 | Durak bazında bırakma | "sonra yaparım" ve yarıda bırakma, modül modül (7 gün) | `later7` (YOL.ilerleme:319), yarım kayıtlar | hangi modül insanları kaçırıyor |
| G7 | Kilometre taşı görülmesi | ilk rapor açıldı mı, 28. gün yan yana yapıldı mı | `settings.firstReportSeen`, `profile.iris.recheck` (var) | sürpriz yerine ulaştı mı |
| G8 | Bildirimden açılış | gönderilen/sessiz günlerde kayıt oranı | `notifyLog.js` (var, telefonda deney) | hatırlatma işe yarıyor mu |
| G9 | Günün cümlesi türü → durak başlatma | hangi öncelik satırı gösterildiğinde G2 daha yüksek | `day-open.lead` | cümle kurallarını ayarlamak |

G1, G2 ve G9 kişiye gösterilmez (kişi için anlamı yok); **TestFlight derlemesinde** Profilim → Hakkında'nın altında bir
"geliştirici" satırıyla sahibe ve denemecilere görünür (VARSAYIM: yalnız test derlemesi; `access.testUnlock` benzeri
bir bayrakla). Yayın sürümünde bu sayılar hesaplanır ama gösterilmez ve gönderilmez. İleride sahibin toplu görmesi
istenirse bu **ayrı bir açık rıza** ve rıza metni ister (App Review 5.1.1; §7); bu belge bunu önermiyor.

G9'un ileride telefonda deneye dönüşmesi mümkündür (bildirim günlüğündeki gönder/sessiz düzeniyle aynı: günün
cümlesini bazı günler bilerek yazmamak ve G2'yi karşılaştırmak). Ama bugünkü bildirim deneyi zaten 21 gün ve 5 sessiz
gün bekliyor (`notifyLog.js:16-17`); iki deney aynı kişide aynı anda yürürse ayrışmaz. Öneri: ilk sürümde deney yok.

### 6.3 Hedef değerler

Hedef konmaz (bizim verimiz yok). Karşılaştırma için dış çıpalar yalnız bağlam içindir: 30. gün kalma ortancası %3,3
(Baumel 2019, ruh sağlığı uygulamaları), bağlılık ortalama %56 (Jakob 2022). Nefona'nın ilk 3 ayı kendi başlangıcını
kurar; hedef ondan sonra sahibin kararıdır (VARSAYIM).

---

## 7. Gizlilik ve güvenlik

- `gozolcum:day-open` yalnız telefonda; kimlik, konum, görüntü içermez; `sessions`'a girmez; "Tüm verileri sil" ve
  veri dışa aktarma listesine eklenir (dışa aktarma için karar §9 K7).
- Günün cümlesi telefonda üretilir; hiçbir veri gitmez. Çevrimiçi Nef'in paketi değişmez (`gelisim-nef.md` §7.4).
- Gökyüzü şeridi: konum ve hava verisinin kuralları `gunun.md` §7.3 ve §9'dadır (önce profildeki şehir; konum
  isteğe bağlı, yaklaşık; App Review 5.1.5). Ay evresi konumsuz, ağsız hesaplanır. Hava henüz alınmadıysa şerit yalnız
  ay evresini gösterir; ilk 5 saniye ağ beklemez.
- Sessiz ölçüm (karar 3): kamera ancak kişi açtıysa, 5 sn, görüntü kaydedilmez. **Kamera izin metni güncellenmeli**
  (`Info.plist:15-16`): bugünkü metin İlk Bakış'taki okuma sırasındaki kırpma sayımını ve günlük mesafe ölçümünü
  söylemiyor. App Review 5.1.1: "Ensure your purpose strings clearly and completely describe your use of the data"
  ([Guidelines](https://developer.apple.com/app-store/review/guidelines/)). Öneri metni (sahibin onayına):
  "Ön kamera, göz kırpmalarını saymak ve telefonun gözünden uzaklığını ölçmek için kullanılır (İlk Bakış, testler,
  egzersizler ve açarsan günlük kısa ölçüm). Görüntüler cihazdan çıkmaz ve kaydedilmez."
- Bildirim: seri kaybı, "geri dön" ya da "seni özledik" türü pazarlama bildirimi yok. App Review 4.5.4: bildirimler
  tanıtım ve doğrudan pazarlama için ancak açık rızayla ve vazgeçme yoluyla kullanılabilir. Yağmur bildirimi
  (`gunun.md` §7.3) bir hatırlatmadır, kişi açarsa gelir.
- Ceza dili yasak listesi Ana sayfaya da uygulanır: "seri bozuldu", "kaçırdın", "geride kaldın" (YOL.nef:361) günün
  cümlesi şablonlarında da test edilir.
- Sağlık iddiası yok: günün cümlesi etki söylemez ("Nefes seni sakinleştirdi" değil; `gelisim-nef.md` §7.3).

---

## 8. Uygulanabilirlik, iş büyüklüğü, kardeş belgelerle ilişki

| Parça | İçerik | Dosyalar (dokunulacak) | Büyüklük | Bağımlılık |
|---|---|---|---|---|
| **A** | günün ilk açılışı anahtarı; `lib/dayOpen.js` (`isFirstOpenToday`, `leadLine`, öncelik 0–5, 7–9; saf fonksiyon + testler); `homeSuggestion` isteğe bağlı `lead`; Ana sayfada sıfırların ve kırık serinin gizlenmesi; Yenilikler ve rıza sayfalarının ilk dokunuştan sonraya kayması; G1–G3, G5, G7 hesapları; logosuz açılış ekranı; kamera izin metni | `lib/dayOpen.js` (yeni), `lib/homeSuggest.js`, `screens/Home.jsx:152, 176, 203-204, 236-247, 253-257`, `App.jsx:795-798`, `LaunchScreen.storyboard`/`Splash.imageset`, `Info.plist:16`, mola modülünün `storageKeys` listesi | **M** (≈ 1–2 gün kod + test + iki tema, 390/320 px) | yok |
| **B** | öncelik 6 ("Bugün yeni"), "Yeni" rozeti, 90+ gün odak cümlesi | `lib/dayOpen.js`, `components/TodayPath.jsx` ya da `homeSuggest.js` | S | `merdiven.md` (c) ilerleme katmanı |
| **C** | gökyüzü şeridi (ay: telefonda formül; hava: önbellek) Ana sayfa ve Sabah ekranında | `Home.jsx:207`, `AlarmMorning.jsx:11` | S (şerit) | `gunun.md` hava/konum işi (WeatherKit, M–L orada) |
| **D** | sessiz ölçüm "● 34 cm" şerit yerinde | `Home.jsx`, kamera kancası | S (bu belgenin payı) | karar 3 (d) |
| **Ayrı** | 5. gün raporunun ilk ekranı (§5.1), WHO-5'in 14. gün kilometre taşı olması (§9 K3) | `screens/FirstReport.jsx`, `lib/progress.js`, `Home.jsx` | S + S | sahibin kararı |

Kardeş belgelere düzeltme notları:
- `gelisim-nef.md` §7.1: "olay" satırının yeri "Ana sayfa kartı" yerine **üstteki Nef satırı** (anında, ağsız); kart
  o gün olayı yinelemez. Aynı şablon, iki yüz değil tek yüz.
- YOL.ilerleme:316 "seri sayısı Gelişim'de yine görünür" doğru, ama Ana sayfada da görünüyor (`Home.jsx:236`);
  bu belge Ana sayfa gösterim kuralını ekler (§4.3).
- YAPILACAKLAR:68 "14. gün iyi oluş": kodda karşılığı yok (§1.2); ya kod değişir ya cümle "14 günde bir, ilki
  isteğe bağlı" diye düzeltilir.

Test planı (A): `dayOpen.test.js` — gün değişimi (gece yarısı, saat dilimi, açık kalmış uygulama ertesi gün
görünür olunca), öncelik sırası, aynı satırın iki gün üst üste gelmemesi, yasak kalıplar, 70 karakter sınırı,
uyarı varken cümle yok; `homeSuggest.test.js` mevcut testleri değişmeden geçer; Ana sayfa: sıfır gösterilmez,
seri 2'de gizli, 3'te görünür.

Cihazda bakılacaklar (A bittiğinde): sabah ilk açılışta cümle, gün içinde ikinci açılışta aynı cümle, ilk dokunuştan
sonra eski satır; güncelleme sonrası Yenilikler ilk dokunuştan sonra; bir gün atlayınca "0 gün seri" yok, "Kaldığın
yerden"; açılış ekranından Ana sayfaya geçişte parlama yok (iki tema); G1'in test derlemesinde görünmesi.

---

## 9. Açık kararlar (sahibine)

- **K1.** Seri kuralı: (a) ≥ 3 gün iken göster, altında "N gün seninle" (öneri); (b) seriyi Ana sayfadan tamamen
  kaldır, yalnız Gelişim'de; (c) bugünkü gibi kalsın.
- **K2.** Günün cümlesi ne kadar kalsın: (a) ilk dokunuşa kadar ya da en çok 1 saat (öneri); (b) bütün gün.
- **K3.** WHO-5 14. gün kilometre taşı olsun mu: (a) 14. günde Ana sayfada bir kez kart (yolda değil, isteğe bağlı);
  (b) bugünkü gibi yalnız Gelişim'de, "14 günde bir".
- **K4.** Yenilikler ekranı: (a) ilk dokunuştan sonra tam ekran (öneri); (b) kart yuvasında tek kart; (c) bugünkü gibi
  açılışta.
- **K5.** Alarm sabahı ekranında gökyüzü şeridi olsun mu (öneri: evet, C ile).
- **K6.** 365. gün yıllık yan yana (İlk Bakış + iris) yapılsın mı (öneri: evet, 90. günden sonra ayrı iş).
- **K7.** `day-open` kayıtları veri dışa aktarmaya (CSV/JSON) girsin mi (öneri: hayır; etkinlik değil, tanılama).
- **K8.** Giriş ekranının alt yazısı İlk Bakış'ın vaadini söylesin mi (§3.3 K1) ve iki "Başla" tek ekrana insin mi
  (K2; öneri: önce G1 ölçülsün).
- **K9.** Kamera izin metninin yeni cümlesi (§7).
- **K10.** Günün cümlesinde "sabah" çağrısı (Singh 2024): hatırlatma saati sabahsa cümleye "sabah yolu" demek
  (öneri: hayır; zayıf kanıt, saat kişinin).

---

## 10. Kaynak tablosu

| Kaynak | Kimlik | Tür · n | Bu belgede |
|---|---|---|---|
| Lally 2010, Eur J Soc Psychol 40(6):998-1009 | PubMed'de yok · [10.1002/ejsp.674](https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674) | gözlemsel · 96 | 66 gün, 18–254; tek kaçırma bozmadı |
| Singh 2024, Healthcare (Basel) 12(23) | PMID 39685110 · [10.3390/healthcare12232488](https://doi.org/10.3390/healthcare12232488) | meta · 20 çalışma, 2601 | 59–66 gün ortanca; sabah ve kendi seçimi |
| Keller 2021, Br J Health Psychol 26(3):807-824 | PMID 33405284 · [10.1111/bjhp.12504](https://doi.org/10.1111/bjhp.12504) | RKÇ · 192 | 59 gün; tekrar en güçlü yordayıcı |
| Kaushal ve Rhodes 2015, J Behav Med 38(4):652-63 | PMID 25851609 · [10.1007/s10865-015-9640-7](https://doi.org/10.1007/s10865-015-9640-7) | boylamsal · 111 | tutarlılık, düşük karmaşıklık, keyif |
| Gardner 2012, Br J Gen Pract 62(605):664-6 | PMID 23211256 · [10.3399/bjgp12X659466](https://doi.org/10.3399/bjgp12X659466) | yorum | aynı bağlamda tekrar |
| Meyerowitz-Katz 2020, J Med Internet Res 22(9):e20283 | PMID 32990635 · [10.2196/20283](https://doi.org/10.2196/20283) | meta · 17 | bırakma %43 |
| Baumel 2019, J Med Internet Res 21(9):e14567 | PMID 31573916 · [10.2196/14567](https://doi.org/10.2196/14567) | panel · 93 uygulama | 30. gün %3,3; nefes %0 |
| Linardon 2019, J Consult Clin Psychol 88(1):1-13 | PMID 31697093 · [10.1037/ccp0000459](https://doi.org/10.1037/ccp0000459) | meta · 70 RKÇ | hatırlatmayla daha az bırakma |
| Lau 2022, Front Public Health 10:914433 | PMID 36438245 · [10.3389/fpubh.2022.914433](https://doi.org/10.3389/fpubh.2022.914433) | gözlemsel · 41.207 | ara ve dönüş olağan |
| Silverman ve Barasch 2023, J Consum Res 49(6):1095-1117 | PubMed'de yok · [10.1093/jcr/ucac029](https://doi.org/10.1093/jcr/ucac029) | 7 deney | kırık seriyi göstermek katılımı düşürür |
| Mazeas 2022, J Med Internet Res 24(1):e26779 | PMID 34982715 · [10.2196/26779](https://doi.org/10.2196/26779) | meta · 16 RKÇ, 2407 | oyunlaştırma g 0,42 → 0,15 |
| Jakob 2022, J Med Internet Res 24(5):e35371 | PMID 35612886 · [10.2196/35371](https://doi.org/10.2196/35371) | sist. derleme · 99 | dört bileşen |
| Borghouts 2021, J Med Internet Res 23(3):e24387 | PMID 33759801 · [10.2196/24387](https://doi.org/10.2196/24387) | sist. derleme · 208 | içgörü, kontrol |
| Michie 2009, Health Psychol 28(6):690-701 | PMID 19916637 · [10.1037/a0016136](https://doi.org/10.1037/a0016136) | meta-regresyon · 122 | kendini izleme |
| Bidargaddi 2018, JMIR Mhealth Uhealth 6(11):e10123 | PMID 30497999 · [10.2196/10123](https://doi.org/10.2196/10123) | MRT · 1255 | bildirim RR 1,039 |
| Klasnja 2019, Ann Behav Med 53(6):573-582 | PMID 30192907 · [10.1093/abm/kay067](https://doi.org/10.1093/abm/kay067) | MRT · 44 | etki zamanla azaldı |
| Wiecek 2026, Front Digit Health 8:1716880 | PMID 42078174 · [10.3389/fdgth.2026.1716880](https://doi.org/10.3389/fdgth.2026.1716880) | gözlemsel · 250, şirket verisi | seri izleyici kullanımı (yalnız betimleme) |

PubMed kayıtları PubMed MCP aracıyla bu oturumda çekildi (2026-09-29).

## 11. Apple kaynakları (2026-09-29'da okundu)

- İnsan Arayüzü Yönergeleri, Launching: "Launch instantly", açılış ekranı "nearly identical to the first screen",
  "Don't advertise… isn't a branding opportunity", "Restore the previous state"
  — https://developer.apple.com/design/human-interface-guidelines/launching
- Reducing your app's launch time: "Retrieve only the data necessary to display your app's initial view"
  — https://developer.apple.com/documentation/xcode/reducing-your-app-s-launch-time
- App Review Guidelines 3.1.2(a) ("ongoing value"), 4.5.4 (bildirimde pazarlama yalnız açık rızayla), 5.1.1 (amaç
  metinleri) — https://developer.apple.com/app-store/review/guidelines/
- App Store Connect Analytics, App retention (yalnız paylaşım izni verenler; eşik altı boş)
  — https://developer.apple.com/help/app-store-connect-analytics/engagement/app-retention/
- Bildirim kesinti düzeyleri (yağmur bildirimi için `gunun.md`'ye not): "passive" ekranı yakmaz, sessizce listeye
  düşer — https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel/passive

## 12. VARSAYIM listesi

1. Günün cümlesinin 70 karakter sınırı ve 1 saatlik görünme süresi.
2. Sessiz ölçümde kamera için 3 sn hazır olma eşiği.
3. Seri eşiği 3 gün (Silverman ve Barasch'ın seri tanımından; Ana sayfa için ayrıca sınanmadı).
4. G1, G2, G9'un yalnız test derlemesinde görünmesi ve bunun için bir derleme bayrağı.
5. Dünün "yol tamam" bilgisinin dünün kayıtlarından çıkarılabileceği (`merdiven.md` kararına bağlı).
6. RevenueCat panelinde dönüşüm ve yenileme metriklerinin hazır olduğu (belge okunmadı).
7. 365. gün yıllık yan yana önerisi.
8. Açılış ekranından Ana sayfaya geçişte, logosuz açılış ekranıyla parlamanın kalkacağı (cihazda bakılacak; WebView
   ilk çizim süresi ölçülmedi).
