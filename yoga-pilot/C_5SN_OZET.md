# Yoga ilk bölüm · 5 saniye notlarının özeti ve yeniden tasarım çerçevesi

Tarih: 2026-09-30. Kapsam: `app/src/modules/yoga/*` (yalnız Ders 2 · 15 dk yayımlı).

Kaynaklar:
- Değerlendirici notları: `tasks/wc5wg6qzo.output` → `result.rounds` (3 tur) ve `result.finalFailing`. `finalFailing`,
  3. turun listesiyle bayt bayt aynı.
- Bağlayıcı kurallar: `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md` ("5 saniyede kişi etkilenir mi? hayırsa gönderme,
  tekrar çalış"; "ilk 4 saniyede etkilemek").
- Onaylı metinler ve güvenlik: `yoga-pilot/v3/modul.md` §2 ve §10, `PLAN.v3.md` §D.
- Bugünkü kod: `modules/yoga/text.js`, `lib/yogaLessons.js`, `Yoga.jsx`, `YogaPlayer.jsx`, `yoga.css`.
- Görüntüler: `scratchpad/yoga-5sn/shots/` (32 PNG ve INDEX.md). Yeniden çekmek için: `bash scratchpad/yoga-5sn/duzenek/cek.sh`.

Okuma notu:
- Tur tur "evet/hayır" sayıları, o turun listesindeki notlardan sayıldı ("etkilendi mi?").
- Bir tur listesinde görünmeyen ekran o turda geçti: 2. turda 3 ve 8.
- 3. turda iki değerlendirici öbeği var: biri iki genişliği görmüş, biri yalnız 390'ı. 2 ve 8 yalnız 390 öbeğinde çıktı
  ve ikisinde de not "evet". 6'da bütün notlar "evet" olduğu hâlde ekran listede. Listeye alma ölçütü çıktıda yazmıyor.

---

## 0. Beş cümlede

1. **Hiç geçemeyenler:** 1 (Ana sayfa), 4 (güvenlik kartı), 5 (önce puanı) ve 7 (sonra puanı) üç turda da hiç "evet"
   almadı. Bu dört ekranda çoğunluk hiç değişmedi.
2. **Toparlananlar:** Oynatıcı 0/3 → 2/3 → 3/3. Kütüphane ve bitiş son turda "evet" aldı. Ayrıntı ekranı 1/3 → geçti → 2/3.
3. **Dört ortak sorun:**
   - Metin duvarı (güvenlik kartı).
   - "Anket formu" hissi (5 ve 7).
   - Güvenlik satırlarının ilaç prospektüsü gibi okunması (3).
   - Aynı ufuk görselinin her ekranda tekrarı.
4. **Tema:** 7 numaralı ekranın açık dosyası koyu çıkıyordu. Bu bir düzenek hatası değil, uygulamanın kararı (§9).
   Bu karar planla çelişiyor: modul.md §2 yalnız oynatıcıyı istisna sayıyor.
5. **Ölçme sorusu (§10):** Önceki puan, seçim yapılana kadar gizlenmeli; seçimden sonra tek satırda gösterilmeli.

---

## 1. Ana sayfa · Pratikler, Yoga kutucuğu

**Tur sonuçları:** 1. tur 0/3 · 2. tur 0/3 · 3. tur 0/3 (390 öbeği 0/1).

**Kapsam uyarısı:** Izgara, 12 kez "Başla", sekme çubuğu ve üstteki kartlar `Home.jsx` ile `styles.css`'te; bu
dosyalar başka iş akışının. Yoga tarafında değişebilecekler yalnız kutucuğun simgesi (`view.jsx`: `Flower2`) ve sırası
(`manifest.js`: `home.order: 33`, VARSAYIM, modul.md §2.1). Kutucuk adı "Yoga" plana bağlı (PLAN.v3 §D.2: 320 px'te
sığmalı).

**Birleştirilmiş notlar** (hepsi hâlâ duruyor):
- **12 eşit kutu, hepsinde aynı gri "Başla".** Hiyerarşi yok, "bugün şununla başla" diyen bir odak yok; sonuç seçim
  felci, "araç uygulaması menüsü", "ucuz hazır şablon". Her turda her değerlendirici söyledi.
- **Adlar ne yaptığını anlatmıyor.** Örnekler: "Yılan" (oyun mu?), "Dalga", "Yön", "Fark Ettin mi?", "Çemberler".
  Süre de tek satır açıklama da yok (3 tur).
- **Yoga kalabalıkta kayboluyor.** Bir yılan oyununun yanında sıradan bir kutucuk; "ciddi yoga uygulaması" güveni
  oluşmuyor (3 tur).
- **Üstte yarım kesik iki "henüz ölçüm yok" kartı.** İlk izlenim "burada bir şey yok" (3 tur). Bu kısmen çekim
  çerçevesinden: düzenek sayfayı Pratikler başlığına kaydırıyor.
- **Sekme çubuğunun altından "Derin set / Tam set" sızıyor.** "Bozuk, bitmemiş" görünüyor (3 tur). Neden: çubuk yarı
  saydam ve bulanık (`--tabbar-bg` %86 + `backdrop-filter`). Görüntü Chromium'da doğru çiziliyor; düzenek hatası değil.
- **Renk uyuşmuyor.** Ana sayfanın turkuazıyla yoganın mavisi "iki ayrı uygulama" gibi (2. ve 3. tur). Dambıl
  simgeleri spor salonu havası veriyor; soğuk mavi-gri palet "klinik" duruyor (1. ve 2. tur).
- **Olumlu:** Kartlar temiz; koyu tema daha derli toplu, turkuaz simgeler koyuda hoş.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Yoga burada; dokununca sesli, gözleri kapalı yapılan kısa bir ders açılıyor."
- Hissedilmeli: "Düzenli bir yer; bana bir yol gösteriyor; seçmesi kolay."

**Değişmez:**
- Giriş Pratikler kutucuğundan (modul.md §2.1) ve Bugün'ün yolundan (PLAN.v3 §B).
- Kutucuk adı "Yoga".
- Web'de kutucuk yok (§D.7).

**Serbest (yoga tarafı):** Yalnız simge ve sıra.

**Öteki iş akışına iletilecekler:**
- Kutucukta süre ya da tek satırlık söz.
- Bir "bugün" odağı.
- Sekme çubuğunun sızıntısı.
- Üstteki boş kartlar.

**Sınama önerisi:** Yoganın asıl girişi olan Bugün'ün yolundaki yoga durağı (`TodayPath.jsx`, başka iş akışı) ayrıca
çekilsin.

---

## 2. Kütüphane · "Yoga ve Meditasyon"

**Tur sonuçları:** 1. tur 0/3 · 2. tur 1/3 · 3. tur 390 öbeği 1/1 (evet).

**Birleştirilmiş notlar:**
- ~~**Boş ekran.** %70–80'i boş, "demo", "içerik yok" (1. tur).~~ Giderildi: tek ders varken kart dersi tanıtıyor
  (görsel, tam ad, söz, süre, duruş, bölümler).
- ~~**"1 5 dk" aralıklı okunuyor** (1. tur, üç kişi; `tabular-nums`).~~ Giderildi.
- ~~**Soldaki mavi şerit** yönetim paneli gibiydi (1. tur).~~ Giderildi.
- **"Başka ders var mı, bu kadar mı?"** Kaydırma, nokta ya da "diğer dersler" ipucu yok (2. ve 3. tur). Sürüyor.
- **Açık temada ağır koyu blok.** Açık zeminde koca siyah kart ağır ve kasvetli duruyor (2. tur, iki kişi). Sürüyor:
  açıkta posterin üstü koyu.
- **Başlatma düğmesi yalnız yuvarlak bir ok.** Üstünde "Başla" yazmıyor; koyu sürümde başlığın üstüne binmiş gibi
  duruyor (3. tur).
- ~~**Başlık "Yoga" ama gösterilen uzanarak dinlenme**, beklentiyle çelişiyor (2. tur).~~ Kısmen giderildi: tam ad
  "Derin Dinlenme (Yoga Nidra)".
- **Olumlu (2. ve 3. tur):**
  - Ufuktaki ışık sakin, premium ve "ucuz değil".
  - İri başlık, "15 dk · Uzanarak" ve "Uyanıkken derin bir dinlenmeye davet." cümlesi uykusu bozuk birine doğrudan
    hitap ediyor.
  - Bölüm listesi güven veriyor.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Şu an dinleyebileceğim ders Derin Dinlenme: 15 dk, uzanarak; tek dokunuşla açılıyor."
- Hissedilmeli: "Sakin ve özenli; benim için hazırlanmış." Boş ya da yarım kalmış bir sayfa hissi olmamalı.

**Değişmez:**
- Başlık "Yoga ve Meditasyon" (§D.2, G8-b).
- Yalnız yayımlanmış dersler ve süreler görünür (§D.1). Yayımlanmamış dersi "yakında" diye göstermek plan değişikliği
  olur ve sahibin onayını ister.
- Kartta etki vaadi yok (modul.md §2.3).
- Renk tek başına bilgi taşımaz.
- Açık temada ders rengi yazı olarak yalnız beyaz kart üstünde kullanılır.

**Serbest:**
- Kartın yerleşimi ve boyu.
- Görselin oranı; açık temada açık zeminli bir poster de olabilir.
- Eylemin açıkça "Başla" ya da "Derse git" gibi yazması. Bu yeni metin, Türkçe editör onayına gider.
- Bölümlerin gösterimi.
- Tek ders varken kütüphaneyi atlayıp ayrıntıya gitmek. Bu akış değişikliğidir (§D.2) ve sahibin onayını ister.

---

## 3. Ders 2 ayrıntısı · Derin Dinlenme (Yoga Nidra)

**Tur sonuçları:** 1. tur 1/3 · 2. tur geçti · 3. tur 2/1 (390 öbeği 1/1 evet).

**Birleştirilmiş notlar:**
- **Başla'nın hemen üstündeki üç açılış satırı** (araç, makine, su) ilaç prospektüsü gibi okunuyor. Davet hissini
  söndürüyor, düğmeyi ortaya itiyor (1. ve 3. tur, dört kişi). Sürüyor.
  - Çelişen istek: 390 öbeği (3. tur) tam tersini diyor. Satırlar küçük ve soluk gri, yorgun gözle zor okunuyor,
    "oysa en önemli bilgiler onlar".
  - Çözüm yönü: satırlar görsel olarak sakin olmalı, ama okunur kalmalı. Satırı küçültüp soldurmak bir çözüm değil.
- **Aynı uyarılar sonraki ekranda uzun hâliyle tekrar ediyor** (1. ve 3. tur).
  - Gerçek akışta güvenlik kartı kütüphaneden önce gelir (bkz. §11).
  - Değerlendiriciler ekranları 3 → 4 sırasıyla gördü.
- **Üstteki görsel bir önceki ekranın aynısı.** Yeni merak uyandırmıyor (3. tur).
- **Rehberin sesi ya da kimliği hiç yok.** "Yoga Nidra'da her şey ses; kimin anlattığına dair tek ipucu yok" (1. tur).
  Sürüyor.
- **"Sankalpa" gibi yabancı sözler** yorgun gözü yoruyor (1. tur). Sürüyor; bölüm adı ders verisinden geliyor.
- ~~**Tek seçenekli "15 dk" çipi** seçilebilir gibi görünüyordu.~~ Giderildi: süre artık başlığın üstünde yazı.
- ~~**"Kaynaklar (19)" kartında ok yoktu.**~~ Giderildi: kitap simgesi ve açılır ok var.
- ~~**Tamamen metin, dokümantasyon sayfası gibi.**~~ Giderildi: bölümler ve kaynaklar düğmenin altında.
- ~~**Koyu temada neon degrade düğme** fintech gibi duruyordu.~~ Giderildi: düğme dersin renginde.
- **Olumlu (3 tur):**
  - Hazırlık kutusu ("Dizlerinin altı için bir yastık") somut; "biri beni düşünmüş" dedirtiyor.
  - "Kaynaklar (19)" şüpheci yazılımcının güvenini en çok kazanan öğe ("Calm ve Headspace'te görmedim").
  - İri başlık; kocaman ve net "Başla"; temiz tipografi.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: 15 dk uzanarak dinleyeceğim. Bir örtü ve yastık hazırlamalıyım. İstediğim an bırakabilirim ve araçta
  değilim. Sonra "Başla".
- Hissedilmeli: "Hazırım, güvendeyim, davet ediliyorum." Prospektüs okumuyor olmalı.

**Değişmez:**
- Ad ve söz: "Derin Dinlenme (Yoga Nidra)", "Uyanıkken derin bir dinlenmeye davet."
- Hazırlık: "İnce bir örtü · Dizlerinin altı için bir yastık · Uzanabileceğin rahat bir yüzey".
- **Üç açılış satırı aynen ve Başla'nın hemen üstünde** (modul.md §2.4-12; §10.1 "Araç uyarısı, her ders ekranında").
  Satırlar ekranda görünür kalır; açılır ayrıntıya alınmaz, çünkü güvenlik öğesidir.
  - "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin."
  - "Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle."
  - "Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk."
- Kaynaklar kartı: `evidenceLine` ve 19 kaynak (PMID ve DOI).
- Yalnız seçilen sürede çalan bölümler gösterilir.
- Bu ekranda ses, arka plan, sahne ya da netlik seçimi yok (§D.2).
- Akşam satırı: 20:00–04:59, yalnız Uykuya Geçiş yayımlıysa.
- Düğme metni "Başla". Ses bu dokunuşta başlar.

**Serbest:**
- Satırların görsel ağırlığı: tek sakin kart, simge, `ink-2` kontrastı, ≥ 15 px yazı.
- Sıra ve gruplama: önce izin satırı, sonra araç satırı, sonra kalkış satırı. Bir öneri: izin satırı davet gibi dursun,
  öteki iki satır ikincil ama okunur olsun.
- Görsel: bu ekranda küçültülebilir ya da başka bir kadrajla gösterilebilir. Aynı posterin tekrarı yerine ufkun başka
  bir anı kullanılabilir.
- Rehber sesinin bir ipucu: "Anlatan: …" ya da 5 sn'lik ses örneği.
  - Bu, yeni metin ya da yeni özellik demek; sahibin ve editörün onayını ister.
  - Ses gerçek bir kişi gibi sunulmamalı.
- "Sankalpa": parantez içi ek, ders verisindeki onaylı `screenLabel`'dan geliyor. Değişecekse Türkçe editör karar verir.

---

## 4. Güvenlik kartı · "Başlamadan önce"

**Tur sonuçları:** 1. tur 0/3 · 2. tur 0/3 · 3. tur 0/3 (390 öbeği 0/1). Üç turda da en zayıf ekranlardan biri.

**Birleştirilmiş notlar:**
- **Metin duvarı.** Beş kalın başlık, altlarında uzun gri paragraflar (~120 sözcük, 20 satırdan fazla). 5 saniyede
  okunmuyor; göz doğrudan "Anladım"a kayıyor ve kullanım koşulları gibi geçiliyor. Üç turda dokuz notun hepsinde var.
  3. turdaki öneri: "Kısa başlıklar tek başına yetmeli, ayrıntı bir 'devamı'na gitmeli." Sürüyor.
- **"Psikoz, bipolar, epilepsi" rahatlamaya gelen kişiyi geriyor** (3 tur, altı kişi). Sürüyor; sağlık maddesi 2. turdan
  beri en sonda.
- **Önceki ekrandaki uyarıların tekrarı** (1. ve 2. tur).
- **"Nefona tedavi değildir" anlaşılmıyor.** Marka mı, yazım hatası mı (3 tur, beş kişi).
  - Kısmen sınama yapaylığı: değerlendiriciler uygulamanın adını bilmiyordu.
  - Metin değişmez; sunuş değişebilir.
- **Geri ya da kapat düğmesi yok.** "Anladım"dan başka çıkış görünmüyor (3. tur, üç kişi). Sürüyor.
- **Başlık ile ilk madde arasında nefes payı yok** (3. tur).
- ~~**Son madde alttaki geçişin altında kesik kalıyor**, kaydırılabildiği anlaşılmıyordu (2. tur).~~ Giderildi: "Anladım"
  alt şeritte ve üstünde ince çizgi var.
- ~~**Turkuaz "Anladım" ile mavi "Başla"** başka uygulamaya geçmiş hissi veriyordu (2. tur).~~ Giderildi: düğme dersin
  renginde. Koyu temada "göz alacak kadar parlak" notu da vardı.
- **Olumlu (3 tur):**
  - Dil travmaya duyarlı ve güven veriyor ("Buradaki her şey bir davet", "Dersi yarıda bırakmak da pratiğin bir
    parçası").
  - 112 ve "tedavi değildir" sorumlu duruyor.
  - Kalın başlıklar ve simgeler taramayı kolaylaştırıyor.

**İlk 4 saniye hedefi:**
- Anlaşılmalı (beş başlık tek bakışta): istediğim an bırakırım · araçta açmam · yavaş kalkarım · sesi kısık tutarım ·
  bir sağlık durumum varsa önce danışırım. Tedavi değil; acilde 112.
- Hissedilmeli: "Beni önemsiyorlar ama korkutmuyorlar; bu kısa bir an."

**Değişmez** (modul.md §2.2, §10.3 düzeltmeleriyle; `text.js` YT.safety):
- Beş maddenin başlığı ve gövdesi harfi harfine.
- Alt satır: "Nefona tedavi değildir. Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda
  **112**."
- Düğme "Anladım". Onay kutusu ve kilit yok.
- Yoga bölümüne ilk girişte bir kez gösterilir; ayrıntıdaki (i) düğmesiyle yeniden açılır.
- **Görev kuralı:** bütün maddeler erişilebilir kalır. Hiçbiri gizlenmez. Gövde en fazla açılır ayrıntıya alınabilir;
  o durumda ana cümle (başlık) görünür kalır.

**Serbest:**
- Sıra ve gruplama. Örnek: "Ders sırasında" (bitirebilirsin, sesi kısık tut), "Ders dışında" (araç, yavaşça kalk),
  "Sağlık" (danış, tedavi değildir, 112).
- **Açılır ayrıntı:**
  - Beş başlık görünür, gövdeler açılır. VoiceOver açık ya da kapalı olduğunu okur.
  - Sağlık maddesinin gövdesinde danışılacak durumlar yazıyor. Bu gövdenin de açılıra alınıp alınmayacağı klinik
    gözden geçirmeye sorulmalı; görev kuralı buna izin veriyor.
- Simge, boşluk, başlık ile liste arasındaki pay.
- Geri düğmesi: `YT.back` var, yeni metin gerekmiyor. Geri basılırsa kart bir sonraki girişte yeniden çıkar.
- Alt satırda "Nefona"yı uygulama adı olarak tanıtan bir sunuş, örneğin logo ya da ad biçimi. Metin değişmez.

---

## 5. Önce puanı · "Bedenin şu an ne kadar gergin?"

**Tur sonuçları:** 1. tur 0/3 · 2. tur 0/3 · 3. tur 0/3 (390 öbeği 0/1).

**Birleştirilmiş notlar:**
- **Sıradan anket, hastanedeki ağrı skalası, sınav** (3 tur, dokuz notun hepsi). Sürüyor.
- **Neden sorulduğu yazmıyor.** "Ders sonunda karşılaştırılacak" ipucu yok, bu yüzden ölçüm değil angarya gibi
  (1. ve 2. tur). Sürüyor.
- **Ölçek iki satıra bölünmüş, 5 ile 6 yan yana değil.** Ölçek değil telefon tuş takımı gibi okunuyor.
  - 1. tur: "hiç" 6'nın altına düşüyordu; 6 = "hiç" sanılıyordu.
  - 3. tur: "hiç" 1'in üstünde, "çok" 10'un altında; ama etiketler kopuk ve dağınık.
  - Sürüyor.
- **"hiç / çok" küçük ve silik** (2. ve 3. tur).
- **"On seçenek bir his için fazla"** (3. tur). Plan gereği değişmez.
- **Kalın geometrik rakamlar** tuş takımı gibi duruyor, gereğinden sert (2. tur).
- **Üstteki ufuk görseli** ekranın üçte birini ya da %40'ını kaplıyor, bilgi vermiyor; "aynı görsel üçüncü kez"
  (2. ve 3. tur). Açık modda soluk mavi bir leke, "render hatası" gibi (3. tur). Sürüyor.
- **Pasif "Devam"** (3 tur). Sürüyor, açıkta hafifledi.
  - 1. tur: koyu temada koyu zeminde koyu yazı, okunmuyordu.
  - 3. tur: açık sürümde gri Devam "bozuk gibi".
- ~~**"Devam" ile "Atla" aynı ağırlıkta**, soluk Devam'ın basılamaz olduğu anlaşılmıyordu (2. tur).~~ Giderildi: "Atla"
  artık yalnız yazı.
- ~~**Monospace, büyük harfli "ÖNCE · DERİN DİNLENME" etiketi** terminal gibiydi (1. tur).~~ Giderildi.
- **Olumlu:** Soru büyük ve net. Daireler iri ve kolay basılıyor ("bu yaşta gözüm için rahat"). 1'den 10'a hafifçe
  koyulaşan dolgu ince bir ayrıntı. "Atla"nın olması iyi.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Başlamadan önce bedenimin gerginliğini 1 (hiç) ile 10 (çok) arasında işaretliyorum; istersem atlarım."
- Hissedilmeli: "Bedenime dönüyorum." Anket ya da sınav hissi olmamalı.

**Değişmez:**
- Soru "Bedenin şu an ne kadar gergin?". Uçlar "hiç · çok" (ders verisi; modul.md §2.5 tablosu).
- 1–10 ölçeği; Dalga ile aynı, `RATE_MAX = 10`.
- "Atla" var. "Devam" seçimle açılır.
- Ölçü adı "beden gerginliği"; yön: düşük iyi.
- Dokunma alanı ≥ 44 px, 320 px'te de. Bu yüzden 10 düğme 320 px'te tek sıraya sığmaz (288 / 10 = 28,8 px).

**Serbest:**
- Ölçeğin biçimi:
  - (a) İki sıra kalır ama sürekli okunur: aynı çizgi, renk geçişi, uçlar ölçeğin iki ucunda.
  - (b) 1–10 sürgü: başparmak ≥ 44 px; seçim yapılana kadar başparmak yok; VoiceOver'da ayarlanabilir öğe; uçlarda
    hiç ve çok.
  - (c) Başka bir düzen; koşul: çizgisel okunmalı, tuş takımı gibi değil.
- Rakamların yazı ağırlığı.
- Görselin boyu ya da hiç olmaması.
- "Neden soruyoruz" için tek satır, örneğin "Ders bitince aynı soruyu yeniden soracağız." Yeni metin: Türkçe editör
  onayına gider ve sağlık iddiası denetiminden (`text.test.js`) geçer.
- Pasif Devam'ın biçimi: okunur olsun, "bozuk" görünmesin.

---

## 6. Oynatıcı (3. dakika, altyazı açık)

**Tur sonuçları:** 1. tur 0/3 · 2. tur 2/1 · 3. tur 3/0. Görsel kimlik oturdu; kalanlar ince ayar.

**Birleştirilmiş notlar:**
- ~~**Ortada düz yatay çizgi** "sinyal yok", "düz EKG" gibiydi (1. tur); 2. turda ışık o kadar soluktu ki "yüklenmedi"
  sanıldı.~~ Giderildi: 3. turda "tek bir yumuşak ışık", "huzur verdi".
- **Altyazı "Hissetmesen de her adı içinden tekrarlayabilirsin." bağlamsız.** "Hangi ad?" diye soruluyor; "her adımı"
  yazacakken yazım hatası sanılıyor (3 tur, beş kişi). Sürüyor.
- **Sayaç "12:13 kaldı" ekranın en belirgin yazısı.** "Yoga Nidra'da zamanı bırakmak esasken saat göze sokuluyor"
  (3. tur). Öteki uç: 1. turda "kalan mı geçen mi belli değil" deniyordu; "kaldı" eklenince bu giderildi.
- **"Kapanışa geç" ne yapıyor, belli değil.** Dersi mi bitirir, sona mı atlar? Üstelik soluk (3. tur). Sürüyor.
- **Bölümlü çubuk ve "kaldı" çok ince ve silik.** Hangi parçanın hangi bölüm olduğu yazmıyor (3. tur).
- ~~**Sayaçta ayrı monospace yazı tipi, "12 : 13"** özensiz duruyordu (2. tur).~~ Giderildi.
- ~~**Monospace, büyük harfli başlık** konsol gibiydi (1. tur).~~ Giderildi.
- ~~**Altyazı soluk gri**, yorgun gözle zor okunuyordu (2. tur).~~ 3. turda "rahat okunuyor".
- **Olumlu (2. ve 3. tur):**
  - Karanlık, sade, göz yormayan ekran. Açık temada da koyu kalması doğru bulundu (üç kişi).
  - Büyük durdurma düğmesi.
  - Bölümlü ilerleme çubuğu düşünülmüş bir ayrıntı.
  - "Kapanışa geç" güven veriyor: ders aniden kesilmiyor.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Ders çalıyor; gözlerimi kapatabilirim; şu bölümdeyim; istersem duraklatır ya da bitiririm."
- Hissedilmeli: "Karanlık, sakin ve canlı; burada kalabilirim."

**Değişmez:**
- Hep karanlık, zemin `#050A12`, temadan bağımsız (G3; modul.md §2 ve §2.6). Açık ve koyu dosyalarının bayt bayt aynı
  olması doğru.
- Denetimler 5 sn sonra kaybolur, dokununca döner:
  - kalan süre (motordan);
  - ince bölüm çizgisi (sarma ve bölüme atlama);
  - Duraklat / Sürdür;
  - "Kapanışa geç" (kapanıştayken görünmez);
  - X (VoiceOver: "Dersi bitir");
  - "Altyazı" (varsayılan kapalı).
- **Ekrandaki cümle söylenen cümledir:** altyazı metni değişmez ve kısaltılmaz. "Her adı" cümlesi dersin sesi.
- Nefes formu: Ders 2'de ince, yatay ufuk çizgisi.
  - Yanıp sönme ve ani renk geçişi yok.
  - Parlaklık en çok bağıl %15.
  - Hareketi Azalt'ta ölçeklenmez.
  - Nöbet cevabı "Hayır" değilse nabız yok.
- Ekran açık tutulmaz; ses asla kesilmez.

**Serbest:**
- Sayacın vurgusu: daha küçük ve sönük olabilir, ama kalan süre görünür kalır.
- Bölüm adının yeri ve boyu. "Beden dolaşımı" satırı "her adı" cümlesinin bağlamını verir; altyazının hemen üstüne
  alınabilir.
- "Kapanışa geç" düğmesinin biçimi. Anlamını açıklayan ek metin gerekirse Türkçe editöre gider.
- Çubuk kalınlığı. Seçili bölümün adı çubuğun altında görünebilir.
- **Sınama notu:** Düzenek oynatıcıyı 2:47'de, denetimler açıkken donduruyor. Gerçek ilk 5 saniye dersin başıdır
  (Karşılama, 0:00–0:05). Bu an da çekilmeli (bkz. §11).

---

## 7. Sonra puanı · aynı soru, dersten sonra

**Tur sonuçları:** 1. tur 0/3 · 2. tur 0/3 · 3. tur 0/3 (390 öbeği 0/1). Üç turda da en zayıf ekran.

**Birleştirilmiş notlar:**
- **Önce ekranının birebir kopyası, déjà vu.** Tek fark küçük "Sonra" etiketi, o da 5 saniyede fark edilmiyor. "Aynı
  anketi yeniden dolduruyorum", "uygulama takıldı sandım" (3 tur, dokuz notun hepsi). Sürüyor.
- **Dersin bittiğini hissettiren hiçbir şey yok.** Karşılama, geçiş ya da nefes yok. 15 dk derin dinlenmeden sonra kalın
  başlık ve on tuş "irkiltici", "dinginliği bozuyor" (1. ve 2. tur). Sürüyor: şu an yalnız yavaş belirme var.
- **Önceki puan** (1. ve 2. turda "hatırlatılmıyor"). 3. turda eklendi (7'nin içinde kesik halka ve "Önce" yazısı);
  bu kez üç sorun çıktı:
  - "Önce" yazısı minicik ve soluk; ekranın asıl yeni bilgisi en zor okunan yer (üç kişi).
  - Kesik halka "zaten seçili" ya da "pasif" gibi okunuyor.
  - **Seçeneklerin arasına gömülü önceki puan cevabı yönlendiriyor (çıpalama).** "Veri odaklı biri olarak 7→4'e
    güvenimi düşürüyor." Karar önerisi §10'da.
- **Tema tutarsızlığı:**
  - 2. tur: "Açık modda karanlık oynatıcıdan sonra birden aydınlanıyor, gözü kapalı kalkmış biri için rahatsız edici."
  - 3. turdan beri ekran açık temada da koyu. Üç kişi "gözünü yeni açana iyi" dedi, ama "önce ekranı açıktı,
    tutarsız". Plan açısından bkz. §9.
- **Üst %40 boş, ağır 10 daireli ızgara** (3. tur).
- **Geri düğmesi yok** (1. tur). Bu bilinçli: ders bitti, geri dönülecek bir önceki ekran yok.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Ders bitti. Aynı soruyu şimdi, dersten sonra soruyorlar."
- Hissedilmeli: "Yumuşak bir dönüş." Aynı formun yeniden gelmesi değil, dersin kapanışı gibi hissettirmeli.

**Değişmez:**
- Önce puanındaki soru aynen yeniden sorulur (modul.md §2.8). "Atla" var.
- Uyku dersinde bu ekran yok.
- Ardından isteğe bağlı zorlanma sorusu gelir: "Ders sırasında zorlandın mı?" Hayır · Biraz · Çok · Atla. "Çok"
  cevabının iki metni aynen (§10.3-c).
- Tema: plan gereği iki temada (§9).
- Etiketler: "Önce" ve "Sonra" (`YT.rate`).

**Serbest:**
- Ekranı önce ekranından ayıran her şey:
  - görsel (şafak anı zaten `mood="dawn"`);
  - "Sonra"nın vurgusu ve boyu;
  - yerleşim;
  - geçiş (koyudan temaya yavaş açılma; Hareketi Azalt'ta anında);
  - ölçeğin biçimi (§5 ile aynı seçenekler).
- Bir karşılama cümlesi yeni metindir ("Ders bitti." gibi). Editör onayına gider ve sağlık iddiası taşıyamaz.
- Önceki puanın gösterimi: §10 önerisine göre.

---

## 8. Bitiş · "Ders bitti"

**Tur sonuçları:** 1. tur 1/3 · 2. tur geçti · 3. tur 390 öbeği 1/1 (evet).

**Birleştirilmiş notlar:**
- ~~**En değerli bilgi 7 → 4 düz bir başlık satırıydı.** Vurgu ve görsel yoktu, ok küçüktü (1. tur, üç kişi).~~
  Giderildi: 3. turda "7 → 4 kocaman ve hemen anlaşılıyor, içim ısındı".
- **Noktalı çizgi ters okunuyor.** Çizgide "Sonra" solda, "Önce" sağda; noktalar küçük ve net 7 → 4 mesajını
  bulandırıyor (3. tur). Sürüyor. "Düşük iyi" ölçüde sonra puanı solda kalıyor.
- **"15 dk · Kapanış" belirsiz** ("Kapanış" ne demek?) ve "(19)" sayısı açıklamasız (1. tur, iki kişi). Sürüyor.
- **Ekranın yarısından fazlası boş** (1. tur, üç kişi). Sürüyor, azaldı.
- **Tebrik ya da sıcak kapanış yok.** "Ders bitti" kuru bir sistem mesajı gibi (1. tur). Bilinçli: kutlama sözü yok
  (§D.5). Sıcaklık, iddia taşımayan bir biçimde aranmalı.
- **Açık sürümde karanlık oynatıcıdan sonra birden bembeyaz ekran** göz kamaştırıyor; koyu sürüm daha rahat (3. tur).
  Sonra puanı iki temaya dönerse (§9) bu geçiş 7'ye kayar; yavaş açılma orada çözülmeli.
- ~~**Sıradaki ders kartında ok yok**; koyu temada neon degrade "Tamam" düğmesi (1. tur).~~ Giderildi. Tek ders
  yayımlıyken öneri kartı hiç çıkmıyor.
- **Olumlu (1. ve 3. tur):**
  - 7 → 4 kişinin kendi verisiyle somut ve abartısız bir sonuç ("Calm'da görmediğim bir kanıt").
  - "Bu dersi neden böyle kurduk" merak ve güven uyandırıyor.

**İlk 4 saniye hedefi:**
- Anlaşılmalı: "Dersi bitirdim: 15 dk. Kendi puanlarım 7 → 4."
- Hissedilmeli: "Kendime zaman ayırdım; bu benim verim." Sıcak ama abartısız olmalı; kanıt ya da vaat gibi durmamalı.

**Değişmez** (modul.md §2.9; PLAN.v3 §D.5):
- Başlık "Ders bitti".
- Dinlenen dakika ve ulaşılan bölüm.
- Önce → sonra, ölçü adıyla: "Beden gerginliği 7 → 4".
- "Bu dersi neden böyle kurduk" (Kaynaklar kartı).
- Sıradaki öneri. "Çok" cevabında aynı dersin en kısa süresi ve altında "Gözlerin açık kalabilir.". Bugün Ders 2'nin
  tek yayımlı süresi var; bu yüzden öneri çıkmıyor.
- Puanlar "nasıl hissettin" gidişatıdır, etki kanıtı değildir. "Gerginliğin azaldı", "işe yaradı" gibi bir cümle ya da
  kutlama yok.
- Yarıda bırakılan ders bu ekranı göstermez.

**Serbest:**
- 7 → 4'ün yerleşimi.
- Çizginin yönü ve etiketleri: sayı sırası mı, "önceden sonraya" oku mu. Çizgi tamamen kaldırılabilir de; sayılar üst
  satırda yazılı.
- "Kapanış"ın sunuşu: örneğin tamamlanan derste bölüm yazılmayabilir. Ulaşılan bölüm ancak yarıda kalan derste
  bilgidir; bu da plan maddesine dokunur ve editöre sorulur.
- Onaylı bir cümlenin burada yeniden kullanılması: "Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra
  kalk." Güvenlik açısından da yerinde (§10.1 "Uzanarak derslerin ekranı ve kapanışı"). Yine de yerleşim kararıdır ve
  editöre sorulur.
- Boşluğun kullanımı.

---

## 9. Tema: 7 numaralı ekran neden açık temada koyu çıkıyordu (GÖREV 1'in bulgusu)

**Düzenek doğru çalışıyordu.**
- `main.jsx` açık temada `applyTheme('light')` çağırıyor; Playwright da `colorScheme: 'light'` veriyor.
- Yeni tema denetimi 32 çekimin hepsinde `data-theme` ve `prefers-color-scheme`'i beklenen temada buldu.
- Açık temada koyu çıkanlar yalnız iki ekran:
  - 6 (oynatıcı): plan gereği, `.yg-play`.
  - 7 (sonra puanı): uygulamanın kendi kararı.

**Neden uygulamada:**
- `Yoga.jsx` `Night` bileşeni (satır 396–401), sonra puanını (satır 325) ve zorlanma sorusunu (satır 353)
  `.yg-night-wrap` ve `.yg-night` içinde çiziyor.
- `yoga.css` 30–41 bu ekranlara temadan bağımsız koyu jetonlar veriyor. Dosyanın başındaki yorum (satır 9–10) bunu
  bilinçli bir karar olarak yazıyor.
- `Yoga.test.jsx` 189–213 bu davranışı sınıyor: "sonra puanı ve zorlanma sorusu karanlıkta".
- Karar 3. turda, 2. turdaki bir nota karşılık alındı: "açık modda birden aydınlanıyor".

**Planla çelişki:**
- modul.md §2: "Her ekran açık ve koyu temada … Oynatıcı bunun istisnasıdır, hep karanlıktır (G3)."
- PLAN.v3 G3: "oynatıcı hep karanlık, kütüphane ve ayrıntı iki temada."
- Görev kuralı: "öteki yoga ekranları iki temada."
- Sonuç: sonra puanı ve zorlanma sorusu iki temada olmalı.

**Öneri (yeniden tasarımda yapılacak; bu görevde uygulama koduna dokunulmadı):**
- `Night` kaldırılır ya da iki temalı yapılır. `.yg-night` jetonları kalkar.
- Yumuşak geçiş korunur: dış katman bir an oynatıcının koyusunda kalır, ekran temaya yavaşça açılır (~1,4 sn).
  Hareketi Azalt'ta anında açılır (`yoga.css` 400'deki kural zaten var).
- `Yoga.test.jsx` 189–213'teki beklenti "önce ve sonra ikisi de temada" olarak değişir.

**Ayrıca karar isteyen: durdurma ekranı (X).**
- Şu an `.yg-dark .yg-stop`, temadan bağımsız koyu. Metni: "Gözlerini aç, etrafına bak, acele etme…".
- Oynatıcının parçası sayılırsa koyu kalabilir; sayılmazsa iki temaya döner.
- Plan açıkça söylemiyor (modul.md §2.7). Çekimlerde yok.

**Düzenekte yapılan (bundan sonra karışmasın diye):**
- Her görüntünün görünen teması piksellerden ölçülüyor.
- INDEX.md'nin "Tema denetimi" bölümü açık temada koyu çıkan ekranı ve nedenini yazıyor: "plan gereği" ya da "uygulama
  kararı · plan dışı".
- Tema düzenekte uygulanmazsa çekim duruyor ya da çıkış kodu 2 oluyor.

---

## 10. Ölçme sorusu: sonra puanında önceki puanı göstermek çıpalama yaratır mı?

**Soru:** Önceki puan (7) seçim yapılmadan önce ölçeğin içinde gösterilirse ikinci cevap ona çekilir mi? Seçim
yapılana kadar gizleyip seçimden sonra göstermek daha mı doğru?

### Kanıt

PubMed taraması yapıldı: "anchoring" ile önceki puan ve NRS/VAS; talep etkisi ile meditasyon ve gevşeme.

- **Uzun aralıklı ölçümlerde önceki cevabı görmek ölçümü iyileştirdi:**
  - **Scott & Huskisson 1979.** Uzun süreli tedavi gören hastalar ağrıyı VAS'ta değerlendirdi. Önceki puanlarını
    görmeyenler ağrılarını olduğundan yüksek değerlendirdi; iki ölçüm arasındaki fark tedavi süresi uzadıkça büyüdü.
    Karşılaştırmalı çalışma. PMID 317238, DOI [10.1136/ard.38.6.558](https://doi.org/10.1136/ard.38.6.558).
  - **Guyatt 1985.** 43 kararlı hasta, iki haftalık aralarla üç ölçüm. Önceki cevapları görenlerde (bilgilendirilmiş)
    ölçüm varyansı belirgin azaldı. Karşılaştırmalı çalışma. PMID 4066888, DOI
    [10.1016/0021-9681(85)90098-0](https://doi.org/10.1016/0021-9681(85)90098-0).
  - **Guyatt 1989.** Randomize, çift kör ilaç denemesinin içinde yapıldı. Önceki cevapları gören koşulda yaşam kalitesi
    değişimleri spirometri, yürüme ve genel değerlendirmelerle daha güçlü ilişkiliydi, yani geçerlik arttı. PMID
    2778469, DOI [10.1016/0895-4356(89)90105-4](https://doi.org/10.1016/0895-4356(89)90105-4).
- **Yargı anında görülen sayı yargıyı kaydırabilir:**
  - **Lewinson & Katz 2020.** Randomize çalışma, n = 385. Katılımcılar ilgisiz rastgele bir sayı (8 ya da 2) gördükten
    sonra varsayımsal bir hastanın ağrısını 0–10 ölçeğinde daha yüksek ya da daha düşük puanladı. Sınır: gözlemci
    yargısı, kişinin kendi bedeni değil; etki yalnız çıpadan etkilendiğine inananlarda görüldü. PMID 32149719, DOI
    [10.2196/17533](https://doi.org/10.2196/17533).
- **Önce → sonra farkı özgül etki değil:**
  - **Sparacio 2025.** Akıllı telefonla farkındalık pilot randomize denemesi, n = 60. Hem farkındalık hem de ona
    benzetilmiş sahte (sham) grupta kişilerin bildirdiği stres benzer biçimde düştü. Grup farkı bulunmadı; yazarlar
    faydayı ortak, özgül olmayan etkenlere bağlıyor. PMID 40828581, DOI
    [10.2196/77793](https://doi.org/10.2196/77793).
- **Bulunamayan:** Aynı oturum içinde, dakikalar arayla önceki puanı görmenin ikinci puana etkisini doğrudan sınayan
  bir çalışma bulunamadı. Aşağıdaki karar bu yüzden bir **tasarım çıkarımıdır**; kanıtlanmış bir üstünlük değildir.

### Çıkarım

- Guyatt ve Scott çalışmalarında kişi haftalar ya da aylar önceki cevabını hatırlamıyor; önceki puan ona gerçekten
  **bilgi** veriyor.
- Bizde ara 15 dakika. Kişi 7'yi zaten biliyor, gösterimin bilgi katkısı küçük.
- Buna karşılık yargı anında göz önünde duran "7", iki şeyi kolaylaştırabilir:
  - sayısal çıpa;
  - "daha iyi görünme" isteği (talep etkisi).
- Önce → sonra zaten özgül etki kanıtı değil (Sparacio 2025). Bu yüzden ölçümün kişinin o anki hissine olabildiğince
  temiz kalması önemli.

### Karar önerisi: seçime kadar gizle, seçimden sonra göster

1. **Seçim yapılana kadar önceki puanın hiçbir izi yok.** Kesik halka, 7'nin içindeki "Önce" yazısı ve VoiceOver'ın
   "7 Önce" okuması kalkar. Ölçek önce ekranındakiyle aynı görünür.
2. **İlk dokunuştan sonra ölçeğin altında tek satır çıkar.** Kişi seçimini değiştirebilir. "Devam" seçimle açılır.
   - Satır `aria-live="polite"` ile okunur.
   - Satır animasyonsuz belirir; Hareketi Azalt'a uyar.
3. **Önce puanı "Atla" ile geçildiyse** satır hiç çıkmaz.
4. **Karşılaştırmanın asıl yeri bitiş ekranıdır:** "Beden gerginliği 7 → 4". Orada değişiklik yok.
5. **Kayıt şeması değişmez** (§D.4: `before`, `after`). "Gösterimden sonra cevabını değiştirenlerin oranı"
   ölçülmek istenirse bu yeni bir alan demektir ve ayrı bir karar gerektirir.
6. **Değişecek test:** `Yoga.test.jsx` 205'teki `'6 Önce'` beklentisi. Yeni beklenti: seçimden önce radyo adları
   `'1'…'10'`; seçimden sonra satır görünür.

Satırın metni için iki seçenek var; ikisi de yeni metindir ve Türkçe editör onayına gider:
- **"Dersten önce: 7" (önerilen).** Belirsizlik taşımaz ve ekrandaki "Önce / Sonra" sözleriyle aynı ailedendir.
- **"Başta 7".** Kısa ve anlaşılır. Ancak "başta" tek başına "özellikle" anlamına da gelebilir ("başta annem olmak
  üzere"), bu yüzden bir tık daha belirsiz.

**Beklenen etki:**
- Önceki puanı seçenekler arasında görmenin yarattığı güvensizlik kalkar. 3. turdaki not: "çıpalama → 7→4'e güvenim
  düştü".
- Değerlendiricilerin 1. ve 2. turdaki "önceki puanım hatırlatılmıyor, karşılaştırma yok" isteği seçimden hemen sonra
  karşılanır.
- Kişi ölçeği ters kullandıysa ("10 = rahat" sanmak) kendi referansını görünce fark edebilir. Ders 2'nin ölçüsünde
  "düşük iyi".

---

## 11. Bütün ekranlar için değişmez olanlar ve serbest olanlar

**Değişmez:**
- **Onaylı metinler harfi harfine:** `text.js` (YT) ve `lib/yogaLessons.js` Ders 2. Başlıklar, düğme adları, güvenlik
  kartı, açılış satırları, hazırlık, soru ve uçlar, durdurma metni, zorlanma metinleri, bitiş metinleri. Yeni bir söz
  gerekiyorsa Türkçe editör onayına gider ve `text.test.js`'in sağlık iddiası süzgecinden geçer.
- **Sağlık iddiası yok:** "iyileştirir", "stresini azaltır", "kanıtlandı" gibi sözler yok. Puanlar "nasıl hissettin"
  gidişatı.
- **Ekrandaki cümle söylenen cümledir:** altyazı `timeline.json`'dan aynen gelir.
- **Güvenlik içeriği** (modul.md §10.1, PLAN.v3 §D.6):
  - Güvenlik kartı bir kez gösterilir ve (i) ile yeniden açılır.
  - Her ders ekranında açılış satırları ve araç uyarısı var.
  - Durdurma onaysız; dönüş ekranı var.
  - Kapanış kısalmaz.
  - Zorlanma sorusu var; "Çok" cevabının iki metni aynen.
  - Nöbet cevabı "Hayır" değilse nabız yok.
  - Yanıp sönme yok.
  - Güvenlik kartındaki bütün maddeler erişilebilir kalır: gizlenmez; açılır ayrıntıya alınsa da ana cümlesi görünür.
- **Plan kararları:**
  - Akış: kutucuk → (ilk girişte güvenlik kartı) → kütüphane → ayrıntı → önce puanı → oynatıcı → sonra puanı →
    zorlanma → bitiş.
  - Yalnız yayımlanmış dersler ve süreler görünür.
  - Ayrıntıda ses, arka plan, sahne ve netlik seçimi yok.
  - Oynatıcı hep karanlık; **öteki ekranlar iki temada**.
  - 1–10 ölçeği ve "Atla".
  - Web'de yoga yok.
  - Ekran açık tutulmaz.
- **Erişilebilirlik ve düzen:**
  - 320 px'te yana taşma yok.
  - Dokunma alanı ≥ 44 px.
  - Hareketi Azalt'a uyulur.
  - VoiceOver adları korunur.
  - Uygulamanın tasarım jetonları kullanılır (`app/src/styles/*`, `styles.css`).

**Serbest:**
- Ekran içinde sunuş, sıra, vurgu ve gruplama.
- Açılır ayrıntı.
- Simge, tipografi ve boşluk.
- Ders rengi içinde renk; kontrast kurallarıyla.
- Görselin (LessonArt) boyu, kadrajı ve hangi ekranda olduğu.
- Geçişler, Hareketi Azalt'a uyarak.
- Geri ve kapat düğmeleri (`YT.back` var).
- Düğmelerin biçimi.

**Birden çok ekranda tekrar eden notlar:**
- Aynı ufuk görseli beş ekranda tekrarlanıyor: kütüphane, ayrıntı, önce, sonra, bitiş. "Üçüncü kez", "önceki ekranın
  aynısı" (2. ve 3. tur).
- Üstte büyük boş alanlar: kütüphane (1. ve 2. tur), önce ve sonra puanı (üst %40), bitiş.
- Küçük ve soluk gri yazılar yorgun göze zor geliyor: açılış satırları, "hiç / çok", "Önce", çubuk, "kaldı".
- Güvenlik tekrarı: kart ile ayrıntıdaki açılış satırları. İkisi de plana bağlı. Tekrarın dili ve görsel ağırlığı
  azaltılabilir.

**Değerlendirici tipleri** (notlardan): yorgun gözlü ya da yaşlıca kullanıcı, şüpheci yazılımcı, Calm/Headspace
kullanıcısı, uykusu bozuk kişi, yoga öğretmeni.
- Kaynaklar ve 7 → 4 şüpheciyi kazanıyor.
- Soluk yazılar yorgun gözü kaybediyor.
- Metin duvarı ve anket hissi herkesi kaybediyor.

---

## 12. Sınamanın kendisiyle ilgili notlar (bir sonraki turdan önce)

1. **Ekran numarası gerçek akış sırası değil.** İlk kez açan kişi 1 → 4 (güvenlik) → 2 → 3 → 5 → 6 → 7 → (zorlanma) →
   8 sırasıyla görür. Değerlendiriciler 3 → 4 sırasıyla gördükleri için güvenlik kartını "bir sonraki ekranda tekrar"
   saydı.
   - Değerlendiriciye gerçek sırayla gösterilmeli; ya da INDEX'teki sıra açıkça yazılmalı.
   - Bir çelişki daha var: PLAN.v3 §D.2 güvenlik kartını ayrıntıdan sonraya koyuyor ("ilk kez: güvenlik kartı …
     → önce puanı"); modul.md §2.2 ve kod ise ilk girişe. Hangisinin geçerli olduğu sahibe sorulmalı.
2. **Oynatıcı karesi 2:47'de, denetimler açık.** Gerçek ilk 5 saniye dersin başı (0:00–0:05, Karşılama). Oynatıcının
   5 saniye sınaması o anla da yapılmalı: `cek.mjs`'teki `PLAYER_AT` sabitini 3 yapıp ek bir çekim.
3. **Değerlendiriciler uygulamanın adını bilmiyor.** "Nefona tedavi değildir" cümlesindeki şaşkınlığın bir kısmı bundan.
   Değerlendirici talimatına tek satır eklenebilir: "Uygulamanın adı Nefona".
4. **Ekran 1 Ana sayfanın kaydırılmış bir kesiti ve çoğu başka iş akışının dosyası.** Yoga yeniden tasarımının
   geçme ölçütüne katılmamalı ya da ayrı raporlanmalı.
5. **Tema:** INDEX.md "Tema denetimi" artık açık dosyanın neden koyu olduğunu yazıyor. 6'nın açık ve koyu dosyaları
   plan gereği aynı. 7 uygulama kararı; §9'daki düzeltme yapılınca açık çıkacak.
