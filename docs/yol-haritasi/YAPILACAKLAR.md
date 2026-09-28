# Yapılacaklar (tek liste)

Her oturumun başında önce `docs/ANA_BELGE.md` (amaç, kurallar, belge haritası), sonra bu dosya okunur; iş bitince
işaretlenir, yeni iş buraya eklenir. Hatalar `HATA_GUNLUGU.md`'ye yazılır.
Kural: her özellik PubMed kaynaklı bilimsel dayanakla gelir (uygulamadaki kaynaklar listesine
makalesi ve DOI'siyle girer); sağlık iddiası yok; KVKK açık rıza her veri amacı için ayrı.
Son güncelleme: 2026-09-28.

## Şimdi (öncelik sırası)
1. [ ] **TestFlight derlemesi** (`bash ~/Projects/eyes/app/scripts/testflight.sh`), içinde `fffa276`, `1a85b1c`, `fe06f26`.
2. [ ] **Göz ayarı raporu:** göz ayarı yapılır, "Verileri paylaş" çıktısı gönderilir. Kontrol edilecekler:
   - `targets.*.scrX/scrY` dolu mu?
   - Model `scrX`/`scrY` seçmiş mi?
   - `geom.x/y.ratio` (ölçülen / ekrandaki mesafe) kaç?
   - `model.verify` her yönde ≥ 0,95 mi?
   (Açık hatalar → "Ekrandaki bakış noktası")
3. [ ] **Kendini iyileştirme:** birkaç egzersizden sonra yeniden göz ayarı ve rapor; `previousAdapt` alanına bakılır.
4. [ ] **Yılan:** aşağı bakış hâlâ "sağ" okunuyor mu? Yeni ölçümle yeniden dene.
5. [ ] **Diğer npm eklentileri Release'te çalışıyor mu?** Titreşim (Haptics), bildirim (LocalNotifications), satın alma
   (Purchases), cihaz (Device). Apple girişi npm eklentisi TestFlight'ta "not implemented" vermişti; aynı kayıt yolu
   (packageClassList). Her biri TestFlight'ta bir kez denenir; biri çalışmıyorsa aynı yöntemle (kendi eklentisi ya da
   açık kayıt) çözülür.
6. [ ] **Karar bekliyor:** "KANITLI" etiketi. Seçenekler: kaldır / "Araştırmalı" / olduğu gibi kalsın (sahibine soruldu).
7. [ ] **Ölçüm ilkesi açıkları:** her modül istatistik kaydeder ve Gelişim'de görünür (ANA_BELGE §4). Taramada
   bulunan eksikler aşağıda "Ölçüm ilkesi" bölümünde.

## Veri merkezi ve kendini geliştiren sistem (sahibin yönü, 2026-09-28)
- [x] **1. Veri merkezi (okuma kapısı):** `lib/dataHub.js`. Testler, oturumlar, istatistik çekirdeği (`progress.js`),
      profil cevapları (başlangıç ve 28. gün) ve mola/su günlüğü 7 alan altında. Canlı her modülün merkeze ulaştığı
      testle denetleniyor. Göz kırp süre kaydediyor. Göz kırp ve egzersiz setleri merkeze bağlandı. Ödeme ekranındaki
      iris haritası oturumları görüyor (Dikkat ve Farkındalık hep boş kalıyordu).
- [ ] **2. İris haritası ve Gelişim merkezden beslenir:** her alanın değeri modül verisinden; harita Gelişim'in başında
      ve Ana sayfada; WHO-5 ekranı. Tasarım önce Artifact. Ayrıntı aşağıda "Ölçüm ilkesi".
- [ ] **3. Anonim teşhis verisi (ürünün kendini geliştirmesi):** açık rızayla, hesapsız, görüntüsüz yalnız sayılar
      Supabase'e (Frankfurt). Örnek: kalibrasyon kontrol yüzdeleri, ekran hataları. Ayrı KVKK rıza sayfası ve gizlilik
      politikası; hukukçu onayı. Sonra "Verileri paylaş" kullanıcı arayüzünden kalkar, yalnız test derlemesinde kalır.
- [ ] **4. Kişiye uyum merkezden okur:** oyun zorluğu, günün yolu (zayıf alana ağırlık), Nef'in önerileri.

## Ölçüm ilkesi: her modül kaydeder, gelişim görünür (ANA_BELGE §4; plan + onay gerekir)
- [ ] **İris haritası modül verisiyle yaşasın.** Bugün 5 alan yalnız kurulumdaki ve 28. gündeki sorulardan, Dikkat ve
      Farkındalık yalnız dolu/boş dolar.
      - Her alanın değeri kendi modüllerinden gelsin: Göz ← testler ve egzersizler; Sakinlik ← Nefes, Dalga, Gökyüzü;
        Kendine yaklaşım ← Yön; Beden ← adım, mola, su; İyi oluş ← WHO-5.
      - Harita Gelişim'in başında ve Ana sayfada görünsün.
      - Gelişim'in 7 kutucuğu (`lib/progress.js`) ile iris haritası (`lib/iris.js`) tek hesaba bağlansın.
      - Tasarım önce Artifact.
- [ ] **WHO-5 iyi oluş:** ekranı yok, `makeWho5Record` hiç çağrılmıyor; Gelişim İyi oluş kartı hep "yakında".
      Resmi Türkçe madde metni sahibinden bekleniyor (aşağıda "Bekleyen kararlar").
- [x] **Göz kırp** süre (`seconds`) kaydediyor (eski kayıtlarda 150 sn varsayımı sürer).
- [ ] Göz kırpta algılanan kırpma sayısı Gelişim'de zamanla görünsün.
- [ ] **Zaman serisi:** Nefes, Dalga, Gökyüzü ve Yön-Dışarıdan bak için önce→sonra etkisi haftalara göre görünsün (bugün
      yalnız ortalama). Yılan, Çemberler (isabet, varış süresi) ve okuma testi için trend grafiği.
- [ ] **Okuma testi** Göz alan kutucuğuna girsin.
- [ ] **Mola ve su** günlüğü (`habit-log`) Gelişim özetine ve takvime girsin; yalnız hatırlatma açıkken değil.
- [ ] **Şefkatle ele al:** ölçüm yok (yalnız "yapıldı"). Kanıta uygun bir ölçüm var mı, PubMed'e bakılacak.
- [ ] **İlk Bakış** kırpma sayısı ve 4 soru (stres, uyku, hareket, öz-şefkat) Gelişim'de görünsün; bugün yalnız
      IrisPlan'da.

## Tasarım kuralları (sahibi, her ekran için geçerli)
- Uygulamaya girdikten sonraki her ekran koyu VE açık temada kusursuz olur (giriş ekranı bilinçli olarak tek sahne: gece).
- İleride bütün diller gelecek: hiçbir metin çizime/görsele gömülmez; düğme ve başlıklar uzun çeviride (Almanca vb.)
  satır atlar ve uzar; yönler başlangıç/bitiş (margin-inline vb.) — Arapça/İbranice sağdan sola kendiliğinden döner;
  bağlantılı cümleler bütün cümle olarak çevrilir (Türkçe ek koda gömülmez). Arapça için yazı tipi: Noto Sans Arabic.
- Claude beğenmediği tasarımı sahibine sunmaz; önce görsel (Artifact), onaydan sonra kod.
- Göndermeden önce ekran ekran yazılı eleştiri listesi; "mükemmel değil" diyen tek madde kalırsa gönderilmez.
- Vizyon: göz giriş kapısı, hedef bütün insan (iris haritası, 7 alan). Tasarım ve metin yalnız göze daralmaz.
- [x] Giriş ekranı: "Nefona" ve alt yazı tuvalden DOM'a taşındı (çevrilebilir)
- Sayı ve ondalıklar dile göre yazılır (Intl.NumberFormat: 7,4 / 7.4); kelimeye bölme Intl.Segmenter ile (Japonca,
  Çince, Tayca gibi boşluksuz yazılan diller de çalışsın).
- [x] İlk Bakış: bütün yazılar lib/firstLookText.js'de dil başına tek nesnede. Yeni dilde okuma metni çeviri değil,
  aynı bulgunun o dilde yeniden yazımıdır; sarı işaretin hızı (wpm) her dil için ayrı ayarlanır (VARSAYIM: Türkçe 200).

## Sıradaki iş (sırayla)

### 0. Yeniden düşünme planı (docs/yol-haritasi/YENIDEN_DUSUNME.md) — kararlar alındı
- [x] Küçük düzeltmeler: kamerasız devam, "yalnızca bu cihazda" metni, Nef'in iki ayrı izni (Bilgi anahtarı dahil), 18 yaş sınırı
      (6743d54) + denetimin 29 doğrulanmış bulgusu düzeltildi (Nef rızası kayıtlı ve sürümlü, eski izinsiz kayıt kapanır;
      kamera izni mesajları; kamerasız mod tüm uygulamada; 18 altına "Hesabımı sil")
- [x] İlk açılış sırası (iris haritası): hoş geldin → güvenlik → İlk Bakış → 4 soru (stres, uyku, hareket, öz-şefkat) →
      Seni tanıyalım → İris haritan → 7 gün deneme → Bugün. Yaş doğum tarihinden. 28. günde Ana sayfa kartı: İlk Bakış +
      aynı 4 soru + yan yana harita (lib/iris.js, screens/Iris*.jsx)
- [ ] Stres (Elo 2003) ve öz-şefkat (Zhang 2022) sorularının cevap seçeneklerini tam metinden doğrula (şimdilik VARSAYIM)
- [ ] Profilim'den iris haritasını yeniden açma satırı; Gelişim'de 7 alanla iris bağı
- [ ] Bildirim izni ve mesafe (40 cm) adımlarının yeni sıradaki yeri (şimdi denemeden sonra)
      — yaş kapısı böylece hesaptan ÖNCE olur (denetim: şu an 18 altı kişinin hesabı sunucuda açılıyor, sonra durduruluyor)
- [ ] Yol 4–5 durak (~11 dk); Isınma/Daire/Yakın–uzak Keşfet'e; Çemberler dönüşümlü; yol yalnız yoldan başlatılan oturumla tamamlanır
- [ ] Seri kalır; Takvim "Seri yok, baskı yok" metni seriyle uyumlu hale gelir
- [ ] Ana sayfa ilk ekran ≤5 öğe + "Gözlerin" satırı; sekmeler Bugün · Keşfet · Gelişim
- [ ] Gabor algısal öğrenme modülü (iddiasız; SENTEZ_RAPORU.md §6 protokolü; <100 ms uyaran için yerel/native zamanlama gerekebilir — önce doğrulanacak)

### 0b. Bildirimler (docs/yol-haritasi/BILDIRIM_PLANI.md) — v2 kodu yazıldı, CİHAZDA DENENMEDİ
- [x] Kararlar: ana bildirim göz + kalkma molası; odak (çalışma) oturumu; ölçme yalnız telefonda;
      yürüyüş, nefes, su da BU SÜRÜMDE ("8 hafta" kuralı kaynaksız çıkarımdı, kaldırıldı)
- [x] v2 uygulaması (2026-09-27, commit yok): Mola ve Su ekranları, Hatırlatmalar ekranı (Bilgi → Hatırlatmalar),
      7 günlük kayan plan (`lib/notifyPlan.js`, `notifyApply.js`), tek dokunma dinleyicisi (App), sessiz gün ölçümü +
      Gelişim kartı, çalışma oturumu + Ana sayfa şeridi, Ana sayfa izin kartı, seyreltme sorusu, rıza başına sürüm
      (health v2), kaynaklar (Klasnja 2019, Bell 2023, Galinsky 2007, Morris 2020, Singh 2024, Wilson 2015);
      Çalışma günleri .ics yerine uygulama bildirimi; deneme hatırlatması izin istemiyor (izni yoksa 5. gün şerit)
- [x] Karar: yürüyüş bildirimi uygulama açılmayan günlerde de → HealthKit background delivery (`HealthPlugin.swift` WalkGuard)
- [ ] Mac'te: Swift derlemesi (WalkGuard, setWalkGuards/walkGuardLog); iki yeni yetkinin (HealthKit background
      delivery, time-sensitive bildirim) otomatik imzada profile girmesi (VARSAYIM)
- [ ] Cihazda: uygulama kapalıyken teslim; her türe dokununca doğru ekran ve günlükte "dokunuldu"; kilit ekranı metni;
      İş/Rahatsız Etme açıkken oturum bildirimi; adım eşiği aşılınca yürüyüş bildiriminin arka planda iptali;
      izin reddinde Ana sayfa/Hatırlatmalar metni; "Tüm verileri sil" sonrası kendi bildirimlerimizin (74xx/75xx)
      kalmaması, deneme hatırlatmasının (7302) kalması; izni mola kilidinden/iOS Ayarlar'dan verince 7302'nin kurulması
- [ ] Yürüyüş ölçümü: native koruma yalnız bildirimi giden günlerde kurulu. Ölçüm bu yüzden zar koluna göre
      (iptal edilen gün de "hatırlatma günü") sayılıyor; iptal edilen günler 'doneBefore'a çevrilmiyor (yalnız bir kolu
      ayıklamak sonucu hatırlatma aleyhine bozardı). İstenirse: sessiz günler için de native bekçi (bildirimsiz,
      yalnız günlüğe) → iki kolda aynı ayıklama yapılabilir (Swift + notifyApply + notifyPlan)
- [ ] Hukukçuya soru (KVKK): bildirim günlüğü (`gozolcum:notify-log`: hangi gün hangi hatırlatma, dokunuldu mu;
      yalnız telefonda, sunucuya gitmez) için ayrı açık rıza gerekir mi? Yürüyüş için adım okunuyor (health rızası v2
      metninde amaç yazıyor); mola/su/nefes günlüğü sağlık verisi sayılır mı?
- [ ] Hukukçuya/metne: health rızası v2 "Neden" satırı uygulama içi "son 1 saatte az adım → 2 dk yürü" önerisini
      (`lib/health.js`, `lib/homeSuggest.js`) yalnız dolaylı kapsıyor; eski metinde açıkça yazıyordu
- [ ] Info.plist `NSHealthShareUsageDescription`: yürüyüş hatırlatması amacını da ansın
- [ ] `lib/ics.js` artık yalnız testinde kullanılıyor (Çalışma günleri .ics düğmesi kalktı): silinsin mi?
- [ ] `Paywall.jsx` "5. gün — İzin verirsen bildirimle hatırlatırız": satın almada izin artık sorulmuyor. Ya deneme
      başlarken tek cümleyle izin iste ya da metni "izin verdiysen bildirimle, vermediysen Ana sayfada" yap
- [ ] BILDIRIM_PLANI.md §"App.jsx" (7302'yi de siler) eskidi: "Tüm verileri sil" 7302'yi ve deneme zaman çizelgesini
      (trialOffer, trialReminder, İlk rapor/şerit görüldü) korur; Apple denemesi yerel veriyle bitmez
- [ ] Çalışma günleri bildirimi: saatinden ≤60 sn önce yeniden planlama olursa iptal edilir (günlüğü yok; deney
      türlerindeki "önceden planlanan an korunur" kuralı buna uygulanamadı)
- Kanıtla EKLENMEYECEKLER: "çok oturdun" uyarısı, "su içtin mi / nefes yaptın mı" soruları, nabız/HRV tetikli bildirim,
  "bugün 4 saat oldu" mesajı; nabız/HRV yalnızca Gelişim'de, yorumsuz

### 1. Hareket: Apple Sağlık (HealthKit) — kod bitti, CİHAZDA DENENMEDİ
- [ ] Telefonda: izin sayfaları (bizim + iOS), adım satırı, Beden kartı; Swift derlemesi Mac'te (burada derlenemiyor)
- [ ] Uyku süresi (Gelişim yer tutucusunda vardı) — ayrı karar
- [x] Kendi Capacitor eklentimiz (yalnız okuma): adım, yürüme mesafesi, egzersiz dakikası; bugün + son 7 gün (`HealthPlugin.swift`)
- [x] Info.plist `NSHealthShareUsageDescription`, `App.entitlements` HealthKit, Xcode projesine dosya
- [x] Açık rıza sayfası (`lib/consent.js` yeni amaç `health`): ne / neden / nerede (yalnız telefonda) / ne kadar
- [x] Ana sayfa: adım satırı; Nef önerisi "Önce kalk, 2 dk yürü" (son 1 saatte <100 adım, 09–21)
- [x] Profilim → İzinlerim: Apple Sağlık satırı (aç/kapat; kapatma iOS Ayarlar'a yönlendirir)
- [x] Kaynaklar listesi (Gelişim → Beden): Paluch 2022 Lancet Public Health (doi:10.1016/S2468-2667(21)00302-9),
      Paluch 2022 Circulation (doi:10.1161/CIRCULATIONAHA.122.061288), Dunstan 2012 Diabetes Care
      (doi:10.2337/dc11-1931). Metin: gösterir, iddia etmez (gözlemsel çalışmalar)

### 2. Ekran süresi (Screen Time: FamilyControls / DeviceActivity / ManagedSettings) — sistem önce, başvuru sonra
- [ ] Geliştirme sürümünde (onaysız çalışır): kullanıcının seçtiği uygulamalarda süre dolunca
      5 dk "göz molası" kalkanı + Nefona içinde ekran süresi raporu (DeviceActivityReport; sayı uygulamaya aktarılamaz)
- [ ] Eşik olaylarından kaba bilgi (ör. saatlik) App Group ile alınabilir mi: Apple kurallarına uygunluğu DOĞRULANACAK
- [ ] Kaynaklar: Redondo 2025 Exp Eye Res (doi:10.1016/j.exer.2025.110463, sık/kişisel mola ↓ belirti),
      Johnson & Rosenfield 2022 Optom Vis Sci (doi:10.1097/OPX.0000000000001971, 20 sn/20 dk mola etkisiz),
      Zimmermann & Sobolev 2022 Cyberpsychol Behav Soc Netw (doi:10.1089/cyber.2022.0027, sürtünme süreyi ↓;
      iyi oluşa anında etki YOK → "ekranı azalt, iyi hisset" vaadi yazılmaz)
- [ ] **SONRA: Apple Family Controls (Distribution) başvurusu** — sistem hazır olunca
      (https://developer.apple.com/contact/request/family-controls-distribution). Uygulama + her eklenti
      ayrı bundle ID ile. Gerekçe: kişisel dijital iyi oluş / göz molası. Başvuru metnini Claude yazar.
      Bekleme günler–haftalar; onaysız TestFlight/App Store'a çıkmaz

### 3. Mağazaya çıkmadan önce zorunlu
- [ ] Gizlilik politikası sayfası + adresi (`VITE_PRIVACY_URL`; HealthKit ve abonelik için Apple zorunlu)
- [ ] KVKK aydınlatma metni: veri sorumlusu adı/adresi (kullanıcıdan), hukukçu onayı
- [ ] Nef yurt dışı aktarımı: hukuki dayanak (KVKK md. 9, 7499 s. Kanun sonrası), OpenRouter ve model sağlayıcısının
      saklama süresi, Vercel fonksiyon bölgesi — hukukçuya/doğrulamaya (rıza metni "yurt dışı" diyor, ülke yazmıyor)
- [ ] Abonelik inceleme ekran görüntüleri (App Store Connect, 3 abonelik) + ilk abonelik yeni sürümle gönderilir
- [ ] Sandbox satın alma denemesi (7 gün ücretsiz başla) — henüz yapılmadı
- [ ] Aylık fiyat App Store'da ₺99,99 görünüyor, istenen ₺89,99 → düzeltilecek
- [ ] DSA: "trader değilim" seçildiyse AB ülkeleri kaldırılacak; tüzel kişi posta kodu (48000) kontrol
- [ ] Sandbox test hesabı örnek e-postayla açıldı (ornek.kisi+nefona1@gmail.com): gerçek adresle yenilenmeli

## Açık hatalar
- [x] Apple ile giriş TestFlight'ta "UNIMPLEMENTED" (Bug 11): kendi eklentimiz AppleSignInPlugin.swift (b4dc6f3); cihazda
      çalıştı (kullanıcı, 2026-09-28). Çıkmaz: npm eklentisini uygulama hedefinden import etmek (derlenmiyor).
- [ ] Egzersiz sahnesi (Artifact "Nefona Egzersiz Sahnesi"): tarayıcıda sahte kamerayla denendi, CİHAZDA DENENMEDİ.
      Cihazda bak: kırpma ritmi sesi ("Kapat, hafifçe sık" / "Aç") kişinin gerçek kırpmasıyla çakışıyor mu; bakış noktası
      ve hedefe oturan altın halka; "Gözlerini kapat"ta kararan ekran; ElevenLabs seslerinin telefonda gerçekten çalması
      (nefeste telefon sesi duyulmuştu; nefes ekranındaki geliştirici "tanı" satırı bekleniyor).
- [ ] Göz kalibrasyonu (Build 38 "Ayırt edemedim"): iki nokta yedeği, duruşlu/duruşsuz en iyi aday, tekrar turu sol → orta → sağ
      (eksene özel orta) ve çıkmaz yerine "Temel ayarla devam" yazıldı; eski raporlarla (Build 8–38) ve sahte kamerayla
      denendi, CİHAZDA DENENMEDİ. Cihazda bak: kaç turda "Hazır"; paylaşılan raporda model.x.twoPoint var mı.
- [ ] Ekrandaki bakış noktası (FaceDistancePlugin.swift screenHit, scrX/scrY mm) + 5 nokta kontrol + takipte dikey kilit:
      Mac'te derlendi ve cihazda çalıştı (kullanıcı, 2026-09-28: "göz takibi tamam"). RAPOR VERİSİ GELMEDİ.
      Paylaşılan raporda bak: targets.*.scrX/scrY dolu mu,
      model.x/y.feature scrX/scrY mi, geom.x/y.ratio (ölçülen / ekrandaki mesafe), model.verify (her yön ≥ 0,95 hedef).
      Sonra: geom oranına göre fiziksel eşik, çalışırken yeniden ortalama eşiği (gaze.js RECENTER_MAX_FRAC), NOISE_FLOOR scr.
      Yılan'da aşağı bakışın "sağ" okunması bu ölçümle yeniden denenecek.
- [ ] Kendini iyileştiren göz modeli (lib/gazeAdapt.js, Routine.jsx learnFromStep): yazıldı, testli (birim + ekran akışı),
      CİHAZDA DENENMEDİ. Cihazda bak: birkaç egzersizden sonra yeniden kalibrasyonun raporunda previousAdapt (n, base → x/y
      farkı); egzersizde "Sağa bak" adımının daha hızlı tamamlanıp tamamlanmadığı. Eşikler (ADAPT_*) cihaz verisiyle ayarlanacak.
- [ ] Yılan (gözle): aşağı bakış "sağ" okunuyor (eksen karışması). Kalibrasyon verisi gerek; "orta"ya bağlı kilit
      denendi, geri alındı (c48eca6). Kullanıcıdan: geri almadan sonra gözle yön alma çalışıyor mu?
- [ ] "Aboneliği yönet" bağlantısının iPhone'da App Store abonelik sayfasını açtığı doğrulanmadı

## Bekleyen kararlar / içerik
- [ ] Boy ve kilo: kullanım amacı yok → amaç belirlenmedikçe eklenmez
- [ ] Google ile giriş: kod bitti (AuthSessionPlugin.swift + signInWithGoogle; SDK yok). Google Cloud "Nefona" projesi,
      iOS + web istemcisi, Supabase Google sağlayıcısı açık. Kalan: Supabase Redirect URLs'e com.sectil.eyelume://auth-callback,
      "Skip nonce checks" kapat (bu yolda gerekmiyor), Google Auth Platform → Audience → Publish app, cihazda deneme
- [ ] WHO-5 resmi Türkçe madde metni kullanıcıdan
- [ ] Nef'e "Yön" serbest metni: ayrı açık rıza
- [ ] i18n, kronotip, özel SMTP
- [ ] Small Business Program başvurusu (isteğe bağlı)
