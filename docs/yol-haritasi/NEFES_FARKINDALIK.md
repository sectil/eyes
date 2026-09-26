# Nefes ve Farkındalık Modülü — Plan (v2, kanıt raporlarına göre gözden geçirilmiş)

> Dayanak: `docs/arastirma/ajan-raporlari/16a_nefes_kanit.md`, `16b_nefes_goz_beyin.md`,
> `16c_nefes_teknik.md`. Bu belgede geçen her makale PubMed'de doğrulandı; altısı ayrıca ikinci kez
> elle kontrol edildi (Balban 2023, Marchant 2025, Levinson 2014 tam metin, Nam 2015, Schaefer 2025,
> Riedl 2026). Kaynağı olmayan her tasarım kararı **VARSAYIM** olarak işaretlidir.
> Durum: **onay bekliyor**. Kod yazılmadı.

## 1. Neyi değiştirdik: nefes bir "gevşeme özelliği" değil, farkındalığın ölçüm aleti

İlk planda nefes, göz egzersizlerinin yanına eklenen bir rahatlama modülüydü. Raporlar başka bir şey
söylüyor:

- Nefesin **görmeyi iyileştirdiğine** dair kanıt yok (16b). Bu yüzden nefes "göz" halkasına değil,
  **dikkat ve yaşam** halkalarına bağlanır.
- Nefes sayma, farkındalığın **davranışla ölçülebilen tek doğrulanmış göstergesi**. Anketler
  farkındalık eğitimini bilgisayarlı dikkat eğitiminden ayırt edemezken nefes sayma ayırt etti
  (Isbel 2020, RKÇ, n=86, [DOI](https://doi.org/10.1037/pas0000957)). 4 haftalık nefes sayma
  eğitimi zihin gezinmesini azalttı ve farkındalığı artırdı (Levinson 2014, 4 çalışma, >400 kişi,
  [DOI](https://doi.org/10.3389/fpsyg.2014.01202)).
- Hatanın türü bile bilgi taşıyor: fark edilmeden yapılan sayım hataları **dikkat kopmasıyla**,
  kişinin kendi yakaladığı hatalar **zihin gezinmesiyle** ilişkili (Wong 2018, n=127,
  [DOI](https://doi.org/10.1007/s12671-017-0880-1)). Dokunuş zamanlamasındaki değişkenlik,
  dikkat kopmasını en iyi öngören sinyal (Treves 2026, n=93, AUC>0,75,
  [DOI](https://doi.org/10.3758/s13415-026-01467-5)).

Uygulamanın cümlesi "fark etmeyi çalıştırırız, ölçeriz, izleriz". Nefes sayma bu cümlenin
**ölçme** kısmını ilk kez gerçek bir sayıya bağlıyor. Göz için yakın görme ölçümü neyse, farkındalık
için nefes sayma odur.

## 2. Kanıt haritası (ne kadar güvenebiliriz)

| Bulgu | Güç | Kaynak |
|---|---|---|
| Nefes sayma doğruluğu = farkındalığın davranışsal ölçüsü; 1 hafta test-tekrar ICC 0,60 | **Sağlam** | Levinson 2014; Isbel 2020; Wong 2018 |
| Dakikada ~6 nefes, seans sırasında kalp ritmi değişkenliğini artırır | **Sağlam** (223 çalışma) | Laborde 2022, [DOI](https://doi.org/10.1016/j.neubiorev.2022.104711) |
| 6/dk, kutu ve 4-7-8'den daha etkili; kutu ve 4-7-8 için "az ampirik destek" | Orta (n=84) | Marchant 2025, [DOI](https://doi.org/10.1007/s10484-025-09688-z) |
| Günde 5 dk uzun verişli nefes, 28 günde ruh halini meditasyondan daha çok iyileştirdi; kaygıda fark yok; %10 olumsuz deneyim | Orta (RKÇ, n=108) | Balban 2023, [DOI](https://doi.org/10.1016/j.xcrm.2022.100895) |
| Yavaş nefesin stres/kaygıya etkisi küçük-orta (g≈−0,35), kanıt kalitesi orta | Orta | Fincham 2023, [DOI](https://doi.org/10.1038/s41598-022-27247-y) |
| 8 dk bilinçli nefes, zihin gezinmesini pasif gevşemeye göre azaltır | Orta (tek deney) | Mrazek 2012, [DOI](https://doi.org/10.1037/a0026678) |
| Göz bebeği nefes alırken en küçük, verirken en büyük | Sağlam (5 ön kayıtlı deney) | Schaefer 2025, [DOI](https://doi.org/10.1113/JP287205) |
| 1 dk nefes egzersizi kaygıyı düşürür **ama tepki süresini uzatır** | Zayıf (pilot, n=47) | Riedl 2026, [DOI](https://doi.org/10.1080/10615806.2026.2659809) |
| Hızlı soluma göz hareketlerini bozar | Zayıf (n=13) | Yoshimura 2026 (16b) |
| Telefon mikrofonu burun nefesini 30 cm'den sayabilir | Zayıf (n=10) | Nam 2015, [DOI](https://doi.org/10.1109/JBHI.2015.2480838) |
| Nefes görmeyi/odaklamayı iyileştirir; sakinlik periferik görüşü genişletir | **Kanıt yok** | 16b |

## 3. Modüller (hepsi `src/modules/<id>/` soketine takılır)

### 3.1 `breath-count` — Nefes Sayma Ölçümü · halka: dikkat · tür: ölçüm

Levinson 2014 protokolünün kısaltılmış uyarlaması. Orijinal 15–18 dk; bizde **3 dk** (ilk hafta) ve
**5 dk** (sonra). **VARSAYIM:** kısaltılmış sürenin güvenirliği orijinalden düşük olabilir; bunu
"alışma dönemi" ve haftalık trend mantığıyla (görme testindeki gibi) telafi ederiz, tek seansa karar
bağlamayız.

Akış:
1. Ekran boş, sesler kapalı. "Nefesini say. Her nefeste ekrana dokun; **dokuzuncu** nefeste basılı
   tut. Sayıyı kaybedersen 'Kaybettim'e bas, birden başla."
2. Her 60–120 sn'de bir soru belirir (rastgele): **"Az önce dikkatin neredeydi?"** 1 = tamamen
   nefeste … 6 = tamamen başka yerde. Ardından **"Kaçtaydın?"** (sayı sorgusu).
3. Bitişte üç sayı ve tek cümle.

Ölçülenler (Levinson formülüyle):
- **Doğruluk %** = 100 − (yanlış 9'lar + yanlış sayı cevapları + kaybettim) / toplam set.
- **Fark edilmeden kaçırma** (yanlış 9) ve **kendi yakaladığı** (kaybettim) ayrı sayılır
  (Wong 2018: ilki dikkat kopması, ikincisi zihin gezinmesi).
- **Zihin gezinmesi puanı**: sorulara verilen ortalama (1–6).
- **Dokunuş düzensizliği**: dokunuş aralıklarının değişim katsayısı (Treves 2026'nın sinyali).
  VARSAYIM: eşik yok, yalnızca kişinin kendi trendi.
- Referans: Levinson'da ortalama hata %16–22, hataların %29–35'i kendi yakalanan. Kullanıcıya
  "insanların çoğu ilk seansta her 5 setten birini kaçırır" diye anlatılır; sıralama/etiket yok.

Gelişim: haftalık tek ölçüm (görme testi takvimiyle aynı ritim). İlk 3 seans "alışma dönemi", sonra
7 seans ortancası referans, sonrası trend. Rozet: "Nefes sayma · %78".

### 3.2 `breath` — Nefes Pratiği · halka: yaşam · tür: pratik (günlük hedefe sayılır)

Kalıplar:

| Kalıp | Varsayılan mı | Süreler | Dayanak |
|---|---|---|---|
| **Sakin ritim** | Evet | 4 sn al / 6 sn ver (6/dk). İlk 3 gün 3,5/4,5 (~7,5/dk), sonra 4/6 | Marchant 2025 (4:6 koşulu); You 2021: ilk seanslarda nefes darlığı hissi → kademe (16a) |
| **Uzun veriş** | Hayır | 2 kısa alış (burun) + uzun veriş (ağız), ~5 dk | Balban 2023 |
| **Kutu** (al / tut / ver / bekle) | Hayır | 4-4-4-4; her aşama 3–6 sn ayarlanabilir; tutma ≤7 sn | Marchant 2025 zayıf; Balban'da 3–10 sn kişiye göre. VARSAYIM: 7 sn üst sınır |
| **Özel** | Hayır | Kullanıcı 4 aşamayı kendisi kurar (rakip ekranındaki gibi, ±) | — |
| 4-7-8 | Yok | — | Kanıtı zayıf, 7 sn tutma |
| Hızlı / derin soluma | Yok | — | Panik tetikleyebilir (Nardi 1999/2002); göz hareketini bozar (Yoshimura 2026) |

Seans: 1 / 3 / 5 dk. Önce "Şu an ne kadar sakinsin? 1–5", sonra aynı soru. Kayıt: kalıp, süre,
önce/sonra sakinlik, tamamlandı mı, "zorlandım" işareti. Sesli aşamalar ("Nefes al… tut… ver…
bekle") + aşama başına farklı titreşim + genişleyip daralan daire. Ses düğmesi (SoundToggle) var.

Sınır: "5 dk × 28 gün" bir **program** olarak sunulur (Balban 2023); tamamlanan gün sayısı takip
edilir. Sakinlik puanındaki değişim yalnızca kişinin kendi verisi olarak gösterilir, iddia olarak
değil.

### 3.3 `routine` — 4. set: **Derin** (mevcut egzersiz modülünün içinde)

Hafif / Normal / Tam aynen kalır. Yeni set: 60 sn Sakin ritim → göz adımları → her 2 adımda 3
nefeslik mola → 60 sn Sakin ritim. Toplam ~5 dk. Nefes adımı `EXERCISES` içine yeni bir hareket
türü (`visual: 'breath'`) olarak girer; sensörü yok (süreyle sayar). VARSAYIM: mola sayısı ve yeri.

### 3.4 Ölçüm testlerinin **önüne nefes konmaz**

İki sebep: (1) 1 dk nefes egzersizi sonrası tepki süresi uzuyor (Riedl 2026), Hızlı Bakış'ı bozar;
(2) görme testi koşulunu değiştirmek eski ölçümlerle karşılaştırmayı bozar (gözlük kuralıyla aynı
mantık). Testler arasına nefes de konmaz; test dizisi bir bütün olarak kalır.

### 3.5 `notice-breath` — Günlük görev: "Nefesini fark et" · halka: yaşam

Günde 3 kez bildirim; kullanıcı o an tek dokunuşla "fark ettim, sakin / hızlı / tuttum" der.
Riedl 2026'nın "gerçek hayatta, anında" yaklaşımı; kanıt pilot düzeyinde, bu yüzden **pratik**
olarak sunulur, ölçüm olarak değil. Farkındalık halkasındaki "3 kırmızı şey fark et" göreviyle
aynı motora bağlanır (ileride).

### 3.6 Dersler (ders motoru gelince, 3 ders)

1. **"Dikkatin nereye kaçıyor?"** — zihin gezinmesi günlük hayatın %30–50'si (Levinson'ın girişindeki
   alıntı; kaynağı ders yazılırken ayrıca doğrulanacak), nefes sayma neden ölçer.
2. **"Göz bebeğin nefesinle oynar"** — Schaefer 2025. Tedavi iddiası yok; "bedenin tek sistem"
   anlatısı.
3. **"Yavaş nefes ne yapar, ne yapmaz"** — Laborde 2022 / Fincham 2023 / Marchant 2025; kutu ve
   4-7-8 efsaneleri; "Navy SEAL" ve "Weil" iddialarının kaynağı yok.

Her dersin sonunda **Kanıt kartı** (kaynak, tasarım, n, tek satır bulgu) — atlas ekran 46 ile aynı
biçim.

## 4. Gelişim ekranı entegrasyonu

- Yeni kutucuk: **Nefes sayma · %** (trend çizgisi, alışma/başlangıç/izleme aşamaları).
- Yeni kutucuk: **Nefes dakikası** (haftalık toplam) ve **sakinlik değişimi** (önce→sonra ortalaması).
- Takvim: nefes seansı günü işaretlenir; günlük 3 dk hedefine sayılır (Derin set de sayılır).
- Jev (koç) özet sayılara nefes sayma doğruluğunu ekler; kamera/ses verisi asla eklenmez.

## 5. Güvenlik ve ifade

İlk açılışta bir kez, sonra Bilgi'de:

> "Bu alıştırma tıbbi bir uygulama değildir. Baş dönmesi, karıncalanma, nefes darlığı ya da
> huzursuzluk hissedersen normal nefesine dön. Nefes tutma bölümleri isteğe bağlıdır; zorlanırsan
> atla. Gebelik, kalp veya akciğer rahatsızlığı, glokom, nöbet öyküsü, panik atak ya da başka bir
> ruhsal sağlık durumun varsa nefes tutmalı kalıplardan önce hekimine danış. Araç kullanırken, suda
> veya ayaktayken yapma."

Söyleriz: "nefesini yavaşlatma pratiği", "dikkatini nefesine verme alıştırması", "ne kadar pratik
yaptığını ve sayma doğruluğunu ölçüyoruz". Bilgi sayfasında kaynakla: "araştırmalarda yavaş nefes
sırasında kalp ritmi değişkenliğinin arttığı gözlenmiştir".

Söylemeyiz: tedavi eder, tansiyonu düşürür, vagusu aktive eder, HRV'ni yükseltir (ölçmüyoruz),
stresi %X azaltır, bilimsel olarak kanıtlanmış, Navy SEAL tekniği, uykuya daldırır, gözüne iyi gelir.

## 6. Sensörler: neden v1'de yok

- Biyogeri bildirim ekranı eklemek 6/dk nefesin etkisine ek katkı yapmadı (Laborde 2022,
  Psychophysiology, n=112; 16a). Sensörsüz v1 bilimsel olarak eksik değil.
- **v2 (mikrofon + ARKit):** burun nefes sesi zarfı (Nam 2015) + baş/yüz mesafesi salınımı →
  "ritimdesin / değilsin" geri bildirimi. Ses cihazda işlenir, kaydedilmez; anons sırasında dinleme
  durur. Nefes hızı yalnızca iç doğrulamada hata ≤2 nefes/dk tutarsa gösterilir. App Store 1.4.1:
  yöntem açıklaması zorunlu. Nefes hızı Sağlık uygulamasına **yazılmaz** (5.1.3).
- **v3 (Apple Watch):** canlı nabız için ayrı watchOS uygulaması + workout mirroring gerekiyor
  (16c). Solunum hızını saat pratikte yalnızca uykuda kaydediyor. v2 sonucuna göre karar.
- Sağlık uygulamasına "Farkındalık dakikası" yazma: v2'de, `@capgo/capacitor-health` ile.

## 7. Yapım sırası (her adım ayrı TestFlight)

1. **Nefes motoru** (`lib/breath.js`, saf): kalıp tanımları, aşama zamanlayıcı, kademe mantığı,
   seans kaydı; testler.
2. **`breath` modülü**: ekran (daire animasyonu, sesli aşamalar, titreşim, ses düğmesi), sakinlik
   soruları, güvenlik ekranı, Gelişim kutucukları.
3. **Nefes sayma motoru** (`lib/breathCount.js`, saf): 1–9 sayım makinesi, hata sınıflandırma,
   Levinson doğruluk formülü, sorgu zamanlayıcı, dokunuş düzensizliği; testler.
4. **`breath-count` modülü**: ekran, sonuç, trend, alışma dönemi.
5. **Derin set** (routine içine `breath` adımı).
6. **Dersler** (ders motoru hazır olunca) ve kanıt kartları.
7. `notice-breath` günlük görev (Farkındalık günlük görev motoruyla birlikte).

## 8. VARSAYIMLAR (cihazda/kullanıcıda doğrulanacak)

- Nefes sayma 3/5 dk kısaltması; sorgu sıklığı 60–120 sn (Levinson ile aynı).
- Sakin ritim kademesi: 3 gün 3,5/4,5 → 4/6.
- Kutu aşama sınırları 3–6 sn, tutma ≤7 sn.
- Derin set yapısı (60 sn + molalar + 60 sn).
- Alışma dönemi 3 seans, referans 7 seans (görme testi kuralından kopya).
- Dokunuş düzensizliği için eşik yok; yalnızca trend.

## 9. Kullanıcıdan onay bekleyen kararlar

1. Nefes sayma ölçümü **dikkat halkasının ana ölçümü** olsun mu (görme testinin farkındalıktaki
   karşılığı)?
2. Nefes Pratiği yaşam halkasında, Derin set egzersizlerde — yerleşim uygun mu?
3. Testlerin önüne/arasına nefes koymama kararı.
4. Kutu (4 aşamalı) isteğe bağlı, varsayılan Sakin ritim.
5. Sırayla: 1–2 (Nefes Pratiği) mi önce, 3–4 (Nefes Sayma) mı? Önerim: **3–4 önce**, çünkü ölçüm
   olmadan pratiğin etkisini izleyemeyiz.
