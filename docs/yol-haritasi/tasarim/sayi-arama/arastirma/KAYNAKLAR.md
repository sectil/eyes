# Rakam ızgarası modülü · kaynaklar (aşama 1, 2026-10-01)

Her PMID ve DOI bu oturumda PubMed aracıyla çekildi (`get_article_metadata`). Ezberden yazılmadı. "Bize ne söyler"
satırı yalnız PubMed özetinde yazanı söyler; özeti olmayan kayıtta yalnız başlık kullanılır.

Ortak anahtar notu: `treisman1980`, `duncan1989`, `wolfe2017`, `wolfe2021`, `chun1996`, `sireteanu1995` Metin Arama
oturumunun `KAYNAKLAR.md` dosyasında da aynı PMID ve DOI ile var. `lib/sources.js`'e bir kez girer; iki modül aynı
anahtarı kullanır. Ana oturum birleştirirken çift kayıt açmaz.

## A. Alıştırmanın temeli

| Anahtar | Kaynak | PMID | DOI | Bize ne söyler |
|---|---|---|---|---|
| treisman1980 | Treisman AM, Gelade G. A feature-integration theory of attention. Cogn Psychol 1980;12(1):97-136 | 7351125 | 10.1016/0010-0285(80)90005-5 | Görsel aramanın temel kuramı. Özet yok; yalnız başlıkla anılır |
| duncan1989 | Duncan J, Humphreys GW. Visual search and stimulus similarity. Psychol Rev 1989;96(3):433-58 | 2756067 | 10.1037/0033-295x.96.3.433 | Arama ile hedef–çeldirici benzerliği. Özet yok; benzer dizi çeldiricilerinin dayanağı yalnız başlık düzeyinde |
| wolfe2017 | Wolfe JM, Horowitz TS. Five factors that guide attention in visual search. Nat Hum Behav 2017;1(3) | 36711068 | 10.1038/s41562-017-0058 | Her şeyi bir anda tanıyamadığımız için ararız. Dikkati beş etken yönlendirir; aramanın geçmişi de bunlardan biri |
| wolfe2021 | Wolfe JM. Guided Search 6.0. Psychon Bull Rev 2021;28(4):1060-1092 | 33547630 | 10.3758/s13423-020-01859-9 | Aynı anda yalnız birkaç öğe tanınır; öğe bellekteki hedef şablonuyla karşılaştırılır. Yönlendirme bakış noktasına yakın öğeleri kayırır |
| chun1996 | Chun MM, Wolfe JM. Just say no. Cogn Psychol 1996;30(1):39-78 | 8635311 | 10.1006/cogp.1996.0002 | Hedef bulunamayınca arama uyarlanır bir eşikle biter; kaçırmadan sonra kişi daha temkinli olur |
| wolfe2005 | Wolfe JM, Horowitz TS, Kenner NM. Rare items often missed in visual searches. Nature 2005;435(7041):439-40 | 15917795 | 10.1038/435439a | Hedef seyrek çıkınca kişi onu çoğu kez kaçırır. Tasarım: her ızgarada hedef var ve kalan sayısı görünür |
| sireteanu1995 | Sireteanu R, Rettenbach R. Perceptual learning in visual search. Vision Res 1995;35(14):2037-43 | 7660607 | 10.1016/0042-6989(94)00295-w | Alıştırmayla aramada öğrenme hızlıdır; bazı durumlarda birkaç yüz denemede yavaş arama hızlanır |
| trevino2021 | Treviño M ve ark. How do we measure attention? Cogn Res Princ Implic 2021;6(1):51 | 34292418 | 10.1186/s41235-021-00313-1 | 636 kişide: harf tarama ve iz sürme testleri "arama" etkenine yüklendi; rakam dizisi hatırlama testi dikkat testi sayılmamalı. Bizim için: bu iş bir arama işidir, sayı hafızası değil |
| ruff1986 | Ruff RM, Evans RW, Light RH. Automatic detection vs controlled search: a paper-and-pencil approach. Percept Mot Skills 1986;62(2):407-16 | 3503245 | 10.2466/pms.1986.62.2.407 | Kâğıt üstünde rakam tarama biçiminde, kendiliğinden fark etme ile denetimli arama ayrıştı (259 gönüllü). Rakam ızgarası bilinen bir yöntemdir |
| pelli2008 | Pelli DG, Tillman KA. The uncrowded window of object recognition. Nat Neurosci 2008;11(10):1129-35 | 18828191 | 10.1038/nn.2187 | Görmeyi çoğu kez boyut değil aralık sınırlar; öğeler çok sıkışınca karışır. Bu sınır arama ve okuma hızını da sınırlar. Tasarım: geniş aralık, az sütun |
| toner2012 | Toner CK ve ark. Vision-fair neuropsychological assessment. Psychol Aging 2012;27(3):785-90 | 22201330 | 10.1037/a0026368 | Rakam taramasında yaşla gelen fark, karşıtlık ayarlanınca kayboldu. Tasarım: yüksek karşıtlık, iki temada ayrı denetim |
| heitz2014 | Heitz RP. The speed-accuracy tradeoff. Front Neurosci 2014;8:150 | 24966810 | 10.3389/fnins.2014.00150 | Karar hızı ile doğruluk birlikte değişir. Ölçü yalnız hız olursa kişi rastgele dokunarak "hızlanır"; doğruluk ayrıca tutulur |

## B. İddia sınırı

| Anahtar | Kaynak | PMID | DOI | Bize ne söyler |
|---|---|---|---|---|
| owen2010 | Owen AM ve ark. Putting brain training to the test. Nature 2010;465(7299):775-8 | 20407435 | 10.1038/nature09042 | 11 430 kişi, 6 hafta: çalışılan her görevde gelişme oldu; yakın görevlere bile aktarım görülmedi |
| simons2016 | Simons DJ ve ark. Do "brain-training" programs work? Psychol Sci Public Interest 2016;17(3):103-186 | 27697851 | 10.1177/1529100616661983 | Çalışılan görevde gelişme kanıtı çok; yakın görevde az; günlük hayata geçtiğine dair kanıt çok az |

**İddia cümlesi taslağı (sahip onayına):** "Bu bir arama alıştırması. Çalıştığın işte hızlanırsın; günlük hayattaki
dikkate geçtiği gösterilmedi." Bilim kartı sağlık ya da "zekâ" iddiası taşımaz. Owen ve Simons başlıklarında "brain"
geçer; kartta başlık çevirisi "beyin" sözcüğü olmadan yazılır (Gelişim kuralı).

## C. Elenenler

- PMID 15902241: ezberden denendi, başka makale çıktı (kinesin). Doğru kayıt arama ile bulundu: 15917795. Ders: PMID
  ezberden yazılmaz (HATA_GUNLUGU kaynak kuralı).
- Jonides ve Gleitman 1972 (harf mi rakam mı kategori etkisi): PubMed'de bulunamadı; kullanılmaz.
- Schulte tablosu: PubMed'de yalnız hasta grubu çalışmaları çıktı; alıştırma kanıtı yok, kullanılmaz.
