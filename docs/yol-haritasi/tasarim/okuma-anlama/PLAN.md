# Oku ve Anla · plan (taslak, 2026-10-02)

Yeni modül: kişi kısa bir bilim metni okur, "Bitirdim"e dokunur, okuma hızı kelime/dakika ölçülür, metin kalkar,
dört soru gelir. Sonuçta hız ve anlama birlikte görünür.
- Modül adı **Oku ve Anla**, sahip onaylı. Öteki görünür metinler `METINLER.md`'de taslaktır ve sahip onayı bekler.
- Kaynaklar `arastirma/KAYNAKLAR.md`'de.
- Sahibin cevapları `ARA_RAPOR_1.md` §7'de.

## 1. Sahibin istekleri ve karşılığı

| İstek | Plandaki karşılığı |
|---|---|
| Kişi asla sıkılmaz, metin her seferinde farklı | 120 metin; banka bitmeden tekrar yok; soru takımı ve şık sırası her turda değişir (§4) |
| Tekrar etmeme testle kanıtlanır | Uzun tohumlu benzetim testi (§4.3) |
| PubMed'den ilgi çekici çalışmalar, kopya değil | Her metin tek PubMed kaydı, PMID + DOI; Nefona'nın kendi Türkçesi (`METINLER.md` §1–2) |
| Lisans sorunu yok | O uygulamanın adı, görseli, düzeni, puanı, yıldızı, Vikipedi metni alınmadı (`ARA_RAPOR_1.md` §2) |
| Dürüst ölçü: anlama düşükse hız iyi sayılmaz | Hız serisine yalnız geçerli okuma girer (§3.2) |
| Gelişim, Nef, modül uyumu | `progress.metrics` iki ölçü; manifest `nef`; sözleşme testi (§5) |
| Göz takibi | Sahip kararı, önerim: ilk sürümde kamera yok (§6) |
| İsteğe bağlı hatırlatma | Manifest `remind` (§5.3) |
| 5 saniye ve mükemmellik | Her ekran kapıdan geçer (§7) |

## 2. Var olan okuma işleriyle ilişki
- **Okuma testi**, `reading`: Göz alanında, `tests` deposunda. Sesli okunur, yazı küçülür, ana sonuç rahat okunan en
  küçük yazıdır. Dokunulmaz.
- **`reading-cps`**: rahat okunan en küçük yazı, logMAR. Ö-4 açık kalır. Bu modül o anahtara ve `reading` kimliğine
  dokunmaz.
- **Nef `readingWpm`**: okuma testinin hızıdır, orada kalır. Bu modül Nef'e kendi ölçüleriyle girer.
- **Bu modül**: sabit yazı boyunda sessiz okuma ve anlama. Dikkat alanı, `sessions` deposu.
  - Kimlik: VARSAYIM `okuma-anlama`.
  - Ölçüler: `okuma-anlama-hiz` ve `okuma-anlama-anlama`.
- İki modül birbirinin metnini kullanmaz.

## 3. Akış ve ölçüm

### 3.1 Akış
1. **Giriş:** bugünün metninin başlığı ve kelime sayısı, "Okumaya başla".
2. **Okuma:**
   - Metin tek blok, sabit yazı boyu.
   - Süre, metnin ilk çizildiği karede başlar ve "Bitirdim"e dokununca durur.
   - Ekranda saat görünmez; kişi yarışmaz, kendi hızında okur.
3. **Sorular:**
   - Metin kalkar.
   - Dört soru tek tek gelir, her biri dört seçenekli.
   - Seçimden sonra doğru seçenek yeşil olur; yanlış seçilen kırmızı kenar alır.
   - Geri dönüş yok, metne dönüş yok.
4. **Sonuç:**
   - Hız, anlama ve hüküm.
   - Kaynak satırı PubMed'e açılır.
   - "Bana hatırlat" satırı.
   - "Bitti".

### 3.2 Hesap
- `kelime = metin.trim().split(/\s+/).length`, bankadaki metnin kendisinden.
- `hiz = round(kelime / (ms / 60000))`, birim kelime/dk.
- `anlama = dogru / 4`. Seride yüzde olarak tutulur: 0, 25, 50, 75, 100.
- **Geçerli okuma**, yani hız serisine giren okuma, şu koşulların hepsini ister:
  - `dogru ≥ 3`
  - `60 ≤ hiz ≤ 600`
  - Okurken uygulama arka plana geçmedi (`visibilitychange`).
  - Yazı boyu, kişinin önceki okumalarıyla aynı.
- Sayılmayan okumada sonuç ekranı nedenini söyler. Neden kodları: `dusuk-anlama`, `cok-hizli`, `cok-yavas`, `ara`.
- Gerekçe:
  - Hız–anlama takası (miyata2012, rayner2016).
  - Sessiz okuma ortalaması 240–260 k/dk (kuperman2021). VARSAYIM: 600 üstü göz gezdirme, 60 altı dalgınlık sayılır.
  - Eşikler pilotla kesinleşir.
- **Anlama serisi** her tamamlanan okumayı alır. Yalnız `ara` nedeniyle kesilen okuma girmez, çünkü soru sorulmamıştır.

### 3.3 Yazı boyu
- Metin 19 pt, satır yüksekliği 1,62. 320 genişlikte 18 pt.
- Sistem yazı boyu büyükse metin de büyür; o boy oturum kaydına yazılır, `fontScale`.
- Hız serisi yalnız son okumanın boyundaki okumaları alır. Okuma testinde gözlük koşulu da böyle seçiliyor
  (`sameCondition`). Satır uzunluğu hızı değiştirir (schneps2013).

### 3.4 Oturum kaydı (`sessions`)
```
{ type: 'okuma-anlama', date, textId, cycle, words, chars, ms, wpm, correct, total: 4,
  qIds: ['oa001-q0', 'oa001-q3', …], valid: true|false, reason: null|'dusuk-anlama'|'cok-hizli'|'cok-yavas'|'ara',
  fontScale, seconds }
```

## 4. Metin seçimi ve tekrar etmeme

### 4.1 Seçim
- Kişiye özgü tohum: kurulum kimliğinden `seedHash` (`lib/progression.js`).
- Banka bu tohumla karılır, Fisher–Yates; kişinin "okuma sırası" çıkar.
- Sıradaki metin, bu sıranın henüz okunmamış ilk metnidir.
  - Yarıda bırakılan metin okunmuş sayılmaz, ertesi gün yine gelir.
  - Bitirilmiş metin bir daha seçilmez.
- Banka bitince yeni tur, `cycle + 1`: yeni tohumla yeni sıra.
  - Son 30 okunan metin yeni turun ilk 30 sırasına konmaz.
  - Soru takımı değişir: önceki turda sorulmayan ayrıntı soruları önce gelir.
- Arka arkaya iki metin aynı konu etiketinde olmaz: `kus`, `memeli`, `deniz`, `bocek`, `bitki`, `insan`… Etiket
  bankada tutulur. VARSAYIM: etiket alanı ikinci takımda eklenir.

### 4.2 Soru seçimi
- Ana fikir sorusu her turda sorulur.
- 5 ayrıntıdan 3'ü `seedHash(textId + cycle)` ile seçilir.
- Sorular ve şıklar `seedHash(textId + cycle + soru)` ile karılır.
- Doğru seçeneğin yeri dört konuma eşit dağılır; benzetimle sınanır.

### 4.3 Kanıt testi (ana oturum yazar)
- `okumaAnlama.select.test.js`, 1 000 tohum. Her tohum için 365 gün, gün başına bir okuma, rastgele %10 yarıda bırakma.
- Beklentiler:
  1. Bir turda hiçbir metin iki kez bitirilmez.
  2. 120 bitirilen okumadan önce tekrar yok.
  3. Tur geçişinde son 30 metin ilk 30'da yok.
  4. Ardışık iki metin aynı etikette değil.
  5. Doğru seçeneğin konumu dört yere %25 ± 2 dağılıyor.
  6. Aynı metin iki turda aynı soru takımıyla gelmiyor.
- Tohumlar sabit listede tutulur; test her koşuda aynı sonucu verir.

## 5. Bağlar

### 5.1 Gelişim (`progress`, ölçü kuralı v2)
```
progress: { domain: 'focus', metrics: [
  { key: 'okuma-anlama-hiz', label: 'Okuma hızı', unit: 'kelime/dk', better: 'up',
    v2: { familiar: 2, baseDays: 3, currentDays: 3, sdFloor: 10 },
    series: geçerli okumalar, son okumanın fontScale'ıyla → { date, value: wpm } },
  { key: 'okuma-anlama-anlama', label: 'Anlama', unit: '%', better: 'up',
    v2: { familiar: 2, baseDays: 3, currentDays: 3, sdFloor: 10 },
    series: tamamlanan okumalar → { date, value: correct * 25 } },
] }
```
- `familiar: 2`: ilk iki okuma alışmadır, sayılmaz. Kişi önce düzeni öğrenir.
- `baseDays: 3`: başlangıç sonraki üç okuma günüdür. Sonuç ekranındaki "{k} / 5" buradan gelir: 2 alışma + 3 başlangıç.
  VARSAYIM: bu değerler Gelişim sahibiyle kesinleşir.
- Bağlantı satırı, Gelişim sahibiyle sıraya konur:
  - `changeText.js` `DIGITS['kelime/dk'] = 0`.
  - `progress.js` `UNIT_SD_FLOOR['kelime/dk'] = 10`.
- Değişim sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli değil", "başlangıç". "Beyin" ve
  "tanıma" geçmez.

### 5.2 Nef (`nef`)
```
nef: {
  name: { tr: { '': 'Oku ve Anla alıştırması', ABL: 'Oku ve Anla alıştırmasından', ACC: 'Oku ve Anla alıştırmasını',
               LOC: 'Oku ve Anla alıştırmasında', DAT: 'Oku ve Anla alıştırmasına', INS: 'Oku ve Anla alıştırmasıyla' } },
  metricWords: { tr: { 'okuma-anlama-hiz': { word: 'okuma hızın', unit: 'kelime/dk' },
                       'okuma-anlama-anlama': { word: 'anladığın soru', unit: '%', percent: true } } },
  moments: ['metricChange', 'firstTime', 'returnAfterGap'],
  evidence: ['rayner2016', 'miyata2012'],
  note: 'Oku ve Anla: kısa bilim metninde sessiz okuma hızı ve anlama; hız yalnız anlama ≥ 3/4 iken sayılır.',
}
```
- Ad, sözleşme testinin onaylı ad listesine eklenir (`nef.contract.test.js` APPROVED_NAMES).
- Her an için sahip onaylı en az bir cümle `lib/nef/bank/tr.js`'e girer. Taslaklar `METINLER.md` §5'te.
- Anlam kuralı: Nef hız artışını yalnız anlama serisi "değişim yok" ya da "başlangıcından iyi" iken söyler. Anlama
  düşerken hız artışı övülmez.

### 5.3 Hatırlatma (`remind`)
```
remind: { route: 'okuma-anlama', window: 'calm', science: ['rayner2016'], doneToday: bugün bir okuma bitti mi }
```
- `remindTexts.js` `TEXTS['remind.okuma-anlama']`: sahip onaylı 3 cümle, `METINLER.md` §5. `NAMES` satırı da eklenir.
- Cümleler önce `bildirim-hava-yuruyus/metin-B1a-onay.md`'ye yazılır.
- Modül sonundaki "Bana hatırlat" satırı `ctx.remindField('okuma-anlama', { inPath })` ile gelir.

### 5.4 Kaynaklar (`sources.js`)
- Yeni girdiler: `rayner2016`, `kuperman2021`, `miyata2012`, `trauzettel2012`. Biçim: authors, year, title, titleTr,
  journal, cite, doi, pmid, design, n, finding, limit.
- Metin kaynakları `sources.js`'e girmez; banka dosyasında PMID, DOI, yazar, dergi ve yıl olarak durur. Sonuç
  ekranındaki satır bunları gösterir; dokununca `https://pubmed.ncbi.nlm.nih.gov/{pmid}/` açılır.

### 5.5 Manifest öteki alanlar
- `ring: 'attention'`, `kind: 'practice'`, `home: { section: 'practice' }`. Sıra numarası ana oturumda verilir.
- `sessions.match`, `countsTowardGoal: true`, `describe` → "{wpm} kelime/dk · {dogru}/4".
- `coach`: `{ wpm7: geçerli okumaların ortancası, comp7: anlama ortancası, reads7: sayı }`.
- `today`: ilk sürümde yok. Modül isteğe bağlıdır; yola girip girmeyeceği sahip kararı.
- `gates.eyeBudget: 'eye'`: okuma göz bütçesinden düşer.

## 6. Göz takibi ve gizlilik
- Sahip önerimi seçti: **ilk sürümde kamera yok.**
- Kamera açılmaz, izin istenmez, görüntü alınmaz.
- Gerekçe: telefon kamerasıyla bakış ekranda yalnız beş bölgeye ayrılabiliyor, satır satır izlenemiyor (HATA_GUNLUGU,
  Bug 17 kaynağı).
- İleride istenirse yalnız "ekrandan uzaklaştın" uyarısı ayrı bir rıza sayfasıyla gelir; görüntü telefondan çıkmaz.

## 7. Tasarım ve kapı
- Maket: `maket/maket.html`. Ekranlar: `?s=giris|metin|soru|sonuc|sayilmadi`, `&theme=light|dark`.
- Çekim: `node maket/cek.mjs <klasör>` her ekranı 390 ve 320 genişlikte, açık ve koyu temada çeker.
- Kapı: beş bağımsız değerlendirici, "5 saniyede etkilendin mi?". En az 4/5 ve en çok iki tur. Kayıt `kapi/`.
- İmza öğesi: kelimelerden iris. Bankadaki başlıklar halka halka bir göz oluşturur, ortada okuyan bir figür. Nefona'nın
  iris dilinden gelir; o uygulamanın düzeniyle ilgisi yok.

## 8. Sıra
1. **Bu oturum:**
   - İlk 10 metin ve kapı.
   - Sahip onayı: ad, görünür metinler, üslup.
   - Kalan 110 metin, 10'arlı takımlarla; her takım denetimden geçer. **Tamam:** 120 metin, hepsi bağımsız doğrulamalı.
   - `ANA_OTURUM_ISTEMI.md`.
2. **Ana oturum:**
   - Bağlantı satırları: Gelişim birimi, kaynaklar, Nef adı ve cümleleri, hatırlatma cümleleri.
   - Modül kodu, seçim testi, sözleşme testleri, gerçek kodla kapı.
3. **Pilot:**
   - Sahip ve birkaç kişi 10 metin okur; metin süreleri toplanır.
   - Sapan metin düzeltilir. 600 ve 60 eşikleri kesinleşir.
