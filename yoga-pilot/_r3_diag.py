import sys, os, json, re, collections
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot'
sys.path.insert(0, P); os.chdir(P)
import timing, ders2_kaynak as k
k.finalize(); L = k.lesson_dict(); k.estimates(L)
json.dump(L, open(os.path.join(P,'ders2.lesson.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)
tf, tout = timing.lint_text(L)
print('LINT fails:', len(tf))
for f in tf: print('  ', f)
for o in tout: print('  info', o)
mode = sys.argv[1] if len(sys.argv) > 1 else 'main'
Ls = {'main': L}
if mode == 'all':
    for kk in range(1, timing.n_variants(L)): Ls['v%d'%kk] = timing.with_variant(L, kk)
    for sc in timing.scene_names(L): Ls[sc] = timing.with_scene(L, sc)
for name, LL in Ls.items():
    res = timing.run_all(LL)
    kinds = collections.OrderedDict()
    for (r, m), c in res.items():
        for pr in ('lo','hi'):
            for f in c[pr][1]:
                key = re.sub(r'[0-9]+([.,][0-9]+)?', '#', f)[:90]
                kinds.setdefault(key, []).append('%.1f/%d/%s' % (r, m, pr))
    n_ok = sum(1 for c in res.values() if timing.case_ok(c))
    print('==', name, n_ok, '/ 78')
    for kk, v in kinds.items():
        print('  [%3d] %s   e.g. %s' % (len(v), kk, ', '.join(v[:4])))
    p5 = res[(5.2,5)]['hi'][0]
    print('  slack5 5.2hi = %.1f' % (300 - p5['speech'] - p5['gaps']['min']))
