# Fark Ettin mi? · dört anın yeni tasarımı (2026-10-02)

Maket: `maket.html?an=<an>&tema=acik|koyu`. Anlar: `04-once`, `04-sonra`, `05`, `06` (yalnız kare yeri denetimi),
`09`, `10`, `11`, `12`, `12-kart`. Görüntüler: `goruntu/<an>-<390|320>-<acik|koyu>.png`. Hareketli anların dizileri:
`goruntu/05-*-{1,2,3}.png` (0,2 · 1,5 · 2,85 sn) ve `goruntu/11-*-{1,2,3}.png` (0 · 0,42 · 1,8 sn).

Sahne çizimi elle yapılmadı. `uret.mjs`, uygulamanın kendi üreticilerini (`streetScenes.js` renderScene/person/item,
`streetSvg.js` taskIconSVG/subjectSVG, `street.js` genStreet, `streetChange.js` makeFrame/nextN) Vite SSR ile çalıştırıp
`sahne.js`'e yazar (`node calistir.mjs`). Ekrandaki her söz de `streetText.js`'ten (say, lines, countRow, changeSentence,
resultHead, factLines) gelir. Onaylı metin bulunamazsa üretim durur. Görüntüler `node cek.mjs` ile alınır. Çekim sırasında
yatay taşma, kesik yazı ve dikey taşma denetlenir; son çekimde hiçbiri yok.

Örnek tur: Cadde, tohum 124, görev "Mavi arabaları say". 5 mavi araba geçti, kişi 4 dedi. Ne değişti? sahneleri sırayla
12 ✓, 14 ✗, 12 ✓ ve 14 ✓ nesne (merdiven `nextN` ile tutarlı), changeN 14. Gözünden kaçan soruları köpeğini gezdiren biri
(sarı, "Görmedim" deyip doğru tahmin) ve baretli bir işçi (turuncu, kaçtı). Bilim kartı gorilla.

## Kapı tur 1 sonrası değişiklikler (2026-10-02, tur 2 maketi; aşağıdaki bölümlerle çelişirse BU geçerli)

Kapı bulguları: `kapi1.json` (04-sonra 3/5, 10 ve 11 1/5, öbürleri 0/5). Eski görüntüler: `goruntu-r1/`.

**1. Tek yan boşluk (`--gut: 20px`).** Her öğe 20 px'te başlar, W−20'de biter. Sahne karesi artık genişlikten
doğuyor (`width: 100%`, 4:5), yükseklikten değil. Alttan açılan sayfa ekran kenarına oturuyor, iç kenarı 20 px.
12'deki rozet ve sarı çerçeve karenin içinde (`inset`). `cek.mjs` her çekimde bunu ölçüyor (`hiza:` denetimi), son
çekimde sapma yok.

| An | 390: içerik kenarı | 320: içerik kenarı |
|---|---|---|
| 04, 05, 06, 09, 10, 11, 12 | 20,0–370,0 | 20,0–300,0 |
| 12 sarı kare | 200–370 (eskiden 752 px'e taşıyordu) | 235–300 |
| 12-kart sayfa | 0–390 (içi 20–370) | 0–320 (içi 20–300) |

**2. Kırpım: tabela ya tam ya hiç.** `app/src/lib/street.js` coverView ve coverModel mantığı kullanılıyor:
- 04 panelinin yan kenarları bina sınırında (`coverBlocks`, caddenin sonundan geriye 1–4 bina). Kutunun oranına
  sığan en geniş aralık seçiliyor. Kenarda bölünen kişi `coverModel` ile çizilmiyor.
- 09–11 kartı konunun binasına tam oturuyor (283 birim, ÇİÇEKÇİ tam).
- Alt kenarlar: 04'te yolun ilk 30 birimi, 09–11'de ayakların hemen altı (yazı hapı için). Boş asfalt kalmıyor.
- Ekrandaki kesin viewBox kutunun oranından hesaplanıyor. Kenarda (yanda ya da üstte) yarım kalan tabela levhası ve
  yazısı çizilmiyor (`fitScene`). Koda aktarımda bu, renderScene'e "yarım tabela çizme" seçeneği olarak girmeli.

**3. 04.**
- Donmuş karede araba yok: "mavi araba" sorusunun altında beyaz araba görünmüyor.
- ✓ halkası kaldırıldı. Soru anında yalnız görev hapı var; cevaptan sonra hap kalkıyor, tepsi onun yerine geliyor.
- Tepsi panelin üstünde (üst katların önünde), tek satır ve numaralı. Kaldırımdaki kişiler örtülmüyor.
- Başlıkta `letter-spacing −0,015em` ve `word-spacing 0,12em` var; "Çok yakın." iki sözcük olarak okunuyor.
  Kural bütün `.h` başlıklarına uygulandı.

**4. 05/06.**
- Başlık iki durumda da iki satırlık sabit kutuda; D2 ilk ". " noktasından iki satıra bölündü (harfler aynı).
- Başlık, sahne ve alt yuva birebir aynı yerde (390: başlık y139, sahne 246–683, yuva 697–753; 320: başlık y69,
  sahne 142–492, yuva 500–548).
- Grup dikeyde ortada; sahne ile alt yuva arası 14 px (320'de 8 px).
- Göz saati kalktı. Yerine "Bulamadım"ın yerinde tek, kalın (14 px, 320'de 12 px) ve gradyanlı bir süre çizgisi var.
  İlk karede dolu, 3 sn'de doğrusal biçimde boşalıyor.
- "Bulamadım" düğmesi artık silik değil: zemin `--surface`, kenar `ink` %34.

**5. 09/10/11.**
- Cam gerçek buzlu cam: figürün maskesinde arkadaki sahnenin bulanık kopyası (`feGaussianBlur 6`, `saturate .35`)
  görünüyor. Üstte hafif bir degrade, içte yumuşak bir kenar gölgesi (`erode 1,8` + blur), dışta 0,9 birim beyaz
  çizgi var. Göğüs lekesi yok.
- Biçim için motorun kendi gölge katmanları (yüz, gövde yanı, kulak) %55 opaklıkla kullanılıyor.
- Cam ve gerçek hâl AYNI çizimden üretiliyor: `person()` (köpeksiz) + `item(dog)` + tasma. Tasma elden (6, −57)
  boyun tasmasına (72, −31) gidiyor, köpekte boyun tasması var. 11'de yalnız renk açılıyor; biçim aynı kaldığı için
  şekil zıplaması yok.
  - **Motora not:** `streetScenes.js` `person` içinde `q.dog` tasması bugün kuyruğa bağlı. Bunu düzeltmek kod ajanının
    işi.
- 10'daki vurgu renksiz: beyaz halka ve koyu dış çizgi. Figürün tonu değişmiyor. Halka 11'de turkuaza dönüyor ve iki
  dalga yayılıyor.
- Başlık yeri sabit: başlık kutusu üstte (390'da y80, 320'de y63). Kart (390: 212–662, 320: 166–431) ve alt blok
  (390: 678–812) üç adımda birebir aynı.
- Renk yuvarlağı uygulamanın street.css çözümünü kullanıyor (iç koyu çizgi) ve üstüne dışta temaya zıt dolu bir halka
  ekliyor: `--sw-well`, açıkta `#3a4450`, koyuda `#dfe4e8`. Siyah yuvarlak koyu temada görünüyor.
- 11'de cevap ("✓ ● sarı") sahnede değil, alt blokta sade yeşil bir zeminde duruyor.
- Kaynak satırı Onest 13 px (320'de 12 px) ve tek satır. Parçaları bölünmüyor, "·" önceki parçaya yapışık.
- 11'in ara karesinde yalnız figür dönüyor (cam → renk, 600 ms). Yazılar yerinde anında değişiyor; ekran solmuyor.

**6. 12.**
- 320'de de yakın plan kullanılıyor: halka, karenin kısa kenarının ~%58'i (iki genişlikte aynı formül).
- Sayı rozeti sol üstte, ✓ sağ üstte; ikisi de halkadan uzakta ve karenin içinde.
- Halkaların dışında koyu bir çizgi var, bu yüzden kesikli beyaz halka açık temada da görünüyor.
- Gözünden kaçan satırında artık ikisi birden gösteriliyor: kişinin cevabı "✗ ● ~~sarı~~" (üstü çizili, soluk) ve
  doğrusu "✓ ● turuncu". Doğru tahminde yalnız "✓ ● sarı" var.
- TAHMİN rozeti: uygulamada `saw === 'gormedim'` ve doğru cevap demek, yani "doğru bildin". Rozet artık yeşil ailede
  (TAM/GÖRDÜN ile aynı), turkuaz değil. 11'deki "doğru bildin" ile çelişmiyor. KAÇTI kırmızı, YAKIN amber.
- Satır küçük resimleri konunun kendi çizimi (tasması düzeltilmiş).

**7. 12-kart.**
- Kart alttan açılan bir sayfa (tutamaklı, üst köşeler 26). Bitti'yi örtüyor, çünkü tek çıkış kapatma (×).
- Perde koyu temada `rgba(0,0,0,.72)`, açıkta `.45`.
- Kartta görsel var: konunun cam figürü kendi caddesinde ve yanında görev hapı ("Mavi arabaları say"). Bu, iddianın
  ("dikkat bir göreve kilitliyken") görsel karşılığı.
- İddia `text-wrap: balance` ile dengeli; "edilmeyebilir." tek kalmıyor.
- Kaynak Onest 14 px (320'de 13 px) `--ink-2`, iki satır: "Simons & Chabris 1999 · Perception" / "doi 10.1068/p281059".
- Bir yargıcın "'Fark etme' emir gibi okunuyor" notu metin konusu; aşağıdaki ÖNERİ METİN 10'a eklendi.

**ÖNERİ METİN ekleri (tur 2):**
8. 12, KAÇTI ve yanlış tahmin satırı: görsel çözüm (✗ üstü çizili / ✓) var, ama sözlü karşılığı yok. Öneri satır alt
   yazısı: "Sen: sarı · Doğrusu: turuncu". Neden: renk körü ve ekran okuyucu için anlam yalnız işarete kalmasın.
9. 12, TAHMİN rozetinin anlamı tek sözcükle belirsiz. Öneri: rozet "DOĞRU TAHMİN" ya da rozet altında "Görmedim dedin,
   doğru bildin". Neden: kapı r2'de 11 ile çelişkili okundu.
10. Bilim kartı gövdesi (FACTS.gorilla, bugünkü onaylı metin): "Fark etme, beklenmeyen şeyin…" emir gibi okunuyor.
    Öneri: "Beklenmeyen şeyi fark edip etmemek, onun görevdeki nesnelere benzerliğine ve görevin zorluğuna bağlı."
11. 05 süre çizgisi için ekran okuyucu etiketi (3. maddenin yeni yeri): "Değişime 3 saniye" çizgiye bağlanır.

Ekran okuyucu etiketleri ve iki başlık (öneri 1–6) metin kapısından geçti, sahip onayı bekliyor. Yerleri ayrıldı ama
maket içinde kullanılmıyor:
- 11 başlık yuvası (`.ms-head`): Ş1'in yerinde.
- 05 çizgisi: `.tbar` (`aria-hidden`).
- 04 kaçırılan karo: `.tile.miss`.
- 12 kareleri: `.thumb`.
- Kart kapatma: `.pop .x`.

## Ortak karar: üst etiket ilerleme çizgisinin üstünde

"NE DEĞİŞTİ? · 1 / 4", "GÖZÜNDEN KAÇAN · 1 / 2" ve "BUGÜNKÜ TURUN" artık başlığın üstünde tek başına durmuyor. Çarpı
düğmesinin yanında, ilerleme çizgisinin hemen üstünde yer alıyor (`.top .tb`: etiket + 7 px + 6 px çizgi, toplam 44 px).
Bu yerleşim, kapıda iki kez şikâyet edilen "üst çubuk ile başlık arası boşluk" sorununu kaldırıyor. 320'de 20 px dikey
yer de kazandırıyor ve kare büyüyor. Uygulamada bunun için `.sw-top.with-ey` ve `.sw-ey-top` sınıfları zaten var.

## 04 · Sayı sorusu

**Karar.** Yürüyüşün son karesi ekranda kalıyor. Sahne paneli boşalan alanı dolduruyor ve üstünde yürüyüşteki çip
("Mavi arabaları say") ile halka duruyor. Halka bu kez dolu ve içinde ✓ var: "yürüyüş bitti". Panel, yürüyüşün bittiği
noktayı (`vx = L − 480`) gösteriyor; içinden sayılan hedefler ve soru konuları çıkarılmış, sıradan kişiler ve öbür arabalar
yerinde. Böylece sahne cevabı vermiyor ve sonraki soruların konusunu ikinci kez göstermiyor. Soru ve dört sayı tuşu
başparmak bölgesinde, tek satırda; tuşlar oyun tuş takımı gibi büyük ve Unbounded rakamlı. Cevaptan sonra panelin altından
cam bir tepsi yükseliyor ve doğru sayı kadar hedef, gerçek simgesiyle sıraya diziliyor. Kişinin saydıkları ✓ rozetli,
kaçırdığı tam renkli ama kesikli amber çerçeveli. Fazla saydıysa sondaki yer boş ve kesikli. Tuşların yerine sonuç yazısı
(onaylı "Çok yakın." ya da "Tam doğru.") ve onaylı R5 satırı ("Mavi arabalar: 5 geçti, sen 4 dedin") ile Devam geliyor.

**Kapı bulguları ve çözümleri.**
- "Ekranın üçte ikisi boş, form gibi" (4 tur, 20 kişi): boş alan yok. Panel ekranın yaklaşık %69'unu kaplıyor
  (390'da 350 × 583).
- "Yürüyüşten sonra görsel bağ yok" (tur 3–4): aynı cadde, aynı çip, aynı halka.
- "Başparmaktan uzak" (tur 3–4): tuşlar ve Devam altta.
- "Kaçırılan soluk karonun ne olduğu yazmıyor, devre dışı gibi" (tur 2): kaçırılan karo soluk değil, kesikli amber. Onaylı
  R5 cümlesi hemen altında ve "5 geçti, sen 4 dedin" diyerek resmi açıklıyor.
- "Koyu temada karolar parlıyor" (tur 2): karo koyu temada `#3b4754` (orta ton) ve tepsi camı temaya uyuyor.
- "Üç ayrı renk anlamı birden" (tur 1): ekranda aynı anda tek sonuç rengi var. Tam doğru `--ok`, yakın `--lens-text`
  (uygulamada sarı = ödül), uzak düz `--ink`. Kırmızı kullanılmıyor.

**Ölçüler.**
- Panel: `flex: 1`, köşe 24, `xMidYMax slice` (yol ve kaldırım her genişlikte görünür). Kırpım sahne biriminde
  `{ vx: L−480, vy: 196, vw: 480, vh: 614 }`.
- Çip: `--sw-hud` rgba(7,12,18,.82), yazı `#eef3f6` 14 px/700 (kontrast 14,7:1).
- Halka: 44 px, turkuaz `#19c2d1`, ✓ 2,4 px.
- Tuşlar: 4 sütun, ara 10. Yükseklik 72 (320'de 60), köşe 20 (16). Kenar `--sw-key-edge` (açıkta `#d5dde4`, koyuda
  beyaz %14). Yazı Unbounded 28 px (23 px).
- Alt blok: yüksekliği iki hâlin büyüğü kadar (çalışma anında ölçülür), bu yüzden panel cevaptan sonra kıpırdamaz.
- Tepsi: panelin içinde 10 px kenar boşluğuyla. Zemin `color-mix(--surface 84%)`, `backdrop-filter: blur(14px)`, köşe 20.
  Satır başına `n ≤ 3 ? n : ⌈n/2⌉` karo. Karo 3:2; genişlik 390'da ≤ 96, 320'de ≤ 78 px; köşe 14.
  ✓ rozeti 22 px `--accent-graphic`. Kaçırılan karo: `outline 2.5px dashed --lens` ve `--lens-soft` zemin.
- Süreler: tepsi 360 ms; karolar 320 ms, `0,18 + i·0,09` sn gecikmeyle sırayla; rozet 320 ms; tuşlar 320 ms'de solar;
  sonuç 360 ms'de 120 ms gecikmeyle gelir.

## 05 · Ezberleme anı (3 sn)

**Karar.** Süre göstergesi yazısız bir "göz saati". Ortada bir göz duruyor; iki yandaki turkuaz kollar 3 saniye boyunca
göze doğru kapanıyor, göz kapağı kapanır gibi. Son 300 ms'de açık göz yerini kapalı göze bırakıyor. Kare de tam o anda
onaylı göz kırpmasıyla kararıyor (400 ms), yani gösterge ile geçiş tek bir mecaz. Göz saati, 06'da "Bulamadım, bir daha
göster" düğmesinin duracağı alt bloğun ortasında; dokunulacak bir düğme gibi görünmüyor. Kare 05'te ve 06–08'de aynı yerde
ve aynı boyutta. Başlık ve alt satır sabit yükseklikte bir kutuda, kareye yaslanmış duruyor. Başlık bir satır da olsa iki
satır da olsa kare kaymıyor (ölçüldü: 390'da 20,218 · 350 × 438; 320'de 33,137 · 254 × 317; 05 ile 06 birebir aynı).

**Kapı bulguları ve çözümleri.**
- "Kalan süre görünmüyor, ne zaman değişeceğini kestiremiyorum" (tur 4, 5/5): kollar doğrusal biçimde azalıyor.
  `prefers-reduced-motion` açıkken de süre bilgisi olduğu için azalmaya devam ediyor (yalnız doğrusal, yanıp sönme yok).
- "Altta 400 px boşluk" (tur 4): başlık, kare ve alt blok tek grup olarak dikeyde ortalanıyor. Altta yalnız ekran payı
  kalıyor.
- "Ezberlerken dokunmaya yönlendiriliyor; soluk Bulamadım düğmesi bozuk gibi" (tur 3): bu anda düğme yok. Göz saati
  düğmeye benzemiyor.
- "Sahne 05→06'da kayıyor": başlık kutusu sabit; kare geometrisi tek formülden hesaplanıyor.

**Ölçüler.**
- Başlık kutusu `--hh` 92 px (320'de 66). Başlık ve alt satır `margin-top: auto` ile alta yaslanıyor.
- Alt blok `--blk` 110 px (320'de 92).
- Kare genişliği `min(100cqw, (100cqh − hh − blk − 24) × 0,8)`, oran 4:5, köşe 22. Sahne kutusu `container-type: size`.
- Göz saati: kollar 8 px yüksek, köşe 4. İz `--surface-3`, dolgu `--accent-graphic`; sol kol sağdan, sağ kol soldan
  `scaleX(1→0)`, 3 sn doğrusal.
- Göz diski 56 px (320'de 48): `--surface` zemin, kenar `--sw-key-edge`. Çizgi `--ink-2` 1,8 px, iris `--accent-graphic`.
- Açık → kapalı göz geçişi: opaklık, %90–100 aralığında (2,7–3,0 sn, 300 ms).
- Onaylı D4 ("Bu sahnede 12 nesne var") alt satırda kalıyor.

## 09 / 10 / 11 · Gözünden kaçan

**Karar.** Silüet yerine **cam figür** kullanılıyor. Kart, konunun durduğu yerin gerçek sahnesini gösteriyor (aynı cadde,
aynı dükkân, tabela tam). Konu ise orada buzlu bir cam gibi duruyor. Arkasındaki sahne bulanık, renksiz ve kontrastı
düşük görünüyor; kenarında ince beyaz bir çizgi var. "Gözünden kaçan" kişi kelimenin tam anlamıyla görünmez bir adam.
Biçim (kişi + köpek) zaten soruda yazılı. Renk ve nesne görünmüyor, çünkü cam arkasındaki sahneyi %12 doygunlukla ve
sıkıştırılmış kontrastla gösteriyor; konunun kendi renginden tek piksel yok.

Gövde ve bacaklar gerçek oranında, tek parça. Kapıda üç tur şikâyet edilen "kesik bacak", "dikdörtgen gövde" ve "gri kutu"
ortadan kalkıyor. 10'da sorulan parça (köpek) camda turkuaz bir kenar ışığıyla öne çıkıyor; 09'dan farklı olarak "neyi
soruyorum" bilgisini veriyor. 11'de cam, aynı kartta, aynı kırpımla gerçek renkli konuya çapraz geçişle dönüşüyor
(550 ms). Kart zıplamıyor. Sorulan parçanın çevresinde halka beliriyor, iki dalga yayılıyor (07'deki "buldun" diliyle aynı)
ve cevap etiketi "✓ ● sarı" sahnede, köpeğin üstünde açılıyor. Onaylı Ş1 ikiye bölünüp başlık ve alt satır oluyor
("Görmediğini düşünsen de doğru bildin." / "Araştırmalarda bu tür tahminler şanstan daha sık tutuyor."). Kaynağı alt
blokta dipnot olarak duruyor. Gördüm ve Görmedim düğmeleri, alt bloğun tamamını dolduran iki büyük karo (göz ve
kapalı göz simgesiyle).

**Kapı bulguları ve çözümleri.**
- "Silüet kaba, yer tutucu gibi, dikdörtgen gövde, kesik bacak, gri kutu, alt boş" (tur 2–4): gerçek sahne, gerçek oranlı
  cam figür, alt blok sabit ve dolu (09 iki büyük karo, 10 dört seçenek, 11 dipnot + Devam).
- "Renk yuvarlakları tutarsız; siyah koyuda, beyaz açıkta kayboluyor; beyaz önceden seçili gibi" (tur 2–4): her renkte
  aynı halka var (2 px yüzey boşluğu + 1,5 px `--sw-ring #7b8794`). Bu halka beyazda 3,66:1, koyu yüzeyde 4,93:1,
  beyaz yuvarlakta 3,27:1, siyah yuvarlakta 3,73:1 kontrast veriyor. Hiçbir renge ayrı kalınlık yok.
- "11 sert kesme, kart 340→420 zıplıyor" (tur 4): kart üç durumda da birebir aynı (390'da 20,208 · 350 × 466; 320'de
  20,166 · 280 × 275, ölçüldü). Geçişler çapraz: soru 340 ms'de solarken cevap 240 ms'de gelmeye başlıyor, arada boş kare
  yok (tur 3'ün "boş flaş" bulgusu).
- "Cevaptan sonra 'Görmediysen de tahmin et.' kalıyor" (tur 4): 11'de başlık ve alt satır Ş1'e dönüşüyor.
- "Köpek küçük, aha anı paragrafa yükleniyor" (tur 4): halka, dalga ve sahnedeki etiket anı resme taşıyor.
- "Ş1'e kaynak verilmemiş" (tur 3–4): dipnot "Kreitz ve ark. 2020 · Q J Exp Psychol". Bu, uygulamadaki onaylı bilim kartı
  `guess`'in kaynak satırı, aynen.
- "Kırpım özensiz, yarım 'N', kesik araba" (tur 2–3): kırpım tabelanın üstünden başlıyor (`vy = SIGN.top − 6`),
  kişi, köpek ve tabela tam. Dar kartta `xMidYMax slice` tabelayı bütünüyle dışarıda bırakıyor, yarım harf hiçbir
  genişlikte yok. Kırpımda başka kişi ya da araba yok.
- "'1 / 2' ile noktalar çelişiyor" (tur 1–2): yalnız onaylı G1 etiketi kalıyor.

**Ölçüler.**
- Kırpım sahne biriminde `{ vx: x + 34·dir − 100, vy: SIGN.top − 6, vw: 200, vh: 250 }`, `xMidYMax slice`.
- Başlık kutusu `--mh` 112 (320'de 94); başlık ve alt satır alta yaslı.
- Alt blok `--mb` 122 (320'de 104):
  - 09: iki karo, köşe 22, simge 30 px `--accent`.
  - 10: 2 × 2 seçenek, köşe 18, yuvarlak 28 (24).
  - 11: dipnot (JetBrains Mono 12 px `--ink-2`) + Devam 54 (48).
- Cam: maske = `person()` ve köpek (`item dog`) aynı koordinatta tek tona indirilir. Arkadaki sahne
  `feGaussianBlur 3,6` + `saturate .12` + kontrast `slope .45 / intercept .28` ile işlenir; üstüne parlaklık degradesi
  (açık .72→.40, koyu .50→.26) gelir. Kenar: `feMorphology dilate 1,4`.
- Sorulan parça vurgusu: `dilate 2,2` + `blur 3`, `#19C2D1`.
- Halka: r = 38 birim, 3,5 px, `pop` 400 ms (600 ms gecikme). Dalga 900 ms (750 ve 970 ms).
- Etiket: ok kenarlı (2 px `--ok`) beyaz kapsül, 950 ms gecikme, 360 ms.
- Konum: sorulan parçanın halkasının tepesi (`getScreenCTM` ile, kart içinde kenara 10 px kala sınırlanır).
- Başlık (11, 320): 1,12 rem; Ş1'in ilk cümlesi iki satıra sığar.

**Koda aktarırken.** Cam her şablona uygulanır, ama cevabı taşıyan parça maskeden çıkarılır (`silhouetteSVG` kuralıyla
aynı):
- Çalgı, çocuğun elindeki ve satıcının malı çizilmez.
- `shop` ve `stall` şablonlarında konu yerin kendisidir: tabela yazısı boş levha, vitrin malı yok, tente yeşil kalır
  (yeşil soruda yazılı).
- Sorulan parçanın vurgusu için kişide `partBox` (şapka, çanta, atkı…), köpekte ayrı köpek katmanı kullanılır.
- PLAN §5b madde 4'teki "bacak görünmez" ifadesinin amacı cevabı vermemekti. Cam figür renk ve nesne taşımadığı için
  bacak görünüyor; maddenin "silüet ya da cam renk ve nesne göstermez" diye güncellenmesini öneririm.

## 12 · Sonuç ve 12-kart

**Karar.**
- En büyük yazı onaylı S0 ("4 sahnenin 3'ünde buldun").
- Altında turun dört sahnesi gerçek karelerinden **görsel bir özet** olarak dizilir:
  - 390'da 2 × 2, değişen yerin yakın kırpımı.
  - 320'de 1 × 4, karenin tamamı.
- Bulunan sahnede 07'deki turkuaz halka ve ✓ rozeti, bulunamayanda 08'deki kesikli beyaz halka ("burasıydı") var.
- Her karenin köşesinde nesne sayısı yazılı. Ölçünün geldiği sahne (en kalabalık bulunan) mercek sarısı çerçeve, sarı sayı
  rozeti ve tek bir dalgayla öne çıkar. Bu, uygulamada sarının anlamıyla ("ödül") birebir.
- R2'nin "{N} nesne" parçası gösterilmiyor; R2 cümlesi ("Değişikliği 14 nesnenin olduğu kalabalık bir sahnede buldun.")
  sarı kareyi açıklıyor.
- Kutlama yumuşak ve tek seferlik: başlık yükselir, kareler sırayla gelir, halkalar belirir, sarı dalga bir kez yayılır.
  Ses yok, yanıp sönme yok.
- Satırlar iki satırlı:
  - R5 satırının solunda 04'teki görev simgesi var.
  - Gözünden kaçan satırlarının solunda konunun `subjectSVG` küçük resmi var.
  - Kişi bir satırda; cevap (yuvarlak + ad) altında. Etiket sağda.
  - Bu düzen "·" ile başlayan ya da tek kalan sözcük üretmez.
- Bilim kartı kapalı başlar ve Onest 15 px, normal harfle yazılır. Açılınca kart, Bitti düğmesinin hemen üstünde yukarı
  doğru açılır. Satırlar yerinde kalır (yarı saydam perde altında), Bitti hep görünür ve kaynak iki satırda tam okunur
  (320'de de).

**Kapı bulguları ve çözümleri.**
- "14 nesne ile cümle aynı şeyi iki kez söylüyor; 14 nesne puan gibi anlamsız" (tur 1–4): "14" artık bir sahnenin
  etiketi; cümle onu açıklıyor.
- "Görsel yok, kutlama yok, alt üçte bir boş" (tur 4): sahne özeti ve tek seferlik kutlama. 390'da boşluk yalnız Bitti'nin
  üstündeki ekran payı.
- "Satırlar kırılıyor: 'dedin', 'sarı', '·' tek kalıyor; çift boşluk" (tur 1–4): iki satırlı düzen ve `glue`
  (bölünmez boşluk).
- "Kart 320'de Bitti'nin altında kesiliyor, kaynak okunmuyor, satırlar ekrandan çıkıyor" (tur 1–4): kart Bitti'nin
  üstünde açılıyor, sayfa kaymıyor, kaynak `--ink-2` 12–13 px tam görünüyor.
  - Kaynak iki satırda: "Simons & Chabris 1999 · Perception" ve "doi 10.1068/p281059".
  - Parçalar kendi içinde bölünmez; "doi" numarasından kopmaz.
- "DOĞRU MU, EFSANE Mİ? küçük, mono, aralıklı" (tur 3): Onest 15 px/650 ve şişe simgesi.
- "TAHMİN ile YAKIN aynı amber" (tur 1): TAHMİN `--accent`, YAKIN `--lens-text`, KAÇTI `--warn`.

**Ölçüler.**
- S0: Unbounded 1,85 rem/1,1 (320'de 1,35 rem).
- Özet kareleri:
  - 390: 2 sütun, ara 10, oran 170:112, köşe 16. Kırpım 200 birim genişliğinde, halka ortada ve kare görünümünün içinde;
    kırpım tabelanın altından başlar (yarım tabela yok).
  - 320: 4 sütun, ara 7, oran 4:5, köşe 12.
- Halka 2,5 px `#19c2d1`; bulunamayan sahnede beyaz, 5/4 kesikli.
- Sayı rozeti: mono 12–13 px, `rgba(7,12,18,.78)` zeminde `#eef3f6`; en iyide `--lens` zeminde `#2a1600` (8,5:1).
- Satır: min 58 (50) px, köşe 16. Küçük resim 40 × 42. Etiket 11 px/800.
- Açılan kart: alt kenarı Bitti + 14 px; perde `--sw-scrim` (açıkta `rgba(11,18,25,.38)`, koyuda `rgba(0,0,0,.55)`).
  Bitti `z-index` perdenin üstünde.
- Süreler: kareler 340 ms, `0,12 + i·0,1` sn; halka 400 ms; sarı çerçeve 400 ms (0,9 sn); sarı dalga 1 sn (1,05 sn);
  satırlar 320 ms, `0,6 + i·0,08` sn; kart 340 ms; perde 320 ms.

## Hareket ve erişilebilirlik (dört an için ortak)

- Her geçiş tek ve yumuşak (≥ 300 ms); yanıp sönme yok, tekrar eden animasyon yok, ses yok.
- `prefers-reduced-motion`: bütün animasyonlar kalkar ve son hâl doğrudan görünür (varsayılan stiller son hâldir).
  05'in kolları bilgi olduğu için doğrusal azalmaya devam eder.
- Dokunma alanları: tuş 72/60 px, seçenek ≥ 51/48 px, Gördüm ve Görmedim 122/104 px, Devam ve Bitti 54/48 px, çarpı 44,
  kart kapatma 44 px.
- Kontrast: alt satır açıkta 9,65:1, koyuda 11,06:1. "Çok yakın." açıkta 5,0:1, koyuda 10,8:1. ✓ rozeti 6,8:1.
- Renk seçeneklerinde ad ve yuvarlak hep birlikte.
- İki tema ve iki genişlik çekildi; 320'de yatay taşma, kesik yazı ve dikey taşma yok (`cek.mjs` denetimi).

## Koda aktarım notları (StreetWalk.jsx / street.css)

- 04:
  - `count` fazında panel `sceneSVG(street minus hedefler ve konular, { vx: L−480, vy: 196, vw: 480, vh: 614,
    par: 'xMidYMax slice', mode })`.
  - Hedef süzgeci `targetXs` ile aynı kurallardan; konu kişileri `p.id` taşır.
  - Tepsi bugünkü `.sw-tally`'nin yerine geçer.
- 05–08: başlık kutusu ve alt blok sabit (`--hh`, `--blk`), grup `justify-content: center`. 06–08'in başlığı da aynı
  kutuya girer; 07'nin geçmiş düzeni (çip + Devam) değişmez.
- 09–11: `silhouetteSVG` yerine cam katmanı. `subjectSVG` kırpımı yukarıdaki kurala geçer; kart üç adımda aynı DOM
  öğesidir (`key` adımla değişmez, yalnız katmanların opaklığı değişir).
- 12:
  - Özet kareleri `plan.frames` + `changes` ile `makeFrame(...).after`'dan.
  - Satır küçük resimleri `subjectSVG`; görev simgesi `taskIconSVG`.
  - Bilim kartı `sw-scroll`'dan çıkar, Bitti'ye bağlı katman olur (iç kaydırma yok).
  - Gelişim hükmü yuvası (R3/R4, F4) satırlarla bilim kartı arasına girer; 390'da Bitti'nin üstündeki ekran payı bunun
    için yeterli. 320'de satırlar 2 px sıkışır ya da kart kapalı başlığı tek satıra iner (yuva bağlandığında ölçülmeli).

## ÖNERİ METİN (maket içinde kullanılmadı; metin kapısına)

1. **11, "Gördüm" + doğru cevap başlığı.** Ş1 yalnız "Görmedim" + doğru durumu için onaylı. "Gördüm" deyip doğru bilen
   kişide başlık soru olarak kalıyor ve kutlama yazısız. Öneri: "Gözünden kaçmamış." Neden: aha anı her doğru cevapta
   aynı ağırlıkta olsun.
2. **11, yanlış cevap başlığı.** Bugün soru başlıkta kalıyor; iki çip (✗ seçilen, ✓ doğru) gösteriliyor. Öneri:
   "Doğrusu buydu." Neden: geçersiz kalan soru yerine sonuç söylensin (tur 4: "cevaptan sonra soru duruyor").
3. **05 göz saati ekran okuyucu etiketi.** Yazısız gösterge VoiceOver'da sessiz. Öneri `aria-label`: "Değişime 3 saniye".
   Neden: erişilebilirlik; yeni söz olduğu için maket `aria-hidden` kullanıyor.
4. **04 tepsinin ekran okuyucu özeti** (R5 cümlesi okunuyor, ama kaçırılan karonun anlamı okunmuyor). Öneri: "Kaçırdığın
   araba". Neden: görsel anlamın sözlü karşılığı.
5. **12 özet karelerinin ekran okuyucu etiketi.** Öneri: "{i}. sahne · {N} nesne · buldun" / "{i}. sahne · {N} nesne ·
   bulamadın". Neden: görsel özetin sözlü karşılığı. Maket kapsayıcıda S0'ı okutuyor.
6. **Bilim kartını kapatma düğmesi.** Öneri: "Kapat". Maket `aria-label` olarak onaylı "Çık"ı kullanıyor, ama anlamı
   yanlış.
7. **(Gözlem, değişiklik değil.)** Tur 2'de bir yargıç "Köpeği ne renkti?" için "Köpek ne renkti?" önerdi. Metin onaylı,
   aynen kullanıldı; metin kapısının bilgisine.

## Kullanılan onaylı metin (hepsi `streetText.js`'ten, harfi harfine)

- Ortak: ui.exit, ui.progress, ui.next.
- 04: task.blueCar, count.blueCar, count.near, count.exact, R5.move.diff/same.
- 05/06: D1, B1, D2, D3, D4, D5.
- 09–11: G1, G2, G3, G4, G5, Ş1 (iki cümleye bölündü, harfler aynı) ve FACTS.guess.ref (bugünkü bilim kartı kaynağı).
- Seçenek ve satırlar: renk adları, who.dogwalker, who.helmet.
- 12: R1, S0.3, R2 (yalnız cümle), R5.tags, R6, fact.head, FACTS.gorilla (iddia, cevap, gövde, kaynak).
