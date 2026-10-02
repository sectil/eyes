# S0 · Açık soruların kararları (30 Eylül 2026)

Kapsam: `ekranlar-ozet.md` Bölüm 3'teki 25 madde ve `ekranlar.html`'deki çizim soruları. Çizim soruları ilk turda
Y1–Y15 diye numaralanmıştı; inceleme turunda plan aşamalarıyla (Y1–Y6) karışmasın diye Ç1–Ç15 oldu (`ekranlar-inceleme.md`
P19) ve aynı turda Ç16–Ç18 eklendi; ikinci 5 saniye turunda Ç19–Ç20 eklendi. Yani Y*n* = Ç*n*. Toplam 45 soru var: 44'ü karara
bağlandı ve sayfaya işlendi, biri sahibin kararıdır.

Ölçüt: onaylı bir kararı değiştiren (onaylı yoga tasarımı, onaylı açılış ya da giriş ekranı gibi), marka ve kimlik seçimi
ya da parasal veya hukuki sonucu olan soru sahibe gider. Teknik, tutarlılık, dil, düzen ve planın kendi içindeki çelişki
bu işte karara bağlandı: plana, onaylı kararlara ve kodun bugünkü hâline en uygun olan seçildi.

Sayfa üreteçten yazılır (`/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/s0-ekran/gen.mjs`,
`lib.mjs`, `page.css`); `ekranlar.html` üretecin çıktısıyla birebir aynıdır. Bu turdan önceki kaynaklar ve sayfa
`…/s0-ekran/yedek-kararlar/` klasöründe. Plana işlenecek düzeltmeler `plan-duzeltmeleri.md`'de; plan dosyası değişmedi.
`app/` altında hiçbir dosyaya dokunulmadı, git kullanılmadı. Kod satır numaraları 30 Eylül 2026 öğleden önceki çalışma ağacındandır; başka bir oturum `app/` altında yoga kodu yazdığı için kayabilir.

Sayfada her bölümün altındaki "Kararlar" listesi bu belgenin kısa hâlidir: yeşil numara karara bağlanmış madde, turuncu
numara sahibin kararıdır. Sayfanın açılış sahnesinin altındaki not, 45 sorudan 44'ünün karara bağlandığını söyler ve sahibin
sorusuna götürür.

---

## Sahibe giden soru (1)

### 19 · Yoga sabah sorusunun Ana sayfadaki yeri

**Soru.** Onaylı yoga planındaki sabah sorusu ("Dün gece uykuya dalmak ne kadar kolaydı?", 1–10, "Atla";
`components/YogaMorningCard.jsx`) Uykuya Geçiş dersinden sonraki sabah 04.00–11.59 arasında başlığın hemen altına gelir
(`screens/Home.jsx:236-237`). O sabahlarda Nef'in günün cümlesi ve büyük düğme aşağı kayar; çizimde büyük düğme 390 pt'de de
ilk ekranın altında kalıyor. Sonsuz yolun ilk 5 saniye dizilimi (§3.F.3) bu kartı hesaba katmıyor.

**Neden sahibin kararı.** Kartın yeri ve zamanı onaylı yoga tasarımının parçasıdır; ne seçilirse seçilsin onaylı bir
tasarım değişir.

**Önerim.** Kart günün ilk dokunuşundan sonra açılsın ve büyük düğmenin hemen altında dursun (ikinci 5 saniye
turunda güncellendi: ilk öneride kart ilk duraktan sonra yine başlığın altında açılıyor, "Yola devam et" düğmesini ilk
ekranın dışına itiyordu; üç değerlendiricinin üçü de "Yola devam et"in ilk ekranda olmadığını yazdı).
- Sahibin onayladığı plan Yenilikler ve izin sayfaları için aynı zamanlamayı koyuyor (§2.2 K4: "günün ilk dokunuşundan ya
  da ilk duraktan sonra"); yoga kartına da aynı kural uygulanır, yeni bir kural icat edilmez.
- İlk 5 saniye bozulmaz: sabahın ilk açılışı (a)'daki gibidir. Duraklar Ana sayfadaki yoldan açıldığı için kişi ilk
  duraktan sonra Ana sayfaya döner; "Yola devam et" ilk ekrandadır, soru hemen altında görünür. 12.00 sınırı, alarm
  kartının önceliği ve "Atla" aynı kalır.
- Bedeli: soru ilk açılışta görünmez; ilk dokunuş 12.00'yi geçerse o gün hiç görünmez. Kartın yeri onaylı yoga
  tasarımındaki "başlığın hemen altı"ndan büyük düğmenin altına iner.

**Öbür seçenek.** Kart Gelişim haritasının altına, akşam kartının durduğu tek kart yuvasına insin (alarm kartı da yolun
altındadır). İlk açılışta da vardır ama kaydırmadan görünmez; cevap oranı düşebilir, bu da yoga planının "uykuya dalma
kolaylığı" ölçüsünü inceltir.

**Sayfadaki yeri.** (a) bölümünün sonunda "Senin kararın · tek soru" bloğu: üç telefon, 16 Ekim Cuma sabahı (bugünkü
onaylı yer 07.40; önerimde aynı sabahın ilk açılışı 07.40 ve ilk duraktan sonrası 07.44). Açılış sahnesindeki "1 karar
bekliyor" düğmesi ve altındaki "Senden tek karar bekleniyor" kutusu bu bloğa götürür.

---

## Bölüm 3'ün 25 maddesi

**1 · Tarih satırının biçimi.** Karar: kodun bugünkü biçimi, "29 Eylül Salı" (gün, ay, haftanın günü). Gerekçe: satırı
bugün `Home.jsx`'teki `toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })` yazar; plan "yeni
ekran yok" ve "mevcut sistem bozulmaz" diyor, kişinin her gün gördüğü satır değişmemeli. Sayfadaki bütün tarih satırları ve
telefon etiketleri bu biçime getirildi ("14 Ekim Çarşamba, 09.10", "21 Ekim Çarşamba", 1–8. gün tablosu). Sayfada: (a)
kararlar; bütün telefon etiketleri. Plan düzeltmesi: D1.

**2 · Ay simgesinin yeri.** Karar: evre adının hemen önünde ("29 Eylül Salı · ◐ küçülen şişkin ay ›"). Gerekçe: simge evreyi
gösterir, adın yanında okunur; satırın başına konsa tarihten önce gelir ve göz sırası (§3.F.3: tarih ve ay) bozulur. Sayfada:
(a) bütün Ana sayfa telefonları. Plan düzeltmesi: D2.

**3 · Dolunay günü.** Karar: şeritte ve kartta evre adı "dolunay" yazılır; "Bu gece dolunay" hiçbir yerde yazılmaz.
Gerekçe: §3.E.3 evre adını takvim gününe bağlıyor. Dolunay anı gece olmak zorunda değil: 26 Ekim 2026'da dolunay anı
07.12'dir (astronomy-engine), o akşam "Bu gece dolunay" yanlış olurdu. §3.F.5'in istediği "betimleme" evre adıdır.
Sayfada: (a) "26 Ekim Pazartesi · dolunay günü" parçası; (d) "26 Ekim Pazartesi · dolunay günü, kartın ay kısmı" parçası
("Dolunay · %99 aydınlık", "Son yeniay: 10 Ekim · Sonraki yeniay: 9 Kasım"). Plan düzeltmesi: D3.

**4 · "Sağ–sol" mı, "Sağ–sol bakış" mı.** Karar: ekranda her yerde "Sağ–sol bakış". Gerekçe: aynı merdivendeki "Uzağa
bakış" ile aynı kalıp; §3.F.3 ve §3.F.4 bu adı kullanıyor, yalnız §3.A.6 kısa adı veriyor. Sayfada: (a) 2. gün cümlesi ve
"Yeni" rozetli düğme; (b) kararlar. Plan düzeltmesi: D4.

**5 · 7. günün cümlesi.** Karar: 7. gün "Bugün 7. gün: ilk haftanı tamamlıyorsun." (2. öncelik, kilometre taşı, 43
karakter). 2. öncelik de 0 ve 1 gibi "aynı öncelik iki gün üst üste gelmez" kuralının dışında tutulur; böylece 8. gün
"Bugün haftalık E testi günü." yazılabilir. Yakın–uzak'ın yeniliğini yoldaki "Yeni" etiketi söyler. Gerekçe: §3.F.5 7. gün
için "İlk haftan" satırını, 8. gün için ikinci E testini kilometre taşı sayıyor; kural ikisini birden yasaklıyordu. Aynı
çakışma 28. (iris haritası) ve 29. gün (E testi ve aylık Nef) arasında da var. Kuralın dayanağı (Klasnja 2019) aynı türden
tekrarlanan öneridir; her kilometre taşı ayrı bir olaydır ve kendi cümlesini taşır. `bes-saniye.md`'deki "İlk haftan: 6
gün." yüklemsiz olduğu için kullanılmadı. §1'deki "Bugün yeni: yakın–uzak." örneği 7. güne düşemez (6. gün 6. önceliği
kullandı), örnek düzeltilir. Sayfada: (a) 7. gün telefonu, 1–8. gün tablosu ve altındaki not; 30. gün altyazısı. Plan
düzeltmesi: D5.

**6 · "Günün ritmi" mi, "Bugünün ritmi" mi.** Karar: her yerde "Bugünün ritmi". Gerekçe: ekrandaki öteki adlarla aynı kalıp
("Bugünün yolu", "Bugünün görevi"); plan kartın metnini zaten böyle veriyor (§3.A.4 :404). Sayfada: (b) 24. gün telefonu ve
kararlar. Plan düzeltmesi: D6.

**7 · "N4 · 3 dk".** Karar: basamak sıra sayısıyla yazılır ("5. basamak · 3 dk"); iç kodlar (N1–N3, Ç-B…, K1…, V1…) ekranda
görünmez. Gerekçe: N4 planın merdiveninde yok; 34. günde yeni kullanıcının nefesi Ç-C'dedir, yani 5. basamak. Nef şablonu
da sıra sayısı kullanıyor ("Nefes 4. basamakta", §3.C.4). Sayfada: (g) "Yolun · 34. gün" satırları. Plan düzeltmesi: D7.

**8 · Mola bandı ve baloncuk (mola süresi).** Karar, tek biçim: mola 1. gün 1 dakika, 2. gün 2 dakikadır ve nefesle biter;
3. günden başlayarak 5 dakikadır (3 dakika nefes, kalan 2 dakika "2 dk daha" ya da gözler kapalı dinlenme). Bant molanın
tamamını yazar ("Mola · 1 dk", "Mola · 2 dk", "Mola · 5 dk"); baloncuk "Sırada mola: 3 dk nefes, 2 dk dinlenme" der.
Gerekçe: plan bir yerde "mola 5 dakikadır" (§1 :77, §2.3 :299, §3.A.4 :396), bir yerde "ilk iki gün mola nefesle biter"
(§1 :68) diyor; ikisi ancak bu biçimde birlikte doğrudur ve ara kilidi kuralıyla (§3.A.8 madde 6) aynıdır. Bugünkü kod bandın
süresini nefes durağından alır (`TodayPath.jsx:340`), baloncuk "Sırada Nefes · 3 dk mola" der (`lib/today.js:431`); ikisi 3.
günden başlayarak yanlış olur, Y1'de düzeltilir. Sayfada: (b) Neden cümlesi, 1. ve 7. gün telefonları, kararlar. Plan
düzeltmesi: D8.

**9 · Kanıt kartlarında sınır cümlesi.** Karar: `kirpma-gunu` ve `uzaga-bakis` kartları tür, kişi sayısı ve sınır cümlesiyle
yeniden yazıldı; kırpma kartındaki "Yolunda bu adımın her gün olmasının nedeni budur." cümlesi çıktı. Gerekçe: §3.H sınır
cümlesini zorunlu tutuyor. Çıkan cümle, egzersizin kişide aynı etkiyi yaptığını dolaylı söylüyordu; plan bu gerekçeyi
kullanıcıya iddia olarak söylemiyor (§3.A.6 :441-442). Kişi sayıları PubMed'den doğrulandı: Wolffsohn 2025 (PMID 40467388,
doi 10.1016/j.clae.2025.102453) iki aşamalıdır, 98 kişide randomize program karşılaştırması ve 28 kişide etki ölçümü; en iyi
program günde 3 kez 15 tekrar, 2 hafta; ölçümlerin çoğu bırakıldıktan iki hafta sonra başlangıca döndü. Talens-Estarelles
2022 (PMID 35963776, doi 10.1016/j.clae.2022.101744): 29 yakınması olan bilgisayar kullanıcısı, 2 hafta 20-20-20
hatırlatması, karşılaştırma grubu yok; yakınmalar azaldı, bırakıldıktan bir hafta sonra fark sürmedi. Son metinler:
- Kırpma: "Kuru göz yakınması olan 28 kişiyle yapılan bir çalışmada, iki hafta kırpma egzersizi yapanlarda yakınmalar ve
  yarım kalan kırpmalar azaldı; egzersiz bırakıldıktan iki hafta sonra ölçümlerin çoğu başlangıca döndü. Tek bir
  çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez."
- Uzağa bakış: plandaki metin aynen, sonuna "Karşılaştırma grubu olmayan tek bir çalışmanın bulgusudur; sende aynı sonucu
  vereceği söylenemez."

Sayfada: (c) "Kırpma günü kartı · son metin" ve "Uzağa bakış kartı · son metin" parçaları. Plan düzeltmesi: D9.

**10 · Alarm kartlarındaki hava satırları.** Karar: App Review'un olumlu cevabına kadar alarm kartlarında hava satırı
yoktur; cevap gelince başlıktaki havayla birlikte açılır. Gerekçe: App Review yedeği havayı yalnız tam atıflı kartta ve
atıf satırlı bildirimde gösteriyor (§1 :194-196); §3.E.6'daki alarm satırları buna aykırı. Sayfada: (f) kararlar. Plan
düzeltmesi: D10.

**11 · "Bulunduğun yerin havasını…".** Karar: hukukçu yedeği sürerken teklif "Şehrinin havasını da göstereyim mi?", kartın
sorulmamış hâli "Şehrinin havasını göstereyim mi?" der. Plandaki metin konum izni açılınca (hukukçunun cevabından sonra)
gelir. Gerekçe: yedekte Apple'a kişinin yeri değil, seçtiği ilin merkezi gider; "bulunduğun yer" yanlış olurdu. Sayfada:
(e) 9. gün telefonu; (d) "Hava hiç sorulmamışken". Plan düzeltmesi: D11.

**12 · "(yaklaşık)".** Karar: başlıkta "(yaklaşık)" yalnız konumdan bulunan il için yazılır; şehir seçilince yazılmaz.
Gerekçe: seçilen ilin merkezi yaklaşık değil, kişinin seçimidir. Sayfada: (d) kart başlıkları. Plan düzeltmesi: D12.

**13 · Rıza v2 metni.** Karar: sayfadaki metin (karar 6'ya uyan taslak) kullanılır; `YOL.nef.md` §7.4 taslağı kullanılmaz.
Gerekçe: §7.4 görme ortancasını ve okuma hızını sayıyor, karar 6 bunları çıkarıyor. Hukuki yönü yeni bir soru değildir:
metin, hukukçuya giden 3. sorunun konusudur (`hukukcu-sorulari.md` Soru 3); hukukçu yokken plandaki yedek uygulanır.
Sayfada: (i) telefon ve kararlar. Plan düzeltmesi: D13.

**14 · coachLife v2 yeniden sorulacak mı.** Karar: yeniden sorulmaz. Metin sürümü kayıt için artar, ama bu artış yeniden
sormayı tetiklemez. Gerekçe: v2'de metin yalnız daralır ("ekran süresi" satırı çıkar); eski izin yeni metnin kapsamını
zaten içerir, kişiden daha azı için yeniden izin istemek gereksiz sürtünmedir ve izin kaybına yol açar. Bugünkü kod sürüm
artınca izin vermiş kişiye yeniden sorar (`lib/consent.js:102-105`); Y6'da daralan sürüm için bu tetik kapatılır. Hukukçu
Soru 3'ü cevaplarken bunu da görür. Sayfada: (i) "coachLife v2 · öneri metni" parçasının notu. Plan düzeltmesi: D14.

**15 · "Kaynak" ile "Source".** Karar: bildirimde plandaki Türkçe satır durur: "Kaynak: Apple Weather". Gerekçe: arayüz
Türkçedir; İngilizce mektuptaki "Source: Apple Weather" bu satırın çevirisidir. `app-review-sorusu.md`'nin Türkçe notundaki
yanlış satır düzeltildi (bu turda, sormadan). Sayfada: (f) kilit ekranları ve kararlar.

**16 · Gelişim'in öteki metinleri.** Karar: v2'nin dili harita lejantını ve etki haplarını da kapsar. Lejant "başlangıcından
iyi / başlangıcının gerisinde" olur; önce → sonra etki hapları yoganın onaylı kalıbıyla "belirgin artış / belirgin düşüş"
olur (`ProgressOverview.jsx:38-44`, yogada bugün de böyle); "Yolun" satırında hap ölçünün adıyla başlar ("sakinlikte belirgin
artış"). "İyileşme", "kötüleşme" ve "iyileşiyor" bu yerlerden kalkar (göz metni hariç, madde 17). Gerekçe: karar 2 aynı
sonucun her yerde aynı dille görünmesini istiyor; lejant ve haplar eski dilde kalsaydı aynı ekranda iki dil olurdu. Yoganın
onaylı kalıbı zaten puanın yönünü söylüyor, sağlık iddiası taşımıyor. Nef aynı durumu §3.C.4'teki cümleyle söyler (tek
hesap, iki yüz, §3.C.1). Sayfada: (g) 34. gün telefonu (lejant, Nefes hapı) ve "Ölçü kuralı v2 · hap metinleri" parçası.
Plan düzeltmesi: D15.

**17 · Göz hapı yazımı.** Karar: göz hapı da "doğrulanmış bir değişim yok" yazar. Göz kuralı (`trend.js`) değişmez;
yalnız yazım birleşir. Gerekçe: aynı listede iki yazım yan yana duruyordu; §3.B.5'in "Değişim yok" satırı ve §3.C.4'ün görme
cümlesi ("Görmende doğrulanmış bir değişim yok.") zaten "bir"li yazım. Planın "göz metni değişmez" sözü "iyileşiyor" içindir.
Sayfada: (g) E testi ve Okuma satırları. Plan düzeltmesi: D15.

**18 · "Yolun · 34. gün" hangi sayı.** Karar: iris haritasının ortasındaki sayı (başlangıçtan beri takvim günü,
`ProgressOverview.jsx:284`). Gerekçe: aynı ekranda iki ayrı gün sayısı olmasın. Sayfada: (g) iki telefonun başlığı. Plan
düzeltmesi: D7.

**19 · Yoga sabah kartı.** Sahibin kararı; yukarıda.

**20 · Açılış ekranından giriş ekranına geçiş.** Karar: zeminler değişmez; sahibe soru gitmez. Gerekçe: açılış görselinin
(`Splash.imageset`) zemini bugün de uygulamanın zeminidir (açıkta #F3F6F8, koyuda #070C12; görsel tam ekran, pikselden
okundu). Karar 5c yalnız logoyu kaldırır, renk değişmez. Açık temada ilk açılışta açık zeminden gece zeminine geçiş bugün de
vardır; yeni değildir. "İlk açılışa özel koyu zemin" yapılamaz, çünkü açılış ekranı her açılışta aynıdır; açılışı her gün
koyu yapmak ise onaylı ekranı değiştirir ve her gün koyudan açığa sıçrama getirir. Y3 cihaz listesindeki "açılış ekranından
geçişte parlama yok" maddesi kalır. Sayfada: (j) iki geçiş parçası ve kararlar. Plan düzeltmesi: D16.

**21 · Site: kısa gerçekler.** Karar: üst başlık kalır; soru satırı ve tanıtım paragrafı kalkar (plan "tek satır" diyor);
üç kısa gerçeğin ilki ("Kamera görüntün telefondan çıkmaz") kalkar, öteki ikisi kalır. Gerekçe: aynı söz hemen üstteki yeni
satırda var; yeni satır plandan aynen alındığı için kısaltılmadı. Sayfada: (k) masaüstü ve telefon. Plan düzeltmesi: D17.

**22 · Büyük düğme ve süre.** Karar: büyük düğme de yol gibi ölçüm duraklarında süre yazmaz ("Haftalık E testi"). Gerekçe:
`hideMinutes` "süre kartta yazılmaz (cihazda ölçülmedi)" anlamındadır (`lib/today.js:9`); düğmenin bunu dinlememesi
(`lib/homeSuggest.js:18`, `:23`) bugünkü kodun eksiğidir, Y3'te giderilir. Günün toplam süresi diyaframın yanında yazar.
Sayfada: (a) 1. gün telefonu. Plan düzeltmesi: D18.

**23 · Sıfır kuralının kapsamı.** Karar: Ana sayfada değeri sıfır olan her sayı gizlenir: seri, "0/3 hafta" (Pazartesi
sabahı), "N gün seninle" (1. gün), yolun altındaki "Bu hafta 0/3 gün", diyaframın "0 / N" sayacı (Ç16) ve Nef kartının kural
yedeğindeki "0/3" (Ç7). Gerekçe: karar 5d "Ana sayfada sıfırlar görünmesin" diyor; kapsam Ana sayfanın tamamıdır. Gelişim ve
raporlar kapsam dışıdır. Sayfada: (a) "12 Ekim Pazartesi · hafta satırı gizli" parçası; (b) 1. gün yolu. Plan düzeltmesi:
D18.

**24 · Seri ≥ 3 iken "N gün seninle".** Karar: kalır; yalnız seriyle aynı sayıyken yazılmaz. Gerekçe: plandaki "yerine"
yalnız 3 günden kısa seri içindir; bugün ikisi birlikte görünüyor (`Home.jsx`), mevcut sistem bozulmaz. İkinci 5 saniye
turunda üç değerlendirici de her gün uygulamayı açan kişide "6 gün seri" ile "6 gün seninle"yi aynı sayının iki kez
yazılması diye okudu; iki sayı ayrışınca (bir gün atlanınca) ikisi de görünür. Sayfada: (a) 7. ve 30. gün telefonları ve
"12 Ekim Pazartesi" parçası. Plan düzeltmesi: D18.

**25 · 320 pt'de beş yüz.** Karar: 320 pt'de yüzlerin arası 4 px, her yüz 45,6 px; kart iç boşluğu (18 px) değişmez.
"İdare eder" iki satıra iner; etiketler üstten hizalıdır. Gerekçe: 8 px aralıkta yüz 42 px olur ve 44 pt'nin altına düşer;
iç boşluğu daraltmak kartı öteki kartlardan ayırırdı. Sayfada: (c) 320 pt görünümünde. Plan düzeltmesi: D19.

---

## Çizim soruları Ç1–Ç20

**Ç1 (eski Y1) · Tutmalı günde kanıt metni.** Karar: kanıt kutusu ailenin bugünkü metnini gösterir ve tutmalı günde sınır
cümlesiyle biter: "Yavaş nefes sırasında kalp ritmi değişkenliği tutarlı biçimde artıyor (Laborde 2022; Marchant 2025). Bu
kanıt tutmasız kalıptan geliyor; kısa tutmalı sürüm ayrıca incelenmedi." Gerekçe: plan "kanıt cümlesi ailenin mevcut
`evidence` metnidir, yeni iddia yazılmaz" diyor (§3.A.4 :404-405). Bugünkü metnin başındaki "En sağlam kanıt bu kalıpta:"
tutmalı günde doğru olmadığı için yalnız o gün düşer (`lib/breath.js:48`); sınır cümlesi iddia değil, sınırdır. Kutuyu
gizlemek bilgiyi saklardı. Sayfada: (b) 24. gün telefonu. Plan düzeltmesi: D20.

**Ç2 (eski Y2) · Balban 2023'ün kişi sayısı.** Önceki turda kapandı (`ekranlar-inceleme.md` P7): PubMed Central tam
metninden doğrulandı, kartta "108 kişi (uzun verişli kolda 30, meditasyonda 24)". Sayfada: (c) kanıt kartı.

**Ç3 (eski Y3) · Apple Weather işareti.** Karar: yer tutucu kutu kalktı. Atıf satırında markanın adı yazıyla durur
("Apple Weather"), yanında "Veri kaynakları" bağlantısı ve verinin yaşı ("12.40'ta alındı"). Apple'ın işaret görseli
uydurulmadı, yeniden çizilmedi. Not:
- Apple'ın kuralı (developer.apple.com/weatherkit/get-started, "Attribution requirements", 30 Eylül 2026'da okundu): Apple
  hava verisi gösteren uygulama "Apple Weather trademark"ı ( Weather) ve öteki veri kaynaklarının yasal bağlantısını
  açıkça göstermelidir. WeatherKit bunun için `WeatherService.shared.attribution` verir: `combinedMarkLightURL` ve
  `combinedMarkDarkURL` (açık ve koyu işaret görseli), `legalPageURL` (yasal sayfa), `legalAttributionText`,
  `serviceName`.
- Uygulamada markanın yerinde WeatherKit'in verdiği resmî görsel temaya göre durur; görsel değiştirilmez, yeniden
  çizilmez. "Veri kaynakları" `legalPageURL`'yi açar. App Review mektubu da bunu söyler (`app-review-sorusu.md` madde 1).
- Bağlantının adı "Veri kaynakları" kaldı, "Kaynaklar" yapılmadı: plan bu adı veriyor (§3.E.7 :972-973), Apple'ın
  "other data sources" sözüne denk düşüyor ve aynı kartta "Bilim ne diyor?" altındaki bilimsel kaynaklarla karışmıyor.
- Görselin önbelleğe alınıp alınamayacağı belgelerde yazmıyor (plan §3.J); görsel yüklenemezse satırda ne duracağı Y5
  kapısında Apple Developer Program Lisans Sözleşmesi'nden okunur.

Sayfada: (d) kart ve çevrimdışı hâl; sayfanın alt notu. Plan düzeltmesi: D21.

**Ç4 (eski Y4) · Teklifte üç düğme.** Karar: iki düğme: "İstanbul için göster" ve "Hayır"; Profil'deki şehir 81 ilden biri
değilse "Şehir seç" ve "Hayır". Başka il, kartın başlığındaki il adına dokunarak seçilir (başlıkta küçük aşağı ok). Gerekçe:
üç düğme 390 pt'de de metnin yanına sığmıyordu, 320 pt'de şerit üç satıra çıkıyordu; plan teklifi "tek satırlık" istiyor.
Sayfada: (e) 9. gün telefonu; (d) kart başlığı. Plan düzeltmesi: D11.

**Ç5 (eski Y5) · Kapatma (×) ve "Hayır".** Karar: teklifte kapatma yok; "Hayır" tek çıkıştır ve kalıcıdır. Gerekçe: ikisi
aynı işi görüyordu; küçük × dokunma alanı da istemez. Sayfada: (e) telefon, Neden cümlesi. Plan düzeltmesi: D11.

**Ç6 (eski Y6) · Aylık kartın uzun satırları.** Karar: kısa hâller kalır: "Göz alanında 28, Sakinlik alanında 27 gün kaydın
var." (53) ve "Önümüzdeki 28 günde nefese ve göz egzersizlerine yeni basamak geliyor." (70). Gerekçe: Nef satırında 70
karakter sınırı var (§3.H); kısa hâl §3.C.4 kalıbına uyuyor. Sayfada: (h) 29. gün telefonu.

**Ç7 (eski Y7) · Pazartesi sabahı "Bu hafta 0/3 gün çalıştın."** Karar: sıfır kuralı Ana sayfadaki Nef kartını da kapsar;
kural yedeği haftada henüz gün yokken "Yeni hafta başladı; hedefin 3 gün." yazar (hedef kişinin haftalık hedefidir).
Gerekçe: karar 5d (madde 23). Metin `lib/coach.js:103`'teki şablonun sıfır dalıdır, Y3'te eklenir. Sayfada: (h) "12 Ekim
Pazartesi · günlük kartın kural yedeği" parçası. Plan düzeltmesi: D18.

**Ç8 (eski Y8) · Nef izni olmayan kişide dönem kartı.** Karar: haftalık ve aylık kural kartı izni olan ve olmayan kişide aynı
yerlerde durur (Gelişim'in başı; Ana sayfada Pazartesi–Çarşamba ve 29. günden 3 gün). İzni olmayan kişide Ana sayfadaki
satır Nef tanıtım kartının altına gelir. Kural şablonundan gelen dönem kartının etiketi "bu telefonda hazırlandı" olur;
"çevrimdışı öneri" yalnız sunucuya ulaşılamayan günlük kartta kalır (bugünkü davranış, `CoachCard.jsx:90`). Gerekçe: plan
"telefonda üretilen kural cümleleri rızasız da görünür" diyor (§1 :184-185); kart telefonda hazırlanır, veri gitmez.
"Çevrimdışı" demek yanlış olurdu: kişi çevrimiçidir, kart tasarım gereği telefonda hazırlanır. Sayfada: (h) iki kartın
etiketi ve "Nef izni olmayan kişi · Ana sayfa, Pazartesi" parçası. Plan düzeltmesi: D22.

**Ç9 (eski Y9) · Rıza v2'nin uzun "Ne" satırı.** Karar: kısaltılmaz, iki paragrafa bölünür: gidenler ve gitmeyenler; sözcükler
aynı kalır. Gerekçe: kısalınca kapsam belirsizleşir; bölmek okumayı kolaylaştırır. Metin hukukçu Soru 3'ün konusudur.
Sayfada: (i) telefon.

**Ç10 (eski Y10) · Giriş ekranında 320 × 568'de alt yazı.** Karar: alt yazı en az 14 px kalır; öteki boylarda bugünkü ölçek
aynen. Gerekçe: bugünkü ölçek (`--u = 0,673`) karar 5a'nın yeni, uzun alt yazısını 11 px'e indiriyor; bu ekranın en önemli
cümlesidir. Yalnız en küçük ekranda bir alt sınırdır, onaylı ekranın görünüşü öteki boylarda değişmez. Sayfada: (j) 320 pt
görünümü. Plan düzeltmesi: D16.

**Ç11 (eski Y11) · Sitenin ilk ekranında iki soru.** Karar: düğmeler plandaki gibi kalır ("E hangi yöne bakıyor? Dene",
"Bir günün nasıl geçer"). Başlıktaki soru ile düğmenin birlikte nasıl okunduğu, sitenin 5 saniye sınamasında bakılan ilk
şeydir; çoğunluk "etkilendim" demezse düğme metni o zaman ayrıca ele alınır. Gerekçe: plan iki düğmenin yerinde kalmasını
açıkça istiyor (§3.F.2 :1033). Sayfada: (k) kararlar.

**Ç12 (eski Y12) · Masaüstünde başlık boyu.** Karar: bu başlık masaüstünde 2,9rem ve iki satır ("Bu cümleyi okurken / kaç kez
göz kırptın?"). Gerekçe: bugünkü boyda (3,9rem) soru dört satıra çıkıyor ("Bu cümleyi okurken" 742 px, sütun 580 px).
Sayfada: (k) masaüstü. Plan düzeltmesi: D17.

**Ç13 (eski Y13) · Yolun 320 pt'de kırpılması.** Önceki turda kapandı (`ekranlar-inceleme.md` P2): çizim düzeltilmiş hâli
gösterir; bugünkü kodun hatasıdır, Y1'de düzeltilir ve Y1 cihaz listesine yazılır. Sayfada: (b) ayrıntı notu. Plan
düzeltmesi: D23.

**Ç14 (eski Y14) · Hava teklifi 320 × 568'de.** Karar: kabul. Şerit büyük düğmeyi bir kaydırma aşağı iter; teklif ilk
dokunuştan sonra ve kişinin ömründe bir kez çıktığı için ilk 5 saniyeyi bozmaz. İki düğmeye inince (Ç4) şerit bir satır
kısaldı. Y5 cihaz listesine yazılır. Sayfada: (e) 320 pt görünümü. Plan düzeltmesi: D11.

**Ç15 (eski Y15) · Telefonda site başlığı.** Karar: 360 pt altında başlık 1,9rem; 320 × 568'de iki düğme de ilk ekranda
görünür. Gerekçe: bugünkü boyda (2,2rem) başlık dört satıra çıkıyor ve ikinci düğme ilk ekranın altında kalıyor. Sayfada:
(k) telefon ve 320 pt'deki karşılaştırma telefonu. Plan düzeltmesi: D17.

**Ç16 · İlk duraktan önce "0 / 4".** Karar: ilk duraktan önce diyaframın yanında "4 durak" ve "bugün · ≈8 dk" durur; ilk durak
bitince bugünkü sayaç ("1 / 4") döner. Gerekçe: onaylı karar 5d "Ana sayfada sıfırlar görünmesin" diyor; §3.F.3 tablosundaki
"0/9 durak" bu kararla çelişen bir örnektir ve düzeltilir. İlk ekranın en ağır öğesi sıfır olmamalı. Önceki turdaki
"seçenek" telefonu kaldırıldı; 1., 7. ve 30. gün telefonları bu biçimde. Sayfada: (a). Plan düzeltmesi: D18.

**Ç17 · Bantta ilk yıldız ve bölüm etiketi.** Karar: yıldız "Mola · N dk" etiketinin altına iner ([26, 44]); 2. bölümün
tek durağı soldaysa (tek duraklı bölüm) bölüm etiketi sağa geçer. Y1'de uygulamada da. Gerekçe: bugünkü kodda yıldız
etiketin üstüne düşüyor (`TodayPath.jsx:267`); 1. gün yolu etiketin üstünden geçiyor (ikinci 5 saniye turu). Sayfada: (b)
1. ve 7. gün telefonları. Plan düzeltmesi: D23.

**Ç18 · Gece ekranı kartı ve "günde en çok bir kart".** Karar: kart, yüze dokunulduğu anda o an bilinen tetiklerle seçilir
(dolunay, sonra yol kartları). Gece ekranı kartı yalnız o akşam başka kart gösterilmediyse ve "Ekran çoktu" 22.00'den sonra
seçildiyse "Tamam"dan sonra aynı yerde çıkar. Gerekçe: etiket kanıt kartından sonra seçiliyor; plandaki öncelik (dolunay,
gece ekranı, yol kartları) bu sırayla uygulanamaz, uygulanırsa bir akşamda iki kart görülür. Günde en çok bir kart kuralı
korunur. Sayfada: (c) 3. telefonun altyazısı ve kararlar. Plan düzeltmesi: D9.


**Ç19 · Hafta satırının yazımı.** Karar: Ana sayfanın sayı sütununda hafta satırı "2/3 gün bu hafta" yazılır; hedef tutunca
"4 gün bu hafta" ve yeşil tik. Gerekçe: ikinci 5 saniye turunda üç değerlendirici de "4✓ hafta"yı "4 hafta" ve 9. gündeki
"5✓ hafta"yı olanaksız bir sayı diye okudu; "2/3 hafta"yı da "haftanın üçte ikisi" diye. Yolun altındaki bugünkü satır
("Bu hafta 2/3 gün") aynı dili kullanır. Haftalık hedef kadar nokta (önceki turun önerisi) kalktı. Sayfada: (a), (e) ve
yoga sorusunun telefonları. Plan düzeltmesi: D18.

**Ç20 · Yolun altındaki hafta satırı ve Nef kartı.** Karar: hemen altındaki Nef kartı haftanın sayısını söylüyorsa ("Bu
hafta 1/3 gün çalıştın.") yolun altındaki "Bu hafta 1/3 gün" o gün yazılmaz. Gerekçe: üç değerlendirici de aynı sayının alt
alta iki kez yazıldığını gördü. Sayfada: (h) 6. gün telefonu. Plan düzeltmesi: D18.
---

## Bu turda sormadan düzeltilen öteki yerler

- `app-review-sorusu.md`: Türkçe durum notundaki bildirim satırı "Kaynak: Apple Weather" oldu (madde 15).
- `ekranlar-ozet.md`: Bölüm 3'ün başına kararların bu belgede olduğunu söyleyen not eklendi; maddeler değiştirilmedi.
- Sayfa: "Açık sorular" listeleri "Kararlar" oldu; numara rozeti karara bağlanmış maddede yeşil, sahibin kararında turuncu.
  Sayfanın başına tek satırlık not ve "Soruya git" bağlantısı kondu; eski "açık soru" açıklaması kaldırıldı.
- Karara bağlanan maddelerin "Varsayım" satırlarındaki kopyaları temizlendi (ör. tarih biçimi, "Mola · 5 dk", basamak yazımı).
- (e)'nin Neden cümlesindeki "ya da kapatma" çıktı (Ç5).

## Doğrulama

- `node gen.mjs` sayfayı yazdı; `ekranlar.html` üretecin çıktısıdır. Sayfa sözleşmesi korundu: `<title>` ve `<style>` en
  üstte, dış kaynak yalnız Google Fonts, renkler token, açık ve koyu tema.
- Playwright ile ekran görüntüleri (`…/s0-ekran/tur3/`): 400 ve 390 px pencerede yatay kaydırma yok; 390 ve 320 pt
  telefonda yolda kırpılan öğe yok; telefon ekranından taşan metin yok; sayfa denetimlerinde 44 pt'den küçük öğe yok;
  konsol hatası yok. Açık ve koyu temada bakıldı.
- Ay değerleri astronomy-engine ile hesaplandı (16 Ekim 07.40 büyüyen hilal %28; 26 Ekim dolunay anı 07.12, 20.30'da %99;
  yeniaylar 10 Ekim ve 9 Kasım).
- 5 saniye sınaması (bağlayıcı kural: birbirini görmeyen en az 3 değerlendirici) bu işte yapılmadı; sayfa sahibe gitmeden
  önce yapılmalıdır.
- İkinci 5 saniye turu (30 Eylül 2026): değerlendiricilerin notlarına göre sayfanın açılışı ve ekranlar yeniden çizildi;
  bu belgede 19'un önerisi, 24, Ç17 güncellendi, Ç19 ve Ç20 eklendi. Ayrıntı `ekranlar-inceleme.md`'nin sonunda.
