import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
sets = {'ana': L}
for k in range(1, timing.n_variants(L)):
    sets['v%d' % k] = timing.with_variant(L, k)
for sc in timing.scene_names(L):
    sets[sc] = timing.with_scene(L, sc)
for name, LL in sets.items():
    played = {}
    for r in timing.RATES:
        for pr in ('lo', 'hi'):
            for m in range(25, 31):
                p = timing.plan(LL, m*60, r, pr)
                for ev in p['events']:
                    played.setdefault(ev['clip']['id'], []).append('%.1f%s%d' % (r, pr[0], m))
    for cid in ('c3.x.hepsi', 'c5.x.dayanak', 'c4.x.donus2', 'c4.x.yaklas', 'c5.x.oldugu'):
        print(name, cid, played.get(cid, [])[:6], len(played.get(cid, [])))
