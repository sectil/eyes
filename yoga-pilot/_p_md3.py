import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

# punctuation-keeping sentence splits (patch 1 used sentences())
rep("timing.sentences(T(F, 'c4.gunes'))[0]", "timing.split_keep(T(F, 'c4.gunes'))[0]")
rep("timing.sentences(T(F, 'c2.x.kendin'))[1]", "timing.split_keep(T(F, 'c2.x.kendin'))[1]")

# ---- §4
rep(r'''      'kapanış önerinin %s sn üstündedir, çünkü kalkış payları sıkıştırılmaz (B2, T1, E7) ve baş dönmesi satırları '
      'eklendi (G2-04, G2-07). Bu sahip kararıdır (§7).' % (
          span([x[0] for x in s5]), span([x[1] for x in s5]), span([x[2] for x in s5]), span([x[3] for x in s5]),
          span([x[3] - 75 for x in s5])))''',
    r'''      'kapanış önerinin %s sn üstündedir, çünkü kalkış payları sıkıştırılmaz (B2, T1, E7) ve baş dönmesi satırları '
      'eklendi (G2-04, G2-07). Bu sahip kararıdır (§7). 4. turda 5 dakika bir çerçeve değil bir ders olsun diye (MT3-05, '
      'L3-03): duruş cümlesi zemine yerleşmeyi de taşır, niyet başta ve sonda bir kez söylenir (kısa biçim), bekleme '
      'klibindeki üçüncü baş dönmesi satırı ve "Sözlerin ardından…" klibi çıktı, son cümle ayrı ve tek başına; kazanılan '
      'süre nefes akışının ardındaki sessizliğe verildi: 5 dakikada en uzun boşluk %s sn (L3-03 tabanı 16 sn; denetim). '
      'Kapanış yine ≈ 75 sn\'nin üstündedir; güvenlik payları kısaltılmadı.' % (
          span([x[0] for x in s5]), span([x[1] for x in s5]), span([x[2] for x in s5]), span([x[3] for x in s5]),
          span([x[3] - 75 for x in s5]), r1(max(ev['gap'] for ev in ref['events']))))''')
rep(r'''    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 tanıklık | imge penceresi | ilk genişletme | bütün içerik |')''',
    r'''    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 sessiz dinlenme | imge penceresi | ilk genişletme | bütün içerik |')''')

# ---- §5.1
rep(r'''    act_ids = [('uzanma', 'a.durus'), ('örtü ve yastık', 'a.konfor'), ('gözler', 'a.gozler'),
               ('kıpırdanıp yerleşme', 'a.x.kipir'), ('ağırlığı bırakma', 'a.agirlik'), ('niyeti seçme', 'n1.sec'),
               ('niyeti üç kez söyleme (başta)', 'n1.soyle'), ('niyeti üç kez söyleme (sonda)', 'n2.hatirla'),
               ('patikadan dönüş', 'c4.don'), ('parmaklar ve gerinme', 'k.hareket'), ('gözler ve çevre', 'k.goz'),
               ('yana dönme', 'k.yan'), ('doğrulup oturma', 'k.otur'), ('oturarak bekleme', 'k.bekle'),
               ('kalkış ve son', 'k.son')]''',
    r'''    act_ids = [('örtü ve yastık (uzanmadan önce)', 'a.konfor'), ('uzanma ve zemine yerleşme', 'a.durus'),
               ('gözler', 'a.gozler'), ('kıpırdanıp yerleşme', 'a.x.kipir'), ('zemine yerleşme', 'a.agirlik'),
               ('niyeti seçme', 'n1.sec'), ('niyeti üç kez söyleme (başta)', 'n1.soyle'),
               ('niyeti üç kez söyleme (sonda)', 'n2.hatirla'), ('patikadan dönüş', 'c4.don'),
               ('parmaklar ve gerinme', 'k.hareket'), ('gözler ve çevre', 'k.goz'), ('yana dönme', 'k.yan'),
               ('doğrulup oturma', 'k.otur'), ('oturarak bekleme', 'k.bekle'), ('kalkış', 'k.kalk'), ('son cümle', 'k.son')]''')
rep(r'''         '>= 20 sn (en kısa: %s). **5 dakikada** C1 %s sn ve N1 %s sn eşiği geçer; C2 %s sn ve N2 %s sn eşiğin '
         'altındadır: sahibe görünür değişiklik (C2 >= 30, N2 >= 18; §7, H1).' % (''',
    r'''         '>= 20 sn (en kısa: %s). **5 dakikada** C1 %s sn ve N1 %s sn eşiği geçer; C2 %s sn ve N2 %s sn eşiğin '
         'altındadır: sahibe görünür değişiklik (C2 >= 30, N2 >= 15; §7, H1; L3-03, MT3-05: 5 dakikada niyet "bir kez '
         'daha"). 4. tur: iki eylemli hareket cümlesine 10 sn (MT3-14), uzanmadan önce örtü ve yastığa 12 sn (MT3-13, '
         'Z3-08), üç sessiz söyleyişe >= 10 sn (Z3-03).' % (''')
rep(r'''        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik; 7 dakikadan itibaren "%s" (`c2.kal`); 5–6 '
         'dakikada nefes bloğu dikkat → akış, iki satır birbirini iptal etmez (H1 a).' % T(F, 'c2.kal'),
         '`timing.py`', 'evet'),''',
    r'''        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik; 5 dakikada en uzun boşluk %s sn (`c2.akis` '
         'ardında; L3-03 tabanı 16 sn, denetim); %s. dakikadan itibaren "%s" (`c2.kal`); 5 dakikada nefes bloğu dikkat → '
         'akış, iki satır birbirini iptal etmez (H1 a).' % (
             r1(max(ev['gap'] for ev in F['ref5']['events'])), rng(IN['c2.kal']), T(F, 'c2.kal')),
         '`timing.py` (L3-03)', 'evet'),''')
rep(r'''        ('Sessizliği korur', 'Üç pencere de (içten sayma, imge, tanıklık) duyurulur, bir kapı taşır ve karşılanır: '
         'duyurular "…sonra yine seslenirim."; kapılar "Gözlerin açık kalsa da olur", "İstediğin an gözlerini '
         'açabilirsin.", "Bir şey zor gelirse zemini hissedebilirsin."; karşılamalar %s, %s, %s. Karşılamadan 2 sn önce '
         'dönüş tınısı; yatak kabarması rampalı (G2-11); hepsi <= 90 sn.' % (
             Q(F, 'c2.x.donus'), Q(F, 'c4.donus1'), Q(F, 'c5.donus')), '`timing.py` (G2-02)', 'evet'),''',
    r'''        ('Sessizliği korur', 'Üç pencere de (içten sayma, imge, sessiz dinlenme) duyurulur, bir kapı taşır ve karşılanır; '
         'duyuru → kapı → dönüş sözü sırası üçünde de aynı (TR3-04): duyurular "…sonra yine seslenirim." ile biter; '
         'kapılar "%s" (TR3-11), "İstediğin an gözlerini açabilirsin.", "Bir şey zor gelirse zemini hissedebilirsin."; '
         'karşılamalar %s, %s, %s. "Kapanışa geç" pencerenin içinden basılırsa da önce dönüş tınısı ve karşılama çalar '
         '(S3-01). Karşılamadan 2 sn önce dönüş tınısı; yatak kabarması rampalı (G2-11); hepsi <= 90 sn.' % (
             timing.split_keep(T(F, 'c2.x.kendin'))[1], Q(F, 'c2.x.donus'), Q(F, 'c4.donus1'), Q(F, 'c5.donus')),
         '`timing.py` (G2-02, S3-01)', 'evet'),''')
rep(r'''            '"%s" %d' % (w, k) for w, k in fillers.items()) + '; aynı sözcük 60 sn içinde iki kez geçmez; 10 sn '
         'içinde ya da ardışık cümle kliplerinde etiketsiz kök tekrarı yok (L2-14).', '`timing.py`', 'evet'),''',
    r'''            '"%s" %d' % (w, k) for w, k in fillers.items()) + '; aynı sözcük 60 sn içinde iki kez geçmez; 10 sn '
         'içinde ya da ardışık cümle kliplerinde etiketsiz kök ya da ilgeç tekrarı yok, aynı klibin ardışık cümlelerinde '
         'de (L2-14, TR3-06, MT3-16). Olumsuzluk ve izin kalıpları seyreltildi: "…de olur" ve "gerek yok / gerekmiyor / '
         'zorunda değil" yalnız güvenlik ya da bağışlama taşıyan yerlerde (MT3-08).', '`timing.py`', 'evet'),''')
rep(r'''        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "onu atla", "Bir yerin ağrırsa ya da başın dönerse '
         'bırak.", "Uzanıyorsan önce bir yanına dön.", "…doğrulup otur.", "…böyle kal. …biraz daha bekle.", "başın '
         'dönerse yeniden otur" ve Durdur dönüşü. Öteki yönergeler "-ebilirsin", "-mek yeterli", "sana kalmış", şimdiki '
         'zaman ya da isim cümlesiyle; "-(y)abil-" herhangi bir 60 sn\'de en çok 3 kez (TR2-03). Çifte izin yok.',
         '`timing.py` (metin)', 'evet'),''',
    r'''        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "atla" (`c1.cerceve`, `c1.gecis.on`), "…başın dönerse '
         'hareketi bırak.", "Sırtüstü yatıyorsan önce bir yanına dön.", "…doğrulup otur.", "…böyle kal.", "…yeniden '
         'otur ve bekle." ve Durdur dönüşü. Öteki yönergeler "-ebilirsin", "-mek yeterli" (niyeti söylemek de; S3-08), '
         '"sana kalmış", şimdiki zaman ya da isim cümlesiyle; itaat varsayan "söylüyorsun" yok (S3-08), dilek kipi '
         '"kalsın" yok (S3-09); "-(y)abil-" herhangi bir 60 sn\'de en çok 3 kez (TR2-03; hızlı kapanış dizilerinde de). '
         'Çifte izin yok.', '`timing.py` (metin)', 'evet'),''')
rep(r'''         'hatırlatma ve dayanak; dolaşımda atlama; zıtlıkta "bu bölümü atlayıp zemini hissedebilirsin"; her pencere '
         'duyurusunda bir kapı (G2-02); imgenin içinde gözler. Zor blok yok.' % rng(IN['c4.yer']),
         '`timing.py` (S1, P-B2, G2-01, G2-02)', 'evet'),''',
    r'''         'hatırlatma ve dayanak; dolaşımda atlama, göğüs ve karından önce ikinci kapı (S3-04); zıtlıkta "bu bölümü '
         'atlayıp zemini hissedebilirsin"; her pencere duyurusunda bir kapı (G2-02); imgenin içinde gözler; "Kapanışa '
         'geç" imgeden ve zıtlıktan çıkarken önce zemine döner (S3-01). Zor blok yok.' % rng(IN['c4.yer']),
         '`timing.py` (S1, P-B2, G2-01, G2-02, S3-01, S3-04)', 'evet'),''')
rep(r'''        ('Kapanış ritüeli', 'nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → bekle → kalk (başın dönerse '
         'yeniden otur) → "%s"' % T(F, 'k.son').split('. ')[-1], '`timing.py` (+ G2-04)', 'evet'),''',
    r'''        ('Kapanış ritüeli', 'nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → bekle → kalk (başın dönerse '
         'yeniden otur ve bekle) → sessizlik → tek başına "%s" (MT3-04, L3-04). "Kapanışa geç" imge ya da zıtlık '
         'açıkken önce ön klip, 4 sn rampa sessizliği (S3-01, S3-02).' % T(F, 'k.son'), '`timing.py` (+ G2-04, S3-01)',
         'evet'),''')
rep(r'''        ('Azalan anlatım', 'Her klibin evresi var; −1,5 / −3 dB evreye göre; yol A\'da REST hızı 0,90 → 0,85 → 0,80. '
         'Cümleler de kısalır (H12): ortalama hece/cümle 5 dakikada Varış %s, Derinleşme %s, Derin %s; 30 dakikada %s, '
         '%s, %s (her planda Derin < Derinleşme < Varış). Yol B\'de hız sabit (§1.1).' % (
             r1(me[5]['Varış']), r1(me[5]['Derinleşme']), r1(me[5]['Derin']), r1(me[30]['Varış']),
             r1(me[30]['Derinleşme']), r1(me[30]['Derin'])),
         '`timing.py` (H12) + üretim ölçümü', 'kısmen (ölçüm bekliyor)'),''',
    r'''        ('Azalan anlatım', 'Hız sabit (MCP, sahip kararı; EV3-01, MT3-03, L3-01); azalma kazançla (−1,5 / −3 dB evreye '
         'göre), cümle uzunluğuyla ve cümleler arası sessizlikle (Varış %s → Derin %s sn; MT3-02) verilir. Cümleler '
         'kısalır (H12): ortalama hece/cümle 5 dakikada Varış %s, Derinleşme %s, Derin %s; 30 dakikada %s, %s, %s (her '
         'planda Derin < Derinleşme < Varış).' % (
             '%s–%s' % (n(L['sentenceGapByPhase']['Varış']['min']), n(L['sentenceGapByPhase']['Varış']['max'])),
             '%s–%s' % (n(L['sentenceGapByPhase']['Derin']['min']), n(L['sentenceGapByPhase']['Derin']['max'])),
             r1(me[5]['Varış']), r1(me[5]['Derinleşme']), r1(me[5]['Derin']), r1(me[30]['Varış']),
             r1(me[30]['Derinleşme']), r1(me[30]['Derin'])),
         '`timing.py` (H12, L3-02) + üretim ölçümü', 'kısmen (kazanç ölçümü bekliyor)'),''')
rep(r'''        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden. Duraklamalar dahil en yavaş klip %s hece/sn; '
         'Derin evre iç hızı ve tavanı (VARSAYIM) §2.5\'te.' % F['slowest'], '`timing.py` (metin) + üretim ölçümü',
         'kısmen (ölçüm bekliyor)'),''',
    r'''        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden (klipler arası ve cümleler arası). '
         'Duraklamalar dahil en yavaş klip %s hece/sn; Derin evre iç ve etkin hızı ve tavanı (VARSAYIM) §2.5\'te; üretim '
         'köşesinde etkin medyan %s hece/sn.' % (
             F['slowest'], n(round(F['rates'][(5.6, 'hi')][2], 2)) if (5.6, 'hi') in F['rates'] else '?'),
         '`timing.py` (metin) + üretim ölçümü', 'kısmen (ölçüm bekliyor)'),''')
rep(r'''        ('Kusursuz Türkçe', 'Üç editör turu (§5.4); Scribe ile geri çevirme ve anadili Türkçe insan editör onayı bekliyor.',''',
    r'''        ('Kusursuz Türkçe', 'Dört editör turu (§5.4; 4. turda TR3-01–23: çeviri kokan yapılar, eşyazımlı tuzaklar ve '
         'noktalama); Scribe ile geri çevirme ve anadili Türkçe insan editör onayı bekliyor; vurgu tuzakları insan '
         'kulağıyla (TR3-18).',''')
rep(r'''        ('Benzersizlik', 'Açılış cümlesi, anahtar cümle, kıyı/orman patika yayı ve sahne seçici, ufuk çizgisi formu ve Mi♭ '
         'yatağı yalnız bu derste. Ders 5\'in anahtar cümlesi yok (B1); tanıklık Ders 5 ve 9\'dan ayrıldı (S5-hoca); PLAN '
         'A.2.1 satırı güncellendi.', 'ders düzeyi', 'evet'),''',
    r'''        ('Benzersizlik', '3. turda "evet" yazılmıştı; oysa C5 Ders 9\'un tanık göstergesini ("fark eden sensin") ve Ders '
         '5\'in açık izlemesini ("dikkatin geniş kalabilir", "sesler") taşıyordu: **hayır → düzeltildi (MT3-01)**. C5 '
         'artık "sessiz dinlenme"dir ve dersin kendi motiflerine bağlıdır: %s · %s · %s; `c5.genis` silindi, imgedeki '
         'sese tek geri çağrı `c5.dusunce`. Açılış cümlesi, anahtar cümle, kıyı/orman patika yayı ve sahne seçici, ufuk '
         'çizgisi formu ve Mi♭ yatağı yalnız bu derste; Ders 5\'in anahtar cümlesi yok (B1). Doğa imzası: Ders 2 kıyı '
         'dokusu ↔ Ders 9 okyanus ve Ders 2 rüzgâr-yaprak ↔ Ders 6 orman zemini çakışması kayda alındı, karar üretimden '
         'önce (MT3-15; PLAN A.2.1, §7).' % (Q(F, 'c5.basla'), Q(F, 'c5.sen'), Q(F, 'c5.x.hepsi')), 'ders düzeyi',
         'hayır → düzeltildi'),''')
rep(r'''        ('Yasak liste + güvenlik 18 kural', '§5.2; E12 kökleri muafiyetsiz denetlendi.', '`timing.py` + tablo', 'evet'),''',
    r'''        ('Yasak liste + güvenlik 18 kural', '§5.2; E12 kökleri muafiyetsiz denetlendi (kart ve ekran metinleri dahil; '
         'EV3-06, EV3-13).', '`timing.py` + tablo', 'evet'),''')

# ---- §5.2
rep(r'''        ('Davet, komut değil', 'Yönergeler "-ebilirsin", "olabilir", "-mek yeterli", "sana kalmış", şimdiki zaman ya da '
         'betimleme; emir kipi yalnız güvenlik adımlarında.'),''',
    r'''        ('Davet, komut değil', 'Yönergeler "-ebilirsin", "olabilir", "-mek yeterli", "sana kalmış", şimdiki zaman ya da '
         'betimleme; emir kipi yalnız güvenlik adımlarında. İtaat varsayan şimdiki zaman yönergesi ("söylüyorsun") yok '
         '(S3-08); dilek kipi ("kalsın") yok (S3-09).'),''')
rep(r'''        ('Gözleri açık seçeneği', 'Açılışta `a.gozler` her sürümde. Uzun iç bölümlerden önce: nefeste `c2.dikkat` ("…ya da '
         'gözlerini açmak da olur."; G2-01: `timing.py` her planda bu klipte ya da ondan önceki 60 sn içinde bir gözleri '
         'açma seçeneği arar); içten sayma penceresinde '
         '"Gözlerin açık kalsa da olur" (G2-02); imgelemeden önce `br.orta` ("…gözlerini açmak ya da dersi bitirmek senin '
         'elinde. Gözlerin açıksa bakışın serbest."; G2-13); imgenin ilk cümlelerinde `c4.gelmezse`; imgenin içindeki '
         'pencerede `c4.pencere` ("İstediğin an gözlerini açabilirsin."). (S1, B5, E9, P-B2.)'),''',
    r'''        ('Gözleri açık seçeneği', 'Açılışta `a.gozler` her sürümde: "%s" (S3-05: açık gözün bakışı hiçbir sürümde bir '
         'noktaya bağlı değil; G2-13 böylece 5–14 dakikada da doğru). Uzun iç bölümlerden önce: nefeste `c2.dikkat` '
         '("…ya da gözlerini açmak da olur."; G2-01: `timing.py` her planda bu klipte ya da ondan önceki 60 sn içinde bir '
         'gözleri açma seçeneği arar); içten sayma penceresinde "%s" (G2-02, TR3-11); imgelemeden önce `br.orta` '
         '("…gözlerini açmak, kıpırdamak ya da dersi bitirmek senin elinde. Gözlerin açıksa bakışın serbest."; G2-13, '
         'S3-06); imgenin ilk cümlelerinde `c4.gelmezse`; imgenin içindeki pencerede `c4.pencere` ("İstediğin an '
         'gözlerini açabilirsin."). (S1, B5, E9, P-B2.)' % (T(F, 'a.gozler'), timing.split_keep(T(F, 'c2.x.kendin'))[1])),''')
rep(r'''        ('Nefes tutma', 'Yok. Veriş sonundaki duraklama "Uzatmaya gerek yok." ile fark edilir (S14).'),''',
    r'''        ('Nefes tutma', 'Yok. Veriş sonundaki kısa duraklama söylenir ve yeni nefesin kendiliğinden gelişine bağlanır: "%s" '
         '(S14: uzatma yönergesi yok; TR3-10 "kısa"; L3-09: boş an yerine gelen nefes. MT3-08\'in "Uzatmaya gerek yok" '
         'kalsın önerisi L3-09\'a bırakıldı: kaygılı dinleyicide boş ana işaret etmemek güvenlik gerekçesidir, '
         'olumsuzluk kalıbı da böylece bir eksilir).' % T(F, 'c2.durak')),''')
rep(r'''         'her planda `br.orta` klibinden önce çalar, `timing.py` H5), uzun sürümde temas turunda %s, imgeden hemen önce '
         '"Zemin hep seni taşıyor." Nefeste kapı aynı klipte: eller ve gözler (`c2.dikkat`; G2-01, L2-01); %s. dakikadan '
         'ellerle kalana ayrı cümle (`c2.alt`). Zor bölüm sırasında kapı: zıtlıkta zemin (`c3.agir`), imgenin içinde '
         'gözler (`c4.gelmezse`, `c4.pencere`; orada "zemin" hayal edilen yer gibi duyulabilir), tanıklıkta zemin '
         '(`c5.pencere`); imgeden dönüş yine zemine (`c4.solma`). Nefes tek dayanak değildir (S1). 5–6 dakikalık '
         'sürümlerde imge ve zıtlık yoktur; tek iç bölüm olan nefesin dayanağı eller ve gözlerdir.' % (''',
    r'''         'her planda `br.orta` klibinden önce çalar, `timing.py` H5), uzun sürümde temas turunda %s, imgeden hemen önce '
         '"Zemin seni hep taşıyor." (TR3-03). Nefeste kapı aynı klipte: eller ve gözler (`c2.dikkat`; G2-01, L2-01); %s. '
         'dakikadan dikkati ellerinde olana ayrı cümle (`c2.alt`; TR3-01). Zor bölüm sırasında kapı: zıtlıkta zemin '
         '(`c3.agir`), imgenin içinde gözler (`c4.gelmezse`, `c4.pencere`; orada "zemin" hayal edilen yer gibi '
         'duyulabilir), sessiz dinlenmede zemin (`c5.pencere`, `c5.sen`); imgeden dönüş yine zemine (`c4.solma`; hızlı '
         'kapanışta `k.hizli.imge` "Zemin seni taşıyor.", S3-01). Nefes tek dayanak değildir (S1). 5–6 dakikalık '
         'sürümlerde imge ve zıtlık yoktur; tek iç bölüm olan nefesin dayanağı eller ve gözlerdir.' % (''')
rep(r'''        ('Beden taraması esnek', '`c1.cerceve`: "Seni rahatsız eden bir yer olursa onu atla." Kalça, göğüs ve karın tek adla '
         've komşularıyla aynı periyotta geçer (G2-06; `timing.py`); nefes yeri için "ya da başka bir nokta" (S16).'),''',
    r'''        ('Beden taraması esnek', '`c1.cerceve`: "%s" (TR3-13). Göğüs ve karından en çok 120 sn önce ikinci kapı, '
         '`c1.gecis.on`: "%s" (S3-04; `timing.py`). Kalça, göğüs ve karın tek adla ve komşularıyla aynı periyotta geçer '
         '(G2-06; `timing.py`); nefes yeri için "ya da başka bir nokta" (S16).' % (
             timing.split_keep(T(F, 'c1.cerceve'))[1], T(F, 'c1.gecis.on'))),''')
rep(r'''        ('Sağlık iddiası yok', 'Yasak liste ve E12\'nin etki vaadi kökleri temiz; 3. turda muafiyet yok: anahtar cümleler ve '
         'son cümle de denetlenir (G2-08, EV2-01); "dinlenmiş", "iz bırak", "kalacak" kökleri eklendi (EV2-01, -02, -03).'),''',
    r'''        ('Sağlık iddiası yok', 'Yasak liste ve E12\'nin etki vaadi kökleri temiz; 3. turda muafiyet yok: anahtar cümleler ve '
         'son cümle de denetlenir (G2-08, EV2-01); "dinlenmiş", "iz bırak", "kalacak" kökleri eklendi (EV2-01, -02, -03). '
         '4. turda kart ve ekran metinleri de denetlenir (kart sözü, açılış ekranı, hazırlık kartı, seçici etiketleri, '
         'akşam satırı, kanıt satırı, ses denemesi, Gelişim sorusu, ders sonrası soru; EV3-06) ve sekiz sonuç vaadi kökü '
         'eklendi (EV3-13). Kart sözü davettir: "%s" (EV3-12); kanıt satırı: "%s" (EV3-05).' % (
             L['tagline'], L['evidenceLine'])),''')
rep(r'''        ('Beden hareketi hafif', '`k.hareket`: "…zorlamadan gerinebilirsin. Bir yerin ağrırsa ya da başın dönerse bırak." '
         '(G2-07, EV2-11); `k.bekle`: "Başın dönerse biraz daha bekle."; `k.son`: "…başın dönerse yeniden otur." (G2-04); '
         'Durdur dönüşü: "…başın dönerse biraz daha bekle." (G2-05).'),''',
    r'''        ('Beden hareketi hafif', '`k.hareket`: "%s" (G2-07, EV2-11; TR3-07: "hareketi bırak", tek okunuş; MT3-14: 10 sn); '
         '`k.kalk`: "%s" (G2-04); `k.bekle` yalnız "%s" (üçüncü baş dönmesi satırı çıktı; TR3-21, MT3-04, L3-04); Durdur '
         'dönüşü: "%s" (G2-05, TR3-22).' % (T(F, 'k.hareket'), T(F, 'k.kalk'), T(F, 'k.bekle'), T(F, 'd.bekle'))),''')
rep(r'''        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç uyarısı açılış ekranında ve **veride** (`openingNotice`, '
         '`openingScreen`), tek okunuşlu: "%s" (S11, E10, TR2-23).' % L['openingNotice']),''',
    r'''        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç, makine ve su uyarısı açılış ekranında ve **veride** '
         '(`openingNotice`, `openingScreen`), tek okunuşlu ve ölçünlü olumsuz biçimle: "%s" (S11, E10, TR2-23, S3-07). '
         'Dersten sonra atlanabilir tek soru ("%s") ve "Çok" cevabına güvenlik §11.F metni veride (`afterCheck`; '
         'EV3-05).' % (L['openingNotice'], L['afterCheck']['question'])),''')
# ---- §5.3
rep(r'''        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili '
         'kör panel henüz yok. Panel protokolüne "Derin evrede sayılar ve tek heceli adlar net mi" maddesi eklenmeli '
         '(L2-10).'),''',
    r'''        ('18', 'Gelişim ölçeği ve alanlar', 'Tek ölçek 1–10 (yeniden kullanılan Dalga puan bileşeni 1–10; PLAN.v2 A.1 ve '
         'E.4 ile aynı; EV3-05\'in 0–10 önerisi bu yüzden alınmadı). Kartın kanıt satırı, kaynak kartı, Gelişim sorusu ve '
         'ders sonrası soru veride (`evidenceLine`, `sourcesCard`, `progress`, `afterCheck`; EV3-05).'),
        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili '
         'kör panel henüz yok. Bu derse özgü panel maddeleri veride (`panelChecks`): %s.' % '; '.join(
             x.split(':')[0] for x in L['panelChecks'])),''')
# ---- §5.4
rep(r'''    a('### 5.4 Türkçe editör notları (3. tur; TR2-01–TR2-24)')''',
    r'''    a('### 5.4 Türkçe editör notları (3. tur TR2-01–TR2-24; 4. tur TR3-01–TR3-23)')''')
rep(r'''      'kartta koşut ad öbekleri, "Uyanıkken derin bir dinlenme." ve tek okunuşlu "Bu dersi araç ya da makine '
      'kullanmıyorken dinle." (TR2-23).' % (
          Q(F, 'k.zaman'), Q(F, 'c5.x.dayanak'), Q(F, 'a.durus'), Q(F, 'c5.genis')))''',
    r'''      'kartta koşut ad öbekleri, "Uyanıkken derin bir dinlenme." ve tek okunuşlu "Bu dersi araç ya da makine '
      'kullanmıyorken dinle." (TR2-23; 4. turda EV3-12 ve S3-07 ile yeniden yazıldı).' % (
          Q(F, 'k.zaman'), '"Bedeninin ağırlığı ve onu taşıyan zemin: İkisi de burada." (4. turda silindi, Z3-06)',
          '"Sırtüstü ya da yan, sana en rahat gelen biçimde uzanman yeterli." (4. turda TR3-02 ile yeniden yazıldı)',
          '"Dikkatin tek bir yere odaklanmak zorunda değil. Geniş ve açık kalabilir." (4. turda silindi, MT3-01)'))
    a('- **4. tur (TR3-01–TR3-23):** çeviri kokan "Nefesle / Ellerle kalıyorsan" → "Dikkatin nefesteyse / ellerindeyse" '
      '(TR3-01); "Sırtüstü ya da yan, … uzanman" (çifte durum zarfı; virgülden önce "yan!" emri gibi okunma) → %s '
      '(TR3-02, MT3-05); odak sırası "Zemin hep seni taşıyor" → "Zemin seni hep taşıyor." (TR3-03); "Biraz dinlenme '
      'zamanı." ("DİNlenme" okunuşu, dinlenme dersinde "şimdiye dek dinlenmedin" iması) → %s ve hazır niyet "Kendime '
      'dinlenme izni veriyorum" → %s (TR3-04); "Orada … dinlenme yeri" (gösterim çatışması, yol kenarı tesisi) → %s '
      '(TR3-05); ormanda art arda iki "…ların arasından" → "Dalların ötesinde" (TR3-06); nesnesiz "bırak" → "hareketi '
      'bırak" (TR3-07); "sen uyanıksın" kurnazlık okunuşu kör panel maddesi, yedeği "%s" (TR3-08); "ona tutunman" '
      'çevirisi → "onu aklında tutman" (TR3-09); "küçük bir duraklama" → "kısa" (TR3-10); "Gözlerin açık kalsa da olur; '
      'sonra…" → "Gözlerini açsan da olur. Sonra…" (TR3-11); "Saydığım her yeri fark edersin" → %s (TR3-13); "bir '
      'noktaya yumuşakça bakmak" → "açık tutmak … bakışın serbest" (TR3-14); "…niyetin … seninle olsun" (dua ağzı) → %s '
      '(TR3-15); "kendi olağan ritmini" → "kendi ritmini" (TR3-16); "Yüz ve bedenin önü" → "Yüzün ve bedenin ön tarafı" '
      '(TR3-17); söyleyiş listesine boyun, Yüzün, yan, alman eklendi ve Scribe\'ın vurgu hatasını yakalayamadığı yazıldı '
      '(TR3-18); "ön kol" yazımı TDK\'den doğrulanamadı, insan editöre işaretli (TR3-19); "Uzaktaki ses … uzaklaşıyor" '
      'çınlaması → "O ses bir yaklaşıyor, bir uzaklaşıyor." (TR3-20); 100 sn\'de üç "başın dönerse" → iki (TR3-21); '
      '"Birkaç nefes otur" → "böyle kal" (TR3-22); "Hoş geldin; …" → "Hoş geldin. …" ve zarf-fiilden sonra virgül yok '
      '(TR3-23). Bulguların verdiği cümlelerden sapılan yerler ve nedenleri `fixlog.md` Tur 4 tablosundadır.' % (
          Q(F, 'a.durus'), Q(F, 'c4.pencere'), F['niyet'], Q(F, 'c4.yerles'), F['key'][2]['panelFallback']['text'],
          Q(F, 'c1.cerceve'), Q(F, 'n2.dilek')))''')
rep(r'''      '%s; aynı sayımla ikinci turda %s); herhangi bir 60 sn\'de en çok %d (`timing.py` sınırı 3). Araçlar: "-mek yeterli", '
      '"sana kalmış", "var", şimdiki zaman ("seçiyorsun", "söylüyorsun", "hatırlıyorsun"), geniş zaman ("fark edersin", '
      '"olmaz"), isim cümlesi ("Önce ağırlık.", "Beden kendi hâlinde."). Güvenlik sözleri ("…açabilir, kıpırdayabilir '
      'ya da dersi bitirebilirsin") değiştirilmedi.' % (
          n_cl, n_ab, n(round(n_ab / n_cl, 2)),
          ('%d klipte %d' % F['r2']['abil5']) if F['r2'] else '—', worst))''',
    r'''      '%s; aynı sayımla üçüncü turda %s); herhangi bir 60 sn\'de en çok %d (`timing.py` sınırı 3; hızlı kapanışın her '
      'bağlamında da). Araçlar: "-mek yeterli" (niyeti söylemek de; S3-08), "sana kalmış", "var", şimdiki zaman '
      '("seçiyorsun", "fark ediyorsun", "hatırlıyorsun"), geniş zaman ("olmaz"), isim cümlesi ("Önce ağırlık.", "Beden '
      'kendi hâlinde."). Güvenlik sözleri ("…açabilir, kıpırdayabilir ya da dersi bitirebilirsin") değiştirilmedi.' % (
          n_cl, n_ab, n(round(n_ab / n_cl, 2)),
          ('%d klipte %d' % F['prev']['abil5']) if F['prev'] else '—', worst))''')
rep(r'''      'fincan tutar gibi.", "Açık bir pencereden içeri dolan hava gibi.", "Bir de zemine değen noktalar.", "Bedenin arka '
      'tarafı.", "Yüz ve bedenin önü.", "Burun, göğüs, karın ya da başka bir nokta.", "Sözlerin ardından kısa bir '
      'sessizlik.", "Bir renk, bir biçim, bir doku.", "Uyanık bir dinlenme bu." Öznesi ya da bağlamı bir önceki '
      'cümlededir ya da bir işaret gibi kullanılır; konuşma dilinde doğaldır. İnsan editör yine de değerlendirmeli.')''',
    r'''      'fincan tutar gibi.", "Açık bir pencereden içeri dolan hava gibi.", "Bir de zemine değen noktalar.", "Bedenin arka '
      'tarafı.", "Yüzün ve bedenin ön tarafı.", "Burun, göğüs, karın ya da başka bir nokta.", "Bir renk, bir biçim, bir '
      'doku.", "Uyanık bir dinlenme bu." Öznesi ya da bağlamı bir önceki cümlededir ya da bir işaret gibi kullanılır; '
      'konuşma dilinde doğaldır. Sahne yönergesi gibi duyulan "Sözlerin ardından kısa bir sessizlik." çıkarıldı (L3-07, '
      'MT3-10). İnsan editör yine de değerlendirmeli.')''')
rep(r'''      '"oynatıp zorlamadan gerinebilirsin" zarf-fiille tek yüklemdir; "gözlerini açmak ya da dersi bitirmek senin '
      'elinde" iki mastarı tek yükleme bağlar.')''',
    r'''      '"oynatıp zorlamadan gerinebilirsin" zarf-fiille tek yüklemdir; "gözlerini açmak, kıpırdamak ya da dersi bitirmek '
      'senin elinde" üç mastarı tek yükleme bağlar; "Sırtüstü ya da yan yatıp zemine yerleşmen yeterli" iki durum '
      'zarfını tek zarf-fiile bağlar (TR3-02).')''')
p.write_text(t, encoding='utf-8')
print('ok', len(t))
