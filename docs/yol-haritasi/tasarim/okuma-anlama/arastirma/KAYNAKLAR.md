# Okuma ve Anlama · kaynaklar (aşama 1, 2026-10-01)

Her PMID ve DOI bu oturumda PubMed aracıyla çekildi (`get_article_metadata`). Ezberden yazılmadı. Bulgu satırı yalnız
PubMed özetinde yazanı söyler.

## A. Ölçümün bilimsel temeli

| Anahtar | Kaynak | PMID | DOI | Bize ne söyler |
|---|---|---|---|---|
| rayner2016 | Rayner K ve ark. So much to read, so little time. Psychol Sci Public Interest 2016;17(1):4-34 | 26769745 | 10.1177/1529100615623267 | Hız ile doğruluk arasında takas var. Anlamayı koruyarak hızı ikiye üçe katlamak olası değil. Anlamayı koruyup daha hızlı okumanın yolu okuma alıştırması ve dil becerisi. **İddia sınırımız:** "hızlı okuma öğretir" demeyiz |
| kuperman2021 | Kuperman V ve ark. Reading rate and most efficient listening rate are highly similar. J Exp Psychol Hum Percept Perform 2021;47(8):1103-1112 | 34516216 | 10.1037/xhp0000932 | Sessiz okuma hızı sanılandan düşük: bir derlemeye göre ortalama 240–260 k/dk; bu çalışmada aynı metinlerde 269 k/dk. Dürüst üst sınır kontrolü için dayanak |
| miyata2012 | Miyata H ve ark. Reading speed, comprehension and eye movements while reading Japanese novels. PLoS One 2012;7(5):e36091 | 22590519 | 10.1371/journal.pone.0036091 | Hızlı okuma kursiyerleri daha hızlı okudu ama doğru-yanlış sorularında daha düşük anladı. Hız tek başına "iyi" sayılmaz kuralının dayanağı; okuma hemen ardından doğru-yanlış soruları yöntemi |
| trauzettel2012 | Trauzettel-Klosinski S, Dietz K. Standardized assessment of reading performance: IReST. Invest Ophthalmol Vis Sci 2012;53(9):5452-61 | 22661485 | 10.1167/iovs.11-8284 | Tekrar ölçüm için çok sayıda eşdeğer metin gerekir; uzunluk, içerik, zorluk ve dil yapısı eşlenir; tek cümle yerine paragraf. Eşlenen metinlerde kişi içi değişkenlik yalnız %11,5. 17 dilde ortalama 184 k/dk, sesli. Metin bankasının eşdeğerlik kuralının dayanağı |
| hairol2026 | Hairol MI ve ark. Malay sentences for the Radner-UKM reading charts. Sci Rep 2026;16(1) | 42303798 | 10.1038/s41598-026-58439-5 | Radner okuma kartlarının Türkçe sürümü var; eşdeğer cümle seçimi okuma süresi ± 0,25 SD ile yapılıyor. Metinlerin pilotla süzülmesi için yöntem örneği |
| schneps2013 | Schneps MH ve ark. Shorter lines facilitate reading in those who struggle. PLoS One 2013;8(8):e71161 | 23940709 | 10.1371/journal.pone.0071161 | Satır uzunluğu okuma hızını değiştirir. Telefonda düzen her seferinde aynı olmalı, yoksa hız günden güne aynı işi ölçmez |

### Tasarıma çıkan sonuçlar
1. **Hız ve anlama birlikte.** Hız yalnız anlama eşiği geçilirse ölçü serisine girer (miyata2012, rayner2016).
2. **Eşdeğer metinler.** Her metin aynı uzunluk bandında, aynı zorluk ve yapıda; düzen sabit (trauzettel2012, schneps2013).
3. **Gerçekçi sınır.** 600 k/dk üstü ve çok kısa okuma süresi "göz gezdirme" sayılır, seriye girmez (kuperman2021,
   rayner2016). VARSAYIM: eşik 600; pilotla kesinleşir.
4. **İddia yok.** "Okuma hızını artırır" yazılmaz; yalnız "okuma hızını ve anladığını birlikte izler".

## B. Metin kaynakları, takım 1 (`banka/taslak-01.json`)

Her satır bu oturumda `get_article_metadata` ile çekildi. Bulgu sütunu yalnız özette yazanı söyler.

| Metin | Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|---|
| oa001 | dacke2013 | Dacke M ve ark. Dung beetles use the Milky Way for orientation. Curr Biol 2013;23(4):298-300 | 23352694 | 10.1016/j.cub.2012.12.034 | Gübre böcekleri yıldızlı gökte düz yol alıyor, bulutta alamıyor; planetaryumda yalnız Samanyolu ile de aynı başarı |
| oa002 | saito2019 | Saito A ve ark. Domestic cats discriminate their names from other words. Sci Rep 2019;9(1):5394 | 30948740 | 10.1038/s41598-019-40616-4 | Ev kedileri kendi adlarını sıradan sözcüklerden ve öteki kedilerin adlarından ayırıyor; kafe kedileri yalnız sıradan sözcüklerden |
| oa003 | fernandez2021 | Fernandez AA ve ark. Babbling in a vocal learning bat resembles human infant babbling. Science 2021;373(6557):923-926 | 34413237 | 10.1126/science.abf9279 | 20 yavru, 3 aylık gelişim; bebek hecelemesinin 8 özelliğinin hepsi var |
| oa004 | schnell2021 | Schnell AK ve ark. Cuttlefish exert self-control in a delay of gratification task. Proc Biol Sci 2021;288(1946):20203161 | 33653135 | 10.1098/rspb.2020.3161 | Mürekkep balıkları daha iyi yiyecek için 50–130 sn bekledi; uzun bekleyenler yeniden öğrenmede daha iyi |
| oa005 | wathan2016 | Wathan J ve ark. Horses discriminate between facial expressions of conspecifics. Sci Rep 2016;6:38322 | 27995958 | 10.1038/srep38322 | Atlar olumlu ifadeli fotoğraflara yaklaştı, saldırgandan kaçındı; kalp atışı farklı değişti |
| oa006 | laumer2024 | Laumer IB ve ark. Active self-treatment of a facial wound with a biologically active plant by a male Sumatran orangutan. Sci Rep 2024;14(1):8932 | 38698007 | 10.1038/s41598-024-58988-7 | Yaralanmadan 3 gün sonra yaprak çiğneyip suyunu yarasına sürdü, sonra yaprakla kapattı. Not: metinde bitkinin tıbbi kullanımı anlatılmaz |
| oa007 | nawroth2018 | Nawroth C ve ark. Goats prefer positive human emotional facial expressions. R Soc Open Sci 2018;5(8):180491 | 30225038 | 10.1098/rsos.180491 | Keçiler önce gülen yüze gitti; tercih gülen yüz sağdayken belirgin, soldayken yok |
| oa008 | scarf2016 | Scarf D ve ark. Orthographic processing in pigeons. PNAS 2016;113(40):11272-11276 | 27638211 | 10.1073/pnas.1607870113 | Güvercinler sözcükleri anlamsız dizilerden ayırdı, yeni sözcükleri tanıdı, harf çifti sıklığına duyarlıydı |
| oa009 | newport2016 | Newport C ve ark. Discrimination of human faces by archerfish. Sci Rep 2016;6:27523 | 27272551 | 10.1038/srep27523 | 44 yüz; renk, baş biçimi, parlaklık eşitlenince 18 yüz, yüksek doğruluk |
| oa009 | newport2020 | Newport C, Schuster S. Archerfish vision. Semin Cell Dev Biol 2020;106:53-60 | 32522409 | 10.1016/j.semcdb.2020.05.017 | Yalnız "su fışkırtarak avlanır" cümlesinin dayanağı |
| oa010 | king2013 | King SL ve ark. Vocal copying of individually distinctive signature whistles in bottlenose dolphins. Proc Biol Sci 2013;280(1757):20130053 | 23427174 | 10.1098/rspb.2013.0053 | Kopyalar yakın yunuslar arasında, ayrı düşünce; kavga yok; kopya hafif değiştirilmiş |

Metin Arama oturumunun doğruladığı 10 bulgu (`claude/metin-arama`, `metin-arama/arastirma/KAYNAKLAR.md`) bu
takımda kullanılmadı. Ortak banka kararı ana oturumda.

## B3. Metin kaynakları, takım 3 (`banka/taslak-03.json`)

Her satır bu oturumda `get_article_metadata` ile çekildi. Bulgu sütunu yalnız özette yazanı söyler. Konu alanı:
deniz, surungen, insan, memeli.

| Metin | Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|---|
| oa021 | kohda2022 | Kohda M ve ark. Further evidence for the capacity of mirror self-recognition in cleaner fish and the significance of ecologically relevant marks. PLoS Biol 2022;20(2):e3001529 | 35176032 | 10.1371/journal.pbio.3001529 | 14/14 yeni balık kahverengi lekede yalnız ayna varken boğazını kazıdı; mavi, yeşil leke etkisiz; başka balıktaki leke etkisiz; aynayı görmemişler daha az kazıdı |
| oa022 | bshary2006 | Bshary R ve ark. Interspecific communicative and coordinated hunting between groupers and giant moray eels in the Red Sea. PLoS Biol 2006;4(12):e431 | 17147471 | 10.1371/journal.pbio.0040431 | Kızıldeniz gözlemi; lahos mürene işaret verip ortak aramaya çağırıyor, av yerini gösteriyor; işaret açlığa bağlı; iki taraf kazançlı; avı yakalayan bütün yutuyor |
| oa023 | godfreysmith2022 | Godfrey-Smith P ve ark. In the line of fire: Debris throwing by wild octopuses. PLoS One 2022;17(11):e0276482 | 36350820 | 10.1371/journal.pone.0276482 | Avustralya'da bir koyda ahtapotlar kabuk, çamur, yosunu huniden su akımıyla atıyor; etkileşimde atışlar güçlü, daha çok çamur, sık çarpıyor; güçlü atışta koyu ya da tek renkli desen |
| oa024 | boles2003 | Boles LC, Lohmann KJ. True navigation and magnetic maps in spiny lobsters. Nature 2003;421(6918):60-3 | 12511953 | 10.1038/nature01226 | 12–37 km uzağa taşınan ıstakozlar yakalandıkları yere döndü; kuzey alanında güneye, güney alanında kuzeye yöneldi |
| oa025 | wilkinson2010 | Wilkinson A ve ark. Gaze following in the red-footed tortoise (Geochelone carbonaria). Anim Cogn 2010;13(5):765-9 | 20411292 | 10.1007/s10071-010-0320-2 | Kaplumbağa yukarı bakma görevinde türdeşinin bakışını izledi; yalnız türdeşin varlığı ya da gösterici olmadan ışık bunu açıklamadı |
| oa026 | putman2011 | Putman NF ve ark. Longitude perception and bicoordinate magnetic maps in sea turtles. Curr Biol 2011;21(6):463-6 | 21353561 | 10.1016/j.cub.2011.01.057 | Florida'dan iribaş kaplumbağa yavruları Atlas'ın iki yakasında aynı enlemdeki alanlarda farklı yönlere, göç yolunu ilerletecek biçimde yüzdü; boylamın manyetik olarak okunduğunun ilk kanıtı |
| oa027 | kis2014 | Kis A ve ark. Social learning by imitation in a reptile (Pogona vitticeps). Anim Cogn 2014 (çevrimiçi; baskı 2015);18(1):325-31 | 25199480 | 10.1007/s10071-014-0803-7 | Sakallı ejderler kapağı gösterilen yana açtı; kapağın kendiliğinden açıldığını izleyen grup başaramadı |
| oa028 | hajnal2022 | Hajnal A, Durgin FH. How frequent is the spontaneous occurrence of synchronized walking in daily life? Exp Brain Res 2022 (çevrimiçi; baskı 2023);241(2):469-478 | 36576509 | 10.1007/s00221-022-06536-y | Yaya yolu videoları; 498 çiftin yaklaşık %6'sı sürekli senkron; farklı kişiler farklı adım oranı tercih ediyor, birlikte yürüyenler oranı birbirine biraz yaklaştırıyor olabilir |
| oa029 | porter2006 | Porter J ve ark. Mechanisms of scent-tracking in humans. Nat Neurosci 2006 (çevrimiçi; baskı 2007);10(1):27-9 | 17173046 | 10.1038/nn1819 | İnsanlar koku izi sürebiliyor, alıştırmayla gelişiyor; burun delikleri yaklaşık 3,5 cm ayrı bölgeden koku alıyor; delikler arası karşılaştırma iz sürmeye yardım ediyor |
| oa030 | delgado2017 | Delgado MM, Jacobs LF. Caching for where and what: evidence for a mnemonic strategy in a scatter-hoarder. R Soc Open Sci 2017;4(9):170958 | 28989788 | 10.1098/rsos.170958 | 45 yabani tilki sincabı, 4 türden 16 kuruyemiş; GPS ile harita; türe göre gruplama yalnız hepsi tek noktadan alındığında |

Not: oa029'un ilk cümlesi bir çerçeve cümlesidir, çalışmanın iddiası değildir. oa022'de "lahos" adı İngilizce
"grouper" karşılığı olarak kullanıldı.

## B2. Metin kaynakları, takım 2 (`banka/taslak-02.json`)

Her satır bu oturumda `get_article_metadata` ile çekildi. Bulgu sütunu yalnız özette yazanı söyler. Konu alanı:
`bocek`, `kus`, `bitki`, `mikro`.

| Metin | Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|---|
| oa011 | alem2016 | Alem S ve ark. Associative mechanisms allow for social learning and cultural transmission of string pulling in an insect. PLoS Biol 2016;14(10):e1002564 | 27701411 | 10.1371/journal.pbio.1002564 | Bombus arılarının azı ipi kendiliğinden çekti, çoğu adım adım öğrendi; izleyerek öğrenme; kavrayış değil deneme-yanılma; beceri tek arıdan toplayıcıların çoğuna, art arda öğrenen kuşaklarıyla yayıldı |
| oa012 | liao2024 | Liao DA ve ark. Crows "count" the number of self-generated vocalizations. Science 2024;384(6698):874-877 | 38781375 | 10.1126/science.adl0984 | Kargalar sayıyla eşlenmiş işaretlere göre 1–4 ses çıkardı; ilk sesin yapısı toplam sayıyı öngördü, ses yapısı sırayı ve sayma hatalarını gösterdi |
| oa013 | veits2019 | Veits M ve ark. Flowers respond to pollinator sound within minutes by increasing nectar sugar concentration. Ecol Lett 2019;22(9):1483-1492 | 31286633 | 10.1111/ele.13331 | Arı sesi ya da benzer frekansta yapay ses: 3 dk içinde daha tatlı nektar; çiçek titreşti; yüksek frekansta ne titreşim ne tepki |
| oa014 | dexter2019 | Dexter JP ve ark. A complex hierarchy of avoidance behaviors in a single-cell eukaryote. Curr Biol 2019;29(24):4323-4329.e2 | 31813604 | 10.1016/j.cub.2019.10.059 | 1906 gözlemi doğru türle doğrulandı: eğilme, kirpik değişimi, büzülme ya da kopma sırası; büzülme-kopma seçimi yazı tura gibi; bireysel farklar büyük |
| oa015 | wittlinger2006 | Wittlinger M, Wehner R, Wolf H. The ant odometer: stepping on stilts and stumps. Science 2006;312(5782):1965-7 | 16809544 | 10.1126/science.1126912 | Bacağı uzatılan çöl karıncaları mesafeyi fazla, kısaltılanlar az tahmin etti; adım sayacı varsayımı |
| oa016 | klump2021 | Klump BC ve ark. Innovation and geographic spread of a complex foraging culture in an urban parrot. Science 2021;373(6553):456-460 | 34437121 | 10.1126/science.abe7808 | Sidney'de sarı tepeli kakaduların çöp kutusu açması 3 semtten 44'e sosyal öğrenmeyle yayıldı; 160 gözlemde bireysel biçimler ve yerel farklar |
| oa017 | atamian2016 | Atamian HS ve ark. Circadian regulation of sunflower heliotropism, floral orientation, and pollinator visits. Science 2016;353(6299):587-90 | 27493185 | 10.1126/science.aaf9793 | Genç ayçiçeği güneşi izler, gece doğuya döner; olgunu doğuya bakar; iç saat düzenler; gövdenin iki yanı sırayla uzar; büyüme ve tozlaşmacı ziyareti artar |
| oa018 | kramar2021 | Kramar M, Alim K. Encoding memory in tube diameter hierarchy of living flow network. Proc Natl Acad Sci U S A 2021;118(10) | 33619174 | 10.1073/pnas.2007815118 | Balçık mantarı besin yerini tüp kalınlık düzeninde saklar; yumuşatıcı madde akışla taşınır, çok alan tüp genişler; sonraki göç besine yönelir |
| oa019 | dong2023 | Dong S ve ark. Social signal learning of the waggle dance in honey bees. Science 2023;379(6636):1015-1018 | 36893231 | 10.1126/science.ade1702 | Dans izleyemeyen arıların ilk dansları düzensiz, yön ve uzaklık hatalı; düzensizlik ve yön deneyimle düzeldi, uzaklık ömür boyu kaldı |
| oa020 | aplin2014 | Aplin LM ve ark. Experimentally induced innovations lead to persistent culture via conformity in wild birds. Nature 2014;518(7540):538-41 | 25470065 | 10.1038/nature13998 | Toplulukta 2 eğitilmiş baştankaradan ortalama %75'e yayılma; 414 kuş, 57.909 çözüm; tanıtılan yöntem iki kuşak sürdü; en yaygın yönteme uyma. Not: `yil` PubMed yayın tarihinden, 2014 |

## B5. Metin kaynakları, takım 5 (`banka/taslak-05.json`)

Her satır bu oturumda `get_article_metadata` ile çekildi. Bulgu sütunu yalnız özette yazanı söyler. Konu alanı:
kus, surungen, deniz, memeli.

| Metin | Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|---|
| oa041 | otter2020 | Otter KA ve ark. Continent-wide shifts in song dialects of white-throated sparrows. Curr Biol 2020;30(16):3231-3235.e3 | 32619475 | 10.1016/j.cub.2020.05.084 | Üçlü notayla biten şarkı 1960'larda Kanada'da her yerde; ikili sonlu şarkı önce Kayalık Dağlar'ın batısında yerini aldı, 20 yıllık kayıtlarda kıtaya yayılmış; konum aygıtı: batı ve orta Kanada kuşları birlikte kışlıyor; kışlakta öğrenme olası; nadirden tek şarkıya |
| oa042 | bastos2020 | Bastos APM, Taylor AH. Kea show three signatures of domain-general statistical inference. Nat Commun 2020;11(1):828 | 32127523 | 10.1038/s41467-020-14695-1 | Kealar örnekleme tahmininde oranları kullandı, engel bilgisini ve deneycinin taraflı seçimini kattı; istatistiksel akıl yürütmenin üç işareti; büyük maymunlar dışında kanıt. Not: 32499478 bu makalenin eki, kullanılmadı |
| oa043 | osunamascaro2023 | Osuna-Mascaró AJ ve ark. Flexible tool set transport in Goffin's cockatoos. Curr Biol 2023;33(5):849-857.e4 | 36773605 | 10.1016/j.cub.2023.01.023 | Doğada alet takımı yalnız şempanze ve Goffin kakadusunda; bakım altında 3 deney, termit çıkarmadan esinli görev; bazı kakadular yeni takımı buldu, esnekçe kullandı ve hemen kullanmak için taşıdı |
| oa044 | hedenstrom2016 | Hedenström A ve ark. Annual 10-month aerial life phase in the common swift Apus apus. Curr Biol 2016;26(22):3066-3070 | 28094028 | 10.1016/j.cub.2016.09.014 | Ebabil yiyecek ve yuva malzemesini havada yakalar; üreme dışı dönemde Sahra altı Afrika göçü dahil havada kaldığı varsayılıyordu, kışlak konak yeri bulunmamıştı; ivmeölçerli kayıt aygıtı, 2. yıl ışıkla konum; 10 aylık üreme dışı dönemin %99'undan fazlası havada, bazı kuşlar hiç konmadı; gündüz etkinlik geceden az, olası neden termikte süzülme; havada uyuma gereği |
| oa045 | taboada2022 | Taboada C ve ark. Glassfrogs conceal blood in their liver to maintain transparency. Science 2022;378(6626):1315-1320 | 36548427 | 10.1126/science.abl6620 | Fotoakustik görüntüleme; dinlenen cam kurbağaları kırmızı kan hücrelerinin ~%89'unu karaciğerde topluyor, saydamlık 2–3 kat artıyor; pıhtılaşma olmadan |
| oa046 | leal2011 | Leal M, Powell BJ. Behavioural flexibility and problem-solving in a tropical lizard. Biol Lett 2011 (çevrimiçi; baskı 2012);8(1):28-30 | 21752816 | 10.1098/rsbl.2011.0480 | Ağaçta yaşayan tropik kertenkele yeni hareket görevini birkaç yolla çözdü, ters öğrenme ve hızlı ilişkisel öğrenme gösterdi; esneklik beklenmedik; bazı sıcakkanlılarla karşılaştırılabilir |
| oa047 | thoen2014 | Thoen HH ve ark. A different form of color vision in mantis shrimp. Science 2014;343(6169):411-3 | 24458639 | 10.1126/science.1245824 | Bazı türlerde 12 algılayıcı, morötesinden uzak kırmızıya; yakın renk ayrımı zayıf, alışılmış karşıt renk kodlaması dışlandı; tarayan göz hareketi ve zamana dayalı sinyalle renk tanıma önerisi |
| oa048 | garland2011 | Garland EC ve ark. Dynamic horizontal cultural transmission of humpback whale song at the ocean basin scale. Curr Biol 2011;21(8):687-91 | 21497089 | 10.1016/j.cub.2011.03.019 | Erkek kambur balina şarkısı; Güney Pasifik'in batı ve ortasında 11 yıl; birçok şarkı türü hızla, tekrar tekrar, hep doğuya yayıldı; yatay aktarım; bu ölçekte ilk belge |
| oa049 | barker2021 | Barker AJ ve ark. Cultural transmission of vocal dialect in the naked mole-rat. Science 2021;371(6528):503-507 | 33510025 | 10.1126/science.abc6588 | Yumuşak cıvıltı koloni üyeliğini taşıyor, koloniye özgü şive; kendi şivesine daha çok yanıt; başka koloniye verilen yavrular yeni şiveyi öğrendi; kraliçe kaybında şive dağıldı, yeni kraliçeyle döndü |
| oa050 | baotic2015 | Baotic A ve ark. Nocturnal "humming" vocalizations: adding a piece to the puzzle of giraffe vocal communication. BMC Res Notes 2015;8:425 | 26353836 | 10.1186/s13104-015-1394-3 | Avrupa'da 3 hayvanat bahçesi, 947 saatten fazla kayıt; gece kayıtlarında uzun, perdesi değişen mırıltı; hiçbir ses infrasonik değil; sesler iletişim işareti olabilir |

Not: oa044 önce rugani2015 (25635096) idi; Science'ta yayımlanan eleştiri yorumu (26113714) nedeniyle
tartışmalı sayıldı ve hedenstrom2016 ile değiştirildi. oa047'de "mantis karidesi", oa045'te "cam kurbağası" genel ad olarak kullanıldı.

## B4. Metin kaynakları, takım 4 (`banka/taslak-04.json`)

Her satır bu oturumda `get_article_metadata` ile çekildi (2026-10-02). Bulgu sütunu yalnız özette yazanı söyler. Konu
alanı: `bitki`, `mikro`, `insan`, `bocek`.

| Metin | Anahtar | Kaynak | PMID | DOI | Bulgu, özete göre |
|---|---|---|---|---|---|
| oa031 | bohm2016 | Böhm J ve ark. The Venus flytrap Dionaea muscipula counts prey-induced action potentials to induce sodium uptake. Curr Biol 2016;26(3):286-95 | 26804557 | 10.1016/j.cub.2015.11.057 | 2 aksiyon potansiyelinde kapan kapanır; 2. uyarıdan sonra dokunma hormonu yolu; sindirim genleri için 3'ten fazla uyarı, ifade uyarı sayısıyla orantılı; sodyum bezlerden alınır |
| oa032 | gagliano2014 | Gagliano M ve ark. Experience teaches plants to learn faster and forget slower in environments where it matters. Oecologia 2014;175(1):63-72 | 24390479 | 10.1007/s00442-013-2873-7 | Küstüm otunda yaprak kapatmaya alışma; enerji bakımından masraflı ortamda daha belirgin ve kalıcı; daha elverişli ortamda 1 ay rahatsız edilmeden sonra da sürdü |
| oa033 | runyon2006 | Runyon JB, Mescher MC, De Moraes CM. Volatile chemical cues guide host location and host selection by parasitic plants. Science 2006;313(5795):1964-7 | 17008532 | 10.1126/science.1131371 | Küsküt fideleri domatese ve yalnız domates uçucularına yönelir; kına çiçeği ve buğday da yönlendirir; domatesi buğdaya yeğler; birkaç tek madde çeker, buğdaydan biri iter |
| oa034 | prindle2015 | Prindle A ve ark. Ion channels enable electrical communication in bacterial communities. Nature 2015;527(7576):59-63 | 26503040 | 10.1038/nature15709 | Biyofilmde iyon kanalları potasyum dalgalarıyla uzun menzilli elektrik sinyali taşır; metabolik tetik, komşu hücrelerde depolarizasyon; iç ve dış hücrelerin metabolik durumu eşgüdümlenir; kanal silinince tepki yok |
| oa035 | mitchell2009 | Mitchell A ve ark. Adaptive prediction of environmental changes by microorganisms. Nature 2009;460(7252):220-4 | 19536156 | 10.1038/nature08112 | E. coli ve maya sıradaki uyarıya önceden hazırlanır; erken uyarıyla ön karşılaşma uyumu artırır; yalnız ilk uyarıyla evrilen soylarda kayıp; erken uyarı sonraki genleri de açar, geç uyarı yalnız kendi genlerini |
| oa036 | nityananda2016 | Nityananda V ve ark. Insect stereopsis demonstrated using a 3D insect cinema. Sci Rep 2016;6:18718 | 26740144 | 10.1038/srep18718 | Minik 3B gözlükler; dairesel polarizasyon görüntü karışması yüzünden başarısız; renk süzgeçli anaglif peygamberdevesine derinlik yanılsaması verdi; stereo görme kesin gösterildi |
| oa037 | sarfati2021 | Sarfati R, Hayes JC, Peleg O. Self-organization in natural swarms of [tür adı] synchronous fireflies. Sci Adv 2021;7(28):eabg9259 | 34233879 | 10.1126/sciadv.abg9259 | Doğal sürülerde binlerce ateşböceği; düşük yoğunlukta bağımsız, yüksek yoğunlukta periyodik patlamalarda eşzamanlı; 3B yeniden kurgu: patlamalar bayrak yarışı gibi yayılır; arazi ve bitki örtüsüyle tanımlı görsel ağ öneriliyor |
| oa038 | zentner2010 | Zentner M, Eerola T. Rhythmic engagement with music in infancy. Proc Natl Acad Sci U S A 2010;107(13):5768-73 | 20231438 | 10.1073/pnas.1000121107 | 5–24 aylık 120 bebek; müziğe ve ritimli seslere konuşmadan çok ritimli hareket; tempoya bir ölçüde uyum; uyum olumlu duygu gösterimiyle ilişkili; yatkınlık düşündürüyor |
| oa039 | wardle2022 | Wardle SG ve ark. Illusory faces are more likely to be perceived as male than female. Proc Natl Acad Sci U S A 2022;119(5):e2117413119 | 35074880 | 10.1073/pnas.2117413119 | 3815 yetişkin; nesnelerdeki yanılsama yüzlere duygu, yaş ve cinsiyet yakıştırılır; güçlü erkek yanlılığı; anlamsal ya da görsel özelliklerle açıklanmaz; geniş ayarlı yüz değerlendirme sistemi |
| oa040 | dudley2007 | Dudley SA, File AL. Kin recognition in an annual plant. Biol Lett 2007;3(4):435-8 | 17567552 | 10.1098/rsbl.2007.0232 | Tek yıllık Cakile edentula: yabancılar aynı saksıda köke daha çok pay ayırır, kardeşler ayırmaz; ipucu kök etkileşimi olabilir; akraba seçilimiyle uyumlu |

Not: oa037'nin PubMed başlığında tür adı düşmüş ("swarms ofsynchronous"); tür adı uydurulmadı, köşeli
ayraçla boş bırakıldı. Metinde tür adı geçmez. oa038 ve oa039'da `dergi` önceki takımlardaki gibi "PNAS" yazıldı.
