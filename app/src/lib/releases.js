// Sürüm notları: her güncellemede neler eklendi / düzeldi. Uygulama güncellenince ilk açılışta bir kez
// gösterilir (components/WhatsNew.jsx), Bilgi → "Yenilikler"de hepsi durur.
// KURAL: her yeni commit dizisi (TestFlight'a gidecek iş) buraya bir madde ekler. En yeni en üstte.
// KURAL (Bug 31): TestFlight'a gitmiş bir girdiye madde eklenmez; her TestFlight yeni id alır. Uygulama görülen
// girdiyi id'sinden tanır (unseenReleases): eski girdiye eklenen madde, o girdiyi görmüş kişiye "Yenilikler"de çıkmaz.
// id: ISO tarih + sıra; kind: 'new' | 'fix' | 'change'
export const RELEASES = [
  {
    // Build 59'dan sonraki TestFlight. Bug 31: Build 59'da 29 Eylül girdisine eklenen beş madde (haftalık E testi, Nef,
    // "Son 3 test", Bug 24, okuma testi) Build 58'de o girdiyi görmüş kişiye gösterilmedi; buraya taşındı.
    id: '2026-09-29-2',
    title: '29 Eylül, ikinci güncelleme',
    items: [
      // Karar 2026-09-29 (YAPILACAKLAR "Sonsuz yol ve ilk 5 saniye" (b)): ilk açılışta önce ölçüm (lib/setupFlow.js).
      // Cihazda denenmedi.
      { kind: 'change', text: "Yeni kurulumda önce ölçüm: uygulamayı ilk kez açan kişi giriş ekranından sonra doğrudan İlk Bakış'a geçer, kamera 20 saniyede kaç kez göz kırptığını sayar. Hesap, güvenlik bilgisi ve sorular sonuçtan sonra gelir. Kurulumu bitirmiş olan için hiçbir şey değişmez." },
      // Bug 32 (sahibinin onayı): hesap ekranı eşitlenmeyen ilerlemeyi vaat ediyordu. Profil yalnız izinle gider.
      { kind: 'fix', text: "Hesap ekranında \"Hoş geldin\" altındaki yazı artık \"Giriş yap ya da hesap oluştur.\" Önceki metin ilerlemenin yeni telefona taşındığını söylüyordu; ölçümler hesaba gitmez, telefonunda saklanır." },
      // Karar 2026-09-29 (YAPILACAKLAR "Sonsuz yol ve ilk 5 saniye" (a)): E testi ilk günden haftada bir. Başlangıç
      // kuralı lib/trend.js WEEKLY_MIN_BASELINE_TESTS (3 → 7 test; VARSAYIM, kanıt kartında yazar). Cihazda denenmedi.
      // Son cümle (inceleme 2026-09-29): kural eski ölçümlere de uygulanır; iki göz serisi (hep haftalık) ve seyrek
      // test edilmiş sağ/sol seriler yeni test olmadan takibe geçebilir, uyarı gösterebilir. Her gün test edilmiş (8.–21.
      // günlerde 7 test) sağ/sol serilerde başlangıç ve uyarı değişmez.
      { kind: 'change', text: "E testi artık haftada bir: haftalık E testi (sağ, sol, iki göz) ilk gün yola eklenir, sonra her hafta; öteki günlerde yolda E testi yok. İstersen kısa E testini (eski adıyla Günlük test; sağ ve sol göz) Ana sayfadaki Ölçüm listesinden yapabilirsin. Eski günlük test kayıtların geçmişte ve CSV dosyasında \"Kısa görme testi\" adıyla görünür. Gelişim'de ilk test alışma sayılır; başlangıç değerin 3 haftalık testle, en erken 22. günde hazır olur ve yeni testlerle 7 teste kadar güçlenir. Bu kural eski ölçümlerine de uygulanır: özellikle iki göz serisinde, yeni test yapmasan da değerlendirme hemen başlayabilir, bir uyarı da görebilirsin." },
      { kind: 'change', text: "Nef artık günlük test önermez: haftalık testin zamanı gelince onu hatırlatır. Görme uyarısında \"birkaç gün daha ölç\" denmez; sarıda sonraki testlere bakılır, kırmızıda yalnız göz doktoruna başvurman söylenir." },
      { kind: 'fix', text: "Gelişim'de son testten bir hafta geçince \"Son 7 gün\" kutusu boş kalıyordu. Artık son 7 günde 3 test yoksa kutu \"Son 3 test\" yazar ve son 3 testin ortancasını gösterir; başlangıçla karşılaştırılan değer budur." },
      // Bug 24 (HATA_GUNLUGU): isDue saatle sayıyordu; haftalık E testi artık takvim günüyle (lib/today.js isDueWeekly)
      { kind: 'fix', text: "Haftalık E testi son testin saatini bekliyordu: her gün aynı saatte açınca test 8 günde bir geliyor, akşam \"tamam\" olmuş yola yeniden ekleniyordu. Artık son testten 7 gün sonra, o günün başından itibaren yolda." },
      // Karar 2026-09-29 (sahibi): okuma testi haftalık E testinden ayrılır, takvim günüyle gelir (lib/today.js
      // readingStatus; bir günlük kayma VARSAYIM). Cihazda denenmedi.
      { kind: 'change', text: "Okuma testi artık haftalık E testiyle aynı güne düşmez; o gün yerine ertesi gün yola eklenir. E testi yapılmadan kalsa da okuma testi en çok bir gün bekler. Sonra haftada bir gelir: son okuma testinden 7 gün sonra, o günün başından itibaren yoldadır." },
    ],
  },
  {
    id: '2026-09-29',
    title: '29 Eylül güncellemesi',
    items: [
      { kind: 'change', text: "E testi yenilendi: her göz için tek ekran; Gözlük, Örtme, Mesafe satırları ve tek düğme. Düğme hazır değilse eksik adımı yazar, dokununca o satırı gösterir. Gözlük seçimin hatırlanır, her testte yeniden sorulmaz." },
      { kind: 'change', text: "Harfler yalnız telefon 36–44 cm uzaktayken sayılır (ilk iki alıştırma harfi 25–60 cm'de). Bu aralığın dışında sayılan harf gelmez: mesafe göstergesi uyarır, harfin yerinde ne yapacağın yazar; 35–45 cm'nin dışına çıkınca test durur. Düzelince aynı boyutta, yeni yönde bir harfle sürer. Bir cevap sayılmazsa nedeni de harfin yerinde yazar. Harf tam istenen boyutta çizilir ve göründüğü an boyutu sabit kalır. Haftalık testte her gözde 28 harf sayılır." },
      // Parlaklık (FaceDistancePlugin.swift setBrightness, lib/brightnessSession.js) ve ters renk algılama
      // (lib/invertedColors.js) kodda var, cihazda doğrulanmadı (Swift burada derlenmedi; WKWebView'de inverted-colors
      // sorgusu ve UIAccessibility.isInvertColorsEnabled VARSAYIM). TestFlight'tan önce doğrulanacak; doğrulanmazsa
      // sürüm notundan çıkarılır (YAPILACAKLAR). Metin yalnız kodun yaptığını söyler.
      { kind: 'change', text: "Test başlayınca ekran parlaklığı en yükseğe alınır; test bitince, testten çıkınca ya da uygulamadan ayrılınca eski değerine döner. Renkleri ters çevirme açıksa test başlamaz ve nasıl kapatılacağı yazar." },
      { kind: 'change', text: "Her göz bittiği an kaydedilir. Haftalık testi yarıda bırakırsan kalan gözler o gün Bugün kartında \"Kalan: …\" diye bekler; test ancak üç göz de bitince tamam sayılır, ertesi güne kalan yarım test baştan açılır." },
      // Başlangıcın kaç testle oluştuğu '2026-09-29-2' girdisindeki haftalık E testi maddesinde (karar 2026-09-29; "en az
      // 7 testle" haftalık testte artık doğru değildi; madde Bug 31 ile oraya taşındı)
      { kind: 'change', text: "Ölçüm yöntemi değiştiği için Gelişim'de görme için yeni seri başlar (\"Ölçüm yöntemi güncellendi; yeni seri.\"); başlangıç değerin yeniden oluşur. Eski ölçümler silinmez; CSV dosyasında hepsi durur. Kamerasız yapılan ölçümler ayrı seridir." },
      { kind: 'new', text: "E testinde sesli yönlendirme (ses açıksa, Profilim'de seçtiğin sesle): yalnız hazırlıkta, test durunca ve gözler arasındaki molada; harf ekrandayken konuşmaz. Söylenen cümle o an ekranda da yazılıdır." },
    ],
  },
  {
    id: '2026-09-28',
    title: '28 Eylül güncellemesi',
    items: [
      { kind: 'change', text: 'Uyku ekranı yenilendi: tam siyah zeminde kısık, kehribar renkli büyük saat (saat ve dakika alt alta). Altında müziğin kalan süresi ince bir çizgi, yanında alarm ve ne kadar kaldığı ("Alarm 06:29 · 6 sa 37 dk"). Ekrana dokununca 5 saniye "Bitir" çıkar. Müzik bitince saat ve alarm ekranda kalır, ekran artık açık tutulmaz, telefon kendi kilitlenir; "Bitir" özete götürür. Saat ekranda iz kalmasın diye dakikada birkaç nokta kayar; "Hareketi Azalt" açıksa kaymaz.' },
      { kind: 'fix', text: 'Çemberler: ekrana baktığın halde "Ekrana bak" deyip takılı kalabiliyordu (büyük olasılıkla başın ya da telefon biraz kayınca göz takibi merkezi kaçırıyordu). Artık durunca ortada bir göz bebeği çıkar ve seçtiğin sesle "Ortadaki göz bebeğinin içindeki noktaya bak" denir; ona sabit bakınca halka dolar, takip yeniden ortalanır ve kaldığın yerden sürer. Göz ayarı yaptıysan, başka yere (telefonun üstünden odaya) bakarken ortalanmaz. 8 saniyede olmazsa "Ölçmeden devam et" çıkar; üstteki X de her an çıkış. Takılı kalmazsın.' },
      { kind: 'new', text: 'Üç yeni uyandırma sesi: Gün Işığı (melodik, önerilen; yeni alarmlarda önceden seçili), Kuş Bahçesi (yumuşak, kuş sesli) ve Uyanış Marşı (canlı, hızlı tempo). Hepsi duyulur başlar, yaklaşık 6 saniyede tam sese çıkar; telefon hoparlörünün iyi çaldığı seslerle yapıldı. Neye dayandığı ve sınırları Bilgi → "Sabah alarmı ve uyku sesi" kartında.' },
      { kind: 'fix', text: 'Uyku müziği ve Dalga alarm sesleri telefon hoparlöründen neredeyse duyulmuyordu: sesin çoğu hoparlörün çalamadığı kalın seslerdeydi. Aynı ezgiler bir oktav yukarıda, hoparlöre göre yeniden hazırlandı.' },
      { kind: 'new', text: 'Sabah alarmı: Ana sayfada "Bugünün yolu"nun altında kendi kartı. Saat, kalan süre ve akşamları küçük bir gece kadranı (yatma saatinden alarma kadar ve şu an); akşam "Yarın sabah · Alarm kurayım mı?" da burada sorulur. Kartı ⋯ menüsünden kaldırır, Profil → Alarm → "Ana sayfada göster" ile geri eklersin; kart kapalıyken de alarm çalar. Uyku sesini Profil → Alarm\'dan da başlatırsın. Üç soru hazır cevaplı gelir (saat, günler, uykuya dalarken ses); tek dokunuşla kurarsın. iOS 26\'da gerçek alarm: sessiz modda da çalar; Nefona\'nın uyandırma sesleri, Dalga sesleri ya da telefonun alarm sesiyle uyanırsın. Daha eski iOS\'ta bildirimle hatırlatılır.' },
      { kind: 'new', text: 'Uykuya dalarken ses: Dalga\'nın sakin müziği seçtiğin sürede ya da "Sana göre" çalar (ilk gece 30 dk). "Sana göre" uykunu dinlemez; sabah "Ses bittiğinde uyumuş muydun?" cevabına göre süreyi 5 dakika uzatır ya da kısaltır.' },
      { kind: 'new', text: 'Alarmda "9 dk ertele" (üstten gelen şeritte 9 yazan simge). Alarmın başlığı sabah "Günaydın", günün öteki saatlerinde "Alarm". Alarmdan sonra uygulamayı açınca istersen güne 1 dakika nefes, bir Dalga ya da gün ışığıyla başlarsın. Kart bu gece için yatma saatini yazar (7 saat uyku). Uyandığın günler Gelişim\'de İyi oluş alanına yazılır.' },
      { kind: 'change', text: 'Kurulu alarm Ana sayfanın üstünde, "gün seninle"nin altında tek satır: "07:00 alarm · yarın". Dokununca alttan seçenekler açılır: alarmı düzenle, uyku sesini başlat, alarmı kapat (bir kez daha sorar; 5 sn "Geri al"). Kurulumda saat en üstte büyük yazar; "Saati değiştir"e dokununca istediğin dakikayı seçersin. Hızlı seçim saatleri yalnız sabah uyandığın saatlerden gelir. Uyandıran sesi, altındaki "Uyandıran ses" satırının yanındaki "değiştir"den seçip ▶ ile dinlersin.' },
      { kind: 'fix', text: 'Alarmda seçtiğin Dalga sesi çalmıyordu: sesler iOS alarmının istediği biçime (CAF, 44,1 kHz) çevrildi. Güncellemeden sonra alarmını bir kez yeniden kur.' },
      { kind: 'fix', text: 'Uyku sesi bitince ve alarmdan sonra hep "Günaydın" yazıyordu; artık saate göre: Günaydın, İyi günler, İyi akşamlar, İyi geceler.' },
      { kind: 'change', text: 'Alarm kurarken uyku sesi "Evet" ise: "Kur ve uyku sesini başlat"a dokununca alarm kurulur ve müzik hemen başlar, ekran uyku ekranına geçer. İstersen "Yalnız kur". Alarma az kaldıysa müzik alarmdan 1 dk önce susar.' },
      { kind: 'fix', text: 'Uyku sesi duyulmuyordu: müzik artık iPhone\'un kendi oynatıcısıyla çalar (sessiz tuşunda ve kilitli ekranda da), sonunda yavaşça kısılır. Müzik uygulamanın içinde hazır gelir; beklemeden başlar.' },
      { kind: 'fix', text: 'Ana sayfanın üstündeki sayılar (hafta noktaları, alarm satırı) bazı telefonlarda sağdan kesiliyordu; artık diyafram gerektiği kadar küçülür.' },
      { kind: 'fix', text: 'Uyku sesi bazen hiç çalmıyordu: müzik artık ekran açılınca hazırlanır, "Başlat"a dokunduğun anda çalar; çalmazsa ekranda "dokun, başlat" çıkar. Alarma 1 saatten az kaldıysa "Yine de çal" seçeneği var.' },
      { kind: 'change', text: 'Yeni uygulama simgesi: aynı "n" göz kapağı, altında artık yukarı bakan bir iris. iOS 26\'da cam görünümlü katmanlı simge; koyu ve renklendirilmiş ana ekranda kendi sürümleri.' },
      { kind: 'fix', text: 'Açılışta bir an başka bir logo (geliştirme aracının varsayılan görseli) görünüyordu; artık Nefona işareti, koyu temada koyu zeminde. Koyu temada açılırken ekranın açık gri yanıp sönmesi de düzeldi.' },
      { kind: 'new', text: "Gelişim haritası: iris artık her alanda son 28 günde kaç gün bir şey yaptığınla dolar; bütün modüller, testler, mola ve su kaydı aynı yerde toplanır. Bir alanda değişim ölçüm hatasından büyükse dış kenarda altın (iyileşiyor) ya da turuncu (geriliyor) yay çıkar. 35. günden sonra ilk 28 günün ile son 28 gününü karşılaştırabilirsin." },
      { kind: 'new', text: "Alan ayrıntısında 28 günlük düzen şeridi, hangi modülden kaç kayıt geldiği ve başlangıç soruların görünür." },
      { kind: 'new', text: "İyi oluş: 14 günde bir 5 kısa soru (WHO-5, resmî Türkçe metin). Puan 0–100; 10 puan ve üstü değişim anlamlı sayılır. Tanı değildir, yalnız kendinle karşılaştırılır." },
      { kind: 'new', text: "Ana sayfada küçük harita: kaç alanda kaydın olduğunu ve hangisinin iyileştiğini gösterir; en az ilgilendiğin alan için tek bir öneri sunar (vakti geldiyse İyi oluş soruları)." },
      { kind: 'fix', text: 'Göz kırpma egzersizinin gerçek süresi kaydedilir (önceden tahmin ediliyordu). Deneme ekranındaki iris haritasında Dikkat ve Farkındalık alanları yaptığın görevlerle dolar; önce hep boş görünüyordu.' },
      { kind: 'change', text: 'Egzersiz adı sadeleşti: "Tam göz kırp" artık "Göz kırp".' },
      { kind: 'new', text: 'Göz takibi kullandıkça kendini iyileştirir: egzersizdeki "Sağa bak", "Sola bak", "Yukarı bak", "Aşağı bak" adımlarında gözünün gerçekte nereye gittiği öğrenilir ve ayar sessizce sana oturur. Yeniden göz ayarı yapmana gerek kalmaz; tutarsız ölçümler (başka yere bakma, kırpma) sayılmaz.' },
      { kind: 'change', text: 'Göz ayarında yönlendirme daha net: "Ortadaki göz bebeğinin içindeki noktaya bak." Ekrandaki gözün tam ortasındaki noktaya bakınca ayar daha doğru olur; sesli yönlendirmeler de buna göre yenilendi.' },
      { kind: 'fix', text: 'Göz takibi bakışını artık telefonun ekranına göre ölçüyor. Önceden yerçekimine göre ölçülüyordu: telefon yana yatınca ya da başın kayınca yönler karışabiliyordu. Yeni ölçüm için göz ayarı bir kez yeniden istenir.' },
      { kind: 'new', text: 'Göz ayarının sonunda beş noktalık kısa kontrol: her yön gerçekten doğru okunuyor mu ölçülür; zayıf kalan yön varsa söylenir.' },
      { kind: 'change', text: 'Göz takibi açıkken ekran dikey kalır; ayar dikeyde yapıldığı için yan çevirince yönler şaşmasın.' },
      { kind: 'fix', text: 'Göz kalibrasyonu, ayar sırasında telefon ya da baş biraz kayınca sağ–sol ve yukarı–aşağı bakışı ayırt edemiyordu; artık bu kaymayı hesaba katıyor. Tekrar gerekirse nokta sola, ortaya, sonra sağa gider (yukarı, orta, aşağı için de aynı).' },
      { kind: 'change', text: 'Kalibrasyon bir çıkmazla bitmez: ayrım bu sefer yetmezse "Temel ayarla devam" dersin, egzersizler yine çalışır; istersen hemen yeniden ayarlarsın.' },
    ],
  },
  {
    id: '2026-09-27',
    title: '27 Eylül güncellemesi',
    items: [
      { kind: 'fix', text: 'TestFlight sürümünde "Apple ile devam et" hata veriyordu (Apple girişi uygulamaya bağlanmamıştı); Apple girişi artık uygulamanın kendi parçası.' },
      { kind: 'fix', text: 'Apple Sağlık izin açıklamasına "Nefona Sağlık\'a hiçbir veri yazmaz" cümlesi eklendi; Apple bu açıklama olmadan güncellemeyi kabul etmiyordu.' },
      { kind: 'change', text: 'Egzersizler yenilendi: her hareket aynı sahnede çizilir (kırpmada göz, bakışta hedef iris, dairede yörünge, uzağa bakışta ufuk, nefeste küre); çevresindeki altın halka ne kadar kaldığını gösterir. Setten önce hareketlerin listesi çıkar, Başla ile başlarsın. "Gözlerini kapat" adımında ekran iki temada da kararır. Göz kırpma egzersizinde bir tekrarın adımları ritim şeridinde görünür.' },
      { kind: 'new', text: 'Egzersizlerde bütün sesli yönlendirmeler Profilim\'de seçtiğin sesle (kadın ya da erkek) söylenir. Kırpma adımında "Kapat, hafifçe sık" ve "Aç" ritmi kamerasız da sesle verilir; yakın–uzakta "İrise bak" ve "Uzağa bak" sırayla söylenir.' },
      { kind: 'change', text: 'Göz kalibrasyonu yenilendi: bakacağın nokta artık bir iris; ortasındaki altın noktaya bakarsın, altın halka dolunca o nokta tamam. Yüz görünmezse iris solar, başını çok çevirirsen halka turuncuya döner. Yönlendirmeler Profilim\'de seçtiğin sesle (kadın ya da erkek) söylenir. Noktaların yeri ve süreler aynı.' },
      { kind: 'change', text: 'Seslendirme sesi (kadın ya da erkek) artık bir kez Profilim → Seslendirme\'den seçilir; nefes ve diğer sesli yönlendirmeler hep o sesi kullanır. Nefes ayarında yalnız sesli komutu açıp kapatırsın.' },
      { kind: 'fix', text: 'Nefes seansında sesli komutlar ("Nefes al", "Tut", "Nefes ver") çalmıyordu; düzeldi. Telefon sessizdeyken de duyulur.' },
      { kind: 'new', text: 'Nefeste sesli komutlar artık profesyonel Türkçe seslendirme: kadın ya da erkek sesi seç (nefes ayrıntısında "Sesli komut"), "Dinle" ile önce duy. Sesler uygulamanın içinde; internet gerekmez.' },
      { kind: 'new', text: "Nefes yenilendi: sekiz kalıp, her birinin ritmi çizili ve kanıt düzeyi (güçlü, orta, sınırlı) yanında. Yeni: Eşit ritim, Karın nefesi, Burun değiştir (hangi taraftan alıp vereceğin ekranda) ve Vızıltı (mırıldanarak veriş). 1 dakikada sakinleş kısayolu; sakinlik puanı Başla'dan sonra tek dokunuş, istersen puansız başlarsın." },
      { kind: 'change', text: "Profil kaydetme izninin metni sadeleşti: ne kaydedilir, ne işe yarar, nerede durur, ne kadar kalır; her biri tam cümleyle." },
      { kind: 'change', text: "Güvenlik ekranı artık soru değil, bilgi: göz doktoruna gitmeyi gerektiren belirtiler listelenir, \"Anladım, devam\" ile uygulamayı kullanırsın; hiçbir durumda kilitlenmez. Aynı liste Bilgi sekmesinde ve Gelişim'deki göz uyarısında da durur." },
      { kind: 'new', text: "İris haritası: gözünden başlayıp bütün insana. Göz bebeğinin çevresinde yedi alan (Göz, Dikkat, Farkındalık, Sakinlik, Kendine yaklaşım, İyi oluş, Beden); kurulumda başlangıç haritan dolar, 28. günde yeniden bakıp yan yana görürsün." },
      { kind: 'change', text: "Yeni kurulum sırası: güvenlik kontrolü testten önce, sonra İlk Bakış ve dört kısa soru (stres, uyku, hareket, kendine şefkat; her biri araştırmada kullanılan tek soruluk ölçeklerden). Yaş artık doğum tarihinden; ayrıca sorulmaz." },
      { kind: 'change', text: "Deneme ekranı yenilendi: haritan en üstte, Premium'da ne olduğu üç satırda, deneme günleri tek çizgide; satın alma düğmesi hep görünür." },
      { kind: 'change', text: "İlk Bakış yenilendi: okuduğun kelime sarıyla ilerler, üstte hızın yazar. Okuma metni bir araştırmadan: hayal ettiğin ışığa göz bebeğin tepki veriyor (Laeng ve Sulutvedt 2014). Sonuçta 20 saniyelik kırpma çizgin, en uzun kırpmadığın ara ve o arada okuduğun satırlar çıkar." },
      { kind: 'fix', text: "İlk Bakış'ta okurken yapılan kırpmaların çoğu sayılmıyordu (okurken göz kapağı hafif iner); sayım okumaya göre yeniden yazıldı." },
      { kind: 'new', text: 'Google ile giriş (iPhone): Apple\'ın güvenli oturum penceresinde Google hesabını seçersin; ek bir Google ya da Facebook yazılımı uygulamaya girmez.' },
      { kind: 'change', text: 'Yeni hoş geldin ekranı: Pegasus gökyüzü ve ufuk kavisi; Apple ya da e-posta ile devam et, istersen hesapsız dene. Açık ve koyu temada ayrı tasarlandı.' },
      { kind: 'change', text: 'Yeni giriş ekranı: film kalktı. Gece göğünde Pegasus, altın odakta tek yıldız ve ufuktan doğan göz; Başla göz bebeğinde. Hareket yok, beklemeden başlarsın.' },
      { kind: 'new', text: 'Hatırlatmalar (Bilgi → Hatırlatmalar): mola, yürüyüş, nefes ve su. Hangilerinin geleceğini ve saatini sen seçersin; her türden günde en çok bir hatırlatma. Ana sayfada bir kez sorarız, cevap vermeden hiçbiri kurulmaz.' },
      { kind: 'new', text: '1 dakikalık mola: kalk, uzağa yürü, 20 saniye uzağa bak, yavaşça göz kırp. Atlayabilirsin; kayıt Nef\'e ve seriye girmez.' },
      { kind: 'new', text: 'Çalışma oturumu: 1, 2 ya da 4 saat seç; saatte bir mola hatırlatması gelir. Ana sayfadaki şeritten bitirebilirsin.' },
      { kind: 'new', text: 'Su kaydı ve 1 dakikalık nefes: hatırlatmaya dokununca açılır; nefeste başta ve sonda puan sorulmaz.' },
      { kind: 'new', text: 'Yürüyüş hatırlatması adımın o saate kadar yeterliyse gelmez; uygulamayı açmasan da telefon kendisi iptal eder (Apple Sağlık iznin varsa).' },
      { kind: 'new', text: 'Gelişim: açık her hatırlatma için ölçüm kartı. Bazı günler bilerek göndermiyoruz; gelen ve gelmeyen günlerde ne yaptığın sayıyla yazar. Veri telefonundan çıkmaz.' },
      { kind: 'change', text: 'Çalışma günleri hatırlatması artık uygulama bildirimi; takvim dosyası düğmesi kalktı. Takvimine daha önce eklediysen oradaki etkinliği silebilirsin.' },
      { kind: 'change', text: 'Apple Sağlık izin metnine yürüyüş hatırlatması ve ölçüm amacı eklendi; bu yüzden izni bir kez yeniden soruyoruz. "Şimdi değil" dersen adımların yine görünür, yalnız yürüyüş hatırlatması açılmaz.' },
      { kind: 'fix', text: 'Sürüm notlarındaki bir yazım hatası uygulamanın derlenmesini engelliyordu; düzeldi.' },
    ],
  },
  {
    id: '2026-09-26',
    title: '26 Eylül güncellemesi',
    items: [
      { kind: 'new', text: 'Hesap: Apple ile giriş ya da hesapsız devam. Hesabın varsa profilin yeni telefonda da seninle.' },
      { kind: 'new', text: '"Seni tanıyalım": ad, doğum tarihi (gün/ay/yıl kutucukları), şehir (81 il önerisi), gözlük/lens.' },
      { kind: 'new', text: '7 gün ücretsiz deneme artık kurulumun sonunda; 5. gün istersen bildirimle hatırlatırız.' },
      { kind: 'new', text: 'Profilim: şehir, hesap aç / çıkış yap / hesabımı sil.' },
      { kind: 'new', text: 'Yeni giriş filmi: iristen içeri dalış, siluetler, fark etme anlarında yavaşlayan zaman, takımyıldızı Pegasus.' },
      { kind: 'new', text: 'Gelişim yenilendi: göz, kendine yaklaşım, farkındalık, sakinlik, dikkat kutucukları. Her birinde değişimin anlamlı mı yoksa doğal oynama mı olduğu, yöntem ve makale kaynağı.' },
      { kind: 'new', text: 'Göz kötüleşirse Gelişim\'in en üstünde açık uyarı: ne zaman tekrar ölçmeli, ne zaman göz doktoruna gitmeli (art arda 3 test kuralı, Faes 2021).' },
      { kind: 'new', text: 'Her uygulamadan sonra sorulan "şimdi nasıl hissediyorsun" puanları (Nefes, Gökyüzü, Dalga, Yön) artık Gelişim\'de: önce → sonra, ortalama ve güven aralığıyla.' },
      { kind: 'new', text: '5. gün "İlk rapor": düzenin, uygulamalardan sonraki değişim ve ölçümlerin tek sayfada. Deneme hatırlatmasına dokununca da açılır; sonra Gelişim\'de durur.' },
      { kind: 'new', text: 'Gelişim → Dışa aktar: "Doktoruma göster" PDF raporu (göz testlerin, uyarı kuralı, diğer ölçümlerin özeti) ve tüm ölçümler CSV olarak. Dosya yalnız senin seçtiğin yere gider.' },
      { kind: 'change', text: 'Göz başlangıç değeri artık en az 7 testle oluşuyor (önce 3): yanlış uyarı daha seyrek. 21. günde 7 test yoksa başlangıç 7. teste kadar uzar.' },
      { kind: 'fix', text: 'Göz uyarısı tam eşikte (ör. başlangıç 0,20, son testler 0,30) tetiklenmiyordu; düzeldi.' },
      { kind: 'change', text: 'Göz metinleri makalelere göre netleşti: bir testten diğerine ±0,2 oynama olağan; gri bant (±0,10) tek testin oynaması değil, 7 günlük ortancanın değişim eşiği. "Sabit" yerine "doğrulanmış değişim yok".' },
      { kind: 'fix', text: '"Verilerimi indir" iPhone\'da çalışmıyordu; artık paylaşım sayfası açılıyor (Dosyalar, Mail, AirDrop).' },
      { kind: 'fix', text: 'Göz kalibrasyonu: baş duruşu hesaba katılıyor; "Ayırt edemedim" ekranı çok daha seyrek. Tekrar turu ortayı da yeniliyor.' },
      { kind: 'fix', text: 'Göz yönleri: kalibrasyonsuz kullanımda sağ–sol terslenmişti (ör. "Sola bak", saat yönünde daire). Düzeldi.' },
      { kind: 'fix', text: 'Güncellemeden sonra giriş filmi oynamıyordu; yeni film bir kez oynar (hareketi azalt açıksa atlanır).' },
      { kind: 'fix', text: 'Doğum tarihi Türkiye saatinde her tarihi reddediyordu; düzeldi.' },
      { kind: 'fix', text: 'Şehir listesi açılmıyordu; artık dokununca 81 il açılıyor, yazdıkça süzülüyor.' },
      { kind: 'fix', text: 'Giriş ya da ödeme ekranı hata verirse altında hata kodu görünüyor (destek için).' },
      { kind: 'fix', text: 'Ödeme ekranı "Planlar yükleniyor"da takılı kalıyordu (abonelik altyapısı hiç başlamıyordu); düzeldi. Planlar yine gelmezse 20 saniye sonra nedeni yazılır.' },
      { kind: 'fix', text: 'İlk bakış kırpma sayımı: okuma metni 20 saniyeden önce bitiyordu; metin uzadı, süre boyunca okuma sürüyor.' },
      { kind: 'fix', text: 'Kamera izni vermezsen 40 cm ekranında takılmıyorsun: "Kamerasız devam et" çıkıyor. Nef göz koçu artık iki ayrı izinle açılıyor (özet sayılar / profil cevapları). Nefona 18 yaş ve üstü içindir.' },
      { kind: 'fix', text: 'Kamera izni yokken ekranlar "başlatılıyor" diye bekletmiyor, iznin nereden açılacağını yazıyor. "Kamerasız devam et" dersen oyunlar ve egzersizler de kamerasız çalışır; Bilgi → "Mesafe takibini aç" ile geri açarsın. Bilgi\'den açılan 40 cm ekranında artık "Vazgeç" var.' },
      { kind: 'change', text: 'Nef izinleri kayıt altında: ne gittiği (görme ölçümü ve nefes sonrası sakinlik farkı dahil), nereye (yurt dışı) ve ne kadar süre tek tek yazıyor. Eski sürümde izin sormadan açılmış Nef bir kez kapanır ve yeniden sorar. Profil cevapları için ayrı izni Profilim → İzinlerim\'den verirsin.' },
      { kind: 'fix', text: '18 yaş altında kurulum ekranında "Hesabımı sil" var; yanlış "Ad ve doğum tarihi gerekli" uyarısı kalktı. Ana sayfa ve profil sorularındaki "yalnız bu telefonda" metinleri neyin nereye gittiğini doğru söylüyor.' },
      { kind: 'new', text: 'Apple Sağlık (izninle, yalnız okuma): bugünkü adımın ana sayfada, son 7 gün Gelişim → Beden\'de. Uzun süre kalkmadıysan Nef önce 2 dakika yürümeni önerir. Veriler telefonundan çıkmaz.' },
      { kind: 'change', text: 'KVKK: profilin sunucuya ancak açık iznine göre eşitlenir. Ne, neden, nerede (Frankfurt), ne kadar süre tek sayfada; kutu önceden işaretli değil. İznini Profilim → İzinlerim\'den geri çekersen sunucudaki kopya silinir.' },
      { kind: 'new', text: 'Profilim: Premium kartı (deneme kaç gün kaldı, ne zaman biter, aboneliği yönet), giriş şeklin ve İzinlerim: hangi verinin nereye gittiği; Nef izinlerini buradan kapatabilirsin.' },
      { kind: 'new', text: 'Ana sayfa yenilendi: günün diyaframı (bugün yaptıkça açılır), seri, bu hafta ve toplam gün; Nef\'in tek önerisi ve Nefes / Dalga kısayolları. Sağ üstteki avatarınla Profilim açılır.' },
      { kind: 'change', text: 'Bugünün yolu artık sıralı: duraklar tek tek açılır. İlerideki bir durağa dokununca önce sıradakini yapman istenir; bitenleri istediğin kadar tekrar yapabilirsin.' },
      { kind: 'new', text: 'Abonelik: haftalık plan eklendi (yıllık, aylık, haftalık; hepsi 7 gün ücretsiz deneme). Ödeme ekranı App Store fiyatlarını yüklüyor.' },
      { kind: 'change', text: 'Yeni uygulama simgesi: Nefona\'nın "n" harfi bir göz kapağı, altında iris.' },
      { kind: 'change', text: 'Uygulamanın yeni adı Nefona; koçun adı Nef. Ana ekranda, ödeme ekranında, PDF raporunda ve dosya adlarında yeni ad.' },
    ],
  },
]

export const latestRelease = () => RELEASES[0] ?? null

// Görülmemiş sürümler (seenId'den yeniler). seenId yoksa yalnız en son sürüm.
export function unseenReleases(seenId) {
  if (!seenId) return RELEASES.slice(0, 1)
  return RELEASES.filter((r) => r.id > seenId)
}
