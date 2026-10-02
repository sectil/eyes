import sys, os
d = sys.argv[1]; sys.path.insert(0, d); os.chdir(d)
sys.dont_write_bytecode = True
import importlib, timing as T; D = importlib.import_module(os.environ.get('TD','timing_d1'))
L = D.load(); D.patch(L)
name, rate, prof, sc0 = D.corners(L)[0]
T.DUR_SCALE = sc0 * float(sys.argv[2])
for m in map(int, sys.argv[3:]):
    p = T.plan(L, m * 60, rate, prof)
    evs = p['events']; best = (0, None)
    for e in evs:
        s0 = e['start']; sp = 0
        for x in evs:
            a, b = x['start'], x['start'] + x['speech']
            sp += max(0, min(b, s0 + 60) - max(a, s0))
        if sp > best[0]: best = (sp, e)
    e = best[1]
    print(m, 'max pay %.3f at %.1f %s' % (best[0] / 60, e['start'], e['clip']['id']), [x['clip']['id'] for x in evs if e['start'] <= x['start'] < e['start'] + 60 and not x['clip'].get('carrier')])
T.DUR_SCALE = 1.0
