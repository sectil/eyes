# Rakam Avı · ana oturum istemi (sürüm 1, 2026-10-02)

Sahip kararları PLAN §8'de ("senin önerin olsun", 2026-10-01; "önerini uygulayalım", 2026-10-02). "---" altındaki
metin ana oturuma olduğu gibi yapıştırılır.

---

# Görev: "Rakam Avı" modülünü yaz ve Gelişim, Nef ve hatırlatmaya tam bağla

Sahibin istediği: rakam ızgarasında aranan sayı dizisini bulma alıştırması. Benzersiz, kopya değil, lisans sorunu yok;
başka bir uygulamanın adı, görseli, düzeni, puanı ve yıldızı alınmaz. Gelişim merkezi ve Nef ile mükemmel uyum.
Her yeni modül gibi isteğe bağlı hatırlatma kurulabilir. 5 saniye kuralı ve mükemmellik geçerli.

## 0. Önce oku (sırayla, atlamadan)

Tasarım klasörü: `docs/yol-haritasi/tasarim/sayi-arama/`
1. `PLAN.md` tamamı. Özellikle §1 tur yapısı, §2 ızgara üretimi, §3 ilerleyiş, §4 ölçüm, Gelişim, Nef, hatırlatma,
   **§4.1b ilk 8 günün sonucu (kıyas yok)**, §5 ekranlar, **§5b kapı sonuçları**, §6 aşamalar, §7 riskler, §8 kararlar.
2. `METINLER.md`: görünür her cümle buradan. Yalnız **S** (sahip onaylı) olanlar harfi harfine koda girer.
3. `arastirma/KAYNAKLAR.md`: 14 kaynak, PMID ve DOI PubMed aracıyla doğrulandı.
4. `kapi/5sn-tur1.md` … `kapi/5sn-tur4.md`: dört turun bulguları; tur 2 sonundaki 7 ve tur 4'teki 6 **bağlayıcı madde**.
5. Maket (yön ve içerik içindir): `maket/maket.html?s=<ekran>&theme=<light|dark>`; ekranlar intro, play, found,
   result1, result2. Görüntüler `maket/son/`. intro, found, play ve result2 kapıdan geçti; result1 geçmedi (tur 4 maddeleriyle kodda yeniden kapıya girer).
6. `SAHIP_ISTEGI.md` ve `sahip-ekran/`: yalnız mantık örneği; hiçbir görsel öğe alınmaz.

Uygulama tarafında oku:
- `app/src/modules/registry.js` (sözleşme: `progress`, `remind`, `routes`, `today`, `progression`, `coach`, `stats`)
- Örnek modüller: `app/src/modules/tek-bakis/` (manifest ve view), `quick-look/`, `fark-ettin/`
- `app/src/lib/progress.js` (ölçü kuralı v2, `V2_PARAMS`, `UNIT_SD_FLOOR`, `v2Params`: manifestteki `metrics[].v2`
  önce gelir), `app/src/lib/changeText.js` (`DIGITS`, `TRIM`, `VERDICT_WORD`), `app/src/lib/growthCenter.js`
- `app/src/lib/ladders.js` (`UNLOCK`), `app/src/lib/progression.js`, `app/src/lib/today.js`
- `app/src/lib/sources.js` (kaynak biçimi), `app/src/lib/moduleRemind.js`, `remindTexts.js` (`TEXTS`, `NAMES`,
  `LIMITS`), `notifyApply.js` (modül hatırlatmaları 7800–7859), `components/RemindField.jsx`, `App.jsx`
  `remindField`, `REMIND_ROW`, `NOTIFY_PAGE`
- `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8 (`nef` alanı ve sözleşme testi), `N1-CUMLELER-onay.md`, `app/src/lib/nef/`
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md` (Bug 35: `week3` dönüşümü bozulmaz)

## 1. Başlarken
- Sahibe bitiş saatini yaz: her aşama en çok 90 dk.
- Aynı anda en çok 2 iş akışı. Ajan süreleri: uygulayıcı 25 dk, düzeltici 20, inceleyici 15, değerlendirici 3.
- Her aşama ayrı commit.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka oturumların alanı. Onlara yalnız aşağıdaki **bağlantı
  satırları** için ve o işin sahibiyle sıraya koyarak dokun.
- Metin Arama oturumu da `sn` birimini ve bazı ortak kaynakları (`treisman1980`, `duncan1989`, `wolfe2017`,
  `wolfe2021`, `chun1996`, `sireteanu1995`) istiyor. Bunlar `sources.js`'e ve birim tablolarına **bir kez** girer.

## 2. Aşamalar (sırayla)

### R1 · Saf mantık: `app/src/lib/rakamAvi.js` + `rakamAvi.test.js`
- `makeGrid(seed)` (PLAN §2): 8 × 10; aranan 4 hane, ilk hane 0 değil, art arda aynı hane yok; 5 hedef farklı
  satırlarda, üst, orta ve alt bölgeye dengeli; 6 benzer çeldirici; aranan dizi tam 5 kez geçer; aynı tohum aynı ızgara.
- `resolveSwipe(grid, row, c0, c1)`: 4 haneyi tam kaplayan yatay iz → `'hit' | 'wrong'`; 1–3 hane → `'short'`
  (sayılmaz). Zaten bulunmuş diziye ikinci iz `'short'` gibi sayılmaz.
- `makeRecord(...)` PLAN §4.1 biçiminde; `medianMs` 2'den az dizi bulunduysa `null`.
- Son 14 turda aynı aranan dizi tekrar etmez.
- Bitti: testler geçer; 1000 tohumda her ızgara kurallara uyar.

### R2 · Ekranlar: `app/src/modules/rakam-avi/view.jsx`, `app/src/screens/RakamAvi.jsx`, `app/src/styles/rakamavi.css`
- Maket `maket/maket.html` tasarım dilini uygula: Onest ve Unbounded, uygulama renk değişkenleri, iki tema.
- Kaydırma: dokunma noktası hücreye çevrilir; iz parmağı izler; kalkınca `resolveSwipe`. Bulununca iz altın olur,
  aranan kutular kısa altın yanar, halka dolar, cihaz izin veriyorsa kısa titreşim; ses yok. `prefers-reduced-motion`
  iken kıvılcım ve parlama yok, renk değişimi kalır.
- **Bağlayıcı maddeler** (`kapi/5sn-tur2.md`): kaydırma izi teal, aranan kutular nötr, bulunan altın; sonuçta tek
  büyük "bugün" sayısı; başlangıç ve "bugün" yalnız grafikte etiketli; ilk 8 günde bekleme anlatılmaz; "ortanca"
  görünür metinde yok; "yanlış kaydırma"; kıvılcım komşu rakamın üstüne binmez; 320'de hiçbir şey kesilmez.
- "Göster" 90 sn'den önce görünmez.
- Sonuçta `ctx.remindField('rakam-avi', { inPath })` satırının yeri (yoldan açılınca çıkmaz).
- Bitti: 390 ve 320, iki tema, gerçek kodda ekran görüntüleri ve **hareketli kayıt**.

### R3 · Manifest: `app/src/modules/rakam-avi/manifest.js`
- `id: 'rakam-avi'`, `routes: ['rakam-avi']`, `title` ve `label` METINLER A1 (S olunca), `ring: 'attention'`,
  `kind: 'practice'`, `gates: { eyeBudget: 'eye' }`, `home: { section: 'practice', order }` (Tek Bakışta'dan sonra).
- `progress` PLAN §4.2 aynen; `sessions` (`countsTowardGoal: true`, `describe`), `stats`, `coach` (`find7`, `rounds7`,
  `wrong7`).
- `today()` ve `progression.unlock: { pathDay: 9 }` PLAN §3.
- `remind` PLAN §4.4; `nef` PLAN §4.3.
- Bitti: `registry.test.js`, `registry.progression.test.js`, `remindInPath.test.jsx`, `pathModules.equiv.test.js` geçer.

### R4 · Bağlantı satırları (sahipleriyle sıraya koy)
- `changeText.js`: `DIGITS.sn = 1` (ve `TRIM`'e girmez: "4,0 sn" yazılır). VARSAYIM; Metin Arama ile aynı satır.
- `progress.js`: `UNIT_SD_FLOOR.sn = 0.3`.
- `ladders.js`: `UNLOCK['rakam-avi'] = 9`.
- `sources.js`: KAYNAKLAR A ve B bölümündeki anahtarlar; `finding` yalnız METINLER'de S olan cümlelerden. Başlıkta
  "brain" geçen kaynakların `titleTr`'si "beyin" sözcüğü olmadan.
- `remindTexts.js`: `'remind.rakam-avi'` üç cümle (METINLER H, S olunca), `NAMES['rakam-avi']`.
- `lib/nef/bank`: `rakam-avi` hücreleri (METINLER N, S olunca); en az bir genel hücrede onaylı cümle.
- Bitti: Nef sözleşme testi bu modül için geçer (an üretilir, çekim doğru, `evidence` PMID+DOI'li, onaylı hücre var).

### R5 · Kapı ve cihaz
- play, result1, result2 ve hatırlatma bildirimi görünümü 5 saniye kapısına girer (§4).
- Cihazda: kaydırma 320'de rahat mı, titreşim, iki tema, yol 9. gün açılışı, hatırlatmanın kurulup gelmesi.

## 3. Metinler
- Görünür her cümle `METINLER.md`'den, yalnız **S** olanlar. T olan bir cümle gerekiyorsa: ekranıyla 5 kişilik kapı →
  kendi onayın → sahibe sor. Kendin uydurup koyma.
- Yasaklar: sağlık ve "zekâ" iddiası yok; "beyin" ve "tanıma" yok; değişim sözcükleri yalnız "başlangıcından iyi",
  "değişim yok", "henüz belli değil", "başlangıç"; başkasıyla kıyas yok; puan, yıldız, emoji yok.
- İddia sınırı METINLER I1; girişte değil, bilim kartında.

## 4. 5 saniye kapısı (zorunlu)
- Değerlendirilen şey gerçek kodun hareketli kaydı ve görüntüleri: 390 ve 320, açık ve koyu.
- Beş yeni, bağımsız değerlendirici (biri tasarımcı, biri tasarımdan anlamayan, biri 50 yaş üstü). Soru: "5 saniyede
  etkilendin mi?" Evet ya da hayır; "idare eder" hayır. Geçme en az 4/5. En çok iki tur; geçmezse yöntemi değiştir ya
  da sahibe sor. Değerlendiriciler geçirse de görüntülere kendin bak; mükemmel değilse sahibe gösterme.
- Kayıtlar `docs/yol-haritasi/tasarim/sayi-arama/kapi/` altına.

## 5. Test ve doğrulama
- Aşama içinde yalnız ilgili testler: `npx vitest run <dosyalar>`. Sonda tam takım ve derleme bir kez.
- Yeni testler: `rakamAvi.test.js`, Nef sözleşme testi bu modül için, `remind` doğrulaması (`validateRemind`).
- Var olan bir test değişirse dur ve nedenini yaz.

## 6. Kurallar
- Doğrulamadan iddia etme; bilmediğin API, dosya ya da komutu uydurma; bakmadıysan "bakmadım" de.
- Varsayımları "VARSAYIM:" diye işaretle.
- Aynı yöntem iki kez başarısız olursa üçüncüyü deneme.
- İstenmeyen ek iş yok; kapsam bu istem ve PLAN.
- `REMIND_ROW` ve `NOTIFY_PAGE` bayraklarını bu iş için açma; o karar bildirim işinin ve sahibin.
- Ücretli çağrı yok sahip onayı olmadan. Anahtarlar yalnız ortam değişkeninden. Kullanıcının e-postası dış servise gitmez.
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti sonunda Co-Authored-By ve Claude-Session satırları; model adı
  geçmez. Push'tan önce `git fetch`.
- Sahibe sade, kısa Türkçe; parantez yok.

## 7. Bitti tanımı
- R1–R5 tamam; tam test takımı ve derleme geçer.
- Her ekran gerçek kodda 5 sn kapısından 4/5 ile geçti.
- Gelişim → Dikkat'te "Dizi bulma süresi" satırı ile sonuç ekranı aynı sayıyı ve sözcüğü gösterir.
- Hatırlatma Bildirimler'den kurulabilir (bayraklar açıksa) ve doğru metinle gelir.
- Bu işte yapılan hatalar `HATA_GUNLUGU.md`'ye kural olarak yazıldı.
- Sahibe kısa rapor: ne yapıldı, ne kaldı, hangi VARSAYIM'lar ölçülecek.
