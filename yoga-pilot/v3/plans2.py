import sys, json
sys.path.insert(0, '/home/user/eyes/yoga-pilot/pilot')
import timing as tm
L = tm.with_scene(tm.load(), 'orman')
U = json.load(open('/home/user/eyes/yoga-pilot/render/units.json'))['units']
for T in (180, 240, 300):
    try:
        p = tm.plan(L, T, 5.6, 'hi')
        print(T, p['status'], p['mode'], round(p['f'],3), 'events', len(p['events']), 'speech', round(p['speech'],1), 'sel', p['sel'], 'notes', p['notes'], 'total', round(p['total'],1))
        errs = tm.check_plan(L, p)
        print('  check_plan:', (len(errs) if hasattr(errs,'__len__') else errs), str(errs)[:600])
    except Exception as e:
        print(T, 'HATA', type(e).__name__, e)
p = tm.plan(L, 300, 5.6, 'hi')
for ev in p['events']:
    c = ev['clip']
    if c.get('short'):
        print(c['id'], '| short:', c['short'].get('text'), '| belowSec', c['short'].get('belowSec'))
