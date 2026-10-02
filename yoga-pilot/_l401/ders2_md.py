"""ders2.script.md üreticisi (4. tur). Metin, boşluk, ipucu, sahne ve sürüm tabloları ders verisinden ve planlayıcıdan
okunur; belgedeki sayılar hesaplanır. Elle yazılan sayılar yalnız doğrulanmış dosyalardaki kanıt sayıları, ölçüm tablosu
(§2.1) ve VARSAYIM olarak işaretli tasarım değerleridir; önceki turlarla karşılaştırmalar _onceki_tur1/2/3'teki
verilerden hesaplanır."""
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
STEP_LABEL = {'yan': 'yana dönme', 'otur': 'doğrulup oturma', 'bekle': 'oturarak bekleme'}

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
              'C4': 'imge yayı', 'C5': 'sessiz dinlenme', 'N2': 'niyetin tekrarı', 'K': 'dışa dönüş ritüeli'}


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
    F['niyet'] = F['allc']['n1.sec'][1]['text'].split(': ', 1)[-1]        # hazır niyet, tırnaklı (TR3-04)

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
        'c1.x01', 'n2.dilek', 'k.yandakal', 'c1.tekrar', 'c1.kacirma', 'n1.birak', 'c4.iz', 'c4.isik',
        'c4.x.yaklas', 'c4.x.gok', 'c4.x.donus2', 'c2.durak', 'c2.x.ritim', 'c5.x.hepsi',
        'c5.x.yumusak', 'c5.x.oldugu', 'c3.s1', 'c3.r1')}
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
    qc, sr = {}, []
    q = L['extras']['quickClosing']
    F['qctx'] = timing.quick_contexts(L)
    for name, (entry, pre) in F['qctx'].items():
        for rate in timing.RATES:
            for prof in ('lo', 'hi'):
                _, tot = timing.seq_timeline(pre + q['clips'], rate, timing.profile(prof, rate), q.get('leadInSec', 0.0),
                                             entry)
                qc.setdefault(name, []).append(tot)
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            _, tot = timing.seq_timeline(L['extras']['stopReturn']['clips'], rate, timing.profile(prof, rate), 0.0,
                                         'Kapanış')
            sr.append(tot)
    F['qc'], F['sr'] = qc, sr
    F['qc_all'] = [v for vs in qc.values() for v in vs]
    # T6 üretim ve zarf köşeleri (L3-01, Z3-02)
    F['prod'] = F['slack5'][timing.PRODUCTION]
    F['env'] = F['slack5'][timing.ENVELOPE]
    # Z3-01 blok konuşma payı, Z3-09 düzlükler
    pseudo = {(r, m): {pr: (plans[(r, pr, m)], [], None, None) for pr in ('lo', 'hi')}
              for r in timing.RATES for m in range(5, 31)}
    F['shares'] = timing.block_shares(pseudo)
    F['plateaus'] = {(r, pr): timing.plateaus(pseudo, r, pr) for r in timing.RATES for pr in ('lo', 'hi')}
    # 30 dk'da blok payları (ayrıntı) ve konuşma dışı pay
    F['share30_blocks'] = {}
    for r in timing.RATES:
        for pr in ('lo', 'hi'):
            p = plans[(r, pr, 30)]
            for b in timing.BLOCK_SHARE_BLOCKS:
                evs = [ev for ev in p['events'] if ev['block'] == b]
                if evs:
                    F['share30_blocks'][(r, pr, b)] = (sum(ev['speech'] for ev in evs) /
                                                       sum(ev['dur'] + ev['gap'] for ev in evs))
    pz = plans[(6.6, 'lo', 30)]
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
    F['rate_lines'] = [o for o in lint_out if o.startswith('Derin cümle iç hızı')]
    F['rates'] = {}
    for o in F['rate_lines']:
        m = re.match(r'Derin cümle iç hızı ([0-9.]+) (\w+): medyan ([0-9.]+), en yüksek ([0-9.]+) hece/sn; etkin hız '
                     r'\(cümle arası sessizlik dahil\) medyan ([0-9.]+), en yüksek ([0-9.]+)', o)
        if m:
            F['rates'][(float(m.group(1)), m.group(2))] = tuple(float(m.group(i)) for i in range(3, 7))
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
    F['prev'] = prev_round_stats()
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
    # önceki turlar (karşılaştırma)
    F['old'] = {}
    for tag, sub in (('1', '_onceki_tur1'), ('2', '_onceki_tur2'), ('3', '_onceki_tur3')):
        path = os.path.join(HERE, sub, 'ders2.lesson.json')
        if os.path.exists(path):
            Lo = timing.load(path)
            F['old'][tag] = {'prosody': prosody_stats(Lo),
                             'full_syl': sum(c['syllables'] for b in Lo['blocks'] for c in b['clips'])}
    return F


def prev_round_stats():
    """3. turun verisi ve planlayıcısıyla (pilot/_onceki_tur3) karşılaştırma sayıları: blok girişleri, 5 dakikadaki
    "-(y)abil-" sayısı (bugünkü sayımla), 5 dakikanın boş payları ve sessizlik alt sınırları."""
    d = os.path.join(HERE, '_onceki_tur3')
    jp, tp = os.path.join(d, 'ders2.lesson.json'), os.path.join(d, 'timing.py')
    if not (os.path.exists(jp) and os.path.exists(tp)):
        return None
    spec = importlib.util.spec_from_file_location('timing_tur3', tp)
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
    slack = {(r, pr): 300 - pl[(r, pr, 5)]['speech'] - pl[(r, pr, 5)]['gaps']['min'] for r in mod.RATES
             for pr in ('lo', 'hi')}
    return {'c4_in': first(lambda p: 'C4' in p['sel']), 'c3_in': first(lambda p: 'C3' in p['sel']),
            'c5_in': first(lambda p: 'C5' in p['sel']),
            'abil5': (len(sc), sum(timing.n_abil(ev['clip']['text']) for ev in sc)), 'gmin': gmin, 'slack': slack,
            'full_syl': sum(c['syllables'] for b in Lo['blocks'] for c in b['clips'])}


def T(F, cid):
    return F['allc'][cid][1]['text']


def Q(F, cid):
    return '"%s"' % T(F, cid)


# ---------------------------------------------------------------------------------------------- belge: baş, §0
def part_head(L, F, a):
    uc, bm, key = F['uc'], F['bm'], F['key']
    IN = F['in']
    a('# Ders 2 · Derin Dinlenme (Yoga Nidra) · pilot metni')
    a('')
    a('Sürüm: %s. Bu dosya `ders2_kaynak.py`den üretilir (tek kaynak); aynı kaynaktan `ders2.lesson.json` çıkar. '
      'Zamanlama denetimi: `timing.py` → `timing.out.txt`. Bulguların tek tek karşılığı: `fixlog.md` (3. ve 4. tur '
      'tabloları). Depodaki (`/home/user/eyes`) hiçbir dosyaya dokunulmadı.' % L['version'])
    a('')
    ok_all = any('TOPLAM: 78/78' in x for x in F['summ'])
    a('**Durum, açıkça.** Bu, üçüncü tur incelemenin (Türkçe, güvenlik, hoca, kanıt, zaman ve dinleyici gözleri; 90 '
      'bulgu) bütün bulgularıyla yeniden yazılmış metindir. Seslendirme yolu artık açık bir soru değildir: sahip yalnız '
      'MCP yolunu seçti (2026-09-29; hız, seed, `previous_text` ve telaffuz sözlüğü yok). `timing.py` 5–30 dakikanın '
      'her dakikasını üç eklemleme hızında (5,6 üretim hızı; 6,6 hızlı uç; 5,2 muhafazakâr alt zarf) ve her hızda iki '
      'duraklama profiliyle kurdu: %s. Açılış ve niyet cümlesinin iki seçenek takımı ile iki sahne takımı (kıyı, orman) '
      'da aynı 78 vakayla ayrıca kuruldu (§2.5). **Bu sayı yalnız zamanlama ve metin kurallarıdır (P-S1):** dinleme, '
      'söyleyiş, ses kalitesi ve insan onayı bu sayının içinde değildir. Klip süreleri ölçüme dayanan tahminlerdir '
      '(VARSAYIM); bütün süreler %%5–10 uzun çıkarsa üç vaka düşer, kısa çıkarsa hiçbiri (sarsıntı taraması, §2.5). Henüz '
      'hiçbir cümle '
      'seslendirilmedi. Anadili Türkçe bir insan editörün, yoga nidra eğitimi almış bir hocanın ve en az bir 65 yaş '
      'üstü dinleyicinin bulunduğu kör panelin onayı henüz yok (CRITIQUE #22). Bu yüzden ders "bitti" sayılmaz.' % (
          '78 vakanın 78\'i geçti' if ok_all else 'sonuç §2.5\'te'))
    a('')
    a('## 0. Tek bakışta')
    a('')
    a('| | |')
    a('|---|---|')
    a('| Söz (kart) | %s (EV3-12: sonuç sözü değil davet; Türkçe editör onayı) |' % L['tagline'])
    a('| Kartın kanıt satırı (EV3-05) | "%s" |' % L['evidenceLine'])
    a('| Varsayılan süre | %d dakika (H13: varsayılan sürümde zıtlık çiftleri de var; C3 hıza göre %s. dakikadan '
      'itibaren girer) |' % (L['defaultMinutes'], rng(IN['c3.agir'])))
    a('| Açılış ekranı (veride: `openingScreen`, `openingNotice`; güvenlik §8, §11.A, §11.E) | %s |'
      % ' · '.join('"%s"' % t for t in L['openingScreen']))
    a('| Hazırlık kartı (başlamadan önce; P-S13) | %s · tek dokunuşluk ayar: "%s" (L2-10; profilde yaş 60 ve üstüyse '
      'önceden işaretli, L3-10) · ilk Yoga oturumunda 10 sn\'lik ses denemesi: "%s" (L3-10) |' % (
          ' · '.join(L['preparationCard']), L['preparationToggles'][0]['label'], L['soundCheck']['question']))
    a('| Sahne seçici (başlamadan önce; H6, L2-04) | %s. Varsayılan: son seçim; ilk seferde **Orman** (L3-05). Seçim, '
      'kaldığın yer kaydına seçenek dizini ile birlikte yazılır |' % ' / '.join(o['label'] for o in L['scenePicker']['options']))
    ac = F['allc']['a.acilis'][1]
    a('| Derse özgü açılış cümlesi | "%s" (dönüşümlü seçenekler: %s; L3-12) |' % (
        ac['text'], ' · '.join('"%s"' % x['text'] for x in ac['alternates'])))
    a('| Ortak çıkış cümlesi | %s Varışta her sürümde; imgeleme olan her sürümde (%s. dakikadan itibaren) imgenin hemen '
      'önünde bir kez daha, kıpırdama izni, açık gözün serbest bakışı ve tarafsız dayanakla: %s |' % (
          Q(F, 'a.izin'), rng(IN['c4.yer']), Q(F, 'br.orta')))
    a('| Anahtar cümle, giderek kısa | 1) "%s" (%d hece) · 2) "%s" (%d; yalnız zıtlık ya da imgeleme varken, %s. '
      'dakikadan itibaren; kör panel "sen uyanıksın"ı kurnazlık diye duyarsa yedeği "%s", TR3-08) · 3) "%s" (%d) |' % (
          key[1]['text'], key[1]['syllables'], key[2]['text'], key[2]['syllables'], rng(IN['br.k2']),
          key[2]['panelFallback']['text'], key[3]['text'], key[3]['syllables']))
    a('| Tek imge yayı | Kıyı ya da orman (seçicide ya da ders içinde; görüntü gelmese de, gözler açık kalsa da olur): '
      'patikanın başı → kendi hızında yürüyüş → uzaktan gelip giden ses → açık, aydınlık bir yere varış ve güneşin '
      'sıcaklığı (en kısa imgede de; L3-06) → yolun kenarında rahat bir köşe (%s. dakikadan; imgenin ilk artımı, MT3-11, '
      'TR3-05) → ayak tabanları, kendi izlerin, koku, esinti, ılık taş, ışık, gökyüzü → sessiz pencere → aynı patikadan '
      'dönüş → görüntü silinir, taşıyan zemin |' % rng(IN['c4.yerles']))
    a('| Niyet | Başta ve sonda. Hazır cümle: %s (TR3-04). 5 dakikada bir kez, 6 dakikadan itibaren üç kez söylenir '
      '(L3-03, MT3-05). "Sankalpa" yalnız ekranda ("%s") |' % (
          F['niyet'], bm['N1'].get('screenLabel', 'Niyet')))
    c1 = bm['C1']['clips']
    rot = ('sag', 'sol', 'sirt', 'on', 'butun')
    a('| Beden dolaşımı | sağ → sol → arka → ön → bütün, her sürümde bu sırada (en kısada %d nokta, en uzunda %d nokta; '
      'uzun sürümde ayrıca %d noktalık temas turu, bütün-beden doruğundan önce). Öğeler başlangıçtan başlangıca aynı '
      'periyotla gelir (2,4–3,2 sn; L2-08); göğüs ve karından önce ikinci atlama kapısı (S3-04) |' % (
          sum(1 for c in c1 if c.get('carrier') and c['tags'].get('section') in rot and c['tier'] == 'required'),
          sum(1 for c in c1 if c.get('carrier') and c['tags'].get('section') in rot),
          sum(1 for c in c1 if c['tags'].get('section') == 'temas' and c.get('carrier'))))
    a('| Nefes ve sayma | Her sürümde nefes, aynı klipte nefes dışı kapıyla (eller ya da açık gözler; G2-01). Beşten '
      'bire sayım %s., ondan bire sayım %s. dakikadan itibaren; sayılar başlangıçtan başlangıca 5,8–6,3 sn arayla, '
      'nefese hız dayatmadan (Z2-07). "Nefes kendiliğinden geliyor." ile "Kendiliğinden gidiyor." arasında bir nefes '
      'yarımı (2,5–4 sn; MT3-02) |' % (rng(IN['c2.n05']), rng(IN['c2.n10'])))
    a('| Zıtlık çiftleri | ağırlık / hafiflik (%s. dakikadan; "Ağırlığı hissetmesen de olur." her C3\'te, denemeden '
      'sonra; S3-03, MT3-09), sıcaklık / serinlik (%s. dakikadan; iki liste birlikte, Z3-05) |' % (
          rng(IN['c3.agir']), rng(IN['c3.sicak'])))
    a('| Sessiz pencereler | en çok 90 sn; önce duyurulur (duyuru bir kapı taşır), sonra karşılanır: imge (%s. dk\'dan), '
      'sessiz dinlenme (%s. dk\'dan), içten sayma (%s. dk\'dan) |' % (
          rng(IN['c4.pencere']), rng(IN['c5.pencere']), rng(IN['c2.x.kendin'])))
    a('| Cümleler arası sessizlik (MT3-02, L3-02) | Çok cümleli her klip tek TTS isteğidir, cümle sonlarından kesilir; '
      'uygulama araya evreye göre sessizlik koyar: Varış %s, Derinleşme %s, Derin %s, Kapanış %s sn (min / pref / max; '
      'nefes çiftinde %s; VARSAYIM) |' % tuple(
          '%s / %s / %s' % (n(g['min']), n(g['pref']), n(g['max'])) for g in (
              L['sentenceGapByPhase']['Varış'], L['sentenceGapByPhase']['Derinleşme'], L['sentenceGapByPhase']['Derin'],
              L['sentenceGapByPhase']['Kapanış'], L['sentenceGapBreathPair'])))
    a('| Kapanış | nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → birkaç nefes bekle → acele etmeden '
      'kalk (başın dönerse yeniden otur ve bekle) → kısa bir sessizlikten sonra tek başına "%s" |' % T(F, 'k.son'))
    a('| "Kapanışa geç" | o anki cümle biter; imge ya da zıtlık açıksa önce imge silinir ve zemine dönülür / hisler '
      'bırakılır (S3-01); 4 sn ön sessizlikte dönüş tınısı ve ses rampası (S3-02); sonra kısa kapanış (%s–%s sn) |' % (
          r1(min(F['qc_all'])), r1(max(F['qc_all']))))
    a('| Seslendirme | Yalnız MCP (sahip kararı). Öneri: bütün kliplerde `eleven_v4`; v2 kör karşılaştırmada aday. Üç '
      'aday ses (Neslihan, Hakan, tasarlanacak hoca sesi); klip başına en az 3 çekim (`generations_count`) |')
    a('| Zamanlama | **78/78 vaka** (5,2 zarf / 5,6 üretim / 6,6 hece/sn × 5..30 dk; her vaka iki duraklama profilinde) '
      '+ iki seçenek takımı + iki sahne takımı; 5 dakikanın üretim köşesinde (5,6 yüksek) %s sn boş pay (T6 tabanı 15), '
      'zarf köşesinde (5,2 yüksek) %s sn; 30:00\'da sessizlik esnemesi en çok %%%d |' % (
          r1(F['prod']), r1(F['env']), round(100 * max(F['stretch30'].values()))))
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
    sg = L['sentenceGapByPhase']
    sgs = lambda k: '%s–%s sn' % (n(sg[k]['min']), n(sg[k]['max']))
    a('| Varış | A | konuşma düzeyi (0 dB); eklemleme hızı her evrede aynı (MCP, sahip kararı); cümle arası sessizlik %s '
      '(MT3-02) | Varış yatağı, konuşmada ≈ −33 LUFS; ders 3 sn\'de açılır | en aydınlık (yine koyu) |' % sgs('Varış'))
    a('| Derinleşme | N1, C1 | −1,5 dB (netlik açıkken −0,5); cümleler kısalır (H12); cümle arası sessizlik %s | '
      '`n1.sec` klibinde Varış yatağı 1,5 dB daha kısılır (≈ −34,5 LUFS) | `n1.sec` klibinde daha loş |' % sgs('Derinleşme'))
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | −3 dB (netlik açıkken −1); en kısa cümleler; cümle arası '
      'sessizlik %s, nefes çiftinde %s–%s sn (MT3-02, L3-02); etkin Derin hızı §2.5 | `c2.dikkat` klibinde 8 sn '
      'çapraz geçişle Derin yatağı, konuşmada ≈ −36 LUFS. Doku katmanları (L2-13): `c3.agir` daha ince pad, `c4.yer` '
      'seyrek uzak piyano ve sahnenin doğa dokusu, `c4.solma` imge katmanı çekilir, `c5.basla` yalnız alçak, uzun '
      'yaylılar; her geçiş >= 8 sn, konuşmanın altında. Yalnız duyurulan >= 20 sn pencerelerde +6 dB (≈ −30), 6 sn\'lik '
      'rampayla; pencere bitmeden 8 sn önce 6 sn\'de iner (G2-11) | `c2.dikkat` klibinde en loş; `c4.yer` ile `c4.solma` '
      'arasında imge katmanı; pencerede biraz kararır ve yavaşlar, bitmeden 3 sn önce aydınlanır; sayılarda yumuşak '
      'nabız (profilde ışığa duyarlılık cevabı "evet/emin değilim" ise nabız yok) |' % (
          sgs('Derin'), n(L['sentenceGapBreathPair']['min']), n(L['sentenceGapBreathPair']['max'])))
    a('| Kapanış | K | `k.anahtar3` sonrasındaki 5–9 sn\'lik sessizlik boyunca −3 → 0 dB rampa (basamak yok, S18); '
      '"Artık dönüş zamanı." 0 dB\'de (L2-02) | `k.donus` klibinde Kapanış yatağı ve ondan 2 sn önce dönüş tınısı; '
      '`k.goz` klibinde sıcak "şafak" akoru (tını parlaklığı, ses yüksekliği değil); son 5 sn\'de söner | şafak 60–90 '
      'sn: başlangıcı `k.donus` ile "son − 90 sn"nin geç olanı; >= 60 sn\'lik rampa; parlaklık tavanı bağıl %15 '
      '(VARSAYIM) |')
    a('')
    a('**Seçilen yol: yalnız MCP (sahip kararı, 2026-09-29; EV3-01, L3-01, MT3-03, Z3-02, TR3-12).** Hız ayarı yoktur; '
      'eklemleme her evrede aynıdır ve evreden evreye düşmez. Azalan anlatım uzayan boşluk, kısalan cümle, cümleler '
      'arasına uygulamanın koyduğu sessizlik (MT3-02) ve −1,5 / −3 dB seviyeyle verilir (PLAN C.2). REST hız '
      'basamakları (0,90 → 0,85 → 0,80), `seed` ve `previous_text` uygulanmaz; 5,2 hece/sn satırları yalnız muhafazakâr '
      'alt zarftır (§2.2, §6).')
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
      'sonuç iddiası değildir; "uyanık kalıyorsun / uyanıksın" dersin şimdiki zamanla verilen yönergesidir (PLAN C.1 '
      'betimleme biçimi), bir durum tespiti değil (G2-08, EV3-11):' % (
          key[1]['syllables'], key[2]['syllables'], key[3]['syllables']))
    a('')
    a('1. `c1.k1`, beden dolaşımının sonunda: **"%s"** İlk geçiş izin kipindedir: bedenin dinlenmesi bir iddia değil, '
      'bir olanaktır (S17).' % key[1]['text'])
    a('2. `br.k2`, nefes bloğunun hemen ardından, **yalnız zıtlık (C3) ya da imgeleme (C4) seçiliyse** (H3; %s. '
      'dakikadan itibaren): **"%s"** Böylece iki anahtar cümle arasında her zaman bir blok vardır; kısa sürümlerde '
      'cümle bir slogan gibi üst üste gelmez. İyelik ilk geçişle aynıdır ("Bedenin"; uzaklaştırıcı "beden" yok, L3-14). '
      'Kör panel "sen uyanıksın"ı kurnazlık anlamında ("çok uyanıksın") duyarsa yedeği "%s" (TR3-08; durum iddiası '
      'yok, 16 → 13 → 8 kısalması korunur).' % (rng(IN['br.k2']), key[2]['text'], key[2]['panelFallback']['text']))
    a('3. `k.anahtar3`, dönüşün eşiğinde: **"%s"** Beden ile uyanıklık tek ad öbeğinde birleşir; bu, dersin adıdır, bir '
      'sonuç bildirimi değildir. Ardından 5–9 sn sessizlik gelir: tez yerine otursun, ses de bu sessizlikte Kapanış '
      'düzeyine çıksın (H4, L2-02). Kapanışın son cümlesi yayı iddiasız ve tek başına kapatır: bir sessizlikten sonra, '
      'baş dönmesi satırından ayrı bir klipte: "%s" (EV2-01, H9, MT3-04, L3-04).' % (key[3]['text'], T(F, 'k.son')))
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
      '**Kıyı**, **Orman** ya da **Ders içinde seçerim** der; ilk oturumda varsayılan **Orman**dır (L3-05: ilk dinleyici '
      '"ya da" kalıbını üç kez duymasın; varsayılan yaprak dokusuyla aynı sahne, su katmanı ve su güvenliği gerekmez). '
      'Seçim, kaldığın yer kaydına seçenek dizini ile birlikte '
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
      'giden ses → açık, aydınlık bir yere varış ve güneşin sıcaklığı (en kısa imgede de bir varış yeri var; L3-06, '
      'MT3-11) → yolun kenarında rahat bir köşe (%s. dakikadan; imgenin ilk artımı, sıra %d; TR3-05) → ayak tabanları '
      '(%s. dakikadan), yolda kalan kendi izlerin (L3-15), koku, esinti → "%s" (%s. dakikadan; L2-16) → ılık taş, ışık, '
      'gökyüzü → sessiz pencere (duyuru → kapı → dönüş sözü: "%s"; TR3-04, H15) → ışıkla gölgenin yer değiştirmesi → '
      'aynı patikadan, acele etmeden dönüş → patikanın başına yaklaşma (odaya değil; H14, TR2-11) → görüntü usulca '
      'silinir, seni taşıyan zemin.' % (
          rng(IN['c4.yerles']), F['allc']['c4.yerles'][1]['fillRank'], rng(IN['c4.adim']), T(F, 'c4.x.istemiyor'),
          rng(IN['c4.x.istemiyor']), T(F, 'c4.pencere')))
    a('')
    if minimal:
        a('**En kısa imge (%d. dakika, 5,6 hece/sn, yüksek profil) bile boş değildir (H2):** %s Görme dışında en az iki '
          'duyu (ses, sıcaklık) her C4\'te `c4.don` klibinden önce çalar (`timing.py` H2) ve her C4\'ün bir varış yeri '
          'vardır ("%s"; `timing.py` MT3-11). Dinlenecek köşe cümlesi isteğe bağlıdır, imgenin ilk artımıdır ve gerçek '
          'kapanış fiillerini ("otur", "uzan") kullanmaz: "%s" (G2-09, TR3-05, MT3-11, L3-06).' % (
              m_c4, ' → '.join('"%s"' % c['text'] for c in minimal), timing.split_keep(T(F, 'c4.gunes'))[0],
              T(F, 'c4.yerles')))
        a('')
    a('"X ya da Y" biçimi yalnız `c4.yer` klibinde kalır (MT3-06, L3-05); ana metnin öteki ayrıntıları (`c4.ses`, '
      '`c4.iz`, `c4.isik`, `c5.dusunce`) iki yere de uyar ve seçimi yeniden açmaz; sahne seçildiğinde "ya da" hiç '
      'duyulmaz. C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değil, duyu çağrışımıdır. Son 60 sn\'de yeni '
      'imge yoktur (her vakada denetlendi).')
    a('')
    a('"Gelip gitmek" dersin sözel motifidir: nefes (%s), imge (%s, %s) ve sessiz dinlenme (%s). Tarafsız dayanağın '
      'dili de tektir: **zemin** (%s, %s, %s, %s, %s, %s; "hep" yüklemin önünde, "seni" vurgulanmaz, TR3-03).' % (
          Q(F, 'c2.akis'), Q(F, 'c4.ses'), Q(F, 'c4.x.yaklas'), Q(F, 'c5.dusunce'), Q(F, 'a.agirlik'),
          Q(F, 'c1.x07'), Q(F, 'c3.zemin'), Q(F, 'br.orta').split('. ')[-1].rstrip('"').join(['"', '"']),
          Q(F, 'c4.solma').split('. ')[-1].rstrip('"').join(['"', '"']), Q(F, 'c5.sen')))
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
          Q(F, 'a.gozler'), timing.split_keep(T(F, 'c2.x.kendin'))[1]))
    a('')


# ---------------------------------------------------------------------------------------------- §2
def part_2(L, F, a):
    IN = F['in']
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
    a('- Eklemleme hızları: 5,6 (eleven_v4, ölçüm; **üretim hızı**), 6,6 (v2 varsayılan, ölçüm; hızlı uç), 5,2 (muhafazakâr '
      '**alt zarf**: MCP\'de üretilemez, tasarlanacak hoca sesi ölçülene kadar tutulur; Z3-02, L3-01, MT3-03). Yol yalnız '
      'MCP\'dir (sahip kararı, 2026-09-29); üretim köşesi 5,6 yüksek, zarf köşesi 5,2 yüksek.')
    a('- Duraklama profilleri (sn): **düşük** = Neslihan v2 en kısa gözlenen (cümle 0,17 · virgül 0,05 · iki nokta ya da '
      'noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2 '
      'zarfında duraklamalar ×1,25 alındı. Tasarlanacak hoca sesinin ölçülen hızı ve duraklama profili üçüncü satır '
      'olarak eklenir: `python3 timing.py --rate 7.1 --profile aday:0.30,0.10,0.20,0.60` (Z3-04).')
    a('- Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2), mikro-klip 0,15 sn (ilk üretimde ölçülüp '
      'değişecek; Z2-07). Taşıyıcının ön sözü (ör. "sayıyorum:") kesilip atılır, süreye girmez.')
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
    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2) zorunlu klipleriyle (`minTarget`\'i dolanlar dahil: "%s" %s. '
      'dakikadan). Köprü `br.k2` C2\'nin hemen ardından, **yalnız C3 ya da C4 seçiliyse** (`requiresAnyBlock`; H3); köprü '
      '`br.orta` C4\'ün olduğu her sürümde C4\'ün hemen önünde (S1). Taban en kısa haliyle de sığmazsa, yalnız acil durum '
      'yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu yol hiçbir vakada kullanılmadı.' % (
          T(F, 'c2.kal'), rng(IN['c2.kal'])))
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
      'sözcükleri 60 sn içinde ikinci kez yok; her hızda birimin konuşması <= 15 sn (yavaş ses dahil; Z3-07); "birkaç '
      'nefes" ya da "nefes … kal" isteyen '
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
      '>= 55 sn, niyet bloğu >= 20 sn; 5 dakikada (hedef < 6 dk) C2 >= 30 ve N2 >= 15 sn (H1; 4. turda N2 18 → 15, '
      'L3-03; sahibe görünür değişiklik, §7). C4 varsa `c4.don` klibinden önce en az iki görme dışı duyu klibi (H2). Anahtar cümle geçişleri arası üç '
      'geçişte >= 90, iki geçişte >= 60 sn (H3). C4 varsa `br.orta` klibinden önce Varış ya da C1\'de bir "zemin" '
      'klibi (H5). Her planda ortalama hece/cümle Derin < Derinleşme < Varış (H12). Tırnak içindeki nokta cümlenin '
      'ortasında olamaz (L2-11). 20 dakikadan itibaren en çok bir ardışık "düzlük" dakikası (T2, Z2-04; içten sayma '
      'grubu 60 sn\'den uzun olduğu için tek düzlük kaçınılmaz). 5 dakikanın boş payı (T6, >= 15 sn) artık üretim '
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
    a('- **Metin:** yasak sözcükler (PLAN C.6 + uyku izni) ve E12\'nin bildirimsel etki vaadi kökleri; **3. turda muafiyet '
      'yok** (anahtar cümleler ve son cümle de denetlenir; G2-08, EV2-01) ve "dinlenmiş", "iz bırak", "kalacak" kökleri '
      'eklendi (EV2-01, -02, -03); İngilizce; Sanskritçe her terim en çok bir kez; cümle <= 14 sözcük; klip 1–3 cümle; '
      'emir kipi yalnız güvenlik etiketli kliplerde; blokta en çok bir açıklama cümlesi; duraklamalar dahil hiçbir klip '
      '2,5 hece/sn\'nin altında değil; taşıyıcı hece sayıları kliplerle tutarlı; seçenek ve sahne metinleri de aynı '
      'kurallarla; kart ve ekran metinleri de aynı listelerle (EV3-06; "sakinleş", "huzur bul", "yenilen", "tazelen", '
      '"dinç", "gevşedin", "gevşemiş", "derin uyku" kökleri eklendi, EV3-13); "Kapanışa geç" her bağlamda 60–110 sn, '
      'pencerenin içinden 60–120 sn; Durdur dönüşü 20–30 sn; Derin evre cümle kliplerinin iç ve etkin hızı (aşağıda).')
    a('- **Tekrar uyarısı (L2-14; 4. tur TR3-06, MT3-16):** 10 sn içindeki ya da ardışık cümle kliplerinde aynı 5 harflik '
      'kök, "dön" gibi duyulan kısa kökler ve "arasından" gibi aynı ilgeç sözcüğü; sahne planları da taranır; aynı '
      'klibin ardışık iki cümlesi de denetlenir (3 harf ve üstü kök); bilinçli tekrarlar klipte etiketlidir. Bu turda '
      'uyarı: %s.' % (
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
      'cümle kliplerinin **iç hızı** (hece ÷ konuşma süresi, cümle içi TTS duraklamaları dahil) ve **etkin hızı** (hece ÷ '
      '(birimin konuşması + cümle arası uygulama sessizlikleri, pref); MT3-02) ayrıca ölçüldü ve bir tasarım tavanıyla '
      'karşılaştırıldı: **Derin evre iç hız tavanı (VARSAYIM; kanıta dayanmaz)**, <= 5,0 hece/sn (EV2-04):')
    a('')
    for line in F['rate_lines']:
        ln = line.replace('Derin cümle iç hızı ', '')
        ln = ln.replace('→ Derin evre iç hız tavanı (<= 5; VARSAYIM, kanıta dayanmaz) ', '→ tavana (<= 5) göre ')
        ln = re.sub(r'^(\d\.\d) lo', r'\1 düşük', re.sub(r'^(\d\.\d) hi', r'\1 yüksek', ln))
        a('- ' + re.sub(r'(\d)\.(\d)', r'\1,\2', ln))
    a('')
    R = F['rates']

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
          rr(5.6, 'lo'), rr(5.6, 'hi'), rr(6.6, 'lo'), rr(6.6, 'hi'), rr(5.2, 'lo'), rr(5.2, 'hi')))
    a('')
    a('**Sarsıntı taraması (Z2-04; bilgi, sonucu değiştirmez).** Bütün klip süreleri birlikte ölçeklenip 78 vaka yeniden '
      'kuruldu:')
    a('')
    a('```')
    for line in F['perturb']:
        a(line.rstrip())
    a('```')
    a('')
    a('Okuma: ölçülen sayılar "#" ile gösterildi; parantez içinde düşen vaka sayısı ve ilk üç vaka. Süreler %5–10 kısa '
      'çıkarsa (daha hızlı bir ses) 78 vaka geçmeyi sürdürür: 4. turda kısalan metin ve cümle arası boşluklar yoğunluk '
      'sınırlarına pay bıraktı. Hassas yön uzamadır: süreler %5–10 uzun çıkarsa (daha yavaş ya da daha uzun duraklayan '
      'bir ses) 5 dakikanın zarf köşesi (5,2 hi: 60 sn\'lik konuşma payı penceresi, H3 anahtar cümle aralığı, C2 '
      'bloğunun sığmaması), üretim köşesinde T6 boş payı (5,6 hi) ve 15–16. dakikada T5 esneme sınırı düşer. Bu yüzden '
      'eklemleme hızı 5,2 hece/sn\'nin altında kalan ya da Neslihan\'dan uzun duraklayan bir aday ses zarfın dışındadır '
      've ölçülmeden kör panele girmez (Z3-04, §6). Gerçek `voice.sec` değerleri gelince `timing.py` aynı denetimlerle '
      'yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır (§7).')
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
    plat = '; '.join('%s %s: %s' % (n(r), 'düşük' if pr == 'lo' else 'yüksek',
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
               '`c3.x.hepsi` ve `c5.x.dayanak` bu yüzden çıkarıldı, `n2.x.his` L3-07 gereği).'))
    a('')
    sh = F['shares']
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
          ek4(son_okunan(round(100 * max(F['stretch30'].values()))), 'i')))
    a('')


# ---------------------------------------------------------------------------------------------- §3
def intro(F, L):
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
                    a('| `%s` | %s | %s | %s | %s |' % (c['id'], blk, c['text'], n(c['gapAfter']['pref']), cue_str(c)))
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
      'eklendi (G2-04, G2-07). Bu sahip kararıdır (§7). 4. turda 5 dakika bir çerçeve değil bir ders olsun diye (MT3-05, '
      'L3-03): duruş cümlesi zemine yerleşmeyi de taşır, niyet başta ve sonda bir kez söylenir (kısa biçim), bekleme '
      'klibindeki üçüncü baş dönmesi satırı ve "Sözlerin ardından…" klibi çıktı, son cümle ayrı ve tek başına; kazanılan '
      'süre nefes akışının ardındaki sessizliğe verildi: 5 dakikada en uzun boşluk %s sn (L3-03 tabanı 16 sn; denetim). '
      'Kapanış yine ≈ 75 sn\'nin üstündedir; güvenlik payları kısaltılmadı.' % (
          span([x[0] for x in s5]), span([x[1] for x in s5]), span([x[2] for x in s5]), span([x[3] for x in s5]),
          span([x[3] - 75 for x in s5]), r1(max(ev['gap'] for ev in ref['events']))))
    a('')
    a('### 4.3 Blokların ve pencerelerin girdiği dakika')
    a('')
    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 sessiz dinlenme | imge penceresi | ilk genişletme | bütün içerik |')
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
    act_ids = [('örtü ve yastık (uzanmadan önce)', 'a.konfor'), ('uzanma ve zemine yerleşme', 'a.durus'),
               ('gözler', 'a.gozler'), ('kıpırdanıp yerleşme', 'a.x.kipir'), ('zemine yerleşme', 'a.agirlik'),
               ('niyeti seçme', 'n1.sec'), ('niyeti üç kez söyleme (başta)', 'n1.soyle'),
               ('niyeti üç kez söyleme (sonda)', 'n2.hatirla'), ('patikadan dönüş', 'c4.don'),
               ('parmaklar ve gerinme', 'k.hareket'), ('gözler ve çevre', 'k.goz'), ('yana dönme', 'k.yan'),
               ('doğrulup oturma', 'k.otur'), ('oturarak bekleme', 'k.bekle'), ('kalkış', 'k.kalk'), ('son cümle', 'k.son')]
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
         'altındadır: sahibe görünür değişiklik (C2 >= 30, N2 >= 15; §7, H1; L3-03, MT3-05: 5 dakikada niyet "bir kez '
         'daha"). 4. tur: iki eylemli hareket cümlesine 10 sn (MT3-14), uzanmadan önce örtü ve yastığa 12 sn (MT3-13, '
         'Z3-08), üç sessiz söyleyişe >= 10 sn (Z3-03).' % (
             ', '.join('%s %s' % (b, r1(v)) for b, v in sorted(F['bmin6'].items())), span(c1_5, 1), span(n1_5, 1),
             span(c2_5, 1), span(n2_5, 1)),
         'veri (`gapAfter.min`) + `timing.py` (T1, H1/B.3-8)', '**kısmen**'),
        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik; 5 dakikada en uzun boşluk %s sn (`c2.akis` '
         'ardında; L3-03 tabanı 16 sn, denetim); %s. dakikadan itibaren "%s" (`c2.kal`); 5 dakikada nefes bloğu dikkat → '
         'akış, iki satır birbirini iptal etmez (H1 a).' % (
             r1(max(ev['gap'] for ev in F['ref5']['events'])), rng(IN['c2.kal']), T(F, 'c2.kal')),
         '`timing.py` (L3-03)', 'evet'),
        ('Sessizliği korur', 'Üç pencere de (içten sayma, imge, sessiz dinlenme) duyurulur, bir kapı taşır ve karşılanır; '
         'duyuru → kapı → dönüş sözü sırası üçünde de aynı (TR3-04): duyurular "…sonra yine seslenirim." ile biter; '
         'kapılar "%s" (TR3-11), "İstediğin an gözlerini açabilirsin.", "Bir şey zor gelirse zemini hissedebilirsin."; '
         'karşılamalar %s, %s, %s. "Kapanışa geç" pencerenin içinden basılırsa da önce dönüş tınısı ve karşılama çalar '
         '(S3-01). Karşılamadan 2 sn önce dönüş tınısı; yatak kabarması rampalı (G2-11); hepsi <= 90 sn.' % (
             timing.split_keep(T(F, 'c2.x.kendin'))[1], Q(F, 'c2.x.donus'), Q(F, 'c4.donus1'), Q(F, 'c5.donus')),
         '`timing.py` (G2-02, S3-01)', 'evet'),
        ('Somut beden dili', 'ağırlık, hafiflik, ılıklık, serinlik, zemin, ayak tabanları, taşın ılıklığı, esinti, koku, '
         'avuçlar; "enerji" yok.', 'yasak liste + elle', 'evet'),
        ('Tutarlı yön', 'sağ → sol → arka → ön → bütün, her sürümde; temas turu bütün-beden doruğundan önce (H16).',
         '`timing.py`', 'evet'),
        ('Dolgu yok', 'Bütün metinde (seçenek ve sahne metinleri dahil): ' + ', '.join(
            '"%s" %d' % (w, k) for w, k in fillers.items()) + '; aynı sözcük 60 sn içinde iki kez geçmez; 10 sn '
         'içinde ya da ardışık cümle kliplerinde etiketsiz kök ya da ilgeç tekrarı yok, aynı klibin ardışık cümlelerinde '
         'de (L2-14, TR3-06, MT3-16). Olumsuzluk ve izin kalıpları seyreltildi: "…de olur" ve "gerek yok / gerekmiyor / '
         'zorunda değil" yalnız güvenlik ya da bağışlama taşıyan yerlerde (MT3-08).', '`timing.py`', 'evet'),
        ('Anlatmaz, yaşatır', 'Ayrı açıklama klibi yok; niyetin ne olduğu seçimle aynı klipte söylenir (S2-hoca, H1 b).',
         '`timing.py` (metin)', 'evet'),
        ('Tek imge yayı', 'Yalnız C4; sahne seçiciyle ya da ders içinde seçilir; §1.3.', 'etiket + son 60 sn denetimi',
         'evet'),
        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "atla" (`c1.cerceve`, `c1.gecis.on`), "…başın dönerse '
         'hareketi bırak.", "Sırtüstü yatıyorsan önce bir yanına dön.", "…doğrulup otur.", "…böyle kal.", "…yeniden '
         'otur ve bekle." ve Durdur dönüşü. Öteki yönergeler "-ebilirsin", "-mek yeterli" (niyeti söylemek de; S3-08), '
         '"sana kalmış", şimdiki zaman ya da isim cümlesiyle; itaat varsayan "söylüyorsun" yok (S3-08), dilek kipi '
         '"kalsın" yok (S3-09); "-(y)abil-" herhangi bir 60 sn\'de en çok 3 kez (TR2-03; hızlı kapanış dizilerinde de). '
         'Çifte izin yok.', '`timing.py` (metin)', 'evet'),
        ('Başarısızlığı normalleştirir', '%s (her sürümde) · %s · %s · %s · %s · %s · %s' % (
            Q(F, 'a.kolay'), Q(F, 'c1.kacirma'), Q(F, 'c2.birak').split('. ')[-1].join(['"', '']), Q(F, 'c3.gelmezse'),
            Q(F, 'c4.gelmezse'), Q(F, 'c4.donus1'), Q(F, 'c2.x.donus').split('. ')[-1].join(['"', ''])), 'elle', 'evet'),
        ('Çıkış kapısı', 'Açılışta ortak cümle ("…ya da dersi bitirebilirsin"; G2-03); nefese bakan her sürümde aynı '
         'klipte eller ve gözler (G2-01); imgeleme olan her sürümde (%s. dakikadan itibaren) imgeden hemen önce '
         'hatırlatma ve dayanak; dolaşımda atlama, göğüs ve karından önce ikinci kapı (S3-04); zıtlıkta "bu bölümü '
         'atlayıp zemini hissedebilirsin"; her pencere duyurusunda bir kapı (G2-02); imgenin içinde gözler; "Kapanışa '
         'geç" imgeden ve zıtlıktan çıkarken önce zemine döner (S3-01). Zor blok yok.' % rng(IN['c4.yer']),
         '`timing.py` (S1, P-B2, G2-01, G2-02, S3-01, S3-04)', 'evet'),
        ('Kapanış ritüeli', 'nefes → parmaklar ve gerinme → gözler ve çevre → yana dön → otur → bekle → kalk (başın dönerse '
         'yeniden otur ve bekle) → sessizlik → tek başına "%s" (MT3-04, L3-04). "Kapanışa geç" imge ya da zıtlık '
         'açıkken önce ön klip, 4 sn rampa sessizliği (S3-01, S3-02).' % T(F, 'k.son'), '`timing.py` (+ G2-04, S3-01)',
         'evet'),
        ('Azalan anlatım', 'Hız sabit (MCP, sahip kararı; EV3-01, MT3-03, L3-01); azalma kazançla (−1,5 / −3 dB evreye '
         'göre), cümle uzunluğuyla ve cümleler arası sessizlikle (Varış %s → Derin %s sn; MT3-02) verilir. Cümleler '
         'kısalır (H12): ortalama hece/cümle 5 dakikada Varış %s, Derinleşme %s, Derin %s; 30 dakikada %s, %s, %s (her '
         'planda Derin < Derinleşme < Varış).' % (
             '%s–%s' % (n(L['sentenceGapByPhase']['Varış']['min']), n(L['sentenceGapByPhase']['Varış']['max'])),
             '%s–%s' % (n(L['sentenceGapByPhase']['Derin']['min']), n(L['sentenceGapByPhase']['Derin']['max'])),
             r1(me[5]['Varış']), r1(me[5]['Derinleşme']), r1(me[5]['Derin']), r1(me[30]['Varış']),
             r1(me[30]['Derinleşme']), r1(me[30]['Derin'])),
         '`timing.py` (H12, L3-02) + üretim ölçümü', 'kısmen (kazanç ölçümü bekliyor)'),
        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden (klipler arası ve cümleler arası). '
         'Duraklamalar dahil en yavaş klip %s hece/sn; Derin evre iç ve etkin hızı ve tavanı (VARSAYIM) §2.5\'te; üretim '
         'köşesinde etkin medyan %s hece/sn.' % (
             F['slowest'], n(round(F['rates'][(5.6, 'hi')][2], 2)) if (5.6, 'hi') in F['rates'] else '?'),
         '`timing.py` (metin) + üretim ölçümü', 'kısmen (ölçüm bekliyor)'),
        ('Ses–müzik', 'Konuşmada yatak kısık ve sesin evresini izler (her evrede >= 15 dB; netlik kipinde 21 dB); doku '
         'katmanları blokla değişir (L2-13); kabarma yalnız pencerede ve rampalı (G2-11); doğa katmanı seçilen sahneyi '
         'izler (H6, L2-03). Kıyı seçen dinleyici için tam uyum su katmanının üretilmesine bağlıdır; üretilmezse Kıyı\'da '
         'doğa katmanı imge boyunca kısılır.', 'karışım ölçümü (bekliyor)', 'bekliyor; Kıyı için kısmen'),
        ('Kusursuz Türkçe', 'Dört editör turu (§5.4; 4. turda TR3-01–23: çeviri kokan yapılar, eşyazımlı tuzaklar ve '
         'noktalama); Scribe ile geri çevirme ve anadili Türkçe insan editör onayı bekliyor; vurgu tuzakları insan '
         'kulağıyla (TR3-18).',
         'elle + `timing.py` (metin)', 'kısmen'),
        ('Benzersizlik', '3. turda "evet" yazılmıştı; oysa C5 Ders 9\'un tanık göstergesini ("fark eden sensin") ve Ders '
         '5\'in açık izlemesini ("dikkatin geniş kalabilir", "sesler") taşıyordu: **hayır → düzeltildi (MT3-01)**. C5 '
         'artık "sessiz dinlenme"dir ve dersin kendi motiflerine bağlıdır: %s · %s · %s; `c5.genis` silindi, imgedeki '
         'sese tek geri çağrı `c5.dusunce`. Açılış cümlesi, anahtar cümle, kıyı/orman patika yayı ve sahne seçici, ufuk '
         'çizgisi formu ve Mi♭ yatağı yalnız bu derste; Ders 5\'in anahtar cümlesi yok (B1). Doğa imzası: Ders 2 kıyı '
         'dokusu ↔ Ders 9 okyanus ve Ders 2 rüzgâr-yaprak ↔ Ders 6 orman zemini çakışması kayda alındı, karar üretimden '
         'önce (MT3-15; PLAN A.2.1, §7).' % (Q(F, 'c5.basla'), Q(F, 'c5.sen'), Q(F, 'c5.x.hepsi')), 'ders düzeyi',
         'hayır → düzeltildi'),
        ('Yasak liste + güvenlik 18 kural', '§5.2; E12 kökleri muafiyetsiz denetlendi (kart ve ekran metinleri dahil; '
         'EV3-06, EV3-13).', '`timing.py` + tablo', 'evet'),
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
         'betimleme; emir kipi yalnız güvenlik adımlarında. İtaat varsayan şimdiki zaman yönergesi ("söylüyorsun") yok '
         '(S3-08); dilek kipi ("kalsın") yok (S3-09).'),
        ('Gözleri açık seçeneği', 'Açılışta `a.gozler` her sürümde: "%s" (S3-05: açık gözün bakışı hiçbir sürümde bir '
         'noktaya bağlı değil; G2-13 böylece 5–14 dakikada da doğru). Uzun iç bölümlerden önce: nefeste `c2.dikkat` '
         '("…ya da gözlerini açmak da olur."; G2-01: `timing.py` her planda bu klipte ya da ondan önceki 60 sn içinde bir '
         'gözleri açma seçeneği arar); içten sayma penceresinde "%s" (G2-02, TR3-11); imgelemeden önce `br.orta` '
         '("…gözlerini açmak, kıpırdamak ya da dersi bitirmek senin elinde. Gözlerin açıksa bakışın serbest."; G2-13, '
         'S3-06); imgenin ilk cümlelerinde `c4.gelmezse`; imgenin içindeki pencerede `c4.pencere` ("İstediğin an '
         'gözlerini açabilirsin."). (S1, B5, E9, P-B2.)' % (T(F, 'a.gozler'), timing.split_keep(T(F, 'c2.x.kendin'))[1])),
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
        ('Nefes tutma', 'Yok. Veriş sonundaki kısa duraklama söylenir ve yeni nefesin kendiliğinden gelişine bağlanır: "%s" '
         '(S14: uzatma yönergesi yok; TR3-10 "kısa"; L3-09: boş an yerine gelen nefes. MT3-08\'in "Uzatmaya gerek yok" '
         'kalsın önerisi L3-09\'a bırakıldı: kaygılı dinleyicide boş ana işaret etmemek güvenlik gerekçesidir, '
         'olumsuzluk kalıbı da böylece bir eksilir).' % T(F, 'c2.durak')),
        ('Tarafsız dayanak ve çıkış kapısı', 'Önce dayanak, zemin: Varış\'ta %s (`a.agirlik`, %s. dakikadan; imgeleme olan '
         'her planda `br.orta` klibinden önce çalar, `timing.py` H5), uzun sürümde temas turunda %s, imgeden hemen önce '
         '"Zemin seni hep taşıyor." (TR3-03). Nefeste kapı aynı klipte: eller ve gözler (`c2.dikkat`; G2-01, L2-01); %s. '
         'dakikadan dikkati ellerinde olana ayrı cümle (`c2.alt`; TR3-01). Zor bölüm sırasında kapı: zıtlıkta zemin '
         '(`c3.agir`), imgenin içinde gözler (`c4.gelmezse`, `c4.pencere`; orada "zemin" hayal edilen yer gibi '
         'duyulabilir), sessiz dinlenmede zemin (`c5.pencere`, `c5.sen`); imgeden dönüş yine zemine (`c4.solma`; hızlı '
         'kapanışta `k.hizli.imge` "Zemin seni taşıyor.", S3-01). Nefes tek dayanak değildir (S1). 5–6 dakikalık '
         'sürümlerde imge ve zıtlık yoktur; tek iç bölüm olan nefesin dayanağı eller ve gözlerdir.' % (
             Q(F, 'a.agirlik'), rng(IN['a.agirlik']), Q(F, 'c1.x07'), rng(IN['c2.alt']))),
        ('Beden taraması esnek', '`c1.cerceve`: "%s" (TR3-13). Göğüs ve karından en çok 120 sn önce ikinci kapı, '
         '`c1.gecis.on`: "%s" (S3-04; `timing.py`). Kalça, göğüs ve karın tek adla ve komşularıyla aynı periyotta geçer '
         '(G2-06; `timing.py`); nefes yeri için "ya da başka bir nokta" (S16).' % (
             timing.split_keep(T(F, 'c1.cerceve'))[1], T(F, 'c1.gecis.on'))),
        ('İmgeleme seçimli', 'Sahne seçici (Kıyı / Orman / Ders içinde seçerim; H6); ders içinde "Bir kıyı ya da bir '
         'orman."; "Bir görüntü gelmese de olur"; suya ve derinliğe girilmez, iniş yok (S3, B3, E1); su katmanı yalnız Kıyı '
         'seçene ve varsayılan olarak kapalı (S12). Örnekler tasarım önerisidir, Luu 2024 özetinde yok (sakin §11.7 '
         'düzeltmesi; EV2-10).'),
        ('Anı arama yok', 'Çağrışımlar yalnız nötr duyular (fincan, pencere, taş); kişisel anı istenmez. "%s" bir yönelim '
         'cümlesidir, anı araması değil.' % T(F, 'k.zaman')),
        ('Öz-şefkat kademeli', 'Bu derste öz-şefkat bloğu yok.'),
        ('Sağlık iddiası yok', 'Yasak liste ve E12\'nin etki vaadi kökleri temiz; 3. turda muafiyet yok: anahtar cümleler ve '
         'son cümle de denetlenir (G2-08, EV2-01); "dinlenmiş", "iz bırak", "kalacak" kökleri eklendi (EV2-01, -02, -03). '
         '4. turda kart ve ekran metinleri de denetlenir (kart sözü, açılış ekranı, hazırlık kartı, seçici etiketleri, '
         'akşam satırı, kanıt satırı, ses denemesi, Gelişim sorusu, ders sonrası soru; EV3-06) ve sekiz sonuç vaadi kökü '
         'eklendi (EV3-13). Kart sözü davettir: "%s" (EV3-12); kanıt satırı: "%s" (EV3-05).' % (
             L['tagline'], L['evidenceLine'])),
        ('Gündüz dersi uyandırmayla biter', 'Kapanış ritüeli; son cümle "%s" §11.B-14\'teki "uyanık ve dinlenmiş" yalnız bir '
         'örnektir ("… gibi bir cümle"); sonuç iddiası taşımayan biçim seçildi (EV2-01).' % T(F, 'k.son').split('. ')[-1]),
        ('Uyku dersi uyku izniyle biter', 'Uygulanmaz; gündüz dersinde uyku izni yok ("uykuya dal", "uyuyabilir", "uyursan" '
         'denetlendi). Dalıp gitme yalnız bağışlanır (P-S10). Akşam 20:00\'den sonra ders kartında uyku dersini gösteren tek '
         'satır: "%s" (L2-17; UI, VARSAYIM).' % L['eveningHint']['text']),
        ('Sessizlikler rehberli', 'Her pencere duyurulur, bir kapı taşır (G2-02), karşılanır ve <= 90 sn; duyuru süreyi '
         'doğru anlatır ("bir süre"; S15, P-S4); karşılamadan 2 sn önce dönüş tınısı.'),
        ('Beden hareketi hafif', '`k.hareket`: "%s" (G2-07, EV2-11; TR3-07: "hareketi bırak", tek okunuş; MT3-14: 10 sn); '
         '`k.kalk`: "%s" (G2-04); `k.bekle` yalnız "%s" (üçüncü baş dönmesi satırı çıktı; TR3-21, MT3-04, L3-04); Durdur '
         'dönüşü: "%s" (G2-05, TR3-22).' % (T(F, 'k.hareket'), T(F, 'k.kalk'), T(F, 'k.bekle'), T(F, 'd.bekle'))),
        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç, makine ve su uyarısı açılış ekranında ve **veride** '
         '(`openingNotice`, `openingScreen`), tek okunuşlu ve ölçünlü olumsuz biçimle: "%s" (S11, E10, TR2-23, S3-07). '
         'Dersten sonra atlanabilir tek soru ("%s") ve "Çok" cevabına güvenlik §11.F metni veride (`afterCheck`; '
         'EV3-05).' % (L['openingNotice'], L['afterCheck']['question'])),
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
         'temas turu, zıtlık listelerinin ek öğeleri, imgede dinlenme ayrıntıları, sessiz dinlenme cümleleri; hiçbir '
         'planda çalmayan genişletmeler çıkarıldı (Z3-06). 30:00\'da esneme en çok %%%d (§2.5).' % round(100 * max(F['stretch30'].values()))),
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
        ('18', 'Gelişim ölçeği ve alanlar', 'Tek ölçek 1–10 (yeniden kullanılan Dalga puan bileşeni 1–10; PLAN.v2 A.1 ve '
         'E.4 ile aynı; EV3-05\'in 0–10 önerisi bu yüzden alınmadı). Kartın kanıt satırı, kaynak kartı, Gelişim sorusu ve '
         'ders sonrası soru veride (`evidenceLine`, `sourcesCard`, `progress`, `afterCheck`; EV3-05).'),
        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili '
         'kör panel henüz yok. Bu derse özgü panel maddeleri veride (`panelChecks`): %s.' % '; '.join(
             x.split(':')[0] for x in L['panelChecks'])),
        ('30', 'Kaldığın yerden aynı plan', 'Planlayıcı belirlenimci; dönüşümlü seçenek dizini (`variantIndex`) ve sahne '
         'kayda yazılır.'),
        ('31', 'C.8 davet dili', 'Çifte izin yok; niyet şimdiki zamanla: "%s."' % T(F, 'n1.sec').split('. ')[0]),
    ]
    for c in crit:
        a('| %s | %s | %s |' % c)
    a('')
    nc, ns, abil, semi = prosody_stats(L)
    n_cl, n_ab, worst = F['abil5']
    a('### 5.4 Türkçe editör notları (3. tur TR2-01–TR2-24; 4. tur TR3-01–TR3-23)')
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
          Q(F, 'c1.cerceve'), Q(F, 'n2.dilek')))
    a('- **"-(y)abil-" yoğunluğu (TR2-03, H11):** 5 dakikalık sürümde %d cümle klibinde %d "-(y)abil-" var (klip başına '
      '%s; aynı sayımla üçüncü turda %s); herhangi bir 60 sn\'de en çok %d (`timing.py` sınırı 3; hızlı kapanışın her '
      'bağlamında da). Araçlar: "-mek yeterli" (niyeti söylemek de; S3-08), "sana kalmış", "var", şimdiki zaman '
      '("seçiyorsun", "fark ediyorsun", "hatırlıyorsun"), geniş zaman ("olmaz"), isim cümlesi ("Önce ağırlık.", "Beden '
      'kendi hâlinde."). Güvenlik sözleri ("…açabilir, kıpırdayabilir ya da dersi bitirebilirsin") değiştirilmedi.' % (
          n_cl, n_ab, n(round(n_ab / n_cl, 2)),
          ('%d klipte %d' % F['prev']['abil5']) if F['prev'] else '—', worst))
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
      'tarafı.", "Yüzün ve bedenin ön tarafı.", "Burun, göğüs, karın ya da başka bir nokta.", "Bir renk, bir biçim, bir '
      'doku.", "Uyanık bir dinlenme bu." Öznesi ya da bağlamı bir önceki cümlededir ya da bir işaret gibi kullanılır; '
      'konuşma dilinde doğaldır. Sahne yönergesi gibi duyulan "Sözlerin ardından kısa bir sessizlik." çıkarıldı (L3-07, '
      'MT3-10). İnsan editör yine de değerlendirmeli.')
    a('- **Anlatı kipi ve devrik cümle (T18):** imgede yürüyüş ve dönüş, niyette seçme ve söyleme, kapanışta yönelim '
      'şimdiki zamanla anlatılır ("kendi hızında yürüyorsun", "seçiyorsun", "hatırlıyorsun"): bu, PLAN C.1\'deki '
      'betimleme biçimidir, bir iddia değildir. Davet kipi girişte, yerleşmede ve dayanakta kalır. "Bir görüntü gelmese de '
      'olur, gözlerin açık kalsa da." ortak yüklemli devrik bir cümledir. İnsan editör bu dengeyi dinleyerek onaylamalı.')
    a('- **Ortak ek:** "açabilir, kıpırdayabilir ya da dersi bitirebilirsin" aynı kişi ve kipte olduğu için doğrudur; '
      '"oynatıp zorlamadan gerinebilirsin" zarf-fiille tek yüklemdir; "gözlerini açmak, kıpırdamak ya da dersi bitirmek '
      'senin elinde" üç mastarı tek yükleme bağlar; "Sırtüstü ya da yan yatıp zemine yerleşmen yeterli" iki durum '
      'zarfını tek zarf-fiile bağlar (TR3-02).')
    a('')


# ---------------------------------------------------------------------------------------------- §6–8
def part_6_8(L, F, a):
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
      'geçmeyen aday elenir ya da metin ayarlanır. Sarsıntı taraması (§2.5) süreler %5–10 uzun çıkınca üç vakayı '
      'düşürür (5 dakikanın zarf köşesi, üretim köşesinde T6, 15–16. dakikada T5); eklemleme hızı 5,2 hece/sn\'nin '
      'altında ya da duraklamaları Neslihan\'dan uzun bir aday bu yüzden zarfın dışındadır. Aday ses ölçülmeden hiçbir '
      'klip onunla üretilmez.')
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
    a('- **Sarsıntı payı (Z2-04):** bütün klip süreleri %5–10 kısa çıkarsa 78 vaka geçer; %5–10 uzun çıkarsa 75/78: '
      '5 dakikanın zarf köşesi (5,2 hi: konuşma payı penceresi, H3, C2 bloğu), üretim köşesinde T6 (5,6 hi; §2.5 '
      'tablosundaki boş pay %5 uzamada 15 sn tabanının altına iner) ve 15–16. dakikada T5. Gerçek süreler gelince '
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
