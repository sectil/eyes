# SONSUZ_YOL.PLAN.v1 · plana işlenecek düzeltmeler (S0, 30 Eylül 2026)

Bu liste S0 ekran kararlarından (`sorular-kararlar.md`) çıkar. Plan dosyası bu işte **değiştirilmedi**; aşağıdaki yerler
plan bir sonraki sürümüne geçerken işlenir. Satır numaraları `SONSUZ_YOL.PLAN.v1.md`'nin 30 Eylül 2026 hâlindendir.
Hiçbiri onaylı bir kararı değiştirmez: çoğu planın kendi içindeki çelişkinin tek biçime bağlanmasıdır, kalanı planın boş
bıraktığı yerin doldurulmasıdır. Yoga sabah kartının yeri (madde 19) sahibin kararını beklediği için burada yok.

Biçim: **Yer** · şimdiki metin → yeni metin · (soru numarası).

---

**D1 · Tarih satırının biçimi** (1)
- §3.E.7 :966 · "Salı, 29 Eylül · küçülen şişkin ay" → "29 Eylül Salı · küçülen şişkin ay" (kodun bugünkü biçimi, `Home.jsx`
  `toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })`). Plan içindeki bütün tarih örnekleri
  aynı biçimde yazılır.

**D2 · Ay simgesinin yeri** (2)
- §3.E.7 :966-967 · "önünde evreye göre çizilen ay simgesi durur" → "evre adının hemen önünde evreye göre çizilen ay simgesi
  durur".

**D3 · Dolunay günü** (3)
- §3.F.5 :1091-1092 · "Ay şeridi her gün farklıdır; dolunayda yalnız betimleme ("Bu gece dolunay") yapılır." → "Ay şeridi her
  gün farklıdır; dolunay gününde yalnız evre adı ("dolunay") yazılır. Saat bildiren "Bu gece dolunay" yazılmaz, çünkü dolunay
  anı gündüz de olabilir (26 Ekim 2026'da 07.12)."
- §3.E.7 :970-973 · kartın ay satırına örnek eklenir: dolunay gününde "Dolunay · %99 aydınlık"; alt satırda en yakın geçmiş
  ve gelecek evre ("Son yeniay: 10 Ekim · Sonraki yeniay: 9 Kasım").

**D4 · "Sağ–sol" → "Sağ–sol bakış"** (4)
- §1 :67 · "Göz: kırpma → sağ–sol → üçü birlikte" → "Göz: kırpma → sağ–sol bakış → üçü birlikte".
- §3.A.6 :427 · "**Sağ–sol** [sağa bak, sola bak, kapat]" → "**Sağ–sol bakış** [sağa bak, sola bak, kapat]".
- §3.A.6 :438 · "(K2'de başlığı "Sağ–sol")" → "(K2'de başlığı "Sağ–sol bakış")".
- §3.A.9 :482 · "Sağ–sol, Nefes 2 dk, …" → "Sağ–sol bakış, Nefes 2 dk, …".
- §3.F.5 :1082 · "2. gün sağ–sol ve Yılan" → "2. gün sağ–sol bakış ve Yılan".

**D5 · 7. günün cümlesi ve kilometre taşlarının tekrar kuralı** (5)
- §3.F.4 :1074 · "Aynı öncelik iki gün üst üste gelmez (0 ve 1 hariç)" → "Aynı öncelik iki gün üst üste gelmez (0, 1 ve 2
  hariç; her kilometre taşı ayrı bir olaydır ve kendi cümlesini taşır)". Gerekçe: §3.F.5'teki 7. gün "İlk haftan" ve 8. gün
  ikinci E testi, 28. gün iris haritası ve 29. gün E testi ve aylık Nef art arda gelen kilometre taşlarıdır; kural bunları
  yasaklıyordu.
- §3.F.4 :1065 · 2. önceliğin örneklerine eklenir: "Bugün 7. gün: ilk haftanı tamamlıyorsun."
- §3.F.5 :1083-1084 · "7. gün "İlk haftan" satırı" → "7. gün "Bugün 7. gün: ilk haftanı tamamlıyorsun." cümlesi".
- §1 :48 · "Günün ilk cümlesi her gün değişir ("Bugün yeni: yakın–uzak.")." → "Günün ilk cümlesi her gün değişir (4. gün
  "Bugün yeni: yukarı–aşağı.", 7. gün "Bugün 7. gün: ilk haftanı tamamlıyorsun.")." Yakın–uzak'ın yeniliğini 7. gün yoldaki
  "Yeni" etiketi söyler.

**D6 · "Günün ritmi" → "Bugünün ritmi"** (6)
- §1 :78, §2.2 :242, §3.A.4 :386 ve :393, §3.A.9 :488 ("nefeste "günün ritmi""), §3.A.10 :520 · "Günün ritmi" → "Bugünün
  ritmi". Kart metni (§3.A.4 :404) zaten "Bugünün ritmi"dir.

**D7 · "Yolun" bölümünde basamak ve gün** (7, 18)
- §3.B.6 :662 · "basamak ("N4 · 3 dk")" → "basamak, sıra sayısıyla ("5. basamak · 3 dk"; iç kodlar ekranda görünmez)".
- §3.B.6 :661 · "başlığı "Yolun · 34. gün"dür" → "başlığı "Yolun · 34. gün"dür; sayı iris haritasının ortasındaki gün
  sayısıdır (başlangıçtan beri takvim günü)".

**D8 · Mola süresi, bant ve baloncuk** (8)
- §1 :68 · "Aralar" satırına eklenir: "Mola 1. gün 1, 2. gün 2 dakikadır ve nefesle biter; 3. günden başlayarak 5 dakikadır."
- §1 :77, §2.3 :299, §3.A.4 :396 · "mola (yine / zaten) 5 dakikadır" → "3. günden başlayarak mola 5 dakikadır".
- §3.A.4 sonuna eklenir: "Bant molanın tamamını yazar ("Mola · 1 dk", "Mola · 2 dk", "Mola · 5 dk"); baloncuk 3. günden
  başlayarak "Sırada mola: 3 dk nefes, 2 dk dinlenme" der."
- §3.G.3 Y1 "Değişen" sütununa eklenir: `components/TodayPath.jsx:340` (bant süresi molanın tamamı), `lib/today.js:431`
  (baloncuk metni).

**D9 · Kanıt kartları ve kart seçimi** (9, Ç18)
- §3.D.4 :805 · `kirpma-gunu` metni → "Kuru göz yakınması olan 28 kişiyle yapılan bir çalışmada, iki hafta kırpma egzersizi
  yapanlarda yakınmalar ve yarım kalan kırpmalar azaldı; egzersiz bırakıldıktan iki hafta sonra ölçümlerin çoğu başlangıca
  döndü. Tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez." "Yolunda bu adımın her gün olmasının nedeni
  budur." çıkar (§3.A.6 :441-442 bu gerekçeyi kullanıcıya söylemez). Kanıt sütunu → "Wolffsohn 2025 (iki aşama: 98 kişide
  randomize program karşılaştırması, 28 kişide etki ölçümü; günde 3 kez 15 tekrar, 2 hafta; kuru göz)".
- §3.D.4 :806 · `uzaga-bakis` metninin sonuna eklenir: "Karşılaştırma grubu olmayan tek bir çalışmanın bulgusudur; sende aynı
  sonucu vereceği söylenemez."
- §3.D.4 :815 · "(öncelik: dolunay, gece ekranı, yol kartları)" → "(kart yüze dokunulduğu anda seçilir; öncelik: dolunay, yol
  kartları. Gece ekranı kartının tetiği etiketten sonra bilindiği için o, yalnız o akşam başka kart gösterilmediyse "Tamam"dan
  sonra aynı yerde çıkar)".

**D10 · Alarm kartlarında hava** (10)
- §3.E.6 :959-960 · satırın başına eklenir: "App Review'un olumlu cevabından sonra (yedekte yok):".

**D11 · Hava teklifinin yedek hâli** (11, Ç4, Ç5, Ç14)
- §3.E.7 :978-979 · sonuna eklenir: "Hukukçu yedeğinde metin "Şehrinin havasını da göstereyim mi?", düğmeler [İstanbul için
  göster] [Hayır] (Profil'deki şehir 81 ilden biri değilse [Şehir seç] [Hayır]); başka il kartın başlığındaki il adından
  seçilir. Teklifte kapatma (×) yoktur; "Hayır" kalıcıdır."
- §3.E.7 :978 · ""Hayır" ya da kapatma kalıcıdır" → ""Hayır" kalıcıdır".
- §3.E.7 :981 · "hiç sorulmadı" hâline eklenir: "yedekte "Şehrinin havasını göstereyim mi?" [İstanbul için göster] [Şehir
  seç]".
- §3.H Y5 cihaz listesine eklenir: "320 × 568'de hava teklifi günü büyük düğmenin yeri".

**D12 · "(yaklaşık)"** (12)
- §3.E.7 :970 · "başlık "HAVA VE AY · İstanbul (yaklaşık)"" → "başlık "HAVA VE AY · İstanbul" ("(yaklaşık)" yalnız konumdan
  bulunan il için yazılır)".

**D13 · Nef rızası v2 metninin kaynağı** (13)
- §3.C.5 sonuna eklenir: "Metin S0 çizimindedir (`S0/ekranlar.html` (i)); `YOL.nef.md` §7.4'teki taslak karar 6'ya aykırı
  olduğu için kullanılmaz." §2.4'e eklenir: "`YOL.nef.md` §7.4 taslağı geçersizdir."

**D14 · coachLife v2** (14)
- §3.C.5 :724 · "coachLife rıza metnindeki "ekran süresi" satırı da kalkar." → "coachLife rıza metnindeki "ekran süresi"
  satırı da kalkar; metin yalnız daraldığı için izin vermiş kişiye yeniden sorulmaz (sürüm kayıt için artar, yeniden sorma
  tetiği bu daralmada kapalıdır, `lib/consent.js` `shouldAsk`)."

**D15 · Ölçü kuralı v2 metinleri** (16, 17)
- §3.B.5 tablosuna (:616-622) iki satır eklenir: "Harita lejantı | "iyileşiyor" / "geriliyor" | "başlangıcından iyi" /
  "başlangıcının gerisinde"" ve "Önce → sonra etki hapı | "belirgin iyileşme" / "belirgin kötüleşme" | "belirgin artış" /
  "belirgin düşüş" (yoganın onaylı kalıbı; "Yolun" satırında ölçünün adıyla: "sakinlikte belirgin artış")".
- §3.B.5 :620 · "Göz (E testi, okuma) | "iyileşiyor" | değişmez" → "… | değişmez; değişim yoksa "doğrulanmış bir değişim
  yok" (bugün "doğrulanmış değişim yok", `ProgressOverview.jsx`), kural (`trend.js`) değişmez".
- §3.G.3 Y2 "Değişen" sütununa: harita lejantı ve etki hapları (`components/ProgressOverview.jsx`).

**D16 · Açılış ve giriş ekranı** (20, Ç10)
- §3.F.2 :1022 · "açılış ekranı logosuz düz zemindir" → "açılış ekranı logosuz düz zemindir; zemin bugünkü açılış görselinin
  zeminidir (açıkta #F3F6F8, koyuda #070C12), renk değişmez".
- §3.F.2 :1022-1023 · alt yazıya eklenir: "320 × 568'de alt yazı en az 14 px kalır."

**D17 · Sitenin ilk ekranı** (21, Ç12, Ç15)
- §3.F.2 :1033 · "Bugünkü iki düğme ve E testi tadımlığı yerinde kalır." → "Bugünkü üst başlık, iki düğme ve E testi tadımlığı
  yerinde kalır; soru satırı ve tanıtım paragrafı kalkar. Kısa gerçeklerden "Kamera görüntün telefondan çıkmaz" kalkar (yeni
  satırda aynı söz var). Başlık masaüstünde 2,9rem ve iki satır, 360 pt altında 1,9rem'dir."

**D18 · Ana sayfanın sayıları ve büyük düğme** (22, 23, 24, Ç7, Ç16, Ç19, Ç20)
- §3.F.3 :1051 · ""0/9 durak · ≈ 15 dk"" → ""9 durak · bugün ≈ 15 dk" (ilk duraktan önce; ilk durak bitince "1/9")".
- §3.F.3 :1051 · "sıfır satırı yok (karar 5d)" → "Ana sayfada değeri sıfır olan hiçbir sayı görünmez: seri, "0/3 gün bu
  hafta", yolun altındaki "Bu hafta 0/3 gün", Nef kartının kural yedeğindeki "0/3" (yerine "Yeni hafta başladı; hedefin 3
  gün."); seri 3 gün ve üstündeyken "N gün seninle" de kalır, yalnız seriyle aynı sayıyken yazılmaz (karar 5d)".
- §3.F.3 :1051 sayılar satırına eklenir: "Hafta satırı "2/3 gün bu hafta" yazılır; hedef tutunca "4 gün bu hafta" ve yeşil
  tik (bugün "2/3 hafta", "4✓ hafta")."
- §3.F.3'e eklenir: "Hemen altındaki Nef kartı haftanın sayısını söylüyorsa yolun altındaki "Bu hafta N/3 gün" o gün
  yazılmaz."
- §3.F.3 :1050 · sonuna eklenir: "Ölçüm duraklarında (`hideMinutes`) büyük düğme de süre yazmaz ("Haftalık E testi")."
- §3.G.3 Y3 "Değişen" sütununa: `lib/homeSuggest.js` (`hideMinutes`), `lib/coach.js` (kural yedeğinin sıfır dalı),
  `screens/Home.jsx` (sayı sütununun hafta satırı ve "gün seninle", yolun altındaki hafta satırı).

**D19 · Beş yüz 320 pt'de** (25)
- §3.D.3 :778 · "dokunma alanı ≥ 44 pt" → "dokunma alanı ≥ 44 pt (320 pt'de yüzlerin arası 4 px)".

**D20 · Tutmalı günde kanıt metni** (Ç1)
- §3.A.4 :404-405 · sonuna eklenir: "Tutmalı günlerde ailenin metni "En sağlam kanıt bu kalıpta:" başı olmadan gösterilir ve
  "Bu kanıt tutmasız kalıptan geliyor; kısa tutmalı sürüm ayrıca incelenmedi." cümlesiyle biter."

**D21 · Apple Weather atfı** (Ç3)
- §3.E.7 :972-973 · "her zaman görünen atıf satırı (Apple Weather markası temaya göre, "Veri kaynakları" bağlantısı)" →
  "her zaman görünen atıf satırı: WeatherKit'in verdiği resmî Apple Weather işareti (`combinedMarkLightURL` /
  `combinedMarkDarkURL`, temaya göre; yeniden çizilmez), `legalPageURL`'yi açan "Veri kaynakları" bağlantısı". §3.J'deki
  "atıf görselinin önbelleğe alınıp alınamayacağı" satırına eklenir: "görsel yüklenemezse satırda ne duracağı Y5 kapısında
  lisans sözleşmesinden okunur".

**D22 · Nef'in dönem kartları** (Ç8)
- §3.C.2 tablosunun altına (:686) eklenir: "Kural şablonundan gelen haftalık ve aylık kart Nef izni olan ve olmayan kişide
  aynı yerlerde durur; izni olmayan kişide Ana sayfadaki satır Nef tanıtım kartının altına gelir. Etiketi "bu telefonda
  hazırlandı"dır; "çevrimdışı öneri" yalnız sunucuya ulaşılamayan günlük kartta kalır."

**D23 · Y1 cihaz listesi** (Ç13, Ç17)
- §3.H :1237-1239 Y1 listesine eklenir: "320 pt'de yolun bölüm etiketleri ve baloncuğu kırpılmıyor (bugün `TodayPath.jsx`
  300 px'lik koordinatla 10 px kırpıyor); bantta ilk yıldız "Mola · N dk" etiketinin altında (`TodayPath.jsx:267`); 2.
  bölümün tek durağı soldaysa bölüm etiketi sağda, yol etiketin üstünden geçmiyor".
