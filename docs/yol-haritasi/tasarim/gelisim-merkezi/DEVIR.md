# DEVİR · Gelişim merkezi ("ışıktan baş") · ana oturuma

Tarih: 2026-10-01. Hazırlayan: tasarım oturumu (dal `claude/gelisim-merkezi-plan`). Kodu ana oturum yazar.
Bu belge tek başına okunacak biçimde yazıldı; ayrıntılar bağlantılı dosyalarda.

## 0. Durum

- **Sahibin onayı.** Sahip kabul ölçütünü "seni mükemmel demen benim için yeterli" diye koydu. Tasarım oturumu
  `maket/ordu/parcacik/v6.html` için görüntülere bakarak "tasarım olarak mükemmel" dedi; sahip "hazırla" diyerek
  devri istedi. Sözler kelimesi kelimesine `SAHIP_ISTEKLERI.md` içinde.
- **PLAN.v1.md'nin ekran bölümleri geçersiz.** §1–§2 (ışık kubbesi), §4.1 (yaylar) ve §5'in ilk üç satırı bu belgeyle
  değişti. Veri (§3), bildirim (§6), rıza (§7), kod sözleşmesi (§8), kalite (§9) ve sıra (§10) **geçerli**; aşağıda
  değişen yerler yazılı.
- **Denetim bulguları** (`DENETIM.md`: K1–K4, Ö-1…Ö-12, Kü-1…Kü-14) G1'in içinde kapanır (PLAN §8.1). Ayrıca kapatılması
  gereken bir şey eklenmedi.

## 1. Onaylı tasarım (bağlayıcı)

**Maket:** `maket/ordu/parcacik/v6.html` (derleme çıktısı). Kaynağı: `maket/ordu/parcacik/v6-kaynak/`.
- `topla.mjs` derler; `uret.mjs` noktaları önceden pişirir.
- `yuz.js` yüz kitaplığıdır, `kafa.js` kafatası ve yüz SDF'idir.
- `mini3.js` yaklaşık 200 satırlık ince bir WebGL katmanıdır; three.js gerekmez ve dış betik yoktur.
- `ana.js` sahne, veri bağlantısı ve etkileşimi içerir.

Durumlar `#d30`, `#walk` ve `#d1`'dir; "kendi yüzün" için `&yuz=kendi` eklenir. Görüntüler `maket/ordu/parcacik/goruntu6/`
klasöründe.

1. **Baş.** Işık tozundan, burundan yukarısı görünen bir insan başıdır. Yüz MediaPipe'ın genel yüz modelinden gelir
   (`maket/ordu/model/canonical_face_model.obj`, 468 köşe, Apache 2.0; kaynak ve lisans `model/KAYNAK.md`).
   - Kafatası, ense ve kulak stilize SDF'dir ve yüzle dikişsiz birleşir.
   - Burun ucunun hemen altından yatay ve temiz bir kesim vardır; ağız ve çene görünmez.
   - Baş dörtte üç açıdan durur.
2. **Gözler.** İris ve kapaklar modelin kendi göz noktalarına oturur. Kişinin İlk Bakış'ta ölçülen kırpma hızıyla
   kırpar ve küçük sakkadlar yapar.
3. **Gelişim merkezi.** Başın içinde beş bölge vardır: Göz, Dikkat, Nefes, Ruh hâli, Hareket.
   - **Yalnız** `verdict === 'better'` (maketteki `st:'up'`) tam parlar.
   - Canlı yürüyüş (`live`) akar.
   - Öbür durumlar (başlangıç, değişim yok, henüz belli değil) sakin ve soluk kalır.
   - Eşitlik kuralı: aynı anda parlayan bölgeler eşit ekran parlaklığında görünür (maketteki normalizasyon).
4. **Etiketler.** Etiketler hap biçimindedir ve kısa çizgilerle bölgelere bağlanır. "Göz" etiketi yakın gözün yanında
   durur. Etiketler çakışmaz; 320 pt'de de doğrudur.
5. **Yürürken.** Hareket şeridi alnın üstünden enseye bir yay çizer. Turuncu ışık adım temposunda akar.
6. **Kendi yüzün (isteğe bağlı).** "Genel yüz / Kendi yüzün" anahtarı vardır.
   - Kendi yüzün açılınca, kişinin kamerayla ölçülmüş 468 noktası aynı topolojide genel yüzün yerine geçer.
     Geçiş 1,2 sn'lik yumuşak bir dönüşümdür.
   - Altında şu not yazar: "Yüzünün yalnız 468 noktası telefonunda kalır; görüntü saklanmaz. İstediğinde
     silebilirsin."
   - Maketteki biçim örnektir ve kimseye ait değildir.
7. **Ekran düzeni.** Yukarıdan aşağıya: başlık ve gün etiketi; baş sahnesi; Nef cümlesi; beş alan çipi. Çipe dokununca
   o bölge öne çıkar ve ayrıntı açılır. Açık temada sahne koyu bir kartın içinde çizilir.
8. **Metin kuralları.**
   - Ekranda "beyin" sözcüğü yok.
   - Sağlık iddiası yok.
   - "Tanıma" sözü yok.
   - Değişim sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli değil" ve "başlangıç".

## 2. Veri (PLAN §3 geçerli, şu farkla)

- Ekran `growthCenter` çıktısını okur (PLAN §3.1). Bölge parlaklığı **`verdict`'ten** gelir, gün sayısından gelmez
  (`days`/`frac` artık ekranın kahramanı değildir; ayrıntıda kalır).
- Çiplerin değeri ölçülen gelişimdir. Ölçümlerin listesi ve kaynakları `VERI.md` içinde; her değerin bir alan adı var.
  Örnekler: "E testi 0,20 → 0,20", "4 → 6 harf", "+1,3 sakinlik", "İyi oluş 56 → 68".
- Gözlerin kırpma hızı `profile.iris.baseline.blinks` / `recheck.blinks` alanlarından gelir (20 sn'deki sayı).
- `growthCenter`'a eklenecek alan: `areas[k].value` (çip metni için ölçüm ve başlangıcı, tek metin işlevinden; PLAN
  §3.5 madde 4).

## 3. Kod sözleşmesi

Aşamalar PLAN §8.1'deki gibidir; G2 değişti, G2b yeni.

| Aşama | Yeni | Değişen / not |
|---|---|---|
| **G1** veri | PLAN §8.1 aynen + `areas[k].value` | Denetim bulguları burada kapanır |
| **G2** ekran | `components/GrowthHead.jsx`: `v6-kaynak`'tan port. `mini3.js` → `lib/head/gl.js`; `yuz.js`, `kafa.js` → `lib/head/`; pişmiş noktalar → `assets/head/*.bin` (derleme zamanında `uret.mjs` ile; çalışma anında SDF örneklemesi yok) | `components/ProgressOverview.jsx`, `screens/Progress.jsx` (PLAN §8.1 G2 satırı); kubbe/yay kodu yazılmaz |
| **G2b** kendi yüzün | `lib/head/ownFace.js` (468 nokta → genel yüz uzayına hizalama: ölçek, öteleme, dönüş; göz çevresi sabit); İlk Bakış sonunda ayrı rıza adımı | Saklama anahtarı `storageKeys`'e eklenir; "Tüm verileri sil"e ve ayrı "Yüzümü sil" düğmesine bağlanır; dışa aktarım (CSV, PDF) ve Nef paketi bu veriyi **almaz** |
| **G3** bildirim | PLAN §6 aynen | Metinler §5'e göre |
| **G4** canlı yürüyüş | — | `GrowthHead`, B3 `walk` olayından `cadence` alır |

**Önemli teknik notlar**
- **Uygulamada dış betik yoktur.** Maketteki Google Fonts ve gömülü yazı tipleri uygulamada kullanılmaz; uygulamanın
  kendi Onest ve Unbounded paketleri kullanılır.
- **WebGL bağlam kaybı** (`webglcontextlost` / `restored`) ele alınır. Bağlam kurulamazsa durağan bir kare (önceden
  çizilmiş PNG) gösterilir.
- **Çizim yalnız ekran görünürken yapılır.** Sekme arka plandayken ve `document.hidden` iken döngü durur. Hareketi
  Azalt açıkken tek bir kare çizilir.
- **Nokta bütçesi (VARSAYIM; cihazda ölçülür).** Maket yaklaşık 68 bin nokta çiziyor (v5 düzeltme raporu; v6 ölçülmedi). Hedef: iPhone 11 ve üstünde
  ≥ 50 fps, açılış ≤ 300 ms. Tutmazsa nokta sayısı düşürülür; biçim korunur.
- **Kendi yüzün kaynağı.** İlk Bakış kamera yönteminde MediaPipe noktaları zaten var
  (`screens/FirstLook.jsx`, `m.landmarks`).
  - **TrueDepth yönteminde 468 nokta yok:** ARKit'in yüz ağı farklı bir topolojidir. Ya o anda ek bir MediaPipe ölçümü
    yapılır ya da ARKit → 468 eşlemesi gerekir. VARSAYIM: ilk sürümde yalnız kamera yöntemi; TrueDepth'li cihazda kısa
    bir MediaPipe ölçümü. Ana oturum doğrular.

## 4. Sıra

1. G1 (PLAN §10'daki gibi). 2. G2. 3. G2b, ancak §6 soru 1'e göre. 4. G3 (B1'den sonra). 5. G4 (B3 içinde).
Süreler PLAN §10'daki gibidir. G2'ye port ve performans için +1–2 iş günü eklenir (VARSAYIM). G2b yaklaşık 2 iş günü
(VARSAYIM).

## 5. Bildirim metinleri (kapı sonuçları `kapi/5sn-kapi6.md`)

- **Haftalık (h):** 5/5 geçti. Başlık "Geçen hafta 5 gün çalıştın"; gövde "Nefes yayın 5 günün hepsinde ışıdı. Yeni
  hafta bugün başlıyor.".
  - **Değişmeli:** "yay" ve "ışıdı" uygulama içi dil. Yeni tasarımda yay yok; gövde örneğin "En çok nefeste çalıştın:
    5 günün hepsinde." olur.
- **Aylık (m2):** 3/5, geçmedi. "Hareket yayın 28 günün hepsinde ışıdı; ilk kez tamamlandı" metni hem tekrar ediyor
  hem de yalnız hareketi övüyor. Yeni metin `verdict`'e dayanır, örneğin "İlk ayın tamam" · "Üç alanda başlangıcından
  iyisin: dikkat, nefes, ruh hâli.".
  - Bildirimde "gerisinde" ve sağlık yorumu yer almaz (PLAN §6).
- **Gizli kip:** 3/5. "Haftan hazır" yerine "Geçen haftanın özeti hazır" önerildi.

## 6. Açık sorular (sahibe; en çok 3)

1. **Kendi yüzün ilk sürüme girsin mi?** Yüz biçimi biyometrik veridir; KVKK'da özel nitelikli kişisel veri sayılır.
   Açık rıza, aydınlatma metni ve silme şart. Hukukçu onayı gelmeden açılmamasını öneriyoruz (G2b ayrı yayın).
2. **Aylık bildirim metni** (§5'teki öneri) onaylansın mı?
3. **Performans tutmazsa:** nokta sayısı azaltılırken görünüm biraz incelir. Sahibe cihazda gösterilip onay mı alınsın,
   yoksa eşik (≥ 50 fps) yeterli mi sayılsın?

## 7. Testler

- **Veri:** PLAN §8.2–§8.4 aynen (eşdeğerlik 0 fark, tek hesap testi, denetim betikleri test olur).
- **`GrowthHead` birim testleri:**
  - verdict → parlaklık eşlemesi: yalnız `better` tam parlak; `live` akar; öbürleri soluk.
  - Eşit parlaklık normalizasyonu.
  - Çip dokunuşu bölgeyi seçer.
  - Hareketi Azalt açıkken tek kare.
  - Ekran metninde "beyin" ve "tanıma" yok.
  - Bağlam kaybında durağan kare.
- **`ownFace`:** 468 nokta beklenir; eksikse genel yüzde kalır. Hizalama sonrası göz çevresi sabittir. Silme
  işlevi anahtarı kaldırır. Dışa aktarımda ve Nef paketinde yüz verisi yoktur (test eder).
- **Görsel:** maketteki `shot.mjs` yöntemi uygulamanın Vite önizlemesine uygulanır. 3 durum × 2 tema × 390/320
  çekilir ve maket görüntüleriyle yan yana konur.

## 8. Cihaz listesi (PLAN §9'a ek)

- **Performans:** iPhone SE 2/3, iPhone 11, en yeni iPhone'da fps, açılış süresi, pil (10 dk açık ekran) ve ısınma.
- **Düşük Güç Modu.**
- **WebGL bağlam kaybı:** uygulamayı arka plana alıp geri getirme.
- **Görünüm:** iki tema; 320 pt; Hareketi Azalt; VoiceOver ile her bölge ve çip.
- **Kendi yüzün:**
  - Rıza ver / verme / geri al.
  - "Yüzümü sil" ve "Tüm verileri sil" sonrası genel yüze dönüş.
  - Kamera ve TrueDepth yöntemleri.
  - Gözlük, saç ve düşük ışık.
- **Yürürken:** B3 oturumunda şerit temposu ve oturum bitince durması.
- **Gerçek ekranlarda 5 saniye kapısı:** sahibin cihazda bakışı. Kabul ölçütü sahibin sözüdür (§0).

## 9. Dürüst sınırlar

- **Cihazda hiçbir şey denenmedi.** Akıcılık yalnız başsız Chromium'un yazılımsal WebGL'inde ölçüldü.
- **Değerlendiriciler yapay rollerdir.** Kapı, eleştiri ve denetim ajan ordusuyla yapıldı (`maket/ordu/`). Son kabul
  sahibin sözüdür.
- **Kendi yüzün hukuku.** KVKK değerlendirmesi hukukçunun işidir; bu belge hukuki görüş değildir.
- **Kırpma gösterge, ölçüm değil.** Gözlerin kırpması bir göstergedir. Bölge parlaklığı yalnız kodun doğruladığı
  değişimi gösterir; sağlık sonucu anlatmaz.
- **v5 kaynağı tutarsız.** `v5-kaynak/ana.js`, v5.html'ye sonradan eklenen iki `writeHash()` satırını içermiyor.
  Geçerli olan `v6-kaynak`; v5 kullanılmaz.
