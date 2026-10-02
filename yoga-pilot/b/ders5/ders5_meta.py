"""Nefona Yoga · Ders 5 "Tek Nokta" · ders düzeyi alanlar (kart, ekran, müzik, görsel, planlayıcı, 30 dk iskeleti).

ders5_kaynak.py bu modülü içe aktarır. Değerler PLAN.v2 §A.1, §A.2 (Ders 5 kartı), §A.2.1, §A.2.2, §B.4, §E.2 ve
PLAN.v3 §A.1–§A.4'ten; VARSAYIM olanlar öyle yazılır. Kaynaklar yalnız *.dogrulanmis.md dosyalarından.
"""

HEAD = {
    'schema': 'nefona.yoga.lesson/1 (PLAN §B.2 + ekler)',
    'sozlesmeNotu': (
        "Pilot ders2.lesson.json ile aynı şema (PLAN.v2 §B.2 + pilot 2.–4. tur ekleri: tier, syllables, words, "
        "sentences, phase, fillRank, fillGroup, requires, minTarget, window, subclips + sentenceGap + ttsUnit, "
        "short{belowSec,text,gapAfter}, silenceWindows[afterClip, announce, welcome, min, pref, max]). Farklar: "
        "(1) v3 tek ses kararı: voice anahtarı female/male yerine 'hoc' (Nefona Hoca, voice_id Sr5w7dIZaRDglJ2cLaJm; "
        "sahip 2026-09-30, madde 8). (2) Ders 5'te mikro-klip, taşıyıcı ve nefes kilidi yok: nefes sesli sayılmaz, "
        "dinleyici kendi hızında içinden sayar; carriers boştur. (3) Pencerede müzik kabarmaz, çekilir "
        "(music.windowBedAboveDuckDb negatif; PLAN.v2 Ders 5 kartı). (4) Dönüş tınısı Ders 5'te çandır; "
        "cue.music 'returnTone:-2s (çan…)' taşıyan klipten 2 sn önce çalar. (5) short.voice.sameAsMain = true ise kısa "
        "biçimin metni ana biçimle aynıdır; yalnız sessizlik değişir, ayrı ses üretilmez. (6) 16–30 dk blokları "
        "(C4, C5, BR.orta) blocks'ta değil, skeleton30'dadır (metinsiz; PLAN.v3 §A.4). (7) firstEverIntro: kişinin "
        "ilk yoga dersinde çalan ayrı giriş dosyası (PLAN.v3 §D.3), plana girmez. minSec/prefSec/maxSec tahmindir "
        "(Nefona Hoca köşesi: 4,68 hece/sn, yüksek duraklama; VARSAYIM); üretimden sonra voice.hoc.sec ile yeniden "
        "hesaplanır."),
    'id': 'ders5-tek-nokta',
    'version': 'B-parti1-taslak-2 (2026-09-30; karar 2 yedeği iki model incelemesi işlendi, b/INCELEME.md; sahibin kulağı bekliyor)',
    'title': 'Tek Nokta',
    'tagline': 'Dikkatini tek bir noktada toplamayı, dağıldığında nazikçe geri getirmeyi deniyorsun.',
    'daypart': 'day',
    'posture': 'seated',
    'defaultMinutes': 5,
    'minutes': {'min': 3, 'max': 15, 'step': 1, 'presets': [3, 5, 15], 'stage3Max': 30,
                'note': 'PLAN.v3 §A.1: ilk yayında 3 · 5 · 15; 30 dk ve kaydırıcı ikinci aşamada (Kapı 9–11)'},
    'releaseMinutes': [3, 5, 15],
    'openingNotice': 'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.',
    'openingScreen': [
        'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.',
        'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.',
        'Gözlerin yorulursa kapatman ya da kırpman yeterli.',
    ],
    'preparationCard': [
        'Sırtını dik tutabileceğin bir sandalye ya da minder',
        'Bildirimleri sessize aldığın sakin bir yer',
    ],
    'preparationToggles': [{
        'id': 'speechClarity', 'label': 'Konuşmayı daha net duymak istiyorum', 'default': False,
        'remember': 'kullanıcı başına',
        'effect': 'voicePhaseGainDb.clarityMode + music.clarityMode + qa.speechOverBedDbMinClarity',
        'preselect': 'profilde yaş bilgisi 60 ve üstüyse önceden işaretli (pilot L3-10; profil alanı doğrulanmadı, '
                     'VARSAYIM)'}],
    'soundCheck': {
        'when': 'yalnız kişinin ilk Yoga oturumu bu dersse, "Başla"dan önce (kütüphane sırasında Ders 1 ilk derstir, '
                'PLAN.v2 §A.3); ayarlardan yeniden açılabilir',
        'clips': ['c3.ad', 'c3.d15'],
        'screenText': 'Bundan sonra yalnızca nokta ve nefes var. Işığın hâlâ noktada mı?',
        'level': 'Derin evre düzeyi (−3 dB) ve kısık Derin yatağı (≈ −36 LUFS)',
        'question': 'Sözcükleri rahatça seçebildin mi?', 'options': ['Evet', 'Hayır'],
        'onNo': 'speechClarity açılır ve kullanıcı başına hatırlanır', 'durationSec': 10,
        'note': 'VARSAYIM; pilotun kalıbı (ders2 soundCheck); sahibin kör dinlemesinde (karar 2 yedeği) sınanır'},
    'eveningHint': {'afterLocalHour': 20, 'text': 'Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir.',
                    'note': 'UI satırı, seste yok; Ders 1 ile aynı metin; saat eşiği VARSAYIM'},
    'leadIn': {'min': 3.0, 'pref': 4.0, 'max': 5.0},
    'limits': {
        'silenceWindowMaxSec': 90, 'clipMaxSec': 15,
        'clipMaxNote': 'Z3-07: birimin konuşması (cümle arası sessizlikler hariç) her hızda <= 15 sn',
        'lastSecondsNoNewImage': 60, 'sentenceGapMinDerinSec': 1.0,
        'silenceMaxSecUpTo15': 20,
        'silenceNote': ('<= 15 dk\'da duyurulu pencere yalnız C3\'te (sessiz odak aralıkları: ≈ 30 ve ≈ 45 sn; '
                        'pencere 25–36 ve 40–52 sn). Pencere dışındaki hiçbir sessizlik 20 sn\'yi aşmaz (PLAN.v2 '
                        '§B.2 boşluk sınıfları; PLAN.v3 §A.2 kural 3). 3 ve 5 dk\'da pencere yok. 60 sn\'lik aralık '
                        '30 dk iskeletinde (C3, ≤ 90 sn sınırı içinde)')},
    'sentenceGapByPhase': {'Varış': {'min': 0.6, 'pref': 0.8, 'max': 1.0},
                           'Derinleşme': {'min': 0.8, 'pref': 1.0, 'max': 1.3},
                           'Derin': {'min': 1.2, 'pref': 1.8, 'max': 2.5},
                           'Kapanış': {'min': 0.8, 'pref': 1.0, 'max': 1.2}},
    'planner': {
        'kural': ("Pilot planlayıcısı (timing.py) aynen: T4 tek Varış ve tek Kapanış; P1 bloklar zorunlu klipleriyle; "
                  "artımlar entryRank/fillRank sırasıyla, sessizlikler pref iken sığıyorsa; ilk sığmayanda durulur "
                  "(önek kuralı ⇒ plan(T) ⊆ plan(T+1)); Kapanış sessizlikleri sıkıştırılmaz (min = pref). Ders 5 "
                  "ekleri: (1) short (belowSec 240) ve minTarget (240) yalnız 3 dk'yı kurar; (2) 3 dk ⊆ 5 dk ve "
                  "5 → 15 her dakika bir sonrakinin alt kümesidir; (3) C3'ün duyurulu pencereleri (c3.w30 zorunlu, "
                  "c3.w45 isteğe bağlı) blokla birlikte girer, 3 ve 5 dk'da yoktur; (4) 16–30 dk artımlarının sırası "
                  "500 ve üstündedir (skeleton30), bu yüzden <= 15 dk planları ikinci aşamada değişmez."),
        'stretchCapBeforeIncrement': 0.5,
        'entryRanks': {'C2': 295, 'C3': 400},
        'p1DropOrder': [],
        'rankFloorStage3': 500,
        'variants': "Ders 5'te dönüşümlü seçenek (alternates) yok (VARSAYIM; pilot P-N5 kalıbı ikinci aşamada "
                    "eklenebilir)"},
    'timingModel': {
        'model': 'pilot timing.py: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31) '
                 '× DUR_SCALE',
        'corners': {
            'hoc': {'rate': 4.68, 'profile': 'hi', 'durScale': 1.0,
                    'basis': "Nefona Hoca önizleme eklemleme hızı 4,68 hece/sn (render/sel/hoc; orkestratör verisi) + "
                             "yüksek (Hakan v2) duraklama profili. VARSAYIM. Ders 1'deki denetim: aynı model Ders 2'nin "
                             "ölçülmüş hoc kliplerinden %3,6 uzun (ölçülen/model 0,965; 110 ortak klip) → muhafazakâr"},
            'hoc-lo': {'rate': 4.68, 'profile': 'lo', 'durScale': 1.0,
                       'basis': "aynı hız, düşük duraklama profili. VARSAYIM. Ders 2'nin ölçülmüş hoc kliplerine en "
                                "yakın model (ölçülen/model 0,990, 110 ortak klip)"},
            'nes': {'rate': 5.6, 'profile': 'hi', 'durScale': 1.109,
                    'basis': "Neslihan'ın Ders 2'de ölçülmüş süreleri: ölçülen/model(5,6 yüksek) = 1,109 (110 ortak "
                             "klip; v3/calc/measure.py). VARSAYIM: Ders 5 metnine aynı oranla taşındı"}},
        'slackFloors': {'3': 10.0, '5': 15.0,
                        'note': 'min sessizliklerle boş pay; 5 dk tabanı pilot T6 (15 sn), 3 dk tabanı sure.md §8 '
                                'önerisi (10 sn); ikisi de VARSAYIM'},
        'measuredRatioVsModel': None,
        'measuredRatioNote': 'Ders 5 ölçülmedi; Ders 2\'de hoc için ölçülen/model(5,6 yüksek) = 1,127 (SPEC.v3 §2)',
        'note': 'Ölçülmüş Ders 5 süresi yok; bütün süreler tahmindir. Ses üretilince voice.hoc.sec ile yeniden kurulur '
                've check_plan yeniden koşar.'},
    'voiceProduction': {
        'path': 'yalnız MCP (creative_generate_speech); hız, kararlılık, seed, previous_text ve telaffuz sözlüğü yok',
        'voice': 'Nefona Hoca (voice_id Sr5w7dIZaRDglJ2cLaJm; sahip 2026-09-30, madde 8, VARSAYIM seçimi)',
        'voice_id': 'Sr5w7dIZaRDglJ2cLaJm', 'sex_param': 'm',
        'model': 'eleven_v4 (SPEC.v3 §2)', 'generations_count': 3,
        'takes': 'birim başına 3 çekim (generations_count); Scribe birebir eşleşen ve kesimi tutan çekim seçilir '
                 '(SPEC.v3 §4, §6)',
        'microCuts': "Ders 5'te mikro ipucu yok; bütün birimler 1–3 tam cümle",
        'status': 'bu adımda hiçbir ses üretilmedi; ElevenLabs bağlantısı bu oturumda yok',
        'chosen': {'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm', 'sex_param': 'm', 'model': 'eleven_v4',
                   'generations_count': 3, 'note': 'SPEC.v3 §1.1 ve §2'}},
    'voicePhaseGainDb': {
        'Varış': 0.0, 'Derinleşme': -1.5, 'Derin': -3.0, 'Kapanış': 0.0,
        'kapanisGecisi': "k.donus'tan önceki >= 4 sn'lik sessizlikte rampa, o anki evre düzeyinden 0 dB'e (basamak "
                         "yok; pilot S3-02)",
        'clarityMode': {'Varış': 0.0, 'Derinleşme': -0.5, 'Derin': -1.0, 'Kapanış': 0.0,
                        'note': 'pilot L2-10 (VARSAYIM)'}},
    'music': {
        'source': ("müzik A = ElevenLabs Music (sahip 2026-09-30, madde 8): sürekli, sinüs benzeri tek ton dokusu, "
                   "dört evre varyantı. Çan ayrı bir örnektir (tek vuruş); üretim yolu açık (ElevenLabs ses efekti ya "
                   "da sentez; VARSAYIM, orkestratör kararı). Saf ton ElevenLabs Music'te temiz çıkmazsa ton, Ders 1'in "
                   "bordunu gibi uygulamanın kendi hattıyla sentezlenebilir (açık karar)"),
        'theme': ("Sol: 'neredeyse yok' müzik (PLAN.v2 Ders 5 kartı). Varış'ta iki kısmi sesli geniş ton (Sol + Re), "
                  "Derinleşme'de daralır, Derin'de tek kısmi ses (Sol), sessiz odak pencerelerinde neredeyse susar; "
                  "Kapanış'ta yeniden genişler. Bu, imge yayının sesteki karşılığıdır: geniş ışık → tek nokta → yeniden "
                  "geniş. 3, 5 ve 15 dk'da aynı tema (PLAN.v2 §A.1; PLAN.v3 §A.2 kural 11)"),
        'key': 'Sol (VARSAYIM; estetik karar; öteki dokuz dersin tonlarıyla çakışmaz: Re, Mi♭, La♭, Fa, Mi, La)',
        'bpmFeel': 60,
        'pulseNote': ('PLAN.v2 kartında 60 BPM; ton ritimsizdir, 60 BPM hissi yalnız çok yavaş genlik kıpırtısıyla '
                      'istemde istenir ve ölçülür (ElevenLabs Music\'te tempo parametresi yok; VARSAYIM)'),
        'phases': ['varis (geniş ton)', 'derinlesme (daralan ton)', 'derin (tek kısmi ses)', 'kapanis (genişleyen ton)'],
        'textureLayers': {
            'ton:daralir': 'c1.yer: Varış tonu → Derinleşme tonu, >= 8 sn çapraz geçiş, konuşmanın altında',
            'ton:ikinci-kismi': 'c2.giris: aynı ton, çok hafif ikinci kısmi ses (sayma bölümü)',
            'ton:tek': 'c3.ad: tek kısmi ses, Derin yatağı',
            'pencere:cekil': 'c3.kisa, c3.w30, c3.w45: yatak çekilir (≈ −6 dB, >= 6 sn rampa), gerçek sessizliğe yakın',
            'ton:genis': "k.donus: ton yeniden genişler; dönüş tınısı (çan) 2 sn önce",
            'rule': ("3 dk'da iki doku geçişi (Varış → çekirdek, çekirdek → Kapanış; PLAN.v3 §A.2 kural 11); çapraz "
                     "geçiş >= 8 sn; çan yalnız dönüşlerde ve k.donus'tan önce")},
        'duckDefault': True,
        'duckedBedLufs': {'Varış': -33.0, 'Derinleşme': -34.5, 'Derin': -36.0, 'Kapanış': -33.0},
        'windowBedAboveDuckDb': -6.0,
        'windowWithdraw': {'rampDownSec': 6, 'rampUpSec': 6, 'bellLeadSec': 2,
                           'note': ("PLAN.v2 Ders 5 kartı: sessiz odak aralıklarında müzik çekilir, gerçek sessizliğe "
                                    "yakın kalır (Bernardi 2006: 2 dk sessizlikte kalp hızı, kan basıncı ve "
                                    "ventilasyon başlangıcın altına indi). Pilotun +6 dB kabarmasının tersi; mix.py'de "
                                    "pencere yönü parametresi gerekir (açık iş, VARSAYIM). Rampa 1 dB/sn (SPEC §6 "
                                    "sınırı)")},
        'returnTone': ("Ders 5'te çan: her sessiz odak aralığının sonunda karşılamadan ve k.donus'tan 2 sn önce aynı "
                       "tek vuruşlu, yumuşak saldırılı çan; konuşma düzeyinin en az 6 dB altında (VARSAYIM). Çan ses "
                       "çapasıdır (PLAN.v2 kartı: 'Çanı duyduğunda dikkatini nefese getir.'); 30 dk'da C4 onu izleme "
                       "nesnesi yapar"),
        'endFadeSec': 5,
        'nature': {'default': 'kapalı', 'note': "PLAN.v2 §A.2.1: doğa kapalı; 'Doğa' seçilirse ikinci aşamada motor en "
                                               "uygun türü çalar"},
        'clarityMode': {'bedExtraDuckDb': -6.0, 'note': 'pilot L2-10 (VARSAYIM)'}},
    'visual': {
        'form': 'tek ışık noktası',
        'palette': {'dark': '#D6E4F2', 'light': '#4F5D6E', 'note': 'PLAN.v2 §E.2 (soğuk ışık beyazı; açık temada arduvaz)'},
        'phases': ['varis (geniş, soluk hale)', 'derinlesme (hale daralır)', 'derin (en küçük, en parlak nokta)',
                   'pencere (nokta yerinde, kıpırtısız)', 'kapanis(şafak; nokta yeniden genişler)'],
        'breathLock': ("nokta nefes almaz: nefes sesli sayılmadığı için kilitlenecek ipucu yok; yalnız >= 20 sn "
                       "periyotlu çok yavaş ışık kayması (PLAN.v2 §E.2). Ders 1'in halkasından ayrışır"),
        'pulse': {'respectFlashSafe': True, 'whenFlashSafeFalse': 'ölçeklenme yok, yalnız çok yavaş opaklık'},
        'dawn': {'startRule': 'max(k.donus.start, end - 90)', 'spanSec': [60, 90], 'spanSecBelow240': [45, 90],
                 'minRampSec': 60, 'minRampSecBelow240': 45,
                 'dawnMaxLuminance': 'bağıl %15 (PLAN.v2 §E.2 tavanı; VARSAYIM)',
                 'note': "3 dk'da şafak 45 sn (PLAN.v3 karar 4d)"},
        'eyeNote': ("Ekrana bakmak gerekmez: gözler kapalı ya da bakış yerde; ışık noktası göz yormayacak parlaklıkta "
                    "ve ekran açık tutulmaz (PLAN.v2 §A.1 'Ekran')")},
    'qa': {
        'speechOverBedDbMin': 15.0, 'speechOverBedDbMinClarity': 21.0,
        'speechOverBedNote': "her konuşma parçası (SPEC v3.4)",
        'bellBelowSpeechDb': 6.0,
        'bellNote': 'çanın gerçek tepe düzeyi konuşma parçalarının kısa süreli en yükseğinin en az 6 dB altında; '
                    'yumuşak saldırı (>= 30 ms), ani ses yok (VARSAYIM)',
        'derinClipRateCeil': 5.0,
        'sentenceGapNote': 'Derin evrede hiçbir cümle sınırında 1,0 sn\'den kısa sessizlik yok (pilot L3-02)',
        'piecePosition': 'SPEC v3.5–v3.6: her parça ±50 ms içinde, 4 kHz altı ilinti >= 0,95, kayma <= 1 ms',
        'microClipRmsOffsetDb': 0.0, 'speechOverBedAllPieces': True,
        'positionCheck': {'lowpassHz': 4000, 'corrMin': 0.95, 'searchMs': 50, 'maxShiftMs': 1.0}},
    'evidenceLine': ("Neye dayanıyor: bir çalışmada sekiz dakikalık nefes farkındalığından sonra, bir dikkat görevinde "
                     "zihin dağılmasının göstergeleri, gevşeme egzersizi yapanlara ya da okuyanlara göre azaldı. 45 "
                     "çalışmayı birleştiren bir incelemede düşünme becerilerindeki etki küçüktü ve başka etkin "
                     "uygulamalardan üstün değildi. Bu ders bir sonuç vaadi taşımaz."),
    'evidenceByVersion': {
        '3': ("Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık. Bir çalışmada meditasyon "
              "uygulamasını kullananların çoğu günde beş dakikanın altında kaldı; bu sürüm o gerçek kullanım için var."),
        '5': None, '15': None,
        'note': "PLAN.v3 §A.2 kural 12: 3 dk kartında etki cümlesi yok; yalnız Radin 2025'in kullanım bulgusu ve bu "
                "cümle (Ders 1 ile aynı)"},
    'sourcesCard': {
        'rows': [
            {'pmid': '22309719', 'cite': 'Mrazek 2012 · 8 dakika nefes farkındalığı ve zihin dağılması',
             'detail': 'Mrazek 2012 (Emotion; Çalışma 2: 8 dk farkındalıkla nefes, bir dikkat görevinde zihin '
                       'gezinmesinin davranışsal göstergelerini pasif gevşemeye ve okumaya göre azalttı)',
             'doi': '10.1037/a0026678', 'file': 'benlik (C04)'},
            {'pmid': '30127731', 'cite': 'Norris 2018 · acemilerde 10 dakikalık kayıt',
             'detail': 'Norris 2018 (2 çalışma; acemilerde 10 dk meditasyon kaydı kontrol kaydına göre dikkat '
                       'görevlerinde daha iyi sonuçla birlikte gitti; yazarlar "bazı acemilerde" diye sınırlıyor; '
                       'nevrotizm ayrımı yalnız ERP için)',
             'doi': '10.3389/fnhum.2018.00315', 'file': 'benlik (C05)'},
            {'pmid': '34350544', 'cite': 'Whitfield 2021 · 45 çalışmada küçük etki',
             'detail': 'Whitfield 2021 (56 çalışma, 45\'i meta-analizde, n=2238; nesnel bilişte g=0,15; etkisiz '
                       'karşılaştırmalardan üstün, aktif karşılaştırmalardan değil)',
             'doi': '10.1007/s11065-021-09519-y', 'file': 'benlik (C39)'},
            {'pmid': '34560133', 'cite': 'Feruglio 2021 · zihin dağılması ve pratik süresi',
             'detail': 'Feruglio 2021 (24 çalışma; önce-sonra çalışmalarının çoğunda en az 2 hafta pratikten sonra '
                       'zihin gezinmesi azaldı)',
             'doi': '10.1016/j.neubiorev.2021.09.032', 'file': 'benlik (C40)'},
            {'pmid': '16199412', 'cite': 'Bernardi 2006 · müzikte sessizlik aralığı',
             'detail': 'Bernardi 2006 (n=24; rastgele eklenen 2 dk sessizlik kalp hızını, kan basıncını ve dakika '
                       'ventilasyonunu başlangıç düzeyinin altına indirdi) → sessiz odak aralıklarında müzik çekilir',
             'doi': '10.1136/hrt.2005.064600', 'file': 'sakin'},
            {'pmid': '34306146', 'cite': 'Toussaint 2021 · "derin nefes" talimatı ve uyarılma',
             'detail': "Toussaint 2021 (RKÇ, n=60; derin nefes grubunda fizyolojik uyarılma önce arttı) → ders nefesi "
                       "değiştirmeden izletir, 'derin nefes al' demez",
             'doi': '10.1155/2021/5924040', 'file': 'sakin, güvenlik'},
            {'pmid': '39690521', 'cite': 'Luu 2024 · hazırlık, yerleşme ve dışa dönüş',
             'detail': "Luu 2024 (travma-duyarlı YN'nin 10 bileşeni; uygun uzunluk ve hazırlık, yeterli yerleşme ve "
                       "dışa dönüş; kavramsal)",
             'doi': '10.17761/2024-D-24-00021', 'file': 'sakin, güvenlik'},
            {'pmid': '28300508', 'cite': 'Howard 2017 · dönüşün önemi',
             'detail': 'Howard 2017 (klinik yorum ve 3 vaka; uyandırma başarısızlığı istenmeyen etkilerde önemli)',
             'doi': '10.1080/00029157.2016.1203281', 'file': 'güvenlik'},
            {'pmid': '24146758', 'cite': 'Cramer 2013 · yoganın yan etkileri',
             'detail': "Cramer 2013 (vaka raporları) → her harekette 'ağrı ya da baş dönmesi olursa bırak' "
                       "(güvenlik §11.B-17)",
             'doi': '10.1371/journal.pone.0075515', 'file': 'güvenlik'},
            {'pmid': '39808431', 'cite': 'Radin 2025 · gerçek kullanım kısa (3 dk kartı)',
             'detail': 'Radin 2025 (RKÇ, n=1458; tam metin: meditasyona özgü kullanım ortalama 3,36 dk/gün, '
                       'kullanıcıların %69,7\'si günde 5 dk\'nın altında)',
             'doi': '10.1001/jamanetworkopen.2024.54435', 'file': 'benlik (C09)'},
            {'pmid': '29939051', 'cite': 'Schumer 2018 · kısa farkındalık eğitimlerinde küçük etki',
             'detail': 'Schumer 2018 (65 RKÇ, n=5489; kısa farkındalık eğitimi olumsuz duygulanımda g=0,21; yayın '
                       'yanlılığı düzeltilince g=0,04)',
             'doi': '10.1037/ccp0000324', 'file': 'benlik (C02), sakin'},
        ],
        'note': "cite kartta gösterilir; detail yalnız ders5.script.md için. Hepsi *.dogrulanmis.md dosyalarından; "
                "ikinci turdan geçmemiş kaynaklar (Zuo 2023, Colzato 2012, Chu 2023, Pascoe 2017) kullanılmadı"},
    'progress': {
        'domain': 'focus', 'effectKey': 'yoga-odak', 'measure': 'odak',
        'question': 'Dikkatin şu an ne kadar toplanmış?', 'scale': [1, 10], 'scaleLabels': ['dağınık', 'toplanmış'],
        'better': 'up', 'when': 'önce ve sonra; ikisi de atlanabilir',
        'note': ("önce → sonra bir 'nasıl hissettin' gidişatıdır, etki kanıtı değildir (güvenlik §11.F); Gelişim'de "
                 "'dikkatin gelişti' denmez (Whitfield 2021: aktif karşılaştırmalara göre fark yok); PLAN.v2 Ders 5 "
                 "kartı, modul.md §2.5")},
    'afterCheck': {
        'question': 'Ders sırasında zorlandın mı?', 'options': ['Hayır', 'Biraz', 'Çok'], 'skippable': True,
        'onCok': ('Bu olabiliyor; zorlandığında durmak her zaman doğru bir seçim. Bir dahaki sefere daha kısa ya da gözleri açık bir sürüm '
                  'deneyebilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112.'),
        'storage': 'veri telefonda kalır; puan olarak gösterilmez (pilot ders2 ile aynı)'},
    'panelChecks': [
        'D5-01: çan sessizlikten sonra ürkütüyor mu? Tek vuruş, yumuşak saldırı, konuşmanın en az 6 dB altında; '
        'kör dinlemede "irkildim" diyen olursa çan yumuşatılır',
        'D5-02: pencerede müziğin çekilmesi "ses kesildi, bir şey bozuldu" diye algılanıyor mu? Duyuru ("Çanla yine '
        'seslenirim.") bunu karşılıyor mu',
        'D5-03: metafor ışığı ile gerçek ışık karışıyor mu ("Işığın hâlâ noktada mı?"); gözleri açık dinleyen '
        'soruyu yanlış anlıyor mu',
        'D5-04: "ona kadar" (sayı) ile "ona" (zamir) ve "On bire, on ikiye" söyleyişi; "Hâlâ" düzeltme işaretiyle '
        '(hala değil) okunuyor mu',
        'D5-05: "Fark ettin; döndün." ve "Yine döndün." bağlamında doğal mı; "başım döndü" çağrışımı var mı',
        'D5-06: avuçlama yönergesi (k.avuc1–4) kulakla izlenebiliyor mu; göze dokunma ya da bastırma algısı '
        'doğuruyor mu',
        'D5-07: sessiz sayma bölümünde (C2) 16–20 sn\'lik nefes payları uzun mu, kısa mı; dinleyici sayıyı '
        'sürdürebiliyor mu',
    ],
}

QUICK_CLOSING = {
    'id': 'K.hizli', 'kind': 'utility',
    'title': '"Kapanışa geç" (oturarak ders: aynı dosyanın Kapanış\'ına atlama)',
    'mode': 'sameFileClosing',
    'cue': {'music': 'phase:kapanis; returnTone:-2s (çan)', 'visual': 'dawn',
            'voiceGain': "rampa: o anki evre düzeyinden 0 dB'e 4 sn"},
    'leadInSec': 4.0, 'voiceGainRampSec': 4.0,
    'prefixByActiveBlock': {}, 'releaseClip': {},
    'windowReturn': {'c3.w30': 'c3.d30', 'c3.w45': 'c3.d45'},
    'rule': ("PLAN.v3 §D.3: o anki cümle biter; aynı dosyada Kapanış'ın başına, dönüş tınısından önceki sessizliğe "
             "2 sn'lik geçişle atlanır; kapanış kısalmaz. Ders 5'te imge ya da zor blok yok, bu yüzden bırakma ön "
             "klibi yok; k.nefes ('Işığı yeniden genişletiyorsun; …') odağı bırakır. Duyurulu bir pencerenin "
             "sessizliğinde basılırsa önce çan ve o pencerenin karşılama klibi çalar (pilot S3-01, MT3-07). Aşağıdaki "
             "klipler denetim içindir: en kısa Kapanış'ın zorunlu klipleri."),
}

STOP_RETURN = {'id': 'D.durdur', 'kind': 'utility',
               'title': "Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş (her derste aynı metin; pilot ders2'den "
                        "aynen, Ders 1 ile aynı)"}

FIRST_EVER = {'id': 'I.ilk', 'kind': 'utility',
              'title': 'Kişinin ilk yoga dersinde önce çalan kısa giriş dosyası (PLAN.v3 §D.3)',
              'rule': "dersin giriş müziği + tek cümle, sonra dersin başına 2 sn'lik geçiş; ≈ 7 sn (VARSAYIM); "
                      "planın dışında"}

SKELETON30 = {
    'status': ("İKİNCİ AŞAMA (Kapı 9–11): 16–30 dk metni yazılmadı. Bu bölüm iskelettir; usta hoca (ya da karar 2 "
               "yedeği) onayına gider. Ayrıntı: iskelet30.md"),
    'playOrder': ['A', 'C1', 'C2', 'BR.orta', 'C4', 'C3', 'C5', 'K'],
    'blocks': [
        {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C4'}, 'requiresMinSec': 1200,
         'entry': 'C4 ile birlikte',
         'content': ("ortadaki çıkış kapısı: ortak açılış cümlesinin 'istediğin an …' biçimi + oturduğun yer ya da "
                     "ellerin dayanak; >= 20 dk her sürümde (PLAN.v2 §C.5, güvenlik §11.B-3; pilot check_plan '>= 20 "
                     "dk ortada hatırlatma')")},
        {'id': 'C4', 'kind': 'core', 'priority': 4, 'playOrder': 3, 'entryRank': 520,
         'title': 'Ses çapası (çan) ve yumuşak bakış (gözler yarı açık, kırpmak serbest)',
         'content': ("iki bölüm (A.2.2: 11:00 ve 13:00). (a) Ses çapası: çan birkaç kez, aralıklı çalar; her vuruşta "
                     "ses sönene kadar izlenir, sönünce dikkat nefese döner ('Çanı duyduğunda dikkatin nefese "
                     "dönüyor.' kalıbı). (b) Yumuşak bakış (ilk ve tek geçişte 'drişti' adı, PLAN.v2 §C.7): gözler "
                     "yarı açık, bakış önde yerde bir noktada dinlenir; kırpmak serbest; 'Gözlerin yorulursa "
                     "kapatman ya da kırpman yeterli.' (PLAN.v2 Ders 5 güvenlik satırı); göze zorlayan hiçbir şey yok "
                     "(kırpmadan bakma, trataka yok; PLAN.v2 §A.0)"),
         'anchorsSec': {'20': 180, '30': 240}},
        {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 5, 'entryRank': 700,
         'title': 'Açık izleme: ışık yeniden genişler (sesler, sonra düşünceler gelip gider)',
         'content': ("A.2.2: 21:30 sesler, 24:30 düşünceler. El feneri ışığı genişler ve bütün odayı aydınlatır "
                     "(imge yayının 3. adımı). İki duyurulu pencere (<= 90 sn; duyuru bir kapı taşır, sonra çan ve "
                     "karşılama). Ders 9 sınırı: tanık göstergesi ('fark eden sensin') ve izleyen farkındalık yok "
                     "(PLAN.v2 §A.2.1 'Ders 2, 5 ve 9 sınırı')"),
         'anchorsSec': {'30': 360}},
    ],
    'stage3Additions': {
        'C3': ("üçüncü ve dördüncü aralık: ≈ 45 sn (15 dk'da isteğe bağlı c3.w45) ve ≈ 60 sn yeni pencere "
               "(PLAN.v2: 15 → 30 → 45 → 60 sn; A.2.2 18:30)"),
        'C1': 'ek odak aralıkları ve dağıl–fark et–dön turları (30 dk çapası 4:30)',
        'C2': 'yalnız verişte sayma bölümünün genişlemesi (A.2.2: 8:30); 30 dk çapası 5:00',
        'A': 'Varış 1:30 çapası (ör. bildirim ve oda, zemine temas)',
        'K': 'Kapanış 2:30 çapası; avuçlama her sürümde tam (A.2.2: 27:30 "kapanış ve isteğe bağlı avuçlama")'},
    'anchorsSec': {
        '3': {'A': 34, 'C1': 98, 'K': 48},
        '5': {'A': 45, 'C1': 180, 'K': 75},
        '10': {'A': 60, 'C1': 210, 'C2': 240, 'K': 90},
        '15': {'A': 75, 'C1': 240, 'C2': 240, 'C3': 240, 'K': 105},
        '20': {'A': 90, 'C1': 240, 'C2': 270, 'C4': 180, 'C3': 300, 'K': 120},
        '30': {'A': 90, 'C1': 270, 'C2': 300, 'C4': 240, 'C3': 390, 'C5': 360, 'K': 150},
        'source': "PLAN.v2 §B.4 Ders 5 çapaları ve PLAN.v3 §A.2 (3 dk; Giriş Varış'a dahil) (VARSAYIM); <= 15 dk'nın "
                  "planlanan süreleri timing.txt'te"},
    'keySentence': {'1': 'c1.anahtar1 · "Fark ettiğin an, zaten geri döndün." · C1 sonu',
                    '2': 'c2.anahtar2 · "Fark ettin; döndün." · C2 sonu',
                    '3': 'c3.anahtar3 · "Yine döndün." · C3 sonu (30 dk\'da C5\'ten önce)'},
    'imageArc': ['geniş ve dağınık ışık (Varış, a.dagink)',
                 'tek noktada toplanmış ışık; Derin\'de küçük ve parlak (C1 c1.nokta, C3 c3.parlak)',
                 'yeniden genişleyip bütün odayı aydınlatan ışık (30 dk: C5 açık izleme; <= 15 dk: Kapanış k.nefes, '
                 'k.sesler)'],
    'rankFloor': 500,
    'fillOrderStage3': ("(1) BR.orta + C4 (entryRank 520, 16–19. dk), (2) C1/C2/C3'ün 16–30 genişletmeleri (fillRank "
                        "530–690; C3'ün 60 sn penceresi dahil), (3) C5 (entryRank 700, ≈ 24–25. dk), (4) Varış ve "
                        "Kapanış'ın uzun biçimleri (30 dk çapası A 1:30, K 2:30) — sıra ikinci aşamada ölçülmüş "
                        "sürelerle kesinleşir"),
}
