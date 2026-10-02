#!/usr/bin/env python3
"""ders5.lesson.json + planlayıcıdan ders5.script.md üretir (metin ve süreler tek kaynaktan).
Sayıların hepsi çalışma anında plandan ve veriden hesaplanır; elle yazılmış süre yoktur."""
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402
import timing_d5 as D  # noqa: E402

OUT = os.path.join(HERE, 'ders5.script.md')
KREDI_KARAKTER = 0.99989   # SPEC.v3 §15.2: Nefona Hoca, eleven_v4, kredi / karakter / çekim (tahmin, uzlaştırılmadı)
CEKIM = 3
TEXTURE_LABEL = {
    'varis': 'varış', 'capa': 'nefes çapası (nokta seçimi, izleme)', 'dagil-don': 'dağıl, fark et, dön; odak aralıkları',
    'anahtar': 'anahtar cümle', 'sayma': 'nefes sayma, bir → on (içinden)', 'veris-sayma': 'yalnız verişte sayma',
    'sessiz-odak': 'sessiz odak aralıkları (çan)', 'kapanis': 'kapanış', 'avuclama': 'avuçlama (isteğe bağlı)',
}


def fmt(s):
    s = round(s)
    return '%d:%02d' % (s // 60, s % 60)


def fmt1(s):
    return '%d:%04.1f' % (int(s // 60), s % 60)


def num(x):
    return ('%g' % x).replace('.', ',')


def main():
    L = D.load()
    D.patch(L)
    res = {}
    for name, rate, prof, sc in D.corners(L):
        r, info, slack = D.run_corner(L, name, rate, prof, sc)
        res[name] = (r, info, slack)
    allc = {c['id']: (b['id'], c) for b in L['blocks'] for c in b['clips']}

    def C(i):
        return allc[i][1]

    lines = []
    P = lines.append

    # ------------------------------------------------------------------ envanter
    sent = [c for b in L['blocks'] for c in b['clips']]
    shorts = [c for c in sent if c.get('short') and c['short']['text'] != c['text']]
    shorts_same = [c for c in sent if c.get('short') and c['short']['text'] == c['text']]
    ex_stop = L['extras']['stopReturn']['clips']
    ex_intro = L['extras']['firstEverIntro']['clips']
    units_lesson = len(sent) + len(shorts)
    ch_sent = sum(len(c['text']) for c in sent)
    ch_short = sum(len(c['short']['text']) for c in shorts)
    ch_lesson = ch_sent + ch_short
    ch_shared = sum(len(c['text']) for c in ex_stop + ex_intro)
    syl_sent = sum(c['syllables'] for c in sent)
    syl_short = sum(c['short']['syllables'] for c in shorts)
    words_sent = sum(c['words'] for c in sent)
    words_short = sum(c['short']['words'] for c in shorts)
    n_sub = sum(len(c.get('subclips') or [c]) for c in sent)
    multi = [c for c in sent if c.get('subclips')]
    abil_units = [c['id'] for c in sent if T.n_abil(c['text'])]
    kredi = ch_lesson * KREDI_KARAKTER * CEKIM

    def plan(name, m):
        return res[name][0][m][0]

    def ok(name, m):
        return not res[name][0][m][1]

    def text_syl(p):
        return sum(ev['clip']['syllables'] for ev in p['events'])

    # ------------------------------------------------------------------ başlık
    P('# Ders 5 · Tek Nokta · metin (B adımı, Parti 1)')
    P('')
    P('Sürüm: %s. Tek kaynak `ders5_kaynak.py` (+ `ders5_meta.py`) → `ders5.lesson.json`; bu dosya ve `timing.txt` '
      '`ders5_md.py` ve `timing_d5.py` ile aynı veriden üretilir. Planlayıcı pilotun `timing.py`sidir (birebir kopya, '
      'sha256 58f6c405…, değiştirilmedi); Ders 2\'ye özgü birkaç sabiti yalnız çalışma anında Ders 5 verisine göre '
      'ayarlanır (`timing.txt` başındaki "YAMA" satırları).' % L['version'])
    P('')
    P('**Durum, açıkça.** Bu, Ders 5\'in ilk yayın metnidir (3 · 5 · 15 dk ve 30 dk iskeleti). Hiçbir cümle '
      'seslendirilmedi: ElevenLabs bağlantısı bu oturumda yoktu, ücretli çağrı yapılmadı; müzik ve çan da üretilmedi. '
      'Metin PLAN.v3 §E.1\'in model ilk denetiminden (makineyle denetlenen kurallar) ve karar 2 yedeği olan '
      '**iki bağımsız model incelemesinden** (Türkçe editör ve usta hoca mercekleri) geçti; bulgular işlendi '
      '(`b/INCELEME.md`). Sahibin kulağı ve Scribe geri çevirisi bekleniyor. Ders 5 klinik psikolog incelemesi gerektiren derslerden değildir (yalnız Ders 4 ve 7). Bütün '
      'süreler hece modelinden tahmindir (VARSAYIM); ses üretilince ölçülen sürelerle yeniden kurulur. Bu yüzden ders '
      '"bitti" sayılmaz.')
    P('')

    # ------------------------------------------------------------------ 0. tek bakışta
    P('## 0. Tek bakışta')
    P('')
    P('| | |')
    P('|---|---|')
    P('| Söz (kart) | %s |' % L['tagline'])
    P('| Kartın kanıt satırı (5 ve 15 dk) | "%s" |' % L['evidenceLine'])
    P('| 3 dk kartı (PLAN.v3 §A.2 kural 12) | "%s" |' % L['evidenceByVersion']['3'])
    P('| Süreler ve varsayılan | 3 · 5 · 15 dk; varsayılan 5 dk (PLAN.v3 §A.1). 30 dk ve kaydırıcı ikinci aşamada; '
      '30 dk iskeleti `iskelet30.md` |')
    P('| Duruş | yalnız oturarak (sandalye ya da yer); ayakta ve uzanarak hiçbir şey yok |')
    P('| Açılış ekranı (`openingScreen`, `openingNotice`) | %s |' % ' · '.join('"%s"' % t for t in L['openingScreen']))
    P('| Hazırlık kartı | %s |' % ' · '.join(L['preparationCard']))
    P('| İlk yoga dersiyse | ayrı giriş dosyası: "%s" (PLAN.v3 §D.3; planın dışında, ≈ 7 sn; Ders 1 ile aynı) |'
      % ex_intro[0]['text'])
    P('| Derse özgü açılış (her sürümde aynı) | "%s" |' % C('a.acilis')['text'])
    P('| Ortak çıkış cümlesi | "%s" |' % C('a.izin')['text'])
    P('| Anahtar cümle, giderek kısa | 1) "%s" (%d hece; her sürümde, C1 sonu) · 2) "%s" (%d; C2 varken) · 3) "%s" '
      '(%d; C3 varken) |' % (C('c1.anahtar1')['text'], C('c1.anahtar1')['syllables'], C('c2.anahtar2')['text'],
                            C('c2.anahtar2')['syllables'], C('c3.anahtar3')['text'], C('c3.anahtar3')['syllables']))
    P('| İmge yayı (tek imge, seçim gerekmez) | el fenerinin ışığı: geniş ve dağınık (Varış) → tek noktada toplanmış '
      '(C1), Derin\'de küçük ve parlak (C3) → yeniden genişleyip odayı aydınlatan ışık (Kapanış; 30 dk\'da C5 açık '
      'izleme) → "%s" |' % C('k.son')['text'])
    P('| Teknik | nefes çapası: nefesin en açık duyulduğu yer (burun, göğüs ya da karın) → dağıl, fark et, dön · '
      'içinden nefes sayma bir → on, sonra yalnız verişte · uzayan sessiz odak aralıkları (≈ 15 → 18 → 30 → 45 sn), '
      'her aralığın sonunda çan ve yumuşak geri çağırma · Kapanış\'ta isteğe bağlı avuçlama |')
    P('| Nefes | değiştirilmez: yalnız izlenir ve içinden sayılır; "derin nefes al", tutma ve sesli sayım yok |')
    P('| Kapanış (gündüz, oturarak) | dönüş → nefes (ışık genişler) → sesler → parmaklar ve gerinme ("ağrı ya da baş '
      'dönmesi olursa bırak") → [avuçlama] → gözler ve oda → gün içine köprü → son cümle "%s" |' % C('k.son')['text'])
    P('| Müzik | Sol, "neredeyse yok": sürekli, sinüs benzeri tek ton (müzik A, ElevenLabs Music; saf ton sentezle de '
      'olur, açık karar); Varış\'ta geniş, Derin\'de tek kısmi ses; sessiz odak aralıklarında yatak **çekilir** '
      '(kabarmaz); aralık sonunda çan (dönüş tınısı); doğa kapalı; 3 dk\'da iki doku geçişi |')
    P('| Görsel | tek ışık noktası (soğuk ışık beyazı `#D6E4F2`, açık temada arduvaz `#4F5D6E`); nefese kilitli değil; '
      'Varış\'ta geniş hale → Derin\'de en küçük ve parlak → Kapanış\'ta şafakla yeniden genişler; şafak 60–90 sn '
      '(3 dk\'da 45) |')
    P('| Gelişim | `%s` · "%s" 1–10 (%s → %s), ölçü etiketi "%s"; "dikkatin gelişti" denmez |' % (
        L['progress']['domain'], L['progress']['question'], L['progress']['scaleLabels'][0],
        L['progress']['scaleLabels'][1], L['progress']['measure']))
    tot_cases = len(res) * len(D.MINUTES)
    passed = sum(1 for n in res for m in D.MINUTES if ok(n, m))
    rel = {m: all(ok(n, m) for n in res) for m in (3, 5, 15)}
    P('| Zamanlama (`timing.txt`) | 3 köşe × 13 dakika (3, 4, 5–15): **%d/%d vaka geçti**; yayın süreleri 3 dk %s, '
      '5 dk %s, 15 dk %s (üç köşede). Köşeler VARSAYIM: Nefona Hoca 4,68 hece/sn (yüksek ve düşük duraklama), '
      'Neslihan ölçülmüş süreleri |' % (passed, tot_cases, *['GEÇTİ' if rel[m] else 'KALDI' for m in (3, 5, 15)]))
    P('| Metin envanteri | %d birim (klip kimliği; çok cümleli olanlar %d, parça toplamı %d) + %d ayrı metinli 3 dk kısa biçimi '
      '(%d kısa biçim yalnız sessizliği değiştirir); TTS\'e %d istek, %d karakter; birimler %d hece, %d sözcük; kısa '
      'biçimler %d hece, %d sözcük. Mikro ipucu ve taşıyıcı yok. Ortak yardımcı klipler (Durdur dönüşü, ilk ders '
      'girişi; her derste aynı) ayrıca %d istek, %d karakter |' % (
          len(sent), len(multi), n_sub, len(shorts), len(shorts_same), units_lesson, ch_lesson, syl_sent, words_sent,
          syl_short, words_short, len(ex_stop) + len(ex_intro), ch_shared))
    for m in (3, 5, 15):
        ph = plan('hoc', m)
        P('| %d dk (hoc) | %s · %d birim, %d hece, konuşma %%%.0f |' % (m, T.fmt_blocks(ph), len(ph['events']),
                                                                    text_syl(ph), 100 * ph['speech'] / ph['total']))
    P('')

    # ------------------------------------------------------------------ 1. kurgu
    P('## 1. Hocanın kurgusu')
    P('')
    P('### 1.1 Akış, evreler; ses, müzik ve görüntü')
    P('')
    P('Ders bir dikkat dersidir. Dinleyicinin işi nefesin en açık duyulduğu tek bir noktada kalmak, dağıldığında bunu '
      'fark etmek ve nazikçe geri gelmektir. Dersin fikri anahtar cümlededir: dağılmak başarısızlık değil, fark ettiğin '
      'an dönüş zaten olmuştur (PLAN.v2 §C.1; dossier-benlik §11 "Tasarıma etkisi"). Önce nefes değiştirilmeden izlenir '
      '(güvenlik §11.B-6; Toussaint 2021), sonra sayı bir tutamak olarak eklenir, sonra sayı da bırakılır ve aralar '
      'uzar. Evre geçişleri ses, müzik ve görüntüde aynı klipte olur.')
    P('')
    P('| Evre | Bloklar | Ses | Müzik (konuşmada kısık) | Görsel (tek ışık noktası) |')
    P('|---|---|---|---|---|')
    P('| Varış | A | 0 dB; cümle arası 0,6–1 sn | Sol, iki kısmi sesli geniş ton, ≈ −33 LUFS; ders 3–5 sn\'de açılır | '
      'geniş, soluk hale |')
    P('| Derinleşme | C1, C2 | −1,5 dB; cümleler kısalır | `c1.yer`\'de ≥ 8 sn çapraz geçişle daralan ton; `c2.giris`\'te '
      'çok hafif ikinci kısmi ses | hale daralır; nefese kilitli değil, ≥ 20 sn periyotlu çok yavaş ışık kayması |')
    P('| Derin | C3 | −3 dB; en kısa cümleler (H12) | `c3.ad`\'da tek kısmi ses; sessiz odak aralıklarında yatak '
      '≈ 6 dB **çekilir** (≥ 6 sn rampa), aralık sonunda çan | en küçük ve en parlak nokta; pencerede kıpırtısız |')
    P('| Kapanış | K | ≥ 4 sn\'lik sessizlikte rampa, 0 dB | `k.donus`\'tan 2 sn önce çan; ton yeniden genişler; `k.goz`\'de '
      'tek sıcak akor; son 5 sn söner | şafak: max(`k.donus`, son − 90 sn)\'den sona, ≥ 60 sn (3 dk\'da 45); nokta '
      'genişler |')
    P('')
    P('### 1.2 Neden sesli sayım yok; sessizlikler nasıl kurulur')
    P('')
    P('Nefes sayma (C2) dinleyicinin **içinden** ve kendi hızında yapılır. Hoca "bir… iki…" demez: sesli sayım bir '
      'nefes temposu dayatırdı; bu derste nefes değiştirilmez, yalnız izlenir (güvenlik §11.B-6). Ders 1\'in kilitli '
      'nefes ipuçlarından (4 al / 6 ver) bilinçli olarak ayrışır. Bu yüzden Ders 5\'te mikro-klip, taşıyıcı ve nefes '
      'kilidi yoktur; bütün birimler 1–3 tam cümledir ve üretimin en riskli parçası (mikro kesim) bu derste yoktur.')
    P('')
    P('Sessizlik üç sınıftadır (PLAN.v2 §B.2): eylem payı (yönergeden sonra 3–8 sn), nefes payı (12–20 sn; "birkaç '
      'nefes boyunca…", "Sayıyı bir süre sen sürdürüyorsun." gibi bir cümle sessizliği önceden söyler) ve C3\'te duyurulu '
      'sessiz pencere. Pencere yalnız 15 dk\'dadır: `c3.w30` (25–36 sn, zorunlu) ve `c3.w45` (40–52 sn, isteğe bağlı). '
      'Her pencere duyuru ile başlar (ne kadar süreceği, bir çıkış kapısı ve "Çanla yine seslenirim."), çanla ve bir '
      'karşılama cümlesiyle biter (güvenlik §11.B-16). 3 ve 5 dk\'da pencere yoktur; 20 sn\'yi aşan sessizlik de yoktur. '
      'Uzayan aralıkların sırası: `c1.aralik1` ≈ 16 sn → `c3.kisa` ≈ 15 sn → `c3.kisa2` ≈ 17–18 sn → `c3.w30` ≈ 30 '
      'sn → `c3.w45` ≈ 45 sn; 60 sn\'lik aralık 30 dk iskeletindedir.')
    P('')
    P('Anlatım evreden evreye azalır (PLAN.v2 §C.2): Varış\'ta uzun, davetkâr cümleler; C1–C2\'de tek yönerge; C3\'te '
      '"Işığın hâlâ noktada mı?", "Yine döndün." gibi en kısa cümleler. Evre başına ortalama cümle uzunluğu (hoc, 15 dk): '
      '%s (H12: Varış > Derinleşme > Derin).' % ', '.join('%s %s' % (k, num(round(v, 1))) for k, v in T.phase_sentence_means(
          plan('hoc', 15)).items()))
    P('')
    P('### 1.3 Anahtar cümle (PLAN.v2 §A.2.1, §C.4)')
    P('')
    P('"Fark ettiğin an, zaten geri döndün." yalnız Ders 5\'e aittir (PLAN.v2 §A.2.1 ve §C.1). Üç geçiş giderek kısalır '
      '(%d → %d → %d hece) ve her biri bir bloğun sonundadır; 3 ve 5 dk\'da bir kez (PLAN.v3 §A.2 kural 5), 15 dk\'da '
      'üç kez söylenir. İki sapma: (1) PLAN.v2\'nin 3. biçimi "Döndün…" üç nokta taşıyordu; üç nokta yalnız listelerde '
      'kullanıldığı için (PLAN.v2 §C.2) atıldı. (2) Tek sözcüklük "Döndün." pencereden sonra kopuk ve "başın döndü" '
      'çağrışımına açık duyuluyordu; "Yine döndün." yazıldı: dönüşün her seferinde olduğunu söyler ve kısalma sırasını '
      'korur. İkinci biçim "Fark ettin; döndün." PLAN.v2\'deki gibidir. Üçü de Türkçe editör ve kulak denetimine gider '
      '(panelChecks D5-05).' % (C('c1.anahtar1')['syllables'], C('c2.anahtar2')['syllables'],
                               C('c3.anahtar3')['syllables']))
    P('')
    dag_min = min(m for m in D.MINUTES if any(e['clip']['id'] == 'a.dagink' for e in plan('hoc', m)['events']))
    P('### 1.4 İmge yayı: el fenerinin ışığı (tek imge, seçimsiz)')
    P('')
    P('Açılış imgeyi kurar: "%s" Yay üç adımdır ve her sürümde en az iki adımı duyulur: (1) geniş ve dağınık ışık: '
      '"%s" (hoc köşesinde %d. dakikadan; daha kısa sürümlerde açılış cümlesi bu adımı taşır); (2) tek noktada toplanan ışık: "%s", '
      'Derin\'de "%s"; (3) yeniden genişleyen ışık: Kapanış\'ta "%s", "%s" ve son cümle "%s". 30 dk\'da üçüncü adım C5 '
      'açık izleme bloğunda tam bir bölüm olur (iskelet). İmgede su, derinlik, kapalı alan, yükseklik ya da karanlık '
      'yoktur; bu yüzden seçenek gerekmez (güvenlik §11.B-10). Görme tek başına bırakılmaz (PLAN.v2 §C.4): ışık imgesi '
      'hep somut bir duyuya bağlanır (burundaki serin ve ılık hava, göğsün ya da karnın yükselip inmesi, çanın sesi, '
      'avuçların sıcaklığı). Gözleri açık dinleyen için metafor ışığı ile odanın ışığı karışmasın diye Kapanış\'ta '
      '"ışığa alıştıra alıştıra" denmez; gözler "acele etmeden" açılır.' % (
          C('a.acilis')['text'], C('a.dagink')['text'], dag_min, C('c1.nokta')['text'], C('c3.parlak')['text'],
          C('k.nefes')['text'], C('k.sesler')['text'], C('k.son')['text']))
    P('')
    P('### 1.5 Benzersizlik (PLAN.v2 §A.2.1, §E.6 #17)')
    P('')
    P('| Öğe | Ders 5 | Yakınlık denetimi |')
    P('|---|---|---|')
    P('| Açılış | "%s" | PLAN.v2 yönündeki "…toplayabilirsin" "-(y)abil-"siz yazıldı; öteki dokuz dersin açılışıyla '
      'örtüşmez |' % C('a.acilis')['text'])
    P('| Anahtar cümle | fark et / dön | yalnız Ders 5; Ders 1 ve 2 kullanmaz (PLAN.v2 §C.1) |')
    P('| İmge | el feneri ışığı | Ders 6\'nın "pencereye vuran ilk ışık"ı şafak ışığıdır, dikkat metaforu değildir; '
      'Ders 7\'nin "göğüste sıcak ışık"ı görsel biçimdir. Metinde çakışan cümle yok; yakınlık kör dinlemede izlenir |')
    P('| Görsel | tek ışık noktası | öteki derslerin biçimleriyle çakışmaz; Ders 1\'in halkası nefese kilitli, bu nokta '
      'değil |')
    P('| Müzik | Sol, sinüs benzeri tek ton + çan | öteki derslerin tonları Re, Mi♭, La♭, Fa, Mi, La; çan yalnız bu '
      'derste ses çapası |')
    P('| Teknik | sessiz sayma, uzayan sessiz odak aralıkları | Ders 2\'nin sesli geri sayımından ve Ders 1\'in sayılı '
      'nefes döngüsünden ayrışır |')
    P('| Ders 2, 5 ve 9 sınırı | ≤ 15 dk\'da açık izleme yok; "fark eden sensin" tanık göstergesi yok | PLAN.v2 §A.2.1: '
      'sesleri ve düşünceleri açık izleme Ders 5\'in 30 dk\'sına (C5), izleyen farkındalık Ders 9\'a aittir |')
    P('| Ortak cümleler | `a.izin`, `k.donus`, `k.hareket`, Durdur dönüşü, ilk ders girişi her derste aynı; `a.gozler` '
      'Ders 1 ve 2\'nin göz cümlesiyle aynı kalıptadır | ritüel ve güvenlik cümleleridir; benzersizlik ölçütüne '
      'girmez |')
    P('')
    P('### 1.6 Dikkat eğrisi (15 dk, hoc köşesi; doku ya da teknik değişim anları)')
    P('')
    p15 = plan('hoc', 15)
    marks = []
    cur = None
    for ev in p15['events']:
        tx = ev['clip']['tags'].get('texture')
        if tx == 'anahtar':
            continue
        if tx != cur:
            marks.append('%s %s' % (fmt(ev['start']), TEXTURE_LABEL.get(tx, tx)))
            cur = tx
        if ev['clip'].get('window'):
            marks.append('%s sessiz pencere ≈ %d sn' % (fmt(ev['end']), round(ev['gap'])))
    P(' · '.join(marks))
    P('')
    runs = T.texture_runs(p15)
    lg = max(runs, key=lambda r: r[2] - r[1])
    P('En uzun tek doku koşusu: "%s" %.0f sn (pilot sınırı 300 sn). 30 dk\'nın değişim anları `iskelet30.md`\'de.'
      % (lg[0], lg[2] - lg[1]))
    P('')
    P('### 1.7 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)')
    P('')
    P('- **Nefese odaklanıp dağılınca dönmek:** 8 dakikalık farkındalıkla nefes, bir dikkat görevinde zihin '
      'gezinmesinin davranışsal göstergelerini pasif gevşemeye ve okumaya göre azalttı (Mrazek 2012, Çalışma 2, PMID '
      '22309719, DOI [10.1037/a0026678](https://doi.org/10.1037/a0026678); benlik C04). Acemilerde 10 dakikalık bir '
      'meditasyon kaydı, kontrol kaydına göre dikkat görevlerinde daha iyi sonuçla birlikte gitti; yazarlar bunu "bazı '
      'acemilerde" diye sınırlıyor (Norris 2018, PMID 30127731, DOI '
      '[10.3389/fnhum.2018.00315](https://doi.org/10.3389/fnhum.2018.00315); benlik C05, düzeltilmiş kayıt). Bu iki '
      'süre (8 ve 10 dk) 15 dk sürümünden kısadır; 3 ve 5 dk için doğrudan kanıt değildir.')
    P('- **Etki küçük, kalıcılık zayıf:** 45 RKÇ\'lik meta-analizde nesnel bilişte etki küçüktü (g = 0,15) ve aktif '
      'karşılaştırmalardan üstün değildi (Whitfield 2021, PMID 34350544, DOI '
      '[10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y); benlik C39). Zihin gezinmesindeki '
      'azalma çalışmaların çoğunda en az 2 haftalık pratikten sonra görüldü (Feruglio 2021, PMID 34560133, DOI '
      '[10.1016/j.neubiorev.2021.09.032](https://doi.org/10.1016/j.neubiorev.2021.09.032); benlik C40). Bu yüzden kart '
      'sonuç vaadi taşımaz ve Gelişim "dikkatin gelişti" demez.')
    P('- **Sessiz aralıklarda müziğin çekilmesi:** müzik parçaları arasına rastgele konan 2 dakikalık sessizlik kalp '
      'hızını, kan basıncını ve dakika ventilasyonunu başlangıç düzeyinin de altına indirdi (Bernardi 2006, n=24, PMID '
      '16199412, DOI [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600); sakin §11.5). PLAN.v2 kartı '
      'bu yüzden odak aralıklarında müziği çeker. Bu bir **tasarım çıkarımıdır**: çalışma meditasyon aralığını değil, '
      'müzik dinlerken sessizliği sınadı.')
    P('- **Nefes değiştirilmez:** "derin nefes" talimatı alan grupta fizyolojik uyarılma önce arttı (Toussaint 2021, '
      'PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040)); ders nefesi yalnız izletir ve '
      'içinden saydırır.')
    P('- **Varış ve dönüş:** travma-duyarlı yoga nidranın bileşenlerinden "uygun uzunluk ve hazırlık" ile "yeterli '
      'yerleşme ve dışa dönüş" (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021); '
      'kavramsal); uyandırma başarısızlığı istenmeyen etkilerde önemli bir etken sayıldı (Howard 2017, PMID 28300508, DOI '
      '[10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).')
    P('- **Hareket:** her harekette "ağrı ya da baş dönmesi olursa bırak" (güvenlik §11.B-17; Cramer 2013, PMID '
      '24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)).')
    P('- **Avuçlama:** PLAN.v2 kartındaki isteğe bağlı dinlenme ritüelidir; etkisi için kaynak aranmadı, **iddiasızdır** '
      '(doğrulanmadı). Avuçlar gözlere değmez ve bastırmaz (PLAN.v2 §A.1 "Gözlere dokunan yönerge yok").')
    P('- **3 dk:** 3 dakikalık bir oturumun etkisini sınayan çalışma dosyalarda yok; kısa farkındalık eğitimlerinde '
      'olumsuz duygulanımdaki etki yayın yanlılığı düzeltilince g = 0,04\'e indi (Schumer 2018, PMID 29939051, DOI '
      '[10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Gerçek kullanımda meditasyona özgü kullanım günde '
      'ortalama 3,36 dk, kullanıcıların %69,7\'si günde 5 dk\'nın altında (Radin 2025, PMID 39808431, DOI '
      '[10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435); tam metin). 3 dk kartı '
      'yalnız bunu söyler.')
    P('- **Kullanılmayanlar:** Zuo 2023 ("dikkat zamanın yarısında dağılıyor"), Colzato 2012 ve Pascoe 2017 (açık '
      'izleme), Chu 2023 ("fark ettim" dokunuşu) dosyada var ama ikinci turda doğrulanmadı (benlik §19 başlık notu); '
      'metinde ve kartta kullanılmadı.')
    P('')

    # ------------------------------------------------------------------ 2. süre
    P('## 2. Süre modeli, planlayıcı ve sonuç')
    P('')
    P('Model pilotunkidir: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31 sn). '
      '**Ders 5 için ölçülmüş süre yok.** Köşeler (hepsi VARSAYIM):')
    P('')
    for k, v in L['timingModel']['corners'].items():
        P('- `%s`: %.2f hece/sn, %s duraklama, süre × %.3f. %s.' % (k, v['rate'], v['profile'], v['durScale'],
                                                                  v['basis']))
    P('')
    P('Denetimler: pilot `check_plan` (toplam ±1 sn; kapaklar eksiksiz; sessizlik sınırları; son 60 sn; P1 bloklar; '
      'anahtar cümle sırası, kısalması ve aralığı; kapanış ritüeli; pencere duyurusu, kapı ve karşılama; blokta ≥ 5 sn ve '
      'planda ≥ 8 sn sessizlik; dolgu sözcükleri; klip ≤ 15 sn; 60 sn\'de ≤ 150 hece ve ≤ %60 konuşma; Derin evre '
      'sınırları; duyurusuz sessiz 60 sn yok; ortalama hece/dk bandı; 10 dk ve üstünde doku koşusu ≤ 300 sn; T1 nefes '
      'beklemesi; pencereden önceki 60 sn\'de ≥ %10 konuşma; pencere dışı 180 sn\'de ≥ %12 konuşma; Derin\'de tekdüze '
      'boşluk yok; "-(y)abil-" ≤ 3 / 60 sn; art arda ≤ 3 "-abilir"; şafak; blok tabanları; H12; L3-02; L3-03) + Ders 5 '
      'ekleri (D5-sessizlik: pencere dışında ≤ 20 sn; D5-pencere: yalnız 15 dk\'da, müzik çekilir, sonra çan; D5-kapı; '
      'D5-normal; D5-anahtar; D5-nefes-payı; 3 dk\'nın PLAN.v3 §A.2 kuralları ve iki kısa odak aralığı; üretim '
      'köşesinde boş pay) + önek kuralı (3 ⊆ 5; 5 → 15 her dakika) + T5 + metin denetimi (`lint_text`) ve "Kapanışa '
      'geç"in bütün bağlamları (pencere içinde basılması dahil).')
    P('')
    P('| Köşe | 3 dk | 5 dk | 15 dk | 3–15 dk (13 dakika) | Boş pay 3 / 5 dk (min sessizlik) |')
    P('|---|---|---|---|---|---|')
    for n in res:
        P('| %s | %s | %s | %s | %d/%d geçti | %.1f / %.1f sn |' % (
            n, *['GEÇTİ' if ok(n, m) else 'KALDI' for m in (3, 5, 15)],
            sum(1 for m in D.MINUTES if ok(n, m)), len(D.MINUTES), res[n][2][3], res[n][2][5]))
    P('')
    P('Boş pay tabanı (VARSAYIM): 3 dk\'da 10 sn (sure.md §8 önerisi), 5 dk\'da 15 sn (pilot T6); yalnız üretim sesinde '
      '(hoc, hoc-lo) denetlenir, `nes` bilgi içindir (pilot T6 kalıbı).')
    P('')
    P('**Blok süreleri (Giriş Varış\'a dahil) ve çapalar:**')
    P('')
    P('| Sürüm | Çapa (PLAN.v3 §A.2; sure.md §4; PLAN.v2 §B.4) | hoc | hoc-lo | nes |')
    P('|---|---|---|---|---|')
    anc = {3: 'A 0:34 · C1 1:38 · K 0:48', 5: 'A 0:45 · C1 3:00 · K 1:15',
           15: 'A 1:15 · C1 4:00 · C2 4:00 · C3 4:00 · K 1:45'}
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
    stops = {n: plan(n, 15)['stop'] for n in res}
    P('Blokların girdiği dakika (hoc): %s. PLAN.v2 §B.4\'ün 10 dk çapası C2\'yi 10 dk\'da tam ister; planlayıcıda C2 '
      '%d., C3 %d. dakikada girer (önek kuralı bir bloğun tabanını ancak sığdığında alır). 15 dk\'da Varış ve Kapanış '
      'çapadan uzun, C2 kısadır; neden: isteğe bağlı avuçlama Kapanış\'a %.0f sn ekler (hoc; §7). 15 dk planının '
      'durduğu artım: %s.' % (', '.join('%s %d dk' % (b, v) for b, v in ent.items()), ent.get('C2', 0), ent.get('C3', 0),
                      sum(ev['dur'] + ev['gap'] for ev in plan('hoc', 15)['events'] if ev['clip']['id'].startswith('k.avuc')),
                      '; '.join('%s %s' % (n, s[1] if s else 'yok (bütün ≤ 15 dk içeriği girdi)')
                                for n, s in stops.items())))
    P('')

    # ------------------------------------------------------------------ 3. metin
    P('## 3. Metin')
    P('')
    P('Sütunlar: kimlik · kat (Z zorunlu, İ isteğe bağlı + dolum sırası) · metin · sonraki sessizlik min / pref / max sn '
      '(pencerede pencere süresi) · not. "↳ 3 dk" satırı aynı kimliğin 3 dk\'daki biçimidir (`short`, belowSec 240; '
      'metni aynıysa yalnız sessizlik değişir, ayrı ses üretilmez). "3 dk\'da yok" = `minTarget 240`. Çok cümleli birim '
      'tek TTS isteğidir, cümle sonlarından kesilir; araya uygulamanın cümle arası sessizliği girer (Varış 0,6–1,0; '
      'Derinleşme 0,8–1,3; Derin 1,2–2,5; Kapanış 0,8–1,2 sn). Hiçbir çok cümleli birimde iki nokta üst üste yoktur '
      '(SPEC v3.1).')
    P('')

    def tier(c):
        t = {'required': 'Z', 'optional': 'İ', 'extension': 'G'}[c['tier']]
        if c.get('fillRank') is not None and c['tier'] != 'required':
            t += ' %s' % num(c['fillRank'])
        return t

    def gapstr(ga):
        return '%s / %s / %s' % tuple(num(ga[k]) for k in ('min', 'pref', 'max'))

    def note(c):
        tg = c.get('tags', {})
        out = []
        if tg.get('key'):
            out.append('anahtar %d' % tg['key'])
        if tg.get('uniqueOpening'):
            out.append('derse özgü açılış')
        if tg.get('safety') == 'opening':
            out.append('ortak çıkış cümlesi')
        if tg.get('mood') == 'safety':
            out.append('güvenlik')
        if tg.get('normalize'):
            out.append('başarısızlığı olağan sayar')
        if tg.get('arc') is not None and tg.get('arc') != 0:
            out.append('imge yayı %s' % tg['arc'])
        if tg.get('explain'):
            out.append('açıklama (blokta tek)')
        if c.get('window'):
            out.append('**duyurulu pencere** (kapı: %s)' % ('gözleri açmak' if tg.get('eyesOpen') else 'eller'))
        if tg.get('welcome'):
            out.append('karşılama')
        if 'returnTone' in (c.get('cue', {}).get('music') or ''):
            out.append('öncesinde çan')
        if tg.get('breathRoom'):
            out.append('nefes payı')
        if tg.get('step'):
            out.append('adım: %s' % tg['step'])
        if c.get('minTarget'):
            out.append('3 dk\'da yok')
        n_ab = T.n_abil(c['text'])
        if n_ab:
            out.append('"-(y)abil-" ×%d' % n_ab)
        return '; '.join(out)

    for b in L['blocks']:
        P('### %s · %s' % (b['id'], b['title']))
        P('')
        extra = ''
        if b.get('entryRank') is not None:
            extra = ' Blok giriş sırası (entryRank) %d.' % b['entryRank']
        P('Öncelik %s, çalma sırası %d.%s Tahmini süre (hoc): en kısa %.0f sn, 3/5/15 dk planında %s sn, en uzun %.0f '
          'sn.' % ('sabit' if b['priority'] == 0 else 'P%d' % b['priority'], b['playOrder'], extra, b['minSec'],
                   ' / '.join(num(b['prefSec'][k]) for k in ('3', '5', '15')), b['maxSec']))
        P('')
        P('| Kimlik | Kat | Metin | Sonra (sn) | Not |')
        P('|---|---|---|---|---|')
        for c in b['clips']:
            P('| %s | %s | %s | %s | %s |' % (c['id'], tier(c), c['text'], gapstr(c['window'] if c.get('window')
                                                                              else c['gapAfter']), note(c)))
            sh = c.get('short')
            if sh and (sh['text'] != c['text'] or sh['gapAfter'] != c['gapAfter']):
                P('| ↳ 3 dk | | %s | %s | %s |' % ('(aynı metin)' if sh['text'] == c['text'] else sh['text'],
                                                   gapstr(sh['gapAfter']), sh.get('note', '')))
        P('')
    P('### Ekler: hızlı kapanış, Durdur dönüşü, ilk ders girişi')
    P('')
    P('- **"Kapanışa geç":** %s' % L['extras']['quickClosing']['rule'])
    P('- **Durdur (X) sonrası sesli dönüş** (her derste aynı metin; pilot ders2\'den aynen): %s' % ' · '.join(
        '"%s"' % c['text'] for c in ex_stop))
    P('- **İlk ders girişi** (ayrı dosya, her derste aynı): "%s"' % ex_intro[0]['text'])
    P('')

    # ------------------------------------------------------------------ 4. sürümler
    P('## 4. Sürümler (hoc köşesi: 4,68 hece/sn, yüksek duraklama; `nes` başlangıcı yanında)')
    P('')
    P('Her satır: başlangıç (hoc) · [nes] · blok · metin · ardından sessizlik (hoc, sn). "(3 dk kısa biçimi)" = `short`. '
      'Çok cümleli birimde cümle arası sessizlik satırın içindedir.')
    for m in (3, 5, 15):
        ph, pn = plan('hoc', m), plan('nes', m)
        start_n = {ev['clip']['id']: ev['start'] for ev in pn['events']}
        P('')
        P('### 4.%d %d dakika · hoc toplam %.1f sn, konuşma %.1f sn (%%%.0f), %d hece, sessizlik kipi %s f=%.2f · nes '
          'konuşma %.1f sn' % ((3, 5, 15).index(m) + 1, m, ph['total'], ph['speech'], 100 * ph['speech'] / ph['total'],
                               text_syl(ph), ph['mode'], ph['f'], pn['speech']))
        P('')
        P('```')
        P('%7s  %-3s %s' % ('giriş', '', 'müzik açılır, %.1f sn' % ph['events'][0]['start']))
        for ev in ph['events']:
            c = ev['clip']
            t = c['text'] + (' (3 dk kısa biçimi)' if c.get('shortForm') else '')
            win = ' PENCERE' if c.get('window') else ''
            bell = '(çan) ' if 'returnTone' in (c.get('cue', {}).get('music') or '') else ''
            P('%7s [%7s] %-3s %s%s  [%.1f%s]' % (fmt1(ev['start']), fmt1(start_n[c['id']]) if c['id'] in start_n
                                                 else '   —   ', ev['block'], bell, t, ev['gap'], win))
        P('```')
        only_n = sorted(set(start_n) - {e['clip']['id'] for e in ph['events']})
        only_h = sorted({e['clip']['id'] for e in ph['events']} - set(start_n))
        if only_n:
            P('')
            P('`nes` köşesinde ayrıca çalan (daha hızlı ses, aynı sürede daha çok içerik): %s.' % ', '.join(
                '`%s`' % x for x in only_n))
        if only_h:
            P('')
            P('Yalnız `hoc` köşesinde çalan: %s.' % ', '.join('`%s`' % x for x in only_h))
    P('')

    # ------------------------------------------------------------------ 5. denetim listeleri
    P('## 5. Denetim listeleri (model ilk denetimi; insan ya da yedek inceleme değildir)')
    P('')
    P('### 5.1 PLAN.v3 §A.2: 3 dakikanın 12 kuralı')
    P('')
    p3 = plan('hoc', 3)
    g3 = {e['clip']['id']: e['gap'] for e in p3['events']}
    don = next(e for e in p3['events'] if e['clip']['id'] == 'k.donus')
    kab = sum(T.n_abil(e['clip']['text']) for e in p3['events'] if e['block'] == 'K')
    bd3 = T.block_durations(p3)
    rows = [
        ('1 Yalnız oturarak', 'evet', 'posture = seated; kapanışta yana dönme, oturma, kalkma adımı yok'),
        ('2 Kapaklar kendi kısa metinleriyle', 'evet',
         '`a.durus` (duruş + gözler tek birim) ve `k.goz` kısa metinli; `a.izin`, `a.acilis`, `k.nefes`, `k.hareket` '
         'kısa sessizlikli; `a.gozler`, `c1.nokta` minTarget 240; Kapanış sessizlikleri min = pref'),
        ('3 Zaman verir; nefes payı 12–20 sn; > 20 sn sessizlik yok', 'evet',
         '`c1.izle` sonrası %.1f sn; en uzun sessizlik %.1f sn; pencere yok' % (g3['c1.izle'],
                                                                             max(g3.values()))),
        ('4 Tabanlar (çekirdek ≥ 0:55)', 'evet', 'C1 %s' % fmt(bd3['C1'])),
        ('5 Anahtar cümle bir kez; başarısızlığı olağan sayan cümle', 'evet',
         '`c1.anahtar1` bir kez; "%s"' % C('c1.kayma')['short']['text']),
        ('6 "-(y)abil-"', 'evet',
         'derse özgü açılış "-(y)abil-"siz; `a.izin`\'den sonraki 60 sn\'de başka yok; Kapanış\'ta %d (`k.hareket`)' % kab),
        ('7 Son 60 sn', 'evet', 'yeni imge, tutma, zor blok yok; çekirdeğin son klibi anahtar cümle'),
        ('8 Şafak 45 sn', 'evet', '`k.donus` bitişe %.0f sn kala başlar' % (p3['total'] - don['start'])),
        ('9 Zor blok yok', 'evet', 'Ders 5\'te zor blok yok'),
        ('10 Alt küme', 'evet' if all(not any('alt küme' in f for f in res[n][0][5][1]) for n in res) else 'HAYIR',
         '3 ⊆ 5 denetimi üç köşede; bilgi: ' + ' | '.join('%s: %s' % (n, '; '.join(res[n][1])) for n in res)),
        ('11 Müzik: iki doku geçişi, aynı tema', 'evet', 'geniş ton → daralan ton (`c1.yer`) → genişleyen ton (`k.donus`)'),
        ('12 Kartta 3 dk\'ya özgü etki cümlesi yok', 'evet', '`evidenceByVersion["3"]`'),
        ('A.1 çekirdeği: iki kısa sessiz odak aralığı (≤ 18 sn) ve anahtar cümle', 'evet',
         '`c1.aralik1` sonrası %.1f sn, `c1.anahtar1` sonrası %.1f sn' % (g3['c1.aralik1'], g3['c1.anahtar1'])),
    ]
    P('| Kural | Durum | Kanıt (hoc 3 dk planı) |')
    P('|---|---|---|')
    for r in rows:
        P('| %s | %s | %s |' % r)
    P('')
    a_min = sum(e['speech'] + e['gd']['min'] + sum(g['min'] for g in e['sgd']) for e in p3['events'] if e['block'] == 'A')
    k_sp = sum(e['speech'] for e in p3['events'] if e['block'] == 'K')
    P('İskelet: giriş %.1f sn · Varış %s · çekirdek %s · Kapanış %s (hedef 0:04 / 0:30 / 1:38 / 0:48). Varış ve '
      'Kapanış hedefi birkaç saniye aşar: Varış\'ın üç birimi (duruş ve gözler, ortak çıkış cümlesi, derse özgü açılış) '
      'en kısa sessizliklerle %.1f sn tutar; Kapanış\'ın beş zorunlu adımının konuşması %.1f sn\'dir ve sessizlikleri '
      'sıkıştırılmaz.' % (p3['events'][0]['start'], fmt(bd3['A']), fmt(bd3['C1']), fmt(bd3['K']), a_min, k_sp))
    P('')
    P('### 5.2 Usta hoca ölçütleri (PLAN.v2 §E.6, 18 madde; model ilk işareti)')
    P('')
    e6 = [
        ('1 Zaman verir', 'evet', 'her yönergeden sonra eylem süresi + ≥ 2 sn; çekirdek blok her sürümde ≥ 0:55 (denetim)'),
        ('2 Sessizliği kullanır', 'evet', 'her blokta ≥ 5 sn; 3 dk\'da en uzun ≥ 12 sn, 5 dk\'da ≥ 16 sn (denetim)'),
        ('3 Sessizliği korur', 'evet', 'pencereler duyurulu, kapılı ve çanla karşılanıyor; pencere dışında ≤ 20 sn'),
        ('4 Somut beden dili', 'evet', 'burun, göğüs, karın, serin ve ılık hava, yükselip inme, omuz, çene, avuç, '
         'alın, elmacık kemiği, sıcaklık; "enerji" yok'),
        ('5 Tutarlı yön', 'uygulanmaz', 'beden dolaşımı yok'),
        ('6 Dolgu yok', 'evet', 'dolgu denetimi her planda geçti ("şimdi" yalnız açılışta ve `c3.w30`\'da)'),
        ('7 Anlatmaz, yaşatır', 'evet', 'blok başına tek açıklama (`c1.kayma`, `c2.giris`, `c3.ad`)'),
        ('8 Tek imge yayı', 'evet', 'el feneri ışığı (§1.4)'),
        ('9 Davet dili', 'evet (bir not)', 'emir kipi yalnız güvenlikte ("bırak"); beden yönergelerinde şimdiki zaman, '
         '"-mek yeterli", "sana kalmış" ve istek kipi ("insin", "değmesin", "yaslansın"); karar Türkçe editör yedeğinin'),
        ('10 Başarısızlığı normalleştirir', 'evet', '`c1.kayma`, `a.normal`, `c1.kac`, `c2.bas`, `c2.onbir`, `c2.dusunce`, '
         '`c3.d45`'),
        ('11 Çıkış kapısı', 'evet', 'açılış cümlesi her sürümde; iki pencere duyurusunda kapı; 30 dk\'da ortada `BR.orta` '
         '(iskelet); zor blok yok'),
        ('12 Kapanış ritüeli', 'evet', 'oturarak gündüz: nefes → parmaklar → gerinme → [avuçlama] → gözler → oda'),
        ('13 Azalan anlatım', 'evet', 'boşluklar uzuyor (eylem payı → nefes payı → 30 ve 45 sn pencere), cümleler kısalıyor '
         '(H12 geçti), seviye evreyle alçalıyor; Kapanış\'ta geri çıkış'),
        ('14 Doğal hız', 'açık', 'ses yok; üretimde ölçülür'),
        ('15 Ses–müzik', 'açık', 'ses yok; karışımda ölçülür (SPEC v3.4); çan ≥ 6 dB konuşmanın altında (VARSAYIM)'),
        ('16 Kusursuz Türkçe', 'açık', 'iki bağımsız model incelemesi işlendi (INCELEME.md); sahibin kulağı ve '
         'Scribe geri çevirisi bekliyor'),
        ('17 Benzersizlik', 'evet', '§1.5'),
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
        ('2 Gözler açık seçeneği', 'evet', 'Varış\'ta her sürümde (`a.durus` kısa biçimi ya da `a.gozler`), `a.izin`; '
         'uzun sessizlikten önce `c3.w30`\'da yeniden'),
        ('3 "İstediğin an…"', 'evet', 'açılışta; 30 dk\'da ortada (iskelet `BR.orta`)'),
        ('4 Kontrol kişide', 'evet', '`a.karar` ("Işığı ne kadar sıkı tutacağına sen karar veriyorsun."); yasak ifade yok'),
        ('5 Gevşeme zorunlu değil; huzursuzluk normal', 'evet', 'dersin özü: dağılmak olağan (`c1.kayma` her sürümde)'),
        ('6 Önce doğal nefes', 'evet', '`c1.izle` her sürümde; nefes hiç değiştirilmez; "derin nefes al" yok'),
        ('7 Tutma', 'evet', 'hiç yok'),
        ('8 Dayanak ve kapı', 'evet', 'zor bölüm yok; pencerelerde kapı: gözleri açmak (`c3.w30`), elleri hissetmek '
         '(`c3.w45`)'),
        ('9 Beden taraması', 'uygulanmaz', 'yok; nokta seçimi (burun, göğüs, karın) kişiye bırakılır'),
        ('10 İmge seçimli', 'evet', 'imgede su, derinlik, kapalı alan, yükseklik ya da karanlık yok; seçim gerekmez'),
        ('11 Anı arama yok', 'evet', ''),
        ('12 Öz-şefkat', 'uygulanmaz', ''),
        ('13 Sağlık iddiası yok', 'evet', 'lint (PLAN.v2 §C.6 + E12); kart "Bu ders bir sonuç vaadi taşımaz."'),
        ('14 Gündüz dersi dönüşle biter', 'evet', 'oturarak: yana dönme ve kalkma yok'),
        ('15 Uyku izni', 'uygulanmaz', ''),
        ('16 Sessizlik rehberli', 'evet', 'her pencerede süre ve dönüş söylenir ("Çanla yine seslenirim."); kısa '
         'aralıklarda "Önce kısa bir sessizlik geliyor.", "Sayıyı bir süre sen sürdürüyorsun."'),
        ('17 Hareket hafif', 'evet', '`k.hareket`: "ağrı ya da baş dönmesi olursa bırak"; avuçlama bastırmadan'),
        ('18 Tıbbi uyarı kartta', 'evet', 'açılış ekranında "Gözlerin yorulursa kapatman ya da kırpman yeterli."; derste '
         'durum adı yok'),
    ]
    P('| Kural | Durum | Not |')
    P('|---|---|---|')
    for r in g11:
        P('| %s | %s | %s |' % r)
    P('')
    P('### 5.4 "-(y)abil-" ve yasak sözcükler')
    P('')
    P('"-(y)abil-" taşıyan birimler: %s. Herhangi bir 60 sn\'de en çok 3 ve art arda en çok 3 "-abilir" cümlesi her '
      'planda denetlendi; 3 dk\'da `a.izin`\'den sonraki 60 sn\'de başka yok, Kapanış\'ta bir (`k.hareket`). Yasak sözcük '
      've iddia listesi (PLAN.v2 §C.6 + pilot E12), İngilizce, Sanskritçe (≤ 15 dk\'da hiç yok; "drişti" 30 dk\'da bir '
      'kez), cümle başına ≤ 14 sözcük, birim başına 1–3 cümle, iki nokta üst üste (yok), üç nokta (yok): `timing.txt` '
      '"Metin denetimi" GEÇTİ.' % ', '.join('`%s`' % x for x in abil_units))
    P('')

    # ------------------------------------------------------------------ 6. üretim notları
    P('## 6. Üretim notları (seslendirme ve müzik; bu adımda yapılmadı)')
    P('')
    P('- Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`), `eleven_v4`, birim başına 3 çekim, Scribe birebir (SPEC.v3 §2–§6).')
    P('- İstekler: %d birim + %d ayrı metinli kısa biçim = **%d istek, %d karakter**. SPEC.v3 §15.2 fiyatıyla (%s kredi / '
      'karakter / çekim, 3 çekim) ≈ **%s kredi** (tahmin; yeniden çekimler ve Scribe hariç). Aynı metinli kısa '
      'biçimler (yalnız sessizlik değişir, ayrı ses gerekmez): %s. Ortak yardımcılar (Durdur dönüşü, ilk ders girişi; '
      'her derste aynı, bir kez üretilir): %d istek, %d karakter.' % (
          len(sent), len(shorts), units_lesson, ch_lesson, num(KREDI_KARAKTER), '{:,.0f}'.format(kredi).replace(',', '.'),
          ', '.join('`%s`' % c['id'] for c in shorts_same), len(ex_stop) + len(ex_intro), ch_shared))
    P('- Çok cümleli birimler (%d; cümle sonlarından kesilir, iki nokta yok): %s. En uzun üç cümleli birimler pencere '
      'duyurularıdır (`c3.w30`, `c3.w45`); kesimde "en uzun N−1 duraklama" kuralı cümle sonlarına düşmelidir (SPEC.v3 §4).'
      % (len(multi), ', '.join('`%s`' % c['id'] for c in multi)))
    P('- Scribe\'da dikkat: "hâlâ" (düzeltme işaretli) ve "ona kadar" (sayı) yazımı; "On bire, on ikiye" sayıları '
      'sözcükle yazıldı (PLAN.v2 §C.7).')
    P('- **Müzik (A = ElevenLabs Music) istem önerisi**, SPEC.v3 §7.1 kalıbıyla (zorunlu son cümle eklenir): '
      '`varis` "Ambient meditation tone in G: a single soft, sustained, almost sine-like tone with one quiet upper '
      'partial, no melody, no chord changes, barely moving." · `derin` "The same single sustained sine-like tone in G, '
      'thinner and quieter, one partial only, no movement." · `kapanis` "The same sustained tone in G slowly opening '
      'into a warm, soft, long-held G major chord." Ton ölçülür (ElevenLabs istenen tonu tutmuyor; SPEC.v3 §7.1); '
      'aile kuralı aynen. Saf ton ElevenLabs\'te temiz çıkmazsa ton yerel sentezle üretilir (açık karar, §7).')
    P('- **Çan:** tek vuruşlu, yumuşak saldırılı (≥ 30 ms), uyumsuz kısmi sesli kısa çan; pilotta dönüş tınısı yerel '
      'sentezdi (ElevenLabs tınısı "kaba" ölçüldü; SPEC.v3 §7.1). Öneri: aynı yol, Sol ailesinde (VARSAYIM). Çan '
      '`returnTone:-2s` ipucu taşıyan her klipten 2 sn önce ve `k.donus`\'tan 2 sn önce çalar.')
    P('- **Pencere müziği:** pilotun karıştırıcısı pencerede yatağı +6 dB kabartır; Ders 5\'te −6 dB çekilir '
      '(`music.windowBedAboveDuckDb = −6`, rampa 1 dB/sn). `mix.py`\'de pencere yönü parametresi gerekir (açık iş).')
    P('- Kulak denetimi listesi (insan kulağı; Scribe yakalayamaz):')
    for x in L['panelChecks']:
        P('  - %s' % x)
    P('')

    # ------------------------------------------------------------------ 7. zayıf yerler
    P('## 7. VARSAYIM\'lar, açık noktalar ve kendi gördüğüm zayıf yerler')
    P('')
    s3 = res['hoc'][2][3]
    ph3, ph15 = plan('hoc', 3), plan('hoc', 15)
    b3 = T.block_durations(ph3)
    b3['A'] += ph3['events'][0]['start']
    b15 = T.block_durations(ph15)
    b15['A'] += ph15['events'][0]['start']
    pay15 = 900 - ph15['speech'] - ph15['gaps']['pref']
    shake = []
    name0, rate0, prof0, sc0 = D.corners(L)[0]
    for scx in (0.90, 0.95, 1.05, 1.10):
        rp, _, _ = D.run_corner(L, name0, rate0, prof0, sc0 * scx)
        bad = [m for m in D.MINUTES if rp[m][1]]
        shake.append('× %s: %s' % (num(scx), 'hepsi geçiyor' if not bad else 'kalan ' + ', '.join(
            '%d dk (%s)' % (m, rp[m][1][0].split(':')[0]) for m in bad)))
    avuc = sum(ev['dur'] + ev['gap'] for ev in ph15['events'] if ev['clip']['id'].startswith('k.avuc'))
    d3 = T.density(ph3)
    weak = [
        '**Ses yok, süreler tahmin.** Nefona Hoca köşesi önizleme hızına (4,68) dayanır; Ders 1\'deki denetimde aynı model '
        'Ders 2\'nin ölçülmüş hoc kliplerinden yüksek duraklamayla %3,6, düşük duraklamayla %1 uzun çıktı. Ders 5 ölçülünce '
        'bütün planlar yeniden kurulur.',
        '**3 dk\'nın boş payı hoc köşesinde %.1f sn** (taban 10 sn, VARSAYIM). Sarsıntı taraması (bütün klip süreleri '
        '× ölçek, hoc köşesi, 3–15 dk): %s. 3 dk\'nın açılışı en yoğun yerdir (en yoğun 60 sn: %.0f hece, %%%.0f konuşma; tavan 150 '
        've %%60); süreler %%5 uzadığında da tavanın altında kalsın diye `c1.nokta` 3 dk\'dan çıkarıldı ve `c1.kayma` kısa biçimle söylenir; '
        'imge adımını açılış cümlesi ve `c1.izle` ("o noktadaki") taşır.' % (s3, '; '.join(shake), d3['syll'], 100 * d3['frac']),
        '**3 dk iskeletten birkaç saniye sapıyor:** Varış %s (hedef 0:34, giriş dahil), çekirdek %s (1:38), Kapanış %s '
        '(0:48). Toplam tam 3:00 ve bütün kurallar tutuyor; çekirdeğin payını artırmak Varış\'ın açılış yoğunluğunu '
        '(60 sn\'de ≤ %%60 konuşma) sınıra dayıyordu.' % (fmt(b3['A']), fmt(b3['C1']), fmt(b3['K'])),
        '**15 dk dağılımı çapadan sapıyor (hoc):** Varış %s ve Kapanış %s çapadan (1:15, 1:45) uzun, C2 %s çapadan '
        '(4:00) kısa; C1 %s, C3 %s. Neden: isteğe bağlı avuçlama Kapanış\'a %.0f sn ekliyor. Avuçlama yalnız 30 dk\'ya '
        'bırakılırsa ilk yayında hiç duyulmaz; bu yüzden 15 dk\'ya kondu (dolum sırası 420, C3\'ten sonra). Karar usta '
        'hoca yedeğinin.' % (fmt(b15['A']), fmt(b15['K']), fmt(b15['C2']), fmt(b15['C1']), fmt(b15['C3']), avuc),
        '**15 dk\'da ikinci aşamaya pay dar:** hoc köşesinde hedef ile pref sessizliklerle toplam arası %.1f sn. ' % pay15 +
        'İkinci aşamanın ilk artımı (sıra ≥ 500) bundan büyük ve esneme kuralını (T5) da aşacak kadar uzun olmalı '
        '(öneri: BR.orta + C4 tabanı, ≈ 1,5 dk); aksi halde 15 dk dosyası değişir (`iskelet30.md` §2).',
        '**Pencerede müziğin çekilmesi** pilot karıştırıcısında yok (pilot +6 dB kabartıyordu). Kör dinlemede "ses kesildi" '
        'diye algılanma riski var (D5-02); duyuru "Çanla yine seslenirim." bunu karşılamak için.',
        '**Çan üretimi açık:** ElevenLabs Music tek vuruşu yerleştiremez; pilotun dönüş tınısı gibi yerel sentez önerildi. '
        'Sahibin "müzik A = ElevenLabs Music" kararının çanı ve sürekli tonu kapsayıp kapsamadığı orkestratöre sorulmalı.',
        '**Metafor ışığı** ("Işığın hâlâ noktada mı?") gözleri açık dinleyende gerçek ışıkla karışabilir (D5-03). Açılış '
        'imgeyi "dikkatin bir el feneri gibi" diye kurduğu için risk düşük; kulakta sınanmalı.',
        '**Anahtar cümlenin 3. biçimi değişti** ("Döndün…" → "Yine döndün."; §1.3). PLAN.v2 §A.2.1\'den sapma; Türkçe editör '
        'yedeğinin onayına gider.',
        '**"Ona kadar"** (c2.nasil) yazımda zamirle aynıdır ("ona"); "bir, iki, üç, dört diye" bağlamı anlamı açıyor, TTS '
        'vurgusu ve Scribe denetimi izlenmeli (D5-04). c2.bas\'taki bağlamsız "Ona varınca" düzeltme turunda "On olunca" oldu.',
        '**Sessiz sayma (C2)** dinleyiciye bırakılıyor; 16–20 sn\'lik nefes paylarında sayıyı sürdürmek kişiden kişiye '
        'değişir (D5-07). Sesli sayım bilinçli olarak yok (§1.2); pilot dinlemede eksik bulunursa ikinci aşamada ilk turu '
        'sesle eşlik eden bir seçenek düşünülebilir.',
        '**Emir ve istek kipi:** "bırak" (güvenlik), "insin" (bedensel yönerge) davet dilinin sınırında (E.6 #9); iki model '
        'incelemesi bunları işaretlemedi. Avuçlama kuralı düzeltme turunda eylemden önce ve gelecek zamanla söyleniyor '
        '("değmeyecek; … yaslanacak").',
        '**`a.gozler`** Ders 1 ve 2\'nin göz cümlesiyle aynı kalıpta; ortak ritüel sayıldı, benzersizlik ölçütüne girmez.',
        '**"dön" yankısı:** anahtar cümlelerin son geçişinden ("…geri döndün.", "Yine döndün.") hemen sonra ortak kapanış '
        'cümlesi "Artık dönüş zamanı." gelir. Anlamca tutarlı (dönüş dersin fikri), ama kulakta tekrar gibi duyulursa '
        '`k.donus` yerine bu derse özgü bir dönüş cümlesi yazılır (Türkçe editör yedeğinin kararı).',
        '**İnceleme:** PLAN.v3 §E.1\'in karar 2 yedeği (iki bağımsız model incelemesi: Türkçe editör ve usta hoca mercekleri) '
        'okudu, bulgular işlendi (`b/INCELEME.md`). İnsan onayı değildir; sahibin kulağı bekleniyor.',
    ]
    for i, w in enumerate(weak, 1):
        P('%d. %s' % (i, w))
    P('')

    # ------------------------------------------------------------------ 8. kaynaklar
    P('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI\'ler https://doi.org/ önekiyle açılır)')
    P('')
    for r in L['sourcesCard']['rows']:
        P('- %s — PMID %s, DOI [%s](https://doi.org/%s) (%s)' % (r['detail'], r['pmid'], r['doi'], r['doi'], r['file']))
    P('')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('yazıldı', OUT, len(lines), 'satır')


if __name__ == '__main__':
    main()
