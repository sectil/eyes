#!/usr/bin/env python3
"""ders1.lesson.json + planlayıcıdan ders1.script.md üretir (metin ve süreler tek kaynaktan)."""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402
import timing_d1 as D  # noqa: E402

OUT = os.path.join(HERE, 'ders1.script.md')
KREDI_KARAKTER = 0.926   # SPEC §2: kredi / karakter / çekim (tahmin çağrısından)
CEKIM = 3


def fmt(s):
    return '%d:%02d' % (int(s // 60), int(round(s % 60)) if round(s % 60) < 60 else 59)


def fmt1(s):
    return '%d:%04.1f' % (int(s // 60), s % 60)


def main():
    L = D.load()
    D.patch(L)
    res = {}
    for name, rate, prof, sc in D.corners(L):
        r, info, slack = D.run_corner(L, name, rate, prof, sc)
        res[name] = (r, info, slack)
    bm = {b['id']: b for b in L['blocks']}
    allc = {c['id']: (b['id'], c) for b in L['blocks'] for c in b['clips']}
    lines = []
    P = lines.append

    # ------------------------------------------------------------------ envanter
    sent = [c for b in L['blocks'] for c in b['clips'] if not c.get('carrier')]
    shorts = [c for c in sent if c.get('short') and c['short']['text'] != c['text']]
    shorts_same = [c for c in sent if c.get('short') and c['short']['text'] == c['text']]
    cars = L['carriers']
    micro = [c for b in L['blocks'] for c in b['clips'] if c.get('carrier')]
    ex_stop = L['extras']['stopReturn']['clips']
    ex_intro = L['extras']['firstEverIntro']['clips']
    units_lesson = len(sent) + len(shorts) + len(cars)
    ch_sent = sum(len(c['text']) for c in sent)
    ch_short = sum(len(c['short']['text']) for c in shorts)
    ch_car = sum(len(c['text']) for c in cars)
    ch_lesson = ch_sent + ch_short + ch_car
    ch_shared = sum(len(c['text']) for c in ex_stop + ex_intro)
    syl_sent = sum(c['syllables'] for c in sent)
    syl_short = sum(c['short']['syllables'] for c in shorts)
    syl_micro = sum(c['syllables'] for c in micro)
    words_sent = sum(c['words'] for c in sent)
    ids_total = sum(len(b['clips']) for b in L['blocks'])
    abil_units = [c['id'] for c in sent if T.n_abil(c['text'])]

    def plan(name, m):
        return res[name][0][m][0]

    def ok(name, m):
        return not res[name][0][m][1]

    # ------------------------------------------------------------------ başlık
    P('# Ders 1 · Nefesin Ritmi · metin (B adımı, Parti 1)')
    P('')
    P('Sürüm: %s. Tek kaynak `ders1_kaynak.py` (+ `lesson_meta.json`) → `ders1.lesson.json`; bu dosya ve `timing.txt` '
      '`ders1_md.py` ve `timing_d1.py` ile aynı veriden üretilir. Planlayıcı pilotun `timing.py`sidir (birebir kopya, '
      'değiştirilmedi); Ders 2\'ye özgü birkaç sabiti yalnız çalışma anında Ders 1 verisine göre ayarlanır '
      '(`timing.txt` başındaki "YAMA" satırları).' % L['version'])
    P('')
    P('**Durum, açıkça.** Bu, Ders 1\'in ilk yayın metnidir (3 · 5 · 15 dk ve 30 dk iskeleti). Hiçbir cümle '
      'seslendirilmedi: ElevenLabs bağlantısı bu oturumda yoktu, ücretli çağrı yapılmadı. Metin PLAN.v3 §E.1\'in üç '
      'onayından henüz geçmedi: model ilk denetimi (makineyle denetlenen kurallar) yapıldı ve geçti; Türkçe editör ve usta '
      'hoca yerine karar 2 yedeği olan **iki bağımsız model incelemesi** ve sahibin kulağı bekleniyor. Ders 1 klinik '
      'psikolog incelemesi gerektiren derslerden değildir (yalnız Ders 4 ve 7). Bütün süreler hece modelinden '
      'tahmindir (VARSAYIM); ses üretilince ölçülen sürelerle yeniden kurulur. Bu yüzden ders "bitti" sayılmaz.')
    P('')

    # ------------------------------------------------------------------ 0. tek bakışta
    P('## 0. Tek bakışta')
    P('')
    P('| | |')
    P('|---|---|')
    P('| Söz (kart) | %s |' % L['tagline'])
    P('| Kartın kanıt satırı (5 ve 15 dk) | "%s" |' % L['evidenceLine'])
    P('| 3 dk kartı (PLAN.v3 §A.2 kural 12) | "%s" |' % L['evidenceByVersion']['3'])
    P('| Süreler ve varsayılan | 3 · 5 · 15 dk; varsayılan 5 dk (PLAN.v3 §A.1). 30 dk ve kaydırıcı ikinci aşamada; 30 dk iskeleti `iskelet30.md` |')
    P('| Duruş | yalnız oturarak (sandalye ya da yer); ayakta ve uzanarak hiçbir şey yok |')
    P('| Açılış ekranı (`openingScreen`, `openingNotice`) | %s |' % ' · '.join('"%s"' % t for t in L['openingScreen']))
    P('| Hazırlık kartı | %s |' % ' · '.join(L['preparationCard']))
    P('| İlk yoga dersiyse | ayrı giriş dosyası: "%s" (PLAN.v3 §D.3; planın dışında, ≈ 7 sn) |' % ex_intro[0]['text'])
    P('| Derse özgü açılış (her sürümde aynı) | "%s" |' % allc['a.acilis'][1]['text'])
    P('| Ortak çıkış cümlesi | "%s" |' % allc['a.izin'][1]['text'])
    P('| Anahtar cümle, giderek kısa | 1) "%s" (%d hece; her sürümde, C1 sonu) · 2) "%s" (%d; C2 varken) · 3) "%s" (%d; C3 varken) |' % (
        allc['c1.anahtar1'][1]['text'], allc['c1.anahtar1'][1]['syllables'], allc['c2.anahtar2'][1]['text'],
        allc['c2.anahtar2'][1]['syllables'], allc['c3.anahtar3'][1]['text'], allc['c3.anahtar3'][1]['syllables']))
    P('| İmge yayı (işitsel, seçim gerekmez) | kendi nefesinin sesi (C1, C2) → vızıltının dudakta, yüzde, göğüste titreşimi (C3) → sesin ardından kalan sessizlik (C3 sonu; 30 dk\'da C5) |')
    P('| Nefes kalıpları | C1 4 al / 6 ver (10,000 sn), tutma yok · C2 iç çekiş 2,5 + 1,5 al / 6 ver (10,000 sn) · C3 vızıltılı nefes 4 al / 9 vızıltılı ver (13,000 sn; Trivedi 2023: 12–14 sn) |')
    P('| Nefes güvenliği (seste) | "%s" (her sürümde) · "%s" (C2) · "Arada nefesi tutmak yok." · "%s" · "%s" |' % (
        allc['c1.guven'][1]['text'], allc['c2.guven'][1]['text'], allc['c1.d2.s'][1]['text'], allc['c3.sessiz'][1]['text']))
    P('| Kapanış (gündüz, oturarak) | dönüş → nefes → parmaklar ve gerinme ("ağrı ya da baş dönmesi olursa bırak") → gözler ve oda → son cümle "%s" |' % allc['k.son'][1]['text'])
    P('| Müzik | Re: nefes bloklarında tanpura benzeri bordun (uygulama hattı, döngü nefes döngüsüne eşit); Varış ve Kapanış\'ta aynı tonda pad (müzik A, ElevenLabs Music); doğa kapalı; 3 dk\'da iki doku geçişi |')
    P('| Görsel | genişleyen halka (adaçayı yeşili `#8CCB9E`); yalnız söylenen "Al…"/"ver…" ipuçlarına ve sessiz döngü cümlesine kilitli; şafak 60–90 sn (3 dk\'da 45) |')
    r3, r5, r15 = [all(ok(n, m) for n in res) for m in (3, 5, 15)]
    P('| Zamanlama (`timing.txt`) | 3 köşe × 13 dakika (3, 4, 5–15): **%d/%d vaka geçti**; yayın süreleri 3 dk %s, 5 dk %s, 15 dk %s (üç köşede). Köşeler VARSAYIM: Nefona Hoca 4,68 hece/sn (yüksek ve düşük duraklama), Neslihan ölçülmüş süreleri |' % (
        sum(1 for n in res for m in D.MINUTES if ok(n, m)), len(res) * len(D.MINUTES),
        'GEÇTİ' if r3 else 'KALDI', 'GEÇTİ' if r5 else 'KALDI', 'GEÇTİ' if r15 else 'KALDI'))
    P('| Metin envanteri | %d klip kimliği (%d cümle birimi, %d mikro ipucu) + %d ayrı 3 dk kısa biçimi; TTS\'e %d istek (%d cümle birimi + %d kısa biçim + %d taşıyıcı), %d karakter; cümle birimleri %d hece, %d sözcük; mikro ipuçları %d hece. Ortak yardımcı klipler (Durdur dönüşü, ilk ders girişi) ayrıca %d istek, %d karakter |' % (
        ids_total, len(sent), len(micro), len(shorts), units_lesson, len(sent), len(shorts), len(cars), ch_lesson,
        syl_sent, words_sent, syl_micro, len(ex_stop) + len(ex_intro), ch_shared))
    for m in (3, 5, 15):
        P('| %d dk | %s |' % (m, T.fmt_blocks(plan('hoc', m))))
    P('')

    # ------------------------------------------------------------------ 1. kurgu
    P('## 1. Hocanın kurgusu')
    P('')
    P('### 1.1 Akış, evreler; ses, müzik ve görüntü')
    P('')
    P('Ders bir nefes dersidir; imge yoktur, dinleyicinin işi kendi nefesini duymak ve verişi uzatmayı öğrenmektir. '
      'Önce nefes değiştirilmeden izlenir (güvenlik §11.B-6; Toussaint 2021: "derin nefes" talimatı önce uyarılmayı '
      'artırdı), sonra ritim sayılarak öğretilir, sonra ses çekilir ve ritim dinleyiciye bırakılır. Evre geçişleri ses, '
      'müzik ve görüntüde aynı klipte olur.')
    P('')
    P('| Evre | Bloklar | Ses | Müzik (konuşmada kısık) | Görsel (genişleyen halka) |')
    P('|---|---|---|---|---|')
    P('| Varış | A | 0 dB; cümle arası 0,6–1 sn | pad (Re), ≈ −33 LUFS; ders 3 sn\'de açılır | en aydınlık (yine koyu), halka nefes almaz |')
    P('| Derinleşme | C1, C2, C3\'ün öğretimi ve vızıltı turları | −1,5 dB; cümleler kısalır | `c1.izle`\'de ≥ 8 sn çapraz geçişle bordun (Re + La), döngü 10,000 sn; `c3.ad`\'da 13,000 sn | daha loş; halka yalnız "Al…" (büyür) ve "ver…" (küçülür) ipuçlarında, sessiz döngü cümlesinde `cue.breath.count` kadar sessizce sürer |')
    P('| Derin | C3 sonu (`c3.sessizlik`, `c3.dogal`, `c3.anahtar3`) | −3 dB; en kısa cümleler | bordun kısılır | en loş |')
    P('| Kapanış | K | ≥ 4 sn\'lik sessizlikte rampa, 0 dB | `k.donus`\'ta bordun çekilir, pad girer; 2 sn önce dönüş tınısı; son 5 sn söner | şafak: max(`k.donus`, son − 90 sn)\'den sona, ≥ 60 sn (3 dk\'da 45) |')
    P('')
    P('### 1.2 Nefes kilidi ve azalan anlatım')
    P('')
    P('Nefes bloklarında zamanlama sessizlikle değil **periyotla** kurulur: her ipucunun `onsetPeriod`\'u sabittir '
      '(min = pref = max), sessizlik = periyot − gerçek klip süresi. Böylece "Al…" ile bir sonraki "Al…" arası her '
      'seste ve her sürede tam 10,000 sn (C3\'te 13,000 sn) olur; bordun ve halka buna kilitlenir. Planlayıcı bu '
      'klipleri esnetmez; dersin esnemesi nefes serilerinin arasındaki cümlelerden gelir. Kilit `timing_d1.py`\'de her '
      'planda ±0,02 sn ile denetlenir (D1-kilit, D1-döngü).')
    P('')
    P('Anlatım dört basamakta azalır (PLAN.v2 §C.2, Knowlton & Larkin 2006):')
    P('1. **Sayılı döngü** (`c1.s1`, 5 dk\'dan `c1.s2`): "Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…", '
      'öğeler 1,0 sn arayla.')
    P('2. **İpuçlu döngü**: "Al…" alışın başında, "ver…" verişin başında. Bazı döngülerde "ver…"den 1,2 sn sonra '
      'verişin içinde biten kısa bir cümle gelir ("Altı uzun gelirse beş de olur.", "Omuzların aşağı insin.").')
    P('3. **Yalnız "Al…"** (15 dk\'da C1 ve C2\'nin son döngüleri, C3\'ün ikinci turu): veriş halkada ve bordunda sürer.')
    P('4. **Sessiz döngü**: "Sıradaki nefes sende; ben susuyorum." (her sürümde) ve 15 dk\'da "Bu nefes de sende."; '
      'ardından ≈ 11–13 sn hiçbir söz yok, sonra ses bir sonraki alışın başında döner. ≤ 15 dk\'da hiçbir sessizlik '
      '20 sn\'yi aşmaz; duyurulu pencere yoktur (pencereler 30 dk\'nın C5\'inde).')
    P('')
    P('### 1.3 Anahtar cümle (PLAN.v2 §A.2.1, §C.4)')
    P('')
    P('Dersin fikri: alış kendiliğinden gelir, verişi kişi uzatır. Üç geçiş giderek kısalır (%d → %d → %d hece) ve '
      'her biri bir nefes bloğunun sonundadır; 3 ve 5 dk\'da bir kez (PLAN.v3 §A.2 kural 5), 15 dk\'da üç kez söylenir. '
      'PLAN.v2\'deki üçüncü biçimin üç noktası ("Veriş uzar…") PLAN.v2 §C.2 gereği atıldı (üç nokta yalnız '
      'listelerde).' % (allc['c1.anahtar1'][1]['syllables'], allc['c2.anahtar2'][1]['syllables'],
                        allc['c3.anahtar3'][1]['syllables']))
    P('')
    P('### 1.4 İmge yayı: işitsel')
    P('')
    P('Görsel imge yoktur, bu yüzden seçim de gerekmez (güvenlik §11.B-10 burada uygulanmaz). Yay: kendi nefesinin '
      'sesi ("Burnundan giren ve çıkan havanın hafif bir sesi var.", "Verişin sesi alışınkinden uzun.", iç çekişte '
      '"Uzun, yumuşak bir ses çıkıyor.") → vızıltının titreşimi ("Titreşimi dudaklarında, burnunda ya da yüzünde fark '
      'edebilirsin.", isteğe bağlı el göğüste) → sesin ardından kalan sessizlik ("Her iç çekişin ardından kısa bir '
      'sessizlik kalıyor.", "Ses dindi. Ardından kalan sessizliği de duyuyorsun."). Kapanış yayı odaya açar: "Odadaki '
      'sesler de yeniden duyuluyor." Son cümle açılışa döner: "Bütün gün seninle olan nefes" → "%s"' %
      allc['k.son'][1]['text'])
    P('')
    P('### 1.5 Benzersizlik (PLAN.v2 §A.2.1, §E.6 #17)')
    P('')
    P('| Öğe | Ders 1 | Yakınlık denetimi |')
    P('|---|---|---|')
    P('| Açılış | "%s" | PLAN.v2 yönündeki "…şimdi yalnızca dinleyebilirsin" "-(y)abil-"siz yazıldı; öteki dokuz dersin açılışıyla örtüşmez |' % allc['a.acilis'][1]['text'])
    P('| Anahtar cümle | alış/veriş cümleleri | "Fark ettiğin an, zaten geri döndün." (Ders 5) kullanılmadı; normalleştirme "Sayıyı kaçırırsan yeniden başlamak yeter." ile |')
    P('| İmge | işitsel yay | Ders 2\'nin rüzgâr/yaprak, Ders 9\'un okyanus dokusu yok; doğa kapalı |')
    P('| Görsel | genişleyen halka | tek kilitli form; öteki derslerin biçimleriyle çakışmaz |')
    P('| Müzik | Re bordun + pad | Ders 8\'in "Re\'de açık beşli bordun + alçak ahşap üflemeli" imzasıyla aynı ton ve bordun ailesi: **yakınlık, kayda alındı** (§7) |')
    P('| Nefes modülünden farkı | dört teknikten üçü ≤ 15 dk\'da (4/6, iç çekiş, vızıltı), sesli hoca, varış ve kapanış | Nefes modülü tek kalıbı sayaç ve görselle çalıştırır (PLAN.v2 Ders 1 kartı) |')
    P('')
    P('### 1.6 Dikkat eğrisi (15 dk, hoc köşesi; doku ya da teknik değişim anları)')
    P('')
    p15 = plan('hoc', 15)
    marks = []
    seen = set()
    for ev in p15['events']:
        c = ev['clip']
        key = None
        if ev['block'] != (marks[-1][2] if marks else None):
            key = {'A': 'varış', 'C1': 'doğal nefes', 'C2': 'iç çekiş: öğretim', 'C3': 'vızıltılı nefes: öğretim',
                   'K': 'kapanış'}[ev['block']]
        elif c['id'] == 'c1.s1.01':
            key = 'sayılı 4/6'
        elif c['id'] == 'c1.d1.al':
            key = 'ipuçlu 4/6'
        elif c['id'] == 'c1.d6.s':
            key = 'ilk sessiz döngü'
        elif c['id'] == 'c1.d11.al':
            key = 'yalnız "Al…"'
        elif c['id'] == 'c2.d1.al':
            key = 'iç çekiş döngüleri'
        elif c['id'] == 'c2.dogal':
            key = 'doğal nefes arası'
        elif c['id'] == 'c2.tur2':
            key = 'iç çekiş, ikinci tur'
        elif c['id'] == 'c3.d1.al':
            key = 'vızıltı, birinci tur'
        elif c['id'] == 'c3.titresim':
            key = 'titreşim'
        elif c['id'] == 'c3.d4.al':
            key = 'vızıltı, ikinci tur (yalnız "Al…")'
        elif c['id'] == 'c3.sessizlik':
            key = 'sesin ardından sessizlik (Derin)'
        if key and key not in seen:
            seen.add(key)
            marks.append((ev['start'], key, ev['block']))
    P(' · '.join('%s %s' % (fmt(t), k) for t, k, _ in marks))
    runs = T.texture_runs(p15)
    lg = max(runs, key=lambda r: r[2] - r[1])
    P('')
    P('En uzun tek doku koşusu: "%s" %.0f sn (pilot sınırı 300 sn). 30 dk\'nın değişim anları `iskelet30.md`\'de.' % (
        lg[0], lg[2] - lg[1]))
    P('')
    P('### 1.7 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)')
    P('')
    P('- **Yavaş nefes:** 223 çalışmalık sistematik derleme ve meta-analizde vagal aracılı kalp atışı değişkenliği '
      'seans sırasında, tek seanstan hemen sonra ve çok seanslı programdan sonra arttı (Laborde 2022, PMID 35623448, DOI '
      '[10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711); tempo özette verilmiyor). '
      'Dakikada 6 kez okunan ritmik dualarda ve mantralarda kardiyovasküler ritimler eşzamanlı güçlendi (Bernardi 2001, '
      'PMID 11751348, DOI [10.1136/bmj.323.7327.1446](https://doi.org/10.1136/bmj.323.7327.1446)). 4 al / 6 ver = '
      'dakikada 6 soluk.')
    P('- **Uzun veriş:** kısa alış / uzun veriş (oran 0,42), tersine (2,33) göre daha çok gevşeme bildirimiyle '
      'ilişkiliydi; yüksek frekanslı KAD artışı yalnız yavaş + uzun verişte görüldü (Van Diest 2014, n=30, PMID '
      '25156003, DOI [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x)).')
    P('- **İç çekiş:** günde 5 dk, 1 ay; döngüsel iç çekmede olumlu duygulanımda ve uyku sırasındaki solunum hızında '
      'meditasyondan fazla değişim görüldü; olumsuz duygulanım ve durumluk kaygıda gruplar arası fark yoktu; keşif '
      'amaçlı, çoğu üniversite öğrencisi (Balban 2023, n=108, PMID 36630953, DOI '
      '[10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895); tam metin). Tekniğin tarifi (burundan '
      'iki alış, ikincisi kısa; ağızdan uzun veriş) aynı çalışmadan. Alış süreleri (2,5 + 1,5 sn) VARSAYIM.')
    P('- **Vızıltılı nefes:** 8–14 sn döngülerde en yüksek KAD 12–14 sn döngüde görüldü (Trivedi 2023, kişi-içi '
      'çapraz, n=118, PMID 38204770, DOI [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23)) → 13 sn. '
      'Bir EEG çalışmasında vızıltılı nefes "uyanıklık" yönünde değişim gösterdi (dossier-sakin §4.4, PMID 42521250; '
      'bu PMID ikinci turda yeniden doğrulanmadı): bu yüzden vızıltı gündüz dersinde, uyku dersinde değil.')
    P('- **Hızlı nefes ve tutma yok:** hiperventilasyon jeneralize epilepside hastaların %50\'sine kadarında klinik '
      'nöbet tetikleyebilir (Rana 2023, PMID 37813123, DOI [10.1055/s-0043-1774808](https://doi.org/10.1055/s-0043-1774808)); '
      'HV sonrası tutma oksijen düşüşünü derinleştirdi (Pernett 2023, PMID 37060440). Ders 1\'de tutma hiç yok; '
      'nadi şodana da 30 dk iskeletinde tutmasız.')
    P('- **Varış ve dönüş:** travma-duyarlı yoga nidranın bileşenlerinden "uygun uzunluk ve hazırlık" ile "yeterli '
      'yerleşme ve dışa dönüş" (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021); '
      'kavramsal); uyandırma başarısızlığı istenmeyen etkilerde önemli bir etken sayıldı (Howard 2017, PMID 28300508, '
      'DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).')
    P('- **Hareket:** zorlu nefes yoganın yan etki vaka raporlarında en sık anılanlardandı (Cramer 2013, PMID 24146758, '
      'DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)) → her harekette "ağrı ya da '
      'baş dönmesi olursa bırak".')
    P('- **3 dk:** 3 dakikalık bir oturumun etkisini sınayan çalışma dosyalarda yok; kısa farkındalık eğitimlerinde '
      'olumsuz duygulanımdaki etki yayın yanlılığı düzeltilince g = 0,04\'e indi (Schumer 2018, PMID 29939051, DOI '
      '[10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Gerçek kullanımda meditasyona özgü kullanım günde '
      'ortalama 3,36 dk, kullanıcıların %69,7\'si günde 5 dk\'nın altında (Radin 2025, PMID 39808431, DOI '
      '[10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435); tam metin). 3 dk kartı '
      'yalnız bunu söyler.')
    P('')

    # ------------------------------------------------------------------ 2. süre
    P('## 2. Süre modeli, planlayıcı ve sonuç')
    P('')
    P('Model pilotunkidir: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31 sn; mikro '
      '0,15 sn). **Ders 1 için ölçülmüş süre yok.** Köşeler (hepsi VARSAYIM):')
    P('')
    for k, v in L['timingModel']['corners'].items():
        P('- `%s`: %.2f hece/sn, %s duraklama, süre × %.3f. %s.' % (k, v['rate'], v['profile'], v['durScale'], v['basis']))
    P('')
    P('Denetimler: pilot `check_plan` (toplam ±1 sn; kapaklar eksiksiz; sessizlik sınırları; son 60 sn; P1 bloklar; '
      'anahtar cümle sırası, kısalması ve aralığı; kapanış ritüeli; blokta ≥ 5 sn ve planda ≥ 8 sn sessizlik; dolgu '
      'sözcükleri; klip ≤ 15 sn; 60 sn\'de ≤ 150 hece ve ≤ %60 konuşma; Derin evre sınırları; duyurusuz sessiz 60 sn '
      'yok; ortalama hece/dk bandı; 10 dk ve üstünde doku koşusu ≤ 300 sn; T1 nefes beklemesi; "-(y)abil-" ≤ 3 / 60 sn; '
      'art arda ≤ 3 "-abilir"; şafak; blok tabanları; H12; L3-03) + Ders 1 ekleri (D1-kilit, D1-döngü, D1-sessizlik '
      '≤ 20 sn, D1-normal, D1-güvenlik, D1-nefes-payı, 3 dk\'nın PLAN.v3 §A.2 kuralları, üretim köşesinde boş pay) + '
      'önek kuralı (3 ⊆ 5; 5 → 15 her dakika) + T5.')
    P('')
    P('| Köşe | 3 dk | 5 dk | 15 dk | 3–15 dk (13 dakika) | Boş pay 3 / 5 dk (min sessizlik) |')
    P('|---|---|---|---|---|---|')
    for n in res:
        P('| %s | %s | %s | %s | %d/%d geçti | %.1f / %.1f sn |' % (
            n, 'GEÇTİ' if ok(n, 3) else 'KALDI', 'GEÇTİ' if ok(n, 5) else 'KALDI', 'GEÇTİ' if ok(n, 15) else 'KALDI',
            sum(1 for m in D.MINUTES if ok(n, m)), len(D.MINUTES), res[n][2][3], res[n][2][5]))
    P('')
    P('Boş pay tabanı (VARSAYIM): 3 dk\'da 10 sn (sure.md §8 önerisi), 5 dk\'da 15 sn (pilot T6); yalnız üretim sesinde '
      '(hoc, hoc-lo) denetlenir, `nes` bilgi içindir (pilot T6 kalıbı). **3 dk\'nın hoc köşesindeki boş payı tabana '
      'çok yakındır** (§7).')
    P('')
    P('**Blok süreleri (sn; Giriş Varış\'a dahil) ve çapalar:**')
    P('')
    P('| Sürüm | Çapa (PLAN.v3 §A.2; PLAN.v2 §B.4) | hoc | hoc-lo | nes |')
    P('|---|---|---|---|---|')
    anc = {3: 'A 0:34 · C1 1:38 · K 0:48', 5: 'A 0:45 · C1 3:00 · K 1:15',
           15: 'A 1:15 · C1 4:30 · C2 3:00 · C3 4:30 · K 1:45'}
    for m in (3, 5, 15):
        row = []
        for n in res:
            p = plan(n, m)
            bs = T.block_durations(p)
            bs['A'] = bs.get('A', 0) + p['events'][0]['start']
            row.append(' · '.join('%s %s' % (b, fmt(bs[b])) for b in ('A', 'C1', 'C2', 'C3', 'K') if b in bs))
        P('| %d dk | %s | %s |' % (m, anc[m], ' | '.join(row)))
    P('')
    ent = {}
    for m in D.MINUTES:
        for b in plan('hoc', m)['sel']:
            ent.setdefault(b, m)
    P('Blokların girdiği dakika (üç köşede aynı): %s. PLAN.v2 §B.4\'ün 10 dk çapası C2\'yi 10 dk\'da tam ister; '
      'planlayıcıda C2 8. dakikada, C3 12. dakikada girer (önek kuralı büyük bir bloğun tabanını ancak esneme payı '
      'yettiğinde alır). 15 dk\'da C1 çapadan uzun, C3 çapadan kısadır (§7).' % ', '.join(
          '%s %d dk' % (b, v) for b, v in ent.items()))
    P('')

    # ------------------------------------------------------------------ 3. metin
    P('## 3. Metin')
    P('')
    P('Sütunlar: kimlik · kat (Z zorunlu, İ isteğe bağlı + sıra, G genişletme + sıra) · metin · sonraki sessizlik '
      'min / pref / max sn (nefes kilitli kliplerde "periyot" = başlangıçtan başlangıca) · not. "3 dk:" satırı aynı '
      'kimliğin 3 dk\'daki kısa biçimidir (`short`, belowSec 240). `minTarget 240` olan klip 3 dk\'da çalmaz. Çok '
      'cümleli birim tek TTS isteğidir, cümle sonlarından kesilir; araya uygulamanın cümle arası sessizliği girer '
      '(Varış 0,6–1,0; Derinleşme 0,8–1,3; Derin 1,2–2,5; Kapanış 0,8–1,2 sn).')
    P('')

    def tier(c):
        t = {'required': 'Z', 'optional': 'İ', 'extension': 'G'}[c['tier']]
        if c.get('fillRank') is not None and c['tier'] != 'required':
            r = c['fillRank']
            t += ' %s' % (('%g' % r).replace('.', ','))
        return t

    def gapstr(c):
        ga = c['gapAfter']
        if c.get('onsetPeriod'):
            return 'periyot %s' % ('%g' % c['onsetPeriod']['pref']).replace('.', ',')
        return '%s / %s / %s' % tuple(('%g' % ga[k]).replace('.', ',') for k in ('min', 'pref', 'max'))

    def note(c):
        tg = c.get('tags', {})
        out = []
        if tg.get('key'):
            out.append('anahtar %d' % tg['key'])
        if tg.get('uniqueOpening'):
            out.append('derse özgü açılış')
        if tg.get('mood') == 'safety':
            out.append('güvenlik (emir kipi)')
        if tg.get('normalize'):
            out.append('başarısızlığı olağan sayar')
        if tg.get('arc'):
            out.append('imge yayı %s' % tg['arc'])
        if tg.get('explain'):
            out.append('açıklama (blokta tek)')
        if tg.get('silentCycle'):
            out.append('sessiz döngü')
        if tg.get('step'):
            out.append('adım: %s' % tg['step'])
        if c.get('minTarget'):
            out.append('3 dk\'da yok')
        if n_ab := T.n_abil(c['text']):
            out.append('"-(y)abil-" ×%d' % n_ab)
        return '; '.join(out)

    for b in L['blocks']:
        P('### %s · %s' % (b['id'], b['title']))
        P('')
        extra = ''
        if b.get('entryRank') is not None:
            extra = ' Blok giriş sırası (entryRank) %d.' % b['entryRank']
        P('Öncelik %s, çalma sırası %d.%s Tahmini süre (hoc): en kısa %.0f sn, 3/5/15 dk planında %s sn, en uzun %.0f sn.' % (
            'sabit' if b['priority'] == 0 else 'P%d' % b['priority'], b['playOrder'], extra, b['minSec'],
            ' / '.join('%g' % b['prefSec'][k] for k in ('3', '5', '15')), b['maxSec']))
        P('')
        P('| Kimlik | Kat | Metin | Sonra (sn) | Not |')
        P('|---|---|---|---|---|')
        clips = b['clips']
        i = 0
        while i < len(clips):
            c = clips[i]
            cyc = c.get('tags', {}).get('cycle')
            if cyc and c.get('tags', {}).get('breathLock'):
                grp = []
                while i < len(clips) and clips[i].get('tags', {}).get('cycle') == cyc:
                    grp.append(clips[i])
                    i += 1
                txt = ' · '.join(x['text'] for x in grp)
                pers = [x['onsetPeriod']['pref'] for x in grp]
                if len(set(pers)) == 1 and len(pers) > 2:
                    per = '%s × %d' % (('%g' % pers[0]).replace('.', ','), len(pers))
                else:
                    per = ' + '.join(('%g' % x).replace('.', ',') for x in pers)
                car = sorted({x['carrier']['id'] for x in grp if x.get('carrier')})
                nt = []
                for x in grp:
                    if not x.get('carrier'):
                        n2 = note(x)
                        if n2:
                            nt.append(n2)
                P('| %s | %s | %s | periyot %s | %s%s |' % (
                    cyc, tier(grp[0]), txt, per, 'taşıyıcı %s' % ', '.join(car) if car else '',
                    ('; ' + '; '.join(nt)) if nt else ''))
                continue
            P('| %s | %s | %s | %s | %s |' % (c['id'], tier(c), c['text'], gapstr(c), note(c)))
            if c.get('short') and (c['short']['text'] != c['text'] or c['short']['gapAfter'] != c['gapAfter']):
                sh = c['short']
                P('| ↳ 3 dk | | %s | %s | %s |' % (
                    sh['text'], '%s / %s / %s' % tuple(('%g' % sh['gapAfter'][k]).replace('.', ',')
                                                       for k in ('min', 'pref', 'max')),
                    sh.get('note', '')))
            i += 1
        P('')
    P('### Taşıyıcılar (mikro ipuçları tek istekte üretilir, üç nokta duraklarından kesilir)')
    P('')
    P('| Taşıyıcı | TTS metni | Öğe | Hece |')
    P('|---|---|---|---|')
    for car in cars:
        P('| %s | %s | %d | %d |' % (car['id'], car['text'], len(car['items']), car['syllables']))
    P('')
    P('### Ekler: hızlı kapanış, Durdur dönüşü, ilk ders girişi')
    P('')
    P('- **"Kapanışa geç":** %s' % L['extras']['quickClosing']['rule'])
    P('- **Durdur (X) sonrası sesli dönüş** (her derste aynı metin; pilot ders2\'den aynen): %s' % ' · '.join(
        '"%s"' % c['text'] for c in ex_stop))
    P('- **İlk ders girişi** (ayrı dosya): "%s"' % ex_intro[0]['text'])
    P('')

    # ------------------------------------------------------------------ 4. sürümler
    P('## 4. Sürümler (hoc köşesi: 4,68 hece/sn, yüksek duraklama; `nes` başlangıcı yanında)')
    P('')
    P('Her satır: başlangıç (hoc) · [nes] · blok · metin · ardından sessizlik (hoc). Mikro ipuçları döngü başına tek '
      'satırda; sayılı döngüde öğeler 1 sn arayla.')
    for m in (3, 5, 15):
        ph, pn = plan('hoc', m), plan('nes', m)
        start_n = {ev['clip']['id']: ev['start'] for ev in pn['events']}
        P('')
        P('### 4.%d %d dakika · hoc toplam %.1f sn, konuşma %.1f sn (%%%.0f), sessizlik kipi %s f=%.2f · nes konuşma %.1f sn' % (
            (3, 5, 15).index(m) + 1, m, ph['total'], ph['speech'], 100 * ph['speech'] / ph['total'], ph['mode'],
            ph['f'], pn['speech']))
        P('')
        P('```')
        evs = ph['events']
        i = 0
        while i < len(evs):
            ev = evs[i]
            c = ev['clip']
            cyc = c.get('tags', {}).get('cycle')
            if cyc and c.get('tags', {}).get('breathLock'):
                grp = []
                while i < len(evs) and evs[i]['clip'].get('tags', {}).get('cycle') == cyc:
                    grp.append(evs[i])
                    i += 1
                txt = ' '.join(e['clip']['text'] for e in grp)
                last = grp[-1]
                P('%7s [%7s] %-3s %s  [%.1f]' % (fmt1(ev['start']), fmt1(start_n.get(c['id'], float('nan')))
                                                 if c['id'] in start_n else '   —   ', ev['block'], txt, last['gap']))
                continue
            t = c['text'] + (' (3 dk kısa biçimi)' if c.get('shortForm') else '')
            P('%7s [%7s] %-3s %s  [%.1f]' % (fmt1(ev['start']), fmt1(start_n[c['id']]) if c['id'] in start_n else '   —   ',
                                             ev['block'], t, ev['gap']))
            i += 1
        P('```')
        only_n = sorted(set(start_n) - {e['clip']['id'] for e in evs})
        if only_n:
            P('')
            P('`nes` köşesinde ayrıca çalan (daha hızlı ses, aynı sürede daha çok içerik): %s.' % ', '.join(
                '`%s`' % x for x in only_n))
    P('')

    # ------------------------------------------------------------------ 5. denetim listeleri
    P('## 5. Denetim listeleri (model ilk denetimi; insan ya da yedek inceleme değildir)')
    P('')
    P('### 5.1 PLAN.v3 §A.2: 3 dakikanın 12 kuralı')
    P('')
    p3 = plan('hoc', 3)
    ids3 = [e['clip']['id'] for e in p3['events']]
    don = next(e for e in p3['events'] if e['clip']['id'] == 'k.donus')
    kab = sum(T.n_abil(e['clip']['text']) for e in p3['events'] if e['block'] == 'K')
    rows = [
        ('1 Yalnız oturarak', 'evet', 'posture = seated; kapanışta yana dönme, oturma, kalkma adımı yok'),
        ('2 Kapaklar kendi kısa metinleriyle', 'evet',
         '`a.durus` (duruş + gözler tek klip), `c1.ritim`, `k.goz` kısa biçimleri; `a.gozler` minTarget 240; Kapanış sessizlikleri min = pref'),
        ('3 Zaman verir; nefes payı 12–20 sn; > 20 sn sessizlik yok', 'evet',
         '`c1.izle` sonrası %.1f sn; en uzun sessizlik %.1f sn' % (
             next(e['gap'] for e in p3['events'] if e['clip']['id'] == 'c1.izle'), max(e['gap'] for e in p3['events']))),
        ('4 Tabanlar (çekirdek ≥ 0:55)', 'evet', 'C1 %s' % fmt(T.block_durations(p3)['C1'])),
        ('5 Anahtar cümle; başarısızlığı olağan sayan cümle', 'evet',
         '`c1.anahtar1` bir kez; "Altı uzun gelirse beş de olur.", "Sayıyı kaçırırsan yeniden başlamak yeter."'),
        ('6 "-(y)abil-"', 'evet',
         'derse özgü açılış "-(y)abil-"siz; `a.izin`\'den sonraki 60 sn\'de başka yok; Kapanış\'ta %d (`k.hareket`)' % kab),
        ('7 Son 60 sn', 'evet', 'yeni imge, tutma, zor blok yok; çekirdeğin son klibi anahtar cümle'),
        ('8 Şafak 45 sn', 'evet', '`k.donus` bitişe %.0f sn kala başlar' % (p3['total'] - don['start'])),
        ('9 Zor blok yok', 'evet', 'Ders 1\'de zor blok yok'),
        ('10 Alt küme', 'evet', '3 ⊆ 5 (üç köşede); ayrıca 3 ⊆ 4 ⊆ 5'),
        ('11 Müzik: iki doku geçişi, aynı tema', 'evet', 'pad → bordun (`c1.izle`) → pad (`k.donus`)'),
        ('12 Kartta 3 dk\'ya özgü etki cümlesi yok', 'evet', '`evidenceByVersion["3"]`'),
    ]
    P('| Kural | Durum | Kanıt (hoc 3 dk planı) |')
    P('|---|---|---|')
    for r in rows:
        P('| %s | %s | %s |' % r)
    P('')
    P('İskelet: giriş %.1f sn · Varış %s · çekirdek %s · Kapanış %s (hedef 0:04 / 0:30 / 1:38 / 0:48).' % (
        p3['events'][0]['start'], fmt(T.block_durations(p3)['A']), fmt(T.block_durations(p3)['C1']),
        fmt(T.block_durations(p3)['K'])))
    P('')
    P('### 5.2 Usta hoca ölçütleri (PLAN.v2 §E.6, 18 madde; model ilk işareti)')
    P('')
    e6 = [
        ('1 Zaman verir', 'evet', 'her yönergeden sonra eylem süresi + ≥ 2 sn; veriş cümleleri verişin içinde biter, ardından ≥ 0,6 sn'),
        ('2 Sessizliği kullanır', 'evet', 'her blokta ≥ 5 sn, her sürümde en uzun ≥ 12 sn (denetim)'),
        ('3 Sessizliği korur', 'evet', '≤ 15 dk\'da 20 sn\'yi aşan sessizlik yok; sessiz döngü önce söylenir'),
        ('4 Somut beden dili', 'evet', 'omuz, çene, yüz, dudak, diş, dil, burun, avuç, göğüs; "enerji" yok'),
        ('5 Tutarlı yön', 'uygulanmaz', 'beden dolaşımı yok'),
        ('6 Dolgu yok', 'evet', 'dolgu denetimi her planda geçti ("şimdi" yalnız açılışta)'),
        ('7 Anlatmaz, yaşatır', 'evet', 'blok başına tek açıklama (`c1.ritim`, `c2.ad`, `c3.ad`)'),
        ('8 Tek imge yayı', 'evet', 'işitsel yay (§1.4)'),
        ('9 Davet dili', 'açık soru', 'emir kipi yalnız güvenlikte ("dön", "bırak"); beden yönergelerinde 3. kişi istek kipi ("insin", "kalsın", "dursun", "olsun") ve mikro ipuçlarında "Al…", "ver…" var; Türkçe editör ve usta hoca kararı'),
        ('10 Başarısızlığı normalleştirir', 'evet', '`c1.d2.s`, `c1.d3.s`, `c3.kisa`, `a.kolay`'),
        ('11 Çıkış kapısı', 'evet', 'açılış cümlesi her sürümde; 30 dk\'da ortada `BR.orta` (iskelet); zor blok yok'),
        ('12 Kapanış ritüeli', 'evet', 'oturarak gündüz: nefes → parmaklar → gerinme → gözler → oda'),
        ('13 Azalan anlatım', 'evet', 'sayılı → ipuçlu → yalnız "Al…" → sessiz döngü; 15 dk\'da cümle uzunluğu Varış > Derinleşme > Derin (H12 geçti); Kapanış\'ta geri çıkış'),
        ('14 Doğal hız', 'açık', 'ses yok; üretimde ölçülür'),
        ('15 Ses–müzik', 'açık', 'ses yok; karışımda ölçülür (SPEC v3.4)'),
        ('16 Kusursuz Türkçe', 'açık', 'model okuması yapıldı; iki bağımsız model incelemesi ve Scribe geri çevirisi bekliyor'),
        ('17 Benzersizlik', 'evet (bir not)', '§1.5; müzikte Ders 8 ile ton/bordun yakınlığı'),
        ('18 Yasak liste ve güvenlik', 'evet', 'lint GEÇTİ; §5.3'),
    ]
    P('| Ölçüt | Durum | Gerekçe |')
    P('|---|---|---|')
    for r in e6:
        P('| %s | %s | %s |' % r)
    P('')
    P('### 5.3 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)')
    P('')
    g11 = [
        ('1 Davet', 'evet', 'bkz. E.6 #9'),
        ('2 Gözler açık seçeneği', 'evet', 'Varış\'ta her sürümde (`a.durus` kısa biçimi ya da `a.gozler`) ve `a.izin`'),
        ('3 "İstediğin an…"', 'evet', 'açılışta; 30 dk\'da ortada (iskelet `BR.orta`)'),
        ('4 Kontrol kişide', 'evet', '`a.karar`; yasak ifade yok'),
        ('5 Gevşeme zorunlu değil', 'kısmen', '5 ve 15 dk\'da `a.kolay` 6. dakikadan girer; 3 ve 5 dk\'da normalleştirme nefes kalıbı üzerinden ("Altı uzun gelirse…", "Sayıyı kaçırırsan…")'),
        ('6 Önce doğal nefes', 'evet', '`c1.izle` her sürümde ilk çekirdek klibi; "derin nefes al" yok'),
        ('7 Tutma', 'evet', 'hiç yok; "Arada nefesi tutmak yok."'),
        ('8 Dayanak ve kapı', 'uygulanmaz', 'zor bölüm yok'),
        ('9 Beden taraması', 'uygulanmaz', 'yok'),
        ('10 İmge seçimli', 'uygulanmaz', 'görsel imge yok'),
        ('11 Anı arama yok', 'evet', ''),
        ('12 Öz-şefkat', 'uygulanmaz', ''),
        ('13 Sağlık iddiası yok', 'evet', 'lint (PLAN.v2 §C.6 + E12); kart "Bu ders bir sonuç vaadi taşımaz."'),
        ('14 Gündüz dersi dönüşle biter', 'evet', 'oturarak: yana dönme ve kalkma yok'),
        ('15 Uyku izni', 'uygulanmaz', ''),
        ('16 Sessizlik rehberli', 'evet', '≤ 20 sn; sessiz döngü önce söylenir, ses bir sonraki alışta döner'),
        ('17 Hareket hafif', 'evet', '`k.hareket`: "ağrı ya da baş dönmesi olursa bırak"'),
        ('18 Tıbbi uyarı kartta', 'evet', 'derste yalnız teknik düzeyde güvenlik cümlesi (`c1.guven`, `c2.guven`)'),
    ]
    P('| Kural | Durum | Not |')
    P('|---|---|---|')
    for r in g11:
        P('| %s | %s | %s |' % r)
    P('')
    P('### 5.4 "-(y)abil-" ve yasak sözcükler')
    P('')
    P('"-(y)abil-" taşıyan cümle birimleri: %s. Herhangi bir 60 sn\'de en çok 3 ve art arda en çok 3 "-abilir" '
      'cümlesi her planda denetlendi. Yasak sözcük ve iddia listesi (PLAN.v2 §C.6 + pilot E12), İngilizce, Sanskritçe '
      '("bramari" bir kez), cümle başına ≤ 14 sözcük, birim başına 1–3 cümle, iki nokta üst üste (yok), mikro ipucu '
      'dışında üç nokta (yok): `timing.txt` "Metin denetimi" GEÇTİ.' % ', '.join('`%s`' % x for x in abil_units))
    P('')

    # ------------------------------------------------------------------ 6. üretim
    P('## 6. Üretim notları (seslendirme; bu adımda yapılmadı)')
    P('')
    kredi = ch_lesson * KREDI_KARAKTER * CEKIM
    P('- Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`), `eleven_v4`, birim başına 3 çekim, Scribe birebir (SPEC §2–§4, v3.1–v3.3).')
    P('- İstekler: %d cümle birimi + %d kısa biçim + %d taşıyıcı = **%d istek, %d karakter**. SPEC §2 fiyatıyla (0,926 '
      'kredi / karakter / çekim, 3 çekim) ≈ **%.0f kredi** (tahmin; yeniden çekimler ve Scribe hariç). Ortak yardımcılar '
      '(Durdur dönüşü, ilk ders girişi; her derste aynı, bir kez üretilir): %d istek, %d karakter.' % (
          len(sent), len(shorts), len(cars), units_lesson, ch_lesson, kredi, len(ex_stop) + len(ex_intro), ch_shared))
    if shorts_same:
        P('- Metni ana biçimle aynı olan kısa biçimler (yalnız sessizlik değişir, ayrı ses gerekmez): %s.' % ', '.join(
            '`%s`' % c['id'] for c in shorts_same))
    P('- Mikro ipuçları: sayılı taşıyıcıda öğeler arası duraklama kısadır; "en uzun N−1 duraklama" kesimi riskli. Kesim '
      'ölçüyle denetlenir ve kulak listesine girer (SPEC §4.3 c). Kesilemezse yedek: sayılı döngünün her öğesi kendi '
      'taşıyıcı cümlesinde ("…ve iki…" gibi) ayrı üretilir (maliyet artar, VARSAYIM).')
    P('- Tek heceli ipuçları ("Al…", "ver…", "üç…", "beş…"): SPEC v3.3 kısa parça düzeyi; konuşma/yatak ≥ 15 dB her '
      'parçada (v3.4). Karışımda "Al…" başlangıçları ±20 ms kilitli olmalı (`qa.breathLockToleranceSec`).')
    P('- Kulak denetimi listesi (insan kulağı; Scribe yakalayamaz):')
    for pc in L['panelChecks']:
        P('  - %s' % pc)
    P('')

    # ------------------------------------------------------------------ 7. açıklar
    P('## 7. VARSAYIM\'lar, açık noktalar ve kendi gördüğüm zayıf yerler')
    P('')
    weak = [
        '**Ses yok, süreler tahmin.** Nefona Hoca köşesi önizleme hızına (4,68) dayanır; aynı model Ders 2\'nin '
        'ölçülmüş hoc kliplerinden yüksek duraklamayla %3,6, düşük duraklamayla %1 uzun çıktı (110 ortak klip). Mikro ipuçlarının '
        '(0,4 sn) ve 1 sn\'lik sayıların gerçek süresi kesimden sonra ölçülmeli; sayı 0,7 sn\'yi aşarsa sayılı döngünün '
        'kilidi bozulur (D1-kilit kırmızı olur).',
        '**3 dk\'nın boş payı tabanın dibinde** (hoc %.1f sn; taban 10 sn, VARSAYIM). Sarsıntı taramasında süreler '
        '%%5 uzarsa 3 dk yalnız bu denetimden kalır. Ses ölçülünce daha yavaş çıkarsa ilk kısaltma adayı `c1.d2` '
        '(3 dk\'daki ilk ipuçlu döngü) ya da `a.durus` kısa biçimidir.' % res['hoc'][2][3],
        '**Sayılı döngünün 1 sn\'lik öğeleri** hem üretimde (kesim) hem dinleyicide (hız) en riskli yer. İpuçlarının '
        'tekdüze ya da makine gibi duyulması D1-02 kulak denetimine bırakıldı.',
        '**Veriş cümleleri verişin içinde bitmeli** (≤ 4,2 sn). En uzunu hoc köşesinde "Sıradaki nefes sende; ben '
        'susuyorum." ≈ 3,7 sn; ölçülen süre uzun çıkarsa cümle kısaltılır.',
        '**15 dk dağılımı çapadan sapıyor:** C1 ≈ 4:48 (çapa 4:30), C3 ≈ 4:09 (çapa 4:30); C2 8., C3 12. dakikada '
        'girer. Neden: önek kuralı bir bloğun tabanını ancak esneme payı yettiğinde alır; C3\'ün tabanı (öğretim + iki '
        'vızıltı + sessizlik + anahtar) ≈ 90 sn. Dolgu için 6–12. dakikalar arasında C1 ve C2\'ye yalnız "Al…"lı '
        'döngüler eklendi; 15 dk\'da C1\'in son 60 sn\'si yalnız "Al…" ipuçlarıdır (azalan anlatım, ama uzun).',
        '**Ara dakikalar (4, 6–14) yayında yok** ama önek kuralı ve kaydırıcı için denetlendi. 7 ve 12. dakikalar esneme '
        'sınırına yakın (T5 f ≈ 0,4–0,6); ara dakikaların içeriği ikinci aşamada ölçülmüş sürelerle yeniden sınanmalı.',
        '**Müzik imzası Ders 8\'e yakın:** PLAN.v2 §A.2.1\'de Ders 1 "tanpura benzeri bordun", Ders 8 "Re\'de açık '
        'beşli bordun"; ikisi de Re. Ders 8 yazılırken ton ya da tını ayrışmalı (öneri: Ders 8 La ya da ahşap üflemeli '
        'öne); kör dinlemede yan yana ayırt edilmeli.',
        '**Emir ve istek kipi:** "Al…", "ver…" ve "Omuzların aşağı insin." gibi 3. kişi istek kipi davet dilinin sınırında '
        '(E.6 #9). Nefes dersinde ipucu kısa olmak zorunda; karar Türkçe editör ve usta hoca yedeğinin.',
        '**"Sırada iç çekiş var." ve "Sıradaki nefesin adı bramari…"**: iki blok aynı kalıpla açılıyor (Sıra-). '
        'Bilinçli bir işaret olarak bırakıldı; editör isterse biri değişir.',
        '**Güvenlik §11.B-5** ("gevşeme zorunlu değil") 3 ve 5 dk\'da yalnız nefes kalıbı üzerinden karşılanıyor; '
        '`a.kolay` 6. dakikadan girer. 3 dk\'nın payı buna yetmedi.',
        '**Hazırlık kartındaki "sesinin kimseyi rahatsız etmeyeceği bir yer"** yalnız 15 dk için geçerli; kart sürüme '
        'göre değişmiyorsa 3 ve 5 dk\'da gereksiz bir satır olur (tasarım kararı).',
        '**Vızıltının EEG\'de uyanıklık yönü** (PMID 42521250) ikinci turda yeniden doğrulanmamış bir kayıttır; kartta '
        'kullanılmadı, yalnız §1.7\'de gerekçe olarak anıldı.',
        '**İnceleme yok:** PLAN.v3 §E.1\'in Türkçe editör ve usta hoca onayları (karar 2 yedeği: iki bağımsız model '
        'incelemesi) ve sahibin kulağı henüz yok; metin seslendirilmeden önce bu iki incelemeden geçmeli.',
    ]
    for i, w in enumerate(weak, 1):
        P('%d. %s' % (i, w))
    P('')
    P('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI\'ler https://doi.org/ önekiyle açılır)')
    P('')
    for r in L['sourcesCard']['rows']:
        P('- %s — PMID %s, DOI [%s](https://doi.org/%s) (%s)' % (r['detail'], r['pmid'], r['doi'], r['doi'], r['file']))
    P('- Ayrıca metinde anılan: Schumer 2018 (PMID 29939051, DOI '
      '[10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324), benlik), Pernett 2023 (PMID 37060440, DOI '
      '[10.1007/s00421-023-05202-7](https://doi.org/10.1007/s00421-023-05202-7), güvenlik), Knowlton & Larkin 2006 '
      '(PMID 16941239, DOI [10.1007/s10484-006-9014-6](https://doi.org/10.1007/s10484-006-9014-6), teslim).')
    P('')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('yazıldı', OUT, 'istek', units_lesson, 'karakter', ch_lesson, 'hece(cümle)', syl_sent, 'hece(kısa)', syl_short,
          'hece(mikro)', syl_micro, 'klip', ids_total, 'kredi~', round(kredi))


if __name__ == '__main__':
    main()
