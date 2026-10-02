import sys; sys.path.insert(0,'.')
from v3plan import *
path = sys.argv[1]; v = sys.argv[2]; tgt = int(sys.argv[3])
L = T.with_scene(T.load(path), 'orman')
use(v)
p = T.plan(L, tgt, 5.6, 'hi')
mi = measured_ids(v, p)
for e, m in zip(p['events'], mi):
    c = e['clip']
    print('%6.1f %-5s %-16s %-9s sh=%-1s m=%-1s syl=%3d sp=%5.1f gap=%5.1f [%g/%g/%g] %s' % (e['start'], e['block'], c['id'], c['tier'][:8], 'Y' if c.get('shortForm') else '', 'Y' if m else '', sum(s['syl'] for s in e['subs']), e['speech'], e['gap'], e['gd']['min'], e['gd']['pref'], e['gd']['max'], c['text'][:90]))
print('speech', round(p['speech'],1), 'gaps', {k: round(x,1) for k,x in p['gaps'].items()}, 'slack_min', round(p['T']-p['speech']-p['gaps']['min'],1), 'f', p['f'], 'lead', p.get('lead'))
f,d,r = T.check_plan(L,p); print('fails', f); print('dens', {k:(round(x,2) if isinstance(x,float) else x) for k,x in d.items()})
