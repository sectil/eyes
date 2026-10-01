# Ana oturum istemi · Nef süper zekâ (N1)

Aşağıdaki metin ana oturuma olduğu gibi yapıştırılır.

---

Görev: onaylı Nef planının ilk aşamasını (N1, "telefon aklı") uygulamaya bağla. Sahip Türkçe yazar; ona sade, doğru
Türkçeyle, parantezsiz ve kısa cevap ver.

## Önce oku (sırayla)

1. `docs/yol-haritasi/tasarim/nef/PLAN.md`: tek kaynak; onaylandı 2026-10-01.
2. `docs/yol-haritasi/tasarim/nef/DEVIR.md`: onaylı kararlar ve dokunulmazlar.
3. `docs/yol-haritasi/tasarim/nef/ARA_RAPOR_envanter.md`: bugünkü Nef ve veriler.
4. `docs/yol-haritasi/tasarim/nef/ornekler/5sn-sonuclari.md`: geçen tasarımlar M2, M1C, M4A, M5C.
5. Bağlı onaylı planlar:
   - `tasarim/bildirim-hava-yuruyus/PLAN.v1.md` §A.4, §A.6, §5.5 ve `DEVIR.md`: tek planlayıcı, gece kuralları,
     cümle bankası yöntemi.
   - `tasarim/YOL.nef.md` §7: bekçi kuralları, sabit doktor cümleleri.
   - `tasarim/gelisim-merkezi/PLAN.v1.md`: `growthCenter`.
   - `docs/yol-haritasi/IS_AKISI_KURALLARI.md`.
   - `HATA_GUNLUGU.md`: Nef ile ilgili Bug 25, 29 ve 30. Daha önce düzeltilmiş bir hatayı yeniden "düzeltme".

## Kapsam: yalnız N1 (plan §8)

1. **İskelet.** `app/src/lib/nef/` altında şu dosyalar; hepsi saf işlev, React yok, testli:
   - `moments.js`: an motoru.
   - `speak.js`: seçici, kanal bütçesi ve susma kuralları.
   - `memory.js`: `gozolcum:nef-said` (en çok 400 satır, 180 gün).
   - `bank/tr.js`: cümle bankası. Yer tutucular var; sayı ve eki kod yazar.
   - `bank/tr.grammar.js`: saat ve sayı ekleri ile ünlü uyumu.

   An motoru dil bilmez. Bir dilde cümle yoksa o an susar; başka dile geri düşmez (plan §4.7).
2. **Anlar:**
   - F1 · yağmur, kişinin yürüyüş saatine denk geliyor (`rainOnWalk`).
     - Cümle önce kişinin kendi düzenini söyler, sonra havayı (M1C).
     - Kişisel olgu yoksa an kurulmaz.
     - Saatler tutarlı olur.
   - F3 · hissedilen ≥ 30 derece kişinin yürüyüş saatine denk geliyorsa F1 cümlesine yan cümle eklenir. Ayrı bildirim
     yok. "31°'ye" gibi ekli derece işareti yazılmaz.
   - F2 · seni hatırlayan Nef (`recallEffect`, `effectPattern`). Kaynak `progress.effects` ve `acuteEffects`.
     - Tek seans olgu olarak söylenir.
     - Genel cümle yalnız anlamlıysa kurulur: en az 3 seans.
     - "Sayesinde" ve "iyi geldi" yasak.
     - Bugünün gün adı tekrar edilmez: "geçen hafta bu akşam".
   - F4 · susan Nef.
     - Yeni olgu yoksa kart küçülür, bildirim yok.
     - Kişi yolunu bitirdiyse Nef o gün bildirim göndermez.
     - Uzun aradan dönüşte tek cümle gelir.
     - Düşük WHO-5'te Nef yalnız sabit satırı gösterir.
   - Genel an türleri (plan §4.8): `metricChange`, `firstTime`, `returnAfterGap`, `drift`, `pathDone`.
     - Hepsi manifestteki `progress` alanından (`domain`, `effects`, `metrics`) ve `progression`'dan kendiliğinden çıkar.
     - `metricBest` (rekor kartı) ve `ladderStep` ayrı Nef kartı **olmaz**: 5 saniye kapısında 3/5 ve 0/5 aldılar.
   - Mevcut Nef sesleri an motoruna üretici olarak taşınır: `homeSuggest.js`, `today.js jevLine`, 13 onaylı uzun yol
     cümlesi. Davranış değişmez; eşdeğerlik testi 0 fark verir.
3. **Manifestte isteğe bağlı `nef` alanı.** Alanlar: `name` (çekimler), `metricWords`, `moments`, `cells`, `evidence`,
   `note`. Bu alanı `registry.js` sözleşme yorumuna ekle.

   **Sözleşme testi:** her canlı modül için şunlar denetlenir:
   - En az bir genel an üretilebiliyor mu?
   - Ad çekimi doğru mu?
   - `evidence` anahtarları `sources.js`'te PMID ve DOI ile kayıtlı mı?
   - Bankada onaylı cümle var mı?

   Biri eksikse test düşer. Modül adı cümlede türüyle geçer: "Yılan oyunu", "Dalga sesi".
4. **Hafıza kuralları** (VARSAYIM sayılar, plan §4.4):
   - Aynı cümle 21 gün içinde tekrar etmez.
   - Aynı olgu bir kez söylenir.
   - Aynı an türü Ana sayfada üst üste iki gün gelmez.
   - Bilim satırı 7 gün içinde tekrar etmez; kart açıldıysa 30 gün dinlenir.
   - Üç kez yok sayılan an türü 14 gün dinlenir.
5. **Planlayıcı.**
   - Yeni kaynak `planNef` `notifyAll.planAll` içinde en düşük öncelikle girer. Kimlik 7900–7919; `notifyApply.js
     OWN_RANGES` güncellenir.
   - Nef'in kendi bildirimi günde en çok 1, haftada en çok 4.
   - Bütün mevcut kurallara uyar: gece 01–05, sessizlik, yatmadan önceki 60 dk, ≥ 30 dk aralık, JS bekleyeni ≤ 58,
     çalışma oturumunda bildirim yok.
   - Metin zenginleştirme (F1, F3) kimlik ve saat değiştirmez. Yalnız 77xx ve 78xx bildirimlerinde olur; 74xx deney
     metinlerine **dokunulmaz**.
6. **Ana sayfa kartı.**
   - `CoachCard.jsx` an motorundan beslenir. Günlük model çağrısı (`getTodayInsight` → `api/coach.js`) Ana sayfada
     **kalkar**.
   - Sunucu dosyası silinmez; N2'de mektup için kullanılacak.
   - "Çevrimdışı öneri" damgası kalkar.
   - Kırmızı ve sarı göz uyarısı sabit metinle ve modelden bağımsız kalır.
7. **Dile hazırlık.**
   - Tarih, saat ve birim `Intl` ile yazılır.
   - Metin anahtarla çağrılır.
   - `tr-TR` sabiti Nef kodunda kullanılmaz.

## N1'in dışında kalanlar (yapma)

- Mektup (F5), `coach` v2 rızası, bilgi bankası `claims` alanı, model sınavı: N2'de.
- Söz, gün ışığı, aylık hikâye: N3'te.
- Sohbet, yürüyüş eşliği ve "evden çıktın" anı (açık soru): N4'te.
- İngilizce bankası: N5'te.

## Bağlayıcı kurallar

- **Kullanıcıya görünen her cümle sahip onayı olmadan koda girmez.** Plandaki cümleler taslaktır.
  - Yöntem: önce taslak listesi, sonra 5 kişilik doğallık ve etkileme sınaması (≥ 4/5), sonra kendi onayın, en son
    sahibe.
  - Onaylı cümleler `bank/tr.js`'e harfi harfine girer.
- **Ücretli çağrı yok:** banka üretimi (≈ 1 USD) ve model çağrısı sahip onayı olmadan yapılmaz. N1 elle yazılmış onaylı
  cümlelerle çıkabilir.
- **Anahtarlar** yalnız ortam değişkeninden okunur; depoya ve sohbete yazılmaz.
- **Kamera görüntüsü** telefondan çıkmaz. Apple Sağlık, konum ve hava verisi de sunucuya gitmez. Kullanıcının e-postası
  dış servise gönderilmez.
- **Sağlık iddiası yok.** Yasak kalıplar şunlar: emoji, ünlem yağmuru, "-malısın", korkutma, suçlama, başkasıyla
  karşılaştırma. Hava için "bekleniyor" denir, "yağacak" denmez. Gelişim ekranlarında "beyin" ve "tanıma" sözcükleri
  geçmez.
- **Doktor cümleleri ve WHO-5 yönlendirmesi** sabittir; an motoruna girmez.
- **5 saniye kapısı.**
  - Her yeni ya da değişen kart ve bildirim görünümü gerçek veriyle beş bağımsız değerlendiriciye gösterilir; soru
    "5 saniyede etkilendin mi?". "İdare eder" hayır sayılır.
  - En az 4/5; iki tema; 390 ve 320 genişlik.
  - En çok 2 tur. Geçmezse yöntemi değiştir: üç yön çiz, değerlendiriciler seçsin. Ya da sahibe sor.
  - Kendin mükemmel bulmadığını sahibe gösterme.
- **İş akışı kuralları** (`IS_AKISI_KURALLARI.md`):
  - Aynı anda en çok 2 iş akışı; başlarken bitiş saatini yaz.
  - Çalışırken yalnız ilgili testler; tam test takımı ve derleme sonda bir kez.
  - Kapsam dışı iş yok. Rapor en çok 30 satır.
- **Doğruluk.**
  - Doğrulamadan iddia etme.
  - Bilmediğin API, dosya ya da komutu uydurma.
  - Varsayımları "VARSAYIM:" diye işaretle.
  - Aynı yöntem iki kez başarısız olursa üçüncüyü deneme.
  - Büyük değişiklikten önce kısa plan yaz ve onay al.
- **Başka dosyalar.** Alarm, bildirim ve Gelişim merkezi üzerinde süren işlerin dosyalarına yalnız plandaki bağlantı
  noktalarında dokun: `notifyAll.js`, `notifyApply.js`, `remindTexts.js`, `registry.js`, `CoachCard.jsx`. Çakışma
  görürsen sor.
- **Commit.**
  - Yazar `Claude <noreply@anthropic.com>`.
  - İleti şu iki satırla biter: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ve
    `Claude-Session: (oturum bağlantısı)`.
  - Push'tan önce `git fetch`.
  - Commit ve PR'da model adı geçmez.

## "Bitti" tanımı (N1)

1. Bütün yeni cümleler sahip onaylı ve `bank/tr.js`'te.
2. Ana sayfa Nef kartı ve F1 bildirimi gerçek veriyle 5 saniye kapısında ≥ 4/5: iki tema, 390 ve 320.
3. Birim testleri var:
   - sayı ve saat eki tablosu,
   - 21 gün ve olgu tekrarı,
   - susma,
   - gece kuralları,
   - 74xx dokunulmazlığı,
   - bildirim bütçesi,
   - modül sözleşme testi: 21 canlı modülün hepsi geçer.
4. Mevcut Nef seslerinde eşdeğerlik 0 fark. Tam test takımı ve derleme yeşil.
5. Cihazda bir hafta:
   - aynı cümle iki kez görülmedi,
   - yağmurlu bir günde bildirim doğru saatte ve kişinin kendi saatiyle geldi,
   - Nef'in kendi bildirimi günde 1'i geçmedi.

Sonda sahibe kısa rapor: ne yapıldı, testler, kapı sonuçları, açık kalanlar.
