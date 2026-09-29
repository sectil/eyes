import sys, json
sys.path.insert(0, '/home/user/eyes/yoga-pilot/pilot')
import timing as tm
L = tm.with_scene(tm.load(), 'orman')
U = json.load(open('/home/user/eyes/yoga-pilot/render/units.json'))['units']
cov = set()
for u in U:
    cov.add(u['id'])
    for it in u.get('items', []) or []:
        cov.add(it if isinstance(it, str) else it.get('id'))
def txt(c): return c.get('tts') or c.get('text') or ''
for hi_T in (1200, 1800):
    allc = {}
    for T in range(300, hi_T+1, 60):
        for rate, prof in ((5.2,'hi'),(5.6,'hi'),(5.6,'lo'),(6.6,'lo'),(6.6,'hi')):
            p = tm.plan(L, T, rate, prof)
            for ev in p['events']:
                allc[ev['clip']['id']] = ev['clip']
    miss = {k:c for k,c in allc.items() if k not in cov}
    print(hi_T//60, 'dk: clips used', len(allc), 'missing', len(miss), 'chars', sum(len(txt(c)) for c in miss.values()), 'syll', sum(c.get('syllables',0) for c in miss.values()))
    blocks = {}
    for k in miss: blocks.setdefault(k.split('.')[0],0); blocks[k.split('.')[0]]+=1
    print('  by block prefix', blocks)
C15 = sum(len(u['tts']) for u in U)
print('C15 chars', C15, 'units', len(U))
