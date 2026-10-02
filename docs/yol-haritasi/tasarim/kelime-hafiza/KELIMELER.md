# Yakala Yaz · kelime listesi (taslak, 2026-10-02)

Durum: **K B** (5 kişilik kelime kapısından geçti, 5/5 "genel olarak kabul edilebilir"; `kapi/kelime-kapisi.md`; ben onayladım). Sahip onayı bekleniyor. Sahip onaylamadan koda girmez. Liste `kelimeler/liste.json`; kaynağı `kelimeler/*.mjs`
(`node birlestir.mjs` listeyi yeniden kurar ve denetler).

## Seçim ölçütleri
- Türkçe, gündelik, somut ad; erken öğrenilen ve sık kelimeler (ölçüt: Göz, Tekcan, Erciyes 2017, PMID 27743317 —
  edinim yaşı, sıklık, somutluk. VARSAYIM: makalenin ek listesine erişmedim; kelimeleri bu ölçütle ben seçtim).
- 4–6 harf. Ölçü süreyi ölçsün diye kelime uzunluğu dar bantta tutuldu.
- Rahatsız etmeyen: kaba, korkutucu, siyasi, dinî, sağlık ya da beden kaygısı uyandıran kelime yok. Et ürünleri,
  bilinmeyen yöresel adlar ve iki anlamlı kelimeler çıkarıldı (ör. kanun, burun, kafes, sucuk, kebap, çete). Kapıdan sonra 62 kelime daha çıktı (argo çağrışım, hakaret,
  korku, sağlık, dinî, takım ve marka çağrışımı, az bilinen); TDK yazımı: rüzgâr, dükkân, hikâye.
- Türkçe harfleri (ve şapkayı) atınca başka bir kelimeyle çakışan kelime yok (ör. "kaş/kas" ikisi birden yok). Denetim betikte.
- Sekiz grup: Doğa ve mevsim, Hayvanlar, Mutfak, Ev ve eşya, Şehir ve yol, Müzik ve sanat, Renkler, Oyun ve spor.

## Tekrar etmeme kuralları (kodda saf işlev, testle kanıtlanır)
1. Bir turda aynı kelime iki kez gelmez.
2. Bir kelime son 7 takvim gününün turlarında geçtiyse gelmez. Havuz yetmezse (günde çok tur), en uzun süredir
   gelmeyen kelimeler seçilir; aynı gün içinde yine tekrar yok.
3. Aynı kelime çifti hiç tekrar etmez (sırası farklı olsa da).
4. Bir çiftin iki kelimesi farklı gruptandır ve toplam en çok 12 harftir (tek satıra sığar).
5. Bir turda bir grubun payı en çok %30'dur.
7. Çift yasakları (kelime kapısı): iki hayvan yan yana gelmez; renk, hayvanla ya da başka bir renkle yan yana gelmez
   (hakaret ve takım rengi çağrışımı).
6. Seçim tohumludur: aynı tohum ve aynı geçmişle aynı kelimeler (test için).

Test: 90 günlük tohumlu benzetimde (günde 1–3 tur, 20 deneme, 40 kelime) 1–7 hiç çiğnenmez. Hesap: 7 günde en çok
280 kelime gerekir (günde 1 tur), liste 384; kalan seçim havuzu her gün en az 104 kelime. Günde 2+ turda kural 2'nin
yedeği (en uzun süredir gelmeyen) devreye girer; testte bu durum ayrıca sınanır.

## Liste (384 kelime)

### Doğa ve mevsim (93)

bulut · dere · deniz · dalga · kumsal · orman · çayır · tepe · vadi · koru · gölet · şelale · kaya · toprak · çakıl · yaprak · çiçek · lale · sümbül · nergis · yonca · çimen · yosun · ağaç · çınar · meşe · kavak · söğüt · zeytin · incir · üzüm · kiraz · elma · erik · kayısı · limon · karpuz · kavun · çilek · fındık · ceviz · badem · yıldız · güneş · ışık · gölge · şafak · akşam · sabah · bahar · yağmur · rüzgâr · meltem · esinti · körfez · ırmak · nehir · kıyı · sahil · köpük · inci · mercan · orkide · zambak · bambu · tohum · filiz · başak · buğday · arpa · yulaf · ananas · mango · kivi · vişne · ufuk · yayla · bayır · patika · çeşme · havuz · akasya · kaktüs · çalı · otlak · sırt · yamaç · doruk · zirve · leylak · defne · çiğdem · sazlık

### Hayvanlar (33)

kedi · tavşan · sincap · kirpi · ördek · tavuk · horoz · civciv · serçe · martı · leylek · kumru · balık · yunus · buzağı · kuzu · koyun · oğlak · ceylan · geyik · zürafa · zebra · panda · koala · kunduz · kuğu · turna · bülbül · atmaca · deve · levrek · hamsi · çipura

### Mutfak (62)

ekmek · simit · poğaça · pide · börek · çorba · pilav · nohut · bamya · biber · salata · turşu · peynir · yoğurt · ayran · reçel · pekmez · omlet · tost · kahve · kakao · şerbet · hoşaf · pasta · lokum · helva · sütlaç · tarçın · nane · kekik · soğan · havuç · lahana · marul · roka · turp · pancar · mısır · pirinç · bulgur · dolma · sarma · mantı · kumpir · erişte · cacık · humus · tahin · susam · çörek · açma · katmer · tatlı · puding · krep · pizza · boza · kimyon · sumak · kaymak · yufka · lavaş

### Ev ve eşya (72)

masa · koltuk · kanepe · yastık · yorgan · çarşaf · perde · halı · kilim · lamba · ayna · saat · dolap · kapı · balkon · bahçe · avlu · çatı · baca · duvar · zemin · mutfak · tava · kepçe · kaşık · çatal · tabak · bardak · fincan · demlik · sürahi · tepsi · sepet · şişe · kutu · kova · sünger · sabun · havlu · terlik · çanta · cüzdan · mektup · zarf · defter · kalem · silgi · cetvel · kitap · dergi · gazete · harita · pusula · vazo · saksı · tarak · takvim · albüm · kilit · minder · sehpa · örtü · kupa · termos · matara · tabure · hamak · paspas · vida · bavul · hasır · vitrin

### Şehir ve yol (52)

sokak · cadde · meydan · park · çarşı · pazar · dükkân · fırın · manav · kafe · otel · müze · sinema · okul · köprü · liman · iskele · vapur · tren · vagon · otobüs · durak · kaykay · araba · kamyon · tekne · kayık · sandal · balon · kule · pasaj · sergi · fuar · tünel · rıhtım · plaj · marina · kamp · çadır · kulübe · kano · rota · bilet · valiz · kervan · hamam · konak · köşk · yalı · kasaba · bulvar · geçit

### Müzik ve sanat (39)

şarkı · türkü · ezgi · nota · ritim · davul · flüt · keman · gitar · piyano · mızıka · koro · sahne · dans · halay · resim · tablo · fırça · boya · tuval · heykel · çini · ebru · dantel · nakış · örgü · iplik · düğme · kumaş · ipek · kadife · pamuk · keten · melodi · afiş · mozaik · kamera · film · pastel

### Renkler (13)

mavi · yeşil · sarı · pembe · beyaz · bordo · krem · altın · gümüş · bakır · siyah · lila · zümrüt

### Oyun ve spor (20)

oyun · yapboz · dama · tavla · kart · masal · hikâye · şiir · roman · fıkra · seksek · yoyo · topaç · yarış · koşu · yüzme · yelken · dalış · kızak · paten

