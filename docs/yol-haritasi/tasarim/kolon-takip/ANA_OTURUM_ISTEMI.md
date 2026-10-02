# Kelime İzi · ana oturum istemi (sürüm 1, 2026-10-02)

Tasarım oturumu: `claude/kolon-takip`. Sahip kararları PLAN başında. "---" altındaki metin ana oturuma olduğu gibi
yapıştırılır.

---

# Görev: "Kelime İzi" modülünü uygula ve Gelişim ile Nef'e bağla

Sahibin istediği: sütunlar hâlinde dizili kelimelerde işaretli kelimeyi gözle takip etme alıştırması; ileri
bölümlerde hız (kelime/dakika) artar. Başka bir uygulamanın mantığına benzer ama **kopya değil**: o uygulamanın adı
("Kolonlar" dahil), görseli, düzeni, metinleri ve puan sistemi alınmaz. Daha gelişmiş ve kusursuz olacak. Gelişim
merkezinde takip edilecek. 5 saniye kuralı geçerli: "kişiler etkilenmeli".

## 0. Önce oku (sırayla, atlamadan)

Tasarım klasörü: `docs/yol-haritasi/tasarim/kolon-takip/`
1. `PLAN.md` tamamı. Özellikle §1 tur yapısı (ızgara, değişim ve dokunma, hız merdiveni), §2 günlere göre basamaklar,
   §3 ölçü ve kayıt, §4 Nef, §5 ekranlar, §6 kamera, **§7 bağlayıcı 9 madde ve kapının yeri**, §8 testler.
2. `METINLER.md`: görünür her cümle buradan. Durum sütununa bak: yalnız S ve K olanlar kesin; T olanlar §3'teki
   yöntemle onaya gider.
3. `arastirma/KAYNAKLAR.md`: 11 kaynak, PMID ve DOI PubMed ile doğrulandı.
4. `kapi/5sn-tur1.md`, `kapi/5sn-tur2.md`: iki kapı turunun bulguları; aynı hataları tekrar etme.
5. Maket (yön ve içerik; kapıdan tam geçmiş tasarım değil): `maket/maket.html?s=<ekran>&theme=<light|dark>`; ekranlar
   `intro1` (ilk tur), `intro`, `play`, `catch`, `result`, `home`. Görüntüler `maket/son/`. Çekim: `node maket/cek.mjs
   <klasör>`.
6. Sahibin isteği ve örnek ekran: `docs/yol-haritasi/tasarim/kolonlar/` (yalnız mantık örneği; görseli alınmaz).

Uygulama tarafında oku:
- `app/src/modules/registry.js` (sözleşme: `progress.metrics`, `v2`, `progression`, `remind`, `today`, `coach`,
  `sessions`, `gates`, `ask`) ve `registry.test.js`, `registry.progression.test.js`.
- Örnek modüller: `modules/tek-bakis` (`screens/SpanGame.jsx`, `lib/span.js`), `modules/quick-look`
  (`screens/QuickLook.jsx`, `lib/quicklook.js`, `ask: { before: ['seizure'] }`), `modules/track`.
- `lib/firstLook.js` (`msPerWord`, `tokenize`) ve `screens/FirstLook.jsx`: kelime kelime ilerleyen vurgu, buradan
  yeniden kullan; zamanlamayı `requestAnimationFrame` ile kur (FirstLook `setInterval` kullanıyor; sapma birikmesin).
- `lib/progress.js` (ölçü kuralı v2, `V2`, `V2_PARAMS`, `v2Params`: manifestteki `metrics[].v2` önce gelir),
  `lib/changeText.js` (`DIGITS`, `VERDICT_WORD`), `lib/growthCenter.js` (`AREA_DOMAINS`: `focus` → Dikkat).
- `lib/ladders.js` (`UNLOCK`, merdiven biçimi), `lib/progression.js` (`stageOf`, `unlocked`, `ownLadder`).
- `lib/sources.js` (biçim: `chung2004` girdisi), `lib/nef/` (`moments.js` `EXCLUDED_DOMAINS` `eye`'ı dışarıda tutar),
  `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8.
- `lib/gaze.js`, `lib/gazeCalib.js` ve HATA_GUNLUGU Bug 23 (kamera aşaması için).
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md`.

## 1. Başlarken

- Sahibe bitiş saatini yaz: her aşama en çok 90 dk.
- Aynı anda en çok 2 iş akışı. Ajan süreleri: uygulayıcı 25 dk, düzeltici 20, inceleyici 15, değerlendirici 3.
- Her aşama ayrı commit.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka oturumların alanı. Onlara yalnız aşağıdaki **bağlantı
  satırları** için ve sırayla dokun. `TodayPath.jsx` ve `Home.jsx`'e dokunma; modül yalnız `today()` çıktısı verir.

## 2. Aşamalar (sırayla)

### K1 · Mantık (saf işlevler)
Yap `lib/kelimeIzi.js` (yeni):
- `msPerWord` `lib/firstLook.js`'ten içe alınır.
- `planBlock(seed, wpm, cells, pairs)` → değişim yerleri: bölümde 3; ilk 4 sn ve son 2 sn'de yok; iki değişim arası en
  az 6 kelime.
- `judgeTap(tMs, swaps)` → `hit` | `false`: değişim başından sonraki 1500 ms içi yakaladı (VARSAYIM 1500 ms).
- `blockPassed({ hits, falseTaps })`: en az 2/3 yakalama ve en çok 1 yanlış dokunuş.
- `nextWpm(wpm, passed)`: ±20, sınır 120–300. `startWpm(sessions)`: son turun geçilen en yüksek hızından 20 aşağı;
  ilk tur 140.
- `pickWord(seed, history, stage)`: METINLER §K havuzundan; son 3 turdaki kelime tekrar etmez.
- `cellOrder(cols, rows, layout)`: `row` (soldan sağa, alt satıra) ve `col` (yukarıdan aşağı, sağdaki sütuna).
- `makeRecord(...)`: PLAN §3.2 alanları; `topWpm` geçilen en yüksek bölüm hızı ya da `null`.
Bitti: `lib/kelimeIzi.test.js` hepsini kapsar; sahte saatle 3 bölüm sonunda zaman sapması en çok 1 kare; 90 günlük
tohumlu benzetim: hız hep 120–300 arasında, kelime 3 tur içinde tekrar etmez.

### K2 · Ekranlar
Yap `modules/kelime-izi/` (`manifest.js`, `view.jsx`), `screens/KelimeIzi.jsx`, `styles/kelimeizi.css`:
- Akış: görev → 3 bölüm (36 sn, arada 4 sn "Bölüm {i} · {hız} kelime/dk") → sonuç. PLAN §1 ve §5.
- **PLAN §7 madde 1–8 hepsi.** Özetle: odak ışığı, satır içi iz çizgisi, işaret sıçrar ve kaymaz; yakalamada altın
  hap hücre içinde, "Yakaladın: Kale → Kare" alt satırda, hafif titreşim; "Bölüm 2/3" ilerlemenin yanında,
  "yakalanan ●●○" hız satırında; sonuçta sıfırdan ölçekli sütunlar ve 320'de bozulmasız çizgi; ana sayfada boş ikon
  yok.
- Izgara: 390 pt'de 4 sütun, 340 altında 3; satır ekrana göre; yazı 26 pt, dar ekranda 22.
- İddia cümlesi (METINLER G8) yalnız modülün ilk turunda görev ekranında; "Neye dayanıyor?" sayfası
  `arastirma/KAYNAKLAR.md`'deki kaynakları `sources.js`'ten gösterir.
- `ask: { before: ['seizure'] }`. Yanıp sönme yok. `prefers-reduced-motion`'da titreşim ve geçiş yumuşar, iz kalır.
- VoiceOver: ızgara tek öğe; alıştırmanın görerek yapıldığını söyler. Dokunma alanı bütün ekran.
Bitti: 390 ve 320, iki tema; cihaz kaydı; §4'teki 5 sn kapısı.

### K3 · Gelişim bağı
- Manifest `progress: { domain: 'focus', metrics: [{ key: 'kelime-izi-hiz', label: 'Geçtiğin en yüksek hız', unit:
  'kelime/dk', better: 'up', v2: { familiar: 2, sdFloor: 10 }, series: topWpm olan kayıtlar }] }`.
- Bağlantı satırı (Gelişim sahibiyle): `lib/changeText.js` `DIGITS['kelime/dk'] = 0`.
- Sonuç ekranı hüküm sözcüğünü kurmaz: `metricStatusV2` + `changeText` + `verdictWord`; Gelişim'le aynı sayı ve
  sözcük. Başlangıç oluşurken "Başlangıç · {k}/8 gün".
- `registry.test.js`: modül listesi, `practice` sırası, `metSample` (bir nokta dönen örnek), `remind` listesi.
Bitti: Gelişim → Dikkat'te "kelime/dk" satırı; 5. gün raporu, PDF ve CSV'de metrik (testle).

### K4 · Nef ve kaynaklar
- `lib/sources.js`: rayner1998, rayner2016, trauzettel2012, altpeter2015, rubin1992, carpenter1995, munoz1998,
  peltsch2011, wong2011, rosen2015 (`simons2016` varsa yeniden ekleme). PMID ve DOI'yi `arastirma/KAYNAKLAR.md`'den
  kopyala; ezberden yazma. `finding` ve `limit` yalnız özette yazanı söyler.
- Manifest `nef` alanı PLAN §4'teki gibi. VARSAYIM: registry bilinmeyen alanı reddetmiyor; kontrol et. Nef kodu
  henüz yoksa alan veri olarak durur.
- `coach()`: `rounds7`, `topWpm7`. `remind: { route: 'kelime-izi', window: 'move', science: ['rayner2016'] }`.
- `UNLOCK['kelime-izi']` ve yol yeri: Ana sayfa uzun yol sahibiyle karar (PLAN §2 önerisi 4. gün, haftada 3,
  `week3`).
Bitti: her `evidence` anahtarı PMID + DOI taşır; Nef sözleşme testi (Nef PLAN §4.8 madde 3) bu modülde geçer ya da
Nef kodu yoksa testin taslağı yazılıp beklemeye alınır.

### K5 · Kamera (isteğe bağlı; ayrı kapı)
PLAN §6. Varsayılan kapalı; görev ekranında "Kamerayla göz izini çiz" anahtarı. Kamera oyunu asla durdurmaz, "Ekrana
bak" demez, ölçüye ve hükme girmez. Sonuçta "Göz izin" paneli. Kayıtta yalnız `cam.coverage` ve `cam.follow`;
görüntü saklanmaz, telefondan çıkmaz. `gates.gaze` bugün zorunlu kapı; isteğe bağlı kamera için registry'de yeni alan
gerekirse önce sahibe sor. Kamera ekranları kendi 5 sn kapısından geçmezse ilk sürüm kamerasız çıkar.

### K6 · Cihaz ve kapı
Cihazda: 60 fps; 300 kelime/dk'da işaret atlamadan sıçrıyor; dokunma gecikmesi; iki tema; 320 ve 390; titreşim;
VoiceOver; uygulama arka plana gidince bölüm duraklar ve baştan başlar (yarım bölüm sayılmaz).

## 3. Metinler

- Görünür her cümle `METINLER.md`'den, harfi harfine. Eksik cümle gerekiyorsa: taslak → 5 kişilik kapı → kendi
  onayın → sahibe sor. Kendin uydurup koyma.
- Yasaklar: sağlık iddiası yok ("okuma hızını artırır", "gözü güçlendirir" yok); "beyin" ve "tanıma" yok; değişim
  sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli değil", "başlangıç"; "okuma hızı" sözcüğü
  sonuçta ve Nef'te geçmez; başkasıyla kıyas yok; emoji yok; "rahat" gibi ölçülmeyen niteleme yok.

## 4. 5 saniye kapısı (her ekranda, zorunlu)

- Değerlendirilen şey **cihazdaki hareketli ekranın kaydı** ve görüntüleri: 390 ve 320, açık ve koyu. Alıştırma
  kaydı en az 5 sn sıçrama ve bir yakalama gösterir.
- Beş yeni, bağımsız değerlendirici (farklı yaş ve meslek; en az biri tasarımcı, biri 60 yaş üstü, biri oyun
  oynayan genç). Soru: "5 saniyede etkilendin mi?" Yalnız evet ya da hayır; "idare eder" hayır. Geçme en az 4/5.
  320'de taşma, kesilme ya da üst üste binme varsa o ekran hayır.
- En çok iki tur. Geçmezse yöntemi değiştir ya da sahibe sor. Geçmeyen ekranı sahibe gösterme.
- Değerlendiriciler geçirse bile sen bak; mükemmel bulmazsan sahibe gönderme.
- Kayıtlar `docs/yol-haritasi/tasarim/kolon-takip/kapi/` altına.

## 5. Test ve doğrulama

- Aşama içinde yalnız ilgili test dosyaları: `npx vitest run <dosyalar>`. Sonda tam takım ve derleme bir kez.
- Değişmesi beklenen var olan testler: `registry.test.js` (listeler), Gelişim'in metrik sayan testleri (yeni metrik).
  Başka bir test değişirse dur ve nedenini yaz.

## 6. Kurallar

- Doğrulamadan iddia etme. Bilmediğin API, dosya ya da komutu uydurma; bakmadıysan "bakmadım" de.
- Varsayımları "VARSAYIM:" diye işaretle. PLAN'daki VARSAYIM'lar: 1500 ms dokunma penceresi, 140 başlangıç, 20 adım,
  300 tavan, `sdFloor` 10, basamak günleri, açılış günü. İlk 30 günlük veriyle denetlenir (PLAN §8).
- Aynı yöntem iki kez başarısız olursa üçüncüyü deneme: dur, yöntemi değiştir ya da sor.
- İstenmeyen ek iş yok; kapsam bu istem ve PLAN.
- Ücretli çağrı yok (ses, görsel üretim, model) sahip onayı olmadan.
- Anahtarlar yalnız ortam değişkeninden; depoya ve sohbete yazılmaz. Kullanıcının e-postası dış servise gitmez.
  Kamera görüntüsü telefondan çıkmaz.
- Daha önce düzeltilmiş bir hatayı yeniden "düzeltmeden" önce HATA_GUNLUGU ve git log'a bak.
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti sonunda Co-Authored-By ve Claude-Session satırları; model adı
  geçmez. Push'tan önce `git fetch`.
- Sahibe yazarken sade, kısa Türkçe; parantez kullanma; aşama sonunda en çok 15 satır.

## 7. Bitti tanımı

- K1–K4 ve K6 tamam; K5 kapıdan geçtiyse tamam, geçmediyse kamerasız sürüm.
- Tam test takımı ve derleme geçer.
- Her ekran cihazda 5 sn kapısından 4/5 ile geçti; kayıtlar `kapi/` altında.
- Gelişim → Dikkat'te "Geçtiğin en yüksek hız" satırı ve sonuç ekranı aynı sayıyı ve sözcüğü gösterir.
- Bu işte yapılan hatalar `HATA_GUNLUGU.md`'ye kural olarak yazıldı.
- Sahibe kısa rapor: ne yapıldı, ne kaldı, hangi VARSAYIM'lar ölçülecek.
