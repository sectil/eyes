# Dik Dur modülü · PLAN v2 (sahip onayı bekliyor)

Sahip isteği (2026-10-03): dik durma egzersizi; istediği saatlerde ya da "şu saatler arası her 1 / her 2 saatte" devamlı
hatırlatma; kamera duruşu takip etsin, kafa geri, omuzlar geri (kamera isteğe bağlı kapatılabilir); "başının üstünde
ip çekiliyormuş gibi"; "kaç saat uygundur"; PubMed'e dayansın; "mükemmel olmayan planı gönderme".

v1 iki bağımsız eleştiriden geçti (doğruluk: kod ve PubMed; eksiklik: istek ve ürün). Bulguların hepsi işlendi; her
düzeltme §9'da. Bu plan kod yazmaz; onaydan sonra parça parça yazılır, her parça ayrı TestFlight ve cihaz denemesi.

---

## 1. Kanıt: ne söyleyebiliriz, ne söyleyemeyiz

Kaynaklar PubMed'den bu oturumda açıldı; PMID ve DOI doğrulandı; Alghadir ve Abadiyan tam metinden okundu.

| Konu | Kaynak | Ne gösteriyor | Gücü |
|---|---|---|---|
| Dik oturma, stresle çökük oturmaya göre | Nair 2015 (PMID 25222091, doi 10.1037/hea0000146), RCT n=74 | Dik oturanlarda daha iyi ruh hâli, daha yüksek öz saygı, daha az korku | Orta-zayıf: tek laboratuvar, anlık |
| Etkinin kaynağı "çökmemek" | Elkjær 2022 (PMID 32569503, doi 10.1177/1745691620919358), 73 çalışma | Çökük ↔ nötr g=0,45; geniş ↔ nötr g=0,06 (sıfıra yakın) | En iyi özet |
| Çökük duruş kötü ruh hâlinden çıkışı yavaşlatır | Veenstra 2017 (PMID 27626675, doi 10.1080/02699931.2016.1225003), n=229 ve n=122 | Kambur duruşta daha az toparlanma | Orta, bağımsız laboratuvar |
| "Güç pozu" | Ranehill 2015 (PMID 25810452, doi 10.1177/0956797614553946) | Hormon ve risk alma etkisi tekrarlanmadı | Güçlü olumsuz (yalnız hormon ve risk alma için) |
| Egzersiz baş öne duruşunu düzeltir | Xing 2026 (PMID 42445930, doi 10.2147/JPR.S614524), 10 RCT n=550, boyun ağrılı ve baş öne duruşlu kişiler | Kraniovertebral açı +3,38°, ağrı −1,42; ≥8 hafta ve karma egzersiz daha iyi görünüyor (keşif analizi) | Düşük-orta kesinlik |
| Doz | Alghadir 2021 (PMID 34095302, doi 10.1155/2021/5588580), n=50, kura | Tam metin: "Each position is held for 10 seconds. There were 3 sets, 10 repetitions each for four days per week for four weeks." Bu doz sırtüstü, basınç geri bildirimli boyun eğme egzersizi içindi; aynı çalışmanın klasik egzersizleri de 3×10, 10 sn tutma | Zayıf-orta; **doz başka, gözetimli bir egzersizden ödünç** |
| Uygulama hatırlatması | Abadiyan 2021 (PMID 33845880, doi 10.1186/s13063-021-05214-8), RCT n=60 | Fizyoterapiye eklenen, 5 dakikada bir duruş hatırlatan uygulama: ağrı −2,05 daha iyi (orta etki), duruş +1,6° | Zayıf: küçük, sonradan kayıtlı, gözetimli tedaviye ek |
| Oturmayı bölmek | Shrestha 2018 Cochrane (PMID 30556590, doi 10.1002/14651858.CD010912.pub5) | Her yarım saatte 1–2 dk kısa mola, iki uzun molaya göre günde 40 dk daha az oturma | Düşük kalite, tek çalışma |
| Yorgunluk | Wennberg 2016 (PMID 26920441, doi 10.1136/bmjopen-2015-009630), çapraz n=19, 45–75 yaş, kilolu | Her 30 dk'da 3 dk yürüyüş yorgunluğu düşürdü | Pilot; yürüyüş molası, duruş değil (dolaylı) |
| "İp çekiliyor" ipucu | MacPherson 2015 ATLAS (PMID 26524571, doi 10.7326/M15-0667), RCT n=517 | Öğretmenle 20 Alexander dersi: boyun engeli 12 ayda 3,79 puan daha az | Güçlü ama öğretmenli; ipucu tek başına denenmedi |
| **Ne kadar dik?** | Slater 2019 (PMID 31366294, doi 10.2519/jospt.2019.0610), görüş yazısı | "Doğru oturuş ağrıyı önler" inancının güçlü kanıtı yok | Görüş, deneme değil |

**"Kaç saat uygundur" sorusunun cevabı:** saatlerce dik durmanın faydasını gösteren çalışma yok. Bir duruşu katı tutmak
yorar. Kanıtın desteklediği: sık sık pozisyon değiştirmek, oturmayı kısa molalarla bölmek ve gün içinde kısa "dik dur"
anları. Uygulama "gün boyu dik kal" demez; "sık sık kısa bir dik an" der. Bu cümle tanıtım ekranında durur.

**Söyleyebileceğimiz:** "Çökük oturmak ruh hâlini biraz aşağı çekebilir; dik oturmak o an biraz daha iyi hissettirebilir."
"Düzenli boyun ve omuz egzersizi, haftalar içinde baş öne duruşunu biraz düzeltebilir."

**Söylemeyeceğimiz:** hormon, "güç", "ağrını geçirir", "kalıcı enerji ya da motivasyon", "duruş bozukluğu teşhisi",
"telefon boynunu mahvediyor" gibi korkutan söz.

**Güvenlik (VARSAYIM, kaynak yok; tutucu):** ilk açılışta tek ekran: "Yakında boyun ya da omuz sakatlığın, ameliyatın
ya da kola yayılan ağrın olduysa önce doktoruna sor." Her adımda yumuşak dil ("zorlamadan", "rahatça"). Her oturumda:
"Ağrı, baş dönmesi ya da kolda uyuşma olursa dur."

---

## 2. Egzersiz

Üç hareket; her biri 10 saniye tutulur:

1. **Uzan** · "Başının tepesinden yukarı bir ip çekiliyor gibi uzan."
2. **Çeneni geri al** · "Çeneni yere paralel tutarak başını geriye kaydır." Çene aşağı eğilmez.
3. **Omuzlar geri ve aşağı** · "Kürek kemiklerini zorlamadan birbirine ve aşağıya doğru çek."

| Kip | İçerik | Süre | Dayanak |
|---|---|---|---|
| **Kısa** | Üç hareket × 3 tekrar, 10 sn tutma, 3 sn ara | yaklaşık 2 dk | 10 sn tutma Alghadir'den; kısa tur VARSAYIM (denemelerde gün içi mini oturum dozu yok) |
| **Tam** | Çene ve omuz hareketi 3 set × 10 tekrar × 10 sn; setler arası 1 dk | yaklaşık 15 dk | Alghadir 3×10×10 sn; setler arası denemede 2 dk, kısa tutmak için 1 dk (VARSAYIM) |

**Hangisi ne zaman:** bildirime dokununca Kısa açılır. Ana sayfada haftanın Tam günlerinde (varsayılan haftada 4 gün,
Alghadir) "Tam", öteki günler "Kısa" önerilir; ikisi de her zaman seçilebilir. Haftalık 4 Tam hedefi ilerlemede görünür.

**Ekran:** Göz kırpma ve Egzersiz setlerinin dili; adım adım, büyük sayaç, tek cümle yönerge, tutma bitince titreşim,
sesli yönlendirme (§7 karar 5). Yüz kaybolursa sayaç durur: "Yüzünü göremiyorum." (ceza yok).
**Bitiş:** kaç tekrar; kamera açıksa göreli yakınlık; "Bana hatırlat" satırı.

---

## 3. Kamera (isteğe bağlı)

### 3.1 Ne ölçülebilir

| Sinyal | Ön kamerayla | Uygulamada bugün |
|---|---|---|
| Çeneni geri alma (baş geriye kayar) | Evet: yüz-kamera uzaklığı +20–30 mm; telefon sabitken, göreli | `distanceMm` (`FaceDistancePlugin.swift:338`) |
| Başını eğme (yanlış hareket: çene aşağı) | Evet | `headY`: yüzün baktığı yönle kameraya giden çizgi arasındaki dikey açı (`:527-532`). **Kameraya göre**, yer çekimine göre değil; telefon kıpırdarsa değişir. Burada yalnız "baş eğildi mi" denetimi için |
| Uzanma (baş yükselir) | Göreli: `headY` birkaç derece ve uzaklık birlikte | var (iki sinyal birlikte) |
| Gerçek baş eğimi (yer çekimine göre) | Evet | Yok; Swift'te tek satır: yüzün ileri ekseninin dikey bileşeni (`asin(a.y)`), ARKit dünyası zaten yer çekimine hizalı (`:515-516`) |
| Omuz kalkması / omuzlar aşağı | Orta (önden görünür) | Yok; Vision 2B iskelet (Swift) |
| **Omuzlar geri / öne yuvarlak** | **Önden hayır; yandan evet** (§3.3) | Yok |
| Mutlak boyun açısı, teşhis | Hayır | — |

Uygulamada telefonun hareketini okuyan parça yok (CoreMotion yok). İlk sürümde "telefonu bir yere yasla" denir ve uzaklık
yalnız telefon yaslıyken kullanılır; telefonun kıpırdadığını Swift parçası gelince ARKit'in kamera konumundan anlarız
(doğrulanmadı; ilk Swift parçasında denenir).

### 3.2 Önden: egzersiz sırasında

1. **Ayar bir kez:** "Her zamanki gibi otur" 5 sn → "Şimdi uzan, çeneni geri al" 5 sn. Kişinin kendi iki duruşu kaydedilir.
   Yer başına ayrı (masa, ayakta). Sonraki oturumlarda 3 sn "aynı yer mi" bakışı; uzaklık ya da açı çok kaydıysa yeniden ayar.
2. **Uzan** ve **Çeneni geri al** adımlarında kamera kişinin kendi dik duruşuna yakın mı bakar; yakınsa sayaç ilerler,
   değilse en çok 3 kez "Biraz daha uzan" / "Çeneni eğme, geriye kaydır" der (Egzersiz setlerinde `MAX_REMINDERS = 3`,
   `Routine.jsx:69`).
3. **Omuzlar** adımında önden yalnız "omuzlar aşağı" denetlenebilir (Swift parçasından sonra); "geri" kısmı önden
   doğrulanmaz ve ekranda bu açıkça yazar.
4. Bitişte göreli söz: "Dik duruşuna bugün %N yaklaştın." Derece yok, "bozuk" yok, teşhis yok. Hangi farkın gerçek
   sayılacağı cihaz gürültüsünden belirlenir (ilk TestFlight'taki deneme ekranında ölçülür; tahmin yazılmaz).

### 3.3 Yandan: "Yan kontrol" (omuzlar geri bunun işi)

Telefon dik yaslanır, kişi yana döner (kamera kulağı ve omzu yandan görür). Vision 2B iskelet ile **kulak ile omuz
arasındaki yatay fark ve açı**: boyun açısının ölçüldüğü yön tam olarak bu (klinik ölçü yandan fotoğrafla). Omzun kulak
çizgisine göre önde olması "omuzlar öne yuvarlak" vekilidir.

- Kişi ekrana bakamaz; yönlendirme sesli ve titreşimli zorunlu.
- 30 sn; günde ya da haftada bir. Haftalık eğilim çizgisi ilerlemeye girer.
- **Önce cihazda deneme:** Vision'ın ön kamerada, masa uzaklığında kulak ve omzu güvenilir bulup bulmadığı ölçülmeden
  özellik yapılmaz. Tutmazsa plan bunu sana yazar; uydurma ölçü gösterilmez.
- Önden derinlik (TrueDepth) ile omuz-yüz farkı da bir seçenek; doğrulanmadı, aynı denemede bakılır.

### 3.4 Kamera düğmesi ve izin

- Modülde "Kamerayla takip" düğmesi (tanıtımda ve modül ayarında); seçim hatırlanır.
- iPhone izni yoksa: açıklama + "Ayarlar'ı aç". İzin verilmiş ama düğme kapalıysa kamera hiç açılmaz.
- `Info.plist` kamera açıklaması bugün yalnız 40 cm ve göz kırpmayı söylüyor; duruş eklenmeli (App Store kuralı).
  Metin senin onayından geçer.
- TrueDepth olmayan cihazda yalnız süreyle; modül tam kullanılır.
- Görüntü cihazdan çıkmaz, kaydedilmez; yalnız sayılar işlenir.
- Öteki modüllerin kamerasıyla gün boyu gizli duruş ölçümü **yok**: o izin uzaklık ve göz kırpma içindi (KVKK amaç
  sınırı). İstenirse sonra ayrı izinle.

---

## 4. Hatırlatma

### 4.1 Bugünkü sistem (kod okundu)

- Modül başına günde en çok 3 saat (`moduleRemind.js:25`, `registry.js:127`; senin kararın).
- Kişinin elle seçtiği saat gece, pencere ve 30 dk kurallarına uymaz (sahip kararı 2026-10-01; `notifyAll.js:22-26`).
  30 dk kuralı yalnız uygulamanın seçtiği saatlere.
- Modül hatırlatmaları 3 gün ilerisi (`moduleRemind.js:21`); 74xx deney planı 7 gün (`notifyPlan.js:18`) ve kırpılmaz.
- Bekleyen sınırı 58 (`notifyAll.js:50`); aşılırsa önce bütün modüllerin ufku 3→2→1 güne iner, sonra sondan atılır.
- Plan yalnız uygulama açıkken kurulur; arka plan yenilemesi yok (`App.jsx:617-686`; Info.plist yalnız audio).
- Tekrarlayan bildirim bugün bilinçli olarak kullanılmıyor ("tek bir günü atlayamaz", `notifyApply.js:8`). Eklenti
  günlük ve haftalık tekrarı destekliyor (`on: { hour, minute }`, `on: { weekday, … }`; definitions.d.ts okundu).

### 4.2 Aralıklı kip

"Başlangıç–bitiş saati, her 1 ya da her 2 saatte, hangi günler". Saat kipi (günde 3 saate kadar) de kalır.
Aralıklı saatler **kişinin seçtiği saat** sayılır: gece ve pencere kuralı uygulanmaz (senin kuralın); yalnız 01–05 yok.

**Devamlılık (karar 2):**

| Yol | Nasıl | Artı | Eksi |
|---|---|---|---|
| **A · Tekrarlayan** (öneri) | Her dilim için bir günlük tekrar (`on: { hour, minute }`); 09–21 her 2 saat = 7 bekleyen, her 1 saat = 13 | Uygulama açılmasa da her gün gelir: "devamlı" | Gün seçimi yalnız "her gün" (hafta içi seçimi 5 kat bekleyen ister); "az önce yaptım, sıradakini atla" yapılamaz (tek günü atlamak bütün tekrarı siler) |
| B · Kayan pencere | Önümüzdeki 48 saat, tek tek | Gün seçimi, "yaptım, atla" | Uygulama 2 gün açılmazsa durur |

**Bütçe:** A yolunda 7 ya da 13 bekleyen sabit ve önce ayrılır; 58 sınırı aşılırsa bugünkü kural işler (öteki modüllerin
ufku 3→2→1 güne iner). Bu yüzden her 1 saat seçilince ayarda bir satır: "Öteki hatırlatmalar daha az gün ileriye
kurulur." (VARSAYIM; testle sabitlenir.)

**Başka hatırlatmayla aynı yarım saat:** bugün iki farklı modülün elle seçilmiş saatleri 30 dk içindeyse tek bildirimde
birleşir (`notifyAll.js:309-315`). A yolunda Dik Dur dilimi her gün sabit çalar, birleşemez: aynı yarım saate başka bir
hatırlatma düşerse ikisi de gelir (A yolunun sınırı; açıkça yazıyoruz). B yolunda o dilim ötekiyle birleşir.

**Bildirim:** kısa ve tek iş, örnek taslak "Dik dur · Başının tepesinden bir ip çekiliyor gibi uzan." (metin kapısı +
senin onayın; dilimlere göre birkaç cümle dönüşümlü). Düzey sessiz (`interruptionLevel: 'passive'`): Odak kipinde
susar, ses çıkarmaz (eklenti 8.1+ destekliyor; cihazda denenecek). Dokununca Kısa açılır.

**Bildirim düğmeleri (ayrı parça, D4):** "15 dk sonra" ve "Yaptım" (`registerActionTypes`, eklentide var); "Bugünlük
yeter" (o günün kalanını susturur; A yolunda tekrarı silmeden yapılamaz, B yolunda yapılır). Bir hafta hiç açılmazsa
Nef "her 2 saate alalım mı" diye sorar (yorgunluk koruması; VARSAYIM).

**Varsayılan aralık:** her 2 saat, 09.00–19.00 (VARSAYIM). Kanıt: kısa molalar 30 dakikada bir denendi (Cochrane);
duruş hatırlatması için en iyi sıklığı gösteren çalışma bulunamadı. 30 dakikadan sık seçenek yok.

### 4.3 Kod işi ve testler

Dokunulmaz üç dosyaya gerek yok. Değişecek dosyalar: `moduleRemind.js` (aralık ayarı `normalizeModuleReminders`'tan
düşmesin; `capOf`), `registry.js` (`validateRemind`), `notifyAll.js` (ayrı kova, birleşme), `notifyApply.js` (yeni kimlik
aralığı 7868–7899, `OWN_RANGES`, `isNewId`, tekrarlayan kurulum), `notifyTap.js` (dokununca Kısa).

Yeni kimlik aralığı iptal listesine girdiği için **üç test bilerek değişir**: `notifyAll.equiv.test.js:203`,
`notifyApply.test.js:266`, `notifyAll.test.js:37` (iptal kimlik listesi). Eşdeğerliğin özü korunur: aralıklı kip kapalıyken
bildirim planı bugünküyle 0 fark. Bu üç test için iznin karar 6'da.

---

## 5. Motivasyon ve ilerleme

- Haftalık "dik an" sayısı ve dakika; Tam günleri hedefi (haftada 4); seri, var olan ilerleme ekranında.
- Yan kontrol yapılıyorsa haftalık eğilim (yalnız gürültüden büyük farklar).
- İsteğe bağlı: bugünkü ve 4 hafta önceki duruşun çizgi silueti (fotoğraf değil; yalnız birkaç nokta). v2.
- Nef: "dik dur" adının çekimleri onaylı adlar listesine (`APPROVED_NAMES`), ilerleme ölçüleri ve banka cümleleri
  (Nef sözleşmesi `nef.contract.test.js`); hepsi senin onayınla.
- Hiçbir motivasyon cümlesi §1'deki sınırı aşmaz.

---

## 6. Modül, erişilebilirlik, riskler

- Klasör `src/modules/dik-dur/` (ad kapıdan geçer); ring `life`, kind `exercise`, domain `body`; Ana sayfada egzersiz.
- Kayıt: `{ type: 'dik-dur', mode: 'kisa'|'tam'|'yan', reps, seconds, cameraUsed, closeness? }`.
- `remind.science`: nair2015, elkjaer2022, xing2026, alghadir2021 (sources.js'e pmid ve doi ile).
- VoiceOver: tutma ve sayaç duyurulur; Hareketi Azalt'a uyulur; titreşim desenleri: başla, tut, bitti, düzelt.
- Koyu tema ve 320 px her yeni ekranda; 5 sn kapısı.
- Pil ve ısı: Vision 10–15 Hz, `thermalState` yükselince yavaşlar; oturum süresi sınırlı.
- Apple Watch ve widget bu sürümde yok. Kilit ekranı widget'ı ("bugün N dik an") v2 adayı.
- AirPods baş izleme (kamerasız baş eğimi) v2 adayı; doğrulanmadı.

---

## 7. Senden kararlar

1. **3 saat sınırına istisna:** Dik Dur aralıklı kipte günde 13'e kadar çıkabilsin mi? (Öneri: evet, yalnız bu modül.)
2. **Devamlılık:** A tekrarlayan (her gün, uygulama açılmasa da) mı, B kayan 48 saat (gün seçimi var, açılmazsa durur) mı?
   (Öneri: A.)
3. **Varsayılan aralık:** her 2 saat mi, her 1 saat mi? (Öneri: 2.)
4. **Kamera:** ilk oturumda sorulsun mu? (Öneri: evet; açıklama ekranı + izin; metin senin onayından geçer.)
5. **Ses:** önce cihazın sesi, cümleler oturunca ElevenLabs (ücretli, senin onayınla) mı? (Öneri: evet.)
6. **Üç test izni:** §4.3'teki üç test yeni kimlik aralığı için bilerek değişebilir mi?
7. **Sıra** (öneri):
   - **D1** (yalnız JS, tek TestFlight): egzersiz Kısa ve Tam + saat ve aralıklı hatırlatma + kamera deneme ekranı (ham
     sinyaller; Okurken göz denemesi gibi) + önden kamerayla adım doğrulama (uzaklık ve eğim, göreli).
   - **D2** (Swift, Mac'te derlenir): gerçek baş eğimi, telefon kıpırdadı mı, Vision ile omuz kalkması + Yan kontrol denemesi.
   - **D3:** Yan kontrol (deneme tutarsa) + ilerleme eğilimi.
   - **D4:** bildirim düğmeleri, yorgunluk koruması.

## 8. Kapılar

- Yeni ekranlar (tanıtım, güvenlik, telefon yerleşimi çizimi, ayar, adım, bitiş, aralıklı hatırlatma ayarı, Yan kontrol)
  5 saniye kapısı ≥4/5; koyu ve 320 px.
- Bütün görünen metinler: metin kapısı → benim onayım → senin onayın.
- Bir parça ancak cihazda doğrulanınca [x]; sonuçlar `cihaz-D.md`.
- Ücretli çağrı yok (ses dahil) senin onayın olmadan.

## 9. v1'den düzeltilenler (eleştiri bulguları)

| v1 | v2 |
|---|---|
| `headY` "yer çekimine hizalı" | Yanlıştı: kameraya göre (`:527-532`); yalnız "baş eğildi mi" denetimi; gerçek eğim Swift'te tek satır |
| Çene geri alma için baş eğimi sinyali | Asıl sinyal uzaklık; doğru yapılan hareket eğimi neredeyse değiştirmez |
| "Omuzlar geri ölçülemez" ve orada bitiyordu | Yan kontrol eklendi (yandan kulak–omuz), önce cihazda denenir |
| Aralıklı saatlere gece ve 30 dk kuralı | Senin 2026-10-01 kuralın: elle seçilen saat kısıtlanmaz |
| 1 gün ufuk; açılmazsa sessizlik | Tekrarlayan bildirim (A) ya da 48 saat (B); karar 2 |
| "5°'den küçük fark gösterilmez" (Gallego-Izquierdo) | O sayı yandan fotoğraf ölçüsü içindi; eşik cihaz gürültüsünden ölçülecek |
| Abadiyan'dan "sık hatırlatma iyi değil" çıkarımı | Kaldırıldı: o çalışmada sık hatırlatan kol daha iyiydi; sıklık VARSAYIM |
| Alghadir dozu dik oturarak çene geri alma içinmiş gibi | Doz sırtüstü, gözetimli bir egzersizden ödünç; açıkça yazıldı |
| "Kaç saat uygundur" cevapsız | §1: saatlerce dik durmanın kanıtı yok; sık kısa dik anlar |
| Kimlik aralığı, bütçe, değişecek dosyalar ve testler yazılmamış | §4.3 |
| Kamera düğmesi, Info.plist, TrueDepth'siz cihaz, yüz kaybı, ayar yükü | §2, §3.2, §3.4 |
| Motivasyon yok | §5 |
| İlk TestFlight zayıf (aralıklı ve kamera yoktu) | D1'e aralıklı hatırlatma ve kamera girdi |
| Güvenlik tek satır | İlk açılışta tarama ekranı + yumuşak dil |
| Nef sözleşmesinin gereği eksik | §5 |
