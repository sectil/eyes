import json, sys
sys.path.insert(0, '.')
import timing as T
L = T.load('ders2.lesson.json')
Ls = T.with_scene(L, 'orman')
meas = json.load(open('measured_durs.json'))
RATIO = {'nes': 1.109, 'hak': 1.055}
orig = T.sub_durs
def patch(v):
    def sd(c, rate, prof):
        m = meas[v].get(c['id']); base = orig(c, rate, prof)
        if m and len(m) == len(base) and not c.get('shortForm'):
            return m
        return [x * RATIO[v] for x in base]
    return sd
for v in ('model', 'nes', 'hak'):
    T.sub_durs = orig if v == 'model' else patch(v)
    for tgt in (300, 360, 900):
        p = T.plan(Ls, tgt, 5.6, 'hi')
        fails, d, runs = T.check_plan(Ls, p)
        dens = T.density(p)
        print(v, tgt, 'status', p['status'], 'f=%.2f' % p['f'], 'fails:', fails[:4], '| yoğunluk', {k: (round(x, 2) if isinstance(x, float) else x) for k, x in (dens.items() if isinstance(dens, dict) else [])})
T.sub_durs = orig
