# Ders 3 · Uykuya Geçiş — metin (B adımı, Parti 1)

Sürüm: B-parti1-metin-1 (2026-09-30; ses yok, inceleme bekliyor). Kaynak: `ders3.lesson.json` (tek kaynak `ders3_kaynak.py`). **Ses yok:** ElevenLabs bağlantısı bu oturumda yoktu; hiçbir ses üretilmedi, ücretli çağrı yapılmadı. Bütün süreler hece modelinden tahmindir (**VARSAYIM**; köşeler §7). Metin, PLAN.v3 §E.1'in üç onayını bekliyor: inceleyici adı verilmediği için karar 2 yedeği (Türkçe editör ve usta hoca yerine birbirinden bağımsız iki model incelemesi; Ders 3 psikolog gerektirmez).

Okuma anahtarı: `[a–b]` klipten sonraki sessizlik (sn, planlayıcı bu aralıkta esnetir). **(Z)** zorunlu: 5 dk dahil her sürümde çalar. **(İ n)** isteğe bağlı: Nefona Hoca köşesinde (4,68 hece/sn, yüksek duraklama) *n*. dakikadan itibaren girer; Neslihan köşesinde farklıysa ikisi yazılır. **6+** "yalnız 6 dk ve üstü" (minTarget). Çok cümleli klip tek TTS isteğidir, cümle sonlarından kesilir; ekrandaki cümle söylenen cümledir (SPEC.v3 §3.1).

## 1. Ders kimliği

| Alan | Değer |
|---|---|
| Söz (kart) | Günü bırakıp uykuya yavaşça geçmek için. |
| Duruş, zaman | yatakta, ışık kapalı ya da kısık; gece dersi. Süreler **5 · 15** (varsayılan 15; 3 dk yok, PLAN.v3 §A.3) |
| Teknik ve çalma sırası | Varış → C1 yavaş, uzun veriş (tutma yok, sayı yok) → C2 bedenin ağırlaşması (ayaklardan başa) → C4 nefesle geri sayma (10 dk'dan) → C3 tek sahneli, ayrıntılı imgeleme → K uyku izni. Dışa dönüş yok. |
| Benzersiz açılış | "Günün sesleri geride kalıyor; yatağına yerleşiyorsun." (PLAN.v2 §A.2.1 yönünün "-(y)abil-"siz, "şimdi"siz biçimi) |
| Anahtar cümle | "Bugün bitti; artık dinlenebilirsin." (C1 sonu) → "Bugün bitti; dinlenebilirsin." (C4 sonu, 10 dk ve üstü) → "Bugün bitti." (uyku izninin başı). 5–9 dk'da iki geçiş. |
| İmge yayı | yağmurlu bir akşam: oda ya da üstü örtülü veranda (yağmur istemeyen için sessiz akşam) → yağmuru dinlemek (ses, oluk, ıslak toprak kokusu, camdaki izler) → örtünün ağırlığı ve sıcaklığı → lambanın sarı ışığı → ışık kısılır, loş bir aydınlık kalır (karanlık tümüyle gelmez) |
| Derse özgü motif | ağırlığı yatağa **vermek** (Ders 2'nin "zemin taşıyor"undan ayrı); "Bugün bitti." |
| Görsel | sönen kor, kehribar `#E3A857` / `#9B651A`; sayıyla bir soluk kararır; uyku izninde söner, ekran siyah |
| Müzik | La♭ majör sıcak pad + çok seyrek keçe piyano (VARSAYIM); 48 BPM hissi, vuruşsuz; doğa: çatıda hafif yağmur (sürekli, gök gürültüsü yok, damla şıpırtısı yok); varsayılan açık. Kuyruk 0/5/10/20 dk (varsayılan 10), son 3 dk kosinüs, tamamen durur; sürenin dışında |
| Ses | Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`), `eleven_v4`, 3 çekim; uyku izninden sonra ses gerçekten alçalır: −4,5 / −6 dB (`voicePhaseGainDb.sleepSteps`) |
| Gelişim | önce puanı yok; ertesi sabah 12.00'ye kadar: "Dün gece uykuya dalmak ne kadar kolaydı?" 1–10 |

## 2. Metin, blok blok

### A · Varış (tek kapak; isteğe bağlılar süreyle eklenir)

Evre: Varış. 5/10/15 dk blok süresi (hoc): 45.2 / 76.9 / 85.6 sn.

```
‖ (Z) Günün sesleri geride kalıyor; yatağına yerleşiyorsun. [3–7]
‖ (Z) Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun. [5–9]
‖ (İ 8) Üşüyorsan örtünü omuzlarına kadar çekmen iyi olur. [6–10]
‖ (Z) Gözlerini kapatmak ya da açık tutmak sana kalmış. [3–6]
‖ (Z) İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin. [3–7]
‖ (Z) Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter. [3–8]
‖ (İ 7) Ne kadar gevşeyeceğine her an sen karar veriyorsun. [3–7]
‖ (İ 8) Yarına kalan işler sabaha kadar bekler. [4–8]
```

### C1 · Yavaş, uzun veriş (tutma yok, sayı yok)

Evre: Derinleşme. 5/10/15 dk blok süresi (hoc): 57.9 / 98.4 / 124.4 sn.

```
‖ (Z) Önce nefesini olduğu gibi fark ediyorsun. [8–14]
‖ (İ 9) Nefes en çok nerede belirginse dikkatin orada kalsın. [8–14]
‖ (Z) Alışı zorlamadan verişi biraz uzatmak yeterli. [10–16]
‖ (İ 7) Nefes zor gelirse kendi ritmine dön. [4–8]
‖ (Z 6+) Her veriş, günü biraz daha geride bırakıyor. [8–14]
‖ (İ 12) Veriş burundan ya da hafif aralık dudaklardan çıkabilir. [8–14]
‖ (Z) Birkaç nefes boyunca bu ritmi sürdürüyorsun. [16–20]
‖ (Z) Bugün bitti; artık dinlenebilirsin. [6–12]
```

### C2 · Bedenin ağırlaşması: ayaklardan başa yavaş beden dolaşımı

Evre: Derinleşme. 5/10/15 dk blok süresi (hoc): 68.6 / 108.3 / 202.3 sn.

```
‖ (Z) Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla. [3–6]
‖ (Z) Önce ayaklarının ağırlığını yatağa veriyorsun. [5–10]
‖ (İ 9) Topuklarının yatağa değdiği yeri fark ediyorsun. [5–10]
‖ (Z) Bacakların da yatağa yaslanıyor. [5–10]
‖ (İ 11) Uylukların ağır ve sıcak olabilir. [5–10]
‖ (Z) Belin ve sırtın bütün ağırlığıyla yatakta. [5–10]
‖ (İ 12/nes 11) Omurgan boydan boya yatağa uzanıyor. [6–11]
‖ (İ 11) Ellerin olduğu yerde dinleniyor. [5–10]
‖ (Z) Kollarının ağırlığını da yatağa veriyorsun. [5–10]
‖ (İ 9) Omuzların yatağa doğru inebilir. [5–10]
‖ (İ 13) Ensen yastığa yaslanıyor. [5–10]
‖ (İ 12) Alnın gevşek, gözlerinin çevresi yumuşak. [5–10]
‖ (İ 13/nes 12) Çenen serbest, dişlerin hafif aralık. [5–10]
‖ (Z) Başının ağırlığını yastık taşıyor. [5–10]
‖ (İ 13) Ellerinde ve ayaklarında hafif bir sıcaklık olabilir. [6–11]
‖ (İ 7) Ağırlık her yerde aynı olmayabilir; bu da olur. [5–10]
‖ (Z) Baştan ayağa bütün bedenin yatağın üstünde. [6–12]
```

### C4 · Nefesle geri sayma (ondan bire; kısa biçim beşten)

Evre: Derin. 5/10/15 dk blok süresi (hoc): 0.0 / 82.8 / 145.2 sn. Blok 10. dakikada girer (entryRank 195); altı…on 14. dakikada tek grup olarak.

```
‖ (Z) Ondan bire geri sayacağım. Her sayıda nefesini bırakıyorsun. [5–8]
‖ (İ 11) Nefesin sayılara uymasa ya da sayıyı kaçırsan da olur. [8–13]
‖ on…° dokuz…° sekiz…° yedi…° altı…° beş… dört… üç… iki… bir.  {sayılar; 8 sn'de bir; taşıyıcı car.sayi3}
‖ (Z) Sayılar burada bitiyor. Kaçını duyduğun önemli değil. [6–11]
‖ (Z) Bugün bitti; dinlenebilirsin. [9–15]
```

° altı…on isteğe bağlı grup (14. dakikadan). Sayılar tek başına üretilmez: "Sayıyorum… on… dokuz… sekiz… yedi… altı… beş… dört… üç… iki… bir." tek istekte okunur, üç nokta duraklarından kesilir, ön söz atılır.

### C3 · Tek sahneli, ayrıntılı imgeleme: yağmurlu akşam, oda ya da veranda

Evre: Derin. 5/10/15 dk blok süresi (hoc): 82.4 / 183.2 / 272.3 sn.

```
‖ (Z) Zihninde yağmurlu bir akşam belirebilir. [5–10]
‖ (Z) Görüntü belirmese de, gözlerin açık kalsa da sorun değil. [8–14]
‖ (Z) Belki sıcak bir odadasın. Belki üstü örtülü bir verandadasın. [5–10]
‖ (İ 7) Yağmur istemezsen sessiz bir akşam da olur. [8–14]
‖ (Z) Yağmur çatıya usul usul vuruyor. [8–14]
‖ (İ 8/nes 7) Oluktan tek tük damlalar düşüyor. [5–10]
‖ (İ 7) Havada ıslak toprağın kokusu var. [9–16]
‖ (İ 14) Yakındaki camda yağmur izleri ağır ağır süzülüyor. [5–10]
‖ (Z) Üstünde kalın, yumuşak bir örtü var. [5–10]
‖ (İ 8) Örtü, üstünde tatlı bir ağırlıkla duruyor. [9–16]
‖ (İ 9) Altında kendi sıcaklığın birikiyor. [6–11]
‖ (İ 13) Parmak uçların örtünün dokusunu buluyor. [6–11]
‖ (İ 8) Yastığın kumaşı serin ve yumuşak. [9–16]
‖ (Z) Köşede bir lamba sarı, sıcak bir ışık veriyor. [8–14]
‖ (İ 11) Yağmurun sesi hiç değişmeden sürüyor. [5–10]
‖ (İ 13) Yukarıda yağmurun, yakında kendi nefesinin sesi var. [9–16]
‖ (Z) Lambanın ışığı yavaş yavaş kısılıyor. [7–13]
    5 dk kısa biçimi: Lambanın ışığı kısılıyor; loş bir aydınlık kalıyor. [8–13]
‖ (Z 6+) Çevrende loş, yumuşak bir aydınlık kalıyor. [10–17]
‖ (İ 12) Yağmuru dinlemekten başka yapacak bir şey yok. [7–12]
```

### K · Uyku izni (dışa dönüş yok; müzik kuyruğu sürenin dışında)

Evre: Derin. 5/10/15 dk blok süresi (hoc): 42.5 / 46.4 / 65.5 sn.

```
‖ (Z) Bugün bitti. [6–10]
‖ (İ 12) Nefes kendi ritminde gelip gidiyor. [9–14]
‖ (Z) Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak. [10–15]
‖ (Z) Uyanık kalırsan da olur; uzanıp dinlenmek yeter. [7–12]
‖ (Z) Gece senin. [5–8]
```

## 3. Süre sürüm sürüm (Nefona Hoca köşesi, 4,68 hece/sn, yüksek duraklama; VARSAYIM)

| dk | bloklar | klip | hece | konuşma payı | blok süreleri (A · C1 · C2 · C4 · C3 · K) |
|---|---|---|---|---|---|
| 5 | A+C1+C2+C3+K | 27 | 445 | %37 | 0:49 · 0:58 · 1:09 · — · 1:22 · 0:43 |
| 6 | A+C1+C2+C3+K | 29 | 471 | %32 | 0:54 · 1:17 · 1:17 · — · 1:46 · 0:47 |
| 7 | A+C1+C2+C3+K | 34 | 544 | %32 | 1:02 · 1:26 · 1:29 · — · 2:15 · 0:47 |
| 8 | A+C1+C2+C3+K | 39 | 616 | %31 | 1:22 · 1:26 · 1:29 · — · 2:56 · 0:47 |
| 9 | A+C1+C2+C3+K | 43 | 679 | %31 | 1:25 · 1:42 · 1:53 · — · 3:12 · 0:48 |
| 10 | A+C1+C2+C4+C3+K | 51 | 738 | %30 | 1:21 · 1:38 · 1:48 · 1:23 · 3:03 · 0:46 |
| 11 | A+C1+C2+C4+C3+K | 55 | 797 | %30 | 1:23 · 1:41 · 2:12 · 1:39 · 3:18 · 0:47 |
| 12 | A+C1+C2+C4+C3+K | 60 | 872 | %30 | 1:22 · 1:55 · 2:33 · 1:39 · 3:30 · 1:01 |
| 13 | A+C1+C2+C4+C3+K | 65 | 947 | %30 | 1:22 · 1:55 · 3:05 · 1:39 · 3:58 · 1:01 |
| 14 | A+C1+C2+C4+C3+K | 71 | 975 | %28 | 1:23 · 1:56 · 3:07 · 2:20 · 4:12 · 1:02 |
| 15 | A+C1+C2+C4+C3+K | 71 | 975 | %26 | 1:30 · 2:04 · 3:22 · 2:25 · 4:32 · 1:05 |

Önek kuralı: her dakikanın klipleri bir sonrakinin alt kümesidir (5 ⊂ 6 ⊂ … ⊂ 15; üç köşede denetlendi, `timing.txt`). Kısa biçim (c3.kisilir, 5 dk) aynı kimlikle çalar.

### 5 dakika · hoc köşesi (toplam 300.0 sn, konuşma 109.6 sn, giriş müziği 3.4 sn)

```
  0:03  A   a.acilis       Günün sesleri geride kalıyor; yatağına yerleşiyorsun.  [+3.4]
  0:12  A   a.durus        Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun.  [+5.4]
  0:22  A   a.gozler       Gözlerini kapatmak ya da açık tutmak sana kalmış.  [+3.4]
  0:29  A   a.izin         İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [+3.8]
  0:40  A   a.kolay        Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter.  [+3.8]
  0:49  C1  c1.fark        Önce nefesini olduğu gibi fark ediyorsun.  [+8.8]
  1:01  C1  c1.veris       Alışı zorlamadan verişi biraz uzatmak yeterli.  [+10.8]
  1:16  C1  c1.birkac      Birkaç nefes boyunca bu ritmi sürdürüyorsun.  [+16.8]
  1:36  C1  c1.k1          Bugün bitti; artık dinlenebilirsin.  [+6.8]
  1:47  C2  c2.cerceve     Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla.  [+3.4]
  1:58  C2  c2.ayak        Önce ayaklarının ağırlığını yatağa veriyorsun.  [+5.8]
  2:08  C2  c2.bacak       Bacakların da yatağa yaslanıyor.  [+5.8]
  2:17  C2  c2.bel         Belin ve sırtın bütün ağırlığıyla yatakta.  [+5.8]
  2:26  C2  c2.kol         Kollarının ağırlığını da yatağa veriyorsun.  [+5.8]
  2:36  C2  c2.bas         Başının ağırlığını yastık taşıyor.  [+5.8]
  2:45  C2  c2.butun       Baştan ayağa bütün bedenin yatağın üstünde.  [+6.8]
  2:55  C3  c3.sahne       Zihninde yağmurlu bir akşam belirebilir.  [+5.8]
  3:04  C3  c3.gelmezse    Görüntü belirmese de, gözlerin açık kalsa da sorun değil.  [+8.8]
  3:18  C3  c3.yer         Belki sıcak bir odadasın. Belki üstü örtülü bir verandadasın.  [+5.8]
  3:30  C3  c3.yagmur      Yağmur çatıya usul usul vuruyor.  [+8.8]
  3:42  C3  c3.ortu        Üstünde kalın, yumuşak bir örtü var.  [+5.8]
  3:51  C3  c3.lamba       Köşede bir lamba sarı, sıcak bir ışık veriyor.  [+8.8]
  4:04  C3  c3.kisilir     Lambanın ışığı kısılıyor; loş bir aydınlık kalıyor.  [+8.8]  (5 dk kısa biçimi)
  4:17  K   k.anahtar3     Bugün bitti.  [+6.8]
  4:25  K   k.izin         Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak.  [+10.8]
  4:41  K   k.uyanik       Uyanık kalırsan da olur; uzanıp dinlenmek yeter.  [+7.8]
  4:53  K   k.son          Gece senin.  [+5.4]
  4:59  — dosya biter; müzik kuyruğu başlar (sürenin dışında)
```

### 5 dakika · nes köşesi (toplam 300.0 sn, konuşma 104.2 sn, giriş müziği 3.5 sn)

```
  0:03  A   a.acilis       Günün sesleri geride kalıyor; yatağına yerleşiyorsun.  [+3.5]
  0:12  A   a.durus        Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun.  [+5.5]
  0:22  A   a.gozler       Gözlerini kapatmak ya da açık tutmak sana kalmış.  [+3.5]
  0:29  A   a.izin         İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [+4.0]
  0:39  A   a.kolay        Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter.  [+4.0]
  0:48  C1  c1.fark        Önce nefesini olduğu gibi fark ediyorsun.  [+9.0]
  1:01  C1  c1.veris       Alışı zorlamadan verişi biraz uzatmak yeterli.  [+11.0]
  1:16  C1  c1.birkac      Birkaç nefes boyunca bu ritmi sürdürüyorsun.  [+17.0]
  1:36  C1  c1.k1          Bugün bitti; artık dinlenebilirsin.  [+7.0]
  1:46  C2  c2.cerceve     Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla.  [+3.5]
  1:57  C2  c2.ayak        Önce ayaklarının ağırlığını yatağa veriyorsun.  [+6.0]
  2:08  C2  c2.bacak       Bacakların da yatağa yaslanıyor.  [+6.0]
  2:16  C2  c2.bel         Belin ve sırtın bütün ağırlığıyla yatakta.  [+6.0]
  2:26  C2  c2.kol         Kollarının ağırlığını da yatağa veriyorsun.  [+6.0]
  2:35  C2  c2.bas         Başının ağırlığını yastık taşıyor.  [+6.0]
  2:44  C2  c2.butun       Baştan ayağa bütün bedenin yatağın üstünde.  [+7.0]
  2:55  C3  c3.sahne       Zihninde yağmurlu bir akşam belirebilir.  [+6.0]
  3:04  C3  c3.gelmezse    Görüntü belirmese de, gözlerin açık kalsa da sorun değil.  [+9.0]
  3:17  C3  c3.yer         Belki sıcak bir odadasın. Belki üstü örtülü bir verandadasın.  [+6.0]
  3:30  C3  c3.yagmur      Yağmur çatıya usul usul vuruyor.  [+9.0]
  3:42  C3  c3.ortu        Üstünde kalın, yumuşak bir örtü var.  [+6.0]
  3:51  C3  c3.lamba       Köşede bir lamba sarı, sıcak bir ışık veriyor.  [+9.0]
  4:04  C3  c3.kisilir     Lambanın ışığı kısılıyor; loş bir aydınlık kalıyor.  [+9.0]  (5 dk kısa biçimi)
  4:17  K   k.anahtar3     Bugün bitti.  [+7.0]
  4:25  K   k.izin         Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak.  [+11.0]
  4:41  K   k.uyanik       Uyanık kalırsan da olur; uzanıp dinlenmek yeter.  [+8.0]
  4:53  K   k.son          Gece senin.  [+5.5]
  5:00  — dosya biter; müzik kuyruğu başlar (sürenin dışında)
```

### 15 dakika · hoc köşesi (toplam 900.0 sn, konuşma 238.4 sn, giriş müziği 4.7 sn)

```
  0:05  A   a.acilis       Günün sesleri geride kalıyor; yatağına yerleşiyorsun.  [+5.1]
  0:15  A   a.durus        Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun.  [+7.1]
  0:27  A   a.ortu         Üşüyorsan örtünü omuzlarına kadar çekmen iyi olur.  [+8.1]
  0:39  A   a.gozler       Gözlerini kapatmak ya da açık tutmak sana kalmış.  [+4.7]
  0:48  A   a.izin         İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [+5.7]
  1:01  A   a.kolay        Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter.  [+6.1]
  1:12  A   a.karar        Ne kadar gevşeyeceğine her an sen karar veriyorsun.  [+5.1]
  1:21  A   a.isler        Yarına kalan işler sabaha kadar bekler.  [+6.1]
  1:30  C1  c1.fark        Önce nefesini olduğu gibi fark ediyorsun.  [+11.5]
  1:46  C1  c1.yer         Nefes en çok nerede belirginse dikkatin orada kalsın.  [+11.5]
  2:01  C1  c1.veris       Alışı zorlamadan verişi biraz uzatmak yeterli.  [+13.5]
  2:19  C1  c1.zorlanirsan Nefes zor gelirse kendi ritmine dön.  [+6.1]
  2:28  C1  c1.gun         Her veriş, günü biraz daha geride bırakıyor.  [+11.5]
  2:44  C1  c1.dudak       Veriş burundan ya da hafif aralık dudaklardan çıkabilir.  [+11.5]
  2:59  C1  c1.birkac      Birkaç nefes boyunca bu ritmi sürdürüyorsun.  [+18.7]
  3:22  C1  c1.k1          Bugün bitti; artık dinlenebilirsin.  [+9.5]
  3:35  C2  c2.cerceve     Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla.  [+4.7]
  3:48  C2  c2.ayak        Önce ayaklarının ağırlığını yatağa veriyorsun.  [+8.1]
  4:00  C2  c2.topuk       Topuklarının yatağa değdiği yeri fark ediyorsun.  [+8.1]
  4:13  C2  c2.bacak       Bacakların da yatağa yaslanıyor.  [+8.1]
  4:24  C2  c2.uyluk       Uylukların ağır ve sıcak olabilir.  [+8.1]
  4:35  C2  c2.bel         Belin ve sırtın bütün ağırlığıyla yatakta.  [+8.1]
  4:46  C2  c2.omurga      Omurgan boydan boya yatağa uzanıyor.  [+9.1]
  4:59  C2  c2.el          Ellerin olduğu yerde dinleniyor.  [+8.1]
  5:10  C2  c2.kol         Kollarının ağırlığını da yatağa veriyorsun.  [+8.1]
  5:22  C2  c2.omuz        Omuzların yatağa doğru inebilir.  [+8.1]
  5:33  C2  c2.boyun       Ensen yastığa yaslanıyor.  [+8.1]
  5:43  C2  c2.yuz         Alnın gevşek, gözlerinin çevresi yumuşak.  [+8.1]
  5:55  C2  c2.cene        Çenen serbest, dişlerin hafif aralık.  [+8.1]
  6:06  C2  c2.bas         Başının ağırlığını yastık taşıyor.  [+8.1]
  6:18  C2  c2.sicak       Ellerinde ve ayaklarında hafif bir sıcaklık olabilir.  [+9.1]
  6:31  C2  c2.gelmezse    Ağırlık her yerde aynı olmayabilir; bu da olur.  [+8.1]
  6:44  C2  c2.butun       Baştan ayağa bütün bedenin yatağın üstünde.  [+9.5]
  6:57  C4  c4.giris       Ondan bire geri sayacağım. Her sayıda nefesini bırakıyorsun.  [+6.7]
  7:11  C4  c4.uymaz       Nefesin sayılara uymasa ya da sayıyı kaçırsan da olur.  [+11.1]
  7:27  C4  c4.n10         on…  [+7.8]
  7:35  C4  c4.n09         dokuz…  [+7.6]
  7:44  C4  c4.n08         sekiz…  [+7.6]
  7:52  C4  c4.n07         yedi…  [+7.6]
  7:59  C4  c4.n06         altı…  [+7.6]
  8:08  C4  c4.n05         beş…  [+7.8]
  8:16  C4  c4.n04         dört…  [+7.8]
  8:24  C4  c4.n03         üç…  [+7.8]
  8:32  C4  c4.n02         iki…  [+7.6]
  8:41  C4  c4.n01         bir.  [+9.1]
  8:50  C4  c4.bitti       Sayılar burada bitiyor. Kaçını duyduğun önemli değil.  [+9.1]
  9:06  C4  c4.k2          Bugün bitti; dinlenebilirsin.  [+13.1]
  9:22  C3  c3.sahne       Zihninde yağmurlu bir akşam belirebilir.  [+8.1]
  9:34  C3  c3.gelmezse    Görüntü belirmese de, gözlerin açık kalsa da sorun değil.  [+11.5]
  9:50  C3  c3.yer         Belki sıcak bir odadasın. Belki üstü örtülü bir verandadasın.  [+8.1]
 10:06  C3  c3.su          Yağmur istemezsen sessiz bir akşam da olur.  [+11.5]
 10:20  C3  c3.yagmur      Yağmur çatıya usul usul vuruyor.  [+11.5]
 10:35  C3  c3.damla       Oluktan tek tük damlalar düşüyor.  [+8.1]
 10:45  C3  c3.toprak      Havada ıslak toprağın kokusu var.  [+13.5]
 11:02  C3  c3.cam         Yakındaki camda yağmur izleri ağır ağır süzülüyor.  [+8.1]
 11:14  C3  c3.ortu        Üstünde kalın, yumuşak bir örtü var.  [+8.1]
 11:26  C3  c3.agirlik     Örtü, üstünde tatlı bir ağırlıkla duruyor.  [+13.5]
 11:43  C3  c3.sicaklik    Altında kendi sıcaklığın birikiyor.  [+9.1]
 11:55  C3  c3.parmak      Parmak uçların örtünün dokusunu buluyor.  [+9.1]
 12:08  C3  c3.yastik      Yastığın kumaşı serin ve yumuşak.  [+13.5]
 12:24  C3  c3.lamba       Köşede bir lamba sarı, sıcak bir ışık veriyor.  [+11.5]
 12:40  C3  c3.ses2        Yağmurun sesi hiç değişmeden sürüyor.  [+8.1]
 12:51  C3  c3.uzak        Yukarıda yağmurun, yakında kendi nefesinin sesi var.  [+13.5]
 13:09  C3  c3.kisilir     Lambanın ışığı yavaş yavaş kısılıyor.  [+10.5]
 13:23  C3  c3.aydinlik    Çevrende loş, yumuşak bir aydınlık kalıyor.  [+14.5]
 13:41  C3  c3.kal         Yağmuru dinlemekten başka yapacak bir şey yok.  [+10.1]
 13:55  K   k.anahtar3     Bugün bitti.  [+8.7]
 14:04  K   k.nefes        Nefes kendi ritminde gelip gidiyor.  [+12.1]
 14:19  K   k.izin         Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak.  [+13.1]
 14:37  K   k.uyanik       Uyanık kalırsan da olur; uzanıp dinlenmek yeter.  [+10.1]
 14:52  K   k.son          Gece senin.  [+6.7]
 15:00  — dosya biter; müzik kuyruğu başlar (sürenin dışında)
```

### 15 dakika · nes köşesi (toplam 900.0 sn, konuşma 226.4 sn, giriş müziği 4.8 sn)

```
  0:05  A   a.acilis       Günün sesleri geride kalıyor; yatağına yerleşiyorsun.  [+5.3]
  0:15  A   a.durus        Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun.  [+7.3]
  0:27  A   a.ortu         Üşüyorsan örtünü omuzlarına kadar çekmen iyi olur.  [+8.3]
  0:39  A   a.gozler       Gözlerini kapatmak ya da açık tutmak sana kalmış.  [+4.8]
  0:48  A   a.izin         İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [+5.8]
  1:00  A   a.kolay        Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter.  [+6.3]
  1:11  A   a.karar        Ne kadar gevşeyeceğine her an sen karar veriyorsun.  [+5.3]
  1:20  A   a.isler        Yarına kalan işler sabaha kadar bekler.  [+6.3]
  1:30  C1  c1.fark        Önce nefesini olduğu gibi fark ediyorsun.  [+11.7]
  1:45  C1  c1.yer         Nefes en çok nerede belirginse dikkatin orada kalsın.  [+11.7]
  2:01  C1  c1.veris       Alışı zorlamadan verişi biraz uzatmak yeterli.  [+13.7]
  2:18  C1  c1.zorlanirsan Nefes zor gelirse kendi ritmine dön.  [+6.3]
  2:27  C1  c1.gun         Her veriş, günü biraz daha geride bırakıyor.  [+11.7]
  2:43  C1  c1.dudak       Veriş burundan ya da hafif aralık dudaklardan çıkabilir.  [+11.7]
  2:59  C1  c1.birkac      Birkaç nefes boyunca bu ritmi sürdürüyorsun.  [+18.8]
  3:21  C1  c1.k1          Bugün bitti; artık dinlenebilirsin.  [+9.7]
  3:34  C2  c2.cerceve     Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla.  [+4.8]
  3:47  C2  c2.ayak        Önce ayaklarının ağırlığını yatağa veriyorsun.  [+8.3]
  3:59  C2  c2.topuk       Topuklarının yatağa değdiği yeri fark ediyorsun.  [+8.3]
  4:12  C2  c2.bacak       Bacakların da yatağa yaslanıyor.  [+8.3]
  4:23  C2  c2.uyluk       Uylukların ağır ve sıcak olabilir.  [+8.3]
  4:34  C2  c2.bel         Belin ve sırtın bütün ağırlığıyla yatakta.  [+8.3]
  4:45  C2  c2.omurga      Omurgan boydan boya yatağa uzanıyor.  [+9.3]
  4:58  C2  c2.el          Ellerin olduğu yerde dinleniyor.  [+8.3]
  5:09  C2  c2.kol         Kollarının ağırlığını da yatağa veriyorsun.  [+8.3]
  5:21  C2  c2.omuz        Omuzların yatağa doğru inebilir.  [+8.3]
  5:32  C2  c2.boyun       Ensen yastığa yaslanıyor.  [+8.3]
  5:42  C2  c2.yuz         Alnın gevşek, gözlerinin çevresi yumuşak.  [+8.3]
  5:54  C2  c2.cene        Çenen serbest, dişlerin hafif aralık.  [+8.3]
  6:06  C2  c2.bas         Başının ağırlığını yastık taşıyor.  [+8.3]
  6:17  C2  c2.sicak       Ellerinde ve ayaklarında hafif bir sıcaklık olabilir.  [+9.3]
  6:30  C2  c2.gelmezse    Ağırlık her yerde aynı olmayabilir; bu da olur.  [+8.3]
  6:43  C2  c2.butun       Baştan ayağa bütün bedenin yatağın üstünde.  [+9.7]
  6:56  C4  c4.giris       Ondan bire geri sayacağım. Her sayıda nefesini bırakıyorsun.  [+6.8]
  7:10  C4  c4.uymaz       Nefesin sayılara uymasa ya da sayıyı kaçırsan da olur.  [+11.3]
  7:26  C4  c4.n10         on…  [+7.8]
  7:34  C4  c4.n09         dokuz…  [+7.6]
  7:42  C4  c4.n08         sekiz…  [+7.6]
  7:51  C4  c4.n07         yedi…  [+7.6]
  7:59  C4  c4.n06         altı…  [+7.6]
  8:07  C4  c4.n05         beş…  [+7.8]
  8:15  C4  c4.n04         dört…  [+7.8]
  8:23  C4  c4.n03         üç…  [+7.8]
  8:32  C4  c4.n02         iki…  [+7.6]
  8:40  C4  c4.n01         bir.  [+9.3]
  8:49  C4  c4.bitti       Sayılar burada bitiyor. Kaçını duyduğun önemli değil.  [+9.3]
  9:05  C4  c4.k2          Bugün bitti; dinlenebilirsin.  [+13.3]
  9:22  C3  c3.sahne       Zihninde yağmurlu bir akşam belirebilir.  [+8.3]
  9:33  C3  c3.gelmezse    Görüntü belirmese de, gözlerin açık kalsa da sorun değil.  [+11.7]
  9:49  C3  c3.yer         Belki sıcak bir odadasın. Belki üstü örtülü bir verandadasın.  [+8.3]
 10:05  C3  c3.su          Yağmur istemezsen sessiz bir akşam da olur.  [+11.7]
 10:20  C3  c3.yagmur      Yağmur çatıya usul usul vuruyor.  [+11.7]
 10:34  C3  c3.damla       Oluktan tek tük damlalar düşüyor.  [+8.3]
 10:45  C3  c3.toprak      Havada ıslak toprağın kokusu var.  [+13.7]
 11:01  C3  c3.cam         Yakındaki camda yağmur izleri ağır ağır süzülüyor.  [+8.3]
 11:14  C3  c3.ortu        Üstünde kalın, yumuşak bir örtü var.  [+8.3]
 11:25  C3  c3.agirlik     Örtü, üstünde tatlı bir ağırlıkla duruyor.  [+13.7]
 11:42  C3  c3.sicaklik    Altında kendi sıcaklığın birikiyor.  [+9.3]
 11:55  C3  c3.parmak      Parmak uçların örtünün dokusunu buluyor.  [+9.3]
 12:07  C3  c3.yastik      Yastığın kumaşı serin ve yumuşak.  [+13.7]
 12:24  C3  c3.lamba       Köşede bir lamba sarı, sıcak bir ışık veriyor.  [+11.7]
 12:39  C3  c3.ses2        Yağmurun sesi hiç değişmeden sürüyor.  [+8.3]
 12:50  C3  c3.uzak        Yukarıda yağmurun, yakında kendi nefesinin sesi var.  [+13.7]
 13:09  C3  c3.kisilir     Lambanın ışığı yavaş yavaş kısılıyor.  [+10.7]
 13:23  C3  c3.aydinlik    Çevrende loş, yumuşak bir aydınlık kalıyor.  [+14.7]
 13:41  C3  c3.kal         Yağmuru dinlemekten başka yapacak bir şey yok.  [+10.3]
 13:54  K   k.anahtar3     Bugün bitti.  [+8.8]
 14:04  K   k.nefes        Nefes kendi ritminde gelip gidiyor.  [+12.3]
 14:19  K   k.izin         Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak.  [+13.3]
 14:37  K   k.uyanik       Uyanık kalırsan da olur; uzanıp dinlenmek yeter.  [+10.3]
 14:52  K   k.son          Gece senin.  [+6.8]
 15:00  — dosya biter; müzik kuyruğu başlar (sürenin dışında)
```

## 4. Ekler (ayrı dosyalar)

**"Uykuya geç": aynı dosyada uyku izninin başına atlama** — PLAN.v2 §B.5 ve PLAN.v3 §D.3: o anki cümle biter, aynı dosyada K'nin başına 2 sn'lik geçişle atlanır. Uyku dersinde imgeyi bırakma ön klibi yoktur: imge açıkken uykuya geçmek dersin amacıdır; dışa dönüş ve şafak yok. Klipler denetim içindir: K'nin zorunlu klipleri.

```
‖ Bugün bitti. [6–10]
‖ Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak. [10–15]
‖ Uyanık kalırsan da olur; uzanıp dinlenmek yeter. [7–12]
‖ Gece senin. [5–8]
```

**Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş (uyku dersi biçimi)** — PLAN.v2 §B.5: X onaysız, 2 sn'de söner; ekran metni ortak. Sesli dönüş yalnız ekrandaki düğmeye dokununca çalar (kişinin kendi seçimi); uyku dersinde gece odayı hatırlatır ve kalkış sırasını söyler.

```
‖ Ders burada bitti; şu an yatağındasın. [4–5]
‖ Gözlerini açıp çevrene bakmak iyi olur; acele yok. [5–6]
‖ Kalkacaksan önce yana dön, otur ve bekle; başın dönerse biraz daha otur. [2–3]
```

**İlk ders cümlesi (kişinin ilk yoga dersi Ders 3 ise; ayrı giriş dosyası)** — PLAN.v2 §A.1, PLAN.v3 §D.3: dersin giriş müziği + cümle, sonra dersin başına 2 sn geçiş (≈ 7 sn)

```
‖ Bugün yalnızca tanışıyoruz; zorlanırsan dersi bitirmen yeterli. [2–2]
```

"Uykuya geç" ve Durdur dönüşünün süreleri üç hızda ve iki duraklama profilinde denetlendi (pilot `quick_and_stop`; "Uykuya geç" 25–75 sn VARSAYIM, Durdur dönüşü 20–30 sn).

## 5. Ekran metinleri (seste yok)

- Kart sözü: Günü bırakıp uykuya yavaşça geçmek için.
- Açılış ekranı: İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin. / Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle. Bu dersten hemen sonra araç kullanma. / Gece kalkman gerekirse önce yana dön, otur, sonra kalk.
- Hazırlık kartı: Işığı kapat ya da iyice kıs · Telefonu, ekranı aşağıya bakacak biçimde yanına bırak · Sesi, konuşmayı zorlanmadan duyacağın en düşük düzeye getir · Uyurken kulak içi kulaklık yerine hoparlör daha iyi · Müzik kuyruğu: 0 / 5 / 10 / 20 dakika (varsayılan 10)
- Ertesi sabah sorusu: Dün gece uykuya dalmak ne kadar kolaydı? (1–10)
- Kaynak kartı cümlesi: Neye dayanıyor: Uyumakta zorlanan 41 kişilik bir çalışmada, ilgi çekici bir imgeyle dikkatini dağıtmaları söylenenler, talimat almayanlara göre daha kısa sürede uykuya daldıklarını bildirdi. Yatmadan önce yavaş nefes ve müzik dinleme çalışmalarında kişilerin kendi uyku değerlendirmesi iyileşti; cihazla ölçülen uykuda belirgin bir fark görülmedi. Tek bir yoga nidra kaydı sessizce uzanmaya göre uykuya dalma süresini değiştirmedi. Bu ders uyutma vaadi taşımaz.
- 5 dk sürüm satırı: Beş dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık; bu sürüm aynı sırayı daha az ayrıntıyla izler.

## 6. Bilimsel dayanak (yalnız doğrulanmış dosyalardan; yeni PMID yok)

| Kaynak | PMID | DOI | Dosya | Derste neye dayanak |
|---|---|---|---|---|
| Harvey & Payne 2002 · uyku öncesi imgeleme | 11863237 | [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2) | sakin §5 | Kontrollü klinik çalışma, uykusuzluk yaşayan 41 kişi: ilgi çekici bir imgeyle dikkat dağıtma talimatı, talimatsız gruba göre daha kısa uykuya dalma süresi ve daha az uyku öncesi zihinsel etkinlik bildirimiyle birlikte gitti; ölçüm yöntemi (öznel/objektif) özette yok. Dersin çekirdeği (C3) buna dayanır. |
| Eide, Hernes & Grønli 2026 · yatmadan önce yavaş nefes | 41886931 | [10.1016/j.smrv.2026.102284](https://doi.org/10.1016/j.smrv.2026.102284) | sakin §4 | Sistematik derleme, 9 çalışma, n=457, dakikada <= 10 nefes: öznel uyku süresi ve kalitesi iyileşti; aktigrafi ve PSG ile objektif sonuçlar belirsiz. C1 (yavaş, uzun veriş) ve C4 (8 sn'lik sayma döngüsü) buna dayanır. |
| Van Diest 2014 · kısa alış, uzun veriş | 25156003 | [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x) | sakin §4 | n=30: kısa alış / uzun veriş (oran 0,42), tersine göre daha fazla gevşeme bildirimiyle ilişkiliydi. |
| Toussaint 2021 · derin nefes talimatı | 34306146 | [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040) | güvenlik §2 | Randomize, n=60: derin nefes grubunda önce ani bir fizyolojik uyarılma artışı görüldü. Bu yüzden derste "derin nefes al" yok; önce doğal nefes fark edilir. |
| Jespersen 2022 (Cochrane) · müzik ve uyku | 36000763 | [10.1002/14651858.CD010459.pub3](https://doi.org/10.1002/14651858.CD010459.pub3) | sakin §6 | 13 RKÇ, n=1.007: kayıtlı müzik öznel uyku kalitesinde fark gösterdi (PSQI −2,79, orta güven); objektif ölçümlerde iyileşme görülmedi. Müzik kuyruğunun (0/5/10/20 dk) dayanağı; "uyutur" denmez. |
| Sharpe 2023 · tek 30 dk yoga nidra kaydı (karşı kanıt) | 36731199 | [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169) | sakin §1 | Pilot RKÇ, n=22: 30 dk'lık kayıt sessiz uzanmaya göre uykuya dalma süresini değiştirmedi. Bu yüzden hiçbir sürüm için "uyutur" denmez. |
| Knowlton & Larkin 2006 · azalan ses | 16941239 | [10.1007/s10484-006-9014-6](https://doi.org/10.1007/s10484-006-9014-6) | teslim §1.2 | RKÇ, n=48: tonu, yüksekliği ve hızı seans boyunca azalan seste EMG yalnız bu grupta düştü. Metin evreden evreye kısalır, boşluklar uzar, ses uyku izninden sonra alçalır. |
| Luu 2024 · travma-duyarlı yoga nidra, 10 bileşen | 39690521 | [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021) | sakin, güvenlik | Öneri makalesi: özerklik ve onay, uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş ya da uyku izni. Açılış cümlesi, atlama izni, imgede seçenek ve uyku izni buradan. |
| Cordi, Schlarb & Rasch 2014 · sesli telkin ve uyku | 24882909 | [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778) | güvenlik §3, sakin §6 | n=70 genç kadın, öğle uykusu: "daha derin uyu" telkini yavaş dalga uykusunu kontrole göre artırdı; etki telkine yatkın kişilerde görüldü. Bu yüzden derste uyku vaadi ve "uyuyacaksın" dili yok. |
| Wang 2021 · kulaklıkla uyumak | 33562129 | [10.3390/ijerph18041560](https://doi.org/10.3390/ijerph18041560) | güvenlik §9 | Küme RKÇ, 830 öğrenci: sağlık eğitimi kulaklıkla uyumayı azalttı; çalışma bunu işitme açısından riskli davranış olarak ele aldı. Hazırlık kartındaki hoparlör önerisi bir tasarım çıkarımıdır. |
| Bioulac 2017 · uykululuk ve trafik kazası | 28958002 | [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134) | güvenlik §8 | SD/MA, 17 çalışma: direksiyonda uykulu olmak kaza riskiyle ilişkili (OR 2,51). Açılış ekranındaki araç satırları. |
| Radin 2025 · gerçek kullanım süresi | 39808431 | [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435) | benlik §1 | RKÇ, n=1.458: meditasyona özgü kullanım günde ortalama 3,36 dk; kullanıcıların %69,7'si günde 5 dk'nın altında. Kısa sürüm bu yüzden bütün bir ders olarak kurulur; etkisi ayrıca sınanmadı. |
| Tran 2021 · ayağa kalkınca kan basıncı düşüşü | 34260686 | [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090) | güvenlik §7 | SD/MA: 65 yaş üstünde ayağa kalkınca ilk anda görülen düşüş, sürekli ölçümle %29. Durdur dönüşündeki "yana dön, otur, bekle" sırası. |

Sağlık iddiası yok: hiçbir cümle "uyutur", "uykusuzluğa iyi gelir" demez; kart karşı kanıtı da yazar (Sharpe 2023).

## 7. Köşeler ve denetim özeti

- **hoc**: 4.68 hece/sn, hi duraklama, × 1.000 — Nefona Hoca önizleme eklemleme hızı 4,68 hece/sn (render/sel/hoc) + yüksek (Hakan v2) duraklama profili. VARSAYIM; en yavaş köşe
- **hoc-lo**: 4.68 hece/sn, lo duraklama, × 1.000 — aynı hız, düşük duraklama profili. VARSAYIM; Ders 2'nin ölçülmüş hoc kliplerine en yakın model (Ders 1 raporu: ölçülen/model 0,990)
- **nes**: 5.60 hece/sn, hi duraklama, × 1.109 — Neslihan'ın Ders 2'de ölçülmüş süreleri: ölçülen/model(5,6 yüksek) = 1,109 (110 ortak klip; v3/calc/measure.py). VARSAYIM: Ders 3 metnine aynı oranla taşındı

Ayrıntı ve bütün planlar `timing.txt`'de (`python3 timing_d3.py`).

## 8. PLAN'dan sapmalar ve açık sorular (inceleyicilere)

- Anahtar cümle: PLAN.v2 §A.2.1 yönü "Bugün bitti; şimdi dinlenebilirsin." → "Bugün bitti." → "Dinlenme zamanı…". Üçüncüsü yüklemsiz, üç noktalı ve ikinciden uzundu; "şimdi" dolgu listesinde. Yerine: "Bugün bitti; artık dinlenebilirsin." → "Bugün bitti; dinlenebilirsin." → "Bugün bitti."
- Benzersiz açılış "-(y)abil-"siz yazıldı ("…yatağına yerleşiyorsun"): 5 dakikada a.izin ile aynı 60 sn'ye düşer.
- Beden dolaşımı ayaklardan başa (PLAN.v2 §A.2.2 satır 3); Ders 2'nin "sağ → sol → arka → ön → bütün" sırası değil. PLAN.v2 §C.1 ve §E.6 #5 "her derste aynı sıra" der; iki madde çelişiyor. Seçim: derse özgü satır (A.2.2); sağ ve sol karışmıyor. Usta hoca kararı.
- Açılış sırası pilot Ders 2 gibi: dersin kendi açılışı önce, ortak açılış cümlesi göz seçiminden sonra (PLAN.v2 §A.1, T33). §A.2.1'deki "ortak cümleden hemen sonra" sırası uygulanmadı.
- <= 15 dk'da duyurulu sessiz pencere yok (her boşluk <= 20 sn). Uyku dersinde pencere dönüşü ("Yeniden seninleyim") uyandırabilir; 16–30 dk'daki pencereler için dönüş cümlesinin biçimi usta hocaya soruldu (iskelet30.md).
- Durdur (X) sonrası isteğe bağlı sesli dönüş uyku dersinde de var (kişi düğmeye kendi dokunur); metni gece için yazıldı ("Ders burada bitti; şu an yatağındasın." …).
- "sesim yavaşça kısılacak" sözünü karışım tutar: k.uyanik −4,5 dB, k.son −6 dB (VARSAYIM). Konuşma − yatak >= 15 dB korunmalı; ölçülmedi.
- Metin bütçesi: 15 dk tam metin 975 hece; sure.md §4.1 modeli ≈ 1.180 (−%17). Konuşma payı %25–27 (uyku dersi modeli ≈ %30). Seyreklik bilinçli (azalan anlatım), ama sessizlikler 15. dakikada pref→max yolunun %37–42'sine esniyor.
- Varış 15 dk'da 1:30 (çapa 1:15), C1 2:04 (çapa 1:45); C3 4:32 (çapa 5:00). C3 tek dokulu blok; 5:00'ı aşarsa dikkat eğrisi denetimi (<= 300 sn) kırılır.

