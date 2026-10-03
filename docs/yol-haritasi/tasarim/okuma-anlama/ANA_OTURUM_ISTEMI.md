# Oku ve Anla · ana oturum istemi (sürüm 1, 2026-10-02)

"---" altındaki metin ana oturuma olduğu gibi yapıştırılır. Bu dal (`claude/okuma-anlama`) yalnız tasarım belgesi
içerir; uygulama kodunu ana oturum yazar.

---

# Görev: "Oku ve Anla" modülünü uygula ve Gelişim, Nef, hatırlatma ile tam bağla

Sahibin istediği, kelimesi kelimesine özet: okuma hızı ve anlama alıştırması. Kişi bir metni okur, bitirince hızı
ölçülür, sonra metinle ilgili sorular gelir. Kişi asla sıkılmaz: metin sabit değil, testler tekrar etmez. Metinler
PubMed'deki ilgi çekici çalışmalardan, Nefona'nın kendi Türkçesiyle. Gelişim merkezi, Nef ve modül mükemmel uyumlu.
5 saniye kuralı ve mükemmellik geçerli.

## 0. Önce oku (sırayla)
Tasarım klasörü: `docs/yol-haritasi/tasarim/okuma-anlama/`
1. `PLAN.md` tamamı:
   - §2 var olan okuma işleriyle ilişki
   - §3 akış ve ölçüm
   - §4 tekrar etmeme
   - §5 bağlar
   - §6 kamera yok
2. `METINLER.md`:
   - §1–§4 metin ve soru kuralları
   - §5 görünür metinler
3. `ARA_RAPOR_1.md` §7–§10: sahibin bütün kararları, kelimesi kelimesine.
4. `kapi/` bütün kayıtlar, özellikle `5sn-tur8.md`. Beş ekranın son hâli:
   - giriş 5/5, okuma 4/5, soru 5/5, sonuç 5/5
   - sayılmadı: sahip onayı
5. `maket/maket.html`:
   - Ekranlar: `?s=giris|metin|soru|sonuc|sayilmadi&theme=light|dark`.
   - Gerçek kod bu maketin ölçülerini, renklerini ve düzenini izler.
   - `maket/onden.mjs` ön denetim kurallarıdır; aynı kuralları gerçek ekranlarda da çalıştır.
6. `banka/taslak-*.json`, `banka/denetle.mjs`, `banka/DOGRULAMA.md`, `arastirma/KAYNAKLAR.md`.

Uygulama tarafında oku:
- `app/src/modules/registry.js`: sözleşme ve doğrulayıcılar.
- `app/src/modules/tek-bakis/manifest.js`: örnek.
- `app/src/modules/reading/manifest.js`: dokunma; yalnız ilişkiyi anla.
- `app/src/lib/progress.js`: ölçü kuralı v2, `V2_PARAMS`, `UNIT_SD_FLOOR`; manifestteki `v2` önce gelir.
- `app/src/lib/changeText.js` `DIGITS`, `app/src/lib/growthCenter.js`.
- `app/src/lib/progression.js` (`seedHash`), `app/src/lib/ladders.js`.
- `app/src/lib/moduleRemind.js`, `remindTexts.js`, `notifyApply.js`. Modül hatırlatma kimlikleri 7800–7859.
- `app/src/modules/nef.contract.test.js`, `app/src/lib/nef/bank/tr.js`, `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8.
- `app/src/lib/sources.js` biçimi.
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md`.

## 1. Başlarken
- Sahibe bitiş saatini yaz; her aşama en çok 90 dk.
- Aynı anda en çok 2 iş akışı. Ajan süreleri: uygulayıcı 25 dk, inceleyici 15 dk, değerlendirici 3 dk.
- Gelişim, Nef ve bildirim dosyalarına yalnız aşağıdaki **bağlantı satırları** için dokun; o işin sahibiyle sıraya koy.
- **Okuma testi (`reading`) ve `reading-cps` dokunulmaz.** Nef'in `readingWpm` sinyali okuma testinde kalır.
- Görünür her cümle `METINLER.md` §5'ten harfi harfine gelir. Sahip onaylı olanlar (2026-10-02):
  - modül adı
  - ekran, Nef ve hatırlatma cümleleri
  - 120 metnin hepsi
  - beş ekranın son tasarımı

  Yeni ya da değişen her cümle yine taslak → kapı → kendi onayın → sahip yolundan geçer.

## 2. Aşamalar

### O1 · Bağlantı satırları
Sahipleriyle sıraya konur.
- `changeText.js`: `DIGITS['kelime/dk'] = 0`.
- `progress.js`: `UNIT_SD_FLOOR['kelime/dk'] = 10`.
- `sources.js`: `rayner2016`, `kuperman2021`, `miyata2012`, `trauzettel2012`. PMID ve DOI `arastirma/KAYNAKLAR.md`
  §A'dan alınır; `finding` ve `limit` alanları orada.
- `nef.contract.test.js` APPROVED_NAMES: "Oku ve Anla alıştırması". `nef/bank/tr.js`: `METINLER.md` §5'teki sahip onaylı
  Nef cümleleri.
- `remindTexts.js` `TEXTS['remind.okuma-anlama']` ve `NAMES`. Cümleler önce
  `bildirim-hava-yuruyus/metin-B1a-onay.md`'ye sahip onayıyla girer.

### O2 · Metin bankası ve seçim (saf işlevler)
- `app/src/lib/okumaBank.js`:
  - `banka/taslak-*.json` birleştirilir.
  - Her soruda doğru seçenek ilk sırada saklanır; gösterimde karılır.
  - Etiket adları `etiketler` alanından.
- `app/src/lib/okumaSelect.js`, PLAN §4:
  - Kişiye özgü tohum ve okuma sırası; banka bitmeden tekrar yok.
  - Tur geçişinde son 30 metin ilk 30'a girmez. Ardışık iki metin aynı etikette olmaz.
  - Soru takımı: ana fikir sorusu + 3 ayrıntı sorusu. Soru ve şık sırası `seedHash` ile.
  - Yarıda bırakılan metin okunmuş sayılmaz.
- `app/src/lib/okumaMeasure.js`, PLAN §3.2:
  - Kelime sayısı ve hız hesabı.
  - Geçerlilik: `dogru ≥ 3`, `60 ≤ hız ≤ 600`, arka plana geçmemiş, aynı `fontScale`.
  - Sayılmama nedeni kodları.

Bitti şu testler geçince:
- `okumaSelect.test.js`: PLAN §4.3'teki 6 beklenti; 1 000 sabit tohum, her biri 365 gün.
- `okumaMeasure.test.js`: eşik sınırları, `ara`, `fontScale`.
- `okumaBank.test.js`: `denetle.mjs` kurallarının JS karşılığı: uzunluk, 6 soru, 4 seçenek, tekrar PMID yok, yasak
  PMID yok, uzunluk oranı %15–35.

### O3 · Modül
- `app/src/modules/okuma-anlama/manifest.js`, PLAN §5:
  - `progress` iki ölçü, v2 parametreleriyle.
  - `remind`, `nef`, `sessions`, `coach`.
  - `home: { section: 'practice' }`, `gates.eyeBudget: 'eye'`.
  - `today` yok; yola girmesi sahip kararı.
- `view.jsx`: beş ekran, maketin birebir karşılığı.
  - Okuma ekranında süre ilk çizilen karede başlar.
  - "Bitirdim" metnin sonundadır.
  - Saat görünmez.
  - Metin sorularda görünmez; geri dönüş yok.
- Oturum kaydı PLAN §3.4 biçiminde.
- "Bana hatırlat" `ctx.remindField('okuma-anlama', { inPath })` ile.
- Kaynak satırına dokununca `https://pubmed.ncbi.nlm.nih.gov/{pmid}/` açılır.

Bitti şu testler geçince:
- `registry.test.js` ve `nef.contract.test.js` yeşil; yeni modül sözleşmeye uyuyor.
- Benzetim: 8 okuma; 2 alışma, 3 başlangıç, sonra iyileşme. Gelişim "başlangıcından iyi" der. Anlama düşerken hız
  artışını Nef övmez.

### O4 · Gerçek kodla 5 saniye kapısı
- Beş ekran, 390 ve 320 genişlik, açık ve koyu tema; beş bağımsız değerlendirici, en az 4/5.
- Maketle fark varsa önce fark kapatılır.
- `onden.mjs` kuralları gerçek ekranlarda temiz geçmeli. Kurallar: yetim kelime, ayraçla başlayan satır, ölü boşluk,
  çakışma, iç daire, SVG yazı boyu.

## 3. Bitirirken
- Tam test takımı ve derleme bir kez, sonda.
- Sahibe en çok 15 satır rapor.
- Sonra pilot (PLAN §8.3):
  - Sahip ve birkaç kişi 10 metin okur.
  - Metin süreleri toplanır, sapan metin düzeltilir.
  - 600 ve 60 eşikleri kesinleşir.
