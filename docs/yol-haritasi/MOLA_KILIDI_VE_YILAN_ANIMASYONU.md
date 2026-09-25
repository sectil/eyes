# Göz yorgunluğu koruması + Yılan "gözle nasıl oynanır" animasyonu — Plan v2

> Dayanak: `docs/arastirma/ajan-raporlari/17a_sure_siniri_mola.md` (kanıt) ve
> `17b_mola_kilidi_animasyon_teknik.md` (teknik). Altı kaynak PubMed'de ikinci kez elle doğrulandı:
> Galinsky 2000, Chen 2025, Kontos 2016, CITT 2008, Gao 2021, Harding 2005.
> v2: iki rapor baştan sona yeniden okundu; v1'in raporlarla çeliştiği 6 nokta düzeltildi (§0).
> Durum: **onay bekliyor**. Kod yazılmadı. **VARSAYIM** = kanıtı olmayan ürün kararı.

## 0. v1'e göre ne değişti ve neden

| v1 | v2 | Gerekçe |
|---|---|---|
| Tek koruma: süre kilidi | **Üç katmanlı koruma**: süre bütçesi + **mesafe uyarısı** + **rahatsızlık düğmesi**; kırpma izleme v2'de | Yorgunluğun en doğrudan işareti telefonun yüze yaklaşması: 60 dk'da 30,6 → 27,8 cm (Long 2017). 17a, mesafe uyarısını süre sınırından "daha doğrudan bir önlem" sayıyor. Kamera zaten mesafeyi ölçüyor. |
| Testler günlük sınıra da tabi | Testler yalnızca **mola sırasında** kilitli; günlük 30 dk sınırı testleri kapsamaz | 17a: testler kilitlenmemeli, oyundan önce ya da moladan sonra yapılmalı. Ölçüm dinlenmiş gözle; ama sınır yüzünden ölçüm kaçırılmaz. |
| Kilit sürpriz gelir | Oyun/egzersiz sırasında **görünür bütçe çubuğu**; 1 dk kala uyarı | 17a: sert kilit bırakma oranını artırabilir. Sürpriz olmayan kilit daha az kırıcı (VARSAYIM). |
| Saatlik 15 dk mola "işe yarar" | Saatlik mola kalır ama **etkili diye söylenmez** | Wang 2024: 1 saatlik okumada 10 dk gözler kapalı dinlenme tek başına kötüleşmeyi önlemedi. |
| Işık uyarısı yok | İlk oyun açılışında **ışığa duyarlılık notu** + oyunlarda flaş denetimi | Harding 2005; ışığa duyarlılık nüfusun %0,3–3'ünde (Fisher 2005). |
| Nefes sayma göz süresine sayılır | Nefes sayma göz bütçesine **sayılmaz** (`active: false`) | Ekran karanlık, göz ekranda değil; sayılması bütçeyi haksız tüketir. |

Rapor önerisiyle **bilinçli olarak farklı kaldığımız tek yer:** 17a oyun için "10 dk üst sınır, 5. dakikada
yumuşak soru" öneriyor; sen **5 dk sert kilit** istedin. 5 dk kanıtla çelişmiyor (doğal duraklatma ~4 dk,
Gao 2021; 5 dk mola etkili, Galinsky 2000) ama zorunlu kilidin gönüllüden üstün olduğunu gösteren
çalışma yok. Ürün kararı olarak kaydediliyor; ekranda "sağlık için zorunlu" denmez.

## 1. Kanıt özeti

| Soru | Cevap | Kaynak |
|---|---|---|
| "En fazla 5 dk egzersiz" | PubMed'de karşılığı yok | 17a §1 |
| "2 saatte bir" | 2 saat **sürekli ekran işi** sonrası 15 dk mola önerisi (NIOSH 1981, PubMed dışı, sayfa açılamadı) | 17a §1 |
| Kısa göz hareketi zarar verir mi? | Sağlıklıda zarar kanıtı yok; 10 dk yoğun sakkadda bozulma yok | Matta 2009 |
| Telefonda oyun ne zaman yorar? | 30 dk, 15 dk'ya göre belirgin daha yorucu | Chen 2025, [DOI](https://doi.org/10.1038/s41598-025-33670-8) |
| Etkili mola | Saatte 5 dk: göz yorgunluğu ↓; 20 sn: etkisiz | Galinsky 2000, [DOI](https://doi.org/10.1080/001401300184297); Johnson 2022 |
| Doğal oyun ritmi | ~4 dk'da bir duraklatma (göz tembelliği oyun denemesi, çocuk+yetişkin) | Gao 2021, [DOI](https://doi.org/10.1080/08164622.2021.1878834) |
| Belirti | Kısa göz testlerinde sağlıklı sporcuların %11'inde baş ağrısı/dönmesi; hareket tutması öyküsü OR 7,7 | Kontos 2016, [DOI](https://doi.org/10.1177/0363546516632754) |
| Doz referansı | 15 dk/gün ev egzersizi, ciddi yan etki yok (9–17 yaş) | CITT 2008, [DOI](https://doi.org/10.1001/archopht.126.10.1336) |
| Mesafe | 60 dk telefonda okuma: belirti 3,6 → 8,1; mesafe 30,6 → 27,8 cm | Long 2017 |
| Flaş | ≥3 Hz, ≥%25 ekran, doygun kırmızı geçişi, titreşen çizgiler riskli | Harding 2005, [DOI](https://doi.org/10.1111/j.1528-1167.2005.31305.x) |

## 2. Üç katmanlı koruma

### 2.1 Süre bütçesi (kilit)

| Kural | Değer | Etiket |
|---|---|---|
| **Göz bütçesi**: bakışla oyunlar + göz hareketi egzersizleri + testler, ekranda aktif süre | **5 dk** dolunca **5 dk mola**, atlama yok | 5 dk senin kararın (VARSAYIM); Gao 2021 ve Galinsky 2000 ile uyumlu |
| **Saatlik**: son 60 dk'da 20 dk göz çalışması | **15 dk** mola | VARSAYIM (MHLW 2019 "1 saatte 10–15 dk", PubMed dışı). Etkili diye sunulmaz (Wang 2024). |
| **Günlük**: oyun + göz hareketi egzersizi | **30 dk/gün**; dolunca ertesi güne kadar kilit. **Testleri kapsamaz.** | VARSAYIM; CITT 15 dk – PEDIG 60 dk aralığı |
| Hareket tutması öyküsü | İlk oyunda tek soru; "evet" → bütçe **3 dk** | Kontos 2016 (OR 7,7); 3 dk VARSAYIM |
| "2 saatte bir" | Kullanılmıyor | Gerekçe yok |

- Bütçe dolmadan görünür: oyun/egzersiz üst çubuğunda küçük "göz bütçesi" halkası; **1 dk kala** kısa
  titreşim + "1 dk sonra mola" satırı. Kilit hiçbir zaman sürpriz olmaz.
- Oyunun ortasında kesmez: bütçe dolunca oyun o turu bitirir, egzersiz seti o adımı bitirir; test hiç
  kesilmez (test başlarken bütçe ≥ testin süresi değilse test başlamadan mola önerilir).
- **Kilitlenen:** Yılan, Çember takibi, egzersiz setleri, görme ve okuma testleri (yalnız mola sırasında).
- **Kilitlenmeyen:** Nefes pratiği, Nefes sayma, göz kırpma egzersizi, dersler/bilgi, gözler kapalı
  dinlenme. Mola ekranı bunlardan birini önerir.
- Yılan'ın kendi 3 dk mola önerisi kaldırılır; tek merkezi mekanizma. Mevcut 10 dk "konfor molası"
  (RestBreak, atlanabilir) bu sistemin içine katılır; iki ayrı mola olmaz.

### 2.2 Mesafe uyarısı (kamera varsa)

- Oyun, egzersiz ve testte telefon **30 cm'den yakın** kalırsa (**10 sn** üst üste) yumuşak uyarı:
  "Telefonu biraz uzaklaştır" + titreşim; 3. uyarıda oyun/egzersiz duraklar. Eşik 30 cm rapor 05
  (miyopi çalışmaları); 10 sn ve 3 uyarı VARSAYIM.
- Mesafe zamanla kısalıyorsa (oturum başına ortalama, seans başı ile sonu arasında >3 cm düşüş) Gelişim'e
  "yorgunluk işareti" olarak kaydedilir; iddia değil, kendi verisi (Long 2017 mantığı, eşik VARSAYIM).

### 2.3 Rahatsızlık düğmesi

- Her göz ekranında "Rahatsızlık hissediyorum" → oturum hemen durur, **15 dk** mola (süre VARSAYIM),
  metin: "Baş dönmesi ya da ağrı sürerse bugün devam etme; geçmezse bir göz hekimine görün."
- Kayıt: `endedBy: 'symptom'`; Jev bunu görürse ertesi gün kısa bütçe önerir.

### 2.4 v2 (sonra): kırpma izleme

- Kamera kırpma hızı oturum içinde belirgin düşerse "göz kırp" hatırlatması. Golebiowski 2020 (rapor 09)
  eksik kırpmanın 60 dk'da 6 → 15/dk'ya çıktığını gösteriyor; hız eşiği için kendi verimiz gerekiyor.
  Bu yüzden v1'de yalnızca kırpma hızı **kaydedilir**, uyarı verilmez.

## 3. Mola ekranı ve bildirim

- Tam ekran **"Gözlerin dinleniyor"**: dk:sn geri sayım (gerçek saat; uygulama kapanıp açılsa da doğru),
  "Atla" yok. Altında kilitsiz etkinlikler (Nefes 3 dk, Nefes sayma, Göz kırpma) ve "pencereden dışarı
  bak" önerisi. Hareket azaltma tercihine saygı.
- Ana sayfada kilitli kartlarda kilit simgesi + kalan süre; dokununca mola ekranı.
- **Mola bitince bildirim:** "Mola bitti, devam edebilirsin." Uygulama arka planda/kapalıyken de gelir
  (`@capacitor/local-notifications` 8.3.1, `interruptionLevel: 'active'`; Time Sensitive/Critical
  kullanılmaz). Dokununca Ana sayfa. **Zorla kapatma** durumu cihazda test edilecek (Apple belgesi
  yalnız "çalışmıyorken" diyor).
- İzin: ilk molada kendi kartımız ("Mola bitince haber vereyim mi?"), sonra iOS izni. Reddedilirse kilit
  yine uygulama içinde tam çalışır (App Store 4.5.4 ilkesi).
- Kalıcılık: `restUntil` iki yere (UserDefaults — `@capacitor/preferences` 8.0.1 + mevcut depo);
  `PrivacyInfo.xcprivacy` eklenir. Saat ileri alınarak atlatılabilir; kabul edilen risk.

## 4. Veri

- `activity` kayıtları: `{ module, route, startedAt, endedAt, activeMs, meanDistanceMm?, distanceDrop?, blinkRate?, endedBy }`.
- `rest` kayıtları: `{ reason: 'budget'|'hourly'|'daily'|'symptom', startedAt, endsAt, completed }`.
- Göz kırpma ve okuma testi kayıtlarına eksik `seconds` alanı eklenir.
- Gelişim: "Bugün göz çalışması 12 dk · 2 mola"; haftalık çubuk; yorgunluk işaretleri.
- "Tüm verileri sil" bunları da siler. Hiçbir veri cihazdan çıkmaz; Jev'e yalnız özet dakika gider.

## 5. Işığa duyarlılık

- Yılan ve Çember'de ≥3 Hz flaş, tam ekran doygun kırmızı geçişi, titreşen çizgi deseni denetimi;
  varsa düzeltme (Harding 2005). Çarpışma efekti ve zıplayan çember ilk şüpheliler.
- İlk oyun açılışında tek satır: "Yanıp sönen ışık ya da desen seni rahatsız ediyorsa oyunları oynama."
- Mola ekranı ve animasyonda flaş yok.

## 6. Yılan: "gözle nasıl oynanır" animasyonu

- ~8 sn döngü. Üstte mini tahta (yılan + elma), **altta bir kişinin yüzü**. Gözbebekleri sırayla sağa,
  yukarı, sola, aşağı **tahtanın dışına** kayar; gözbebeği kenara vardığı anda yılan döner ve kenardaki
  ok dolar. Tek satır: "Dönmek istediğin yöne, tahtanın dışına kısaca bak."
- Inline SVG + CSS (ek kütüphane yok; Lottie/Rive 33–102 KB JS + 360–806 KB WASM). Yüz, atlastaki
  "kendi gözün" çizim diliyle; renkler tema tokenlarından. `prefers-reduced-motion` → 4 sabit kare.
  `role="img"` + Türkçe açıklama.
- Yerler: (1) Yılan girişinde gözle kontrol seçiliyken; (2) ilk oyundan önce tam ekran, atlanabilir,
  sonra "Nasıl oynanır?"; (3) oyun altındaki "Bakışla kontrol" kartında küçük sürüm (ilk 30 sn).
- **Pratik adımı:** "Şimdi sen dene" — 4 yön sırayla; her yöne bakınca kenar yeşile döner (mevcut
  eşikler). Google Look to Speak aynı "ekranın dışına bak" metaforunu böyle öğretiyor (17b, arama özeti).
- Modül sözleşmesine `tutorial` alanı: aynı bileşen Çember takibine de takılır.

## 6b. Nefes pratiği ekranı: yeniden tasarım (öncelik 0)

Mevcut ekran (5fbfaf9) kullanıcı tarafından "takip edilemiyor, yakışmamış" diye reddedildi. Sebep: verilen
üç referans ekranın düzeni alınmadı; kalıp kartları, kanıt metni, düzenleyici ve sakinlik sorusu tek sayfaya
yığıldı; oynatma ekranı yalnızca küre + küçük etiket. Yeniden tasarım referanslara birebir uyar:

**A. Ayar ekranı (referans 1)**
- Üstte kalıp seçici tek satır çip: Sakin ritim · Uzun veriş · Kutu · Özel. Seçim aşağıdaki satırları doldurur.
- Dört satır, her biri `− değer +`: **Nefes al / Nefes tut / Nefes ver / Bekle** (Uzun veriş için "İkinci alış"
  satırı görünür). Sınırlar aynı (tutma ≤ 7 sn, 0 = yok). Süre yarım saniye adımlı.
- Ayrı kart: **Süre** (1 / 3 / 5 dk) · **Görsel** (›: Küre / Halka / Manzara) · **Titreşim** (anahtar + ⚙) ·
  **Ses** (anahtar + ⚙ → B) · **Sesli komut** (anahtar: "Nefes al… tut…" söylensin mi).
- Altta büyük **Başla**. Kanıt metni ve program bilgisi sayfadan kalkar; sağ üstte ⓘ ile açılır.
- Sakinlik sorusu ayar ekranında **sorulmaz**; "Hazırlan" öncesi tek dokunuşluk küçük satır olarak sorulur.

**B. Ses ekranı (referans 2)**
- Aşama başına ses seçimi: Nefes al · Nefes tut · Nefes ver · Bekle · Bitiş. Seçenekler: Zil, Tık, Tahta,
  Çınlama, Bildiri, Sessiz. Sesler kısa sentetik tonlar (WebAudio, dosya yok); ses seviyesi `− 10 +`.
- Sesli komut açıksa ton + kelime birlikte; kapalıysa yalnız ton. Ses düğmesi (SoundToggle) hepsini susturur.

**C. Oynatma ekranı (referans 3)**
- Başta **"Hazırlan · 3, 2, 1"** büyük geri sayım.
- Aşama adı ekranın üstünde **büyük** ("Nefes al"), altında büyük saniye sayacı; **aşama ilerleme çubuğu**
  (dolarak ilerler) ve en altta **toplam ilerleme çubuğu** + "3 / 18".
- Ortada büyük görsel: seçime göre küre / halka / çerçeveli manzara fotoğrafı; görsel nefesle büyür-küçülür.
- Alt kontroller: ◀ önceki aşama · ⏸ duraklat · ▶ sonraki aşama. Sağ üst ⓘ, sol üst ✕.
- Aşama değişiminde: ton + (açıksa) kelime + aşamaya özgü titreşim. Tutma aşamalarında sayaç kırmızıya
  dönmez; renk tokenları.
- Derin setteki nefes adımları aynı oynatma bileşenini kullanır.

**D. Sonuç ekranı**: "Şimdi ne kadar sakinsin?" + Zorlandım + Kaydet (mevcut).

Doğrulama: sahte cihazda üç ekranın görüntüsü kullanıcıya gösterilir, **onay alınmadan** TestFlight'a çıkmaz.
Manzara görselleri: telifsiz, cihaz içinde, küçük (≤150 KB) — kaynak plan onayından sonra seçilir (VARSAYIM).

## 7. Yapım sırası

0. **Nefes pratiği ekranı yeniden tasarımı (§6b)** — ayar, ses, oynatma; sahte cihaz görüntüleriyle onay.
1. `lib/eyeBudget.js` (saf): bütçe, saatlik, günlük, hareket tutması, kilit başlat/kalan, kayıtlar; testler.
2. Kilit ekranı, Ana sayfa göstergesi, oyun/egzersiz üst çubuğunda bütçe halkası + 1 dk uyarısı;
   modül sözleşmesine `gates.eyeBudget` (sayılır mı / kilitlenir mi); RestBreak ile birleştirme.
3. Bildirim + Preferences eklentileri, izin kartı, PrivacyInfo, bildirime dokununca Ana sayfa. → TestFlight.
4. Mesafe uyarısı + rahatsızlık düğmesi + hareket tutması sorusu.
5. Etkinlik ve mola günlüğü, eksik `seconds` alanları, Gelişim satırı; kırpma hızı kaydı.
6. Işığa duyarlılık denetimi ve notu.
7. Yılan animasyonu + pratik adımı + "Nasıl oynanır?".

## 8. Onay bekleyen kararlar

1. **Sayılar:** bütçe 5 dk → 5 dk mola; saatte 20 dk → 15 dk; günde 30 dk (testler hariç). Uygun mu?
2. **Testler:** yalnızca mola sırasında kilitli, günlük sınıra dahil değil. Uygun mu?
3. **Atla yok.** Ürün kararı olarak kaydediliyor; kanıt zorunluluğu desteklemiyor ama çelişmiyor da.
4. **Mesafe uyarısı** 30 cm / 10 sn / 3 uyarıda duraklat. Uygun mu?
5. **Yüz:** atlastaki çizgi göz dili mi, basit emoji tarzı mı?
6. **Sıra:** nefes ekranı (0) → kilit (1–3) → koruma katmanları (4–6) → animasyon (7). Uygun mu?
7. **Nefes görseli:** Küre / Halka / Manzara üçü de olsun mu, yoksa yalnız manzara mı? Manzara fotoğrafı
   için kaynak tercihin var mı (kendi fotoğrafların / telifsiz arşiv)?
