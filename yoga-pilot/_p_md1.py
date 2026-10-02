import pathlib, re
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:80])
    t = t.replace(old, new)

# ---- compute(): niyet cümlesi, gmin karşılaştırması (F['r2'] artık F['prev'])
rep(r'''    F['key'] = {c['tags']['key']: c for _, c in F['allc'].values() if c['tags'].get('key')}
''', r'''    F['key'] = {c['tags']['key']: c for _, c in F['allc'].values() if c['tags'].get('key')}
    F['niyet'] = F['allc']['n1.sec'][1]['text'].split(': ', 1)[-1]        # hazır niyet, tırnaklı (TR3-04)
''')
rep(r'''    F['prev'] = prev_round_stats()
''', r'''    F['prev'] = prev_round_stats()
    F['gmin_down'], F['gmin_up'] = [], []
    if F['prev']:
        for cid, (_, c) in F['allc'].items():
            pv = F['prev']['gmin'].get(cid)
            if pv is None or c.get('onsetPeriod'):
                continue
            cur = c['gapAfter']['min']
            if pv > cur + 1e-9:
                F['gmin_down'].append((cid, pv, cur))
            elif cur > pv + 1e-9:
                F['gmin_up'].append((cid, pv, cur))
''')

# ---- §1.1 tablo: yol A satırları gitti (EV3-01, L3-01, MT3-03, Z3-02, TR3-12)
rep(r'''    a('| Varış | A | konuşma düzeyi (0 dB); yol A\'da REST hızı 0,90 (VARSAYIM) | Varış yatağı, konuşmada ≈ −33 LUFS; ders '
      '3 sn\'de açılır | en aydınlık (yine koyu) |')
    a('| Derinleşme | N1, C1 | −1,5 dB (netlik açıkken −0,5); yol A\'da hız bir basamak düşer: 0,85 (VARSAYIM) | '
      '`n1.sec` klibinde Varış yatağı 1,5 dB daha kısılır (≈ −34,5 LUFS) | `n1.sec` klibinde daha loş |')
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | −3 dB (netlik açıkken −1); yol A\'da bir basamak daha: '
      '0,80 (≈ 5,2 hece/sn, tahmin; zamanlamanın hesaplandığı en yavaş hız, altına inilmez) | `c2.dikkat` klibinde 8 sn '
''', r'''    sg = L['sentenceGapByPhase']
    sgs = lambda k: '%s–%s sn' % (n(sg[k]['min']), n(sg[k]['max']))
    a('| Varış | A | konuşma düzeyi (0 dB); eklemleme hızı her evrede aynı (MCP, sahip kararı); cümle arası sessizlik %s '
      '(MT3-02) | Varış yatağı, konuşmada ≈ −33 LUFS; ders 3 sn\'de açılır | en aydınlık (yine koyu) |' % sgs('Varış'))
    a('| Derinleşme | N1, C1 | −1,5 dB (netlik açıkken −0,5); cümleler kısalır (H12); cümle arası sessizlik %s | '
      '`n1.sec` klibinde Varış yatağı 1,5 dB daha kısılır (≈ −34,5 LUFS) | `n1.sec` klibinde daha loş |' % sgs('Derinleşme'))
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | −3 dB (netlik açıkken −1); en kısa cümleler; cümle arası '
      'sessizlik %s, nefes çiftinde %s–%s sn (MT3-02, L3-02); etkin Derin hızı §2.5 | `c2.dikkat` klibinde 8 sn '
''')
rep(r'''      '(VARSAYIM) |')
    a('')
    a('**Yol B (yalnız MCP):** hız ayarı yoktur; eklemleme her evrede aynıdır. Azalan anlatım o zaman yalnız uzayan '
      'boşluk, kısalan cümle ve −1,5 / −3 dB seviyeyle verilir (PLAN C.2). Hızın evreden evreye düşmesi yalnız yol A\'da '
      'mümkündür; hangi yolun seçileceği sahibin kararıdır.')
''', r'''      '(VARSAYIM) |' % (sgs('Derin'), n(L['sentenceGapBreathPair']['min']), n(L['sentenceGapBreathPair']['max'])))
    a('')
    a('**Seçilen yol: yalnız MCP (sahip kararı, 2026-09-29; EV3-01, L3-01, MT3-03, Z3-02, TR3-12).** Hız ayarı yoktur; '
      'eklemleme her evrede aynıdır ve evreden evreye düşmez. Azalan anlatım uzayan boşluk, kısalan cümle, cümleler '
      'arasına uygulamanın koyduğu sessizlik (MT3-02) ve −1,5 / −3 dB seviyeyle verilir (PLAN C.2). REST hız '
      'basamakları (0,90 → 0,85 → 0,80), `seed` ve `previous_text` uygulanmaz; 5,2 hece/sn satırları yalnız muhafazakâr '
      'alt zarftır (§2.2, §6).')
''')

# ---- §1.2 (EV3-11, TR3-08, L3-14, MT3-04)
rep(r'''      'daha kısadır (%d → %d → %d hece); hiçbirinde üç nokta yoktur (PLAN C.2: üç nokta yalnız listelerde) ve hiçbiri bir '
      'durum iddiası değildir (G2-08):' % (key[1]['syllables'], key[2]['syllables'], key[3]['syllables']))''',
    r'''      'daha kısadır (%d → %d → %d hece); hiçbirinde üç nokta yoktur (PLAN C.2: üç nokta yalnız listelerde) ve hiçbiri bir '
      'sonuç iddiası değildir; "uyanık kalıyorsun / uyanıksın" dersin şimdiki zamanla verilen yönergesidir (PLAN C.1 '
      'betimleme biçimi), bir durum tespiti değil (G2-08, EV3-11):' % (
          key[1]['syllables'], key[2]['syllables'], key[3]['syllables']))''')
rep(r'''      'dakikadan itibaren): **"%s"** Böylece iki anahtar cümle arasında her zaman bir blok vardır; kısa sürümlerde '
      'cümle bir slogan gibi üst üste gelmez.' % (rng(IN['br.k2']), key[2]['text']))''',
    r'''      'dakikadan itibaren): **"%s"** Böylece iki anahtar cümle arasında her zaman bir blok vardır; kısa sürümlerde '
      'cümle bir slogan gibi üst üste gelmez. İyelik ilk geçişle aynıdır ("Bedenin"; uzaklaştırıcı "beden" yok, L3-14). '
      'Kör panel "sen uyanıksın"ı kurnazlık anlamında ("çok uyanıksın") duyarsa yedeği "%s" (TR3-08; durum iddiası '
      'yok, 16 → 13 → 8 kısalması korunur).' % (rng(IN['br.k2']), key[2]['text'], key[2]['panelFallback']['text']))''')
rep(r'''      'düzeyine çıksın (H4, L2-02). Kapanışın son cümlesi yayı iddiasız kapatır: "%s" (EV2-01, H9).' % (
          key[3]['text'], T(F, 'k.son').split('. ')[-1]))''',
    r'''      'düzeyine çıksın (H4, L2-02). Kapanışın son cümlesi yayı iddiasız ve tek başına kapatır: bir sessizlikten sonra, '
      'baş dönmesi satırından ayrı bir klipte: "%s" (EV2-01, H9, MT3-04, L3-04).' % (key[3]['text'], T(F, 'k.son')))''')

# ---- §1.3 (L3-05, MT3-06, MT3-11, L3-06, TR3-05, L3-15, TR3-04, MT3-01)
rep(r'''      '**Kıyı**, **Orman** ya da **Ders içinde seçerim** der. Seçim, kaldığın yer kaydına seçenek dizini ile birlikte '
''', r'''      '**Kıyı**, **Orman** ya da **Ders içinde seçerim** der; ilk oturumda varsayılan **Orman**dır (L3-05: ilk dinleyici '
      '"ya da" kalıbını üç kez duymasın; varsayılan yaprak dokusuyla aynı sahne, su katmanı ve su güvenliği gerekmez). '
      'Seçim, kaldığın yer kaydına seçenek dizini ile birlikte '
''')
rep(r'''      'giden ses ve güneşin sıcaklığı → ayak tabanları (%s. dakikadan), koku, ardında kalan izler, esinti → "%s" (%s. '
      'dakikadan; L2-16) → dinlenme yeri, ılık taş, ışık, gökyüzü → sessiz pencere (duyurunun içinde kapı: "İstediğin '
      'an gözlerini açabilirsin."; H15) → ışıkla gölgenin yer değiştirmesi → aynı patikadan, acele etmeden dönüş → '
      'patikanın başına yaklaşma (odaya değil; H14, TR2-11) → görüntü usulca silinir, seni taşıyan zemin.' % (
          rng(IN['c4.adim']), T(F, 'c4.x.istemiyor'), rng(IN['c4.x.istemiyor'])))''',
    r'''      'giden ses → açık, aydınlık bir yere varış ve güneşin sıcaklığı (en kısa imgede de bir varış yeri var; L3-06, '
      'MT3-11) → yolun kenarında rahat bir köşe (%s. dakikadan; imgenin ilk artımı, sıra %d; TR3-05) → ayak tabanları '
      '(%s. dakikadan), yolda kalan kendi izlerin (L3-15), koku, esinti → "%s" (%s. dakikadan; L2-16) → ılık taş, ışık, '
      'gökyüzü → sessiz pencere (duyuru → kapı → dönüş sözü: "%s"; TR3-04, H15) → ışıkla gölgenin yer değiştirmesi → '
      'aynı patikadan, acele etmeden dönüş → patikanın başına yaklaşma (odaya değil; H14, TR2-11) → görüntü usulca '
      'silinir, seni taşıyan zemin.' % (
          rng(IN['c4.yerles']), F['allc']['c4.yerles'][1]['fillRank'], rng(IN['c4.adim']), T(F, 'c4.x.istemiyor'),
          rng(IN['c4.x.istemiyor']), T(F, 'c4.pencere')))''')
rep(r'''          'duyu (ses, sıcaklık) her C4\'te `c4.don` klibinden önce çalar (`timing.py` H2). Dinlenme yeri cümlesi artık '
          'isteğe bağlıdır ve gerçek kapanış fiillerini ("otur", "uzan") kullanmaz: "%s" (H2, G2-09).' % (
              m_c4, ' → '.join('"%s"' % c['text'] for c in minimal), T(F, 'c4.yerles')))''',
    r'''          'duyu (ses, sıcaklık) her C4\'te `c4.don` klibinden önce çalar (`timing.py` H2) ve her C4\'ün bir varış yeri '
          'vardır ("%s"; `timing.py` MT3-11). Dinlenecek köşe cümlesi isteğe bağlıdır, imgenin ilk artımıdır ve gerçek '
          'kapanış fiillerini ("otur", "uzan") kullanmaz: "%s" (G2-09, TR3-05, MT3-11, L3-06).' % (
              m_c4, ' → '.join('"%s"' % c['text'] for c in minimal), timing.sentences(T(F, 'c4.gunes'))[0],
              T(F, 'c4.yerles')))''')
rep(r'''    a('"X ya da Y" biçimi yalnız ana metinde kalır (`c4.yer`, `c4.ses`, `c5.dusunce`); sahne seçildiğinde hiç duyulmaz. '
      'C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değil, duyu çağrışımıdır. Son 60 sn\'de yeni imge yoktur '
      '(her vakada denetlendi).')''',
    r'''    a('"X ya da Y" biçimi yalnız `c4.yer` klibinde kalır (MT3-06, L3-05); ana metnin öteki ayrıntıları (`c4.ses`, '
      '`c4.iz`, `c4.isik`, `c5.dusunce`) iki yere de uyar ve seçimi yeniden açmaz; sahne seçildiğinde "ya da" hiç '
      'duyulmaz. C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değil, duyu çağrışımıdır. Son 60 sn\'de yeni '
      'imge yoktur (her vakada denetlendi).')''')
rep(r'''    a('"Gelip gitmek" dersin sözel motifidir: nefes (%s), imge (%s, %s) ve tanıklık (%s). Tarafsız dayanağın dili de '
      'tektir: **zemin** (%s, %s, %s, %s, %s, %s).' % (
          Q(F, 'c2.akis'), Q(F, 'c4.ses'), Q(F, 'c4.x.yaklas'), Q(F, 'c5.dusunce'), Q(F, 'a.agirlik'),
          Q(F, 'c1.x07'), Q(F, 'c3.zemin'), Q(F, 'br.orta').split('. ')[-1].rstrip('"').join(['"', '"']),
          Q(F, 'c4.solma').split('. ')[-1].rstrip('"').join(['"', '"']), Q(F, 'c5.x.dayanak')))''',
    r'''    a('"Gelip gitmek" dersin sözel motifidir: nefes (%s), imge (%s, %s) ve sessiz dinlenme (%s). Tarafsız dayanağın '
      'dili de tektir: **zemin** (%s, %s, %s, %s, %s, %s; "hep" yüklemin önünde, "seni" vurgulanmaz, TR3-03).' % (
          Q(F, 'c2.akis'), Q(F, 'c4.ses'), Q(F, 'c4.x.yaklas'), Q(F, 'c5.dusunce'), Q(F, 'a.agirlik'),
          Q(F, 'c1.x07'), Q(F, 'c3.zemin'), Q(F, 'br.orta').split('. ')[-1].rstrip('"').join(['"', '"']),
          Q(F, 'c4.solma').split('. ')[-1].rstrip('"').join(['"', '"']), Q(F, 'c5.sen')))''')

# ---- §1.5: işlevin tamamı yeniden
i0 = t.index('def part_15(L, F, a):')
i1 = t.index('# ---------------------------------------------------------------------------------------------- §2')
new15 = r'''def part_15(L, F, a):
    IN = F['in']
    act = {c['tags']['step']: c for c in L['extras']['quickClosing']['clips'] if c['tags'].get('step')}
    a('### 1.5 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)')
    a('')
    a('- **Yapı.** Luu 2024\'ün travma-duyarlı yoga nidra için önerdiği 10 bileşenden yedisi bu dersin iskeletidir: '
      'özerklik ve onay, uygun uzunluk ve hazırlık, kişinin kendi seçtiği niyet, esnek beden dolaşımı ve nefes '
      'farkındalığı, bedende hissedilen zıtlık çiftleri, özenli imgeleme, yeterli yerleşme ve dışa dönüş. "Güvenli ve rahat '
      'ortam" hazırlık kartıyla, "becerikli farkındalık" anlatımın kendisiyle dolaylı karşılanır; "uyku izni" gündüz dersi '
      'olduğu için bilinçli olarak yoktur. Makale bir öneri makalesidir, deneme değildir (PMID 39690521, DOI '
      '10.17761/2024-D-24-00021).')
    a('- **Kısa sürüm bütündür.** Tek doğrudan uzunluk karşılaştırmasında (Moszeik 2025; çevrimiçi, iki ay, ideal olarak '
      'her gün, arka plan müziği olmadan) 11 ve 30 dakikalık yoga nidra kontrollere göre küçük etki gösterdi. İkisi '
      'doğrudan karşılaştırıldığında 30 dakikalık sürüm yalnız "farkında davranma" alt boyutunda farklıydı ve bu fark '
      'sıfıra çok yakındı (d=0,10; %95 GA −0,01 ile 0,44); öteki ölçümlerde fark yoktu. İki kayıt da başta ve sonda '
      'tekrarlanan kişisel bir niyet içeriyordu (PMID 40373021, DOI 10.1002/smi.70049). Bu derste müzik yatağı var; '
      'müzikli sürümün etkisi bu çalışmadan çıkarılamaz. 11 dakikanın altındaki bir yoga nidra doğrulanmış dosyalarda '
      'sınanmadı; 5 dakikalık sürümün iskeleti korumasının kanıtı yoktur, tasarım kararıdır (VARSAYIM; EV3-03). Kronik '
      'ağrılı 23 yetişkinle yapılan yarı deneysel bir çalışmada tek 45 dakikalık yoga nidra, beden taramasına göre hemen '
      'sonrasında iyi oluşta daha fazla artışla birlikte gitti (Gibbs 2026, PMID 41743305, DOI 10.4103/ijoy.ijoy_2_25). '
      'Tasarım çıkarımı: kısa sürüm bir beden taramasına indirgenmez, iskeleti korur (niyet → dolaşım → nefes → niyet → '
      'dönüş). Hiçbir sürüm sonuç vaat etmez. Yoga nidra üzerine 73 çalışmalık bir meta-analizin yazarları, düşük yöntem '
      'kalitesi ve uygulama farklılıkları nedeniyle bildirilen etkilerin muhtemelen şişirilmiş olduğunu yazıyor (Ghai, '
      'Odyniec & Ghai 2025, PMID 41327816, DOI 10.1111/nyas.70149). Kanıtın gücü: düşük (EV3-04).')
    a('- **Nefes.** Önce değiştirilmeden izlenir: %s "Derin nefes al" komutu yoktur. Derin nefes talimatı bir çalışmada '
      'önce uyarılmayı artırdı; uyarılma sonra başlangıç düzeyine döndü (Toussaint 2021; 60 sağlıklı öğrenci; PMID '
      '34306146, DOI 10.1155/2021/5924040). Dönüşte de derinleştirme yoktur: %s (güvenlik §11.B-14, "nefesi normale '
      'bırak"; S7, TR2-19, TR3-16). Sayılar nefese hız dayatmaz: %s Sayıların başlangıçları arası 5,8–6,3 sn\'dir '
      '(dakikada ≈ 10; S8, T3, Z2-07). Veriş sonundaki kısa duraklama söylenir ama uzatılmaz ve boş bir an olarak '
      'bırakılmaz: %s (S14, TR3-10, L3-09). Nefes herkes için tarafsız bir dayanak da değildir: kronik olarak hızlı '
      'soluyan kişilerde, oturup ya da uzanıp gevşerken kandaki CO₂\'nin düşüp panik benzeri duyumlara yol açabileceğini '
      'anlatan kuramsal bir derleme var (Ley 1988; güvenlik dosyası §2; özet 3. tur incelemesinde ve 4. turda '
      'PubMed\'den yeniden çekildi ve metinle uyumlu; PMID 3148637, DOI 10.1016/0005-7916(88)90054-7; EV2-06, EV3-09). '
      'Bu yüzden nefese bakan **her** sürümde, aynı klipte nefes dışı bir kapı vardır: %s (G2-01, L2-01). %s. dakikadan '
      'itibaren dikkati nefeste olana ve ellerinde olana ayrı ayrı seslenilir (%s / %s; TR2-12, H7, TR3-01). Dayanak '
      'bölüme göre değişir: nefeste eller ve gözler; zıtlıkta, imgeden hemen önce ve sonra ve sessiz dinlenmede zemin; '
      'imgenin içinde gözler, çünkü orada "zemin" hayal edilen yer gibi duyulabilir (güvenlik §11.B-8; tasarım '
      'çıkarımı).' % (
          Q(F, 'c2.dikkat').split('. ')[0] + '."', Q(F, 'k.nefes'), Q(F, 'c2.sayac').split('. ')[-1].join(['"', '']),
          Q(F, 'c2.durak'), '"' + T(F, 'c2.dikkat').split('. ')[-1] + '"', rng(IN['c2.alt']),
          Q(F, 'c2.yer').split('. ')[0] + '."', Q(F, 'c2.alt')))
    a('- **Hız ve sessizlik.** Yavaşlık sözcük uzatarak değil, cümleler arası sessizlikle verilir; 4. turdan itibaren çok '
      'cümleli her klip tek TTS isteği olarak üretilip cümle sonlarından kesilir ve uygulama araya evreye göre sessizlik '
      'koyar (Derin evrede en az %s sn; MT3-02, L3-02; VARSAYIM). 12 kadın konuşmacı ve 28 dinleyiciyle yapılan bir '
      'deneyde 30 dakikalık "net konuşma" eğitimiyle üretilen 1,72 hece/sn\'lik konuşma en az doğal bulundu; en çok ve en '
      'uzun duraklamalar da bu koşuldaydı; alışkın okuma (3,89 hece/sn) en doğaldı (Shuminsky & Davidow 2026, PMID '
      '42757902, DOI 10.1044/2026_JSLHR-25-00691; EV2-07). Konuşmanın dili doğrulanmış dosyada belirtilmemiştir; bu '
      'sayılar Türkçe hedef değildir, yalnız yön verir; cümleler arası sessizliğin doğallığa etkisi test edilmedi '
      '(tasarım çıkarımı). Yüksek kaygılı 48 genç kadında tek seanslık progresif gevşemede, seans boyunca hızı, '
      'yüksekliği ve tonu azalan sesle çalışan grupta EMG diğer gruplardan fazla düştü (Knowlton & Larkin 2006, PMID '
      '16941239, DOI 10.1007/s10484-006-9014-6). Bu derste bulgunun yalnız ses yüksekliği yönü uygulanır (−1,5 / −3 dB) '
      've cümleler kısalır; MCP yolunda hız ve ton ayarlanamaz (tasarım çıkarımı; EV3-01). Bir müzik dinleme deneyinde '
      '(24 kişi) parçalar arasına konan 2 dakikalık müziksiz sessizlikte kalp hızı, kan basıncı ve ventilasyon '
      'başlangıcın altına indi (Bernardi 2006, PMID 16199412, DOI 10.1136/hrt.2005.064600). Bu derste pencerelerde '
      'müzik yatağı sürer; pencerelerin değeri bu bulgudan doğrudan çıkmaz (tasarım çıkarımı). 90 sn üst sınırı '
      'güvenlik §11.B-16\'daki 60–90 sn önerisinden gelir; doğrulanmış bir eşik değildir (VARSAYIM). Acemilerde 8 '
      'haftalık, beden odaklı ve koçluk içeren rehberli bir program, rehbersiz sessiz pratiğe göre benlik saygısında ve '
      'sürekli kaygıda daha büyük değişimle birlikte gitti; program koçluk da içerdiği için yalnız ses rehberliğinin '
      'payı ayrılamaz (Lieutaud & Bourhis 2026, PMID 42466037, DOI 10.3389/fpsyg.2026.1833806; EV2-09). Tasarım '
      'çıkarımı: sessizlik değerli ama rehbersiz kalmamalı; pencereler duyurulur, bir kapı taşır ve karşılanır.' % (
          n(L['limits']['sentenceGapMinDerinSec'])))
    a('- **Niyet cümlesi.** "Sevilmeye değer biriyim" cümlesini tekrarlayan öz-saygısı düşük kişiler daha kötü hissetti '
      '(Wood 2009, PMID 19493324, DOI 10.1111/j.1467-9280.2009.02370.x). Hazır niyet bu yüzden bir yargı değil, kişinin '
      'kendine verdiği bir izindir: %s (TR2-04; TR3-04: "dinlenme izni" hem olumsuz emir "DİNlenme" okunuşuna açıktı '
      'hem iş hukukundaki izni çağrıştırıyordu). İzin cümlesinin bu riski taşımadığı test edilmedi; bu bir tasarım '
      'çıkarımıdır. Söyleme eylemi itaat varsayan bir yönerge ("söylüyorsun") değil, "-mek yeterli" biçimindedir '
      '(S3-08); 5 dakikada niyet bir kez, 6 dakikadan itibaren üç kez söylenir ve üç söyleyişe en az 10 sn bırakılır '
      '(L3-03, MT3-05, Z3-03). Niyetin kalıcılığı için güvence verilmez (EV2-03): %s Sondaki cümle günün saatinden '
      'bağımsızdır, seçimi dinleyiciye bırakır ve dua ağzı taşımaz: %s (L2-17, TR3-15).' % (
          F['niyet'], Q(F, 'n1.birak'), Q(F, 'n2.dilek')))
    a('- **Huzursuzluk olağandır.** Klinik tanısı olmayan, kronik kaygılı 30 kişiye kayıttan dinletilen tek seans '
      'progresif gevşemede 5 kişide (%%17) seans sırasında kaygı arttı (Braith 1988, PMID 3069875, DOI '
      '10.1016/0005-7916(88)90040-7). Meditasyonla ilişkili istenmeyen etkiler 83 çalışmada toplam %%8,3 sıklıkta görüldü '
      '(deneysel çalışmalarda %%3,7, gözlemsel çalışmalarda %%33,2; Farias 2020, PMID 32820538, DOI 10.1111/acps.13225; '
      'EV2-08). Bu yüzden **her sürümde, 5 dakikada da,** varış %s der (`a.kolay`; S2, B6, P-B1, TR2-07). %s (`a.karar`; '
      'TR2-14) %s. dakikadan itibaren eklenir. Zihnin kaymasını `c2.birak`, kaçırılan adı `c1.kacirma`, hissetmeden '
      'tekrarlamayı `c1.tekrar` (TR3-13), hissedilmeyen ağırlığı `c3.gelmezse` (L2-05; zıtlık olan her sürümde ve '
      'denemeden sonra: S3-03, MT3-09, L3-11), gelmeyen görüntüyü `c4.gelmezse`, dalıp gitmeyi `c4.donus1` bağışlar; '
      'isteğe bağlı olanların hangi sürede girdiği §3\'teki sıra numarasından okunur. Anahtar cümle ve kapanış hiçbir '
      'yerde "dinlendin" demez (G2-08, EV2-01).' % (Q(F, 'a.kolay'), Q(F, 'a.karar'), rng(IN['a.karar'])))
    a('- **Dönüş.** Hipnozdan çıkarma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017; klinik '
      'yorum ve 3 vaka; PMID 28300508, DOI 10.1080/00029157.2016.1203281). Ayağa kalkınca ilk anda görülen kan basıncı '
      'düşüşü, sürekli ölçümle 65 yaş üstünde havuzlanmış olarak %%29 (%%95 GA 22,1–36,9; çalışmalar arası fark çok '
      'büyük, I²=%%94,6; Tran 2021, PMID 34260686, DOI 10.1093/ageing/afab090). Uzun gevşemeden sonra kalkışta baş '
      'dönmesinin sıklığı doğrudan ölçülmedi; bağlantı bu KB kanıtından çıkarılmıştır (güvenlik §7; EV3-08). Kapanış bu '
      'yüzden yana dönme (%s sn), ellerden destek alarak oturma (%s sn), oturarak birkaç nefes bekleme (%s sn, ≈ üç '
      'dinlenik nefes; süreler VARSAYIM, Tran 2021 bir bekleme süresi önermez) ve acele etmeden kalkma adımlarını '
      'içerir. Kalkış cümlesi baş dönmesi satırını taşır ve son cümleden ayrı bir kliptir: %s (G2-04; güvenlik §11.A: '
      '"Başın dönerse otur ve bekle"; MT3-04, L3-04). Baş dönmesi satırı yalnız hareket (G2-07) ve kalkış (G2-04) '
      'kliplerindedir; bekleme klibindeki üçüncü kopya çıkarıldı (TR3-21). Bu sessizlikler hiçbir sürede sıkıştırılmaz '
      '(güvenlik §7 Karar; B2, T1, S4, P-B4, E7). "Kapanışa geç" aynı süreleri kullanır; imge ya da zıtlık açıkken önce '
      'ön klip çalar (%s / %s; S3-01, MT3-07) ve dizi %s sn\'lik ön sessizlikte dönüş tınısı ve ses rampasıyla başlar '
      '(S3-02). Durdur yolu yana dönüp oturmaya %s sn verir, bekleme ondan sonra ekran metniyle sessizce sürer (Z2-01, '
      'G2-05, TR3-22).' % (
          n(act['yan']['gapAfter']['min']), n(act['otur']['gapAfter']['min']), n(act['bekle']['gapAfter']['min']),
          Q(F, 'k.kalk'), Q(F, 'k.hizli.imge'), Q(F, 'k.hizli.his'), n(L['extras']['quickClosing']['leadInSec']),
          n(next(c for c in L['extras']['stopReturn']['clips'] if c['id'] == 'd.kalk')['gapAfter']['min'])))
    a('- **Hareket.** Yoga yan etkilerine ilişkin 76 vakayı derleyen sistematik derlemede en sık kas-iskelet sistemi '
      'etkilenmişti (Cramer 2013, PMID 24146758, DOI 10.1371/journal.pone.0075515); Almanya\'da 1.702 kişilik bir ankette '
      'gözetimsiz, tek başına çalışmak yan etki riskinin artmasıyla ilişkili bulundu (Cramer 2019, PMID 31357980, DOI '
      '10.1186/s12906-019-2612-7; EV3-10). Tek gerçek hareket olan gerinme bu yüzden "zorlamadan" ve %s ile gelir; '
      'nesnesiz "bırak" bu derste "gevşe" demek olduğu için güvenlik satırı "hareketi bırak" der ve tek okunuşu vardır '
      '(güvenlik §11.B-17; S6, S13, E8, P-N4, G2-07, EV2-11, TR3-07). İki eylem (parmakları oynatmak ve acele etmeden '
      'gerinmek) için %s sn bırakılır (MT3-14).' % (
          '"' + T(F, 'k.hareket').split('. ')[-1] + '"', n(F['allc']['k.hareket'][1]['gapAfter']['min'])))
    a('- **"Hipnoz" vaadi yok.** Öğle şekerlemesinden önce dinletilen "daha derin uyu" telkin kaydı, 70 sağlıklı genç kadında '
      'kontrol koşuluna göre derin uykuyu artırdı; telkine az yatkın kişilerde bu etki ek deneylerde görülmedi (Cordi 2014, '
      'PMID 24882909, DOI 10.5665/sleep.3778). Etki kişiden kişiye değiştiği için metin derinleşmeye izin verir ama '
      'zorlamaz ve kimseye vaat etmez. İmgede iniş, "her adımda daha çok dinlenme" ya da yolun dinleyiciyi taşıması gibi '
      'derinleştiriciler yoktur (S3, B3, E1). Sahibin "hipnoz olmalıyım" isteği, içine çeken ve kesintisiz bir deneyim '
      'olarak karşılanır. Kartın sözü de bir sonuç değil, davettir: "%s" (EV3-12).' % L['tagline'])
    a('- **Uzaklaşma hissi.** 114 kişilik bir gevşeme deneyinde "uzakta, ilgisiz" hissetmek bütün gevşeme gruplarında hem '
      'olumsuz duyguyla hem bedensel gevşemeyle birlikte gitti; yazarlar bunun gevşemeye bağlı kaygıya yol açmayabileceğini, '
      'onunla baş etmeye yardım edebileceğini yorumluyor (Khasky & Smith 1999; ilişki bulgusu, neden-sonuç değil; PMID '
      '10483629, DOI 10.2466/pms.1999.88.2.409; özet 3. tur incelemesinde ve 4. turda PubMed\'den yeniden çekildi). Bulgu '
      'iki yönlü olduğu için "neredeyse ağırlıksız" yine de kullanılmıyor, hafiflik zeminle birlikte söyleniyor: %s Bu '
      'bir tasarım çıkarımıdır (S13, P-S9; EV3-02).' % Q(F, 'c3.nefeskadar'))
    a('- **Göz kökeni.** Gözler hiçbir yerde zorlanmaz ve açık gözün bakışı hiçbir sürümde bir noktaya bağlanmaz: %s '
      '(S3-05, TR3-14: "bir noktaya yumuşakça bakmak" çevirisi ve sabit nokta gitti; G2-13 böylece 5–14 dakikalık '
      'sürümlerde de doğru). Nefeste: "…gözlerini açmak da olur."; içten saymada: "%s" (TR3-11: gözü kapalı dinleyene '
      'gerçek kapı); imgeden önce: "Gözlerin açıksa bakışın serbest."; imgelemede: "gözlerin açık kalsa da" ve '
      'pencerenin duyurusunda "İstediğin an gözlerini açabilirsin." Dolaşımda yalnız "göz kapakları" ve "gözlerin '
      'çevresi" geçer; göze bastırma ve avuçlama yoktur. Dönüşte gözler "ışığa alıştıra alıştıra" açılır; şafak '
      'görselinin parlaklığı sınırlıdır ve en az 60 sn\'de yükselir (S18).' % (
          Q(F, 'a.gozler'), timing.sentences(T(F, 'c2.x.kendin'))[1]))
    a('')


'''
t = t[:i0] + new15 + t[i1:]
p.write_text(t, encoding='utf-8')
print('ok', len(t))
