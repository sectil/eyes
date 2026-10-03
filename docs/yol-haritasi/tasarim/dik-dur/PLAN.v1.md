# Dik Dur modülü · PLAN v1 (taslak, sahip onayı bekliyor)

Sahip isteği (2026-10-03): dik durma egzersizi; istediği saatlerde ya da "şu saatler arası her 1 / her 2 saatte"
hatırlatma; kamera duruşu takip etsin (isteğe bağlı kapatılabilir); "başının üstünde ip çekiliyormuş gibi"; kafa geri,
omuzlar geri; PubMed'e dayansın; "mükemmel olmayan planı gönderme".

Bu plan kod yazmaz. Onaydan sonra parça parça yazılır; her parça ayrı TestFlight ve cihaz denemesinden geçer.

---

## 1. Kanıt: ne söyleyebiliriz, ne söyleyemeyiz

Kaynakların hepsi PubMed'den bu oturumda açıldı; PMID ve DOI doğrulandı. Alghadir 2021 dozu tam metinden alıntıyla.

| Konu | Kaynak | Ne gösteriyor | Gücü |
|---|---|---|---|
| Çökük duruş ruh hâlini düşürür, dik oturma korur | Nair 2015 (PMID 25222091, doi 10.1037/hea0000146), RCT n=74 | Dik oturanlar stres görevinde daha iyi ruh hâli, daha yüksek öz saygı, daha az korku | Orta-zayıf: tek laboratuvar, anlık |
| Etkinin kaynağı "çökmemek" | Elkjær 2022 (PMID 32569503, doi 10.1177/1745691620919358), 73 çalışmanın meta-analizi | Çökük ↔ nötr g=0,45; geniş ↔ nötr g=0,06 (sıfıra yakın) | En iyi özet |
| Çökük duruş kötü ruh hâlinden çıkışı yavaşlatır | Veenstra 2017 (PMID 27626675, doi 10.1080/02699931.2016.1225003), iki deney n=229, n=122 | Kambur duruş, dik ve kontrol duruşa göre daha az toparlanma | Orta, bağımsız laboratuvar |
| "Güç pozu" hormon etkisi | Ranehill 2015 (PMID 25810452, doi 10.1177/0956797614553946) | Büyük tekrar çalışması: testosteron, kortizol, risk alma etkisi yok | Güçlü olumsuz |
| Egzersiz baş öne duruşunu düzeltir | Xing 2026 (PMID 42445930, doi 10.2147/JPR.S614524), 10 RCT n=550 | Kraniovertebral açı +3,38°, ağrı −1,42/10; ≥8 hafta ve karma egzersiz daha iyi görünüyor | Düşük-orta kesinlik |
| Doz | Alghadir 2021 (PMID 34095302, doi 10.1155/2021/5588580), n=50 | Tam metin: "Each position is held for 10 seconds. There were 3 sets, 10 repetitions each for four days per week for four weeks. Two minutes rest was given between the sets." | Zayıf-orta; kura ile ayrılmış ama "gözlemsel" diye yayımlanmış |
| Uygulama hatırlatması | Abadiyan 2021 (PMID 33845880, doi 10.1186/s13063-021-05214-8), RCT n=60 | Fizyoterapiye eklenen uygulama: ağrı −2,05/10 daha iyi, duruş +1,6° (anlamlı ama küçük) | Zayıf: küçük, sonradan kayıtlı |
| Oturmayı bölmek | Shrestha 2018 Cochrane (PMID 30556590, doi 10.1002/14651858.CD010912.pub5) | Her yarım saatte 1–2 dk kısa mola, iki uzun molaya göre günde 40 dk daha az oturma | Düşük kalite, tek çalışma |
| Yorgunluk | Wennberg 2016 (PMID 26920441, doi 10.1136/bmjopen-2015-009630), çapraz n=19 | Her 30 dk'da 3 dk hafif yürüyüş yorgunluğu düşürdü | Pilot |
| "İp çekiliyor" ipucu | MacPherson 2015 ATLAS (PMID 26524571, doi 10.7326/M15-0667), RCT n=517 | Öğretmenle 20 Alexander dersi boyun ağrısı engelini 12 ayda azalttı | Güçlü ama öğretmenli; uygulamayla aynı şey değil |
| Fotoğrafla açı ölçümü | Gallego-Izquierdo 2020 (PMID 32911612, doi 10.3390/ijerph17186521) | Yandan fotoğrafla açı güvenilir; en küçük gerçek değişim 4,96–5,52° | Doğrulama çalışması |

**Söyleyebileceğimiz:** "Çökük oturmak ruh hâlini biraz aşağı çekebilir; dik oturmak o an biraz daha dinç ve iyi
hissettirebilir." "Düzenli boyun ve omuz egzersizi baş öne duruşunu birkaç haftada biraz düzeltebilir."

**Söylemeyeceğimiz:** hormon, "güç", "ağrını geçirir", "kalıcı enerji/motivasyon", "duruş bozukluğunu teşhis eder".
Sahibin "dik durmak motivasyonun en önemli şeyi" inancı kanıtla ancak kısmen destekleniyor: etki küçük ve anlık;
en çok çökmemekten geliyor. Ekran metinleri bu sınırda kalır.

**Güvenlik:** her oturumda bir satır: "Ağrı, baş dönmesi ya da kolda uyuşma olursa dur." (VARSAYIM, kaynak yok; tutucu.)

---

## 2. Egzersiz

Üç hareket, her biri 10 saniye tutulur (Alghadir 2021 tutma süresi):

1. **Uzan** · "Başının tepesinden yukarı bir ip çekiliyor gibi uzan." Oturarak ya da ayakta.
2. **Çeneni geri al** · "Çeneni yere paralel tutarak başını geriye kaydır; çift çene gibi." Çene aşağı eğilmez.
3. **Omuzları geri ve aşağı** · "Kürek kemiklerini hafifçe birbirine ve aşağıya doğru çek."

İki uzunluk:

| Kip | İçerik | Süre | Dayanak |
|---|---|---|---|
| **Kısa** (hatırlatmadan açılan) | Üç hareket × 3 tekrar, her tutma 10 sn, aralar 3 sn | yaklaşık 2 dk | Tutma Alghadir; kısa tur VARSAYIM (denemelerde mikro oturum dozu yok) |
| **Tam** | Çene ve omuz hareketi 3 set × 10 tekrar × 10 sn; setler arası 1 dk | yaklaşık 15 dk | Alghadir 2021 (aralar denemede 2 dk; 1 dk VARSAYIM, kısaltıldı) |

Tam kip için öneri: haftada 4 gün (Alghadir); "8 hafta ve üstü daha iyi görünüyor" (Xing 2026). Kısa kip
günde istediği kadar.

Ekran: Göz kırpma ve Egzersiz setlerinin dili. Adım adım; büyük sayaç; tek cümle yönerge; tutma bitince titreşim.
Sesli yönlendirme (bkz. §6 karar 4). Bitiş: kaç tekrar, kamera açıksa "dik duruşuna ne kadar yaklaştın".

---

## 3. Kamera (isteğe bağlı)

### Ne ölçülebilir, ne ölçülemez (Apple belgeleri; ayrıntı `arastirma-kamera.md`)

| Sinyal | Ön kamerayla | Bugün uygulamada var mı |
|---|---|---|
| Başın öne eğilip kalkması, çenenin içeri/dışarı | Evet, en sağlam sinyal | Kısmen: `headY` (yüzün kameraya göre dikey açısı, yer çekimine hizalı), `FaceDistancePlugin.swift:363` |
| Başın geriye gitmesi (yüz-kamera uzaklığı artar) | Evet, yalnız telefon sabitken ve göreli | Var: `distanceMm`, `:338` |
| Uzanınca başın yükselmesi | Göreli, telefon sabitken | Yok; yüz konumu gönderilmiyor (yeni alan gerekir) |
| Omuz hizası, omuz kalkması, "boyun uzunluğu" | Orta | Yok; Vision gövde iskeleti gerekir (yeni Swift kodu, Mac'te Xcode) |
| **Omuzların geride mi, öne yuvarlak mı** | **Hayır** (hareket kameraya doğru, önden görünmez) | — |
| Boyun açısı derece olarak (klinik ölçü) | Hayır; yandan fotoğraf ister | — |

Uygulamada telefonun hareketini okuyan hiçbir parça yok (CoreMotion yok). "Telefon sabit mi" denetimi yeni Swift
kodu ister; o gelene kadar kişiye "telefonu bir yere yasla" denir ve uzaklık sinyali yalnız yardımcı olur.

### Nasıl çalışır

1. **Ayar (her oturumun başında, 10 sn):** "Her zamanki gibi otur" 5 sn → "Şimdi dik dur" 5 sn. Kişinin kendi iki
   duruşu kaydedilir. Ölçü mutlak değil, kişinin kendi dik duruşuna göre.
2. **Egzersiz sırasında:** "Uzan" ve "Çeneni geri al" adımlarında kamera kişinin kendi dik duruşuna yakın mı bakar;
   yakınsa sayaç ilerler, uzaksa sesli/yazılı "Biraz daha uzan" der (Egzersiz setlerindeki gibi en çok 3 kez).
3. **"Omuzları geri" adımı kamerayla doğrulanmaz;** süreyle ilerler ve ekranda bunu açıkça söyler. (Sahip "omuzlar geri"
   takibini istedi; ön kamera bunu göremez. Dürüst olan bunu yazmak.)
4. **Bitişte:** "Bugün dik duruşuna %N yaklaştın" gibi göreli bir söz; derece, "bozuk", "teşhis" yok. 5°'den küçük
   farklar ilerleme diye gösterilmez (Gallego-Izquierdo 2020 en küçük gerçek değişim).
5. Kamera görüntüsü cihazdan çıkmaz; yalnız sayılar işlenir, kaydedilmez (sahip kuralı).
6. Kamera kapalıyken her şey süreyle çalışır; modül tam kullanılır.

### Aşamalar

- **K1 (yalnız JS, mevcut veri):** `headY` ve `distanceMm` ile ayar + adım doğrulama. Cihazda denenmeden "çalışıyor"
  denmez; ilk TestFlight'ta Bilgi'de bir deneme ekranı (Okurken göz denemesi gibi) ham sinyali gösterir.
- **K2 (Swift, Mac):** yüz konumu ve baş eğimi yer çekimine göre; CoreMotion ile "telefon sabit mi"; Vision ile omuz
  hizası ve omuz kalkması. Bu parça Mac'te Xcode ile derlenir; ben yazarım, sen derlersin.

---

## 4. Hatırlatma

### Bugünkü sistem (kod okundu)

- Modül başına günde en çok 3 saat: `moduleRemind.js:25` MAX_TIMES, `registry.js:127`, RemindSheet "Günde en çok 3 saat".
  Senin kararın (DEVIR §1.4).
- Günde en çok 6 modül hatırlatması; fazlası birleşir: `notifyAll.js:49` DAY_CAP.
- İki bildirim arası en az 30 dk: `notifyAll.js:48`.
- iPhone sınırı 64; uygulama 58'ini kullanır, 3 gün ilerisini kurar: `notifyAll.js:50`.
- "Her N saatte" diye bir kip yok. Dokunulmaz üç dosyaya (`notifyPlan.js`, `reminders.js`, `restNotify.js`) gerek yok.

### İstenen: aralıklı kip

"09.00 ile 18.00 arası her 1 saatte" ya da "her 2 saatte". Seçenekler: her 1 / her 2 saat; başlangıç ve bitiş saati;
günler.

Çakışmalar ve önerilen çözüm:

| Sorun | Öneri |
|---|---|
| 3 saat sınırı (senin kararın) | **Dik Dur'a istisna:** aralıklı kipte günde en çok 12 (09–21 saatte bir). Öteki modüller 3'te kalır. **Senin kararın gerekir.** |
| Günde 6 modül hatırlatması sınırı | Aralıklı dik dur hatırlatmaları bu 6'ya sayılmaz; ayrı bir kova. |
| 30 dk kuralı | Başka bir hatırlatmaya 30 dk'dan yakın düşen dik dur hatırlatması o saat atlanır (en düşük öncelik; kişinin elle seçtiği öteki saatler hiç kaymaz). |
| 58 bekleyen sınırı | Aralıklı kip yalnız 1 gün ilerisini kurar (en çok 12); uygulama her açılışta yeniden kurar. Kişi bir gün açmazsa ertesi gün hatırlatma gelmez: bunu ayarda bir satırla söyleriz. |
| Bildirim yorgunluğu | Varsayılan **her 2 saat**; her 1 saat seçilebilir. Her 30 dk ve altı yok (Abadiyan'ın 5 dk'lık hatırlatması küçük etki verdi; sık uyarı yorgunluğuna dair PubMed kanıtı bulunamadı → VARSAYIM). |
| Gece | Gece sessizliğine düşen hatırlatma kurulmaz. |

Saat kipi (günde 3 saate kadar, öteki modüller gibi) de kalır. Öneri saati: 11.00 (VARSAYIM; ekran işinin ortası).

Bildirim metni kısa ve tek iş: örnek taslak "Dik dur · Başının tepesinden bir ip çekiliyor gibi uzan." Dokununca Kısa
kip açılır. Metinler 5 kişilik metin kapısı + senin onayın; aynı gün aynı cümle tekrarlanmaz.

Eşdeğerlik: aralıklı kip kapalıyken bildirim planı bugünküyle 0 fark (`notifyAll.equiv.test.js`).

---

## 5. Kayıt ve modül

- Klasör `src/modules/dik-dur/` (ad sonra kapıdan geçer). ring `life`, kind `exercise`, domain `body`, Ana sayfada
  egzersiz bölümü.
- Oturum kaydı: `{ type: 'dik-dur', mode: 'kisa'|'tam', reps, seconds, cameraUsed, closeness? }`.
- `remind.science`: `nair2015`, `elkjaer2022`, `xing2026`, `alghadir2021` (lib/sources.js'e pmid ve doi ile eklenir).
- Nef: "dik dur" adının çekimleri (dik duruşa, dik duruştan…) Nef sözleşmesine göre; Nef cümleleri bankadan, onaylı.

---

## 6. Senden kararlar

1. **3 saat sınırına istisna:** Dik Dur aralıklı kipte günde 12'ye kadar çıkabilsin mi? (Öneri: evet, yalnız bu modül.)
2. **Varsayılan aralık:** her 2 saat mi, her 1 saat mi? (Öneri: 2 saat; kişi 1'e indirebilir.)
3. **Kamera varsayılanı:** açık mı kapalı mı? (Öneri: ilk oturumda sorulsun; açıklama + izin. Kamera izni metni senin
   onayından geçer.)
4. **Ses:** ElevenLabs ile yeni sesli yönlendirmeler (ücretli; yaklaşık 12–15 cümle × 2 ses) mi, cihazın kendi sesi mi?
   (Öneri: önce cihaz sesi; cümleler oturunca ElevenLabs, senin onayınla.)
5. **Sıra:** (Öneri) D1 egzersiz + saat hatırlatması (kamera yok) → D2 aralıklı hatırlatma → D3 kamera K1 + deneme ekranı
   → D4 kamera K2 (Mac). Her biri ayrı TestFlight.

## 7. Kapılar

- Yeni ekranlar (tanıtım, egzersiz adımı, ayar, bitiş, aralıklı hatırlatma ayarı) 5 saniye kapısı ≥4/5.
- Bütün görünen metinler: metin kapısı → benim onayım → senin onayın.
- Bir parça ancak cihazda doğrulanınca [x]; sonuçlar `cihaz-D.md`.
- Ücretli çağrı yok (ses dahil) senin onayın olmadan.
