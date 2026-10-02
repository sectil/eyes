#!/usr/bin/env python3
"""Nefona Yoga · Ders 2 "Derin Dinlenme" · zamanlama denetleyicisi ve başvuru planlayıcısı.

Ne yapar:
  ders2.lesson.json'u okur; 5..30 dakikanın HER dakikası için, üç eklemleme hızında (5.2 / 5.6 / 6.6 hece/sn)
  ve her hızda iki TTS-içi duraklama profilinde (düşük = Neslihan v2 ölçümü, yüksek = Hakan v2 ölçümü) planı kurar
  ve denetler. Bir "vaka" (hız × dakika) ancak iki duraklama profilinde de bütün denetimler geçerse GEÇER. 3 × 26 = 78 vaka.

Planlayıcı (PLAN §B.3'ün kesin hali; lib/yoga.js bunun aynısını uygular):
  1. Sabit kapaklar: hedef <= 720 sn ise Varış ve Kapanış'ın KISA metni, değilse UZUN metni. Kapaklar eksiksiz çalar.
  2. Taban: bütün P1 blokların zorunlu klipleri (+ köprüler + minTarget'i dolan zorunlu klipler). Tabanın EN KISA hali
     (sessizlikler min) hedefe sığmazsa P1 bloklar planner.p1DropOrder sırasıyla düşer (Ders 2: C2, N2, N1; C1 hiç);
     en az bir P1 kalır. Bu yalnız acil durum yoludur; denetim bu dersin her süresinde bütün P1 blokları ister.
  3. Artımlar tek bir sıralı listedir (fillRank / entryRank): P2..P5 blokların girişi (öncelik sırasıyla) ile isteğe bağlı
     klip "dalgaları" araya girer; genişletme klipleri bütün isteğe bağlı kliplerden SONRA gelir. Bir artım, bütün
     sessizlikler pref değerindeyken toplam hedefe sığıyorsa eklenir. Sığmıyorsa ama mevcut içerik sessizlikler max'ta
     bile hedefe yetmiyorsa, artım en kısa haliyle (sessizlikler min) sığdığı sürece yine eklenir (hedefe ulaşmak için
     gereken içerik). Aksi halde ilk sığmayan artımda durulur (önek kuralı; belirlenimci).
  4. Sessizlik dağıtımı: kalan süre R = hedef - konuşma. R, sessizliklerin min..pref aralığındaysa hepsi aynı oranla
     min'den pref'e; pref..max aralığındaysa pref'ten max'a esnetilir. R > max toplamı ise İÇERİK HATASI (sessizlik
     sınırı aşılarak kapatılmaz; CRITIQUE #3). Konuşma klipleri asla hızlandırılmaz ya da kırpılmaz.

Süre modeli (VARSAYIM; ölçümlerden kalibre, bkz. ders2.script.md §2):
  klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar (klip içindeki noktalama) + uç payı
  - Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2); taşıyıcıdan kesilen mikro-klip 0,15 sn.
  - Duraklamalar (sn): düşük profil = Neslihan v2 (cümle 0,17, virgül 0,05, noktalı virgül/iki nokta 0,12, üç nokta 0,32);
    yüksek profil = Hakan v2 (0,87 / 0,38 / 0,60 / 1,53). 5,2 hece/sn (REST speed≈0,8) iken duraklamalar ×1,25.

Çalıştırma:  python3 timing.py            (ders2.lesson.json yanında; çıktı: timing.out.txt)
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LESSON_PATH = os.path.join(HERE, 'ders2.lesson.json')
OUT_PATH = os.path.join(HERE, 'timing_alt.out.txt')
CAPF = float(os.environ.get('CAPF','0.5'))

RATES = [5.2, 5.6, 6.6]                    # hece/sn, duraklamalar hariç (2026-09-28 ölçümleri)
SPEED_PAUSE_SCALE = {5.2: 1.25, 5.6: 1.0, 6.6: 1.0}
PROFILES = {
    'lo': {'sent': 0.17, 'comma': 0.05, 'semi': 0.12, 'ell': 0.32},   # Neslihan v2 (en kısa gözlenen)
    'hi': {'sent': 0.87, 'comma': 0.38, 'semi': 0.60, 'ell': 1.53},   # Hakan v2 (en uzun gözlenen)
}
EDGE = 0.31
EDGE_MICRO = 0.15
MINUTES = list(range(5, 31))

# Denetim eşikleri (VARSAYIM; PLAN C.2 yoğunluk bantları + pay). Sonuca bakılarak gevşetilmedi.
CLIP_MAX_SEC = 15.0
WINDOW_MAX = 90.0
DENS_MAX_SYLL_60 = 150.0      # herhangi bir 60 sn penceresinde en çok hece
DENS_MAX_FRAC_60 = 0.60       # herhangi bir 60 sn penceresinde en çok konuşma payı
DEEP_MAX_SYLL_60 = 110.0      # tamamen "Derin" evredeki 60 sn pencerede en çok hece
DEEP_MAX_FRAC_60 = 0.45
AVG_BAND = (40.0, 130.0)      # planın ortalama hece/dakika bandı
LAST_SEC = 60.0               # son 60 sn kuralı (güvenlik §11.D-3)
TEXTURE_MAX_RUN = 300.0       # >= 20 dk planlarda en uzun "doku" koşusu (CRITIQUE #21: her 3–5 dk değişim)
FILLERS = ['şimdi', 'sadece', 'yalnızca', 'hafifçe', 'yavaşça']   # E.6 #6: dakikada en çok bir
CLOSING_STEPS = ['nefes', 'parmak', 'gerin', 'goz', 'oda', 'yan', 'otur', 'bekle']
ROTATION_ORDER = ['sag', 'sol', 'sirt', 'on', 'butun']

VOWELS = set('aeıioöuüâîûAEIİOÖUÜÂÎÛ')
WORD_RE = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+")

FORBIDDEN = [  # PLAN C.6 + güvenlik §11.B; hepsi küçük harfle, sözcük başı eşleşmesi
    'tedavi', 'iyileştir', 'iyileşir', 'şifa', 'detoks', 'kanıtlan', 'bilimsel', 'stres', 'kaygı', 'anksiyete',
    'uykusuzluk', 'frekans', 'hertz', 'teta', 'bilinçaltı', 'programla', 'çekim yasası', 'bolluk', 'çakra',
    'enerji', 'kontrolü bırak', 'kendini kaybet', 'irade', 'kıpırdayamı', 'tamamen gevşe', 'derin bir nefes al',
    'nefesini tut', 'hipnoz', 'trans', 'şükür', 'harikayım', 'sevilmeye değer', 'mucize', 'garanti',
    'uykuya dal', 'uyuyabilir', 'uyursan', 'uyku gel',     # gündüz dersi: uyku izni yok
]
ENGLISH = ['mindfulness', 'body scan', 'relax', 'okay', 'ok ', 'yoga nidra', 'breath', 'scan', 'nidra']
SANSKRIT = ['sankalpa', 'yoga', 'nidra', 'şavasana', 'savasana', 'prana', 'pranayama', 'mantra', 'drişti',
            'bramari', 'şodana', 'sakshi', 'çakra']
IMPERATIVE_END = re.compile(
    r"\b(dön|otur|aç|bak|bekle|kal|kalk|bırak|getir|seç|söyle|tut|al|ver|say|izle|dinle|gevşe|et|başla|yap)\s*[.;!]")


# ----------------------------------------------------------------------------------------------- metin yardımcıları
def syllables(text):
    return sum(1 for ch in text if ch in VOWELS)


def words(text):
    return WORD_RE.findall(text)


def sentences(text):
    t = text.strip()
    parts = [s for s in re.split(r'[.!?]+(?:["”’])?\s+', t) if WORD_RE.search(s)]
    return parts


def internal_pauses(text, prof):
    t = text.strip()
    t = re.sub(r'[\s"”’.!?…]+$', '', t)          # son noktalama klibin kuyruğudur (uç payına dahil)
    t = t.replace('...', '…')
    n_ell = t.count('…')
    t2 = t.replace('…', ' ')
    n_sent = len(re.findall(r'[.!?]', t2))
    n_comma = t2.count(',')
    n_semi = t2.count(';') + t2.count(':') + t2.count('—')
    return (n_ell * prof['ell'] + n_sent * prof['sent'] + n_comma * prof['comma'] + n_semi * prof['semi'])


def profile(name, rate):
    s = SPEED_PAUSE_SCALE[rate]
    return {k: v * s for k, v in PROFILES[name].items()}


def clip_dur(c, rate, prof):
    edge = EDGE_MICRO if c.get('carrier') else EDGE
    return c['syllables'] / rate + edge + internal_pauses(c['text'], prof)


# ----------------------------------------------------------------------------------------------- planlayıcı
def load(path=LESSON_PATH):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def block_map(lesson):
    return {b['id']: b for b in lesson['blocks']}


def caps_for(lesson, T):
    var = 'short' if T <= lesson['planner']['capThresholdSec'] else 'long'
    A = next(b for b in lesson['blocks'] if b['kind'] == 'arrival' and b['variant'] == var)
    K = next(b for b in lesson['blocks'] if b['kind'] == 'closing' and b['variant'] == var)
    return var, A, K


def assemble(lesson, T, A, K, sel, inc):
    bm = block_map(lesson)
    core = sorted((bm[i] for i in sel), key=lambda b: b['playOrder'])
    bridges = [b for b in lesson['blocks'] if b['kind'] == 'bridge']
    seq = []

    def add(b):
        for c in b['clips']:
            if c['tier'] == 'required':
                mt = c.get('minTarget')
                if mt is not None and T < mt:
                    continue
                seq.append((b['id'], c))
            elif c['id'] in inc:
                seq.append((b['id'], c))

    add(A)
    for b in core:
        for br in bridges:
            if br['placement'].get('before') == b['id']:
                add(br)
        add(b)
        for br in bridges:
            if br['placement'].get('after') == b['id']:
                add(br)
    add(K)
    return seq


def totals(seq, lesson, rate, prof):
    lead = lesson['leadIn']
    S = sum(clip_dur(c, rate, prof) for _, c in seq)
    g = {lv: lead[lv] + sum(c['gapAfter'][lv] for _, c in seq) for lv in ('min', 'pref', 'max')}
    g['cap'] = g['pref'] + CAPF * (g['max'] - g['pref'])
    return S, g


def increments(lesson):
    items = []
    for b in lesson['blocks']:
        if b['kind'] == 'core' and b['priority'] > 1:
            items.append((b['entryRank'], 0, 'block', b['id']))
    groups = {}
    for b in lesson['blocks']:
        if b['kind'] not in ('core',):
            continue
        for c in b['clips']:
            if c['tier'] in ('optional', 'extension'):
                key = (b['id'], c.get('fillGroup') or c['id'])
                groups.setdefault(key, []).append(c)
    for (bid, key), cs in groups.items():
        rank = min(c['fillRank'] for c in cs)
        items.append((rank, 1, 'group', (bid, key, [c['id'] for c in cs])))
    items.sort(key=lambda x: (x[0], x[1]))
    return items


def plan(lesson, T, rate, profname):
    prof = profile(profname, rate)
    bm = block_map(lesson)
    var, A, K = caps_for(lesson, T)
    core = sorted((b for b in lesson['blocks'] if b['kind'] == 'core'),
                  key=lambda b: (b['priority'], b['playOrder']))
    sel = [b['id'] for b in core if b['priority'] == 1]
    inc = set()
    notes = []

    def total(sel_, inc_, lv):
        S, g = totals(assemble(lesson, T, A, K, sel_, inc_), lesson, rate, prof)
        return S + g[lv]

    drop = [b for b in lesson['planner'].get('p1DropOrder', []) if b in sel] or list(reversed(sel))
    while total(sel, inc, 'min') > T and len(sel) > 1 and drop:
        d = drop.pop(0)
        sel.remove(d)
        notes.append('P1 blok düştü: ' + d)

    stop = None
    required_ids = {c['id'] for b in lesson['blocks'] for c in b['clips'] if c['tier'] == 'required'}
    for rank, _, kind, payload in increments(lesson):
        if kind == 'block':
            b = bm[payload]
            if any(r not in sel for r in b.get('requiresBlocks', [])):
                stop = (rank, payload, 'gereken blok yok')
                break
            if total(sel + [payload], inc, 'pref') <= T or (
                    total(sel, inc, 'cap') < T and total(sel + [payload], inc, 'min') <= T):
                sel = sel + [payload]
            else:
                stop = (rank, payload, 'sığmadı')
                break
        else:
            bid, key, ids = payload
            if bid not in sel:
                stop = (rank, key, 'blok seçili değil')
                break
            have = inc | set(ids) | required_ids
            cmap = {c['id']: c for c in bm[bid]['clips']}
            if any(r not in have for i in ids for r in cmap[i].get('requires', [])):
                stop = (rank, key, 'bağımlılık eksik')
                break
            if total(sel, inc | set(ids), 'pref') <= T or (
                    total(sel, inc, 'cap') < T and total(sel, inc | set(ids), 'min') <= T):
                inc = inc | set(ids)
            else:
                stop = (rank, key, 'sığmadı')
                break

    seq = assemble(lesson, T, A, K, sel, inc)
    S, g = totals(seq, lesson, rate, prof)
    R = T - S
    status = 'ok'
    if R < g['min'] - 1e-9:
        status, mode, f = 'overfull', 'min', 0.0
    elif R <= g['pref'] + 1e-9:
        mode = 'min→pref'
        f = (R - g['min']) / (g['pref'] - g['min']) if g['pref'] > g['min'] else 1.0
    elif R <= g['max'] + 1e-9:
        mode = 'pref→max'
        f = (R - g['pref']) / (g['max'] - g['pref']) if g['max'] > g['pref'] else 1.0
    else:
        status, mode, f = 'underfull', 'pref→max', 1.0

    def gapval(gd):
        if mode == 'min':
            return gd['min']
        if mode == 'min→pref':
            return gd['min'] + f * (gd['pref'] - gd['min'])
        return gd['pref'] + f * (gd['max'] - gd['pref'])

    events = []
    t = gapval(lesson['leadIn'])
    for bid, c in seq:
        d = clip_dur(c, rate, prof)
        gap = gapval(c['gapAfter'])
        events.append({'block': bid, 'clip': c, 'start': t, 'end': t + d, 'dur': d, 'gap': gap})
        t += d + gap
    return {'T': T, 'rate': rate, 'prof': profname, 'variant': var, 'A': A['id'], 'K': K['id'],
            'sel': sel, 'inc': inc, 'events': events, 'total': t, 'status': status, 'mode': mode, 'f': f,
            'speech': S, 'gaps': g, 'notes': notes, 'stop': stop}


# ----------------------------------------------------------------------------------------------- denetimler
def window_segments(p):
    segs = []
    for ev in p['events']:
        if ev['clip'].get('window'):
            segs.append((ev['end'], ev['end'] + ev['gap']))
    return segs


def density(p):
    """1 sn adımla kayan 60 sn pencereler: hece, konuşma payı, evre."""
    T = p['total']
    evs = p['events']
    wins = window_segments(p)
    worst = {'syll': 0.0, 'frac': 0.0, 'deep_syll': 0.0, 'deep_frac': 0.0, 'dead': []}
    w = 0.0
    while w + 60.0 <= T + 1e-6:
        a, b = w, w + 60.0
        syl = sp = 0.0
        phases = set()
        for ev in evs:
            ov = max(0.0, min(b, ev['end']) - max(a, ev['start']))
            if ov > 0:
                syl += ev['clip']['syllables'] * ov / ev['dur']
                sp += ov
                phases.add(ev['clip']['phase'])
        worst['syll'] = max(worst['syll'], syl)
        worst['frac'] = max(worst['frac'], sp / 60.0)
        if phases == {'Derin'}:
            worst['deep_syll'] = max(worst['deep_syll'], syl)
            worst['deep_frac'] = max(worst['deep_frac'], sp / 60.0)
        if sp == 0.0 and not any(max(0.0, min(b, e) - max(a, s)) > 0 for s, e in wins):
            worst['dead'].append(round(a, 1))
        w += 1.0
    total_syll = sum(ev['clip']['syllables'] for ev in evs)
    worst['avg'] = total_syll / (T / 60.0)
    return worst


def texture_runs(p):
    """Dokular: klip etiketi 'texture'; >= 20 sn sessiz pencere kendi başına bir doku sayılır."""
    runs = []
    cur, start = None, 0.0
    for ev in p['events']:
        tx = ev['clip']['tags'].get('texture', ev['block'])
        if tx != cur:
            if cur is not None:
                runs.append((cur, start, ev['start']))
            cur, start = tx, ev['start']
        if ev['clip'].get('window') and ev['gap'] >= 20:
            runs.append((cur, start, ev['end']))
            runs.append(('sessizlik', ev['end'], ev['end'] + ev['gap']))
            cur, start = None, ev['end'] + ev['gap']
    if cur is not None:
        runs.append((cur, start, p['total']))
    return runs


def check_plan(lesson, p):
    fails = []
    T = p['T']
    bm = block_map(lesson)
    evs = p['events']
    ids_in = [ev['clip']['id'] for ev in evs]

    # (a) toplam = hedef ±1 sn
    if p['status'] != 'ok':
        fails.append('durum=%s (konuşma %.1f, sessizlik min/pref/max %.1f/%.1f/%.1f)' % (
            p['status'], p['speech'], p['gaps']['min'], p['gaps']['pref'], p['gaps']['max']))
    if abs(p['total'] - T) > 1.0:
        fails.append('toplam %.1f != hedef %d' % (p['total'], T))
    # (b) varış ve kapanış eksiksiz
    for cap in (bm[p['A']], bm[p['K']]):
        need = [c['id'] for c in cap['clips'] if c['tier'] == 'required'
                and (c.get('minTarget') is None or T >= c['minTarget'])]
        miss = [i for i in need if i not in ids_in]
        if miss:
            fails.append('%s eksik: %s' % (cap['id'], miss))
    # (c) üst üste binme yok; (d) sessizlik sınırları
    for i, ev in enumerate(evs):
        g = ev['clip']['gapAfter']
        if ev['gap'] < g['min'] - 1e-6 or ev['gap'] > g['max'] + 1e-6:
            fails.append('%s sessizliği %.2f sınır dışı [%s, %s]' % (ev['clip']['id'], ev['gap'], g['min'], g['max']))
        if ev['clip'].get('window') and ev['gap'] > WINDOW_MAX + 1e-6:
            fails.append('%s penceresi %.1f > %d sn' % (ev['clip']['id'], ev['gap'], WINDOW_MAX))
        if i and ev['start'] < evs[i - 1]['end'] - 1e-9:
            fails.append('üst üste binme: ' + ev['clip']['id'])
    # (e) son 60 sn: yeni imge, çağrışım, zor blok, pencere yok
    for ev in evs:
        if ev['end'] > p['total'] - LAST_SEC:
            tg = ev['clip']['tags']
            if tg.get('image') == 'new' or tg.get('evocation') or bm[ev['block']].get('hard'):
                fails.append('son 60 sn içinde yeni imge/zor blok: ' + ev['clip']['id'])
            if ev['clip'].get('window'):
                fails.append('son 60 sn içinde sessiz pencere: ' + ev['clip']['id'])
    # (f) 5 dk = varış + en az bir P1 + kapanış; bu derste ek koşul: bütün P1 bloklar (niyet başta ve sonda) her sürede
    p1 = [b['id'] for b in lesson['blocks'] if b['kind'] == 'core' and b['priority'] == 1]
    have_p1 = [b for b in p1 if b in p['sel']]
    if not have_p1:
        fails.append('hiç P1 blok yok')
    if set(have_p1) != set(p1):
        fails.append('eksik P1 blok: %s' % sorted(set(p1) - set(have_p1)))
    # anahtar cümle: K1, K2, K3 birer kez, sırayla, giderek kısa
    keys = [(ev['clip']['tags'].get('key'), ev['clip']['syllables']) for ev in evs if ev['clip']['tags'].get('key')]
    if [k for k, _ in keys] != [1, 2, 3]:
        fails.append('anahtar cümle sırası %s' % [k for k, _ in keys])
    elif not (keys[0][1] > keys[1][1] > keys[2][1]):
        fails.append('anahtar cümle giderek kısalmıyor %s' % keys)
    # beden dolaşımı sırası
    secs = []
    for ev in evs:
        s = ev['clip']['tags'].get('section')
        if s and (not secs or secs[-1] != s):
            secs.append(s)
    core_secs = [s for s in secs if s in ROTATION_ORDER]
    if core_secs != ROTATION_ORDER:
        fails.append('beden dolaşımı sırası %s' % secs)
    # kapanış ritüeli sırası
    steps = []
    for ev in evs:
        s = ev['clip']['tags'].get('step')
        if s in CLOSING_STEPS and (not steps or steps[-1] != s):
            steps.append(s)
    if steps != CLOSING_STEPS:
        fails.append('kapanış sırası %s' % steps)
    # ortada çıkış kapısı (>= 20 dk)
    if T >= 1200 and not any(ev['clip']['tags'].get('safety') == 'mid' for ev in evs):
        fails.append('>= 20 dk: ortada "istediğin an" hatırlatması yok')
    # pencere: önce duyuru, sonra karşılama
    for i, ev in enumerate(evs):
        if ev['clip'].get('window'):
            if not ev['clip']['tags'].get('announce'):
                fails.append('pencere duyurusuz: ' + ev['clip']['id'])
            if i + 1 >= len(evs) or not evs[i + 1]['clip']['tags'].get('welcome'):
                fails.append('pencere sonrası karşılama yok: ' + ev['clip']['id'])
    # her blokta bilinçli sessizlik (>= 5 sn) ve planda en uzun boşluk >= 8 sn (E.6 #2)
    for bid in dict.fromkeys(ev['block'] for ev in evs):
        mg = max(ev['gap'] for ev in evs if ev['block'] == bid)
        if mg < 5.0 - 1e-6:
            fails.append('%s bloğunda >= 5 sn sessizlik yok (en uzun %.1f)' % (bid, mg))
    if max(ev['gap'] for ev in evs) < 8.0:
        fails.append('en uzun boşluk < 8 sn')
    # dolgu sözcükleri: aynı sözcük 60 sn içinde iki kez yok
    for fw in FILLERS:
        times = [ev['start'] for ev in evs for _ in range(len(re.findall(r'(?<!\w)' + fw + r'(?!\w)',
                                                                        ev['clip']['text'].lower())))]
        for a, b in zip(times, times[1:]):
            if b - a < 60.0:
                fails.append('dolgu "%s" 60 sn içinde iki kez (%.0f, %.0f)' % (fw, a, b))
    # klip uzunluğu (<= 15 sn, 6.6 hece/sn'de; spec)
    if p['rate'] == 6.6:
        for ev in evs:
            if ev['dur'] > CLIP_MAX_SEC:
                fails.append('klip > 15 sn: %s %.1f' % (ev['clip']['id'], ev['dur']))
    # yoğunluk
    d = density(p)
    if d['syll'] > DENS_MAX_SYLL_60:
        fails.append('60 sn penceresinde %.0f hece > %.0f' % (d['syll'], DENS_MAX_SYLL_60))
    if d['frac'] > DENS_MAX_FRAC_60:
        fails.append('60 sn penceresinde konuşma payı %.2f > %.2f' % (d['frac'], DENS_MAX_FRAC_60))
    if d['deep_syll'] > DEEP_MAX_SYLL_60:
        fails.append('Derin evrede 60 sn penceresinde %.0f hece > %.0f' % (d['deep_syll'], DEEP_MAX_SYLL_60))
    if d['deep_frac'] > DEEP_MAX_FRAC_60:
        fails.append('Derin evrede konuşma payı %.2f > %.2f' % (d['deep_frac'], DEEP_MAX_FRAC_60))
    if d['dead']:
        fails.append('duyurusuz sessiz 60 sn pencereleri: %s' % d['dead'][:3])
    if not (AVG_BAND[0] <= d['avg'] <= AVG_BAND[1]):
        fails.append('ortalama %.0f hece/dk bant dışı %s' % (d['avg'], AVG_BAND))
    # dikkat eğrisi (>= 20 dk)
    runs = texture_runs(p)
    longest = max(runs, key=lambda r: r[2] - r[1])
    if T >= 1200 and longest[2] - longest[1] > TEXTURE_MAX_RUN:
        fails.append('dikkat eğrisi: "%s" %.0f sn > %.0f' % (longest[0], longest[2] - longest[1], TEXTURE_MAX_RUN))
    return fails, d, runs


# ----------------------------------------------------------------------------------------------- metin denetimleri
def all_unique_clips(lesson):
    seen = {}
    for b in lesson['blocks']:
        for c in b['clips']:
            seen.setdefault(c['id'], (b['id'], c))
    for ex in lesson.get('extras', {}).values():
        for c in ex['clips']:
            seen.setdefault(c['id'], (ex['id'], c))
    return seen


def lint_text(lesson):
    out = []
    fails = []
    clips = all_unique_clips(lesson)
    texts = [c['text'] for _, c in clips.values()] + [car['text'] for car in lesson['carriers']]
    low = '\n'.join(t.lower() for t in texts)
    for w in FORBIDDEN:
        if re.search(r'(?<!\w)' + re.escape(w), low):
            fails.append('yasak ifade: "%s"' % w)
    for w in ENGLISH:
        if w.strip() and re.search(r'(?<!\w)' + re.escape(w.strip()) + r'(?!\w)', low):
            fails.append('İngilizce: "%s"' % w)
    # Sanskritçe: her biri en çok bir klipte (taşıyıcılar sayılmaz)
    for w in SANSKRIT:
        n = sum(len(re.findall(r'(?<!\w)' + w, c['text'].lower())) for _, c in clips.values())
        if n > 1:
            fails.append('Sanskritçe "%s" %d kez' % (w, n))
        elif n == 1:
            out.append('Sanskritçe "%s": 1 kez' % w)
    # cümle ve klip biçimi
    for bid, c in clips.values():
        if c.get('carrier'):
            continue
        ss = sentences(c['text'])
        if not 1 <= len(ss) <= 3:
            fails.append('%s: %d cümle' % (c['id'], len(ss)))
        for s in ss:
            n = len(words(s))
            if n > 14:
                fails.append('%s: %d sözcüklük cümle' % (c['id'], n))
        # emir kipi yalnız güvenlik/beden ipucunda
        if IMPERATIVE_END.search(c['text']) and c['tags'].get('mood') != 'safety':
            fails.append('%s: emir kipi (güvenlik etiketi yok): %s' % (c['id'], c['text']))
    for car in lesson['carriers']:
        n = len(car['items'])
        if n > 10:
            fails.append('taşıyıcı %s çok uzun (%d öğe)' % (car['id'], n))
    # E.6 #7: blok başına en çok bir açıklama cümlesi
    for b in lesson['blocks']:
        n = sum(1 for c in b['clips'] if c['tags'].get('explain'))
        if n > 1:
            fails.append('%s: %d açıklama cümlesi (> 1)' % (b['id'], n))
    # E.6 #14: TTS-içi duraklamalar dahil hiçbir klip 2,5 hece/sn'nin altına inmez (her hız × profil)
    slowest = (99.0, None)
    for bid, c in clips.values():
        if c.get('carrier') or c['syllables'] < 4:
            continue
        for rate in RATES:
            for pn in PROFILES:
                d = clip_dur(c, rate, profile(pn, rate)) - (EDGE_MICRO if c.get('carrier') else EDGE)
                r = c['syllables'] / d
                if r < slowest[0]:
                    slowest = (r, '%s @%.1f %s' % (c['id'], rate, pn))
                if r < 2.5:
                    fails.append('%s: %.2f hece/sn < 2,5 (%.1f, %s)' % (c['id'], r, rate, pn))
    out.append('en yavaş klip (duraklamalar dahil): %.2f hece/sn (%s)' % slowest)
    # PLAN B.5: "Kapanışa geç" kısa kapanışı 45–60 sn; Durdur sonrası sesli dönüş ~20 sn (15–25)
    for key, lo_, hi_ in (('quickClosing', 45.0, 60.0), ('stopReturn', 15.0, 25.0)):
        ex = lesson['extras'][key]
        for rate in RATES:
            for pn in PROFILES:
                pr = profile(pn, rate)
                d = sum(clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in ex['clips'])
                if not lo_ <= d <= hi_:
                    fails.append('%s %.1f sn, [%g, %g] dışında (%.1f, %s)' % (key, d, lo_, hi_, rate, pn))
    return fails, out


def repetition_warnings(lesson, plans):
    """Ardışık iki klipte aynı içerik sözcüğü (bilinçli tekrar etiketliler hariç). Uyarı listesi."""
    stop = set('ve ya da de bir bu şu o sen ben onu gibi daha biraz kendi istersen olur olabilir için ile ki '
               'her hiç çok en ne mi mı değil var yok sana seni senin bunu bunları bütün iki önce sonra edebilir edebilirsin'.split())
    pairs = {}
    for p in plans:
        evs = [ev for ev in p['events'] if not ev['clip'].get('carrier')]
        for a, b in zip(evs, evs[1:]):
            wa = {w.lower()[:5] for w in words(a['clip']['text']) if len(w) >= 4 and w.lower() not in stop}
            wb = {w.lower()[:5] for w in words(b['clip']['text']) if len(w) >= 4 and w.lower() not in stop}
            common = wa & wb
            allowed = set(a['clip']['tags'].get('repeatOk', [])) | set(b['clip']['tags'].get('repeatOk', []))
            common = {w for w in common if w not in allowed}
            if common:
                pairs[(a['clip']['id'], b['clip']['id'])] = sorted(common)
    return pairs


# ----------------------------------------------------------------------------------------------- çalıştırıcı
def fmt_blocks(p):
    order = []
    for ev in p['events']:
        if not order or order[-1] != ev['block']:
            order.append(ev['block'])
    return ' → '.join(order)


def block_secs(p):
    secs = {}
    for ev in p['events']:
        secs[ev['block']] = secs.get(ev['block'], 0.0) + ev['dur'] + ev['gap']
    return secs


def run_all(lesson):
    results = {}
    for rate in RATES:
        for m in MINUTES:
            T = m * 60
            case = {}
            for prof in ('lo', 'hi'):
                p = plan(lesson, T, rate, prof)
                fails, d, runs = check_plan(lesson, p)
                case[prof] = (p, fails, d, runs)
            results[(rate, m)] = case
    return results


def main():
    lesson = load()
    lines = []
    P = lines.append
    P('Nefona Yoga · Ders 2 "Derin Dinlenme" · timing.py çıktısı')
    P('Ders dosyası: ders2.lesson.json (sürüm %s)' % lesson['version'])
    P('Model: hece/hız + TTS-içi duraklama (düşük=Neslihan v2, yüksek=Hakan v2; 5,2\'de ×1,25) + uç payı 0,31 sn '
      '(mikro 0,15). Vaka = hız × dakika; iki duraklama profilinde de geçmeli.')
    P('')
    tf, tout = lint_text(lesson)
    P('== Metin denetimi ==')
    for o in tout:
        P('  bilgi: ' + o)
    P('  metin denetimi: %s' % ('GEÇTİ' if not tf else 'KALDI'))
    for f in tf:
        P('  HATA: ' + f)
    P('')
    results = run_all(lesson)
    n_pass = 0
    per_rate = {}
    P('== Vaka tablosu (her satır: hız, dakika, profil) ==')
    P('  kolonlar: sonuç | kapak | bloklar | klip sayısı | hece | konuşma % | sessizlik kipi f | en uzun boşluk | '
      'pencereler | en yoğun 60 sn (hece, pay) | ort. hece/dk')
    for (rate, m), case in results.items():
        ok = True
        for prof in ('lo', 'hi'):
            p, fails, d, runs = case[prof]
            if fails:
                ok = False
            wins = ','.join('%.0f' % ev['gap'] for ev in p['events'] if ev['clip'].get('window')) or '-'
            syl = sum(ev['clip']['syllables'] for ev in p['events'])
            P('  %s %.1f %2d dk %s | %-5s | %s | %3d | %4d | %4.1f%% | %s %.2f | %5.1f | %s | %3.0f, %.2f | %3.0f' % (
                'GEÇTİ' if not fails else 'KALDI', rate, m, prof, p['variant'], fmt_blocks(p), len(p['events']), syl,
                100 * p['speech'] / p['total'], p['mode'], p['f'], max(ev['gap'] for ev in p['events']), wins,
                d['syll'], d['frac'], d['avg']))
            for f in fails:
                P('      HATA: ' + f)
        per_rate.setdefault(rate, [0, 0])
        per_rate[rate][1] += 1
        if ok:
            per_rate[rate][0] += 1
            n_pass += 1
    P('')
    P('== Tekrar uyarıları (ardışık kliplerde aynı içerik sözcüğü; bilinçli olanlar etiketli) ==')
    reps = repetition_warnings(lesson, [c[pr][0] for c in results.values() for pr in ('lo', 'hi')])
    if not reps:
        P('  yok')
    for (a, b), ws in sorted(reps.items()):
        P('  %s → %s: %s' % (a, b, ', '.join(ws)))
    P('')
    P('== Kapanışa geç (hızlı kapanış) ve Durdur dönüşü (pref sessizliklerle) ==')
    for rate in RATES:
        for prof in ('lo', 'hi'):
            pr = profile(prof, rate)
            for key in ('quickClosing', 'stopReturn'):
                ex = lesson['extras'][key]
                s = sum(clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in ex['clips'])
                P('  %.1f %s %-12s %.1f sn' % (rate, prof, key, s))
    P('')
    P('== ÖZET ==')
    for rate in RATES:
        a, b = per_rate[rate]
        P('  %.1f hece/sn: %d/%d dakika GEÇTİ (düşük ve yüksek duraklama profilinde)' % (rate, a, b))
    P('  TOPLAM: %d/%d vaka GEÇTİ; metin denetimi %s' % (n_pass, len(results), 'GEÇTİ' if not tf else 'KALDI'))
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines[-6:]))
    return 0 if (n_pass == len(results) and not tf) else 1


if __name__ == '__main__':
    sys.exit(main())
