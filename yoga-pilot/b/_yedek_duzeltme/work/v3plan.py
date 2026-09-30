"""B adımı: pilot planlayıcısını (salt okunur) seçilen sesin ölçülmüş süreleriyle koşturan yardımcı.
Ölçülmüş süre yalnız birimin metni kayıttaki metinle AYNIYSA kullanılır; değişen, kısa biçimli ya da hiç okutulmamış
birimde model süresi × o sesin ölçülen/model oranı (5,6 yüksek) kullanılır."""
import json, sys, copy
Y = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
sys.path.insert(0, Y + '/pilot')
import timing as T
RATIO = {'nes': 1.109, 'hak': 1.055, 'hoc': 1.127}
NAMES = {'nes': 'Neslihan', 'hak': 'Hakan', 'hoc': 'Nefona Hoca'}
_orig = T.sub_durs

def recorded():
    rec = {}
    for v in ('nes', 'hak', 'hoc'):
        p = json.load(open(Y + '/render/out/plan-%s.json' % v))
        rec[v] = {e['clip']: ([s['text'] for s in e['subs']], [s['end'] - s['start'] for s in e['subs']]) for e in p['events']}
    return rec
REC = recorded()
MODE = {'conservative': True}

def _unit_ratios():
    L0 = T.load(Y + '/pilot/ders2.lesson.json')
    L0 = T.with_scene(L0, 'orman')
    cl = {}
    for b in L0['blocks']:
        for c in b['clips']:
            cl[c['id']] = c
    for c in L0['extras']['quickClosing']['clips']:
        cl.setdefault(c['id'], c)
    out = {}
    for v in REC:
        out[v] = {}
        for cid, (txts, durs) in REC[v].items():
            c = cl.get(cid)
            if c is None:
                continue
            m = _orig(c, 5.6, T.profile('hi', 5.6))
            if len(m) == len(durs):
                out[v][cid] = sum(durs) / sum(m)
    return out
UNIT_RATIO = _unit_ratios()

def patch(v):
    def sd(c, rate, prof):
        base = _orig(c, rate, prof)
        r = REC[v].get(c['id'])
        if r and not c.get('shortForm'):
            txts, durs = r
            if len(durs) == len(base) and T.sub_texts(c) == txts:
                return list(durs)
        k = max(RATIO[v], UNIT_RATIO[v].get(c['id'], 0.0)) if MODE['conservative'] else UNIT_RATIO[v].get(c['id'], RATIO[v])
        return [x * k for x in base]
    return sd

def use(v):
    T.sub_durs = _orig if v == 'model' else patch(v)
    T._SUB_CACHE.clear()

def measured_ids(v, p):
    """Plandaki birimlerden hangileri ölçülmüş süreyle kuruldu."""
    out = []
    for e in p['events']:
        c = e['clip']; r = REC[v].get(c['id'])
        out.append(bool(r and not c.get('shortForm') and T.sub_texts(c) == r[0]))
    return out
