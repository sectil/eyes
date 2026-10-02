# Yoga bölümü: sahibin istekleri (kelimesi kelimesine, 2026-09-28)

1. "bir yoga bölümü yapmanı istiyorum 10 bölümden oluşacak, biri isteğe bağlı 30'ar dakikalık ama ben 5 dakikasını da dinleyebilirim veya istediğim dakikasını dinleyebilirim... pub med üzerinden araştırma yap.. dersleri belirle, sözleri ve arka plan müziklerini ayarla.. ama yol haritasına ekleyeceğiz tabii gelişim istatistiklerine ekleyeceğiz... meditasyon gelişim özgüven kendini geliştirme rahatlama gibi en popüler 10 konudan oluşacak. mükemmel olacak hem tasarım hem dersler... ses anlaşılır ve kesilmeyecek olacak... net anlaşılır müzik ve ses kombinasyonu mükemmel olacak dinlediğimde bana göre hipnoz olmalıyım 10 derste... eğer mükemmel değilse sakın bana gönderme sadece mükemmel olduğuna inandığın şeyi gönder... tasarım sesler kompozisyon yazılar mükemmel olmalı.. pubmed makaleleri çok dikkatli incelemelisin... kusursuz olmalı."
2. "yoga veya meditasyon kusursuz olacak elevenlabs seslendirmeleri arka plan sesleri konuşan yönlendirme ve meditasyonlar mükemmel her şey tam uyumlu olacak... ses - arka plan - görsel önemli. zamanlayıcı önemli kullanıcı belki 30 dakikanın 5 dakikasını dinleyecek.... mükemmel dünyanın en iyi yoga hocası olmalı unutma. eğer mükemmel görmüyorsan ve kusursuz değilse bana asla olmuş gibi yazma cevap verme"
3. "Bir kusur görürsem ne olduğunu açıkça söyleyeceğim diyorsun ama benim istediğim kusur mükemmel olunacaya kadar düzeltmen bana sormana gerek yok... ben mükemmel bir iş bekliyorum."
   → KURAL: kusuru sormadan düzelt, kusursuz olana kadar yinele; sahibine yalnız bitmiş ve ölçülmüş iş.
4. "yogada 10 ders olacak unutma derslik benzersiz olacak... pubmed.. kimse sıkılmayacak 30 dakika hayranlıkla dinleyeceğiz ve meditasyon yapacağız ... kusursuz bir hoca anlatımı olacak... elevenlabs seslerini eğitmen gerekecek ayrıca"
   → Her ders benzersiz (teknik, anlatı yayı, müzik, görsel); 30 dk sıkmadan tutan kurgu (çeşitlilik, imge yayı, sessizlik ritmi);
     ElevenLabs sesi meditasyon hocası anlatımına göre "eğitilecek": ses ayarları (stability/style/speed), telaffuz sözlüğü,
     gerekirse creative_design_voice ile hoca sesi tasarımı; nesnel ölçüm + dinleme örnekleri; en iyisi pilot derste.

Sonraki aşamaya (metin + ses + tasarım iş akışı) bu dosya olduğu gibi verilecek.
5. "ayrıca yoga düzgün türkçe ile yapılacak.. cümle düşüklüğü olmayacak profesyonel bir iş istiyorum"
   → Her ders metni ayrı bir Türkçe editör incelemesinden geçer: TDK yazımı, anlatım bozukluğu / cümle düşüklüğü
     (özne-yüklem uyumu, eksik öğe, gereksiz sözcük, yanlış ek, çeviri kokan yapı), doğal konuşma dili ve söyleyiş;
     seslendirmeden sonra her cümle yazıya geri çevrilir (ElevenLabs transcribe) ve metinle harf harf karşılaştırılır,
     yanlış vurgu/telaffuz varsa o cümle yeniden üretilir.

## Sahibin kararları (2026-09-29, AskUserQuestion)
- Seslendirme yolu: **Yalnız mevcut bağlantı (MCP)**. API anahtarı yok. → eleven_v4 (ölçüm: eklemleme 5,63 hece/sn,
  Scribe'da metin birebir) ya da v2; hız/kararlılık/seed yok; yavaşlık klipler arası sessizlikle; her klip için birkaç
  çekim (generations_count) ölçülüp en iyisi seçilir. v3 yön etiketi kullanılmaz (etiket okundu).
- Hoca sesi: **Neslihan, Hakan + yeni aday**. ElevenLabs ses tasarımıyla (creative_design_voice) derslere özel bir
  "hoca sesi" adayı; pilotta üçü kör karşılaştırılır, sahibi dinleyip seçer.

## Sahibin 2026-09-29 akşam mesajı (kelimesi kelimesine)
6. "abi profesyenel bir yoga modlü olacak planaımız belliydi tam bir istiyorum 10 ders ve her ders 30 dakiakdan
   planlanmıştı bu şekilde demi... ilk etapta 3 -5-15 dakikda gibi bölümler olacak... yol da modl entegre olacak
   gnlere göre yga müdlleri yoolarda yer alacak... plan daha önceden bu lekidleyid planı bul daha önceki"
   → Okunuşu: tam, profesyonel yoga modülü; 10 ders, her biri 30 dk olarak tasarlanır; ilk yayında 3, 5 ve 15 dk
     sürümler; modül yola entegre olur, günlere göre yolda yer alır. Not: PLAN.v2'nin alt sınırı 5 dk (3 dk yok);
     yol tasarımındaki iki belge yoganın yoldaki yerini farklı yazıyor (docs/yol-haritasi/tasarim/YOL.ilerleme.md
     §5.13 ve YOL.moduller.md §4.6) — birleşik planda tek karara bağlanacak.

## Sahibin 2026-09-29 gece kararı
7. "onay" → PLAN.v3 (yoga-pilot/v3/PLAN.v3.md) Kapı 1 geçti; yedi karar öneriyle: (1) tasarlanan hoca sesi tarifi
   "sıcak, alçak perdeli, orta yaşta, İstanbul Türkçesiyle konuşan bir meditasyon hocası", örnek cümle Ders 2'nin açılışı;
   (2) inceleyici adı verilmedi → bütün rollerde yedek (iki bağımsız model incelemesi + sahibin kulağı; psikolog yerine
   karar 5.3 yedek kuralı; panel yerine sahibin kör dinlemesi); (3) tavan parti başına 195 bin, toplam 600 bin kredi;
   (4) 3 dk yalnız yedi derste, Ders 2'ye 20 dk, 38/43 sn istisnaları, 3 dk'da 45 sn şafak; (5) yoga durağı ilk yayında,
   (c)'den bağımsız, her gün bir dersin kısa sürümü, Ders 4 ve 7 yolda psikolog yedeğiyle; (6) hepsi pakette, boyut
   Kapı 4'te ölçümle; (7) sonsuz yol araştırması şimdi başlar, yoga üretimiyle birlikte yürür; kodu yoga yayınından sonra.

## Sahibin 2026-09-30 mesajı
8. "Yoga tamamdır ekleyebilirsin, sonsuz plana da başla" → Kapı 2 kapandı. Sahip sıralama vermedi; orkestratörün seçimi
   (VARSAYIM, sahip itiraz ederse değişir): **ses3 = Nefona Hoca** (Sr5w7dIZaRDglJ2cLaJm; sahip 29 Eylül'de ses seçimini
   bırakmıştı), **müzik A = ElevenLabs Music**. Gerekçe: B (Dalga motoru) yatağında ≈ 24 sn'de bir ≈ 20 dB iniş ve 6,8 dB/sn
   geri çıkış ölçüldü (SPEC §6 sınırı ≤ 1 dB/sn); A'da ölçülmüş kusur yok. Kör anahtar açıldı: ses1 Hakan, ses2 Neslihan,
   ses3 Nefona Hoca; A ElevenLabs, B Dalga (render/out/_kor_anahtar.json). Sıradaki: B adımı (PLAN.v3 §F).

## Sahibin 2026-09-30 ikinci mesajı (kelimesi kelimesine)
9. "elevenlab bağlantısı var olması lazım..  10 dersten oluşuyor biliyorsun hangi derler şuanda hazırsa modlüe
   ekleyelebilem ve yolda gösterleim...  sonra arka planda diğer dersleri indirim yorumlıarzu şuna kadar ayzılan dersleri
   vs sakla... ilk önce ilk bölümü canlıya alalım"
   → Okunuşu: PLAN.v3'teki "kısmi yayın yoktur" kuralı değişiyor; hazır dersler önce modüle ve yola girer, kalan dersler
     arka planda üretilir, yazılan metinler saklanır. VARSAYIM: "indirim" = diğer dersleri üretmek; "canlı" = önce
     TestFlight (uygulama App Store'da henüz "Prepare for Submission"). "İlk bölüm" planı sahibin onayına sunuldu.
10. "onay" (2026-09-30) → "İlk bölüm" planı onaylandı: Ders 1, 2, 3, 5 ilk bölüm; yalnız hazır dersler görünür; yolda
    kısa günlerde Ders 1 ve 5 (3 dk), ≈ 8 günde bir Ders 2 (5 dk), Ders 3 yalnız akşam önerisi; kod bu oturumda (C adımı),
    sesler yeni oturumda; önce TestFlight, sonra App Store; kural: "her ders kendi denetimlerinden geçince eklenir"
    (PLAN.v3 "kısmi yayın yoktur" kuralının yerine).
11. "önerini onaylıyorum" (2026-09-30) → C adımındaki üç hata düzeltmesi kalıyor: 5. gün raporunda fiil gerçek değişimden
    seçilir (artan gerginlik "azaldı" yazılmaz), PDF'te güven aralığı değerle aynı yönde, Gelişim kutucuğunda "düşük daha
    iyi" ölçüde puanın gerçek değişimi (0b076ba).

## Sahibin 2026-09-30 mesajları (kelimesi kelimesine, ilk bölüm seslendirmesi sırasında)
12. "eğer kaliteyi ve akışı bozmadan devam ettirelebiliyorsa Eleven v4 launch special 199,3 B credits free (13d 0h left)
    Try v4 bu şekilde bir kampanya var herhalde onu kullnablirsin. açıkcası ne işe yaradoğını bilmiyorum işimizeyarıyorsa
    bunu kullanlım."
    → Durum: seslendirme zaten `eleven_v4` ile (SPEC.v3 §2). v4 çekimlerinde ElevenLabs durum yanıtı fiyatı 0 kredi
      gösteriyor, ama çekimler ücretli: hesabın API sayfası 133.485 kredi kullanılmış gösterdi (madde 14), defter aynı anda
      132.910 idi ve bunun ≈ 48 bini konuşma. Kampanya bu API çağrılarına uygulanmadı. Akış değişmedi.
13. "kreidmiz kalmadı 😞 ne kadarkredi lazım kalan işler için" → kalan ücretli işler ≈ 2,6 bin kredi hesaplandı (Scribe
    164, müzik vokal denetimi 2.145, SPEC.v3 §6.3 yeniden çekimleri 253). "kredi ekledim." → iş sürdü.
14. "kredimiz yeterli mi" (ekran görüntüsü: ElevenAPI 133.485 / 186.000 kredi) → evet: kalan ≈ 52,5 bin; Ders 2, 3, 5
    için ücretli iş kalmadı; Ders 1'in sayım kilidi çözümü sahibin seçimine göre 0 ile ≈ 5 bin arası.
15. Seçimler (2026-09-30, soru kartı): Ders 1 için "Üç noktasız yeniden seslendir"; 5 saniye kuralı için "Bana gönder,
    ben dinlerim" → Ders 2, 3, 5 dosyaları "5 sn sınaması yapılmadı" notuyla sahibe gönderildi; ilk 5 saniyeyi sahip
    değerlendirir. Üç noktasız deneme (car.say1, ≈ 300 kredi) sorunu çözmedi: konuşma yalnız 0,03–0,1 sn kısaldı; fazlalık
    parçaların sonundaki ≈ 0,25 sn sessizlikti (ilk soruda bu ölçülmeden yanlış anlatılmıştı).
16. Seçim (2026-09-30, ikinci soru kartı): "Sessizliği at + 'ver…' tabanı 0,5 sn" → Ders 1'in nefes kilitli 87 parçasında
    sessiz baş ve son atıldı (tepenin 40 dB altı; 20 ms baş payı, 40 ms kararma; `render/tools/kilit_kirp_ib.py`);
    `b/ders1/ders1.lesson.json`'da periyodu 1,2 sn olan 8 "ver…" klibinin `gapFloor` değeri 0,6 → 0,5 sn.
17. "Sesler iyi gibi ben bir sorun görmedim gibi" (2026-09-30, Ders 2, 3, 5 dosyalarını dinledikten sonra) → sahibin kulak
    değerlendirmesi: sorun bildirilmedi. Ders 1 dosyaları ayrıca gönderilecek.
18. "şuanda düzgün oalrak alalım ben fark etmedim.. eğer sorun olursa  sonra düzeltme isterim. tamam diyorum" (2026-09-30,
    Ders 1 dosyalarından sonra) → Ders 1 kabul edildi; ilk bölümün dört dersinin sesleri sahip kulağından geçti. Sonradan
    fark edilen sorun düzeltme olarak ele alınır.

## Sahibin 2026-09-30 kararları (5 saniye kapısının 3. turundan sonra, soru kartı)
19. Güvenlik kartı: "İlk girişte bir kez" → kart yogaya ilk girişte bir kez çıkar (modul.md §2.2 ve bugünkü kod;
    PLAN.v3 §D.2'deki "ayrıntıdan sonra" sırası bununla değişti). Ders ayrıntısında yalnız "İstediğin an
    bitirebilirsin." kalır, kart oradan her zaman açılır; derse özel tek uyarı kalır: Uykuya Geçiş'te "Bu dersten hemen
    sonra araç kullanma." Gerekçe: kapıda ders ayrıntısı 1/5, güvenlik kartı 1/5 (aynı uyarıların tekrarı;
    `C_5SN_SONUCLARI.md`).
20. Zorlanma sorusu: "Puanla aynı ekranda, net" → soru ayrı ekran olmaktan çıkar, sonra puanının altına tek satır olarak
    iner; metni netleşir (ör. "Ders sırasında seni rahatsız eden bir şey oldu mu?"). Yeni metin iki bağımsız dil
    incelemesinden ve güvenlik okumasından geçer; cevapların anlamı (Hayır · Biraz · Çok · Atla ve "Çok"un sonucu,
    modul.md §2.8, güvenlik §11.F) değişmez. Gerekçe: kapıda 0/5.
