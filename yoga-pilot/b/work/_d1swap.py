import sys, os, copy
d = sys.argv[1]; sys.path.insert(0, d); os.chdir(d)
sys.dont_write_bytecode = True
import timing_d1 as D, timing as T
L = D.load(); D.patch(L)
def slack(L, sc=1.0):
    name, rate, prof, sc0 = D.corners(L)[0]
    T.DUR_SCALE = sc0 * sc
    p = T.plan(L, 180, rate, prof); T.DUR_SCALE = 1.0
    return 180 - p['speech'] - p['gaps']['min'], [e['clip']['id'] for e in p['events'] if e['clip']['id'].startswith('c1.d')]
print('mevcut', slack(L), slack(L, 1.05)[0])
L2 = copy.deepcopy(L)
for b in L2['blocks']:
    for c in b['clips']:
        if c['id'].startswith('c1.d1.'):
            c['tier'] = 'required'; c['required'] = True; c.pop('fillRank', None); c.pop('fillGroup', None)
        if c['id'].startswith('c1.d2.'):
            c['tier'] = 'optional'; c['required'] = False; c['fillRank'] = 101; c['fillGroup'] = 'c1.d2'
print('c1.d2 yerine c1.d1', slack(L2), slack(L2, 1.05)[0])
L3 = copy.deepcopy(L)
for b in L3['blocks']:
    for c in b['clips']:
        if c['id'].startswith('c1.d2.'):
            c['minTarget'] = 240
print('c1.d2 yalnız >= 4 dk', slack(L3), slack(L3, 1.05)[0], slack(L3, 1.10)[0])
name, rate, prof, sc0 = D.corners(L3)[0]
for sc in (1.0, 1.05, 1.10):
    T.DUR_SCALE = sc0*sc
    for m in (3, 4):
        p = T.plan(L3, m*60, rate, prof); f = D.check(L3, p)
        print(sc, m, p['status'], f if isinstance(f, list) else f[0][:3])
T.DUR_SCALE = 1.0
L4 = copy.deepcopy(L)
for b in L4['blocks']:
    for c in b['clips']:
        if c['id'].startswith('c1.d3.'):
            c['minTarget'] = 240
print('c1.d3 yalnız >= 4 dk', slack(L4), slack(L4, 1.05), slack(L4, 1.10)[0])
for sc in (1.0, 1.05, 1.10):
    T.DUR_SCALE = sc0*sc
    for m in (3, 4, 5):
        p = T.plan(L4, m*60, rate, prof); f = D.check(L4, p)
        print(sc, m, p['status'], f[0][:3])
T.DUR_SCALE = 1.0
