> Kaynak: 11 ajanlı yeniden düşünme çalışması (2026-09-27; 4 okuyucu, 4 bakış açısı, puanlama + şeytanın avukatı, sentez).
> Dosya:satır referansları yazıldığı andaki koda göredir. Durum: **sahibinin kararını bekliyor** (bölüm 8).
> Hemen yapılan küçük düzeltmeler: kamerasız devam, "yalnızca bu cihazda" metni, Nef'in iki ayrı izni, 18 yaş sınırı.

## Sahibinin kararları (2026-09-27)
1. **Deneme (ödeme) ekranı göz kırpma anından SONRA** gelir (bölüm 3'teki önerilen sıra: film → güvenlik → 20 sn göz kırpma → ad/doğum tarihi → deneme).
2. **Yol kısalır:** 4–5 durak (~11 dk); Isınma, Daire, Yakın–uzak Keşfet'e taşınır; Çemberler her gün değil, dönüşümlü oyunlardan biri.
3. **Seri KALIR** ("Duolingo bile seri uyguluyor ve başarılı"). Bölüm 6'daki "alevli seri sayacını kes" önerisi REDDEDİLDİ. Takvim'deki "Seri yok, baskı yok" cümlesi seriyle uyumlu, suçlamasız bir dille düzeltilir.
4. **Gabor algısal öğrenme YAZILACAK, iddiasız:** "görmeyi iyileştirir / gözlük azaltır" gibi hiçbir vaat yok; "görsel işleme eğitimi" dili, kanıtın türü ve sınırları (sham kontrollü RKÇ yok; kanıt ürün sahipleriyle bağlantılı) açıkça yazılır. Protokol SENTEZ_RAPORU.md bölüm 6.

# Nefona: Yeniden Düşünme Planı

## 1. Nefona tek cümlede

**Nefona gözünden başlar: gözünü, dikkatini, sakinliğini, bedenini ve kendine bakışını birlikte izler, değişimi gösterir ve günlük alışkanlığa çevirir. Tanı koymaz, tedavi etmez.**

> **Sahibinin kararı (2026-09-27, ikinci):** "Gözden başlayıp bütün insanı baştan yaratıyoruz, iristen başlıyoruz." Önceki cümle
> ("40 yaş üstü yetişkinin yakın görmesini ölçer … Nefes, Dalga ve oyunlar yan faydadır") KALDIRILDI: uygulamayı yalnız göz
> gibi gösteriyordu. Model: iris haritası — merkezde göz bebeği, çevresinde Gelişim'in 7 alanı (Göz, Dikkat, Farkındalık,
> Sakinlik, Kendine yaklaşım, İyi oluş, Beden). Kurulumda başlangıç haritası dolar, 28. günde yeniden (Artifact "Nefona Başlangıç Kartı").

Bu cümle deneme ekranında, Premium kartında ve App Store metninde aynen kullanılır. Göz giriş kapısıdır; nefes, dikkat görevleri,
hareket ve kendine yaklaşım uygulamanın parçasıdır, yan fayda değildir.

**Kullanılmayacak ifadeler:**
- "Gözlükten kurtulun", "numaranı düşür", "göz kaslarını güçlendirir", "görmeyi iyileştirir" (SENTEZ_RAPORU.md:80-82)
- "Sabit" (trend.js:147; yalnızca "doğrulanmış değişim yok" denir)
- "Ekranı azalt, iyi hisset" (YAPILACAKLAR.md:29)
- Dalga için "kaygıyı azaltır"

## 2. Bugün kullanıcının kafasını karıştıranlar

1. **Üç ayrı kimlik var.** Ödeme ekranı "Görmeni ölç" diyor (Paywall.jsx:89), film "Fark etmeyi yeniden öğren" diyor (IntroFilm.jsx:78), ana sayfanın varsayılan önerisi ise Nefes ya da Dalga (homeSuggest.js:14-15, 29-40).
2. **Ödeme ekranı her şeyden önce geliyor.** Uygulamanın amacı, ilk fayda ve güvenlik sorusu gösterilmeden deneme isteniyor; fayda listesi de gizli (App.jsx:420-437, Paywall.jsx:89-105). Uyarı işareti seçen kişi deneme başladıktan sonra kilitli kalıyor.
3. **Ana sayfada yaklaşık 40 dokunulabilir öğe var.** Sıradaki durak 5-6 kez yazılıyor ve üç ayrı "Nef" sesi konuşuyor (Home.jsx:137-328, TodayPath.jsx:392-439).
4. **Sıralı yol delinebiliyor.** Sıra kilidi yalnızca yolun üstünde çalışıyor (today.js:247-250). Aynı modüller alttaki listelerden açılınca da durak "tamam" sayılıyor (track/manifest.js:48).
5. **Yol uzun.** 9 durak, yaklaşık 16-19 dk sürüyor ve ortasında 5 dk zorunlu kilit var (today.js:41-45). Isınma, Daire ve Yakın–uzak durakları ya kanıtsız ya da kanıtı olumsuz (routines.js:72-76, SENTEZ_RAPORU.md:45-47).
6. **Aynı sorular tekrar ediliyor, iki akış kilitleniyor.** Yaş 2 kez (Onboarding.jsx:71), gözlük 3 kez soruluyor (AcuityTest.jsx:130). Kamera izni verilmezse 40 cm ekranından çıkış yok (DistanceHud.jsx:99). "Hareketi azalt" açık olan yeni kullanıcı, film yerine teknik "Yenilikler" listesini görüyor (App.jsx:357, 441).

## 3. İlk açılış

**Şimdi:** Yaklaşık 11 tam ekran. En hafif yolda bile 15 karar, 4 metin kutusu, 3-5 iOS izin penceresi ve 1-2 KVKK sayfası var (App.jsx:341-648).

**Önerilen:** 6 ekran, yaklaşık 8 dokunuş, 2 metin kutusu, 2 iOS penceresi, hiç KVKK sayfası yok.
1. **Film:** Son kartta vaat cümlesi, 3 faydalı satır ve "Başla" düğmesi. "Hareketi azalt" açıksa aynı kart hareketsiz gösterilir.
2. **Uyarı işaretleri:** İşaret varsa doktor kartı çıkar, ödeme istenmez.
3. **20 saniyelik göz kırpma anı:** Kamera izni burada istenir, kamerasız seçenek kalır.
4. **Ad ve doğum tarihi:** Yaş aralığı buradan hesaplanır. 18 yaş altı durdurulur; bugün bu yaştakiler "18-39" diye kaydediliyor (profile.js:151).
5. **7 gün deneme:** Fayda satırları görünür; Yıllık plan zaten ön seçili (Paywall.jsx:46). İnternet yoksa "Tekrar dene" düğmesi çıkar.
6. **Bugün ekranı.**

**Sonraya kalanlar:**
- Hesap açma: Profilim içinde "Profilini koru".
- 40 cm ve gözlük sorusu: ilk E testinde, "Kamerasız devam" seçeneğiyle.
- Bildirim izni: ilk yol bitince.
- Apple Sağlık izni: ilk mola durağında.
- Ekran Süresi: 2. ya da 3. gün.

## 4. Ana sayfa: ilk ekranda 5 öğe

1. **Selamlama, ad ve avatar.** Avatar Profilim'in tek kapısı olur.
2. **Günün diyaframı ve tek bilgi satırı:** "Bugün 2/5 · ≈6 dk kaldı" ve altında "12 gün seninle · bu hafta ●●○○○○○ · 4.215 adım". Adım yalnızca veri varsa görünür.
3. **"Gözlerin" satırı:** "alışma dönemi 3/7", "doğrulanmış değişim yok" ya da "değişim var → göz doktoruna". Sarı veya kırmızı uyarı varsa en üste çıkar.
4. **Nef'in tek önerisi ve büyük tek düğme.** Altında Nefes ve Dalga kısayolları kalır.
5. **Bugünün yolu:** 4-5 durak.

En altta bir "Keşfet" satırı ve verinin nerede tutulduğunu doğru anlatan cümle yer alır.

**Taşınanlar:**
- Pratikler, Egzersiz ve Ölçüm listeleri → Keşfet.
- Okuma kutucuğu ve Nef koç kartı → Gelişim.
- Akşam ve stres soruları → yalnızca Nef'in yaşam verisi izni varsa sorulur ve kalıcı bir "Geç" seçeneği olur.
- Sekmeler **Bugün · Keşfet · Gelişim** olur.

## 5. Hareket ve ekran süresinin yeri

İkisi de tek bir kavrama bağlanır: **göz molası**. Tek ad ve tek süre kullanılır: 5 dk (eyeBudget.js:20, YAPILACAKLAR.md:23).

- **Ekran Süresi amaca güçlü bağlanıyor** (SENTEZ_RAPORU.md:40), çünkü göz yorgunluğu öteki uygulamalarda oluşuyor.
  - 2. ya da 3. gün, yol bitince önce ayrı bir KVKK sayfası, ardından iOS izni istenir.
  - Seçilen uygulamalarda süre dolunca "Göz molası" ekranı (kalkan) çıkar.
  - Ana sayfada yalnızca kurulduysa "Mola kalkanı açık" satırı görünür; ayrıntılı rapor Gelişim'de durur.
- **Hareket amaca zayıf bağlanıyor.** Bugün metin "önce yürü" diyor ama düğme sıradaki durağı açıyor (homeSuggest.js:25-27). Gerekçesi de bir kan şekeri çalışması (health.js:5-6).
  - Yeni hali: "Kalk, pencereye yürü, uzağa bak" mola ekranı.
  - Yürümenin göze katkısı PubMed'de bir kaynak bulunana kadar VARSAYIM olarak etiketlenir.
  - Kullanılmayan yürüme mesafesi okunmaz (health.js:18, consent.js:25).

## 6. Kesilecek, taşınacak, ertelenecekler

- **Kesilecekler:**
  - Alevli seri sayacı (Home.jsx:166; Takvim'deki "Seri yok, baskı yok" cümlesiyle çelişiyor: Calendar.jsx:34)
  - "Bugün x/3 dk" hedefi (routines.js:82-84)
  - Yoldaki şerit, bölüm ve göz bütçesi çubukları, "Başla" hapı
  - Açılıştaki otomatik kaydırma (TodayPath.jsx:292-302)
  - "Verilerin yalnızca bu cihazda" cümlesi (Home.jsx:328)
  - Dambıl simgesi (Paywall.jsx:18)
  - Filmdeki gözlük çıkarma sahnesi (introScene.js:631)
- **Keşfet'e taşınacaklar (hiçbiri silinmez):** Dalga, Yön, Gökyüzü, oyunlar, egzersiz setleri, Isınma, Daire, Yakın–uzak.
- **Ertelenecekler:** hesap açma, KVKK sayfaları, bildirim izni, Nef tanıtım kartı (ilk hafta gösterilmez), Gabor algısal öğrenme.

## 7. Sıralı uygulama adımları

Efor: S küçük, M orta, L büyük iş.

1. **Kilitlenen akışları aç [S]:** kamerasız devam, "hareketi azalt" kartı, internetsiz "Tekrar dene", 18 yaş sınırı. Dosyalar: DistanceHud.jsx, App.jsx:355-357 ve 440-443, Paywall.jsx:48-52, profile.js:151.
2. **KVKK düzeltmeleri [M]:**
   - Nef için iki ayrı, işaretsiz onay kutusu. Bugün tek "Kabul et ve aç" düğmesi iki amacı birden açıyor (CoachCard.jsx:65).
   - Her izin amacına ayrı sürüm numarası. Tek ortak sürüm artırılırsa verilmiş bütün izinler geçersiz sayılır (consent.js:6).
   - Bilgi ekranındaki Nef anahtarı rıza sayfasından geçmeli (Info.jsx:34).
   - Yanlış metinler düzeltilmeli: ProfileSetup.jsx:51 ve Home.jsx:328.
   - Gizlilik politikası adresi doldurulmalı (Paywall.jsx:13).
   - Metinler için hukukçu onayı gerekiyor (consent.js:5).
3. **Tek vaat [S]:** Deneme ekranında fayda satırları görünsün (Paywall.jsx:89-105). Daha önce deneme kullanmış hesaba "7 gün ücretsiz" yazılmasın; bugün bu kontrol yapılmıyor (subscription.js:143).
4. **İlk açılış sırası [M]:** App.jsx:404-437, Onboarding.jsx:71, AccountStart.jsx. Bildirim izni Paywall.jsx:67'den kaldırılıp ilk yolun sonuna taşınır.
5. **Yolu gerçekten sıralı yap [M]:** Bir durak yalnızca yoldan başlatılan oturumla tamamlanır. Tek istisna ölçüm; aynı gün ikinci test istenmez. E testi bitince kullanıcı Gelişim'e değil yola döner (App.jsx:579-583).
6. **Yolu yeniden diz [M]:**
   - Sıra: E testi → kamera destekli göz kırpma → 1,5-2 dk uzak–yakın molası → dönüşümlü tek oyun → Nefes kapanış.
   - E testi ilk 21 gün her gün yapılır (trend.js:5-11). Testin önüne her gün değişen bir adım konmaz (NEFES_FARKINDALIK.md:103-107).
   - Göz kırpmanın dayanağı SENTEZ_RAPORU.md:39. Kim 2020 / Wolffsohn 2025 dozu yoldaki süreyle eşleşmiyor, bu yüzden metin ölçülü yazılır.
   - Uzak–yakın molasının dayanağı Iwasaki (SENTEZ_RAPORU.md:169).
   - Nefes, yolun tamamlanmasına sayılan bir durak olur (today.js:202-207).
   - Süre: ölçüm günü yaklaşık 14 dk, diğer günler yaklaşık 11 dk.
7. **Ana sayfa, Keşfet ve 3 sekme [L]:** Home.jsx:157-320, TodayPath.jsx, App.jsx:612-655. Her ekran açık ve koyu temada ayrı ayrı denenir. Yoldaki 9,5-11,5 px yazılar büyütülür (todaypath.css:139-145), çünkü hedef kullanıcı yakını zor okuyor.
8. **Abartılı kanıt etiketleri [S]:** gokyuzu.js:116 ve dalga.js:123 "Belirsiz" olur. Home.jsx:40'taki "iyileşme eğilimi" yerine teste alışma notu kullanılır (trend.js:145). Dayanak: Johnson & Rosenfield 2022.
9. **Hareketi göz molasına bağla [M]:** homeSuggest.js, health.js, HealthPlugin.swift:29. Dayanak: Galinsky 2000 (eyeBudget.js:2-3).
10. **Ekran Süresi [L]:** Yeni iOS eklentileri gerekiyor. Uygulamanın en düşük iOS sürümü 15.0 (project.pbxproj:261); Ekran Süresi özellikleri iOS 16 istiyor (platform bilgim, doğrulanmalı). Apple başvurusu sistem çalıştıktan sonra yapılır (YAPILACAKLAR.md:30-33).
11. **Gabor kararı [S]:** Belgeye "ertelendi" diye yazılır (SENTEZ_RAPORU.md:30, :86).

## 8. Sahibinin karar vermesi gereken sorular

1. Deneme ekranı, göz kırpma anı ve güvenlik sorusundan **sonra** gelsin mi? Bugünkü sıra bilinçli bir karar ("profilden hemen sonra", App.jsx:419).
2. Çemberler bugün sizin isteğinizle her gün yolda (track/manifest.js:46). Dönüşümlü oyunlardan biri olsun mu? Nefes kapanışta 5 dk mı kalsın, 3 dk mı olsun (breath/manifest.js:50-53)?
3. Seri sayacı ve alttaki katalog ana sayfadan kalkıp Keşfet'e taşınsın mı? Filmdeki gözlük çıkarma sahnesi değişsin mi?
4. Gabor algısal öğrenme "ertelendi" diye belgeye yazılsın mı? "Görmeyi iyileştirme" amacı, uygulamayı tıbbi cihaz sınıfına sokma riski taşıyor (SENTEZ_RAPORU.md:86).

**Bakılmadı:** göz kırpma egzersizinin kısa bir sürüme bölünüp bölünemeyeceği, Ekran Süresi kalkanının uygulamayı açıp açamayacağı ve uygulamanın cihaz üzerindeki davranışı.