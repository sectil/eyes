# Yakala Yaz · ana oturum istemi (sürüm 1, 2026-10-02)

Sahip METINLER, KELIMELER ve "Yakala Yaz alıştırması" adını onayladı (2026-10-02). Bu istem artık kullanılabilir. "---" altındaki metin ana oturuma olduğu gibi
yapıştırılır.

---

# Görev: "Yakala Yaz" modülünü ekle ve Gelişim ile Nef'e bağla

Sahibin istediği (özet): ekranda kısa süre gösterilen iki kelimeyi akılda tutup yazma (ya da sesle söyleme)
alıştırması. Benzersiz, kopya değil, lisans sorunu yok. Kelimeleri biz seçeriz, her seferinde aynı kelimeler çıkmaz.
En önemlisi hız her ilerlemede bir adım artar ve gelişim takip edilir. Gelişim merkezi ve Nef ile mükemmel uyum.
İsteğe bağlı hatırlatma. Mikrofonla cevap olur, ses telefondan çıkmaz. 5 saniye kuralı ve mükemmellik geçerli.

## 0. Önce oku (sırayla, atlamadan)

Tasarım klasörü: `docs/yol-haritasi/tasarim/kelime-hafiza/`
1. `PLAN.md` tamamı: §1 tur, §2 hız merdiveni, §3 kelime ve tekrar etmeme, §4 ölçüm ve Gelişim, §5 ekranlar,
   **§6 mikrofon (cihaz içi zorunlu)**, §7 Nef, §8 manifest, §9 aşamalar, §10 cihaz listesi, §11 riskler.
2. `METINLER.md`: görünür her cümle buradan; yalnız **S** durumundakiler harfi harfine.
3. `KELIMELER.md` ve `kelimeler/liste.json`: kelime listesi (yalnız sahip onaylı hâli).
4. `arastirma/KAYNAKLAR.md`: PMID ve DOI'ler PubMed ile doğrulandı. `sources.js`'e buradan kopyala; ezberden yazma.
5. `arastirma/merdiven-benzetim.mjs`: merdiven kuralının benzetimi (node ile çalışır).
6. `kapi/`: 5 sn kapısı kayıtları; bağlayıcı tasarım maddeleri `kapi/5sn-tur2.md` sonundaki listede.
7. Maket: `maket/maket.html?s=<ekran>&theme=<light|dark>`; ekranlar giris, goster, yaz, dogru, yanlis, sonuc, sesizin.
   Görüntüler `maket/tur2/`. Ekran düzeni ve ölçüler buradan.

Uygulama tarafında oku:
- `app/src/modules/registry.js` (sözleşme: `progress`, `remind`, `routes`, `today`, `coach`, `nef`)
- `app/src/modules/tek-bakis/` ve `app/src/lib/span.js` (kısa gösterim, `ask: { before: ['seizure'] }`, `flashSafe`)
- `app/src/lib/progress.js` (ölçü kuralı v2; `v2Params`: manifestteki `metrics[].v2` önce gelir)
- `app/src/lib/changeText.js` (`verdictWord`, `ms` birimi), `app/src/lib/growthCenter.js`
- `app/src/lib/sources.js`, `app/src/lib/ladders.js` (`UNLOCK`), `app/src/lib/progression.js`
- `app/src/lib/moduleRemind.js`, `remindTexts.js`, `notifyApply.js` (modül hatırlatmaları 7800–7859)
- `app/src/lib/nef/`, `app/src/modules/nef.contract.test.js`, `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8
- `ios/App/App/SpeechPlugin.swift`, `app/src/lib/native.js` (Speech), `ios/App/App/Info.plist`
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md` (Build 29: Tek Bakışta `week3`)

## 1. Başlarken
- Sahibe bitiş saatini yaz: her aşama en çok 90 dk. Aynı anda en çok 2 iş akışı; ajan süreleri İş akışı kurallarındaki gibi.
- Gelişim, Nef, Ana sayfa, Sonsuz yol ve bildirim dosyaları başka oturumların alanı. Onlara yalnız aşağıdaki
  **bağlantı satırları** için ve o işin sahibiyle sıraya koyarak dokun.

## 2. Aşamalar (sırayla)

### Y1 · Mantık
Yap:
- `lib/yakalaYaz.js`: basamak tablosu (PLAN §2: 18 basamak, kare 30→3, 500→50 ms), kural +1 / −3 (sınır 1–18), ilk tur
  3. basamak, sonraki tur = son eşik basamağı − 2 (14+ gün aradan sonra − 4); tur eşiği = son 10 denemenin süre
  ortancası; `bestOkMs`; cevap denetimi (PLAN §1: `tr-TR` küçük harf, noktalama ve boşluk temizliği, Türkçe harf
  eksikliği doğru, sıra serbest, iki kelime de doğruysa doğru, `part`); `makeRecord` (PLAN §4.2).
- `lib/yakalaYazWords.js`: `kelimeler/liste.json`'daki onaylı liste (gruplarıyla) ve seçim: PLAN §3 / KELIMELER
  kuralları 1–7; geçmiş `sessions` kayıtlarından okunur.
Bitti: `yakalaYaz.test.js`, `yakalaYazWords.test.js`. **90 günlük tohumlu benzetim**: günde 1–3 tur, kurallar hiç
çiğnenmez; aynı çift hiç tekrar etmez; Türkçe harf atılınca çakışan iki kelime listede yok; merdiven 1–18 dışına
çıkmaz; benzetimdeki gibi (lojistik eğri) doğru oranı %70–80.

### Y2 · Ekranlar
Yap (`modules/yakala-yaz/manifest.js`, `view.jsx`, `screens/YakalaYaz.jsx`, `styles/yakalayaz.css`):
- Giriş → 20 deneme → sonuç (PLAN §1, §5); maketteki düzen ve **`kapi/5sn-tur2.md` bağlayıcı maddeleri**.
- Gösterim kare sayımıyla (`requestAnimationFrame`); kelimeden hemen sonra 150 ms örtü (çizgisiz, kırmızısız). Gerçek
  süre `shownMs` kaydı; 1 kareden çok sapan deneme ölçüye girmez ve tekrarlanır.
- Klavye tur boyunca açık; alan kelime penceresinin hemen altında. `autocomplete="off" autocorrect="off"
  autocapitalize="off" spellcheck="false" enterkeyhint="send"`. Gönderme klavyenin "Gönder" tuşuyla; alanın yanında
  yalnız mikrofon düğmesi.
- Kelime gösterilirken VoiceOver kelimeyi okumaz (`aria-hidden`), sonra okunur.
- Güvenlik (Harding 2005): saniyede en çok bir gösterim; kelime ve örtü ekranın %25'inden az; doymuş kırmızı yok.
Bitti: 390 ve 320, iki tema; cihaz kaydı; 5 sn kapısı gerçek ekranla (§3).

### Y3 · Gelişim bağı
- Manifest `progress: { domain: 'focus', metrics: [{ key: 'yakala-yaz-ms', label: 'İki kelimeyi yakaladığın süre',
  unit: 'ms', better: 'down', v2: { familiar: 2, sdFloor: 15 }, series: kayıtların thresholdMs'i }] }`.
- Sonuç ekranı hüküm çipini kendisi kurmaz: `metricStatusV2` + `changeText` + `verdictWord`.
- 5. gün raporu, PDF ve CSV: metrik manifestten kendiliğinden girer; testle doğrula.
Bitti: Gelişim → Dikkat'te satır; sonuç çipi ile Gelişim aynı sayı ve sözcük.

### Y4 · Nef, kaynak, hatırlatma
- Manifest `nef` (PLAN §7), `coach()` (§4.3), `stats()` (§4.4), `remind: { route: 'yakala-yaz', window: 'move',
  science: ['rubin1992'] }`.
- Bağlantı satırları (sahipleriyle): `lib/sources.js` kaynakları (PLAN §7 listesi, `KAYNAKLAR.md`'den, `finding`/`limit`
  METINLER B1–B4); `lib/nef/bank/tr.js` FYY-1 (METINLER N1); `modules/nef.contract.test.js` `APPROVED_NAMES`'e
  "Yakala Yaz alıştırması"; `lib/remindTexts.js` `remind.yakala-yaz` H1–H3 (bildirim oturumunun onay dosyası yoluyla);
  `lib/ladders.js UNLOCK['yakala-yaz'] = 9` ve `today()` (PLAN §8; Tek Bakışta ile aynı gün gelmez).
Bitti: Nef sözleşme testi bu modülde geçer; `registry.test.js`, `remindTexts.test.js`, `moduleRemind.test.js` geçer.

### Y5 · Mikrofon (ses telefondan çıkmaz)
- `SpeechPlugin.swift` `start`'a `strictOnDevice` seçeneği: true ise `supportsOnDeviceRecognition` yoksa başlama,
  hata dön; varsa `requiresOnDeviceRecognition = true`. Okuma testinin çağrısı değişmez.
- `lib/native.js`: `startSpeech(onResult, { strictOnDevice })`.
- Yakala Yaz: `speechAvailable('tr-TR')` → `onDevice: true` değilse mikrofon düğmesi hiç yok. İlk dokunuşta izin
  sayfası (METINLER İ1–İ5); "Hayır" bir daha sorulmaz, Profil'den açılır. Dinleme iki kelime ya da 4 sn sessizlikte
  biter; metin alana yazılır, kişi düzeltip gönderir; hiçbir şey duyulmazsa deneme sayılmaz (D11).
- Info.plist metinleri METINLER İ6–İ7 (sahip onaylı hâli).
Bitti: birim testi (`onDevice: false` → düğme yok; `strictOnDevice` başlatma hatası → klavyeye düşer); cihazda uçak
modunda mikrofonla cevap çalışır (sesin çıkmadığının kanıtı).

### Y6 · Cihaz
PLAN §10 listesi.

## 3. Kalite kapısı
- Her ekran gerçek koddan 390 ve 320, açık ve koyu temada beş yeni değerlendiriciye; soru "5 saniyede etkilendin mi?";
  "idare eder" hayır; en az 4/5. İzin sayfasında ayrıca anlaşılırlık sorusu (≥ 4/5). En çok iki tur.
- Geçmeyen ekran sahibe gösterilmez. Kendin mükemmel bulmadığını gösterme.

## 4. Kurallar
- Görünür cümle, kelime listesi ve ad yalnız METINLER / KELIMELER'deki **S** hâliyle. Yeni cümle gerekirse yaz, kapıdan
  geçir, sahibe sor.
- Gelişim ekranlarında "beyin" ve "tanıma" yok; değişim sözcükleri yalnız dört hüküm.
- Ücretli çağrı yok. Ses, konuşma metni ve mikrofon kullanımı Nef paketine, sunucuya ve Gelişim'e gitmez.
- Doğrulamadan iddia etme; bilmediğin API'yi uydurma; varsayımları "VARSAYIM:" diye yaz; aynı yöntem iki kez
  başarısız olursa dur.
- Her aşama ayrı commit; sonda tam test takımı ve derleme bir kez.
