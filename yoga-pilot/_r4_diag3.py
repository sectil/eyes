import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
for rate, pr in ((5.2, 'lo'), (5.2, 'hi'), (5.6, 'lo'), (5.6, 'hi'), (6.6, 'lo'), (6.6, 'hi')):
    for m in (14, 15, 16):
        T = m * 60
        p = timing.plan(L, T, rate, pr)
        prof = timing.profile(pr, rate)
        var, A, K = timing.caps_for(L, T)
        sel = p['sel'] if 'C4' not in p['sel'] else [b for b in p['sel'] if b != 'C4']
        inc = {i for i in p['inc'] if not i.startswith('c4.')}
        def tot(sel_, lv):
            S, g = timing.totals(timing.assemble(L, T, A, K, sel_, inc), L, rate, prof)
            return S + g[lv]
        print(rate, pr, m, 'base cap %.0f  +C4 half %.0f  +C4 fit %.0f  T %d' % (tot(sel, 'cap'), tot(sel + ['C4'], 'half'), tot(sel + ['C4'], 'fit'), T), 'f', round(p['f'], 2), p['mode'])
