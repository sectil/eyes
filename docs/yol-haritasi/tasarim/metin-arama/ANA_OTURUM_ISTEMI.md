# Kelime Avı · ana oturum istemi (sürüm 1, 2026-10-02)

Tasarım oturumu `claude/metin-arama` dalında yürüdü; sahip kararları PLAN §1'de. "---" altındaki metin ana oturuma olduğu
gibi yapıştırılır.

---

# Görev: "Kelime Avı" modülünü uygula ve Gelişim ile Nef'e bağla

Sahibin istediği (özet): bilimden kısa metinlerde aranan kelimeyi bulma alıştırması. Mantık başka bir uygulamanın
"Metin Arama"sına benzer ama kopya değildir: ad, görsel, düzen, metin, puan ve yıldız alınmaz. Metinler PubMed
çalışmalarının Nefona'nın kendi sözleriyle anlatımıdır, PMID ve DOI taşır. Gelişim'e ölçü kuralı v2 ile bağlanır,
Nef modülü tanır. Metinler uygulama paketinde durur, internetsiz çalışır. 5 saniye kuralı ve mükemmellik geçerli.

## 0. Önce oku (sırayla, atlamadan)

Tasarım klasörü: `docs/yol-haritasi/tasarim/metin-arama/` (dal `claude/metin-arama`; ana dala alınmadıysa oradan oku)
1. `PLAN.md` tamamı. Özellikle §1 sahip kararları, §3 tur yapısı, §4 metin ve hedef kuralları, §5 ölçüm ve Gelişim,
   §6 Nef, **§7 bağlayıcı tasarım maddeleri**, §8 aşamalar, §10 riskler, §11 cihaz listesi.
2. `METINLER.md`: kullanıcıya görünen her cümle buradan gelir; bölüm B 24 metin ve hedefleri.
3. `arastirma/KAYNAKLAR.md`: 38 kaynak, PMID ve DOI'ler PubMed aracıyla doğrulandı.
4. `kapi/` kayıtları (tur 1–6 ve yön karşılaştırması): aynı hataları tekrar etmemek için.
5. Maket: `maket/maket.html?s=<intro|search|found|absent|result>&theme=<light|dark>`; rekor hâli `&s=result&r=rekor`.
   Yön ve içerik içindir; tokenlar uygulamanınki.
6. Veri ve denetim: `maket/metinler.js` (tek kaynak), `maket/denetle.mjs` (kurallar).

Uygulama tarafında oku: `app/src/modules/registry.js`, `app/src/modules/tek-bakis/manifest.js` (örnek),
`app/src/lib/progress.js` (ölçü kuralı v2, `V2_PARAMS`, `UNIT_SD_FLOOR`), `app/src/lib/changeText.js` (`DIGITS`),
`app/src/lib/growthCenter.js`, `app/src/lib/sources.js`, `app/src/lib/ladders.js`, `app/src/lib/moduleRemind.js`,
`docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8, `docs/yol-haritasi/IS_AKISI_KURALLARI.md`,
`docs/yol-haritasi/HATA_GUNLUGU.md`.

## 1. Başlarken
- Sahibe bitiş saatini yaz: her aşama en çok 90 dk. Ajan süreleri IS_AKISI'ndaki gibi.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka oturumların alanı. Onlara yalnız aşağıdaki **bağlantı satırları**
  için ve o işin sahibiyle sıraya koyarak dokun. Ana sayfa bileşenine dokunma; modül yalnız `today()` çıktısı verir.

## 2. Aşamalar (sırayla)

### K1 · Mantık (`app/src/lib/kelimeAvi.js`, yeni)
Yap:
- Metin havuzu `maket/metinler.js`'ten taşınır (aynı alanlar: `id, src, type, title, text, targets[{ w, t, r }]`).
- Tur kurma: bir A + bir B metni; çiftler sırayla, 12 turda havuz tekrar etmez, ikinci döngüde çiftler kayar
  (PLAN §4). İmleç `kelime-avi:next`.
- Hedef sırası metin içinde karışık (tohumlu).
- Eşleşme: noktalama atılır, Türkçe küçük harf (`toLocaleLowerCase('tr')`), kesme işareti kelimenin parçası.
- Kayıt (PLAN §5.3): `type: 'kelime-avi'`, `items[]`, `meanSec` (doğru bulunanların ortalaması, her süre en çok
  20 sn, bir basamak; 3'ten az doğruda `null`), `hits`, `present`, `rightNo`, `noItems`, `wrongTaps`.
Bitti: `kelimeAvi.test.js` (yeni): `denetle.mjs` kurallarının hepsi test olarak (30–40 kelime, E/S/Z/Y kuralları,
hedef başka kelimenin başında geçmez, yasak sözcükler, aynı kaynak iki kez yok); `meanSec` sınır durumları;
90 günlük tohumlu simülasyonda aynı metin ikilisi tekrar etmez.

### K2 · Ekranlar (`app/src/screens/KelimeAvi.jsx`, stil)
Yap: Giriş → Metin 1 (3 hedef) → geçiş (A9 + kaynak satırı A3) → Metin 2 (3 hedef) → Sonuç; "Neye dayanıyor?"
sayfası. **PLAN §7 madde 1–7 hepsi.** Özetle:
- Arama: aranan kelime ortada büyük; "Bu kelimeyi bul ve dokun"; süre çizgisi ve "{s} sn kaldı" ikincil renkte.
  Metin kartı içerik kadar, sol şerit; kelime ve kart birlikte dikey ortalı; düğme altta. Kaynak satırı ve bulunan
  kelime işareti arama sırasında yok.
- Bulma anı: "Buldun", kelime ve "{s} saniyede" yeşil; metindeki kelime dolu renk ve halka; süre çizgisi kalkar.
- "Yok" doğru: "Doğru, metinde yok", A7b; benzer biçimler kesik çizgili kutuda, üstü çizili değil; düğme "Devam".
- Sonuç: rekor kırıldıysa rekor kartı en büyük öğe (S0, S0b, S0c); değilse "Bu turdaki ortalaman" + büyük süre +
  "{d}/6 doğru". "Kelimelerin" altı kutu (kelime üstte, sonuç altta). "Bugün okuduğun": başlık ve yazar · dergi ·
  yıl, PMID yok. Gelişim kutusu başlangıç oluşana kadar yok. Puan, seri, yıldız yok.
- Yanıp sönme yok; geçiş tek ve yumuşak. Ses yok. Dokunma alanı ≥ 44 pt; `prefers-reduced-motion`.
Bitti: 390 ve 320, iki tema, cihaz kaydı; **5 sn kapısı** (§3).

### K3 · Manifest (`app/src/modules/kelime-avi/manifest.js`, `view.jsx`)
Yap: PLAN §2 ve §5.1: `progress: { domain: 'focus', metrics: [{ key: 'kelime-avi-time', label: 'Kelime bulma süresi',
unit: 'sn', better: 'down', v2: { familiar: 2, sdFloor: 0.3 }, series }] }`; `sessions`, `today` (haftada 2 gün,
2 dk, `sub` KA2; açılma günü `lib/ladders.js` kararı), `remind: { route: 'kelime-avi', window: 'move', science:
['sireteanu1995'] }`, `coach()` (PLAN §6), `storageKeys`.
Bitti: `registry.test.js` geçer; Gelişim → Dikkat'te "Kelime bulma süresi" satırı.

### K4 · Bağlantı satırları ve kaynaklar
Yap (Gelişim sahibiyle sıraya):
- `lib/changeText.js`: `DIGITS.sn = 1` ("3,0 sn"); `TRIM`'e eklenmez.
- `lib/progress.js`: `UNIT_SD_FLOOR.sn = 0.3`.
- `lib/sources.js`: KAYNAKLAR A ve B'deki anahtarlar (pmid, doi, design, n yalnız özette yazdığı kadar, finding).
  PMID'leri `arastirma/KAYNAKLAR.md`'den kopyala, ezberden yazma (HATA_GUNLUGU kaynak kuralı).
- Manifest `nef` alanı (Nef PLAN §4.8): `name` (Kelime Avı · Kelime Avı'nda · Kelime Avı'ndan · Kelime Avı'nı ·
  Kelime Avı'na), `metricWords: { 'kelime-avi-time': 'saniye' }`, `evidence`, `note`, `cells` (METINLER NF1–NF3,
  son biçim Nef oturumunda).
Bitti: `changeText` ve `progress` testleri; Nef sözleşme testi bu modül için geçer; her `evidence` PMID + DOI taşır.

### K5 · Cihaz
PLAN §11 listesinin hepsi.

## 3. 5 saniye kapısı
- Her ekran gerçek koddan 390 ve 320, açık ve koyu temada beş bağımsız değerlendiriciye gösterilir. Soru "5 saniyede
  etkilendin mi?", "idare eder" hayır, en az 4/5. **Arama ekranında soru "5 saniyede ne yapman gerektiğini anladın
  mı?"** (sahip kararı 2026-10-02). En çok iki tur; geçmezse yöntem değiştir ya da sahibe sor.
- Tasarım oturumunda geçenler: giriş 5/5, arama 5/5 (anlaşılırlık), bulma anı 4/5, yok kararı 5/5, sonucun rekor
  hâli 5/5. **Sonucun sıradan tur hâli geçmedi (0/5)**; sahip kararıyla burada gerçek kodla cihazda yeniden sınanır.
  Bulgular ve kurallara uyan öneri `kapi/5sn-tur6.md`'de; yeni görünen cümle gerekirse sahibe sorulur.
  Gerçek kodda bütün ekranlar yeniden sınanır.

## 4. Değişmeyecekler
- "beyin" ve "tanıma" sözcükleri Gelişim ekranlarında geçmez; değişim sözcükleri yalnız "başlangıcından iyi",
  "değişim yok", "henüz belli değil", "başlangıç".
- Okuma hızı iddiası yok; iddia sınırı "Neye dayanıyor?" sayfasında (N5).
- METINLER dışında görünen cümle yok; yeni cümle gerekirse sahibe sorulur.
- Metinler yalnız özette yazanı söyler; deneyi anlatan fiil özetteki fiille aynıdır.
