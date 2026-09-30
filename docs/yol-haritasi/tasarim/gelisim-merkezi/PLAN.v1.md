# Gelişim merkezi · Plan (sürüm 1)

Tarih: 2026-09-30. Durum: **Sahibin üç kararı alındı (§12). 30. gün ve yürüyüş kapıdan geçti; ilk günler (1.–9. gün) geçmedi ve sahibe soruldu (§2.4).** Uygulama koduna dokunulmadı; ücretli çağrı yapılmadı. Dal:
`claude/gelisim-merkezi-plan`. Kod, onaydan sonra ana oturumda (`claude/cool-pasteur-j5yupf`) yazılır.

**Girdiler:** sahibin isteği (`SAHIP_ISTEKLERI.md` bu klasörde), `DENETIM.md` (bugünkü veri yolu, 4 kritik, 12 önemli
bulgu), onaylı `SONSUZ_YOL.PLAN.v1.md` (§3.B Y2, §3.C, §3.G, §3.H, §3.I), onaylı
`bildirim-hava-yuruyus/PLAN.v1.md` ve `DEVIR.md`, `ana-sayfa/` 5 saniye sonuçları, `IS_AKISI_KURALLARI.md`. Tasarım
sayfası: `tasarim.html` (Artifact). Maket: `maket/maket.html`. Kapı notları: `5sn-*.md`.

---

## 1. Tek sayfada

**Ne değişir.** Gelişim sekmesinin başı, verinin hepsinin toplandığı tek bir canlı resim olur: **ışık kubbesi.** Tabanda
uygulamanın simgesindeki iris (Göz alanı), üstünde baş biçiminde dört ışık yayı: Dikkat, Nefes, Ruh hâli, Hareket
(sahibin kararı). Her yay, o alanda kaç günün kaçında çalışıldığını soldan sağa, bir gösterge gibi doldurur ve tepesinde
"Nefes 26/28" yazar. Üç evre vardır: **ilk hafta** (1.–7. gün; payda 7, iris büyük, henüz açılmayan alanın izi gri
noktalı, açılanınki renkli), **ilk ay** (8.–28. gün; payda 28) ve sonrası **son 28 gün**. Başlıkta evre yazar
("İlk haftan · 3. gün"). İrisin göz bebeği kişinin İlk Bakış'ta ölçülen kendi kırpma hızıyla kırpar. Kişi yürürken Hareket yayı turuncu
yanar ve üstünde adım temposunda bir ışık akar. Altında Nef'in tek cümlesi ve beş satır durur. Bir alana dokununca o
alanın ayrıntısı açılır: düzen, basamak, ölçü, değişim.

**Arkadaki asıl iş (görünmeyen ama en önemli).** Bugün Gelişim'in satırı, alan ayrıntısı, 5. gün raporu, PDF/CSV, Ana
sayfa ve Nef aynı kayıttan farklı sonuç çıkarabiliyor (DENETIM K1, K2). Plan, veri merkezine tek bir çıkış ekler
(`growthCenter`); bütün yüzeyler yalnız onu okur. Onaylı ölçü kuralı v2 (karar 2) burada uygulanır. Denetimin kritik ve
önemli bulgularının hepsi burada ya da adı konmuş bir işte kapanır (§13 tablo).

**İsteğin nasıl karşılandığı**

| Sahibin sözü | Karşılığı |
|---|---|
| "Gelişim merkezi bizim beynimiz; bütün bilgiler burada yoğruluyor" | Tek çıkış `growthCenter`: her modül, test, alışkanlık, WHO-5, Apple Sağlık adımı, İlk Bakış ve yürüyüş buradan geçer; Gelişim, raporlar, Ana sayfa, bildirim ve Nef yalnız buradan okur (§3) |
| "Canlı bir insan gibi; gözler; beyin kısmı; burundan yukarısı bir kafatası" | Işık katmanlarından baş: gözler tabanda, beş alan baş biçiminde katmanlar. Dürüst not aşağıda |
| "Gözler olmalı, kamera tespit edebiliyor" | Göz halkası E testi, okuma testi, göz egzersizleri ve kamerayla ölçülen İlk Bakış'tan dolar; irisin göz bebeği senin ölçülen kırpma hızınla kırpar. Kamera bu ekranda açılmaz (karar 3) |
| "Yürürken hareket canlı görünür" | Yürüyüş eşliği açıkken (B3) Hareket yayı turuncu yanar, adım temposunda ışık akar; Nef satırı "Şu an yürüyorsun. 14 dakikada 1,2 km, 1.690 adım." der (§5) |
| "Göz, nefes, durum, hareket, sağlık takip edilir" | Beş alan: Göz, Dikkat, Nefes, Ruh hâli, Hareket. Apple Sağlık adımları Hareket'e girer (soru 1) |
| "Veriler kullanıcıya basit sunulur" | Ekranın başında tek resim, tek cümle, yayda "8/9" gibi tek sayı; ayrıntı dokununca |
| "İsterse bildirim; Bildirimler bölümünde öteki bildirimler gibi" | "Haftalık gelişim" bildirimi: Pazartesi, varsayılan kapalı, Bildirimler → Nef'in haberleri (§6) |
| "Sonsuz yoldaki modellerden düzgün veri gelmesi, işlenmesi" | Denetimin 4 kritik ve 12 önemli bulgusunun her biri bir işe bağlandı: çoğu G1'de, Nef'e ait iki bulgu onaylı Y6'da, görme serisi hatası G1'in ilk adımında (§13) |
| "5 saniye kuralı; mükemmel değilse gönderme" | Kapı sonucu §2'de, sayılarıyla |

**Dürüst not: fikrin kendisi 5 saniye kapısından nasıl geçti.** Üç yön denendi: (A) önden bir baş, alnın içinde ışıklı
bir beyin ağı ve iki gerçekçi göz; (B) ışık katmanları; (C) yandan profil. Beş değerlendiricinin dördü B'yi seçti. Sahip
rolündeki değerlendirici A'yı seçti, ama A'yı o da "hafif ürkütücü" buldu. Öteki dördü A'yı "uzaylı", "manken", "bana
dik bakan gözler" diye niteledi. Hemşire, beyin ağını "sahte nörolojik, beynini değiştiriyoruz gibi abartılı bir vaat"
diye okudu. Yani **gerçekçi göz ve beyin çizimi bu fikrin kapıdan geçmeyen kısmıdır**. En yakın başarılı çözüm: baş
biçimi ışık katmanlarıyla sezdirilir, gözler iris halkası olur, "beyin" sözcüğü ve beyin çizimi ekrana girmez; beyin,
katmanların kendisidir. Beş değerlendiricinin kapı sonuçları §2'de.

**Sıra.** Onaylı sıra değişmez: Build 60 → B1 → B2 → **Y2** → Y3 → Y4 → B3 → Y6. Bu plan **Y2'nin yerini alır ve onu
genişletir** (G1 + G2), gelişim bildirimi B1'in üstüne G3 olarak Y2 ile aynı sürümde gelir, canlı yürüyüş B3'ün içinde
G4 olarak gelir. Y2'nin tahmini ≈ 5 iş günüydü; bu plan ≈ 9–11 iş günüdür (VARSAYIM; §10).

**Sahibin kararları (2026-09-30, §12):** tek irisli ışık kubbesi; ilk hafta ayrı görünüm; beş alan, haftalık bildirim,
kamera yok. Üçü de öneriyle aynı.

---

## 2. Tasarım ve 5 saniye kapısı

**Yöntem.** Gerçek tokenlarla (`app/src/styles.css`: Unbounded, Onest, iris renkleri, iki tema) maket; gerçek kayıt
biçimine benzeyen örnek veri (yeni kullanıcı, her gün yolu yapıyor; 1., 9., 30. gün ve 30. günde yürürken); açık ve koyu;
390 ve 320 pt. Değerlendiriciler birbirini görmedi ve yalnız telefonda ilk görünen kısmı gördü.

**Seçim turu** (üç yön, her biri 1., 9., 30. gün): B 4/5, A 1/5 (sahip), C 0/5. C'yi beşi de "klinik, anatomi şeması,
göz yanağa yapışmış" buldu.

**Kapı tur 1 (B, ilk işleniş):** 1. gün 0/5, 9. gün 1/5, 30. gün 3/5, yürüyüş 4/5 → geçmedi. Ortak şikâyetler: 1. günde
gri boş yaylar ("henüz bir şey yok", "yükleme hatası"); yay boyu günden okunmuyor (Göz 8 gün, Hareket 7 günden kısa
görünüyor); gerçekçi gözler bakıyor ya da maskot gibi; 320'de Nef cümlesi sekme çubuğunun altında kesiliyor; yürürken
"şu an" 28 gün bilgisini siliyor; Hareket yayındaki ince iç çizgi hata gibi.

**Tur 2 düzeltmeleri:** yay artık oranı gösterir (başladığından beri, en çok son 28 gün; 1. gün 1/1 dolu); her yayın
tepesinde "Nefes 8/9"; dolan yay koyu hapla işaretlenir; gözler iris halkası olur ve halkası Göz alanının oranıyla dolar;
ince iç çizgi kalktı; yürürken hap "Hareket 28/28 · şu an" olur; 320'de baş küçülür, Nef cümlesi ilk görünümde kalır;
"Değişim yok" hapı başarı renginden ayrıldı (nötr); açıklama satırı büyüdü ve koyulaştı.

**Kapı tur 2:** 1. gün 1/5, 9. gün 3/5, 30. gün 3/5, yürüyüş 4/5 → geçmedi. Yeni şikâyet: tabandaki iki göz,
yaylarla birlikte yüz gibi okunuyor ("baykuş", "robot", "maskot"); 1. günde 1/1 dolu yaylar "bedava ödül"; 30. günde
"/28" başlıktaki "30. gün" ile çelişiyor; simetrik dolum kıyaslanmıyor. Aynı yöntemle iki tur dolduğu için yöntem değişti.

**Yöntem 2** (yeni yerleşim, iki çeşit yan yana): yay gösterge gibi soldan sağa dolar (yarısı = tepe); başlıktaki gün
kalktı, açıklama pencereyi söyler; iki göz yerine **g1** tabanda tek iris (Göz alanı, halkası oranla dolar), **g0** göz
yok (Göz en içteki yay). Beş yeni değerlendirici; notlar `kapi/5sn-yontem2.md`.

### 2.1 Sonuç ve dürüst değerlendirme

| Ekran | g1 (tek iris) | g0 (gözsüz) |
|---|---|---|
| 1. gün | 2/5 ✘ | 0/5 ✘ |
| 9. gün | 2/5 açık evet (+2 "kısmen") ✘ | 3/5 ✘ |
| 30. gün | **4/5 ✔** | 3/5 ✘ |
| Yürüyüş | **5/5 ✔** | 4/5 ✔ |
| "Her gün açarım" | **4/5** | 1/5 |

- **Geçen:** tek irisli ışık kubbesi olgun kullanıcıda (30. gün) ve canlı anda (yürüyüş) kapıyı geçiyor; beşten dördü bu
  çeşidi her gün açmak istiyor. Gözsüz çeşit "Wi-Fi simgesi, kimliksiz" diye elendi: göz, bu ekranın kimliği.
- **Geçmeyen:** ilk günler. 1. günde yay ya boş görünüyor (tur 1: "henüz bir şey yok") ya dolu (tur 2 ve yöntem 2:
  "hak edilmemiş ödül"). Bu, ilerleme gösteren her resmin ilk gün sorunudur; ana sayfa yeniden tasarımında da aynı şey
  görüldü. 9. günde iris halkasının oranı ince çizgide okunmuyor.
- **Sahip rolündeki değerlendirici** her turda "baş, kafatası, beyin yok; isteğime uzak" dedi; öteki dört rol ise baş ve
  göz çifti eklendikçe "ürkütücü", "maskot" dedi. Sahibin gerçek isteği ile beş kişilik kapı arasında bir çatışma var;
  bunu ben çözemem, sahip karar verir (§12 soru 1 ve 2).

Bu yüzden tasarım "mükemmel" diye gönderilmez. Sahibe yalnız iki karar sorusu gider; cevaba göre bir tur daha yapılır.

### 2.4 İlk hafta turları (sahibin 2. kararından sonra)

İki tur, her biri beş yeni değerlendirici; notlar `kapi/5sn-ilkhafta-tur1.md`, `kapi/5sn-ilkhafta-tur2.md`.

| Ekran | Tur 1: payda 7, açılan iz renkli | Tur 2: büyüyen kubbe, iz yok, payda hep 28 |
|---|---|---|
| 1. gün | 0/5 | 0/5 |
| 3. gün | ≈3/5 ("az" evetler) | 0/5 |
| 9. gün | 0/5 (7'den 28'e geçiş "geriledim" diye okundu) | 0/5 (4 "kısmen") |
| 30. gün | 5/5 | 5/5 |
| Yürüyüş | 5/5 | 5/5 |

**Dürüst sonuç.** Beş ayrı yaklaşım denendi (boş iz, 1/1 dolu, oran, payda 7, büyüyen kubbe). 30. gün ve canlı yürüyüş
her turda geçiyor; ilk günler hiçbirinde geçmiyor. Değerlendiricilerin ortak sözü şu: ilk günlerde bir ilerleme resmi ya
boş, ya hak edilmemiş, ya da birbirinin aynı görünüyor. Bu, ilerlemeyi gösteren her resmin doğasında var; ana sayfa
yeniden tasarımında da aynı şey görüldü. Ayrıca iki kalıcı not: dış yay büyük olduğu için aynı gün sayısı dış yayda daha
uzun görünüyor (yanlış okuma) ve kubbe tek renkte "Wi-Fi simgesi" gibi okunabiliyor. Aynı yöntemle iki tur dolduğu için
iş durdu; karar sahibindir (§12 soru 4).

### 2.2 Ekranın düzeni (ilk görünüm, 390 pt)

1. Başlık "Gelişim" ve sağda evre: "İlk haftan · 3. gün", "İlk ayın · 9. gün" ya da "Son 28 gün".
2. Işık kubbesi: dört yay (içten dışa Dikkat, Nefes, Ruh hâli, Hareket; her birinin tepesinde ad ve "26/28"), tabanda
   iris ve altında "Göz 24/28"; irisin halkası Göz alanının oranıyla dolar. Yay, hap ya da iris dokunulur; o alanın
   ayrıntısı açılır.
3. Açıklama satırı evreye göre: "İlk haftan: her yay, 7 günün kaçında o alanda çalıştığın." / "İlk ayın: her yay, 28
   günün kaçında…" / "Her yay bir alan: son 28 günün kaçında çalıştığın."
4. Nef'in tek cümlesi (telefonda kural şablonundan üretilir; §4.4).
5. Beş satır (alan, tek satır açıklama, durum hapı). Satırın hapı ile yayın hükmü aynı kaynaktan gelir (K1).
6. Kaydırınca: "Yolun · 30. gün" (onaylı Y2 bölümü), düzen (takvim), Pratikler, hatırlatma deneyi, Doktoruma göster.
   Görme keskinliği kartı Göz ayrıntısına taşınır (K2'nin ekran tarafı).

**Durumlar** (her biri iki temada ve 320 pt'de çizilir): boş (kurulum yarım: yaylar izde, cümle "İlk işin E testi;
sonra ilk ışık yanar."), 1. gün, 9. gün, 30. gün, uzun ara sonrası (oran düşmüş; cümle "Beş gün ara verdin; kaldığın
yerden devam ediyorsun."), göz sarı/kırmızı uyarısı (başın üstünde sabit uyarı kartı; göz halkası nötr, parıltısız),
yürüyüş canlı, Hareketi Azalt, VoiceOver.

### 2.3 Metin kuralları

- "Beyin" sözcüğü ekrana ve bildirime girmez (sağlık iddiası sayılabilir; kapıda "sahte nörolojik" diye okundu).
- Yay yalnız **düzeni** gösterir; iyileşme ya da gerileme göstermez. Değişim yalnız satırın hapında ve ayrıntıda, ölçü
  kuralı v2'nin sözcükleriyle yazar ("başlangıcından iyi", "başlangıcının gerisinde", "doğrulanmış bir değişim yok").
- Satırlarda kırmızı yok; "Değişim yok" nötr renk, "başlangıcından iyi" yeşil, "başlangıcının gerisinde" turuncu.
- Nef'in cümlesi en çok 70 karakter; sayılar merkezden; yasak kalıplar (`FORBIDDEN` v2) testte.

---

## 3. Veri modeli ve akış

### 3.1 Tek çıkış: `growthCenter`

`lib/dataHub.js`'e tek bir işlev eklenir; öteki her yüzey bunu okur:

```
growthCenter({ tests, sessions, profile, habits, health, walk, now }) → {
  sinceStart,                      // kaçıncı gün (ilk kayıttan; bugünkü growthMap.sinceStart)
  phase, win,                      // 'week' (1–7. gün, win 7) | 'month' (8–28, win 28) | 'rolling' (son 28 gün)
  areas: {                         // beş alan (ekranda); içeride yedi alan korunur (§3.2)
    goz | dikkat | nefes | ruh | hareket: {
      days, frac, today,           // pencerede çalışılan gün sayısı, oran, bugün var mı
      verdict,                     // 'better' | 'worse' | 'mixed' | null  (v2; §3.3)
      line, word,                  // satır metni ve hap sözcüğü (tek metin işlevinden)
      sources: [{ label, days }],  // bu alanı besleyen kayıtlar, GÜN olarak (Ö-5)
      live?: { kind:'walk', meters, steps, minutes, cadence }  // yalnız B3 oturumu sürerken
    } },
  eye: { current, currentWindow, phase, alert, message },   // trend.js aynen; tek "şimdi" değeri (K2)
  metrics: [...{ key, verdict, status }],  // status yerinde kalır (eşdeğerlik), ekranlar verdict okur
  effects: [...],                  // son 28 gün, ≥ 3 oturum (Ö-3), FEEL_ONLY hükme girmez (Ö-1)
  who5,                            // son puan, n, verdict (Ö-6)
  nef: { sentenceKey, vars }       // günün cümlesinin şablonu ve değişkenleri (§4.4)
}
```

`growthMap` (7 alan, iris) ve `hub` yerinde kalır; `growthCenter` onları çağırır. Böylece Ana sayfa haritası (`HomeMap`)
ve mevcut testler bozulmaz.

### 3.2 Beş alan ← yedi alan

İçerideki yedi alan (`eye, focus, awareness, calm, self, wellbeing, body`) ve onları kullanan her şey (iris haritası,
kurulum, 28. gün, testler) aynen kalır. Ekranda beş alan gösterilir:

| Ekrandaki alan | İçerideki alanlar | Kaynaklar |
|---|---|---|
| Göz | eye | E testi, kısa görme testi, okuma testi, göz egzersizleri, göz kırp, İlk Bakış |
| Dikkat | focus + awareness | Hızlı Bakış, Tek Bakışta, Çemberler, Yılan, Fark Ettin mi?, Bugünün görevi, nefes sayma, yoga Ders 5 |
| Nefes | calm | nefes, Dalga (günleri; bütün Dalga oturumları bugün `calm` sayılıyor), Gökyüzü, yoga Ders 1 |
| Ruh hâli | wellbeing + self | WHO-5, alarmla uyanış, Yön, yoga Ders 3, Y4'te "Günün nasıl geçti"; Dalga'nın güç ve motive etkileri (günü değil, yalnız etkisi) |
| Hareket | body | mola, su, yoga Ders 2, Apple Sağlık adımı (§3.4), B3'te yürüyüş eşliği |

Bir gün, alanın içerideki alanlarından herhangi birinde kayıt varsa o alanda "çalışılmış gün" sayılır. Kurulumdaki ve
28. gündeki iris haritası yedi alanla kalır (onaylı).

### 3.3 Hüküm (onaylı karar 2, plan §3.B.3–B.5)

- Metrik: ölçü kuralı v2 (`metricStatusV2` → `verdict`); günlük ortanca (K4), sabit başlangıç, son 3 gün, haftalık bakış,
  iki hafta sürme (K3). Göz kuralı `trend.js`'te değişmez.
- Etki: yalnız son 28 gün ve ≥ 3 oturum (Ö-3); ortalamaya dönüş notu önce → sonra kartında.
- Alan: göz uyarısı ya da WHO-5 `down` her şeyin önünde; öteki durumlarda "better" ve "worse" birlikteyse
  hüküm `null`, yanında `mixed: true` (satırda "karışık"); onaylı §3.G.4'teki `null (karışık)` ile aynı. `HomeMap` ve
  `IrisMap` yalnız `null` görür, değişmez. `FEEL_ONLY_MODULES` (yoga) hükme girmez (Ö-1).
- Ekrandaki beş alanın hükmü: içerideki alanların hükümlerinden aynı kuralla (biri `worse`, öteki `better` ise `mixed`).

### 3.4 Apple Sağlık adımları

Adımlar merkeze girer (Ö-9) ama her gün telefon taşıyan herkesin Hareket yayı dolmasın diye **gün sayma kuralı**:
Apple Sağlık'ta adımın **kişinin kendi ortancasına** (ilk 14 günün ortancası; VARSAYIM) ulaştığı gün "hareketli gün"
sayılır. Genel bir eşik (ör. 7.000) konmaz: genel eşik bir sağlık hedefi gibi okunur ve kaynak ister. Adım sayısı
yalnız satırda ve ayrıntıda görünür; telefondan çıkmaz, Nef'e gitmez (bugünkü `health` rızası: "yan yana göstermek",
"yalnızca bu telefonda").

### 3.5 Tutarlılık kuralları (her biri testle)

1. Aynı kayıt kümesi için Gelişim satırı, alan ayrıntısı, 5. gün raporu, PDF, CSV, Ana sayfa haritası, bildirim ve Nef
   paketi aynı `verdict`'i ve aynı göz "şimdi" değerini verir.
2. Sayılar gün sayar, kayıt saymaz (Ö-5, Kü-1).
3. Pencere her yerde yazılır ("son 28 gün", "başladığından beri") (Kü-5).
4. Tek metin işlevi: yön ve işaret tek yerden (`changeText`), "−0,0" yok (Ö-8, Kü-4).
5. Mola, su, alarm ve adımlı günler CSV'de satır olur (Ö-7); PDF'te alan başına gün sayısı.

---

## 4. Ekranlar

### 4.1 Gelişim başı (§2.2)

`components/GrowthHead.jsx` (yeni): tuval (canvas) çizimi; veri yalnız `growthCenter`'dan. Dokunma alanları her yay
ve hap için en az 44 pt. VoiceOver: her yay bir düğme ("Nefes: ilk ayının 28 gününün 8'inde"), iris "Göz: 28 günün 8'inde; son ölçüm
alışma döneminde".

### 4.2 Alan ayrıntısı (onaylı §3.B.6 dört katman)

Düzen (28 gün şeridi, gün olarak), Basamak (Y1'den), Ölçü (başlangıç → şimdi), Değişim (yalnız kural doğrularsa). Göz
ayrıntısında görme keskinliği kartı (bugünkü `VisionSection`) ve okuma kartı; ikisi de `growthCenter.eye`'dan (K2).
İlk Bakış kırpma sayısı yöntemiyle yazılır; farklı yöntemler yan yana konmaz (Kü-9).

### 4.3 Profilim → İris haritan (A11 (a))

Profilim'e "İris haritan" satırı; IrisPlan'ı açar. İris hücreleri `hub` alanlarından (A11 (b)); takvim mola ve su
günlerini gösterir (A11 (c)).

### 4.4 Nef'in cümlesi

Telefonda kural şablonu (onaylı §3.C.4 tablosu), ağ ve rıza gerekmez. Öncelik: göz uyarısı (Nef yazmaz, kart) → canlı
yürüyüş → olay (yay ilk kez doldu, 28. gün, uzun aradan dönüş) → düzen cümlesi → en dolu yay. Modelli Nef ancak Y6'da
ve rıza v2 ile bu paketi okur; bu planda Nef paketine yeni alan eklenmez.

---

## 5. Canlı öğeler ve Hareketi Azalt

| Öğe | Kaynak | Ne zaman | Hareketi Azalt açıkken |
|---|---|---|---|
| Açılışta yayların dolması (900 ms, bir kez) | `growthCenter.areas[].frac` | günün ilk açılışında | yok; yaylar dolu çizilir |
| İrisin göz bebeğinin kırpması | `profile.firstLook.blinks/seconds` (20 sn'de 3 → ≈ 6,7 sn'de bir) | ekran açıkken | yok |
| Bugün çalışılan alanın yayında ince parıltı | `areas[].today` | ekran açıkken, 2 sn | yok; hapın yanında nokta |
| Yürüyüşte turuncu yay ve akan ışık (adım temposu) | B3 `WalkPlugin` oturumu (`cadence`) | yalnız yürüyüş eşliği sürerken | ışık akmaz; hap "şu an" |
| Adım sayısı | Apple Sağlık (bugünkü okuma) | ekran açılınca ve öne gelince | aynı |

**Dürüst sınır:** B3'ten önce "canlı yürüyüş" yoktur; o zamana kadar adımlar ekran açılınca ve uygulama öne gelince
yenilenir. Apple Sağlık'tan saniye saniye adım okunmaz; canlı tempo yalnız yürüyüş eşliğinde, `CMPedometer`'dan gelir
(onaylı B3). **Pil:** çizim yalnız ekran görünürken; 30 fps sınırı; 10 sn dokunulmazsa yalnız kırpma sürer
(VARSAYIM; cihazda ölçülür).

---

## 6. Gelişim bildirimi

**Ne:** "Haftalık gelişim", Bildirimler → Nef'in haberleri'nde bir satır; varsayılan **kapalı**. Teklif, 7. günden sonra
Gelişim'in altında bir kez: "Her pazartesi haftanı tek cümleyle yazayım mı?" [Evet] [Şimdi değil]; reddedilirse bir
daha sorulmaz (Bildirimler'den açılır).

**Ne zaman:** Pazartesi (ölçü kuralı v2'nin bakış günü ve haftalık Nef ile aynı), kişinin uygulamayı en sık açtığı saat
varsayılan 09.30, kişi Bildirimler'den değiştirir; `calm` penceresi 08.00–22.00, gece sessizliği ve onaylı
planlayıcının aralık kuralı (`planAll`: planlayıcıda ≥ 30 dk). Geçen takvim haftasında hiç kayıt yoksa gönderilmez (suçlama yok). Aylık: 29., 57., 85. gün (onaylı Nef
dönemleriyle aynı gün), aynı satırdan.

**Kimlik:** 7870 (haftalık), 7871 (aylık); `notifyApply` uzlaştırılan aralığa (`OWN`) eklenir. JS'in bekleyen bütçesi
(≤ 58) içinde; en çok 2 yuva. Dokunma: `extra.kind: 'growth'` → Gelişim açılır, bilim kartı üstte.

**Metin:** onaylı cümle bankası yolundan (B1a elle yazılmış, B1b banka); sayılar ve alan adları telefonda
`growthCenter`'dan yer tutucuyla girer; model rakam yazmaz. Örnekler (başlık ≤ 30, gövde ≤ 110):
- "Haftan hazır" · "Geçen hafta 5 gün çalıştın; en dolu yayın nefes."
- "Haftan hazır" · "Hareket yayın ilk kez tamamlandı. Dikkatte sonucun iki haftadır başlangıcından iyi."
- "Kilit ekranında sayı gösterme" açıksa: "Haftan hazır" · "Bakmak için dokun."
Bildirimde "gerisinde", göz uyarısı ve sağlık yorumu yoktur; uyarılar yalnız uygulamada (onaylı §3.C.3).

**Bilim kartı** (dokununca; görünür bilim satırı günde bir bildirimde, onaylı karar 3):
- Harkin 2016 (e-yayın 2015), *Psychological Bulletin*, meta-analiz, 138 çalışma, 19.951 kişi: ilerlemeyi izlemeyi artıran
  müdahaleler hedefe ulaşmayı artırdı (d = 0,40); ilerleme kaydedildiğinde ve başkasına bildirildiğinde etki daha
  büyüktü. Sınır: çok farklı davranışlar ve hedefler; bir sağlık sonucunu göstermez. PMID 26479070, DOI
  10.1037/bul0000025.
- Michie 2009, *Health Psychology*, meta-regresyon, 122 değerlendirme, 44.747 kişi: sağlıklı beslenme ve hareket
  müdahalelerinde kendini izleme, çalışmalar arası farkın en büyük payını (%13) açıkladı; kontrol teorisinden bir başka
  teknikle birleşince etki büyüdü (0,42'ye karşı 0,26). Sınır: heterojenlik yüksek (I² %69); beslenme ve hareket dışına
  genellenmez. PMID 19916637, DOI 10.1037/a0016136.
İkisi de bu oturumda PubMed'de açılıp okundu. Kart bulguyu çalışmanın kendi sözcükleriyle ve sınırıyla verir; Nefona için "yararlıdır" ya da sağlık sonucu yazmaz.

---

## 7. Rıza ve gizlilik

- **Yeni veri toplanmıyor; yeni rıza yok.** Bütün hesap telefonda. Bildirimin metni telefonda üretilir, sunucuya
  gitmez.
- **Apple Sağlık adımı:** bugünkü `health` rızasının amacı "hareketini göz çalışmalarınla yan yana göstermek, yalnızca
  bu telefonda". Adımlı günü Hareket yayında göstermek bu amacın içindedir (VARSAYIM; hukukçu listesine not düşülür).
  Adım Nef'e ve sunucuya gitmez.
- **Kamera:** bu ekran kamerayı açmaz. Gözler kayıtlı kırpma sayısıyla canlanır. Kamera görüntüsü telefondan çıkmaz
  (DENETIM §4: kodda çıkış bulunmadı; Swift tarafı cihazda doğrulanır).
- **Nef:** bu planda Nef paketine yeni alan eklenmez. WHO-5 durumu ve hükümler Y6'da, rıza v2 ile girer (onaylı karar 6).
- **"Tüm verileri sil":** yeni saklanan bir şey yok (açılış animasyonunun "bugün gösterildi" işareti dâhil, `storageKeys`'e
  eklenir). Bakış kalibrasyonunun silinmemesi (Kü-12) ayrı iş olarak önerildi.
- Gizlilik sayfası ve App Store etiketi değişmez (yeni veri ve yeni amaç yok).

---

## 8. Kod sözleşmesi (mevcut sistem bozulmaz)

### 8.1 Aşamalar ve dosyalar

| Aşama | Yeni | Değişen |
|---|---|---|
| **G1** veri (Y2 çekirdeği) | `growthCenter` ve testi; `changeText` | `lib/progress.js` (`metricStatusV2`, `metricCards` → `verdict`; `status` ve `metricTrend` yerinde), `lib/dataHub.js` (`verifiedChange`: `verdict`, `mixed`, FEEL_ONLY, etkiler 28 gün; test kayıtlarını `activitiesFrom` kuralıyla gün sayma; `health` ve adımlı gün), `lib/exportData.js` (merkezden; alışkanlık satırları; yönlü etki metni), `screens/FirstReport.jsx` (WHO-5 n > 1), `modules/reading/manifest.js` (`reading-cps`), `modules/tek-bakis/manifest.js` (`span7` ortanca), `lib/iris.js` (`irisCells` merkezden; `ANSWER_FIELDS`), `screens/Calendar.jsx` (mola/su), `lib/iris.js snapshot` (kırpma yöntemi) |
| **G2** ekran | `components/GrowthHead.jsx` ve testi | `components/ProgressOverview.jsx` (baş, beş satır; `metricStatus` → `verdict`; `signed`; Yöntem metni onaylı §3.B.5), `screens/Progress.jsx` (sıra; "Yolun"; VisionSection Göz ayrıntısına), `components/HomeMap.jsx` (alan hükmü `growthCenter`'dan), `screens/ProfileHome.jsx` (İris haritan satırı), `styles/progress2.css` |
| **G3** bildirim (B1'den sonra) | `lib/growthNotify.js` ve testi | `lib/notifyAll.js` (`planAll`'a 7870–7871), `lib/notifyApply.js` (`OWN`), Bildirimler sayfası (Nef'in haberleri satırı), bilim kartı kaynakları (`lib/sources.js`: Harkin 2016, Michie 2009), dokunma sözlüğü |
| **G4** canlı yürüyüş (B3 içinde) | — | `GrowthHead` B3 `walk` oturum olayını dinler |

Her aşamada `app/src/lib/releases.js`'e sürüm notu; hatalar `HATA_GUNLUGU.md`'ye; açık işler `YAPILACAKLAR.md`'ye.

### 8.2 Bilinçli olarak değişen test beklentileri

- `lib/dataHub.test.js`: "better + worse → down" yerine `null` ve `mixed: true` (onaylı §3.G.4 ile aynı satır); `records` gün sayar.
- `modules/coachStats.test.js`: `span7` ortanca (onaylı).
- Gelişim satırı metnini sabitleyen testler (`ProgressOverview.eye.test.jsx`, `.yoga.test.jsx`, `FirstReport.test.jsx`):
  göz satırı `current` ve "son 3 test"; yoga hükme girmez; WHO-5 ikinci ölçüm. Listelenmeyen bir beklenti değişmek
  zorunda kalırsa iş durur ve sahibe sorulur.

### 8.3 Değişmeden yeşil kalması gerekenler

`lib/trend.test.js`, `lib/today.test.js`, `registry.test.js`, bildirim testleri (`notifyPlan`, `reminders`,
`notifyLog`), yoga testleri, Y1 ve B1 testleri, bütün takım.

### 8.4 Eşdeğerlik

- **Tohumlu düzenek** (`mulberry32(1)`, 20.000 rastgele depo: 0–400 gün, her modülden kayıt, aynı gün çok tur,
  alışkanlık, WHO-5, sağlık, ara): eski ve yeni kodda `growthMap`'in `days`, `strip`, `sinceStart`, `frac` alanları
  **0 farkla** aynı; fark yalnız izinli listede: hüküm metni ve `verdict` (K1–K4, Ö-1, Ö-3, Ö-8); görme testinin gün
  olarak sayılması (Ö-5: `records`, kaynak satırı); Apple Sağlık'ta kendi ortancasını geçen günün Beden `days` ve `strip`'ine
  girmesi (Ö-9). Taban, G1'den önceki `dataHub.js`, `progress.js`, `stats.js` ve `exportData.js`'in `test/fixtures/gelisim-taban/` altına
  kopyasıdır (onaylı bildirim planının dondurma kalıbı).
- **Tek hesap testi:** aynı depodan Gelişim satırı, ayrıntı, 5. gün raporu, PDF, CSV, Ana sayfa, bildirim metni ve Nef
  paketi aynı `verdict`'i ve göz değerini verir. Nef paketi bu teste Y6'da girer (bugünkü paket göz dışında hüküm
  taşımıyor; yeni alan rıza v2 ister) (denetimin B betiği bu testin çekirdeğidir).
- **Denetim betikleri** (A 12 durum, B 4 durum, C) teste çevrilir; her bulgu bir test olur.

---

## 9. Kalite kapıları ve "bitti" tanımı

Her aşamada sırasıyla: (1) tasarım (bu sayfa; iki tema, 390 ve 320 pt, bütün durumlar §2.2); (2) sahibin onayı;
(3) kod ve testler; (4) bütün takım yeşil, eşdeğerlik 0 fark; (5) iki bağımsız inceleme (kod ve dil); (6) TestFlight;
(7) cihaz listesi; (8) sahibin cihazda bakışı; (9) uygulamanın gerçek ekranlarında 5 saniye kapısı (beşte en az dört).

**Cihaz listesi:** yeni kurulumda 1. ve 2. gün; eski hesapta ilk açılış (yaylar gerçek geçmişle, 28 gün); gece yarısı
geçişi; uzun ara; iki tema; iPhone SE (320 pt) ve büyük ekran; Hareketi Azalt; VoiceOver ile her yay; Apple Sağlık izni
yok / var; göz sarı ve kırmızı uyarısı; açılış animasyonunun günde bir kez oynaması; pil (10 dk açık ekranda); G3:
Pazartesi bildiriminin saati, gece sessizliği, kilit ekranında sayı gizleme, dokununca Gelişim; G4: yürürken turuncu yay
ve tempo.

**"Bitti":** cihazda doğrulanmadan `[x]` yok; kodda bitip cihazda görülmeyen `[~]`.

---

## 10. Sıra ve takvim

| Adım | İş | Bağımlılık | Süre (VARSAYIM) |
|---|---|---|---|
| G0 | Bu plan, tasarım onayı, sahibin 3 kararı | — | — |
| — | Build 60 → B1 → B2 (onaylı sıra) | — | — |
| **G1** | Veri: `growthCenter`, v2, denetim düzeltmeleri, eşdeğerlik | Y1 kodu (ilerleme bağlamı "Yolun" için) | 5–6 iş günü |
| **G2** | Gelişim başı ve ekranlar, İris satırı, takvim | G1 | 3–4 iş günü |
| **G3** | Haftalık gelişim bildirimi | B1, G1 | 1 iş günü |
| — | Y3 → Y4 (onaylı) | — | — |
| **G4** | Canlı yürüyüş | B3 | B3'ün içinde ≈ 0,5 iş günü |

G1 + G2 + G3 onaylı Y2'nin yerine geçer (Y2 ≈ 5 → ≈ 9–11 iş günü). Öteki aşamaların sırası değişmez.

---

## 11. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar**
- Cihazda hiçbir şey denenmedi; maket tarayıcıda çizildi. Canvas çiziminin eski iPhone'da akıcılığı ve pil etkisi
  ölçülmedi.
- Kapı değerlendiricileri yapay kişilerdir (beş rol); gerçek kullanıcı sınaması değildir. Uygulamanın gerçek
  ekranlarında kapı yeniden yapılır (§9 madde 9).
- Yay düzeni gösterir, etkiyi göstermez. "Dolu yay" sağlığın iyi olduğu anlamına gelmez; ekranda böyle bir iddia yoktur.
- Kamera görüntüsünün çıkmadığı yalnız JS tarafında doğrulandı; Swift tarafına bakılmadı.
- Gözlerin kişinin kırpma hızıyla kırpması bir göstergedir, ölçüm değildir; İlk Bakış'ın kendi sınırları geçerlidir.
- Bilim kartındaki iki kaynak davranış değişimi genelindedir; Nefona'ya özgü bir sonuç göstermez.

**VARSAYIM:** beş alanın gruplaması ve adları (soru 1); adımda kişisel ortanca eşiği ve 14 gün; açılış animasyonu 900 ms
ve günde bir; 30 fps ve 10 sn boşta kuralı; bildirimin Pazartesi ve aylık günleri; 7870–7871 kimlikleri; teklifin 7.
günden sonra bir kez çıkması; iş günü tahminleri; "karışık" alan hâli ve ölçü kuralı v2'nin parametreleri (onaylı
plandan).

---

## 12. Sahibin kararları (2026-09-30: "tamamdır. evet diytoum")

Üç önerinin üçü de kabul edildi:
1. **Görünüm:** tek irisli ışık kubbesi. Gerçek baş ve iki göz çizilmez.
2. **İlk günler:** ilk hafta ayrı görünüm (payda 7, iris büyük, alanlar açıldıkça izleri renklenir); sahibe ancak 5 saniye
   kapısından geçerse gider (§2.4).
3. **Beş alan** (Göz, Dikkat, Nefes, Ruh hâli, Hareket; Apple Sağlık Hareket'te); **haftalık gelişim bildirimi**
   (Pazartesi, varsayılan kapalı, aylık özet 29., 57., 85. gün); **Gelişim açılınca kamera açılmaz.**

4. **İlk günler (açık soru, 2026-09-30).** Işık kubbesi 30. günde ve yürürken 5/5 ile geçiyor; 1.–9. gün beş ayrı
   yaklaşımda geçmedi (§2.4). (a) **İlk 9 gün Gelişim'in başında kubbe yerine "bugün ne biriktirdin" görünümü:** o gün
   yapılan işler, her biri kendi alanının renginde ve sayısıyla; kubbe 10. günde ilk kez açılır ("Kubben hazır"). Bu bir
   tasarım turu daha ister; sana ancak geçerse gelir. (b) Kubbe ilk günden kalsın; ilk günlerin 5 saniye kapısını
   geçmediğini bilerek kabul et; kullanıcı ilk günlerde zaten Ana sayfada ve yolda. **Öneri: (a).**

## 13. Eleştirilerden sonra düzeltmeler (doğruluk 21, eksiklik 36 bulgu)

Eleştiriler: `elestiri/dogruluk.md`, `elestiri/eksiklik.md` (bu klasörde). Kritik ve önemli bulguların karşılığı:

| Bulgu | Düzeltme |
|---|---|
| "Bütün bulgular bu işte kapanır" yanlıştı | Denetim bulgularının iş tablosu: K1–K4, Ö-1, Ö-3…Ö-10 → G1/G2. Ö-2 ve Ö-12 (Nef) → onaylı Y6 (paket v2 ve rıza v2 ister). **Ö-11 (kamerasız tek E testi kırmızı uyarıyı siliyor) → G1'in ilk adımı**; `trend.js`'te yalnız seri seçimi değişir, göz kuralı (alışma, başlangıç, son 3, eşikler) değişmez; ayrıca ayrı iş olarak da önerildi, hangisi önce gelirse. Kü-12 (bakış kalibrasyonu silinmiyor) → aynı ayrı iş |
| K2 ve `verdict` okuyan dosyalar izinli listede yoktu | G1/G2 listesine eklenir: `screens/Home.jsx` (göz kartı `current7 ?? last` → `eye.current`), `screens/Who5.jsx` (`metricStatus` → `verdict`), `App.jsx` (`growthCenter` girdisi `health`, dokunma yolu `growth`). `lib/coach.js` G1'de yalnız okunur, değişmez (Y6) |
| Adım eşiği hesaplanamıyordu | `health.dailyTotals` en çok 60 günü veriyor; kişisel ortanca eldeki son 60 günün (en az 7 adımlı gün) ortancasıdır; 7 günden az veride adım günü Hareket'e sayılmaz, yalnız satırda görünür. Adım depoya yazılmaz, her açılışta yeniden okunur (VARSAYIM; cihazda doğrulanır) |
| `mixed` onaylı planla çelişiyordu | `null` + `mixed: true` (§3.3) |
| Dalga eşlemesi yanlıştı | Dalga günleri Nefes'te, yalnız etkileri Ruh hâli'nde (§3.2) |
| Eşdeğerlikte "0 fark" ile Ö-5, Ö-9 çelişiyordu | İzinli listeye eklendi; taban dondurma yolu yazıldı (§8.4) |
| Tek hesap testinde Nef | Y6'ya ertelendi (§8.4) |
| §8.2'de onaylı listenin dışında dört test beklentisi | Bu planın onayı bu dört beklentinin değişmesini de kapsar; öteki her beklenti değişikliğinde iş durur |
| Bildirim bütçesi (≤ 58) en kötü durumda dolu | Öncelik: deney bildirimleri > modül hatırlatmaları > aylık gelişim > haftalık gelişim; yer yoksa aylık önce düşer, haftalık bir sonraki açılışta yeniden kurulur. Aylık ile haftalık aynı güne düşerse yalnız aylık gider. Metin kurulum anında `growthCenter`'dan üretilir |
| "Sen karar ver" yanlış anılmıştı; ≥ 60 dk | Saat varsayılan 09.30, kişi değiştirir; aralık onaylı planlayıcının kuralı (§6) |
| Harkin yılı, kart dili | "2016 (e-yayın 2015)"; kart bulguyu kendi sözcükleriyle verir (§6) |
| Evre kenarları | Evre ilk kayıttan geçen takvim gününe (`sinceStart`) göre, cihazın yerel gece yarısında değişir; ara vermek evreyi değiştirmez. Kaydı olmayan eski kurulumda ilk kayıt günü başlangıçtır. "Uzun ara" tek eşik: 3 gün ve üstü (onaylı §3.C.4'teki 3–13 gün satırı) |
| Nef cümlesinin önceliği onaylı §3.F.4 ile çelişiyordu | Gelişim'deki cümle onaylı §3.F.4 sırasını izler; bu plan yalnız "canlı yürüyüş" satırını ekler (B3 ile) |
| "Bugün gösterildi" işareti | `App.jsx` "Tüm verileri sil" akışına eklenir (modül `storageKeys` değil) |
| Kapı eşiği | Bu işte görev emriyle 5'te 4 uygulandı (`IS_AKISI_KURALLARI.md` 5'te 3 der); turlar yöntem değişince yeniden sayıldı ve her yöntemde en çok iki tur yapıldı |
| Kilit ekranında sayı | "Kilit ekranında sayı gösterme" açıksa gelişim bildirimi sayısız metne döner; bu, onaylı anahtarın kapsamını genişletir, B1 kodunda anahtarın açıklama satırına eklenir |
| Cihaz listesi | Eklenenler: saat dilimi değişimi, 9 → 10. gün ve 28 → 29. gün geçişi, Apple Sağlık izninin geri çekilmesi, "Tüm verileri sil" sonrası, büyük yazı (Dinamik Yazı) |
