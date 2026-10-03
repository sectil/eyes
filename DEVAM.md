# DEVAM · Nefona ana oturum devri (2026-10-03, sabah)

Bu dosyayı okuyan yeni ana oturum, sahibe bir şey sormadan kaldığı yerden devam edebilir. Önce bu dosyanın tamamını,
sonra §9'daki dosyaları oku. Sahip Türkçe yazar. Ona sade, doğru Türkçeyle, kısa ve parantezsiz cevap ver.

Bu dosya 2026-10-02 öğleden sonraki devrin yerine geçer; eski metin `git show d0f40a9:DEVAM.md` ile okunur. Oradaki
hâlâ açık her iş burada da var.

**Oturum başka bir Claude hesabından sürdürülecek.** O hesapta bu oturumun kancaları, bağlayıcıları, hafızası ve
geçici dosyaları yoktur. Gereken her kural, karar ve araç bu dosyada ya da depoda. Geçici klasördeki hiçbir şeye
güvenme; sahibe "önceki oturumda şöyleydi" diye sorma, burada yazanı uygula.

## 0. Tek bakışta

- Depo `sectil/eyes`. Uygulama `app/` (React 19, Vite, Capacitor 8, vitest). Belgeler `docs/`, site `site/`.
  Aynı hesapta görünen `sectil/karun` deposu bu işle ilgisizdir; dokunma.
- Çalışılan dal: `claude/charming-thompson-hbx2wd`. Taslak PR: https://github.com/sectil/eyes/pull/16.
  PR'ın taban dalı `claude/cool-pasteur-j5yupf`; onun taslak PR'ı https://github.com/sectil/eyes/pull/2, tabanı `master`.
  Zincir: `master` ← #2 ← #16. İki PR de açık, birleştirilmedi; #16 çakışmasız.
- Son kod commit'i `c7dba35`. Bu dosya ve düzenek klasörleri ondan sonra eklendi.
- Ağaç temiz. Tam takım yeşil: 191 dosya, 2989 test, 5 todo (`cd app && npx vitest run`, 4–5 dk). `npm run build` geçti.
- Son sürüm notu kimliği `2026-10-02-5`. Her TestFlight yeni kimlik alır; eski girdiye madde eklenmez (Bug 31).
- TestFlight komutu sahibin Mac'inde: `bash ~/Projects/eyes/app/scripts/testflight.sh`. 2026-10-02-5 için komut sahibe
  verildi. Sahibin derleyip cihazda bakıp bakmadığı bilinmiyor.
- Sahibin cevap vermediği sorular §3.1'de. İlk iş onlar değil; ilk iş sahibin cihaz geri bildirimi gelirse onu düzeltmek.

## 1. Depo, dal ve nasıl başlanır

```
git fetch origin claude/charming-thompson-hbx2wd claude/cool-pasteur-j5yupf
git checkout -B claude/charming-thompson-hbx2wd origin/claude/charming-thompson-hbx2wd
cd app && npm ci        # node_modules yoksa
npx vitest run          # 191 dosya yeşil olmalı
npm run build
```

- Harness sana başka bir dal verdiyse o dalı bu dalın ucundan başlat
  (`git checkout -B <yeni-dal> origin/claude/charming-thompson-hbx2wd`), sahibe bunu bir satırla söyle ve PR'ı
  `claude/cool-pasteur-j5yupf` tabanına aç. #16'yı kapatma; sahip hangisini birleştireceğine karar verir.
- Push'tan önce her zaman `git fetch`. Rebase ve force-push yok.
- Tasarım dalları: `claude/okuma-anlama` (#14) bu dala **merge edildi** (`7471608`). `claude/kelime-hafiza` (#13) git
  olarak merge edilmedi; belgeleri bu dalda aynen var (`docs/yol-haritasi/tasarim/kelime-hafiza/`), fark yalnız bu
  oturumun eklediği kapı kayıtları. #13 yalnız kayıt; birleştirmeden önce `git diff` ile bak, sahibe sor.
- Yavaş testler: `alarm.test.js` ve `yogaLessons.test.js` tam takım yükünde ara sıra zaman aşımına düşer; tek başına
  geçerler.

## 2. Bu oturumda bitenler

Üç iş bitti, hepsi commit'li ve push'lu. Commit'ler `git log origin/claude/cool-pasteur-j5yupf..HEAD`.

### 2.1 Oku ve Anla entegrasyonu (istem O1–O4, bitti)

Sahip kararı 2026-10-02: okuma testi sonsuz yoldan çıkar, Pratikler'de isteğe bağlı kalır; testin kendisi, ölçüsü ve
kayıtları değişmez. Yolda onun yerine **Oku ve Anla** gelir: haftada 3 gün, yola kayıtlı 3. günden.
Sahip: "ve tabiiki sonsuz yola modül olarak eklenecek .. unutma bütün modüller sonsuz yola bağlanır ve gelişim
merkezinde depolanır ve değerlendirilir".

- `a3a82df` modül, seçim, ölçüm, bağlantılar; `7471608` tasarım dalı merge; `157fd8d` sonuç ve sayılmadı ekranları
  sahip onaylı ("OK ONAYLIYORUM"); `bac7e82` sürüm notu `2026-10-02-3`.
- Metin bankası `lib/okumaBank.json` 120 metin, `banka/taslak-01..12.json` ile birebir aynı içerik.
- Seçim `lib/okumaSelect.js`: kişiye özgü sıra, banka bitmeden tekrar yok, art arda aynı etiket yok; 1 000 tohum ×
  365 gün benzetimle sınanıyor.
- Ölçüm `lib/okumaMeasure.js`: hız yalnız en az 3/4 doğru ve 60–600 kelime/dk aralığında kaydedilir; nedenler
  `dusuk-anlama`, `cok-hizli`, `cok-yavas`, `ara`.
- Bağlantılar: Gelişim iki ölçü (`okuma-anlama-hiz`, `okuma-anlama-anlama`), Nef (`MC-OA1`, `FTB-OA1`, `RG-OA1`),
  hatırlatma `remind.okuma-anlama` OA1–OA3, kaynaklar `sources.js`.
- Gerçek kodla 5 sn kapısı: `okuma-anlama/kapi/kod-tur1.md`, `kod-tur2.md`, `5sn-tur8.md`, `metin-tur1.md`.

### 2.2 Yakala Yaz (istem Y1–Y5 bitti; Y6 cihaz sahipte)

Sahip: "mükemmel olacak . sen onayla . 5 sn kuralı unutma" (iki kez). Onay yetkisi bu işte bana bırakıldı; sahibe
yalnız kararı gereken yerler soruldu.

- `fb43b0c` Y1 mantık; `3d12c72`, `2828e0c` Y2 ekranlar ve kapı; `b963af1` Y3–Y4 modül, yol, Gelişim, Nef,
  hatırlatma; `a608b4c`, `5fb661f`, `a76f0d5`, `f7f468b`, `a8b8504`, `41dfcee` Y5 mikrofon ve kapı kayıtları.
- Mantık: 18 basamak, doğruda +1, yanlışta −3, tur eşiği son 10 denemenin ortancası; 384 onaylı kelime; 90 günlük
  benzetim testte.
- Ekranlar: giriş, gösterim, yazma, doğru, yanlış, sonuç, mikrofon izni. Gösterim kare sayımıyla; 1 kareden çok sapan
  deneme ölçüye girmez.
- Yol: UNLOCK 9, haftada en çok 3 gün, 2 dk; Tek Bakışta ile aynı gün gelmez; ışığa duyarlılık "evet" ya da "emin
  değilim" ise yolda yok.
- Mikrofon: ses telefondan çıkmaz. `SpeechPlugin.swift` `strictOnDevice`; cihaz içi yoksa düğme hiç görünmez. İzin
  sayfası İ1–İ5. Dinleme iki kelime ya da 4 sn sessizlikte biter; metin alana yazılır, otomatik gönderme yok. Ses
  seviyesi çubukları `speechLevel` olayıyla, yalnız 0–1 arası sayı. Profil'de "Yazmak yerine sesle söyle".
  Info.plist İ6–İ7.
- Sahip kararları (AskUserQuestion ile): gösterimde alan gizlensin; yazmada merdiven canlı kalsın; sonuçta hızlandıkça
  çizgi yükselsin; dinlerken "Durdur" yazısı; ses seviyesi çubuğu; "bir tur daha" kapı.
- Kapı: `kelime-hafiza/kapi/kod-y2.md` ve `kod-y5.md`. Altı ekran geçti; mikrofonlu dört ekran 4/5; izin sayfası 5/5.
- Sürüm notu `2026-10-02-4`.

### 2.3 Oku ve Anla: giriş, ekran yazıları ve metin bankası (sahip isteği, bitti)

Sahip, kelimesi kelimesine: "OKUMA HIZI VE ANLAMA MODLÜNDE BAZI EKİSKLİKLER VAR... TAM GİRİŞ KISMINDA NE YPAMSI
GERERİĞİNİ ANLATMIYOR GİRİŞ KISMI 5 SN KURALINDA YETERSİZ... BEN NE YAPCAĞIM OKUYUP NE OLACAK TAM BİR BİLGİ SAHİBİ
DEĞİLİM. AYRICA MODÜL VE MDOLÜDE KULLANCILAN DEKİ YAZILAR TÜRKÇEYE DÜZGN ÇEVRİLMEMİŞ ANLAMDA SORUNLAR VAR. GÖZDEN
GEÇİRİP DÜZELTMENİ İSTİYORUM 5 SN VE MÜEKMMELİK KURALNINA UYGUN OLSUN". Sahip seçenekleri: derinlik "Türkçe + kaynak
özeti"; plan "Uygun, başla".

**Ekranlar** (`screens/OkuAnla.jsx`, `styles/okuma.css`), hepsi kapıdan geçti:
- Giriş: üç adım "Oku · Süre, metin açılınca başlar" / "Bitirince "Bitirdim"e bas · Süre o anda durur" / "Dört
  soruyu cevapla · En az üçünü bilirsen okuma hızın kaydedilir"; alt not "Hızın, bir dakikada okuduğun kelime
  sayısıdır." Logonun çevresindeki dönen yazı kalktı; 320'de logo yok.
- Her yerde tek söz: "kaydedilir" ("sayılır" yok). Nef'in iki cümlesi de buna uydu (FTB-OA1, RG-OA1); eski hâlleri
  `nef/N1-CUMLELER-onay.md`'de.
- Soru halkasında "Soru 2/4"; 320×568'de halka yerine "Soru 2/4" ve dört çizgi; 390'da halka 128 px.
- Sonuç: "Başlangıç hızın · N gün daha okuyunca belli olacak" (sayaç günleri sayar); "Kaynak · Yazar ve ekibi, yıl";
  "Bir dahaki sefere"; "dört sorudan en az üçünü".
- Pratikler kartı ve geçmişte "3/4 doğru".
- Bankadaki 720 sorunun hepsi, cevaplanmış hâlde, 320 ve 390'da düğmeye çarpmadan sığıyor (`duzenek/stres.mjs`).
- Kapı kaydı: `okuma-anlama/kapi/ekran-yenileme-2026-10-02.md`. Tur 1 ve 2 geçmedi; yöntem değişti (kusur listesi
  doğrulaması + 5 sn); tur 3'te yedi ekran 5/5, eski yedi kusur 5/5 düzeldi; halka küçülünce soru ekranı tekrar 5/5.
- Görünür cümlelerin son hâli `okuma-anlama/METINLER.md` §5'te. Hatırlatma OA3 üç yerde güncel: `remindTexts.js`,
  `METINLER.md`, `bildirim-hava-yuruyus/metin-B1a-onay.md`.

**Metin bankası** (120 metin, 720 soru), kayıt `okuma-anlama/kapi/banka-denetim-2026-10-02.md` ve okur bulguları
aynen `okuma-anlama/kapi/okur-bulgulari-2026-10-02.md`:
- Tur 1: 110 metin Türkçe ve PubMed özetine göre düzeltildi; 8 metinde özetle uyuşmayan bilgi düzeldi.
- Tur 2: 30 metinlik örneklem 4/30 E çıktı; bulgu listesiyle 114 metinde 569 düzeltme.
- Tur 3, yöntem değişti: altı okur 120 metnin hepsinde yalnız kusur aradı (98 metinde 194 kusur); ayrı editörler
  düzeltti (özetle çelişen 4 öneri reddedildi); sahip onayıyla ("Onay") 120 ana fikir sorusunun yanlış seçenekleri
  yenilendi, 8 doğru seçenek aynı anlamla yeniden yazıldı; altı doğrulayıcı 106 öneri verdi, hepsi işlendi.
- Son kapı: 30 metinlik yeni örneklem 6/30 E. Sahip kararı, kelimesi kelimesine: "Somut kusurları düzelt, bitir".
  24 metindeki somut kusurlar düzeltildi, iş orada bitti.
- Durum: `denetle.mjs` ve `bankProblems` temiz. Ama her yeni sıkı okur yeni ve küçük kusur buluyor; kapı bu bankada
  kendiliğinden kapanmıyor. Kalan sorunların çoğu ana fikir sorusunda: başlığa bakarak bulunabiliyor ya da bir ayrıntı
  sorusunun cevabını ele veriyor. Sahibe sunulan ama seçilmeyen yol: ana fikir sorusunu başlıktan bağımsız kurmak
  (başlık sorulardan sonra görünsün ya da soru "bu metnin başlığı ne olmalı" olsun).
- Sürüm notu `2026-10-02-5` (A 5/5, B 4/5, kayıt `ekran-yenileme-2026-10-02.md` sonu).

## 3. Açık işler

### 3.1 Sahibin cevabını bekleyenler (bu oturumdan, cevap gelmedi)

Hepsi sahibe yazıldı; cevap yok. Yeni oturum kısa ve tek tek sorabilir. Hiçbirini sormadan yapma.

1. **Nef adı:** sonuç ekranlarında "Nef" konuşuyor; ilk kez gören kim olduğunu bilmiyor (5 okurdan 4'ü). Uygulama
   geneli bir karar; Nef N1 belgeleriyle birlikte düşünülmeli.
2. **"İnsan" konu etiketi:** okuma ekranında kişi simgesiyle, yazar adının yanında; yazar bilgisi sanılıyor (4/5).
   Simge ya da yazım değişsin mi?
3. **Hız kaydedilmedi ekranı:** hangi soruların yanlış olduğu görünmüyor; "Tekrar dene" düğmesi yok. Özellik isteği.
4. **"Bir dahaki sefere biraz daha yavaş oku":** yavaş okuyup yanlış yapan birine uymuyor (1/5). Yalnız hızlı
   okuyana gösterilsin mi?
5. **"Sürüngenler ve kurbağalar" etiketi** semender metinlerinde de kullanılıyor (oa064 "Ağaçtan süzülen semender").
   Doğrusu "Sürüngenler ve iki yaşamlılar"; sahibe soruldu, cevap yok. Etiket `okumaBank.json` `etiketler.surungen`.
6. **oa118 "Tıklayan böcek":** böceğin yerleşik Türkçe adından emin olunamadı; uydurulmadı, sahibe soruldu.
7. **Metin bankası kalitesi:** son kapı 6/30. Sahip "bitir" dedi. İleride ayrı iş olarak sürdürülürse yöntem §5.2.
8. **Yakala Yaz cihaz denetimi (Y6):** liste `kelime-hafiza/PLAN.md` §10. Özellikle: ses çubukları gerçek telefonda
   oynuyor mu; uçak modunda sesle cevap çalışıyor mu; iOS konuşma izni penceresinin kendi metni İ3 ile çelişiyor mu.
   VARSAYIM: çelişmiyor; bakılmadı.

### 3.2 Cihazda bakılacaklar (bu oturumun TestFlight'ları)

- 2026-10-02-3 Oku ve Anla, 2026-10-02-4 Yakala Yaz, 2026-10-02-5 Oku ve Anla yenileme. Sahip bu üç derlemeden
  hangisini cihaza aldı, bilinmiyor. Geri bildirim gelirse ekran görüntüsüyle düzelt; yeni TestFlight gerekirse yeni
  sürüm notu kimliği, sürüm notu da kapı ve sahip onayından geçer.
- Oku ve Anla'da cihazda henüz hiç bakılmayanlar: okuma süresi gerçek cihazda, "Bitirdim" dokunma alanı, arka plana
  geçince `ara` nedeni, yazı boyutu büyütülmüş telefonda sığma.

### 3.3 Önceki devirden taşınan açık işler (bu oturumda dokunulmadı)

Ayrıntı `docs/yol-haritasi/YAPILACAKLAR.md` ve `docs/yol-haritasi/ACIK_ISLER.md`. Kısaca, eski devirden aynen:

- **Fark Ettin mi?:** F3 sahibin cihaz kararını bekliyor (ekranlar kapıdan hiç geçmedi; "Maketi koda aktar, telefonda
  bak" dendi, aktarıldı). Sonra F4 Gelişim bağı, F5 Nef ve kaynaklar, F6 cihaz, F7 canlı görevler:
  `fark-ettin-mi/ANA_OTURUM_ISTEMI.md`. Küçük açıklar: manifestte süre çelişkisi (yol "2 dk", Ana sayfa "~1 dk");
  kullanılmayan `silhouetteSVG` ve `subjectSVG`; sahibe sormadan temizleme.
- **Gelişim merkezi:** G1 kodda ama cihazda [~]. G2 ekranı (GrowthHead, maket 1:1, 5 sn kapısı) sıradaki büyük iş.
  G2b, G3, G4 planlı. Belgeler `gelisim-merkezi/`.
- **Cihazda bakılacaklar (eski):** D9, Nef kartı bir hafta, simge ve açılış, alarm, WHO-5, E testi sesi, gece saati.
- **Bekleyen D maddeleri:** D2 il onay düğmesi; D4 alarm Pzt–Cmt ertesi gün çalmadı (tanı satırı var, ekran
  görüntüsü bekleniyor); D7/D8 birincil düğme, titreşim; D10 Günaydın'da hava; D11 hava bildirimi doğal değil.
- **Diğer:** #78 Hatırlatmalar sayfası etkileme kapısı; #80 alarm kurulum sayfası; alarm bekleyen bildirim sınırı;
  B2 sabah havası %30–59 cümlesi.
- **Yoga:** B adımı ses üretimi ElevenLabs bağlanınca, ücretli, sahip onayı; C adımı doğrulama ve TestFlight; Ders 3
  "sonraya kaldı".
- **Site:** nefona.com, yeni modüllerle; modüller cihazda görüldükten sonra.

### 3.4 Cevapsız konular (önceki devirden, sahibe iletilmiş ya da iletilecek)

1. **Yılan:** "ya oturuma devam et ya da Nef'ten sonra burada yaparım" diye soruldu; cevap yok. §7.
2. **Ders 3 sesleri:** `claude/yoga-ders3-sesler` dalı, PR #15, yalnız saklama, BİRLEŞTİRİLMEZ. Alınacağı zaman yalnız
   `app/public/yoga/ders3-*` seçilir. 6 GB render klasörü geçici klasördeydi; bu oturumun container'ında yok.
3. **Nefona özeti çelişkisi:** `site/pages/index.html:133` "Öneriyi bir dil modeli üretir"; rıza metni
   `app/src/lib/consent.js:56-69` OpenRouter'a gönderimi anlatıyor; oysa Ana sayfa Nef kartı artık model çağırmıyor.
   Rıza ve site metni sahip onayı olmadan değişmez.
4. **Metin Arama'nın açık soruları** ve **ortak metin bankası kararı:** Metin Arama ile Oku ve Anla aynı bankayı
   paylaşacak mı? Karar yok. Oku ve Anla, Metin Arama'nın 10 bulgusunu kullanmıyor (`okumaBank.js` `BANNED_PMIDS`).
5. **Hangi modül önce entegre edilecek:** Kalanlar Metin Arama, Kolonlar, Sayı arama, Yılan. Karar yok.

## 4. Kurallar

Çelişki olursa sahibin son sözü geçerli.

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
9. Tur sınırı (2026-10-03): "şöyle bazen çok uğraşıyrosun örneğin 2 tur düzeltme yaptım içerisinde hangisi en iyisi ise onu seç... 3. tura kalmasın çok fazla token harcıyorsun bunnu bir kural olarak yaz . yoksa devvamlı döngüde kalıyorsun... 5 sn ve mükemmlik kuralna uygun olarak."
   Uygulaması: her iş en çok iki tur (ilk sürüm + bir düzeltme). Sonra iki sürümden 5 sn ve mükemmellik ölçütüne göre
   en iyisi seçilir. Üçüncü tur ve yeni yöntem yok; seçilen sürüm kapıdan geçmediyse sahibe gösterilir, karar onundur.
   İş akışı döngüleri de en çok iki tur kurulur. Ayrıntı `docs/yol-haritasi/IS_AKISI_KURALLARI.md` "Tur sınırı".

### 4.2 Güvenlik

- ElevenLabs, OpenRouter, EyeTrail, Supabase service_role/sb_secret, RevenueCat sk_, .p8 ve Google client secret
  uygulamaya, depoya ya da sohbete asla yazılmaz. Anahtarlar yalnız ortam değişkeninden okunur.
- Ücretli çağrı (ElevenLabs sesleri, Nef bankası üretimi) yapmadan önce sahipten onay.
- Rıza metinleri sahip onaylamadan koda girmez. Site ve rıza metni sahip onayı olmadan değişmez.
- Bir parça ancak cihazda doğrulanınca [x] olur.
- Kamera görüntüsü cihazdan çıkmaz. Kullanıcının e-postası dış servise gönderilmez.
- Ses, konuşma metni ve mikrofon kullanımı Nef paketine, sunucuya ve Gelişim'e gitmez; kayıtta yalnız denemenin
  `mode` alanı.
- Apple ve Google girişi bozulmaz. Ağ ve güvenlik kısıtları aşılmaz.

### 4.3 Süreç

- **Push sonrası ilk satır:** her push'tan sonra cevabın ilk satırı ya "ŞİMDİ MAC'TE ÇALIŞTIR" + `bash
  ~/Projects/eyes/app/scripts/testflight.sh`, ya da "Bekle". TestFlight yalnız sahibe gösterilecek iş bitince.
- **Her turun sonunda ağaç temiz ve push'lu olur.** Kırmızı ya da yarım kod commit edilmez; testleri geçmemiş ya da
  kapıdan geçmemiş ekran işi yarım sayılır. Önceki hesapta bunu bir kanca da zorluyordu; yeni hesapta kanca
  olmayabilir, kural aynen geçerli.
- **Commit:** yazar `Claude <noreply@anthropic.com>` (`git -c user.name=Claude -c user.email=noreply@anthropic.com
  commit`). Son satırlar: harness'in sohbet başında verdiği `Co-Authored-By` ve `Claude-Session` satırları, aynen.
  Commit mesajında, PR'da, kodda ve belgelerde model adı yazılmaz. Push'tan önce `git fetch`.
- **5 saniye kapısı:** ayrıntı `docs/yol-haritasi/IS_AKISI_KURALLARI.md` "Her tasarım: 5 saniyede etkileme ve
  mükemmellik". Beş bağımsız değerlendirici, "etkilendin mi?", "idare eder" = hayır, en az 4/5, iki tema, 390 ve 320.
  En çok 2 tur; sonra iki sürümden en iyisi seçilir, üçüncü tur yok (§4.1 kural 9). Geçse de ben görüntülere
  bakarım; kapıdan geçmeyen en iyi sürüm sahibe kusurları yazılarak gösterilir, karar onundur. Nasıl yapıldığı §5.1.
- **Görünür her cümle:** taslak → 5 kişilik metin kapısı → benim onayım → sahibin onayı. Sahip bu oturumda onayı bana
  bıraktı ("sen onayla"); bu yetki yalnız Yakala Yaz ve Oku ve Anla yenilemesi için verildi, genel değildir. Ekran
  okuyucu etiketleri ve sürüm notları da görünür metindir.
- **Kapı araçları:** `docs/yol-haritasi/kapi-araclari/OKU.md`: kapıdan önce PLAN ile karşılaştır; yargıç açıklamasını o
  turun tasarım notundan yeniden yaz; kenar, taşma ve hizayı önce ölç.
- **Alt ajanlar:** raporları doğrulanmadan kabul edilmez. Testi ve derlemeyi ana oturum kendisi çalıştırır.
  Kusur bulan, düzelten ve doğrulayan ayrı ajanlar olur.
- **Workflow aracı yalnız sahip açıkça isterse** ("use a workflow", "ultracode"). Bu oturumda iki kez izinsiz
  kullanıldı; bu bir hataydı. Kural: paralel iş için aynı mesajda birden çok `Agent` çağrısı (6 paralel Agent sorunsuz
  çalıştı). Eski devirdeki "aynı anda en çok 2 iş akışı" kuralı Workflow içindi; paralel Agent'ta 5–6 olabilir.
- **Kaynak kontrolü:** PubMed özetleri `PubMed` bağlayıcısının `get_article_metadata` aracıyla, pmid ile çekilir.
  Bağlayıcı yoksa `https://pubmed.ncbi.nlm.nih.gov/<pmid>/` sayfası okunur. Ezberden kaynak yazılmaz.
- **GitHub:** önceki hesapta `gh` yoktu; PR işleri `github` bağlayıcısıyla yapıldı (`pull_request_read`,
  `update_pull_request`).
- **Disk:** dolabilir. Yeniden üretilebilir dosyalar silinebilir; uzağa gitmemiş commit silinmez.

### 4.4 Bu oturumda verilen sahip kararları (kelimesi kelimesine)

- "mükemmel olacak . sen onayla . 5 sn kuralı untma" — Yakala Yaz ve Oku ve Anla yenilemesi için onay yetkisi.
- "ve tabiiki sonsuz yola modül olarak eklecnek .. unutma bütüm modüller sonusz yola bağalnır ve gelişim merkezinde
  depolanır ve değleriendirilir".
- Yakala Yaz seçimleri: "Alan gizlensin" (gösterimde cevap alanı), "Canlı kalsın" (yazmada merdiven), "Hızlandıkça
  yükselsin" (sonuç grafiği), "Durdur yazısı ekle", "Ses seviyesi ekle", "Bir tur daha".
- Oku ve Anla sayılmadı ekranı: "OK ONAYLIYORUM"; tur 8: "EVET AÇ".
- Oku ve Anla yenileme: "Türkçe + kaynak özeti", "Uygun, başla", "Onay" (ana fikir soruları), "Somut kusurları düzelt,
  bitir".

Önceki devrin kararları (Fark Ettin mi?, Nef N1, D9) `git show d0f40a9:DEVAM.md` §4.5–4.7'de; hepsi geçerli.

## 5. Yöntemler ve araçlar

### 5.1 5 saniye kapısı, ekran (bu oturumda işleyen biçim)

1. Düzenekle gerçek ekranı çek (§5.3). Ön denetim "tamam" demeden kapıya gitme: yatay taşma, yetim kelime, ayraçla
   başlayan satır, erken kırılan başlık, düğmenin altına giren içerik, ölü boşluk, kayan sabit ekran, küçük SVG
   yazısı, 40 px altı dokunma alanı.
2. Aynı mesajda beş ayrı `Agent` çağrısı. Her birine bir kişi kimliği (yaş, iş), yalnız o turun görüntüleri ve tek
   soru: ekran başına "ekran: E/H — neden". E = 5 saniyede ne olduğu ve ne yapacağı anlaşılıyor, Türkçesi doğal.
   Uygulamada olmayan özellik isteği H nedeni değildir; "öneri:" diye ayrı yazdırılır.
3. Giriş ekranı için ayrıca a–d soruları: ne yapacaksın, nasıl bitireceksin, sonra ne olacak, ne ölçülüyor.
4. En çok iki tur. İki turdan sonra iki sürümden en iyisi seçilir; yeni tur ve yeni yöntem yok (§4.1 kural 9). Kapı
   içinde kullanılabilecek yöntemler: kusur listesi doğrulaması (önceki bulgular K1…Kn, her biri "düzeldi / düzelmedi"),
   kör A/B, önce/sonra karşılaştırma.
5. Kayıt `tasarim/<modul>/kapi/` altına; onaylı cümleler `METINLER.md`'ye.

### 5.2 Metin bankası: kurallar ve denetim

- Kurallar `okuma-anlama/METINLER.md` §1–§4. Kısaca: 95–115 kelime ve 730–850 harf; parantez yok; metinde "beyin",
  "hastal", "ölüm", "tehlike" sözcük başı olarak yok; 6 soru = 1 "ana" + 5 "ayrinti", her soruda 4 farklı seçenek,
  olumsuz soru yok; doğru seçenek ilk sırada; her 10'luk takımda doğru cevabın **tek başına** en uzun seçenek olduğu
  soruların oranı %15–35 (eşitlik sayılmaz); metin yalnız PubMed özetinde olanı söyler.
- Denetim: `cd docs/yol-haritasi/tasarim/okuma-anlama/banka && node denetle.mjs taslak-*.json` ve `okumaBank.test.js`
  (`bankProblems`). Bu oturumun ek denetim listesi: başlık testi (yalnız başlığa ve seçeneklere bakan doğruyu
  bulabilir mi), sorular arası ipucu (özellikle her okumada sorulan ana soru), biçimle ayrışan doğru seçenek (ek,
  kip, "Yalnız…" kalıbı, uzunluk), genel kültürle bilinen soru, soru sözcüğüyle uyumsuz seçenek.
- Banka iki yerde tutulur ve **birebir aynı** olmalı: `app/src/lib/okumaBank.json` tek satır JSON
  (`json.dumps(bank, ensure_ascii=False, separators=(',',':'))`), `banka/taslak-NN.json` girintili (indent 2). Değişiklik
  `by[id]` ile her ikisine yazılır; kayıt `banka-denetim-2026-10-02.md`'ye eski → yeni biçiminde eklenir.
- Node'da `okumaBank.js`'i doğrudan import etmek için `with { type: 'json' }` gerekir; en kolayı vitest.
- Metin kapısı: 30 rastgele metin, 5 okura 6'şar; "oaNNN: E/H — neden"; ölçüt bu oturumda ≥ 24/30 E kondu
  (sahip onaylamadı). Metin değişince `duzenek/stres.mjs` yeniden koşulur.
- En çok iki tur (§4.1 kural 9). 2026-10-02'de banka dört tur gördü; bu artık yapılmaz. İkinci turdan sonra iki
  sürümden en iyisi seçilir ve sahibe gösterilir.

### 5.3 Düzenekler (depoda, bu commit ile)

- Oku ve Anla: `docs/yol-haritasi/tasarim/okuma-anlama/duzenek/`. `bash cek.sh <çıktı>` beş ekranı 390/320 ×
  açık/koyu çeker ve ön denetimi yazar; `bash cek.sh <çıktı> stres.mjs` 720 soruyu cevaplanmış hâlde iki genişlikte
  sığma için dener; `stres-giris.mjs` 120 başlıkla giriş ekranını dener. Vite portu 4388.
- Yakala Yaz: `docs/yol-haritasi/tasarim/kelime-hafiza/duzenek/`. `bash cek.sh <çıktı>` altı ekran (klavye çizimli);
  `bash cek.sh <çıktı> cek-mic.mjs` mikrofonlu ekranlar. Port 4389.
- Gerekenler: `app/node_modules` kurulu; Playwright makinede (`PW_DIR`, varsayılan `/opt/node-tools/node_modules/`);
  Chromium (`CHROME`, varsayılan `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, yoksa Playwright'ın kendi
  tarayıcısı). `cek.sh` vite'ı başlatır, betiği koşar, vite'ı kapatır; `node_modules` bağlantısını kendisi kurar.
- Maketler ve eski ön denetim: `okuma-anlama/maket/` (`maket.html`, `onden.mjs`), `kelime-hafiza/maket/`.
- Düzenek 320 için 320×568, 390 için 390×844 görünüm; iPhone güvenli alanları `addStyleTag` ile taklit edilir.

### 5.4 Tuzaklar

- `bankProblems` ve `denetle.mjs` yalnız tek başına en uzun seçeneği sayar; eşit uzunluk sayılmaz. Ajanlar bunu sorarsa
  cevap bu.
- Nef cümleleri `lib/nef/bank/tr.js`, `tr.test.js` ve `nef/N1-CUMLELER-onay.md` üçünde aynı olmalı; test onay
  dosyasını okur.
- Sürüm notu testleri (`releases.test.js`) kimlik listesini açıkça yazar; yeni kimlik eklenince liste güncellenir.
- `reading` modülü ve `reading-cps` dokunulmaz; Nef'in `readingWpm` sinyali okuma testinde kalır.
- Metin değişince soru ekranı 390'da taşabilir; `stres.mjs` koş, halka boyu `okuma.css` `.oa-qhead .qr`.
- Yakala Yaz'da merdiven uçları "ms" küçük harf; sonuç cümlesi ve D7–D10 METINLER'de kilitli.

## 6. Dosya haritası

Oku ve Anla:
- Kod: `app/src/modules/okuma-anlama/{manifest.js,view.jsx,okumaAnlama.test.js}`, `app/src/screens/OkuAnla.jsx`,
  `app/src/styles/okuma.css`, `app/src/lib/{okumaBank.js,okumaBank.json,okumaBank.test.js,okumaSelect.js,
  okumaMeasure.js}` ve testleri; bağlantılar `lib/remindTexts.js` OA1–OA3, `lib/nef/bank/tr.js` *-OA1,
  `lib/sources.js`, `lib/ladders.js`, `lib/releases.js` (2026-10-02-3 ve -5).
- Belgeler: `docs/yol-haritasi/tasarim/okuma-anlama/` — `PLAN.md`, `METINLER.md` (§5 görünür cümleler),
  `ANA_OTURUM_ISTEMI.md`, `ARA_RAPOR_1.md`, `banka/` (taslak-01..12.json, denetle.mjs, DOGRULAMA.md, YAZIM_ISTEMI.md,
  METIN_LISTESI.md), `arastirma/KAYNAKLAR.md`, `kapi/` (5sn-tur1..8, kod-tur1..2, metin-tur1,
  banka-denetim-2026-10-02, ekran-yenileme-2026-10-02, okur-bulgulari-2026-10-02), `maket/`, `duzenek/`.

Yakala Yaz:
- Kod: `app/src/modules/yakala-yaz/{manifest.js,view.jsx}`, `app/src/screens/YakalaYaz.jsx`,
  `YakalaYaz.mic.test.jsx`, `app/src/styles/yakalayaz.css`, `app/src/lib/{yakalaYaz.js,yakalaYazWords.js,
  yakalaYazList.js,yakalaMic.js}` ve testleri, `lib/prefs.js` (`yakalaMic`), `lib/native.js` (`startSpeech`
  `strictOnDevice`, `onLevel`), `screens/ProfileHome.jsx` (YakalaMicPref), iOS `SpeechPlugin.swift`, `Info.plist`.
- Belgeler: `docs/yol-haritasi/tasarim/kelime-hafiza/` — `PLAN.md` (§10 cihaz listesi), `METINLER.md`,
  `KELIMELER.md`, `kelimeler/`, `ANA_OTURUM_ISTEMI.md`, `kapi/` (kod-y2, kod-y5, 5sn-tur1..2, metin-sonuc),
  `maket/`, `duzenek/`.

Genel: `docs/ANA_BELGE.md`, `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `kapi-araclari/OKU.md`, `YAPILACAKLAR.md`,
`HATA_GUNLUGU.md`, `ACIK_ISLER.md`, `tasarim/nef/`, `tasarim/gelisim-merkezi/`, `tasarim/fark-ettin-mi/`,
`tasarim/bildirim-hava-yuruyus/metin-B1a-onay.md` (hatırlatma cümleleri onayı).

## 7. Alt oturumlar

Hepsi boşta. İstem dosyaları dallarda: `git fetch origin claude/<dal> && git show origin/claude/<dal>:<yol>`.

| Oturum | Dal · PR | Durum | Ana oturuma düşen |
|---|---|---|---|
| Okuma anlama → "Oku ve Anla" | `claude/okuma-anlama` · #14 | **Entegre edildi**, dal merge edildi. | Yok. #14 kapatılabilir; sahibe sor. |
| Kelime hafıza → "Yakala Yaz" | `claude/kelime-hafiza` · #13 | **Entegre edildi**; dal merge edilmedi, belgeleri bu dalda. | Y6 cihaz listesi sahipte. #13 için §1. |
| Yılan | `claude/yilan-bakis` · #9 | Kod dalda; tasarım kapısı iki turda geçmedi. Düzeltme oturumu hiç açılmadı. | `yilan/5SN_SONUC.md` ve §7 cümlelerine sahip onayı gerekir; ikisi yok. Önce sahibe sor. |
| Metin Arama → "Kelime Avı" | `claude/metin-arama` · #10 | Tasarım bitti, sahip girdisi bekliyor. | METINLER onayı (24 metin), "En iyi turun {x} sn" satırı, sonucun sıradan tur hâli 0/5. Ortak banka kararı §3.4. |
| Kolonlar → "Kelime İzi" | `claude/kolon-takip` · #11 | İstem sürüm 1 hazır. | `kolon-takip/ANA_OTURUM_ISTEMI.md`. |
| Sayı arama → "Rakam Avı" | `claude/sayi-arama` · #12 | İstem sürüm 2 hazır. | `sayi-arama/ANA_OTURUM_ISTEMI.md`. |
| Fark Ettin mi? planı | `claude/fark-ettin-mi-plan` · #8 | Bitti, belgeler ana dalda. | Yok. |
| Yoga Ders 3 sesleri | `claude/yoga-ders3-sesler` · #15 | Yalnız saklama. | BİRLEŞTİRİLMEZ. §3.4. |
| Eski plan oturumları | Nef #7, Gelişim #6, bildirim/hava #5, yoga devri #4 | Planlar ana dalda. | Gelişim G2 için `gelisim-merkezi/`. |

Entegrasyon kuralı: ana dalın son hâlinden çalış; modül dalını merge et, rebase ya da force-push yok; bir seferde tek
modül; tam takım ve derleme yeşil olmadan commit yok; her yeni modülün manifestinde `remind` alanı olur.

## 8. Sıra

1. **Sahibin cihaz geri bildirimi gelirse önce onu düzelt** (2026-10-02-3/-4/-5). Yeni TestFlight gerekirse yeni
   sürüm notu kimliği; sürüm notu kapı ve sahip onayından geçer.
2. **§3.1'deki kararları kısa ve tek tek sor.** Cevap gelmeden hiçbirini yapma.
3. **Fark Ettin mi?** F3 cihaz kararı, sonra F4–F7 (önceki devrin sırası).
4. **Gelişim merkezi G2.**
5. **Kalan modüllerin entegrasyonu**, birer birer; hangisinin önce geleceğini sahibe sor.
6. **§3.4'teki cevapsız konular** bir fırsatta.

## 9. Önce oku

1. Bu dosya.
2. `docs/ANA_BELGE.md`.
3. `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/kapi-araclari/OKU.md`.
4. `docs/yol-haritasi/YAPILACAKLAR.md`, `HATA_GUNLUGU.md`, `ACIK_ISLER.md`.
5. Oku ve Anla: `okuma-anlama/METINLER.md` §5, `kapi/ekran-yenileme-2026-10-02.md`, `kapi/banka-denetim-2026-10-02.md`
   başı ve "Son kapı" bölümü, `kapi/okur-bulgulari-2026-10-02.md`.
6. Yakala Yaz: `kelime-hafiza/PLAN.md` §10, `kapi/kod-y5.md`, `METINLER.md`.
7. Koddaki karşılıkları §6'da. İlk 10 dakikada: `app/src/screens/OkuAnla.jsx`, `app/src/screens/YakalaYaz.jsx`,
   `app/src/modules/registry.js`.
8. Fark Ettin mi? ve Gelişim için eski devrin §6 listesi (`git show d0f40a9:DEVAM.md`).
