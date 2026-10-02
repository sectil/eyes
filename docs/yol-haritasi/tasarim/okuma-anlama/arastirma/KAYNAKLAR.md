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
