import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

# ---- compute(): 30 dk 6,6 düşükte yalnız-Derin 60 sn pencerelerinin hece dağılımı (Z3-01) ve düzlük esnemesi (Z3-09)
rep(r'''    _, lint_out = timing.lint_text(L)
''', r'''    pz = plans[(6.6, 'lo', 30)]
    vals, w = [], 0.0
    while w + 60 <= pz['total'] + 1e-6:
        syl, phases = 0.0, set()
        for ev in pz['events']:
            for s0, s1, sy in timing.speech_spans(ev):
                ov = max(0.0, min(w + 60, s1) - max(w, s0))
                if ov > 0:
                    syl += sy * ov / (s1 - s0)
                    phases.add(ev['clip']['phase'])
        if phases == {'Derin'}:
            vals.append(syl)
        w += 1.0
    vals.sort()
    F['derin60'] = (vals[len(vals) // 2], vals[int(0.9 * (len(vals) - 1))], vals[-1]) if vals else (0.0, 0.0, 0.0)
    pf = [timing.stretch(plans[(r, pr, m)]) for (r, pr), ms in F['plateaus'].items() for m in ms if 14 <= m <= 16]
    F['plateau_f'] = max(pf) if pf else None
    _, lint_out = timing.lint_text(L)
''')

# ---- §2.2
rep(r'''def part_2(L, F, a):
    a('## 2. Süre modeli, planlayıcı ve eşikler')''', r'''def part_2(L, F, a):
    IN = F['in']
    a('## 2. Süre modeli, planlayıcı ve eşikler')''')
rep(r'''    a('- Eklemleme hızları: 5,2 (REST speed≈0,8; tahmin), 5,6 (v4, ölçüm), 6,6 (v2 varsayılan, ölçüm).')''',
    r'''    a('- Eklemleme hızları: 5,6 (eleven_v4, ölçüm; **üretim hızı**), 6,6 (v2 varsayılan, ölçüm; hızlı uç), 5,2 (muhafazakâr '
      '**alt zarf**: MCP\'de üretilemez, tasarlanacak hoca sesi ölçülene kadar tutulur; Z3-02, L3-01, MT3-03). Yol yalnız '
      'MCP\'dir (sahip kararı, 2026-09-29); üretim köşesi 5,6 yüksek, zarf köşesi 5,2 yüksek.')''')
rep(r'''      'noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2\'de '
      '(speed 0,8) duraklamalar ×1,25 alındı.')''',
    r'''      'noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2 '
      'zarfında duraklamalar ×1,25 alındı. Tasarlanacak hoca sesinin ölçülen hızı ve duraklama profili üçüncü satır '
      'olarak eklenir: `python3 timing.py --rate 7.1 --profile aday:0.30,0.10,0.20,0.60` (Z3-04).')''')
rep(r'''      'değişecek; Z2-07). Taşıyıcının ön sözü (ör. "sayıyorum:") kesilip atılır, süreye girmez.')
''', r'''      'değişecek; Z2-07). Taşıyıcının ön sözü (ör. "sayıyorum:") kesilip atılır, süreye girmez.')
    sg = L['sentenceGapByPhase']
    a('- **Cümle arası sessizlik (MT3-02, L3-02):** çok cümleli birim tek TTS isteğidir (ezgi korunur), cümle sonlarından '
      '(nefes çiftinde virgülden) kesilir; kesilen her parça kendi uç payını taşır, TTS\'in cümle sonu duraklaması yerine '
      'uygulamanın evreye göre sessizliği gelir: Varış %s, Derinleşme %s, Derin %s, Kapanış %s sn (min / pref / max; '
      'nefes çiftinde %s; hepsi VARSAYIM). Bu sessizlikler öteki sessizliklerle aynı oranla esner; Derin evrede hiçbir '
      'cümle sınırında %s sn\'den az sessizlik yoktur (`timing.py`). 5 dakikalık sürüme özgü kısa biçimler (`short`; '
      'L3-03, MT3-05) aynı kimlikle çalar, önek kuralı bozulmaz.' % tuple(
          ['%s / %s / %s' % (n(g['min']), n(g['pref']), n(g['max'])) for g in (
              sg['Varış'], sg['Derinleşme'], sg['Derin'], sg['Kapanış'], L['sentenceGapBreathPair'])]
          + [n(L['limits']['sentenceGapMinDerinSec'])]))
''')
# ---- §2.3
rep(r'''    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2) zorunlu klipleriyle (`minTarget`\'i dolanlar dahil: "%s" 7 '
      'dakikadan). Köprü `br.k2` C2\'nin hemen ardından, **yalnız C3 ya da C4 seçiliyse** (`requiresAnyBlock`; H3); köprü '
      '`br.orta` C4\'ün olduğu her sürümde C4\'ün hemen önünde (S1). Taban en kısa haliyle de sığmazsa, yalnız acil durum '
      'yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu yol hiçbir vakada kullanılmadı.' % T(F, 'c2.kal'))''',
    r'''    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2) zorunlu klipleriyle (`minTarget`\'i dolanlar dahil: "%s" %s. '
      'dakikadan). Köprü `br.k2` C2\'nin hemen ardından, **yalnız C3 ya da C4 seçiliyse** (`requiresAnyBlock`; H3); köprü '
      '`br.orta` C4\'ün olduğu her sürümde C4\'ün hemen önünde (S1). Taban en kısa haliyle de sığmazsa, yalnız acil durum '
      'yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu yol hiçbir vakada kullanılmadı.' % (
          T(F, 'c2.kal'), rng(IN['c2.kal'])))''')
# ---- §2.4
rep(r'''      'sözcükleri 60 sn içinde ikinci kez yok; 6,6\'da her klip <= 15 sn; "birkaç nefes" ya da "nefes … kal" isteyen ''',
    r'''      'sözcükleri 60 sn içinde ikinci kez yok; her hızda birimin konuşması <= 15 sn (yavaş ses dahil; Z3-07); "birkaç '
      'nefes" ya da "nefes … kal" isteyen ''')
rep(r'''      'grubu 60 sn\'den uzun olduğu için tek düzlük kaçınılmaz). 5 dakikanın 5,2 yüksek köşesinde boş pay >= 15 sn '
      'artık bir denetimdir (T6, Z2-04).')
''', r'''      'grubu 60 sn\'den uzun olduğu için tek düzlük kaçınılmaz). 5 dakikanın boş payı (T6, >= 15 sn) artık üretim '
      'köşesinde (5,6 yüksek) denetlenir; zarf köşesi (5,2 yüksek) raporlanır ve planı bütün öteki denetimlerden geçmek '
      'zorundadır (Z2-04 → L3-01, Z3-02).')
    a('- **4. tur ekleri:** Derin evrede her cümle sınırında >= %s sn uygulama sessizliği (L3-02, MT3-02); ağırlık listesi '
      'çalıyorsa bağışlama cümlesi de çalar ve "bütün beden ağır."dan sonra gelir (S3-03, MT3-09); göğüs ve karından '
      'önceki 120 sn içinde bir atlama kapısı başlar (S3-04); imge olan her planda `c4.don`dan önce bir varış yeri '
      '(MT3-11, L3-06); 7. dakikadan itibaren varış zemin cümlesiyle biter (MT3-12); 5 dakikada en uzun boşluk >= 16 sn '
      '(L3-03; MCP hızlarında); "Kapanışa geç" her bağlamda (Derin evreden, C4 içinden, C3 içinden, üç pencerenin '
      'içinden) doğru ön klip, T1, TR2-03, dolgu ve 4 sn rampa sessizliği (S3-01, S3-02, MT3-07); birimin konuşması her '
      'hızda <= 15 sn (Z3-07); kart ve ekran metinleri de yasak ve E12 listeleriyle (EV3-06, EV3-13); kör panel yedeği '
      'anahtar cümle kısalmasını bozmaz (TR3-08); json\'daki alt klipler metinden türetilenle aynı (MT3-02); üretim '
      'hızında (5,6) en az bir ses tipinde Derin etkin medyan hızı tavanın altında (P-S1). Bilgi olarak: C2–C4 blok '
      'konuşma payı (Z3-01) ve düzlükler (Z3-09).' % n(L['limits']['sentenceGapMinDerinSec']))
''')
rep(r'''      'kurallarla; "Kapanışa geç" 60–95 sn ve Durdur dönüşü 20–30 sn; Derin evre cümle kliplerinin iç hızı (aşağıda).')''',
    r'''      'kurallarla; kart ve ekran metinleri de aynı listelerle (EV3-06; "sakinleş", "huzur bul", "yenilen", "tazelen", '
      '"dinç", "gevşedin", "gevşemiş", "derin uyku" kökleri eklendi, EV3-13); "Kapanışa geç" her bağlamda 60–110 sn, '
      'pencerenin içinden 60–120 sn; Durdur dönüşü 20–30 sn; Derin evre cümle kliplerinin iç ve etkin hızı (aşağıda).')''')
rep(r'''    a('- **Tekrar uyarısı (L2-14):** 10 sn içindeki ya da ardışık cümle kliplerinde aynı 5 harflik kök ve "dön" gibi '
      'duyulan kısa kökler; bilinçli tekrarlar klipte etiketlidir. Bu turda uyarı: %s.' % (''',
    r'''    a('- **Tekrar uyarısı (L2-14; 4. tur TR3-06, MT3-16):** 10 sn içindeki ya da ardışık cümle kliplerinde aynı 5 harflik '
      'kök, "dön" gibi duyulan kısa kökler ve "arasından" gibi aynı ilgeç sözcüğü; sahne planları da taranır; aynı '
      'klibin ardışık iki cümlesi de denetlenir (3 harf ve üstü kök); bilinçli tekrarlar klipte etiketlidir. Bu turda '
      'uyarı: %s.' % (''')
# ---- §2.5
rep(r'''    a('**Bu sonucun kapsamı (P-S1):** 78/78 zamanlama ve metin kurallarının sonucudur; dinleme sınavı değildir. Derin evre '
      'cümle kliplerinin iç hızı (hece ÷ klip süresi, klip içi duraklamalar dahil) ayrıca ölçüldü ve bir tasarım '
      'tavanıyla karşılaştırıldı: **Derin evre iç hız tavanı (VARSAYIM; kanıta dayanmaz)**, <= 5,0 hece/sn (EV2-04):')''',
    r'''    a('**Bu sonucun kapsamı (P-S1):** 78/78 zamanlama ve metin kurallarının sonucudur; dinleme sınavı değildir. Derin evre '
      'cümle kliplerinin **iç hızı** (hece ÷ konuşma süresi, cümle içi TTS duraklamaları dahil) ve **etkin hızı** (hece ÷ '
      '(birimin konuşması + cümle arası uygulama sessizlikleri, pref); MT3-02) ayrıca ölçüldü ve bir tasarım tavanıyla '
      'karşılaştırıldı: **Derin evre iç hız tavanı (VARSAYIM; kanıta dayanmaz)**, <= 5,0 hece/sn (EV2-04):')''')
rep(r'''        ln = re.sub(r'→ .*?((?:medyan )?tavanın (?:altında|üstünde))', r'→ \1', ln)
''', r'''        ln = ln.replace('→ Derin evre iç hız tavanı (<= 5; VARSAYIM, kanıta dayanmaz) ', '→ tavana (<= 5) göre ')
''')
rep(r'''    a('Okuma (medyana göre): yol A (REST, hız 0,80 ≈ 5,2) yüksek duraklamalı seste tavanın altında, düşük duraklamalı '
      'seste tavanın hemen üstündedir; en hızlı klipler her yolda tavanın üstündedir; 6,6 hece/sn\'deki v2 varsayılan '
      'okuma (MCP yolu) hiçbir profilde tavanın altına inmez. Bu, yol '
      'kararına (PLAN §G5) bir girdi olarak yazıldı; bir kanıt eşiği değildir. teslim S4\'ün 2,5–3,0 hece/sn bandını '
      '(VARSAYIM) hiçbir yol karşılamaz; bu bant ancak sözcük uzatarak tutulabilir, bu da S3 ve Shuminsky 2026 yönüne '
      'aykırıdır. Yaşlı dinleyiciye uygunluk kör panelde (CRITIQUE #22, 65+ üye) dinlenerek sınanacak. Üç nokta yalnız '
      'listelerde kaldı: cümle içine duraklama eklemek için üç nokta kullanmak PLAN C.2\'ye ve anahtar cümle kuralına '
      'aykırıdır (P-S1 madde 3 bu yüzden uygulanmadı).')''',
    r'''    R = F['rates']

    def rr(rate, pr):
        v = R.get((rate, pr))
        return ('iç %s / etkin %s' % (n(round(v[0], 2)), n(round(v[2], 2)))) if v else '?'
    a('Okuma (medyana göre; yol yalnız MCP, sahip kararı): iç hız her hızda tavanın üstündedir, çünkü MCP\'de sözcük '
      'uzatılamaz ve uzatılmaz. Etkin hız (cümle arası sessizlik dahil; MT3-02) v4\'te (5,6) düşük duraklamalı seste %s, '
      'yüksek duraklamalı seste %s; v2\'de (6,6) %s ve %s; zarfta (5,2) %s ve %s hece/sn. Tavan (VARSAYIM) açısından v4 '
      'öne çıkar: üretim hızında en az bir ses tipinde etkin medyan tavanın altında kalmalıdır (`timing.py` P-S1, 4. '
      'tur; EV3-01). Bu bir kanıt eşiği değildir. teslim S4\'ün 2,5–3,0 hece/sn bandını (VARSAYIM) hiçbir yol karşılamaz; '
      'bu bant TTS ile ancak sözcük uzatarak ya da cümle içine duraklama koyarak tutulabilir, ikisi de PLAN C.2 ve S3 '
      'tasarım kuralına aykırıdır. Shuminsky 2026 yalnız 1,72 hece/sn\'nin en az doğal bulunduğunu gösterir; 2,5–3,0 '
      'bandı hakkında bir şey söylemez (tasarım kararı, kanıt değil; EV3-07). Yaşlı dinleyiciye uygunluk kör panelde '
      '(CRITIQUE #22, 65+ üye) dinlenerek sınanacak. Üç nokta yalnız listelerde ve nefes çiftinin TTS metninde (kesim '
      'işareti; ekranda virgül) kaldı: cümle içine duraklama eklemek için üç nokta kullanmak PLAN C.2\'ye ve anahtar '
      'cümle kuralına aykırıdır (P-S1 madde 3 bu yüzden uygulanmadı).' % (
          rr(5.6, 'lo'), rr(5.6, 'hi'), rr(6.6, 'lo'), rr(6.6, 'hi'), rr(5.2, 'lo'), rr(5.2, 'hi')))''')
rep(r'''      '6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik yoğunluk sınırı (süreler %5–10 kısa çıkarsa), 5,2 yüksek köşesinin 5 '
      'dakikalık boş payı ve 15. dakika çevresindeki C4 girişi (süreler %5–10 uzun çıkarsa). Gerçek `voice.sec` değerleri '
      'gelince `timing.py` aynı denetimlerle yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar '
      'ayarlanır (§7).')''',
    r'''      '6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik yoğunluk sınırı (süreler %5–10 kısa çıkarsa), 5 dakikanın boş payı '
      've 15. dakika çevresindeki C4 girişi (süreler %5–10 uzun çıkarsa). Tasarlanacak hoca sesi Neslihan v2\'den ≈ %10 '
      'hızlıysa 5 ve 14. dakikanın yoğunluk sınırı aşılır; bu yüzden aday ses ölçülmeden kör panele girmez (Z3-04, §6). '
      'Gerçek `voice.sec` değerleri gelince `timing.py` aynı denetimlerle yeniden koşar; düşen vaka olursa önce '
      'sessizlik sınırları ve sıralar ayarlanır (§7).')''')
rep(r'''    a('En dar yer 5 dakikanın en yavaş ucudur (5,2 hece/sn + Hakan duraklamaları ×1,25): %s sn boş pay kalır (T6: en az '
      '15 sn; bu turda denetim). 30:00\'da sessizlikler pref\'ten max\'a doğru en çok %%%d esner (T2: <= %%30); içerik 20. '
      'dakikadan 30. dakikaya kadar en çok bir dakikalık düzlükle büyür. Bütün metin (isteğe bağlı ve genişletmelerle) %d '
      'hecedir (%s); en hızlı seste (6,6, düşük) 30. dakikada %s; yavaş seste zıtlık ve tanıklık genişletmelerinin bir '
      'kısmı 30 dakikaya sığmaz.%s' % (
          r1(F['slack5'][(5.2, 'hi')]), round(100 * max(F['stretch30'].values())), F['full_syl'],
          ', '.join('%s. turda %d' % (k, v['full_syl']) for k, v in sorted(old.items())) or '—',
          ('%s dışında bütün metin çalar' % ', '.join('`%s`' % i for i in miss_fast)) if miss_fast
          else 'bütün metin çalar',
          (' %s hiçbir modellenmiş vakada çalmaz: sıranın sonundaki yedek genişletmedir, klip süreleri kısa çıkarsa '
           'girer.' % ', '.join('`%s`' % i for i in F['never'])) if F['never'] else ''))''',
    r'''    plat = '; '.join('%s %s: %s' % (n(r), 'düşük' if pr == 'lo' else 'yüksek',
                                    ', '.join('%d' % m for m in F['plateaus'][(r, pr)]) or 'yok')
                     for r in timing.RATES for pr in ('lo', 'hi'))
    a('En dar yer 5 dakikanın üretim köşesidir (5,6 hece/sn + Hakan duraklamaları): %s sn boş pay kalır (T6: en az 15 '
      'sn; denetim; L3-01, Z3-02). Zarf köşesinde (5,2 + duraklamalar ×1,25) %s sn kalır; bu köşe MCP\'de üretilemez, '
      'yalnız bilgi olarak raporlanır ve planı bütün öteki denetimlerden geçer. 30:00\'da sessizlikler pref\'ten max\'a '
      'doğru en çok %%%d esner (T2: <= %%30). **Düzlükler (Z3-09):** içeriği bir önceki dakikayla aynı olan dakikalar: '
      '%s. 14–16. dakika çevresindeki düzlük her hızda vardır: bir önceki dakikanın içeriği 60 sn daha uzun sessizlikle '
      'çalar (f en çok %s); nedeni yapısaldır, C4 tek adımda (≈ 3 dk) girer; 20. dakikadan sonra en çok bir ardışık '
      'düzlük (T2). Bütün metin (isteğe bağlı ve genişletmelerle) %d hecedir (%s); en hızlı seste (6,6, düşük) 30. '
      'dakikada %s; yavaş seste zıtlık ve sessiz dinlenme genişletmelerinin bir kısmı 30 dakikaya sığmaz.%s' % (
          r1(F['prod']), r1(F['env']), round(100 * max(F['stretch30'].values())), plat,
          n(round(F['plateau_f'], 2)) if F['plateau_f'] is not None else '?', F['full_syl'],
          ', '.join('%s. turda %d' % (k, v['full_syl']) for k, v in sorted(old.items())) or '—',
          ('%s dışında bütün metin çalar' % ', '.join('`%s`' % i for i in miss_fast)) if miss_fast
          else 'bütün metin çalar',
          (' %s hiçbir modellenmiş vakada çalmaz.' % ', '.join('`%s`' % i for i in F['never'])) if F['never']
          else ' Hiçbir metin boşa yazılmadı: her klip en az bir planda çalar (Z3-06 kuralı; `c5.x.sessizlik`, '
               '`c3.x.hepsi` ve `c5.x.dayanak` bu yüzden çıkarıldı, `n2.x.his` L3-07 gereği).'))''')
rep(r'''    a('**Metin bütçesi bu ders için bilinçli olarak PLAN B.4.1\'in altındadır (S12-hoca).** PLAN B.4.1, tam metnin hızlı '
      'seste orta konuşma payına (≈ %%36) ulaşmasını ister; bu derste 30 dakikanın konuşma payı %%%s–%%%s\'%s. Nedeni: yoga '
      'nidranın derin evresi sessizlikle çalışır (PLAN B.4.1\'in kendi "derin blok" bandı %%8–20), üç duyurulmuş pencere '
      'vardır ve derin evredeki 60 sn\'lik yoğunluk sınırı (<= 110 hece) daha çok söze izin vermez. Sessizlik doldurulmadı: '
      'içerik büyür ve 30:00\'da esneme %%%d\'%s geçmez (T2). PLAN B.4.1\'de bu ders için not var.' % (
          r1(100 * min(F['share30'].values())), r1(100 * max(F['share30'].values())),
          ek4(son_okunan(r1(100 * max(F['share30'].values()))), 'dir'),
          round(100 * max(F['stretch30'].values())),
          ek4(son_okunan(round(100 * max(F['stretch30'].values()))), 'i')))''',
    r'''    sh = F['shares']
    d60 = F['derin60']
    a('**Metin bütçesi bu ders için bilinçli olarak PLAN B.4.1\'in altındadır (S12-hoca); sahibe görünür istisna '
      '(Z3-01).** PLAN B.4.1, tam metnin hızlı seste orta konuşma payına (≈ %%36) ulaşmasını ister; bu derste 30 '
      'dakikanın konuşma payı %%%s–%%%s\'%s (konuşulan parçalara göre; cümle arası sessizlikler sessizliktir). Nedeni: '
      'yoga nidranın derin evresi sessizlikle çalışır (PLAN B.4.1\'in kendi "derin blok" bandı %%8–20) ve derste üç '
      'duyurulmuş pencere vardır; derin evredeki 60 sn\'lik yoğunluk tavanı (<= 110 hece, VARSAYIM) ise bağlayıcı '
      'değildir: 30 dk 6,6 düşükte yalnız Derin evredeki 60 sn pencerelerinin medyanı %d, %%90\'lık dilimi %d, en yükseği '
      '%d hecedir (bu turun ölçümü). Seyreklik bir tasarım seçimidir. C2, C3 ve C4\'ün blok konuşma payı 20 dakika ve '
      'üstünde PLAN B.4.1\'in rehberli çekirdek alt sınırının (%%%d) altındadır: C2 %%%d–%%%d, C3 %%%d–%%%d, C4 %%%d–%%%d '
      '(`timing.py` Z3-01, bilgi). Payı sınıra çıkarmak 30 dakikada ≈ 120 sn (≈ 800 hece) ek Derin evre metni ister; '
      'bu metin sahip onayı olmadan yazılmadı (§7). Sessizlik doldurulmadı: içerik büyür ve 30:00\'da esneme %%%d\'%s '
      'geçmez (T2). PLAN B.4.1\'de bu ders için not var.' % (
          r1(100 * min(F['share30'].values())), r1(100 * max(F['share30'].values())),
          ek4(son_okunan(r1(100 * max(F['share30'].values()))), 'dir'), round(d60[0]), round(d60[1]), round(d60[2]),
          round(100 * timing.BLOCK_SHARE_FLOOR),
          round(100 * sh['C2'][0]), round(100 * sh['C2'][1]), round(100 * sh['C3'][0]), round(100 * sh['C3'][1]),
          round(100 * sh['C4'][0]), round(100 * sh['C4'][1]),
          round(100 * max(F['stretch30'].values())),
          ek4(son_okunan(round(100 * max(F['stretch30'].values()))), 'i')))''')

# ---- §3: blok tanımları
rep(r'''              'C4': 'imge yayı', 'C5': 'tanıklık', 'N2': 'niyetin tekrarı', 'K': 'dışa dönüş ritüeli'}''',
    r'''              'C4': 'imge yayı', 'C5': 'sessiz dinlenme', 'N2': 'niyetin tekrarı', 'K': 'dışa dönüş ritüeli'}''')
i0 = t.index('def intro(F, L):')
i1 = t.index('def part_3(L, F, a):')
new_intro = r'''def intro(F, L):
    IN = F['in']
    return {
        'A': 'Sabit kapak; tek blok (T4). 5 dakikada: karşılama, derse özgü açılış, duruş (zemine yerleşmeyle; MT3-05), gözler '
             '(bakış serbest, bir noktaya bağlı değil; S3-05, TR3-14), ortak çıkış cümlesi ve "Gevşemek her zaman kolay '
             'olmaz" (S2, B6, P-B1). Süre arttıkça kontrol cümlesi, kıpırdanıp yerleşme, konfor (uzanmadan önce, 12 sn eylem '
             'payı; MT3-13, Z3-08) ve varışın son cümlesi olarak zemin (%s. dakikadan; H5, MT3-12: varış bir uyarıyla değil '
             'bedenle biter) eklenir; hiçbiri sonra düşmez. Sıra (H17 → 4. tur): karşılama → açılış → [konfor] → duruş → '
             'gözler → [kıpırdanma] → [kontrol] → çıkış cümlesi → huzursuzluk → [zemin]. Çıkış cümlesinin üç "-(y)abil-"i '
             'çevresinde başka "-(y)abil-" yoktur (TR2-03): duruş "-man yeterli", gözler "sana kalmış", konfor "iyi olur", '
             'zemin ve kontrol şimdiki zaman, huzursuzluk geniş zaman. Derse özgü açılış "Bir şey başarman gerekmiyor" '
             '(L3-12: "yapman gereken hiçbir şey yok" hemen ardından gelen yönergelerle çelişiyordu; eski cümle dönüşümlü '
             'seçenek). Duruş cümlesi "yan yatmak" deyimiyle ve virgülsüzdür ("yan!" emri gibi okunmaz; TR3-02).' % rng(
                 IN['a.agirlik']),
        'N1': 'P1. Niyet başta. Seçim ve hazır cümle tek klipte (H1 b); seçme süresi klibin ardındaki sessizliktir. Hazır '
              'cümle: %s (TR3-04). Söyleme eylemi "söylemek yeterli" (S3-08; itaat varsayan "söylüyorsun" yok); üç '
              'söyleyişe en az 10 sn (Z3-03); 5 dakikada bir kez söylenir (kısa biçim, aynı kimlik; L3-03, MT3-05). Niyet '
              'aklında tutulmaz, dersin sonunda hatırlatılır (EV2-03, TR3-09). "Sankalpa" sözcüğü seste yok, bölüm adında '
              'ekranda (PLAN C.7).' % F['niyet'],
        'C1': 'P1. Beden dolaşımı. Çerçeve iki kısa cümledir ve atlama kapısını güvenlik gereği emir kipiyle açar ("atla"; '
              'güvenlik §11.B-1, -9); fark etme şimdiki zamanla anlatılır, kehanet gibi okunan geniş zaman ve C2\'nin '
              'saymasıyla çakışan "saydığım" yoktur (TR3-13, L3-13, MT3-16). Hissetmesen de adı tekrarlamak yeter '
              '(`c1.tekrar`; TR3-13, MT3-08). En kısa sürümde her taraf 4 nokta (başparmak, omuz, diz, ayak tabanı), sırt '
              '1 (omurga), ön 3 noktadır (alın, göz kapakları, göğüs; L2-08 gereği çene kısa listeden çıktı). Süre '
              'arttıkça önce parmaklar, sonra bacak, el ve kolun tamamı, sırt ve yüz girer; sağ ve sol aynı grupta. Sırtın '
              've önün uzun listesi girdiğinde önüne bir bölge işareti gelir (%s. ve %s. dakikadan; L2-09); önün işareti '
              '"Yüzün ve bedenin ön tarafı." (TR3-17: sayı ya da emir gibi okunabilen çıplak "Yüz" yok) ikinci atlama '
              'kapısını da taşır (S3-04: göğüs ve karından önceki 120 sn içinde bir kapı, `timing.py`). Bütün öğeler '
              'başlangıçtan başlangıca aynı periyotla gelir (L2-08). Kalça, göğüs ve karın hassas bölgelerdir: tek adla ve '
              'komşularıyla aynı periyotta geçer (G2-06). Sağ ile sol arasındaki cümle (%s. dakikadan) hem listeyi böler '
              'hem kaçırılan adı bağışlar (P-S5). Genişletme: zemine değen noktalar, bütün-beden doruğundan önce (H16; %s. '
              'dakikadan). "ön kol" yazımı TDK\'ye göre "önkol" olabilir; sözlük bu ortamdan yanıt vermedi, insan editöre '
              'işaretli (TR3-19).' % (
                  rng(IN['c1.gecis.arka']), rng(IN['c1.gecis.on']), rng(IN['c1.kacirma']), rng(IN['c1.x01'])),
        'C2': 'P1. Nefes önce değiştirilmeden izlenir; aynı klipte nefes dışı kapı vardır: eller ya da açık gözler (G2-01, '
              'L2-01). %s. dakikadan itibaren dikkati nefeste olana nefesin yeri, ellerinde olana avuçlar ayrı ayrı söylenir '
              '(TR2-12, H7; TR3-01: "X-le kalmak" çevirisi yok). "Nefes kendiliğinden geliyor." ile "Kendiliğinden '
              'gidiyor." arasında bir nefes yarımı (MT3-02); 5 dakikada bu klibin ardından en az 16 sn gerçek durgunluk '
              '(L3-03). 5 dakikada C2 = dikkat → akış; "hiçbir şey yapmadan" dinlenme %s. dakikadan (H1 a). Veriş sonu '
              'durağı "kısa" ve yeni nefesin kendiliğinden gelişiyle söylenir (TR3-10, L3-09); giren havanın serinliği, '
              'çıkanın ılıklığı somut duyudur, olumsuzluk kalıbı değil (MT3-08). Sayım önce beşten, süre arttıkça ondan '
              'başlar (girdiği dakikalar §0\'da); sayılar başlangıçtan başlangıca 5,8–6,3 sn arayla gelir ve nefese hız '
              'dayatmaz (Z2-07). İçten sayma penceresinin duyurusu gerçek bir kapı taşır ("Gözlerini açsan da olur."; '
              'G2-02, TR3-11); pencereden dönünce sayılar hemen bırakılır (H7). "Fark ettiğin an…" cümlesi Ders 5\'in '
              'anahtar cümlesidir, burada yoktur (B1).' % (rng(IN['c2.alt']), rng(IN['c2.kal'])),
        'BR.K2': 'Köprü: yalnız zıtlık (C3) ya da imgeleme (C4) seçiliyse, C2\'nin hemen ardından çalar (H3); iki anahtar '
                 'cümle arasında her zaman bir blok olsun diye. Anahtar cümlenin 2. geçişi derin evrenin başında '
                 'uyanıklığı hatırlatır; iyelik ilk geçişle aynıdır ("Bedenin"; L3-14); durum iddiası yoktur (G2-08). '
                 '"sen uyanıksın"ın kurnazlık okunuşu kör panel maddesidir; duyulursa "%s" (TR3-08).' % (
                     F['key'][2]['panelFallback']['text']),
        'C3': 'P3. Zıtlık çiftleri bedende hissedilir. Çekirdek (ağırlık / hafiflik) C4\'ün hemen ardından sıraya girer '
              '(giriş sırası %d; H13), böylece varsayılan %d dakikalık sürümde de vardır; sıcaklık / serinlik ikinci '
              'dalgadır ve iki liste tek grupta girer, zıt çift tek taraflı kalmaz (Z3-05). Blok bir çıkış kapısıyla '
              'açılır ("İstemezsen bu bölümü atlayıp zemini hissedebilirsin"; TR2-22: atlama fiili C1 ile aynı) ve '
              'bırakmayla kapanır ("Beden kendi hâlinde."; EV2-05). Ağırlığı hissetmeyen dinleyici bağışlanır, ama '
              'denemeden önce değil: "Ağırlığı hissetmesen de olur." "bütün beden ağır."dan sonra gelir ve zıtlık olan her '
              'sürümde çalar (L2-05, S3-03, MT3-09, L3-11). İki zıttın aynı anda hissedilmesi (nidranın tanımlayıcı adımı) '
              'isteğe bağlı katmandadır. Sınama telkini yoktur. Müzik yatağı burada incelir (L2-13).' % (
                  L['planner']['entryRanks']['C3'], L['defaultMinutes']),
        'BR.orta': 'Köprü: imgeleme olan her sürümde C4\'ün hemen önünde (S1). Üç şeyi birlikte söyler: ortak çıkış '
                   'cümlesinin ortadaki hatırlatması, kıpırdama izniyle (güvenlik §11.B-3, -4; "dersi bitirmek", G2-03; '
                   'S3-06: zıtlıkların "bütün beden ağır/hafif"inden hemen sonra), açık gözün bakışını serbest bırakan '
                   'cümle (G2-13) ve zor bir anı öngörmeden kurulan tarafsız dayanak ("Zemin seni hep taşıyor."; "hep" '
                   'yüklemin önünde, TR3-03; L2-06; güvenlik §11.B-8). "Hatırlatayım:" yok (H12, L2-06).',
        'C4': 'P2. Dersin tek imge yayı; sahne seçiciye bağlıdır (§1.3; ilk seferde Orman, L3-05). Önünde her sürümde '
              '`br.orta` çalar (S1, B5, E9). En kısa hali bile bir ses, bir sıcaklık ve bir varış yeri taşır (H2, L3-06); '
              'dinlenecek köşe imgenin ilk artımıdır (MT3-11, TR3-05: "dinlenme yeri" ve "orada … burada" çatışması yok), '
              'ayak tabanları hemen ardından girer. Ana metinde "ya da" yalnız `c4.yer`de (MT3-06); izler somut bir yüzeyde '
              've kendi ayak izlerin (L3-15). Sessiz pencerenin duyurusu "Bir süre sessiz kalacağım." ile başlar, kapıyı '
              '"zor gelirse" demeden taşır ve dönüş sözüyle biter (TR3-04, H15, TR2-16, L3-08, MT3-18). Işıkla gölge '
              'cümlesi pencereden sonra gelir; dönüş patikanın başında biter, odaya erken dönülmez (H14, TR2-11). Duyu '
              'cümleleri çiftler hâlinde ve farklı boşluklarla gelir (S7-hoca, P-S6); "O ses bir yaklaşıyor, bir '
              'uzaklaşıyor." nefes çiftidir (TR3-20, MT3-19, MT3-02). Müzik "imge" dokusuna geçer, doğa katmanı sahneyi '
              'izler (L2-03, L2-13).',
        'C5': 'P5. Sessiz dinlenme; yalnız C4 varken girer. 4. turda tanıklık (sakshi; Ders 9) ve sesleri açık izleme '
              '(Ders 5) içeriği çıkarıldı (MT3-01); blok bu dersin kendi motiflerine bağlıdır: açılış cümlesine geri çağrı '
              '("%s"), beden ve zemin ("%s": anahtar cümlenin yapısı ve son cümlenin "Buradasın"ı), yüzün ve çenenin '
              'gevşemesi. İmgedeki sese tek geri çağrı `c5.dusunce` klibidir (sahneye göre; ana metinde "ya da" yok, '
              'MT3-06). Pencere önce davet eder ("sessizce dinlenebilirsin"), sonra öznesi olan kapıyı söyler, en son dönüş '
              'sözünü verir (TR2-10, L2-07, H12). Dilek kipi yok (S3-09: "kalsın" kıpırdamama gibi duyulabiliyordu). '
              'Müzik "sessiz dinlenme" dokusuna geçer (L2-13).' % (T(F, 'c5.basla'), T(F, 'c5.sen')),
        'N2': 'P1. Niyetin tekrarı; son duyulan şey niyetin kendisidir ve tırnak içindeki nokta cümlenin sonundadır (TR2-05, '
              'H10, L2-11). "Söylemek yeterli" (S3-08); 5 dakikada "bir kez daha" (kısa biçim; L3-03, MT3-05); üç '
              'söyleyişe en az 10 sn (Z3-03). Niyet seçmemiş ya da unutmuş dinleyiciye hazır cümle de hatırlatılır '
              '(P-S11). Sahne yönergesi gibi duyulan "Sözlerin ardından kısa bir sessizlik." çıkarıldı, süresi bu klibin '
              'ardındaki sessizliğe verildi (L3-07, MT3-10). Dilek dua ağzı taşımaz ve günün saatinden bağımsızdır '
              '(TR3-15, L2-17).',
        'K': 'Sabit kapak; tek blok (T4). Gündüz dönüşü, uyku izni yok. Her sürümde: anahtar cümle 3 → 5–9 sn sessizlik '
             '(ses rampası) → dönüş (dönüş tınısıyla) → nefes → parmaklar ve gerinme (10 sn; MT3-14) → gözler ve çevre → '
             'yana dönme (sırtüstü yatana; MT3-17, L3-16) → oturma → bekleme → kalkış (baş dönmesi satırıyla, ayrı klip) '
             '→ kısa sessizlik → son cümle tek başına (MT3-04, L3-04). Süre arttıkça sesler, çevre ayrıntısı, zaman ve '
             'yer, yan tarafta dinlenme eklenir. Eylem payları sıkıştırılmaz (B2, T1, S4); iki eylem isteyen göz cümlesine '
             '9 sn (Z2-05), "bir süre" yan yatmaya 12 sn (Z2-03). Oda varsayımı yok: "çevrende", "Yakındaki ve uzaktaki '
             'sesler" (G2-12). Baş dönmesi satırı harekette ("hareketi bırak", tek okunuş; G2-07, TR3-07) ve kalkışta '
             '(G2-04); beklemede üçüncü kopya yok (TR3-21, MT3-04).',
    }


'''
t = t[:i0] + new_intro + t[i1:]
rep(r'''        if key_ == 'quickClosing':
            a('"Kapanışa geç" düğmesi: o anki klip biter, motor müziği kapanış evresine geçirir ve şafak görselini başlatır, '
              'sonra bu dizi çalar. Düğmenin kendisi geçiş olduğu için "Artık dönüş zamanı." burada yoktur. Çevreye bakma '
              '(yönelim) adımı vardır (S10). Bekleme ve kalkış kısaltılmaz; güvenlik satırları (G2-04, G2-07) ve iki '
              'eylemli göz cümlesinin payı (Z2-05) eklendiği için süre PLAN B.5\'teki 45–60 sn\'ye değil, 60–95 sn\'ye '
              'sığar (PLAN B.5 buna göre güncellendi). Klipler Kapanış\'takilerin aynısıdır; yeni ses üretilmez. Süre '
              '(pref) 5,2–6,6 hece/sn\'de %s–%s sn (denetlendi).' % (r1(min(qc)), r1(max(qc))))''',
    r'''        if key_ == 'quickClosing':
            q = ex
            a('"Kapanışa geç" düğmesi: o anki **cümle** biter (4. tur: birimler cümle sonlarından kesildiği için; MT3-02); '
              'motor %s sn\'lik bir ön sessizlik açar: dönüş tınısı ilk sözden 2 sn önce çalar, müzik kapanış evresine '
              'geçer, şafak görseli başlar ve ses kazancı o anki evre düzeyinden 0 dB\'e bu sessizlik boyunca rampayla '
              'çıkar, basamak yok (S3-02; güvenlik §11.D-7). Düğmeye imge sırasında (C4, `c4.solma`\'dan önce) basılmışsa '
              'önce "%s" çalar ve imge katmanı çekilir; zıtlıklar sırasında (C3, `c3.birak`\'tan önce) önce "%s" çalar; '
              'duyurulmuş bir pencerenin sessizliğinde basılmışsa önce dönüş tınısı ve o pencerenin karşılama klibi '
              'çalar (S3-01, MT3-07; güvenlik §11.D-2, §11.B-14, Howard 2017). Ön klipler yeni kliptir, çünkü `c4.solma` '
              've `c3.birak` `k.nefes`, `k.hareket` ve `k.goz` ile 60 sn içinde dördüncü "-(y)abil-"i getirirdi (TR2-03). '
              'Aynı ön klipler C3 ya da C4\'ten bırakma klibi çalmadan çıkan her sarmada da çalar (kapanışa ya da başka '
              'bir bloğa). Düğmenin kendisi geçiş olduğu için "Artık dönüş zamanı." burada yoktur. Çevreye bakma '
              '(yönelim) adımı vardır (S10). Bekleme ve kalkış kısaltılmaz. Süre (pref sessizlikler, ön sessizlik dahil) '
              '5,2–6,6 hece/sn\'de %s–%s sn; sınır 60–110 sn, pencerenin içinden 60–120 sn (PLAN B.5 buna göre '
              'güncellendi). `timing.py` her planda C3/C4\'ün her klip konumu için dizinin doğru ön klibi taşıdığını, '
              'T1\'i, TR2-03\'ü, dolgu kuralını ve rampa sessizliğini denetler.' % (
                  n(q.get('leadInSec', 0)), T(F, 'k.hizli.imge'), T(F, 'k.hizli.his'), r1(min(F['qc_all'])),
                  r1(max(F['qc_all']))))
            a('')
            a('| bağlam | dizi | süre (sn; 5,2–6,6, iki profil) |')
            a('|---|---|---|')
            for name, (entry, pre) in F['qctx'].items():
                a('| %s | %s | %s–%s |' % (name, ' → '.join('`%s`' % c['id'] for c in pre + q['clips']),
                                          r1(min(F['qc'][name])), r1(max(F['qc'][name]))))
            a('')
            a('Ön klipler (yalnız bu dizide ve sarmada; Kapanış evresi, sessizlik sıkıştırılmaz; birer TTS isteği):')
            a('')
            a('| id | etkin blok | metin | sessizlik sonra (sn) | ipucu |')
            a('|---|---|---|---|---|')
            for blk, pre in q['prefixByActiveBlock'].items():
                for c in pre:
                    a('| `%s` | %s | %s | %s | %s |' % (c['id'], blk, c['text'], n(c['gapAfter']['pref']), cue_str(c)))''')
p.write_text(t, encoding='utf-8')
print('ok', len(t))
