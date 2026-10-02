# Okuma ve Anlama · ara rapor 1: araştırma ve sahibe sorular (2026-10-01)

Bu oturum yalnız tasarım, plan, metin bankası taslağı, maket ve ana oturum istemini yazar. Uygulama kodu yazılmaz.
Bitiş saati: her aşama en çok 90 dk (IS_AKISI_KURALLARI madde 1). Modül adı henüz yok; burada "Okuma ve Anlama" yalnız
çalışma adıdır, ad kapıdan ve sahipten geçer.

## 1. Okunanlar
- `SAHIP_ISTEGI.md`, `sahip-ekran/` üç görüntü: metin ekranı, soru ekranı, sonuç penceresi.
- `IS_AKISI_KURALLARI.md` tamamı; `HATA_GUNLUGU.md` başlıkları (kaynak ezberden yazılmaz, "bitti" demeden her durum
  görülür: Bug 18).
- `modules/reading/manifest.js`, `lib/reading.js` analiz bölümü, `reading-cps` geçen bütün yerler.
- `gelisim-merkezi/DENETIM.md` Ö-4.
- Alt ajan özeti, dosya ve satırla: `registry.js` sözleşmesi, `tek-bakis` örneği, `progress.js` v2, `changeText.js`
  `DIGITS`, `growthCenter.js`, `ladders.js`, `progression.js`, `moduleRemind.js`, `remindTexts.js`, `notifyApply.js`,
  `nef.contract.test.js`, `nef/PLAN.md` §4.8, `sources.js`.
- `claude/metin-arama` dalı: `SAHIP_ISTEGI.md`, `ARA_RAPOR_1.md`, `arastirma/KAYNAKLAR.md`.
- Bakmadığım: `N1-CUMLELER-onay.md` içeriği, `lib/nef/bank/tr.js` cümleleri, `fark-ettin-mi` plan dalı. Plan aşamasında
  okunacak.

## 2. Örnek uygulamadan alınan yalnız mantık
Kişi metni okur, bitince dokunur, hızı ölçülür; metin kalkar, sorular gelir; sonuçta hız ve anlama görünür.
Alınmayanlar: ad ("k/d-Test" dahil), yeşil turuncu düzen, "Metni okuyunuz…" satırı, "Bitti" ve ok düğmesi, yıldızlar,
"Tamamlandı" penceresi, çizgi grafik, "hafıza kapasitesi" sözü, Vikipedi metinleri ve lisans satırı.

## 3. Var olan okuma işleriyle ilişki
- **Okuma testi** (`reading`, Göz alanı, `tests` deposu): sesli okuma, yazı her adımda küçülür; ana sonuç rahat okunan
  en küçük yazı. İçerde k/dk hesaplanır (`maxReadingSpeed`) ve Nef'in `readingWpm` sinyali buradan gelir.
- **`reading-cps`**: "critical print size", yani rahat okunan en küçük yazı, logMAR. Tanımlı, kayıtlı değil (Ö-4 açık).
  Adı "karakter/saniye" gibi okunabiliyor; yeni modül bu anahtara ve `reading` kimliğine dokunmaz.
- **Yeni modül** başka bir şeyi ölçer: sabit, rahat yazı boyunda **sessiz** paragraf okuma hızı ve anlama. Önerilen yer:
  Dikkat alanı (`progress.domain: 'focus'`), kayıt `sessions` deposunda.
  - Böylece Nef'te `metricChange` anı açılabilir. `tests` deposundaki modüllere yalnız ilk kayıt ve uzun ara anı
    izinli (sözleşme testi satır 169–180).
  - İki hız karışmaz. Okuma testi hızı yazı boyu merdiveninde sesli; bu modülün hızı sessiz ve anlamaya bağlı.
    Ölçü anahtarları ayrı: VARSAYIM `okuma-anlama-hiz` ve `okuma-anlama-dogru`.
  - Nef'in `readingWpm` sinyali okuma testinde kalır.
  - Metinler ayrı: okuma testinin `r01…` cümleleri kullanılmaz.

## 4. Bilimden çıkan yön
Kaynaklar: `arastirma/KAYNAKLAR.md`.
1. **Dürüst ölçü:** hız ile anlama takas edilir. Hızlı okuma kursiyerleri daha hızlı okudu, daha az anladı (miyata2012,
   rayner2016). Bu yüzden hız serisine yalnız anlama eşiğini geçen okumalar girer. VARSAYIM eşiği: 4 sorunun en az 3'ü.
   Eşik altındaysa sonuç "hız sayılmadı, anlama düşük" der.
2. **Eşdeğer metin:** tekrar ölçüm için uzunluk, zorluk ve yapı eşlenmiş çok sayıda metin gerekir (trauzettel2012).
   Telefonda düzen ve yazı boyu her seferinde aynı olmalı (schneps2013).
3. **Gerçekçi sınır:** sessiz okuma ortalaması 240–260 k/dk (kuperman2021). VARSAYIM: 600 k/dk üstü "göz gezdirme"
   sayılır, seriye girmez.
4. **İddia yok:** "okuma hızını artırır" yazılmaz.
5. **Türkçe notu:** Türkçe kelimeler ekli ve uzun; k/dk İngilizce ortalamalarla karşılaştırılmaz. Kişi yalnız kendi
   başlangıcıyla karşılaştırılır (v2 kuralı zaten böyle).

## 5. Metin bankası ve Metin Arama
- Metin Arama 10 PubMed bulgusunu doğruladı. Öneri: **ortak bulgu bankası, ayrı metinler.**
  - Bir bulgu kaydı tektir: PMID, DOI, özete göre bulgu.
  - Her modül kendi metnini kendi kuralıyla yazar. Metin Arama 50–70 kelime yazıyor; bu modül 110–130 kelime ve 4 soru.
  - Aynı bulgu iki modülde aynı haftada çıkmaz.
  - Karar ana oturumda. Karar gelene kadar bu oturum o 10 bulguyu kullanmaz.
- Tekrar etmeme: kişi bir metni banka bitmeden ikinci kez görmez. Soru sırası ve şık sırası karışır.
  - Uzun tohumlu benzetimle sınanır: bir kişi her gün bir metin okur, 365 gün boyunca tekrar yok.
  - VARSAYIM banka büyüklüğü: ilk sürüm 120 metin, yani dört ay her gün yeni. Hedef 365.
- Metin üretimi için ücretli model çağrısı yok. Metinleri ben yazarım; her PMID ve DOI PubMed aracıyla çekilir.

## 6. Gelişim, Nef, hatırlatma bağı: ilk taslak
- `progress.metrics`:
  - Hız, birim `k/dk`, `better: 'up'`.
  - Anlama, birim `%`, `better: 'up'`.
  - VARSAYIM: `k/dk` birimi bugün yok. `changeText.js` `DIGITS` ve `progress.js` `UNIT_SD_FLOOR` satırları gerekir;
    Gelişim sahibiyle sıraya konur.
- `remind`: `{ route, window: 'calm', science: [rayner2016] }`. Sahip onaylı 3 bildirim cümlesi ve `NAMES` satırı gerekir.
- `nef`:
  - Ad çekimleri.
  - `metricWords`.
  - Anlar: `metricChange`, `firstTime`, `returnAfterGap`.
  - Kanıt.
  - Sözleşme testindeki 21 onaylı ad listesine yeni ad eklenir.

## 7. Sahibe sorular ve cevaplar (2026-10-02)

Sahibin cevabı, kelimesi kelimesine: "1 evet 2 önerin 3 bilmiyorum etkilesin kullanıcyı 5sn kuralı 4 olabilir 5
olabilir... 5 sn ve mükemmlik kuralı..."

| # | Soru | Karar |
|---|---|---|
| 1 | Her metinden sonra 4 soru mu? | Evet, 4 soru |
| 2 | Okurken göz takibi | Önerim: ilk sürümde kamera yok. Kamera açılmaz, görüntü alınmaz |
| 3 | Sorular gelince metin kalkar mı? | Sahip karar vermedi: "kullanıcıyı etkilesin, 5 sn kuralı". Benim kararım: metin kalkar. Ölçüm dürüstlüğü için gerekli; yoksa sorular aramaya döner ve anlama değil bulma ölçülür (miyata2012 yöntemi: okuduktan hemen sonra soru). Geçiş 5 saniye kapısından geçer |
| 4 | İlk sürüm 120 metin | Olabilir: 120 |
| 5 | Dört seçenekli soru, tuzaksız | Olabilir: 4 seçenek, "hangisi yanlıştır" yok |

Hepsine bağlı kural: 5 saniye ve mükemmellik.

## 8. Sahip kararı (2026-10-02, kapı yöntem 2'den sonra)
Soru:
- Modül adı "Oku ve Anla" uygun mu?
- Yol 1: kalan altı küçük düzeltme ve son bir kapı turu. Yol 2: tasarımı baştan kurmak.

Sahibin cevabı, kelimesi kelimesine: "UYGUN".

Kararlar:
- Modül adı **Oku ve Anla**, onaylı.
- VARSAYIM: cevap önerilen yol 1'i de kapsıyor. Sahibe bildirildi.

## 9. Sahip kararı (2026-10-02, son kapı turundan sonra)
Soru:
1. Soru ve sayılmadı ekranları düzeltilip yalnız onlar için bir kapı turu daha açılsın mı?
2. İlk 10 metnin üslubu onaylı mı?

Sahibin cevabı, kelimesi kelimesine: "ONAY".

Kararlar:
- İki ekran için bir kapı turu daha açılacak.
- `banka/taslak-01.json`'ın üslubu onaylı. Kalan 110 metin aynı üslup ve kurallarla 10'arlı takımlar hâlinde yazılır.
  Metinler koda girmeden önce yine sahip onayına sunulur.

## 10. Sahip kararı (2026-10-02)
- Sayılmadı ekranının son hâli sahip onaylı: "OK ONAYLIYORUM".
- Beş ekranın tasarımı tamam; kayıtlar `kapi/`.

## 11. Sahip kararı (2026-10-02, banka bittikten sonra)
Soru:
1. Takım 2–12'deki 110 metin onaylı mı? Özellikle sorulanlar: vombat dışkısı metni ve penguen metni.
2. `METINLER.md` §5'teki ekran, Nef ve hatırlatma cümleleri onaylı mı?

Sahibin cevabı, kelimesi kelimesine: "Onay".

Kararlar:
- 120 metnin hepsi onaylı; vombat ve penguen metinleri de dahil.
- §5'teki ekran, Nef ve hatırlatma cümleleri onaylı.
- Not: Nef ve hatırlatma cümleleri ayrıca bir 5 kişilik metin kapısından geçmedi; sahip doğrudan onayladı.
