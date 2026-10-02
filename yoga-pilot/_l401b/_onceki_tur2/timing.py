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
OUT_PATH = os.path.join(HERE, 'timing.out.txt')

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
TEXTURE_MAX_RUN = 300.0       # en uzun "doku" koşusu (CRITIQUE #21: her 3–5 dk değişim); doku = blok × sunum biçimi
TEXTURE_FROM_SEC = 600        # doku denetimi 10 dk ve üstündeki her planda (T8-5; önceden yalnız >= 20 dk)
FILLERS = ['şimdi', 'sadece', 'yalnızca', 'hafifçe', 'yavaşça']   # E.6 #6: dakikada en çok bir
CLOSING_STEPS = ['nefes', 'parmak', 'gerin', 'goz', 'oda', 'yan', 'otur', 'bekle', 'kalk']
ROTATION_ORDER = ['sag', 'sol', 'sirt', 'on', 'butun']
# 2. tur denetimleri (hepsi VARSAYIM; bulgu kimlikleri fixlog.md'de)
STRETCH_CAP_BEFORE_INCREMENT = 0.5   # T5: artım, içerik f=0,5 esnemede hedefe yetmiyorsa girer (max değil)
COMPRESS_CAP_ON_ENTRY = 0.5          # T5'in simetriği: böyle giren artım sessizlikleri pref→min yolunun en çok yarısına sıkıştırır
FIT_SLACK = 0.0                     # T2 için denendi (0,25: artım, pref→min yolunun %25'i kadar sıkışarak da girerdi);
                                     # yoğunluk denetimini bozduğu için kapalı. Girişi T5 kuralı ve COMPRESS_CAP_ON_ENTRY yönetir.
STRETCH_MAX_UNSATURATED = 0.6        # T5/T8-2: içerik doymadan önce hiçbir dakikada f > 0,6 yok
STRETCH_MAX_AT_30 = 0.30             # T2/T8-2: 30:00'da f <= 0,30
BREATH_WAIT_MIN_SEC = 10.0           # T1: "birkaç nefes" / "nefes … kal" isteyen klipten sonra en az 10 sn
NUMBER_PERIOD = (4.0, 6.5)           # T3/T8-3: sayılar arası periyot (başlangıçtan başlangıca)
LOW_SPEECH_BEFORE_WINDOW = (60.0, 0.10)   # T3: pencereden önceki 60 sn'de konuşma payı >= %10
SPARSE_WINDOW = (180.0, 0.12)        # T8-4: pencere içermeyen her 180 sn'de konuşma payı >= %12
EYES_OPEN_BEFORE_IMAGERY_SEC = 60.0  # P-B2: C4 varsa c4.patika'dan önceki 60 sn'de gözleri açma seçeneği
SAME_GAP_RUN = (6, 2.0)              # P-S6: Derin evrede en çok 6 ardışık cümle boşluğu birbirine ±2 sn yakın
KEY_TWO_BELOW_SEC = 420              # B2: 7 dk'nın altında anahtar cümle iki kez (1 ve 3), 7 dk ve üstünde üç kez
DERIN_CLIP_RATE_CEIL = 5.0           # P-S1: Derin evre cümle kliplerinin medyan iç hızı (duraklamalar dahil), hece/sn
QUICK_BOUNDS = (60.0, 90.0)          # S10 + B2/T1/E7: "Kapanışa geç" dizisi (bekleme ve kalkış kısaltılamaz)
STOP_BOUNDS = (20.0, 30.0)           # S4: Durdur sonrası sesli dönüş 20–30 sn
DAWN_SPAN = (60.0, 90.0)             # N8/S18: şafak görseli 60–90 sn (PLAN E.2)
ABILIR_RUN_MAX = 3                   # T18: çalınan metinde art arda en çok 3 cümle "-(y)abilir(sin)" ile biter

VOWELS = set('aeıioöuüâîûAEIİOÖUÜÂÎÛ')
WORD_RE = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+")

FORBIDDEN = [  # PLAN C.6 + güvenlik §11.B; hepsi küçük harfle, sözcük başı eşleşmesi
    'tedavi', 'iyileştir', 'iyileşir', 'şifa', 'detoks', 'kanıtlan', 'bilimsel', 'stres', 'kaygı', 'anksiyete',
    'uykusuzluk', 'frekans', 'hertz', 'teta', 'bilinçaltı', 'programla', 'çekim yasası', 'bolluk', 'çakra',
    'enerji', 'kontrolü bırak', 'kendini kaybet', 'irade', 'kıpırdayamı', 'tamamen gevşe', 'derin bir nefes al',
    'nefesini tut', 'hipnoz', 'trans', 'şükür', 'harikayım', 'sevilmeye değer', 'mucize', 'garanti',
    'uykuya dal', 'uyuyabilir', 'uyursan', 'uyku gel',     # gündüz dersi: uyku izni yok
]
# E12: bildirimsel etki vaadi ve gelecek güvencesi. Anahtar cümleler ve k.son bu listeden muaftır (güvenlik §11.B-14
# kapanış cümlesini kendisi önerir); muafiyet yalnız bu listeye uygulanır, yukarıdaki FORBIDDEN'a değil.
FORBIDDEN_E12 = ['rahatla', 'rahatlarsın', 'gevşeyeceksin', 'gevşiyorsun', 'uyuyacak', 'iyi gelecek', 'geçecek',
                 'daha da derin', 'biraz daha dinleniyor', 'sakin;']
FORBIDDEN_WHITELIST = {'c1.k1', 'br.k2', 'k.anahtar3', 'k.son'}
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
    """T4: tek Varış ve tek Kapanış bloğu (12 → 13 dk kapak değişimi yok). Kapakların isteğe bağlı klipleri artımdır."""
    A = next(b for b in lesson['blocks'] if b['kind'] == 'arrival')
    K = next(b for b in lesson['blocks'] if b['kind'] == 'closing')
    return 'tek', A, K


def cap_ids(lesson):
    return {b['id'] for b in lesson['blocks'] if b['kind'] in ('arrival', 'closing')}


def with_variant(lesson, k):
    """P-N5: derse özgü açılış ve niyet cümlesinin seçenekleri (alternates). k=0 ana metin; k>0 k'inci seçenek (yoksa ana)."""
    if not k:
        return lesson
    import copy
    L = copy.deepcopy(lesson)
    for b in L['blocks']:
        for c in b['clips']:
            alts = c.get('alternates') or []
            if k - 1 < len(alts):
                c['text'] = alts[k - 1]['text']
                c['syllables'] = alts[k - 1]['syllables']
    return L


def n_variants(lesson):
    return 1 + max([len(c.get('alternates') or []) for b in lesson['blocks'] for c in b['clips']] + [0])


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
    # P-S6: bağlı çiftler; ortak klip hemen ardından geliyorsa ilk klibin boşluğu kısa (pairGap)
    for i, (bid, c) in enumerate(seq):
        if c.get('pairGap') and i + 1 < len(seq) and seq[i + 1][1]['id'] == c.get('pairWith'):
            cc = dict(c)
            cc['gapAfter'] = c['pairGap']
            seq[i] = (bid, cc)
    return seq


def totals(seq, lesson, rate, prof):
    lead = lesson['leadIn']
    S = sum(clip_dur(c, rate, prof) for _, c in seq)
    g = {lv: lead[lv] + sum(c['gapAfter'][lv] for _, c in seq) for lv in ('min', 'pref', 'max')}
    g['cap'] = g['pref'] + STRETCH_CAP_BEFORE_INCREMENT * (g['max'] - g['pref'])
    g['half'] = g['min'] + COMPRESS_CAP_ON_ENTRY * (g['pref'] - g['min'])
    g['fit'] = g['pref'] - FIT_SLACK * (g['pref'] - g['min'])
    return S, g


def increments(lesson):
    items = []
    for b in lesson['blocks']:
        if b['kind'] == 'core' and b['priority'] > 1:
            items.append((b['entryRank'], 0, 'block', b['id']))
    groups = {}
    for b in lesson['blocks']:
        if b['kind'] not in ('core', 'arrival', 'closing'):     # T4: kapakların isteğe bağlı klipleri de artım
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
    caps = cap_ids(lesson)
    for rank, _, kind, payload in increments(lesson):
        # T5: ikinci koşul "içerik max esnemede bile yetmiyor" değil, "f=0,5 esnemede yetmiyor" (g['cap'])
        if kind == 'block':
            b = bm[payload]
            if any(r not in sel for r in b.get('requiresBlocks', [])):
                stop = (rank, payload, 'gereken blok yok')
                break
            if total(sel + [payload], inc, 'fit') <= T or (
                    total(sel, inc, 'cap') < T and total(sel + [payload], inc, 'half') <= T):
                sel = sel + [payload]
            else:
                stop = (rank, payload, 'sığmadı')
                break
        else:
            bid, key, ids = payload
            if bid not in sel and bid not in caps:
                stop = (rank, key, 'blok seçili değil')
                break
            have = inc | set(ids) | required_ids
            cmap = {c['id']: c for c in bm[bid]['clips']}
            if any(r not in have for i in ids for r in cmap[i].get('requires', [])):
                stop = (rank, key, 'bağımlılık eksik')
                break
            if total(sel, inc | set(ids), 'fit') <= T or (
                    total(sel, inc, 'cap') < T and total(sel, inc | set(ids), 'half') <= T):
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


def delivery_mode(ev):
    c = ev['clip']
    if c.get('window'):
        return 'pencere-duyurusu'
    return 'mikro-liste' if c.get('carrier') else 'cümle'


def texture_runs(p):
    """P-S5: doku = blok × sunum biçimi (mikro-liste / cümle); >= 20 sn duyurulmuş pencere kendi başına bir dokudur.
    Etiketle bölünmüş aynı liste (sağ, sol, sırt, ön, bütün) artık TEK doku sayılır; bir cümle klibi listeyi böler."""
    runs = []
    cur, start = None, 0.0
    for ev in p['events']:
        mode = delivery_mode(ev)
        tx = '%s/%s' % (ev['block'], 'cümle' if mode == 'pencere-duyurusu' else mode)
        if tx != cur:
            if cur is not None:
                runs.append((cur, start, ev['start']))
            cur, start = tx, ev['start']
        if ev['clip'].get('window') and ev['gap'] >= 20:
            runs.append((cur, start, ev['end']))
            runs.append(('sessiz pencere', ev['end'], ev['end'] + ev['gap']))
            cur, start = None, ev['end'] + ev['gap']
    if cur is not None:
        runs.append((cur, start, p['total']))
    return runs


def speech_in(p, a, b):
    return sum(max(0.0, min(b, ev['end']) - max(a, ev['start'])) for ev in p['events'])


def stretch(p):
    """Esneme oranı: sessizlikler pref'ten max'a doğru ne kadar esnedi (min→pref kipinde 0)."""
    return p['f'] if p['mode'] == 'pref→max' else 0.0


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
    want = [1, 3] if T < KEY_TWO_BELOW_SEC else [1, 2, 3]      # B2: 7 dk'nın altında iki geçiş
    if [k for k, _ in keys] != want:
        fails.append('anahtar cümle sırası %s (beklenen %s)' % ([k for k, _ in keys], want))
    elif any(a[1] <= b[1] for a, b in zip(keys, keys[1:])):
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
        for s in (ev['clip']['tags'].get('step') or '').split('+'):
            if s in CLOSING_STEPS and (not steps or steps[-1] != s):
                steps.append(s)
    if steps != CLOSING_STEPS:
        fails.append('kapanış sırası %s' % steps)
    # ortada çıkış kapısı: S1 (güvenlik) — imgeleme (C4) planda olduğu her sürede, C4'ten hemen önce
    if 'C4' in p['sel']:
        mids = [i for i, ev in enumerate(evs) if ev['clip']['tags'].get('safety') == 'mid']
        c4s = [i for i, ev in enumerate(evs) if ev['block'] == 'C4']
        if not mids or mids[-1] > c4s[0]:
            fails.append('C4 var ama önünde "istediğin an" hatırlatması (br.orta) yok')
        # P-B2: c4.patika'dan önceki 60 sn'de gözleri açma seçeneği
        pat = next(ev for ev in evs if ev['clip']['id'] == 'c4.patika')
        if not any(ev['clip']['tags'].get('eyesOpen') and pat['start'] - ev['start'] <= EYES_OPEN_BEFORE_IMAGERY_SEC
                   and ev['start'] <= pat['start'] for ev in evs):
            fails.append('c4.patika öncesi %d sn içinde gözleri açma seçeneği yok' % EYES_OPEN_BEFORE_IMAGERY_SEC)
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
    # dikkat eğrisi (T8-5: >= 10 dk; doku = blok × sunum biçimi, P-S5)
    runs = texture_runs(p)
    longest = max(runs, key=lambda r: r[2] - r[1])
    if T >= TEXTURE_FROM_SEC and longest[2] - longest[1] > TEXTURE_MAX_RUN:
        fails.append('dikkat eğrisi: "%s" %.0f sn > %.0f' % (longest[0], longest[2] - longest[1], TEXTURE_MAX_RUN))
    fails += round2_checks(lesson, p)
    return fails, d, runs


def round2_checks(lesson, p):
    """2. tur denetimleri (fixlog.md: T1, T3, T8-3, T8-4, P-S6, N8/S18, T18). Eşikler VARSAYIM."""
    fails = []
    evs = p['events']
    T = p['total']
    # T1: "birkaç nefes" ya da "nefes … kal" isteyen klipten sonra, sonraki klibin başına kadar >= 10 sn
    for i, ev in enumerate(evs):
        low = ev['clip']['text'].lower()
        if 'birkaç nefes' in low or re.search(r'nefes\w*\b.*\bkal\b', low):
            nxt = evs[i + 1]['start'] if i + 1 < len(evs) else T
            if nxt - ev['end'] < BREATH_WAIT_MIN_SEC - 1e-6:
                fails.append('%s: nefes beklemesi %.1f sn < %g' % (ev['clip']['id'], nxt - ev['end'], BREATH_WAIT_MIN_SEC))
    # T3 / T8-3: sayılar arası periyot (başlangıçtan başlangıca)
    nums = [ev for ev in evs if ev['clip']['tags'].get('micro') == 'number']
    for a, b in zip(nums, nums[1:]):
        per = b['start'] - a['start']
        if not NUMBER_PERIOD[0] - 1e-6 <= per <= NUMBER_PERIOD[1] + 1e-6:
            fails.append('sayı periyodu %.2f sn [%g, %g] dışında (%s→%s)' % (per, NUMBER_PERIOD[0], NUMBER_PERIOD[1],
                                                                           a['clip']['id'], b['clip']['id']))
    # T3: duyurulmuş pencereden önceki 60 sn'de konuşma payı >= %10
    wins = [(ev['end'], ev['end'] + ev['gap']) for ev in evs if ev['clip'].get('window')]
    span, share = LOW_SPEECH_BEFORE_WINDOW
    for a, b in wins:
        lo = max(0.0, a - span)
        if a - lo >= 30 and speech_in(p, lo, a) / (a - lo) < share:
            fails.append('pencereden (%.0f sn) önceki %.0f sn\'de konuşma payı < %%%d' % (a, a - lo, 100 * share))
    # T8-4: pencereyle kesişmeyen her 180 sn'de konuşma payı >= %12
    span, share = SPARSE_WINDOW
    w = 0.0
    while w + span <= T + 1e-6:
        if not any(min(w + span, b) - max(w, a) > 0 for a, b in wins):
            if speech_in(p, w, w + span) / span < share:
                fails.append('seyrek 180 sn (%.0f–%.0f): konuşma payı < %%%d' % (w, w + span, 100 * share))
                break
        w += 5.0
    # P-S6: Derin evrede cümle boşlukları tekdüze sıralanmasın
    n_max, tol = SAME_GAP_RUN
    gaps = [ev['gap'] for ev in evs if ev['clip']['phase'] == 'Derin' and not ev['clip'].get('carrier')
            and not ev['clip'].get('window')]
    run_start = 0
    for j in range(len(gaps)):
        while max(gaps[run_start:j + 1]) - min(gaps[run_start:j + 1]) > tol:
            run_start += 1
        if j - run_start + 1 > n_max:
            fails.append('Derin evrede %d ardışık cümle boşluğu birbirine en çok %g sn yakın (tekdüze ritim)'
                         % (j - run_start + 1, tol))
            break
    # T18: ezgi tekdüzeliği; cümle sonları art arda en çok ABILIR_RUN_MAX kez "-(y)abilir(sin)"
    run = 0
    for ev in evs:
        if ev['clip'].get('carrier'):
            continue
        for snt in re.split(r'(?<=[.!?…])\s+', ev['clip']['text'].strip()):
            if not snt:
                continue
            run = run + 1 if re.search(r'[ae]bilir(sin)?$', snt.rstrip('.…" ')) else 0
            if run > ABILIR_RUN_MAX:
                fails.append('T18: art arda %d cümle "-abilir" ile bitiyor (%s)' % (run, ev['clip']['id']))
                break
        if run > ABILIR_RUN_MAX:
            break
    # N8/S18: şafak = max(k.donus başı, son − 90 sn) → süre 60–90 sn
    don = next((ev for ev in evs if ev['clip']['id'] == 'k.donus'), None)
    if don:
        dawn = T - max(don['start'], T - DAWN_SPAN[1])
        if dawn < DAWN_SPAN[0] - 1e-6:
            fails.append('şafak %.0f sn < %g (k.donus sonu çok yakın)' % (dawn, DAWN_SPAN[0]))
    return fails


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
    alt_texts = [a['text'] for _, c in clips.values() for a in (c.get('alternates') or [])]
    low = low + '\n' + '\n'.join(t.lower() for t in alt_texts)
    for w in FORBIDDEN:
        if re.search(r'(?<!\w)' + re.escape(w), low):
            fails.append('yasak ifade: "%s"' % w)
    for cid, (_, c) in clips.items():        # E12: bildirimsel etki vaadi (anahtar cümleler ve k.son muaf)
        if cid in FORBIDDEN_WHITELIST:
            continue
        for t in [c['text']] + [a['text'] for a in (c.get('alternates') or [])]:
            for w in FORBIDDEN_E12:
                if re.search(r'(?<!\w)' + re.escape(w), t.lower()):
                    fails.append('E12 etki vaadi: "%s" (%s)' % (w, cid))
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
    # cümle ve klip biçimi (P-N5 seçenek metinleri dahil)
    for bid, c in clips.values():
        if c.get('carrier'):
            continue
        for text in [c['text']] + [a['text'] for a in (c.get('alternates') or [])]:
            ss = sentences(text)
            if not 1 <= len(ss) <= 3:
                fails.append('%s: %d cümle' % (c['id'], len(ss)))
            for s in ss:
                n = len(words(s))
                if n > 14:
                    fails.append('%s: %d sözcüklük cümle' % (c['id'], n))
            # emir kipi yalnız güvenlik/beden ipucunda
            if IMPERATIVE_END.search(text) and c['tags'].get('mood') != 'safety':
                fails.append('%s: emir kipi (güvenlik etiketi yok): %s' % (c['id'], text))
        for a in (c.get('alternates') or []):
            if a['syllables'] != syllables(a['text']):
                fails.append('%s: seçenek hece sayısı tutmuyor' % c['id'])
    for car in lesson['carriers']:                 # taşıyıcı hece sayısı = kesilen kliplerin toplamı (+ atılan ön söz)
        items = [clips[i][1] for i in car['items']]
        if sum(c['syllables'] for c in items) + syllables(car.get('lead', '')) != car['syllables']:
            fails.append('taşıyıcı %s: hece sayısı kliplerle tutmuyor' % car['id'])
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
    # P-S1: Derin evre cümle kliplerinin iç hızı (hece ÷ klip süresi, uç payı hariç, klip içi duraklamalar dahil)
    meds = {}
    for rate in RATES:
        for pn in PROFILES:
            rs = sorted(c['syllables'] / (clip_dur(c, rate, profile(pn, rate)) - EDGE)
                        for _, c in clips.values() if not c.get('carrier') and c['phase'] == 'Derin'
                        and c['syllables'] >= 6)
            med = rs[len(rs) // 2]
            ok = med <= DERIN_CLIP_RATE_CEIL
            out.append('Derin cümle iç hızı %.1f %s: medyan %.2f, en yüksek %.2f hece/sn → yaşlı dinleyici çıtası (<= %g) %s'
                       % (rate, pn, med, rs[-1], DERIN_CLIP_RATE_CEIL, 'KARŞILANIYOR' if ok else 'karşılanmıyor'))
            meds.setdefault(rate, []).append(med)
    # Önerilen yol (REST hız 0,8 ≈ 5,2) en az bir ses tipinde çıtayı karşılamalı; metin çıtayı olanaksız kılmamalı.
    # Hangi yol ve sesin çıtayı karşıladığı sahip kararına girdi olarak yazılır (P-S1 madde 4).
    if min(meds[5.2]) > DERIN_CLIP_RATE_CEIL:
        fails.append('P-S1: önerilen yolda (5,2) hiçbir ses tipinde Derin medyan iç hız <= %g değil' % DERIN_CLIP_RATE_CEIL)
    # PLAN B.5 (2. tur): "Kapanışa geç" 60–90 sn (S10 + B2/T1/E7: bekleme ve kalkış kısaltılmaz); Durdur dönüşü 20–30 sn (S4)
    for key, (lo_, hi_) in (('quickClosing', QUICK_BOUNDS), ('stopReturn', STOP_BOUNDS)):
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
    # dakikalar arası denetimler (T4/T8-1 alt küme; T2/T5/T8-2 esneme; T2 büyüme)
    for rate in RATES:
        for prof in ('lo', 'hi'):
            ids = {m: [ev['clip']['id'] for ev in results[(rate, m)][prof][0]['events']] for m in MINUTES}
            for m in MINUTES:
                p, fails = results[(rate, m)][prof][:2]
                if m > MINUTES[0]:
                    lost = sorted(set(ids[m - 1]) - set(ids[m]))
                    if lost:
                        fails.append('alt küme bozuk: %d → %d dk düşen %s' % (m - 1, m, lost))
                    if m >= 20 and set(ids[m]) == set(ids[m - 1]):
                        fails.append('T2: %d dk içeriği %d dk ile aynı (yalnız sessizlik esniyor)' % (m, m - 1))
                if p['stop'] is not None and stretch(p) > STRETCH_MAX_UNSATURATED + 1e-9:
                    fails.append('T5: içerik doymadan esneme f=%.2f > %g' % (stretch(p), STRETCH_MAX_UNSATURATED))
                if m == 30 and stretch(p) > STRETCH_MAX_AT_30 + 1e-9:
                    fails.append('T2: 30:00\'da esneme f=%.2f > %g' % (stretch(p), STRETCH_MAX_AT_30))
    return results


def case_ok(case):
    return not case['lo'][1] and not case['hi'][1]


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
    variant_lines = []
    variants_ok = True
    for k in range(1, n_variants(lesson)):          # P-N5: seçenek metinleriyle aynı 78 vaka
        rk = run_all(with_variant(lesson, k))
        nk = sum(1 for c in rk.values() if case_ok(c))
        variants_ok &= (nk == len(rk))
        bad = ['%.1f %d dk %s: %s' % (r, m, pr, c[pr][1][0]) for (r, m), c in rk.items() for pr in ('lo', 'hi') if c[pr][1]]
        variant_lines.append('  seçenek takımı %d: %d/%d vaka GEÇTİ%s' % (k, nk, len(rk), ('; ilk hata ' + bad[0]) if bad else ''))
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
    P('== Seçenek metinleri (P-N5: açılış ve niyet cümlesinin dönüşümlü seçenekleri) ==')
    for ln in variant_lines or ['  seçenek yok']:
        P(ln)
    P('')
    P('== ÖZET ==')
    for rate in RATES:
        a, b = per_rate[rate]
        P('  %.1f hece/sn: %d/%d dakika GEÇTİ (düşük ve yüksek duraklama profilinde)' % (rate, a, b))
    P('  TOPLAM: %d/%d vaka GEÇTİ (ana metin); seçenek takımları %s; metin denetimi %s' % (
        n_pass, len(results), 'GEÇTİ' if variants_ok else 'KALDI', 'GEÇTİ' if not tf else 'KALDI'))
    P('  Kapsam: bu sayı zamanlama ve metin kurallarıdır; dinleme, söyleyiş ve insan onayı değildir (P-S1).')
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines[-7:]))
    return 0 if (n_pass == len(results) and not tf and variants_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
