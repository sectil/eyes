# Metin Arama · kaynaklar (aşama 1, 2026-10-01)

Her PMID ve DOI bu oturumda PubMed aracıyla çekildi (`get_article_metadata`). Ezberden yazılmadı. Bulgu satırları
yalnız PubMed özetinde yazanı söyler; özeti olmayan kayıtlarda yalnız başlık kullanılır.

## A. Alıştırmanın bilimsel temeli

| Anahtar | Kaynak | PMID | DOI | Bize ne söyler |
|---|---|---|---|---|
| treisman1980 | Treisman AM, Gelade G. A feature-integration theory of attention. Cogn Psychol 1980;12(1):97-136 | 7351125 | 10.1016/0010-0285(80)90005-5 | Görsel aramanın temel kuramı. Özet yok; yalnız başlıkla anılır |
| duncan1989 | Duncan J, Humphreys GW. Visual search and stimulus similarity. Psychol Rev 1989;96(3):433-58 | 2756067 | 10.1037/0033-295x.96.3.433 | Hedef ile çeldiricinin benzerliği aramayı zorlaştırır. Özet yok; zorluk basamağının dayanağı başlık düzeyinde |
| wolfe1994 | Wolfe JM. Guided Search 2.0. Psychon Bull Rev 1994;1(2):202-38 | 24203471 | 10.3758/BF03200774 | Dikkat, önce paralel işlenen özelliklerle yönlendirilir; okuma gibi karmaşık işler dar bir alanda yapılır |
| wolfe2017 | Wolfe JM, Horowitz TS. Five factors that guide attention in visual search. Nat Hum Behav 2017;1(3) | 36711068 | 10.1038/s41562-017-0058 | Aramayı beş etken yönlendirir: belirginlik, aranan özellik, sahnenin yapısı ve anlamı, geçmiş arama, değer |
| wolfe2021 | Wolfe JM. Guided Search 6.0. Psychon Bull Rev 2021;28(4):1060-1092 | 33547630 | 10.3758/s13423-020-01859-9 | Hedef bellekteki şablonla karşılaştırılır; hedef yoksa arama, biriken bir "bırak" sinyali eşiğe ulaşınca biter |
| chun1996 | Chun MM, Wolfe JM. Just say no. Cogn Psychol 1996;30(1):39-78 | 8635311 | 10.1006/cogp.1996.0002 | Hedef yokken kişi aramayı uyarlanır bir eşikle bitirir; kaçırmadan sonra daha temkinli olur. "Metinde yok" turlarının dayanağı |
| rayner1996 | Rayner K, Fischer MH. Mindless reading revisited. Percept Psychophys 1996;58(5):734-47 | 8710452 | 10.3758/bf03213106 | Okurken ve metinde hedef ararken göz hareketleri farklıdır |
| rayner-raney1996 | Rayner K, Raney GE. Eye movement control in reading and visual search: effects of word frequency. Psychon Bull Rev 1996;3(2):245-8 | 24213875 | 10.3758/BF03212426 | Metinde kelime ararken, okumadaki sözcük sıklığı etkisi görülmez: arama okumadan ayrı bir iştir |
| rayner1998 | Rayner K. Eye movements in reading and information processing: 20 years of research. Psychol Bull 1998;124(3):372-422 | 9849112 | 10.1037/0033-2909.124.3.372 | Okuma ve görsel aramada göz hareketlerinin derlemesi |
| sireteanu1995 | Sireteanu R, Rettenbach R. Perceptual learning in visual search: fast, enduring, but non-specific. Vision Res 1995;35(14):2037-43 | 7660607 | 10.1016/0042-6989(94)00295-w | Görsel aramada alıştırmayla öğrenme hızlı ve kalıcıdır; birkaç yüz denemede yavaş arama hızlanabilir |
| pambakian2004 | Pambakian AL ve ark. Saccadic visual search training. J Neurol Neurosurg Psychiatry 2004;75(10):1443-8 | 15377693 | 10.1136/jnnp.2003.025957 | 29 hastada 20 günlük arama alıştırması: tepki süresi kısaldı. Hız ile doğruluk arasında takas görüldü. Hasta grubu; bizde yalnız "alıştırmayla arama süresi kısalır" ve "hız–doğruluk takası" için |
| rayner2016 | Rayner K ve ark. So much to read, so little time. Psychol Sci Public Interest 2016;17(1):4-34 | 26769745 | 10.1177/1529100615623267 | Hızlı okuma uygulamaları anlamayı korurken hızı katlayamaz. **İddia sınırımız:** bu alıştırma okuma hızını artırır demeyiz |

### Tasarıma çıkan sonuçlar
1. **Ölçü bulma süresidir, doğrulukla birlikte.** Alıştırmayla arama süresi kısalır (sireteanu1995, pambakian2004);
   ama hız–doğruluk takası var (pambakian2004). Süre yalnız doğru bulunan kelimelerden hesaplanır; yanlış dokunuş
   ayrı sayılır.
2. **"Metinde yok" turları gerekir.** Hedef her zaman varsa kişi tahmin eder; yokluğa karar vermek aramanın asıl
   parçasıdır (chun1996, wolfe2021).
3. **Zorluk benzerlikle artar, uzunlukla değil yalnız.** Aynı kökün başka ekli biçimleri çeldirici olur: "Türkiye'de"
   ararken "Türkiye'nin", "Türkiye" (duncan1989). Türkçenin ekleri bunu doğal kılar.
4. **Okuma iddiası yok.** Arama okumadan ayrı bir iştir (rayner1996, rayner-raney1996); hızlı okuma vaadi bilimle
   uyuşmaz (rayner2016). Kart cümlesi: "Bu bir arama alıştırması; okuma hızını artırdığı gösterilmedi."

## B. Metin adayları (PubMed'den ilgi çekici, sağlık iddiası taşımayan bulgular)

Seçim ölçütü: hayvan, bitki ve beden merakı; hastalık, ilaç, korku yok; bulgu özette açıkça yazıyor. Metinler bu
bulguların Nefona'nın kendi Türkçesiyle 50–70 kelimelik anlatımı olacak; özet çevrilmez, cümle kopyalanmaz.

| Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|
| howard2018 | Howard SR ve ark. Numerical ordering of zero in honey bees. Science 2018;360(6393):1124-1126 | 29880690 | 10.1126/science.aar4975 | "Azdan çoğa" öğretilen bal arıları boş kartı en küçüğe koydu: sıfırı sıralayabildiler |
| kabadayi2017 | Kabadayi C, Osvath M. Ravens parallel great apes in flexible planning. Science 2017;357(6347):202-204 | 28706072 | 10.1126/science.aam8138 | Kuzgunlar 17 saate kadar sonrası için alet ve takas planı yaptı, kendini tuttu |
| pardo2024 | Pardo MA ve ark. African elephants address one another with name-like calls. Nat Ecol Evol 2024;8(7):1353-1364 | 38858512 | 10.1038/s41559-024-02420-w | Afrika filleri birbirine kişiye özgü, ada benzer seslerle sesleniyor; kendi adlarına daha çok tepki verdiler |
| ishiyama2016 | Ishiyama S, Brecht M. Neural correlates of ticklishness in the rat. Science 2016;354(6313):757-760 | 27846607 | 10.1126/science.aah5114 | Gıdıklanan sıçanlar ultrasonik ses çıkardı, ele yaklaştı, sevinç sıçramaları yaptı |
| reinhold2019 | Reinhold AS ve ark. Hide-and-seek in rats. Science 2019;365(6458):1180-1183 | 31515395 | 10.1126/science.aax4705 | Sıçanlar ödül yemeği olmadan saklambacı çabuk öğrendi; saklanırken sessiz kaldı, opak saklanma yerini seçti |
| khait2023 | Khait I ve ark. Sounds emitted by plants under stress. Cell 2023;186(7):1328-1336 | 37001499 | 10.1016/j.cell.2023.03.009 | Susuz kalan ya da kesilen domates ve tütün bitkileri havadan kaydedilebilen ultrasonik sesler çıkardı |
| dolensek2020 | Dolensek N ve ark. Facial expressions of emotion states in mice. Science 2020;368(6486):89-94 | 32241948 | 10.1126/science.aaz9468 | Farelerin yüzünde duruma göre değişen, makineyle ayırt edilebilen kalıp ifadeler var |
| medeiros2021 | Medeiros SLS ve ark. Cyclic alternation of quiet and active sleep states in the octopus. iScience 2021;24(4):102223 | 33997665 | 10.1016/j.isci.2021.102223 | Ahtapot uykusunda soluk "sakin" evre ile renkli, gözleri kıpır kıpır "hareketli" evre sırayla geliyor; hareketli evre yaklaşık 30 dakikada bir |
| andics2016 | Andics A ve ark. Neural mechanisms for lexical processing in dogs. Science 2016;353(6303):1030-1032 | 27576923 | 10.1126/science.aaf3777 | Köpekler kelimenin anlamını ve ses tonunu ayrı işliyor; ödül tepkisi ikisi de övgü olunca çıktı. Metinde "beyin" sözcüğü kullanılmaz |
| shwartz2020 | Shwartz Y ve ark. Cell types promoting goosebumps. Cell 2020;182(3):578-593 | 32679029 | 10.1016/j.cell.2020.06.031 | Tüyleri diken diken eden kas ve sinir, farede kıl kök hücrelerini de yönetiyor. Fare çalışması; insan için iddia yok |

| kohda2019 | Kohda M ve ark. If a fish can pass the mark test… PLoS Biol 2019;17(2):e3000021 | 30730878 | 10.1371/journal.pbio.3000021 | Temizlikçi balık ayna testinin aşamalarını geçer gibi davrandı; renkli işareti aynada görünce bedenini sürterek silmeye çalıştı. Yorumu tartışmalı: metin "kendini bilir" demez |
| saito2019 | Saito A ve ark. Domestic cats discriminate their names from other words. Sci Rep 2019;9(1):5394 | 30948740 | 10.1038/s41598-019-40616-4 | Ev kedileri kendi adlarını sıradan sözcüklerden ve evdeki öbür kedilerin adlarından ayırdı; kedi kafedeki kediler öbür kedilerin adlarından ayıramadı |
| nawroth2018 | Nawroth C ve ark. Goats prefer positive human emotional facial expressions. R Soc Open Sci 2018;5(8):180491 | 30225038 | 10.1098/rsos.180491 | Keçiler önce gülen yüze gitti ve onunla daha uzun ilgilendi; etki gülen yüz sağdayken görüldü |
| kareklas2013 | Kareklas K ve ark. Water-induced finger wrinkles improve handling of wet objects. Biol Lett 2013;9(2):20120999 | 23302867 | 10.1098/rsbl.2012.0999 | Buruşuk parmaklarla su içindeki nesneler daha hızlı taşındı; kuru nesnelerde fark yoktu |
| porter2007 | Porter J ve ark. Mechanisms of scent-tracking in humans. Nat Neurosci 2007;10(1):27-9 | 17173046 | 10.1038/nn1819 | İnsanlar koku izi sürebildi ve alıştırmayla iyileşti; burun delikleri yaklaşık 3,5 cm ayrı bölgeden örnek alıyor |
| hashimoto2016 | Hashimoto T ve ark. Extremotolerant tardigrade genome… Nat Commun 2016;7:12808 | 27649274 | 10.1038/ncomms12808 | Dayanıklı bir su ayısı türünün genomu: hasar yollarının kaybı, onarım gen ailelerinin çoğalması, türe özgü proteinler. İnsan hücresi bulgusu metne alınmadı |
| king2013 | King SL, Janik VM. Bottlenose dolphins can use learned vocal labels to address each other. PNAS 2013;110(32):13216-21 | 23878217 | 10.1073/pnas.1304459110 | Yabani yunuslar kendi imza ıslıklarının kopyasını duyunca karşılık verdi, başkalarınınkine vermedi |
| vangiesen2020 | van Giesen L ve ark. Molecular basis of chemotactile sensation in octopus. Cell 2020;183(3):594-604 | 33125889 | 10.1016/j.cell.2020.09.008 | Ahtapot kolları dokunarak tat alan alıcılar taşıyor; suda zor çözünen maddeleri temasla algılıyor; kollar görece bağımsız davranıyor |
| nath2017 | Nath RD ve ark. The jellyfish Cassiopea exhibits a sleep-like state. Curr Biol 2017;27(19):2984-2990 | 28943083 | 10.1016/j.cub.2017.08.014 | Ters denizanası gece atımlarını seyreltiyor, uyarıya geç tepki veriyor ama çabuk toparlanıyor; gece uyutulmayınca ertesi gün daha durgun |
| bohm2016 | Böhm J ve ark. The Venus flytrap counts prey-induced action potentials… Curr Biol 2016;26(3):286-95 | 26804557 | 10.1016/j.cub.2015.11.057 | İki uyarıdan sonra kapan kapanıyor, üçten fazlasında sindirim genleri çalışıyor; gen etkinliği uyarı sayısıyla artıyor |
| johnson1991 | Johnson MH ve ark. Newborns' preferential tracking of face-like stimuli and its subsequent decline. Cognition 1991;40(1-2):1-19 | 1786670 | 10.1016/0010-0277(91)90045-6 | Yaşamın ilk saatindeki bebekler yüze benzeyen çizimi daha uzağa kadar izledi; iki doğumevinde yinelendi; ikinci ayda azaldı |
| watanabe1995 | Watanabe S ve ark. Pigeons' discrimination of paintings by Monet and Picasso. J Exp Anal Behav 1995;63(2):165-74 | 16812755 | 10.1901/jeab.1995.63-165 | Güvercinler iki ressamı ayırmayı öğrendi, yeni tablolara ve benzer ressamlara genelledi; ters çevrilen Monet tabloları ayırmayı bozdu |
| newport2016 | Newport C ve ark. Discrimination of human faces by archerfish. Sci Rep 2016;6:27523 | 27272551 | 10.1038/srep27523 | Okçu balıkları 44 insan yüzü arasından öğrendikleri yüzü seçebildi; renk, kafa biçimi ve parlaklık eşitlenince de başardı |
| smith2016 | Smith AV ve ark. Functionally relevant responses to human facial expressions of emotion in the domestic horse. Biol Lett 2016;12(2):20150907 | 26864784 | 10.1098/rsbl.2015.0907 | Atlar kızgın yüze daha çok sol gözle baktı ve kalp atışları daha hızlı yükseldi |

Aşama 2'de eklenen 14 kaynak da aynı araçla doğrulandı (2026-10-02). Kohda 2019 için ilk aramada yanlış PMID dönmüştü;
doğru kayıt PLoS Biol'dan çekildi.

Elenen: Caro 2019 zebra çizgileri, birden çok kayıtla eşleşti. Thaler 2011 körlerde ekoyla yön bulma: bulgu beyin
görüntülemesine dayanıyor ve hasta grubu, metin için uygun değil. Frank 2024 karıncalarda bacak kesme: korkutucu
olabilir. Inoue 2007 şempanze sayı belleği: PubMed'de özet yok. Liao 2024 karga sayma: PubMed'de bulunamadı.

Havuz: 24 metin, her tur 2 metin, 12 gün tekrar yok.
