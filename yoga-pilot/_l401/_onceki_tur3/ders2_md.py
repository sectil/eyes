"""ders2.script.md üreticisi (3. tur). Metin, boşluk, ipucu, sahne ve sürüm tabloları ders verisinden ve planlayıcıdan
okunur; belgedeki sayılar hesaplanır. Elle yazılan sayılar yalnız doğrulanmış dosyalardaki kanıt sayıları, ölçüm tablosu
(§2.1) ve VARSAYIM olarak işaretli tasarım değerleridir; önceki turlarla karşılaştırmalar _onceki_tur1/2'deki verilerden
hesaplanır."""
import importlib.util
import json
import os
import re

import timing

HERE = os.path.dirname(os.path.abspath(__file__))
TIER = {'required': 'zorunlu', 'optional': 'isteğe bağlı', 'extension': 'genişletme'}
SCENE_LABEL = {'kiyi': 'Kıyı', 'orman': 'Orman'}
SAFETY = {'opening': 'açılıştaki çıkış cümlesi', 'normalize': 'huzursuzluk olağandır', 'control': 'kontrol kişide',
          'skip': 'atlama kapısı', 'anchor': 'nefes dışı dayanak', 'mid': 'ortadaki çıkış kapısı ve dayanak',
          'exit': 'bölümden çıkış kapısı', 'choice': 'imge seçimi', 'alternative': 'görüntü gelmezse seçenek',
          'door': 'pencere duyurusunda kapı'}

# ---------------------------------------------------------------------------------------------- Türkçe yardımcılar
ONES = {1: 'bir', 2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş', 6: 'altı', 7: 'yedi', 8: 'sekiz', 9: 'dokuz'}
TENS = {10: 'on', 20: 'yirmi', 30: 'otuz', 40: 'kırk', 50: 'elli'}
BACK = set('aıou')
VOW = set('aeıioöuü')
HARD = set('çfhkpsşt')


def spoken_last(n):
    """Bir sayının okunuşundaki son sözcük (0–59)."""
    if n == 0:
        return 'sıfır'
    return ONES[n % 10] if n % 10 else TENS[n]


def _last_vowel_back(word):
    for ch in reversed(word):
        if ch in VOW:
            return ch in BACK
    return False


def ek(word, case):
    """T35: sayıdan sonra kesme işaretli ek. case: 'de' (bulunma) ya da 'e' (yönelme)."""
    back = _last_vowel_back(word)
    last = word[-1]
    if case == 'de':
        return ('t' if last in HARD else 'd') + ('a' if back else 'e')
    return ('y' if last in VOW else '') + ('a' if back else 'e')


def son_okunan(sayi):
    """"29,4" → "dört", "3" → "üç", "30" → "otuz": ekin uyacağı son okunan sözcük (T35)."""
    sayi = str(sayi)
    parca = sayi.split(',')[-1] if ',' in sayi else sayi
    v = int(parca)
    if v >= 60:
        v = v % 10 or 10
    return spoken_last(v)


def ek4(word, tur):
    """Dört biçimli ek: tur 'dir' (ek-fiil) ya da 'i' (belirtme)."""
    v = 'e'
    for ch in reversed(word):
        if ch in VOW:
            v = ch
            break
    unlu = {True: {True: 'u', False: 'ı'}, False: {True: 'ü', False: 'i'}}[v in BACK][v in 'oöuü']
    if tur == 'dir':
        return ('t' if word[-1] in HARD else 'd') + unlu + 'r'
    return ('y' if word[-1] in VOW else '') + unlu


def mmss(sec):
    sec = int(round(sec))
    return '%d:%02d' % (sec // 60, sec % 60)


def zaman(sec, case):
    """"4:55'te", "33:39'a" gibi: son okunan sayıya göre ek (saniye 00 ise dakika okunur)."""
    t = mmss(sec)
    m, s = (int(x) for x in t.split(':'))
    return "%s'%s" % (t, ek(spoken_last(s if s else m), case))


def n(x):
    return ('%g' % x).replace('.', ',')


def r1(x):
    return n(round(x, 1))


def rng(t):
    if not t or t[0] is None:
        return '—'
    return ('%d' % t[0]) if t[0] == t[1] else ('%d–%d' % t)


def span(vals, nd=0):
    lo, hi = min(vals), max(vals)
    f = (lambda v: n(round(v, nd))) if nd else (lambda v: '%d' % round(v))
    return f(lo) if f(lo) == f(hi) else '%s–%s' % (f(lo), f(hi))


# ---------------------------------------------------------------------------------------------- tablo biçimleri
def gap_str(c):
    if c.get('onsetPeriod'):
        p = c['onsetPeriod']
        return 'başlangıç periyodu %s / %s / %s (sessizlik = periyot − süre, en az %s)' % (
            n(p['min']), n(p['pref']), n(p['max']), n(c.get('gapFloor', timing.GAP_FLOOR)))
    g = c['gapAfter']
    s = '%s / %s / %s' % (n(g['min']), n(g['pref']), n(g['max']))
    if c.get('pairGap'):
        pg = c['pairGap']
        s += ' (ardından `%s` çalarsa %s / %s / %s)' % (c['pairWith'], n(pg['min']), n(pg['pref']), n(pg['max']))
    return ('**pencere** ' + s) if c.get('window') else s


def cue_str(c):
    parts = []
    cue = c.get('cue', {})
    if 'visual' in cue:
        parts.append('görsel `%s`' % cue['visual'])
    if 'music' in cue:
        parts.append('müzik `%s`' % cue['music'])
    if 'nature' in cue:
        parts.append('doğa: %s' % cue['nature'])
    if 'voiceGain' in cue:
        parts.append('ses kazancı: %s' % cue['voiceGain'])
    if 'breath' in cue:
        parts.append('sayı %d' % cue['breath']['count'])
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
    if c.get('alternates'):
        out.append('dönüşümlü seçenekler: %s' % ' · '.join('"%s"' % a['text'] for a in c['alternates']))
    if c.get('scenes'):
        out.append('sahne metni: %s' % ' · '.join('%s "%s"' % (SCENE_LABEL.get(k, k), v['text'])
                                                 for k, v in c['scenes'].items()))
    if t.get('safety'):
        out.append('güvenlik: %s' % SAFETY.get(t['safety'], t['safety']))
    if t.get('eyesOpen'):
        out.append('gözleri açma seçeneği')
    if t.get('anchor'):
        out.append('tarafsız dayanak: %s' % t['anchor'])
    if t.get('mood') == 'safety':
        out.append('emir kipi (güvenlik/beden)')
    if t.get('step'):
        out.append('adım: %s' % t['step'])
    if t.get('announce'):
        out.append('pencere duyurusu')
    if t.get('welcome'):
        out.append('pencere sonrası karşılama')
    if t.get('region'):
        out.append('bölge işareti (L2-09)')
    if t.get('image'):
        out.append('imge: %s' % ('yeni' if t['image'] == 'new' else 'dönüş'))
    if t.get('sense'):
        out.append('duyu: %s' % t['sense'])
    if t.get('evocation'):
        out.append('duyu çağrışımı (imge değil)')
    if t.get('callback'):
        out.append('geri çağrı: `%s`' % t['callback'])
    if t.get('normalize'):
        out.append('başarısızlığı normalleştirir')
    if t.get('tts'):
        out.append('söyleyiş: %s' % t['tts'])
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
    syl = sum(c['syllables'] for _, c in clips.values())
    wrd = sum(c['words'] for _, c in clips.values())
    alts = [a for _, c in clips.values() for a in (c.get('alternates') or [])]
    scs = [s for _, c in clips.values() for s in (c.get('scenes') or {}).values()]
    req_texts = ([car['text'] for car in L['carriers']] + [c['text'] for _, c in clips.values() if not c.get('carrier')]
                 + [a['text'] for a in alts] + [s['text'] for s in scs])
    return {'ids': len(clips), 'syl': syl, 'words': wrd, 'alts': len(alts), 'scenes': len(scs),
            'scene_clips': sum(1 for _, c in clips.values() if c.get('scenes')),
            'requests': len(req_texts), 'chars': sum(len(t) for t in req_texts),
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


MODE_DESC = {'mikro-liste': 'tek sözcüklük liste', 'cümle': 'cümleler', 'pencere-duyurusu': 'pencere duyurusu'}
BLOCK_DESC = {'A': 'varış', 'N1': 'niyet', 'C1': 'beden dolaşımı', 'C2': 'nefes ve geri sayma',
              'BR.K2': 'anahtar cümle köprüsü', 'C3': 'zıtlık çiftleri', 'BR.orta': 'çıkış kapısı ve dayanak',
              'C4': 'imge yayı', 'C5': 'tanıklık', 'N2': 'niyetin tekrarı', 'K': 'dışa dönüş ritüeli'}


def attention_rows(p):
    rows = ['| başlangıç | süre | doku (blok / sunum biçimi) | ne oluyor |', '|---|---|---|---|']
    for tx, a, b in timing.texture_runs(p):
        if tx == 'sessiz pencere':
            desc = 'sessiz pencere (konuşmasız; müzik yatağı sürer)'
        else:
            blk, mode = tx.split('/')
            desc = '%s: %s' % (BLOCK_DESC.get(blk, blk), MODE_DESC.get(mode, mode))
        rows.append('| %s | %s | `%s` | %s |' % (mmss(a), mmss(b - a), tx, desc))
    return '\n'.join(rows)


def timeline(p):
    rows = ['| zaman | blok | id | söz | sonra sessizlik (sn) |', '|---|---|---|---|---|']
    for ev in p['events']:
        c = ev['clip']
        rows.append('| %s | %s | `%s` | %s | %s%s |' % (mmss(ev['start']), ev['block'], c['id'], c['text'],
                                                      n(round(ev['gap'], 1)), ' (pencere)' if c.get('window') else ''))
    return '\n'.join(rows)


def prosody_stats(L):
    """T18: cümle sonu kalıpları ve noktalı virgül (taşıyıcılar hariç, benzersiz klipler)."""
    clips = [c for _, c in timing.all_unique_clips(L).values() if not c.get('carrier')]
    sents = [s for c in clips for s in timing.sentences(c['text'])]
    abil = sum(1 for s in sents if re.search(r'(abilir|ebilir)(sin)?[.!?"”]*$', s.strip()))
    semi = sum(1 for c in clips if ';' in c['text'])
    return len(clips), len(sents), abil, semi


def section(txt, head, stop):
    try:
        a = txt.index(head)
        b = txt.index(stop, a)
        return [ln for ln in txt[a:b].strip().splitlines()[1:] if ln.strip()]
    except ValueError:
        return []


# ---------------------------------------------------------------------------------------------- hesaplanan sayılar
def compute(L):
    F = {}
    plans = {}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            for m in range(5, 31):
                plans[(rate, prof, m)] = timing.plan(L, m * 60, rate, prof)
    F['plans'] = plans
    for m in (5, 15, 20, 30):
        F['ref%d' % m] = plans[(5.6, 'hi', m)]
    F['uc'] = unique_counts(L)
    F['bm'] = timing.block_map(L)
    F['allc'] = timing.all_unique_clips(L)
    F['key'] = {c['tags']['key']: c for _, c in F['allc'].values() if c['tags'].get('key')}

    def first_min(fn):
        ms = []
        for rate in timing.RATES:
            for prof in ('lo', 'hi'):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        ms.append(m)
                        break
        return (min(ms), max(ms)) if ms else (None, None)

    def has(cid):
        return lambda p: any(ev['clip']['id'] == cid for ev in p['events'])
    F['first'] = first_min
    F['in'] = {cid: first_min(has(cid)) for cid in (
        'br.k2', 'c3.agir', 'c3.gelmezse', 'c3.sicak', 'c4.yer', 'c4.pencere', 'c4.adim', 'c4.koku', 'c4.yerles',
        'c4.x.istemiyor', 'c4.tas1', 'c5.basla', 'c5.pencere', 'c2.yer', 'c2.alt', 'c2.kal', 'c2.x.kendin',
        'c2.n05', 'c2.n10', 'a.agirlik', 'a.karar', 'a.konfor', 'a.x.kipir', 'c1.gecis.arka', 'c1.gecis.on',
        'c1.x01', 'n2.dilek', 'n2.x.his', 'k.yandakal', 'c1.tekrar', 'c1.kacirma', 'n1.birak', 'c4.iz', 'c4.isik',
        'c4.x.yaklas', 'c4.x.gok', 'c4.x.donus2', 'c5.x.dayanak')}
    F['ext_in'] = first_min(lambda p: any(F['allc'][ev['clip']['id']][1]['tier'] == 'extension' for ev in p['events']))
    F['slack5'] = {}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            p = plans[(rate, prof, 5)]
            F['slack5'][(rate, prof)] = 300 - p['speech'] - p['gaps']['min']
    F['stretch30'] = {(r, pr): timing.stretch(plans[(r, pr, 30)]) for r in timing.RATES for pr in ('lo', 'hi')}
    F['share30'] = {(r, pr): plans[(r, pr, 30)]['speech'] / 1800 for r in timing.RATES for pr in ('lo', 'hi')}
    F['syl30'] = {(r, pr): sum(ev['clip']['syllables'] for ev in plans[(r, pr, 30)]['events'])
                  for r in timing.RATES for pr in ('lo', 'hi')}
    full_ids = [c['id'] for b in L['blocks'] for c in b['clips']]
    F['full_syl'] = sum(F['allc'][i][1]['syllables'] for i in full_ids)
    seen = set()
    for p in plans.values():
        seen |= {ev['clip']['id'] for ev in p['events']}
    F['never'] = [i for i in full_ids if i not in seen]
    F['miss30'] = {(r, pr): [i for i in full_ids if i not in {ev['clip']['id'] for ev in plans[(r, pr, 30)]['events']}]
                   for r in timing.RATES for pr in ('lo', 'hi')}
    qc, sr = [], []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            pr = timing.profile(prof, rate)
            qc.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['quickClosing']['clips']))
            sr.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['stopReturn']['clips']))
    F['qc'], F['sr'] = qc, sr
    _, lint_out = timing.lint_text(L)
    F['rate_lines'] = [o for o in lint_out if o.startswith('Derin cümle iç hızı')]
    slowest = next((o for o in lint_out if o.startswith('en yavaş')), '')
    F['slowest'] = re.search(r'([0-9.]+) hece/sn', slowest).group(1).replace('.', ',') if slowest else '?'
    # blok süreleri ve kapak/çekirdek payı (H1, Z2-06)
    F['bd5'] = {(r, pr): timing.block_durations(plans[(r, pr, 5)]) for r in timing.RATES for pr in ('lo', 'hi')}
    F['split'] = {m: {(r, pr): timing.anchor_split(plans[(r, pr, m)]) for r in timing.RATES for pr in ('lo', 'hi')}
                  for m in (5, 10, 15, 20, 30)}
    bmin = {}
    for m in range(6, 31):
        for r in timing.RATES:
            for pr in ('lo', 'hi'):
                for b, v in timing.block_durations(plans[(r, pr, m)]).items():
                    if F['bm'][b]['kind'] == 'core' and (b not in bmin or v < bmin[b]):
                        bmin[b] = v
    F['bmin6'] = bmin
    # anahtar cümle aralıkları (H3)
    g2, g3 = [], []
    for p in plans.values():
        ks = [ev['start'] for ev in p['events'] if ev['clip']['tags'].get('key')]
        d = [ks[j + 1] - ks[j] for j in range(len(ks) - 1)]
        (g2 if len(ks) == 2 else g3).extend(d)
    F['keygap'] = (min(g2), min(g3))
    # evre başına cümle uzunluğu (H12)
    F['means'] = {m: timing.phase_sentence_means(plans[(5.6, 'hi', m)]) for m in (5, 10, 15, 20, 30)}
    # "-(y)abil-" (TR2-03, H11)
    p5 = plans[(5.6, 'hi', 5)]
    sc = [ev for ev in p5['events'] if not ev['clip'].get('carrier')]
    F['abil5'] = (len(sc), sum(timing.n_abil(ev['clip']['text']) for ev in sc),
                  max(sum(timing.n_abil(e['clip']['text']) for e in sc if ev['start'] <= e['start'] < ev['start'] + 60)
                      for ev in sc))
    # timing.out.txt bölümleri
    try:
        with open(os.path.join(HERE, 'timing.out.txt'), encoding='utf-8') as f:
            txt = f.read()
    except OSError:
        txt = ''
    F['summ'] = section(txt, '== ÖZET ==', 'Kapsam:') + [ln for ln in txt.splitlines() if ln.strip().startswith('Kapsam:')]
    F['variants'] = section(txt, '== Seçenek metinleri', '== Sarsıntı')
    F['perturb'] = section(txt, '== Sarsıntı', '== ÖZET')
    F['reps'] = section(txt, '== Tekrar uyarıları', '== "-(y)abil-"')
    F['r2'] = round2_stats()
    # önceki turlar (karşılaştırma)
    F['old'] = {}
    for tag, sub in (('1', '_onceki_tur1'), ('2', '_onceki_tur2')):
        path = os.path.join(HERE, sub, 'ders2.lesson.json')
        if os.path.exists(path):
            Lo = timing.load(path)
            F['old'][tag] = {'prosody': prosody_stats(Lo),
                             'full_syl': sum(c['syllables'] for b in Lo['blocks'] for c in b['clips'])}
    return F


def round2_stats():
    """2. tur verisi ve planlayıcısıyla (pilot/_onceki_tur2) karşılaştırma sayıları: blok girişleri, 5 dakikadaki
    "-(y)abil-" sayısı (bugünkü sayımla) ve sessizlik alt sınırları."""
    d = os.path.join(HERE, '_onceki_tur2')
    jp, tp = os.path.join(d, 'ders2.lesson.json'), os.path.join(d, 'timing.py')
    if not (os.path.exists(jp) and os.path.exists(tp)):
        return None
    spec = importlib.util.spec_from_file_location('timing_tur2', tp)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    Lo = mod.load(jp)
    pl = {(r, pr, m): mod.plan(Lo, m * 60, r, pr) for r in mod.RATES for pr in ('lo', 'hi') for m in range(5, 31)}

    def first(fn):
        ms = []
        for r in mod.RATES:
            for pr in ('lo', 'hi'):
                for m in range(5, 31):
                    if fn(pl[(r, pr, m)]):
                        ms.append(m)
                        break
        return (min(ms), max(ms)) if ms else (None, None)
    p5 = pl[(5.6, 'hi', 5)]
    sc = [ev for ev in p5['events'] if not ev['clip'].get('carrier')]
    gmin = {}
    for b in Lo['blocks']:
        for c in b['clips']:
            gmin[c['id']] = c['gapAfter']['min']
    return {'c4_in': first(lambda p: 'C4' in p['sel']), 'c3_in': first(lambda p: 'C3' in p['sel']),
            'abil5': (len(sc), sum(timing.n_abil(ev['clip']['text']) for ev in sc)), 'gmin': gmin}


def T(F, cid):
    return F['allc'][cid][1]['text']


def Q(F, cid):
    return '"%s"' % T(F, cid)


# ---------------------------------------------------------------------------------------------- belge: baş, §0
def part_head(L, F, a):
    uc, bm, key = F['uc'], F['bm'], F['key']
    s5 = F['slack5']
    IN = F['in']
    a('# Ders 2 · Derin Dinlenme (Yoga Nidra) · pilot metni')
    a('')
    a('Sürüm: %s. Bu dosya `ders2_kaynak.py`den üretilir (tek kaynak); aynı kaynaktan `ders2.lesson.json` çıkar. '
      'Zamanlama denetimi: `timing.py` → `timing.out.txt`. Bulguların tek tek karşılığı: `fixlog.md` (3. tur tablosu). '
      'Depodaki (`/home/user/eyes`) hiçbir dosyaya dokunulmadı.' % L['version'])
    a('')
    ok_all = any('TOPLAM: 78/78' in s for s in F['summ'])
    a('**Durum, açıkça.** Bu, ikinci tur incelemenin (Türkçe, güvenlik, hoca, kanıt, zaman ve dinleyici gözleri; 90 '
      'bulgu) bütün bulgularıyla yeniden yazılmış metindir. `timing.py` 5–30 dakikanın her dakikasını üç eklemleme '
      'hızında ve her hızda iki duraklama profiliyle kurdu: %s. Açılış ve niyet cümlesinin iki seçenek takımı ile iki '
      'sahne takımı (kıyı, orman) da aynı 78 vakayla ayrıca kuruldu (§2.5). **Bu sayı yalnız zamanlama ve metin '
      'kurallarıdır (P-S1):** dinleme, söyleyiş, ses kalitesi ve insan onayı bu sayının içinde değildir. Klip süreleri '
      'ölçüme dayanan tahminlerdir (VARSAYIM); bütün süreler %%5–10 saparsa birkaç vaka düşer (sarsıntı taraması, §2.5). '
      'Henüz hiçbir cümle seslendirilmedi. Anadili Türkçe bir insan editörün, yoga nidra eğitimi almış bir hocanın ve '
      'en az bir 65 yaş üstü dinleyicinin bulunduğu kör panelin onayı henüz yok (CRITIQUE #22). Bu yüzden ders "bitti" '
      'sayılmaz.' % ('78 vakanın 78\'i geçti' if ok_all else 'sonuç §2.5\'te'))
    a('')
    a('## 0. Tek bakışta')
    a('')
    a('| | |')
    a('|---|---|')
    a('| Söz (kart) | %s |' % L['tagline'])
    a('| Varsayılan süre | %d dakika (H13: varsayılan sürümde zıtlık çiftleri de var; C3 hıza göre %s. dakikadan '
      'itibaren girer) |' % (L['defaultMinutes'], rng(IN['c3.agir'])))
    a('| Açılış ekranı (veride: `openingScreen`, `openingNotice`; güvenlik §8, §11.A, §11.E) | %s |'
      % ' · '.join('"%s"' % t for t in L['openingScreen']))
    a('| Hazırlık kartı (başlamadan önce; P-S13) | %s · tek dokunuşluk ayar: "%s" (L2-10) |' % (
        ' · '.join(L['preparationCard']), L['preparationToggles'][0]['label']))
    a('| Sahne seçici (başlamadan önce; H6, L2-04) | %s. Varsayılan: son seçim (ilk seferde "%s"). Seçim, kaldığın yer '
      'kaydına seçenek dizini ile birlikte yazılır |' % (' / '.join(o['label'] for o in L['scenePicker']['options']),
                                                         L['scenePicker']['options'][0]['label']))
    ac = F['allc']['a.acilis'][1]
    a('| Derse özgü açılış cümlesi | "%s" (dönüşümlü seçenekler: %s) |' % (
        ac['text'], ' · '.join('"%s"' % x['text'] for x in ac['alternates'])))
    a('| Ortak çıkış cümlesi | %s Varışta her sürümde; imgeleme olan her sürümde (%s. dakikadan itibaren) imgenin hemen '
      'önünde bir kez daha, açık gözün serbest bakışı ve tarafsız dayanakla: %s |' % (
          Q(F, 'a.izin'), rng(IN['c4.yer']), Q(F, 'br.orta')))
    a('| Anahtar cümle, giderek kısa | 1) "%s" (%d hece) · 2) "%s" (%d; yalnız zıtlık ya da imgeleme varken, %s. '
      'dakikadan itibaren) · 3) "%s" (%d) |' % (
          key[1]['text'], key[1]['syllables'], key[2]['text'], key[2]['syllables'], rng(IN['br.k2']),
          key[3]['text'], key[3]['syllables']))
    a('| Tek imge yayı | Kıyı ya da orman (seçicide ya da ders içinde; görüntü gelmese de, gözler açık kalsa da olur): '
      'patikanın başı → kendi hızında yürüyüş → uzaktan gelip giden ses ve güneşin sıcaklığı (en kısa imgede de) → '
      'ayak tabanları, koku, izler, esinti → dinlenme yeri, ılık taş, ışık, gökyüzü → sessiz pencere → aynı patikadan '
      'dönüş → görüntü silinir, taşıyan zemin |')
    a('| Niyet | Başta ve sonda. Hazır cümle: "Kendime dinlenme izni veriyorum." "Sankalpa" yalnız ekranda ("%s") |'
      % bm['N1'].get('screenLabel', 'Niyet'))
    c1 = bm['C1']['clips']
    rot = ('sag', 'sol', 'sirt', 'on', 'butun')
    a('| Beden dolaşımı | sağ → sol → arka → ön → bütün, her sürümde bu sırada (en kısada %d nokta, en uzunda %d nokta; '
      'uzun sürümde ayrıca %d noktalık temas turu, bütün-beden doruğundan önce). Öğeler başlangıçtan başlangıca aynı '
      'periyotla gelir (2,4–3,2 sn; L2-08) |' % (
          sum(1 for c in c1 if c.get('carrier') and c['tags'].get('section') in rot and c['tier'] == 'required'),
          sum(1 for c in c1 if c.get('carrier') and c['tags'].get('section') in rot),
          sum(1 for c in c1 if c['tags'].get('section') == 'temas' and c.get('carrier'))))
    a('| Nefes ve sayma | Her sürümde nefes, aynı klipte nefes dışı kapıyla (eller ya da açık gözler; G2-01). Beşten '
      'bire sayım %s., ondan bire sayım %s. dakikadan itibaren; sayılar başlangıçtan başlangıca 5,8–6,3 sn arayla, '
      'nefese hız dayatmadan (Z2-07) |' % (rng(IN['c2.n05']), rng(IN['c2.n10'])))
    a('| Zıtlık çiftleri | ağırlık / hafiflik (%s. dakikadan), sıcaklık / serinlik (%s. dakikadan) |' % (
        rng(IN['c3.agir']), rng(IN['c3.sicak'])))
    a('| Sessiz pencereler | en çok 90 sn; önce duyurulur (duyuru bir kapı taşır), sonra karşılanır: imge (%s. dk\'dan), '
      'tanıklık (%s. dk\'dan), içten sayma (%s. dk\'dan) |' % (
          rng(IN['c4.pencere']), rng(IN['c5.pencere']), rng(IN['c2.x.kendin'])))
    a('| Kapanış | nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → birkaç nefes bekle → acele etmeden '
      'kalk (başın dönerse yeniden otur) → "Buradasın ve uyanıksın." |')
    a('| Zamanlama | **78/78 vaka** (5,2 / 5,6 / 6,6 hece/sn × 5..30 dk; her vaka iki duraklama profilinde) + iki seçenek '
      'takımı + iki sahne takımı; 5 dakikanın en yavaş ucunda %s sn boş pay (T6 tabanı 15); 30:00\'da sessizlik '
      'esnemesi en çok %%%d |' % (r1(s5[(5.2, 'hi')]), round(100 * max(F['stretch30'].values()))))
    a('| Metin envanteri | %d klip kimliği (%d hece, %d sözcük) + %d seçenek metni + %d sahne metni (%d klipte); TTS\'e '
      '%d istek (%d taşıyıcı dahil), %d karakter |' % (
          uc['ids'], uc['syl'], uc['words'], uc['alts'], uc['scenes'], uc['scene_clips'], uc['requests'],
          uc['carriers'], uc['chars']))
    a('| 5 dakika | %s |' % ' → '.join(block_order(F['ref5'])))
    a('| %d dakika (varsayılan) | %s |' % (L['defaultMinutes'], ' → '.join(block_order(F['ref20']))))
    a('| 30 dakika | %s |' % ' → '.join(block_order(F['ref30'])))
    a('')


# ---------------------------------------------------------------------------------------------- §1
def part_1(L, F, a):
    bm, key, IN = F['bm'], F['key'], F['in']
    a('## 1. Hocanın kurgusu')
    a('')
    a('### 1.1 Akış, evreler ve ses, müzik ve görüntü uyumu')
    a('')
    a('Evre geçişleri ses, müzik ve görselde **aynı klipte** olur (S4-hoca): Derinleşme `n1.sec` klibinde, Derin '
      '`c2.dikkat` klibinde, Kapanış `k.donus` klibinde. Derin evrenin içinde müzik yatağı blokla birlikte **dokusunu** '
      'değiştirir, yüksekliğini değil (L2-13); görsel de imgeyle açılıp kapanır. Böylece ses, müzik ve görüntü aynı '
      'bölüm sınırlarında sayfa çevirir.')
    a('')
    a('| Evre | Bloklar | Ses (PLAN C.2, D.2) | Müzik (yatak; konuşmada kısık) | Görsel (ufuk çizgisi formu) |')
    a('|---|---|---|---|---|')
    a('| Varış | A | konuşma düzeyi (0 dB); yol A\'da REST hızı 0,90 (VARSAYIM) | Varış yatağı, konuşmada ≈ −33 LUFS; ders '
      '3 sn\'de açılır | en aydınlık (yine koyu) |')
    a('| Derinleşme | N1, C1 | −1,5 dB (netlik açıkken −0,5); yol A\'da hız bir basamak düşer: 0,85 (VARSAYIM) | '
      '`n1.sec` klibinde Varış yatağı 1,5 dB daha kısılır (≈ −34,5 LUFS) | `n1.sec` klibinde daha loş |')
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | −3 dB (netlik açıkken −1); yol A\'da bir basamak daha: '
      '0,80 (≈ 5,2 hece/sn, tahmin; zamanlamanın hesaplandığı en yavaş hız, altına inilmez) | `c2.dikkat` klibinde 8 sn '
      'çapraz geçişle Derin yatağı, konuşmada ≈ −36 LUFS. Doku katmanları (L2-13): `c3.agir` daha ince pad, `c4.yer` '
      'seyrek uzak piyano ve sahnenin doğa dokusu, `c4.solma` imge katmanı çekilir, `c5.basla` yalnız alçak, uzun '
      'yaylılar; her geçiş >= 8 sn, konuşmanın altında. Yalnız duyurulan >= 20 sn pencerelerde +6 dB (≈ −30), 6 sn\'lik '
      'rampayla; pencere bitmeden 8 sn önce 6 sn\'de iner (G2-11) | `c2.dikkat` klibinde en loş; `c4.yer` ile `c4.solma` '
      'arasında imge katmanı; pencerede biraz kararır ve yavaşlar, bitmeden 3 sn önce aydınlanır; sayılarda yumuşak '
      'nabız (profilde ışığa duyarlılık cevabı "evet/emin değilim" ise nabız yok) |')
    a('| Kapanış | K | `k.anahtar3` sonrasındaki 5–9 sn\'lik sessizlik boyunca −3 → 0 dB rampa (basamak yok, S18); '
      '"Artık dönüş zamanı." 0 dB\'de (L2-02) | `k.donus` klibinde Kapanış yatağı ve ondan 2 sn önce dönüş tınısı; '
      '`k.goz` klibinde sıcak "şafak" akoru (tını parlaklığı, ses yüksekliği değil); son 5 sn\'de söner | şafak 60–90 '
      'sn: başlangıcı `k.donus` ile "son − 90 sn"nin geç olanı; >= 60 sn\'lik rampa; parlaklık tavanı bağıl %15 '
      '(VARSAYIM) |')
    a('')
    a('**Yol B (yalnız MCP):** hız ayarı yoktur; eklemleme her evrede aynıdır. Azalan anlatım o zaman yalnız uzayan '
      'boşluk, kısalan cümle ve −1,5 / −3 dB seviyeyle verilir (PLAN C.2). Hızın evreden evreye düşmesi yalnız yol A\'da '
      'mümkündür; hangi yolun seçileceği sahibin kararıdır.')
    a('')
    a('Düzeyler (hepsi VARSAYIM, P-B3): yatak sesin evresini izler, böylece konuşma ile kısık yatak arasındaki fark her '
      'evrede >= 15 dB kalır (−18 − (−33) = 15; −19,5 − (−34,5) = 15; −21 − (−36) = 15). QA bu farkı her evrede ayrı, '
      '3 sn kısa süreli LUFS ile ölçer (`qa.speechOverBedDbMin`). Yatak yalnız duyurulan ve en az 20 sn süren pencerelerde '
      'kalkar; kısa süreli yükseklik artışı pencerenin içinde ve çevresinde saniyede en çok 1 dB\'dir '
      '(`qa.windowLoudnessRiseMaxDbPerSec`). Müzik her cümlede inip kalkmaz (CRITIQUE #7, #8). Her pencere sonrası '
      'karşılama klibinden ve `k.donus` klibinden 2 sn önce aynı yumuşak dönüş tınısı çalar: dalıp giden dinleyici söz '
      'başlamadan yönelir ve dönüşün başladığını tanıdık bir işaretten anlar (P-S10, L2-02).')
    a('')
    a('**Konuşma netliği (L2-10).** Hazırlık kartındaki tek dokunuşluk "%s" açıkken evre düşüşü en çok −1 dB olur '
      '(Derinleşme −0,5, Derin −1), yatak 6 dB daha kısılır, QA farkı 21 dB\'e çıkar ve tek heceli mikro-klipler ("on", '
      '"üç", "diz") evre referansının 1 dB üstüne eşitlenir (hepsi VARSAYIM). Ayar kullanıcı başına hatırlanır; gözleri '
      'kapalı dinleyenin ders ortasında ayar aramasına gerek kalmaz.' % L['preparationToggles'][0]['label'])
    a('')
    a('**Doğa katmanı sahneyi izler (H6, L2-03).** Orman seçen dinleyici için rüzgâr ve yaprak dokusu imge boyunca '
      'sürer. Kıyı seçen dinleyici için imge boyunca uzak, yumuşak bir dalga dokusu çalar (suya girilmez); bu su '
      'katmanının üretimi sahibin kararıdır. Karar olumsuzsa ya da dinleyici "Ders içinde seçerim" dediyse varsayılan '
      'rüzgâr ve yaprak dokusu `c4.yer` klibinden `c4.solma` klibine kadar 8 dB kısılır; imgeyi dinleyicinin kendi zihni '
      'doldurur ve sesle arka plan çelişmez. Su katmanı varsayılan olarak kapalıdır ve yalnız Kıyı seçene, yalnız imge '
      'boyunca çalar, çünkü su herkese iyi gelmeyebilir (güvenlik §11.B-10; tasarım önerisi, Luu 2024 özetinde yok, sakin '
      '§11.7 düzeltmesi; EV2-10).')
    a('')
    a('### 1.2 Anahtar cümle (C.4; CRITIQUE #21)')
    a('')
    a('Dersin fikri yoga nidranın kendisidir: beden dinlenir, farkındalık uyanık kalır. Anahtar cümle her geçişte biraz '
      'daha kısadır (%d → %d → %d hece); hiçbirinde üç nokta yoktur (PLAN C.2: üç nokta yalnız listelerde) ve hiçbiri bir '
      'durum iddiası değildir (G2-08):' % (key[1]['syllables'], key[2]['syllables'], key[3]['syllables']))
    a('')
    a('1. `c1.k1`, beden dolaşımının sonunda: **"%s"** İlk geçiş izin kipindedir: bedenin dinlenmesi bir iddia değil, '
      'bir olanaktır (S17).' % key[1]['text'])
    a('2. `br.k2`, nefes bloğunun hemen ardından, **yalnız zıtlık (C3) ya da imgeleme (C4) seçiliyse** (H3; %s. '
      'dakikadan itibaren): **"%s"** Böylece iki anahtar cümle arasında her zaman bir blok vardır; kısa sürümlerde '
      'cümle bir slogan gibi üst üste gelmez.' % (rng(IN['br.k2']), key[2]['text']))
    a('3. `k.anahtar3`, dönüşün eşiğinde: **"%s"** Beden ile uyanıklık tek ad öbeğinde birleşir; bu, dersin adıdır, bir '
      'sonuç bildirimi değildir. Ardından 5–9 sn sessizlik gelir: tez yerine otursun, ses de bu sessizlikte Kapanış '
      'düzeyine çıksın (H4, L2-02). Kapanışın son cümlesi yayı iddiasız kapatır: "%s" (EV2-01, H9).' % (
          key[3]['text'], T(F, 'k.son').split('. ')[-1]))
    a('')

    def key_times(p):
        return [ev['start'] for ev in p['events'] if ev['clip']['tags'].get('key')]
    parts = []
    for m in (5, 15, 30):
        ks = key_times(F['ref%d' % m])
        parts.append('%d dakikada %s' % (m, ', '.join(zaman(k, 'de') for k in ks)))
    a('Yerleşim (5,6 hece/sn, yüksek profil): %s. Zıtlık ya da imgeleme olmayan sürümlerde (5 dakikadan hıza göre %s. dakikaya '
      'kadar) anahtar cümle iki kez geçer. Bütün 156 planda iki geçiş arası en az %s sn, üç geçişte ardışık geçişler '
      'arası en az %s sn\'dir (`timing.py` H3: iki geçişte >= 60, üç geçişte >= 90 sn).' % (
          '; '.join(parts), rng((IN['br.k2'][0] - 1, IN['br.k2'][1] - 1)), r1(F['keygap'][0]), r1(F['keygap'][1])))
    a('')
    a('### 1.3 Tek imge yayı ve sahne seçici (C.4; E.6 #8; H6, L2-04)')
    a('')
    a('İmge yalnız C4\'tedir ve hemen önünde her sürümde kapı ve dayanak çalar (`br.orta`). Dinleyici başlamadan önce '
      '**Kıyı**, **Orman** ya da **Ders içinde seçerim** der. Seçim, kaldığın yer kaydına seçenek dizini ile birlikte '
      'yazılır (CRITIQUE #30). Sahne seçilmişse aşağıdaki klipler sahneye özgü metinle çalar; klip kimlikleri ve '
      'boşluklar aynıdır, bu yüzden planlayıcı değişmez ve iki sahne takımı da 78 vakayla ayrıca kurulur (§2.5). Sahne '
      'seçilmemişse ana metin çalar: seçim ders içinde yapılır ve ayrıntılar iki yere de uyar.')
    a('')
    a('| klip | Ders içinde seçerim (ana metin) | Kıyı | Orman |')
    a('|---|---|---|---|')
    for b in L['blocks']:
        for c in b['clips']:
            if c.get('scenes'):
                sc = c['scenes']
                a('| `%s` | %s | %s | %s |' % (c['id'], c['text'], sc.get('kiyi', {}).get('text', '(ana metin)'),
                                             sc.get('orman', {}).get('text', '(ana metin)')))
    a('')
    m_c4 = next((m for m in range(5, 31) if 'C4' in F['plans'][(5.6, 'hi', m)]['sel']), None)
    minimal = [ev['clip'] for ev in F['plans'][(5.6, 'hi', m_c4)]['events'] if ev['block'] == 'C4'] if m_c4 else []
    a('Kıyıda suya girilmez; ormanda karanlık ya da kapalı alan yoktur (güvenlik §11.B-10; tasarım önerisi, Luu 2024 '
      'özetinde yok, sakin §11.7 düzeltmesi; EV2-10). Yay: kendini patikanın başında bulmak → kendi hızında yürüyüş '
      '(iniş, aşağı inme ya da "her adımda daha çok dinlenme" gibi derinleştirici yoktur; S3, B3, E1) → uzaktan gelip '
      'giden ses ve güneşin sıcaklığı → ayak tabanları (%s. dakikadan), koku, ardında kalan izler, esinti → "%s" (%s. '
      'dakikadan; L2-16) → dinlenme yeri, ılık taş, ışık, gökyüzü → sessiz pencere (duyurunun içinde kapı: "İstediğin '
      'an gözlerini açabilirsin."; H15) → ışıkla gölgenin yer değiştirmesi → aynı patikadan, acele etmeden dönüş → '
      'patikanın başına yaklaşma (odaya değil; H14, TR2-11) → görüntü usulca silinir, seni taşıyan zemin.' % (
          rng(IN['c4.adim']), T(F, 'c4.x.istemiyor'), rng(IN['c4.x.istemiyor'])))
    a('')
    if minimal:
        a('**En kısa imge (%d. dakika, 5,6 hece/sn, yüksek profil) bile boş değildir (H2):** %s Görme dışında en az iki '
          'duyu (ses, sıcaklık) her C4\'te `c4.don` klibinden önce çalar (`timing.py` H2). Dinlenme yeri cümlesi artık '
          'isteğe bağlıdır ve gerçek kapanış fiillerini ("otur", "uzan") kullanmaz: "%s" (H2, G2-09).' % (
              m_c4, ' → '.join('"%s"' % c['text'] for c in minimal), T(F, 'c4.yerles')))
        a('')
    a('"X ya da Y" biçimi yalnız ana metinde kalır (`c4.yer`, `c4.ses`, `c5.dusunce`); sahne seçildiğinde hiç duyulmaz. '
      'C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değil, duyu çağrışımıdır. Son 60 sn\'de yeni imge yoktur '
      '(her vakada denetlendi).')
    a('')
    a('"Gelip gitmek" dersin sözel motifidir: nefes (%s), imge (%s, %s) ve tanıklık (%s). Tarafsız dayanağın dili de '
      'tektir: **zemin** (%s, %s, %s, %s, %s, %s).' % (
          Q(F, 'c2.akis'), Q(F, 'c4.ses'), Q(F, 'c4.x.yaklas'), Q(F, 'c5.dusunce'), Q(F, 'a.agirlik'),
          Q(F, 'c1.x07'), Q(F, 'c3.zemin'), Q(F, 'br.orta').split('. ')[-1].rstrip('"').join(['"', '"']),
          Q(F, 'c4.solma').split('. ')[-1].rstrip('"').join(['"', '"']), Q(F, 'c5.x.dayanak')))
    a('')
    a('### 1.4 30 dakikalık dikkat eğrisi (CRITIQUE #21; her 3–5 dakikada doku, teknik ya da sessizlik değişir)')
    a('')
    a('Doku = blok × sunum biçimi (mikro-liste, cümle, sessiz pencere); P-S5 gereği aynı listenin sağ, sol, sırt, ön ve '
      'bütün bölümleri **tek doku** sayılır, listeyi ancak bir cümle, bir bölge işareti ("%s", "%s"; L2-09) ya da pencere '
      'böler. En uzun doku koşusu 300 sn\'yi geçmez; bu, 10 dakika ve üstündeki her vakada denetlendi (T8-5). Plan: 30 '
      'dk, 5,6 hece/sn, yüksek profil.' % (T(F, 'c1.gecis.arka'), T(F, 'c1.gecis.on')))
    a('')
    a(attention_rows(F['ref30']))
    a('')


def part_15(L, F, a):
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
    a('- **Kısa sürüm bütündür.** 11 ve 30 dakikalık yoga nidra doğrudan karşılaştırıldığında ikisi de küçük etki gösterdi; '
      '30 dakikalık sürüm yalnız "farkında davranma" alt boyutunda farklıydı (d=0,10; %95 GA −0,01 ile 0,44). Çalışmada '
      'kayıtlar iki ay boyunca, ideal olarak her gün ve arka plan müziği olmadan dinletildi (Moszeik 2025, PMID 40373021, '
      'DOI 10.1002/smi.70049). Kronik ağrılı 23 yetişkinle yapılan yarı deneysel bir çalışmada tek 45 dakikalık yoga nidra, '
      'beden taramasına göre hemen sonrasında iyi oluşta daha fazla artışla birlikte gitti (Gibbs 2026, PMID 41743305, DOI '
      '10.4103/ijoy.ijoy_2_25). Tasarım çıkarımı: kısa sürüm bir beden taramasına indirgenmez, iskeleti korur (niyet → '
      'dolaşım → nefes → niyet → dönüş). Hiçbir sürüm sonuç vaat etmez.')
    a('- **Nefes.** Önce değiştirilmeden izlenir: %s "Derin nefes al" komutu yoktur. Derin nefes talimatı bir çalışmada '
      'önce uyarılmayı artırdı; uyarılma sonra başlangıç düzeyine döndü (Toussaint 2021; 60 sağlıklı öğrenci; PMID '
      '34306146, DOI 10.1155/2021/5924040). Dönüşte de derinleştirme yoktur: %s (güvenlik §11.B-14, "nefesi normale '
      'bırak"; S7, TR2-19). Sayılar nefese hız dayatmaz: %s Sayıların başlangıçları arası 5,8–6,3 sn\'dir (dakikada ≈ 10; '
      'S8, T3, Z2-07). Nefes herkes için tarafsız bir dayanak da değildir: kronik olarak hızlı soluyan kişilerde, oturup '
      'ya da uzanıp gevşerken kandaki CO₂\'nin düşüp panik benzeri duyumlara yol açabileceğini anlatan kuramsal bir '
      'derleme var (Ley 1988; güvenlik dosyası §2, ikinci turda yeniden doğrulanmadı; PMID 3148637, DOI '
      '10.1016/0005-7916(88)90054-7; EV2-06). Bu yüzden nefese bakan **her** sürümde, aynı klipte nefes dışı bir kapı '
      'vardır: %s (G2-01, L2-01). %s. dakikadan itibaren nefesle kalana ve ellerle kalana ayrı ayrı seslenilir (%s / '
      '%s; TR2-12, H7). Dayanak bölüme göre değişir: nefeste eller ve gözler; zıtlıkta, imgeden hemen önce ve sonra ve '
      'tanıklıkta zemin; imgenin içinde gözler, çünkü orada "zemin" hayal edilen yer gibi duyulabilir (güvenlik §11.B-8; '
      'tasarım çıkarımı).' % (
          Q(F, 'c2.dikkat').split('. ')[0] + '."', Q(F, 'k.nefes'), Q(F, 'c2.sayac').split('. ')[-1].join(['"', '']),
          '"' + T(F, 'c2.dikkat').split('. ')[-1] + '"', rng(IN['c2.alt']), Q(F, 'c2.yer').split('. ')[0] + '."',
          Q(F, 'c2.alt')))
    a('- **Hız ve sessizlik.** Yavaşlık sözcük uzatarak değil, cümleler arası sessizlikle verilir. 12 kadın konuşmacı ve '
      '28 dinleyiciyle yapılan bir deneyde 30 dakikalık "net konuşma" eğitimiyle üretilen 1,72 hece/sn\'lik konuşma en az '
      'doğal bulundu; en çok ve en uzun duraklamalar da bu koşuldaydı; alışkın okuma (3,89 hece/sn) en doğaldı '
      '(Shuminsky & Davidow 2026, PMID 42757902, DOI 10.1044/2026_JSLHR-25-00691; EV2-07). Konuşmanın dili doğrulanmış '
      'dosyada belirtilmemiştir; bu sayılar Türkçe hedef değildir, yalnız yön verir; cümleler arası sessizliğin '
      'doğallığa etkisi test edilmedi (tasarım çıkarımı). Yüksek kaygılı 48 genç kadında tek seanslık progresif '
      'gevşemede, seans boyunca hızı, yüksekliği ve tonu azalan sesle çalışan grupta EMG diğer gruplardan fazla düştü '
      '(Knowlton & Larkin 2006, PMID 16941239, DOI 10.1007/s10484-006-9014-6); uygulamadaki karşılığı (§1.1) tasarım '
      'çıkarımıdır. Bir müzik dinleme deneyinde (24 kişi) parçalar arasına konan 2 dakikalık müziksiz sessizlikte kalp '
      'hızı, kan basıncı ve ventilasyon başlangıcın altına indi (Bernardi 2006, PMID 16199412, DOI '
      '10.1136/hrt.2005.064600). Bu derste pencerelerde müzik yatağı sürer; pencerelerin değeri bu bulgudan doğrudan '
      'çıkmaz (tasarım çıkarımı). 90 sn üst sınırı güvenlik §11.B-16\'daki 60–90 sn önerisinden gelir; doğrulanmış bir '
      'eşik değildir (VARSAYIM). Acemilerde 8 haftalık, beden odaklı ve koçluk içeren rehberli bir program, rehbersiz '
      'sessiz pratiğe göre benlik saygısında ve sürekli kaygıda daha büyük değişimle birlikte gitti; program koçluk da '
      'içerdiği için yalnız ses rehberliğinin payı ayrılamaz (Lieutaud & Bourhis 2026, PMID 42466037, DOI '
      '10.3389/fpsyg.2026.1833806; EV2-09). Tasarım çıkarımı: sessizlik değerli ama rehbersiz kalmamalı; pencereler '
      'duyurulur, bir kapı taşır ve karşılanır.')
    a('- **Niyet cümlesi.** "Sevilmeye değer biriyim" cümlesini tekrarlayan öz-saygısı düşük kişiler daha kötü hissetti '
      '(Wood 2009, PMID 19493324, DOI 10.1111/j.1467-9280.2009.02370.x). Hazır niyet bu yüzden bir yargı değil, kişinin '
      'kendine verdiği bir izindir: "Kendime dinlenme izni veriyorum." (TR2-04). İzin cümlesinin bu riski taşımadığı test '
      'edilmedi; bu bir tasarım çıkarımıdır. Niyetin kalıcılığı için güvence verilmez (EV2-03): %s Sondaki dilek, '
      'günün saatinden bağımsızdır ve seçimi dinleyiciye bırakır: %s (L2-17).' % (Q(F, 'n1.birak'), Q(F, 'n2.dilek')))
    a('- **Huzursuzluk olağandır.** Klinik tanısı olmayan, kronik kaygılı 30 kişiye kayıttan dinletilen tek seans '
      'progresif gevşemede 5 kişide (%%17) seans sırasında kaygı arttı (Braith 1988, PMID 3069875, DOI '
      '10.1016/0005-7916(88)90040-7). Meditasyonla ilişkili istenmeyen etkiler 83 çalışmada toplam %%8,3 sıklıkta görüldü '
      '(deneysel çalışmalarda %%3,7, gözlemsel çalışmalarda %%33,2; Farias 2020, PMID 32820538, DOI 10.1111/acps.13225; '
      'EV2-08). Bu yüzden **her sürümde, 5 dakikada da,** varış %s der (`a.kolay`; S2, B6, P-B1, TR2-07). %s (`a.karar`; '
      'TR2-14) %s. dakikadan itibaren eklenir. Zihnin kaymasını `c2.birak`, kaçırılan adı `c1.kacirma`, hissedilmeyen '
      'ağırlığı `c3.gelmezse` (L2-05), gelmeyen görüntüyü `c4.gelmezse`, dalıp gitmeyi `c4.donus1` bağışlar; bu beş '
      'klibin hangi sürede girdiği §3\'teki sıra numarasından okunur. Anahtar cümle ve kapanış hiçbir yerde "dinlendin" '
      'demez (G2-08, EV2-01).' % (Q(F, 'a.kolay'), Q(F, 'a.karar'), rng(IN['a.karar'])))
    a('- **Dönüş.** Hipnozdan çıkarma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017; klinik '
      'yorum ve 3 vaka; PMID 28300508, DOI 10.1080/00029157.2016.1203281). Ayağa kalkınca ilk anda görülen kan basıncı '
      'düşüşü, sürekli ölçümle 65 yaş üstünde havuzlanmış olarak %%29 (Tran 2021, PMID 34260686, DOI '
      '10.1093/ageing/afab090). Kapanış bu yüzden yana dönme (%s sn), ellerden destek alarak oturma (%s sn), oturarak '
      'birkaç nefes bekleme (%s sn, ≈ üç dinlenik nefes) ve acele etmeden kalkma adımlarını içerir; kalkış cümlesi baş '
      'dönmesi satırını da taşır: %s (G2-04; güvenlik §11.A: "Başın dönerse otur ve bekle"). Bu sessizlikler hiçbir '
      'sürede sıkıştırılmaz (güvenlik §7 Karar; B2, T1, S4, P-B4, E7). "Kapanışa geç" aynı süreleri kullanır; Durdur '
      'yolu yana dönüp oturmaya %s sn verir, bekleme ondan sonra ekran metniyle sessizce sürer (Z2-01, G2-05).' % (
          n(act['yan']['gapAfter']['min']), n(act['otur']['gapAfter']['min']), n(act['bekle']['gapAfter']['min']),
          '"' + T(F, 'k.son').split('. ')[0] + '."',
          n(next(c for c in L['extras']['stopReturn']['clips'] if c['id'] == 'd.kalk')['gapAfter']['min'])))
    a('- **Hareket.** Yoga yan etkilerine ilişkin 76 vakayı derleyen sistematik derlemede en sık kas-iskelet sistemi '
      'etkilenmişti (Cramer 2013, PMID 24146758, DOI 10.1371/journal.pone.0075515); Almanya\'da 1.702 kişilik bir ankette '
      'yalnız kendi başına, gözetimsiz çalışmak yan etki riskinin artmasıyla ilişkiliydi (Cramer 2019, PMID 31357980, DOI '
      '10.1186/s12906-019-2612-7). Tek gerçek hareket olan gerinme bu yüzden "zorlamadan" ve %s ile gelir (güvenlik '
      '§11.B-17: "ağrı ya da baş dönmesi olursa bırak"; S6, S13, E8, P-N4, G2-07, EV2-11).' % (
          '"' + T(F, 'k.hareket').split('. ')[-1] + '"'))
    a('- **"Hipnoz" vaadi yok.** Öğle şekerlemesinden önce dinletilen "daha derin uyu" telkin kaydı, 70 sağlıklı genç kadında '
      'kontrol koşuluna göre derin uykuyu artırdı; telkine az yatkın kişilerde bu etki ek deneylerde görülmedi (Cordi 2014, '
      'PMID 24882909, DOI 10.5665/sleep.3778). Etki kişiden kişiye değiştiği için metin derinleşmeye izin verir ama '
      'zorlamaz ve kimseye vaat etmez. İmgede iniş, "her adımda daha çok dinlenme" ya da yolun dinleyiciyi taşıması gibi '
      'derinleştiriciler yoktur (S3, B3, E1). Sahibin "hipnoz olmalıyım" isteği, içine çeken ve kesintisiz bir deneyim '
      'olarak karşılanır.')
    a('- **Uzaklaşma hissi.** Bir gevşeme çalışmasında "uzakta, ilgisiz" hissetmek bütün gevşeme gruplarında olumsuz '
      'duyguyla birlikte gitti (Khasky & Smith 1999; güvenlik dosyası §2, ikinci turda yeniden doğrulanmadı; PMID 10483629, '
      'DOI 10.2466/pms.1999.88.2.409). "Neredeyse ağırlıksız" bu yüzden yok; hafiflik zeminle birlikte söylenir: %s (S13, '
      'P-S9).' % Q(F, 'c3.nefeskadar'))
    a('- **Göz kökeni.** Gözler hiçbir yerde zorlanmaz: %s Nefeste: "…gözlerini açmak da olur."; içten saymada: "Gözlerin '
      'açık kalsa da olur"; imgeden önce: "Gözlerin açıksa bakışın serbest." (G2-13: açık gözün bakışı hiçbir yerde bir '
      'noktaya bağlı kalmaz); imgelemede: "gözlerin açık kalsa da" ve pencerenin duyurusunda "İstediğin an gözlerini '
      'açabilirsin." Dolaşımda yalnız "göz kapakları" ve "gözlerin çevresi" geçer; göze bastırma ve avuçlama yoktur. '
      'Dönüşte gözler "ışığa alıştıra alıştıra" açılır; şafak görselinin parlaklığı sınırlıdır ve en az 60 sn\'de '
      'yükselir (S18).' % Q(F, 'a.gozler'))
    a('')


# ---------------------------------------------------------------------------------------------- §2
def part_2(L, F, a):
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
    a('Sonuç: TTS içindeki duraklamalar sese göre dört kat değişiyor. Bu yüzden zamanlama iki duraklama profiliyle '
      'hesaplandı; hızı duyulması gereken diziler (beden noktaları, sayılar, zıtlık listeleri) taşıyıcı cümle içinde '
      'üretilip kesilen mikro-kliplerdir ve aralarındaki sessizliği uygulama koyar (CRITIQUE #12).')
    a('')
    a('### 2.2 Model (VARSAYIM)')
    a('')
    a('`klip süresi = hece ÷ eklemleme + klip içi noktalama duraklamaları + uç payı`')
    a('')
    a('- Eklemleme hızları: 5,2 (REST speed≈0,8; tahmin), 5,6 (v4, ölçüm), 6,6 (v2 varsayılan, ölçüm).')
    a('- Duraklama profilleri (sn): **düşük** = Neslihan v2 en kısa gözlenen (cümle 0,17 · virgül 0,05 · iki nokta ya da '
      'noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2\'de '
      '(speed 0,8) duraklamalar ×1,25 alındı.')
    a('- Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2), mikro-klip 0,15 sn (ilk üretimde ölçülüp '
      'değişecek; Z2-07). Taşıyıcının ön sözü (ör. "sayıyorum:") kesilip atılır, süreye girmez.')
    periods = {}
    for b in L['blocks']:
        for c in b['clips']:
            if c.get('onsetPeriod'):
                key = (c['onsetPeriod']['min'], c['onsetPeriod']['pref'], c['onsetPeriod']['max'])
                periods.setdefault(key, set()).add(c['tags'].get('section') or c.get('fillGroup') or b['id'])
    labels = {'sag': 'beden noktaları', 'sol': 'beden noktaları', 'sirt': 'beden noktaları', 'on': 'beden noktaları',
              'butun': 'bütün-beden doruğu', 'temas': 'temas turu', 'sayi5': 'sayılar', 'sayi10': 'sayılar',
              'C3': 'zıtlık öğeleri', 'x.agir2': 'zıtlık öğeleri', 'x.hafif2': 'zıtlık öğeleri', 'x.sicak': 'zıtlık öğeleri',
              'x.serin': 'zıtlık öğeleri'}
    pl = []
    for key, secs in sorted(periods.items()):
        names = sorted({labels.get(s, s) for s in secs})
        pl.append('%s %s / %s / %s' % (', '.join(names), n(key[0]), n(key[1]), n(key[2])))
    a('- **Mikro-liste ritmi (L2-08, Z2-07):** beden noktaları, sayılar ve zıtlık listeleri "klipten sonra sessizlik" '
      'ile değil, **başlangıçtan başlangıca periyotla** (`onsetPeriod`) çalar: sessizlik = periyot − klibin gerçek '
      'süresi, en az %s sn (`gapFloor`). Böylece "diz…" ile "Sağ elin başparmağı…" aynı ritimle gelir. Periyotlar (sn, '
      'min / pref / max; VARSAYIM): %s. Bölüm sonu öğeleri ("ayak tabanı…", "omurga, boydan boya…", "bir.") bilinçli '
      'durak olarak sabit sessizlik taşır. Periyotlu kliplerde json\'daki `gapAfter` yalnız 5,6 hece/sn tahminidir '
      '(`gapFromPeriod: true`); motor sessizliği gerçek `voice.sec` ile yeniden hesaplar.' % (
          n(timing.GAP_FLOOR), '; '.join(pl)))
    a('- Hece sayısı kodla sayılır: Türkçe ünlüler a e ı i o ö u ü â î û. Dönüşümlü seçenek metinleri (P-N5) ve sahne '
      'metinleri (H6) ayrıca sayılır; her seçenek ve sahne takımı 78 vakanın hepsinde ayrıca denenir.')
    a('')
    a('### 2.3 Planlayıcı (PLAN §B.3\'ün kesin hali; `lib/yoga.js` bunu aynen uygular)')
    a('')
    a('1. **Tek kapak (T4).** Varış ve Kapanış birer bloktur. Zorunlu kapak klipleri her sürede çalar; eskiden yalnız '
      '"uzun kapak"ta olan klipler (konfor, kıpırdanma, ağırlık, kontrol cümlesi, sesler, çevre ayrıntısı, zaman ve yer, '
      'yan tarafta dinlenme) çekirdekteki isteğe bağlılar gibi sıralı artımdır. Kapanışın bütün sessizlikleri ve '
      'Varış\'ın eylem payları (uzanma, konfor, gözler, kıpırdanma, ağırlık) **sıkıştırılmaz** (min = pref); Varış\'ın '
      'eylemsiz cümlelerinden (karşılama, açılış, kontrol, izin, huzursuzluk) sonraki nefes payları min..pref arasında '
      'esner.')
    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2) zorunlu klipleriyle (`minTarget`\'i dolanlar dahil: "%s" 7 '
      'dakikadan). Köprü `br.k2` C2\'nin hemen ardından, **yalnız C3 ya da C4 seçiliyse** (`requiresAnyBlock`; H3); köprü '
      '`br.orta` C4\'ün olduğu her sürümde C4\'ün hemen önünde (S1). Taban en kısa haliyle de sığmazsa, yalnız acil durum '
      'yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu yol hiçbir vakada kullanılmadı.' % T(F, 'c2.kal'))
    ent = L['planner']['entryRanks']
    a('3. **Artım listesi.** Tek sıralı liste: P2..P5 blokların girişi (`entryRank`: C4 %d, C3 %d, C5 %d; C3 bu turda '
      '500\'den C4\'ün hemen ardına alındı, H13) ile isteğe bağlı klip "dalgaları" (`fillRank` 85–720) birlikte '
      'ilerler; genişletmeler (`fillRank` >= 1000) bütün isteğe bağlılardan sonra gelir. Bir artım, sessizlikler pref '
      'değerindeyken hedefe sığıyorsa eklenir. **T5:** mevcut içerik sessizlikler pref→max yolunun yarısına '
      'esnetildiğinde bile hedefe yetmiyorsa (f = 0,5), artım sessizlikleri pref→min yolunun en çok yarısına sıkıştırarak '
      'sığıyorsa yine eklenir. İlk sığmayan artımda durulur (önek kuralı). Önek kuralı gereği süre bir dakika artınca '
      'plan yalnız büyür: plan(T) ⊆ plan(T+1) (her vakada denetlendi). Aynı `fillGroup`taki klipler birlikte girer; sağ '
      've sol aynı grupta olduğu için dolaşım hep simetriktir. Sayım ya beşten ya ondan başlar (altı..on tek grup). Kural '
      'belirlenimcidir (CRITIQUE #30).' % (ent['C4'], ent['C3'], ent['C5']))
    a('4. **Sessizlik.** Kalan süre min..pref aralığındaysa bütün sessizlikler (ve mikro-listelerin periyotları) aynı '
      'oranla min\'den pref\'e, pref..max aralığındaysa pref\'ten max\'a esner. Bağlı çiftlerde (`pairWith`) ortak klip '
      'hemen ardından çalıyorsa aradaki boşluk kısa `pairGap`tir; kazanılan süre çiftin ardındaki uzun boşluğa kalır '
      '(P-S6). Toplam hedefe tam eşittir. Kalan süre max toplamını aşarsa bu bir içerik hatasıdır; sessizlik sınırı '
      'aşılarak kapatılmaz (CRITIQUE #3). Konuşma klipleri asla hızlandırılmaz ya da kırpılmaz.')
    a('')
    a('### 2.4 Denetimler (`timing.py`; her vaka iki duraklama profilinde)')
    a('')
    a('- **Görevdekiler:** (a) toplam = hedef ±1 sn; (b) Varış ve Kapanış eksiksiz; (c) üst üste binme yok; (d) hiçbir '
      'sessizlik sınırını aşmıyor ve min\'in altına inmiyor (pencere <= 90 sn); (e) son 60 sn\'de yeni imge, çağrışım, zor '
      'blok ya da pencere yok; (f) bütün P1 bloklar her sürede; (g) yoğunluk: herhangi bir 60 sn\'de <= 150 hece ve <= %60 '
      'konuşma, tamamen "Derin" evredeki 60 sn\'de <= 110 hece ve <= %45 konuşma, plan ortalaması 40–130 hece/dk, '
      'duyurulmamış konuşmasız 60 sn yok (eşikler VARSAYIM; bu turda da gevşetilmedi, aşan yerde metin ve boşluk '
      'düzeltildi).')
    a('- **Usta hoca ve güvenlik (1. ve 2. tur):** anahtar cümle 1-2-3 (C3 ya da C4 yoksa 1-3) sırayla ve giderek kısa; '
      'dolaşım sırası sağ → sol → arka → ön → bütün; kapanış ritüeli sırası (… otur → bekle → kalk); C4 varsa önünde '
      '`br.orta` ve `c4.patika` klibinden önceki 60 sn\'de gözleri açma seçeneği (P-B2); >= 20 dk\'da ortada hatırlatma; '
      'her pencere duyurulmuş ve karşılanmış; her blokta >= 5 sn sessizlik ve planda en uzun boşluk >= 8 sn; dolgu '
      'sözcükleri 60 sn içinde ikinci kez yok; 6,6\'da her klip <= 15 sn; "birkaç nefes" ya da "nefes … kal" isteyen '
      'klipten sonra >= 10 sn (T1); sayıların başlangıçları arası 4–6,5 sn (T3, T8-3); duyurulmuş pencereden önceki 60 '
      'sn\'de konuşma payı >= %10 (T3); pencere içermeyen her 180 sn\'de konuşma payı >= %12 (T8-4); doku koşusu <= 300 sn '
      '10 dakika ve üstünde (T8-5, P-S5); Derin evrede en çok 6 ardışık cümle boşluğu birbirine 2 sn\'den yakın (P-S6); '
      'şafak 60–90 sn (N8, S18); art arda en çok 3 cümle "-(y)abilir(sin)" ile biter (T18); **dakikalar arası:** plan(T) ⊆ '
      'plan(T+1) (T4, T8-1), içerik doymadan hiçbir dakikada esneme f > 0,6 yok (T5), 30:00\'da f <= 0,30 (T2).')
    a('- **3. tur ekleri:** "-(y)abil-" cümlenin her yerinde sayılır: herhangi bir 60 sn\'de en çok 3 (TR2-03); 5 '
      'dakikada cümle klibi başına ortalama bilgi olarak yazılır (hedef <= 0,6; H11). `c2.dikkat` nefes dışı dayanak '
      'taşır ve ondan önceki 60 sn içinde (kendisi dahil) gözleri açma seçeneği vardır (G2-01). Her pencere duyurusu bir '
      'kapı taşır (G2-02). Kalkış adımını taşıyan klip baş dönmesi satırını da taşır, "Kapanışa geç" dizisinde de '
      '(G2-04). T1, "Kapanışa geç" ve Durdur dizilerine de uygulanır; dizinin son klibi muaftır, çünkü ses orada biter ve '
      'bekleme ekranla sürer (G2-05, Z2-01). Hassas bölge öğeleri (göğüs, karın, kalça) listenin medyan periyodundan '
      'uzun durak almaz (G2-06). Bir mikro-listede başlangıç periyotlarının yayılımı <= 0,6 sn (L2-08). Çekirdek blok '
      '>= 55 sn, niyet bloğu >= 20 sn; 5 dakikada (hedef < 6 dk) C2 >= 30 ve N2 >= 18 sn (H1; sahibe görünür değişiklik, '
      '§7). C4 varsa `c4.don` klibinden önce en az iki görme dışı duyu klibi (H2). Anahtar cümle geçişleri arası üç '
      'geçişte >= 90, iki geçişte >= 60 sn (H3). C4 varsa `br.orta` klibinden önce Varış ya da C1\'de bir "zemin" '
      'klibi (H5). Her planda ortalama hece/cümle Derin < Derinleşme < Varış (H12). Tırnak içindeki nokta cümlenin '
      'ortasında olamaz (L2-11). 20 dakikadan itibaren en çok bir ardışık "düzlük" dakikası (T2, Z2-04; içten sayma '
      'grubu 60 sn\'den uzun olduğu için tek düzlük kaçınılmaz). 5 dakikanın 5,2 yüksek köşesinde boş pay >= 15 sn '
      'artık bir denetimdir (T6, Z2-04).')
    a('- **Metin:** yasak sözcükler (PLAN C.6 + uyku izni) ve E12\'nin bildirimsel etki vaadi kökleri; **3. turda muafiyet '
      'yok** (anahtar cümleler ve son cümle de denetlenir; G2-08, EV2-01) ve "dinlenmiş", "iz bırak", "kalacak" kökleri '
      'eklendi (EV2-01, -02, -03); İngilizce; Sanskritçe her terim en çok bir kez; cümle <= 14 sözcük; klip 1–3 cümle; '
      'emir kipi yalnız güvenlik etiketli kliplerde; blokta en çok bir açıklama cümlesi; duraklamalar dahil hiçbir klip '
      '2,5 hece/sn\'nin altında değil; taşıyıcı hece sayıları kliplerle tutarlı; seçenek ve sahne metinleri de aynı '
      'kurallarla; "Kapanışa geç" 60–95 sn ve Durdur dönüşü 20–30 sn; Derin evre cümle kliplerinin iç hızı (aşağıda).')
    a('- **Tekrar uyarısı (L2-14):** 10 sn içindeki ya da ardışık cümle kliplerinde aynı 5 harflik kök ve "dön" gibi '
      'duyulan kısa kökler; bilinçli tekrarlar klipte etiketlidir. Bu turda uyarı: %s.' % (
          'yok' if [x.strip() for x in F['reps']] in ([], ['yok']) else '; '.join(x.strip() for x in F['reps'])))
    a('')
    a('### 2.5 Sonuç (timing.out.txt\'ten)')
    a('')
    a('```')
    for line in F['summ']:
        a(line.rstrip())
    for line in F['variants']:
        a(line.rstrip())
    a('```')
    a('')
    a('**Bu sonucun kapsamı (P-S1):** 78/78 zamanlama ve metin kurallarının sonucudur; dinleme sınavı değildir. Derin evre '
      'cümle kliplerinin iç hızı (hece ÷ klip süresi, klip içi duraklamalar dahil) ayrıca ölçüldü ve bir tasarım '
      'tavanıyla karşılaştırıldı: **Derin evre iç hız tavanı (VARSAYIM; kanıta dayanmaz)**, <= 5,0 hece/sn (EV2-04):')
    a('')
    for line in F['rate_lines']:
        ln = line.replace('Derin cümle iç hızı ', '')
        ln = re.sub(r'→ .*?((?:medyan )?tavanın (?:altında|üstünde))', r'→ \1', ln)
        ln = re.sub(r'^(\d\.\d) lo', r'\1 düşük', re.sub(r'^(\d\.\d) hi', r'\1 yüksek', ln))
        a('- ' + re.sub(r'(\d)\.(\d)', r'\1,\2', ln))
    a('')
    a('Okuma (medyana göre): yol A (REST, hız 0,80 ≈ 5,2) yüksek duraklamalı seste tavanın altında, düşük duraklamalı '
      'seste tavanın hemen üstündedir; en hızlı klipler her yolda tavanın üstündedir; 6,6 hece/sn\'deki v2 varsayılan '
      'okuma (MCP yolu) hiçbir profilde tavanın altına inmez. Bu, yol '
      'kararına (PLAN §G5) bir girdi olarak yazıldı; bir kanıt eşiği değildir. teslim S4\'ün 2,5–3,0 hece/sn bandını '
      '(VARSAYIM) hiçbir yol karşılamaz; bu bant ancak sözcük uzatarak tutulabilir, bu da S3 ve Shuminsky 2026 yönüne '
      'aykırıdır. Yaşlı dinleyiciye uygunluk kör panelde (CRITIQUE #22, 65+ üye) dinlenerek sınanacak. Üç nokta yalnız '
      'listelerde kaldı: cümle içine duraklama eklemek için üç nokta kullanmak PLAN C.2\'ye ve anahtar cümle kuralına '
      'aykırıdır (P-S1 madde 3 bu yüzden uygulanmadı).')
    a('')
    a('**Sarsıntı taraması (Z2-04; bilgi, sonucu değiştirmez).** Bütün klip süreleri birlikte ölçeklenip 78 vaka yeniden '
      'kuruldu:')
    a('')
    a('```')
    for line in F['perturb']:
        a(line.rstrip())
    a('```')
    a('')
    a('Okuma: ölçülen sayılar "#" ile gösterildi; parantez içinde düşen vaka sayısı ve ilk üç vaka. En hassas yerler: '
      '6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik yoğunluk sınırı (süreler %5–10 kısa çıkarsa), 5,2 yüksek köşesinin 5 '
      'dakikalık boş payı ve 15. dakika çevresindeki C4 girişi (süreler %5–10 uzun çıkarsa). Gerçek `voice.sec` değerleri '
      'gelince `timing.py` aynı denetimlerle yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar '
      'ayarlanır (§7).')
    a('')
    a('Paylar:')
    a('')
    a('| hız | profil | 5 dk: min sessizliklere göre boş pay | 30 dk: konuşma payı | 30 dk: esneme f | 30 dk: hece |')
    a('|---|---|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            a('| %s | %s | %s sn | %%%s | %s | %d |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek', r1(F['slack5'][(rate, prof)]),
                r1(100 * F['share30'][(rate, prof)]), n(round(F['stretch30'][(rate, prof)], 2)),
                F['syl30'][(rate, prof)]))
    a('')
    old = F['old']
    miss_fast = F['miss30'][(6.6, 'lo')]
    a('En dar yer 5 dakikanın en yavaş ucudur (5,2 hece/sn + Hakan duraklamaları ×1,25): %s sn boş pay kalır (T6: en az '
      '15 sn; bu turda denetim). 30:00\'da sessizlikler pref\'ten max\'a doğru en çok %%%d esner (T2: <= %%30); içerik 20. '
      'dakikadan 30. dakikaya kadar en çok bir dakikalık düzlükle büyür. Bütün metin (isteğe bağlı ve genişletmelerle) %d '
      'hecedir (%s); en hızlı seste (6,6, düşük) 30. dakikada %s; yavaş seste zıtlık ve tanıklık genişletmelerinin bir '
      'kısmı 30 dakikaya sığmaz.%s' % (
          r1(F['slack5'][(5.2, 'hi')]), round(100 * max(F['stretch30'].values())), F['full_syl'],
          ', '.join('%s. turda %d' % (k, v['full_syl']) for k, v in sorted(old.items())) or '—',
          ('%s dışında bütün metin çalar' % ', '.join('`%s`' % i for i in miss_fast)) if miss_fast
          else 'bütün metin çalar',
          (' %s hiçbir modellenmiş vakada çalmaz: sıranın sonundaki yedek genişletmedir, klip süreleri kısa çıkarsa '
           'girer.' % ', '.join('`%s`' % i for i in F['never'])) if F['never'] else ''))
    a('')
    a('**Metin bütçesi bu ders için bilinçli olarak PLAN B.4.1\'in altındadır (S12-hoca).** PLAN B.4.1, tam metnin hızlı '
      'seste orta konuşma payına (≈ %%36) ulaşmasını ister; bu derste 30 dakikanın konuşma payı %%%s–%%%s\'%s. Nedeni: yoga '
      'nidranın derin evresi sessizlikle çalışır (PLAN B.4.1\'in kendi "derin blok" bandı %%8–20), üç duyurulmuş pencere '
      'vardır ve derin evredeki 60 sn\'lik yoğunluk sınırı (<= 110 hece) daha çok söze izin vermez. Sessizlik doldurulmadı: '
      'içerik büyür ve 30:00\'da esneme %%%d\'%s geçmez (T2). PLAN B.4.1\'de bu ders için not var.' % (
          r1(100 * min(F['share30'].values())), r1(100 * max(F['share30'].values())),
          ek4(son_okunan(r1(100 * max(F['share30'].values()))), 'dir'),
          round(100 * max(F['stretch30'].values())),
          ek4(son_okunan(round(100 * max(F['stretch30'].values()))), 'i')))
    a('')


# ---------------------------------------------------------------------------------------------- §3
def intro(F, L):
    IN = F['in']
    return {
        'A': 'Sabit kapak; tek blok (T4). 5 dakikada: karşılama, derse özgü açılış, duruş, gözler, ortak çıkış cümlesi ve '
             '"Gevşemek her zaman kolay olmaz" (S2, B6, P-B1). Süre arttıkça ağırlığın zemine bırakılışı (%s. dakikadan; '
             'H5: dersin dayanak sözcüğü "zemin" imgeden önce kurulur), kontrol cümlesi, konfor ve kıpırdanıp yerleşme '
             'eklenir; hiçbiri sonra düşmez. Sıra (H17, T33, N6): duruş → konfor → gözler → kıpırdanma → ağırlık → kontrol '
             '→ çıkış cümlesi → huzursuzluk; gözler ikinci işarettir ve "gözlerini açabilir" cümlesi gözlerin seçiminden '
             'sonra gelir. Çıkış cümlesinin üç "-(y)abil-"i çevresinde başka "-(y)abil-" yoktur (TR2-03): duruş "-man '
             'yeterli", gözler "sana kalmış", ağırlık isim cümlesi, kontrol şimdiki zaman, huzursuzluk geniş zaman. Konfor '
             'cümlesi, başlamadan önce gösterilen hazırlık kartındaki örtü ve yastığın elinin altında olduğunu varsayar '
             '(P-S13).' % rng(IN['a.agirlik']),
        'N1': 'P1. Niyet başta. Seçim ve hazır cümle tek klipte (H1 b); seçme süresi klibin ardındaki sessizliktir. '
              'Rehberlik şimdiki zamanla ("seçiyorsun", "söylüyorsun"; H11). Hazır cümle: "Kendime dinlenme izni '
              'veriyorum." (TR2-04). Niyetin kalıcılığı için güvence yok (EV2-03). "Sankalpa" sözcüğü seste yok, bölüm '
              'adında ekranda (PLAN C.7).',
        'C1': 'P1. Beden dolaşımı. Çerçeve iki kısa cümledir ve atlama kapısını güvenlik gereği emir kipiyle açar ("onu '
              'atla"; güvenlik §11.B-1, -9). En kısa sürümde her taraf 4 nokta (başparmak, omuz, diz, ayak tabanı), sırt '
              '1 (omurga), ön 3 noktadır (alın, göz kapakları, göğüs; L2-08 gereği çene kısa listeden çıktı). Süre '
              'arttıkça önce parmaklar, sonra bacak, el ve kolun tamamı, sırt ve yüz girer; sağ ve sol aynı grupta. Sırtın '
              've önün uzun listesi girdiğinde önüne bir bölge işareti gelir (%s. ve %s. dakikadan; L2-09). Bütün öğeler '
              'başlangıçtan başlangıca '
              'aynı periyotla gelir (L2-08). Kalça, göğüs ve karın hassas bölgelerdir: tek adla ve komşularıyla aynı '
              'periyotta geçer (G2-06). Sağ ile sol arasındaki cümle (%s. dakikadan) hem listeyi böler hem kaçırılan adı '
              'bağışlar (P-S5). Genişletme: zemine değen noktalar, bütün-beden doruğundan önce (H16; %s. dakikadan). Önceki '
              'turların "aynı '
              'yoldan kısa ikinci tur" genişletmesi çıkarıldı: sıranın en sonundaydı, bu turda hiçbir vakada 30 dakikaya '
              'sığmıyordu ve 30 dakikanın en uzun liste dokusunu daha da uzatırdı (L2-09).' % (
                  rng(IN['c1.gecis.arka']), rng(IN['c1.gecis.on']), rng(IN['c1.kacirma']), rng(IN['c1.x01'])),
        'C2': 'P1. Nefes önce değiştirilmeden izlenir; aynı klipte nefes dışı kapı vardır: eller ya da açık gözler (G2-01, '
              'L2-01). %s. dakikadan itibaren nefesle kalana nefesin yeri, ellerle kalana avuçlar ayrı ayrı söylenir '
              '(TR2-12, H7). 5–6 dakikada C2 = dikkat → akış; "hiçbir şey yapmadan" dinlenme 7. dakikadan (H1 a: açılış '
              'cümlesine geri çağrı). Sayım önce beşten, süre arttıkça ondan başlar (girdiği dakikalar §0\'da); sayılar '
              'başlangıçtan başlangıca 5,8–6,3 sn arayla gelir ve nefese hız dayatmaz (Z2-07). İçten sayma penceresinin '
              'duyurusu bir kapı taşır ("Gözlerin açık kalsa da olur"; G2-02); pencereden dönünce sayılar hemen bırakılır '
              '(H7). "Fark ettiğin an…" cümlesi Ders 5\'in anahtar cümlesidir, burada yoktur (B1).' % rng(IN['c2.alt']),
        'BR.K2': 'Köprü: yalnız zıtlık (C3) ya da imgeleme (C4) seçiliyse, C2\'nin hemen ardından çalar (H3); iki anahtar '
                 'cümle arasında her zaman bir blok olsun diye. Anahtar cümlenin 2. geçişi derin evrenin başında '
                 'uyanıklığı hatırlatır; durum iddiası yoktur (G2-08).',
        'C3': 'P3. Zıtlık çiftleri bedende hissedilir. Çekirdek (ağırlık / hafiflik) C4\'ün hemen ardından sıraya girer '
              '(giriş sırası %d; H13), böylece varsayılan %d dakikalık sürümde de vardır; sıcaklık / serinlik ikinci '
              'dalgadır. Blok bir çıkış kapısıyla açılır ("İstemezsen bu bölümü atlayıp zemini hissedebilirsin"; TR2-22: '
              'atlama fiili C1 ile aynı) ve bırakmayla kapanır ("Beden kendi hâlinde."; EV2-05). Ağırlığı hissetmeyen '
              'dinleyici bağışlanır (L2-05). İki zıttın aynı anda hissedilmesi (nidranın tanımlayıcı adımı) isteğe bağlı '
              'katmandadır. Sınama telkini yoktur. Müzik yatağı burada incelir (L2-13).' % (
                  L['planner']['entryRanks']['C3'], L['defaultMinutes']),
        'BR.orta': 'Köprü: imgeleme olan her sürümde C4\'ün hemen önünde (S1). Üç şeyi birlikte söyler: ortak çıkış '
                   'cümlesinin ortadaki hatırlatması (güvenlik §11.B-3; "dersi bitirmek", G2-03), açık gözün bakışını '
                   'serbest bırakan cümle (G2-13) ve zor bir anı öngörmeden kurulan tarafsız dayanak (L2-06; güvenlik '
                   '§11.B-8). "Hatırlatayım:" yok (H12, L2-06).',
        'C4': 'P2. Dersin tek imge yayı; sahne seçiciye bağlıdır (§1.3). Önünde her sürümde `br.orta` çalar (S1, B5, E9). '
              'En kısa hali bile bir ses ve bir sıcaklık ayrıntısı taşır (H2); ayak tabanları hemen ardından, dinlenme '
              'yeri daha sonra girer. Sessiz pencerenin duyurusu kapıyı "zor gelirse" demeden taşır (H15, TR2-16). Işıkla '
              'gölge cümlesi pencereden sonra gelir; dönüş patikanın başında biter, odaya erken dönülmez (H14, TR2-11). '
              'Duyu cümleleri çiftler hâlinde ve farklı boşluklarla gelir (S7-hoca, P-S6). Müzik "imge" dokusuna geçer, '
              'doğa katmanı sahneyi izler (L2-03, L2-13).',
        'C5': 'P5. Tanıklık; yalnız C4 varken girer. Tanıklık bedene ve zemine bağlanır (`c5.beden` artık zorunlu: en kısa '
              'C5 de >= 55 sn; H1/B.3-8); imgedeki sese tek geri çağrı `c5.dusunce` klibidir (sahneye göre). Sesler ve '
              'düşünceler Ders 5\'in, izleyen farkındalık Ders 9\'un içeriğidir (S5-hoca). Pencere önce davet eder, sonra '
              'öznesi olan kapıyı söyler, en son dönüş sözünü verir (TR2-10, L2-07, H12). Müzik "tanıklık" dokusuna geçer '
              '(L2-13).',
        'N2': 'P1. Niyetin tekrarı; son duyulan şey niyetin kendisidir ve tırnak içindeki nokta cümlenin sonundadır (TR2-05, '
              'H10, L2-11). Niyet seçmemiş ya da unutmuş dinleyiciye hazır cümle de hatırlatılır (P-S11). Bedende iz '
              'iddiası yok (EV2-02); dilek günün saatinden bağımsız (L2-17).',
        'K': 'Sabit kapak; tek blok (T4). Gündüz dönüşü, uyku izni yok. Her sürümde: anahtar cümle 3 → 5–9 sn sessizlik '
             '(ses rampası) → dönüş (dönüş tınısıyla) → nefes → parmaklar ve gerinme → gözler ve çevre → yana dönme → oturma '
             '→ bekleme → kalkış ve son cümle. Süre arttıkça sesler, çevre ayrıntısı, zaman ve yer, yan tarafta dinlenme '
             'eklenir. Eylem payları sıkıştırılmaz (B2, T1, S4); iki eylem isteyen göz cümlesine 9 sn (Z2-05), "bir süre" '
             'yan yatmaya 12 sn (Z2-03). Oda varsayımı yok: "çevrende", "Yakındaki ve uzaktaki sesler" (G2-12). Her '
             'hareket ve kalkış baş dönmesi satırıyla gelir (G2-04, G2-07).',
    }


def part_3(L, F, a):
    bm = F['bm']
    INTRO = intro(F, L)
    a('## 3. Metin')
    a('')
    a('Okuma: **tür** zorunlu / isteğe bağlı / genişletme; **sessizlik** klipten sonra, sn (min / pref / max; "pencere" = '
      'duyurulmuş sessiz pencere; "başlangıç periyodu" = mikro-listede bir öğenin başından bir sonrakinin başına, '
      'sessizlik = periyot − süre); **ipucu** görsel, müzik ve doğa olayları, sayı ve ses kazancı; **evre** ses ayarı ve '
      'karışım evresi. Kliplerde `…` taşıyıcıdan kesilen öğenin liste ezgisini gösterir. Taşıyıcılar TTS\'e tek istek '
      'olarak gider ve üç nokta duraklarından kesilir (öğe sayısı tutmazsa kesimi insan onaylar). Sahneye özgü metinler '
      'klip notlarında ve §1.3\'teki tablodadır.')
    a('')
    for bid in ['A', 'N1', 'C1', 'C2', 'BR.K2', 'C3', 'BR.orta', 'C4', 'C5', 'N2', 'K']:
        b = bm[bid]
        meta = 'tür `%s`' % b['kind']
        if b['kind'] == 'core':
            meta += ' · öncelik P%d · çalma sırası %d' % (b['priority'], b['playOrder'])
            if b.get('entryRank'):
                meta += ' · giriş sırası %d' % b['entryRank']
            if b.get('requiresBlocks'):
                meta += ' · gerekir: %s' % ', '.join(b['requiresBlocks'])
        if b.get('placement'):
            pl = b['placement']
            meta += (' · yer: `%s` bloğundan hemen önce' % pl['before']) if pl.get('before') else (
                ' · yer: `%s` bloğunun hemen ardından' % pl['after'])
        if b.get('requiresAnyBlock'):
            meta += ' · yalnız şu bloklardan biri varsa: %s' % ', '.join(b['requiresAnyBlock'])
        a('### %s · %s' % (bid, b['title']))
        a('')
        a('%s. %s' % (meta, INTRO.get(bid, '')))
        a('')
        cids = sorted({c['carrier']['id'] for c in b['clips'] if c.get('carrier')},
                      key=lambda x: [car['id'] for car in L['carriers']].index(x))
        if cids:
            a('Taşıyıcılar (CRITIQUE #12; T17: sayı taşıyıcısında atılan küçük harfli ön söz):')
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
    qc, sr = F['qc'], F['sr']
    for key_ in ('quickClosing', 'stopReturn'):
        ex = L['extras'][key_]
        a('### %s · %s' % (ex['id'], ex['title']))
        a('')
        if key_ == 'quickClosing':
            a('"Kapanışa geç" düğmesi: o anki klip biter, motor müziği kapanış evresine geçirir ve şafak görselini başlatır, '
              'sonra bu dizi çalar. Düğmenin kendisi geçiş olduğu için "Artık dönüş zamanı." burada yoktur. Çevreye bakma '
              '(yönelim) adımı vardır (S10). Bekleme ve kalkış kısaltılmaz; güvenlik satırları (G2-04, G2-07) ve iki '
              'eylemli göz cümlesinin payı (Z2-05) eklendiği için süre PLAN B.5\'teki 45–60 sn\'ye değil, 60–95 sn\'ye '
              'sığar (PLAN B.5 buna göre güncellendi). Klipler Kapanış\'takilerin aynısıdır; yeni ses üretilmez. Süre '
              '(pref) 5,2–6,6 hece/sn\'de %s–%s sn (denetlendi).' % (r1(min(qc)), r1(max(qc))))
        else:
            kalk = next(c for c in ex['clips'] if c['id'] == 'd.kalk')
            a('"Durdur (X)" sonrası isteğe bağlı sesli dönüş (güvenlik §11.D-4). İlk iki cümle durdurma ekranındaki '
              'metnin aynısıdır. Emir kipi güvenlik gereği kullanılır. Yana dönüp oturmaya %s sn verilir (Z2-01); ses '
              'dinleyici otururken biter ("%s"; G2-05) ve bekleme ekran metniyle sessizce sürer. Süre %s–%s sn.' % (
                  n(kalk['gapAfter']['min']), T(F, 'd.bekle'), r1(min(sr)), r1(max(sr))))
        a('')
        a('| id | metin | sessizlik sonra (sn) |')
        a('|---|---|---|')
        for c in ex['clips']:
            a('| `%s` | %s | %s |' % (c['id'], c['text'], n(c['gapAfter']['pref'])))
        a('')


# ---------------------------------------------------------------------------------------------- §4
def part_4(L, F, a):
    plans = F['plans']
    ref = F['ref5']
    a('## 4. Sürümler')
    a('')
    a('### 4.1 5 dakika · tam metin (5,6 hece/sn, yüksek duraklama; sessizlik kipi %s %s)' % (ref['mode'], n(round(ref['f'], 2))))
    a('')
    a(timeline(ref))
    a('')
    a('### 4.2 Blok süreleri ve kapak–çekirdek payı (her hız ve profil; Z2-06)')
    a('')
    a('| hız | profil | 5 dk: blok süreleri | 30 dk: blok süreleri |')
    a('|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            a('| %s | %s | %s | %s |' % (n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                                         plan_blocks_line(plans[(rate, prof, 5)]),
                                         plan_blocks_line(plans[(rate, prof, 30)])))
    a('')
    a('Kapak ve çekirdek payı (sn: Varış / niyet N1+N2 / çekirdek C1..C5 ve köprüler / Kapanış):')
    a('')
    a('| dk | ' + ' | '.join('%s %s' % (n(r), 'düşük' if pr == 'lo' else 'yüksek') for r in timing.RATES
                           for pr in ('lo', 'hi')) + ' |')
    a('|---|' + '---|' * 6)
    for m in (5, 10, 15, 20, 30):
        a('| %d | %s |' % (m, ' | '.join('%.0f / %.0f / %.0f / %.0f' % F['split'][m][(r, pr)]
                                          for r in timing.RATES for pr in ('lo', 'hi'))))
    a('')
    s5 = list(F['split'][5].values())
    a('5 dakikada güvenlik §11.D-1\'in önerisi yaklaşık 45 sn yerleşme, 3 dk çekirdek ve 75 sn kapanıştır (tasarım '
      'çıkarımı, doğrulanmadı). Bu derste Varış %s sn, niyet %s sn, çekirdek (C1 + C2) %s sn, Kapanış %s sn\'dir: '
      'kapanış önerinin %s sn üstündedir, çünkü kalkış payları sıkıştırılmaz (B2, T1, E7) ve baş dönmesi satırları '
      'eklendi (G2-04, G2-07). Bu sahip kararıdır (§7).' % (
          span([x[0] for x in s5]), span([x[1] for x in s5]), span([x[2] for x in s5]), span([x[3] for x in s5]),
          span([x[3] - 75 for x in s5])))
    a('')
    a('### 4.3 Blokların ve pencerelerin girdiği dakika')
    a('')
    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 tanıklık | imge penceresi | ilk genişletme | bütün içerik |')
    a('|---|---|---|---|---|---|---|---|')
    allc = F['allc']
    ext_ids = {i for i, (_, c) in allc.items() if c['tier'] == 'extension'}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            def first(fn):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        return '%d dk' % m
                return '—'
            a('| %s | %s | %s | %s | %s | %s | %s | %s |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                first(lambda p: 'C4' in p['sel']), first(lambda p: 'C3' in p['sel']), first(lambda p: 'C5' in p['sel']),
                first(lambda p: 'c4.pencere' in p['inc']), first(lambda p: bool(p['inc'] & ext_ids)),
                first(lambda p: p['stop'] is None)))
    a('')
    a('"Bütün içerik" sütununda "—": sıradaki son genişletmeler hiçbir sürede 30 dakikaya sığmıyor (§2.5).')
    a('')
    a('### 4.4 İçeriğin dakikalara göre büyümesi (5,6 hece/sn, yüksek duraklama)')
    a('')
    a('| dk | bloklar | klip | hece | konuşma payı | sessizlik kipi | pencereler (sn) |')
    a('|---|---|---|---|---|---|---|')
    for m in range(5, 31):
        p = plans[(5.6, 'hi', m)]
        wins = ', '.join(n(round(ev['gap'])) for ev in p['events'] if ev['clip'].get('window')) or '—'
        a('| %d | %s | %d | %d | %%%s | %s %s | %s |' % (
            m, ' '.join(b for b in block_order(p) if b not in ('A', 'K')), len(p['events']),
            sum(ev['clip']['syllables'] for ev in p['events']), r1(100 * p['speech'] / p['total']),
            p['mode'], n(round(p['f'], 2)), wins))
    a('')
    lost = []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            for m in range(6, 31):
                x = {ev['clip']['id'] for ev in plans[(rate, prof, m - 1)]['events']}
                y = {ev['clip']['id'] for ev in plans[(rate, prof, m)]['events']}
                if x - y:
                    lost.append('%s/%s %d→%d' % (n(rate), prof, m - 1, m))
    a('Süre bir dakika artınca hiçbir klip düşüyor mu? %s (T4.)' % (
        'Hayır: 6 hız/profil × 25 geçişin hiçbirinde düşmüyor; plan her dakika bir öncekinin üst kümesi.'
        if not lost else 'Evet: ' + '; '.join(lost)))
    a('')


# ---------------------------------------------------------------------------------------------- §5
def part_5(L, F, a):
    allc, IN = F['allc'], F['in']
    act_ids = [('uzanma', 'a.durus'), ('örtü ve yastık', 'a.konfor'), ('gözler', 'a.gozler'),
               ('kıpırdanıp yerleşme', 'a.x.kipir'), ('ağırlığı bırakma', 'a.agirlik'), ('niyeti seçme', 'n1.sec'),
               ('niyeti üç kez söyleme (başta)', 'n1.soyle'), ('niyeti üç kez söyleme (sonda)', 'n2.hatirla'),
               ('patikadan dönüş', 'c4.don'), ('parmaklar ve gerinme', 'k.hareket'), ('gözler ve çevre', 'k.goz'),
               ('yana dönme', 'k.yan'), ('doğrulup oturma', 'k.otur'), ('oturarak bekleme', 'k.bekle'),
               ('kalkış ve son', 'k.son')]
    actions = ', '.join('%s %s' % (lbl, n(allc[i][1]['gapAfter']['min'])) for lbl, i in act_ids)
    fillers = {w: sum(len(re.findall(r'(?<!\w)' + w + r'(?!\w)', t.lower())) for _, c in allc.values()
                      for t in timing.text_forms(c)) for w in timing.FILLERS}
    bd5 = F['bd5']
    c2_5 = [v['C2'] for v in bd5.values()]
    n2_5 = [v['N2'] for v in bd5.values()]
    n1_5 = [v['N1'] for v in bd5.values()]
    c1_5 = [v['C1'] for v in bd5.values()]
    me = F['means']
    a('## 5. Denetim listeleri')
    a('')
    a('### 5.1 Usta hoca ölçütleri (PLAN E.6, 18 madde)')
    a('')
    a('| # | Ölçüt | Bu metinde | Denetim | Durum |')
    a('|---|---|---|---|---|')
    e6 = [
        ('Zaman verir', 'Her eylem cümlesinin en kısa sessizliği (sn): ' + actions + '. Yana dönme, oturma ve bekleme hiçbir '
         'sürede sıkıştırılmaz; "birkaç nefes" isteyen her klipten sonra >= 10 sn, "Kapanışa geç" ve Durdur dizilerinde '
         'de (T1). **Blok süreleri (PLAN B.3 adım 8):** 6 dakika ve üstünde her çekirdek blok >= 55 sn, her niyet bloğu '
         '>= 20 sn (en kısa: %s). **5 dakikada** C1 %s sn ve N1 %s sn eşiği geçer; C2 %s sn ve N2 %s sn eşiğin '
         'altındadır: sahibe görünür değişiklik (C2 >= 30, N2 >= 18; §7, H1).' % (
             ', '.join('%s %s' % (b, r1(v)) for b, v in sorted(F['bmin6'].items())), span(c1_5, 1), span(n1_5, 1),
             span(c2_5, 1), span(n2_5, 1)),
         'veri (`gapAfter.min`) + `timing.py` (T1, H1/B.3-8)', '**kısmen**'),
        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik; 7 dakikadan itibaren "%s" (`c2.kal`); 5–6 '
         'dakikada nefes bloğu dikkat → akış, iki satır birbirini iptal etmez (H1 a).' % T(F, 'c2.kal'),
         '`timing.py`', 'evet'),
        ('Sessizliği korur', 'Üç pencere de (içten sayma, imge, tanıklık) duyurulur, bir kapı taşır ve karşılanır: '
         'duyurular "…sonra yine seslenirim."; kapılar "Gözlerin açık kalsa da olur", "İstediğin an gözlerini '
         'açabilirsin.", "Bir şey zor gelirse zemini hissedebilirsin."; karşılamalar %s, %s, %s. Karşılamadan 2 sn önce '
         'dönüş tınısı; yatak kabarması rampalı (G2-11); hepsi <= 90 sn.' % (
             Q(F, 'c2.x.donus'), Q(F, 'c4.donus1'), Q(F, 'c5.donus')), '`timing.py` (G2-02)', 'evet'),
        ('Somut beden dili', 'ağırlık, hafiflik, ılıklık, serinlik, zemin, ayak tabanları, taşın ılıklığı, esinti, koku, '
         'avuçlar; "enerji" yok.', 'yasak liste + elle', 'evet'),
        ('Tutarlı yön', 'sağ → sol → arka → ön → bütün, her sürümde; temas turu bütün-beden doruğundan önce (H16).',
         '`timing.py`', 'evet'),
        ('Dolgu yok', 'Bütün metinde (seçenek ve sahne metinleri dahil): ' + ', '.join(
            '"%s" %d' % (w, k) for w, k in fillers.items()) + '; aynı sözcük 60 sn içinde iki kez geçmez; 10 sn '
         'içinde ya da ardışık cümle kliplerinde etiketsiz kök tekrarı yok (L2-14).', '`timing.py`', 'evet'),
        ('Anlatmaz, yaşatır', 'Ayrı açıklama klibi yok; niyetin ne olduğu seçimle aynı klipte söylenir (S2-hoca, H1 b).',
         '`timing.py` (metin)', 'evet'),
        ('Tek imge yayı', 'Yalnız C4; sahne seçiciyle ya da ders içinde seçilir; §1.3.', 'etiket + son 60 sn denetimi',
         'evet'),
        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "onu atla", "Bir yerin ağrırsa ya da başın dönerse '
         'bırak.", "Uzanıyorsan önce bir yanına dön.", "…doğrulup otur.", "…böyle kal. …biraz daha bekle.", "başın '
         'dönerse yeniden otur" ve Durdur dönüşü. Öteki yönergeler "-ebilirsin", "-mek yeterli", "sana kalmış", şimdiki '
         'zaman ya da isim cümlesiyle; "-(y)abil-" herhangi bir 60 sn\'de en çok 3 kez (TR2-03). Çifte izin yok.',
         '`timing.py` (metin)', 'evet'),
        ('Başarısızlığı normalleştirir', '%s (her sürümde) · %s · %s · %s · %s · %s · %s' % (
            Q(F, 'a.kolay'), Q(F, 'c1.kacirma'), Q(F, 'c2.birak').split('. ')[-1].join(['"', '']), Q(F, 'c3.gelmezse'),
            Q(F, 'c4.gelmezse'), Q(F, 'c4.donus1'), Q(F, 'c2.x.donus').split('. ')[-1].join(['"', ''])), 'elle', 'evet'),
        ('Çıkış kapısı', 'Açılışta ortak cümle ("…ya da dersi bitirebilirsin"; G2-03); nefese bakan her sürümde aynı '
         'klipte eller ve gözler (G2-01); imgeleme olan her sürümde (%s. dakikadan itibaren) imgeden hemen önce '
         'hatırlatma ve dayanak; dolaşımda atlama; zıtlıkta "bu bölümü atlayıp zemini hissedebilirsin"; her pencere '
         'duyurusunda bir kapı (G2-02); imgenin içinde gözler. Zor blok yok.' % rng(IN['c4.yer']),
         '`timing.py` (S1, P-B2, G2-01, G2-02)', 'evet'),
        ('Kapanış ritüeli', 'nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → bekle → kalk (başın dönerse '
         'yeniden otur) → "%s"' % T(F, 'k.son').split('. ')[-1], '`timing.py` (+ G2-04)', 'evet'),
        ('Azalan anlatım', 'Her klibin evresi var; −1,5 / −3 dB evreye göre; yol A\'da REST hızı 0,90 → 0,85 → 0,80. '
         'Cümleler de kısalır (H12): ortalama hece/cümle 5 dakikada Varış %s, Derinleşme %s, Derin %s; 30 dakikada %s, '
         '%s, %s (her planda Derin < Derinleşme < Varış). Yol B\'de hız sabit (§1.1).' % (
             r1(me[5]['Varış']), r1(me[5]['Derinleşme']), r1(me[5]['Derin']), r1(me[30]['Varış']),
             r1(me[30]['Derinleşme']), r1(me[30]['Derin'])),
         '`timing.py` (H12) + üretim ölçümü', 'kısmen (ölçüm bekliyor)'),
        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden. Duraklamalar dahil en yavaş klip %s hece/sn; '
         'Derin evre iç hızı ve tavanı (VARSAYIM) §2.5\'te.' % F['slowest'], '`timing.py` (metin) + üretim ölçümü',
         'kısmen (ölçüm bekliyor)'),
        ('Ses–müzik', 'Konuşmada yatak kısık ve sesin evresini izler (her evrede >= 15 dB; netlik kipinde 21 dB); doku '
         'katmanları blokla değişir (L2-13); kabarma yalnız pencerede ve rampalı (G2-11); doğa katmanı seçilen sahneyi '
         'izler (H6, L2-03). Kıyı seçen dinleyici için tam uyum su katmanının üretilmesine bağlıdır; üretilmezse Kıyı\'da '
         'doğa katmanı imge boyunca kısılır.', 'karışım ölçümü (bekliyor)', 'bekliyor; Kıyı için kısmen'),
        ('Kusursuz Türkçe', 'Üç editör turu (§5.4); Scribe ile geri çevirme ve anadili Türkçe insan editör onayı bekliyor.',
         'elle + `timing.py` (metin)', 'kısmen'),
        ('Benzersizlik', 'Açılış cümlesi, anahtar cümle, kıyı/orman patika yayı ve sahne seçici, ufuk çizgisi formu ve Mi♭ '
         'yatağı yalnız bu derste. Ders 5\'in anahtar cümlesi yok (B1); tanıklık Ders 5 ve 9\'dan ayrıldı (S5-hoca); PLAN '
         'A.2.1 satırı güncellendi.', 'ders düzeyi', 'evet'),
        ('Yasak liste + güvenlik 18 kural', '§5.2; E12 kökleri muafiyetsiz denetlendi.', '`timing.py` + tablo', 'evet'),
    ]
    for i, (t, h, d, s) in enumerate(e6, 1):
        a('| %d | %s | %s | %s | %s |' % (i, t, h, d, s))
    a('')
    a('### 5.2 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)')
    a('')
    a('| # | Kural | Bu metinde |')
    a('|---|---|---|')
    g18 = [
        ('Davet, komut değil', 'Yönergeler "-ebilirsin", "olabilir", "-mek yeterli", "sana kalmış", şimdiki zaman ya da '
         'betimleme; emir kipi yalnız güvenlik adımlarında.'),
        ('Gözleri açık seçeneği', 'Açılışta `a.gozler` her sürümde. Uzun iç bölümlerden önce: nefeste `c2.dikkat` ("…ya da '
         'gözlerini açmak da olur."; G2-01: `timing.py` her planda bu klipte ya da ondan önceki 60 sn içinde bir gözleri '
         'açma seçeneği arar); içten sayma penceresinde '
         '"Gözlerin açık kalsa da olur" (G2-02); imgelemeden önce `br.orta` ("…gözlerini açmak ya da dersi bitirmek senin '
         'elinde. Gözlerin açıksa bakışın serbest."; G2-13); imgenin ilk cümlelerinde `c4.gelmezse`; imgenin içindeki '
         'pencerede `c4.pencere` ("İstediğin an gözlerini açabilirsin."). (S1, B5, E9, P-B2.)'),
        ('"İstediğin an…" açılışta, 30 dk\'da ortada', '`a.izin` her sürümde; `br.orta` imgeleme olan her sürümde C4\'ün '
         'hemen önünde (%s. dakikadan itibaren; 30 dakikada dersin ortasına düşer). **Sapma (G2-03):** §11.A '
         '"durabilirsin" → "dersi bitirebilirsin" (T08 belirsizliği); kart metni de aynı fiile çekilmeli — sahip/editör '
         'onayı. Seste "ara vermek" (durdurup sürdürme) yok; duraklatma ekrandaki Durdur düğmesindedir.' % rng(IN['c4.yer'])),
        ('Kontrol kişide', '%s (`a.karar`, %s. dakikadan itibaren); daha kısa sürümlerde kontrol `a.izin` ve davet diliyle '
         'kişidedir; "İstemezsen bu bölümü atlayıp…"; sınama telkini yok.' % (Q(F, 'a.karar'), rng(IN['a.karar']))),
        ('Gevşeme zorunlu değil', '%s **her sürümde**, 5 dakikada da (`a.kolay`; S2, B6, P-B1). Anahtar cümle ve kapanış '
         'durum iddiası taşımaz (G2-08, EV2-01).' % Q(F, 'a.kolay')),
        ('Nefes önce fark edilir', '%s; "derin nefes al" yok; dönüşte %s (S7, TR2-19); %s (S8).' % (
            Q(F, 'c2.dikkat').split('. ')[0] + '."', Q(F, 'k.nefes'), '"' + T(F, 'c2.sayac').split('. ')[-1] + '"')),
        ('Nefes tutma', 'Yok. Veriş sonundaki duraklama "Uzatmaya gerek yok." ile fark edilir (S14).'),
        ('Tarafsız dayanak ve çıkış kapısı', 'Önce dayanak, zemin: Varış\'ta %s (`a.agirlik`, %s. dakikadan; imgeleme olan '
         'her planda `br.orta` klibinden önce çalar, `timing.py` H5), uzun sürümde temas turunda %s, imgeden hemen önce '
         '"Zemin hep seni taşıyor." Nefeste kapı aynı klipte: eller ve gözler (`c2.dikkat`; G2-01, L2-01); %s. dakikadan '
         'ellerle kalana ayrı cümle (`c2.alt`). Zor bölüm sırasında kapı: zıtlıkta zemin (`c3.agir`), imgenin içinde '
         'gözler (`c4.gelmezse`, `c4.pencere`; orada "zemin" hayal edilen yer gibi duyulabilir), tanıklıkta zemin '
         '(`c5.pencere`); imgeden dönüş yine zemine (`c4.solma`). Nefes tek dayanak değildir (S1). 5–6 dakikalık '
         'sürümlerde imge ve zıtlık yoktur; tek iç bölüm olan nefesin dayanağı eller ve gözlerdir.' % (
             Q(F, 'a.agirlik'), rng(IN['a.agirlik']), Q(F, 'c1.x07'), rng(IN['c2.alt']))),
        ('Beden taraması esnek', '`c1.cerceve`: "Seni rahatsız eden bir yer olursa onu atla." Kalça, göğüs ve karın tek adla '
         've komşularıyla aynı periyotta geçer (G2-06; `timing.py`); nefes yeri için "ya da başka bir nokta" (S16).'),
        ('İmgeleme seçimli', 'Sahne seçici (Kıyı / Orman / Ders içinde seçerim; H6); ders içinde "Bir kıyı ya da bir '
         'orman."; "Bir görüntü gelmese de olur"; suya ve derinliğe girilmez, iniş yok (S3, B3, E1); su katmanı yalnız Kıyı '
         'seçene ve varsayılan olarak kapalı (S12). Örnekler tasarım önerisidir, Luu 2024 özetinde yok (sakin §11.7 '
         'düzeltmesi; EV2-10).'),
        ('Anı arama yok', 'Çağrışımlar yalnız nötr duyular (fincan, pencere, taş); kişisel anı istenmez. "%s" bir yönelim '
         'cümlesidir, anı araması değil.' % T(F, 'k.zaman')),
        ('Öz-şefkat kademeli', 'Bu derste öz-şefkat bloğu yok.'),
        ('Sağlık iddiası yok', 'Yasak liste ve E12\'nin etki vaadi kökleri temiz; 3. turda muafiyet yok: anahtar cümleler ve '
         'son cümle de denetlenir (G2-08, EV2-01); "dinlenmiş", "iz bırak", "kalacak" kökleri eklendi (EV2-01, -02, -03).'),
        ('Gündüz dersi uyandırmayla biter', 'Kapanış ritüeli; son cümle "%s" §11.B-14\'teki "uyanık ve dinlenmiş" yalnız bir '
         'örnektir ("… gibi bir cümle"); sonuç iddiası taşımayan biçim seçildi (EV2-01).' % T(F, 'k.son').split('. ')[-1]),
        ('Uyku dersi uyku izniyle biter', 'Uygulanmaz; gündüz dersinde uyku izni yok ("uykuya dal", "uyuyabilir", "uyursan" '
         'denetlendi). Dalıp gitme yalnız bağışlanır (P-S10). Akşam 20:00\'den sonra ders kartında uyku dersini gösteren tek '
         'satır: "%s" (L2-17; UI, VARSAYIM).' % L['eveningHint']['text']),
        ('Sessizlikler rehberli', 'Her pencere duyurulur, bir kapı taşır (G2-02), karşılanır ve <= 90 sn; duyuru süreyi '
         'doğru anlatır ("bir süre"; S15, P-S4); karşılamadan 2 sn önce dönüş tınısı.'),
        ('Beden hareketi hafif', '`k.hareket`: "…zorlamadan gerinebilirsin. Bir yerin ağrırsa ya da başın dönerse bırak." '
         '(G2-07, EV2-11); `k.bekle`: "Başın dönerse biraz daha bekle."; `k.son`: "…başın dönerse yeniden otur." (G2-04); '
         'Durdur dönüşü: "…başın dönerse biraz daha bekle." (G2-05).'),
        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç uyarısı açılış ekranında ve **veride** (`openingNotice`, '
         '`openingScreen`), tek okunuşlu: "%s" (S11, E10, TR2-23).' % L['openingNotice']),
    ]
    for i, (t, h) in enumerate(g18, 1):
        a('| %d | %s | %s |' % (i, t, h))
    a('')
    a('### 5.3 Bu metni etkileyen CRITIQUE maddeleri')
    a('')
    a('| # | Konu | Nasıl karşılandı |')
    a('|---|---|---|')
    crit = [
        ('3', 'Genişletme klipleri; 30:00\'a sessizlik sınırı aşılmadan ulaşmak', 'Genişletme katmanı: içten sayma + pencere, '
         'temas turu, zıtlık listelerinin ek öğeleri, imgede dinlenme ayrıntıları, tanıklık cümleleri; niyetten sonra kısa '
         'sessizlik isteğe bağlı katmanda. 30:00\'da esneme en çok %%%d (§2.5).' % round(100 * max(F['stretch30'].values()))),
        ('7, 8', 'Ses düzeyleri; müziğin her cümlede inip kalkması', 'Yatak sesin evresini izler (−33 / −34,5 / −36 LUFS); '
         'kabarma yalnız duyurulan >= 20 sn pencerelerde ve rampalı (G2-11); alt-evre dokuları yükseklik değil doku '
         'değiştirir (L2-13).'),
        ('10', 'Müzik temposu', '`bpmFeel` boş; ritimsiz/pulssuz doku önerisi test edilmedi; ElevenLabs Music\'te tempo '
         'parametresi yok (EV2-12).'),
        ('12', 'Tek sözcüklük ipuçları taşıyıcıda', '%d taşıyıcıdan %d mikro-klip; sayı taşıyıcısında atılan ön söz (T17); '
         'mikro-listeler başlangıç periyoduyla (L2-08, Z2-07).' % (F['uc']['carriers'], F['uc']['micro'])),
        ('13', 'Harf harf eşleşme için normalleştirme', '§6.'),
        ('19', 'Araç uyarısı; göz kökeni', 'Araç uyarısı açılış ekranı verisinde; gözlere baskı yok; açık gözün bakışı '
         'serbest (§1.5).'),
        ('21', 'Benzersiz açılış, anahtar cümle, imge yayı, dikkat eğrisi', '§0, §1.2, §1.3, §1.4.'),
        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili '
         'kör panel henüz yok. Panel protokolüne "Derin evrede sayılar ve tek heceli adlar net mi" maddesi eklenmeli '
         '(L2-10).'),
        ('30', 'Kaldığın yerden aynı plan', 'Planlayıcı belirlenimci; dönüşümlü seçenek dizini (`variantIndex`) ve sahne '
         'kayda yazılır.'),
        ('31', 'C.8 davet dili', 'Çifte izin yok; niyet şimdiki zamanla: "%s."' % T(F, 'n1.sec').split('. ')[0]),
    ]
    for c in crit:
        a('| %s | %s | %s |' % c)
    a('')
    nc, ns, abil, semi = prosody_stats(L)
    n_cl, n_ab, worst = F['abil5']
    a('### 5.4 Türkçe editör notları (3. tur; TR2-01–TR2-24)')
    a('')
    a('- **Anlam belirsizliği ve cümle düşüklüğü giderildi (3. tur):** "Saatin kaç olduğunu, nerede olduğunu…" ("saatin" '
      'eşyazımı ve 3. tekil okuma) → %s (TR2-01, H8); "Ağırlığın ve zeminin desteği" tamlama karışıklığı → %s (TR2-02, '
      'L2-12); yararlanıcısız "Dinlenmeye izin veriyorum" → "Kendime dinlenme izni veriyorum." (TR2-04); cümle ortasındaki '
      'tırnak içi nokta → niyet cümlesi klibin sonunda (TR2-05, H10, L2-11); "yan yatarak uzanmak" yinelemesi → %s '
      '(TR2-06); resmî "sakınca" → "yanlış bir şey yok" (TR2-07); yer tekrarlanmaz, adı tekrarlanır: "Her adı…" '
      '(TR2-08); "kendiliğinden oluyor" → "kendiliğinden akıyor" (TR2-09); öznesiz "Zor gelirse" → "Bir şey zor gelirse" '
      'ya da kapı "zor gelirse" demeden (TR2-10, TR2-16, H15); "bu odaya" → "patikanın başına" (TR2-11); nefesle ve '
      'ellerle kalana ayrı seslenme (TR2-12); "…kaydıysa da olsun" → "…kaydıysa o da olur" (TR2-13); "karar verirsin" → '
      '"karar veriyorsun" (TR2-14); "yere değen", "yaslanıyor" → "zemine değen", "Zemin her birini taşıyor." (TR2-15); '
      '"susacağım" → "sessiz kalacağım" (TR2-16); "Dikkatin geniş kalabilir" çevirisi → %s (TR2-17); "fark edebilirsin" → '
      '"hissedebilirsin" (TR2-18); "dönüş… dönebilir" → "ritmini bulabilir" (TR2-19); "ağrı olursa bırak" → "Bir yerin '
      'ağrırsa ya da başın dönerse bırak." ve koşut "Yakındaki ve uzaktaki sesler" (TR2-20); "birden" (ansızın) → "her '
      'iki" (TR2-21); "geçip" → "atlayıp", "bir turu saymak" → "ondan bire sayabilirsin… tekrar ondan başlarsın" (TR2-22); '
      'kartta koşut ad öbekleri, "Uyanıkken derin bir dinlenme." ve tek okunuşlu "Bu dersi araç ya da makine '
      'kullanmıyorken dinle." (TR2-23).' % (
          Q(F, 'k.zaman'), Q(F, 'c5.x.dayanak'), Q(F, 'a.durus'), Q(F, 'c5.genis')))
    a('- **"-(y)abil-" yoğunluğu (TR2-03, H11):** 5 dakikalık sürümde %d cümle klibinde %d "-(y)abil-" var (klip başına '
      '%s; aynı sayımla ikinci turda %s); herhangi bir 60 sn\'de en çok %d (`timing.py` sınırı 3). Araçlar: "-mek yeterli", '
      '"sana kalmış", "var", şimdiki zaman ("seçiyorsun", "söylüyorsun", "hatırlıyorsun"), geniş zaman ("fark edersin", '
      '"olmaz"), isim cümlesi ("Önce ağırlık.", "Beden kendi hâlinde."). Güvenlik sözleri ("…açabilir, kıpırdayabilir '
      'ya da dersi bitirebilirsin") değiştirilmedi.' % (
          n_cl, n_ab, n(round(n_ab / n_cl, 2)),
          ('%d klipte %d' % F['r2']['abil5']) if F['r2'] else '—', worst))
    a('- **Noktalama kuralı (TR2-24):** koşul yan cümlesinden sonra virgül yok ("Bir adı kaçırırsan bir sonrakiyle…", '
      '"Aklına bir şey gelmezse önerim şu:", "Bir yerin ağrırsa ya da başın dönerse bırak."); böylece TTS duraklaması '
      'kazara değişmez. İki noktadan sonra tam cümle büyük harfle ("…: İkisi de burada.", "…: Hepsi sende bir arada."), '
      'ad öbeği küçük harfle ("…: hafiflik.") (T09). Eş görevli olmayan sıfatlar arasında virgül yok, eş görevliler '
      'arasında var ("güneşte ısınmış, düz bir taş") (T31). Belge içi ekler sayının okunuşuna göre üretilir (T35).')
    old = F['old']
    comp = ''.join(' %s. turda: %d klip, %d cümle, %d (%%%d) ve %d (%%%d).' % (
        k, v['prosody'][0], v['prosody'][1], v['prosody'][2], round(100 * v['prosody'][2] / v['prosody'][1]),
        v['prosody'][3], round(100 * v['prosody'][3] / v['prosody'][0])) for k, v in sorted(old.items()))
    a('- **Ezgi (T18):** benzersiz %d cümle klibinde %d cümle var; "-(y)abilir(sin)" ile biten cümle %d (%%%d), noktalı '
      'virgüllü klip %d (%%%d).%s Bildirme, "-mek yeterli" ve isim cümleleri ile iki cümleye bölme bilinçli dağıtıldı; '
      'hiçbir sürümde art arda üçten çok cümle "-(y)abilir(sin)" ile bitmez (`timing.py`).' % (
          nc, ns, abil, round(100 * abil / ns), semi, round(100 * semi / nc), comp))
    a('- **Bilinçli eksiltili isim cümleleri:** "Önce ağırlık.", "Şimdi bunun tersi: hafiflik.", "Avuçlarında sıcak bir '
      'fincan tutar gibi.", "Açık bir pencereden içeri dolan hava gibi.", "Bir de zemine değen noktalar.", "Bedenin arka '
      'tarafı.", "Yüz ve bedenin önü.", "Burun, göğüs, karın ya da başka bir nokta.", "Sözlerin ardından kısa bir '
      'sessizlik.", "Bir renk, bir biçim, bir doku.", "Uyanık bir dinlenme bu." Öznesi ya da bağlamı bir önceki '
      'cümlededir ya da bir işaret gibi kullanılır; konuşma dilinde doğaldır. İnsan editör yine de değerlendirmeli.')
    a('- **Anlatı kipi ve devrik cümle (T18):** imgede yürüyüş ve dönüş, niyette seçme ve söyleme, kapanışta yönelim '
      'şimdiki zamanla anlatılır ("kendi hızında yürüyorsun", "seçiyorsun", "hatırlıyorsun"): bu, PLAN C.1\'deki '
      'betimleme biçimidir, bir iddia değildir. Davet kipi girişte, yerleşmede ve dayanakta kalır. "Bir görüntü gelmese de '
      'olur, gözlerin açık kalsa da." ortak yüklemli devrik bir cümledir. İnsan editör bu dengeyi dinleyerek onaylamalı.')
    a('- **Ortak ek:** "açabilir, kıpırdayabilir ya da dersi bitirebilirsin" aynı kişi ve kipte olduğu için doğrudur; '
      '"oynatıp zorlamadan gerinebilirsin" zarf-fiille tek yüklemdir; "gözlerini açmak ya da dersi bitirmek senin '
      'elinde" iki mastarı tek yükleme bağlar.')
    a('')


# ---------------------------------------------------------------------------------------------- §6–8
def part_6_8(L, F, a):
    IN = F['in']
    uc = F['uc']
    s5 = list(F['split'][5].values())
    a('## 6. Üretim notları (seslendirme)')
    a('')
    a('- **Yol kararı açık (sahip, PLAN §G5):** REST ya da MCP.')
    a('  - REST (yol A) ile evreye göre hız: Varış 0,90 · Derinleşme 0,85 · Derin 0,80 · Kapanış 0,90 (VARSAYIM; PLAN '
      'C.2\'deki "evre başına bir basamak, 0,85 → 0,80" ile uyumlu; 0,80 ≈ 5,2 hece/sn tahmindir ve zamanlamanın '
      'hesaplandığı en yavaş hızdır, altına inilmez). Ayrıca sabit seed ve komşu cümleler için `previous_text` / '
      '`next_text`.')
    a('  - MCP\'de (yol B) bunların hiçbiri yok; evre farkı yalnız metinden, boşluklardan ve kazançtan (−1,5 / −3 dB) '
      'gelir. Derin evre iç hızı bu yolda tavanın (VARSAYIM; kanıta dayanmaz) üstünde kalır (§2.5).')
    a('  - Taşıyıcı yöntemi iki yolda da çalışır, çünkü her taşıyıcı tek istektir.')
    a('- **Model:** v3 yön etiketleri kullanılmaz (bu oturumdaki denemede etiket büyük olasılıkla sesli okundu). Metinde '
      'köşeli etiket ve `<break>` yok; bütün uzun sessizlikler uygulamada.')
    a('- **Taşıyıcılar ve kesim:**')
    a('  - Sessizlik algısıyla öğeler sırayla ayrılır; öğe sayısı tutmazsa insan onaylar; her mikro-klibe 10 ms yumuşak uç.')
    a('  - Seviye: kısa klipler RMS ile evre referansına eşitlenir; netlik kipinde tek heceliler +1 dB (L2-10; VARSAYIM).')
    a('  - Son öğenin kapanış ezgisi korunur ("bütün sağ taraf.", "bütün sırt.", "bütün beden.", "bir.", "başın arkası.").')
    a('  - Ön söz: sayı taşıyıcısı "sayıyorum: on… dokuz…" diye üretilir; "sayıyorum:" kesilip atılır. Böylece ilk sözcük '
      '"On" İngilizce "on" gibi okunmaz (T17). REST\'te ayrıca `previous_text`.')
    a('  - **Eklem ezgisi (P-S15):** taşıyıcı sınırındaki F0 sıçraması, taşıyıcı içindeki öğeden öğeye medyan değişime göre '
      '<= 2 yarım ton olmalı (VARSAYIM; `qa.carrierJoinF0StepSemitones`). Aşarsa önce `previous_text` / `next_text` ile '
      'yeniden üretilir (yol A), sonra kesim sırası değiştirilir; dinleyerek onaylanır.')
    a('  - **Mikro-klip süresi ölçülür (Z2-07):** ilk pilot üretimde kesilen her mikro-klibin gerçek süresi ölçülür; '
      '`timingModel.edgeMicroSec` (0,15 sn, VARSAYIM) ölçülen değerle değişir ve periyotlu sessizlikler gerçek '
      '`voice.sec` ile yeniden hesaplanır; `timing.py` yeniden koşar.')
    a('- **Scribe ile geri çevirme, normalleştirme (CRITIQUE #13):** küçük harf; noktalama silinir (… , ; : " \' ve nokta); '
      'düzeltme işareti düşer (â → a); sayılar sözcüğe çevrilir (10 → on). Taşıyıcı bütün olarak karşılaştırılır; ön söz '
      'karşılaştırmaya girmez. Uyuşmazlıkta klip başına en çok 2 yeniden üretim yapılır; sonra metin yeniden yazılır.')
    a('- **Tırnak içi nokta (L2-11):** tırnak içindeki nokta yalnız cümlenin sonunda olabilir (`timing.py` denetler). '
      'Cümlenin ortasında gerekirse ekran metni TDK biçiminde kalır, TTS\'e noktasız `ttsText` gider. Bu turda gerek '
      'kalmadı: iki niyet klibi de tırnakla biter.')
    a('- **Noktalama tek kurala bağlı (TR2-24):** koşul yan cümlesinden sonra virgül yok; TTS duraklaması kazara '
      'değişmez (§5.4).')
    a('- **Söyleyiş izleme listesi (dinlenerek denetlenir):**')
    a('  - Vurgu ve eşyazımlı tuzakları (T17): **alın** (organ, a-LIN; emir "A-lın" değil), **karın** (organ, ka-RIN; '
      '"karmak"tan emir değil; taşıyıcı bu yüzden üç noktayla biter; `c2.yer` klibinde de), **On** (taşıyıcı başında '
      'İngilizce "on" değil), **dönüş** ("Artık dönüş zamanı."), **siliniyor**.')
    a('  - **dinlenme** (ad, vurgu sonda: din-len-ME) olumsuz emir "DİN-len-me" gibi okunmamalı: "Uyanık bir dinlenme bu.", '
      '"Biraz dinlenme zamanı.", "dinlenme yeri", "Kendime dinlenme izni veriyorum."')
    a('  - 2. tur incelemesinin tuzakları (TR2-24): **Saatin** (tamlayan / 2. tekil iyelik; metinden çıktı, yerine '
      '"Günün hangi saatinde"), **Ağırlığın** (tamlayan / iyelik; metinden çıktı), **birden** ("ansızın"; metinden çıktı), '
      '**dinle** (ekranda "…kullanmıyorken dinle." emirdir; ad okunuşu yok), düzeltme işaretli **hâlinde** ("Beden kendi '
      'hâlinde.") ve **rüzgârda / Rüzgâr** (`c4.ses`, orman sahnesinde `c4.x.yaklas`): v2 ve v4 tuhaf bir ünlü üretmemeli.')
    a('  - ğ\'li sözcükler: başparmağı, ağırlık, değen, doğrulup, değiştirmeden, alıştıra alıştıra, yumuşak, soğuk değil '
      'serin, yosunlu toprakta.')
    a('  - uyluk, baldır, şakak, köprücük, yüzük parmağı ("yüz" eşyazımlısı), yüzüne, yüzün.')
    a('  - Büyük harfle yazılan I ve İ: "Işık", "Işıkla", "İstediğin", "İstemezsen", "İstersen", "İkisi".')
    a('  - Tırnak içi hazır niyet cümlesinin ezgisi: `n1.sec` "…önerim şu: "Kendime dinlenme izni veriyorum."" ve '
      '`n2.hatirla` "Ya da yine şunu: "…"": iki noktadan sonra doğal durak, tırnak içi hafif vurgulu, sonda iniş.')
    a('  - Yanlış okuma Scribe ya da dinlemeyle görülürse: yol A\'da taşıyıcıdan önce küçük harfli `previous_text` ya da '
      'alias sözlüğü; yol B\'de ön söz ya da fonetik yazım.')
    a('- **Dosyalar:** `voice.{female,male}.file` = `public/yoga/ders2/<ses>/<klip>.m4a`; dönüşümlü seçenekler '
      '`<klip>.v2.m4a`, `<klip>.v3.m4a` (P-N5); sahne metinleri `<klip>.kiyi.m4a`, `<klip>.orman.m4a` (H6; %d klip, %d '
      'metin). `sec` üretimden sonra dolar. Taşıyıcıların WAV\'ı arşivdir, pakete girmez.' % (uc['scene_clips'], uc['scenes']))
    a('')
    a('## 7. VARSAYIM\'lar ve açık noktalar')
    a('')
    a('- Bütün `gapAfter`, `pairGap`, pencere ve başlangıç periyodu (`onsetPeriod`, `gapFloor` %s sn) değerleri, dalga '
      'sıraları (`fillRank`), giriş sıraları (`entryRank`), T5 esneme tavanı (0,5) ve girişte en çok yarı sıkışma birer '
      'tasarım kararıdır (VARSAYIM).' % n(timing.GAP_FLOOR))
    a('- **5 dakikanın en yavaş ucu (T6, G2-10):** T6 tabanı 15 sn\'de tutuldu ve artık bir denetimdir. Bu turun güvenlik '
      'sözleri (G2-01, -03, -04, -07) ve Kapanış\'ın uzayan payları (H4, L2-02, Z2-05) 5 dakikaya süre ekledi. Karşılığı '
      'yalnız güvenlik dışı yerlerden alındı: N1\'in iki klibi birleşti (H1 b); `c2.dikkat` kısaldı; `k.son` sadeleşti; '
      'güvenlik dışı sessizliklerin alt sınırları indi (%s). `k.yan`, `k.otur`, `k.bekle`, `a.izin` ve `c1.cerceve` '
      'sessizliklerine dokunulmadı. Sonuç: %s sn boş pay.' % (
          '; '.join('`%s` %s → %s' % (i, n(F['r2']['gmin'][i]), n(F['allc'][i][1]['gapAfter']['min']))
                    for i in ('a.hosgeldin', 'a.acilis', 'n2.hatirla', 'k.nefes')
                    if F['r2'] and F['r2']['gmin'].get(i, 0) > F['allc'][i][1]['gapAfter']['min']),
          r1(F['slack5'][(5.2, 'hi')])))
    bd5 = F['bd5']
    a('- **5 dakikalık blok eşikleri (H1; sahibe görünür değişiklik):** PLAN B.3 adım 8 ve E.6 #1\'e Ders 2 için not: 5 '
      'dakikada C2 >= 0:30, N2 >= 0:18 (ölçülen: C2 %s sn, N2 %s sn; 6 dakikadan itibaren olağan eşikler, 55 ve 20 sn, '
      'geçer). Neden: güvenlik gereği uzayan kapanış (5 dakikada %s sn) ve nefes kapısı. H1(c)\'nin öteki seçeneği, T6\'yı '
      '8 sn\'ye indirip C2\'yi 55 sn\'ye çıkarmak, seçilmedi: en yavaş köşedeki boş pay gerçek ses süreleri için tek '
      'güvencedir (sarsıntı taraması §2.5). Sahip onayı bekliyor.' % (
          span([v['C2'] for v in bd5.values()], 1), span([v['N2'] for v in bd5.values()], 1),
          span([x[3] for x in s5])))
    a('- **Varsayılan süre %d dakika (H13, seçenek b):** varsayılan 15 dakikada zıtlık çiftleri yoktu. Ayrıca C3\'ün giriş '
      'sırası 500\'den %d\'e alındı (C4\'ün hemen ardı; seçenek a\'nın özü): C3 artık %s. dakikada girer (ikinci turda '
      '%s). PLAN B.4\'ün 15 dakikalık çapasındaki C3 (2:00) bu derste yoktur; 15 dakikada imge ve kapı önceliklidir '
      '(sapma, sahibe bilgi).' % (L['defaultMinutes'], L['planner']['entryRanks']['C3'], rng(IN['c3.agir']),
                                  rng(F['r2']['c3_in']) if F['r2'] else '—'))
    a('- İmgeleme (C4) hıza göre %s. dakikada girer (ikinci turda %s); PLAN B.4\'ün 10 dakikalık çapası yerine. Neden: en '
      'kısa imgenin de ses ve sıcaklık taşıması (H2), imgenin önüne her sürümde eklenen kapı (`br.orta`) ve güvenlik '
      'gereği uzayan kapanış. En kısa C4 penceresizdir; pencere %s. dakikadan girer.' % (
          rng(IN['c4.yer']), rng(F['r2']['c4_in']) if F['r2'] else '—', rng(IN['c4.pencere'])))
    a('- Süre modeli: eklemleme hızları ölçümdür; duraklama profilleri tek paragraftan çıkarıldı; 5,2\'deki ×1,25 ve uç '
      'payları VARSAYIM\'dır. Yoğunluk eşikleri (150 / 110 hece, %60 / %45), T3, T8, P-S6, L2-08 (0,6 sn yayılım), H3 '
      '(60 / 90 sn) ve TR2-03 (60 sn\'de 3) eşikleri VARSAYIM\'dır.')
    a('- **Sarsıntı payı (Z2-04):** bütün klip süreleri %10 kısa çıkarsa 6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik '
      'yoğunluk sınırı aşılır (bir 60 sn\'de 150\'den çok hece); yani hızlı seste bu iki dakikanın yoğunluk payı %10\'dan '
      'azdır. %5–10 uzun çıkarsa 5,2 yüksek köşesinin boş payı 15 sn\'nin altına iner. Gerçek süreler gelince '
      '`timing.py` yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır.')
    a('- **Derin evre iç hız tavanı (EV2-04):** <= 5,0 hece/sn bir tasarım tavanıdır (VARSAYIM; kanıta dayanmaz; '
      '`qa.derinClipRateCeilNote`). Yaşlı dinleyiciye uygunluk kör panelde dinlenerek sınanacak (CRITIQUE #22).')
    a('- Düzeyler: konuşma −18 LUFS; kısık yatak Varış −33, Derinleşme −34,5, Derin −36 LUFS; pencerede +6 dB, 6 sn rampa, '
      'bitişten 8 sn önce iniş (G2-11); son 5 sn sönüş; dönüş tınısı; netlik kipi (L2-10); doku katmanları (L2-13) — '
      'hepsi VARSAYIM.')
    a('- **Sahne seçici ve doğa katmanı (H6, L2-03, L2-04):** yapıldı; %d klibin sahne metinleri (%d metin × 2 ses). Kıyı '
      'için imge boyunca uzak, yumuşak dalga katmanı sahibin su katmanı kararına bağlıdır (üretim ≈ 10k kredi; '
      'VARSAYIM). Karar olumsuzsa Kıyı\'da doğa katmanı imge boyunca kısılır ve E.6 #15 Kıyı dinleyicisi için "kısmen" '
      'kalır.' % (uc['scene_clips'], uc['scenes']))
    a('- **Nabız yok (EV2-12):** `music.bpmFeel` boş; ritimsiz/pulssuz doku önerisi test edilmedi (sakin §11.5, Bernardi '
      '2006 düzeltmesi); ElevenLabs Music\'te tempo parametresi yok (CRITIQUE #10).')
    a('- **Kapak payı (Z2-06):** 5 dakikada Kapanış %s sn, güvenlik §11.D-1\'in önerdiği ≈ 75 sn\'nin %s sn üstünde; '
      'Varış %s sn (öneri ≈ 45); çekirdek (C1 + C2) %s sn, niyet dahil %s sn (öneri ≈ 3 dk). Neden: sıkıştırılmayan '
      'kalkış payları (B2, T1, E7) ve baş dönmesi satırları. Sahip kararı. `a.hosgeldin` ile `a.acilis` birleştirilmedi: '
      'derse özgü açılışın dönüşümlü seçenekleri (P-N5) ayrı klip ister ve kazanç 2–4 sn olurdu.' % (
          span([x[3] for x in s5]), span([x[3] - 75 for x in s5]), span([x[0] for x in s5]), span([x[2] for x in s5]),
          span([x[1] + x[2] for x in s5])))
    a('- **"Kapanışa geç" 60–95 sn** (PLAN B.5\'teki 45–60 sn yerine; ikinci turda 60–90): baş dönmesi satırları (G2-04, '
      'G2-07) ve iki eylemli göz cümlesinin payı (Z2-05) üst ucu %s sn\'ye çıkardı. Durdur dönüşü 20–30 sn; yana dönüp '
      'oturmaya 13 sn (Z2-01). Güvenlik dosyasının §11.D-4 metni (doğrulanmış kanıt dosyası) değiştirilmedi; geçerli '
      'değer PLAN B.5\'tedir.' % r1(max(F['qc'])))
    a('- **Güvenlik kartı (G2-03):** derste ve açılış ekranında "dersi bitirebilirsin"; §11.A kartındaki "İstediğin an '
      'durabilirsin" de aynı fiile çekilmeli (sahip/editör onayı; kartın metni doğrulanmış güvenlik dosyasındadır ve bu '
      'turda değiştirilmedi).')
    a('- Yedek genişletme: %s hiçbir modellenmiş vakada 30 dakikaya sığmıyor; klip süreleri kısa çıkarsa girer. Hızlı '
      'ikinci tur çıkarıldı (§3, C1).' % (', '.join('`%s`' % i for i in F['never']) or '—'))
    a('- Görsel: nabız `flashSafe` profiliyle kapanır (lib/profile.js:198, d515702\'de okundu); şafak parlaklık tavanı bağıl '
      '%15 ve en az 60 sn\'lik rampa (VARSAYIM).')
    a('- Sırtüstü yatışa göre yazılan temas turu yan yatan dinleyiciye tam uymaz; bu yüzden genişletme katmanındadır.')
    a('- Akşam satırı (L2-17): UI\'da 20:00 eşiği VARSAYIM; seste yok.')
    a('- Açık kararlar (sahip): seslendirme yolu (REST/MCP), su katmanı, 5 dakikalık blok eşiği değişikliği (H1), 5 '
      'dakikada Kapanış payı (Z2-06), güvenlik kartında "durabilirsin" → "dersi bitirebilirsin" (G2-03), insan editör, '
      'hoca ve kör dinleme paneli (CRITIQUE #22).')
    a('')
    a('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI\'ler https://doi.org/ önekiyle açılır)')
    a('')
    a('| PMID | Künye | DOI | Dosya |')
    a('|---|---|---|---|')
    refs = [('39690521', 'Luu 2024 (travma-duyarlı YN, 10 bileşen; öneri makalesi)', '10.17761/2024-D-24-00021', 'sakin, güvenlik'),
            ('40373021', 'Moszeik 2025 (11 ve 30 dk YN; iki ay, müziksiz kayıt)', '10.1002/smi.70049', 'sakin, teslim'),
            ('41743305', 'Gibbs 2026 (kronik ağrılı yetişkinler, yarı deneysel, n=23)', '10.4103/ijoy.ijoy_2_25', 'sakin'),
            ('34306146', 'Toussaint 2021 (60 sağlıklı öğrenci; derin nefes talimatı ve uyarılma)', '10.1155/2021/5924040', 'sakin, güvenlik'),
            ('42757902', 'Shuminsky & Davidow 2026 (12 kadın konuşmacı, 28 dinleyici; net konuşma ve doğallık; konuşma dili '
             'doğrulanmış dosyada belirtilmemiş)', '10.1044/2026_JSLHR-25-00691', 'teslim'),
            ('16941239', 'Knowlton & Larkin 2006 (48 yüksek kaygılı genç kadın, tek seans PKG; azalan anlatım)', '10.1007/s10484-006-9014-6', 'teslim'),
            ('16199412', 'Bernardi 2006 (müzik dinleme deneyi, 24 kişi; 2 dk müziksiz sessizlik; basit ritimler uyarılmayı '
             'artırdı)', '10.1136/hrt.2005.064600', 'sakin, teslim'),
            ('42466037', 'Lieutaud & Bourhis 2026 (8 haftalık rehberli ve rehbersiz program; koçluk dahil, ses rehberliğinin '
             'payı ayrılamaz)', '10.3389/fpsyg.2026.1833806', 'teslim'),
            ('19493324', 'Wood 2009 (olumlu cümle tekrarı)', '10.1111/j.1467-9280.2009.02370.x', 'benlik'),
            ('3069875', 'Braith 1988 (30 subklinik kaygılı kişi, tek seans kayıttan PKG)', '10.1016/0005-7916(88)90040-7', 'güvenlik'),
            ('32820538', 'Farias 2020 (83 çalışma; istenmeyen etkiler toplam %8,3, deneysel %3,7, gözlemsel %33,2)',
             '10.1111/acps.13225', 'güvenlik, sakin, benlik'),
            ('28300508', 'Howard 2017 (klinik yorum ve 3 vaka; dönüşün önemi)', '10.1080/00029157.2016.1203281', 'güvenlik'),
            ('34260686', 'Tran 2021 (ayağa kalkınca ilk KB düşüşü)', '10.1093/ageing/afab090', 'güvenlik'),
            ('24882909', 'Cordi 2014 (70 sağlıklı genç kadın; telkin ve şekerleme)', '10.5665/sleep.3778', 'sakin, teslim, güvenlik'),
            ('24146758', 'Cramer 2013 (yoga yan etkileri, vaka raporları)', '10.1371/journal.pone.0075515', 'güvenlik'),
            ('31357980', 'Cramer 2019 (gözetimsiz pratik ve yan etkiler)', '10.1186/s12906-019-2612-7', 'güvenlik'),
            ('3148637', 'Ley 1988 (kuramsal derleme; kronik olarak hızlı soluyanlar; ikinci turda yeniden doğrulanmadı)',
             '10.1016/0005-7916(88)90054-7', 'güvenlik §2'),
            ('10483629', 'Khasky & Smith 1999 (uzaklaşma hissi; ikinci turda yeniden doğrulanmadı)', '10.2466/pms.1999.88.2.409', 'güvenlik §2')]
    for r in refs:
        a('| %s | %s | %s | %s |' % r)
    a('')
    a('Kaynak: PubMed (National Library of Medicine), dosyalardaki okumalar üzerinden. Bu metin hiçbir sonucu vaat etmez.')
    a('')


def write(L):
    P = []
    a = P.append
    F = compute(L)
    part_head(L, F, a)
    part_1(L, F, a)
    part_15(L, F, a)
    part_2(L, F, a)
    part_3(L, F, a)
    part_4(L, F, a)
    part_5(L, F, a)
    part_6_8(L, F, a)
    with open(os.path.join(HERE, 'ders2.script.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(P) + '\n')


if __name__ == '__main__':
    write(json.load(open(os.path.join(HERE, 'ders2.lesson.json'), encoding='utf-8')))
