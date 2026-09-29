#!/usr/bin/env python3
"""Nefona Yoga · Ders 2 "Derin Dinlenme" · zamanlama denetleyicisi ve başvuru planlayıcısı (3. tur).

Ne yapar:
  ders2.lesson.json'u okur; 5..30 dakikanın HER dakikası için, üç eklemleme hızında (5.2 / 5.6 / 6.6 hece/sn)
  ve her hızda iki TTS-içi duraklama profilinde (düşük = Neslihan v2 ölçümü, yüksek = Hakan v2 ölçümü) planı kurar
  ve denetler. Bir "vaka" (hız × dakika) ancak iki duraklama profilinde de bütün denetimler geçerse GEÇER. 3 × 26 = 78 vaka.
  Aynı 78 vaka dönüşümlü seçenek takımlarıyla (P-N5) ve sahne takımlarıyla (kıyı, orman; H6/L2-04) ayrıca kurulur.

Planlayıcı (PLAN §B.3'ün kesin hali; lib/yoga.js bunun aynısını uygular):
  1. Tek Varış ve tek Kapanış bloğu (T4); zorunlu klipleri her sürede çalar.
  2. Taban: bütün P1 blokların zorunlu klipleri (+ koşulu tutan köprüler + minTarget'i dolan zorunlu klipler). Tabanın
     EN KISA hali (sessizlikler min) hedefe sığmazsa P1 bloklar planner.p1DropOrder sırasıyla düşer (acil durum yolu).
  3. Artımlar tek bir sıralı listedir (fillRank / entryRank). Bir artım, bütün sessizlikler pref değerindeyken toplam
     hedefe sığıyorsa eklenir. T5: mevcut içerik sessizlikler pref→max yolunun yarısına esnetildiğinde bile hedefe
     yetmiyorsa, artım sessizlikleri pref→min yolunun en çok yarısına sıkıştırarak sığıyorsa yine eklenir. İlk sığmayan
     artımda durulur (önek kuralı ⇒ plan(T) ⊆ plan(T+1)).
  4. Sessizlik dağıtımı: kalan süre R = hedef - konuşma; bütün sessizlikler aynı oranla min→pref ya da pref→max esner.
     R > max toplamı İÇERİK HATASIDIR (sessizlik sınırı aşılarak kapatılmaz). Konuşma asla hızlandırılmaz ya da kırpılmaz.
  5. (3. tur, L2-08 + Z2-07) Mikro-listelerde sessizlik "klipten sonra" değil, BAŞLANGIÇTAN BAŞLANGICA periyotla
     tanımlanır: onsetPeriod{min,pref,max}; sessizlik = max(gapFloor, periyot − klibin gerçek süresi). Böylece "diz…"
     ile "Sağ elin başparmağı…" aynı ritimle gelir. Bölüm sonu öğeleri (bilinçli durak) sabit gapAfter taşır.

Süre modeli (VARSAYIM; ölçümlerden kalibre, bkz. ders2.script.md §2):
  klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar (klip içindeki noktalama) + uç payı
  - Uç payı: normal klip 0,31 sn; taşıyıcıdan kesilen mikro-klip 0,15 sn (VARSAYIM; ilk üretimde ölçülüp değişecek, Z2-07).
  - Duraklamalar (sn): düşük profil = Neslihan v2; yüksek profil = Hakan v2. 5,2 hece/sn (REST speed≈0,8) iken ×1,25.

Çalıştırma:  python3 timing.py            (ders2.lesson.json yanında; çıktı: timing.out.txt)
"""
import copy
import json
import os
import re
import statistics
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
GAP_FLOOR = 0.8                            # L2-08: periyotlu mikro-klipten sonra en az 0,8 sn sessizlik (VARSAYIM)
DUR_SCALE = 1.0                            # Z2-04: sarsıntı taraması için bütün klip sürelerinin çarpanı (normalde 1)
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
TEXTURE_MAX_RUN = 300.0       # en uzun "doku" koşusu (CRITIQUE #21); doku = blok × sunum biçimi
TEXTURE_FROM_SEC = 600        # doku denetimi 10 dk ve üstündeki her planda
FILLERS = ['şimdi', 'sadece', 'yalnızca', 'hafifçe', 'yavaşça']   # E.6 #6: dakikada en çok bir
CLOSING_STEPS = ['nefes', 'parmak', 'gerin', 'goz', 'oda', 'yan', 'otur', 'bekle', 'kalk']
ROTATION_ORDER = ['sag', 'sol', 'sirt', 'on', 'butun']
# 2. tur denetimleri (hepsi VARSAYIM; bulgu kimlikleri fixlog.md'de)
STRETCH_CAP_BEFORE_INCREMENT = 0.5   # T5
COMPRESS_CAP_ON_ENTRY = 0.5          # T5'in simetriği
FIT_SLACK = 0.0
STRETCH_MAX_UNSATURATED = 0.6        # T5/T8-2
STRETCH_MAX_AT_30 = 0.30             # T2/T8-2
BREATH_WAIT_MIN_SEC = 10.0           # T1 (3. turda extras'a da uygulanır; dizinin son klibi muaf, Z2-01/G2-05)
NUMBER_PERIOD = (4.0, 6.5)           # T3/T8-3
LOW_SPEECH_BEFORE_WINDOW = (60.0, 0.10)
SPARSE_WINDOW = (180.0, 0.12)
EYES_OPEN_BEFORE_IMAGERY_SEC = 60.0  # P-B2
SAME_GAP_RUN = (6, 2.0)              # P-S6
QUICK_BOUNDS = (60.0, 95.0)          # PLAN B.5 (3. tur: G2-04 ve G2-07'nin güvenlik satırları + Z2-05 → üst sınır 95)
STOP_BOUNDS = (20.0, 30.0)           # PLAN B.5 (S4)
DAWN_SPAN = (60.0, 90.0)             # N8/S18
ABILIR_RUN_MAX = 3                   # T18
# 3. tur denetimleri (hepsi VARSAYIM; fixlog.md 3. tur tablosu)
DERIN_CLIP_RATE_CEIL = 5.0           # EV2-04: "Derin evre iç hız tavanı" (VARSAYIM; kanıta dayanmaz; yaşlı dinleyiciye
                                     # uygunluk kör panelde dinlenerek sınanır)
ABIL_RE = re.compile(r'(?<=\w)y?[ae]bil', re.I)   # TR2-03: "-(y)abil-" cümlenin HER yerinde
ABIL_MAX_60 = 3                      # TR2-03: herhangi bir 60 sn'de en çok 3 "-(y)abil-" (başlangıçlar 60 sn içinde)
ABIL_PER_CLIP_5MIN_TARGET = 0.6      # H11: 5 dk planında cümle klibi başına "-(y)abil-" (bilgi)
KEY_GAP_MIN_3 = 90.0                 # H3: üç geçişli biçimde ardışık anahtar cümleler arası en az 90 sn
KEY_GAP_MIN_2 = 60.0                 # H3: iki geçişli (C3/C4'süz) biçimde en az 60 sn (VARSAYIM; 5 dk'da C2+N2 kadar)
EYES_OPEN_BEFORE_BREATH_SEC = 60.0   # G2-01: c2.dikkat'ten önceki 60 sn'de (kendisi dahil) gözleri açma seçeneği
PERIOD_SPREAD_MAX = 0.6              # L2-08: mikro-liste içinde başlangıç periyotlarının yayılımı en çok 0,6 sn
SENSITIVE_WORDS = ('göğüs', 'karın', 'kalça', 'kalçalar')   # G2-06 (güvenlik §11.B-9; liste tasarım çıkarımı)
BLOCK_MIN = {'core': 55.0, 'niyet': 20.0}   # PLAN B.3 adım 8 (VARSAYIM)
BLOCK_MIN_AMEND = {'C2': 30.0, 'N2': 18.0}  # H1: Ders 2'nin 5 dk sürümü için sahibe görünür değişiklik (PLAN B.3 adım 8)
AMEND_BELOW_SEC = 360                # yalnız 5 dk (T < 6 dk)
T6_FLOOR = 15.0                      # T6/Z2-04: 5 dk'nın en yavaş köşesinde (5,2 yüksek) min sessizliklere göre boş pay
NONVISUAL_BEFORE_RETURN = 2          # H2: C4'te c4.don'dan önce en az 2 görme dışı duyu klibi
REP_WINDOW_SEC = 10.0                # L2-14: 10 sn içindeki cümle kliplerinde 5 harflik kök tekrarı (uyarı)
SHORT_ROOTS = ('dön',)               # L2-14: 5 harften kısa, duyulan kök (dönüş / dönebilir / dön)
PERTURB = (0.90, 0.95, 1.05, 1.10)   # Z2-04: sarsıntı taraması

VOWELS = set('aeıioöuüâîûAEIİOÖUÜÂÎÛ')
WORD_RE = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+")

FORBIDDEN = [  # PLAN C.6 + güvenlik §11.B; hepsi küçük harfle, sözcük başı eşleşmesi
    'tedavi', 'iyileştir', 'iyileşir', 'şifa', 'detoks', 'kanıtlan', 'bilimsel', 'stres', 'kaygı', 'anksiyete',
    'uykusuzluk', 'frekans', 'hertz', 'teta', 'bilinçaltı', 'programla', 'çekim yasası', 'bolluk', 'çakra',
    'enerji', 'kontrolü bırak', 'kendini kaybet', 'irade', 'kıpırdayamı', 'tamamen gevşe', 'derin bir nefes al',
    'nefesini tut', 'hipnoz', 'trans', 'şükür', 'harikayım', 'sevilmeye değer', 'mucize', 'garanti',
    'uykuya dal', 'uyuyabilir', 'uyursan', 'uyku gel',     # gündüz dersi: uyku izni yok
]
# E12: bildirimsel etki vaadi ve gelecek güvencesi. 3. tur: muafiyet listesi boşaltıldı (G2-08, EV2-01); "dinlenmiş",
# "iz bırak" ve "kalacak" eklendi (EV2-01, EV2-02, EV2-03).
FORBIDDEN_E12 = ['rahatla', 'rahatlarsın', 'gevşeyeceksin', 'gevşiyorsun', 'uyuyacak', 'iyi gelecek', 'geçecek',
                 'daha da derin', 'biraz daha dinleniyor', 'sakin;', 'dinlenmiş', 'iz bırak', 'kalacak',
                 'dinleniyorsun', 'dinleniyor;']
FORBIDDEN_WHITELIST = set()
ENGLISH = ['mindfulness', 'body scan', 'relax', 'okay', 'ok ', 'yoga nidra', 'breath', 'scan', 'nidra']
SANSKRIT = ['sankalpa', 'yoga', 'nidra', 'şavasana', 'savasana', 'prana', 'pranayama', 'mantra', 'drişti',
            'bramari', 'şodana', 'sakshi', 'çakra']
IMPERATIVE_END = re.compile(
    r"\b(dön|otur|aç|bak|bekle|kal|kalk|bırak|getir|seç|söyle|tut|al|ver|say|izle|dinle|gevşe|et|başla|yap|atla)\s*[.;!]")
INNER_QUOTE_PERIOD = re.compile(r'[.!?]["”]\s+\S')   # L2-11: tırnak içindeki nokta cümlenin ortasında


# ----------------------------------------------------------------------------------------------- metin yardımcıları
def syllables(text):
    return sum(1 for ch in text if ch in VOWELS)


def words(text):
    return WORD_RE.findall(text)


def sentences(text):
    t = text.strip()
    parts = [s for s in re.split(r'[.!?]+(?:["”’])?\s+', t) if WORD_RE.search(s)]
    return parts


def n_abil(text):
    return len(ABIL_RE.findall(text))


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
    return DUR_SCALE * (c['syllables'] / rate + edge + internal_pauses(c['text'], prof))


def gap_of(c, rate, prof):
    """Klipten sonraki sessizlik sınırları {min,pref,max}. L2-08/Z2-07: onsetPeriod varsa sessizlik = periyot − süre
    (en az gapFloor); yoksa gapAfter (bağlı çiftte pairGap, assemble() tarafından yazılır)."""
    per = c.get('onsetPeriod')
    if not per:
        return c['gapAfter']
    d = clip_dur(c, rate, prof)
    fl = c.get('gapFloor', GAP_FLOOR)
    return {lv: max(fl, per[lv] - d) for lv in ('min', 'pref', 'max')}


# ----------------------------------------------------------------------------------------------- planlayıcı
def load(path=LESSON_PATH):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def block_map(lesson):
    return {b['id']: b for b in lesson['blocks']}


def caps_for(lesson, T):
    A = next(b for b in lesson['blocks'] if b['kind'] == 'arrival')
    K = next(b for b in lesson['blocks'] if b['kind'] == 'closing')
    return 'tek', A, K


def cap_ids(lesson):
    return {b['id'] for b in lesson['blocks'] if b['kind'] in ('arrival', 'closing')}


def with_variant(lesson, k):
    """P-N5: derse özgü açılış ve niyet cümlesinin seçenekleri (alternates). k=0 ana metin."""
    if not k:
        return lesson
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


def scene_names(lesson):
    names = []
    for b in lesson['blocks']:
        for c in b['clips']:
            for s in (c.get('scenes') or {}):
                if s not in names:
                    names.append(s)
    return names


def with_scene(lesson, scene):
    """H6/L2-04: sahne seçici (kıyı / orman). Sahneye özgü metni olan klipler o sahnenin metniyle kurulur."""
    if not scene:
        return lesson
    L = copy.deepcopy(lesson)
    for b in L['blocks']:
        for c in b['clips']:
            sc = (c.get('scenes') or {}).get(scene)
            if sc:
                c['text'] = sc['text']
                c['syllables'] = sc['syllables']
    return L


def bridge_on(br, sel, T):
    """Köprü koşulu: requiresAnyBlock (H3: br.k2 yalnız C3 ya da C4 seçiliyse) ve minTarget."""
    anyb = br.get('requiresAnyBlock')
    if anyb and not any(b in sel for b in anyb):
        return False
    return True


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
            if br['placement'].get('before') == b['id'] and bridge_on(br, sel, T):
                add(br)
        add(b)
        for br in bridges:
            if br['placement'].get('after') == b['id'] and bridge_on(br, sel, T):
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
    gs = [gap_of(c, rate, prof) for _, c in seq]
    g = {lv: lead[lv] + sum(x[lv] for x in gs) for lv in ('min', 'pref', 'max')}
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
        if b['kind'] not in ('core', 'arrival', 'closing'):
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
        gd = gap_of(c, rate, prof)
        gap = gapval(gd)
        events.append({'block': bid, 'clip': c, 'start': t, 'end': t + d, 'dur': d, 'gap': gap, 'gd': gd})
        t += d + gap
    return {'T': T, 'rate': rate, 'prof': profname, 'variant': var, 'A': A['id'], 'K': K['id'],
            'sel': sel, 'inc': inc, 'events': events, 'total': t, 'status': status, 'mode': mode, 'f': f,
            'speech': S, 'gaps': g, 'notes': notes, 'stop': stop}


# ----------------------------------------------------------------------------------------------- denetimler
def window_segments(p):
    return [(ev['end'], ev['end'] + ev['gap']) for ev in p['events'] if ev['clip'].get('window')]


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
    """P-S5: doku = blok × sunum biçimi (mikro-liste / cümle); >= 20 sn duyurulmuş pencere kendi başına bir dokudur."""
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
    return p['f'] if p['mode'] == 'pref→max' else 0.0


def block_durations(p):
    out = {}
    for ev in p['events']:
        out[ev['block']] = out.get(ev['block'], 0.0) + ev['dur'] + ev['gap']
    return out


def key_want(lesson, p):
    """H3: 2. geçiş (br.k2) yalnız köprü koşulu tutuyorsa (C3 ya da C4 seçili)."""
    br = next((b for b in lesson['blocks'] if any(c['tags'].get('key') == 2 for c in b['clips'])), None)
    if br is not None and bridge_on(br, p['sel'], p['T']):
        return [1, 2, 3]
    return [1, 3]


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
        g = ev['gd']
        if ev['gap'] < g['min'] - 1e-6 or ev['gap'] > g['max'] + 1e-6:
            fails.append('%s sessizliği %.2f sınır dışı [%.2f, %.2f]' % (ev['clip']['id'], ev['gap'], g['min'], g['max']))
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
    # (f) bütün P1 bloklar her sürede
    p1 = [b['id'] for b in lesson['blocks'] if b['kind'] == 'core' and b['priority'] == 1]
    have_p1 = [b for b in p1 if b in p['sel']]
    if not have_p1:
        fails.append('hiç P1 blok yok')
    if set(have_p1) != set(p1):
        fails.append('eksik P1 blok: %s' % sorted(set(p1) - set(have_p1)))
    # anahtar cümle: sırayla, giderek kısa; H3: ardışık geçişler arası süre
    kev = [ev for ev in evs if ev['clip']['tags'].get('key')]
    keys = [(ev['clip']['tags'].get('key'), ev['clip']['syllables']) for ev in kev]
    want = key_want(lesson, p)
    if [k for k, _ in keys] != want:
        fails.append('anahtar cümle sırası %s (beklenen %s)' % ([k for k, _ in keys], want))
    elif any(a[1] <= b[1] for a, b in zip(keys, keys[1:])):
        fails.append('anahtar cümle giderek kısalmıyor %s' % keys)
    kmin = KEY_GAP_MIN_3 if len(want) == 3 else KEY_GAP_MIN_2
    for a, b in zip(kev, kev[1:]):
        if b['start'] - a['start'] < kmin - 1e-6:
            fails.append('H3: anahtar cümle geçişleri %.0f sn arayla (< %g; %s→%s)' % (
                b['start'] - a['start'], kmin, a['clip']['id'], b['clip']['id']))
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
    # ortada çıkış kapısı: C4 varsa hemen önünde br.orta; c4.patika'dan önce gözleri açma seçeneği (P-B2)
    if 'C4' in p['sel']:
        mids = [i for i, ev in enumerate(evs) if ev['clip']['tags'].get('safety') == 'mid']
        c4s = [i for i, ev in enumerate(evs) if ev['block'] == 'C4']
        if not mids or mids[-1] > c4s[0]:
            fails.append('C4 var ama önünde "istediğin an" hatırlatması (br.orta) yok')
        pat = next(ev for ev in evs if ev['clip']['id'] == 'c4.patika')
        if not any(ev['clip']['tags'].get('eyesOpen') and pat['start'] - ev['start'] <= EYES_OPEN_BEFORE_IMAGERY_SEC
                   and ev['start'] <= pat['start'] for ev in evs):
            fails.append('c4.patika öncesi %d sn içinde gözleri açma seçeneği yok' % EYES_OPEN_BEFORE_IMAGERY_SEC)
    if T >= 1200 and not any(ev['clip']['tags'].get('safety') == 'mid' for ev in evs):
        fails.append('>= 20 dk: ortada "istediğin an" hatırlatması yok')
    # pencere: önce duyuru (G2-02: duyuru bir kapı taşır), sonra karşılama
    for i, ev in enumerate(evs):
        if ev['clip'].get('window'):
            tg = ev['clip']['tags']
            if not tg.get('announce'):
                fails.append('pencere duyurusuz: ' + ev['clip']['id'])
            if tg.get('safety') != 'door':
                fails.append('G2-02: pencere duyurusunda çıkış kapısı etiketi yok: ' + ev['clip']['id'])
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
    # klip uzunluğu (<= 15 sn, 6.6 hece/sn'de)
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
    # dikkat eğrisi (>= 10 dk)
    runs = texture_runs(p)
    longest = max(runs, key=lambda r: r[2] - r[1])
    if T >= TEXTURE_FROM_SEC and longest[2] - longest[1] > TEXTURE_MAX_RUN:
        fails.append('dikkat eğrisi: "%s" %.0f sn > %.0f' % (longest[0], longest[2] - longest[1], TEXTURE_MAX_RUN))
    fails += round2_checks(lesson, p)
    fails += round3_checks(lesson, p)
    return fails, d, runs


def round2_checks(lesson, p):
    """2. tur denetimleri (fixlog.md: T1, T3, T8-3, T8-4, P-S6, N8/S18, T18). Eşikler VARSAYIM."""
    fails = []
    evs = p['events']
    T = p['total']
    # T1: "birkaç nefes" ya da "nefes … kal" isteyen klipten sonra, sonraki klibin başına kadar >= 10 sn
    for i, ev in enumerate(evs):
        if breath_wait_needed(ev['clip']['text']):
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
    # T18: cümle sonları art arda en çok ABILIR_RUN_MAX kez "-(y)abilir(sin)"
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


def breath_wait_needed(text):
    low = text.lower()
    return 'birkaç nefes' in low or re.search(r'nefes\w*\b.*\bkal\b', low) is not None


def phase_sentence_means(p):
    """H12: evre başına cümle uzunluğu ortalaması (mikro-klipler hariç; klip başına hece ÷ cümle, sonra ortalama)."""
    by = {}
    for ev in p['events']:
        c = ev['clip']
        if c.get('carrier'):
            continue
        by.setdefault(c['phase'], []).append(c['syllables'] / max(1, c['sentences']))
    return {k: statistics.mean(v) for k, v in by.items()}


def round3_checks(lesson, p):
    """3. tur denetimleri (fixlog.md 3. tur tablosu). Eşikler VARSAYIM."""
    fails = []
    evs = p['events']
    T = p['T']
    ids = [ev['clip']['id'] for ev in evs]
    # TR2-03: herhangi bir 60 sn içinde başlayan cümlelerde en çok ABIL_MAX_60 "-(y)abil-"
    ab = [(ev['start'], n_abil(ev['clip']['text']), ev['clip']['id']) for ev in evs if not ev['clip'].get('carrier')]
    for i, (s, _, _) in enumerate(ab):
        tot = sum(n for (t, n, _) in ab if s <= t < s + 60.0)
        if tot > ABIL_MAX_60:
            fails.append('TR2-03: %.0f sn\'den başlayan 60 sn\'de %d "-(y)abil-" (%s)' % (
                s, tot, ', '.join(c for (t, n, c) in ab if s <= t < s + 60.0 and n)))
            break
    # G2-01: c2.dikkat'ten önceki 60 sn içinde (kendisi dahil) gözleri açma seçeneği
    dk = next((ev for ev in evs if ev['clip']['id'] == 'c2.dikkat'), None)
    if dk and not any(ev['clip']['tags'].get('eyesOpen') and 0 <= dk['start'] - ev['start'] <= EYES_OPEN_BEFORE_BREATH_SEC
                      for ev in evs):
        fails.append('G2-01: c2.dikkat öncesi %d sn içinde gözleri açma seçeneği yok' % EYES_OPEN_BEFORE_BREATH_SEC)
    if dk and not dk['clip']['tags'].get('anchor'):
        fails.append('G2-01: c2.dikkat nefes dışı dayanak (kapı) taşımıyor')
    # G2-04: kalkış adımını taşıyan klip baş dönmesi satırını da taşır
    for ev in evs:
        if 'kalk' in (ev['clip']['tags'].get('step') or '').split('+'):
            low = ev['clip']['text'].lower()
            if not ('baş' in low and 'dön' in low):
                fails.append('G2-04: kalkış klibinde baş dönmesi satırı yok: ' + ev['clip']['id'])
    # G2-06 + L2-08: mikro-listelerde başlangıç periyodu; hassas bölgelerde uzun durak yok
    runs = []            # ardışık periyotlu mikro-klip zincirleri
    cur = []
    for i, ev in enumerate(evs[:-1]):
        nxt = evs[i + 1]
        if ev['clip'].get('onsetPeriod') and nxt['clip'].get('carrier'):
            cur.append((ev, nxt['start'] - ev['start']))
        else:
            if cur:
                runs.append(cur)
            cur = []
    if cur:
        runs.append(cur)
    for r in runs:
        pers = [x[1] for x in r]
        if len(pers) >= 2 and max(pers) - min(pers) > PERIOD_SPREAD_MAX + 1e-6:
            fails.append('L2-08: mikro-liste periyot yayılımı %.2f sn > %g (%s…)' % (
                max(pers) - min(pers), PERIOD_SPREAD_MAX, r[0][0]['clip']['id']))
            break
    for r in runs:
        med = statistics.median(x[1] for x in r)
        for ev, per in r:
            w = ev['clip']['text'].lower().strip('.… ')
            if any(w.endswith(s) for s in SENSITIVE_WORDS) and per > med + 0.05:
                fails.append('G2-06: hassas bölge "%s" üzerinde uzun durak (%.2f > medyan %.2f)' % (w, per, med))
    for ev in evs:           # periyotsuz (sabit) mikro-klip olarak hassas bölge kalmasın
        c = ev['clip']
        if c.get('carrier') and not c.get('onsetPeriod'):
            w = c['text'].lower().strip('.… ')
            if any(w.endswith(s) for s in SENSITIVE_WORDS):
                fails.append('G2-06: hassas bölge "%s" sabit uzun sessizlikli' % w)
    # H2: C4 varsa c4.don'dan önce en az 2 görme dışı duyu klibi
    if 'C4' in p['sel']:
        don = ids.index('c4.don')
        nv = [ev for ev in evs[:don] if ev['block'] == 'C4' and ev['clip']['tags'].get('sense')
              and ev['clip']['tags']['sense'] != 'görme']
        if len(nv) < NONVISUAL_BEFORE_RETURN:
            fails.append('H2: c4.don öncesi görme dışı duyu klibi %d < %d' % (len(nv), NONVISUAL_BEFORE_RETURN))
        # H5: C4 varsa, br.orta'dan önce Varış ya da C1'de bir "zemin" klibi
        orta = next(i for i, ev in enumerate(evs) if ev['clip']['id'] == 'br.orta')
        if not any(ev['block'] in ('A', 'C1') and 'zemin' in ev['clip']['text'].lower() for ev in evs[:orta]):
            fails.append('H5: br.orta öncesi Varış/C1\'de "zemin" klibi yok')
    # H12: cümleler evreden evreye kısalır (ortalama hece/cümle): Derin < Derinleşme < Varış
    m = phase_sentence_means(p)
    if {'Varış', 'Derinleşme', 'Derin'} <= set(m):
        if not (m['Derin'] < m['Derinleşme'] < m['Varış']):
            fails.append('H12: cümle uzunluğu evreyle kısalmıyor (Varış %.1f, Derinleşme %.1f, Derin %.1f)' % (
                m['Varış'], m['Derinleşme'], m['Derin']))
    # H1 / PLAN B.3 adım 8: blok süreleri (çekirdek >= 55 sn, niyet >= 20 sn); 5 dk'da sahibe görünür değişiklik
    bd = block_durations(p)
    bm = block_map(lesson)
    for bid, sec in bd.items():
        b = bm[bid]
        if b['kind'] != 'core':
            continue
        need = BLOCK_MIN['niyet'] if b.get('niyet') else BLOCK_MIN['core']
        if T < AMEND_BELOW_SEC and bid in BLOCK_MIN_AMEND:
            need = BLOCK_MIN_AMEND[bid]
        if sec < need - 1e-6:
            fails.append('H1/B.3-8: %s bloğu %.1f sn < %g' % (bid, sec, need))
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


def text_forms(c):
    """Bir klibin bütün söylenen biçimleri: ana metin, dönüşümlü seçenekler, sahne metinleri."""
    out = [c['text']] + [a['text'] for a in (c.get('alternates') or [])]
    out += [s['text'] for s in (c.get('scenes') or {}).values()]
    return out


def lint_text(lesson):
    out = []
    fails = []
    clips = all_unique_clips(lesson)
    texts = [t for _, c in clips.values() for t in text_forms(c)] + [car['text'] for car in lesson['carriers']]
    low = '\n'.join(t.lower() for t in texts)
    for w in FORBIDDEN:
        if re.search(r'(?<!\w)' + re.escape(w), low):
            fails.append('yasak ifade: "%s"' % w)
    for cid, (_, c) in clips.items():        # E12: bildirimsel etki vaadi (3. turda muafiyet yok)
        if cid in FORBIDDEN_WHITELIST:
            continue
        for t in text_forms(c):
            for w in FORBIDDEN_E12:
                if re.search(r'(?<!\w)' + re.escape(w), t.lower()):
                    fails.append('E12 etki vaadi: "%s" (%s)' % (w, cid))
    for w in ENGLISH:
        if w.strip() and re.search(r'(?<!\w)' + re.escape(w.strip()) + r'(?!\w)', low):
            fails.append('İngilizce: "%s"' % w)
    for w in SANSKRIT:
        n = sum(len(re.findall(r'(?<!\w)' + w, c['text'].lower())) for _, c in clips.values())
        if n > 1:
            fails.append('Sanskritçe "%s" %d kez' % (w, n))
        elif n == 1:
            out.append('Sanskritçe "%s": 1 kez' % w)
    for bid, c in clips.values():
        if c.get('carrier'):
            continue
        for text in text_forms(c):
            ss = sentences(text)
            if not 1 <= len(ss) <= 3:
                fails.append('%s: %d cümle' % (c['id'], len(ss)))
            for s in ss:
                n = len(words(s))
                if n > 14:
                    fails.append('%s: %d sözcüklük cümle' % (c['id'], n))
            if IMPERATIVE_END.search(text) and c['tags'].get('mood') != 'safety':
                fails.append('%s: emir kipi (güvenlik etiketi yok): %s' % (c['id'], text))
            if INNER_QUOTE_PERIOD.search(text) and not c.get('ttsText'):     # L2-11
                fails.append('%s: tırnak içindeki nokta cümlenin ortasında (ttsText yok): %s' % (c['id'], text))
        for a in (c.get('alternates') or []):
            if a['syllables'] != syllables(a['text']):
                fails.append('%s: seçenek hece sayısı tutmuyor' % c['id'])
        for s in (c.get('scenes') or {}).values():
            if s['syllables'] != syllables(s['text']):
                fails.append('%s: sahne metni hece sayısı tutmuyor' % c['id'])
    for car in lesson['carriers']:
        items = [clips[i][1] for i in car['items']]
        if sum(c['syllables'] for c in items) + syllables(car.get('lead', '')) != car['syllables']:
            fails.append('taşıyıcı %s: hece sayısı kliplerle tutmuyor' % car['id'])
        if len(car['items']) > 10:
            fails.append('taşıyıcı %s çok uzun (%d öğe)' % (car['id'], len(car['items'])))
    for b in lesson['blocks']:
        n = sum(1 for c in b['clips'] if c['tags'].get('explain'))
        if n > 1:
            fails.append('%s: %d açıklama cümlesi (> 1)' % (b['id'], n))
    # E.6 #14: TTS-içi duraklamalar dahil hiçbir klip 2,5 hece/sn'nin altına inmez
    slowest = (99.0, None)
    for bid, c in clips.values():
        if c.get('carrier') or c['syllables'] < 4:
            continue
        for rate in RATES:
            for pn in PROFILES:
                d = clip_dur(c, rate, profile(pn, rate)) - EDGE
                r = c['syllables'] / d
                if r < slowest[0]:
                    slowest = (r, '%s @%.1f %s' % (c['id'], rate, pn))
                if r < 2.5:
                    fails.append('%s: %.2f hece/sn < 2,5 (%.1f, %s)' % (c['id'], r, rate, pn))
    out.append('en yavaş klip (duraklamalar dahil): %.2f hece/sn (%s)' % slowest)
    # EV2-04: Derin evre cümle kliplerinin iç hızı; "Derin evre iç hız tavanı" (VARSAYIM; kanıta dayanmaz)
    meds = {}
    for rate in RATES:
        for pn in PROFILES:
            rs = sorted(c['syllables'] / (clip_dur(c, rate, profile(pn, rate)) - EDGE)
                        for _, c in clips.values() if not c.get('carrier') and c['phase'] == 'Derin'
                        and c['syllables'] >= 6)
            med = rs[len(rs) // 2]
            out.append('Derin cümle iç hızı %.1f %s: medyan %.2f, en yüksek %.2f hece/sn → Derin evre iç hız tavanı '
                       '(<= %g; VARSAYIM, kanıta dayanmaz) %s' % (rate, pn, med, rs[-1], DERIN_CLIP_RATE_CEIL,
                                                                  'medyan tavanın altında' if med <= DERIN_CLIP_RATE_CEIL
                                                                  else 'medyan tavanın üstünde'))
            meds.setdefault(rate, []).append(med)
    if min(meds[5.2]) > DERIN_CLIP_RATE_CEIL:
        fails.append('P-S1: 5,2 yolunda hiçbir ses tipinde Derin medyan iç hız <= %g değil' % DERIN_CLIP_RATE_CEIL)
    # PLAN B.5: "Kapanışa geç" 60–90 sn; Durdur dönüşü 20–30 sn
    for key, (lo_, hi_) in (('quickClosing', QUICK_BOUNDS), ('stopReturn', STOP_BOUNDS)):
        ex = lesson['extras'][key]
        for rate in RATES:
            for pn in PROFILES:
                pr = profile(pn, rate)
                d = sum(clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in ex['clips'])
                if not lo_ <= d <= hi_:
                    fails.append('%s %.1f sn, [%g, %g] dışında (%.1f, %s)' % (key, d, lo_, hi_, rate, pn))
        # T1 (Z2-01, G2-05): "birkaç nefes" isteyen klipten sonra >= 10 sn; dizinin SON klibi muaf (ses orada biter,
        # bekleme ekran metniyle sessizce sürer)
        for c in ex['clips'][:-1]:
            if breath_wait_needed(c['text']) and c['gapAfter']['pref'] < BREATH_WAIT_MIN_SEC - 1e-6:
                fails.append('%s: %s nefes beklemesi %.1f sn < %g' % (key, c['id'], c['gapAfter']['pref'],
                                                                      BREATH_WAIT_MIN_SEC))
        # G2-04: kalkış adımı baş dönmesi satırıyla gelir
        for c in ex['clips']:
            if 'kalk' in (c['tags'].get('step') or '').split('+'):
                low = c['text'].lower()
                if not ('baş' in low and 'dön' in low):
                    fails.append('G2-04: %s kalkış klibinde baş dönmesi satırı yok: %s' % (key, c['id']))
    return fails, out


def stems(text, ok):
    out = set()
    for w in words(text):
        lw = w.lower()
        if len(lw) >= 4 and lw not in REP_STOP:
            out.add(lw[:5])
        for r in SHORT_ROOTS:
            if lw.startswith(r):
                out.add(r)
    return {s for s in out if not any(s.startswith(o) or o.startswith(s) for o in ok)}


REP_STOP = set('ve ya da de bir bu şu o sen ben onu gibi daha biraz kendi istersen olur olabilir için ile ki her hiç '
               'çok en ne mi mı değil var yok sana seni senin bunu bunları bütün iki önce sonra edebilir '
               'edebilirsin'.split())


def repetition_warnings(lesson, plans):
    """Ardışık iki cümle klibinde ya da aralarındaki sessizlik <= REP_WINDOW_SEC olan iki cümle klibinde aynı 5 harflik
    kök (L2-14: 'dön' gibi kısa kökler de). Bilinçli tekrarlar repeatOk etiketlidir. Uyarı listesi."""
    pairs = {}
    for p in plans:
        evs = [ev for ev in p['events'] if not ev['clip'].get('carrier')]
        for i, a in enumerate(evs):
            for j in range(i + 1, len(evs)):
                b = evs[j]
                if j > i + 1 and b['start'] - a['end'] > REP_WINDOW_SEC:
                    break
                ok = set(a['clip']['tags'].get('repeatOk', [])) | set(b['clip']['tags'].get('repeatOk', []))
                common = stems(a['clip']['text'], ok) & stems(b['clip']['text'], ok)
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
    return block_durations(p)


def anchor_split(p):
    """Z2-06: A / N1+N2 / çekirdek (C1..C5 + köprüler) / K saniyeleri."""
    bd = block_durations(p)
    a = bd.get('A', 0.0)
    n = bd.get('N1', 0.0) + bd.get('N2', 0.0)
    k = bd.get('K', 0.0)
    core = sum(v for b, v in bd.items() if b not in ('A', 'N1', 'N2', 'K'))
    return a, n, core, k


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
    # dakikalar arası denetimler
    for rate in RATES:
        for prof in ('lo', 'hi'):
            ids = {m: [ev['clip']['id'] for ev in results[(rate, m)][prof][0]['events']] for m in MINUTES}
            for m in MINUTES:
                p, fails = results[(rate, m)][prof][:2]
                if m > MINUTES[0]:
                    lost = sorted(set(ids[m - 1]) - set(ids[m]))
                    if lost:
                        fails.append('alt küme bozuk: %d → %d dk düşen %s' % (m - 1, m, lost))
                    # Z2-04: 20 dk'dan itibaren art arda en çok 1 "düzlük" dakikası (içerik aynı kalırsa); x.saymak
                    # grubu 60 sn'den uzun olduğu için tek düzlük kaçınılmaz, iki ardışık düzlük hatadır
                    if m >= 21 and set(ids[m]) == set(ids[m - 1]) == set(ids[m - 2]):
                        fails.append('T2: %d, %d ve %d dk içeriği aynı (iki ardışık düzlük)' % (m - 2, m - 1, m))
                if p['stop'] is not None and stretch(p) > STRETCH_MAX_UNSATURATED + 1e-9:
                    fails.append('T5: içerik doymadan esneme f=%.2f > %g' % (stretch(p), STRETCH_MAX_UNSATURATED))
                if m == 30 and stretch(p) > STRETCH_MAX_AT_30 + 1e-9:
                    fails.append('T2: 30:00\'da esneme f=%.2f > %g' % (stretch(p), STRETCH_MAX_AT_30))
    # T6/Z2-04: 5 dk'nın en yavaş köşesinde boş pay (min sessizliklere göre)
    p5 = results[(5.2, 5)]['hi'][0]
    slack = 300 - (p5['speech'] + p5['gaps']['min'])
    if slack < T6_FLOOR - 1e-6:
        results[(5.2, 5)]['hi'][1].append('T6: 5 dk 5,2 yüksek köşesinde boş pay %.1f sn < %g' % (slack, T6_FLOOR))
    return results


def case_ok(case):
    return not case['lo'][1] and not case['hi'][1]


def failure_kinds(results):
    kinds = {}
    for (r, m), c in results.items():
        for pr in ('lo', 'hi'):
            for f in c[pr][1]:
                # ölçülen sayılar "#" olur; denetim kimlikleri (T5, H1/B.3-8, C2) korunur
                k = re.sub(r'(?<![A-Za-z.\-/])\d+(?:[.,]\d+)?', '#', f.split(' (')[0])[:70]
                kinds.setdefault(k, []).append('%.1f %d %s' % (r, m, pr))
    return kinds


def main():
    global DUR_SCALE
    lesson = load()
    lines = []
    P = lines.append
    P('Nefona Yoga · Ders 2 "Derin Dinlenme" · timing.py çıktısı (3. tur)')
    P('Ders dosyası: ders2.lesson.json (sürüm %s)' % lesson['version'])
    P('Model: hece/hız + TTS-içi duraklama (düşük=Neslihan v2, yüksek=Hakan v2; 5,2\'de ×1,25) + uç payı 0,31 sn '
      '(mikro 0,15); mikro-listelerde başlangıç periyodu (sessizlik = periyot − süre, en az %g sn). Vaka = hız × dakika; '
      'iki duraklama profilinde de geçmeli.' % GAP_FLOOR)
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
    scene_lines = []
    scenes_ok = True
    for sc in scene_names(lesson):                  # H6/L2-04: sahne takımları
        rs = run_all(with_scene(lesson, sc))
        ns = sum(1 for c in rs.values() if case_ok(c))
        scenes_ok &= (ns == len(rs))
        bad = ['%.1f %d dk %s: %s' % (r, m, pr, c[pr][1][0]) for (r, m), c in rs.items() for pr in ('lo', 'hi') if c[pr][1]]
        scene_lines.append('  sahne "%s": %d/%d vaka GEÇTİ%s' % (sc, ns, len(rs), ('; ilk hata ' + bad[0]) if bad else ''))
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
    P('== Tekrar uyarıları (10 sn içindeki ya da ardışık cümle kliplerinde aynı 5 harflik kök; "dön" gibi kısa kökler '
      'dahil; bilinçli olanlar etiketli) ==')
    reps = repetition_warnings(lesson, [c[pr][0] for c in results.values() for pr in ('lo', 'hi')])
    if not reps:
        P('  yok')
    for (a, b), ws in sorted(reps.items()):
        P('  %s → %s: %s' % (a, b, ', '.join(ws)))
    P('')
    P('== "-(y)abil-" yoğunluğu (TR2-03, H11) ==')
    for rate in RATES:
        for prof in ('lo', 'hi'):
            p = results[(rate, 5)][prof][0]
            sc = [ev for ev in p['events'] if not ev['clip'].get('carrier')]
            n_ab = sum(n_abil(ev['clip']['text']) for ev in sc)
            worst = 0
            for ev in sc:
                worst = max(worst, sum(n_abil(e['clip']['text']) for e in sc if ev['start'] <= e['start'] < ev['start'] + 60))
            P('  %.1f %s 5 dk: %d cümle klibinde %d "-(y)abil-" (klip başına %.2f; hedef <= %g); en yoğun 60 sn: %d' % (
                rate, prof, len(sc), n_ab, n_ab / len(sc), ABIL_PER_CLIP_5MIN_TARGET, worst))
    P('')
    P('== Evre başına ortalama cümle uzunluğu (H12; hece/cümle, 5,6 yüksek) ==')
    for m in (5, 10, 15, 20, 30):
        me = phase_sentence_means(results[(5.6, m)]['hi'][0])
        P('  %2d dk: %s' % (m, ', '.join('%s %.1f' % (k, me[k]) for k in ('Varış', 'Derinleşme', 'Derin', 'Kapanış') if k in me)))
    P('')
    P('== Kapak ve çekirdek payı (Z2-06; sn: Varış / niyet N1+N2 / çekirdek C1..C5 + köprüler / Kapanış) ==')
    for m in (5, 10, 15, 20, 30):
        row = []
        for rate in RATES:
            for prof in ('lo', 'hi'):
                a, n, c, k = anchor_split(results[(rate, m)][prof][0])
                row.append('%.1f%s %.0f/%.0f/%.0f/%.0f' % (rate, prof[0], a, n, c, k))
        P('  %2d dk: %s' % (m, ' · '.join(row)))
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
    P('== Seçenek metinleri (P-N5) ve sahne takımları (H6/L2-04) ==')
    for ln in (variant_lines or ['  seçenek yok']) + (scene_lines or ['  sahne yok']):
        P(ln)
    P('')
    P('== Sarsıntı taraması (Z2-04; bütün klip süreleri × ölçek; ana metin; bilgi, sonucu değiştirmez) ==')
    for sc in PERTURB:
        DUR_SCALE = sc
        rp = run_all(lesson)
        DUR_SCALE = 1.0
        n_ok = sum(1 for c in rp.values() if case_ok(c))
        kinds = failure_kinds(rp)
        P('  ×%.2f: %d/%d vaka geçiyor%s' % (sc, n_ok, len(rp), '' if not kinds else '; kalan denetimler: ' + '; '.join(
            '%s (%d: %s)' % (k, len(v), ', '.join(v[:3])) for k, v in sorted(kinds.items()))))
    P('')
    P('== ÖZET ==')
    for rate in RATES:
        a, b = per_rate[rate]
        P('  %.1f hece/sn: %d/%d dakika GEÇTİ (düşük ve yüksek duraklama profilinde)' % (rate, a, b))
    p5 = results[(5.2, 5)]['hi'][0]
    P('  5 dk 5,2 yüksek köşesinde boş pay: %.1f sn (T6 tabanı %g)' % (300 - (p5['speech'] + p5['gaps']['min']), T6_FLOOR))
    P('  TOPLAM: %d/%d vaka GEÇTİ (ana metin); seçenek takımları %s; sahne takımları %s; metin denetimi %s' % (
        n_pass, len(results), 'GEÇTİ' if variants_ok else 'KALDI', 'GEÇTİ' if scenes_ok else 'KALDI',
        'GEÇTİ' if not tf else 'KALDI'))
    P('  Kapsam: bu sayı zamanlama ve metin kurallarıdır; dinleme, söyleyiş ve insan onayı değildir (P-S1).')
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines[-9:]))
    return 0 if (n_pass == len(results) and not tf and variants_ok and scenes_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
