# Rakam Avı · ana oturum istemi (sürüm 2, 2026-10-02)

"---" altındaki metin ana oturuma olduğu gibi yapıştırılır.

---

# Görev: "Rakam Avı" modülünü yaz; Gelişim, Nef ve hatırlatmaya tam bağla

Sahibin isteği: rakam ızgarasında aranan 4 haneli sayı dizisini bulma alıştırması. Benzersiz, kopya değil, lisans
sorunu yok: örnek uygulamanın adı, görseli, düzeni, puanı ve yıldızı alınmaz. Gelişim merkezi ve Nef ile tam uyum.
İsteğe bağlı hatırlatma kurulabilir. 5 saniye kuralı ve mükemmellik geçerli.

## 0. Tasarım oturumunda yapılan iş (hazır, yeniden yapma)

Hepsi `claude/sayi-arama` dalında, PR #12, klasör `docs/yol-haritasi/tasarim/sayi-arama/`. Önce bu dalı al
(`git fetch origin claude/sayi-arama`) ya da PR birleştiyse ana daldan oku.

- **Araştırma:** `arastirma/KAYNAKLAR.md`. 14 kaynak; PMID ve DOI PubMed aracıyla tek tek doğrulandı. Ezberden
  denenen bir PMID yanlış çıktı ve elendi; ezberden kaynak yazma.
- **Kararlar** (sahip: "senin önerin olsun", "onay", "ONAY", "OK"): ad **Rakam Avı**; yolda 9. günden, haftada 3 gün;
  geri sayım yok; işaretleme parmağı dizinin üstünden kaydırarak; seviye yok, zorluk sabit (ölçü temiz kalsın);
  ilk 8 günün sonucunda hiçbir kıyas yok.
- **Plan:** `PLAN.md`. Tur yapısı, ızgara üretimi, kayıt biçimi, Gelişim metriği, Nef alanı, hatırlatma, riskler.
- **Metinler:** `METINLER.md`. **S** olanlar sahip onaylı; yalnız onlar koda girer.
- **Maket:** `maket/maket.html?s=<intro|play|found|result1|result2>&theme=<light|dark>`, görüntüler `maket/son/`,
  çekim betiği `maket/cek.mjs`.
- **5 saniye kapısı, dört tur** (`kapi/5sn-tur1.md` … `5sn-tur4.md`):

| Ekran | Sonuç |
|---|---|
| intro (giriş) | geçti, 5/5 |
| found (dizi bulundu anı) | geçti, 5/5 |
| play (kaydırma anı) | geçti, 4/5 |
| result2 (8. günden sonraki sonuç) | geçti, 5/5 |
| result1 (ilk 8 günün sonucu) | **geçmedi**; dört turda da kaldı. Kodda yeniden kapıya girer |

## 1. Önce oku (sırayla)

1. `PLAN.md` tamamı; özellikle §2, §4 (4.1, 4.1b, 4.2, 4.3, 4.4), §5, §5b, §8.
2. `METINLER.md`.
3. `kapi/5sn-tur2.md` sonu ve `kapi/5sn-tur4.md`: **bağlayıcı maddeler**.
4. `arastirma/KAYNAKLAR.md`.
5. Uygulama: `app/src/modules/registry.js` (sözleşme), `modules/tek-bakis/` (örnek manifest ve view), `lib/progress.js`
   (ölçü kuralı v2, `V2_PARAMS`, `UNIT_SD_FLOOR`, `v2Params`), `lib/changeText.js` (`DIGITS`, `TRIM`, `VERDICT_WORD`),
   `lib/growthCenter.js`, `lib/ladders.js` (`UNLOCK`), `lib/progression.js`, `lib/today.js`, `lib/sources.js`,
   `lib/moduleRemind.js` (kimlik `7800 + gün × 20 + sıra`), `lib/remindTexts.js` (`TEXTS`, `NAMES`, `LIMITS`),
   `lib/notifyApply.js`, `components/RemindField.jsx`, `App.jsx` (`remindField`, `REMIND_ROW`, `NOTIFY_PAGE`).
6. `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8, `N1-CUMLELER-onay.md`, `app/src/lib/nef/`.
7. `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md` (Bug 35: `week3` dönüşümü bozulmaz).

## 2. Başlarken
- Sahibe bitiş saatini yaz: her aşama en çok 90 dk. Ajan süreleri: uygulayıcı 25 dk, düzeltici 20, inceleyici 15,
  değerlendirici 3. Aynı anda en çok 2 iş akışı. Her aşama ayrı commit.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka işlerin alanı: yalnız §3 R4'teki bağlantı satırları için dokun.
- Metin Arama da `sn` birimini ve ortak kaynakları (`treisman1980`, `duncan1989`, `wolfe2017`, `wolfe2021`,
  `chun1996`, `sireteanu1995`) istiyor: bunlar **bir kez** girer.

## 3. Aşamalar

### R1 · Saf mantık: `app/src/lib/rakamAvi.js` + `rakamAvi.test.js`
- `makeGrid(seed)`: 8 sütun × 10 satır. Aranan 4 hane: ilk hane 0 değil, art arda aynı hane yok. 5 hedef farklı
  satırlarda; üst 3, orta 4, alt 3 satırdan en az birer hedef. 6 benzer çeldirici (komşu yer değiştirme ya da tek hane
  farkı). Aranan dizi tam 5 kez geçer. Aynı tohum aynı ızgara. Diziler yalnız soldan sağa, tek satırda.
- `resolveSwipe`: 4 haneyi tam kaplayan yatay iz `hit` ya da `wrong`; 1–3 hane `short` (sayılmaz, yanlış da değil).
  Bulunmuş diziye ikinci iz sayılmaz.
- Kayıt (PLAN §4.1): `{ type: 'rakam-avi', date, seed, target, found, targets: 5, wrong, revealed, findMs[], medianMs,
  seconds }`. `findMs`: bir önceki bulma anından parmağın kalktığı ana. `medianMs`: `findMs` ortancası; 2'den az dizi
  bulunduysa `null`.
- Son 14 turda aynı aranan dizi tekrar etmez.
- Bitti: testler geçer; 1000 tohumda her ızgara kurallara uyar.

### R2 · Ekranlar: `modules/rakam-avi/view.jsx`, `screens/RakamAvi.jsx`, `styles/rakamavi.css`
- Maketin tasarım dilini uygula: Onest ve Unbounded, uygulamanın renk değişkenleri, iki tema.
- Akış: giriş → ızgara → 5 dizi bulununca sonuç. "Göster" 90 sn'den önce görünmez; basınca kalan diziler yanar,
  bulunmamış sayılır. Geri sayım yok.
- Kaydırma: iz parmağı izler, kalkınca `resolveSwipe`. Bulununca iz altın olur, aranan kutular kısa altın yanar,
  halka dolar, cihaz izin veriyorsa kısa titreşim; ses yok. `prefers-reduced-motion` iken kıvılcım ve parlama yok.
- **Bağlayıcı maddeler, kapı turlarından:**
  1. Kaydırma izi teal; aranan kutular nötr; kaydırma sırasında eşleşen kutular teal yanar; bulunan altın.
  2. Parmak halkası son haneyi örtmez; açık temada o hane soluklaşmaz.
  3. Kıvılcım süsü komşu rakamların üstüne binmez.
  4. Sonuç ekranında tek büyük sayı: bugünün değeri. Başlangıç ve "bugün" yalnız grafikte etiketli.
  5. Görünür metinde "ortanca" yok. Büyük sayının altında küçük not: turun orta değeri olduğu ve bulunmayan dizinin
     hesaba girmediği (cümle METINLER'de T; kapı → senin onayın → sahip).
  6. **result1 (ilk 8 gün):** kıyas yok, başlangıçtan söz yok. Büyük sayı, kapsüllerde yalnız süreler (dizi yazısı
     tekrar edilmez), Nef satırı, **günün küçük ızgarası 320'de de görünür** (320'de kapsül satırı kalkar), yanlış
     kaydırma sayısı büyük sayının yanında değil ızgaranın altında küçük ve nötr, Bana hatırlat, Tamam.
  7. result2 (8. günden sonra): hüküm sözcüğü ve 14 günlük grafik; grafik yazıları büyük ve okunur; ilk iki
     alışma noktası ya aynı renkte ya da anlamı yazılı.
  8. 320'de hiçbir şey kesilmez, "Tamam" görünür.
- Sonuçta `ctx.remindField('rakam-avi', { inPath })` satırının yeri; yoldan açılınca çıkmaz.
- Kapalı "Bana hatırlat" anahtarı koyu temada görünmüyor: bu `components/RemindField.jsx` ortak bileşeninin sorunu;
  bu modülde düzeltme, bildirim işinin sahibine yaz.
- Bitti: 390 ve 320, iki tema, gerçek kodda ekran görüntüleri ve hareketli kayıt.

### R3 · Manifest: `modules/rakam-avi/manifest.js`
- `id: 'rakam-avi'`, `routes: ['rakam-avi']`, `title` ve `label`: "Rakam Avı", `ring: 'attention'`,
  `kind: 'practice'`, `gates: { eyeBudget: 'eye' }`, `home: { section: 'practice', order }` Tek Bakışta'dan sonra.
- `progress`:
  `{ domain: 'focus', metrics: [{ key: 'rakam-avi-find', label: 'Dizi bulma süresi', unit: 'sn', better: 'down',
  v2: { familiar: 2, sdFloor: 0.3 }, series: ({ sessions }) => … medianMs != null olanlar, saniyeye çevrilmiş, bir
  ondalık }] }`. VARSAYIM: `sdFloor` 0,3; ilk ay gerçek veriyle bakılır. "Dizi bulma süresi" Gelişim'de görünür
  metin: METINLER'e T olarak ekle, kapı ve sahip onayı al.
- `sessions` (`countsTowardGoal: true`, `describe`), `stats` (son süre, 7 günde tur, son turun yanlış kaydırması),
  `coach` (`find7` son 7 günün turlarının ortancası, `rounds7`, `wrong7`).
- `today()`: son 7 günde 3 günden az yapıldıysa 2 dk'lık durak, `slot: 'body'`, `rotate: 'week3'`, yeni glyph
  `grid`. `progression.unlock: { pathDay: 9 }`.
- `remind: { route: 'rakam-avi', window: 'move', science: ['sireteanu1995'] }`.
- `nef: { name: { yalin: 'Rakam Avı', i: "Rakam Avı'nı", e: "Rakam Avı'na", de: "Rakam Avı'nda", den: "Rakam
  Avı'ndan" }, metricWords: { 'rakam-avi-find': { unit: 'saniye' } }, evidence: ['sireteanu1995', 'wolfe2017'],
  note: 'Rakam ızgarasında 4 haneli diziyi bulma; ölçü doğru bulunan dizilerin bulma süresi (sn, düşük iyi).' }`.
  VARSAYIM: `name` alt anahtarlarını `lib/nef/` ek tablosuna göre düzelt; tasarım oturumu Nef kodunu okumadı.
- Bitti: `registry.test.js`, `registry.progression.test.js`, `remindInPath.test.jsx`, `pathModules.equiv.test.js` geçer.

### R4 · Bağlantı satırları (sahipleriyle sıraya koy)
- `changeText.js`: `DIGITS.sn = 1`, `TRIM`'e girmez. `progress.js`: `UNIT_SD_FLOOR.sn = 0.3`. Metin Arama ile ortak.
- `ladders.js`: `UNLOCK['rakam-avi'] = 9`.
- `sources.js`: KAYNAKLAR A ve B bölümü; `finding` yalnız METINLER'de S olan cümlelerden. Başlığında "brain" geçen
  kaynakların `titleTr`'si "beyin" sözcüğü olmadan.
- `remindTexts.js`: `'remind.rakam-avi'` üç cümle (METINLER H, S olunca), `NAMES['rakam-avi'] = 'Rakam Avı'`.
- `lib/nef/bank`: `rakam-avi` hücreleri; onaylı N1 burada.
- Bitti: Nef sözleşme testi bu modül için geçer (an üretilir, çekim doğru, `evidence` PMID ve DOI'li, onaylı hücre var).

### R5 · Kapı ve cihaz
- 5 saniye kapısı gerçek kodda (§5): her ekran; result1 öncelikli.
- Cihazda: kaydırma 320'de rahat mı, titreşim, iki tema, yolda 9. gün açılışı, hatırlatmanın kurulup gelmesi.

## 4. Metinler
- Yalnız **S** olanlar harfi harfine girer. Bugün S olanlar:
  - Ad: Rakam Avı
  - Giriş: Dikkat · arama / 2 dk · 5 dizi / Bu diziyi bul / Izgarada 5 kez saklı. Bulunca parmağını üstünden kaydır. /
    adımlar: Diziye bak · Izgarada ara · Üstünden kaydır / Geri sayım yok. Her tur yeni bir ızgara. / Başla
  - Oyun: Aranan / {k} / 5 / Buldun · {t} sn / Kendi hızında ara. Geri sayım yok.
  - Sonuç etiketi: Bir diziyi bulma süren
  - Nef: Bugünün en hızlısını {x} saniyede buldun.
- Gerisi T: ekranıyla 5 kişilik kapı → kendi onayın → sahibe sor. Kendin uydurup koyma.
- Yasaklar: sağlık ve "zekâ" iddiası yok; "beyin" ve "tanıma" yok; değişim sözcükleri yalnız "başlangıcından iyi",
  "değişim yok", "henüz belli değil", "başlangıç"; başkasıyla kıyas yok; puan, yıldız, emoji yok.
- İddia sınırı (METINLER I1) girişte değil, bilim kartında.

## 5. 5 saniye kapısı
- Değerlendirilen şey gerçek kodun görüntüleri ve hareketli kaydı: 390 ve 320, açık ve koyu.
- Beş yeni, bağımsız değerlendirici (biri tasarımcı, biri tasarımdan anlamayan, biri 50 yaş üstü). Soru: "5 saniyede
  etkilendin mi?" Evet ya da hayır; "idare eder" hayır. Geçme en az 4/5. En çok iki tur; geçmezse yöntemi değiştir ya
  da sahibe sor. Değerlendiriciler geçirse de görüntülere kendin bak; mükemmel değilse sahibe gösterme.
- Kayıtlar `docs/yol-haritasi/tasarim/sayi-arama/kapi/` altına.

## 6. Test
- Aşama içinde yalnız ilgili testler: `npx vitest run <dosyalar>`. Sonda tam takım ve derleme bir kez.
- Yeni: `rakamAvi.test.js`, Nef sözleşme testi bu modül için, `validateRemind` ile `remind` denetimi.
- Var olan bir test değişirse dur ve nedenini yaz.

## 7. Kurallar
- Doğrulamadan iddia etme; bilmediğin API, dosya ya da komutu uydurma; bakmadıysan "bakmadım" de.
- Varsayımları "VARSAYIM:" diye işaretle. Aynı yöntem iki kez başarısız olursa üçüncüyü deneme.
- İstenmeyen ek iş yok. `REMIND_ROW` ve `NOTIFY_PAGE` bayraklarını açma: bugün kapalılar, o karar bildirim işinin ve
  sahibin. Bu yüzden hatırlatma alanı doğru yazılsa da kişi bayraklar açılana dek kuramaz; sahibe bunu söyle.
- Ücretli çağrı yok sahip onayı olmadan. Anahtarlar yalnız ortam değişkeninden. Kullanıcının e-postası dış servise gitmez.
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti sonunda Co-Authored-By ve Claude-Session satırları; model adı
  geçmez. Push'tan önce `git fetch`.
- Sahibe sade, kısa Türkçe; parantez yok; her aşama sonunda en çok 15 satır.

## 8. Bitti tanımı
- R1–R5 tamam; tam test takımı ve derleme geçer.
- Her ekran gerçek kodda 5 sn kapısından en az 4/5 ile geçti; result1 dâhil.
- Gelişim → Dikkat'te "Dizi bulma süresi" satırı ile sonuç ekranı aynı sayıyı ve sözcüğü gösterir.
- Hatırlatma Bildirimler'den kurulabilir (bayraklar açıksa) ve onaylı metinle gelir.
- Yapılan hatalar `HATA_GUNLUGU.md`'ye kural olarak yazıldı.
- Sahibe kısa rapor: ne yapıldı, ne kaldı, hangi VARSAYIM'lar ölçülecek.
