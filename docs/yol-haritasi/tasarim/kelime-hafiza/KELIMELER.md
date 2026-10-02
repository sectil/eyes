# Yakala Yaz · kelime listesi (taslak, 2026-10-02)

Durum: **T** (taslak). Sahip onaylamadan koda girmez. Liste `kelimeler/liste.json`; kaynağı `kelimeler/*.mjs`
(`node birlestir.mjs` listeyi yeniden kurar ve denetler).

## Seçim ölçütleri
- Türkçe, gündelik, somut ad; erken öğrenilen ve sık kelimeler (ölçüt: Göz, Tekcan, Erciyes 2017, PMID 27743317 —
  edinim yaşı, sıklık, somutluk. VARSAYIM: makalenin ek listesine erişmedim; kelimeleri bu ölçütle ben seçtim).
- 4–6 harf. Ölçü süreyi ölçsün diye kelime uzunluğu dar bantta tutuldu.
- Rahatsız etmeyen: kaba, korkutucu, siyasi, dinî, sağlık ya da beden kaygısı uyandıran kelime yok. Et ürünleri,
  bilinmeyen yöresel adlar ve iki anlamlı kelimeler çıkarıldı (ör. kanun, burun, kafes, sucuk, kebap, çete).
- Türkçe harfleri atınca başka bir kelimeyle çakışan kelime yok (ör. "kaş/kas" ikisi birden yok). Denetim betikte.
- Sekiz grup: Doğa ve mevsim, Hayvanlar, Mutfak, Ev ve eşya, Şehir ve yol, Müzik ve sanat, Renkler, Oyun ve spor.

## Tekrar etmeme kuralları (kodda saf işlev, testle kanıtlanır)
1. Bir turda aynı kelime iki kez gelmez.
2. Bir kelime son 7 takvim gününün turlarında geçtiyse gelmez. Havuz yetmezse (günde çok tur), en uzun süredir
   gelmeyen kelimeler seçilir; aynı gün içinde yine tekrar yok.
3. Aynı kelime çifti hiç tekrar etmez (sırası farklı olsa da).
4. Bir çiftin iki kelimesi farklı gruptandır ve toplam en çok 12 harftir (tek satıra sığar).
5. Bir turda bir grubun payı en çok %30'dur.
6. Seçim tohumludur: aynı tohum ve aynı geçmişle aynı kelimeler (test için).

Test: 90 günlük tohumlu benzetimde (günde 1–3 tur, 20 deneme, 40 kelime) 1–5 hiç çiğnenmez. Hesap: 7 günde en çok
280 kelime gerekir (günde 1 tur), liste 446; kalan seçim havuzu her gün en az 166 kelime.

## Liste (446 kelime)

### Doğa ve mevsim (108)

bulut · dere · deniz · dalga · kumsal · orman · çayır · tepe · vadi · koru · gölet · pınar · şelale · kaya · toprak · çakıl · yaprak · fidan · çiçek · lale · sümbül · nergis · yonca · çimen · yosun · ağaç · çınar · meşe · kavak · söğüt · ladin · zeytin · incir · üzüm · kiraz · elma · armut · ayva · erik · kayısı · limon · karpuz · kavun · çilek · fındık · ceviz · badem · yıldız · güneş · ışık · gölge · şafak · akşam · sabah · bahar · yağmur · rüzgar · meltem · esinti · körfez · ırmak · nehir · kıyı · sahil · köpük · kabuk · inci · mercan · orkide · zambak · bambu · tohum · filiz · başak · buğday · arpa · yulaf · hurma · ananas · mango · kivi · vişne · kırağı · ufuk · yayla · bayır · patika · çeşme · kuyu · havuz · selvi · akasya · kaktüs · mantar · çalı · otlak · sahra · kumul · sırt · yamaç · doruk · zirve · boğaz · leylak · defne · çiğdem · kamış · sazlık

### Hayvanlar (48)

kedi · köpek · tavşan · sincap · kirpi · ördek · tavuk · horoz · civciv · serçe · martı · leylek · kartal · baykuş · kumru · balık · yunus · balina · yengeç · midye · eşek · inek · buzağı · kuzu · koyun · keçi · oğlak · ceylan · geyik · zürafa · zebra · panda · koala · kunduz · kuğu · turna · bülbül · keklik · sülün · tavus · şahin · atmaca · deve · lama · alpaka · levrek · hamsi · çipura

### Mutfak (69)

ekmek · simit · poğaça · pide · börek · çorba · pilav · nohut · bamya · biber · salata · turşu · peynir · yoğurt · ayran · reçel · pekmez · omlet · tost · kahve · kakao · şerbet · hoşaf · pasta · lokum · helva · sütlaç · aşure · tarçın · nane · kekik · soğan · havuç · kabak · lahana · marul · roka · turp · pancar · mısır · pirinç · bulgur · şeker · dolma · sarma · mantı · kumpir · erişte · cacık · humus · tahin · susam · çörek · açma · katmer · tatlı · puding · krep · pizza · sahlep · boza · kuskus · kimyon · sumak · kakule · gevrek · kaymak · yufka · lavaş

### Ev ve eşya (85)

masa · koltuk · kanepe · yastık · yorgan · çarşaf · perde · halı · kilim · lamba · ayna · saat · dolap · kapı · balkon · bahçe · avlu · çatı · baca · duvar · zemin · mutfak · tava · kepçe · kaşık · çatal · tabak · bardak · fincan · demlik · sürahi · tepsi · sepet · şişe · kutu · kova · sünger · sabun · havlu · terlik · çanta · cüzdan · mektup · zarf · defter · kalem · silgi · cetvel · kitap · dergi · gazete · harita · pusula · fener · kibrit · vazo · saksı · makas · tarak · takvim · albüm · kilit · minder · sehpa · askı · örtü · pike · kupa · termos · matara · tabure · beşik · hamak · paspas · çekiç · vida · fıçı · sandık · bavul · heybe · hasır · vitrin · etajer · sürgü · tokmak

### Şehir ve yol (52)

sokak · cadde · meydan · park · çarşı · pazar · dükkan · fırın · manav · kafe · otel · müze · sinema · okul · köprü · liman · iskele · vapur · tren · vagon · otobüs · durak · kaykay · araba · kamyon · tekne · kayık · sandal · balon · kule · pasaj · sergi · fuar · tünel · rıhtım · plaj · marina · kamp · çadır · kulübe · kano · rota · bilet · valiz · kervan · hamam · konak · köşk · yalı · kasaba · bulvar · geçit

### Müzik ve sanat (46)

şarkı · türkü · ezgi · nota · ritim · davul · flüt · keman · gitar · piyano · mızıka · koro · sahne · dans · halay · resim · tablo · fırça · boya · tuval · heykel · çini · ebru · dantel · nakış · örgü · iplik · düğme · kumaş · ipek · kadife · pamuk · keten · melodi · akor · çello · kaval · afiş · kolaj · mozaik · kamera · film · kanvas · gravür · eskiz · pastel

### Renkler (13)

mavi · yeşil · sarı · pembe · beyaz · bordo · krem · altın · gümüş · bakır · siyah · lila · zümrüt

### Oyun ve spor (25)

oyun · bilye · yapboz · dama · tavla · kart · masal · hikaye · şiir · roman · fıkra · domino · seksek · körebe · yoyo · topaç · misket · yarış · koşu · yüzme · kürek · yelken · dalış · kızak · paten

