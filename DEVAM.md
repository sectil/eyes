# DEVAM · Nefona ana oturum devri (2026-10-02, öğleden sonra)

Bu dosyayı okuyan yeni ana oturum, sahibe bir şey sormadan kaldığı yerden devam edebilir. Önce bu dosyanın tamamını,
sonra §6'daki dosyaları oku. Sahip Türkçe yazar. Ona sade, doğru Türkçeyle, kısa ve parantezsiz cevap ver.

## 1. Dal ve PR

- Depo: `sectil/eyes`.
  - Uygulama `app/`: React 19, Vite, Capacitor 8.
  - Belgeler `docs/`, site `site/`.
- Çalışılan dal: `claude/cool-pasteur-j5yupf`. Taslak PR: https://github.com/sectil/eyes/pull/2. Taban dal `master`.
- Son kod commit'i: `d29348f` (sürüm notu 2026-10-02-2). Bu dosya ondan sonra eklendi.
- Ağaç temiz.
  - Testler 2026-10-02 öğleden sonra yeşildi: 183 dosya, 2916 test (`cd app && npx vitest run`, ~4,5 dk).
  - `npx vite build` geçti.
- Yavaş testler: `alarm.test.js` ve `yogaLessons.test.js` tam takım yükünde ara sıra zaman aşımına düşer. Tek başına
  çalıştırınca geçerler.
- En son sürüm notu kimliği: `2026-10-02-2`. Her TestFlight yeni kimlik alır; eski girdiye madde eklenmez (Bug 31).
- TestFlight komutu sahibin Mac'inde: `bash ~/Projects/eyes/app/scripts/testflight.sh`.
- 2026-10-02-2 için komut sahibe verildi. Sahibin cihazda bakıp bakmadığı bilinmiyor.

## 2. Bu oturumda biten işler (commit sırasıyla, eskiden yeniye)

1. D9 uzun yol: `d4481e8`.
   - Yarın bölüm kartının içinde. "bugün" taşıyan kart her zaman görünür.
   - Kör yan yana kapı yöntemi. Sürüm notu 2026-10-01-9.
2. Nef N1, dört aşama:
   - `2c7db0f`: 112 onaylı cümle.
   - `a499aea`: `lib/nef` iskeleti.
   - `22158f3`: modüllerin `nef` alanı, sözleşme testi, kaynaklar.
   - `d1736e7`: planNef, kimlik 7900–7919.
   - `794bc59`: düğme yazıları.
   - `dab864d`: Ana sayfa kartı an motorundan çalışıyor; günlük model çağrısı kalktı. Sürüm notu 2026-10-02-1.
3. Beş yeni modülün sahip isteği ve ekran görüntüleri ayrı oturumlar için kaydedildi:
   - `64e51d4`, `9cdb380`, `dfda62a`, `c687b3f`, `754c37b`.
   - Klasörler: `docs/yol-haritasi/tasarim/{metin-arama,kolonlar,sayi-arama,kelime-hafiza,okuma-anlama}`.
4. Fark Ettin mi?:
   - `1adc4a7`: plan dalından belgeler (`docs/yol-haritasi/tasarim/fark-ettin-mi/`).
   - Metinler, sahip onaylı (METINLER.md'nin S bölümleri):
     - `9cf3a92`: ilk metin listesi.
     - `8b00059` → `432a79e`: yeni metinler; kapıdan geçti, sonra onaylandı.
     - `59c0125` → `0642ab5`: R5 sayım satırı.
     - `94144a4`: M5 notu.
     - `b3fd18e` → `a21ea5a`: ezberleme ve sonuç başlıkları.
     - `67ef555`: Ö1–Ö6 ve ekran kapısı kayıtları.
   - `39777f2` F1–F2: sahne motoru (`lib/streetScenes.js`) ve Ne değişti? mantığı (`lib/streetChange.js`).
   - `125bfed`: plan dosyasına sahip kararları.
   - `21c6d1a`: kararlar ve onaylı metinler kodda (`lib/streetText.js`).
   - `861239a` F3: yeni ekranlar (`screens/StreetWalk.jsx`, `styles/street.css`). Tasarım maketi birebir aktarıldı.
   - `d29348f`: sürüm notu 2026-10-02-2.

## 3. Yarım kalan işler

### 3.1 Fark Ettin mi? (şu anki iş)

- **F3 sahibin cihaz kararını bekliyor.**
  - Ekranlar 5 saniye kapısından hiç geçmedi: kodlu ekran 4 tur, tasarım maketi 2 tur.
  - Sahip "Maketi koda aktar, telefonda bak" dedi; aktarıldı.
  - Sahip ekran görüntüsüyle geri bildirim verirse düzelt.
  - Açık kalan kapı bulguları: `docs/yol-haritasi/tasarim/fark-ettin-mi/kapi/ekran/`.
    - `kod-tur1..4.json`
    - `tasarim-tur1..2.json`
    - `TASARIM.md`
  - Maket ve düzenek depoda:
    - `fark-ettin-mi/maket-f3/` (maket.html, uret.mjs)
    - `fark-ettin-mi/duzenek-f3/` (Playwright çekim, ölçüm, kıyas)
- **F4 Gelişim bağı:** `fark-ettin-mi/ANA_OTURUM_ISTEMI.md` "### F4".
  - Manifest `street-change` metriği (birim `nesne`).
  - `changeText` DIGITS/TRIM.
  - Sonuç ekranında R3/R4 Gelişim'den gelir. Şimdi o alan boş duruyor.
- **F5 Nef ve kaynaklar:** aynı dosya "### F5". PMID'ler `fark-ettin-mi/arastirma/KAYNAKLAR.md`'den kopyalanır, ezberden yazılmaz.
  `remind` alanı eklenir.
- **F6 cihaz denetimi, F7 canlı görevler:** aynı dosya.
- **Küçük açıklar:**
  - Manifestte süre çelişkisi: yol durağı "2 dk", Ana sayfa satırı "~1 dk".
  - Ekranda artık kullanılmayan `silhouetteSVG` ve `subjectSVG` kodda duruyor.
  - Sahibe sormadan temizleme.

### 3.2 Eski açık işler

Ayrıntı `docs/yol-haritasi/YAPILACAKLAR.md`'de. Kısaca:

- **Gelişim merkezi:** G1 kodda ama cihazda [~]. G2 ekranı (GrowthHead, maket 1:1, 5 sn kapısı) **sıradaki büyük iş**.
  G2b, G3 ve G4 planlı.
- **Cihazda bakılacaklar:** D9, Nef kartı (bir hafta), simge ve açılış, alarm, WHO-5, E testi sesi, gece saati.
- **Bekleyen D maddeleri:**
  - D2: il onay düğmesi.
  - D4: alarm Pzt–Cmt ertesi gün çalmadı. Tanı satırı var, sahipten ekran görüntüsü bekleniyor.
  - D7/D8: birincil düğme, titreşim.
  - D10: Günaydın ekranında hava.
  - D11: hava bildirimi doğal değil.
- **Diğer açık işler:**
  - #78: Hatırlatmalar sayfası, etkileme kapısı.
  - #80: Alarm kurulum sayfası yeniden tasarım.
  - Alarm bekleyen bildirim sınırı.
  - B2: sabah havası %30–59 cümlesi.
- **Yoga:**
  - B adımı: ses üretimi ElevenLabs bağlanınca. Ücretli, sahip onayı gerekir.
  - C adımı: doğrulama ve TestFlight.
  - Ders 3 "sonraya kaldı" (`52dcf67`).
- **Site:** nefona.com, yeni modüllerle. Modüller cihazda görüldükten sonra yapılır.

### 3.3 Sahibe sorulmuş ya da sorulması gereken, cevapsız konular

1. **Yılan:** Sahibe "ya oturuma devam et de ya da Nef'ten sonra burada yaparım" diye sorulmuştu; cevap gelmedi.
   Bkz. §5.
2. **Ders 3 sesleri yalnız yerel dalda.**
   - Yerel dal `worktree-wf_62d8458a-757-2` (commit `d581fff`) hiç uzağa gönderilmedi.
   - İçinde `ders3-15.mp3`, `ders3-5.mp3`, `ders3-kuyruk.mp3` var. Ücretli ElevenLabs üretimi olabilir.
   - Ana dal Ders 3'ü bilerek sonraya bıraktı.
   - Bu sesleri korumak için dalı uzağa göndermek sahibin iznine bağlı. Başka dala push izni yok; sor.
   - Aynı yerde `scratchpad/yoga/render` (6 GB, 723 mp3) duruyor; silinmedi. Container kapanınca kaybolur.
3. **Nefona özeti denetiminde çıkan iki çelişki** (sahibe söylendi, karar gelmedi):
   - Site (`site/pages/index.html:133`) "Öneriyi bir dil modeli üretir" diyor. Rıza metni
     (`app/src/lib/consent.js:56-69`) OpenRouter'a gönderimi anlatıyor. Oysa Ana sayfa Nef kartı artık model
     çağırmıyor.
   - Rıza ve site metni sahip onayı olmadan değişmez.
4. **Metin Arama oturumunun açık soruları** (§5). Onlar o oturumun dosyasında, sahibe henüz iletilmedi.

## 4. Sohbette verilen kurallar, kararlar ve onaylar

Bunların bir kısmı başka dosyalarda da var; burada hepsi tek yerde. Çelişki olursa sahibin son sözü geçerli.

### 4.1 Sahibin kişisel kuralları (kelimesi kelimesine)

1. "Haklısın, bir daha yapmayacağım" yasak. Hatayı somut adıyla söyle + hangi kuralı uygulayacağını yaz. Söz verme,
   kural koy.
2. Doğrulamadan iddia etme. Dosya/kod/çıktı görmediysen "bakmadım" de. "Sanırım", "muhtemelen" yerine "bilmiyorum,
   kontrol edeyim".
3. Bilmediğin parametre / fonksiyon adı / dosya yolu / komut UYDURMA. Bilmiyorsan ara veya sor.
4. Sorulmayanı yapma. Refactor, "iyileştirme", ekstra dosya değişikliği yok. Yapacaksan önce izin iste.
5. Aynı yöntem 2 kez başarısız olduysa 3.'yü deneme. DUR — yöntemi değiştir veya bana sor.
6. Varsayım yapıyorsan açıkça "VARSAYIM:" diye işaretle. Sessiz varsayım yok.
7. Büyük değişiklikten önce planı yaz, onay bekle. Yarı yolda scope büyütme yok.
8. Daha önce düzeltilmiş bir bug'ı tekrar "düzeltmeye" kalkmadan önce CLAUDE.md / git log / memory kontrol et.

### 4.2 Güvenlik

- ElevenLabs, OpenRouter, EyeTrail, Supabase service_role/sb_secret, RevenueCat sk_, .p8 ve Google client secret
  uygulamaya, depoya ya da sohbete asla yazılmaz.
- "Anahtarlar yalnız ortam değişkeninden okunur; depoya ve sohbete yazılmaz."
- "Ücretli çağrı (ElevenLabs sesleri, Nef bankası üretimi) yapmadan önce benden onay al."
- "Rıza metinleri ben onaylamadan koda girmez."
- "Bir parça ancak cihazda doğrulanınca [x] olur."
- Kamera görüntüsü cihazdan çıkmaz.
- Kullanıcının e-postası dış servise gönderilmez.
- Apple ve Google girişi bozulmaz.
- Ağ ve güvenlik kısıtları aşılmaz.

### 4.3 Süreç

- **Push sonrası ilk satır:** Her push'tan sonra cevabın ilk satırı ya "ŞİMDİ MAC'TE ÇALIŞTIR" + komut, ya da "Bekle".
- **5 saniye kapısı:** Ayrıntı `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, "Her tasarım: 5 saniyede etkileme ve mükemmellik" bölümü.
  - 5 bağımsız değerlendiriciye "etkilendin mi?" sorulur. "İdare eder" = hayır.
  - Geçme ≥ 4/5, iki temada, 390 ve 320 genişlikte.
  - En çok 2 tur; sonra yöntem değişir ya da sahibe sorulur.
  - Sonra benim onayım. Sahibe kusurlu şey gösterilmez.
- **Görünür her cümle:** taslak → 5 kişilik metin kapısı → benim onayım → sahibin onayı. Ancak ondan sonra koda girer.
  Ekran okuyucu etiketleri de buna dahil.
- **Kapı araçları:** `docs/yol-haritasi/kapi-araclari/OKU.md`. Bu oturumdaki iki hatanın kuralları orada:
  - Kapıdan önce PLAN ile karşılaştır.
  - Yargıç açıklamasını o turun tasarım notundan yeniden yaz.
  - Kenar, taşma ve hizayı önce ölç.
- **Paralel iş:** Aynı anda en çok 2 iş akışı (Workflow).
- **Commit:**
  - Yazar `Claude <noreply@anthropic.com>`.
  - Son satırlar: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ve
    `Claude-Session: https://claude.ai/code/session_013UmmFQqUrXLc8JthuZp6Zt`.
  - Push'tan önce her zaman `git fetch`.
  - Kırmızı ya da yarım kod commit edilmez. Testleri geçmemiş ya da kapıdan geçmemiş ekran işi yarım sayıldı.
  - Commit, PR ve kodda model adı yok.
- **Her TestFlight yeni sürüm notu kimliği alır.** Sürüm notu da görünür metindir: kapı → sahip onayı.
- **Yeni modül hatırlatması:** "her yeni modül otomatik isteğe bağlı hatırlatma yapılabilir". Her yeni modülün
  manifestinde `remind` alanı olur.
- **Alt ajanlar:** Raporları doğrulanmadan kabul edilmez. Testi ve derlemeyi ana oturum kendisi çalıştırır.
- **Disk:** Dolabilir. Yeniden üretilebilir dosyalar silinebilir; ücretli ses üretimleri ve uzağa gitmemiş commit'ler
  silinmez.

### 4.4 Sıra ve kapsam kararları

- **İş sırası:** Nef (bitti) → Fark Ettin mi? (sürüyor) → Gelişim merkezi G2.
  - Sahip: "yoo normal sıranla devam et", "sıradaki işe geçelim".
- **Modüller:** "modülleri tek tek gözden geçiriyoruz ve yeni modüller ekleniyor". "sonsuz yol önemli".
- **Yeni modül oturumları:**
  - Sonra, birer birer ve işler karıştırılmadan entegre edilir.
  - Entegrasyonda her yeni modülün `remind` alanı kontrol edilir.
  - Metin Arama ile Okuma anlama'nın aynı metin bankasını paylaşıp paylaşmayacağına karar verilir.
  - Var olan okuma modülü ve `reading-cps` ile çakışma çözülür.

### 4.5 Fark Ettin mi? kararları (2026-10-02)

- "Gözünden kaçan" sorusu onaylı metinle kalır: "… vardı. Onu fark ettin mi?" Gördüm · Görmedim. Yakalama sorusu
  yok. PLAN §9 ve §9c'ye işlendi.
- İlk 4 gün yalnız Cadde.
  - 2 ve daha çok sahne açıkken aynı sahne art arda gelmez.
  - Bir sahne 7 günde en çok 2 kez gelir.
  - Seçim tohumla rastgele.
  - Ajanın eklediği "bir önceki tur yasağı" kaldı.
- Ekranda yalnız METINLER.md'nin S bölümlerindeki metin görünür; test bunu kilitliyor.
  - S bölümleri: ilk liste, yeni metinler, R5, M5, ezberleme ve sonuç başlıkları, Ö1–Ö6.
- M5 iddia sınırı notu değişti: "Bu bir fark etme alıştırması. Günlük hayatta daha çok fark etmeni sağladığına dair
  henüz kanıt yok."
- M4'teki sahne sayısı yer tutucudur. F1 basamağında "3 sahne" yazar.
- Bilim kartı kapalı başlar. `factOpen` ancak açılınca true olur.
- **F3 yöntemi:** önce "Önce tasarım, sonra kod", sonra "Maketi koda aktar, telefonda bak".
- "Kaçırdığın / Saydığın araba" etiketleri onaylı ama kullanılmıyor. Sebep: kişi "4" deyince hangi arabayı
  kaçırdığı bilinemez, bu sahte kesinlik olurdu.
- Sürüm notu 2026-10-02-2'de yalnız kapıdan geçen iki madde var. İlk madde üç turda geçmedi; sahip "Yalnız geçen iki
  madde" dedi.
- **Bekleyen tasarım önerileri** (tasarımcının ÖNERİ METİN 8–11): onaysız, kullanılmıyor.
  - KAÇTI satırının sözlü karşılığı
  - TAHMİN rozeti açıklaması
  - Bilim kartı gövdesindeki emir kipi

### 4.6 Nef kararları (N1)

Onay ve kapı kayıtları `docs/yol-haritasi/tasarim/nef/` altında (N1-CUMLELER-onay.md, kapi/).

- 112 cümle onaylı.
- Sıcak hava yalnız kartta, bildirimde değil.
- Nef uykudan söz etmez.
- Yön'ün "rahatsızlık" puanını anmaz.
- Alarmı ve Farkındalık merkezini anmaz (NEF_SILENT; liste test ile kilitli).
- Ayna'nın adı "Yön alıştırması".
- Süre sınırı kaynağı kalır.
- CSV satır etiketi "Nef'in söylediği · FT-7 · kart".
- "Üçlü düzeltme" ve düğme yazıları onaylı.
- **"Kart yalnız güçlü haberde":** örüntü F2.C/F2.D ve metricChange.
- İki fazla uzun başlık bildirimden çıkarıldı (sahip: "onay").

### 4.7 D9 ve Ana sayfa

- "Yarın'ı bölüme kat".
- Kapı yöntemi "Yan yana karşılaştırma".
- "bugün" taşıyan kart her zaman görünür.

## 5. Alt oturumlar

Hepsi boşta; hiçbiri şu an çalışmıyor.

| Oturum | Dal · PR | Durum | Ana oturuma düşen |
|---|---|---|---|
| Yılan `session_017cpTsgm5KvnDNXkCh5MZht` | `claude/yilan-bakis` · #9 | Kod dalda, tasarım kapısı 2 turda geçmedi. `DUZELTME_OTURUMU_ISTEMI.md` yazıldı **ama o oturum hiç açılmadı**. | Entegrasyon için `yilan/5SN_SONUC.md` (her ekran ≥ 4/5) ve §7 cümlelerine sahip onayı gerekir; ikisi yok. Önce sahibe nasıl ilerleneceğini sor. İstem: `docs/yol-haritasi/tasarim/yilan/ANA_OTURUM_ISTEMI.md` (dalda). |
| Metin Arama → "Kelime Avı" `session_01CqZxzAbdLHcym5H2hpAaM8` | `claude/metin-arama` · #10 | Tasarım bitti, sahip girdisi bekliyor. | §7 açık konular: METINLER onayı (24 metin), "En iyi turun {x} sn" satırı ve sonucun sıradan tur hâli 0/5. İstem: `metin-arama/ANA_OTURUM_ISTEMI.md` sürüm 2. |
| Kolonlar → "Kelime İzi" `session_01EVsz4q4kjJv5mmq5ziFu32` | `claude/kolon-takip` · #11 | İstem sürüm 1 hazır. | `kolon-takip/ANA_OTURUM_ISTEMI.md`. Onay durumu istemin başında. |
| Sayı arama → "Rakam Avı" `session_01NyHFcLTsXZqe9scZUHFZuf` | `claude/sayi-arama` · #12 | İstem sürüm 2 hazır. | `sayi-arama/ANA_OTURUM_ISTEMI.md`. |
| Kelime hafıza → "Yakala Yaz" `session_01QDh6GTjnYiuwkE6bhtCph8` | `claude/kelime-hafiza` · #13 | Sahip metinleri, kelime listesini ve adı onayladı. İstem sürüm 1 hazır. | `kelime-hafiza/ANA_OTURUM_ISTEMI.md`. |
| Okuma anlama → "Oku ve Anla" `session_01JawYqo4frSZipfxw1T9D1F` | `claude/okuma-anlama` · #14 | 120 metin ve 5 ekran onaylı. İstem hazır. | `okuma-anlama/ANA_OTURUM_ISTEMI.md`. |
| Fark Ettin mi? planı `session_019xUKKy1v7zcw1t9UnPWx5Y` | `claude/fark-ettin-mi-plan` · #8 | Bitti. Belgeler ana dala alındı (`1adc4a7`). | Yok. |
| Daha eski plan oturumları | Nef #7, Gelişim #6, bildirim/hava #5, yoga devri #4 | Planları ana dala alındı. Nef N1 bitti; Gelişim G1 bitti, G2 sırada. | Gelişim G2 için `gelisim-merkezi/` belgeleri. |

İstem dosyaları dallarda. Okumak için: `git fetch origin claude/<dal> && git show origin/claude/<dal>:<yol>`.

Entegrasyon kuralı:
- Ana dalın son hâlinden çalış.
- Modül dalını **merge** et; rebase ya da force-push yok.
- Bir seferde tek modül.
- Tam takım ve derleme yeşil olmadan commit yok.

## 6. Sıradaki adımlar ve önce bakılacak dosyalar

### Önce oku

1. Bu dosya.
2. `docs/ANA_BELGE.md`: ürün, kimlik, ilkeler.
3. `docs/yol-haritasi/IS_AKISI_KURALLARI.md` ve `docs/yol-haritasi/kapi-araclari/OKU.md`.
4. `docs/yol-haritasi/YAPILACAKLAR.md` ve `docs/yol-haritasi/HATA_GUNLUGU.md`.
5. Fark Ettin mi? dosyaları, `docs/yol-haritasi/tasarim/fark-ettin-mi/` altında:
   - `PLAN.md` (§5b, §9, §9c)
   - `METINLER.md`: S bölümleri dosyanın sonunda.
   - `ANA_OTURUM_ISTEMI.md`: F4–F7.
   - `kapi/ekran/TASARIM.md`
6. Koddaki karşılıkları:
   - `app/src/lib/streetText.js`, `street.js`, `streetChange.js`, `streetScenes.js`
   - `app/src/screens/StreetWalk.jsx`
   - `app/src/modules/fark-ettin/manifest.js`
7. Nef ve Gelişim:
   - `docs/yol-haritasi/tasarim/nef/PLAN.md`
   - `docs/yol-haritasi/tasarim/gelisim-merkezi/` (ANA_OTURUM_ISTEMI.md, DEVIR.md)
   - `app/src/lib/growthCenter.js`

### Sıra

1. **Sahibin Fark Ettin mi? cihaz geri bildirimi gelirse önce onu düzelt.** Yeni bir TestFlight gerekirse yeni sürüm
   notu kimliği verilir; sürüm notu da kapıdan ve sahip onayından geçer.
2. **Fark Ettin mi? F4 Gelişim bağı.** Ardından F5 Nef ve kaynaklar (`remind` alanı dahil), sonra F6 cihaz listesi,
   sonra F7 canlı görevler. Her aşamada tam takım ve derleme; görünür metin onaysız girmez.
3. **Gelişim merkezi G2 ekranı.** Maket 1:1, 5 sn kapısı.
4. **Yeni modüllerin entegrasyonu.** §5'teki önkoşullar ve kurallarla, birer birer. Hangi modülün önce geleceğini
   sahibe sor; bu konuda bir karar yok.
5. **§3.3'teki cevapsız konular:** Bir fırsatta sahibe kısa ve tek tek sor. Ücretli ses dosyaları ve uzağa
   gitmemiş dal (Ders 3) için karar gelmeden hiçbir şey silme.
