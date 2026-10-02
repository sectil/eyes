# Kelime Avı · plan (sürüm 1, 2026-10-02)

Sahibin isteği: `SAHIP_ISTEGI.md`. Araştırma: `ARA_RAPOR_1.md`, `arastirma/KAYNAKLAR.md`. Görünen metinler:
`METINLER.md`. Maket: `maket/maket.html?s=<intro|search|found|absent|result>&theme=<light|dark>`. Kapı: `kapi/`.

## 0. Tek bakışta
- Bilimden kısa bir metin, üstte aranan bir kelime. Kişi kelimeyi bulup dokunur; metinde yoksa “Yok” der.
- Bir tur ≈ 2 dk: iki metin, altı hedef. Hedeflerden biri metinde yoktur.
- Ölçü: doğru bulunan kelimelerin ortanca süresi, saniye. Gelişim'e ölçü kuralı v2 ile bağlanır.
- Metinler PubMed çalışmalarının Nefona'nın kendi sözleriyle anlatımı; her metin PMID ve DOI taşır.
- Nef modülü manifestteki `progress` ve `nef` alanından tanır.
- Puan, yıldız, seri ateşi yok. Örnek uygulamanın adı, görseli, düzeni ve metinleri alınmadı.

## 1. Sahip kararları (2026-10-02)
| Soru | Karar |
|---|---|
| Metin uzunluğu | 30–40 kelime |
| Sonuçta kıyas | "En hızlı turun" rekor satırı |
| "Ağ bağlı" | Nef'e bağlı. Metinler uygulama paketinde durur, internetsiz çalışır; yeni metinler sürümle gelir |
| Ad | Kelime Avı |
| Süre | Kelime başına 20 sn, ince çizgi; büyük geri sayım ve puan yok |
| "Yok" turları | Hedeflerin beşte biri |
| Konular | PubMed'deki ilginç çalışmalar; sağlık iddiası ve korku yok |

## 2. Sözleşmedeki yeri (`modules/kelime-avi/manifest.js`)
- `id: 'kelime-avi'`, `title` ve `label`: "Kelime Avı", `ring: 'attention'`, `kind: 'practice'`.
- `home: { section: 'practice' }`; sıra ana oturumun kararı.
- `gates`: yok. Göz bütçesine sayılmaz; okuma işi, göz hareketi egzersizi değil. VARSAYIM: ana oturum
  `eyeBudget` kuralını farklı yorumlarsa orada karar verilir.
- `storageKeys`: `kelime-avi:next` (metin sırası imleci), başka anahtar yok; kayıtlar ortak oturum kaydında.

## 3. Tur yapısı
1. **Giriş** (G1–G7). İlk turda tam ekran; sonraki turlarda kısa giriş: başlık ve Başla.
2. **Metin 1** (A tipi: kolay, benzer, yok) → **A9 geçiş** (metnin başlığı ve kaynağı, 1,5 sn ya da dokununca) →
   **Metin 2** (B tipi: kolay, benzer, iki benzer).
3. Her hedef için: üstte aranan kelime, altında süre çizgisi (20 sn). Metin hedefler boyunca aynı kalır; yalnız aranan
   kelime değişir. Hedef sırası metin içinde karışık sunulur, metindeki sırayla değil.
4. Dokunuş:
   - Doğru kelime: kart yeşile döner, süre büyük yazılır (A4), kelime dolu renkle parlar, hafif titreşim. 0,9 sn sonra
     sıradaki hedef. Bulunan kelime işaretli kalmaz (kapı tur 1: ipucu gibi okundu).
   - Yanlış kelime: kelime kısa sallanır, renk değişmez, sayaç işler (A5 yalnız sesli okuyucuya).
   - “Metinde yok”: hedef yoksa A7 ve benzer biçimlerin altı kesik çizgili; hedef varsa A8 ve kelime işaretlenir.
   - 20 sn dolarsa A6a ya da A6b.
5. **Sonuç** (S1–S8).

Eşleşme kuralı: dokunulan kelime, noktalama atılıp Türkçe küçük harfe çevrilince hedefle aynıysa doğrudur. Kesme
işareti kelimenin parçasıdır ("Renoir'a"). Dokunma alanı her kelimede en az 44 pt yüksekliğe genişletilir; komşu
kelimeye taşmaz.

## 4. Metinler ve hedefler
- Havuz 24 metin (`maket/metinler.js`, METINLER B). Her metin 30–40 kelime (sahip kararı 2026-10-02: kapıda uzun metin "yazı duvarı" bulundu), A ve B tipi sırayla.
- Sabit karışım: her tur bir A ve bir B metni, yani 2 kolay, 2 benzer, 1 iki benzer, 1 yok. Zorluk merdiveni yok;
  her tur aynı karışımda olduğu için günden güne süre aynı işi ölçer. Çeşitlilik metinlerden gelir.
- Sıra: metinler çiftler hâlinde sırayla; 12 tur sonra başa döner, ikinci turda çiftler kayar (1+4, 3+6 …) ki aynı
  ikili tekrar etmesin. İmleç `kelime-avi:next`.
- Hedef konumu: havuz genelinde baş, orta ve son üçte birler 19 / 24 / 17.
- Hedef kelime metindeki başka bir kelimenin başında geçemez; benzer biçimli hedeflerde uzun biçim aranır, kısa biçim
  çeldiricidir (kapı tur 2: "arıların" metindeki "arılarına"nın içinde görününce "Yok" haksız bulundu).
- Denetim: `node maket/denetle.mjs`. Kontrol ettikleri: kelime sayısı, hedef türü kuralları, aynı kaynağın iki kez
  kullanılması, yasak sözcükler (beyin, tanıma, tedavi, hastalık…). Ana oturum bu kuralları
  `lib/kelimeAvi.test.js` testine taşır.
- Yeni metin ekleme yolu: PubMed aracıyla PMID ve DOI doğrula → yalnız özette yazanla kendi cümlelerinle yaz →
  denetim → 5 sn kapısında metin okunur mu → sahip onayı. Deneyi anlatan her fiil özetteki fiille aynı olur.

## 5. Ölçüm ve Gelişim bağı
### 5.1 Metrik (`progress.metrics`)
```js
{ key: 'kelime-avi-time', label: 'Kelime bulma süresi', unit: 'sn', better: 'down',
  v2: { familiar: 2, sdFloor: 0.3 },
  series: ({ sessions }) => sessions.filter(isKelimeAvi).filter((s) => Number.isFinite(s.medianSec))
    .map((s) => ({ date: s.date, value: s.medianSec })) }
```
- `progress.domain: 'focus'`.
- `medianSec`: turda doğru bulunan kelimelerin sürelerinin ortancası, bir basamak. 3'ten az doğru varsa `null`; tur
  kaydedilir ama seriye girmez (S3b). Sebep: hız ile doğruluk takası; az bulunan turun süresi yanıltır.
- `familiar: 2`: ilk iki gün arayüze alışma. `sdFloor: 0.3` sn: VARSAYIM; ilk kullanıcı verisiyle gözden geçirilir.
- Doğruluk ayrı metrik olmaz; sonuç ekranında sayı olarak görünür. VARSAYIM: Gelişim'de ikinci satır istenirse
  `{ key: 'kelime-avi-hits', rule: 'none' }` eklenir.

### 5.2 Bağlantı satırları (Gelişim sahibiyle sıraya konur)
- `lib/changeText.js`: `DIGITS.sn = 1`, `TRIM`'e `sn` eklenmez ("3,0 sn" kalır).
- `lib/progress.js`: `UNIT_SD_FLOOR.sn = 0.3`. Manifestteki `v2` zaten önce geldiği için bu satır yalnız tutarlılık.
- Sonuç ekranı hüküm sözcüğünü ve sayıyı kendisi kurmaz: `metricStatusV2` + `changeText` + `verdictWord`. Başlangıç
  oluşurken "Başlangıç · k/8 gün" (2 alışma + 6 başlangıç günü).
- 5. gün raporu, PDF ve CSV metriği manifestten kendiliğinden alır; ana oturum testle doğrular.

### 5.3 Kayıt
```js
{ type: 'kelime-avi', date, durationMs, texts: ['arilar-sifir', 'kuzgun-plan'],
  items: [{ w, kind: 'E'|'S'|'Z'|'Y', ms, result: 'hit'|'miss'|'timeout'|'rightNo'|'wrongNo', wrongTaps }],
  medianSec, hits, present, rightNo, noItems, wrongTaps }
```

## 6. Nef
- `nef.name`: Kelime Avı · Kelime Avı'nda · Kelime Avı'ndan · Kelime Avı'nı · Kelime Avı'na.
- `nef.metricWords: { 'kelime-avi-time': 'saniye' }`.
- `nef.evidence`: `sireteanu1995`, `chun1996`, `rayner1996`, `rayner2016`, `wolfe2021` ve metin kaynakları.
- `nef.note`: "Bilimden kısa metinlerde aranan kelimeyi bulma alıştırması; ölçü kelime bulma süresi."
- `nef.cells`: NF1–NF3 taslak; son biçim Nef oturumunun onaylı cümle düzenine göre orada kurulur.
- `coach()`: `rounds7`, `median7` (7 günün tur ortancalarının ortancası), `hitRate7`.
- `remind: { route: 'kelime-avi', window: 'move', science: ['sireteanu1995'] }`.
- `today()`: haftada 2 gün, 2 dk durak, `sub` KA2. Açılma günü ve yol sırası ana oturumun `lib/ladders.js` kararı.
  VARSAYIM: yol 10. günden sonra.
- Nef sözleşme testi (Nef PLAN §4.8 madde 3) bu modül için geçmeli.

## 7. Ekranlar ve bağlayıcı tasarım maddeleri
Maketteki hâl yön ve içerik içindir; tasarım tokenları uygulamanınkidir. Kapı kayıtları `kapi/`.
1. Arama: aranan kelime ortada, büyük ve renkli; altında süre çizgisi ve kalan süre "{s} sn" yazıyla. Metin kartı
   sol kenarında renkli şerit, yazı 390'da 25 px / 1,55, 320'de 19 px / 1,5, kart içinde dikey ortalı. 40 kelimelik
   metin 320×568'de kaydırmasız sığmalı; sığmazsa yazı küçülmez, metin kısalır.
2. Arama sırasında metin kartında yalnız metin olur; kaynak satırı, bulunan kelime işareti, puan yok.
3. Bulma anı: "Buldun", kelime ve süre yeşil; metindeki kelime dolu renk ve halka. Yanıp sönme yok.
4. "Yok" doğru: "Doğru, metinde yok", altında A7b; benzer biçimler kesik çizgili kutuda, üstü çizili değil.
   Düğme "Devam".
5. Sonuç: büyük süre ve sağda "{d}/6 doğru"; S3; "En hızlı turun" satırı; "Bugün öğrendiğin" kartları başlık ve
   kaynakla, PMID bölünmez; Gelişim kutusu metrik adıyla.
6. İddia sınırı "Neye dayanıyor?" sayfasında (N5); girişte yalnız bağlantı.
7. Erişilebilirlik: kelimeler sesli okuyucuda tek tek seçilebilir; renk tek başına bilgi taşımaz; dokunma alanı
   ≥ 44 pt; `prefers-reduced-motion`'da halka ve sallanma yok. Kaynak yazısı en az 12 px, ikincil metin `ink-2`.

## 8. Aşamalar (ana oturum uygular)
| Aşama | İş | Bitti ölçütü |
|---|---|---|
| K1 | `lib/kelimeAvi.js`: metin havuzu, tur kurma, eşleşme, kayıt, `medianSec` | birim testleri; denetim kuralları test olarak; 90 günlük tohumlu simülasyonda aynı ikili tekrar etmez |
| K2 | `screens/KelimeAvi.jsx`, stil | 390 ve 320, iki tema; cihazda 60 fps; 5 sn kapısı |
| K3 | manifest: `progress`, `sessions`, `today`, `remind`, `coach`, `nef` | registry testleri; Gelişim → Dikkat'te "sn" satırı |
| K4 | bağlantı satırları (§5.2) Gelişim sahibiyle; `sources.js`'e kaynaklar | `changeText` ve `progress` testleri; her `evidence` PMID + DOI taşır |
| K5 | cihaz denetimi (§11) | liste tamam |

## 9. Değişebilecek testler
- `registry.test.js`: canlı modül sayısı bir artar.
- `changeText.test.js`: `sn` birimi.
- Nef sözleşme testi: yeni modül.
Başka test değişmemeli; değişirse durup sebebi yazılır.

## 10. Riskler
| Risk | Önlem |
|---|---|
| Metin bilimsel olarak abartılı | Yalnız özetteki bulgu; kapıda göz doktoru değerlendirici; sahip onayı |
| Kişi metni okumaya dalar, süre şişer | Bu doğal; ölçü ortanca ve sabit karışım. Metin uzunluğu sınırlı |
| Tahminle "Yok" basmak | Doğruluk sonuçta görünür; 3'ten az doğru varsa süre seriye girmez |
| Dokunma hatası, küçük kelime | 44 pt dokunma alanı; yanlış dokunuş yalnız sayılır, süreyi durdurmaz |
| 24 metin bitince tekrar | Çiftler kayar; yeni metinler sürümle; tekrar eden metinde süre doğal olarak kısalır, bu yüzden ilk 12 turda havuz tekrar etmez |

## 11. Cihaz denetim listesi
- 320×568 ve 390×844'te en uzun metin kaydırmasız sığıyor; iki tema.
- Kelimeye dokunma: kenar kelimelerde ve satır sonunda doğru kelime seçiliyor.
- Süre ölçümü dokunma anından; ekran gizlenirse süre durur ve hedef yeniden başlar.
- Sesli okuyucu: aranan kelime, metin, "Metinde yok" sırası mantıklı.
- Gelişim → Dikkat'te "Kelime bulma süresi" satırı; 8 gün sonra hüküm sözcükleri.
- İnternetsiz açılıyor.
