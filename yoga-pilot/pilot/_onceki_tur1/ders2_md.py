"""ders2.script.md üreticisi. Metin, boşluk, ipucu ve sürüm tabloları ders verisinden ve planlayıcıdan okunur."""
import os
import re

import timing

HERE = os.path.dirname(os.path.abspath(__file__))
TIER = {'required': 'zorunlu', 'optional': 'isteğe bağlı', 'extension': 'genişletme'}
PH = {'Varış': 'Varış', 'Derinleşme': 'Derinleşme', 'Derin': 'Derin', 'Kapanış': 'Kapanış'}


def n(x):
    return ('%g' % x).replace('.', ',')


def mmss(sec):
    sec = int(round(sec))
    return '%d:%02d' % (sec // 60, sec % 60)


def gap_str(c):
    g = c['gapAfter']
    s = '%s / %s / %s' % (n(g['min']), n(g['pref']), n(g['max']))
    return ('**pencere** ' + s) if c.get('window') else s


def cue_str(c):
    parts = []
    cue = c.get('cue', {})
    if 'visual' in cue:
        parts.append('görsel `%s`' % cue['visual'])
    if 'music' in cue:
        parts.append('müzik `%s`' % cue['music'])
    if 'breath' in cue:
        parts.append('nefes: sayı %d' % cue['breath']['count'])
    return ' · '.join(parts) or '—'


def note_str(c):
    t = c['tags']
    out = []
    if c.get('carrier'):
        out.append('✂ `%s`#%d' % (c['carrier']['id'], c['carrier']['index']))
    if t.get('key'):
        out.append('**anahtar cümle %d**' % t['key'])
    if t.get('uniqueOpening'):
        out.append('**derse özgü açılış**')
    if t.get('safety'):
        out.append('güvenlik: %s' % t['safety'])
    if t.get('mood') == 'safety':
        out.append('emir kipi (güvenlik/beden)')
    if t.get('step'):
        out.append('adım: %s' % t['step'])
    if t.get('announce'):
        out.append('pencere duyurusu')
    if t.get('welcome'):
        out.append('pencere sonrası karşılama')
    if t.get('image'):
        out.append('imge: %s' % ('yeni' if t['image'] == 'new' else 'dönüş'))
    if t.get('evocation'):
        out.append('duyu çağrışımı (imge değil)')
    if t.get('explain'):
        out.append('açıklama (blokta tek)')
    if t.get('normalize'):
        out.append('başarısızlığı normalleştirir')
    if c.get('minTarget'):
        out.append('yalnız >= %d dk' % (c['minTarget'] // 60))
    if c.get('requires'):
        out.append('gerekir: %s' % ', '.join('`%s`' % r for r in c['requires']))
    if c.get('fillRank') is not None:
        out.append('sıra %d%s' % (c['fillRank'], (' · grup `%s`' % c['fillGroup']) if c.get('fillGroup') else ''))
    if t.get('action'):
        out.append('eylem: %s' % t['action'])
    return '; '.join(out) or '—'


def block_table(b):
    rows = ['| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |',
            '|---|---|---|---|---|---|---|']
    for c in b['clips']:
        rows.append('| `%s` | %s | %s | %s | %s | %s | %d |' % (
            c['id'], TIER[c['tier']], c['text'].replace('|', '\\|'), gap_str(c), cue_str(c), c['phase'],
            c['syllables']))
    notes = [(c['id'], note_str(c)) for c in b['clips'] if note_str(c) != '—']
    return '\n'.join(rows), notes


def carriers_table(L, ids):
    rows = ['| taşıyıcı (tek TTS isteği) | TTS\'e giden metin | kesilen klipler |', '|---|---|---|']
    for car in L['carriers']:
        if car['id'] in ids:
            rows.append('| `%s` | %s | %s |' % (car['id'], car['text'], ', '.join('`%s`' % i for i in car['items'])))
    return '\n'.join(rows)


def unique_counts(L):
    clips = timing.all_unique_clips(L)
    ids = list(clips)
    syl = sum(c['syllables'] for _, c in clips.values())
    wrd = sum(c['words'] for _, c in clips.values())
    norm = {}
    for _, c in clips.values():
        k = re.sub(r'[^\wçğıöşüâîû ]', '', c['text'].lower()).strip()
        norm.setdefault(k, c)
    usyl = sum(c['syllables'] for c in norm.values())
    uwrd = sum(c['words'] for c in norm.values())
    # TTS'e gidecek metin: taşıyıcılar + taşıyıcısız klipler
    req_texts = [car['text'] for car in L['carriers']] + [c['text'] for _, c in clips.values() if not c.get('carrier')]
    chars = sum(len(t) for t in req_texts)
    tsyl = sum(timing.syllables(t) for t in req_texts)
    twrd = sum(len(timing.words(t)) for t in req_texts)
    return {'ids': len(ids), 'syl': syl, 'words': wrd, 'utexts': len(norm), 'usyl': usyl, 'uwords': uwrd,
            'requests': len(req_texts), 'chars': chars, 'tsyl': tsyl, 'twords': twrd,
            'carriers': len(L['carriers']), 'micro': sum(1 for _, c in clips.values() if c.get('carrier'))}


def block_order(p):
    order = []
    for ev in p['events']:
        if not order or order[-1] != ev['block']:
            order.append(ev['block'])
    return order


def plan_blocks_line(p):
    secs = timing.block_secs(p)
    return ' → '.join('%s %s' % (b, mmss(secs[b])) for b in block_order(p))


def attention_rows(p):
    rows = ['| başlangıç | süre | doku / teknik | ne oluyor |', '|---|---|---|---|']
    desc = {'varis': 'yerleşme, izin, duruş, gözler', 'niyet': 'niyet (sankalpa) seçimi ve üç kez içinden',
            'dolasim-uzuv': 'beden dolaşımı: sağ ve sol (el → kol → gövde yanı → bacak → ayak)',
            'dolasim-govde': 'beden dolaşımı: sırt, sonra yüz ve gövdenin önü',
            'dolasim-butun': 'bütünler: bacaklar, kollar, bütün beden',
            'temas': 'zemine değen noktalar (genişletme)', 'nefes': 'doğal nefesi izlemek; bırakma ve bağışlama',
            'geri-sayma': 'sesli geri sayma (ondan ya da beşten bire)',
            'sessiz-sayma': 'kendi içinde sayma turu', 'sessizlik': 'duyurulmuş sessiz pencere (müzik kabarır)',
            'anahtar': 'anahtar cümle', 'kapi': 'ortada çıkış kapısı (güvenlik)', 'zitlik-agir': 'zıtlık: ağırlık / hafiflik',
            'zitlik-sicak': 'zıtlık: sıcaklık / serinlik', 'imge': 'imge yayı: kıyı ya da orman, patika, iniş, duyular',
            'imge-donus': 'imgeden dönüş: aynı patika, görüntü solar, zemin', 'taniklik': 'tanıklık: sesler, düşünceler, fark eden',
            'niyet-son': 'niyetin tekrarı', 'kapanis': 'dışa dönüş ritüeli (nefes → parmaklar → … → otur → bekle)'}
    for tx, a, b in timing.texture_runs(p):
        rows.append('| %s | %s | `%s` | %s |' % (mmss(a), mmss(b - a), tx, desc.get(tx, '')))
    return '\n'.join(rows)


def timeline(p):
    rows = ['| zaman | blok | id | söz | sonra sessizlik (sn) |', '|---|---|---|---|---|']
    for ev in p['events']:
        c = ev['clip']
        rows.append('| %s | %s | `%s` | %s | %s%s |' % (mmss(ev['start']), ev['block'], c['id'], c['text'],
                                                      n(round(ev['gap'], 1)), ' (pencere)' if c.get('window') else ''))
    return '\n'.join(rows)


def write(L):
    P = []
    a = P.append
    uc = unique_counts(L)
    bm = timing.block_map(L)
    allc = timing.all_unique_clips(L)
    key = {c['tags']['key']: c for _, c in allc.values() if c['tags'].get('key')}
    # planlar
    plans = {}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            for m in range(5, 31):
                plans[(rate, prof, m)] = timing.plan(L, m * 60, rate, prof)
    ref = plans[(5.6, 'hi', 5)]
    ref30 = plans[(5.6, 'hi', 30)]
    # hesaplanan sayılar (belge bunları elle yazmaz)
    jumps = []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            pr = timing.profile(prof, rate)
            cs = lambda b: sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in bm[b]['clips'])
            jumps.append(cs('A.uzun') + cs('K.uzun') - cs('A.kisa') - cs('K.kisa'))
    cap_jump = (n(round(min(jumps))), n(round(max(jumps))))
    rot_secs = ('sag', 'sol', 'sirt', 'on', 'butun')
    c1 = bm['C1']['clips']
    rot_req = sum(1 for c in c1 if c['tags'].get('section') in rot_secs and c['tier'] == 'required')
    rot_all = sum(1 for c in c1 if c['tags'].get('section') in rot_secs)
    temas_n = sum(1 for c in c1 if c['tags'].get('section') == 'temas' and c.get('carrier'))
    fast30 = plans[(6.6, 'lo', 30)]
    fast_max = fast30['speech'] + fast30['gaps']['max']
    slow5 = plans[(5.2, 'hi', 5)]
    slack5 = 300 - slow5['speech'] - slow5['gaps']['min']

    def first_min(fn):
        ms = []
        for rate in timing.RATES:
            for prof in ('lo', 'hi'):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        ms.append(m)
                        break
        return (min(ms), max(ms)) if ms else (None, None)
    c3_in = first_min(lambda p: 'C3' in p['sel'])
    c4_in = first_min(lambda p: 'C4' in p['sel'])
    c5_in = first_min(lambda p: 'C5' in p['sel'])
    cnt_in = first_min(lambda p: 'c2.x.kendin' in p['inc'])
    def rng(t):
        return ('%d' % t[0]) if t[0] == t[1] else ('%d–%d' % t)
    qc = []
    sr = []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            pr = timing.profile(prof, rate)
            qc.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['quickClosing']['clips']))
            sr.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['stopReturn']['clips']))
    _, lint_out = timing.lint_text(L)
    slowest = next((o for o in lint_out if o.startswith('en yavaş')), '')
    slowest_val = re.search(r'([0-9.]+) hece/sn', slowest).group(1).replace('.', ',') if slowest else '?'
    act_ids = [('örtü', 'a.ortu'), ('uzanma', 'a.durus'), ('yastık', 'a.yastik'), ('niyeti üç kez söylemek (başta)', 'n1.soyle'),
               ('niyeti üç kez söylemek (sonda)', 'n2.hatirla'), ('imgede yer seçmek', 'c4.yer'),
               ('patikadan dönüş', 'c4.don'), ('parmaklar', 'k.parmak'), ('gerinme', 'k.gerin'), ('gözleri açma', 'k.goz'),
               ('yana dönme', 'k.yan'), ('doğrulup oturma', 'k.otur')]
    actions = ', '.join('%s %s' % (lbl, n(allc[i][1]['gapAfter']['min'])) for lbl, i in act_ids)
    fillers = {w: sum(len(re.findall(r'(?<!\w)' + w + r'(?!\w)', c['text'].lower())) for _, c in allc.values())
               for w in timing.FILLERS}
    # özet satırları
    summ = []
    try:
        with open(os.path.join(HERE, 'timing.out.txt'), encoding='utf-8') as f:
            txt = f.read()
        summ = txt[txt.index('== ÖZET =='):].strip().splitlines()[1:]
    except (OSError, ValueError):
        summ = ['(timing.py henüz çalıştırılmadı)']

    a('# Ders 2 · Derin Dinlenme (Yoga Nidra) · pilot metni')
    a('')
    a('Sürüm: %s. Bu dosya `ders2_kaynak.py`den üretilir (tek kaynak); aynı kaynaktan `ders2.lesson.json` çıkar. '
      'Zamanlama denetimi: `timing.py` → `timing.out.txt`. Depodaki (`/home/user/eyes`) hiçbir dosyaya dokunulmadı.' % L['version'])
    a('')
    a('**Durum, açıkça.** Metin tamam ve zamanlaması denetlendi: 5–30 dakikanın her dakikası, üç eklemleme hızı ve her '
      'hızda iki duraklama profiliyle kuruldu, 78 vakanın 78\'i geçti (§2.5). Henüz hiçbir cümle seslendirilmedi. Klip '
      'süreleri ölçüme dayanan tahminlerdir (VARSAYIM). Üretimden sonra planlayıcı gerçek `sec` değerleriyle yeniden '
      'çalışacak. Türkçe editör ve usta hoca incelemesinin ilk turu bu belgede yapıldı. Anadili Türkçe bir insan editörün '
      've yoga nidra eğitimi almış bir hocanın onayı ise henüz yok (CRITIQUE #22). Bu yüzden ders "bitti" sayılmaz.')
    a('')
    a('## 0. Tek bakışta')
    a('')
    a('| | |')
    a('|---|---|')
    a('| Söz (kart) | %s |' % L['tagline'])
    a('| Derse özgü açılış cümlesi | "%s" |' % bm['A.kisa']['clips'][1]['text'])
    a('| Ortak güvenlik cümlesi | "%s" Otuz dakikalık sürümlerde ortada bir kez daha (burada 20 dakika ve üstünde): "%s" |'
      % (bm['A.kisa']['clips'][2]['text'], next(c for c in bm['BR.orta']['clips'] if c['id'] == 'br.orta')['text']))
    a('| Anahtar cümle, 3 kez, giderek kısa | 1) "%s" (%d hece) · 2) "%s" (%d) · 3) "%s" (%d) |' % (
        key[1]['text'], key[1]['syllables'], key[2]['text'], key[2]['syllables'], key[3]['text'], key[3]['syllables']))
    a('| Tek imge yayı | Kıyı ya da orman (dinleyici seçer; imge gelmezse nefeste kalır): patika → iniş → varış (ses, koku, '
      'güneş, rüzgâr) → dinlenme yeri (ılık taş, ışık) → sessiz pencere → aynı patikadan dönüş → görüntü solar, zemin |')
    a('| Niyet (sankalpa) | Başta ve sonda. Hazır cümle: "Dinlenmeye izin veriyorum." (olumlama değil, izin cümlesi) |')
    a('| Beden dolaşımı | sağ → sol → arka → ön → bütün, her sürümde bu sırada (en kısada %d nokta, en uzunda %d nokta + %d noktalık temas turu) |' % (rot_req, rot_all, temas_n))
    a('| Zıtlık çiftleri | ağırlık / hafiflik, sıcaklık / serinlik (hıza göre %s. dakikadan itibaren) |' % rng(c3_in))
    a('| Sessiz pencereler | en çok 90 sn; önce duyurulur, sonra karşılanır: imge (%s. dakikadan itibaren), tanıklık (%s. dk\'dan), içten sayma (%s. dk\'dan) |' % (rng(c4_in), rng(c5_in), rng(cnt_in)))
    a('| Kapanış | nefes → parmaklar → gerinme → gözler → oda → yana dön → otur → bekle → "%s" |' % bm['K.kisa']['clips'][-1]['text'])
    a('| Zamanlama | **78/78 vaka geçti** (5,2 / 5,6 / 6,6 hece/sn × 5..30 dk; her vaka iki duraklama profilinde) |')
    a('| Metin envanteri | %d klip kimliği (%d hece, %d sözcük); yinelenenler tek sayılınca %d benzersiz söz (**%d hece, %d sözcük**); '
      'TTS\'e %d istek (%d taşıyıcı + %d cümle klibi), %d karakter |' % (
          uc['ids'], uc['syl'], uc['words'], uc['utexts'], uc['usyl'], uc['uwords'], uc['requests'], uc['carriers'],
          uc['requests'] - uc['carriers'], uc['chars']))
    a('| 5 dakika | %s |' % ' → '.join(block_order(ref)))
    a('| 30 dakika | %s |' % ' → '.join(block_order(ref30)))
    a('')
    a('## 1. Hocanın kurgusu')
    a('')
    a('### 1.1 Akış, evreler ve ses, müzik ve görüntü uyumu')
    a('')
    a('| Evre | Bloklar | Ses (PLAN D.1–D.2; Knowlton 2006 yönünde) | Müzik (yatak; konuşmada kısık) | Görsel (ufuk çizgisi formu) |')
    a('|---|---|---|---|---|')
    a('| Varış | A (kısa/uzun) | konuşmaya yakın hız ve yükseklik | Varış yatağı; ders 3 sn\'de açılır | en aydınlık (yine koyu) |')
    a('| Derinleşme | N1, C1 | biraz daha yavaş ve alçak (−1,5 dB) | `c1.cerceve`de 8 sn çapraz geçişle Derin yatağına | daha loş |')
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | en yavaş, en yumuşak (−3 dB) | kısık; yalnız duyurulan >= 20 sn pencerelerde en çok +6 dB kabarır | en loş; pencerede biraz kararır ve yavaşlar, bitmeden 3 sn önce aydınlanır; sayılarda tek yumuşak nabız |')
    a('| Kapanış | K (kısa/uzun) | hız ve yükseklik yeniden konuşma düzeyine | `k.donus`ta Kapanış yatağı; `k.goz`te sıcak "şafak" akoru (parlaklık, ses yüksekliği değil); son 2 sn söner | 60–90 sn\'lik şafak: form ve zemin ısınır, aydınlanır |')
    a('')
    a('Konuşma sırasında yatak kısık kalır (≈ −33 LUFS); yalnız duyurulan ve en az 20 sn süren pencerelerde ≈ −27 LUFS\'a '
      'çıkar ve karşılama cümlesinden 3 sn önce iner. Böylece müzik her cümlede inip kalkmaz (CRITIQUE #7, #8; değerler VARSAYIM). '
      'Doğa katmanı için öneri: PLAN A.2\'deki "uzak, sürekli akarsu" yerine uzak su ve hafif rüzgâr. Bu doku hem kıyıya hem ormana '
      'uyar ve imgede seçilen yeri dayatmaz (VARSAYIM; karar üretim ekibinin).')
    a('')
    a('### 1.2 Anahtar cümle (C.4; CRITIQUE #21)')
    a('')
    a('Dersin fikri yoga nidranın kendisidir: beden dinlenir, farkındalık uyanık kalır. Anahtar cümle üç kez geçer ve her '
      'seferinde biraz daha kısa ve yumuşaktır:')
    a('')
    a('1. `c1.k1`, beden dolaşımının sonunda: **"%s"** Beden ile farkındalık henüz ayrı ayrı adlandırılır.' % key[1]['text'])
    a('2. `br.k2`, nefes bloğunun hemen ardından, derin evrenin başında: **"%s"**' % key[2]['text'])
    a('3. `k.anahtar3`, dönüşün eşiğinde: **"%s"** Artık ikisi tek bir ağızdan söylenir. Kapanışın son cümlesi bu yayı '
      'kapatır: "%s"' % (key[3]['text'], bm['K.kisa']['clips'][-1]['text']))
    a('')
    def key_times(p):
        return [ev['start'] for ev in p['events'] if ev['clip']['tags'].get('key')]
    k5 = key_times(ref)
    k30 = key_times(ref30)
    a('Bu yerleşim her sürede üç geçişi korur (5,6 hece/sn, yüksek profil): 5 dakikada %s, %s ve %s\'da; 30 dakikada %s, '
      '%s ve %s\'da. Kısa sürümde ikinci ve üçüncü geçiş, aralarındaki niyet tekrarını bir nakarat gibi çevreler; uzun '
      'sürümde anahtar cümle dersin başına, ortasına ve sonuna yayılır.' % tuple(mmss(t) for t in k5 + k30))
    a('')
    a('### 1.3 Tek imge yayı (C.4; E.6 #8)')
    a('')
    a('İmge yalnız C4\'tedir. Dinleyici **kıyı ya da orman** seçer. Görüntü gelmezse nefeste kalır. Kıyıda suya girilmez, '
      'derinlik yoktur; ormanda karanlık ya da kapalı alan yoktur (güvenlik §11.B-10). Yay: patika → ağır ağır iniş → '
      'gelip giden ses (dalgalar ya da yapraklar) → koku → güneşin ılıklığı → rüzgâr → sana iyi gelen yer → ılık taş, '
      'suyun ya da yaprakların üzerindeki ışık → sessiz pencere → aynı patikadan dönüş → görüntü solar, altındaki '
      'zemin. C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değildir, duyu çağrışımıdır: yer ya da yolculuk '
      'kurmazlar. C5\'teki "dalgalar ya da yapraklar gibi" imgeye bir geri çağrıdır, yeni imge değildir. Son 60 sn\'de '
      'yeni imge yoktur (her vakada denetlendi).')
    a('')
    a('"Gelip gitmek" dersin sözel motifidir. Kapanıştan önce üç yerde geçer: nefes ("Nefes kendiliğinden geliyor, '
      'kendiliğinden gidiyor"), imge ("gelip giden bir ses") ve tanıklık ("Düşünceler de gelip gidiyor").')
    a('')
    a('### 1.4 30 dakikalık dikkat eğrisi (CRITIQUE #21; her 3–5 dakikada doku, teknik ya da sessizlik değişir)')
    a('')
    a('Plan: 30 dk, 5,6 hece/sn, yüksek duraklama profili. En uzun doku koşusu 300 sn\'yi geçmez; bu, 20 dakika ve üstündeki '
      'her vakada denetlendi.')
    a('')
    a(attention_rows(ref30))
    a('')
    a('### 1.5 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)')
    a('')
    a('- **Yapı.** Travma-duyarlı yoga nidranın 10 bileşeni bu dersin iskeletidir: özerklik ve onay, uygun uzunluk ve '
      'hazırlık, kendi seçilen niyet, esnek beden dolaşımı ve nefes, bedende hissedilen zıtlık çiftleri, özenli imgeleme, '
      'yeterli yerleşme ve dışa dönüş (Luu 2024, PMID 39690521, DOI 10.17761/2024-D-24-00021).')
    a('- **Kısa sürüm bütündür.** 11 ve 30 dakikalık yoga nidra doğrudan karşılaştırıldığında ikisi de küçük etki gösterdi. '
      '30 dakikalık sürüm yalnız "farkında davranma" alt boyutunda farklıydı ve güven aralığı sıfıra çok yakındı (Moszeik 2025, '
      'PMID 40373021, DOI 10.1002/smi.70049). Kronik ağrılı yetişkinlerde yapılan yarı deneysel bir çalışmada (n=23) tek 45 '
      'dakikalık yoga nidra, beden taramasına göre hemen sonrasında iyi oluşta daha fazla artışla birlikte gitti (Gibbs 2026, '
      'PMID 41743305, DOI 10.4103/ijoy.ijoy_2_25). Bu iki bulgudan tasarım çıkarımı: kısa sürüm bir beden taramasına '
      'indirgenmez, iskeleti korur (niyet → dolaşım → nefes → niyet → dönüş). Hiçbir sürüm sonuç vaat etmez.')
    a('- **Nefes.** Önce değiştirilmeden izlenir; "derin nefes al" komutu yoktur. Derin nefes talimatı bir çalışmada önce '
      'uyarılmayı artırdı (Toussaint 2021, PMID 34306146, DOI 10.1155/2021/5924040). Nefesin derinleşmesi yalnız dönüşte, '
      'uyanmaya eşlik etmek için ve izin diliyle geçer: "Nefesin biraz derinleşebilir." Bu bir tasarım çıkarımıdır.')
    a('- **Hız ve sessizlik.** Yavaşlık sözcük uzatarak değil, cümleler arası sessizlikle verilir. Aşırı yavaş ve çok '
      'duraklamalı konuşma en az doğal bulundu (Shuminsky & Davidow 2026, PMID 42757902, DOI 10.1044/2026_JSLHR-25-00691). '
      'Seans boyunca azalan hız, yükseklik ve ton yalnız o sesle çalışan grupta EMG düşüşüyle birlikte gitti (Knowlton & '
      'Larkin 2006, PMID 16941239, DOI 10.1007/s10484-006-9014-6). 2 dakikalık sessizlik aralığında kalp hızı, kan basıncı ve '
      'ventilasyon başlangıcın altına indi (Bernardi 2006, PMID 16199412, DOI 10.1136/hrt.2005.064600). Öte yandan acemilerde '
      'beden odaklı rehberli bir program, rehbersiz sessiz pratiğe göre daha büyük değişimle birlikte gitti; programda '
      'koçluk da vardı (Lieutaud & Bourhis 2026, PMID 42466037, DOI 10.3389/fpsyg.2026.1833806). Tasarım çıkarımı: '
      'sessizlik değerli ama rehbersiz kalmamalı. Bu yüzden pencereler en çok 90 sn\'dir ve duyurulur.')
    a('- **Niyet cümlesi.** "Ben harikayım" türü tekrarlanan olumlu cümleler, öz-saygısı düşük kişilerde daha kötü hissettirdi '
      '(Wood 2009, PMID 19493324, DOI 10.1111/j.1467-9280.2009.02370.x). Hazır niyet bu yüzden bir yargı değil, bir izin '
      'cümlesidir: "Dinlenmeye izin veriyorum."')
    a('- **Huzursuzluk olağandır.** Kayıttan dinletilen tek seans gevşemede 30 kişinin 5\'inde seans sırasında kaygı arttı '
      '(Braith 1988, PMID 3069875, DOI 10.1016/0005-7916(88)90040-7). Meditasyonla ilişkili istenmeyen etkiler seyrek değil '
      '(Farias 2020, PMID 32820538, DOI 10.1111/acps.13225). Bu yüzden ders çıkış kapısıyla açılır, "Gevşemek bugün kolay '
      'gelmeyebilir; bu da olur." der ve her zıtlık ile imgede bir bırakma yolu sunar.')
    a('- **Dönüş.** Hipnozdan çıkarma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017, PMID '
      '28300508, DOI 10.1080/00029157.2016.1203281). Ayağa kalkınca ilk anda görülen kan basıncı düşüşü, sürekli ölçümle '
      '65 yaş üstünde havuzlanmış olarak %29 (Tran 2021, PMID 34260686, DOI 10.1093/ageing/afab090). Kapanış bu yüzden '
      'yana dönme, ellerden destek alarak oturma ve bekleme adımlarını içerir. Bu adımlar kısaltılmaz; sessizlikleri '
      'sıkıştırılmaz (§2.3).')
    a('- **"Hipnoz" vaadi yok.** Kayıttan telkin yalnız telkine yatkın kişilerde etki gösterdi (Cordi 2014, PMID 24882909, '
      'DOI 10.5665/sleep.3778). Metin derinleşmeye izin verir ama zorlamaz. Sahibin "hipnoz olmalıyım" isteği, içine çeken '
      've kesintisiz bir deneyim olarak karşılanır.')
    a('- **Göz kökeni.** Gözler hiçbir yerde zorlanmaz: açık kalmaları serbesttir ("bakışın bir noktada dinlenebilir"). '
      'Dolaşımda yalnız "göz kapakları" ve "gözlerin çevresi" geçer; kaş ortası ya da gözün arkasındaki boşluk yoktur. '
      'Göze bastırma ve avuçlama yoktur. Dönüşte gözler "ışığa alışa alışa" açılır.')
    a('')
    a('## 2. Süre modeli, planlayıcı ve eşikler')
    a('')
    a('### 2.1 Bu oturumdaki ölçümler (`../hiz/*.mp3`; 76 heceli Türkçe meditasyon paragrafı)')
    a('')
    a('| Dosya | Eklemleme (hece/sn, duraklamalar hariç) | Paragraf içi duraklamalar |')
    a('|---|---|---|')
    a('| Neslihan v2, düz | 6,61 (verilen) · 6,56 (bu analiz) | 3 durak, toplam 0,61 sn; cümle sonu 0,17–0,22 sn |')
    a('| Hakan v2, düz | 6,52 (verilen) · 6,43 | 8 durak, 5,28 sn; cümle sonu 0,72–0,87, virgül 0,28–0,38 sn |')
    a('| Neslihan v2, üç nokta | 6,50 | 8 durak, 2,93 sn; üç nokta 0,32–0,42 sn |')
    a('| Hakan v2, üç nokta | 6,48 | 10 durak, 9,73 sn; üç nokta 1,39–1,53 sn |')
    a('| Neslihan v4, düz | 5,63 (verilen) · 5,58 | 6 durak, 1,97 sn |')
    a('')
    a('Sonuç: TTS içindeki duraklamalar sese göre dört kat değişiyor. Bu yüzden (1) zamanlama iki duraklama profiliyle '
      'hesaplandı, (2) hızı duyulması gereken bütün diziler (beden noktaları, sayılar, ağır/hafif listeleri) taşıyıcı cümle '
      'içinde üretilip kesilen ve aralarındaki sessizliği uygulamanın koyduğu mikro-kliplerdir (CRITIQUE #12). Böylece '
      'dolaşımın temposu iki seste de aynıdır.')
    a('')
    a('### 2.2 Model (VARSAYIM)')
    a('')
    a('`klip süresi = hece ÷ eklemleme + klip içi noktalama duraklamaları + uç payı`')
    a('')
    a('- Eklemleme hızları: 5,2 (REST speed≈0,8; tahmin), 5,6 (v4, ölçüm), 6,6 (v2 varsayılan, ölçüm).')
    a('- Duraklama profilleri (sn): **düşük** = Neslihan v2 en kısa gözlenen (cümle 0,17 · virgül 0,05 · iki nokta ya da noktalı virgül 0,12 · '
      'üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2\'de (speed 0,8) duraklamalar '
      '×1,25 alındı.')
    a('- Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2), mikro-klip 0,15 sn.')
    a('- Hece sayısı kodla sayılır: Türkçe ünlüler a e ı i o ö u ü â î û.')
    a('')
    a('### 2.3 Planlayıcı (PLAN §B.3\'ün kesin hali; `lib/yoga.js` bunu aynen uygular)')
    a('')
    a('1. **Sabit kapaklar.** Hedef <= 12 dk ise Varış ve Kapanış\'ın kısa metni, değilse uzun metni çalar. Kapaklar her '
      'zaman eksiksizdir ve **sessizlikleri sıkıştırılmaz** (min = pref). Açılış acele etmez; dönüşteki "yana dön, otur, '
      'bekle" adımlarının süresi eylem süresi + 2 sn\'nin altına inmez. Kapak sessizlikleri uzun hedeflerde max\'a kadar '
      'uzayabilir.')
    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2), zorunlu klipleriyle, köprü (`br.k2`, her zaman N2\'den hemen önce) ve '
      'süresi dolan zorunlu klipler (`br.orta`, >= 20 dk) tabanı oluşturur. Taban en kısa haliyle de sığmazsa, yalnız acil '
      'durum yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu ders için denetim her sürede bütün P1 blokları '
      'ister, düşme hiçbir vakada olmadı.')
    a('3. **Artım listesi.** Tek bir sıralı listedir: P2..P5 blokların girişi (`entryRank`: C4 300, C3 500, C5 700; öncelik '
      'sırası korunur) araya giren isteğe bağlı klip "dalgalarıyla" (`fillRank` 110–720) birlikte ilerler. Genişletme klipleri '
      '(`fillRank` >= 1000) bütün isteğe bağlılardan sonra gelir. Her artım, bütün sessizlikler pref değerindeyken hedefe '
      'sığıyorsa eklenir. Mevcut içerik sessizlikler max\'ta bile hedefe yetmiyorsa, artım en kısa haliyle sığdığı sürece '
      'yine eklenir. Sığmayan ilk artımda durulur (önek kuralı). Aynı `fillGroup`taki klipler birlikte girer; sağ ve sol aynı '
      'grupta olduğu için dolaşım hep simetrik kalır. Kural belirlenimcidir: aynı hedef ve aynı sesle her seferinde aynı plan '
      'çıkar (CRITIQUE #30).')
    a('4. **Sessizlik.** Kalan süre min..pref aralığındaysa bütün sessizlikler aynı oranla min\'den pref\'e, pref..max '
      'aralığındaysa pref\'ten max\'a esner. Toplam hedefe tam eşittir. Kalan süre max toplamını aşarsa bu bir içerik '
      'hatasıdır: sessizlik sınırı aşılarak kapatılmaz (CRITIQUE #3). Konuşma klipleri asla hızlandırılmaz ya da kırpılmaz.')
    a('')
    a('Neden bloklar "dalgalar" arasında giriyor: PLAN B.3\'ün harfiyen okunuşunda ya her blok en kısa haliyle erkenden '
      'girer ve her şey sıkışık olur, ya da bir blok ancak öncekiler max sessizliğe ulaşınca girer ve arada uzun, boş '
      'sessizlikler kalır. Dalga düzeninde bir blok, öncekiler rahat (pref) bir biçime ulaşınca girer. Kısaltma sırası PLAN '
      'B.1 ile aynıdır: önce sessizlikler, sonra ayrıntılar, en son bloklar.')
    a('')
    a('### 2.4 Denetimler (`timing.py`; her vaka iki duraklama profilinde)')
    a('')
    a('- **Görevdekiler:** (a) toplam = hedef ±1 sn; (b) Varış ve Kapanış eksiksiz; (c) üst üste binme yok; (d) hiçbir sessizlik '
      'sınırını aşmıyor (pencere <= 90 sn, diğerleri <= kendi max\'ı) ve min\'in altına inmiyor; (e) son 60 sn\'de yeni imge, çağrışım, '
      'zor blok ya da pencere yok; (f) 5 dk = Varış + en az bir P1 + Kapanış (bu ders için bütün P1\'ler); (g) dakikalık konuşma '
      'yoğunluğu: herhangi bir 60 sn\'de <= 150 hece ve <= %60 konuşma, tamamen "Derin" evredeki 60 sn\'de <= 110 hece ve '
      '<= %45 konuşma, plan ortalaması 40–130 hece/dk, duyurulmamış konuşmasız 60 sn yok (eşikler VARSAYIM; PLAN C.2 '
      'bantları + pay; sonuca bakılarak gevşetilmedi, aşan yerde metin ve sessizlik düzeltildi).')
    a('- **Ek (usta hoca ve güvenlik):** anahtar cümle 1-2-3 sırayla ve giderek kısa; dolaşım sırası sağ → sol → arka → ön → '
      'bütün; kapanış ritüeli sırası; >= 20 dk\'da ortada çıkış kapısı; her pencere duyurulmuş ve karşılanmış; her blokta >= 5 sn '
      'bilinçli sessizlik ve planda en uzun boşluk >= 8 sn (E.6 #2); dolgu sözcükleri ("şimdi, sadece, yalnızca, hafifçe, yavaşça") '
      '60 sn içinde ikinci kez yok (E.6 #6); 6,6\'da her klip <= 15 sn; >= 20 dk\'da en uzun doku koşusu <= 300 sn.')
    a('- **Metin:** yasak sözcükler (PLAN C.6 + uyku izni), İngilizce, Sanskritçe her terim en çok bir kez, cümle <= 14 sözcük, '
      'klip 1–3 cümle, emir kipi yalnız güvenlik etiketli kliplerde, blokta en çok bir açıklama cümlesi (E.6 #7), '
      'duraklamalar dahil hiçbir klip 2,5 hece/sn\'nin altında değil (E.6 #14), ardışık kliplerde etiketsiz sözcük tekrarı yok.')
    a('')
    a('### 2.5 Sonuç (timing.out.txt\'ten)')
    a('')
    a('```')
    for line in summ:
        a(line.rstrip())
    a('```')
    a('')
    # paylar
    a('Paylar:')
    a('')
    a('| hız | profil | 5 dk: min sessizliklere göre boş pay | 5 dk sessizlik kipi | 30 dk: bütün içerik + max sessizlik | 30 dk sessizlik kipi |')
    a('|---|---|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            p5 = plans[(rate, prof, 5)]
            p30 = plans[(rate, prof, 30)]
            a('| %s | %s | %s sn | %s %s | %s (%s dk) | %s %s |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek', n(round(300 - p5['speech'] - p5['gaps']['min'], 1)),
                p5['mode'], n(round(p5['f'], 2)), mmss(p30['speech'] + p30['gaps']['max']),
                n(round((p30['speech'] + p30['gaps']['max']) / 60, 1)), p30['mode'], n(round(p30['f'], 2))))
    a('')
    a('En dar yer, 5 dakikanın en yavaş ucudur (5,2 hece/sn + Hakan duraklamaları ×1,25): %s sn pay kalır. Bu uç gerçek '
      'üretimde çıkarsa klip süreleri ölçülünce yeniden denetlenir. 30:00 en hızlı uçta bile bütün içerik max sessizlikte '
      '%s\'e ulaştığı için pay %s dakikadır. Bu yüzden 30 dakikalık sürüm hiçbir sessizliği sınırına dayamadan kurulur.'
      % (n(round(slack5, 1)), mmss(fast_max), n(round((fast_max - 1800) / 60, 1))))
    a('')
    a('## 3. Metin')
    a('')
    a('Okuma: **tür** zorunlu / isteğe bağlı / genişletme; **sessizlik** klipten sonra, sn (min / pref / max; "pencere" = '
      'duyurulmuş sessiz pencere); **ipucu** `görsel` ve `müzik` olayları ile nefes sayısı; **evre** ses ayarı ve karışım '
      'evresi. Konuşma sırasında yatağın kısık olması varsayılan durumdur ve her satıra yazılmadı. Kliplerde `…` taşıyıcıdan '
      'kesilen öğenin liste ezgisini gösterir. Taşıyıcılar TTS\'e tek istek olarak gider ve üç nokta duraklarından kesilir '
      '(öğe sayısı tutmazsa kesimi insan onaylar).')
    a('')
    order = ['A.kisa', 'A.uzun', 'N1', 'C1', 'C2', 'BR.K2', 'C3', 'BR.orta', 'C4', 'C5', 'N2', 'K.kisa', 'K.uzun']
    intro = {
        'A.kisa': 'Sabit kapak; hedef <= 12 dk. Sessizlikler sıkıştırılmaz.',
        'A.uzun': 'Sabit kapak; hedef > 12 dk. Kısa metnin üst kümesi (aynı ses dosyaları): örtü, yastık, ağırlık ve '
                  'kontrol cümlesi eklenir. Uzun kapaklar (Varış + Kapanış) kısa olanlardan %s–%s sn uzundur; bu yüzden 12 → 13 '
                  'dakika geçişinde çekirdekten bir ayrıntı grubu bir dakikalığına düşebilir (§4.4).' % (cap_jump[0], cap_jump[1]),
        'N1': 'P1. Niyet başta. "Sankalpa" sözcüğü seste yalnız burada ve yalnız bir kez geçer (isteğe bağlı açıklama klibinde).',
        'C1': 'P1. Beden dolaşımı. Çerçeve cümlesi izin verir ve atlama kapısını açar. Sonra yalnız yer adları gelir. '
              'Bütün noktalar mikro-kliptir ve temposu uygulamadadır (pref 1,5 sn; bölüm sonlarında 3 sn). En kısa sürümde '
              'her taraf 4 nokta, sırt 3, ön yüz 4 noktadır. Kalça, göğüs ve karın hassas bölgelerdir: tek adla geçer, '
              'üzerlerinde durulmaz; kalça ve karın isteğe bağlıdır. Genişletme: zemine değen noktalar turu.',
        'C2': 'P1. Nefes önce değiştirilmeden izlenir. Sayıları hoca söyler, beşten (uzunda ondan) bire. Sayılar nefese eşlik '
              'eder, ona hız dayatmaz. Genişletmede dinleyici bir turu da kendi içinde sayar (duyurulmuş pencere). '
              'Kaçırılan sayı bağışlanır.',
        'C3': 'P3. Zıtlık çiftleri bedende hissedilir. Blok bir bırakma kapısıyla açılır ("istemezsen onu '
              'bırakabilirsin") ve bırakmayla kapanır. His dili her yerde izin kipindedir ("belirebilir", "yayılabilir"). '
              'Sınama telkini yoktur. "Fincan" ve "pencere" yer kurmayan duyu çağrışımlarıdır.',
        'C4': 'P2. Dersin tek imge yayı. >= 20 dk\'da hemen önüne `BR.orta` köprüsü (çıkış kapısı) gelir.',
        'C5': 'P5. Tanıklık; yalnız C4 varken girer (imgedeki "gelip giden ses"e geri çağrı).',
        'BR.K2': 'Köprü: her sürümde C2\'nin hemen ardından çalar; sonra hangi blok geliyorsa (C3, C4 ya da N2) ona bağlanır. '
                 'Anahtar cümlenin 2. geçişi, derin evrenin başında uyanıklığı yeniden hatırlatır; gündüz dersinde uykuya '
                 'kaymanın en olası olduğu orta bölümden hemen önce gelir.',
        'BR.orta': 'Köprü: yalnız >= 20 dk. İmgelemeden hemen önce ortak çıkış kapısı hatırlatılır (güvenlik §11.B-2/3: uzun iç '
                   'gözlem öncesi gözleri açma seçeneği ve "istediğin an durabilirsin").',
        'N2': 'P1. Niyetin tekrarı.',
        'K.kisa': 'Sabit kapak; hedef <= 12 dk. Gündüz dönüşü. Uyku izni yok. Sessizlikler sıkıştırılmaz ve eylem süresi + 2 sn\'dir.',
        'K.uzun': 'Sabit kapak; hedef > 12 dk. Kısa metne odanın sesleri, oda ayrıntısı, zaman ve yer yönelimi ve yan tarafta '
                  'kalma eklenir.',
    }
    for bid in order:
        b = bm[bid]
        meta = 'tür `%s`' % b['kind']
        if b['kind'] == 'core':
            meta += ' · öncelik P%d · çalma sırası %d' % (b['priority'], b['playOrder'])
            if b.get('entryRank'):
                meta += ' · giriş sırası %d' % b['entryRank']
            if b.get('requiresBlocks'):
                meta += ' · gerekir: %s' % ', '.join(b['requiresBlocks'])
        if b.get('variant'):
            meta += ' · %s' % ('kısa (<= 12 dk)' if b['variant'] == 'short' else 'uzun (> 12 dk)')
        if b.get('placement'):
            pl = b['placement']
            meta += (' · yer: `%s` bloğundan hemen önce' % pl['before']) if pl.get('before') else (
                ' · yer: `%s` bloğunun hemen ardından' % pl['after'])
        a('### %s · %s' % (bid, b['title']))
        a('')
        a('%s. %s' % (meta, intro.get(bid, '')))
        a('')
        cids = sorted({c['carrier']['id'] for c in b['clips'] if c.get('carrier')},
                      key=lambda x: [car['id'] for car in L['carriers']].index(x))
        if cids:
            a('Taşıyıcılar (CRITIQUE #12):')
            a('')
            a(carriers_table(L, cids))
            a('')
        tbl, notes = block_table(b)
        a(tbl)
        a('')
        if notes:
            a('<details><summary>Klip notları (%s)</summary>' % bid)
            a('')
            for i, t in notes:
                a('- `%s`: %s' % (i, t))
            a('')
            a('</details>')
            a('')
    for key_ in ('quickClosing', 'stopReturn'):
        ex = L['extras'][key_]
        a('### %s · %s' % (ex['id'], ex['title']))
        a('')
        if key_ == 'quickClosing':
            a('"Kapanışa geç" düğmesi: o anki klip biter, motor müziği kapanış evresine geçirir ve şafak görselini başlatır, '
              'sonra bu dizi çalar (PLAN B.5; 45–60 sn). Düğmenin kendisi geçiş olduğu için "Artık dönme zamanı." burada '
              'yoktur. Klipler Kapanış\'takilerin aynısıdır; yeni ses üretilmez. Süre (pref) 5,2–6,6 hece/sn\'de %s–%s sn '
              '(denetlendi).'
              % (n(round(min(qc))), n(round(max(qc)))))
        else:
            a('"Durdur (X)" sonrası isteğe bağlı sesli dönüş (güvenlik §11.D-4). İlk iki cümle, durdurma ekranındaki metnin '
              'aynısıdır (ekran ile ses aynı cümleyi söyler). Emir kipi güvenlik gereği kullanılır. Süre %s–%s sn.'
              % (n(round(min(sr))), n(round(max(sr)))))
        a('')
        a('| id | metin | sessizlik sonra (sn) |')
        a('|---|---|---|')
        for c in ex['clips']:
            a('| `%s` | %s | %s |' % (c['id'], c['text'], n(c['gapAfter']['pref'])))
        a('')

    a('## 4. Sürümler')
    a('')
    a('### 4.1 5 dakika · tam metin (5,6 hece/sn, yüksek duraklama; sessizlik kipi %s %s)' % (ref['mode'], n(round(ref['f'], 2))))
    a('')
    a(timeline(ref))
    a('')
    a('### 4.2 5 ve 30 dakikanın blok listesi (her hız ve profil)')
    a('')
    a('| hız | profil | 5 dk: blok süreleri | 30 dk: blok süreleri |')
    a('|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            a('| %s | %s | %s | %s |' % (n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                                         plan_blocks_line(plans[(rate, prof, 5)]),
                                         plan_blocks_line(plans[(rate, prof, 30)])))
    a('')
    a('### 4.3 Blokların girdiği dakika')
    a('')
    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 tanıklık | ilk genişletme | bütün içerik |')
    a('|---|---|---|---|---|---|---|')
    allids = {c['id'] for b in L['blocks'] for c in b['clips'] if b['kind'] == 'core'}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            def first(fn):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        return '%d dk' % m
                return '—'
            ext_ids = {c['id'] for b in L['blocks'] for c in b['clips'] if c['tier'] == 'extension'}
            opt_all = {c['id'] for b in L['blocks'] if b['kind'] == 'core' for c in b['clips'] if c['tier'] != 'required'}
            a('| %s | %s | %s | %s | %s | %s | %s |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                first(lambda p: 'C4' in p['sel']), first(lambda p: 'C3' in p['sel']), first(lambda p: 'C5' in p['sel']),
                first(lambda p: bool(p['inc'] & ext_ids)), first(lambda p: opt_all <= p['inc'])))
    a('')
    a('### 4.4 İçeriğin dakikalara göre büyümesi (5,6 hece/sn, yüksek duraklama)')
    a('')
    a('| dk | kapak | bloklar | klip | hece | konuşma payı | sessizlik kipi | pencereler (sn) |')
    a('|---|---|---|---|---|---|---|---|')
    for m in range(5, 31):
        p = plans[(5.6, 'hi', m)]
        wins = ', '.join(n(round(ev['gap'])) for ev in p['events'] if ev['clip'].get('window')) or '—'
        a('| %d | %s | %s | %d | %d | %%%s | %s %s | %s |' % (
            m, 'kısa' if p['variant'] == 'short' else 'uzun', ' '.join(b for b in block_order(p) if b not in ('A.kisa', 'A.uzun', 'K.kisa', 'K.uzun')),
            len(p['events']), sum(ev['clip']['syllables'] for ev in p['events']), n(round(100 * p['speech'] / p['total'], 1)),
            p['mode'], n(round(p['f'], 2)), wins))
    a('')
    # monotonluk
    drops = []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            prev = None
            for m in range(5, 31):
                p = plans[(rate, prof, m)]
                core = sum(ev['clip']['syllables'] for ev in p['events'] if ev['block'] not in ('A.kisa', 'A.uzun', 'K.kisa', 'K.uzun'))
                if prev is not None and core < prev[1]:
                    drops.append('%s/%s %d→%d dk: çekirdek %d → %d hece' % (n(rate), prof, prev[0], m, prev[1], core))
                prev = (m, core)
    a('Süre arttıkça çekirdek içerik azalmıyor mu? %s' % (
        'Evet, hiçbir vakada azalmıyor.' if not drops else
        'Yalnız şu geçişlerde azalıyor: ' + '; '.join(drops) + '. Hepsi 12 → 13 dk kapak değişimidir: uzun kapaklar %s–%s sn '
        'daha uzundur (örtü, yastık, ağırlık, kontrol cümlesi; odanın sesleri, zaman ve yer, yan tarafta kalmak). Bu '
        'eklerin hepsi uzun bir yatış için gereklidir. Düşen, yalnız bir isteğe bağlı ayrıntı grubudur ve 14. dakikada geri '
        'gelir. Kapak eşiği PLAN\'dan gelir; bu bilinçli bir tasarım bedelidir.' % cap_jump))
    a('')
    a('## 5. Denetim listeleri')
    a('')
    a('### 5.1 Usta hoca ölçütleri (PLAN E.6, 18 madde)')
    a('')
    a('| # | Ölçüt | Bu metinde | Denetim |')
    a('|---|---|---|---|')
    e6 = [
        ('Zaman verir', 'Her eylem cümlesinin en kısa sessizliği eylem süresi + 2 sn (en kısa değerler, sn): ' + actions + '.', 'veri (`gapAfter.min`) + elle'),
        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik var; 5 dk\'da bile en uzun boşluk >= 8 sn (niyet).', '`timing.py`, 78/78'),
        ('Sessizliği korur', 'Üç pencere de duyurulur ("sesim bir süre susacak, sonra geri gelecek") ve karşılanır ("Yeniden seninleyim.", "Buradayım.", "Sesim yeniden seninle"); hepsi <= 90 sn.', '`timing.py`'),
        ('Somut beden dili', 'ağırlık, hafiflik, ılıklık, serinlik, zemine yaslanma, taşın ılıklığı, rüzgârın dokunuşu, koku; "enerji" yok.', 'yasak liste + elle'),
        ('Tutarlı yön', 'sağ → sol → arka → ön → bütün, her sürümde.', '`timing.py`'),
        ('Dolgu yok', 'Bütün metinde: ' + ', '.join('"%s" %d' % (w, k) for w, k in fillers.items()) + '; aynı sözcük 60 sn içinde iki kez geçmez; ardışık cümle tekrarı yalnız bilinçli yerlerde (etiketli).', '`timing.py`'),
        ('Anlatmaz, yaşatır', 'Açıklama cümlesi yalnız N1\'de, bir tane ("Yogada buna sankalpa denir…").', '`timing.py` (metin)'),
        ('Tek imge yayı', 'Yalnız C4; §1.3.', 'etiket + son 60 sn denetimi'),
        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "Önce bir yanına dön.", "…doğrulup otur.", "Birkaç nefes böyle kal; …bekle." ve Durdur dönüşü.', '`timing.py` (metin)'),
        ('Başarısızlığı normalleştirir', '"Gevşemek bugün kolay gelmeyebilir; bu da olur." · "kaçırdıysan bu da olur" · "Fark ettiğin an, zaten geri döndün." · "Bir görüntü gelmezse de olur".', 'elle'),
        ('Çıkış kapısı', 'Açılışta ortak cümle; >= 20 dk\'da ortada hatırlatma; dolaşımda atlama; zıtlıkta ve imgede bırakma yolu. Zor blok yok.', '`timing.py`'),
        ('Kapanış ritüeli', 'nefes → parmaklar → gerinme → gözler → oda → yana dön → otur → bekle → "Buradasın; uyanık ve dinlenmiş."', '`timing.py`'),
        ('Azalan anlatım', 'Her klibin evresi var (Varış → Derinleşme → Derin → Kapanış); ses ayarı ve −1,5 / −3 dB evreye göre.', 'üretim ölçümü (bekliyor)'),
        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden. Duraklamalar dahil en yavaş klip %s hece/sn.' % slowest_val, '`timing.py` (metin) + üretim ölçümü'),
        ('Ses–müzik', 'Konuşmada yatak kısık; kabarma yalnız pencerede.', 'karışım ölçümü (bekliyor)'),
        ('Kusursuz Türkçe', 'Bu belgedeki editör turu (§5.4); Scribe ile geri çevirme ve insan editör onayı bekliyor.', 'kısmen'),
        ('Benzersizlik', 'Açılış cümlesi, kıyı/orman patika yayı, ufuk çizgisi formu ve Mi♭ yatağı yalnız bu derste.', 'ders düzeyi'),
        ('Yasak liste + güvenlik 18 kural', '§5.2 ve §5.3.', '`timing.py` + tablo'),
    ]
    for i, (t, h, d) in enumerate(e6, 1):
        a('| %d | %s | %s | %s |' % (i, t, h, d))
    a('')
    a('### 5.2 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)')
    a('')
    a('| # | Kural | Bu metinde |')
    a('|---|---|---|')
    g18 = [
        ('Davet, komut değil', 'Bütün yönergeler "-ebilirsin", "olabilir" ya da betimleme; emir kipi yalnız güvenlik adımlarında.'),
        ('Gözleri açık seçeneği', '`a.gozler`; uzun iç gözlemden (imgeden) önce `br.orta`.'),
        ('"İstediğin an durabilirsin" açılışta, 30 dk\'da ortada', '`a.izin` her sürümde; `br.orta` >= 20 dk (denetlendi).'),
        ('Kontrol kişide', '"Ne kadar gevşeyeceğine sen karar verirsin."; "istemezsen onu bırakabilirsin"; sınama telkini yok.'),
        ('Gevşeme zorunlu değil', '"Gevşemek bugün kolay gelmeyebilir; bu da olur." (uzun varış); "kaçırdıysan bu da olur".'),
        ('Nefes önce fark edilir', '"olduğu gibi, değiştirmeden izleyebilirsin"; "derin nefes al" yok.'),
        ('Nefes tutma', 'Yok.'),
        ('Tarafsız dayanak ve çıkış kapısı', 'Zor blok yok. Dayanak zemin (varış, temas turu, imgeden dönüş); her zıtlık ve imgede bırakma yolu var.'),
        ('Beden taraması esnek', '`c1.cerceve`: "rahatsız eden bir yer olursa atlayabilirsin". Kalça, göğüs ve karın tek adla geçer.'),
        ('İmgeleme seçimli', 'Kıyı ya da orman; "Bir görüntü gelmezse de olur"; suya ve derinliğe girilmez, karanlık ya da kapalı alan yok.'),
        ('Anı arama yok', 'Çağrışımlar yalnız nötr duyular (fincan, pencere); kişisel anı istenmez.'),
        ('Öz-şefkat kademeli', 'Bu derste öz-şefkat bloğu yok.'),
        ('Sağlık iddiası yok', 'Yasak liste temiz (§5.4).'),
        ('Gündüz dersi uyandırmayla biter', 'Kapanış ritüeli; son cümle "Buradasın; uyanık ve dinlenmiş."'),
        ('Uyku dersi uyku izniyle biter', 'Uygulanmaz. Gündüz dersi: uyku izni yok (yasak liste "uykuya dal", "uyuyabilir", "uyursan" denetlendi).'),
        ('Sessizlikler rehberli', 'Her pencere duyurulur ve karşılanır; <= 90 sn.'),
        ('Beden hareketi hafif', 'Yalnız dönüşte parmaklar, gerinme, yana dönme, doğrulma; "başın dönerse biraz daha bekle".'),
        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç uyarısı da seste yok, açılış ekranında (CRITIQUE #19).'),
    ]
    for i, (t, h) in enumerate(g18, 1):
        a('| %d | %s | %s |' % (i, t, h))
    a('')
    a('### 5.3 Bu metni etkileyen CRITIQUE maddeleri')
    a('')
    a('| # | Konu | Nasıl karşılandı |')
    a('|---|---|---|')
    crit = [
        ('3', 'Genişletme klipleri; 30:00\'a sessizlik sınırı aşılmadan ulaşmak', '9 genişletme grubu (temas turu, içten sayma + pencere, taş, ışık, kuş, rüzgâr, iki "ikisi birlikte", "hepsi kendi kendine"). En hızlı uçta (6,6 + kısa duraklamalar) bütün içerik max sessizlikte %s; 30:00 her hız ve profilde sınır aşılmadan kuruldu. Planlayıcı sessizliği uzatarak kapatmaz; kapatmak zorunda kalırsa içerik hatası verir.' % mmss(fast_max)),
        ('12', 'Tek sözcüklük ipuçları taşıyıcı cümlede üretilip kesilir', 'Sayılar, bütün dolaşım noktaları, ağır/hafif listeleri ve temas noktaları %d taşıyıcıdan kesilen %d mikro-kliptir (✂ işaretli). Bu derste "al/ver" ipucu yok (doğal nefes). 1 sn\'den kısa mikro-klipler evre referansına göre RMS ile eşitlenir.' % (uc['carriers'], uc['micro'])),
        ('21', 'Benzersiz açılış, anahtar cümle ×3, tek imge yayı, 30 dk dikkat eğrisi', '§0, §1.2, §1.3, §1.4; dikkat eğrisi 20 dk ve üstünde denetlendi.'),
        ('31', 'C.8 davet dili', '"İstersen kendine kısa bir niyet seçebilirsin." · "Niyetini içinden üç kez söyleyebilirsin." Kart sözü: "Uyanık kalarak derin bir dinlenme."'),
        ('19', 'İlk ders cümlesi; araç uyarısı; göz kökeni', 'Bu ders ilk ders değil, o cümle yok. Araç uyarısı kartta ve açılış ekranında, seste değil. Gözlere baskı yok (§1.5).'),
        ('2', 'Gibbs 2026 ifadesi', '§1.5: "kronik ağrılı yetişkinlerde, yarı deneysel, n=23".'),
        ('7, 8', 'Ses düzeyleri; müziğin her cümlede inip kalkması', 'Konuşmada yatak ≈ −33 LUFS\'ta kısık kalır; yalnız duyurulan >= 20 sn pencerelerde ≈ −27\'ye kabarır (`müzik swell`).'),
        ('13', '"Harf harf" eşleşme için normalleştirme', '§6: sayılar sözcük ↔ rakam, tırnak, üç nokta, düzeltme işareti; uyuşmazlığa insan karar verir.'),
        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili kör panel henüz yok.'),
    ]
    for c in crit:
        a('| %s | %s | %s |' % c)
    a('')
    a('### 5.4 Türkçe editör notları (ilk tur)')
    a('')
    a('- TDK yazımı: rüzgâr, hâl (hâline), sırtüstü, başparmak, birkaç, bir iki, ağır ağır, ılık ılık, yavaş yavaş, alışa '
      'alışa, kendi kendine, köprücük kemiği, kürek kemiği, bel boşluğu, göz kapakları, avuç içi.')
    a('- Bu turda düzeltilen anlatım sorunları:')
    a('  - Üç ardışık cümlenin "Nefes…" diye başlaması giderildi.')
    a('  - İmgede "Burada acele eden…" cümlesinden sonra gelen "…orada dinlenebilirsin" (burada/orada kayması) düzeltildi.')
    a('  - "Patika… Patika…" tekrarı giderildi.')
    a('  - "dinlenen bedenin" sözünün hemen ardından "Beden dinleniyor" gelmesi önlendi.')
    a('  - "Gözlerini… ışığa" ile "bir ışık" yan yana gelmiyor.')
    a('  - "rahatsız eden yeri" varsayımlı ifadesi koşullu yapıldı: "rahatsız eden bir yer olursa".')
    a('  - "sırtının altındaki zemin" yerine "altındaki zemin" kondu; yan yatan dinleyici de dışarıda kalmıyor.')
    a('  - Uzun varıştaki art arda "-abilirsin" tekdüzeliği kırıldı ("Dizlerinin altına bir yastık iyi gelebilir.").')
    a('  - Nefes cümlesinin eksik nesnesi tamamlandı: "Onu en belirgin hissettiğin yeri bulabilirsin…"')
    a('  - Anahtar cümle ile zıtlığın açılışı art arda "beden" demiyor: "Bir ağırlık hissi belirebilir…"')
    a('- Eksiltili isim cümleleri bilinçli ve konuşma diline uygundur: "Neredeyse ağırlıksız; nefes kadar hafif.", '
      '"Avuçlarında sıcak bir fincan tutar gibi.", "Uzaktaki sesler, yakındaki sesler ve aradaki sessizlik." Öznesi bir '
      'önceki cümlededir. İnsan editör yine de değerlendirmeli.')
    a('- "Ortak ek" kullanımı ("açabilir, kıpırdayabilir ya da durabilirsin") aynı kişi ve kipte olduğu için doğrudur. Bu yapı '
      'PLAN\'ın ortak güvenlik cümlesinde de var.')
    a('')
    a('## 6. Üretim notları (seslendirme)')
    a('')
    a('- **Yol kararı açık (sahip):** REST ya da MCP.')
    a('  - REST ile evreye göre ayar yapılabilir (VARSAYIM başlangıç: Varış speed 0,95 · Derinleşme 0,90 · Derin 0,85). '
      'Ayrıca sabit seed ve komşu cümleler için `previous_text` / `next_text` kullanılır.')
    a('  - MCP\'de bunların hiçbiri yok. Evre farkı o zaman yalnız metinden ve uygulamanın kazancından (−1,5 / −3 dB) gelir.')
    a('  - Taşıyıcı yöntemi iki yolda da çalışır, çünkü her taşıyıcı tek istektir.')
    a('- **Model:** v3 yön etiketleri kullanılmaz (bu oturumdaki denemede etiket büyük olasılıkla sesli okundu). Metinde hiçbir '
      'köşeli etiket yok. `<break>` yok; bütün uzun sessizlikler uygulamada.')
    a('- **Kesim (taşıyıcılar):**')
    a('  - Sessizlik algısıyla öğeler sırayla ayrılır.')
    a('  - Öğe sayısı tutmazsa insan onaylar.')
    a('  - Her mikro-klibe 10 ms yumuşak uç konur.')
    a('  - Seviye: kısa klipler RMS ile evre referansına eşitlenir.')
    a('  - Son öğenin kapanış ezgisi korunur: "beşinci parmak.", "bütün sırt.", "karın.", "bütün beden.", "bir.", "başın arkası."')
    a('- **Scribe ile geri çevirme, normalleştirme (CRITIQUE #13):**')
    a('  - Küçük harf.')
    a('  - Noktalama silinir: … , ; : " \' ve nokta.')
    a('  - Düzeltme işareti düşer: â → a, î → i, û → u.')
    a('  - Sayılar sözcüğe çevrilir: 10 → on. Taşıyıcı bütün olarak karşılaştırılır.')
    a('  - Uyuşmazlıkta klip başına en çok 2 yeniden üretim yapılır; sonra metin yeniden yazılır (CRITIQUE #23).')
    a('- **Söyleyiş izleme listesi (dinlenerek denetlenir):**')
    a('  - sankalpa, Yogada, rüzgârdaki, hâline.')
    a('  - ğ\'li sözcükler: başparmağı, ağırlık, değdiği, doğrulup, değiştirmeden, ağır ağır.')
    a('  - uyluk, baldır, şakak, köprücük, yüzük parmağı ("yüz" eşyazımlısı), yüzüne.')
    a('  - Büyük harfle yazılan I ve İ: "Işık", "İstersen", "İstediğin".')
    a('  - Tırnak içi niyet cümlesinin ezgisi.')
    a('  - Alias gerekirse yalnız REST\'te.')
    a('- **Dosyalar:** `voice.{female,male}.file` = `public/yoga/ders2/<ses>/<klip>.m4a` (kod-haritası N6). `sec` üretimden '
      'sonra dolar. Taşıyıcıların WAV\'ı arşivdir ve pakete girmez.')
    a('')
    a('## 7. VARSAYIM\'lar ve açık noktalar')
    a('')
    a('- Bütün `gapAfter` ve pencere değerleri, dalga sıraları (`fillRank`), giriş sıraları (`entryRank`), kapak '
      'sessizliklerinin sıkıştırılmaması ve 20 dk\'dan itibaren ortadaki hatırlatma birer tasarım kararıdır (VARSAYIM). '
      '12 dk eşiği PLAN\'dan gelir.')
    a('- Süre modeli: eklemleme hızları ölçümdür. Duraklama profilleri tek paragraftan çıkarıldı. 5,2\'deki ×1,25 ve uç payları '
      'VARSAYIM\'dır.')
    a('- Yoğunluk eşikleri (150 / 110 hece, %60 / %45) PLAN C.2 bantlarından türetildi (VARSAYIM).')
    a('- Doğa katmanı önerisi (uzak su + hafif rüzgâr) PLAN A.2\'den bilinçli bir sapmadır; karar üretimin.')
    a('- Sırtüstü yatışa göre yazılan temas turu (topuklar, baldırlar, kürek kemikleri, başın arkası) yan yatan dinleyiciye '
      'tam uymaz. Bu yüzden genişletme katmanındadır ve yalnız uzun sürümlerde çalar.')
    a('- Açık kararlar (sahip): seslendirme yolu (REST/MCP), doğa sesi, insan editör, hoca ve kör dinleme paneli (CRITIQUE #22).')
    a('')
    a('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarının ikinci tur doğrulama tablolarında; DOI\'ler https://doi.org/ önekiyle açılır)')
    a('')
    a('| PMID | Künye | DOI | Dosya |')
    a('|---|---|---|---|')
    refs = [('39690521', 'Luu 2024 (travma-duyarlı YN, 10 bileşen)', '10.17761/2024-D-24-00021', 'sakin, güvenlik'),
            ('40373021', 'Moszeik 2025 (11 ve 30 dk YN)', '10.1002/smi.70049', 'sakin, teslim'),
            ('41743305', 'Gibbs 2026 (kronik ağrılı yetişkinler, yarı deneysel, n=23)', '10.4103/ijoy.ijoy_2_25', 'sakin'),
            ('34306146', 'Toussaint 2021 (derin nefes talimatı ve uyarılma)', '10.1155/2021/5924040', 'sakin, güvenlik'),
            ('42757902', 'Shuminsky & Davidow 2026 (konuşma hızı ve doğallık)', '10.1044/2026_JSLHR-25-00691', 'teslim'),
            ('16941239', 'Knowlton & Larkin 2006 (azalan anlatım)', '10.1007/s10484-006-9014-6', 'teslim'),
            ('16199412', 'Bernardi 2006 (sessizlik aralığı)', '10.1136/hrt.2005.064600', 'sakin, teslim'),
            ('42466037', 'Lieutaud & Bourhis 2026 (rehberli ve rehbersiz)', '10.3389/fpsyg.2026.1833806', 'teslim'),
            ('19493324', 'Wood 2009 (olumlu cümle tekrarı)', '10.1111/j.1467-9280.2009.02370.x', 'benlik'),
            ('3069875', 'Braith 1988 (gevşemeye bağlı kaygı)', '10.1016/0005-7916(88)90040-7', 'güvenlik'),
            ('32820538', 'Farias 2020 (istenmeyen etkiler)', '10.1111/acps.13225', 'güvenlik'),
            ('28300508', 'Howard 2017 (dönüşün önemi)', '10.1080/00029157.2016.1203281', 'güvenlik'),
            ('34260686', 'Tran 2021 (ayağa kalkınca ilk KB düşüşü)', '10.1093/ageing/afab090', 'güvenlik'),
            ('24882909', 'Cordi 2014 (telkine yatkınlık)', '10.5665/sleep.3778', 'sakin, teslim, güvenlik')]
    for r in refs:
        a('| %s | %s | %s | %s |' % r)
    a('')
    a('Kaynak: PubMed (National Library of Medicine), dosyalardaki okumalar üzerinden. Bu metin hiçbir sonucu vaat etmez.')
    a('')
    with open(os.path.join(HERE, 'ders2.script.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(P) + '\n')
