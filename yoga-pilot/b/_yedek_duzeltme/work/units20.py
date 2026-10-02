import sys, json; sys.path.insert(0,'.')
import v3plan as V
from v3plan import T
U = json.load(open(V.Y+'/render/units.json'))['units']
cov = set()
for u in U:
    cov.add(u['id'])
    for it in u.get('items', []) or []:
        cov.add(it if isinstance(it, str) else it.get('id'))
print('kayıtlı birim', len(U), 'kapsanan kimlik', len(cov))
def txt(c): return c.get('tts') or c.get('text') or ''
def d2_20(path, hi_T=1200, T0=300):
    V.use('model')
    L = T.with_scene(T.load(path), 'orman')
    allc = {}
    for Tt in range(T0, hi_T+1, 60):
        for rate, prof in ((5.2,'hi'),(5.6,'hi'),(5.6,'lo'),(6.6,'lo'),(6.6,'hi')):
            p = T.plan(L, Tt, rate, prof)
            for ev in p['events']:
                allc[ev['clip']['id']] = ev['clip']
    miss = {k:c for k,c in allc.items() if k not in cov}
    return allc, miss
for name, path in (('pilot', V.Y+'/pilot/ders2.lesson.json'), ('v3', V.Y+'/b/ders2/ders2.lesson.v3.json')):
    allc, miss = d2_20(path)
    print(name, 'd2_20 yöntemi (5 köşe × 5..20 dk):', len(allc), 'birim kullanılıyor; kayıtsız', len(miss), 'karakter', sum(len(txt(c)) for c in miss.values()), 'hece', sum(c.get('syllables',0) for c in miss.values()))
    print('   ', sorted(miss))
# seçilen sesin ölçülmüş süreleriyle
L = T.with_scene(T.load(V.Y+'/b/ders2/ders2.lesson.v3.json'), 'orman')
for v in ('hoc','nes','hak'):
    for cons in (True, False):
        V.MODE['conservative'] = cons; V.use(v)
        need = {}
        for Tt in (300, 900, 1200):
            p = T.plan(L, Tt, 5.6, 'hi')
            for ev in p['events']:
                if ev['clip']['id'] not in cov: need.setdefault(ev['clip']['id'], (Tt, ev['clip']))
        print(v, 'kons' if cons else 'birim', '20 dk için kayıtsız:', len(need), sorted(need))
V.MODE['conservative'] = True; V.use('model')
