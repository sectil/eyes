import sys; sys.path.insert(0,'.')
from v3plan import *
L = T.with_scene(T.load(Y+'/pilot/ders2.lesson.json'), 'orman')
for v in ('model','nes','hak','hoc'):
    use(v)
    for tgt in (300, 900, 1200):
        p = T.plan(L, tgt, 5.6, 'hi')
        fails, d, runs = T.check_plan(L, p)
        sp = p['speech']
        print(v, tgt, p['status'], 'f=%.3f'%p['f'], 'konuşma %.1f'%sp, 'slack_min %.1f'%(p['T']-sp-p['gaps']['min']), 'fails', fails[:5], 'sel', p['sel'])
use('model')
