import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
i0 = t.index('def part_6_8(L, F, a):')
i1 = t.index('def write(L):')
new = r'''def part_6_8(L, F, a):
    IN = F['in']
    uc = F['uc']
    s5 = list(F['split'][5].values())
    vp = L['voiceProduction']
    a('## 6. Üretim notları (seslendirme)')
    a('')
    a('- **Yol kararı verildi (sahip, 2026-09-29; EV3-01, L3-01, MT3-03, Z3-02, TR3-12):** yalnız MCP '
      '(`creative_generate_speech`); REST/API yok. Hız, kararlılık, `seed`, `previous_text` / `next_text` ve telaffuz '
      'sözlüğü yok. **Model:** `eleven_v4` (5,6 hece/sn; Scribe\'da metin birebir) bütün klipler için önerilir; `v2` '
      '(6,6) sahip kararı gereği kör karşılaştırmada aday, ama Derin evrede etkin medyanı hiçbir profilde tavanın '
      '(VARSAYIM) altına inmediği için Derin evre kliplerinde önerilmez (§2.5; L3-01). v3 yön etiketi kullanılmaz (bu '
      'oturumdaki denemede etiket büyük olasılıkla sesli okundu). 5,2 hece/sn satırları yalnız duyarlılık sınaması '
      '(zarf) olarak tutulur: MCP\'de üretilemez.')
    a('  - REST hız basamakları (Varış 0,90 · Derinleşme 0,85 · Derin 0,80 · Kapanış 0,90) **uygulanmaz**; evre farkı '
      'metinden, boşluklardan, cümle arası sessizlikten (MT3-02) ve kazançtan (−1,5 / −3 dB) gelir.')
    a('  - Taşıyıcı yöntemi MCP\'de çalışır, çünkü her taşıyıcı tek istektir.')
    a('- **Çekimler (`generations_count`):** her klip, birim ve taşıyıcı için en az 3 çekim (MCP\'de varsayılan 4, en çok '
      '4; elevenlabs.md §1). Scribe\'da birebir eşleşen ve taşıyıcı ya da cümle ekleminde F0 sıçraması <= 2 yarım ton '
      'olan çekim seçilir (`qa.carrierJoinF0StepSemitones`); olmazsa önce kesim sırası değişir, sonra yeni çekim, sonra '
      'metin (P-S15, T17\'nin MCP karşılığı). Sağ ve sol taşıyıcılar ayrı istektir; sol için seçilen çekim sağınkinin '
      'kopyası olamaz, F0 çizgisi sağdakinden farklı olan yeğlenir (L3-17; `qa.carrierTakesRule`).')
    a('- **Yeni aday ses kapısı (Z3-04, MT3-03, L3-01):** tasarlanan hoca sesi (`creative_design_voice`) kör panele '
      'girmeden önce 76 heceli deneme paragrafı v4 ve v2 ile üretilir; eklemleme hızı ve duraklama oranı '
      '(q = eklemleme / brüt − 1) `hiz/*.mp3` ile aynı yöntemle ölçülür; `python3 timing.py --rate <hız> --profile '
      'aday:<cümle>,<virgül>,<noktalı virgül>,<üç nokta>` ile 78 vaka koşulur (çıktı `timing.out.aday.txt`); 78/78 '
      'geçmeyen aday elenir ya da metin ayarlanır. Neslihan v2\'den ≈ %10 hızlı bir ses 5 ve 14. dakikanın yoğunluk '
      'sınırını aşar (§2.5). Aday ses ölçülmeden hiçbir klip onunla üretilmez.')
    a('- **Cümle sonu kesimi (MT3-02, L3-02):** çok cümleli klip tek istektir; cümle sonlarından (sessizlik algısı ve '
      'Scribe zaman damgasıyla) kesilir; her alt klip ayrı dosya (`subclips[].voice`), birimin WAV\'ı arşiv. Nefes '
      'çifti (`c2.akis`, `c4.x.yaklas`) virgülden kesilir; TTS\'e giden metin üç noktalı (`ttsText`), ekranda virgül. '
      'Parça sayısı tutmazsa insan kararı; kesim yerindeki süreklilik dinlenerek onaylanır, kopuk duyulursa yeni çekim. '
      'Motor alt klipleri sırayla çalar, araya `sentenceGap` koyar; duraklatınca birimin başından sürdürür; "Kapanışa '
      'geç" o anki cümlenin bitmesini bekler.')
    a('- **Model rehberi:** metinde köşeli etiket ve `<break>` yok; bütün uzun sessizlikler uygulamada.')
    a('- **Taşıyıcılar ve kesim:**')
    a('  - Sessizlik algısıyla öğeler sırayla ayrılır; öğe sayısı tutmazsa insan onaylar; her mikro-klibe 10 ms yumuşak uç.')
    a('  - Seviye: kısa klipler RMS ile evre referansına eşitlenir; netlik kipinde tek heceliler +1 dB (L2-10; VARSAYIM).')
    a('  - Son öğenin kapanış ezgisi korunur ("bütün sağ taraf.", "bütün sırt.", "bütün beden.", "bir.", "başın arkası.").')
    a('  - Ön söz: sayı taşıyıcısı "sayıyorum: on… dokuz…" diye üretilir; "sayıyorum:" kesilip atılır. Böylece ilk sözcük '
      '"On" İngilizce "on" gibi okunmaz (T17). MCP\'de `previous_text` olmadığı için ön söz tek araçtır.')
    a('  - **Eklem ezgisi (P-S15):** taşıyıcı sınırındaki F0 sıçraması, taşıyıcı içindeki öğeden öğeye medyan değişime göre '
      '<= 2 yarım ton olmalı (VARSAYIM; `qa.carrierJoinF0StepSemitones`). Aşarsa MCP karşılığı: önce kesim sırası '
      'değiştirilir, sonra başka bir çekim (`generations_count`), sonra sözcük değişir; dinleyerek onaylanır.')
    a('  - **Mikro-klip süresi ölçülür (Z2-07):** ilk pilot üretimde kesilen her mikro-klibin gerçek süresi ölçülür; '
      '`timingModel.edgeMicroSec` (0,15 sn, VARSAYIM) ölçülen değerle değişir ve periyotlu sessizlikler gerçek '
      '`voice.sec` ile yeniden hesaplanır; `timing.py` yeniden koşar.')
    a('- **Scribe ile geri çevirme, normalleştirme (CRITIQUE #13):** küçük harf; noktalama silinir (… , ; : " \' ve nokta); '
      'düzeltme işareti düşer (â → a); sayılar sözcüğe çevrilir (10 → on). Taşıyıcı ve çok cümleli birim bütün olarak '
      'karşılaştırılır; ön söz karşılaştırmaya girmez. Uyuşmazlıkta klip başına en çok 2 yeniden üretim yapılır; sonra '
      'metin yeniden yazılır. **Scribe yazı düzeyinde eşleşir; vurgu ve eşyazımlı okuma hatasını yakalayamaz** (metin '
      'aynı çıkar): aşağıdaki liste insan dinleyici ister (TR3-18).')
    a('- **Tırnak içi nokta (L2-11):** tırnak içindeki nokta yalnız cümlenin sonunda olabilir (`timing.py` denetler). '
      'Cümlenin ortasında gerekirse ekran metni TDK biçiminde kalır, TTS\'e noktasız `ttsText` gider. Bu turda gerek '
      'kalmadı: iki niyet klibi de (kısa biçimleri de) tırnakla biter.')
    a('- **Noktalama tek kurala bağlı (TR2-24, TR3-23):** koşul yan cümlesinden ve zarf-fiilden sonra virgül yok; '
      'selamlama noktayla kapanır; noktalı virgül yalnız ilgili iki yargıyı bağlar (TR3-11); TTS duraklaması kazara '
      'değişmez (§5.4).')
    a('- **Söyleyiş izleme listesi (dinlenerek denetlenir; Scribe yakalayamaz):**')
    a('  - Vurgu ve eşyazımlı tuzakları (T17): **alın** (organ, a-LIN; emir "A-lın" değil), **karın** (organ, ka-RIN; '
      '"karmak"tan emir değil; taşıyıcı bu yüzden üç noktayla biter; `c2.yer` klibinde de), **On** (taşıyıcı başında '
      'İngilizce "on" değil), **dönüş** ("Artık dönüş zamanı."), **siliniyor**.')
    a('  - **dinlenme** (ad, vurgu sonda: din-len-ME) olumsuz emir "DİN-len-me" gibi okunmamalı: "Uyanık bir dinlenme bu." '
      '(`k.anahtar3`). "Biraz dinlenme zamanı", "dinlenme yeri" ve "dinlenme izni" 4. turda metinden çıkarıldı (TR3-04, '
      'TR3-05); hazır niyet artık %s.' % F['niyet'])
    a('  - 4. tur ekleri (TR3-18): **boyun** (organ, vurgu ilk hecede; "boy-un" değil; `c1.f17`), **Yüzün** '
      '(`c1.gecis.on`; "yüz" sayısı ya da "yüz!" emri değil), **yan** (`a.durus` "yan yatıp"; virgül kaldırıldı, "yan!" '
      'emri gibi okunmamalı), **alman** (`a.konfor` "alman iyi olur": eylem adı al-MAN; "Alman" değil), **uyanıksın** '
      '(`br.k2`; kurnazlık tonu değil, kör panel maddesi, TR3-08), **Sırtüstü** (tek sözcük).')
    a('  - 2. tur incelemesinin tuzakları (TR2-24): **Saatin** (tamlayan / 2. tekil iyelik; metinden çıktı, yerine '
      '"Günün hangi saatinde"), **Ağırlığın** (tamlayan / iyelik; metinden çıktı), **birden** ("ansızın"; metinden çıktı), '
      '**dinle** (ekranda "…bir sırada dinle." emirdir; ad okunuşu yok), düzeltme işaretli **hâlinde** ("Beden kendi '
      'hâlinde.") ve **Rüzgâr** (orman sahnesinde `c4.x.yaklas`): v2 ve v4 tuhaf bir ünlü üretmemeli.')
    a('  - ğ\'li sözcükler: başparmağı, ağırlık, değen, doğrulup, değiştirmeden, alıştıra alıştıra, yumuşak, soğuk değil '
      'serin, nemli toprakta.')
    a('  - uyluk, baldır, şakak, köprücük, yüzük parmağı ("yüz" eşyazımlısı), yüzüne, yüzün, önkol / ön kol (TR3-19: TDK '
      'yazımı bu ortamdan doğrulanamadı; ekranda "ön kol" kaldı, insan editör karar verir; sese etkisi yok).')
    a('  - Büyük harfle yazılan I ve İ: "Işık", "Işıkla", "İstediğin", "İstemezsen", "İkisi".')
    a('  - Tırnak içi hazır niyet cümlesinin ezgisi: `n1.sec` "…önerim şu: %s" ve `n2.hatirla` "Ya da yine şunu: %s": '
      'iki noktadan sonra doğal durak, tırnak içi hafif vurgulu, sonda iniş.' % (F['niyet'], F['niyet']))
    a('  - Yanlış okuma Scribe ya da dinlemeyle görülürse MCP\'de sırayla: başka bir çekim (`generations_count`), ön söz '
      'ya da fonetik yazım, metin değişikliği. Takma ad sözlüğü ve `previous_text` yoktur; eşyazımlı tuzaklar bu yüzden '
      'metinde çözüldü (TR3-04, TR3-17, TR3-02).')
    a('- **Dosyalar:** `voice.{female,male}.file` = `public/yoga/ders2/<ses>/<klip>.m4a`; çok cümleli birimlerde alt '
      'klipler `<klip>.<n>.m4a` (birimin WAV\'ı `yoga-uretim/` arşivinde, pakete girmez); dönüşümlü seçenekler '
      '`<klip>.v2.m4a`, `<klip>.v3.m4a` (P-N5); sahne metinleri `<klip>.kiyi.m4a`, `<klip>.orman.m4a` (H6; %d klip, %d '
      'metin); 5 dakikanın kısa biçimleri `<klip>.kisa.m4a` (L3-03); hızlı kapanışın ön klipleri `k.hizli.imge`, '
      '`k.hizli.his` (S3-01). `sec` üretimden sonra dolar. Taşıyıcıların WAV\'ı arşivdir, pakete girmez.' % (
          uc['scene_clips'], uc['scenes']))
    a('')
    a('## 7. VARSAYIM\'lar ve açık noktalar')
    a('')
    a('- Bütün `gapAfter`, `pairGap`, pencere, başlangıç periyodu (`onsetPeriod`, `gapFloor` %s sn) ve cümle arası '
      'sessizlik (`sentenceGap`, MT3-02) değerleri, dalga sıraları (`fillRank`), giriş sıraları (`entryRank`), T5 esneme '
      'tavanı (0,5) ve girişte en çok yarı sıkışma birer tasarım kararıdır (VARSAYIM).' % n(timing.GAP_FLOOR))
    down = '; '.join('`%s` %s → %s' % (cid, n(pv), n(cv)) for cid, pv, cv in F['gmin_down']) or '—'
    up = '; '.join('`%s` %s → %s' % (cid, n(pv), n(cv)) for cid, pv, cv in F['gmin_up']) or '—'
    a('- **5 dakikanın payı (T6, G2-10 → L3-01, Z3-02):** T6 tabanı 15 sn artık **üretim köşesinde** (5,6 hece/sn + Hakan '
      'duraklamaları) denetlenir: %s sn boş pay. Zarf köşesi (5,2 yüksek; MCP\'de üretilemez) bilgi olarak raporlanır: '
      '%s sn; oradaki plan da bütün öteki denetimlerden geçer. 4. turun güvenlik ve hoca bulguları 5 dakikaya süre '
      'ekledi (10 sn\'lik hareket payı, MT3-14; üç söyleyişe 10 sn, Z3-03; 16 sn\'lik durgunluk, L3-03; zemine yerleşme, '
      'MT3-05); karşılığı yalnız güvenlik dışı yerlerden alındı: 5 dakikada niyet bir kez söylenir (kısa biçimler), '
      '"Sözlerin ardından kısa bir sessizlik." ve bekleme klibindeki üçüncü baş dönmesi satırı çıktı, `k.son` bölündü; '
      'güvenlik dışı sessizliklerin alt sınırları indi: %s; yükselenler: %s. `k.yan`, `k.otur`, `k.bekle`, `a.izin` ve '
      '`c1.cerceve` sessizliklerine dokunulmadı.' % (r1(F['prod']), r1(F['env']), down, up))
    bd5 = F['bd5']
    a('- **5 dakikalık blok eşikleri (H1 → L3-03, MT3-05; sahibe görünür değişiklik):** PLAN B.3 adım 8 ve E.6 #1\'e Ders 2 '
      'için not: 5 dakikada C2 >= 0:30, N2 >= 0:15 (ölçülen: C2 %s sn, N2 %s sn; 6 dakikadan itibaren olağan eşikler, '
      '55 ve 20 sn, geçer). 5 dakikaya özgü kısa biçimler: %s / %s (niyet bir kez); `c2.akis` ardında 16–20 sn. Neden: '
      'güvenlik gereği uzayan kapanış (5 dakikada %s sn) ve nefes kapısı. Sahip onayı bekliyor.' % (
          span([v['C2'] for v in bd5.values()], 1), span([v['N2'] for v in bd5.values()], 1),
          '"%s"' % F['allc']['n1.soyle'][1]['short']['text'], '"%s"' % F['allc']['n2.hatirla'][1]['short']['text'],
          span([x[3] for x in s5])))
    prev = F['prev']
    a('- **Varsayılan süre %d dakika (H13, seçenek b):** C3 giriş sırası %d (C4\'ün hemen ardı): C3 %s. dakikada girer '
      '(üçüncü turda %s). PLAN B.4\'ün 15 dakikalık çapasındaki C3 (2:00) bu derste yoktur; 15 dakikada imge ve kapı '
      'önceliklidir (sapma, sahibe bilgi).' % (
          L['defaultMinutes'], L['planner']['entryRanks']['C3'], rng(IN['c3.agir']),
          rng(prev['c3_in']) if prev else '—'))
    a('- İmgeleme (C4) hıza göre %s. dakikada girer (üçüncü turda %s), sessiz dinlenme (C5) %s. dakikada (üçüncü turda '
      '%s); PLAN B.4\'ün 10 dakikalık çapası yerine. Neden: en kısa imgenin de ses, sıcaklık ve varış yeri taşıması (H2, '
      'L3-06), imgenin önüne her sürümde eklenen kapı (`br.orta`) ve güvenlik gereği uzayan kapanış. En kısa C4 '
      'penceresizdir; pencere %s. dakikadan girer; dinlenecek köşe %s. dakikadan (MT3-11).' % (
          rng(IN['c4.yer']), rng(prev['c4_in']) if prev else '—', rng(IN['c5.basla']),
          rng(prev['c5_in']) if prev else '—', rng(IN['c4.pencere']), rng(IN['c4.yerles'])))
    a('- Süre modeli: eklemleme hızları ölçümdür (5,6 v4, 6,6 v2); 5,2 zarftır; duraklama profilleri tek paragraftan '
      'çıkarıldı; 5,2\'deki ×1,25 ve uç payları VARSAYIM\'dır. Yoğunluk eşikleri (150 / 110 hece, %60 / %45), T3, T8, '
      'P-S6, L2-08 (0,6 sn yayılım), H3 (60 / 90 sn), TR2-03 (60 sn\'de 3), L3-02 (1,0 sn), L3-03 (16 sn), S3-04 (120 '
      'sn) ve S3-02 (4 sn) eşikleri VARSAYIM\'dır.')
    a('- **Sarsıntı payı (Z2-04):** bütün klip süreleri %10 kısa çıkarsa 6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik '
      'yoğunluk sınırı aşılır; %5–10 uzun çıkarsa 5 dakikanın boş payı 15 sn\'nin altına iner. Gerçek süreler gelince '
      '`timing.py` yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır.')
    a('- **Derin evre iç hız tavanı (EV2-04):** <= 5,0 hece/sn bir tasarım tavanıdır (VARSAYIM; kanıta dayanmaz; '
      '`qa.derinClipRateCeilNote`). 4. turda iç hız ve etkin hız ayrı raporlanır (MT3-02); üretim hızında etkin medyanın '
      'tavanın altında kalması bir denetimdir (P-S1). Yaşlı dinleyiciye uygunluk kör panelde dinlenerek sınanacak '
      '(CRITIQUE #22).')
    a('- Düzeyler: konuşma −18 LUFS; kısık yatak Varış −33, Derinleşme −34,5, Derin −36 LUFS; pencerede +6 dB, 6 sn rampa, '
      'bitişten 8 sn önce iniş (G2-11); son 5 sn sönüş; dönüş tınısı; netlik kipi (L2-10); doku katmanları (L2-13); '
      'hızlı kapanışa girişte 4 sn rampa sessizliği (S3-02) — hepsi VARSAYIM.')
    a('- **Sahne seçici ve doğa katmanı (H6, L2-03, L2-04, L3-05):** yapıldı; %d klibin sahne metinleri (%d metin × 2 '
      'ses); ilk oturumda varsayılan Orman. Kıyı için imge boyunca çok uzak kıyı dokusu sahibin su katmanı kararına '
      'bağlıdır (üretim ≈ 10k kredi; VARSAYIM). Karar olumsuzsa Kıyı\'da doğa katmanı imge boyunca kısılır ve E.6 #15 '
      'Kıyı dinleyicisi için "kısmen" kalır.' % (uc['scene_clips'], uc['scenes']))
    a('- **Doğa imzası çakışması (MT3-15; PLAN A.2.1 kaydı):** Ders 2 Kıyı dokusu ↔ Ders 9 "uzak okyanus dalgası" ve Ders '
      '2 varsayılanı "uzak rüzgâr ve yaprak" ↔ Ders 6 "uzak orman ve yaprak sesi" zemini. Karar üretimden önce: Ders '
      '2\'nin kıyı katmanı ayrışık tanımlanır (çok uzak, alçak geçiren filtreli kıyı yıkanması; köpük ve dalga kırılması '
      'geçişi yok; kabarma periyodu 6–8 sn, ölçülüp Ders 9\'unkiyle (≈ 10 sn) karşılaştırılarak belgelenir) ve kör '
      'dinlemede yan yana ayırt edilemezse üretilmez; Ders 6 zemini yapraksız (yalnız seyrek kuş çağrıları ve uzak sabah '
      'havası) önerilir, çünkü Ders 2\'nin orman sahnesi metni yapraklara dayanır. İki çift de kör dinleme '
      'protokolündedir (`panelChecks`).')
    a('- **Nabız yok (EV2-12):** `music.bpmFeel` boş; ritimsiz/pulssuz doku önerisi test edilmedi (sakin §11.5, Bernardi '
      '2006 düzeltmesi); ElevenLabs Music\'te tempo parametresi yok (CRITIQUE #10).')
    a('- **Kapak payı (Z2-06):** 5 dakikada Kapanış %s sn, güvenlik §11.D-1\'in önerdiği ≈ 75 sn\'nin %s sn üstünde; '
      'Varış %s sn (öneri ≈ 45); çekirdek (C1 + C2) %s sn, niyet dahil %s sn (öneri ≈ 3 dk). Neden: sıkıştırılmayan '
      'kalkış payları (B2, T1, E7) ve baş dönmesi satırları. Sahip kararı. `a.hosgeldin` ile `a.acilis` birleştirilmedi: '
      'derse özgü açılışın dönüşümlü seçenekleri (P-N5) ayrı klip ister ve kazanç 2–4 sn olurdu.' % (
          span([x[3] for x in s5]), span([x[3] - 75 for x in s5]), span([x[0] for x in s5]), span([x[2] for x in s5]),
          span([x[1] + x[2] for x in s5])))
    a('- **"Kapanışa geç" 60–110 sn, pencerenin içinden 60–120 sn** (PLAN B.5\'teki 45–60 sn yerine; üçüncü turda '
      '60–95): imge ya da zıtlık açıkken ön klip (S3-01, MT3-07), 4 sn\'lik rampa sessizliği (S3-02) ve pencere içinden '
      'basılınca önce karşılama klibi üst ucu %s sn\'ye çıkardı; ölçülen %s–%s sn. Durdur dönüşü 20–30 sn; yana dönüp '
      'oturmaya 13 sn (Z2-01). Güvenlik dosyasının §11.D-4 metni (doğrulanmış kanıt dosyası) değiştirilmedi; geçerli '
      'değer PLAN B.5\'tedir.' % (n(timing.QUICK_BOUNDS_WINDOW[1]), r1(min(F['qc_all'])), r1(max(F['qc_all']))))
    a('- **Güvenlik kartı (G2-03):** derste ve açılış ekranında "dersi bitirebilirsin"; §11.A kartındaki "İstediğin an '
      'durabilirsin" de aynı fiile çekilmeli (sahip/editör onayı; kartın metni doğrulanmış güvenlik dosyasındadır ve bu '
      'turda değiştirilmedi).')
    sh = F['shares']
    a('- **Konuşma payı (Z3-01; sahibe görünür istisna):** 20 dakika ve üstünde C2, C3 ve C4\'ün blok konuşma payı PLAN '
      'B.4.1\'in rehberli çekirdek alt sınırının (%%%d) altındadır (C2 %%%d–%%%d, C3 %%%d–%%%d, C4 %%%d–%%%d); derin '
      'evredeki 110 hece tavanı bağlayıcı değildir (§2.5). Payı sınıra çıkarmak 30 dakikada ≈ 120 sn (≈ 800 hece) ek '
      'Derin evre metni ister (ör. C4\'te ikinci bir ses ya da imge dalgası, C2\'de kısa ikinci bir nefes turu; 700–1000 '
      'sırasında). Bu metin, seyrekliğin dersin bir tasarım seçimi olması ve sahibin "kimse sıkılmayacak" isteğinin '
      'dinlenerek sınanması gerektiği için sahip onayı olmadan yazılmadı; karar sahibin.' % (
          round(100 * timing.BLOCK_SHARE_FLOOR), round(100 * sh['C2'][0]), round(100 * sh['C2'][1]),
          round(100 * sh['C3'][0]), round(100 * sh['C3'][1]), round(100 * sh['C4'][0]), round(100 * sh['C4'][1])))
    a('- **Düzlükler (Z3-09):** 14–16. dakika çevresinde her hızda bir düzlük vardır (bir önceki dakikanın içeriği, 60 sn '
      'daha uzun sessizlikle; f en çok %s); nedeni C4\'ün tek adımda (≈ 3 dk) girmesidir ve yapısaldır; bir C1 grubunu '
      'öne almak düzlüğü yalnız kaydırır. Liste `timing.out.txt` özetindedir (§2.5).' % (
          n(round(F['plateau_f'], 2)) if F['plateau_f'] is not None else '?'))
    a('- Yedek genişletme: %s' % ((', '.join('`%s`' % i for i in F['never']) + ' hiçbir modellenmiş vakada 30 dakikaya '
                                    'sığmıyor; klip süreleri kısa çıkarsa girer.') if F['never'] else
                                   'yok; her klip en az bir planda çalar. Hiçbir planda çalmayan `c5.x.sessizlik`, '
                                   '`c3.x.hepsi` ve `c5.x.dayanak` çıkarıldı (Z3-06), `n2.x.his` L3-07 gereği; '
                                   'C5 genişletmeleri geç C4 genişletmelerinin önüne alındı.'))
    a('- Görsel: nabız `flashSafe` profiliyle kapanır (lib/profile.js:198, d515702\'de okundu); şafak parlaklık tavanı bağıl '
      '%15 ve en az 60 sn\'lik rampa (VARSAYIM).')
    a('- Sırtüstü yatışa göre yazılan temas turu yan yatan dinleyiciye tam uymaz; bu yüzden genişletme katmanındadır. '
      'Yana dönme cümlesi sırtüstü yatana seslenir (MT3-17, L3-16).')
    a('- Akşam satırı (L2-17): UI\'da 20:00 eşiği VARSAYIM; seste yok.')
    a('- **Ses denemesi ve netlik ayarı (L3-10):** ilk Yoga oturumunda gerçek Derin düzeyinde 10 sn\'lik deneme ("%s") ve '
      'tek soru ("%s"); "Hayır" netlik ayarını açar. Profilde yaş 60 ve üstüyse ayar önceden işaretli (profil alanı '
      'doğrulanmadı). UI, VARSAYIM; kör panelin 65+ üyesiyle sınanır.' % (
          L['soundCheck']['screenText'], L['soundCheck']['question']))
    a('- **Kör panel yedeği (TR3-08):** "sen uyanıksın" kurnazlık anlamında duyulursa `br.k2` "%s" ile üretilir; '
      'karar panelin.' % F['key'][2]['panelFallback']['text'])
    a('- **"ön kol" yazımı (TR3-19):** TDK Güncel Türkçe Sözlük bu ortamdan yanıt vermedi; "önkol" birleşik yazımı '
      'doğrulanamadı, ekran metni "ön kol" kaldı; insan editör karar verir (sese etkisi yok).')
    a('- Açık kararlar (sahip): MCP içinde model seçimi (v4 / v2) ve hoca sesi (Neslihan, Hakan, tasarlanan aday; kör '
      'karşılaştırma; aday ses önce ölçülür, Z3-04), su katmanı, 5 dakikalık blok eşiği değişikliği (H1 → L3-03), 5 '
      'dakikada Kapanış payı (Z2-06), Z3-01 için ek Derin evre metni, Ders 6 ve 9 doğa imzası (MT3-15), güvenlik '
      'kartında "durabilirsin" → "dersi bitirebilirsin" (G2-03), insan editör, hoca ve kör dinleme paneli (CRITIQUE #22; '
      'TR3-08 ve MT3-02 panel maddeleri).')
    a('')
    a('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI\'ler https://doi.org/ önekiyle açılır)')
    a('')
    a('| PMID | Künye | DOI | Dosya |')
    a('|---|---|---|---|')
    for r in L['sourcesCard']['rows']:
        a('| %s | %s | %s | %s |' % (r['pmid'], r['detail'], r['doi'], r['file']))
    a('')
    a('Kaynak: PubMed (National Library of Medicine), dosyalardaki okumalar üzerinden. Bu metin hiçbir sonucu vaat etmez. '
      'Kartta gösterilen kısa künyeler `sourcesCard.rows[].cite` alanındadır (EV3-05). Khasky & Smith 1999 (iki yönlü '
      'ilişki) ve Ley 1988 (yeniden çekildi) satırları için doğrulanmış güvenlik dosyası §2\'nin de düzeltilmesi '
      'gerekir; bu turda kanıt dosyaları değiştirilmedi (EV3-02, EV3-09).')
    a('')


'''
t = t[:i0] + new + t[i1:]
p.write_text(t, encoding='utf-8')
print('ok', len(t))
