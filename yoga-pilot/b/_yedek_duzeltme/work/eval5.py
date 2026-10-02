import sys, json; sys.path.insert(0,'.')
import v3plan as V
from v3plan import T
import build_lesson as B
def run(vs, label, voices=('hoc',), show=False):
    L = T.with_scene(B.build(vs), "orman")
    for v in voices:
        for cons in (True, False):
            V.MODE['conservative'] = cons
            V.use(v)
            p = T.plan(L, 300, 5.6, 'hi')
            f, d, r = T.check_plan(L, p)
            sl = 300 - p['speech'] - p['gaps']['min']
            print('%-28s %s %-5s slack %.1f konuşma %.1f f=%.2f dens %.1f/%.2f fails %s' % (label, v, 'kons' if cons else 'birim', sl, p['speech'], p['f'], d['syll'], d['frac'], f[:3]))
    V.MODE['conservative'] = True; V.use('model')
    return L
if __name__ == '__main__':
    run({}, 'yalnız n1/n2', voices=('hoc','nes','hak'))
