# Yapılacaklar (tek liste)

Her oturumun başında önce `docs/ANA_BELGE.md` (amaç, kurallar, belge haritası), sonra bu dosya okunur; iş bitince
işaretlenir, yeni iş buraya eklenir. Hatalar `HATA_GUNLUGU.md`'ye yazılır.
Kural: her özellik PubMed kaynaklı bilimsel dayanakla gelir (uygulamadaki kaynaklar listesine
makalesi ve DOI'siyle girer); sağlık iddiası yok; KVKK açık rıza her veri amacı için ayrı.
Son güncelleme: 2026-09-29.
İşaretler (sahibinin kuralı, 2026-09-28): `[x]` = cihazda doğrulandı ve mükemmel; `[~]` = kodda bitti ama cihazda
doğrulanmadı ya da eksiği var — TAMAMLANDI SAYILMAZ; `[ ]` = yapılmadı. Mükemmel olmayan hiçbir iş `[x]` olmaz.

## Şimdi (öncelik sırası)
1. [ ] **TestFlight derlemesi** (`bash ~/Projects/eyes/app/scripts/testflight.sh`), içinde `fffa276`, `1a85b1c`, `fe06f26`,
   `ee417db` ve düzeltmeleri (Gelişim haritası, WHO-5).
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
7. [ ] **Cihazda bak: yeni simge ve açılış ekranı** (Artifact "Nefona Simgesi",
   https://claude.ai/artifact/MG7F9LpSPajYQoKjmHgGW8). Ana ekranda Açık, Koyu, Renklendirilmiş, Şeffaf (Ayarlar → Ana
   Ekran → Simgeler); uygulamayı açık ve koyu temada aç: Capacitor logosu yok, yanıp sönme yok.
   Derleme `AppIcon.icon` yüzünden durursa (Capacitor'da bilinen sorun, capacitor#8179): hatayı gönder; çözüm
   `.icon` satırlarını geri almak, PNG seti yedek olarak kalır.
   **Cihazda bak (Gelişim haritası, `ee417db` + düzeltmeleri):** Gelişim'in başındaki harita ve 7 satır;
   "İlk 28 gün / Son 28 gün" (35. günden sonra); bir alana dokununca 28 günlük şerit; Ana sayfa harita kartı;
   İyi oluş 5 soru (son soru "Kaydet"). İki temada.
8. [ ] **Karar bekliyor (sahibine soruldu, 2026-09-28):**
   - İyi oluş dilimi hep boşa yakın (tek kaydı 14 günde bir WHO-5 → en fazla 2/28). Seçenekler: (a) İyi oluş için
     doluluk "WHO-5 zamanında cevaplandı mı" olsun (son 14 günde cevap varsa dolu); (b) Dalga "Motive" gibi iyi oluş
     etkisi ölçen oturumlar da İyi oluş gününe sayılsın; (c) olduğu gibi kalsın.
   - "Bugünün görevi" (notice) `countsTowardGoal: false` ama haftalık hedefte ve takvimde egzersiz günü sayılıyor
     (önceden var). Sayılmasın mı?
   - WHO-5 çok düşükse (ör. 28 altı) yalnız "bir sağlık uzmanıyla konuşmak iyi gelebilir" yazıyor. Kriz hattı ya da
     yardım kaynağı eklensin mi? (Hukukçu ile birlikte.)
   - WHO-5 ticari kullanım lisansı (hukukçu; aşağıda adım 2).
   - Ana sayfa 320 px'te (iPhone SE 1. nesil) 14 px yana taşıyor: günün diyaframı yanındaki "DURAK · ≈19 DK KALDI"
     satırı (Bug 21; alarm işinden önce de vardı). Düzeltilsin mi?
9. [ ] **Ölçüm ilkesi açıkları:** her modül istatistik kaydeder ve Gelişim'de görünür (ANA_BELGE §4). Taramada
   bulunan eksikler aşağıda "Ölçüm ilkesi" bölümünde.

## Fikir: Nefona alarmı (sahibinden, 2026-09-28) — plan henüz mükemmel değil
Sahibinin fikri: ekranda Nefes/Dalga görürken "alarm kur"; uygulamanın kendi alarmı, Dalga sesleriyle; "10 uygulama
yerine tek uygulama". Değerlendirme: amaca bağlı alarm (uyanış = Dalga + sabah nefesi; akşam pratiği) mantıklı ve
veri merkezine yazar (çaldı mı, yapıldı mı, erteleme). Genel saat uygulaması (dünya saati, kronometre) değil.
Dayanak: AlarmKit (iOS 26+; sessiz ve Odak modunu deler). Melodik alarm ile uyku ataleti arasında ilişki var
(McFarlane 2020, PLoS One doi:10.1371/journal.pone.0215788 ve Clocks Sleep doi:10.3390/clockssleep2020017; 50 ve
20 kişi; iddia olarak söylenmez).
Araştırma (2026-09-28; doğrulanamayan VARSAYIM):
- AlarmKit: sessiz ve Odak modunu deler; tek seferlik ve haftalık tekrar; erteleme; ikinci düğme App Intent ile
  uygulamayı açabilir (`openAppWhenRun`); izin `AlarmManager.requestAuthorization()` + `NSAlarmKitUsageDescription`
  (Apple belgesi). Özel ses: `AlertConfiguration.AlertSound.named(_:)`, dosya uygulama paketinde ya da
  Library/Sounds'ta (Apple belgesi + WWDC25 notları). Biçim ve süre sınırı: BELGEDE YOK. Gerçek cihazda özel sesin
  çalmadığına dair bir geliştirici kuşkusu var (Bartlett blog yorumu) → CİHAZDA DENEME ŞART.
  Sade alarm için widget (Live Activity) uzantısı gerekir mi: BELGEDE AÇIK DEĞİL → CİHAZDA DENEME ŞART.
- Dalga sesi dosya değil, anlık üretim (Web Audio). Ama `dalgaSleep.js` müziği zaten WAV'a basıyor
  (OfflineAudioContext + encodeWav) → alarm sesi telefonda üretilip Library/Sounds'a yazılabilir (VARSAYIM: yazma
  yeri ve biçim cihazda denenecek).
- iOS 26 payı: App Store'da işlem yapan cihazların %79'u (Apple, 7 Haziran 2026). iOS 15–18'de yalnız bildirim.
- Eğer–o zaman planı: fiziksel aktivitede etki 0,25 (Silva 2018, 13 RKÇ, doi:10.1371/journal.pone.0206294);
  sağlıklı beslenme d=0,51 (Adriaanse 2011, doi:10.1016/j.appet.2010.10.012); ruh sağlığı sorunu olanlarda hedefe
  ulaşma d=0,99 (Toli 2016, doi:10.1111/bjc.12086). SINIR: alkolde çevrim içi verilen plan etkisiz (d=−0,04;
  Cooke 2023, doi:10.1111/dar.13553). Alarm dış hatırlatmadır; kişinin kendi "eğer–o zaman" planıyla aynı değil.
- "Ertelemeden en iyi saati öğren": dayanak BULUNAMADI. Trinquart 2023 (655 kişi) sabah/akşam gönderimde fark
  bulmadı; gerçek davranışa dayalı kişisel mesaj etkiliydi (doi:10.2196/40784). → Saati kişi seçer; sistem saat
  öğrenmez, yalnız "bu saatte 3 kez ertelendi, değiştirmek ister misin?" diye sorar (VARSAYIM).
Kalan:
- [x] 2026-09-28 gece: sahibi "test bitti, canlıdayız" dedi → deneme paneli ve `AlarmSpikePlugin.swift` kaldırıldı (asıl
      alarm `AlarmPlugin.swift`'te; cihazda doğrulanan: seçilen paket sesi (Gün Işığı) çaldı, 9 dk ertele görünüyor;
      sessiz modda çalma ayrıca doğrulanmadı).
- [x] (geçmiş) Cihazda deneme derlemesi (spike): kod yazıldı (`AlarmSpikePlugin.swift`, `components/AlarmSpikePanel.jsx`;
      Dalga ekranının altında, yalnız test derlemesinde). Bu ortamda Swift derlenemedi; Mac'te derleme ve cihaz
      sonucu bekleniyor. Sorular: (1) sessiz modda çalıyor mu, (2) Dalga WAV sesi mi varsayılan ses mi çaldı,
      (3) "Nefona'yı aç" uygulamayı açtı mı, (4) kurarken hata var mı (uzantı gerekiyorsa burada görünür).
      AlarmKit ve AppIntents zayıf bağlı (OTHER_LDFLAGS); iOS 15–25'te açılış çökmesi olmamalı (VARSAYIM,
      SwiftData örneği: forums.swift.org). Sonuçtan sonra panel ve eklenti asıl özelliğe dönüşür ya da kaldırılır.
- [ ] Uygulanmış bildirim sistemi (v2, `8bccf79`, Hatırlatmalar ekranı; cihazda denenmedi) ile tek "Hatırlatma ve
      alarm" planında birleştir. Açık: sessiz gün oranı %25 (kodda VARSAYIM; sahibinin onayı kayıtlı değil).
- [ ] iOS 26 öncesi davranış (hatırlatmaya düşer, ekranda açıkça söylenir) ve ölçüm yükü (her sabah soru yok) tasarla.
Sahibinin istekleri (2026-09-28, deneme sonrası):
- [ ] Alarm sesi seçimi: normal alarm sesleri + Dalga sesleri. Sahibi (onayladı): Dalga sesleri 4, ileride 10 ve üstü;
      genişleyebilir olmalı → sesler tek kayıt listesinden (modül kaydı gibi), yeni ses = listeye bir satır + dosya.
      Sesler uygulama paketinde (Library/Sounds çalmıyor, Bug 20) → yeni ses uygulama güncellemesiyle gelir.
      [~] 2026-09-28: 3 yeni uyandırma sesi (Gün Işığı varsayılan, Kuş Bahçesi, Uyanış Marşı; PubMed dayanağı ve
      hoparlör ölçütleri design/uyanma-sesleri/README.md) + Dalga sesleri ve uyku müziği hoparlöre göre yeniden
      hazırlandı (Bug 20/22 kök neden). Cihazda duyulduğu doğrulanacak.
- [ ] Uyku sesi (sahibi onayladı: "aynen öyle"): alarm sabaha kurulunca uyumak için ses; kapanma (a) zamanlayıcıyla — Dalga uyku modu zaten var
      (`dalgaSleep.js`, sonunda kısılarak susar) ya da (b) nefesten uyuduğunu anlayıp. (b) için araştırılacak: telefon
      mikrofonuyla uyku/nefes algılamanın doğruluğu (PubMed), gece boyu mikrofon izni ve KVKK (ses telefondan çıkmaz),
      pil. Doğrulanmadan söz verilmez.
      [~] 2026-09-28: uyku ekranı "gece saati" (tasarım A "Amber Saat", sahibi seçti; `components/NightClock.jsx`,
      `lib/nightClock.js`, `styles/dalga.css .dg-night`). Müzik kendiliğinden bitince saat + alarm kalır (kayıt o anda
      saklanır), ekran açık tutulmaz; "Bitir" sonuca götürür. Cihazda doğrulanacak: müzik bitince telefon kendiliğinden
      kilitleniyor mu; kilit açılınca saat hemen güncel mi; kayma (en çok 8 nokta/dk, merkezden en çok 16) göze batıyor mu;
      "Hareketi Azalt" açıkken kaymıyor mu; açık temada ekranı aşağı çekince gri kenar görünmüyor mu.
      Araştırma (2026-09-28, PubMed): 9 telefon uygulaması 495 gecede PSG ile karşılaştırıldı; uyku verimi, uyanık
      süre, hafif/derin uykuda anlamlı ilişki YOK, yalnız horlama süresi uydu (Kim 2021, doi:10.1007/s11325-021-02493-y).
      Mikrofon sesinden uyku evresi (derin öğrenme): telefon kaydında %68 dönem uyumu (Hong 2022,
      doi:10.2147/NSS.S361270). Tüketici cihazları uyku süresini fazla gösterir (Kolla 2016, doi:10.1586/17434440.2016.1171708).
      Teknik engel: uyku sesi çalarken mikrofon önce bizim müziğimizi duyar (nefes maskelenir).
      → Öneri: (a) zamanlayıcı ilk sürümde (var, güvenilir). (b) "nefesle kapanma" ayrı araştırma işi; ilk adım telefonda
      ölçüm (sessiz aralıklarda kısa dinleme + hareketsizlik), kişinin kendi sabah bildirimiyle karşılaştırılır; sağlık
      iddiası yok. Sahibinin kararı bekleniyor.
- [ ] Normal alarm sesleri: iOS sistem sesleri (Radar, Chimes) AlarmKit'te adla çalınamıyor (forum 795417) → varsayılan
      ses + kendi ürettiğimiz klasik tonlar (paket içinde).
- [ ] Ses dosyası boyutu: 25 sn WAV ≈ 1,1 MB; 10+ ses için Mac'te `afconvert` ile küçültme (CAF/M4A). Hangi biçimin
      alarmda çaldığı cihazda denenecek (forumda .caf/.mp3/.aiff beta 4'te çalmamıştı, sonra düzeldiği bildirildi).
- Deneme sonucu 1 (14:05): AlarmKit kuruldu, izin verildi, iki alarm da 2 dk sonra çaldı; Library/Sounds'taki Dalga
  sesi çalmadı (Bug 20). Deneme 2: paketteki sesler (`f6cc639`) — sonuç bekleniyor.
- [~] Tasarım Artifact'i "Nefona Alarm" (https://claude.ai/artifact/SQrWCSABUKbSEf9qAbDpYG): akşam Ana sayfa en
      üstte "Yarın sabah" kartı (19:00'dan sonra; test derlemesinde 12:00), alarm sayfası (saat, tekrar, ses listesi,
      uyku sesi), kuruldu durumu, sabah "Nefona'yı aç" → 1 dk nefes, iOS 26 öncesi ve izin yok durumları.
      ONAY BEKLİYOR + sahibine 5 soru (akşam eşiği, varsayılan 07:00, "bu akşam değil", sabah akışı, İyi oluş alanı).
      v2 (sahibinin kararları, 2026-09-28): akşam eşiği 19:00 (test derlemesinde 14:00); kart "Alarm kurayım mı?"
      [Evet]; kurulum üç soru, hepsi önceden cevaplı: saat (üç öneri, uyandığın saatlerden öğrenilir; ilk kez
      07:00·08:00·09:00 + Başka), günler (yedi yuvarlak, öğrenilir; sahibi 6 gün), "Uykuya dalarken ses çalsın mı?"
      (süre: Kendiliğinden [varsayılan] · 5 · 10 · 15 · Başka). "Kendiliğinden" ilk sürümde öğrenen zamanlayıcı
      (ilk gece 15 dk VARSAYIM; sabah "Ses bittiğinde uyumuş muydun?" ile ±5 dk; 5–45 dk). Bütün seçimler ve sabah
      cevapları analiz için kaydedilir (sahibi: "bu verileri analizde kullanacağız").
      v3 (2026-09-28, bütün kararlar): "Bu akşam değil" kalır (3 kez üst üste → bir kez "Bu kart akşamları çıksın
      mı?"); sabah akışı isteğe bağlı ("Uyanınca": hiçbiri [varsayılan] · 1 dk nefes · Dalga sesi); veri "İyi oluş"
      alanına (Scott 2021, 65 RKÇ, g=−0,53, doi:10.1016/j.smrv.2021.101556; WHO-5 "sabahları taze ve dinlenmiş");
      süre kelimesi "Sana göre" (uyku algılıyormuş izlenimi vermesin). Kod: sahibinin "başla"sı + deneme 2 sonucu.
      Nefesle kapanma ölçüm işi onaylandı (2026-09-28); tasarıma girmez, ayrı iş.
- [~] **Kod (v3, sahibinin "başla"sı, 2026-09-28; CİHAZDA DOĞRULANMADI):**
      - Swift `AlarmPlugin.swift` (JS "Alarm"): AlarmKit `.relative` + `.weekly` / `.never`, paketteki ses `.named`,
        önizleme (AVAudioPlayer, ses oturumuna dokunmaz), "Nefona'yı aç" anı UserDefaults → `consumeOpen`. Bu ortamda
        Xcode yok: DERLENMEDİ. `NefonaAlarmMeta` ve `OpenNefonaIntent` deneme dosyasından buraya taşındı.
      - `lib/alarm.js` (kurallar, testli), `lib/alarmLog.js` (ayar + günlük), `lib/alarmNative.js` (AlarmKit ya da
        iOS 26 öncesi bildirim 7600–7607), `lib/alarmSounds.js` (tek ses listesi; yeni ses = bir satır + dosya).
      - Ana sayfa kartı (`components/AlarmCard.jsx`): akşam soru / kurulu / izin yok / iOS 26 öncesi / "Bu kart
        akşamları çıksın mı?"; sabah "Uyanınca" ve "Ses bittiğinde uyumuş muydun?". Kurulum `screens/AlarmSetup.jsx`,
        sabah ekranı `screens/AlarmMorning.jsx`, uyku sesi Dalga uyku ekranı (`sleepPreset`). Hatırlatmalar'da
        "Sabah" satırı (kart kapatılırsa kurulum yolu). Veri merkezi: uyanma ve sabah cevabı olan gün → İyi oluş.
      - Görsel kontrol: 37 durum × iki tema, 390 ve 320 px (tarayıcıda, sahte saatle).
      - Tasarımdan sapmalar: (1) "07:00'a kur" yerine "07:00'ye kur" / "07:00'de hatırlat" (saat okunduğu gibi
        ek alır: yedi → yediye); (2) iOS 26 öncesi kartına "Bu akşam değil" bağlantısı eklendi (yoksa kart her akşam
        kapanamaz çıkıyordu); (3) sabah ekranı yalnız "Nefona'yı aç" ile açılınca; sonra gelen kişiye aynı şey Ana
        sayfa kartında; (4) iOS 26 öncesinde uyandıran ses bildirim sesi (Dalga sesi bildirimde denenmedi).
      - VARSAYIM (kodda işaretli): Dalga sesi alarmda çalar (deneme 2 bekleniyor; çalmazsa `DEFAULT_SOUND` = 'phone');
        çaldıktan sonra 2 saat içindeki ilk açılış uyanma işareti; "Uyanınca" kartı 4 saat, soru 8 saat; iki soru
        arası ≥ 3 gün; gece 04.00'ten önce "yarın" = bu sabah; akşam kartı yalnız 19.00–23.59.
      - Bağımsız kod incelemesi (2026-09-28): 11 bulgu. Düzeltildi: "Yarın sabah" tek dokunuşu öğrenilen günlerle
        kuruyordu (artık yalnız yarın); yeniden kurma hata verirse eski alarm siliniyordu (artık önce yenisi, iki
        yolda da); iOS 26'ya geçişte eski bildirim yedeği kalıyordu; kalmış "Nefona'yı aç" damgası saatler sonra
        ekrandan koparıyordu (artık ≤ 10 dk, VARSAYIM); harita yeni uyanmayı ertesi güne dek göstermiyordu; çalmış
        tek seferlik alarm "değiştir" açılıyordu; Hatırlatmalar'dan açılan kurulum Ana sayfaya dönüyordu; izin
        penceresinden sonra kart durumu yenilenmiyordu; üç metin. Karar sahibinde: alarm kartı Ana sayfanın tek kart
        yuvasının dışında (tasarımda en üstte ayrı kart), hatırlatma kartıyla aynı anda görünebilir.
        Bilinen (kapandı 2026-09-28): deneme paneli alarmındaki "Nefona'yı aç" da uyanma damgası yazıyordu; panel kaldırıldı.
- Araştırma 2 (2026-09-28, PubMed; öneriler sahibine soruldu, karar bekliyor):
  - Erteleme: gecelerin %55,6'sı ertelemeyle bitti, ortalama 2,4 kez / 10,8 dk (Robbins 2025, 3 milyon gece,
    doi:10.1038/s41598-025-99563-y). Alışkın ertelemecilerde 30 dk erteleme bilişi bozmadı, ~6 dk uyku kaybı
    (Sundelin 2023, n=31, doi:10.1111/jsr.14054). Bizim alarmda erteleme düğmesi YOK (iki düğme: Kapat, Nefona'yı aç).
  - Düzen: uyku düzenliliği ölümü uyku süresinden daha güçlü öngördü (Windred 2024, 60 977 kişi, gözlemsel,
    doi:10.1093/sleep/zsad253) → hafta sonu da aynı saat.
  - Işık: gündüz parlak ışık düşük, gece ışığı yüksek ölüm riskiyle ilişkili (Windred 2024 PNAS, 88 905 kişi,
    gözlemsel, doi:10.1073/pnas.2405924121) → sabah "perdeyi aç" seçeneği.
  - Uyku müziği: öznel uyku kalitesi arttı (orta kesinlik; PSQI −2,79; çalışmalarda 25–60 dk/gece; Cochrane,
    Jespersen 2022, doi:10.1002/14651858.CD010459.pub3). Bizim "Sana göre" 15 dk'dan başlıyor (çalışılandan kısa).
  - Süre: yetişkine gecede en az 7 saat (AASM/SRS uzlaşısı, Watson 2015, doi:10.5665/sleep.4716) → "yatma saati" satırı.
  - Yatmayı erteleme: sıkıntıyla ilişkili (Azeem 2026 meta, gözlemsel, doi:10.3389/fpsyg.2026.1767938); etkili
    gösterilen müdahale yoğun BDT (Rasouli 2025, n=32) → basit hatırlatıcı için kanıt YOK.
- [~] **Sahibinin kararları (2026-09-28, 2. tur) kodda:** erteleme (ikinci düğme "Ertele" 9 dk; iOS reddederse
      "Nefona'yı aç"; VARSAYIM: geri sayım widget uzantısı istemez), "Her gün" + düzen notu (Windred 2024), "Sana göre"
      30 dk'dan (Cochrane 2022; sınır 5–60), yatma saati satırı (7 saat, Watson 2015; yalnız 24 saat içindeki alarmda),
      "Uyanınca: Gün ışığı" (Windred 2024 PNAS). Kaynaklar uygulamadaki kanıt listesinde ("Sabah alarmı ve uyku sesi").
      Bug 22 düzeltmesi (uyku sesi dokunuş içinde; "Yine de çal").
- [~] **Tasarım v4 (onaylı, 2026-09-28, https://claude.ai/artifact/GJU5G7RieTuyNTUbezJn8d) kodda:** kart "Bugünün
      yolu"nun altında; Ana sayfanın sayı dili (Unbounded saat, mono etiket), 12 saatlik gece kadranı (yatma → alarm,
      altın nokta şimdi), sakin "Uyku sesi" satırı, ⋯ menüsü (değiştir, uyku sesi, Ana sayfadan kaldır + Geri al).
      Profil → Alarm: alarm satırı, "Ana sayfada göster" (prefs.alarmCard, varsayılan açık), uyku sesi. Hatırlatmalar'daki
      "Sabah" satırı kalktı. Akşam sorusu yalnız kartta (VARSAYIM: "ok" = üç sorudaki önerilerim; soru 2 → uygulama içi
      kart, iOS ana ekran widget'ı DEĞİL). Gün içinde alarm yoksa kart tek satır "Kurulu değil · Kur".
      Görsel kontrol: bütün haller iki temada, 390 ve 320 px; bulunup düzeltilen: 320'de "Uyku sesi" ve değer bölünmesi,
      "Çok önce" düğmesi, tek günde "Ct" → "Her Cumartesi", kadrandaki ay merkezde değildi, Profil satırında gün/ses
      bölünmesi ve anahtar satırının hizası.
- [~] **v4 ikinci bağımsız inceleme (8 bulgu, engelleyici yok) düzeltildi:** kartta tür alarmın kendisinden
      (`alarm.kind`; iOS 26'ya geçmiş telefonda eski bildirim hatırlatması "Yeniden kurarsan gerçek alarm olur" der);
      her kart hâline ayrı `key` (⋯ menüsü hâller arasında açık kalmıyordu); 24 saatten uzak yarın "Yarın" (saat iki kez
      yazılıyordu); kadran yalnız yatma saatinden önce ve alarma ≤12 saat kala (öğleden sonra ve akşam alarmında nokta
      uyku yayının içine düşüyordu); Profil → Uyku sesi bitince Profil'e döner (`alarm-sleep-pro`); "Kaydedildi" ve
      "Tamam" kartları `role="status"`, kaldırınca odak "Geri al"da, ⋯ listesi düz düğmeler; "Bu gece yok" ("Sana göre"
      öneki kalktı); başlık "Sabah" yalnız 12.00'den önceki alarmda. Testler: prefs her testte sıfırlanır, kadran/Yarın/
      başlık/eski yedek/Bu gece yok testleri. Görsel: yeni hâller iki temada, 390 ve 320 px; kart 320'de taşmıyor
      (sayfadaki 14 px taşma Ana sayfa haritasından: Bug 21).
- [~] **Tasarım v5 (2026-09-28, https://claude.ai/artifact/5QhWAtgBFCWo5TmXPZo11n) kodda.** VARSAYIM: sahibinin
      16:38 ve 17:03 mesajları ("adım gün senin altında alarm saati kurulu gibi temaya uygun bir satır", "profilde
      gözükmüyor demiştim") v5 onayı; açık 3 soruda önerilerim uygulandı: alarm yokken sönük "— alarm yok" satırı,
      kurulu alarmın büyük kartı kalktı (kart yalnız akşam/sabah soruları için). Yatma saati bildirimi (soru 3)
      YAPILMADI, sahibinin cevabı bekleniyor. `components/AlarmLine.jsx` (satır + alt sayfa + kapat onayı + Geri al;
      geri alma kurulamazsa söyler), kurulumda büyük saat + iOS çarkı, öneriler yalnız 04.00–11.59 uyanışlarından
      (`lib/alarm.js` suggestTimes), `dayShort`. Görsel: iki tema, 390 ve 320 px; bulunup düzeltilen: sayfadaki
      değerler sağa yaslanmıyordu, "alarm yok" yazısı öteki satırlarla hizasızdı, satır 320'de taşmayı 4 px
      artırıyordu (14 → 18; şimdi 14, Bug 21).
      Bağımsız inceleme (8 bulgu, engelleyici yok) düzeltildi: akşam alarmı kapatınca hemen "Alarm kurayım mı?" kartı
      çıkıyordu (test yeniden çizmediği için yanlışlıkla geçiyordu; bugün kapatıldıysa sorulmaz); "Geri al" eski bildirim
      hatırlatmasını kendi türüyle kurar; saati geçmiş tek seferlik alarm geri kurulmaz ("Saati geçti"); satır kapatılsa
      da "Geri al" şeridi kalır; alt sayfada odak (açılınca ilk düğme, kapanınca satır), Escape, arka sayfa `inert`;
      tekrarlayan alarmda onay "… alarmı artık çalmaz"; komşu öneriler de 04.00–11.59'da; Swift MISSING → "Bu ses
      uygulamada bulunamadı".
- [ ] **Cihazda bak (alarm):** (1) derleniyor mu (Xcode 26); (2) 14.00'ten sonra Ana sayfada kart; Evet → Kur;
      iOS alarm izni; (3) haftalık alarm seçilen günlerde çalıyor mu, tek seferlik bir kez; (4) Dalga sesi çalıyor mu,
      25 sn'de susuyor mu tekrar mı ediyor; (5) "Nefona'yı aç" uygulamayı açıp sabah kartını/ekranını getiriyor mu;
      (6) uyku sesi kilitli ekranda sürüyor mu, süre bitince susuyor mu; (7) ertesi sabah soru; (8) izin reddi kartı
      ve Ayarlar'daki adı ("Alarmlar" mı); (9) Değiştir → Alarmı kaldır; (10) Tüm verileri sil alarmı iptal ediyor mu.
      Deneme paneli ve `AlarmSpikePlugin` kaldırıldı (2026-09-28, sahibi "test bitti, canlıdayız").

 (sahibin yönü, 2026-09-28)
- [~] **1. Veri merkezi (okuma kapısı):** `lib/dataHub.js`. Testler, oturumlar, istatistik çekirdeği (`progress.js`),
      profil cevapları (başlangıç ve 28. gün) ve mola/su günlüğü 7 alan altında. Canlı her modülün merkeze ulaştığı
      testle denetleniyor. Göz kırp süre kaydediyor. Göz kırp ve egzersiz setleri merkeze bağlandı. Ödeme ekranındaki
      iris haritası oturumları görüyor (Dikkat ve Farkındalık hep boş kalıyordu).
- [~] **2. İris haritası ve Gelişim merkezden beslenir:** `dataHub.growthMap`. Harita Gelişim'in başında (7 satır,
      28 günlük şerit) ve Ana sayfada (küçük harita + tek öneri); alan ayrıntısında düzen şeridi, kaynaklar, başlangıç
      soruları, önce→sonra etkisinin haftalık seyri; WHO-5 modülü (`modules/who5`, `screens/Who5.jsx`).
      - Tasarım: Artifact "Nefona Gelişim Haritası" (https://claude.ai/artifact/2RHScxNg7Cro1bXcDo2mvX), onaylandı.
        Kural: dilimin doluluğu = son 28 günde kaydı olan gün; dış kenar yayı = doğrulanmış değişim (altın iyileşiyor,
        turuncu geriliyor).
      - Tasarımdan sapmalar: karşılaştırma düğmesi "İlk 28 gün / Son 28 gün" ve 35. günden sonra çıkar (iki pencere
        en az bir hafta ayrışsın); Nef'in ana önerisi değişmedi, en az düzenli alan önerisi Ana sayfa harita kartında;
        WHO-5 ilk gün sorulmaz (en erken 2. gün).
      - Açık: kurulumdaki ve 28. gündeki iris (`lib/iris.js`, IrisPlan) hâlâ sorulardan çizilir; merkeze bağlanması
        ayrı iş.
      - WHO-5 Türkçe metni WHO'nun belgesinden (Eser, 1998 sürümü) birebir alındı. Hukukçuya: WHO-5 artık WHO açık
        erişim ürünü; ücretli uygulamada kullanım lisansı (ticari kullanım koşulu) DOĞRULANMADI.
- [ ] **3. Anonim teşhis verisi (ürünün kendini geliştirmesi):** açık rızayla, hesapsız, görüntüsüz yalnız sayılar
      Supabase'e (Frankfurt). Örnek: kalibrasyon kontrol yüzdeleri, ekran hataları. Ayrı KVKK rıza sayfası ve gizlilik
      politikası; hukukçu onayı. Sonra "Verileri paylaş" kullanıcı arayüzünden kalkar, yalnız test derlemesinde kalır.
- [ ] **4. Kişiye uyum merkezden okur:** oyun zorluğu, günün yolu (zayıf alana ağırlık), Nef'in önerileri.

## Ölçüm ilkesi: her modül kaydeder, gelişim görünür (ANA_BELGE §4; plan + onay gerekir)
- [~] **İris haritası modül verisiyle yaşasın** (Gelişim ve Ana sayfa; adım 2). Kurulum/28. gün iris'i hâlâ sorulardan.
      Önceki durum: 5 alan yalnız kurulumdaki ve 28. gündeki sorulardan, Dikkat ve Farkındalık yalnız dolu/boş dolardı.
      - Her alanın değeri kendi modüllerinden gelsin: Göz ← testler ve egzersizler; Sakinlik ← Nefes, Dalga, Gökyüzü;
        Kendine yaklaşım ← Yön; Beden ← adım, mola, su; İyi oluş ← WHO-5.
      - Harita Gelişim'in başında ve Ana sayfada görünsün.
      - Gelişim'in 7 kutucuğu (`lib/progress.js`) ile iris haritası (`lib/iris.js`) tek hesaba bağlansın.
      - Tasarım önce Artifact.
- [~] **WHO-5 iyi oluş:** ekran, kayıt ve sonuç; 14 günde bir; Gelişim İyi oluş ayrıntısında "Yeniden yanıtla".
      Resmi Türkçe metin WHO belgesinden. Ticari kullanım lisansı hukukçuya soruldu (yukarıda).
- [~] **Göz kırp** süre (`seconds`) kaydediyor (eski kayıtlarda 150 sn varsayımı sürer).
- [ ] Göz kırpta algılanan kırpma sayısı Gelişim'de zamanla görünsün.
- [~] Önce→sonra etkisi (Nefes, Dalga, Gökyüzü, Yön-Dışarıdan bak) haftalara göre görünür (alan ayrıntısı, 6 hafta).
- [ ] **Zaman serisi:** Yılan, Çemberler (isabet, varış süresi) ve okuma testi için trend grafiği.
- [ ] **Okuma testi** Göz alan kutucuğuna girsin.
- [ ] **Mola ve su** günlüğü (`habit-log`) takvime girsin. (Gelişim haritasında Beden alanına giriyor.)
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
- [~] v2 uygulaması (2026-09-27, commit yok): Mola ve Su ekranları, Hatırlatmalar ekranı (Bilgi → Hatırlatmalar),
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

## nefona.com sitesi (2026-09-29, sahibi: "önce yerelde yazıp aktaralım; alan adını Vercel'den alırız")
Karar: canlıya çıkmadan `site/` klasöründe geliştirilir; sahibi Mac'te `npm run dev` ile açar, Windows'tan Tailscale
üzerinden (http://100.126.28.77:4300) bakar. Alan adı (nefona.com, Vercel'de boşta, 11,25 USD/yıl) ve Vercel projesi
yayın gününe kadar alınmaz. Sayfalar: ana, nasıl çalışır, modüller, bilim (27 kaynak, DOI+PMID), gizlilik/KVKK, koşullar,
destek/SSS, yenilikler. Kaynakça, kanıt kartları, sürüm notları, modül listesi, belirtiler ve 7 alan uygulamadan üretilir
(`site/scripts/data.mjs`); üst çubuk ve alt bilgi tek yerde (`site/scripts/pages.mjs`, kaynak `site/pages/`).
- [~] İlk sürüm yazıldı; bağımsız inceleme (5 engel, 19 gerekli, 19 küçük) uygulandı; iki temada 320/390/820/1280'de
      ölçüldü (taşma yok, yazı tipleri yüklü, hata yok); atlama bağlantısı, Escape ile menü, tek turluk iris canlandırması
      (Hareketi Azalt'ta sabit), OG görseli (`site/public/og.png`, Chromium ile üretildi). Sahibi Tailscale üzerinden bakacak.
- [~] Ana sayfa yeniden (sahibi: "çok basit, Nefona'yı anlatmıyor; 5 saniyede çıkarsın"): kural = yabancı testi (ürünü
      bilmeyen inceleyici beş soruya siteden cevap veremiyorsa bitmemiştir; gerçek ekran yoksa bitmemiştir). Giriş: canlı E
      tadımlığı (5 harf, 0,1 logMAR adım; ölçüm değil, öyle yazar) + "Gözün değişiyor. Sen de gör."; uygulamanın gerçek
      ekranları (HEAD'deki sürümden ayrı çalışma ağacında 28 günlük örnek veriyle çekildi: `site/public/screens/*.webp`,
      düzenek `_harness/site.jsx` + `siteSeed.js` — depoya girmedi); bir günün akışı, 1./5./28. gün, Gelişim + Nef,
      ses örnekleri (`site/public/voice`, uygulamadaki mp3'ler), gizlilik, "Bilime dayanır" (sahibinin isteğiyle
      "Ne yapmıyoruz" listesi ana sayfadan çıktı, Bilim sayfasında kaldı).
- [ ] Yayından önce: gizlilik ve koşullar metinleri hukukçu incelemesi + veri sorumlusu unvanı/adresi; destek e-postası
      (alan adı ile birlikte Resend/SMTP: Supabase e-posta girişi de buna bağlı); App Store bağlantısı.
- [ ] Yayın: Vercel projesi "nefona" (kök `site/`, build `npm run build`, çıktı `dist`), alan adı satın alma ve bağlama.
- [ ] Sonra: İngilizce sürüm; sayfa içi arama için ön-üretim (SEO: içerik bugün istemcide basılıyor).

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
- [x] WHO-5 resmi Türkçe madde metni (WHO belgesinden alındı)
- [ ] Nef'e "Yön" serbest metni: ayrı açık rıza
- [ ] i18n, kronotip, özel SMTP
- [ ] Small Business Program başvurusu (isteğe bağlı)

## Haftalık E testi yeniden tasarım (2026-09-28, sahibinin şikâyeti) — UYGULANDI, CİHAZDA DENENMEDİ
- [~] Uygulama (2026-09-29, onaylı S1–S13): tek ekranlı hazırlık (Gözlük · Örtme · Mesafe), 36–44 cm sayım bandı ve
      35–45 cm duraklama (300 ms kural, neden kare kare değişmez), örtme kararı 400 ms penceresinde çoğunlukla, harf
      kesin boyutta ve sabit, haftalıkta 28 harf, göz göz kayıt + runDay (gece yarısı), yeni görme serisi, kamerasız ayrı
      seri, sesli yönlendirme 8 cümle × 2 ses (yalnız hazırlık/duraklama/mola), parlaklık ve ters renk (aşağıda).
      Doğrulama: üç bağımsız tur + mutasyon denetimi (24/24 mutant yakalandı), 400 rastgele koşu özellik denemesi,
      1335/1335 test, derleme tamam. Cihazda bak: 44 cm çevresinde harf akışı duraklamadan sürüyor mu; yanlış göz
      örtülünce kart "Yanlış göz" diyor ve doğru göze dönünce kalkıyor mu; harf ekrandayken ses susuyor mu; gece yarısını
      geçen yarım haftalık test ertesi gün baştan açılıyor mu; "Doktoruma göster" PDF'de Değişim satırı görünen
      değerlerle tutarlı mı. Kaldırılan üç ses cümlesi (acuStart, acuEyeDone, acuDone): ekranda karşılığı yok, sahibi
      isterse geri gelir.
Sahibi: "bir sayfada gösterilmeli aşağı doğru gitmemeli; gözlük seçimi yapılmadan diğer aşamaya geçmiyor ama hiç belli
değil; PubMed'e uygun, hesaplamada kusursuz; sesler ElevenLabs'tan."
- İnceleme (45 ajan: kod/akış, hesap denetimi + benzetim, PubMed, 5 boyut × 2 tema ölçüm, geçmiş kararlar; hata
  bulguları çürütme denemesinden geçti). Doğrulananlar: "Başla" gözlük seçilmeden sebepsiz kapalı (AcuityTest.jsx:452;
  örtme kartı yine "Tamam, başlayabilirsin" diyor :555); kurulum 375×812'de 326–372 pt taşıyor; ham kapak/derinlik
  satırları herkese görünüyor (:556-557); harf boyutu piksele yuvarlanıyor (optotype.js:30 Math.round; 0,1 → 0,155);
  harf deneme içinde yeniden boyutlanıyor; sayılan harf 25–60 cm'de (:32-33); kamerasız kayıtlar seriye karışıyor; iki
  göz serisinde kırmızı çıkamıyor; haftalık fiilen 20 harfte bitiyor; parlaklık denetlenmiyor; 2. gözde Geri/✕ biten
  gözü siliyor; tek göz kaydı haftayı "tamam" sayıyor; kapak yolu yanlış gözü ayırt etmiyor (occlusion.js:49-51).
- Tasarım Artifact'i "Nefona E Testi" (https://claude.ai/artifact/V2p6hrLEU8GJgXP6gaFq32): her göz için tek ekran,
  üç satır (Gözlük · Örtme · Mesafe), düğme ilk eksiği yazar; 31 ekran/durum × 3 boyut × 2 tema ölçüldü: hepsi tek
  ekrana sığıyor, yazı kırpılmıyor (uygulamanın kendi yazı tipleriyle).
- Karar bekleyen 13 konu (S1–S13, öneriler Artifact'te); ElevenLabs sesli yönlendirme 10 cümle × 2 ses (S13).
- Plan ayrıntısı: bu oturumun çalışma notu PLAN.md (bölüm 1–7: bulgular, hesap H1–H9, kanıt K1–K17, ekranlar E0–E10,
  uygulama adımları, mutasyon testleri, cihaz listesi). Onaydan önce kod değişmez.
- [~] **Parlaklık ve renkleri ters çevirme (S7, S12): TestFlight'tan önce cihazda doğrulanacak.** Kod yazıldı
      (`FaceDistancePlugin.swift` getBrightness / setBrightness / isInvertColorsEnabled, `lib/brightnessSession.js`,
      `lib/invertedColors.js`); Swift bu ortamda derlenmedi, CİHAZDA DENENMEDİ. 29 Eylül sürüm notunun parlaklık ve ters
      renk maddesi (`lib/releases.js`) buna dayanıyor: doğrulanmazsa sürüm notundan çıkarılır.
      Cihazda bak: "Başla"da parlaklık en yükseğe çıkıyor mu; test bitince, testten çıkınca ve uygulamadan ayrılınca
      (Denetim Merkezi, arama, uygulama değiştirme) eski değerine dönüyor mu; uygulamaya dönünce test sürüyorsa yeniden
      en yükseğe çıkıyor mu. Akıllı ve Klasik ters çevirme ayrı ayrı açıkken test başlamıyor ve "Renkleri ters çevirme
      açık." uyarısı çıkıyor mu (VARSAYIM: Klasik ters çevirme algılanmayabilir; Apple Forum 91039).
