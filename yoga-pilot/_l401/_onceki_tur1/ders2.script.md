# Ders 2 · Derin Dinlenme (Yoga Nidra) · pilot metni

Sürüm: pilot-1 (2026-09-28). Bu dosya `ders2_kaynak.py`den üretilir (tek kaynak); aynı kaynaktan `ders2.lesson.json` çıkar. Zamanlama denetimi: `timing.py` → `timing.out.txt`. Depodaki (`/home/user/eyes`) hiçbir dosyaya dokunulmadı.

**Durum, açıkça.** Metin tamam ve zamanlaması denetlendi: 5–30 dakikanın her dakikası, üç eklemleme hızı ve her hızda iki duraklama profiliyle kuruldu, 78 vakanın 78'i geçti (§2.5). Henüz hiçbir cümle seslendirilmedi. Klip süreleri ölçüme dayanan tahminlerdir (VARSAYIM). Üretimden sonra planlayıcı gerçek `sec` değerleriyle yeniden çalışacak. Türkçe editör ve usta hoca incelemesinin ilk turu bu belgede yapıldı. Anadili Türkçe bir insan editörün ve yoga nidra eğitimi almış bir hocanın onayı ise henüz yok (CRITIQUE #22). Bu yüzden ders "bitti" sayılmaz.

## 0. Tek bakışta

| | |
|---|---|
| Söz (kart) | Uyanık kalarak derin bir dinlenme. |
| Derse özgü açılış cümlesi | "Bu dakikalarda yapacak hiçbir işin yok; yalnızca dinlenmek var." |
| Ortak güvenlik cümlesi | "İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin." Otuz dakikalık sürümlerde ortada bir kez daha (burada 20 dakika ve üstünde): "Hatırlatayım: istediğin an gözlerini açabilir ya da durabilirsin." |
| Anahtar cümle, 3 kez, giderek kısa | 1) "Bedenin dinleniyor; sen uyanıksın ve farkındasın." (17 hece) · 2) "Beden dinleniyor; sen uyanıksın." (11) · 3) "Dinleniyorsun… ve uyanıksın." (10) |
| Tek imge yayı | Kıyı ya da orman (dinleyici seçer; imge gelmezse nefeste kalır): patika → iniş → varış (ses, koku, güneş, rüzgâr) → dinlenme yeri (ılık taş, ışık) → sessiz pencere → aynı patikadan dönüş → görüntü solar, zemin |
| Niyet (sankalpa) | Başta ve sonda. Hazır cümle: "Dinlenmeye izin veriyorum." (olumlama değil, izin cümlesi) |
| Beden dolaşımı | sağ → sol → arka → ön → bütün, her sürümde bu sırada (en kısada 16 nokta, en uzunda 87 nokta + 5 noktalık temas turu) |
| Zıtlık çiftleri | ağırlık / hafiflik, sıcaklık / serinlik (hıza göre 15–16. dakikadan itibaren) |
| Sessiz pencereler | en çok 90 sn; önce duyurulur, sonra karşılanır: imge (10. dakikadan itibaren), tanıklık (20–22. dk'dan), içten sayma (22–24. dk'dan) |
| Kapanış | nefes → parmaklar → gerinme → gözler → oda → yana dön → otur → bekle → "Buradasın; uyanık ve dinlenmiş." |
| Zamanlama | **78/78 vaka geçti** (5,2 / 5,6 / 6,6 hece/sn × 5..30 dk; her vaka iki duraklama profilinde) |
| Metin envanteri | 198 klip kimliği (2009 hece, 811 sözcük); yinelenenler tek sayılınca 173 benzersiz söz (**1918 hece, 769 sözcük**); TTS'e 109 istek (19 taşıyıcı + 90 cümle klibi), 5691 karakter |
| 5 dakika | A.kisa → N1 → C1 → C2 → BR.K2 → N2 → K.kisa |
| 30 dakika | A.uzun → N1 → C1 → C2 → BR.K2 → C3 → BR.orta → C4 → C5 → N2 → K.uzun |

## 1. Hocanın kurgusu

### 1.1 Akış, evreler ve ses, müzik ve görüntü uyumu

| Evre | Bloklar | Ses (PLAN D.1–D.2; Knowlton 2006 yönünde) | Müzik (yatak; konuşmada kısık) | Görsel (ufuk çizgisi formu) |
|---|---|---|---|---|
| Varış | A (kısa/uzun) | konuşmaya yakın hız ve yükseklik | Varış yatağı; ders 3 sn'de açılır | en aydınlık (yine koyu) |
| Derinleşme | N1, C1 | biraz daha yavaş ve alçak (−1,5 dB) | `c1.cerceve`de 8 sn çapraz geçişle Derin yatağına | daha loş |
| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | en yavaş, en yumuşak (−3 dB) | kısık; yalnız duyurulan >= 20 sn pencerelerde en çok +6 dB kabarır | en loş; pencerede biraz kararır ve yavaşlar, bitmeden 3 sn önce aydınlanır; sayılarda tek yumuşak nabız |
| Kapanış | K (kısa/uzun) | hız ve yükseklik yeniden konuşma düzeyine | `k.donus`ta Kapanış yatağı; `k.goz`te sıcak "şafak" akoru (parlaklık, ses yüksekliği değil); son 2 sn söner | 60–90 sn'lik şafak: form ve zemin ısınır, aydınlanır |

Konuşma sırasında yatak kısık kalır (≈ −33 LUFS); yalnız duyurulan ve en az 20 sn süren pencerelerde ≈ −27 LUFS'a çıkar ve karşılama cümlesinden 3 sn önce iner. Böylece müzik her cümlede inip kalkmaz (CRITIQUE #7, #8; değerler VARSAYIM). Doğa katmanı için öneri: PLAN A.2'deki "uzak, sürekli akarsu" yerine uzak su ve hafif rüzgâr. Bu doku hem kıyıya hem ormana uyar ve imgede seçilen yeri dayatmaz (VARSAYIM; karar üretim ekibinin).

### 1.2 Anahtar cümle (C.4; CRITIQUE #21)

Dersin fikri yoga nidranın kendisidir: beden dinlenir, farkındalık uyanık kalır. Anahtar cümle üç kez geçer ve her seferinde biraz daha kısa ve yumuşaktır:

1. `c1.k1`, beden dolaşımının sonunda: **"Bedenin dinleniyor; sen uyanıksın ve farkındasın."** Beden ile farkındalık henüz ayrı ayrı adlandırılır.
2. `br.k2`, nefes bloğunun hemen ardından, derin evrenin başında: **"Beden dinleniyor; sen uyanıksın."**
3. `k.anahtar3`, dönüşün eşiğinde: **"Dinleniyorsun… ve uyanıksın."** Artık ikisi tek bir ağızdan söylenir. Kapanışın son cümlesi bu yayı kapatır: "Buradasın; uyanık ve dinlenmiş."

Bu yerleşim her sürede üç geçişi korur (5,6 hece/sn, yüksek profil): 5 dakikada 2:12, 3:15 ve 3:40'da; 30 dakikada 8:38, 13:25 ve 27:49'da. Kısa sürümde ikinci ve üçüncü geçiş, aralarındaki niyet tekrarını bir nakarat gibi çevreler; uzun sürümde anahtar cümle dersin başına, ortasına ve sonuna yayılır.

### 1.3 Tek imge yayı (C.4; E.6 #8)

İmge yalnız C4'tedir. Dinleyici **kıyı ya da orman** seçer. Görüntü gelmezse nefeste kalır. Kıyıda suya girilmez, derinlik yoktur; ormanda karanlık ya da kapalı alan yoktur (güvenlik §11.B-10). Yay: patika → ağır ağır iniş → gelip giden ses (dalgalar ya da yapraklar) → koku → güneşin ılıklığı → rüzgâr → sana iyi gelen yer → ılık taş, suyun ya da yaprakların üzerindeki ışık → sessiz pencere → aynı patikadan dönüş → görüntü solar, altındaki zemin. C3'teki "sıcak bir fincan" ve "açık bir pencere" imge değildir, duyu çağrışımıdır: yer ya da yolculuk kurmazlar. C5'teki "dalgalar ya da yapraklar gibi" imgeye bir geri çağrıdır, yeni imge değildir. Son 60 sn'de yeni imge yoktur (her vakada denetlendi).

"Gelip gitmek" dersin sözel motifidir. Kapanıştan önce üç yerde geçer: nefes ("Nefes kendiliğinden geliyor, kendiliğinden gidiyor"), imge ("gelip giden bir ses") ve tanıklık ("Düşünceler de gelip gidiyor").

### 1.4 30 dakikalık dikkat eğrisi (CRITIQUE #21; her 3–5 dakikada doku, teknik ya da sessizlik değişir)

Plan: 30 dk, 5,6 hece/sn, yüksek duraklama profili. En uzun doku koşusu 300 sn'yi geçmez; bu, 20 dakika ve üstündeki her vakada denetlendi.

| başlangıç | süre | doku / teknik | ne oluyor |
|---|---|---|---|
| 0:05 | 1:52 | `varis` | yerleşme, izin, duruş, gözler |
| 1:57 | 1:02 | `niyet` | niyet (sankalpa) seçimi ve üç kez içinden |
| 3:00 | 2:58 | `dolasim-uzuv` | beden dolaşımı: sağ ve sol (el → kol → gövde yanı → bacak → ayak) |
| 5:58 | 1:24 | `dolasim-govde` | beden dolaşımı: sırt, sonra yüz ve gövdenin önü |
| 7:21 | 0:38 | `dolasim-butun` | bütünler: bacaklar, kollar, bütün beden |
| 7:59 | 0:39 | `temas` | zemine değen noktalar (genişletme) |
| 8:38 | 0:12 | `anahtar` | anahtar cümle |
| 8:50 | 1:11 | `nefes` | doğal nefesi izlemek; bırakma ve bağışlama |
| 10:01 | 1:19 | `geri-sayma` | sesli geri sayma (ondan ya da beşten bire) |
| 11:20 | 0:10 | `sessiz-sayma` | kendi içinde sayma turu |
| 11:30 | 1:15 | `sessizlik` | duyurulmuş sessiz pencere (müzik kabarır) |
| 12:44 | 0:40 | `nefes` | doğal nefesi izlemek; bırakma ve bağışlama |
| 13:25 | 0:13 | `anahtar` | anahtar cümle |
| 13:38 | 1:55 | `zitlik-agir` | zıtlık: ağırlık / hafiflik |
| 15:33 | 1:37 | `zitlik-sicak` | zıtlık: sıcaklık / serinlik |
| 17:10 | 0:17 | `kapi` | ortada çıkış kapısı (güvenlik) |
| 17:28 | 4:26 | `imge` | imge yayı: kıyı ya da orman, patika, iniş, duyular |
| 21:54 | 1:07 | `sessizlik` | duyurulmuş sessiz pencere (müzik kabarır) |
| 23:01 | 0:56 | `imge-donus` | imgeden dönüş: aynı patika, görüntü solar, zemin |
| 23:57 | 1:39 | `taniklik` | tanıklık: sesler, düşünceler, fark eden |
| 25:36 | 1:15 | `sessizlik` | duyurulmuş sessiz pencere (müzik kabarır) |
| 26:50 | 0:25 | `taniklik` | tanıklık: sesler, düşünceler, fark eden |
| 27:16 | 0:34 | `niyet-son` | niyetin tekrarı |
| 27:49 | 0:08 | `anahtar` | anahtar cümle |
| 27:58 | 2:02 | `kapanis` | dışa dönüş ritüeli (nefes → parmaklar → … → otur → bekle) |

### 1.5 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)

- **Yapı.** Travma-duyarlı yoga nidranın 10 bileşeni bu dersin iskeletidir: özerklik ve onay, uygun uzunluk ve hazırlık, kendi seçilen niyet, esnek beden dolaşımı ve nefes, bedende hissedilen zıtlık çiftleri, özenli imgeleme, yeterli yerleşme ve dışa dönüş (Luu 2024, PMID 39690521, DOI 10.17761/2024-D-24-00021).
- **Kısa sürüm bütündür.** 11 ve 30 dakikalık yoga nidra doğrudan karşılaştırıldığında ikisi de küçük etki gösterdi. 30 dakikalık sürüm yalnız "farkında davranma" alt boyutunda farklıydı ve güven aralığı sıfıra çok yakındı (Moszeik 2025, PMID 40373021, DOI 10.1002/smi.70049). Kronik ağrılı yetişkinlerde yapılan yarı deneysel bir çalışmada (n=23) tek 45 dakikalık yoga nidra, beden taramasına göre hemen sonrasında iyi oluşta daha fazla artışla birlikte gitti (Gibbs 2026, PMID 41743305, DOI 10.4103/ijoy.ijoy_2_25). Bu iki bulgudan tasarım çıkarımı: kısa sürüm bir beden taramasına indirgenmez, iskeleti korur (niyet → dolaşım → nefes → niyet → dönüş). Hiçbir sürüm sonuç vaat etmez.
- **Nefes.** Önce değiştirilmeden izlenir; "derin nefes al" komutu yoktur. Derin nefes talimatı bir çalışmada önce uyarılmayı artırdı (Toussaint 2021, PMID 34306146, DOI 10.1155/2021/5924040). Nefesin derinleşmesi yalnız dönüşte, uyanmaya eşlik etmek için ve izin diliyle geçer: "Nefesin biraz derinleşebilir." Bu bir tasarım çıkarımıdır.
- **Hız ve sessizlik.** Yavaşlık sözcük uzatarak değil, cümleler arası sessizlikle verilir. Aşırı yavaş ve çok duraklamalı konuşma en az doğal bulundu (Shuminsky & Davidow 2026, PMID 42757902, DOI 10.1044/2026_JSLHR-25-00691). Seans boyunca azalan hız, yükseklik ve ton yalnız o sesle çalışan grupta EMG düşüşüyle birlikte gitti (Knowlton & Larkin 2006, PMID 16941239, DOI 10.1007/s10484-006-9014-6). 2 dakikalık sessizlik aralığında kalp hızı, kan basıncı ve ventilasyon başlangıcın altına indi (Bernardi 2006, PMID 16199412, DOI 10.1136/hrt.2005.064600). Öte yandan acemilerde beden odaklı rehberli bir program, rehbersiz sessiz pratiğe göre daha büyük değişimle birlikte gitti; programda koçluk da vardı (Lieutaud & Bourhis 2026, PMID 42466037, DOI 10.3389/fpsyg.2026.1833806). Tasarım çıkarımı: sessizlik değerli ama rehbersiz kalmamalı. Bu yüzden pencereler en çok 90 sn'dir ve duyurulur.
- **Niyet cümlesi.** "Ben harikayım" türü tekrarlanan olumlu cümleler, öz-saygısı düşük kişilerde daha kötü hissettirdi (Wood 2009, PMID 19493324, DOI 10.1111/j.1467-9280.2009.02370.x). Hazır niyet bu yüzden bir yargı değil, bir izin cümlesidir: "Dinlenmeye izin veriyorum."
- **Huzursuzluk olağandır.** Kayıttan dinletilen tek seans gevşemede 30 kişinin 5'inde seans sırasında kaygı arttı (Braith 1988, PMID 3069875, DOI 10.1016/0005-7916(88)90040-7). Meditasyonla ilişkili istenmeyen etkiler seyrek değil (Farias 2020, PMID 32820538, DOI 10.1111/acps.13225). Bu yüzden ders çıkış kapısıyla açılır, "Gevşemek bugün kolay gelmeyebilir; bu da olur." der ve her zıtlık ile imgede bir bırakma yolu sunar.
- **Dönüş.** Hipnozdan çıkarma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017, PMID 28300508, DOI 10.1080/00029157.2016.1203281). Ayağa kalkınca ilk anda görülen kan basıncı düşüşü, sürekli ölçümle 65 yaş üstünde havuzlanmış olarak %29 (Tran 2021, PMID 34260686, DOI 10.1093/ageing/afab090). Kapanış bu yüzden yana dönme, ellerden destek alarak oturma ve bekleme adımlarını içerir. Bu adımlar kısaltılmaz; sessizlikleri sıkıştırılmaz (§2.3).
- **"Hipnoz" vaadi yok.** Kayıttan telkin yalnız telkine yatkın kişilerde etki gösterdi (Cordi 2014, PMID 24882909, DOI 10.5665/sleep.3778). Metin derinleşmeye izin verir ama zorlamaz. Sahibin "hipnoz olmalıyım" isteği, içine çeken ve kesintisiz bir deneyim olarak karşılanır.
- **Göz kökeni.** Gözler hiçbir yerde zorlanmaz: açık kalmaları serbesttir ("bakışın bir noktada dinlenebilir"). Dolaşımda yalnız "göz kapakları" ve "gözlerin çevresi" geçer; kaş ortası ya da gözün arkasındaki boşluk yoktur. Göze bastırma ve avuçlama yoktur. Dönüşte gözler "ışığa alışa alışa" açılır.

## 2. Süre modeli, planlayıcı ve eşikler

### 2.1 Bu oturumdaki ölçümler (`../hiz/*.mp3`; 76 heceli Türkçe meditasyon paragrafı)

| Dosya | Eklemleme (hece/sn, duraklamalar hariç) | Paragraf içi duraklamalar |
|---|---|---|
| Neslihan v2, düz | 6,61 (verilen) · 6,56 (bu analiz) | 3 durak, toplam 0,61 sn; cümle sonu 0,17–0,22 sn |
| Hakan v2, düz | 6,52 (verilen) · 6,43 | 8 durak, 5,28 sn; cümle sonu 0,72–0,87, virgül 0,28–0,38 sn |
| Neslihan v2, üç nokta | 6,50 | 8 durak, 2,93 sn; üç nokta 0,32–0,42 sn |
| Hakan v2, üç nokta | 6,48 | 10 durak, 9,73 sn; üç nokta 1,39–1,53 sn |
| Neslihan v4, düz | 5,63 (verilen) · 5,58 | 6 durak, 1,97 sn |

Sonuç: TTS içindeki duraklamalar sese göre dört kat değişiyor. Bu yüzden (1) zamanlama iki duraklama profiliyle hesaplandı, (2) hızı duyulması gereken bütün diziler (beden noktaları, sayılar, ağır/hafif listeleri) taşıyıcı cümle içinde üretilip kesilen ve aralarındaki sessizliği uygulamanın koyduğu mikro-kliplerdir (CRITIQUE #12). Böylece dolaşımın temposu iki seste de aynıdır.

### 2.2 Model (VARSAYIM)

`klip süresi = hece ÷ eklemleme + klip içi noktalama duraklamaları + uç payı`

- Eklemleme hızları: 5,2 (REST speed≈0,8; tahmin), 5,6 (v4, ölçüm), 6,6 (v2 varsayılan, ölçüm).
- Duraklama profilleri (sn): **düşük** = Neslihan v2 en kısa gözlenen (cümle 0,17 · virgül 0,05 · iki nokta ya da noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2'de (speed 0,8) duraklamalar ×1,25 alındı.
- Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2), mikro-klip 0,15 sn.
- Hece sayısı kodla sayılır: Türkçe ünlüler a e ı i o ö u ü â î û.

### 2.3 Planlayıcı (PLAN §B.3'ün kesin hali; `lib/yoga.js` bunu aynen uygular)

1. **Sabit kapaklar.** Hedef <= 12 dk ise Varış ve Kapanış'ın kısa metni, değilse uzun metni çalar. Kapaklar her zaman eksiksizdir ve **sessizlikleri sıkıştırılmaz** (min = pref). Açılış acele etmez; dönüşteki "yana dön, otur, bekle" adımlarının süresi eylem süresi + 2 sn'nin altına inmez. Kapak sessizlikleri uzun hedeflerde max'a kadar uzayabilir.
2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2), zorunlu klipleriyle, köprü (`br.k2`, her zaman N2'den hemen önce) ve süresi dolan zorunlu klipler (`br.orta`, >= 20 dk) tabanı oluşturur. Taban en kısa haliyle de sığmazsa, yalnız acil durum yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu ders için denetim her sürede bütün P1 blokları ister, düşme hiçbir vakada olmadı.
3. **Artım listesi.** Tek bir sıralı listedir: P2..P5 blokların girişi (`entryRank`: C4 300, C3 500, C5 700; öncelik sırası korunur) araya giren isteğe bağlı klip "dalgalarıyla" (`fillRank` 110–720) birlikte ilerler. Genişletme klipleri (`fillRank` >= 1000) bütün isteğe bağlılardan sonra gelir. Her artım, bütün sessizlikler pref değerindeyken hedefe sığıyorsa eklenir. Mevcut içerik sessizlikler max'ta bile hedefe yetmiyorsa, artım en kısa haliyle sığdığı sürece yine eklenir. Sığmayan ilk artımda durulur (önek kuralı). Aynı `fillGroup`taki klipler birlikte girer; sağ ve sol aynı grupta olduğu için dolaşım hep simetrik kalır. Kural belirlenimcidir: aynı hedef ve aynı sesle her seferinde aynı plan çıkar (CRITIQUE #30).
4. **Sessizlik.** Kalan süre min..pref aralığındaysa bütün sessizlikler aynı oranla min'den pref'e, pref..max aralığındaysa pref'ten max'a esner. Toplam hedefe tam eşittir. Kalan süre max toplamını aşarsa bu bir içerik hatasıdır: sessizlik sınırı aşılarak kapatılmaz (CRITIQUE #3). Konuşma klipleri asla hızlandırılmaz ya da kırpılmaz.

Neden bloklar "dalgalar" arasında giriyor: PLAN B.3'ün harfiyen okunuşunda ya her blok en kısa haliyle erkenden girer ve her şey sıkışık olur, ya da bir blok ancak öncekiler max sessizliğe ulaşınca girer ve arada uzun, boş sessizlikler kalır. Dalga düzeninde bir blok, öncekiler rahat (pref) bir biçime ulaşınca girer. Kısaltma sırası PLAN B.1 ile aynıdır: önce sessizlikler, sonra ayrıntılar, en son bloklar.

### 2.4 Denetimler (`timing.py`; her vaka iki duraklama profilinde)

- **Görevdekiler:** (a) toplam = hedef ±1 sn; (b) Varış ve Kapanış eksiksiz; (c) üst üste binme yok; (d) hiçbir sessizlik sınırını aşmıyor (pencere <= 90 sn, diğerleri <= kendi max'ı) ve min'in altına inmiyor; (e) son 60 sn'de yeni imge, çağrışım, zor blok ya da pencere yok; (f) 5 dk = Varış + en az bir P1 + Kapanış (bu ders için bütün P1'ler); (g) dakikalık konuşma yoğunluğu: herhangi bir 60 sn'de <= 150 hece ve <= %60 konuşma, tamamen "Derin" evredeki 60 sn'de <= 110 hece ve <= %45 konuşma, plan ortalaması 40–130 hece/dk, duyurulmamış konuşmasız 60 sn yok (eşikler VARSAYIM; PLAN C.2 bantları + pay; sonuca bakılarak gevşetilmedi, aşan yerde metin ve sessizlik düzeltildi).
- **Ek (usta hoca ve güvenlik):** anahtar cümle 1-2-3 sırayla ve giderek kısa; dolaşım sırası sağ → sol → arka → ön → bütün; kapanış ritüeli sırası; >= 20 dk'da ortada çıkış kapısı; her pencere duyurulmuş ve karşılanmış; her blokta >= 5 sn bilinçli sessizlik ve planda en uzun boşluk >= 8 sn (E.6 #2); dolgu sözcükleri ("şimdi, sadece, yalnızca, hafifçe, yavaşça") 60 sn içinde ikinci kez yok (E.6 #6); 6,6'da her klip <= 15 sn; >= 20 dk'da en uzun doku koşusu <= 300 sn.
- **Metin:** yasak sözcükler (PLAN C.6 + uyku izni), İngilizce, Sanskritçe her terim en çok bir kez, cümle <= 14 sözcük, klip 1–3 cümle, emir kipi yalnız güvenlik etiketli kliplerde, blokta en çok bir açıklama cümlesi (E.6 #7), duraklamalar dahil hiçbir klip 2,5 hece/sn'nin altında değil (E.6 #14), ardışık kliplerde etiketsiz sözcük tekrarı yok.

### 2.5 Sonuç (timing.out.txt'ten)

```
  5.2 hece/sn: 26/26 dakika GEÇTİ (düşük ve yüksek duraklama profilinde)
  5.6 hece/sn: 26/26 dakika GEÇTİ (düşük ve yüksek duraklama profilinde)
  6.6 hece/sn: 26/26 dakika GEÇTİ (düşük ve yüksek duraklama profilinde)
  TOPLAM: 78/78 vaka GEÇTİ; metin denetimi GEÇTİ
```

Paylar:

| hız | profil | 5 dk: min sessizliklere göre boş pay | 5 dk sessizlik kipi | 30 dk: bütün içerik + max sessizlik | 30 dk sessizlik kipi |
|---|---|---|---|---|---|
| 5,2 | düşük | 19,9 sn | min→pref 0,42 | 35:00 (35 dk) | pref→max 0,48 |
| 5,2 | yüksek | 10,8 sn | min→pref 0,22 | 35:35 (35,6 dk) | pref→max 0,42 |
| 5,6 | düşük | 27,4 sn | min→pref 0,57 | 34:31 (34,5 dk) | pref→max 0,53 |
| 5,6 | yüksek | 20 sn | min→pref 0,42 | 35:00 (35 dk) | pref→max 0,48 |
| 6,6 | düşük | 41,1 sn | min→pref 0,86 | 33:39 (33,6 dk) | pref→max 0,62 |
| 6,6 | yüksek | 33,8 sn | min→pref 0,7 | 34:07 (34,1 dk) | pref→max 0,57 |

En dar yer, 5 dakikanın en yavaş ucudur (5,2 hece/sn + Hakan duraklamaları ×1,25): 10,8 sn pay kalır. Bu uç gerçek üretimde çıkarsa klip süreleri ölçülünce yeniden denetlenir. 30:00 en hızlı uçta bile bütün içerik max sessizlikte 33:39'e ulaştığı için pay 3,6 dakikadır. Bu yüzden 30 dakikalık sürüm hiçbir sessizliği sınırına dayamadan kurulur.

## 3. Metin

Okuma: **tür** zorunlu / isteğe bağlı / genişletme; **sessizlik** klipten sonra, sn (min / pref / max; "pencere" = duyurulmuş sessiz pencere); **ipucu** `görsel` ve `müzik` olayları ile nefes sayısı; **evre** ses ayarı ve karışım evresi. Konuşma sırasında yatağın kısık olması varsayılan durumdur ve her satıra yazılmadı. Kliplerde `…` taşıyıcıdan kesilen öğenin liste ezgisini gösterir. Taşıyıcılar TTS'e tek istek olarak gider ve üç nokta duraklarından kesilir (öğe sayısı tutmazsa kesimi insan onaylar).

### A.kisa · Varış (kısa, <= 12 dk)

tür `arrival` · kısa (<= 12 dk). Sabit kapak; hedef <= 12 dk. Sessizlikler sıkıştırılmaz.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `a.hosgeldin` | zorunlu | Hoş geldin. | 3 / 3 / 4 | görsel `phase:varis` · müzik `phase:varis` | Varış | 3 |
| `a.acilis` | zorunlu | Bu dakikalarda yapacak hiçbir işin yok; yalnızca dinlenmek var. | 5 / 5 / 8 | — | Varış | 21 |
| `a.izin` | zorunlu | İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin. | 5 / 5 / 8 | — | Varış | 26 |
| `a.durus` | zorunlu | Sırtüstü ya da sana en rahat gelen biçimde uzanabilirsin. | 8 / 8 / 12 | — | Varış | 21 |
| `a.gozler` | zorunlu | Gözlerin kapalı da olabilir, açık da; açıksa bakışın bir noktada dinlenebilir. | 6 / 6 / 9 | — | Varış | 29 |

<details><summary>Klip notları (A.kisa)</summary>

- `a.acilis`: **derse özgü açılış**
- `a.izin`: güvenlik: opening
- `a.durus`: eylem: uzanmak

</details>

### A.uzun · Varış (uzun, > 12 dk)

tür `arrival` · uzun (> 12 dk). Sabit kapak; hedef > 12 dk. Kısa metnin üst kümesi (aynı ses dosyaları): örtü, yastık, ağırlık ve kontrol cümlesi eklenir. Uzun kapaklar (Varış + Kapanış) kısa olanlardan 73–84 sn uzundur; bu yüzden 12 → 13 dakika geçişinde çekirdekten bir ayrıntı grubu bir dakikalığına düşebilir (§4.4).

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `a.hosgeldin` | zorunlu | Hoş geldin. | 3 / 3 / 4 | görsel `phase:varis` · müzik `phase:varis` | Varış | 3 |
| `a.acilis` | zorunlu | Bu dakikalarda yapacak hiçbir işin yok; yalnızca dinlenmek var. | 5 / 5 / 8 | — | Varış | 21 |
| `a.izin` | zorunlu | İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin. | 5 / 5 / 8 | — | Varış | 26 |
| `a.ortu` | zorunlu | Üşümemek için üstüne ince bir örtü alabilirsin. | 8 / 8 / 14 | — | Varış | 19 |
| `a.durus` | zorunlu | Sırtüstü ya da sana en rahat gelen biçimde uzanabilirsin. | 8 / 8 / 12 | — | Varış | 21 |
| `a.yastik` | zorunlu | Dizlerinin altına bir yastık iyi gelebilir. | 7 / 7 / 12 | — | Varış | 16 |
| `a.gozler` | zorunlu | Gözlerin kapalı da olabilir, açık da; açıksa bakışın bir noktada dinlenebilir. | 6 / 6 / 9 | — | Varış | 29 |
| `a.agirlik` | zorunlu | Bedeninin ağırlığını altındaki zemine bırakabilirsin. | 7 / 7 / 12 | — | Varış | 22 |
| `a.karar` | zorunlu | Ne kadar gevşeyeceğine sen karar verirsin. Gevşemek bugün kolay gelmeyebilir; bu da olur. | 7 / 7 / 11 | — | Varış | 31 |

<details><summary>Klip notları (A.uzun)</summary>

- `a.acilis`: **derse özgü açılış**
- `a.izin`: güvenlik: opening
- `a.ortu`: eylem: örtü almak
- `a.durus`: eylem: uzanmak
- `a.yastik`: eylem: yastık
- `a.karar`: güvenlik: control

</details>

### N1 · Niyet (sankalpa), başta

tür `core` · öncelik P1 · çalma sırası 1. P1. Niyet başta. "Sankalpa" sözcüğü seste yalnız burada ve yalnız bir kez geçer (isteğe bağlı açıklama klibinde).

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `n1.sec` | zorunlu | İstersen kendine kısa bir niyet seçebilirsin. | 4 / 7 / 10 | görsel `phase:derinlesme` | Derinleşme | 16 |
| `n1.sankalpa` | isteğe bağlı | Yogada buna sankalpa denir: bugün sana iyi gelecek, basit bir cümle. | 3 / 4 / 6 | — | Derinleşme | 24 |
| `n1.ornek` | zorunlu | Bulamazsan şunu kullanabilirsin: "Dinlenmeye izin veriyorum." | 3 / 5 / 7 | — | Derinleşme | 22 |
| `n1.soyle` | zorunlu | Niyetini içinden üç kez söyleyebilirsin. | 10 / 13 / 18 | — | Derinleşme | 15 |
| `n1.birak` | isteğe bağlı | Niyetin seninle; şimdilik onu bir kenara bırakabilirsin. | 4 / 5 / 8 | — | Derinleşme | 21 |

<details><summary>Klip notları (N1)</summary>

- `n1.sankalpa`: açıklama (blokta tek); sıra 630
- `n1.soyle`: eylem: niyeti üç kez içinden söylemek
- `n1.birak`: sıra 140

</details>

### C1 · Beden dolaşımı (sağ → sol → arka → ön → bütün)

tür `core` · öncelik P1 · çalma sırası 2. P1. Beden dolaşımı. Çerçeve cümlesi izin verir ve atlama kapısını açar. Sonra yalnız yer adları gelir. Bütün noktalar mikro-kliptir ve temposu uygulamadadır (pref 1,5 sn; bölüm sonlarında 3 sn). En kısa sürümde her taraf 4 nokta, sırt 3, ön yüz 4 noktadır. Kalça, göğüs ve karın hassas bölgelerdir: tek adla geçer, üzerlerinde durulmaz; kalça ve karın isteğe bağlıdır. Genişletme: zemine değen noktalar turu.

Taşıyıcılar (CRITIQUE #12):

| taşıyıcı (tek TTS isteği) | TTS'e giden metin | kesilen klipler |
|---|---|---|
| `car.sag1` | Sağ elin başparmağı… işaret parmağı… orta parmak… yüzük parmağı… serçe parmak… | `c1.s01`, `c1.s02`, `c1.s03`, `c1.s04`, `c1.s05` |
| `car.sag2` | Avuç içi… elin sırtı… bilek… ön kol… dirsek… | `c1.s06`, `c1.s07`, `c1.s08`, `c1.s09`, `c1.s10` |
| `car.sag3` | Üst kol… omuz… belin sağ yanı… kalça… | `c1.s11`, `c1.s12`, `c1.s13`, `c1.s14` |
| `car.sag4` | Uyluk… diz… baldır… ayak bileği… topuk… ayak tabanı… | `c1.s15`, `c1.s16`, `c1.s17`, `c1.s18`, `c1.s19`, `c1.s20` |
| `car.sag5` | Ayağın üstü… ayak başparmağı… ikinci parmak… üçüncü parmak… dördüncü parmak… beşinci parmak. | `c1.s21`, `c1.s22`, `c1.s23`, `c1.s24`, `c1.s25`, `c1.s26` |
| `car.sol1` | Sol elin başparmağı… işaret parmağı… orta parmak… yüzük parmağı… serçe parmak… | `c1.l01`, `c1.l02`, `c1.l03`, `c1.l04`, `c1.l05` |
| `car.sol2` | Avuç içi… elin sırtı… bilek… ön kol… dirsek… | `c1.l06`, `c1.l07`, `c1.l08`, `c1.l09`, `c1.l10` |
| `car.sol3` | Üst kol… omuz… belin sol yanı… kalça… | `c1.l11`, `c1.l12`, `c1.l13`, `c1.l14` |
| `car.sol4` | Uyluk… diz… baldır… ayak bileği… topuk… ayak tabanı… | `c1.l15`, `c1.l16`, `c1.l17`, `c1.l18`, `c1.l19`, `c1.l20` |
| `car.sol5` | Ayağın üstü… ayak başparmağı… ikinci parmak… üçüncü parmak… dördüncü parmak… beşinci parmak. | `c1.l21`, `c1.l22`, `c1.l23`, `c1.l24`, `c1.l25`, `c1.l26` |
| `car.sirt` | Sağ kürek kemiği… sol kürek kemiği… bel boşluğu… omurga, boydan boya… bütün sırt. | `c1.b01`, `c1.b02`, `c1.b03`, `c1.b04`, `c1.b05` |
| `car.on1` | Başın tepesi… alın… sağ şakak… sol şakak… sağ kaş… sol kaş… | `c1.f01`, `c1.f02`, `c1.f03`, `c1.f04`, `c1.f05`, `c1.f06` |
| `car.on2` | Göz kapakları… gözlerin çevresi… sağ kulak… sol kulak… sağ yanak… sol yanak… burnun ucu… | `c1.f07`, `c1.f08`, `c1.f09`, `c1.f10`, `c1.f11`, `c1.f12`, `c1.f13` |
| `car.on3` | Üst dudak… alt dudak… çene… boyun… sağ köprücük kemiği… sol köprücük kemiği… göğüs… karın. | `c1.f14`, `c1.f15`, `c1.f16`, `c1.f17`, `c1.f18`, `c1.f19`, `c1.f20`, `c1.f21` |
| `car.butun` | Bütün sağ bacak… bütün sol bacak… iki bacak birlikte… bütün sağ kol… bütün sol kol… iki kol birlikte… bütün beden birlikte… bütün beden… bütün beden. | `c1.w01`, `c1.w02`, `c1.w03`, `c1.w04`, `c1.w05`, `c1.w06`, `c1.w07`, `c1.w08`, `c1.w09` |
| `car.temas` | Topuklar… baldırlar… kalçalar… kürek kemikleri… başın arkası. | `c1.x02`, `c1.x03`, `c1.x04`, `c1.x05`, `c1.x06` |

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `c1.cerceve` | zorunlu | Adını andığım yerleri fark edebilirsin; rahatsız eden bir yer olursa atlayabilirsin. | 2,5 / 3 / 4 | müzik `phase:derin` | Derinleşme | 31 |
| `c1.tekrar` | isteğe bağlı | Bir şey yapman gerekmiyor; her adı içinden tekrarlaman yeterli. | 2,5 / 3 / 4 | — | Derinleşme | 21 |
| `c1.s01` | zorunlu | Sağ elin başparmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 7 |
| `c1.s02` | isteğe bağlı | işaret parmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.s03` | isteğe bağlı | orta parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.s04` | isteğe bağlı | yüzük parmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s05` | isteğe bağlı | serçe parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.s06` | isteğe bağlı | avuç içi… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.s07` | isteğe bağlı | elin sırtı… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.s08` | isteğe bağlı | bilek… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s09` | isteğe bağlı | ön kol… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s10` | isteğe bağlı | dirsek… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s11` | isteğe bağlı | üst kol… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s12` | zorunlu | omuz… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s13` | isteğe bağlı | belin sağ yanı… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s14` | isteğe bağlı | kalça… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s15` | isteğe bağlı | uyluk… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s16` | zorunlu | diz… | 1 / 1,5 / 2,8 | — | Derinleşme | 1 |
| `c1.s17` | isteğe bağlı | baldır… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s18` | isteğe bağlı | ayak bileği… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s19` | isteğe bağlı | topuk… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.s20` | zorunlu | ayak tabanı… | 2 / 3 / 4,5 | — | Derinleşme | 5 |
| `c1.s21` | isteğe bağlı | ayağın üstü… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s22` | isteğe bağlı | ayak başparmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.s23` | isteğe bağlı | ikinci parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s24` | isteğe bağlı | üçüncü parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s25` | isteğe bağlı | dördüncü parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.s26` | isteğe bağlı | beşinci parmak. | 2 / 3 / 4,5 | — | Derinleşme | 5 |
| `c1.l01` | zorunlu | Sol elin başparmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 7 |
| `c1.l02` | isteğe bağlı | işaret parmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.l03` | isteğe bağlı | orta parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.l04` | isteğe bağlı | yüzük parmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l05` | isteğe bağlı | serçe parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.l06` | isteğe bağlı | avuç içi… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.l07` | isteğe bağlı | elin sırtı… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.l08` | isteğe bağlı | bilek… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l09` | isteğe bağlı | ön kol… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l10` | isteğe bağlı | dirsek… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l11` | isteğe bağlı | üst kol… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l12` | zorunlu | omuz… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l13` | isteğe bağlı | belin sol yanı… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l14` | isteğe bağlı | kalça… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l15` | isteğe bağlı | uyluk… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l16` | zorunlu | diz… | 1 / 1,5 / 2,8 | — | Derinleşme | 1 |
| `c1.l17` | isteğe bağlı | baldır… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l18` | isteğe bağlı | ayak bileği… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l19` | isteğe bağlı | topuk… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.l20` | zorunlu | ayak tabanı… | 2 / 3 / 4,5 | — | Derinleşme | 5 |
| `c1.l21` | isteğe bağlı | ayağın üstü… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l22` | isteğe bağlı | ayak başparmağı… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.l23` | isteğe bağlı | ikinci parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l24` | isteğe bağlı | üçüncü parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l25` | isteğe bağlı | dördüncü parmak… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.l26` | isteğe bağlı | beşinci parmak. | 2 / 3 / 4,5 | — | Derinleşme | 5 |
| `c1.b01` | zorunlu | Sağ kürek kemiği… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.b02` | zorunlu | sol kürek kemiği… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.b03` | isteğe bağlı | bel boşluğu… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.b04` | zorunlu | omurga, boydan boya… | 2 / 3 / 4,5 | — | Derinleşme | 7 |
| `c1.b05` | isteğe bağlı | bütün sırt. | 2 / 3 / 4,5 | — | Derinleşme | 3 |
| `c1.f01` | isteğe bağlı | başın tepesi… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.f02` | zorunlu | alın… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.f03` | isteğe bağlı | sağ şakak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f04` | isteğe bağlı | sol şakak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f05` | isteğe bağlı | sağ kaş… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.f06` | isteğe bağlı | sol kaş… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.f07` | zorunlu | göz kapakları… | 1 / 1,5 / 2,8 | — | Derinleşme | 5 |
| `c1.f08` | isteğe bağlı | gözlerin çevresi… | 1 / 1,5 / 2,8 | — | Derinleşme | 6 |
| `c1.f09` | isteğe bağlı | sağ kulak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f10` | isteğe bağlı | sol kulak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f11` | isteğe bağlı | sağ yanak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f12` | isteğe bağlı | sol yanak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f13` | isteğe bağlı | burnun ucu… | 1 / 1,5 / 2,8 | — | Derinleşme | 4 |
| `c1.f14` | isteğe bağlı | üst dudak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f15` | isteğe bağlı | alt dudak… | 1 / 1,5 / 2,8 | — | Derinleşme | 3 |
| `c1.f16` | zorunlu | çene… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.f17` | isteğe bağlı | boyun… | 1 / 1,5 / 2,8 | — | Derinleşme | 2 |
| `c1.f18` | isteğe bağlı | sağ köprücük kemiği… | 1 / 1,5 / 2,8 | — | Derinleşme | 7 |
| `c1.f19` | isteğe bağlı | sol köprücük kemiği… | 1 / 1,5 / 2,8 | — | Derinleşme | 7 |
| `c1.f20` | zorunlu | göğüs… | 2 / 3 / 4,5 | — | Derinleşme | 2 |
| `c1.f21` | isteğe bağlı | karın. | 2 / 3 / 4,5 | — | Derinleşme | 2 |
| `c1.w01` | isteğe bağlı | Bütün sağ bacak… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 5 |
| `c1.w02` | isteğe bağlı | bütün sol bacak… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 5 |
| `c1.w03` | isteğe bağlı | iki bacak birlikte… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 7 |
| `c1.w04` | isteğe bağlı | bütün sağ kol… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 4 |
| `c1.w05` | isteğe bağlı | bütün sol kol… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 4 |
| `c1.w06` | isteğe bağlı | iki kol birlikte… | 1,5 / 2,2 / 3,2 | — | Derinleşme | 6 |
| `c1.w07` | zorunlu | bütün beden birlikte… | 2 / 3 / 4,5 | — | Derinleşme | 7 |
| `c1.w08` | isteğe bağlı | bütün beden… | 2,5 / 3,5 / 5 | — | Derinleşme | 4 |
| `c1.w09` | isteğe bağlı | bütün beden. | 2,5 / 3,5 / 5 | — | Derinleşme | 4 |
| `c1.x01` | genişletme | Bedeninin yere değdiği noktaları da hissedebilirsin. | 3 / 4 / 6 | — | Derinleşme | 20 |
| `c1.x02` | genişletme | Topuklar… | 1,8 / 2,5 / 3,5 | — | Derinleşme | 3 |
| `c1.x03` | genişletme | baldırlar… | 1,8 / 2,5 / 3,5 | — | Derinleşme | 3 |
| `c1.x04` | genişletme | kalçalar… | 1,8 / 2,5 / 3,5 | — | Derinleşme | 3 |
| `c1.x05` | genişletme | kürek kemikleri… | 1,8 / 2,5 / 3,5 | — | Derinleşme | 6 |
| `c1.x06` | genişletme | başın arkası. | 1,8 / 2,5 / 3,5 | — | Derinleşme | 5 |
| `c1.x07` | genişletme | Her biri, altındaki zemine yaslanıyor. | 4 / 6 / 9 | — | Derinleşme | 14 |
| `c1.k1` | zorunlu | Bedenin dinleniyor; sen uyanıksın ve farkındasın. | 5 / 7 / 10 | — | Derinleşme | 17 |

<details><summary>Klip notları (C1)</summary>

- `c1.cerceve`: güvenlik: skip
- `c1.tekrar`: sıra 130
- `c1.s01`: ✂ `car.sag1`#0
- `c1.s02`: ✂ `car.sag1`#1; sıra 110 · grup `parmak`
- `c1.s03`: ✂ `car.sag1`#2; sıra 110 · grup `parmak`
- `c1.s04`: ✂ `car.sag1`#3; sıra 110 · grup `parmak`
- `c1.s05`: ✂ `car.sag1`#4; sıra 110 · grup `parmak`
- `c1.s06`: ✂ `car.sag2`#0; sıra 320 · grup `el`
- `c1.s07`: ✂ `car.sag2`#1; sıra 320 · grup `el`
- `c1.s08`: ✂ `car.sag2`#2; sıra 320 · grup `el`
- `c1.s09`: ✂ `car.sag2`#3; sıra 320 · grup `el`
- `c1.s10`: ✂ `car.sag2`#4; sıra 320 · grup `el`
- `c1.s11`: ✂ `car.sag3`#0; sıra 430 · grup `kol`
- `c1.s12`: ✂ `car.sag3`#1
- `c1.s13`: ✂ `car.sag3`#2; sıra 430 · grup `kol`
- `c1.s14`: ✂ `car.sag3`#3; sıra 430 · grup `kol`
- `c1.s15`: ✂ `car.sag4`#0; sıra 210 · grup `bacak`
- `c1.s16`: ✂ `car.sag4`#1
- `c1.s17`: ✂ `car.sag4`#2; sıra 210 · grup `bacak`
- `c1.s18`: ✂ `car.sag4`#3; sıra 210 · grup `bacak`
- `c1.s19`: ✂ `car.sag4`#4; sıra 210 · grup `bacak`
- `c1.s20`: ✂ `car.sag4`#5
- `c1.s21`: ✂ `car.sag5`#0; sıra 520 · grup `ayak`
- `c1.s22`: ✂ `car.sag5`#1; sıra 520 · grup `ayak`
- `c1.s23`: ✂ `car.sag5`#2; sıra 520 · grup `ayak`
- `c1.s24`: ✂ `car.sag5`#3; sıra 520 · grup `ayak`
- `c1.s25`: ✂ `car.sag5`#4; sıra 520 · grup `ayak`
- `c1.s26`: ✂ `car.sag5`#5; sıra 520 · grup `ayak`
- `c1.l01`: ✂ `car.sol1`#0
- `c1.l02`: ✂ `car.sol1`#1; sıra 110 · grup `parmak`
- `c1.l03`: ✂ `car.sol1`#2; sıra 110 · grup `parmak`
- `c1.l04`: ✂ `car.sol1`#3; sıra 110 · grup `parmak`
- `c1.l05`: ✂ `car.sol1`#4; sıra 110 · grup `parmak`
- `c1.l06`: ✂ `car.sol2`#0; sıra 320 · grup `el`
- `c1.l07`: ✂ `car.sol2`#1; sıra 320 · grup `el`
- `c1.l08`: ✂ `car.sol2`#2; sıra 320 · grup `el`
- `c1.l09`: ✂ `car.sol2`#3; sıra 320 · grup `el`
- `c1.l10`: ✂ `car.sol2`#4; sıra 320 · grup `el`
- `c1.l11`: ✂ `car.sol3`#0; sıra 430 · grup `kol`
- `c1.l12`: ✂ `car.sol3`#1
- `c1.l13`: ✂ `car.sol3`#2; sıra 430 · grup `kol`
- `c1.l14`: ✂ `car.sol3`#3; sıra 430 · grup `kol`
- `c1.l15`: ✂ `car.sol4`#0; sıra 210 · grup `bacak`
- `c1.l16`: ✂ `car.sol4`#1
- `c1.l17`: ✂ `car.sol4`#2; sıra 210 · grup `bacak`
- `c1.l18`: ✂ `car.sol4`#3; sıra 210 · grup `bacak`
- `c1.l19`: ✂ `car.sol4`#4; sıra 210 · grup `bacak`
- `c1.l20`: ✂ `car.sol4`#5
- `c1.l21`: ✂ `car.sol5`#0; sıra 520 · grup `ayak`
- `c1.l22`: ✂ `car.sol5`#1; sıra 520 · grup `ayak`
- `c1.l23`: ✂ `car.sol5`#2; sıra 520 · grup `ayak`
- `c1.l24`: ✂ `car.sol5`#3; sıra 520 · grup `ayak`
- `c1.l25`: ✂ `car.sol5`#4; sıra 520 · grup `ayak`
- `c1.l26`: ✂ `car.sol5`#5; sıra 520 · grup `ayak`
- `c1.b01`: ✂ `car.sirt`#0
- `c1.b02`: ✂ `car.sirt`#1
- `c1.b03`: ✂ `car.sirt`#2; sıra 450 · grup `sirt`
- `c1.b04`: ✂ `car.sirt`#3
- `c1.b05`: ✂ `car.sirt`#4; sıra 450 · grup `sirt`
- `c1.f01`: ✂ `car.on1`#0; sıra 410 · grup `yuz1`
- `c1.f02`: ✂ `car.on1`#1
- `c1.f03`: ✂ `car.on1`#2; sıra 410 · grup `yuz1`
- `c1.f04`: ✂ `car.on1`#3; sıra 410 · grup `yuz1`
- `c1.f05`: ✂ `car.on1`#4; sıra 410 · grup `yuz1`
- `c1.f06`: ✂ `car.on1`#5; sıra 410 · grup `yuz1`
- `c1.f07`: ✂ `car.on2`#0
- `c1.f08`: ✂ `car.on2`#1; sıra 550 · grup `yuz2`
- `c1.f09`: ✂ `car.on2`#2; sıra 550 · grup `yuz2`
- `c1.f10`: ✂ `car.on2`#3; sıra 550 · grup `yuz2`
- `c1.f11`: ✂ `car.on2`#4; sıra 550 · grup `yuz2`
- `c1.f12`: ✂ `car.on2`#5; sıra 550 · grup `yuz2`
- `c1.f13`: ✂ `car.on2`#6; sıra 550 · grup `yuz2`
- `c1.f14`: ✂ `car.on3`#0; sıra 590 · grup `yuz3`
- `c1.f15`: ✂ `car.on3`#1; sıra 590 · grup `yuz3`
- `c1.f16`: ✂ `car.on3`#2
- `c1.f17`: ✂ `car.on3`#3; sıra 590 · grup `yuz3`
- `c1.f18`: ✂ `car.on3`#4; sıra 590 · grup `yuz3`
- `c1.f19`: ✂ `car.on3`#5; sıra 590 · grup `yuz3`
- `c1.f20`: ✂ `car.on3`#6
- `c1.f21`: ✂ `car.on3`#7; sıra 590 · grup `yuz3`
- `c1.w01`: ✂ `car.butun`#0; sıra 610 · grup `butun`
- `c1.w02`: ✂ `car.butun`#1; sıra 610 · grup `butun`
- `c1.w03`: ✂ `car.butun`#2; sıra 610 · grup `butun`
- `c1.w04`: ✂ `car.butun`#3; sıra 610 · grup `butun`
- `c1.w05`: ✂ `car.butun`#4; sıra 610 · grup `butun`
- `c1.w06`: ✂ `car.butun`#5; sıra 610 · grup `butun`
- `c1.w07`: ✂ `car.butun`#6
- `c1.w08`: ✂ `car.butun`#7; sıra 610 · grup `butun`
- `c1.w09`: ✂ `car.butun`#8; sıra 610 · grup `butun`
- `c1.x01`: sıra 1030 · grup `temas`
- `c1.x02`: ✂ `car.temas`#0; sıra 1030 · grup `temas`
- `c1.x03`: ✂ `car.temas`#1; sıra 1030 · grup `temas`
- `c1.x04`: ✂ `car.temas`#2; sıra 1030 · grup `temas`
- `c1.x05`: ✂ `car.temas`#3; sıra 1030 · grup `temas`
- `c1.x06`: ✂ `car.temas`#4; sıra 1030 · grup `temas`
- `c1.x07`: sıra 1030 · grup `temas`
- `c1.k1`: **anahtar cümle 1**

</details>

### C2 · Nefes farkındalığı ve geri sayma

tür `core` · öncelik P1 · çalma sırası 3. P1. Nefes önce değiştirilmeden izlenir. Sayıları hoca söyler, beşten (uzunda ondan) bire. Sayılar nefese eşlik eder, ona hız dayatmaz. Genişletmede dinleyici bir turu da kendi içinde sayar (duyurulmuş pencere). Kaçırılan sayı bağışlanır.

Taşıyıcılar (CRITIQUE #12):

| taşıyıcı (tek TTS isteği) | TTS'e giden metin | kesilen klipler |
|---|---|---|
| `car.sayi` | On… dokuz… sekiz… yedi… altı… beş… dört… üç… iki… bir. | `c2.n10`, `c2.n09`, `c2.n08`, `c2.n07`, `c2.n06`, `c2.n05`, `c2.n04`, `c2.n03`, `c2.n02`, `c2.n01` |

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `c2.dikkat` | zorunlu | Şimdi nefesi olduğu gibi, değiştirmeden izleyebilirsin. | 4,5 / 9 / 13 | görsel `phase:derin` | Derin | 21 |
| `c2.yer` | isteğe bağlı | Onu en belirgin hissettiğin yeri bulabilirsin: burun, göğüs ya da karın. | 7 / 12 / 16 | — | Derin | 25 |
| `c2.akis` | isteğe bağlı | Nefes kendiliğinden geliyor, kendiliğinden gidiyor. | 7 / 11 / 15 | — | Derin | 18 |
| `c2.durak` | isteğe bağlı | Verişin sonunda küçük bir duraklama var; onu da fark edebilirsin. | 7 / 12 / 16 | — | Derin | 23 |
| `c2.sayac` | zorunlu | Geriye doğru sayacağım; sayılar nefesine eşlik edebilir. | 2,5 / 3 / 4 | — | Derin | 22 |
| `c2.n10` | isteğe bağlı | on… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 10 | Derin | 1 |
| `c2.n09` | isteğe bağlı | dokuz… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 9 | Derin | 2 |
| `c2.n08` | isteğe bağlı | sekiz… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 8 | Derin | 2 |
| `c2.n07` | isteğe bağlı | yedi… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 7 | Derin | 2 |
| `c2.n06` | isteğe bağlı | altı… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 6 | Derin | 2 |
| `c2.n05` | zorunlu | beş… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 5 | Derin | 1 |
| `c2.n04` | zorunlu | dört… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 4 | Derin | 1 |
| `c2.n03` | zorunlu | üç… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 3 | Derin | 1 |
| `c2.n02` | zorunlu | iki… | 3,5 / 5,5 / 8 | görsel `pulse` · nefes: sayı 2 | Derin | 2 |
| `c2.n01` | zorunlu | bir. | 3 / 5 / 7 | görsel `pulse` · nefes: sayı 1 | Derin | 1 |
| `c2.x.kendin` | genişletme | İstersen bir turu da içinden sayabilirsin: kendi hızında, ondan bire. Sesim bu sırada susacak, sonra geri gelecek. | **pencere** 40 / 60 / 90 | görsel `window` · müzik `swell` | Derin | 40 |
| `c2.x.donus` | genişletme | Sesim yeniden seninle; sayının nerede kaldığı önemli değil. | 4 / 5 / 7 | — | Derin | 22 |
| `c2.birak` | zorunlu | Sayıları bırakabilirsin; kaçırdıysan bu da olur. | 6 / 9 / 13 | — | Derin | 18 |
| `c2.geri` | isteğe bağlı | Fark ettiğin an, zaten geri döndün. | 7 / 10 / 14 | — | Derin | 11 |

<details><summary>Klip notları (C2)</summary>

- `c2.yer`: sıra 570
- `c2.akis`: sıra 120
- `c2.durak`: sıra 620
- `c2.n10`: ✂ `car.sayi`#0; gerekir: `c2.n09`; sıra 370
- `c2.n09`: ✂ `car.sayi`#1; gerekir: `c2.n08`; sıra 360
- `c2.n08`: ✂ `car.sayi`#2; gerekir: `c2.n07`; sıra 350
- `c2.n07`: ✂ `car.sayi`#3; gerekir: `c2.n06`; sıra 230
- `c2.n06`: ✂ `car.sayi`#4; sıra 220
- `c2.n05`: ✂ `car.sayi`#5
- `c2.n04`: ✂ `car.sayi`#6
- `c2.n03`: ✂ `car.sayi`#7
- `c2.n02`: ✂ `car.sayi`#8
- `c2.n01`: ✂ `car.sayi`#9
- `c2.x.kendin`: pencere duyurusu; sıra 1010 · grup `x.saymak`
- `c2.x.donus`: pencere sonrası karşılama; gerekir: `c2.x.kendin`; sıra 1010 · grup `x.saymak`
- `c2.birak`: başarısızlığı normalleştirir
- `c2.geri`: başarısızlığı normalleştirir; sıra 330

</details>

### BR.K2 · Köprü: anahtar cümle (2. geçiş), nefes bloğunun hemen ardından

tür `bridge` · yer: `C2` bloğunun hemen ardından. Köprü: her sürümde C2'nin hemen ardından çalar; sonra hangi blok geliyorsa (C3, C4 ya da N2) ona bağlanır. Anahtar cümlenin 2. geçişi, derin evrenin başında uyanıklığı yeniden hatırlatır; gündüz dersinde uykuya kaymanın en olası olduğu orta bölümden hemen önce gelir.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `br.k2` | zorunlu | Beden dinleniyor; sen uyanıksın. | 5 / 8 / 12 | — | Derin | 11 |

<details><summary>Klip notları (BR.K2)</summary>

- `br.k2`: **anahtar cümle 2**

</details>

### C3 · Zıtlık çiftleri (ağır/hafif, sıcak/serin)

tür `core` · öncelik P3 · çalma sırası 4 · giriş sırası 500. P3. Zıtlık çiftleri bedende hissedilir. Blok bir bırakma kapısıyla açılır ("istemezsen onu bırakabilirsin") ve bırakmayla kapanır. His dili her yerde izin kipindedir ("belirebilir", "yayılabilir"). Sınama telkini yoktur. "Fincan" ve "pencere" yer kurmayan duyu çağrışımlarıdır.

Taşıyıcılar (CRITIQUE #12):

| taşıyıcı (tek TTS isteği) | TTS'e giden metin | kesilen klipler |
|---|---|---|
| `car.agir` | Kollar ağır… bacaklar ağır… bütün beden ağır. | `c3.a1`, `c3.a2`, `c3.a3` |
| `car.hafif` | Kollar hafif… bacaklar hafif… bütün beden hafif. | `c3.h1`, `c3.h2`, `c3.h3` |

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `c3.agir` | zorunlu | Bir ağırlık hissi belirebilir; istemezsen onu bırakabilirsin. | 4 / 6 / 8 | — | Derin | 23 |
| `c3.a1` | zorunlu | Kollar ağır… | 2,5 / 3,5 / 5 | — | Derin | 4 |
| `c3.a2` | zorunlu | bacaklar ağır… | 2,5 / 3,5 / 5 | — | Derin | 5 |
| `c3.a3` | zorunlu | bütün beden ağır. | 6 / 9 / 13 | — | Derin | 6 |
| `c3.zemin` | isteğe bağlı | Zemin bu ağırlığı tümüyle taşıyor. | 7 / 10 / 15 | — | Derin | 13 |
| `c3.hafif` | zorunlu | Şimdi bunun tersini hissedebilirsin: hafiflik. | 3 / 4 / 6 | — | Derin | 16 |
| `c3.h1` | zorunlu | Kollar hafif… | 2,5 / 3,5 / 5 | — | Derin | 4 |
| `c3.h2` | zorunlu | bacaklar hafif… | 2,5 / 3,5 / 5 | — | Derin | 5 |
| `c3.h3` | zorunlu | bütün beden hafif. | 6 / 9 / 13 | — | Derin | 6 |
| `c3.nefeskadar` | isteğe bağlı | Neredeyse ağırlıksız; nefes kadar hafif. | 7 / 10 / 15 | — | Derin | 14 |
| `c3.x.ikisi1` | genişletme | Ağırlık da hafiflik de aynı anda burada olabilir. | 9 / 12 / 18 | — | Derin | 19 |
| `c3.sicak` | zorunlu | Sonra sıcaklık: bedeninde ılık bir his yayılabilir. | 6 / 9 / 13 | — | Derin | 18 |
| `c3.fincan` | isteğe bağlı | Avuçlarında sıcak bir fincan tutar gibi. | 7 / 10 / 15 | — | Derin | 14 |
| `c3.serin` | zorunlu | Sonra serinlik: teninde ferah bir his dolaşabilir. | 6 / 9 / 13 | — | Derin | 17 |
| `c3.pencere` | isteğe bağlı | Açık bir pencereden içeri dolan hava gibi. | 7 / 10 / 15 | — | Derin | 16 |
| `c3.x.ikisi2` | genişletme | Sıcaklık ve serinlik, yan yana da durabilir. | 9 / 12 / 18 | — | Derin | 15 |
| `c3.birak` | zorunlu | Bu hisleri bırakabilirsin; beden kendi hâline dönüyor. | 7 / 12 / 16 | — | Derin | 20 |

<details><summary>Klip notları (C3)</summary>

- `c3.agir`: güvenlik: exit
- `c3.a1`: ✂ `car.agir`#0
- `c3.a2`: ✂ `car.agir`#1
- `c3.a3`: ✂ `car.agir`#2
- `c3.zemin`: sıra 510
- `c3.h1`: ✂ `car.hafif`#0
- `c3.h2`: ✂ `car.hafif`#1
- `c3.h3`: ✂ `car.hafif`#2
- `c3.nefeskadar`: sıra 540
- `c3.x.ikisi1`: sıra 1040
- `c3.fincan`: duyu çağrışımı (imge değil); sıra 560
- `c3.pencere`: duyu çağrışımı (imge değil); sıra 580
- `c3.x.ikisi2`: sıra 1070

</details>

### BR.orta · Köprü: ortada çıkış kapısı (>= 20 dk), imgelemeden hemen önce

tür `bridge` · yer: `C4` bloğundan hemen önce. Köprü: yalnız >= 20 dk. İmgelemeden hemen önce ortak çıkış kapısı hatırlatılır (güvenlik §11.B-2/3: uzun iç gözlem öncesi gözleri açma seçeneği ve "istediğin an durabilirsin").

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `br.orta` | zorunlu | Hatırlatayım: istediğin an gözlerini açabilir ya da durabilirsin. | 8 / 10 / 14 | — | Derin | 25 |

<details><summary>Klip notları (BR.orta)</summary>

- `br.orta`: güvenlik: mid; yalnız >= 20 dk

</details>

### C4 · İmgeleme: kıyı ya da orman (tek imge yayı) + sessiz pencere

tür `core` · öncelik P2 · çalma sırası 5 · giriş sırası 300. P2. Dersin tek imge yayı. >= 20 dk'da hemen önüne `BR.orta` köprüsü (çıkış kapısı) gelir.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `c4.yer` | zorunlu | Zihninde bir kıyı ya da bir orman belirebilir; hangisi sana iyi geliyorsa. | 7 / 10 / 14 | görsel `image:on` | Derin | 27 |
| `c4.gelmezse` | zorunlu | Bir görüntü gelmezse de olur; nefesinde kalabilirsin. | 7 / 10 / 14 | — | Derin | 19 |
| `c4.patika` | zorunlu | Ayaklarının altında yumuşak bir patika var. | 7 / 10 / 14 | — | Derin | 16 |
| `c4.inis` | zorunlu | Seni ağır ağır aşağıya indiriyor. | 7 / 10 / 15 | — | Derin | 14 |
| `c4.adim` | isteğe bağlı | Her adımda bedenin biraz daha dinleniyor. | 7 / 10 / 15 | — | Derin | 15 |
| `c4.iz` | isteğe bağlı | Kumda ya da toprakta hafif izler bırakıyorsun. | 7 / 10 / 15 | — | Derin | 16 |
| `c4.ses` | zorunlu | Uzaktan gelip giden bir ses: dalgalar ya da rüzgârdaki yapraklar. | 8 / 11 / 16 | — | Derin | 21 |
| `c4.kus` | genişletme | Daha uzakta bir kuş ötüyor. | 7 / 10 / 15 | — | Derin | 10 |
| `c4.koku` | isteğe bağlı | Havada tuz ya da ıslak toprak kokusu var. | 8 / 11 / 16 | — | Derin | 14 |
| `c4.gunes` | zorunlu | Güneş tenini ılık ılık ısıtıyor. | 8 / 11 / 16 | — | Derin | 13 |
| `c4.ruzgar` | genişletme | Hafif bir rüzgâr yüzüne dokunup geçiyor. | 7 / 10 / 15 | — | Derin | 14 |
| `c4.yerles` | zorunlu | Sana iyi gelen bir yer bulup oturabilir ya da uzanabilirsin. | 8 / 12 / 18 | — | Derin | 23 |
| `c4.tas1` | genişletme | Yanında güneşte ısınmış, düz bir taş var. | 7 / 10 / 15 | — | Derin | 13 |
| `c4.tas2` | genişletme | Elini üstüne koyabilirsin; taş ılık ve pürüzsüz. | 8 / 11 / 16 | — | Derin | 18 |
| `c4.isik` | genişletme | Işık, suyun ya da yaprakların üzerinde oynuyor. | 8 / 11 / 16 | — | Derin | 17 |
| `c4.acele` | isteğe bağlı | Hiçbir şeyin acelesi yok. | 8 / 11 / 16 | — | Derin | 9 |
| `c4.pencere` | zorunlu | Birkaç nefes burada dinlenebilirsin; sesim bir süre susacak, sonra geri gelecek. | **pencere** 20 / 45 / 90 | görsel `window` · müzik `swell` | Derin | 28 |
| `c4.donus1` | zorunlu | Yeniden seninleyim. | 3 / 4 / 6 | — | Derin | 7 |
| `c4.don` | zorunlu | Zamanı geldiğinde aynı patikadan, kendi hızında geri dönebilirsin. | 8 / 12 / 16 | — | Derin | 25 |
| `c4.geride` | isteğe bağlı | Sesler ve ışık yavaş yavaş geride kalıyor. | 6 / 9 / 13 | — | Derin | 15 |
| `c4.solma` | zorunlu | Görüntü soluyor; altındaki zemini yeniden hissedebilirsin. | 7 / 10 / 14 | görsel `image:off` | Derin | 22 |

<details><summary>Klip notları (C4)</summary>

- `c4.yer`: güvenlik: choice; imge: yeni
- `c4.gelmezse`: güvenlik: alternative
- `c4.patika`: imge: yeni
- `c4.inis`: imge: yeni
- `c4.adim`: sıra 420
- `c4.iz`: imge: yeni; sıra 530
- `c4.ses`: imge: yeni
- `c4.kus`: imge: yeni; sıra 1060
- `c4.koku`: imge: yeni; sıra 310
- `c4.gunes`: imge: yeni
- `c4.ruzgar`: imge: yeni; sıra 1080
- `c4.yerles`: imge: yeni
- `c4.tas1`: imge: yeni; sıra 1020 · grup `x.tas`
- `c4.tas2`: imge: yeni; gerekir: `c4.tas1`; sıra 1020 · grup `x.tas`
- `c4.isik`: imge: yeni; sıra 1050
- `c4.acele`: sıra 340
- `c4.pencere`: pencere duyurusu
- `c4.donus1`: pencere sonrası karşılama
- `c4.don`: imge: dönüş
- `c4.geride`: imge: dönüş; sıra 440
- `c4.solma`: imge: dönüş

</details>

### C5 · Tanıklık: sessiz farkındalık

tür `core` · öncelik P5 · çalma sırası 6 · giriş sırası 700 · gerekir: C4. P5. Tanıklık; yalnız C4 varken girer (imgedeki "gelip giden ses"e geri çağrı).

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `c5.basla` | zorunlu | Hiçbir şeyi değiştirmeden, olup biteni izleyebilirsin. | 7 / 10 / 15 | — | Derin | 20 |
| `c5.sesler` | isteğe bağlı | Uzaktaki sesler, yakındaki sesler ve aradaki sessizlik. | 8 / 12 / 18 | — | Derin | 20 |
| `c5.dusunce` | zorunlu | Düşünceler de gelip gidiyor; dalgalar ya da yapraklar gibi. | 8 / 12 / 18 | — | Derin | 20 |
| `c5.x.hepsi` | genişletme | Nefes, sesler ve beden; hepsi kendi kendine oluyor. | 9 / 13 / 20 | — | Derin | 17 |
| `c5.sen` | zorunlu | Sen, bütün bunları fark edensin. | 8 / 12 / 18 | — | Derin | 10 |
| `c5.pencere` | zorunlu | Bir süre sessizce izlemeye devam edebilirsin; sesim sonra geri gelecek. | **pencere** 30 / 60 / 90 | görsel `window` · müzik `swell` | Derin | 26 |
| `c5.donus` | zorunlu | Buradayım. | 3 / 4 / 6 | — | Derin | 4 |
| `c5.genis` | isteğe bağlı | Dikkatin geniş ve sakin; hiçbir yere gitmesi gerekmiyor. | 8 / 12 / 18 | — | Derin | 19 |

<details><summary>Klip notları (C5)</summary>

- `c5.sesler`: sıra 710
- `c5.x.hepsi`: sıra 1090
- `c5.pencere`: pencere duyurusu
- `c5.donus`: pencere sonrası karşılama
- `c5.genis`: sıra 720

</details>

### N2 · Niyet, sonda

tür `core` · öncelik P1 · çalma sırası 7. P1. Niyetin tekrarı.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `n2.hatirla` | zorunlu | Başta seçtiğin niyeti hatırlayıp içinden üç kez söyleyebilirsin. | 9 / 14 / 20 | — | Derin | 23 |
| `n2.dilek` | isteğe bağlı | Niyetin, günün geri kalanında da seninle olabilir. | 5 / 7 / 10 | — | Derin | 19 |

<details><summary>Klip notları (N2)</summary>

- `n2.hatirla`: eylem: niyeti üç kez içinden söylemek
- `n2.dilek`: sıra 240

</details>

### K.kisa · Kapanış (kısa, <= 12 dk)

tür `closing` · kısa (<= 12 dk). Sabit kapak; hedef <= 12 dk. Gündüz dönüşü. Uyku izni yok. Sessizlikler sıkıştırılmaz ve eylem süresi + 2 sn'dir.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `k.anahtar3` | zorunlu | Dinleniyorsun… ve uyanıksın. | 3,5 / 3,5 / 6 | — | Derin | 10 |
| `k.donus` | zorunlu | Artık dönme zamanı. | 2,5 / 2,5 / 4 | görsel `dawn` · müzik `phase:kapanis` | Kapanış | 7 |
| `k.nefes` | zorunlu | Nefesin biraz derinleşebilir. | 6 / 6 / 9 | — | Kapanış | 11 |
| `k.parmak` | zorunlu | El ve ayak parmaklarını oynatabilirsin. | 5 / 5 / 7 | — | Kapanış | 15 |
| `k.gerin` | zorunlu | Canın nasıl isterse gerinebilirsin. | 5 / 5 / 8 | — | Kapanış | 13 |
| `k.goz` | zorunlu | Gözlerini ışığa alışa alışa açabilirsin. | 5 / 5 / 7 | müzik `chord` | Kapanış | 18 |
| `k.oda.kisa` | zorunlu | Odada birkaç şeye bakabilirsin. | 4,5 / 4,5 / 7 | — | Kapanış | 12 |
| `k.yan` | zorunlu | Önce bir yanına dön. | 5 / 5 / 8 | — | Kapanış | 7 |
| `k.otur` | zorunlu | Ellerinden destek alarak yavaşça doğrulup otur. | 6 / 6 / 9 | — | Kapanış | 17 |
| `k.bekle` | zorunlu | Birkaç nefes böyle kal; başın dönerse biraz daha bekle. | 4,5 / 4,5 / 8 | — | Kapanış | 18 |
| `k.son` | zorunlu | Buradasın; uyanık ve dinlenmiş. | 2,5 / 2,5 / 4 | görsel `end` · müzik `fade:2s` | Kapanış | 11 |

<details><summary>Klip notları (K.kisa)</summary>

- `k.anahtar3`: **anahtar cümle 3**
- `k.nefes`: adım: nefes
- `k.parmak`: adım: parmak
- `k.gerin`: adım: gerin
- `k.goz`: adım: goz
- `k.oda.kisa`: adım: oda
- `k.yan`: emir kipi (güvenlik/beden); adım: yan
- `k.otur`: emir kipi (güvenlik/beden); adım: otur
- `k.bekle`: emir kipi (güvenlik/beden); adım: bekle
- `k.son`: adım: son

</details>

### K.uzun · Kapanış (uzun, > 12 dk)

tür `closing` · uzun (> 12 dk). Sabit kapak; hedef > 12 dk. Kısa metne odanın sesleri, oda ayrıntısı, zaman ve yer yönelimi ve yan tarafta kalma eklenir.

| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |
|---|---|---|---|---|---|---|
| `k.anahtar3` | zorunlu | Dinleniyorsun… ve uyanıksın. | 3,5 / 3,5 / 6 | — | Derin | 10 |
| `k.donus` | zorunlu | Artık dönme zamanı. | 2,5 / 2,5 / 4 | görsel `dawn` · müzik `phase:kapanis` | Kapanış | 7 |
| `k.nefes` | zorunlu | Nefesin biraz derinleşebilir. | 6 / 6 / 9 | — | Kapanış | 11 |
| `k.sesler` | zorunlu | Odanın seslerini, dışarıdan gelenleri de duyabilirsin. | 6 / 6 / 8 | — | Kapanış | 21 |
| `k.parmak` | zorunlu | El ve ayak parmaklarını oynatabilirsin. | 5 / 5 / 7 | — | Kapanış | 15 |
| `k.gerin` | zorunlu | Canın nasıl isterse gerinebilirsin. | 5 / 5 / 8 | — | Kapanış | 13 |
| `k.goz` | zorunlu | Gözlerini ışığa alışa alışa açabilirsin. | 5 / 5 / 7 | müzik `chord` | Kapanış | 18 |
| `k.oda.uzun` | zorunlu | Odada birkaç şeye bakabilirsin: bir renk, bir biçim, bir doku. | 5,5 / 5,5 / 8 | — | Kapanış | 20 |
| `k.zaman` | zorunlu | Günün hangi saatinde, nerede olduğunu hatırlayabilirsin. | 4,5 / 4,5 / 7 | — | Kapanış | 22 |
| `k.yan` | zorunlu | Önce bir yanına dön. | 5 / 5 / 8 | — | Kapanış | 7 |
| `k.yandakal` | zorunlu | Bir iki nefes o yanında kalabilirsin. | 7 / 7 / 10 | — | Kapanış | 14 |
| `k.otur` | zorunlu | Ellerinden destek alarak yavaşça doğrulup otur. | 6 / 6 / 9 | — | Kapanış | 17 |
| `k.bekle` | zorunlu | Birkaç nefes böyle kal; başın dönerse biraz daha bekle. | 4,5 / 4,5 / 8 | — | Kapanış | 18 |
| `k.son` | zorunlu | Buradasın; uyanık ve dinlenmiş. | 2,5 / 2,5 / 4 | görsel `end` · müzik `fade:2s` | Kapanış | 11 |

<details><summary>Klip notları (K.uzun)</summary>

- `k.anahtar3`: **anahtar cümle 3**
- `k.nefes`: adım: nefes
- `k.sesler`: adım: sesler
- `k.parmak`: adım: parmak
- `k.gerin`: adım: gerin
- `k.goz`: adım: goz
- `k.oda.uzun`: adım: oda
- `k.zaman`: adım: oda
- `k.yan`: emir kipi (güvenlik/beden); adım: yan
- `k.yandakal`: adım: yan
- `k.otur`: emir kipi (güvenlik/beden); adım: otur
- `k.bekle`: emir kipi (güvenlik/beden); adım: bekle
- `k.son`: adım: son

</details>

### K.hizli · "Kapanışa geç" için hızlı kapanış

"Kapanışa geç" düğmesi: o anki klip biter, motor müziği kapanış evresine geçirir ve şafak görselini başlatır, sonra bu dizi çalar (PLAN B.5; 45–60 sn). Düğmenin kendisi geçiş olduğu için "Artık dönme zamanı." burada yoktur. Klipler Kapanış'takilerin aynısıdır; yeni ses üretilmez. Süre (pref) 5,2–6,6 hece/sn'de 51–56 sn (denetlendi).

| id | metin | sessizlik sonra (sn) |
|---|---|---|
| `k.nefes` | Nefesin biraz derinleşebilir. | 6 |
| `k.parmak` | El ve ayak parmaklarını oynatabilirsin. | 5 |
| `k.goz` | Gözlerini ışığa alışa alışa açabilirsin. | 5 |
| `k.yan` | Önce bir yanına dön. | 5 |
| `k.otur` | Ellerinden destek alarak yavaşça doğrulup otur. | 6 |
| `k.bekle` | Birkaç nefes böyle kal; başın dönerse biraz daha bekle. | 4,5 |
| `k.son` | Buradasın; uyanık ve dinlenmiş. | 2,5 |

### D.durdur · Durdur (X) sonrası isteğe bağlı 20 sn sesli dönüş

"Durdur (X)" sonrası isteğe bağlı sesli dönüş (güvenlik §11.D-4). İlk iki cümle, durdurma ekranındaki metnin aynısıdır (ekran ile ses aynı cümleyi söyler). Emir kipi güvenlik gereği kullanılır. Süre 20–23 sn.

| id | metin | sessizlik sonra (sn) |
|---|---|---|
| `d.goz` | Gözlerini aç, etrafına bak, acele etme. | 4 |
| `d.kalk` | Uzanıyorsan önce yana dön, sonra otur. | 6 |
| `d.bekle` | Birkaç nefes bekle; sonra kalkabilirsin. | 2 |

## 4. Sürümler

### 4.1 5 dakika · tam metin (5,6 hece/sn, yüksek duraklama; sessizlik kipi min→pref 0,42)

| zaman | blok | id | söz | sonra sessizlik (sn) |
|---|---|---|---|---|
| 0:03 | A.kisa | `a.hosgeldin` | Hoş geldin. | 3 |
| 0:07 | A.kisa | `a.acilis` | Bu dakikalarda yapacak hiçbir işin yok; yalnızca dinlenmek var. | 5 |
| 0:17 | A.kisa | `a.izin` | İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin. | 5 |
| 0:27 | A.kisa | `a.durus` | Sırtüstü ya da sana en rahat gelen biçimde uzanabilirsin. | 8 |
| 0:39 | A.kisa | `a.gozler` | Gözlerin kapalı da olabilir, açık da; açıksa bakışın bir noktada dinlenebilir. | 6 |
| 0:52 | N1 | `n1.sec` | İstersen kendine kısa bir niyet seçebilirsin. | 5,3 |
| 1:00 | N1 | `n1.ornek` | Bulamazsan şunu kullanabilirsin: "Dinlenmeye izin veriyorum." | 3,8 |
| 1:09 | N1 | `n1.soyle` | Niyetini içinden üç kez söyleyebilirsin. | 11,3 |
| 1:23 | C1 | `c1.cerceve` | Adını andığım yerleri fark edebilirsin; rahatsız eden bir yer olursa atlayabilirsin. | 2,7 |
| 1:32 | C1 | `c1.s01` | Sağ elin başparmağı… | 1,2 |
| 1:35 | C1 | `c1.s12` | omuz… | 1,2 |
| 1:37 | C1 | `c1.s16` | diz… | 1,2 |
| 1:38 | C1 | `c1.s20` | ayak tabanı… | 2,4 |
| 1:42 | C1 | `c1.l01` | Sol elin başparmağı… | 1,2 |
| 1:44 | C1 | `c1.l12` | omuz… | 1,2 |
| 1:46 | C1 | `c1.l16` | diz… | 1,2 |
| 1:47 | C1 | `c1.l20` | ayak tabanı… | 2,4 |
| 1:51 | C1 | `c1.b01` | Sağ kürek kemiği… | 1,2 |
| 1:53 | C1 | `c1.b02` | sol kürek kemiği… | 1,2 |
| 1:56 | C1 | `c1.b04` | omurga, boydan boya… | 2,4 |
| 2:00 | C1 | `c1.f02` | alın… | 1,2 |
| 2:02 | C1 | `c1.f07` | göz kapakları… | 1,2 |
| 2:04 | C1 | `c1.f16` | çene… | 1,2 |
| 2:06 | C1 | `c1.f20` | göğüs… | 2,4 |
| 2:09 | C1 | `c1.w07` | bütün beden birlikte… | 2,4 |
| 2:12 | C1 | `c1.k1` | Bedenin dinleniyor; sen uyanıksın ve farkındasın. | 5,8 |
| 2:22 | C2 | `c2.dikkat` | Şimdi nefesi olduğu gibi, değiştirmeden izleyebilirsin. | 6,4 |
| 2:33 | C2 | `c2.sayac` | Geriye doğru sayacağım; sayılar nefesine eşlik edebilir. | 2,7 |
| 2:41 | C2 | `c2.n05` | beş… | 4,3 |
| 2:45 | C2 | `c2.n04` | dört… | 4,3 |
| 2:50 | C2 | `c2.n03` | üç… | 4,3 |
| 2:55 | C2 | `c2.n02` | iki… | 4,3 |
| 2:59 | C2 | `c2.n01` | bir. | 3,8 |
| 3:04 | C2 | `c2.birak` | Sayıları bırakabilirsin; kaçırdıysan bu da olur. | 7,3 |
| 3:15 | BR.K2 | `br.k2` | Beden dinleniyor; sen uyanıksın. | 6,3 |
| 3:24 | N2 | `n2.hatirla` | Başta seçtiğin niyeti hatırlayıp içinden üç kez söyleyebilirsin. | 11,1 |
| 3:40 | K.kisa | `k.anahtar3` | Dinleniyorsun… ve uyanıksın. | 3,5 |
| 3:47 | K.kisa | `k.donus` | Artık dönme zamanı. | 2,5 |
| 3:51 | K.kisa | `k.nefes` | Nefesin biraz derinleşebilir. | 6 |
| 3:59 | K.kisa | `k.parmak` | El ve ayak parmaklarını oynatabilirsin. | 5 |
| 4:07 | K.kisa | `k.gerin` | Canın nasıl isterse gerinebilirsin. | 5 |
| 4:15 | K.kisa | `k.goz` | Gözlerini ışığa alışa alışa açabilirsin. | 5 |
| 4:23 | K.kisa | `k.oda.kisa` | Odada birkaç şeye bakabilirsin. | 4,5 |
| 4:30 | K.kisa | `k.yan` | Önce bir yanına dön. | 5 |
| 4:37 | K.kisa | `k.otur` | Ellerinden destek alarak yavaşça doğrulup otur. | 6 |
| 4:46 | K.kisa | `k.bekle` | Birkaç nefes böyle kal; başın dönerse biraz daha bekle. | 4,5 |
| 4:55 | K.kisa | `k.son` | Buradasın; uyanık ve dinlenmiş. | 2,5 |

### 4.2 5 ve 30 dakikanın blok listesi (her hız ve profil)

| hız | profil | 5 dk: blok süreleri | 30 dk: blok süreleri |
|---|---|---|---|
| 5,2 | düşük | A.kisa 0:48 → N1 0:32 → C1 0:59 → C2 0:52 → BR.K2 0:09 → N2 0:16 → K.kisa 1:20 | A.uzun 1:52 → N1 1:02 → C1 5:55 → C2 4:32 → BR.K2 0:13 → C3 3:33 → BR.orta 0:17 → C4 6:30 → C5 3:17 → N2 0:34 → K.uzun 2:10 |
| 5,2 | yüksek | A.kisa 0:50 → N1 0:31 → C1 0:59 → C2 0:51 → BR.K2 0:09 → N2 0:15 → K.kisa 1:23 | A.uzun 1:54 → N1 1:03 → C1 5:50 → C2 4:34 → BR.K2 0:13 → C3 3:33 → BR.orta 0:18 → C4 6:27 → C5 3:17 → N2 0:34 → K.uzun 2:12 |
| 5,6 | düşük | A.kisa 0:47 → N1 0:32 → C1 1:00 → C2 0:54 → BR.K2 0:09 → N2 0:16 → K.kisa 1:18 | A.uzun 1:51 → N1 1:01 → C1 5:55 → C2 4:33 → BR.K2 0:13 → C3 3:32 → BR.orta 0:17 → C4 6:32 → C5 3:19 → N2 0:34 → K.uzun 2:08 |
| 5,6 | yüksek | A.kisa 0:48 → N1 0:31 → C1 0:59 → C2 0:53 → BR.K2 0:09 → N2 0:16 → K.kisa 1:20 | A.uzun 1:52 → N1 1:02 → C1 5:51 → C2 4:34 → BR.K2 0:13 → C3 3:33 → BR.orta 0:17 → C4 6:29 → C5 3:19 → N2 0:34 → K.uzun 2:11 |
| 6,6 | düşük | A.kisa 0:44 → N1 0:33 → C1 1:00 → C2 0:58 → BR.K2 0:10 → N2 0:17 → K.kisa 1:15 | A.uzun 1:49 → N1 1:00 → C1 5:54 → C2 4:34 → BR.K2 0:13 → C3 3:32 → BR.orta 0:17 → C4 6:35 → C5 3:21 → N2 0:34 → K.uzun 2:06 |
| 6,6 | yüksek | A.kisa 0:46 → N1 0:32 → C1 1:00 → C2 0:56 → BR.K2 0:10 → N2 0:16 → K.kisa 1:17 | A.uzun 1:50 → N1 1:01 → C1 5:50 → C2 4:36 → BR.K2 0:13 → C3 3:33 → BR.orta 0:17 → C4 6:32 → C5 3:21 → N2 0:34 → K.uzun 2:08 |

### 4.3 Blokların girdiği dakika

| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 tanıklık | ilk genişletme | bütün içerik |
|---|---|---|---|---|---|---|
| 5,2 | düşük | 10 dk | 16 dk | 21 dk | 23 dk | 26 dk |
| 5,2 | yüksek | 10 dk | 16 dk | 22 dk | 24 dk | 26 dk |
| 5,6 | düşük | 10 dk | 16 dk | 21 dk | 23 dk | 25 dk |
| 5,6 | yüksek | 10 dk | 16 dk | 21 dk | 23 dk | 26 dk |
| 6,6 | düşük | 10 dk | 15 dk | 20 dk | 22 dk | 24 dk |
| 6,6 | yüksek | 10 dk | 15 dk | 21 dk | 23 dk | 25 dk |

### 4.4 İçeriğin dakikalara göre büyümesi (5,6 hece/sn, yüksek duraklama)

| dk | kapak | bloklar | klip | hece | konuşma payı | sessizlik kipi | pencereler (sn) |
|---|---|---|---|---|---|---|---|
| 5 | kısa | N1 C1 C2 BR.K2 N2 | 47 | 508 | %37 | min→pref 0,42 | — |
| 6 | kısa | N1 C1 C2 BR.K2 N2 | 55 | 546 | %33 | pref→max 0,1 | — |
| 7 | kısa | N1 C1 C2 BR.K2 N2 | 68 | 632 | %32,9 | pref→max 0,07 | — |
| 8 | kısa | N1 C1 C2 BR.K2 N2 | 69 | 651 | %29,7 | pref→max 0,41 | — |
| 9 | kısa | N1 C1 C2 BR.K2 N2 | 69 | 651 | %26,4 | pref→max 0,81 | — |
| 10 | kısa | N1 C1 C2 BR.K2 C4 N2 | 80 | 866 | %31,3 | min→pref 0,91 | 43 |
| 11 | kısa | N1 C1 C2 BR.K2 C4 N2 | 92 | 919 | %30,3 | pref→max 0 | 45 |
| 12 | kısa | N1 C1 C2 BR.K2 C4 N2 | 102 | 963 | %29,1 | pref→max 0,02 | 46 |
| 13 | uzun | N1 C1 C2 BR.K2 C4 N2 | 103 | 1086 | %30,3 | pref→max 0,03 | 46 |
| 14 | uzun | N1 C1 C2 BR.K2 C4 N2 | 118 | 1156 | %29,9 | pref→max 0,05 | 47 |
| 15 | uzun | N1 C1 C2 BR.K2 C4 N2 | 118 | 1156 | %27,9 | pref→max 0,23 | 55 |
| 16 | uzun | N1 C1 C2 BR.K2 C3 C4 N2 | 130 | 1293 | %29,3 | pref→max 0,06 | 48 |
| 17 | uzun | N1 C1 C2 BR.K2 C3 C4 N2 | 150 | 1407 | %30 | pref→max 0,02 | 46 |
| 18 | uzun | N1 C1 C2 BR.K2 C3 C4 N2 | 159 | 1486 | %29,9 | pref→max 0,02 | 46 |
| 19 | uzun | N1 C1 C2 BR.K2 C3 C4 N2 | 169 | 1572 | %30 | pref→max 0,03 | 46 |
| 20 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 N2 | 170 | 1597 | %28,9 | pref→max 0,13 | 51 |
| 21 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 175 | 1677 | %28,9 | pref→max 0,01 | 45, 60 |
| 22 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 177 | 1716 | %28,3 | pref→max 0,06 | 48, 62 |
| 23 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 179 | 1778 | %28,1 | pref→max 0,02 | 61, 46, 61 |
| 24 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 188 | 1863 | %28,2 | pref→max 0,02 | 60, 46, 60 |
| 25 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 192 | 1924 | %27,9 | pref→max 0,02 | 61, 46, 61 |
| 26 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 194 | 1955 | %27,3 | pref→max 0,07 | 62, 48, 62 |
| 27 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 194 | 1955 | %26,3 | pref→max 0,17 | 65, 53, 65 |
| 28 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 194 | 1955 | %25,4 | pref→max 0,28 | 68, 57, 68 |
| 29 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 194 | 1955 | %24,5 | pref→max 0,38 | 71, 62, 71 |
| 30 | uzun | N1 C1 C2 BR.K2 C3 BR.orta C4 C5 N2 | 194 | 1955 | %23,7 | pref→max 0,48 | 75, 67, 75 |

Süre arttıkça çekirdek içerik azalmıyor mu? Yalnız şu geçişlerde azalıyor: 5,2/lo 12→13 dk: çekirdek 724 → 694 hece; 5,2/hi 12→13 dk: çekirdek 709 → 691 hece; 5,6/lo 12→13 dk: çekirdek 742 → 724 hece; 5,6/hi 12→13 dk: çekirdek 724 → 694 hece; 6,6/hi 12→13 dk: çekirdek 764 → 742 hece. Hepsi 12 → 13 dk kapak değişimidir: uzun kapaklar 73–84 sn daha uzundur (örtü, yastık, ağırlık, kontrol cümlesi; odanın sesleri, zaman ve yer, yan tarafta kalmak). Bu eklerin hepsi uzun bir yatış için gereklidir. Düşen, yalnız bir isteğe bağlı ayrıntı grubudur ve 14. dakikada geri gelir. Kapak eşiği PLAN'dan gelir; bu bilinçli bir tasarım bedelidir.

## 5. Denetim listeleri

### 5.1 Usta hoca ölçütleri (PLAN E.6, 18 madde)

| # | Ölçüt | Bu metinde | Denetim |
|---|---|---|---|
| 1 | Zaman verir | Her eylem cümlesinin en kısa sessizliği eylem süresi + 2 sn (en kısa değerler, sn): örtü 8, uzanma 8, yastık 7, niyeti üç kez söylemek (başta) 10, niyeti üç kez söylemek (sonda) 9, imgede yer seçmek 7, patikadan dönüş 8, parmaklar 5, gerinme 5, gözleri açma 5, yana dönme 5, doğrulup oturma 6. | veri (`gapAfter.min`) + elle |
| 2 | Sessizliği kullanır | Her blokta >= 5 sn'lik en az bir sessizlik var; 5 dk'da bile en uzun boşluk >= 8 sn (niyet). | `timing.py`, 78/78 |
| 3 | Sessizliği korur | Üç pencere de duyurulur ("sesim bir süre susacak, sonra geri gelecek") ve karşılanır ("Yeniden seninleyim.", "Buradayım.", "Sesim yeniden seninle"); hepsi <= 90 sn. | `timing.py` |
| 4 | Somut beden dili | ağırlık, hafiflik, ılıklık, serinlik, zemine yaslanma, taşın ılıklığı, rüzgârın dokunuşu, koku; "enerji" yok. | yasak liste + elle |
| 5 | Tutarlı yön | sağ → sol → arka → ön → bütün, her sürümde. | `timing.py` |
| 6 | Dolgu yok | Bütün metinde: "şimdi" 2, "sadece" 0, "yalnızca" 1, "hafifçe" 0, "yavaşça" 1; aynı sözcük 60 sn içinde iki kez geçmez; ardışık cümle tekrarı yalnız bilinçli yerlerde (etiketli). | `timing.py` |
| 7 | Anlatmaz, yaşatır | Açıklama cümlesi yalnız N1'de, bir tane ("Yogada buna sankalpa denir…"). | `timing.py` (metin) |
| 8 | Tek imge yayı | Yalnız C4; §1.3. | etiket + son 60 sn denetimi |
| 9 | Davet dili | Emir kipi yalnız güvenlik adımlarında: "Önce bir yanına dön.", "…doğrulup otur.", "Birkaç nefes böyle kal; …bekle." ve Durdur dönüşü. | `timing.py` (metin) |
| 10 | Başarısızlığı normalleştirir | "Gevşemek bugün kolay gelmeyebilir; bu da olur." · "kaçırdıysan bu da olur" · "Fark ettiğin an, zaten geri döndün." · "Bir görüntü gelmezse de olur". | elle |
| 11 | Çıkış kapısı | Açılışta ortak cümle; >= 20 dk'da ortada hatırlatma; dolaşımda atlama; zıtlıkta ve imgede bırakma yolu. Zor blok yok. | `timing.py` |
| 12 | Kapanış ritüeli | nefes → parmaklar → gerinme → gözler → oda → yana dön → otur → bekle → "Buradasın; uyanık ve dinlenmiş." | `timing.py` |
| 13 | Azalan anlatım | Her klibin evresi var (Varış → Derinleşme → Derin → Kapanış); ses ayarı ve −1,5 / −3 dB evreye göre. | üretim ölçümü (bekliyor) |
| 14 | Doğal hız | Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden. Duraklamalar dahil en yavaş klip 2,61 hece/sn. | `timing.py` (metin) + üretim ölçümü |
| 15 | Ses–müzik | Konuşmada yatak kısık; kabarma yalnız pencerede. | karışım ölçümü (bekliyor) |
| 16 | Kusursuz Türkçe | Bu belgedeki editör turu (§5.4); Scribe ile geri çevirme ve insan editör onayı bekliyor. | kısmen |
| 17 | Benzersizlik | Açılış cümlesi, kıyı/orman patika yayı, ufuk çizgisi formu ve Mi♭ yatağı yalnız bu derste. | ders düzeyi |
| 18 | Yasak liste + güvenlik 18 kural | §5.2 ve §5.3. | `timing.py` + tablo |

### 5.2 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)

| # | Kural | Bu metinde |
|---|---|---|
| 1 | Davet, komut değil | Bütün yönergeler "-ebilirsin", "olabilir" ya da betimleme; emir kipi yalnız güvenlik adımlarında. |
| 2 | Gözleri açık seçeneği | `a.gozler`; uzun iç gözlemden (imgeden) önce `br.orta`. |
| 3 | "İstediğin an durabilirsin" açılışta, 30 dk'da ortada | `a.izin` her sürümde; `br.orta` >= 20 dk (denetlendi). |
| 4 | Kontrol kişide | "Ne kadar gevşeyeceğine sen karar verirsin."; "istemezsen onu bırakabilirsin"; sınama telkini yok. |
| 5 | Gevşeme zorunlu değil | "Gevşemek bugün kolay gelmeyebilir; bu da olur." (uzun varış); "kaçırdıysan bu da olur". |
| 6 | Nefes önce fark edilir | "olduğu gibi, değiştirmeden izleyebilirsin"; "derin nefes al" yok. |
| 7 | Nefes tutma | Yok. |
| 8 | Tarafsız dayanak ve çıkış kapısı | Zor blok yok. Dayanak zemin (varış, temas turu, imgeden dönüş); her zıtlık ve imgede bırakma yolu var. |
| 9 | Beden taraması esnek | `c1.cerceve`: "rahatsız eden bir yer olursa atlayabilirsin". Kalça, göğüs ve karın tek adla geçer. |
| 10 | İmgeleme seçimli | Kıyı ya da orman; "Bir görüntü gelmezse de olur"; suya ve derinliğe girilmez, karanlık ya da kapalı alan yok. |
| 11 | Anı arama yok | Çağrışımlar yalnız nötr duyular (fincan, pencere); kişisel anı istenmez. |
| 12 | Öz-şefkat kademeli | Bu derste öz-şefkat bloğu yok. |
| 13 | Sağlık iddiası yok | Yasak liste temiz (§5.4). |
| 14 | Gündüz dersi uyandırmayla biter | Kapanış ritüeli; son cümle "Buradasın; uyanık ve dinlenmiş." |
| 15 | Uyku dersi uyku izniyle biter | Uygulanmaz. Gündüz dersi: uyku izni yok (yasak liste "uykuya dal", "uyuyabilir", "uyursan" denetlendi). |
| 16 | Sessizlikler rehberli | Her pencere duyurulur ve karşılanır; <= 90 sn. |
| 17 | Beden hareketi hafif | Yalnız dönüşte parmaklar, gerinme, yana dönme, doğrulma; "başın dönerse biraz daha bekle". |
| 18 | Kişiye özel tıbbi uyarı kartta | Seste yok. Araç uyarısı da seste yok, açılış ekranında (CRITIQUE #19). |

### 5.3 Bu metni etkileyen CRITIQUE maddeleri

| # | Konu | Nasıl karşılandı |
|---|---|---|
| 3 | Genişletme klipleri; 30:00'a sessizlik sınırı aşılmadan ulaşmak | 9 genişletme grubu (temas turu, içten sayma + pencere, taş, ışık, kuş, rüzgâr, iki "ikisi birlikte", "hepsi kendi kendine"). En hızlı uçta (6,6 + kısa duraklamalar) bütün içerik max sessizlikte 33:39; 30:00 her hız ve profilde sınır aşılmadan kuruldu. Planlayıcı sessizliği uzatarak kapatmaz; kapatmak zorunda kalırsa içerik hatası verir. |
| 12 | Tek sözcüklük ipuçları taşıyıcı cümlede üretilip kesilir | Sayılar, bütün dolaşım noktaları, ağır/hafif listeleri ve temas noktaları 19 taşıyıcıdan kesilen 108 mikro-kliptir (✂ işaretli). Bu derste "al/ver" ipucu yok (doğal nefes). 1 sn'den kısa mikro-klipler evre referansına göre RMS ile eşitlenir. |
| 21 | Benzersiz açılış, anahtar cümle ×3, tek imge yayı, 30 dk dikkat eğrisi | §0, §1.2, §1.3, §1.4; dikkat eğrisi 20 dk ve üstünde denetlendi. |
| 31 | C.8 davet dili | "İstersen kendine kısa bir niyet seçebilirsin." · "Niyetini içinden üç kez söyleyebilirsin." Kart sözü: "Uyanık kalarak derin bir dinlenme." |
| 19 | İlk ders cümlesi; araç uyarısı; göz kökeni | Bu ders ilk ders değil, o cümle yok. Araç uyarısı kartta ve açılış ekranında, seste değil. Gözlere baskı yok (§1.5). |
| 2 | Gibbs 2026 ifadesi | §1.5: "kronik ağrılı yetişkinlerde, yarı deneysel, n=23". |
| 7, 8 | Ses düzeyleri; müziğin her cümlede inip kalkması | Konuşmada yatak ≈ −33 LUFS'ta kısık kalır; yalnız duyurulan >= 20 sn pencerelerde ≈ −27'ye kabarır (`müzik swell`). |
| 13 | "Harf harf" eşleşme için normalleştirme | §6: sayılar sözcük ↔ rakam, tırnak, üç nokta, düzeltme işareti; uyuşmazlığa insan karar verir. |
| 22 | İnsan incelemesi | Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili kör panel henüz yok. |

### 5.4 Türkçe editör notları (ilk tur)

- TDK yazımı: rüzgâr, hâl (hâline), sırtüstü, başparmak, birkaç, bir iki, ağır ağır, ılık ılık, yavaş yavaş, alışa alışa, kendi kendine, köprücük kemiği, kürek kemiği, bel boşluğu, göz kapakları, avuç içi.
- Bu turda düzeltilen anlatım sorunları:
  - Üç ardışık cümlenin "Nefes…" diye başlaması giderildi.
  - İmgede "Burada acele eden…" cümlesinden sonra gelen "…orada dinlenebilirsin" (burada/orada kayması) düzeltildi.
  - "Patika… Patika…" tekrarı giderildi.
  - "dinlenen bedenin" sözünün hemen ardından "Beden dinleniyor" gelmesi önlendi.
  - "Gözlerini… ışığa" ile "bir ışık" yan yana gelmiyor.
  - "rahatsız eden yeri" varsayımlı ifadesi koşullu yapıldı: "rahatsız eden bir yer olursa".
  - "sırtının altındaki zemin" yerine "altındaki zemin" kondu; yan yatan dinleyici de dışarıda kalmıyor.
  - Uzun varıştaki art arda "-abilirsin" tekdüzeliği kırıldı ("Dizlerinin altına bir yastık iyi gelebilir.").
  - Nefes cümlesinin eksik nesnesi tamamlandı: "Onu en belirgin hissettiğin yeri bulabilirsin…"
  - Anahtar cümle ile zıtlığın açılışı art arda "beden" demiyor: "Bir ağırlık hissi belirebilir…"
- Eksiltili isim cümleleri bilinçli ve konuşma diline uygundur: "Neredeyse ağırlıksız; nefes kadar hafif.", "Avuçlarında sıcak bir fincan tutar gibi.", "Uzaktaki sesler, yakındaki sesler ve aradaki sessizlik." Öznesi bir önceki cümlededir. İnsan editör yine de değerlendirmeli.
- "Ortak ek" kullanımı ("açabilir, kıpırdayabilir ya da durabilirsin") aynı kişi ve kipte olduğu için doğrudur. Bu yapı PLAN'ın ortak güvenlik cümlesinde de var.

## 6. Üretim notları (seslendirme)

- **Yol kararı açık (sahip):** REST ya da MCP.
  - REST ile evreye göre ayar yapılabilir (VARSAYIM başlangıç: Varış speed 0,95 · Derinleşme 0,90 · Derin 0,85). Ayrıca sabit seed ve komşu cümleler için `previous_text` / `next_text` kullanılır.
  - MCP'de bunların hiçbiri yok. Evre farkı o zaman yalnız metinden ve uygulamanın kazancından (−1,5 / −3 dB) gelir.
  - Taşıyıcı yöntemi iki yolda da çalışır, çünkü her taşıyıcı tek istektir.
- **Model:** v3 yön etiketleri kullanılmaz (bu oturumdaki denemede etiket büyük olasılıkla sesli okundu). Metinde hiçbir köşeli etiket yok. `<break>` yok; bütün uzun sessizlikler uygulamada.
- **Kesim (taşıyıcılar):**
  - Sessizlik algısıyla öğeler sırayla ayrılır.
  - Öğe sayısı tutmazsa insan onaylar.
  - Her mikro-klibe 10 ms yumuşak uç konur.
  - Seviye: kısa klipler RMS ile evre referansına eşitlenir.
  - Son öğenin kapanış ezgisi korunur: "beşinci parmak.", "bütün sırt.", "karın.", "bütün beden.", "bir.", "başın arkası."
- **Scribe ile geri çevirme, normalleştirme (CRITIQUE #13):**
  - Küçük harf.
  - Noktalama silinir: … , ; : " ' ve nokta.
  - Düzeltme işareti düşer: â → a, î → i, û → u.
  - Sayılar sözcüğe çevrilir: 10 → on. Taşıyıcı bütün olarak karşılaştırılır.
  - Uyuşmazlıkta klip başına en çok 2 yeniden üretim yapılır; sonra metin yeniden yazılır (CRITIQUE #23).
- **Söyleyiş izleme listesi (dinlenerek denetlenir):**
  - sankalpa, Yogada, rüzgârdaki, hâline.
  - ğ'li sözcükler: başparmağı, ağırlık, değdiği, doğrulup, değiştirmeden, ağır ağır.
  - uyluk, baldır, şakak, köprücük, yüzük parmağı ("yüz" eşyazımlısı), yüzüne.
  - Büyük harfle yazılan I ve İ: "Işık", "İstersen", "İstediğin".
  - Tırnak içi niyet cümlesinin ezgisi.
  - Alias gerekirse yalnız REST'te.
- **Dosyalar:** `voice.{female,male}.file` = `public/yoga/ders2/<ses>/<klip>.m4a` (kod-haritası N6). `sec` üretimden sonra dolar. Taşıyıcıların WAV'ı arşivdir ve pakete girmez.

## 7. VARSAYIM'lar ve açık noktalar

- Bütün `gapAfter` ve pencere değerleri, dalga sıraları (`fillRank`), giriş sıraları (`entryRank`), kapak sessizliklerinin sıkıştırılmaması ve 20 dk'dan itibaren ortadaki hatırlatma birer tasarım kararıdır (VARSAYIM). 12 dk eşiği PLAN'dan gelir.
- Süre modeli: eklemleme hızları ölçümdür. Duraklama profilleri tek paragraftan çıkarıldı. 5,2'deki ×1,25 ve uç payları VARSAYIM'dır.
- Yoğunluk eşikleri (150 / 110 hece, %60 / %45) PLAN C.2 bantlarından türetildi (VARSAYIM).
- Doğa katmanı önerisi (uzak su + hafif rüzgâr) PLAN A.2'den bilinçli bir sapmadır; karar üretimin.
- Sırtüstü yatışa göre yazılan temas turu (topuklar, baldırlar, kürek kemikleri, başın arkası) yan yatan dinleyiciye tam uymaz. Bu yüzden genişletme katmanındadır ve yalnız uzun sürümlerde çalar.
- Açık kararlar (sahip): seslendirme yolu (REST/MCP), doğa sesi, insan editör, hoca ve kör dinleme paneli (CRITIQUE #22).

## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarının ikinci tur doğrulama tablolarında; DOI'ler https://doi.org/ önekiyle açılır)

| PMID | Künye | DOI | Dosya |
|---|---|---|---|
| 39690521 | Luu 2024 (travma-duyarlı YN, 10 bileşen) | 10.17761/2024-D-24-00021 | sakin, güvenlik |
| 40373021 | Moszeik 2025 (11 ve 30 dk YN) | 10.1002/smi.70049 | sakin, teslim |
| 41743305 | Gibbs 2026 (kronik ağrılı yetişkinler, yarı deneysel, n=23) | 10.4103/ijoy.ijoy_2_25 | sakin |
| 34306146 | Toussaint 2021 (derin nefes talimatı ve uyarılma) | 10.1155/2021/5924040 | sakin, güvenlik |
| 42757902 | Shuminsky & Davidow 2026 (konuşma hızı ve doğallık) | 10.1044/2026_JSLHR-25-00691 | teslim |
| 16941239 | Knowlton & Larkin 2006 (azalan anlatım) | 10.1007/s10484-006-9014-6 | teslim |
| 16199412 | Bernardi 2006 (sessizlik aralığı) | 10.1136/hrt.2005.064600 | sakin, teslim |
| 42466037 | Lieutaud & Bourhis 2026 (rehberli ve rehbersiz) | 10.3389/fpsyg.2026.1833806 | teslim |
| 19493324 | Wood 2009 (olumlu cümle tekrarı) | 10.1111/j.1467-9280.2009.02370.x | benlik |
| 3069875 | Braith 1988 (gevşemeye bağlı kaygı) | 10.1016/0005-7916(88)90040-7 | güvenlik |
| 32820538 | Farias 2020 (istenmeyen etkiler) | 10.1111/acps.13225 | güvenlik |
| 28300508 | Howard 2017 (dönüşün önemi) | 10.1080/00029157.2016.1203281 | güvenlik |
| 34260686 | Tran 2021 (ayağa kalkınca ilk KB düşüşü) | 10.1093/ageing/afab090 | güvenlik |
| 24882909 | Cordi 2014 (telkine yatkınlık) | 10.5665/sleep.3778 | sakin, teslim, güvenlik |

Kaynak: PubMed (National Library of Medicine), dosyalardaki okumalar üzerinden. Bu metin hiçbir sonucu vaat etmez.

