import sys, os
d = sys.argv[1]; sys.path.insert(0, d); os.chdir(d)
sys.dont_write_bytecode = True
import timing_d3 as TD, timing as T
L = TD.load(); TD.patch(L); PV = TD.planner_view(L)
for name, rate, prof, sc in TD.corners(L):
    T.DUR_SCALE = sc
    for m in range(9, 16):
        p = T.plan(PV, m * 60, rate, prof)
        c4 = [e['clip']['id'].replace('c4.', '') for e in p['events'] if e['block'] == 'C4']
        if c4: print(name, m, ' '.join(c4))
    T.DUR_SCALE = 1.0
