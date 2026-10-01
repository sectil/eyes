import sys, json; sys.path.insert(0,'.')
import v3plan as V
from v3plan import T
V.use('model')
for name, path in (('pilot', V.Y+'/pilot/ders2.lesson.json'), ('v3', V.Y+'/b/ders2/ders2.lesson.v3.json')):
    L0 = T.load(path)
    f, o = T.lint_text(L0)
    print(name, 'lint fails', f)
    for sc in ('orman', 'kiyi'):
        L = T.with_scene(L0, sc)
        res = T.run_all(L)
        nf = sum(1 for c in res.values() if not T.case_ok(c))
        kinds = T.failure_kinds(res)
        print(name, sc, 'vakalar', len(res), 'geçmeyen', nf, 'T6 5dk üretim köşesi boş pay %.1f' % T.slack5(res, T.PRODUCTION), list(kinds.items())[:4])
