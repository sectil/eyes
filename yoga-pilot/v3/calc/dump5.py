import json, sys
sys.path.insert(0, '.')
import timing as T
L = T.load('ders2.lesson.json')
Ls = T.with_scene(L, 'orman')
meas = json.load(open('measured_durs.json'))
p = T.plan(Ls, 300, 5.6, 'hi')
tot_syl = 0
for e in p['events']:
    c = e['clip']
    m = meas['nes'].get(c['id']); h = meas['hak'].get(c['id'])
    syl = sum(s['syl'] for s in e['subs'])
    tot_syl += syl
    print('%-6s %-18s %-9s short=%-5s syl=%3d model=%.1f nes=%s hak=%s gap=%.1f [%s]  %s' % (
        e['block'], c['id'], c['tier'], bool(c.get('shortForm')), syl, e['speech'],
        ('%.1f' % sum(m)) if m and not c.get('shortForm') else '-', ('%.1f' % sum(h)) if h and not c.get('shortForm') else '-',
        e['gap'], '/'.join('%g' % e['gd'][k] for k in ('min', 'pref', 'max')), c['text'][:110]))
print('total syl', tot_syl)
