import sys, os
d = sys.argv[1]; sys.path.insert(0, d); os.chdir(d)
sys.dont_write_bytecode = True
import timing_d3 as TD, timing as T
L = TD.load(); TD.patch(L); PV = TD.planner_view(L)
for name, rate, prof, sc in TD.corners(L):
    T.DUR_SCALE = sc
    p = T.plan(PV, 900, rate, prof)
    print(name, 'hece', sum(e['clip']['syllables'] for e in p['events']), 'pay %.1f' % (100*p['speech']/900), p['mode'], 'f %.2f' % p['f'], {k: '%d:%02d' % (v//60, round(v%60)) for k, v in T.block_durations(p).items()})
    T.DUR_SCALE = 1.0
print(sum(c['syllables'] for b in L['blocks'] for c in b['clips']))
