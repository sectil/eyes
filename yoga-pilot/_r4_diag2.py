import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
for rate, pr, m in ((5.6, 'lo', 14), (5.6, 'lo', 15), (5.6, 'lo', 16), (5.2, 'lo', 15), (5.2, 'hi', 15), (6.6, 'lo', 15), (5.6, 'hi', 15)):
    p = timing.plan(L, m * 60, rate, pr)
    print(rate, pr, m, 'stop', p['stop'], p['mode'], round(p['f'], 2), 'sel', p['sel'])
    # C4 min cost
    bm = timing.block_map(L)
    prof = timing.profile(pr, rate)
    for bid in ('C4', 'BR.orta', 'C3'):
        req = [c for c in bm[bid]['clips'] if c['tier'] == 'required']
        mn = sum(timing.unit_len(c, rate, prof, 'min') + timing.gap_of(c, rate, prof)['min'] for c in req)
        pf = sum(timing.unit_len(c, rate, prof, 'pref') + timing.gap_of(c, rate, prof)['pref'] for c in req)
        print('   %s req min %.1f pref %.1f' % (bid, mn, pf))
