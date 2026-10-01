import sys, json, os
d = sys.argv[1]; sys.path.insert(0, d); os.chdir(d)
sys.dont_write_bytecode = True
import importlib, timing as T; D = importlib.import_module(os.environ.get('TD','timing_d1'))
L = D.load(); D.patch(L)
name, rate, prof, sc0 = D.corners(L)[0]
for sc in (1.05, 1.10):
    rp, _, sl = D.run_corner(L, name, rate, prof, sc0 * sc)
    for m in D.MINUTES:
        if rp[m][1]: print(sc, m, rp[m][1][:2])
