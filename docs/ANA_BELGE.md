# Nefona — Ana belge (buradan başla)

Her oturumun başında önce bu dosya, sonra `docs/yol-haritasi/YAPILACAKLAR.md` okunur.
Bu dosya dağınıklığı önlemek için var: amaç, kurallar, hangi belgenin ne işe yaradığı, yapılanlar tek yerde.
Açık işlerin TEK listesi `YAPILACAKLAR.md`'dir; burada tekrar edilmez.
Son güncelleme: 2026-09-28.

---

## 1. Amaç (kendi aramızda; kullanıcıya iddia olarak söylenmez)

**Gözden başlayarak insanı bütün olarak geliştirmek.** Göz giriş kapısıdır; hedef bütün insandır.
- Göz sağlığı ve göz alışkanlıkları (kırpma, mola, uzağa bakış, mesafe)
- Dikkat ve farkındalık (fark etme, odak)
- Sakinlik ve huzur (nefes, ses, gökyüzü molası)
- Kendine yaklaşım ve özgüven (Yön: kendini tanıma, şefkat)
- İyi oluş ve beden (uyku, stres, hareket)

Başarı ve sürdürülebilirlik bunların sonucudur; ayrıca vaat edilmez.

**Ölçüm ilkesi:** Her modül, kullanıcının yaptığı her şeyi istatistik olarak kaydeder. Gelişim bunları zamanla
gösterir. Değişim sözle vaat edilmez, sayıyla görünür. Yeni bir modül, ölçtüğünü kaydetmeden ve Gelişim'de
göstermeden bitmiş sayılmaz (durum: §4).

**Model: iris haritası.** Merkezde göz bebeği, çevresinde 7 alan: Göz, Dikkat, Farkındalık, Sakinlik,
Kendine yaklaşım, İyi oluş, Beden. Kurulumda başlangıç haritası dolar, 28. günde yeniden bakılır, yan yana görülür
(`app/src/lib/iris.js`).

**Neden "söylemiyoruz":** Sağlık iddiası yok. Bunun nedenleri App Store kuralları, tıbbi cihaz sınıfına girme riski
ve dürüstlük. Kullanıcıya dönük tek cümle ve kullanılmayacak ifadeler `yol-haritasi/YENIDEN_DUSUNME.md` §1'de:
"Nefona gözünden başlar: gözünü, dikkatini, sakinliğini, bedenini ve kendine bakışını birlikte izler, değişimi
gösterir ve günlük alışkanlığa çevirir. Tanı koymaz, tedavi etmez."

**Her karar için soru:** Bu, kişiyi bu amaca yaklaştırıyor mu? Ölçülüyor mu, gelişim görünüyor mu? Sakinleştiriyor
ve özgüven veriyor mu, yoksa sıkıyor mu? Ücretli kullanıcı en ufak hatada bırakır: çıkmaz ekran, anlamsız metin,
çalışmayan özellik kabul edilmez.

---

## 2. Değişmez kurallar (tek yerde)

**İçerik ve bilim**
- Her özellik PubMed kaynaklı dayanakla gelir; kaynak uygulamadaki listeye makalesi ve DOI'siyle girer.
- Sağlık iddiası yok; kanıtın türü ve sınırı açıkça yazılır.
- KVKK: her veri amacı için ayrı açık rıza.
- Kamera görüntüsü telefondan çıkmaz; yalnız sayılar işlenir.

**Tasarım**
- Her ekran koyu ve açık temada kusursuz olur.
- Bütün dillere hazır: metin çizime gömülmez, uzun çeviriye ve sağdan sola yazıma uyar.
- Önce tasarım (Artifact), onaydan sonra kod. Göndermeden önce ekran ekran yazılı öz eleştiri yapılır;
  "mükemmel değil" diyen tek madde kalırsa gönderilmez.
- "Bitti" denmeden önce (Bug 18, 2026-09-28'de ihlal edildi): ekranın her durumu iki temada görülür — boş veri,
  1. gün, dolu, iyileşme, gerileme, dar ekran (320 px), akışın her adımı; kod bağımsız bir gözle (ayrı inceleme)
  taranır; bulgular HATA_GUNLUGU'na, kalanlar YAPILACAKLAR'a yazılır. Görülmeyen durum varsa "bitti" denmez,
  "şu durumlara bakmadım" denir.
- Sesler ElevenLabs'ten: kadın Neslihan (`wQ7dVQFxIqwokkwsMqqn`), erkek Hakan (`DwjDVVARfPVjBKepXK2c`),
  model `eleven_multilingual_v2`. Ses Profilim → Seslendirme'de bir kez seçilir; modüller sormaz.
  Ekrandaki cümle ile ses aynıdır.

**Veri merkezi (sahibin baştan beri koyduğu ilke)**
- Bütün veri tek kapıdan okunur: `app/src/lib/dataHub.js`. Gelişim, iris haritası, Nef ve raporlar kendi ayrı hesabını
  kurmaz; merkezden okur.
- Bir modül ya da görünüm merkeze yazmıyor ve merkezden okumuyorsa bitmiş sayılmaz. Commit'ten önce kontrol edilir.
- `dataHub.test.js` canlı her modülün merkeze ulaştığını denetler; ulaşmayan yeni modül testi kırar.
- Hata kaydı (2026-09-28): Gelişim 2.0 (`70ff54f`), iris haritası (`812f568`) ve mola/su günlüğü bu ilkeye aykırı
  olarak ayrı yazıldı; sahibin sözü baştan beri buydu.

**Süreç**
- Mükemmel olmayan iş tamamlandı diye işaretlenmez (sahibinin kuralı, 2026-09-28). `[x]` yalnız cihazda doğrulanmış
  ve eksiksiz iş içindir; kodda bitip cihazda görülmeyen `[~]` (tamamlandı sayılmaz). Görev listesi de böyle.
- Bir işin durumunu söylemeden önce YAPILACAKLAR.md ve `git log` okunur; belge başlıkları eskiyebilir
  (2026-09-28: BILDIRIM_PLANI başlığı "onay bekliyor" diyordu, oysa v2 uygulanmıştı).
- Her değişiklik `app/src/lib/releases.js`'e bir sürüm notu maddesi ekler.
- Her açık iş `yol-haritasi/YAPILACAKLAR.md`'ye yazılır.
- Her hata `yol-haritasi/HATA_GUNLUGU.md`'ye işlenir.
- Büyük değişiklikten önce plan yazılır, onay beklenir. Varsayım "VARSAYIM:" diye işaretlenir.
- Aynı yöntem iki kez başarısızsa yöntem değişir.
- Uydurma yok: bakılmadıysa "bakmadım" denir.
- Önce `HATA_GUNLUGU.md` ve `git log` okunur; daha önce düzeltilmiş şey yeniden "düzeltilmez".
- "Çalışıyor" demek için kanıt gerekir. Cihazda denenmeyen şey "CİHAZDA DENENMEDİ" diye yazılır.

**Güvenlik**
- Şu anahtarlar uygulamaya, depoya ya da sohbete asla yazılmaz: ElevenLabs, OpenRouter ve Supabase gizli
  anahtarları (`sb_secret_`, `service_role`), RevenueCat `sk_`, `.p8`, Google istemci sırrı.
- Kullanıcının e-postası dış servise gönderilmez.

**Derleme ve yükleme**
- TestFlight Mac'ten tek komutla: `bash ~/Projects/eyes/app/scripts/testflight.sh`.
- Swift bu bulut ortamında derlenemez. Swift değişikliği ilk Mac derlemesinde doğrulanır; hata çıkarsa
  `error:` satırları istenir.

---

## 3. Belge haritası

| Belge | Ne için |
|---|---|
| `docs/ANA_BELGE.md` | Bu dosya: amaç, kurallar, harita, yapılanlar |
| `docs/yol-haritasi/YAPILACAKLAR.md` | **Açık işlerin tek listesi** (öncelik sırasıyla) ve tasarım kuralları |
| `docs/yol-haritasi/HATA_GUNLUGU.md` | Bütün hataların kontrol, hipotez, deneme ve sonuç kaydı (Bug 1–17, İlk Bakış) |
| `docs/yol-haritasi/YENIDEN_DUSUNME.md` | Sahibin kararları (2026-09-27), kullanıcıya dönük tek cümle, yeniden düzenleme planı |
| `docs/yol-haritasi/BILDIRIM_PLANI.md` | Hatırlatmalar: kararlar, kaynaklar, uygulama planı |
| `docs/yol-haritasi/NEFES_FARKINDALIK.md` | Nefes ve farkındalık modülü planı ve kanıtı |
| `docs/yol-haritasi/MOLA_KILIDI_VE_YILAN_ANIMASYONU.md` | Göz bütçesi, zorunlu mola, Yılan animasyonu |
| `docs/yol-haritasi/JEV_GOZ_KOCU.md` | Koç (Nef; eski adı Jev) planı |
| `docs/yol-haritasi/ENVANTER_VE_PLAN.md` | 62 ekranlık atlas ile kod karşılaştırması (2026-09-25) |
| `docs/arastirma/` | Bilimsel dayanak: sentez raporu ve ajan raporları (PubMed doğrulamalı) |
| `docs/abonelik/KURULUM.md` | App Store ve RevenueCat abonelik kurulumu |
| `docs/supabase/KURULUM.md` | Hesap altyapısı (Supabase) |
| `docs/iphone_ekran_tablosu.md` | iPhone modelleri ve fiziksel ekran ölçüleri |
| `app/src/lib/releases.js` | Kullanıcıya görünen sürüm notları (Bilgi → Yenilikler) |
| `site/` | nefona.com tanıtım sitesi (statik; kaynakça, sürüm notları ve modül listesi uygulamadan üretilir: `site/scripts/data.mjs`) |

---

## 4. Modüller ve ölçtükleri

Kaynak: kod taraması (2026-09-28). Üç ana bulgu ayrıca elle doğrulandı: `iris.js:17-27`, `BlinkExercise.jsx:127-135`,
`makeWho5Record` hiç çağrılmıyor. Dosya:satır referansları o güne aittir.

**Kayıt altyapısı**
- Tek depo: localStorage `gozolcum:v1` = `{ settings, tests[], sessions[] }` (`lib/storage.js` `addTest`/`addSession`).
- Modül sözleşmesi (`modules/registry.js`):
  - `progress.domain` / `metrics` / `effects` → Gelişim alan kutucukları.
  - `stats()` → Gelişim "Pratikler" bölümü.
  - `sessions.match` → gün listesi, rekorlar ve iris.

**Durum tablosu** (✔ var · ◐ kısmen · ✘ yok)

| Modül | Kaydeder | Gelişim'de zamanla görünür | İris haritasına girer |
|---|---|---|---|
| Haftalık E testi (kısa E testi isteğe bağlı, 2026-09-29) | ✔ | ✔ (grafik, sparkline) | ✘ (Göz hücresi yalnız İlk Bakış'tan) |
| Okuma testi | ✔ | ◐ liste var, grafik yok; Göz kutucuğuna girmiyor | ✘ |
| Göz kırp | ◐ süre kaydetmiyor | ◐ yalnız gün listesi | ✘ |
| Egzersiz setleri / yol | ✔ | ◐ yalnız gün listesi | ✘ |
| Nefes | ✔ | ◐ önce→sonra ortalaması, zaman serisi yok | ✘ (Sakinlik yalnız stres sorusundan) |
| Dalga | ✔ | ◐ ortalama, zaman serisi yok | ✘ |
| Gökyüzü molası | ✔ | ◐ ortalama, zaman serisi yok | ✘ |
| Fark Ettin mi? · Bugünün görevi · Nefes sayma | ✔ | ✔ sparkline | ◐ Farkındalık yalnız dolu/boş |
| Hızlı Bakış · Tek Bakışta | ✔ | ✔ sparkline | ◐ Dikkat yalnız dolu/boş |
| Yılan · Çemberler | ✔ | ◐ rekor ve 7 gün özeti, trend yok | ◐ Dikkat yalnız dolu/boş |
| Yön (Ayna, Dışarıdan bak) | ✔ | ◐ Ayna sparkline; Dışarıdan bak ortalama | ✘ |
| Yön (Şefkatle ele al) | ◐ yalnız "yapıldı" | ◐ sayım | ✘ |
| Mola · Su | ◐ ayrı günlük (`habit-log`) | ◐ yalnız hatırlatma deney kartı | ✘ |
| Adım (Apple Sağlık) | ◐ depoya yazılmaz, canlı okunur | ✔ Beden kutucuğu, 7 gün | ✘ (Beden yalnız hareket sorusundan) |
| İlk Bakış (20 sn kırpma) | ✔ profilde | ✘ | ✔ Göz hücresi |
| İris soruları, 28. gün | ✔ profilde | ✘ (yalnız IrisPlan'da yan yana) | ✔ |
| WHO-5 iyi oluş | ✔ (2026-09-28) | ✔ sparkline, anlamlı değişim | ✔ İyi oluş |
| Göz kalibrasyonu, bakış testi, göz bütçesi | ◐ / ✘ | ✘ | ✘ |

**Güncelleme (2026-09-28, adım 2):** Gelişim'in başındaki ve Ana sayfadaki iris haritası artık veri merkezinden
(`dataHub.growthMap`): her canlı modülün, testlerin ve mola/su günlüğünün kaydı kendi alanını doldurur (son 28 günde
kayıtlı gün); dış kenar yayı modül ölçülerinden doğrulanmış değişim. Tablodaki "İris haritasına girer" sütunu kurulum
iris'i içindir; Gelişim haritasına sessions.match'i olan her modül girer.
**Kalan açık:** kurulumdaki ve 28. gündeki iris (`lib/iris.js`) hâlâ yalnız sorulardan çizilir.
İş listesi: `YAPILACAKLAR.md` → "Ölçüm ilkesi".

---

## 5. Yapılanlar (özet)

Ayrıntı `git log` ve `releases.js`'de. Aşağıda alan alan özet ve önemli commit'ler var.

**2025-10-24/26: ilk sürüm (EyeTrail web)**
- Onboarding, göz takip kalibrasyonu, yılan oyunu, gösterge paneli (51 commit).

**2026-09-24: Nefona'nın temeli**
- Yakın görme ölçümü, günlük takip, takvim, açık/koyu tema.
- Egzersiz setleri; iOS uygulaması (Capacitor) ve abonelik ekranı.
- TrueDepth ile mesafe ve göz takibi; kişisel 5 nokta göz kalibrasyonu.
- TestFlight betiği; Jev (Nef) koçu Faz 1a; araştırma raporları.

**2026-09-25: modüller**
- Modül soketi; tasarım sistemi v2; Bugün ekranı v2; Çember takibi.
- Nefes: pratik, nefes sayma ve kanıt raporları.
- Göz bütçesi ve zorunlu mola kilidi; Yılan (gözle oynama, animasyon).
- Profil anketi (11 madde); E testi (gözlük koşulu, tek göz örtme).
- Farkındalık: Hızlı Bakış, Fark Ettin mi?, Tek Bakışta.
- Dalga (ses), Yön (kendini tanıma), okuma testi, bugünün yolu.

**2026-09-26: Gelişim, hesap, abonelik**
- Gökyüzü molası, kaynakça altyapısı.
- Gelişim 2.0: her modül Gelişim'e kendiliğinden bağlanır, istatistik katmanı, 5. gün raporu,
  "Doktoruma göster" PDF/CSV.
- Hesap (Apple, e-posta), "Seni tanıyalım", 7 gün deneme; ad Nefona / koç Nef.
- Abonelik: RevenueCat, üç plan. Bug 11–16 teşhis ve düzeltmeleri.

**2026-09-27: yeniden düşünme ve iris haritası**
- Ana sayfa başı, Profilim, KVKK açık rıza düzeltmeleri.
- Apple Sağlık (yalnız okuma); hatırlatmalar (mola, yürüyüş, nefes, su, çalışma oturumu).
- Yeni giriş ve hoş geldin ekranı; Google ile giriş.
- İlk Bakış yenilendi (okurken kırpma sayacı).
- İris haritası ve yeni kurulum sırası (4 soru, 28. gün).
- Nefes: 8 kalıp, ElevenLabs sesleri; ses Profilim'den tek yerden seçilir.
- Göz kalibrasyonu yeni ekran (iris hedef); egzersiz sahnesi yeni tasarım ve sesler.

**2026-09-28: göz takibinin temeli ve TestFlight düzeltmeleri**
- TestFlight yüklemesi: `NSHealthUpdateUsageDescription` eklendi (`182d8aa`).
- **Apple ile giriş:** npm eklentisi TestFlight'ta "UNIMPLEMENTED" veriyordu.
  - `import SignInWithApple` derlenmedi (`5b6d4b8`, çıkmaz yol).
  - Uygulamanın kendi eklentisi `AppleSignInPlugin.swift` yazıldı (`b4dc6f3`). **Cihazda çalıştı.**
- **Göz kalibrasyonu, Build 38 "Ayırt edemedim":**
  - Kök neden ışık değil, duruş kaymasıydı. En iyi aday seçimi, iki nokta yedeği, yan → orta → yan tekrar turu
    eklendi; çıkmaz ekran yerine "Temel ayarla devam" geldi (`b531b8a`).
- **Göz takibinin temeli:** Bakış yerçekimine göre ölçülüyordu (telefon yatınca eksenler karışıyor, baş kayınca
  açı değişiyordu).
  - Artık bakış ışınının telefon ekranıyla kesiştiği nokta mm olarak ölçülüyor (`scrX`/`scrY`).
  - Kalibrasyon sonunda 5 noktalık kontrol yapılıyor; takip açıkken ekran dikey kalıyor (`7028842`).
  - Kullanıcı beyanı: "göz takibi tamam". Rapor verisi henüz gelmedi.
- **Göz ayarı yönlendirmesi:** "göz bebeğinin içindeki noktaya bak" (kullanıcı önerisi); 14 yeni ses (`fffa276`).
- **Kendini iyileştiren göz modeli:** egzersizdeki bakış adımlarından sessiz kalibrasyon.
  Ekran akışı testi gerçek bir hatayı yakaladı (`1a85b1c`).
- Egzersiz adı "Tam göz kırp" → "Göz kırp" (`fe06f26`).
- Belgeler toparlandı:
  - Bu ana belge yazıldı.
  - Hata günlüğü repoya taşındı (`HATA_GUNLUGU.md`).
  - `YAPILACAKLAR.md` en üstüne "Şimdi" sırası eklendi.
- **Veri merkezi (adım 1):** `lib/dataHub.js` tek okuma kapısı; canlı her modülün merkeze ulaştığı testle denetlenir
  (`23f86e9`).
- **Gelişim haritası (adım 2):** iris Gelişim'de ve Ana sayfada merkezden dolar (28 günde kayıtlı gün + doğrulanmış
  değişim yayı); alan ayrıntısında düzen şeridi ve haftalık etki; WHO-5 iyi oluş modülü (14 günde bir).
- **Uygulama simgesi ve açılış ekranı:** simge yeniden çizildi (iris, aynı merkez, tek ışık, yukarı bakış);
  iOS 26 katmanlı `AppIcon.icon` + iOS 18 yedek PNG'ler (açık/koyu/renkli). Açılışta Capacitor'ın varsayılan logosu
  vardı; artık Nefona işareti, iki tema. Tek kaynak: `app/design/simge/simge.py`.
